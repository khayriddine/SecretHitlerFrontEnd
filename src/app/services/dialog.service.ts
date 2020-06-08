import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ChooseIconDialogComponent } from '../componenets/dialogs/choose-icon-dialog/choose-icon-dialog.component';
import { ShowUserDialogComponent } from '../componenets/dialogs/show-user-dialog/show-user-dialog.component';
import { Player } from '../models/Player';

@Injectable({
  providedIn: 'root'
})
export class DialogService {

  constructor(public dialog:MatDialog) { }
  openIconDialaog(){
    const dialogRef = this.dialog.open(ChooseIconDialogComponent, {
      data:{ level : 0 },
      maxHeight:'50%',
      minWidth:'350px',
      maxWidth:'50%',
      position: { top: '50px' }
    });

    return dialogRef.afterClosed();
  }
  openShowPlayerDialaog(players: Player[]){
    const dialogRef = this.dialog.open(ShowUserDialogComponent, {
      data:{ players : players },
      maxHeight:'50%',
      minWidth:'350px',
      maxWidth:'50%',
      position: { top: '50px' }
    });

    return dialogRef.afterClosed();
  }
}
