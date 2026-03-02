import { Link } from "react-router-dom";

const Footer = () => (
  <footer className="border-t border-border/50 bg-background">
    <div className="container mx-auto px-4 py-12">
      <div className="grid gap-8 md:grid-cols-4">
        <div>
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <span className="font-display text-sm font-bold text-primary-foreground">N</span>
            </div>
            <span className="font-display text-lg font-bold text-foreground">
              Nobel<span className="text-primary">Hub</span>
            </span>
          </Link>
          <p className="mt-3 text-sm text-muted-foreground">
            The world's leading platform for Nobel Prize research and knowledge discovery.
          </p>
        </div>
        <div>
          <h4 className="font-display text-sm font-semibold text-foreground">Explore</h4>
          <div className="mt-3 flex flex-col gap-2">
            <Link to="/laureates" className="text-sm text-muted-foreground hover:text-primary transition-colors">Laureates</Link>
            <Link to="/lectures" className="text-sm text-muted-foreground hover:text-primary transition-colors">Lectures</Link>
            <Link to="/research" className="text-sm text-muted-foreground hover:text-primary transition-colors">Research Papers</Link>
            <Link to="/analytics" className="text-sm text-muted-foreground hover:text-primary transition-colors">Analytics</Link>
          </div>
        </div>
        <div>
          <h4 className="font-display text-sm font-semibold text-foreground">Categories</h4>
          <div className="mt-3 flex flex-col gap-2">
            {['Physics', 'Chemistry', 'Medicine', 'Literature', 'Peace', 'Economics'].map(c => (
              <span key={c} className="text-sm text-muted-foreground">{c}</span>
            ))}
          </div>
        </div>
        <div>
          <h4 className="font-display text-sm font-semibold text-foreground">Platform</h4>
          <div className="mt-3 flex flex-col gap-2">
            <span className="text-sm text-muted-foreground">About</span>
            <span className="text-sm text-muted-foreground">API</span>
            <span className="text-sm text-muted-foreground">Privacy</span>
            <span className="text-sm text-muted-foreground">Terms</span>
          </div>
        </div>
      </div>
      <div className="mt-10 border-t border-border/50 pt-6 text-center">
        <p className="text-xs text-muted-foreground">
          © 2026 NobelHub. Celebrating 125+ years of Nobel Prize excellence.
        </p>
      </div>
    </div>
  </footer>
);

export default Footer;
