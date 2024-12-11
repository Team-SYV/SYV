export enum Role {
  User = 0,
  Bot = 1,
}

export type Message = {
  id: string;
  role: Role;
  content: string;
  loading?: boolean; 
  feedback?: boolean;
};