import { User } from './User';

export class Room{
  roomId?: number;
  adminId: number;
  name: string;
  numberOfPlayer: number;
  usersJoining: User[];
}
