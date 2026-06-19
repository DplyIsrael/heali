import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { GATE_COOKIE, gateEnabled, verifyGateCookie } from "@/lib/gate";

// ── Site-wide access gate ──────────────────────────────────────────────────
// Paths that must stay reachable even while the whole app is locked:
//   /gate, /api/gate         → the password screen and its verify endpoint
//   /api/cardcom/webhook     → CardCom server-to-server callback (no cookie ever)
//   /api/inngest             → Inngest server-to-server callback (no cookie ever)
// Each of those machine callbacks enforces its own signature/secret auth.
const GATE_BYPASS_PREFIXES = [
  "/gate",
  "/api/gate",
  "/api/cardcom/webhook",
  "/api/inngest",
];
const isGateBypass = (pathname: string) =>
  GATE_BYPASS_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + "/"));

// Every protected route prefix mapped to the roles allowed to access it.
// `admin` is allowed everywhere. Keep this in sync with the route groups.
const ROUTE_ROLES: Record<string, string[]> = {
  "/admin": ["admin"],
  // practitioner
  "/dashboard": ["practitioner", "admin"],
  "/profile": ["practitioner", "admin"],
  "/availability": ["practitioner", "admin"],
  "/my-patients": ["practitioner", "admin"],
  "/practitioner-onboarding": ["practitioner", "admin"],
  "/practitioner-articles": ["practitioner", "admin"],
  "/practitioner-messages": ["practitioner", "admin"],
  // patient
  "/home": ["patient", "admin"],
  "/onboarding": ["patient", "admin"],
  "/patient-profile": ["patient", "admin"],
  "/patient-messages": ["patient", "admin"],
  "/my-treatments": ["patient", "admin"],
  "/wallet": ["patient", "admin"],
  "/favorites": ["patient", "admin"],
};
// Require any authenticated user (row-level ownership is enforced in the action).
const AUTH_ONLY_PREFIXES = ["/scan", "/survey"];
const AUTH_PAGES = ["/login", "/register"];

const prefixMatches = (pathname: string, p: string) =>
  pathname === p || pathname.startsWith(p + "/");
const matchRoleRoute = (pathname: string) =>
  Object.keys(ROUTE_ROLES).find((p) => prefixMatches(pathname, p));

const supabaseConfigured =
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // ── Site-wide access gate (runs before everything) ───────────────────────
  // When SITE_GATE_PASSWORD is set, no request proceeds without a valid gate
  // cookie: no page renders, no Supabase session/profile lookup runs, and no
  // API route executes. This is the outermost protection layer.
  if (gateEnabled() && !isGateBypass(pathname)) {
    const unlocked = await verifyGateCookie(request.cookies.get(GATE_COOKIE)?.value);
    if (!unlocked) {
      // API/data requests get a JSON 401 instead of an HTML redirect.
      if (pathname.startsWith("/api/")) {
        return NextResponse.json({ error: "site_locked" }, { status: 401 });
      }
      const url = request.nextUrl.clone();
      url.pathname = "/gate";
      // Remember the intended destination so we can return there after unlock.
      const dest = pathname + request.nextUrl.search;
      url.search = dest && dest !== "/" ? `?next=${encodeURIComponent(dest)}` : "";
      return NextResponse.redirect(url);
    }
  }

  // Skip all auth logic until Supabase is configured
  if (!supabaseConfigured) {
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh session — required by @supabase/ssr
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const matchedPrefix = matchRoleRoute(pathname);
  const isAuthOnly = AUTH_ONLY_PREFIXES.some((p) => prefixMatches(pathname, p));
  const isProtected = !!matchedPrefix || isAuthOnly;
  const isAuthPage = AUTH_PAGES.some((p) => pathname.startsWith(p));

  // Build a redirect that carries over any auth cookies set on supabaseResponse
  // (so a session refresh — or signOut() below — is preserved through the redirect).
  const redirectTo = (path: string, search = "") => {
    const url = request.nextUrl.clone();
    url.pathname = path;
    url.search = search;
    const res = NextResponse.redirect(url);
    supabaseResponse.cookies.getAll().forEach((c) => res.cookies.set(c));
    return res;
  };

  // Unauthenticated users may not reach protected routes.
  if (isProtected && !user) {
    return redirectTo("/login");
  }

  // Load role / onboarding / blocked state once, only when needed.
  const needProfile = !!user && (isProtected || isAuthPage || pathname === "/");
  let profile: { role: string; onboarding_completed: boolean; is_blocked: boolean } | null = null;
  if (needProfile) {
    const { data } = await supabase
      .from("users")
      .select("role, onboarding_completed, is_blocked")
      .eq("id", user!.id)
      .single();
    profile = data;
  }

  // Blocked accounts: terminate the session and bounce to login. signOut()
  // clears the cookies onto supabaseResponse, which redirectTo() copies across,
  // so the next request is unauthenticated (no redirect loop).
  if (profile?.is_blocked) {
    await supabase.auth.signOut();
    return redirectTo("/login", "blocked=1");
  }

  // Authenticated users on auth pages / landing -> their role home.
  if ((isAuthPage || pathname === "/") && profile) {
    if (profile.role === "admin") {
      if (isAuthPage) return redirectTo("/admin");
    } else if (profile.role === "practitioner") {
      if (!profile.onboarding_completed) {
        if (!prefixMatches(pathname, "/practitioner-onboarding")) {
          return redirectTo("/practitioner-onboarding");
        }
      } else if (isAuthPage) {
        return redirectTo("/dashboard");
      }
    } else if (profile.role === "patient") {
      if (!profile.onboarding_completed) {
        return redirectTo("/onboarding");
      }
      return redirectTo("/home");
    }
  }

  // Role gating: a matched protected route the caller's role can't access -> landing.
  if (matchedPrefix && profile && !ROUTE_ROLES[matchedPrefix].includes(profile.role)) {
    return redirectTo("/");
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|fonts|icons|images|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
