import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Card } from 'src/app/models/Card';

@Component({
  selector: 'app-peek-cards-dialog',
  templateUrl: './peek-cards-dialog.component.html',
  styleUrls: ['./peek-cards-dialog.component.css']
})
export class PeekCardsDialogComponent{
 cards : Card[] = [];
  constructor(
    public dialogRef: MatDialogRef<PeekCardsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {cards:Card[]}) {
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
