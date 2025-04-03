import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { stripe } from '@/lib/stripe-server';
import Stripe from 'stripe';
import type { NextRequest } from 'next/server'; 

export async function GET(request: NextRequest) { 
  // Pass cookies() directly
  const supabase = createRouteHandlerClient({ cookies: cookies }); 
  let userId: string | null = null;
  let stripeCustomerId: string | null | undefined = null;

  try {
    // 1. Prioritize Authorization header
    const authHeader = request.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const { data: { user }, error: userError } = await supabase.auth.getUser(token);
      if (userError) {
         console.error("Payment History: Error validating token:", userError.message);
      } else if (user) {
         userId = user.id;
         stripeCustomerId = user.user_metadata?.stripe_customer_id;
         console.log("Payment History: Authenticated via Authorization header.");
      }
    }

    // 2. If no user ID from header, try cookie session
    if (!userId) {
       console.log("Payment History: No valid token in header, trying cookie session...");
       const { data: { session } } = await supabase.auth.getSession();
       if (session?.user) {
          userId = session.user.id;
          stripeCustomerId = session.user.user_metadata?.stripe_customer_id;
          console.log("Payment History: Authenticated via cookie session.");
       }
    }
    
    // 3. Final check if user ID was obtained
    if (!userId) {
      console.log("Payment History: No valid session or token found.");
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 4. Check if user has a Stripe Customer ID
    if (!stripeCustomerId) {
      console.log(`User ${userId} has no Stripe customer ID. No payment history to fetch.`);
      return NextResponse.json([]); // Return empty array if no customer ID
    }

    console.log(`Fetching payment history for Stripe customer: ${stripeCustomerId}`);

    // 5. Fetch invoices from Stripe
    const invoices = await stripe.invoices.list({
      customer: stripeCustomerId,
      limit: 20, // Limit the number of invoices fetched
      status: 'paid', // Only fetch paid invoices for history
    });

    // 6. Format the invoice data
    const formattedInvoices = invoices.data.map((invoice: Stripe.Invoice) => ({
      id: invoice.id,
      date: invoice.created * 1000, // Convert to milliseconds
      amount: invoice.amount_paid / 100, // Convert cents to dollars/euros etc.
      currency: invoice.currency.toUpperCase(),
      status: invoice.status,
      pdfUrl: invoice.invoice_pdf,
      hostedInvoiceUrl: invoice.hosted_invoice_url,
    }));

    console.log(`Found ${formattedInvoices.length} invoices for customer ${stripeCustomerId}`);

    // 7. Return the formatted data
    return NextResponse.json(formattedInvoices);

  } catch (error) {
    console.error('Error fetching payment history:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: `Failed to fetch payment history: ${errorMessage}` }, { status: 500 });
  }
}
