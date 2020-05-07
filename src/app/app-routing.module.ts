import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { AuthComponent } from './pages/auth/auth.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { SettingsComponent } from './pages/settings/settings.component';
import { RoomComponent } from './pages/room/room.component';
import { HelpComponent } from './pages/help/help.component';

const routes : Routes = [
  {
    path:'',
    component: HomeComponent
  },
  {
    path:'auth',
    component: AuthComponent
  },
  {
    path:'profile',
    component: ProfileComponent
  },
  {
    path:'settings',
    component: SettingsComponent
  },
  {
    path:'room',
    component: RoomComponent
  },
  {
    path: 'help',
    component: HelpComponent
  }
] ;

@NgModule({
  declarations: [],
  imports: [
    RouterModule.forRoot(routes)
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
