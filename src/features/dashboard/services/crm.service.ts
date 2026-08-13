import { supabase } from '@/lib/supabase/client'
import type { Database } from '@/types/database.types'

export type Customer = Database['public']['Tables']['customers']['Row']
export type Order = Database['public']['Tables']['orders']['Row']
export type OrderItem = Database['public']['Tables']['order_items']['Row']

export const crmService = {
  // --- CUSTOMERS ---
  async getCustomers(tenantId: string): Promise<Customer[]> {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('total_spent', { ascending: false })

    if (error) throw error
    return data as Customer[]
  },

  async createCustomer(customer: Database['public']['Tables']['customers']['Insert']): Promise<Customer> {
    const { data: newCustomer, error } = await (supabase.from('customers') as any)
      .insert(customer)
      .select()
      .single()

    if (error) throw error
    return newCustomer as Customer
  },

  // --- ORDERS ---
  async getOrders(tenantId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('orders')
      .select('*, customers(*)')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  },

  async getOrderDetails(orderId: string): Promise<any> {
    const { data, error } = await supabase
      .from('orders')
      .select('*, customers(*), order_items(*, products(*))')
      .eq('id', orderId)
      .single()

    if (error) throw error
    return data
  },

  async updateOrderStatus(orderId: string, status: Order['status']): Promise<Order> {
    const { data, error } = await (supabase.from('orders') as any)
      .update({ status })
      .eq('id', orderId)
      .select()
      .single()

    if (error) throw error
    return data as Order
  },

  async createOrder(
    order: Database['public']['Tables']['orders']['Insert'], 
    items: Database['public']['Tables']['order_items']['Insert'][]
  ): Promise<Order> {
    // 1. Create the order
    const { data: newOrder, error: orderError } = await (supabase.from('orders') as any)
      .insert(order)
      .select()
      .single()

    if (orderError) throw orderError
    if (!newOrder) throw new Error("Failed to create order")

    // 2. Insert items
    const itemsWithOrderId = items.map(item => ({
      ...item,
      order_id: newOrder.id
    }))

    const { error: itemsError } = await (supabase.from('order_items') as any)
      .insert(itemsWithOrderId)

    if (itemsError) {
      // Rollback manually if needed, but for MVP just throw
      throw itemsError
    }

    // 3. Update customer stats (total_spent, orders_count)
    const { data: customer } = await (supabase.from('customers') as any)
      .select('total_spent, orders_count')
      .eq('id', order.customer_id)
      .single()

    if (!customer) throw new Error("Customer not found")

    await (supabase.from('customers') as any)
        .update({
          total_spent: (customer as Customer).total_spent + Number(order.total_amount),
          orders_count: (customer as Customer).orders_count + 1
        })
        .eq('id', order.customer_id)

    return newOrder as Order
  }
}
