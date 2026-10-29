import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { cn } from "cn";
import { buttonVariants } from "@/components/ui/button";

import ThemeToggle from "../toggle-theme";
import { BrandLogo } from "@/components/ui/brand-logo";

type PublicRoute = "home" | "privacy" | "recovery" | "sign-in";

interface HeaderProps {
  locale: "en" | "sw";
  route: PublicRoute;
  cta?: {
    text: string;
    href: string;
  };
  text: {
    brand: string;
    navigationLabel: string;
    switchToEnglish: string;
    switchToSwahili: string;
  };
  publicHref: (lang: "en" | "sw", route: PublicRoute) => string;
}

// function defaultNav(){
//   return <>
//         {/* Main Navigation Menu */}
//       <NavigationMenu align="center" className="hidden md:flex">
//         <NavigationMenuList>
//           {/* Dropdown Menu Item Example: Features */}
//           <NavigationMenuItem>
//             <NavigationMenuTrigger>Features</NavigationMenuTrigger>
//             <NavigationMenuContent>
//               <div className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
//                 <NavigationMenuLink
//                   href={`/${locale}/features/analytics`}
//                   className="block space-y-1 rounded-2xl p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
//                 >
//                   <div className="text-sm font-medium leading-none">
//                     Analytics
//                   </div>
//                   <p className="line-clamp-2 text-xs leading-snug text-muted-foreground">
//                     Real-time insights and business metrics dashboard.
//                   </p>
//                 </NavigationMenuLink>
//                 <NavigationMenuLink
//                   href={`/${locale}/features/inventory`}
//                   className="block space-y-1 rounded-2xl p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
//                 >
//                   <div className="text-sm font-medium leading-none">
//                     Inventory
//                   </div>
//                   <p className="line-clamp-2 text-xs leading-snug text-muted-foreground">
//                     Manage products, stock levels, and order fulfillments.
//                   </p>
//                 </NavigationMenuLink>
//               </div>
//             </NavigationMenuContent>
//           </NavigationMenuItem>

//           {/* Standalone Link Item Example: Pricing */}
//           <NavigationMenuItem>
//             <NavigationMenuLink
//               href={`/${locale}/pricing`}
//               className="group/navigation-menu-trigger inline-flex h-9 w-max items-center justify-center rounded-3xl px-4.5 py-2.5 text-sm font-medium transition-all outline-none hover:bg-muted focus:bg-muted"
//             >
//               Pricing
//             </NavigationMenuLink>
//           </NavigationMenuItem>

//           {/* Standalone Link Item Example: About */}
//           <NavigationMenuItem>
//             <NavigationMenuLink
//               href={`/${locale}/about`}
//               className="group/navigation-menu-trigger inline-flex h-9 w-max items-center justify-center rounded-3xl px-4.5 py-2.5 text-sm font-medium transition-all outline-none hover:bg-muted focus:bg-muted"
//             >
//               About Us
//             </NavigationMenuLink>
//           </NavigationMenuItem>
//         </NavigationMenuList>
//       </NavigationMenu>
//   </>
// }

export function Navbar({ locale, route, cta, text, publicHref }: HeaderProps) {
  return (
    <header className="relative z-10 mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-5 sm:px-8 lg:px-12">
      <BrandLogo locale={locale} href={`/${locale}`} />

      {/* Right-side Utilities & Actions */}
      <div className="flex items-center gap-2">
        {/* Language Switcher */}
        <nav
          aria-label={text.navigationLabel}
          className="flex items-center gap-1"
        >
          <Link
            href={publicHref("en", route)}
            lang="en"
            aria-label={text.switchToEnglish}
            aria-current={locale === "en" ? "page" : undefined}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-semibold transition-all duration-200",
              locale === "en"
                ? "bg-ring/50 text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            EN
          </Link>
          <Link
            href={publicHref("sw", route)}
            lang="sw"
            aria-label={text.switchToSwahili}
            aria-current={locale === "sw" ? "page" : undefined}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-semibold transition-all duration-200",
              locale === "sw"
                ? "bg-ring/50 text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            SW
          </Link>
        </nav>

        {/* Theme Toggle & Sign In */}
        <ThemeToggle locale={locale} variant="ghost" />
        {cta && (
          <Link
            href={cta.href}
            className={cn(
              buttonVariants({ size: "sm" }),
              "ml-1 rounded-full px-4",
            )}
          >
            {cta.text}
            <ArrowUpRight aria-hidden="true" />
          </Link>
        )}
      </div>
    </header>
  );
}
