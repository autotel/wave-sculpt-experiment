import Module from "./Module";
import { sampleRate } from "./vars";

/**
 * @namespace SoundModules.Hipparchus
 */

/**
 * @typedef {Array<number>} EnvelopePoint a tuple containing two numbers: first is sample number (integers only), and the second is level (float)
 */

/** 
 * @typedef {Object} HipparchusOptions
 * @property {number} [gain]
 * @property {number} [rotation] rotation in ratio, zero equals 0 degrees and 1 equals 360 degrees
 */

/** @type {HipparchusOptions} */
const defaultSettings = {
    rotation: 0,
    gain:1,
};

//from Vectoidal

/**
 * convert x,y into th,r polar coords around 0,0
 * @param {{x:number,y:number}} cartesian
 * @param {number?} dcOffset
 * @returns {{th:number,r:number}} polar
 */
const cartesianToPolar=({x,y},dcOffset=0)=>{
    return{
        r:Math.sqrt(x*x+y*y)-dcOffset,
        th:Math.atan2(y,x)
    }
};
const polarToCartesian=({th,r},dcOffset=0)=>{
    return {
        x:Math.cos(th)*(r+dcOffset),
        y:Math.sin(th)*(r+dcOffset)
    }
}
/**
 * convert th,r into x,y coords around 0,0. 
 * X is not calculated and set to 0
 * @param {{th:number,r:number}} polar
 * @param {number?} dcOffset
 * @returns {{x:0,y:number}} 
 */
const polarToCartesianAndSquashX=({th,r},dcOffset=0)=>{
    return {
        x:0,
        y:Math.sin(th)*(r+dcOffset)
    }
}

const voz=(val)=>val?val:0;

/**
 * @class Hipparchus 
 * @extends Module
 */
class Hipparchus extends Module {
    /**
     * @param {HipparchusOptions} userSettings
     */
    constructor(userSettings = {}) {
        //apply default settings for all the settings user did not provide
        const settings = {};
        Object.assign(settings, defaultSettings);
        Object.assign(settings, userSettings);
        
        super(settings);
        
        this.hasInput("x");
        this.hasInput("y");
        this.hasInput("rotation");

        this.setAngle = (to) => {
            return this.set({
                rotation: to
            });
        }
        this.setGain = (to) => {
            return this.set({
                gain: to
            });
        }


        this.recalculate = (recursion = 0) => {

            let gain = settings.gain;
            let xIn = this.inputs.x.getValues(recursion);
            let yIn = this.inputs.y.getValues(recursion);
            let rotationIn = this.inputs.rotation.getValues(recursion);

            this.cachedValues=[];

            xIn.map((x,sampleNumber)=>{
                let y = voz(yIn[sampleNumber]);
                let rotationSample = voz(rotationIn[sampleNumber]);

                let polarRotation = (rotationSample + settings.rotation)  * Math.PI;
                
                const polar = cartesianToPolar({x,y},0);
                polar.th += polarRotation;
                const result = polarToCartesianAndSquashX(polar).y;

                this.cachedValues[sampleNumber] = result * gain;

            });

            this.changed({ cachedValues: this.cachedValues });
        };
    }
}

export default Hipparchus;