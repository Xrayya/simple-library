import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useApiMutation } from "@/hooks/useApi";
import { cn } from "@/lib/utils";
import { createFileRoute } from "@tanstack/react-router";
import { GalleryVerticalEnd } from "lucide-react";
import { useEffect } from "react";

export const Route = createFileRoute("/(utils)/check-cookie")({
  component: RouteComponent,
});

function RouteComponent() {
  const checkCookies = useApiMutation<
    {},
    {
      accessToken: string;
      refreshToken: string;
    }
  >("/utils/get-cookies", "POST", {
    fetcher: { credentials: "include" },
  });

  useEffect(() => {
    checkCookies.mutate({});
  }, []);

  if (checkCookies.isSuccess) {
    const { accessToken, refreshToken } = checkCookies.data;
    console.log("Access Token:", accessToken);
    console.log("Refresh Token:", refreshToken);
  }

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
                <div className="flex flex-col w-full">
                  <div>Access Token:</div>
                  <div className="text-sm text-muted-foreground wrap-break-word">
                    {checkCookies.data?.accessToken || "N/A"}
                  </div>
                </div>
                <div className="flex flex-col w-full">
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
