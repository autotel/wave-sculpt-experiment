import { Path } from  "../../dom-model-gui/GuiComponents/SVGElements";
import ValuePixelTranslator from "../../utils/ValuePixelTranslator";


class WaveDisplay extends Path{
    /** @param {ValuePixelTranslator} translator */
    constructor(translator) {

        const settings=translator.settings;

        super({
            d: `M ${0},${settings.height / 2}
            L ${0},${settings.height / 2} ${settings.width},${settings.height / 2}`,
            fill: "transparent",
            stroke: "black"
        });
        

        const superSetAttributes = this.setAttributes;
        let theWave = [];
        /** 
         * @param {Object} changes
         */
        this.set = (changes) => {
            
            if (changes.wave || changes.width) {
                if(changes.wave) theWave = changes.wave;
                if(!theWave) return;
                let str = `M ${0},${settings.height / 2}`;
                
                let end = Math.min(
                    settings.width,
                    translator.sampleNumberToX(theWave.length)
                );
                
                //todo: take whichever has less: pixels or samples.
                //when multi samples per pixel, use max and a filled area
                //otherwise, it's a line
                for (let pixelNumber = 0; pixelNumber < end; pixelNumber++) {
                    const index=translator.xToSampleNumber(pixelNumber);
                    const top = translator.amplitudeToY(theWave[index]);
                    str += `L ${pixelNumber},${top}`;
                }

                str += `L ${end},${translator.amplitudeToY(0)}`;
                str += `L ${0},${translator.amplitudeToY(0)} `;
                str += `z`;

                superSetAttributes({'d':str});
            }
        };
    }
}
export default WaveDisplay;
