"use client";

import { useActionState } from "react";
import { SubmitButton } from "@/app/(auth)/submit-button";
import { upsertAdminAction, type AdminInviteActionState } from "./actions";

const initialState: AdminInviteActionState = {
  status: "idle",
  message: ""
};

const adminPermissionKeys = ["notices", "members", "scores", "tournaments", "admins", "privacy"] as const;

const permissionLabels: Record<(typeof adminPermissionKeys)[number], string> = {
  notices: "Notices",
  members: "Members",
  scores: "Scores",
  tournaments: "Tournaments",
  admins: "Admins",
  privacy: "Privacy export"
};

export function AdminInviteForm() {
  const [state, formAction] = useActionState(upsertAdminAction, initialState);

  return (
    <form action={formAction} className="admin-notice-form">
      <label>
        Admin email
        <input name="email" placeholder="admin@example.com" type="email" />
      </label>
      <label>
        Name
        <input name="name" placeholder="Operations manager" />
      </label>
      <label>
        Role
        <select name="role">
          <option value="MEMBER">Member admin</option>
          <option value="SUPER">Super admin</option>
        </select>
      </label>
      <label>
        Status
        <select name="status">
          <option value="PENDING">Pending invite</option>
          <option value="ACTIVE">Active</option>
          <option value="DISABLED">Disabled</option>
        </select>
      </label>

      <fieldset className="admin-permission-fieldset">
        <legend>Member admin permissions</legend>
        {adminPermissionKeys.map((key) => (
          <div className="admin-permission-row" key={key}>
            <span>{permissionLabels[key]}</span>
            <label>
              <input name={`${key}.read`} type="checkbox" />
              Read
            </label>
            <label>
              <input name={`${key}.write`} type="checkbox" />
              Write
            </label>
            {key === "privacy" ? (
              <label>
                <input name={`${key}.export`} type="checkbox" />
                Export
              </label>
            ) : null}
          </div>
        ))}
      </fieldset>

      {state.message ? <p className={`form-message ${state.status}`}>{state.message}</p> : null}
      <SubmitButton pendingLabel="Saving...">Save admin</SubmitButton>
    </form>
  );
}
