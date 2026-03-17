/**
 * Base URL for the DarkGrid / threat-intel backend.
 * Set NEXT_PUBLIC_THREAT_API_URL in frontend/.env.local (e.g. http://localhost:8000).
 * In dev, falls back to http://localhost:8000 when unset so the banner goes away if the backend is running.
 */
export function getThreatApiBase(): string {
  const env = typeof process !== "undefined" ? process.env.NEXT_PUBLIC_THREAT_API_URL : undefined;
  if (env != null && env !== "") return env;
  if (typeof window !== "undefined" && window.location?.hostname === "localhost") {
    return "http://localhost:8000";
  }
  return "";
}
