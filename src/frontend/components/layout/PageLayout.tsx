import Navbar from "./Navbar";
import Footer from "./Footer";

const PageLayout = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <main className="pt-16">{children}</main>
    <Footer />
  </div>
);

export default PageLayout;
