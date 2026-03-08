import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import PageLayout from "@/frontend/components/layout/PageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/App";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Network, ZoomIn, ZoomOut, Maximize2, Search, Filter, Info } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface GraphNode {
  id: string;
  label: string;
  type: "laureate" | "institution" | "category" | "country";
  x: number;
  y: number;
  vx: number;
  vy: number;
  category?: string;
  year?: number;
  size: number;
}

interface GraphEdge {
  source: string;
  target: string;
  type: "institution" | "category" | "country";
}

const CATEGORY_COLORS: Record<string, string> = {
  Physics: "#3b82f6",
  Chemistry: "#10b981",
  Medicine: "#ef4444",
  Literature: "#a855f7",
  Peace: "#f59e0b",
  Economics: "#06b6d4",
};

const KnowledgeGraphPage = () => {
  const { user } = useAuth();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [zoom, setZoom] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null);
  const nodesRef = useRef<GraphNode[]>([]);
  const edgesRef = useRef<GraphEdge[]>([]);
  const animFrameRef = useRef<number>(0);
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const dragNode = useRef<GraphNode | null>(null);

  const { data: laureates = [] } = useQuery({
    queryKey: ["graph-laureates"],
    queryFn: async () => {
      const { data } = await supabase.from("laureates").select("id, first_name, last_name, category, institution, nationality, year").order("year", { ascending: false }).limit(200);
      return data || [];
    },
  });

  // Build graph data
  const { nodes, edges } = useMemo(() => {
    if (!laureates.length) return { nodes: [], edges: [] };

    const nodeMap = new Map<string, GraphNode>();
    const edgeList: GraphEdge[] = [];
    const centerX = 500;
    const centerY = 400;

    // Filter laureates
    const filtered = laureates.filter(l => {
      if (filterCategory !== "all" && l.category !== filterCategory) return false;
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        return `${l.first_name} ${l.last_name}`.toLowerCase().includes(term) ||
          l.institution?.toLowerCase().includes(term) ||
          l.nationality?.toLowerCase().includes(term);
      }
      return true;
    });

    // Create laureate nodes
    filtered.forEach((l, i) => {
      const angle = (i / filtered.length) * Math.PI * 2;
      const radius = 200 + Math.random() * 150;
      nodeMap.set(l.id, {
        id: l.id,
        label: `${l.first_name} ${l.last_name}`,
        type: "laureate",
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius,
        vx: 0, vy: 0,
        category: l.category,
        year: l.year,
        size: 6,
      });

      // Institution node
      if (l.institution && l.institution.length > 1) {
        const instId = `inst-${l.institution}`;
        if (!nodeMap.has(instId)) {
          const iAngle = Math.random() * Math.PI * 2;
          nodeMap.set(instId, {
            id: instId, label: l.institution, type: "institution",
            x: centerX + Math.cos(iAngle) * 100,
            y: centerY + Math.sin(iAngle) * 100,
            vx: 0, vy: 0, size: 10,
          });
        }
        edgeList.push({ source: l.id, target: instId, type: "institution" });
      }

      // Country node
      if (l.nationality) {
        const countryId = `country-${l.nationality}`;
        if (!nodeMap.has(countryId)) {
          const cAngle = Math.random() * Math.PI * 2;
          nodeMap.set(countryId, {
            id: countryId, label: l.nationality, type: "country",
            x: centerX + Math.cos(cAngle) * 350,
            y: centerY + Math.sin(cAngle) * 350,
            vx: 0, vy: 0, size: 8,
          });
        }
        edgeList.push({ source: l.id, target: countryId, type: "country" });
      }
    });

    return { nodes: Array.from(nodeMap.values()), edges: edgeList };
  }, [laureates, filterCategory, searchTerm]);

  // Force simulation
  useEffect(() => {
    nodesRef.current = nodes.map(n => ({ ...n }));
    edgesRef.current = edges;

    let iteration = 0;
    const maxIterations = 300;

    const simulate = () => {
      const ns = nodesRef.current;
      if (!ns.length || iteration > maxIterations) return;
      iteration++;

      // Repulsion
      for (let i = 0; i < ns.length; i++) {
        for (let j = i + 1; j < ns.length; j++) {
          const dx = ns[j].x - ns[i].x;
          const dy = ns[j].y - ns[i].y;
          const dist = Math.max(Math.sqrt(dx * dx + dy * dy), 1);
          const force = 800 / (dist * dist);
          ns[i].vx -= (dx / dist) * force;
          ns[i].vy -= (dy / dist) * force;
          ns[j].vx += (dx / dist) * force;
          ns[j].vy += (dy / dist) * force;
        }
      }

      // Attraction along edges
      const nodeById = new Map(ns.map(n => [n.id, n]));
      edgesRef.current.forEach(e => {
        const s = nodeById.get(e.source);
        const t = nodeById.get(e.target);
        if (!s || !t) return;
        const dx = t.x - s.x;
        const dy = t.y - s.y;
        const dist = Math.max(Math.sqrt(dx * dx + dy * dy), 1);
        const force = (dist - 80) * 0.005;
        s.vx += (dx / dist) * force;
        s.vy += (dy / dist) * force;
        t.vx -= (dx / dist) * force;
        t.vy -= (dy / dist) * force;
      });

      // Center gravity
      ns.forEach(n => {
        n.vx += (500 - n.x) * 0.001;
        n.vy += (400 - n.y) * 0.001;
        n.vx *= 0.9;
        n.vy *= 0.9;
        if (dragNode.current?.id !== n.id) {
          n.x += n.vx;
          n.y += n.vy;
        }
      });

      draw();
      animFrameRef.current = requestAnimationFrame(simulate);
    };

    simulate();
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [nodes, edges]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvas.clientWidth * dpr;
    canvas.height = canvas.clientHeight * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
    ctx.save();
    ctx.translate(panOffset.x, panOffset.y);
    ctx.scale(zoom, zoom);

    const ns = nodesRef.current;
    const nodeById = new Map(ns.map(n => [n.id, n]));

    // Draw edges
    edgesRef.current.forEach(e => {
      const s = nodeById.get(e.source);
      const t = nodeById.get(e.target);
      if (!s || !t) return;
      ctx.beginPath();
      ctx.moveTo(s.x, s.y);
      ctx.lineTo(t.x, t.y);
      ctx.strokeStyle = e.type === "institution" ? "rgba(168,85,247,0.12)" : "rgba(59,130,246,0.08)";
      ctx.lineWidth = 0.5;
      ctx.stroke();
    });

    // Draw nodes
    ns.forEach(n => {
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.size, 0, Math.PI * 2);

      if (n.type === "laureate") {
        ctx.fillStyle = CATEGORY_COLORS[n.category || "Physics"] || "#888";
      } else if (n.type === "institution") {
        ctx.fillStyle = "#a855f7";
      } else {
        ctx.fillStyle = "#64748b";
      }

      if (hoveredNode?.id === n.id || selectedNode?.id === n.id) {
        ctx.shadowColor = ctx.fillStyle;
        ctx.shadowBlur = 15;
        ctx.arc(n.x, n.y, n.size + 3, 0, Math.PI * 2);
      }

      ctx.fill();
      ctx.shadowBlur = 0;

      // Labels for non-laureate or selected/hovered
      if (n.type !== "laureate" || hoveredNode?.id === n.id || selectedNode?.id === n.id) {
        ctx.fillStyle = "rgba(255,255,255,0.9)";
        ctx.font = `${n.type === "laureate" ? 9 : 10}px system-ui`;
        ctx.textAlign = "center";
        ctx.fillText(n.label, n.x, n.y + n.size + 12);
      }
    });

    ctx.restore();
  }, [zoom, panOffset, hoveredNode, selectedNode]);

  // Mouse interactions
  const getNodeAt = (mx: number, my: number): GraphNode | null => {
    const x = (mx - panOffset.x) / zoom;
    const y = (my - panOffset.y) / zoom;
    for (const n of nodesRef.current) {
      const dx = n.x - x;
      const dy = n.y - y;
      if (Math.sqrt(dx * dx + dy * dy) < n.size + 4) return n;
    }
    return null;
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const node = getNodeAt(mx, my);
    if (node) {
      dragNode.current = node;
      setSelectedNode(node);
    } else {
      isDragging.current = true;
      dragStart.current = { x: e.clientX - panOffset.x, y: e.clientY - panOffset.y };
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    if (dragNode.current) {
      dragNode.current.x = (mx - panOffset.x) / zoom;
      dragNode.current.y = (my - panOffset.y) / zoom;
      draw();
    } else if (isDragging.current) {
      setPanOffset({ x: e.clientX - dragStart.current.x, y: e.clientY - dragStart.current.y });
    } else {
      setHoveredNode(getNodeAt(mx, my));
    }
  };

  const handleMouseUp = () => {
    dragNode.current = null;
    isDragging.current = false;
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    setZoom(z => Math.max(0.3, Math.min(3, z - e.deltaY * 0.001)));
  };

  // Connected nodes info
  const connectedNodes = useMemo(() => {
    if (!selectedNode) return [];
    const connected = new Set<string>();
    edgesRef.current.forEach(e => {
      if (e.source === selectedNode.id) connected.add(e.target);
      if (e.target === selectedNode.id) connected.add(e.source);
    });
    return nodesRef.current.filter(n => connected.has(n.id));
  }, [selectedNode]);

  const stats = useMemo(() => {
    const institutions = new Set(nodesRef.current.filter(n => n.type === "institution").map(n => n.label));
    const countries = new Set(nodesRef.current.filter(n => n.type === "country").map(n => n.label));
    const laureateCount = nodesRef.current.filter(n => n.type === "laureate").length;
    return { laureateCount, institutions: institutions.size, countries: countries.size, edges: edgesRef.current.length };
  }, [nodes]);

  return (
    <PageLayout>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Network className="h-6 w-6 text-primary" /> Nobel Knowledge Graph
            </h1>
            <p className="text-sm text-muted-foreground">Explore connections between laureates, institutions, and countries</p>
          </div>
          <div className="flex items-center gap-2">
            <Input placeholder="Search..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-48 h-8 text-sm" />
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-32 h-8 text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Fields</SelectItem>
                {Object.keys(CATEGORY_COLORS).map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: "Laureates", value: stats.laureateCount },
            { label: "Institutions", value: stats.institutions },
            { label: "Countries", value: stats.countries },
            { label: "Connections", value: stats.edges },
          ].map(s => (
            <Card key={s.label} className="border-border/50">
              <CardContent className="p-3 text-center">
                <div className="text-lg font-bold text-primary">{s.value}</div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{s.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Canvas */}
          <Card className="lg:col-span-3 border-border/50 overflow-hidden">
            <CardContent className="p-0 relative">
              <canvas
                ref={canvasRef}
                className="w-full h-[600px] cursor-grab active:cursor-grabbing bg-background"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onWheel={handleWheel}
              />
              <div className="absolute bottom-3 right-3 flex items-center gap-1">
                <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => setZoom(z => Math.min(3, z + 0.2))}>
                  <ZoomIn className="h-3 w-3" />
                </Button>
                <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => setZoom(z => Math.max(0.3, z - 0.2))}>
                  <ZoomOut className="h-3 w-3" />
                </Button>
                <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => { setZoom(1); setPanOffset({ x: 0, y: 0 }); }}>
                  <Maximize2 className="h-3 w-3" />
                </Button>
              </div>
              {/* Legend */}
              <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                {Object.entries(CATEGORY_COLORS).map(([cat, color]) => (
                  <Badge key={cat} variant="outline" className="text-[10px] gap-1 border-border/50 bg-background/80 backdrop-blur-sm">
                    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
                    {cat}
                  </Badge>
                ))}
                <Badge variant="outline" className="text-[10px] gap-1 border-border/50 bg-background/80 backdrop-blur-sm">
                  <div className="h-2 w-2 rounded-full bg-purple-500" />
                  Institution
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Detail Panel */}
          <Card className="border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2"><Info className="h-4 w-4" /> Details</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedNode ? (
                <div className="space-y-3">
                  <div>
                    <h3 className="font-semibold text-sm">{selectedNode.label}</h3>
                    <Badge variant="outline" className="text-[10px] mt-1">{selectedNode.type}</Badge>
                    {selectedNode.category && (
                      <Badge className="text-[10px] ml-1" style={{ backgroundColor: CATEGORY_COLORS[selectedNode.category] }}>{selectedNode.category}</Badge>
                    )}
                    {selectedNode.year && <p className="text-xs text-muted-foreground mt-1">Year: {selectedNode.year}</p>}
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-muted-foreground mb-1">Connected ({connectedNodes.length})</h4>
                    <ScrollArea className="h-[300px]">
                      <div className="space-y-1">
                        {connectedNodes.map(n => (
                          <button key={n.id} onClick={() => setSelectedNode(n)} className="w-full text-left p-1.5 rounded text-xs hover:bg-accent transition-colors">
                            <span className="font-medium">{n.label}</span>
                            <Badge variant="outline" className="text-[8px] ml-1">{n.type}</Badge>
                          </button>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">Click a node to see details and connections.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </PageLayout>
  );
};

export default KnowledgeGraphPage;
