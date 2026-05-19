import { Container } from '@/components/Container';
import { OrderWizard } from '@/components/OrderWizard';

export default function NewOrderPage() {
  return (
    <Container className="py-8" size="narrow">
      <OrderWizard />
    </Container>
  );
}
