import { describe, it, expect } from "vitest";
import { parsePassport } from "./passport.parser";

describe("parsePassport", () => {
  it("parses document number and place of birth", () => {
    const text = `
      PASSPORT PRT
      PLACE OF BIRTH LISBON
      AB1234567
    `;

    const parsed = parsePassport(text);
    expect(parsed.documentNumber).toBe("AB1234567");
    expect(parsed.placeOfBirth).toBe("LISBON");
  });
});
