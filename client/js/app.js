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

    this.nextRequestTime = 0;
    this.curTime = 0;
    this.requestDuration = 60*1000; // in ms
    this.firstFrame = true;
    this.classificationDelay = 0;
    this.classificationLoadCount = 0;

    this.canvasContainer = "canvas-container";
    this.ctx = null;
    this.rendererType = "raphael" //"canvas"; //

    this.paper = null;
    this.paths = [];
    //this.tick = 0;



}

ZN.App.prototype = {
    constructor:ZN.App,

    init:function(){
        this.model = new ZN.Model();
        this.model.init();
        this.loadConfig();

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
        this.apiUrl = ZN.config.apiUrl;
        this.dataSource = ZN.config.dataSource;
        //this.model.projects = ZN.config.projects;
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
        var url = "js/projects.json";
        this.loadUrl(url, "json",this.projectsLoaded);

    },
    projectsLoaded:function(data){
        this.model.initProjects(data);

        this.initCanvas();
        this.loadClassification();



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

    initCanvas:function(){
        var size = this.getCanvasSize();
        var w = size.width, h = size.height;
        switch(this.rendererType){
            case "canvas":
                var canvas = document.createElement('canvas');
                canvas.id     = "CanvasLayer";
                canvas.width  = w;
                canvas.height = h;
                $("#"+this.canvasContainer).append(canvas);
                this.ctx = canvas.getContext('2d');

                break;
            case "raphael":
                //var paper = Raphael(10, 50, 320, 200);
                this.paper = Raphael(this.canvasContainer, w, h);
                break;

        }
    },

    update:function(){
        var self = this;
        this.curTime = (new Date()).valueOf();

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


        requestAnimationFrame(function(){self.update()});
        switch(this.rendererType){
            case "canvas":
                this.renderCanvas();
                break;
            case "raphael":
                this.renderRaphael();
                break;
        }

    },

    getCanvasSize: function(){
        var size={};
        size.width = $("#"+this.canvasContainer).width();
        size.height = $("#"+this.canvasContainer).height();
        return size;
    },

    renderCanvas:function(){
        var ctx = this.ctx;
        var size = this.getCanvasSize();
        var w = size.width, h = size.height;

        ctx.clearRect (0, 0, w, h);

        ctx.beginPath();

//polygon1--- usually the outside polygon, must be clockwise
        ctx.moveTo(0, 0);
        ctx.lineTo(200, 0);
        ctx.lineTo(200, 200);
        ctx.lineTo(0, 200);
        ctx.lineTo(0, 0);
        ctx.closePath();

//polygon2 --- usually hole,must be counter-clockwise
        ctx.moveTo(10, 10);
        ctx.lineTo(10,100);
        ctx.lineTo(100, 100);
        ctx.lineTo(100, 10);
        ctx.lineTo(10, 10);
        ctx.closePath();

//  add as many holes as you want
        var alpha = 0.3;
        ctx.fillStyle = "#FF0000";
        ctx.strokeStyle = "rgba(255,0,255,"+alpha+")";
        ctx.lineWidth = 1;
        ctx.fill();
        ctx.stroke();
    },


    renderRaphael:function(){

        // animations: http://raphaeljs.com/animation.html
        // scale image fill: http://stackoverflow.com/questions/1098994/scaling-a-fill-pattern-in-raphael-js
        // svg import: https://github.com/wout/raphael-svg-import

        if(this.paths.length>0) return;

        var projects = this.model.projects;
        for(var i=0;i<projects.length;i++){

            /*
            var proj = projects[i];
            var pathStrs = proj.pointsToRaphael();

            for(p=0;p<pathStrs.length;p++){
                var pathStr = pathStrs[p];
                var tx = i*20, ty = i*20;
                var path = this.paper.path(pathStr)
                    .attr({"fill":"#f00","stroke-width":0,'opacity':0.3}).transform("T"+tx+","+ty);

                var path2 = this.paper.path(pathStr)
                    .attr({"fill":"url(images/paint_01.jpeg)","stroke-width":0,'opacity':0.3}).transform("T"+tx+","+ty);

                this.paths.push(path,path2);
            }
            */

        }

        /*
        if(this.paths.length>0) return;
        var nItems = 10;

        for(var i=0;i<nItems;i++){
            var tx = i*20, ty = i*20;
            var path = this.paper.path("M 50 50 L 50 150 L 150 150 L 150 50 z M 75 75 L 125 75 L 125 125 L 75 125 z")
               .attr({"fill":"#f00","stroke-width":0}).attr('opacity',0.3).transform("T"+tx+","+ty);

            var path2 = this.paper.path("M 50 50 L 50 150 L 150 150 L 150 50 z M 75 75 L 125 75 L 125 125 L 75 125 z")
                .attr({"fill":"url(images/paint_01.jpeg)","stroke-width":0}).attr('opacity',0.3).transform("T"+tx+","+ty);

            this.paths.push(path,path2);
        }
        */

    }


}
