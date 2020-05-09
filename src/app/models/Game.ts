import { Card } from './Card';
import { Player } from './Player';
import { GameStatus, CardType } from './Enumerations';

export class Game{
  gameId? :number;
  status: GameStatus;
  numberOfRounds: number;
  players: Player[];
  remainingCards: Card[];
  discardedCards: Card[];
  inHandCards: Card[];
  onTableCards: Card[];
  constructor(){
    this.status = GameStatus.NotReady;
    this.numberOfRounds = 0;
    this.players = [];
    this.remainingCards = [];
    this.discardedCards = [];
    this.inHandCards = [];
    this.onTableCards = [];

    this.newGameCards();
  }

  newGameCards(){
    this.remainingCards = [
      {cardType: CardType.Fascist, imagePath:''},
      {cardType: CardType.Liberal, imagePath:''},
      {cardType: CardType.Liberal, imagePath:''},
      {cardType: CardType.Fascist, imagePath:''},
      {cardType: CardType.Liberal, imagePath:''},
      {cardType: CardType.Fascist, imagePath:''},
      {cardType: CardType.Fascist, imagePath:''},
      {cardType: CardType.Liberal, imagePath:''},
      {cardType: CardType.Liberal, imagePath:''},
      {cardType: CardType.Liberal, imagePath:''},
      {cardType: CardType.Liberal, imagePath:''},
      {cardType: CardType.Liberal, imagePath:''},
      {cardType: CardType.Fascist, imagePath:''},
      {cardType: CardType.Liberal, imagePath:''},
      {cardType: CardType.Liberal, imagePath:''},
      {cardType: CardType.Fascist, imagePath:''},
    ];
  }
  shuffleCards(){

  }
  discard(index: number){
    let card : Card = this.inHandCards[index];

    this.inHandCards.splice(index,1);
    this.discardedCards.push(card);
  }

  pickCards(){
    if(this.remainingCards.length < 2)
      this.resetCards();
    this.inHandCards.push(this.remainingCards.pop());
    this.inHandCards.push(this.remainingCards.pop());
    this.inHandCards.push(this.remainingCards.pop());
  }
  resetCards(){
    this.remainingCards.push(...this.discardedCards);
  }
  putCardOnTable(index: number){
    this.discard(index);
    this.onTableCards.push(this.inHandCards.pop());
  }
  actualPlayer():Player{
    return this.players[this.numberOfRounds%(this.players.length)];
  }
  copyValues(game: Game){
    this.gameId = game.gameId;
    this.status = game.status;
    this.numberOfRounds = game.numberOfRounds;
    this.players = game.players;
    this.remainingCards = game.remainingCards;
    this.discardedCards = game.discardedCards;
    this.inHandCards = game.inHandCards;
    this.onTableCards = game.onTableCards;
  }

}
