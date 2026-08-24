import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useApiMutation } from "@/hooks/api";
import { cn } from "@/lib/utils";
import { createFileRoute } from "@tanstack/react-router";
import { GalleryVerticalEnd } from "lucide-react";
import { useEffect } from "react";

export const Route = createFileRoute("/_utils/check-cookie")({
  component: RouteComponent,
});

function RouteComponent() {
  const checkCookies = useApiMutation<
    void,
    {
      accessToken: string;
      refreshToken: string;
    }
  >("/utils/get-cookies", "POST", {
    fetcher: { credentials: "include" },
  });

  useEffect(() => {
    checkCookies.mutate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <a href="#" className="flex items-center gap-2 self-center font-medium">
          <div className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <GalleryVerticalEnd className="size-4" />
          </div>
          Simple Library
        </a>
        <div className={cn("flex flex-col gap-6")}>
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-xl">Cookie Checker</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center gap-4">
                <div>
                  {checkCookies.isPending && (
                    <span className="text-muted-foreground">
                      Checking cookies...
                    </span>
                  )}
                  {checkCookies.isSuccess && (
                    <span className="text-green-500">Cookies are existed!</span>
                  )}
                  {checkCookies.isError && (
                    <span className="text-red-500">
                      Failed to check cookies.
                    </span>
                  )}
                </div>
                <div className="flex w-full flex-col">
                  <div>Access Token:</div>
                  <div className="text-sm wrap-break-word text-muted-foreground">
                    {checkCookies.data?.accessToken || "N/A"}
                  </div>
                </div>
                <div className="flex w-full flex-col">
                  <div>Refresh Token:</div>
                  <div className="text-sm text-muted-foreground">
                    {checkCookies.data?.refreshToken || "N/A"}
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
