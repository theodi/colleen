ZN.Rules = function () {

    this.app = null;
    this.model = null;
    this.frameTime = 0;
    this.transitionAnim = null;
    this.focusOpacity = 1.0;
    this.bgOpacity = 0.05;
    this.focusDuration = 1.5; // focus transition seconds
    this.changeFocusDuration = [30.0,60.0];


}

ZN.Rules.prototype = {
    constructor:ZN.Rules,

    init:function(app,model){
        this.app = app;
        this.model = model;

        this.focusOpacity = ZN.Config.focusOpacity;
        this.bgOpacity = ZN.Config.bgOpacity;
        this.focusDuration = ZN.Config.focusDuration;
        this.changeFocusDuration = ZN.Config.changeFocusDuration;
    },

    isFocusProject: function(project){
        return (this.model.focusProject.id == project.id);
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

            if(this.app.runProjectGraph){
                if(project!=focusProject && project!=lfp){

                    this.scaleRule(project,project,project.bgScaleAnim);
                    var pt = projectPoints[project.name];
                    if(pt){
                        project.x = pt.x;
                        project.y = pt.y;

                    }

                    project.opacity = this.bgOpacity;
                }



            }
            else{
                project.opacity = this.focusOpacity;
            }



            if(project.animation){
                _.each(project.animation,function(anim){
                    switch(anim.type){
                        case "rotate":
                            this.rotateRule(project,project,anim);
                            break;
                        case "loop_sound":
                            if(this.isFocusProject(project)){
                                this.soundLoopTriggerRule(project,project,anim);
                            }
                            break;
                        case "sound_intensity":
                            if(this.isFocusProject(project)){
                                this.soundIntensityRule(project,project,anim);
                            }
                            break;

                    }
                },this);
            }



            _.each(project.shapes,function(shape,ind){

                // update shape trails

                _.each(shape.trail.shapes, function (trailShape, si) {

                    trailShape.opacity *= shape.trail.fade;//0.985;//(trailShape);


                }, this);

                _.remove(shape.trail.shapes, function (trailShape) {
                    return trailShape.opacity < 0.05;
                });


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

                            case "trail":
                                this.trailRule(project,shape,anim);
                                break;

                            case "serengeti":
                                this.serengetiRule(project,shape,anim);
                                break;

                            case "point_translate":
                                this.pointTranslateRule(project,shape,anim);
                                break;

                            case "radio":
                                this.radioRule(project,shape,anim);
                                //this.transnn(project,shape,anim);
                                break;

                            case "asteroid":
                                this.asteroidRule(project,shape,anim);
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
            //if(anim.series_len){
            //    series = (project.timeseries[dataType][interval].series).slice(series.length-anim.series_len);
            //}
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

        if(anim.hasOwnProperty('loop_sound') && this.isFocusProject(project)){
            this.triggerSound(anim.loop_sound);
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
                obj.x = obj.initial.x +x;
                break;
            case "y":
                y = anim.range[0]+ (anim.range[1]-anim.range[0])*n;
                obj.y = obj.initial.y +y;
                break;

        }

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


    trailRule: function(project, obj, anim){

        var endLoop = this.updateAnimTime(anim);
        if(endLoop){
            var duration = this.getDuration(project,anim);
            var trailType = anim['trail_type'];
            var opacity = anim['opacity'] || obj.opacity;
            var fade = anim['fade'];
            obj.addTrailShape(trailType, fade, opacity);
        }


    },



    serengetiRule:function(project, obj, anim){

        var n = this.getNextSeriesValue(project, obj, anim);

        var nt = anim.time/anim.curDuration;

        var rangeX = anim.rangeX;
        var dx = rangeX[0]+ (rangeX[1]-rangeX[0])*n;

        var rangeY = anim.rangeY;
        var dy = rangeY[0]+ (rangeY[1]-rangeY[0])*-1.0*Math.cos((n-0.5)*2*Math.PI);

        //var sc = 20.0;
        // bl, br, tr, tl
        //var t = [[0.0,0.0],[0.0,0.0],[-0.5,-10.0],[0.5,-10.0]];

        var t = [[0.0,0.0],[0.0,0.0],[dx,dy],[dx,dy]];

        this.pointTranslate(obj,t);

    },


    pointTranslateRule:function(project, obj, anim){

        var n = this.getNextSeriesValue(project, obj, anim);

        var nt = anim.time/anim.curDuration;

        var rangeX = anim.rangeX;
        var dx = rangeX[0] + (rangeX[1]-rangeX[0])*n;

        var rangeY = anim.rangeY;
        var dy = rangeY[0] + (rangeY[1]-rangeY[0])*-1.0*Math.cos((n-0.5)*2*Math.PI);

        // bl, br, tr, tl
        //var t = [[0.0,0.0],[0.0,0.0],[-0.5,-10.0],[0.5,-10.0]];

        var t = [[-dx,-dy],[-dx,-dy],[dx,dy],[dx,dy]];

        this.pointTranslate(obj,t);


    },

    pointTranslate:function(obj,t){
        var iPathSegs = obj.initial.pathSegs;
        var pathSegs = obj.pathSegs;


        for(var s=0;s<iPathSegs.length;s++){
            var iseg = iPathSegs[s];
            var seg = pathSegs[s];
            var p = s%4;

            switch(seg[0]){
                case "M":
                    pathSegs[s][1] = iseg[1]+t[p][0]; // pt0.x
                    pathSegs[s][2] = iseg[2]+t[p][1]; // pt0.y
                    break;
                case "C":

                    pathSegs[s][1] = iseg[1]+t[p][0];
                    pathSegs[s][2] = iseg[2]+t[p][1];
                    pathSegs[s][3] = iseg[3]+t[p][0];
                    pathSegs[s][4] = iseg[4]+t[p][1];

                    pathSegs[s][5] = iseg[5]+t[p][0]; // pt1.x
                    pathSegs[s][6] = iseg[6]+t[p][1]; // pt1.y
                    break;

            };
        }

    },

    radioRule:function(project, obj, anim){

        //var n = this.getNextSeriesValue(project, obj, anim);

        if(typeof anim['dx'] ==='undefined'){

            var dist = Math.sqrt(obj.initial.x*obj.initial.x + obj.initial.y*obj.initial.y);
            var dx = obj.initial.x/dist,
                dy = obj.initial.y/dist;
            anim['dx'] = dx, anim['dy'] = dy;
            var massScale = 0.001;
            anim['mass'] = Math.sqrt(obj.width*obj.height)*massScale;
            obj.opacity = 0.0;

        }

        var endLoop = this.updateAnimTime(anim);
        if(endLoop){
            var n = Math.random();
            var duration = anim.duration[0]+ (anim.duration[1]-anim.duration[0])*n;
            anim.curDuration = duration;

            obj.opacity = 0.4;

            var maxDistScale = 1.5;
            obj.x = obj.initial.x*maxDistScale;
            obj.y = obj.initial.y*maxDistScale;
            obj.vx=0;
            obj.vy=0;


        }

        /*
        var n = this.getSeriesValue(project, obj, anim);

        // translate along axis from project centre
        var speed = anim.range[0]+ (anim.range[1]-anim.range[0])*n;
        speed*=1500;
        */

        var dt = this.frameTime/(1000*anim.mass);

        var d = Math.sqrt(obj.x*obj.x + obj.y*obj.y);
        //var d = obj.x*obj.x + obj.y*obj.y;


        var gravity = 2600.0;

        obj.vx -= gravity*anim.dx*dt/d;
        obj.vy -= gravity*anim.dy*dt/d;

        obj.x += obj.vx;
        obj.y += obj.vy;

        var dsq = obj.x*obj.x + obj.y*obj.y;

        var minDistSq = 100*100;

        if(dsq<minDistSq){
            obj.vx=0;
            obj.vy=0;
            obj.opacity = 0.0;
            obj.x = 0;
            obj.y = 0;
        }




        /*
        if(Math.abs(obj.y)<=Math.abs(obj.initial.y*minDistScale)){
            obj.y = obj.initial.y*minDistScale;
            obj.vy=0;
        }
        */


    },


    /*
    radioRule:function(project, obj, anim){

        var n = this.getNextSeriesValue(project, obj, anim);

        if(typeof anim['lastSeriesValue'] ==='undefined'){
            anim['lastSeriesValue'] = n;
            var dist = Math.sqrt(obj.initial.x*obj.initial.x + obj.initial.y*obj.initial.y);
            var dx = obj.initial.x/dist,
                dy = obj.initial.y/dist;
            anim['dx'] = dx, anim['dy'] = dy;
            var massScale = 0.001;
            anim['mass'] = Math.sqrt(obj.width*obj.height)*massScale;

        }

        var dn = n-anim['lastSeriesValue'];

        // translate along axis from project centre
        var speed = anim.range[0]+ (anim.range[1]-anim.range[0])*n;
        speed*=2000;

        var dt = this.frameTime/(1000*anim.mass);

        var d = Math.sqrt(obj.x*obj.x + obj.y*obj.y);

        if(d==0) d = 0.0001;
        if(dn>0){
            obj.vx += speed*anim.dx*dt/d;
            obj.vy += speed*anim.dy*dt/d;
        }
        var gravity = 700.0;

        obj.vx -= gravity*anim.dx*dt/d;
        obj.vy -= gravity*anim.dy*dt/d;

        obj.x += obj.vx;
        obj.y+= obj.vy;


        if(Math.abs(obj.x)<=Math.abs(obj.initial.x/4)){
            obj.x = obj.initial.x/4;
            obj.vx=0;
        }
        if(Math.abs(obj.y)<=Math.abs(obj.initial.y/4)){
            obj.y = obj.initial.y/4;
            obj.vy=0;
        }

        anim['lastSeriesValue'] = n;

    },
    */

    radialTranslateRule: function(project, obj, anim){

        var n = this.getNextSeriesValue(project, obj, anim);

        // translate along axis from project centre
        var trans = anim.range[0]+ (anim.range[1]-anim.range[0])*n;

        var dist = Math.sqrt(obj.initial.x*obj.initial.x + obj.initial.y*obj.initial.y);
        var dx = obj.initial.x/dist,
            dy = obj.initial.y/dist;
        obj.x = obj.initial.x + dx*trans;
        obj.y = obj.initial.y + dy*trans;

    },


    asteroidRule:function(project, obj, anim){


        var endLoop = this.updateAnimTime(anim);
        if(endLoop){

            // set random duration
            //var n = Math.random();
            //var duration = anim.duration[0]+ (anim.duration[1]-anim.duration[0])*n;
            //anim.curDuration = duration;
            var duration = this.getDuration(project,anim);

            // start shooting star
            var speedScale = 3000;
            var s = (Math.random()+1.0)*speedScale;
            var theta = Math.random()*Math.PI*2;
            obj.vx = Math.cos(theta)*s;
            obj.vy = Math.sin(theta)*s;

            //console.log("start_anim id",obj.id,obj.vx,obj.vy)


        }

        //var n = this.getSeriesValue(project, obj, anim);

        var dt = this.frameTime/1000;

        var d = Math.sqrt(obj.x*obj.x + obj.y*obj.y);


        obj.x += obj.vx*dt;
        obj.y += obj.vy*dt;


        if(d>5000){
            obj.x = obj.initial.x;
            obj.y = obj.initial.y;
            obj.vx=0, obj.vy=0;
        }

    },



    /*---------------------------------------------------------------------------*/

    // Sound rules

    soundIntensityRule: function(project, obj, anim){

        // set intensity from anim rule range and normalised value
        var n = this.getNextSeriesValue(project, obj, anim);
        var intensity = anim.range[0] + (anim.range[1]-anim.range[0])*n;
        ZN.soundengine.setSceneLayersMix(intensity*this.app.volume);

    },

    soundLoopTriggerRule:function(project, obj, anim){

        var endLoop = this.updateAnimTime(anim);
        if(endLoop){

            var duration = this.getDuration(project,anim);

            if(this.isFocusProject(project)){
                this.triggerSound(anim.sample);
            }

        }
    },

    triggerSound: function(sample){

        if(this.app.volume>0){
            var filename = ZN.soundengine.triggerSampler(sample);

        }

    },





        /*---------------------------------------------------------------------------*/

    // Project rules

    updateFocusProject: function(){

        if(this.app.curTime>this.model.lastChangeFocus+this.model.changeFocusTime){
            this.incFocusProject(1);
        }

    },

    incFocusProject: function(value){
        this.model.focusIndex+=value;
        if(this.model.focusIndex<0) this.model.focusIndex = this.model.focusList.length-1;
        if(this.model.focusIndex>this.model.focusList.length-1) this.model.focusIndex = 0;

        this.setFocusProject();
    },

    setFocusProject: function(){

        var fp = this.model.focusProject;

        if(fp!=null){
            //fp.setPropsFromBackground();
            this.model.lastFocusProject = fp;
        }

        this.model.lastChangeFocus = (new Date()).valueOf();
        var min = this.changeFocusDuration[0];
        var max = this.changeFocusDuration[1];
        this.model.changeFocusTime = (Math.random()*(max-min)+min)*1000;

        //var project = this.model.projects[parseInt(Math.random()*this.model.projects.length)];
        //var scale = 0.5;
        var projectIndex = this.model.focusList[this.model.focusIndex];
        var project = this.model.projects[projectIndex];

        this.model.focusProject = project;

        // sound
        this.setProjectSound(project);


        var self = this;

        var obj = {
            t: 0.0
        };

        var focusScale = 1.0;//0.8;
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
            duration: self.focusDuration*1000,
            easing: 'linear',
            step: function(t) {

                var x, y,sx,sy,opacity;

                if(lfp){
                    var projectPoints = self.model.projectGraph.projectPoints;
                    self.scaleRule(lfp,lfp,lfp.bgScaleAnim);
                    var pt =projectPoints[lfp.name];
                    var targetLFP = {x:pt.x,y:pt.y,sx:lfp.sx,sy:lfp.sy};

                    lfp.x = initLFP.x+(targetLFP.x-initLFP.x)*t;
                    lfp.y = initLFP.y+(targetLFP.y-initLFP.y)*t;

                    lfp.sx = initLFP.sx+(targetLFP.sx-initLFP.sx)*t;
                    lfp.sy = initLFP.sy+(targetLFP.sy-initLFP.sy)*t;

                    opacity = self.focusOpacity + (self.bgOpacity-self.focusOpacity)*t;
                    lfp.opacity = opacity;
                }

                // https://github.com/danro/jquery-easing/blob/master/jquery.easing.js
                // ease outback
                // t: current time, b: begInnIng value, c: change In value, d: duration
                //if (s == undefined) s = 1.70158;
                // return c*((t=t/d-1)*t*((s+1)*t + s) + 1) + b;
                var s = 10.0;//1.70158;
                var ft = t;
                //var f = 1.0*((ft=ft/1.0-1)*ft*((s+1)*ft + s) + 1) + 0.0;
                var f = 1.0*((ft=ft/1.0-1)*ft*((s+1)*ft + s) + 1) + 0.0;
                fp.x = initFP.x+(targetFP.x-initFP.x)*f;
                fp.y = initFP.y+(targetFP.x-initFP.y)*f;
                fp.sx = initFP.sx+(targetFP.sx-initFP.sx)*f;
                fp.sy = initFP.sy+(targetFP.sy-initFP.sy)*f;

                opacity = self.bgOpacity + (self.focusOpacity-self.bgOpacity)*t;
                fp.opacity = opacity;

            },
            complete:function(){
                self.model.lastFocusProject = null;
            }

        });


    },

    setProjectSound: function(project){
        var info = ZN.soundengine.moveToScene(project.id);
        var layersMix = info.layersMix;
        ZN.soundengine.setSceneLayersMix(this.app.volume);
        ZN.soundengine.setBaseLayersMix(this.app.volume);
        //var filename = ZN.soundengine.triggerSampler(0);


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

