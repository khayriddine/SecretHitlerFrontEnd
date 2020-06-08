import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Player } from 'src/app/models/Player';
import { SecretRole } from 'src/app/models/Enumerations';

@Component({
  selector: 'app-victory-dialog',
  templateUrl: './victory-dialog.component.html',
  styleUrls: ['./victory-dialog.component.css']
})
export class VictoryDialogComponent {

  constructor(
    public dialogRef: MatDialogRef<VictoryDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {winner:string,fascists:Player[],hint:string}) {
    }
    onNoClick(): void {
      this.dialogRef.close();
    }

}
