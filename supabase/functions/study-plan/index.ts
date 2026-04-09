import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { interests, currentLevel, weeklyHours, goals } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const systemPrompt = `You are an expert academic advisor specializing in Nobel Prize research areas. Create a highly detailed, personalized weekly study plan that is COMPREHENSIVE and THOROUGH.

Output a structured plan in Markdown with:
1. **Weekly Overview** - Detailed summary of focus areas, objectives, learning outcomes, and how topics connect to Nobel Prize discoveries
2. **Daily Schedule** (Monday-Sunday) - Each day should have:
   - 📚 Topic/Subject with detailed subtopics
   - ⏰ Suggested duration with time blocks
   - 📝 Specific activities (reading specific papers, practice problems, review exercises, writing summaries, watching lectures)
   - 🎯 Daily goal with measurable outcomes
   - 🔗 Connections to Nobel Prize discoveries and laureates
   - 📖 Specific readings: paper titles, book chapters, lecture names
3. **Key Resources** - Comprehensive list of recommended papers (with titles and authors), lectures (with speaker names), laureate work to study, textbooks, and online resources
4. **Milestones** - Weekly and daily checkpoints to measure progress with specific criteria
5. **Deep Dive Sessions** - 2-3 focused study sessions per week on complex topics with step-by-step exploration guides
6. **Review & Reflection** - End-of-week review activities, self-assessment questions, and reflection prompts
7. **Advanced Extensions** - For students who want to go deeper: research paper analysis exercises, concept mapping activities, and cross-disciplinary exploration
8. **Tips** - Personalized advice based on the student's level, learning style recommendations, and study technique suggestions

CRITICAL: Be EXTREMELY specific with Nobel Prize-related content. Name specific laureates, their exact discoveries, publication years, key papers, and institutions. Make every recommendation actionable and detailed. The study plan should be comprehensive enough to fill the allocated hours with meaningful activities. Aim for 2000+ words.`;

    const userPrompt = `Create a personalized weekly study plan for me:
- Interests: ${interests || "Physics, Chemistry"}
- Current Level: ${currentLevel || "Intermediate"}
- Weekly study hours available: ${weeklyHours || 10}
- Goals: ${goals || "Deepen understanding of Nobel Prize discoveries"}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited. Try again shortly." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("study-plan error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
