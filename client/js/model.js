/*
 * ZN.Model stores array of Zooniverse project compositions, project layout graph, and currently focused project
 */

ZN.Model = function () {
    this.projects = [];
    this.projectDict = {};
    this.projectGraph = null;

    // focus project
    this.focusProject = null;
    this.lastFocusProject = null;
    this.focusList = [];
    this.focusIndex = 0;
    this.lastChangeFocus = 0;
    this.changeFocusTime = 0;
    this.maxSeriesTime = 0;

    // sound
    this.soundConfig = null;

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


        // create random project focus order
        var indices = [];
        _.each(projects,function(project,index){
            indices.push(index);
        });

        for(var i=0;i<projects.length;i++){
            var index = parseInt(Math.random()*(projects.length-i-1));
            this.focusList.push(indices[index]);
            indices.splice(index,1);

        }

    },

    processSoundConfig: function(data){

        var scenes = [];
        // add base sound
        scenes.push( _.find(data.scenes,{"id":'__base'}));

        // add active projects in focus order
        _.each(this.focusList,function(projectIndex){
            var projectId = this.projects[projectIndex].id;
            var soundObj = _.find(data.scenes,{"id":projectId});
            scenes.push(soundObj);

        },this);

        data.scenes = scenes;
        this.soundConfig = data;
        return data;

    },

    setSoundLoaded: function(projectId){
        if(this.projectDict[projectId]){
            this.projectDict[projectId].soundLoaded = true;
        }
    },

    getSoundLoaded: function(projectId){
        return this.projectDict[projectId].soundLoaded;
    },

    isFocusSoundLoaded: function(){
        var ret = false;
        if(this.focusProject){
            ret =  this.focusProject.soundLoaded;
        }
        return ret;
    },

    initProjectGraph: function(csvData){
        this.projectGraph = new ZN.ProjectGraph();
        this.projectGraph.createSpringyGraph(csvData);
        //this.projectGraph.start();
    },

    parseTimeSeries: function(seriesData){

        var data = seriesData.data;
        var intervals = seriesData.intervals;

        if(data.length==0) return;

        var times = _.pluck(data,'t');
        this.maxSeriesTime = _.max(times);


        // clear timeseries arrays
        _.each(this.projects,function(project,index){
            _.each(intervals,function(interval){
                project.timeseries['c'][interval] = {series:[],count:0,max:0, lastTime:0};
                project.timeseries['u'][interval] = {series:[],count:0,max:0, lastTime:0};

            },this);
        },this);

        // populate timeseries arrays
        _.each(data,function(item,index){
            var projectName = item.p;
            var project = this.projectDict[projectName];
            if(project){
                var type = item.type;
                var interval = item.i;
                var count = item.c;
                var time = item.t;

                var timeseries = project.timeseries;

                if(!timeseries[type][interval]) timeseries[type][interval] = {series:[],count:0,max:0};
                timeseries[type][interval].series.push(count);
                timeseries[type][interval].max = Math.max(timeseries[type][interval].max,count,1.0);
                timeseries[type][interval].lastTime = Math.max(timeseries[type][interval].lastTime,time);

            }
            else{
                //console.log('no project:', projectName);
            }


        },this);

    },

    incrementTimeSeries: function(seriesData){

        var data = seriesData.data;

        if(data.length==0) return;

        var times = _.pluck(data,'t');
        this.maxSeriesTime = _.max(times);


        // increment timeseries arrays
        _.each(data,function(item,index){
            var projectName = item.p;
            var project = this.projectDict[projectName];
            if(project){
                var type = item.type;
                var interval = item.i;
                var count = item.c;
                var time = item.t;

                var timeseries = project.timeseries;

                if(!timeseries[type][interval]) timeseries[type][interval] = {series:[],count:0,max:0};
                var series = timeseries[type][interval];

                timeseries[type][interval].series.push(count);
                // remove first
                var firstItemCount = timeseries[type][interval].series[0];
                timeseries[type][interval].series.shift();

                timeseries[type][interval].max = Math.max(timeseries[type][interval].max,count,1.0);
                timeseries[type][interval].lastTime = Math.max(timeseries[type][interval].lastTime,time);

                // find maximum count if removed item largest
                if(firstItemCount == timeseries[type][interval].max){
                    timeseries[type][interval].max = Math.max(_.max(timeseries[type][interval].series),1.0);
                }

                //console.log('incTimeSeries',project.name,type,interval,count,time);

            }
            else{
                //console.log('no project:', projectName);
            }


        },this);





    }


    /*
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


    }
    */




}
