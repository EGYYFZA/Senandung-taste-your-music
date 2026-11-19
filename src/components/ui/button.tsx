import type { ComponentProps } from "react";

export function Button({
  className = "",
  variant = "primary",
  type = "button",
  ...props
}: ComponentProps<"button"> & { variant?: "primary" | "secondary" | "ghost" }) {
  return <button className={`button button--${variant} ${className}`} type={type} {...props} />;
}
