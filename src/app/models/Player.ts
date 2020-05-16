import { SecretRole } from './Enumerations';

export class Player {
  userId: number;
  name: string;
  connectionId: string;
  signal?:any;
  profilePicture?:string;
  secretRole? :SecretRole;
}
