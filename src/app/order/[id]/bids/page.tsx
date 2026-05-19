import { Container } from '@/components/Container';
import { BidsView } from '@/components/BidsView';

export default async function BidsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <Container className="py-8">
      <BidsView orderId={id} />
    </Container>
  );
}
