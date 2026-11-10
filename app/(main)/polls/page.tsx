import PollList from "@/components/polls/PollList";
import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/session";
import { isAdmin } from "@/lib/admin";

export default async function Page() {
  const session = await getServerSession();
  if (!session.success) redirect("/signin?next=%2Fpolls");
  return <PollList admin={isAdmin(session.email)} />;
}
