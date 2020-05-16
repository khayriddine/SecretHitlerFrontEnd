import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { User } from 'src/app/models/User';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { UserService } from 'src/app/services/user.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {

  @Input() user: User;
  public subsceiptions = new Subscription();
  public isUserLoggedIn : boolean = false;
  @Output()
  public toggleMenu : EventEmitter<boolean> = new EventEmitter<boolean>();
  constructor(
    private _router: Router,
    private authService : AuthService,
    private userService : UserService
  ) { }

  ngOnInit(): void {
    this.subsceiptions.add(this.authService.currentUser.subscribe(u => {
      this.user = u;
    }))
  }

  goTo(r:string){
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

}
