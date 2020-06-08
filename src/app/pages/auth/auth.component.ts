import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import  {Router, ActivatedRoute } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { first } from 'rxjs/operators';
import { User } from 'src/app/models/User';
import { UserService } from 'src/app/services/user.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { ChooseIconDialogComponent } from 'src/app/componenets/dialogs/choose-icon-dialog/choose-icon-dialog.component';
import { Gender } from 'src/app/models/Enumerations';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css']
})
export class AuthComponent implements OnInit {
  dummy: any;
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
    private notifSnackBar: MatSnackBar,
    public dialog : MatDialog) {
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
    if(this.newUser.imagePath == ''){
      if(this.newUser.gender == Gender.Female){
        this.newUser.imagePath = '/assets/images/unknown_female.png';
      }
      else{
        this.newUser.imagePath = '/assets/images/unknown_male.png';
      }
    }
    this.userService.registerNewUser(this.newUser).subscribe(res => {
      this.buttonNameToDisable = '';
      this.resetRegistration();
      this.openSnackBar('Succesfull registeration Now you can log In','Dismiss');


    });

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
  openIconDialaog(){
    const dialogRef = this.dialog.open(ChooseIconDialogComponent, {
      data:{ level : 0 },
      maxHeight:'50%',
      minWidth:'350px',
      maxWidth:'50%',
      position: { top: '50px' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if(result != null)
      this.newUser.imagePath =result;
    });
  }
}


