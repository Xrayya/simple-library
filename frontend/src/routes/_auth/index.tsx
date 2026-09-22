import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "#/components/ui/alert-dialog.tsx";
import { Button } from "#/components/ui/button.tsx";
import { Input } from "#/components/ui/input.tsx";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "#/components/ui/select.tsx";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "#/components/ui/table.tsx";
import { authFetch } from "#/lib/utils.ts";
import type { BookFilter } from "#/models/book.ts";
import { queryOptions, useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import {
  columnFilteringFeature,
  createFilteredRowModel,
  createPaginatedRowModel,
  createSortedRowModel,
  filterFn_includesString,
  globalFilteringFeature,
  rowPaginationFeature,
  rowSortingFeature,
  tableFeatures,
  useTable,
  type ColumnDef,
  type PaginationState,
  type SortingState,
} from "@tanstack/react-table";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { Fragment, useState } from "react";

export const Route = createFileRoute("/_auth/")({
  component: RouteComponent,
});

type Book = {
  id: string;
  title: string;
  publisher: string;
  year: number;
  edition: number;
  description: string;
  categoryName: string;
  coverUrl: string;
  totalCopies: number;
  availableCopies: number;
};

export const mockBooks: Book[] = [
  {
    id: "b101",
    title: "Designing Data-Intensive Applications",
    publisher: "O'Reilly Media",
    year: 2017,
    edition: 1,
    description:
      "An in-depth guide to the architecture and principles underlying reliable, scalable, and maintainable systems.",
    categoryName: "cat-tech",
    coverUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c",
    totalCopies: 10,
    availableCopies: 4,
  },
  {
    id: "b102",
    title: "Clean Code",
    publisher: "Prentice Hall",
    year: 2008,
    edition: 1,
    description:
      "A handbook of agile software craftsmanship packed with practical examples and refactoring techniques.",
    categoryName: "cat-tech",
    coverUrl: "https://images.unsplash.com/photo-1532012197267-da84d127e765",
    totalCopies: 8,
    availableCopies: 2,
  },
  {
    id: "b103",
    title: "The Pragmatic Programmer",
    publisher: "Addison-Wesley",
    year: 2019,
    edition: 2,
    description:
      "Your journey to mastery: practical advice on software development, career growth, and code architecture.",
    categoryName: "cat-tech",
    coverUrl: "https://images.unsplash.com/photo-1512820790803-83ca734da794",
    totalCopies: 6,
    availableCopies: 1,
  },
  {
    id: "b104",
    title: "Refactoring: Improving the Design of Existing Code",
    publisher: "Addison-Wesley",
    year: 2018,
    edition: 2,
    description:
      "A comprehensive catalog of refactorings and code smells to transform legacy code into clean architecture.",
    categoryName: "cat-tech",
    coverUrl: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e",
    totalCopies: 5,
    availableCopies: 5,
  },
  {
    id: "b105",
    title: "Dune",
    publisher: "Chilton Books",
    year: 1965,
    edition: 1,
    description:
      "Set on the desert planet Arrakis, a masterwork of political intrigue, religion, and ecology.",
    categoryName: "cat-sci-fi",
    coverUrl: "https://images.unsplash.com/photo-1506880018603-83d5b814b5a6",
    totalCopies: 12,
    availableCopies: 3,
  },
  {
    id: "b106",
    title: "Neuromancer",
    publisher: "Ace Books",
    year: 1984,
    edition: 1,
    description:
      "The seminal cyberpunk novel following Case, a washed-up computer hacker hired for a mysterious heist.",
    categoryName: "cat-sci-fi",
    coverUrl: "https://images.unsplash.com/photo-1516979187457-637abb4f9353",
    totalCopies: 4,
    availableCopies: 0,
  },
  {
    id: "b107",
    title: "Foundation",
    publisher: "Gnome Press",
    year: 1951,
    edition: 1,
    description:
      "Psychohistorian Hari Seldon foresees the fall of the Galactic Empire and creates a foundation to save civilization.",
    categoryName: "cat-sci-fi",
    coverUrl: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6",
    totalCopies: 7,
    availableCopies: 6,
  },
  {
    id: "b108",
    title: "Sapiens: A Brief History of Humankind",
    publisher: "Harper",
    year: 2015,
    edition: 1,
    description:
      "A narrative tracing how biology and history have defined us and enhanced our understanding of humanity.",
    categoryName: "cat-history",
    coverUrl: "https://images.unsplash.com/photo-1457369804613-52c61a468e7d",
    totalCopies: 15,
    availableCopies: 9,
  },
  {
    id: "b109",
    title: "Atomic Habits",
    publisher: "Avery",
    year: 2018,
    edition: 1,
    description:
      "An easy and proven framework for improving your life through tiny daily behavior changes.",
    categoryName: "cat-self-help",
    coverUrl: "https://images.unsplash.com/photo-1544947950-fa07a98d237f",
    totalCopies: 20,
    availableCopies: 11,
  },
  {
    id: "b110",
    title: "Deep Work",
    publisher: "Grand Central Publishing",
    year: 2016,
    edition: 1,
    description:
      "Rules for focused success in a distracted world, prioritizing cognitive load for maximum performance.",
    categoryName: "cat-self-help",
    coverUrl: "https://images.unsplash.com/photo-1495446815901-a7297e633e8d",
    totalCopies: 9,
    availableCopies: 2,
  },
  {
    id: "b111",
    title: "The Hobbit",
    publisher: "George Allen & Unwin",
    year: 1937,
    edition: 1,
    description:
      "Bilbo Baggins leaves his peaceful life in the Shire to embark on a quest to reclaim the Lonely Mountain.",
    categoryName: "cat-fantasy",
    coverUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475",
    totalCopies: 14,
    availableCopies: 8,
  },
  {
    id: "b112",
    title: "The Name of the Wind",
    publisher: "DAW Books",
    year: 2007,
    edition: 1,
    description:
      "The tale of Kvothe, a magically gifted young man who grows to become a notorious wizard.",
    categoryName: "cat-fantasy",
    coverUrl: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f",
    totalCopies: 5,
    availableCopies: 2,
  },
  {
    id: "b113",
    title: "Structure and Interpretation of Computer Programs",
    publisher: "MIT Press",
    year: 1996,
    edition: 2,
    description:
      "A foundational text on computer science principles using Scheme to demonstrate abstraction and programming paradigms.",
    categoryName: "cat-tech",
    coverUrl: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5",
    totalCopies: 3,
    availableCopies: 1,
  },
  {
    id: "b114",
    title: "1984",
    publisher: "Secker & Warburg",
    year: 1949,
    edition: 1,
    description:
      "A dystopian novel exploring total government surveillance, propaganda, and thought control under Big Brother.",
    categoryName: "cat-fiction",
    coverUrl: "https://images.unsplash.com/photo-1531988042231-d39a9cc12a9a",
    totalCopies: 11,
    availableCopies: 7,
  },
  {
    id: "b115",
    title: "To Kill a Mockingbird",
    publisher: "J. B. Lippincott & Co.",
    year: 1960,
    edition: 1,
    description:
      "A novel about growth, racial injustice, and compassion in the American South seen through young Scout's eyes.",
    categoryName: "cat-fiction",
    coverUrl: "https://images.unsplash.com/photo-1476275466078-4007374efbbe",
    totalCopies: 10,
    availableCopies: 5,
  },
  {
    id: "b116",
    title: "Thinking, Fast and Slow",
    publisher: "Farrar, Straus and Giroux",
    year: 2011,
    edition: 1,
    description:
      "An investigation into two modes of thought: fast, intuitive thinking vs. slow, deliberate logical reasoning.",
    categoryName: "cat-psychology",
    coverUrl: "https://images.unsplash.com/photo-1507842217343-583bb7270b66",
    totalCopies: 8,
    availableCopies: 3,
  },
  {
    id: "b117",
    title: "JavaScript: The Good Parts",
    publisher: "O'Reilly Media",
    year: 2008,
    edition: 1,
    description:
      "Uncovers the elegant, highly expressive features of JavaScript while avoiding its bad features.",
    categoryName: "cat-tech",
    coverUrl: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97",
    totalCopies: 6,
    availableCopies: 6,
  },
  {
    id: "b118",
    title: "The Psychology of Money",
    publisher: "Harriman House",
    year: 2020,
    edition: 1,
    description:
      "Timeless lessons on wealth, greed, and happiness exploring how people think about financial decisions.",
    categoryName: "cat-finance",
    coverUrl: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44",
    totalCopies: 12,
    availableCopies: 10,
  },
  {
    id: "b119",
    title: "Zero to One",
    publisher: "Crown Business",
    year: 2014,
    edition: 1,
    description:
      "Notes on startups, building the future, and how to create breakthrough innovations rather than incremental copies.",
    categoryName: "cat-business",
    coverUrl: "https://images.unsplash.com/photo-1519389950473-47ba0277781c",
    totalCopies: 7,
    availableCopies: 2,
  },
  {
    id: "b120",
    title: "Good to Great",
    publisher: "HarperBusiness",
    year: 2001,
    edition: 1,
    description:
      "A study on why some companies make the leap to long-term greatness while others fail to sustain success.",
    categoryName: "cat-business",
    coverUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab",
    totalCopies: 5,
    availableCopies: 0,
  },
];

const features = tableFeatures({
  rowSortingFeature,
  sortedRowModel: createSortedRowModel(),
  globalFilteringFeature,
  columnFilteringFeature,
  filteredRowModel: createFilteredRowModel(),
  filterFns: { includesString: filterFn_includesString },
  rowPaginationFeature,
  paginatedRowModel: createPaginatedRowModel(),
});

const ActionCell = ({
  bookId,
  bookTitle,
}: {
  bookId: Book["id"];
  bookTitle: Book["title"];
}) => {
  const mutation = useMutation({
    mutationFn: async (bookId: string) => {
      // const url = new URL(`/api/borrowing/${bookId}`, window.location.origin);

      // const response = await authFetch(url, {
      //   method: "POST",
      // });

      // if (!response.ok) {
      //   const payload = await response.json();
      //   throw new Error(
      //     payload?.error?.message || "An error occurred while borrowing the book",
      //     { cause: payload?.error?.name },
      //   );
      // }

      // return await response.json();

      console.log(`API request triggered for borrowing book ID: ${bookId}`);
      return { message: "Mock success" };
    },
  });

  return (
    <AlertDialog>
      <AlertDialogTrigger
        render={
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => e.stopPropagation()}
          >
            Borrow
          </Button>
        }
      />
      <AlertDialogContent onClick={(e) => e.stopPropagation()}>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirm Borrowing</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to borrow &ldquo;{bookTitle}&rdquo;?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={() => mutation.mutate(bookId)}>
            Confirm
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

const columns: Array<ColumnDef<typeof features, Book>> = [
  {
    accessorKey: "coverUrl",
    header: "Cover",
    cell: (info) => (
      <img
        src={info.getValue() as string}
        alt={info.row.original.title}
        className="h-16 w-12 rounded-md object-cover shadow-sm"
      />
    ),
    enableSorting: false,
  },
  {
    accessorKey: "title",
    header: "Title",
  },
  {
    accessorKey: "categoryName",
    header: "Category",
  },
  {
    accessorKey: "year",
    header: "Year",
  },
  {
    accessorKey: "publisher",
    header: "Publisher",
  },
  {
    id: "copies",
    header: "Stock",
    cell: (info) => (
      <>
        {info.row.original.availableCopies}
        <span className="text-muted-foreground">
          /{info.row.original.totalCopies}
        </span>
      </>
    ),
  },
  {
    id: "actions",
    header: "Actions",
    cell: (info) => (
      <ActionCell
        bookId={info.row.original.id}
        bookTitle={info.row.original.title}
      />
    ),
  },
];

export function bookListOptions(filter?: BookFilter) {
  return queryOptions({
    queryKey: ["books", filter] as const,
    queryFn: async (): Promise<{ books: Book[]; totalBookCount: number }> => {
      const url = new URL("/api/books", window.location.origin);

      if (filter) {
        Object.entries(filter).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            url.searchParams.set(key, value.toString());
          }
        });
      }

      const response = await authFetch(url);

      if (!response.ok) {
        const payload = await response.json();
        throw new Error(
          payload?.error?.message || "An error occurred while fetching data",
          { cause: payload?.error?.name },
        );
      }

      const payload = await response.json();
      return {
        books: payload.books,
        totalBookCount: payload.meta.totalBookCount,
      };
    },
  });
}

function RouteComponent() {
  const [globalFilter, setGlobalFilter] = useState("");
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 5,
  });
  const [sorting, setSorting] = useState<SortingState>([]);
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);

  // TODO: start simple usequery book
  const { data, isLoading, error } = useQuery(
    bookListOptions({
      searchString: globalFilter,
      pageIndex: pagination.pageIndex,
      pageSize: pagination.pageSize,
      sorting: sorting.length > 0 ? JSON.stringify(sorting) : undefined,
    }),
  );

  const table = useTable(
    {
      key: "books-table",
      features,
      columns: columns,
      data: data?.books || [],
      rowCount: data?.totalBookCount,
      state: { sorting, globalFilter, pagination },
      onSortingChange: (updater) => {
        setSorting(updater);
        setPagination((previous) => ({ ...previous, pageIndex: 0 }));
      },
      onGlobalFilterChange: (updater) => {
        setGlobalFilter(updater);
        setPagination((previous) => ({ ...previous, pageIndex: 0 }));
      },
      onPaginationChange: setPagination,
      manualFiltering: true,
      manualSorting: true,
      manualPagination: true,
    },
    (state) => state,
  );

  // TODO: complete
  if (isLoading) {
    return <div></div>;
  }

  // TODO: complete
  if (error) {
    return <div></div>;
  }

  return (
    <div className="flex flex-col gap-10 p-8">
      <section>
        <h3 className="mb-4 text-lg font-semibold">Books</h3>
        <div className="space-y-4">
          <Input
            value={globalFilter ?? ""}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Search books..."
            className="max-w-sm rounded-md border border-input bg-background text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
          />
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    const sorted = header.column.getIsSorted();
                    const Icon =
                      sorted === "asc"
                        ? ArrowUp
                        : sorted === "desc"
                          ? ArrowDown
                          : ArrowUpDown;

                    return (
                      <TableHead key={header.id}>
                        {header.isPlaceholder ? null : header.column.getCanSort() ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="-ml-3 h-8 data-[state=open]:bg-accent"
                            onClick={header.column.getToggleSortingHandler()}
                          >
                            <table.FlexRender header={header} />
                            <Icon className="ml-2" />
                          </Button>
                        ) : (
                          <span className="text-sm font-medium">
                            <table.FlexRender header={header} />
                          </span>
                        )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length} className="text-center">
                    No results.
                  </TableCell>
                </TableRow>
              ) : (
                table.getRowModel().rows.map((row) => {
                  const isExpanded = expandedRowId === row.id;
                  return (
                    <Fragment key={row.id}>
                      {!isExpanded ? (
                        <TableRow
                          className="cursor-pointer transition-all hover:bg-muted/50"
                          onClick={() => setExpandedRowId(row.id)}
                        >
                          {row.getAllCells().map((cell) => (
                            <TableCell key={cell.id}>
                              <table.FlexRender cell={cell} />
                            </TableCell>
                          ))}
                        </TableRow>
                      ) : (
                        <TableRow
                          className="cursor-pointer bg-muted/50 hover:bg-muted/50"
                          onClick={() => setExpandedRowId(null)}
                        >
                          <TableCell colSpan={columns.length} className="p-6">
                            <div className="flex animate-in gap-8 duration-200 fade-in slide-in-from-top-2">
                              <img
                                src={row.original.coverUrl}
                                alt={row.original.title}
                                className="h-72 w-48 rounded-lg object-cover shadow-lg"
                              />
                              <div className="flex-1">
                                <ul className="m-0 list-none space-y-2 p-0 text-sm">
                                  <li>
                                    <span className="inline-block w-32 font-semibold text-foreground">
                                      Title:
                                    </span>
                                    <span className="text-muted-foreground">
                                      {row.original.title}
                                    </span>
                                  </li>
                                  <li>
                                    <span className="inline-block w-32 font-semibold text-foreground">
                                      Publisher:
                                    </span>
                                    <span className="text-muted-foreground">
                                      {row.original.publisher}
                                    </span>
                                  </li>
                                  <li>
                                    <span className="inline-block w-32 font-semibold text-foreground">
                                      Year:
                                    </span>
                                    <span className="text-muted-foreground">
                                      {row.original.year}
                                    </span>
                                  </li>
                                  <li>
                                    <span className="inline-block w-32 font-semibold text-foreground">
                                      Category:
                                    </span>
                                    <span className="text-muted-foreground">
                                      {row.original.categoryName}
                                    </span>
                                  </li>
                                  <li>
                                    <span className="inline-block w-32 font-semibold text-foreground">
                                      Edition:
                                    </span>
                                    <span className="text-muted-foreground">
                                      {row.original.edition}
                                    </span>
                                  </li>
                                  <li>
                                    <span className="inline-block w-32 font-semibold text-foreground">
                                      Total Copies:
                                    </span>
                                    <span className="text-muted-foreground">
                                      {row.original.totalCopies}
                                    </span>
                                  </li>
                                  <li>
                                    <span className="inline-block w-32 font-semibold text-foreground">
                                      Available Copies:
                                    </span>
                                    <span className="text-muted-foreground">
                                      {row.original.availableCopies}
                                    </span>
                                  </li>
                                  <li>
                                    <div className="flex gap-0">
                                      <span className="inline-block w-32 font-semibold text-foreground">
                                        Description:
                                      </span>
                                      <p className="max-w-2xl leading-relaxed text-muted-foreground">
                                        {row.original.description}
                                      </p>
                                    </div>
                                  </li>
                                </ul>
                                <div className="mt-6">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setExpandedRowId(null);
                                    }}
                                  >
                                    Back to list
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </Fragment>
                  );
                })
              )}
            </TableBody>
          </Table>
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium">Rows per page</p>
              <Select
                value={`${table.state.pagination.pageSize}`}
                onValueChange={(value) => table.setPageSize(Number(value))}
              >
                <SelectTrigger size="sm" className="w-17.5">
                  <SelectValue
                    placeholder={`${table.state.pagination.pageSize}`}
                  />
                </SelectTrigger>
                <SelectContent side="top">
                  {[5, 10, 20, 30, 40, 50].map((pageSize) => (
                    <SelectItem key={pageSize} value={`${pageSize}`}>
                      {pageSize}
                    </SelectItem>
                  ))}
                  <SelectItem value="Infinity">All</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex w-25 items-center justify-center text-sm font-medium">
              Page {table.state.pagination.pageIndex + 1} of{" "}
              {Math.max(1, table.getPageCount())}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                className="hidden size-8 lg:flex"
                onClick={() => table.firstPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Go to first page</span>
                <ChevronsLeft />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="size-8"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Go to previous page</span>
                <ChevronLeft />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="size-8"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Go to next page</span>
                <ChevronRight />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="hidden size-8 lg:flex"
                onClick={() => table.lastPage()}
                disabled={!table.getCanLastPage()}
              >
                <span className="sr-only">Go to last page</span>
                <ChevronsRight />
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
