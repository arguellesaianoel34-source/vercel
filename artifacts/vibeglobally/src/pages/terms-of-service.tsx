import { useGetSiteContent, getGetSiteContentQueryKey } from "@workspace/api-client-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { SEOHead } from "@/components/seo/seo-head";
import { Loader2 } from "lucide-react";

interface TermsOfServiceContent {
  title?: string;
  lastUpdated?: string;
  content?: string;
}

export default function TermsOfService() {
  const { data, isLoading } = useGetSiteContent("terms", {
    query: { queryKey: getGetSiteContentQueryKey("terms") },
  });

  const content = (data?.content ?? {}) as TermsOfServiceContent;
  const title = content.title ?? "Terms of Service";
  const lastUpdated = content.lastUpdated ?? new Date().toLocaleDateString();
  const htmlContent = content.content ?? `
    <h2>1. Acceptance of Terms</h2>
    <p>By accessing and using VibeGlobally's services, you accept and agree to be bound by these Terms of Service.</p>
    
    <h2>2. Services Description</h2>
    <p>VibeGlobally provides virtual assistance, telemarketing, lead generation, and related business process outsourcing services.</p>
    
    <h2>3. User Obligations</h2>
    <p>You agree to provide accurate information, maintain the confidentiality of your account, and use our services in compliance with all applicable laws.</p>
    
    <h2>4. Payment Terms</h2>
    <p>Payment terms will be specified in your service agreement. All fees are non-refundable unless otherwise stated in writing.</p>
    
    <h2>5. Intellectual Property</h2>
    <p>All content, trademarks, and intellectual property on this site are owned by VibeGlobally or its licensors.</p>
    
    <h2>6. Limitation of Liability</h2>
    <p>VibeGlobally shall not be liable for any indirect, incidental, or consequential damages arising from the use of our services.</p>
    
    <h2>7. Termination</h2>
    <p>We reserve the right to terminate or suspend access to our services at our discretion, with or without notice.</p>
    
    <h2>8. Contact Information</h2>
    <p>For questions about these Terms of Service, contact us at <a href="mailto:lyndon@vibeglobally.ph" style="color: #f5c518; text-decoration: underline;">lyndon@vibeglobally.ph</a>.</p>
  `;

  return (
    <>
      <SEOHead
        title="Terms of Service | #VibeAlong"
        description="Review #VibeAlong's terms of service to understand the rules and regulations for using our professional virtual assistant services."
        keywords="terms of service, terms and conditions, service agreement, #VibeAlong terms"
        canonical="https://vibeglobally.com/terms-of-service"
      />
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
      <main className="flex-1 pt-20">
        <div className="container mx-auto px-4 md:px-6 py-16 max-w-4xl">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
          ) : (
            <>
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">{title}</h1>
              <p className="text-sm text-muted-foreground mb-8">Last Updated: {lastUpdated}</p>
              <div 
                className="prose prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: htmlContent }}
              />
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
    </>
  );
}
