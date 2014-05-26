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

    this.canvasContainerId = "canvas-container";
    this.renderer = null;
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
        // url for api on same host as this page served from
        var url = window.location.protocol + "//" + window.location.host + "/";
        this.apiUrl = url;
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
        var url = "data/projects.json";
        this.loadUrl(url, "json",this.projectsLoaded);

    },
    projectsLoaded:function(data){
        this.model.initProjects(data);
        this.loadAssets();
    },

    loadAssets:function () {
        var url = "data/project_rules.json";

        this.loadUrl(url, "json",this.assetsLoaded);

    },
    assetsLoaded:function(data){
        this.model.setStyles(data);
        this.loadProjectAnalytics();

    },

    loadProjectAnalytics:function () {
        var url = this.apiUrl+"analytics";
        this.loadUrl(url, "json",this.analyticsLoaded);

    },
    analyticsLoaded:function(data){
        this.model.parseAnalytics(data);

        this.initRenderer();
        this.update();
        //this.loadClassification();
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

        }
    },

    update:function(){
        var self = this;
        this.curTime = (new Date()).valueOf();

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


        requestAnimationFrame(function(){self.update()});

        this.execRules();
        this.renderer.render();


    },

    execRules: function(){

        var projects = this.model.projects;

        _.each(projects,function(project,index){

            // project rules
            project.rotation = (project.rotation+1)%360;

            _.each(project.shapes,function(shape){

                // shape rules

                if(shape.x+shape.vx > shape.bounds.right) shape.vx*=-1;
                if(shape.x+shape.vx < shape.bounds.left) shape.vx*=-1;

                if(shape.y+shape.vy > shape.bounds.bottom) shape.vy*=-1;
                if(shape.y+shape.vy < shape.bounds.top) shape.vy*=-1;

                shape.x+=shape.vx;
                shape.y+=shape.vy;




            },this);

        },this);
    }






}
