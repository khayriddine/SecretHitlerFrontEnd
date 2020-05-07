import { User } from './User';

export class Message{
  messageId? : number;
  content: string;
  user: User;
  to: User[];
}
