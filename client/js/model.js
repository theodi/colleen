ZN.Model = function () {
    this.projects = [];
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
        }
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
