ZN.Rules = function () {

    this.app = null;
    this.model = null;
    this.frameTime = 0;
    this.transitionAnim = null;

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
        var SECS = this.model.SECS;

        if(this.app.runProjectGraph){
            this.updateFocusProject();
        }
        var focusProject = this.model.focusProject;
        var lfp = this.model.lastFocusProject;

        var projectPoints = this.model.projectGraph.projectPoints;

        _.each(projects,function(project,index){

            // project rules

            if(this.app.runProjectGraph && project!=focusProject && project!=lfp){

                this.scaleRule(project,project,project.bgScaleAnim);
                var pt = projectPoints[project.name];
                if(pt){
                    project.x = pt.x;
                    project.y = pt.y;
                    //project.sx = 0.05;
                    //project.sy = 0.05;
                }

                project.opacity = 0.05;
            }
            else{
                project.opacity = 1.0;
            }



            if(project.animation){
                _.each(project.animation,function(anim){
                    switch(anim.type){
                        case "rotate":
                            this.rotateRule(project, project,anim);
                            break;

                        case "scale":
                            this.scaleRule(project, project,anim);
                            break;

                    }
                },this);
            }



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


                // shape rules

                if(shape.animation){
                    _.each(shape.animation,function(anim){

                        switch(anim.type){

                            case "translate":
                                this.translateRule(project,shape,anim);
                                break;

                            case "rotate":
                                this.rotateRule(project,shape,anim);
                                break;

                            case "scale":
                                this.scaleRule(project,shape,anim);
                                break;

                            case "opacity":
                                this.opacityRule(project,shape,anim);
                                break;

                            case "colour":
                                this.colourRule(project,shape,anim);
                                break;

                            case "circle":
                                this.circleRule(project,shape,anim);
                                break;



                            case "translate_circular_rnd":
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

                            case "scale_rnd":

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


    updateAnimTime:function(anim){

        var endLoop = false;
        var frameTime = this.frameTime;
        anim.time = (anim.time+frameTime/1000);
        if(anim.time>=anim.curDuration) {
            anim.time -=anim.curDuration;
            anim.loop+=1;
            endLoop = true;

        }
        return endLoop;

    },

    getDuration:function(project,anim){

        var duration = anim.duration[0];
        if(anim.duration_data){


            var dataType = 'c';
            if(anim.dataType){
                type = anim.dataType;
            }

            var dataStr = anim.duration_data.toUpperCase();
            var interval = this.model.SECS[dataStr];
            var series = project.timeseries[dataType][interval].series;
            anim.loop %= series.length;

            var valueMax = project.timeseries[dataType][interval].max;
            var seriesIndex = anim.loop*series.length/series.length;

            var value = series[Math.floor(seriesIndex)];
            var n = value/valueMax;
            duration = anim.duration[0]+ (anim.duration[1]-anim.duration[0])*n;
            anim.curDuration = duration;

        }
        else{

            anim.loop = 0;
        }

        return duration;
    },



    getSeriesValue: function(project, obj, anim){
        var duration = anim.curDuration;
        var dataStr = anim.data.toUpperCase();
        var interval = this.model.SECS[dataStr];
        var dataType = 'c';
        if(anim.dataType){
            type = anim.dataType;
        }
        // project data series and max value
        var series = project.timeseries[dataType][interval].series;
        if(anim.series_len){
            series = (project.timeseries[dataType][interval].series).slice(series.length-anim.series_len);
        }

        var valueMax = project.timeseries[dataType][interval].max;


        var seriesIndex = anim.time*series.length/duration;
        // get value in series corresponding to current time
        var valueA = series[Math.floor(seriesIndex)];
        var valueB = series[Math.ceil(seriesIndex)%series.length];

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

    getNextSeriesValue: function(project, obj, anim){

        var endLoop = this.updateAnimTime(anim);
        if(endLoop){
            var duration = this.getDuration(project,anim);
        }

        var n = this.getSeriesValue(project, obj, anim);
        return n;

    },

    translateRule: function(project, obj, anim){

        var n = this.getNextSeriesValue(project, obj, anim);

        var x=0,y=0;
        switch(anim.dir){
            case "x":
                x = anim.range[0]+ (anim.range[1]-anim.range[0])*n;
                break;
            case "y":
                y = anim.range[0]+ (anim.range[1]-anim.range[0])*n;
                break;

        }

        obj.x = obj.initial.x +x;
        obj.y = obj.initial.y +y;

    },


    rotateRule: function(project, obj, anim){

        var n = this.getNextSeriesValue(project, obj, anim);

        var rot = anim.rotation[0]+ (anim.rotation[1]-anim.rotation[0])*n;
        obj.rotation = rot;

    },

    scaleRule: function(project, obj, anim){

        var n = this.getNextSeriesValue(project, obj, anim);

        // set scale values from anim rule range and normalised value
        var sx = anim.sx[0]+ (anim.sx[1]-anim.sx[0])*n;
        var sy = anim.sy[0]+ (anim.sy[1]-anim.sy[0])*n;
        obj.sx = sx;
        obj.sy = sy;

    },

    opacityRule: function(project, obj, anim){

        var n = this.getNextSeriesValue(project, obj, anim);

        // set scale values from anim rule range and normalised value
        var op = anim.range[0]+ (anim.range[1]-anim.range[0])*n;

        obj.opacity = op;


    },

    colourRule: function(project, obj, anim){


        var n = this.getNextSeriesValue(project, obj, anim);

        var fillScale = chroma.scale(anim.fills);


        // set scale values from anim rule range and normalised value
        var col = anim.range[0]+ (anim.range[1]-anim.range[0])*n;
        obj.fill = fillScale(col).hex();


    },

    circleRule:function(project, obj, anim){


        var n = this.getNextSeriesValue(project, obj, anim);

        var r = anim.radius;

        var incDegrees = anim.deg_per_sec[0]+ (anim.deg_per_sec[1]-anim.deg_per_sec[0])*n;
        incDegrees *= this.frameTime/1000;

        if(isNaN(incDegrees)){//(isNaN(anim.angle)){
            return;
        }
        anim.angle += incDegrees;

        if(anim.angle>=360){
            anim.angle -= 360;

        }

        // set radius
        var ry = r;
        var rx = r;
        var rad = (Math.PI / 180)*anim.angle;

        // position
        var x = rx * Math.cos(rad);
        var y = ry * Math.sin(rad);
        obj.x = obj.initial.x +x;
        obj.y = obj.initial.y +y;

    },


    // Project rules

    updateFocusProject: function(){

        if(this.app.curTime>this.model.lastChangeFocus+this.model.changeFocusTime){
            this.setFocusProject();


        }



    },

    setFocusProject: function(){

        var fp = this.model.focusProject;

        if(fp!=null){
            //fp.setPropsFromBackground();
            this.model.lastFocusProject = fp;
        }

        this.model.lastChangeFocus = (new Date()).valueOf();
        this.model.changeFocusTime = (Math.random()*5+5)*1000;

        //var project = this.model.projects[parseInt(Math.random()*this.model.projects.length)];
        //var scale = 0.5;
        var projectIndex = this.model.focusList[this.model.focusIndex];
        var project = this.model.projects[projectIndex];
        this.model.focusIndex = (this.model.focusIndex+1)%this.model.focusList.length;


        this.model.focusProject = project;

        //project.setFocus({x:0,y:0,sx:scale,sy:scale});

        var self = this;

        var obj = {
            t: 0.0
        };

        var focusScale = 0.8;
        fp = this.model.focusProject; // scale to foreground
        var lfp = this.model.lastFocusProject; // scale to background
        var initFP = {x:fp.x, y:fp.y, sx:fp.sx, sy:fp.sy};
        var targetFP = {x:0, y:0, sx:focusScale,sy:focusScale};
        var initLFP = {x:0,y:0,sx:focusScale,sy:focusScale};//{x:lfp.x, y:lfp.y};

        if(this.transitionAnim){
            this.transitionAnim.stop();
        }

        this.transitionAnim = $(obj).animate({
            t: 1.0
        }, {
            duration: 1500,
            easing: 'linear',
            step: function(t) {

                var x, y,sx,sy;

                if(lfp){
                    var projectPoints = self.model.projectGraph.projectPoints;
                    self.scaleRule(lfp,lfp,lfp.bgScaleAnim);
                    var pt =projectPoints[lfp.name];
                    var targetLFP = {x:pt.x,y:pt.y,sx:lfp.sx,sy:lfp.sy};

                    lfp.x = initLFP.x+(targetLFP.x-initLFP.x)*t;
                    lfp.y = initLFP.y+(targetLFP.y-initLFP.y)*t;

                    lfp.sx = initLFP.sx+(targetLFP.sx-initLFP.sx)*t;
                    lfp.sy = initLFP.sy+(targetLFP.sy-initLFP.sy)*t;
                }

                // ease outback
                // t: current time, b: begInnIng value, c: change In value, d: duration
                //if (s == undefined) s = 1.70158;
                // return c*((t=t/d-1)*t*((s+1)*t + s) + 1) + b;
                var s = 1.70158;
                var f = 1.0*((t=t/1.0-1)*t*((s+1)*t + s) + 1) + 0.0;

                fp.x = initFP.x+(targetFP.x-initFP.x)*f;
                fp.y = initFP.y+(targetFP.x-initFP.y)*f;
                fp.sx = initFP.sx+(targetFP.sx-initFP.sx)*f;
                fp.sy = initFP.sy+(targetFP.sy-initFP.sy)*f;

            },
            complete:function(){
                self.model.lastFocusProject = null;
            }

        });


    },

    initProjectLocations: function(){

        var projects = this.model.projects;
        var w = ZN.Config.assetBB.width;
        var h = ZN.Config.assetBB.height;

        _.each(projects,function(project){
            var px = (Math.random()-0.5)*w;
            var py = (Math.random()-0.5)*h;

            var scale = Math.random()*0.1+0.05;

            project.setBackground({x:px,y:py,sx:scale,sy:scale});

        });
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

