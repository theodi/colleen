var ZN = ZN || { };

ZN.App = function () {

    this.model = null;

    this.xhr = null;
    this.timeoutTime = 60 * 1000;
    this.timeoutCount = 0;
    this.bLoadData = true;
    this.dataType = "json";
    this.apiPath = "";

    this.canvasContainer = "canvas-container";
    this.ctx = null;
    this.rendererType = "canvas"; // "raphael"

}

ZN.App.prototype = {
    constructor:ZN.App,

    init:function(){
        this.model = new ZN.Model();
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
        this.apiPath = ZN.config.apiPath;
        this.model.projects = ZN.config.projects;

        this.initCanvas();

        this.loadClassification();

        this.update();
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


    loadClassification:function () {
        var nItems = 100;
        var url = this.apiPath + "classifications/" + nItems;
        //var url = "http://live.zooniverse.org/classifications/100";

        this.loadUrl(url, "jsonp",this.classificationLoaded);



    },
    classificationLoaded:function(data){
        var d = data;

    },

    initCanvas:function(){

        var w = 1224, h = 768;
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
                var paper = Raphael(this.canvasContainer, w, h);
                break;

        }
    },

    getCanvasSize: function(){

    },

    renderCanvas:function(){
        var ctx = this.ctx;

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


    update:function(){
        var self = this;
        requestAnimationFrame(function(){self.update()});

        this.renderCanvas();


    }


}
