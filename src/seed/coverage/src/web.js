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
  _$jscoverage['/web.js'].lineData[7] = 0;
  _$jscoverage['/web.js'].lineData[8] = 0;
  _$jscoverage['/web.js'].lineData[30] = 0;
  _$jscoverage['/web.js'].lineData[32] = 0;
  _$jscoverage['/web.js'].lineData[35] = 0;
  _$jscoverage['/web.js'].lineData[37] = 0;
  _$jscoverage['/web.js'].lineData[40] = 0;
  _$jscoverage['/web.js'].lineData[46] = 0;
  _$jscoverage['/web.js'].lineData[57] = 0;
  _$jscoverage['/web.js'].lineData[58] = 0;
  _$jscoverage['/web.js'].lineData[60] = 0;
  _$jscoverage['/web.js'].lineData[61] = 0;
  _$jscoverage['/web.js'].lineData[63] = 0;
  _$jscoverage['/web.js'].lineData[64] = 0;
  _$jscoverage['/web.js'].lineData[66] = 0;
  _$jscoverage['/web.js'].lineData[67] = 0;
  _$jscoverage['/web.js'].lineData[68] = 0;
  _$jscoverage['/web.js'].lineData[71] = 0;
  _$jscoverage['/web.js'].lineData[72] = 0;
  _$jscoverage['/web.js'].lineData[73] = 0;
  _$jscoverage['/web.js'].lineData[75] = 0;
  _$jscoverage['/web.js'].lineData[76] = 0;
  _$jscoverage['/web.js'].lineData[78] = 0;
  _$jscoverage['/web.js'].lineData[86] = 0;
  _$jscoverage['/web.js'].lineData[89] = 0;
  _$jscoverage['/web.js'].lineData[90] = 0;
  _$jscoverage['/web.js'].lineData[108] = 0;
  _$jscoverage['/web.js'].lineData[110] = 0;
  _$jscoverage['/web.js'].lineData[120] = 0;
  _$jscoverage['/web.js'].lineData[121] = 0;
  _$jscoverage['/web.js'].lineData[124] = 0;
  _$jscoverage['/web.js'].lineData[126] = 0;
  _$jscoverage['/web.js'].lineData[132] = 0;
  _$jscoverage['/web.js'].lineData[134] = 0;
  _$jscoverage['/web.js'].lineData[135] = 0;
  _$jscoverage['/web.js'].lineData[137] = 0;
  _$jscoverage['/web.js'].lineData[144] = 0;
  _$jscoverage['/web.js'].lineData[148] = 0;
  _$jscoverage['/web.js'].lineData[149] = 0;
  _$jscoverage['/web.js'].lineData[150] = 0;
  _$jscoverage['/web.js'].lineData[154] = 0;
  _$jscoverage['/web.js'].lineData[157] = 0;
  _$jscoverage['/web.js'].lineData[158] = 0;
  _$jscoverage['/web.js'].lineData[159] = 0;
  _$jscoverage['/web.js'].lineData[160] = 0;
  _$jscoverage['/web.js'].lineData[163] = 0;
  _$jscoverage['/web.js'].lineData[168] = 0;
  _$jscoverage['/web.js'].lineData[169] = 0;
  _$jscoverage['/web.js'].lineData[170] = 0;
  _$jscoverage['/web.js'].lineData[171] = 0;
  _$jscoverage['/web.js'].lineData[177] = 0;
  _$jscoverage['/web.js'].lineData[181] = 0;
  _$jscoverage['/web.js'].lineData[184] = 0;
  _$jscoverage['/web.js'].lineData[185] = 0;
  _$jscoverage['/web.js'].lineData[187] = 0;
  _$jscoverage['/web.js'].lineData[191] = 0;
  _$jscoverage['/web.js'].lineData[192] = 0;
  _$jscoverage['/web.js'].lineData[193] = 0;
  _$jscoverage['/web.js'].lineData[195] = 0;
  _$jscoverage['/web.js'].lineData[196] = 0;
  _$jscoverage['/web.js'].lineData[198] = 0;
  _$jscoverage['/web.js'].lineData[201] = 0;
  _$jscoverage['/web.js'].lineData[207] = 0;
  _$jscoverage['/web.js'].lineData[208] = 0;
  _$jscoverage['/web.js'].lineData[216] = 0;
  _$jscoverage['/web.js'].lineData[218] = 0;
  _$jscoverage['/web.js'].lineData[219] = 0;
  _$jscoverage['/web.js'].lineData[220] = 0;
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
  _$jscoverage['/web.js'].branchData['12'] = [];
  _$jscoverage['/web.js'].branchData['12'][1] = new BranchData();
  _$jscoverage['/web.js'].branchData['24'] = [];
  _$jscoverage['/web.js'].branchData['24'][1] = new BranchData();
  _$jscoverage['/web.js'].branchData['46'] = [];
  _$jscoverage['/web.js'].branchData['46'][1] = new BranchData();
  _$jscoverage['/web.js'].branchData['46'][2] = new BranchData();
  _$jscoverage['/web.js'].branchData['46'][3] = new BranchData();
  _$jscoverage['/web.js'].branchData['57'] = [];
  _$jscoverage['/web.js'].branchData['57'][1] = new BranchData();
  _$jscoverage['/web.js'].branchData['63'] = [];
  _$jscoverage['/web.js'].branchData['63'][1] = new BranchData();
  _$jscoverage['/web.js'].branchData['75'] = [];
  _$jscoverage['/web.js'].branchData['75'][1] = new BranchData();
  _$jscoverage['/web.js'].branchData['75'][2] = new BranchData();
  _$jscoverage['/web.js'].branchData['86'] = [];
  _$jscoverage['/web.js'].branchData['86'][1] = new BranchData();
  _$jscoverage['/web.js'].branchData['89'] = [];
  _$jscoverage['/web.js'].branchData['89'][1] = new BranchData();
  _$jscoverage['/web.js'].branchData['124'] = [];
  _$jscoverage['/web.js'].branchData['124'][1] = new BranchData();
  _$jscoverage['/web.js'].branchData['124'][2] = new BranchData();
  _$jscoverage['/web.js'].branchData['124'][3] = new BranchData();
  _$jscoverage['/web.js'].branchData['125'] = [];
  _$jscoverage['/web.js'].branchData['125'][1] = new BranchData();
  _$jscoverage['/web.js'].branchData['134'] = [];
  _$jscoverage['/web.js'].branchData['134'][1] = new BranchData();
  _$jscoverage['/web.js'].branchData['148'] = [];
  _$jscoverage['/web.js'].branchData['148'][1] = new BranchData();
  _$jscoverage['/web.js'].branchData['148'][2] = new BranchData();
  _$jscoverage['/web.js'].branchData['157'] = [];
  _$jscoverage['/web.js'].branchData['157'][1] = new BranchData();
  _$jscoverage['/web.js'].branchData['169'] = [];
  _$jscoverage['/web.js'].branchData['169'][1] = new BranchData();
  _$jscoverage['/web.js'].branchData['182'] = [];
  _$jscoverage['/web.js'].branchData['182'][1] = new BranchData();
  _$jscoverage['/web.js'].branchData['185'] = [];
  _$jscoverage['/web.js'].branchData['185'][1] = new BranchData();
  _$jscoverage['/web.js'].branchData['191'] = [];
  _$jscoverage['/web.js'].branchData['191'][1] = new BranchData();
  _$jscoverage['/web.js'].branchData['207'] = [];
  _$jscoverage['/web.js'].branchData['207'][1] = new BranchData();
  _$jscoverage['/web.js'].branchData['207'][2] = new BranchData();
  _$jscoverage['/web.js'].branchData['207'][3] = new BranchData();
  _$jscoverage['/web.js'].branchData['218'] = [];
  _$jscoverage['/web.js'].branchData['218'][1] = new BranchData();
}
_$jscoverage['/web.js'].branchData['218'][1].init(7034, 5, 'UA.ie');
function visit681_218_1(result) {
  _$jscoverage['/web.js'].branchData['218'][1].ranCondition(result);
  return result;
}_$jscoverage['/web.js'].branchData['207'][3].init(6741, 24, 'location.search || EMPTY');
function visit680_207_3(result) {
  _$jscoverage['/web.js'].branchData['207'][3].ranCondition(result);
  return result;
}_$jscoverage['/web.js'].branchData['207'][2].init(6741, 52, '(location.search || EMPTY).indexOf(\'ks-debug\') !== -1');
function visit679_207_2(result) {
  _$jscoverage['/web.js'].branchData['207'][2].ranCondition(result);
  return result;
}_$jscoverage['/web.js'].branchData['207'][1].init(6728, 65, 'location && (location.search || EMPTY).indexOf(\'ks-debug\') !== -1');
function visit678_207_1(result) {
  _$jscoverage['/web.js'].branchData['207'][1].ranCondition(result);
  return result;
}_$jscoverage['/web.js'].branchData['191'][1].init(936, 20, 'doScroll && notframe');
function visit677_191_1(result) {
  _$jscoverage['/web.js'].branchData['191'][1].ranCondition(result);
  return result;
}_$jscoverage['/web.js'].branchData['185'][1].init(30, 28, 'win[\'frameElement\'] === null');
function visit676_185_1(result) {
  _$jscoverage['/web.js'].branchData['185'][1].ranCondition(result);
  return result;
}_$jscoverage['/web.js'].branchData['182'][1].init(41, 27, 'docElem && docElem.doScroll');
function visit675_182_1(result) {
  _$jscoverage['/web.js'].branchData['182'][1].ranCondition(result);
  return result;
}_$jscoverage['/web.js'].branchData['169'][1].init(22, 27, 'doc.readyState === COMPLETE');
function visit674_169_1(result) {
  _$jscoverage['/web.js'].branchData['169'][1].ranCondition(result);
  return result;
}_$jscoverage['/web.js'].branchData['157'][1].init(375, 18, 'standardEventModel');
function visit673_157_1(result) {
  _$jscoverage['/web.js'].branchData['157'][1].ranCondition(result);
  return result;
}_$jscoverage['/web.js'].branchData['148'][2].init(130, 27, 'doc.readyState === COMPLETE');
function visit672_148_2(result) {
  _$jscoverage['/web.js'].branchData['148'][2].ranCondition(result);
  return result;
}_$jscoverage['/web.js'].branchData['148'][1].init(122, 35, '!doc || doc.readyState === COMPLETE');
function visit671_148_1(result) {
  _$jscoverage['/web.js'].branchData['148'][1].ranCondition(result);
  return result;
}_$jscoverage['/web.js'].branchData['134'][1].init(33, 17, 'doc && !UA.nodejs');
function visit670_134_1(result) {
  _$jscoverage['/web.js'].branchData['134'][1].ranCondition(result);
  return result;
}_$jscoverage['/web.js'].branchData['125'][1].init(77, 27, '++retryCount > POLL_RETIRES');
function visit669_125_1(result) {
  _$jscoverage['/web.js'].branchData['125'][1].ranCondition(result);
  return result;
}_$jscoverage['/web.js'].branchData['124'][3].init(62, 13, 'fn(node) || 1');
function visit668_124_3(result) {
  _$jscoverage['/web.js'].branchData['124'][3].ranCondition(result);
  return result;
}_$jscoverage['/web.js'].branchData['124'][2].init(27, 49, '(node = doc.getElementById(id)) && (fn(node) || 1)');
function visit667_124_2(result) {
  _$jscoverage['/web.js'].branchData['124'][2].ranCondition(result);
  return result;
}_$jscoverage['/web.js'].branchData['124'][1].init(27, 105, '(node = doc.getElementById(id)) && (fn(node) || 1) || ++retryCount > POLL_RETIRES');
function visit666_124_1(result) {
  _$jscoverage['/web.js'].branchData['124'][1].ranCondition(result);
  return result;
}_$jscoverage['/web.js'].branchData['89'][1].init(-1, 106, 'win.execScript || function(data) {\n  win[\'eval\'].call(win, data);\n}');
function visit665_89_1(result) {
  _$jscoverage['/web.js'].branchData['89'][1].ranCondition(result);
  return result;
}_$jscoverage['/web.js'].branchData['86'][1].init(18, 36, 'data && RE_NOT_WHITESPACE.test(data)');
function visit664_86_1(result) {
  _$jscoverage['/web.js'].branchData['86'][1].ranCondition(result);
  return result;
}_$jscoverage['/web.js'].branchData['75'][2].init(689, 70, '!xml.documentElement || xml.getElementsByTagName(\'parsererror\').length');
function visit663_75_2(result) {
  _$jscoverage['/web.js'].branchData['75'][2].ranCondition(result);
  return result;
}_$jscoverage['/web.js'].branchData['75'][1].init(681, 78, '!xml || !xml.documentElement || xml.getElementsByTagName(\'parsererror\').length');
function visit662_75_1(result) {
  _$jscoverage['/web.js'].branchData['75'][1].ranCondition(result);
  return result;
}_$jscoverage['/web.js'].branchData['63'][1].init(51, 16, 'win[\'DOMParser\']');
function visit661_63_1(result) {
  _$jscoverage['/web.js'].branchData['63'][1].ranCondition(result);
  return result;
}_$jscoverage['/web.js'].branchData['57'][1].init(48, 20, 'data.documentElement');
function visit660_57_1(result) {
  _$jscoverage['/web.js'].branchData['57'][1].ranCondition(result);
  return result;
}_$jscoverage['/web.js'].branchData['46'][3].init(36, 17, 'obj == obj.window');
function visit659_46_3(result) {
  _$jscoverage['/web.js'].branchData['46'][3].ranCondition(result);
  return result;
}_$jscoverage['/web.js'].branchData['46'][2].init(21, 11, 'obj != null');
function visit658_46_2(result) {
  _$jscoverage['/web.js'].branchData['46'][2].ranCondition(result);
  return result;
}_$jscoverage['/web.js'].branchData['46'][1].init(21, 32, 'obj != null && obj == obj.window');
function visit657_46_1(result) {
  _$jscoverage['/web.js'].branchData['46'][1].ranCondition(result);
  return result;
}_$jscoverage['/web.js'].branchData['24'][1].init(553, 27, 'doc && doc.addEventListener');
function visit656_24_1(result) {
  _$jscoverage['/web.js'].branchData['24'][1].ranCondition(result);
  return result;
}_$jscoverage['/web.js'].branchData['12'][1].init(131, 26, 'doc && doc.documentElement');
function visit655_12_1(result) {
  _$jscoverage['/web.js'].branchData['12'][1].ranCondition(result);
  return result;
}_$jscoverage['/web.js'].lineData[7]++;
(function(S, undefined) {
  _$jscoverage['/web.js'].functionData[0]++;
  _$jscoverage['/web.js'].lineData[8]++;
  var win = S.Env.host, logger = S.getLogger('s/web'), UA = S.UA, doc = win['document'], docElem = visit655_12_1(doc && doc.documentElement), location = win.location, EMPTY = '', readyDefer = new S.Defer(), readyPromise = readyDefer.promise, POLL_RETIRES = 500, POLL_INTERVAL = 40, RE_ID_STR = /^#?([\w-]+)$/, RE_NOT_WHITESPACE = /\S/, standardEventModel = !!(visit656_24_1(doc && doc.addEventListener)), DOM_READY_EVENT = 'DOMContentLoaded', READY_STATE_CHANGE_EVENT = 'readystatechange', LOAD_EVENT = 'load', COMPLETE = 'complete', addEventListener = standardEventModel ? function(el, type, fn) {
  _$jscoverage['/web.js'].functionData[1]++;
  _$jscoverage['/web.js'].lineData[30]++;
  el.addEventListener(type, fn, false);
} : function(el, type, fn) {
  _$jscoverage['/web.js'].functionData[2]++;
  _$jscoverage['/web.js'].lineData[32]++;
  el.attachEvent('on' + type, fn);
}, removeEventListener = standardEventModel ? function(el, type, fn) {
  _$jscoverage['/web.js'].functionData[3]++;
  _$jscoverage['/web.js'].lineData[35]++;
  el.removeEventListener(type, fn, false);
} : function(el, type, fn) {
  _$jscoverage['/web.js'].functionData[4]++;
  _$jscoverage['/web.js'].lineData[37]++;
  el.detachEvent('on' + type, fn);
};
  _$jscoverage['/web.js'].lineData[40]++;
  S.mix(S, {
  isWindow: function(obj) {
  _$jscoverage['/web.js'].functionData[5]++;
  _$jscoverage['/web.js'].lineData[46]++;
  return visit657_46_1(visit658_46_2(obj != null) && visit659_46_3(obj == obj.window));
}, 
  parseXML: function(data) {
  _$jscoverage['/web.js'].functionData[6]++;
  _$jscoverage['/web.js'].lineData[57]++;
  if (visit660_57_1(data.documentElement)) {
    _$jscoverage['/web.js'].lineData[58]++;
    return data;
  }
  _$jscoverage['/web.js'].lineData[60]++;
  var xml;
  _$jscoverage['/web.js'].lineData[61]++;
  try {
    _$jscoverage['/web.js'].lineData[63]++;
    if (visit661_63_1(win['DOMParser'])) {
      _$jscoverage['/web.js'].lineData[64]++;
      xml = new DOMParser().parseFromString(data, 'text/xml');
    } else {
      _$jscoverage['/web.js'].lineData[66]++;
      xml = new ActiveXObject('Microsoft.XMLDOM');
      _$jscoverage['/web.js'].lineData[67]++;
      xml.async = false;
      _$jscoverage['/web.js'].lineData[68]++;
      xml.loadXML(data);
    }
  }  catch (e) {
  _$jscoverage['/web.js'].lineData[71]++;
  logger.error('parseXML error :');
  _$jscoverage['/web.js'].lineData[72]++;
  logger.error(e);
  _$jscoverage['/web.js'].lineData[73]++;
  xml = undefined;
}
  _$jscoverage['/web.js'].lineData[75]++;
  if (visit662_75_1(!xml || visit663_75_2(!xml.documentElement || xml.getElementsByTagName('parsererror').length))) {
    _$jscoverage['/web.js'].lineData[76]++;
    S.error('Invalid XML: ' + data);
  }
  _$jscoverage['/web.js'].lineData[78]++;
  return xml;
}, 
  globalEval: function(data) {
  _$jscoverage['/web.js'].functionData[7]++;
  _$jscoverage['/web.js'].lineData[86]++;
  if (visit664_86_1(data && RE_NOT_WHITESPACE.test(data))) {
    _$jscoverage['/web.js'].lineData[89]++;
    (visit665_89_1(win.execScript || function(data) {
  _$jscoverage['/web.js'].functionData[8]++;
  _$jscoverage['/web.js'].lineData[90]++;
  win['eval'].call(win, data);
}))(data);
  }
}, 
  ready: function(fn) {
  _$jscoverage['/web.js'].functionData[9]++;
  _$jscoverage['/web.js'].lineData[108]++;
  readyPromise.done(fn);
  _$jscoverage['/web.js'].lineData[110]++;
  return this;
}, 
  available: function(id, fn) {
  _$jscoverage['/web.js'].functionData[10]++;
  _$jscoverage['/web.js'].lineData[120]++;
  id = (id + EMPTY).match(RE_ID_STR)[1];
  _$jscoverage['/web.js'].lineData[121]++;
  var retryCount = 1, node, timer = S.later(function() {
  _$jscoverage['/web.js'].functionData[11]++;
  _$jscoverage['/web.js'].lineData[124]++;
  if (visit666_124_1(visit667_124_2((node = doc.getElementById(id)) && (visit668_124_3(fn(node) || 1))) || visit669_125_1(++retryCount > POLL_RETIRES))) {
    _$jscoverage['/web.js'].lineData[126]++;
    timer.cancel();
  }
}, POLL_INTERVAL, true);
}});
  _$jscoverage['/web.js'].lineData[132]++;
  function fireReady() {
    _$jscoverage['/web.js'].functionData[12]++;
    _$jscoverage['/web.js'].lineData[134]++;
    if (visit670_134_1(doc && !UA.nodejs)) {
      _$jscoverage['/web.js'].lineData[135]++;
      removeEventListener(win, LOAD_EVENT, fireReady);
    }
    _$jscoverage['/web.js'].lineData[137]++;
    readyDefer.resolve(S);
  }
  _$jscoverage['/web.js'].lineData[144]++;
  function bindReady() {
    _$jscoverage['/web.js'].functionData[13]++;
    _$jscoverage['/web.js'].lineData[148]++;
    if (visit671_148_1(!doc || visit672_148_2(doc.readyState === COMPLETE))) {
      _$jscoverage['/web.js'].lineData[149]++;
      fireReady();
      _$jscoverage['/web.js'].lineData[150]++;
      return;
    }
    _$jscoverage['/web.js'].lineData[154]++;
    addEventListener(win, LOAD_EVENT, fireReady);
    _$jscoverage['/web.js'].lineData[157]++;
    if (visit673_157_1(standardEventModel)) {
      _$jscoverage['/web.js'].lineData[158]++;
      var domReady = function() {
  _$jscoverage['/web.js'].functionData[14]++;
  _$jscoverage['/web.js'].lineData[159]++;
  removeEventListener(doc, DOM_READY_EVENT, domReady);
  _$jscoverage['/web.js'].lineData[160]++;
  fireReady();
};
      _$jscoverage['/web.js'].lineData[163]++;
      addEventListener(doc, DOM_READY_EVENT, domReady);
    } else {
      _$jscoverage['/web.js'].lineData[168]++;
      var stateChange = function() {
  _$jscoverage['/web.js'].functionData[15]++;
  _$jscoverage['/web.js'].lineData[169]++;
  if (visit674_169_1(doc.readyState === COMPLETE)) {
    _$jscoverage['/web.js'].lineData[170]++;
    removeEventListener(doc, READY_STATE_CHANGE_EVENT, stateChange);
    _$jscoverage['/web.js'].lineData[171]++;
    fireReady();
  }
};
      _$jscoverage['/web.js'].lineData[177]++;
      addEventListener(doc, READY_STATE_CHANGE_EVENT, stateChange);
      _$jscoverage['/web.js'].lineData[181]++;
      var notframe, doScroll = visit675_182_1(docElem && docElem.doScroll);
      _$jscoverage['/web.js'].lineData[184]++;
      try {
        _$jscoverage['/web.js'].lineData[185]++;
        notframe = (visit676_185_1(win['frameElement'] === null));
      }      catch (e) {
  _$jscoverage['/web.js'].lineData[187]++;
  notframe = false;
}
      _$jscoverage['/web.js'].lineData[191]++;
      if (visit677_191_1(doScroll && notframe)) {
        _$jscoverage['/web.js'].lineData[192]++;
        var readyScroll = function() {
  _$jscoverage['/web.js'].functionData[16]++;
  _$jscoverage['/web.js'].lineData[193]++;
  try {
    _$jscoverage['/web.js'].lineData[195]++;
    doScroll('left');
    _$jscoverage['/web.js'].lineData[196]++;
    fireReady();
  }  catch (ex) {
  _$jscoverage['/web.js'].lineData[198]++;
  setTimeout(readyScroll, POLL_INTERVAL);
}
};
        _$jscoverage['/web.js'].lineData[201]++;
        readyScroll();
      }
    }
  }
  _$jscoverage['/web.js'].lineData[207]++;
  if (visit678_207_1(location && visit679_207_2((visit680_207_3(location.search || EMPTY)).indexOf('ks-debug') !== -1))) {
    _$jscoverage['/web.js'].lineData[208]++;
    S.Config.debug = true;
  }
  _$jscoverage['/web.js'].lineData[216]++;
  bindReady();
  _$jscoverage['/web.js'].lineData[218]++;
  if (visit681_218_1(UA.ie)) {
    _$jscoverage['/web.js'].lineData[219]++;
    try {
      _$jscoverage['/web.js'].lineData[220]++;
      doc.execCommand('BackgroundImageCache', false, true);
    }    catch (e) {
}
  }
})(KISSY, undefined);
