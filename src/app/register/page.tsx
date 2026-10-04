import { HashPathRedirect } from "@/components/growth-engine/shared/path-redirect";

export const metadata = {
  title: "Register — NxtWave AI Workshop Growth Engine",
  robots: { index: false },
};

export default function RegisterRedirectPage() {
  return <HashPathRedirect base="/register" />;
}
