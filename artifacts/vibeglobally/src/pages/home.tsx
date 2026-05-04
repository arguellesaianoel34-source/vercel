import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Hero } from "@/components/home/hero";
import { Services } from "@/components/home/services";
import { VibeValues } from "@/components/home/vibe-values";
import { Tools } from "@/components/home/tools";
import { SampleCalls } from "@/components/home/sample-calls";
import { Clients } from "@/components/home/clients";
import { TestimonialsSection } from "@/components/home/testimonials-section";
import { FAQSection } from "@/components/home/faq-section";
import { ContactSection } from "@/components/home/contact-section";
import { SEOHead } from "@/components/seo/seo-head";
import { DynamicFavicon } from "@/components/seo/dynamic-favicon";

export default function Home() {
  return (
    <>
      <SEOHead
        title="#VibeAlong"
        description="Transform your business with #VibeAlong's professional virtual assistant services. Expert support for customer service, administrative tasks, and business operations. Available 24/7 with proven results. #VibeAlong"
        keywords="virtual assistant, virtual assistant services, business support, customer service, administrative support, remote assistant, professional VA, 24/7 support, business operations, outsourcing services, VibeAlong"
        canonical="https://vibeglobally.ph/"
      />
      <DynamicFavicon />
      <div className="min-h-screen bg-background font-sans text-foreground selection:bg-primary selection:text-primary-foreground">
        <Navbar />
        <main>
          <Hero />
          <VibeValues />
          <Services />
          <Tools />
          <SampleCalls />
          <Clients />
          <TestimonialsSection />
          <FAQSection />
          <ContactSection />
        </main>
        <Footer />
      </div>
    </>
  );
}
