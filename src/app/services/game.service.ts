import { Injectable } from '@angular/core';
import { HubConnection, HubConnectionBuilder, HubConnectionState } from '@aspnet/signalr';
import { environment as env } from 'src/environments/environment';
import { Player } from '../models/Player';
import { Subject, Observable } from 'rxjs';
import { Card } from '../models/Card';
import { Game } from '../models/Game';
import { SignalInfo } from '../models/SignalInfo';
import { sign } from 'crypto';
import { Vote } from '../models/Vote';
import { Room } from '../models/Room';
import { Power } from '../models/Enumerations';


@Injectable({
  providedIn: 'root'
})
export class GameService {





  private hubConnection : HubConnection;
  private player = new Subject<Player>();
  public player$ = this.player.asObservable();
  private disconnection = new Subject<string>();
  public disconnection$ = this.disconnection.asObservable();
  private receiveCards = new Subject<Card[]>();
  public receiveCards$ = this.receiveCards.asObservable();
  private receiveResponse = new Subject<number>();
  public receiveResponse$ = this.receiveResponse.asObservable();
  private gameUpdate = new Subject<Game>();
  public gameUpdate$ = this.gameUpdate.asObservable();
  private gameResult = new Subject<Game>();
  public gameResult$ = this.gameResult.asObservable();
  private signal = new Subject<SignalInfo>();
  public signal$ = this.signal.asObservable();
  private voteRequest = new Subject<any>();
  public voteRequest$ = this.voteRequest.asObservable();
  private vote = new Subject<any>();
  public vote$ = this.vote.asObservable();
  private notification = new Subject<string>();
  public notification$ = this.notification.asObservable();
  private voteResults = new Subject<Vote[]>();
  public voteResults$ = this.voteResults.asObservable();
  private power = new Subject<Power>();
  public power$ = this.power.asObservable();
  private peek = new Subject<Card[]>();
  public peek$ = this.peek.asObservable();


  constructor() {

   }
   public async startGuestConnection(){
    this.hubConnection = new HubConnectionBuilder().withUrl(env.hubUrl+'hubGames')
    .build();
    await this.hubConnection.start();
   }
   clearGameCache(){
     if(this.hubConnection.state == HubConnectionState.Connected)
     this.hubConnection.invoke('ClearCache');
   }
  public async startConnection(currentPlayer: Player,room:Room = null,_new:boolean = false): Promise<void> {

    if(this.hubConnection != null && this.hubConnection.state == HubConnectionState.Connected){
      window.location.reload();
      return;
    }
    else{
      this.hubConnection = new HubConnectionBuilder().withUrl(env.hubUrl+'hubGames')
    .build();
    await this.hubConnection.start();
    }

    //console.log('Connection started');
    //console.log(currentPlayer);

    this.hubConnection.on('NewPlayerArrived', (p : Player) => {
      this.player.next(p);
    });

    this.hubConnection.on('OldPlayerInfos', (p: Player) => {
      this.player.next(p);
    });

    this.hubConnection.on('PlayerDisconnect', (p: string) => {
      this.disconnection.next(p);
    });

    this.hubConnection.on('ReceiveCards',(cards: Card[]) => {
      this.receiveCards.next(cards);
    });
    //

    this.hubConnection.on('ReceiveResponse',(response: number) => {
      this.receiveResponse.next(response);
    });
    this.hubConnection.on('GameUpdated',(game: Game) => {
      this.gameUpdate.next(game);
    });
    this.hubConnection.on('ReceiveSignal',(signal : SignalInfo) => {
      //console.log('receive signal');
      //console.log(signal);
      this.signal.next(signal);
    });
    this.hubConnection.on('ReceiveSignal_test',() => {
      //console.log('test signal');
    });

    this.hubConnection.on('ReceiveVoteRequest',(player:Player,sender:string) =>{
      this.voteRequest.next({player,sender});
    });
    this.hubConnection.on('ReceiveVote',(vote:Vote)=>{
      this.vote.next(vote);
    });
    this.hubConnection.on('ReceiveNotif',(notif:string) =>{
      this.notification.next(notif);
    });
    this.hubConnection.on('ReceiveVoteResults',(votes:Vote[])=>this.voteResults.next(votes));
    this.hubConnection.on('ExecutePower',(power :Power) => this.power.next(power));
    this.hubConnection.on('PeekCards',(cards :Card[]) => this.peek.next(cards));
    this.hubConnection.on('ReceiveGameResults',(game :Game) => this.gameResult.next(game));
    //game
    this.hubConnection.invoke('NewPlayer', currentPlayer, room,_new);
  }
  public sendPlayerInfos(player: Player, connectionId:string){
    this.hubConnection.invoke('InformNewPlayer',player,connectionId);
  }
  public sendCards(cards: Card[],receiver:string,sender:string){
    this.hubConnection.invoke('SendCards',cards,receiver,sender);
  }
  public sendResponse(response:number,receiver:string){
    this.hubConnection.invoke('SendResponse',response,receiver);
  }
  public nextTurn(game : Game,receiver:string){
    this.hubConnection.invoke('GoNextTurn',game,receiver);
  }
  public updateOtherplayers(game : Game){
    this.hubConnection.invoke('BroadcastGameStatus',game);
  }
  public sendSignal(signal: string, userId: number){
    let s: SignalInfo = {
      userId : userId,
      signal : signal
    };
    //console.log(s);
    this.hubConnection.invoke('SendSignal',s);
  }
  public requestVote(player: Player){
    this.hubConnection.invoke('SendVoteRequest',player);
  }
  public voteReply(vote:Vote,roomId:number){
    this.hubConnection.invoke('ReplyVoteRequest',vote,roomId);
  }
  public notifyOtherPlayers(notif: string,connections: string[]){
    this.hubConnection.invoke('Notify',notif,connections);
  }
  public broadcastVoteResult(votes:Vote[],connections:string[]){
    this.hubConnection.invoke('VoteResult',votes,connections);
  }
  public pickCardsRequest(gameId:number){
    this.hubConnection.invoke('PickCards',gameId);
  }
  chancellorDiscard(discarded: number, gameId: number) {
    this.hubConnection.invoke('ChancellorDiscard',discarded,gameId);
  }
  presidentDiscard(discarded: number, gameId: number) {
    this.hubConnection.invoke('PresidentDiscard',discarded,gameId);
  }
  requestPeek(gameId: number,cnx:string) {
    this.hubConnection.invoke('RequestPeek',gameId,cnx);
  }
  killRequest(deadId: number,gameId:number) {
    this.hubConnection.invoke('KillRequest',deadId,gameId);
  }
  selectPresidentRequest(chosenId: any, gameId: number) {
    this.hubConnection.invoke('SelectPresidentRequest',chosenId,gameId);
  }
  finishTurn(gameId:number): void {
    this.hubConnection.invoke('FinishTurn',gameId);
  }
}
