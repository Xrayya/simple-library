import { useApiMutation } from "@/hooks/api";
import { cn } from "@/lib/utils";
import { useForm } from "@tanstack/react-form";
import { useNavigate } from "@tanstack/react-router";
import { LoaderCircle } from "lucide-react";
import { Button } from "./ui/button";
import { toast } from "./ui/toast";

export function LogoutButton({
  className,
  ...props
}: React.ComponentProps<"button"> & {}) {
  const navigation = useNavigate();

  const logout = useApiMutation<void, any>(
    "/auth/logout",
    "POST",
    undefined,
    true,
  );

  const form = useForm({
    defaultValues: {},
    onSubmit: async () => {
      try {
        await logout.mutateAsync();

        toast.add({
          type: "success",
          description: "Logout successfully",
        });

        await new Promise((resolve) => setTimeout(resolve, 2000));

        navigation({ to: "/login" });
      } catch (error) {
        console.error("Logout error:", error);
        // toast("Logout failed", {
        //   description: error?.message || "An error occurred",
        //   className: "!text-destructive",
        //   descriptionClassName: "!text-destructive",
        //   closeButton: true,
        //   icon: <CircleX />,
        //   duration: 7000,
        // });
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
      >
        {([canSubmit, isSubmitting]) => (
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
      </form.Subscribe>
    </form>
  );
}
