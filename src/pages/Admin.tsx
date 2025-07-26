import { Header } from '@/components/Header';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const Admin = () => {
  const { isAdmin, loading, user } = useAdminAuth();

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

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Painel Administrativo</h1>
        <Card>
          <CardHeader>
            <CardTitle>Bem-vindo, Administrador!</CardTitle>
            <CardDescription>
              Painel administrativo seguro em desenvolvimento...
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Este painel está protegido por autenticação e controle de acesso baseado em funções.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Admin;