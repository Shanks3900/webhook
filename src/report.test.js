import test from "node:test";
import assert from "node:assert/strict";
import { briefName, buildBrief } from "./report.js";

test("buildBrief returns a docx (zip) buffer", async () => {
  const buf = await buildBrief({ title: "Test", owner: "me", items: [{ name: "a", value: 1 }] });
  assert.ok(buf.length > 0);
  assert.equal(buf.subarray(0, 2).toString(), "PK");
});

test("buildBrief handles scalar items", async () => {
  const buf = await buildBrief({ items: ["x", "y"] });
  assert.equal(buf.subarray(0, 2).toString(), "PK");
});

test("briefName is sanitized and ends in .docx", () => {
  const n = briefName({ title: "../bad/name?*" });
  assert.match(n, /^Brief-[\w-]+-\d{4}-.*\.docx$/);
  assert.ok(!n.includes("/"));
});
