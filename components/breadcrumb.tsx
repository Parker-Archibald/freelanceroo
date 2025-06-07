"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronRight, Home } from "lucide-react"

interface BreadcrumbItem {
  href: string
  label: string
}

function generateBreadcrumbs(pathname: string): BreadcrumbItem[] {
  const paths = pathname.split('/').filter(Boolean)
  return paths.map((path, index) => {
    const href = `/${paths.slice(0, index + 1).join('/')}`
    const label = path.charAt(0).toUpperCase() + path.slice(1)
    return { href, label }
  })
}

export function Breadcrumb() {
  const pathname = usePathname()
  const breadcrumbs = generateBreadcrumbs(decodeURI(pathname))

  if (pathname === '/') return null

  return (
    <nav className="flex items-center space-x-1 text-sm text-muted-foreground -mt-10">
      <Link
        href="/"
        className="flex items-center hover:text-foreground transition-colors"
      >
        <Home className="h-4 w-4" />
        <span className="ml-1">Dashboard</span>
      </Link>
      {breadcrumbs.map((breadcrumb, index) => (
        <div key={breadcrumb.href} className="flex items-center">
          <ChevronRight className="h-4 w-4 mx-1" />
          <Link
            href={breadcrumb.href}
            className={`hover:text-foreground transition-colors ${index === breadcrumbs.length - 1 ? "text-foreground font-medium" : ""
              }`}
          >
            {breadcrumb.label}
          </Link>
        </div>
      ))}
    </nav>
  )
}