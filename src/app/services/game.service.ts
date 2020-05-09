import { Injectable } from '@angular/core';
import { HubConnection, HubConnectionBuilder } from '@aspnet/signalr';
import { environment as env } from 'src/environments/environment';
import { Player } from '../models/Player';
import { Subject, Observable } from 'rxjs';
import { Card } from '../models/Card';
import { Game } from '../models/Game';
import { SignalInfo } from '../models/SignalInfo';
import { sign } from 'crypto';


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


  constructor() { }
  public async startConnection(currentPlayer: Player): Promise<void> {

    this.hubConnection = new HubConnectionBuilder().withUrl(env.hubUrl+'hubGames')
    .build();
    await this.hubConnection.start();
    console.log('Connection started');

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
      this.signal.next(signal);
    })

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
  public sendSignal(signal: string, userId: number){
    let s: SignalInfo = {
      userId : userId,
      signal : signal
    };
    this.hubConnection.invoke('SendSignal',s);
  }

}
