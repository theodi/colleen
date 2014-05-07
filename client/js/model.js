ZN.Model = function () {
    this.projects = [];
    this.items = [];// classifications

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
    }


}
