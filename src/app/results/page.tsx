import { ResultsView } from "./results-view";
import { getCurrentMember } from "@/lib/members";
import { listPublicTournamentResults } from "@/lib/results";

export const dynamic = "force-dynamic";

export default async function ResultsPage() {
  const [member, tournaments] = await Promise.all([
    getCurrentMember(),
    listPublicTournamentResults()
  ]);

  return <ResultsView isAuthenticated={Boolean(member)} tournaments={tournaments} />;
}
