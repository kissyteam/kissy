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
  _$jscoverage['/web.js'].lineData[9] = 0;
  _$jscoverage['/web.js'].lineData[43] = 0;
  _$jscoverage['/web.js'].lineData[45] = 0;
  _$jscoverage['/web.js'].lineData[49] = 0;
  _$jscoverage['/web.js'].lineData[51] = 0;
  _$jscoverage['/web.js'].lineData[54] = 0;
  _$jscoverage['/web.js'].lineData[62] = 0;
  _$jscoverage['/web.js'].lineData[73] = 0;
  _$jscoverage['/web.js'].lineData[74] = 0;
  _$jscoverage['/web.js'].lineData[76] = 0;
  _$jscoverage['/web.js'].lineData[77] = 0;
  _$jscoverage['/web.js'].lineData[79] = 0;
  _$jscoverage['/web.js'].lineData[80] = 0;
  _$jscoverage['/web.js'].lineData[82] = 0;
  _$jscoverage['/web.js'].lineData[83] = 0;
  _$jscoverage['/web.js'].lineData[84] = 0;
  _$jscoverage['/web.js'].lineData[87] = 0;
  _$jscoverage['/web.js'].lineData[88] = 0;
  _$jscoverage['/web.js'].lineData[89] = 0;
  _$jscoverage['/web.js'].lineData[91] = 0;
  _$jscoverage['/web.js'].lineData[92] = 0;
  _$jscoverage['/web.js'].lineData[94] = 0;
  _$jscoverage['/web.js'].lineData[102] = 0;
  _$jscoverage['/web.js'].lineData[105] = 0;
  _$jscoverage['/web.js'].lineData[106] = 0;
  _$jscoverage['/web.js'].lineData[124] = 0;
  _$jscoverage['/web.js'].lineData[126] = 0;
  _$jscoverage['/web.js'].lineData[136] = 0;
  _$jscoverage['/web.js'].lineData[137] = 0;
  _$jscoverage['/web.js'].lineData[140] = 0;
  _$jscoverage['/web.js'].lineData[142] = 0;
  _$jscoverage['/web.js'].lineData[148] = 0;
  _$jscoverage['/web.js'].lineData[150] = 0;
  _$jscoverage['/web.js'].lineData[151] = 0;
  _$jscoverage['/web.js'].lineData[153] = 0;
  _$jscoverage['/web.js'].lineData[160] = 0;
  _$jscoverage['/web.js'].lineData[164] = 0;
  _$jscoverage['/web.js'].lineData[165] = 0;
  _$jscoverage['/web.js'].lineData[166] = 0;
  _$jscoverage['/web.js'].lineData[170] = 0;
  _$jscoverage['/web.js'].lineData[173] = 0;
  _$jscoverage['/web.js'].lineData[174] = 0;
  _$jscoverage['/web.js'].lineData[175] = 0;
  _$jscoverage['/web.js'].lineData[176] = 0;
  _$jscoverage['/web.js'].lineData[179] = 0;
  _$jscoverage['/web.js'].lineData[184] = 0;
  _$jscoverage['/web.js'].lineData[185] = 0;
  _$jscoverage['/web.js'].lineData[186] = 0;
  _$jscoverage['/web.js'].lineData[187] = 0;
  _$jscoverage['/web.js'].lineData[193] = 0;
  _$jscoverage['/web.js'].lineData[197] = 0;
  _$jscoverage['/web.js'].lineData[200] = 0;
  _$jscoverage['/web.js'].lineData[201] = 0;
  _$jscoverage['/web.js'].lineData[203] = 0;
  _$jscoverage['/web.js'].lineData[207] = 0;
  _$jscoverage['/web.js'].lineData[208] = 0;
  _$jscoverage['/web.js'].lineData[209] = 0;
  _$jscoverage['/web.js'].lineData[211] = 0;
  _$jscoverage['/web.js'].lineData[212] = 0;
  _$jscoverage['/web.js'].lineData[214] = 0;
  _$jscoverage['/web.js'].lineData[217] = 0;
  _$jscoverage['/web.js'].lineData[223] = 0;
  _$jscoverage['/web.js'].lineData[224] = 0;
  _$jscoverage['/web.js'].lineData[232] = 0;
  _$jscoverage['/web.js'].lineData[234] = 0;
  _$jscoverage['/web.js'].lineData[235] = 0;
  _$jscoverage['/web.js'].lineData[236] = 0;
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
  _$jscoverage['/web.js'].branchData['15'] = [];
  _$jscoverage['/web.js'].branchData['15'][1] = new BranchData();
  _$jscoverage['/web.js'].branchData['36'] = [];
  _$jscoverage['/web.js'].branchData['36'][1] = new BranchData();
  _$jscoverage['/web.js'].branchData['62'] = [];
  _$jscoverage['/web.js'].branchData['62'][1] = new BranchData();
  _$jscoverage['/web.js'].branchData['62'][2] = new BranchData();
  _$jscoverage['/web.js'].branchData['62'][3] = new BranchData();
  _$jscoverage['/web.js'].branchData['73'] = [];
  _$jscoverage['/web.js'].branchData['73'][1] = new BranchData();
  _$jscoverage['/web.js'].branchData['79'] = [];
  _$jscoverage['/web.js'].branchData['79'][1] = new BranchData();
  _$jscoverage['/web.js'].branchData['91'] = [];
  _$jscoverage['/web.js'].branchData['91'][1] = new BranchData();
  _$jscoverage['/web.js'].branchData['91'][2] = new BranchData();
  _$jscoverage['/web.js'].branchData['102'] = [];
  _$jscoverage['/web.js'].branchData['102'][1] = new BranchData();
  _$jscoverage['/web.js'].branchData['105'] = [];
  _$jscoverage['/web.js'].branchData['105'][1] = new BranchData();
  _$jscoverage['/web.js'].branchData['140'] = [];
  _$jscoverage['/web.js'].branchData['140'][1] = new BranchData();
  _$jscoverage['/web.js'].branchData['140'][2] = new BranchData();
  _$jscoverage['/web.js'].branchData['140'][3] = new BranchData();
  _$jscoverage['/web.js'].branchData['141'] = [];
  _$jscoverage['/web.js'].branchData['141'][1] = new BranchData();
  _$jscoverage['/web.js'].branchData['150'] = [];
  _$jscoverage['/web.js'].branchData['150'][1] = new BranchData();
  _$jscoverage['/web.js'].branchData['164'] = [];
  _$jscoverage['/web.js'].branchData['164'][1] = new BranchData();
  _$jscoverage['/web.js'].branchData['164'][2] = new BranchData();
  _$jscoverage['/web.js'].branchData['173'] = [];
  _$jscoverage['/web.js'].branchData['173'][1] = new BranchData();
  _$jscoverage['/web.js'].branchData['185'] = [];
  _$jscoverage['/web.js'].branchData['185'][1] = new BranchData();
  _$jscoverage['/web.js'].branchData['198'] = [];
  _$jscoverage['/web.js'].branchData['198'][1] = new BranchData();
  _$jscoverage['/web.js'].branchData['201'] = [];
  _$jscoverage['/web.js'].branchData['201'][1] = new BranchData();
  _$jscoverage['/web.js'].branchData['207'] = [];
  _$jscoverage['/web.js'].branchData['207'][1] = new BranchData();
  _$jscoverage['/web.js'].branchData['223'] = [];
  _$jscoverage['/web.js'].branchData['223'][1] = new BranchData();
  _$jscoverage['/web.js'].branchData['223'][2] = new BranchData();
  _$jscoverage['/web.js'].branchData['223'][3] = new BranchData();
  _$jscoverage['/web.js'].branchData['234'] = [];
  _$jscoverage['/web.js'].branchData['234'][1] = new BranchData();
}
_$jscoverage['/web.js'].branchData['234'][1].init(7031, 5, 'UA.ie');
function visit669_234_1(result) {
  _$jscoverage['/web.js'].branchData['234'][1].ranCondition(result);
  return result;
}_$jscoverage['/web.js'].branchData['223'][3].init(6738, 24, 'location.search || EMPTY');
function visit668_223_3(result) {
  _$jscoverage['/web.js'].branchData['223'][3].ranCondition(result);
  return result;
}_$jscoverage['/web.js'].branchData['223'][2].init(6738, 52, '(location.search || EMPTY).indexOf(\'ks-debug\') !== -1');
function visit667_223_2(result) {
  _$jscoverage['/web.js'].branchData['223'][2].ranCondition(result);
  return result;
}_$jscoverage['/web.js'].branchData['223'][1].init(6725, 65, 'location && (location.search || EMPTY).indexOf(\'ks-debug\') !== -1');
function visit666_223_1(result) {
  _$jscoverage['/web.js'].branchData['223'][1].ranCondition(result);
  return result;
}_$jscoverage['/web.js'].branchData['207'][1].init(936, 20, 'doScroll && notframe');
function visit665_207_1(result) {
  _$jscoverage['/web.js'].branchData['207'][1].ranCondition(result);
  return result;
}_$jscoverage['/web.js'].branchData['201'][1].init(30, 28, 'win[\'frameElement\'] === null');
function visit664_201_1(result) {
  _$jscoverage['/web.js'].branchData['201'][1].ranCondition(result);
  return result;
}_$jscoverage['/web.js'].branchData['198'][1].init(41, 27, 'docElem && docElem.doScroll');
function visit663_198_1(result) {
  _$jscoverage['/web.js'].branchData['198'][1].ranCondition(result);
  return result;
}_$jscoverage['/web.js'].branchData['185'][1].init(22, 27, 'doc.readyState === COMPLETE');
function visit662_185_1(result) {
  _$jscoverage['/web.js'].branchData['185'][1].ranCondition(result);
  return result;
}_$jscoverage['/web.js'].branchData['173'][1].init(375, 18, 'standardEventModel');
function visit661_173_1(result) {
  _$jscoverage['/web.js'].branchData['173'][1].ranCondition(result);
  return result;
}_$jscoverage['/web.js'].branchData['164'][2].init(130, 27, 'doc.readyState === COMPLETE');
function visit660_164_2(result) {
  _$jscoverage['/web.js'].branchData['164'][2].ranCondition(result);
  return result;
}_$jscoverage['/web.js'].branchData['164'][1].init(122, 35, '!doc || doc.readyState === COMPLETE');
function visit659_164_1(result) {
  _$jscoverage['/web.js'].branchData['164'][1].ranCondition(result);
  return result;
}_$jscoverage['/web.js'].branchData['150'][1].init(33, 17, 'doc && !UA.nodejs');
function visit658_150_1(result) {
  _$jscoverage['/web.js'].branchData['150'][1].ranCondition(result);
  return result;
}_$jscoverage['/web.js'].branchData['141'][1].init(77, 27, '++retryCount > POLL_RETIRES');
function visit657_141_1(result) {
  _$jscoverage['/web.js'].branchData['141'][1].ranCondition(result);
  return result;
}_$jscoverage['/web.js'].branchData['140'][3].init(62, 13, 'fn(node) || 1');
function visit656_140_3(result) {
  _$jscoverage['/web.js'].branchData['140'][3].ranCondition(result);
  return result;
}_$jscoverage['/web.js'].branchData['140'][2].init(27, 49, '(node = doc.getElementById(id)) && (fn(node) || 1)');
function visit655_140_2(result) {
  _$jscoverage['/web.js'].branchData['140'][2].ranCondition(result);
  return result;
}_$jscoverage['/web.js'].branchData['140'][1].init(27, 105, '(node = doc.getElementById(id)) && (fn(node) || 1) || ++retryCount > POLL_RETIRES');
function visit654_140_1(result) {
  _$jscoverage['/web.js'].branchData['140'][1].ranCondition(result);
  return result;
}_$jscoverage['/web.js'].branchData['105'][1].init(-1, 106, 'win.execScript || function(data) {\n  win[\'eval\'].call(win, data);\n}');
function visit653_105_1(result) {
  _$jscoverage['/web.js'].branchData['105'][1].ranCondition(result);
  return result;
}_$jscoverage['/web.js'].branchData['102'][1].init(18, 36, 'data && RE_NOT_WHITESPACE.test(data)');
function visit652_102_1(result) {
  _$jscoverage['/web.js'].branchData['102'][1].ranCondition(result);
  return result;
}_$jscoverage['/web.js'].branchData['91'][2].init(691, 70, '!xml.documentElement || xml.getElementsByTagName(\'parsererror\').length');
function visit651_91_2(result) {
  _$jscoverage['/web.js'].branchData['91'][2].ranCondition(result);
  return result;
}_$jscoverage['/web.js'].branchData['91'][1].init(683, 78, '!xml || !xml.documentElement || xml.getElementsByTagName(\'parsererror\').length');
function visit650_91_1(result) {
  _$jscoverage['/web.js'].branchData['91'][1].ranCondition(result);
  return result;
}_$jscoverage['/web.js'].branchData['79'][1].init(51, 16, 'win[\'DOMParser\']');
function visit649_79_1(result) {
  _$jscoverage['/web.js'].branchData['79'][1].ranCondition(result);
  return result;
}_$jscoverage['/web.js'].branchData['73'][1].init(48, 20, 'data.documentElement');
function visit648_73_1(result) {
  _$jscoverage['/web.js'].branchData['73'][1].ranCondition(result);
  return result;
}_$jscoverage['/web.js'].branchData['62'][3].init(36, 17, 'obj == obj.window');
function visit647_62_3(result) {
  _$jscoverage['/web.js'].branchData['62'][3].ranCondition(result);
  return result;
}_$jscoverage['/web.js'].branchData['62'][2].init(21, 11, 'obj != null');
function visit646_62_2(result) {
  _$jscoverage['/web.js'].branchData['62'][2].ranCondition(result);
  return result;
}_$jscoverage['/web.js'].branchData['62'][1].init(21, 32, 'obj != null && obj == obj.window');
function visit645_62_1(result) {
  _$jscoverage['/web.js'].branchData['62'][1].ranCondition(result);
  return result;
}_$jscoverage['/web.js'].branchData['36'][1].init(538, 27, 'doc && doc.addEventListener');
function visit644_36_1(result) {
  _$jscoverage['/web.js'].branchData['36'][1].ranCondition(result);
  return result;
}_$jscoverage['/web.js'].branchData['15'][1].init(98, 26, 'doc && doc.documentElement');
function visit643_15_1(result) {
  _$jscoverage['/web.js'].branchData['15'][1].ranCondition(result);
  return result;
}_$jscoverage['/web.js'].lineData[7]++;
(function(S, undefined) {
  _$jscoverage['/web.js'].functionData[0]++;
  _$jscoverage['/web.js'].lineData[9]++;
  var win = S.Env.host, UA = S.UA, doc = win['document'], docElem = visit643_15_1(doc && doc.documentElement), location = win.location, EMPTY = '', readyDefer = new S.Defer(), readyPromise = readyDefer.promise, POLL_RETIRES = 500, POLL_INTERVAL = 40, RE_ID_STR = /^#?([\w-]+)$/, RE_NOT_WHITESPACE = /\S/, standardEventModel = !!(visit644_36_1(doc && doc.addEventListener)), DOM_READY_EVENT = 'DOMContentLoaded', READY_STATE_CHANGE_EVENT = 'readystatechange', LOAD_EVENT = 'load', COMPLETE = 'complete', addEventListener = standardEventModel ? function(el, type, fn) {
  _$jscoverage['/web.js'].functionData[1]++;
  _$jscoverage['/web.js'].lineData[43]++;
  el.addEventListener(type, fn, false);
} : function(el, type, fn) {
  _$jscoverage['/web.js'].functionData[2]++;
  _$jscoverage['/web.js'].lineData[45]++;
  el.attachEvent('on' + type, fn);
}, removeEventListener = standardEventModel ? function(el, type, fn) {
  _$jscoverage['/web.js'].functionData[3]++;
  _$jscoverage['/web.js'].lineData[49]++;
  el.removeEventListener(type, fn, false);
} : function(el, type, fn) {
  _$jscoverage['/web.js'].functionData[4]++;
  _$jscoverage['/web.js'].lineData[51]++;
  el.detachEvent('on' + type, fn);
};
  _$jscoverage['/web.js'].lineData[54]++;
  S.mix(S, {
  isWindow: function(obj) {
  _$jscoverage['/web.js'].functionData[5]++;
  _$jscoverage['/web.js'].lineData[62]++;
  return visit645_62_1(visit646_62_2(obj != null) && visit647_62_3(obj == obj.window));
}, 
  parseXML: function(data) {
  _$jscoverage['/web.js'].functionData[6]++;
  _$jscoverage['/web.js'].lineData[73]++;
  if (visit648_73_1(data.documentElement)) {
    _$jscoverage['/web.js'].lineData[74]++;
    return data;
  }
  _$jscoverage['/web.js'].lineData[76]++;
  var xml;
  _$jscoverage['/web.js'].lineData[77]++;
  try {
    _$jscoverage['/web.js'].lineData[79]++;
    if (visit649_79_1(win['DOMParser'])) {
      _$jscoverage['/web.js'].lineData[80]++;
      xml = new DOMParser().parseFromString(data, 'text/xml');
    } else {
      _$jscoverage['/web.js'].lineData[82]++;
      xml = new ActiveXObject('Microsoft.XMLDOM');
      _$jscoverage['/web.js'].lineData[83]++;
      xml.async = false;
      _$jscoverage['/web.js'].lineData[84]++;
      xml.loadXML(data);
    }
  }  catch (e) {
  _$jscoverage['/web.js'].lineData[87]++;
  S.log('parseXML error :', 'error');
  _$jscoverage['/web.js'].lineData[88]++;
  S.log(e, 'error');
  _$jscoverage['/web.js'].lineData[89]++;
  xml = undefined;
}
  _$jscoverage['/web.js'].lineData[91]++;
  if (visit650_91_1(!xml || visit651_91_2(!xml.documentElement || xml.getElementsByTagName('parsererror').length))) {
    _$jscoverage['/web.js'].lineData[92]++;
    S.error('Invalid XML: ' + data);
  }
  _$jscoverage['/web.js'].lineData[94]++;
  return xml;
}, 
  globalEval: function(data) {
  _$jscoverage['/web.js'].functionData[7]++;
  _$jscoverage['/web.js'].lineData[102]++;
  if (visit652_102_1(data && RE_NOT_WHITESPACE.test(data))) {
    _$jscoverage['/web.js'].lineData[105]++;
    (visit653_105_1(win.execScript || function(data) {
  _$jscoverage['/web.js'].functionData[8]++;
  _$jscoverage['/web.js'].lineData[106]++;
  win['eval'].call(win, data);
}))(data);
  }
}, 
  ready: function(fn) {
  _$jscoverage['/web.js'].functionData[9]++;
  _$jscoverage['/web.js'].lineData[124]++;
  readyPromise.done(fn);
  _$jscoverage['/web.js'].lineData[126]++;
  return this;
}, 
  available: function(id, fn) {
  _$jscoverage['/web.js'].functionData[10]++;
  _$jscoverage['/web.js'].lineData[136]++;
  id = (id + EMPTY).match(RE_ID_STR)[1];
  _$jscoverage['/web.js'].lineData[137]++;
  var retryCount = 1, node, timer = S.later(function() {
  _$jscoverage['/web.js'].functionData[11]++;
  _$jscoverage['/web.js'].lineData[140]++;
  if (visit654_140_1(visit655_140_2((node = doc.getElementById(id)) && (visit656_140_3(fn(node) || 1))) || visit657_141_1(++retryCount > POLL_RETIRES))) {
    _$jscoverage['/web.js'].lineData[142]++;
    timer.cancel();
  }
}, POLL_INTERVAL, true);
}});
  _$jscoverage['/web.js'].lineData[148]++;
  function fireReady() {
    _$jscoverage['/web.js'].functionData[12]++;
    _$jscoverage['/web.js'].lineData[150]++;
    if (visit658_150_1(doc && !UA.nodejs)) {
      _$jscoverage['/web.js'].lineData[151]++;
      removeEventListener(win, LOAD_EVENT, fireReady);
    }
    _$jscoverage['/web.js'].lineData[153]++;
    readyDefer.resolve(S);
  }
  _$jscoverage['/web.js'].lineData[160]++;
  function bindReady() {
    _$jscoverage['/web.js'].functionData[13]++;
    _$jscoverage['/web.js'].lineData[164]++;
    if (visit659_164_1(!doc || visit660_164_2(doc.readyState === COMPLETE))) {
      _$jscoverage['/web.js'].lineData[165]++;
      fireReady();
      _$jscoverage['/web.js'].lineData[166]++;
      return;
    }
    _$jscoverage['/web.js'].lineData[170]++;
    addEventListener(win, LOAD_EVENT, fireReady);
    _$jscoverage['/web.js'].lineData[173]++;
    if (visit661_173_1(standardEventModel)) {
      _$jscoverage['/web.js'].lineData[174]++;
      var domReady = function() {
  _$jscoverage['/web.js'].functionData[14]++;
  _$jscoverage['/web.js'].lineData[175]++;
  removeEventListener(doc, DOM_READY_EVENT, domReady);
  _$jscoverage['/web.js'].lineData[176]++;
  fireReady();
};
      _$jscoverage['/web.js'].lineData[179]++;
      addEventListener(doc, DOM_READY_EVENT, domReady);
    } else {
      _$jscoverage['/web.js'].lineData[184]++;
      var stateChange = function() {
  _$jscoverage['/web.js'].functionData[15]++;
  _$jscoverage['/web.js'].lineData[185]++;
  if (visit662_185_1(doc.readyState === COMPLETE)) {
    _$jscoverage['/web.js'].lineData[186]++;
    removeEventListener(doc, READY_STATE_CHANGE_EVENT, stateChange);
    _$jscoverage['/web.js'].lineData[187]++;
    fireReady();
  }
};
      _$jscoverage['/web.js'].lineData[193]++;
      addEventListener(doc, READY_STATE_CHANGE_EVENT, stateChange);
      _$jscoverage['/web.js'].lineData[197]++;
      var notframe, doScroll = visit663_198_1(docElem && docElem.doScroll);
      _$jscoverage['/web.js'].lineData[200]++;
      try {
        _$jscoverage['/web.js'].lineData[201]++;
        notframe = (visit664_201_1(win['frameElement'] === null));
      }      catch (e) {
  _$jscoverage['/web.js'].lineData[203]++;
  notframe = false;
}
      _$jscoverage['/web.js'].lineData[207]++;
      if (visit665_207_1(doScroll && notframe)) {
        _$jscoverage['/web.js'].lineData[208]++;
        var readyScroll = function() {
  _$jscoverage['/web.js'].functionData[16]++;
  _$jscoverage['/web.js'].lineData[209]++;
  try {
    _$jscoverage['/web.js'].lineData[211]++;
    doScroll('left');
    _$jscoverage['/web.js'].lineData[212]++;
    fireReady();
  }  catch (ex) {
  _$jscoverage['/web.js'].lineData[214]++;
  setTimeout(readyScroll, POLL_INTERVAL);
}
};
        _$jscoverage['/web.js'].lineData[217]++;
        readyScroll();
      }
    }
  }
  _$jscoverage['/web.js'].lineData[223]++;
  if (visit666_223_1(location && visit667_223_2((visit668_223_3(location.search || EMPTY)).indexOf('ks-debug') !== -1))) {
    _$jscoverage['/web.js'].lineData[224]++;
    S.Config.debug = true;
  }
  _$jscoverage['/web.js'].lineData[232]++;
  bindReady();
  _$jscoverage['/web.js'].lineData[234]++;
  if (visit669_234_1(UA.ie)) {
    _$jscoverage['/web.js'].lineData[235]++;
    try {
      _$jscoverage['/web.js'].lineData[236]++;
      doc.execCommand('BackgroundImageCache', false, true);
    }    catch (e) {
}
  }
})(KISSY, undefined);
