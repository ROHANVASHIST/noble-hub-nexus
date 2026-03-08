import { Link, useLocation, useNavigate } from "react-router-dom";
import { useRef } from "react";
import {
  Home, BookOpen, Compass, Network, FlaskConical, GraduationCap, Globe,
  BarChart3, HelpCircle, TrendingUp, Search, User, LogOut,
  Award, Sparkles, Brain, Trophy, Video, Info, Shield, Scale,
  ChevronDown, ChevronsUpDown, Settings, Bell, Zap, Bot, Target,
  Timer, Layers, Bookmark, ListChecks, MessageSquare, FileText, Kanban,
  Highlighter, PieChart, Mail, CalendarCheck,
  AlarmClock, GitCompareArrows, Medal, Headphones, Clock, Cpu,
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
  SidebarMenuBadge,
  SidebarHeader,
  SidebarFooter,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";


const MAIN_NAV = [
  { to: "/", label: "Home", icon: Home, badge: null },
  { to: "/laureates", label: "Library", icon: BookOpen, badge: "971+" },
  { to: "/discovery", label: "Discovery", icon: Compass, badge: null },
  { to: "/connections", label: "Connections", icon: Network, badge: null },
  { to: "/search", label: "Search", icon: Search, badge: null },
  { to: "/knowledge-graph", label: "Knowledge Graph", icon: Network, badge: "New" },
  { to: "/time-machine", label: "Time Machine", icon: Clock, badge: "New" },
];

const RESEARCH_NAV = [
  { to: "/research", label: "Research", icon: FlaskConical, badge: null },
  { to: "/lectures", label: "Lectures", icon: Video, badge: null },
  { to: "/mentorship", label: "Mentorship", icon: GraduationCap, badge: "AI" },
  { to: "/scholar-dashboard", label: "Dashboard", icon: Brain, badge: null },
  { to: "/scientific-skills", label: "Skills", icon: Trophy, badge: null },
  { to: "/focus", label: "Focus Timer", icon: Timer, badge: null },
  { to: "/flashcards", label: "Flashcards", icon: Layers, badge: null },
  { to: "/bookmarks", label: "Bookmarks", icon: Bookmark, badge: null },
  { to: "/daily-goals", label: "Daily Goals", icon: ListChecks, badge: null },
  { to: "/study-rooms", label: "Study Rooms", icon: MessageSquare, badge: "New" },
  { to: "/planner", label: "Planner", icon: Kanban, badge: "New" },
  { to: "/citations", label: "Citations", icon: FileText, badge: "New" },
  { to: "/progress", label: "Reports", icon: BarChart3, badge: null },
  { to: "/study-plan", label: "Study Plan", icon: CalendarCheck, badge: "AI" },
  { to: "/focus-stats", label: "Focus Stats", icon: PieChart, badge: "New" },
  { to: "/annotations", label: "Annotations", icon: Highlighter, badge: "New" },
  { to: "/weekly-digest", label: "Weekly Digest", icon: Mail, badge: "New" },
  { to: "/reminders", label: "Reminders", icon: AlarmClock, badge: "New" },
  { to: "/compare", label: "Compare", icon: GitCompareArrows, badge: "New" },
  { to: "/voice-studio", label: "Voice Studio", icon: Headphones, badge: "New" },
  { to: "/deep-focus", label: "Deep Focus", icon: Zap, badge: "New" },
  { to: "/research-copilot", label: "AI Copilot", icon: Cpu, badge: "AI" },
];

const ENGAGE_NAV = [
  { to: "/nobel-ai", label: "Nobel Oracle", icon: Bot, badge: "AI" },
  { to: "/analytics", label: "Analytics", icon: BarChart3, badge: null },
  { to: "/quiz", label: "Quiz", icon: HelpCircle, badge: "New" },
  { to: "/predictions", label: "Predictions", icon: TrendingUp, badge: null },
  { to: "/notifications", label: "Notifications", icon: Bell, badge: null },
  { to: "/tracker", label: "Tracker", icon: Target, badge: null },
  { to: "/world-map", label: "World Map", icon: Globe, badge: "New" },
  { to: "/leaderboard", label: "Leaderboard", icon: Trophy, badge: null },
  { to: "/passport", label: "Passport", icon: Award, badge: null },
  { to: "/achievements", label: "Achievements", icon: Medal, badge: "New" },
  { to: "/personal-insights", label: "Insights", icon: TrendingUp, badge: "New" },
  { to: "/impact-simulator", label: "Impact Sim", icon: Zap, badge: "New" },
];

const INFO_NAV = [
  { to: "/about", label: "About", icon: Info, badge: null },
  { to: "/privacy", label: "Privacy", icon: Shield, badge: null },
  { to: "/terms", label: "Terms", icon: Scale, badge: null },
];

interface NavItem {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge: string | null;
}

const AppSidebar = () => {
  const { session, isReady } = useAuth();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const navigate = useNavigate();
  const location = useLocation();
  const scrollRef = useRef<HTMLDivElement>(null);

    await supabase.auth.signOut();
    navigate("/");
  };

  const userInitials = session
    ? (session.user.user_metadata?.display_name || session.user.email || "U")
        .slice(0, 2)
        .toUpperCase()
    : "?";

  const userName = session
    ? session.user.user_metadata?.display_name || session.user.email?.split("@")[0]
    : "";

  const userEmail = session?.user.email || "";

  const renderNavItem = (item: NavItem) => {
    const isActive = location.pathname === item.to;
    const content = (
      <SidebarMenuItem key={item.to}>
        <SidebarMenuButton asChild isActive={isActive} tooltip={item.label}>
          <NavLink
            to={item.to}
            className="group/item flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-sidebar-foreground/70 transition-all duration-200 hover:bg-sidebar-accent hover:text-sidebar-foreground"
            activeClassName="bg-sidebar-primary/15 text-sidebar-primary font-semibold"
          >
            <item.icon className={`h-4 w-4 shrink-0 transition-colors ${isActive ? "text-sidebar-primary" : "text-sidebar-foreground/50 group-hover/item:text-sidebar-foreground"}`} />
            {!collapsed && <span className="truncate">{item.label}</span>}
          </NavLink>
        </SidebarMenuButton>
        {!collapsed && item.badge && (
          <SidebarMenuBadge>
            <Badge
              variant={item.badge === "New" ? "default" : item.badge === "AI" ? "secondary" : "outline"}
              className={`text-[9px] px-1.5 py-0 h-4 font-bold ${
                item.badge === "New"
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : item.badge === "AI"
                  ? "bg-sidebar-accent text-sidebar-accent-foreground border-sidebar-border"
                  : "border-sidebar-border text-sidebar-foreground/50"
              }`}
            >
              {item.badge}
            </Badge>
          </SidebarMenuBadge>
        )}
      </SidebarMenuItem>
    );

    return content;
  };

  const renderCollapsibleGroup = (
    label: string,
    items: NavItem[],
    icon: React.ComponentType<{ className?: string }>,
    defaultOpen = true
  ) => {
    const Icon = icon;
    const hasActiveChild = items.some((item) => location.pathname === item.to);

    return (
      <Collapsible defaultOpen={defaultOpen || hasActiveChild} className="group/collapsible">
        <SidebarGroup>
          <SidebarGroupLabel asChild>
            <CollapsibleTrigger className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-sidebar-foreground/40 transition-colors hover:text-sidebar-foreground/70 [&[data-state=open]>svg.chevron]:rotate-0">
              {!collapsed && (
                <>
                  <Icon className="h-3 w-3" />
                  <span className="flex-1 text-left">{label}</span>
                  <ChevronDown className="chevron h-3 w-3 shrink-0 transition-transform duration-200 -rotate-90" />
                </>
              )}
              {collapsed && <Icon className="h-3.5 w-3.5 mx-auto" />}
            </CollapsibleTrigger>
          </SidebarGroupLabel>
          <CollapsibleContent className="transition-all duration-200 data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
            <SidebarGroupContent>
              <SidebarMenu>{items.map(renderNavItem)}</SidebarMenu>
            </SidebarGroupContent>
          </CollapsibleContent>
        </SidebarGroup>
      </Collapsible>
    );
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      {/* Header with Logo */}
      <SidebarHeader className="p-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild tooltip="NobelHub">
              <Link to="/" className="flex items-center gap-3 group">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-sidebar-primary to-amber-700 shadow-md shadow-sidebar-primary/20 transition-transform group-hover:scale-105">
                  <Award className="h-5 w-5 text-sidebar-primary-foreground" />
                </div>
                {!collapsed && (
                  <div className="flex flex-col gap-0.5 leading-none">
                    <span className="font-display text-lg font-black tracking-tight text-sidebar-foreground">
                      NOBEL<span className="text-sidebar-primary">HUB</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Sparkles className="h-2 w-2 text-sidebar-primary animate-pulse" />
                      <span className="text-[8px] font-bold uppercase tracking-[0.2em] text-sidebar-foreground/40">
                        v2.5
                      </span>
                    </span>
                  </div>
                )}
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarSeparator className="bg-sidebar-border/50" />

      {/* Quick Actions Bar */}
      {!collapsed && (
        <div className="px-4 py-2">
          <div className="flex items-center gap-1.5">
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => navigate("/search")}
                  className="flex h-8 w-8 items-center justify-center rounded-md bg-sidebar-accent text-sidebar-foreground/60 transition-all hover:bg-sidebar-accent/80 hover:text-sidebar-foreground"
                >
                  <Search className="h-3.5 w-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs">Quick Search</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => navigate("/scholar-dashboard")}
                  className="flex h-8 w-8 items-center justify-center rounded-md bg-sidebar-accent text-sidebar-foreground/60 transition-all hover:bg-sidebar-accent/80 hover:text-sidebar-foreground"
                >
                  <Zap className="h-3.5 w-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs">Scholar Dashboard</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => navigate("/analytics")}
                  className="flex h-8 w-8 items-center justify-center rounded-md bg-sidebar-accent text-sidebar-foreground/60 transition-all hover:bg-sidebar-accent/80 hover:text-sidebar-foreground"
                >
                  <BarChart3 className="h-3.5 w-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs">Analytics</TooltipContent>
            </Tooltip>
            <div className="flex-1" />
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="relative flex h-8 w-8 items-center justify-center rounded-md bg-sidebar-accent text-sidebar-foreground/60 transition-all hover:bg-sidebar-accent/80 hover:text-sidebar-foreground">
                  <Bell className="h-3.5 w-3.5" />
                  <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-sidebar-primary" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs">Notifications</TooltipContent>
            </Tooltip>
          </div>
        </div>
      )}

      {!collapsed && <SidebarSeparator className="bg-sidebar-border/50" />}

      {/* Navigation Groups */}
      <SidebarContent>
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto overflow-x-hidden"
          style={{ scrollbarWidth: "thin", scrollbarColor: "hsl(var(--sidebar-border)) transparent" }}
        >
          {renderCollapsibleGroup("Navigate", MAIN_NAV, Compass, true)}
          {renderCollapsibleGroup("Research & Learn", RESEARCH_NAV, FlaskConical, true)}
          {renderCollapsibleGroup("Engage", ENGAGE_NAV, Zap, true)}
          {renderCollapsibleGroup("Information", INFO_NAV, Info, false)}
        </div>
      </SidebarContent>

      <SidebarSeparator className="bg-sidebar-border/50" />

      {/* Footer with User Dropdown */}
      <SidebarFooter className="p-2">
        {!isReady ? (
          <div className="flex items-center gap-3 px-3 py-2.5">
            <div className="h-8 w-8 rounded-lg bg-sidebar-accent animate-pulse shrink-0" />
            {!collapsed && (
              <div className="flex flex-col gap-1.5 flex-1">
                <div className="h-3 w-20 rounded bg-sidebar-accent animate-pulse" />
                <div className="h-2 w-28 rounded bg-sidebar-accent animate-pulse" />
              </div>
            )}
          </div>
        ) : session ? (
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton
                    size="lg"
                    className="w-full rounded-lg transition-colors hover:bg-sidebar-accent data-[state=open]:bg-sidebar-accent"
                    tooltip={userName || "Profile"}
                  >
                    <Avatar className="h-8 w-8 rounded-lg border border-sidebar-border">
                      <AvatarFallback className="rounded-lg bg-gradient-to-br from-sidebar-primary/20 to-sidebar-primary/5 text-sidebar-primary text-xs font-bold">
                        {userInitials}
                      </AvatarFallback>
                    </Avatar>
                    {!collapsed && (
                      <div className="flex flex-col gap-0.5 leading-none text-left flex-1 min-w-0">
                        <span className="truncate text-sm font-semibold text-sidebar-foreground">
                          {userName}
                        </span>
                        <span className="truncate text-[11px] text-sidebar-foreground/50">
                          {userEmail}
                        </span>
                      </div>
                    )}
                    {!collapsed && <ChevronsUpDown className="ml-auto h-4 w-4 shrink-0 text-sidebar-foreground/30" />}
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-xl border border-border bg-popover p-1"
                  side={collapsed ? "right" : "top"}
                  align="start"
                  sideOffset={8}
                >
                  <DropdownMenuLabel className="p-0 font-normal">
                    <div className="flex items-center gap-3 px-2 py-2">
                      <Avatar className="h-9 w-9 rounded-lg border border-border">
                        <AvatarFallback className="rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 text-primary text-xs font-bold">
                          {userInitials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col gap-0.5 leading-none">
                        <span className="text-sm font-semibold">{userName}</span>
                        <span className="text-xs text-muted-foreground">{userEmail}</span>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/profile")} className="gap-2 rounded-lg cursor-pointer">
                    <User className="h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/scholar-dashboard")} className="gap-2 rounded-lg cursor-pointer">
                    <Brain className="h-4 w-4" />
                    <span>Scholar Dashboard</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/scientific-skills")} className="gap-2 rounded-lg cursor-pointer">
                    <Settings className="h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleSignOut}
                    className="gap-2 rounded-lg cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Sign Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        ) : (
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Sign In">
                <Link
                  to="/auth"
                  className="flex items-center gap-3 rounded-lg bg-sidebar-primary px-3 py-2.5 text-sm font-bold text-sidebar-primary-foreground transition-all hover:bg-sidebar-primary/90"
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
