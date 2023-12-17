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
    function error(m3) {
      throw {
        name: "SyntaxError",
        message: m3,
        at,
        text
      };
    }
    function next(c2) {
      if (c2 && c2 !== ch) {
        error("Expected '" + c2 + "' instead of '" + ch + "'");
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
      var i2;
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
              for (i2 = 0; i2 < 4; i2 += 1) {
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
        var k2;
        var v;
        var val = holder[key];
        if (val && typeof val === "object") {
          for (k2 in value) {
            if (Object.prototype.hasOwnProperty.call(val, k2)) {
              v = walk(val, k2);
              if (typeof v === "undefined") {
                delete val[k2];
              } else {
                val[k2] = v;
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
      return escapable.test(string) ? '"' + string.replace(escapable, function(a3) {
        var c2 = meta[a3];
        return typeof c2 === "string" ? c2 : "\\u" + ("0000" + a3.charCodeAt(0).toString(16)).slice(-4);
      }) + '"' : '"' + string + '"';
    }
    function str(key, holder) {
      var i2;
      var k2;
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
            for (i2 = 0; i2 < length; i2 += 1) {
              partial[i2] = str(i2, value) || "null";
            }
            v = partial.length === 0 ? "[]" : gap ? "[\n" + gap + partial.join(",\n" + gap) + "\n" + mind + "]" : "[" + partial.join(",") + "]";
            gap = mind;
            return v;
          }
          if (rep && typeof rep === "object") {
            length = rep.length;
            for (i2 = 0; i2 < length; i2 += 1) {
              k2 = rep[i2];
              if (typeof k2 === "string") {
                v = str(k2, value);
                if (v) {
                  partial.push(quote(k2) + (gap ? ": " : ":") + v);
                }
              }
            }
          } else {
            for (k2 in value) {
              if (Object.prototype.hasOwnProperty.call(value, k2)) {
                v = str(k2, value);
                if (v) {
                  partial.push(quote(k2) + (gap ? ": " : ":") + v);
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
      var i2;
      gap = "";
      indent = "";
      if (typeof space === "number") {
        for (i2 = 0; i2 < space; i2 += 1) {
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
        for (var k2 in window) {
          try {
            if (!excludedKeys["$" + k2] && has.call(window, k2) && window[k2] !== null && typeof window[k2] === "object") {
              try {
                equalsConstructorPrototype(window[k2]);
              } catch (e2) {
                return true;
              }
            }
          } catch (e2) {
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
        } catch (e2) {
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
          for (var i2 = 0; i2 < object.length; ++i2) {
            theKeys.push(String(i2));
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
          for (var k2 = 0; k2 < dontEnums.length; ++k2) {
            if (!(skipConstructor && dontEnums[k2] === "constructor") && has.call(object, dontEnums[k2])) {
              theKeys.push(dontEnums[k2]);
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
    var concatty = function concatty2(a3, b2) {
      var arr = [];
      for (var i2 = 0; i2 < a3.length; i2 += 1) {
        arr[i2] = a3[i2];
      }
      for (var j = 0; j < b2.length; j += 1) {
        arr[j + a3.length] = b2[j];
      }
      return arr;
    };
    var slicy = function slicy2(arrLike, offset) {
      var arr = [];
      for (var i2 = offset || 0, j = 0; i2 < arrLike.length; i2 += 1, j += 1) {
        arr[j] = arrLike[i2];
      }
      return arr;
    };
    var joiny = function(arr, joiner) {
      var str = "";
      for (var i2 = 0; i2 < arr.length; i2 += 1) {
        str += arr[i2];
        if (i2 + 1 < arr.length) {
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
      for (var i2 = 0; i2 < boundLength; i2++) {
        boundArgs[i2] = "$" + i2;
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
      } catch (e2) {
      }
    };
    var $gOPD = Object.getOwnPropertyDescriptor;
    if ($gOPD) {
      try {
        $gOPD({}, "");
      } catch (e2) {
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
      } catch (e2) {
        errorProto = getProto(getProto(e2));
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
      for (var i2 = 1, isOwn = true; i2 < parts.length; i2 += 1) {
        var part = parts[i2];
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
          if ($gOPD && i2 + 1 >= parts.length) {
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
        } catch (e2) {
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
      } catch (e2) {
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
      } catch (e2) {
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
      } catch (e2) {
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
      } catch (e2) {
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
      for (var i2 = 0; i2 < n; i2 += 1) {
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
        var get = cmpOpt.length > 2 && function get2(k2) {
          return node[k2];
        };
        return function(a3, b2) {
          return cmpOpt(
            { key: a3, value: node[a3] },
            { key: b2, value: node[b2] },
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
          for (var i2 = 0; i2 < node.length; i2++) {
            var item = stringify3(node, i2, node[i2], level + 1) || jsonStringify(null);
            out += indent + space + item;
            if (i2 + 1 < node.length) {
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
        for (var i2 = 0; i2 < keys.length; i2++) {
          var key = keys[i2];
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
      var e2 = rad * 23.4397;
      function rightAscension(l, b2) {
        return atan(sin(l) * cos(e2) - tan(b2) * sin(e2), cos(l));
      }
      function declination(l, b2) {
        return asin(sin(b2) * cos(e2) + cos(b2) * sin(e2) * sin(l));
      }
      function azimuth(H3, phi, dec) {
        return atan(sin(H3), cos(H3) * sin(phi) - tan(dec) * cos(phi));
      }
      function altitude(H3, phi, dec) {
        return asin(sin(phi) * sin(dec) + cos(phi) * cos(dec) * cos(H3));
      }
      function siderealTime(d3, lw) {
        return rad * (280.16 + 360.9856235 * d3) - lw;
      }
      function astroRefraction(h3) {
        if (h3 < 0)
          h3 = 0;
        return 2967e-7 / Math.tan(h3 + 312536e-8 / (h3 + 0.08901179));
      }
      function solarMeanAnomaly(d3) {
        return rad * (357.5291 + 0.98560028 * d3);
      }
      function eclipticLongitude(M3) {
        var C = rad * (1.9148 * sin(M3) + 0.02 * sin(2 * M3) + 3e-4 * sin(3 * M3)), P = rad * 102.9372;
        return M3 + C + P + PI;
      }
      function sunCoords(d3) {
        var M3 = solarMeanAnomaly(d3), L2 = eclipticLongitude(M3);
        return {
          dec: declination(L2, 0),
          ra: rightAscension(L2, 0)
        };
      }
      var SunCalc = {};
      SunCalc.getPosition = function(date, lat, lng) {
        var lw = rad * -lng, phi = rad * lat, d3 = toDays(date), c2 = sunCoords(d3), H3 = siderealTime(d3, lw) - c2.ra;
        return {
          azimuth: azimuth(H3, phi, c2.dec),
          altitude: altitude(H3, phi, c2.dec)
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
      function julianCycle(d3, lw) {
        return Math.round(d3 - J0 - lw / (2 * PI));
      }
      function approxTransit(Ht, lw, n) {
        return J0 + (Ht + lw) / (2 * PI) + n;
      }
      function solarTransitJ(ds, M3, L2) {
        return J2000 + ds + 53e-4 * sin(M3) - 69e-4 * sin(2 * L2);
      }
      function hourAngle(h3, phi, d3) {
        return acos((sin(h3) - sin(phi) * sin(d3)) / (cos(phi) * cos(d3)));
      }
      function observerAngle(height) {
        return -2.076 * Math.sqrt(height) / 60;
      }
      function getSetJ(h3, lw, phi, dec, n, M3, L2) {
        var w2 = hourAngle(h3, phi, dec), a3 = approxTransit(w2, lw, n);
        return solarTransitJ(a3, M3, L2);
      }
      SunCalc.getTimes = function(date, lat, lng, height) {
        height = height || 0;
        var lw = rad * -lng, phi = rad * lat, dh = observerAngle(height), d3 = toDays(date), n = julianCycle(d3, lw), ds = approxTransit(0, lw, n), M3 = solarMeanAnomaly(ds), L2 = eclipticLongitude(M3), dec = declination(L2, 0), Jnoon = solarTransitJ(ds, M3, L2), i2, len, time, h0, Jset, Jrise;
        var result = {
          solarNoon: fromJulian(Jnoon),
          nadir: fromJulian(Jnoon - 0.5)
        };
        for (i2 = 0, len = times.length; i2 < len; i2 += 1) {
          time = times[i2];
          h0 = (time[0] + dh) * rad;
          Jset = getSetJ(h0, lw, phi, dec, n, M3, L2);
          Jrise = Jnoon - (Jset - Jnoon);
          result[time[1]] = fromJulian(Jrise);
          result[time[2]] = fromJulian(Jset);
        }
        return result;
      };
      function moonCoords(d3) {
        var L2 = rad * (218.316 + 13.176396 * d3), M3 = rad * (134.963 + 13.064993 * d3), F = rad * (93.272 + 13.22935 * d3), l = L2 + rad * 6.289 * sin(M3), b2 = rad * 5.128 * sin(F), dt = 385001 - 20905 * cos(M3);
        return {
          ra: rightAscension(l, b2),
          dec: declination(l, b2),
          dist: dt
        };
      }
      SunCalc.getMoonPosition = function(date, lat, lng) {
        var lw = rad * -lng, phi = rad * lat, d3 = toDays(date), c2 = moonCoords(d3), H3 = siderealTime(d3, lw) - c2.ra, h3 = altitude(H3, phi, c2.dec), pa = atan(sin(H3), tan(phi) * cos(c2.dec) - sin(c2.dec) * cos(H3));
        h3 = h3 + astroRefraction(h3);
        return {
          azimuth: azimuth(H3, phi, c2.dec),
          altitude: h3,
          distance: c2.dist,
          parallacticAngle: pa
        };
      };
      SunCalc.getMoonIllumination = function(date) {
        var d3 = toDays(date || /* @__PURE__ */ new Date()), s3 = sunCoords(d3), m3 = moonCoords(d3), sdist = 149598e3, phi = acos(sin(s3.dec) * sin(m3.dec) + cos(s3.dec) * cos(m3.dec) * cos(s3.ra - m3.ra)), inc = atan(sdist * sin(phi), m3.dist - sdist * cos(phi)), angle = atan(cos(s3.dec) * sin(s3.ra - m3.ra), sin(s3.dec) * cos(m3.dec) - cos(s3.dec) * sin(m3.dec) * cos(s3.ra - m3.ra));
        return {
          fraction: (1 + cos(inc)) / 2,
          phase: 0.5 + 0.5 * inc * (angle < 0 ? -1 : 1) / Math.PI,
          angle
        };
      };
      function hoursLater(date, h3) {
        return new Date(date.valueOf() + h3 * dayMs / 24);
      }
      SunCalc.getMoonTimes = function(date, lat, lng, inUTC) {
        var t2 = new Date(date);
        if (inUTC)
          t2.setUTCHours(0, 0, 0, 0);
        else
          t2.setHours(0, 0, 0, 0);
        var hc = 0.133 * rad, h0 = SunCalc.getMoonPosition(t2, lat, lng).altitude - hc, h1, h22, rise, set, a3, b2, xe, ye, d3, roots, x1, x2, dx;
        for (var i2 = 1; i2 <= 24; i2 += 2) {
          h1 = SunCalc.getMoonPosition(hoursLater(t2, i2), lat, lng).altitude - hc;
          h22 = SunCalc.getMoonPosition(hoursLater(t2, i2 + 1), lat, lng).altitude - hc;
          a3 = (h0 + h22) / 2 - h1;
          b2 = (h22 - h0) / 2;
          xe = -b2 / (2 * a3);
          ye = (a3 * xe + b2) * xe + h1;
          d3 = b2 * b2 - 4 * a3 * h1;
          roots = 0;
          if (d3 >= 0) {
            dx = Math.sqrt(d3) / (Math.abs(a3) * 2);
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
              rise = i2 + x1;
            else
              set = i2 + x1;
          } else if (roots === 2) {
            rise = i2 + (ye < 0 ? x2 : x1);
            set = i2 + (ye < 0 ? x1 : x2);
          }
          if (rise && set)
            break;
          h0 = h22;
        }
        var result = {};
        if (rise)
          result.rise = hoursLater(t2, rise);
        if (set)
          result.set = hoursLater(t2, set);
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
      var m1, m22, decDeg1, decDeg2, dmsString2;
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
      m22 = dmsString2.match(dmsRe);
      decDeg2 = m22 ? decDegFromMatch(m22) : {};
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
    function decDegFromMatch(m3) {
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
      sign = signIndex[m3[2]] || signIndex[m3[1]] || signIndex[m3[6]] || 1;
      degrees = Number(m3[3]);
      minutes = m3[4] ? Number(m3[4]) : 0;
      seconds = m3[5] ? Number(m3[5]) : 0;
      latLon = latLonIndex[m3[1]] || latLonIndex[m3[6]];
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
    function inRange(value, a3, b2) {
      return value >= a3 && value <= b2;
    }
  }
});

// src/client/boundingRect.ts
var Size = class {
  constructor(container2) {
    this._container = container2;
    this.refresh();
  }
  refresh = () => {
    const { height, width } = this._container.getBoundingClientRect();
    console.log("new bounding rect", { height, width });
    this._height = height;
    this._width = width;
  };
  _container;
  _height = 0;
  _width = 0;
  get height() {
    return this._height;
  }
  get width() {
    return this._width;
  }
};

// src/client/utils/createHTMLElement.ts
function createHTMLElement(params) {
  const { classes, dataset, style, tag, zhilds, ...data } = params;
  const element = document.createElement(tag);
  Object.entries(data).forEach(([k2, v]) => element[k2] = v);
  if (classes)
    classes.filter(Boolean).forEach((c2) => element.classList.add(c2 ?? ""));
  if (dataset)
    Object.entries(dataset).forEach(([k2, v]) => element.dataset[k2] = v);
  if (style)
    Object.entries(style).forEach(([k2, v]) => element.style[k2] = v);
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
var createBr = () => createHTMLElement({ tag: "br" });

// src/client/containers/infoBox.ts
var infoBox = createHTMLElement({
  classes: ["float-end"],
  dataset: {
    // bsTheme: 'dark',
  },
  style: {
    backgroundColor: "#aaaa",
    borderBottomLeftRadius: "0.5em",
    borderTopLeftRadius: "0.5em",
    padding: "0.3em",
    width: "23em"
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
  show: extractProperties(localStorageSettings?.show, {
    crosshair: (val) => Boolean(val ?? true),
    navionicsDetails: Boolean,
    suncalc: Boolean
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
      "opentopomap",
      "worthit"
    ],
    enabled: Object.fromEntries(order.map((e2) => typeof e2 === "string" ? e2 : e2.source).filter((e2) => e2 !== "openseamap").map((e2) => [e2, Boolean(localStorageSettings?.tiles?.enabled?.[e2] ?? true)])),
    order
  },
  units: extractProperties(localStorageSettings?.units, {
    coords: (val) => ["d", "dm", "dms"].includes(val) ? val : "dm"
  })
};
var baselayer = localStorageSettings?.tiles?.order?.[0];
settings.tiles.order[0] = settings.tiles.baselayers.includes(baselayer) ? baselayer : "osm";
settings.tiles.enabled[settings.tiles.order[0]] = true;

// src/client/redraw.ts
var import_json_stable_stringify = __toESM(require_json_stable_stringify(), 1);

// src/common/modulo.ts
var modulo = (val, mod) => {
  const ret = val % mod;
  return ret < 0 ? ret + mod : ret;
};

// src/client/globals/tileSize.ts
var tileSize = 256;

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

// src/client/utils/px2nm.ts
var px2nm = (lat) => {
  const stretch = 1 / Math.cos(lat);
  return 360 * 60 / position.tiles / tileSize / stretch;
};

// src/client/utils/rad2string.ts
var rad2ModuloDeg = (phi) => modulo(phi * 180 / Math.PI + 180, 360) - 180;
var rad2stringFuncs = {
  d: ({ axis = " -", pad = 0, phi }) => {
    const deg = Math.round(rad2ModuloDeg(phi) * 1e5) / 1e5;
    return `${axis[deg < 0 ? 1 : 0] ?? ""}${(deg < 0 ? -deg : deg).toFixed(5).padStart(pad + 6, "0")}\xB0`;
  },
  dm: ({ axis = " -", pad = 0, phi }) => {
    const deg = Math.round(rad2ModuloDeg(phi) * 6e4) / 6e4;
    const degrees = deg | 0;
    const minutes = (Math.abs(deg) - Math.abs(degrees)) * 60;
    return `${axis[deg < 0 ? 1 : 0] ?? ""}${(deg < 0 ? -degrees : degrees).toFixed(0).padStart(pad, "0")}\xB0${minutes.toFixed(3).padStart(6, "0")}'`;
  },
  dms: ({ axis = " -", pad = 0, phi }) => {
    const deg = Math.round(rad2ModuloDeg(phi) * 36e4) / 36e4;
    const degrees = deg | 0;
    const min = Math.round((Math.abs(deg) - Math.abs(degrees)) * 36e4) / 6e3;
    const minutes = min | 0;
    const seconds = (min - minutes) * 60;
    return `${axis[deg < 0 ? 1 : 0] ?? ""}${(deg < 0 ? -degrees : degrees).toFixed(0).padStart(pad, "0")}\xB0${minutes.toFixed(0).padStart(2, "0")}'${seconds.toFixed(2).padStart(5, "0")}"`;
  }
};
var rad2string = ({ axis = " -", pad = 0, phi }) => rad2stringFuncs[settings.units.coords]({ axis, pad, phi });

// src/common/x2lon.ts
var x2lonCommon = (x2, tiles) => (x2 / tiles - 0.5) * Math.PI * 2;

// src/client/utils/x2lon.ts
var x2lon = (x2, tiles = position.tiles) => x2lonCommon(x2, tiles);

// src/common/y2lat.ts
var y2latCommon = (y3, tiles) => Math.asin(Math.tanh((0.5 - y3 / tiles) * 2 * Math.PI));

// src/client/utils/y2lat.ts
var y2lat = (y3, tiles = position.tiles) => y2latCommon(y3, tiles);

// src/client/containers/infoBox/imagesToFetch.ts
var ImagesToFetch = class {
  constructor() {
  }
  xyz2string = ({ x: x2, y: y3, z: z2 }) => `${z2.toString(16)}_${x2.toString(16)}_${y3.toString(16)}`;
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
    if (this.getSet(source).size === 0) {
      delete this.data[source];
      delete this.total[source];
    }
    updateInfoBox();
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

// src/client/utils/halfDay.ts
var halfDay = 12 * 3600 * 1e3;

// src/client/utils/rad2deg.ts
var rad2deg = (val) => Number(val) * 180 / Math.PI;

// node_modules/@babel/runtime/helpers/esm/typeof.js
function _typeof(o) {
  "@babel/helpers - typeof";
  return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(o2) {
    return typeof o2;
  } : function(o2) {
    return o2 && "function" == typeof Symbol && o2.constructor === Symbol && o2 !== Symbol.prototype ? "symbol" : typeof o2;
  }, _typeof(o);
}

// node_modules/date-fns/esm/_lib/toInteger/index.js
function toInteger(dirtyNumber) {
  if (dirtyNumber === null || dirtyNumber === true || dirtyNumber === false) {
    return NaN;
  }
  var number = Number(dirtyNumber);
  if (isNaN(number)) {
    return number;
  }
  return number < 0 ? Math.ceil(number) : Math.floor(number);
}

// node_modules/date-fns/esm/_lib/requiredArgs/index.js
function requiredArgs(required, args) {
  if (args.length < required) {
    throw new TypeError(required + " argument" + (required > 1 ? "s" : "") + " required, but only " + args.length + " present");
  }
}

// node_modules/date-fns/esm/toDate/index.js
function toDate(argument) {
  requiredArgs(1, arguments);
  var argStr = Object.prototype.toString.call(argument);
  if (argument instanceof Date || _typeof(argument) === "object" && argStr === "[object Date]") {
    return new Date(argument.getTime());
  } else if (typeof argument === "number" || argStr === "[object Number]") {
    return new Date(argument);
  } else {
    if ((typeof argument === "string" || argStr === "[object String]") && typeof console !== "undefined") {
      console.warn("Starting with v2.0.0-beta.1 date-fns doesn't accept strings as date arguments. Please use `parseISO` to parse strings. See: https://github.com/date-fns/date-fns/blob/master/docs/upgradeGuide.md#string-arguments");
      console.warn(new Error().stack);
    }
    return /* @__PURE__ */ new Date(NaN);
  }
}

// node_modules/date-fns/esm/addDays/index.js
function addDays(dirtyDate, dirtyAmount) {
  requiredArgs(2, arguments);
  var date = toDate(dirtyDate);
  var amount = toInteger(dirtyAmount);
  if (isNaN(amount)) {
    return /* @__PURE__ */ new Date(NaN);
  }
  if (!amount) {
    return date;
  }
  date.setDate(date.getDate() + amount);
  return date;
}

// node_modules/date-fns/esm/addMonths/index.js
function addMonths(dirtyDate, dirtyAmount) {
  requiredArgs(2, arguments);
  var date = toDate(dirtyDate);
  var amount = toInteger(dirtyAmount);
  if (isNaN(amount)) {
    return /* @__PURE__ */ new Date(NaN);
  }
  if (!amount) {
    return date;
  }
  var dayOfMonth = date.getDate();
  var endOfDesiredMonth = new Date(date.getTime());
  endOfDesiredMonth.setMonth(date.getMonth() + amount + 1, 0);
  var daysInMonth = endOfDesiredMonth.getDate();
  if (dayOfMonth >= daysInMonth) {
    return endOfDesiredMonth;
  } else {
    date.setFullYear(endOfDesiredMonth.getFullYear(), endOfDesiredMonth.getMonth(), dayOfMonth);
    return date;
  }
}

// node_modules/date-fns/esm/add/index.js
function add(dirtyDate, duration) {
  requiredArgs(2, arguments);
  if (!duration || _typeof(duration) !== "object")
    return /* @__PURE__ */ new Date(NaN);
  var years = duration.years ? toInteger(duration.years) : 0;
  var months = duration.months ? toInteger(duration.months) : 0;
  var weeks = duration.weeks ? toInteger(duration.weeks) : 0;
  var days = duration.days ? toInteger(duration.days) : 0;
  var hours = duration.hours ? toInteger(duration.hours) : 0;
  var minutes = duration.minutes ? toInteger(duration.minutes) : 0;
  var seconds = duration.seconds ? toInteger(duration.seconds) : 0;
  var date = toDate(dirtyDate);
  var dateWithMonths = months || years ? addMonths(date, months + years * 12) : date;
  var dateWithDays = days || weeks ? addDays(dateWithMonths, days + weeks * 7) : dateWithMonths;
  var minutesToAdd = minutes + hours * 60;
  var secondsToAdd = seconds + minutesToAdd * 60;
  var msToAdd = secondsToAdd * 1e3;
  var finalDate = new Date(dateWithDays.getTime() + msToAdd);
  return finalDate;
}

// node_modules/date-fns/esm/addMilliseconds/index.js
function addMilliseconds(dirtyDate, dirtyAmount) {
  requiredArgs(2, arguments);
  var timestamp = toDate(dirtyDate).getTime();
  var amount = toInteger(dirtyAmount);
  return new Date(timestamp + amount);
}

// node_modules/date-fns/esm/_lib/defaultOptions/index.js
var defaultOptions = {};
function getDefaultOptions() {
  return defaultOptions;
}

// node_modules/date-fns/esm/_lib/getTimezoneOffsetInMilliseconds/index.js
function getTimezoneOffsetInMilliseconds(date) {
  var utcDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds(), date.getMilliseconds()));
  utcDate.setUTCFullYear(date.getFullYear());
  return date.getTime() - utcDate.getTime();
}

// node_modules/date-fns/esm/isDate/index.js
function isDate(value) {
  requiredArgs(1, arguments);
  return value instanceof Date || _typeof(value) === "object" && Object.prototype.toString.call(value) === "[object Date]";
}

// node_modules/date-fns/esm/isValid/index.js
function isValid(dirtyDate) {
  requiredArgs(1, arguments);
  if (!isDate(dirtyDate) && typeof dirtyDate !== "number") {
    return false;
  }
  var date = toDate(dirtyDate);
  return !isNaN(Number(date));
}

// node_modules/date-fns/esm/subMilliseconds/index.js
function subMilliseconds(dirtyDate, dirtyAmount) {
  requiredArgs(2, arguments);
  var amount = toInteger(dirtyAmount);
  return addMilliseconds(dirtyDate, -amount);
}

// node_modules/date-fns/esm/_lib/getUTCDayOfYear/index.js
var MILLISECONDS_IN_DAY = 864e5;
function getUTCDayOfYear(dirtyDate) {
  requiredArgs(1, arguments);
  var date = toDate(dirtyDate);
  var timestamp = date.getTime();
  date.setUTCMonth(0, 1);
  date.setUTCHours(0, 0, 0, 0);
  var startOfYearTimestamp = date.getTime();
  var difference = timestamp - startOfYearTimestamp;
  return Math.floor(difference / MILLISECONDS_IN_DAY) + 1;
}

// node_modules/date-fns/esm/_lib/startOfUTCISOWeek/index.js
function startOfUTCISOWeek(dirtyDate) {
  requiredArgs(1, arguments);
  var weekStartsOn = 1;
  var date = toDate(dirtyDate);
  var day = date.getUTCDay();
  var diff = (day < weekStartsOn ? 7 : 0) + day - weekStartsOn;
  date.setUTCDate(date.getUTCDate() - diff);
  date.setUTCHours(0, 0, 0, 0);
  return date;
}

// node_modules/date-fns/esm/_lib/getUTCISOWeekYear/index.js
function getUTCISOWeekYear(dirtyDate) {
  requiredArgs(1, arguments);
  var date = toDate(dirtyDate);
  var year = date.getUTCFullYear();
  var fourthOfJanuaryOfNextYear = /* @__PURE__ */ new Date(0);
  fourthOfJanuaryOfNextYear.setUTCFullYear(year + 1, 0, 4);
  fourthOfJanuaryOfNextYear.setUTCHours(0, 0, 0, 0);
  var startOfNextYear = startOfUTCISOWeek(fourthOfJanuaryOfNextYear);
  var fourthOfJanuaryOfThisYear = /* @__PURE__ */ new Date(0);
  fourthOfJanuaryOfThisYear.setUTCFullYear(year, 0, 4);
  fourthOfJanuaryOfThisYear.setUTCHours(0, 0, 0, 0);
  var startOfThisYear = startOfUTCISOWeek(fourthOfJanuaryOfThisYear);
  if (date.getTime() >= startOfNextYear.getTime()) {
    return year + 1;
  } else if (date.getTime() >= startOfThisYear.getTime()) {
    return year;
  } else {
    return year - 1;
  }
}

// node_modules/date-fns/esm/_lib/startOfUTCISOWeekYear/index.js
function startOfUTCISOWeekYear(dirtyDate) {
  requiredArgs(1, arguments);
  var year = getUTCISOWeekYear(dirtyDate);
  var fourthOfJanuary = /* @__PURE__ */ new Date(0);
  fourthOfJanuary.setUTCFullYear(year, 0, 4);
  fourthOfJanuary.setUTCHours(0, 0, 0, 0);
  var date = startOfUTCISOWeek(fourthOfJanuary);
  return date;
}

// node_modules/date-fns/esm/_lib/getUTCISOWeek/index.js
var MILLISECONDS_IN_WEEK = 6048e5;
function getUTCISOWeek(dirtyDate) {
  requiredArgs(1, arguments);
  var date = toDate(dirtyDate);
  var diff = startOfUTCISOWeek(date).getTime() - startOfUTCISOWeekYear(date).getTime();
  return Math.round(diff / MILLISECONDS_IN_WEEK) + 1;
}

// node_modules/date-fns/esm/_lib/startOfUTCWeek/index.js
function startOfUTCWeek(dirtyDate, options) {
  var _ref, _ref2, _ref3, _options$weekStartsOn, _options$locale, _options$locale$optio, _defaultOptions$local, _defaultOptions$local2;
  requiredArgs(1, arguments);
  var defaultOptions2 = getDefaultOptions();
  var weekStartsOn = toInteger((_ref = (_ref2 = (_ref3 = (_options$weekStartsOn = options === null || options === void 0 ? void 0 : options.weekStartsOn) !== null && _options$weekStartsOn !== void 0 ? _options$weekStartsOn : options === null || options === void 0 ? void 0 : (_options$locale = options.locale) === null || _options$locale === void 0 ? void 0 : (_options$locale$optio = _options$locale.options) === null || _options$locale$optio === void 0 ? void 0 : _options$locale$optio.weekStartsOn) !== null && _ref3 !== void 0 ? _ref3 : defaultOptions2.weekStartsOn) !== null && _ref2 !== void 0 ? _ref2 : (_defaultOptions$local = defaultOptions2.locale) === null || _defaultOptions$local === void 0 ? void 0 : (_defaultOptions$local2 = _defaultOptions$local.options) === null || _defaultOptions$local2 === void 0 ? void 0 : _defaultOptions$local2.weekStartsOn) !== null && _ref !== void 0 ? _ref : 0);
  if (!(weekStartsOn >= 0 && weekStartsOn <= 6)) {
    throw new RangeError("weekStartsOn must be between 0 and 6 inclusively");
  }
  var date = toDate(dirtyDate);
  var day = date.getUTCDay();
  var diff = (day < weekStartsOn ? 7 : 0) + day - weekStartsOn;
  date.setUTCDate(date.getUTCDate() - diff);
  date.setUTCHours(0, 0, 0, 0);
  return date;
}

// node_modules/date-fns/esm/_lib/getUTCWeekYear/index.js
function getUTCWeekYear(dirtyDate, options) {
  var _ref, _ref2, _ref3, _options$firstWeekCon, _options$locale, _options$locale$optio, _defaultOptions$local, _defaultOptions$local2;
  requiredArgs(1, arguments);
  var date = toDate(dirtyDate);
  var year = date.getUTCFullYear();
  var defaultOptions2 = getDefaultOptions();
  var firstWeekContainsDate = toInteger((_ref = (_ref2 = (_ref3 = (_options$firstWeekCon = options === null || options === void 0 ? void 0 : options.firstWeekContainsDate) !== null && _options$firstWeekCon !== void 0 ? _options$firstWeekCon : options === null || options === void 0 ? void 0 : (_options$locale = options.locale) === null || _options$locale === void 0 ? void 0 : (_options$locale$optio = _options$locale.options) === null || _options$locale$optio === void 0 ? void 0 : _options$locale$optio.firstWeekContainsDate) !== null && _ref3 !== void 0 ? _ref3 : defaultOptions2.firstWeekContainsDate) !== null && _ref2 !== void 0 ? _ref2 : (_defaultOptions$local = defaultOptions2.locale) === null || _defaultOptions$local === void 0 ? void 0 : (_defaultOptions$local2 = _defaultOptions$local.options) === null || _defaultOptions$local2 === void 0 ? void 0 : _defaultOptions$local2.firstWeekContainsDate) !== null && _ref !== void 0 ? _ref : 1);
  if (!(firstWeekContainsDate >= 1 && firstWeekContainsDate <= 7)) {
    throw new RangeError("firstWeekContainsDate must be between 1 and 7 inclusively");
  }
  var firstWeekOfNextYear = /* @__PURE__ */ new Date(0);
  firstWeekOfNextYear.setUTCFullYear(year + 1, 0, firstWeekContainsDate);
  firstWeekOfNextYear.setUTCHours(0, 0, 0, 0);
  var startOfNextYear = startOfUTCWeek(firstWeekOfNextYear, options);
  var firstWeekOfThisYear = /* @__PURE__ */ new Date(0);
  firstWeekOfThisYear.setUTCFullYear(year, 0, firstWeekContainsDate);
  firstWeekOfThisYear.setUTCHours(0, 0, 0, 0);
  var startOfThisYear = startOfUTCWeek(firstWeekOfThisYear, options);
  if (date.getTime() >= startOfNextYear.getTime()) {
    return year + 1;
  } else if (date.getTime() >= startOfThisYear.getTime()) {
    return year;
  } else {
    return year - 1;
  }
}

// node_modules/date-fns/esm/_lib/startOfUTCWeekYear/index.js
function startOfUTCWeekYear(dirtyDate, options) {
  var _ref, _ref2, _ref3, _options$firstWeekCon, _options$locale, _options$locale$optio, _defaultOptions$local, _defaultOptions$local2;
  requiredArgs(1, arguments);
  var defaultOptions2 = getDefaultOptions();
  var firstWeekContainsDate = toInteger((_ref = (_ref2 = (_ref3 = (_options$firstWeekCon = options === null || options === void 0 ? void 0 : options.firstWeekContainsDate) !== null && _options$firstWeekCon !== void 0 ? _options$firstWeekCon : options === null || options === void 0 ? void 0 : (_options$locale = options.locale) === null || _options$locale === void 0 ? void 0 : (_options$locale$optio = _options$locale.options) === null || _options$locale$optio === void 0 ? void 0 : _options$locale$optio.firstWeekContainsDate) !== null && _ref3 !== void 0 ? _ref3 : defaultOptions2.firstWeekContainsDate) !== null && _ref2 !== void 0 ? _ref2 : (_defaultOptions$local = defaultOptions2.locale) === null || _defaultOptions$local === void 0 ? void 0 : (_defaultOptions$local2 = _defaultOptions$local.options) === null || _defaultOptions$local2 === void 0 ? void 0 : _defaultOptions$local2.firstWeekContainsDate) !== null && _ref !== void 0 ? _ref : 1);
  var year = getUTCWeekYear(dirtyDate, options);
  var firstWeek = /* @__PURE__ */ new Date(0);
  firstWeek.setUTCFullYear(year, 0, firstWeekContainsDate);
  firstWeek.setUTCHours(0, 0, 0, 0);
  var date = startOfUTCWeek(firstWeek, options);
  return date;
}

// node_modules/date-fns/esm/_lib/getUTCWeek/index.js
var MILLISECONDS_IN_WEEK2 = 6048e5;
function getUTCWeek(dirtyDate, options) {
  requiredArgs(1, arguments);
  var date = toDate(dirtyDate);
  var diff = startOfUTCWeek(date, options).getTime() - startOfUTCWeekYear(date, options).getTime();
  return Math.round(diff / MILLISECONDS_IN_WEEK2) + 1;
}

// node_modules/date-fns/esm/_lib/addLeadingZeros/index.js
function addLeadingZeros(number, targetLength) {
  var sign = number < 0 ? "-" : "";
  var output = Math.abs(number).toString();
  while (output.length < targetLength) {
    output = "0" + output;
  }
  return sign + output;
}

// node_modules/date-fns/esm/_lib/format/lightFormatters/index.js
var formatters = {
  // Year
  y: function y(date, token) {
    var signedYear = date.getUTCFullYear();
    var year = signedYear > 0 ? signedYear : 1 - signedYear;
    return addLeadingZeros(token === "yy" ? year % 100 : year, token.length);
  },
  // Month
  M: function M(date, token) {
    var month = date.getUTCMonth();
    return token === "M" ? String(month + 1) : addLeadingZeros(month + 1, 2);
  },
  // Day of the month
  d: function d(date, token) {
    return addLeadingZeros(date.getUTCDate(), token.length);
  },
  // AM or PM
  a: function a(date, token) {
    var dayPeriodEnumValue = date.getUTCHours() / 12 >= 1 ? "pm" : "am";
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
  h: function h(date, token) {
    return addLeadingZeros(date.getUTCHours() % 12 || 12, token.length);
  },
  // Hour [0-23]
  H: function H(date, token) {
    return addLeadingZeros(date.getUTCHours(), token.length);
  },
  // Minute
  m: function m(date, token) {
    return addLeadingZeros(date.getUTCMinutes(), token.length);
  },
  // Second
  s: function s(date, token) {
    return addLeadingZeros(date.getUTCSeconds(), token.length);
  },
  // Fraction of second
  S: function S(date, token) {
    var numberOfDigits = token.length;
    var milliseconds = date.getUTCMilliseconds();
    var fractionalSeconds = Math.floor(milliseconds * Math.pow(10, numberOfDigits - 3));
    return addLeadingZeros(fractionalSeconds, token.length);
  }
};
var lightFormatters_default = formatters;

// node_modules/date-fns/esm/_lib/format/formatters/index.js
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
var formatters2 = {
  // Era
  G: function G(date, token, localize2) {
    var era = date.getUTCFullYear() > 0 ? 1 : 0;
    switch (token) {
      case "G":
      case "GG":
      case "GGG":
        return localize2.era(era, {
          width: "abbreviated"
        });
      case "GGGGG":
        return localize2.era(era, {
          width: "narrow"
        });
      case "GGGG":
      default:
        return localize2.era(era, {
          width: "wide"
        });
    }
  },
  // Year
  y: function y2(date, token, localize2) {
    if (token === "yo") {
      var signedYear = date.getUTCFullYear();
      var year = signedYear > 0 ? signedYear : 1 - signedYear;
      return localize2.ordinalNumber(year, {
        unit: "year"
      });
    }
    return lightFormatters_default.y(date, token);
  },
  // Local week-numbering year
  Y: function Y(date, token, localize2, options) {
    var signedWeekYear = getUTCWeekYear(date, options);
    var weekYear = signedWeekYear > 0 ? signedWeekYear : 1 - signedWeekYear;
    if (token === "YY") {
      var twoDigitYear = weekYear % 100;
      return addLeadingZeros(twoDigitYear, 2);
    }
    if (token === "Yo") {
      return localize2.ordinalNumber(weekYear, {
        unit: "year"
      });
    }
    return addLeadingZeros(weekYear, token.length);
  },
  // ISO week-numbering year
  R: function R(date, token) {
    var isoWeekYear = getUTCISOWeekYear(date);
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
  u: function u(date, token) {
    var year = date.getUTCFullYear();
    return addLeadingZeros(year, token.length);
  },
  // Quarter
  Q: function Q(date, token, localize2) {
    var quarter = Math.ceil((date.getUTCMonth() + 1) / 3);
    switch (token) {
      case "Q":
        return String(quarter);
      case "QQ":
        return addLeadingZeros(quarter, 2);
      case "Qo":
        return localize2.ordinalNumber(quarter, {
          unit: "quarter"
        });
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
  q: function q(date, token, localize2) {
    var quarter = Math.ceil((date.getUTCMonth() + 1) / 3);
    switch (token) {
      case "q":
        return String(quarter);
      case "qq":
        return addLeadingZeros(quarter, 2);
      case "qo":
        return localize2.ordinalNumber(quarter, {
          unit: "quarter"
        });
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
  M: function M2(date, token, localize2) {
    var month = date.getUTCMonth();
    switch (token) {
      case "M":
      case "MM":
        return lightFormatters_default.M(date, token);
      case "Mo":
        return localize2.ordinalNumber(month + 1, {
          unit: "month"
        });
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
        return localize2.month(month, {
          width: "wide",
          context: "formatting"
        });
    }
  },
  // Stand-alone month
  L: function L(date, token, localize2) {
    var month = date.getUTCMonth();
    switch (token) {
      case "L":
        return String(month + 1);
      case "LL":
        return addLeadingZeros(month + 1, 2);
      case "Lo":
        return localize2.ordinalNumber(month + 1, {
          unit: "month"
        });
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
        return localize2.month(month, {
          width: "wide",
          context: "standalone"
        });
    }
  },
  // Local week of year
  w: function w(date, token, localize2, options) {
    var week = getUTCWeek(date, options);
    if (token === "wo") {
      return localize2.ordinalNumber(week, {
        unit: "week"
      });
    }
    return addLeadingZeros(week, token.length);
  },
  // ISO week of year
  I: function I(date, token, localize2) {
    var isoWeek = getUTCISOWeek(date);
    if (token === "Io") {
      return localize2.ordinalNumber(isoWeek, {
        unit: "week"
      });
    }
    return addLeadingZeros(isoWeek, token.length);
  },
  // Day of the month
  d: function d2(date, token, localize2) {
    if (token === "do") {
      return localize2.ordinalNumber(date.getUTCDate(), {
        unit: "date"
      });
    }
    return lightFormatters_default.d(date, token);
  },
  // Day of year
  D: function D(date, token, localize2) {
    var dayOfYear = getUTCDayOfYear(date);
    if (token === "Do") {
      return localize2.ordinalNumber(dayOfYear, {
        unit: "dayOfYear"
      });
    }
    return addLeadingZeros(dayOfYear, token.length);
  },
  // Day of week
  E: function E(date, token, localize2) {
    var dayOfWeek = date.getUTCDay();
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
  e: function e(date, token, localize2, options) {
    var dayOfWeek = date.getUTCDay();
    var localDayOfWeek = (dayOfWeek - options.weekStartsOn + 8) % 7 || 7;
    switch (token) {
      case "e":
        return String(localDayOfWeek);
      case "ee":
        return addLeadingZeros(localDayOfWeek, 2);
      case "eo":
        return localize2.ordinalNumber(localDayOfWeek, {
          unit: "day"
        });
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
  c: function c(date, token, localize2, options) {
    var dayOfWeek = date.getUTCDay();
    var localDayOfWeek = (dayOfWeek - options.weekStartsOn + 8) % 7 || 7;
    switch (token) {
      case "c":
        return String(localDayOfWeek);
      case "cc":
        return addLeadingZeros(localDayOfWeek, token.length);
      case "co":
        return localize2.ordinalNumber(localDayOfWeek, {
          unit: "day"
        });
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
  i: function i(date, token, localize2) {
    var dayOfWeek = date.getUTCDay();
    var isoDayOfWeek = dayOfWeek === 0 ? 7 : dayOfWeek;
    switch (token) {
      case "i":
        return String(isoDayOfWeek);
      case "ii":
        return addLeadingZeros(isoDayOfWeek, token.length);
      case "io":
        return localize2.ordinalNumber(isoDayOfWeek, {
          unit: "day"
        });
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
  a: function a2(date, token, localize2) {
    var hours = date.getUTCHours();
    var dayPeriodEnumValue = hours / 12 >= 1 ? "pm" : "am";
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
  b: function b(date, token, localize2) {
    var hours = date.getUTCHours();
    var dayPeriodEnumValue;
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
  B: function B(date, token, localize2) {
    var hours = date.getUTCHours();
    var dayPeriodEnumValue;
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
  h: function h2(date, token, localize2) {
    if (token === "ho") {
      var hours = date.getUTCHours() % 12;
      if (hours === 0)
        hours = 12;
      return localize2.ordinalNumber(hours, {
        unit: "hour"
      });
    }
    return lightFormatters_default.h(date, token);
  },
  // Hour [0-23]
  H: function H2(date, token, localize2) {
    if (token === "Ho") {
      return localize2.ordinalNumber(date.getUTCHours(), {
        unit: "hour"
      });
    }
    return lightFormatters_default.H(date, token);
  },
  // Hour [0-11]
  K: function K(date, token, localize2) {
    var hours = date.getUTCHours() % 12;
    if (token === "Ko") {
      return localize2.ordinalNumber(hours, {
        unit: "hour"
      });
    }
    return addLeadingZeros(hours, token.length);
  },
  // Hour [1-24]
  k: function k(date, token, localize2) {
    var hours = date.getUTCHours();
    if (hours === 0)
      hours = 24;
    if (token === "ko") {
      return localize2.ordinalNumber(hours, {
        unit: "hour"
      });
    }
    return addLeadingZeros(hours, token.length);
  },
  // Minute
  m: function m2(date, token, localize2) {
    if (token === "mo") {
      return localize2.ordinalNumber(date.getUTCMinutes(), {
        unit: "minute"
      });
    }
    return lightFormatters_default.m(date, token);
  },
  // Second
  s: function s2(date, token, localize2) {
    if (token === "so") {
      return localize2.ordinalNumber(date.getUTCSeconds(), {
        unit: "second"
      });
    }
    return lightFormatters_default.s(date, token);
  },
  // Fraction of second
  S: function S2(date, token) {
    return lightFormatters_default.S(date, token);
  },
  // Timezone (ISO-8601. If offset is 0, output is always `'Z'`)
  X: function X(date, token, _localize, options) {
    var originalDate = options._originalDate || date;
    var timezoneOffset = originalDate.getTimezoneOffset();
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
  x: function x(date, token, _localize, options) {
    var originalDate = options._originalDate || date;
    var timezoneOffset = originalDate.getTimezoneOffset();
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
  O: function O(date, token, _localize, options) {
    var originalDate = options._originalDate || date;
    var timezoneOffset = originalDate.getTimezoneOffset();
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
  z: function z(date, token, _localize, options) {
    var originalDate = options._originalDate || date;
    var timezoneOffset = originalDate.getTimezoneOffset();
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
  t: function t(date, token, _localize, options) {
    var originalDate = options._originalDate || date;
    var timestamp = Math.floor(originalDate.getTime() / 1e3);
    return addLeadingZeros(timestamp, token.length);
  },
  // Milliseconds timestamp
  T: function T(date, token, _localize, options) {
    var originalDate = options._originalDate || date;
    var timestamp = originalDate.getTime();
    return addLeadingZeros(timestamp, token.length);
  }
};
function formatTimezoneShort(offset, dirtyDelimiter) {
  var sign = offset > 0 ? "-" : "+";
  var absOffset = Math.abs(offset);
  var hours = Math.floor(absOffset / 60);
  var minutes = absOffset % 60;
  if (minutes === 0) {
    return sign + String(hours);
  }
  var delimiter = dirtyDelimiter || "";
  return sign + String(hours) + delimiter + addLeadingZeros(minutes, 2);
}
function formatTimezoneWithOptionalMinutes(offset, dirtyDelimiter) {
  if (offset % 60 === 0) {
    var sign = offset > 0 ? "-" : "+";
    return sign + addLeadingZeros(Math.abs(offset) / 60, 2);
  }
  return formatTimezone(offset, dirtyDelimiter);
}
function formatTimezone(offset, dirtyDelimiter) {
  var delimiter = dirtyDelimiter || "";
  var sign = offset > 0 ? "-" : "+";
  var absOffset = Math.abs(offset);
  var hours = addLeadingZeros(Math.floor(absOffset / 60), 2);
  var minutes = addLeadingZeros(absOffset % 60, 2);
  return sign + hours + delimiter + minutes;
}
var formatters_default = formatters2;

// node_modules/date-fns/esm/_lib/format/longFormatters/index.js
var dateLongFormatter = function dateLongFormatter2(pattern, formatLong2) {
  switch (pattern) {
    case "P":
      return formatLong2.date({
        width: "short"
      });
    case "PP":
      return formatLong2.date({
        width: "medium"
      });
    case "PPP":
      return formatLong2.date({
        width: "long"
      });
    case "PPPP":
    default:
      return formatLong2.date({
        width: "full"
      });
  }
};
var timeLongFormatter = function timeLongFormatter2(pattern, formatLong2) {
  switch (pattern) {
    case "p":
      return formatLong2.time({
        width: "short"
      });
    case "pp":
      return formatLong2.time({
        width: "medium"
      });
    case "ppp":
      return formatLong2.time({
        width: "long"
      });
    case "pppp":
    default:
      return formatLong2.time({
        width: "full"
      });
  }
};
var dateTimeLongFormatter = function dateTimeLongFormatter2(pattern, formatLong2) {
  var matchResult = pattern.match(/(P+)(p+)?/) || [];
  var datePattern = matchResult[1];
  var timePattern = matchResult[2];
  if (!timePattern) {
    return dateLongFormatter(pattern, formatLong2);
  }
  var dateTimeFormat;
  switch (datePattern) {
    case "P":
      dateTimeFormat = formatLong2.dateTime({
        width: "short"
      });
      break;
    case "PP":
      dateTimeFormat = formatLong2.dateTime({
        width: "medium"
      });
      break;
    case "PPP":
      dateTimeFormat = formatLong2.dateTime({
        width: "long"
      });
      break;
    case "PPPP":
    default:
      dateTimeFormat = formatLong2.dateTime({
        width: "full"
      });
      break;
  }
  return dateTimeFormat.replace("{{date}}", dateLongFormatter(datePattern, formatLong2)).replace("{{time}}", timeLongFormatter(timePattern, formatLong2));
};
var longFormatters = {
  p: timeLongFormatter,
  P: dateTimeLongFormatter
};
var longFormatters_default = longFormatters;

// node_modules/date-fns/esm/_lib/protectedTokens/index.js
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
    throw new RangeError("Use `yyyy` instead of `YYYY` (in `".concat(format2, "`) for formatting years to the input `").concat(input, "`; see: https://github.com/date-fns/date-fns/blob/master/docs/unicodeTokens.md"));
  } else if (token === "YY") {
    throw new RangeError("Use `yy` instead of `YY` (in `".concat(format2, "`) for formatting years to the input `").concat(input, "`; see: https://github.com/date-fns/date-fns/blob/master/docs/unicodeTokens.md"));
  } else if (token === "D") {
    throw new RangeError("Use `d` instead of `D` (in `".concat(format2, "`) for formatting days of the month to the input `").concat(input, "`; see: https://github.com/date-fns/date-fns/blob/master/docs/unicodeTokens.md"));
  } else if (token === "DD") {
    throw new RangeError("Use `dd` instead of `DD` (in `".concat(format2, "`) for formatting days of the month to the input `").concat(input, "`; see: https://github.com/date-fns/date-fns/blob/master/docs/unicodeTokens.md"));
  }
}

// node_modules/date-fns/esm/locale/en-US/_lib/formatDistance/index.js
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
var formatDistance = function formatDistance2(token, count, options) {
  var result;
  var tokenValue = formatDistanceLocale[token];
  if (typeof tokenValue === "string") {
    result = tokenValue;
  } else if (count === 1) {
    result = tokenValue.one;
  } else {
    result = tokenValue.other.replace("{{count}}", count.toString());
  }
  if (options !== null && options !== void 0 && options.addSuffix) {
    if (options.comparison && options.comparison > 0) {
      return "in " + result;
    } else {
      return result + " ago";
    }
  }
  return result;
};
var formatDistance_default = formatDistance;

// node_modules/date-fns/esm/locale/_lib/buildFormatLongFn/index.js
function buildFormatLongFn(args) {
  return function() {
    var options = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    var width = options.width ? String(options.width) : args.defaultWidth;
    var format2 = args.formats[width] || args.formats[args.defaultWidth];
    return format2;
  };
}

// node_modules/date-fns/esm/locale/en-US/_lib/formatLong/index.js
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
var formatLong_default = formatLong;

// node_modules/date-fns/esm/locale/en-US/_lib/formatRelative/index.js
var formatRelativeLocale = {
  lastWeek: "'last' eeee 'at' p",
  yesterday: "'yesterday at' p",
  today: "'today at' p",
  tomorrow: "'tomorrow at' p",
  nextWeek: "eeee 'at' p",
  other: "P"
};
var formatRelative = function formatRelative2(token, _date, _baseDate, _options) {
  return formatRelativeLocale[token];
};
var formatRelative_default = formatRelative;

// node_modules/date-fns/esm/locale/_lib/buildLocalizeFn/index.js
function buildLocalizeFn(args) {
  return function(dirtyIndex, options) {
    var context = options !== null && options !== void 0 && options.context ? String(options.context) : "standalone";
    var valuesArray;
    if (context === "formatting" && args.formattingValues) {
      var defaultWidth = args.defaultFormattingWidth || args.defaultWidth;
      var width = options !== null && options !== void 0 && options.width ? String(options.width) : defaultWidth;
      valuesArray = args.formattingValues[width] || args.formattingValues[defaultWidth];
    } else {
      var _defaultWidth = args.defaultWidth;
      var _width = options !== null && options !== void 0 && options.width ? String(options.width) : args.defaultWidth;
      valuesArray = args.values[_width] || args.values[_defaultWidth];
    }
    var index = args.argumentCallback ? args.argumentCallback(dirtyIndex) : dirtyIndex;
    return valuesArray[index];
  };
}

// node_modules/date-fns/esm/locale/en-US/_lib/localize/index.js
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
  abbreviated: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
  wide: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
};
var dayValues = {
  narrow: ["S", "M", "T", "W", "T", "F", "S"],
  short: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"],
  abbreviated: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
  wide: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
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
var ordinalNumber = function ordinalNumber2(dirtyNumber, _options) {
  var number = Number(dirtyNumber);
  var rem100 = number % 100;
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
    argumentCallback: function argumentCallback(quarter) {
      return quarter - 1;
    }
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
var localize_default = localize;

// node_modules/date-fns/esm/locale/_lib/buildMatchFn/index.js
function buildMatchFn(args) {
  return function(string) {
    var options = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    var width = options.width;
    var matchPattern = width && args.matchPatterns[width] || args.matchPatterns[args.defaultMatchWidth];
    var matchResult = string.match(matchPattern);
    if (!matchResult) {
      return null;
    }
    var matchedString = matchResult[0];
    var parsePatterns = width && args.parsePatterns[width] || args.parsePatterns[args.defaultParseWidth];
    var key = Array.isArray(parsePatterns) ? findIndex(parsePatterns, function(pattern) {
      return pattern.test(matchedString);
    }) : findKey(parsePatterns, function(pattern) {
      return pattern.test(matchedString);
    });
    var value;
    value = args.valueCallback ? args.valueCallback(key) : key;
    value = options.valueCallback ? options.valueCallback(value) : value;
    var rest = string.slice(matchedString.length);
    return {
      value,
      rest
    };
  };
}
function findKey(object, predicate) {
  for (var key in object) {
    if (object.hasOwnProperty(key) && predicate(object[key])) {
      return key;
    }
  }
  return void 0;
}
function findIndex(array, predicate) {
  for (var key = 0; key < array.length; key++) {
    if (predicate(array[key])) {
      return key;
    }
  }
  return void 0;
}

// node_modules/date-fns/esm/locale/_lib/buildMatchPatternFn/index.js
function buildMatchPatternFn(args) {
  return function(string) {
    var options = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    var matchResult = string.match(args.matchPattern);
    if (!matchResult)
      return null;
    var matchedString = matchResult[0];
    var parseResult = string.match(args.parsePattern);
    if (!parseResult)
      return null;
    var value = args.valueCallback ? args.valueCallback(parseResult[0]) : parseResult[0];
    value = options.valueCallback ? options.valueCallback(value) : value;
    var rest = string.slice(matchedString.length);
    return {
      value,
      rest
    };
  };
}

// node_modules/date-fns/esm/locale/en-US/_lib/match/index.js
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
  narrow: [/^j/i, /^f/i, /^m/i, /^a/i, /^m/i, /^j/i, /^j/i, /^a/i, /^s/i, /^o/i, /^n/i, /^d/i],
  any: [/^ja/i, /^f/i, /^mar/i, /^ap/i, /^may/i, /^jun/i, /^jul/i, /^au/i, /^s/i, /^o/i, /^n/i, /^d/i]
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
    valueCallback: function valueCallback(value) {
      return parseInt(value, 10);
    }
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
    valueCallback: function valueCallback2(index) {
      return index + 1;
    }
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
var match_default = match;

// node_modules/date-fns/esm/locale/en-US/index.js
var locale = {
  code: "en-US",
  formatDistance: formatDistance_default,
  formatLong: formatLong_default,
  formatRelative: formatRelative_default,
  localize: localize_default,
  match: match_default,
  options: {
    weekStartsOn: 0,
    firstWeekContainsDate: 1
  }
};
var en_US_default = locale;

// node_modules/date-fns/esm/_lib/defaultLocale/index.js
var defaultLocale_default = en_US_default;

// node_modules/date-fns/esm/format/index.js
var formattingTokensRegExp = /[yYQqMLwIdDecihHKkms]o|(\w)\1*|''|'(''|[^'])+('|$)|./g;
var longFormattingTokensRegExp = /P+p+|P+|p+|''|'(''|[^'])+('|$)|./g;
var escapedStringRegExp = /^'([^]*?)'?$/;
var doubleQuoteRegExp = /''/g;
var unescapedLatinCharacterRegExp = /[a-zA-Z]/;
function format(dirtyDate, dirtyFormatStr, options) {
  var _ref, _options$locale, _ref2, _ref3, _ref4, _options$firstWeekCon, _options$locale2, _options$locale2$opti, _defaultOptions$local, _defaultOptions$local2, _ref5, _ref6, _ref7, _options$weekStartsOn, _options$locale3, _options$locale3$opti, _defaultOptions$local3, _defaultOptions$local4;
  requiredArgs(2, arguments);
  var formatStr = String(dirtyFormatStr);
  var defaultOptions2 = getDefaultOptions();
  var locale2 = (_ref = (_options$locale = options === null || options === void 0 ? void 0 : options.locale) !== null && _options$locale !== void 0 ? _options$locale : defaultOptions2.locale) !== null && _ref !== void 0 ? _ref : defaultLocale_default;
  var firstWeekContainsDate = toInteger((_ref2 = (_ref3 = (_ref4 = (_options$firstWeekCon = options === null || options === void 0 ? void 0 : options.firstWeekContainsDate) !== null && _options$firstWeekCon !== void 0 ? _options$firstWeekCon : options === null || options === void 0 ? void 0 : (_options$locale2 = options.locale) === null || _options$locale2 === void 0 ? void 0 : (_options$locale2$opti = _options$locale2.options) === null || _options$locale2$opti === void 0 ? void 0 : _options$locale2$opti.firstWeekContainsDate) !== null && _ref4 !== void 0 ? _ref4 : defaultOptions2.firstWeekContainsDate) !== null && _ref3 !== void 0 ? _ref3 : (_defaultOptions$local = defaultOptions2.locale) === null || _defaultOptions$local === void 0 ? void 0 : (_defaultOptions$local2 = _defaultOptions$local.options) === null || _defaultOptions$local2 === void 0 ? void 0 : _defaultOptions$local2.firstWeekContainsDate) !== null && _ref2 !== void 0 ? _ref2 : 1);
  if (!(firstWeekContainsDate >= 1 && firstWeekContainsDate <= 7)) {
    throw new RangeError("firstWeekContainsDate must be between 1 and 7 inclusively");
  }
  var weekStartsOn = toInteger((_ref5 = (_ref6 = (_ref7 = (_options$weekStartsOn = options === null || options === void 0 ? void 0 : options.weekStartsOn) !== null && _options$weekStartsOn !== void 0 ? _options$weekStartsOn : options === null || options === void 0 ? void 0 : (_options$locale3 = options.locale) === null || _options$locale3 === void 0 ? void 0 : (_options$locale3$opti = _options$locale3.options) === null || _options$locale3$opti === void 0 ? void 0 : _options$locale3$opti.weekStartsOn) !== null && _ref7 !== void 0 ? _ref7 : defaultOptions2.weekStartsOn) !== null && _ref6 !== void 0 ? _ref6 : (_defaultOptions$local3 = defaultOptions2.locale) === null || _defaultOptions$local3 === void 0 ? void 0 : (_defaultOptions$local4 = _defaultOptions$local3.options) === null || _defaultOptions$local4 === void 0 ? void 0 : _defaultOptions$local4.weekStartsOn) !== null && _ref5 !== void 0 ? _ref5 : 0);
  if (!(weekStartsOn >= 0 && weekStartsOn <= 6)) {
    throw new RangeError("weekStartsOn must be between 0 and 6 inclusively");
  }
  if (!locale2.localize) {
    throw new RangeError("locale must contain localize property");
  }
  if (!locale2.formatLong) {
    throw new RangeError("locale must contain formatLong property");
  }
  var originalDate = toDate(dirtyDate);
  if (!isValid(originalDate)) {
    throw new RangeError("Invalid time value");
  }
  var timezoneOffset = getTimezoneOffsetInMilliseconds(originalDate);
  var utcDate = subMilliseconds(originalDate, timezoneOffset);
  var formatterOptions = {
    firstWeekContainsDate,
    weekStartsOn,
    locale: locale2,
    _originalDate: originalDate
  };
  var result = formatStr.match(longFormattingTokensRegExp).map(function(substring) {
    var firstCharacter = substring[0];
    if (firstCharacter === "p" || firstCharacter === "P") {
      var longFormatter = longFormatters_default[firstCharacter];
      return longFormatter(substring, locale2.formatLong);
    }
    return substring;
  }).join("").match(formattingTokensRegExp).map(function(substring) {
    if (substring === "''") {
      return "'";
    }
    var firstCharacter = substring[0];
    if (firstCharacter === "'") {
      return cleanEscapedString(substring);
    }
    var formatter = formatters_default[firstCharacter];
    if (formatter) {
      if (!(options !== null && options !== void 0 && options.useAdditionalWeekYearTokens) && isProtectedWeekYearToken(substring)) {
        throwProtectedError(substring, dirtyFormatStr, String(dirtyDate));
      }
      if (!(options !== null && options !== void 0 && options.useAdditionalDayOfYearTokens) && isProtectedDayOfYearToken(substring)) {
        throwProtectedError(substring, dirtyFormatStr, String(dirtyDate));
      }
      return formatter(utcDate, substring, locale2.localize, formatterOptions);
    }
    if (firstCharacter.match(unescapedLatinCharacterRegExp)) {
      throw new RangeError("Format string contains an unescaped latin alphabet character `" + firstCharacter + "`");
    }
    return substring;
  }).join("");
  return result;
}
function cleanEscapedString(input) {
  var matched = input.match(escapedStringRegExp);
  if (!matched) {
    return input;
  }
  return matched[1].replace(doubleQuoteRegExp, "'");
}

// src/client/containers/infoBox/suncalc/solarTimes/durations.ts
var import_suncalc = __toESM(require_suncalc(), 1);

// src/client/containers/infoBox/suncalc/intervalValueOf.ts
var intervalValueOf = ({ end: endDate, solarNoon: noonDate, start: startDate }) => {
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
};

// src/client/containers/infoBox/suncalc/solarTimes/statics.ts
var SolarTimesStatics = class {
  lat = 0;
  lon = 0;
  x = -1;
  y = -1;
  static increment = ({ durations, keys }) => keys.reduce((sum, key) => sum + durations[key], 0);
  static formatDates = (dates) => dates.sort((a3, b2) => a3.valueOf() - b2.valueOf()).reduce((ret, date) => {
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
      ret.push(createBr());
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
var formatDateValue = (val) => {
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
};

// src/client/containers/infoBox/suncalc/solarTimesStatsCanvas.ts
var SolarTimesStatsCanvas = class {
  constructor({ height, keys, map: map2 = (val) => val, params = {}, stats, width }) {
    const values = stats.map((durations) => map2(SolarTimesStatics.increment({ durations, keys })));
    const min = Math.min(...values);
    const max = Math.max(...values);
    const scaleY = (height - 1) / (max - min);
    const scaleX = width / stats.length;
    const canvas = createHTMLElement({
      height,
      tag: "canvas",
      width,
      ...params
    });
    const context = canvas.getContext("2d");
    if (context) {
      context.beginPath();
      context.strokeStyle = "#000000";
      values.forEach((val, idx) => {
        const x2 = idx * scaleX;
        const y3 = (max - val) * scaleY + 0.5;
        if (x2 === 0)
          context.moveTo(x2, y3);
        else
          context.lineTo(x2, y3);
      });
      context.stroke();
    }
    this.canvas = canvas;
    this.max = max;
    this.min = min;
  }
  canvas;
  min;
  max;
};

// src/client/containers/infoBox/suncalc/valueRow.ts
var ValueRow = class {
  lines = [];
  total = 0;
  totalKeys = [];
  fill = (label2, sum) => this.add({
    increment: sum - this.total,
    label: label2
  });
  fillStats = (durations, sum) => this.addStats({
    durations,
    keys: this.totalKeys,
    map: (val) => sum - val
  });
  add({ durations, increment, keys, label: label2 }) {
    increment ??= SolarTimesStatics.increment({
      durations: durations.today,
      keys
    }), this.total += increment;
    this.addRow({
      col1: [label2],
      col2: [increment ? `+${formatDateValue(increment)}` : ""],
      col3: [formatDateValue(this.total)]
    });
    if (durations)
      this.addStats({ durations, keys });
    return this;
  }
  addRow({ col1, col2, col3, row }) {
    row ??= [
      createHTMLElement({
        style: { marginRight: "auto" },
        tag: "div",
        zhilds: col1
      }),
      createHTMLElement({
        classes: ["text-end"],
        style: { width: "5em" },
        tag: "div",
        zhilds: col2
      }),
      createHTMLElement({
        classes: ["text-end"],
        style: { width: "5em" },
        tag: "div",
        zhilds: col3
      })
    ];
    this.lines.push(createHTMLElement({
      classes: ["d-flex"],
      tag: "div",
      zhilds: row
    }));
    return this;
  }
  addStats({ durations, keys, map: map2 }) {
    const stats = new SolarTimesStatsCanvas({
      height: 30,
      keys,
      map: map2,
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
    const axis = [stats.max, stats.min].map((v) => createHTMLElement({
      classes: ["text-end"],
      style: {
        fontSize: "10px"
      },
      tag: "div",
      zhilds: [formatDateValue(v)]
    }));
    this.addRow({ row: [
      createHTMLElement({
        style: {
          backgroundColor: "#ffffff",
          borderColor: "#000000",
          borderRight: "1px solid",
          marginLeft: "auto",
          paddingLeft: "3px",
          paddingRight: "3px"
        },
        tag: "div",
        zhilds: axis
      }),
      stats.canvas
    ] });
    this.totalKeys.push(...keys);
    return this;
  }
};

// src/client/containers/infoBox/suncalc/solarTimes.ts
var SolarTimes = class extends SolarTimesDurations {
  html = null;
  toHtml = () => {
    if (this.x !== position.x || this.y !== position.y) {
      this.x = position.x;
      this.y = position.y;
      this.lat = rad2deg(y2lat(this.y));
      this.lon = rad2deg(x2lon(this.x));
      this.html = null;
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
      this.html = createHTMLElement({
        tag: "div",
        zhilds
      });
    }
    return this.html;
  };
};
var solarTimes = new SolarTimes();

// src/client/containers/infoBox/updateInfoBox.ts
var updateInfoBox = () => {
  const { height, width } = boundingRect;
  const { x: x2, y: y3 } = position;
  const lat = y2lat(y3);
  const lon = x2lon(x2);
  const latMouse = y2lat(y3 + (mouse.y - height / 2) / tileSize);
  const lonMouse = x2lon(x2 + (mouse.x - width / 2) / tileSize);
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
    `Lat/Lon: ${rad2string({ axis: "NS", pad: 2, phi: lat })} ${rad2string({ axis: "EW", pad: 3, phi: lon })}`,
    createHTMLElement({ tag: "br" }),
    `Mouse: ${rad2string({ axis: "NS", pad: 2, phi: latMouse })} ${rad2string({ axis: "EW", pad: 3, phi: lonMouse })}`,
    createHTMLElement({ tag: "br" }),
    `User: ${rad2string({ axis: "NS", pad: 2, phi: position.user.latitude })} ${rad2string({ axis: "EW", pad: 3, phi: position.user.longitude })} (@${new Date(position.user.timestamp).toLocaleTimeString()})`
  );
  if (settings.show.navionicsDetails)
    infoBox.append(navionicsDetails.toHtml());
  if (settings.show.suncalc)
    infoBox.append(solarTimes.toHtml());
  infoBox.append(...imagesToFetch.stateHtml());
};

// src/client/utils/deg2rad.ts
var deg2rad = (val) => Number(val) * Math.PI / 180;

// src/client/utils/lon2x.ts
var lon2x = (lon, tiles = position.tiles) => (lon / Math.PI / 2 + 0.5) * tiles;

// src/client/globals/navionicsDetails/getNavionicsDetailsList.ts
var abortControllers = /* @__PURE__ */ new Set();
var getNavionicsDetailsList = async ({ parent, x: x2, y: y3, z: z2 }) => {
  while (parent.queue.shift())
    /* @__PURE__ */ (() => void 0)();
  abortControllers.forEach((ac) => ac.abort());
  if (!settings.show.navionicsDetails)
    return;
  const listMap = /* @__PURE__ */ new Map();
  await parent.queue.enqueue(async () => {
    parent.isFetch = true;
    parent.clear();
    const abortController = new AbortController();
    abortControllers.add(abortController);
    const { signal } = abortController;
    const max = 4;
    const perTile = 20;
    const points = [{
      dx: Math.round(x2 * tileSize) / tileSize,
      dy: Math.round(y3 * tileSize) / tileSize,
      radius: 0
    }];
    for (let iX = -max; iX < max; iX++) {
      for (let iY = -max; iY < max; iY++) {
        const dx = Math.ceil(x2 * perTile + iX) / perTile;
        const dy = Math.ceil(y3 * perTile + iY) / perTile;
        const radius = Math.sqrt((dx - x2) * (dx - x2) + (dy - y3) * (dy - y3));
        points.push({ dx, dy, radius });
      }
    }
    let done = 0;
    await points.sort((a3, b2) => a3.radius - b2.radius).reduce(async (prom, { dx, dy }) => {
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
            position: ({ lat, lon }) => ({
              lat: deg2rad(lat),
              lon: deg2rad(lon),
              x: lon2x(deg2rad(lon)),
              y: lat2y(deg2rad(lat))
            })
          });
          const pdx = position2.x - x2;
          const pdy = position2.y - y3;
          const distance = Math.sqrt(pdx * pdx + pdy * pdy) * tileSize * px2nm(position2.lat);
          parent.add({
            category_id,
            details,
            distance,
            icon_id,
            id,
            name,
            position: position2
          });
          if (item.details) {
            const { label: label2, properties } = extractProperties(
              await fetch(`/navionics/objectinfo/${item.id}`, { signal }).then(async (res2) => res2.ok ? await res2.json() : {}).catch(() => {
              }),
              {
                label: String,
                properties: (val) => val?.map(({ label: label3 }) => label3)?.filter(Boolean)
              }
            );
            parent.add({
              category_id,
              details,
              distance,
              icon_id,
              id,
              label: label2,
              name,
              position: position2,
              properties
            });
          }
        }));
      }).catch((rej) => console.error(rej));
      await ret;
      done++;
      parent.fetchProgress = `${done}/${points.length}`;
      parent.clearHtmlList();
      updateInfoBox();
      return prom;
    }, Promise.resolve());
    abortControllers.delete(abortController);
    parent.isFetch = false;
  });
  parent.clearHtmlList();
};

// src/client/globals/marker.ts
var Marker = class {
  constructor({ id = "", lat, lon, type }) {
    this.lat = lat;
    this.lon = lon;
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

// src/client/globals/navionicsDetails/goto.ts
var goto = (item) => {
  if (item.position)
    return createHTMLElement({
      onclick: (event) => {
        const { lat, lon } = item.position;
        position.xyz = {
          x: lon2x(lon),
          y: lat2y(lat)
        };
        redraw("goto");
        event.stopPropagation();
      },
      style: {
        marginLeft: "auto",
        padding: "0.25rem"
      },
      tag: "a",
      zhilds: [
        createHTMLElement({
          src: "/bootstrap-icons-1.11.2/arrow-right-circle.svg",
          style: {
            color: "#ff0000",
            height: "1.75rem"
          },
          tag: "img"
        })
      ]
    });
  return void 0;
};

// src/client/globals/navionicsDetails/icon.ts
var icon = (item) => createHTMLElement({
  classes: ["d-flex"],
  style: {
    height: "2em",
    width: "2em"
  },
  tag: "div",
  zhilds: [createHTMLElement({
    style: {
      margin: "auto"
    },
    tag: "div",
    zhilds: [
      createHTMLElement({
        src: `/navionics/icon/${encodeURIComponent(item.icon_id)}`,
        style: {
          maxHeight: "1.5em",
          maxWidth: "1.5em"
        },
        tag: "img"
      })
    ]
  })]
});

// src/client/globals/navionicsDetails/itemDetails.ts
var itemDetails = (item, itemId, accordionId) => {
  if (item.properties)
    return createHTMLElement({
      classes: ["accordion-collapse", "collapse", "px-2"],
      dataset: {
        bsParent: `#${accordionId}`
      },
      id: itemId,
      tag: "div",
      zhilds: item.properties.map((prop) => createHTMLElement({
        tag: "p",
        zhilds: [prop]
      }))
    });
  return void 0;
};

// src/client/globals/navionicsDetails/label.ts
var label = (item) => createHTMLElement({
  classes: ["d-flex"],
  tag: "div",
  zhilds: [
    createHTMLElement({
      style: {
        margin: "auto"
      },
      tag: "div",
      zhilds: [
        item.name,
        createHTMLElement({
          style: {
            fontSize: "70%",
            marginLeft: "0.5rem"
          },
          tag: "span",
          zhilds: [item.distance.toFixed(3), "nm"]
        })
      ]
    })
  ]
});

// src/client/globals/navionicsDetails/spinner.ts
var spinner = (item) => {
  if (item.details && !item.properties)
    return createHTMLElement({
      classes: ["d-flex"],
      tag: "div",
      zhilds: [createHTMLElement({
        classes: [
          "spinner-border",
          "spinner-border-sm"
        ],
        style: {
          margin: "auto"
        },
        tag: "div"
      })]
    });
  return void 0;
};

// src/client/globals/navionicsDetails/accordionItem.ts
var accordionItem = ({ accordionId, idx, item, parent }) => {
  const itemId = `navionicsDetailsItem${idx}`;
  return createHTMLElement({
    classes: [
      "accordion-item",
      "mm-menu-text"
    ],
    tag: "div",
    zhilds: [
      createHTMLElement({
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
            redraw("set navionics marker");
          }
        },
        tag: "div",
        zhilds: [
          createHTMLElement({
            classes: [
              ...item.properties ? ["accordion-button", "collapsed"] : ["d-flex"],
              "px-2",
              "py-0",
              "mm-menu-text"
            ],
            dataset: item.properties ? {
              bsTarget: `#${itemId}`,
              bsToggle: "collapse"
            } : {},
            tag: "div",
            zhilds: [createHTMLElement({
              classes: ["d-flex"],
              style: {
                width: "100%"
              },
              tag: "div",
              zhilds: [
                icon(item),
                label(item),
                goto(item),
                spinner(item)
              ]
            })]
          })
        ]
      }),
      itemDetails(item, itemId, accordionId)
    ]
  });
};

// src/client/globals/navionicsDetails/toAccordion.ts
var toAccordion = ({ items, offset, parent }) => {
  const accordionId = `navionicsDetailsList${offset ?? ""}`;
  const ret = createHTMLElement({
    classes: ["accordion"],
    id: accordionId,
    tag: "div"
  });
  if (items.length <= 10)
    ret.append(
      ...items.map((item, idx) => accordionItem({
        accordionId,
        idx: idx + (offset ?? 0),
        item,
        parent
      }))
    );
  else
    for (let i2 = 0; i2 < items.length; i2 += 10) {
      const itemId = `navionicsDetailsItemList${i2}`;
      const itemsSlice = items.slice(i2, i2 + 10);
      ret.append(createHTMLElement({
        classes: [
          "accordion-item",
          "mm-menu-text"
        ],
        tag: "div",
        zhilds: [
          createHTMLElement({
            classes: [
              "accordion-header",
              "mm-menu-text"
            ],
            tag: "div",
            zhilds: [
              createHTMLElement({
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
                },
                tag: "div",
                zhilds: [createHTMLElement({
                  classes: ["d-flex"],
                  style: {
                    width: "100%"
                  },
                  tag: "div",
                  zhilds: [
                    itemsSlice.length === 1 ? `${i2 + 1}` : `${i2 + 1}-${i2 + itemsSlice.length}`
                  ]
                })]
              })
            ]
          }),
          createHTMLElement({
            classes: ["accordion-collapse", "collapse", "px-2", i2 === 0 ? "show" : null],
            dataset: {
              bsParent: `#${accordionId}`
            },
            id: itemId,
            tag: "div",
            zhilds: [
              toAccordion({ items: itemsSlice, offset: i2, parent })
            ]
          })
        ]
      }));
    }
  return ret;
};

// src/client/globals/navionicsDetails.ts
var NavionicsDetails = class {
  constructor() {
    this.queue.enqueue(() => new Promise((r) => setInterval(r, 1)));
  }
  isFetch = false;
  fetchProgress = "";
  _list = /* @__PURE__ */ new Map();
  get list() {
    return this._list;
  }
  marker;
  htmlList = null;
  queue = new StyQueue(1);
  add = (item) => {
    this._list.set(item.id, item);
    this.clearHtmlList();
  };
  clear = () => {
    this._list.clear();
    this.clearHtmlList();
  };
  clearHtmlList = () => {
    this.htmlList = null;
    updateInfoBox();
  };
  delete = (item) => {
    this._list.delete(item.id);
    this.clearHtmlList();
  };
  fetch = ({ x: x2, y: y3, z: z2 }) => getNavionicsDetailsList({ parent: this, x: x2, y: y3, z: z2 });
  toHtml = () => {
    this.htmlList ??= (() => {
      const ret = toAccordion(
        {
          items: [...this.list.values()].sort((a3, b2) => a3.distance - b2.distance),
          parent: this
        }
      );
      if (this.isFetch)
        ret.append(createHTMLElement({
          classes: [
            "accordion-item",
            "mm-menu-text"
          ],
          tag: "div",
          zhilds: [createHTMLElement({
            classes: [
              "accordion-header",
              "mm-menu-text"
            ],
            tag: "div",
            zhilds: [createHTMLElement({
              classes: [
                "d-flex",
                "mm-menu-text"
              ],
              tag: "div",
              zhilds: [
                this.fetchProgress,
                createHTMLElement({
                  classes: [
                    "spinner-border",
                    "spinner-border-sm"
                  ],
                  style: {
                    margin: "auto"
                  },
                  tag: "div"
                })
              ]
            })]
          })]
        }));
      return ret;
    })();
    return this.htmlList;
  };
};
var navionicsDetails = new NavionicsDetails();

// src/client/globals/position.ts
var Position = class {
  constructor({ ttl, x: x2, y: y3, z: z2 }) {
    this.xyz = { x: x2, y: y3, z: z2 };
    this._ttl = ttl;
    this.map = { x: x2, y: y3, z: z2 };
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
  set xyz({ x: x2 = this._x, y: y3 = this._y, z: z2 = this._z }) {
    this._z = z2;
    this._tiles = 1 << z2;
    this._x = modulo(x2, this._tiles);
    this._y = Math.max(0, Math.min(y3, this._tiles));
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
    if (this._z < 20) {
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
    if (this.z > 2) {
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
var position = new Position(extractProperties(Object.fromEntries(new URL(window.location.href).searchParams.entries()), {
  ttl: (val) => parseInt(val ?? 0),
  x: (val) => parseFloat(val ?? 2),
  y: (val) => parseFloat(val ?? 2),
  z: (val) => parseInt(val ?? 2)
}));

// src/client/utils/lat2y.ts
var lat2y = (lat, tiles = position.tiles) => {
  return (0.5 - Math.asinh(Math.tan(lat)) / Math.PI / 2) * tiles;
};

// src/client/utils/min2rad.ts
var min2rad = (min) => min / 60 / 180 * Math.PI;

// src/client/utils/nm2px.ts
var nm2px = (lat) => {
  const stretch = 1 / Math.cos(lat);
  return position.tiles * tileSize / 360 / 60 * stretch;
};

// src/client/containers/canvases/crosshairs.ts
var createCrosshairsCanvas = ({
  height,
  width,
  x: x2,
  y: y3
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
  if (!settings.show.crosshair || !context)
    return canvas;
  const lat = y2lat(y3);
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
      ty: (lat2y(latPoint) - y3) * tileSize
    }));
    context.beginPath();
    context.strokeStyle = "#ff0000";
    circlePoints.forEach(({ draw, tx, ty }, idx) => {
      if (draw)
        context.lineTo(tx, ty);
      else
        context.moveTo(tx, ty);
      if (idx === 96)
        context.strokeText(`${minArc.toFixed(Math.max(0, -scaleFloor))}nm`, tx, ty);
    });
    context.stroke();
    const piHalf = Math.PI / 2;
    context.beginPath();
    for (let minDiv = minLast + milesPerDiv; minDiv < minArc; minDiv += milesPerDiv) {
      const radDiv2 = min2rad(minDiv);
      if (lat + radDiv2 < piHalf) {
        const top = (lat2y(lat + radDiv2) - y3) * tileSize;
        context.moveTo(-5, top);
        context.lineTo(5, top);
      }
      if (lat - radDiv2 > -piHalf) {
        const bottom = (lat2y(lat - radDiv2) - y3) * tileSize;
        context.moveTo(-5, bottom);
        context.lineTo(5, bottom);
      }
      const { cosOmega2, lat2, lon2 } = sphericLatLon({ lat, omega: piHalf, radius: radDiv2 });
      const sinOmega2 = Math.sqrt(1 - cosOmega2 * cosOmega2);
      context.moveTo(
        (lon2x(lon + lon2) - x2) * tileSize + cosOmega2 * 5,
        (lat2y(lat2) - y3) * tileSize - sinOmega2 * 5
      );
      context.lineTo(
        (lon2x(lon + lon2) - x2) * tileSize - cosOmega2 * 5,
        (lat2y(lat2) - y3) * tileSize + sinOmega2 * 5
      );
      context.moveTo(
        (lon2x(lon - lon2) - x2) * tileSize - cosOmega2 * 5,
        (lat2y(lat2) - y3) * tileSize - sinOmega2 * 5
      );
      context.lineTo(
        (lon2x(lon - lon2) - x2) * tileSize + cosOmega2 * 5,
        (lat2y(lat2) - y3) * tileSize + sinOmega2 * 5
      );
      context.strokeStyle = "#ff0000";
    }
    context.stroke();
    minLast = minArc;
  }
  return canvas;
};

// src/client/containers/canvases/map/drawImage.ts
var drawImage = ({
  context,
  scale = 1,
  source,
  ttl,
  x: x2,
  y: y3,
  z: z2
}) => {
  const src = `/tile/${source}/${[
    z2,
    Math.floor(x2 / scale).toString(16),
    Math.floor(y3 / scale).toString(16)
  ].join("/")}?ttl=${ttl}`;
  const sx = Math.floor(frac(x2 / scale) * scale) * tileSize / scale;
  const sy = Math.floor(frac(y3 / scale) * scale) * tileSize / scale;
  const sw = tileSize / scale;
  imagesToFetch.add({ source, x: x2, y: y3, z: z2 });
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
      imagesToFetch.delete({ source, x: x2, y: y3, z: z2 });
    };
    img.onerror = () => {
      resolve(
        z2 > 0 ? drawImage({
          context,
          scale: scale << 1,
          source,
          ttl,
          x: x2,
          y: y3,
          z: z2 - 1
        }) : false
      );
      imagesToFetch.delete({ source, x: x2, y: y3, z: z2 });
    };
  });
  return prom;
};

// src/client/containers/canvases/map/navionicsWatermark.ts
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
  for (let i2 = 0; i2 < ret.length; i2++) {
    ret[i2] = watermark[i2 * 4];
  }
  return ret;
});

// src/client/containers/canvases/map/drawNavionics.ts
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
  const b2 = val & 255;
  const diff = 1;
  const alpha = val === 10012672 ? 64 : 0;
  for (let dr = -diff; dr <= diff; dr++) {
    for (let dg = -diff; dg <= diff; dg++) {
      for (let db = -diff; db <= diff; db++) {
        arr.set((r + dr << 16) + (g + dg << 8) + b2 + db, alpha);
      }
    }
  }
  return arr;
}, /* @__PURE__ */ new Map());
var drawNavionics = async ({ context, source, ttl, x: x2, y: y3, z: z2 }) => {
  const workerCanvas = new OffscreenCanvas(tileSize, tileSize);
  const workerContext = workerCanvas.getContext("2d");
  const watermark = await navionicsWatermark;
  if (!workerContext || !watermark)
    return false;
  const drawProm = drawImage({ context: workerContext, source, ttl, x: x2, y: y3, z: z2 });
  const draw = await drawProm;
  if (!draw)
    return false;
  imagesToFetch.add({ source: "transparent", x: x2, y: y3, z: z2 });
  const img = workerContext.getImageData(0, 0, tileSize, tileSize);
  const { data } = img;
  for (let i2 = 0; i2 < watermark.length; i2++) {
    const mask = watermark[i2];
    const subData = data.subarray(i2 * 4, i2 * 4 + 4);
    const [r, g, b2, a3] = subData.map((v) => v * 248 / mask);
    const color = (r << 16) + (g << 8) + b2;
    subData[0] = r;
    subData[1] = g;
    subData[2] = b2;
    subData[3] = backgroundColors.get(color) ?? a3;
  }
  workerContext.putImageData(img, 0, 0);
  imagesToFetch.delete({ source: "transparent", x: x2, y: y3, z: z2 });
  context.drawImage(workerCanvas, 0, 0);
  return true;
};

// src/client/containers/canvases/map/drawCachedImage.ts
var drawCachedImage = async ({
  alpha,
  context,
  source,
  trans,
  ttl,
  usedImages,
  x: x2,
  y: y3,
  z: z2
}) => {
  const isNavionics = source === "navionics";
  const src = `/${source}/${[
    z2,
    modulo(x2, position.tiles).toString(16),
    modulo(y3, position.tiles).toString(16)
  ].join("/")}`;
  const drawCanvas = (cnvs) => {
    usedImages.add(src);
    context.globalAlpha = alpha;
    context.drawImage(
      cnvs,
      x2 * tileSize + trans.x,
      y3 * tileSize + trans.y
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
  const successProm = isNavionics ? drawNavionics({ context: workerContext, source, ttl, x: x2, y: y3, z: z2 }) : drawImage({ context: workerContext, source, ttl, x: x2, y: y3, z: z2 });
  imagesMap[src] = successProm.then((success) => success ? workerCanvas : null);
  return async () => {
    const success = await successProm;
    if (success) {
      drawCanvas(workerCanvas);
    }
    return success;
  };
};

// src/client/containers/canvases/mapCanvas.ts
var imagesLastUsed = /* @__PURE__ */ new Set();
var imagesMap = {};
var createMapCanvas = async ({
  height,
  width,
  x: x2,
  y: y3,
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
    y: Math.round(height / 2 - y3 * tileSize)
  };
  const marginTiles = 1;
  const maxdx = Math.ceil((width - trans.x) / tileSize);
  const maxdy = Math.ceil((height - trans.y) / tileSize);
  const mindx = -Math.ceil(trans.x / tileSize);
  const mindy = -Math.ceil(trans.y / tileSize);
  const dxArray = [];
  for (let dx = mindx - marginTiles; dx < maxdx + marginTiles; dx++) {
    dxArray.push({ dx, marginX: dx < mindx || dx > maxdx });
  }
  const dyArray = [];
  for (let dy = mindy - marginTiles; dy < maxdy + marginTiles; dy++) {
    if (dy >= 0 && dy < position.tiles)
      dyArray.push({ dy, marginY: dy < mindy || dy > maxdy });
  }
  const usedImages = /* @__PURE__ */ new Set();
  const ttl = Math.max(Math.min(17, z2 + Math.max(0, position.ttl)) - z2, 0);
  const neededTileProms = [];
  const optionalTileProms = [];
  dxArray.map(({ dx, marginX }) => {
    dyArray.map(({ dy, marginY }) => {
      (marginX || marginY ? optionalTileProms : neededTileProms).push(
        settings.tiles.order.reduce(async (prom, entry) => {
          const { alpha, source } = typeof entry === "string" ? { alpha: 1, source: entry } : entry;
          if (source && settings.tiles.enabled[source]) {
            const draw = drawCachedImage({ alpha, context, source, trans, ttl: marginX || marginY ? 0 : ttl, usedImages, x: dx, y: dy, z: z2 });
            await prom;
            await (await draw)();
          }
          return prom;
        }, Promise.resolve())
      );
    });
  });
  await Promise.all(neededTileProms);
  Promise.all(optionalTileProms).then(() => Promise.all(neededTileProms)).then(() => {
    usedImages.forEach((i2) => {
      imagesLastUsed.delete(i2);
      imagesLastUsed.add(i2);
    });
    [...imagesLastUsed].slice(0, -1e3).forEach((src) => {
      delete imagesMap[src];
      imagesLastUsed.delete(src);
    });
  });
  return canvas;
};

// src/client/containers/canvases/net.ts
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
  y: y3
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
  const lat = y2lat(y3);
  const scaleX = getScale(0, context.measureText(rad2string({ axis: "EW", pad: 3, phi: 0 })).width);
  const scaleY = getScale(lat);
  const left = x2 - width / 2 / tileSize;
  const right = x2 + width / 2 / tileSize;
  const top = y3 - height / 2 / tileSize;
  const bottom = y3 + height / 2 / tileSize;
  const strokeText = (text, x3, y4) => {
    context.strokeText(text, x3, y4);
    context.fillText(text, x3, y4);
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
      y1: (lat2y(latGrid) - y3) * tileSize
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
      y1: (top - y3) * tileSize,
      y2: (bottom - y3) * tileSize
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
      rad2string({ axis: "NS", pad: 2, phi: latGrid }),
      x1 + 3,
      y1 - 3
    );
  });
  pointsX.forEach(({ lonGrid, x1, y2: y22 }) => {
    strokeText(
      rad2string({ axis: "EW", pad: 3, phi: lonGrid }),
      x1 + 3,
      y22 - 3
    );
  });
  context.fill();
  context.stroke();
  position.markers.forEach((marker) => {
    const markerX = (marker.x - x2) * tileSize;
    const markerY = (marker.y - y3) * tileSize;
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
function moveCanvas({ canvas, height, width, x: x2, y: y3, z: z2 }) {
  const { map: map2, tiles } = position;
  const scaleZ = z2 >= map2.z ? 1 << z2 - map2.z : 1 / (1 << map2.z - z2);
  const tiles_2 = tiles / 2;
  const shiftX = (modulo(map2.x * scaleZ - x2 + tiles_2, tiles) - tiles_2) * tileSize;
  const shiftY = (modulo(map2.y * scaleZ - y3 + tiles_2, tiles) - tiles_2) * tileSize;
  canvas.style.height = `${scaleZ * canvas.height}px`;
  canvas.style.width = `${scaleZ * canvas.width}px`;
  canvas.style.left = `${(width - canvas.width * scaleZ) / 2 + shiftX}px`;
  canvas.style.top = `${(height - canvas.height * scaleZ) / 2 + shiftY}px`;
}
var map = null;
var redraw = async (type) => {
  const { height, width } = boundingRect;
  const { tiles, ttl, x: x2, y: y3, z: z2 } = position;
  const crosshairs = createCrosshairsCanvas({ height, width, x: x2, y: y3 });
  const net = createNetCanvas({ height, width, x: x2, y: y3 });
  overlayContainer.innerHTML = "";
  overlayContainer.append(crosshairs, net);
  updateInfoBox();
  if (map)
    moveCanvas({ canvas: map, height, width, x: x2, y: y3, z: z2 });
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
  await createMapCanvas({ height, width, x: x2, y: y3, z: z2 }).then((newCanvas) => {
    map = newCanvas;
    position.map.x = modulo(x2, tiles);
    position.map.y = y3;
    position.map.z = z2;
    mapContainer.innerHTML = "";
    mapContainer.append(newCanvas);
  });
  (() => {
    const { origin, pathname, search } = window.location;
    const newsearch = `?z=${z2}&${Object.entries({ ttl, x: x2, y: y3 }).map(([k2, v]) => `${k2}=${v}`).join("&")}`;
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
var baselayerLabel = (source) => `${source || "- none -"} (${settings.tiles.baselayers.indexOf(source)})`;
var baselayerMenuButton = createHTMLElement({
  classes: ["btn", "btn-secondary", "dropdown-toggle"],
  dataset: {
    bsToggle: "dropdown"
  },
  role: "button",
  tag: "a",
  zhilds: [baselayerLabel(settings.tiles.order[0])]
});
var setBaseLayer = (source) => {
  settings.tiles.baselayers.forEach((key) => settings.tiles.enabled[key] = key === source);
  settings.tiles.order[0] = source;
  baselayerMenuButton.innerText = baselayerLabel(source);
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
              zhilds: [baselayerLabel(source)]
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
var iconButton = ({
  active = () => false,
  onclick = () => void 0,
  src,
  style
}) => {
  const ret = createHTMLElement({
    classes: ["btn", active() ? "btn-success" : "btn-secondary"],
    role: "button",
    style: {
      padding: "0.25rem",
      ...style
    },
    tag: "a",
    zhilds: [
      createHTMLElement({
        src,
        style: {
          color: "#ff0000",
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
  active: () => settings.show.crosshair,
  onclick: () => settings.show.crosshair = !settings.show.crosshair,
  src: "bootstrap-icons-1.11.2/crosshair.svg"
});

// src/client/containers/menu/goto/address/searchContainer.ts
var addressSearchContainer = createHTMLElement({
  classes: ["dropdown-menu"],
  tag: "div"
});

// src/client/containers/menu/goto/address/input.ts
var addressQueue = new StyQueue(1);
var addressInput = createHTMLElement({
  autocomplete: "off",
  classes: ["form-control"],
  oninput: async () => {
    const { value } = addressInput;
    while (addressQueue.shift())
      ;
    const valid = Boolean(value) && await addressQueue.enqueue(() => {
      return fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${addressInput.value}`).then(async (res) => {
        if (!res.ok)
          return false;
        const items = await res.json();
        if (!Array.isArray(items))
          return false;
        if (items.length === 0)
          return false;
        if (value !== addressInput.value)
          return false;
        const zhilds = items.sort((a3, b2) => b2.importance - a3.importance).map((item, idx) => {
          const { boundingbox, display_name: displayName, lat, lon } = extractProperties(item, {
            boundingbox: (val) => Array.isArray(val) ? val.map(deg2rad) : [],
            display_name: String,
            lat: deg2rad,
            lon: deg2rad
          });
          const [lat1 = lat, lat2 = lat, lon1 = lon, lon2 = lon] = boundingbox;
          const z2 = (() => {
            if (Math.abs(lat2 - lat1) > 0 && Math.abs(lon2 - lon1) > 0) {
              const diffX = Math.abs(lon2x(lon2, 1) - lon2x(lon1, 1));
              const diffY = Math.abs(lat2y(lon2, 1) - lat2y(lon1, 1));
              const zoom = 1 / Math.max(diffX, diffY);
              return Math.max(2, Math.min(Math.ceil(Math.log2(zoom)), 17));
            }
            return position.z;
          })();
          const onclick = () => {
            addressInput.placeholder = value;
            addressInput.value = "";
            addressSearchContainer.classList.remove("show");
            position.xyz = {
              x: lon2x(lon, 1 << z2),
              y: lat2y(lat, 1 << z2),
              z: z2
            };
            redraw("goto address");
          };
          if (idx === 0)
            addressForm.onsubmit = onclick;
          return createHTMLElement({
            classes: ["list-group-item"],
            onclick,
            role: "button",
            tag: "a",
            zhilds: [displayName, ` (${z2})`]
          });
        });
        addressSearchContainer.innerHTML = "";
        addressSearchContainer.append(createHTMLElement({
          classes: ["list-group", "list-group-flush"],
          tag: "div",
          zhilds
        }));
        return true;
      }).catch(() => false);
    });
    if (valid) {
      addressSearchContainer.classList.add("show");
    } else {
      addressSearchContainer.classList.remove("show");
      addressSearchContainer.innerHTML = "";
    }
  },
  placeholder: "Address",
  tag: "input",
  type: "text"
});

// src/client/containers/menu/goto/address/form.ts
var addressForm = createHTMLElement({
  action: "javascript:void(0)",
  classes: ["m-0"],
  style: {
    minWidth: "20em"
  },
  tag: "form",
  zhilds: [addressInput]
});

// src/client/containers/menu/goto/address/container.ts
var addressContainer = createHTMLElement({
  classes: ["dropdown"],
  tag: "div",
  zhilds: [
    addressForm,
    addressSearchContainer
  ]
});

// src/client/containers/menu/goto/coord/form.ts
var import_parse_dms2 = __toESM(require_parse_dms(), 1);

// src/client/containers/menu/goto/coord/error.ts
var coordError = createHTMLElement({
  classes: ["form-text"],
  tag: "div"
});

// src/common/fromEntriesTyped.ts
function fromEntriesTyped(entries) {
  return Object.fromEntries(entries);
}

// src/client/globals/coordUnits.ts
var coordUnits = ["d", "dm", "dms"];

// src/client/containers/menu/goto/coord/info.ts
var coordInfo = fromEntriesTyped(
  coordUnits.map((c2) => [
    c2,
    createHTMLElement({
      classes: ["form-text"],
      style: {
        width: "max-content"
      },
      tag: "div"
    })
  ])
);

// src/client/containers/menu/goto/coord/input.ts
var import_parse_dms = __toESM(require_parse_dms(), 1);

// src/client/containers/menu/goto/coord/submit.ts
var coordSubmit = iconButton({
  onclick: () => coordForm.submit(),
  src: "/bootstrap-icons-1.11.2/arrow-right-circle.svg"
});

// src/client/containers/menu/goto/coord/input.ts
var coordInput = createHTMLElement({
  autocomplete: "off",
  classes: ["form-control"],
  oninput: () => {
    console.log("oninput");
    coordUnits.forEach((u2) => {
      coordInfo[u2].style.display = "none";
    });
    try {
      if (!coordInput.value)
        coordSubmit.classList.add("disabled");
      const { lat: latDeg, lon: lonDeg } = (0, import_parse_dms.default)(coordInput.value);
      const { lat, lon } = {
        lat: deg2rad(latDeg),
        lon: deg2rad(lonDeg)
      };
      if (typeof latDeg === "number" && typeof lonDeg === "number") {
        coordUnits.forEach((u2) => {
          console.log("update lat/lon");
          const func = rad2stringFuncs[u2];
          coordInfo[u2].innerText = `${func({ axis: "NS", pad: 2, phi: lat })} ${func({ axis: "EW", pad: 3, phi: lon })}`;
          coordInfo[u2].style.display = "block";
          coordError.style.display = "none";
          coordSubmit.classList.remove("disabled");
        });
      }
    } catch (e2) {
      coordError.innerText = e2.toString();
      coordError.style.display = "block";
      coordSubmit.classList.add("disabled");
    }
  },
  placeholder: "Coordinates",
  tag: "input",
  type: "text"
});

// src/client/containers/menu/goto/coord/form.ts
var coordForm = createHTMLElement({
  action: "javascript:void(0)",
  classes: ["m-0"],
  onsubmit: () => {
    const { lat: latDeg, lon: lonDeg } = (0, import_parse_dms2.default)(coordInput.value);
    const { lat, lon } = {
      lat: deg2rad(latDeg),
      lon: deg2rad(lonDeg)
    };
    if (typeof latDeg === "number" && typeof lonDeg === "number") {
      position.xyz = {
        x: lon2x(lon),
        y: lat2y(lat)
      };
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
        coordInput,
        coordSubmit
      ]
    }),
    coordError,
    coordInfo.d,
    coordInfo.dm,
    coordInfo.dms
  ]
});

// src/client/utils/savedPositionsFromLocalStoreage.ts
var savedPositionsFromLocalStoreage = () => {
  const list = JSON.parse(window.localStorage.getItem("savedPositions") ?? "[]");
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
  window.localStorage.setItem("savedPositions", "[]");
  return [];
};

// src/client/containers/menu/goto/savedPositions/editSavedPosition.ts
var import_json_stable_stringify2 = __toESM(require_json_stable_stringify(), 1);
var editSavedPosition = ({ func, x: x2, y: y3, z: z2 }) => {
  const list = new Set(savedPositionsFromLocalStoreage().map((e2) => (0, import_json_stable_stringify2.default)(e2)));
  list[func]((0, import_json_stable_stringify2.default)({
    x: Math.round(x2 * tileSize),
    y: Math.round(y3 * tileSize),
    z: z2
  }));
  window.localStorage.setItem("savedPositions", (0, import_json_stable_stringify2.default)([...list].map((e2) => JSON.parse(e2))));
  updateSavedPositionsList();
};

// src/client/containers/menu/goto/savedPositions/updateSavedPositionsList.ts
var updateSavedPositionsList = () => {
  savedPositions.innerHTML = "";
  const list = savedPositionsFromLocalStoreage();
  list.forEach((item) => {
    const { x: x2, y: y3, z: z2 } = extractProperties(item, {
      x: (val) => Number(val) / tileSize,
      y: (val) => Number(val) / tileSize,
      z: Number
    });
    console.log({ item, x: x2, y: y3, z: z2 });
    savedPositions.append(createHTMLElement({
      classes: ["btn-group", "my-2", "d-flex"],
      role: "group",
      tag: "div",
      zhilds: [
        createHTMLElement({
          classes: ["btn", "btn-secondary"],
          onclick: () => {
            position.xyz = { x: x2, y: y3, z: z2 };
            redraw("load position");
          },
          role: "button",
          tag: "a",
          zhilds: [[
            rad2string({ axis: "NS", pad: 2, phi: y2lat(y3, 1 << z2) }),
            rad2string({ axis: "EW", pad: 3, phi: x2lon(x2, 1 << z2) }),
            `(${z2})`
          ].join(" ")]
        }),
        iconButton({
          onclick: () => {
            editSavedPosition({ func: "delete", x: x2, y: y3, z: z2 });
          },
          src: "bootstrap-icons-1.11.2/x.svg",
          style: {
            flexGrow: "0"
          }
        })
      ]
    }));
  });
};

// src/client/containers/menu/goto/savedPositions.ts
var savedPositions = createHTMLElement({
  tag: "div"
});
updateSavedPositionsList();

// src/client/containers/menu/gotoMenu.ts
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
    createHTMLElement({
      classes: ["dropdown-menu", "p-2"],
      tag: "div",
      zhilds: [
        coordForm,
        addressContainer,
        savedPositions
      ]
    })
  ]
});

// src/client/containers/menu/navionicsDetailsToggle.ts
var navionicsDetailsToggle = iconButton({
  active: () => settings.show.navionicsDetails,
  onclick: () => {
    const newActive = !settings.show.navionicsDetails;
    settings.show.navionicsDetails = newActive;
    navionicsDetails.fetch(position);
  },
  src: "bootstrap-icons-1.11.2/question-circle.svg"
});

// src/client/containers/menu/overlayToggle.ts
var overlayToggle = (source) => iconButton({
  active: () => Boolean(settings.tiles.enabled[source]),
  onclick: () => settings.tiles.enabled[source] = !settings.tiles.enabled[source],
  src: `icons/${source}.svg`
});

// src/client/containers/menu/navionicsToggle.ts
var navionicsToggle = overlayToggle("navionics");

// src/client/containers/menu/savePosition.ts
var savePosition = createHTMLElement({
  classes: ["btn", "btn-secondary"],
  onclick: () => {
    editSavedPosition({ func: "add", ...position.xyz });
  },
  role: "button",
  tag: "a",
  zhilds: ["Save"]
});

// src/client/containers/menu/suncalcToggle.ts
var suncalcToggle = iconButton({
  active: () => settings.show.suncalc,
  onclick: () => settings.show.suncalc = !settings.show.suncalc,
  src: "bootstrap-icons-1.11.2/sunrise.svg"
});

// src/client/containers/menu/vfdensityToggle.ts
var vfdensityToggle = overlayToggle("vfdensity");

// src/client/containers/menuContainer.ts
var menuContainer = createHTMLElement({
  classes: ["d-flex", "gap-2", "m-2"],
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
        navionicsDetailsToggle,
        crosshairToggle,
        suncalcToggle,
        coordsToggle
      ]
    }),
    gotoMenu,
    savePosition
  ]
});

// src/client/getUserLocation.ts
var geolocationBlocked = false;
var updateUserLocation = async () => {
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
  updateInfoBox();
  return position.user;
};

// src/client/events/oninput.ts
var oninput = (event) => {
  const { height, width } = boundingRect;
  const { type } = event;
  let needRedraw = false;
  console.log(event.target);
  if (![
    event.target instanceof HTMLBodyElement
    // event.target instanceof Window,
  ].some(Boolean)) {
    return;
  }
  if (event instanceof WheelEvent) {
    const { clientX, clientY, deltaY } = event;
    if (deltaY > 0) {
      needRedraw = position.zoomOut();
      position.xyz = {
        x: position.x - (clientX - width / 2) / tileSize / 2,
        y: position.y - (clientY - height / 2) / tileSize / 2
      };
    } else if (deltaY < 0) {
      needRedraw = position.zoomIn();
      position.xyz = {
        x: position.x + (clientX - width / 2) / tileSize,
        y: position.y + (clientY - height / 2) / tileSize
      };
    } else {
      console.log("noop", { deltaY, type });
      return;
    }
  } else if (event instanceof KeyboardEvent) {
    if (event.isComposing)
      return;
    const { key } = event;
    if (key >= "0" && key <= "9") {
      const baselayer2 = settings.tiles.baselayers[parseInt(key)];
      if (typeof baselayer2 !== "undefined")
        setBaseLayer(baselayer2);
    } else if (key === "c")
      crosshairToggle.click();
    else if (key === "d")
      coordsToggle.click();
    else if (key === "l")
      updateUserLocation();
    else if (key === "n") {
      if (settings.show.navionicsDetails && settings.tiles.enabled.navionics) {
        navionicsDetailsToggle.click();
        navionicsToggle.click();
      } else if (settings.tiles.enabled.navionics)
        navionicsDetailsToggle.click();
      else
        navionicsToggle.click();
    } else if (key === "v")
      vfdensityToggle.click();
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
    const { clientX, clientY } = event;
    position.xyz = {
      x: Math.round(position.x * tileSize + (mouse.x - clientX)) / tileSize,
      y: Math.round(position.y * tileSize + (mouse.y - clientY)) / tileSize
    };
    needRedraw = true;
  }
  if (needRedraw) {
    redraw(type);
  }
};

// src/client/events/onmouse.ts
var onmouse = (event) => {
  if (!(event.target instanceof HTMLBodyElement))
    return;
  const { clientX, clientY } = event;
  if (mouse.down.state) {
    if (mouse.x !== clientX || mouse.y !== clientY)
      oninput(event);
  }
  const isDown = Boolean(event.buttons & 1);
  if (isDown && !mouse.down.state) {
    mouse.down.x = clientX;
    mouse.down.y = clientY;
  }
  if (!isDown && mouse.down.state) {
    if (mouse.down.x === clientX && mouse.down.y === clientY) {
      const { height, width } = boundingRect;
      const { x: x2, y: y3, z: z2 } = position;
      navionicsDetails.fetch({
        x: x2 + (mouse.x - width / 2) / tileSize,
        y: y3 + (mouse.y - height / 2) / tileSize,
        z: z2
      });
    } else
      navionicsDetails.fetch(position);
  }
  mouse.down.state = isDown;
  mouse.x = clientX;
  mouse.y = clientY;
  if (position.markers.delete("navionics"))
    redraw("delete navionics marker");
  updateInfoBox();
};

// src/client/index.ts
var {
  container: containerId = ""
} = Object.fromEntries(new URL(import.meta.url).searchParams.entries());
var container = document.getElementById(containerId) ?? createHTMLElement({ tag: "div" });
var boundingRect = new Size(container);
container.innerHTML = "";
container.append(mapContainer, overlayContainer, infoBox, menuContainer);
window.addEventListener("keydown", oninput);
window.addEventListener("wheel", oninput);
window.addEventListener("mousemove", onmouse);
window.addEventListener("mousedown", onmouse);
window.addEventListener("mouseup", onmouse);
window.addEventListener("resize", () => {
  boundingRect.refresh();
  redraw("resize");
});
redraw("initial");
export {
  boundingRect
};
//# sourceMappingURL=client.js.map
