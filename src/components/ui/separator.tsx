"use client";

import * as React from "react";
import { Separator as BaseSeparator } from "@base-ui/react";
import { cn } from "@/lib/utils";

const Separator = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof BaseSeparator> & {
    decorative?: boolean;
  }
>(
  (
    { className, orientation = "horizontal", decorative = true, ...props },
    ref
  ) => (
    <BaseSeparator
      ref={ref}
      orientation={orientation}
      className={cn(
        "shrink-0",
        orientation === "horizontal"
          ? "h-[2px] w-full border-t border-[#3d4f97] border-b border-white/60"
          : "h-full w-[2px] border-l border-[#3d4f97] border-r border-white/60",
        className
      )}
      {...props}
    />
  )
);
Separator.displayName = "Separator";

export { Separator };
