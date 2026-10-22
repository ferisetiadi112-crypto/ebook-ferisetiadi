import { useEffect, useState } from "react";
import Admin from "./Admin";
import PdfFlipbook from "./PdfFlipbook";
import * as pdfjs from "pdfjs-dist";
import "./ebook-features.css";
import { Link, Route, Routes, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft, ArrowRight, BookOpen, Check, ChevronDown, Grid2X2, LibraryBig,
  ListFilter, Menu, Search, ShieldCheck, Sparkles, X
} from "lucide-react";
import { books, type Book } from "./data/books";

pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();

const pdfCoverCache = new Map<string, Promise<string>>();
function loadFirstPageCover(slug: string): Promise<string> {
  const cached = pdfCoverCache.get(slug);
  if (cached) return cached;
  const task = (async () => {
    const doc = await pdfjs.getDocument({ url: "/api/books/" + encodeURIComponent(slug) + "/pdf", withCredentials: true }).promise;
    try {
      const page = await doc.getPage(1);
      const viewport = page.getViewport({ scale: 0.8 });
      const canvas = document.createElement("canvas");
      canvas.width = Math.ceil(viewport.width);
      canvas.height = Math.ceil(viewport.height);
      const context = canvas.getContext("2d");
      if (!context) throw new Error("Canvas tidak tersedia");
      await page.render({ canvasContext: context, viewport }).promise;
      return canvas.toDataURL("image/jpeg", 0.84);
    } finally {
      await doc.destroy();
    }
  })();
  pdfCoverCache.set(slug, task);
  task.catch(() => pdfCoverCache.delete(slug));
  return task;
}

function PdfCover({ book, alt, className }: { book: Pick<Book, "slug" | "title" | "cover">; alt: string; className?: string }) {
  const [preview, setPreview] = useState("");
  useEffect(() => {
    if (book.cover) return;
    let active = true;
    loadFirstPageCover(book.slug).then((src) => { if (active) setPreview(src); }).catch(() => undefined);
    return () => { active = false; };
  }, [book.slug, book.cover]);
  const placeholder = "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="600" height="800" viewBox="0 0 600 800"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#e6edf5"/><stop offset="1" stop-color="#b7c5d6"/></linearGradient></defs><rect width="600" height="800" fill="url(#g)"/><rect x="18" y="18" width="564" height="764" rx="8" fill="none" stroke="#fff" stroke-opacity=".65" stroke-width="2"/><text x="48" y="650" font-family="Georgia,serif" font-size="32" fill="#24364d">' + book.title.replace(/[&<>"]/g, "") + '</text><text x="48" y="704" font-family="Arial,sans-serif" font-size="18" fill="#52647b">MEMUAT SAMPUL PDF…</text></svg>'
  );
  return <img className={className} src={book.cover || preview || placeholder} alt={alt} loading="lazy" />;
}

function useLibraryBooks() {
  const [items, setItems] = useState<Book[]>(books);
  useEffect(() => {
    let active = true;
    fetch("/api/books").then((response) => response.ok ? response.json() : Promise.reject())
      .then((data) => {
        if (!active || !Array.isArray(data.books)) return;
        const mapped: Book[] = data.books.map((item: any) => ({
          id: item.id, slug: item.slug, title: item.title, subtitle: item.subtitle || "",
          author: item.author || "Feri Setiadi", category: item.category || "Umum",
          year: Number(item.year) || new Date().getFullYear(), description: item.description || "",
          cover: item.cover || "", pages: Number(item.pages) || 0, status: item.status,
          featured: !!item.featured, samplePages: []
        }));
        setItems(mapped);
      }).catch(() => undefined);
    return () => { active = false; };
  }, []);
  return items;
}
function publishedBooks(items: Book[] = books) {
  return items.filter((book) => book.status === "published");
}

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <header className="site-header">
      <div className="header-inner">
        <Link to="/" className="brand" aria-label="Feri Setiadi Digital Library">
          <span className="brand-mark">FS<span>.</span></span>
          <span className="brand-copy"><strong>FERI SETIADI</strong><small>DIGITAL LIBRARY</small></span>
        </Link>
        <button className="mobile-menu" onClick={() => setMenuOpen(!menuOpen)} aria-label="Buka navigasi">
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
        <nav className={menuOpen ? "nav nav-open" : "nav"}>
          <Link to="/">Beranda</Link>
          <Link to="/katalog">Katalog</Link>
          <a href="https://ferisetiadi.my.id" target="_blank" rel="noreferrer">Profil Feri <ArrowRight size={14} /></a>
          <Link to="/admin" className="admin-link"><ShieldCheck size={15} /> Admin</Link>
        </nav>
      </div>
    </header>
  );
}

function Footer() {
  return <footer className="site-footer"><div className="footer-inner">
    <div className="brand footer-brand"><span className="brand-mark">FS<span>.</span></span><span className="brand-copy"><strong>FERI SETIADI</strong><small>DIGITAL LIBRARY</small></span></div>
    <p>Gagasan, pengetahuan, dan karya untuk kehidupan sosial yang lebih baik.</p>
    <span>© {new Date().getFullYear()} Feri Setiadi</span>
  </div></footer>;
}

function BookCard({ book, featured = false }: { book: Book; featured?: boolean }) {
  return <article className={featured ? "book-card book-card-featured" : "book-card"}>
    <Link to={`/buku/${book.slug}`} className="book-art" aria-label={`Baca ${book.title}`}>
      <PdfCover book={book} alt={`Sampul ${book.title}`} />
      <span className="book-cover-overlay" />
      <span className="book-open"><BookOpen size={16} /> Baca buku</span>
      <span className="book-spine" />
    </Link>
    <div className="book-card-meta"><span>{book.category}</span><span>{book.year}</span></div>
    <h3><Link to={`/buku/${book.slug}`}>{book.title}</Link></h3>
    <p className="book-subtitle">{book.subtitle}</p>
    <p className="book-author">Oleh {book.author}</p>
  </article>;
}

function Home() {
  const libraryBooks = useLibraryBooks();
  const publicBooks = publishedBooks(libraryBooks);
  const featured = publicBooks.find((book) => book.featured) ?? publicBooks[0] ?? books[0];
  return <>
    <section className="hero">
      <div className="hero-glow hero-glow-one" /><div className="hero-glow hero-glow-two" />
      <div className="hero-grid">
        <div className="hero-copy">
          <div className="eyebrow"><span className="eyebrow-dot" /> RUANG GAGASAN & PUBLIKASI</div>
          <h1>Pengetahuan untuk<br /><em>perubahan sosial.</em></h1>
          <p>Temukan buku, gagasan, dan publikasi Feri Setiadi tentang pekerjaan sosial, pembangunan masyarakat, dan inovasi sosial.</p>
          <div className="hero-actions"><Link className="button button-light" to="/katalog">Jelajahi katalog <ArrowRight size={17} /></Link><a className="button button-ghost" href="https://ferisetiadi.my.id" target="_blank" rel="noreferrer">Tentang penulis</a></div>
          <div className="hero-proof"><div className="proof-avatars"><span>FS</span><span>WS</span><span>PM</span></div><span>Karya dan pemikiran untuk publik</span></div>
        </div>
        <div className="hero-feature">
          <div className="feature-label"><Sparkles size={14} /> PUBLIKASI PILIHAN</div>
          <div className="feature-book-frame"><PdfCover book={featured} alt={featured.title} /><div className="feature-book-shade" /><div className="feature-book-title"><span>{featured?.category}</span><h2>{featured?.title}</h2><p>{featured?.subtitle}</p><small>FERI SETIADI</small></div><div className="feature-float"><BookOpen size={18} /><span><strong>Flipbook interaktif</strong><small>Baca langsung di browser</small></span></div></div>
        </div>
      </div>
      <div className="hero-bottomline"><span>PEKERJAAN SOSIAL</span><span className="line" /><span>RISET & PEMIKIRAN</span><span className="line" /><span>INOVASI SOSIAL</span></div>
    </section>
    <section className="section section-books">
      <div className="section-heading"><div><div className="eyebrow eyebrow-dark">DARI PERPUSTAKAAN</div><h2>Jelajahi publikasi.</h2><p>Koleksi bacaan tentang masyarakat, ruang hidup, dan perubahan.</p></div><Link className="text-link" to="/katalog">Lihat semua buku <ArrowRight size={16} /></Link></div>
      <div className="books-grid">{publicBooks.map((book) => <BookCard key={book.id} book={book} />)}</div>
    </section>
    <section className="manifesto"><div className="manifesto-symbol">“</div><p>Gagasan menjadi berarti ketika ia memperluas cara kita memahami manusia dan masyarakat.</p><span>FERI SETIADI · SOCIAL PRACTITIONER & RESEARCHER</span></section>
    <section className="newsletter-strip"><div><span className="eyebrow">IKUTI PERJALANAN GAGASAN</span><h2>Satu ruang untuk membaca lebih jauh.</h2></div><Link to="/katalog" className="button button-light">Buka perpustakaan <ArrowRight size={16} /></Link></section>
  </>;
}

function Catalog() {
  const libraryBooks = useLibraryBooks();
  const publicBooks = publishedBooks(libraryBooks);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Semua kategori");
  const [layout, setLayout] = useState<"grid" | "list">("grid");
  const categories = ["Semua kategori", ...new Set(publicBooks.map((book) => book.category))];
  const visible = publicBooks.filter((book) => {
    const q = search.toLowerCase();
    return (category === "Semua kategori" || book.category === category) &&
      [book.title, book.subtitle, book.author, book.description].some((value) => value.toLowerCase().includes(q));
  });
  return <main className="page-shell">
    <div className="catalog-intro"><div className="eyebrow eyebrow-dark">PERPUSTAKAAN PUBLIK</div><h1>Katalog <em>publikasi.</em></h1><p>Jelajahi kumpulan buku dan gagasan Feri Setiadi. Pilih karya untuk membaca langsung di browser.</p></div>
    <div className="catalog-tools"><label className="searchbox"><Search size={18} /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari judul, topik, atau penulis..." /></label><label className="category-select"><ListFilter size={16} /><select value={category} onChange={(e) => setCategory(e.target.value)}>{categories.map((item) => <option key={item}>{item}</option>)}</select><ChevronDown size={14} /></label><div className="layout-toggle"><button aria-label="Tampilan grid" className={layout === "grid" ? "active" : ""} onClick={() => setLayout("grid")}><Grid2X2 size={17} /></button><button aria-label="Tampilan daftar" className={layout === "list" ? "active" : ""} onClick={() => setLayout("list")}><LibraryBig size={17} /></button></div></div>
    <div className="catalog-count"><span>{visible.length} publikasi</span><span>Terbuka untuk semua pembaca</span></div>
    <div className={layout === "grid" ? "books-grid catalog-grid" : "books-grid catalog-grid list-layout"}>{visible.map((book) => <BookCard key={book.id} book={book} />)}</div>
    {visible.length === 0 && <div className="empty-state"><Search size={28} /><h3>Tidak ada publikasi yang cocok</h3><p>Coba kata pencarian atau kategori lain.</p></div>}
  </main>;
}

function BookDetails() {
  const { slug } = useParams();
  const libraryBooks = useLibraryBooks();
  const book = publishedBooks(libraryBooks).find((item) => item.slug === slug);
  const navigate = useNavigate();
  if (!book) return <main className="page-shell not-found"><h1>Buku tidak ditemukan.</h1><Link className="button button-dark" to="/katalog">Kembali ke katalog</Link></main>;
  return <main className="page-shell book-detail-page">
    <button className="back-link" onClick={() => navigate(-1)}><ArrowLeft size={16} /> Kembali</button>
    <div className="detail-layout"><div className="detail-cover"><PdfCover book={book} alt={book.title} /><span className="detail-cover-shade" /><div className="detail-cover-caption"><span>{book.category}</span><h2>{book.title}</h2><p>{book.subtitle}</p><small>FERI SETIADI</small></div></div>
      <div className="detail-copy"><div className="eyebrow eyebrow-dark">PUBLIKASI · {book.year}</div><h1>{book.title}</h1><p className="detail-subtitle">{book.subtitle}</p><div className="detail-author"><span className="author-avatar">FS</span><span><strong>{book.author}</strong><small>Penulis dan peneliti</small></span></div><p className="detail-description">{book.description}</p><div className="detail-stats"><div><span>Kategori</span><strong>{book.category}</strong></div><div><span>Halaman</span><strong>{book.pages || "Pratinjau"}</strong></div><div><span>Bahasa</span><strong>Indonesia</strong></div></div><Link to={`/baca/${book.slug}`} className="button button-dark detail-read"><BookOpen size={18} /> Baca flipbook <ArrowRight size={17} /></Link><p className="public-note"><Check size={14} /> Dapat dibaca publik tanpa akun.</p></div></div>
  </main>;
}

function Reader() {
  const { slug } = useParams();
  const libraryBooks = useLibraryBooks();
  const book = publishedBooks(libraryBooks).find((item) => item.slug === slug);
  if (!book) return <main className="page-shell not-found"><h1>Buku tidak ditemukan.</h1><Link className="button button-dark" to="/katalog">Kembali</Link></main>;
  return <PdfFlipbook slug={book.slug} title={book.title} />;
}

function NotFound() {
  return <main className="page-shell not-found"><h1>Halaman tidak ditemukan.</h1><Link to="/" className="button button-dark">Ke beranda</Link></main>;
}

export default function App() {
  return <><Header /><Routes><Route path="/" element={<><Home /><Footer /></>} /><Route path="/katalog" element={<><Catalog /><Footer /></>} /><Route path="/buku/:slug" element={<><BookDetails /><Footer /></>} /><Route path="/baca/:slug" element={<Reader />} /><Route path="/admin" element={<Admin />} /><Route path="*" element={<><NotFound /><Footer /></>} /></Routes></>;
}