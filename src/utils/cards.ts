import { Card, Suit } from "../types/card";

const suits: Suit[] = ["hearts", "diamonds", "clubs", "spades"];
const ranks: Array<{ rank: string; value: number }> = [
  { rank: "2", value: 2 },
  { rank: "3", value: 3 },
  { rank: "4", value: 4 },
  { rank: "5", value: 5 },
  { rank: "6", value: 6 },
  { rank: "7", value: 7 },
  { rank: "8", value: 8 },
  { rank: "9", value: 9 },
  { rank: "10", value: 10 },
  { rank: "J", value: 11 },
  { rank: "Q", value: 12 },
  { rank: "K", value: 13 },
  { rank: "A", value: 14 }
];

export function createDeck(): Card[] {
  const deck: Card[] = [];
  for (const suit of suits) {
    for (const entry of ranks) {
      deck.push({ suit, rank: entry.rank, value: entry.value });
    }
  }
  return deck;
}

export function shuffleDeck(cards: Card[]): Card[] {
  const copy = [...cards];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function splitDeck(deck: Card[]): { playerDeck: Card[]; computerDeck: Card[] } {
  return {
    playerDeck: deck.slice(0, 26),
    computerDeck: deck.slice(26)
  };
}
