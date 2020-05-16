import { Component } from '@angular/core';
import { User } from './models/User';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'SecretHitlerFrontEnd';
  user :User  = JSON.parse(sessionStorage.getItem('currentUser'));
  toggleStatus: boolean = false;


  toggleSideBar(event){
    this.toggleStatus = !this.toggleStatus && event;
  }
}
