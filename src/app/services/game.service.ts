import { Injectable } from '@angular/core';
import { HubConnection, HubConnectionBuilder } from '@aspnet/signalr';
import { environment as env } from 'src/environments/environment';
import { Player } from '../models/Player';
import { Subject, Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class GameService {
  private hubConnection : HubConnection;
  private player = new Subject<Player>();
  public player$ = this.player.asObservable();
  private disconnection = new Subject<Player>();
  public disconnection$ = this.disconnection.asObservable();

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

    this.hubConnection.invoke('NewPlayer', currentPlayer);
  }
  public sendPlayerInfos(player: Player, connectionId:string){
    this.hubConnection.invoke('InformNewPlayer',player,connectionId);
  }

}
