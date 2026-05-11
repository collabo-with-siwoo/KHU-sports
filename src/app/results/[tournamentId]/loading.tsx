import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function ResultsDetailLoading() {
  return (
    <main className="home-app">
      <Header currentPath="/results" />
      <section className="stitch-page-canvas results-detail-page">
        <div className="results-detail-skeleton hero" />
        <div className="results-detail-skeleton filters" />
        <div className="results-detail-skeleton table" />
      </section>
      <Footer />
    </main>
  );
}
