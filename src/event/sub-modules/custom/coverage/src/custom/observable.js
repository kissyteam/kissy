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
if (! _$jscoverage['/custom/observable.js']) {
  _$jscoverage['/custom/observable.js'] = {};
  _$jscoverage['/custom/observable.js'].lineData = [];
  _$jscoverage['/custom/observable.js'].lineData[7] = 0;
  _$jscoverage['/custom/observable.js'].lineData[8] = 0;
  _$jscoverage['/custom/observable.js'].lineData[9] = 0;
  _$jscoverage['/custom/observable.js'].lineData[10] = 0;
  _$jscoverage['/custom/observable.js'].lineData[14] = 0;
  _$jscoverage['/custom/observable.js'].lineData[15] = 0;
  _$jscoverage['/custom/observable.js'].lineData[23] = 0;
  _$jscoverage['/custom/observable.js'].lineData[24] = 0;
  _$jscoverage['/custom/observable.js'].lineData[25] = 0;
  _$jscoverage['/custom/observable.js'].lineData[26] = 0;
  _$jscoverage['/custom/observable.js'].lineData[27] = 0;
  _$jscoverage['/custom/observable.js'].lineData[34] = 0;
  _$jscoverage['/custom/observable.js'].lineData[41] = 0;
  _$jscoverage['/custom/observable.js'].lineData[47] = 0;
  _$jscoverage['/custom/observable.js'].lineData[49] = 0;
  _$jscoverage['/custom/observable.js'].lineData[50] = 0;
  _$jscoverage['/custom/observable.js'].lineData[51] = 0;
  _$jscoverage['/custom/observable.js'].lineData[54] = 0;
  _$jscoverage['/custom/observable.js'].lineData[55] = 0;
  _$jscoverage['/custom/observable.js'].lineData[66] = 0;
  _$jscoverage['/custom/observable.js'].lineData[68] = 0;
  _$jscoverage['/custom/observable.js'].lineData[79] = 0;
  _$jscoverage['/custom/observable.js'].lineData[81] = 0;
  _$jscoverage['/custom/observable.js'].lineData[82] = 0;
  _$jscoverage['/custom/observable.js'].lineData[83] = 0;
  _$jscoverage['/custom/observable.js'].lineData[86] = 0;
  _$jscoverage['/custom/observable.js'].lineData[88] = 0;
  _$jscoverage['/custom/observable.js'].lineData[90] = 0;
  _$jscoverage['/custom/observable.js'].lineData[91] = 0;
  _$jscoverage['/custom/observable.js'].lineData[95] = 0;
  _$jscoverage['/custom/observable.js'].lineData[97] = 0;
  _$jscoverage['/custom/observable.js'].lineData[99] = 0;
  _$jscoverage['/custom/observable.js'].lineData[101] = 0;
  _$jscoverage['/custom/observable.js'].lineData[103] = 0;
  _$jscoverage['/custom/observable.js'].lineData[106] = 0;
  _$jscoverage['/custom/observable.js'].lineData[107] = 0;
  _$jscoverage['/custom/observable.js'].lineData[116] = 0;
  _$jscoverage['/custom/observable.js'].lineData[117] = 0;
  _$jscoverage['/custom/observable.js'].lineData[119] = 0;
  _$jscoverage['/custom/observable.js'].lineData[122] = 0;
  _$jscoverage['/custom/observable.js'].lineData[126] = 0;
  _$jscoverage['/custom/observable.js'].lineData[138] = 0;
  _$jscoverage['/custom/observable.js'].lineData[144] = 0;
  _$jscoverage['/custom/observable.js'].lineData[145] = 0;
  _$jscoverage['/custom/observable.js'].lineData[146] = 0;
  _$jscoverage['/custom/observable.js'].lineData[147] = 0;
  _$jscoverage['/custom/observable.js'].lineData[151] = 0;
  _$jscoverage['/custom/observable.js'].lineData[159] = 0;
  _$jscoverage['/custom/observable.js'].lineData[167] = 0;
  _$jscoverage['/custom/observable.js'].lineData[168] = 0;
  _$jscoverage['/custom/observable.js'].lineData[171] = 0;
  _$jscoverage['/custom/observable.js'].lineData[172] = 0;
  _$jscoverage['/custom/observable.js'].lineData[175] = 0;
  _$jscoverage['/custom/observable.js'].lineData[178] = 0;
  _$jscoverage['/custom/observable.js'].lineData[179] = 0;
  _$jscoverage['/custom/observable.js'].lineData[181] = 0;
  _$jscoverage['/custom/observable.js'].lineData[182] = 0;
  _$jscoverage['/custom/observable.js'].lineData[183] = 0;
  _$jscoverage['/custom/observable.js'].lineData[184] = 0;
  _$jscoverage['/custom/observable.js'].lineData[191] = 0;
  _$jscoverage['/custom/observable.js'].lineData[195] = 0;
  _$jscoverage['/custom/observable.js'].lineData[198] = 0;
  _$jscoverage['/custom/observable.js'].lineData[207] = 0;
}
if (! _$jscoverage['/custom/observable.js'].functionData) {
  _$jscoverage['/custom/observable.js'].functionData = [];
  _$jscoverage['/custom/observable.js'].functionData[0] = 0;
  _$jscoverage['/custom/observable.js'].functionData[1] = 0;
  _$jscoverage['/custom/observable.js'].functionData[2] = 0;
  _$jscoverage['/custom/observable.js'].functionData[3] = 0;
  _$jscoverage['/custom/observable.js'].functionData[4] = 0;
  _$jscoverage['/custom/observable.js'].functionData[5] = 0;
}
if (! _$jscoverage['/custom/observable.js'].branchData) {
  _$jscoverage['/custom/observable.js'].branchData = {};
  _$jscoverage['/custom/observable.js'].branchData['49'] = [];
  _$jscoverage['/custom/observable.js'].branchData['49'][1] = new BranchData();
  _$jscoverage['/custom/observable.js'].branchData['50'] = [];
  _$jscoverage['/custom/observable.js'].branchData['50'][1] = new BranchData();
  _$jscoverage['/custom/observable.js'].branchData['54'] = [];
  _$jscoverage['/custom/observable.js'].branchData['54'][1] = new BranchData();
  _$jscoverage['/custom/observable.js'].branchData['66'] = [];
  _$jscoverage['/custom/observable.js'].branchData['66'][1] = new BranchData();
  _$jscoverage['/custom/observable.js'].branchData['81'] = [];
  _$jscoverage['/custom/observable.js'].branchData['81'][1] = new BranchData();
  _$jscoverage['/custom/observable.js'].branchData['90'] = [];
  _$jscoverage['/custom/observable.js'].branchData['90'][1] = new BranchData();
  _$jscoverage['/custom/observable.js'].branchData['90'][2] = new BranchData();
  _$jscoverage['/custom/observable.js'].branchData['90'][3] = new BranchData();
  _$jscoverage['/custom/observable.js'].branchData['95'] = [];
  _$jscoverage['/custom/observable.js'].branchData['95'][1] = new BranchData();
  _$jscoverage['/custom/observable.js'].branchData['99'] = [];
  _$jscoverage['/custom/observable.js'].branchData['99'][1] = new BranchData();
  _$jscoverage['/custom/observable.js'].branchData['99'][2] = new BranchData();
  _$jscoverage['/custom/observable.js'].branchData['101'] = [];
  _$jscoverage['/custom/observable.js'].branchData['101'][1] = new BranchData();
  _$jscoverage['/custom/observable.js'].branchData['101'][2] = new BranchData();
  _$jscoverage['/custom/observable.js'].branchData['106'] = [];
  _$jscoverage['/custom/observable.js'].branchData['106'][1] = new BranchData();
  _$jscoverage['/custom/observable.js'].branchData['106'][2] = new BranchData();
  _$jscoverage['/custom/observable.js'].branchData['106'][3] = new BranchData();
  _$jscoverage['/custom/observable.js'].branchData['116'] = [];
  _$jscoverage['/custom/observable.js'].branchData['116'][1] = new BranchData();
  _$jscoverage['/custom/observable.js'].branchData['119'] = [];
  _$jscoverage['/custom/observable.js'].branchData['119'][1] = new BranchData();
  _$jscoverage['/custom/observable.js'].branchData['119'][2] = new BranchData();
  _$jscoverage['/custom/observable.js'].branchData['120'] = [];
  _$jscoverage['/custom/observable.js'].branchData['120'][1] = new BranchData();
  _$jscoverage['/custom/observable.js'].branchData['144'] = [];
  _$jscoverage['/custom/observable.js'].branchData['144'][1] = new BranchData();
  _$jscoverage['/custom/observable.js'].branchData['144'][2] = new BranchData();
  _$jscoverage['/custom/observable.js'].branchData['146'] = [];
  _$jscoverage['/custom/observable.js'].branchData['146'][1] = new BranchData();
  _$jscoverage['/custom/observable.js'].branchData['146'][2] = new BranchData();
  _$jscoverage['/custom/observable.js'].branchData['146'][3] = new BranchData();
  _$jscoverage['/custom/observable.js'].branchData['167'] = [];
  _$jscoverage['/custom/observable.js'].branchData['167'][1] = new BranchData();
  _$jscoverage['/custom/observable.js'].branchData['171'] = [];
  _$jscoverage['/custom/observable.js'].branchData['171'][1] = new BranchData();
  _$jscoverage['/custom/observable.js'].branchData['178'] = [];
  _$jscoverage['/custom/observable.js'].branchData['178'][1] = new BranchData();
  _$jscoverage['/custom/observable.js'].branchData['179'] = [];
  _$jscoverage['/custom/observable.js'].branchData['179'][1] = new BranchData();
  _$jscoverage['/custom/observable.js'].branchData['181'] = [];
  _$jscoverage['/custom/observable.js'].branchData['181'][1] = new BranchData();
  _$jscoverage['/custom/observable.js'].branchData['183'] = [];
  _$jscoverage['/custom/observable.js'].branchData['183'][1] = new BranchData();
  _$jscoverage['/custom/observable.js'].branchData['185'] = [];
  _$jscoverage['/custom/observable.js'].branchData['185'][1] = new BranchData();
  _$jscoverage['/custom/observable.js'].branchData['185'][2] = new BranchData();
  _$jscoverage['/custom/observable.js'].branchData['187'] = [];
  _$jscoverage['/custom/observable.js'].branchData['187'][1] = new BranchData();
  _$jscoverage['/custom/observable.js'].branchData['187'][2] = new BranchData();
  _$jscoverage['/custom/observable.js'].branchData['187'][3] = new BranchData();
  _$jscoverage['/custom/observable.js'].branchData['189'] = [];
  _$jscoverage['/custom/observable.js'].branchData['189'][1] = new BranchData();
}
_$jscoverage['/custom/observable.js'].branchData['189'][1].init(124, 44, 'groupsRe && !observer.groups.match(groupsRe)');
function visit37_189_1(result) {
  _$jscoverage['/custom/observable.js'].branchData['189'][1].ranCondition(result);
  return result;
}_$jscoverage['/custom/observable.js'].branchData['187'][3].init(283, 17, 'fn != observer.fn');
function visit36_187_3(result) {
  _$jscoverage['/custom/observable.js'].branchData['187'][3].ranCondition(result);
  return result;
}_$jscoverage['/custom/observable.js'].branchData['187'][2].init(277, 23, 'fn && fn != observer.fn');
function visit35_187_2(result) {
  _$jscoverage['/custom/observable.js'].branchData['187'][2].ranCondition(result);
  return result;
}_$jscoverage['/custom/observable.js'].branchData['187'][1].init(105, 170, '(fn && fn != observer.fn) || (groupsRe && !observer.groups.match(groupsRe))');
function visit34_187_1(result) {
  _$jscoverage['/custom/observable.js'].branchData['187'][1].ranCondition(result);
  return result;
}_$jscoverage['/custom/observable.js'].branchData['185'][2].init(170, 26, 'context != observerContext');
function visit33_185_2(result) {
  _$jscoverage['/custom/observable.js'].branchData['185'][2].ranCondition(result);
  return result;
}_$jscoverage['/custom/observable.js'].branchData['185'][1].init(29, 276, '(context != observerContext) || (fn && fn != observer.fn) || (groupsRe && !observer.groups.match(groupsRe))');
function visit32_185_1(result) {
  _$jscoverage['/custom/observable.js'].branchData['185'][1].ranCondition(result);
  return result;
}_$jscoverage['/custom/observable.js'].branchData['183'][1].init(84, 33, 'observer.context || currentTarget');
function visit31_183_1(result) {
  _$jscoverage['/custom/observable.js'].branchData['183'][1].ranCondition(result);
  return result;
}_$jscoverage['/custom/observable.js'].branchData['181'][1].init(97, 7, 'i < len');
function visit30_181_1(result) {
  _$jscoverage['/custom/observable.js'].branchData['181'][1].ranCondition(result);
  return result;
}_$jscoverage['/custom/observable.js'].branchData['179'][1].init(27, 24, 'context || currentTarget');
function visit29_179_1(result) {
  _$jscoverage['/custom/observable.js'].branchData['179'][1].ranCondition(result);
  return result;
}_$jscoverage['/custom/observable.js'].branchData['178'][1].init(543, 14, 'fn || groupsRe');
function visit28_178_1(result) {
  _$jscoverage['/custom/observable.js'].branchData['178'][1].ranCondition(result);
  return result;
}_$jscoverage['/custom/observable.js'].branchData['171'][1].init(350, 6, 'groups');
function visit27_171_1(result) {
  _$jscoverage['/custom/observable.js'].branchData['171'][1].ranCondition(result);
  return result;
}_$jscoverage['/custom/observable.js'].branchData['167'][1].init(274, 17, '!observers.length');
function visit26_167_1(result) {
  _$jscoverage['/custom/observable.js'].branchData['167'][1].ranCondition(result);
  return result;
}_$jscoverage['/custom/observable.js'].branchData['146'][3].init(95, 17, 'ret !== undefined');
function visit25_146_3(result) {
  _$jscoverage['/custom/observable.js'].branchData['146'][3].ranCondition(result);
  return result;
}_$jscoverage['/custom/observable.js'].branchData['146'][2].init(77, 14, 'gRet !== false');
function visit24_146_2(result) {
  _$jscoverage['/custom/observable.js'].branchData['146'][2].ranCondition(result);
  return result;
}_$jscoverage['/custom/observable.js'].branchData['146'][1].init(77, 35, 'gRet !== false && ret !== undefined');
function visit23_146_1(result) {
  _$jscoverage['/custom/observable.js'].branchData['146'][1].ranCondition(result);
  return result;
}_$jscoverage['/custom/observable.js'].branchData['144'][2].init(246, 7, 'i < len');
function visit22_144_2(result) {
  _$jscoverage['/custom/observable.js'].branchData['144'][2].ranCondition(result);
  return result;
}_$jscoverage['/custom/observable.js'].branchData['144'][1].init(246, 49, 'i < len && !event.isImmediatePropagationStopped()');
function visit21_144_1(result) {
  _$jscoverage['/custom/observable.js'].branchData['144'][1].ranCondition(result);
  return result;
}_$jscoverage['/custom/observable.js'].branchData['120'][1].init(97, 23, 'currentTarget == target');
function visit20_120_1(result) {
  _$jscoverage['/custom/observable.js'].branchData['120'][1].ranCondition(result);
  return result;
}_$jscoverage['/custom/observable.js'].branchData['119'][2].init(184, 73, '!self.defaultTargetOnly && !lowestCustomEventObservable.defaultTargetOnly');
function visit19_119_2(result) {
  _$jscoverage['/custom/observable.js'].branchData['119'][2].ranCondition(result);
  return result;
}_$jscoverage['/custom/observable.js'].branchData['119'][1].init(184, 121, '(!self.defaultTargetOnly && !lowestCustomEventObservable.defaultTargetOnly) || currentTarget == target');
function visit18_119_1(result) {
  _$jscoverage['/custom/observable.js'].branchData['119'][1].ranCondition(result);
  return result;
}_$jscoverage['/custom/observable.js'].branchData['116'][1].init(1557, 52, 'defaultFn && !customEventObject.isDefaultPrevented()');
function visit17_116_1(result) {
  _$jscoverage['/custom/observable.js'].branchData['116'][1].ranCondition(result);
  return result;
}_$jscoverage['/custom/observable.js'].branchData['106'][3].init(147, 17, 'ret !== undefined');
function visit16_106_3(result) {
  _$jscoverage['/custom/observable.js'].branchData['106'][3].ranCondition(result);
  return result;
}_$jscoverage['/custom/observable.js'].branchData['106'][2].init(129, 14, 'gRet !== false');
function visit15_106_2(result) {
  _$jscoverage['/custom/observable.js'].branchData['106'][2].ranCondition(result);
  return result;
}_$jscoverage['/custom/observable.js'].branchData['106'][1].init(129, 35, 'gRet !== false && ret !== undefined');
function visit14_106_1(result) {
  _$jscoverage['/custom/observable.js'].branchData['106'][1].ranCondition(result);
  return result;
}_$jscoverage['/custom/observable.js'].branchData['101'][2].init(147, 14, 'i < parentsLen');
function visit13_101_2(result) {
  _$jscoverage['/custom/observable.js'].branchData['101'][2].ranCondition(result);
  return result;
}_$jscoverage['/custom/observable.js'].branchData['101'][1].init(147, 59, 'i < parentsLen && !customEventObject.isPropagationStopped()');
function visit12_101_1(result) {
  _$jscoverage['/custom/observable.js'].branchData['101'][1].ranCondition(result);
  return result;
}_$jscoverage['/custom/observable.js'].branchData['99'][2].init(86, 25, 'parents && parents.length');
function visit11_99_2(result) {
  _$jscoverage['/custom/observable.js'].branchData['99'][2].ranCondition(result);
  return result;
}_$jscoverage['/custom/observable.js'].branchData['99'][1].init(86, 30, 'parents && parents.length || 0');
function visit10_99_1(result) {
  _$jscoverage['/custom/observable.js'].branchData['99'][1].ranCondition(result);
  return result;
}_$jscoverage['/custom/observable.js'].branchData['95'][1].init(910, 52, 'bubbles && !customEventObject.isPropagationStopped()');
function visit9_95_1(result) {
  _$jscoverage['/custom/observable.js'].branchData['95'][1].ranCondition(result);
  return result;
}_$jscoverage['/custom/observable.js'].branchData['90'][3].init(793, 16, 'ret != undefined');
function visit8_90_3(result) {
  _$jscoverage['/custom/observable.js'].branchData['90'][3].ranCondition(result);
  return result;
}_$jscoverage['/custom/observable.js'].branchData['90'][2].init(775, 14, 'gRet !== false');
function visit7_90_2(result) {
  _$jscoverage['/custom/observable.js'].branchData['90'][2].ranCondition(result);
  return result;
}_$jscoverage['/custom/observable.js'].branchData['90'][1].init(775, 34, 'gRet !== false && ret != undefined');
function visit6_90_1(result) {
  _$jscoverage['/custom/observable.js'].branchData['90'][1].ranCondition(result);
  return result;
}_$jscoverage['/custom/observable.js'].branchData['81'][1].init(441, 50, '!(customEventObject instanceof CustomEventObject)');
function visit5_81_1(result) {
  _$jscoverage['/custom/observable.js'].branchData['81'][1].ranCondition(result);
  return result;
}_$jscoverage['/custom/observable.js'].branchData['66'][1].init(25, 15, 'eventData || {}');
function visit4_66_1(result) {
  _$jscoverage['/custom/observable.js'].branchData['66'][1].ranCondition(result);
  return result;
}_$jscoverage['/custom/observable.js'].branchData['54'][1].init(308, 33, 'this.findObserver(observer) == -1');
function visit3_54_1(result) {
  _$jscoverage['/custom/observable.js'].branchData['54'][1].ranCondition(result);
  return result;
}_$jscoverage['/custom/observable.js'].branchData['50'][1].init(21, 12, '!observer.fn');
function visit2_50_1(result) {
  _$jscoverage['/custom/observable.js'].branchData['50'][1].ranCondition(result);
  return result;
}_$jscoverage['/custom/observable.js'].branchData['49'][1].init(138, 14, 'S.Config.debug');
function visit1_49_1(result) {
  _$jscoverage['/custom/observable.js'].branchData['49'][1].ranCondition(result);
  return result;
}_$jscoverage['/custom/observable.js'].lineData[7]++;
KISSY.add(function(S, require) {
  _$jscoverage['/custom/observable.js'].functionData[0]++;
  _$jscoverage['/custom/observable.js'].lineData[8]++;
  var BaseEvent = require('event/base');
  _$jscoverage['/custom/observable.js'].lineData[9]++;
  var CustomEventObserver = require('./observer');
  _$jscoverage['/custom/observable.js'].lineData[10]++;
  var CustomEventObject = require('./object');
  _$jscoverage['/custom/observable.js'].lineData[14]++;
  var Utils = BaseEvent.Utils;
  _$jscoverage['/custom/observable.js'].lineData[15]++;
  var undefined = undefined;
  _$jscoverage['/custom/observable.js'].lineData[23]++;
  function CustomEventObservable() {
    _$jscoverage['/custom/observable.js'].functionData[1]++;
    _$jscoverage['/custom/observable.js'].lineData[24]++;
    var self = this;
    _$jscoverage['/custom/observable.js'].lineData[25]++;
    CustomEventObservable.superclass.constructor.apply(self, arguments);
    _$jscoverage['/custom/observable.js'].lineData[26]++;
    self.defaultFn = null;
    _$jscoverage['/custom/observable.js'].lineData[27]++;
    self.defaultTargetOnly = false;
    _$jscoverage['/custom/observable.js'].lineData[34]++;
    self.bubbles = true;
  }
  _$jscoverage['/custom/observable.js'].lineData[41]++;
  S.extend(CustomEventObservable, BaseEvent.Observable, {
  on: function(cfg) {
  _$jscoverage['/custom/observable.js'].functionData[2]++;
  _$jscoverage['/custom/observable.js'].lineData[47]++;
  var observer = new CustomEventObserver(cfg);
  _$jscoverage['/custom/observable.js'].lineData[49]++;
  if (visit1_49_1(S.Config.debug)) {
    _$jscoverage['/custom/observable.js'].lineData[50]++;
    if (visit2_50_1(!observer.fn)) {
      _$jscoverage['/custom/observable.js'].lineData[51]++;
      S.error('lack event handler for ' + this.type);
    }
  }
  _$jscoverage['/custom/observable.js'].lineData[54]++;
  if (visit3_54_1(this.findObserver(observer) == -1)) {
    _$jscoverage['/custom/observable.js'].lineData[55]++;
    this.observers.push(observer);
  }
}, 
  fire: function(eventData) {
  _$jscoverage['/custom/observable.js'].functionData[3]++;
  _$jscoverage['/custom/observable.js'].lineData[66]++;
  eventData = visit4_66_1(eventData || {});
  _$jscoverage['/custom/observable.js'].lineData[68]++;
  var self = this, bubbles = self.bubbles, currentTarget = self.currentTarget, parents, parentsLen, type = self.type, defaultFn = self.defaultFn, i, customEventObject = eventData, gRet, ret;
  _$jscoverage['/custom/observable.js'].lineData[79]++;
  eventData.type = type;
  _$jscoverage['/custom/observable.js'].lineData[81]++;
  if (visit5_81_1(!(customEventObject instanceof CustomEventObject))) {
    _$jscoverage['/custom/observable.js'].lineData[82]++;
    customEventObject.target = currentTarget;
    _$jscoverage['/custom/observable.js'].lineData[83]++;
    customEventObject = new CustomEventObject(customEventObject);
  }
  _$jscoverage['/custom/observable.js'].lineData[86]++;
  customEventObject.currentTarget = currentTarget;
  _$jscoverage['/custom/observable.js'].lineData[88]++;
  ret = self.notify(customEventObject);
  _$jscoverage['/custom/observable.js'].lineData[90]++;
  if (visit6_90_1(visit7_90_2(gRet !== false) && visit8_90_3(ret != undefined))) {
    _$jscoverage['/custom/observable.js'].lineData[91]++;
    gRet = ret;
  }
  _$jscoverage['/custom/observable.js'].lineData[95]++;
  if (visit9_95_1(bubbles && !customEventObject.isPropagationStopped())) {
    _$jscoverage['/custom/observable.js'].lineData[97]++;
    parents = currentTarget.getTargets();
    _$jscoverage['/custom/observable.js'].lineData[99]++;
    parentsLen = visit10_99_1(visit11_99_2(parents && parents.length) || 0);
    _$jscoverage['/custom/observable.js'].lineData[101]++;
    for (i = 0; visit12_101_1(visit13_101_2(i < parentsLen) && !customEventObject.isPropagationStopped()); i++) {
      _$jscoverage['/custom/observable.js'].lineData[103]++;
      ret = parents[i].fire(type, customEventObject);
      _$jscoverage['/custom/observable.js'].lineData[106]++;
      if (visit14_106_1(visit15_106_2(gRet !== false) && visit16_106_3(ret !== undefined))) {
        _$jscoverage['/custom/observable.js'].lineData[107]++;
        gRet = ret;
      }
    }
  }
  _$jscoverage['/custom/observable.js'].lineData[116]++;
  if (visit17_116_1(defaultFn && !customEventObject.isDefaultPrevented())) {
    _$jscoverage['/custom/observable.js'].lineData[117]++;
    var target = customEventObject.target, lowestCustomEventObservable = target.getCustomEventObservable(customEventObject.type);
    _$jscoverage['/custom/observable.js'].lineData[119]++;
    if (visit18_119_1((visit19_119_2(!self.defaultTargetOnly && !lowestCustomEventObservable.defaultTargetOnly)) || visit20_120_1(currentTarget == target))) {
      _$jscoverage['/custom/observable.js'].lineData[122]++;
      gRet = defaultFn.call(currentTarget, customEventObject);
    }
  }
  _$jscoverage['/custom/observable.js'].lineData[126]++;
  return gRet;
}, 
  notify: function(event) {
  _$jscoverage['/custom/observable.js'].functionData[4]++;
  _$jscoverage['/custom/observable.js'].lineData[138]++;
  var observers = [].concat(this.observers), ret, gRet, len = observers.length, i;
  _$jscoverage['/custom/observable.js'].lineData[144]++;
  for (i = 0; visit21_144_1(visit22_144_2(i < len) && !event.isImmediatePropagationStopped()); i++) {
    _$jscoverage['/custom/observable.js'].lineData[145]++;
    ret = observers[i].notify(event, this);
    _$jscoverage['/custom/observable.js'].lineData[146]++;
    if (visit23_146_1(visit24_146_2(gRet !== false) && visit25_146_3(ret !== undefined))) {
      _$jscoverage['/custom/observable.js'].lineData[147]++;
      gRet = ret;
    }
  }
  _$jscoverage['/custom/observable.js'].lineData[151]++;
  return gRet;
}, 
  detach: function(cfg) {
  _$jscoverage['/custom/observable.js'].functionData[5]++;
  _$jscoverage['/custom/observable.js'].lineData[159]++;
  var groupsRe, self = this, fn = cfg.fn, context = cfg.context, currentTarget = self.currentTarget, observers = self.observers, groups = cfg.groups;
  _$jscoverage['/custom/observable.js'].lineData[167]++;
  if (visit26_167_1(!observers.length)) {
    _$jscoverage['/custom/observable.js'].lineData[168]++;
    return;
  }
  _$jscoverage['/custom/observable.js'].lineData[171]++;
  if (visit27_171_1(groups)) {
    _$jscoverage['/custom/observable.js'].lineData[172]++;
    groupsRe = Utils.getGroupsRe(groups);
  }
  _$jscoverage['/custom/observable.js'].lineData[175]++;
  var i, j, t, observer, observerContext, len = observers.length;
  _$jscoverage['/custom/observable.js'].lineData[178]++;
  if (visit28_178_1(fn || groupsRe)) {
    _$jscoverage['/custom/observable.js'].lineData[179]++;
    context = visit29_179_1(context || currentTarget);
    _$jscoverage['/custom/observable.js'].lineData[181]++;
    for (i = 0 , j = 0 , t = []; visit30_181_1(i < len); ++i) {
      _$jscoverage['/custom/observable.js'].lineData[182]++;
      observer = observers[i];
      _$jscoverage['/custom/observable.js'].lineData[183]++;
      observerContext = visit31_183_1(observer.context || currentTarget);
      _$jscoverage['/custom/observable.js'].lineData[184]++;
      if (visit32_185_1((visit33_185_2(context != observerContext)) || visit34_187_1((visit35_187_2(fn && visit36_187_3(fn != observer.fn))) || (visit37_189_1(groupsRe && !observer.groups.match(groupsRe)))))) {
        _$jscoverage['/custom/observable.js'].lineData[191]++;
        t[j++] = observer;
      }
    }
    _$jscoverage['/custom/observable.js'].lineData[195]++;
    self.observers = t;
  } else {
    _$jscoverage['/custom/observable.js'].lineData[198]++;
    self.reset();
  }
}});
  _$jscoverage['/custom/observable.js'].lineData[207]++;
  return CustomEventObservable;
});
