import Link from "next/link";
import { Logo } from "./logo";

export function Footer() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-white border-t border-gray-100 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and description */}
          <div className="col-span-1 md:col-span-1">
            <Logo />
            <p className="mt-4 text-sm text-gray-600">
              Transform your content into multiple formats with AI-powered quality analysis.
            </p>
          </div>
          
          {/* Product links */}
          <div className="col-span-1">
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">
              Product
            </h3>
            <ul className="space-y-3">
              <li>
                <Link href="/pricing" className="text-base text-gray-600 hover:text-indigo-600">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/auth" className="text-base text-gray-600 hover:text-indigo-600">
                  Sign Up
                </Link>
              </li>
              <li>
                <Link href="/auth" className="text-base text-gray-600 hover:text-indigo-600">
                  Login
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Legal links */}
          <div className="col-span-1">
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">
              Legal
            </h3>
            <ul className="space-y-3">
              <li>
                <Link href="/terms" className="text-base text-gray-600 hover:text-indigo-600">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-base text-gray-600 hover:text-indigo-600">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/refund-policy" className="text-base text-gray-600 hover:text-indigo-600">
                  Refund Policy
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Contact links */}
          <div className="col-span-1">
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">
              Support
            </h3>
            <ul className="space-y-3">
              <li>
                <Link href="/contact" className="text-base text-gray-600 hover:text-indigo-600">
                  Contact Us
                </Link>
              </li>
              <li>
                <a href="mailto:support@repurposely.com" className="text-base text-gray-600 hover:text-indigo-600">
                  support@repurposely.com
                </a>
              </li>
            </ul>
          </div>
        </div>
        {/* <div className="mt-12 pt-8 border-t border-gray-100">
          <p className="text-sm text-gray-500 text-center">
            &copy; {currentYear} Repurposely. All rights reserved.
          </p>
        </div> */}
      </div>
    </footer>
  );
}
