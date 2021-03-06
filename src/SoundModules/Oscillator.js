
import Output from "./io/Output";
import Module from "./common/Module";
import {sampleRate} from "./common/vars";
import OscillatorOperator from "./operators/OscillatorOperator";
import Input from "./io/Input";

/**
 * @namespace SoundModules.Oscillator
 */

const defaultSettings={
    amplitude:1,
    bias:0,
    length:1,
    frequency:2,
    phase:0,
    shape:"sin",
};

/** 
 * @typedef {Object} OscillatorOptions
 * @property {number} [amplitude]
 * @property {number} [bias]
 * @property {number} [length]
 * @property {number} [frequency]
 * @property {number} [phase]
 * @property {"sin"|"cos"|"ramp"|"noise"|"offset"} [shape]
 */
/**
 * @class Oscillator 
 * @extends Module
 */
class Oscillator extends Module{
    /**
     * @param {OscillatorOptions} userSettings
     */
    constructor(userSettings = {}) {
        //apply default settings for all the settings user did not provide
        const settings = {};
        Object.assign(settings, defaultSettings);
        Object.assign(settings, userSettings);
        let first = true;
        super(settings);

        const operator = new OscillatorOperator({sampleRate});

        this.inputs.frequency = new Input(this);
        this.inputs.amplitude = new Input(this);
        this.inputs.bias = new Input(this);

        const output = this.outputs.main = new Output(this);
        
        this.setFrequency = (to) => {
            return this.set({
                frequency: to
            });
        };
        this.setAmplitude = (to) => {
            return this.set({
                amplitude: to
            });
        };
        
        this.setShape = (to) => {
            try{
                //this one is just to get the error right away.
                //the shape is actually set in the recalculate to ensure
                //sync
                operator.setShape(to);
                this.set({
                    shape: to
                });
                this.cacheObsolete();
            }catch(e){
                throw e;
            }
            return this;
        };
        
        this.setPhase = (to) => {
            return this.set({
                phase: to
            });
        };
        
        this.recalculate = async (recursion = 0) => {
            const lengthSamples = settings.length * sampleRate;
            output.cachedValues = new Float32Array(lengthSamples);

            operator.setShape(settings.shape);
            operator.setPhase(settings.phase);
            
            const [
                freqInputValues,
                ampInputValues,
                biasInputValues
            ] = await Promise.all([
                this.inputs.frequency.getValues(recursion),
                this.inputs.amplitude.getValues(recursion),
                this.inputs.bias.getValues(recursion)
            ]);
            
            for (let a = 0; a < lengthSamples; a++) {
                const freq = (freqInputValues[a] || 0) + settings.frequency;
                const amp = (ampInputValues[a] || 0) + settings.amplitude;
                const bias = (biasInputValues[a] || 0) + settings.bias;
                output.cachedValues[a] = operator.calculateSample(freq, amp, bias);
            }
            //return output.cachedValues;
        };
    }
}

export default Oscillator;