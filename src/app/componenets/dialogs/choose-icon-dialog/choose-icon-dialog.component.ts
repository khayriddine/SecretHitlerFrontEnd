import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-choose-icon-dialog',
  templateUrl: './choose-icon-dialog.component.html',
  styleUrls: ['./choose-icon-dialog.component.css']
})
export class ChooseIconDialogComponent {
  chosenIcon:string;
  icons : string[] = [
    '/assets/images/icons/akuma.png',
    '/assets/images/icons/anonymou.png',
    '/assets/images/icons/battlefield-heroes.png',
    '/assets/images/icons/blanka.png',
    '/assets/images/icons/chu.png',
    '/assets/images/icons/classdojo.png',
    '/assets/images/icons/discord-emoji.png',
    '/assets/images/icons/female-teacher.png',
    '/assets/images/icons/joker-vector.png',
    '/assets/images/icons/kitten-avatar.png',
    '/assets/images/icons/mr-bean.png',
    '/assets/images/icons/panda.png',
    '/assets/images/icons/plants.png',
    '/assets/images/icons/pogchamp.png',
    '/assets/images/icons/pomeranian.png',
    '/assets/images/icons/saga-water.png',
    '/assets/images/icons/tec-male.png',
    '/assets/images/icons/thundercats.png',
    '/assets/images/icons/youtube-cat.png',

  ]
  constructor(
    public dialogRef: MatDialogRef<ChooseIconDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {level:number}) {
    }

  onNoClick(): void {
    this.dialogRef.close();
  }
}
