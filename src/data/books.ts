export type Book = {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  author: string;
  category: string;
  year: number;
  description: string;
  cover: string;
  pages: number;
  status: "published" | "draft";
  featured?: boolean;
  samplePages: string[];
};

export const books: Book[] = [];
