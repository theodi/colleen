ZN.Config = {
    // Data source
    dataSource:"live", //"live", //"live",//"archive"
    timeseriesJson:"timeseries_20140904.json",

    // Composition dimensions
    assetBB:{left:0,bottom:1080,right:1920,top:0,width:1920,height:1080},

    // Sound
    //soundConfigPath:"sound/config",
    soundConfigPath:"data/sound_config.json",

    // Debug
    debug:false,

    // Interface
    showControlsOnProjectChange:true,
    showControlsDuration:3, // duration to show controls on project change (seconds)

    // Rules to select focus project
    focusOpacity:1.0, // opacity of focused project
    bgOpacity:0.03, // opacity of background projects
    focusDuration:2.5, // transition duration from bgd project to become in focus (seconds)

    bgScaleAnim:{"type":"scale","data":"day","sx":[0.6,0.8],"sy":[0.6,0.8],"tween":"linear","fn":"sqrt"}, // background animation scale rule OLD:{"type":"scale","data":"day","sx":[0.02,0.1],"sy":[0.02,0.1],"tween":"linear","fn":"id"}
    bgScaleAnimDurationRange:[500.0,600.0], // background animation scale rule duration range (seconds)
    changeFocusDuration:[100000,120000] // change duration of focus project switch. random number between range (seconds)


}



