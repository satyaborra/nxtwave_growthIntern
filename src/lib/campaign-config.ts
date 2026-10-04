/**
 * Campaign constants shared by the API layer and the UI.
 * All values describe the SIMULATED demo campaign — never real results.
 */

export const CHANNEL_SPEND: Record<string, number> = {
  Instagram: 720,
  LinkedIn: 260,
};

export const CHANNEL_PLANNED_SPEND: Record<string, number> = {
  Instagram: 900,
  LinkedIn: 600,
};

export const PAID_CHANNELS = ["Instagram", "LinkedIn"];
export const ORGANIC_CHANNELS = ["WhatsApp Group", "College Club", "Friend Referral", "Email"];

export const BUDGET = {
  total: 2000,
  paidExperiment: 1500,
  contingency: 500,
};

export const TARGET_REGISTRATIONS = 500;
export const CAMPAIGN_DAYS = 7;

/** Base conversion used by the transparent campaign simulator (₹ per paid registration). */
export const PAID_CPA_ESTIMATE = 29;

export const CHANNEL_COLORS: Record<string, string> = {
  "WhatsApp Group": "#22c55e",
  "College Club": "#3b82f6",
  "Friend Referral": "#8b5cf6",
  Instagram: "#ec4899",
  LinkedIn: "#0ea5e9",
  Email: "#f59e0b",
  Other: "#64748b",
};

export const DEMO_LABEL = "Demo Campaign Data";

/** Colleges present in the seeded demo dataset (matches prisma/seed.ts). */
export const DEMO_COLLEGES = [
  "VIT Vellore",
  "SRM Institute of Science and Technology",
  "Anna University",
  "Amrita Vishwa Vidyapeetham",
  "CBIT Hyderabad",
  "PSG College of Technology",
  "BITS Pilani",
  "Manipal Institute of Technology",
  "KIIT Bhubaneswar",
  "VIT-AP Amaravati",
  "SSN College of Engineering",
  "Coimbatore Institute of Technology",
  "Andhra University College of Engineering",
  "JNTU Hyderabad",
  "Sri Vasavi Engineering College",
  "GVP College of Engineering",
  "BVRIT Hyderabad",
  "CVR College of Engineering",
  "VNR VJIET Hyderabad",
  "ANITS Visakhapatnam",
  "RVR & JC College of Engineering",
  "Gudlavalleru Engineering College",
  "Sree Vidyanikethan Engineering College",
  "SRKR Engineering College",
];
