"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "./page.module.css";

export default function LoginPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Unable to sign in. Please try again.");
        return;
      }

      router.replace("/todos");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Link href="/login" className={styles.brand}>
          TODO WORKSPACE
        </Link>

        <span className={styles.headerLabel}>
          PERSONAL PRODUCTIVITY
        </span>
      </header>

      <section className={styles.content}>
        <div className={styles.intro}>
          <span className={styles.eyebrow}>YOUR WORKSPACE</span>

          <h1>
            Get things
            <br />
            done.
          </h1>

          <p>
            A shared space to organize tasks,
            <br className={styles.desktopBreak} />
            manage work, and stay focused.
          </p>
        </div>

        <div className={styles.formSection}>
          <div className={styles.formHeading}>
            <h2>Welcome back</h2>
            <p>Enter your credentials to continue.</p>
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.field}>
              <label htmlFor="username">Username</label>

              <input
                id="username"
                name="username"
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                autoComplete="username"
                required
                disabled={loading}
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="password">Password</label>

              <input
                id="password"
                name="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                required
                disabled={loading}
              />
            </div>

            {error && (
              <p className={styles.error} role="alert">
                {error}
              </p>
            )}

            <button
              type="submit"
              className={styles.submitButton}
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <p className={styles.register}>
            Don't have an account?{" "}
            <Link href="/register">Create an account</Link>
          </p>
        </div>
      </section>

      <footer className={styles.footer}>
        <span>TODO WORKSPACE</span>
        <span>© 2026</span>
      </footer>
    </main>
  );
}