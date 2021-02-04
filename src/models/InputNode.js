import Module from "./Module";

/** @param {Module} owner */
class InputNode {
    constructor(owner) {
        /** @type {undefined | Module} */
        this.input = undefined;
        this.owner = owner;
        this.disconnect = () => {
            if (this.input) {
                this.input.disconnect(this);
            }
        };

        this.getValues = () => {
            // if(!this.input) throw new Error("requested getValues from nonconnected input");
            if (this.input)
                return this.input.getValues();
            return [];
        };
        this.inputChanged = owner.inputChanged;
    }
}
export default InputNode;

