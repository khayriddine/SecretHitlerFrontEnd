import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { User } from 'src/app/models/User';
import { Room } from 'src/app/models/Room';
import { GameService } from 'src/app/services/game.service';
import { Player } from 'src/app/models/Player';
import { Game } from 'src/app/models/Game';
import { Subscription, Subject } from 'rxjs';
import { GameStatus, SecretRole } from 'src/app/models/Enumerations';
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
  cardsSub: Subject<Card[]> = new Subject<Card[]>();
  public subscription = new Subscription();
  constructor(
    private gameService: GameService,
    private rtcService: RtcService,
    public dialog: MatDialog,
    private notifSnackBar: MatSnackBar) { }

  ngOnInit(): void {
    this.currentPlayer = JSON.parse(sessionStorage.getItem('currentPlayer'));
    //console.log(this.currentPlayer);
    //get signal
    //this.rtcService.createPeer(this.currentPlayer);
    this.game = new Game();
    this.game.players.push(this.currentPlayer);
    this.room = JSON.parse(sessionStorage.getItem('room'));
      this.createStream(false);
    //console.log(this.game);
    this.cardsSub.subscribe((cards :Card[]) => {
      this.cards = cards;
    })

    this.gameService.startConnection(this.currentPlayer);
    //add subscriptions:
    this.subscription.add(this.gameService.player$.subscribe((player: Player) => {
      if(player.userId == this.currentPlayer.userId){
        this.currentPlayer.connectionId = player.connectionId;
      }else{
        if(!this.game.players.find(e=>e.userId == player.userId)){
          if(this.currentPlayer.userId == this.room.adminId){
            this.game.players.push(player);
            if(this.room.numberOfPlayer == this.game.players.length){
              this.game.status = GameStatus.Ready;
              this.game.startGame();
              this.prepare_tables();
              this.gameService.updateOtherplayers(this.game);
            }

          }
          this.gameService.sendPlayerInfos(this.currentPlayer,player.connectionId);
        }
      }

    }));
    this.subscription.add(this.gameService.receiveCards$.subscribe(obj => {
        if(obj.cards != null && obj.cards.length >=1){
          this.cards = obj.cards;
          this.chosenPlayer = obj.sender;
          this.openDiscardDialog(obj.cards,obj.sender);
        }

    }));

    this.subscription.add(this.gameService.receiveResponse$.subscribe(response => {
        this.finishTurn(response);
    }));

    this.subscription.add(this.gameService.gameUpdate$.subscribe((game : Game)=>{
      Object.assign(this.game,game);
      if(this.game!= null && this.game.status == GameStatus.Ready && this.game.numberOfRounds == 0)
      {
        this.currentPlayer = this.game.players.find(p => p.userId == this.currentPlayer.userId);
        this.prepare_tables();
        let cnxs = this.game.players.filter(p => p.userId == this.currentPlayer.userId && p.isDead == false).map(p => p.connectionId);
        this.gameService.notifyOtherPlayers(this.game.actualPlayer().name+"\'s turn",cnxs);
      }
      else if(this.game!= null && this.game.numberOfRounds >0){
        this.currentPlayer = this.game.players.find(p => p.userId == this.currentPlayer.userId);
        if(this.currentPlayer.isDead == true && this.game.actualPlayer().userId == this.currentPlayer.userId){
          this.nexTurn();
        }
        let cnxs = this.game.players.filter(p => p.userId == this.currentPlayer.userId && p.isDead == false).map(p => p.connectionId);
        this.gameService.notifyOtherPlayers(this.game.actualPlayer().name+"\'s turn",cnxs);

      }

    }));

    this.subscription.add(this.gameService.disconnection$.subscribe((player: Player) => {
      //console.log('disconnected player');
      //console.log(player);
    }));


    this.subscription.add(this.rtcService.onSignalToSend$.subscribe((data: PeerData) => {
      this.currentPlayer.signal = data.data;
      this.gameService.sendSignal(this.currentPlayer.signal,this.currentPlayer.userId);
    }));

    this.subscription.add(this.gameService.signal$.subscribe((signal: SignalInfo)=>{
      //console.log(signal);
      /*
      navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream)=>{
        this.rtcService.signalPeer(signal.userId, signal.signal, stream);
      });*/
      this.rtcService.signalPeer(signal.userId, signal.signal, this.stream);

    }));

    this.subscription.add(this.rtcService.onStream$.subscribe((data: PeerData) => {
      this.videoPlayer.nativeElement.srcObject = data.data;
      this.videoPlayer.nativeElement.load();
      this.videoPlayer.nativeElement.play();
    }));
    this.subscription.add(this.gameService.voteRequest$.subscribe((obj)=>{
      if(obj != null){
          this.openVoteDialog(obj.player,obj.sender);
      }
    }));
    this.subscription.add(this.gameService.vote$.subscribe((vote : Vote)=>{
      if(vote != null)
      {
        this.votes.push(vote);
        let nbreplayerAlive = this.game.players.filter(p => p.isDead == false).length;
        if(this.votes.length == nbreplayerAlive -1){
          this.votes.push({value:1,name:this.currentPlayer.name});
          this.openVotesResultsDialog(this.votes);


        }else{

        }
      }
    }));
    this.subscription.add(this.gameService.notification$.subscribe((notif :string)=>{
      this.openSnackBar(notif,'Dismiss');
    }));
  }
  test(){
    return 5;
  }
  c(){
    this.rtcService.createPeer(this.stream,this.currentPlayer.userId,true);
    /*
    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream)=>{
      this.rtcService.createPeer(stream,this.currentPlayer.userId,true);
    });*/
  }
  s(){

  }
  public async createStream(video:boolean = false): Promise<void> {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ video: video, audio: true });
      //console.log('ready');
    } catch (error) {
      console.error(`Can't join room, error ${error}`);
    }
  }
  start(){
  }
  playTurn(c_index:number,c_player:string){

    if(this.game.inHandCards.length == 3 && this.isMyTurn()) {
      this.game.discard(c_index);
      this.gameService.sendCards(this.game.inHandCards,c_player,this.currentPlayer.connectionId);
    }

    this.discardIndex = -1;
  }

  finishTurn(response : number){
    this.game.putCardOnTable(response);
    this.gameService.updateOtherplayers(this.game);
    if(this.game.nbreOfFascistCard() == 3 && this.game.nbreOfPeeks ==0){
      this.game.nbreOfPeeks=1;
      let cnxs = this.game.players.filter(p => p.userId == this.currentPlayer.userId && p.isDead == false).map(p => p.connectionId);
      this.gameService.notifyOtherPlayers(this.currentPlayer.name+"is using the peek power",cnxs);
      this.openPeekActionDialog(this.policyPeek());

    }
    else if(this.game.nbreOfFascistCard() == 4 && this.game.nbreOfKills ==0){
      let players : Player[] = this.game.players.filter(p => p.userId != this.currentPlayer.userId);
      let cnxs = this.game.players.filter(p => p.userId != this.currentPlayer.userId && p.isDead == false).map(p => p.connectionId);
      this.gameService.notifyOtherPlayers(this.currentPlayer.name+"is using the execution power",cnxs);
      if(this.game.nbreOfKills == null)
        this.game.nbreOfKills = 1
      else
        this.game.nbreOfKills = this.game.nbreOfKills+1;
      this.openKillMemberDialog(players);
    }
    else if(this.game.nbreOfFascistCard() == 5 && this.game.nbreOfKills == 1){
      this.game.nbreOfKills++;
      let players : Player[] = this.game.players.filter(p => p.userId != this.currentPlayer.userId && p.isDead == false);
      this.openKillMemberDialog(players);
    }
    else{
      this.nexTurn();
    }

  }
  nexTurn(){
    this.votes = [];
    this.game.numberOfRounds++;
    let next_player = this.game.players[this.game.numberOfRounds % (this.room.numberOfPlayer)];
    this.gameService.updateOtherplayers(this.game);

  }
  chooseCard(){
    this.gameService.sendResponse(this.discardIndex,this.chosenPlayer);
   this.cards = null;
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
    return !this.isMyTurn() || (this.isMyTurn() && this.game.inHandCards.length == 2);
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
          this.bot_table.push(box2h);
          this.bot_table.push({rowsRatio: '20%',class:'playBox',player:local_players[0]});
          this.bot_table.push(box2h);

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
          this.bot_table.push(box2h);
          this.bot_table.push({rowsRatio: '20%',class:'playBox',player:local_players[0]});
          this.bot_table.push(box2h);

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
          this.bot_table.push(box2h);
          this.bot_table.push({rowsRatio: '20%',class:'playBox',player:local_players[0]});
          this.bot_table.push(box2h);

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
  choosePlayer(player : Player){
    this.openDiscardDialog(this.game.inHandCards,player.connectionId);
  }
  onChancellorElected(player:Player){
    this.game.pickCards();
    this.openDiscardDialog(this.game.inHandCards,player.connectionId);
  }
  openVotesResultsDialog(votes:Vote[]){
    const dialogRef = this.dialog.open(VoteResultDialogComponent,{
      data:{votes:votes}
    });
    dialogRef.afterClosed().subscribe(() => {
      let cnxs = this.game.players.filter(p => p.userId == this.currentPlayer.userId && p.isDead == false).map(p => p.connectionId);

      if(this.votes.filter(v => v.value ==1).length > (this.votes.length/2))
      {
        this.onChancellorElected(this.requestedChancellor);
        this.game.electionFailTracker = 0;
      }
      else
      {
        this.game.incrementFailsTracker();
        this.gameService.notifyOtherPlayers('election fails:'+this.game.electionFailTracker,cnxs);
        if(this.game.electionFailTracker == 3){
          this.game.forcedCardOnTable();
          this.nexTurn();
        }else{
          this.nexTurn();
        }

      }
    });
  }
  openKillMemberDialog(players: Player[]){
    const dialogRef = this.dialog.open(KillMemberDialogComponent, {
      data : {players:players}
    });
    dialogRef.afterClosed().subscribe(deadId => {
      if(deadId != null){
        let p : Player = this.game.players.find(p => p.userId == deadId);
        p.isDead = true;
        this.nexTurn();
      }
    });
  }
  openPeekActionDialog(cards:Card[]){
    const dialogRef = this.dialog.open(PeekCardsDialogComponent,{
      data:{cards:cards}
    });
    dialogRef.afterClosed().subscribe(() => {
      this.nexTurn();
    });
  }
  openDiscardDialog(cards : Card[],choosePlayer:string): void {
    const dialogRef = this.dialog.open(DiscardDialogComponent, {
      data:{ cards: cards }
    });

    dialogRef.afterClosed().subscribe(result => {
      if(result != null){
        if(this.game != null && cards.length ==3){
          this.playTurn(result,choosePlayer);
        }else{
          this.gameService.sendResponse(result,choosePlayer);
        }
      }
    });
  }
  openVoteDialog(player:Player,receiver:string): void {
    const dialogRef = this.dialog.open(VoteDialogComponent, {
      data:{ player: player.name,
      president: this.game.actualPlayer().name }//player:string,president:string
    });

    dialogRef.afterClosed().subscribe(result => {
      let vote : Vote;
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

      this.gameService.voteReply(vote,receiver);
    });
  }
  onChancelorChosen(player: Player){
    if(this.game.players.find(p => p.userId == player.userId).isDead == true)
      this.openSnackBar("You can not pick "+player.name+" any more (Dead)","Dismiss");
      else{
        this.requestedChancellor = player;
        let pls = this.game.players.filter(p=>p.userId != this.currentPlayer.userId && p.isDead == false).map((p:Player)=>{
          return p.connectionId;
        });
        this.gameService.requestVote(player,pls);
      }

  }
  openSnackBar(message: string, action: string) {
    this.notifSnackBar.open(message, action, {
      duration: 2000,
    });
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
    if(this.currentPlayer != null && this.currentPlayer.secretRole == SecretRole.Fascist){
      this.showSecretRole = !this.showSecretRole;
    }
  }
}
