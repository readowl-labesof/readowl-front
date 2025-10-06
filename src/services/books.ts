import { api } from "../lib/api";

export type Book = {
  id: string | number;
  title: string;
  author?: string;
  synopsis?: string;
  coverUrl?: string;
  // adicione os campos que seu Prisma/DTO realmente usa
};

export async function listBooks() {
  const { data } = await api.get<Book[]>("/books");
  return data;
}

export async function getBook(id: string | number) {
  const { data } = await api.get<Book>(`/books/${id}`);
  return data;
}

export async function createBook(payload: Partial<Book>) {
  const { data } = await api.post<Book>("/books", payload); // Auth: Bearer token (via interceptor)
  return data;
}

export async function updateBook(id: string | number, payload: Partial<Book>) {
  const { data } = await api.put<Book>(`/books/${id}`, payload); // Auth
  return data;
}

export async function deleteBook(id: string | number) {
  await api.delete(`/books/${id}`); // Auth
}