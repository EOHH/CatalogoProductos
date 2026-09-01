import { supabase } from '@/lib/supabase/client'

export interface CheckoutCustomerData {
  first_name: string
  last_name?: string
  phone: string
}

export interface CheckoutItemData {
  product_id: string
  quantity: number
  unit_price: number
}

export const checkoutService = {
  /**
   * Processes a complete checkout: 
   * 1. Finds or creates a customer by phone
   * 2. Creates the order
   * 3. Creates the order items
   */
  async processCheckout(
    tenantId: string, 
    customerData: CheckoutCustomerData, 
    items: CheckoutItemData[],
    totalAmount: number,
    notes?: string
  ): Promise<string> {
    try {
      // Usamos una función RPC (Remote Procedure Call) en Supabase 
      // para saltarnos las restricciones de seguridad (RLS) y registrar todo en una sola transacción segura.
      const { data: orderId, error } = await (supabase.rpc as any)('process_storefront_checkout', {
        p_tenant_id: tenantId,
        p_first_name: customerData.first_name,
        p_last_name: customerData.last_name || null,
        p_phone: customerData.phone,
        p_total_amount: totalAmount,
        p_notes: notes || null,
        p_items: items
      })

      if (error) {
        console.error('Error in checkout RPC:', error)
        throw new Error('Error de base de datos: ' + (error.message || error.details || JSON.stringify(error)))
      }

      if (!orderId) {
        throw new Error('El servidor no devolvió el ID del pedido.')
      }

      return orderId

    } catch (error) {
      console.error('Checkout process failed:', error)
      throw error
    }
  }
}
