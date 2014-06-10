var ZN = ZN || { };

ZN.App = function () {

    this.model = null;

    this.xhr = null;
    this.timeoutTime = 60 * 1000;
    this.timeoutCount = 0;
    this.bLoadData = true;
    this.dataType = "json";
    this.apiUrl = "";
    this.dataSource = "archive"; // "live"
    this.archiveStartSecs = 120000;//2*24*60*60; // seconds
    this.ruleFile = "project_rules";

    this.nextRequestTime = 0;
    this.curTime = 0;
    this.lastTime = 0;
    this.frameTime = 50; // frame ms
    this.requestDuration = 60*1000; // in ms
    this.firstFrame = true;
    this.classificationDelay = 0;
    this.classificationLoadCount = 0;

    this.canvasContainerId = "canvas-container";
    this.renderer = null;
    this.rendererType = "canvas"; //"snap";//"raphael" //

    this.paper = null;
    this.paths = [];
    this.frameDurations = [];

    this.debug = true;


}

ZN.App.prototype = {
    constructor:ZN.App,

    init:function(){
        this.model = new ZN.Model();
        this.model.init();
        this.loadConfig();

        var rules = this.getParameterByName("rules");
        if(rules!=""){
            this.ruleFile += "_" + rules;
        }

    },


    loadConfig:function () {
        var self = this;
        var url = "js/config.js";

        $.ajax({
            type:"GET",
            url:url,
            dataType:"script",
            success:function (data) {
                self.configLoaded();
            },
            error:function (xhr, status, error) {
                //if (xhr.status != 404) {alert(error);} else {alert("404 config not found");}
            }
        })
    },

    configLoaded:function(){
	// url for api on same host as this page served from
	//	var url = window.location.protocol + "//" + window.location.host + "/"; 
	    var url = 'http://localhost:5000/'
        this.apiUrl = url;
        this.dataSource = ZN.config.dataSource;
        this.loadProjects();

    },

    loadUrl:function (url, type, callback) {

        var self = this;

        this.xhr = $.ajax({
            url:url,
            dataType:type,
            contentType:"application/x-www-form-urlencoded;charset=uft-8",
            success:function (data) {
                self.timeoutCount = 0;
                callback.apply(self,[data]);

            },

            error:function (jqXHR, exception) {

                if (exception === 'abort') {
                    //alert('Ajax request aborted.');

                }
                else if (exception === 'timeout') {
                    //alert('Time out error.');
                    self.timeoutCount += 1;
                    if (self.timeoutCount < 2) {
                        self.loadUrl(this.url, this.dataType, callback);
                    }
                    else {
                        alert('Time out error.');
                    }

                }
                else if (jqXHR.status === 0) {
                    self.timeoutCount += 1;
                    if (self.timeoutCount < 2) {
                        self.loadUrl(this.url, this.dataType, callback);
                    }
                    else {
                        alert('Not Connected.');
                    }
                    //alert('Not connect.\n Verify Network.');
                } else if (jqXHR.status == 404) {
                    alert('Requested page not found. [404]');
                } else if (jqXHR.status == 500) {
                    alert('Internal Server Error [500].');
                } else if (exception === 'parsererror') {
                    alert('Requested JSON parse failed.');
                } else {
                    alert('Uncaught Error.\n' + jqXHR.responseText);
                }

            },
            complete:function (jqXHR, textStatus) {
                /*alert("Load Complete: " + textStatus)*/
            }

        });

    },

    loadProjects:function () {
        var url = "data/projects.json";
        this.loadUrl(url, "json",this.projectsLoaded);

    },
    projectsLoaded:function(data){
        this.model.initProjects(data);
        this.loadAssets();
    },

    loadAssets:function () {
        var url = "data/"+this.ruleFile+".json";

        this.loadUrl(url, "json",this.assetsLoaded);

    },
    assetsLoaded:function(data){
        this.model.setStyles(data);
        //this.startApp();
        this.loadTimeSeries([3600]);

    },

    loadProjectAnalytics:function() {
        var url = this.apiUrl+"analytics";
        this.loadUrl(url, "json",this.analyticsLoaded);

    },
    analyticsLoaded:function(data){
        this.model.parseAnalytics(data);
        this.startApp();
        //this.loadClassification();
    },


    loadTimeSeries:function(intervals) {
        var url = this.apiUrl+"timeseries/intervals/"+ intervals.join(',');
        this.loadUrl(url, "json",this.timeSeriesLoaded);

    },
    timeSeriesLoaded:function(data){
        this.model.parseTimeSeries(data);

        this.startApp();
        //this.loadClassification();
    },

    startApp:function(){
        this.initRenderer();
        this.curTime = this.lastTime = (new Date()).valueOf();
        this.initInterface();
        this.update();
    },

    initInterface:function(){
        var self = this;
        if(this.debug){
            $(document.body).append('<div id="diagnostics" style="position:absolute;z-index:10;"></div>');
        }

        $(window).resize(function(){
            self.renderer.resize();
        });

    },

    loadClassification:function () {
        var maxItems = 1000;
        var requestDurationSecs = this.requestDuration/1000;
        var offsetSecs = 0;
        if(this.dataSource=="archive"){
            offsetSecs = this.archiveStartSecs-this.classificationLoadCount*requestDurationSecs;
        }
        var url = this.apiUrl + "classifications/" + maxItems +"/duration/"+requestDurationSecs+"/offset/"+offsetSecs;

        this.loadUrl(url, "json", this.classificationLoaded);

    },

    classificationLoaded:function(data){
        var d = data;
        var classifications = this.model.addClassifications(data);
        var delay = (new Date()).valueOf() - classifications[0].time;

        this.classificationLoadCount += 1;

        if(this.firstFrame){
            this.firstFrame = false;
            this.classificationDelay = delay;
            this.nextRequestTime = (new Date()).valueOf() + this.requestDuration;
            this.update();

        }
        else{
            /*
            if(this.classificationDelay < delay){
                this.classificationDelay = delay;
            }
            */
        }


    },

    resize:function(){

    },

    initRenderer:function(){

        switch(this.rendererType){
            case "raphael":
                this.renderer = new ZN.RaphaelRenderer();
                this.renderer.init(this,this.model,this.canvasContainerId);

                break;
            case "snap":
                this.renderer = new ZN.SnapRenderer();
                this.renderer.init(this,this.model,this.canvasContainerId);

                break;

            case "canvas":
                this.renderer = new ZN.CanvasRenderer();
                this.renderer.init(this,this.model,this.canvasContainerId);

                break;

        }
    },

    update:function(){
        var self = this;
        this.lastTime = this.curTime;
        this.curTime = (new Date()).valueOf();
        var frame = this.curTime - this.lastTime;
        this.frameTime = Math.max(frame,50);
        this.frameDurations.push(frame);
        if(this.frameDurations.length>10) this.frameDurations.shift();

        var sum = this.frameDurations.reduce(function(prev, cur, index, array){
            return prev + cur;
        });
        var fps = (1.0/((sum/this.frameDurations.length)/1000)).toFixed(2) + " fps";
        if(this.debug){
            $("#diagnostics").html(fps);
        }

        /*
        // load new classifications
        if(this.curTime>this.nextRequestTime){
            this.loadClassification();
            this.nextRequestTime = this.curTime + this.requestDuration;
            console.log("nextRequestTime",(new Date(this.nextRequestTime)).toISOString());
        }

        // classification
        if(this.model.classifications.length>0){
            var nextClassificationTime = this.model.getNextClassificationTime()+ this.classificationDelay;
            if(this.curTime>nextClassificationTime){
                console.log("nextClassificationTime",(new Date(nextClassificationTime)).toISOString());
                var classification = this.model.removeFirstClassification();
                console.log("classification timestamp:",classification.timestamp);

            }
        }
        */
        var fps = 20;

        setTimeout(function() {
            requestAnimationFrame(function(){self.update()});

        }, 1000 / fps);



        this.execRules();
        this.renderer.render();


    },

    execRules: function(){

        var projects = this.model.projects;

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
                // shape rules

                if(shape.animation){
                    _.each(shape.animation,function(anim){

                        switch(anim.type){

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
                                var speedRnd = (anim.speed[1]-anim.speed[0])*10.0/this.frameTime;
                                var speedMin = anim.speed[0]*10.0/this.frameTime;
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

                                //anim.time = (anim.time+this.frameTime/1000)%anim.duration[0];
                                anim.time = (anim.time+this.frameTime/1000);
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

                            case "translate_bouce_bounds":

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
    },


    getParameterByName:function(name){
        name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
        var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
            results = regex.exec(location.search);
        return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
    }


}
