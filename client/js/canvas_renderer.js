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


        var projects = this.model.projects;


        _.each(projects,function(project,index){

            var ps = project.scale;

            var px = project.x+cx, py = project.y+cy,
                pr = project.rotation;

            // project transform
            this.ctx.save();
            this.ctx.translate(px,py);
            this.ctx.rotate(pr*Math.PI/180);
            this.ctx.scale(ps,ps);

            _.each(project.shapes,function(shape,ind){

                var path = shape.path;
                var tx= shape.x,ty=shape.y;
                var sx= shape.sx,sy=shape.sy;

                if(ind==0 && project.name=="galaxy_zoo"){
                    //console.log('x,y',tx,ty);
                }

                // Store project transform
                this.ctx.save();
                // Shape transform
                this.ctx.translate(tx,ty);
                this.ctx.rotate(shape.rotation*Math.PI/180);
                this.ctx.scale(sx,sy);

                this.ctx.beginPath();

                var segsAbs = Snap.path.toAbsolute(shape.d);

                var x, y;
                _.each(segsAbs,function(seg){
                    switch(seg[0]){
                        case "M":
                            this.ctx.moveTo(seg[1],seg[2]);
                            break;
                        case "C":
                            this.ctx.bezierCurveTo(seg[1],seg[2],seg[3],seg[4],seg[5],seg[6]);
                            break;
                    };

                },this);

                this.ctx.fillStyle = shape.fill;
                this.ctx.fill();

                // Restore to project transform
                this.ctx.restore();

            },this);

            this.ctx.restore();

        },this);

    },

    projectToFront:function(project){


    }

}

