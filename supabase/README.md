# Documentación de Arquitectura: Base de Datos Multi-Tenant

Esta carpeta contiene las migraciones SQL que definen el núcleo de la aplicación SaaS. Dado que en este entorno de desarrollo `docker` no está activo y no se puede inicializar un proyecto Supabase local (mediante `npx supabase start`), deberás ejecutar estas migraciones **directamente en el SQL Editor de tu proyecto en Supabase**.

## 1. Estructura de Migraciones

- `00001_initial_schema.sql`: Contiene todo el DDL de tablas (Data Definition Language), creación de triggers para el `updated_at`, índices de rendimiento y las políticas iniciales de Seguridad a Nivel de Filas (RLS).
- `00002_storage_setup.sql`: Crea el bucket para alojar imágenes y define sus políticas RLS basadas en rutas (Paths).

### Orden de Ejecución
Ejecuta el contenido de `00001_initial_schema.sql` primero y luego el contenido de `00002_storage_setup.sql`.

## 2. Estructura Multi-Tenant y Relaciones

El sistema se diseñó bajo un esquema **Row-Based Multi-Tenancy**. Todas las tiendas comparten las mismas tablas, pero están aisladas por la columna `tenant_id`.

**Relaciones Críticas (Foreign Keys Compuestas):**
Para evitar el mayor riesgo en sistemas multi-tenant (ej. vincular un producto de la "Tienda A" a una categoría de la "Tienda B"), se forzó una Foreign Key Compuesta:
```sql
UNIQUE(id, tenant_id) -- En Categories
FOREIGN KEY (category_id, tenant_id) REFERENCES categories(id, tenant_id) -- En Products
```
Esto garantiza a nivel de motor de base de datos que la inconsistencia cruzada entre clientes sea imposible.

## 3. Seguridad a Nivel de Filas (RLS) y Roles

El control de acceso basado en roles (RBAC) está en la tabla `profiles`, la cual funciona como un puente entre `auth.users` (Supabase Auth) y los `tenants`.

*   **Helper RLS (`auth_user_has_role_in_tenant`)**: Es una función de Postgres (con `SECURITY DEFINER`) utilizada para evaluar dinámicamente si el usuario autenticado (`auth.uid()`) posee un registro en `profiles` con un `tenant_id` específico y un `role` adecuado (`admin`, `editor`, `viewer`).
*   **Lectura Pública**: Tablas como `products` y `categories` permiten `SELECT` a visitantes anónimos solo si la entidad está activa (`status = 'published'` o `is_active = true`).
*   **Escritura (Admin)**: Toda operación de `INSERT, UPDATE, DELETE` requiere forzosamente poseer el rol `admin` o `editor` dentro del tenant.

## 4. Supabase Storage

Se definió un bucket público llamado `catalogs`.
*   **Estructura de Carpetas Forzada**: `[tenant_id]/products/[product_id]/[nombre_archivo.webp]`
*   **Seguridad**: Las políticas de Storage extraen dinámicamente el `tenant_id` dividiendo la ruta (path) del objeto: `CAST((string_to_array(name, '/'))[1] AS UUID)`. Luego la evalúan usando el helper `auth_user_has_role_in_tenant`. Esto permite que un cliente únicamente pueda subir imágenes a sus propias carpetas, aunque compartan un solo bucket físico.
