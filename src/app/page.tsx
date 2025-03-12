import { Button } from '@/components/ui/button';
import { Twitter, Linkedin, Facebook, Instagram, Mail, Youtube } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Hero Section */}
      <header className="relative overflow-hidden bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="text-center md:text-left md:max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900 dark:text-white mb-6">
              Transform Your Content with AI
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
              Repurpose your blogs, videos, and podcasts into engaging social media posts, 
              emails, and more with our AI-powered platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <a href="/auth">
                <Button variant="primary" size="lg">
                  Get Started
                </Button>
              </a>
              <a href="#features">
                <Button variant="secondary" size="lg">
                  Learn More
                </Button>
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section id="features" className="py-16 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">How It Works</h2>
            <p className="mt-4 text-xl text-gray-600 dark:text-gray-300">
              Three simple steps to repurpose your content
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-[var(--card-bg)] p-6 rounded-lg shadow-md border border-[var(--border)]">
              <div className="w-12 h-12 bg-indigo-100 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-300 rounded-full flex items-center justify-center text-xl font-bold mb-4">
                1
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Input Your Content</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Paste your blog post, article, or transcript into our platform.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-[var(--card-bg)] p-6 rounded-lg shadow-md border border-[var(--border)]">
              <div className="w-12 h-12 bg-indigo-100 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-300 rounded-full flex items-center justify-center text-xl font-bold mb-4">
                2
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Choose Your Format</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Select the output format and tone that matches your needs.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-[var(--card-bg)] p-6 rounded-lg shadow-md border border-[var(--border)]">
              <div className="w-12 h-12 bg-indigo-100 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-300 rounded-full flex items-center justify-center text-xl font-bold mb-4">
                3
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Get Repurposed Content</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Our AI transforms your content into the perfect format for your needs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Output Formats Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Output Formats</h2>
            <p className="mt-4 text-xl text-gray-600 dark:text-gray-300">
              Transform your content into various formats
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 text-center">
            {[
              { name: "Twitter Threads", icon: <Twitter className="h-6 w-6 mx-auto mb-2" /> },
              { name: "LinkedIn Posts", icon: <Linkedin className="h-6 w-6 mx-auto mb-2" /> },
              { name: "Facebook Posts", icon: <Facebook className="h-6 w-6 mx-auto mb-2" /> },
              { name: "Instagram Captions", icon: <Instagram className="h-6 w-6 mx-auto mb-2" /> },
              { name: "Email Newsletters", icon: <Mail className="h-6 w-6 mx-auto mb-2" /> },
              { name: "YouTube Scripts", icon: <Youtube className="h-6 w-6 mx-auto mb-2" /> }
            ].map((format, index) => (
              <div key={index} className="bg-[var(--card-bg)] p-4 rounded-lg shadow-md border border-[var(--border)]">
                {format.icon}
                <p className="font-medium text-gray-900 dark:text-white">{format.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-indigo-600 dark:bg-indigo-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Ready to Repurpose Your Content?
          </h2>
          <p className="text-xl text-indigo-100 mb-8 max-w-3xl mx-auto">
            Join now and start transforming your content into multiple formats with just a few clicks.
          </p>
          <a href="/auth">
            <Button 
              variant="secondary" 
              size="lg" 
              className="px-8"
            >
              Get Started for Free
            </Button>
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">ContentRemix</h2>
            <p className="text-gray-400 mb-6">
              AI-powered content repurposing platform
            </p>
            <p className="text-sm text-gray-500">
              &copy; {new Date().getFullYear()} ContentRemix. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
