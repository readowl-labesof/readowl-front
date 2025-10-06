import { api } from "../lib/api";

export type RegisterPayload = { name: string; email: string; password: string };
export type LoginPayload    = { email: string; password: string };

export type User = { id: string | number; name: string; email: string };

type LoginResponse = {
  token?: string;
  access_token?: string;
  jwt?: string;
  user?: User;
  [k: string]: any;
};

type RegisterResponse = {
  user: User;
  token?: string;
  access_token?: string;
  jwt?: string;
  [k: string]: any;
};

function extractToken(obj: any): string | undefined {
  return obj?.access_token ?? obj?.token ?? obj?.jwt;
}

export async function register(payload: RegisterPayload) {
  const { data } = await api.post<RegisterResponse>("/users", payload);
  const token = extractToken(data);
  if (token) localStorage.setItem("access_token", token);
  return data.user ?? null;
}

export async function login(payload: LoginPayload) {
  const { data } = await api.post<LoginResponse>("/sessions", payload);
  const token = extractToken(data);
  if (!token) throw new Error("Token não retornado pelo backend em /sessions");
  localStorage.setItem("access_token", token);
  return data.user ?? null;
}

export function logout() {
  localStorage.removeItem("access_token");
}