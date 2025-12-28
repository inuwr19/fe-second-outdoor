import { Facebook, Instagram, Mail, MapPin, Phone, Twitter } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="bg-muted/30 border-t border-border/50 pt-16 pb-8">
      <div className="container mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <span className="font-display text-2xl font-bold text-primary">Thrift</span>
              <span className="font-display text-2xl font-light text-foreground">Haven</span>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed mb-6">
              Platform belanja outdoor & thrift dengan koleksi terkurasi. Temukan gaya unik Anda dengan fashion berkelanjutan.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-background border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary transition-colors">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-background border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary transition-colors">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-background border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary transition-colors">
                <Twitter className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-display text-lg font-semibold mb-6">Menu</h3>
            <ul className="space-y-4 text-sm text-muted-foreground">
              <li>
                <Link to="/" className="hover:text-primary transition-colors">Beranda</Link>
              </li>
              <li>
                <Link to="/products" className="hover:text-primary transition-colors">Koleksi Terbaru</Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-primary transition-colors">Tentang Kami</Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-primary transition-colors">Kontak</Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="font-display text-lg font-semibold mb-6">Kategori</h3>
            <ul className="space-y-4 text-sm text-muted-foreground">
              <li>
                <Link to="/products?category=Jaket" className="hover:text-primary transition-colors">Jaket Outdoor</Link>
              </li>
              <li>
                <Link to="/products?category=Sepatu" className="hover:text-primary transition-colors">Sepatu Hiking</Link>
              </li>
              <li>
                <Link to="/products?category=Tas" className="hover:text-primary transition-colors">Tas Carrier</Link>
              </li>
              <li>
                <Link to="/products?category=Aksesoris" className="hover:text-primary transition-colors">Aksesoris</Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-display text-lg font-semibold mb-6">Hubungi Kami</h3>
            <ul className="space-y-4 text-sm text-muted-foreground">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <span>Jl. Malioboro No. 123,<br />Yogyakarta, Indonesia</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-primary shrink-0" />
                <span>+62 812 3456 7890</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-primary shrink-0" />
                <span>hello@thrifthaven.id</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border/50 pt-8 text-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Second Outdoor. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};
