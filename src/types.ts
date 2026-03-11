import { Type } from "@google/genai";

export interface News {
  id: number;
  title: string;
  content: string;
  date: string;
  image_url: string;
  likes: number;
}

export interface SchoolEvent {
  id: number;
  title: string;
  description: string;
  date: string;
  image_url?: string;
}

export interface Evaluation {
  id: number;
  name: string;
  student: string;
  class: string;
  teaching_quality: number;
  communication: number;
  organization: number;
  security: number;
  pedagogical_activities: number;
  staff_service: number;
  comment: string;
  date: string;
}

export interface SchoolSettings {
  logo?: string;
  banner?: string;
  portal_name?: string;
  school_name?: string;
  slogan?: string;
  pix_key?: string;
  access_count?: string;
  school_video?: string;
  school_videos?: string;
}

export interface Sponsor {
  id: number;
  business_name: string;
  username?: string;
  password?: string;
  media_url?: string; // JSON string of [{url, type}]
  media_type?: string;
  parsed_media?: { url: string; type: 'image' | 'video' }[]; // Helper typed field after parsing
  ad_text?: string;
  active: number;
  subscription_start: string;
  subscription_duration_days: number;
  payment_proof_url?: string;
  payment_status: 'none' | 'pending' | 'approved';
  created_at: string;
}
