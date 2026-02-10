import type { Person, Document, ParsedCitizenCard } from "./domain";
import type { Profile } from "./user";

export type AuthLoginResponse = {
  token: string;
};

export type AuthRegisterResponse = {
  token: string;
  user: {
    id: string;
    email: string;
    role: string;
  };
};

export type UserProfileResponse = Profile;

export type PersonsListResponse = Person[];
export type PersonResponse = Person & { documents: Document[] };

export type OcrCreateResponse =
  | { status: "NEEDS_CONFIRMATION"; parsed: ParsedCitizenCard }
  | { message: string };

export type OcrConfirmResponse =
  | {
      status: "CREATED";
      person: Person;
      document: Document;
    }
  | { message: string };
