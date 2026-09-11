import { ZodError } from "zod";

export function getZodErrorMessage(error: ZodError): string {
  return error.issues.map(issue => issue.message).join(", ");
}