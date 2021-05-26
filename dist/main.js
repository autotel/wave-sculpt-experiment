/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 88:
/***/ ((__unused_webpack_module, exports) => {

exports.generatePerlinNoise = generatePerlinNoise;
exports.generateWhiteNoise = generateWhiteNoise;

function generatePerlinNoise(width, height, options) {
  options = options || {};
  var octaveCount = options.octaveCount || 4;
  var amplitude = options.amplitude || 0.1;
  var persistence = options.persistence || 0.2;
  var whiteNoise = generateWhiteNoise(width, height);

  var smoothNoiseList = new Array(octaveCount);
  var i;
  for (i = 0; i < octaveCount; ++i) {
    smoothNoiseList[i] = generateSmoothNoise(i);
  }
  var perlinNoise = new Array(width * height);
  var totalAmplitude = 0;
  // blend noise together
  for (i = octaveCount - 1; i >= 0; --i) {
    amplitude *= persistence;
    totalAmplitude += amplitude;

    for (var j = 0; j < perlinNoise.length; ++j) {
      perlinNoise[j] = perlinNoise[j] || 0;
      perlinNoise[j] += smoothNoiseList[i][j] * amplitude;
    }
  }
  // normalization
  for (i = 0; i < perlinNoise.length; ++i) {
      perlinNoise[i] /= totalAmplitude;
  }

  return perlinNoise;

  function generateSmoothNoise(octave) {
    var noise = new Array(width * height);
    var samplePeriod = Math.pow(2, octave);
    var sampleFrequency = 1 / samplePeriod;
    var noiseIndex = 0;
    for (var y = 0; y < height; ++y) {
      var sampleY0 = Math.floor(y / samplePeriod) * samplePeriod;
      var sampleY1 = (sampleY0 + samplePeriod) % height;
      var vertBlend = (y - sampleY0) * sampleFrequency;
      for (var x = 0; x < width; ++x) {
        var sampleX0 = Math.floor(x / samplePeriod) * samplePeriod;
        var sampleX1 = (sampleX0 + samplePeriod) % width;
        var horizBlend = (x - sampleX0) * sampleFrequency;

        // blend top two corners
        var top = interpolate(whiteNoise[sampleY0 * width + sampleX0], whiteNoise[sampleY1 * width + sampleX0], vertBlend);
        // blend bottom two corners
        var bottom = interpolate(whiteNoise[sampleY0 * width + sampleX1], whiteNoise[sampleY1 * width + sampleX1], vertBlend);
        // final blend
        noise[noiseIndex] = interpolate(top, bottom, horizBlend);
        noiseIndex += 1;
      }
    }
    return noise;
  }
}
function generateWhiteNoise(width, height) {
  var noise = new Array(width * height);
  for (var i = 0; i < noise.length; ++i) {
    noise[i] = Math.random();
  }
  return noise;
}
function interpolate(x0, x1, alpha) {
  return x0 * (1 - alpha) + alpha * x1;
}


/***/ }),

/***/ 377:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

// A library of seedable RNGs implemented in Javascript.
//
// Usage:
//
// var seedrandom = require('seedrandom');
// var random = seedrandom(1); // or any seed.
// var x = random();       // 0 <= x < 1.  Every bit is random.
// var x = random.quick(); // 0 <= x < 1.  32 bits of randomness.

// alea, a 53-bit multiply-with-carry generator by Johannes Baagøe.
// Period: ~2^116
// Reported to pass all BigCrush tests.
var alea = __webpack_require__(832);

// xor128, a pure xor-shift generator by George Marsaglia.
// Period: 2^128-1.
// Reported to fail: MatrixRank and LinearComp.
var xor128 = __webpack_require__(652);

// xorwow, George Marsaglia's 160-bit xor-shift combined plus weyl.
// Period: 2^192-2^32
// Reported to fail: CollisionOver, SimpPoker, and LinearComp.
var xorwow = __webpack_require__(801);

// xorshift7, by François Panneton and Pierre L'ecuyer, takes
// a different approach: it adds robustness by allowing more shifts
// than Marsaglia's original three.  It is a 7-shift generator
// with 256 bits, that passes BigCrush with no systmatic failures.
// Period 2^256-1.
// No systematic BigCrush failures reported.
var xorshift7 = __webpack_require__(30);

// xor4096, by Richard Brent, is a 4096-bit xor-shift with a
// very long period that also adds a Weyl generator. It also passes
// BigCrush with no systematic failures.  Its long period may
// be useful if you have many generators and need to avoid
// collisions.
// Period: 2^4128-2^32.
// No systematic BigCrush failures reported.
var xor4096 = __webpack_require__(618);

// Tyche-i, by Samuel Neves and Filipe Araujo, is a bit-shifting random
// number generator derived from ChaCha, a modern stream cipher.
// https://eden.dei.uc.pt/~sneves/pubs/2011-snfa2.pdf
// Period: ~2^127
// No systematic BigCrush failures reported.
var tychei = __webpack_require__(49);

// The original ARC4-based prng included in this library.
// Period: ~2^1600
var sr = __webpack_require__(971);

sr.alea = alea;
sr.xor128 = xor128;
sr.xorwow = xorwow;
sr.xorshift7 = xorshift7;
sr.xor4096 = xor4096;
sr.tychei = tychei;

module.exports = sr;


/***/ }),

/***/ 832:
/***/ (function(module, exports, __webpack_require__) {

/* module decorator */ module = __webpack_require__.nmd(module);
var __WEBPACK_AMD_DEFINE_RESULT__;// A port of an algorithm by Johannes Baagøe <baagoe@baagoe.com>, 2010
// http://baagoe.com/en/RandomMusings/javascript/
// https://github.com/nquinlan/better-random-numbers-for-javascript-mirror
// Original work is under MIT license -

// Copyright (C) 2010 by Johannes Baagøe <baagoe@baagoe.org>
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.



(function(global, module, define) {

function Alea(seed) {
  var me = this, mash = Mash();

  me.next = function() {
    var t = 2091639 * me.s0 + me.c * 2.3283064365386963e-10; // 2^-32
    me.s0 = me.s1;
    me.s1 = me.s2;
    return me.s2 = t - (me.c = t | 0);
  };

  // Apply the seeding algorithm from Baagoe.
  me.c = 1;
  me.s0 = mash(' ');
  me.s1 = mash(' ');
  me.s2 = mash(' ');
  me.s0 -= mash(seed);
  if (me.s0 < 0) { me.s0 += 1; }
  me.s1 -= mash(seed);
  if (me.s1 < 0) { me.s1 += 1; }
  me.s2 -= mash(seed);
  if (me.s2 < 0) { me.s2 += 1; }
  mash = null;
}

function copy(f, t) {
  t.c = f.c;
  t.s0 = f.s0;
  t.s1 = f.s1;
  t.s2 = f.s2;
  return t;
}

function impl(seed, opts) {
  var xg = new Alea(seed),
      state = opts && opts.state,
      prng = xg.next;
  prng.int32 = function() { return (xg.next() * 0x100000000) | 0; }
  prng.double = function() {
    return prng() + (prng() * 0x200000 | 0) * 1.1102230246251565e-16; // 2^-53
  };
  prng.quick = prng;
  if (state) {
    if (typeof(state) == 'object') copy(state, xg);
    prng.state = function() { return copy(xg, {}); }
  }
  return prng;
}

function Mash() {
  var n = 0xefc8249d;

  var mash = function(data) {
    data = String(data);
    for (var i = 0; i < data.length; i++) {
      n += data.charCodeAt(i);
      var h = 0.02519603282416938 * n;
      n = h >>> 0;
      h -= n;
      h *= n;
      n = h >>> 0;
      h -= n;
      n += h * 0x100000000; // 2^32
    }
    return (n >>> 0) * 2.3283064365386963e-10; // 2^-32
  };

  return mash;
}


if (module && module.exports) {
  module.exports = impl;
} else if (__webpack_require__.amdD && __webpack_require__.amdO) {
  !(__WEBPACK_AMD_DEFINE_RESULT__ = (function() { return impl; }).call(exports, __webpack_require__, exports, module),
		__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
} else {
  this.alea = impl;
}

})(
  this,
   true && module,    // present in node.js
  __webpack_require__.amdD   // present with an AMD loader
);




/***/ }),

/***/ 49:
/***/ (function(module, exports, __webpack_require__) {

/* module decorator */ module = __webpack_require__.nmd(module);
var __WEBPACK_AMD_DEFINE_RESULT__;// A Javascript implementaion of the "Tyche-i" prng algorithm by
// Samuel Neves and Filipe Araujo.
// See https://eden.dei.uc.pt/~sneves/pubs/2011-snfa2.pdf

(function(global, module, define) {

function XorGen(seed) {
  var me = this, strseed = '';

  // Set up generator function.
  me.next = function() {
    var b = me.b, c = me.c, d = me.d, a = me.a;
    b = (b << 25) ^ (b >>> 7) ^ c;
    c = (c - d) | 0;
    d = (d << 24) ^ (d >>> 8) ^ a;
    a = (a - b) | 0;
    me.b = b = (b << 20) ^ (b >>> 12) ^ c;
    me.c = c = (c - d) | 0;
    me.d = (d << 16) ^ (c >>> 16) ^ a;
    return me.a = (a - b) | 0;
  };

  /* The following is non-inverted tyche, which has better internal
   * bit diffusion, but which is about 25% slower than tyche-i in JS.
  me.next = function() {
    var a = me.a, b = me.b, c = me.c, d = me.d;
    a = (me.a + me.b | 0) >>> 0;
    d = me.d ^ a; d = d << 16 ^ d >>> 16;
    c = me.c + d | 0;
    b = me.b ^ c; b = b << 12 ^ d >>> 20;
    me.a = a = a + b | 0;
    d = d ^ a; me.d = d = d << 8 ^ d >>> 24;
    me.c = c = c + d | 0;
    b = b ^ c;
    return me.b = (b << 7 ^ b >>> 25);
  }
  */

  me.a = 0;
  me.b = 0;
  me.c = 2654435769 | 0;
  me.d = 1367130551;

  if (seed === Math.floor(seed)) {
    // Integer seed.
    me.a = (seed / 0x100000000) | 0;
    me.b = seed | 0;
  } else {
    // String seed.
    strseed += seed;
  }

  // Mix in string seed, then discard an initial batch of 64 values.
  for (var k = 0; k < strseed.length + 20; k++) {
    me.b ^= strseed.charCodeAt(k) | 0;
    me.next();
  }
}

function copy(f, t) {
  t.a = f.a;
  t.b = f.b;
  t.c = f.c;
  t.d = f.d;
  return t;
};

function impl(seed, opts) {
  var xg = new XorGen(seed),
      state = opts && opts.state,
      prng = function() { return (xg.next() >>> 0) / 0x100000000; };
  prng.double = function() {
    do {
      var top = xg.next() >>> 11,
          bot = (xg.next() >>> 0) / 0x100000000,
          result = (top + bot) / (1 << 21);
    } while (result === 0);
    return result;
  };
  prng.int32 = xg.next;
  prng.quick = prng;
  if (state) {
    if (typeof(state) == 'object') copy(state, xg);
    prng.state = function() { return copy(xg, {}); }
  }
  return prng;
}

if (module && module.exports) {
  module.exports = impl;
} else if (__webpack_require__.amdD && __webpack_require__.amdO) {
  !(__WEBPACK_AMD_DEFINE_RESULT__ = (function() { return impl; }).call(exports, __webpack_require__, exports, module),
		__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
} else {
  this.tychei = impl;
}

})(
  this,
   true && module,    // present in node.js
  __webpack_require__.amdD   // present with an AMD loader
);




/***/ }),

/***/ 652:
/***/ (function(module, exports, __webpack_require__) {

/* module decorator */ module = __webpack_require__.nmd(module);
var __WEBPACK_AMD_DEFINE_RESULT__;// A Javascript implementaion of the "xor128" prng algorithm by
// George Marsaglia.  See http://www.jstatsoft.org/v08/i14/paper

(function(global, module, define) {

function XorGen(seed) {
  var me = this, strseed = '';

  me.x = 0;
  me.y = 0;
  me.z = 0;
  me.w = 0;

  // Set up generator function.
  me.next = function() {
    var t = me.x ^ (me.x << 11);
    me.x = me.y;
    me.y = me.z;
    me.z = me.w;
    return me.w ^= (me.w >>> 19) ^ t ^ (t >>> 8);
  };

  if (seed === (seed | 0)) {
    // Integer seed.
    me.x = seed;
  } else {
    // String seed.
    strseed += seed;
  }

  // Mix in string seed, then discard an initial batch of 64 values.
  for (var k = 0; k < strseed.length + 64; k++) {
    me.x ^= strseed.charCodeAt(k) | 0;
    me.next();
  }
}

function copy(f, t) {
  t.x = f.x;
  t.y = f.y;
  t.z = f.z;
  t.w = f.w;
  return t;
}

function impl(seed, opts) {
  var xg = new XorGen(seed),
      state = opts && opts.state,
      prng = function() { return (xg.next() >>> 0) / 0x100000000; };
  prng.double = function() {
    do {
      var top = xg.next() >>> 11,
          bot = (xg.next() >>> 0) / 0x100000000,
          result = (top + bot) / (1 << 21);
    } while (result === 0);
    return result;
  };
  prng.int32 = xg.next;
  prng.quick = prng;
  if (state) {
    if (typeof(state) == 'object') copy(state, xg);
    prng.state = function() { return copy(xg, {}); }
  }
  return prng;
}

if (module && module.exports) {
  module.exports = impl;
} else if (__webpack_require__.amdD && __webpack_require__.amdO) {
  !(__WEBPACK_AMD_DEFINE_RESULT__ = (function() { return impl; }).call(exports, __webpack_require__, exports, module),
		__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
} else {
  this.xor128 = impl;
}

})(
  this,
   true && module,    // present in node.js
  __webpack_require__.amdD   // present with an AMD loader
);




/***/ }),

/***/ 618:
/***/ (function(module, exports, __webpack_require__) {

/* module decorator */ module = __webpack_require__.nmd(module);
var __WEBPACK_AMD_DEFINE_RESULT__;// A Javascript implementaion of Richard Brent's Xorgens xor4096 algorithm.
//
// This fast non-cryptographic random number generator is designed for
// use in Monte-Carlo algorithms. It combines a long-period xorshift
// generator with a Weyl generator, and it passes all common batteries
// of stasticial tests for randomness while consuming only a few nanoseconds
// for each prng generated.  For background on the generator, see Brent's
// paper: "Some long-period random number generators using shifts and xors."
// http://arxiv.org/pdf/1004.3115v1.pdf
//
// Usage:
//
// var xor4096 = require('xor4096');
// random = xor4096(1);                        // Seed with int32 or string.
// assert.equal(random(), 0.1520436450538547); // (0, 1) range, 53 bits.
// assert.equal(random.int32(), 1806534897);   // signed int32, 32 bits.
//
// For nonzero numeric keys, this impelementation provides a sequence
// identical to that by Brent's xorgens 3 implementaion in C.  This
// implementation also provides for initalizing the generator with
// string seeds, or for saving and restoring the state of the generator.
//
// On Chrome, this prng benchmarks about 2.1 times slower than
// Javascript's built-in Math.random().

(function(global, module, define) {

function XorGen(seed) {
  var me = this;

  // Set up generator function.
  me.next = function() {
    var w = me.w,
        X = me.X, i = me.i, t, v;
    // Update Weyl generator.
    me.w = w = (w + 0x61c88647) | 0;
    // Update xor generator.
    v = X[(i + 34) & 127];
    t = X[i = ((i + 1) & 127)];
    v ^= v << 13;
    t ^= t << 17;
    v ^= v >>> 15;
    t ^= t >>> 12;
    // Update Xor generator array state.
    v = X[i] = v ^ t;
    me.i = i;
    // Result is the combination.
    return (v + (w ^ (w >>> 16))) | 0;
  };

  function init(me, seed) {
    var t, v, i, j, w, X = [], limit = 128;
    if (seed === (seed | 0)) {
      // Numeric seeds initialize v, which is used to generates X.
      v = seed;
      seed = null;
    } else {
      // String seeds are mixed into v and X one character at a time.
      seed = seed + '\0';
      v = 0;
      limit = Math.max(limit, seed.length);
    }
    // Initialize circular array and weyl value.
    for (i = 0, j = -32; j < limit; ++j) {
      // Put the unicode characters into the array, and shuffle them.
      if (seed) v ^= seed.charCodeAt((j + 32) % seed.length);
      // After 32 shuffles, take v as the starting w value.
      if (j === 0) w = v;
      v ^= v << 10;
      v ^= v >>> 15;
      v ^= v << 4;
      v ^= v >>> 13;
      if (j >= 0) {
        w = (w + 0x61c88647) | 0;     // Weyl.
        t = (X[j & 127] ^= (v + w));  // Combine xor and weyl to init array.
        i = (0 == t) ? i + 1 : 0;     // Count zeroes.
      }
    }
    // We have detected all zeroes; make the key nonzero.
    if (i >= 128) {
      X[(seed && seed.length || 0) & 127] = -1;
    }
    // Run the generator 512 times to further mix the state before using it.
    // Factoring this as a function slows the main generator, so it is just
    // unrolled here.  The weyl generator is not advanced while warming up.
    i = 127;
    for (j = 4 * 128; j > 0; --j) {
      v = X[(i + 34) & 127];
      t = X[i = ((i + 1) & 127)];
      v ^= v << 13;
      t ^= t << 17;
      v ^= v >>> 15;
      t ^= t >>> 12;
      X[i] = v ^ t;
    }
    // Storing state as object members is faster than using closure variables.
    me.w = w;
    me.X = X;
    me.i = i;
  }

  init(me, seed);
}

function copy(f, t) {
  t.i = f.i;
  t.w = f.w;
  t.X = f.X.slice();
  return t;
};

function impl(seed, opts) {
  if (seed == null) seed = +(new Date);
  var xg = new XorGen(seed),
      state = opts && opts.state,
      prng = function() { return (xg.next() >>> 0) / 0x100000000; };
  prng.double = function() {
    do {
      var top = xg.next() >>> 11,
          bot = (xg.next() >>> 0) / 0x100000000,
          result = (top + bot) / (1 << 21);
    } while (result === 0);
    return result;
  };
  prng.int32 = xg.next;
  prng.quick = prng;
  if (state) {
    if (state.X) copy(state, xg);
    prng.state = function() { return copy(xg, {}); }
  }
  return prng;
}

if (module && module.exports) {
  module.exports = impl;
} else if (__webpack_require__.amdD && __webpack_require__.amdO) {
  !(__WEBPACK_AMD_DEFINE_RESULT__ = (function() { return impl; }).call(exports, __webpack_require__, exports, module),
		__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
} else {
  this.xor4096 = impl;
}

})(
  this,                                     // window object or global
   true && module,    // present in node.js
  __webpack_require__.amdD   // present with an AMD loader
);


/***/ }),

/***/ 30:
/***/ (function(module, exports, __webpack_require__) {

/* module decorator */ module = __webpack_require__.nmd(module);
var __WEBPACK_AMD_DEFINE_RESULT__;// A Javascript implementaion of the "xorshift7" algorithm by
// François Panneton and Pierre L'ecuyer:
// "On the Xorgshift Random Number Generators"
// http://saluc.engr.uconn.edu/refs/crypto/rng/panneton05onthexorshift.pdf

(function(global, module, define) {

function XorGen(seed) {
  var me = this;

  // Set up generator function.
  me.next = function() {
    // Update xor generator.
    var X = me.x, i = me.i, t, v, w;
    t = X[i]; t ^= (t >>> 7); v = t ^ (t << 24);
    t = X[(i + 1) & 7]; v ^= t ^ (t >>> 10);
    t = X[(i + 3) & 7]; v ^= t ^ (t >>> 3);
    t = X[(i + 4) & 7]; v ^= t ^ (t << 7);
    t = X[(i + 7) & 7]; t = t ^ (t << 13); v ^= t ^ (t << 9);
    X[i] = v;
    me.i = (i + 1) & 7;
    return v;
  };

  function init(me, seed) {
    var j, w, X = [];

    if (seed === (seed | 0)) {
      // Seed state array using a 32-bit integer.
      w = X[0] = seed;
    } else {
      // Seed state using a string.
      seed = '' + seed;
      for (j = 0; j < seed.length; ++j) {
        X[j & 7] = (X[j & 7] << 15) ^
            (seed.charCodeAt(j) + X[(j + 1) & 7] << 13);
      }
    }
    // Enforce an array length of 8, not all zeroes.
    while (X.length < 8) X.push(0);
    for (j = 0; j < 8 && X[j] === 0; ++j);
    if (j == 8) w = X[7] = -1; else w = X[j];

    me.x = X;
    me.i = 0;

    // Discard an initial 256 values.
    for (j = 256; j > 0; --j) {
      me.next();
    }
  }

  init(me, seed);
}

function copy(f, t) {
  t.x = f.x.slice();
  t.i = f.i;
  return t;
}

function impl(seed, opts) {
  if (seed == null) seed = +(new Date);
  var xg = new XorGen(seed),
      state = opts && opts.state,
      prng = function() { return (xg.next() >>> 0) / 0x100000000; };
  prng.double = function() {
    do {
      var top = xg.next() >>> 11,
          bot = (xg.next() >>> 0) / 0x100000000,
          result = (top + bot) / (1 << 21);
    } while (result === 0);
    return result;
  };
  prng.int32 = xg.next;
  prng.quick = prng;
  if (state) {
    if (state.x) copy(state, xg);
    prng.state = function() { return copy(xg, {}); }
  }
  return prng;
}

if (module && module.exports) {
  module.exports = impl;
} else if (__webpack_require__.amdD && __webpack_require__.amdO) {
  !(__WEBPACK_AMD_DEFINE_RESULT__ = (function() { return impl; }).call(exports, __webpack_require__, exports, module),
		__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
} else {
  this.xorshift7 = impl;
}

})(
  this,
   true && module,    // present in node.js
  __webpack_require__.amdD   // present with an AMD loader
);



/***/ }),

/***/ 801:
/***/ (function(module, exports, __webpack_require__) {

/* module decorator */ module = __webpack_require__.nmd(module);
var __WEBPACK_AMD_DEFINE_RESULT__;// A Javascript implementaion of the "xorwow" prng algorithm by
// George Marsaglia.  See http://www.jstatsoft.org/v08/i14/paper

(function(global, module, define) {

function XorGen(seed) {
  var me = this, strseed = '';

  // Set up generator function.
  me.next = function() {
    var t = (me.x ^ (me.x >>> 2));
    me.x = me.y; me.y = me.z; me.z = me.w; me.w = me.v;
    return (me.d = (me.d + 362437 | 0)) +
       (me.v = (me.v ^ (me.v << 4)) ^ (t ^ (t << 1))) | 0;
  };

  me.x = 0;
  me.y = 0;
  me.z = 0;
  me.w = 0;
  me.v = 0;

  if (seed === (seed | 0)) {
    // Integer seed.
    me.x = seed;
  } else {
    // String seed.
    strseed += seed;
  }

  // Mix in string seed, then discard an initial batch of 64 values.
  for (var k = 0; k < strseed.length + 64; k++) {
    me.x ^= strseed.charCodeAt(k) | 0;
    if (k == strseed.length) {
      me.d = me.x << 10 ^ me.x >>> 4;
    }
    me.next();
  }
}

function copy(f, t) {
  t.x = f.x;
  t.y = f.y;
  t.z = f.z;
  t.w = f.w;
  t.v = f.v;
  t.d = f.d;
  return t;
}

function impl(seed, opts) {
  var xg = new XorGen(seed),
      state = opts && opts.state,
      prng = function() { return (xg.next() >>> 0) / 0x100000000; };
  prng.double = function() {
    do {
      var top = xg.next() >>> 11,
          bot = (xg.next() >>> 0) / 0x100000000,
          result = (top + bot) / (1 << 21);
    } while (result === 0);
    return result;
  };
  prng.int32 = xg.next;
  prng.quick = prng;
  if (state) {
    if (typeof(state) == 'object') copy(state, xg);
    prng.state = function() { return copy(xg, {}); }
  }
  return prng;
}

if (module && module.exports) {
  module.exports = impl;
} else if (__webpack_require__.amdD && __webpack_require__.amdO) {
  !(__WEBPACK_AMD_DEFINE_RESULT__ = (function() { return impl; }).call(exports, __webpack_require__, exports, module),
		__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
} else {
  this.xorwow = impl;
}

})(
  this,
   true && module,    // present in node.js
  __webpack_require__.amdD   // present with an AMD loader
);




/***/ }),

/***/ 971:
/***/ (function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_RESULT__;/*
Copyright 2019 David Bau.

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

*/

(function (global, pool, math) {
//
// The following constants are related to IEEE 754 limits.
//

var width = 256,        // each RC4 output is 0 <= x < 256
    chunks = 6,         // at least six RC4 outputs for each double
    digits = 52,        // there are 52 significant digits in a double
    rngname = 'random', // rngname: name for Math.random and Math.seedrandom
    startdenom = math.pow(width, chunks),
    significance = math.pow(2, digits),
    overflow = significance * 2,
    mask = width - 1,
    nodecrypto;         // node.js crypto module, initialized at the bottom.

//
// seedrandom()
// This is the seedrandom function described above.
//
function seedrandom(seed, options, callback) {
  var key = [];
  options = (options == true) ? { entropy: true } : (options || {});

  // Flatten the seed string or build one from local entropy if needed.
  var shortseed = mixkey(flatten(
    options.entropy ? [seed, tostring(pool)] :
    (seed == null) ? autoseed() : seed, 3), key);

  // Use the seed to initialize an ARC4 generator.
  var arc4 = new ARC4(key);

  // This function returns a random double in [0, 1) that contains
  // randomness in every bit of the mantissa of the IEEE 754 value.
  var prng = function() {
    var n = arc4.g(chunks),             // Start with a numerator n < 2 ^ 48
        d = startdenom,                 //   and denominator d = 2 ^ 48.
        x = 0;                          //   and no 'extra last byte'.
    while (n < significance) {          // Fill up all significant digits by
      n = (n + x) * width;              //   shifting numerator and
      d *= width;                       //   denominator and generating a
      x = arc4.g(1);                    //   new least-significant-byte.
    }
    while (n >= overflow) {             // To avoid rounding up, before adding
      n /= 2;                           //   last byte, shift everything
      d /= 2;                           //   right using integer math until
      x >>>= 1;                         //   we have exactly the desired bits.
    }
    return (n + x) / d;                 // Form the number within [0, 1).
  };

  prng.int32 = function() { return arc4.g(4) | 0; }
  prng.quick = function() { return arc4.g(4) / 0x100000000; }
  prng.double = prng;

  // Mix the randomness into accumulated entropy.
  mixkey(tostring(arc4.S), pool);

  // Calling convention: what to return as a function of prng, seed, is_math.
  return (options.pass || callback ||
      function(prng, seed, is_math_call, state) {
        if (state) {
          // Load the arc4 state from the given state if it has an S array.
          if (state.S) { copy(state, arc4); }
          // Only provide the .state method if requested via options.state.
          prng.state = function() { return copy(arc4, {}); }
        }

        // If called as a method of Math (Math.seedrandom()), mutate
        // Math.random because that is how seedrandom.js has worked since v1.0.
        if (is_math_call) { math[rngname] = prng; return seed; }

        // Otherwise, it is a newer calling convention, so return the
        // prng directly.
        else return prng;
      })(
  prng,
  shortseed,
  'global' in options ? options.global : (this == math),
  options.state);
}

//
// ARC4
//
// An ARC4 implementation.  The constructor takes a key in the form of
// an array of at most (width) integers that should be 0 <= x < (width).
//
// The g(count) method returns a pseudorandom integer that concatenates
// the next (count) outputs from ARC4.  Its return value is a number x
// that is in the range 0 <= x < (width ^ count).
//
function ARC4(key) {
  var t, keylen = key.length,
      me = this, i = 0, j = me.i = me.j = 0, s = me.S = [];

  // The empty key [] is treated as [0].
  if (!keylen) { key = [keylen++]; }

  // Set up S using the standard key scheduling algorithm.
  while (i < width) {
    s[i] = i++;
  }
  for (i = 0; i < width; i++) {
    s[i] = s[j = mask & (j + key[i % keylen] + (t = s[i]))];
    s[j] = t;
  }

  // The "g" method returns the next (count) outputs as one number.
  (me.g = function(count) {
    // Using instance members instead of closure state nearly doubles speed.
    var t, r = 0,
        i = me.i, j = me.j, s = me.S;
    while (count--) {
      t = s[i = mask & (i + 1)];
      r = r * width + s[mask & ((s[i] = s[j = mask & (j + t)]) + (s[j] = t))];
    }
    me.i = i; me.j = j;
    return r;
    // For robust unpredictability, the function call below automatically
    // discards an initial batch of values.  This is called RC4-drop[256].
    // See http://google.com/search?q=rsa+fluhrer+response&btnI
  })(width);
}

//
// copy()
// Copies internal state of ARC4 to or from a plain object.
//
function copy(f, t) {
  t.i = f.i;
  t.j = f.j;
  t.S = f.S.slice();
  return t;
};

//
// flatten()
// Converts an object tree to nested arrays of strings.
//
function flatten(obj, depth) {
  var result = [], typ = (typeof obj), prop;
  if (depth && typ == 'object') {
    for (prop in obj) {
      try { result.push(flatten(obj[prop], depth - 1)); } catch (e) {}
    }
  }
  return (result.length ? result : typ == 'string' ? obj : obj + '\0');
}

//
// mixkey()
// Mixes a string seed into a key that is an array of integers, and
// returns a shortened string seed that is equivalent to the result key.
//
function mixkey(seed, key) {
  var stringseed = seed + '', smear, j = 0;
  while (j < stringseed.length) {
    key[mask & j] =
      mask & ((smear ^= key[mask & j] * 19) + stringseed.charCodeAt(j++));
  }
  return tostring(key);
}

//
// autoseed()
// Returns an object for autoseeding, using window.crypto and Node crypto
// module if available.
//
function autoseed() {
  try {
    var out;
    if (nodecrypto && (out = nodecrypto.randomBytes)) {
      // The use of 'out' to remember randomBytes makes tight minified code.
      out = out(width);
    } else {
      out = new Uint8Array(width);
      (global.crypto || global.msCrypto).getRandomValues(out);
    }
    return tostring(out);
  } catch (e) {
    var browser = global.navigator,
        plugins = browser && browser.plugins;
    return [+new Date, global, plugins, global.screen, tostring(pool)];
  }
}

//
// tostring()
// Converts an array of charcodes to a string
//
function tostring(a) {
  return String.fromCharCode.apply(0, a);
}

//
// When seedrandom.js is loaded, we immediately mix a few bits
// from the built-in RNG into the entropy pool.  Because we do
// not want to interfere with deterministic PRNG state later,
// seedrandom will not call math.random on its own again after
// initialization.
//
mixkey(math.random(), pool);

//
// Nodejs and AMD support: export the implementation as a module using
// either convention.
//
if ( true && module.exports) {
  module.exports = seedrandom;
  // When in node.js, try using crypto package for autoseeding.
  try {
    nodecrypto = __webpack_require__(42);
  } catch (ex) {}
} else if (true) {
  !(__WEBPACK_AMD_DEFINE_RESULT__ = (function() { return seedrandom; }).call(exports, __webpack_require__, exports, module),
		__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
} else {}


// End anonymous scope, and pass initial values.
})(
  // global: `self` in browsers (including strict mode and web workers),
  // otherwise `this` in Node and other environments
  (typeof self !== 'undefined') ? self : this,
  [],     // pool: entropy pool starts empty
  Math    // math: package containing random, pow, and seedrandom
);


/***/ }),

/***/ 477:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Z": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });


/**
 * @typedef {Object<String,any>} ComponentOptions
 * @property {number} [x]
 * @property {number} [y]
 */

/**
 * Defines a drawable object which can be attached to a Sprite or a Group
 */
class Component {
    /** @param {ComponentOptions} myOptions */
    constructor(myOptions = { x: 0, y: 0 }) {
        /** @type {SVGElement|HTMLElement|undefined} */
        this.domElement=undefined;
        this.attributes = {};
        this.appliedAttributes = {};
        this.update = () => {
            if (!this.domElement)
                return console.warn("this.domElement is", this.domElement);
            //apply what has been modified to the dom element
            //it also keeps track of modified attributes to prevent redundant changes
            Object.keys(this.attributes).map((attrName) => {
                try{
                    const attr = this.attributes[attrName];
                    const appliedAttr = this.appliedAttributes[attrName];
                    if (attr !== appliedAttr) {
                        this.domElement.setAttribute(attrName, attr);
                        this.attributes[attrName] = attr;
                        this.appliedAttributes[attrName] = attr;
                    }
                }catch(e){
                    console.error(e);
                    console.log(attrName,this.attributes);
                }
            });
        };
        this.addClass = (...classes) => {
            let classString = classes.join(" ").split(/\s+/g);
            classString.forEach((classString)=>{
                this.domElement.classList.add(classString);
            });
        }
        this.removeClass = (...classes) => {
            let classString = classes.join(" ").split(/s+/g);
            classString.forEach((classString)=>{
                this.domElement.classList.remove(classString);
            });
        }
        /*
        (\.set\()("[^"]*"),([^\)]*)
        $1{$2:$3}
        */
        this.set = (newAtrrs) => {
            Object.assign(this.attributes,newAtrrs);
            this.update();
        };
        this.destroy = () => {
            this.domElement.remove();
            Object.keys(this).forEach((key)=>{
                delete this[key]
            });
        }
        Object.assign(this.attributes, myOptions);
    }
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Component);

/***/ }),

/***/ 211:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Circle": () => (/* binding */ Circle),
/* harmony export */   "Path": () => (/* binding */ Path),
/* harmony export */   "Line": () => (/* binding */ Line),
/* harmony export */   "Rectangle": () => (/* binding */ Rectangle),
/* harmony export */   "SVG": () => (/* binding */ SVG),
/* harmony export */   "SVGGroup": () => (/* binding */ SVGGroup),
/* harmony export */   "SVGCanvas": () => (/* binding */ SVGCanvas),
/* harmony export */   "Text": () => (/* binding */ Text),
/* harmony export */   "BoxedText": () => (/* binding */ BoxedText)
/* harmony export */ });
/* harmony import */ var _Component__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(477);
/* harmony import */ var _Model__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(55);



/**
 * @typedef {import("./Component").ComponentOptions} ComponentOptions
 */
/**
 * @typedef {ComponentOptions} CircleOptions
 * @param {number} [radius]
 */
class Circle extends _Component__WEBPACK_IMPORTED_MODULE_0__/* .default */ .Z{
    /**
     * @param {CircleOptions} myOptions
     **/
    constructor(myOptions = {
        cx: 0, cy: 0, r: 50
    }) {
        super(myOptions);
        // Component.call(this, myOptions);
        this.domElement = document.createElementNS("http://www.w3.org/2000/svg", 'circle');
        this.update();
    }
}

/**
 * @typedef {ComponentOptions} PathOptions
 */
class Path extends _Component__WEBPACK_IMPORTED_MODULE_0__/* .default */ .Z{
    /**
     * @param {PathOptions} myOptions
     **/
    constructor(myOptions = {
        d: ``
    }) {
        // Component.call(this, myOptions);
        super(myOptions);
        this.domElement = document.createElementNS("http://www.w3.org/2000/svg", 'path');
        this.update();
    }
}

/**
 * @typedef {ComponentOptions} RectangleOptions
 * @property {string} [fill]
 * @property {number} [width]
 * @property {number} [height]
 */
class Rectangle extends _Component__WEBPACK_IMPORTED_MODULE_0__/* .default */ .Z {
    /**
     * @param {RectangleOptions} myOptions
     **/
    constructor(myOptions = {
        x: 0, y: 0, width: 100, height: 100
    }) {
        super(myOptions);
        this.domElement = document.createElementNS("http://www.w3.org/2000/svg", 'rect');
        this.update();
    }
}

/**
 * @typedef {ComponentOptions} LineOptions
 */
class Line extends _Component__WEBPACK_IMPORTED_MODULE_0__/* .default */ .Z {
    /**
     * @param {LineOptions} myOptions
     **/
    constructor(myOptions = {
        x1: 0, y1: 80, x2: 100, y2: 20
    }) {
        super(myOptions);
        // Component.call(this, myOptions);
        this.domElement = document.createElementNS("http://www.w3.org/2000/svg", 'line');
        this.update();
    }
}

/**
 * @typedef {ComponentOptions} SVGOptions
 */
class SVG extends _Component__WEBPACK_IMPORTED_MODULE_0__/* .default */ .Z {
    /** @param {SVGOptions} myOptions */
    constructor(myOptions = {
        x: 0, y: 0,
    }) {
        super(myOptions);
        // Component.call(this, myOptions);
        this.domElement = document.createElementNS("http://www.w3.org/2000/svg", 'svg');
        /** @param {Array<Component>} elems */
        this.add = (...elems) => {
            elems.forEach((elem)=>{
                if(!(elem.domElement instanceof SVGElement)) throw new Error("you can only add SVG elements to SVG group.");
                this.domElement.appendChild(elem.domElement);
            });
            return this;
        };
        /** @param {Array<Component>} elems */
        this.remove = (...elems) => {
            elems.forEach((elem)=>{
                this.domElement.removeChild(elem.domElement);
            });
            return this;
            
        }
        this.update();
    }
}

class SVGGroup extends SVG {}


class SVGCanvas extends SVG {
    constructor(...p){
        super(...p);
        // const element = document.createElementNS("http://www.w3.org/2000/svg",'svg');
        const element =  document.createElementNS("http://www.w3.org/2000/svg", 'svg');
        this.element = element;
        
        // element.setAttribute('viewBox',"0 0 1000 1000");
        element.setAttribute('width',"100%");
        element.setAttribute('height',"10000px");
        
        document.body.appendChild(element);


        const size = this.size = {
            width:0,
            height:0,
            onChange:({})=>{},
        };

        const scroll = this.scroll = {
            top:0,
            left:0
        }

        const sizeModel = new _Model__WEBPACK_IMPORTED_MODULE_1__/* .default */ .Z(size);
        const scrollModel = new _Model__WEBPACK_IMPORTED_MODULE_1__/* .default */ .Z(scroll);

        size.onChange=sizeModel.onUpdate;
     
        const recalcSize = () => {
            sizeModel.set({
                width:window.innerWidth,
                height:window.innerHeight,
            });
        }
        
        const recalcScroll = () => {
            scrollModel.set({
                top:window.scrollX,
                left:window.scrollY,
            });
        }

        window.addEventListener("resize",recalcSize);
        window.addEventListener("scroll",recalcScroll);
        window.addEventListener("DOMContentLoaded",()=>{
            recalcSize();
            recalcScroll();
        });

    }
}

/**
 * @typedef {ComponentOptions} TextOptions
 * @property {"middle"|"left"|"right"} 'text-anchor'
 */
class Text extends _Component__WEBPACK_IMPORTED_MODULE_0__/* .default */ .Z {

    /** @param {ComponentOptions} myOptions */
    constructor(myOptions = {
        x: 0, y: 0, text: "---"
    }) {
        super(myOptions);
        // Component.call(this, myOptions);
        this.domElement = document.createElementNS("http://www.w3.org/2000/svg", 'text');
        
        const superUpdate = this.update;
        this.update = () => {
            this.domElement.innerHTML = this.attributes.text;
            superUpdate();
        };
        this.update();
    }
}
/**
 * @typedef {ComponentOptions} TextOptions
 * @property {"middle"|"left"|"right"} 'text-anchor'
 */
class BoxedText extends SVG {

    /** @param {ComponentOptions} myOptions */
    constructor(myOptions = {
        x: 0, y: 0, text: "---"
    }) {
        super(myOptions);
        
        const textEl = new Text();
        const box = new Rectangle();
        this.add(box,textEl);

        this.addClass("boxed-text");
        const superUpdate = this.update;
        this.update = () => {
            if(this.attributes.text){
                textEl.attributes.text=this.attributes.text;
                delete this.attributes.text;
            }

            textEl.update();
            
            setTimeout(()=>{
                const SVGRect = textEl.domElement.getBBox();
                box.attributes.x = SVGRect.x;
                box.attributes.y = SVGRect.y;
                box.attributes.width = SVGRect.width;
                box.attributes.height = SVGRect.height;
                box.update();
            },300);

            superUpdate();
        };
        //todo: fix this bug
        setTimeout(()=>{
            this.update();
        },10);
    }
}






/***/ }),

/***/ 55:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Z": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/**
 * @typedef {Object<string,any>} ChangedParameterList
 */

/**
 * @callback ChangesListener
 * @param {ChangedParameterList} changes an object containing only the changed parameters. Modify this object to alter the changes
 */

/**
 * @callback BeforeChangesListener
 * @param {ChangedParameterList} changes an object containing only the changed parameters. Modify this object to alter the changes
 * @param {Object<string,any>} settings an object containing all the model's properties.
 */

class Model {
    constructor(settings) {
        const beforeChangeListeners = [];
        const changeListeners = [];

        this.settings = settings;

        /** 
         * this is used to tie parameters together, for example if one setting is 
         * always 2 times other setting.
         * @param {BeforeChangesListener} newCallback
         **/
        this.beforeUpdate = (newCallback) => {
            if (typeof newCallback !== "function")
                throw new Error(`Callback has to be function but it is ${typeof newCallback}`);
            beforeChangeListeners.push(newCallback);
            newCallback(this.settings, this.settings);
        };
        /**
         * interface uses this method to connect changes in model to redraws
         * @param {ChangedParameterList} newCallback
         * */
        this.onUpdate = (newCallback) => {
            if (typeof newCallback !== "function")
                throw new Error(`Callback has to be function but it is ${typeof newCallback}`);
            changeListeners.push(newCallback);
            newCallback(this.settings);
        };

        /**
         * model uses this method to notify changes to the interface
         * it will not trigger "beforeUpdate" listeners.
         * @param {ChangedParameterList} [changes]
         **/
        this.changed = (changes = {}) => {
            changeListeners.forEach((cb) => { cb(changes); });
        };

        /**
         * change parameter values, triggering onchange listeners
         * @param {ChangedParameterList} [changes]
         **/
        this.set = (changes = {}) => {
            beforeChangeListeners.forEach((cb) => { cb(changes, this.settings); });
            Object.assign(this.settings, changes);
            this.changed(changes);
            return this;
        }

        //get the initial state of the model
        this.triggerInitialState = () => {
            this.set(settings);
        };
    }
}
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Model);

/***/ }),

/***/ 424:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/**
 * @typedef {Object} MiniVector
 * @property {number} [x]
 * @property {number} [y]
 * @export MiniVector
 */

/**
 * @class Vector 2
 * @param {Vector2|MiniVector} options
 */
function Vector2(options={x:0,y:0}){
    this.x=options.x;
    this.y=options.y;
    /** @param {Vector2} to */
    this.add=(to)=>{
        this.x+=to.x;
        this.y+=to.y;
        return this;
    }
    /** @param {Vector2} to */
    this.sub=(to)=>{
        this.x-=to.x;
        this.y-=to.y;
        return this;
    }
    this.clone=()=>{
        return new Vector2(this);
    }
    /** @param {Vector2|MiniVector} to */
    this.set=(to)=>{
        if(to.x!==undefined) this.x=to.x;
        if(to.y!==undefined) this.y=to.y;
    }
    this.set(options);
}

/** 
 * @param {Vector2|MiniVector} vec1 
 * @param {Vector2} vec2 
 **/
Vector2.add=(vec1, vec2)=>{
    return (new Vector2(vec1)).add(vec2);
}

/** 
 * @param {Vector2|MiniVector} vec1 
 * @param {Vector2} vec2 
 **/
Vector2.sub=(vec1, vec2)=>{
    return (new Vector2(vec1)).sub(vec2);
}

/** 
 * @param {Vector2|MiniVector} vec1
 **/
Vector2.clone=(vec1)=>{
    return (new Vector2(vec1));
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Vector2);

/***/ }),

/***/ 903:
/***/ ((__unused_webpack_module, __unused_webpack___webpack_exports__, __webpack_require__) => {

"use strict";

// EXTERNAL MODULE: ./src/dom-model-gui/utils/Vector2.js
var Vector2 = __webpack_require__(424);
// EXTERNAL MODULE: ./src/dom-model-gui/GuiComponents/Component.js
var Component = __webpack_require__(477);
;// CONCATENATED MODULE: ./src/dom-model-gui/utils/anyElementToDomElement.js


/**
 * @param {HTMLElement|SVGElement|Component} element
 * @returns {HTMLElement|SVGElement}
 */
const anyElementToDomElement=(element)=>{
    
    let domElement;
    if(element instanceof Component/* default */.Z){
        domElement = element.domElement;
    }else{
        domElement = element;
    }
    return domElement;
}

/* harmony default export */ const utils_anyElementToDomElement = (anyElementToDomElement);
;// CONCATENATED MODULE: ./src/dom-model-gui/Interactive/Hoverable.js



/**
 * @typedef {Node} NodeWithClassList
 * @property {Set<string>} classList
 * @exports NodeWithClassList
 */

/**
 * thing that can be hovered.
 */
/** @param {HTMLElement|SVGElement|Component} element */
function Hoverable(element){

    let domElement = utils_anyElementToDomElement(element);

    const position = new Vector2.default();

    domElement.addEventListener("mouseenter",(evt)=>{
        domElement.classList.add("active");
        const position={
            x:evt.clientX,
            y:evt.clientY,
        }
        this.mouseEnterCallback(position);
    });
    
    domElement.addEventListener("mouseleave",(evt)=>{
        domElement.classList.remove("active");
        const position={
            x:evt.clientX,
            y:evt.clientY,
        }
        this.mouseLeaveCallback(position);
    });

    domElement.addEventListener("mousemove",(evt)=>{
        const position={
            x:evt.clientX,
            y:evt.clientY,
        }
        this.mouseMoveCallback(position);
    });


    this.mouseEnterCallback=(position)=>{
    }
    this.mouseLeaveCallback=(position)=>{
    }
    this.mouseMoveCallback=(position)=>{
    }

    /** @param {Vector2|{x:number,y:number}} newPosition */
    this.setPosition=(newPosition)=>{
        position.set(newPosition);
        this.positionChanged(newPosition);
    }

    domElement.classList.add("draggable");
}

/* harmony default export */ const Interactive_Hoverable = (Hoverable);
;// CONCATENATED MODULE: ./src/dom-model-gui/Interactive/Mouse.js





/**
 * @callback mouseCallback 
 * @param {Mouse} mouse
 */

class Mouse extends Vector2.default {
    constructor() {
        super();
        /** @type {boolean} */
        this.pressed = false;
        /** @type {Set<Draggable|Hoverable>} */
        this.selected = new Set();
        /** @type {false|Draggable|Hoverable} */
        this.isHovering = false;
        this.dragStartPosition = new Vector2.default();
        this.delta = new Vector2.default();


        /** @type {Array<mouseCallback>} */
        const moveCallbacks = [];
        /** @type {Array<mouseCallback>} */
        const downCallbacks = [];
        /** @type {Array<mouseCallback>} */
        const upCallbacks = [];

        /** @param {mouseCallback} callback */
        this.onMove = (callback)=> moveCallbacks.push(callback);
        /** @param {mouseCallback} callback */
        this.onDown = (callback)=> downCallbacks.push(callback);
        /** @param {mouseCallback} callback */
        this.onUp = (callback)=> upCallbacks.push(callback);


        this.setCanvas=(canvas=document)=>{

            const pointerMoveListener = (evt) => {
                // @ts-ignore
                this.x = evt.clientX;
                // @ts-ignore
                this.y = evt.clientY;
                //translate touch events 
                if(evt.touches&&evt.touches.length){
                    this.x = evt.touches[0].clientX;
                    this.y = evt.touches[0].clientY;
                }       

                this.delta = Vector2.default.sub(this, this.dragStartPosition);
                if (this.pressed) {
                    if (this.selected.size) {
                        evt.preventDefault();
                        this.selected.forEach((draggable) => { draggable._drag(this) });
                    }
                }
                moveCallbacks.forEach((cb)=>cb(this));
            }
            canvas.addEventListener("mousemove", pointerMoveListener);
            canvas.addEventListener("touchmove", (evt)=>{
                //in touch we cannot hover before clicking,
                //so we need to pick up any hovered element
                //even if the drag action already started
                if (this.isHovering) {
                    if(!this.selected.has(this.isHovering)){
                        if(this.isHovering._dragStart){
                            this.isHovering._dragStart(this);
                        }
                        this.selected.add(this.isHovering);
                    }
                }

                pointerMoveListener(evt);
            });

            const pointerDownListener = (evt) => {
                this.pressed = true;
                //@ts-ignore
                this.dragStartPosition.set({ x: evt.clientX, y: evt.clientY });
                // @ts-ignore
                if (evt.button == 0) {
                    //to implement multi element seletion, you would do changes here
                    if (this.isHovering) {
                        evt.preventDefault();
                        this.selected.clear();
                        this.selected.add(this.isHovering);
                        this.selected.forEach((draggable) => {
                            if(draggable._dragStart){
                                draggable._dragStart(this) 
                            }
                        });
                    }
                }

                downCallbacks.forEach((cb)=>cb(this));
            }
            canvas.addEventListener("mousedown", pointerDownListener);
            canvas.addEventListener("touchstart",(evt)=>{

                //translate touch position
                if(evt.touches.length){
                    this.x = evt.touches[0].clientX;
                    this.y = evt.touches[0].clientY;
                }       

                pointerDownListener(evt);
            });

            const pointerUpListener = (evt) => {
                this.pressed = false;
                if (this.selected.size) {
                    evt.preventDefault();
                    this.selected.forEach((draggable) => {
                        if(draggable._dragEnd) draggable._dragEnd(this);
                    });
                    this.selected.clear();
                }
                upCallbacks.forEach((cb)=>cb(this));
            }
            canvas.addEventListener("mouseup",pointerUpListener);
            canvas.addEventListener("touchend",(evt)=>{
                //translate touch position
                if(evt.touches.length){
                    this.x = evt.touches[0].clientX;
                    this.y = evt.touches[0].clientY;
                }       

                pointerUpListener(evt);
            });
        }
    }
}

Mouse.instance = undefined;
/** @returns {Mouse} */
Mouse.get = () => {
    if(!Mouse.instance) Mouse.instance=new Mouse();
    return Mouse.instance;
}

/* harmony default export */ const Interactive_Mouse = (Mouse);
;// CONCATENATED MODULE: ./src/dom-model-gui/Interactive/Draggable.js





const VectorTypedef = __webpack_require__(424);

/**
 * @typedef {VectorTypedef.MiniVector} MiniVector
 */


/**
 * @typedef {Node} NodeWithClassList
 * @property {Set<string>} classList
 * @exports NodeWithClassList
 */



/**
 * @class Draggable
 * 
 * thing that can be dragged. It does not implement actual updating of position,
 * as it doesn't assume the object to have certain properties for position or 
 * certain render methods. The user must implement by using dragCallback function
 * override*/
class Draggable {
    /**
    *  @constructor 
    *  @param {HTMLElement|SVGElement|Component} element 
    * */
    constructor(element) {
        const mouse = Interactive_Mouse.get();

        let domElement = utils_anyElementToDomElement(element);

        const position = new Vector2.default();
        const dragStartPosition = position.clone();

        domElement.addEventListener("mouseenter", (evt) => {
            mouse.isHovering = this;
        });
        domElement.addEventListener("touchstart", (evt) => {
            mouse.isHovering = this;
        });

        domElement.addEventListener("mouseleave", (evt) => {
            if (!mouse.selected.has(this)) {
                domElement.classList.remove("active");
            }
            mouse.isHovering = false;
        });
        domElement.addEventListener("touchend", (evt) => {
            if (!mouse.selected.has(this)) {
                domElement.classList.remove("active");
            }
            mouse.isHovering = false;
        });

        /** do not override */
        this._drag = () => {

            position.set(dragStartPosition);
            position.add(mouse.delta);

            this.dragCallback(mouse);
            this.positionChanged({
                x: position.x,
                y: position.y,
                delta: mouse.delta,
                localDragOffset: dragStartPosition,
                start: {
                    x: dragStartPosition.x,
                    y: dragStartPosition.y,
                }
            });
        }
        
        this._dragStart = (mouse) => {

            dragStartPosition.set(position);

            domElement.classList.add("active");
            this.dragStartCallback(mouse);
        }
        this._dragEnd = (...p) => {
            domElement.classList.remove("active");
            this.dragEndCallback(...p);
        }

        /**
         * @callback MouseActionCallback 
         * @param {Mouse} mouse
         */
        const dragCallbacks = [];
        const dragStartCallbacks = [];
        const dragEndCallbacks = [];
        
        /** @param {MouseActionCallback} callback */
        this.onDrag = (callback) => {
            dragCallbacks.push(callback);
        }
        /** @param {MouseActionCallback} callback */
        this.onDragStart = (callback) => {
            dragStartCallbacks.push(callback);
        }
        /** @param {MouseActionCallback} callback */
        this.onDragEnd = (callback) => {
            dragEndCallbacks.push(callback);
        }

        this.dragCallback = (mouse) => {
            dragCallbacks.forEach((callback)=>callback(mouse));
        }
        this.dragStartCallback = (mouse) => {
            dragStartCallbacks.forEach((callback)=>callback(mouse));
        }
        this.dragEndCallback = (mouse) => {
            dragEndCallbacks.forEach((callback)=>callback(mouse));
        }

        /**
         * @typedef {MiniVector} DragPosition
         * @property {MiniVector} start
         * @property {MiniVector} delta
         **/

        /** @param {DragPosition} newPosition */
        this.positionChanged = (newPosition) => {

        }

        this.setPosition = (newPosition, callback = true) => {
            position.set(newPosition);
            if (callback) this.positionChanged(newPosition);
        }

        domElement.classList.add("draggable");
    }
}
/** @param {Node} canvas */
Draggable.setCanvas = (canvas = document) => {
    const mouse = Interactive_Mouse.get();
    mouse.setCanvas(canvas);
}
/* harmony default export */ const Interactive_Draggable = (Draggable);
// EXTERNAL MODULE: ./src/dom-model-gui/Model.js
var Model = __webpack_require__(55);
// EXTERNAL MODULE: ./src/utils/measureExec.js
var measureExec = __webpack_require__(525);
var measureExec_default = /*#__PURE__*/__webpack_require__.n(measureExec);
;// CONCATENATED MODULE: ./src/utils/promiseDebounceFunction.js

//https://stackoverflow.com/questions/35228052/debounce-function-implemented-with-promises
const promiseDebounce = (inner, ms = 0) => {
	let timer = null;
	let resolves = [];

	return function (...args) {
		// Run the function after a certain amount of time
		clearTimeout(timer);
		timer = setTimeout(() => {
			// Get the result of the inner function, then apply it to the resolve function of
			// each promise that has been created since the last time the inner function was run
			let result = inner(...args);
			resolves.forEach(r => r(result));
			resolves = [];
		}, ms);

		return new Promise(r => resolves.push(r));
	};
}
/* harmony default export */ const promiseDebounceFunction = (promiseDebounce);
// EXTERNAL MODULE: ./src/dom-model-gui/GuiComponents/SVGElements.js
var SVGElements = __webpack_require__(211);
;// CONCATENATED MODULE: ./src/utils/const typicalLaneSettings.js

;


/**
 * @typedef {import("../DomInterfaces/components/Lane").LaneOptions} LaneOptions
 */
/**
 * @typedef {Object} TypicalLaneSettingsReturn
 * @property {string} name 
 * @property {number} x position
 * @property {number} y position
 * @property {number} centerAmplitude pan vertical
 * @property {number} rangeAmplitude zoom vertical
 * @property {number} firstSample pan horizontal
 * @property {number} rangeSamples zoom horizontal
 * @property {number} width size horizontal
 * @property {number} height size vertical
 * @property {Module} module 
 * @property {SVGCanvas} drawBoard 
 * 
 * @typedef {Object<String,number|string|Module|Model|SVGCanvas>} ExtraLaneOptions
 */

/**
 * @param {Module} module
 * @param {SVGCanvas} drawBoard
 * @returns {TypicalLaneSettingsReturn}
 * */
const typicalLaneSettings=(module,drawBoard)=>({
    name:"Lane",
    x:0,y:0,
    centerAmplitude:0,rangeAmplitude:2,
    firstSample:0, rangeSamples:44100,
    width:800, height:120,
    module, drawBoard,
})

/* harmony default export */ const const_typicalLaneSettings = (typicalLaneSettings);
;// CONCATENATED MODULE: ./src/dom-model-gui/utils/round.js
const round = (num,decp = 2) => {
    let m = Math.pow(10,decp);
    return Math.round(num * m) / m;
}
/* harmony default export */ const utils_round = (round);
;// CONCATENATED MODULE: ./src/dom-model-gui/GuiComponents/Knob.js






let defaultKnobOptions = {
    x: 0, y:0,
    radius:20,
    name:false,
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
    integer:(deltaval)=> {
        const newVal = Math.round(deltaval * 20);
        return newVal;
    },
    frequency:(deltaval)=>{
        deltaval*=100;
        return Math.pow(Math.abs(deltaval),2)*Math.sign(deltaval);
    },
    gain:(deltaval)=>(deltaval*3),
    channelvol:(deltaval)=>deltaval*5,
}

class Knob extends SVGElements.SVGGroup{
    constructor(userOptions){
        const options = {};
        Object.assign(options,defaultKnobOptions);
        Object.assign(options,userOptions);

        super(options);


        let nameText = new SVGElements.Text({
            x:0,
            y: options.radius * 1.4,
            "style":"font-size:"+options.radius * 0.5+"px",
            'text-anchor':'middle'
        });
        let valueText = new SVGElements.Text({
            x:0,
            y: options.radius * 1.9,
            "style":"font-size:"+options.radius * 0.5+"px",
            'text-anchor':'middle'
        });

        if(options.name){
            this.add(nameText);
        }
        this.add(valueText);


        let knobShape = new SVGElements.Path();
        let valueShape = new SVGElements.Path();
        this.add(valueShape);
        this.add(knobShape);
        valueShape.set({"fill":"none"});
        valueShape.addClass("knob-value-arc");

        const remakeValueShape=()=>{
            let maxValue = options.max?options.max:1;
            // console.log(maxValue);
            // if(!maxValue) throw new Error("maxvalue"+maxValue);
            let endPortion = this.value / maxValue;
            if(endPortion>1) endPortion=1;
            //there's no good reason for using an arc.
            let maxCorners = 54;
            let lastPoint = [];
            let pathString = "";

            let corners = maxCorners * endPortion;

            for(let corner = 0; corner<corners; corner++){
                let nowPoint=[
                    Math.cos(Math.PI * 2 * corner/maxCorners) * options.radius,
                    Math.sin(Math.PI * 2 * corner/maxCorners) * options.radius,
                ];
                if(corner > 0){
                    pathString += `L ${nowPoint.join()} `
                }else{
                    pathString += `M ${nowPoint.join()}`;
                }
                lastPoint=nowPoint;
            }

            //add that last one bit
            let nowPoint=[
                Math.cos(Math.PI * 2 * endPortion) * options.radius,
                Math.sin(Math.PI * 2 * endPortion) * options.radius,
            ];
            pathString += `L ${nowPoint.join()} `

            valueShape.set({"d":pathString});
        }
        
        const remakePath=()=>{
            let corners = 7;
            let lastPoint = [];
            let pathString = "";

            for(let corner = 0; corner<corners; corner++){
                let nowPoint=[
                    Math.cos(Math.PI * 2 * corner/corners) * options.radius * 0.6,
                    Math.sin(Math.PI * 2 * corner/corners) * options.radius * 0.6,
                ];
                if(corner > 0){
                    pathString += `L ${lastPoint.join()} ${nowPoint.join()} `
                }else{
                    pathString += `M ${nowPoint.join()}`;
                }
                lastPoint=nowPoint;
            }
            
            pathString += `z`;
            if(options.min !==false && options.max !==false){
                //knob direction indicator
                pathString += `M ${options.radius * 0.6},${0}`;
                pathString += `Q ${options.radius * 0.6},${0} ${0},${0}`
            }
            knobShape.set({"d":pathString});
            remakeValueShape();
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


        const draggable = new Interactive_Draggable(knobShape.domElement);

        draggable.dragStartCallback=()=>{
            pixValueOnDragStart = valueToPixels(this.value);
            if(isNaN(pixValueOnDragStart)) pixValueOnDragStart=0;
            this.addClass("active");
        }

        draggable.dragEndCallback=()=>{
            this.removeClass("active");
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

        const handleChanged=(changes)=> changeCallbacks.forEach((cb)=>cb(changes));
        
        this.updateGraphic=()=>{
            knobShape.set({"transform":`rotate(${getAngle()})`});

            let dispVal = utils_round(this.value,2);
            if(isNaN(dispVal)) dispVal = 0;
            valueText.set({"text":"~"+(dispVal)});

            if(options.min!==false&&options.max!==false){
                remakeValueShape();
            }
        }

        this.changeValue=(to)=>{
            this.value=to;
            this.updateGraphic();
            handleChanged({value:to});
        }
        
        //TODO: this is specific to fields project, thus needs to be removed and extended in that project.
        /** 
         * @param {Model} model
         * @param {string} parameterName
         */
        this.setToModelParameter=(model,parameterName)=>{
            
            let propertyObject = {};
            
            options.name=parameterName;

            nameText.set({"text":options.name});
            this.add(nameText);
            this.value=propertyObject[parameterName];

            
            this.onChange(({value})=>{
                propertyObject[parameterName] = value;
                model.set(propertyObject);
            });

            model.onUpdate((changes)=>{
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
                case "order":
                    this.setDeltaCurve("integer");
                    this.setMinMax(0,10);
                break;

                case "levela":
                case "levelb":
                case "levelc":
                case "leveld":
                case "time":
                case "length":
                    this.setMinMax(0,5);
                default:
                    this.setDeltaCurve("gain");
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
         * @param {"integer"|"frequency"|"gain"|"channelvol"|"integer"|"periodseconds"} deltaCurve
         **/
        this.setDeltaCurve=(deltaCurve)=>{
            options.deltaCurve=deltaCurve;
            return this;
        }
        
        if(options.deltaCurve){
            this.setDeltaCurve(options.deltaCurve);
        }

        if(options.model && options.parameter){
            this.setToModelParameter(
                options.model,options.parameter
            );
        }
    }
}

/* harmony default export */ const GuiComponents_Knob = (Knob);
;// CONCATENATED MODULE: ./src/dom-model-gui/Interactive/Clickable.js




const Clickable_VectorTypedef = __webpack_require__(424);

/**
 * @typedef {VectorTypedef.MiniVector} MiniVector
 */


/**
 * @typedef {Node} NodeWithClassList
 * @property {Set<string>} classList
 * @exports NodeWithClassList
 */



/**
 * @class Clickable
 * 
 * thing that can be dragged. It does not implement actual updating of position,
 * as it doesn't assume the object to have certain properties for position or 
 * certain render methods. The user must implement by using dragCallback function
 * override
 *  @constructor 
 *  @param {HTMLElement|SVGElement|Component} element */
function Clickable(element) {
    const mouse = Interactive_Mouse.get();
    let domElement = utils_anyElementToDomElement(element);

    let clickStartedHere = false;

    this.mouseDownCallback = (mouse) => {
    }
    this.clickCallback = (mouse) => {
    }
    this.mouseUpCallback = (mouse) => {
    }

    mouse.onUp(() => {
        clickStartedHere = false;
    });

    domElement.addEventListener('mousedown', () => {
        clickStartedHere=true;
        this.mouseDownCallback(mouse);
    });
    domElement.addEventListener('mouseup', () => {
        this.mouseUpCallback(mouse);
        if(clickStartedHere){
            this.clickCallback(mouse);
        }
    });

    domElement.classList.add("clickable");
}

/** @param {Node} canvas */
Clickable.setCanvas = (canvas = document) => {
    const mouse = Interactive_Mouse.get();
    mouse.setCanvas(canvas);
}
/* harmony default export */ const Interactive_Clickable = (Clickable);
;// CONCATENATED MODULE: ./src/dom-model-gui/GuiComponents/Toggle.js





let defaultToggleOptions = {
    x: 0, y: 0,
    width: 20,
    name: "toggle",
    class: "toggle",
    min: false, max: false,
}

class Toggle extends SVGElements.SVGGroup {
    constructor(userOptions) {
        const options = {};
        Object.assign(options, defaultToggleOptions);
        Object.assign(options, userOptions);
        super(options);

        let nameText = new SVGElements.Text({
            x: -options.radius,
            y: options.radius + 5
        });

        this.add(nameText);

        let buttonShape = new SVGElements.Rectangle();
        let valueShape = new SVGElements.Rectangle();
        this.add(valueShape);
        this.add(buttonShape);
        valueShape.set({"fill": "none"});
        valueShape.addClass("knob-value-arc");

        const remakeValueShape = () => {
            valueShape.attributes.width = options.width - 6;
            valueShape.attributes.height = options.width - 6;

            valueShape.attributes.x = 3 - options.width/2;
            if (this.value) {
                valueShape.attributes.y = 3 - options.width;
            } else {
                valueShape.attributes.y = 3;
            }

            valueShape.update();
        }

        const remakePath = () => {
            buttonShape.attributes.width = options.width;
            buttonShape.attributes.height = options.width * 2;

            buttonShape.attributes.x = -options.width/2;
            buttonShape.attributes.y = -options.width;

            nameText.attributes["text-anchor"]="middle";
            nameText.attributes.y = options.width * 1.5;

            nameText.update();
            buttonShape.update();
            remakeValueShape();
        }

        remakePath();

        const changeCallbacks = [];

        const clickable = new Interactive_Clickable(buttonShape.domElement);

        clickable.mouseUpCallback = () => {
            this.changeValue(this.value ? false : true);
        }

        this.value = false;

        /** @param {Function} cb */
        this.onChange = (cb) => {
            changeCallbacks.push(cb);
        }
        const handleChanged = (changes) => changeCallbacks.map((cb) => cb(changes));

        this.updateGraphic = () => {
            nameText.set({"text": options.name});
            remakeValueShape();
        }

        this.changeValue = (to) => {
            this.value = to;
            this.updateGraphic();
            handleChanged({ value: to });
        }

        /** 
         * @param {Model} model
         * @param {string} parameterName
         */
        this.setToModelParameter = (model, parameterName) => {

            let propertyObject = {};
            propertyObject = model.settings;
            options.name = parameterName;
            this.value = propertyObject[parameterName];

            this.onChange(({ value }) => {
                propertyObject[parameterName] = value;
                model.set(propertyObject);
            });

            model.onUpdate((changes) => {
                if (changes[parameterName]) {
                    this.value = changes[parameterName];
                    this.updateGraphic();
                }
            });
            this.updateGraphic();
        }

        if(options.model && options.parameter){
            this.setToModelParameter(
                options.model,options.parameterName
            );
        }
    }
}

/* harmony default export */ const GuiComponents_Toggle = (Toggle);
;// CONCATENATED MODULE: ./src/DomInterfaces/config/placement.js
/* harmony default export */ const placement = ({
    patcher:{
        width:150, // pixels
    },
    

});
;// CONCATENATED MODULE: ./src/SoundModules/common/vars.js
// @ts-nocheck

/**
 * @returns {AudioContext} the new or existing context
 */
function getAudioContext(){
    var AudioContext = window.AudioContext || window.webkitAudioContext;
    
    if(! window.audioCtx){
        console.log("creating new audioContext", AudioContext);
        window.audioCtx = new AudioContext();
        // var oscillator = audioCtx.createOscillator();
        // var gain = audioCtx.createGain();
        // gain.gain.value=0.2;
        // gain.connect(audioCtx.destination);
        // oscillator.type = 'square';
        // oscillator.frequency.setValueAtTime(220, audioCtx.currentTime); // value in hertz
        // oscillator.connect(gain);
        // oscillator.start();
    }
    return window.audioCtx;
}

const audioContext=getAudioContext();

const maxRecursion = 20;
const sampleRate = audioContext.sampleRate;

;// CONCATENATED MODULE: ./src/utils/ValuePixelTranslator.js



/**
 * @export @typedef {{
*  rangeAmplitude:number,
*  rangeSamples:number,
*  centerAmplitude:number,
*  firstSample:number,
*  width:number,
*  height:number,
*  module:Model,
* }} ValuePixelTranslatorParams
*/
/**
 * @export @typedef {Object} ValuePixelChanges 
 * @param {number} [rangeAmplitude]
 * @param {number} [centerAmplitude]
 * @param {number} [width]
 * @param {number} [height]
 * @param {Model} [module]
 * }} 
*/
    
class ValuePixelTranslator {
    /**
     * reference to settings objects, which may be changed at runtime
     * causing changes in the scale in this object.
     * @param {ValuePixelTranslatorParams} settings
    */
    constructor(settings) {
        const module = settings.module;
        const moduleSettings = module.settings;
        this.settings=settings;
        
        let changedListeners = [];
        /**
         * @param {Function}  callback
         */
        this.onChange = (callback)=>{
            changedListeners.push(callback);
            ValuePixelTranslator.onChange(callback);
        }

        /** if you manually change some parameters, call this after, so that it can trigger the listeners accordingly. */
        this.handleChanged = (changes)=>{
            changedListeners.map((cb)=>cb(changes));
        }

        /**
         * Use this to change parameters such as zoom, center etc. and call any listener.
         * Also, call this without argument to just call the callbacks; for example when you need to get the initial state represented.
         * @param {ValuePixelChanges} settings 
         */
        this.change=(settings={})=>{
            Object.assign(this.settings,settings);
            this.handleChanged(settings);
        }

        /**
         * handy function to set the zoom/pan in such way that maxValue translates to maxPixel
         */
        this.coverVerticalRange=(minValue,maxValue)=>{
            const range=maxValue-minValue;
            this.change({
                rangeAmplitude: range,
                centerAmplitude: minValue + (range/2),
            });
        };

        /** pixel number to amplitude */
        this.yToAmplitude = (y) => {
            const {
                rangeAmplitude,height,
                centerAmplitude
            } = settings;
            const center=height/2;
            return  (centerAmplitude) - (y - center) * (rangeAmplitude / height);
        };

        /** amplitude to pixel number */
        this.amplitudeToY = (amplitude) => {
            const {
                rangeAmplitude,height,
                centerAmplitude
            } = settings;
            const center=height/2;
            return  ( centerAmplitude * height - amplitude * height ) / rangeAmplitude + center;
        };

        /** pixel number to sample number */
        this.xToSampleNumber = (x) => {
            let sampleNumber =  Math.floor(
                ValuePixelTranslator.shared.rangeSamples  * x / settings.width
            );
            return sampleNumber + ValuePixelTranslator.shared.firstSample;
        };

        /** sample number to pixel number */
        this.sampleNumberToX = (sampleNumber) => {
            sampleNumber -= ValuePixelTranslator.shared.firstSample;
            return Math.floor(settings.width * sampleNumber / ValuePixelTranslator.shared.rangeSamples);
        };

        /** convert pixel number into time in seconds */
        this.xToSeconds = (x)=>{
            return this.xToSampleNumber(x) / sampleRate;
        }
        /** convert time in seconds into pixel number  */
        this.secondsToX = (time)=>{
            return this.sampleNumberToX(time * sampleRate);
        }
    }
}

ValuePixelTranslator.shared = {
    rangeSamples:sampleRate,
    firstSample:0,
}


ValuePixelTranslator.changedListeners = [];
/**
 * @param {Function}  callback
 */
ValuePixelTranslator.onChange = (callback)=>{
    ValuePixelTranslator.changedListeners.push(callback);
}
/** if you manually change some parameters, call this after, so that it can trigger the listeners accordingly. */
ValuePixelTranslator.handleChanged = (changes)=>{
    ValuePixelTranslator.changedListeners.map((cb)=>cb(changes));
}
/**
 * Use this to change parameters such as zoom, center etc. and call any listener.
 * Also, call this without argument to just call the callbacks; for example when you need to get the initial state represented.
 * @param {ValuePixelChanges} settings 
 */
ValuePixelTranslator.change=(settings={})=>{
    Object.assign(ValuePixelTranslator.shared,settings);
    ValuePixelTranslator.handleChanged(settings);
}


/* harmony default export */ const utils_ValuePixelTranslator = (ValuePixelTranslator);
;// CONCATENATED MODULE: ./src/utils/stringAbbreviator.js

function abbreviate(str, maxlen = 5) {
    if (str.length <= maxlen) return str;

    str = str.match(/(^.{5})|([^aeiou]+)/g).join("") + "";
    if(str.length <= maxlen) return str;

    str = str.match(/(^.{3})|([^aeiou]+)/g).join("") + "";
    if(str.length <= maxlen) return str;

    str = str.match(/(^.)|([^aeiou]+)/g).join("") + "";
    // if(str.length<=maxlen) return str;
    // str = str.match(/[^a-z]/g).join("")+"";
    if (str.length <= maxlen) return str;
    if (maxlen < 3) return str.slice(0, maxlen - 1) + ".";
    if (maxlen < 5) return str = str.slice(0, 2) + "." + str.slice(str.length - maxlen + 3, str.length);
    str = str.slice(0, 3) + "" + str.slice(str.length - maxlen + 4, str.length) + ".";
    return str;
}
/* harmony default export */ const stringAbbreviator = (abbreviate);
;// CONCATENATED MODULE: ./src/DomInterfaces/components/SoundLoaderDecoder.js







let defaultSoundLoaderDecoderOptions = {
    x: 0, y:0,
    width:20,height:20,
    name:"soundLoaderDecoder",
    class:"soundLoaderDecoder",
    abbreviatedName:undefined,
}

class SoundLoaderDecoder extends SVGElements.SVGGroup{
    constructor(userOptions){
        const options = {};
        Object.assign(options,defaultSoundLoaderDecoderOptions);
        Object.assign(options,userOptions);
        super(options);

        const fileSelector = document.createElement('input');
        fileSelector.setAttribute('type', 'file');

        let filePath="";
        let fileName="";

        fileSelector.addEventListener('change', (event) => {
            console.log("file changed");
            let file = fileSelector.files[0];
            //TODO: resample when source sample rate is different than context samplerate
            if(file){
                const reader = new FileReader();
                reader.onload = function (e) {
                    const arrayBuffer = e.target.result;
                    console.log(e.target.result);
                    if(typeof arrayBuffer != "string"){
                        audioContext.decodeAudioData(arrayBuffer, function (audioBuffer) {
                            const numberOfChannels = audioBuffer.numberOfChannels;
                            //TODO: not just discarding other channels
                            const channelData = audioBuffer.getChannelData(0);
                            
                            filePath=file.name;
                            handleChanged({
                                sampleArray:channelData,
                                filePath
                            });
                        });
                    }else{
                        throw new Error("file decoding problem: expected arrayBuffer but got string");
                    }
                };
                reader.readAsArrayBuffer(file)
            }else{
                throw new Error("no files[0]");
            }
        });

        const selectFile = () => {
            //open dialog
            fileSelector.click();
        }
        


        let nameText = new SVGElements.Text({
            x:0,
            y: options.height + 5,
            'text-anchor':'middle'
        });
        let valueText = new SVGElements.Text({
            x:0,
            y: options.height + 15,
            'text-anchor':'middle'
        });

        this.add(nameText);
        this.add(valueText);


        let soundLoaderDecoderShape = new SVGElements.Path();
        
        soundLoaderDecoderShape.addClass("upload");
        soundLoaderDecoderShape.addClass("button");
        this.add(soundLoaderDecoderShape);


        const clickable = new Interactive_Clickable(this.domElement);

        clickable.clickCallback=()=>selectFile();

        clickable.mouseEnterCallback=()=>{
            valueText.set({"text": fileName});
            this.addClass("active");
        }

        clickable.mouseLeaveCallback=()=>{
            valueText.set({"text": stringAbbreviator(fileName,8)});
            this.removeClass("active");
        }
        
        const remakePath=()=>{
            
            let topLine = options.y + options.height / 2;
            let bottomLine = options.y - options.height / 2;

            let leftLine = options.x - options.width / 2;
            let rightLine = options.x + options.width / 2;

            let innerLeftLine = options.x - options.width / 4;
            let innerRightLine = options.x + options.width / 4;
            let arrowMiddleLine = options.y + options.height / 10;

            //arrow
            let c1=`${innerLeftLine}, ${topLine}`;
            let c2=`${innerRightLine}, ${topLine}`;
            let c3=`${innerRightLine}, ${arrowMiddleLine}`;
            let c4=`${rightLine}, ${arrowMiddleLine}`;

            let c5=`${options.x}, ${bottomLine}`;

            let c6=`${leftLine}, ${arrowMiddleLine}`;
            let c7=`${innerLeftLine}, ${arrowMiddleLine}`;
            let c8=`${innerLeftLine}, ${topLine}`;


            soundLoaderDecoderShape.set({
                "d":
                `M ${c1}
                L ${c2} 
                L ${c3} 
                L ${c4}
                L ${c5}
                L ${c6}
                L ${c7}
                L ${c8}
                z`
            });
        }

        remakePath();

        const changeCallbacks=[];
        
        /** abbreviated name functionality */
        
        const abbreviateText=()=>{
            if(!options.abbreviatedName){
                options.abbreviatedName=stringAbbreviator(options.name);
            }
            nameText.set({"text":options.abbreviatedName+"[load]"});
        }
        const deAbbreviateText=()=>{
            nameText.set({"text":`[${options.name}]`});
        }
        
        abbreviateText();

        this.value=0;
        /** @param {Function} cb */
        this.onChange=(cb)=>{
            changeCallbacks.push(cb);
        }

        const handleChanged=(changes)=> changeCallbacks.map((cb)=>cb(changes));
        
        this.updateGraphic=()=>{
            fileName = filePath.split("/").pop();
            valueText.set({"text": stringAbbreviator(fileName,8)});
        }
        
        /** 
         * @param {Model} module
         * @param {string} parameterName
         */
        this.setToModelParameter=(module,parameterName)=>{
            
            let propertyObject = {};
            propertyObject=module.settings;
            options.name=parameterName;
            this.value=propertyObject[parameterName];

            options.abbreviatedName=undefined;
            abbreviateText();
            
            this.onChange(({sampleArray})=>{
                propertyObject[parameterName] = sampleArray;
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
                case "order":
                    this.setDeltaCurve("integer");
                    this.setMinMax(0,10);
                break;

                case "time":
                case "length":
                    this.setMinMax(0,5);
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
         * @param {"integer"|"frequency"|"gain"|"channelvol"|"integer"|"periodseconds"} deltaCurve
         **/
        this.setDeltaCurve=(deltaCurve)=>{
            options.deltaCurve=deltaCurve;
            return this;
        }
    }
}

/* harmony default export */ const components_SoundLoaderDecoder = (SoundLoaderDecoder);
;// CONCATENATED MODULE: ./src/utils/getMyNameInObject.js
const getMyNameInObject=(me,inObject)=>{
    let keys = Object.keys(inObject);
    for(let keyName of keys){
        if(inObject[keyName] == me) return keyName;
    }
    return false;
}
/* harmony default export */ const utils_getMyNameInObject = (getMyNameInObject);
;// CONCATENATED MODULE: ./src/SoundModules/io/Output.js







/**
 * @callback OnAudioChangedCallback
 */
/**
 * @typedef {Object} OutputSettings
 */
class Output extends Model/* default */.Z{
    /** 
     * @param {Module} ownerModule module from where I get the sound
     */ 
    constructor (ownerModule) {
        super({});

        this.owner=ownerModule;
        this.name;

        setTimeout(()=>{
            /** @type {string} */
            this.name = utils_getMyNameInObject(this,ownerModule.outputs)||"";
            if(!this.name) throw new Error("Input not found in module's outputs object");
        },0);

        this.cachedValues = new Float32Array(0);

        /**
         * inputs to which I send sound
         * @type {Set<Input>} 
         */
        let myInputs = new Set();

        /**
         * @type {false|Promise<Float32Array>}
         */
        let currentPromise = false;

        /** @param {Input|Module} to */
        this.connectTo=(to)=>{
            if(to instanceof io_Input){
                myInputs.add(to);
                to.myConnectedOutput=this;
                ownerModule.changed({connections:true});
                return;
            }else if(to.inputs && to.inputs.main instanceof io_Input){
                this.connectTo(to.inputs.main);
                return;
            }
            throw new Error("you can only connect to Inputs or Modules");
        };

        /**
         * @callback ForEachConnectedInputCallback
         * @param {Input} connectedInput //input to which I am connected.
         */
        /**
         * @param {ForEachConnectedInputCallback} callback*/
        this.forEachConnectedInput=(callback)=>{
            myInputs.forEach(callback);
        }

        /** 
         * @function disconnect disconnect this module from an input node. The module will not cause effects in the other module's input any more.
         * @param {Input | false } input if not given, it will disconnect all the modules to which this module outputs
         */
        this.disconnect = (input = false) => {
            if(input){
                input.myConnectedOutput=false;
                myInputs.delete(input);
                // this.changed({
                //     connections:myInputs,
                // });
                input.owner.changed({connections:true});
                // ownerModule.changed({connections:true});
            }else{
                if(!input){
                    console.warn(myInputs);
                    throw new Error("For some reason a value in MyInputs is of wrong type: "+myInputs);
                }
                myInputs.forEach((input)=>this.disconnect(input));
            }
        }

        this.isConnected=()=>myInputs.size>0;

        /** @returns {Promise<Float32Array>} */
        this.getValues = async (recursion) => {
            if (recursion > maxRecursion)
                throw (new Error("max recursion reached"));
            if (ownerModule.cacheStillValid) {
                return (this.cachedValues);
            }else{
                await ownerModule.requestRecalculation(recursion);
                return this.cachedValues;
            }
        };

        this.propagateCacheChanged = () => {
            this.forEachConnectedInput((input)=>{
                input.owner.cacheObsolete();
            });
        }

    }
}
/* harmony default export */ const io_Output = (Output);
;// CONCATENATED MODULE: ./src/SoundModules/io/Input.js




class Input {
    /** 
     * @param {Module} ownerModule
     */
    constructor (ownerModule) {
        this.owner=ownerModule;

        setTimeout(()=>{
            /** @type {string} */
            this.name = utils_getMyNameInObject(this,ownerModule.inputs)||"";
            if(!this.name) throw new Error("Input not found in module's inputs object");
        },0);

        /**
         * input from which I get sound
         * @type {false|Output} 
         */
        this.myConnectedOutput = false;

        /** @returns {Promise<Float32Array>} */
        this.getValues = async (recursion) => {
            if (this.myConnectedOutput)
                return await this.myConnectedOutput.getValues(recursion);
            return new Float32Array(0);
        };

        this.getOwner=()=>ownerModule;
        

        // this.cacheObsolete = ownerModule.cacheObsolete;
    }
}
/* harmony default export */ const io_Input = (Input);
;// CONCATENATED MODULE: ./src/dom-model-gui/GuiComponents/ElementsArray.js




class ElementsArray{
    /**
     * @param {typeof SVGElementsArray | typeof DOMElementsArray} ListComponentConstructor
     * @param {SVGElementsArray | DOMElementsArray} groupComponent
     * @param {Object} [componentConstructorParameters]
     * the constructor for the gui component that represents
     * one item in the list.
     **/
    constructor (
        ListComponentConstructor,
        groupComponent,
        componentConstructorParameters = {}
    ) {
        /** 
         * Contains the list of instanced components.
         * In this way it re-utilizes components that 
         * may have been used before.
         */
        const instancesList = [];

        Object.assign(componentConstructorParameters,{parentElement:groupComponent});

        this.displayListComponent = (number,properties) => {
            if(!instancesList[number]){
                instancesList[number] = new ListComponentConstructor(componentConstructorParameters);
                groupComponent.add(instancesList[number]);
            }
            instancesList[number].set(properties);
            instancesList[number].show(properties);
        }
        /** 
         * @param {number} from
         * @param {number} [to]
         */
        this.hideInstances = (from, to) => {
            if(to===undefined) to = instancesList.length;
            for(let index=from; index<to; index++){
                instancesList[index].hide();
            }
        }

        this.displayArray = (array) => {
            let lastDisplayedValue = 0;
            array.forEach((value,number)=>{
                this.displayListComponent(number,value);
                lastDisplayedValue ++;
            });
            this.hideInstances(lastDisplayedValue);
        }
        groupComponent.instancesList = instancesList;
        groupComponent.displayArray = this.displayArray;
    }
}

class SVGElementsArray extends SVGElements.SVGGroup{
    constructor(
        ListComponentConstructor,
        componentConstructorParameters = {}
    ){
        super();
        this.instancesList = [];
        this.displayArray=(array)=>{}
        this.arrayController = new ElementsArray(
            ListComponentConstructor,
            this,
            componentConstructorParameters
        );
    }
}

class DOMElementsArray extends (/* unused pure expression or super */ null && (Div)){
    constructor(
        ListComponentConstructor,
        componentConstructorParameters = {}
    ){
        super();
        this.instancesList = [];
        this.displayArray=(array)=>{}
        this.arrayController = new ElementsArray(
            ListComponentConstructor,
            this,
            componentConstructorParameters
        );
    }
}

class ListElement{
    constructor(properties){
        this.hide = () => {}
        this.show = () => {}
        this.set=(settings)=>{}
    }
}

class DOMListElement extends (/* unused pure expression or super */ null && (Div)){
    constructor(properties){
        super();
        this.hide = () => {}
        this.show = () => {}
        this.set=(settings)=>{}
    }
}

class SVGListElement extends SVGElements.SVG{
    constructor(properties){
        super();
        this.hide = () => {}
        this.show = () => {}
        this.set=(settings)=>{}
    }
}


;// CONCATENATED MODULE: ./src/DomInterfaces/components/ConnectorGraph.js
/** @typedef {import("../PatchDisplay").NodePosition} NodePosition */










/**
 * @callback PatchStartCallback
 * @param {Object} props
 * @property {ConnectorGraph} props.from
 * @property {ConnectorGraph} props.to
 */
/**
 * @callback PatchEndCallback
 * @param {Object} props
 * @property {ConnectorGraph} props.from
 */

class GuiConnector {
    constructor() {
        /** @type {Array<PatchStartCallback>} */
        const patchStartListeners = [];
        /** @type {Array<PatchEndCallback>} */
        const patchEndListeners = [];
        /** @type {ConnectorGraph|undefined} */
        let patchFromOnRelease = undefined;
        /** @type {ConnectorGraph|undefined} */
        let patchToOnRelease = undefined;

        const mouse = Interactive_Mouse.get();

        /** @param {ConnectorGraph} connectorGraph */
        this.startPatchAction = connectorGraph => {
            if (!connectorGraph.output) return;
            console.log("connect ", connectorGraph.output.name, "...");
            if (patchFromOnRelease) {
                patchFromOnRelease.removeClass("active");
            }
            patchFromOnRelease = connectorGraph;
            patchFromOnRelease.addClass("active");

            patchStartListeners.map(callback => callback({
                from: patchFromOnRelease,
            }));
        };

        this.hover = connectorGraph => {
            console.log("... to ", connectorGraph.input.name, "? ...");
            patchToOnRelease = connectorGraph;
        }

        this.unhover = connectorGraph => {
            console.log("... nope, not ", connectorGraph.input.name, " ...");
            if (connectorGraph === patchToOnRelease) patchToOnRelease = undefined;
        }

        this.release = () => {
            if (
                patchFromOnRelease
                && patchFromOnRelease.output
                && patchToOnRelease
                && patchToOnRelease.input
            ) {
                patchFromOnRelease.output.connectTo(patchToOnRelease.input);

                patchEndListeners.forEach(callback => callback({
                    from: patchFromOnRelease,
                    to: patchToOnRelease
                }));
                console.log("... ah, to ", patchToOnRelease ? patchToOnRelease.input.name : patchToOnRelease, " ...");
                console.log("connected");
            } else {
                console.log("connection cancelled");
            }

            if (patchFromOnRelease) {
                patchFromOnRelease.removeClass("active");
                patchFromOnRelease = undefined;
            }

            patchToOnRelease = undefined;
        };

        /**@param {PatchStartCallback} callback */
        this.onPatchStart = (callback) => patchStartListeners.push(callback);
        /**@param {PatchEndCallback} callback */
        this.onPatchEnd = (callback) => patchEndListeners.push(callback);

        mouse.onUp(() => {
            this.release();
        });

    }
}

/** @param  {NodePosition} pos */

class ConnectorGraph extends SVGListElement {
    constructor() {
        super();

        const guiConnector = ConnectorGraph.getGuiConnector();

        this.position = {};
        this.absolute = {};

        this.input = undefined;
        this.output = undefined;

        const connectorText = new SVGElements.Text();
        const showText = () => this.add(connectorText);
        const hideText = () => this.remove(connectorText);
        const rect = new SVGElements.Rectangle();
        const hoverable = new Interactive_Hoverable(rect);

        hoverable.mouseEnterCallback = () => {
            showText();
            if (this.input) {
                guiConnector.hover(this);
            }
        }

        hoverable.mouseLeaveCallback = () => {
            hideText();
            if (this.input) {
                guiConnector.unhover(this);
            }
        }

        const clickable = new Interactive_Clickable(rect);

        clickable.mouseDownCallback = () => {
            guiConnector.startPatchAction(this);
        }


        this.add(rect);
        /**
           * @param {Object} props
           * @param {number} props.x
           * @param {number} props.y
           * @param {import("../../dom-model-gui/utils/Vector2").MiniVector} props.absolute
           * @param {string} props.name
           * @param {Output|undefined} props.output
           * @param {Input|undefined} props.input
           */
        this.set = ({ x, y, name, output, input, absolute }) => {
            this.position.x = x;
            this.position.y = y;
            this.input = input;
            this.output = output;
            this.absolute = absolute;
            Object.assign(rect.attributes, {
                x: x - 5,
                y: y - 5,
                width: 10,
                height: 10
            });
            rect.update();
            Object.assign(connectorText.attributes, {
                x: x - 20,
                y: y + 3,
                "text-anchor": "end",
                transform: "rotate(90deg)",
                text: name || "out"
            });
            connectorText.update();
        };

    }
}

/** @type {GuiConnector} */
ConnectorGraph.guiConnector = undefined;

ConnectorGraph.getGuiConnector = () => {
    if (!ConnectorGraph.guiConnector)
        ConnectorGraph.guiConnector = new GuiConnector();

    return ConnectorGraph.guiConnector;
}

/* harmony default export */ const components_ConnectorGraph = (ConnectorGraph);
;// CONCATENATED MODULE: ./src/DomInterfaces/components/Lane.js















const sizes = placement;

const Lane_VectorTypedef = __webpack_require__(424);

/**
 * @typedef {VectorTypedef.MiniVector} MiniVector
 */

/**
 * @typedef {Object} LaneOptions
 * @property {number} [x] 
 * @property {number} [y] 
 * @property {number} [width]
 * @property {number} [height]
 * @property {Module} module
 * @property {string} [name]
 * @property {SVGCanvas} drawBoard
 * @exports LaneOptions
 */


/**
 * @class Lane
 * @extends SVGGroup
 * */
class Lane extends SVGElements.SVGGroup {
    /**
     * @param {ValuePixelTranslator} translator
     * @param {LaneOptions} options
     */
    constructor(translator,options) {

        const { module, drawBoard } = options;
        const settings = const_typicalLaneSettings(module,drawBoard);
        Object.assign(settings, options);

        super(settings);


        this.addClass("lane");

        // this.autoZoom = () => { }

        // this.settings=settings;

        /** @type {function[]} */
        const movedCallbacks = [];
        /** @param {function} callback */
        this.onMoved = (callback) => {
            movedCallbacks.push(callback);
        }

        const handleMoved = () => {
            movedCallbacks.map((cb) => cb());
        }


        const handleRect = new SVGElements.Rectangle({
            x: settings.x,
            y: settings.y,
            width: settings.width,
            height: settings.height,
            fill: "transparent",
        });

        handleRect.addClass("lane-handle");

        //add a class to cause visual feedback while the module is processsing.
        module.onUpdate((changes)=>{
            if(changes.cacheStillValid === true){
                this.removeClass("working");
            }
            if(changes.cacheStillValid === false){
                this.addClass("working");
            }
        });

        module.interfaces.add(this);

        //position this lane at a distance from top, proportional to it's height,
        this.handyPosition = (posNumber) => {
            draggable.setPosition({
                y: posNumber * (settings.height + 5)
            });
            handleMoved();
            return this;
        }

        let controlsCount = 0;

        const widthPerControl = 40;
        const controlPanelTop = 10;
        const controlPanelRight = 30;
        const controlPanelHeight = 70;
        const controlsCenterTop = 26;
        const controlPanelBackground = new SVGElements.Rectangle();
        const controlPanel = new SVGElements.SVGGroup();

        let controlPanelAppended = false;
        const updateControlsBg = () => {
            if (controlsCount > 0 && !controlPanelAppended) {
                this.contents.add(controlPanel);
                controlPanel.add(controlPanelBackground);
                controlPanelAppended = true;
            }
            const cc1 = controlsCount + 1;
            controlPanel.attributes.class="control-panel";
            controlPanel.attributes.width = controlPanelWidth;
            controlPanel.attributes.x = options.width - controlPanelWidth - controlPanelRight;
            controlPanel.attributes.y = controlPanelTop;
            controlPanel.attributes.height = controlPanelHeight;

            controlPanelBackground.attributes.class="background";
            controlPanelBackground.attributes.width=controlPanel.attributes.width;
            controlPanelBackground.attributes.height=controlPanel.attributes.height;

            controlPanel.update();
            controlPanelBackground.update();
        }
        let controlPanelWidth = 20;
        
        /** @param {Component} component */
        this.appendToControlPanel = (component,width=widthPerControl) => {
            controlsCount++;
            updateControlsBg();

            controlPanelWidth += width/2;
            component.attributes.x= controlPanelWidth;
            component.attributes.y= controlsCenterTop;
            controlPanelWidth += width/2;

            component.update();
            controlPanel.add(component);
        }
        /** @param {string} parameterName */
        this.addKnob = (parameterName) => {
            const newControl = new GuiComponents_Knob();
            this.appendToControlPanel(newControl);
            newControl.setToModelParameter(module, parameterName);
            return newControl;
        }
        /** @param {string} parameterName */
        this.addToggle = (parameterName) => {
            const newControl = new GuiComponents_Toggle();
            this.appendToControlPanel(newControl);
            newControl.setToModelParameter(module, parameterName);
            return newControl;
        }

        /** @param {string} parameterName */
        this.addSoundDecoder = (parameterName) => {
            const newControl = new components_SoundLoaderDecoder();
            this.appendToControlPanel(newControl);
            newControl.setToModelParameter(module, parameterName);
            return newControl;
        }


        const draggable = new Interactive_Draggable(handleRect.domElement);
        draggable.setPosition(settings);
        draggable.positionChanged = (newPosition) => {
            settings.y = newPosition.y;
            this.set({"y": newPosition.y});
            handleMoved();
            return;

            // handleRect.attributes.x = settings.x;
            handleRect.attributes.y = settings.y;
            handleRect.update();

            // this.contents.attributes.x = settings.x;
            this.contents.attributes.y = settings.y;
            this.contents.update();
            handleMoved();
        };

        this.add(handleRect);

        this.contents = new SVGElements.SVGGroup({
            x: settings.x, y: settings.y,
            width: settings.width, height: settings.height,
            name: "contents"
        });

        //add graphs to input and output
        //TODO: encapsulate
        this.add(this.contents);

        /**
         * @typedef {Object} NodePosition
         * @property {string} NodePosition.name
         * @property {number} NodePosition.x
         * @property {number} NodePosition.y
         * @property {MiniVector} NodePosition.absolute
         * //either:
         * @property {Input} [NodePosition.input]
         * @property {Output} [NodePosition.output]
         **/
        
        const outputsArrayContainer = new SVGElementsArray(
            components_ConnectorGraph,{}
        );

        const inputsArrayContainer = new SVGElementsArray(
            components_ConnectorGraph,{}
        );
        
        /** @type {Array<NodePosition>|undefined} */

        const inputInfo=[];
        
        /** @returns {Array<NodePosition>} */
        
        this.getInputInfo = () => {
            const cols = 5;
            module.eachInput((input, index) => {
                let col = index % cols;
                let row = Math.floor(index / cols)
                const newInputPosition = {
                    x: settings.width + (col * 20) + 30,
                    y: row * 20 + 15,
                    absolute: {},
                    input,name:input.name,
                };
                newInputPosition.absolute.x = newInputPosition.x + settings.x;
                newInputPosition.absolute.y = newInputPosition.y + settings.y;
                if(! inputInfo[index]) inputInfo[index] = newInputPosition;
                Object.assign(inputInfo[index],newInputPosition);
            });
            return inputInfo;
        }

        /** @type {Array<NodePosition>|undefined} */

        const outputInfo=[];
        
        /** @returns {Array<NodePosition>} */
        
        this.getOutputInfo = () => {
            const cols = 5;
            module.eachOutput((output, index) => {
                let col = index % cols;
                let row = Math.floor(index / cols)
                const newInputPosition = {
                    x: settings.width + (col * 20) + 30,
                    y: settings.height - row * 20 - 10,
                    absolute: {},
                    output,name:output.name,
                };
                newInputPosition.absolute.x = newInputPosition.x + settings.x;
                newInputPosition.absolute.y = newInputPosition.y + settings.y;
                if(! outputInfo[index]) outputInfo[index] = newInputPosition;
                Object.assign(outputInfo[index],newInputPosition);
            });
            return outputInfo;
        }

        this.getConnectorGraphs = () => [
            ... outputsArrayContainer.instancesList,
            ... inputsArrayContainer.instancesList
        ];

        this.add(inputsArrayContainer,outputsArrayContainer);

        const updateSize = () => {
            const newWidth = drawBoard.size.width - sizes.patcher.width;
            settings.width = newWidth;
            translator.change({
                width:newWidth
            });
            this.set({width:newWidth});
            this.contents.set({width:newWidth});

            this.domElement.setAttribute("width", (newWidth+sizes.patcher.width)+"px");

            outputsArrayContainer.displayArray(this.getOutputInfo());
            inputsArrayContainer.displayArray(this.getInputInfo());
        }

        // updateSize();

        translator.onChange(()=>{
            const newWidth=translator.settings.width;
            handleRect.set({"width":newWidth});

            controlPanel.set({
                "x":
                newWidth - controlPanelWidth - controlPanelRight
            });
        });

        drawBoard.size.onChange(()=>updateSize());
        setTimeout(updateSize,1);

        const title = new SVGElements.Text({
            x: 10, y: 16,
            text: settings.name
        });

        this.contents.add(title);
        module.triggerInitialState();
    }
};

/* harmony default export */ const components_Lane = (Lane);
;// CONCATENATED MODULE: ./src/SoundModules/common/Module.js







let count = 0;

/**
 * @namespace SoundModules
 */

/**
 * @class Module
 * @extends Model
 */
class Module extends Model/* default */.Z{
    constructor(settings) {
        // Model.call(this, settings);
        super(settings);
        this.unique = count ++;
        this.name = this.constructor.name + "-" + this.unique;

        /** @type {Object<string, Input>} */
        this.inputs = {};
        /** @type {Object<string, Output>} */
        this.outputs = {};
        
        /** @type {Set<Lane>} */
        this.interfaces=new Set();
        /** @returns {Lane|undefined} */
        this.getInterface = ()=>this.interfaces.values().next().value;
        
        /**
         * @callback eachInputCallback
         * @param {Input} input
         * @param {number} index
         * @param {string} name
         */
        /**
         * @function eachInput run a callback function for each of the InputNodes. This saves the trouble of iterating each input. This function is intended to be called only from within the recalculate function.
         * @param {eachInputCallback} callback
         * @returns {Array<Promise>|Array} 
         */
        this.eachInput = (callback) => {
            return Object.keys(this.inputs).map((connName, index) => {
                //a bit of an ugly fix, but: ensure it has a name
                const input = this.inputs[connName];
                if(!input.name) input.name = connName;
                return callback(input, index, connName);
            }).filter((v)=>v!==undefined);
        };

        /**
         * @callback eachOutputCallback
         * @param {Output} output
         * @param {number} index
         * @param {string} name
         */
        /**
         * @function eachInput run a callback function for each of the InputNodes. This saves the trouble of iterating each input. This function is intended to be called only from within the recalculate function.
         * @param {eachOutputCallback} callback
         * @returns {Array<Promise>|Array} 
         */
        this.eachOutput = (callback) => {
            return Object.keys(this.outputs).map((connName, index) => {
                //a bit of an ugly fix, but: ensure it has a name
                const output = this.outputs[connName];
                if(!output.name) output.name = connName;
                return callback(output, index, connName);
            }).filter((v)=>v!==undefined);
        }
        
        this.getDefaultOutput = () => {
            const firstOutputName = Object.keys(this.outputs)[0];
            if(firstOutputName){
                return this.outputs[firstOutputName];
            }else{
                throw new Error("Could not get first output of tis module");
            }
        }
        
        /** 
         * @function connectTo connect the first output of this module
         * @param {Input} to */
        this.connectTo = (to) => {
            this.getDefaultOutput().connectTo(to);
            this.changed({outputs:true});
        };

        /** 
         * @function disconnect disconnect this module from an input node. The module will not cause effects in the other module's input any more.
         * @param {Output | false } output if not given, it will disconnect all the modules to which this module outputs
         * @param {Input | false } fromInput if not given, it will disconnect all the modules to which this module outputs
         */
        this.disconnect = (output = false, fromInput=false) => {
            if(output){
                output.disconnect(fromInput);
                this.changed({outputs:true});
            }else{
                this.eachOutput((output)=>{
                    if(!output){
                        console.warn(this.outputs);
                        throw new Error("For some reason an input is of wrong type: "+output);
                    }
                    this.disconnect(output);
                });
            }
        };

        this.cacheStillValid=false;
        
        this.cacheIsValid=()=>{
            this.cacheStillValid=true;
            this.changed({
                cacheStillValid:this.cacheStillValid
            });
        }

        this.cacheObsolete=()=>{
            this.cacheStillValid=false;
            this.changed({
                cacheStillValid:this.cacheStillValid
            });
            this.requestRecalculation();
        }

        const superSet = this.set;
        this.set=(changes = {})=>{
            superSet(changes);
            this.cacheObsolete();
            return this;
        }

        /** @param {number} recursion must be passed to any input's getValues call*/
        this.recalculate = async (recursion) => {}
        
        /**
         * used to get the values from the module, or to cause the module to recalculate its values.
         * @returns {Promise<Float32Array>} the sound array, sample by sample.
         * The samples will get recalculated if it's useCache flag is set to true. Otherwise, this function will return the cached samples.
         * The user can also get the cached samples by simply getting the `cachedValues` property from the output, in which case one might
         *  get outdated samples.
         */
        this.requestRecalculation = promiseDebounceFunction(async(recursion = 0)=>{
            // console.log("RR",this.name,recursion);
            await this.recalculate(recursion + 1);
            this.cacheIsValid();
            //if my cache changes, it means all my output modules need recalculation
            this.eachOutput((output) => output.propagateCacheChanged());
        },2);

        
        let measureCalculationTime = false;

        /** 
         * Calculate the output samples, filling the cachedValues property om each pertinent Output
         * @param {number} recursion
         * @returns {Promise} the recalc result 
         */
        this.recalculate = async (recursion = 0) => {
        };

        this.measureCalculationTime = () => {
            if(measureCalculationTime) return false;
            let originalRecalculateFn = this.recalculate;
            this.recalculate = async(...p) => {
                let inter = measureExec_default()(()=>originalRecalculateFn(...p));
                console.log(inter);
                return inter;
            }
        }

        /**
         * Trigger all the model change functions, so that any other object listening to this model's properties get the initial status of the module.
         */
        this.triggerInitialState = () => {
            this.cacheObsolete();
        };

        this.onUpdate((changes)=>{
            //every change done through "set" method will trigger a recalculation
            //some events are set using "update" and the recalculation mark needs to be added here
            if(changes.connections){
                this.cacheObsolete();
            }
        });
    }
}
/* harmony default export */ const common_Module = (Module);
;// CONCATENATED MODULE: ./src/utils/debounceFunction.js
// sourced from https://davidwalsh.name/javascript-debounce-function
// Returns a function, that, as long as it continues to be invoked, will not
// be triggered. The function will be called after it stops being called for
// N milliseconds. If `immediate` is passed, trigger the function on the
// leading edge, instead of the trailing.
const debounce = (func, wait = 5, immediate = false) => {
	let timeout;
	return function () {
		let context = this, args = arguments;
		let later = function () {
			timeout = null;
			if (!immediate) func.apply(context, args);
		};
		let callNow = immediate && !timeout;
		clearTimeout(timeout);
		timeout = setTimeout(later, wait);
		if (callNow) func.apply(context, args);
	};
};
/* harmony default export */ const debounceFunction = (debounce);
;// CONCATENATED MODULE: ./src/DomInterfaces/components/SmallDeleteButton.js



class SmallDeleteButton extends SVGElements.SVGGroup {
    constructor(userProps) {
        const properties = {
            x:0,y:0
        }
        
        Object.assign(properties, userProps);
        
        super(userProps);
        
        this.addClass("small-delete-button");
        const clickCallbacks = [];
        this.onClick = (clickCallback) => clickCallbacks.push(clickCallback);
        
        const circle = new SVGElements.Circle({r:7,cx:0,cy:0});

        const zs = 3;
         
        let crossString = "";
        crossString += `M ${-zs} ${-zs} `;
        crossString += `L ${zs} ${zs} `;
        crossString += `M ${-zs} ${zs} `;
        crossString += `L ${zs} ${-zs} `;
        const cross = new SVGElements.Path({ d: crossString });

        this.add(circle, cross);
        
        let clickable = new Interactive_Clickable(this);
        clickable.clickCallback = () => clickCallbacks.forEach(c => c());

    }
}

/* harmony default export */ const components_SmallDeleteButton = (SmallDeleteButton);
;// CONCATENATED MODULE: ./src/DomInterfaces/PatchDisplay.js









const pathTypes = __webpack_require__(211);

/** @typedef {pathTypes.PathOptions} PathOptions */

/**
 * @namespace DomInterface.PatchDisplay
 */

/*
* TODO: interfaces should also extend model, so that changes to interface can be tracked better.
*/

const PatchDisplay_VectorTypedef = __webpack_require__(424);

/**
 * @typedef {VectorTypedef.MiniVector} MiniVector
 */

/**
 * @typedef {Object} NodePosition
 * @property {string} name
 * @property {number} x
 * @property {number} y
 * @property {MiniVector} absolute
 * //either:
 * @property {Input} [input]
 * @property {Output} [output]
 **/

/**
 * @param {Output} fromOutput
 * @param {Input} toInput 
 */
class PatchCord {
    /** @param {SVGGroup} parentEl*/
    constructor(parentEl) {
        const myPath = new SVGElements.Path();
        
        const myDeleteButton = new components_SmallDeleteButton();

        let startPos = {};
        let endPos = {};

        /** @type {Output|false} */
        let from = false;
        /** @type {Input|false} */
        let to = false;

        myPath.addClass("hidden patchcord");
        parentEl.add(myPath);

        myPath.domElement.addEventListener(
            'click',
            (evt) => {
                myPath.domElement.classList.toggle("highlight");
            }
        );

        this.displaying = false;
        this.show = () => {
            if (this.displaying) return;
            this.displaying = true;
            myPath.removeClass("hidden");
            parentEl.add(myDeleteButton);
        }
        this.hide = () => {
            if (!this.displaying) return;
            this.displaying = false;
            myPath.addClass("hidden");//not deleted, thus color order is preserved.. or not?
            parentEl.remove(myDeleteButton);
        }
        this.set = (properties) => {
            if (properties.start) startPos = properties.start;
            if (properties.end) endPos = properties.end;
            if (properties.from) from = properties.from;
            if (properties.to) to = properties.to;

            this.show();
            let bez = Math.abs(startPos.y - endPos.y) / 5;
            
            myPath.set({'d':
                `M ${startPos.x + 5}, ${startPos.y}
                 C ${startPos.x + bez}, ${startPos.y}
                    ${endPos.x + bez}, ${endPos.y}
                    ${endPos.x + 5}, ${endPos.y}`
            });
            if (properties.end){
                // myDeleteButton.set({
                //     x: bez * 0.76 + (startPos.x + endPos.x)/2,
                //     y: (startPos.y + endPos.y)/2,
                // });

                myDeleteButton.set(endPos);
            }
        }
        myDeleteButton.onClick(()=>{
            try{
                if(!from) throw new Error("from is "+from);
                from.disconnect(to);
            }catch(e){
                console.warn(e);
            }
        });
    }
}

/** 
 * @class PatchDisplay
 * @extends SVGGroup
 */
class PatchDisplay extends SVGElements.SVGGroup {
    /** 
     * @param {SVGCanvas} drawBoard
     * */
    constructor(drawBoard) {
        super();

        const mouse = Interactive_Mouse.get();




        const connectActionPatchCord = new PatchCord(this);
        connectActionPatchCord.hide();

        const guiConnector = components_ConnectorGraph.getGuiConnector();

        this.addClass("patch-board");

        /** @type {Set<Module>}  */
        const myAppendedModules = new Set();

        /** @type {Set<Lane>}  */
        const myAppendedInterfaces = new Set();

        const patchCords = [];

        const drawPatchCord = (passObj, number) => {
            if (!patchCords[number]) patchCords[number] = new PatchCord(this);
            patchCords[number].set(passObj);
        }

        const hidePatchCordsFrom = (from) => {
            for (let index = from; index < patchCords.length; index++) {
                patchCords[index].hide();
            }
        }

        const getListOfConnectionCoordinates = () => {
            const coords = [{
                start: { x: 0, y: 0 },
                end: { x: 0, y: 0 },
            }];

            /** @type {Array<NodePosition>} */
            const outputInfo = [];

            /** @type {Array<NodePosition>} */
            const inputInfo = [];

            /** @type {Array<ConnectorGraph>} */
            const connectorGraphs = [];

            myAppendedInterfaces.forEach((lane) => {
                outputInfo.push(...lane.getOutputInfo());
                inputInfo.push(...lane.getInputInfo());
            });

            /** @param {Input} input */
            const getPositionOfInput = (input) => {
                return inputInfo.filter((position) => {
                    return position.input == input;
                })[0];
            }
            outputInfo.forEach((outputPosition) => {
                const outputNode = outputPosition.output;
                outputNode.forEachConnectedInput((input) => {
                    const inputPos = getPositionOfInput(input);
                    if (inputPos) {
                        const start = outputPosition.absolute;
                        const end = inputPos.absolute;
                        const from = outputPosition.output;
                        const to = inputPos.input;
                        coords.push({
                            start,
                            end,
                            from,
                            to,
                        });
                    } else {
                        console.error("input position found to draw patch cable");
                    }
                });
            });
            return coords;

        }

        const updatePatchLines = debounceFunction(() => {
            let coordinates = getListOfConnectionCoordinates();

            hidePatchCordsFrom(coordinates.length);

            coordinates.forEach((coord, index) => {
                drawPatchCord(coord,index);
            });
        }, 10);

        // client functions
        this.appendModules = (...modules) => {
            modules.map(this.appendModule);
        }

        /** @param {Module} module */
        this.appendModule = (module) => {
            myAppendedModules.add(module);

            module.onUpdate((changes) => {
                if (changes.outputs || changes.connections) {
                    updatePatchLines();
                }
            });

            const modInterface = module.getInterface();

            if (modInterface) {
                modInterface.onMoved(updatePatchLines);
                myAppendedInterfaces.add(modInterface);
            }

            updatePatchLines();
        }
        //event callbacks

        drawBoard.size.onChange(() => {
            updatePatchLines();
        });

        mouse.onMove(mouse => {
            if (connectActionPatchCord.displaying) {
                connectActionPatchCord.set(false, mouse);
            }
        });

        guiConnector.onPatchStart(({ from }) => {
            const startPos = from.position;
            connectActionPatchCord.set(startPos);
        });

        guiConnector.onPatchEnd(({ from, to }) => {
            console.log("patch end");
            connectActionPatchCord.hide();
        });


    }
}
/* harmony default export */ const DomInterfaces_PatchDisplay = (PatchDisplay);
;// CONCATENATED MODULE: ./src/DomInterfaces/TimeZoomer.js





class TimeZoomer extends SVGElements.SVGGroup {
    constructor() {
        super();
        const maxSample = 44100 * 4;

        let maxPixel;
        let samplePerPixel ;

        let minx;
        let maxx;

        console.log(maxPixel);

        const panRect = new SVGElements.Rectangle({
            class: "time-pan draggable",
        });
        const zoomRect = new SVGElements.Rectangle({
            class: "time-zoom draggable",
        });

        const rectXToSampleN=(x)=> maxSample * x / (window.innerWidth-panRect.attributes.width);

        const updateGraph = () => {
            
            maxPixel = window.innerWidth;
            samplePerPixel =  (maxPixel-(panRect.attributes.width||0))/maxSample;
            
            panRect.attributes.width = utils_ValuePixelTranslator.shared.rangeSamples * samplePerPixel;
            panRect.attributes.x = utils_ValuePixelTranslator.shared.firstSample * samplePerPixel;
            panRect.attributes.height = 10;

            const zoomSize = 10;

            zoomRect.attributes.width = panRect.attributes.width + zoomSize * 2;
            zoomRect.attributes.x = panRect.attributes.x - zoomSize;
            zoomRect.attributes.height = panRect.attributes.height;
            
            panRect.update();
            zoomRect.update();
        }

        updateGraph();

        utils_ValuePixelTranslator.onChange(()=>updateGraph());
        
        //zoomrect lies behind, so that you can drag each side.
        this.add(zoomRect);
        this.add(panRect);

        let panDraggable = new Interactive_Draggable(panRect.domElement);
        panDraggable.positionChanged = (pos)=>{
            let positionInRange = rectXToSampleN(pos.x);
            if(positionInRange<0) positionInRange=0;
            // if(pos.x>maxx) pos.x=maxx;
            // if(positionInRange>maxSample || positionInRange<0) return;
            this.pan(Math.floor(positionInRange));
        };

        let zoomDraggable = new Interactive_Draggable(zoomRect.domElement);
        zoomDraggable.positionChanged = (pos)=>{
            let positionInRange = rectXToSampleN(pos.x);

            // if(positionInRange>maxSample || positionInRange<0) return;
            this.zoom(Math.floor(positionInRange));
        };

        this.zoom = (l) => {
            return utils_ValuePixelTranslator.change({ rangeSamples: l });
        };
        this.pan = (l) => {
            // console.log("pan",l);
            return utils_ValuePixelTranslator.change({ firstSample: l });
        };
    }

}

/* harmony default export */ const DomInterfaces_TimeZoomer = (TimeZoomer);
;// CONCATENATED MODULE: ./src/utils/asanoboy-makewav.js

var Wav = function(opt_params){
    
    let hasContents = false;
	/**
	 * @private
	 */
	let sampleRate = opt_params && opt_params.sampleRate ? opt_params.sampleRate : 44100;
	
	/**
	 * @private
	 */
	let channels = opt_params && opt_params.channels ? opt_params.channels : 2;  
	
	/**
	 * @private
	 */
	let eof = true;
	
	/**
	 * @private
	 */
	let bufferNeedle = 0;
	
	/**
	 * @private
	 */
    let buffer;
    let internalBuffer;
    let hasOutputHeader;
    
	this.setBuffer = (to) => {
        buffer = this.getWavInt16Array(to);
        bufferNeedle = 0;
        internalBuffer = '';
        hasOutputHeader = false;
        eof = false;
        hasContents=true;
    }
    this.getBuffer = (len) => {
        if(!hasContents) throw new Error("requested buffer, but the buffer has not been set yet.");
        var rt;
        if( bufferNeedle + len >= buffer.length ){
            rt = new Int16Array(buffer.length - bufferNeedle);
            eof = true;
        }
        else {
            rt = new Int16Array(len);
        }
        
        for(var i=0; i<rt.length; i++){
            rt[i] = buffer[i+bufferNeedle];
        }
        bufferNeedle += rt.length;
        
        return  rt.buffer;
    };

    this.getBlob = () => {
        const srclist = [];
        while( !this.eof() ){
            srclist.push(this.getBuffer(1000));
        }
        return new Blob(srclist, {type:'audio/wav'});
    }

    this.getDownload = () => {
        const b = this.getBlob();
        const URLObject = window.webkitURL || window.URL;
        return URLObject.createObjectURL(b);
    }

    this.eof = function(){
        return eof;
    };

    this.getWavInt16Array = (buffer) => {
		
        var intBuffer = new Int16Array(buffer.length + 23), tmp;
        
        intBuffer[0] = 0x4952; // "RI"
        intBuffer[1] = 0x4646; // "FF"
        
        intBuffer[2] = (2*buffer.length + 15) & 0x0000ffff; // RIFF size
        intBuffer[3] = ((2*buffer.length + 15) & 0xffff0000) >> 16; // RIFF size
        
        intBuffer[4] = 0x4157; // "WA"
        intBuffer[5] = 0x4556; // "VE"
            
        intBuffer[6] = 0x6d66; // "fm"
        intBuffer[7] = 0x2074; // "t "
            
        intBuffer[8] = 0x0012; // fmt chunksize: 18
        intBuffer[9] = 0x0000; //
            
        intBuffer[10] = 0x0001; // format tag : 1 
        intBuffer[11] = channels; // channels: 2
        
        intBuffer[12] = sampleRate & 0x0000ffff; // sample per sec
        intBuffer[13] = (sampleRate & 0xffff0000) >> 16; // sample per sec
        
        intBuffer[14] = (2*channels*sampleRate) & 0x0000ffff; // byte per sec
        intBuffer[15] = ((2*channels*sampleRate) & 0xffff0000) >> 16; // byte per sec
        
        intBuffer[16] = 0x0004; // block align
        intBuffer[17] = 0x0010; // bit per sample
        intBuffer[18] = 0x0000; // cb size
        intBuffer[19] = 0x6164; // "da"
        intBuffer[20] = 0x6174; // "ta"
        intBuffer[21] = (2*buffer.length) & 0x0000ffff; // data size[byte]
        intBuffer[22] = ((2*buffer.length) & 0xffff0000) >> 16; // data size[byte]	
    
        for (var i = 0; i < buffer.length; i++) {
            tmp = buffer[i];
            if (tmp >= 1) {
                intBuffer[i+23] = (1 << 15) - 1;
            }
            else if (tmp <= -1) {
                intBuffer[i+23] = -(1 << 15);
            }
            else {
                intBuffer[i+23] = Math.round(tmp * (1 << 15));
            }
        }
        
        return intBuffer;
    };
};



/* harmony default export */ const asanoboy_makewav = (Wav);
;// CONCATENATED MODULE: ./src/scaffolding/SoundDownloader.js






class SoundDownloader{
    constructor(){
        
        /** @type {Module|false} */
        let myModule = false;
        let defaultModuleOutput;

        let position={
            x:0,
            y:0,
            width:20,
            height:20,
            spacing:5,
        }

        const everyPlayButton=[];
        /** @param {Module} module */
        this.appendModule = (module)=>{
            console.log("module appended to downloader");

            defaultModuleOutput = module.getDefaultOutput();
        
            let topLine = position.y - position.height / 2;
            let bottomLine = position.y + position.height / 2;
            let leftLine = position.x - position.width / 2;
            let rightLine = position.x + position.width / 2;

            let innerLeftLine = position.x - position.width / 4;
            let innerRightLine = position.x + position.width / 4;
            let arrowMiddleLine = position.y + position.height / 10;

            //arrow
            let c1=`${innerLeftLine}, ${topLine}`;
            let c2=`${innerRightLine}, ${topLine}`;
            let c3=`${innerRightLine}, ${arrowMiddleLine}`;
            let c4=`${rightLine}, ${arrowMiddleLine}`;

            let c5=`${position.x}, ${bottomLine}`;

            let c6=`${leftLine}, ${arrowMiddleLine}`;
            let c7=`${innerLeftLine}, ${arrowMiddleLine}`;
            let c8=`${innerLeftLine}, ${topLine}`;

            const downloadButton = new SVGElements.SVGGroup();

            let path = new SVGElements.Path({
                d: `M ${c1}
                    L ${c2} 
                    L ${c3} 
                    L ${c4}
                    L ${c5}
                    L ${c6}
                    L ${c7}
                    L ${c8}
                    z`,
            });

            downloadButton.add(path);

            downloadButton.domElement.setAttribute("class","button download");
            everyPlayButton.push(downloadButton);
            module.getInterface().appendToControlPanel(
                downloadButton, position.width +10
            );
            
            downloadButton.domElement.addEventListener('mousedown',(evt)=>{
                downloadButton.addClass("active");
                this.download(module);
            });

            downloadButton.domElement.addEventListener('mousedown',(evt)=>{
                downloadButton.removeClass("active");
            });
            
        }
        /** 
         * @param {Array<Float32Array>} buffers
         * @returns {Float32Array}
         **/
        const interleave = (buffers) => {
            let length = 0;
            buffers.forEach((buff)=>length+=buff.length);
            const newBuffer = new Float32Array(length);
            const numberOfChannels=buffers.length;
            buffers.forEach((buffer,bufferNumber)=>{
                buffer.forEach((num,sampleNumber)=>{
                    newBuffer[(sampleNumber*numberOfChannels)+bufferNumber]=num;
                });
            });
            return newBuffer;
        }

        let downloadNo = 0;
        /** @param {Module} module */
        this.download=(module)=>{
            
            function namedDownload(blob, filename) {
                var a = document.createElement('a');
                a.download = filename;
                a.href = blob;
                document.body.appendChild(a);
                a.click();
                a.remove();
            }
            
            let wav;
            let channels = [];

            if(module.outputs.l && module.outputs.r){
                channels = [
                    module.outputs.l.cachedValues,
                    module.outputs.r.cachedValues,
                ];
                wav = new asanoboy_makewav({sampleRate: sampleRate, channels: 2});
            }else{
                channels = [
                    module.getDefaultOutput().cachedValues,
                ];
                wav = new asanoboy_makewav({sampleRate: sampleRate, channels: 1});
            }
            

            wav.setBuffer(interleave(channels));
            const link = wav.getDownload();

            namedDownload(link,
                "soundsculpt-"
                + module.name
                + "-"
                + (downloadNo++)
            );
        }
    }
}
/* harmony default export */ const scaffolding_SoundDownloader = (SoundDownloader);
;// CONCATENATED MODULE: ./src/rust/RustProcessor.js
//todo: un-hardcode this.
const RustProcessor_sampleRate = 44100;

class RustProcessor {
    constructor (){
        
        if(RustProcessor.instance) console.warn("more than one instance of rustProcessor");
        RustProcessor.instance=this;

        this.ready=false;


        /**
         * @callback onReadyCallback
         * @param {RustProcessor} rustProcessor loaded wasm or other worker process 
         */
        /** @type  {Array<onReadyCallback>} */
        const onReadyCallbacks = [];
        /**
         * @param {onReadyCallback} callback
         **/
        this.onReady = (callback)=>{
            if(this.ready){
                callback(this);
            }else{
                onReadyCallbacks.push(callback);
            }
        }

        /** @returns {Promise<RustProcessor>} */
        this.wait=()=>new Promise((resolve)=>this.onReady(()=>{
            resolve(this);
        }));

        this._handleReady=(caller)=>{
            console.log("rust process is now ready");
            onReadyCallbacks.forEach((callback)=>callback(caller));
            this.ready=true;
        }

        __webpack_require__.e(/* import() */ 80).then(__webpack_require__.bind(__webpack_require__, 80)).then((lib) => {
            this.add=(a,b)=>lib.add(a,b);
            /**
             * @param {number} values
             * @returns {Float32Array} result
             **/
            this.arrGenSin = (duration,frequency)=>lib.array_sine(RustProcessor_sampleRate,duration,frequency);
            /**
             * @param {Array<number>} values
             * @returns {Float32Array} result
             **/
            this.arrCombFilter = (samplesArray,
                frequency,dampening_inverse,dampening,feedback) => lib.array_filter_comb(
                RustProcessor_sampleRate,samplesArray,
                frequency,dampening_inverse,dampening,feedback
            );

            /**
             * @param {object} settings
             * @param {Float32Array} settings.inputs_l
             * @param {Float32Array} settings.inputs_r
             * @param {number} settings.dampening
             * @param {boolean} settings.freeze
             * @param {number} settings.wet
             * @param {number} settings.width
             * @param {number} settings.dry
             * @param {number} settings.roomSize
             * @returns {Array<Float32Array>} result
             **/
            this.freeverb = ({
                    inputs_l,inputs_r,
                    dampening,
                    freeze,
                    wet,
                    width,
                    dry,
                    roomSize,
                }) => {
                let ret_l = new Float32Array(inputs_l.length);
                let ret_r = new Float32Array(inputs_l.length);
                
                let freeverb = new lib.Freeverb(RustProcessor_sampleRate);

                freeverb.set_dampening(dampening);
                freeverb.set_freeze(freeze);
                freeverb.set_wet(wet);
                freeverb.set_width(width);
                freeverb.set_dry(dry);
                freeverb.set_room_size(roomSize);

                freeverb.process(inputs_l,inputs_r,ret_l,ret_r);

                return [ret_l,ret_r];
            }
            this._handleReady(this);
        });

    }
}

/** @type {RustProcessor | false} */
RustProcessor.instance = false;

/** @returns {RustProcessor} */
RustProcessor.get = () => RustProcessor.instance?RustProcessor.instance:(new RustProcessor());

/* harmony default export */ const rust_RustProcessor = (RustProcessor);
;// CONCATENATED MODULE: ./src/scaffolding/SoundPlayer.js
//TODO: exact coordination between the channels 






const MagicPlayer = function(myOutput) {
    //playing position in the original module, from where we source sound
    let sourcePlayhead=0;
    //how long each period
    var bufferSize = 2048;

    let playing = false;

    this.play=()=>playing=true;
    this.stop=()=>playing=false;

    //get a curve to fade in/out old and new "peeked" buffer (click prevention)
    const fadeCurveFunction = (v) => {
        return (1-Math.cos(Math.PI * v))/2;
    }
    this.setOutput=(newOutput)=>{
        myOutput=newOutput;
    }
    //makes a slice from the module's buffer in a circular way
    const getCircularSlice=(start,length)=>{
        let returnBuffer = [];
        if(myOutput){
            start %= myOutput.cachedValues.length;
            let sliceStart = start;
            let sliceEnd = (start+length) % myOutput.cachedValues.length

            returnBuffer = Array.from(
                myOutput.cachedValues
            ).slice(
                start,
                start+length
            );

            //if the current period will reach beyond the length of audio loop
            if(sliceEnd<sliceStart){
                let append = Array.from(
                    myOutput.cachedValues
                ).slice(
                    0,
                    sliceStart-sliceEnd
                );
                returnBuffer = returnBuffer.concat(append);
            }
        }
        return returnBuffer;
    }
    //the foreseen period, in the state it was on the last period
    /** @type {false|Array<number>} */
    let peekedPeriod = false;
    let interpolationSpls = bufferSize;

    var node = audioContext.createScriptProcessor(bufferSize, 1, 1);
    node.channelInterpretation
    node.onaudioprocess = function(e) {
        
        //make a copy of the buffer for this period. This will let us interpolate,
        //preventing the clicks caused by buffer changes while playing.
        //note that the frequency response of the interpolation changes 
        //in function of the bufferSize selection.
        let currentBuffer = getCircularSlice(sourcePlayhead,bufferSize);
        // var input = e.inputBuffer.getChannelData(0);
        var output = e.outputBuffer.getChannelData(0);

        for (var i = 0; i < bufferSize; i++) {
            
            if(playing && myOutput){
                let nowWeight = fadeCurveFunction(i/interpolationSpls);
                if(nowWeight>1) nowWeight=1;
                let nextWeight = 1-nowWeight;
                //current sonic contents fading in...
                output[i] = currentBuffer[i] * nowWeight;
                if(peekedPeriod){
                    //and the previously expected sonic contents fading out.
                    //clipped, for security.
                    output[i] += Math.min(1,peekedPeriod[i] * nextWeight);
                }
            }else{
                output[i]=0;
            }
        }
        sourcePlayhead += bufferSize;
        if(myOutput) sourcePlayhead %= myOutput.cachedValues.length;

        //peek into next period, so that in next lap we interpolate
        peekedPeriod = getCircularSlice(sourcePlayhead,bufferSize);
    }
    this.node=node;
};


class SoundPlayer{
    constructor(){
        /** @type {AudioBufferSourceNode|false} */
        var source=false;
        const myGain = audioContext.createGain();
        myGain.gain.value=1;
        myGain.connect(audioContext.destination);

        const pannerLeft = audioContext.createStereoPanner();
        const pannerRight = audioContext.createStereoPanner();

        pannerLeft.pan.value=-1;
        pannerRight.pan.value=1;

        pannerLeft.connect(myGain);
        pannerRight.connect(myGain);

        const magicPlayerLeft = new MagicPlayer(false);
        const magicPlayerRight = new MagicPlayer(false);

        magicPlayerLeft.node.connect(pannerLeft);
        magicPlayerRight.node.connect(pannerRight);

        let position={
            x:-15,
            y:-10,
            width:30,
            height:20,
            spacing:5,
        }

        const everyPlayButton=[];
        /** @param {Module} module */
        this.appendModule = (module)=>{
            console.log("module appended to player");
            //rect
            let c1=`${position.x}, ${position.y}`;
            let c2=`${position.x + position.width}, ${position.y}`;
            let c3=`${position.x + position.width}, ${position.y + position.height}`;
            let c4=`${position.x}, ${position.y + position.height}`;
            let triW = position.width / 5;
            let triH = position.width / 5;
            let triStartX = position.x + position.width/2 - triW/2;
            let triStartY = position.y + position.height/2 - triH/2;
            //tri
            let c5=`${triStartX}, ${triStartY}`;
            let c6=`${triStartX + triW}, ${triStartY + triH / 2}`;
            let c7=`${triStartX}, ${triStartY + triH}`;

            const playButton = new SVGElements.SVGGroup();

            let path = new SVGElements.Path({
                d: `M ${c1}
                    L ${c2} 
                    L ${c3} 
                    L ${c4}
                    z
                    M ${c5}
                    L ${c6}
                    L ${c7}
                    z`,
            });


            playButton.add(path);

            playButton.domElement.setAttribute("class","button play");
            everyPlayButton.push(playButton);

            module.getInterface().appendToControlPanel(
                playButton,
                position.width + 10
            );
            
            module.onUpdate((changes)=>{
                if(changes.cachedValues){
                    // this.updateBuffer();
                }
            });
            
            playButton.domElement.addEventListener('mousedown',(evt)=>{
                if(playButton.domElement.classList.contains("active")){

                    console.log("stop");
                    this.stop();
                    
                    everyPlayButton.map((otherButton)=>{
                        otherButton.removeClass("active");
                    });
                }else{

                    everyPlayButton.map((otherButton)=>{
                        otherButton.removeClass("active");
                    });

                    console.log("play");
                    playButton.addClass("active");
                    this.setModule(module,true);

                }

            });
            
        }

        /** @param {Module} module */
        this.setModule = (module,start=false)=>{
            if(module.outputs.l && module.outputs.r){
                magicPlayerLeft.setOutput(module.outputs.l);
                magicPlayerRight.setOutput(module.outputs.r);
            }else{
                try{
                    let defo=module.getDefaultOutput();
                    magicPlayerLeft.setOutput(defo);
                    magicPlayerRight.setOutput(defo);
                }catch(e){
                    console.warn("module doesn't have default output",module);
                }
            }
            if(start){
                magicPlayerLeft.play();
                magicPlayerRight.play();
            }
        }

        // this.updateBuffer = ()=>{
        //     if(!buffer) return;
        //     if(!myOutput) return;
        //     //not possible for now
        // }

        // /** @type {AudioBuffer|false} */
        // let buffer=false;

        this.stop = ()=>{
            magicPlayerLeft.stop();
            magicPlayerRight.stop();
        }
    }
}
/* harmony default export */ const scaffolding_SoundPlayer = (SoundPlayer);
// EXTERNAL MODULE: ./node_modules/seedrandom/index.js
var seedrandom = __webpack_require__(377);
var seedrandom_default = /*#__PURE__*/__webpack_require__.n(seedrandom);
;// CONCATENATED MODULE: ./src/SoundModules/operators/Operator.js


class Operator{
    constructor(){
        this.reset=()=>{}

        /** @returns {number} */
        this.calculateSample=(sample)=>{
            return sample;
        }
    }
}

/* harmony default export */ const operators_Operator = (Operator);
;// CONCATENATED MODULE: ./src/SoundModules/operators/OscillatorOperator.js
let rng=seedrandom_default()();






class OscillatorOperator extends operators_Operator{



    constructor({sampleRate}){
        super();

        let phaseAccumulator = 0;
        const accumulatePhase = (frequency) => {
            phaseAccumulator += frequency / sampleRate;
        };
        
        /** set phase and reset the oscillator state */
        this.setPhase = (phase) => {
            phaseAccumulator = phase;
            //for noise, lets us have always the same noise. phase will be the seed
            rng=seedrandom_default()(phase);
        }

        const shapes = {
            sin: (frequency, amplitude,bias) => {
                accumulatePhase(frequency);
                return Math.sin(phaseAccumulator * Math.PI * 2) * amplitude
                    + bias;
            },
            cos: (frequency, amplitude,bias) => {
                accumulatePhase(frequency);
                return Math.cos(phaseAccumulator * Math.PI * 2) * amplitude
                    + bias;
            },
            ramp: (frequency, amplitude,bias) => {
                accumulatePhase(frequency);
                return (phaseAccumulator % 1 - 0.5) * amplitude
                    + bias;
            },
            square: (frequency, amplitude,bias) => {
                accumulatePhase(frequency);
                return (((phaseAccumulator % 1 ) > 0.5)?1:-1) * amplitude
                    + bias;
            },
            noise: (frequency, amplitude,bias) => {
                accumulatePhase(frequency);
                return (rng() - 0.5) * amplitude
                    + bias;
            },
            offset: (frequency, amplitude,bias) => {
                accumulatePhase(frequency);
                return amplitude * bias;
            }, 
        };
        
        this.currentOscFunction = shapes.sin;
        
        this.setShape = (to) => {
            if(shapes[to]){
                this.currentOscFunction=shapes[to];
            }else{
                throw new Error(
                    "could not set oscillator operator shape to "+to+"."
                    + " try either of these: "
                    + Object.keys(shapes).join(", ")
                );
            }
        }

        this.reset=()=>{
            this.setPhase(0);
        }

        /**
         * calculate an individual sample
         * it has the side effect of accumulating phase by
         * increments of 1/samplerate.
         * 
         * @param {number} freq
         * @param {number} amp
         * @param {number} bias
         * */
        this.calculateSample=(freq,amp,bias)=>{
            return this.currentOscFunction(freq,amp,bias);
        }
    }
}

/* harmony default export */ const operators_OscillatorOperator = (OscillatorOperator);
;// CONCATENATED MODULE: ./src/SoundModules/Oscillator.js







/**
 * @namespace SoundModules.Oscillator
 */

const defaultSettings={
    amplitude:1,
    bias:0,
    length:1,
    frequency:2,
    phase:0,
    shape:"sin",
};

/** 
 * @typedef {Object} OscillatorOptions
 * @property {number} [amplitude]
 * @property {number} [bias]
 * @property {number} [length]
 * @property {number} [frequency]
 * @property {number} [phase]
 * @property {"sin"|"cos"|"ramp"|"noise"|"offset"} [shape]
 */
/**
 * @class Oscillator 
 * @extends Module
 */
class Oscillator extends common_Module{
    /**
     * @param {OscillatorOptions} userSettings
     */
    constructor(userSettings = {}) {
        //apply default settings for all the settings user did not provide
        const settings = {};
        Object.assign(settings, defaultSettings);
        Object.assign(settings, userSettings);
        let first = true;
        super(settings);

        const operator = new operators_OscillatorOperator({sampleRate: sampleRate});

        this.inputs.frequency = new io_Input(this);
        this.inputs.amplitude = new io_Input(this);
        this.inputs.bias = new io_Input(this);

        const output = this.outputs.main = new io_Output(this);
        
        this.setFrequency = (to) => {
            return this.set({
                frequency: to
            });
        };
        this.setAmplitude = (to) => {
            return this.set({
                amplitude: to
            });
        };
        
        this.setShape = (to) => {
            try{
                //this one is just to get the error right away.
                //the shape is actually set in the recalculate to ensure
                //sync
                operator.setShape(to);
                this.set({
                    shape: to
                });
                this.cacheObsolete();
            }catch(e){
                throw e;
            }
            return this;
        };
        
        this.setPhase = (to) => {
            return this.set({
                phase: to
            });
        };
        
        this.recalculate = async (recursion = 0) => {
            const lengthSamples = settings.length * sampleRate;
            output.cachedValues = new Float32Array(lengthSamples);

            operator.setShape(settings.shape);
            operator.setPhase(settings.phase);
            
            const [
                freqInputValues,
                ampInputValues,
                biasInputValues
            ] = await Promise.all([
                this.inputs.frequency.getValues(recursion),
                this.inputs.amplitude.getValues(recursion),
                this.inputs.bias.getValues(recursion)
            ]);
            
            for (let a = 0; a < lengthSamples; a++) {
                const freq = (freqInputValues[a] || 0) + settings.frequency;
                const amp = (ampInputValues[a] || 0) + settings.amplitude;
                const bias = (biasInputValues[a] || 0) + settings.bias;
                output.cachedValues[a] = operator.calculateSample(freq, amp, bias);
            }
            //return output.cachedValues;
        };
    }
}

/* harmony default export */ const SoundModules_Oscillator = (Oscillator);
;// CONCATENATED MODULE: ./src/SoundModules/HarmonicsOscillator.js








/**
 * @namespace SoundModules.HarmonicsOscillator
 */

const HarmonicsOscillator_defaultSettings={
    amplitude:1,
    bias:0,
    length:1,
    frequency:2,
    phase:0,
    shape:"sin",
    mixCurve:1,
    interval1:0,
    interval2:0,
    interval3:0,
    interval4:0,
};

/** 
 * @typedef {Object} HarmonicsOscillatorOptions
 * @property {number} [amplitude]
 * @property {number} [bias]
 * @property {number} [length]
 * @property {number} [frequency]
 * @property {number} [phase]
 * @property {number} [mixCurve]
 * @property {number} [interval1]
 * @property {number} [interval2]
 * @property {number} [interval3]
 * @property {number} [interval4]
 * @property {"sin"|"cos"|"ramp"|"noise"|"offset"} [shape]
 */
/**
 * @class HarmonicsOscillator 
 * @extends Module
 */
class HarmonicsOscillator extends common_Module{
    /**
     * @param {HarmonicsOscillatorOptions} userSettings
     */
    constructor(userSettings = {}) {
        //apply default settings for all the settings user did not provide
        const settings = {};
        Object.assign(settings, HarmonicsOscillator_defaultSettings);
        Object.assign(settings, userSettings);
        let first = true;
        super(settings);

        this.inputs.frequency = new io_Input(this);
        this.inputs.amplitude = new io_Input(this);
        this.inputs.bias = new io_Input(this);
        this.inputs.mixCurve = new io_Input(this);

        this.inputs.interval1 = new io_Input(this);
        this.inputs.interval2 = new io_Input(this);
        this.inputs.interval3 = new io_Input(this);
        this.inputs.interval4 = new io_Input(this);


        const output = this.outputs.main = new io_Output(this);


        this.setFrequency = (to) => {
            return this.set({
                frequency: to
            });
            this.cacheObsolete();
            return this;
        };

        this.setAmplitude = (to) => {
            return this.set({
                amplitude: to
            });
        };
        
        this.setShape = (to) => {
            return this.set({
                shape: to
            });
        };
        /** @type {Worker|false} */
        let worker = false;
        this.setPhase = (to) => {
            return this.set({
                phase: to
            });
        };
        this.recalculate = async(recursion = 0) => {
            const [
                freqInputValues,
                ampInputValues,
                biasInputValues,
                mixCurveInputValues,

                interval1Values,
                interval2Values,
                interval3Values,
                interval4Values,
            ] = await Promise.all([
                this.inputs.frequency.getValues(recursion),
                this.inputs.amplitude.getValues(recursion),
                this.inputs.bias.getValues(recursion),
                this.inputs.mixCurve.getValues(recursion),

                this.inputs.interval1.getValues(recursion),
                this.inputs.interval2.getValues(recursion),
                this.inputs.interval3.getValues(recursion),
                this.inputs.interval4.getValues(recursion),
            ]);
                        
            
            return await new Promise((resolve,reject)=>{
                
                if(worker) {
                    worker.terminate();
                    worker=false;
                }

                worker = new Worker(new URL(/* worker import */ __webpack_require__.p + __webpack_require__.u(916), __webpack_require__.b));
                
                worker.onmessage = ({ data }) => {

                    if(data.audioArray){
                        output.cachedValues=data.audioArray;
                        resolve(data.audioArray);
                        worker=false;

                    }
                    if(data.log){
                        console.log(data.log);
                    }
                };


                worker.postMessage({
                    settings:Object.assign({},settings),
                    sampleRate: sampleRate,
                    
                    freqInputValues,
                    ampInputValues,
                    biasInputValues,
                    mixCurveInputValues,

                    interval1Values,
                    interval2Values,
                    interval3Values,
                    interval4Values,
                });
            });



        };
    }
}

/* harmony default export */ const SoundModules_HarmonicsOscillator = (HarmonicsOscillator);
;// CONCATENATED MODULE: ./src/SoundModules/Mixer.js





/**
 * @namespace SoundModules.Mixer
 */

const Mixer_defaultSettings={
    amplitude:1,
    levela:0.25,
    levelb:0.25,
    levelc:0.25,
    leveld:0.25,
    normalize:false,
    saturate:true,
};
/**
 * @class Mixer
 * @extends Module
 */
class Mixer extends common_Module{
    constructor(userSettings = {}) {
        //apply default settings for all the settings user did not provide
        const settings = {};
        Object.assign(settings, Mixer_defaultSettings);
        Object.assign(settings, userSettings);

        const { amplitude } = settings;
        
        super(settings);

        this.inputs.a = new io_Input(this);
        this.inputs.b = new io_Input(this);
        this.inputs.c = new io_Input(this);
        this.inputs.d = new io_Input(this);

        const output = this.outputs.main = new io_Output(this);
        
        this.recalculate = async (recursion = 0) => {
            

            let result=[];
            let first = true;

            let max = 0;
            let min = 0;
            
            await Promise.all(
                this.eachInput(async(input,inputno,inputName) => {
                    const inputValues = await input.getValues(recursion);
                    inputValues.forEach((val, index) => {
                        if(!result[index]) result[index]=0;
                        result[index] += (val) *  settings["level"+inputName];
                    });
                })
            );

            output.cachedValues = new Float32Array(result.map((n)=>{
                if(n>1) return 1;
                if(n<-1) return -1;
                if(isNaN(n)) return 0;
                if(n>max) max = n;
                if(n<min) min = n;
                return n;
            }));

            if(settings.normalize && max!==0 && min!==0){
                let mult = 1/Math.min(Math.abs(min),max);

                output.cachedValues = output.cachedValues.map((n)=>{
                    return n * mult;
                });
            }
            
            if(settings.amplitude != 1){
                output.cachedValues = output.cachedValues.map((n)=>{
                    return n * amplitude;
                });
            }

            return output.cachedValues;
            
        };
    }
}

/* harmony default export */ const SoundModules_Mixer = (Mixer);
;// CONCATENATED MODULE: ./src/SoundModules/operators/BasicDelay.js

//just average, only takes sample into account
class BasicDelay extends operators_Operator{
    constructor(){
        super();
        this.delayCache;

        this.reset=()=>{
            this.delayCache=[];
        }

        this.calculateSample=(sample,lengthSamples)=>{
            let len = this.delayCache.push(sample);
            if(len > lengthSamples){
                this.delayCache.splice(0,this.delayCache.length-lengthSamples);
            }
            return this.delayCache[0];
        }
        
        this.reset();
    }
}

/* harmony default export */ const operators_BasicDelay = (BasicDelay);
;// CONCATENATED MODULE: ./src/utils/valueOrZero.js
const voz=(val)=>val?val:0;
/* harmony default export */ const valueOrZero = (voz);
;// CONCATENATED MODULE: ./src/SoundModules/Delay.js







/**
 * @namespace SoundModules.Module
 */

const Delay_defaultSettings={
    feedback:0.5,
    time:0.2, //seconds
    dry:1,
    wet:0.5,
};

/**
 * @class Delay
 * @extends Module
 */
class Delay extends common_Module{
    constructor(userSettings = {}) {
        //apply default settings for all the settings user did not provide
        const settings = {};
        Object.assign(settings, Delay_defaultSettings);
        Object.assign(settings, userSettings);

        const { amplitude } = settings;
        super(settings);

        this.inputs.main = new io_Input(this);
        this.inputs.feedback = new io_Input(this);
        this.inputs.time = new io_Input(this);

        const output = this.outputs.main = new io_Output(this);

        let operator = new operators_BasicDelay();
        
        this.recalculate = async (recursion = 0) => {

            operator.reset();
            
            let inputValues = await this.inputs.main.getValues(recursion);
            let delayInSamples = Math.floor(sampleRate * settings.time);

            let feedbackLevels = this.inputs.feedback.getValues(recursion);
            let timeLevels = this.inputs.time.getValues(recursion);

            output.cachedValues = new Float32Array(inputValues.length);
            
            inputValues.forEach((value,sampleNumber)=>{
                output.cachedValues[sampleNumber] = 0;
                
                let currentTimeLevel = valueOrZero(timeLevels[sampleNumber]) + delayInSamples;
                
                if(sampleNumber>currentTimeLevel){
                    let timeAgo=sampleNumber - currentTimeLevel;
                    value += (output.cachedValues[timeAgo] + inputValues[timeAgo])
                        * (settings.feedback + valueOrZero(feedbackLevels[sampleNumber]));
                }

                output.cachedValues[sampleNumber]+=operator.calculateSample(value,currentTimeLevel);
            });

            //mix dry and wet
            output.cachedValues.forEach((val,sampleNumber)=>{

                output.cachedValues[sampleNumber] = output.cachedValues[sampleNumber] * settings.wet 
                    + inputValues[sampleNumber] * settings.dry;
                
            });
        };
    }
}

/* harmony default export */ const SoundModules_Delay = (Delay);
;// CONCATENATED MODULE: ./src/utils/saturate1.js

const saturate1 = (val) => {
    if(val>1) val=1; 
    if(val<-1) val=-1;
    return val;
}

/* harmony default export */ const utils_saturate1 = (saturate1);
;// CONCATENATED MODULE: ./src/SoundModules/operators/Comb.js



//I havent checked that this is actually a comb filter
class Comb extends operators_Operator{
    constructor(){
        super();

        let delayBuf=[];
        
        this.reset=()=>{
            delayBuf=[];
        }
        this.calculateSample=(sample,frequency,reso,gain,order,saturate)=>{
            reso *= 0.5;
            gain *= 0.5;
            frequency /= 4;

            let period = sampleRate/frequency;
            
            let delayedSample = 0;
            
            if(delayBuf.length>period){
                delayedSample = delayBuf.shift();
            }

            sample *= reso;
            sample += delayedSample * reso;
            delayBuf.push(sample);
            
            let outSample = sample * gain;
            return saturate?utils_saturate1(outSample):outSample;
        }
    }
}
/* harmony default export */ const operators_Comb = (Comb);
;// CONCATENATED MODULE: ./src/SoundModules/operators/HpBoxcar.js




//just average, only takes sample into account
class HpBoxcar extends operators_Operator{
    constructor(){
        super();
        let lastOutput = 0;

        this.reset=()=>{
            lastOutput=0;
        }
        this.calculateSample=(sample,frequency,reso,gain,order,saturate)=>{
            //I actually don't know well how to calculate the cutoff frequency, I just made this simplistic guess:
            //a moving average roughly takes "weight" times to get quite close to the value
            let weighta = frequency/sampleRate;
            if(weighta>1) weighta=1;
            const weightb = 1-weighta;
            let output = (sample * weighta + lastOutput * weightb);
            lastOutput = output;
            output=(sample - output) * gain
            return saturate?utils_saturate1(output):output;
        }
    }
}

/* harmony default export */ const operators_HpBoxcar = (HpBoxcar);
;// CONCATENATED MODULE: ./src/SoundModules/operators/LpBoxcar.js




//just average, only takes sample into account
class LpBoxcar extends operators_Operator{
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
            
            return saturate?utils_saturate1(output):output;
        }
    }
}

/* harmony default export */ const operators_LpBoxcar = (LpBoxcar);
;// CONCATENATED MODULE: ./src/SoundModules/operators/HpNBoxcar.js


class HpNBoxcar extends operators_LpBoxcar{
    constructor(){
        super();
        let superCSample = this.calculateSample;
        this.calculateSample=(sample,frequency,reso,gain,order,saturate)=>{
            let output = sample * gain - superCSample(sample,frequency,reso,gain,order,false);
            return saturate?utils_saturate1(output):output;

        }
    }
}

/* harmony default export */ const operators_HpNBoxcar = (HpNBoxcar);
;// CONCATENATED MODULE: ./src/SoundModules/operators/LpNBoxcar.js




/**
 * boxcar, but utilizing any amount of steps in series. 
 * note the sample weighting function, which I decided arbitrarily. It could have been linear ramp.
 * not working! it produces undesired bias
 */
class LpNBoxcar extends operators_Operator{
    constructor(){
        super();
        
        let lastOutputs=[0,0,0,0,0,0,0,0,0,0,0,0];
        let dc=0;

        this.reset=()=>{
            lastOutputs=[0,0,0,0,0,0,0,0,0,0,0,0];
            dc=0;
        }

        this.calculateSample=(sample,frequency,reso,gain,order,saturate)=>{
            if(frequency < 0) frequency=0;
            let weighta = frequency/sampleRate;
            if(weighta>1) weighta=1;
            let weightb = 1-weighta;

            let resoScaled = (reso / 10);
            
            let currentIn=sample + (1 - lastOutputs[order-1]) * resoScaled;

            for(let pole=0; pole<order; pole++){
                lastOutputs[pole] = currentIn * weighta + lastOutputs[pole] * weightb;
                currentIn = lastOutputs[pole];
            }
            let output=currentIn * gain;
            return saturate?utils_saturate1(output):output;
        }
    }
}

/* harmony default export */ const operators_LpNBoxcar = (LpNBoxcar);
;// CONCATENATED MODULE: ./src/SoundModules/operators/LpMoog.js



//https://noisehack.com/custom-audio-effects-javascript-web-audio-api/
//https://www.musicdsp.org/en/latest/Filters/26-LpMoog-vcf-variation-2.html#id2
//todo: frequency and gain are off.
class LpMoog extends operators_Operator{
    constructor(){
        super();
        let msgcount = 0;
        let in1, in2, in3, in4, out1, out2, out3, out4
        in1 = in2 = in3 = in4 = out1 = out2 = out3 = out4 = 0.0;
        
        this.reset=()=>{
            in1 = in2 = in3 = in4 = out1 = out2 = out3 = out4 = 0.0;
            msgcount=0;
        }
        this.calculateSample=(sample,frequency,reso,gain,order,saturate)=>{
            if(frequency<0) frequency=0;
            let f = (frequency / sampleRate) * 1.16;
            
            let af = 1-f;
            let sqf = f*f;

            let fb = reso * (1.0 - 0.15 * sqf);

            let outSample=0;
            sample -= out4 * fb;
            sample *= 0.35013 * (sqf)*(sqf);

            out1 = sample + 0.3 * in1 + af * out1; // Pole 1
            in1 = sample;
            out2 = out1 + 0.3 * in2 + af * out2; // Pole 2
            in2 = out1;
            out3 = out2 + 0.3 * in3 + af * out3; // Pole 3
            in3 = out2;
            out4 = out3 + 0.3 * in4 + af * out4; // Pole 4
            in4 = out3;

            outSample = out4 * gain;
            // if(msgcount<20){
            //     msgcount++
            //     console.log({
            //         in1, in2, in3, in4, out1, out2, out3, out4,
            //         sample,frequency,reso,reso,order,
            //         f,fb,outSample
            //     });
            // }else if(msgcount==20){
            //     msgcount++
            //     console.log("omitting the rest...");
            // }
            // if(isNaN(frequency)) throw new Error("frequency is NaN");
            // if(isNaN(reso)) throw new Error("reso is NaN");
            // if(isNaN(fb)) throw new Error("fb is NaN");
            // if(isNaN(sample)) throw new Error("sample is NaN");
            // if(isNaN(in1)) throw new Error("in1 is NaN");
            // if(isNaN(out1)) throw new Error("out1 is NaN "+in1);
            // if(isNaN(out2)) throw new Error("out2 is NaN");
            // if(isNaN(out3)) throw new Error("out3 is NaN");
            // if(isNaN(out4)) throw new Error("out4 is NaN");
            // if(isNaN(outSample)) throw new Error("outSample is NaN");

            return saturate?utils_saturate1(outSample):outSample;
        }
    }
}
/* harmony default export */ const operators_LpMoog = (LpMoog);
;// CONCATENATED MODULE: ./src/SoundModules/operators/Pinking.js


//https://noisehack.com/custom-audio-effects-javascript-web-audio-api/
class Pinking extends operators_Operator{
    constructor(){
        super();

        let b0, b1, b2, b3, b4, b5, b6;
        b0 = b1 = b2 = b3 = b4 = b5 = b6 = 0.0;
        
        this.reset=()=>{
            b0 = b1 = b2 = b3 = b4 = b5 = b6 = 0.0;
        }
        this.calculateSample=(sample,frequency,reso,gain,order,saturate)=>{
            let outSample=0;
            b0 = 0.99886 * b0 + sample * 0.0555179;
            if(order>1) b1 = 0.99332 * b1 + sample * 0.0750759;
            if(order>2) b2 = 0.96900 * b2 + sample * 0.1538520;
            if(order>3) b3 = 0.86650 * b3 + sample * 0.3104856;
            if(order>4) b4 = 0.55000 * b4 + sample * 0.5329522;
            if(order>5) b5 = -0.7616 * b5 - sample * 0.0168980;
            outSample = b0 + b1 + b2 + b3 + b4 + b5 + b6 + sample * 0.5362;
            outSample *= gain;
            b6 = sample * 0.115926;
            return saturate?utils_saturate1(outSample):outSample;
        }
    }
}
/* harmony default export */ const operators_Pinking = (Pinking);
;// CONCATENATED MODULE: ./src/SoundModules/DelayWithFilter.js

















/**
 * @namespace SoundModules.DelayWithFilter
 */

/** @typedef {"none"
 *      |"LpBoxcar"
 *      |"HpBoxcar"
 *      |"LpMoog"
 *      |"Pinking"
 * } filterType */

/** 
 * @typedef {Object} FilterSettings
 * @property {number} [length]
 * @property {number} [frequency]
 * @property {number} [gain]
 * @property {number} [reso]
 * @property {filterType} [type]
 * @property {0|1|2|3|4} [order]
 * @property {boolean} [saturate]
 */

/**
 * @typedef {Object} CommonFilterProperties
 * @property {number} frequency
 * @property {number} reso 
 * @property {number} gain 
 * @property {number} order 
*/


const filterProtos={
    none:operators_Operator,
    LpMoog: operators_LpMoog,
    LpBoxcar: operators_LpBoxcar,
    LpNBoxcar: operators_LpNBoxcar,
    HpBoxcar: operators_HpBoxcar,
    HpNBoxcar: operators_HpNBoxcar,
    Comb: operators_Comb,
    Pinking: operators_Pinking
}

const DelayWithFilter_defaultSettings={
    feedback:0.5,
    time:0.2, //seconds
    dry:1,
    wet:0.5,
    gain:1,
    reso:0.2,
    length:1,
    type:"LpMoog",
    order:1,
    frequency:100,
    saturate:false,
};

/**
 * @class DelayWithFilter
 * @extends Module
 */
class DelayWithFilter extends common_Module{
    constructor(userSettings = {}) {
        //apply default settings for all the settings user did not provide
        const settings = {};
        Object.assign(settings, DelayWithFilter_defaultSettings);
        Object.assign(settings, userSettings);

        super(settings);

        this.inputs.main = new io_Input(this);
        this.inputs.feedback = new io_Input(this);
        this.inputs.time = new io_Input(this);
        this.inputs.frequency = new io_Input(this);
        this.inputs.gain = new io_Input(this);
        this.inputs.reso = new io_Input(this);

        const output = this.outputs.main = new io_Output(this);


        this.setOrder = (to) => {
            return this.set({
                order: to
            });
        };
        this.setFrequency = (to) => {
            return this.set({
                frequency: to
            });
        };
        /** @param {filterType} to */
        this.setType = (to) => {
            if(!filterProtos[to]){
                return Object.keys(filterProtos);
            }
            return this.set({
                type: to
            });
        };

        let delayOperator = new operators_BasicDelay();
        
        this.recalculate = async(recursion = 0) => {
            //filter setup
            let filter = new filterProtos[settings.type]();
            const order = settings.order;
            const frequencies = await this.inputs.frequency.getValues(recursion);
            const gains = await this.inputs.gain.getValues(recursion);
            const resos = await this.inputs.reso.getValues(recursion);
            const inputValues = await this.inputs.main.getValues(recursion);
            
            this.cachedValues = new Float32Array(inputValues.length);

            filter.reset();
            
            //delay setup
            delayOperator.reset();
            let delayInSamples = Math.floor(sampleRate * settings.time);

            let feedbackLevels = this.inputs.feedback.getValues(recursion);
            let timeLevels = this.inputs.time.getValues(recursion);
            
            inputValues.forEach((value,sampleNumber)=>{
                this.cachedValues[sampleNumber] = 0;
                
                let currentTimeLevel = Math.floor(
                    valueOrZero(timeLevels[sampleNumber]) * sampleRate + delayInSamples
                );

                value = filter.calculateSample(
                    value,
                    valueOrZero(frequencies[sampleNumber]) + settings.frequency,
                    valueOrZero(resos[sampleNumber]) + settings.reso,
                    valueOrZero(gains[sampleNumber]) + settings.gain,
                    order,settings.saturate
                );

                if(sampleNumber>currentTimeLevel){
                    let timeAgo=sampleNumber - currentTimeLevel;
                    value += (this.cachedValues[timeAgo])
                        * (settings.feedback + valueOrZero(feedbackLevels[sampleNumber]));
                    if(this.settings.saturate) value = utils_saturate1(value);
                }

                this.cachedValues[sampleNumber]+=delayOperator.calculateSample(value,currentTimeLevel);
                
            });

            //mix dry and wet
            this.cachedValues.forEach((val,sampleNumber)=>{

                this.cachedValues[sampleNumber] = this.cachedValues[sampleNumber] * settings.wet 
                    + inputValues[sampleNumber] * settings.dry;
                
            });

            //return this.cachedValues;
        };
    }
}

/* harmony default export */ const SoundModules_DelayWithFilter = (DelayWithFilter);
;// CONCATENATED MODULE: ./src/SoundModules/NaiveReverb.js







/**
 * @namespace SoundModules.Module
 */

const NaiveReverb_defaultSettings={
    feedback:0.5,
    diffusion:0.06,
    time:0.1, //seconds
    dry:0.5,
    wet:0.5,
};

/* 
a simple delay tap.
todo: in order to produce a network of delays, I need to also
implement some way for one reverb to send it's output to another
reverb, also producing feebdack loops
*/
class ReverbTap{
    constructor(){

        //delay reflection time start
        //in other words, wait this time before starting reverberating
        this.time = 100 / 1000;
        //how many consecutive taps are produced
        //in other words, how many times (*splrate) it reverberates 
        this.diffusion = 10 / 1000;

        let timeSpls;
        let difussionSpls;

        this.reset=()=>{
            this.pastSamples=[];
            timeSpls = Math.floor(this.time * sampleRate);
            difussionSpls = Math.floor(this.diffusion * sampleRate);
            console.log({timeSpls,difussionSpls});
        }

        this.calculateSample=(level, pastSamples)=>{
            let ret = 0;
            const pastSamplesEnd = pastSamples.length - timeSpls;
            const pastSamplesStart = pastSamplesEnd - difussionSpls;
            if(pastSamplesStart > 0){
                //get the correct samples at teh array start
                for(let tapN=pastSamplesStart; tapN < pastSamplesEnd; tapN++){
                    ret += pastSamples[tapN] * level;
                }
                // ret/=sampleRate;
            }
            return ret;
        }

        this.reset();
    }

}

/**
 * @class NaiveReverb
 * @extends Module
 */
class NaiveReverb extends common_Module{
    constructor(userSettings = {}) {
        //apply default settings for all the settings user did not provide
        const settings = {};
        Object.assign(settings, NaiveReverb_defaultSettings);
        Object.assign(settings, userSettings);

        const { amplitude } = settings;
        super(settings);

        this.inputs.main = new io_Input(this);
        this.inputs.feedback = new io_Input(this);
        this.inputs.time = new io_Input(this);

        const output = this.outputs.main = new io_Output(this);
        
        const tap1 = new ReverbTap();
        
        this.recalculate = async (recursion = 0) => {

            let delayCache = [];
            
            let inputValues = await this.inputs.main.getValues(recursion);
            let delayInSamples = Math.floor(sampleRate * settings.time);

            let feedbackLevels = await this.inputs.feedback.getValues(recursion);
            let timeLevels = await this.inputs.time.getValues(recursion);
            
            tap1.time = settings.time;
            tap1.diffusion = settings.diffusion;
            tap1.reset();


            output.cachedValues = new Float32Array(inputValues.length);
            
            inputValues.forEach((value,sampleNumber)=>{
                output.cachedValues[sampleNumber]=0;
                
                if(isNaN(value)) value = 0;
                delayCache.push(value);

                
                if(settings.wet>0){
                    output.cachedValues[sampleNumber] += tap1.calculateSample(
                        settings.feedback + valueOrZero(feedbackLevels[sampleNumber]),
                        delayCache
                    ) * settings.wet;
                }
                
                if(settings.feedback>0){
                    delayCache[delayCache.length-1] += output.cachedValues[sampleNumber] * settings.feedback;
                }


                if(settings.dry>0){
                    output.cachedValues[sampleNumber] += value * settings.dry;
                }
            });
        };
    }
}

/* harmony default export */ const SoundModules_NaiveReverb = (NaiveReverb);
;// CONCATENATED MODULE: ./src/SoundModules/EnvelopeGenerator.js




/**
 * @namespace SoundModules.EnvelopeGenerator
 */

/**
 * @typedef {Array<number>} EnvelopePoint a tuple containing two numbers: first is sample number (integers only), and the second is level (float)
 */

/** 
 * @typedef {Object} EnvelopeGeneratorSettings
 * @property {number} [amplitude]
 * @property {number} [bias]
 * @property {number} [length]
 * @property {Array<EnvelopePoint>} [points]
 * @property {boolean} [loop]
 */

/** @type {EnvelopeGeneratorSettings} */
const EnvelopeGenerator_defaultSettings = {
    amplitude: 1,
    bias: 0,
    length: 1,
    points: [],
    loop: false,
};

/**
 * @class EnvelopeGenerator 
 * @extends Module
 */
class EnvelopeGenerator extends common_Module {
    /**
     * @param {EnvelopeGeneratorSettings} userSettings
     */
    constructor(userSettings = {}) {
        //apply default settings for all the settings user did not provide
        const settings = {};
        Object.assign(settings, EnvelopeGenerator_defaultSettings);
        Object.assign(settings, userSettings);
        let first = true;
        let phaseAccumulator = 0;
        const accumulatePhase = (frequency) => {
            phaseAccumulator += frequency / sampleRate;
        };


        super(settings);

        this.setFrequency = (to) => {
            return this.set({
                frequency: to
            });
        };
        this.setLength = (to) => {
            return this.set({
                length: to
            });
        }
        this.setPoints = (points) => {
            return this.set({
                points
            });
        };
        this.addPoint = (point=[0,0]) => {
            return this.set({
                points: settings.points.push(point)
            });
        };
        const sortPointsByTime = () => {
            settings.points.sort((a, b) => a[0] - b[0]);
            this.changed({ points: settings.points });
        }
        const getInterpolation = (position, pointa, pointb) => {
            const distancea = position - pointa[0];
            const distanceb = pointb[0] - position;
            const distancet = pointb[0] - pointa[0];
            const ret = (pointa[1] * distanceb + pointb[1] * distancea) / distancet;
            // const ret=(
            //     pointa[1] * distancet / 4000
            // );
            if (isNaN(ret)) return 0;
            // return position / 44100;
            // return pointa[1]+pointb[1] * position / 44100;
            return ret;
        }


        const output = this.outputs.main = new io_Output(this);

        this.recalculate = async (recursion = 0) => {
            const lengthSamples = settings.length * sampleRate;
            
            output.cachedValues = new Float32Array(lengthSamples);

            sortPointsByTime();
            /** @returns {EnvelopePoint|false} */
            const getNextPoint = (spl) => {

                /** @type {EnvelopePoint|false} */
                let selected = false;
                for (let pnum = 0; pnum < settings.points.length; pnum++) {
                    const point = settings.points[pnum];
                    selected = point;
                    if (point[0] > spl) return selected;
                };
                return false;
            }


            let nextPoint = getNextPoint(0);
            let currentPoint = [0, 0];

            for (let splN = 0; splN < lengthSamples; splN++) {
                if (nextPoint) {
                    output.cachedValues[splN] = getInterpolation(splN, currentPoint, nextPoint);
                    if (splN >= nextPoint[0]) {
                        currentPoint = nextPoint;
                        nextPoint = getNextPoint(splN);
                    }
                } else {
                    if(settings.loop){
                        //currentPoint is now last point, and indicates length of the loop
                        output.cachedValues[splN] = output.cachedValues[splN % currentPoint[0]];
                    }else{
                        output.cachedValues[splN] = currentPoint[1]; //output.cachedValues[splN % currentPoint[0]];
                    }

                }
            }

            //return output.cachedValues;
        };
    }
}

/* harmony default export */ const SoundModules_EnvelopeGenerator = (EnvelopeGenerator);
;// CONCATENATED MODULE: ./src/SoundModules/EnvAttackRelease.js




const shapes = {};

shapes.exponential = (position,shape) => Math.pow(position,shape);

/**
 * @namespace SoundModules.Module
 */

const EnvAttackRelease_defaultSettings={
    attack:0.1,
    release:0.9,
    amplitude:1,
    attackCurve:"exponential",
    attackShape:1,
    releaseCurve:"exponential",
    releaseShape:1,
};

/**
 * @class EnvelopeAttackRelease
 * @extends Module
 */
class EnvelopeAttackRelease extends common_Module{
    constructor(userSettings = {}) {
        //apply default settings for all the settings user did not provide
        const settings = {};
        Object.assign(settings, EnvAttackRelease_defaultSettings);
        Object.assign(settings, userSettings);
        const { amplitude } = settings;
        super(settings);

        this.randomize = (
            maxAmplitude = 1, minAmplitude = 0, totalTime = 1
        ) => {
            let attack = Math.random() / 3;
            let release = totalTime - attack;

            let maxRange = maxAmplitude-minAmplitude;

            let amplitude = (Math.random() * maxRange) + minAmplitude;

            let attackShape = Math.random() * 10 - 5;
            let releaseShape = Math.random() * 10 - 5;

            this.set({
                attack,
                release,
                amplitude,
                attackCurve:"exponential",
                attackShape,
                releaseCurve:"exponential",
                releaseShape,
            });
        }

        const output = this.outputs.main = new io_Output(this);
        
        this.recalculate = async(recursion = 0) => {
            
            let envLength = settings.attack + settings.release;
            let envLengthSpls = Math.floor(sampleRate * envLength);
            let attackSpls = Math.floor(sampleRate * settings.attack);
            let releaseSpls = Math.floor(sampleRate * settings.release);
            let shapeFunction = shapes.exponential;

            output.cachedValues = new Float32Array(envLengthSpls);

            delete settings.attackCurve;
            delete settings.releaseCurve;
            
            //attack phase
            for(let sampleNumber = 0; sampleNumber < attackSpls; sampleNumber++){
                let position = sampleNumber / attackSpls;
                output.cachedValues[sampleNumber] = shapeFunction(position, settings.attackShape) * settings.amplitude;
            }
            //release phase
            for(let stageSampleNumber = 0; stageSampleNumber < releaseSpls; stageSampleNumber++){
                let position = 1 - stageSampleNumber / releaseSpls;
                let sampleNumber = stageSampleNumber + attackSpls;
                output.cachedValues[sampleNumber] = shapeFunction(position, settings.releaseShape) * settings.amplitude;
            }
        };
    }
}

/* harmony default export */ const EnvAttackRelease = (EnvelopeAttackRelease);
;// CONCATENATED MODULE: ./src/SoundModules/Chebyshev.js




/**
 * @namespace SoundModules.Chebyshev
 */

/** 
 * @typedef {Object} ChebyshevSettings
 * @property {number} [amplitude]
 * @property {number} [bias]
 * @property {number} [length]
 * @property {0|1|2|3|4} [order]
 */

/** @type {ChebyshevSettings} */
const Chebyshev_defaultSettings={
    amplitude:1,
    bias:0,
    length:1,
    order:3,
};
//TODO: only third order is producing anything useful
/**
 * @class Chebyshev 
 * @extends Module
 */
class Chebyshev extends common_Module{
    /**
     * @param {ChebyshevSettings} userSettings
     */
    constructor(userSettings = {}) {
        //apply default settings for all the settings user did not provide
        const settings = {};
        Object.assign(settings, Chebyshev_defaultSettings);
        Object.assign(settings, userSettings);
        
        //todo: lookup table
        //todo: auto nth order
        const orders=[
            (x)=>1,                                 //0
            (x)=>x,                                 //1
            (x)=>2 * Math.pow(x,2) - 1,             //2
            (x)=>4 * Math.pow(x,3) - 3 * x,         //3
            (x)=>8 * Math.pow(x,4) - 8 * x * x + 1, //4
        ];

        super(settings);

        this.inputs.main = new io_Input(this);
        
        const output = this.outputs.main = new io_Output(this);

        this.setOrder = (to) => {
            return this.set({
                order: to
            });
        };

        this.recalculate = async (recursion = 0) => {
            const inputValues = await this.inputs.main.getValues(recursion);
            output.cachedValues = inputValues.map(orders[settings.order]);
        };
    }
}

/* harmony default export */ const SoundModules_Chebyshev = (Chebyshev);
;// CONCATENATED MODULE: ./src/SoundModules/SigmoidDistortion.js





/**
 * @namespace SoundModules.SigmoidDistortion
 */

/** 
 * @typedef {Object} SigmoidDistortionSettings
 * @property {number} [preamp]
 * @property {number} [amplitude]
 * @property {number} [curve]
 */

/** @type {SigmoidDistortionSettings} */
const SigmoidDistortion_defaultSettings={
    amplitude:1,
    preamp:1,
    curve:1,
};
//TODO: only third order is producing anything useful
/**
 * @class SigmoidDistortion 
 * @extends Module
 */
class SigmoidDistortion extends common_Module{
    /**
     * @param {SigmoidDistortionSettings} userSettings
     */
    constructor(userSettings = {}) {
        //apply default settings for all the settings user did not provide
        const settings = {};
        Object.assign(settings, SigmoidDistortion_defaultSettings);
        Object.assign(settings, userSettings);
        
        super(settings);

        this.inputs.main = new io_Input(this);
        this.inputs.curve = new io_Input(this);

        const output = this.outputs.main = new io_Output(this);
        
        this.setPreamp = (to) => {
            return this.set({preamp:to});
        };
        this.setCurve = (to) => {
            return this.set({curve:to});
        };

        const sigmoid = (v,s) => 2/(1+Math.pow(Math.pow(s,2),v)) - 1;       

        this.recalculate = async(recursion = 0) => {
            const {
                amplitude, preamp, curve,
            } = settings;

            const inputValues = await this.inputs.main.getValues(recursion);
            const curveValues = await this.inputs.curve.getValues(recursion);
            
            let currentCurve = 0;

            output.cachedValues = inputValues.map((val,sampleNumber)=>{
                if(curveValues[sampleNumber] !== undefined) currentCurve = curveValues[sampleNumber];

                currentCurve += curve;

                const result = (
                    (sigmoid(
                        val * preamp, currentCurve
                    ) )
                ) * amplitude;
                return result * amplitude;
            });
        };
    }
}

/* harmony default export */ const SoundModules_SigmoidDistortion = (SigmoidDistortion);
;// CONCATENATED MODULE: ./src/SoundModules/WaveFolder.js





/**
 * @namespace SoundModules.WaveFolder
 */

/** 
 * @typedef {Object} WaveFolderSettings
 * @property {number} [bias]
 * @property {number} [amplitude]
 * @property {number} [fold]
 */

/** @type {WaveFolderSettings} */
const WaveFolder_defaultSettings={
    amplitude:1,
    bias:0,
    fold:1,
};
//TODO: only third order is producing anything useful
/**
 * @class WaveFolder 
 * @extends Module
 */
class WaveFolder extends common_Module{
    /**
     * @param {WaveFolderSettings} userSettings
     */
    constructor(userSettings = {}) {
        //apply default settings for all the settings user did not provide
        const settings = {};
        Object.assign(settings, WaveFolder_defaultSettings);
        Object.assign(settings, userSettings);
        
        super(settings);

        this.inputs.main = new io_Input(this);
        this.inputs.fold = new io_Input(this);

        const output = this.outputs.main = new io_Output(this);
        
        this.setPreamp = (to) => {
            return this.set({amplitude:to});
        };
        this.setBias = (to) => {
            return this.set({bias:to});
        };
        this.setCeiling = (to) => {
            return this.set({fold:to});
        };

        const actualModulo = (a,m) => ((a%m)+m)%m;       


        this.recalculate = async(recursion = 0) => {
            const {
                amplitude, bias, fold,
            } = settings;
            

            const inputValues = await this.inputs.main.getValues(recursion);
            const foldValues = await this.inputs.fold.getValues(recursion);
            
            let currentFoldEnvelope = 0;

            output.cachedValues = inputValues.map((val,sampleNumber)=>{
                if(foldValues[sampleNumber] !== undefined) currentFoldEnvelope = foldValues[sampleNumber];
                
                const currentFold = fold + currentFoldEnvelope;
                const halffold = currentFold/2;

                const result = (
                    actualModulo(
                        ( val + currentFold + bias),
                        currentFold
                    ) - halffold
                ) / currentFold;
                return result * amplitude;
            });
        };
    }
}

/* harmony default export */ const SoundModules_WaveFolder = (WaveFolder);
// EXTERNAL MODULE: ./src/utils/requireParameter.js
var requireParameter = __webpack_require__(461);
var requireParameter_default = /*#__PURE__*/__webpack_require__.n(requireParameter);
;// CONCATENATED MODULE: ./src/SoundModules/RustComb.js







/**
 * @namespace SoundModules.RustComb
 */

/** 
 * @typedef {Object} RustCombSettings
 * @property {number} [frequency]
 * @property {number} [dampening_inverse]
 * @property {number} [dampening]
 * @property {number} [feedback]
 */

/** @type {RustCombSettings} */
const RustComb_defaultSettings={
    frequency:5,
    dampening_inverse:0.5,
    dampening:0.5,
    feedback:0.9,
};

/**
 * @class RustComb an example that utilizes Rust to process the audio
 * @extends Module
 */
class RustComb extends common_Module{
    /**
     * @param {RustCombSettings} userSettings
     */
    constructor(userSettings) {
        const rustProcessor = rust_RustProcessor.get();
        //apply default settings for all the settings user did not provide
        const settings = {};
        Object.assign(settings, RustComb_defaultSettings);
        Object.assign(settings, userSettings);
        
        super(settings);

        this.inputs.main = new io_Input(this);

        const output = this.outputs.main = new io_Output(this);
        
        this.setFrequency = (to) => {
            return this.set({frequency:to});
        };
        this.setInverseDampening = (to) => {
            return this.set({dampening_inverse:to});
        };
        this.setDampening = (to) => {
            return this.set({dampening:to});
        };
        this.setFeedback = (to) => {
            return this.set({feedback:to});
        };
   

        this.recalculate = async (recursion = 0) => {
            await rustProcessor.wait(); 

            let {
                frequency,
                dampening_inverse,
                dampening,
                feedback,
            } = settings;

            const inputValues = await this.inputs.main.getValues(recursion);

            if (frequency == 0) frequency = 0.1/sampleRate;

            output.cachedValues = new Float32Array(
                rustProcessor.arrCombFilter(
                    inputValues,frequency,dampening_inverse,dampening,feedback
                )
            );
            //return output.cachedValues;
        };
    }
}

/* harmony default export */ const SoundModules_RustComb = (RustComb);
;// CONCATENATED MODULE: ./src/SoundModules/RustFreeverb.js






/**
 * @namespace SoundModules.RustFreeverb
 */

/** 
 * @typedef {Object} RustFreeverbSettings
 * @property {number} [feedback]
 * 
 * @property {number} [dampening]
 * @property {boolean} [freeze]
 * @property {number} [wet]
 * @property {number} [width]
 * @property {number} [dry]
 * @property {number} [roomSize]
 * @property {number} [LROffset]
 */

/** @type {RustFreeverbSettings} */
const RustFreeverb_defaultSettings={
    dampening:1,
    freeze:false,
    wet:1,
    width:1,
    dry:1,
    roomSize:1,
    LROffset:1,
};
/**
 * @class RustFreeverb an example that utilizes Rust to process the audio
 * @extends Module
 */
class RustFreeverb extends common_Module{
    /**
     * @param {RustFreeverbSettings} userSettings
     */
    constructor(userSettings) {
        //apply default settings for all the settings user did not provide
        const settings = {};
        Object.assign(settings, RustFreeverb_defaultSettings);
        Object.assign(settings, userSettings);
        
        super(settings);

        /** @type {Worker|false} */
        let worker = false;

        this.inputs.main = new io_Input(this);

        const output = this.outputs.main = new io_Output(this);
        
        this.setFrequency = (to) => {
            return this.set({frequency:to});
        };
        this.setInverseDampening = (to) => {
            return this.set({dampening_inverse:to});
        };
        this.setDampening = (to) => {
            return this.set({dampening:to});
        };
        this.setFeedback = (to) => {
            return this.set({feedback:to});
        };

        const actualModulo = (a,m) => ((a%m)+m)%m;       

        this.recalculate = async(recursion = 0) => {
            console.log("rust freverb start recalculation");
            
            const inputValues = await this.inputs.main.getValues(recursion);
            console.log("rust freverb values received");
            
            return await new Promise((resolve,reject)=>{
                if(worker) {
                    worker.terminate();
                    worker=false;
                }
                
                worker = new Worker(new URL(/* worker import */ __webpack_require__.p + __webpack_require__.u(329), __webpack_require__.b));

                worker.onmessage = ({ data }) => {

                    if(data.audioArray){

                        console.log("rust freeverb audio",data);
                        output.cachedValues=data.audioArray;
                        resolve(data.audioArray);
                        worker=false;
                    }
                    if(data.log){
                        console.log("rust worker log",data.log);
                    }
                };

                worker.postMessage({
                    settings:Object.assign({},settings),
                    sampleRate: sampleRate,
                    inputValues,
                });
            });

        };
    }
}

/* harmony default export */ const SoundModules_RustFreeverb = (RustFreeverb);
;// CONCATENATED MODULE: ./src/SoundModules/Filter.js














//todo: find more interesting filters. Eg. https://www.musicdsp.org/en/latest/Filters/index.html
/**
 * @namespace SoundModules.Filter
 */
/** @typedef {"none"
 *      |"LpBoxcar"
 *      |"HpBoxcar"
 *      |"LpMoog"
 *      |"Pinking"
 * } filterType */

/** 
 * @typedef {Object} FilterSettings
 * @property {number} [frequency]
 * @property {number} [gain]
 * @property {number} [reso]
 * @property {filterType} [type]
 * @property {0|1|2|3|4} [order]
 * @property {boolean} [saturate]
 */

/**
 * @typedef {Object} CommonFilterProperties
 * @property {number} frequency
 * @property {number} reso 
 * @property {number} gain 
 * @property {number} order 
*/


const Filter_filterProtos={
    none:operators_Operator,
    LpMoog: operators_LpMoog,
    LpBoxcar: operators_LpBoxcar,
    LpNBoxcar: operators_LpNBoxcar,
    HpBoxcar: operators_HpBoxcar,
    HpNBoxcar: operators_HpNBoxcar,
    Comb: operators_Comb,
    Pinking: operators_Pinking
}




/** @type {FilterSettings} */
const Filter_defaultSettings={
    gain:1,
    reso:0.2,
    type:"LpMoog",
    order:1,
    frequency:100,
    saturate:false,
};


/**
 * @class Filter 
 * @extends Module
 */
class Filter extends common_Module{
    /**
     * @param {FilterSettings} userSettings
     */
    constructor(userSettings = {}) {

        //apply default settings for all the settings user did not provide
        const settings = {};
        Object.assign(settings, Filter_defaultSettings);
        Object.assign(settings, userSettings);
        
        super(settings);

        this.inputs.main = new io_Input(this);
        this.inputs.frequency = new io_Input(this);
        this.inputs.gain = new io_Input(this);
        this.inputs.reso = new io_Input(this);

        const output = this.outputs.main = new io_Output(this);
        
        this.setOrder = (to) => {
            return this.set({
                order: to
            });
        };
        this.setFrequency = (to) => {
            return this.set({
                frequency: to
            });
        };
        /** @param {filterType} to */
        this.setType = (to) => {
            if(!Filter_filterProtos[to]){
                return Object.keys(Filter_filterProtos);
            }

            return this.set({
                type: to
            });
        };

        this.recalculate = async (recursion = 0) => {
            
            //create an interface for the filter
            let filter = new Filter_filterProtos[settings.type]();
            const order = settings.order;
            const frequencies = await this.inputs.frequency.getValues(recursion);
            const gains = await this.inputs.gain.getValues(recursion);
            const resos = await this.inputs.reso.getValues(recursion);
            const inputValues=await this.inputs.main.getValues(recursion);
            
            output.cachedValues = new Float32Array(inputValues.length);

            filter.reset();

            output.cachedValues = inputValues.map((inputValue,sampleNumber)=>filter.calculateSample(
                inputValue,
                valueOrZero(frequencies[sampleNumber]) + settings.frequency,
                valueOrZero(resos[sampleNumber]) + settings.reso,
                valueOrZero(gains[sampleNumber]) + settings.gain,
                order,settings.saturate
            ));
        };
    }
}

/* harmony default export */ const SoundModules_Filter = (Filter);
;// CONCATENATED MODULE: ./src/SoundModules/MixerTesselator.js






/**
 * @namespace SoundModules.MixerTesselator
 */

const MixerTesselator_defaultSettings={
    amplitude:1,
    window:true,
    normalize:false,
    levela:0.5,
    levelb:0.5,
    levelc:0.5,
    leveld:0.5,
};
/**
 * mixes channels and also tesselates them using sine shaped window.
 * this removes clicks upon loop
 * @class MixerTesselator
 * @extends Module
 */
class MixerTesselator extends common_Module{
    constructor(userSettings = {}) {
        //apply default settings for all the settings user did not provide
        const settings = {};
        Object.assign(settings, MixerTesselator_defaultSettings);
        Object.assign(settings, userSettings);

        const { amplitude } = settings;
        
        super(settings);

        this.inputs.a = new io_Input(this);
        this.inputs.b = new io_Input(this);
        this.inputs.c = new io_Input(this);
        this.inputs.d = new io_Input(this);

        const output = this.outputs.main = new io_Output(this);

        this.recalculate = async (recursion = 0) => {
            let result=[];
            await Promise.all(
                this.eachInput(async (input,inputno,inputName) => {
                    const inputValues = await input.getValues(recursion);
                    inputValues.forEach((val, index) => {
                        if(!result[index]) result[index]=0;
                        result[index] += (val) * amplitude * settings["level"+inputName];
                    });
                })
            );
                
            let lengthSamples=result.length;
            let half = Math.floor(lengthSamples/2);
            let max=0;
            let min=0;
            output.cachedValues = new Float32Array(result.map((v,i)=>{
                let awindow,window;
                if(settings.window){
                    awindow = Math.cos(2 * Math.PI * i/lengthSamples) / 2 + 0.5;
                    window = 1 - awindow;
                }else{
                    awindow = 0.5;
                    window=0.5;
                }


                if(v>max) max = v;
                if(v<min) min = v;

                if(i>half){
                    return v * window + result[i - half] * awindow
                }else if(i<half){
                    return v * window + result[i + half] * awindow
                }else{
                    return v;
                }
            }));


            if(settings.normalize && max!==0 && min!==0){
                let mult = 1/Math.min(Math.abs(min),max);

                output.cachedValues = output.cachedValues.map((n)=>{
                    return n * mult;
                });
            }
            
        };
    }
}

/* harmony default export */ const SoundModules_MixerTesselator = (MixerTesselator);
;// CONCATENATED MODULE: ./src/SoundModules/Repeater.js






/**
 * @namespace SoundModules.Repeater
 */

/**
 * @typedef {Array<number>} EnvelopePoint a tuple containing two numbers: first is sample number (integers only), and the second is level (float)
 */

/** 
 * @typedef {Object} RepeaterOptions
 * @property {number} [length]
 * @property {Array<EnvelopePoint>} [points]
 * @property {boolean} [monophonic]
 * @property {number} [gain]
 */

/** @type {RepeaterOptions} */
const Repeater_defaultSettings = {
    length: 1,
    points: [],
    monophonic:false,
    gain:1,
};

/**
 * @class Repeater 
 * @extends Module
 */
class Repeater extends common_Module {
    /**
     * @param {RepeaterOptions} userSettings
     */
    constructor(userSettings = {}) {
        //apply default settings for all the settings user did not provide
        const settings = {};
        Object.assign(settings, Repeater_defaultSettings);
        Object.assign(settings, userSettings);
        
        super(settings);
        
        this.inputs.main = new io_Input(this);

        const output = this.outputs.main = new io_Output(this);
        
        this.setLength = (to) => {
            return this.set({
                length: to
            });
        }
        this.setPoints = (pointsList) => {
            return this.set({
                points: settings.points
            });
        };
        this.addPoint = (point=[0,0]) => {
            return this.set({
                points: settings.points.concat([point])
            });
        }

        const sortPointsByTime = () => {
            settings.points.sort((a, b) => a[0] - b[0]);
            this.changed({ points: settings.points });
        }

        this.recalculate = async (recursion = 0) => {

            const lengthSamples = settings.length * sampleRate;
            output.cachedValues = new Float32Array(lengthSamples);
            
            sortPointsByTime();

            let inputSamples = await this.inputs.main.getValues(recursion);
            let currentPoint=false;

            for (let splN = 0; splN < lengthSamples; splN++) {
                settings.points.forEach((runningPoint)=>{
                    let localSample = splN - runningPoint[0];
                    if(localSample>-1 && localSample < inputSamples.length){
                        if(settings.monophonic){ 
                            currentPoint=runningPoint;
                            localSample = splN - currentPoint[0];
                            output.cachedValues[splN] = inputSamples[localSample] * currentPoint[1];
                        
                        }else{
                            output.cachedValues[splN] += inputSamples[localSample] * runningPoint[1];
                        }
                    }
                });
                output.cachedValues[splN] *= settings.gain;
            }
        };
    }
}

/* harmony default export */ const SoundModules_Repeater = (Repeater);
;// CONCATENATED MODULE: ./src/SoundModules/Hipparchus.js






/**
 * @namespace SoundModules.Hipparchus
 */

/**
 * @typedef {Array<number>} EnvelopePoint a tuple containing two numbers: first is sample number (integers only), and the second is level (float)
 */

/** 
 * @typedef {Object} HipparchusOptions
 * @property {number} [gain]
 * @property {number} [rotation] rotation in ratio, zero equals 0 degrees and 1 equals 180 degrees
 * @property {number} [rightOffset] how much more rotation to give to the right channel
 */

/** @type {HipparchusOptions} */
const Hipparchus_defaultSettings = {
    rotation: 0,
    rightOffset: 0.5,
    gain:1,
};

//from Vectoidal

/**
 * convert x,y into th,r polar coords around 0,0
 * @param {{x:number,y:number}} cartesian
 * @param {number?} dcOffset
 * @returns {{th:number,r:number}} polar
 */
const cartesianToPolar=({x,y},dcOffset=0)=>{
    return{
        r:Math.sqrt(x*x+y*y)-dcOffset,
        th:Math.atan2(y,x)
    }
};
const polarToCartesian=({th,r},dcOffset=0)=>{
    return {
        x:Math.cos(th)*(r+dcOffset),
        y:Math.sin(th)*(r+dcOffset)
    }
}
/**
 * convert th,r into x,y coords around 0,0. 
 * X is not calculated and set to 0
 * @param {{th:number,r:number}} polar
 * @param {number?} dcOffset
 * @returns {{x:0,y:number}} 
 */
const polarToCartesianAndSquashX=({th,r},dcOffset=0)=>{
    return {
        x:0,
        y:Math.sin(th)*(r+dcOffset)
    }
}

const Hipparchus_voz=(val)=>val?val:0;

/**
 * @class Hipparchus 
 * @extends Module
 */
class Hipparchus extends common_Module {
    /**
     * @param {HipparchusOptions} userSettings
     */
    constructor(userSettings = {}) {
        //apply default settings for all the settings user did not provide
        const settings = {};
        Object.assign(settings, Hipparchus_defaultSettings);
        Object.assign(settings, userSettings);
        
        super(settings);
        
        this.inputs.x = new io_Input(this);
        this.inputs.y = new io_Input(this);
        this.inputs.rotation = new io_Input(this);

        const left = this.outputs.l = new io_Output(this);
        const right = this.outputs.r = new io_Output(this);

        this.setAngle = (to) => {
            return this.set({
                rotation: to
            });
        }
        this.setGain = (to) => {
            return this.set({
                gain: to
            });
        }


        this.recalculate = async (recursion = 0) => {

            let gain = settings.gain;
            let xIn = await this.inputs.x.getValues(recursion);
            let yIn = await this.inputs.y.getValues(recursion);
            let rotationIn = await this.inputs.rotation.getValues(recursion);

            left.cachedValues = new Float32Array(xIn.length);
            right.cachedValues = new Float32Array(xIn.length);

            xIn.forEach((x,sampleNumber)=>{
                let y = Hipparchus_voz(yIn[sampleNumber]);
                let rotationSample = Hipparchus_voz(rotationIn[sampleNumber]);

                let polarRotationLeft = (
                        rotationSample + settings.rotation
                    )  * Math.PI;
                
                let polarRotationRight = (
                        rotationSample + settings.rotation + settings.rightOffset
                    )  * Math.PI;
                    
                const polarLeft = cartesianToPolar({x,y},0);
                polarLeft.th += polarRotationLeft;
                const resultLeft = polarToCartesianAndSquashX(polarLeft).y;

                const polarRight = cartesianToPolar({x,y},0);
                polarRight.th += polarRotationRight;
                const resultRight = polarToCartesianAndSquashX(polarRight).y;

                left.cachedValues[sampleNumber] = resultLeft * gain;
                right.cachedValues[sampleNumber] = resultRight * gain;

            });
            //return output.cachedValues;
        };
    }
}

/* harmony default export */ const SoundModules_Hipparchus = (Hipparchus);
;// CONCATENATED MODULE: ./src/SoundModules/Sampler.js




/**
 * @namespace SoundModules.Sampler
 */

const Sampler_defaultSettings={
    amplitude:1,
    length:1,
    originalFrequency:1,
    frequency:1,
    startOffset:0,
    sample:new Float32Array(),
};

/** 
 * @typedef {Object} SamplerOptions
 * @property {number} [amplitude]
 * @property {number} [length]
 * @property {number} [originalFrequency]
 * @property {number} [frequency]
 * @property {number} [startOffset]
 * @property {Float32Array} [sample]
 */
/**
 * @class Sampler 
 * @extends Module
 */
class Sampler extends common_Module{
    /**
     * @param {SamplerOptions} userSettings
     */
    constructor(userSettings = {}) {
        //apply default settings for all the settings user did not provide
        const settings = {};
        Object.assign(settings, Sampler_defaultSettings);
        Object.assign(settings, userSettings);
        let first = true;
        super(settings);

        this.inputs.frequency = new io_Input(this);
        this.inputs.amplitude = new io_Input(this);


        /** @param {number} to */
        this.setOriginalFrequency = (to) => {
            return this.set({
                originalFrequency:to,
            });
        };

        /** @param {number} to */
        this.setFrequency = (to) => {
            return this.set({
                frequency: to,
            });
        };

        /** @param {number} to */
        this.setAmplitude = (to) => {
            return this.set({
                amplitude: to
            });
        };
        
        /** @param {Float32Array} to */
        this.setSample = (to) => {
            return this.set({
                sample: to,
            });
        };

        function calculateLength (frequency,originalFrequency,lengthSamples){
            return  (originalFrequency/frequency)
            * lengthSamples / sampleRate
        }
        this.onUpdate((changes)=>{
            if(changes.originalFrequency){
                // this.set({
                //     length:calculateLength(
                //         settings.frequency,
                //         changes.originalFrequency,
                //         settings.sample.length
                //     )
                // })
            }else if(changes.frequency!==undefined){
                // this.set({
                //     length:calculateLength(
                //         changes.frequency,
                //         settings.originalFrequency,
                //         settings.sample.length
                //     )
                // })
            }else if(changes.sample!==undefined){
                this.set({
                    length:calculateLength(
                        settings.frequency,
                        settings.originalFrequency,
                        changes.sample.length
                    )
                })
            }
        });

        const getSample = (floatIndex)=>{
            let integerPart = Math.floor(floatIndex);
            let floatPart = floatIndex - integerPart;
            let inverseFloatPart = 1-floatPart;
            let nextSample = valueOrZero(this.settings.sample[integerPart+1]);
            let nowSample = valueOrZero(this.settings.sample[integerPart]);
            return nowSample * inverseFloatPart + nextSample * floatPart;
        }


        this.recalculate = async (recursion = 0) => {
            const lengthSamples = Math.floor(settings.length * sampleRate);

            const [
                freqInputValues,
                ampInputValues,
            ] = await Promise.all([
                this.inputs.frequency.getValues(recursion),
                this.inputs.amplitude.getValues(recursion),
            ]);
            
            let lastFrequencyValue = 0;
            let lastAmpValue = 0;

            let samplePositionAccumulator = settings.startOffset * sampleRate;
            
            this.cachedValues=new Float32Array(Math.max(0,lengthSamples));

            for (let a = 0; a < lengthSamples; a++) {
                const freq = (freqInputValues[a] || lastFrequencyValue) + settings.frequency;
                const amp = (ampInputValues[a] || lastAmpValue) + settings.amplitude;

                samplePositionAccumulator +=  freq / settings.originalFrequency;

                this.cachedValues[a] = getSample(samplePositionAccumulator) * amp;
            }
        };
    }
}

/* harmony default export */ const SoundModules_Sampler = (Sampler);
;// CONCATENATED MODULE: ./src/SoundModules/HarmonicsOscillator2.js







/**
 * @namespace SoundModules.HarmonicsOscillator2
 */

/** 
 * @typedef {Object} HarmonicsOscillator2Options
 * @property {number} [amplitude]
 * @property {number} [frequency]
 * @property {number} [harmonics]
 * @property {number} [falloff]
 * @property {number} [length]
 * @property {number} [distance]
 * @property {number} [phase]
 * @property {"sin"|"cos"|"ramp"|"noise"|"offset"} [shape]
 */

/**
 * @class HarmonicsOscillator2 
 * @extends Module
 */
class HarmonicsOscillator2 extends common_Module{
    /**
     * @param {HarmonicsOscillator2Options} userSettings
     */
    constructor(userSettings = {}) {
        //apply default settings for all the settings user did not provide
        const settings = {
            amplitude:1,
            frequency:110,
            harmonics:5,
            falloff:1,
            length:1,
            distance:1,
            phase:0,
            shape:"sin",
        };
        Object.assign(settings, userSettings);
        let first = true;
        super(settings);

        /** @type {Array<OscillatorOperator>} */
        const operators = [];
        const falloffFunction = HarmonicsOscillator2.falloffFunction;

        this.inputs.frequency = new io_Input(this);
        this.inputs.distance = new io_Input(this);
        this.inputs.amplitude = new io_Input(this);

        const output = this.outputs.main = new io_Output(this);

        
        
        this.setFrequency = (to) => {
            return this.set({
                frequency: to
            });
        };

        this.setAmplitude = (to) => {
            return this.set({
                amplitude: to
            });
        };
        
        this.setShape = (to) => {
            try{
                //this one is just to get the error right away.
                //the shape is actually set in the recalculate to ensure
                //sync
                operators.map(o=>o.setShape(to));
                this.set({
                    shape: to
                });
                this.cacheObsolete();
            }catch(e){
                throw e;
            }
            return this;
        };
        
        this.setPhase = (to) => {
            return this.set({
                phase: to
            });
        };

        this.getHarmonicFrequencyMultiplier = (n,distance)=>{
            const {harmonics} = settings;
            return Math.pow(2,Math.round(n - harmonics / 2) * distance);
        }
        

        this.recalculate = async (recursion = 0) => {
            
            const lengthSamples = settings.length * sampleRate;
            output.cachedValues = new Float32Array(lengthSamples);
            while(operators.length < settings.harmonics){
                operators.push(new operators_OscillatorOperator({sampleRate: sampleRate}));
            }

            operators.map((operator)=>{
                operator.setShape(settings.shape);
                operator.setPhase(settings.phase);
            });
            
            const [
                freqInputValues,
                distanceInputValues,
                ampInputValues,
            ] = await Promise.all([
                this.inputs.frequency.getValues(recursion),
                this.inputs.distance.getValues(recursion),
                this.inputs.amplitude.getValues(recursion),
            ]);
            
            for (let a = 0; a < lengthSamples; a++) {
                const freq = (freqInputValues[a] || 0) + settings.frequency;
                const distance = (distanceInputValues[a] || 0) + settings.distance;
                const amp = (ampInputValues[a] || 0) + settings.amplitude;
                const ampDividedHarmonics = amp/settings.harmonics;

                operators.map((operator,index)=>{
                    const fMult = this.getHarmonicFrequencyMultiplier(index,distance);
                    const falloff = falloffFunction(index / operators.length,settings.falloff);
                    output.cachedValues[a] += operator.calculateSample(
                        freq * fMult,
                        ampDividedHarmonics * falloff, 0
                    );
                });
            }
        };
    }
}

const twoPi = 2 * Math.PI;
/**
 * @param {number} index
 * number from 0 to 1 representing distance from the harmonic with highest volume
 */
HarmonicsOscillator2.falloffFunction = (index,ff) => {
    return (2 - Math.cos(ff * index * twoPi))/2;
}

/* harmony default export */ const SoundModules_HarmonicsOscillator2 = (HarmonicsOscillator2);
;// CONCATENATED MODULE: ./src/SoundModules/VoltsPerOctaveToHertz.js





/**
 * @namespace SoundModules.VoltsPerOctaveToHertz
 */

/** 
 * @typedef {Object} VoltsPerOctaveToHertzSettings
 * @property {number} [center]
 * @property {number} [preamp]
 */

/** @type {VoltsPerOctaveToHertzSettings} */
const VoltsPerOctaveToHertz_defaultSettings={
    preamp:1,
    center:80,
};
//TODO: only third order is producing anything useful
/**
 * @class VoltsPerOctaveToHertz 
 * @extends Module
 */
class VoltsPerOctaveToHertz extends common_Module{
    /**
     * @param {VoltsPerOctaveToHertzSettings} userSettings
     */
    constructor(userSettings = {}) {
        //apply default settings for all the settings user did not provide
        const settings = {};
        Object.assign(settings, VoltsPerOctaveToHertz_defaultSettings);
        Object.assign(settings, userSettings);
        
        super(settings);

        this.inputs.main = new io_Input(this);

        const output = this.outputs.main = new io_Output(this);
        
        this.setPreamp = (to) => {
            return this.set({preamp:to});
        };
        this.setCenter = (to) => {
            return this.set({center:to});
        };

        const voltsPerOctaveToHertz = (v,center) => center * Math.pow(2,v);       

        this.recalculate = async(recursion = 0) => {
            const {
                preamp, center
            } = settings;
            
            //note: can be optimized parallelizing these, but it only
            //takes effect if is worker
            const inputValues = await this.inputs.main.getValues(recursion);

            output.cachedValues = inputValues.map((val)=>{
                const result = voltsPerOctaveToHertz(
                        ( val * preamp),
                        center
                    );
                return result;
            });
        };
    }
}

/* harmony default export */ const SoundModules_VoltsPerOctaveToHertz = (VoltsPerOctaveToHertz);
;// CONCATENATED MODULE: ./src/DomInterfaces/components/WaveDisplay.js




class WaveDisplay extends SVGElements.Path{
    /** @param {ValuePixelTranslator} translator */
    constructor(translator) {

        const settings=translator.settings;

        super({
            d: `M ${0},${settings.height / 2}
            L ${0},${settings.height / 2} ${settings.width},${settings.height / 2}`,
            fill: "transparent",
            stroke: "black"
        });
        

        const superSet = this.set;
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

                superSet({'d':str});
            }
        };
    }
}
/* harmony default export */ const components_WaveDisplay = (WaveDisplay);

;// CONCATENATED MODULE: ./src/utils/round.js
const round_round=(num,precision=2)=>{
    let ratio = 10*precision;
    return Math.round(num*ratio)/ratio;
}
/* harmony default export */ const src_utils_round = (round_round);
;// CONCATENATED MODULE: ./src/DomInterfaces/components/VerticalZoom.js






const zoomSettings={
    width:10,
    zoomHeight:10,
    range:1200,
}

class VerticalZoom extends SVGElements.SVGGroup{
    /** @param {ValuePixelTranslator} translator */
    constructor(translator) {
        const settings=translator.settings;
        
        super();

        const yToRange=(y)=>{
            const r = zoomSettings.range;
            const h = settings.height;
            return (Math.pow(2, Math.pow(y / h,12)) - 1) * r;
        }

        const rangeToY=(zoom)=>{
            const z = zoom;
            const r = zoomSettings.range;
            const h = settings.height;
            return h * Math.pow(Math.log((z/r)+1)/Math.LN2,1/12);
        }

        // console.log(` ${33.44} ==? ${yToRange(rangeToY(33.44))}`);
        // console.log(` ${33.44} ==? ${yToRange(rangeToY(33.44))}`);

        // console.log(` ${24.421} ==? ${yToRange(rangeToY(24.421))}`);
        // console.log(` ${24.421} ==? ${yToRange(rangeToY(24.421))}`);

        const readoutText =  new SVGElements.Text({
            class:"zoom-level",
            x:settings.width + 5,
            text:"---",
        });
        this.add(readoutText);

        const handleRect = new SVGElements.Rectangle({
            width: zoomSettings.width,
            height: zoomSettings.zoomHeight,
            x: settings.width-zoomSettings.width,
            y: settings.height,
        });
        this.add(handleRect);
        



        const draggable = new Interactive_Draggable(handleRect.domElement);
        draggable.setPosition(new Vector2.default({
            x: handleRect.attributes.x,
            y: handleRect.attributes.y,
        }));

        draggable.dragStartCallback = (mouse) => {};
        draggable.dragEndCallback = (mouse) => {};
        
        draggable.positionChanged = (newPosition) => {
            // settings.rangeAmplitude = yToRange(newPosition.y);
            translator.change({
                rangeAmplitude:yToRange(newPosition.y)
            });

            handleRect.set({"y":newPosition.y});

            Object.assign(readoutText.attributes,{
                y:handleRect.attributes.y + 5,
                text:src_utils_round(settings.rangeAmplitude,2),
            });

            readoutText.update();
        };

        //if something else changes zoom, update the scroller
        translator.onChange((changes)=>{
            if(changes.rangeAmplitude){
                const ypos=rangeToY(changes.rangeAmplitude);
                handleRect.set({"y":ypos});
                draggable.setPosition({y:ypos},false)
                Object.assign(readoutText.attributes,{
                    y:ypos + 5,
                    text:src_utils_round(settings.rangeAmplitude,2),
                });

            }
            if(changes.width){
                readoutText.set({"x":settings.width + 5});
                handleRect.set({"x": settings.width-zoomSettings.width});
            }
        });

        const superSet = this.set;

        this.set = (...p) => {
            superSet(...p);
        };
    }
}
/* harmony default export */ const components_VerticalZoom = (VerticalZoom);

;// CONCATENATED MODULE: ./src/DomInterfaces/LaneTypes/WaveLane.js









/**
 * @typedef {Object} WaveLaneOptions
 * @property {Module} module
 * @property {string} [name]
 */
class WaveLane extends components_Lane{
    /**
     * @param {import("../components/Lane").LaneOptions} options
     * @param {ValuePixelTranslator|false} valuePixelTranslator
     */
    constructor(options, valuePixelTranslator = false){
        const {module,drawBoard}=options;
        requireParameter_default()(module,"module");
        requireParameter_default()(drawBoard,"drawBoard");
        const settings=const_typicalLaneSettings(module,drawBoard);

        const translator = valuePixelTranslator?valuePixelTranslator:(new utils_ValuePixelTranslator(settings));

        //defaults
        Object.assign(settings,options);
        super(translator,options);
        
        const outputs = Object.keys(module.outputs).map((opname)=>module.outputs[opname]);        

        const contents=this.contents;
        
        const waveDisplays=outputs.map((output)=>{
            let waveDisplay=new components_WaveDisplay(translator);
            waveDisplay.addClass("wave-display");
            waveDisplay.addClass("no-mouse");
            contents.add(waveDisplay);
            return waveDisplay;
        });
        

        const zoom = new components_VerticalZoom(translator);


        this.autoZoom = () => {
            this.normalizeView();
        }

        zoom.domElement.addEventListener('dblclick',()=>{
            this.normalizeView();
        });
        
        contents.add(zoom);

        new Array().map

        translator.onChange((changes)=>{
            waveDisplays.forEach((waveDisplay,index)=>{
                waveDisplay.set({
                    "wave":outputs[index].cachedValues
                });
            });
        });

        module.onUpdate((changes)=>{
            if(changes.cacheStillValid == true){
                waveDisplays.forEach((waveDisplay,index)=>{
                    waveDisplay.set({
                        "wave":outputs[index].cachedValues
                    });
                });
            }
        });

        // drawBoard.size.onChange(()=>{
            // waveDisplay.set({"width":drawBoard.size.width});
        // });

        /**
         * handy function that sets the ValuePixelTranslator (i.e. zoom/pan) 
         * in such a way that the whole range of the contents are visible and maximized 
         */ 
        this.normalizeView=(centered=true)=>{
            //find level range in the audio
            //non zero initial value prevents infinite zoom
            let maxValue = 0;
            let minValue = 0;

            outputs[0].cachedValues.forEach((v)=>{
                if(v>maxValue) maxValue=v;
                if(v<minValue) minValue=v;
            });

            if(centered){
                maxValue = Math.abs(maxValue);
                minValue = Math.abs(minValue);
                let biggest=maxValue;
                if(minValue>biggest) biggest=minValue;
                maxValue=biggest;
                minValue=-biggest;
            }

            if(maxValue === minValue && minValue === 0){
                translator.coverVerticalRange(-1,1);
            }else{
                translator.coverVerticalRange(minValue,maxValue);
            }
        }

        
        const hoverText=new SVGElements.Text();
        hoverText.attributes.class="hover-text";

        const hoverable=new Interactive_Hoverable(this.domElement);

        hoverable.mouseMoveCallback=(position)=>{
            const sampleNumberHere = translator.xToSampleNumber(
                position.x
            );
            let levelHere = outputs[0].cachedValues[
                sampleNumberHere
            ];
            let yhere=translator.amplitudeToY(levelHere);
            if(isNaN(levelHere)) levelHere=translator.amplitudeToY(0);
            hoverText.attributes.y=yhere;
            //position.x - x;
            hoverText.attributes.x=position.x;// - x;
            hoverText.attributes.text=src_utils_round(levelHere,2)+", "+sampleNumberHere;
            hoverText.update();
        }
        hoverable.mouseEnterCallback=(position)=>{
            hoverText.addClass("active");
        }
        hoverable.mouseLeaveCallback=(position)=>{
            hoverText.removeClass("active");
        }
        contents.add(hoverText);
    }
}
/* harmony default export */ const LaneTypes_WaveLane = (WaveLane);
;// CONCATENATED MODULE: ./src/DomInterfaces/GenericDisplay.js



/**
 * @namespace DomInterface.GenericDisplay
 */
/** 
 * @class GenericDisplay
 * @extends WaveLane
 */
class GenericDisplay extends LaneTypes_WaveLane{

    /** @param {import("./components/Lane").LaneOptions} options */
    constructor(options){
        const {module,drawBoard} = options;
        const settings=const_typicalLaneSettings(module,drawBoard);
        Object.assign(settings,options);
        super(settings);
        

        Object.keys(module.settings).forEach((settingName,settingNumber)=>{
            const settingValue = module.settings[settingName];
            const settingType = typeof settingValue;
            if(settingType === "number"){
                this.addKnob(settingName);
            }else if(settingType === "boolean"){
                this.addToggle(settingName);
            }else if(settingValue.constructor && settingValue.constructor.name === "Float32Array"){
                this.addSoundDecoder(settingName);
            }
        });
        module.triggerInitialState();
    }
};

/* harmony default export */ const DomInterfaces_GenericDisplay = (GenericDisplay);

;// CONCATENATED MODULE: ./src/DomInterfaces/DelayDisplay.js


class DelayDisplay extends LaneTypes_WaveLane{
    constructor(options){
        super(options); 

        const timeKnob = this.addKnob("time");
        const feedbackKnob = this.addKnob("feedback");
        const wetKnob = this.addKnob("wet");
        const dryKnob = this.addKnob("dry");

        // timeKnob.step=1/10000;
        timeKnob.setDeltaCurve("periodseconds");

    }
}
/* harmony default export */ const DomInterfaces_DelayDisplay = (DelayDisplay);
;// CONCATENATED MODULE: ./src/DomInterfaces/DelayWithFilterDisplay.js


class DelayWithFilterDisplay_DelayDisplay extends LaneTypes_WaveLane{
    constructor(options){
        super(options); 

        const timeKnob = this.addKnob("time");
        const feedbackKnob = this.addKnob("feedback");
        const wetKnob = this.addKnob("wet");
        const dryKnob = this.addKnob("dry");
        
        this.addKnob("gain");
        this.addKnob("reso");
        this.addKnob("frequency");
        this.addKnob("order");
        this.addToggle("saturate");

        // timeKnob.step=1/10000;
        timeKnob.setDeltaCurve("periodseconds");

    }
}
/* harmony default export */ const DelayWithFilterDisplay = (DelayWithFilterDisplay_DelayDisplay);
;// CONCATENATED MODULE: ./src/DomInterfaces/ReverbDisplay.js


class ReverbDisplay extends LaneTypes_WaveLane{
    constructor(options){
        super(options); 

        const timeKnob = this.addKnob("time");
        const difussionKnob = this.addKnob("diffusion");
        const feedbackKnob = this.addKnob("feedback");
        const wetKnob = this.addKnob("wet");
        const dryKnob = this.addKnob("dry");

        // timeKnob.step=1/10000;
        timeKnob.setDeltaCurve("periodseconds");
        difussionKnob.setDeltaCurve("periodseconds");

    }
}
/* harmony default export */ const DomInterfaces_ReverbDisplay = (ReverbDisplay);
;// CONCATENATED MODULE: ./src/DomInterfaces/EnvelopeGeneratorDisplay.js







const vectorTypes = __webpack_require__(424);
/** @typedef {vectorTypes.MiniVector} MiniVector
/**
 * @namespace DomInterface.EnvelopeGeneratorDisplay
 */
/** 
 * @class EnvelopeGeneratorDisplay
 * @extends WaveLane
 */
class EnvelopeGeneratorDisplay extends LaneTypes_WaveLane{
    /** @param {import("./components/Lane").LaneOptions} options */
    constructor (options){

        const {module,drawBoard} = options;
        const settings=const_typicalLaneSettings(module,drawBoard);
        //plave for defaults
        settings.name="Envelope";
        Object.assign(settings,options);

        const translator=new utils_ValuePixelTranslator(settings);
        super(settings,translator);




        //lane has a contents sprite.
        const contents=this.contents;

        class Handle extends SVGElements.Circle {
            constructor(settings){
                let circleSettings = {r:10};
                Object.apply(circleSettings,settings);
                super(circleSettings);
                this.point=[0,0];
                const draggable = this.draggable = new Interactive_Draggable(this.domElement);
                
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
            handle.activate();
        });

        //helps moving points according to zoom level
        translator.onChange(()=>{
            updatePointsPositions(module.settings.points);
        });
        
        //let us represent changes in the module graphically
        module.onUpdate((changes)=>{
            if(changes.points){
                updatePointsPositions(changes.points);
            }
        });

        module.triggerInitialState();
    }
};

/* harmony default export */ const DomInterfaces_EnvelopeGeneratorDisplay = (EnvelopeGeneratorDisplay);

;// CONCATENATED MODULE: ./src/DomInterfaces/EnvAttackReleaseDisplay.js






const EnvAttackReleaseDisplay_vectorTypes = __webpack_require__(424);
/** @typedef {vectorTypes.MiniVector} MiniVector
/**
 * @namespace DomInterface.EnvAttackReleaseDisplay
 */
/** 
 * @class EnvAttackReleaseDisplay
 * @extends WaveLane
 */
class EnvAttackReleaseDisplay extends LaneTypes_WaveLane{
    /** @param {import("./components/Lane").LaneOptions} options */
    constructor (options){

        const {module,drawBoard} = options;
        const settings=const_typicalLaneSettings(module,drawBoard);
        //plave for defaults
        settings.name="Envelope";
        Object.assign(settings,options);

        const translator=new utils_ValuePixelTranslator(settings);
        super(settings,translator);

        this.addKnob("attack").setMinMax(0,1000);
        this.addKnob("release").setMinMax(0,1000);
        this.addKnob("amplitude");
        this.addKnob("attackShape");
        this.addKnob("releaseShape");

        //lane has a contents sprite.
        const contents=this.contents;

        //note that we use seconds in these handles,
        //as opposed to envGenerrator whose points are based on sample number
        class Handle extends SVGElements.Circle {
            constructor(settings){
                let circleSettings = {r:10};
                Object.apply(circleSettings,settings);
                super(circleSettings);
                
                const draggable = this.draggable = new Interactive_Draggable(this.domElement);
                
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
                    
                }
                /**
                 * update the handle's point coordinates and cause
                 * this change to be reflected visually
                 */
                this.handleModelChangedPoint = () => {
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
            new Handle(),
        ];

        handles[0].handleGuiChangedPoint = function(pos){
            module.set({
                attack: translator.xToSeconds(pos.x),
                amplitude: translator.yToAmplitude(pos.y),
            });
            
        }
        handles[1].handleGuiChangedPoint = function(pos){
            module.set({
                release: translator.xToSeconds(pos.x) - module.settings.attack,
            });
        }

        handles[0].handleModelChangedPoint = function(){
            let pos = {
                x:translator.secondsToX(module.settings.attack),
                y:translator.amplitudeToY(module.settings.amplitude),
            }
            this.draggable.setPosition(pos,false);
            this.attributes.cx=pos.x;
            this.attributes.cy=pos.y;
            this.update();
        }

        handles[1].handleModelChangedPoint = function(){
            let pos = {
                x:translator.secondsToX(module.settings.release + module.settings.attack),
                y:translator.amplitudeToY(0),
            }
            this.draggable.setPosition(pos,false);
            this.attributes.cx=pos.x;
            this.attributes.cy=pos.y;
            this.update();
        }
        
        handles.map((handle)=>{
            handle.activate();
        });

        function updatePointsPositions({
            attack,
            release,
            amplitude,
        }){
            if(attack){
                handles[0].handleModelChangedPoint();
                handles[1].handleModelChangedPoint();
            }
            if(amplitude){
                handles[0].handleModelChangedPoint();
            }
            if(release){
                handles[1].handleModelChangedPoint();
            }
        }

        //helps moving points according to zoom level
        translator.onChange((changes)=>{
            updatePointsPositions(module.settings);
            handles.forEach((handle)=>handle.handleModelChangedPoint());
        });
        
        //let us represent changes in the module graphically
        module.onUpdate((changes)=>{
            updatePointsPositions(changes);
        });

        module.triggerInitialState();
    }
};

/* harmony default export */ const DomInterfaces_EnvAttackReleaseDisplay = (EnvAttackReleaseDisplay);

;// CONCATENATED MODULE: ./src/DomInterfaces/ChebyshevDisplay.js


class ChebyshevDisplay extends LaneTypes_WaveLane{
    constructor(options){
        super(options); 
        this.addKnob("amplitude");
        this.addKnob("bias");
        this.addKnob("order").setMinMax(0,4);
    }
}
/* harmony default export */ const DomInterfaces_ChebyshevDisplay = (ChebyshevDisplay);
;// CONCATENATED MODULE: ./src/dom-model-gui/GuiComponents/Button.js






class Button extends SVGElements.SVGGroup {
    constructor(userOptions) {
        const options = {};
        Object.assign(options, {
            x: 0, y: 0,
            width: 20,
            name: "push",
            class: "push",
            min: false, max: false,
        });

        Object.assign(options, userOptions);

        super(options);

        let nameText = new SVGElements.Text({
            x: -options.radius,
            y: options.radius + 5
        });

        this.add(nameText);

        this.value = false;

        let buttonShape = new SVGElements.Rectangle();
        let valueShape = new SVGElements.Rectangle();
        this.add(valueShape);
        this.add(buttonShape);
        valueShape.set({"fill": "none"});
        valueShape.addClass("knob-value-arc");

        const remakeValueShape = () => {
            valueShape.attributes.width = options.width - 6;
            valueShape.attributes.height = options.width - 6;

            valueShape.attributes.x = 3 - options.width/2;
            if (this.value) {
                valueShape.attributes.y = 3 - options.width;
            } else {
                valueShape.attributes.y = 3;
            }

            valueShape.update();
        }

        const remakePath = () => {
            buttonShape.attributes.width = options.width;
            buttonShape.attributes.height = options.width * 2;

            buttonShape.attributes.x = -options.width/2;
            buttonShape.attributes.y = -options.width;

            nameText.attributes["text-anchor"]="middle";
            nameText.attributes.y = options.width * 1.5;

            nameText.update();
            buttonShape.update();
            remakeValueShape();

            nameText.set({"text": options.name});
        }

        remakePath();

        const pushCallbacks = [];

        const clickable = new Interactive_Clickable(buttonShape.domElement);

        clickable.mouseDownCallback = () => {
            pushCallbacks.forEach(c=>c());
            this.value=true;
            remakePath();
        }
        clickable.mouseUpCallback = () => {
            this.value=false;
            remakePath();
        }

        /** @param {Function} cb */
        this.onPush = (cb) => {
            pushCallbacks.push(cb);
        }


    }
}

/* harmony default export */ const GuiComponents_Button = (Button);
;// CONCATENATED MODULE: ./src/DomInterfaces/RepeaterDisplay.js










const RepeaterDisplay_vectorTypes = __webpack_require__(424);
/** @typedef {vectorTypes.MiniVector} MiniVector
/**
 * @namespace DomInterface.RepeaterDisplay
 */
/** 
 * @class RepeaterDisplay
 * @extends WaveLane
 */
class RepeaterDisplay extends LaneTypes_WaveLane{
    /**
     * @param {object} options
     * @param {Repeater} options.module
     * @param {SVGCanvas} options.drawBoard
     **/
    constructor (options){
        const {module,drawBoard} = options;
        const settings=const_typicalLaneSettings(module,drawBoard);
        //plave for defaults
        settings.name="Repeater";
        Object.assign(settings,options);

        const translator=new utils_ValuePixelTranslator(settings);
        super(settings,translator);

        const lengthKnob = this.addKnob("length");
        const monophonicToggle = this.addToggle("monophonic");
        this.addKnob("gain");
        
        const addPointButton = new GuiComponents_Button({name:"add rep."});
        this.appendToControlPanel(addPointButton);

        addPointButton.onPush(()=>{
            console.log("pushed");
            module.addPoint();
        });


        //lane has a contents sprite.
        const contents=this.contents;

        const readoutText =  new SVGElements.Text({
            class:"freq-times-amp",
            x:10, y:settings.height,
            text:"---",
        });
        contents.add(readoutText);

        class Handle extends SVGElements.Circle {
            constructor(settings){
                let circleSettings = {r:10};
                Object.apply(circleSettings,settings);
                super(circleSettings);
                this.point=[0,0];
                const draggable = this.draggable = new Interactive_Draggable(this.domElement);
                
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
                readoutText.set({
                    "text":
                        `${
                            src_utils_round(module.settings.frequency,4)
                        }Hz; ${
                            src_utils_round(module.settings.amplitude,4)
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

/* harmony default export */ const DomInterfaces_RepeaterDisplay = (RepeaterDisplay);

;// CONCATENATED MODULE: ./src/DomInterfaces/HipparchusDisplay.js






/**
 * @namespace DomInterface.HipparchusDisplay
 */

/** 
 * @class HipparchusDisplay
 * @extends WaveLane
 */
class HipparchusDisplay extends LaneTypes_WaveLane{
    /**
     * @param {object} options
     * @param {Hipparchus} options.module
     * @param {SVGCanvas} options.drawBoard
     **/
    constructor (options){
        const {module,drawBoard} = options;
        const settings=const_typicalLaneSettings(module,drawBoard);
        //plave for defaults
        settings.name="Hipparchus";
        Object.assign(settings,options);

        super(options);

        this.addKnob("rotation").setMinMax(0,2);
        this.addKnob("rightOffset").setMinMax(-1,1);
        this.addKnob("gain").setMinMax(0,2);
        

        //lane has a contents sprite.
        const contents=this.contents;

        const readoutText =  new SVGElements.Text({
            class:"freq-times-amp",
            x:10, y:settings.height,
            text:"---",
        });
        contents.add(readoutText);


    }
};

/* harmony default export */ const DomInterfaces_HipparchusDisplay = (HipparchusDisplay);

;// CONCATENATED MODULE: ./src/DomInterfaces/WaveFolderDisplay.js


class WaveFolderDisplay extends LaneTypes_WaveLane{
    constructor(options){
        super(options); 
        this.addKnob("amplitude");
        this.addKnob("bias");
        this.addKnob("fold");
    }
}
/* harmony default export */ const DomInterfaces_WaveFolderDisplay = (WaveFolderDisplay);
;// CONCATENATED MODULE: ./src/DomInterfaces/RustCombDisplay.js


class RustCombDisplay_WaveFolderDisplay extends LaneTypes_WaveLane{
    constructor(options){
        super(options); 

        this.addKnob("frequency");
        this.addKnob("dampening_inverse").setMinMax(0,1);
        this.addKnob("dampening").setMinMax(0,1);
        this.addKnob("feedback");
    }
}
/* harmony default export */ const RustCombDisplay = (RustCombDisplay_WaveFolderDisplay);
;// CONCATENATED MODULE: ./src/DomInterfaces/FilterDisplay.js


class FilterDisplay extends LaneTypes_WaveLane{
    constructor(options){
        super(options); 
        this.addKnob("gain");
        this.addKnob("reso");
        this.addKnob("frequency");
        this.addKnob("order");
        this.addToggle("saturate");

    }
}
/* harmony default export */ const DomInterfaces_FilterDisplay = (FilterDisplay);
;// CONCATENATED MODULE: ./src/utils/times.js
const times = (cb,times) => {
    for(let a = 0; a< times; a++) cb(a);
}
/* harmony default export */ const utils_times = (times);
;// CONCATENATED MODULE: ./src/DomInterfaces/HarmonicsOscillator2Display.js









const HarmonicsOscillator2Display_vectorTypes = __webpack_require__(424);
/** @typedef {vectorTypes.MiniVector} MiniVector */

/**
 * @namespace DomInterface.HarmonicsOscillator2Display
 */

const frequencyToPosX = (f,centerFreq) => {
    return Math.log2(f/centerFreq);
}
const posXToFrequency = (posx) => {
    return Math.pow(2,posx);
}

let c = 0;
class HarmonicLine extends SVGListElement{
    /**
     * @param {Object} props
     * @param {HarmonicsOscillator2} props.module
     * @param {number} props.width
     * @param {number} props.height
     */
    constructor({width,height,module}){
        super();

        let shown = false;
        console.log("harmonicLine",{width,height,module});
        const line = new SVGElements.Line();
        const text = new SVGElements.Text();
        const halfHeight = height / 2;

        this.hide = () => {
            if(!shown) return;
            shown=false;
            this.remove(line);
            this.remove(text);
        }

        this.show = () => {
            if(shown) return;
            shown=true;
            this.add(line);
            this.add(text);
        }

        this.set=({number,width})=>{
            let halfWidth = width / 2;
            const frequency = module.getHarmonicFrequencyMultiplier(
                number, module.settings.distance
            );
            let x = halfWidth + (Math.log2(frequency) * width / 5);
            let x1=x;

            console.log({x,number,width});

            let y1=height - SoundModules_HarmonicsOscillator2.falloffFunction(
                number / module.settings.harmonics,
                module.settings.falloff
            ) * halfHeight;
            
            let x2=x;
            let y2=height;
            
            Object.assign(line.attributes,{
                x1,y1,x2,y2,
            });
            line.update();
            Object.assign(text.attributes,{
                x:x1,y:y1,text:utils_round(frequency,3),
            });
            text.update();
        }
    }
}

class FrequencyLine extends SVGListElement{
    constructor({width,height}){
        super();
        const line = new SVGElements.Line();
        this.hide = () => {
            this.remove(line);
        }
        this.show = () => {
            this.add(line);
        }
        this.set=(settings)=>{
            let x = frequencyToPosX(settings.frequency);
            let x1=x;
            let y1=0;
            let x2=x;
            let y2=height;
            Object.assign(line.attributes,{
                x1,y1,x2,y2,
            });
        }
    }
}

/** 
 * @class HarmonicsOscillator2Display
 * @extends WaveLane
 */
class HarmonicsOscillator2Display extends LaneTypes_WaveLane{
    /** @param {import("./components/Lane").LaneOptions} options */
    constructor(options){
        const {module,drawBoard} = options;
        const settings=const_typicalLaneSettings(module,drawBoard);
        Object.assign(settings,options);
        super(settings);
        

        Object.keys(module.settings).forEach((settingName,settingNumber)=>{
            const settingValue = module.settings[settingName];
            const settingType = typeof settingValue;
            if(settingType === "number"){
                this.addKnob(settingName);
            }else if(settingType === "boolean"){
                this.addToggle(settingName);
            }else if(settingValue.constructor && settingValue.constructor.name === "Float32Array"){
                this.addSoundDecoder(settingName);
            }
        });

        const extraControlSettings={fine:0};
        const additionalControls = new Model/* default */.Z(extraControlSettings);

        let fineKnob = new GuiComponents_Knob();
        fineKnob.setToModelParameter(additionalControls,"fine");
        this.appendToControlPanel(fineKnob);

        additionalControls.onUpdate((changes)=>{
            //note that using !== undefined would cause an infinite recursion loop 
            if(changes.fine){
                module.set({
                    distance:module.settings.distance + changes.fine / 100
                });
            };
        });

        let harmonicLines = new SVGElementsArray(
            HarmonicLine,
            {   
                module,
                width:settings.width,
                height:settings.height
            }
        );

        module.onUpdate((changes)=>{
            if(
                changes.harmonics 
                || changes.falloff
                || changes.distance
            ){
                let harmarray = [];
                utils_times(
                    number=>harmarray.push({number,width:settings.width}),
                    module.settings.harmonics
                );
                harmonicLines.displayArray(harmarray);
            }
        });

        let referenceLines = new SVGElementsArray(
            FrequencyLine,
            {   
                module,
                width:options.width,
                height:options.height
            }
        );

        this.add(harmonicLines,referenceLines);

        module.onUpdate((changes)=>{
            if(
                changes.harmonics 
                || changes.falloff
                || changes.distance
            ){
                let harmarray = [];
                utils_times(number=>harmarray.push({
                    number:Math.pow(2,number)
                },5));
                referenceLines.displayArray(harmarray);
            }
        });

        module.triggerInitialState();
    }
};

/* harmony default export */ const DomInterfaces_HarmonicsOscillator2Display = (HarmonicsOscillator2Display);

;// CONCATENATED MODULE: ./src/utils/exportToBrowserGlobal.js
const exportToBrowserGlobal = (thing, name) => {
    if(window[name]) console.warn(
        "overwriting window global",
        window[name],
        "named ",
        name,
        "with",
        thing
    );
    window[name] = thing;
}

/* harmony default export */ const utils_exportToBrowserGlobal = (exportToBrowserGlobal);

;// CONCATENATED MODULE: ./src/LiveCodingInterface/index.js
//actual sound modules






















//for interfaces















const modulesAndTheirInterfaces = {}

function registerModuleAndItsInterface (ModuleProto,InterfaceProto){
    modulesAndTheirInterfaces[ModuleProto.name] = [
        ModuleProto,InterfaceProto
    ];
};

registerModuleAndItsInterface(SoundModules_Oscillator,false);
registerModuleAndItsInterface(SoundModules_HarmonicsOscillator,false);
registerModuleAndItsInterface(SoundModules_HarmonicsOscillator2,DomInterfaces_HarmonicsOscillator2Display);
registerModuleAndItsInterface(SoundModules_Mixer,false);
registerModuleAndItsInterface(SoundModules_Delay,DomInterfaces_DelayDisplay);
registerModuleAndItsInterface(SoundModules_DelayWithFilter,DelayWithFilterDisplay);
registerModuleAndItsInterface(SoundModules_NaiveReverb,DomInterfaces_ReverbDisplay);
registerModuleAndItsInterface(SoundModules_EnvelopeGenerator,DomInterfaces_EnvelopeGeneratorDisplay);
registerModuleAndItsInterface(EnvAttackRelease,DomInterfaces_EnvAttackReleaseDisplay);
registerModuleAndItsInterface(SoundModules_Chebyshev,DomInterfaces_ChebyshevDisplay);
registerModuleAndItsInterface(SoundModules_SigmoidDistortion,false);
registerModuleAndItsInterface(SoundModules_WaveFolder,DomInterfaces_WaveFolderDisplay);
registerModuleAndItsInterface(SoundModules_RustComb,RustCombDisplay);
registerModuleAndItsInterface(SoundModules_RustFreeverb,false);
registerModuleAndItsInterface(SoundModules_Filter,false);
registerModuleAndItsInterface(SoundModules_MixerTesselator,);
registerModuleAndItsInterface(common_Module,false);
registerModuleAndItsInterface(SoundModules_Repeater,DomInterfaces_RepeaterDisplay);
registerModuleAndItsInterface(SoundModules_Filter,DomInterfaces_FilterDisplay);
registerModuleAndItsInterface(SoundModules_Hipparchus,DomInterfaces_HipparchusDisplay);
registerModuleAndItsInterface(SoundModules_Sampler,false);
registerModuleAndItsInterface(SoundModules_VoltsPerOctaveToHertz,false);


//for typing





function giveHelp(){

    console.log(`
    use command "create(<module>,<myName>)", where module is any of the prototypes contained in the "modules" object, and myname is a custom name you wish to give to this module. Type "modules" and then press enter to get the list of them.
    Then type "modules.<myName>" and tab, to see the available methods.
    `);
    console.log(`instanced modules are present in modules array`);
    console.log(`to display how to re-create the patch in screen, run "dumpPatch()". This is a good way to save patches for later use, too.`);

}

class LiveCodingInterface{
    /**
     * @param {Object} globals
     * @param {SVGCanvas} globals.drawBoard
     */
    constructor({drawBoard}){
        let count=0;

        setTimeout(giveHelp,1000);
        const moduleCreationListeners = [];

        /** @param {Function} callback */
        this.onModuleCreated=(callback)=>{
            moduleCreationListeners.push(callback);
        }

        this.modules = {};

        let first=true;
        /** 
         * @param {string|false} intendedName
         * @returns {Module} 
         **/
        this.create=function(Which,intendedName=false){
            if(first){
                first=false;
                let helpDom = document.getElementById("notes");
                if(helpDom) helpDom.classList.add("hide");
            }

            let protoname=Which.name;
            if(!intendedName) intendedName=protoname+" "+count;
            let nameForAccess = (
                intendedName
            ).match(/[A-Za-z0-9_]/gi).join("").toLowerCase();

            if(this.modules[nameForAccess]) nameForAccess = nameForAccess+count;
            
            console.log(`this module will be available as "modules.${nameForAccess}"`);
            
            const newModule=new Which();

            this.modules[nameForAccess]=newModule;
            if(window[nameForAccess]===undefined) window[nameForAccess]=newModule;

            const props = {
                module:newModule,
                name:nameForAccess, drawBoard
            }

            let newInterface;

            if(modulesAndTheirInterfaces[protoname][1]){
                newInterface = new modulesAndTheirInterfaces[protoname][1](props);
            }else{
                newInterface=new DomInterfaces_GenericDisplay(props);
            }

            moduleCreationListeners.map((cb)=>cb(newModule,newInterface,count));

            newInterface.handyPosition(count + 3);
            // drawBoard.add(newInterface);

            count++;
            return newModule;
        }
        //TODO: the dumped file assumes the modules contain a property called "name" which contains exactly the name to which this patcher refers to as that module, thus it's limited to modules created with "create" functioon
        //creates a procedure to recreate the current patch
        const dumpPatch = () => {
            let instanceStrings = [];
            let connectionStrings = [];
            let settingStrings = [];
            let autozoomStrings = [];
            
            /*
            TODO:replace moduleList type from Array<Module> into Array of [module,name]
            so that we dont need to run "findModulesName" on each iteration of modulesList.map

            */


            /** @type {Array<Module>} */
            let modulesList = [];

            Object.keys(this.modules).map((mname)=>{
                modulesList.push(this.modules[mname]);
            });

            modulesList.sort((a,b)=>{

                let inta = a.getInterface();
                let intb = b.getInterface();
                
                let ya = 0;
                let yb = 0;

                if(inta) ya = inta.attributes.y;
                if(intb) yb = intb.attributes.y;
                
                return ya - yb;
            });

            const getAccessNameOfModule=(module)=>{

                let name = utils_getMyNameInObject(module,window);
                if(!name){
                    name = `modules["${utils_getMyNameInObject(module,modulesList)}"]`;
                }
                return name;
            }
            modulesList.map((module)=>{
                //make creation string
                let constructorName = module.constructor.name;
                if(!constructorName){
                    constructorName = `possibleModules["${utils_getMyNameInObject(module,this.possibleModules)}"]`;
                }
                let name = getAccessNameOfModule(module);

                instanceStrings.push(`let ${name} = create(possibleModules.${constructorName},"${name}");`);
                
                module.eachOutput((output)=>{
                    output.forEachConnectedInput((connectedInput)=>{    

                        let connectedInputOwner = connectedInput.getOwner();
                        let connectedInputOwnerAccessName = getAccessNameOfModule(connectedInputOwner);

                        connectionStrings.push(
                            `${ 
                                name }.outputs.${
                                output.name }.connectTo(${
                                connectedInputOwnerAccessName }.inputs.${
                                connectedInput.name });`
                        );
                    });
                });
                //"deep copy" settings 
                const setts = JSON.parse(JSON.stringify(module.settings));

                settingStrings.push(''+name+'.set('+JSON.stringify(setts,null, 2)+');');
                autozoomStrings.push(''+name+'.getInterface().autoZoom();');

            });
            return [instanceStrings,connectionStrings,settingStrings,autozoomStrings].flat().join("\n").replace(/\"/g,"'");
        }

        //export stuff to window, so that you can call it from webinspector

        this.possibleModules = {};
        Object.keys(
            modulesAndTheirInterfaces
        ).forEach((modName)=>{
            this.possibleModules[modName] = modulesAndTheirInterfaces[modName][0];
        });
        
        utils_exportToBrowserGlobal(this.possibleModules,"possibleModules");

        Object.keys(this.possibleModules).map((mname)=>{
            if(window[mname]===undefined) window[mname]=this.possibleModules[mname];
        });
        
        utils_exportToBrowserGlobal((module,name)=>{
            if(!module){
                console.error("create: provided module is",module);
                return Object.keys(this.possibleModules);
            }
            return this.create(module,name)
        },"create");

        utils_exportToBrowserGlobal(this.modules,"modules");
        utils_exportToBrowserGlobal(()=>{return dumpPatch()},"dumpPatch");

        //connect a list of inputs to a list of outputs
        utils_exportToBrowserGlobal((from,to)=>{
            from=([from]).flat();
            to=([to]).flat();
            from.map((source)=>{
                to.map((destination)=>{
                    source.connectTo(destination);
                })
            });
        },"connect");

        //connect the modules in a chain
        utils_exportToBrowserGlobal((...modules)=>{
            /** @type {Module|false} */
            let prevModule = false;
            modules.flat().forEach((module)=>{
                if(prevModule){
                    prevModule.connectTo(module);
                }
                prevModule=module;
            });
        },"chain");

    }
}

/* harmony default export */ const src_LiveCodingInterface = (LiveCodingInterface);
;// CONCATENATED MODULE: ./src/Ghost.js

var perlin = __webpack_require__(88);

//using lpf and seeded random, we can get smooth changing random number. 
const ContinuousRandomGenerator = function(){
    const w = 480;
    const h = 480;
    let currentIndex = 0;
    let currentNoise = perlin.generatePerlinNoise(w, h);

    this.reSeed=(seed)=>{
        currentNoise = perlin.generatePerlinNoise(w, h);
    }
    this.get=()=>{
        // return currentNoise[currentIndex++];
        return Math.random();
    }
}

/**
 * @typedef {Object} Tweakable
 * @property {Module} module
 * @property {String} key
 * @property {number} min
 * @property {number} range
 * @property {ContinuousRandomGenerator} noiseGen low-passed noise generator
 */



class Ghost {
    constructor() {
        

        /**
         * @param {Module} module to changte
         * @param {string} settingKey what parameter to change
         * @param {number} minimum value
         * @param {number} maximum value
         * @example ghost.add(osc1,"frequency",90,480)
         */

        /** @type {Array<Tweakable>} */
        const changeableParameters = [];
        this.add = (module, settingKey,minimum,maximum) => {
            changeableParameters.push({
                module,
                key:settingKey,
                min:minimum,
                range:maximum-minimum,
                noiseGen:new ContinuousRandomGenerator(),
            });
        }
        
        this.generateRandom = () => {
            changeableParameters.forEach((changeable)=>{
                const normalValue = changeable.noiseGen.get();
                const mappedValue = normalValue * changeable.range + changeable.min;
                // console.log({
                //     normalValue,
                //     mappedValue,
                // });
                let setObj = {};
                setObj[changeable.key] = mappedValue;
                changeable.module.set(setObj);
            });
        }
    }
}
/* harmony default export */ const src_Ghost = (Ghost);
;// CONCATENATED MODULE: ./src/dom-model-gui/GuiComponents/DOMElements.js

/**
 * @typedef {import("./Component").ComponentOptions} ComponentOptions
 */

class HTMLComponent extends Component/* default */.Z{
    /** @param {ComponentOptions} myOptions */
    constructor(myOptions={}) {
        super(myOptions);
        this.appliedAttributes.innerHTML="";
        /** @param {Array<Component>} elems */
        this.add = (...elems) => {
            elems.forEach((elem)=>{
                if(
                    !(
                        elem.domElement instanceof HTMLElement 
                        || elem.domElement instanceof SVGSVGElement
                    )
                ) throw new Error("you can only add HTMLElements to HTMLElements.");
                this.domElement.appendChild(elem.domElement);
            });
            return this;
        };
        const superUpdate = this.update;
        this.update = () => {
            superUpdate();
            this.domElement.innerHTML=this.appliedAttributes.innerHTML;
        };

        this.remove = (elem) => {
            this.domElement.removeChild(elem.domElement);
        }
    }
}

class DOMElements_Div extends HTMLComponent{
    /** @param {ComponentOptions} myOptions */
    constructor(myOptions={}) {
        super(myOptions);
        this.domElement = document.createElement("div");

        this.update();
    }
}

class Ul extends (/* unused pure expression or super */ null && (HTMLComponent)){
    /** @param {ComponentOptions} myOptions */
    constructor(myOptions={}) {
        super(myOptions);
        this.domElement = document.createElement("ul");

        this.update();
    }
}

class P extends (/* unused pure expression or super */ null && (HTMLComponent)){
    /** @param {ComponentOptions} myOptions */
    constructor(myOptions={}) {
        super(myOptions);
        this.domElement = document.createElement("p");

        const superUpdate = this.update;
        
        this.update = () => {
            this.attributes.innerHTML=this.attributes.text;
            superUpdate();
        };
        this.update();
    }
}
class H1 extends (/* unused pure expression or super */ null && (HTMLComponent)){
    /** @param {TextOptions} myOptions */
    constructor(myOptions={}) {
        super(myOptions);
        this.domElement = document.createElement("H1");

        const superUpdate = this.update;
        
        this.update = () => {
            this.attributes.innerHTML=this.attributes.text;
            superUpdate();
        };
        this.update();
    }
}

class H2 extends (/* unused pure expression or super */ null && (HTMLComponent)){
    /** @param {TextOptions} myOptions */
    constructor(myOptions={}) {
        super(myOptions);
        this.domElement = document.createElement("H2");

        const superUpdate = this.update;
        
        this.update = () => {
            this.attributes.innerHTML=this.attributes.text;
            superUpdate();
        };
        this.update();
    }
}

class H3 extends (/* unused pure expression or super */ null && (HTMLComponent)){
    /** @param {TextOptions} myOptions */
    constructor(myOptions={}) {
        super(myOptions);
        this.domElement = document.createElement("H3");

        const superUpdate = this.update;
        
        this.update = () => {
            this.attributes.innerHTML=this.attributes.text;
            superUpdate();
        };
        this.update();
    }
}

class H4 extends (/* unused pure expression or super */ null && (HTMLComponent)){
    /** @param {TextOptions} myOptions */
    constructor(myOptions={}) {
        super(myOptions);
        this.domElement = document.createElement("H4");

        const superUpdate = this.update;
        
        this.update = () => {
            this.attributes.innerHTML=this.attributes.text;
            superUpdate();
        };
        this.update();
    }
}


/**
 * @callback updateListener
 * @param {string} newValue
 */
class Field extends (/* unused pure expression or super */ null && (HTMLComponent)){
    constructor(myOptions={},domElement){
        

        super(myOptions);

        /** @type {HTMLInputElement|HTMLTextAreaElement} */
        this.domElement = domElement;

        /** @type {Array <updateListener> */
        const updateListeners = [];
        let inputListenerAdded=false;
        const valueChangeHandler = () => {
            updateListeners.forEach(cb=>cb(this.attributes.value));
        }

        this.onInput=(callback)=>{
            this.domElement.addEventListener('input',callback);
        }

        /** @param {updateListener} callback */
        this.onValueChange = (callback) => {
            if(!inputListenerAdded){
                this.domElement.addEventListener('input',valueChangeHandler);
                inputListenerAdded=true;
            }
            updateListeners.push(callback);
        }

        this.onBlur=(callback)=>{
            this.domElement.addEventListener('blur',callback);
        }

        const superUpdate = this.update;
        this.update = () => {
            this.attributes.value=this.attributes.text;
            superUpdate();
            valueChangeHandler();
        };


        this.update();
    }
}

class Textarea extends (/* unused pure expression or super */ null && (Field)){
    /** @param {ComponentOptions} myOptions */
    constructor(myOptions={}) {
        super(myOptions,document.createElement("textarea"));
        
        const superUpdate = this.update;
        this.update = () => {
            this.domElement.innerHTML=this.attributes.text;
            superUpdate();
        };
    }
}

class TextField extends (/* unused pure expression or super */ null && (Field)){
    /** @param {ComponentOptions} myOptions */
    constructor(myOptions={}) {
        super(myOptions,document.createElement("input"));

        this.domElement.setAttribute("type","text");

    }
}
class NumberField extends (/* unused pure expression or super */ null && (Field)){
    /** @param {ComponentOptions} myOptions */
    constructor(myOptions={}) {

        super(myOptions,document.createElement("input"));
        this.domElement.setAttribute("type","number");

    }
}
class CheckboxField extends (/* unused pure expression or super */ null && (Field)){
    /** @param {ComponentOptions} myOptions */
    constructor(myOptions={}) {
        super(myOptions,document.createElement("input"));
        this.domElement.setAttribute("type","checkbox");
    }
}

// class MathFormulaField extends Div {
//     constructor(myOptions){
//         super(myOptions);
//         const inputText = this.inputText = new TextField();
//         const rendered = this.rendered = new Div();
//         this.add(inputText,rendered);

//         const changeHandlers = [];
//         this.onChange = handler => changeHandlers.push(handler);
//         const handleChange = (...p) => changeHandlers.forEach(h=>h(...p));

//         inputText.onInput(()=>{
//             try{
//                 // katex.render(
//                 //     inputText.domElement.value,
//                 //     rendered.domElement,
//                 // );
//                 handleChange(inputText.domElement.value);
//             }catch(e){
//                 inputText.addClass("error");
//                 console.warn("math parse error:",e);
//             }
//         });
//     }
// }

class UploadField extends (/* unused pure expression or super */ null && (Field)){
    /** @param {ComponentOptions} myOptions */
    constructor(myOptions={}) {
        super(myOptions,document.createElement("input"));
        this.domElement.setAttribute("type","file");
    }
}

class TabButton extends (/* unused pure expression or super */ null && (DOMElements_Div)) {
    constructor(settings){
        super();
        const text = new P(settings);
        this.add(text);
        this.addClass("tab button");
    }
};

class TabsContainer extends (/* unused pure expression or super */ null && (DOMElements_Div)) {
    constructor(){
        super();
        /**
         * @typedef TabInst
         * @property {Component} TabInst.element
         * @property {TabButton} TabInst.button
         * @property {string} TabInst.name
         */

        /** @type {Array<TabInst>} */
        const tabs = [];
        const tabsContainer = new DOMElements_Div();
        const contentsContainer = new DOMElements_Div();
        this.addClass("tab-container");
        contentsContainer.addClass("tab-contents-container");

        this.add(tabsContainer,contentsContainer);

        /** @param {TabInst} theTab*/
        this.openTab=(theTab)=>{
            tabs.forEach((tab)=>{
                tab.button.removeClass("active");
            });
            theTab.button.addClass("active");
            contentsContainer.domElement.innerHTML="";
            contentsContainer.add(theTab.element);
        };
        /** 
         * @param {Component} element 
         * @param {string} name 
         * */
        this.addTab = (element,name)=>{
            const button = new TabButton({text:name});
            /** @type {TabInst} */
            let newTab = {
                button,name,element
            }

            button.domElement.addEventListener("click",()=>{
                this.openTab(newTab);
            });

            tabsContainer.add(button);

            tabs.push(newTab);
            return newTab;
        }

        this.openTabNamed = name => {
            let found = tabs.filter(tab=>tab.name==name)[0];
            return this.openTab(found);
        }

        this.removeTab = tab =>{
            let index = tabs.indexOf(tab);
            if(index>-1){
                tab.button.destroy();
                tab.element.destroy();
                tabs.splice(index,1);
            }
        }
        this.removeTabNamed = name => {
            let found = tabs.filter(tab=>tab.name==name)[0];
            return this.removeTab(found);
        }
    }
}


;// CONCATENATED MODULE: ./src/LiveCodingInterface/GuiHelper.js



class LiveCodingInterfaceGuiHelper extends DOMElements_Div{
    /** @param {Object} props 
     * @param {LiveCodingInterface} props.liveCodingInterface
     **/
    constructor({liveCodingInterface}){
        super();
        this.domElement.setAttribute("style","z-index: 10;position: absolute;");
        let parent = this;
        Object.keys(
            liveCodingInterface.possibleModules
        ).forEach(function(modulename){
            const Constructor = liveCodingInterface.possibleModules[modulename];
            let newDiv = new DOMElements_Div();
            newDiv.addClass("button");
            
            let abbrname = modulename.toLowerCase().slice(0,3);
            newDiv.domElement.innerHTML="+" + modulename;
            parent.add(newDiv);
            newDiv.domElement.addEventListener("click",()=>{
                liveCodingInterface.create(Constructor,abbrname);
            });
        });
        
    }
}
/* harmony default export */ const GuiHelper = (LiveCodingInterfaceGuiHelper);
;// CONCATENATED MODULE: ./src/demoLibrary.js
//welcome to spaghetti code hell

function demoLibrary() {

    //pre-run a live-coded patch
    const demos = window.demos = {
        "drummaker": () => {
            create(possibleModules.Oscillator, 'oscillator1');
            create(possibleModules.Oscillator, 'oscillator2');
            create(possibleModules.Oscillator, 'oscillator3');
            create(possibleModules.EnvelopeAttackRelease, 'env0');
            create(possibleModules.EnvelopeAttackRelease, 'env1');
            create(possibleModules.EnvelopeAttackRelease, 'env2');
            create(possibleModules.EnvelopeAttackRelease, 'env3');
            create(possibleModules.EnvelopeAttackRelease, 'env4');
            create(possibleModules.Mixer, 'premix');
            create(possibleModules.RustFreeverb, 'reverb');
            create(possibleModules.DelayWithFilter, 'fdel');
            create(possibleModules.Mixer, 'postmix');
            modules['oscillator1'].connectTo(modules['premix'].inputs.a);
            modules['oscillator1'].connectTo(modules['postmix'].inputs.a);
            modules['oscillator2'].connectTo(modules['oscillator1'].inputs.frequency);
            modules['oscillator3'].connectTo(modules['premix'].inputs.b);
            modules['env0'].connectTo(modules['oscillator1'].inputs.amplitude);
            modules['env1'].connectTo(modules['oscillator2'].inputs.amplitude);
            modules['env2'].connectTo(modules['oscillator2'].inputs.frequency);
            modules['env3'].connectTo(modules['oscillator3'].inputs.amplitude);
            modules['env4'].connectTo(modules['fdel'].inputs.time);
            modules['premix'].connectTo(modules['fdel'].inputs.main);
            modules['premix'].connectTo(modules['postmix'].inputs.c);
            modules['premix'].connectTo(modules['reverb'].inputs.main);
            modules['reverb'].connectTo(modules['postmix'].inputs.d);
            modules['fdel'].connectTo(modules['postmix'].inputs.b);
            modules['oscillator1'].set({
                'amplitude': 0,
                'bias': 0,
                'length': 1,
                'frequency': 37.19489981785033,
                'phase': 0,
                'shape': 'sin'
            });
            modules['oscillator2'].set({
                'amplitude': 0,
                'bias': 0,
                'length': 1,
                'frequency': 477.2247474747475,
                'phase': 0,
                'shape': 'sin'
            });
            modules['oscillator3'].set({
                'amplitude': 0,
                'bias': 0,
                'length': 1,
                'frequency': 1,
                'phase': 0,
                'shape': 'noise'
            });
            modules['env0'].set({
                'attack': 0,
                'release': 0.18020408163265306,
                'amplitude': 1,
                'attackShape': 1,
                'releaseShape': 5.19
            });
            modules['env1'].set({
                'attack': 0.017414965986394557,
                'release': 0.6265079365079365,
                'amplitude': 440.6733333333333,
                'attackShape': 0,
                'releaseShape': 3.15
            });
            modules['env2'].set({
                'attack': 0,
                'release': 0.6006122448979592,
                'amplitude': 55,
                'attackShape': 1,
                'releaseShape': 5.19
            });
            modules['env3'].set({
                'attack': 0,
                'release': 0.6006122448979592,
                'amplitude': 1,
                'attackShape': 1,
                'releaseShape': 5.19
            });
            modules['env4'].set({
                'attack': 0.2,
                'release': 0.5,
                'amplitude': 0.2,
                'attackShape': 1,
                'releaseShape': 5.19
            });
            modules['premix'].set({
                'amplitude': 0.4,
                'levela': 1,
                'levelb': 0.25,
                'levelc': 0.25,
                'leveld': 0.25,
                'saturate': true,
                normalize: true,
            });
            modules['reverb'].set({
                'dampening': 0.39,
                'freeze': false,
                'wet': 0.04999999999999993,
                'width': -0.009999999999999953,
                'dry': 0.84,
                'roomSize': 0.4099999999999998,
                'LROffset': 1
            });
            modules['fdel'].set({
                'feedback': 0.8700000000000001,
                'time': 0.011462222222222233,
                'dry': 0.0699999999999999,
                'wet': 0.73,
                'gain': 0.2899999999999999,
                'reso': 3.78,
                'length': 1,
                'type': 'LpMoog',
                'order': 1,
                'frequency': 5594.777777777777,
                'saturate': true
            });
            modules['postmix'].set({
                'amplitude': 1,
                'levela': 0,
                'levelb': 4,
                'levelc': 0,
                'leveld': 0.2833333333333333,
                'saturate': true,
                normalize: true,
            });
            modules['oscillator1'].getInterface().autoZoom();
            modules['oscillator2'].getInterface().autoZoom();
            modules['oscillator3'].getInterface().autoZoom();
            modules['env0'].getInterface().autoZoom();
            modules['env1'].getInterface().autoZoom();
            modules['env2'].getInterface().autoZoom();
            modules['env3'].getInterface().autoZoom();
            modules['env4'].getInterface().autoZoom();
            modules['premix'].getInterface().autoZoom();
            modules['reverb'].getInterface().autoZoom();
            modules['fdel'].getInterface().autoZoom();
            modules['postmix'].getInterface().autoZoom();

            ghost.add(postmix, "levela", 0, 0.25);
            ghost.add(postmix, "levelb", 0, 0.25);
            ghost.add(postmix, "levelc", 0, 0.25);
            ghost.add(postmix, "leveld", 0, 0.25);

            ghost.add(premix, "levela", 0, 0.5);
            ghost.add(premix, "levelb", 0, 0.5);


            ghost.add(env0, 'attack', 0, 0.05);
            ghost.add(env0, 'release', 0, 0.9);
            ghost.add(env0, 'amplitude', 0, 0.9);
            ghost.add(env0, 'attackShape', 0.01, 2);
            ghost.add(env0, 'releaseShape', 0, 2);

            ghost.add(env1, 'attack', 0, 0.05);
            ghost.add(env1, 'release', 0, 0.5);
            ghost.add(env1, 'amplitude', 0, 1200);
            ghost.add(env1, 'attackShape', 0.01, 2);
            ghost.add(env1, 'releaseShape', 0, 2);

            ghost.add(env2, 'attack', 0, 0.05);
            ghost.add(env2, 'release', 0, 5);
            ghost.add(env2, 'amplitude', 0, 240);
            ghost.add(env2, 'attackShape', 0.01, 2);
            ghost.add(env2, 'releaseShape', 0, 2);

            ghost.add(env3, 'attack', 0.01, 0.05);
            ghost.add(env3, 'release', 0, 0.9);
            ghost.add(env3, 'amplitude', 0, 0.1);
            ghost.add(env3, 'attackShape', 0.01, 2);
            ghost.add(env3, 'releaseShape', 0, 2);

            ghost.add(env4, 'attack', 0, 0.05);
            ghost.add(env4, 'release', 0, 0.9);
            ghost.add(env4, 'amplitude', 0, 0.5);
            ghost.add(env4, 'attackShape', 0.01, 2);
            ghost.add(env4, 'releaseShape', 0, 2);


            ghost.add(fdel, 'feedback', 0, 0.7);
            ghost.add(fdel, 'time', 1e-320, 0.1);
            ghost.add(fdel, 'dry', 0, 0.5);
            ghost.add(fdel, 'wet', 0, 1);
            ghost.add(fdel, 'gain', 0, 1);
            ghost.add(fdel, 'reso', 0, 2);
            ghost.add(fdel, 'frequency', 50, 5000);


            ghost.add(reverb, 'dampening', 0, 1);
            ghost.add(reverb, 'wet', 0, 1);
            ghost.add(reverb, 'width', 0, 1);
            ghost.add(reverb, 'dry', 0, 1);
            ghost.add(reverb, 'roomSize', 0, 1);

            window.randomize = (() => {
                ghost.generateRandom();
                setTimeout(() => {
                    Object.keys(modules).forEach((key) => modules[key].getInterface().autoZoom());
                }, 5);

            });

            setTimeout(() => {
                modules['oscillator1'].getInterface().autoZoom();
                modules['oscillator2'].getInterface().autoZoom();
                modules['oscillator3'].getInterface().autoZoom();
                modules['env0'].getInterface().autoZoom();
                modules['env1'].getInterface().autoZoom();
                modules['env2'].getInterface().autoZoom();
                modules['env3'].getInterface().autoZoom();
                modules['premix'].getInterface().autoZoom();
                modules['fdel'].getInterface().autoZoom();
                modules['postmix'].getInterface().autoZoom();
                // setInterval(randomize,1000);
            }, 1000);
        },
        "drumaker2": () => {

            create(possibleModules.Oscillator, 'osc1');
            create(possibleModules.Oscillator, 'osc2');
            create(possibleModules.HarmonicsOscillator, 'osc3');
            create(possibleModules.EnvelopeAttackRelease, 'env1');
            create(possibleModules.EnvelopeAttackRelease, 'env2');
            create(possibleModules.EnvelopeAttackRelease, 'env3');
            create(possibleModules.EnvelopeAttackRelease, 'env4');
            create(possibleModules.EnvelopeAttackRelease, 'env5');
            create(possibleModules.EnvelopeAttackRelease, 'env6');
            create(possibleModules.Mixer, 'premix');
            create(possibleModules.DelayWithFilter, 'dlytr1');
            create(possibleModules.DelayWithFilter, 'dlytr2');
            create(possibleModules.DelayWithFilter, 'dlytr3');
            create(possibleModules.DelayWithFilter, 'dlytr4');
            create(possibleModules.Mixer, 'postmix');
            create(possibleModules.RustFreeverb, 'reverb');
            modules['osc1'].connectTo(modules['premix'].inputs.a);
            modules['osc2'].connectTo(modules['premix'].inputs.b);
            modules['osc3'].connectTo(modules['premix'].inputs.c);
            modules['env1'].connectTo(modules['osc1'].inputs.amplitude);
            modules['env2'].connectTo(modules['osc2'].inputs.amplitude);
            modules['env3'].connectTo(modules['dlytr1'].inputs.feedback);
            modules['env3'].connectTo(modules['dlytr2'].inputs.feedback);
            modules['env3'].connectTo(modules['dlytr3'].inputs.feedback);
            modules['env3'].connectTo(modules['dlytr4'].inputs.feedback);
            modules['env3'].connectTo(modules['osc3'].inputs.amplitude);
            modules['env4'].connectTo(modules['dlytr1'].inputs.time);
            modules['env4'].connectTo(modules['dlytr2'].inputs.time);
            modules['env4'].connectTo(modules['dlytr3'].inputs.time);
            modules['env4'].connectTo(modules['dlytr4'].inputs.time);
            modules['env5'].connectTo(modules['osc3'].inputs.frequency);
            modules['env6'].connectTo(modules['osc2'].inputs.frequency);
            modules['premix'].connectTo(modules['dlytr1'].inputs.main);
            modules['premix'].connectTo(modules['dlytr2'].inputs.main);
            modules['premix'].connectTo(modules['dlytr3'].inputs.main);
            modules['premix'].connectTo(modules['dlytr4'].inputs.main);
            modules['dlytr1'].connectTo(modules['postmix'].inputs.a);
            modules['dlytr2'].connectTo(modules['postmix'].inputs.b);
            modules['dlytr3'].connectTo(modules['postmix'].inputs.c);
            modules['dlytr4'].connectTo(modules['postmix'].inputs.d);
            modules['postmix'].connectTo(modules['reverb'].inputs.main);
            modules['osc1'].set({
                'amplitude': 0,
                'bias': 0,
                'length': 1,
                'frequency': null,
                'phase': 0,
                'shape': 'noise'
            });
            modules['osc2'].set({
                'amplitude': 0,
                'bias': 0,
                'length': 1,
                'frequency': 79.8913043478261,
                'phase': 0,
                'shape': 'sin'
            });
            modules['osc3'].set({
                'amplitude': 0,
                'bias': 0,
                'length': 1,
                'frequency': 89.3940256720151,
                'phase': 0.658719819321023,
                'shape': 'sin',
                'interval1': 258.57468995195694,
                'interval2': 1.3772985747286803,
                'interval3': -3.8510361338141097,
                'interval4': 0
            });
            modules['env1'].set({
                'attack': 0.025212143489207313,
                'release': 0.06166357764786329,
                'amplitude': 0.3376072652732335,
                'attackShape': 1.7722005986615141,
                'releaseShape': 1.1498018790343794
            });
            modules['env2'].set({
                'attack': 0.04764885601580023,
                'release': 0.0007713584938956464,
                'amplitude': 0.5570146564547115,
                'attackShape': 1.366335342126122,
                'releaseShape': 0.9551684497546675
            });
            modules['env3'].set({
                'attack': 0.03595600421714794,
                'release': 0.014600548721542829,
                'amplitude': 0.07376990284762179,
                'attackShape': 1.5270942421232387,
                'releaseShape': 0.09331447459444964
            });
            modules['env4'].set({
                'attack': 0.007042176335834311,
                'release': 0.32251544371079716,
                'amplitude': 0.41673513736619255,
                'attackShape': 0.5982036058158341,
                'releaseShape': 1.89143998838994
            });
            modules['env5'].set({
                'attack': 0.019956630584488357,
                'release': 0.5849228986857816,
                'amplitude': 53.08736583712057,
                'attackShape': 1.115873422930361,
                'releaseShape': 1.3000751384820006
            });
            modules['env6'].set({
                'attack': 0.01489634105891588,
                'release': 0.035271037193237445,
                'amplitude': 2754.093595121477,
                'attackShape': 1.6694570385765486,
                'releaseShape': 0.9393106408285539
            });
            modules['premix'].set({
                'amplitude': 1,
                'levela': 0.17426955116456216,
                'levelb': 0.13095916083296522,
                'levelc': 0.25,
                'leveld': 0.25,
                'normalize': true,
                'saturate': true
            });
            modules['dlytr1'].set({
                'feedback': 0.08331473460091304,
                'time': 0.0020345146936090797,
                'dry': 0.4929478486819579,
                'wet': 0.6755025378066609,
                'gain': 0.23655517067959198,
                'reso': 1.1258277896415243,
                'length': 1,
                'type': 'LpMoog',
                'order': 1,
                'frequency': 3645.7375021602156,
                'saturate': false
            });
            modules['dlytr2'].set({
                'feedback': 0.11521120716814275,
                'time': 0.07347742844161263,
                'dry': 0.035925040542592546,
                'wet': 0.764202574100255,
                'gain': 0.0338193983845817,
                'reso': 0.9179328495332797,
                'length': 1,
                'type': 'LpMoog',
                'order': 1,
                'frequency': 688.9262273097185,
                'saturate': false
            });
            modules['dlytr3'].set({
                'feedback': 0.1635123320352257,
                'time': 0.011238880502067717,
                'dry': 0.3517387005239281,
                'wet': 0.9540824163103856,
                'gain': 0.15338281531087383,
                'reso': 1.1286061922795037,
                'length': 1,
                'type': 'LpMoog',
                'order': 1,
                'frequency': 4855.476407563162,
                'saturate': false
            });
            modules['dlytr4'].set({
                'feedback': 0.69974791243754,
                'time': 0.057048333399359843,
                'dry': 0.18813593889317493,
                'wet': 0.9839379726795869,
                'gain': 0.2678461392586635,
                'reso': 0.5495612684630173,
                'length': 1,
                'type': 'LpMoog',
                'order': 1,
                'frequency': 1555.934256161831,
                'saturate': false
            });
            modules['postmix'].set({
                'amplitude': 1,
                'levela': 0.1670822019580443,
                'levelb': 0.18509519774400335,
                'levelc': 0.16237995280779122,
                'leveld': 0.037772959102529646,
                'normalize': true,
                'saturate': false
            });
            modules['reverb'].set({
                'dampening': 0.05308441742396541,
                'freeze': false,
                'wet': 0.7598002854782693,
                'width': 0.8862989000151146,
                'dry': 0.37987433859677244,
                'roomSize': 0.4465728270480428,
                'LROffset': 1
            });
            modules['osc1'].getInterface().autoZoom();
            modules['osc2'].getInterface().autoZoom();
            modules['osc3'].getInterface().autoZoom();
            modules['env1'].getInterface().autoZoom();
            modules['env2'].getInterface().autoZoom();
            modules['env3'].getInterface().autoZoom();
            modules['env4'].getInterface().autoZoom();
            modules['env5'].getInterface().autoZoom();
            modules['env6'].getInterface().autoZoom();
            modules['premix'].getInterface().autoZoom();
            modules['dlytr1'].getInterface().autoZoom();
            modules['dlytr2'].getInterface().autoZoom();
            modules['dlytr3'].getInterface().autoZoom();
            modules['dlytr4'].getInterface().autoZoom();
            modules['postmix'].getInterface().autoZoom();
            modules['reverb'].getInterface().autoZoom();

            //////////////////////////////////////////////////


            ghost.add(env3, "attack", 0, 0.01);
            ghost.add(env4, "attack", 0, 0.01);
            ghost.add(env3, "release", 0, 0.9);
            ghost.add(env4, "release", 0, 0.9);
            ghost.add(env3, "amplitude", 0, 1);
            ghost.add(env4, "amplitude", 0, 1 / 90);



            ghost.add(osc3, 'frequency', 30, 200);
            ghost.add(osc3, 'phase', 0, 1);
            ghost.add(osc3, 'interval1', 0, 300);
            ghost.add(osc3, 'interval2', -15, 15);
            ghost.add(osc3, 'interval3', -10, 10);

            ghost.add(postmix, "levela", 0, 0.25);
            ghost.add(postmix, "levelb", 0, 0.25);
            ghost.add(postmix, "levelc", 0, 0.25);
            ghost.add(postmix, "leveld", 0, 0.25);

            ghost.add(premix, "levela", 0, 0.5);
            ghost.add(premix, "levelb", 0, 0.05);
            ghost.add(premix, "levelc", 0, 0.5);

            ghost.add(env1, 'attack', 0, 0.05);
            ghost.add(env1, 'release', 0, 0.5);
            ghost.add(env1, 'amplitude', 0, 1);
            ghost.add(env1, 'attackShape', 0.01, 2);
            ghost.add(env1, 'releaseShape', 0, 2);

            ghost.add(env2, 'attack', 0, 0.05);
            ghost.add(env2, 'release', 0, 5);
            ghost.add(env2, 'amplitude', 0, 1);
            ghost.add(env2, 'attackShape', 0.01, 2);
            ghost.add(env2, 'releaseShape', 0, 2);

            ghost.add(env3, 'attack', 0.01, 0.05);
            ghost.add(env3, 'release', 0, 0.9);
            ghost.add(env3, 'amplitude', 0, 0.1);
            ghost.add(env3, 'attackShape', 0.01, 2);
            ghost.add(env3, 'releaseShape', 0, 2);

            ghost.add(env4, 'attack', 0, 0.05);
            ghost.add(env4, 'release', 0, 0.9);
            ghost.add(env4, 'amplitude', 0, 0.5);
            ghost.add(env4, 'attackShape', 0.01, 2);
            ghost.add(env4, 'releaseShape', 0, 2);

            ghost.add(env5, 'attack', 0, 0.05);
            ghost.add(env5, 'release', 0, 0.9);
            ghost.add(env5, 'amplitude', 0, 200);
            ghost.add(env5, 'attackShape', 0.01, 2);
            ghost.add(env5, 'releaseShape', 0, 2);

            ghost.add(env6, 'attack', 0, 0.05);
            ghost.add(env6, 'release', 0, 0.9);
            ghost.add(env6, 'amplitude', 0, 5000);
            ghost.add(env6, 'attackShape', 0.01, 2);
            ghost.add(env6, 'releaseShape', 0, 2);

            ghost.add(dlytr1, 'feedback', 0, 0.7);
            ghost.add(dlytr1, 'time', 1e-320, 0.1);
            ghost.add(dlytr1, 'dry', 0, 0.5);
            ghost.add(dlytr1, 'wet', 0, 1);
            ghost.add(dlytr1, 'gain', 0, 1);
            ghost.add(dlytr1, 'reso', 0, 2);
            ghost.add(dlytr1, 'frequency', 50, 5000);


            ghost.add(dlytr2, 'feedback', 0, 0.7);
            ghost.add(dlytr2, 'time', 1e-320, 0.1);
            ghost.add(dlytr2, 'dry', 0, 0.5);
            ghost.add(dlytr2, 'wet', 0, 1);
            ghost.add(dlytr2, 'gain', 0, 1);
            ghost.add(dlytr2, 'reso', 0, 2);
            ghost.add(dlytr2, 'frequency', 50, 5000);

            ghost.add(dlytr3, 'feedback', 0, 0.7);
            ghost.add(dlytr3, 'time', 1e-320, 0.1);
            ghost.add(dlytr3, 'dry', 0, 0.5);
            ghost.add(dlytr3, 'wet', 0, 1);
            ghost.add(dlytr3, 'gain', 0, 1);
            ghost.add(dlytr3, 'reso', 0, 2);
            ghost.add(dlytr3, 'frequency', 50, 5000);

            ghost.add(dlytr4, 'feedback', 0, 0.7);
            ghost.add(dlytr4, 'time', 1e-320, 0.1);
            ghost.add(dlytr4, 'dry', 0, 0.5);
            ghost.add(dlytr4, 'wet', 0, 1);
            ghost.add(dlytr4, 'gain', 0, 1);
            ghost.add(dlytr4, 'reso', 0, 2);
            ghost.add(dlytr4, 'frequency', 50, 5000);

            dlytr1.connectTo(postmix.inputs.a);
            dlytr2.connectTo(postmix.inputs.b);
            dlytr3.connectTo(postmix.inputs.c);
            dlytr4.connectTo(postmix.inputs.d);


            ghost.add(reverb, 'dampening', 0, 1);
            ghost.add(reverb, 'wet', 0, 1);
            ghost.add(reverb, 'width', 0, 1);
            ghost.add(reverb, 'dry', 0, 1);
            ghost.add(reverb, 'roomSize', 0, 1);

            window.randomize = (() => {
                ghost.generateRandom();
                setTimeout(() => {
                    Object.keys(modules).forEach((key) => modules[key].getInterface().autoZoom());
                }, 5);

            });


            setTimeout(() => {
                window.randomize();
            }, 10);
        },
        "harmosc": () => {
            create(possibleModules.Mixer, 'main');
            create(possibleModules.Filter, 'c1');
            create(possibleModules.HarmonicsOscillator, 'harmosc');
            create(possibleModules.EnvelopeAttackRelease, 'env1');
            create(possibleModules.EnvelopeAttackRelease, 'env2');
            create(possibleModules.Oscillator, 'dither');
            modules['c1'].connectTo(modules['main'].inputs.a);
            modules['harmosc'].connectTo(modules['c1'].inputs.main);
            modules['harmosc'].connectTo(modules['main'].inputs.b);
            modules['env1'].connectTo(modules['harmosc'].inputs.mixCurve);
            modules['env2'].connectTo(modules['harmosc'].inputs.amplitude);
            modules['dither'].connectTo(modules['main'].inputs.c);
            modules['main'].set({
                'amplitude': 1,
                'levela': 1.25,
                'levelb': 0,
                'levelc': 0.0009,
                'leveld': 0,
                'normalize': true,
                'saturate': true
            });
            modules['c1'].set({
                'gain': 1.08,
                'reso': 1.6600000000000001,
                'type': 'Comb',
                'order': 1,
                'frequency': 145.75223687797694,
                'saturate': true
            });
            modules['harmosc'].set({
                'amplitude': 0,
                'bias': 0,
                'length': 1,
                'frequency': 46.394377931661744,
                'phase': 0,
                'shape': 'sin',
                'mixCurve': -1,
                'interval1': 0,
                'interval2': 2.14,
                'interval3': -1.2400000000000002,
                'interval4': 0
            });
            modules['env1'].set({
                'attack': 0.005079365079365079,
                'release': 0.20507936507936506,
                'amplitude': -0.8,
                'attackShape': 1,
                'releaseShape': 1.17,
                'bias': 0,
                'length': 1,
                'points': [],
                'loop': false
            });
            modules['env2'].set({
                'attack': 0.0163718820861678,
                'release': 0.8717460317460317,
                'amplitude': 2.0666666666666664,
                'attackShape': 1,
                'releaseShape': 2.27,
                'bias': 0,
                'length': 1,
                'points': [],
                'loop': false
            });
            modules['dither'].set({
                'amplitude': 1,
                'bias': 0,
                'length': 1,
                'frequency': 2,
                'phase': 0,
                'shape': 'noise'
            });
            modules['main'].getInterface().autoZoom();
            modules['c1'].getInterface().autoZoom();
            modules['harmosc'].getInterface().autoZoom();
            modules['env1'].getInterface().autoZoom();
            modules['env2'].getInterface().autoZoom();
            modules['dither'].getInterface().autoZoom();

            harmosc.onUpdate((changes) => {
                if (changes.frequency) {
                    c1.set({ frequency: changes.frequency * Math.PI });
                }
            })

            window.randomize = function () {
                harmosc.setFrequency(Math.random() * 70);
                env1.set({ attack: Math.random() / 100 });
            }

            window.randomize();

        },
        "harmosc2": () => {
            create(possibleModules.Mixer, 'main');
            create(possibleModules.Filter, 'c1');
            create(possibleModules.HarmonicsOscillator, 'harmosc');
            create(possibleModules.EnvelopeAttackRelease, 'env1');
            create(possibleModules.EnvelopeAttackRelease, 'env2');
            create(possibleModules.Oscillator, 'dither');
            modules['c1'].connectTo(modules['main'].inputs.a);
            modules['harmosc'].connectTo(modules['c1'].inputs.main);
            modules['harmosc'].connectTo(modules['main'].inputs.b);
            modules['env1'].connectTo(modules['harmosc'].inputs.mixCurve);
            modules['env2'].connectTo(modules['harmosc'].inputs.amplitude);
            modules['dither'].connectTo(modules['main'].inputs.c);
            modules['main'].set({
                'amplitude': 1,
                'levela': 1.25,
                'levelb': 0,
                'levelc': 0.0009,
                'leveld': 0,
                'normalize': true,
                'saturate': true
            });
            modules['c1'].set({
                'gain': 1.08,
                'reso': 1.6600000000000001,
                'type': 'Comb',
                'order': 1,
                'frequency': 150.93061009012172,
                'saturate': true
            });
            modules['harmosc'].set({
                'amplitude': 0,
                'bias': 0,
                'length': 1,
                'frequency': 48.042705319436735,
                'phase': 0,
                'shape': 'sin',
                'mixCurve': -1,
                'interval1': 0,
                'interval2': 0.56,
                'interval3': -1.2400000000000002,
                'interval4': 0
            });
            modules['env1'].set({
                'attack': 0.001181828421363873,
                'release': 0.20507936507936506,
                'amplitude': -0.8,
                'attackShape': 1,
                'releaseShape': 1.17,
                'bias': 0,
                'length': 1,
                'points': [],
                'loop': false
            });
            modules['env2'].set({
                'attack': 0.0163718820861678,
                'release': 0.8717460317460317,
                'amplitude': 2.0666666666666664,
                'attackShape': 1,
                'releaseShape': 2.27,
                'bias': 0,
                'length': 1,
                'points': [],
                'loop': false
            });
            modules['dither'].set({
                'amplitude': 1,
                'bias': 0,
                'length': 1,
                'frequency': 2,
                'phase': 0,
                'shape': 'noise'
            });
            modules['main'].getInterface().autoZoom();
            modules['c1'].getInterface().autoZoom();
            modules['harmosc'].getInterface().autoZoom();
            modules['env1'].getInterface().autoZoom();
            modules['env2'].getInterface().autoZoom();
            modules['dither'].getInterface().autoZoom();


            harmosc.onUpdate((changes) => {
                if (changes.frequency) {
                    c1.set({ frequency: changes.frequency * Math.PI });
                }
            })

            window.randomize = function () {
                harmosc.setFrequency(Math.random() * 70);
                env1.set({ attack: Math.random() / 100 });
            }

            window.randomize();

        },
        "harmosc3": () => {
            create(possibleModules.MixerTesselator, 'main');
            create(possibleModules.Repeater, 'arr1');
            create(possibleModules.Mixer, 'norm1');
            create(possibleModules.Filter, 'c1');
            create(possibleModules.HarmonicsOscillator, 'harmosc');
            create(possibleModules.EnvelopeAttackRelease, 'env1');
            create(possibleModules.EnvelopeAttackRelease, 'env2');
            create(possibleModules.Oscillator, 'dither');
            modules['arr1'].connectTo(modules['main'].inputs.a);
            modules['norm1'].connectTo(modules['arr1'].inputs.main);
            modules['c1'].connectTo(modules['norm1'].inputs.a);
            modules['harmosc'].connectTo(modules['c1'].inputs.main);
            modules['harmosc'].connectTo(modules['norm1'].inputs.b);
            modules['env1'].connectTo(modules['harmosc'].inputs.mixCurve);
            modules['env2'].connectTo(modules['harmosc'].inputs.amplitude);
            modules['dither'].connectTo(modules['norm1'].inputs.c);
            modules['main'].set({
                'amplitude': 1,
                'levela': 1,
                'levelb': 0.5,
                'levelc': 0.5,
                'leveld': 0.5
            });
            modules['arr1'].set({
                'length': 2,
                'points': [
                    [
                        0,
                        0
                    ],
                    [
                        5419,
                        0.6
                    ],
                    [
                        11484,
                        0.36666666666666664
                    ],
                    [
                        16774,
                        0.5833333333333334
                    ],
                    [
                        27484,
                        0.35
                    ],
                    [
                        38584,
                        0.7666666666666666
                    ],
                    [
                        54839,
                        0.7833333333333333
                    ],
                    [
                        61892,
                        0.11666666666666667
                    ],
                    [
                        66013,
                        0.7833333333333333
                    ],
                    [
                        77168,
                        0.7666666666666666
                    ],
                    [
                        82680,
                        0.2
                    ]
                ],
                'monophonic': false,
                'gain': 1,
                'loop': false
            });
            modules['norm1'].set({
                'amplitude': 1,
                'levela': 1.25,
                'levelb': 0,
                'levelc': 0.0009,
                'leveld': 0,
                'normalize': true,
                'saturate': true
            });
            modules['c1'].set({
                'gain': 1.08,
                'reso': 1.6600000000000001,
                'type': 'Comb',
                'order': 1,
                'frequency': 145.62530186732005,
                'saturate': true
            });
            modules['harmosc'].set({
                'amplitude': 0,
                'bias': 0,
                'length': 1,
                'frequency': 46.35397326286681,
                'phase': 0,
                'shape': 'sin',
                'mixCurve': -1,
                'interval1': 0,
                'interval2': 0.56,
                'interval3': -2.220446049250313e-16,
                'interval4': 0
            });
            modules['env1'].set({
                'attack': 0.0019629513326952786,
                'release': 0.20507936507936506,
                'amplitude': -0.8,
                'attackShape': 1,
                'releaseShape': 1.17,
                'bias': 0,
                'length': 1,
                'points': [],
                'loop': false
            });
            modules['env2'].set({
                'attack': 0,
                'release': 0.8717460317460317,
                'amplitude': 2.0666666666666664,
                'attackShape': 1,
                'releaseShape': 2.27,
                'bias': 0,
                'length': 1,
                'points': [],
                'loop': false
            });
            modules['dither'].set({
                'amplitude': 1,
                'bias': 0,
                'length': 1,
                'frequency': 2,
                'phase': 0,
                'shape': 'noise'
            });
            modules['main'].getInterface().autoZoom();
            modules['arr1'].getInterface().autoZoom();
            modules['norm1'].getInterface().autoZoom();
            modules['c1'].getInterface().autoZoom();
            modules['harmosc'].getInterface().autoZoom();
            modules['env1'].getInterface().autoZoom();
            modules['env2'].getInterface().autoZoom();
            modules['dither'].getInterface().autoZoom();




            ///////////////////////

            harmosc.onUpdate((changes) => {
                if (changes.frequency) {
                    c1.set({ frequency: changes.frequency * Math.PI });
                }
            })

            window.randomize = function () {
                harmosc.setFrequency(Math.random() * 70 + 30);
            }

            let env1lfoCount = 0;
            setInterval(() => {
                env1lfoCount += 1 / 900;
                env1.set({
                    attack: (Math.sin(env1lfoCount * Math.PI * 5) + 1) / 1000,
                    amplitude: Math.cos(env1lfoCount * Math.PI * 7) * 1.8,
                });

            }, 300);

            window.randomize();

        },
        "wushiu": () => {
            let env = create(possibleModules.EnvelopeGenerator, 'env');
            let env1 = create(possibleModules.EnvelopeAttackRelease, 'env1');
            let wav = create(possibleModules.WaveFolder, 'wav');
            let rus = create(possibleModules.RustComb, 'rus');
            env1.outputs.main.connectTo(wav.inputs.main);
            wav.outputs.main.connectTo(rus.inputs.main);
            env.set({
                'amplitude': 1,
                'bias': 0,
                'length': 1,
                'points': [],
                'loop': false
            });
            env1.set({
                'attack': 0.31267573696145123,
                'release': 0.35176870748299316,
                'amplitude': 96.4896738277456,
                'attackShape': 0.14,
                'releaseShape': 0.15999999999999923
            });
            wav.set({
                'amplitude': 1,
                'bias': 0,
                'fold': 1
            });
            rus.set({
                'frequency': 365.8888888888889,
                'dampening_inverse': 0.21999999999999995,
                'dampening': 0.77,
                'feedback': 0.9
            });
            env.getInterface().autoZoom();
            env1.getInterface().autoZoom();
            wav.getInterface().autoZoom();
            rus.getInterface().autoZoom();
        },
        "seceretcumbia": ()=>{
            let osc2 = create(possibleModules.Oscillator,'osc2');
        let fil = create(possibleModules.Filter,'fil');
        let rus = create(possibleModules.RustFreeverb,'rus');
        let rus7 = create(possibleModules.RustComb,'rus7');
        let vol = create(possibleModules.VoltsPerOctaveToHertz,'vol');
        let osc = create(possibleModules.Oscillator,'osc');
        osc2.outputs.main.connectTo(fil.inputs.main);
        fil.outputs.main.connectTo(rus.inputs.main);
        rus.outputs.main.connectTo(rus7.inputs.main);
        rus7.outputs.main.connectTo(vol.inputs.main);
        rus7.outputs.main.connectTo(osc.inputs.amplitude);
        vol.outputs.main.connectTo(osc.inputs.frequency);
        osc2.set({
          'amplitude': 1.35,
          'bias': 1.8900000000000003,
          'length': 1,
          'frequency': 2,
          'phase': 0,
          'shape': 'square'
        });
        fil.set({
          'gain': 0.75,
          'reso': 3.38,
          'type': 'LpMoog',
          'order': 3,
          'frequency': 408.44444444444423,
          'saturate': false
        });
        rus.set({
          'dampening': 0.9999999999999999,
          'freeze': true,
          'wet': -0.3100000000000003,
          'width': 1.7100000000000002,
          'dry': 1.1900000000000002,
          'roomSize': 0.6000000000000001,
          'LROffset': 1.85
        });
        rus7.set({
          'frequency': 59.55555555555556,
          'dampening_inverse': 0.6199999999999999,
          'dampening': 0.52,
          'feedback': -0.6400000000000001
        });
        vol.set({
          'preamp': 1,
          'center': 146.78000000000003
        });
        osc.set({
          'amplitude': -8.673617379884035e-18,
          'bias': 0,
          'length': 1,
          'frequency': 2,
          'phase': 0,
          'shape': 'sin'
        });
        osc2.getInterface().autoZoom();
        fil.getInterface().autoZoom();
        rus.getInterface().autoZoom();
        rus7.getInterface().autoZoom();
        vol.getInterface().autoZoom();
        osc.getInterface().autoZoom();
        },
        "wiwu": () => {
            create(possibleModules.HarmonicsOscillator, 'harmosc');
            create(possibleModules.EnvelopeGenerator, 'timbrenv');
            create(possibleModules.Oscillator, 'osclltr2');
            create(possibleModules.MixerTesselator, 'mxrltr3');
            modules['harmosc'].connectTo(modules['mxrltr3'].inputs.a);
            modules['timbrenv'].connectTo(modules['harmosc'].inputs.interval2);
            modules['osclltr2'].connectTo(modules['harmosc'].inputs.frequency);
            modules['harmosc'].set({
                'amplitude': 1,
                'bias': 0,
                'length': 1,
                'frequency': 105.55555555555564,
                'phase': 0,
                'shape': 'sin',
                'interval1': 0,
                'interval2': 1,
                'interval3': 0,
                'interval4': 0,
                'interval0': 0
            });
            modules['timbrenv'].set({
                'amplitude': 1,
                'bias': 0,
                'length': 1.93,
                'points': [
                    [
                        19,
                        -11.325735319544375
                    ],
                    [
                        85,
                        9.455989716159985
                    ]
                ],
                'loop': true
            });
            modules['osclltr2'].set({
                'amplitude': 34.28,
                'bias': 0,
                'length': 1,
                'frequency': 1,
                'phase': 0,
                'shape': 'sin'
            });
            modules['mxrltr3'].set({
                'amplitude': 1,
                'levela': 0.6399999999999999,
                'levelb': 0.25,
                'levelc': 0.5,
                'leveld': 0.5
            });
            modules['harmosc'].getInterface().autoZoom();
            modules['timbrenv'].getInterface().autoZoom();
            modules['osclltr2'].getInterface().autoZoom();
            modules['mxrltr3'].getInterface().autoZoom();
        },
        "kik": () => {
            create(possibleModules.Oscillator, 'osc1');
            create(possibleModules.EnvelopeAttackRelease, 'env1');
            create(possibleModules.EnvelopeAttackRelease, 'env2');
            modules['env1'].connectTo(modules['osc1'].inputs.amplitude);
            modules['env2'].connectTo(modules['osc1'].inputs.frequency);
            modules['osc1'].set({
                'amplitude': 0,
                'bias': 0,
                'length': 1,
                'frequency': 1.7777777777777781,
                'phase': 0,
                'shape': 'sin',
            });
            modules['env1'].set({
                'attack': 0.026961451247165532,
                'release': 0.337437641723356,
                'amplitude': 0.457793034018502,
                'attackShape': 1,
                'releaseShape': 0.42000000000000015
            });
            modules['env2'].set({
                'attack': 0.011111111111111112,
                'release': 0.20002267573696147,
                'amplitude': 200.27912293593687,
                'attackShape': 0.6799999999999999,
                'releaseShape': 4.880000000000001
            });
            setTimeout(() => {
                modules['osc1'].getInterface().autoZoom();
                modules['env1'].getInterface().autoZoom();
                modules['env2'].getInterface().autoZoom();
            }, 200);
        },
        "nicetimbres": () => {


            const randomnum = () => Math.round(Math.random() * 10 - 5) / 10

            create(possibleModules.HarmonicsOscillator, 'harmosc');
            create(possibleModules.EnvelopeGenerator, 'timbrenv');

            // modules['timbrenv'].connectTo(modules['harmosc'].inputs.interval2);
            // modules['timbrenv'].connectTo(modules['harmosc'].inputs.interval3);

            modules['harmosc'].set({
                'amplitude': 1,
                'bias': 0,
                'length': 0.2,
                'frequency': 110,
                'phase': 0,
                'shape': 'sin',
                'interval1': 0,
                'interval2': randomnum(),
                'interval3': randomnum(),
                'interval4': 0,
            });
            modules['timbrenv'].set({
                'amplitude': 1,
                'bias': 0,
                'length': 2,
                'points': [
                    [
                        0,
                        randomnum()
                    ],
                    [
                        88200,
                        randomnum()
                    ]
                ],
                'loop': false,
            });
            setTimeout(() => {
                modules['harmosc'].getInterface().autoZoom();
                modules['timbrenv'].getInterface().autoZoom();
            }, 100);
        },
        "percpat": () => {
            create(possibleModules.HarmonicsOscillator, 'harmosc1');
            create(possibleModules.EnvelopeAttackRelease, 'env1');
            create(possibleModules.EnvelopeAttackRelease, 'env2');
            create(possibleModules.Filter, 'lfoshpr2');
            create(possibleModules.Filter, 'lfoshpr');
            create(possibleModules.Oscillator, 'lfo1');
            modules['env1'].connectTo(modules['harmosc1'].inputs.interval2);
            modules['lfoshpr2'].connectTo(modules['harmosc1'].inputs.amplitude);
            modules['lfoshpr'].connectTo(modules['lfoshpr2'].inputs.main);
            modules['lfo1'].connectTo(modules['lfoshpr'].inputs.main);
            modules['harmosc1'].set({
                'amplitude': 0,
                'bias': 0,
                'length': 4,
                'frequency': 80,
                'phase': 0,
                'shape': 'sin',
                'interval1': 0,
                'interval2': 0,
                'interval3': 0,
                'interval4': 0
            });
            modules['env1'].set({
                'attack': -0.012653061224489797,
                'release': 3.8814285714285712,
                'amplitude': 0.6666666666666666,
                'attackShape': 1,
                'releaseShape': 1
            });
            modules['env2'].set({
                'attack': 0.1,
                'release': 0.9,
                'amplitude': 1,
                'attackShape': 1,
                'releaseShape': 1
            });
            modules['lfoshpr2'].set({
                'gain': 1,
                'reso': 0.2,
                'type': 'LpMoog',
                'order': 1,
                'frequency': 486.7777777777778,
                'saturate': true
            });
            modules['lfoshpr'].set({
                'gain': 2.65,
                'reso': 0.2,
                'type': 'HpBoxcar',
                'order': 1,
                'frequency': 87.44444444444443,
                'saturate': true
            });
            modules['lfo1'].set({
                'amplitude': 0.010000000000000009,
                'bias': 0,
                'length': 4,
                'frequency': 2,
                'phase': 0,
                'shape': 'ramp'
            });
            modules['harmosc1'].getInterface().autoZoom();
            modules['env1'].getInterface().autoZoom();
            modules['env2'].getInterface().autoZoom();
            modules['lfoshpr2'].getInterface().autoZoom();
            modules['lfoshpr'].getInterface().autoZoom();
            modules['lfo1'].getInterface().autoZoom();

        }
    }

    const appendTo = document.getElementById("demo-buttons");
    if(!appendTo) throw new Error("div with id 'demo-buttons' missing");

    let hashBefore = window.location.hash;

    const hashchange = () => {
        if (window.location.hash) {
            let hashval = window.location.hash.slice(1);
            if (demos[hashval]) {
                console.log("trying load of", hashval);
                demos[hashval]();
            }else{
                console.log("nonexisting demo named",hashval);
            }
        } else {
            if (hashBefore) {

            }
        }
    }

    window.addEventListener('DOMContentLoaded', hashchange);

    window.addEventListener("hashchange", hashchange);

    window.onpopstate = () => window.location.reload();
    
    Object.keys(demos).forEach((name)=>{
        appendTo.innerHTML+=(`<a class="tag" href="#${name}">${name}</a>`);
    });
}

/* harmony default export */ const src_demoLibrary = (demoLibrary);


;// CONCATENATED MODULE: ./src/index.js
//DOM gui







//other interfaces



//atches etc





const src_ghost = new src_Ghost();

window.ghost=src_ghost;

const rustProcessor = rust_RustProcessor.get();

rustProcessor.onReady((rustProcessor) => {
    console.log("1+2=", rustProcessor.add(1, 2));
    console.log("sine", rustProcessor.arrGenSin(0.5, 2));
});

const drawBoard = new SVGElements.SVGCanvas({width:"100%",height:"10000px"});
const navBoard = new SVGElements.SVGCanvas({width:"100%",height:"10000px"});
drawBoard.addClass("drawboard");
navBoard.addClass("nav");
document.body.appendChild(drawBoard.domElement);
document.body.appendChild(navBoard.domElement);


const liveCodingInterface = new src_LiveCodingInterface({
    drawBoard
});

const buttonsBoard = new DOMElements_Div();
const liveCodingInterfaceGuiHelper = new GuiHelper({liveCodingInterface});
buttonsBoard.add(liveCodingInterfaceGuiHelper);
document.body.appendChild(liveCodingInterfaceGuiHelper.domElement);

const patchDisplay = new DomInterfaces_PatchDisplay(drawBoard);

const timeZoomer = new DomInterfaces_TimeZoomer();
navBoard.add(timeZoomer);

const player = new scaffolding_SoundPlayer();
const downloader = new scaffolding_SoundDownloader();

const lanesGroup = new SVGElements.SVGGroup();
lanesGroup.addClass("lanes-group");

liveCodingInterface.onModuleCreated((newModule, newInterface, count) => {
    patchDisplay.appendModules(newModule);
    player.appendModule(newModule);
    downloader.appendModule(newModule);
    lanesGroup.add(newInterface);
});

drawBoard.add(lanesGroup,patchDisplay);

Interactive_Draggable.setCanvas();



src_demoLibrary();

setTimeout(() => {
    //prevent an anoying message casted by the current dev server.
    window.socket = () => { }

}, 500);

/***/ }),

/***/ 525:
/***/ ((module) => {


/**
 * @typedef {Object} timeInterval
 * @property {number} end
 * @property {number} start
 * @property {number} duration
 */

/** @returns {timeInterval} */
const measureExec=(cb)=>{

    let ret = {}
    ret.start = performance.now();
    cb();
    ret.end = performance.now();
    ret.duration = ret.end-ret.start;
    return ret;
    
}

module.exports = measureExec;

/***/ }),

/***/ 461:
/***/ ((module) => {

const requireParameter = function(param, friendlyName=undefined){
    if(param===undefined){
        if(friendlyName){
            throw new Error("required parameter ("+friendlyName+") value is "+param);
        }else{
            throw new Error("required parameter value is "+param);
        }
    }
}
module.exports = requireParameter;

/***/ }),

/***/ 42:
/***/ (() => {

/* (ignored) */

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			id: moduleId,
/******/ 			loaded: false,
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = __webpack_modules__;
/******/ 	
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = __webpack_module_cache__;
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/amd define */
/******/ 	(() => {
/******/ 		__webpack_require__.amdD = function () {
/******/ 			throw new Error('define cannot be used indirect');
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/amd options */
/******/ 	(() => {
/******/ 		__webpack_require__.amdO = {};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/ensure chunk */
/******/ 	(() => {
/******/ 		__webpack_require__.f = {};
/******/ 		// This file contains only the entry chunk.
/******/ 		// The chunk loading function for additional chunks
/******/ 		__webpack_require__.e = (chunkId) => {
/******/ 			return Promise.all(Object.keys(__webpack_require__.f).reduce((promises, key) => {
/******/ 				__webpack_require__.f[key](chunkId, promises);
/******/ 				return promises;
/******/ 			}, []));
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/get javascript chunk filename */
/******/ 	(() => {
/******/ 		// This function allow to reference async chunks
/******/ 		__webpack_require__.u = (chunkId) => {
/******/ 			// return url for filenames based on template
/******/ 			return "" + chunkId + ".main.js";
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/global */
/******/ 	(() => {
/******/ 		__webpack_require__.g = (function() {
/******/ 			if (typeof globalThis === 'object') return globalThis;
/******/ 			try {
/******/ 				return this || new Function('return this')();
/******/ 			} catch (e) {
/******/ 				if (typeof window === 'object') return window;
/******/ 			}
/******/ 		})();
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/harmony module decorator */
/******/ 	(() => {
/******/ 		__webpack_require__.hmd = (module) => {
/******/ 			module = Object.create(module);
/******/ 			if (!module.children) module.children = [];
/******/ 			Object.defineProperty(module, 'exports', {
/******/ 				enumerable: true,
/******/ 				set: () => {
/******/ 					throw new Error('ES Modules may not assign module.exports or exports.*, Use ESM export syntax, instead: ' + module.id);
/******/ 				}
/******/ 			});
/******/ 			return module;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/load script */
/******/ 	(() => {
/******/ 		var inProgress = {};
/******/ 		var dataWebpackPrefix = "fields:";
/******/ 		// loadScript function to load a script via script tag
/******/ 		__webpack_require__.l = (url, done, key, chunkId) => {
/******/ 			if(inProgress[url]) { inProgress[url].push(done); return; }
/******/ 			var script, needAttach;
/******/ 			if(key !== undefined) {
/******/ 				var scripts = document.getElementsByTagName("script");
/******/ 				for(var i = 0; i < scripts.length; i++) {
/******/ 					var s = scripts[i];
/******/ 					if(s.getAttribute("src") == url || s.getAttribute("data-webpack") == dataWebpackPrefix + key) { script = s; break; }
/******/ 				}
/******/ 			}
/******/ 			if(!script) {
/******/ 				needAttach = true;
/******/ 				script = document.createElement('script');
/******/ 		
/******/ 				script.charset = 'utf-8';
/******/ 				script.timeout = 120;
/******/ 				if (__webpack_require__.nc) {
/******/ 					script.setAttribute("nonce", __webpack_require__.nc);
/******/ 				}
/******/ 				script.setAttribute("data-webpack", dataWebpackPrefix + key);
/******/ 				script.src = url;
/******/ 			}
/******/ 			inProgress[url] = [done];
/******/ 			var onScriptComplete = (prev, event) => {
/******/ 				// avoid mem leaks in IE.
/******/ 				script.onerror = script.onload = null;
/******/ 				clearTimeout(timeout);
/******/ 				var doneFns = inProgress[url];
/******/ 				delete inProgress[url];
/******/ 				script.parentNode && script.parentNode.removeChild(script);
/******/ 				doneFns && doneFns.forEach((fn) => (fn(event)));
/******/ 				if(prev) return prev(event);
/******/ 			}
/******/ 			;
/******/ 			var timeout = setTimeout(onScriptComplete.bind(null, undefined, { type: 'timeout', target: script }), 120000);
/******/ 			script.onerror = onScriptComplete.bind(null, script.onerror);
/******/ 			script.onload = onScriptComplete.bind(null, script.onload);
/******/ 			needAttach && document.head.appendChild(script);
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/node module decorator */
/******/ 	(() => {
/******/ 		__webpack_require__.nmd = (module) => {
/******/ 			module.paths = [];
/******/ 			if (!module.children) module.children = [];
/******/ 			return module;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/publicPath */
/******/ 	(() => {
/******/ 		var scriptUrl;
/******/ 		if (__webpack_require__.g.importScripts) scriptUrl = __webpack_require__.g.location + "";
/******/ 		var document = __webpack_require__.g.document;
/******/ 		if (!scriptUrl && document) {
/******/ 			if (document.currentScript)
/******/ 				scriptUrl = document.currentScript.src
/******/ 			if (!scriptUrl) {
/******/ 				var scripts = document.getElementsByTagName("script");
/******/ 				if(scripts.length) scriptUrl = scripts[scripts.length - 1].src
/******/ 			}
/******/ 		}
/******/ 		// When supporting browsers where an automatic publicPath is not supported you must specify an output.publicPath manually via configuration
/******/ 		// or pass an empty string ("") and set the __webpack_public_path__ variable from your code to use your own logic.
/******/ 		if (!scriptUrl) throw new Error("Automatic publicPath is not supported in this browser");
/******/ 		scriptUrl = scriptUrl.replace(/#.*$/, "").replace(/\?.*$/, "").replace(/\/[^\/]+$/, "/");
/******/ 		__webpack_require__.p = scriptUrl;
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/jsonp chunk loading */
/******/ 	(() => {
/******/ 		__webpack_require__.b = document.baseURI || self.location.href;
/******/ 		
/******/ 		// object to store loaded and loading chunks
/******/ 		// undefined = chunk not loaded, null = chunk preloaded/prefetched
/******/ 		// [resolve, reject, Promise] = chunk loading, 0 = chunk loaded
/******/ 		var installedChunks = {
/******/ 			179: 0
/******/ 		};
/******/ 		
/******/ 		__webpack_require__.f.j = (chunkId, promises) => {
/******/ 				// JSONP chunk loading for javascript
/******/ 				var installedChunkData = __webpack_require__.o(installedChunks, chunkId) ? installedChunks[chunkId] : undefined;
/******/ 				if(installedChunkData !== 0) { // 0 means "already installed".
/******/ 		
/******/ 					// a Promise means "currently loading".
/******/ 					if(installedChunkData) {
/******/ 						promises.push(installedChunkData[2]);
/******/ 					} else {
/******/ 						if(true) { // all chunks have JS
/******/ 							// setup Promise in chunk cache
/******/ 							var promise = new Promise((resolve, reject) => (installedChunkData = installedChunks[chunkId] = [resolve, reject]));
/******/ 							promises.push(installedChunkData[2] = promise);
/******/ 		
/******/ 							// start chunk loading
/******/ 							var url = __webpack_require__.p + __webpack_require__.u(chunkId);
/******/ 							// create error before stack unwound to get useful stacktrace later
/******/ 							var error = new Error();
/******/ 							var loadingEnded = (event) => {
/******/ 								if(__webpack_require__.o(installedChunks, chunkId)) {
/******/ 									installedChunkData = installedChunks[chunkId];
/******/ 									if(installedChunkData !== 0) installedChunks[chunkId] = undefined;
/******/ 									if(installedChunkData) {
/******/ 										var errorType = event && (event.type === 'load' ? 'missing' : event.type);
/******/ 										var realSrc = event && event.target && event.target.src;
/******/ 										error.message = 'Loading chunk ' + chunkId + ' failed.\n(' + errorType + ': ' + realSrc + ')';
/******/ 										error.name = 'ChunkLoadError';
/******/ 										error.type = errorType;
/******/ 										error.request = realSrc;
/******/ 										installedChunkData[1](error);
/******/ 									}
/******/ 								}
/******/ 							};
/******/ 							__webpack_require__.l(url, loadingEnded, "chunk-" + chunkId, chunkId);
/******/ 						} else installedChunks[chunkId] = 0;
/******/ 					}
/******/ 				}
/******/ 		};
/******/ 		
/******/ 		// no prefetching
/******/ 		
/******/ 		// no preloaded
/******/ 		
/******/ 		// no HMR
/******/ 		
/******/ 		// no HMR manifest
/******/ 		
/******/ 		// no on chunks loaded
/******/ 		
/******/ 		// install a JSONP callback for chunk loading
/******/ 		var webpackJsonpCallback = (parentChunkLoadingFunction, data) => {
/******/ 			var [chunkIds, moreModules, runtime] = data;
/******/ 			// add "moreModules" to the modules object,
/******/ 			// then flag all "chunkIds" as loaded and fire callback
/******/ 			var moduleId, chunkId, i = 0;
/******/ 			for(moduleId in moreModules) {
/******/ 				if(__webpack_require__.o(moreModules, moduleId)) {
/******/ 					__webpack_require__.m[moduleId] = moreModules[moduleId];
/******/ 				}
/******/ 			}
/******/ 			if(runtime) runtime(__webpack_require__);
/******/ 			if(parentChunkLoadingFunction) parentChunkLoadingFunction(data);
/******/ 			for(;i < chunkIds.length; i++) {
/******/ 				chunkId = chunkIds[i];
/******/ 				if(__webpack_require__.o(installedChunks, chunkId) && installedChunks[chunkId]) {
/******/ 					installedChunks[chunkId][0]();
/******/ 				}
/******/ 				installedChunks[chunkIds[i]] = 0;
/******/ 			}
/******/ 		
/******/ 		}
/******/ 		
/******/ 		var chunkLoadingGlobal = self["webpackChunkfields"] = self["webpackChunkfields"] || [];
/******/ 		chunkLoadingGlobal.forEach(webpackJsonpCallback.bind(null, 0));
/******/ 		chunkLoadingGlobal.push = webpackJsonpCallback.bind(null, chunkLoadingGlobal.push.bind(chunkLoadingGlobal));
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/wasm chunk loading */
/******/ 	(() => {
/******/ 		// object to store loaded and loading wasm modules
/******/ 		var installedWasmModules = {};
/******/ 		
/******/ 		function promiseResolve() { return Promise.resolve(); }
/******/ 		
/******/ 		var wasmImportedFuncCache0;
/******/ 		var wasmImportObjects = {
/******/ 			637: function() {
/******/ 				return {
/******/ 					"./index_bg.js": {
/******/ 						"__wbindgen_throw": function(p0i32,p1i32) {
/******/ 							if(wasmImportedFuncCache0 === undefined) wasmImportedFuncCache0 = __webpack_require__.c[37].exports;
/******/ 							return wasmImportedFuncCache0["Or"](p0i32,p1i32);
/******/ 						}
/******/ 					}
/******/ 				};
/******/ 			},
/******/ 		};
/******/ 		
/******/ 		var wasmModuleMap = {
/******/ 			"80": [
/******/ 				637
/******/ 			]
/******/ 		};
/******/ 		
/******/ 		// object with all WebAssembly.instance exports
/******/ 		__webpack_require__.w = {};
/******/ 		
/******/ 		// Fetch + compile chunk loading for webassembly
/******/ 		__webpack_require__.f.wasm = function(chunkId, promises) {
/******/ 		
/******/ 			var wasmModules = wasmModuleMap[chunkId] || [];
/******/ 		
/******/ 			wasmModules.forEach(function(wasmModuleId, idx) {
/******/ 				var installedWasmModuleData = installedWasmModules[wasmModuleId];
/******/ 		
/******/ 				// a Promise means "currently loading" or "already loaded".
/******/ 				if(installedWasmModuleData)
/******/ 					promises.push(installedWasmModuleData);
/******/ 				else {
/******/ 					var importObject = wasmImportObjects[wasmModuleId]();
/******/ 					var req = fetch(__webpack_require__.p + "" + {"80":{"637":"4aada2722c9d8a351195"}}[chunkId][wasmModuleId] + ".module.wasm");
/******/ 					var promise;
/******/ 					if(importObject instanceof Promise && typeof WebAssembly.compileStreaming === 'function') {
/******/ 						promise = Promise.all([WebAssembly.compileStreaming(req), importObject]).then(function(items) {
/******/ 							return WebAssembly.instantiate(items[0], items[1]);
/******/ 						});
/******/ 					} else if(typeof WebAssembly.instantiateStreaming === 'function') {
/******/ 						promise = WebAssembly.instantiateStreaming(req, importObject);
/******/ 					} else {
/******/ 						var bytesPromise = req.then(function(x) { return x.arrayBuffer(); });
/******/ 						promise = bytesPromise.then(function(bytes) {
/******/ 							return WebAssembly.instantiate(bytes, importObject);
/******/ 						});
/******/ 					}
/******/ 					promises.push(installedWasmModules[wasmModuleId] = promise.then(function(res) {
/******/ 						return __webpack_require__.w[wasmModuleId] = (res.instance || res).exports;
/******/ 					}));
/******/ 				}
/******/ 			});
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// module cache are used so entry inlining is disabled
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	var __webpack_exports__ = __webpack_require__(903);
/******/ 	
/******/ })()
;