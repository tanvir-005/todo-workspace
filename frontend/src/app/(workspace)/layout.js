import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import WorkspaceShell from "@/components/layout/WorkspaceShell";

export default async function WorkspaceLayout({ children }) {
  const cookieStore = await cookies();

  const accessToken = cookieStore.get("access_token");
  const refreshToken = cookieStore.get("refresh_token");

  if (!accessToken && !refreshToken) {
    redirect("/login");
  }

  return <WorkspaceShell>{children}</WorkspaceShell>;
}