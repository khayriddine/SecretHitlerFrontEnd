import { Card } from './Card';
import { Player } from './Player';
import { GameStatus, CardType, SecretRole } from './Enumerations';

export class Game{
  gameId? :number;
  status: GameStatus;
  electionFailTracker?:number;
  numberOfRounds: number;
  players: Player[];
  remainingCards: Card[];
  discardedCards: Card[];
  inHandCards: Card[];
  onTableCards: Card[];
  nbreOfPeeks: number;
  nbreOfKills: number;
  nbreOfInvestigation: number;
  constructor(){
    this.status = GameStatus.NotReady;
    this.numberOfRounds = 0;
    this.players = [];
    this.remainingCards = [];
    this.discardedCards = [];
    this.inHandCards = [];
    this.onTableCards = [];
    this.nbreOfKills = 0;
    this.nbreOfPeeks =0;
    this.nbreOfInvestigation = 0;
    this.newGameCards();
    this.shuffle(this.remainingCards);

  }
  startGame(){

    this.assignPlayers();
  }
  forcedCardOnTable(){
    if(this.remainingCards == null || this.remainingCards.length==0){
      this.resetCards();

    }
    this.onTableCards.push(this.remainingCards.pop());
  }
  incrementFailsTracker(){
    if(this.electionFailTracker == null)
    this.electionFailTracker = 0;
    this.electionFailTracker++;
  }
  assignPlayers(){
    let roles: SecretRole[];
   switch(this.players.length){
     case 4: {
      roles = [SecretRole.Hitler,SecretRole.Fascist,SecretRole.Liberal,SecretRole.Liberal];
      break;
     }
     case 5: {
      roles = [SecretRole.Hitler,SecretRole.Fascist,SecretRole.Liberal,SecretRole.Liberal,SecretRole.Liberal];
      break;
     }
     case 6: {
      roles = [SecretRole.Hitler,SecretRole.Fascist,SecretRole.Liberal,SecretRole.Liberal,SecretRole.Liberal,SecretRole.Liberal];
      break;
     }
     case 7: {
      roles = [SecretRole.Hitler,SecretRole.Fascist,SecretRole.Fascist,SecretRole.Liberal,SecretRole.Liberal,SecretRole.Liberal,SecretRole.Liberal];
      break;
     }
     case 8: {
      roles = [SecretRole.Hitler,SecretRole.Fascist,SecretRole.Fascist,SecretRole.Liberal,SecretRole.Liberal,SecretRole.Liberal,SecretRole.Liberal,SecretRole.Liberal];
      break;
     }
     case 9: {
      roles = [SecretRole.Hitler,SecretRole.Fascist,SecretRole.Fascist,SecretRole.Fascist,SecretRole.Liberal,SecretRole.Liberal,SecretRole.Liberal,SecretRole.Liberal,SecretRole.Liberal];
      break;
     }
     case 10: {
      roles = [SecretRole.Hitler,SecretRole.Fascist,SecretRole.Fascist,SecretRole.Fascist,SecretRole.Liberal,SecretRole.Liberal,SecretRole.Liberal,SecretRole.Liberal,SecretRole.Liberal,SecretRole.Liberal];
      break;
     }
   }
   this.shuffle(roles);
  this.players.forEach((p:Player,index:number) => {
    p.secretRole = roles[index];
  });
  }
  shuffleRoles(roles : SecretRole[]){

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
      {cardType: CardType.Liberal, imagePath:''},
    ];
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
    this.shuffle(this.remainingCards);
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
  nbreOfFascistCard(){
    return this.onTableCards.filter(c => c.cardType == CardType.Fascist).length;
  }
  nbreOfLiberalCard(){
    return this.onTableCards.filter(c => c.cardType == CardType.Liberal).length;
  }
  shuffle(array) {
    var currentIndex = array.length, temporaryValue, randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;

      // And swap it with the current element.
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }

    return array;
  }
}
