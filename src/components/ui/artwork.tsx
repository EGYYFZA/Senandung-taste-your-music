"use client";
import Image from "next/image";
import { useState } from "react";
import type { ArtworkTone } from "@/features/catalog/types";

export function Artwork({
  tone,
  title,
  compact = false,
  imageUrl,
}: {
  tone: ArtworkTone;
  title: string;
  compact?: boolean;
  imageUrl?: string;
}) {
  const [failedUrl, setFailedUrl] = useState<string>();
  return (
    <div
      className={`artwork artwork--${tone}${compact ? " artwork--compact" : ""}`}
      aria-hidden="true"
    >
      {imageUrl && imageUrl !== failedUrl ? (
        <Image
          className="artwork-image"
          unoptimized
          src={imageUrl}
          width={480}
          height={360}
          alt=""
          onError={() => setFailedUrl(imageUrl)}
        />
      ) : (
        <>
          <span className="artwork-orbit" />
          <span className="artwork-disc" />
          <span className="artwork-label">SENANDUNG STUDIO</span>
          <span className="artwork-title">{title}</span>
          <span className="artwork-edition">VOL. 01 / A LITTLE ESCAPE</span>
        </>
      )}
    </div>
  );
}
