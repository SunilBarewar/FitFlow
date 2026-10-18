import { getSessionFromCookies } from "@/lib/auth/session";
import { NavbarClient } from "./navbar-client";

export async function Navbar() {
  const session = await getSessionFromCookies();
  return <NavbarClient isLoggedIn={!!session} />;
}
