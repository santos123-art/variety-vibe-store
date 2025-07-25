import { Header } from '@/components/Header';

const Cart = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Carrinho</h1>
        <p className="text-muted-foreground">Página do carrinho em desenvolvimento...</p>
      </div>
    </div>
  );
};

export default Cart;