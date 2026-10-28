"use client";
import { useState } from "react";
import { toast } from "sonner";
import { useApi } from "@/lib/hooks/useApi";
import { apiJSON, jsonBody } from "@/lib/apiFetch";
import { containsRollNumber, type SessionUser } from "@/lib/validation/auth";
import { updateUserSchema } from "@/lib/validation/users";
import { useAuthStore } from "@/lib/store/authStore";
import ResourceState from "@/components/ResourceState";
import Field from "@/components/auth/Field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/Button";
export default function Settings() {
  const { data, error, refresh } = useApi<SessionUser>("/api/v1/me");
  const [busy, setBusy] = useState(false);
  const [now] = useState(() => Date.now());
  if (!data || error) return <ResourceState error={error} retry={refresh} />;
  const cooldown = !!data.handleChangeAvailableAt && +new Date(data.handleChangeAvailableAt) > now;
  return <div className="page-stack"><header><h1 className="page-title">Settings</h1><p className="page-description">Make your campus identity feel like you.</p></header><form key={`${data.user_handle}:${data.bio}`} className="panel form-stack" onSubmit={async event => {
    event.preventDefault(); const form = new FormData(event.currentTarget); setBusy(true);
    try { const input = updateUserSchema.parse({ ...(cooldown ? {} : { user_handle: form.get("user_handle") }), bio: form.get("bio") }); if (input.user_handle && containsRollNumber(input.user_handle, data.email)) throw new Error("Don’t use your roll number in a public handle"); const user = await apiJSON<SessionUser>("/api/v1/me", jsonBody("PATCH", input)); useAuthStore.getState().login(user); refresh(); toast.success("Profile saved"); }
    catch (error) { toast.error(error instanceof Error ? error.message : "Request failed"); refresh(); } finally { setBusy(false); }
  }}><Field id="user_handle" label="Public username" hint={cooldown ? `Available again ${new Date(data.handleChangeAvailableAt!).toLocaleString()}` : "This is public. Don’t use your real name or roll number. You can change it once every 30 days."}>{aria => <Input {...aria} name="user_handle" defaultValue={data.user_handle} disabled={cooldown} minLength={3} maxLength={20} required />}</Field><Field id="bio" label="Bio" hint="160 characters maximum. Keep personal information private.">{aria => <Textarea {...aria} name="bio" defaultValue={data.bio ?? ""} maxLength={160} />}</Field><Button disabled={busy}>{busy ? "Saving…" : "Save profile"}</Button></form></div>;
}
