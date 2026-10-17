"use client";

import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { cn } from "cn";
import { X } from "lucide-react";

const Dialog = DialogPrimitive.Root;
const DialogTrigger = DialogPrimitive.Trigger;
const DialogClose = DialogPrimitive.Close;

function DialogPortal({ children, ...props }: DialogPrimitive.Portal.Props) {
  return (
    <DialogPrimitive.Portal {...props}>
      <DialogPrimitive.Backdrop className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[1px] transition-opacity duration-200 data-ending-style:opacity-0 data-starting-style:opacity-0" />
      {children}
    </DialogPrimitive.Portal>
  );
}

function DialogSheetContent({
  className,
  children,
  title,
  ...props
}: DialogPrimitive.Popup.Props & { title: string }) {
  return (
    <DialogPortal>
      <DialogPrimitive.Popup
        className={cn(
          "fixed inset-x-0 bottom-0 z-50 max-h-[85vh] rounded-t-3xl border-t border-border bg-card shadow-xl outline-none",
          "transition-transform duration-250 ease-out data-ending-style:translate-y-full data-starting-style:translate-y-full",
          className,
        )}
        {...props}
      >
        <div className="mx-auto mt-2.5 h-1 w-10 rounded-full bg-border" />
        <div className="flex items-center justify-between px-4 pt-3 pb-1">
          <DialogPrimitive.Title className="text-sm font-semibold">
            {title}
          </DialogPrimitive.Title>
          <DialogPrimitive.Close
            aria-label="Close"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted"
          >
            <X size={18} aria-hidden />
          </DialogPrimitive.Close>
        </div>
        <div className="flex h-[calc(85vh-3.5rem)] flex-col">{children}</div>
      </DialogPrimitive.Popup>
    </DialogPortal>
  );
}

export { Dialog, DialogTrigger, DialogClose, DialogSheetContent };
