import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-[2px] px-1.5 py-0.5 text-[9px] sm:text-[10px] font-bold uppercase transition-colors select-none",
  {
    variants: {
      variant: {
        default:
          "bg-[#dedede] text-[#21242e] border border-[#3d4f97]",
        secondary:
          "bg-[#9fbee7] text-[#21242e] border border-[#3d4f97]",
        destructive:
          "bg-[#a7282b] text-white",
        outline:
          "border border-[#3d4f97] text-[#21242e] bg-transparent",
        nintendoRed:
          "bg-[#e60012] text-white border border-[#21242e] font-black",
        nintendoOrange:
          "bg-[#f68d1f] text-white border border-[#21242e] font-black",
        nintendoGold:
          "bg-[#ecab37] text-[#21242e] border border-[#3d4f97] font-black",
        nintendoCarbon:
          "bg-[#21242e] text-[#f68d1f] font-black tracking-wider",
        nintendoPlate:
          "bg-[#8ba1d4] text-[#21242e] border border-[#3d4f97] font-bold",
        nintendoOnline:
          "bg-[#21242e] border border-white text-[#00ff66] font-bold tracking-wider",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
