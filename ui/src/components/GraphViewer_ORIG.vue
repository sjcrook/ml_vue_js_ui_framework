<template>

    <div>
        <h1>Visualizing RDF using D3 : Curve Links</h1>
        <span id="text-length-holder-node" class="node-text"></span>
        <span id="text-length-holder-pred" class="link-text"></span>
        <div id="svg-body" class="panel-body"></div>
    </div>

</template>

<script>

    import {} from '../local.js'; 
    import * as d3 from 'd3';

    const graphWindow = { width: 1200, height: 600 };

    const OBJ_LITERAL_CIRCLE_RADIUS = 8;
    const OBJ_LITERAL_CIRCLE_COLOR = 'yellow';

    const transMatrix = [1,0,0,1,0,0];

    String.prototype.visualWidth = function(textType) {
        const textHolder = document.getElementById(textType);
        textHolder.innerHTML = this;
        return textHolder.offsetWidth;
    }

    String.prototype.camelToSnake = function() {
        const str = this;
        return str[0].toLowerCase() + str.slice(1, str.length).replace(/[A-Z]/g, letter => ` ${letter.toLowerCase()}`);
    }

    export default {
        mixins: [],
        components: {
        },
        model: {
            //prop: 'value',
            //event: 'save'
        },
        props: {
            /*value: {
                type: Object,
                default: null
            },
            breadcrumb: {
                type: Array,
                default: () => []
            },
            mode: String,
            blankDesign: {
                type: Object,
                default: () => {}
            },
            mergeTags: Array*/
            map: {
                type: Array,
                default: () => []
            },
            value: {
                type: Object,
                default: () => {}
            }
        },
        data() {
            return {
            }
        },
        mounted() {
            this.initialize();
            this.setDataAndUpdate();
        },
        methods: {
            filterNodesById(nodes, id) {
                return nodes.filter(function(n) {
                    return n.id === id;
                });
            },
            filterNodesByType(nodes, value) {
                return nodes.filter(function(n) {
                    return n.type === value;
                });
            },
            constructBezierCurvePath(d) {
                const {
                    p1x,
                    p1y
                } = getBezierCurveQuadraticPointP1(d);
                return `M ${d.s.x},${d.s.y} Q ${p1x},${p1y} ${d.o.x},${d.o.y}`;
            },
            getBezierCurveMidPoint(d) {
                const {
                    p1x,
                    p1y
                } = getBezierCurveQuadraticPointP1(d);
                const p = [{
                        x: d.s.x,
                        y: d.s.y
                    },
                    {
                        x: p1x,
                        y: p1y
                    },
                    {
                        x: d.o.x,
                        y: d.o.y
                    }
                ];

                t = 0.5; // given example value
                x = (1 - t) * (1 - t) * p[0].x + 2 * (1 - t) * t * p[1].x + t * t * p[2].x;
                y = (1 - t) * (1 - t) * p[0].y + 2 * (1 - t) * t * p[1].y + t * t * p[2].y;
                return {
                    x: x,
                    y: y
                };
            },
            getBezierCurveQuadraticPointP1(d) {
                const bendFactor = 0.1;
                const incs = 3;
                const dx = d.o.x - d.s.x;
                const dy = d.o.y - d.s.y;
                const h = Math.sqrt(dx * dx + dy * dy);
                const nx = d.s.x + dx / 2;
                const ny = d.s.y + dy / 2;
                const nm = -dx / dy;
                const nmyS = Math.sign(-dx);
                const nmxS = Math.sign(dy);
                const dFNP = h * bendFactor * incs;
                //Math.sqrt(x^2 + y^2) = dFNP
                // x^2 + y^2 = dFNP^2
                //m = y/x => x = y/m
                //  y^2/m^2 + y^2 = dFNP^2
                // y^2*(1/m^2 + 1) = dFNP^2
                // y = Math.sqrt(dFNP^2/(1/m^2 + 1))
                // x = y/m
                const nyd = nmyS * Math.sqrt(dFNP * dFNP / (1 / (nm * nm) + 1));
                const nxd = nmxS * nyd / nm;
                ny2 = ny + nyd;
                nx2 = nx + nxd;
                return {
                    p1x: nx2,
                    p1y: ny2
                };
                //console.log("M2,2 Q8,2 8,8");
                //console.log(`dx: ${dx}, dy: ${dy}, h: ${h}, nx: ${nx}, ny: ${ny}, nm: ${nm}, nmyS: ${nmyS}, nmxS: ${nmxS}, dFNP: ${dFNP}`);
                //console.log(`nyd: ${nyd}, nxd: ${nxd}`);
                //console.log("M" + d.source.x + "," + d.source.y + " Q" + nx2 + "," + ny2 + " " + d.target.x + "," + d.target.y);
            },
            getIriMapPropValue(iri, prop) {
                const IRIComponents = iri.split("#");
                return this.map.filter(item => item.iriPfx === IRIComponents[0])[0][prop];

            },
            tripleComponentValue(tc) {
                if (tc.type === "uri") {
                    const IRIComponents = tc.value.split("#");
                    return getIriMapPropValue(tc.value, 'iriShortPfx') + ":" + IRIComponents[1];
                } else {
                    return tc.value;
                }
            },
            triplesToGraph(triples) {
                const graph = {
                    nodes: [],
                    links: [],
                    triples: []
                };

                //Initial Graph from triples
                triples.forEach(function(triple) {
                    const subjId = tripleComponentValue(triple.s);
                    const predId = tripleComponentValue(triple.p);
                    const objId = tripleComponentValue(triple.o);

                    let subjNode = filterNodesById(graph.nodes, subjId)[0];
                    let objNode = filterNodesById(graph.nodes, objId)[0];

                    if (subjNode == null) {
                        subjNode = { id: subjId, label: subjId.split(':')[0], weight: 1, type: "node", tripleType: "subject", color: getIriMapPropValue(triple.s.value, "color"), textColor: getIriMapPropValue(triple.s.value, "textColor"), radius: getIriMapPropValue(triple.s.value, "radius") };
                        graph.nodes.push(subjNode);
                    }

                    if (objNode == null) {
                        objNode = { id: objId, weight: 1, type: "node", tripleType: "object" };
                        //label: objId, 
                        if (triple.o.type === 'uri') {
                            objNode.label = objId.split(':')[0];
                            objNode.color = getIriMapPropValue(triple.o.value, "color");
                            objNode.textColor = getIriMapPropValue(triple.o.value, "textColor");
                            objNode.radius = getIriMapPropValue(triple.o.value, "radius");
                            objNode.tripleType += "-uri";
                        } else {
                            objNode.label = objId;
                            objNode.color = OBJ_LITERAL_CIRCLE_COLOR;
                            objNode.radius = OBJ_LITERAL_CIRCLE_RADIUS;
                            objNode.tripleType += "-literal";
                        }
                        graph.nodes.push(objNode);
                    }

                    const predNode = { id: predId, label: predId.split(':')[1].camelToSnake(), weight: 1, type: "pred", tripleType: "predicate", color: getIriMapPropValue(triple.p.value, "color"), textColor: getIriMapPropValue(triple.p.value, "textColor") };
                    graph.nodes.push(predNode);

                    const blankLabel = "";

                    graph.links.push({ source: subjNode, target: predNode, predicate: blankLabel, weight: 1 });
                    graph.links.push({ source: predNode, target: objNode, predicate: blankLabel, weight: 1 });

                    graph.triples.push({ s: subjNode, p: predNode, o: objNode });

                });
                console.log(graph);
                return graph;
            },
            pan(dx, dy) {
                transMatrix[4] += dx;
                transMatrix[5] += dy;

                newMatrix = "matrix(" +  transMatrix.join(' ') + ")";
                mapMatrixElement = document.getElementById("map-matrix")
                mapMatrixElement.setAttributeNS(null, "transform", newMatrix);
            },  
            zoom(scale) {
                for (var i=0; i<transMatrix.length; i++) {
                    transMatrix[i] *= scale;
                }
                transMatrix[4] += (1-scale)*graphWindow.width/2;
                transMatrix[5] += (1-scale)*graphWindow.height/2;

                newMatrix = "matrix(" +  transMatrix.join(' ') + ")";
                mapMatrixElement = document.getElementById("map-matrix")
                mapMatrixElement.setAttributeNS(null, "transform", newMatrix);
            },
            addControls() {

                const svg = d3.select("#svg-body").select("svg");

                svg.select("#controls").remove();
                const svgg = svg.append("svg:g").attr("id", "controls");

                svgg.append("svg:path")
                    .attr("class", "button")
                    .attr("onclick", "pan(0, 50)")
                    .attr("d", "M50 10 l12   20 a40, 70 0 0,0 -24,  0z");

                svgg.append("svg:path")
                    .attr("class", "button")
                    .attr("onclick", "pan(50, 0)")
                    .attr("d", "M10 50 l20  -12 a70, 40 0 0,0   0, 24z");

                svgg.append("svg:path")
                    .attr("class", "button")
                    .attr("onclick", "pan(0, -15)")
                    .attr("d", "M50 90 l12  -20 a40, 70 0 0,1 -24,  0z");

                svgg.append("svg:path")
                    .attr("class", "button")
                    .attr("onclick", "pan(-50, 0)")
                    .attr("d", "M90 50 l-20 -12 a70, 40 0 0,1   0, 24z");

                svgg.append("svg:circle")
                    .attr("class", "compass")
                    .attr("cx", "50")
                    .attr("cy", "50")
                    .attr("r", "20");

                svgg.append("svg:circle")
                    .attr("class", "button")
                    .attr("cx", "50")
                    .attr("cy", "41")
                    .attr("r", "8")
                    .attr("onclick", "zoom(0.8)");

                svgg.append("svg:circle")
                    .attr("class", "button")
                    .attr("cx", "50")
                    .attr("cy", "59")
                    .attr("r", "8")
                    .attr("onclick", "zoom(1.25)");

                svgg.append("svg:rect")
                    .attr("class", "plus-minus")
                    .attr("x", "46")
                    .attr("y", "39.5")
                    .attr("width", "8")
                    .attr("height", "3");

                svgg.append("svg:rect")
                    .attr("class", "plus-minus")
                    .attr("x", "46")
                    .attr("y", "57.5")
                    .attr("width", "8")
                    .attr("height", "3");

                svgg.append("svg:rect")
                    .attr("class", "plus-minus")
                    .attr("x", "48.5")
                    .attr("y", "55")
                    .attr("width", "3")
                    .attr("height", "8");
            },
            update(graph) {

                const svg = d3.select("#svg-body").select("svg");

                svg.select("#map-matrix").remove();
                const svgg = svg.append("svg:g").attr("id", "map-matrix")

                // ==================== Add Marker ====================
                svgg.append("svg:defs").selectAll("marker")
                    .data(["end"])
                    .enter().append("svg:marker")
                    .attr("id", String)
                    .attr("viewBox", "0 -5 10 10")
                    .attr("refX", 30)
                    .attr("refY", -0.5)
                    .attr("markerWidth", 6)
                    .attr("markerHeight", 6)
                    .attr("orient", "auto")
                    .append("svg:polyline")
                    .attr("points", "0,-5 10,0 0,5");

                const filter = svgg.select("defs").append("filter")
                    .attr("id", "text-bg")
                    .attr("x", 0)
                    .attr("y", 0)
                    .attr("width", 1)
                    .attr("height", 1);

                filter.append("feFlood")
                    .attr("flood-color", "white")
                    .attr("result", "bg")

                const feMerge = filter.append("feMerge");

                feMerge.append("feMergeNode")
                    .attr("in", "bg");

                feMerge.append("feMergeNode")
                    .attr("in", "SourceGraphic")

                // ==================== Add Links ====================
                const links = svgg.selectAll(".link")
                    .data(graph.triples)
                    .enter()
                    .append("path")
                    //.attr("marker-end", "url(#end)")
                    .attr("class", "link");

                // ==================== Add Link Names =====================
                const linkTexts = svgg.selectAll(".link-text")
                    .data(graph.triples)
                    .enter()
                    .append("text")
                    .attr("class", "link-text")
                    .attr("filter", "url(#text-bg)")
                    .text(function(d) {
                        return d.p.label;
                    });

                //linkTexts.append("title")
                //      .text(function(d) { return d.predicate; });

                // ==================== Add Node =====================
                const nodes = svgg.selectAll(".node")
                    .data(filterNodesByType(graph.nodes, "node"))
                    .enter()
                    .append("circle")
                    //.attr("class", "node")
                    .attr("class", "node")
                    .style("fill", function (d) {
                        //console.log(d);
                        return d.color;
                    })
                    .attr("r", function (d) { return d.radius; })
                    .call(force.drag); //nodes

                // ==================== Add Link Names =====================
                const nodeTexts = svgg.selectAll(".node-text")
                    .data(filterNodesByType(graph.nodes, "node"))
                    .enter()
                    .append("text")
                    .attr("class", "node-text")
                    .style('fill', function (d) { 
                        return d.textColor;
                    })
                    .text(function(d) {
                        return d.label;
                    });

                //nodeTexts.append("title")
                //      .text(function(d) { return d.label; });


                // ==================== Force ====================
                force.on("tick", function() {
                    nodes
                        .attr("cx", function(d) {
                            return d.x;
                        })
                        .attr("cy", function(d) {
                            return d.y;
                        });

                    links
                        .attr("d", function(d) {
                            /*return "M"    + d.s.x + "," + d.s.y
                                            + "S" + d.p.x + "," + d.p.y
                                            + " " + d.o.x + "," + d.o.y;*/
                            return constructBezierCurvePath(d);
                        });

                    nodeTexts
                        .attr("x", function(d) {
                            if (d.tripleType === 'object-literal') {
                                return d.x + 12;
                            } else {
                                const offset = d.label.visualWidth('text-length-holder-node') / 2;
                                return d.x - offset;
                            }
                        })
                        .attr("y", function(d) {
                            if (d.tripleType === 'object-literal') {
                                return d.y + 5;
                            } else {
                                return d.y + 3;
                            }
                        });


                    linkTexts
                        //.attr("x", function(d) { return 4 + (d.s.x + d.p.x + d.o.x)/3  ; })
                        //.attr("y", function(d) { return 4 + (d.s.y + d.p.y + d.o.y)/3 ; });
                        .attr("x", function(d) {
                            const offset = d.p.label.visualWidth('text-length-holder-pred') / 2;
                            const x = getBezierCurveMidPoint(d).x;
                            //console.log(`x: ${x}, offset: ${offset}`);
                            return x - offset;
                        })
                        .attr("y", function(d) {
                            return getBezierCurveMidPoint(d).y;
                        });
                });

                // ==================== Run ====================
                force
                    .nodes(graph.nodes)
                    .links(graph.links)
                    .charge(-500)
                    .linkDistance(50)
                    .start();

                addControls();
            },
            initialize() {
                const svg = d3.select("#svg-body").append("svg")
                    .attr("width", graphWindow.width)
                    .attr("height", graphWindow.height);

                //const svgg = svg.append("svg:g").attr("id", "map-matrix")

                const force = d3.layout.force().size([graphWindow.width, graphWindow.height]);
            },
            setDataAndUpdate() {
                const graph = triplesToGraph(this.value.results.bindings);

                //update(graph, svgg);
                update(graph);
            }
        },
        computed: {
        },
        watch: {
        }
    }

</script>

<style scoped>
    .node {
        stroke: #abcdef;
        /*fill:#ddd;*/
        stroke-width: 1.5px;
    }

    .link {
        fill: none;
        stroke: #999;
        stroke-opacity: .6;
    }

    marker {
        stroke: #999;
        fill:rgba(124,240,10,0);
    }

    .node-text {
        font: 12px sans-serif;
        /*fill:black;*/
    }

    .link-text {
        font: 11px sans-serif;
        fill:grey;
    }

    svg{
        border:1px solid black;
    }

    span#text-length-holder-pred {
        position: absolute;
        top: -20px;
        left: 10px;
    }

    span#text-length-holder-node {
        position: absolute;
        top: -20px;
        left: 10px;
    }

    .compass{
        fill:   #fff;
        stroke: #000;
        stroke-width:   1.5;
    }

    .button{
        fill: #225EA8;
        stroke: #0C2C84;
        stroke-miterlimit: 6;
        stroke-linecap: round;
    }

    .button:hover{
        stroke-width: 2;
    }

    .plus-minus{
        fill:   #fff;
        pointer-events: none;
    }
</style>