import RustProcessor from "../../rust/RustProcessor";

const rustProcessor = RustProcessor.get();

self.onmessage = ({data}) => {

    rustProcessor.onReady(()=>{

        self.postMessage({
            log: "start freeberb thread",
        });
        

        self.postMessage({
            log: data,
        });

        let {
            settings,
            sampleRate,
            inputValues,
        } = data;

        const audioArray = new Float64Array(
            rustProcessor.freeverb(
                inputValues
            )
        );

        self.postMessage({
            audioArray
        });

    });
};
