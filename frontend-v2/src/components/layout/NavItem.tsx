"use client"

import type { LucideIcon } from "lucide-react"

import { Link, usePathname } from "@/i18n/routing"
import { Button } from "@/components/ui/button"

type Props = {
  path: string,
  label: string,
  icon: LucideIcon,
}

const NavItem = ({ path, label, icon: Icon }: Props) => {
  const pathname = usePathname();
  
  const isActive = (path: string) => path === pathname

  return (
    <Link href={path}>
      <Button
        variant={isActive(path) ? "default" : "ghost"}
        className={isActive(path) ? "!bg-blue-600 !text-white hover:!bg-blue-700" : ""}
      >
        <Icon aria-hidden="true" />
        {label}
      </Button>
    </Link>
  )
}

export default NavItem
