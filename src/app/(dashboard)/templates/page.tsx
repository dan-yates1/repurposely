"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import toast, { Toaster } from "react-hot-toast";
import {
  Search,
  Filter,
  Star,
  StarOff,
  Plus,
  Eye,
} from "lucide-react"; 
import { Button } from "@/components/ui/button";
import { CATEGORIES, TEMPLATES, Template } from "@/lib/templates"; // Import from shared file
import { usePageTitle } from "@/hooks/usePageTitle";
import { TemplatePreviewModal } from "@/components/ui/template-preview-modal";
import { CustomTemplateModal } from "@/components/ui/custom-template-modal";
import React from 'react'; 

export default function Templates() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [filteredTemplates, setFilteredTemplates] = useState<Template[]>(TEMPLATES); 
  const [userTemplates, setUserTemplates] = useState<Template[]>([]); // For favorites
  const [customTemplates, setCustomTemplates] = useState<Template[]>([]); // For custom
  const [isLoading, setIsLoading] = useState(false);
  const [showPremium, setShowPremium] = useState(true);
  const [userPlan, setUserPlan] = useState<string>("Free");
  const [userId, setUserId] = useState<string | null>(null);
  
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [isCustomTemplateModalOpen, setIsCustomTemplateModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);

  usePageTitle("Templates");

  useEffect(() => {
    const getUserInfo = async () => {
      setIsLoading(true);
      try {
        const { data } = await supabase.auth.getUser();
        if (data.user) {
          setUserId(data.user.id);
          
          const { data: subscriptionData } = await supabase
            .from("user_subscriptions")
            .select("subscription_tier")
            .eq("user_id", data.user.id)
            .maybeSingle(); 

          if (subscriptionData) {
            const tier = subscriptionData.subscription_tier || "FREE";
            setUserPlan(tier.charAt(0).toUpperCase() + tier.slice(1).toLowerCase());
          } else {
             setUserPlan("Free"); 
          }

          // Simulate fetching favorites - replace with actual DB fetch later
          const randomFavorites = TEMPLATES.filter(() => Math.random() > 0.7)
                                         .map((template) => ({ ...template, favorite: true }));
          setUserTemplates(randomFavorites);
          
          loadCustomTemplates();
        } else {
          router.push("/auth");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    getUserInfo();
  }, [router]);

  const loadCustomTemplates = () => {
    try {
      const savedTemplates = localStorage.getItem('customTemplates');
      if (savedTemplates) {
        setCustomTemplates(JSON.parse(savedTemplates));
      }
    } catch (error) {
      console.error('Error loading custom templates:', error);
    }
  };

  useEffect(() => {
    const allAvailableTemplates = [...TEMPLATES, ...customTemplates]; // Use const
    let filtered = allAvailableTemplates;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(t => t.title.toLowerCase().includes(query) || t.description.toLowerCase().includes(query));
    }

    if (selectedCategory !== "all") {
      if (selectedCategory === "favorite") {
        const favoriteIds = userTemplates.filter(ut => ut.favorite).map(ut => ut.id);
        filtered = filtered.filter(t => favoriteIds.includes(t.id));
      } else if (selectedCategory === "custom") {
         filtered = filtered.filter(t => t.type === "custom"); 
      } else {
        filtered = filtered.filter(t => t.type === selectedCategory);
      }
    }

    if (!showPremium) {
      filtered = filtered.filter(t => !t.premium);
    }

    setFilteredTemplates(filtered);
  }, [searchQuery, selectedCategory, userTemplates, showPremium, customTemplates]);

  const toggleFavorite = (templateId: string) => {
    setUserTemplates(prev => {
      const existingIndex = prev.findIndex(t => t.id === templateId);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = { ...updated[existingIndex], favorite: !updated[existingIndex].favorite };
        return updated.filter(t => t.favorite); 
      } else {
        const template = [...TEMPLATES, ...customTemplates].find(t => t.id === templateId);
        if (template) return [...prev, { ...template, favorite: true }];
        return prev;
      }
    });
    toast.success("Template favorites updated (simulated)");
  };

  const handleTemplateSelect = (templateId: string) => {
    const template = [...TEMPLATES, ...customTemplates].find(t => t.id === templateId);
    if (!template) return;
    if (template.premium && userPlan === "Free") {
      toast.error("This template requires a Pro or Enterprise subscription");
      return;
    }
    router.push(`/create?template=${templateId}`);
  };

  const handlePreviewTemplate = (templateId: string) => {
    const template = [...TEMPLATES, ...customTemplates].find(t => t.id === templateId);
    if (template) {
      setSelectedTemplate(template);
      setIsPreviewModalOpen(true);
    }
  };

  const handleCreateCustomTemplate = () => {
    if (userPlan === "Free") {
      toast.error("Custom templates require a Pro or Enterprise subscription");
      return;
    }
    setIsCustomTemplateModalOpen(true);
  };

  const handleSaveCustomTemplate = (template: Template) => {
     const updatedCustomTemplates = [...customTemplates, template];
     setCustomTemplates(updatedCustomTemplates);
     localStorage.setItem('customTemplates', JSON.stringify(updatedCustomTemplates));
     toast.success("Custom template saved!");
  };

  return (
    <div className="max-w-7xl mx-auto px-8 py-6">
      <Toaster position="top-right" />
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Templates</h1>
          <p className="text-gray-500 mt-1">Choose a template to repurpose your content</p>
        </div>
        <div className="flex items-center space-x-4">
          {/* Search */}
          <div className="relative w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Search size={18} className="text-gray-400" /></div>
            <input type="text" className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" placeholder="Search templates..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
          {/* Premium Filter */}
          <button className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm ${showPremium ? "bg-indigo-50 text-indigo-600" : "bg-gray-100 text-gray-600"}`} onClick={() => setShowPremium(!showPremium)}>
            <Filter size={16} />
            <span>{showPremium ? "Showing All" : "Hide Premium"}</span>
          </button>
          {/* Create Custom Template Button */}
          <Button variant="primary" size="md" className="rounded-md px-4 shadow-sm hover:shadow-md transition-all duration-200 flex items-center" onClick={handleCreateCustomTemplate}>
            <Plus size={16} className="mr-2" /> Custom Template
          </Button>
        </div>
      </div>
      {/* Categories */}
      <div className="flex space-x-2 mb-8 overflow-x-auto pb-2">
        {CATEGORIES.map((category) => (
          <button key={category.id} className={`px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap ${selectedCategory === category.id ? "bg-indigo-100 text-indigo-700" : "bg-white text-gray-700 hover:bg-gray-50"}`} onClick={() => setSelectedCategory(category.id)}>
            {category.label}
          </button>
        ))}
      </div>
      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? ( 
          // Loading Skeletons
          Array(6).fill(0).map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-3"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6 mb-6"></div>
              <div className="flex justify-between items-center">
                <div className="h-8 bg-gray-200 rounded w-24"></div>
                <div className="h-8 bg-gray-200 rounded w-8"></div>
              </div>
            </div>
          ))
        ) : filteredTemplates.length > 0 ? (
          filteredTemplates.map((template) => {
            const isFavorite = userTemplates.some(ut => ut.id === template.id && ut.favorite);
            const isCustom = template.type === 'custom'; 
            const IconComponent = template.icon; 

            return (
              <div key={template.id} className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 relative">
                {/* Indicators */}
                {template.new && !isCustom && <span className="absolute top-4 right-4 bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded-full">NEW</span>}
                {template.premium && !isCustom && <span className="absolute top-4 right-4 bg-yellow-100 text-yellow-800 text-xs font-semibold px-2 py-1 rounded-full">PRO</span>}
                {isCustom && <span className="absolute top-4 right-4 bg-indigo-100 text-indigo-800 text-xs font-semibold px-2 py-1 rounded-full">CUSTOM</span>}
                
                {/* Icon and Title */}
                <div className="mb-4 flex items-center space-x-2">
                  {IconComponent && <IconComponent className="h-5 w-5 text-indigo-500" />}
                  <h3 className="text-lg font-medium text-gray-900">{template.title}</h3>
                </div>
                {/* Description */}
                <p className="text-gray-600 mb-6 min-h-[3rem]">{template.description}</p>
                {/* Actions */}
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <button className="text-gray-700 px-3 py-2 rounded-md text-sm font-medium flex items-center border border-gray-200 hover:bg-gray-50" onClick={() => handleTemplateSelect(template.id)}>Use Template</button>
                    <button className="text-gray-700 px-2 py-2 rounded-md text-sm font-medium flex items-center border border-gray-200 hover:bg-gray-50" onClick={() => handlePreviewTemplate(template.id)} aria-label="Preview template"><Eye size={16} /></button>
                    <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">{template.tokens} token{template.tokens > 1 ? "s" : ""}</span>
                  </div>
                  <button className="text-gray-400 hover:text-indigo-500 focus:outline-none" onClick={() => toggleFavorite(template.id)} aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}>
                    {isFavorite ? <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" /> : <StarOff className="h-5 w-5" />}
                  </button>
                </div>
              </div>
            );
          })
        ) : ( 
          <div className="col-span-3 py-12 text-center">
            <p className="text-gray-500 mb-2">No templates found.</p>
            <p className="text-gray-400 text-sm">Try adjusting your search or filters.</p>
          </div> 
        )}
      </div>
      {/* Modals */}
      {selectedTemplate && <TemplatePreviewModal isOpen={isPreviewModalOpen} onClose={() => setIsPreviewModalOpen(false)} template={selectedTemplate} />}
      {userId && <CustomTemplateModal isOpen={isCustomTemplateModalOpen} onClose={() => setIsCustomTemplateModalOpen(false)} onSave={handleSaveCustomTemplate} userId={userId} />}
    </div>
  );
}
