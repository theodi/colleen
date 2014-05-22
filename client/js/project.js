ZN.Project = function () {
    this.id="";
    this.name="";
    this.colours=[];
    this.polygons=[];

    this.position=[];
    this.analytics = {

        clsCount:{},
        userCount:{},

        clsPercent:{},
        userPercent:{},

        userData:[],
        clsData:[]

    };
    this.paths={};


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

    },
    setStyles:function(data){
        this.paths = data.paths;
        _.each(data.paths,function(path){
            var pathStr = path.d;
            var segsRel = Raphael.pathToRelative(pathStr);
            var segsAbs = Raphael._pathToAbsolute(pathStr);
            var x, y, ox= 0, oy=0, mx=0, my=0,
                minx=Number.MAX_VALUE,
                miny=Number.MAX_VALUE,
                maxx=Number.MIN_VALUE,
                maxy=Number.MIN_VALUE;
            _.each(segsAbs,function(seg){
                switch(seg[0]){
                    case "M":
                        x = seg[1];
                        y = seg[2];
                        mx = x, my=y;
                        break;
                    case "C":
                        x = seg[5];
                        y = seg[6];
                        break;
                };
            },this);
            if(x<minx) minx = x;
            if(x>maxx) maxx = x;
            if(y<miny) miny = y;
            if(y>maxy) maxy = y;

            ox = (minx+maxx)/2;
            oy = (miny+maxy)/2;

            path['origin'] = {x:ox,y:oy};

        },this);
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