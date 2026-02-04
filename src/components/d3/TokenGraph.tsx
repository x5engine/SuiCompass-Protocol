/**
 * Token Graph Visualization using D3.js
 * Visualizes wallet assets and connections
 */

import { useEffect, useRef } from 'react'
import * as d3 from 'd3'

interface TokenNode extends d3.SimulationNodeDatum {
    id: string
    group: number
    value: number
    img?: string
}

interface TokenLink extends d3.SimulationLinkDatum<TokenNode> {
    source: string | TokenNode
    target: string | TokenNode
    value: number
}

const data = {
    nodes: [
        { id: "SUI", group: 1, value: 50 },
        { id: "USDC", group: 2, value: 30 },
        { id: "CETUS", group: 2, value: 20 },
        { id: "vSUI", group: 3, value: 15 },
        { id: "SuiLend", group: 4, value: 10 },
    ],
    links: [
        { source: "SUI", target: "vSUI", value: 5 },
        { source: "SUI", target: "CETUS", value: 3 },
        { source: "USDC", target: "SuiLend", value: 8 },
        { source: "SUI", target: "SuiLend", value: 2 },
    ]
};

export default function TokenGraph() {
    const svgRef = useRef<SVGSVGElement>(null)

    useEffect(() => {
        if (!svgRef.current) return

        const width = 600
        const height = 400
        const svg = d3.select(svgRef.current)
            .attr("viewBox", [0, 0, width, height])
            .style("background", "transparent")

        svg.selectAll("*").remove() // Clear previous

        const simulation = d3.forceSimulation<TokenNode>(data.nodes as TokenNode[])
            .force("link", d3.forceLink<TokenNode, TokenLink>(data.links as TokenLink[]).id(d => d.id).distance(100))
            .force("charge", d3.forceManyBody().strength(-300))
            .force("center", d3.forceCenter(width / 2, height / 2))

        const link = svg.append("g")
            .attr("stroke", "#999")
            .attr("stroke-opacity", 0.6)
            .selectAll("line")
            .data(data.links)
            .join("line")
            .attr("stroke-width", d => Math.sqrt(d.value))

        const node = svg.append("g")
            .attr("stroke", "#fff")
            .attr("stroke-width", 1.5)
            .selectAll("circle")
            .data(data.nodes)
            .join("circle")
            .attr("r", d => 10 + Math.sqrt(d.value))
            .attr("fill", d => d.id === 'SUI' ? '#4da2ff' : '#64748b')
            .call(drag(simulation) as any)

        const label = svg.append("g")
            .attr("class", "labels")
            .selectAll("text")
            .data(data.nodes)
            .enter()
            .append("text")
            .attr("dx", 15)
            .attr("dy", 5)
            .text(d => d.id)
            .style("fill", "#cbd5e1")
            .style("font-size", "12px")
            .style("font-family", "Inter, sans-serif")
            .style("pointer-events", "none")

        simulation.on("tick", () => {
            link
                .attr("x1", d => ((d.source as unknown) as TokenNode).x!)
                .attr("y1", d => ((d.source as unknown) as TokenNode).y!)
                .attr("x2", d => ((d.target as unknown) as TokenNode).x!)
                .attr("y2", d => ((d.target as unknown) as TokenNode).y!)

            node
                .attr("cx", d => (d as unknown as TokenNode).x!)
                .attr("cy", d => (d as unknown as TokenNode).y!)

            label
                .attr("x", d => (d as unknown as TokenNode).x!)
                .attr("y", d => (d as unknown as TokenNode).y!)
        })

        function drag(simulation: d3.Simulation<TokenNode, undefined>) {
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

            return d3.drag()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended)
        }

    }, [])

    return (
        <div className="w-full bg-[#0d1117] rounded-xl border border-slate-700/50 p-4">
            <h3 className="text-sm font-bold text-slate-300 mb-4">🕸️ Token Graph (D3)</h3>
            <div className="overflow-hidden rounded-lg bg-[#161b22] flex items-center justify-center">
                <svg ref={svgRef} width="100%" height="400" />
            </div>
        </div>
    )
}
