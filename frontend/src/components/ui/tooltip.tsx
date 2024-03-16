import * as React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";

import { cn } from "@/lib/utils";

interface TooltipProps extends Omit<TooltipPrimitive.TooltipContentProps, "content"> {
  content?: React.ReactNode | null | false;
  children: React.ReactNode;
  delayDuration?: number;
  skipDelayDuration?: number;
  disableHoverableContent?: boolean;
}
export const Tooltip = React.forwardRef<React.ElementRef<typeof TooltipPrimitive.Content>, TooltipProps>(
  (
    {
      children,
      content,
      sideOffset = 4,
      collisionPadding = 4,
      delayDuration,
      skipDelayDuration,
      disableHoverableContent = true,
      className,
      ...props
    },
    ref,
  ) => {
    if (content == null || content === false) {
      return children;
    }

    return (
      <TooltipPrimitive.Provider
        delayDuration={delayDuration}
        skipDelayDuration={skipDelayDuration}
        disableHoverableContent={disableHoverableContent}
      >
        <TooltipPrimitive.Root>
          <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>

          <TooltipPrimitive.Portal>
            <TooltipPrimitive.Content
              ref={ref}
              sideOffset={sideOffset}
              collisionPadding={collisionPadding}
              className={cn(
                "z-50 overflow-hidden rounded-md bg-primary px-3 py-1.5 text-xs text-primary-foreground animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
                className,
              )}
              {...props}
            >
              {content}
            </TooltipPrimitive.Content>
          </TooltipPrimitive.Portal>
        </TooltipPrimitive.Root>
      </TooltipPrimitive.Provider>
    );
  },
);
