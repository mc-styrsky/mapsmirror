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
    var max = Math.max;
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
      var boundLength = max(0, target.length - args.length);
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
    var getProto = Object.getPrototypeOf || (hasProto ? function(x2) {
      return x2.__proto__;
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
      $replace(string, rePropName, function(match, number, quote, subString) {
        result[result.length] = quote ? $replace(subString, reEscapeChar, "$1") : number || match;
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
    var define = require_define_data_property();
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
          define(fn, "length", length, true, true);
        } else {
          define(fn, "length", length);
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
      return function stringify2(parent, key, node, level) {
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
            var item = stringify2(node, i, node[i], level + 1) || jsonStringify(null);
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
          var value = stringify2(node, key, node[key], level + 1);
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

// src/client/utils/createHTMLElement.ts
function createHTMLElement(params) {
  const { classes, dataset, style, tag, zhilds, ...data } = params;
  const element = document.createElement(tag);
  Object.entries(data).forEach(([k, v]) => element[k] = v);
  if (classes)
    classes.forEach((c) => element.classList.add(c));
  if (dataset)
    Object.entries(dataset).forEach(([k, v]) => element.dataset[k] = v);
  if (style)
    Object.entries(style).forEach(([k, v]) => element.style[k] = v);
  if (zhilds)
    zhilds.forEach((child) => {
      if (!child)
        return;
      if (typeof child === "string")
        element.append(document.createTextNode(child));
      else
        element.append(child);
    });
  return element;
}

// src/client/containers/infoBox.ts
var infoBox = createHTMLElement({
  classes: ["float-end"],
  style: {
    backgroundColor: "#80808080",
    borderBottomLeftRadius: "1em",
    padding: "0.3em"
  },
  tag: "div",
  zhilds: []
});

// src/client/containers/mapContainer.ts
var mapContainer = createHTMLElement({
  style: {
    left: "0px",
    position: "absolute",
    top: "0px",
    zIndex: "-200"
  },
  tag: "div",
  zhilds: []
});

// src/common/extractProperties.ts
function extractProperties(obj, builder) {
  return Object.entries(builder).reduce((ret, entry) => {
    const [key, constructor] = entry;
    ret[key] = constructor(obj?.[key]);
    return ret;
  }, {});
}

// src/client/globals/settings.ts
var localStorageSettings = (() => {
  try {
    return JSON.parse(window.localStorage.getItem("settings") ?? "{}");
  } catch {
    return {};
  }
})();
var order = [
  "osm",
  "openseamap",
  "navionics",
  { alpha: 0.5, source: "vfdensity" }
];
var settings = {
  crosshair: extractProperties(localStorageSettings?.crosshair, {
    show: (val) => Boolean(val ?? true)
  }),
  tiles: {
    baselayers: [
      "",
      "osm",
      "googlesat",
      "googlestreet",
      "googlehybrid",
      "gebco",
      "bingsat",
      "bluemarble",
      "opentopomap"
    ],
    enabled: Object.fromEntries(order.map((e) => typeof e === "string" ? e : e.source).filter((e) => e !== "openseamap").map((e) => [e, Boolean(localStorageSettings?.tiles?.enabled?.[e] ?? true)])),
    order
  },
  units: extractProperties(localStorageSettings?.units, {
    coords: (val) => ["d", "dm", "dms"].includes(val) ? val : "dm"
  })
};
var baselayer = localStorageSettings?.tiles?.order?.[0];
settings.tiles.order[0] = settings.tiles.baselayers.includes(baselayer) ? baselayer : "osm";
settings.tiles.enabled[settings.tiles.order[0]] = true;
console.log(settings);

// src/client/redraw.ts
var import_json_stable_stringify = __toESM(require_json_stable_stringify(), 1);

// src/client/sphericCircle.ts
var sphericCircle = (lat, lon, radius, steps = 256) => {
  const sinRadius = Math.sin(radius);
  const cosRadius = Math.cos(radius);
  const sinLat = Math.sin(lat);
  const cosLat = Math.cos(lat);
  const pi2 = Math.PI * 2;
  const points = [];
  for (let step = 0; step <= steps; step++) {
    const omega = step / steps * pi2;
    const { lat2, lon2 } = sphericLatLon({ cosLat, cosRadius, lat, omega, radius, sinLat, sinRadius });
    if (step === 0)
      points.push([lat2, lon + Math.abs(lon2), false]);
    else if (step === steps / 2) {
      points.push([lat2, lon + Math.abs(lon2), true]);
      points.push([lat2, lon - Math.abs(lon2), false]);
    } else if (step === steps)
      points.push([lat2, lon - Math.abs(lon2), true]);
    else
      points.push([lat2, lon + lon2, true]);
  }
  return points;
};
var sphericLatLon = ({ cosLat, cosRadius, lat, omega, radius, sinLat, sinRadius }) => {
  sinRadius ??= Math.sin(radius);
  cosRadius ??= Math.cos(radius);
  sinLat ??= Math.sin(lat);
  cosLat ??= Math.cos(lat);
  const pi2 = 2 * Math.PI;
  const lonSign = omega - pi2 * Math.floor(omega / pi2) > Math.PI ? -1 : 1;
  const sinLat2 = Math.max(-1, Math.min(Math.cos(omega) * cosLat * sinRadius + sinLat * cosRadius, 1));
  const lat2 = Math.asin(sinLat2);
  const cosLat2 = Math.sqrt(1 - sinLat2 * sinLat2);
  const cosLon2 = Math.max(-1, Math.min((cosRadius - sinLat * sinLat2) / cosLat / cosLat2, 1));
  const lon2 = Math.acos(cosLon2) * lonSign;
  const cosOmega2 = (sinLat - sinLat2 * cosRadius) / (cosLat2 * sinRadius);
  return { cosOmega2, lat2, lon2 };
};

// src/client/utils/frac.ts
var frac = (x2) => x2 - Math.floor(x2);

// src/client/globals/position.ts
var { ttl, x, y, z } = extractProperties(Object.fromEntries(new URL(window.location.href).searchParams.entries()), {
  ttl: (val) => parseInt(val ?? 0),
  x: (val) => parseFloat(val ?? 2),
  y: (val) => parseFloat(val ?? 2),
  z: (val) => parseInt(val ?? 2)
});
var position = {
  map: { x, y, z },
  tiles: 1 << z,
  ttl,
  user: {
    accuracy: 0,
    latitude: 0,
    longitude: 0,
    timestamp: 0
  },
  x,
  y,
  z
};

// src/client/utils/lat2y.ts
var lat2y = (lat, tiles = position.tiles) => {
  return (0.5 - Math.asinh(Math.tan(lat)) / Math.PI / 2) * tiles;
};

// src/client/utils/lon2x.ts
var lon2x = (lon, tiles = position.tiles) => (lon / Math.PI / 2 + 0.5) * tiles;

// src/client/utils/min2rad.ts
var min2rad = (min) => min / 60 / 180 * Math.PI;

// src/client/utils/nm2px.ts
var nm2px = (lat) => {
  const stretch = 1 / Math.cos(lat);
  return position.tiles * tileSize / 360 / 60 * stretch;
};

// src/client/utils/x2lon.ts
var x2lon = (x2, tiles = position.tiles) => (x2 / tiles - 0.5) * Math.PI * 2;

// src/client/utils/y2lat.ts
var y2lat = (y2, tiles = position.tiles) => Math.asin(Math.tanh((0.5 - y2 / tiles) * 2 * Math.PI));

// src/client/canvases/crosshairs.ts
var createCrosshairsCanvas = ({
  height,
  width,
  x: x2,
  y: y2
}) => {
  const canvas = createHTMLElement({
    height,
    style: {
      height: `${height}px`,
      position: "absolute",
      width: `${width}px`
    },
    tag: "canvas",
    width
  });
  const context = canvas.getContext("2d");
  if (!settings.crosshair.show || !context)
    return canvas;
  const lat = y2lat(y2);
  const lon = x2lon(x2);
  const milesPerTile = 100 / nm2px(lat);
  const scale = Math.log10(milesPerTile);
  const scaleFloor = Math.floor(scale);
  const scaleFrac = frac(scale);
  const milesPerArc = Math.pow(10, scaleFloor) * (scaleFrac < 0.3 ? 1 : scaleFrac > 0.7 ? 5 : 2);
  const milesPerDiv = milesPerArc / 10;
  context.translate(width / 2, height / 2);
  let minLast = 0;
  context.beginPath();
  context.strokeStyle = "#ff0000";
  context.moveTo(-5, 5);
  context.lineTo(5, -5);
  context.moveTo(5, 5);
  context.lineTo(-5, -5);
  context.stroke();
  for (let minArc = milesPerArc; minArc < 10800; minArc += milesPerArc) {
    const radiusX = nm2px(lat) * minArc;
    if (radiusX > canvas.width)
      break;
    const radDiv = min2rad(minArc);
    const circlePoints = sphericCircle(lat, lon, radDiv).map(([latPoint, lonPoint, draw]) => ({
      draw,
      tx: (lon2x(lonPoint) - x2) * tileSize,
      ty: (lat2y(latPoint) - y2) * tileSize
    }));
    context.beginPath();
    context.strokeStyle = "#ff0000";
    circlePoints.forEach(({ draw, tx, ty }, idx) => {
      if (draw)
        context.lineTo(tx, ty);
      else
        context.moveTo(tx, ty);
      if (idx === 32)
        context.strokeText(`${minArc.toFixed(Math.max(0, -scaleFloor))}nm`, tx, ty);
    });
    context.stroke();
    const piHalf = Math.PI / 2;
    context.beginPath();
    for (let minDiv = minLast + milesPerDiv; minDiv < minArc; minDiv += milesPerDiv) {
      const radDiv2 = min2rad(minDiv);
      if (lat + radDiv2 < piHalf) {
        const top = (lat2y(lat + radDiv2) - y2) * tileSize;
        context.moveTo(-5, top);
        context.lineTo(5, top);
      }
      if (lat - radDiv2 > -piHalf) {
        const bottom = (lat2y(lat - radDiv2) - y2) * tileSize;
        context.moveTo(-5, bottom);
        context.lineTo(5, bottom);
      }
      const { cosOmega2, lat2, lon2 } = sphericLatLon({ lat, omega: piHalf, radius: radDiv2 });
      const sinOmega2 = Math.sqrt(1 - cosOmega2 * cosOmega2);
      context.moveTo(
        (lon2x(lon + lon2) - x2) * tileSize + cosOmega2 * 5,
        (lat2y(lat2) - y2) * tileSize - sinOmega2 * 5
      );
      context.lineTo(
        (lon2x(lon + lon2) - x2) * tileSize - cosOmega2 * 5,
        (lat2y(lat2) - y2) * tileSize + sinOmega2 * 5
      );
      context.moveTo(
        (lon2x(lon - lon2) - x2) * tileSize - cosOmega2 * 5,
        (lat2y(lat2) - y2) * tileSize - sinOmega2 * 5
      );
      context.lineTo(
        (lon2x(lon - lon2) - x2) * tileSize + cosOmega2 * 5,
        (lat2y(lat2) - y2) * tileSize + sinOmega2 * 5
      );
      context.strokeStyle = "#ff0000";
    }
    context.stroke();
    minLast = minArc;
  }
  return canvas;
};

// src/client/globals/mouse.ts
var mouse = {
  down: false,
  x: 0,
  y: 0
};

// src/client/utils/px2nm.ts
var px2nm = (lat) => {
  const stretch = 1 / Math.cos(lat);
  return 360 * 60 / position.tiles / tileSize / stretch;
};

// src/client/utils/rad2deg.ts
var rad2degFunctions = {
  d: ({ axis = " -", pad = 0, phi }) => {
    let deg = Math.round(phi * 180 / Math.PI % 360 * 1e5) / 1e5;
    while (deg > 180)
      deg -= 360;
    while (deg < -180)
      deg += 360;
    return `${axis[deg < 0 ? 1 : 0] ?? ""}${(deg < 0 ? -deg : deg).toFixed(5).padStart(pad + 6, "0")}\xB0`;
  },
  dm: ({ axis = " -", pad = 0, phi }) => {
    let deg = Math.round(phi * 180 / Math.PI % 360 * 6e4) / 6e4;
    while (deg > 180)
      deg -= 360;
    while (deg < -180)
      deg += 360;
    const degrees = deg | 0;
    const minutes = (Math.abs(deg) - Math.abs(degrees)) * 60;
    return `${axis[deg < 0 ? 1 : 0] ?? ""}${(deg < 0 ? -degrees : degrees).toFixed(0).padStart(pad, "0")}\xB0${minutes.toFixed(3).padStart(6, "0")}'`;
  },
  dms: ({ axis = " -", pad = 0, phi }) => {
    let deg = Math.round(phi * 180 / Math.PI % 360 * 36e4) / 36e4;
    while (deg > 180)
      deg -= 360;
    while (deg < -180)
      deg += 360;
    const degrees = deg | 0;
    const min = Math.round((Math.abs(deg) - Math.abs(degrees)) * 36e4) / 6e3;
    const minutes = min | 0;
    const seconds = (min - minutes) * 60;
    return `${axis[deg < 0 ? 1 : 0] ?? ""}${(deg < 0 ? -degrees : degrees).toFixed(0).padStart(pad, "0")}\xB0${minutes.toFixed(0).padStart(2, "0")}'${seconds.toFixed(2).padStart(5, "0")}"`;
  }
};
var rad2deg = ({ axis = " -", pad = 0, phi }) => rad2degFunctions[settings.units.coords]({ axis, pad, phi });

// src/client/updateInfoBox.ts
var updateInfoBox = () => {
  if (!container)
    return;
  const { height, width } = container.getBoundingClientRect();
  const lat = y2lat(position.y);
  const lon = x2lon(position.x);
  const latMouse = y2lat(position.y + (mouse.y - height / 2) / tileSize);
  const lonMouse = x2lon(position.x + (mouse.x - width / 2) / tileSize);
  const scale = (() => {
    let nm = px2nm(lat);
    let px = 1;
    if (nm >= 1)
      return `${px2nm(lat).toPrecision(3)}nm/px`;
    while (nm < 1) {
      nm *= 10;
      px *= 10;
    }
    return `${nm.toPrecision(3)}nm/${px.toFixed(0)}px`;
  })();
  infoBox.innerHTML = "";
  infoBox.append(
    `Scale: ${scale} (Zoom ${position.z})`,
    createHTMLElement({ tag: "br" }),
    `Lat/Lon: ${rad2deg({ axis: "NS", pad: 2, phi: lat })} ${rad2deg({ axis: "EW", pad: 3, phi: lon })}`,
    createHTMLElement({ tag: "br" }),
    `Mouse: ${rad2deg({ axis: "NS", pad: 2, phi: latMouse })} ${rad2deg({ axis: "EW", pad: 3, phi: lonMouse })}`,
    createHTMLElement({ tag: "br" }),
    `User: ${rad2deg({ axis: "NS", pad: 2, phi: position.user.latitude })} ${rad2deg({ axis: "EW", pad: 3, phi: position.user.longitude })} (@${new Date(position.user.timestamp).toLocaleTimeString()})`,
    ...imagesToFetch.stateHtml()
  );
};

// src/client/utils/imagesToFetch.ts
var ImagesToFetch = class {
  constructor() {
  }
  xyz2string = ({ x: x2, y: y2, z: z2 }) => `${z2.toString(16)}_${x2.toString(16)}_${y2.toString(16)}`;
  data = {};
  total = {};
  getSet = (source) => this.data[source] ??= /* @__PURE__ */ new Set();
  add = ({ source, ...xyz }) => {
    this.getSet(source).add(this.xyz2string(xyz));
    this.total[source] = (this.total[source] ?? 0) + 1;
    updateInfoBox();
  };
  delete = ({ source, ...xyz }) => {
    this.getSet(source).delete(this.xyz2string(xyz));
    if (this.getSet(source).size === 0)
      delete this.data[source];
    updateInfoBox();
  };
  reset = () => {
    this.total = {};
  };
  state = () => {
    return Object.entries(this.data).map(([key, val]) => [key, val.size]);
  };
  stateHtml = () => {
    return this.state().reduce(
      (arr, [source, size]) => {
        arr.push(createHTMLElement({ tag: "br" }));
        arr.push(`${source}: ${size}/${this.total[source]}`);
        return arr;
      },
      []
    );
  };
};
var imagesToFetch = new ImagesToFetch();

// src/client/canvases/map/drawImage.ts
var drawImage = ({
  context,
  scale = 1,
  source,
  ttl: ttl2,
  x: x2,
  y: y2,
  z: z2
}) => {
  const src = `/tile/${source}/${[
    z2,
    Math.floor(x2 / scale).toString(16),
    Math.floor(y2 / scale).toString(16)
  ].join("/")}?ttl=${ttl2}`;
  const sx = Math.floor(frac(x2 / scale) * scale) * tileSize / scale;
  const sy = Math.floor(frac(y2 / scale) * scale) * tileSize / scale;
  const sw = tileSize / scale;
  imagesToFetch.add({ source, x: x2, y: y2, z: z2 });
  const img = new Image();
  img.src = src;
  const prom = new Promise((resolve) => {
    img.onload = () => {
      context.drawImage(
        img,
        sx,
        sy,
        sw,
        sw,
        0,
        0,
        tileSize,
        tileSize
      );
      resolve(true);
      imagesToFetch.delete({ source, x: x2, y: y2, z: z2 });
    };
    img.onerror = () => {
      resolve(
        z2 > 0 ? drawImage({
          context,
          scale: scale << 1,
          source,
          ttl: ttl2,
          x: x2,
          y: y2,
          z: z2 - 1
        }) : false
      );
      imagesToFetch.delete({ source, x: x2, y: y2, z: z2 });
    };
  });
  return prom;
};

// src/client/canvases/map/navionicsWatermark.ts
var navionicsWatermark = (async () => {
  const img = new Image();
  img.src = "/navionicsWatermark.png";
  const cnvs = new OffscreenCanvas(256, 256);
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

// src/client/canvases/map/drawNavionics.ts
var backgroundColors = [
  2142456,
  5818616,
  6867192,
  8442104,
  10541304,
  11067640,
  11591928,
  12642552,
  16316664
].reduce((arr, val) => {
  const r = val >> 16;
  const g = val >> 8 & 255;
  const b = val & 255;
  const diff = 2;
  for (let dr = -diff; dr <= diff; dr++) {
    for (let dg = -diff; dg <= diff; dg++) {
      for (let db = -diff; db <= diff; db++) {
        arr.add((r + dr << 16) + (g + dg << 8) + b + db);
      }
    }
  }
  return arr;
}, /* @__PURE__ */ new Set());
var drawNavionics = async ({ context, source, ttl: ttl2, x: x2, y: y2, z: z2 }) => {
  const workerCanvas = new OffscreenCanvas(tileSize, tileSize);
  const workerContext = workerCanvas.getContext("2d");
  const watermark = await navionicsWatermark;
  if (!workerContext || !watermark)
    return false;
  const drawProm = drawImage({ context: workerContext, source, ttl: ttl2, x: x2, y: y2, z: z2 });
  const draw = await drawProm;
  if (!draw)
    return false;
  imagesToFetch.add({ source: "transparent", x: x2, y: y2, z: z2 });
  const img = workerContext.getImageData(0, 0, tileSize, tileSize);
  const { data } = img;
  for (let i = 0; i < watermark.length; i++) {
    const mask = watermark[i];
    const [r, g, b] = data.subarray(i * 4, i * 4 + 3).map((v) => v * 248 / mask);
    const color = (r << 16) + (g << 8) + b;
    if (color === 10012672)
      data[i * 4 + 3] = 64;
    else if (backgroundColors.has(color))
      data[i * 4 + 3] = 0;
  }
  workerContext.putImageData(img, 0, 0);
  imagesToFetch.delete({ source: "transparent", x: x2, y: y2, z: z2 });
  context.drawImage(workerCanvas, 0, 0);
  return true;
};

// src/client/canvases/map/drawCachedImage.ts
var drawCachedImage = async ({
  alpha,
  context,
  source,
  trans,
  ttl: ttl2,
  usedImages,
  x: x2,
  y: y2,
  z: z2
}) => {
  const isNavionics = source === "navionics";
  const src = `/${source}/${[
    z2,
    x2.toString(16),
    y2.toString(16)
  ].join("/")}`;
  const drawCanvas = (cnvs) => {
    usedImages.add(src);
    context.globalAlpha = alpha;
    context.drawImage(
      cnvs,
      x2 * tileSize + trans.x,
      y2 * tileSize + trans.y
    );
  };
  const cachedCanvas = await imagesMap[src];
  if (cachedCanvas)
    return () => {
      drawCanvas(cachedCanvas);
      return Promise.resolve(true);
    };
  const workerCanvas = new OffscreenCanvas(tileSize, tileSize);
  const workerContext = workerCanvas.getContext("2d");
  if (!workerContext)
    return () => Promise.resolve(true);
  const successProm = isNavionics ? drawNavionics({ context: workerContext, source, ttl: ttl2, x: x2, y: y2, z: z2 }) : drawImage({ context: workerContext, source, ttl: ttl2, x: x2, y: y2, z: z2 });
  imagesMap[src] = successProm.then((success) => success ? workerCanvas : null);
  return async () => {
    const success = await successProm;
    if (success) {
      drawCanvas(workerCanvas);
    }
    return success;
  };
};

// src/client/canvases/mapCanvas.ts
var imagesLastUsed = /* @__PURE__ */ new Set();
var imagesMap = {};
var createMapCanvas = async ({
  height,
  width,
  x: x2,
  y: y2,
  z: z2
}) => {
  const canvasWidth = width + 2 * tileSize;
  const canvasHeight = height + 2 * tileSize;
  const canvas = createHTMLElement({
    style: {
      height: `${canvasHeight}px`,
      left: `${-tileSize}px`,
      position: "absolute",
      top: `${-tileSize}px`,
      width: `${canvasWidth}px`
    },
    tag: "canvas"
  });
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  const context = canvas.getContext("2d");
  if (!context)
    return canvas;
  context.translate(tileSize, tileSize);
  const trans = {
    x: Math.round(width / 2 - x2 * tileSize),
    y: Math.round(height / 2 - y2 * tileSize)
  };
  const maxdx = Math.ceil((width - trans.x) / tileSize);
  const maxdy = Math.ceil((height - trans.y) / tileSize);
  const mindx = -Math.ceil(trans.x / tileSize);
  const mindy = -Math.ceil(trans.y / tileSize);
  const dxArray = [];
  for (let dx = mindx; dx < maxdx; dx++)
    dxArray.push(dx);
  const dyArray = [];
  for (let dy = mindy; dy < maxdy; dy++) {
    if (dy >= 0 && dy < position.tiles)
      dyArray.push(dy);
  }
  const usedImages = /* @__PURE__ */ new Set();
  const ttl2 = Math.max(Math.min(17, z2 + Math.max(0, position.ttl)) - z2, 0);
  await Promise.all(dxArray.map(async (dx) => {
    await Promise.all(dyArray.map((dy) => {
      return settings.tiles.order.reduce(async (prom, entry) => {
        const { alpha, source } = typeof entry === "string" ? { alpha: 1, source: entry } : entry;
        if (source && settings.tiles.enabled[source]) {
          const draw = drawCachedImage({ alpha, context, source, trans, ttl: ttl2, usedImages, x: dx, y: dy, z: z2 });
          await prom;
          await (await draw)();
        }
        return prom;
      }, Promise.resolve());
    }));
  })).then(() => {
    usedImages.forEach((i) => {
      imagesLastUsed.delete(i);
      imagesLastUsed.add(i);
    });
    [...imagesLastUsed].slice(0, -1e3).forEach((src) => {
      delete imagesMap[src];
      imagesLastUsed.delete(src);
    });
  });
  return canvas;
};

// src/client/canvases/net.ts
var scales = [
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
var getScale = (lat, minPx = 100) => {
  const target = px2nm(lat) * minPx;
  return min2rad(scales.reduce((prev, curr) => {
    return prev > target ? prev : curr;
  }, scales[0]));
};
var createNetCanvas = ({
  height,
  width,
  x: x2,
  y: y2
}) => {
  const canvas = createHTMLElement({
    height,
    style: {
      height: `${height}px`,
      position: "absolute",
      width: `${width}px`
    },
    tag: "canvas",
    width
  });
  const context = canvas.getContext("2d");
  if (!context)
    return canvas;
  context.translate(width / 2, height / 2);
  const lat = y2lat(y2);
  const scaleX = getScale(0, context.measureText(rad2deg({ axis: "WW", pad: 3, phi: 0 })).width);
  const scaleY = getScale(lat);
  const left = x2 - width / 2 / tileSize;
  const right = x2 + width / 2 / tileSize;
  const top = y2 - height / 2 / tileSize;
  const bottom = y2 + height / 2 / tileSize;
  const strokeText = (text, x3, y3) => {
    context.strokeText(text, x3, y3);
    context.fillText(text, x3, y3);
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
      x1: (left - x2) * tileSize,
      x2: (right - x2) * tileSize,
      y1: (lat2y(latGrid) - y2) * tileSize
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
      x1: (lon2x(lonGrid) - x2) * tileSize,
      y1: (top - y2) * tileSize,
      y2: (bottom - y2) * tileSize
    });
  }
  context.beginPath();
  context.strokeStyle = "#808080";
  pointsY.forEach(({ x1, x2: x22, y1 }) => {
    context.moveTo(x1, y1);
    context.lineTo(x22, y1);
  });
  pointsX.forEach(({ x1, y1, y2: y22 }) => {
    context.moveTo(x1, y1);
    context.lineTo(x1, y22);
  });
  context.stroke();
  context.beginPath();
  context.strokeStyle = "#ffffff";
  context.fillStyle = "#000000";
  context.lineWidth = 3;
  pointsY.forEach(({ latGrid, x1, y1 }) => {
    strokeText(
      rad2deg({ axis: "NS", pad: 2, phi: latGrid }),
      x1 + 3,
      y1 - 3
    );
  });
  pointsX.forEach(({ lonGrid, x1, y2: y22 }) => {
    strokeText(
      rad2deg({ axis: "EW", pad: 3, phi: lonGrid }),
      x1 + 3,
      y22 - 3
    );
  });
  context.fill();
  context.stroke();
  return canvas;
};

// src/client/containers/overlayContainer.ts
var overlayContainer = createHTMLElement({
  style: {
    left: "0px",
    position: "absolute",
    top: "0px",
    zIndex: "-100"
  },
  tag: "div",
  zhilds: []
});

// src/client/redraw.ts
var working = false;
var newWorker = false;
function moveCanvas({ canvas, height, width, x: x2, y: y2, z: z2 }) {
  const scaleZ = z2 >= position.map.z ? 1 << z2 - position.map.z : 1 / (1 << position.map.z - z2);
  const shiftX = (position.map.x * scaleZ - x2) * tileSize;
  const shiftY = (position.map.y * scaleZ - y2) * tileSize;
  canvas.style.height = `${scaleZ * canvas.height}px`;
  canvas.style.width = `${scaleZ * canvas.width}px`;
  canvas.style.left = `${(width - canvas.width * scaleZ) / 2 + shiftX}px`;
  canvas.style.top = `${(height - canvas.height * scaleZ) / 2 + shiftY}px`;
}
var map = null;
var redraw = async (type) => {
  if (!container)
    return;
  const { height, width } = container.getBoundingClientRect();
  const { tiles, x: x2, y: y2, z: z2 } = position;
  const crosshairs = createCrosshairsCanvas({ height, width, x: x2, y: y2 });
  const net = createNetCanvas({ height, width, x: x2, y: y2 });
  overlayContainer.innerHTML = "";
  overlayContainer.append(crosshairs, net);
  updateInfoBox();
  if (map)
    moveCanvas({ canvas: map, height, width, x: x2, y: y2, z: z2 });
  await new Promise((r) => setTimeout(r, 1));
  if (working) {
    if (newWorker)
      return;
    newWorker = true;
    setTimeout(() => {
      newWorker = false;
      redraw(type);
    }, 10);
    return;
  }
  working = true;
  newWorker = false;
  console.log(`${type} redraw@${(/* @__PURE__ */ new Date()).toISOString()}`);
  await createMapCanvas({ height, width, x: x2, y: y2, z: z2 }).then((newCanvas) => {
    if (!container)
      return;
    position.x = (position.x + position.tiles) % position.tiles;
    map = newCanvas;
    position.map.x = (x2 + tiles) % tiles;
    position.map.y = y2;
    position.map.z = z2;
    mapContainer.innerHTML = "";
    mapContainer.append(newCanvas);
  });
  imagesToFetch.reset();
  (() => {
    const { origin, pathname, search } = window.location;
    const newsearch = `?z=${z2}&${Object.entries({ ttl: position.ttl, x: position.x, y: position.y }).map(([k, v]) => `${k}=${v}`).join("&")}`;
    if (newsearch !== search) {
      const newlocation = `${origin}${pathname}${newsearch}`;
      window.history.pushState({ path: newlocation }, "", newlocation);
    }
    const newsettings = (0, import_json_stable_stringify.default)(settings);
    if (window.localStorage.getItem("settings") !== newsettings) {
      window.localStorage.setItem("settings", newsettings);
    }
  })();
  setTimeout(() => working = false, 100);
};

// src/client/containers/menu/baselayerMenu.ts
var baselayerMenuButton = createHTMLElement({
  classes: ["btn", "btn-secondary", "dropdown-toggle"],
  dataset: {
    bsToggle: "dropdown"
  },
  role: "button",
  tag: "a",
  zhilds: [settings.tiles.order[0]]
});
var setBaseLayer = (source) => {
  settings.tiles.baselayers.forEach((key) => settings.tiles.enabled[key] = key === source);
  settings.tiles.order[0] = source;
  baselayerMenuButton.innerText = source;
  redraw("changed baselayer");
};
var baselayerMenu = createHTMLElement({
  classes: ["dropdown"],
  tag: "div",
  zhilds: [
    baselayerMenuButton,
    createHTMLElement({
      classes: ["dropdown-menu"],
      tag: "ul",
      zhilds: [
        createHTMLElement({
          tag: "li",
          zhilds: settings.tiles.baselayers.map((source) => {
            return createHTMLElement({
              classes: ["dropdown-item"],
              onclick: () => setBaseLayer(source),
              tag: "a",
              zhilds: [source || "- none -"]
            });
          })
        })
      ]
    })
  ]
});

// src/client/containers/menu/coordsToggle.ts
var coordsToggle = createHTMLElement({
  classes: ["btn", "btn-secondary"],
  onclick: () => {
    settings.units.coords = {
      d: "dm",
      dm: "dms",
      dms: "d"
    }[settings.units.coords] ?? "dm";
    coordsToggle.innerText = {
      d: "Dec",
      dm: "D\xB0M'",
      dms: "DMS"
    }[settings.units.coords];
    redraw("coords changed");
  },
  role: "button",
  tag: "a",
  zhilds: [{
    d: "Dec",
    dm: "D\xB0M'",
    dms: "DMS"
  }[settings.units.coords]]
});

// src/client/containers/menu/iconButton.ts
var iconButton = ({ active, onclick, src }) => {
  const ret = createHTMLElement({
    classes: ["btn", active() ? "btn-success" : "btn-secondary"],
    role: "button",
    style: {
      padding: "0.25rem"
    },
    tag: "a",
    zhilds: [
      createHTMLElement({
        src,
        style: {
          height: "1.75rem"
        },
        tag: "img"
      })
    ]
  });
  ret.onclick = () => {
    onclick();
    if (active()) {
      ret.classList.add("btn-success");
      ret.classList.remove("btn-secondary");
    } else {
      ret.classList.add("btn-secondary");
      ret.classList.remove("btn-success");
    }
    redraw("icon clicked");
  };
  return ret;
};

// src/client/containers/menu/crosshairToggle.ts
var crosshairToggle = iconButton({
  active: () => settings.crosshair.show,
  onclick: () => settings.crosshair.show = !settings.crosshair.show,
  src: "bootstrap-icons-1.11.2/crosshair.svg"
});

// src/client/containers/menu/gotoMenu.ts
var import_parse_dms = __toESM(require_parse_dms(), 1);
var coodUnits = ["d", "dm", "dms"];
var info = fromEntriesTyped(
  coodUnits.map((c) => [
    c,
    createHTMLElement({
      classes: ["form-text"],
      style: {
        width: "max-content"
      },
      tag: "div"
    })
  ])
);
var gotoInput = createHTMLElement({
  autocomplete: "off",
  classes: ["form-control"],
  oninput: () => {
    console.log("oninput");
    coodUnits.forEach((u) => {
      info[u].style.display = "none";
    });
    const { lat: latDeg, lon: lonDeg } = (0, import_parse_dms.default)(gotoInput.value);
    const { lat, lon } = {
      lat: latDeg * Math.PI / 180,
      lon: lonDeg * Math.PI / 180
    };
    if (latDeg && lonDeg)
      coodUnits.forEach((u) => {
        console.log("update lat/lon");
        const func = rad2degFunctions[u];
        info[u].innerText = `${func({ axis: "NS", pad: 2, phi: lat })} ${func({ axis: "EW", pad: 3, phi: lon })}`;
        info[u].style.display = "block";
      });
  },
  tag: "input",
  type: "text"
});
var submit = createHTMLElement({
  classes: ["btn", "btn-primary"],
  tag: "button",
  type: "submit",
  zhilds: ["Goto"]
});
var form = createHTMLElement({
  action: "javascript:void(0)",
  classes: ["dropdown-menu", "p-2"],
  onsubmit: () => {
    const { lat: latDeg, lon: lonDeg } = (0, import_parse_dms.default)(gotoInput.value);
    const { lat, lon } = {
      lat: latDeg * Math.PI / 180,
      lon: lonDeg * Math.PI / 180
    };
    if (latDeg && lonDeg) {
      position.x = lon2x(lon);
      position.y = lat2y(lat);
    }
    redraw("goto");
  },
  style: {
    minWidth: "20em"
  },
  tag: "form",
  zhilds: [
    createHTMLElement({
      classes: ["input-group"],
      tag: "div",
      zhilds: [
        gotoInput,
        submit
      ]
    }),
    info.d,
    info.dm,
    info.dms
  ]
});
var gotoMenu = createHTMLElement({
  classes: ["dropdown"],
  tag: "div",
  zhilds: [
    createHTMLElement({
      classes: ["btn", "btn-secondary", "dropdown-toggle"],
      dataset: {
        bsToggle: "dropdown"
      },
      role: "button",
      tag: "a",
      zhilds: ["Goto"]
    }),
    form
  ]
});
function fromEntriesTyped(entries) {
  return Object.fromEntries(entries);
}

// src/client/containers/menu/overlayToggle.ts
var overlayToggle = (source) => iconButton({
  active: () => Boolean(settings.tiles.enabled[source]),
  onclick: () => settings.tiles.enabled[source] = !settings.tiles.enabled[source],
  src: `icons/${source}.svg`
});

// src/client/containers/menu/navionicsToggle.ts
var navionicsToggle = overlayToggle("navionics");

// src/client/containers/menu/vfdensityToggle.ts
var vfdensityToggle = overlayToggle("vfdensity");

// src/client/containers/menuContainer.ts
var menuContainer = createHTMLElement({
  classes: ["d-flex", "d-flex-row", "gap-2", "m-2"],
  dataset: {
    bsTheme: "dark"
  },
  tag: "div",
  zhilds: [
    baselayerMenu,
    createHTMLElement({
      classes: ["btn-group"],
      role: "group",
      tag: "div",
      zhilds: [
        overlayToggle("openseamap"),
        vfdensityToggle,
        navionicsToggle,
        crosshairToggle,
        coordsToggle
      ]
    }),
    gotoMenu
  ]
});

// src/client/getUserLocation.ts
var geolocationBlocked = false;
var updateGeoLocation = async () => {
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
      latitude: latitude * Math.PI / 180,
      longitude: longitude * Math.PI / 180,
      timestamp: pos.timestamp
    };
  }).catch((err) => {
    if (err.code === 1)
      geolocationBlocked = true;
    console.warn(`ERROR(${err.code}): ${err.message}`);
  });
  updateInfoBox();
  return position.user;
};

// src/client/events/oninput.ts
var zoomIn = () => {
  if (position.z < 20) {
    position.z++;
    position.x *= 2;
    position.y *= 2;
    position.tiles = 1 << position.z;
    return true;
  }
  return false;
};
var zoomOut = () => {
  if (position.z > 2) {
    position.z--;
    position.x /= 2;
    position.y /= 2;
    position.tiles = 1 << position.z;
    return true;
  }
  return false;
};
var onchange = (event) => {
  if (!container)
    return;
  const { height, width } = container.getBoundingClientRect();
  const { type } = event;
  let needRedraw = false;
  if (event instanceof WheelEvent) {
    const { clientX, clientY, deltaY } = event;
    if (deltaY > 0) {
      needRedraw = zoomOut();
      position.x -= (clientX - width / 2) / tileSize / 2;
      position.y -= (clientY - height / 2) / tileSize / 2;
    } else if (deltaY < 0) {
      needRedraw = zoomIn();
      position.x += (clientX - width / 2) / tileSize;
      position.y += (clientY - height / 2) / tileSize;
    } else {
      console.log("noop", { deltaY, type });
      return;
    }
  } else if (event instanceof KeyboardEvent) {
    if (event.isComposing)
      return;
    if (event.target instanceof HTMLInputElement)
      return;
    const { key } = event;
    if (key >= "0" && key <= "9") {
      setBaseLayer(settings.tiles.baselayers[parseInt(key)]);
    } else if (key === "c")
      crosshairToggle.click();
    else if (key === "d")
      coordsToggle.click();
    else if (key === "l")
      updateGeoLocation();
    else if (key === "n")
      navionicsToggle.click();
    else if (key === "v")
      vfdensityToggle.click();
    else {
      needRedraw = true;
      if (key === "r") {
        position.x = Math.round(position.x);
        position.y = Math.round(position.y);
      } else if (key === "u") {
        position.x = lon2x(position.user.longitude);
        position.y = lat2y(position.user.latitude);
      } else if (key === "ArrowLeft")
        position.x--;
      else if (key === "ArrowRight")
        position.x++;
      else if (key === "ArrowUp")
        position.y--;
      else if (key === "ArrowDown")
        position.y++;
      else if (key === "PageDown")
        zoomIn();
      else if (key === "PageUp")
        zoomOut();
      else {
        needRedraw = false;
        console.log("noop", { key, type });
        return;
      }
    }
  } else if (event instanceof MouseEvent) {
    const { clientX, clientY } = event;
    position.x = Math.round(position.x * tileSize + (mouse.x - clientX)) / tileSize;
    position.y = Math.round(position.y * tileSize + (mouse.y - clientY)) / tileSize;
    needRedraw = true;
  }
  position.y = Math.max(0, Math.min(position.y, position.tiles));
  if (needRedraw)
    redraw(type);
};

// src/client/events/onmouse.ts
var onmouse = (event) => {
  console.log(event.type);
  const { clientX, clientY } = event;
  if (mouse.down) {
    if (mouse.x !== clientX || mouse.y !== clientY)
      onchange(event);
  }
  mouse.down = Boolean(event.buttons & 1);
  mouse.x = clientX;
  mouse.y = clientY;
  updateInfoBox();
};

// src/client/index.ts
var {
  container: containerId = ""
} = Object.fromEntries(new URL(import.meta.url).searchParams.entries());
var container = document.getElementById(containerId);
if (container) {
  container.innerHTML = "";
  container.append(mapContainer, overlayContainer, infoBox, menuContainer);
}
var tileSize = 256;
if (container) {
  window.addEventListener("keydown", onchange);
  window.addEventListener("wheel", onchange);
  window.addEventListener("mousemove", onmouse);
  window.addEventListener("resize", onchange);
  redraw("initial");
}
export {
  container,
  tileSize
};
//# sourceMappingURL=client.js.map
