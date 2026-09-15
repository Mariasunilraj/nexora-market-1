import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabase = (supabaseUrl && supabaseServiceKey)
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

export async function processLimitOrders(currentPrices: Record<string, number>) {
  if (!supabase) {
    return { processed: 0, message: 'Supabase service role not configured, running in mock mode' };
  }

  try {
    const { data: pendingOrders, error } = await supabase
      .from('orders')
      .select('*')
      .eq('status', 'Pending');

    if (error || !pendingOrders) return { processed: 0, error: error?.message };

    let executedCount = 0;

    for (const order of pendingOrders) {
      const currentPrice = currentPrices[order.symbol.toUpperCase()];
      if (!currentPrice) continue;

      let shouldExecute = false;

      // Buy Limit executes when market price is at or below limit price
      if (order.action === 'Buy' && currentPrice <= order.price) {
        shouldExecute = true;
      }
      // Sell Limit executes when market price is at or above limit price
      else if (order.action === 'Sell' && currentPrice >= order.price) {
        shouldExecute = true;
      }

      if (shouldExecute) {
        await supabase
          .from('orders')
          .update({
            status: 'Filled',
            execution_price: currentPrice,
            executed_at: new Date().toISOString(),
          })
          .eq('id', order.id);

        executedCount++;
      }
    }

    return { processed: executedCount, pendingCount: pendingOrders.length };
  } catch (err: any) {
    console.error('Error processing limit orders:', err.message);
    return { processed: 0, error: err.message };
  }
}
