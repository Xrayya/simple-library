import type { AnyFieldApi } from "@tanstack/react-form";
import { FieldInfo } from "./field-info";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

export function FormField({
  field,
  label,
  inputType,
  placeholder,
  extraLabel,
}: {
  field: AnyFieldApi;
  label: React.ReactNode;
  inputType?: React.HTMLInputTypeAttribute;
  placeholder?: string;
  extraLabel?: React.ReactNode;
}) {
  return (
    <>
      <div className="flex items-center justify-between">
        <Label htmlFor={field.name} className="mb-2 font-semibold">
          {label}
        </Label>
        {extraLabel ? extraLabel : null}
      </div>
      <Input
        id={field.name}
        type={inputType}
        placeholder={placeholder}
        value={field.state.value}
        onBlur={field.handleBlur}
        onChange={(e) => {
          field.handleChange(e.target.value);
        }}
        required
      />
      <FieldInfo field={field} />
    </>
  );
}
