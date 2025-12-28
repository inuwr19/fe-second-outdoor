import { Footer } from '@/components/Footer';
import { Navbar } from '@/components/Navbar';
import { Heart, Leaf, Sparkles, Users } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

const About = () => {
  return (
    <>
      <Helmet>
        <title>Tentang Kami - Second Outdoor</title>
        <meta name="description" content="Cerita di balik Second Outdoor dan misi kami untuk fashion berkelanjutan." />
      </Helmet>

      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />

        <main className="flex-1">
          {/* Hero Section */}
          <section className="relative py-20 lg:py-32 overflow-hidden">
            <div className="absolute inset-0 bg-primary/5 -skew-y-3 origin-top-left transform scale-110" />
            <div className="container mx-auto px-6 md:px-12 relative">
              <div className="max-w-3xl mx-auto text-center">
                <span className="inline-block px-4 py-2 rounded-full bg-secondary/10 text-secondary font-medium text-sm mb-6">
                  Cerita Kami
                </span>
                <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-6 leading-tight">
                  Mengubah Cara Anda <span className="text-primary">Melihat Fashion</span>
                </h1>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Second Outdoor lahir dari kecintaan pada alam dan fashion. Kami percaya bahwa gaya tidak harus mengorbankan planet ini.
                </p>
              </div>
            </div>
          </section>

          {/* Mission Section */}
          <section className="py-16 md:py-24">
            <div className="container mx-auto px-6 md:px-12">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20 items-center">
                <div className="relative">
                  <div className="aspect-square rounded-3xl overflow-hidden bg-muted">
                    <img
                      src="https://images.unsplash.com/photo-1523381210434-271e8be1f52b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1770&q=80"
                      alt="Sustainable Fashion"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute -bottom-6 -right-6 w-48 h-48 bg-background p-6 rounded-2xl shadow-xl hidden md:block">
                    <div className="w-full h-full border-2 border-primary/20 rounded-xl flex items-center justify-center flex-col text-center p-4">
                      <span className="text-3xl font-bold text-primary mb-1">5000+</span>
                      <span className="text-sm text-muted-foreground">Item Terjual</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h2 className="font-display text-3xl font-bold mb-6">Misi Keberlanjutan</h2>
                  <p className="text-muted-foreground mb-6 leading-relaxed">
                    Setiap tahun, jutaan ton pakaian berakhir di tempat pembuangan akhir. Di Second Outdoor, kami memberikan kesempatan kedua bagi pakaian berkualitas tinggi untuk menemukan pemilik baru.
                  </p>
                  <p className="text-muted-foreground mb-8 leading-relaxed">
                    Kami mengkurasi jaket outdoor, sepatu hiking, dan perlengkapan petualangan second-hand yang masih sangat layak pakai. Dengan berbelanja di sini, Anda tidak hanya berhemat, tetapi juga berkontribusi mengurangi limbah tekstil.
                  </p>

                  <div className="space-y-4">
                    {[
                      { icon: Leaf, text: 'Mengurangi Jejak Karbon' },
                      { icon: Heart, text: 'Mendukung Ekonomi Sirkular' },
                      { icon: Sparkles, text: 'Produk Berkualitas Premium' }
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-muted/30 border border-border/50">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <item.icon className="w-5 h-5 text-primary" />
                        </div>
                        <span className="font-medium">{item.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Team/Values Section */}
          <section className="py-16 md:py-24 bg-muted/30">
            <div className="container mx-auto px-6 md:px-12">
              <div className="text-center max-w-2xl mx-auto mb-16">
                <h2 className="font-display text-3xl font-bold mb-4">Nilai Kami</h2>
                <p className="text-muted-foreground">
                  Prinsip yang membimbing setiap langkah kami dalam melayani Anda dan lingkungan.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  {
                    icon: Users,
                    title: "Komunitas",
                    desc: "Membangun komunitas pecinta alam yang peduli pada lingkungan."
                  },
                  {
                    icon: Heart,
                    title: "Keaslian",
                    desc: "Jujur dalam kondisi produk dan transparan dalam setiap transaksi."
                  },
                  {
                    icon: Leaf,
                    title: "Tanggung Jawab",
                    desc: "Berkomitmen penuh pada praktik bisnis yang ramah lingkungan."
                  }
                ].map((val, i) => (
                  <div key={i} className="bg-background rounded-2xl p-8 shadow-sm border border-border/50 hover:shadow-lg transition-all duration-300">
                    <div className="w-14 h-14 rounded-2xl bg-secondary/10 flex items-center justify-center mb-6">
                      <val.icon className="w-7 h-7 text-secondary" />
                    </div>
                    <h3 className="font-display text-xl font-bold mb-3">{val.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {val.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default About;
