
import Link from 'next/link';
import { Newspaper, Menu as MenuIcon } from 'lucide-react'; // Added MenuIcon
import Navbar from './Navbar';
import SearchBar from '../news/SearchBar';
import { ThemeToggle } from '@/components/theme-toggle';
import MobileNavMenu from './MobileNavMenu'; // New component for mobile navigation

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2" aria-label="NewsFlash Home">
          <Newspaper className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-headline font-bold text-primary">NewsFlash</h1>
        </Link>

        <div className="hidden md:flex flex-1 justify-center">
          <Navbar />
        </div>

        <div className="flex items-center gap-2">
          <SearchBar />
          <ThemeToggle />
          <div className="md:hidden">
            <MobileNavMenu />
          </div>
        </div>
      </div>
    </header>
  );
}
