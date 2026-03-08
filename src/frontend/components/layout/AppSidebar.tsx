import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Home, BookOpen, Compass, Network, FlaskConical, GraduationCap,
  BarChart3, HelpCircle, TrendingUp, Search, User, LogOut,
  Award, Sparkles, Brain, Trophy,
  Video, Info, Shield, Scale
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/App";
import { NavLink } from "@/frontend/components/NavLink";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar";

const MAIN_NAV = [
  { to: "/", label: "Home", icon: Home },
  { to: "/laureates", label: "Library", icon: BookOpen },
  { to: "/discovery", label: "Discovery", icon: Compass },
  { to: "/connections", label: "Connections", icon: Network },
  { to: "/search", label: "Search", icon: Search },
];

const RESEARCH_NAV = [
  { to: "/research", label: "Research", icon: FlaskConical },
  { to: "/lectures", label: "Lectures", icon: Video },
  { to: "/mentorship", label: "Mentorship", icon: GraduationCap },
  { to: "/scholar-dashboard", label: "Scholar Dashboard", icon: Brain },
  { to: "/scientific-skills", label: "Scientific Skills", icon: Trophy },
];

const ENGAGE_NAV = [
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/quiz", label: "Quiz", icon: HelpCircle },
  { to: "/predictions", label: "Predictions", icon: TrendingUp },
];

const INFO_NAV = [
  { to: "/about", label: "About", icon: Info },
  { to: "/privacy", label: "Privacy", icon: Shield },
  { to: "/terms", label: "Terms", icon: Scale },
];

const AppSidebar = () => {
  const { session, isReady } = useAuth();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const renderGroup = (label: string, items: typeof MAIN_NAV) => (
    <SidebarGroup>
      <SidebarGroupLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">
        {label}
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.to}>
              <SidebarMenuButton asChild isActive={location.pathname === item.to}>
                <NavLink
                  to={item.to}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-all hover:bg-accent hover:text-foreground"
                  activeClassName="bg-primary/10 text-primary border border-primary/20 shadow-[0_0_12px_-3px_hsl(var(--primary)/0.2)]"
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  {!collapsed && <span>{item.label}</span>}
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );

  return (
    <Sidebar collapsible="icon" className="border-r border-border/50">
      <SidebarHeader className="p-4">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-amber-600 shadow-lg shadow-primary/20">
            <Award className="h-6 w-6 text-primary-foreground" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-display text-xl font-black tracking-tight text-foreground leading-none">
                NOBEL<span className="text-primary">HUB</span>
              </span>
              <div className="flex items-center gap-1 mt-0.5">
                <Sparkles className="h-2.5 w-2.5 text-amber-500 animate-pulse" />
                <span className="text-[8px] font-black uppercase tracking-[0.25em] text-muted-foreground/70">
                  Scientific Archive v2.5
                </span>
              </div>
            </div>
          )}
        </Link>
      </SidebarHeader>

      <SidebarSeparator />

      <SidebarContent className="px-2">
        {renderGroup("Navigate", MAIN_NAV)}
        <SidebarSeparator />
        {renderGroup("Research & Learn", RESEARCH_NAV)}
        <SidebarSeparator />
        {renderGroup("Engage", ENGAGE_NAV)}
        <SidebarSeparator />
        {renderGroup("Information", INFO_NAV)}
      </SidebarContent>

      <SidebarSeparator />

      <SidebarFooter className="p-3">
        {!isReady ? (
          <div className="flex items-center gap-3 px-3 py-2.5">
            <div className="h-7 w-7 rounded-full bg-muted animate-pulse shrink-0" />
            {!collapsed && <div className="h-4 w-24 rounded bg-muted animate-pulse" />}
          </div>
        ) : session ? (
          <div className="flex flex-col gap-2">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={location.pathname === "/profile"}>
                  <NavLink
                    to="/profile"
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-all hover:bg-accent hover:text-foreground"
                    activeClassName="bg-primary/10 text-primary"
                  >
                    <div className="relative shrink-0">
                      <div className="h-7 w-7 overflow-hidden rounded-full border-2 border-primary/20 bg-secondary">
                        <User className="h-full w-full p-1.5 text-muted-foreground" />
                      </div>
                      <div className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-sidebar bg-emerald-500" />
                    </div>
                    {!collapsed && (
                      <span className="truncate text-xs font-bold">
                        {session.user.user_metadata?.display_name || session.user.email?.split("@")[0]}
                      </span>
                    )}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={handleSignOut}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-all hover:bg-destructive/10 hover:text-destructive"
                >
                  <LogOut className="h-4 w-4 shrink-0" />
                  {!collapsed && <span>Sign Out</span>}
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </div>
        ) : (
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link
                  to="/auth"
                  className="flex items-center gap-3 rounded-xl bg-primary px-3 py-2.5 text-sm font-bold text-primary-foreground transition-all hover:bg-primary/90"
                >
                  <Award className="h-4 w-4 shrink-0" />
                  {!collapsed && <span>Access Hub</span>}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        )}
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
