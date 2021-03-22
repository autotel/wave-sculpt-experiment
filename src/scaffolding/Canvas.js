
//only for type:
import { Component } from "./elements";

function Canvas(){
    // const element = document.createElementNS("http://www.w3.org/2000/svg",'svg');
    const element =  document.createElementNS("http://www.w3.org/2000/svg", 'svg');
    this.element = element;
    
    // element.setAttribute('viewBox',"0 0 1000 1000");
    element.setAttribute('width',"100%");
    element.setAttribute('height',"1000px");
    
    document.body.appendChild(element);

    /** @param {{domElement:Node}} elem */
    this.add=(elem)=>{
        element.appendChild(elem.domElement);
    }

    const sizeChangeCallbacks = [];
    this.size = {
        width:0,
        height:0,
        onChange:(callback)=>sizeChangeCallbacks.push(callback)
    }

    //something is causing an infinite call cycle, this is a hacky patch for that.
    let doSize=false;
    setInterval(()=>{
        if(doSize){
            this.size.width=window.outerWidth;
            this.size.height=window.outerHeight;
            sizeChangeCallbacks.forEach((callback)=>callback());
            doSize=false;
            console.log("recalc size");
        }
    },1000);

    const recalcSize = () => {
        doSize=true;
    }
    
    const scrollChangeCallbacks = [];
    this.scroll = {
        top:0,
        left:0,
        onChange:(callback)=>scrollChangeCallbacks.push(callback)
    }
    const recalcScroll = () => {
        this.scroll.top=window.scrollX;
        this.scroll.left=window.scrollY;
        scrollChangeCallbacks.forEach((callback)=>callback());
    }

    window.addEventListener("resize",recalcSize);
    window.addEventListener("scroll",recalcScroll);
    window.addEventListener("DOMContentLoaded",()=>{
        recalcSize();
        recalcScroll();
    });

}

export default Canvas;