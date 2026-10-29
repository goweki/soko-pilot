import Image from "next/image";
import Link from "next/link";
import { messages, type Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function BrandLogo({
  locale,
  href,
  size = "md",
  showName = true,
  className,
}: {
  locale: Locale;
  href: string;
  size?: "sm" | "md";
  showName?: boolean;
  className?: string;
}) {
  const compact = size === "sm";

  return (
    <Link
      className={cn(
        "group flex w-fit items-center",
        compact ? "gap-2" : "gap-2.5",
        className,
      )}
      href={href}
      aria-label={messages[locale].brand}
    >
      <span
        className={cn(
          "shrink-0 overflow-hidden rounded-lg",
          compact ? "size-8" : "size-10",
        )}
      >
        <Image
          alt=""
          src="/img/symbol-512.png"
          width={512}
          height={512}
          priority
          className="size-full scale-140 object-cover"
        />
      </span>
      {showName && (
        <span
          className={cn(
            "font-semibold tracking-tight",
            compact ? "text-base" : "text-lg",
          )}
        >
          {messages[locale].brand}
        </span>
      )}
    </Link>
  );
}
