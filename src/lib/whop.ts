export function getWhopAccessToken(): string | null {
  if (typeof document === "undefined") {
    return null;
  }

  const cookie = document.cookie
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith("whop_user_token="));

  if (cookie) {
    const [, value] = cookie.split("=");
    if (value) {
      try {
        return decodeURIComponent(value);
      } catch (error) {
        console.error("Failed to decode whop_user_token cookie", error);
        return null;
      }
    }
  }

  const globalToken =
    (typeof window !== "undefined" &&
      ((window as unknown as { whop?: { userToken?: string } }).whop?.userToken ||
        (window as { WHOP_USER_TOKEN?: string }).WHOP_USER_TOKEN)) ||
    null;

  return globalToken || null;
}
