class PingPongProcessor extends AudioWorkletProcessor {
    constructor(...args) {
        super(...args)
        this.port.onmessage = (e) => {
            console.log(e.data)
            this.port.postMessage('pong')
        }
    }
    process(inputs, outputs, parameters) {
        return true
    }
}

registerProcessor('ping-pong-processor', PingPongProcessor)