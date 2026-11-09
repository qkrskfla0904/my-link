"use client";

import * as React from "react";
import { RadioGroup as BaseRadioGroup, Radio as BaseRadio } from "@base-ui/react";
import { Circle } from "lucide-react";
import { cn } from "@/lib/utils";

export interface RadioGroupProps
  extends Omit<React.ComponentPropsWithoutRef<typeof BaseRadioGroup>, "onValueChange"> {
  onValueChange?: (value: string) => void;
}

const RadioGroup = React.forwardRef<HTMLDivElement, RadioGroupProps>(
  ({ className, onValueChange, ...props }, ref) => {
    return (
      <BaseRadioGroup
        className={cn("grid gap-1.5", className)}
        onValueChange={(val: unknown) => {
          if (onValueChange) {
            onValueChange(String(val));
          }
        }}
        {...props}
        ref={ref}
      />
    );
  }
);
RadioGroup.displayName = "RadioGroup";

export interface RadioGroupItemProps
  extends React.ComponentPropsWithoutRef<typeof BaseRadio.Root> {}

const RadioGroupItem = React.forwardRef<HTMLButtonElement, RadioGroupItemProps>(
  ({ className, ...props }, ref) => {
    return (
      <BaseRadio.Root
        ref={ref}
        className={cn(
          "aspect-square h-3.5 w-3.5 rounded-full bg-[#dedede] nintendo-inset text-[#f68d1f] focus:outline-none focus-visible:ring-1 focus-visible:ring-[#f68d1f] disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer flex items-center justify-center border-0 p-0",
          className
        )}
        {...props}
      >
        <BaseRadio.Indicator className="flex items-center justify-center">
          <Circle className="h-2 w-2 fill-[#f68d1f] text-[#f68d1f]" />
        </BaseRadio.Indicator>
      </BaseRadio.Root>
    );
  }
);
RadioGroupItem.displayName = "RadioGroupItem";

export { RadioGroup, RadioGroupItem };
