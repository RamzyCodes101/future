'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { gsap, ScrollTrigger, prefersReducedMotion } from '@/lib/gsap'
import { useCart } from '@/lib/cart'

const links = [
  { href: '/shop', label: 'Shop' },
  { href: '/collections/harmattan', label: 'Collection' },
  { href: '/lookbook', label: 'Lookbook' },
  { href: '/journal', label: 'Journal' },
  { href: '/about', label: 'Atelier' },
]

/**
 * Hides on the way down and returns on the way up — the reading position is
 * given back to the photography, and the nav is one gesture away.
 */
export function Header({ announcement }: { announcement?: string }) {
  const bar = useRef<HTMLDivElement>(null)
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const count = useCart((s) => s.count())
  const openCart = useCart((s) => s.open)

  useEffect(() => setOpen(false), [pathname])

  // Pages that open on a full-bleed dark image let the header sit over the
  // photograph; everything else keeps it in the flow of the document.
  const onDark = pathname === '/' || pathname === '/lookbook'

  useEffect(() => {
    const el = bar.current
    if (!el || prefersReducedMotion()) return

    // Hide on the way down, return on the way up.
    const hide = ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate: (self) => {
        const goingDown = self.direction === 1
        gsap.to(el, {
          yPercent: goingDown && self.scroll() > 220 ? -100 : 0,
          duration: 0.55,
          ease: 'expo.out',
          overwrite: true,
        })
      },
    })

    // The bar only takes a solid background once it is off the hero — over a
    // full-bleed photograph it should be nothing but type.
    const solid = ScrollTrigger.create({
      start: () => (onDark ? window.innerHeight * 0.9 : 90),
      end: 'max',
      invalidateOnRefresh: true,
      onToggle: (self) => {
        gsap.to(el, {
          backgroundColor: self.isActive ? 'rgba(247,244,238,0.94)' : 'rgba(247,244,238,0)',
          color: self.isActive ? '#16161a' : '',
          duration: 0.4,
        })
      },
    })

    return () => {
      hide.kill()
      solid.kill()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onDark])

  return (
    <>
      <div
        ref={bar}
        className={`z-40 w-full backdrop-blur-[2px] ${
          onDark ? 'fixed inset-x-0 top-0 text-ivory' : 'sticky top-0 text-ink'
        }`}
      >
        {announcement ? (
          <div className="bg-noir py-2.5 text-center">
            <p className="label text-mist">{announcement}</p>
          </div>
        ) : null}

        <header>
          <div className="gutter flex items-center justify-between py-5">
            <Link href="/" className="label-lg tracking-[0.3em] uppercase">
              Fashionova
            </Link>

            <nav aria-label="Primary" className="hidden gap-9 md:flex">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={pathname.startsWith(link.href) ? 'page' : undefined}
                  className={`label link-underline ${
                    pathname.startsWith(link.href) ? 'text-champagne' : ''
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-6">
              <button
                onClick={openCart}
                className="label link-underline"
                aria-label={`Open bag, ${count} ${count === 1 ? 'item' : 'items'}`}
              >
                Bag ({count})
              </button>
              <button
                onClick={() => setOpen((v) => !v)}
                className="label md:hidden"
                aria-expanded={open}
                aria-controls="mobile-nav"
              >
                {open ? 'Close' : 'Menu'}
              </button>
            </div>
          </div>

          {open ? (
            <nav
              id="mobile-nav"
              aria-label="Primary"
              className="gutter border-t rule bg-ivory pb-8 pt-4 text-ink md:hidden"
            >
              {links.map((link) => (
                <Link key={link.href} href={link.href} className="text-section block py-2">
                  {link.label}
                </Link>
              ))}
            </nav>
          ) : null}
        </header>
      </div>
    </>
  )
}
