import { Component, OnInit } from '@angular/core';
import { User } from 'src/app/models/User';
import { Room } from 'src/app/models/Room';
import { GameService } from 'src/app/services/game.service';
import { Player } from 'src/app/models/Player';
import { Game } from 'src/app/models/Game';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-room',
  templateUrl: './room.component.html',
  styleUrls: ['./room.component.css']
})
export class RoomComponent implements OnInit {
  currentPlayer: Player;
  players: Player[] = [];
  room : Room;
  game : Game;
  public subscription = new Subscription();
  constructor(private gameService: GameService) { }

  ngOnInit(): void {
    this.currentPlayer = JSON.parse(sessionStorage.getItem('currentPlayer'));
    this.players.push(this.currentPlayer);
    this.room = JSON.parse(sessionStorage.getItem('room'));
    this.game = JSON.parse(sessionStorage.getItem('game'));

    this.gameService.startConnection(this.currentPlayer);
    //add subscriptions:
    this.subscription.add(this.gameService.player$.subscribe((player: Player) => {
      console.log(player);
      if(player.userId == this.currentPlayer.userId){
        this.currentPlayer.connectionId = player.connectionId;
        console.log(this.currentPlayer);
      }else{
        if(!this.players.find(e=>e.userId == player.userId)){
          this.players.push(player);

          console.log(this.players);
          console.log(this.currentPlayer);
          console.log(player.connectionId);
          this.gameService.sendPlayerInfos(this.currentPlayer,player.connectionId);
        }

      }

    }));
    this.subscription.add(this.gameService.disconnection$.subscribe((player: Player) => {
      console.log('disconnected player');
      console.log(player);
    }))

  }


}
