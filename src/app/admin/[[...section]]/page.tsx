import { HashPathRedirect } from "@/components/growth-engine/shared/path-redirect";

export const metadata = {
  title: "Growth Command Center — NxtWave AI Workshop Growth Engine",
  robots: { index: false },
};

// Optional catch-all so /admin AND /admin/registrations etc. both bridge
// into the hash-routed single-page shell (/#/admin/registrations).
export default function AdminRedirectPage() {
  return <HashPathRedirect base="/admin" />;
}
