import { describe, it, expect } from "vitest";
import { parseResidencePermit } from "./residencePermit.parser";

describe("parseResidencePermit", () => {
  it("parses number, name and residence type", () => {
    const text = `
      NAME MARIA COSTA
      TYPE TEMPORARY
      AB1234567
    `;

    const parsed = parseResidencePermit(text);
    expect(parsed.documentNumber).toBe("AB1234567");
    expect(parsed.fullName).toBe("MARIA COSTA");
    expect(parsed.residenceType).toBe("TEMPORARY");
  });
});
