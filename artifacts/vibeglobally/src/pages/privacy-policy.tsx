import { useGetSiteContent, getGetSiteContentQueryKey } from "@workspace/api-client-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { SEOHead } from "@/components/seo/seo-head";
import { Loader2 } from "lucide-react";

interface PrivacyPolicyContent {
  title?: string;
  lastUpdated?: string;
  content?: string;
}

export default function PrivacyPolicy() {
  const { data, isLoading } = useGetSiteContent("privacy", {
    query: { queryKey: getGetSiteContentQueryKey("privacy") },
  });

  const content = (data?.content ?? {}) as PrivacyPolicyContent;
  const title = content.title ?? "Privacy Policy";
  const lastUpdated = content.lastUpdated ?? new Date().toLocaleDateString();
  const htmlContent = content.content ?? `
    <h2>1. Information We Collect</h2>
    <p>We collect information you provide directly to us when you use our services, including your name, email address, phone number, and company information.</p>
    
    <h2>2. How We Use Your Information</h2>
    <p>We use the information we collect to provide, maintain, and improve our services, to communicate with you, and to comply with legal obligations.</p>
    
    <h2>3. Information Sharing</h2>
    <p>We do not sell or share your personal information with third parties except as necessary to provide our services or as required by law.</p>
    
    <h2>4. Data Security</h2>
    <p>We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, or destruction.</p>
    
    <h2>5. Your Rights</h2>
    <p>You have the right to access, correct, or delete your personal information. Contact us at <a href="mailto:lyndon@vibeglobally.ph" style="color: #f5c518; text-decoration: underline;">lyndon@vibeglobally.ph</a> to exercise these rights.</p>
    
    <h2>6. Contact Us</h2>
    <p>If you have questions about this Privacy Policy, please contact us at <a href="mailto:lyndon@vibeglobally.ph" style="color: #f5c518; text-decoration: underline;">lyndon@vibeglobally.ph</a>.</p>
  `;

  return (
    <>
      <SEOHead
        title="Privacy Policy | #VibeAlong"
        description="Read #VibeAlong's privacy policy to understand how we collect, use, and protect your personal information when using our virtual assistant services."
        keywords="privacy policy, data protection, personal information, #VibeAlong privacy"
        canonical="https://vibeglobally.com/privacy-policy"
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
