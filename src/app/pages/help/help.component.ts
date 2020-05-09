import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { RtcService } from 'src/app/services/rtc.service';
import { Subscription } from 'rxjs';
import { PeerData } from 'src/app/models/PeerData';

@Component({
  selector: 'app-help',
  templateUrl: './help.component.html',
  styleUrls: ['./help.component.css']
})
export class HelpComponent implements OnInit {
  @ViewChild('videoPlayer', { static: false }) videoPlayer: ElementRef;
  public subscriptions = new Subscription();
  private stream;
  private pc: any;
  constructor(private rtcService: RtcService) { }

  ngOnInit(): void {
    this.subscriptions.add(this.rtcService.onStream$.subscribe((data: PeerData) => {
      this.videoPlayer.nativeElement.srcObject = data.data;
      this.videoPlayer.nativeElement.load();
      this.videoPlayer.nativeElement.play();
    }));






  }
   handleSuccess(stream) {
    this.videoPlayer.nativeElement.srcObject = stream;
    this.videoPlayer.nativeElement.load();
    this.videoPlayer.nativeElement.play();
  }
  async create(){
    this.stream = await navigator.mediaDevices.getUserMedia({ video: false, audio: true });
    this.rtcService.createPeer(this.stream,1,true);
    console.log(this.stream);/*
    .then(stream =>
      {
        //console.log(stream);
        //this.stream = stream;
        this.rtcService.createPeer(stream,'kh',true);
        //this.handleSuccess(stream);
      });*/

  }
}
