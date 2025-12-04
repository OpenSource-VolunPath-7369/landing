export interface Message {
  id: string;
  sender: string;
  senderIcon: string;
  content: string;
  timestamp: Date;
  isRead: boolean;
}

export interface Sender {
  name: string;
  icon: string;
  color: string;
}

