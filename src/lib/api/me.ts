import { apiFetch } from "./client";

export const meKeys = {
  profile: ["me", "profile"] as const,
};

export interface MyProfile {
  userId: string;
  email: string | null;
  fullName: string | null;
  username: string | null;
  avatarUrl: string | null;
  avatarColor: string | null;
}

export function getMyProfile() {
  return apiFetch<MyProfile>("/me");
}
