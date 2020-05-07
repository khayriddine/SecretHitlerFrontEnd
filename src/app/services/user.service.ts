import { Injectable, EventEmitter } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { HubConnection, HubConnectionBuilder } from '@aspnet/signalr';


import { environment as env } from 'src/environments/environment';
import { User, Friend } from '../models/User';
import { Observable, Subject } from 'rxjs';
import { Message } from '../models/Message';
import { Room } from '../models/Room';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  roomNavigation : EventEmitter<Room>;
  private hubConnection : HubConnection;
  constructor(private http: HttpClient) {
    this.roomNavigation = new EventEmitter<Room>();
    this.hubConnection =  new HubConnectionBuilder().withUrl(env.hubUrl+'hubUsers')
    .build();
    this.hubConnection.start();
    this.onNavigationToRoom();
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
    this.hubConnection.on('ReceiveNotification',()=>{
      event.emit();
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
  sendNotification(){
    this.hubConnection.invoke("Notify");
  }
  navigateToRoom(room : Room){
    console.log(room);
    this.hubConnection.invoke('NavigaToRoom',room);
  }
  onNavigationToRoom(){
    this.hubConnection.on('NavigationToRoom',(room : Room) => {
      this.roomNavigation.emit(room);
    })
  }
}
