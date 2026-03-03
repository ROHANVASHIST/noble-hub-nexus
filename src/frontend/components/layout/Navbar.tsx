import { Link, useLocation, useNavigate } from "react-router-dom";
import { Search, Menu, X, LogOut, User } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

const NAV_LINKS = [
  { to: "/", label: "Home" },
  { to: "/laureates", label: "Laureates" },
  { to: "/lectures", label: "Lectures" },
  { to: "/research", label: "Research" },
  { to: "/analytics", label: "Analytics" },
];

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <span className="font-display text-sm font-bold text-primary-foreground">N</span>
          </div>
          <span className="font-display text-lg font-bold text-foreground">
            Nobel<span className="text-primary">Hub</span>
          </span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`relative rounded-lg px-3 py-2 text-sm font-medium transition-colors ${location.pathname === link.to
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
                }`}
            >
              {link.label}
              {location.pathname === link.to && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute inset-x-1 -bottom-[1.05rem] h-0.5 rounded-full bg-primary"
                />
              )}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/search"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <Search className="h-4 w-4" />
          </Link>

          <div className="hidden border-l border-border h-4 mx-2 md:block" />

          {session ? (
            <div className="flex items-center gap-3">
              <Link to="/profile" className="hidden items-center gap-2 md:flex group">
                <div className="flex bg-secondary h-8 w-8 items-center justify-center rounded-full group-hover:bg-primary/10 transition-colors">
                  <User className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
                </div>
                <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                  {session.user.user_metadata?.display_name || session.user.email?.split("@")[0]}
                </span>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="text-muted-foreground hover:text-destructive transition-colors h-8"
              >
                <LogOut className="h-4 w-4 md:mr-2" />
                <span className="hidden md:inline">Sign Out</span>
              </Button>
            </div>
          ) : (
            <Link
              to="/auth"
              className="inline-flex h-9 items-center justify-center rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90"
            >
              Sign In
            </Link>
          )}

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground md:hidden"
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-border/50 bg-background md:hidden"
          >
            <div className="flex flex-col gap-1 p-4">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${location.pathname === link.to
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground"
                    }`}
                >
                  {link.label}
                </Link>
              ))}
              {!session && (
                <Link
                  to="/auth"
                  onClick={() => setMobileOpen(false)}
                  className="mt-2 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground"
                >
                  Sign In
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
