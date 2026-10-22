export type Book = {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  author: string;
  category: string;
  year: number;
  description: string;
  cover: string;
  pages: number;
  status: "published" | "draft";
  featured?: boolean;
  samplePages: string[];
};

export const books: Book[] = [
  {
    id: "book-001",
    slug: "dari-kota-diam-menjadi-kota-sosial",
    title: "Dari Kota Diam Menjadi Kota Sosial",
    subtitle: "Meninjau Pekerjaan Sosial Perkotaan",
    author: "Feri Setiadi",
    category: "Pekerjaan Sosial",
    year: 2026,
    description:
      "Sebuah refleksi tentang kota, kehidupan sosial, dan kemungkinan memperkuat infrastruktur sosial melalui praktik pekerjaan sosial perkotaan.",
    cover:
      "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=900&q=85",
    pages: 11,
    status: "published",
    featured: true,
    samplePages: [
      "DARI KOTA DIAM MENJADI KOTA SOSIAL\n\nMeninjau Pekerjaan Sosial Perkotaan\n\nFeri Setiadi",
      "PENGANTAR\n\nKota bukan hanya susunan bangunan, jalan, dan infrastruktur fisik. Kota juga merupakan ruang relasi, pengalaman, dan kehidupan sosial yang terus berubah.",
      "KOTA DAN KEHIDUPAN SOSIAL\n\nPengembangan kota perlu memberi perhatian pada hubungan antarwarga, akses terhadap layanan, partisipasi, dan daya dukung komunitas.",
      "PEKERJAAN SOSIAL PERKOTAAN\n\nPekerjaan sosial membantu menjembatani kebutuhan individu dengan sumber daya komunitas, lembaga, dan kebijakan publik.",
      "INFRASTRUKTUR SOSIAL\n\nRuang publik, organisasi warga, layanan sosial, serta jaringan dukungan dapat menjadi bagian penting dari kehidupan kota.",
      "MENUJU KOTA SOSIAL\n\nKota sosial dibangun melalui keterlibatan warga, kelembagaan yang responsif, dan kebijakan yang menempatkan kesejahteraan manusia sebagai tujuan.",
      "CATATAN AKHIR\n\nPerubahan menuju kota sosial membutuhkan kolaborasi lintas sektor dan komitmen untuk memahami pengalaman warga.",
    ],
  },
  {
    id: "book-002",
    slug: "urban-social-work",
    title: "Urban Social Work",
    subtitle: "Pekerjaan Sosial Perkotaan",
    author: "Feri Setiadi",
    category: "Pekerjaan Sosial",
    year: 2026,
    description:
      "Catatan mengenai urbanisasi, transformasi sosial, dan peran pekerjaan sosial dalam membangun komunitas perkotaan yang inklusif.",
    cover:
      "https://images.unsplash.com/photo-1519682337058-a94d519337bc?auto=format&fit=crop&w=900&q=85",
    pages: 0,
    status: "published",
    samplePages: [],
  },
  {
    id: "book-003",
    slug: "konversi-infrastruktur-sosial",
    title: "Konversi Infrastruktur Sosial",
    subtitle: "Kritik Teoretis dan Rekonstruksi Pekerjaan Sosial Perkotaan",
    author: "Feri Setiadi",
    category: "Kajian Teoretis",
    year: 2026,
    description:
      "Rancangan monograf yang mengeksplorasi hubungan infrastruktur sosial dengan praktik pekerjaan sosial perkotaan.",
    cover:
      "https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=900&q=85",
    pages: 0,
    status: "draft",
    samplePages: [],
  },
];