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
import { TableComponent } from './componenets/room/table/table.component';
import { TopTableComponent } from './componenets/room/top-table/top-table.component';
import { BotTableComponent } from './componenets/room/bot-table/bot-table.component';
import { RightTableComponent } from './componenets/room/right-table/right-table.component';
import { LeftTableComponent } from './componenets/room/left-table/left-table.component';

import { AppRoutingModule } from './app-routing.module';
import { FriendListPipe } from './pipes/friend-list.pipe';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {MatSidenavModule} from '@angular/material/sidenav';
import { LayoutsModule } from './componenets/layouts/layouts.module';
import {MatTableModule} from '@angular/material/table';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import {MatBadgeModule} from '@angular/material/badge';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatSelectModule} from '@angular/material/select';
import {MatInputModule} from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import {MatGridListModule} from '@angular/material/grid-list';
import {DragDropModule} from '@angular/cdk/drag-drop';
import {MatDialogModule} from '@angular/material/dialog';
import { DiscardDialogComponent } from './componenets/room/discard-dialog/discard-dialog.component';
import {MatRadioModule} from '@angular/material/radio';
import { VoteDialogComponent } from './componenets/room/vote-dialog/vote-dialog.component';
import { PeekCardsDialogComponent } from './componenets/room/peek-cards-dialog/peek-cards-dialog.component';
import { KillMemberDialogComponent } from './componenets/room/kill-member-dialog/kill-member-dialog.component';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import {MatCardModule} from '@angular/material/card';
import { PlayerCardComponent } from './componenets/room/player-card/player-card.component';
import {ScrollingModule} from '@angular/cdk/scrolling';
import { VoteResultDialogComponent } from './componenets/room/vote-result-dialog/vote-result-dialog.component';
import {MatTabsModule} from '@angular/material/tabs';
@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    ProfileComponent,
    RoomComponent,
    HelpComponent,
    SettingsComponent,
    AuthComponent,
    FriendListPipe,
    TableComponent,
    TopTableComponent,
    BotTableComponent,
    RightTableComponent,
    LeftTableComponent,
    DiscardDialogComponent,
    VoteDialogComponent,
    PeekCardsDialogComponent,
    KillMemberDialogComponent,
    PlayerCardComponent,
    VoteResultDialogComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule,
    BrowserAnimationsModule,
    MatSidenavModule,
    LayoutsModule,
    MatTableModule,
    FlexLayoutModule,
    MatPaginatorModule,
    MatButtonModule,
    MatBadgeModule,
    MatIconModule,
    MatDialogModule,

    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatGridListModule,
    DragDropModule,
    MatRadioModule,
    MatSnackBarModule,
    MatCardModule,
    ScrollingModule,
    MatTabsModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
  entryComponents: [DiscardDialogComponent,VoteDialogComponent,KillMemberDialogComponent,PeekCardsDialogComponent,VoteResultDialogComponent]
})
export class AppModule { }
