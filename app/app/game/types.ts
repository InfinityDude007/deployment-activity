export type Matcher = RegExp | ((cmd: string) => boolean);

export type TerminalStep = {
  objective: string;
  accept: Matcher[];
  /** Friendly errors for common mistakes, checked in order. */
  errors?: { when: Matcher; msg: string }[];
  output: string[];
  hints: string[];
};

type PuzzleBase = {
  id: string;
  title: string;
  prompt: string;
  points: number;
  /** Shown after solving: the lesson. */
  debrief: string;
  /** Optional read-only code shown above the puzzle. */
  context?: { label: string; code: string };
};

export type FillBlankPuzzle = PuzzleBase & {
  type: "fillblank";
  /** Code lines; blanks are written as [[id]]. */
  code: string[];
  blanks: Record<string, { options: string[]; answer: string }>;
  hints: string[];
};

export type TerminalPuzzle = PuzzleBase & {
  type: "terminal";
  prefix: string;
  files?: string[];
  intro?: string[];
  steps: TerminalStep[];
};

export type McqPuzzle = PuzzleBase & {
  type: "mcq";
  options: { text: string; correct?: boolean; why: string }[];
  hints: string[];
};

export type SpotBugPuzzle = PuzzleBase & {
  type: "spotbug";
  file: string;
  code: string[];
  /** line index -> explanation of the bug */
  bugs: Record<number, string>;
  hints: string[];
};

export type OrderPuzzle = PuzzleBase & {
  type: "order";
  /** Items in the correct order. */
  items: string[];
  /** Starting (shuffled) order, as indexes into items. */
  start: number[];
  hints: string[];
};

export type Puzzle =
  | FillBlankPuzzle
  | TerminalPuzzle
  | McqPuzzle
  | SpotBugPuzzle
  | OrderPuzzle;

export type Room = {
  id: string;
  name: string;
  topic: string;
  fragment: string;
  story: string;
  briefing: {
    lead: string;
    terms: { term: string; def: string }[];
    cheats?: { label: string; code: string }[];
    note?: string;
  };
  puzzles: Puzzle[];
};

export type PuzzleProps<P extends Puzzle> = {
  puzzle: P;
  solved: boolean;
  onWrong: (penalty?: number) => void;
  onHint: (cost: number) => void;
  onSolved: () => void;
};
