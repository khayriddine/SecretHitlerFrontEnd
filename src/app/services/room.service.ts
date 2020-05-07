import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Room } from '../models/Room';
import { environment as env} from 'src/environments/environment';
import { HubConnection } from '@aspnet/signalr';
import { User } from '../models/User';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RoomService {
  private hubConnection : HubConnection;

  constructor(private http: HttpClient) { }
  //http
  deleteRoom(roomId: any) {
    return this.http.delete<Room>(env.apiUrl+'api/rooms/'+roomId);
  }
  getAllRooms() {
    return this.http.get<Room[]>(env.apiUrl+'api/rooms');
  }


  createRoom(room:Room){
    return this.http.post<Room>(env.apiUrl+'api/rooms',room);
  }
  updateRoom(room:Room){
    return this.http.put<Room>(env.apiUrl+'api/rooms/'+room.roomId,room);
  }


  //hub

}
