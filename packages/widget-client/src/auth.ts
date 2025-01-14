import { config } from "../index.js";
import type { UserType } from "../types.js";

/**
 * Handles the OAuth2 authentication process by either fetching an access token using an
 * authorization code or redirecting the user to the authorization server to obtain it.
 */
export async function authenticate() {
  const url = window.location.href || "";
  const parsedUrl = new URL(url);
  const params = parsedUrl.searchParams;
  const code = params.get("code");

  const redirect_uri = window.location.href;

  // Try to extract the OAuth code from the query string
  if (code) {
    parsedUrl.search = "";

    window.history.replaceState({}, "", parsedUrl);

    // If there is a code in the query, then fetch the access token
    return fetch(`${config.BASE_URL}/oauth/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        grant_type: "authorization_code",
        client_id: config.clientId,
        code: code,
        redirect_uri: window.location.href,
        code_verifier: localStorage.getItem("pkce_code_verifier"),
      }),
    })
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        // With the access token, we can now access the protected resource
        localStorage.removeItem("pkce_code_verifier");
        config.accessToken = data.access_token;
        return null;
      })
      .catch((err) => {
        console.error(err);
      });
  } else {
    // If there is no code in the query, then redirect to the authorization server
    let state = generateRandomString();
    let codeChallengeMethod = "S256";
    let CODE_VERIFIER = generateRandomString();
    localStorage.setItem("pkce_code_verifier", CODE_VERIFIER);
    let codeChallenge = await pkceChallengeFromVerifier(CODE_VERIFIER);
    let redirect_oauth_url = `${config.BASE_URL}/oauth/authorize?response_type=code&client_id=${config.clientId}&redirect_uri=${redirect_uri}&state=${encodeURIComponent(state)}&code_challenge=${encodeURIComponent(codeChallenge)}&code_challenge_method=${codeChallengeMethod}`;
    window.location.assign(redirect_oauth_url);
  }
}

/**
 * Fetches the authenticated user's details.
 */
export async function me(): Promise<UserType | undefined> {
  try {
    const response = await fetch(`${config.BASE_URL}/api/v1/me`, {
      headers: {
        Authorization: `Bearer ${config.accessToken}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error(errorData.error || "Error fetching user details");
      return undefined;
    }

    const data = await response.json();
    if (!data || !data.id) {
      console.error("Invalid user data");
      return undefined;
    }

    return {
      id: data.id,
      email: data.email,
    };
  } catch (error) {
    console.error("Error fetching user details:", error);
    return undefined;
  }
}

/**
 * Generates a SHA-256 hash of the input string.
 */
function sha256(plain: string) {
  const encoder = new TextEncoder();
  const data = encoder.encode(plain);

  return window.crypto.subtle.digest("SHA-256", data);
}

/**
 * Base64-url encodes the input string.
 */
function base64urlencode(str: ArrayBuffer) {
  return btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array(str))))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

/**
 * Returns the base64-url-encoded SHA-256 hash for the PKCE challenge.
 */
async function pkceChallengeFromVerifier(v: string) {
  const hashed = await sha256(v);
  return base64urlencode(hashed);
}

/**
 * Generates a random string used for PKCE code verifier and state parameters.
 */
function generateRandomString() {
  const array = new Uint32Array(28);
  window.crypto.getRandomValues(array);

  return Array.from(array, (dec) => ("0" + dec.toString(16)).substr(-2)).join(
    ""
  );
}
