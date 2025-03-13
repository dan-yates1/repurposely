import { useEffect } from 'react';

/**
 * A custom hook to dynamically update the page title
 * @param title The title to set for the current page
 * @param siteName Optional site name to append (defaults to Repurposely)
 */
export function usePageTitle(title: string, siteName: string = 'Repurposely') {
  useEffect(() => {
    // Update the document title
    const fullTitle = title ? `${title} | ${siteName}` : siteName;
    document.title = fullTitle;
    
    // Cleanup function to reset title when component unmounts
    return () => {
      document.title = siteName;
    };
  }, [title, siteName]);
}
