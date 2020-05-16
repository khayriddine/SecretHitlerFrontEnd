import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DiscardCardDataDialog, Card } from 'src/app/models/Card';

@Component({
  selector: 'app-discard-dialog',
  templateUrl: './discard-dialog.component.html',
  styleUrls: ['./discard-dialog.component.css']
})
export class DiscardDialogComponent  {
  cards : Card[] = [];
  chosenCard : number;
  favoriteSeason: string;
  seasons: string[] = ['Winter', 'Spring', 'Summer', 'Autumn'];
  constructor(
    public dialogRef: MatDialogRef<DiscardDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DiscardCardDataDialog) {
      this.cards = data.cards;
    }

  onNoClick(): void {
    this.dialogRef.close();
  }
  cardPicture(cardType : number){
    switch(cardType){
      case 1:
        return'/assets/images/fascist_card.png';
      case 0:
        return'/assets/images/liberal_card.png';
    }
  }

}
