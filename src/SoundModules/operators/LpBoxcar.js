import Operator from "./Operator";
import saturate1 from "../../utils/saturate1";
import { sampleRate } from "../common/vars";

//just average, only takes sample into account
class LpBoxcar extends Operator{
    constructor(){
        super();
        let lastOutput = 0;
        let mySampleRate = sampleRate;
        this.reset=(to=0)=>{
            lastOutput=to;
        }
        
        this.setSampleRate = (nsl)=>{
            mySampleRate = nsl;
        }

        this.calculateSample=(sample,frequency,reso,gain,order,saturate)=>{
            //I actually don't know well how to calculate the cutoff frequency, I just made this simplistic guess:
            //a moving average roughly takes "weight" times to get quite close to the value
            let weighta = frequency/mySampleRate;
            if(weighta>1) weighta=1;
            const weightb = 1-weighta;
            let output = (sample * weighta + lastOutput * weightb);
            lastOutput = output;
            output*=gain;
            
            return saturate?saturate1(output):output;
        }
    }
}

export default LpBoxcar;