export interface Project {
  index: string;
  short: string;
  category: string;
  title: string;
  description: string;
  tags: string[];
  github: string;
  live?: string;
  caseStudy?: boolean;
  proof?: string;
  liveLabel?: string;
}

export const projects: Project[] = [
  {
    index: "01",
    short: "PAYNOW–UPI",
    category: "FINTECH RESEARCH",
    title: "PayNow–UPI SME Financial Efficiency",
    description:
      "Research dashboard for an IBR study on cross-border real-time digital payments — how the PayNow–UPI linkage moves the needle for SME financial efficiency across Singapore and India.",
    tags: ["Research", "Fintech", "Dashboard"],
    proof: "Singapore–India corridor · secondary data + regression analysis",
    github: "https://github.com/parineetaajain29/paynow-upi-dashboard",
    live: "https://paynow-upi-dashboard.streamlit.app",
  },
  {
    index: "02",
    short: "SAHARASOIL",
    category: "INVESTOR MODEL",
    title: "Saharasoil — 360° Investor Dashboard",
    description:
      "A live, formula-driven investor dashboard for a B2B biochar startup pitch — every chart recalculates from the underlying model as sliders move, from TAM/SAM/SOM to unit economics and the risk register.",
    tags: ["Financial Modelling", "Pitch", "Unit Economics"],
    proof: "Formula-driven model · TAM/SAM/SOM, unit economics, risk register",
    github: "https://github.com/parineetaajain29/saharasoil",
    live: "https://saharasoil.streamlit.app/",
  },
  {
    index: "03",
    short: "GLOWGREEN",
    category: "ANALYTICS",
    title: "GlowGreen Dashboard",
    description:
      "An interactive analytics dashboard built around the GlowGreen dataset, turning a static workbook into something explorable.",
    tags: ["Data Viz", "Analytics", "Dashboard"],
    github: "https://github.com/parineetaajain29/glowgreen-dashboard",
    live: "https://glowgreen-dashboard-nvdm8rhaqgbj3d8xtgivb9.streamlit.app/",
  },
  {
    index: "04",
    short: "ATTRITION",
    category: "PEOPLE ANALYTICS",
    title: "Employee Attrition Intelligence Suite",
    description:
      "A full-spectrum attrition dashboard layering descriptive, diagnostic, predictive, and prescriptive analysis — from KPI breakdowns to risk scoring and an impact-vs-cost intervention matrix.",
    tags: ["Quantitative Analysis", "HR Analytics", "Risk Scoring"],
    proof: "Descriptive → prescriptive analysis · risk scoring",
    github: "https://github.com/parineetaajain29/EA_MGB_1",
  },
  {
    index: "05",
    short: "GRANDIOSE",
    category: "COST & OPS",
    title: "Grandiose Bakery Dashboard",
    description:
      "A cost-optimization and performance tracker for a bakery operation — live KPI sparklines, scenario planning for supply disruption and inflation, and a self-service employee performance portal.",
    tags: ["Cost Optimisation", "Scenario Planning", "KPIs"],
    proof: "Group industry project with Grandiose Supermarket · cost and operations trends",
    github: "https://github.com/parineetaajain29/GrandioseSupermarket-",
    live: "https://grandiosesupermarket3.streamlit.app",
  },
  {
    index: "06",
    short: "AVAL",
    category: "EMBEDDED FINANCE",
    title: "Aval — Credit That Settles Itself",
    description:
      "Group pitch for FinTech Shark Tank: embedded working-capital credit for SMEs, offered inside the B2B marketplaces they already sell on. Aval is the technology and origination layer on a licensed balance-sheet partner, repaid at source when the buyer pays. Conceived and pitched by me with my group; open the full view for the model and a live prototype.",
    tags: ["Embedded Finance", "Credit Pricing", "Pitch", "Prototype"],
    proof: "FinTech Shark Tank · embedded working-capital credit for UAE SMEs",
    github: "",
    caseStudy: true,
  },
  {
    index: "07",
    short: "UNIVERSE",
    category: "EDTECH",
    title: "Study Universe",
    description:
      "A study platform where students upload notes and diagrams per subject to build a personal universe. AI turns them into mock exams, MCQs and flashcard memory games, with progress tracked per subject, a map to travel between subjects, and real-time revision duels in friends' universes. Built with Claude.",
    tags: ["Product", "EdTech", "AI", "Built with Claude"],
    proof: "Self-initiated build · Google sign-in · AI study packs from uploaded notes",
    github: "",
    live: "https://study-universe-one.vercel.app",
    liveLabel: "Open live site",
  },
];

export const contact = {
  email: "parineetaa.jain@gmail.com",
  linkedin: "https://www.linkedin.com/in/parineeta-jain292002",
  github: "https://github.com/parineetaajain29",
  resume: "/resume.pdf",
};
