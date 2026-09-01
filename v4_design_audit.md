# AUDITORÍA DE DISEÑO DE LA MIGRACIÓN V4

He realizado un análisis técnico profundo de las operaciones SQL planeadas para asegurar que sean idempotentes, atómicas, y completamente seguras respecto al estado histórico.

## A. Problemas encontrados en V3 (Que se corregirán en V4)
1. **Idempotencia de `order_items.tenant_id`:** En V3, si la columna `tenant_id` ya existía y tenía datos parciales, el `UPDATE` sobrescribía sin validar. En V4, usaremos un bloque `DO $$` que:
   - Añada la columna si no existe.
   - Si ya existe, verifique si hay discrepancias (`order_items.tenant_id != orders.tenant_id`). Si las hay, aborte (`RAISE EXCEPTION`).
   - Solo actualice los registros donde `tenant_id IS NULL`.
2. **Conflicto en Resolución de Tenant (RPC):** `slug = p_slug OR custom_domain = p_slug LIMIT 1`. Si un usuario malintencionado registra un tenant con `slug = 'mi-competidor.com'`, podría colisionar con el `custom_domain` real de su competidor. V4 resolverá priorizando `custom_domain` explícitamente o lanzando error si hay ambigüedad. Además validará que `p_slug` no esté vacío ni nulo.
3. **Manejo de Constraints Existentes (Idempotencia):** Hacer `DROP CONSTRAINT IF EXISTS` asume que conocemos el nombre exacto de la constraint generada por el sistema. V4 debe estructurarse usando los nombres canónicos explícitos de PostgreSQL (ej. `orders_customer_id_fkey` confirmado en `00007`).

## B. Problemas que NO existen (Falsas Alarmas)
1. **Pérdida de datos en RLS:** Eliminar las políticas públicas ("Products viewable by everyone...") NO borra datos, simplemente deniega el acceso a la API REST (PostgREST) para el rol `anon`. Esto es exactamente lo que queremos, ya que todo el tráfico público pasará por el RPC `get_public_catalog` (que al ser `SECURITY DEFINER` sortea el RLS).
2. **Comportamiento `ON DELETE CASCADE`:** Comprobado históricamente, la migración `00007_crm_orders.sql` establece explícitamente `ON DELETE CASCADE`. Las nuevas llaves compuestas mantendrán este comportamiento, sin alterar la lógica de negocio.
3. **Integridad Transaccional:** El bloque `BEGIN; ... COMMIT;` en PostgreSQL maneja operaciones DDL. Si cualquier validación o restricción falla, *absolutamente toda la migración* hace rollback.

## C. Cambios Obligatorios para V4
1. **Pre-Flight Extendido:** 
   - Validar de antemano todas las llaves foráneas y registros cruzados.
2. **Creación Cautelosa de UNIQUE:** 
   - Verificar en `pg_class` y `pg_constraint` (dentro de un bloque `DO`) si la restricción UNIQUE ya existe, para no intentar recrearla o borrar a ciegas.
3. **RPC `get_public_catalog`:** 
   - Limitar estrictamente a las columnas comprobadas: `id, tenant_id, store_name, description, contact_email, phone, address, currency, locale, timezone, created_at, updated_at`.
   - Parametrizar la búsqueda para prevenir vulnerabilidades de colisión.
4. **RPC `auth_user_has_role_in_tenant`:** 
   - Inyectar explícitamente `SET search_path = ''`.

## D. Cambios Opcionales
1. **Ignorar `activity_log`:** Al no existir evidencia de esta tabla en `00001-00008`, intentar parchar su RLS o restricciones a ciegas podría destruir una tabla que no conocemos. La dejaremos intacta y sugeriremos su revisión manual.

## E. Orden Exacto Recomendado de Operaciones (V4)
1. `BEGIN;`
2. **Pre-flight Checks** (Abortar si hay huérfanos o cruce de tenants).
3. **Alter Table Seguros:** `ADD COLUMN IF NOT EXISTS tenant_id` en `order_items`.
4. **Validación e Idempotencia:** Validar discrepancias si la columna ya existía. Llenar los `NULL` desde `orders`. Establecer `NOT NULL`.
5. **Creación Condicional de UNIQUE:** Comprobar si existen las UNIQUE en customers, orders, etc., y si no, crearlas.
6. **Destrucción y Recreación de FKs:** Borrar las actuales (por nombre exacto o inspección), crear las compuestas.
7. **Limpieza de RLS Públicos.**
8. **Recreación de RLS CRM/Profiles** (Con `USING` + `WITH CHECK`).
9. **Definición de RPCs Seguros.**
10. `COMMIT;`

## F. Matriz Final de Constraints

| TABLA | PK | UNIQUE COMPUESTO | STATUS |
| :--- | :--- | :--- | :--- |
| `products` | `id` | `(id, tenant_id)` | Existente (00001) |
| `categories` | `id` | `(id, tenant_id)` | Existente (00001) |
| `collections` | `id` | `(id, tenant_id)` | Existente (00004) |
| `customers` | `id` | `(id, tenant_id)` | **Se creará en V4** |
| `orders` | `id` | `(id, tenant_id)` | **Se creará en V4** |
| `product_images` | `id` | `(id, tenant_id)` | **Se creará en V4** |
| `product_variants`| `id` | `(id, tenant_id)` | **Se creará en V4** |

## G. Matriz Final de FKs (Con comportamiento mantenido)

| TABLA ORIGEN | COLUMNAS (NUEVAS) | TABLA DESTINO | ON DELETE |
| :--- | :--- | :--- | :--- |
| `orders` | `(customer_id, tenant_id)` | `customers` | CASCADE |
| `order_items` | `(order_id, tenant_id)` | `orders` | CASCADE |
| `order_items` | `(product_id, tenant_id)` | `products` | CASCADE |

## H. Matriz Final de RLS

| TABLA | SELECT | INSERT | UPDATE | DELETE |
| :--- | :--- | :--- | :--- | :--- |
| **Catálogo Público** | BLOQUEADO (anon) | Admin | Admin (WITH CHECK) | Admin |
| **CRM (`orders`, etc)**| Auth + tenant | Auth + tenant (WITH CHECK) | Auth + tenant (WITH CHECK) | Auth + tenant |
| **`profiles`** | Auth (propios) o Admin | Admin (WITH CHECK) | Admin (WITH CHECK) | Admin |

## I. Riesgos Residuales
1. **Nombres de Constraints Manuales:** Si alguien alteró manualmente el nombre de una llave foránea (`order_items_product_id_fkey`) directamente en el dashboard remoto, la transacción intentará borrar la constraint por nombre y fallará, ejecutando el rollback seguro.

## J. Checklist final previo a generar V4
- [x] Validado el esquema de variables (sin columnas inventadas).
- [x] Validado el orden lógico de DDL (Preflight -> Columnas -> Unique -> FK).
- [x] RLS con `WITH CHECK` y `USING`.
- [x] RPC con `SECURITY DEFINER` y `search_path=''`.
- [x] Pre-flight cubre las 11 condiciones requeridas exhaustivamente.
- [x] Idempotencia en el rellenado de `order_items.tenant_id`.

---

V4 READY
