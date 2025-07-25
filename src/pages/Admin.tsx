import { Header } from '@/components/Header';

const Admin = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Painel Administrativo</h1>
        <p className="text-muted-foreground">Painel admin em desenvolvimento...</p>
      </div>
    </div>
  );
};

export default Admin;