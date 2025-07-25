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
import { PlusCircle, MoreHorizontal } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CategoryForm } from '@/components/CategoryForm';
import { useToast } from '@/components/ui/use-toast';
import type { Database } from '@/integrations/supabase/types';

type Category = Database['public']['Tables']['categories']['Row'];
type CategoryFormValues = Parameters<typeof CategoryForm>[0]['onSubmit'] extends (values: infer V) => void ? V : never;

const fetchCategories = async () => {
  const { data, error } = await supabase.from('categories').select('*');
  if (error) throw new Error(error.message);
  return data;
};

const AdminCategories = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  const { data: categories, isLoading, error } = useQuery<Category[]>({
    queryKey: ['admin-categories'],
    queryFn: fetchCategories,
  });

  const mutation = useMutation({
    mutationFn: async ({ values, id }: { values: CategoryFormValues, id?: string }) => {
      const { error } = id
        ? await supabase.from('categories').update(values).eq('id', id)
        : await supabase.from('categories').insert([values]);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] }); // Invalida a query publica também
      toast({ title: "Sucesso!", description: "Categoria salva com sucesso." });
      setIsSheetOpen(false);
    },
    onError: (error) => {
      toast({ title: "Erro!", description: error.message, variant: 'destructive' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('categories').delete().eq('id', id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast({ title: "Sucesso!", description: "Categoria deletada com sucesso." });
    },
    onError: (error) => {
      toast({ title: "Erro!", description: error.message, variant: 'destructive' });
    },
  });

  const handleEdit = (category: Category) => {
    setSelectedCategory(category);
    setIsSheetOpen(true);
  };

  const handleNew = () => {
    setSelectedCategory(null);
    setIsSheetOpen(true);
  };

  const onSubmit = (values: CategoryFormValues) => {
    mutation.mutate({ values, id: selectedCategory?.id });
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Tem certeza que deseja deletar esta categoria?")) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Gerenciamento de Categorias</h1>
            <Button onClick={handleNew}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Nova Categoria
            </Button>
          </div>

          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : error ? (
            <p className="text-destructive">Erro ao carregar categorias: {error.message}</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories?.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell className="font-medium">{category.name}</TableCell>
                    <TableCell>{category.description}</TableCell>
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
                          <DropdownMenuItem onClick={() => handleEdit(category)}>Editar</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDelete(category.id)} className="text-red-600">
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
            <SheetTitle>{selectedCategory ? 'Editar Categoria' : 'Nova Categoria'}</SheetTitle>
            <SheetDescription>
              {selectedCategory ? 'Edite os detalhes da categoria.' : 'Preencha os detalhes para criar uma nova categoria.'}
            </SheetDescription>
          </SheetHeader>
          <div className="py-4">
            <CategoryForm
              category={selectedCategory}
              onSubmit={onSubmit}
              isSubmitting={mutation.isPending}
            />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default AdminCategories;
