import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import Messages from "./Messages";

export const dynamic = "force-dynamic";

export default async function MessagesPage() {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  return (
    <main className="mx-auto max-w-content px-6 py-10">
      <h1 className="text-2xl font-semibold text-ink-50">Messages</h1>
      <p className="mt-2 text-sm text-ink-400">Reply to leads from here</p>
      <div className="mt-6">
        <Messages />
      </div>
    </main>
  );
}
