"use client";

import Image from "next/image";

export function HeroBackdrop({
  src,
  alt = "",
  priority = true,
}: {
  src: string;
  alt?: string;
  priority?: boolean;
}) {
  return (
    <div className="absolute inset-0 -z-10">
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        className="object-cover"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-ink-950/80 backdrop-blur-[1px]" />
    </div>
  );
}