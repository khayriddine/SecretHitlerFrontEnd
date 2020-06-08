import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Player } from 'src/app/models/Player';
import { SecretRole } from 'src/app/models/Enumerations';

@Component({
  selector: 'app-choose-president-dialog',
  templateUrl: './choose-president-dialog.component.html',
  styleUrls: ['./choose-president-dialog.component.css']
})
export class ChoosePresidentDialogComponent{
  players :Player[] = [];
  chosen : Player;
  constructor(
    public dialogRef: MatDialogRef<ChoosePresidentDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {players:Player[]}) {
      this.players = data.players;
    }
    onNoClick(): void {
      this.dialogRef.close();
    }


}
