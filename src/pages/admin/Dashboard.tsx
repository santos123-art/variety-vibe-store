import { useState } from 'react';
import { Header } from '@/components/Header';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, MoreHorizontal } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ProductForm } from '@/components/ProductForm';
import { useToast } from '@/components/ui/use-toast';
import type { Database } from '@/integrations/supabase/types';

type Product = Database['public']['Tables']['products']['Row'] & { categories: { name: string } | null };
type ProductFormValues = Parameters<typeof ProductForm>[0]['onSubmit'] extends (values: infer V) => void ? V : never;

const fetchAdminProducts = async () => {
  const { data, error } = await supabase
    .from('products')
    .select('*, categories(name)');
  if (error) throw new Error(error.message);
  return data;
};

const Admin = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const { data: products, isLoading, error } = useQuery<Product[]>({
    queryKey: ['admin-products'],
    queryFn: fetchAdminProducts,
  });

  const mutation = useMutation({
    mutationFn: async ({ values, id }: { values: ProductFormValues, id?: string }) => {
      const { error } = id
        ? await supabase.from('products').update(values).eq('id', id)
        : await supabase.from('products').insert([values]);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      toast({ title: "Sucesso!", description: "Produto salvo com sucesso." });
      setIsSheetOpen(false);
    },
    onError: (error) => {
      toast({ title: "Erro!", description: error.message, variant: 'destructive' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      toast({ title: "Sucesso!", description: "Produto deletado com sucesso." });
    },
    onError: (error) => {
      toast({ title: "Erro!", description: error.message, variant: 'destructive' });
    },
  });

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setIsSheetOpen(true);
  };

  const handleNew = () => {
    setSelectedProduct(null);
    setIsSheetOpen(true);
  };

  const onSubmit = (values: ProductFormValues) => {
    mutation.mutate({ values, id: selectedProduct?.id });
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Tem certeza que deseja deletar este produto? Esta ação não pode ser desfeita.")) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Gerenciamento de Produtos</h1>
            <Button onClick={handleNew}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Novo Produto
            </Button>
          </div>

          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : error ? (
            <p className="text-destructive">Erro ao carregar produtos: {error.message}</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Preço</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products?.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>{product.categories?.name || 'Sem categoria'}</TableCell>
                    <TableCell>
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.price)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={product.active ? 'default' : 'destructive'}>
                        {product.active ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Abrir menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Ações</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handleEdit(product)}>Editar</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDelete(product.id)} className="text-red-600">
                            Deletar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
        <SheetContent className="overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{selectedProduct ? 'Editar Produto' : 'Novo Produto'}</SheetTitle>
            <SheetDescription>
              {selectedProduct ? 'Edite os detalhes do produto.' : 'Preencha os detalhes para criar um novo produto.'}
            </SheetDescription>
          </SheetHeader>
          <div className="py-4">
            <ProductForm
              product={selectedProduct}
              onSubmit={onSubmit}
              isSubmitting={mutation.isPending}
            />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default Admin;