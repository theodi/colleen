/*
 Code derived from Dan Gries
 N-body planar choreographies: illustrating mathematics in HTML5 canvas
 http://rectangleworld.com/blog/archives/1018
 rectangleworld.com

 For more information about the mathematics behind the orbits animated in this application, see the links within the page.

 */

ZN.NBodyChoreo = function () {

    this.app = null;
    this.model = null;

    this.jsonData=null;
    this.numParticles = 0;
    this.particles = [];

    this.xSinFreq = [];
    this.xCosFreq = [];
    this.ySinFreq = [];
    this.yCosFreq = [];
    this.xSinCoeff = [];
    this.xCosCoeff = [];
    this.ySinCoeff = [];
    this.yCosCoeff = [];

    this.time = 0;
    this.tInc = 0.001; // tIncMin = 0.001; tIncMax = 0.07;

}

ZN.NBodyChoreo.prototype = {
    constructor:ZN.NBodyChoreo,

    init:function(){//(app,model){
        //this.app = app;
        //this.model = model;
        this.jsonData = orbitData;

    },


    update: function(){

        this.time = (this.time + this.tInc) % (2*Math.PI);
        //update particles
        this.setParticlePositions(this.time);


    },

    makeParticles: function() {
        var i;

        this.particles = [];

        for (i = 0; i<this.numParticles; i++) {
            var phase = Math.PI*2*i/this.numParticles;

            var p = {
                x: 0,
                y: 0,
                lastX: 0,
                lastY: 0,
                phase: phase

            }
            this.particles.push(p);
        }

        this.setParticlePositions(this.time);
        this.resetLastPositions();
    },


    resetLastPositions: function(){
        //set initial last positions
        for (i = 0; i<this.numParticles; i++) {
            this.particles[i].lastX = this.particles[i].x;
            this.particles[i].lastY = this.particles[i].y;
        }
    },

    setStartPositions: function() {
        var pixX;
        var pixY;
        var j;

        // todo set viewport coords
        /*
        endPixX = [];
        endPixY = [];
        staticOrbitDrawPointsX = [];
        staticOrbitDrawPointsY = [];
        for (i = 0; i<this.numParticles; i++) {
            j = (i + 1) % this.numParticles;
            pixX = xPixRate*(this.particles[j].x - xMin);
            pixY = yPixRate*(this.particles[j].y - yMax);
            endPixX.push(pixX);
            endPixY.push(pixY);
            staticOrbitDrawPointsX.push(xPixRate*(this.particles[i].x - xMin));
            staticOrbitDrawPointsY.push(yPixRate*(this.particles[i].y - yMax));
        }
        */
    },

    getOrbitIndex: function(name){
        var index = _.findIndex(this.jsonData, function(orbit) {
            return orbit.name == name;
        });
        return index;
    },

    setOrbit: function(orbitIndex){

        var orbitObject = this.jsonData.orbits[orbitIndex];

        this.numParticles = orbitObject.numParticles;

        this.xSinFreq = [];
        this.xCosFreq = [];
        this.ySinFreq = [];
        this.yCosFreq = [];
        this.xSinCoeff = [];
        this.xCosCoeff = [];
        this.ySinCoeff = [];
        this.yCosCoeff = [];

        var arrays;

        arrays = separateArray(orbitObject.x.sin);
        this.xSinFreq = arrays.even.slice(0);
        this.xSinCoeff = arrays.odd.slice(0);

        arrays = separateArray(orbitObject.x.cos);
        this.xCosFreq = arrays.even.slice(0);
        this.xCosCoeff = arrays.odd.slice(0);

        arrays = separateArray(orbitObject.y.sin);
        this.ySinFreq = arrays.even.slice(0);
        this.ySinCoeff = arrays.odd.slice(0);

        arrays = separateArray(orbitObject.y.cos);
        this.yCosFreq = arrays.even.slice(0);
        this.yCosCoeff = arrays.odd.slice(0);


        this.makeParticles();


        /*
        if (!orbitObject.length) {
            timeFactor = 1;
        }
        else {
            timeFactor = (orbitObject.plotWindow.xMax - orbitObject.plotWindow.xMin)/orbitObject.length;
        }
        */

        this.time = 0;

        /*
        if (trajectoriesOn) {
            drawingStaticOrbit = true;
            orbitDrawStartTime = orbitDrawTime = this.time;
        }
        else {
            drawingStaticOrbit = false;
        }
        */

        this.setParticlePositions(0);
        this.resetLastPositions();
        this.setStartPositions();

        //if stopped, draw particles in correct place
        /*
        if (!running) {
            clearParticleLayer();
            drawParticles();
        }
        */
        //setTInc();

    },

    setParticlePositions: function(t) {
        var i;
        var len;
        var particles = this.particles;
        len = particles.length;
        for (i = 0; i < len; i++) {
            particles[i].lastX = particles[i].x;
            particles[i].lastY = particles[i].y;
            particles[i].x = this.fourierSum(t,this.xSinFreq, this.xSinCoeff, this.xCosFreq, this.xCosCoeff, particles[i].phase);
            particles[i].y = this.fourierSum(t,this.ySinFreq, this.ySinCoeff, this.yCosFreq, this.yCosCoeff, particles[i].phase);
        }
    },

    fourierSum: function(t,sinFreqs,sinCoeffs,cosFreqs,cosCoeffs,phaseShift) {
        var i, len;
        var sum = 0;
        len = sinCoeffs.length;
        for (i = 0; i < len; i++) {
            sum += sinCoeffs[i]*Math.sin(sinFreqs[i]*(t + phaseShift));
        }
        len = cosCoeffs.length;
        for (i = 0; i < len; i++) {
            sum += cosCoeffs[i]*Math.cos(cosFreqs[i]*(t + phaseShift));
        }
        return sum;
    }






}

