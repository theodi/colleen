ZN.SoundEngine = function(){

    this.app = null;
    this.model = null;
    this.frameTime = 0;
}

ZN.SoundEngine.prototype = {
    constructor:ZN.SoundEngine,

    init:function(app,model){
        this.app = app;
        this.model = model;

    },

    update: function(frameTime){

        this.frameTime = frameTime;
        var projects = this.model.projects;

        var focusProject = this.model.focusProject;
        var lfp = this.model.lastFocusProject;


        _.each(projects,function(project,index){

            // project sounds

            if(project.sound){
                var soundRule = project.sound;
            }

        },this);
    }

}

