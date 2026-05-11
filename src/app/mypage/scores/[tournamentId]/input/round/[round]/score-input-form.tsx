"use client";

import { useActionState, useMemo, useState } from "react";
import { formatToPar } from "@/lib/golf-scoring";
import type { MyScoreInputContext } from "@/lib/results";
import { savePlayerScoreAction, type PlayerScoreInputState } from "./actions";

const initialState: PlayerScoreInputState = {
  status: "idle",
  message: ""
};

type ScoreInputFormProps = {
  context: MyScoreInputContext;
};

export function ScoreInputForm({ context }: ScoreInputFormProps) {
  const [state, formAction] = useActionState(savePlayerScoreAction, initialState);
  const [scores, setScores] = useState<string[]>(
    context.holePars.map((par, index) => {
      const existing = context.holeScores?.find((hole) => hole.hole === index + 1)?.score;
      return typeof existing === "number" ? String(existing) : "";
    })
  );
  const locked = !context.canEdit;
  const numericScores = scores.map((score) => Number(score));
  const isComplete = numericScores.every((score) => Number.isInteger(score) && score > 0);
  const front9 = isComplete ? numericScores.slice(0, 9).reduce((sum, score) => sum + score, 0) : null;
  const back9 = isComplete ? numericScores.slice(9).reduce((sum, score) => sum + score, 0) : null;
  const roundTotal = isComplete ? numericScores.reduce((sum, score) => sum + score, 0) : null;
  const toPar = useMemo(
    () => (typeof roundTotal === "number" ? roundTotal - context.par : null),
    [context.par, roundTotal]
  );

  return (
    <form action={formAction} className="my-score-input-form">
      <input name="tournamentId" type="hidden" value={context.tournamentId} />
      <input name="round" type="hidden" value={context.round} />

      <section className="score-hole-inputs player-scorecard-input">
        <header className="score-hole-summary">
          <span>OUT {front9 ?? "-"}</span>
          <span>IN {back9 ?? "-"}</span>
          <strong>Total {roundTotal ?? "-"}</strong>
          <strong>{formatToPar(toPar)}</strong>
        </header>
        <div className="score-hole-grid">
          {context.holePars.map((par, index) => {
            const currentScore = Number(scores[index]);
            const scoreToPar = Number.isInteger(currentScore) && currentScore > 0 ? currentScore - par : null;

            return (
              <label key={index}>
                <span>
                  {index + 1}H · Par {par}
                </span>
                <input
                  disabled={locked}
                  max="20"
                  min="1"
                  name={`hole${index + 1}`}
                  onChange={(event) => {
                    const nextScores = [...scores];
                    nextScores[index] = event.currentTarget.value;
                    setScores(nextScores);
                  }}
                  required
                  type="number"
                  value={scores[index]}
                />
                <small>{formatToPar(scoreToPar)}</small>
              </label>
            );
          })}
        </div>
      </section>

      <label className="my-score-input-memo">
        playerMemo
        <textarea
          defaultValue={context.playerMemo ?? ""}
          disabled={locked}
          maxLength={500}
          name="playerMemo"
          placeholder="본인 기록 메모를 입력하세요"
          rows={4}
        />
      </label>

      {state.message ? <p className={`form-message ${state.status}`}>{state.message}</p> : null}

      <div className="my-score-actions">
        <button className="my-score-action secondary" disabled={locked} name="intent" type="submit" value="draft">
          임시저장
        </button>
        <button className="my-score-action primary" disabled={locked} name="intent" type="submit" value="submit">
          제출 완료
        </button>
      </div>
    </form>
  );
}
