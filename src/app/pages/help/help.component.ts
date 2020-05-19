import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { RtcService } from 'src/app/services/rtc.service';
import { Subscription } from 'rxjs';
import { PeerData } from 'src/app/models/PeerData';
import { GameService } from 'src/app/services/game.service';
import { SignalInfo } from 'src/app/models/SignalInfo';
import { Player } from 'src/app/models/Player';
import { User } from 'src/app/models/User';

@Component({
  selector: 'app-help',
  templateUrl: './help.component.html',
  styleUrls: ['./help.component.css']
})
export class HelpComponent implements OnInit {
  @ViewChild('videoPlayer', { static: false }) videoPlayer: ElementRef;
  public subscriptions = new Subscription();
  private stream;
  private player: Player;
  constructor(private rtcService: RtcService,
              private gameService: GameService) { }

  ngOnInit(): void {
    let user : User = JSON.parse(sessionStorage.getItem('currentUser'));
    this.player = {
      userId : user.userId,
      name : user.name,
      connectionId :'',
      isDead : false
    };
    this.gameService.startConnection(this.player);
    navigator.mediaDevices.getUserMedia({ video: (user.name == 'khayri'), audio: true }).then(stream => this.stream = stream);
    this.subscriptions.add(this.rtcService.onStream$.subscribe((data: PeerData) => {
      this.videoPlayer.nativeElement.srcObject = data.data;
      this.videoPlayer.nativeElement.load();
      this.videoPlayer.nativeElement.play();
    }));
    this.subscriptions.add(this.gameService.player$.subscribe((p : Player) => {
      if(this.player.userId == p.userId)
        this.player = p;
    }));
    this.subscriptions.add(this.gameService.signal$.subscribe((signalData: SignalInfo) => {
      this.rtcService.signalPeer(2, signalData.signal, this.stream);
    }));
    this.subscriptions.add(this.rtcService.onSignalToSend$.subscribe((data: PeerData) => {
      this.gameService.sendSignal(data.data, 1);
    }));



  }
   handleSuccess(stream) {
    this.videoPlayer.nativeElement.srcObject = stream;
    this.videoPlayer.nativeElement.load();
    this.videoPlayer.nativeElement.play();
  }
  async create(){

    const peer = this.rtcService.createPeer(this.stream, 1, true);
    this.rtcService.currentPeer = peer;
    /*
    .then(stream =>
      {
        //console.log(stream);
        //this.stream = stream;
        this.rtcService.createPeer(stream,'kh',true);
        //this.handleSuccess(stream);
      });*/

  }

}
