import { Header } from '@/components/Header';
import { useCart } from '@/components/CartProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trash2, ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';

const Cart = () => {
  const { state, dispatch } = useCart();
  const { toast } = useToast();

  const handleRemoveItem = (id: string, name: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: id });
    toast({
      title: "Produto removido",
      description: `${name} foi removido do seu carrinho.`,
      variant: "destructive"
    });
  };

  const handleUpdateQuantity = (id: string, quantity: number) => {
    if (quantity > 0) {
      dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } });
    } else {
      // A lógica do reducer já remove se a quantidade for <= 0, mas podemos ser explícitos aqui
      handleRemoveItem(id, state.items.find(item => item.id === id)?.name || 'Produto');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Seu Carrinho</h1>
        {state.items.length === 0 ? (
          <div className="text-center py-16">
            <ShoppingCart className="mx-auto h-24 w-24 text-muted-foreground" />
            <h2 className="mt-6 text-2xl font-semibold">Seu carrinho está vazio</h2>
            <p className="mt-2 text-muted-foreground">
              Parece que você ainda não adicionou nenhum produto.
            </p>
            <Button asChild className="mt-6">
              <Link to="/produtos">Continuar Comprando</Link>
            </Button>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[100px]">Produto</TableHead>
                        <TableHead></TableHead>
                        <TableHead>Preço</TableHead>
                        <TableHead className="w-[120px]">Quantidade</TableHead>
                        <TableHead className="text-right">Subtotal</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {state.items.map(item => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <img
                              src={item.image_url || '/placeholder.svg'}
                              alt={item.name}
                              className="w-16 h-16 object-cover rounded-md"
                            />
                          </TableCell>
                          <TableCell className="font-medium">{item.name}</TableCell>
                          <TableCell>
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.price)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                              >
                                -
                              </Button>
                              <Input
                                type="number"
                                value={item.quantity}
                                onChange={(e) => handleUpdateQuantity(item.id, parseInt(e.target.value) || 0)}
                                className="w-16 h-8 text-center"
                              />
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                              >
                                +
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.price * item.quantity)}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveItem(item.id, item.name)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Resumo do Pedido</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span>Subtotal ({state.itemCount} {state.itemCount > 1 ? 'itens' : 'item'})</span>
                    <span>
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(state.total)}
                    </span>
                  </div>
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(state.total)}
                    </span>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button asChild className="w-full">
                    <Link to="/checkout">Finalizar Compra</Link>
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;