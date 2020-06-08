import { Injectable, EventEmitter } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { HubConnection, HubConnectionBuilder, HubConnectionState } from '@aspnet/signalr';


import { environment as env } from 'src/environments/environment';
import { User, Friend } from '../models/User';
import { Observable, Subject } from 'rxjs';
import { Message } from '../models/Message';
import { Room } from '../models/Room';

@Injectable({
  providedIn: 'root'
})
export class UserService {




  private user : Subject<User> = new Subject<User>();
  public user$ = this.user.asObservable();
  private notif = new Subject<string>();
  public notif$ = this.notif.asObservable();
  roomNavigation : EventEmitter<Room>;
  private rooms : Subject<Room[]> = new Subject<Room[]>();
  public rooms$ = this.rooms.asObservable();
  private room : Subject<Room> = new Subject<Room>();
  public room$ = this.room.asObservable();
    private goRoom : Subject<Room> = new Subject<Room>();
  public goRoom$ = this.goRoom.asObservable();
  private hubConnection : HubConnection;
  constructor(private http: HttpClient) {
    this.roomNavigation = new EventEmitter<Room>();





   }
   public async startConnection(id:number = null){
    this.hubConnection =  new HubConnectionBuilder().withUrl(env.hubUrl+'hubUsers')
    .build();
    await this.hubConnection.start();
    this.hubConnection.on('NavigationToRoom',(room:Room) => {
      this.goRoom.next(room);
    });
    this.hubConnection.on('Notify',(type:string) => {
      this.notif.next(type);
    });
    this.hubConnection.on('GetRooms',(rs:Room[]) => {
      this.rooms.next(rs);
    });
    this.hubConnection.on('UpdateRoom',(r:Room) => {
      this.room.next(r);
    });
    if(id != null){
      this.newUser(id);
    }
   }
   newUser(id: number){
     this.hubConnection.invoke('NewUser',id).catch(err => {
      console.log('Error while establishing connection... Retrying...');
      setTimeout(() => {
      }, 3000);
  });
   }
  updateUser(userId: number, user: User) {
    return this.http.put<User>(env.apiUrl+'api/users/'+userId,user);
  }
  getAllUsers(){
    return this.http.get<User[]>(env.apiUrl+'api/users');
  }
  getUserById(userId){
    let params = new HttpParams({fromObject:{
      userId: userId.toString()
    }});
    return this.http.get<User>(env.apiUrl+'api/users/id',{params: params});
  }
  sendFriendRequest(userId:number,friendId: number){
    let params = new HttpParams({fromObject:{
      userId: userId.toString(),
      friendId: friendId.toString()
    }});
    return this.http.get<User>(env.apiUrl+'api/users/request',{params: params});
  }
  requestFriendAction(userId:number,friendId:number,choice:number){
    let params = new HttpParams({fromObject:{
      userId: userId.toString(),
      friendId: friendId.toString(),
      choice:choice.toString()
    }});
    return this.http.get<User>(env.apiUrl+'api/users/request',{params: params});
  }
  registerNewUser(newUser: User){
    return this.http.post<User>(env.apiUrl+'api/users/register',newUser);
  }
  onReceiveNotification(event: EventEmitter<any>){
    this.hubConnection.on('ReceiveNotification',(t:string)=>{
      event.emit();
      this.notif.next(t);
    });
  }
  onReceiveNewMsg(msgStream : Subject<Message>){
    this.hubConnection.on('ReceiveMessage',(msg:Message)=>{
      msgStream.next(msg);
    });
  }
  sendMessage(msg:Message){
    this.hubConnection.invoke("SendMessage",msg);
  }
  sendNotification(type: string){
    this.hubConnection.invoke("Notify",type);
  }
  navigateToRoom(room : Room){
    this.hubConnection.invoke('NavigaToRoom',room);
  }

  createRoom(room: Room) {
    this.hubConnection.invoke('CreateRoom',room);
  }
  removeRoom(roomId: number) {
    this.hubConnection.invoke('RemoveRoom',roomId);
  }
  leaveRoom(user: User, roomId: number) {
    user.roomId = null;
    this.updateUser(user.userId,user).subscribe(res => {
      this.hubConnection.invoke('LeaveRoom',user.userId,roomId);
    })

  }
  joinRoom(user: User) {
    this.updateUser(user.userId,user).subscribe(res => {
      this.hubConnection.invoke('JoinRoom',user,user.roomId);
    })

  }
  getRooms() {
    if(this.hubConnection.state == HubConnectionState.Connected){
      this.hubConnection.invoke('RequestRooms');
    }
  }

}
