import * as assert from "assert";

import { flipQuotes, targetQuote, reEscape } from "../quote";

// targetQuote

suite("targetQuote", () => {
  test("single char → single quote", () => {
    assert.strictEqual(targetQuote('"', "a"), "'");
  });
  test("multi char → double quote", () => {
    assert.strictEqual(targetQuote("'", "hello"), '"');
  });
  test("backtick single char → single quote", () => {
    assert.strictEqual(targetQuote("`", "a"), "'");
  });
  test("backtick multi char → double quote", () => {
    assert.strictEqual(targetQuote("`", "hello"), '"');
  });
  test("backtick with interpolation → backtick preserved", () => {
    assert.strictEqual(targetQuote("`", "hello ${name}"), "`");
  });
});

// reEscape

suite("reEscape", () => {
  test("unescapes old quote", () => {
    assert.strictEqual(reEscape("\\'hello", "'", '"'), "'hello");
  });
  test("escapes new quote — to single", () => {
    assert.strictEqual(reEscape("it's", '"', "'"), "it\\'s");
  });
  test("escapes new quote — to double", () => {
    assert.strictEqual(reEscape('say "hi"', "'", '"'), 'say \\"hi\\"');
  });
  test("no-op when no conflict", () => {
    assert.strictEqual(reEscape("hello", '"', "'"), "hello");
  });
});

// flipQuotes

suite("flipQuotes — single char", () => {
  test("\"a\" → 'a'", () => assert.strictEqual(flipQuotes('"a"'), "'a'"));
  test("'a' stays 'a'", () => assert.strictEqual(flipQuotes("'a'"), "'a'"));
  test("`a` → 'a'", () => assert.strictEqual(flipQuotes("`a`"), "'a'"));
});

suite("flipQuotes — multi char", () => {
  test('"hello" stays "hello"', () =>
    assert.strictEqual(flipQuotes('"hello"'), '"hello"'));
  test("'hello' → \"hello\"", () =>
    assert.strictEqual(flipQuotes("'hello'"), '"hello"'));
  test('`hello` → "hello"', () =>
    assert.strictEqual(flipQuotes("`hello`"), '"hello"'));
});

suite("flipQuotes — escaping", () => {
  test("'it\\'s' → \"it's\"", () =>
    assert.strictEqual(flipQuotes("'it\\'s'"), '"it\'s"'));
  test('"say \\"hi\\"" → \'say "hi"\'... wait, multi so stays double', () => {
    assert.strictEqual(flipQuotes('"say \\"hi\\""'), '"say \\"hi\\""');
  });
});

suite("flipQuotes — template literals", () => {
  test("`hello ${name}` preserved", () => {
    assert.strictEqual(flipQuotes("`hello ${name}`"), "`hello ${name}`");
  });
  test('`hello` → "hello" (no interpolation)', () => {
    assert.strictEqual(flipQuotes("`hello`"), '"hello"');
  });
});

suite("flipQuotes — multiple strings on a line", () => {
  test("mixed on same line", () => {
    assert.strictEqual(flipQuotes(`'a' "bb" 'ccc'`), `'a' "bb" "ccc"`);
  });
  test("all need flipping", () => {
    assert.strictEqual(flipQuotes(`"a" 'bb'`), `'a' "bb"`);
  });
});

suite("flipQuotes — edge cases", () => {
  test("empty string → single quotes (0 chars = not multi)", () => {
    assert.strictEqual(flipQuotes('""'), "''");
  });
  test("no quotes unchanged", () =>
    assert.strictEqual(flipQuotes("hello"), "hello"));
  test("unicode single char", () =>
    assert.strictEqual(flipQuotes('"é"'), "'é'"));
  test("emoji = single char", () =>
    assert.strictEqual(flipQuotes('"🔥"'), "'🔥'"));
  test("two emojis = multi char", () =>
    assert.strictEqual(flipQuotes("'🔥🔥'"), '"🔥🔥"'));
});