"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search as SearchIcon } from 'lucide-react';

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      setQuery(''); // Optionally clear input after search
    }
  };

  return (
    <form onSubmit={handleSearch} className="flex w-full min-w-0 sm:max-w-xs md:max-w-sm items-center space-x-2">
      <Input
        type="search"
        placeholder="Search news..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="h-10"
      />
      <Button type="submit" size="icon" aria-label="Search">
        <SearchIcon className="h-5 w-5" />
      </Button>
    </form>
  );
}
