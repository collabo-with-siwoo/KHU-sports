"use client";

import { useActionState } from "react";
import { SubmitButton } from "@/app/(auth)/submit-button";
import { createScoreAction, type ScoreActionState } from "./actions";
import type { AdminTournamentRow } from "@/lib/results";

const initialState: ScoreActionState = {
  status: "idle",
  message: ""
};

type ScoreFormProps = {
  tournaments: AdminTournamentRow[];
};

export function ScoreForm({ tournaments }: ScoreFormProps) {
  const [state, formAction] = useActionState(createScoreAction, initialState);

  return (
    <form action={formAction} className="admin-notice-form">
      <label>
        대회
        <select name="tournamentId">
          <option value="">대회를 선택하세요</option>
          {tournaments.map((tournament) => (
            <option key={tournament.id} value={tournament.id}>
              {tournament.name}
            </option>
          ))}
        </select>
      </label>
      <label>
        선수 회원 이메일
        <input name="playerEmail" placeholder="player@example.com" type="email" />
      </label>
      <label>
        학교
        <input name="affiliation" placeholder="경희대학교" />
      </label>
      <label>
        라운드
        <input defaultValue="1" max="4" min="1" name="round" type="number" />
      </label>
      <label>
        front9
        <input defaultValue="0" min="0" name="front9" type="number" />
      </label>
      <label>
        back9
        <input defaultValue="0" min="0" name="back9" type="number" />
      </label>
      <label>
        총타수
        <input defaultValue="0" min="0" name="total" type="number" />
      </label>
      <label>
        순위
        <input min="1" name="rank" placeholder="선택 입력" type="number" />
      </label>
      {state.message ? <p className={`form-message ${state.status}`}>{state.message}</p> : null}
      <SubmitButton pendingLabel="저장 중...">스코어 저장</SubmitButton>
    </form>
  );
}
