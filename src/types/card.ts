export type Suit = "hearts" | "diamonds" | "clubs" | "spades";

export interface Card {
  suit: Suit;
  rank: string;
  value: number;
}
