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


    setStyles:function(data){
        //this.shapes = data.shapes;

        _.each(data,function(value,key){
            if(typeof value === 'number' || typeof value === 'string' || typeof value === 'boolean'){
                this[key] = value;
            }
        },this);


        var cScale = chroma.scale([data.colours[0],data.colours[1]]);//['lightyellow', 'navy']);
        cScale(0.5);  // #7F7FB0
        var nShapes = data.shapes.length;

        _.map(data.shapes,function(shape){
            var ids = shape.id.split('.');
            var nParents = ids.length-1;
            if(nParents>0){
                ids.pop();

                var parentId = ids.join('.');
                shape['parentId'] = parentId;

            }
        });

        data.shapes = _.sortBy(data.shapes, function(shape) {
            var matches = shape.id.match(/\./g);
            var ret = matches?matches.length:0;
            return ret;
        });


        _.each(data.shapes,function(shapeData,index){

            var shape = new ZN.Shape();
            shape.init();

            if(shapeData.hasOwnProperty('parentId')){
                var parentId = shapeData.parentId;
                var parent = _.find(data.shapes,{'id':parentId});
                if(parent){

                }
                else{
                    console.log('Parse shapes. Parent not found.');
                }

            }
            this.shapes.push(shape);
            shape.colour = cScale(index/nShapes);//this.colour;

            _.each(shapeData,function(value,key){
                shape[key] = value;
                shape.initial[key]=value;
            });


            // bounds
            var bounds = new ZN.Bounds();
            if(shapeData.bounds){
                var b = shapeData.bounds;
                _.each(shapeData.bounds,function(value,key){
                    shapeData.bounds[key] = parseFloat(value);
                });
                bounds.setBounds(b.x, b.y, b.x+ b.width, b.y+ b.height);
            }

            shape.bounds = bounds;

            // paths
            var pathStr = shapeData.d;
            //var segsRel = Raphael.pathToRelative(pathStr);
            var segsAbs = Snap.path.toAbsolute(pathStr);
            //var segsAbs = Raphael._pathToAbsolute(pathStr);
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

                if(x<minx) minx = x;
                if(x>maxx) maxx = x;
                if(y<miny) miny = y;
                if(y>maxy) maxy = y;

            },this);


            var ox = shape.initial.x = (minx+maxx)/2;
            var oy = shape.initial.y = (miny+maxy)/2;
            shape.x = shape.initial.x;
            shape.y = shape.initial.y;
            shape.width = maxx-minx;
            shape.height = maxy-miny;
            //shape.bounds = new ZN.Bounds();
            //shape.bounds.setArray(minx,miny,maxx,maxy);

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
    }

    /*
    updateShapes:function(){

        _.each(data.shapes,function(shape){
            var pathStr = shape.d;

            var segsRel = Raphael.pathToRelative(pathStr);
            var segsAbs = Raphael._pathToAbsolute(pathStr);
            var x, y, ox= 0, oy=0, mx=0, my=0;
        });
    }
    */


}

ZN.Shape = function () {
    this.id="";
    this.x=0;
    this.y=0;
    this.vx=0;
    this.vy=0;
    this.path=null;
    this.colour=null;
    this.rotation=0;
    this.opacity = 1.0;
    this.bounds=null;
    this.width=0;
    this.height=0;
    this.bounds = null;
    this.boundsPath = null;
    this.shapes=[];
    this.initial={
        x:0,y:0,colour:0,rotation:0,opacity:0,d:""
    };

}

ZN.Shape.prototype = {
    constructor:ZN.Shape,


    init: function(){
        //this.vx = (Math.random()-0.5)*0.9;
        //this.vy = (Math.random()-0.5)*0.9;
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


ZN.Bounds = function(){
    this.left=0;
    this.right=0;
    this.top=0;
    this.bottom=0;
}

ZN.Bounds.prototype = {
    constructor:ZN.Bounds,
    setBounds:function(l,t,r,b){
        this.left=l;
        this.right=r;
        this.top=t;
        this.bottom=b;
    },
    width:function(){
        return this.right-this.left;
    },
    height:function(){
        return this.bottom-this.top;
    }


}