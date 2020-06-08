import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Player } from 'src/app/models/Player';

@Component({
  selector: 'app-show-user-dialog',
  templateUrl: './show-user-dialog.component.html',
  styleUrls: ['./show-user-dialog.component.css']
})
export class ShowUserDialogComponent {

  constructor(
    public dialogRef: MatDialogRef<ShowUserDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {players:Player[]}) {
    }

  onNoClick(): void {
    this.dialogRef.close();
  }
}
