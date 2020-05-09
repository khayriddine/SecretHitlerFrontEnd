import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { User } from 'src/app/models/User';
import { Room } from 'src/app/models/Room';
import { GameService } from 'src/app/services/game.service';
import { Player } from 'src/app/models/Player';
import { Game } from 'src/app/models/Game';
import { Subscription, Subject } from 'rxjs';
import { GameStatus } from 'src/app/models/Enumerations';
import { Card } from 'src/app/models/Card';
import { FormsModule } from '@angular/forms';
import { RtcService } from 'src/app/services/rtc.service';
import { PeerData } from 'src/app/models/PeerData';
import { SignalInfo } from 'src/app/models/SignalInfo';

@Component({
  selector: 'app-room',
  templateUrl: './room.component.html',
  styleUrls: ['./room.component.css']
})
export class RoomComponent implements OnInit {
  @ViewChild('videoPlayer', { static: false }) videoPlayer: ElementRef;
  currentPlayer: Player;
  room : Room;
  game : Game;
  cards: Card[];
  chosenPlayer: string;
  discardIndex: number;
  stream:any;

  cardsSub: Subject<Card[]> = new Subject<Card[]>();
  public subscription = new Subscription();
  constructor(
    private gameService: GameService,
    private rtcService: RtcService) { }

  ngOnInit(): void {
    this.currentPlayer = JSON.parse(sessionStorage.getItem('currentPlayer'));

    //get signal
    //this.rtcService.createPeer(this.currentPlayer);
    this.game = new Game();
    this.game.players.push(this.currentPlayer);
    this.room = JSON.parse(sessionStorage.getItem('room'));
      this.createStream(false);
    console.log(this.game);
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
            if(this.room.numberOfPlayer == this.game.players.length)
              this.game.status = GameStatus.Ready;
          }
          this.gameService.sendPlayerInfos(this.currentPlayer,player.connectionId);
        }
      }

    }));
    this.subscription.add(this.gameService.receiveCards$.subscribe(obj => {
        console.log('receive cards');
        console.log(obj);
        this.cards = obj.cards;
        this.chosenPlayer = obj.sender;
    }));

    this.subscription.add(this.gameService.receiveResponse$.subscribe(response => {
        this.finishTurn(response);
    }));

    this.subscription.add(this.gameService.gameUpdate$.subscribe((game : Game)=>{
      Object.assign(this.game,game);
      this.start();
    }));

    this.subscription.add(this.gameService.disconnection$.subscribe((player: Player) => {
      console.log('disconnected player');
      console.log(player);
    }));


    this.subscription.add(this.rtcService.onSignalToSend$.subscribe((data: PeerData) => {
      this.currentPlayer.signal = data.data;
      this.gameService.sendSignal(this.currentPlayer.signal,this.currentPlayer.userId);
    }));

    this.subscription.add(this.gameService.signal$.subscribe((signal: SignalInfo)=>{
      console.log(signal);
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
      console.log('ready');
    } catch (error) {
      console.error(`Can't join room, error ${error}`);
    }
  }
  start(){
    this.game.pickCards();
  }
  playTurn(){

    this.game.discard(this.discardIndex);
    this.gameService.sendCards(this.game.inHandCards,this.chosenPlayer,this.currentPlayer.connectionId);
    this.discardIndex = -1;
  }
  finishTurn(response : number){
    this.game.putCardOnTable(response);
    console.log(this.game.inHandCards);
    this.nexTurn();
  }
  nexTurn(){
    this.game.numberOfRounds++;
    let receiver = this.game.players[this.game.numberOfRounds % (this.room.numberOfPlayer)].connectionId;
    this.gameService.nextTurn(this.game,receiver)
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


}
