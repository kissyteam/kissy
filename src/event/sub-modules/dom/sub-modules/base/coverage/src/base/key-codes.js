function BranchData() {
    this.position = -1;
    this.nodeLength = -1;
    this.src = null;
    this.evalFalse = 0;
    this.evalTrue = 0;

    this.init = function(position, nodeLength, src) {
        this.position = position;
        this.nodeLength = nodeLength;
        this.src = src;
        return this;
    }

    this.ranCondition = function(result) {
        if (result)
            this.evalTrue++;
        else
            this.evalFalse++;
    };

    this.pathsCovered = function() {
        var paths = 0;
        if (this.evalTrue > 0)
          paths++;
        if (this.evalFalse > 0)
          paths++;
        return paths;
    };

    this.covered = function() {
        return this.evalTrue > 0 && this.evalFalse > 0;
    };

    this.toJSON = function() {
        return '{"position":' + this.position
            + ',"nodeLength":' + this.nodeLength
            + ',"src":' + jscoverage_quote(this.src)
            + ',"evalFalse":' + this.evalFalse
            + ',"evalTrue":' + this.evalTrue + '}';
    };

    this.message = function() {
        if (this.evalTrue === 0 && this.evalFalse === 0)
            return 'Condition never evaluated         :\t' + this.src;
        else if (this.evalTrue === 0)
            return 'Condition never evaluated to true :\t' + this.src;
        else if (this.evalFalse === 0)
            return 'Condition never evaluated to false:\t' + this.src;
        else
            return 'Condition covered';
    };
}

BranchData.fromJson = function(jsonString) {
    var json = eval('(' + jsonString + ')');
    var branchData = new BranchData();
    branchData.init(json.position, json.nodeLength, json.src);
    branchData.evalFalse = json.evalFalse;
    branchData.evalTrue = json.evalTrue;
    return branchData;
};

BranchData.fromJsonObject = function(json) {
    var branchData = new BranchData();
    branchData.init(json.position, json.nodeLength, json.src);
    branchData.evalFalse = json.evalFalse;
    branchData.evalTrue = json.evalTrue;
    return branchData;
};

function buildBranchMessage(conditions) {
    var message = 'The following was not covered:';
    for (var i = 0; i < conditions.length; i++) {
        if (conditions[i] !== undefined && conditions[i] !== null && !conditions[i].covered())
          message += '\n- '+ conditions[i].message();
    }
    return message;
};

function convertBranchDataConditionArrayToJSON(branchDataConditionArray) {
    var array = [];
    var length = branchDataConditionArray.length;
    for (var condition = 0; condition < length; condition++) {
        var branchDataObject = branchDataConditionArray[condition];
        if (branchDataObject === undefined || branchDataObject === null) {
            value = 'null';
        } else {
            value = branchDataObject.toJSON();
        }
        array.push(value);
    }
    return '[' + array.join(',') + ']';
}

function convertBranchDataLinesToJSON(branchData) {
    if (branchData === undefined) {
        return '{}'
    }
    var json = '';
    for (var line in branchData) {
        if (json !== '')
            json += ','
        json += '"' + line + '":' + convertBranchDataConditionArrayToJSON(branchData[line]);
    }
    return '{' + json + '}';
}

function convertBranchDataLinesFromJSON(jsonObject) {
    if (jsonObject === undefined) {
        return {};
    }
    for (var line in jsonObject) {
        var branchDataJSON = jsonObject[line];
        if (branchDataJSON !== null) {
            for (var conditionIndex = 0; conditionIndex < branchDataJSON.length; conditionIndex ++) {
                var condition = branchDataJSON[conditionIndex];
                if (condition !== null) {
                    branchDataJSON[conditionIndex] = BranchData.fromJsonObject(condition);
                }
            }
        }
    }
    return jsonObject;
}
function jscoverage_quote(s) {
    return '"' + s.replace(/[\u0000-\u001f"\\\u007f-\uffff]/g, function (c) {
        switch (c) {
            case '\b':
                return '\\b';
            case '\f':
                return '\\f';
            case '\n':
                return '\\n';
            case '\r':
                return '\\r';
            case '\t':
                return '\\t';
            // IE doesn't support this
            /*
             case '\v':
             return '\\v';
             */
            case '"':
                return '\\"';
            case '\\':
                return '\\\\';
            default:
                return '\\u' + jscoverage_pad(c.charCodeAt(0).toString(16));
        }
    }) + '"';
}

function getArrayJSON(coverage) {
    var array = [];
    if (coverage === undefined)
        return array;

    var length = coverage.length;
    for (var line = 0; line < length; line++) {
        var value = coverage[line];
        if (value === undefined || value === null) {
            value = 'null';
        }
        array.push(value);
    }
    return array;
}

function jscoverage_serializeCoverageToJSON() {
    var json = [];
    for (var file in _$jscoverage) {
        var lineArray = getArrayJSON(_$jscoverage[file].lineData);
        var fnArray = getArrayJSON(_$jscoverage[file].functionData);

        json.push(jscoverage_quote(file) + ':{"lineData":[' + lineArray.join(',') + '],"functionData":[' + fnArray.join(',') + '],"branchData":' + convertBranchDataLinesToJSON(_$jscoverage[file].branchData) + '}');
    }
    return '{' + json.join(',') + '}';
}


function jscoverage_pad(s) {
    return '0000'.substr(s.length) + s;
}

function jscoverage_html_escape(s) {
    return s.replace(/[<>\&\"\']/g, function (c) {
        return '&#' + c.charCodeAt(0) + ';';
    });
}
try {
  if (typeof top === 'object' && top !== null && typeof top.opener === 'object' && top.opener !== null) {
    // this is a browser window that was opened from another window

    if (! top.opener._$jscoverage) {
      top.opener._$jscoverage = {};
    }
  }
}
catch (e) {}

try {
  if (typeof top === 'object' && top !== null) {
    // this is a browser window

    try {
      if (typeof top.opener === 'object' && top.opener !== null && top.opener._$jscoverage) {
        top._$jscoverage = top.opener._$jscoverage;
      }
    }
    catch (e) {}

    if (! top._$jscoverage) {
      top._$jscoverage = {};
    }
  }
}
catch (e) {}

try {
  if (typeof top === 'object' && top !== null && top._$jscoverage) {
    this._$jscoverage = top._$jscoverage;
  }
}
catch (e) {}
if (! this._$jscoverage) {
  this._$jscoverage = {};
}
if (! _$jscoverage['/base/key-codes.js']) {
  _$jscoverage['/base/key-codes.js'] = {};
  _$jscoverage['/base/key-codes.js'].lineData = [];
  _$jscoverage['/base/key-codes.js'].lineData[6] = 0;
  _$jscoverage['/base/key-codes.js'].lineData[11] = 0;
  _$jscoverage['/base/key-codes.js'].lineData[440] = 0;
  _$jscoverage['/base/key-codes.js'].lineData[441] = 0;
  _$jscoverage['/base/key-codes.js'].lineData[446] = 0;
  _$jscoverage['/base/key-codes.js'].lineData[451] = 0;
  _$jscoverage['/base/key-codes.js'].lineData[475] = 0;
  _$jscoverage['/base/key-codes.js'].lineData[477] = 0;
  _$jscoverage['/base/key-codes.js'].lineData[486] = 0;
  _$jscoverage['/base/key-codes.js'].lineData[487] = 0;
  _$jscoverage['/base/key-codes.js'].lineData[489] = 0;
  _$jscoverage['/base/key-codes.js'].lineData[492] = 0;
  _$jscoverage['/base/key-codes.js'].lineData[494] = 0;
  _$jscoverage['/base/key-codes.js'].lineData[497] = 0;
  _$jscoverage['/base/key-codes.js'].lineData[499] = 0;
  _$jscoverage['/base/key-codes.js'].lineData[503] = 0;
  _$jscoverage['/base/key-codes.js'].lineData[504] = 0;
  _$jscoverage['/base/key-codes.js'].lineData[507] = 0;
  _$jscoverage['/base/key-codes.js'].lineData[525] = 0;
  _$jscoverage['/base/key-codes.js'].lineData[527] = 0;
  _$jscoverage['/base/key-codes.js'].lineData[531] = 0;
}
if (! _$jscoverage['/base/key-codes.js'].functionData) {
  _$jscoverage['/base/key-codes.js'].functionData = [];
  _$jscoverage['/base/key-codes.js'].functionData[0] = 0;
  _$jscoverage['/base/key-codes.js'].functionData[1] = 0;
  _$jscoverage['/base/key-codes.js'].functionData[2] = 0;
}
if (! _$jscoverage['/base/key-codes.js'].branchData) {
  _$jscoverage['/base/key-codes.js'].branchData = {};
  _$jscoverage['/base/key-codes.js'].branchData['441'] = [];
  _$jscoverage['/base/key-codes.js'].branchData['441'][1] = new BranchData();
  _$jscoverage['/base/key-codes.js'].branchData['441'][2] = new BranchData();
  _$jscoverage['/base/key-codes.js'].branchData['442'] = [];
  _$jscoverage['/base/key-codes.js'].branchData['442'][1] = new BranchData();
  _$jscoverage['/base/key-codes.js'].branchData['444'] = [];
  _$jscoverage['/base/key-codes.js'].branchData['444'][1] = new BranchData();
  _$jscoverage['/base/key-codes.js'].branchData['444'][2] = new BranchData();
  _$jscoverage['/base/key-codes.js'].branchData['445'] = [];
  _$jscoverage['/base/key-codes.js'].branchData['445'][1] = new BranchData();
  _$jscoverage['/base/key-codes.js'].branchData['487'] = [];
  _$jscoverage['/base/key-codes.js'].branchData['487'][1] = new BranchData();
  _$jscoverage['/base/key-codes.js'].branchData['487'][2] = new BranchData();
  _$jscoverage['/base/key-codes.js'].branchData['488'] = [];
  _$jscoverage['/base/key-codes.js'].branchData['488'][1] = new BranchData();
  _$jscoverage['/base/key-codes.js'].branchData['492'] = [];
  _$jscoverage['/base/key-codes.js'].branchData['492'][1] = new BranchData();
  _$jscoverage['/base/key-codes.js'].branchData['492'][2] = new BranchData();
  _$jscoverage['/base/key-codes.js'].branchData['493'] = [];
  _$jscoverage['/base/key-codes.js'].branchData['493'][1] = new BranchData();
  _$jscoverage['/base/key-codes.js'].branchData['497'] = [];
  _$jscoverage['/base/key-codes.js'].branchData['497'][1] = new BranchData();
  _$jscoverage['/base/key-codes.js'].branchData['497'][2] = new BranchData();
  _$jscoverage['/base/key-codes.js'].branchData['498'] = [];
  _$jscoverage['/base/key-codes.js'].branchData['498'][1] = new BranchData();
  _$jscoverage['/base/key-codes.js'].branchData['503'] = [];
  _$jscoverage['/base/key-codes.js'].branchData['503'][1] = new BranchData();
  _$jscoverage['/base/key-codes.js'].branchData['503'][2] = new BranchData();
}
_$jscoverage['/base/key-codes.js'].branchData['503'][2].init(455, 12, 'keyCode == 0');
function visit43_503_2(result) {
  _$jscoverage['/base/key-codes.js'].branchData['503'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/key-codes.js'].branchData['503'][1].init(442, 25, 'UA.webkit && keyCode == 0');
function visit42_503_1(result) {
  _$jscoverage['/base/key-codes.js'].branchData['503'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/key-codes.js'].branchData['498'][1].init(36, 20, 'keyCode <= KeyCode.Z');
function visit41_498_1(result) {
  _$jscoverage['/base/key-codes.js'].branchData['498'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/key-codes.js'].branchData['497'][2].init(264, 20, 'keyCode >= KeyCode.A');
function visit40_497_2(result) {
  _$jscoverage['/base/key-codes.js'].branchData['497'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/key-codes.js'].branchData['497'][1].init(264, 57, 'keyCode >= KeyCode.A && keyCode <= KeyCode.Z');
function visit39_497_1(result) {
  _$jscoverage['/base/key-codes.js'].branchData['497'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/key-codes.js'].branchData['493'][1].init(43, 31, 'keyCode <= KeyCode.NUM_MULTIPLY');
function visit38_493_1(result) {
  _$jscoverage['/base/key-codes.js'].branchData['493'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/key-codes.js'].branchData['492'][2].init(133, 27, 'keyCode >= KeyCode.NUM_ZERO');
function visit37_492_2(result) {
  _$jscoverage['/base/key-codes.js'].branchData['492'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/key-codes.js'].branchData['492'][1].init(133, 75, 'keyCode >= KeyCode.NUM_ZERO && keyCode <= KeyCode.NUM_MULTIPLY');
function visit36_492_1(result) {
  _$jscoverage['/base/key-codes.js'].branchData['492'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/key-codes.js'].branchData['488'][1].init(39, 23, 'keyCode <= KeyCode.NINE');
function visit35_488_1(result) {
  _$jscoverage['/base/key-codes.js'].branchData['488'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/key-codes.js'].branchData['487'][2].init(14, 23, 'keyCode >= KeyCode.ZERO');
function visit34_487_2(result) {
  _$jscoverage['/base/key-codes.js'].branchData['487'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/key-codes.js'].branchData['487'][1].init(14, 63, 'keyCode >= KeyCode.ZERO && keyCode <= KeyCode.NINE');
function visit33_487_1(result) {
  _$jscoverage['/base/key-codes.js'].branchData['487'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/key-codes.js'].branchData['445'][1].init(43, 24, 'e.keyCode <= KeyCode.F12');
function visit32_445_1(result) {
  _$jscoverage['/base/key-codes.js'].branchData['445'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/key-codes.js'].branchData['444'][2].init(132, 23, 'e.keyCode >= KeyCode.F1');
function visit31_444_2(result) {
  _$jscoverage['/base/key-codes.js'].branchData['444'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/key-codes.js'].branchData['444'][1].init(75, 68, 'e.keyCode >= KeyCode.F1 && e.keyCode <= KeyCode.F12');
function visit30_444_1(result) {
  _$jscoverage['/base/key-codes.js'].branchData['444'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/key-codes.js'].branchData['442'][1].init(38, 144, 'e.metaKey || e.keyCode >= KeyCode.F1 && e.keyCode <= KeyCode.F12');
function visit29_442_1(result) {
  _$jscoverage['/base/key-codes.js'].branchData['442'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/key-codes.js'].branchData['441'][2].init(14, 22, 'e.altKey && !e.ctrlKey');
function visit28_441_2(result) {
  _$jscoverage['/base/key-codes.js'].branchData['441'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/key-codes.js'].branchData['441'][1].init(14, 183, 'e.altKey && !e.ctrlKey || e.metaKey || e.keyCode >= KeyCode.F1 && e.keyCode <= KeyCode.F12');
function visit27_441_1(result) {
  _$jscoverage['/base/key-codes.js'].branchData['441'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/key-codes.js'].lineData[6]++;
KISSY.add('event/dom/base/key-codes', function(S) {
  _$jscoverage['/base/key-codes.js'].functionData[0]++;
  _$jscoverage['/base/key-codes.js'].lineData[11]++;
  var UA = S.UA, KeyCode = {
  MAC_ENTER: 3, 
  BACKSPACE: 8, 
  TAB: 9, 
  NUM_CENTER: 12, 
  ENTER: 13, 
  SHIFT: 16, 
  CTRL: 17, 
  ALT: 18, 
  PAUSE: 19, 
  CAPS_LOCK: 20, 
  ESC: 27, 
  SPACE: 32, 
  PAGE_UP: 33, 
  PAGE_DOWN: 34, 
  END: 35, 
  HOME: 36, 
  LEFT: 37, 
  UP: 38, 
  RIGHT: 39, 
  DOWN: 40, 
  PRINT_SCREEN: 44, 
  INSERT: 45, 
  DELETE: 46, 
  ZERO: 48, 
  ONE: 49, 
  TWO: 50, 
  THREE: 51, 
  FOUR: 52, 
  FIVE: 53, 
  SIX: 54, 
  SEVEN: 55, 
  EIGHT: 56, 
  NINE: 57, 
  QUESTION_MARK: 63, 
  A: 65, 
  B: 66, 
  C: 67, 
  D: 68, 
  E: 69, 
  F: 70, 
  G: 71, 
  H: 72, 
  I: 73, 
  J: 74, 
  K: 75, 
  L: 76, 
  M: 77, 
  N: 78, 
  O: 79, 
  P: 80, 
  Q: 81, 
  R: 82, 
  S: 83, 
  T: 84, 
  U: 85, 
  V: 86, 
  W: 87, 
  X: 88, 
  Y: 89, 
  Z: 90, 
  META: 91, 
  WIN_KEY_RIGHT: 92, 
  CONTEXT_MENU: 93, 
  NUM_ZERO: 96, 
  NUM_ONE: 97, 
  NUM_TWO: 98, 
  NUM_THREE: 99, 
  NUM_FOUR: 100, 
  NUM_FIVE: 101, 
  NUM_SIX: 102, 
  NUM_SEVEN: 103, 
  NUM_EIGHT: 104, 
  NUM_NINE: 105, 
  NUM_MULTIPLY: 106, 
  NUM_PLUS: 107, 
  NUM_MINUS: 109, 
  NUM_PERIOD: 110, 
  NUM_DIVISION: 111, 
  F1: 112, 
  F2: 113, 
  F3: 114, 
  F4: 115, 
  F5: 116, 
  F6: 117, 
  F7: 118, 
  F8: 119, 
  F9: 120, 
  F10: 121, 
  F11: 122, 
  F12: 123, 
  NUMLOCK: 144, 
  SEMICOLON: 186, 
  DASH: 189, 
  EQUALS: 187, 
  COMMA: 188, 
  PERIOD: 190, 
  SLASH: 191, 
  APOSTROPHE: 192, 
  SINGLE_QUOTE: 222, 
  OPEN_SQUARE_BRACKET: 219, 
  BACKSLASH: 220, 
  CLOSE_SQUARE_BRACKET: 221, 
  WIN_KEY: 224, 
  MAC_FF_META: 224, 
  WIN_IME: 229};
  _$jscoverage['/base/key-codes.js'].lineData[440]++;
  KeyCode.isTextModifyingKeyEvent = function(e) {
  _$jscoverage['/base/key-codes.js'].functionData[1]++;
  _$jscoverage['/base/key-codes.js'].lineData[441]++;
  if (visit27_441_1(visit28_441_2(e.altKey && !e.ctrlKey) || visit29_442_1(e.metaKey || visit30_444_1(visit31_444_2(e.keyCode >= KeyCode.F1) && visit32_445_1(e.keyCode <= KeyCode.F12))))) {
    _$jscoverage['/base/key-codes.js'].lineData[446]++;
    return false;
  }
  _$jscoverage['/base/key-codes.js'].lineData[451]++;
  switch (e.keyCode) {
    case KeyCode.ALT:
    case KeyCode.CAPS_LOCK:
    case KeyCode.CONTEXT_MENU:
    case KeyCode.CTRL:
    case KeyCode.DOWN:
    case KeyCode.END:
    case KeyCode.ESC:
    case KeyCode.HOME:
    case KeyCode.INSERT:
    case KeyCode.LEFT:
    case KeyCode.MAC_FF_META:
    case KeyCode.META:
    case KeyCode.NUMLOCK:
    case KeyCode.NUM_CENTER:
    case KeyCode.PAGE_DOWN:
    case KeyCode.PAGE_UP:
    case KeyCode.PAUSE:
    case KeyCode.PRINT_SCREEN:
    case KeyCode.RIGHT:
    case KeyCode.SHIFT:
    case KeyCode.UP:
    case KeyCode.WIN_KEY:
    case KeyCode.WIN_KEY_RIGHT:
      _$jscoverage['/base/key-codes.js'].lineData[475]++;
      return false;
    default:
      _$jscoverage['/base/key-codes.js'].lineData[477]++;
      return true;
  }
};
  _$jscoverage['/base/key-codes.js'].lineData[486]++;
  KeyCode.isCharacterKey = function(keyCode) {
  _$jscoverage['/base/key-codes.js'].functionData[2]++;
  _$jscoverage['/base/key-codes.js'].lineData[487]++;
  if (visit33_487_1(visit34_487_2(keyCode >= KeyCode.ZERO) && visit35_488_1(keyCode <= KeyCode.NINE))) {
    _$jscoverage['/base/key-codes.js'].lineData[489]++;
    return true;
  }
  _$jscoverage['/base/key-codes.js'].lineData[492]++;
  if (visit36_492_1(visit37_492_2(keyCode >= KeyCode.NUM_ZERO) && visit38_493_1(keyCode <= KeyCode.NUM_MULTIPLY))) {
    _$jscoverage['/base/key-codes.js'].lineData[494]++;
    return true;
  }
  _$jscoverage['/base/key-codes.js'].lineData[497]++;
  if (visit39_497_1(visit40_497_2(keyCode >= KeyCode.A) && visit41_498_1(keyCode <= KeyCode.Z))) {
    _$jscoverage['/base/key-codes.js'].lineData[499]++;
    return true;
  }
  _$jscoverage['/base/key-codes.js'].lineData[503]++;
  if (visit42_503_1(UA.webkit && visit43_503_2(keyCode == 0))) {
    _$jscoverage['/base/key-codes.js'].lineData[504]++;
    return true;
  }
  _$jscoverage['/base/key-codes.js'].lineData[507]++;
  switch (keyCode) {
    case KeyCode.SPACE:
    case KeyCode.QUESTION_MARK:
    case KeyCode.NUM_PLUS:
    case KeyCode.NUM_MINUS:
    case KeyCode.NUM_PERIOD:
    case KeyCode.NUM_DIVISION:
    case KeyCode.SEMICOLON:
    case KeyCode.DASH:
    case KeyCode.EQUALS:
    case KeyCode.COMMA:
    case KeyCode.PERIOD:
    case KeyCode.SLASH:
    case KeyCode.APOSTROPHE:
    case KeyCode.SINGLE_QUOTE:
    case KeyCode.OPEN_SQUARE_BRACKET:
    case KeyCode.BACKSLASH:
    case KeyCode.CLOSE_SQUARE_BRACKET:
      _$jscoverage['/base/key-codes.js'].lineData[525]++;
      return true;
    default:
      _$jscoverage['/base/key-codes.js'].lineData[527]++;
      return false;
  }
};
  _$jscoverage['/base/key-codes.js'].lineData[531]++;
  return KeyCode;
});
