import { useMemo, useState } from "react";
import { Link, Route, Routes, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft, ArrowRight, BookOpen, Bookmark, Check, ChevronDown,
  ChevronLeft, ChevronRight, Grid2X2, LibraryBig, ListFilter, Maximize2,
  Menu, Search, Share2, ShieldCheck, Sparkles, X, ZoomIn, ZoomOut
} from "lucide-react";
import { books, type Book } from "./data/books";

function publishedBooks() {
  return books.filter((book) => book.status === "published");
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
      <img src={book.cover} alt={`Sampul ${book.title}`} loading="lazy" />
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
  const featured = publishedBooks().find((book) => book.featured) ?? publishedBooks()[0];
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
          <div className="feature-book-frame"><img src={featured?.cover} alt={featured?.title} /><div className="feature-book-shade" /><div className="feature-book-title"><span>{featured?.category}</span><h2>{featured?.title}</h2><p>{featured?.subtitle}</p><small>FERI SETIADI</small></div><div className="feature-float"><BookOpen size={18} /><span><strong>Flipbook interaktif</strong><small>Baca langsung di browser</small></span></div></div>
        </div>
      </div>
      <div className="hero-bottomline"><span>PEKERJAAN SOSIAL</span><span className="line" /><span>RISET & PEMIKIRAN</span><span className="line" /><span>INOVASI SOSIAL</span></div>
    </section>
    <section className="section section-books">
      <div className="section-heading"><div><div className="eyebrow eyebrow-dark">DARI PERPUSTAKAAN</div><h2>Jelajahi publikasi.</h2><p>Koleksi bacaan tentang masyarakat, ruang hidup, dan perubahan.</p></div><Link className="text-link" to="/katalog">Lihat semua buku <ArrowRight size={16} /></Link></div>
      <div className="books-grid">{publishedBooks().map((book) => <BookCard key={book.id} book={book} />)}</div>
    </section>
    <section className="manifesto"><div className="manifesto-symbol">“</div><p>Gagasan menjadi berarti ketika ia memperluas cara kita memahami manusia dan masyarakat.</p><span>FERI SETIADI · SOCIAL PRACTITIONER & RESEARCHER</span></section>
    <section className="newsletter-strip"><div><span className="eyebrow">IKUTI PERJALANAN GAGASAN</span><h2>Satu ruang untuk membaca lebih jauh.</h2></div><Link to="/katalog" className="button button-light">Buka perpustakaan <ArrowRight size={16} /></Link></section>
  </>;
}

function Catalog() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Semua kategori");
  const [layout, setLayout] = useState<"grid" | "list">("grid");
  const categories = ["Semua kategori", ...new Set(publishedBooks().map((book) => book.category))];
  const visible = publishedBooks().filter((book) => {
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
  const book = publishedBooks().find((item) => item.slug === slug);
  const navigate = useNavigate();
  if (!book) return <main className="page-shell not-found"><h1>Buku tidak ditemukan.</h1><Link className="button button-dark" to="/katalog">Kembali ke katalog</Link></main>;
  return <main className="page-shell book-detail-page">
    <button className="back-link" onClick={() => navigate(-1)}><ArrowLeft size={16} /> Kembali</button>
    <div className="detail-layout"><div className="detail-cover"><img src={book.cover} alt={book.title} /><span className="detail-cover-shade" /><div className="detail-cover-caption"><span>{book.category}</span><h2>{book.title}</h2><p>{book.subtitle}</p><small>FERI SETIADI</small></div></div>
      <div className="detail-copy"><div className="eyebrow eyebrow-dark">PUBLIKASI · {book.year}</div><h1>{book.title}</h1><p className="detail-subtitle">{book.subtitle}</p><div className="detail-author"><span className="author-avatar">FS</span><span><strong>{book.author}</strong><small>Penulis dan peneliti</small></span></div><p className="detail-description">{book.description}</p><div className="detail-stats"><div><span>Kategori</span><strong>{book.category}</strong></div><div><span>Halaman</span><strong>{book.pages || "Pratinjau"}</strong></div><div><span>Bahasa</span><strong>Indonesia</strong></div></div><Link to={`/baca/${book.slug}`} className="button button-dark detail-read"><BookOpen size={18} /> Baca flipbook <ArrowRight size={17} /></Link><p className="public-note"><Check size={14} /> Dapat dibaca publik tanpa akun.</p></div></div>
  </main>;
}

function Reader() {
  const { slug } = useParams();
  const book = publishedBooks().find((item) => item.slug === slug);
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [showThumbs, setShowThumbs] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [fullscreen, setFullscreen] = useState(false);
  const [contentsOpen, setContentsOpen] = useState(false);
  const pages = useMemo(() => {
    if (!book) return [];
    const filler = Array.from({ length: 11 }, (_, i) => `CATATAN PEMBACA\n\nBagian ${i + 2}\n\nGagasan mengenai manusia dan masyarakat perlu dibaca bersama konteks kehidupan sehari-hari. Pekerjaan sosial menghubungkan pengalaman individu dengan struktur sosial, komunitas, dan kebijakan yang membentuk kehidupan bersama.\n\nFeri Setiadi`);
    return [...book.samplePages, ...filler].slice(0, Math.max(book.samplePages.length, 12));
  }, [book]);
  if (!book) return <main className="page-shell not-found"><h1>Buku tidak ditemukan.</h1><Link className="button button-dark" to="/katalog">Kembali</Link></main>;
  const prev = () => setPage((current) => Math.max(0, current - 1));
  const next = () => setPage((current) => Math.min(pages.length - 1, current + 1));
  const flip = (direction: "prev" | "next") => { if (direction === "prev") prev(); else next(); };
  const enterFullscreen = async () => {
    const element = document.querySelector(".reader-shell");
    if (!document.fullscreenElement && element instanceof HTMLElement) { await element.requestFullscreen?.(); setFullscreen(true); }
    else { await document.exitFullscreen?.(); setFullscreen(false); }
  };
  const share = async () => {
    const url = window.location.href;
    if (navigator.share) await navigator.share({ title: book.title, url });
    else if (navigator.clipboard) await navigator.clipboard.writeText(url);
  };
  return <main className={fullscreen ? "reader-shell reader-fullscreen" : "reader-shell"}>
    <div className="reader-topbar"><button onClick={() => navigate(`/buku/${book.slug}`)} className="reader-back"><ArrowLeft size={17} /><span>Kembali ke buku</span></button><div className="reader-bookname"><BookOpen size={17} /><span>{book.title}</span></div><button className="reader-share" onClick={() => void share()}><Share2 size={16} /><span>Bagikan</span></button></div>
    <div className="reader-workspace">
      <aside className="reader-rail"><button title="Thumbnail halaman" className={showThumbs ? "rail-active" : ""} onClick={() => setShowThumbs(!showThumbs)}><Grid2X2 size={19} /></button><button title="Daftar isi" className={contentsOpen ? "rail-active" : ""} onClick={() => setContentsOpen(!contentsOpen)}><ListFilter size={19} /></button><div className="rail-spacer" /><button title="Perkecil" onClick={() => setZoom((z) => Math.max(.7, +(z - .1).toFixed(1)))}><ZoomOut size={18} /></button><span className="zoom-value">{Math.round(zoom * 100)}%</span><button title="Perbesar" onClick={() => setZoom((z) => Math.min(1.4, +(z + .1).toFixed(1)))}><ZoomIn size={18} /></button></aside>
      {showThumbs && <aside className="thumbnail-panel"><div className="panel-heading">Halaman <button onClick={() => setShowThumbs(false)}><X size={16} /></button></div>{pages.map((content, i) => <button key={i} className={page === i ? "thumb active-thumb" : "thumb"} onClick={() => { setPage(i); setShowThumbs(false); }}><span>{i + 1}</span><small>{content.split("\n")[0]}</small></button>)}</aside>}
      {contentsOpen && <aside className="thumbnail-panel contents-panel"><div className="panel-heading">Daftar isi <button onClick={() => setContentsOpen(false)}><X size={16} /></button></div>{pages.map((content, i) => <button key={i} className="contents-item" onClick={() => { setPage(i); setContentsOpen(false); }}><span>{String(i + 1).padStart(2, "0")}</span>{content.split("\n")[0]}</button>)}</aside>}
      <div className="book-stage"><div className="stage-glow" /><button className="page-arrow arrow-left" disabled={page === 0} onClick={() => flip("prev")} aria-label="Halaman sebelumnya"><ChevronLeft size={28} /></button>
        <div className="paper-book" style={{ transform: `scale(${zoom})` }}><article className="paper-page paper-left"><div className="paper-inner"><span className="paper-kicker">{book.category}</span><h3>{page === 0 ? book.title : `Catatan pembacaan`}</h3><div className="paper-rule" /><p className="paper-text">{pages[page] ?? pages[0]}</p><span className="paper-footer">FERI SETIADI <i /> {page + 1}</span></div></article><article className="paper-page paper-right"><div className="paper-inner"><span className="paper-kicker">{book.subtitle}</span><h3>{pages[(page + 1) % pages.length]?.split("\n")[0]}</h3><div className="paper-rule" /><p className="paper-text">{pages[(page + 1) % pages.length]}</p><span className="paper-footer">{book.title.toUpperCase()} <i /> {Math.min(page + 2, pages.length)}</span></div></article></div>
        <button className="page-arrow arrow-right" disabled={page >= pages.length - 1} onClick={() => flip("next")} aria-label="Halaman berikutnya"><ChevronRight size={28} /></button></div>
    </div>
    <div className="reader-bottombar"><div className="reader-bottom-left"><button onClick={() => setShowThumbs(!showThumbs)}><Grid2X2 size={16} /> <span>Halaman</span></button><button onClick={() => setContentsOpen(!contentsOpen)}><Bookmark size={16} /><span>Daftar isi</span></button></div><div className="page-controls"><button disabled={page === 0} onClick={prev}><ChevronLeft size={17} /></button><span><strong>{page + 1}</strong> / {pages.length}</span><button disabled={page >= pages.length - 1} onClick={next}><ChevronRight size={17} /></button></div><div className="reader-bottom-right"><button title="Layar penuh" onClick={() => void enterFullscreen()}><Maximize2 size={17} /><span>Layar penuh</span></button></div></div>
  </main>;
}

function AdminPlaceholder() {
  return <main className="page-shell admin-placeholder"><div className="admin-icon"><ShieldCheck size={30} /></div><div className="eyebrow eyebrow-dark">AREA PENGELOLA</div><h1>Studio <em>publikasi.</em></h1><p>Panel admin akan menjadi ruang pribadi untuk mengelola sampul, metadata, PDF, dan status terbit setiap buku.</p><div className="admin-warning"><ShieldCheck size={18} /><div><strong>Panel admin belum diaktifkan</strong><p>Autentikasi dan penyimpanan server harus diimplementasikan sebelum panel ini digunakan. Halaman ini belum meminta atau menyimpan kredensial.</p></div></div><Link className="button button-dark" to="/katalog">Kembali ke katalog</Link></main>;
}

function NotFound() {
  return <main className="page-shell not-found"><h1>Halaman tidak ditemukan.</h1><Link to="/" className="button button-dark">Ke beranda</Link></main>;
}

export default function App() {
  return <><Header /><Routes><Route path="/" element={<><Home /><Footer /></>} /><Route path="/katalog" element={<><Catalog /><Footer /></>} /><Route path="/buku/:slug" element={<><BookDetails /><Footer /></>} /><Route path="/baca/:slug" element={<Reader />} /><Route path="/admin" element={<><AdminPlaceholder /><Footer /></>} /><Route path="*" element={<><NotFound /><Footer /></>} /></Routes></>;
}