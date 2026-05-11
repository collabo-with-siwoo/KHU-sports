"use client";

import { useActionState } from "react";
import { SubmitButton } from "@/app/(auth)/submit-button";
import { DEFAULT_GOLF_HOLE_PARS } from "@/lib/golf-scoring";
import { createTournamentAction, type TournamentActionState } from "./actions";

const initialState: TournamentActionState = {
  status: "idle",
  message: ""
};

export function TournamentForm() {
  const [state, formAction] = useActionState(createTournamentAction, initialState);

  return (
    <form action={formAction} className="admin-notice-form">
      <label>
        대회명
        <input name="name" placeholder="2026 전국중고등학생골프대회" />
      </label>
      <label>
        시작일
        <input name="startDate" type="date" />
      </label>
      <label>
        종료일
        <input name="endDate" type="date" />
      </label>
      <label>
        장소
        <input name="venue" placeholder="군산CC" />
      </label>
      <label>
        라운드 수
        <input defaultValue="1" max="4" min="1" name="rounds" type="number" />
      </label>
      <fieldset className="admin-hole-pars">
        <legend>18홀 파 설정</legend>
        <div>
          {DEFAULT_GOLF_HOLE_PARS.map((par, index) => (
            <label key={index}>
              {index + 1}H
              <input defaultValue={par} max="6" min="3" name={`holePar${index + 1}`} type="number" />
            </label>
          ))}
        </div>
      </fieldset>
      {state.message ? <p className={`form-message ${state.status}`}>{state.message}</p> : null}
      <SubmitButton pendingLabel="등록 중...">대회 등록</SubmitButton>
    </form>
  );
}
