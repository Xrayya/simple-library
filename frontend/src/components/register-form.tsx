import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";

import { useForm } from "@tanstack/react-form";
import { FormField } from "./form-field";

import { registerSchema } from "@backend/validation-schemas/auth";

export function RegisterForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const form = useForm({
    defaultValues: {
      username: "",
      email: "",
      password: "",
    },
    validators: {
      onChange: registerSchema.json,
    },
    onSubmit: (values) => {
      console.log("Form submitted with values:", values);
      // Handle form submission logic here
    },
  });

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Welcome back</CardTitle>
          <CardDescription>Register with your Google account</CardDescription>
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
                  Register with Google
                </Button>
              </div>
              <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
                <span className="bg-card text-muted-foreground relative z-10 px-2">
                  Or regsiter with
                </span>
              </div>
              <div className="grid gap-1">
                <div className="grid">
                  <form.Field
                    name="username"
                    children={(field) => (
                      <FormField
                        field={field}
                        label="Username"
                        placeholder="username"
                      />
                    )}
                  />
                </div>
                <div className="grid">
                  <form.Field
                    name="email"
                    children={(field) => (
                      <FormField
                        field={field}
                        label="Email"
                        inputType="email"
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
                      />
                    )}
                  />
                </div>
                <Button type="submit" className="w-full font-semibold">
                  Register
                </Button>
              </div>
              <div className="text-center text-sm">
                Already have an account?{" "}
                <Link to="/login" className="underline underline-offset-4">
                  Login
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
