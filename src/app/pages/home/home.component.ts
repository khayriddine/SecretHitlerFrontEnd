import { Component, OnInit, EventEmitter, ViewChild } from '@angular/core';
import { User, Friend } from 'src/app/models/User';
import { UserService } from 'src/app/services/user.service';
import { Observable, Subject } from 'rxjs';
import { Message } from 'src/app/models/Message';
import { Runner } from 'protractor';
import { Room } from 'src/app/models/Room';
import { RoomService } from 'src/app/services/room.service';
import { Router, ActivationEnd } from '@angular/router';
import { Player } from 'src/app/models/Player';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';

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
  displayedUsersColumns: string[] = ['name', 'gender', 'status','action'];
  displayedRoomsColumns: string[] = ['name', 'admin', 'size','players','action'];
  usersDataSource = new MatTableDataSource<User>();
  roomsDataSource = new MatTableDataSource<Room>();
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
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
      this.usersDataSource.data = this.users;
      this.usersDataSource.paginator = this.paginator;
    });

  }
  test(event){
    console.log(event);
  }

  roomsUpToDate(){
     this.roomServices.getAllRooms().subscribe(res => {
      this.rooms = res;
      this.roomsDataSource.data = this.rooms;
      this.roomsDataSource.paginator = this.paginator;
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
      connectionId: '',
      profilePicture:'/assets/images/'+ (this.user.gender == 0 ? 'unknown_male.png':'unknown_female.png')
    }
    sessionStorage.setItem('currentUser',JSON.stringify(this.user));
    sessionStorage.setItem('currentPlayer',JSON.stringify(player));
    sessionStorage.setItem('room',JSON.stringify(room));
    this._router.navigate(['room']);
  }
  act(user : User){
    let r = this.whatRelationInNumber(user);
    switch(r){
      case 0 : this.friendRequest(user.userId,1);break;
      case 1 : this.friendRequest(user.userId,3);break;
      case 2 : this.friendRequest(user.userId,3);break;
      case 3 : this.friendRequest(user.userId,2);break;
      case 5 : this._router.navigate(['profile']);

    }
  }
  whatAction(element : User){
    switch(this.whatRelationInNumber(element)){
      case 0 : return 'Send Request';
      case 1 : return 'Unfriend';
      case 3 : return 'Accept';
      case 2 : return 'Abort Request';
      case 5 : return 'Show Profile';
    }
  }
  isUserInRoom(roomId : number){
    if(this.user != null){
      return this.user.roomId == roomId;
    }
  }
  whosAdmin(adminId : number){
    let usr : User;
    if(this.users != null){
      usr = this.users.find(u => u.userId == adminId);
      if(usr != null)
        return usr.name;
    }
    return '';
  }
  whatRelationInNumber(element: User){
    if(this.user.userId == element.userId)
      return 5;
    let friend = this.user.friends.find(fr => fr.userId == element.userId);
    if(friend != null){
      return friend.relation;
      }
      else
      return 0;
    }
    whatRelation(element: User){
      if(this.whatRelationInNumber(element) == 1){
        return 'Friend';
        }
        else
        return 'Not Friend';
      }
      actRoom(choice:string,room:Room){
        switch(choice){
          case 'Play' :
          this.play(room);break;
          case 'Remove':
            this.removeRoom(room.roomId);
            break;
          case 'Leave':
          this.leaveRoom();
          case 'Join':
            this.joinRoom(room);
            break;

        }
      }
      whatRoomAction(room: Room){
        let actions : string[] = [];
        if(this.user != null){
          if(room.adminId == this.user.userId){
            if(room.usersJoining!= null && room.usersJoining.length == room.numberOfPlayer)
              actions.push('Play');
              actions.push('Remove');
          }

          if(this.user.roomId == room.roomId)
          actions.push('Leave');
          if(this.user.roomId == null)
            actions.push('Join');
        }
        return actions;
      }

}
