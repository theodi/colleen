ZN.Project = function () {
    this.id="";
    this.name="";
    this.colours=[];
    this.polygons=[];
    this.classificationCount=0;
    this.userCount=0;
    this.position=[];

}

ZN.Project.prototype = {
    constructor:ZN.Project,


    setProps: function(props){
        for (var prop in props) {
            if (props.hasOwnProperty(prop)) {
                var value = props[prop];
                switch(prop){
                    case "classification_count":
                        this.classificationCount = value;

                        break;
                    default:
                        this[prop] = value;
                }
            }
        }

    },

    addPolygon: function(){

    }





}

ZN.Polygon = function () {

}

ZN.Polygon.prototype = {
    constructor:ZN.Polygon,
    id:"",
    points:[],
    // [[50,50],[50,150],[150,150],[150,50]],[[75,75],[125,75],[125,125],[75,125]]],
    // [[[20,20],[20,120],[120,120],[120,20]],[[25,25],[75,25],[75,75],[25,75]]]
    path:"",
    init: function(){

    },

    pointsToRaphael:function(){

        var pathPts = this.points;
        var pathStr = "";
        for(var polyId=0;polyId<pathPts.length;polyId++){
            var polyPts = pathPts[polyId];

            for(ptId=0;ptId<polyPts.length;ptId++){
                pathStr += (ptId && "L" || "M");
                pathStr+=polyPts[ptId][0]+" "+polyPts[ptId][1];
            }
            pathStr+="z";
        }

        this.path.push(pathStr);

        return this.path;

    }
}