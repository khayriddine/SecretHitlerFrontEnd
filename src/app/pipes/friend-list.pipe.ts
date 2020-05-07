import { Pipe, PipeTransform } from '@angular/core';
import { Friend } from '../models/User';

@Pipe({
  name: 'friendList'
})
export class FriendListPipe implements PipeTransform {

  transform(allFriends: Friend[],choice:number): Friend[] {
    return allFriends.filter(f => f.relation == choice);
  }

}
