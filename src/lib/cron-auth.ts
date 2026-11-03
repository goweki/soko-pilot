import { timingSafeEqual } from "node:crypto";

function constantTimeEqual(left: string, right: string) {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  return a.length === b.length && timingSafeEqual(a, b);
}

export function isAuthorizedCronRequest(
  authorization: string | null | undefined,
  secrets: (string | null | undefined)[],
): boolean {
  const configured = secrets.filter(
    (value): value is string => Boolean(value?.trim()),
  );
  if (!configured.length) return false;
  if (!authorization?.startsWith("Bearer ")) return false;
  const supplied = authorization.slice(7);
  if (!supplied) return false;
  return configured.some((secret) =>
    constantTimeEqual(supplied, secret.trim()),
  );
}
