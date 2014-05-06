var ZN = ZN || { };

ZN.App = function () {
    this.xhr = null;
    this.timeoutTime = 60 * 1000;
    this.timeoutCount = 0;
    this.bLoadData = true;
    this.dataType = "json";
    this.apiPath = "";
}

ZN.App.prototype = {
    constructor:ZN.App,

    init:function(){
        this.loadConfig();

    },


    loadConfig:function () {
        var self = this;

        var url = "js/config.js";
        /*
        if (configName != "" && configName != null && configName != "undefined") {
            url = "config/" + configName + ".js";
        }
        */

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
        this.loadClassification();
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
        //var url = this.apiPath + "classifications/" + nItems;
        var url = "http://live.zooniverse.org/classifications/100";

        this.loadUrl(url, "jsonp",this.classificationLoaded);



    },
    classificationLoaded:function(data){
        var d = data;

    },
}
