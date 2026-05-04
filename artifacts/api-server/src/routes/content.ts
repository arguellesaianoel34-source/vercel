import { Router } from "express";
import { siteContentRepo } from "@workspace/db";
import { requireAuth } from "./auth";

const router = Router();

const DEFAULT_CONTENT: Record<string, unknown> = {
  hero: {
    badgeText: "#VibeAlong - Telemarketing & Virtual Assistance Agency",
    headline: "Why",
    headlineAccent: "US?",
    subheadline: "VibeGlobally is a full-service outsourcing agency providing experts in telemarketing, customer support, virtual assistance, SEO, email marketing, social media management, data entry, and more so you can focus on growing your business while we handle execution, support, and sales.",
    tagline: "Your hub for seamless connections between business leaders and potential partners. Join us on a journey where connections thrive and business possibilities unfold.",
    stats: [
      { value: "200+", label: "Calls Per Agent / Day" },
      { value: "40%+", label: "Avg. Conversion Lift" },
      { value: "3+", label: "Years of Operations" },
    ],
  },
  services: {
    sectionLabel: "What We Do",
    sectionTitle: "Services",
    sectionDescription: "We embed specialized talent directly into your workflows. From top-of-funnel outreach to back-office administration, we handle the execution so you can focus on closing.",
    items: [
      {
        title: "Lead Generation & Telemarketing",
        description: "Contacting, qualifying, canvassing and nurturing prospective customers using SMS, email and telecommunications. High-volume outbound dialing that fills your pipeline daily.",
        color: "text-blue-400",
        bg: "bg-blue-400/10",
        highlight: true,
      },
      {
        title: "Appointment Setting",
        description: "We book qualified meetings directly onto your sales team's calendar. Vetted, confirmed, and briefed — so you close, not chase.",
        color: "text-primary",
        bg: "bg-primary/10",
        highlight: true,
      },
      {
        title: "Customer Service & Support",
        description: "Inbound and outbound omnichannel support via phone, email, and live chat. Fast resolution times, high CSAT scores, and a team that represents your brand with pride.",
        color: "text-orange-400",
        bg: "bg-orange-400/10",
        highlight: false,
      },
      {
        title: "Virtual Assistance",
        description: "Administrative services including scheduling appointments, making phone calls, travel arrangements, and managing email accounts — all handled seamlessly.",
        color: "text-green-400",
        bg: "bg-green-400/10",
        highlight: false,
      },
      {
        title: "Digital Marketing",
        description: "Create, automate and send strategic marketing emails to help amplify our clients' presence. B2B and B2C campaign execution across every major channel.",
        color: "text-purple-400",
        bg: "bg-purple-400/10",
        highlight: false,
      },
      {
        title: "Data Entry & Transcription",
        description: "Accurate, rapid data handling, CRM hygiene, list building, and complex spreadsheet management. Clean data means sharper targeting.",
        color: "text-cyan-400",
        bg: "bg-cyan-400/10",
        highlight: false,
      },
      {
        title: "Social Media Management",
        description: "Content scheduling, community engagement, and brand voice consistency across all channels. We keep your audience warm while your team closes deals.",
        color: "text-pink-400",
        bg: "bg-pink-400/10",
        highlight: false,
      },
      {
        title: "SEO & Website Services",
        description: "On-page SEO optimization, website building, and digital presence management. We handle the visibility so prospects can find you.",
        color: "text-yellow-400",
        bg: "bg-yellow-400/10",
        highlight: false,
      },
    ],
  },
  results: {
    sectionLabel: "Track Record",
    sectionTitle: "Work History",
    sectionDescription: "Real numbers from real client engagements. This is what we bring to every project.",
    metrics: [
      { value: "1,200+", label: "Hours of Billed Work" },
      { value: "983", label: "Telemarketing Hours Logged" },
      { value: "$8,600+", label: "Earned Across Projects" },
      { value: "4.9 / 5", label: "Average Client Rating" },
    ],
    workHistory: [
      {
        title: "Appointment Setter",
        period: "Jan 2024 – Present",
        earned: "$1,189.00",
        rate: "$14.16 / hr",
        hours: "198 hours",
      },
      {
        title: "Appointment Setting for Final Expense",
        period: "Oct 2023 – Present",
        earned: "$385.33",
        rate: "$10.21 / hr",
        hours: "46 hours",
      },
      {
        title: "Assistant or Telemarketer",
        period: "Apr 2025 – Present",
        earned: "$7,085.65",
        rate: "$8.52 / hr",
        hours: "983 hours",
      },
    ],
  },
  tools: {
    sectionTitle: "Built for Your Stack & Industry",
    toolsTitle: "CRMs & Tools We've Handled",
    toolsDescription: "Our agents plug into your existing tech stack from day one — no ramp-up lag.",
    industriesTitle: "Industries We've Worked With",
    industriesDescription: "Deep domain knowledge means we understand your prospect's pain points before the first call.",
    tools: [
      "Monday.com", "Intercom", "LiveAgent", "Talkdesk", "Vonage Business", "CloudTalk", "Grasshopper", "ActiveCampaign", "Mailchimp", "Klaviyo", "Zapier", "Calendly", 
      "Hubspot", "Salesforce", "Freshdesk", "Zendesk", "ClickUp", "Pipedrive", "Zoho", "Podio", "Aircall", "RingCentral", "DialPad", "GoTo Connect", "OpenPhone", "3CX", "8x8", "JustCall", "Skype"
    ],
    industries: [
      "Real Estate", "Property Management", "Insurance", "Mortgage", "Cleaning", "Cybersecurity", "SAAS", "Financial", "Advertising", "Solar", "Home Improvement", "Coaching", "SEO", "Website Building", "Digital Marketing", "B2B and B2C Campaigns"
    ],
  },
  clients: {
    headline: "Trusted by",
    headlineAccent: "Global Clients",
    description: "From emerging startups to established enterprise companies across the US, Canada, and Australia — we provide the operational backbone that powers growth.",
    clients: [
      { name: "Gaywellness", domain: "gaywellness.com", link: "https://gaywellness.com" },
      { name: "ListGlobally", domain: "listglobally.com", link: "https://listglobally.com" },
      { name: "BC Media", domain: "bcmedia.tv", link: "https://bcmedia.tv" },
      { name: "Allstate Insurance", domain: "allstate.com", link: "https://allstate.com" },
      { name: "Velsoft - Canada", domain: "velsoft.com", link: "https://velsoft.com" },
      { name: "Brantley Solutions, LLC" },
      { name: "Family First Life Insurance", domain: "familyfirstlife.com", link: "https://familyfirstlife.com" },
      { name: "Spacer - Australia", domain: "spacer.com.au", link: "https://spacer.com.au" },
      { name: "Simply Wealth - Australia", domain: "simplywealthgroup.com.au", link: "https://simplywealthgroup.com.au" },
      { name: "IndoorMedia", domain: "indoormedia.com", link: "https://indoormedia.com" },
    ],
  },
  values: {
    headline: "The",
    headlineAccent: "VIBE",
    description: "We aren't just order-takers. We are a proactive extension of your company, built on a foundation of four core principles that ensure high performance. VibeGlobally is a full-service outsourcing agency providing experts in telemarketing, customer support, virtual assistance, SEO, email marketing, social media management, data entry, and more so you can focus on growing your business while we handle execution, support, and sales.",
    values: [
      { letter: "V", word: "Versatility", desc: "Adapting instantly to your tech stack, your processes, and your changing business needs." },
      { letter: "I", word: "Intensity", desc: "Operating with urgency and drive. We attack quotas and SLA targets relentlessly." },
      { letter: "B", word: "Brilliance", desc: "Smart problem solving. We don't just follow scripts; we optimize workflows." },
      { letter: "E", word: "Enthusiasm", desc: "High energy, positive culture. A team you actually enjoy working with every day." },
    ],
  },
  faq: {
    sectionTitle: "Frequently Asked Questions",
    sectionDescription: "Get answers to common questions about our virtual staffing and outsourcing services",
    items: [
      {
        question: "What is Vibeglobally?",
        answer: "Vibeglobally is a virtual staffing and outsourcing company that provides trained remote professionals to support businesses across customer service, telemarketing, appointment setting, chat support, data entry, email marketing, SEO, and more."
      },
      {
        question: "What services do you offer?",
        answer: "We provide a wide range of remote business support services, including customer service support, telemarketing and outbound calling, appointment setting, live chat support, data entry and admin tasks, email marketing support, SEO and basic digital marketing assistance, and custom virtual assistant solutions."
      },
      {
        question: "Who can benefit from Vibeglobally's services?",
        answer: "We work with startups, small businesses, agencies, and established companies that want to scale operations, reduce costs, and access trained remote talent without the overhead of hiring in-house staff."
      },
      {
        question: "Where are your virtual staff based?",
        answer: "Our team members are primarily based in the Philippines, known for strong English communication skills, customer service experience, and adaptability to global business operations."
      },
      {
        question: "Are your virtual assistants trained?",
        answer: "Yes. All our virtual staff undergo training based on the specific role they will handle, whether it's customer service, outbound calling, admin work, or marketing support. We also align them with your processes and systems."
      },
      {
        question: "Can I hire for multiple roles at once?",
        answer: "Yes. You can build a full remote team with different roles under one setup. For example, a mix of customer support agents, appointment setters, and admin assistants."
      },
      {
        question: "Do you provide full-time or part-time staff?",
        answer: "We offer flexible arrangements depending on your needs. You can scale from part-time support to full-time dedicated virtual staff."
      },
      {
        question: "How do you ensure quality of work?",
        answer: "We focus on training, clear SOPs (standard operating procedures), and alignment with your business goals. We also recommend regular performance feedback to ensure consistent quality."
      },
      {
        question: "Can your team work in my systems and tools?",
        answer: "Yes. Our virtual staff are trained to work with common tools such as CRMs, email platforms, helpdesk systems, spreadsheets, and project management tools."
      },
      {
        question: "How fast can I get started?",
        answer: "Once we understand your requirements, we can typically match and onboard virtual staff within a few days, depending on role complexity and training needs."
      },
      {
        question: "How is pricing structured?",
        answer: "Pricing depends on the role, skill level, and number of staff required. We offer flexible monthly packages designed to fit different business sizes and scaling needs."
      },
      {
        question: "Why choose Vibeglobally over hiring directly?",
        answer: "Hiring through Vibeglobally removes the complexity of recruitment, training, and management. You get pre-vetted, trained professionals who are ready to support your business while you focus on growth."
      }
    ]
  },
  team: {
    sectionLabel: "The People Behind the Results",
    sectionTitle: "Meet the Team",
    sectionDescription: "Verified on Upwork with 100% Job Success Scores — our team brings the professionalism and drive that keeps clients coming back.",
    members: [
      { name: "Lyndon A.", role: "Business Manager", jobSuccess: 100, badge: "top-rated", initials: "LA", profileUrl: "https://www.upwork.com/o/profiles/users/~0147d83a33fb9155fd/" },
      { name: "Sarah Joy L.", role: "Senior VA & Appointment Setter", jobSuccess: 100, badge: "top-rated", initials: "SL", profileUrl: "https://www.upwork.com/o/profiles/users/~01fcc3998a8bf35240/" },
      { name: "Allysa L.", role: "Virtual Assistant", jobSuccess: 100, badge: "top-rated-plus", initials: "AL", profileUrl: "https://www.upwork.com/o/profiles/users/~01cf62faf0e8812f57/" },
      { name: "Georgette T.", role: "Virtual Assistant", jobSuccess: 100, badge: "top-rated", initials: "GT", profileUrl: "https://www.upwork.com/o/profiles/users/~015cc0bbf3dc75cd8e/" },
    ],
  },
  contact: {
    headline: "Ready to Scale?",
    subheadline: "Tell us about your operational needs. We'll build a custom deployment plan and have your team ready to execute.",
    steps: [
      { title: "Discovery Call", description: "We analyze your workflows and identify the exact profiles you need." },
      { title: "Team Selection", description: "We vet, train, and present candidates that fit your VIBE." },
      { title: "Deployment", description: "Seamless integration into your tech stack. Immediate results." },
    ],
    email: "vibegloballyteam@gmail.com",
    phone: "+63 917 279 8754",
    address: "General Trias, Cavite, Philippines",
    submitButtonText: "Submit",
    successTitle: "Request Received",
    successMessage: "Our operations team will be in touch shortly to schedule your discovery call.",
  },
};

const ALLOWED_SECTIONS = ["hero", "services", "results", "tools", "clients", "values", "contact", "team", "faq", "privacy", "terms", "smtp"];

router.get("/content/:section", async (req, res) => {
  try {
    const { section } = req.params;
    if (!ALLOWED_SECTIONS.includes(section)) {
      return res.status(400).json({ error: "Unknown section" });
    }

    const row = await siteContentRepo.get(section);

    if (row) {
      return res.json({ section, content: row.content });
    }

    // If content doesn't exist in DB, seed it with DEFAULT_CONTENT
    const defaultContent = DEFAULT_CONTENT[section] ?? {};
    if (Object.keys(defaultContent).length > 0) {
      await siteContentRepo.upsert(section, defaultContent);
      return res.json({ section, content: defaultContent });
    }

    return res.json({ section, content: {} });
  } catch (err) {
    req.log.error({ err }, "Error fetching site content");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/content/:section", requireAuth, async (req, res) => {
  try {
    const { section } = req.params;
    if (!ALLOWED_SECTIONS.includes(section)) {
      return res.status(400).json({ error: "Unknown section" });
    }

    await siteContentRepo.upsert(section, req.body);

    return res.json({ section, content: req.body });
  } catch (err) {
    req.log.error({ err }, "Error updating site content");
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
