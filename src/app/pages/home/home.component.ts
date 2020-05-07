import { Component, OnInit, EventEmitter } from '@angular/core';
import { User, Friend } from 'src/app/models/User';
import { UserService } from 'src/app/services/user.service';
import { Observable, Subject } from 'rxjs';
import { Message } from 'src/app/models/Message';
import { Runner } from 'protractor';
import { Room } from 'src/app/models/Room';
import { RoomService } from 'src/app/services/room.service';
import { Router } from '@angular/router';
import { Player } from 'src/app/models/Player';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  user : User;
  users: User[];
  msgs: Message[];
  newRoom: Room;
  rooms: Room[];
  msgStream : Subject<Message>;
  userSubject: Subject<User>;
  notifEvent: EventEmitter<any>;
  constructor(private userServices: UserService,
    private roomServices: RoomService,
    private _router: Router) {
    this.users = [];
    this.rooms = [];
    this.newRoom = {
      name: '',
      adminId:0,
      numberOfPlayer: 2,
      usersJoining: []
    };
   }

  ngOnInit(): void {

    this.msgStream = new Subject<Message>();
    this.userSubject = new Subject<User>();
    this.notifEvent = new EventEmitter();
    this.notifEvent.subscribe(() => {
      this.usersUpToDate();
      this.roomsUpToDate();
    });
    this.usersUpToDate();
    this.roomsUpToDate();
    this.msgs = [];
    this.msgStream.subscribe(msg => {
      this.msgs.push(msg);
    });
    this.userSubject.subscribe(user => {
      this.user = user;
      sessionStorage.setItem('currentUser',JSON.stringify(user));
    })
    this.userServices.onReceiveNewMsg(this.msgStream);
    this.userServices.onReceiveNotification(this.notifEvent);
    this.userServices.roomNavigation.subscribe(room => {
      this.goToRoom(room);
    })
  }
  usersUpToDate(){
    this.user = JSON.parse(sessionStorage.getItem('currentUser'));
    if(this.user){

      this.userServices.getUserById(this.user.userId).subscribe(res => {
        this.userSubject.next(res);
      });
    }

    this.userServices.getAllUsers().subscribe(res => {
      this.users = res;
    });

  }

  roomsUpToDate(){
     this.roomServices.getAllRooms().subscribe(res => {
      this.rooms = res;
    })
  }

  sendMessage(content:string){
    let msg : Message = {
      user : this.user,
      content: content,
      to : null
    }
    this.userServices.sendMessage(msg);
  }
  friendRequest(friendId,action){
    this.userServices.requestFriendAction(this.user.userId,friendId,action).subscribe(res => {
      this.userSubject.next(res);
      this.userServices.sendNotification();
    });
  }
  isFriend(friendId:number){
    if(this.user != null){
      if(friendId == this.user.userId)
      return false;
    return this.user.friends.filter(f => f.userId == friendId).length > 0;
    }
    return false;
  }


  inRoom(room){

    if(this.user != null && room.usersJoining != null)
      {
        let b : boolean = false;
        room.usersJoining.forEach(user => {
          if(user.userId == this.user.userId){
            b =  true;
          }

        });
        return b;
      }
    return false;
  }
  isMyRoom(adminId){
    if(this.user != null)
      return this.user.userId == adminId;
    return false;
  }
  createRoom(){
    if(this.user != null)
    this.newRoom.adminId = this.user.userId;
    this.roomServices.createRoom(this.newRoom).subscribe(res => {
      res.usersJoining.push(this.user);
      this.roomServices.updateRoom(res).subscribe(res => {
        this.notifEvent.emit();
      });

    });
  }
  removeRoom(roomId){
    console.log(roomId);
    this.roomServices.deleteRoom(roomId).subscribe(res => {
      console.log(res);
      this.notifEvent.emit();
    })
  }
  leaveRoom(){
    if(this.user != null){
      this.user.roomId = null;
      this.userServices.updateUser(this.user.userId,this.user).subscribe(res => {
        console.log(res);
        this.notifEvent.emit();
      })
  }
  }
  joinRoom(room){
    if(this.user != null){
      this.user.roomId = room.roomId;
        this.userServices.updateUser(this.user.userId,this.user).subscribe(res => {
          console.log(res);
          this.notifEvent.emit();
        })
    }
  }
  play(room){
    this.userServices.navigateToRoom(room);
  }
  goToRoom(room){
    let player: Player = {
      userId: this.user.userId,
      name: this.user.name,
      connectionId: ''
    }
    sessionStorage.setItem('currentUser',JSON.stringify(this.user));
    sessionStorage.setItem('currentPlayer',JSON.stringify(player));
    sessionStorage.setItem('room',JSON.stringify(room));
    this._router.navigate(['room']);
  }
}
