import assert from "node:assert/strict";
import test from "node:test";
import { parsePriceMinor, parseStockQuantity } from "./catalogue-input";

test("price input is converted to integer minor units without accepting ambiguous formats", () => {
  assert.equal(parsePriceMinor("4200"), 420000);
  assert.equal(parsePriceMinor("42.5"), 4250);
  assert.equal(parsePriceMinor("0.01"), 1);
  assert.equal(parsePriceMinor("1.234"), null);
  assert.equal(parsePriceMinor("1e3"), null);
  assert.equal(parsePriceMinor("-1"), null);
  assert.equal(parsePriceMinor(""), null);
});

test("stock input accepts only bounded whole non-negative quantities", () => {
  assert.equal(parseStockQuantity("0"), 0);
  assert.equal(parseStockQuantity("999999"), 999999);
  assert.equal(parseStockQuantity("1.5"), null);
  assert.equal(parseStockQuantity("-1"), null);
  assert.equal(parseStockQuantity("1000000"), null);
});
