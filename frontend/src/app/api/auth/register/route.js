import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const body = await request.json();

    const { name, email, password } = body;

    if (!name?.trim() || !email?.trim() || !password) {
      return NextResponse.json(
        { error: "All fields are required." },
        { status: 400 }
      );
    }

    const response = await fetch(
      `${process.env.DJANGO_API_URL}/auth/register/`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          password,
        }),
        cache: "no-store",
      }
    );

    const data = await response.json();

    return NextResponse.json(data, {
      status: response.status,
    });
  } catch (error) {
    console.error("Registration proxy error:", error);

    return NextResponse.json(
      { error: "Unable to connect to the registration service." },
      { status: 503 }
    );
  }
}