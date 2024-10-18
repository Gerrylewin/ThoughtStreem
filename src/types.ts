export interface Thought {
  id: string;
  content: string;
  author: string;
  initialLifespan: number;
  createdAt: number;
  likes: number;
  dislikes: number;
  expired?: boolean;
}