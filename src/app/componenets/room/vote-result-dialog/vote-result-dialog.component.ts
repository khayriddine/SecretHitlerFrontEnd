import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Vote } from 'src/app/models/Vote';

@Component({
  selector: 'app-vote-result-dialog',
  templateUrl: './vote-result-dialog.component.html',
  styleUrls: ['./vote-result-dialog.component.css']
})
export class VoteResultDialogComponent {
  result: boolean;
  constructor(
    public dialogRef: MatDialogRef<VoteResultDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {votes:Vote[]}) {
      this.result = this.data.votes.filter(v => v.value ==1).length > (this.data.votes.length/2);
    }

    onNoClick(): void {
      this.dialogRef.close();
    }
}
