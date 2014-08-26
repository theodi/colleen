ZN.Config = {
    dataSource:"archive",
    assetBB:{left:0,bottom:1080,right:1920,top:0,width:1920,height:1080},

    focusOpacity:1.0, // opacity of focused project
    bgOpacity:0.2, // opacity of background projects
    focusDuration:1.5, // transition duration from bgd project to become in focus (seconds)

    bgScaleAnim:{"type":"scale","data":"day","sx":[0.02,0.25],"sy":[0.02,0.25],"tween":"linear","fn":"id"}, // background animation scale rule
    bgScaleAnimDurationRange:[220.0,380.0], // background animation scale rule duration range (seconds)
    changeFocusDuration:[100000,120000] // change duration of focus project switch. random number between range (seconds)


}



