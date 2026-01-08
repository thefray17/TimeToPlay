
import CourtDetailsClient from "./CourtDetailsClient";

export default function CourtDetailsPage({ params }: { params: { id: string } }) {
  return <CourtDetailsClient courtId={params.id} />;
}
