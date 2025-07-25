import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, Search, ShoppingCart, User, X, Shield, Package, LayoutGrid } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useCart } from './CartProvider';
import { useAuth } from './AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { state: cartState } = useCart();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      if (!user) {
        setIsAdmin(false);
        return;
      }
      const { data } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
      setIsAdmin(data?.role === 'admin');
    };
    checkAdmin();
  }, [user]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/produtos?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded bg-primary flex items-center justify-center">
              <span className="text-lg font-bold text-primary-foreground">TV</span>
            </div>
            <span className="text-xl font-bold text-primary">Top Variedades</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-foreground hover:text-primary transition-colors">
              Início
            </Link>
            <Link to="/produtos" className="text-foreground hover:text-primary transition-colors">
              Produtos
            </Link>
            <Link to="/categorias" className="text-foreground hover:text-primary transition-colors">
              Categorias
            </Link>
            <Link to="/sobre" className="text-foreground hover:text-primary transition-colors">
              Sobre
            </Link>
          </nav>

          {/* Search Bar - Desktop */}
          <form onSubmit={handleSearch} className="hidden md:flex items-center space-x-2 flex-1 max-w-md mx-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar produtos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </form>

          {/* Actions */}
          <div className="flex items-center space-x-2">
            {/* Cart */}
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              onClick={() => navigate('/carrinho')}
            >
              <ShoppingCart className="h-5 w-5" />
              {cartState.itemCount > 0 && (
                <span className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                  {cartState.itemCount}
                </span>
              )}
            </Button>

            {/* Admin Menu */}
            {isAdmin && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Shield className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Painel Admin</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/admin">
                      <Package className="mr-2 h-4 w-4" />
                      <span>Produtos</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/admin/categorias">
                      <LayoutGrid className="mr-2 h-4 w-4" />
                      <span>Categorias</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/admin/pedidos">
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      <span>Pedidos</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/admin/clientes">
                      <User className="mr-2 h-4 w-4" />
                      <span>Clientes</span>
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* User Menu */}
            {user ? (
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate('/perfil')}
                >
                  <User className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSignOut}
                  className="hidden sm:inline-flex"
                >
                  Sair
                </Button>
              </div>
            ) : (
              <Button
                variant="ghost"
                onClick={() => navigate('/auth')}
                className="hidden sm:inline-flex"
              >
                Entrar
              </Button>
            )}

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 space-y-4 animate-fade-in">
            {/* Mobile Search */}
            <form onSubmit={handleSearch} className="flex items-center space-x-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Buscar produtos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </form>

            {/* Mobile Navigation */}
            <nav className="flex flex-col space-y-2">
              <Link
                to="/"
                className="p-2 text-foreground hover:text-primary transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Início
              </Link>
              <Link
                to="/produtos"
                className="p-2 text-foreground hover:text-primary transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Produtos
              </Link>
              <Link
                to="/categorias"
                className="p-2 text-foreground hover:text-primary transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Categorias
              </Link>
              <Link
                to="/sobre"
                className="p-2 text-foreground hover:text-primary transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Sobre
              </Link>

              {/* Mobile User Actions */}
              {user ? (
                <div className="border-t pt-2 mt-2">
                  <Link
                    to="/perfil"
                    className="p-2 text-foreground hover:text-primary transition-colors block"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Meu Perfil
                  </Link>
                  <button
                    onClick={() => {
                      handleSignOut();
                      setIsMenuOpen(false);
                    }}
                    className="p-2 text-foreground hover:text-primary transition-colors block w-full text-left"
                  >
                    Sair
                  </button>
                </div>
              ) : (
                <div className="border-t pt-2 mt-2">
                  <Link
                    to="/auth"
                    className="p-2 text-foreground hover:text-primary transition-colors block"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Entrar / Cadastrar
                  </Link>
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}