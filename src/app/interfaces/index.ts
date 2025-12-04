export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: 'volunteer' | 'organization_admin' | 'admin';
  joinedDate: string;
  bio: string;
  skills: string[];
  location: string;
  password?: string; // Contraseña hasheada (opcional para compatibilidad con usuarios existentes)
}

export interface Organization {
  id: string;
  name: string;
  logo: string;
  description: string;
  website: string;
  email: string;
  phone: string;
  address: string;
  foundedYear: number;
  volunteerCount: number;
  rating: number;
  categories: string[];
  isVerified: boolean;
  socialMedia: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
  };
}

export interface Activity {
  id: string;
  title: string;
  description: string;
  image: string;
  organizationId: string;
  organizationName: string;
  organizationLogo: string;
  date: string;
  time: string;
  duration: string;
  location: string;
  maxVolunteers: number;
  currentVolunteers: number;
  likes: number;
  isLiked: boolean;
  status: 'active' | 'completed' | 'cancelled';
  category: string;
  tags: string[];
  requirements: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Publication {
  id: string;
  title: string;
  description: string;
  image: string;
  organizationId: string;
  likes: number;
  date: string;
  time: string;
  status: 'draft' | 'published' | 'archived';
  tags: string[];
  createdAt: string;
  updatedAt: string;
  // Propiedades legacy para compatibilidad
  caption?: string;
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderIcon: string;
  recipientId: string;
  content: string;
  timestamp: string;
  isRead: boolean;
  type: 'volunteer_inquiry' | 'activity_details' | 'confirmation' | 'thank_you' | 'general';
  senderOrganization?: string; // Nombre de la organización cuando el remitente es una organización
  // Propiedades legacy para compatibilidad
  sender?: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'new_activity' | 'new_message' | 'activity_confirmed' | 'activity_cancelled' | 'general';
  isRead: boolean;
  createdAt: string;
  actionUrl: string;
}

export interface VolunteerRegistration {
  id: string;
  userId: string;
  activityId: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  registeredAt: string;
  notes?: string;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  isActive: boolean;
}

// Legacy interfaces for backward compatibility
export interface CommunityActivity {
  id: string;
  organizationName: string;
  organizationLogo: string;
  image: string;
  description: string;
  likes: number;
  isLiked: boolean;
  date: string;
}

export interface DashboardTab {
  id: string;
  name: string;
  isActive: boolean;
}

export interface NewPublication {
  title: string;
  description: string;
  image: File | null;
  imagePreview: string | null;
  organizationId: string;
  tags: string[];
  isPublic: boolean;
  scheduledDate?: Date;
}

export interface PublicationFormData {
  title: string;
  description: string;
  image: File | null;
  organizationId: string;
  tags: string;
  isPublic: boolean;
  scheduledDate: string;
}

export interface Sender {
  name: string;
  icon: string;
  color: string;
}
