import type { AnyFieldApi } from "@tanstack/react-form";
import { cn } from "@/lib/utils";

export function FieldInfo({ field }: { field: AnyFieldApi }) {
  const showError = field.state.meta.isTouched && !field.state.meta.isValid;
  const isValidating = field.state.meta.isValidating;

  return (
    <div className="min-h-[1rem] text-xs mt-1">
      {showError && (
        <p className="text-destructive">
          {field.state.meta.errors 
            .map((error) => {
              if (
                typeof error === "object" &&
                typeof error.message === "string"
              ) {
                return error.message;
              }

              return error;
            })
            .join(", ")}
        </p>
      )}
      {isValidating && (
        <p className={cn("text-muted-foreground", showError && "mt-1")}>
          Validating...
        </p>
      )}
    </div>
  );
}
