// src/app/sitemap.ts
import { MetadataRoute } from 'next'

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export default function sitemap(): MetadataRoute.Sitemap {
  // Define static routes
  const staticRoutes = [
    '/',
    '/pricing',
    '/contact',
    '/terms',
    '/privacy',
    '/refund-policy',
    // Add other static public-facing pages here
  ];

  const staticUrls = staticRoutes.map((route): MetadataRoute.Sitemap[number] => ({ // Explicitly type the return object
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString(), // Use current date, or fetch specific dates if available
    changeFrequency: 'monthly', // Adjust frequency based on how often content changes
    priority: route === '/' ? 1.0 : 0.8, // Homepage higher priority
  }));

  // --- Placeholder for Dynamic Routes ---
  // Example: Fetch blog posts or public content pages
  // const dynamicPosts = await fetchPostsFromCMS(); // Replace with your data fetching logic
  // const dynamicUrls = dynamicPosts.map(post => ({
  //   url: `${baseUrl}/blog/${post.slug}`,
  //   lastModified: post.updatedAt,
  //   changeFrequency: 'weekly',
  //   priority: 0.7,
  // }));
  // --- End Placeholder ---

  return [
    ...staticUrls,
    // ...dynamicUrls, // Uncomment and implement when you have dynamic routes to include
  ];
}
