import { describe, it, expect } from "vitest";
import { createPersonSchema } from "../modules/persons/persons.routes";
import { createDocumentSchema } from "../modules/documents/documents.routes";

describe("validation schemas", () => {
  it("accepts valid person payload", () => {
    const result = createPersonSchema.safeParse({
      fullName: "Joao Silva",
      dateOfBirth: "1990-01-20",
      cc: "12345678",
      nif: "123456789",
      phone: "912345678",
      postalCode: "1234-567",
    });

    expect(result.success).toBe(true);
  });

  it("rejects invalid person payload", () => {
    const result = createPersonSchema.safeParse({
      fullName: "Joao Silva",
      dateOfBirth: "20/01/1990",
      cc: "ABC",
      nif: "123",
      phone: "9",
      postalCode: "1234567",
    });

    expect(result.success).toBe(false);
  });

  it("accepts valid document payload", () => {
    const result = createDocumentSchema.safeParse({
      personId: "2f6f2a0a-49c8-4b86-8b01-6d4c0c1a2f7b",
      type: "CARTAO_CIDADAO",
      documentNumber: "12345678",
      nif: "123456789",
    });

    expect(result.success).toBe(true);
  });
});
