import { HashPathRedirect } from "@/components/growth-engine/shared/path-redirect";

export const metadata = {
  title: "Success — NxtWave AI Workshop Growth Engine",
  robots: { index: false },
};

export default function SuccessRedirectPage() {
  return <HashPathRedirect base="/success" />;
}
