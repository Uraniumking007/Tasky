/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const labelVariants = cva(
  "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
  {
    variants: {
      vars: {
        base: "bg-base-100 text-base-content",
        primary: "bg-primary-100 text-primary-content",
        secondary: "bg-secondary-100 text-secondary-content",
        accent: "bg-accent-100 text-accent-content",
      },
    },
    defaultVariants: {
      vars: "base",
    },
  }
);

const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> &
    VariantProps<typeof labelVariants>
>(({ vars = "base", className, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn(labelVariants({ vars }), className)}
    {...props}
  />
));
Label.displayName = LabelPrimitive.Root.displayName;

export { Label };
