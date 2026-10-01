import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { Ping, Response } from "../src/lib/ping";

describe("Ping", () => {
  it("replies with pong !!", () => {
    assert.equal(Ping(), "pong !!");
    assert.equal(Response, "pong !!");
  });
});
