import Module from "../../SoundModules/Module";
import { Group, Text, Path } from "../../scaffolding/elements";
import round from "../../utils/round";
import Draggable from "./Draggable";

let defaultKnobOptions = {
    x: 0, y:0,
    radius:20,
    name:"knob",
    class:"knob",
    min:false, max:false,
    deltaCurve:"gain",
}

//TODO:
const deltaCurves = {
    periodseconds:(deltaval)=> {
        const newVal = Math.pow(deltaval/10,2)*10 * Math.sign(deltaval);
        return newVal;
    },
    frequency:(deltaval)=>{
        deltaval*=10;
        return Math.pow(2,1+Math.abs(deltaval))*Math.sign(deltaval);
    },
    gain:(deltaval)=>(deltaval*3),
    channelvol:(deltaval)=>deltaval*5,
}

class Knob extends Group{
    constructor(userOptions){
        const options = {};
        Object.assign(options,defaultKnobOptions);
        Object.assign(options,userOptions);
        super(options);

        let nameText = new Text({
            x:-options.radius,
            y: options.radius + 5
        });
        let valueText = new Text({
            x:-options.radius,
            y: options.radius + 15
        });

        this.add(nameText);
        this.add(valueText);


        let knobShape = new Path();
        this.add(knobShape);
        
        const remakePath=()=>{
            let corners = 7;
            let lastPoint = [];
            let pathString = "";

            for(let corner = 0; corner<corners; corner++){
                let nowPoint=[
                    Math.sin(Math.PI * 2 * corner/corners) * options.radius * 0.6,
                    Math.cos(Math.PI * 2 * corner/corners) * options.radius * 0.6,
                ];
                if(corner > 0){
                    pathString += `Q ${lastPoint[0]},${lastPoint[1]} ${nowPoint[0]},${nowPoint[1]} `
                }else{
                    pathString += `M ${nowPoint[0]},${nowPoint[1]}`;
                }
                lastPoint=nowPoint;
            }
            
            pathString += `z`;

            if(options.min !==false && options.max !==false){
                pathString += `M ${-options.radius},${0}`;
                pathString += `Q ${-options.radius},${0} ${0},${0}`
            }
            knobShape.set("d",pathString);
        }

        remakePath();

        const changeCallbacks=[];
        
        this.step=1/300;
        
        let pixValueOnDragStart;

        const distanceToValue=(pixels)=> pixels * this.step;
        const valueToPixels=(value)=> value / this.step ;
        const getAngle=()=>{
            let rpv = this.step * 300;
            if(options.min!==false && options.max!==false){
                let range = options.max - options.min;
                rpv = 1/range;
            }
            return rpv * this.value * 360;
        }

        const draggable = new Draggable(knobShape.domElement);

        draggable.dragStartCallback=()=>{
            pixValueOnDragStart = valueToPixels(this.value);
            if(isNaN(pixValueOnDragStart)) pixValueOnDragStart=0;
        }
        draggable.positionChanged=(newPosition)=>{

            //choose the lengthiest coord to define delta
            let theDistance = -newPosition.delta.y;
            let valueDelta = distanceToValue(theDistance);
            let newValue = deltaCurves[options.deltaCurve](valueDelta);
            
            newValue+=distanceToValue(pixValueOnDragStart);

            if(options.min !== false){
                if(newValue < options.min) newValue = options.min;
            }
            if(options.max !== false){
                if(newValue > options.max) newValue = options.max;
            }
            this.changeValue(
                newValue
            );
        }

        this.value=0;
        /** @param {Function} cb */
        this.onChange=(cb)=>{
            changeCallbacks.push(cb);
        }
        const handleChanged=(changes)=> changeCallbacks.map((cb)=>cb(changes));
        
        this.updateGraphic=()=>{
            knobShape.set("transform",`rotate(${getAngle()})`);
            nameText.set("text",options.name);
            valueText.set("text","~"+(round(this.value,2)));
        }

        this.changeValue=(to)=>{
            this.value=to;
            this.updateGraphic();
            handleChanged({value:to});
        }
        
        /** 
         * @param {Module} module
         * @param {string} parameterName
         */
        this.setToModuleParameter=(module,parameterName)=>{
            
            let propertyObject = {};
            propertyObject=module.settings;
            options.name=parameterName;
            this.value=propertyObject[parameterName];

            this.onChange(({value})=>{
                propertyObject[parameterName] = value;
                module.set(propertyObject);
            });
            module.onUpdate((changes)=>{
                if(changes[parameterName]){
                    this.value=changes[parameterName];
                    this.updateGraphic();
                }
            });
            switch (parameterName){
                case "frequency":
                    this.setDeltaCurve("frequency");
                    this.setMinMax(0,22000);
                break;

                case "time":
                case "length":
                    this.setDeltaCurve("periodseconds");
                    this.setMinMax(0,false);
                break;
            }

            this.updateGraphic();
        }

        this.setMinMax=(min,max)=>{
            if(max<=min) console.warn("max<=min",min,max);
            options.min=min;
            options.max=max;
            remakePath();
            return this;
        }
        /**
         * @param {"periodseconds"|"frequency"|"gain"|"channelvol"} deltaCurve
         **/
        this.setDeltaCurve=(deltaCurve)=>{
            options.deltaCurve=deltaCurve;
            return this;
        }
    }
}

export default Knob;