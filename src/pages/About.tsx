import { Header } from '@/components/Header';

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Sobre Nós</h1>
        <p className="text-muted-foreground">Página sobre em desenvolvimento...</p>
      </div>
    </div>
  );
};

export default About;