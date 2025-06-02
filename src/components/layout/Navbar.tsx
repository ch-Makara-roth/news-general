"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { CATEGORIES, SOURCES, COUNTRIES } from '@/constants';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { ScrollArea } from '@/components/ui/scroll-area';

export default function Navbar() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path || (path !== '/' && pathname.startsWith(path));

  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <Link href="/" legacyBehavior passHref>
            <NavigationMenuLink active={isActive('/')} className={cn(navigationMenuTriggerStyle(), isActive('/') && "bg-accent text-accent-foreground")}>
              Home
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <NavigationMenuTrigger>Categories</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ScrollArea className="h-[300px] w-[200px]">
              <ul className="grid p-2">
                {CATEGORIES.map((category) => (
                  <ListItem key={category.id} href={`/categories/${category.id}`} title={category.name} />
                ))}
              </ul>
            </ScrollArea>
          </NavigationMenuContent>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <NavigationMenuTrigger>Sources</NavigationMenuTrigger>
          <NavigationMenuContent>
             <ScrollArea className="h-[300px] w-[250px]">
              <ul className="grid p-2">
                {SOURCES.map((source) => (
                  <ListItem key={source.id} href={`/sources/${source.id}`} title={source.name} />
                ))}
              </ul>
            </ScrollArea>
          </NavigationMenuContent>
        </NavigationMenuItem>

         <NavigationMenuItem>
          <NavigationMenuTrigger>Top Headlines by Country</NavigationMenuTrigger>
          <NavigationMenuContent>
             <ScrollArea className="h-[300px] w-[250px]">
              <ul className="grid p-2">
                {COUNTRIES.map((country) => (
                  <ListItem key={country.code} href={`/country/${country.code}`} title={country.name} />
                ))}
              </ul>
            </ScrollArea>
          </NavigationMenuContent>
        </NavigationMenuItem>

      </NavigationMenuList>
    </NavigationMenu>
  );
}

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <Link
          href={props.href || "/"}
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </Link>
      </NavigationMenuLink>
    </li>
  )
})
ListItem.displayName = "ListItem"
