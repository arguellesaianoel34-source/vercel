import {
  adminUsersRepo,
  contactsRepo,
  testimonialsRepo,
  siteContentRepo,
} from "@workspace/db";

/**
 * Mock implementation of browser-side API requests for local development
 * using the workspace database repositories.
 */


const SESSION_KEY = "vg_session";
const SESSION_SECRET = "vibe-secret-key"; // Matches backend default

function makeToken(username: string): string {
  const payload = btoa(JSON.stringify({ username, ts: Date.now() }));
  return `${payload}.${btoa(SESSION_SECRET)}`;
}

function verifyToken(token: string): string | null {
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const expectedSig = btoa(SESSION_SECRET);
  if (parts[1] !== expectedSig) return null;
  try {
    const payload = JSON.parse(atob(parts[0]));
    return payload.username ?? null;
  } catch {
    return null;
  }
}

function getAuthenticatedUser(): string | null {
  const token = localStorage.getItem(SESSION_KEY);
  if (!token) return null;
  return verifyToken(token);
}

export async function handleBrowserApiRequest(url: string, init: RequestInit = {}): Promise<any> {
  const method = init.method?.toUpperCase() || "GET";
  const path = url.split("?")[0];
  const searchParams = new URLSearchParams(url.split("?")[1] || "");
  const body = init.body ? JSON.parse(init.body as string) : {};

  // Auth Me
  if (path === "/api/auth/me" && method === "GET") {
    const username = getAuthenticatedUser();
    return { authenticated: !!username, username: username || undefined };
  }

  // Login
  if (path === "/api/auth/login" && method === "POST") {
    const { username, password } = body;
    if (!username || !password) throw { status: 401, error: "Invalid credentials" };

    // Auto-seed admin if needed (mimicking backend)
    const hasAny = await adminUsersRepo.hasAny();
    if (!hasAny) {
      await adminUsersRepo.upsert("admin", "vibeglobally2024");
    }

    const ok = await adminUsersRepo.verify(username, password);
    if (!ok) throw { status: 401, error: "Invalid credentials" };

    const token = makeToken(username);
    localStorage.setItem(SESSION_KEY, token);
    return { success: true, message: "Login successful" };
  }

  // Logout
  if (path === "/api/auth/logout" && method === "POST") {
    localStorage.removeItem(SESSION_KEY);
    return { success: true, message: "Logged out" };
  }

  // Stats Dashboard
  if (path === "/api/stats/dashboard" && method === "GET") {
    if (!getAuthenticatedUser()) throw { status: 401, error: "Unauthorized" };
    const [
      totalContacts,
      newContacts,
      respondedContacts,
      totalTestimonials,
      recentContacts
    ] = await Promise.all([
        contactsRepo.countByStatus(),
        contactsRepo.countByStatus("new"),
        contactsRepo.countByStatus("responded"),
        testimonialsRepo.count(),
        contactsRepo.recent(5),
      ]);
    return {
      totalContacts,
      newContacts,
      respondedContacts,
      totalTestimonials,
      recentContacts,
    };
  }

  // Contacts
  if (path === "/api/contacts") {
    if (method === "GET") {
      if (!getAuthenticatedUser()) throw { status: 401, error: "Unauthorized" };
      const page = Number(searchParams.get("page") || 1);
      const limit = Number(searchParams.get("limit") || 20);
      const status = searchParams.get("status") || undefined;
      const { items, total } = await contactsRepo.list({ page, limit, status });
      return { contacts: items, total, page, limit };
    }
    if (method === "POST") {
      return await contactsRepo.create({ ...body, status: "new" });
    }
  }

  if (path.startsWith("/api/contacts/")) {
    const id = path.split("/").pop()!;
    if (!getAuthenticatedUser()) throw { status: 401, error: "Unauthorized" };
    if (method === "GET") return await contactsRepo.getById(id);
    if (method === "PATCH") return await contactsRepo.update(id, body);
    if (method === "DELETE") {
      await contactsRepo.delete(id);
      return { success: true, message: "Deleted" };
    }
  }

  // Testimonials
  if (path === "/api/testimonials") {
    if (method === "GET") {
      const testimonials = await testimonialsRepo.list();
      return { testimonials };
    }
    if (method === "POST") {
      if (!getAuthenticatedUser()) throw { status: 401, error: "Unauthorized" };
      return await testimonialsRepo.create(body);
    }
  }

  if (path.startsWith("/api/testimonials/")) {
    const id = path.split("/").pop()!;
    if (!getAuthenticatedUser()) throw { status: 401, error: "Unauthorized" };
    if (method === "DELETE") {
      await testimonialsRepo.delete(id);
      return { success: true, message: "Deleted" };
    }
  }

  // Content
  if (path.startsWith("/api/content/")) {
    const section = path.split("/").pop()!;
    if (method === "GET") {
      const row = await siteContentRepo.get(section);
      return { section, content: row ? row.content : {} };
    }
    if (method === "PUT") {
      if (!getAuthenticatedUser()) throw { status: 401, error: "Unauthorized" };
      const row = await siteContentRepo.upsert(section, body);
      return { section, content: row.content };
    }
  }

  // Healthz
  if (path === "/api/healthz") return { status: "ok" };

  // Email endpoints - these MUST be handled by the real backend
  // but we proxy them here so they work with the browser-side mock auth
  if (path === "/api/email/test-connection" || path === "/api/email/send-test") {
    const token = localStorage.getItem(SESSION_KEY);
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      method,
      headers,
      body: init.body,
    });

    const result = await response.json();
    if (!response.ok) {
      throw { status: response.status, ...result };
    }
    return result;
  }

  throw new Error(`Mock API: Unknown endpoint ${method} ${path}`);
}
