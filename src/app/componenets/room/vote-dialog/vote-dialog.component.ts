import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Player } from 'src/app/models/Player';
import { Vote } from 'src/app/models/Vote';

@Component({
  selector: 'app-vote-dialog',
  templateUrl: './vote-dialog.component.html',
  styleUrls: ['./vote-dialog.component.css']
})
export class VoteDialogComponent {
  chancellorCandidate: string;
  presidentName:string;
  possibleVotes: Vote[] = [
    {
      value:0,
      name:'unknown'
    },
    {
      value:1,
      name:'unknown'
    }
  ];
  myVote:Vote;
  constructor(
    public dialogRef: MatDialogRef<VoteDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {player:string,president:string}) {
      this.chancellorCandidate = data.player;
      this.presidentName = data.president;
      this.myVote = {
        value: 1,
        name:'unknown'
      };
    }
    onNoClick(): void {
      this.dialogRef.close();
    }
    votePicture(vote:Vote){
      switch(vote.value){
        case 0:
          return '/assets/images/no.jpg';
        case 1:
          return '/assets/images/yes.jpg';
      }
    }

}
