import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';

import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import { useCart } from '@/components/CartProvider';
import { useToast } from '@/components/ui/use-toast';

import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const checkoutSchema = z.object({
  fullName: z.string().min(3, { message: "O nome completo é obrigatório." }),
  phone: z.string().min(10, { message: "O telefone é obrigatório." }),
  address: z.string().min(10, { message: "O endereço é obrigatório." }),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

const Checkout = () => {
  const { user } = useAuth();
  const { state: cart, dispatch } = useCart();
  const { toast } = useToast();
  const navigate = useNavigate();

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      fullName: '',
      phone: '',
      address: '',
    },
  });

  useEffect(() => {
    if (user) {
      const fetchProfile = async () => {
        const { data, error } = await supabase
          .from('profiles')
          .select('full_name, phone, address')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error fetching profile:', error);
          toast({
            title: "Erro ao buscar perfil",
            description: "Não foi possível carregar suas informações. Por favor, preencha manualmente.",
            variant: "destructive",
          });
        } else if (data) {
          form.reset({
            fullName: data.full_name || '',
            phone: data.phone || '',
            address: data.address || '',
          });
        }
      };
      fetchProfile();
    }
  }, [user, form, toast]);

  const shippingCost = 0;
  const totalCost = cart.total + shippingCost;

  const onSubmit = async (data: CheckoutFormValues) => {
    if (!user) {
      toast({
        title: "Erro de autenticação",
        description: "Você precisa estar logado para finalizar a compra.",
        variant: "destructive",
      });
      return;
    }

    const orderItems = cart.items.map(item => ({
      product_id: item.id,
      quantity: item.quantity,
      price: item.price,
    }));

    try {
      const { data: orderId, error } = await supabase.rpc('create_order', {
        p_user_id: user.id,
        p_customer_name: data.fullName,
        p_customer_phone: data.phone,
        p_customer_address: data.address,
        p_order_items: orderItems,
      });

      if (error) {
        throw error;
      }

      // Success!
      toast({
        title: "Pedido realizado com sucesso!",
        description: `Obrigado pela sua compra. O ID do seu pedido é: ${orderId}`,
      });

      dispatch({ type: 'CLEAR_CART' });
      navigate('/profile'); // Redirect to profile/orders page

    } catch (error: any) {
      console.error('Error creating order:', error);
      toast({
        title: "Erro ao criar pedido",
        description: error.message || "Não foi possível completar o seu pedido. Por favor, tente novamente.",
        variant: "destructive",
      });
    }
  };

  if (!user && cart.itemCount > 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-3xl font-bold mb-4">Você precisa estar logado</h1>
          <p className="text-muted-foreground mb-8">Por favor, faça login para continuar com a sua compra.</p>
          <Button onClick={() => navigate('/auth')}>Ir para Login</Button>
        </div>
      </div>
    )
  }

  if (cart.itemCount === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-3xl font-bold mb-4">Seu carrinho está vazio</h1>
          <p className="text-muted-foreground mb-8">Adicione itens ao seu carrinho antes de finalizar a compra.</p>
          <Button onClick={() => navigate('/')}>Voltar à loja</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl mb-8">Finalizar Compra</h1>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-12">

            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Informações de Entrega</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <FormField
                      control={form.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome Completo</FormLabel>
                          <FormControl>
                            <Input placeholder="Seu nome completo" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Telefone / WhatsApp</FormLabel>
                          <FormControl>
                            <Input placeholder="(XX) XXXXX-XXXX" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Endereço Completo</FormLabel>
                          <FormControl>
                            <Input placeholder="Rua, Número, Bairro, Cidade - Estado, CEP" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                </CardContent>
              </Card>
            </div>

            <aside className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle>Resumo do Pedido</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {cart.items.map(item => (
                    <div key={item.id} className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-muted-foreground">Quantidade: {item.quantity}</p>
                      </div>
                      <p className="font-medium">R$ {(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  ))}
                  <Separator />
                  <div className="flex justify-between">
                    <p className="text-muted-foreground">Subtotal</p>
                    <p>R$ {cart.total.toFixed(2)}</p>
                  </div>
                  <div className="flex justify-between">
                    <p className="text-muted-foreground">Frete</p>
                    <p>{shippingCost === 0 ? 'Grátis' : `R$ ${shippingCost.toFixed(2)}`}</p>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold text-lg">
                    <p>Total</p>
                    <p>R$ {totalCost.toFixed(2)}</p>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full" size="lg" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting ? 'Processando...' : 'Finalizar Compra'}
                  </Button>
                </CardFooter>
              </Card>
            </aside>

          </form>
        </Form>
      </main>
    </div>
  );
};

export default Checkout;