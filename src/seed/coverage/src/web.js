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
if (! _$jscoverage['/web.js']) {
  _$jscoverage['/web.js'] = {};
  _$jscoverage['/web.js'].lineData = [];
  _$jscoverage['/web.js'].lineData[6] = 0;
  _$jscoverage['/web.js'].lineData[7] = 0;
  _$jscoverage['/web.js'].lineData[29] = 0;
  _$jscoverage['/web.js'].lineData[31] = 0;
  _$jscoverage['/web.js'].lineData[34] = 0;
  _$jscoverage['/web.js'].lineData[36] = 0;
  _$jscoverage['/web.js'].lineData[39] = 0;
  _$jscoverage['/web.js'].lineData[45] = 0;
  _$jscoverage['/web.js'].lineData[55] = 0;
  _$jscoverage['/web.js'].lineData[56] = 0;
  _$jscoverage['/web.js'].lineData[58] = 0;
  _$jscoverage['/web.js'].lineData[59] = 0;
  _$jscoverage['/web.js'].lineData[61] = 0;
  _$jscoverage['/web.js'].lineData[62] = 0;
  _$jscoverage['/web.js'].lineData[64] = 0;
  _$jscoverage['/web.js'].lineData[65] = 0;
  _$jscoverage['/web.js'].lineData[66] = 0;
  _$jscoverage['/web.js'].lineData[69] = 0;
  _$jscoverage['/web.js'].lineData[70] = 0;
  _$jscoverage['/web.js'].lineData[71] = 0;
  _$jscoverage['/web.js'].lineData[73] = 0;
  _$jscoverage['/web.js'].lineData[74] = 0;
  _$jscoverage['/web.js'].lineData[76] = 0;
  _$jscoverage['/web.js'].lineData[84] = 0;
  _$jscoverage['/web.js'].lineData[87] = 0;
  _$jscoverage['/web.js'].lineData[88] = 0;
  _$jscoverage['/web.js'].lineData[100] = 0;
  _$jscoverage['/web.js'].lineData[101] = 0;
  _$jscoverage['/web.js'].lineData[111] = 0;
  _$jscoverage['/web.js'].lineData[112] = 0;
  _$jscoverage['/web.js'].lineData[113] = 0;
  _$jscoverage['/web.js'].lineData[114] = 0;
  _$jscoverage['/web.js'].lineData[115] = 0;
  _$jscoverage['/web.js'].lineData[116] = 0;
  _$jscoverage['/web.js'].lineData[118] = 0;
  _$jscoverage['/web.js'].lineData[119] = 0;
  _$jscoverage['/web.js'].lineData[120] = 0;
  _$jscoverage['/web.js'].lineData[121] = 0;
  _$jscoverage['/web.js'].lineData[127] = 0;
  _$jscoverage['/web.js'].lineData[129] = 0;
  _$jscoverage['/web.js'].lineData[130] = 0;
  _$jscoverage['/web.js'].lineData[132] = 0;
  _$jscoverage['/web.js'].lineData[136] = 0;
  _$jscoverage['/web.js'].lineData[139] = 0;
  _$jscoverage['/web.js'].lineData[140] = 0;
  _$jscoverage['/web.js'].lineData[141] = 0;
  _$jscoverage['/web.js'].lineData[145] = 0;
  _$jscoverage['/web.js'].lineData[148] = 0;
  _$jscoverage['/web.js'].lineData[149] = 0;
  _$jscoverage['/web.js'].lineData[150] = 0;
  _$jscoverage['/web.js'].lineData[151] = 0;
  _$jscoverage['/web.js'].lineData[154] = 0;
  _$jscoverage['/web.js'].lineData[158] = 0;
  _$jscoverage['/web.js'].lineData[159] = 0;
  _$jscoverage['/web.js'].lineData[160] = 0;
  _$jscoverage['/web.js'].lineData[161] = 0;
  _$jscoverage['/web.js'].lineData[167] = 0;
  _$jscoverage['/web.js'].lineData[171] = 0;
  _$jscoverage['/web.js'].lineData[174] = 0;
  _$jscoverage['/web.js'].lineData[175] = 0;
  _$jscoverage['/web.js'].lineData[177] = 0;
  _$jscoverage['/web.js'].lineData[181] = 0;
  _$jscoverage['/web.js'].lineData[182] = 0;
  _$jscoverage['/web.js'].lineData[183] = 0;
  _$jscoverage['/web.js'].lineData[185] = 0;
  _$jscoverage['/web.js'].lineData[186] = 0;
  _$jscoverage['/web.js'].lineData[188] = 0;
  _$jscoverage['/web.js'].lineData[191] = 0;
  _$jscoverage['/web.js'].lineData[197] = 0;
  _$jscoverage['/web.js'].lineData[198] = 0;
  _$jscoverage['/web.js'].lineData[205] = 0;
  _$jscoverage['/web.js'].lineData[207] = 0;
  _$jscoverage['/web.js'].lineData[208] = 0;
  _$jscoverage['/web.js'].lineData[209] = 0;
}
if (! _$jscoverage['/web.js'].functionData) {
  _$jscoverage['/web.js'].functionData = [];
  _$jscoverage['/web.js'].functionData[0] = 0;
  _$jscoverage['/web.js'].functionData[1] = 0;
  _$jscoverage['/web.js'].functionData[2] = 0;
  _$jscoverage['/web.js'].functionData[3] = 0;
  _$jscoverage['/web.js'].functionData[4] = 0;
  _$jscoverage['/web.js'].functionData[5] = 0;
  _$jscoverage['/web.js'].functionData[6] = 0;
  _$jscoverage['/web.js'].functionData[7] = 0;
  _$jscoverage['/web.js'].functionData[8] = 0;
  _$jscoverage['/web.js'].functionData[9] = 0;
  _$jscoverage['/web.js'].functionData[10] = 0;
  _$jscoverage['/web.js'].functionData[11] = 0;
  _$jscoverage['/web.js'].functionData[12] = 0;
  _$jscoverage['/web.js'].functionData[13] = 0;
  _$jscoverage['/web.js'].functionData[14] = 0;
  _$jscoverage['/web.js'].functionData[15] = 0;
  _$jscoverage['/web.js'].functionData[16] = 0;
}
if (! _$jscoverage['/web.js'].branchData) {
  _$jscoverage['/web.js'].branchData = {};
  _$jscoverage['/web.js'].branchData['11'] = [];
  _$jscoverage['/web.js'].branchData['11'][1] = new BranchData();
  _$jscoverage['/web.js'].branchData['23'] = [];
  _$jscoverage['/web.js'].branchData['23'][1] = new BranchData();
  _$jscoverage['/web.js'].branchData['45'] = [];
  _$jscoverage['/web.js'].branchData['45'][1] = new BranchData();
  _$jscoverage['/web.js'].branchData['45'][2] = new BranchData();
  _$jscoverage['/web.js'].branchData['45'][3] = new BranchData();
  _$jscoverage['/web.js'].branchData['55'] = [];
  _$jscoverage['/web.js'].branchData['55'][1] = new BranchData();
  _$jscoverage['/web.js'].branchData['61'] = [];
  _$jscoverage['/web.js'].branchData['61'][1] = new BranchData();
  _$jscoverage['/web.js'].branchData['73'] = [];
  _$jscoverage['/web.js'].branchData['73'][1] = new BranchData();
  _$jscoverage['/web.js'].branchData['73'][2] = new BranchData();
  _$jscoverage['/web.js'].branchData['84'] = [];
  _$jscoverage['/web.js'].branchData['84'][1] = new BranchData();
  _$jscoverage['/web.js'].branchData['87'] = [];
  _$jscoverage['/web.js'].branchData['87'][1] = new BranchData();
  _$jscoverage['/web.js'].branchData['114'] = [];
  _$jscoverage['/web.js'].branchData['114'][1] = new BranchData();
  _$jscoverage['/web.js'].branchData['119'] = [];
  _$jscoverage['/web.js'].branchData['119'][1] = new BranchData();
  _$jscoverage['/web.js'].branchData['129'] = [];
  _$jscoverage['/web.js'].branchData['129'][1] = new BranchData();
  _$jscoverage['/web.js'].branchData['139'] = [];
  _$jscoverage['/web.js'].branchData['139'][1] = new BranchData();
  _$jscoverage['/web.js'].branchData['139'][2] = new BranchData();
  _$jscoverage['/web.js'].branchData['148'] = [];
  _$jscoverage['/web.js'].branchData['148'][1] = new BranchData();
  _$jscoverage['/web.js'].branchData['159'] = [];
  _$jscoverage['/web.js'].branchData['159'][1] = new BranchData();
  _$jscoverage['/web.js'].branchData['172'] = [];
  _$jscoverage['/web.js'].branchData['172'][1] = new BranchData();
  _$jscoverage['/web.js'].branchData['175'] = [];
  _$jscoverage['/web.js'].branchData['175'][1] = new BranchData();
  _$jscoverage['/web.js'].branchData['181'] = [];
  _$jscoverage['/web.js'].branchData['181'][1] = new BranchData();
  _$jscoverage['/web.js'].branchData['197'] = [];
  _$jscoverage['/web.js'].branchData['197'][1] = new BranchData();
  _$jscoverage['/web.js'].branchData['197'][2] = new BranchData();
  _$jscoverage['/web.js'].branchData['197'][3] = new BranchData();
  _$jscoverage['/web.js'].branchData['207'] = [];
  _$jscoverage['/web.js'].branchData['207'][1] = new BranchData();
}
_$jscoverage['/web.js'].branchData['207'][1].init(6949, 5, 'UA.ie');
function visit686_207_1(result) {
  _$jscoverage['/web.js'].branchData['207'][1].ranCondition(result);
  return result;
}_$jscoverage['/web.js'].branchData['197'][3].init(6658, 24, 'location.search || EMPTY');
function visit685_197_3(result) {
  _$jscoverage['/web.js'].branchData['197'][3].ranCondition(result);
  return result;
}_$jscoverage['/web.js'].branchData['197'][2].init(6658, 52, '(location.search || EMPTY).indexOf(\'ks-debug\') !== -1');
function visit684_197_2(result) {
  _$jscoverage['/web.js'].branchData['197'][2].ranCondition(result);
  return result;
}_$jscoverage['/web.js'].branchData['197'][1].init(6645, 65, 'location && (location.search || EMPTY).indexOf(\'ks-debug\') !== -1');
function visit683_197_1(result) {
  _$jscoverage['/web.js'].branchData['197'][1].ranCondition(result);
  return result;
}_$jscoverage['/web.js'].branchData['181'][1].init(934, 20, 'doScroll && notframe');
function visit682_181_1(result) {
  _$jscoverage['/web.js'].branchData['181'][1].ranCondition(result);
  return result;
}_$jscoverage['/web.js'].branchData['175'][1].init(30, 28, 'win[\'frameElement\'] === null');
function visit681_175_1(result) {
  _$jscoverage['/web.js'].branchData['175'][1].ranCondition(result);
  return result;
}_$jscoverage['/web.js'].branchData['172'][1].init(41, 27, 'docElem && docElem.doScroll');
function visit680_172_1(result) {
  _$jscoverage['/web.js'].branchData['172'][1].ranCondition(result);
  return result;
}_$jscoverage['/web.js'].branchData['159'][1].init(22, 27, 'doc.readyState === COMPLETE');
function visit679_159_1(result) {
  _$jscoverage['/web.js'].branchData['159'][1].ranCondition(result);
  return result;
}_$jscoverage['/web.js'].branchData['148'][1].init(373, 18, 'standardEventModel');
function visit678_148_1(result) {
  _$jscoverage['/web.js'].branchData['148'][1].ranCondition(result);
  return result;
}_$jscoverage['/web.js'].branchData['139'][2].init(128, 27, 'doc.readyState === COMPLETE');
function visit677_139_2(result) {
  _$jscoverage['/web.js'].branchData['139'][2].ranCondition(result);
  return result;
}_$jscoverage['/web.js'].branchData['139'][1].init(120, 35, '!doc || doc.readyState === COMPLETE');
function visit676_139_1(result) {
  _$jscoverage['/web.js'].branchData['139'][1].ranCondition(result);
  return result;
}_$jscoverage['/web.js'].branchData['129'][1].init(33, 17, 'doc && !UA.nodejs');
function visit675_129_1(result) {
  _$jscoverage['/web.js'].branchData['129'][1].ranCondition(result);
  return result;
}_$jscoverage['/web.js'].branchData['119'][1].init(211, 4, 'node');
function visit674_119_1(result) {
  _$jscoverage['/web.js'].branchData['119'][1].ranCondition(result);
  return result;
}_$jscoverage['/web.js'].branchData['114'][1].init(22, 27, '++retryCount > POLL_RETIRES');
function visit673_114_1(result) {
  _$jscoverage['/web.js'].branchData['114'][1].ranCondition(result);
  return result;
}_$jscoverage['/web.js'].branchData['87'][1].init(-1, 106, 'win.execScript || function(data) {\n  win[\'eval\'].call(win, data);\n}');
function visit672_87_1(result) {
  _$jscoverage['/web.js'].branchData['87'][1].ranCondition(result);
  return result;
}_$jscoverage['/web.js'].branchData['84'][1].init(18, 36, 'data && RE_NOT_WHITESPACE.test(data)');
function visit671_84_1(result) {
  _$jscoverage['/web.js'].branchData['84'][1].ranCondition(result);
  return result;
}_$jscoverage['/web.js'].branchData['73'][2].init(689, 70, '!xml.documentElement || xml.getElementsByTagName(\'parsererror\').length');
function visit670_73_2(result) {
  _$jscoverage['/web.js'].branchData['73'][2].ranCondition(result);
  return result;
}_$jscoverage['/web.js'].branchData['73'][1].init(681, 78, '!xml || !xml.documentElement || xml.getElementsByTagName(\'parsererror\').length');
function visit669_73_1(result) {
  _$jscoverage['/web.js'].branchData['73'][1].ranCondition(result);
  return result;
}_$jscoverage['/web.js'].branchData['61'][1].init(51, 16, 'win[\'DOMParser\']');
function visit668_61_1(result) {
  _$jscoverage['/web.js'].branchData['61'][1].ranCondition(result);
  return result;
}_$jscoverage['/web.js'].branchData['55'][1].init(48, 20, 'data.documentElement');
function visit667_55_1(result) {
  _$jscoverage['/web.js'].branchData['55'][1].ranCondition(result);
  return result;
}_$jscoverage['/web.js'].branchData['45'][3].init(36, 17, 'obj == obj.window');
function visit666_45_3(result) {
  _$jscoverage['/web.js'].branchData['45'][3].ranCondition(result);
  return result;
}_$jscoverage['/web.js'].branchData['45'][2].init(21, 11, 'obj != null');
function visit665_45_2(result) {
  _$jscoverage['/web.js'].branchData['45'][2].ranCondition(result);
  return result;
}_$jscoverage['/web.js'].branchData['45'][1].init(21, 32, 'obj != null && obj == obj.window');
function visit664_45_1(result) {
  _$jscoverage['/web.js'].branchData['45'][1].ranCondition(result);
  return result;
}_$jscoverage['/web.js'].branchData['23'][1].init(554, 27, 'doc && doc.addEventListener');
function visit663_23_1(result) {
  _$jscoverage['/web.js'].branchData['23'][1].ranCondition(result);
  return result;
}_$jscoverage['/web.js'].branchData['11'][1].init(132, 26, 'doc && doc.documentElement');
function visit662_11_1(result) {
  _$jscoverage['/web.js'].branchData['11'][1].ranCondition(result);
  return result;
}_$jscoverage['/web.js'].lineData[6]++;
(function(S, undefined) {
  _$jscoverage['/web.js'].functionData[0]++;
  _$jscoverage['/web.js'].lineData[7]++;
  var win = S.Env.host, logger = S.getLogger('s/web'), UA = S.UA, doc = win['document'], docElem = visit662_11_1(doc && doc.documentElement), location = win.location, EMPTY = '', readyDefer = new S.Defer(), readyPromise = readyDefer.promise, POLL_RETIRES = 500, POLL_INTERVAL = 40, RE_ID_STR = /^#?([\w-]+)$/, RE_NOT_WHITESPACE = /\S/, standardEventModel = !!(visit663_23_1(doc && doc.addEventListener)), DOM_READY_EVENT = 'DOMContentLoaded', READY_STATE_CHANGE_EVENT = 'readystatechange', LOAD_EVENT = 'load', COMPLETE = 'complete', addEventListener = standardEventModel ? function(el, type, fn) {
  _$jscoverage['/web.js'].functionData[1]++;
  _$jscoverage['/web.js'].lineData[29]++;
  el.addEventListener(type, fn, false);
} : function(el, type, fn) {
  _$jscoverage['/web.js'].functionData[2]++;
  _$jscoverage['/web.js'].lineData[31]++;
  el.attachEvent('on' + type, fn);
}, removeEventListener = standardEventModel ? function(el, type, fn) {
  _$jscoverage['/web.js'].functionData[3]++;
  _$jscoverage['/web.js'].lineData[34]++;
  el.removeEventListener(type, fn, false);
} : function(el, type, fn) {
  _$jscoverage['/web.js'].functionData[4]++;
  _$jscoverage['/web.js'].lineData[36]++;
  el.detachEvent('on' + type, fn);
};
  _$jscoverage['/web.js'].lineData[39]++;
  S.mix(S, {
  isWindow: function(obj) {
  _$jscoverage['/web.js'].functionData[5]++;
  _$jscoverage['/web.js'].lineData[45]++;
  return visit664_45_1(visit665_45_2(obj != null) && visit666_45_3(obj == obj.window));
}, 
  parseXML: function(data) {
  _$jscoverage['/web.js'].functionData[6]++;
  _$jscoverage['/web.js'].lineData[55]++;
  if (visit667_55_1(data.documentElement)) {
    _$jscoverage['/web.js'].lineData[56]++;
    return data;
  }
  _$jscoverage['/web.js'].lineData[58]++;
  var xml;
  _$jscoverage['/web.js'].lineData[59]++;
  try {
    _$jscoverage['/web.js'].lineData[61]++;
    if (visit668_61_1(win['DOMParser'])) {
      _$jscoverage['/web.js'].lineData[62]++;
      xml = new DOMParser().parseFromString(data, 'text/xml');
    } else {
      _$jscoverage['/web.js'].lineData[64]++;
      xml = new ActiveXObject('Microsoft.XMLDOM');
      _$jscoverage['/web.js'].lineData[65]++;
      xml.async = false;
      _$jscoverage['/web.js'].lineData[66]++;
      xml.loadXML(data);
    }
  }  catch (e) {
  _$jscoverage['/web.js'].lineData[69]++;
  logger.error('parseXML error :');
  _$jscoverage['/web.js'].lineData[70]++;
  logger.error(e);
  _$jscoverage['/web.js'].lineData[71]++;
  xml = undefined;
}
  _$jscoverage['/web.js'].lineData[73]++;
  if (visit669_73_1(!xml || visit670_73_2(!xml.documentElement || xml.getElementsByTagName('parsererror').length))) {
    _$jscoverage['/web.js'].lineData[74]++;
    S.error('Invalid XML: ' + data);
  }
  _$jscoverage['/web.js'].lineData[76]++;
  return xml;
}, 
  globalEval: function(data) {
  _$jscoverage['/web.js'].functionData[7]++;
  _$jscoverage['/web.js'].lineData[84]++;
  if (visit671_84_1(data && RE_NOT_WHITESPACE.test(data))) {
    _$jscoverage['/web.js'].lineData[87]++;
    (visit672_87_1(win.execScript || function(data) {
  _$jscoverage['/web.js'].functionData[8]++;
  _$jscoverage['/web.js'].lineData[88]++;
  win['eval'].call(win, data);
}))(data);
  }
}, 
  ready: function(fn) {
  _$jscoverage['/web.js'].functionData[9]++;
  _$jscoverage['/web.js'].lineData[100]++;
  readyPromise.done(fn);
  _$jscoverage['/web.js'].lineData[101]++;
  return this;
}, 
  available: function(id, fn) {
  _$jscoverage['/web.js'].functionData[10]++;
  _$jscoverage['/web.js'].lineData[111]++;
  id = (id + EMPTY).match(RE_ID_STR)[1];
  _$jscoverage['/web.js'].lineData[112]++;
  var retryCount = 1;
  _$jscoverage['/web.js'].lineData[113]++;
  var timer = S.later(function() {
  _$jscoverage['/web.js'].functionData[11]++;
  _$jscoverage['/web.js'].lineData[114]++;
  if (visit673_114_1(++retryCount > POLL_RETIRES)) {
    _$jscoverage['/web.js'].lineData[115]++;
    timer.cancel();
    _$jscoverage['/web.js'].lineData[116]++;
    return;
  }
  _$jscoverage['/web.js'].lineData[118]++;
  var node = doc.getElementById(id);
  _$jscoverage['/web.js'].lineData[119]++;
  if (visit674_119_1(node)) {
    _$jscoverage['/web.js'].lineData[120]++;
    fn(node);
    _$jscoverage['/web.js'].lineData[121]++;
    timer.cancel();
  }
}, POLL_INTERVAL, true);
}});
  _$jscoverage['/web.js'].lineData[127]++;
  function fireReady() {
    _$jscoverage['/web.js'].functionData[12]++;
    _$jscoverage['/web.js'].lineData[129]++;
    if (visit675_129_1(doc && !UA.nodejs)) {
      _$jscoverage['/web.js'].lineData[130]++;
      removeEventListener(win, LOAD_EVENT, fireReady);
    }
    _$jscoverage['/web.js'].lineData[132]++;
    readyDefer.resolve(S);
  }
  _$jscoverage['/web.js'].lineData[136]++;
  function bindReady() {
    _$jscoverage['/web.js'].functionData[13]++;
    _$jscoverage['/web.js'].lineData[139]++;
    if (visit676_139_1(!doc || visit677_139_2(doc.readyState === COMPLETE))) {
      _$jscoverage['/web.js'].lineData[140]++;
      fireReady();
      _$jscoverage['/web.js'].lineData[141]++;
      return;
    }
    _$jscoverage['/web.js'].lineData[145]++;
    addEventListener(win, LOAD_EVENT, fireReady);
    _$jscoverage['/web.js'].lineData[148]++;
    if (visit678_148_1(standardEventModel)) {
      _$jscoverage['/web.js'].lineData[149]++;
      var domReady = function() {
  _$jscoverage['/web.js'].functionData[14]++;
  _$jscoverage['/web.js'].lineData[150]++;
  removeEventListener(doc, DOM_READY_EVENT, domReady);
  _$jscoverage['/web.js'].lineData[151]++;
  fireReady();
};
      _$jscoverage['/web.js'].lineData[154]++;
      addEventListener(doc, DOM_READY_EVENT, domReady);
    } else {
      _$jscoverage['/web.js'].lineData[158]++;
      var stateChange = function() {
  _$jscoverage['/web.js'].functionData[15]++;
  _$jscoverage['/web.js'].lineData[159]++;
  if (visit679_159_1(doc.readyState === COMPLETE)) {
    _$jscoverage['/web.js'].lineData[160]++;
    removeEventListener(doc, READY_STATE_CHANGE_EVENT, stateChange);
    _$jscoverage['/web.js'].lineData[161]++;
    fireReady();
  }
};
      _$jscoverage['/web.js'].lineData[167]++;
      addEventListener(doc, READY_STATE_CHANGE_EVENT, stateChange);
      _$jscoverage['/web.js'].lineData[171]++;
      var notframe, doScroll = visit680_172_1(docElem && docElem.doScroll);
      _$jscoverage['/web.js'].lineData[174]++;
      try {
        _$jscoverage['/web.js'].lineData[175]++;
        notframe = (visit681_175_1(win['frameElement'] === null));
      }      catch (e) {
  _$jscoverage['/web.js'].lineData[177]++;
  notframe = false;
}
      _$jscoverage['/web.js'].lineData[181]++;
      if (visit682_181_1(doScroll && notframe)) {
        _$jscoverage['/web.js'].lineData[182]++;
        var readyScroll = function() {
  _$jscoverage['/web.js'].functionData[16]++;
  _$jscoverage['/web.js'].lineData[183]++;
  try {
    _$jscoverage['/web.js'].lineData[185]++;
    doScroll('left');
    _$jscoverage['/web.js'].lineData[186]++;
    fireReady();
  }  catch (ex) {
  _$jscoverage['/web.js'].lineData[188]++;
  setTimeout(readyScroll, POLL_INTERVAL);
}
};
        _$jscoverage['/web.js'].lineData[191]++;
        readyScroll();
      }
    }
  }
  _$jscoverage['/web.js'].lineData[197]++;
  if (visit683_197_1(location && visit684_197_2((visit685_197_3(location.search || EMPTY)).indexOf('ks-debug') !== -1))) {
    _$jscoverage['/web.js'].lineData[198]++;
    S.Config.debug = true;
  }
  _$jscoverage['/web.js'].lineData[205]++;
  bindReady();
  _$jscoverage['/web.js'].lineData[207]++;
  if (visit686_207_1(UA.ie)) {
    _$jscoverage['/web.js'].lineData[208]++;
    try {
      _$jscoverage['/web.js'].lineData[209]++;
      doc.execCommand('BackgroundImageCache', false, true);
    }    catch (e) {
}
  }
})(KISSY, undefined);
