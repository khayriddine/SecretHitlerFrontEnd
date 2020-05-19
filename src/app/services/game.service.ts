import { Injectable } from '@angular/core';
import { HubConnection, HubConnectionBuilder } from '@aspnet/signalr';
import { environment as env } from 'src/environments/environment';
import { Player } from '../models/Player';
import { Subject, Observable } from 'rxjs';
import { Card } from '../models/Card';
import { Game } from '../models/Game';
import { SignalInfo } from '../models/SignalInfo';
import { sign } from 'crypto';
import { Vote } from '../models/Vote';


@Injectable({
  providedIn: 'root'
})
export class GameService {
  private hubConnection : HubConnection;
  private player = new Subject<Player>();
  public player$ = this.player.asObservable();
  private disconnection = new Subject<Player>();
  public disconnection$ = this.disconnection.asObservable();
  private receiveCards = new Subject<any>();
  public receiveCards$ = this.receiveCards.asObservable();
  private receiveResponse = new Subject<number>();
  public receiveResponse$ = this.receiveResponse.asObservable();
  private gameUpdate = new Subject<Game>();
  public gameUpdate$ = this.gameUpdate.asObservable();
  private signal = new Subject<SignalInfo>();
  public signal$ = this.signal.asObservable();
  private voteRequest = new Subject<any>();
  public voteRequest$ = this.voteRequest.asObservable();
  private vote = new Subject<any>();
  public vote$ = this.vote.asObservable();
  private notification = new Subject<string>();
  public notification$ = this.notification.asObservable();


  constructor() {

   }
  public async startConnection(currentPlayer: Player): Promise<void> {

    this.hubConnection = new HubConnectionBuilder().withUrl(env.hubUrl+'hubGames')
    .build();
    await this.hubConnection.start();
    //console.log('Connection started');
    //console.log(currentPlayer);

    this.hubConnection.on('NewPlayerArrived', (p : Player) => {
      this.player.next(p);
    });

    this.hubConnection.on('OldPlayerInfos', (p: Player) => {
      this.player.next(p);
    });

    this.hubConnection.on('PlayerDisconnect', (p: Player) => {
      this.disconnection.next(p);
    });

    this.hubConnection.on('ReceiveCards',(cards: Card[],sender:string) => {
      this.receiveCards.next({cards,sender});
    })
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
    this.hubConnection.on('GameStatusUpdated',(game : Game) => {
      this.gameUpdate.next(game);
    });
    this.hubConnection.on('ReceiveVoteRequest',(player:Player,sender:string) =>{
      this.voteRequest.next({player,sender});
    });
    this.hubConnection.on('ReceiveVote',(vote:Vote)=>{
      this.vote.next(vote);
    });
    this.hubConnection.on('ReceiveNotif',(notif:string) =>{
      this.notification.next(notif);
    })
    //BroadcastGameStatus
    this.hubConnection.invoke('NewPlayer', currentPlayer);
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
  public requestVote(player: Player,players:string[]){
    this.hubConnection.invoke('SendVoteRequest',player,players);
  }
  public voteReply(vote:Vote,receiver:string){
    this.hubConnection.invoke('ReplyVoteRequest',vote,receiver);
  }
  public notifyOtherPlayers(notif: string,connections: string[]){
    this.hubConnection.invoke('Notify',notif,connections);
  }
}
