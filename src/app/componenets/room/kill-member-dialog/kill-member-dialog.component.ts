import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Player } from 'src/app/models/Player';

@Component({
  selector: 'app-kill-member-dialog',
  templateUrl: './kill-member-dialog.component.html',
  styleUrls: ['./kill-member-dialog.component.css']
})
export class KillMemberDialogComponent {
  players :Player[] = [];
  dead : Player;
  constructor(
    public dialogRef: MatDialogRef<KillMemberDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {players:Player[]}) {
      this.players = data.players;
    }
    onNoClick(): void {
      this.dialogRef.close();
    }
    playerPicture(player : Player){

    }
}
