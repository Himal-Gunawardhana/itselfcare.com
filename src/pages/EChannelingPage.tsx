import Header from "@/components/Header";
import Footer from "@/components/Footer";
import EChanneling from "@/components/EChanneling";

export default function EChannelingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <EChanneling />
      </main>
      <Footer />
    </div>
  );
}
