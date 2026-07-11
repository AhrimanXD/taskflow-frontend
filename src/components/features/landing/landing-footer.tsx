import Link from "next/link"
import { LayoutGrid } from "lucide-react"

const FOOTER_LINKS: { heading: string; links: { label: string; href: string }[] }[] = [
  {
    heading: "Product",
    links: [
      { label: "Features", href: "#features" },
      { label: "How it works", href: "#how-it-works" },
      { label: "Log in", href: "/login" },
      { label: "Create account", href: "/register" },
    ],
  },
  {
    heading: "Resources",
    links: [
      { label: "Documentation", href: "#" },
      { label: "API status", href: "#" },
      { label: "Changelog", href: "#" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "Privacy", href: "#" },
      { label: "Terms", href: "#" },
      { label: "Contact", href: "#" },
    ],
  },
]

export function LandingFooter() {
  return (
    <footer className="border-t border-border px-6 py-12">
      <div className="mx-auto grid max-w-6xl gap-10 sm:grid-cols-2 lg:grid-cols-[1.2fr_1fr_1fr_1fr]">
        <div>
          <Link href="/" className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <LayoutGrid className="size-4" />
            </div>
            <span className="text-base font-semibold tracking-tight text-foreground">
              Taskflow
            </span>
          </Link>
          <p className="mt-3 max-w-xs text-sm text-muted-foreground">
            Realtime collaborative task management for teams that don&apos;t
            want to wait for a refresh.
          </p>
        </div>

        {FOOTER_LINKS.map((column) => (
          <div key={column.heading}>
            <p className="text-xs font-medium text-foreground">{column.heading}</p>
            <ul className="mt-3 space-y-2">
              {column.links.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mx-auto mt-10 max-w-6xl border-t border-border pt-6 text-xs text-muted-foreground">
        © {new Date().getFullYear()} Taskflow. All rights reserved.
      </div>
    </footer>
  )
}
