ZN.Project = function () {
    this.id="";
    this.name="";

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

    // graphics
    this.x = 0;
    this.y = 0;
    this.scale = 0.6;
    this.rotation = 0.0;


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

        _.each(data,function(value,key){
            if(typeof value === 'number' || typeof value === 'string' || typeof value === 'boolean'){
                this[key] = value;
            }
        },this);

        _.each(data.shapes,function(shapeData){

            var shape = new ZN.Shape();
            shape.init();
            this.shapes.push(shape);
            shape.colour = this.colour;

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

            var ox = shape.ox = (minx+maxx)/2;
            var oy = shape.oy = (miny+maxy)/2;
            shape.x = shape.ox;
            shape.y = shape.oy;

            var shapeStr = "";
            _.each(segsAbs,function(seg){
                switch(seg[0]){
                    case "M":
                        seg[1] -= ox;
                        seg[2] -= oy;
                        mx = x, my=y;
                        shapeStr+="M"+seg[1]+","+seg[2];
                        break;
                    case "C":
                        seg[1] -= ox;
                        seg[2] -= oy;
                        seg[3] -= ox;
                        seg[4] -= oy;
                        seg[5] -= ox;
                        seg[6] -= oy;
                        seg.shift();
                        shapeStr+="C"+seg.join(",");

                        break;
                };
            },this);
            shapeStr+="z";
            shape.d = shapeStr;


        },this);
    },

    updateShapes:function(){

        _.each(data.shapes,function(shape){
            var pathStr = shape.d;

            var segsRel = Raphael.pathToRelative(pathStr);
            var segsAbs = Raphael._pathToAbsolute(pathStr);
            var x, y, ox= 0, oy=0, mx=0, my=0;
        });
    }





}

ZN.Shape = function () {
    this.id="";
    this.x=0;
    this.y=0;
    this.ox=0;
    this.oy=0;
    this.vx=0;
    this.vy=0;
    this.path=null;
    this.colour=null;
    this.rotation=0;
    this.opacity = 1.0;

}

ZN.Shape.prototype = {
    constructor:ZN.Shape,


    init: function(){
        //this.rotation = Math.random()*360;
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