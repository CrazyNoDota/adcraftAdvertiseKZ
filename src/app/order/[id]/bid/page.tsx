import { Container } from '@/components/Container';
import { BidSubmit } from '@/components/BidSubmit';

export default async function BidPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <Container className="py-8">
      <BidSubmit orderId={id} />
    </Container>
  );
}
