import { Component } from '@angular/core';
import { User } from './models/User';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'SecretHitlerFrontEnd';
  isMobileResolution: boolean;
  user :User  = JSON.parse(sessionStorage.getItem('currentUser'));
  toggleStatus: boolean = false;
  constructor(){
    if(window.innerWidth <= 768)
    {
      this.isMobileResolution = true;
    }
    else{
      this.isMobileResolution = false;
    }
  }

  toggleSideBar(event){
    this.toggleStatus = !this.toggleStatus && event;
  }
}
