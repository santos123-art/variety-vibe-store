import { Header } from '@/components/Header';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Package, ShoppingCart, BarChart3, Plus, Edit, Trash2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const Admin = () => {
  const { isAdmin, loading, user } = useAdminAuth();
  const { toast } = useToast();
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  // Form states
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    category_id: '',
    stock_quantity: '',
    image_url: ''
  });

  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: '',
    image_url: ''
  });

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center">
            <p className="text-muted-foreground">Verificando permissões...</p>
          </div>
        </div>
      </div>
    );
  }

  // Redirect to auth if not logged in
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Show access denied if not admin
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="text-destructive">Acesso Negado</CardTitle>
              <CardDescription>
                Você não tem permissão para acessar o painel administrativo.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Entre em contato com um administrador se você acredita que isso é um erro.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const loadData = async () => {
    setLoadingData(true);
    try {
      const [productsResult, categoriesResult, ordersResult] = await Promise.all([
        supabase.from('products').select('*, categories(name)'),
        supabase.from('categories').select('*'),
        supabase.from('orders').select('*, profiles(email, full_name)')
      ]);

      setProducts(productsResult.data || []);
      setCategories(categoriesResult.data || []);
      setOrders(ordersResult.data || []);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao carregar dados",
        variant: "destructive"
      });
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from('products').insert({
        ...productForm,
        price: parseFloat(productForm.price),
        stock_quantity: parseInt(productForm.stock_quantity)
      });

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Produto criado com sucesso"
      });

      setProductForm({
        name: '',
        description: '',
        price: '',
        category_id: '',
        stock_quantity: '',
        image_url: ''
      });
      
      loadData();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao criar produto",
        variant: "destructive"
      });
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from('categories').insert(categoryForm);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Categoria criada com sucesso"
      });

      setCategoryForm({
        name: '',
        description: '',
        image_url: ''
      });
      
      loadData();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao criar categoria",
        variant: "destructive"
      });
    }
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
      
      toast({
        title: "Sucesso",
        description: "Produto excluído com sucesso"
      });
      
      loadData();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao excluir produto",
        variant: "destructive"
      });
    }
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Status do pedido atualizado"
      });

      loadData();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao atualizar status",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-2 mb-8">
          <BarChart3 className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold">Painel Administrativo</h1>
        </div>

        <Tabs defaultValue="cadastros" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="cadastros" className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              Cadastros
            </TabsTrigger>
            <TabsTrigger value="vendas" className="flex items-center gap-2">
              <ShoppingCart className="w-4 h-4" />
              Vendas
            </TabsTrigger>
            <TabsTrigger value="relatorios" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Relatórios
            </TabsTrigger>
          </TabsList>

          {/* Cadastros Tab */}
          <TabsContent value="cadastros" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Cadastro de Produtos */}
              <Card>
                <CardHeader>
                  <CardTitle>Cadastrar Produto</CardTitle>
                  <CardDescription>Adicione novos produtos ao catálogo</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCreateProduct} className="space-y-4">
                    <div>
                      <Label htmlFor="product-name">Nome</Label>
                      <Input
                        id="product-name"
                        value={productForm.name}
                        onChange={(e) => setProductForm({...productForm, name: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="product-category">Categoria</Label>
                      <Select 
                        value={productForm.category_id} 
                        onValueChange={(value) => setProductForm({...productForm, category_id: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma categoria" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id}>
                              {cat.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="product-price">Preço (R$)</Label>
                      <Input
                        id="product-price"
                        type="number"
                        step="0.01"
                        value={productForm.price}
                        onChange={(e) => setProductForm({...productForm, price: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="product-stock">Estoque</Label>
                      <Input
                        id="product-stock"
                        type="number"
                        value={productForm.stock_quantity}
                        onChange={(e) => setProductForm({...productForm, stock_quantity: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="product-image">URL da Imagem</Label>
                      <Input
                        id="product-image"
                        value={productForm.image_url}
                        onChange={(e) => setProductForm({...productForm, image_url: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="product-description">Descrição</Label>
                      <Textarea
                        id="product-description"
                        value={productForm.description}
                        onChange={(e) => setProductForm({...productForm, description: e.target.value})}
                      />
                    </div>
                    <Button type="submit" className="w-full">
                      <Plus className="w-4 h-4 mr-2" />
                      Cadastrar Produto
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Cadastro de Categorias */}
              <Card>
                <CardHeader>
                  <CardTitle>Cadastrar Categoria</CardTitle>
                  <CardDescription>Organize produtos em categorias</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCreateCategory} className="space-y-4">
                    <div>
                      <Label htmlFor="category-name">Nome</Label>
                      <Input
                        id="category-name"
                        value={categoryForm.name}
                        onChange={(e) => setCategoryForm({...categoryForm, name: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="category-image">URL da Imagem</Label>
                      <Input
                        id="category-image"
                        value={categoryForm.image_url}
                        onChange={(e) => setCategoryForm({...categoryForm, image_url: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="category-description">Descrição</Label>
                      <Textarea
                        id="category-description"
                        value={categoryForm.description}
                        onChange={(e) => setCategoryForm({...categoryForm, description: e.target.value})}
                      />
                    </div>
                    <Button type="submit" className="w-full">
                      <Plus className="w-4 h-4 mr-2" />
                      Cadastrar Categoria
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Lista de Produtos */}
            <Card>
              <CardHeader>
                <CardTitle>Produtos Cadastrados</CardTitle>
                <CardDescription>Gerencie o catálogo de produtos</CardDescription>
              </CardHeader>
              <CardContent>
                {loadingData ? (
                  <p className="text-center text-muted-foreground">Carregando...</p>
                ) : (
                  <div className="space-y-2">
                    {products.map((product) => (
                      <div key={product.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium">{product.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {product.categories?.name} • R$ {product.price} • Estoque: {product.stock_quantity}
                          </p>
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteProduct(product.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Vendas Tab */}
          <TabsContent value="vendas" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Gestão de Pedidos</CardTitle>
                <CardDescription>Gerencie pedidos e vendas</CardDescription>
              </CardHeader>
              <CardContent>
                {loadingData ? (
                  <p className="text-center text-muted-foreground">Carregando...</p>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div key={order.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <h4 className="font-medium">Pedido #{order.id.slice(0, 8)}</h4>
                            <p className="text-sm text-muted-foreground">
                              Cliente: {order.customer_name} ({order.profiles?.email})
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Total: R$ {order.total_amount}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Select
                              value={order.status}
                              onValueChange={(value) => updateOrderStatus(order.id, value)}
                            >
                              <SelectTrigger className="w-40">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">Pendente</SelectItem>
                                <SelectItem value="processing">Processando</SelectItem>
                                <SelectItem value="shipped">Enviado</SelectItem>
                                <SelectItem value="delivered">Entregue</SelectItem>
                                <SelectItem value="cancelled">Cancelado</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          <p>Endereço: {order.customer_address}</p>
                          <p>Telefone: {order.customer_phone}</p>
                          {order.notes && <p>Observações: {order.notes}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Relatórios Tab */}
          <TabsContent value="relatorios" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Total de Produtos</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-primary">{products.length}</p>
                  <p className="text-sm text-muted-foreground">produtos cadastrados</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Total de Pedidos</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-primary">{orders.length}</p>
                  <p className="text-sm text-muted-foreground">pedidos realizados</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Faturamento Total</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-primary">
                    R$ {orders.reduce((sum, order) => sum + parseFloat(order.total_amount || 0), 0).toFixed(2)}
                  </p>
                  <p className="text-sm text-muted-foreground">em vendas</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Pedidos por Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {['pending', 'processing', 'shipped', 'delivered', 'cancelled'].map((status) => {
                    const count = orders.filter(order => order.status === status).length;
                    const percentage = orders.length > 0 ? (count / orders.length) * 100 : 0;
                    const statusLabels = {
                      pending: 'Pendente',
                      processing: 'Processando',
                      shipped: 'Enviado',
                      delivered: 'Entregue',
                      cancelled: 'Cancelado'
                    };
                    
                    return (
                      <div key={status} className="flex items-center justify-between">
                        <span className="text-sm">{statusLabels[status as keyof typeof statusLabels]}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-muted rounded-full h-2">
                            <div 
                              className="h-2 bg-primary rounded-full" 
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium">{count}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;