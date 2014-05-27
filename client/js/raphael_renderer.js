ZN.RaphaelRenderer = function () {

    this.app = null;
    this.model = null;
    this.containerId = "canvas-container";
    this.paper = null;
    this.paths = [];


}

ZN.RaphaelRenderer.prototype = {
    constructor:ZN.RaphaelRenderer,

    init:function(app,model,containerId){
        this.app = app;
        this.model = model;
        this.containerId = containerId;

        var size = this.getCanvasSize();
        var w = size.width, h = size.height;
        this.paper = Raphael(this.containerId, w, h);

    },

    getCanvasSize: function(){
        var size={};
        size.width = $("#"+this.containerId).width();
        size.height = $("#"+this.containerId).height();
        return size;
    },

    render:function(){

        // animations: http://raphaeljs.com/animation.html
        // scale image fill: http://stackoverflow.com/questions/1098994/scaling-a-fill-pattern-in-raphael-js
        // svg import: https://github.com/wout/raphael-svg-import
        var csz = this.getCanvasSize();
        var cx = csz.width/ 2, cy = csz.height/2;

        var projects = this.model.projects;
        //var projects = [this.model.projects[0]];

        _.each(projects,function(project,index){

            var ps = project.scale;
            if(index==1) ps = 0.1
            var px = project.x+cx, py = project.y+cy
                pr = project.rotation;

            _.each(project.shapes,function(shape){


                if(!shape.path){
                    shape.path = this.paper.path(shape.d);
                }
                if(!shape.boundsPath){
                    shape.boundsPath = this.paper.rect( shape.bounds.left, shape.bounds.top, shape.bounds.width(), shape.bounds.height() );


                }
                var path = shape.path;
                var tx= shape.x,ty=shape.y;


                shape.path.attr({"fill":shape.colour,"stroke-width":0}).attr('opacity',shape.opacity).transform("t"+tx+","+ty+"r"+shape.rotation);

                shape.boundsPath.attr({
                    'stroke': 'rgba(255,0,0,0.5)',
                    'stroke-width': 1
                });

                var trans = "t"+px+","+py+"r"+pr+",0,0"+"s"+ps+","+ps+",0,0...";
                shape.path.transform(trans);

                shape.boundsPath.transform("t"+px+","+py+"r"+pr+",0,0"+"s"+ps+","+ps+",0,0");

            },this);

        },this);



    },

    projectToFront:function(project){

        var nShapes = project.shapes.length;
        for(var i=nShapes-1;i>=0;i--){
            project.shapes[i].path.toFront();
        }

    }

}

