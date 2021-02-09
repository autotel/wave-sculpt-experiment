import Module from "./Module";
import {sampleRate} from "./vars";

const defaultSettings={
    amplitude:1,
    bias:0,
    length:1,
    frequency:220,
    shape:"sin",
    points:[],
};

class EnvelopeGenerator extends Module{
    /**
     * @param {{
     * amplitude?:number,
     * bias?:number,
     * length?:number,
     * frequency?:number,
     * points?:[number,number][]
     * }} userSettings
     */
    constructor(userSettings = {}) {
        //apply default settings for all the settings user did not provide
        const settings = defaultSettings;
        Object.assign(settings, userSettings);
        let first = true;
        let phaseAccumulator = 0;
        const accumulatePhase = (frequency) => {
            phaseAccumulator += frequency / sampleRate;
        };


        super(settings);

        this.setFrequency = (to) => {
            settings.frequency = to;
            this.changed({
                frequency: to
            });
            this.cacheObsolete();
            return this;
        };
        this.setPoints = (pointsList) => {
            settings.points=pointsList;
            this.changed({
                points: settings.points
            });
            // console.log(pointsList);
            this.cacheObsolete();
            return this;
        };
        const sortPointsByTime=()=>{
            settings.points.sort((a,b)=>a[0]-b[0]);
            this.changed({points:settings.points});
        }
        const getInterpolation=(position,pointa,pointb)=>{
            const distancea = position-pointa[0];
            const distanceb = pointb[0]-position;
            const distancet = pointb[0] - pointa[0];
            const ret = (pointa[1]*distanceb + pointb[1]*distancea)/distancet;
            // const ret=(
            //     pointa[1] * distancet / 4000
            // );
            if(isNaN(ret)) return 0;
            // return position / 44100;
            // return pointa[1]+pointb[1] * position / 44100;
            return ret;
        }
        this.recalculate = (recursion = 0) => {
            sortPointsByTime();
            /** @returns {[number,number]|false} */
            const getNextPoint=(spl)=>{

                /** @type {[number,number]|false} */
                let selected=false;
                for(let pnum = 0; pnum < settings.points.length; pnum++){
                    const point = settings.points[pnum];
                    selected=point;
                    if(point[0]>spl) return selected;
                };
                return selected;
            }

            const lengthSamples = settings.length * sampleRate;
            
            let nextPoint = getNextPoint(0);
            let currentPoint = [0,0];

            for(let splN=0; splN < lengthSamples; splN++){

                if(!nextPoint) return;
                if(splN>=nextPoint[0]){
                    currentPoint=nextPoint;
                    nextPoint=getNextPoint(splN);
                }
                // const val = currentPoint[1];
                const val = getInterpolation(splN,currentPoint,nextPoint);
                this.cachedValues[splN]=val;
            }
            
            this.changed({ cachedValues: this.cachedValues });
        };
    }
}

export default EnvelopeGenerator;