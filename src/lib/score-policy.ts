export type PublicScoreSummary = {
  rank: number | null;
  playerName: string;
  total: number;
};

export type GolfScoreData = {
  front9: number;
  back9: number;
  total: number;
  par?: number;
  notes?: string;
};

export function toPublicScoreSummary(input: {
  rank: number | null;
  playerName: string;
  scoreData: GolfScoreData;
}): PublicScoreSummary {
  return {
    rank: input.rank,
    playerName: input.playerName,
    total: input.scoreData.total
  };
}
