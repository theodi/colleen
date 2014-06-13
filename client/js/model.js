ZN.Model = function () {
    this.projects = [];
    this.projectDict = {};
    this.classifications = [];// classifications order by timestamp
    //this.classificationIds = {};
    this.analytics={
        clsCount:{},
        userCount:{}
    };

    this.timeseries={
        c:{},
        u:{}
    };
    // [<type>][<interval>] = {series:[],count:0,max:0}

    this.focusProject = null;
    this.focusList = [];


    this.SECS = {
        'MIN':60,
        'MIN5':300,
        'MIN15':900,
        'HOUR':3600,
        'DAY':86400,
        'WEEK':604800,
        'MONTH':2592000 // month 30 days
    };




}

ZN.Model.prototype = {
    constructor:ZN.Model,

    init:function(){

    },


    initProjects: function(projects){
        _.each(projects,function(projectData){
            var project = new ZN.Project();
            this.projects.push(project);
            this.projectDict[projectData.name] = project;

            project.setRules(projectData);
        },this);

    },

    parseAnalytics: function(data){

        _.each(data,function(item,index){
            var projectName = item.project;
            var project = this.projectDict[projectName];
            if(project){

                var analytics = project.timeseries;
                var analyticObj = {
                    country:item.country,
                    count:item.count,
                    interval:item.interval
                };
                switch(item.type_id){
                    case 'c':
                        if(!analytics.clsCount[item.interval]) analytics.clsCount[item.interval] = 0;
                        analytics.clsCount[item.interval]+=item.count;
                        analytics.clsData.push(analyticObj);

                        if(!this.analytics.clsCount[item.interval]) this.analytics.clsCount[item.interval] = 0;
                        this.analytics.clsCount[item.interval]+=item.count;

                        break;
                    case 'u':
                        if(!analytics.userCount[item.interval]) analytics.userCount[item.interval] = 0;
                        analytics.userCount[item.interval]+=item.count;
                        analytics.userData.push(analyticObj);

                        if(!this.analytics.userCount[item.interval]) this.analytics.userCount[item.interval] = 0;
                        this.analytics.userCount[item.interval]+=item.count;
                        break;

                }
            }
            else{
                console.log('no project:', projectName);
            }



        },this);

        _.each(this.projects,function(project,index){
            _.each(this.analytics.clsCount,function(value,key){
                if(project.analytics.clsCount[key]){
                    project.analytics.clsPercent[key] = project.analytics.clsCount[key]/this.analytics.clsCount[key];
                    console.log(project.name, key, project.analytics.clsPercent[key]);
                }
            },this);

        },this);

        /* test percentages
        var percentTotal = _.reduce(this.projects, function(sum, project) {
            var value = 0;
            if(project.analytics.clsPercent['d']){
                value = project.analytics.clsPercent['d'];
            }
            return sum + value;
        },0);

        console.log('percent sum:',percentTotal);
         */
    },

    parseTimeSeries: function(data){

        _.each(data,function(item,index){
            var projectName = item.p;
            var project = this.projectDict[projectName];
            if(project){
                var interval = item.i;
                var count = item.c;

                var timeseries = project.timeseries;
                var seriesObj = {
                    time:item.time,
                    count:count,
                    interval:interval
                };
                var type = item.type;

                /*

                if(!timeseries[type].series[item.interval]) timeseries[type].series[item.interval] = [];
                timeseries[type].series[item.interval].push(item.count);

                if(!timeseries[type].count[item.interval]) timeseries[type].count[item.interval] = 0;
                timeseries[type].count[item.interval] += item.count;
                */

                if(!timeseries[type][interval]) timeseries[type][interval] = {series:[],count:0,max:0};
                timeseries[type][interval].series.push(count);
                timeseries[type][interval].count += count;
                timeseries[type][interval].max = Math.max(timeseries[type][interval].max,count);

            }
            else{
                console.log('no project:', projectName);
            }



        },this);

        /*
        _.each(this.projects,function(project,index){
            _.each(this.analytics.clsCount,function(value,key){
                if(project.analytics.clsCount[key]){
                    project.analytics.clsPercent[key] = project.analytics.clsCount[key]/this.analytics.clsCount[key];
                    console.log(project.name, key, project.analytics.clsPercent[key]);
                }
            },this);

        },this);
        */

    },
    addClassifications:function(classifications){
        var nClassifications = classifications.length;
        for(var i=0;i<nClassifications;i++){
            var classification = classifications[i];
            classification.time = (new Date(classification.timestamp)).valueOf();
            console.log("load classification timestamp:",classification.timestamp);
            if(typeof _.find(this.classifications, { 'id': classification.id }) == 'undefined'){
                this.classifications.push(classification);
            }
            //for(var key in classification){}
        }
        var minTime = classifications[0].time;
        return classifications;
    },
    getNextClassificationTime:function(){
        var time = null;
        if(this.classifications.length>0){
            time =  this.classifications[0].time;
        }
        return time;
    },
    removeFirstClassification:function(){
        return this.classifications.shift();
    }






}
