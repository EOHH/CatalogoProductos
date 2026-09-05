import { useParams, Link } from 'react-router-dom'
import { useStore } from '../providers/StoreProvider'
import { useStoreRoute } from '../hooks/useStoreRoute'
import { ChevronRight, Home, HelpCircle, Package, CreditCard, ShieldCheck, FileText } from 'lucide-react'

const infoContent: Record<string, { title: string, icon: any, content: React.ReactNode }> = {
  'faq': {
    title: 'Preguntas Frecuentes',
    icon: HelpCircle,
    content: (
      <div className="space-y-6">
        <div>
          <h3 className="font-bold text-foreground mb-2">¿Cómo puedo realizar un pedido?</h3>
          <p className="text-muted-foreground">Puedes explorar nuestro catálogo, agregar los productos que te gusten a tu carrito y al finalizar la compra serás redirigido a WhatsApp para confirmar los detalles del envío y el pago directamente con nuestro equipo.</p>
        </div>
        <div>
          <h3 className="font-bold text-foreground mb-2">¿Venden al por mayor?</h3>
          <p className="text-muted-foreground">Sí, ofrecemos precios especiales para compras mayoristas. Por favor, contáctanos a través de WhatsApp para brindarte nuestro catálogo con precios al por mayor y condiciones.</p>
        </div>
        <div>
          <h3 className="font-bold text-foreground mb-2">¿Tienen tienda física?</h3>
          <p className="text-muted-foreground">Por el momento operamos como una tienda 100% online, lo que nos permite ofrecerte precios muy competitivos y envíos a todo el país.</p>
        </div>
      </div>
    )
  },
  'shipping': {
    title: 'Envíos y Devoluciones',
    icon: Package,
    content: (
      <div className="space-y-6">
        <div>
          <h3 className="font-bold text-foreground mb-2">Políticas de Envío</h3>
          <p className="text-muted-foreground mb-2">Realizamos envíos a todo el país a través de agencias seguras y courier privado. Los tiempos estimados son:</p>
          <ul className="list-disc pl-5 text-muted-foreground space-y-1">
            <li>Lima Metropolitana: 1 a 2 días hábiles.</li>
            <li>Provincias (Nivel Nacional): 2 a 5 días hábiles dependiendo del destino.</li>
          </ul>
        </div>
        <div>
          <h3 className="font-bold text-foreground mb-2">Cambios y Devoluciones</h3>
          <p className="text-muted-foreground">Aceptamos cambios dentro de los primeros 7 días de recibido el producto, siempre y cuando este se encuentre en perfectas condiciones, con sus etiquetas originales y sin signos de uso. Los costos de envío por cambios de talla son asumidos por el cliente.</p>
        </div>
      </div>
    )
  },
  'payment': {
    title: 'Métodos de Pago',
    icon: CreditCard,
    content: (
      <div className="space-y-4">
        <p className="text-muted-foreground">Para tu comodidad y seguridad, aceptamos los siguientes métodos de pago:</p>
        <ul className="list-disc pl-5 text-muted-foreground space-y-2">
          <li><strong>Transferencias Bancarias:</strong> BCP, Interbank, BBVA y Scotiabank.</li>
          <li><strong>Billeteras Digitales:</strong> Yape y Plin (al número de contacto de la tienda).</li>
          <li><strong>Tarjetas de Crédito/Débito:</strong> A través de links de pago seguros (Niubiz/Izipay) que te enviaremos por WhatsApp.</li>
        </ul>
        <p className="text-muted-foreground mt-4 text-sm bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-lg">
          Nota: Todos los pedidos se procesan una vez confirmado el pago. Te solicitaremos el voucher o captura de pantalla al momento de cerrar la compra por WhatsApp.
        </p>
      </div>
    )
  },
  'privacy': {
    title: 'Política de Privacidad',
    icon: ShieldCheck,
    content: (
      <div className="space-y-4">
        <p className="text-muted-foreground">Tu privacidad es muy importante para nosotros. En esta tienda respetamos la confidencialidad de tus datos.</p>
        <h3 className="font-bold text-foreground mt-4 mb-2">Uso de la Información</h3>
        <p className="text-muted-foreground">La información personal que nos proporciones (nombre, teléfono, correo, dirección) será utilizada exclusivamente para procesar tus pedidos, coordinar entregas y, si lo autorizas, enviarte promociones exclusivas.</p>
        <h3 className="font-bold text-foreground mt-4 mb-2">Seguridad</h3>
        <p className="text-muted-foreground">No compartimos, vendemos ni alquilamos tu información personal a terceros bajo ninguna circunstancia. Toda conversación de compra realizada por WhatsApp se maneja con total discreción.</p>
      </div>
    )
  },
  'terms': {
    title: 'Términos y Condiciones',
    icon: FileText,
    content: (
      <div className="space-y-4 text-muted-foreground">
        <p>Al acceder y utilizar nuestra tienda online, aceptas los siguientes términos y condiciones:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li><strong>Disponibilidad:</strong> Todos los productos están sujetos a disponibilidad de stock. En caso de no contar con un producto después de tu solicitud, te lo notificaremos inmediatamente.</li>
          <li><strong>Precios:</strong> Los precios publicados pueden variar sin previo aviso. Sin embargo, respetaremos el precio del momento en que iniciaste la coordinación de tu compra.</li>
          <li><strong>Garantía:</strong> Ofrecemos garantía por defectos de fábrica dentro de los primeros 15 días tras la compra. La garantía no cubre daños por mal uso, lavado incorrecto o desgaste natural.</li>
          <li><strong>Propiedad Intelectual:</strong> Todas las imágenes y logotipos mostrados en el catálogo son propiedad de la tienda o sus proveedores y está prohibida su reproducción sin autorización.</li>
        </ul>
      </div>
    )
  }
}

export function StoreInfoView() {
  const { topic } = useParams<{ topic: string }>()
  const { tenant } = useStore()
  const { buildUrl } = useStoreRoute()

  const currentTopic = topic && infoContent[topic] ? infoContent[topic] : infoContent['faq']
  const Icon = currentTopic.icon

  return (
    <div className="w-full bg-background min-h-screen py-10 fade-in">
      <div className="max-w-[800px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-muted-foreground mb-8 font-medium">
          <Link to={buildUrl("/")} className="hover:text-store-primary transition-colors flex items-center gap-1">
            <Home className="w-3 h-3" /> Inicio
          </Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-foreground">{currentTopic.title}</span>
        </nav>

        {/* Content Box */}
        <div className="bg-card rounded-3xl p-8 md:p-12 shadow-sm border border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-4 mb-8 border-b border-zinc-100 dark:border-zinc-800 pb-6">
            <div className="w-12 h-12 rounded-full bg-store-primary/10 flex items-center justify-center text-store-primary">
              <Icon className="w-6 h-6" strokeWidth={1.5} />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-serif text-foreground tracking-tight">
                {currentTopic.title}
              </h1>
              <p className="text-sm text-muted-foreground mt-1">{tenant?.name}</p>
            </div>
          </div>

          <div className="prose prose-zinc max-w-none text-sm md:text-base leading-relaxed">
            {currentTopic.content}
          </div>
        </div>

        {/* Back Button */}
        <div className="mt-8 text-center">
          <Link to={buildUrl("/")} className="inline-block text-sm font-bold text-store-primary underline hover:opacity-80 transition-opacity">
            Volver a la tienda
          </Link>
        </div>

      </div>
    </div>
  )
}
