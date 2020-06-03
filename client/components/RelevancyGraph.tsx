import React from 'react'
import ReactDOM from 'react-dom'
import axios from 'axios'
import { useRef } from 'react'
import { useEffect, useState } from 'react'
import { SimulationNode, SimulationLink, SimulationGraph } from '../types/d3types'
import { InteractiveForceGraph, ForceGraphNode, ForceGraphLink } from 'react-vis-force';
import * as d3 from 'd3'
import { SimulationNodeDatum, SimulationLinkDatum, Simulation, min, forceSimulation } from 'd3'

interface RelevancyGraphProps {
    width: number;
}

interface RelevancyGraphQuery {
    query: string;
}

const RelevancyGraph: React.FC<RelevancyGraphProps> = ({width}) => {
    const height = width
    const [nodes, setNodes] = useState<SimulationNode[]>();
    const [links, setLinks] = useState<SimulationLink[]>();
    const [root, setRoot] = useState<string>()

    useEffect(() => {
        axios.post<RelevancyGraphQuery>('/api/graph_neighbors', {
            query: root
        }).then((data) => {
            let res = data.data as any;

            if (!root) {
                setRoot(res.root)
            } else {
                console.log("hello")
                setNodes(res.nodes.map((n) => {
                    return {
                        id: n.id,
                        depth: n.depth,
                        fx: n.id == root ? width / 2 : null,
                        fy: n.id == root ? height / 2 : null,
                        x: n.id == root ? width / 2 : width / 2 - n.depth * Math.min(height, width) / 5 * Math.cos(n.angle),
                        y: n.id == root ? width / 2 : height / 2 - n.depth * Math.min(height, width) / 5 * Math.sin(n.angle),
                    }
                }))
                setLinks(res.links.map((link) => ({
                    source: link.source,
                    target: link.target,
                    length: link.length
                })))
            }
        })
    }, [root])
    const ref = useRef(null);

    const ticked = () => {
        if (links && nodes) {

            const svg = d3.select(ref.current);

            svg.selectAll("circle")
                .data(nodes)
                .join("circle")
                .attr("cx", (d: d3.SimulationNodeDatum) => d.x ? d.x : 0)
                .attr("cy", (d: d3.SimulationNodeDatum) => d.y ? d.y : 0)
                .attr("r", 30)
                .style("fill", "white")
                .style("opacity", 0.2)

            svg.selectAll("line")
                .data(links)
                .join("line")
                .attr("x1", (d: SimulationLink) => d.source.x ? d.source.x : 0)
                .attr("y1", (d: SimulationLink) => d.source.y ? d.source.y : 0)
                .attr("x2", (d: SimulationLink) => d.target.x ? d.target.x : 0)
                .attr("y2", (d: SimulationLink) => d.target.y ? d.target.y : 0)
                .style("stroke-dasharray", "4 4 4 4")
                .style("stroke", "white")

            svg.selectAll("text")
                .data(nodes)
                .join("text")
                .attr("x", (d: d3.SimulationNodeDatum) => d.x ? d.x : 0)
                .attr("y", (d: d3.SimulationNodeDatum) => d.y ? d.y : 0)
                .attr("fx", (d: d3.SimulationNodeDatum) => root == d ? width / 2 : null)
                .attr("fy", (d: d3.SimulationNodeDatum) => root == d ? height / 2 : null)
                .attr("text-anchor", "middle")
                .attr("font-size", 12)
                .attr("fill", "white")
                .attr("dy", 5)
                .text((d: d3.SimulationNodeDatum) => d.index != undefined ? nodes[d.index]!.id : "")
        }

    }

    useEffect(() => {
        const MAX_DEPTH = 2;
        if (links && nodes) {
            const simulation = d3.forceSimulation(nodes)
                // .force("charge", d3.forceManyBody().strength(-1000))
                .force("links", d3.forceLink(links).id((node: d3.SimulationNodeDatum, ind: number, _) => {
                    return nodes[ind].id
                }).distance(((link: d3.SimulationLinkDatum<SimulationNodeDatum>) => {
                    return (link as any).length * Math.min(height, width) / 4
                })))
                .force("radial", d3.forceRadial((node: d3.SimulationNodeDatum) => {
                    return (node as any).depth * Math.min(height, width) / 4
                }, width / 2, height / 2).strength(0.8))
                .force("collide", d3.forceCollide().radius(40).strength(0.3))
                .on("tick", ticked)

            const svg = d3.select(ref.current);
            svg.selectAll("text")
                .data(nodes)
                .join("text")
                .on("click", (d: d3.SimulationNodeDatum) => {
                    const TRANSITION_TIME = 500;
            
            
                        let newNode: SimulationNode = d as SimulationNode;
                        let offsetX: number = d.x != undefined ? d.x - (width / 2) : 0;
                        let offsetY: number = d.y != undefined ? d.y - (height / 2) : 0;
                        d3.selectAll("text")
                            .data(nodes)
                            .transition().duration(1000)
                            .attr("x", (d: d3.SimulationNodeDatum) => d.x ? d.x - offsetX : width / 2)
                            .attr("y", (d: d3.SimulationNodeDatum) => d.y ? d.y - offsetY : height / 2)
            
                        d3.selectAll("line")
                            .data(links)
                            .transition().duration(1000)
                            .attr("x1", (d: SimulationLink) => d.source.x ? d.source.x - offsetX : 0)
                            .attr("y1", (d: SimulationLink) => d.source.y ? d.source.y - offsetY : 0)
                            .attr("x2", (d: SimulationLink) => d.target.x ? d.target.x - offsetX : 0)
                            .attr("y2", (d: SimulationLink) => d.target.y ? d.target.y - offsetY : 0)
                            .end().then(() => {
                                setRoot(newNode.id)
                            })
            
                        d3.selectAll("circle")
                            .data(nodes)
                            .join("circle")
                            .transition().duration(1000)
                            .attr("cx", (d: d3.SimulationNodeDatum) => d.x ? d.x - offsetX : width / 2)
                            .attr("cy", (d: d3.SimulationNodeDatum) => d.y ? d.y - offsetY : height / 2)
                })

            svg.selectAll("circle")
                .data(nodes)
                .join("circle")
                .on("click", (d: d3.SimulationNodeDatum) => {
                    const TRANSITION_TIME = 500;
                        let newNode: SimulationNode = d as SimulationNode;
                        let offsetX: number = d.x != undefined ? d.x - (width / 2) : 0;
                        let offsetY: number = d.y != undefined ? d.y - (height / 2) : 0;
                        d3.selectAll("text")
                            .data(nodes)
                            .transition().duration(1000)
                            .attr("x", (d: d3.SimulationNodeDatum) => d.x ? d.x - offsetX : width / 2)
                            .attr("y", (d: d3.SimulationNodeDatum) => d.y ? d.y - offsetY : height / 2)
            
                        d3.selectAll("line")
                            .data(links)
                            .transition().duration(1000)
                            .attr("x1", (d: SimulationLink) => d.source.x ? d.source.x - offsetX : 0)
                            .attr("y1", (d: SimulationLink) => d.source.y ? d.source.y - offsetY : 0)
                            .attr("x2", (d: SimulationLink) => d.target.x ? d.target.x - offsetX : 0)
                            .attr("y2", (d: SimulationLink) => d.target.y ? d.target.y - offsetY : 0)
                            .end().then(() => {
                                setRoot(newNode.id)
                            })
            
                        d3.selectAll("circle")
                            .data(nodes)
                            .join("circle")
                            .transition().duration(1000)
                            .attr("cx", (d: d3.SimulationNodeDatum) => d.x ? d.x - offsetX : width / 2)
                            .attr("cy", (d: d3.SimulationNodeDatum) => d.y ? d.y - offsetY : height / 2)
                })

        }
    }, [nodes, links])

    const getRadius = (length: number) => {
        return {
            1: 1,
            0.5: 3 / 2
        }[length]
    }

    return (
        <svg style = {{ margin: "50px auto", overflow: "visible", display: "block"}} height={width} width={width} ref={ref}></svg>
    )
}

export default RelevancyGraph;