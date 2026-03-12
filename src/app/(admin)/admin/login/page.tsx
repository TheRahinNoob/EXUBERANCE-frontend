"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { API_BASE } from "@/lib/admin-api/config";
import { setTokens } from "@/lib/admin-auth/token";

export default function AdminLoginPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/auth/login/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      if (!res.ok) {
        throw new Error("Invalid credentials");
      }

      const data = await res.json();

      if (!data?.access || !data?.refresh) {
        throw new Error("Invalid token response");
      }

      setTokens(data.access, data.refresh, rememberMe);

      router.replace("/admin");
      router.refresh();
    } catch (err) {
      setError("Invalid username or password");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        background: "#0b0b0d",
        color: "#fff",
        padding: 16,
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          width: "100%",
          maxWidth: 360,
          padding: 32,
          borderRadius: 12,
          background: "rgba(255,255,255,0.05)",
          backdropFilter: "blur(20px)",
          boxSizing: "border-box",
        }}
      >
        <h1 style={{ marginBottom: 24 }}>Admin Login</h1>

        <input
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          autoComplete="username"
          style={{
            width: "100%",
            padding: 10,
            marginBottom: 12,
            boxSizing: "border-box",
          }}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
          style={{
            width: "100%",
            padding: 10,
            marginBottom: 12,
            boxSizing: "border-box",
          }}
        />

        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 14,
            fontSize: 14,
            cursor: "pointer",
            userSelect: "none",
          }}
        >
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
          />
          <span>Remember me</span>
        </label>

        {error && (
          <div style={{ color: "tomato", marginBottom: 12 }}>{error}</div>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: 12,
            fontWeight: 600,
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>
    </div>
  );
}