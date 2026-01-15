import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useApiQuery } from "@/hooks/api";
import { cn } from "@/lib/utils";
import { createFileRoute } from "@tanstack/react-router";
import { GalleryVerticalEnd } from "lucide-react";
import { useEffect } from "react";

export const Route = createFileRoute("/_auth-protected/books/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { isPending, isSuccess, isError, data, error } = useApiQuery<{
    message: string;
  }>(["books"], "/books", undefined, true);

  useEffect(() => { }, []);

  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <a href="#" className="flex items-center gap-2 self-center font-medium">
          <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
            <GalleryVerticalEnd className="size-4" />
          </div>
          Simple Library
        </a>
        <div className={cn("flex flex-col gap-6")}>
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-xl">Book Routes Access</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center gap-4">
                <div>
                  {isPending && (
                    <span className="text-muted-foreground">Requesting...</span>
                  )}
                  {isSuccess && (
                    <span className="text-green-500">Request Success</span>
                  )}
                  {isError && (
                    <span className="text-red-500">
                      Request failed: {error?.message}
                    </span>
                  )}
                </div>
                <div className="flex flex-col w-full">
                  <div>Data Token:</div>
                  <div className="text-sm text-muted-foreground wrap-break-word">
                    {data?.message || "N/A"}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
