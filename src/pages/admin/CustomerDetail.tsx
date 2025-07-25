import { Header } from '@/components/Header';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import type { Database } from '@/integrations/supabase/types';

type Profile = Database['public']['Tables']['profiles']['Row'];
type Order = Database['public']['Tables']['orders']['Row'];

const fetchCustomerDetails = async (id: string) => {
  const profilePromise = supabase.from('profiles').select('*').eq('id', id).single();
  const ordersPromise = supabase.from('orders').select('*').eq('user_id', id).order('created_at', { ascending: false });

  const [{ data: profile, error: profileError }, { data: orders, error: ordersError }] = await Promise.all([profilePromise, ordersPromise]);

  if (profileError) throw new Error(`Erro ao buscar perfil: ${profileError.message}`);
  if (ordersError) throw new Error(`Erro ao buscar pedidos: ${ordersError.message}`);

  return { profile, orders };
};

const AdminCustomerDetail = () => {
  const { id } = useParams<{ id: string }>();

  const { data, isLoading, error } = useQuery({
    queryKey: ['customer-details', id],
    queryFn: () => fetchCustomerDetails(id!),
    enabled: !!id,
  });

  const { profile, orders } = data || {};

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        {isLoading ? (
          <div className="space-y-6">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        ) : error ? (
          <p className="text-destructive">{error.message}</p>
        ) : profile ? (
          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>{profile.full_name || 'Cliente sem nome'}</CardTitle>
                <CardDescription>{profile.email}</CardDescription>
              </CardHeader>
              <CardContent className="grid sm:grid-cols-2 gap-4">
                <div><strong>Telefone:</strong> {profile.phone || 'Não informado'}</div>
                <div><strong>Endereço:</strong> {profile.address || 'Não informado'}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Histórico de Pedidos</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders && orders.length > 0 ? (
                      orders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell>{new Date(order.created_at).toLocaleDateString('pt-BR')}</TableCell>
                          <TableCell>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(order.total_amount)}</TableCell>
                          <TableCell><Badge>{order.status}</Badge></TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center">Nenhum pedido encontrado.</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        ) : (
          <p>Cliente não encontrado.</p>
        )}
      </div>
    </div>
  );
};

export default AdminCustomerDetail;
