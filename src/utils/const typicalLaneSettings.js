import Module from "../SoundModules/common/Module";
import {SVGCanvas} from "../dom-model-gui/GuiComponents/SVGElements";;
import Model from "../dom-model-gui/Model";

/**
 * @typedef {import("../DomInterfaces/components/Lane").LaneOptions} LaneOptions
 */
/**
 * @typedef {Object} TypicalLaneSettingsReturn
 * @property {string} name 
 * @property {number} x position
 * @property {number} y position
 * @property {number} centerAmplitude pan vertical
 * @property {number} rangeAmplitude zoom vertical
 * @property {number} firstSample pan horizontal
 * @property {number} rangeSamples zoom horizontal
 * @property {number} width size horizontal
 * @property {number} height size vertical
 * @property {Module} module 
 * @property {SVGCanvas} drawBoard 
 * 
 * @typedef {Object<String,number|string|Module|Model|SVGCanvas>} ExtraLaneOptions
 */

/**
 * @param {Module} module
 * @param {SVGCanvas} drawBoard
 * @returns {TypicalLaneSettingsReturn}
 * */
const typicalLaneSettings=(module,drawBoard)=>({
    name:"Lane",
    x:0,y:0,
    centerAmplitude:0,rangeAmplitude:2,
    firstSample:0, rangeSamples:44100,
    width:800, height:120,
    module, drawBoard,
})

export default typicalLaneSettings;