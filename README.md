# ContentRemix - AI Content Repurposing Platform

ContentRemix is an AI-powered platform that helps you transform long-form content (blogs, articles, videos, podcasts) into various shorter formats optimized for different platforms (Twitter threads, LinkedIn posts, email newsletters, etc.).

## Features

- **User Authentication**: Secure login/signup with email or Google OAuth via Supabase
- **Content Input**: Paste text directly or provide YouTube URLs (future feature)
- **AI Processing**: Transform content using Claude 3 Haiku
- **Multiple Output Formats**: Generate content for Twitter, LinkedIn, Facebook, Instagram, and more
- **Customizable Tone**: Adjust the tone to match your brand voice (professional, casual, humorous, etc.)
- **Content History**: Save and revisit your previously generated content
- **Export Options**: Copy to clipboard or download as text files

## Tech Stack

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL)
- **AI Model**: Claude 3 Haiku by Anthropic
- **Deployment**: Vercel (recommended)

## Getting Started

### Prerequisites

- Node.js 18.17.0 or later
- Supabase account
- Anthropic API key

### Setup

1. Clone the repository:

```bash
git clone https://github.com/yourusername/contentremix.git
cd contentremix
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

Create a `.env.local` file in the root directory with the following variables:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

4. Set up Supabase:

- Create a new Supabase project
- Enable email and Google authentication
- Create a new table called `content_history` with the following schema:

```sql
create table content_history (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  original_content text not null,
  repurposed_content text not null,
  output_format text not null,
  tone text not null,
  created_at timestamp with time zone default now() not null
);

-- Set up RLS (Row Level Security)
alter table content_history enable row level security;

-- Create policy to allow users to only see their own content
create policy "Users can only view their own content"
  on content_history for select
  using (auth.uid() = user_id);

-- Create policy to allow users to only insert their own content
create policy "Users can only insert their own content"
  on content_history for insert
  with check (auth.uid() = user_id);
```

5. Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Usage

1. Sign up or log in to your account
2. Navigate to the dashboard
3. Paste your long-form content in the input field
4. Select your desired output format and tone
5. Click "Repurpose" to generate new content
6. Copy or download the repurposed content
7. View your history to access previously generated content

## Deployment

The easiest way to deploy your ContentRemix app is to use [Vercel](https://vercel.com):

1. Push your code to a GitHub repository
2. Import the project into Vercel
3. Add your environment variables in the Vercel dashboard
4. Deploy!

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Next.js](https://nextjs.org)
- [Supabase](https://supabase.com)
- [Anthropic](https://anthropic.com)
- [Tailwind CSS](https://tailwindcss.com)
