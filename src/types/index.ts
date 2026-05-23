export type User = {
  id: string;
  email: string;
  full_name: string;
  role: "freelancer" | "client" | "admin";
  created_at: string;
};

export type FreelancerProfile = {
  id: string;
  user_id: string;
  bio: string;
  category: string;
  location: string;
  avatar_url: string;
  is_vetted: boolean;
  rating: number;
};

export type FreelancerSkill = {
  id: string;
  freelancer_id: string;
  skill: string;
};

export type ServiceTier = {
  id: string;
  freelancer_id: string;
  name: string;
  price: number;
  description: string;
  type: "one_time" | "subscription";
};

export type Lead = {
  id: string;
  client_id: string;
  freelancer_id: string;
  description: string;
  budget_min: number;
  budget_max: number;
  timeline: string;
  status: string;
};

export type Booking = {
  id: string;
  lead_id: string;
  freelancer_id: string;
  client_id: string;
  scheduled_at: string;
  status: string;
};
