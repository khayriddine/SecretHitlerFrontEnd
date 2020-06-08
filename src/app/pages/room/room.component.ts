import { Component, OnInit, ViewChild, ElementRef, Output, EventEmitter } from '@angular/core';
import { User } from 'src/app/models/User';
import { Room } from 'src/app/models/Room';
import { GameService } from 'src/app/services/game.service';
import { Player } from 'src/app/models/Player';
import { Game } from 'src/app/models/Game';
import { Subscription, Subject } from 'rxjs';
import { GameStatus, SecretRole, Power, WinType, TurnState } from 'src/app/models/Enumerations';
import { Card } from 'src/app/models/Card';
import { FormsModule } from '@angular/forms';
import { RtcService } from 'src/app/services/rtc.service';
import { PeerData } from 'src/app/models/PeerData';
import { SignalInfo } from 'src/app/models/SignalInfo';
import { MatDialog } from '@angular/material/dialog';
import { DiscardDialogComponent } from 'src/app/componenets/room/discard-dialog/discard-dialog.component';
import { VoteDialogComponent } from 'src/app/componenets/room/vote-dialog/vote-dialog.component';
import { Vote } from 'src/app/models/Vote';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PeekCardsDialogComponent } from 'src/app/componenets/room/peek-cards-dialog/peek-cards-dialog.component';
import { KillMemberDialogComponent } from 'src/app/componenets/room/kill-member-dialog/kill-member-dialog.component';
import { VoteResultDialogComponent } from 'src/app/componenets/room/vote-result-dialog/vote-result-dialog.component';
import { VictoryDialogComponent } from 'src/app/componenets/room/victory-dialog/victory-dialog.component';
import { NotificationService } from 'src/app/services/notification.service';
import { ChoosePresidentDialogComponent } from 'src/app/componenets/room/choose-president-dialog/choose-president-dialog.component';
import { InvestigatePlayerDialogComponent } from 'src/app/componenets/room/investigate-player-dialog/investigate-player-dialog.component';
import { Router } from '@angular/router';

export interface PlayerBox {
  rowsRatio: string;
  player?: Player;
  class?:string;

}

@Component({
  selector: 'app-room',
  templateUrl: './room.component.html',
  styleUrls: ['./room.component.css']
})
export class RoomComponent implements OnInit {
  items = Array.from({length: 1}).map((_, i) => `Item #${i}`);
  @ViewChild('videoPlayer', { static: false }) videoPlayer: ElementRef;
  currentPlayer: Player;
  myPlayer: Player;
  showSecretRole : boolean = false;
  mySecreteRole : boolean = false;
  count: number = 0;
  room : Room;
  game : Game;
  cards: Card[];
  chosenPlayer: string;
  discardIndex: number;
  stream:any;
  chancelorPos = {x: 0, y: 0};
  votes : Vote[] = [];
  requestedChancellor : Player;
  top_table: PlayerBox[] = [];
  bot_table: PlayerBox[] = [];
  left_table: PlayerBox[] = [];
  right_table: PlayerBox[] = [];
  playerBoxes : PlayerBox[] = [];
  lastPresident: number;
  wasPresident : boolean;
  cardsSub: Subject<Card[]> = new Subject<Card[]>();
  @Output() notifyEvent = new EventEmitter<string>();
  public subscription = new Subscription();
  constructor(
    private gameService: GameService,
    private rtcService: RtcService,
    public dialog: MatDialog,
    private notifSnackBar: MatSnackBar,
    private notifService: NotificationService,
    private _router: Router) { }


  ngOnInit(): void {

    this.game = new Game();
    this.room = JSON.parse(sessionStorage.getItem('room'));
    let _new = JSON.parse(sessionStorage.getItem('newGame'));
    console.log(_new);
    let user:User = JSON.parse(sessionStorage.getItem('currentUser'));
        if(user != null){
          let player: Player = {
            userId: user.userId,
            name: user.name,
            connectionId: '',
            isDead: false,
            profilePicture:user.imagePath,
            roomId : user.roomId,
            isDisconnected:false
          }
          this.currentPlayer = player;
          if(_new != null){

            this.gameService.startConnection(this.currentPlayer,this.room,_new);
            sessionStorage.removeItem('newGame');
        }else{
          this.gameService.startConnection(this.currentPlayer,this.room);
        }
      }else{
        this.notifService.pushNewNotification("You can not enter a room unless a game is started")
        this._router.navigate['home'];
      }
    this.subscription.add(this.gameService.gameUpdate$.subscribe((game : Game)=>{
      Object.assign(this.game,game);
      if(this.game != null  && this.game.actualPlayer() != null) {
        if(this.lastPresident == null){
          this.lastPresident = this.game.actualPlayer().userId;
        }
        else if(this.game.turnState == TurnState.SameTurn){
          this.lastPresident = this.game.actualPlayer().userId;
        }
      }


      console.log(this.game.numberOfRounds,':',this.game.actualPlayer().name);
      this.currentPlayer = this.game.players.find(p => p.userId == this.currentPlayer.userId);
      this.prepare_tables();

    }));
    this.subscription.add(this.gameService.gameResult$.subscribe((game : Game)=>{
      Object.assign(this.game,game);
      this.currentPlayer = this.game.players.find(p => p.userId == this.currentPlayer.userId);
      this.prepare_tables();
      let fascists = this.game.players.filter(p => p.secretRole != SecretRole.Liberal);
      switch(this.game.winType){
        case WinType.HitlerDead : this.openVictoryDialog("Liberal",fascists,"Hitler is Dead"); break;
        case WinType.LiberalFull : this.openVictoryDialog("Liberal",fascists,"Liberals placed 5 articles"); break;
        case WinType.HitlerSelected : this.openVictoryDialog("Fascist",fascists,"Hitler elected as chancellor"); break;
        case WinType.FascistFull : this.openVictoryDialog("Fascist",fascists,"Fascists placed 6 cards"); break;
      }


    }));
    this.subscription.add(this.gameService.notification$.subscribe((notif: string) => {
      this.notifService.pushNewNotification(notif);
    }));
    this.subscription.add(this.gameService.voteRequest$.subscribe((obj)=>{
      if(obj != null){
          this.openVoteDialog(obj.player);
      }
    }));
    this.subscription.add(this.gameService.voteResults$.subscribe((vs:Vote[])=>{
      this.openVotesResultsDialog(vs,this.currentPlayer.userId);
    }));
    this.subscription.add(this.gameService.receiveCards$.subscribe((cards:Card[]) => {
        this.openDiscardDialog(cards);
      }));
    this.subscription.add(this.gameService.power$.subscribe((power:Power) => {
      switch(power){
        case Power.Investigate : {
          let players = this.game.players.filter(p => p.userId != this.currentPlayer.userId && p.isDead == false);
          this.openInvestigationDialog(players);
        }break;
        case Power.Peek : {
          this.gameService.requestPeek(this.game.gameId,this.currentPlayer.connectionId);
        }break;
        case Power.Select : {
          this.openChoosePresidentDialog(this.game.players);
        }break;
        case Power.Kill : {
          let players = this.game.players.filter(p => p.userId != this.currentPlayer.userId && p.isDead == false);
          this.openKillMemberDialog(players);
        }break;
      }
    }));
    this.subscription.add(this.gameService.peek$.subscribe((cards:Card[]) => {
      this.openPeekActionDialog(cards);
    }));
      //peek
  }
  test(){
    return 5;
  }
  public async createStream(video:boolean = false): Promise<void> {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ video: video, audio: true });
      //console.log('ready');
    } catch (error) {
      console.error(`Can't join room, error ${error}`);
    }
  }



  isMyTurn(): boolean{
    if(this.game.players.length != this.room.numberOfPlayer)
      return false;
    if(this.game.players[this.game.numberOfRounds%this.room.numberOfPlayer].userId == this.currentPlayer.userId)
      return true;
    return false;
  }
  clickable(isPlayerDead):boolean{
    if(isPlayerDead == true)
    return true;
    if(this.currentPlayer == null || this.currentPlayer.isDead == true)
      return true;
      let b = !this.isMyTurn();
    return b;
  }
  //for display :

  prepare_tables(){
    if(this.game!= null){
      let local_players : Player[] = [];
      let cu_index : number = this.game.players.findIndex(p => p.userId == this.currentPlayer.userId);
      local_players = [...this.game.players.slice(cu_index),...this.game.players.slice(0,cu_index)];
      let box1h : PlayerBox = {
        rowsRatio: '20%',
        class:'emptyBpx'
      };
      let box2h : PlayerBox = {
        rowsRatio: '20%',
        class:'emptyBpx'
      };
      let box1v : PlayerBox = {
        rowsRatio: '30%',
        class:'emptyBpx'
      };
      this.bot_table = [];
      this.top_table = [];
      this.left_table = [];
      this.right_table = [];
      switch(this.room.numberOfPlayer){
        case 4 : {
          this.bot_table.push(box1h);
          this.bot_table.push(box1h);
          this.bot_table.push({rowsRatio: '20%',class:'playBox',player:local_players[0]});
          this.bot_table.push(box1h);
          this.bot_table.push(box1h);

          this.right_table.push(box1v);
          this.right_table.push({rowsRatio: '40%',class:'playBox',player:local_players[1]});
          this.right_table.push(box1v);

          this.top_table.push(box2h);
          this.top_table.push({rowsRatio: '20%',class:'playBox',player:local_players[2]});
          this.top_table.push(box2h);

          this.left_table.push(box1v);
          this.left_table.push({rowsRatio: '40%',class:'playBox',player:local_players[3]});
          this.left_table.push(box1v);
          break;
        }
        case 5:{
          this.bot_table.push(box1h);
          this.bot_table.push(box1h);
          this.bot_table.push({rowsRatio: '20%',class:'playBox',player:local_players[0]});
          this.bot_table.push(box1h);
          this.bot_table.push(box1h);

          this.right_table.push(box1v);
          this.right_table.push({rowsRatio: '40%',class:'playBox',player:local_players[1]});
          this.right_table.push(box1v);

          this.top_table.push(box1h);
          this.top_table.push({rowsRatio: '20%',class:'playBox',player:local_players[3]});
          this.top_table.push(box1h);
          this.top_table.push({rowsRatio: '20%',class:'playBox',player:local_players[2]});
          this.top_table.push(box1h);

          this.left_table.push(box1v);
          this.left_table.push({rowsRatio: '40%',class:'playBox',player:local_players[4]});
          this.left_table.push(box1v);
          break;
        }
        case 6:{
          this.bot_table.push(box1h);
          this.bot_table.push(box1h);
          this.bot_table.push({rowsRatio: '20%',class:'playBox',player:local_players[0]});
          this.bot_table.push(box1h);
          this.bot_table.push(box1h);

          this.right_table.push(box1v);
          this.right_table.push({rowsRatio: '40%',class:'playBox',player:local_players[1]});
          this.right_table.push(box1v);

          this.top_table.push({rowsRatio: '20%',class:'playBox',player:local_players[4]});
          this.top_table.push(box1h);
          this.top_table.push({rowsRatio: '20%',class:'playBox',player:local_players[3]});
          this.top_table.push(box1h);
          this.top_table.push({rowsRatio: '20%',class:'playBox',player:local_players[2]});

          this.left_table.push(box1v);
          this.left_table.push({rowsRatio: '40%',class:'playBox',player:local_players[5]});
          this.left_table.push(box1v);
          break;
        }
        case 7:{
          this.bot_table.push({rowsRatio: '20%',class:'playBox',player:local_players[6]});
          this.bot_table.push(box1h);
          this.bot_table.push({rowsRatio: '20%',class:'playBox',player:local_players[0]});
          this.bot_table.push(box1h);
          this.bot_table.push({rowsRatio: '20%',class:'playBox',player:local_players[1]});

          this.right_table.push(box1v);
          this.right_table.push({rowsRatio: '40%',class:'playBox',player:local_players[2]});
          this.right_table.push(box1v);

          this.top_table.push(box1h);
          this.top_table.push({rowsRatio: '20%',class:'playBox',player:local_players[4]});
          this.top_table.push(box1h);
          this.top_table.push({rowsRatio: '20%',class:'playBox',player:local_players[3]});
          this.top_table.push(box1h);

          this.left_table.push(box1v);
          this.left_table.push({rowsRatio: '40%',class:'playBox',player:local_players[5]});
          this.left_table.push(box1v);
          break;
        }
        case 8:{
          this.bot_table.push({rowsRatio: '20%',class:'playBox',player:local_players[7]});
          this.bot_table.push(box1h);
          this.bot_table.push({rowsRatio: '20%',class:'playBox',player:local_players[0]});
          this.bot_table.push(box1h);
          this.bot_table.push({rowsRatio: '20%',class:'playBox',player:local_players[1]});

          this.right_table.push(box1v);
          this.right_table.push({rowsRatio: '40%',class:'playBox',player:local_players[2]});
          this.right_table.push(box1v);

          this.top_table.push({rowsRatio: '20%',class:'playBox',player:local_players[5]});
          this.top_table.push(box1h);
          this.top_table.push({rowsRatio: '20%',class:'playBox',player:local_players[4]});
          this.top_table.push(box1h);
          this.top_table.push({rowsRatio: '20%',class:'playBox',player:local_players[3]});

          this.left_table.push(box1v);
          this.left_table.push({rowsRatio: '40%',class:'playBox',player:local_players[6]});
          this.left_table.push(box1v);
          break;
        }
        case 9:{
          this.bot_table.push({rowsRatio: '20%',class:'playBox',player:local_players[8]});
          this.bot_table.push(box1h);
          this.bot_table.push({rowsRatio: '20%',class:'playBox',player:local_players[0]});
          this.bot_table.push(box1h);
          this.bot_table.push({rowsRatio: '20%',class:'playBox',player:local_players[1]});

          this.right_table.push(box1v);
          this.right_table.push({rowsRatio: '40%',class:'playBox',player:local_players[2]});
          this.right_table.push(box1v);

          this.top_table.push({rowsRatio: '20%',class:'playBox',player:local_players[6]});
          this.top_table.push({rowsRatio: '20%',class:'playBox',player:local_players[5]});
          this.top_table.push(box1h);
          this.top_table.push({rowsRatio: '20%',class:'playBox',player:local_players[4]});
          this.top_table.push({rowsRatio: '20%',class:'playBox',player:local_players[3]});

          this.left_table.push(box1v);
          this.left_table.push({rowsRatio: '40%',class:'playBox',player:local_players[7]});
          this.left_table.push(box1v);
          break;
        }
        case 10:{
          this.bot_table.push({rowsRatio: '20%',class:'playBox',player:local_players[9]});
          this.bot_table.push(box1h);
          this.bot_table.push({rowsRatio: '20%',class:'playBox',player:local_players[0]});
          this.bot_table.push(box1h);
          this.bot_table.push({rowsRatio: '20%',class:'playBox',player:local_players[1]});

          this.right_table.push(box1v);
          this.right_table.push({rowsRatio: '40%',class:'playBox',player:local_players[2]});
          this.right_table.push(box1v);

          this.top_table.push({rowsRatio: '20%',class:'playBox',player:local_players[7]});
          this.top_table.push({rowsRatio: '20%',class:'playBox',player:local_players[6]});
          this.top_table.push({rowsRatio: '20%',class:'playBox',player:local_players[5]});
          this.top_table.push({rowsRatio: '20%',class:'playBox',player:local_players[4]});
          this.top_table.push({rowsRatio: '20%',class:'playBox',player:local_players[3]});

          this.left_table.push(box1v);
          this.left_table.push({rowsRatio: '40%',class:'playBox',player:local_players[8]});
          this.left_table.push(box1v);
          break;
        }
      }
    }
  }
  secretRoleImg(role : SecretRole){
    switch(role){
      case SecretRole.Hitler:
      return '/assets/images/hitler_secret_role.jpg';
      case SecretRole.Liberal:
      return '/assets/images/liberal_secret_role.jpg';
      case SecretRole.Fascist:
      return '/assets/images/fascist_secret_role.jpg';
    }
  }

  openVictoryDialog(winner: string,fascists:Player[],hint:string=null){
    const dialogRef = this.dialog.open(VictoryDialogComponent, {
      data : {winner:winner,fascists:fascists,hint:hint},
      disableClose: true
    });
    dialogRef.afterClosed().subscribe(() => {
        sessionStorage.setItem('reload',JSON.stringify(true));
      this._router.navigate['home'];
    });
  }
  openVotesResultsDialog(votes:Vote[],userId:number){
    const dialogRef = this.dialog.open(VoteResultDialogComponent,{
      data:{votes:votes}
    });
      dialogRef.afterClosed().subscribe(() => {
        if(this.currentPlayer.userId == this.game.actualPlayer().userId  && this.wasPresident == true && this.currentPlayer.isDead == false){

          if(votes.filter(v => v.value ==1).length > (votes.length/2))
          {
            this.wasPresident = false;
              this.gameService.pickCardsRequest(this.game.gameId);
              this.game.chancellorId = this.requestedChancellor.connectionId;
          }
          else{
            this.gameService.finishTurn(this.game.gameId);
          }
        }
      });

  }
  openKillMemberDialog(players: Player[]){
    const dialogRef = this.dialog.open(KillMemberDialogComponent, {
      data : {players:players},
      disableClose: true
    });
    dialogRef.afterClosed().subscribe(deadId => {
      if(deadId != null){
        this.gameService.killRequest(deadId,this.game.gameId);
      }
    });
  }
  openChoosePresidentDialog(players: Player[]){
    const dialogRef = this.dialog.open(ChoosePresidentDialogComponent, {
      data : {players:players},
      disableClose: true
    });
    dialogRef.afterClosed().subscribe(chosenId => {
      if(chosenId != null){
        this.gameService.selectPresidentRequest(chosenId,this.game.gameId);
      }
    });
  }
  openInvestigationDialog(players: Player[]){
    const dialogRef = this.dialog.open(InvestigatePlayerDialogComponent, {
      data : {players:players},
      disableClose: true
    });
    dialogRef.afterClosed().subscribe(chosenId => {
      if(chosenId != null){
        let p : Player = this.game.players.find(p => p.userId == chosenId);
        this.openSnackBar('The secret role of ' + p.name +': '+this.secretRole(p.secretRole),"Dismiss");
         this.gameService.finishTurn(this.game.gameId);
      }
    });
  }
  secretRole(secret : SecretRole){
    switch(secret){
      case SecretRole.Hitler : return 'Hitler';
      case SecretRole.Fascist : return 'Fascist';
      case SecretRole.Liberal : return 'Liberal';
    }
  }
  openPeekActionDialog(cards:Card[]){
    const dialogRef = this.dialog.open(PeekCardsDialogComponent,{
      data:{cards:cards},
      disableClose: true
    });
    dialogRef.afterClosed().subscribe(() => this.gameService.finishTurn(this.game.gameId));
  }
  openDiscardDialog(cards : Card[]): void {
    const dialogRef = this.dialog.open(DiscardDialogComponent, {
      data:{ cards: cards },
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if(result != null){
        if(this.game != null && cards.length ==3){
          this.gameService.presidentDiscard(result,this.game.gameId);
        }else{
          this.gameService.chancellorDiscard(result,this.game.gameId);
        }
      }
    });
  }
  openVoteDialog(player:Player): void {
    const dialogRef = this.dialog.open(VoteDialogComponent, {
      data:{
        player: player.name,
        president: this.game.actualPlayer().name ,
        isDead: this.currentPlayer.isDead
    },
    disableClose: true
    //player:string,president:string
    });
    this.lastPresident = this.currentPlayer.userId;
    dialogRef.afterClosed().subscribe(result => {
      let vote : Vote;
      if(this.currentPlayer.isDead == false){
        if(result != null){
          vote = {
            value :result.value,
            userId:this.currentPlayer.userId,
            name: this.currentPlayer.name
          };
        }
        else{
          vote = {
            value :0,
            userId:this.currentPlayer.userId,
            name: this.currentPlayer.name
          };
        }
        this.gameService.voteReply(vote,this.game.gameId);
      }


    });
  }
  onChancelorChosen(player: Player){
    if(this.game.players.find(p => p.userId == player.userId).isDead == true)
      this.openSnackBar("You can not pick "+player.name+" any more (Dead)","Dismiss");
    else if(this.game.chancellor != null && player.userId == this.game.chancellor.userId ){
      this.openSnackBar("You can not pick "+player.name+" (Last Chancellor)","Dismiss");
    }
    else if(this.game.remainingPlayers().length > 5 && player.userId == this.game.lastPresidentId() ){
      this.openSnackBar("You can not pick "+player.name+" (Last President)","Dismiss");
    }
    else{
      this.wasPresident = true;
      this.requestedChancellor = player;
      this.gameService.requestVote(player);
    }

  }
  openSnackBar(message: string, action: string,timeout: boolean = false) {
    if(timeout){
      this.notifSnackBar.open(message, action, {
        duration: 3000,
      });
    }
    else{

      this.notifSnackBar.open(message, action, {
      });
    }

  }
  investigateLoyaltyinvetigate(player:Player){
    return player.secretRole == SecretRole.Liberal;
  }

  policyPeek(){
    if(this.game.remainingCards.length < 3)
      this.game.resetCards();
      let l:number = this.game.remainingCards.length;
    return [this.game.remainingCards[l-3],this.game.remainingCards[l-2],this.game.remainingCards[l-1]]
  }

  toggleAvatar(dummy){
    if(this.currentPlayer != null && (this.currentPlayer.secretRole == SecretRole.Fascist || this.currentPlayer.isDead == true)){
      this.showSecretRole = !this.showSecretRole;
    }
  }
  showMyRole(){
    if(this.currentPlayer != null){
      this.mySecreteRole = !this.mySecreteRole;
    }
  }
}
