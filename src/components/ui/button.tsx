import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-1.5 whitespace-nowrap text-xs font-bold uppercase transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-3.5 [&_svg]:shrink-0 cursor-pointer select-none",
  {
    variants: {
      variant: {
        default:
          "bg-[#f68d1f] hover:bg-[#e48600] text-white nintendo-chip rounded-[2px]",
        nintendoOrange:
          "bg-[#f68d1f] hover:bg-[#e48600] text-white nintendo-chip rounded-[2px]",
        nintendoRed:
          "bg-[#e60012] hover:bg-[#c2000f] text-white nintendo-chip rounded-[2px]",
        nintendoCarbon:
          "bg-[#21242e] hover:bg-[#3d4f97] text-[#f68d1f] nintendo-chip rounded-[2px]",
        nintendoGold:
          "bg-[#ecab37] hover:bg-[#e48600] text-[#21242e] nintendo-chip rounded-[2px]",
        nintendoPlate:
          "bg-[#8ba1d4] hover:bg-[#7a8aba] text-[#21242e] nintendo-chip rounded-[2px]",
        nintendoInset:
          "bg-[#dedede] text-[#21242e] nintendo-inset rounded-[2px]",
        secondary:
          "bg-[#dedede] text-[#21242e] border border-[#3d4f97] hover:bg-white rounded-[2px]",
        destructive:
          "bg-[#a7282b] hover:bg-[#8e2023] text-white nintendo-chip rounded-[2px]",
        outline:
          "border-2 border-[#3d4f97] bg-transparent text-[#21242e] hover:bg-[#9fbee7]/40 rounded-[2px]",
        ghost:
          "hover:bg-[#3d4f97]/20 text-[#21242e] rounded-[2px]",
        link:
          "text-[#3d4f97] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-7 px-3 py-1 text-[11px]",
        sm: "h-6 px-2 py-0.5 text-[10px]",
        lg: "h-9 px-4 py-2 text-xs",
        icon: "h-7 w-7",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
