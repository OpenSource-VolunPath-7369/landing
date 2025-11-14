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

export interface Organization {
  id: string;
  name: string;
  logo: string;
}
