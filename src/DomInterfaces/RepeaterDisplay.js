
import { Circle, Text, SVGCanvas }  from "../dom-model-gui/GuiComponents/SVGElements";
import Draggable from "../dom-model-gui/Interactive/Draggable";

import round from "../utils/round";
import ValuePixelTranslator from "../utils/ValuePixelTranslator";
import typicalLaneSettings from "../utils/const typicalLaneSettings";
import WaveLane from "./LaneTypes/WaveLane";
import Repeater from "../SoundModules/Repeater";
import Button from "../dom-model-gui/GuiComponents/Button";
const vectorTypes = require("../dom-model-gui/utils/Vector2");
/** @typedef {vectorTypes.MiniVector} MiniVector
/**
 * @namespace DomInterface.RepeaterDisplay
 */
/** 
 * @class RepeaterDisplay
 * @extends WaveLane
 */
class RepeaterDisplay extends WaveLane{
    /**
     * @param {object} options
     * @param {Repeater} options.module
     * @param {SVGCanvas} options.drawBoard
     **/
    constructor (options){
        const {module,drawBoard} = options;
        const settings=typicalLaneSettings(module,drawBoard);
        //plave for defaults
        settings.name="Repeater";
        Object.assign(settings,options);

        const translator=new ValuePixelTranslator(settings);
        super(settings,translator);

        const lengthKnob = this.addKnob("length");
        const monophonicToggle = this.addToggle("monophonic");
        this.addKnob("gain");
        
        const addPointButton = new Button({name:"add rep."});
        this.appendToControlPanel(addPointButton);

        addPointButton.onPush(()=>{
            console.log("pushed");
            module.addPoint();
        });


        //lane has a contents sprite.
        const contents=this.contents;

        const readoutText =  new Text({
            class:"freq-times-amp",
            x:10, y:settings.height,
            text:"---",
        });
        contents.add(readoutText);

        class Handle extends Circle {
            constructor(settings){
                let circleSettings = {r:10};
                Object.apply(circleSettings,settings);
                super(circleSettings);
                this.point=[0,0];
                const draggable = this.draggable = new Draggable(this.domElement);
                
                /** @param {MiniVector} pos */
                draggable.positionChanged=(pos)=>{
                    this.handleGuiChangedPoint(pos);
                }

                let activated=false;
                
                /**
                 * change handle position visually and propagate the result to the module. 
                 * @param {MiniVector} pos
                 **/
                this.handleGuiChangedPoint = (pos) =>{
                    let changes = {};
                    //display the change in the gui
                    this.attributes.cx=pos.x;
                    this.attributes.cy=pos.y;
                    this.update();

                    //update the point belonging to the module
                    this.point[0]=translator.xToSampleNumber(pos.x);
                    this.point[1]=translator.yToAmplitude(pos.y);

                    //let the module know of the change
                    let newPoints=handles.map((h)=>h.point);//.sort();
                    // module.setPoints(module.settings.points);

                    changes.points=newPoints;

                    //find the last handle, so that it's used to set the length of the envelope
                    let latestSpl = 0;
                    handles.map((handle)=>{
                        if(handle.point[0]>latestSpl) latestSpl=handle.point[0];
                    }); 

                    //to use last point as length selector
                    // if(!module.settings.loop)
                    //     changes.length=(latestSpl / sampleRate);

                    module.set(changes);
                }
                /**
                 * update the handle's point coordinates and cause
                 * this change to be reflected visually
                 */
                this.handleModelChangedPoint = () => {
                    const point = this.point;
                    let pos = {
                        x:translator.sampleNumberToX(point[0]),
                        y:translator.amplitudeToY(point[1]),
                    }
                    draggable.setPosition(pos,false);
                    this.attributes.cx=pos.x;
                    this.attributes.cy=pos.y;
                    this.update();
                }

                this.activate = ()=>{ 
                    if(!activated) contents.add(this);
                    activated=true;
                }
                this.deactivate = ()=>{
                    if(activated)contents.remove(this);
                    activated=false;
                }
            }
        }
        
        const handles=[
            new Handle(),
        ];

        //udpate the display of the draggable points according to the provided poits list and the translator
        function updatePointsPositions(points){
            points.map((point,index)=>{
                if(!handles[index]){
                    handles[index]=new Handle();
                    handles[index].point=point;
                }
                handles[index].handleModelChangedPoint();
                handles[index].activate();
            });
            //undisplay remaining handles, if any
            for(let index = points.length; index < handles.length; index++){
                handles[index].deactivate();
            }
        }

        
        handles.map((handle)=>{
            const frequencyDraggable=handle.draggable;
            handle.activate();
        });

        //helps moving points according to zoom level
        translator.onChange((changes)=>{
            updatePointsPositions(module.settings.points);
        });
        
        //let us represent changes in the module graphically
        module.onUpdate((changes)=>{
            if(
                changes.frequency!==undefined ||
                changes.amplitude!==undefined
            ){
                readoutText.setAttributes({
                    "text":
                        `${
                            round(module.settings.frequency,4)
                        }Hz; ${
                            round(module.settings.amplitude,4)
                        }U ${
                            module.settings.frequency>(settings.rangeSamples/10)?"(ALIASED)":""
                        }`
                    });
            }
            if(changes.points){
                updatePointsPositions(changes.points);
            }
        });

        module.triggerInitialState();
    }
};

export default RepeaterDisplay;
