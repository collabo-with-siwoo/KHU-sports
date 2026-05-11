"use client";

import { useActionState } from "react";
import { SubmitButton } from "@/app/(auth)/submit-button";
import { updateMemberTypeAction, type MemberActionState } from "./actions";

const initialState: MemberActionState = {
  status: "idle",
  message: ""
};

type MemberTypeFormProps = {
  userId: string;
  defaultUserType: "GENERAL" | "PLAYER";
  defaultAffiliation: string;
};

export function MemberTypeForm({
  userId,
  defaultUserType,
  defaultAffiliation
}: MemberTypeFormProps) {
  const [state, formAction] = useActionState(updateMemberTypeAction, initialState);

  return (
    <form action={formAction} className="member-inline-form">
      <input name="userId" type="hidden" value={userId} />
      <select defaultValue={defaultUserType} name="userType">
        <option value="GENERAL">GENERAL</option>
        <option value="PLAYER">PLAYER</option>
      </select>
      <input defaultValue={defaultAffiliation} name="affiliation" placeholder="소속" />
      <SubmitButton pendingLabel="저장 중">저장</SubmitButton>
      {state.message ? <small className={`form-message ${state.status}`}>{state.message}</small> : null}
    </form>
  );
}
