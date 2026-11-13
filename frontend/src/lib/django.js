import { cookies } from "next/headers";

const API_URL = process.env.DJANGO_API_URL;

export async function djangoFetch(path, options = {}) {
  const cookieStore = await cookies();

  let accessToken = cookieStore.get("access_token")?.value;
  const refreshToken = cookieStore.get("refresh_token")?.value;

  if (!accessToken && !refreshToken) {
    return new Response(
      JSON.stringify({ error: "Unauthorized." }),
      {
        status: 401,
        headers: { "Content-Type": "application/json" },
      }
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

  if (accessToken) {
    const response = await makeRequest(accessToken);

    if (response.status !== 401) {
      return response;
    }
  }

  if (!refreshToken) {
    cookieStore.delete("access_token");

    return new Response(
      JSON.stringify({ error: "Session expired." }),
      {
        status: 401,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

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
      {
        status: 401,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  const refreshData = await refreshResponse.json();

  if (!refreshData.access) {
    cookieStore.delete("access_token");
    cookieStore.delete("refresh_token");

    return new Response(
      JSON.stringify({ error: "Invalid refresh response." }),
      { status: 401 }
    );
  }

  accessToken = refreshData.access;

  cookieStore.set("access_token", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 300,
  });

  return makeRequest(accessToken);
}