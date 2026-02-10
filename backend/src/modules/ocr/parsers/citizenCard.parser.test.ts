import { describe, it, expect } from "vitest";
import { parseCitizenCard } from "./citizenCard.parser";

describe("parseCitizenCard", () => {
  it("parses name, cc, dob and nif", () => {
    const front = `
      NOME
      JOAO
      APELIDO
      SILVA
      12 03 1990
      12345678
    `;
    const back = `
      NIF 245716633
    `;

    const parsed = parseCitizenCard(front, back);
    expect(parsed.fullName).toBe("JOAO SILVA");
    expect(parsed.documentNumber).toBe("12345678");
    expect(parsed.dateOfBirth).toBe("1990-03-12");
    expect(parsed.nif).toBe("245716633");
  });

  it("accepts nif when present", () => {
    const front = `
      NOME
      MARIA
      APELIDO
      COSTA
      05 02 1985
      12345678
    `;
    const back = `
      NIF 123456789
    `;

    const parsed = parseCitizenCard(front, back);
    expect(parsed.nif).toBe("123456789");
  });
});
