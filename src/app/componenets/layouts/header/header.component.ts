import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { User } from 'src/app/models/User';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { UserService } from 'src/app/services/user.service';
import { Subscription } from 'rxjs';
import { NotificationService } from 'src/app/services/notification.service';
import { GameService } from 'src/app/services/game.service';
import { Player } from 'src/app/models/Player';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {

  @Input() user: User;
  public subsceiptions = new Subscription();
  public isUserLoggedIn : boolean = false;
  players : Player[] = [];
  notifs : string[] = [];
  @Output()
  public toggleMenu : EventEmitter<boolean> = new EventEmitter<boolean>();
  constructor(
    private _router: Router,
    private authService : AuthService,
    private userService : UserService,
    private notifService: NotificationService
  ) { }

  ngOnInit(): void {

    this.players = JSON.parse(sessionStorage.getItem('players'));
    this.subsceiptions.add(this.authService.currentUser.subscribe(u => {
      this.user = u;
    }));
    this.subsceiptions.add(this.notifService.notif$.subscribe( content => {
      this.notifs.push(content);
    }))
  }

  goTo(r:string){
    if(r == '')
    sessionStorage.setItem('reload',JSON.stringify(true));
    this._router.navigate([r]);
  }

  logOut(){
    this.authService.logout();
    this.toggleSideBar();
    this.goTo('');
  }
  toggleSideBar(){
    this.toggleMenu.emit(this.user != null);
  }
  refresh(): void {
    window.location.reload();
}

}
