import { HashPathRedirect } from "@/components/growth-engine/shared/path-redirect";

export const metadata = {
  title: "Growth Profile — NxtWave AI Workshop Growth Engine",
  robots: { index: false },
};

export default function GrowthRedirectPage() {
  return <HashPathRedirect base="/growth" />;
}
