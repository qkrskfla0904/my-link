"use client";

import * as React from "react";
import { Tabs as BaseTabs } from "@base-ui/react";
import { cn } from "@/lib/utils";

const Tabs = BaseTabs.Root;

const TabsList = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof BaseTabs.List>
>(({ className, ...props }, ref) => (
  <BaseTabs.List
    ref={ref}
    className={cn(
      "inline-flex items-center gap-1 bg-[#21242e] nintendo-inset p-1 text-[#dedede] w-full overflow-x-auto",
      className
    )}
    {...props}
  />
));
TabsList.displayName = "TabsList";

const TabsTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ComponentPropsWithoutRef<typeof BaseTabs.Tab>
>(({ className, ...props }, ref) => (
  <BaseTabs.Tab
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center whitespace-nowrap px-2.5 py-1 text-[10px] sm:text-[11px] font-bold uppercase transition-all focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 text-white/70 hover:text-white data-[active]:bg-[#f68d1f] data-[active]:text-white data-[active]:nintendo-chip data-[state=active]:bg-[#f68d1f] data-[state=active]:text-white data-[state=active]:nintendo-chip rounded-[2px] cursor-pointer",
      className
    )}
    {...props}
  />
));
TabsTrigger.displayName = "TabsTrigger";

const TabsContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof BaseTabs.Panel>
>(({ className, ...props }, ref) => (
  <BaseTabs.Panel
    ref={ref}
    className={cn(
      "mt-2 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
      className
    )}
    {...props}
  />
));
TabsContent.displayName = "TabsContent";

export { Tabs, TabsList, TabsTrigger, TabsContent };
