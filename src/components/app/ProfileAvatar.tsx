"use client";

import { useEffect, useState } from "react";

function initialsOf(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

/** Circle or squircle face: photo from /me, initials if the image is missing. */
export function ProfileAvatar({
  src,
  name,
  sizeClass,
  radiusClass,
}: {
  src?: string | null;
  name: string;
  sizeClass: string;
  radiusClass: string;
}) {
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    setFailed(false);
  }, [src]);
  const initials = initialsOf(name) || "A";
  if (src && !failed) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt=""
        onError={() => setFailed(true)}
        className={`${sizeClass} ${radiusClass} object-cover`}
      />
    );
  }
  return (
    <span
      className={`grid ${sizeClass} place-items-center ${radiusClass} bg-black text-[13px] font-bold tracking-wide text-accent`}
    >
      {initials}
    </span>
  );
}
