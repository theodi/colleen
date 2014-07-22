var ZN = ZN || { };
ZN.ProjectGraph = function () {

    this.app = null;
    this.model = null;

}

ZN.ProjectGraph.prototype = {
    constructor:ZN.ProjectGraph,

    init:function(app,model){
        this.app = app;
        this.model = model;

    },


    csvToArray: function(csvString){
        // The array we're going to build
        var csvArray   = [];
        // Break it into rows to start
        var csvRows    = csvString.split(/\n/);
        // Take off the first line to get the headers, then split that into an array
        var csvHeaders = csvRows.shift().split(',');

        // Loop through remaining rows
        for(var rowIndex = 0; rowIndex < csvRows.length; rowIndex++){
            var rowStr = csvRows[rowIndex];
            var rowArray  = rowStr.split(',');
            _.each(rowArray,function(str){
                str =   str.replace(/^"|"$/g,''); // strip quotes from beginning and end
            });

            csvArray.push(rowArray);
        }

        return csvArray;
    },

    getNodesFromEdges: function(edges){
        var nodes = [];
        _.each(edges,function(edge){
            _.each(edge,function(node){
                if(_.indexOf(nodes,node)==-1){
                    nodes.push(node);
                }
            })
        });
        return nodes;

    },

    createSpringyGraphFromEdgeCSV: function(csvStr){
        var edges = this.csvToArray(csvStr);
        var nodes = this.getNodesFromEdges(edges);
        var graph = new Springy.Graph();

        var graphJSON = {
            "nodes": nodes,
            "edges": edges
        };

        graph.loadJSON(graphJSON);
        //graph.addNodes(nodes);
        //graph.addEdges(edges);
        return graph;

    },

    createSpringyGraph: function(data){

        var graph = this.createSpringyGraphFromEdgeCSV(data);
        var params = {
            graph: graph,
            stiffness: 10,
            repulsion: 400,
            damping: 0.3 // 0.5
        };
        this.initSpringyGraph(params);
    },


    initSpringyGraph: function(params){

        var graph = this.graph = params.graph || new Springy.Graph();
        var stiffness = params.stiffness || 400.0;
        var repulsion = params.repulsion || 400.0;
        var damping = params.damping || 0.5;
        var minEnergyThreshold = params.minEnergyThreshold || 0.00001;

        var canvasW = ZN.config.assetBB.width;
        var canvasH = ZN.config.assetBB.height;

        var layout = this.layout = new Springy.Layout.ForceDirected(graph, stiffness, repulsion, damping, minEnergyThreshold);

        // calculate bounding box of graph layout.. with ease-in
        var currentBB = layout.getBoundingBox();
        var targetBB = {bottomleft: new Springy.Vector(-2, -2), topright: new Springy.Vector(2, 2)};

        // auto adjusting bounding box
        Springy.requestAnimationFrame(function adjust() {
            targetBB = layout.getBoundingBox();
            // current gets 20% closer to target every iteration
            currentBB = {
                bottomleft: currentBB.bottomleft.add( targetBB.bottomleft.subtract(currentBB.bottomleft)
                    .divide(10)),
                topright: currentBB.topright.add( targetBB.topright.subtract(currentBB.topright)
                    .divide(10))
            };

            Springy.requestAnimationFrame(adjust);
        });

        // convert to/from screen coordinates
        var toScreen = function(p) {
            var size = currentBB.topright.subtract(currentBB.bottomleft);
            var sx = p.subtract(currentBB.bottomleft).divide(size.x).x * canvasW;
            var sy = p.subtract(currentBB.bottomleft).divide(size.y).y * canvasH;
            return new Springy.Vector(sx, sy);
        };

        var fromScreen = function(s) {
            var size = currentBB.topright.subtract(currentBB.bottomleft);
            var px = (s.x / canvasW) * size.x + currentBB.bottomleft.x;
            var py = (s.y / canvasH) * size.y + currentBB.bottomleft.y;
            return new Springy.Vector(px, py);
        };

        var renderer = this.renderer = new Springy.Renderer(layout,
            function clear() {
                //ctx.clearRect(0,0,canvasW,canvasH);
            },
            function drawEdge(edge, p1, p2) {
                var x1 = toScreen(p1).x;
                var y1 = toScreen(p1).y;
                var x2 = toScreen(p2).x;
                var y2 = toScreen(p2).y;
                /*
                var direction = new Springy.Vector(x2-x1, y2-y1);
                var normal = direction.normal().normalise();

                var from = graph.getEdges(edge.source, edge.target);
                var to = graph.getEdges(edge.target, edge.source);
                */
            },
            function drawNode(node, p) {
                var s = toScreen(p);

            }
        );

        renderer.start();
    },



    createD3GraphFromEdgeCSV: function(csvStr){


        var edgeNames = this.csvToArray(csvStr);
        var nodeNames = this.getNodesFromEdges(edgeNames);

        var nodes = [], edges = [];
        var nodesObj = {};
        for(var i=0;i<nodeNames.length;i++){
            var nodeName = nodeNames[i];
            nodes.push({name:nodeName,group:0})
            nodesObj[nodeName] = i;

        }

        for(i=0;i<edgeNames.length;i++){
            var nodeA = edgeNames[i][0];
            var nodeB = edgeNames[i][1];
            var nodeIdA = nodesObj[nodeA];
            var nodeIdB = nodesObj[nodeB];
            edges.push({source:nodeIdA,target:nodeIdB})


        }



        var json = {
            "nodes": nodes,
            "links": edges
        };

        var linkDistance = 30; // 30;
        var charge = -100; // -120

        var w = 480;//960,
            h = 260;//520,
            fill = d3.scale.category20();

        var vis = d3.select("#chart")
            .append("svg:svg")
            .attr("width", w)
            .attr("height", h);


        var force = d3.layout.force()
            .charge(charge)
            .linkDistance(linkDistance)
            .nodes(json.nodes)
            .links(json.links)
            .size([w, h])
            .start();

        var link = vis.selectAll("line.link")
            .data(json.links)
            .enter().append("svg:line")
            .attr("class", "link")
            .style("stroke-width", function(d) { return Math.sqrt(d.value); })
            .attr("x1", function(d) { return d.source.x; })
            .attr("y1", function(d) { return d.source.y; })
            .attr("x2", function(d) { return d.target.x; })
            .attr("y2", function(d) { return d.target.y; });

        var node = vis.selectAll("circle.node")
            .data(json.nodes)
            .enter().append("svg:circle")
            .attr("class", "node")
            .attr("cx", function(d) { return d.x; })
            .attr("cy", function(d) { return d.y; })
            .attr("r", 5)
            .style("fill", function(d) { return fill(d.group); })
            .call(force.drag);

        node.append("svg:title")
            .text(function(d) { return d.name; });

        vis.style("opacity", 1e-6)
            .transition()
            .duration(1000)
            .style("opacity", 1);

        force.on("tick", function() {
            link.attr("x1", function(d) { return d.source.x; })
                .attr("y1", function(d) { return d.source.y; })
                .attr("x2", function(d) { return d.target.x; })
                .attr("y2", function(d) { return d.target.y; });

            node.attr("cx", function(d) { return d.x; })
                .attr("cy", function(d) { return d.y; });
        });

    }
}