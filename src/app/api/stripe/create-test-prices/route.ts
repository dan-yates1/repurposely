import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe-server";

export async function GET() {
  try {
    // Create Pro product
    const proProduct = await stripe.products.create({
      name: "Pro Plan",
      description: "500 tokens per month",
      metadata: {
        tier: "PRO"
      }
    });
    
    // Create Pro price (9.99 USD per month)
    const proPrice = await stripe.prices.create({
      product: proProduct.id,
      unit_amount: 999, // $9.99
      currency: "usd",
      recurring: {
        interval: "month"
      },
      metadata: {
        tier: "PRO"
      }
    });
    
    // Create Enterprise product
    const enterpriseProduct = await stripe.products.create({
      name: "Enterprise Plan",
      description: "2000 tokens per month",
      metadata: {
        tier: "ENTERPRISE"
      }
    });
    
    // Create Enterprise price (29.99 USD per month)
    const enterprisePrice = await stripe.prices.create({
      product: enterpriseProduct.id,
      unit_amount: 2999, // $29.99
      currency: "usd",
      recurring: {
        interval: "month"
      },
      metadata: {
        tier: "ENTERPRISE"
      }
    });
    
    return NextResponse.json({
      success: true,
      proPrice: proPrice.id,
      enterprisePrice: enterprisePrice.id,
      message: "Test prices created successfully"
    });
  } catch (error) {
    console.error("Error creating test prices:", error);
    return NextResponse.json(
      { error: "Failed to create test prices", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
