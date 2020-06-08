import { Component, OnInit, Input } from '@angular/core';
import { Game } from 'src/app/models/Game';
import { GameService } from 'src/app/services/game.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.css']
})
export class TableComponent implements OnInit {
  items = Array.from({length: 1}).map((_, i) => `Item #${i}`);
  @Input() game:Game;
  subscriptions = new Subscription();
  constructor(private gameServie:GameService) { }

  ngOnInit(): void {
    this.subscriptions.add(this.gameServie.gameUpdate$.subscribe((g:Game)=>{
      Object.assign(this.game,g);
    }))
  }
  defineFascistClass(){//
    if(this.game == null)
      return'fascist-board';
      else
      return 'fascist-board' + this.game.nbreOfFascistCard().toString();
  }
  defineLiberalClass(){
    if(this.game == null)
      return'liberal-board';
      else
      return 'liberal-board' + this.game.nbreOfLiberalCard().toString();
  }

}
