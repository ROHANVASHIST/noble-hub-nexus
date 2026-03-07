import { Link, useLocation, useNavigate } from "react-router-dom";
import { Search, Menu, X, LogOut, User, Sparkles, Award } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/App";

const NAV_LINKS = [
  { to: "/", label: "Home" },
  { to: "/laureates", label: "Library" },
  { to: "/lectures", label: "Lectures" },
  { to: "/research", label: "Research" },
  { to: "/mentorship", label: "Mentorship" },
  { to: "/scientific-skills", label: "Lab" },
  { to: "/analytics", label: "Analytics" },
];

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { session } = useAuth();
  const { scrollY } = useScroll();

  const navBg = useTransform(
    scrollY,
    [0, 50],
    ["rgba(10, 11, 14, 0)", "rgba(10, 11, 14, 0.8)"]
  );
  const navBorder = useTransform(
    scrollY,
    [0, 50],
    ["rgba(255, 255, 255, 0)", "rgba(255, 255, 255, 0.1)"]
  );
  const navPadding = useTransform(scrollY, [0, 50], ["1.5rem", "1rem"]);
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <motion.nav
      style={{
        backgroundColor: navBg,
        borderBottomColor: navBorder,
        paddingTop: navPadding,
        paddingBottom: navPadding,
      }}
      className="fixed top-0 left-0 right-0 z-50 border-b backdrop-blur-xl transition-all duration-300"
    >
      <div className="container mx-auto flex items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-3 group px-4 py-2 rounded-2xl transition-all hover:bg-white/5">
          <motion.div
            whileHover={{ rotate: 15, scale: 1.1 }}
            className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-amber-600 shadow-lg shadow-primary/20"
          >
            <Award className="h-7 w-7 text-primary-foreground" />
          </motion.div>
          <div className="flex flex-col">
            <span className="font-display text-2xl font-black tracking-tight text-foreground transition-colors group-hover:text-primary leading-none">
              NOBEL<span className="text-primary group-hover:text-foreground">HUB</span>
            </span>
            <div className="flex items-center gap-1 mt-0.5">
              <Sparkles className="h-2.5 w-2.5 text-amber-500 animate-pulse" />
              <span className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground/80">Scientific Archive v2.5</span>
            </div>
          </div>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link, i) => (
            <motion.div
              key={link.to}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.05 }}
            >
              <Link
                to={link.to}
                className={`relative rounded-full px-4 py-2 text-xs font-bold uppercase tracking-widest transition-all duration-300 ${location.pathname === link.to
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                  }`}
              >
                {link.label}
                {location.pathname === link.to && (
                  <motion.div
                    layoutId="nav-bg"
                    className="absolute inset-0 z-[-1] rounded-full bg-primary/10 border border-primary/20 shadow-[0_0_15px_-3px_rgba(234,179,8,0.2)]"
                  />
                )}
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 }}>
            <Link
              to="/search"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/5 bg-white/5 text-muted-foreground transition-all hover:bg-primary/10 hover:text-primary hover:border-primary/20"
            >
              <Search className="h-4 w-4" />
            </Link>
          </motion.div>

          <div className="hidden border-l border-white/10 h-6 mx-2 md:block" />

          {session ? (
            <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }} className="flex items-center gap-3">
              <Link to="/profile" className="hidden items-center gap-3 md:flex group">
                <div className="relative">
                  <div className="h-9 w-9 overflow-hidden rounded-full border-2 border-primary/20 bg-secondary transition-all group-hover:border-primary">
                    <User className="h-full w-full p-2 text-muted-foreground group-hover:text-primary" />
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-background bg-emerald-500" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-foreground group-hover:text-primary transition-colors">
                  {session.user.user_metadata?.display_name || session.user.email?.split("@")[0]}
                </span>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all h-10 rounded-xl"
              >
                <LogOut className="h-4 w-4 md:mr-2" />
                <span className="hidden md:inline font-bold uppercase text-[10px] tracking-widest">Sign Out</span>
              </Button>
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
              <Link
                to="/auth"
                className="inline-flex h-10 items-center justify-center rounded-xl bg-primary px-6 text-xs font-black uppercase tracking-widest text-primary-foreground transition-all hover:translate-y-[-2px] hover:shadow-lg hover:shadow-primary/20"
              >
                Access Hub
              </Link>
            </motion.div>
          )}

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-muted-foreground md:hidden"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-white/10 bg-background/95 backdrop-blur-2xl md:hidden"
          >
            <div className="flex flex-col gap-2 p-6">
              {NAV_LINKS.map((link, i) => (
                <motion.div
                  key={link.to}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setMobileOpen(false)}
                    className={`rounded-xl px-4 py-3 text-xs font-bold uppercase tracking-widest transition-all ${location.pathname === link.to
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                      }`}
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
              {!session && (
                <Link
                  to="/auth"
                  onClick={() => setMobileOpen(false)}
                  className="mt-4 rounded-xl bg-primary px-4 py-3 text-center text-xs font-black uppercase tracking-widest text-primary-foreground"
                >
                  Sign In
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;

