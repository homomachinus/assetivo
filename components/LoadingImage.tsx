"use client";

import { useState } from "react";
import Image from "next/image";

type LoadingImageProps = {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
};

export default function LoadingImage({ src, alt, className, sizes, priority }: LoadingImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <>
      {!isLoaded && (
        <div 
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "var(--media-bg)",
            color: "var(--muted)",
            fontSize: "13px",
            fontWeight: 500,
            zIndex: 1
          }}
        >
          Loading<span className="loading-dots"></span>
        </div>
      )}
      <img
        src={src}
        alt={alt}
        className={className}
        onLoad={() => setIsLoaded(true)}
        style={{
          opacity: isLoaded ? 1 : 0,
          transition: "opacity 0.2s ease-in-out",
          width: "100%",
          height: "100%",
          objectFit: "contain"
        }}
      />
    </>
  );
}
