
import { NextResponse } from "next/server";

const API_URL = process.env.DJANGO_API_URL;

export async function POST(request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: "Username and password are required." },
        { status: 400 }
      );
    }

    const response = await fetch(`${API_URL}/auth/login/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
      cache: "no-store",
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.detail || data.error || "Invalid credentials." },
        { status: response.status }
      );
    }

    if (!data.access || !data.refresh) {
      return NextResponse.json(
        { error: "Invalid authentication response." },
        { status: 502 }
      );
    }

    const result = NextResponse.json({
      message: "Login successful.",
    });

    const secure = process.env.NODE_ENV === "production";

    result.cookies.set("access_token", data.access, {
      httpOnly: true,
      secure,
      sameSite: "lax",
      path: "/",
      maxAge: 300,
    });

    result.cookies.set("refresh_token", data.refresh, {
      httpOnly: true,
      secure,
      sameSite: "lax",
      path: "/",
      maxAge: 86400,
    });

    return result;
  } catch (error) {
    console.error("Login proxy error:", error);

    return NextResponse.json(
      { error: "Unable to connect to authentication service." },
      { status: 503 }
    );
  }
}
