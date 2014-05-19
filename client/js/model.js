ZN.Model = function () {
    this.projects = [];
    this.projectDict = {};
    this.classifications = [];// classificationsn order by timestamp
    //this.classificationIds = {};

}

ZN.Model.prototype = {
    constructor:ZN.Model,

    init:function(){


    },
    initProjects: function(data){
        for(var i=0;i<data.length;i++){
            var projProps = data[i];
            var project = new ZN.Project();
            project.setProps(projProps);
            this.projects.push(project);
            this.projectDict[project.name] = project;
        }
    },
    parseAnalytics: function(data){

        _.each(data,function(item,index){
            var projectName = item.project;
            var project = this.projectDict[projectName];
            if(project){

                var analytics = project.analytics;
                var analyticObj = {
                    country:item.country,
                    count:item.count,
                    interval:item.interval
                };
                switch(item.type_id){
                    case 0:
                        if(!analytics.clsCount[item.interval]) analytics.clsCount[item.interval] = 0;
                        analytics.clsCount[item.interval]+=item.count;
                        analytics.clsData.push(analyticObj);
                        break;
                    case 1:
                        if(!analytics.userCount[item.interval]) analytics.userCount[item.interval] = 0;
                        analytics.userCount[item.interval]+=item.count;
                        analytics.userData.push(analyticObj);
                        break;

                }
            }
            else{
                console.log('no project:', projectName);
            }



        },this);

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
