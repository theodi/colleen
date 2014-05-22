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
    this.shapes=[];


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
        //this.shapes = data.shapes;
        _.each(data.shapes,function(shapeData){

            var shape = new ZN.Shape();
            this.shapes.push(shape);

            _.each(shapeData,function(value,key){
                shape[key] = value;
            });

            var pathStr = shapeData.d;
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

            shape['origin'] = {x:ox,y:oy};

        },this);
    },

    updateShapes:function(){

        _.each(data.shapes,function(path){
            var pathStr = path.d;
            var segsRel = Raphael.pathToRelative(pathStr);
            var segsAbs = Raphael._pathToAbsolute(pathStr);
            var x, y, ox= 0, oy=0, mx=0, my=0;
        });
    }





}

ZN.Shape = function () {

}

ZN.Shape.prototype = {
    constructor:ZN.Shape,
    id:"",

    init: function(){

    }

    /*
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
    */
}