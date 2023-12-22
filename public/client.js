var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// node_modules/jsonify/lib/parse.js
var require_parse = __commonJS({
  "node_modules/jsonify/lib/parse.js"(exports, module) {
    "use strict";
    var at;
    var ch;
    var escapee = {
      '"': '"',
      "\\": "\\",
      "/": "/",
      b: "\b",
      f: "\f",
      n: "\n",
      r: "\r",
      t: "	"
    };
    var text;
    function error(m) {
      throw {
        name: "SyntaxError",
        message: m,
        at,
        text
      };
    }
    function next(c) {
      if (c && c !== ch) {
        error("Expected '" + c + "' instead of '" + ch + "'");
      }
      ch = text.charAt(at);
      at += 1;
      return ch;
    }
    function number() {
      var num;
      var str = "";
      if (ch === "-") {
        str = "-";
        next("-");
      }
      while (ch >= "0" && ch <= "9") {
        str += ch;
        next();
      }
      if (ch === ".") {
        str += ".";
        while (next() && ch >= "0" && ch <= "9") {
          str += ch;
        }
      }
      if (ch === "e" || ch === "E") {
        str += ch;
        next();
        if (ch === "-" || ch === "+") {
          str += ch;
          next();
        }
        while (ch >= "0" && ch <= "9") {
          str += ch;
          next();
        }
      }
      num = Number(str);
      if (!isFinite(num)) {
        error("Bad number");
      }
      return num;
    }
    function string() {
      var hex;
      var i;
      var str = "";
      var uffff;
      if (ch === '"') {
        while (next()) {
          if (ch === '"') {
            next();
            return str;
          } else if (ch === "\\") {
            next();
            if (ch === "u") {
              uffff = 0;
              for (i = 0; i < 4; i += 1) {
                hex = parseInt(next(), 16);
                if (!isFinite(hex)) {
                  break;
                }
                uffff = uffff * 16 + hex;
              }
              str += String.fromCharCode(uffff);
            } else if (typeof escapee[ch] === "string") {
              str += escapee[ch];
            } else {
              break;
            }
          } else {
            str += ch;
          }
        }
      }
      error("Bad string");
    }
    function white() {
      while (ch && ch <= " ") {
        next();
      }
    }
    function word() {
      switch (ch) {
        case "t":
          next("t");
          next("r");
          next("u");
          next("e");
          return true;
        case "f":
          next("f");
          next("a");
          next("l");
          next("s");
          next("e");
          return false;
        case "n":
          next("n");
          next("u");
          next("l");
          next("l");
          return null;
        default:
          error("Unexpected '" + ch + "'");
      }
    }
    function array() {
      var arr = [];
      if (ch === "[") {
        next("[");
        white();
        if (ch === "]") {
          next("]");
          return arr;
        }
        while (ch) {
          arr.push(value());
          white();
          if (ch === "]") {
            next("]");
            return arr;
          }
          next(",");
          white();
        }
      }
      error("Bad array");
    }
    function object() {
      var key;
      var obj = {};
      if (ch === "{") {
        next("{");
        white();
        if (ch === "}") {
          next("}");
          return obj;
        }
        while (ch) {
          key = string();
          white();
          next(":");
          if (Object.prototype.hasOwnProperty.call(obj, key)) {
            error('Duplicate key "' + key + '"');
          }
          obj[key] = value();
          white();
          if (ch === "}") {
            next("}");
            return obj;
          }
          next(",");
          white();
        }
      }
      error("Bad object");
    }
    function value() {
      white();
      switch (ch) {
        case "{":
          return object();
        case "[":
          return array();
        case '"':
          return string();
        case "-":
          return number();
        default:
          return ch >= "0" && ch <= "9" ? number() : word();
      }
    }
    module.exports = function(source, reviver) {
      var result;
      text = source;
      at = 0;
      ch = " ";
      result = value();
      white();
      if (ch) {
        error("Syntax error");
      }
      return typeof reviver === "function" ? function walk(holder, key) {
        var k;
        var v;
        var val = holder[key];
        if (val && typeof val === "object") {
          for (k in value) {
            if (Object.prototype.hasOwnProperty.call(val, k)) {
              v = walk(val, k);
              if (typeof v === "undefined") {
                delete val[k];
              } else {
                val[k] = v;
              }
            }
          }
        }
        return reviver.call(holder, key, val);
      }({ "": result }, "") : result;
    };
  }
});

// node_modules/jsonify/lib/stringify.js
var require_stringify = __commonJS({
  "node_modules/jsonify/lib/stringify.js"(exports, module) {
    "use strict";
    var escapable = /[\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;
    var gap;
    var indent;
    var meta = {
      // table of character substitutions
      "\b": "\\b",
      "	": "\\t",
      "\n": "\\n",
      "\f": "\\f",
      "\r": "\\r",
      '"': '\\"',
      "\\": "\\\\"
    };
    var rep;
    function quote(string) {
      escapable.lastIndex = 0;
      return escapable.test(string) ? '"' + string.replace(escapable, function(a) {
        var c = meta[a];
        return typeof c === "string" ? c : "\\u" + ("0000" + a.charCodeAt(0).toString(16)).slice(-4);
      }) + '"' : '"' + string + '"';
    }
    function str(key, holder) {
      var i;
      var k;
      var v;
      var length;
      var mind = gap;
      var partial;
      var value = holder[key];
      if (value && typeof value === "object" && typeof value.toJSON === "function") {
        value = value.toJSON(key);
      }
      if (typeof rep === "function") {
        value = rep.call(holder, key, value);
      }
      switch (typeof value) {
        case "string":
          return quote(value);
        case "number":
          return isFinite(value) ? String(value) : "null";
        case "boolean":
        case "null":
          return String(value);
        case "object":
          if (!value) {
            return "null";
          }
          gap += indent;
          partial = [];
          if (Object.prototype.toString.apply(value) === "[object Array]") {
            length = value.length;
            for (i = 0; i < length; i += 1) {
              partial[i] = str(i, value) || "null";
            }
            v = partial.length === 0 ? "[]" : gap ? "[\n" + gap + partial.join(",\n" + gap) + "\n" + mind + "]" : "[" + partial.join(",") + "]";
            gap = mind;
            return v;
          }
          if (rep && typeof rep === "object") {
            length = rep.length;
            for (i = 0; i < length; i += 1) {
              k = rep[i];
              if (typeof k === "string") {
                v = str(k, value);
                if (v) {
                  partial.push(quote(k) + (gap ? ": " : ":") + v);
                }
              }
            }
          } else {
            for (k in value) {
              if (Object.prototype.hasOwnProperty.call(value, k)) {
                v = str(k, value);
                if (v) {
                  partial.push(quote(k) + (gap ? ": " : ":") + v);
                }
              }
            }
          }
          v = partial.length === 0 ? "{}" : gap ? "{\n" + gap + partial.join(",\n" + gap) + "\n" + mind + "}" : "{" + partial.join(",") + "}";
          gap = mind;
          return v;
        default:
      }
    }
    module.exports = function(value, replacer, space) {
      var i;
      gap = "";
      indent = "";
      if (typeof space === "number") {
        for (i = 0; i < space; i += 1) {
          indent += " ";
        }
      } else if (typeof space === "string") {
        indent = space;
      }
      rep = replacer;
      if (replacer && typeof replacer !== "function" && (typeof replacer !== "object" || typeof replacer.length !== "number")) {
        throw new Error("JSON.stringify");
      }
      return str("", { "": value });
    };
  }
});

// node_modules/jsonify/index.js
var require_jsonify = __commonJS({
  "node_modules/jsonify/index.js"(exports) {
    "use strict";
    exports.parse = require_parse();
    exports.stringify = require_stringify();
  }
});

// node_modules/isarray/index.js
var require_isarray = __commonJS({
  "node_modules/isarray/index.js"(exports, module) {
    var toString = {}.toString;
    module.exports = Array.isArray || function(arr) {
      return toString.call(arr) == "[object Array]";
    };
  }
});

// node_modules/object-keys/isArguments.js
var require_isArguments = __commonJS({
  "node_modules/object-keys/isArguments.js"(exports, module) {
    "use strict";
    var toStr = Object.prototype.toString;
    module.exports = function isArguments(value) {
      var str = toStr.call(value);
      var isArgs = str === "[object Arguments]";
      if (!isArgs) {
        isArgs = str !== "[object Array]" && value !== null && typeof value === "object" && typeof value.length === "number" && value.length >= 0 && toStr.call(value.callee) === "[object Function]";
      }
      return isArgs;
    };
  }
});

// node_modules/object-keys/implementation.js
var require_implementation = __commonJS({
  "node_modules/object-keys/implementation.js"(exports, module) {
    "use strict";
    var keysShim;
    if (!Object.keys) {
      has = Object.prototype.hasOwnProperty;
      toStr = Object.prototype.toString;
      isArgs = require_isArguments();
      isEnumerable = Object.prototype.propertyIsEnumerable;
      hasDontEnumBug = !isEnumerable.call({ toString: null }, "toString");
      hasProtoEnumBug = isEnumerable.call(function() {
      }, "prototype");
      dontEnums = [
        "toString",
        "toLocaleString",
        "valueOf",
        "hasOwnProperty",
        "isPrototypeOf",
        "propertyIsEnumerable",
        "constructor"
      ];
      equalsConstructorPrototype = function(o) {
        var ctor = o.constructor;
        return ctor && ctor.prototype === o;
      };
      excludedKeys = {
        $applicationCache: true,
        $console: true,
        $external: true,
        $frame: true,
        $frameElement: true,
        $frames: true,
        $innerHeight: true,
        $innerWidth: true,
        $onmozfullscreenchange: true,
        $onmozfullscreenerror: true,
        $outerHeight: true,
        $outerWidth: true,
        $pageXOffset: true,
        $pageYOffset: true,
        $parent: true,
        $scrollLeft: true,
        $scrollTop: true,
        $scrollX: true,
        $scrollY: true,
        $self: true,
        $webkitIndexedDB: true,
        $webkitStorageInfo: true,
        $window: true
      };
      hasAutomationEqualityBug = function() {
        if (typeof window === "undefined") {
          return false;
        }
        for (var k in window) {
          try {
            if (!excludedKeys["$" + k] && has.call(window, k) && window[k] !== null && typeof window[k] === "object") {
              try {
                equalsConstructorPrototype(window[k]);
              } catch (e) {
                return true;
              }
            }
          } catch (e) {
            return true;
          }
        }
        return false;
      }();
      equalsConstructorPrototypeIfNotBuggy = function(o) {
        if (typeof window === "undefined" || !hasAutomationEqualityBug) {
          return equalsConstructorPrototype(o);
        }
        try {
          return equalsConstructorPrototype(o);
        } catch (e) {
          return false;
        }
      };
      keysShim = function keys(object) {
        var isObject = object !== null && typeof object === "object";
        var isFunction = toStr.call(object) === "[object Function]";
        var isArguments = isArgs(object);
        var isString = isObject && toStr.call(object) === "[object String]";
        var theKeys = [];
        if (!isObject && !isFunction && !isArguments) {
          throw new TypeError("Object.keys called on a non-object");
        }
        var skipProto = hasProtoEnumBug && isFunction;
        if (isString && object.length > 0 && !has.call(object, 0)) {
          for (var i = 0; i < object.length; ++i) {
            theKeys.push(String(i));
          }
        }
        if (isArguments && object.length > 0) {
          for (var j = 0; j < object.length; ++j) {
            theKeys.push(String(j));
          }
        } else {
          for (var name in object) {
            if (!(skipProto && name === "prototype") && has.call(object, name)) {
              theKeys.push(String(name));
            }
          }
        }
        if (hasDontEnumBug) {
          var skipConstructor = equalsConstructorPrototypeIfNotBuggy(object);
          for (var k = 0; k < dontEnums.length; ++k) {
            if (!(skipConstructor && dontEnums[k] === "constructor") && has.call(object, dontEnums[k])) {
              theKeys.push(dontEnums[k]);
            }
          }
        }
        return theKeys;
      };
    }
    var has;
    var toStr;
    var isArgs;
    var isEnumerable;
    var hasDontEnumBug;
    var hasProtoEnumBug;
    var dontEnums;
    var equalsConstructorPrototype;
    var excludedKeys;
    var hasAutomationEqualityBug;
    var equalsConstructorPrototypeIfNotBuggy;
    module.exports = keysShim;
  }
});

// node_modules/object-keys/index.js
var require_object_keys = __commonJS({
  "node_modules/object-keys/index.js"(exports, module) {
    "use strict";
    var slice = Array.prototype.slice;
    var isArgs = require_isArguments();
    var origKeys = Object.keys;
    var keysShim = origKeys ? function keys(o) {
      return origKeys(o);
    } : require_implementation();
    var originalKeys = Object.keys;
    keysShim.shim = function shimObjectKeys() {
      if (Object.keys) {
        var keysWorksWithArguments = function() {
          var args = Object.keys(arguments);
          return args && args.length === arguments.length;
        }(1, 2);
        if (!keysWorksWithArguments) {
          Object.keys = function keys(object) {
            if (isArgs(object)) {
              return originalKeys(slice.call(object));
            }
            return originalKeys(object);
          };
        }
      } else {
        Object.keys = keysShim;
      }
      return Object.keys || keysShim;
    };
    module.exports = keysShim;
  }
});

// node_modules/function-bind/implementation.js
var require_implementation2 = __commonJS({
  "node_modules/function-bind/implementation.js"(exports, module) {
    "use strict";
    var ERROR_MESSAGE = "Function.prototype.bind called on incompatible ";
    var toStr = Object.prototype.toString;
    var max2 = Math.max;
    var funcType = "[object Function]";
    var concatty = function concatty2(a, b) {
      var arr = [];
      for (var i = 0; i < a.length; i += 1) {
        arr[i] = a[i];
      }
      for (var j = 0; j < b.length; j += 1) {
        arr[j + a.length] = b[j];
      }
      return arr;
    };
    var slicy = function slicy2(arrLike, offset) {
      var arr = [];
      for (var i = offset || 0, j = 0; i < arrLike.length; i += 1, j += 1) {
        arr[j] = arrLike[i];
      }
      return arr;
    };
    var joiny = function(arr, joiner) {
      var str = "";
      for (var i = 0; i < arr.length; i += 1) {
        str += arr[i];
        if (i + 1 < arr.length) {
          str += joiner;
        }
      }
      return str;
    };
    module.exports = function bind(that) {
      var target = this;
      if (typeof target !== "function" || toStr.apply(target) !== funcType) {
        throw new TypeError(ERROR_MESSAGE + target);
      }
      var args = slicy(arguments, 1);
      var bound;
      var binder = function() {
        if (this instanceof bound) {
          var result = target.apply(
            this,
            concatty(args, arguments)
          );
          if (Object(result) === result) {
            return result;
          }
          return this;
        }
        return target.apply(
          that,
          concatty(args, arguments)
        );
      };
      var boundLength = max2(0, target.length - args.length);
      var boundArgs = [];
      for (var i = 0; i < boundLength; i++) {
        boundArgs[i] = "$" + i;
      }
      bound = Function("binder", "return function (" + joiny(boundArgs, ",") + "){ return binder.apply(this,arguments); }")(binder);
      if (target.prototype) {
        var Empty = function Empty2() {
        };
        Empty.prototype = target.prototype;
        bound.prototype = new Empty();
        Empty.prototype = null;
      }
      return bound;
    };
  }
});

// node_modules/function-bind/index.js
var require_function_bind = __commonJS({
  "node_modules/function-bind/index.js"(exports, module) {
    "use strict";
    var implementation = require_implementation2();
    module.exports = Function.prototype.bind || implementation;
  }
});

// node_modules/has-symbols/shams.js
var require_shams = __commonJS({
  "node_modules/has-symbols/shams.js"(exports, module) {
    "use strict";
    module.exports = function hasSymbols() {
      if (typeof Symbol !== "function" || typeof Object.getOwnPropertySymbols !== "function") {
        return false;
      }
      if (typeof Symbol.iterator === "symbol") {
        return true;
      }
      var obj = {};
      var sym = Symbol("test");
      var symObj = Object(sym);
      if (typeof sym === "string") {
        return false;
      }
      if (Object.prototype.toString.call(sym) !== "[object Symbol]") {
        return false;
      }
      if (Object.prototype.toString.call(symObj) !== "[object Symbol]") {
        return false;
      }
      var symVal = 42;
      obj[sym] = symVal;
      for (sym in obj) {
        return false;
      }
      if (typeof Object.keys === "function" && Object.keys(obj).length !== 0) {
        return false;
      }
      if (typeof Object.getOwnPropertyNames === "function" && Object.getOwnPropertyNames(obj).length !== 0) {
        return false;
      }
      var syms = Object.getOwnPropertySymbols(obj);
      if (syms.length !== 1 || syms[0] !== sym) {
        return false;
      }
      if (!Object.prototype.propertyIsEnumerable.call(obj, sym)) {
        return false;
      }
      if (typeof Object.getOwnPropertyDescriptor === "function") {
        var descriptor = Object.getOwnPropertyDescriptor(obj, sym);
        if (descriptor.value !== symVal || descriptor.enumerable !== true) {
          return false;
        }
      }
      return true;
    };
  }
});

// node_modules/has-symbols/index.js
var require_has_symbols = __commonJS({
  "node_modules/has-symbols/index.js"(exports, module) {
    "use strict";
    var origSymbol = typeof Symbol !== "undefined" && Symbol;
    var hasSymbolSham = require_shams();
    module.exports = function hasNativeSymbols() {
      if (typeof origSymbol !== "function") {
        return false;
      }
      if (typeof Symbol !== "function") {
        return false;
      }
      if (typeof origSymbol("foo") !== "symbol") {
        return false;
      }
      if (typeof Symbol("bar") !== "symbol") {
        return false;
      }
      return hasSymbolSham();
    };
  }
});

// node_modules/has-proto/index.js
var require_has_proto = __commonJS({
  "node_modules/has-proto/index.js"(exports, module) {
    "use strict";
    var test = {
      foo: {}
    };
    var $Object = Object;
    module.exports = function hasProto() {
      return { __proto__: test }.foo === test.foo && !({ __proto__: null } instanceof $Object);
    };
  }
});

// node_modules/hasown/index.js
var require_hasown = __commonJS({
  "node_modules/hasown/index.js"(exports, module) {
    "use strict";
    var call = Function.prototype.call;
    var $hasOwn = Object.prototype.hasOwnProperty;
    var bind = require_function_bind();
    module.exports = bind.call(call, $hasOwn);
  }
});

// node_modules/get-intrinsic/index.js
var require_get_intrinsic = __commonJS({
  "node_modules/get-intrinsic/index.js"(exports, module) {
    "use strict";
    var undefined2;
    var $SyntaxError = SyntaxError;
    var $Function = Function;
    var $TypeError = TypeError;
    var getEvalledConstructor = function(expressionSyntax) {
      try {
        return $Function('"use strict"; return (' + expressionSyntax + ").constructor;")();
      } catch (e) {
      }
    };
    var $gOPD = Object.getOwnPropertyDescriptor;
    if ($gOPD) {
      try {
        $gOPD({}, "");
      } catch (e) {
        $gOPD = null;
      }
    }
    var throwTypeError = function() {
      throw new $TypeError();
    };
    var ThrowTypeError = $gOPD ? function() {
      try {
        arguments.callee;
        return throwTypeError;
      } catch (calleeThrows) {
        try {
          return $gOPD(arguments, "callee").get;
        } catch (gOPDthrows) {
          return throwTypeError;
        }
      }
    }() : throwTypeError;
    var hasSymbols = require_has_symbols()();
    var hasProto = require_has_proto()();
    var getProto = Object.getPrototypeOf || (hasProto ? function(x) {
      return x.__proto__;
    } : null);
    var needsEval = {};
    var TypedArray = typeof Uint8Array === "undefined" || !getProto ? undefined2 : getProto(Uint8Array);
    var INTRINSICS = {
      "%AggregateError%": typeof AggregateError === "undefined" ? undefined2 : AggregateError,
      "%Array%": Array,
      "%ArrayBuffer%": typeof ArrayBuffer === "undefined" ? undefined2 : ArrayBuffer,
      "%ArrayIteratorPrototype%": hasSymbols && getProto ? getProto([][Symbol.iterator]()) : undefined2,
      "%AsyncFromSyncIteratorPrototype%": undefined2,
      "%AsyncFunction%": needsEval,
      "%AsyncGenerator%": needsEval,
      "%AsyncGeneratorFunction%": needsEval,
      "%AsyncIteratorPrototype%": needsEval,
      "%Atomics%": typeof Atomics === "undefined" ? undefined2 : Atomics,
      "%BigInt%": typeof BigInt === "undefined" ? undefined2 : BigInt,
      "%BigInt64Array%": typeof BigInt64Array === "undefined" ? undefined2 : BigInt64Array,
      "%BigUint64Array%": typeof BigUint64Array === "undefined" ? undefined2 : BigUint64Array,
      "%Boolean%": Boolean,
      "%DataView%": typeof DataView === "undefined" ? undefined2 : DataView,
      "%Date%": Date,
      "%decodeURI%": decodeURI,
      "%decodeURIComponent%": decodeURIComponent,
      "%encodeURI%": encodeURI,
      "%encodeURIComponent%": encodeURIComponent,
      "%Error%": Error,
      "%eval%": eval,
      // eslint-disable-line no-eval
      "%EvalError%": EvalError,
      "%Float32Array%": typeof Float32Array === "undefined" ? undefined2 : Float32Array,
      "%Float64Array%": typeof Float64Array === "undefined" ? undefined2 : Float64Array,
      "%FinalizationRegistry%": typeof FinalizationRegistry === "undefined" ? undefined2 : FinalizationRegistry,
      "%Function%": $Function,
      "%GeneratorFunction%": needsEval,
      "%Int8Array%": typeof Int8Array === "undefined" ? undefined2 : Int8Array,
      "%Int16Array%": typeof Int16Array === "undefined" ? undefined2 : Int16Array,
      "%Int32Array%": typeof Int32Array === "undefined" ? undefined2 : Int32Array,
      "%isFinite%": isFinite,
      "%isNaN%": isNaN,
      "%IteratorPrototype%": hasSymbols && getProto ? getProto(getProto([][Symbol.iterator]())) : undefined2,
      "%JSON%": typeof JSON === "object" ? JSON : undefined2,
      "%Map%": typeof Map === "undefined" ? undefined2 : Map,
      "%MapIteratorPrototype%": typeof Map === "undefined" || !hasSymbols || !getProto ? undefined2 : getProto((/* @__PURE__ */ new Map())[Symbol.iterator]()),
      "%Math%": Math,
      "%Number%": Number,
      "%Object%": Object,
      "%parseFloat%": parseFloat,
      "%parseInt%": parseInt,
      "%Promise%": typeof Promise === "undefined" ? undefined2 : Promise,
      "%Proxy%": typeof Proxy === "undefined" ? undefined2 : Proxy,
      "%RangeError%": RangeError,
      "%ReferenceError%": ReferenceError,
      "%Reflect%": typeof Reflect === "undefined" ? undefined2 : Reflect,
      "%RegExp%": RegExp,
      "%Set%": typeof Set === "undefined" ? undefined2 : Set,
      "%SetIteratorPrototype%": typeof Set === "undefined" || !hasSymbols || !getProto ? undefined2 : getProto((/* @__PURE__ */ new Set())[Symbol.iterator]()),
      "%SharedArrayBuffer%": typeof SharedArrayBuffer === "undefined" ? undefined2 : SharedArrayBuffer,
      "%String%": String,
      "%StringIteratorPrototype%": hasSymbols && getProto ? getProto(""[Symbol.iterator]()) : undefined2,
      "%Symbol%": hasSymbols ? Symbol : undefined2,
      "%SyntaxError%": $SyntaxError,
      "%ThrowTypeError%": ThrowTypeError,
      "%TypedArray%": TypedArray,
      "%TypeError%": $TypeError,
      "%Uint8Array%": typeof Uint8Array === "undefined" ? undefined2 : Uint8Array,
      "%Uint8ClampedArray%": typeof Uint8ClampedArray === "undefined" ? undefined2 : Uint8ClampedArray,
      "%Uint16Array%": typeof Uint16Array === "undefined" ? undefined2 : Uint16Array,
      "%Uint32Array%": typeof Uint32Array === "undefined" ? undefined2 : Uint32Array,
      "%URIError%": URIError,
      "%WeakMap%": typeof WeakMap === "undefined" ? undefined2 : WeakMap,
      "%WeakRef%": typeof WeakRef === "undefined" ? undefined2 : WeakRef,
      "%WeakSet%": typeof WeakSet === "undefined" ? undefined2 : WeakSet
    };
    if (getProto) {
      try {
        null.error;
      } catch (e) {
        errorProto = getProto(getProto(e));
        INTRINSICS["%Error.prototype%"] = errorProto;
      }
    }
    var errorProto;
    var doEval = function doEval2(name) {
      var value;
      if (name === "%AsyncFunction%") {
        value = getEvalledConstructor("async function () {}");
      } else if (name === "%GeneratorFunction%") {
        value = getEvalledConstructor("function* () {}");
      } else if (name === "%AsyncGeneratorFunction%") {
        value = getEvalledConstructor("async function* () {}");
      } else if (name === "%AsyncGenerator%") {
        var fn = doEval2("%AsyncGeneratorFunction%");
        if (fn) {
          value = fn.prototype;
        }
      } else if (name === "%AsyncIteratorPrototype%") {
        var gen = doEval2("%AsyncGenerator%");
        if (gen && getProto) {
          value = getProto(gen.prototype);
        }
      }
      INTRINSICS[name] = value;
      return value;
    };
    var LEGACY_ALIASES = {
      "%ArrayBufferPrototype%": ["ArrayBuffer", "prototype"],
      "%ArrayPrototype%": ["Array", "prototype"],
      "%ArrayProto_entries%": ["Array", "prototype", "entries"],
      "%ArrayProto_forEach%": ["Array", "prototype", "forEach"],
      "%ArrayProto_keys%": ["Array", "prototype", "keys"],
      "%ArrayProto_values%": ["Array", "prototype", "values"],
      "%AsyncFunctionPrototype%": ["AsyncFunction", "prototype"],
      "%AsyncGenerator%": ["AsyncGeneratorFunction", "prototype"],
      "%AsyncGeneratorPrototype%": ["AsyncGeneratorFunction", "prototype", "prototype"],
      "%BooleanPrototype%": ["Boolean", "prototype"],
      "%DataViewPrototype%": ["DataView", "prototype"],
      "%DatePrototype%": ["Date", "prototype"],
      "%ErrorPrototype%": ["Error", "prototype"],
      "%EvalErrorPrototype%": ["EvalError", "prototype"],
      "%Float32ArrayPrototype%": ["Float32Array", "prototype"],
      "%Float64ArrayPrototype%": ["Float64Array", "prototype"],
      "%FunctionPrototype%": ["Function", "prototype"],
      "%Generator%": ["GeneratorFunction", "prototype"],
      "%GeneratorPrototype%": ["GeneratorFunction", "prototype", "prototype"],
      "%Int8ArrayPrototype%": ["Int8Array", "prototype"],
      "%Int16ArrayPrototype%": ["Int16Array", "prototype"],
      "%Int32ArrayPrototype%": ["Int32Array", "prototype"],
      "%JSONParse%": ["JSON", "parse"],
      "%JSONStringify%": ["JSON", "stringify"],
      "%MapPrototype%": ["Map", "prototype"],
      "%NumberPrototype%": ["Number", "prototype"],
      "%ObjectPrototype%": ["Object", "prototype"],
      "%ObjProto_toString%": ["Object", "prototype", "toString"],
      "%ObjProto_valueOf%": ["Object", "prototype", "valueOf"],
      "%PromisePrototype%": ["Promise", "prototype"],
      "%PromiseProto_then%": ["Promise", "prototype", "then"],
      "%Promise_all%": ["Promise", "all"],
      "%Promise_reject%": ["Promise", "reject"],
      "%Promise_resolve%": ["Promise", "resolve"],
      "%RangeErrorPrototype%": ["RangeError", "prototype"],
      "%ReferenceErrorPrototype%": ["ReferenceError", "prototype"],
      "%RegExpPrototype%": ["RegExp", "prototype"],
      "%SetPrototype%": ["Set", "prototype"],
      "%SharedArrayBufferPrototype%": ["SharedArrayBuffer", "prototype"],
      "%StringPrototype%": ["String", "prototype"],
      "%SymbolPrototype%": ["Symbol", "prototype"],
      "%SyntaxErrorPrototype%": ["SyntaxError", "prototype"],
      "%TypedArrayPrototype%": ["TypedArray", "prototype"],
      "%TypeErrorPrototype%": ["TypeError", "prototype"],
      "%Uint8ArrayPrototype%": ["Uint8Array", "prototype"],
      "%Uint8ClampedArrayPrototype%": ["Uint8ClampedArray", "prototype"],
      "%Uint16ArrayPrototype%": ["Uint16Array", "prototype"],
      "%Uint32ArrayPrototype%": ["Uint32Array", "prototype"],
      "%URIErrorPrototype%": ["URIError", "prototype"],
      "%WeakMapPrototype%": ["WeakMap", "prototype"],
      "%WeakSetPrototype%": ["WeakSet", "prototype"]
    };
    var bind = require_function_bind();
    var hasOwn = require_hasown();
    var $concat = bind.call(Function.call, Array.prototype.concat);
    var $spliceApply = bind.call(Function.apply, Array.prototype.splice);
    var $replace = bind.call(Function.call, String.prototype.replace);
    var $strSlice = bind.call(Function.call, String.prototype.slice);
    var $exec = bind.call(Function.call, RegExp.prototype.exec);
    var rePropName = /[^%.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|%$))/g;
    var reEscapeChar = /\\(\\)?/g;
    var stringToPath = function stringToPath2(string) {
      var first = $strSlice(string, 0, 1);
      var last = $strSlice(string, -1);
      if (first === "%" && last !== "%") {
        throw new $SyntaxError("invalid intrinsic syntax, expected closing `%`");
      } else if (last === "%" && first !== "%") {
        throw new $SyntaxError("invalid intrinsic syntax, expected opening `%`");
      }
      var result = [];
      $replace(string, rePropName, function(match2, number, quote, subString) {
        result[result.length] = quote ? $replace(subString, reEscapeChar, "$1") : number || match2;
      });
      return result;
    };
    var getBaseIntrinsic = function getBaseIntrinsic2(name, allowMissing) {
      var intrinsicName = name;
      var alias;
      if (hasOwn(LEGACY_ALIASES, intrinsicName)) {
        alias = LEGACY_ALIASES[intrinsicName];
        intrinsicName = "%" + alias[0] + "%";
      }
      if (hasOwn(INTRINSICS, intrinsicName)) {
        var value = INTRINSICS[intrinsicName];
        if (value === needsEval) {
          value = doEval(intrinsicName);
        }
        if (typeof value === "undefined" && !allowMissing) {
          throw new $TypeError("intrinsic " + name + " exists, but is not available. Please file an issue!");
        }
        return {
          alias,
          name: intrinsicName,
          value
        };
      }
      throw new $SyntaxError("intrinsic " + name + " does not exist!");
    };
    module.exports = function GetIntrinsic(name, allowMissing) {
      if (typeof name !== "string" || name.length === 0) {
        throw new $TypeError("intrinsic name must be a non-empty string");
      }
      if (arguments.length > 1 && typeof allowMissing !== "boolean") {
        throw new $TypeError('"allowMissing" argument must be a boolean');
      }
      if ($exec(/^%?[^%]*%?$/, name) === null) {
        throw new $SyntaxError("`%` may not be present anywhere but at the beginning and end of the intrinsic name");
      }
      var parts = stringToPath(name);
      var intrinsicBaseName = parts.length > 0 ? parts[0] : "";
      var intrinsic = getBaseIntrinsic("%" + intrinsicBaseName + "%", allowMissing);
      var intrinsicRealName = intrinsic.name;
      var value = intrinsic.value;
      var skipFurtherCaching = false;
      var alias = intrinsic.alias;
      if (alias) {
        intrinsicBaseName = alias[0];
        $spliceApply(parts, $concat([0, 1], alias));
      }
      for (var i = 1, isOwn = true; i < parts.length; i += 1) {
        var part = parts[i];
        var first = $strSlice(part, 0, 1);
        var last = $strSlice(part, -1);
        if ((first === '"' || first === "'" || first === "`" || (last === '"' || last === "'" || last === "`")) && first !== last) {
          throw new $SyntaxError("property names with quotes must have matching quotes");
        }
        if (part === "constructor" || !isOwn) {
          skipFurtherCaching = true;
        }
        intrinsicBaseName += "." + part;
        intrinsicRealName = "%" + intrinsicBaseName + "%";
        if (hasOwn(INTRINSICS, intrinsicRealName)) {
          value = INTRINSICS[intrinsicRealName];
        } else if (value != null) {
          if (!(part in value)) {
            if (!allowMissing) {
              throw new $TypeError("base intrinsic for " + name + " exists, but the property is not available.");
            }
            return void 0;
          }
          if ($gOPD && i + 1 >= parts.length) {
            var desc = $gOPD(value, part);
            isOwn = !!desc;
            if (isOwn && "get" in desc && !("originalValue" in desc.get)) {
              value = desc.get;
            } else {
              value = value[part];
            }
          } else {
            isOwn = hasOwn(value, part);
            value = value[part];
          }
          if (isOwn && !skipFurtherCaching) {
            INTRINSICS[intrinsicRealName] = value;
          }
        }
      }
      return value;
    };
  }
});

// node_modules/has-property-descriptors/index.js
var require_has_property_descriptors = __commonJS({
  "node_modules/has-property-descriptors/index.js"(exports, module) {
    "use strict";
    var GetIntrinsic = require_get_intrinsic();
    var $defineProperty = GetIntrinsic("%Object.defineProperty%", true);
    var hasPropertyDescriptors = function hasPropertyDescriptors2() {
      if ($defineProperty) {
        try {
          $defineProperty({}, "a", { value: 1 });
          return true;
        } catch (e) {
          return false;
        }
      }
      return false;
    };
    hasPropertyDescriptors.hasArrayLengthDefineBug = function hasArrayLengthDefineBug() {
      if (!hasPropertyDescriptors()) {
        return null;
      }
      try {
        return $defineProperty([], "length", { value: 1 }).length !== 1;
      } catch (e) {
        return true;
      }
    };
    module.exports = hasPropertyDescriptors;
  }
});

// node_modules/gopd/index.js
var require_gopd = __commonJS({
  "node_modules/gopd/index.js"(exports, module) {
    "use strict";
    var GetIntrinsic = require_get_intrinsic();
    var $gOPD = GetIntrinsic("%Object.getOwnPropertyDescriptor%", true);
    if ($gOPD) {
      try {
        $gOPD([], "length");
      } catch (e) {
        $gOPD = null;
      }
    }
    module.exports = $gOPD;
  }
});

// node_modules/define-data-property/index.js
var require_define_data_property = __commonJS({
  "node_modules/define-data-property/index.js"(exports, module) {
    "use strict";
    var hasPropertyDescriptors = require_has_property_descriptors()();
    var GetIntrinsic = require_get_intrinsic();
    var $defineProperty = hasPropertyDescriptors && GetIntrinsic("%Object.defineProperty%", true);
    if ($defineProperty) {
      try {
        $defineProperty({}, "a", { value: 1 });
      } catch (e) {
        $defineProperty = false;
      }
    }
    var $SyntaxError = GetIntrinsic("%SyntaxError%");
    var $TypeError = GetIntrinsic("%TypeError%");
    var gopd = require_gopd();
    module.exports = function defineDataProperty(obj, property, value) {
      if (!obj || typeof obj !== "object" && typeof obj !== "function") {
        throw new $TypeError("`obj` must be an object or a function`");
      }
      if (typeof property !== "string" && typeof property !== "symbol") {
        throw new $TypeError("`property` must be a string or a symbol`");
      }
      if (arguments.length > 3 && typeof arguments[3] !== "boolean" && arguments[3] !== null) {
        throw new $TypeError("`nonEnumerable`, if provided, must be a boolean or null");
      }
      if (arguments.length > 4 && typeof arguments[4] !== "boolean" && arguments[4] !== null) {
        throw new $TypeError("`nonWritable`, if provided, must be a boolean or null");
      }
      if (arguments.length > 5 && typeof arguments[5] !== "boolean" && arguments[5] !== null) {
        throw new $TypeError("`nonConfigurable`, if provided, must be a boolean or null");
      }
      if (arguments.length > 6 && typeof arguments[6] !== "boolean") {
        throw new $TypeError("`loose`, if provided, must be a boolean");
      }
      var nonEnumerable = arguments.length > 3 ? arguments[3] : null;
      var nonWritable = arguments.length > 4 ? arguments[4] : null;
      var nonConfigurable = arguments.length > 5 ? arguments[5] : null;
      var loose = arguments.length > 6 ? arguments[6] : false;
      var desc = !!gopd && gopd(obj, property);
      if ($defineProperty) {
        $defineProperty(obj, property, {
          configurable: nonConfigurable === null && desc ? desc.configurable : !nonConfigurable,
          enumerable: nonEnumerable === null && desc ? desc.enumerable : !nonEnumerable,
          value,
          writable: nonWritable === null && desc ? desc.writable : !nonWritable
        });
      } else if (loose || !nonEnumerable && !nonWritable && !nonConfigurable) {
        obj[property] = value;
      } else {
        throw new $SyntaxError("This environment does not support defining a property as non-configurable, non-writable, or non-enumerable.");
      }
    };
  }
});

// node_modules/set-function-length/index.js
var require_set_function_length = __commonJS({
  "node_modules/set-function-length/index.js"(exports, module) {
    "use strict";
    var GetIntrinsic = require_get_intrinsic();
    var define2 = require_define_data_property();
    var hasDescriptors = require_has_property_descriptors()();
    var gOPD = require_gopd();
    var $TypeError = GetIntrinsic("%TypeError%");
    var $floor = GetIntrinsic("%Math.floor%");
    module.exports = function setFunctionLength(fn, length) {
      if (typeof fn !== "function") {
        throw new $TypeError("`fn` is not a function");
      }
      if (typeof length !== "number" || length < 0 || length > 4294967295 || $floor(length) !== length) {
        throw new $TypeError("`length` must be a positive 32-bit integer");
      }
      var loose = arguments.length > 2 && !!arguments[2];
      var functionLengthIsConfigurable = true;
      var functionLengthIsWritable = true;
      if ("length" in fn && gOPD) {
        var desc = gOPD(fn, "length");
        if (desc && !desc.configurable) {
          functionLengthIsConfigurable = false;
        }
        if (desc && !desc.writable) {
          functionLengthIsWritable = false;
        }
      }
      if (functionLengthIsConfigurable || functionLengthIsWritable || !loose) {
        if (hasDescriptors) {
          define2(fn, "length", length, true, true);
        } else {
          define2(fn, "length", length);
        }
      }
      return fn;
    };
  }
});

// node_modules/call-bind/index.js
var require_call_bind = __commonJS({
  "node_modules/call-bind/index.js"(exports, module) {
    "use strict";
    var bind = require_function_bind();
    var GetIntrinsic = require_get_intrinsic();
    var setFunctionLength = require_set_function_length();
    var $TypeError = GetIntrinsic("%TypeError%");
    var $apply = GetIntrinsic("%Function.prototype.apply%");
    var $call = GetIntrinsic("%Function.prototype.call%");
    var $reflectApply = GetIntrinsic("%Reflect.apply%", true) || bind.call($call, $apply);
    var $defineProperty = GetIntrinsic("%Object.defineProperty%", true);
    var $max = GetIntrinsic("%Math.max%");
    if ($defineProperty) {
      try {
        $defineProperty({}, "a", { value: 1 });
      } catch (e) {
        $defineProperty = null;
      }
    }
    module.exports = function callBind(originalFunction) {
      if (typeof originalFunction !== "function") {
        throw new $TypeError("a function is required");
      }
      var func = $reflectApply(bind, $call, arguments);
      return setFunctionLength(
        func,
        1 + $max(0, originalFunction.length - (arguments.length - 1)),
        true
      );
    };
    var applyBind = function applyBind2() {
      return $reflectApply(bind, $apply, arguments);
    };
    if ($defineProperty) {
      $defineProperty(module.exports, "apply", { value: applyBind });
    } else {
      module.exports.apply = applyBind;
    }
  }
});

// node_modules/json-stable-stringify/index.js
var require_json_stable_stringify = __commonJS({
  "node_modules/json-stable-stringify/index.js"(exports, module) {
    "use strict";
    var jsonStringify = (typeof JSON !== "undefined" ? JSON : require_jsonify()).stringify;
    var isArray = require_isarray();
    var objectKeys = require_object_keys();
    var callBind = require_call_bind();
    var strRepeat = function repeat(n, char) {
      var str = "";
      for (var i = 0; i < n; i += 1) {
        str += char;
      }
      return str;
    };
    var defaultReplacer = function(parent, key, value) {
      return value;
    };
    module.exports = function stableStringify(obj) {
      var opts = arguments.length > 1 ? arguments[1] : void 0;
      var space = opts && opts.space || "";
      if (typeof space === "number") {
        space = strRepeat(space, " ");
      }
      var cycles = !!opts && typeof opts.cycles === "boolean" && opts.cycles;
      var replacer = opts && opts.replacer ? callBind(opts.replacer) : defaultReplacer;
      var cmpOpt = typeof opts === "function" ? opts : opts && opts.cmp;
      var cmp = cmpOpt && function(node) {
        var get = cmpOpt.length > 2 && function get2(k) {
          return node[k];
        };
        return function(a, b) {
          return cmpOpt(
            { key: a, value: node[a] },
            { key: b, value: node[b] },
            get ? { __proto__: null, get } : void 0
          );
        };
      };
      var seen = [];
      return function stringify3(parent, key, node, level) {
        var indent = space ? "\n" + strRepeat(level, space) : "";
        var colonSeparator = space ? ": " : ":";
        if (node && node.toJSON && typeof node.toJSON === "function") {
          node = node.toJSON();
        }
        node = replacer(parent, key, node);
        if (node === void 0) {
          return;
        }
        if (typeof node !== "object" || node === null) {
          return jsonStringify(node);
        }
        if (isArray(node)) {
          var out = "";
          for (var i = 0; i < node.length; i++) {
            var item = stringify3(node, i, node[i], level + 1) || jsonStringify(null);
            out += indent + space + item;
            if (i + 1 < node.length) {
              out += ",";
            }
          }
          return "[" + out + indent + "]";
        }
        if (seen.indexOf(node) !== -1) {
          if (cycles) {
            return jsonStringify("__cycle__");
          }
          throw new TypeError("Converting circular structure to JSON");
        } else {
          seen.push(node);
        }
        var keys = objectKeys(node).sort(cmp && cmp(node));
        var out = "";
        var needsComma = false;
        for (var i = 0; i < keys.length; i++) {
          var key = keys[i];
          var value = stringify3(node, key, node[key], level + 1);
          if (!value) {
            continue;
          }
          var keyValue = jsonStringify(key) + colonSeparator + value;
          out += (needsComma ? "," : "") + indent + space + keyValue;
          needsComma = true;
        }
        seen.splice(seen.indexOf(node), 1);
        return "{" + out + indent + "}";
      }({ "": obj }, "", obj, 0);
    };
  }
});

// node_modules/suncalc/suncalc.js
var require_suncalc = __commonJS({
  "node_modules/suncalc/suncalc.js"(exports, module) {
    (function() {
      "use strict";
      var PI = Math.PI, sin = Math.sin, cos = Math.cos, tan = Math.tan, asin = Math.asin, atan = Math.atan2, acos = Math.acos, rad = PI / 180;
      var dayMs = 1e3 * 60 * 60 * 24, J1970 = 2440588, J2000 = 2451545;
      function toJulian(date) {
        return date.valueOf() / dayMs - 0.5 + J1970;
      }
      function fromJulian(j) {
        return new Date((j + 0.5 - J1970) * dayMs);
      }
      function toDays(date) {
        return toJulian(date) - J2000;
      }
      var e = rad * 23.4397;
      function rightAscension(l, b) {
        return atan(sin(l) * cos(e) - tan(b) * sin(e), cos(l));
      }
      function declination(l, b) {
        return asin(sin(b) * cos(e) + cos(b) * sin(e) * sin(l));
      }
      function azimuth(H, phi, dec) {
        return atan(sin(H), cos(H) * sin(phi) - tan(dec) * cos(phi));
      }
      function altitude(H, phi, dec) {
        return asin(sin(phi) * sin(dec) + cos(phi) * cos(dec) * cos(H));
      }
      function siderealTime(d, lw) {
        return rad * (280.16 + 360.9856235 * d) - lw;
      }
      function astroRefraction(h) {
        if (h < 0)
          h = 0;
        return 2967e-7 / Math.tan(h + 312536e-8 / (h + 0.08901179));
      }
      function solarMeanAnomaly(d) {
        return rad * (357.5291 + 0.98560028 * d);
      }
      function eclipticLongitude(M) {
        var C = rad * (1.9148 * sin(M) + 0.02 * sin(2 * M) + 3e-4 * sin(3 * M)), P = rad * 102.9372;
        return M + C + P + PI;
      }
      function sunCoords(d) {
        var M = solarMeanAnomaly(d), L = eclipticLongitude(M);
        return {
          dec: declination(L, 0),
          ra: rightAscension(L, 0)
        };
      }
      var SunCalc = {};
      SunCalc.getPosition = function(date, lat2, lng) {
        var lw = rad * -lng, phi = rad * lat2, d = toDays(date), c = sunCoords(d), H = siderealTime(d, lw) - c.ra;
        return {
          azimuth: azimuth(H, phi, c.dec),
          altitude: altitude(H, phi, c.dec)
        };
      };
      var times = SunCalc.times = [
        [-0.833, "sunrise", "sunset"],
        [-0.3, "sunriseEnd", "sunsetStart"],
        [-6, "dawn", "dusk"],
        [-12, "nauticalDawn", "nauticalDusk"],
        [-18, "nightEnd", "night"],
        [6, "goldenHourEnd", "goldenHour"]
      ];
      SunCalc.addTime = function(angle, riseName, setName) {
        times.push([angle, riseName, setName]);
      };
      var J0 = 9e-4;
      function julianCycle(d, lw) {
        return Math.round(d - J0 - lw / (2 * PI));
      }
      function approxTransit(Ht, lw, n) {
        return J0 + (Ht + lw) / (2 * PI) + n;
      }
      function solarTransitJ(ds, M, L) {
        return J2000 + ds + 53e-4 * sin(M) - 69e-4 * sin(2 * L);
      }
      function hourAngle(h, phi, d) {
        return acos((sin(h) - sin(phi) * sin(d)) / (cos(phi) * cos(d)));
      }
      function observerAngle(height) {
        return -2.076 * Math.sqrt(height) / 60;
      }
      function getSetJ(h, lw, phi, dec, n, M, L) {
        var w = hourAngle(h, phi, dec), a = approxTransit(w, lw, n);
        return solarTransitJ(a, M, L);
      }
      SunCalc.getTimes = function(date, lat2, lng, height) {
        height = height || 0;
        var lw = rad * -lng, phi = rad * lat2, dh = observerAngle(height), d = toDays(date), n = julianCycle(d, lw), ds = approxTransit(0, lw, n), M = solarMeanAnomaly(ds), L = eclipticLongitude(M), dec = declination(L, 0), Jnoon = solarTransitJ(ds, M, L), i, len, time, h0, Jset, Jrise;
        var result = {
          solarNoon: fromJulian(Jnoon),
          nadir: fromJulian(Jnoon - 0.5)
        };
        for (i = 0, len = times.length; i < len; i += 1) {
          time = times[i];
          h0 = (time[0] + dh) * rad;
          Jset = getSetJ(h0, lw, phi, dec, n, M, L);
          Jrise = Jnoon - (Jset - Jnoon);
          result[time[1]] = fromJulian(Jrise);
          result[time[2]] = fromJulian(Jset);
        }
        return result;
      };
      function moonCoords(d) {
        var L = rad * (218.316 + 13.176396 * d), M = rad * (134.963 + 13.064993 * d), F = rad * (93.272 + 13.22935 * d), l = L + rad * 6.289 * sin(M), b = rad * 5.128 * sin(F), dt = 385001 - 20905 * cos(M);
        return {
          ra: rightAscension(l, b),
          dec: declination(l, b),
          dist: dt
        };
      }
      SunCalc.getMoonPosition = function(date, lat2, lng) {
        var lw = rad * -lng, phi = rad * lat2, d = toDays(date), c = moonCoords(d), H = siderealTime(d, lw) - c.ra, h = altitude(H, phi, c.dec), pa = atan(sin(H), tan(phi) * cos(c.dec) - sin(c.dec) * cos(H));
        h = h + astroRefraction(h);
        return {
          azimuth: azimuth(H, phi, c.dec),
          altitude: h,
          distance: c.dist,
          parallacticAngle: pa
        };
      };
      SunCalc.getMoonIllumination = function(date) {
        var d = toDays(date || /* @__PURE__ */ new Date()), s = sunCoords(d), m = moonCoords(d), sdist = 149598e3, phi = acos(sin(s.dec) * sin(m.dec) + cos(s.dec) * cos(m.dec) * cos(s.ra - m.ra)), inc = atan(sdist * sin(phi), m.dist - sdist * cos(phi)), angle = atan(cos(s.dec) * sin(s.ra - m.ra), sin(s.dec) * cos(m.dec) - cos(s.dec) * sin(m.dec) * cos(s.ra - m.ra));
        return {
          fraction: (1 + cos(inc)) / 2,
          phase: 0.5 + 0.5 * inc * (angle < 0 ? -1 : 1) / Math.PI,
          angle
        };
      };
      function hoursLater(date, h) {
        return new Date(date.valueOf() + h * dayMs / 24);
      }
      SunCalc.getMoonTimes = function(date, lat2, lng, inUTC) {
        var t = new Date(date);
        if (inUTC)
          t.setUTCHours(0, 0, 0, 0);
        else
          t.setHours(0, 0, 0, 0);
        var hc = 0.133 * rad, h0 = SunCalc.getMoonPosition(t, lat2, lng).altitude - hc, h1, h2, rise, set, a, b, xe, ye, d, roots, x1, x2, dx;
        for (var i = 1; i <= 24; i += 2) {
          h1 = SunCalc.getMoonPosition(hoursLater(t, i), lat2, lng).altitude - hc;
          h2 = SunCalc.getMoonPosition(hoursLater(t, i + 1), lat2, lng).altitude - hc;
          a = (h0 + h2) / 2 - h1;
          b = (h2 - h0) / 2;
          xe = -b / (2 * a);
          ye = (a * xe + b) * xe + h1;
          d = b * b - 4 * a * h1;
          roots = 0;
          if (d >= 0) {
            dx = Math.sqrt(d) / (Math.abs(a) * 2);
            x1 = xe - dx;
            x2 = xe + dx;
            if (Math.abs(x1) <= 1)
              roots++;
            if (Math.abs(x2) <= 1)
              roots++;
            if (x1 < -1)
              x1 = x2;
          }
          if (roots === 1) {
            if (h0 < 0)
              rise = i + x1;
            else
              set = i + x1;
          } else if (roots === 2) {
            rise = i + (ye < 0 ? x2 : x1);
            set = i + (ye < 0 ? x1 : x2);
          }
          if (rise && set)
            break;
          h0 = h2;
        }
        var result = {};
        if (rise)
          result.rise = hoursLater(t, rise);
        if (set)
          result.set = hoursLater(t, set);
        if (!rise && !set)
          result[ye > 0 ? "alwaysUp" : "alwaysDown"] = true;
        return result;
      };
      if (typeof exports === "object" && typeof module !== "undefined")
        module.exports = SunCalc;
      else if (typeof define === "function" && define.amd)
        define(SunCalc);
      else
        window.SunCalc = SunCalc;
    })();
  }
});

// node_modules/parse-dms/index.js
var require_parse_dms = __commonJS({
  "node_modules/parse-dms/index.js"(exports, module) {
    "use strict";
    module.exports = function(dmsString) {
      dmsString = dmsString.trim();
      var dmsRe = /([NSEW])?\s?(-)?(\d+(?:\.\d+)?)[°º:d\s]?\s?(?:(\d+(?:\.\d+)?)['’‘′:]?\s?(?:(\d{1,2}(?:\.\d+)?)(?:"|″|’’|'')?)?)?\s?([NSEW])?/i;
      var result = {};
      var m1, m2, decDeg1, decDeg2, dmsString2;
      m1 = dmsString.match(dmsRe);
      if (!m1)
        throw "Could not parse string";
      if (m1[1]) {
        m1[6] = void 0;
        dmsString2 = dmsString.substr(m1[0].length - 1).trim();
      } else {
        dmsString2 = dmsString.substr(m1[0].length).trim();
      }
      decDeg1 = decDegFromMatch(m1);
      m2 = dmsString2.match(dmsRe);
      decDeg2 = m2 ? decDegFromMatch(m2) : {};
      if (typeof decDeg1.latLon === "undefined") {
        if (!isNaN(decDeg1.decDeg) && isNaN(decDeg2.decDeg)) {
          return decDeg1.decDeg;
        } else if (!isNaN(decDeg1.decDeg) && !isNaN(decDeg2.decDeg)) {
          decDeg1.latLon = "lat";
          decDeg2.latLon = "lon";
        } else {
          throw "Could not parse string";
        }
      }
      if (typeof decDeg2.latLon === "undefined") {
        decDeg2.latLon = decDeg1.latLon === "lat" ? "lon" : "lat";
      }
      result[decDeg1.latLon] = decDeg1.decDeg;
      result[decDeg2.latLon] = decDeg2.decDeg;
      return result;
    };
    function decDegFromMatch(m) {
      var signIndex = {
        "-": -1,
        "N": 1,
        "S": -1,
        "E": 1,
        "W": -1
      };
      var latLonIndex = {
        "N": "lat",
        "S": "lat",
        "E": "lon",
        "W": "lon"
      };
      var degrees, minutes, seconds, sign, latLon;
      sign = signIndex[m[2]] || signIndex[m[1]] || signIndex[m[6]] || 1;
      degrees = Number(m[3]);
      minutes = m[4] ? Number(m[4]) : 0;
      seconds = m[5] ? Number(m[5]) : 0;
      latLon = latLonIndex[m[1]] || latLonIndex[m[6]];
      if (!inRange(degrees, 0, 180))
        throw "Degrees out of range";
      if (!inRange(minutes, 0, 60))
        throw "Minutes out of range";
      if (!inRange(seconds, 0, 60))
        throw "Seconds out of range";
      return {
        decDeg: sign * (degrees + minutes / 60 + seconds / 3600),
        latLon
      };
    }
    function inRange(value, a, b) {
      return value >= a && value <= b;
    }
  }
});

// src/client/boundingRect.ts
var Size = class {
  constructor(container2) {
    this.container = container2;
    this.refresh();
  }
  refresh = () => {
    const { height, width } = this.container.getBoundingClientRect();
    console.log("new bounding rect", { height, width });
    this._height = height;
    this._width = width;
  };
  container;
  _height = 0;
  _width = 0;
  get height() {
    return this._height;
  }
  get width() {
    return this._width;
  }
};

// src/client/globals/mouse.ts
var mouse = {
  down: {
    state: false,
    x: 0,
    y: 0
  },
  x: 0,
  y: 0
};

// src/common/extractProperties.ts
function extractProperties(obj, builder) {
  return Object.entries(builder).reduce((ret, entry) => {
    const [key, constructor] = entry;
    ret[key] = constructor(obj?.[key]);
    return ret;
  }, {});
}

// src/common/layers.ts
var zoomMax = 20;
var zoomMin = 2;
var min = zoomMin;
var max = zoomMax;
var layers = {
  "": { label: "- none -", max, min },
  bingsat: { label: "bSat", max, min },
  gebco: { label: "Depth", max: 9, min },
  googlehybrid: { label: "gHybrid", max, min },
  googlesat: { label: "gSat", max, min },
  googlestreet: { label: "gStreet", max, min },
  navionics: { label: "Navionics", max: 17, min },
  openseamap: { label: "oSea", max: 18, min },
  opentopomap: { label: "oTopo", max: 17, min },
  osm: { label: "oStreet", max: 19, min },
  vfdensity: { label: "Density", max: 12, min: 3 },
  worthit: { label: "Worthit", max, min }
};

// src/common/modulo.ts
function modulo(val, mod) {
  const ret = val % mod;
  return ret < 0 ? ret + mod : ret;
}

// src/client/globals/containerStyle.ts
var containerStyle = {
  height: "100%",
  left: "0px",
  overflow: "hidden",
  position: "absolute",
  top: "0px",
  width: "100%"
};

// src/common/fromEntriesTyped.ts
function fromEntriesTyped(entries) {
  return Object.fromEntries(entries);
}
function entriesTyped(o) {
  return Object.entries(o);
}

// src/client/utils/htmlElements/container.ts
var Container = class _Container {
  static from(tag, props) {
    const {
      classes,
      dataset,
      style,
      ...data
    } = props ?? {};
    const html = tag instanceof HTMLElement ? tag : document.createElement(tag);
    entriesTyped(data).forEach(([k, v]) => html[k] = v);
    if (classes)
      classes.forEach((c) => {
        if (typeof c === "string")
          html.classList.add(...c.split(" "));
      });
    if (dataset)
      entriesTyped(dataset).forEach(([k, v]) => html.dataset[k] = v);
    if (style)
      entriesTyped(style).forEach(([k, v]) => html.style[k] = v);
    return new _Container(html);
  }
  constructor(html = _Container.from("div")) {
    this.html = html instanceof _Container ? html.html : html;
  }
  html;
  clear() {
    this.html.innerHTML = "";
  }
  append(...items) {
    items.forEach((item) => {
      if (item instanceof _Container)
        this.html.append(item.html);
      else if (item)
        this.html.append(item);
    });
    return this;
  }
  getBoundingClientRect() {
    return this.html.getBoundingClientRect();
  }
};

// src/client/utils/localStorageItem.ts
var import_json_stable_stringify = __toESM(require_json_stable_stringify(), 1);
var LocalStorageItem = class {
  constructor(key) {
    this.key = key;
  }
  key;
  set(val) {
    const newsettings = (0, import_json_stable_stringify.default)(val);
    if (window.localStorage.getItem(this.key) !== newsettings) {
      window.localStorage.setItem(this.key, newsettings);
    }
  }
  get() {
    const val = window.localStorage.getItem(this.key);
    try {
      return val ? JSON.parse(val) : null;
    } catch {
      return null;
    }
  }
};

// src/client/globals/baselayers.ts
var baselayers = [
  "",
  "osm",
  "googlesat",
  "googlestreet",
  "googlehybrid",
  "gebco",
  "bingsat",
  "opentopomap",
  "worthit"
];

// src/client/globals/settings.ts
var Settings = class {
  constructor() {
    const localStorageSettings = new LocalStorageItem("settings").get();
    const baselayer = localStorageSettings?.baselayer ?? "osm";
    this.baselayer = baselayers.includes(baselayer) ? baselayer : "osm";
    this.show = extractProperties(localStorageSettings?.show, {
      crosshair: (val) => Boolean(val ?? true),
      navionics: Boolean,
      navionicsDetails: Boolean,
      openseamap: Boolean,
      suncalc: Boolean,
      vfdensity: Boolean
    });
    this.units = extractProperties(localStorageSettings?.units, {
      coords: (val) => ["d", "dm", "dms"].includes(val) ? val : "dm"
    });
  }
  show;
  baselayer;
  get tiles() {
    const ret = this.overlayOrder.filter((l) => this.show[l]).map((source) => ({ alpha: this.alpha[source] ?? 1, source }));
    if (this.baselayer)
      ret.unshift({ alpha: 1, source: this.baselayer });
    return ret;
  }
  units;
  overlayOrder = [
    "openseamap",
    "navionics",
    "vfdensity"
  ];
  alpha = {
    vfdensity: 0.5
  };
};
var settings = new Settings();

// src/client/globals/tileSize.ts
var tileSize = 256;

// src/client/utils/frac.ts
function frac(x) {
  return x - Math.floor(x);
}

// src/client/utils/lat2y.ts
function lat2y(lat2, tiles = position.tiles) {
  return (0.5 - Math.asinh(Math.tan(lat2)) / Math.PI / 2) * tiles;
}

// src/client/utils/lon2x.ts
function lon2x(lon2, tiles = position.tiles) {
  return (lon2 / Math.PI / 2 + 0.5) * tiles;
}

// src/client/utils/min2rad.ts
function min2rad(min2) {
  return min2 / 60 / 180 * Math.PI;
}

// src/client/utils/nm2px.ts
function nm2px(lat2) {
  const stretch = 1 / Math.cos(lat2);
  return position.tiles * tileSize / 360 / 60 * stretch;
}

// src/common/x2lon.ts
function x2lonCommon(x, tiles) {
  return (x / tiles - 0.5) * Math.PI * 2;
}

// src/client/utils/x2lon.ts
function x2lon(x, tiles = position.tiles) {
  return x2lonCommon(x, tiles);
}

// src/common/y2lat.ts
function y2latCommon(y, tiles) {
  return Math.asin(Math.tanh((0.5 - y / tiles) * 2 * Math.PI));
}

// src/client/utils/y2lat.ts
function y2lat(y, tiles = position.tiles) {
  return y2latCommon(y, tiles);
}

// src/client/containers/overlay/sphericCircle.ts
function sphericCircle(lat2, lon2, radius, steps = 256) {
  const sinRadius = Math.sin(radius);
  const cosRadius = Math.cos(radius);
  const sinLat = Math.sin(lat2);
  const cosLat = Math.cos(lat2);
  const pi2 = Math.PI * 2;
  const points = [];
  for (let step = 0; step <= steps; step++) {
    const omega = step / steps * pi2;
    const { lat2: lat22, lon2: lon22 } = sphericLatLon({ cosLat, cosRadius, lat: lat2, omega, radius, sinLat, sinRadius });
    if (step === 0)
      points.push([lat22, lon2 + Math.abs(lon22), false]);
    else if (step === steps / 2) {
      points.push([lat22, lon2 + Math.abs(lon22), true]);
      points.push([lat22, lon2 - Math.abs(lon22), false]);
    } else if (step === steps)
      points.push([lat22, lon2 - Math.abs(lon22), true]);
    else
      points.push([lat22, lon2 + lon22, true]);
  }
  return points;
}
function sphericLatLon({ cosLat, cosRadius, lat: lat2, omega, radius, sinLat, sinRadius }) {
  sinRadius ??= Math.sin(radius);
  cosRadius ??= Math.cos(radius);
  sinLat ??= Math.sin(lat2);
  cosLat ??= Math.cos(lat2);
  const pi2 = 2 * Math.PI;
  const lonSign = omega - pi2 * Math.floor(omega / pi2) > Math.PI ? -1 : 1;
  const sinLat2 = Math.max(-1, Math.min(Math.cos(omega) * cosLat * sinRadius + sinLat * cosRadius, 1));
  const lat22 = Math.asin(sinLat2);
  const cosLat2 = Math.sqrt(1 - sinLat2 * sinLat2);
  const cosLon2 = Math.max(-1, Math.min((cosRadius - sinLat * sinLat2) / cosLat / cosLat2, 1));
  const lon2 = Math.acos(cosLon2) * lonSign;
  const cosOmega2 = (sinLat - sinLat2 * cosRadius) / (cosLat2 * sinRadius);
  return { cosOmega2, lat2: lat22, lon2 };
}

// src/client/containers/overlay/crosshairs.ts
function drawCrosshair({
  context,
  width,
  x,
  y
}) {
  if (!settings.show.crosshair)
    return;
  const lat2 = y2lat(y);
  const lon2 = x2lon(x);
  const milesPerTile = 100 / nm2px(lat2);
  const scale = Math.log10(milesPerTile);
  const scaleFloor = Math.floor(scale);
  const scaleFrac = frac(scale);
  const milesPerArc = Math.pow(10, scaleFloor) * (scaleFrac < 0.3 ? 1 : scaleFrac > 0.7 ? 5 : 2);
  const milesPerDiv = milesPerArc / 10;
  let minLast = 0;
  context.beginPath();
  context.strokeStyle = "#ff0000";
  context.moveTo(-5, 5);
  context.lineTo(5, -5);
  context.moveTo(5, 5);
  context.lineTo(-5, -5);
  context.stroke();
  for (let minArc = milesPerArc; minArc < 10800; minArc += milesPerArc) {
    const radiusX = nm2px(lat2) * minArc;
    if (radiusX > width)
      break;
    const radDiv = min2rad(minArc);
    const circlePoints = sphericCircle(lat2, lon2, radDiv).map(([latPoint, lonPoint, draw]) => ({
      draw,
      tx: (lon2x(lonPoint) - x) * tileSize,
      ty: (lat2y(latPoint) - y) * tileSize
    }));
    context.beginPath();
    context.strokeStyle = "#ff0000";
    circlePoints.forEach(({ draw, tx, ty }, idx) => {
      if (draw)
        context.lineTo(tx, ty);
      else
        context.moveTo(tx, ty);
      if (idx === 96)
        context.strokeText(
          `${minArc.toFixed(Math.max(0, -scaleFloor))}nm`,
          tx,
          ty
        );
    });
    context.stroke();
    const piHalf = Math.PI / 2;
    context.beginPath();
    context.strokeStyle = "#ff0000";
    for (let minDiv = minLast + milesPerDiv; minDiv < minArc; minDiv += milesPerDiv) {
      const radDiv2 = min2rad(minDiv);
      if (lat2 + radDiv2 < piHalf) {
        const top = (lat2y(lat2 + radDiv2) - y) * tileSize;
        context.moveTo(-5, top);
        context.lineTo(5, top);
      }
      if (lat2 - radDiv2 > -piHalf) {
        const bottom = (lat2y(lat2 - radDiv2) - y) * tileSize;
        context.moveTo(-5, bottom);
        context.lineTo(5, bottom);
      }
      const { cosOmega2, lat2: lat22, lon2: lon22 } = sphericLatLon({
        lat: lat2,
        omega: piHalf,
        radius: radDiv2
      });
      const sinOmega2 = Math.sqrt(1 - cosOmega2 * cosOmega2);
      context.moveTo(
        (lon2x(lon2 + lon22) - x) * tileSize + cosOmega2 * 5,
        (lat2y(lat22) - y) * tileSize - sinOmega2 * 5
      );
      context.lineTo(
        (lon2x(lon2 + lon22) - x) * tileSize - cosOmega2 * 5,
        (lat2y(lat22) - y) * tileSize + sinOmega2 * 5
      );
      context.moveTo(
        (lon2x(lon2 - lon22) - x) * tileSize - cosOmega2 * 5,
        (lat2y(lat22) - y) * tileSize - sinOmega2 * 5
      );
      context.lineTo(
        (lon2x(lon2 - lon22) - x) * tileSize + cosOmega2 * 5,
        (lat2y(lat22) - y) * tileSize + sinOmega2 * 5
      );
    }
    context.stroke();
    minLast = minArc;
  }
}

// src/client/utils/px2nm.ts
function px2nm(lat2) {
  const stretch = 1 / Math.cos(lat2);
  return 360 * 60 / position.tiles / tileSize / stretch;
}

// src/client/utils/rad2string.ts
var rad2ModuloDeg = (phi) => modulo(phi * 180 / Math.PI + 180, 360) - 180;
var rad2stringFuncs = {
  d: ({ axis = " -", pad: pad2 = 0, phi }) => {
    const deg = Math.round(rad2ModuloDeg(phi) * 1e5) / 1e5;
    return `${axis[deg < 0 ? 1 : 0] ?? ""}${(deg < 0 ? -deg : deg).toFixed(5).padStart(pad2 + 6, "0")}\xB0`;
  },
  dm: ({ axis = " -", pad: pad2 = 0, phi }) => {
    const deg = Math.round(rad2ModuloDeg(phi) * 6e4) / 6e4;
    const degrees = deg | 0;
    const minutes = (Math.abs(deg) - Math.abs(degrees)) * 60;
    return `${axis[deg < 0 ? 1 : 0] ?? ""}${(deg < 0 ? -degrees : degrees).toFixed(0).padStart(pad2, "0")}\xB0${minutes.toFixed(3).padStart(6, "0")}'`;
  },
  dms: ({ axis = " -", pad: pad2 = 0, phi }) => {
    const deg = Math.round(rad2ModuloDeg(phi) * 36e4) / 36e4;
    const degrees = deg | 0;
    const min2 = Math.round((Math.abs(deg) - Math.abs(degrees)) * 36e4) / 6e3;
    const minutes = min2 | 0;
    const seconds = (min2 - minutes) * 60;
    return `${axis[deg < 0 ? 1 : 0] ?? ""}${(deg < 0 ? -degrees : degrees).toFixed(0).padStart(pad2, "0")}\xB0${minutes.toFixed(0).padStart(2, "0")}'${seconds.toFixed(2).padStart(5, "0")}"`;
  }
};
function rad2string({ axis = " -", pad: pad2 = 0, phi }) {
  return rad2stringFuncs[settings.units.coords]({ axis, pad: pad2, phi });
}

// src/client/containers/overlay/net.ts
var scales = [
  0.025,
  0.05,
  0.1,
  0.2,
  0.5,
  1,
  2,
  5,
  10,
  15,
  20,
  30,
  60,
  2 * 60,
  5 * 60,
  10 * 60,
  15 * 60,
  20 * 60,
  30 * 60,
  45 * 60
];
var getScale = (lat2, minPx = 100) => {
  const target = px2nm(lat2) * minPx;
  return min2rad(scales.reduce((prev, curr) => {
    return prev > target ? prev : curr;
  }, scales[0]));
};
var drawNet = ({
  context,
  height,
  width,
  x,
  y
}) => {
  const lat2 = y2lat(y);
  const scaleX = getScale(0, context.measureText(rad2string({ axis: "EW", pad: 3, phi: 0 })).width);
  const scaleY = getScale(lat2);
  const left = x - width / 2 / tileSize;
  const right = x + width / 2 / tileSize;
  const top = y - height / 2 / tileSize;
  const bottom = y + height / 2 / tileSize;
  const strokeText = (text, x2, y2) => {
    context.strokeText(text, x2, y2);
    context.fillText(text, x2, y2);
  };
  const latTop = Math.floor(y2lat(top) / scaleY) * scaleY;
  const latBottom = Math.ceil(y2lat(bottom) / scaleY) * scaleY;
  const pointsY = [];
  for (let ctr = 0; ctr < 1e3; ctr++) {
    const latGrid = latTop - scaleY * ctr;
    if (latGrid < latBottom)
      break;
    pointsY.push({
      latGrid,
      x1: (left - x) * tileSize,
      x2: (right - x) * tileSize,
      y1: (lat2y(latGrid) - y) * tileSize
    });
  }
  const lonLeft = Math.floor(x2lon(left) / scaleX) * scaleX;
  const lonRight = Math.ceil(x2lon(right) / scaleX) * scaleX;
  const pointsX = [];
  for (let ctr = 0; ctr < 1e3; ctr++) {
    const lonGrid = lonLeft + scaleX * ctr;
    if (lonGrid > lonRight)
      break;
    pointsX.push({
      lonGrid,
      x1: (lon2x(lonGrid) - x) * tileSize,
      y1: (top - y) * tileSize,
      y2: (bottom - y) * tileSize
    });
  }
  context.beginPath();
  context.strokeStyle = "#808080";
  pointsY.forEach(({ x1, x2, y1 }) => {
    context.moveTo(x1, y1);
    context.lineTo(x2, y1);
  });
  pointsX.forEach(({ x1, y1, y2 }) => {
    context.moveTo(x1, y1);
    context.lineTo(x1, y2);
  });
  context.stroke();
  context.beginPath();
  context.strokeStyle = "#ffffff";
  context.fillStyle = "#000000";
  context.lineWidth = 3;
  pointsY.forEach(({ latGrid, x1, y1 }) => {
    strokeText(
      rad2string({ axis: "NS", pad: 2, phi: latGrid }),
      x1 + 3,
      y1 - 3
    );
  });
  pointsX.forEach(({ lonGrid, x1, y2 }) => {
    strokeText(
      rad2string({ axis: "EW", pad: 3, phi: lonGrid }),
      x1 + 3,
      y2 - 3
    );
  });
  context.fill();
  context.stroke();
  position.markers.forEach((marker) => {
    const markerX = (marker.x - x) * tileSize;
    const markerY = (marker.y - y) * tileSize;
    const from = 40;
    const to = 10;
    context.beginPath();
    context.strokeStyle = "#000000";
    context.lineWidth = 3;
    context.arc(
      markerX,
      markerY,
      5,
      2 * Math.PI,
      0
    );
    context.moveTo(markerX + from, markerY);
    context.lineTo(markerX + to, markerY);
    context.moveTo(markerX - from, markerY);
    context.lineTo(markerX - to, markerY);
    context.moveTo(markerX, markerY + from);
    context.lineTo(markerX, markerY + to);
    context.moveTo(markerX, markerY - from);
    context.lineTo(markerX, markerY - to);
    context.stroke();
    context.beginPath();
    const colors = {
      navionics: "#00ff00",
      user: "#800000"
    };
    context.strokeStyle = colors[marker.type];
    context.lineWidth = 1;
    context.arc(
      markerX,
      markerY,
      5,
      2 * Math.PI,
      0
    );
    context.moveTo(markerX + from, markerY);
    context.lineTo(markerX + to, markerY);
    context.moveTo(markerX - from, markerY);
    context.lineTo(markerX - to, markerY);
    context.moveTo(markerX, markerY + from);
    context.lineTo(markerX, markerY + to);
    context.moveTo(markerX, markerY - from);
    context.lineTo(markerX, markerY - to);
    context.stroke();
  });
};

// src/client/containers/overlayContainer.ts
var OverlayContainer = class _OverlayContainer extends Container {
  constructor() {
    super(Container.from("div", {
      id: _OverlayContainer.name,
      style: containerStyle
    }));
  }
  redraw() {
    const { height, width } = this.html.getBoundingClientRect();
    const canvas = Container.from("canvas", {
      height,
      style: {
        height: "100%",
        position: "absolute",
        width: "100%"
      },
      width
    });
    const context = canvas.html.getContext("2d");
    this.clear();
    if (context) {
      const { x, y } = position;
      context.translate(width / 2, height / 2);
      drawCrosshair({ context, height, width, x, y });
      drawNet({ context, height, width, x, y });
      this.append(canvas);
    }
  }
};
var overlayContainer = new OverlayContainer();

// src/client/utils/deg2rad.ts
function deg2rad(val) {
  return Number(val) * Math.PI / 180;
}

// node_modules/@mc-styrsky/queue/lib/index.js
var StyQueue = class {
  constructor(defaultConcurrency = 5) {
    this.defaultConcurrency = defaultConcurrency;
    this.queue = [];
    this.working = 0;
  }
  defaultConcurrency;
  queue = [];
  working;
  queue2working = async () => {
    if (this.working < this.queue[0]?.concurrency) {
      const { args, func, resolve } = this.queue.shift();
      this.working++;
      resolve(await func(...args ?? []));
      this.working--;
      this.queue2working();
    }
  };
  get length() {
    return this.queue.length + this.working;
  }
  shift = () => this.queue.shift();
  pop = () => this.queue.pop();
  enqueue = (func, args, concurrency = this.defaultConcurrency) => {
    const promise = new Promise((resolve) => {
      this.queue.push({
        args,
        concurrency: concurrency < 1 ? 1 : concurrency,
        func,
        resolve
      });
    });
    this.queue2working();
    return promise;
  };
};

// src/client/utils/rad2deg.ts
function rad2deg(val) {
  return Number(val) * 180 / Math.PI;
}

// src/client/containers/infoBox/imagesToFetch.ts
var ImagesToFetch = class extends Container {
  constructor() {
    super();
  }
  xyz2string = ({ x, y, z: z2 }) => `${z2.toString(16)}_${x.toString(16)}_${y.toString(16)}`;
  data = {};
  total = {};
  getSet = (source) => this.data[source] ??= /* @__PURE__ */ new Set();
  add = ({ source, ...xyz }) => {
    this.getSet(source).add(this.xyz2string(xyz));
    this.total[source] = (this.total[source] ?? 0) + 1;
    infoBox.update();
  };
  delete = ({ source, ...xyz }) => {
    this.getSet(source).delete(this.xyz2string(xyz));
    if (this.getSet(source).size === 0) {
      delete this.data[source];
      delete this.total[source];
    }
    infoBox.update();
  };
  state = () => {
    return Object.entries(this.data).map(([key, val]) => [key, val.size]);
  };
  refresh = () => {
    this.clear();
    this.state().forEach(([source, size], idx) => {
      if (idx !== 0)
        this.append(Container.from("br"));
      this.append(`${source}: ${size}/${this.total[source]}`);
    });
  };
};
var imagesToFetch = new ImagesToFetch();

// src/client/containers/map/drawImage.ts
function drawImage({
  context,
  source,
  ttl: ttl2,
  x,
  y,
  z: z2
}) {
  if (z2 < layers[source].min)
    return Promise.resolve(false);
  const src = `/tile/${source}/${[
    z2,
    x.toString(16),
    y.toString(16)
  ].join("/")}?ttl=${ttl2}`;
  imagesToFetch.add({ source, x, y, z: z2 });
  return new Promise((resolve) => {
    const img = new Image();
    const onload = () => {
      context.drawImage(img, 0, 0);
      imagesToFetch.delete({ source, x, y, z: z2 });
      resolve(true);
    };
    const onerror = async () => {
      console.log("fallback", { source, x, y, z: z2 });
      const workerCanvas = new OffscreenCanvas(tileSize, tileSize);
      const workerContext = workerCanvas.getContext("2d");
      if (workerContext) {
        const draw = await drawCachedImage({
          alpha: 1,
          context: workerContext,
          source,
          ttl: ttl2,
          x: Math.floor(x / 2),
          y: Math.floor(y / 2),
          z: z2 - 1
        });
        const success = draw();
        if (success)
          context.drawImage(
            workerCanvas,
            (x & 1) * tileSize / 2,
            (y & 1) * tileSize / 2,
            tileSize / 2,
            tileSize / 2,
            0,
            0,
            tileSize,
            tileSize
          );
        imagesToFetch.delete({ source, x, y, z: z2 });
        resolve(success);
      } else {
        imagesToFetch.delete({ source, x, y, z: z2 });
        resolve(false);
      }
    };
    if (z2 > layers[source].max)
      onerror();
    else {
      img.src = src;
      img.onload = onload;
      img.onerror = onerror;
    }
  });
}

// src/client/containers/map/navionicsWatermark.ts
var navionicsWatermark = (async () => {
  const img = new Image();
  img.src = "/navionicsWatermark.png";
  const cnvs = new OffscreenCanvas(tileSize, tileSize);
  const ctx = cnvs.getContext("2d");
  if (!ctx)
    return null;
  return new Promise((resolve) => {
    img.onload = () => {
      ctx.drawImage(img, 0, 0);
      resolve(ctx.getImageData(0, 0, tileSize, tileSize).data);
    };
    img.onerror = () => {
      ctx.beginPath();
      ctx.fillStyle = "#f8f8f8f8";
      ctx.strokeStyle = "#f8f8f8f8";
      ctx.fillRect(0, 0, tileSize, tileSize);
      ctx.fill();
      ctx.stroke();
      resolve(ctx.getImageData(0, 0, tileSize, tileSize).data);
    };
  });
})().then((watermark) => {
  if (!watermark)
    return null;
  const ret = new Uint8ClampedArray(tileSize * tileSize);
  for (let i = 0; i < ret.length; i++) {
    ret[i] = watermark[i * 4];
  }
  return ret;
});

// src/client/containers/map/drawNavionics.ts
var backgroundColors = [
  2142456,
  // 0x38b8f8,
  // 0x48c0f8,
  // 0x50c0f8,
  // 0x58c0f8,
  // 0x58c8f8,
  // 0x60c8f8,
  // 0x68c8f8,
  // 0x70c8f8,
  // 0x78d0f8,
  // 0x80d0f8,
  // 0x88d0f8,
  // 0x88d8f8,
  // 0x90d8f8,
  // 0x98d8f8,
  // 0xa0d8f8,
  // 0xa8e0f8,
  // 0xb0e0f8,
  // 0xb8e0f8,
  // 0xc0e8f8,
  16316664,
  10012672
].reduce((arr, val) => {
  const r = val >> 16;
  const g = val >> 8 & 255;
  const b = val & 255;
  const diff = 1;
  const alpha = val === 10012672 ? 64 : 0;
  for (let dr = -diff; dr <= diff; dr++) {
    for (let dg = -diff; dg <= diff; dg++) {
      for (let db = -diff; db <= diff; db++) {
        arr.set((r + dr << 16) + (g + dg << 8) + b + db, alpha);
      }
    }
  }
  return arr;
}, /* @__PURE__ */ new Map());
async function drawNavionics({ context, source, ttl: ttl2, x, y, z: z2 }) {
  const workerCanvas = new OffscreenCanvas(tileSize, tileSize);
  const workerContext = workerCanvas.getContext("2d");
  const watermark = await navionicsWatermark;
  if (!workerContext || !watermark)
    return false;
  const drawProm = drawImage({ context: workerContext, source, ttl: ttl2, x, y, z: z2 });
  const draw = await drawProm;
  if (!draw)
    return false;
  imagesToFetch.add({ source: "transparent", x, y, z: z2 });
  const img = workerContext.getImageData(0, 0, tileSize, tileSize);
  const { data } = img;
  for (let i = 0; i < watermark.length; i++) {
    const mask = watermark[i];
    const subData = data.subarray(i * 4, i * 4 + 4);
    const [r, g, b, a] = subData.map((v) => v * 248 / mask);
    const color = (r << 16) + (g << 8) + b;
    subData[0] = r;
    subData[1] = g;
    subData[2] = b;
    subData[3] = backgroundColors.get(color) ?? a;
  }
  workerContext.putImageData(img, 0, 0);
  imagesToFetch.delete({ source: "transparent", x, y, z: z2 });
  context.drawImage(workerCanvas, 0, 0);
  return true;
}

// src/client/containers/map/drawCachedImage.ts
var imagesMap = {};
async function drawCachedImage({
  alpha,
  context,
  source,
  ttl: ttl2,
  x,
  y,
  z: z2
}) {
  const isNavionics = source === "navionics";
  const src = `/${source}/${[
    z2,
    modulo(x, position.tiles).toString(16),
    modulo(y, position.tiles).toString(16)
  ].join("/")}`;
  const drawCanvas = (cnvs) => {
    context.globalAlpha = alpha;
    context.drawImage(cnvs, 0, 0);
  };
  const cachedCanvas = await imagesMap[src];
  if (cachedCanvas)
    return () => {
      drawCanvas(cachedCanvas);
      return true;
    };
  const workerCanvas = new OffscreenCanvas(tileSize, tileSize);
  const workerContext = workerCanvas.getContext("2d");
  if (!workerContext)
    return () => true;
  const successProm = isNavionics ? drawNavionics({ context: workerContext, source, ttl: ttl2, x, y, z: z2 }) : drawImage({ context: workerContext, source, ttl: ttl2, x, y, z: z2 });
  imagesMap[src] = successProm.then((success2) => success2 ? workerCanvas : null);
  const success = await successProm;
  return () => {
    if (success)
      drawCanvas(workerCanvas);
    return true;
  };
}

// src/client/containers/map/mapTile.ts
var pad = (1 << zoomMax).toString().length + 1;
var MapTile = class _MapTile extends Container {
  static id({ x, y, z: z2 }) {
    return `z:${z2.toFixed(0).padStart(2, " ")}, x:${x.toFixed(0).padStart(pad, " ")}, y:${y.toFixed(0).padStart(pad, " ")}`;
  }
  static distance({ x, y, z: z2 }, ref) {
    const scale = (1 << ref.z) / (1 << z2);
    const dx = (x + 0.5) * scale - ref.x;
    const dy = (y + 0.5) * scale - ref.y;
    return Math.sqrt(dx * dx + dy * dy);
  }
  constructor({ x, y, z: z2 }) {
    const width = tileSize;
    const height = tileSize;
    const ttl2 = Math.max(Math.min(17, z2 + Math.max(0, position.ttl)) - z2, 0);
    super(Container.from("canvas", {
      dataset: {
        x: x.toFixed(0),
        y: y.toFixed(0),
        z: z2.toFixed(0)
      },
      style: {
        height: `${height}px`,
        left: "50%",
        position: "absolute",
        top: "50%",
        width: `${width}px`
      }
    }));
    this.x = x;
    this.y = y;
    this.z = z2;
    this.id = _MapTile.id({ x, y, z: z2 });
    this.html.width = width;
    this.html.height = height;
    const context = this.html.getContext("2d");
    if (context) {
      Promise.all(settings.tiles.map(async (entry) => {
        const { alpha, source } = entry;
        return await drawCachedImage({ alpha, context, source, ttl: ttl2, x, y, z: z2 });
      })).then((draws) => draws.reduce(
        (prom, draw) => prom.then(() => draw()),
        Promise.resolve(true)
      ));
    }
  }
  x;
  y;
  z;
  moveTo({ x, y, z: z2 }) {
    const scaleZ = z2 >= this.z ? 1 << z2 - this.z : 1 / (1 << this.z - z2);
    const size = tileSize * scaleZ;
    this.html.style.height = `${size}px`;
    this.html.style.width = `${size}px`;
    this.html.style.transform = `translate(${Math.floor((this.x * scaleZ - x) * tileSize)}px, ${Math.floor((this.y * scaleZ - y) * tileSize)}px)`;
  }
  id;
};

// src/client/containers/menu/baselayerMenu.ts
var BaselayerMenu = class _BaselayerMenu extends Container {
  static baselayerLabel = (source) => `${layers[source].label} (${baselayers.indexOf(source)})`;
  constructor() {
    super(Container.from("div", {
      classes: ["dropdown"]
    }));
    this.append(
      this.baselayerMenuButton,
      Container.from("ul", {
        classes: ["dropdown-menu"]
      }).append(
        Container.from("li").append(
          ...baselayers.map((source) => {
            return Container.from("a", {
              classes: ["dropdown-item"],
              onclick: () => mapContainer.baselayer = source
            }).append(_BaselayerMenu.baselayerLabel(source));
          })
        )
      )
    );
  }
  set baselayerLabel(val) {
    this.baselayerMenuButton.html.innerText = val;
  }
  baselayerMenuButton = Container.from("a", {
    classes: ["btn", "btn-secondary", "dropdown-toggle"],
    dataset: {
      bsToggle: "dropdown"
    },
    role: "button"
  }).append(_BaselayerMenu.baselayerLabel(settings.baselayer));
};
var baselayerMenu = new BaselayerMenu();

// src/client/containers/mapContainer.ts
var MapContainer = class _MapContainer extends Container {
  constructor() {
    super(Container.from("div", {
      id: _MapContainer.name,
      style: containerStyle
    }));
  }
  mapTiles = /* @__PURE__ */ new Map();
  set baselayer(baselayer) {
    settings.baselayer = baselayer;
    baselayerMenu.baselayerLabel = BaselayerMenu.baselayerLabel(baselayer);
    this.mapTiles.clear();
    mapContainer.redraw("changed baselayer");
  }
  redraw(type) {
    const { height, width } = boundingRect;
    const { tiles, ttl: ttl2, x, y, z: z2 } = position;
    infoBox.update();
    console.log(`${type} redraw@${(/* @__PURE__ */ new Date()).toISOString()}`);
    const maxdx = Math.ceil(x + width / 2 / tileSize);
    const maxdy = Math.ceil(y + height / 2 / tileSize);
    const mindx = Math.floor(x - width / 2 / tileSize);
    const mindy = Math.floor(y - height / 2 / tileSize);
    const txArray = [];
    for (let tx = mindx; tx < maxdx; tx++) {
      txArray.push(tx);
      if (tx < 0)
        txArray.push(tx + tiles);
      if (tx > tiles)
        txArray.push(tx - tiles);
    }
    const tyArray = [];
    for (let ty = mindy; ty < maxdy; ty++) {
      if (ty >= 0 && ty < tiles)
        tyArray.push(ty);
    }
    const tileIds = /* @__PURE__ */ new Map();
    for (let tz = zoomMin; tz <= z2; tz++) {
      txArray.forEach((tx) => {
        tyArray.forEach((ty) => {
          const xyz = {
            x: tx >> z2 - tz,
            y: ty >> z2 - tz,
            z: tz
          };
          const id = MapTile.id(xyz);
          tileIds.set(id, xyz);
        });
      });
    }
    this.html.innerHTML = "";
    const sortedTiles = [...tileIds.entries()].sort(([, a], [, b]) => {
      if (a.z === b.z)
        return MapTile.distance(a, position) - MapTile.distance(b, position);
      if (a.z === z2)
        return 1;
      if (b.z === z2)
        return -1;
      if (a.z > z2 && b.z > z2)
        return b.z - a.z;
      return a.z - b.z;
    });
    sortedTiles.forEach(([id, xyz]) => {
      const tile = this.mapTiles.get(id) ?? (() => {
        const t = new MapTile(xyz);
        this.mapTiles.set(t.id, t);
        return t;
      })();
      this.append(tile);
      tile.moveTo({ x, y, z: z2 });
    });
    (() => {
      const { origin, pathname, search } = window.location;
      const newsearch = `?${[
        ["z", z2],
        ["ttl", ttl2],
        ["lat", rad2deg(y2lat(y)).toFixed(5)],
        ["lon", rad2deg(x2lon(x)).toFixed(5)]
      ].map(([k, v]) => `${k}=${v}`).join("&")}`;
      if (newsearch !== search) {
        const newlocation = `${origin}${pathname}${newsearch}`;
        window.history.pushState({ path: newlocation }, "", newlocation);
      }
      new LocalStorageItem("settings").set(settings);
    })();
  }
};
var mapContainer = new MapContainer();

// src/client/globals/marker.ts
var Marker = class {
  constructor({ id = "", lat: lat2, lon: lon2, type }) {
    this.lat = lat2;
    this.lon = lon2;
    this.type = type;
    this.id = id;
    position.markers.set(type, this);
  }
  lat;
  lon;
  id;
  get x() {
    return lon2x(this.lon);
  }
  get y() {
    return lat2y(this.lat);
  }
  type;
  delete() {
    position.markers.delete(this.type);
  }
};

// src/client/utils/htmlElements/spinner.ts
var Spinner = class extends Container {
  constructor() {
    super(Container.from("div", {
      classes: ["d-flex"]
    }));
    this.append(
      Container.from("div", {
        classes: [
          "spinner-border",
          "spinner-border-sm"
        ],
        style: {
          margin: "auto"
        }
      })
    );
  }
};

// src/client/utils/htmlElements/iconButton.ts
var BootstrapIcon = class extends Container {
  constructor({ fontSize = "175%", icon }) {
    super(Container.from("i", {
      classes: [`bi-${icon}`],
      style: { fontSize }
    }));
  }
};
var IconButton = class extends Container {
  constructor({
    active = () => false,
    fontSize,
    icon,
    onclick = () => void 0,
    src,
    style
  }) {
    super(Container.from("a", {
      classes: ["btn", active() ? "btn-success" : "btn-secondary"],
      role: "button",
      style: {
        padding: "0.25rem",
        ...style
      }
    }));
    this.append(
      icon ? new BootstrapIcon({ fontSize, icon }) : Container.from("img", {
        src,
        style: {
          height: "1.75rem"
        }
      })
    );
    this.html.onclick = () => {
      onclick();
      if (active()) {
        this.html.classList.add("btn-success");
        this.html.classList.remove("btn-secondary");
      } else {
        this.html.classList.add("btn-secondary");
        this.html.classList.remove("btn-success");
      }
      mapContainer.clear();
      mapContainer.redraw("icon clicked");
    };
  }
};

// src/client/utils/htmlElements/navionicsDetails/goto.ts
var NavionicsGoto = class extends Container {
  constructor(item) {
    super(Container.from("a", {
      onclick: (event) => {
        const { lat: lat2, lon: lon2 } = item.position;
        position.xyz = {
          x: lon2x(lon2),
          y: lat2y(lat2)
        };
        mapContainer.redraw("goto");
        event.stopPropagation();
      },
      style: {
        marginLeft: "auto",
        padding: "0.25rem"
      }
    }));
    this.append(new BootstrapIcon({ icon: "arrow-right-circle" }));
  }
};

// src/client/utils/htmlElements/navionicsDetails/icon.ts
var NavionicsIcon = class extends Container {
  constructor(item) {
    super(Container.from("div", {
      classes: ["d-flex"],
      style: {
        height: "2em",
        width: "2em"
      }
    }));
    this.append(
      Container.from("div", {
        style: {
          margin: "auto"
        }
      }).append(
        Container.from("img", {
          src: `/navionics/icon/${encodeURIComponent(item.icon_id)}`,
          style: {
            maxHeight: "1.5em",
            maxWidth: "1.5em"
          }
        })
      )
    );
  }
};

// src/client/utils/htmlElements/navionicsDetails/itemDetails.ts
var NavionicsItemDetails = class extends Container {
  constructor(item, itemId, accordionId) {
    super(Container.from("div", {
      classes: ["accordion-collapse", "collapse", "px-2"],
      dataset: {
        bsParent: `#${accordionId}`
      },
      id: itemId
    }));
    if (item.properties)
      item.properties.forEach((prop) => {
        this.append(Container.from("p").append(prop));
      });
  }
};

// src/client/utils/htmlElements/navionicsDetails/label.ts
var NavionicsItemLabel = class extends Container {
  constructor(item) {
    super(Container.from("div", {
      classes: ["d-flex"]
    }));
    this.append(
      Container.from("div", {
        style: {
          margin: "auto"
        }
      }).append(item.name).append(
        Container.from("div", {
          style: {
            fontSize: "70%",
            marginLeft: "0.5rem"
          }
        }).append(item.distance.toFixed(3), "nm")
      )
    );
  }
};

// src/client/utils/htmlElements/navionicsDetails/accordionItem.ts
var AccordionItem = class extends Container {
  constructor({ accordionId, idx, item, parent }) {
    const itemId = `navionicsDetailsItem${idx}`;
    super(Container.from("div", {
      classes: [
        "accordion-item",
        "mm-menu-text"
      ]
    }));
    this.append(
      Container.from("div", {
        classes: [
          "accordion-header",
          "mm-menu-text"
        ],
        onmousemove: (event) => {
          event.stopPropagation();
          if (parent.marker?.id !== item.id) {
            parent.marker = new Marker({
              ...item.position,
              id: item.id,
              type: "navionics"
            });
            mapContainer.redraw("set navionics marker");
          }
        }
      }).append(
        Container.from("div", {
          classes: [
            ...item.properties ? ["accordion-button", "collapsed"] : ["d-flex"],
            "px-2",
            "py-0",
            "mm-menu-text"
          ],
          dataset: item.properties ? {
            bsTarget: `#${itemId}`,
            bsToggle: "collapse"
          } : {}
        }).append(
          Container.from("div", {
            classes: ["d-flex"],
            style: {
              width: "100%"
            }
          }).append(
            new NavionicsIcon(item),
            new NavionicsItemLabel(item),
            item.position ? new NavionicsGoto(item) : null,
            item.details && !item.properties ? new Spinner() : null
          )
        )
      )
    );
    if (item.properties)
      this.append(new NavionicsItemDetails(item, itemId, accordionId));
  }
};

// src/client/utils/htmlElements/navionicsDetails/accordion.ts
var Accordion = class _Accordion extends Container {
  constructor({ items, offset, parent }) {
    const accordionId = `navionicsDetailsList${offset ?? ""}`;
    super(Container.from("div", {
      classes: ["accordion"],
      id: accordionId
    }));
    if (items.length <= 10)
      items.forEach((item, idx) => {
        this.append(new AccordionItem({
          accordionId,
          idx: idx + (offset ?? 0),
          item,
          parent
        }));
      });
    else {
      for (let i = 0; i < items.length; i += 10) {
        const itemId = `navionicsDetailsItemList${i}`;
        const itemsSlice = items.slice(i, i + 10);
        this.append(
          Container.from("div", {
            classes: [
              "accordion-item",
              "mm-menu-text"
            ]
          }).append(
            Container.from("div", {
              classes: [
                "accordion-header",
                "mm-menu-text"
              ]
            }).append(
              Container.from("div", {
                classes: [
                  "accordion-button",
                  "collapsed",
                  "px-2",
                  "py-0",
                  "mm-menu-text"
                ],
                dataset: {
                  bsTarget: `#${itemId}`,
                  bsToggle: "collapse"
                }
              }).append(
                Container.from("div", {
                  classes: ["d-flex"],
                  style: {
                    width: "100%"
                  }
                }).append(
                  itemsSlice.length === 1 ? `${i + 1}` : `${i + 1}-${i + itemsSlice.length}`
                )
              )
            )
          ).append(
            Container.from("div", {
              classes: ["accordion-collapse", "collapse", "px-2", i === 0 ? "show" : null],
              dataset: {
                bsParent: `#${accordionId}`
              },
              id: itemId
            }).append(new _Accordion({ items: itemsSlice, offset: i, parent }))
          )
        );
      }
    }
  }
};

// src/client/utils/htmlElements/navionicsDetails.ts
var NavionicsDetails = class extends Container {
  constructor() {
    super();
    this.queue.enqueue(() => new Promise((r) => setInterval(r, 1)));
  }
  isFetch = false;
  fetchProgress = "";
  list = /* @__PURE__ */ new Map();
  marker;
  queue = new StyQueue(1);
  abortControllers = /* @__PURE__ */ new Set();
  add = (item) => {
    this.list.set(item.id, item);
    this.refresh();
  };
  delete = (item) => {
    this.list.delete(item.id);
    this.refresh();
  };
  refresh = () => {
    this.clear();
    this.append(new Accordion({
      items: [...this.list.values()].sort((a, b) => a.distance - b.distance),
      parent: this
    }));
    if (this.isFetch)
      this.append(
        Container.from("div", {
          classes: [
            "accordion-item",
            "mm-menu-text"
          ]
        }).append(
          Container.from("div", {
            classes: [
              "accordion-header",
              "mm-menu-text"
            ]
          }).append(
            Container.from("div", {
              classes: [
                "d-flex",
                "mm-menu-text"
              ]
            }).append(
              this.fetchProgress,
              Container.from("div", {
                classes: [
                  "spinner-border",
                  "spinner-border-sm"
                ],
                style: {
                  margin: "auto"
                }
              })
            )
          )
        )
      );
    infoBox.update();
  };
  async fetch({ x, y, z: z2 }) {
    while (this.queue.shift())
      /* @__PURE__ */ (() => void 0)();
    this.abortControllers.forEach((ac) => {
      ac.abort();
      this.abortControllers.delete(ac);
    });
    if (!settings.show.navionicsDetails)
      return;
    const listMap = /* @__PURE__ */ new Map();
    await this.queue.enqueue(async () => {
      this.isFetch = true;
      this.list.clear();
      this.refresh();
      const abortController = new AbortController();
      this.abortControllers.add(abortController);
      const { signal } = abortController;
      const max2 = 4;
      const perTile = 20;
      const points = [{
        dx: Math.round(x * tileSize) / tileSize,
        dy: Math.round(y * tileSize) / tileSize,
        radius: 0
      }];
      for (let iX = -max2; iX < max2; iX++) {
        for (let iY = -max2; iY < max2; iY++) {
          const dx = Math.ceil(x * perTile + iX) / perTile;
          const dy = Math.ceil(y * perTile + iY) / perTile;
          const radius = Math.sqrt((dx - x) * (dx - x) + (dy - y) * (dy - y));
          points.push({ dx, dy, radius });
        }
      }
      let done = 0;
      await points.sort((a, b) => a.radius - b.radius).reduce(async (prom, { dx, dy }) => {
        const ret = fetch(`/navionics/quickinfo/${z2}/${dx}/${dy}`, { signal }).then(async (res) => {
          if (!res.ok)
            return;
          const body = await res.json();
          await Promise.all((body.items ?? []).map(async (item) => {
            if (listMap.has(item.id))
              return;
            if ([
              "depth_area",
              "depth_contour"
            ].includes(item.category_id))
              return;
            listMap.set(item.id, item);
            const {
              category_id,
              details,
              icon_id,
              id,
              name,
              position: position2
            } = extractProperties(item, {
              category_id: String,
              details: Boolean,
              icon_id: String,
              id: String,
              name: String,
              position: ({ lat: lat2, lon: lon2 }) => ({
                lat: deg2rad(lat2),
                lon: deg2rad(lon2),
                x: lon2x(deg2rad(lon2)),
                y: lat2y(deg2rad(lat2))
              })
            });
            const pdx = position2.x - x;
            const pdy = position2.y - y;
            const distance = Math.sqrt(pdx * pdx + pdy * pdy) * tileSize * px2nm(position2.lat);
            this.add({
              category_id,
              details,
              distance,
              icon_id,
              id,
              name,
              position: position2
            });
            if (item.details) {
              const { label, properties } = extractProperties(
                await fetch(`/navionics/objectinfo/${item.id}`, { signal }).then(async (res2) => res2.ok ? await res2.json() : {}).catch(() => {
                }),
                {
                  label: String,
                  properties: (val) => val?.map(({ label: label2 }) => label2)?.filter(Boolean)
                }
              );
              this.add({
                category_id,
                details,
                distance,
                icon_id,
                id,
                label,
                name,
                position: position2,
                properties
              });
            }
          }));
        }).catch((rej) => console.error(rej));
        await ret;
        done++;
        this.fetchProgress = `${done}/${points.length}`;
        this.refresh();
        infoBox.update();
        return prom;
      }, Promise.resolve());
      this.abortControllers.delete(abortController);
      this.isFetch = false;
    });
    this.refresh();
  }
};
var navionicsDetails = new NavionicsDetails();

// src/client/globals/position.ts
var Position = class {
  constructor({ ttl: ttl2, x, y, z: z2 }) {
    this.xyz = { x, y, z: z2 };
    this._ttl = ttl2;
    this.map = { x, y, z: z2 };
  }
  set ttl(val) {
    this._ttl = val;
  }
  get ttl() {
    return this._ttl;
  }
  get x() {
    return this._x;
  }
  get y() {
    return this._y;
  }
  get z() {
    return this._z;
  }
  set xyz({ x = this._x, y = this._y, z: z2 = this._z }) {
    this._z = z2;
    this._tiles = 1 << z2;
    this._x = modulo(x, this._tiles);
    this._y = Math.max(0, Math.min(y, this._tiles));
    setTimeout(() => overlayContainer.redraw(), 1);
    if (!mouse.down.state)
      setTimeout(() => navionicsDetails.fetch(this), 100);
  }
  get xyz() {
    return {
      x: this._x,
      y: this._y,
      z: this._z
    };
  }
  get tiles() {
    return this._tiles;
  }
  zoomIn = () => {
    if (this._z < zoomMax) {
      this.xyz = {
        x: this._x * 2,
        y: this._y * 2,
        z: this._z + 1
      };
      return true;
    }
    return false;
  };
  zoomOut = () => {
    if (this.z > zoomMin) {
      this.xyz = {
        x: this._x /= 2,
        y: this._y /= 2,
        z: this._z - 1
      };
      return true;
    }
    return false;
  };
  map;
  markers = /* @__PURE__ */ new Map();
  user = {
    accuracy: 0,
    latitude: 0,
    longitude: 0,
    timestamp: 0
  };
  _ttl;
  _x = 0;
  _y = 0;
  _z = 0;
  _tiles = 0;
};
var searchParams = Object.fromEntries(new URL(window.location.href).searchParams.entries());
var { lat, lon, ttl, z } = extractProperties(searchParams, {
  lat: (val) => Number(val) ? deg2rad(parseFloat(val)) : 0,
  lon: (val) => Number(val) ? deg2rad(parseFloat(val)) : 0,
  ttl: (val) => Number(val) ? parseInt(val) : 0,
  z: (val) => Number(val) ? parseInt(val) : 2
});
var position = new Position({
  ttl,
  x: lon2x(lon, 1 << z),
  y: lat2y(lat, 1 << z),
  z
});

// src/client/globals/halfDay.ts
var halfDay = 12 * 3600 * 1e3;

// node_modules/date-fns/toDate.mjs
function toDate(argument) {
  const argStr = Object.prototype.toString.call(argument);
  if (argument instanceof Date || typeof argument === "object" && argStr === "[object Date]") {
    return new argument.constructor(+argument);
  } else if (typeof argument === "number" || argStr === "[object Number]" || typeof argStr === "string" || argStr === "[object String]") {
    return new Date(argument);
  } else {
    return /* @__PURE__ */ new Date(NaN);
  }
}

// node_modules/date-fns/constructFrom.mjs
function constructFrom(date, value) {
  if (date instanceof Date) {
    return new date.constructor(value);
  } else {
    return new Date(value);
  }
}

// node_modules/date-fns/addDays.mjs
function addDays(date, amount) {
  const _date = toDate(date);
  if (isNaN(amount))
    return constructFrom(date, NaN);
  if (!amount) {
    return _date;
  }
  _date.setDate(_date.getDate() + amount);
  return _date;
}

// node_modules/date-fns/addMonths.mjs
function addMonths(date, amount) {
  const _date = toDate(date);
  if (isNaN(amount))
    return constructFrom(date, NaN);
  if (!amount) {
    return _date;
  }
  const dayOfMonth = _date.getDate();
  const endOfDesiredMonth = constructFrom(date, _date.getTime());
  endOfDesiredMonth.setMonth(_date.getMonth() + amount + 1, 0);
  const daysInMonth = endOfDesiredMonth.getDate();
  if (dayOfMonth >= daysInMonth) {
    return endOfDesiredMonth;
  } else {
    _date.setFullYear(
      endOfDesiredMonth.getFullYear(),
      endOfDesiredMonth.getMonth(),
      dayOfMonth
    );
    return _date;
  }
}

// node_modules/date-fns/add.mjs
function add(date, duration) {
  const {
    years = 0,
    months = 0,
    weeks = 0,
    days = 0,
    hours = 0,
    minutes = 0,
    seconds = 0
  } = duration;
  const _date = toDate(date);
  const dateWithMonths = months || years ? addMonths(_date, months + years * 12) : _date;
  const dateWithDays = days || weeks ? addDays(dateWithMonths, days + weeks * 7) : dateWithMonths;
  const minutesToAdd = minutes + hours * 60;
  const secondsToAdd = seconds + minutesToAdd * 60;
  const msToAdd = secondsToAdd * 1e3;
  const finalDate = constructFrom(date, dateWithDays.getTime() + msToAdd);
  return finalDate;
}

// node_modules/date-fns/constants.mjs
var daysInYear = 365.2425;
var maxTime = Math.pow(10, 8) * 24 * 60 * 60 * 1e3;
var minTime = -maxTime;
var millisecondsInWeek = 6048e5;
var millisecondsInDay = 864e5;
var secondsInHour = 3600;
var secondsInDay = secondsInHour * 24;
var secondsInWeek = secondsInDay * 7;
var secondsInYear = secondsInDay * daysInYear;
var secondsInMonth = secondsInYear / 12;
var secondsInQuarter = secondsInMonth * 3;

// node_modules/date-fns/_lib/defaultOptions.mjs
var defaultOptions = {};
function getDefaultOptions() {
  return defaultOptions;
}

// node_modules/date-fns/startOfWeek.mjs
function startOfWeek(date, options) {
  const defaultOptions2 = getDefaultOptions();
  const weekStartsOn = options?.weekStartsOn ?? options?.locale?.options?.weekStartsOn ?? defaultOptions2.weekStartsOn ?? defaultOptions2.locale?.options?.weekStartsOn ?? 0;
  const _date = toDate(date);
  const day = _date.getDay();
  const diff = (day < weekStartsOn ? 7 : 0) + day - weekStartsOn;
  _date.setDate(_date.getDate() - diff);
  _date.setHours(0, 0, 0, 0);
  return _date;
}

// node_modules/date-fns/startOfISOWeek.mjs
function startOfISOWeek(date) {
  return startOfWeek(date, { weekStartsOn: 1 });
}

// node_modules/date-fns/getISOWeekYear.mjs
function getISOWeekYear(date) {
  const _date = toDate(date);
  const year = _date.getFullYear();
  const fourthOfJanuaryOfNextYear = constructFrom(date, 0);
  fourthOfJanuaryOfNextYear.setFullYear(year + 1, 0, 4);
  fourthOfJanuaryOfNextYear.setHours(0, 0, 0, 0);
  const startOfNextYear = startOfISOWeek(fourthOfJanuaryOfNextYear);
  const fourthOfJanuaryOfThisYear = constructFrom(date, 0);
  fourthOfJanuaryOfThisYear.setFullYear(year, 0, 4);
  fourthOfJanuaryOfThisYear.setHours(0, 0, 0, 0);
  const startOfThisYear = startOfISOWeek(fourthOfJanuaryOfThisYear);
  if (_date.getTime() >= startOfNextYear.getTime()) {
    return year + 1;
  } else if (_date.getTime() >= startOfThisYear.getTime()) {
    return year;
  } else {
    return year - 1;
  }
}

// node_modules/date-fns/startOfDay.mjs
function startOfDay(date) {
  const _date = toDate(date);
  _date.setHours(0, 0, 0, 0);
  return _date;
}

// node_modules/date-fns/_lib/getTimezoneOffsetInMilliseconds.mjs
function getTimezoneOffsetInMilliseconds(date) {
  const utcDate = new Date(
    Date.UTC(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      date.getHours(),
      date.getMinutes(),
      date.getSeconds(),
      date.getMilliseconds()
    )
  );
  utcDate.setUTCFullYear(date.getFullYear());
  return date.getTime() - utcDate.getTime();
}

// node_modules/date-fns/differenceInCalendarDays.mjs
function differenceInCalendarDays(dateLeft, dateRight) {
  const startOfDayLeft = startOfDay(dateLeft);
  const startOfDayRight = startOfDay(dateRight);
  const timestampLeft = startOfDayLeft.getTime() - getTimezoneOffsetInMilliseconds(startOfDayLeft);
  const timestampRight = startOfDayRight.getTime() - getTimezoneOffsetInMilliseconds(startOfDayRight);
  return Math.round((timestampLeft - timestampRight) / millisecondsInDay);
}

// node_modules/date-fns/startOfISOWeekYear.mjs
function startOfISOWeekYear(date) {
  const year = getISOWeekYear(date);
  const fourthOfJanuary = constructFrom(date, 0);
  fourthOfJanuary.setFullYear(year, 0, 4);
  fourthOfJanuary.setHours(0, 0, 0, 0);
  return startOfISOWeek(fourthOfJanuary);
}

// node_modules/date-fns/isDate.mjs
function isDate(value) {
  return value instanceof Date || typeof value === "object" && Object.prototype.toString.call(value) === "[object Date]";
}

// node_modules/date-fns/isValid.mjs
function isValid(date) {
  if (!isDate(date) && typeof date !== "number") {
    return false;
  }
  const _date = toDate(date);
  return !isNaN(Number(_date));
}

// node_modules/date-fns/startOfYear.mjs
function startOfYear(date) {
  const cleanDate = toDate(date);
  const _date = constructFrom(date, 0);
  _date.setFullYear(cleanDate.getFullYear(), 0, 1);
  _date.setHours(0, 0, 0, 0);
  return _date;
}

// node_modules/date-fns/locale/en-US/_lib/formatDistance.mjs
var formatDistanceLocale = {
  lessThanXSeconds: {
    one: "less than a second",
    other: "less than {{count}} seconds"
  },
  xSeconds: {
    one: "1 second",
    other: "{{count}} seconds"
  },
  halfAMinute: "half a minute",
  lessThanXMinutes: {
    one: "less than a minute",
    other: "less than {{count}} minutes"
  },
  xMinutes: {
    one: "1 minute",
    other: "{{count}} minutes"
  },
  aboutXHours: {
    one: "about 1 hour",
    other: "about {{count}} hours"
  },
  xHours: {
    one: "1 hour",
    other: "{{count}} hours"
  },
  xDays: {
    one: "1 day",
    other: "{{count}} days"
  },
  aboutXWeeks: {
    one: "about 1 week",
    other: "about {{count}} weeks"
  },
  xWeeks: {
    one: "1 week",
    other: "{{count}} weeks"
  },
  aboutXMonths: {
    one: "about 1 month",
    other: "about {{count}} months"
  },
  xMonths: {
    one: "1 month",
    other: "{{count}} months"
  },
  aboutXYears: {
    one: "about 1 year",
    other: "about {{count}} years"
  },
  xYears: {
    one: "1 year",
    other: "{{count}} years"
  },
  overXYears: {
    one: "over 1 year",
    other: "over {{count}} years"
  },
  almostXYears: {
    one: "almost 1 year",
    other: "almost {{count}} years"
  }
};
var formatDistance = (token, count, options) => {
  let result;
  const tokenValue = formatDistanceLocale[token];
  if (typeof tokenValue === "string") {
    result = tokenValue;
  } else if (count === 1) {
    result = tokenValue.one;
  } else {
    result = tokenValue.other.replace("{{count}}", count.toString());
  }
  if (options?.addSuffix) {
    if (options.comparison && options.comparison > 0) {
      return "in " + result;
    } else {
      return result + " ago";
    }
  }
  return result;
};

// node_modules/date-fns/locale/_lib/buildFormatLongFn.mjs
function buildFormatLongFn(args) {
  return (options = {}) => {
    const width = options.width ? String(options.width) : args.defaultWidth;
    const format2 = args.formats[width] || args.formats[args.defaultWidth];
    return format2;
  };
}

// node_modules/date-fns/locale/en-US/_lib/formatLong.mjs
var dateFormats = {
  full: "EEEE, MMMM do, y",
  long: "MMMM do, y",
  medium: "MMM d, y",
  short: "MM/dd/yyyy"
};
var timeFormats = {
  full: "h:mm:ss a zzzz",
  long: "h:mm:ss a z",
  medium: "h:mm:ss a",
  short: "h:mm a"
};
var dateTimeFormats = {
  full: "{{date}} 'at' {{time}}",
  long: "{{date}} 'at' {{time}}",
  medium: "{{date}}, {{time}}",
  short: "{{date}}, {{time}}"
};
var formatLong = {
  date: buildFormatLongFn({
    formats: dateFormats,
    defaultWidth: "full"
  }),
  time: buildFormatLongFn({
    formats: timeFormats,
    defaultWidth: "full"
  }),
  dateTime: buildFormatLongFn({
    formats: dateTimeFormats,
    defaultWidth: "full"
  })
};

// node_modules/date-fns/locale/en-US/_lib/formatRelative.mjs
var formatRelativeLocale = {
  lastWeek: "'last' eeee 'at' p",
  yesterday: "'yesterday at' p",
  today: "'today at' p",
  tomorrow: "'tomorrow at' p",
  nextWeek: "eeee 'at' p",
  other: "P"
};
var formatRelative = (token, _date, _baseDate, _options) => formatRelativeLocale[token];

// node_modules/date-fns/locale/_lib/buildLocalizeFn.mjs
function buildLocalizeFn(args) {
  return (value, options) => {
    const context = options?.context ? String(options.context) : "standalone";
    let valuesArray;
    if (context === "formatting" && args.formattingValues) {
      const defaultWidth = args.defaultFormattingWidth || args.defaultWidth;
      const width = options?.width ? String(options.width) : defaultWidth;
      valuesArray = args.formattingValues[width] || args.formattingValues[defaultWidth];
    } else {
      const defaultWidth = args.defaultWidth;
      const width = options?.width ? String(options.width) : args.defaultWidth;
      valuesArray = args.values[width] || args.values[defaultWidth];
    }
    const index = args.argumentCallback ? args.argumentCallback(value) : value;
    return valuesArray[index];
  };
}

// node_modules/date-fns/locale/en-US/_lib/localize.mjs
var eraValues = {
  narrow: ["B", "A"],
  abbreviated: ["BC", "AD"],
  wide: ["Before Christ", "Anno Domini"]
};
var quarterValues = {
  narrow: ["1", "2", "3", "4"],
  abbreviated: ["Q1", "Q2", "Q3", "Q4"],
  wide: ["1st quarter", "2nd quarter", "3rd quarter", "4th quarter"]
};
var monthValues = {
  narrow: ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"],
  abbreviated: [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec"
  ],
  wide: [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
  ]
};
var dayValues = {
  narrow: ["S", "M", "T", "W", "T", "F", "S"],
  short: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"],
  abbreviated: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
  wide: [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday"
  ]
};
var dayPeriodValues = {
  narrow: {
    am: "a",
    pm: "p",
    midnight: "mi",
    noon: "n",
    morning: "morning",
    afternoon: "afternoon",
    evening: "evening",
    night: "night"
  },
  abbreviated: {
    am: "AM",
    pm: "PM",
    midnight: "midnight",
    noon: "noon",
    morning: "morning",
    afternoon: "afternoon",
    evening: "evening",
    night: "night"
  },
  wide: {
    am: "a.m.",
    pm: "p.m.",
    midnight: "midnight",
    noon: "noon",
    morning: "morning",
    afternoon: "afternoon",
    evening: "evening",
    night: "night"
  }
};
var formattingDayPeriodValues = {
  narrow: {
    am: "a",
    pm: "p",
    midnight: "mi",
    noon: "n",
    morning: "in the morning",
    afternoon: "in the afternoon",
    evening: "in the evening",
    night: "at night"
  },
  abbreviated: {
    am: "AM",
    pm: "PM",
    midnight: "midnight",
    noon: "noon",
    morning: "in the morning",
    afternoon: "in the afternoon",
    evening: "in the evening",
    night: "at night"
  },
  wide: {
    am: "a.m.",
    pm: "p.m.",
    midnight: "midnight",
    noon: "noon",
    morning: "in the morning",
    afternoon: "in the afternoon",
    evening: "in the evening",
    night: "at night"
  }
};
var ordinalNumber = (dirtyNumber, _options) => {
  const number = Number(dirtyNumber);
  const rem100 = number % 100;
  if (rem100 > 20 || rem100 < 10) {
    switch (rem100 % 10) {
      case 1:
        return number + "st";
      case 2:
        return number + "nd";
      case 3:
        return number + "rd";
    }
  }
  return number + "th";
};
var localize = {
  ordinalNumber,
  era: buildLocalizeFn({
    values: eraValues,
    defaultWidth: "wide"
  }),
  quarter: buildLocalizeFn({
    values: quarterValues,
    defaultWidth: "wide",
    argumentCallback: (quarter) => quarter - 1
  }),
  month: buildLocalizeFn({
    values: monthValues,
    defaultWidth: "wide"
  }),
  day: buildLocalizeFn({
    values: dayValues,
    defaultWidth: "wide"
  }),
  dayPeriod: buildLocalizeFn({
    values: dayPeriodValues,
    defaultWidth: "wide",
    formattingValues: formattingDayPeriodValues,
    defaultFormattingWidth: "wide"
  })
};

// node_modules/date-fns/locale/_lib/buildMatchFn.mjs
function buildMatchFn(args) {
  return (string, options = {}) => {
    const width = options.width;
    const matchPattern = width && args.matchPatterns[width] || args.matchPatterns[args.defaultMatchWidth];
    const matchResult = string.match(matchPattern);
    if (!matchResult) {
      return null;
    }
    const matchedString = matchResult[0];
    const parsePatterns = width && args.parsePatterns[width] || args.parsePatterns[args.defaultParseWidth];
    const key = Array.isArray(parsePatterns) ? findIndex(parsePatterns, (pattern) => pattern.test(matchedString)) : (
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- I challange you to fix the type
      findKey(parsePatterns, (pattern) => pattern.test(matchedString))
    );
    let value;
    value = args.valueCallback ? args.valueCallback(key) : key;
    value = options.valueCallback ? (
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- I challange you to fix the type
      options.valueCallback(value)
    ) : value;
    const rest = string.slice(matchedString.length);
    return { value, rest };
  };
}
function findKey(object, predicate) {
  for (const key in object) {
    if (Object.prototype.hasOwnProperty.call(object, key) && predicate(object[key])) {
      return key;
    }
  }
  return void 0;
}
function findIndex(array, predicate) {
  for (let key = 0; key < array.length; key++) {
    if (predicate(array[key])) {
      return key;
    }
  }
  return void 0;
}

// node_modules/date-fns/locale/_lib/buildMatchPatternFn.mjs
function buildMatchPatternFn(args) {
  return (string, options = {}) => {
    const matchResult = string.match(args.matchPattern);
    if (!matchResult)
      return null;
    const matchedString = matchResult[0];
    const parseResult = string.match(args.parsePattern);
    if (!parseResult)
      return null;
    let value = args.valueCallback ? args.valueCallback(parseResult[0]) : parseResult[0];
    value = options.valueCallback ? options.valueCallback(value) : value;
    const rest = string.slice(matchedString.length);
    return { value, rest };
  };
}

// node_modules/date-fns/locale/en-US/_lib/match.mjs
var matchOrdinalNumberPattern = /^(\d+)(th|st|nd|rd)?/i;
var parseOrdinalNumberPattern = /\d+/i;
var matchEraPatterns = {
  narrow: /^(b|a)/i,
  abbreviated: /^(b\.?\s?c\.?|b\.?\s?c\.?\s?e\.?|a\.?\s?d\.?|c\.?\s?e\.?)/i,
  wide: /^(before christ|before common era|anno domini|common era)/i
};
var parseEraPatterns = {
  any: [/^b/i, /^(a|c)/i]
};
var matchQuarterPatterns = {
  narrow: /^[1234]/i,
  abbreviated: /^q[1234]/i,
  wide: /^[1234](th|st|nd|rd)? quarter/i
};
var parseQuarterPatterns = {
  any: [/1/i, /2/i, /3/i, /4/i]
};
var matchMonthPatterns = {
  narrow: /^[jfmasond]/i,
  abbreviated: /^(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i,
  wide: /^(january|february|march|april|may|june|july|august|september|october|november|december)/i
};
var parseMonthPatterns = {
  narrow: [
    /^j/i,
    /^f/i,
    /^m/i,
    /^a/i,
    /^m/i,
    /^j/i,
    /^j/i,
    /^a/i,
    /^s/i,
    /^o/i,
    /^n/i,
    /^d/i
  ],
  any: [
    /^ja/i,
    /^f/i,
    /^mar/i,
    /^ap/i,
    /^may/i,
    /^jun/i,
    /^jul/i,
    /^au/i,
    /^s/i,
    /^o/i,
    /^n/i,
    /^d/i
  ]
};
var matchDayPatterns = {
  narrow: /^[smtwf]/i,
  short: /^(su|mo|tu|we|th|fr|sa)/i,
  abbreviated: /^(sun|mon|tue|wed|thu|fri|sat)/i,
  wide: /^(sunday|monday|tuesday|wednesday|thursday|friday|saturday)/i
};
var parseDayPatterns = {
  narrow: [/^s/i, /^m/i, /^t/i, /^w/i, /^t/i, /^f/i, /^s/i],
  any: [/^su/i, /^m/i, /^tu/i, /^w/i, /^th/i, /^f/i, /^sa/i]
};
var matchDayPeriodPatterns = {
  narrow: /^(a|p|mi|n|(in the|at) (morning|afternoon|evening|night))/i,
  any: /^([ap]\.?\s?m\.?|midnight|noon|(in the|at) (morning|afternoon|evening|night))/i
};
var parseDayPeriodPatterns = {
  any: {
    am: /^a/i,
    pm: /^p/i,
    midnight: /^mi/i,
    noon: /^no/i,
    morning: /morning/i,
    afternoon: /afternoon/i,
    evening: /evening/i,
    night: /night/i
  }
};
var match = {
  ordinalNumber: buildMatchPatternFn({
    matchPattern: matchOrdinalNumberPattern,
    parsePattern: parseOrdinalNumberPattern,
    valueCallback: (value) => parseInt(value, 10)
  }),
  era: buildMatchFn({
    matchPatterns: matchEraPatterns,
    defaultMatchWidth: "wide",
    parsePatterns: parseEraPatterns,
    defaultParseWidth: "any"
  }),
  quarter: buildMatchFn({
    matchPatterns: matchQuarterPatterns,
    defaultMatchWidth: "wide",
    parsePatterns: parseQuarterPatterns,
    defaultParseWidth: "any",
    valueCallback: (index) => index + 1
  }),
  month: buildMatchFn({
    matchPatterns: matchMonthPatterns,
    defaultMatchWidth: "wide",
    parsePatterns: parseMonthPatterns,
    defaultParseWidth: "any"
  }),
  day: buildMatchFn({
    matchPatterns: matchDayPatterns,
    defaultMatchWidth: "wide",
    parsePatterns: parseDayPatterns,
    defaultParseWidth: "any"
  }),
  dayPeriod: buildMatchFn({
    matchPatterns: matchDayPeriodPatterns,
    defaultMatchWidth: "any",
    parsePatterns: parseDayPeriodPatterns,
    defaultParseWidth: "any"
  })
};

// node_modules/date-fns/locale/en-US.mjs
var enUS = {
  code: "en-US",
  formatDistance,
  formatLong,
  formatRelative,
  localize,
  match,
  options: {
    weekStartsOn: 0,
    firstWeekContainsDate: 1
  }
};

// node_modules/date-fns/getDayOfYear.mjs
function getDayOfYear(date) {
  const _date = toDate(date);
  const diff = differenceInCalendarDays(_date, startOfYear(_date));
  const dayOfYear = diff + 1;
  return dayOfYear;
}

// node_modules/date-fns/getISOWeek.mjs
function getISOWeek(date) {
  const _date = toDate(date);
  const diff = startOfISOWeek(_date).getTime() - startOfISOWeekYear(_date).getTime();
  return Math.round(diff / millisecondsInWeek) + 1;
}

// node_modules/date-fns/getWeekYear.mjs
function getWeekYear(date, options) {
  const _date = toDate(date);
  const year = _date.getFullYear();
  const defaultOptions2 = getDefaultOptions();
  const firstWeekContainsDate = options?.firstWeekContainsDate ?? options?.locale?.options?.firstWeekContainsDate ?? defaultOptions2.firstWeekContainsDate ?? defaultOptions2.locale?.options?.firstWeekContainsDate ?? 1;
  const firstWeekOfNextYear = constructFrom(date, 0);
  firstWeekOfNextYear.setFullYear(year + 1, 0, firstWeekContainsDate);
  firstWeekOfNextYear.setHours(0, 0, 0, 0);
  const startOfNextYear = startOfWeek(firstWeekOfNextYear, options);
  const firstWeekOfThisYear = constructFrom(date, 0);
  firstWeekOfThisYear.setFullYear(year, 0, firstWeekContainsDate);
  firstWeekOfThisYear.setHours(0, 0, 0, 0);
  const startOfThisYear = startOfWeek(firstWeekOfThisYear, options);
  if (_date.getTime() >= startOfNextYear.getTime()) {
    return year + 1;
  } else if (_date.getTime() >= startOfThisYear.getTime()) {
    return year;
  } else {
    return year - 1;
  }
}

// node_modules/date-fns/startOfWeekYear.mjs
function startOfWeekYear(date, options) {
  const defaultOptions2 = getDefaultOptions();
  const firstWeekContainsDate = options?.firstWeekContainsDate ?? options?.locale?.options?.firstWeekContainsDate ?? defaultOptions2.firstWeekContainsDate ?? defaultOptions2.locale?.options?.firstWeekContainsDate ?? 1;
  const year = getWeekYear(date, options);
  const firstWeek = constructFrom(date, 0);
  firstWeek.setFullYear(year, 0, firstWeekContainsDate);
  firstWeek.setHours(0, 0, 0, 0);
  const _date = startOfWeek(firstWeek, options);
  return _date;
}

// node_modules/date-fns/getWeek.mjs
function getWeek(date, options) {
  const _date = toDate(date);
  const diff = startOfWeek(_date, options).getTime() - startOfWeekYear(_date, options).getTime();
  return Math.round(diff / millisecondsInWeek) + 1;
}

// node_modules/date-fns/_lib/addLeadingZeros.mjs
function addLeadingZeros(number, targetLength) {
  const sign = number < 0 ? "-" : "";
  const output = Math.abs(number).toString().padStart(targetLength, "0");
  return sign + output;
}

// node_modules/date-fns/_lib/format/lightFormatters.mjs
var lightFormatters = {
  // Year
  y(date, token) {
    const signedYear = date.getFullYear();
    const year = signedYear > 0 ? signedYear : 1 - signedYear;
    return addLeadingZeros(token === "yy" ? year % 100 : year, token.length);
  },
  // Month
  M(date, token) {
    const month = date.getMonth();
    return token === "M" ? String(month + 1) : addLeadingZeros(month + 1, 2);
  },
  // Day of the month
  d(date, token) {
    return addLeadingZeros(date.getDate(), token.length);
  },
  // AM or PM
  a(date, token) {
    const dayPeriodEnumValue = date.getHours() / 12 >= 1 ? "pm" : "am";
    switch (token) {
      case "a":
      case "aa":
        return dayPeriodEnumValue.toUpperCase();
      case "aaa":
        return dayPeriodEnumValue;
      case "aaaaa":
        return dayPeriodEnumValue[0];
      case "aaaa":
      default:
        return dayPeriodEnumValue === "am" ? "a.m." : "p.m.";
    }
  },
  // Hour [1-12]
  h(date, token) {
    return addLeadingZeros(date.getHours() % 12 || 12, token.length);
  },
  // Hour [0-23]
  H(date, token) {
    return addLeadingZeros(date.getHours(), token.length);
  },
  // Minute
  m(date, token) {
    return addLeadingZeros(date.getMinutes(), token.length);
  },
  // Second
  s(date, token) {
    return addLeadingZeros(date.getSeconds(), token.length);
  },
  // Fraction of second
  S(date, token) {
    const numberOfDigits = token.length;
    const milliseconds = date.getMilliseconds();
    const fractionalSeconds = Math.floor(
      milliseconds * Math.pow(10, numberOfDigits - 3)
    );
    return addLeadingZeros(fractionalSeconds, token.length);
  }
};

// node_modules/date-fns/_lib/format/formatters.mjs
var dayPeriodEnum = {
  am: "am",
  pm: "pm",
  midnight: "midnight",
  noon: "noon",
  morning: "morning",
  afternoon: "afternoon",
  evening: "evening",
  night: "night"
};
var formatters = {
  // Era
  G: function(date, token, localize2) {
    const era = date.getFullYear() > 0 ? 1 : 0;
    switch (token) {
      case "G":
      case "GG":
      case "GGG":
        return localize2.era(era, { width: "abbreviated" });
      case "GGGGG":
        return localize2.era(era, { width: "narrow" });
      case "GGGG":
      default:
        return localize2.era(era, { width: "wide" });
    }
  },
  // Year
  y: function(date, token, localize2) {
    if (token === "yo") {
      const signedYear = date.getFullYear();
      const year = signedYear > 0 ? signedYear : 1 - signedYear;
      return localize2.ordinalNumber(year, { unit: "year" });
    }
    return lightFormatters.y(date, token);
  },
  // Local week-numbering year
  Y: function(date, token, localize2, options) {
    const signedWeekYear = getWeekYear(date, options);
    const weekYear = signedWeekYear > 0 ? signedWeekYear : 1 - signedWeekYear;
    if (token === "YY") {
      const twoDigitYear = weekYear % 100;
      return addLeadingZeros(twoDigitYear, 2);
    }
    if (token === "Yo") {
      return localize2.ordinalNumber(weekYear, { unit: "year" });
    }
    return addLeadingZeros(weekYear, token.length);
  },
  // ISO week-numbering year
  R: function(date, token) {
    const isoWeekYear = getISOWeekYear(date);
    return addLeadingZeros(isoWeekYear, token.length);
  },
  // Extended year. This is a single number designating the year of this calendar system.
  // The main difference between `y` and `u` localizers are B.C. years:
  // | Year | `y` | `u` |
  // |------|-----|-----|
  // | AC 1 |   1 |   1 |
  // | BC 1 |   1 |   0 |
  // | BC 2 |   2 |  -1 |
  // Also `yy` always returns the last two digits of a year,
  // while `uu` pads single digit years to 2 characters and returns other years unchanged.
  u: function(date, token) {
    const year = date.getFullYear();
    return addLeadingZeros(year, token.length);
  },
  // Quarter
  Q: function(date, token, localize2) {
    const quarter = Math.ceil((date.getMonth() + 1) / 3);
    switch (token) {
      case "Q":
        return String(quarter);
      case "QQ":
        return addLeadingZeros(quarter, 2);
      case "Qo":
        return localize2.ordinalNumber(quarter, { unit: "quarter" });
      case "QQQ":
        return localize2.quarter(quarter, {
          width: "abbreviated",
          context: "formatting"
        });
      case "QQQQQ":
        return localize2.quarter(quarter, {
          width: "narrow",
          context: "formatting"
        });
      case "QQQQ":
      default:
        return localize2.quarter(quarter, {
          width: "wide",
          context: "formatting"
        });
    }
  },
  // Stand-alone quarter
  q: function(date, token, localize2) {
    const quarter = Math.ceil((date.getMonth() + 1) / 3);
    switch (token) {
      case "q":
        return String(quarter);
      case "qq":
        return addLeadingZeros(quarter, 2);
      case "qo":
        return localize2.ordinalNumber(quarter, { unit: "quarter" });
      case "qqq":
        return localize2.quarter(quarter, {
          width: "abbreviated",
          context: "standalone"
        });
      case "qqqqq":
        return localize2.quarter(quarter, {
          width: "narrow",
          context: "standalone"
        });
      case "qqqq":
      default:
        return localize2.quarter(quarter, {
          width: "wide",
          context: "standalone"
        });
    }
  },
  // Month
  M: function(date, token, localize2) {
    const month = date.getMonth();
    switch (token) {
      case "M":
      case "MM":
        return lightFormatters.M(date, token);
      case "Mo":
        return localize2.ordinalNumber(month + 1, { unit: "month" });
      case "MMM":
        return localize2.month(month, {
          width: "abbreviated",
          context: "formatting"
        });
      case "MMMMM":
        return localize2.month(month, {
          width: "narrow",
          context: "formatting"
        });
      case "MMMM":
      default:
        return localize2.month(month, { width: "wide", context: "formatting" });
    }
  },
  // Stand-alone month
  L: function(date, token, localize2) {
    const month = date.getMonth();
    switch (token) {
      case "L":
        return String(month + 1);
      case "LL":
        return addLeadingZeros(month + 1, 2);
      case "Lo":
        return localize2.ordinalNumber(month + 1, { unit: "month" });
      case "LLL":
        return localize2.month(month, {
          width: "abbreviated",
          context: "standalone"
        });
      case "LLLLL":
        return localize2.month(month, {
          width: "narrow",
          context: "standalone"
        });
      case "LLLL":
      default:
        return localize2.month(month, { width: "wide", context: "standalone" });
    }
  },
  // Local week of year
  w: function(date, token, localize2, options) {
    const week = getWeek(date, options);
    if (token === "wo") {
      return localize2.ordinalNumber(week, { unit: "week" });
    }
    return addLeadingZeros(week, token.length);
  },
  // ISO week of year
  I: function(date, token, localize2) {
    const isoWeek = getISOWeek(date);
    if (token === "Io") {
      return localize2.ordinalNumber(isoWeek, { unit: "week" });
    }
    return addLeadingZeros(isoWeek, token.length);
  },
  // Day of the month
  d: function(date, token, localize2) {
    if (token === "do") {
      return localize2.ordinalNumber(date.getDate(), { unit: "date" });
    }
    return lightFormatters.d(date, token);
  },
  // Day of year
  D: function(date, token, localize2) {
    const dayOfYear = getDayOfYear(date);
    if (token === "Do") {
      return localize2.ordinalNumber(dayOfYear, { unit: "dayOfYear" });
    }
    return addLeadingZeros(dayOfYear, token.length);
  },
  // Day of week
  E: function(date, token, localize2) {
    const dayOfWeek = date.getDay();
    switch (token) {
      case "E":
      case "EE":
      case "EEE":
        return localize2.day(dayOfWeek, {
          width: "abbreviated",
          context: "formatting"
        });
      case "EEEEE":
        return localize2.day(dayOfWeek, {
          width: "narrow",
          context: "formatting"
        });
      case "EEEEEE":
        return localize2.day(dayOfWeek, {
          width: "short",
          context: "formatting"
        });
      case "EEEE":
      default:
        return localize2.day(dayOfWeek, {
          width: "wide",
          context: "formatting"
        });
    }
  },
  // Local day of week
  e: function(date, token, localize2, options) {
    const dayOfWeek = date.getDay();
    const localDayOfWeek = (dayOfWeek - options.weekStartsOn + 8) % 7 || 7;
    switch (token) {
      case "e":
        return String(localDayOfWeek);
      case "ee":
        return addLeadingZeros(localDayOfWeek, 2);
      case "eo":
        return localize2.ordinalNumber(localDayOfWeek, { unit: "day" });
      case "eee":
        return localize2.day(dayOfWeek, {
          width: "abbreviated",
          context: "formatting"
        });
      case "eeeee":
        return localize2.day(dayOfWeek, {
          width: "narrow",
          context: "formatting"
        });
      case "eeeeee":
        return localize2.day(dayOfWeek, {
          width: "short",
          context: "formatting"
        });
      case "eeee":
      default:
        return localize2.day(dayOfWeek, {
          width: "wide",
          context: "formatting"
        });
    }
  },
  // Stand-alone local day of week
  c: function(date, token, localize2, options) {
    const dayOfWeek = date.getDay();
    const localDayOfWeek = (dayOfWeek - options.weekStartsOn + 8) % 7 || 7;
    switch (token) {
      case "c":
        return String(localDayOfWeek);
      case "cc":
        return addLeadingZeros(localDayOfWeek, token.length);
      case "co":
        return localize2.ordinalNumber(localDayOfWeek, { unit: "day" });
      case "ccc":
        return localize2.day(dayOfWeek, {
          width: "abbreviated",
          context: "standalone"
        });
      case "ccccc":
        return localize2.day(dayOfWeek, {
          width: "narrow",
          context: "standalone"
        });
      case "cccccc":
        return localize2.day(dayOfWeek, {
          width: "short",
          context: "standalone"
        });
      case "cccc":
      default:
        return localize2.day(dayOfWeek, {
          width: "wide",
          context: "standalone"
        });
    }
  },
  // ISO day of week
  i: function(date, token, localize2) {
    const dayOfWeek = date.getDay();
    const isoDayOfWeek = dayOfWeek === 0 ? 7 : dayOfWeek;
    switch (token) {
      case "i":
        return String(isoDayOfWeek);
      case "ii":
        return addLeadingZeros(isoDayOfWeek, token.length);
      case "io":
        return localize2.ordinalNumber(isoDayOfWeek, { unit: "day" });
      case "iii":
        return localize2.day(dayOfWeek, {
          width: "abbreviated",
          context: "formatting"
        });
      case "iiiii":
        return localize2.day(dayOfWeek, {
          width: "narrow",
          context: "formatting"
        });
      case "iiiiii":
        return localize2.day(dayOfWeek, {
          width: "short",
          context: "formatting"
        });
      case "iiii":
      default:
        return localize2.day(dayOfWeek, {
          width: "wide",
          context: "formatting"
        });
    }
  },
  // AM or PM
  a: function(date, token, localize2) {
    const hours = date.getHours();
    const dayPeriodEnumValue = hours / 12 >= 1 ? "pm" : "am";
    switch (token) {
      case "a":
      case "aa":
        return localize2.dayPeriod(dayPeriodEnumValue, {
          width: "abbreviated",
          context: "formatting"
        });
      case "aaa":
        return localize2.dayPeriod(dayPeriodEnumValue, {
          width: "abbreviated",
          context: "formatting"
        }).toLowerCase();
      case "aaaaa":
        return localize2.dayPeriod(dayPeriodEnumValue, {
          width: "narrow",
          context: "formatting"
        });
      case "aaaa":
      default:
        return localize2.dayPeriod(dayPeriodEnumValue, {
          width: "wide",
          context: "formatting"
        });
    }
  },
  // AM, PM, midnight, noon
  b: function(date, token, localize2) {
    const hours = date.getHours();
    let dayPeriodEnumValue;
    if (hours === 12) {
      dayPeriodEnumValue = dayPeriodEnum.noon;
    } else if (hours === 0) {
      dayPeriodEnumValue = dayPeriodEnum.midnight;
    } else {
      dayPeriodEnumValue = hours / 12 >= 1 ? "pm" : "am";
    }
    switch (token) {
      case "b":
      case "bb":
        return localize2.dayPeriod(dayPeriodEnumValue, {
          width: "abbreviated",
          context: "formatting"
        });
      case "bbb":
        return localize2.dayPeriod(dayPeriodEnumValue, {
          width: "abbreviated",
          context: "formatting"
        }).toLowerCase();
      case "bbbbb":
        return localize2.dayPeriod(dayPeriodEnumValue, {
          width: "narrow",
          context: "formatting"
        });
      case "bbbb":
      default:
        return localize2.dayPeriod(dayPeriodEnumValue, {
          width: "wide",
          context: "formatting"
        });
    }
  },
  // in the morning, in the afternoon, in the evening, at night
  B: function(date, token, localize2) {
    const hours = date.getHours();
    let dayPeriodEnumValue;
    if (hours >= 17) {
      dayPeriodEnumValue = dayPeriodEnum.evening;
    } else if (hours >= 12) {
      dayPeriodEnumValue = dayPeriodEnum.afternoon;
    } else if (hours >= 4) {
      dayPeriodEnumValue = dayPeriodEnum.morning;
    } else {
      dayPeriodEnumValue = dayPeriodEnum.night;
    }
    switch (token) {
      case "B":
      case "BB":
      case "BBB":
        return localize2.dayPeriod(dayPeriodEnumValue, {
          width: "abbreviated",
          context: "formatting"
        });
      case "BBBBB":
        return localize2.dayPeriod(dayPeriodEnumValue, {
          width: "narrow",
          context: "formatting"
        });
      case "BBBB":
      default:
        return localize2.dayPeriod(dayPeriodEnumValue, {
          width: "wide",
          context: "formatting"
        });
    }
  },
  // Hour [1-12]
  h: function(date, token, localize2) {
    if (token === "ho") {
      let hours = date.getHours() % 12;
      if (hours === 0)
        hours = 12;
      return localize2.ordinalNumber(hours, { unit: "hour" });
    }
    return lightFormatters.h(date, token);
  },
  // Hour [0-23]
  H: function(date, token, localize2) {
    if (token === "Ho") {
      return localize2.ordinalNumber(date.getHours(), { unit: "hour" });
    }
    return lightFormatters.H(date, token);
  },
  // Hour [0-11]
  K: function(date, token, localize2) {
    const hours = date.getHours() % 12;
    if (token === "Ko") {
      return localize2.ordinalNumber(hours, { unit: "hour" });
    }
    return addLeadingZeros(hours, token.length);
  },
  // Hour [1-24]
  k: function(date, token, localize2) {
    let hours = date.getHours();
    if (hours === 0)
      hours = 24;
    if (token === "ko") {
      return localize2.ordinalNumber(hours, { unit: "hour" });
    }
    return addLeadingZeros(hours, token.length);
  },
  // Minute
  m: function(date, token, localize2) {
    if (token === "mo") {
      return localize2.ordinalNumber(date.getMinutes(), { unit: "minute" });
    }
    return lightFormatters.m(date, token);
  },
  // Second
  s: function(date, token, localize2) {
    if (token === "so") {
      return localize2.ordinalNumber(date.getSeconds(), { unit: "second" });
    }
    return lightFormatters.s(date, token);
  },
  // Fraction of second
  S: function(date, token) {
    return lightFormatters.S(date, token);
  },
  // Timezone (ISO-8601. If offset is 0, output is always `'Z'`)
  X: function(date, token, _localize, options) {
    const originalDate = options._originalDate || date;
    const timezoneOffset = originalDate.getTimezoneOffset();
    if (timezoneOffset === 0) {
      return "Z";
    }
    switch (token) {
      case "X":
        return formatTimezoneWithOptionalMinutes(timezoneOffset);
      case "XXXX":
      case "XX":
        return formatTimezone(timezoneOffset);
      case "XXXXX":
      case "XXX":
      default:
        return formatTimezone(timezoneOffset, ":");
    }
  },
  // Timezone (ISO-8601. If offset is 0, output is `'+00:00'` or equivalent)
  x: function(date, token, _localize, options) {
    const originalDate = options._originalDate || date;
    const timezoneOffset = originalDate.getTimezoneOffset();
    switch (token) {
      case "x":
        return formatTimezoneWithOptionalMinutes(timezoneOffset);
      case "xxxx":
      case "xx":
        return formatTimezone(timezoneOffset);
      case "xxxxx":
      case "xxx":
      default:
        return formatTimezone(timezoneOffset, ":");
    }
  },
  // Timezone (GMT)
  O: function(date, token, _localize, options) {
    const originalDate = options._originalDate || date;
    const timezoneOffset = originalDate.getTimezoneOffset();
    switch (token) {
      case "O":
      case "OO":
      case "OOO":
        return "GMT" + formatTimezoneShort(timezoneOffset, ":");
      case "OOOO":
      default:
        return "GMT" + formatTimezone(timezoneOffset, ":");
    }
  },
  // Timezone (specific non-location)
  z: function(date, token, _localize, options) {
    const originalDate = options._originalDate || date;
    const timezoneOffset = originalDate.getTimezoneOffset();
    switch (token) {
      case "z":
      case "zz":
      case "zzz":
        return "GMT" + formatTimezoneShort(timezoneOffset, ":");
      case "zzzz":
      default:
        return "GMT" + formatTimezone(timezoneOffset, ":");
    }
  },
  // Seconds timestamp
  t: function(date, token, _localize, options) {
    const originalDate = options._originalDate || date;
    const timestamp = Math.floor(originalDate.getTime() / 1e3);
    return addLeadingZeros(timestamp, token.length);
  },
  // Milliseconds timestamp
  T: function(date, token, _localize, options) {
    const originalDate = options._originalDate || date;
    const timestamp = originalDate.getTime();
    return addLeadingZeros(timestamp, token.length);
  }
};
function formatTimezoneShort(offset, delimiter = "") {
  const sign = offset > 0 ? "-" : "+";
  const absOffset = Math.abs(offset);
  const hours = Math.floor(absOffset / 60);
  const minutes = absOffset % 60;
  if (minutes === 0) {
    return sign + String(hours);
  }
  return sign + String(hours) + delimiter + addLeadingZeros(minutes, 2);
}
function formatTimezoneWithOptionalMinutes(offset, delimiter) {
  if (offset % 60 === 0) {
    const sign = offset > 0 ? "-" : "+";
    return sign + addLeadingZeros(Math.abs(offset) / 60, 2);
  }
  return formatTimezone(offset, delimiter);
}
function formatTimezone(offset, delimiter = "") {
  const sign = offset > 0 ? "-" : "+";
  const absOffset = Math.abs(offset);
  const hours = addLeadingZeros(Math.floor(absOffset / 60), 2);
  const minutes = addLeadingZeros(absOffset % 60, 2);
  return sign + hours + delimiter + minutes;
}

// node_modules/date-fns/_lib/format/longFormatters.mjs
var dateLongFormatter = (pattern, formatLong2) => {
  switch (pattern) {
    case "P":
      return formatLong2.date({ width: "short" });
    case "PP":
      return formatLong2.date({ width: "medium" });
    case "PPP":
      return formatLong2.date({ width: "long" });
    case "PPPP":
    default:
      return formatLong2.date({ width: "full" });
  }
};
var timeLongFormatter = (pattern, formatLong2) => {
  switch (pattern) {
    case "p":
      return formatLong2.time({ width: "short" });
    case "pp":
      return formatLong2.time({ width: "medium" });
    case "ppp":
      return formatLong2.time({ width: "long" });
    case "pppp":
    default:
      return formatLong2.time({ width: "full" });
  }
};
var dateTimeLongFormatter = (pattern, formatLong2) => {
  const matchResult = pattern.match(/(P+)(p+)?/) || [];
  const datePattern = matchResult[1];
  const timePattern = matchResult[2];
  if (!timePattern) {
    return dateLongFormatter(pattern, formatLong2);
  }
  let dateTimeFormat;
  switch (datePattern) {
    case "P":
      dateTimeFormat = formatLong2.dateTime({ width: "short" });
      break;
    case "PP":
      dateTimeFormat = formatLong2.dateTime({ width: "medium" });
      break;
    case "PPP":
      dateTimeFormat = formatLong2.dateTime({ width: "long" });
      break;
    case "PPPP":
    default:
      dateTimeFormat = formatLong2.dateTime({ width: "full" });
      break;
  }
  return dateTimeFormat.replace("{{date}}", dateLongFormatter(datePattern, formatLong2)).replace("{{time}}", timeLongFormatter(timePattern, formatLong2));
};
var longFormatters = {
  p: timeLongFormatter,
  P: dateTimeLongFormatter
};

// node_modules/date-fns/_lib/protectedTokens.mjs
var protectedDayOfYearTokens = ["D", "DD"];
var protectedWeekYearTokens = ["YY", "YYYY"];
function isProtectedDayOfYearToken(token) {
  return protectedDayOfYearTokens.indexOf(token) !== -1;
}
function isProtectedWeekYearToken(token) {
  return protectedWeekYearTokens.indexOf(token) !== -1;
}
function throwProtectedError(token, format2, input) {
  if (token === "YYYY") {
    throw new RangeError(
      `Use \`yyyy\` instead of \`YYYY\` (in \`${format2}\`) for formatting years to the input \`${input}\`; see: https://github.com/date-fns/date-fns/blob/master/docs/unicodeTokens.md`
    );
  } else if (token === "YY") {
    throw new RangeError(
      `Use \`yy\` instead of \`YY\` (in \`${format2}\`) for formatting years to the input \`${input}\`; see: https://github.com/date-fns/date-fns/blob/master/docs/unicodeTokens.md`
    );
  } else if (token === "D") {
    throw new RangeError(
      `Use \`d\` instead of \`D\` (in \`${format2}\`) for formatting days of the month to the input \`${input}\`; see: https://github.com/date-fns/date-fns/blob/master/docs/unicodeTokens.md`
    );
  } else if (token === "DD") {
    throw new RangeError(
      `Use \`dd\` instead of \`DD\` (in \`${format2}\`) for formatting days of the month to the input \`${input}\`; see: https://github.com/date-fns/date-fns/blob/master/docs/unicodeTokens.md`
    );
  }
}

// node_modules/date-fns/format.mjs
var formattingTokensRegExp = /[yYQqMLwIdDecihHKkms]o|(\w)\1*|''|'(''|[^'])+('|$)|./g;
var longFormattingTokensRegExp = /P+p+|P+|p+|''|'(''|[^'])+('|$)|./g;
var escapedStringRegExp = /^'([^]*?)'?$/;
var doubleQuoteRegExp = /''/g;
var unescapedLatinCharacterRegExp = /[a-zA-Z]/;
function format(date, formatStr, options) {
  const defaultOptions2 = getDefaultOptions();
  const locale = options?.locale ?? defaultOptions2.locale ?? enUS;
  const firstWeekContainsDate = options?.firstWeekContainsDate ?? options?.locale?.options?.firstWeekContainsDate ?? defaultOptions2.firstWeekContainsDate ?? defaultOptions2.locale?.options?.firstWeekContainsDate ?? 1;
  const weekStartsOn = options?.weekStartsOn ?? options?.locale?.options?.weekStartsOn ?? defaultOptions2.weekStartsOn ?? defaultOptions2.locale?.options?.weekStartsOn ?? 0;
  const originalDate = toDate(date);
  if (!isValid(originalDate)) {
    throw new RangeError("Invalid time value");
  }
  const formatterOptions = {
    firstWeekContainsDate,
    weekStartsOn,
    locale,
    _originalDate: originalDate
  };
  const result = formatStr.match(longFormattingTokensRegExp).map(function(substring) {
    const firstCharacter = substring[0];
    if (firstCharacter === "p" || firstCharacter === "P") {
      const longFormatter = longFormatters[firstCharacter];
      return longFormatter(substring, locale.formatLong);
    }
    return substring;
  }).join("").match(formattingTokensRegExp).map(function(substring) {
    if (substring === "''") {
      return "'";
    }
    const firstCharacter = substring[0];
    if (firstCharacter === "'") {
      return cleanEscapedString(substring);
    }
    const formatter = formatters[firstCharacter];
    if (formatter) {
      if (!options?.useAdditionalWeekYearTokens && isProtectedWeekYearToken(substring)) {
        throwProtectedError(substring, formatStr, String(date));
      }
      if (!options?.useAdditionalDayOfYearTokens && isProtectedDayOfYearToken(substring)) {
        throwProtectedError(substring, formatStr, String(date));
      }
      return formatter(
        originalDate,
        substring,
        locale.localize,
        formatterOptions
      );
    }
    if (firstCharacter.match(unescapedLatinCharacterRegExp)) {
      throw new RangeError(
        "Format string contains an unescaped latin alphabet character `" + firstCharacter + "`"
      );
    }
    return substring;
  }).join("");
  return result;
}
function cleanEscapedString(input) {
  const matched = input.match(escapedStringRegExp);
  if (!matched) {
    return input;
  }
  return matched[1].replace(doubleQuoteRegExp, "'");
}

// src/client/containers/infoBox/suncalc/solarTimes/durations.ts
var import_suncalc = __toESM(require_suncalc(), 1);

// src/client/containers/infoBox/suncalc/intervalValueOf.ts
function intervalValueOf({ end: endDate, solarNoon: noonDate, start: startDate }) {
  const end = endDate.valueOf();
  const start = startDate.valueOf();
  const startNaN = Number.isNaN(start);
  const endNaN = Number.isNaN(end);
  const noon = noonDate.valueOf();
  if (startNaN && endNaN)
    return 0;
  if (startNaN)
    return end <= noon ? end - (noon - halfDay) : end - noon;
  if (endNaN)
    return start >= noon ? noon + halfDay - start : noon - start;
  return end - start;
}

// src/client/containers/infoBox/suncalc/solarTimes/statics.ts
var SolarTimesStatics = class extends Container {
  constructor() {
    super();
  }
  lat = 0;
  lon = 0;
  x = -1;
  y = -1;
  static increment = ({ durations, keys }) => keys.reduce((sum, key) => sum + durations[key], 0);
  static formatDates = (dates) => dates.sort((a, b) => a.valueOf() - b.valueOf()).reduce((ret, date) => {
    const { end = date, start = date } = ret.pop() ?? {};
    if (date.valueOf() - end.valueOf() <= halfDay * 2)
      ret.push({ end: date, start });
    else {
      ret.push({ end, start });
      ret.push({ end: date, start: date });
    }
    return ret;
  }, []).reduce((ret, { end, start }, idx) => {
    if (idx !== 0)
      ret.push(Container.from("br"));
    ret.push(
      start.valueOf() === end.valueOf() ? format(start, "dd.MM.yyyy") : `${format(start, "dd.MM.yyyy")} - ${format(end, "dd.MM.yyyy")}`
    );
    return ret;
  }, []);
};

// src/client/containers/infoBox/suncalc/solarTimes/durations.ts
var SolarTimesDurations = class extends SolarTimesStatics {
  getDurations = ({ date }) => {
    const { dawn, dusk, nauticalDawn, nauticalDusk, night, nightEnd, solarNoon, sunrise, sunriseEnd, sunset, sunsetStart } = (0, import_suncalc.getTimes)(date, this.lat, this.lon);
    const dayRaw = intervalValueOf({ end: sunsetStart, solarNoon, start: sunriseEnd });
    const isPolarDay = dayRaw === 0 && (0, import_suncalc.getPosition)(solarNoon, this.lat, this.lon).altitude >= 0;
    return {
      astronomicalDawn: intervalValueOf({ end: nauticalDawn, solarNoon, start: nightEnd }),
      astronomicalDusk: intervalValueOf({ end: night, solarNoon, start: nauticalDusk }),
      civilDawn: intervalValueOf({ end: sunrise, solarNoon, start: dawn }),
      civilDusk: intervalValueOf({ end: dusk, solarNoon, start: sunset }),
      day: isPolarDay ? halfDay * 2 : dayRaw,
      nauticalDawn: intervalValueOf({ end: dawn, solarNoon, start: nauticalDawn }),
      nauticalDusk: intervalValueOf({ end: nauticalDusk, solarNoon, start: dusk }),
      sunrise: intervalValueOf({ end: sunriseEnd, solarNoon, start: sunrise }),
      sunset: intervalValueOf({ end: sunset, solarNoon, start: sunsetStart })
    };
  };
  getDurationsStat = ({ year }) => {
    let date = new Date(year, 0);
    const ret = [];
    while (date.getFullYear() === year) {
      const durations = this.getDurations({ date });
      ret.push(durations);
      date = add(date, { hours: 24 });
    }
    return ret;
  };
};

// src/client/utils/formatDateValue.ts
function formatDateValue(val) {
  const secs = Math.round(val / 1e3);
  const {
    hours,
    minutes,
    seconds
  } = {
    hours: Math.floor(secs / 3600),
    minutes: Math.floor(secs / 60) % 60,
    seconds: secs % 60
  };
  return [hours, minutes, seconds].map((v) => v?.toFixed(0).padStart(2, "0")).join(":");
}

// src/client/containers/infoBox/suncalc/solarTimesStatsCanvas.ts
var SolarTimesStatsCanvas = class extends Container {
  constructor({ height, keys, map = (val) => val, params = {}, stats, width }) {
    const values = stats.map((durations) => map(SolarTimesStatics.increment({ durations, keys })));
    const min2 = Math.min(...values);
    const max2 = Math.max(...values);
    const scaleY = (height - 1) / (max2 - min2);
    const scaleX = width / stats.length;
    super(Container.from("canvas", {
      height,
      width,
      ...params
    }));
    const context = this.html.getContext("2d");
    if (context) {
      context.beginPath();
      context.strokeStyle = "#000000";
      values.forEach((val, idx) => {
        const x = idx * scaleX;
        const y = (max2 - val) * scaleY + 0.5;
        if (x === 0)
          context.moveTo(x, y);
        else
          context.lineTo(x, y);
      });
      context.stroke();
    }
    this.max = max2;
    this.min = min2;
  }
  min;
  max;
};

// src/client/containers/infoBox/suncalc/valueRow.ts
var ValueRow = class {
  lines = [];
  total = 0;
  totalKeys = [];
  fill = (label, sum) => this.add({
    increment: sum - this.total,
    label
  });
  fillStats = (durations, sum) => this.addStats({
    durations,
    keys: this.totalKeys,
    map: (val) => sum - val
  });
  add({ durations, increment, keys, label }) {
    increment ??= SolarTimesStatics.increment({
      durations: durations.today,
      keys
    }), this.total += increment;
    this.addRow({
      col1: [label],
      col2: [increment ? `+${formatDateValue(increment)}` : ""],
      col3: [formatDateValue(this.total)]
    });
    if (durations)
      this.addStats({ durations, keys });
    return this;
  }
  addRow({ col1 = [], col2 = [], col3 = [], row }) {
    row ??= [
      Container.from("div", {
        style: { marginRight: "auto" }
      }).append(...col1),
      Container.from("div", {
        classes: ["text-end"],
        style: { width: "5em" }
      }).append(...col2),
      Container.from("div", {
        classes: ["text-end"],
        style: { width: "5em" }
      }).append(...col3)
    ];
    this.lines.push(Container.from("div", {
      classes: ["d-flex"]
    }).append(...row));
    return this;
  }
  addStats({ durations, keys, map }) {
    const stats = new SolarTimesStatsCanvas({
      height: 30,
      keys,
      map,
      params: {
        style: {
          backgroundColor: "#ffffff",
          height: "30px",
          width: "15em"
        }
      },
      stats: durations.stats,
      width: 15 * 16
    });
    const axis = [stats.max, stats.min].map((v) => Container.from("div", {
      classes: ["text-end"],
      style: {
        fontSize: "10px"
      }
    }).append(formatDateValue(v)));
    this.addRow({
      row: [
        Container.from("div", {
          style: {
            backgroundColor: "#ffffff",
            borderColor: "#000000",
            borderRight: "1px solid",
            marginLeft: "auto",
            paddingLeft: "3px",
            paddingRight: "3px"
          }
        }).append(...axis),
        stats
      ]
    });
    this.totalKeys.push(...keys);
    return this;
  }
};

// src/client/containers/infoBox/suncalc/solarTimes.ts
var SolarTimes = class extends SolarTimesDurations {
  refresh = () => {
    if (this.x !== position.x || this.y !== position.y) {
      this.x = position.x;
      this.y = position.y;
      this.lat = rad2deg(y2lat(this.y));
      this.lon = rad2deg(x2lon(this.x));
      this.clear();
    }
    const date = /* @__PURE__ */ new Date();
    if (!this.html) {
      const durations = {
        stats: this.getDurationsStat({
          year: date.getFullYear()
        }),
        today: this.getDurations({ date })
      };
      const zhilds = new ValueRow().add({
        durations,
        keys: ["day"],
        label: "Day"
      }).add({
        durations,
        keys: ["sunrise", "sunset"],
        label: "Sunrise/set"
      }).add({
        durations,
        keys: ["civilDawn", "civilDusk"],
        label: "Twilight"
      }).add({
        durations,
        keys: ["nauticalDawn", "nauticalDusk"],
        label: "Naut. Twilight"
      }).fill("Night", halfDay * 2).fillStats(durations, halfDay * 2).lines;
      this.append(...zhilds);
    }
  };
};
var solarTimes = new SolarTimes();

// src/client/containers/infoBox.ts
var InfoBox = class extends Container {
  constructor() {
    super(Container.from("div", {
      classes: ["p-2", "mt-2"],
      style: {
        backgroundColor: "#aaaa",
        borderBottomLeftRadius: "var(--bs-border-radius)",
        borderTopLeftRadius: "var(--bs-border-radius)",
        minWidth: "20rem",
        position: "absolute",
        right: "0"
      }
    }));
  }
  update() {
    this.clear();
    this.append(coordinates());
    if (settings.show.navionicsDetails)
      this.append(navionicsDetails.html);
    if (settings.show.suncalc) {
      solarTimes.refresh();
      this.append(solarTimes);
    }
    imagesToFetch.refresh();
    this.append(imagesToFetch);
  }
};
var coordinates = () => {
  const { height, width } = boundingRect;
  const { x, y } = position;
  const lat2 = y2lat(y);
  const lon2 = x2lon(x);
  const latMouse = y2lat(y + (mouse.y - height / 2) / tileSize);
  const lonMouse = x2lon(x + (mouse.x - width / 2) / tileSize);
  const scale = (() => {
    let nm = px2nm(lat2);
    let px = 1;
    if (nm >= 1)
      return `${px2nm(lat2).toPrecision(3)}nm/px`;
    while (nm < 1) {
      nm *= 10;
      px *= 10;
    }
    return `${nm.toPrecision(3)}nm/${px.toFixed(0)}px`;
  })();
  return Container.from("div", {
    classes: [
      "float-end",
      "text-end"
    ],
    style: {
      width: "fit-content"
    }
  }).append(
    `Scale: ${scale} (Zoom ${position.z})`,
    Container.from("br"),
    `Lat/Lon: ${rad2string({ axis: "NS", pad: 2, phi: lat2 })} ${rad2string({ axis: "EW", pad: 3, phi: lon2 })}`,
    Container.from("br"),
    `Mouse: ${rad2string({ axis: "NS", pad: 2, phi: latMouse })} ${rad2string({ axis: "EW", pad: 3, phi: lonMouse })}`,
    Container.from("br"),
    `User: ${rad2string({ axis: "NS", pad: 2, phi: position.user.latitude })} ${rad2string({ axis: "EW", pad: 3, phi: position.user.longitude })}`
  );
};
var infoBox = new InfoBox();

// src/client/containers/menu/coordsToggle.ts
var coordsToggle = Container.from("a", {
  classes: ["btn", "btn-secondary"],
  onclick: () => {
    settings.units.coords = {
      d: "dm",
      dm: "dms",
      dms: "d"
    }[settings.units.coords] ?? "dm";
    coordsToggle.clear();
    coordsToggle.append({
      d: "Dec",
      dm: "D\xB0M'",
      dms: "DMS"
    }[settings.units.coords]);
    mapContainer.redraw("coords changed");
  },
  role: "button"
});
coordsToggle.append({
  d: "Dec",
  dm: "D\xB0M'",
  dms: "DMS"
}[settings.units.coords]);

// src/client/containers/menu/crosshairToggle.ts
var crosshairToggle = new IconButton({
  active: () => settings.show.crosshair,
  icon: "crosshair",
  onclick: () => {
    settings.show.crosshair = !settings.show.crosshair;
    overlayContainer.redraw();
  }
});

// src/client/containers/menu/goto/address/searchContainer.ts
var addressSearchContainer = Container.from("div", {
  classes: ["dropdown-menu"]
});

// src/client/containers/menu/goto/address/input.ts
var addressQueue = new StyQueue(1);
var addressInput = Container.from("input", {
  autocomplete: "off",
  classes: ["form-control"],
  oninput: async () => {
    const { value } = addressInput.html;
    while (addressQueue.shift())
      ;
    const valid = Boolean(value) && await addressQueue.enqueue(() => {
      return fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${addressInput.html.value}`).then(async (res) => {
        if (!res.ok)
          return false;
        const items = await res.json();
        if (!Array.isArray(items))
          return false;
        if (items.length === 0)
          return false;
        if (value !== addressInput.html.value)
          return false;
        addressSearchContainer.clear();
        addressSearchContainer.append(
          Container.from("div", {
            classes: ["list-group", "list-group-flush"]
          }).append(
            ...items.sort((a, b) => b.importance - a.importance).map((item, idx) => {
              const { boundingbox, display_name: displayName, lat: lat2, lon: lon2 } = extractProperties(item, {
                boundingbox: (val) => Array.isArray(val) ? val.map(deg2rad) : [],
                display_name: String,
                lat: deg2rad,
                lon: deg2rad
              });
              const [lat1 = lat2, lat22 = lat2, lon1 = lon2, lon22 = lon2] = boundingbox;
              const z2 = (() => {
                if (Math.abs(lat22 - lat1) > 0 && Math.abs(lon22 - lon1) > 0) {
                  const diffX = Math.abs(lon2x(lon22, 1) - lon2x(lon1, 1));
                  const diffY = Math.abs(lat2y(lon22, 1) - lat2y(lon1, 1));
                  const zoom = 1 / Math.max(diffX, diffY);
                  return Math.max(2, Math.min(Math.ceil(Math.log2(zoom)), 17));
                }
                return position.z;
              })();
              const onclick = () => {
                addressInput.html.placeholder = value;
                addressInput.html.value = "";
                addressSearchContainer.html.classList.remove("show");
                position.xyz = {
                  x: lon2x(lon2, 1 << z2),
                  y: lat2y(lat2, 1 << z2),
                  z: z2
                };
                mapContainer.redraw("goto address");
              };
              if (idx === 0)
                addressForm.html.onsubmit = onclick;
              return Container.from("a", {
                classes: ["list-group-item"],
                onclick,
                role: "button"
              }).append(`${displayName} (${z2})`);
            })
          )
        );
        return true;
      }).catch(() => false);
    });
    if (valid) {
      addressSearchContainer.html.classList.add("show");
    } else {
      addressSearchContainer.html.classList.remove("show");
      addressSearchContainer.clear();
    }
  },
  placeholder: "Address",
  type: "text"
});

// src/client/containers/menu/goto/address/form.ts
var addressForm = Container.from("form", {
  action: "javascript:void(0)",
  classes: ["m-0"],
  style: {
    minWidth: "20em"
  }
});
addressForm.append(addressInput);

// src/client/containers/menu/goto/address/container.ts
var addressContainer = Container.from("div", {
  classes: ["dropdown"]
});
addressContainer.append(
  addressForm,
  addressSearchContainer
);

// src/client/containers/menu/goto/coord/form.ts
var import_parse_dms2 = __toESM(require_parse_dms(), 1);

// src/client/containers/menu/goto/coord/error.ts
var coordError = Container.from("div", {
  classes: ["form-text"]
});

// src/client/globals/coordUnits.ts
var coordUnits = ["d", "dm", "dms"];

// src/client/containers/menu/goto/coord/info.ts
var coordInfo = fromEntriesTyped(
  coordUnits.map((c) => [
    c,
    Container.from("div", {
      classes: ["form-text"],
      style: {
        width: "max-content"
      }
    })
  ])
);

// src/client/containers/menu/goto/coord/input.ts
var import_parse_dms = __toESM(require_parse_dms(), 1);

// src/client/containers/menu/goto/coord/submit.ts
var coordSubmit = new IconButton({
  icon: "arrow-right-circle",
  onclick: () => coordForm.html.submit()
});

// src/client/containers/menu/goto/coord/input.ts
var coordInput = Container.from("input", {
  autocomplete: "off",
  classes: ["form-control"],
  oninput: () => {
    console.log("oninput");
    coordUnits.forEach((u) => {
      coordInfo[u].html.style.display = "none";
    });
    try {
      if (!coordInput.html.value)
        coordSubmit.html.classList.add("disabled");
      const { lat: latDeg, lon: lonDeg } = (0, import_parse_dms.default)(coordInput.html.value);
      const { lat: lat2, lon: lon2 } = {
        lat: deg2rad(latDeg),
        lon: deg2rad(lonDeg)
      };
      if (typeof latDeg === "number" && typeof lonDeg === "number") {
        coordUnits.forEach((u) => {
          console.log("update lat/lon");
          const func = rad2stringFuncs[u];
          coordInfo[u].html.innerText = `${func({ axis: "NS", pad: 2, phi: lat2 })} ${func({ axis: "EW", pad: 3, phi: lon2 })}`;
          coordInfo[u].html.style.display = "block";
          coordError.html.style.display = "none";
          coordSubmit.html.classList.remove("disabled");
        });
      }
    } catch (e) {
      coordError.html.innerText = e.toString();
      coordError.html.style.display = "block";
      coordSubmit.html.classList.add("disabled");
    }
  },
  placeholder: "Coordinates",
  type: "text"
});

// src/client/containers/menu/goto/coord/form.ts
var coordForm = Container.from("form", {
  action: "javascript:void(0)",
  classes: ["m-0"],
  onsubmit: () => {
    const { lat: latDeg, lon: lonDeg } = (0, import_parse_dms2.default)(coordInput.html.value);
    const { lat: lat2, lon: lon2 } = {
      lat: deg2rad(latDeg),
      lon: deg2rad(lonDeg)
    };
    if (typeof latDeg === "number" && typeof lonDeg === "number") {
      position.xyz = {
        x: lon2x(lon2),
        y: lat2y(lat2)
      };
    }
    mapContainer.redraw("goto");
  },
  style: {
    minWidth: "20em"
  }
});
coordForm.append(
  Container.from("div", {
    classes: ["input-group"]
  }).append(
    coordInput,
    coordSubmit
  ),
  coordError,
  coordInfo.d,
  coordInfo.dm,
  coordInfo.dms
);

// src/client/containers/menu/goto/savedPositions.ts
var import_json_stable_stringify2 = __toESM(require_json_stable_stringify(), 1);

// src/client/utils/savedPositionsFromLocalStoreage.ts
function savedPositionsFromLocalStoreage() {
  const storageItem = new LocalStorageItem("savedPositions");
  const list = storageItem.get();
  console.log(list);
  if (Array.isArray(list)) {
    if (list.every((item) => {
      const check = item.x + item.y + item.z;
      return typeof check === "number" && !Number.isNaN(check);
    }))
      return list;
    console.log("x, y, or z is NaN", list);
  } else
    console.log("savedPositions not an array");
  storageItem.set([]);
  return [];
}

// src/client/containers/menu/goto/savedPositions.ts
var SavedPositions = class extends Container {
  constructor() {
    super();
    this.refresh();
  }
  add({ x, y, z: z2 }) {
    this.edit({ func: "add", x, y, z: z2 });
  }
  delete({ x, y, z: z2 }) {
    this.edit({ func: "delete", x, y, z: z2 });
  }
  refresh() {
    this.clear();
    const list = savedPositionsFromLocalStoreage();
    list.forEach((item) => {
      const { x, y, z: z2 } = extractProperties(item, {
        x: (val) => Number(val) / tileSize,
        y: (val) => Number(val) / tileSize,
        z: Number
      });
      console.log({ item, x, y, z: z2 });
      this.append(
        Container.from("div", {
          classes: ["btn-group", "my-2", "d-flex"],
          role: "group"
        }).append(
          Container.from("a", {
            classes: ["btn", "btn-secondary"],
            onclick: () => {
              position.xyz = { x, y, z: z2 };
              mapContainer.redraw("load position");
            },
            role: "button"
          }).append([
            rad2string({ axis: "NS", pad: 2, phi: y2lat(y, 1 << z2) }),
            rad2string({ axis: "EW", pad: 3, phi: x2lon(x, 1 << z2) }),
            `(${z2})`
          ].join(" ")),
          new IconButton({
            icon: "x",
            onclick: () => {
              this.delete({ x, y, z: z2 });
            },
            style: {
              flexGrow: "0"
            }
          })
        )
      );
    });
  }
  edit({ func, x, y, z: z2 }) {
    const list = new Set(savedPositionsFromLocalStoreage().map((e) => (0, import_json_stable_stringify2.default)(e)));
    list[func]((0, import_json_stable_stringify2.default)({
      x: Math.round(x * tileSize),
      y: Math.round(y * tileSize),
      z: z2
    }));
    new LocalStorageItem("savedPositions").set([...list].map((e) => JSON.parse(e)));
    updateSavedPositionsList();
  }
};
var savedPositions = new SavedPositions();
function updateSavedPositionsList() {
  throw new Error("Function not implemented.");
}

// src/client/containers/menu/gotoMenu.ts
var gotoMenu = Container.from("div", {
  classes: ["dropdown"]
});
gotoMenu.append(
  Container.from("a", {
    classes: ["btn", "btn-secondary", "dropdown-toggle"],
    dataset: {
      bsToggle: "dropdown"
    },
    role: "button"
  }).append("Goto"),
  Container.from("div", {
    classes: ["dropdown-menu", "p-2"]
  }).append(
    coordForm,
    addressContainer,
    savedPositions
  )
);

// src/client/containers/menu/navionicsDetailsToggle.ts
var navionicsDetailsToggle = new IconButton({
  active: () => settings.show.navionicsDetails,
  icon: "question-circle",
  onclick: () => {
    const newActive = !settings.show.navionicsDetails;
    settings.show.navionicsDetails = newActive;
    navionicsDetails.fetch(position);
  }
});

// src/client/containers/menu/overlayToggle.ts
var OverlayToggle = class extends IconButton {
  constructor(source) {
    super({
      active: () => Boolean(settings.show[source]),
      onclick: () => {
        settings.show[source] = !settings.show[source];
        mapContainer.redraw(`overlay ${source} toggle`);
      },
      src: `icons/${source}.svg`
    });
  }
};

// src/client/containers/menu/navionicsToggle.ts
var navionicsToggle = new OverlayToggle("navionics");

// src/client/containers/menu/savePosition.ts
var savePosition = Container.from("a", {
  classes: ["btn", "btn-secondary"],
  onclick: () => {
    savedPositions.add(position.xyz);
  },
  role: "button"
});
savePosition.append("Save");

// src/client/containers/menu/suncalcToggle.ts
var suncalcToggle = new IconButton({
  active: () => settings.show.suncalc,
  icon: "sunrise",
  onclick: () => settings.show.suncalc = !settings.show.suncalc
});

// src/client/containers/menu/vfdensityToggle.ts
var vfdensityToggle = new OverlayToggle("vfdensity");

// src/client/containers/menuContainer.ts
var MenuContainer = class extends Container {
  constructor() {
    super(Container.from("div", {
      classes: ["d-flex", "gap-2", "m-2"],
      dataset: {
        bsTheme: "dark"
      }
    }));
    this.append(
      baselayerMenu,
      Container.from("div", {
        classes: ["btn-group"],
        role: "group"
      }).append(
        new OverlayToggle("openseamap"),
        vfdensityToggle,
        navionicsToggle,
        navionicsDetailsToggle,
        crosshairToggle,
        suncalcToggle,
        coordsToggle
      ),
      gotoMenu,
      savePosition
    );
  }
};
var menuContainer = new MenuContainer();

// src/client/getUserLocation.ts
var geolocationBlocked = false;
async function updateUserLocation() {
  if (geolocationBlocked)
    return position.user;
  await new Promise((resolve, reject) => {
    return navigator.geolocation.getCurrentPosition(
      resolve,
      reject,
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 5e3
      }
    );
  }).then((pos) => {
    const { accuracy, latitude, longitude } = pos.coords;
    position.user = {
      accuracy,
      latitude: deg2rad(latitude),
      longitude: deg2rad(longitude),
      timestamp: pos.timestamp
    };
    new Marker({
      lat: latitude,
      lon: longitude,
      type: "user"
    });
  }).catch((err) => {
    if (err.code === 1)
      geolocationBlocked = true;
    console.warn(`ERROR(${err.code}): ${err.message}`);
  });
  infoBox.update();
  return position.user;
}

// src/client/events/inputListener.ts
function inputListener(event, { x, y } = { x: 0, y: 0 }) {
  const { height, width } = boundingRect;
  const { type } = event;
  let needRedraw = false;
  console.log(event.target);
  if (event instanceof WheelEvent) {
    const { deltaY } = event;
    if (deltaY > 0) {
      needRedraw = position.zoomOut();
      position.xyz = {
        x: position.x - (x - width / 2) / tileSize / 2,
        y: position.y - (y - height / 2) / tileSize / 2
      };
    } else if (deltaY < 0) {
      needRedraw = position.zoomIn();
      position.xyz = {
        x: position.x + (x - width / 2) / tileSize,
        y: position.y + (y - height / 2) / tileSize
      };
    } else {
      console.log("noop", { deltaY, type });
      return;
    }
  } else if (event instanceof KeyboardEvent && event.target instanceof HTMLBodyElement) {
    if (event.isComposing)
      return;
    const { key } = event;
    if (key >= "0" && key <= "9") {
      const baselayer = baselayers[parseInt(key)];
      if (typeof baselayer !== "undefined")
        mapContainer.baselayer = baselayer;
    } else if (key === "c")
      crosshairToggle.html.click();
    else if (key === "d")
      coordsToggle.html.click();
    else if (key === "l")
      updateUserLocation();
    else if (key === "n") {
      if (settings.show.navionicsDetails && settings.show.navionics) {
        navionicsDetailsToggle.html.click();
        navionicsToggle.html.click();
      } else if (settings.show.navionics)
        navionicsDetailsToggle.html.click();
      else
        navionicsToggle.html.click();
    } else if (key === "v")
      vfdensityToggle.html.click();
    else {
      needRedraw = true;
      if (key === "r") {
        position.xyz = {
          x: Math.round(position.x),
          y: Math.round(position.y)
        };
      } else if (key === "u") {
        position.xyz = {
          x: lon2x(position.user.longitude),
          y: lat2y(position.user.latitude)
        };
      } else if (key === "ArrowLeft")
        position.xyz = { x: position.x - 1 };
      else if (key === "ArrowRight")
        position.xyz = { x: position.x + 1 };
      else if (key === "ArrowUp")
        position.xyz = { y: position.y - 1 };
      else if (key === "ArrowDown")
        position.xyz = { y: position.y + 1 };
      else if (key === "PageDown")
        position.zoomIn();
      else if (key === "PageUp")
        position.zoomOut();
      else {
        needRedraw = false;
        console.log("noop", { key, type });
        return;
      }
    }
  } else if (event instanceof MouseEvent) {
    position.xyz = {
      x: Math.round(position.x * tileSize + (mouse.x - x)) / tileSize,
      y: Math.round(position.y * tileSize + (mouse.y - y)) / tileSize
    };
    needRedraw = true;
  }
  if (needRedraw) {
    mapContainer.redraw(type);
  }
}

// src/client/events/mouseInput.ts
function mouseInput(event) {
  const rect = mouseContainer.getBoundingClientRect();
  const { x, y } = {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top
  };
  if (mouse.down.state) {
    if (mouse.x !== x || mouse.y !== y)
      inputListener(event, { x, y });
  }
  if (event instanceof WheelEvent)
    inputListener(event, { x, y });
  const isDown = Boolean(event.buttons & 1);
  if (isDown && !mouse.down.state) {
    mouse.down.x = x;
    mouse.down.y = y;
  }
  if (!isDown && mouse.down.state) {
    if (mouse.down.x === x && mouse.down.y === y) {
      const { height, width } = boundingRect;
      const { x: x2, y: y2, z: z2 } = position;
      navionicsDetails.fetch({
        x: x2 + (mouse.x - width / 2) / tileSize,
        y: y2 + (mouse.y - height / 2) / tileSize,
        z: z2
      });
    } else
      navionicsDetails.fetch(position);
  }
  mouse.down.state = isDown;
  mouse.x = x;
  mouse.y = y;
  if (position.markers.delete("navionics"))
    mapContainer.redraw("delete navionics marker");
  infoBox.update();
}

// src/client/containers/mouseContainer.ts
var MouseContainer = class extends Container {
  constructor() {
    super(Container.from("div", {
      id: "mouseContainer",
      onmousedown: mouseInput,
      onmousemove: mouseInput,
      onmouseup: mouseInput,
      onwheel: mouseInput,
      style: containerStyle
    }));
  }
};
var mouseContainer = new MouseContainer();
mouseContainer.html.tagName;

// src/client/index.ts
var {
  container: containerId = ""
} = Object.fromEntries(new URL(import.meta.url).searchParams.entries());
var container = Container.from(document.getElementById(containerId) ?? Container.from("div").html);
var boundingRect = new Size(container);
container.clear();
container.append(
  mapContainer,
  overlayContainer,
  mouseContainer,
  infoBox,
  menuContainer
);
window.addEventListener("keydown", inputListener);
window.addEventListener("resize", () => {
  boundingRect.refresh();
  mapContainer.redraw("resize");
});
mapContainer.redraw("initial");
export {
  boundingRect
};
//# sourceMappingURL=client.js.map
