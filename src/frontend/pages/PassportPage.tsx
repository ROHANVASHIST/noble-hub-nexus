import { useMemo } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import PageLayout from "@/frontend/components/layout/PageLayout";
import NobelPassport from "@/frontend/components/NobelPassport";
import { useAuth } from "@/App";
import { supabase } from "@/integrations/supabase/client";
import { Globe, Loader2 } from "lucide-react";

const PassportPage = () => {
  const { user, session } = useAuth();

  const userName = session?.user.user_metadata?.display_name || session?.user.email?.split("@")[0] || "Scholar";

  const { data: viewedLaureates = [], isLoading } = useQuery({
    queryKey: ["passport-views", user?.id],
    queryFn: async () => {
      if (!user) return [];
      // Get user activity for laureate views
      const { data: activity } = await supabase
        .from("user_activity")
        .select("item_id, metadata")
        .eq("user_id", user.id)
        .eq("item_type", "laureate")
        .eq("action", "view");

      if (!activity || activity.length === 0) {
        // Fallback: get bookmarked laureates
        const { data: bookmarks } = await supabase
          .from("bookmarks")
          .select("item_id")
          .eq("user_id", user.id)
          .eq("item_type", "laureate");

        if (!bookmarks || bookmarks.length === 0) return [];

        const ids = bookmarks.map(b => b.item_id);
        const { data: laureates } = await supabase
          .from("laureates")
          .select("id, category, nationality")
          .in("id", ids);

        return (laureates || []).map(l => ({
          id: l.id,
          category: l.category,
          nationality: l.nationality,
        }));
      }

      // Get unique laureate IDs
      const uniqueIds = [...new Set(activity.map(a => a.item_id).filter(Boolean))];
      if (uniqueIds.length === 0) return [];

      const { data: laureates } = await supabase
        .from("laureates")
        .select("id, category, nationality")
        .in("id", uniqueIds);

      return (laureates || []).map(l => ({
        id: l.id,
        category: l.category,
        nationality: l.nationality,
      }));
    },
    enabled: !!user,
  });

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-8">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Globe className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="font-display text-3xl font-bold text-foreground">Nobel Passport</h1>
              <p className="text-sm text-muted-foreground">Track your journey through Nobel Prize history.</p>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <NobelPassport viewedLaureates={viewedLaureates} userName={userName} />
          )}
        </motion.div>
      </div>
    </PageLayout>
  );
};

export default PassportPage;
