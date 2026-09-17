export type Book = {
  id: string;
  title: string;
  author: string;
  publisher: string;
  year: number;
  edition: number;
  description: string;
  categoryName: string;
  coverUrl: string;
  totalCopies: number;
  availableCopies: number;
};

export type BookFilter = {
  id?: string;
  title?: string;
  author?: string;
  publisher?: string;
  year?: number;
  edition?: number;
  description?: string;
  categoryId?: string;
  totalCopies?: number;
  availableCopies?: number;
  searchString?: string;
  publishedYearFrom?: number;
  publishedYearUntil?: number;
  pageIndex?: number;
  pageSize?: number;
};
