import { Router } from "express";
import { adminUsersRepo } from "@workspace/db";

const router = Router();

const DEFAULT_ADMIN_USERNAME = "admin";
const DEFAULT_ADMIN_PASSWORD = "vibeglobally2024";
const SESSION_SECRET = process.env.SESSION_SECRET ?? "vibe-secret-key";
const SESSION_COOKIE = "vg_session";

let seedAttempted = false;
async function ensureSeedAdmin(): Promise<void> {
  if (seedAttempted) return;
  seedAttempted = true;
  try {
    const exists = await adminUsersRepo.hasAny();
    if (!exists) {
      await adminUsersRepo.upsert(
        DEFAULT_ADMIN_USERNAME,
        DEFAULT_ADMIN_PASSWORD,
      );
    }
  } catch {
    seedAttempted = false;
  }
}

function makeToken(username: string): string {
  const payload = Buffer.from(JSON.stringify({ username, ts: Date.now() })).toString("base64");
  return `${payload}.${Buffer.from(SESSION_SECRET).toString("base64")}`;
}

function verifyToken(token: string): string | null {
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const expectedSig = Buffer.from(SESSION_SECRET).toString("base64");
  if (parts[1] !== expectedSig) return null;
  try {
    const payload = JSON.parse(Buffer.from(parts[0], "base64").toString("utf-8"));
    return payload.username ?? null;
  } catch {
    return null;
  }
}

router.post("/auth/login", async (req, res) => {
  try {
    const { username, password } = req.body as {
      username?: string;
      password?: string;
    };

    if (!username || !password) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    await ensureSeedAdmin();

    const ok = await adminUsersRepo.verify(username, password);
    if (!ok) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = makeToken(username);
    res.cookie(SESSION_COOKIE, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: false, // Allow non-HTTPS in development
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return res.json({ success: true, message: "Login successful" });
  } catch (err) {
    req.log.error({ err }, "Error during login");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/auth/logout", (_req, res) => {
  res.clearCookie(SESSION_COOKIE);
  return res.json({ success: true, message: "Logged out" });
});

router.get("/auth/me", (req, res) => {
  const token = req.cookies?.[SESSION_COOKIE] as string | undefined;
  if (!token) {
    return res.json({ authenticated: false });
  }
  const username = verifyToken(token);
  if (!username) {
    return res.json({ authenticated: false });
  }
  return res.json({ authenticated: true, username });
});

export function requireAuth(req: any, res: any, next: any) {
  let token = req.cookies?.[SESSION_COOKIE] as string | undefined;

  // Also support Bearer token in Authorization header
  const authHeader = req.get("authorization");
  if (!token && authHeader?.startsWith("Bearer ")) {
    token = authHeader.substring(7);
  }

  if (!token) {
    return res.status(401).json({ error: "Unauthorized", message: "No session token provided" });
  }

  const username = verifyToken(token);
  if (!username) {
    return res.status(401).json({ error: "Unauthorized", message: "Invalid or expired session token" });
  }

  req.adminUsername = username;
  next();
}

export default router;
