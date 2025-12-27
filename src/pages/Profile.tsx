import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Helmet } from 'react-helmet-async';

const Profile = () => {
  const { user, updateUser } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    updateUser(formData);
    toast.success('Profil berhasil diperbarui!');
    setIsLoading(false);
  };

  return (
    <>
      <Helmet>
        <title>Edit Profil - Thrift Haven</title>
      </Helmet>
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-8 max-w-xl">
          <h1 className="font-display text-3xl font-bold mb-8 animate-fade-in">Edit Profil</h1>
          <form onSubmit={handleSubmit} className="glass-card rounded-xl p-6 space-y-6 animate-fade-in">
            <div className="space-y-2">
              <Label>Nama Lengkap</Label>
              <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label>No. Telepon</Label>
              <Input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label>Alamat</Label>
              <Input value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} required />
            </div>
            <Button type="submit" disabled={isLoading} className="w-full h-12">
              {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Simpan Perubahan
            </Button>
          </form>
        </main>
      </div>
    </>
  );
};

export default Profile;
