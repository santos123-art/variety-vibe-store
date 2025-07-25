import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight, Star, Shield, Truck, Heart } from 'lucide-react';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

gsap.registerPlugin(ScrollTrigger);

const Index = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const categoriesRef = useRef<HTMLDivElement>(null);
  const productsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Hero Animation
    if (heroRef.current) {
      const heroElements = heroRef.current.children;
      gsap.fromTo(heroElements, 
        { opacity: 0, y: 50 },
        { 
          opacity: 1, 
          y: 0, 
          duration: 1, 
          stagger: 0.2,
          ease: "power2.out"
        }
      );
    }

    // Features Animation
    if (featuresRef.current) {
      gsap.fromTo(featuresRef.current.children,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.1,
          scrollTrigger: {
            trigger: featuresRef.current,
            start: "top 80%",
            end: "bottom 20%",
            toggleActions: "play none none reverse"
          }
        }
      );
    }

    // Categories Animation
    if (categoriesRef.current) {
      gsap.fromTo(categoriesRef.current.children,
        { opacity: 0, scale: 0.9 },
        {
          opacity: 1,
          scale: 1,
          duration: 0.6,
          stagger: 0.1,
          scrollTrigger: {
            trigger: categoriesRef.current,
            start: "top 80%",
            end: "bottom 20%",
            toggleActions: "play none none reverse"
          }
        }
      );
    }

    // Products Animation
    if (productsRef.current) {
      gsap.fromTo(productsRef.current.children,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.1,
          scrollTrigger: {
            trigger: productsRef.current,
            start: "top 80%",
            end: "bottom 20%",
            toggleActions: "play none none reverse"
          }
        }
      );
    }

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  const featuredCategories = [
    { 
      name: 'Móveis', 
      description: 'Mesas, cadeiras e móveis para sua casa',
      image: '/placeholder.svg',
      color: 'from-blue-500 to-blue-600'
    },
    { 
      name: 'Utensílios de Cozinha', 
      description: 'Panelas, talheres e acessórios',
      image: '/placeholder.svg',
      color: 'from-green-500 to-green-600'
    },
    { 
      name: 'Decoração', 
      description: 'Vasos, quadros e itens decorativos',
      image: '/placeholder.svg',
      color: 'from-purple-500 to-purple-600'
    },
    { 
      name: 'Organização', 
      description: 'Cestas, organizadores e storage',
      image: '/placeholder.svg',
      color: 'from-orange-500 to-orange-600'
    }
  ];

  const features = [
    {
      icon: Shield,
      title: 'Qualidade Garantida',
      description: 'Produtos selecionados com garantia de qualidade'
    },
    {
      icon: Truck,
      title: 'Entrega Rápida',
      description: 'Entregamos em toda a região com agilidade'
    },
    {
      icon: Heart,
      title: 'Atendimento Personalizado',
      description: 'Estamos aqui para ajudar você'
    },
    {
      icon: Star,
      title: 'Melhor Preço',
      description: 'Preços justos e condições especiais'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 gradient-hero opacity-90"></div>
        <div className="absolute inset-0 bg-black/20"></div>
        
        <div ref={heroRef} className="relative z-10 container mx-auto px-4 text-center text-white">
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            Top Variedades
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto opacity-90">
            Sua loja online de artigos domésticos com qualidade e os melhores preços
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="xl" variant="hero">
              <Link to="/produtos">
                Ver Produtos <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild size="xl" variant="outline" className="bg-white/10 text-white border-white/30 hover:bg-white/20">
              <Link to="/categorias">
                Categorias
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Por que escolher a Top Variedades?</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Mais de 10 anos oferecendo os melhores produtos para sua casa
            </p>
          </div>
          
          <div ref={featuresRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center hover-lift border-0 shadow-soft">
                <CardContent className="p-6">
                  <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                    <feature.icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Nossas Categorias</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Encontre tudo que você precisa para sua casa
            </p>
          </div>
          
          <div ref={categoriesRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredCategories.map((category, index) => (
              <Link key={index} to={`/produtos?categoria=${category.name}`}>
                <Card className="overflow-hidden hover-lift group cursor-pointer">
                  <div className={`h-48 bg-gradient-to-br ${category.color} relative`}>
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>
                    <div className="absolute bottom-4 left-4 text-white">
                      <h3 className="text-xl font-bold">{category.name}</h3>
                      <p className="text-sm opacity-90">{category.description}</p>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button asChild size="lg" variant="outline">
              <Link to="/categorias">
                Ver Todas as Categorias
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Produtos em Destaque</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Confira nossos produtos mais vendidos
            </p>
          </div>
          
          <div ref={productsRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((product, index) => (
              <Card key={index} className="overflow-hidden hover-lift group cursor-pointer">
                <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 relative">
                  <div className="absolute top-2 right-2">
                    <span className="sale-badge">-20%</span>
                  </div>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-2">Produto Exemplo {product}</h3>
                  <p className="text-sm text-muted-foreground mb-2">Descrição do produto</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm text-muted-foreground line-through">R$ 99,90</span>
                      <p className="price-tag text-lg">R$ 79,90</p>
                    </div>
                    <Button size="sm" variant="premium">
                      Comprar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button asChild size="lg" variant="premium">
              <Link to="/produtos">
                Ver Todos os Produtos <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 gradient-hero text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Transforme sua casa com a Top Variedades
          </h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Cadastre-se agora e receba ofertas exclusivas direto no seu WhatsApp
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="xl" variant="outline" className="bg-white text-primary hover:bg-gray-100">
              <Link to="/auth">
                Criar Conta Grátis
              </Link>
            </Button>
            <Button asChild size="xl" variant="ghost" className="text-white border-white/30 hover:bg-white/10">
              <Link to="/sobre">
                Saiba Mais
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-foreground text-background py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Top Variedades</h3>
              <p className="text-background/70">
                Sua loja online de artigos domésticos com qualidade e os melhores preços.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Links Rápidos</h4>
              <ul className="space-y-2 text-background/70">
                <li><Link to="/produtos" className="hover:text-background transition-colors">Produtos</Link></li>
                <li><Link to="/categorias" className="hover:text-background transition-colors">Categorias</Link></li>
                <li><Link to="/sobre" className="hover:text-background transition-colors">Sobre</Link></li>
                <li><Link to="/auth" className="hover:text-background transition-colors">Minha Conta</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contato</h4>
              <ul className="space-y-2 text-background/70">
                <li>WhatsApp: (11) 99999-9999</li>
                <li>Email: contato@topvariedades.com</li>
                <li>Horário: Seg-Sex 8h-18h</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Formas de Pagamento</h4>
              <p className="text-background/70">
                Cartão de crédito, débito, PIX e transferência bancária.
              </p>
            </div>
          </div>
          <div className="border-t border-background/20 mt-8 pt-8 text-center text-background/70">
            <p>&copy; 2024 Top Variedades. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;