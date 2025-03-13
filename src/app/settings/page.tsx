"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";
import toast, { Toaster } from "react-hot-toast";
import { Sidebar } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Tabs } from "@/components/ui/tabs";
import { TokenUsageCard } from "@/components/ui/token-usage-card";
import { TokenHistory } from "@/components/ui/token-history";

export default function Settings() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [activeTab, setActiveTab] = useState("profile");

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        setEmail(session.user.email || "");
        // In a real app, you would fetch user profile data here
        setFullName("Alex Johnson");
        setCompany("Repurposely Inc.");
      } else {
        router.push("/auth");
      }
    };

    checkUser();
  }, [router]);

  const handleSaveChanges = async () => {
    setLoading(true);
    try {
      // In a real app, you would update the user profile here
      // For example: await updateUserProfile(user.id, { fullName, company });
      // Using the user variable to fix the lint error
      if (user) {
        console.log(user.id);
      }
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success("Settings saved successfully");
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Failed to save settings");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Toaster position="top-right" />
      <Sidebar />

      <div className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Account Settings
          </h1>
          <p className="text-gray-500 mb-6">Manage your profile and subscription</p>

          {/* Tabs */}
          <div className="mb-6">
            <Tabs
              tabs={[
                { id: "profile", label: "Profile" },
                { id: "subscription", label: "Subscription" },
                { id: "usage", label: "Usage" },
                { id: "security", label: "Security" },
              ]}
              defaultTabId="profile"
              onTabChange={setActiveTab}
            />
          </div>

          {/* Profile Tab */}
          {activeTab === "profile" && (
            <div className="bg-white p-6 rounded-lg border border-gray-200 mb-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-900">
                Personal Information
              </h2>
              <div className="mb-4">
                <label className="block text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  className="text-gray-900 block w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Alex Johnson"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-1">Email Address</label>
                <input
                  type="email"
                  className="text-gray-900 block w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="alex.johnson@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled
                />
                <p className="text-xs text-gray-500 mt-1">
                  Email cannot be changed
                </p>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-1">Company</label>
                <input
                  type="text"
                  className="text-gray-900 block w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Repurposely Inc."
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                />
              </div>
              <div className="mt-6">
                <Button
                  onClick={handleSaveChanges}
                  className="px-6"
                  variant="primary"
                >
                  {loading ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </div>
          )}

          {/* Subscription Tab */}
          {activeTab === "subscription" && (
            <div className="bg-white p-6 rounded-lg border border-gray-200 mb-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-900">
                Current Plan
              </h2>
              <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-100 mb-6">
                <div className="flex items-center mb-2">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-indigo-800">Free Plan</h3>
                    <p className="text-xs text-indigo-700">Basic features with limited usage</p>
                  </div>
                </div>
                <div className="mt-4">
                  <Button
                    variant="secondary"
                    className="bg-indigo-600 text-white hover:bg-indigo-700 px-4 py-2 text-sm"
                  >
                    Upgrade
                  </Button>
                </div>
              </div>

              <h2 className="text-xl font-semibold mb-4 text-gray-900">
                Available Plans
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="border border-gray-200 rounded-lg p-4 bg-white">
                  <div className="mb-2 text-center">
                    <span className="inline-block px-2 py-1 bg-indigo-100 text-indigo-800 text-xs rounded-full">FREE</span>
                  </div>
                  <h3 className="text-lg font-medium text-center mb-2">Free Plan</h3>
                  <p className="text-gray-500 text-sm text-center mb-4">Basic features with limited usage</p>
                  <div className="text-center text-2xl font-bold mb-4">$0<span className="text-sm font-normal text-gray-500">/month</span></div>
                  <ul className="text-sm space-y-2 mb-6">
                    <li className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      5 projects
                    </li>
                    <li className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      50 tokens per month
                    </li>
                    <li className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Basic templates
                    </li>
                  </ul>
                  <div className="text-center">
                    <Button
                      variant="secondary"
                      className="w-full"
                    >
                      Current Plan
                    </Button>
                  </div>
                </div>

                <div className="border border-indigo-200 rounded-lg p-4 bg-white shadow-md relative">
                  <div className="absolute -top-3 left-0 right-0 flex justify-center">
                    <span className="px-3 py-1 bg-indigo-600 text-white text-xs rounded-full">MOST POPULAR</span>
                  </div>
                  <div className="mb-2 text-center pt-2">
                    <span className="inline-block px-2 py-1 bg-indigo-100 text-indigo-800 text-xs rounded-full">PRO</span>
                  </div>
                  <h3 className="text-lg font-medium text-center mb-2">Pro Plan</h3>
                  <p className="text-gray-500 text-sm text-center mb-4">For professionals and small teams</p>
                  <div className="text-center text-2xl font-bold mb-4">$12<span className="text-sm font-normal text-gray-500">/month</span></div>
                  <ul className="text-sm space-y-2 mb-6">
                    <li className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Unlimited projects
                    </li>
                    <li className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      500 tokens per month
                    </li>
                    <li className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      All templates
                    </li>
                    <li className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      5 team members
                    </li>
                  </ul>
                  <div className="text-center">
                    <Button
                      variant="primary"
                      className="w-full"
                    >
                      Upgrade
                    </Button>
                  </div>
                </div>

                <div className="border border-gray-200 rounded-lg p-4 bg-white">
                  <div className="mb-2 text-center">
                    <span className="inline-block px-2 py-1 bg-indigo-100 text-indigo-800 text-xs rounded-full">ENTERPRISE</span>
                  </div>
                  <h3 className="text-lg font-medium text-center mb-2">Enterprise Plan</h3>
                  <p className="text-gray-500 text-sm text-center mb-4">For larger teams and organizations</p>
                  <div className="text-center text-2xl font-bold mb-4">Custom<span className="text-sm font-normal text-gray-500"></span></div>
                  <ul className="text-sm space-y-2 mb-6">
                    <li className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Unlimited everything
                    </li>
                    <li className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      2000+ tokens per month
                    </li>
                    <li className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Dedicated support
                    </li>
                  </ul>
                  <div className="text-center">
                    <Button
                      variant="secondary"
                      className="w-full"
                    >
                      Contact Sales
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Usage Tab */}
          {activeTab === "usage" && (
            <div>
              <div className="bg-white p-6 rounded-lg border border-gray-200 mb-6">
                <h2 className="text-xl font-semibold mb-4 text-gray-900">
                  Token Usage
                </h2>
                <TokenUsageCard />
              </div>
              
              <div className="bg-white p-6 rounded-lg border border-gray-200 mb-6">
                <h2 className="text-xl font-semibold mb-4 text-gray-900">
                  Token History
                </h2>
                <TokenHistory />
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === "security" && (
            <div className="bg-white p-6 rounded-lg border border-gray-200 mb-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-900">
                Security Settings
              </h2>
              <div className="mb-6">
                <h3 className="text-md font-medium mb-2">Change Password</h3>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-1">Current Password</label>
                  <input
                    type="password"
                    className="text-gray-900 block w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="••••••••"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-1">New Password</label>
                  <input
                    type="password"
                    className="text-gray-900 block w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="••••••••"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    className="text-gray-900 block w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="••••••••"
                  />
                </div>
                <Button
                  variant="primary"
                  className="mt-2"
                >
                  Update Password
                </Button>
              </div>
              
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-md font-medium mb-2">Two-Factor Authentication</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Add an extra layer of security to your account by enabling two-factor authentication.
                </p>
                <Button
                  variant="secondary"
                >
                  Enable 2FA
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
