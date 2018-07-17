(function(root, factory) {
  if (typeof define === "function" && define.amd) {
    define([], factory);
  } else if (typeof exports === "object") {
    module.exports = factory();
  } else {
    var textEncoding = factory();
    root.TextEncoder = textEncoding.TextEncoder;
    root.TextDecoder = textEncoding.TextDecoder;
  }
}(this, function() {
  "user strict";
  
  var scope = typeof GLOBAL !== "undefined" ? GLOBAL : window;
  if (typeof scope.TextEncoder !== "undefined" &&
  typeof scope.TextDecoder !== "undefined") {
    return {"TextEncoder": scope.TextEncoder, "TextDecoder": scope.TextDecoder};
  }

  var allowedEncodings = [
    "utf8",
    "utf-8",
    "unicode-1-1-utf-8"
  ];

  var TextEncoder = function TextEncoder(encoding) {
    if (allowedEncodings.indexOf(encoding) < 0 &&
    typeof encoding !== "undefined" && encoding != null) {
      throw new RangeError("Invalid encoding type. Only utf-8 is supported");
    }
  };
  // TEMP
  TextEncoder.prototype.test = function() {
    console.log("This is a homebrew TextEncoder");
  };
  // END TEMP
  TextEncoder.prototype.encode = function encode(str) {
    var len = str.length;
    var byteArray = new Uint8Array(len * 3);
    var position = -1;

    for (var point = 0, nextCode = 0, i = 0; i !== len;) {
      point = str.charCodeAt(i);
      i++;
      if (point >= 0xD800 && point <= 0xDBFF) {
        if (i == len) {
          byteArray[position += 1] = 0xef/*0b11101111*/;
          byteArray[position += 1] = 0xbf/*0b10111111*/;
          byteArray[position += 1] = 0xbd/*0b10111101*/;
          break;
        }

        nextCode = str.charCodeAt(i);
        if (nextCode >= 0xDC00 && nextCode <= 0xDFFF) {
          point = (point - 0xD800) * 0x400 + nextCode - 0xDC00 + 0x10000;
          i += 1;
          if (point > 0xffff) {
            byteArray[position += 1] = (0x1e/*0b11110*/<<3) | (point >>> 18);
            byteArray[position += 1] = (0x2/*0b10*/<<6) | ((point >>> 12) & 0x3f/*0b00111111*/);
            byteArray[position += 1] = (0x2/*0b10*/<<6) | ((point >>> 6) & 0x3f/*0b00111111*/);
            byteArray[position += 1] = (0x2/*0b10*/<<6) | (point & 0x3f/*0b00111111*/);
            continue;
          }
        } else {
          byteArray[position += 1] = 0xef/*0b11101111*/;
          byteArray[position += 1] = 0xbf/*0b10111111*/;
          byteArray[position += 1] = 0xbd/*0b10111101*/;
          continue;
        }
      }
      if (point <= 0x007f) {
        byteArray[position += 1] = (0x0/*0b0*/<<7) | point;
      } else if (point <= 0x07ff) {
        byteArray[position += 1] = (0x6/*0b110*/<<5) | (point>>>6);
        byteArray[position += 1] = (0x2/*0b10*/<<6)  | (point&0x3f/*0b00111111*/);
      } else {
        byteArray[position += 1] = (0xe/*0b1110*/<<4) | (point>>>12);
        byteArray[position += 1] = (0x2/*0b10*/<<6)    | ((point>>>6)&0x3f/*0b00111111*/);
        byteArray[position += 1] = (0x2/*0b10*/<<6)    | (point&0x3f/*0b00111111*/);
      }
    }
    byteArray = new Uint8Array(byteArray.buffer.slice(0, position + 1));
    return byteArray;
  };

  TextEncoder.prototype.toString = function() {
    return "[object TextEncoder]";
  };


  // ======================================================

  var TextDecoder = function TextDecoder(encoding) {
    if (allowedEncodings.indexOf(encoding) < 0 &&
    typeof encoding !== "undefined" && encoding != null) {
      throw new RangeError("Invalid encoding type. Only utf-8 is supported");
    }
  };

  TextDecoder.prototype.decode = function decode(input) {
    var byteArray;
    if (typeof input === "object" && input instanceof ArrayBuffer) {
      byteArray = new Uint8Array(input);
    } else {
      byteArray = new Uint8Array(0);
    }

    var length = byteArray.length;

    var genString = "";

    var i = 0;

    while (i < length) {
      var byte = byteArray[i];
      var bytesNeeded = 0;
      var codePoint = 0;
      if (byte <= 0x7F) {
        bytesNeeded = 0;
        codePoint = byte & 0xFF;
      } else if (byte <= 0xDF) {
        bytesNeeded = 1;
        codePoint = byte & 0x1F;
      } else if (byte <= 0xEF) {
        bytesNeeded = 2;
        codePoint = byte & 0x0F;
      } else if (byte <= 0xF4) {
        bytesNeeded = 3;
        codePoint = byte & 0x07;
      }
      if (length - i - bytesNeeded > 0) {
        var k = 0;
        while (k < bytesNeeded) {
          byte = byteArray[i + k + 1];
          codePoint = (codePoint << 6) | (byte & 0x3F);
          k += 1;
        }
      } else {
        codePoint = 0xFFFD;
        bytesNeeded = length - i;
      }
      genString += String.fromCodePoint(codePoint);
      i += bytesNeeded + 1;
    }

    return genString;
  };
  TextDecoder.prototype.toString = function() {
    return "[object TextDecoder]";
  };
}));
