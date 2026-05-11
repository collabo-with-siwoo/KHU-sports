import { ResultsView } from "./results-view";
import { listPublicTournamentResults } from "@/lib/results";

export const dynamic = "force-dynamic";

export default async function ResultsPage() {
  const tournaments = await listPublicTournamentResults();

  return <ResultsView tournaments={tournaments} />;
}
