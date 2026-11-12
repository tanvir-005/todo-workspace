import { cookies } from "next/headers";

const API_URL = process.env.DJANGO_API_URL;

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
};

export async function djangoFetch(path, options = {}) {
  const cookieStore = await cookies();

  let accessToken = cookieStore.get("access_token")?.value;
  const refreshToken = cookieStore.get("refresh_token")?.value;

  if (!accessToken) {
    return new Response(
      JSON.stringify({ error: "Unauthorized." }),
      { status: 401 }
    );
  }

  const makeRequest = (token) =>
    fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

  let response = await makeRequest(accessToken);

  // Access token is still valid.
  if (response.status !== 401) {
    return response;
  }

  // No refresh token available.
  if (!refreshToken) {
    cookieStore.delete("access_token");
    cookieStore.delete("refresh_token");

    return response;
  }

  // Request a new access token.
  const refreshResponse = await fetch(`${API_URL}/auth/refresh/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ refresh: refreshToken }),
    cache: "no-store",
  });

  if (!refreshResponse.ok) {
    cookieStore.delete("access_token");
    cookieStore.delete("refresh_token");

    return new Response(
      JSON.stringify({ error: "Session expired. Please log in again." }),
      { status: 401 }
    );
  }

  const refreshData = await refreshResponse.json();
  accessToken = refreshData.access;

  cookieStore.set("access_token", accessToken, {
    ...cookieOptions,
    maxAge: 300,
  });

  // Retry the original request.
  return makeRequest(accessToken);
}