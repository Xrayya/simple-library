import { Button } from "#/components/ui/button.tsx";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "#/components/ui/card.tsx";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
  FieldSet,
} from "#/components/ui/field.tsx";
import { Input } from "#/components/ui/input.tsx";
import { toast } from "#/components/ui/toast.tsx";
import { accessToken } from "#/models/accessToken.ts";
import { loginSchema } from "#/validation-schemas/auth.ts";
import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { GalleryVerticalEnd, LoaderCircle } from "lucide-react";
import type { z } from "zod";
import { Route as registerRoute } from "./register";

export const Route = createFileRoute("/login")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();

  const login = useMutation({
    mutationFn: async (
      loginInfo: z.infer<typeof loginSchema>,
    ): Promise<{
      username: string;
      email: string;
      accessToken: string;
    }> => {
      const url = new URL(`/api/auth/login`, window.location.origin);

      const response = await fetch(url, {
        headers: { "Content-Type": "application/json" },
        method: "POST",
        credentials: "include",
        body: JSON.stringify({ ...loginInfo }),
      });

      if (!response.ok) {
        const payload = await response.json();

        throw new Error(
          payload?.error?.message || "An error occurred while fetching data",
          { cause: payload?.error?.name },
        );
      }

      const payload = await response.json();
      return payload.validLogin;
    },
    onSuccess: (data) => {
      toast.add({
        type: "success",
        description: "Login succesfully",
      });

      accessToken.set(data.accessToken);

      setTimeout(() => {
        // TODO: navigate to home
        // navigate({
        //   to: homeRoute.to,
        // });
      }, 500);
    },
  });

  const form = useForm({
    defaultValues: {
      usernameOrEmail: "",
      password: "",
    },
    validators: {
      onChange: loginSchema,
    },
    onSubmit: async ({ value }) => {
      await login.mutateAsync({ ...value });
    },
  });

  // const handleGoogleLoginClick = () => {
  //   window.location.href = `${env.VITE_BACKEND_ENDPOINT}${env.VITE_BACKEND_ROUTE_PREFIX}/auth/google`;
  // };

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <a href="#" className="flex items-center gap-2 self-center font-medium">
          <div className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <GalleryVerticalEnd className="size-4" />
          </div>
          Simple Note Taking App
        </a>
        <div className="flex flex-col gap-6">
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
                <form.Subscribe
                  selector={(state) => [state.canSubmit, state.isSubmitting]}
                >
                  {([canSubmit, isSubmitting]) => (
                    <FieldSet>
                      <FieldGroup>
                        <Field>
                          <Button
                            variant="outline"
                            type="button"
                            disabled={isSubmitting}
                          // onClick={handleGoogleLoginClick}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                            >
                              <path
                                d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                                fill="currentColor"
                              />
                            </svg>
                            Login with Google
                          </Button>
                        </Field>
                        <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
                          Or continue with
                        </FieldSeparator>
                        <form.Field name="usernameOrEmail">
                          {(field) => (
                            <Field>
                              <FieldLabel htmlFor={field.name}>
                                Username or Email
                              </FieldLabel>
                              <Input
                                type="text"
                                id={field.name}
                                name={field.name}
                                disabled={isSubmitting}
                                onBlur={field.handleBlur}
                                onChange={(e) => {
                                  field.handleChange(e.target.value);
                                }}
                                placeholder="John Doe"
                                required
                              />
                            </Field>
                          )}
                        </form.Field>
                        <form.Field name="password">
                          {(field) => (
                            <Field>
                              <div className="flex items-center">
                                <FieldLabel htmlFor={field.name}>
                                  Password
                                </FieldLabel>
                                <a
                                  href="#"
                                  className="ml-auto text-sm underline-offset-4 hover:underline"
                                >
                                  Forgot your password?
                                </a>
                              </div>
                              <Input
                                type="password"
                                id={field.name}
                                name={field.name}
                                disabled={isSubmitting}
                                onBlur={field.handleBlur}
                                onChange={(e) => {
                                  field.handleChange(e.target.value);
                                }}
                                required
                              />
                            </Field>
                          )}
                        </form.Field>
                        <Field>
                          <Button type="submit" disabled={!canSubmit}>
                            {isSubmitting ? (
                              <LoaderCircle className="animate-spin" />
                            ) : null}
                            Login
                          </Button>
                          <FieldDescription className="text-center">
                            <span>Don&apos;t have an account? </span>
                            <Link to={registerRoute.to}>Register</Link>
                          </FieldDescription>
                        </Field>
                      </FieldGroup>
                    </FieldSet>
                  )}
                </form.Subscribe>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
