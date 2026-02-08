import { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'
import { Badge, useGamificationStore } from '../../stores/gamification-store'

interface Node extends d3.SimulationNodeDatum {
  id: string
  group: string
  badge: Badge
  unlocked: boolean
  x?: number
  y?: number
}

interface Link extends d3.SimulationLinkDatum<Node> {
  source: string | Node
  target: string | Node
}

export default function AchievementConstellation() {
  const svgRef = useRef<SVGSVGElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const { badges, allBadges } = useGamificationStore()
  const [tooltip, setTooltip] = useState<{ x: number, y: number, badge: Badge, unlocked: boolean } | null>(null)

  useEffect(() => {
    if (!svgRef.current || !wrapperRef.current) return

    const width = wrapperRef.current.clientWidth
    const height = wrapperRef.current.clientHeight

    // 1. Data Preparation
    const nodes: Node[] = allBadges.map(b => ({
      id: b.id,
      group: b.category,
      badge: b,
      unlocked: badges.some(ub => ub.id === b.id)
    }))

    // Create logical links (Categorical clusters + Progression)
    // Connecting nodes of same category roughly
    const links: Link[] = []
    
    // Connect 'novice' linear progression
    links.push({ source: 'first_chat', target: 'level_5' })
    links.push({ source: 'first_stake', target: 'first_swap' })
    
    // Connect central hub (Whale status) to categories
    links.push({ source: 'whale', target: 'first_stake' })
    links.push({ source: 'whale', target: 'defi_degen' })
    links.push({ source: 'whale', target: 'chatterbox' })
    
    // Category Clusters
    const categories = ['novice', 'defi', 'whale', 'social', 'secret']
    categories.forEach(cat => {
        const catNodes = nodes.filter(n => n.group === cat)
        for (let i = 0; i < catNodes.length - 1; i++) {
            links.push({ source: catNodes[i].id, target: catNodes[i+1].id })
        }
    })

    // Clear previous
    d3.select(svgRef.current).selectAll("*").remove()

    const svg = d3.select(svgRef.current)
      .attr("viewBox", [0, 0, width, height])
      .attr("style", "max-width: 100%; height: auto;")

    // 2. Simulation
    const simulation = d3.forceSimulation(nodes)
      .force("link", d3.forceLink<Node, Link>(links).id(d => d.id).distance(80))
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collide", d3.forceCollide().radius(40))

    // 3. Render
    
    // Glow Filter
    const defs = svg.append("defs");
    const filter = defs.append("filter")
        .attr("id", "glow");
    filter.append("feGaussianBlur")
        .attr("stdDeviation", "2.5")
        .attr("result", "coloredBlur");
    const feMerge = filter.append("feMerge");
    feMerge.append("feMergeNode").attr("in", "coloredBlur");
    feMerge.append("feMergeNode").attr("in", "SourceGraphic");

    const link = svg.append("g")
      .attr("stroke", "#334155") // Slate-700
      .attr("stroke-opacity", 0.6)
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("stroke-width", 1.5)

    const nodeGroup = svg.append("g")
      .selectAll("g")
      .data(nodes)
      .join("g")
      .call(d3.drag<any, any>()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended))

    // Circle Background
    nodeGroup.append("circle")
      .attr("r", 24)
      .attr("fill", d => d.unlocked ? "#0f172a" : "#0f172a") // Slate-900
      .attr("stroke", d => {
          if (!d.unlocked) return "#334155"; // Locked: Slate-700
          switch(d.group) {
              case 'novice': return "#22d3ee"; // Cyan
              case 'defi': return "#a855f7"; // Purple
              case 'whale': return "#eab308"; // Yellow
              case 'social': return "#f472b6"; // Pink
              default: return "#94a3b8";
          }
      })
      .attr("stroke-width", d => d.unlocked ? 3 : 1)
      .style("filter", d => d.unlocked ? "url(#glow)" : "none")
      .style("opacity", d => d.unlocked ? 1 : 0.5)

    // Icons (Text)
    nodeGroup.append("text")
      .text(d => d.badge.icon)
      .attr("text-anchor", "middle")
      .attr("dy", "0.35em")
      .attr("font-size", "20px")
      .style("opacity", d => d.unlocked ? 1 : 0.4)
      .style("cursor", "pointer")
      
    // Interaction
    nodeGroup.on("mouseenter", (event, d) => {
        setTooltip({
            x: event.pageX,
            y: event.pageY,
            badge: d.badge,
            unlocked: d.unlocked
        })
        d3.select(event.currentTarget).select("circle")
            .attr("r", 28)
            .attr("stroke", "#ffffff")
    })
    
    nodeGroup.on("mouseleave", (event, d) => {
        setTooltip(null)
        d3.select(event.currentTarget).select("circle")
            .attr("r", 24)
            .attr("stroke", d.unlocked ? (d.group === 'whale' ? '#eab308' : '#22d3ee') : '#334155') // Revert roughly (simplified)
            // Ideally re-run the color logic function, but this is fine for MVP
    })

    simulation.on("tick", () => {
      link
        .attr("x1", d => (d.source as Node).x!)
        .attr("y1", d => (d.source as Node).y!)
        .attr("x2", d => (d.target as Node).x!)
        .attr("y2", d => (d.target as Node).y!)

      nodeGroup
        .attr("transform", d => `translate(${d.x},${d.y})`)
    })

    function dragstarted(event: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart()
      event.subject.fx = event.subject.x
      event.subject.fy = event.subject.y
    }

    function dragged(event: any) {
      event.subject.fx = event.x
      event.subject.fy = event.y
    }

    function dragended(event: any) {
      if (!event.active) simulation.alphaTarget(0)
      event.subject.fx = null
      event.subject.fy = null
    }

    return () => {
      simulation.stop()
    }
  }, [badges, allBadges])

  return (
    <div className="relative w-full h-[600px] bg-slate-900/50 rounded-3xl overflow-hidden border border-slate-800 shadow-inner" ref={wrapperRef}>
      <svg ref={svgRef} className="w-full h-full"></svg>
      
      {/* Tooltip Overlay */}
      {tooltip && (
          <div 
            className="absolute z-50 pointer-events-none p-4 rounded-xl bg-slate-900/95 border border-slate-700 backdrop-blur-xl shadow-2xl max-w-xs transition-opacity duration-200"
            style={{ 
                // Convert page coords to container relative or just use fixed positioning if component is large
                // For simplicity inside this relative container, we might need adjustments.
                // Actually, let's just put it top-left or corner for stability, OR verify coordinates.
                // Using fixed allows page-relative coordinates.
                position: 'fixed',
                left: tooltip.x + 20,
                top: tooltip.y - 20
            }}
          >
              <div className="flex items-center gap-3 mb-2">
                  <span className="text-3xl">{tooltip.badge.icon}</span>
                  <div>
                      <h4 className={`text-sm font-bold uppercase tracking-wider ${tooltip.unlocked ? 'text-cyan-400' : 'text-slate-500'}`}>
                          {tooltip.badge.name}
                      </h4>
                      <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-400 border border-slate-700">
                          {tooltip.badge.category.toUpperCase()}
                      </span>
                  </div>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                  {tooltip.unlocked ? tooltip.badge.description : "Locked achievement. Keep exploring to reveal."}
              </p>
              {tooltip.unlocked && (
                  <div className="mt-2 text-[9px] text-green-400 font-mono">
                      ✅ Unlocked
                  </div>
              )}
          </div>
      )}
      
      <div className="absolute bottom-4 right-4 text-xs text-slate-600 font-mono pointer-events-none">
          D3.js Force Directed Graph
      </div>
    </div>
  )
}
