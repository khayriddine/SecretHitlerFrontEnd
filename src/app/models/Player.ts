import { SecretRole } from './Enumerations';

export class Player {
  userId: number;
  name: string;
  connectionId: string;
  signal?:any;
  roomId?:number;
  profilePicture?:string;
  secretRole? :SecretRole;
  isDead: boolean;
  isDisconnected:boolean;
}
