ZN.CanvasRenderer = function () {

    this.app = null;
    this.model = null;
    this.containerId = "canvas-container";
    this.ctx = null;
    this.bgCtx = null;
    this.showBB = false;
    this.bgImage=null;


}

ZN.CanvasRenderer.prototype = {
    constructor:ZN.CanvasRenderer,

    init:function(app,model,containerId){
        this.app = app;
        this.model = model;
        this.containerId = containerId;

        var bgCanvas = document.createElement('canvas');
        bgCanvas.id     = "CanvasBg";
        $("#"+this.containerId).append(bgCanvas);
        this.bgCtx = bgCanvas.getContext('2d');

        var canvas = document.createElement('canvas');
        canvas.id     = "CanvasLayer";
        $("#"+this.containerId).append(canvas);
        this.ctx = canvas.getContext('2d');

        this.bgImage = new Image();

        var self = this;
        this.bgImage.onload = function() {
            self.resize();
        };
        this.bgImage.src = 'images/patina_test.jpg';


    },

    resize:function(){

        var size = this.getCanvasSize();
        var w = size.width, h = size.height;
        this.ctx.canvas.width  = w;
        this.ctx.canvas.height = h;

        this.bgCtx.canvas.width  = w;
        this.bgCtx.canvas.height = h;

        if(this.bgImage){
            this.bgCtx.drawImage(this.bgImage,0,0,w,h);
        }
    },

    getCanvasSize: function(){
        var size={};
        size.width = $("#"+this.containerId).width();
        size.height = $("#"+this.containerId).height();
        return size;
    },

    render:function(){

        var csz = this.getCanvasSize();
        var cx = csz.width/ 2, cy = csz.height/2;

        // Store the current transformation matrix
        this.ctx.save();

        // Use the identity matrix while clearing the canvas
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        this.ctx.clearRect(0, 0, csz.width, csz.height);

        // Restore the transform
        this.ctx.restore();

        // scale scene to window width
        var scx = ZN.Config.assetBB.width,
            scy = ZN.Config.assetBB.height;

        var scale = csz.width/scx;
        this.ctx.setTransform(scale, 0, 0, scale, cx, cy);

        var projects = this.model.projects.slice(0);

        // move focus project to back of list
        var fp = this.model.focusProject;
        if(fp){
            var index = _.indexOf(this.model.focusProject,fp);
            projects.splice(index,1);
            projects.push(fp);
        }

        _.each(projects,function(project,index){

            var psx = project.sx, psy = project.sy;

            //var px = project.x+cx, py = project.y+cy,
            var px = project.x, py = project.y,
                pr = project.rotation;

            // project transform
            this.ctx.save();
            this.ctx.translate(px,py);
            this.ctx.rotate(pr*Math.PI/180);
            this.ctx.scale(psx,psy);

            _.each(project.shapes,function(shape,ind){

                _.each(shape.trail.shapes,function(trailShape,si){

                    this.renderShape(project,trailShape);

                },this);

                if(typeof shape.parentId === "undefined"){
                    this.renderShape(project,shape);
                }

            },this);

            this.ctx.restore();

        },this);

    },

    renderShape: function(project,shape){

        // Store project transform
        this.ctx.save();
        //console.log("ctx.save");
        // Shape transform
        this.ctx.translate(shape.x,shape.y);
        this.ctx.rotate(shape.rotation*Math.PI/180);
        this.ctx.scale(shape.sx,shape.sy);

        this.ctx.beginPath();

        var segsAbs = Snap.path.toAbsolute(shape.d);

        var x, y;

        for(var s=0;s<segsAbs.length;s++){
            var seg = segsAbs[s];
            switch(seg[0]){
                case "M":
                    this.ctx.moveTo(seg[1],seg[2]);
                    break;
                case "C":
                    this.ctx.bezierCurveTo(seg[1],seg[2],seg[3],seg[4],seg[5],seg[6]);
                    break;
                case "L":
                    this.ctx.lineTo(seg[1],seg[2]);
                    break;
            };
        }


        this.ctx.fillStyle = chroma(shape.fill).alpha(shape.opacity*project.opacity).css();

        this.ctx.fill();


        // rectangle shape bounds

        /*
        this.ctx.rect(-shape.width/2,-shape.height/2,shape.width,shape.height);
        this.ctx.lineWidth = 1;
        this.ctx.strokeStyle = 'black';
        this.ctx.stroke();
        */

        for(var c=0;c<shape.children.length;c++){
            var childShape = shape.children[c];
            //console.log("childShape",childShape.x,childShape.y,childShape.fill,childShape.width,childShape.height);
            this.renderShape(project,childShape);

        }

        // Restore to project transform
        //console.log("ctx.restore");
        this.ctx.restore();


    },

    projectToFront:function(project){


    }

}

