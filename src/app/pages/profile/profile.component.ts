import { Component, OnInit } from '@angular/core';
import { User } from 'src/app/models/User';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  user: User;
  constructor() { }

  ngOnInit(): void {
    this.user = JSON.parse(sessionStorage.getItem('currentUser'));
  }

}
