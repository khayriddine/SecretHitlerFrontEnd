import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Player } from 'src/app/models/Player';
import { SecretRole } from 'src/app/models/Enumerations';

@Component({
  selector: 'app-player-card',
  templateUrl: './player-card.component.html',
  styleUrls: ['./player-card.component.css']
})
export class PlayerCardComponent implements OnInit {

  @Input() player : Player;
  @Input() showSecretRole : boolean;
  @Input() mine : boolean;
  @Input() dis: boolean;
  @Input() isPresident: boolean = true;
  @Output() avatarBtnClicked : EventEmitter<Player> = new EventEmitter<Player>();
  constructor() { }

  ngOnInit(): void {
  }

  imgToShow(){

    if(this.player == null){
      return '/assets/images/avatar.png';
    }
    else {
      if(this.showSecretRole == true || this.mine == true){
        switch(this.player.secretRole){
          case SecretRole.Liberal :
            return '/assets/images/liberal_secret_role.png';
          case SecretRole.Fascist :
            return '/assets/images/fascist_secret_role.png';
          case SecretRole.Hitler :
            return '/assets/images/hitler_secret_role.png';
        }
      }
      else if(this.player.profilePicture != null && this.player.profilePicture != ''){
        return this.player.profilePicture;
      }
      else {
        return '/assets/images/avatar.png';
      }
    }
  }
  nameToDisplay(){
    if(this.player == null)
      return 'unknown';
    else
      return this.player.name;
  }
  emitBtnEvent(){
    this.avatarBtnClicked.emit(this.player);
  }
}
