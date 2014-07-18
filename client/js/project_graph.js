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
        //var csvHeaders = csvRows.shift().split(';');

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