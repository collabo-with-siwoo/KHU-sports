"use client";

import { useActionState } from "react";
import { SubmitButton } from "@/app/(auth)/submit-button";
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
        <input name="name" placeholder="제27회 경희대학교 총장배" />
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
        <input name="venue" placeholder="경희대 지정 코스" />
      </label>
      <label>
        라운드 수
        <input defaultValue="1" max="4" min="1" name="rounds" type="number" />
      </label>
      {state.message ? (
        <p className={`form-message ${state.status}`}>{state.message}</p>
      ) : null}
      <SubmitButton pendingLabel="등록 중">대회 등록</SubmitButton>
    </form>
  );
}

