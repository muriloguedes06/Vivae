import type { InputHTMLAttributes } from "react";
import { Icon } from "./Icon";

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: string;
  error?: boolean;
}

export function FormField({
  label,
  icon,
  error,
  className = "",
  ...props
}: FormFieldProps) {
  return (
    <label className="form-field">
      <span>{label}</span>
      <div className={`input-wrap ${error ? "has-error" : ""} ${className}`}>
        {icon && <Icon>{icon}</Icon>}
        <input {...props} />
      </div>
    </label>
  );
}
