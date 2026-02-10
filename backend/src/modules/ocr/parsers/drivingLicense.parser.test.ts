import { describe, it, expect } from "vitest";
import { parseDrivingLicense } from "./drivingLicense.parser";

describe("parseDrivingLicense", () => {
  it("parses document number and categories", () => {
    const front = `
      1. JOAO SILVA
      5. N.º AB123456
    `;
    const back = `
      9. CATEGORIAS B B1
    `;

    const parsed = parseDrivingLicense(front, back);
    expect(parsed.documentNumber).toBe("AB123456");
    expect(parsed.categories).toEqual(["B", "B1"]);
  });
});
