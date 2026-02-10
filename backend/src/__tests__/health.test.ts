import request from "supertest";
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import app from "../app";
import http, { Server } from "http";

describe("health", () => {
  const canListen = !process.env.CODEX_SANDBOX;
  const itIf = canListen ? it : it.skip;

  let server: Server;

  beforeAll(async () => {
    if (!canListen) return;
    server = http.createServer(app);
    await new Promise<void>((resolve) => {
      server.listen(0, "127.0.0.1", () => resolve());
    });
  });

  afterAll(async () => {
    if (!canListen) return;
    await new Promise<void>((resolve, reject) => {
      server.close((err) => (err ? reject(err) : resolve()));
    });
  });

  itIf("returns ok", async () => {
    const res = await request(server).get("/health");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: "ok" });
  });
});
