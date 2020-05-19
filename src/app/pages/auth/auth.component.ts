import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import  {Router, ActivatedRoute } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { first } from 'rxjs/operators';
import { User } from 'src/app/models/User';
import { UserService } from 'src/app/services/user.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css']
})
export class AuthComponent implements OnInit {
  newUser : User = {
    name: '',
    password: '',
    gender: 0,
    friends: null,
    email: '',
    imagePath: '',
    status: 1
  };
  buttonNameToDisable:string = '';
  loginForm : FormGroup;
  loading = false;
  submitted = false;
  returnUrl: string;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private userService: UserService,
    private notifSnackBar: MatSnackBar) {
      if (this.authService.currentUser) {
        //this.router.navigate(['/']);
    }
    }

  ngOnInit(): void {
    this.loginForm = this.formBuilder.group({
      name: ['', Validators.required],
      password: ['', Validators.required]
  });

  this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
  }
  // convenience getter for easy access to form fields
  get f() { return this.loginForm.controls; }
  onSubmit() {
    this.submitted = true;
    // stop here if form is invalid
    if (this.loginForm.invalid) {
        return;
    }

    this.loading = true;
    this.authService.login(this.f.name.value, this.f.password.value)
        .pipe(first())
        .subscribe(
            data => {
                this.router.navigate([this.returnUrl]);
                this.loading = true;
            },
            error => {
                this.loading = false;
            });
  }
  onLogOut(){
    this.authService.logout();
  }
  onRegister(){
    this.buttonNameToDisable = 'onRegister';
    this.userService.registerNewUser(this.newUser).subscribe(res => {
      this.buttonNameToDisable = '';
      this.openSnackBar('Succesfull registeration Now you can log In','Dismiss');

    })

  }
  resetRegistration(){
    this.newUser = {
      name: '',
      password: '',
      gender: 0,
      friends: null,
      email: '',
      imagePath: '',
      status: 1
    };

  }
  isbuttonDisabled(btn : string){
    if(btn == this.buttonNameToDisable)
    return true;
    else
    return false;
  }
  openSnackBar(message: string, action: string) {
    this.notifSnackBar.open(message, action, {
      duration: 2000,
    });
  }
}


