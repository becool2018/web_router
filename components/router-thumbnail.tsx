"use client";

import * as React from "react";
import Image from "next/image";
import { Router as RouterIcon } from "lucide-react";

import { cn } from "@/lib/utils";

type Props = {
  alt: string;
  src?: string;
  className?: string;
};

export function RouterThumbnail({ alt, src, className }: Props) {
  const [failed, setFailed] = React.useState(false);

  if (!src || failed) {
    return (
      <span
        className={cn(
          "bg-muted text-muted-foreground inline-flex size-10 shrink-0 items-center justify-center rounded border border-border",
          className
        )}
        aria-hidden
      >
        <RouterIcon className="size-5" />
      </span>
    );
  }

  return (
    <span
      className={cn(
        "relative inline-flex size-10 shrink-0 overflow-hidden rounded border border-border bg-white",
        className
      )}
    >
      <Image
        src={src}
        alt={alt}
        width={40}
        height={40}
        className="object-contain p-0.5"
        sizes="40px"
        onError={() => setFailed(true)}
      />
    </span>
  );
}
