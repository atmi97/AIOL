import { redirect } from "next/navigation";

export default function SignInPage() {
  // Authentication is disabled in v1.2 — pending Azure SSO integration.
  // Any visit to /signin redirects to the home page.
  redirect("/");
}
