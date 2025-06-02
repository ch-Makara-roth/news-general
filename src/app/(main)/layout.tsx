import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-grow container py-8 animate-fade-in">
        {children}
      </main>
      <Footer />
    </div>
  );
}
