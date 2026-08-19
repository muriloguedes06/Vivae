import type { ReactNode } from "react";

export function Icon({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span className={`material-symbols-outlined ${className}`}>{children}</span>
  );
}
