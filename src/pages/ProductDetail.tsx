import { Header } from '@/components/Header';

const ProductDetail = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Detalhes do Produto</h1>
        <p className="text-muted-foreground">Página de detalhes em desenvolvimento...</p>
      </div>
    </div>
  );
};

export default ProductDetail;