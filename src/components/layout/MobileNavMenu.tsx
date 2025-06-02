
"use client";

import Link from 'next/link';
import { Menu as MenuIcon, Newspaper } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from '@/components/ui/sheet';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ScrollArea } from '@/components/ui/scroll-area';
import { CATEGORIES, SOURCES, COUNTRIES } from '@/constants';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export default function MobileNavMenu() {
  const pathname = usePathname();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon">
          <MenuIcon className="h-6 w-6" />
          <span className="sr-only">Open navigation menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[300px] sm:w-[350px] flex flex-col p-0">
        <SheetHeader className="p-4 border-b">
          <SheetTitle className="flex items-center gap-2 text-primary">
             <Newspaper className="h-7 w-7" />
            <span className="font-headline text-xl">NewsFlash</span>
          </SheetTitle>
        </SheetHeader>
        <ScrollArea className="flex-grow">
          <nav className="py-4 px-2">
            <SheetClose asChild>
              <Link
                href="/"
                className={cn(
                  "block rounded-md px-3 py-2 text-base font-medium hover:bg-accent hover:text-accent-foreground",
                  pathname === '/' && "bg-accent text-accent-foreground"
                )}
              >
                Home
              </Link>
            </SheetClose>

            <Accordion type="single" collapsible className="w-full mt-2">
              <AccordionItem value="categories">
                <AccordionTrigger className="px-3 py-2 text-base font-medium hover:no-underline hover:bg-accent hover:text-accent-foreground rounded-md [&[data-state=open]]:bg-accent [&[data-state=open]]:text-accent-foreground">
                  Categories
                </AccordionTrigger>
                <AccordionContent className="pt-1">
                  <div className="pl-4">
                    {CATEGORIES.map((category) => (
                      <SheetClose asChild key={category.id}>
                        <Link
                          href={`/categories/${category.id}`}
                          className={cn(
                            "block rounded-md px-3 py-2 text-sm font-medium hover:bg-muted hover:text-foreground",
                            pathname === `/categories/${category.id}` && "bg-muted text-foreground font-semibold"
                          )}
                        >
                          {category.name}
                        </Link>
                      </SheetClose>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="sources">
                <AccordionTrigger className="px-3 py-2 text-base font-medium hover:no-underline hover:bg-accent hover:text-accent-foreground rounded-md [&[data-state=open]]:bg-accent [&[data-state=open]]:text-accent-foreground">
                  Sources
                </AccordionTrigger>
                <AccordionContent className="pt-1">
                   <div className="pl-4">
                    {SOURCES.map((source) => (
                      <SheetClose asChild key={source.id}>
                        <Link
                          href={`/sources/${source.id}`}
                          className={cn(
                            "block rounded-md px-3 py-2 text-sm font-medium hover:bg-muted hover:text-foreground",
                            pathname === `/sources/${source.id}` && "bg-muted text-foreground font-semibold"
                          )}
                        >
                          {source.name}
                        </Link>
                      </SheetClose>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="countries">
                <AccordionTrigger className="px-3 py-2 text-base font-medium hover:no-underline hover:bg-accent hover:text-accent-foreground rounded-md [&[data-state=open]]:bg-accent [&[data-state=open]]:text-accent-foreground">
                  Top Headlines by Country
                </AccordionTrigger>
                <AccordionContent className="pt-1">
                  <div className="pl-4">
                    {COUNTRIES.map((country) => (
                      <SheetClose asChild key={country.code}>
                        <Link
                          href={`/country/${country.code}`}
                          className={cn(
                            "block rounded-md px-3 py-2 text-sm font-medium hover:bg-muted hover:text-foreground",
                            pathname === `/country/${country.code}` && "bg-muted text-foreground font-semibold"
                          )}
                        >
                          {country.name}
                        </Link>
                      </SheetClose>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </nav>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
