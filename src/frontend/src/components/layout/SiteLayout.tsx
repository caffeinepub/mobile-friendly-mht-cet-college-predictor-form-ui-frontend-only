import { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Database, Heart } from 'lucide-react';

type Page = 'home' | 'predictor' | 'how-it-works' | 'contact';

interface SiteLayoutProps {
  children: ReactNode;
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

export function SiteLayout({ children, currentPage, onNavigate }: SiteLayoutProps) {
  const navItems: { id: Page; label: string }[] = [
    { id: 'home', label: 'Home' },
    { id: 'predictor', label: 'Predictor' },
    { id: 'how-it-works', label: 'How it Works' },
    { id: 'contact', label: 'Contact & Support' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex flex-col">
      {/* Header with Navigation */}
      <header className="border-b border-border/40 bg-card/80 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          {/* Logo/Brand Area */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => onNavigate('home')}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
                <Database className="h-6 w-6 text-primary" />
              </div>
              <div className="text-left">
                <p className="text-xs text-muted-foreground">By COEP Students</p>
                <h1 className="text-lg font-bold tracking-tight text-foreground">
                  MHT-CET College Predictor
                </h1>
              </div>
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex flex-wrap gap-2">
            {navItems.map((item) => (
              <Button
                key={item.id}
                variant={currentPage === item.id ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onNavigate(item.id)}
                className="text-sm"
              >
                {item.label}
              </Button>
            ))}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-card/50 backdrop-blur-sm mt-12">
        <div className="container mx-auto px-4 py-6 text-center">
          <p className="text-sm text-muted-foreground flex items-center justify-center gap-1.5">
            Built with <Heart className="h-4 w-4 text-primary fill-primary" /> using{' '}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
                typeof window !== 'undefined' ? window.location.hostname : 'mht-cet-predictor'
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-primary hover:underline"
            >
              caffeine.ai
            </a>
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            © {new Date().getFullYear()} MHT-CET College Predictor. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
