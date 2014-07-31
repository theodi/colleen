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

    this.timeseries = {
        c:{/*series:{},count:{},max:{}*/},
        u:{/*series:{},count:{},max:{}*/}
    };
    this.shapes=[];

    // graphics
    this.x = 0;
    this.y = 0;
    this.sx = 0.9, sy = 0.9;
    this.rotation = 0.0;
    this.duration = 1.0;

    // default transform
    this.initial={
        x:0,y:0,sx:1.0,sy:1.0,rotation:0
    };

    // transform for background
    this.bg={
        x:0,y:0,sx:1.0,sy:1.0,rotation:0
    };

    // background scale animation
    this.bgScaleAnim = {};






}

ZN.Project.prototype = {
    constructor:ZN.Project,

    setBackground:function(props){
        for(var key in props){
            this[key] = props[key];
            this.bg[key] = props[key];
            this.initial[key] = props[key];
        }
    },

    setFocus:function(props){
        for(var key in props){
            this[key] = props[key];
            this.initial[key] = props[key];
        }
    },

    setPropsFromBackground:function(){
        for(var key in this.bg){
            this[key] = this.bg[key];
        }
    },

    setRules:function(data){
        //this.shapes = data.shapes;

        _.each(data,function(value,key){
            if(typeof value === 'number' || typeof value === 'string' || typeof value === 'boolean' || key=="animation"){
                this[key] = value;
            }
        },this);


        var fillScale = null;
        if(data.hasOwnProperty('fills')){
            fillScale = chroma.scale([data.fills[0],data.fills[1]]);
        }

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
            shape.createTrail();


            var parent = null;
            if(shapeData.hasOwnProperty('parentId')){
                isChild = true;
                var parentId = shapeData.parentId;
                parent = _.find(this.shapes,{'id':parentId});
                if(parent){
                    shape.parent = parent;
                    shape.parent.children.push(shape);
                }
                else{
                    console.log('Parse shapes. Parent not found.');
                }

            }
            this.shapes.push(shape);


            _.each(shapeData,function(value,key){
                shape[key] = value;
                if(key!="id"){
                    shape.initial[key]=value;
                }
            });

            if(fillScale){
                shape.fill = fillScale(index/nShapes).hex();
            }


            //if(parent) shape.fill="#000000";
            //shape.opacity=0.2;


            shape.fillObj = chroma(shape.fill).alpha(shape.opacity);
            shape.fill = shape.fillObj.css();


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
            var segsAbs = Snap.path.toAbsolute(pathStr);
            shape.pathSegs = segsAbs;


            // find bounds
            var x, y, ox= 0, oy=0, mx=0, my=0,
                minx=10e6, //Number.MAX_VALUE,
                miny=10e6,//Number.MAX_VALUE,
                maxx=-10e6,//Number.MAX_VALUE,
                maxy=-10e6;//Number.MAX_VALUE;

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

                if(seg[0]=="M" || seg[0]=="C"){
                    if(x<minx) minx = x;
                    if(x>maxx) maxx = x;
                    if(y<miny) miny = y;
                    if(y>maxy) maxy = y;
                }

            },this);



            var ox =  (minx+maxx)/2;
            var oy =  (miny+maxy)/2;



            shape.x = shape.initial.x = ox;
            shape.y = shape.initial.y = oy;
            shape.width = maxx-minx;
            shape.height = maxy-miny;


            // set origin to centre of shape
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

            // for child shapes set origin to parent
            if(parent){
                shape.x = shape.initial.x = ox-parent.x;
                shape.y = shape.initial.y = oy-parent.y;

            }

            segsAbs = Snap.path.toAbsolute(shapeStr);
            shape.pathSegs = segsAbs;


        },this);


        // add animation rules applied to multiple shapes
        _.each(data.shape_animation,function(shapeAnim){
            var anims = shapeAnim.animation;
            var shapeIds = shapeAnim.shape_ids;
            var nShapes = shapeIds.length;

            _.each(shapeIds, function(id, shapeIndex){
                var animsClone = _.cloneDeep(anims);
                _.each(animsClone, function(anim){
                    if(anim.time_fn){
                        switch(anim.time_fn){
                            case "random":
                                anim.time = Math.random()*anim.duration[0];
                                break;
                            case "index":
                                anim.time = shapeIndex/nShapes*anim.duration[0];
                                break;
                        }
                    }
                });
                var shape = _.find(this.shapes, {"id":id});
                if(!shape.animation){
                    shape.animation=[];
                }
                shape.animation = shape.animation.concat(animsClone);

            },this);
        },this);


        // add loop param to each animation
        _.each(this.shapes,function(shape){
            if(shape.animation){
                _.each(shape.animation, function(anim){
                    anim['loop'] = 0;
                    anim['curDuration'] = anim.duration[0];

                });

            }
        },this);


        // project animations
        if(this.animation){
            _.each(this.animation, function(anim){
                this['']=
                anim['loop'] = 0;
                anim['curDuration'] = anim.duration[0];

            });

        }

        var duration = Math.random()*60.0+1000.0;
        this.bgScaleAnim = {"type":"scale","data":"day","sx":[0.02,0.25],"sy":[0.02,0.25],"tween":"linear","fn":"sqrt","duration":[duration,duration], "time":0, "curDuration":duration,"loop":0};



    }

}

ZN.Shape = function () {
    this.id="";
    this.x=0;
    this.y=0;
    this.vx=0;
    this.vy=0;
    this.sx=1.0;
    this.sy=1.0;
    this.path=null;
    this.pathSegs=[];
    this.d = "";
    this.fill="0x000000";
    this.flllObj = null;
    this.rotation=0;
    this.opacity = 1.0;
    this.width=0;
    this.height=0;
    //this.duration = 1.0;

    this.bounds = null;
    this.boundsPath = null;

    this.children=[];
    this.parent=null;
    this.initial={
        x:0,y:0,sx:1.0,sy:1.0,fill:"0x000000",rotation:0,opacity:0,d:""
    };
    this.trail = null;

}

ZN.Shape.prototype = {
    constructor:ZN.Shape,

    getPoints:function(){
        var pts=[];
        _.each(this.pathSegs,function(seg){
            switch(seg[0]){
                case "L":
                    pts.push({x:seg[1],y:seg[2]});
                    break;
                case "C":
                    pts.push({x:seg[5],y:seg[6]});
                    break;
            };

        },this);

        return pts;

    },
    createTrail: function(opts){

        this.trail = new ZN.Trail();
        this.trail.type = "point";

    },

    setTrailData: function(shape){
        this.x = shape.x;
        this.y = shape.y;
        this.rotation = shape.rotation;
        this.sx = shape.sx;
        this.sy = shape.sy;
        this.d = shape.d;
        this.opacity = shape.opacity;
        this.fill = shape.fill;

    },

    addTrailShape: function(){

        switch(this.trail.type){
            case "path":

                var shape = new ZN.Shape();
                shape.setTrailData(this);

                this.trail.shapes.push(shape);
                break;
            case "point":


                var pts = this.getPoints();
                for(var p=0;p<pts.length;p++){
                    var pt = pts[p];

                    var shape = new ZN.Shape();
                    shape.setTrailData(this);

                    shape.sx = this.sx*3.0;
                    shape.sy = this.sy*3.0;

                    shape.x = pt.x + this.x;
                    shape.y = pt.y + this.y;

                    var squarePath =
                        "M-0.5,-0.5L-0.5,0.5L0.5,0.5L0.5,-0.5L-0.5,-0.5Z";
                     /*  "M-0.5,-0.5"+
                    "C-0.5,0.5,-0.5,0.5,-0.5,0.5"
                    "C0.5,0.5,C0.5,0.5,C0.5,0.5"+
                    "C0.5,-0.5,C0.5,-0.5,C0.5,-0.5"+
                    "C-0.5,-0.5,-0.5,-0.5,-0.5,-0.5z"*/

                    shape.d = squarePath;



                    this.trail.shapes.push(shape);
                }

                break;


        }

    }

}


ZN.Trail = function(){
    this.type = "path"; // "points"; //
    this.shapes = [];


}
ZN.Trail.prototype = {
    constructor:ZN.Trail,

    init: function(){

    }

};



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