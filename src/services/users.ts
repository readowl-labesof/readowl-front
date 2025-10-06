import { api } from "../lib/api";

export type CreateUserDTO = {
  name: string;
  email: string;
  password: string;
};

export type User = {
  id: string | number;
  name: string;
  email: string;
};

export async function createUser(payload: CreateUserDTO) {
  const { data } = await api.post<User>("/users", payload);
  return data;
}