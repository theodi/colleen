var ZN = ZN || { };
ZN.ProjectGraph = function () {

    this.app = null;
    this.model = null;
    this.layout = null;
    this.projectPoints = {};
    this.currentBB = null;
    this.targetBB = null;

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
            stiffness: 50, // 10
            repulsion: 400,
            damping: 0.2 // 0.5
        };
        this.initSpringyGraph(params);
    },


    initSpringyGraph: function(params){

        var graph = this.graph = params.graph || new Springy.Graph();
        var stiffness = params.stiffness || 400.0;
        var repulsion = params.repulsion || 400.0;
        var damping = params.damping || 0.5;
        var minEnergyThreshold = params.minEnergyThreshold || 0.00001;

        var layout = this.layout = new Springy.Layout.ForceDirected(graph, stiffness, repulsion, damping, minEnergyThreshold);
        layout._stop = false;

        this.currentBB = layout.getBoundingBox();
        this.targetBB = {bottomleft: new Springy.Vector(-2, -2), topright: new Springy.Vector(2, 2)};


    },


    start: function(){


        var canvasW = ZN.Config.assetBB.width;
        var canvasH = ZN.Config.assetBB.height;

        var layout = this.layout;

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

        var t = this;
        this.layout.start(function render() {
            //t.clear();
            var str= "";

            t.layout.eachNode(function(node, point) {
                //t.drawNode(node, point.p);

                var s = toScreen(point.p);
                str+= s.x+","+s.y+"<br> ";
                t.projectPoints[node.id] = {x:s.x-canvasW/2, y:s.y-canvasH/2};
            });
            str+="<br>currentBB"+ currentBB.bottomleft.x +", "+currentBB.bottomleft.y;



            $("#diagnostics").html(str);

        });



    },


    update: function(){

        var self = this;

        var layout = this.layout;
        if(layout._stop) return;

        var canvasW = ZN.Config.assetBB.width;
        var canvasH = ZN.Config.assetBB.height;

        // auto-adjust bounding box;

        targetBB = layout.getBoundingBox();
        // current gets 20% closer to target every iteration
        this.currentBB = {
            bottomleft: this.currentBB.bottomleft.add( targetBB.bottomleft.subtract(this.currentBB.bottomleft)
                .divide(10)),
            topright: this.currentBB.topright.add( targetBB.topright.subtract(this.currentBB.topright)
                .divide(10))
        };


        // simulation
        layout.tick(0.03);

        var str= "";

        layout.eachNode(function(node, point) {

            var p = point.p;
            var size = self.currentBB.topright.subtract(self.currentBB.bottomleft);
            var sx = p.subtract(self.currentBB.bottomleft).divide(size.x).x * canvasW;
            var sy = p.subtract(self.currentBB.bottomleft).divide(size.y).y * canvasH;
            var s = new Springy.Vector(sx, sy);

            //str+= s.x+","+s.y+"<br> ";
            self.projectPoints[node.id] = {x:s.x-canvasW/2, y:s.y-canvasH/2};
        });
        //str+="<br>currentBB"+ this.currentBB.bottomleft.x +", "+this.currentBB.bottomleft.y;
        //$("#diagnostics").html(str);

        // stop simulation when energy of the system goes below a threshold
        if (layout.totalEnergy() < layout.minEnergyThreshold) {
            layout._stop = true;

        }


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