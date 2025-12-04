export interface Publication {
  id: string;
  image: string;
  caption: string;
  likes: number;
  date: string;
  time: string;
}

export interface DashboardTab {
  id: string;
  name: string;
  isActive: boolean;
}
