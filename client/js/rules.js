ZN.Rules = function () {

    this.app = null;
    this.model = null;
    this.frameTime = 0;

}

ZN.Rules.prototype = {
    constructor:ZN.Rules,

    init:function(app,model){
        this.app = app;
        this.model = model;

    },

    update: function(frameTime){

        this.frameTime = frameTime;
        var projects = this.model.projects;
        var intervals = this.model.intervals;

        _.each(projects,function(project,index){

            // project rules
            //project.rotation = (project.rotation+1)%360;

            _.each(project.shapes,function(shape,ind){

                // shape trails

                /*
                 _.each(shape.trail.shapes,function(trailShape,si){

                 trailShape.opacity *=0.985;//(trailShape);


                 },this);

                 _.remove(shape.trail.shapes, function(trailShape) {
                 return trailShape.opacity < 0.05;
                 });


                 if(typeof shape.parentId==="undefined"){
                 shape.x -=0.3;
                 for(var c=0;c<shape.children.length;c++){
                 //shape.children[c].x-=0.3;
                 }
                 }
                 */

                if(project.animation){
                    _.each(project.animation,function(anim){
                        switch(anim.type){
                            case "rotate_data":
                                this.rotateData(project, project,anim);
                                break;

                            case "scale_data":
                                this.scaleData(project, project,anim);
                                break;
                        }
                    },this);
                }
                // shape rules

                if(shape.animation){
                    _.each(shape.animation,function(anim){

                        switch(anim.type){

                            case "rotate_data":
                                this.rotateData(project,shape,anim);
                                break;

                            case "scale_data":
                                this.scaleData(project,shape,anim);
                                break;

                            case "translate_circular":
                                var r = anim.radius;

                                if(parseInt(anim.angle)%5 ==0){
                                    if(project.name=='galaxy_zoo' && ind==6){
                                        //console.log('anim x,y',shape.x,shape.y);
                                        //shape.addTrailShape();
                                    }
                                    //shape.addTrailShape();

                                }

                                // speed
                                var speedRnd = (anim.speed[1]-anim.speed[0])*10.0/frameTime;
                                var speedMin = anim.speed[0]*10.0/frameTime;
                                anim.angle = (anim.angle+Math.random()*speedRnd+speedMin);

                                if(anim.angle>360){
                                    anim.angle %= 360;

                                }


                                // set radius
                                var ry = r;//shape.bounds.height()/2-shape.height/2;
                                var rx = r;//shape.bounds.width()/2-shape.width/2;
                                var rad = (Math.PI / 180)*anim.angle;

                                // position
                                var x = rx * Math.cos(rad);
                                var y = ry * Math.sin(rad);
                                shape.x = shape.initial.x +x;
                                shape.y = shape.initial.y +y;



                                break;

                            case "scale":

                                //anim.time = (anim.time+frameTime/1000)%anim.duration[0];
                                anim.time = (anim.time+frameTime/1000);
                                if(!anim.data){
                                    anim.data=1.0;
                                }

                                if(anim.time>anim.duration[0]) {
                                    anim.time = -Math.random()*2 -0.5;
                                    anim.data= Math.random()*0.7+0.3;

                                }
                                if(anim.time>0){
                                    var n = anim.time/anim.duration[0];
                                    n = n>0.5?1-n:n;
                                    n*=2;
                                    var sx = anim.x[0]+ (anim.x[1]-anim.x[0])*n;
                                    var sy = anim.y[0]+ (anim.y[1]-anim.y[0])*n;
                                    shape.sx = sx*anim.data;
                                    shape.sy = sy*anim.data;
                                }

                                break;




                            case "translate_bounce_bounds":

                                if(shape.x+shape.vx > shape.bounds.right) shape.vx*=-1;
                                if(shape.x+shape.vx < shape.bounds.left) shape.vx*=-1;

                                if(shape.y+shape.vy > shape.bounds.bottom) shape.vy*=-1;
                                if(shape.y+shape.vy < shape.bounds.top) shape.vy*=-1;

                                shape.x+=shape.vx;
                                shape.y+=shape.vy;

                                break;

                            case "translate_linear":
                            /*
                             var r = anim.radius;

                             // speed
                             var speedRnd = anim.speed[1]-anim.speed[0];
                             var speedMin = anim.speed[0];
                             anim.angle = (anim.angle+Math.random()*speedRnd+speedMin)%360;

                             // set radius
                             var ry = shape.bounds.height()/2-shape.height/2;
                             var rx = shape.bounds.width()/2-shape.width/2;
                             var rad = (Math.PI / 180)*anim.angle;

                             // position
                             var x = rx * Math.cos(rad);
                             var y = ry * Math.sin(rad);
                             shape.x = shape.initial.x +x;
                             shape.y = shape.initial.y +y;


                             break;
                             */
                        }


                    },this);
                }




            },this);

        },this);
    },

    updateAnimTime:function(anim,duration){
        var frameTime = this.frameTime;
        anim.time = (anim.time+frameTime/1000);
        if(anim.time>duration) {
            anim.time -=duration;

        }
    },

    getSeriesValue: function(project, obj, anim){
        var duration = obj.duration;
        var interval = this.model.intervals[anim.data];
        var dataType = 'c';
        if(anim.dataType){
            type = anim.dataType;
        }
        // project data series and max value
        var series = project.timeseries[dataType][interval].series;
        var valueMax = project.timeseries[dataType][interval].max;


        var seriesIndex = anim.time*series.length/duration;
        // get value in series corresponding to current time
        var valueA = series[Math.floor(seriesIndex)];
        var valueB = series[Math.ceil(seriesIndex)];

        var tween = "id", n=0;
        if(anim.tween){
            tween = anim.tween;
        }
        switch(tween){
            case "id":
                n = valueA/valueMax;
                break;
            case "linear":
                var tn = seriesIndex -Math.floor(seriesIndex);
                n = (valueA + (valueB-valueA)*tn)/valueMax;
                break;
        }

        var fn = "id";
        if(anim.fn){
            fn = anim.fn;
        }
        switch(fn){
            case "id":
                // no function
                break;
            case "sqrt":
                n = Math.sqrt(n*valueMax)/Math.sqrt(valueMax);
                break;
        }


        return n;
    },

    rotateData: function(project, obj, anim){
        obj.duration = anim.duration[0];

        this.updateAnimTime(anim,obj.duration);
        var n = this.getSeriesValue(project, obj, anim);

        var rot = anim.rotation[0]+ (anim.rotation[1]-anim.rotation[0])*n;
        obj.rotation = rot;

    },

    scaleData: function(project, obj, anim){

        obj.duration = anim.duration[0];

        this.updateAnimTime(anim,obj.duration);
        var n = this.getSeriesValue(project, obj, anim);

        // set scale values from anim rule range and normalised value
        var sx = anim.x[0]+ (anim.x[1]-anim.x[0])*n;
        var sy = anim.y[0]+ (anim.y[1]-anim.y[0])*n;
        obj.sx = sx;
        obj.sy = sy;

    },

    opacityData: function(project, obj, anim){

        obj.duration = anim.duration[0];

        this.updateAnimTime(anim,obj.duration);
        var n = this.getSeriesValue(project, obj, anim);

        // set scale values from anim rule range and normalised value
        var sx = anim.x[0]+ (anim.x[1]-anim.x[0])*n;
        var sy = anim.y[0]+ (anim.y[1]-anim.y[0])*n;
        obj.sx = sx;
        obj.sy = sy;

    },

    /*
     cx, cy = rotation center
     x,y = current x,y
     nx, ny = new coordinates
     */
    rotateAroundPoint: function (cx, cy, x, y, angle) {
        var radians = (Math.PI / 180) * angle,
            cos = Math.cos(radians),
            sin = Math.sin(radians),
            nx = (cos * (x - cx)) - (sin * (y - cy)) + cx,
            ny = (sin * (x - cx)) + (cos * (y - cy)) + cy;
        return [nx, ny];
    }

}
