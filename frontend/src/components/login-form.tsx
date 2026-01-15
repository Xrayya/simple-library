import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useForm } from "@tanstack/react-form";
import { Link } from "@tanstack/react-router";
import { FormField } from "./form-field";

import { loginSchema } from "@backend/validation-schemas/auth";

import { CircleCheck, CircleX, LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import z from "zod";
import { useApiMutation } from "@/hooks/api";

import { BaseError } from "@backend/exceptions/base";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const login = useApiMutation<
    z.infer<typeof loginSchema.json>,
    {
      validLogin: {
        username: string;
        email: string;
        role: string;
        accessToken: string;
        refreshToken: string;
      };
    }
  >("/auth/login", "POST", { fetcher: { credentials: "include" } });

  const defaultLoginValues: z.infer<typeof loginSchema.json> = {
    usernameOrEmail: "",
    password: "",
    deviceId: "web-client",
  };

  const form = useForm({
    defaultValues: defaultLoginValues,
    validators: {
      onChange: loginSchema.json,
    },
    onSubmit: async (values) => {
      try {
        const { validLogin } = await login.mutateAsync({
          ...values.value,
          deviceId: "web-client",
        });

        console.log("Login successful:", validLogin);

        toast("Login successful", {
          description: (
            <div className="flex flex-col">
              <div>Username: {validLogin.username}</div>
              <div>Email: {validLogin.email}</div>
            </div>
          ),
          closeButton: true,
          icon: <CircleCheck />,
        });

        await new Promise((resolve) => setTimeout(resolve, 2000));
      } catch (error) {
        console.error("Registration error:", error);
        toast("Registration failed", {
          description: (error as BaseError)?.message || "An error occurred",
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
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Welcome back</CardTitle>
          <CardDescription>Login with your Google account</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            }}
          >
            <div className="grid gap-6">
              <div className="flex flex-col gap-4">
                <Button variant="outline" className="w-full">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path
                      d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                      fill="currentColor"
                    />
                  </svg>
                  Login with Google
                </Button>
              </div>
              <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
                <span className="bg-card text-muted-foreground relative z-10 px-2">
                  Or continue with
                </span>
              </div>
              <div className="grid gap-1">
                <div className="grid">
                  <form.Field
                    name="usernameOrEmail"
                    children={(field) => (
                      <FormField
                        field={field}
                        label="Username or Email"
                        placeholder="user@example.com"
                      />
                    )}
                  />
                </div>
                <div className="grid">
                  <form.Field
                    name="password"
                    children={(field) => (
                      <FormField
                        field={field}
                        label="Password"
                        inputType="password"
                        extraLabel={
                          <a
                            href="#"
                            className="ml-auto text-sm underline-offset-4 hover:underline"
                            onClick={() => {
                              toast(
                                "Forgot password functionality is not implemented yet.",
                              );
                            }}
                          >
                            Forgot your password?
                          </a>
                        }
                      />
                    )}
                  />
                </div>
                <form.Subscribe
                  selector={(state) => [state.canSubmit, state.isSubmitting]}
                  children={([canSubmit, isSubmitting]) => (
                    <Button
                      type="submit"
                      disabled={!canSubmit}
                      className="w-full font-semibold flex gap-1 items-center"
                    >
                      {isSubmitting ? (
                        <LoaderCircle className="animate-spin" />
                      ) : null}
                      Login
                    </Button>
                  )}
                />
              </div>
              <div className="text-center text-sm">
                Don&apos;t have an account?{" "}
                <Link to="/register" className="underline underline-offset-4">
                  Register
                </Link>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
      <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </div>
    </div>
  );
}
