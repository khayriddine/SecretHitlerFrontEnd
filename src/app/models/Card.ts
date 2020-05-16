import { CardType } from './Enumerations';

export class Card{
  cardType: CardType;
  imagePath: string;
}

export interface DiscardCardDataDialog{
  cards: Card[];
  discarded: number;
}
