import { Injectable } from '@angular/core';
import { HubConnection, HubConnectionBuilder } from '@aspnet/signalr';
import { environment as env } from 'src/environments/environment';
import { Subject, Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notif = new Subject<string>();
  public notif$ = this.notif.asObservable();
  constructor() {
  }

  pushNewNotification(content: string){
    this.notif.next(content);
  }

}
