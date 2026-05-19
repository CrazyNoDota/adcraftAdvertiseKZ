import { Container } from '@/components/Container';
import { ConsolePanel } from '@/components/ConsolePanel';

// Hidden admin console. Not linked anywhere on the marketing site. The URL
// alone grants nothing — the ADMIN_PASSWORD env var on Vercel is the gate.
export const metadata = {
  title: 'Console',
  robots: { index: false, follow: false },
};

export default function ConsolePage() {
  return (
    <Container className="py-12" size="narrow">
      <ConsolePanel />
    </Container>
  );
}
