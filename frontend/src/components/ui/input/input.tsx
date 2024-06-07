import * as React from "react";

import { cn } from "@/lib/utils";
import { inputVariants } from "./input.constants";
import { VariantProps } from "class-variance-authority";

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size">,
    VariantProps<typeof inputVariants> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, type, size, ...props }, ref) => {
  return <input type={type} className={cn(inputVariants({ size, className }))} ref={ref} {...props} />;
});
Input.displayName = "Input";

export { Input };
