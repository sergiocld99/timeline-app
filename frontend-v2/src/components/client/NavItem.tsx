"use client"

import { Link, usePathname } from "@/i18n/routing"

import { Button } from "@/components/ui/button"

type Props = {
  path: string,
  label: string
}

const NavItem = ({ path, label }: Props) => {
  const pathname = usePathname();
  
  const isActive = (path: string) => path === pathname

  return (
    <Link href={path}>
      <Button
        variant={isActive(path) ? "default" : "ghost"}
        className={isActive(path) ? "!bg-blue-600 !text-white hover:!bg-blue-700" : ""}
      >
        {label}
      </Button>
    </Link>
  )
}

export default NavItem