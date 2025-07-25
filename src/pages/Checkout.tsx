import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCart } from '@/components/CartProvider';
import { useAuth } from '@/components/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { useMutation } from '@tanstack/react-query';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';

const checkoutSchema = z.object({
  customer_name: z.string().min(3, 'Nome é obrigatório'),
  customer_phone: z.string().min(10, 'Telefone inválido'),
  customer_address: z.string().min(10, 'Endereço é obrigatório'),
  notes: z.string().optional(),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

const Checkout = () => {
  const { user } = useAuth();
  const { state: cartState, dispatch: cartDispatch } = useCart();
  const { toast } = useToast();
  const navigate = useNavigate();

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      customer_name: '',
      customer_phone: '',
      customer_address: '',
      notes: '',
    },
  });

  useEffect(() => {
    if (user) {
      supabase
        .from('profiles')
        .select('full_name, phone, address')
        .eq('id', user.id)
        .single()
        .then(({ data }) => {
          if (data) {
            form.reset({
              customer_name: data.full_name || '',
              customer_phone: data.phone || '',
              customer_address: data.address || '',
            });
          }
        });
    }
  }, [user, form]);

  const createOrderMutation = useMutation({
    mutationFn: async (values: CheckoutFormValues) => {
      // Usando RPC para garantir atomicidade
      const { error } = await supabase.rpc('create_order', {
        user_id: user?.id,
        order_status: 'pending',
        total_amount: cartState.total,
        customer_details: values,
        order_items_data: cartState.items.map(item => ({
          product_id: item.id,
          quantity: item.quantity,
          price: item.price
        }))
      });

      if (error) {
        throw new Error(error.message);
      }
    },
    onSuccess: () => {
      toast({ title: "Pedido realizado!", description: "Seu pedido foi criado com sucesso." });
      cartDispatch({ type: 'CLEAR_CART' });
      navigate('/perfil'); // Redireciona para a página de perfil para ver os pedidos
    },
    onError: (error) => {
      toast({ title: "Erro!", description: `Não foi possível criar o pedido: ${error.message}`, variant: 'destructive' });
    }
  });

  const onSubmit = (values: CheckoutFormValues) => {
    if (cartState.items.length === 0) {
      toast({ title: "Carrinho vazio!", description: "Adicione itens ao carrinho antes de finalizar.", variant: 'destructive' });
      return;
    }
    createOrderMutation.mutate(values);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Finalizar Compra</h1>
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Informações de Entrega</CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField control={form.control} name="customer_name" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome Completo</FormLabel>
                        <FormControl><Input {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="customer_phone" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Telefone</FormLabel>
                        <FormControl><Input {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="customer_address" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Endereço Completo</FormLabel>
                        <FormControl><Textarea {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="notes" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Observações (opcional)</FormLabel>
                        <FormControl><Textarea placeholder="Ponto de referência, etc." {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <Button type="submit" className="w-full" disabled={createOrderMutation.isPending}>
                      {createOrderMutation.isPending ? 'Processando...' : 'Finalizar Pedido'}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Resumo do Pedido</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {cartState.items.map(item => (
                    <div key={item.id} className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-muted-foreground">Qtd: {item.quantity}</p>
                      </div>
                      <p>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.price * item.quantity)}</p>
                    </div>
                  ))}
                  <div className="border-t pt-4 mt-4 flex justify-between font-bold text-lg">
                    <p>Total</p>
                    <p>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cartState.total)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;