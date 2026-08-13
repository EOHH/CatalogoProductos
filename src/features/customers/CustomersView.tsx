import { useQuery } from '@tanstack/react-query'
import { Search, Crown, ArrowUpRight } from 'lucide-react'
import { useTenant } from '@/features/core/TenantProvider'
import { crmService } from '../dashboard/services/crm.service'

export function CustomersView() {
  const { tenant } = useTenant()

  const { data: customers = [], isLoading } = useQuery({
    queryKey: ['crm-customers', tenant?.id],
    queryFn: () => crmService.getCustomers(tenant!.id),
    enabled: !!tenant?.id
  })

  // Determine VIP based on top 20% spending or arbitrary threshold
  const isVip = (spent: number) => spent > 500

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-700 font-sans">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
            Directorio de Clientes
          </h1>
          <p className="text-[15px] text-zinc-500 mt-1">
            Gestiona la relación con tus clientes y descubre a tus compradores VIP
          </p>
        </div>
      </div>

      <div className="bg-white rounded-[1.5rem] border border-zinc-200 shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-zinc-200 flex justify-between items-center bg-zinc-50/50">
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input 
              type="text" 
              placeholder="Buscar cliente..." 
              className="w-full pl-9 pr-4 py-2 bg-white border border-zinc-200 rounded-lg text-sm focus:outline-none focus:border-zinc-400 transition-colors"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-zinc-600 bg-zinc-100 px-3 py-1 rounded-full">
              {customers.length} Clientes Totales
            </span>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50 border-b border-zinc-200">
                <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Cliente</th>
                <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Contacto</th>
                <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Total Gastado</th>
                <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Pedidos</th>
                <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-zinc-500">
                    Cargando clientes...
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-zinc-500">
                    Aún no hay clientes registrados. Crea un pedido manual para agregar uno.
                  </td>
                </tr>
              ) : (
                customers.map(customer => (
                  <tr key={customer.id} className="hover:bg-zinc-50/80 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-zinc-900 text-white flex items-center justify-center font-bold text-sm">
                          {customer.first_name[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-zinc-900 flex items-center gap-2">
                            {customer.first_name} {customer.last_name}
                            {isVip(Number(customer.total_spent)) && (
                              <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                                <Crown className="w-3 h-3" /> VIP
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-zinc-500 mt-0.5">ID: {customer.id.slice(0,8)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm text-zinc-900">{customer.phone || 'No registrado'}</p>
                      <p className="text-xs text-zinc-500">{customer.email || 'Sin email'}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-bold text-zinc-900">
                        S/ {Number(customer.total_spent).toFixed(2)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-zinc-100 text-sm font-semibold text-zinc-700 group-hover:bg-zinc-200 transition-colors">
                        {customer.orders_count}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button className="text-zinc-400 hover:text-zinc-900 transition-colors p-2 rounded-lg hover:bg-zinc-100">
                        <ArrowUpRight className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
