"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "./page.module.css";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        const message =
          data.error ||
          data.detail ||
          (Array.isArray(data.email) ? data.email[0] : null) ||
          "Unable to create your account.";

        setError(message);
        return;
      }

      router.push("/login?registered=true");
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
          <span className={styles.eyebrow}>GET STARTED</span>

          <h1>
            Make room
            <br />
            for better work.
          </h1>

          <p>
            Create your account and start organizing
            <br className={styles.desktopBreak} />
            your work in one place.
          </p>
        </div>

        <div className={styles.formSection}>
          <div className={styles.formHeading}>
            <h2>Create an account</h2>
            <p>Enter your details to get started.</p>
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.field}>
              <label htmlFor="name">Full name</label>

              <input
                id="name"
                name="name"
                type="text"
                placeholder="Enter your full name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                autoComplete="name"
                required
                disabled={loading}
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="email">Email address</label>

              <input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
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
                placeholder="At least 8 characters"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="new-password"
                minLength={8}
                required
                disabled={loading}
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="confirmPassword">Confirm password</label>

              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="Enter your password again"
                value={confirmPassword}
                onChange={(event) =>
                  setConfirmPassword(event.target.value)
                }
                autoComplete="new-password"
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
              {loading ? "Creating account..." : "Create account"}
            </button>
          </form>

          <p className={styles.login}>
            Already have an account?{" "}
            <Link href="/login">Sign in</Link>
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