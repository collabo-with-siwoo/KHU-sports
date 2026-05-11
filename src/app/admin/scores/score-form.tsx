"use client";

import { useActionState, useMemo, useState } from "react";
import { SubmitButton } from "@/app/(auth)/submit-button";
import { DEFAULT_GOLF_HOLE_PARS, formatToPar } from "@/lib/golf-scoring";
import type { AdminTournamentRow } from "@/lib/results";
import { createScoreAction, type ScoreActionState } from "./actions";

const initialState: ScoreActionState = {
  status: "idle",
  message: ""
};

type ScoreFormProps = {
  tournaments: AdminTournamentRow[];
};

export function ScoreForm({ tournaments }: ScoreFormProps) {
  const [state, formAction] = useActionState(createScoreAction, initialState);
  const [selectedTournamentId, setSelectedTournamentId] = useState("");
  const [scores, setScores] = useState<string[]>(Array(18).fill(""));
  const selectedTournament = tournaments.find((tournament) => tournament.id === selectedTournamentId);
  const holePars = selectedTournament?.holePars ?? DEFAULT_GOLF_HOLE_PARS;
  const totalPar = selectedTournament?.totalPar ?? holePars.reduce((sum, par) => sum + par, 0);
  const numericScores = scores.map((score) => Number(score));
  const isComplete = numericScores.every((score) => Number.isInteger(score) && score > 0);
  const total = isComplete ? numericScores.reduce((sum, score) => sum + score, 0) : null;
  const front9 = isComplete ? numericScores.slice(0, 9).reduce((sum, score) => sum + score, 0) : null;
  const back9 = isComplete ? numericScores.slice(9).reduce((sum, score) => sum + score, 0) : null;
  const toPar = useMemo(() => (typeof total === "number" ? total - totalPar : null), [total, totalPar]);

  return (
    <form action={formAction} className="admin-notice-form">
      <label>
        대회
        <select
          name="tournamentId"
          onChange={(event) => setSelectedTournamentId(event.currentTarget.value)}
          required
          value={selectedTournamentId}
        >
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
        <input name="playerEmail" placeholder="player@example.com" required type="email" />
      </label>
      <label>
        소속
        <input name="affiliation" placeholder="학교명" />
      </label>
      <label>
        라운드
        <input defaultValue="1" max="4" min="1" name="round" type="number" />
      </label>

      <fieldset className="score-hole-inputs">
        <legend>18홀 스코어</legend>
        <div className="score-hole-summary">
          <span>OUT {front9 ?? "-"}</span>
          <span>IN {back9 ?? "-"}</span>
          <strong>Total {total ?? "-"}</strong>
          <strong>{formatToPar(toPar)}</strong>
        </div>
        <div className="score-hole-grid">
          {holePars.map((par, index) => (
            <label key={index}>
              <span>{index + 1}H · Par {par}</span>
              <input
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
            </label>
          ))}
        </div>
      </fieldset>

      <label>
        순위
        <input min="1" name="rank" placeholder="선택 입력" type="number" />
      </label>
      {state.message ? <p className={`form-message ${state.status}`}>{state.message}</p> : null}
      <SubmitButton pendingLabel="저장 중...">스코어 저장</SubmitButton>
    </form>
  );
}
