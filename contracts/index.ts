export interface User {
  id: number;
  email: string;
  name: string;
  role: 'talent' | 'client' | 'admin';
  avatar: string | null;
  createdAt: Date | null;
}

export interface Talent {
  id: number;
  userId: number;
  name: string;
  bio: string;
  category: string;
  skills: string[];
  portfolio: string[];
  avatar: string;
  location: string;
  rate: string;
  featured: boolean;
  createdAt: Date | null;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  icon: string;
}

export interface Booking {
  id: number;
  clientId: number;
  talentId: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  eventDate: Date | null;
  notes: string;
  createdAt: Date | null;
}

export interface RegisterInput {
  email: string;
  password: string;
  name: string;
  role: 'talent' | 'client';
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface TalentListInput {
  search?: string;
  category?: string;
  page?: number;
  limit?: number;
}

export interface TalentListResponse {
  talents: Talent[];
  total: number;
  pages: number;
}

export interface CreateTalentInput {
  name: string;
  bio: string;
  category: string;
  skills: string[];
  location: string;
  rate: string;
  avatar?: string;
}

export interface UpdateTalentInput {
  id: number;
  name?: string;
  bio?: string;
  category?: string;
  skills?: string[];
  location?: string;
  rate?: string;
  avatar?: string;
}

export interface ToggleFeaturedInput {
  id: number;
}

export interface ByIdInput {
  id: number;
}

export interface PresignedUrlInput {
  key: string;
  contentType: string;
}

export interface PresignedUrlResponse {
  url: string;
}
