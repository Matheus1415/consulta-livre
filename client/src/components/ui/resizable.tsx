"use client"

import * as React from "react"
import * as ResizablePrimitive from "react-resizable-panels"
import { GripVertical } from "lucide-react"
import { cn } from "@/lib/utils"

export const ResizablePanelGroup = ({
  className,
  ...props
}: React.ComponentProps<typeof ResizablePrimitive.PanelGroup>) => (
  <ResizablePrimitive.PanelGroup
    className={cn(
      "flex h-full w-full data-[panel-group-direction=vertical]:flex-col",
      className
    )}
    {...props}
  />
)

export const ResizablePanel = ResizablePrimitive.Panel

export const ResizableHandle = ({
  withHandle,
  className,
  ...props
}: React.ComponentProps<typeof ResizablePrimitive.PanelResizeHandle> & {
  withHandle?: boolean
}) => (
  <ResizablePrimitive.PanelResizeHandle
    className={cn(
      "relative flex w-px items-center justify-center bg-white/10 transition-all hover:bg-purple-500/50 data-[panel-group-direction=vertical]:h-px data-[panel-group-direction=vertical]:w-full after:absolute after:inset-y-0 after:left-1/2 after:w-1 after:-translate-x-1/2",
      className
    )}
    {...props}
  >
    {withHandle && (
      <div className="z-10 flex h-6 w-3 items-center justify-center rounded-sm border border-white/10 bg-[#161616]">
        <GripVertical className="h-2.5 w-2.5 text-neutral-500" />
      </div>
    )}
  </ResizablePrimitive.PanelResizeHandle>
)