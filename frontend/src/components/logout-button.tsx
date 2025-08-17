import { useApiMutation } from "@/hooks/useApi";
import { useForm } from "@tanstack/react-form";
import { useNavigate } from "@tanstack/react-router";
import { CircleCheck, CircleX, LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

export function LogoutButton({
  className,
  onSuccess,
  onError,
  ...props
}: React.ComponentProps<"button"> & {
  onSuccess?: () => void;
  onError?: (error: any) => void;
}) {
  const navigation = useNavigate();

  const logout = useApiMutation<
    void,
    {
      username: string;
      email: string;
    }
  >("/auth/logout", "POST", {
    fetcher: { credentials: "include" },
  });

  const form = useForm({
    defaultValues: {},
    onSubmit: async () => {
      try {
        const info = await logout.mutateAsync();

        console.log("Logout successful:", info);

        toast("Logout successful", {
          closeButton: true,
          icon: <CircleCheck />,
        });

        await new Promise((resolve) => setTimeout(resolve, 2000));

        // onSuccess?.();
        navigation({ to: "/login" });
      } catch (error: any) {
        console.error("Logout error:", error);
        // onError?.(error);
        toast("Logout failed", {
          description: error?.message || "An error occurred",
          className: "!text-destructive",
          descriptionClassName: "!text-destructive",
          closeButton: true,
          icon: <CircleX />,
          duration: 7000,
        });
      }
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
    >
      <form.Subscribe
        selector={(state) => [state.canSubmit, state.isSubmitting]}
        children={([canSubmit, isSubmitting]) => (
          <Button
            type="submit"
            disabled={!canSubmit}
            className={cn("btn btn-primary", className)}
            {...props}
          >
            {isSubmitting ? <LoaderCircle className="animate-spin" /> : null}
            Logout
          </Button>
        )}
      />
    </form>
  );
}
