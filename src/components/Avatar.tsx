"use client";

import Image from "next/image";

interface AvatarProps {
  src?: string | null;
  initials: string;
  size?: number;
  className?: string;
}

const gradients = [
  "linear-gradient(135deg, #007AFF, #5856D6)",
  "linear-gradient(135deg, #34C759, #30D158)",
  "linear-gradient(135deg, #FF9500, #FF6B00)",
  "linear-gradient(135deg, #AF52DE, #DA3EF5)",
  "linear-gradient(135deg, #FF3B30, #FF6259)",
  "linear-gradient(135deg, #5AC8FA, #007AFF)",
  "linear-gradient(135deg, #FF2D55, #FF6482)",
  "linear-gradient(135deg, #FFD60A, #FF9F0A)",
];

function getGradient(initials: string): string {
  const code = (initials.charCodeAt(0) + (initials.charCodeAt(1) || 0)) % gradients.length;
  return gradients[code];
}

export default function Avatar({ src, initials, size = 40, className = "" }: AvatarProps) {
  if (src) {
    return (
      <div
        className={`relative rounded-full overflow-hidden flex-shrink-0 ${className}`}
        style={{ width: size, height: size }}
      >
        <Image
          src={src}
          alt=""
          fill
          className="object-cover"
          sizes={`${size}px`}
        />
      </div>
    );
  }

  return (
    <div
      className={`rounded-full flex items-center justify-center flex-shrink-0 ${className}`}
      style={{
        width: size,
        height: size,
        background: getGradient(initials),
      }}
    >
      <span
        style={{
          color: "#fff",
          fontSize: size * 0.38,
          fontWeight: 500,
          letterSpacing: "-0.2px",
        }}
      >
        {initials}
      </span>
    </div>
  );
}
