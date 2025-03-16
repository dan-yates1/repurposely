# Repurposely - AI Content Repurposing Platform

Repurposely is an AI-powered platform that helps you transform long-form content (blogs, articles, videos, podcasts) into various shorter formats optimized for different platforms (Twitter threads, LinkedIn posts, email newsletters, etc.).

## Features

- **User Authentication**: Secure login/signup with email or Google OAuth via Supabase
- **Content Input**: Paste text directly or provide YouTube URLs
- **AI Processing**: Transform content using Claude 3 Haiku
- **Content Quality Analysis**: Get AI-powered feedback on readability, engagement, and SEO
- **Multiple Output Formats**: Generate content for Twitter, LinkedIn, Facebook, Instagram, and more
- **Customizable Tone**: Adjust the tone to match your brand voice (professional, casual, humorous, etc.)
- **Content History**: Save and revisit your previously generated content
- **Export Options**: Copy to clipboard or download as text files
- **Token System**: Flexible usage-based pricing with monthly token allocations

## Token System

Repurposely uses a token-based system to manage usage across different subscription tiers:

### Subscription Tiers
- **FREE**: 50 tokens/month
- **PRO**: 500 tokens/month
- **ENTERPRISE**: 2000 tokens/month

### Token Costs
- **TEXT_REPURPOSE**: 1 token
- **IMAGE_GENERATION**: 5 tokens
- **VIDEO_PROCESSING**: 10 tokens
- **ADVANCED_FORMATTING**: 2 tokens
- **CONTENT_ANALYSIS**: 2 tokens

The token system automatically resets monthly and provides detailed usage analytics in the dashboard.

## Tech Stack

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL)
- **AI Model**: Claude 3 Haiku by Anthropic
- **Payment Processing**: Stripe
- **Deployment**: Vercel (recommended)

## Getting Started

### Prerequisites

- Node.js 18.17.0 or later
- Supabase account
- Anthropic API key
- Stripe account (for payment processing)

### Setup

1. Clone the repository:

```bash
git clone https://github.com/yourusername/repurposely.git
cd repurposely
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

Create a `.env.local` file in the root directory with the following variables:

```
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# AI Service
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key_here
STRIPE_SECRET_KEY=your_stripe_secret_key_here
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret_here

# Application Configuration
NEXT_PUBLIC_SITE_URL=your_production_url_or_localhost
```

4. Set up Supabase:

- Create a new Supabase project
- Enable email and Google authentication
- Run the database schema setup (see below)

### Database Schema

Execute the following SQL commands in your Supabase SQL editor:

```sql
-- Content history table
create table content_history (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  original_content text not null,
  repurposed_content text not null,
  output_format text not null,
  tone text not null,
  created_at timestamp with time zone default now() not null
);

-- User subscriptions table
create table user_subscriptions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  subscription_tier text not null default 'FREE',
  stripe_customer_id text,
  stripe_subscription_id text,
  is_active boolean default true,
  subscription_start_date timestamp with time zone,
  subscription_end_date timestamp with time zone,
  current_period_end timestamp with time zone,
  cancel_at_period_end boolean default false,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

-- Token usage table
create table token_usage (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  tokens_used integer default 0,
  tokens_remaining integer default 50,
  reset_date timestamp with time zone,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

-- Token transactions table
create table token_transactions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  amount integer not null,
  operation_type text not null,
  operation_details jsonb,
  content_id uuid,
  created_at timestamp with time zone default now() not null
);

-- Set up RLS (Row Level Security)
alter table content_history enable row level security;
alter table user_subscriptions enable row level security;
alter table token_usage enable row level security;
alter table token_transactions enable row level security;

-- Create policies
create policy "Users can only view their own content"
  on content_history for select
  using (auth.uid() = user_id);

create policy "Users can only insert their own content"
  on content_history for insert
  with check (auth.uid() = user_id);

create policy "Users can only view their own subscription"
  on user_subscriptions for select
  using (auth.uid() = user_id);

create policy "Users can only view their own token usage"
  on token_usage for select
  using (auth.uid() = user_id);

create policy "Users can only view their own token transactions"
  on token_transactions for select
  using (auth.uid() = user_id);
```

5. Set up Stripe:

- Create a Stripe account
- Set up products and prices for your subscription tiers:
  - FREE: $0/month (50 tokens)
  - PRO: $9.99/month (500 tokens)
  - ENTERPRISE: $29.99/month (2000 tokens)
- Configure the webhook endpoint: `https://your-domain.com/api/stripe/webhook`
- Add the webhook secret to your environment variables

6. Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Deployment

The easiest way to deploy your Repurposely app is to use [Vercel](https://vercel.com):

1. Push your code to a GitHub repository
2. Import the project into Vercel
3. Add all your environment variables in the Vercel dashboard
4. Set up your custom domain if needed
5. Configure the Stripe webhook to point to your production domain
6. Deploy!

## Production Checklist

Before going to production, ensure you have:

- [ ] Set up proper environment variables for production
- [ ] Configured Stripe webhooks for your production domain
- [ ] Set up proper error logging
- [ ] Tested all payment flows with Stripe test mode
- [ ] Ensured all branding uses "Repurposely" consistently
- [ ] Tested token consumption and replenishment
- [ ] Verified subscription tier upgrades and downgrades work correctly
- [ ] Set up analytics to track user behavior

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Next.js](https://nextjs.org)
- [Supabase](https://supabase.com)
- [Anthropic](https://anthropic.com)
- [Stripe](https://stripe.com)
- [Tailwind CSS](https://tailwindcss.com)
