export interface User {
  id: string;
  name: string;
  username: string;
  image?: { url: string };
  points: number;
  user_level: string;
  roles: string[];
}

export interface Session {
  id: string;
  status: 'PENDING' | 'ACCEPTED';
  participant1_id: string;
  participant1: User;
  participant2: User;
  initiatedByYou?: boolean;
}

export interface BlockedUser {
  sessionId: string;
  user: User;
  blockedAt: string;
}