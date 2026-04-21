const PLACEHOLDER_IMAGE = "https://placehold.co/600x750?text=No+Image";

export const getSafeImageUrl = (candidateUrl) => {
  if (typeof candidateUrl !== "string") return PLACEHOLDER_IMAGE;

  const url = candidateUrl.trim();
  if (!url) return PLACEHOLDER_IMAGE;

  if (
    url.startsWith("http://") ||
    url.startsWith("https://") ||
    url.startsWith("data:image/") ||
    url.startsWith("blob:") ||
    url.startsWith("/")
  ) {
    return url;
  }

  // Reject raw ids/filenames that browsers resolve as broken relative paths.
  return PLACEHOLDER_IMAGE;
};

export const getFallbackImage = () => PLACEHOLDER_IMAGE;
