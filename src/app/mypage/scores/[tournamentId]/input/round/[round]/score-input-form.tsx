"use client";

import { useActionState } from "react";
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
  const locked = context.status === "ADMIN_CONFIRMED";

  return (
    <form action={formAction} className="my-score-input-form">
      <input name="tournamentId" type="hidden" value={context.tournamentId} />
      <input name="round" type="hidden" value={context.round} />

      <div className="my-score-input-grid">
        <label>
          front9
          <input
            defaultValue={context.front9 ?? 0}
            disabled={locked}
            max="90"
            min="0"
            name="front9"
            required
            type="number"
          />
        </label>
        <label>
          back9
          <input
            defaultValue={context.back9 ?? 0}
            disabled={locked}
            max="90"
            min="0"
            name="back9"
            required
            type="number"
          />
        </label>
        <label>
          roundTotal
          <input
            defaultValue={context.roundTotal ?? 0}
            disabled={locked}
            max="180"
            min="0"
            name="total"
            required
            type="number"
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
