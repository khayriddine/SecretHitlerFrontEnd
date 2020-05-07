import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import {HttpClientModule} from '@angular/common/http';

import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { AppComponent } from './app.component';
import { HomeComponent } from './pages/home/home.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { RoomComponent } from './pages/room/room.component';
import { HelpComponent } from './pages/help/help.component';
import { SettingsComponent } from './pages/settings/settings.component';
import { AuthComponent } from './pages/auth/auth.component';
import { HeaderComponent } from './componenets/layouts/header/header.component';
import { FooterComponent } from './componenets/layouts/footer/footer.component';


import { AppRoutingModule } from './app-routing.module';
import { FriendListPipe } from './pipes/friend-list.pipe';


@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    ProfileComponent,
    RoomComponent,
    HelpComponent,
    SettingsComponent,
    AuthComponent,
    HeaderComponent,
    FooterComponent,
    FriendListPipe
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
