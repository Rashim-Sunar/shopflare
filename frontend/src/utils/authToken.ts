/**
 * Returns a clean JWT string from localStorage or null when missing/invalid.
 */
export const getAuthToken = () => {
  const rawToken = localStorage.getItem("userToken");

  if (!rawToken) return null;

  let token = rawToken.trim();

  if (!token || token === "null" || token === "undefined") {
    return null;
  }

  // Some flows may accidentally persist a JSON-stringified token.
  if (
    (token.startsWith('"') && token.endsWith('"')) ||
    (token.startsWith("'") && token.endsWith("'"))
  ) {
    try {
      const parsed = JSON.parse(token);
      if (typeof parsed === "string") {
        token = parsed.trim();
      }
    } catch {
      token = token.slice(1, -1).trim();
    }
  }

  // A minimal JWT shape check to avoid sending malformed bearer tokens.
  if (token.split(".").length !== 3) {
    return null;
  }

  return token;
};

export const getAuthHeaders = () => {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};
