var ZN = ZN || { };

ZN.Chart = function () {
    this.container = "charts-container";
    this.durationSecs = 60 * 60 * 24; // 1 hour
    this.offsetSecs = 0;//120000;
    this.classifications = [];
    this.projects = {};
    this.minDate = new Date();
    this.maxDate = new Date();
    this.pickerMinDate = new Date();
    this.pickerMaxDate = new Date();
    this.pickerStartDate = new Date();
    this.pickerEndDate = new Date();
    this.intervalSecs = 3600;


}

ZN.Chart.prototype = {
    constructor:ZN.Chart,

    init:function () {

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

    configLoaded:function () {
	/* url for api on same host as this page served from
	 */
	var url = window.location.protocol + "//" + window.location.host + "/"; 
        this.apiUrl = url;
        this.initInterface();
        this.loadChart();
    },

    getUTC: function(date){
        var dateUTC = new Date( Date.UTC(date.getFullYear(), date.getMonth(),date.getDate(),date.getHours(),date.getMinutes(), date.getSeconds()));
        return new Date(dateUTC);
    },

    initInterface:function () {

        var self = this;


        this.minDate = this.pickerMinDate = new Date(Date.UTC(2007, 0, 1));
        this.maxDate = this.pickerMaxDate = new Date();
        var format = d3.time.format("%Y/%m/%d");
        var minDateStr = format(this.minDate);
        var maxDateStr = format(this.maxDate);

	// set start/end dates to mirror contents of data/test_data.sql
	//beware, the month is 0 based, i.e. January is 0!
        this.pickerStartDate = new Date(Date.UTC(2013, 2, 1));
        this.pickerEndDate = new Date(Date.UTC(2013, 2, 2));
        format = d3.time.format("%Y/%m/%d %H:%M");
        var minValue = format(this.pickerStartDate);
        var maxValue = format(this.pickerEndDate);


        $("#start-date").datetimepicker({
            minDate:minDateStr, //'2013/03/01',
            maxDate:maxDateStr, //'2013/03/30',
            value:minValue, //'2013/03/30 00:00',
            format:'Y/m/d H:i',
            onChangeDateTime:function (dp, $input) {
                //console.log($input.val());
                self.pickerStartDate = dp;

            }
        });
        $("#end-date").datetimepicker({
            minDate:minDateStr, //'2013/03/01',
            maxDate:maxDateStr, //'2013/03/30',
            value:maxValue,
            format:'Y/m/d H:i',
            onChangeDateTime:function (dp, $input) {
                //console.log($input.val());
                self.pickerEndDate = dp;

            }
        });
        $("#time-select").change(function () {
            var str = "";
            $("#time-select option:selected").each(function () {
                var value = $(this).val();
                self.intervalSecs = value * 60;

            });

        });
        $('#time-select').val(self.intervalSecs / 60);

        $("#update-but")

            .click(function (event) {

                self.loadChart();
                event.preventDefault();
            });


    },

    displayLoading:function(bLoading){
        var display = bLoading?'inline':'none';
        $("#loading").css('display',display);
    },

    loadUrl:function (url, type, callback) {

        var self = this;

        this.xhr = $.ajax({
            url:url,
            dataType:type,
            contentType:"application/x-www-form-urlencoded;charset=uft-8",
            success:function (data) {
                self.timeoutCount = 0;
                callback.apply(self, [data]);

            },
            error:function (jqXHR, exception) {
                alert('Error.\n' + jqXHR.responseText);
            }

        });

    },

    loadChart:function () {
        var from = this.pickerStartDate.valueOf() / 1000;
        var to = this.pickerEndDate.valueOf() / 1000;
        var interval = this.intervalSecs;
        var url = this.apiUrl + "classifications/from/" + from + "/to/" + to + "/interval/" + interval;

        this.loadUrl(url, "json", this.chartLoaded);
        this.displayLoading(true);

    },
    chartLoaded:function (data) {
        this.displayLoading(false);
        _.each(data,function(obj,index){
            var disabled = !(index==0);
            obj['disabled'] = disabled;
        });
        this.barChart(data);
    },

    loadData:function () {
        var maxItems = 10000000;

        var url = this.apiUrl + "classifications/" + maxItems + "/duration/" + this.durationSecs + "/offset/" + this.offsetSecs;
        this.loadUrl(url, "json", this.dataLoaded);

    },

    dataLoaded:function (classifications) {
        var nClassifications = classifications.length;


        // add time values
        for (var i = 0; i < nClassifications; i++) {
            var classification = classifications[i];
            classification.unixTime = (new Date(classification.timestamp)).valueOf() / 1000;
            //console.log("load classification timestamp:",classification.timestamp);
            this.classifications.push(classification);
            //if(typeof _.find(this.classifications, { 'id': classification.id }) == 'undefined'){}
            var project = classification.project;
            if (this.projects[project]) {
                this.projects[project] += 1;
            }
            else {
                this.projects[project] = 1;
            }
        }

        this.aggregateByProject();


    },

    aggregate:function () {

        var secsPerBar = 60;
        var values = _.countBy(this.classifications, function (classification) {
            return Math.floor(classification.unixTime / secsPerBar) * secsPerBar;
        });

        var barchartObj = [
            {
                key:"Classification",
                values:[]
            }
        ];

        var format = d3.time.format.utc("%Y-%m-%d %H:%M");

        for (var key in  values) {
            var time = new Date(key * 1000);
            var timeStr = format(time);
            barchartObj[0].values.push({"label":timeStr, "value":values[key]});
        }
        this.barChart(barchartObj);


    },


    aggregateByProject:function () {

        var secsPerBar = 300;
        var format = d3.time.format.utc("%Y-%m-%d %H:%M");
        var barchartObj = [];
        var minTimeMs = Math.floor(this.classifications[0].unixTime / secsPerBar) * secsPerBar * 1000;
        var nBars = this.durationSecs / secsPerBar;

        for (var project in this.projects) {

            var values = [];
            for (var i = 0; i < nBars; i++) {
                var time = new Date(minTimeMs + secsPerBar * 1000 * i);
                var timeStr = format(time);
                values.push({"label":timeStr, "value":0});
            }

            var series = {
                key:project,
                values:values,
                disabled:true
            };
            barchartObj.push(series);
        }


        var nClassifications = this.classifications.length;
        // add time values
        for (var i = 0; i < nClassifications; i++) {
            var classification = this.classifications[i];
            var project = classification.project;
            var time = new Date(Math.floor(classification.unixTime / secsPerBar) * secsPerBar * 1000);
            var timeStr = format(time);
            var series = _.find(barchartObj, {'key':project});
            var item = _.find(series.values, {'label':timeStr});
            if (item) {
                item.value += 1;
            }
            else {
                console.log("Error: project:", project, "time", timeStr)
            }

        }

        this.barChart(barchartObj);


    },


    barChart:function (barchartObj) {


        nv.addGraph(function () {
            var chart = nv.models.multiBarChart()//discreteBarChart()
                .x(function (d) {
                    d.label = d.label.replace("T"," ");
                    d.label = d.label.replace(":00.000Z","");
                    return d.label
                })//Specify the data accessors.
                .y(function (d) {
                    return d.value
                })
                //.reduceXTicks(true)
                //.staggerLabels(true)    //Too many bars and not enough room? Try staggering labels.
                .tooltips(true)//Don't show tooltips
                .stacked(true)//...instead, show the bar value right on top of each bar.
                .transitionDuration(1)
                .rotateLabels(45)
                .width(1100)
                .height(400)
                .showControls(true)
                .groupSpacing(0.1);

            d3.select('#chart-container svg')
                .datum(barchartObj)// (exampleData())
                .call(chart);

            nv.utils.windowResize(chart.update);

            return chart;
        });
    }


}

//Generate some nice data.

function exampleData() {
    return stream_layers(3, 10 + Math.random() * 100, .1).map(function (data, i) {
        return {
            key:'Stream #' + i,
            values:data
        };
    });
}


/* Inspired by Lee Byron's test data generator. */
function stream_layers(n, m, o) {
    if (arguments.length < 3) o = 0;
    function bump(a) {
        var x = 1 / (.1 + Math.random()),
            y = 2 * Math.random() - .5,
            z = 10 / (.1 + Math.random());
        for (var i = 0; i < m; i++) {
            var w = (i / m - y) * z;
            a[i] += x * Math.exp(-w * w);
        }
    }

    return d3.range(n).map(function () {
        var a = [], i;
        for (i = 0; i < m; i++) a[i] = o + o * Math.random();
        for (i = 0; i < 5; i++) bump(a);
        return a.map(stream_index);
    });
}

/* Another layer generator using gamma distributions. */
function stream_waves(n, m) {
    return d3.range(n).map(function (i) {
        return d3.range(m).map(function (j) {
            var x = 20 * j / m - i / 3;
            return 2 * x * Math.exp(-.5 * x);
        }).map(stream_index);
    });
}

function stream_index(d, i) {
    return {x:i, y:Math.max(0, d)};
}
