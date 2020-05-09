import { Injectable } from '@angular/core';
import { Subject, BehaviorSubject, Observable } from 'rxjs';
import { PeerData } from '../models/PeerData';
import { Instance } from 'simple-peer';
import { UserInfo } from '../models/UserInfo';
import { Player } from '../models/Player';
declare var SimplePeer: any;
@Injectable({
  providedIn: 'root'
})
export class RtcService {
  private users: BehaviorSubject<Array<UserInfo>>;
  public users$: Observable<Array<UserInfo>>;

  private onSignalToSend = new Subject<PeerData>();
  public onSignalToSend$ = this.onSignalToSend.asObservable();

  private onStream = new Subject<PeerData>();
  public onStream$ = this.onStream.asObservable();

  private onConnect = new Subject<PeerData>();
  public onConnect$ = this.onConnect.asObservable();

  public currentPeer: Instance;
  constructor() {
    console.log('rtc');
    this.users = new BehaviorSubject([]);
    this.users$ = this.users.asObservable();
  }
  public createPeer(stream,userId: number,initiator:boolean): Instance{
    const peer = new SimplePeer({ stream,initiator,trickle:false  });

    //this.onStream.next({ id: userId, data:stream });
    peer.on('signal',data => {
      const stringData = JSON.stringify(data);
      this.onSignalToSend.next({ userId: userId, data: stringData });
    });
    peer.on('stream', data => {

      this.onStream.next({ userId: userId, data });
    });

    peer.on('connect', () => {
      this.onConnect.next({ userId: userId, data: null });
    });
    this.currentPeer = peer;
    return peer;
  }

  public signalPeer(userId: number, signal: string, stream: any) {

    const signalObject = JSON.parse(signal);
    console.log(signalObject);

    if (this.currentPeer) {
      console.log('exist:'+userId);
      this.currentPeer.signal(signalObject);
    } else {
      console.log('no exist:'+userId);
      this.currentPeer = this.createPeer(stream, userId, false);
      this.currentPeer.signal(signalObject);
    }
  }
  public newUser(user: UserInfo): void {
    this.users.next([...this.users.getValue(), user]);
  }

  public disconnectedUser(user: UserInfo): void {
    const filteredUsers = this.users.getValue().filter(x => x.connectionId === user.connectionId);
    this.users.next(filteredUsers);
  }
}
