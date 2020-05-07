import { Injectable } from '@angular/core';
import { HttpClient  } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';

import { User } from '../models/User';
import { environment as env } from './../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject : BehaviorSubject<User>;
  public currentUser : Observable<User>;

  constructor(private http: HttpClient) {
    this.currentUserSubject = new BehaviorSubject<User>(JSON.parse(sessionStorage.getItem('currentUser')));
    this.currentUser = this.currentUserSubject.asObservable();
  }
  login(name:string,password:string){
    return this.http.post<any>(env.apiUrl+ 'api/users/authenticate', {name:name,password:password})
    .pipe(map(user => {
      // store user details and jwt token in local storage to keep user logged in between page refreshes
      sessionStorage.setItem('currentUser',JSON.stringify(user));
      this.currentUserSubject.next(user);
      return user;
    }));
  }

  logout(){
    sessionStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
  }
}
