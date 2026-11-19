"use client";

import { AudioLines, ChevronRight, House, Library, Search } from "lucide-react";
import Form from "next/form";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { type ReactNode, useEffect, useRef } from "react";
import { LibrarySidebar } from "@/features/library/library-sidebar";
import { PlayerBar } from "@/features/player/player-bar";
import { usePlayer } from "@/features/player/player-provider";

const navigation = [
  { href: "/", label: "Beranda", icon: House },
  { href: "/search", label: "Cari", icon: Search },
  { href: "/library", label: "Koleksi", icon: Library },
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { currentTrack } = usePlayer();
  const previousPath = useRef(pathname);
  const content = useRef<HTMLElement>(null);
  useEffect(() => {
    if (previousPath.current !== pathname) {
      content.current?.focus({ preventScroll: true });
      previousPath.current = pathname;
    }
  }, [pathname]);
  return (
    <div className={`app-shell${currentTrack && !currentTrack.provider ? " has-video" : ""}`}>
      <a className="skip-link" href="#main-content">
        Lewati ke konten
      </a>
      <header className="topbar">
        <Link className="brand" href="/" aria-label="Senandung — Beranda">
          <span className="brand-icon">
            <AudioLines aria-hidden="true" size={27} />
          </span>
          <span>
            senandung<span className="brand-dot">.</span>
          </span>
        </Link>
        <nav className="desktop-nav" aria-label="Navigasi utama">
          {navigation.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              aria-current={pathname === href ? "page" : undefined}
              className={`nav-link${pathname === href ? " is-active" : ""}`}
            >
              <Icon size={21} aria-hidden="true" />
              <span className="sr-only">{label}</span>
            </Link>
          ))}
        </nav>
        <search aria-label="Pencarian cepat">
          <Form action="/search" className="header-search">
            <label htmlFor="header-query" className="sr-only">
              Cari musik
            </label>
            <Search size={22} aria-hidden="true" />
            <input
              id="header-query"
              name="q"
              maxLength={100}
              placeholder="Apa yang ingin kamu dengarkan?"
              autoComplete="off"
            />
            <button type="submit" aria-label="Kirim pencarian">
              <ChevronRight size={20} aria-hidden="true" />
            </button>
          </Form>
        </search>
        <div className="topbar-right">
          <span className="beta-badge">BETA</span>
          <Link href="/credits" className="text-link">
            Kredit & sumber
          </Link>
          <span className="user-avatar">
            <span aria-hidden="true">S</span>
            <span className="sr-only">Ruang pribadi</span>
          </span>
        </div>
      </header>
      <aside className="sidebar">
        <Link className="library-heading" href="/library">
          <Library size={24} aria-hidden="true" />
          <strong className="library-title">Koleksi kamu</strong>
        </Link>
        <LibrarySidebar />
        <div className="sidebar-note">
          <span className="tiny-wave" aria-hidden="true">
            ııııı
          </span>
          <strong>Senandung, ruang musikmu.</strong>
          <p>Temukan lagu dan suasana untuk hari ini.</p>
          <Link href="/credits">Tentang sumber & lisensi</Link>
        </div>
      </aside>
      <div className="main-column">
        <main id="main-content" ref={content} tabIndex={-1} className="main-content">
          <div key={pathname} className="page-content">
            {children}
          </div>
          <footer className="page-footer">
            <span>
              senandung. <span>Temukan nada, temukan rasa.</span>
            </span>
            <Link href="/credits">Sumber musik · Kredit & privasi</Link>
          </footer>
        </main>
      </div>
      <PlayerBar />
      <nav className="mobile-nav" aria-label="Navigasi mobile">
        {navigation.map(({ href, label, icon: Icon }) => (
          <Link href={href} key={href} aria-current={pathname === href ? "page" : undefined}>
            <Icon size={22} aria-hidden="true" />
            <span>{label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
