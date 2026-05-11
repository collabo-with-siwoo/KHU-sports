"use client";

import { useActionState, useMemo, useState } from "react";
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
  const [front9, setFront9] = useState(context.front9 ?? 0);
  const [back9, setBack9] = useState(context.back9 ?? 0);
  const roundTotal = useMemo(() => front9 + back9, [front9, back9]);
  const locked = !context.canEdit;

  return (
    <form action={formAction} className="my-score-input-form">
      <input name="tournamentId" type="hidden" value={context.tournamentId} />
      <input name="round" type="hidden" value={context.round} />

      <div className="my-score-input-grid">
        <label>
          front9
          <input
            disabled={locked}
            max="90"
            min="0"
            name="front9"
            onChange={(event) => setFront9(Number(event.currentTarget.value))}
            required
            type="number"
            value={front9}
          />
        </label>
        <label>
          back9
          <input
            disabled={locked}
            max="90"
            min="0"
            name="back9"
            onChange={(event) => setBack9(Number(event.currentTarget.value))}
            required
            type="number"
            value={back9}
          />
        </label>
        <label>
          roundTotal
          <input
            disabled={locked}
            max="180"
            min="0"
            name="total"
            readOnly
            required
            type="number"
            value={roundTotal}
          />
        </label>
      </div>

      <label className="my-score-input-memo">
        playerMemo
        <textarea
          defaultValue={context.playerMemo ?? ""}
          disabled={locked}
          maxLength={500}
          name="playerMemo"
          placeholder="본인 기록용 메모를 입력하세요."
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
