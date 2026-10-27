"use client";

import { useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { Button } from "./button";

import { VariantProps } from "class-variance-authority";
import { buttonVariants } from "@/components/ui/button";
import type { Locale } from "@/lib/i18n";
import { messages } from "@/lib/i18n";

type ButtonVariant = VariantProps<typeof buttonVariants>["variant"];

export default function ThemeToggle({
  locale,
  variant = "link",
}: {
  locale: Locale;
  variant?: ButtonVariant;
}) {
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const { resolvedTheme, setTheme } = useTheme();
  const text = messages[locale];

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  return mounted ? (
    <Button
      aria-label={resolvedTheme === "dark" ? text.switchToLightTheme : text.switchToDarkTheme}
      onClick={toggleTheme}
      variant={variant}
    >
      <span className="sr-only">
        {resolvedTheme === "dark" ? text.switchToLightTheme : text.switchToDarkTheme}
      </span>
      {resolvedTheme === "dark" ? (
        <Sun aria-hidden="true" className="h-5 w-5" />
      ) : (
        <Moon aria-hidden="true" className="h-5 w-5" />
      )}
    </Button>
  ) : null;
}
