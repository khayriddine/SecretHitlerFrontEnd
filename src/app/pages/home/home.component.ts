import { Component, OnInit, EventEmitter, ViewChild } from '@angular/core';
import { User, Friend } from 'src/app/models/User';
import { UserService } from 'src/app/services/user.service';
import { Observable, Subject, Subscription } from 'rxjs';
import { Message } from 'src/app/models/Message';
import { Runner } from 'protractor';
import { Room } from 'src/app/models/Room';
import { RoomService } from 'src/app/services/room.service';
import { Router, ActivationEnd } from '@angular/router';
import { Player } from 'src/app/models/Player';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { DialogService } from 'src/app/services/dialog.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  buttonNameToDisable:string = '';
  user : User;
  users: User[];
  msgs: Message[];
  newRoom: Room;
  rooms: Room[];
  msgStream : Subject<Message>;
  userSubject: Subject<User>;
  subscriptions = new Subscription();
  displayedUsersColumns: string[] = ['name', 'gender', 'status','action'];
  displayedRoomsColumns: string[] = ['name', 'admin', 'size','players','action'];
  usersDataSource = new MatTableDataSource<User>();
  roomsDataSource:MatTableDataSource<Room>;

  @ViewChild('usersTablePaginator', {static: true}) usersPaginator: MatPaginator;
  @ViewChild('roomsTablePaginator', {static: true}) roomsPaginator: MatPaginator;
  constructor(private userServices: UserService,
    private roomServices: RoomService,
    private _router: Router,
    private dialogService:DialogService) {
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
    let r = JSON.parse(sessionStorage.getItem('reload'));
    if(r!=null)
      {
        sessionStorage.removeItem('reload');
        window.location.reload();
      }
    this.userSubject = new Subject<User>();

    this.usersUpToDate();
    this.msgs = [];
    this.userSubject.subscribe(user => {
      this.user = user;
      sessionStorage.setItem('currentUser',JSON.stringify(user));
      //this.userServices.newUser(this.user.userId);
    });
    this.userServices.onReceiveNewMsg(this.msgStream);
    this.subscriptions.add(this.userServices.goRoom$.subscribe((r:Room)=> {
      this.goToRoom(r);
    }));
    this.subscriptions.add(this.userServices.room$.subscribe((r:Room) =>{
      this.buttonNameToDisable ='';
      if(this.rooms != null){
        let ind = this.rooms.findIndex(ro => ro.roomId == r.roomId );
      if(ind == -1)
        this.rooms.push(r);
      else
        this.rooms[ind] = r;
        this.roomsDataSource=  new MatTableDataSource<Room>(this.rooms);
        this.roomsDataSource.data = this.rooms;
        this.roomsDataSource.paginator = this.roomsPaginator;
      }


    }));
    this.subscriptions.add(this.userServices.rooms$.subscribe((rs:Room[]) => {
      if(rs != null){

        this.rooms = rs;
      this.roomsDataSource=  new MatTableDataSource<Room>(this.rooms);
      this.roomsDataSource.paginator = this.roomsPaginator;
      this.buttonNameToDisable = '';
      }

    }));
  }
  usersUpToDate(){
    this.user = JSON.parse(sessionStorage.getItem('currentUser'));
    if(this.user){
      this.userServices.startConnection(this.user.userId);
      //this.userServices.newUser(this.user.userId);
      this.userServices.getUserById(this.user.userId).subscribe(res => {
        this.userSubject.next(res);
        console.log(1);
      });
    }
    else{
      this.userServices.startConnection();
      console.log(0);
    }
    this.userServices.getAllUsers().subscribe(res => {
      this.users = res;
      this.usersDataSource.data = this.users;
      this.usersDataSource.paginator = this.usersPaginator;
    });

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
      this.userServices.sendNotification('users');
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
    this.buttonNameToDisable = 'createRoom';
    if(this.user != null)
    this.newRoom.adminId = this.user.userId;
    this.userServices.createRoom(this.newRoom);
  }
  removeRoom(roomId){
    this.userServices.removeRoom(roomId);
  }
  leaveRoom(room){
    if(this.user != null){
      this.userServices.leaveRoom(this.user,room.roomId);
  }
  }
  refreshRooms(){
    this.userServices.getRooms();
  }
  joinRoom(room){
    if(this.user != null){
      if(room.usersJoining != null){
        if(room.usersJoining.filter(u => u.userId == this.user.userId).length == 0){
          this.user.roomId = room.roomId;
          this.userServices.joinRoom(this.user);
        }
      }
      else{
        this.user.roomId = room.roomId;
        this.userServices.joinRoom(this.user);
      }

    }
  }
  play(room){

    this.userServices.navigateToRoom(room);
    console.log(room);
  }
  goToRoom(room){

    sessionStorage.setItem('currentUser',JSON.stringify(this.user));
    sessionStorage.setItem('room',JSON.stringify(room));
    sessionStorage.setItem('newGame',JSON.stringify(true));
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
          this.leaveRoom(room);
          break;
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
          actions.push('Join');
        }
        return actions;
      }

      isbuttonDisabled(btn:string){
        if(btn == this.buttonNameToDisable)
         return true;
         else
         return false;
      }

      showPlayers(players:Player[]){
        this.dialogService.openShowPlayerDialaog(players);
      }


}
