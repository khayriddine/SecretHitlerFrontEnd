import { Component, OnInit, Inject } from '@angular/core';
import { Player } from 'src/app/models/Player';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { SecretRole } from 'src/app/models/Enumerations';

@Component({
  selector: 'app-investigate-player-dialog',
  templateUrl: './investigate-player-dialog.component.html',
  styleUrls: ['./investigate-player-dialog.component.css']
})
export class InvestigatePlayerDialogComponent {
  players :Player[] = [];
  chosen : Player;
  constructor(
    public dialogRef: MatDialogRef<InvestigatePlayerDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {players:Player[]}) {
      this.players = data.players;
    }
    onNoClick(): void {
      this.dialogRef.close();
    }
}
