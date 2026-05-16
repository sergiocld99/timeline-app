"use client";

import { Menu } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { Link, usePathname } from "@/i18n/routing";

import NavItem from "./client/NavItem";
import ThemeToggle from "./client/ThemeToggle";
import UserDropdown from "./client/UserDropdown";
import { Button } from "./ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";

const NAV_ITEMS: { path: any; labelKey: string }[] = [
  { path: "/creator", labelKey: "creator" },
  { path: "/crosses", labelKey: "crosses" },
  { path: "/locations", labelKey: "locations" },
  { path: "/travels", labelKey: "travels" },
  { path: "/visits", labelKey: "visits" },
];

const Header = () => {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const t = useTranslations("Navigation");

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <header className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Timeline App
            </h1>
          </Link>

          {/* Desktop: nav + user + theme */}
          <div className="hidden lg:flex items-center space-x-4">
            <nav className="flex space-x-4">
              {NAV_ITEMS.map(({ path, labelKey }) => (
                <NavItem key={path} path={path} label={t(labelKey as any)} />
              ))}
            </nav>
            <div className="flex items-center space-x-2">
              <UserDropdown />
              <ThemeToggle />
            </div>
          </div>

          {/* Mobile: hamburger + sheet */}
          <div className="flex lg:hidden items-center gap-2">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={open ? "Close menu" : "Open menu"}
                  aria-expanded={open}
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[280px] sm:w-[320px]">
                <SheetHeader>
                  <SheetTitle>{t("menu")}</SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col gap-1 pt-4 [&_a]:w-full [&_button]:w-full [&_button]:justify-start">
                  {NAV_ITEMS.map(({ path, labelKey }) => (
                    <div key={path} onClick={() => setOpen(false)}>
                      <NavItem path={path} label={t(labelKey as any)} />
                    </div>
                  ))}
                </nav>
                <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 flex flex-col gap-2">
                  <UserDropdown />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
