export const GOLF_HOLE_COUNT = 18;

export const DEFAULT_GOLF_HOLE_PARS = [4, 4, 3, 4, 5, 4, 4, 3, 5, 4, 4, 3, 5, 4, 4, 3, 4, 5];

export type GolfHoleScore = {
  hole: number;
  par: number;
  score: number | null;
  toPar: number | null;
  scoreName: string | null;
};

export type GolfRoundSummary = {
  holeScores: GolfHoleScore[];
  front9: number;
  back9: number;
  total: number;
  frontPar: number;
  backPar: number;
  par: number;
  toPar: number;
};

export function normalizeHolePars(value: unknown): number[] {
  const rawPars =
    Array.isArray(value)
      ? value
      : value && typeof value === "object" && !Array.isArray(value) && Array.isArray((value as { holePars?: unknown }).holePars)
        ? (value as { holePars: unknown[] }).holePars
        : DEFAULT_GOLF_HOLE_PARS;

  const pars = Array.from({ length: GOLF_HOLE_COUNT }, (_, index) => {
    const parsed = Number(rawPars[index]);
    return Number.isInteger(parsed) && parsed >= 3 && parsed <= 6 ? parsed : DEFAULT_GOLF_HOLE_PARS[index];
  });

  return pars;
}

export function buildCourseData(holePars: unknown) {
  const normalizedPars = normalizeHolePars(holePars);
  const frontPar = sumNumbers(normalizedPars.slice(0, 9));
  const backPar = sumNumbers(normalizedPars.slice(9));

  return {
    holePars: normalizedPars,
    frontPar,
    backPar,
    totalPar: frontPar + backPar
  };
}

export function parseHoleParsFromFormData(formData: FormData): number[] {
  return normalizeHolePars(
    Array.from({ length: GOLF_HOLE_COUNT }, (_, index) => formData.get(`holePar${index + 1}`))
  );
}

export function parseHoleScoresFromFormData(formData: FormData): number[] | null {
  const scores = Array.from({ length: GOLF_HOLE_COUNT }, (_, index) => Number(formData.get(`hole${index + 1}`)));

  if (scores.some((score) => !Number.isInteger(score) || score < 1 || score > 20)) {
    return null;
  }

  return scores;
}

export function buildRoundSummary(holeScores: number[], holePars: unknown): GolfRoundSummary {
  const pars = normalizeHolePars(holePars);
  const normalizedScores = Array.from({ length: GOLF_HOLE_COUNT }, (_, index) => {
    const parsed = Number(holeScores[index]);
    return Number.isInteger(parsed) && parsed >= 1 && parsed <= 20 ? parsed : pars[index];
  });

  const front9 = sumNumbers(normalizedScores.slice(0, 9));
  const back9 = sumNumbers(normalizedScores.slice(9));
  const frontPar = sumNumbers(pars.slice(0, 9));
  const backPar = sumNumbers(pars.slice(9));
  const total = front9 + back9;
  const par = frontPar + backPar;

  return {
    holeScores: normalizedScores.map((score, index) => {
      const holePar = pars[index];
      const toPar = score - holePar;

      return {
        hole: index + 1,
        par: holePar,
        score,
        toPar,
        scoreName: getHoleScoreName(toPar)
      };
    }),
    front9,
    back9,
    total,
    frontPar,
    backPar,
    par,
    toPar: total - par
  };
}

export function extractHoleScores(value: unknown, fallbackPars: unknown = DEFAULT_GOLF_HOLE_PARS): GolfHoleScore[] | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  const data = value as Record<string, unknown>;
  const rawScores = data.holeScores ?? data.holes ?? data.hbh;

  if (!Array.isArray(rawScores)) {
    return null;
  }

  const pars = normalizeHolePars(data.holePars ?? fallbackPars);
  const holeScores = rawScores
    .slice(0, GOLF_HOLE_COUNT)
    .map((item, index) => {
      const par = pars[index];

      if (typeof item === "number") {
        const toPar = item - par;
        return {
          hole: index + 1,
          par,
          score: item,
          toPar,
          scoreName: getHoleScoreName(toPar)
        };
      }

      if (!item || typeof item !== "object" || Array.isArray(item)) {
        return null;
      }

      const hole = item as Record<string, unknown>;
      const score = typeof hole.score === "number" ? hole.score : null;
      const holePar = typeof hole.par === "number" ? hole.par : par;
      const toPar = score === null ? null : score - holePar;

      return {
        hole: typeof hole.hole === "number" ? hole.hole : index + 1,
        par: holePar,
        score,
        toPar,
        scoreName: toPar === null ? null : getHoleScoreName(toPar)
      };
    })
    .filter((item): item is GolfHoleScore => Boolean(item));

  return holeScores.length ? holeScores : null;
}

export function formatToPar(value: number | null | undefined) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return "-";
  }

  if (value === 0) {
    return "E";
  }

  return value > 0 ? `+${value}` : String(value);
}

function getHoleScoreName(toPar: number) {
  if (toPar <= -3) {
    return "albatross";
  }

  if (toPar === -2) {
    return "eagle";
  }

  if (toPar === -1) {
    return "birdie";
  }

  if (toPar === 0) {
    return "par";
  }

  if (toPar === 1) {
    return "bogey";
  }

  if (toPar === 2) {
    return "double-bogey";
  }

  return "other";
}

function sumNumbers(values: number[]) {
  return values.reduce((sum, value) => sum + value, 0);
}
