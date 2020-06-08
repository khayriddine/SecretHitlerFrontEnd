import { Room } from './Room';

export class User {
  userId? : number;
  name : string;
  email: string;
  password: string;
  imagePath: string;
  gender: number;
  status: number = 1;
  friends: Friend[];
  room?: Room;
  roomId?: number;
}

export class Friend {
  name: string;
  status: number;
  userId: number;
  relation: number;

}
