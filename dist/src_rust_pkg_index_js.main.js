/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(self["webpackChunkfields"] = self["webpackChunkfields"] || []).push([["src_rust_pkg_index_js"],{

/***/ "./src/rust/pkg/index.js":
/*!*******************************!*\
  !*** ./src/rust/pkg/index.js ***!
  \*******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"Freeverb\": () => (/* reexport safe */ _index_bg_js__WEBPACK_IMPORTED_MODULE_0__.Freeverb),\n/* harmony export */   \"__wbindgen_throw\": () => (/* reexport safe */ _index_bg_js__WEBPACK_IMPORTED_MODULE_0__.__wbindgen_throw),\n/* harmony export */   \"add\": () => (/* reexport safe */ _index_bg_js__WEBPACK_IMPORTED_MODULE_0__.add),\n/* harmony export */   \"array_filter_comb\": () => (/* reexport safe */ _index_bg_js__WEBPACK_IMPORTED_MODULE_0__.array_filter_comb),\n/* harmony export */   \"array_sine\": () => (/* reexport safe */ _index_bg_js__WEBPACK_IMPORTED_MODULE_0__.array_sine)\n/* harmony export */ });\n/* harmony import */ var _index_bg_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./index_bg.js */ \"./src/rust/pkg/index_bg.js\");\n\n\n\n//# sourceURL=webpack://fields/./src/rust/pkg/index.js?");

/***/ }),

/***/ "./src/rust/pkg/index_bg.js":
/*!**********************************!*\
  !*** ./src/rust/pkg/index_bg.js ***!
  \**********************************/
/***/ ((module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"add\": () => (/* binding */ add),\n/* harmony export */   \"array_sine\": () => (/* binding */ array_sine),\n/* harmony export */   \"array_filter_comb\": () => (/* binding */ array_filter_comb),\n/* harmony export */   \"Freeverb\": () => (/* binding */ Freeverb),\n/* harmony export */   \"__wbindgen_throw\": () => (/* binding */ __wbindgen_throw)\n/* harmony export */ });\n/* harmony import */ var _index_bg_wasm__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./index_bg.wasm */ \"./src/rust/pkg/index_bg.wasm\");\n/* module decorator */ module = __webpack_require__.hmd(module);\n\n\nconst lTextDecoder = typeof TextDecoder === 'undefined' ? (0, module.require)('util').TextDecoder : TextDecoder;\n\nlet cachedTextDecoder = new lTextDecoder('utf-8', { ignoreBOM: true, fatal: true });\n\ncachedTextDecoder.decode();\n\nlet cachegetUint8Memory0 = null;\nfunction getUint8Memory0() {\n    if (cachegetUint8Memory0 === null || cachegetUint8Memory0.buffer !== _index_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.memory.buffer) {\n        cachegetUint8Memory0 = new Uint8Array(_index_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.memory.buffer);\n    }\n    return cachegetUint8Memory0;\n}\n\nfunction getStringFromWasm0(ptr, len) {\n    return cachedTextDecoder.decode(getUint8Memory0().subarray(ptr, ptr + len));\n}\n/**\n* @param {number} a\n* @param {number} b\n* @returns {number}\n*/\nfunction add(a, b) {\n    var ret = _index_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.add(a, b);\n    return ret;\n}\n\nlet cachegetInt32Memory0 = null;\nfunction getInt32Memory0() {\n    if (cachegetInt32Memory0 === null || cachegetInt32Memory0.buffer !== _index_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.memory.buffer) {\n        cachegetInt32Memory0 = new Int32Array(_index_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.memory.buffer);\n    }\n    return cachegetInt32Memory0;\n}\n\nlet cachegetFloat64Memory0 = null;\nfunction getFloat64Memory0() {\n    if (cachegetFloat64Memory0 === null || cachegetFloat64Memory0.buffer !== _index_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.memory.buffer) {\n        cachegetFloat64Memory0 = new Float64Array(_index_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.memory.buffer);\n    }\n    return cachegetFloat64Memory0;\n}\n\nfunction getArrayF64FromWasm0(ptr, len) {\n    return getFloat64Memory0().subarray(ptr / 8, ptr / 8 + len);\n}\n/**\n* @param {number} sample_rate\n* @param {number} duration\n* @param {number} frequency\n* @returns {Float64Array}\n*/\nfunction array_sine(sample_rate, duration, frequency) {\n    try {\n        const retptr = _index_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbindgen_add_to_stack_pointer(-16);\n        _index_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.array_sine(retptr, sample_rate, duration, frequency);\n        var r0 = getInt32Memory0()[retptr / 4 + 0];\n        var r1 = getInt32Memory0()[retptr / 4 + 1];\n        var v0 = getArrayF64FromWasm0(r0, r1).slice();\n        _index_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbindgen_free(r0, r1 * 8);\n        return v0;\n    } finally {\n        _index_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbindgen_add_to_stack_pointer(16);\n    }\n}\n\nlet WASM_VECTOR_LEN = 0;\n\nfunction passArrayF64ToWasm0(arg, malloc) {\n    const ptr = malloc(arg.length * 8);\n    getFloat64Memory0().set(arg, ptr / 8);\n    WASM_VECTOR_LEN = arg.length;\n    return ptr;\n}\n/**\n* @param {number} sample_rate\n* @param {Float64Array} input_samples\n* @param {number} frequency\n* @param {number} dampening_inverse\n* @param {number} dampening\n* @param {number} feedback\n* @returns {Float64Array}\n*/\nfunction array_filter_comb(sample_rate, input_samples, frequency, dampening_inverse, dampening, feedback) {\n    try {\n        const retptr = _index_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbindgen_add_to_stack_pointer(-16);\n        var ptr0 = passArrayF64ToWasm0(input_samples, _index_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbindgen_malloc);\n        var len0 = WASM_VECTOR_LEN;\n        _index_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.array_filter_comb(retptr, sample_rate, ptr0, len0, frequency, dampening_inverse, dampening, feedback);\n        var r0 = getInt32Memory0()[retptr / 4 + 0];\n        var r1 = getInt32Memory0()[retptr / 4 + 1];\n        var v1 = getArrayF64FromWasm0(r0, r1).slice();\n        _index_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbindgen_free(r0, r1 * 8);\n        return v1;\n    } finally {\n        _index_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbindgen_add_to_stack_pointer(16);\n    }\n}\n\nlet cachegetFloat32Memory0 = null;\nfunction getFloat32Memory0() {\n    if (cachegetFloat32Memory0 === null || cachegetFloat32Memory0.buffer !== _index_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.memory.buffer) {\n        cachegetFloat32Memory0 = new Float32Array(_index_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.memory.buffer);\n    }\n    return cachegetFloat32Memory0;\n}\n\nfunction passArrayF32ToWasm0(arg, malloc) {\n    const ptr = malloc(arg.length * 4);\n    getFloat32Memory0().set(arg, ptr / 4);\n    WASM_VECTOR_LEN = arg.length;\n    return ptr;\n}\n/**\n*/\nclass Freeverb {\n\n    static __wrap(ptr) {\n        const obj = Object.create(Freeverb.prototype);\n        obj.ptr = ptr;\n\n        return obj;\n    }\n\n    __destroy_into_raw() {\n        const ptr = this.ptr;\n        this.ptr = 0;\n\n        return ptr;\n    }\n\n    free() {\n        const ptr = this.__destroy_into_raw();\n        _index_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbg_freeverb_free(ptr);\n    }\n    /**\n    * @param {number} sampleRate\n    */\n    constructor(sampleRate) {\n        var ret = _index_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.freeverb_new(sampleRate);\n        return Freeverb.__wrap(ret);\n    }\n    /**\n    * @param {Float32Array} input_l\n    * @param {Float32Array} input_r\n    * @param {Float32Array} output_l\n    * @param {Float32Array} output_r\n    */\n    process(input_l, input_r, output_l, output_r) {\n        try {\n            var ptr0 = passArrayF32ToWasm0(input_l, _index_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbindgen_malloc);\n            var len0 = WASM_VECTOR_LEN;\n            var ptr1 = passArrayF32ToWasm0(input_r, _index_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbindgen_malloc);\n            var len1 = WASM_VECTOR_LEN;\n            var ptr2 = passArrayF32ToWasm0(output_l, _index_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbindgen_malloc);\n            var len2 = WASM_VECTOR_LEN;\n            var ptr3 = passArrayF32ToWasm0(output_r, _index_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbindgen_malloc);\n            var len3 = WASM_VECTOR_LEN;\n            _index_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.freeverb_process(this.ptr, ptr0, len0, ptr1, len1, ptr2, len2, ptr3, len3);\n        } finally {\n            output_l.set(getFloat32Memory0().subarray(ptr2 / 4, ptr2 / 4 + len2));\n            _index_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbindgen_free(ptr2, len2 * 4);\n            output_r.set(getFloat32Memory0().subarray(ptr3 / 4, ptr3 / 4 + len3));\n            _index_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbindgen_free(ptr3, len3 * 4);\n        }\n    }\n    /**\n    * @param {number} value\n    */\n    set_dampening(value) {\n        _index_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.freeverb_set_dampening(this.ptr, value);\n    }\n    /**\n    * @param {boolean} value\n    */\n    set_freeze(value) {\n        _index_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.freeverb_set_freeze(this.ptr, value);\n    }\n    /**\n    * @param {number} value\n    */\n    set_wet(value) {\n        _index_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.freeverb_set_wet(this.ptr, value);\n    }\n    /**\n    * @param {number} value\n    */\n    set_width(value) {\n        _index_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.freeverb_set_width(this.ptr, value);\n    }\n    /**\n    * @param {number} value\n    */\n    set_dry(value) {\n        _index_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.freeverb_set_dry(this.ptr, value);\n    }\n    /**\n    * @param {number} value\n    */\n    set_room_size(value) {\n        _index_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.freeverb_set_room_size(this.ptr, value);\n    }\n}\n\nconst __wbindgen_throw = function(arg0, arg1) {\n    throw new Error(getStringFromWasm0(arg0, arg1));\n};\n\n\n\n//# sourceURL=webpack://fields/./src/rust/pkg/index_bg.js?");

/***/ }),

/***/ "./src/rust/pkg/index_bg.wasm":
/*!************************************!*\
  !*** ./src/rust/pkg/index_bg.wasm ***!
  \************************************/
/***/ ((module, exports, __webpack_require__) => {

"use strict";
eval("\"use strict\";\n// Instantiate WebAssembly module\nvar wasmExports = __webpack_require__.w[module.id];\n__webpack_require__.r(exports);\n// export exports from WebAssembly module\nfor(var name in wasmExports) if(name) exports[name] = wasmExports[name];\n// exec imports from WebAssembly module (for esm order)\n/* harmony import */ var m0 = __webpack_require__(/*! ./index_bg.js */ \"./src/rust/pkg/index_bg.js\");\n\n\n// exec wasm module\nwasmExports[\"\"]()\n\n//# sourceURL=webpack://fields/./src/rust/pkg/index_bg.wasm?");

/***/ })

}]);