// Shared between the service worker and the options page.
// "carp" is the original Carlinville Public Library shortcut; it preserves
// the destination for users who have not configured a different member library.
const SHARE_CONFIG = Object.freeze({
  defaultSubdomain: "carp",
  storageKey: "shareSubdomain",
  catalogDomain: "illshareit.com",
  searchPath: "/Union/Search?view=list&showCovers=on&lookfor=",
  searchSuffix: "&searchIndex=Keyword&searchSource=local"
});

// A single DNS hostname label, not a URL, full hostname, IP, or path.
// Allows 1–63 characters, with letters or digits at either end.
function normalizeShareSubdomain(value) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

function isValidShareSubdomain(value) {
  return /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(
    normalizeShareSubdomain(value)
  );
}

function shareSearchUrl(subdomain, selectedText) {
  const label = isValidShareSubdomain(subdomain)
    ? normalizeShareSubdomain(subdomain)
    : SHARE_CONFIG.defaultSubdomain;
  const encodedQuery = encodeURIComponent(String(selectedText).trim());

  // Keep the original catalog endpoint, query parameter order and encoding.
  return "https://" + label + "." + SHARE_CONFIG.catalogDomain +
    SHARE_CONFIG.searchPath + encodedQuery + SHARE_CONFIG.searchSuffix;
}
