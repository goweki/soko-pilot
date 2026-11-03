import assert from "node:assert/strict";
import test from "node:test";
import { isLocale, locales, messages } from "./i18n";

function keyShape(value: unknown, prefix = ""): string[] {
  if (typeof value !== "object" || value === null) return [prefix];
  return Object.entries(value as Record<string, unknown>).flatMap(([key, v]) =>
    keyShape(v, prefix ? `${prefix}.${key}` : key),
  );
}

test("locale helpers accept only supported locales", () => {
  assert.deepEqual([...locales], ["en", "sw"]);
  assert.equal(isLocale("en"), true);
  assert.equal(isLocale("sw"), true);
  assert.equal(isLocale("fr"), false);
  assert.equal(isLocale(""), false);
});

test("english and kiswahili dictionaries expose identical key shapes", () => {
  assert.deepEqual(keyShape(messages.sw).sort(), keyShape(messages.en).sort());
  for (const leaf of keyShape(messages.en)) {
    const value = leaf
      .split(".")
      .reduce<unknown>(
        (node, key) =>
          (node as Record<string, unknown>)?.[key],
        messages.en,
      );
    assert.equal(typeof value, "string", `en.${leaf} must be a string`);
    assert.ok((value as string).trim().length > 0, `en.${leaf} must not be empty`);
  }
});
