import { Header } from '@/components/Header';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/components/CartProvider';
import { useToast } from '@/components/ui/use-toast';

const fetchProductById = async (id: string) => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    throw new Error(error.message);
  }
  return data;
};

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { dispatch } = useCart();
  const { toast } = useToast();

  const { data: product, isLoading, error } = useQuery({
    queryKey: ['product', id],
    queryFn: () => fetchProductById(id!),
    enabled: !!id,
  });

  const handleAddToCart = () => {
    if (!product) return;
    dispatch({
      type: 'ADD_ITEM',
      payload: {
        id: product.id,
        name: product.name,
        price: product.price,
        image_url: product.image_url || undefined,
      },
    });
    toast({
      title: "Produto adicionado!",
      description: `${product.name} foi adicionado ao seu carrinho.`,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        {isLoading ? (
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <Skeleton className="w-full h-96" />
            </div>
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-6 w-1/4" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-12 w-1/2" />
            </div>
          </div>
        ) : error ? (
          <p className="text-destructive">Erro ao carregar o produto: {error.message}</p>
        ) : product ? (
          <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
            <div>
              <img
                src={product.image_url || '/placeholder.svg'}
                alt={product.name}
                className="w-full h-auto object-cover rounded-lg shadow-lg"
              />
            </div>
            <div className="flex flex-col justify-center">
              <h1 className="text-3xl lg:text-4xl font-bold mb-2">{product.name}</h1>
              <p className="text-2xl font-semibold text-primary mb-4">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.price)}
              </p>
              <p className="text-muted-foreground mb-6">{product.description}</p>
              <div className="flex items-center gap-4">
                <Button size="lg" onClick={handleAddToCart}>
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Adicionar ao Carrinho
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <p>Produto não encontrado.</p>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;