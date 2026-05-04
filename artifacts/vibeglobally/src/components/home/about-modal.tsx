import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Building2, Target, Users, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

interface AboutModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const highlights = [
  {
    icon: Building2,
    title: "Founded in 2020",
    description: "Years of proven expertise in outsourcing and growth support"
  },
  {
    icon: Target,
    title: "Mission-Driven",
    description: "Helping you focus on growth while we handle operations"
  },
  {
    icon: Users,
    title: "Dedicated Teams",
    description: "Not just freelancers—complete support systems tailored to you"
  },
  {
    icon: TrendingUp,
    title: "Results-Focused",
    description: "Consistency, accountability, and measurable outcomes"
  }
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { 
    opacity: 1, 
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 300,
      damping: 24
    }
  }
};

const cardVariant = {
  hidden: { opacity: 0, scale: 0.9 },
  show: { 
    opacity: 1, 
    scale: 1,
    transition: {
      type: "spring" as const,
      stiffness: 300,
      damping: 24
    }
  }
};

export function AboutModal({ open, onOpenChange }: AboutModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-3xl md:text-4xl font-bold text-center mb-6">
            <motion.span
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              About <span className="text-primary">Us</span>
            </motion.span>
          </DialogTitle>
        </DialogHeader>
        
        <motion.div 
          className="space-y-6 text-base text-muted-foreground"
          variants={container}
          initial="hidden"
          animate="show"
        >
          <motion.p variants={item}>
            Founded in 2020, VibeGlobally is a full-service outsourcing and growth support agency helping businesses scale with reliable, skilled remote professionals. We connect companies with top-tier talent in telemarketing, customer support, virtual assistance, SEO, email marketing, social media management, data entry, and more.
          </motion.p>
          
          <motion.p variants={item}>
            Our mission is simple: help you focus on growing your business while we handle the execution, operations, and customer-facing work that keeps it running smoothly.
          </motion.p>
          
          <motion.p variants={item}>
            We don't just provide freelancers. We build dedicated support systems tailored to your business needs. Whether you're a startup or an established company, we deliver flexible, cost-effective solutions designed to increase productivity, improve customer experience, and drive revenue growth.
          </motion.p>
          
          <motion.p variants={item}>
            At VibeGlobally, we believe in consistency, accountability, and results. Every team member we provide is trained to integrate seamlessly into your workflow and represent your brand with professionalism.
          </motion.p>
          
          <motion.p 
            variants={item}
            className="text-lg font-semibold text-foreground text-center mt-8 pt-4 border-t border-border cursor-pointer hover:text-primary transition-colors duration-300"
            onClick={() => {
              // Scroll to contact section when clicked
              onOpenChange(false);
              setTimeout(() => {
                document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
              }, 300);
            }}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            Grow faster. Operate smarter. Scale globally—with VibeGlobally.
          </motion.p>
        </motion.div>

        <motion.div 
          className="grid md:grid-cols-2 gap-4 mt-8"
          variants={container}
          initial="hidden"
          animate="show"
        >
          {highlights.map((highlight, index) => (
            <motion.div
              key={index}
              variants={cardVariant}
              whileHover={{ 
                scale: 1.05,
                transition: { duration: 0.2 }
              }}
              className="bg-card border border-border rounded-lg p-4 hover:border-primary/50 hover:shadow-[0_0_15px_rgba(245,197,24,0.1)] transition-all duration-300 group cursor-pointer"
            >
              <motion.div 
                className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors duration-300"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
              >
                <highlight.icon className="w-5 h-5 text-primary" />
              </motion.div>
              <h3 className="text-lg font-bold text-foreground mb-1 group-hover:text-primary transition-colors duration-300">
                {highlight.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {highlight.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
