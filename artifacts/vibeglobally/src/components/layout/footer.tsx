import { Link } from "wouter";
import { useState, useEffect } from "react";
import { useGetSiteContent, getGetSiteContentQueryKey } from "@workspace/api-client-react";
import { AboutModal } from "@/components/home/about-modal";
import { useLocation } from "wouter";

interface LogoContent {
  logoUrl?: string;
  logoText?: string;
  logoAccentText?: string;
}

export function Footer() {
  const [aboutModalOpen, setAboutModalOpen] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  const [, setLocation] = useLocation();

  const { data: logoData, isError } = useGetSiteContent("logo", {
    query: { 
      queryKey: getGetSiteContentQueryKey("logo"), 
      refetchInterval: 15000,
      retry: false,
    },
  });

  const logoContent = (logoData?.content ?? {}) as LogoContent;
  const logoUrl = logoContent.logoUrl;
  const logoText = logoContent.logoText || "Vibe";
  const logoAccentText = logoContent.logoAccentText || "Globally";

  // Hidden keyboard shortcut: Ctrl+Shift+A
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'A') {
        e.preventDefault();
        setLocation('/admin/login');
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [setLocation]);

  // Reset click count after 2 seconds
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (clickCount > 0) {
      timer = setTimeout(() => setClickCount(0), 2000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [clickCount]);

  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const newCount = clickCount + 1;
    setClickCount(newCount);
    
    // 5 rapid clicks opens admin login
    if (newCount === 5) {
      setLocation('/admin/login');
      setClickCount(0);
    }
  };

  const handleAboutClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    setAboutModalOpen(true);
  };

  const handleServiceClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    document.getElementById("services")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <footer className="bg-card border-t border-border pt-16 pb-8">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-2">
            <div 
              onClick={handleLogoClick}
              className="flex items-center gap-3 mb-4 cursor-pointer select-none"
            >
              {logoUrl ? (
                <>
                  <img 
                    src={logoUrl} 
                    alt="Logo" 
                    className="h-10 w-10 object-cover rounded-full"
                  />
                  <span className="font-bold text-xl tracking-tight text-foreground">
                    {logoText}<span className="text-primary">{logoAccentText}</span>
                  </span>
                </>
              ) : (
                <>
                  <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-xl">
                    {logoText.charAt(0)}
                  </div>
                  <span className="font-bold text-xl tracking-tight text-foreground">
                    {logoText}<span className="text-primary">{logoAccentText}</span>
                  </span>
                </>
              )}
            </div>
            <p className="text-muted-foreground max-w-sm mb-6">
              Versatility, Intensity, Brilliance, Enthusiasm. Your high-performance remote operations partner.
            </p>
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              <a 
                href="mailto:lyndon@vibeglobally.ph"
                className="hover:text-primary transition-colors cursor-pointer"
              >
                lyndon@vibeglobally.ph
              </a>
              <a 
                href="https://wa.me/639172798754" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors cursor-pointer"
              >
                +63 917 279 8754
              </a>
              <span>General Trias, Cavite, Philippines</span>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold text-foreground mb-4">Services</h3>
            <ul className="space-y-3">
              <li><a href="#services" onClick={handleServiceClick} className="text-muted-foreground hover:text-primary text-sm transition-colors cursor-pointer">Telemarketing</a></li>
              <li><a href="#services" onClick={handleServiceClick} className="text-muted-foreground hover:text-primary text-sm transition-colors cursor-pointer">Customer Support</a></li>
              <li><a href="#services" onClick={handleServiceClick} className="text-muted-foreground hover:text-primary text-sm transition-colors cursor-pointer">Virtual Assistance</a></li>
              <li><a href="#services" onClick={handleServiceClick} className="text-muted-foreground hover:text-primary text-sm transition-colors cursor-pointer">Digital Marketing</a></li>
              <li><a href="#services" onClick={handleServiceClick} className="text-muted-foreground hover:text-primary text-sm transition-colors cursor-pointer">Data Entry</a></li>
              <li><a href="#services" onClick={handleServiceClick} className="text-muted-foreground hover:text-primary text-sm transition-colors cursor-pointer">SEO Services</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-foreground mb-4">Company</h3>
            <ul className="space-y-3">
              <li>
                <a 
                  href="#about" 
                  onClick={handleAboutClick}
                  className="text-muted-foreground hover:text-primary text-sm transition-colors cursor-pointer"
                >
                  About Us
                </a>
              </li>
              <li><a href="#contact" className="text-muted-foreground hover:text-primary text-sm transition-colors">Contact</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} VibeGlobally Virtual Assistance Services. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link href="/privacy-policy" className="text-xs text-muted-foreground hover:text-primary transition-colors">Privacy Policy</Link>
            <Link href="/terms-of-service" className="text-xs text-muted-foreground hover:text-primary transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
      
      <AboutModal open={aboutModalOpen} onOpenChange={setAboutModalOpen} />
    </footer>
  );
}
