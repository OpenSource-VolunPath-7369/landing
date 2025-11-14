export interface Notification {
  id: string;
  icon: string;
  iconType: 'image' | 'fontawesome' | 'text';
  title: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
  type: 'message' | 'task' | 'invitation' | 'general';
}
