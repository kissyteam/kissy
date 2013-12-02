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
  _$jscoverage['/custom/observable.js'].lineData[11] = 0;
  _$jscoverage['/custom/observable.js'].lineData[19] = 0;
  _$jscoverage['/custom/observable.js'].lineData[20] = 0;
  _$jscoverage['/custom/observable.js'].lineData[21] = 0;
  _$jscoverage['/custom/observable.js'].lineData[22] = 0;
  _$jscoverage['/custom/observable.js'].lineData[23] = 0;
  _$jscoverage['/custom/observable.js'].lineData[30] = 0;
  _$jscoverage['/custom/observable.js'].lineData[37] = 0;
  _$jscoverage['/custom/observable.js'].lineData[43] = 0;
  _$jscoverage['/custom/observable.js'].lineData[45] = 0;
  _$jscoverage['/custom/observable.js'].lineData[46] = 0;
  _$jscoverage['/custom/observable.js'].lineData[47] = 0;
  _$jscoverage['/custom/observable.js'].lineData[50] = 0;
  _$jscoverage['/custom/observable.js'].lineData[51] = 0;
  _$jscoverage['/custom/observable.js'].lineData[62] = 0;
  _$jscoverage['/custom/observable.js'].lineData[64] = 0;
  _$jscoverage['/custom/observable.js'].lineData[75] = 0;
  _$jscoverage['/custom/observable.js'].lineData[77] = 0;
  _$jscoverage['/custom/observable.js'].lineData[78] = 0;
  _$jscoverage['/custom/observable.js'].lineData[79] = 0;
  _$jscoverage['/custom/observable.js'].lineData[82] = 0;
  _$jscoverage['/custom/observable.js'].lineData[84] = 0;
  _$jscoverage['/custom/observable.js'].lineData[86] = 0;
  _$jscoverage['/custom/observable.js'].lineData[87] = 0;
  _$jscoverage['/custom/observable.js'].lineData[91] = 0;
  _$jscoverage['/custom/observable.js'].lineData[93] = 0;
  _$jscoverage['/custom/observable.js'].lineData[95] = 0;
  _$jscoverage['/custom/observable.js'].lineData[97] = 0;
  _$jscoverage['/custom/observable.js'].lineData[99] = 0;
  _$jscoverage['/custom/observable.js'].lineData[102] = 0;
  _$jscoverage['/custom/observable.js'].lineData[103] = 0;
  _$jscoverage['/custom/observable.js'].lineData[112] = 0;
  _$jscoverage['/custom/observable.js'].lineData[113] = 0;
  _$jscoverage['/custom/observable.js'].lineData[115] = 0;
  _$jscoverage['/custom/observable.js'].lineData[118] = 0;
  _$jscoverage['/custom/observable.js'].lineData[122] = 0;
  _$jscoverage['/custom/observable.js'].lineData[134] = 0;
  _$jscoverage['/custom/observable.js'].lineData[140] = 0;
  _$jscoverage['/custom/observable.js'].lineData[141] = 0;
  _$jscoverage['/custom/observable.js'].lineData[142] = 0;
  _$jscoverage['/custom/observable.js'].lineData[143] = 0;
  _$jscoverage['/custom/observable.js'].lineData[147] = 0;
  _$jscoverage['/custom/observable.js'].lineData[155] = 0;
  _$jscoverage['/custom/observable.js'].lineData[163] = 0;
  _$jscoverage['/custom/observable.js'].lineData[164] = 0;
  _$jscoverage['/custom/observable.js'].lineData[167] = 0;
  _$jscoverage['/custom/observable.js'].lineData[168] = 0;
  _$jscoverage['/custom/observable.js'].lineData[171] = 0;
  _$jscoverage['/custom/observable.js'].lineData[174] = 0;
  _$jscoverage['/custom/observable.js'].lineData[175] = 0;
  _$jscoverage['/custom/observable.js'].lineData[177] = 0;
  _$jscoverage['/custom/observable.js'].lineData[178] = 0;
  _$jscoverage['/custom/observable.js'].lineData[179] = 0;
  _$jscoverage['/custom/observable.js'].lineData[180] = 0;
  _$jscoverage['/custom/observable.js'].lineData[187] = 0;
  _$jscoverage['/custom/observable.js'].lineData[191] = 0;
  _$jscoverage['/custom/observable.js'].lineData[194] = 0;
  _$jscoverage['/custom/observable.js'].lineData[203] = 0;
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
  _$jscoverage['/custom/observable.js'].branchData['45'] = [];
  _$jscoverage['/custom/observable.js'].branchData['45'][1] = new BranchData();
  _$jscoverage['/custom/observable.js'].branchData['46'] = [];
  _$jscoverage['/custom/observable.js'].branchData['46'][1] = new BranchData();
  _$jscoverage['/custom/observable.js'].branchData['50'] = [];
  _$jscoverage['/custom/observable.js'].branchData['50'][1] = new BranchData();
  _$jscoverage['/custom/observable.js'].branchData['62'] = [];
  _$jscoverage['/custom/observable.js'].branchData['62'][1] = new BranchData();
  _$jscoverage['/custom/observable.js'].branchData['77'] = [];
  _$jscoverage['/custom/observable.js'].branchData['77'][1] = new BranchData();
  _$jscoverage['/custom/observable.js'].branchData['86'] = [];
  _$jscoverage['/custom/observable.js'].branchData['86'][1] = new BranchData();
  _$jscoverage['/custom/observable.js'].branchData['86'][2] = new BranchData();
  _$jscoverage['/custom/observable.js'].branchData['86'][3] = new BranchData();
  _$jscoverage['/custom/observable.js'].branchData['91'] = [];
  _$jscoverage['/custom/observable.js'].branchData['91'][1] = new BranchData();
  _$jscoverage['/custom/observable.js'].branchData['95'] = [];
  _$jscoverage['/custom/observable.js'].branchData['95'][1] = new BranchData();
  _$jscoverage['/custom/observable.js'].branchData['95'][2] = new BranchData();
  _$jscoverage['/custom/observable.js'].branchData['97'] = [];
  _$jscoverage['/custom/observable.js'].branchData['97'][1] = new BranchData();
  _$jscoverage['/custom/observable.js'].branchData['97'][2] = new BranchData();
  _$jscoverage['/custom/observable.js'].branchData['102'] = [];
  _$jscoverage['/custom/observable.js'].branchData['102'][1] = new BranchData();
  _$jscoverage['/custom/observable.js'].branchData['102'][2] = new BranchData();
  _$jscoverage['/custom/observable.js'].branchData['102'][3] = new BranchData();
  _$jscoverage['/custom/observable.js'].branchData['112'] = [];
  _$jscoverage['/custom/observable.js'].branchData['112'][1] = new BranchData();
  _$jscoverage['/custom/observable.js'].branchData['115'] = [];
  _$jscoverage['/custom/observable.js'].branchData['115'][1] = new BranchData();
  _$jscoverage['/custom/observable.js'].branchData['115'][2] = new BranchData();
  _$jscoverage['/custom/observable.js'].branchData['116'] = [];
  _$jscoverage['/custom/observable.js'].branchData['116'][1] = new BranchData();
  _$jscoverage['/custom/observable.js'].branchData['140'] = [];
  _$jscoverage['/custom/observable.js'].branchData['140'][1] = new BranchData();
  _$jscoverage['/custom/observable.js'].branchData['140'][2] = new BranchData();
  _$jscoverage['/custom/observable.js'].branchData['142'] = [];
  _$jscoverage['/custom/observable.js'].branchData['142'][1] = new BranchData();
  _$jscoverage['/custom/observable.js'].branchData['142'][2] = new BranchData();
  _$jscoverage['/custom/observable.js'].branchData['142'][3] = new BranchData();
  _$jscoverage['/custom/observable.js'].branchData['163'] = [];
  _$jscoverage['/custom/observable.js'].branchData['163'][1] = new BranchData();
  _$jscoverage['/custom/observable.js'].branchData['167'] = [];
  _$jscoverage['/custom/observable.js'].branchData['167'][1] = new BranchData();
  _$jscoverage['/custom/observable.js'].branchData['174'] = [];
  _$jscoverage['/custom/observable.js'].branchData['174'][1] = new BranchData();
  _$jscoverage['/custom/observable.js'].branchData['175'] = [];
  _$jscoverage['/custom/observable.js'].branchData['175'][1] = new BranchData();
  _$jscoverage['/custom/observable.js'].branchData['177'] = [];
  _$jscoverage['/custom/observable.js'].branchData['177'][1] = new BranchData();
  _$jscoverage['/custom/observable.js'].branchData['179'] = [];
  _$jscoverage['/custom/observable.js'].branchData['179'][1] = new BranchData();
  _$jscoverage['/custom/observable.js'].branchData['181'] = [];
  _$jscoverage['/custom/observable.js'].branchData['181'][1] = new BranchData();
  _$jscoverage['/custom/observable.js'].branchData['181'][2] = new BranchData();
  _$jscoverage['/custom/observable.js'].branchData['183'] = [];
  _$jscoverage['/custom/observable.js'].branchData['183'][1] = new BranchData();
  _$jscoverage['/custom/observable.js'].branchData['183'][2] = new BranchData();
  _$jscoverage['/custom/observable.js'].branchData['183'][3] = new BranchData();
  _$jscoverage['/custom/observable.js'].branchData['185'] = [];
  _$jscoverage['/custom/observable.js'].branchData['185'][1] = new BranchData();
}
_$jscoverage['/custom/observable.js'].branchData['185'][1].init(125, 44, 'groupsRe && !observer.groups.match(groupsRe)');
function visit37_185_1(result) {
  _$jscoverage['/custom/observable.js'].branchData['185'][1].ranCondition(result);
  return result;
}_$jscoverage['/custom/observable.js'].branchData['183'][3].init(284, 18, 'fn !== observer.fn');
function visit36_183_3(result) {
  _$jscoverage['/custom/observable.js'].branchData['183'][3].ranCondition(result);
  return result;
}_$jscoverage['/custom/observable.js'].branchData['183'][2].init(278, 24, 'fn && fn !== observer.fn');
function visit35_183_2(result) {
  _$jscoverage['/custom/observable.js'].branchData['183'][2].ranCondition(result);
  return result;
}_$jscoverage['/custom/observable.js'].branchData['183'][1].init(106, 171, '(fn && fn !== observer.fn) || (groupsRe && !observer.groups.match(groupsRe))');
function visit34_183_1(result) {
  _$jscoverage['/custom/observable.js'].branchData['183'][1].ranCondition(result);
  return result;
}_$jscoverage['/custom/observable.js'].branchData['181'][2].init(170, 27, 'context !== observerContext');
function visit33_181_2(result) {
  _$jscoverage['/custom/observable.js'].branchData['181'][2].ranCondition(result);
  return result;
}_$jscoverage['/custom/observable.js'].branchData['181'][1].init(29, 278, '(context !== observerContext) || (fn && fn !== observer.fn) || (groupsRe && !observer.groups.match(groupsRe))');
function visit32_181_1(result) {
  _$jscoverage['/custom/observable.js'].branchData['181'][1].ranCondition(result);
  return result;
}_$jscoverage['/custom/observable.js'].branchData['179'][1].init(84, 33, 'observer.context || currentTarget');
function visit31_179_1(result) {
  _$jscoverage['/custom/observable.js'].branchData['179'][1].ranCondition(result);
  return result;
}_$jscoverage['/custom/observable.js'].branchData['177'][1].init(97, 7, 'i < len');
function visit30_177_1(result) {
  _$jscoverage['/custom/observable.js'].branchData['177'][1].ranCondition(result);
  return result;
}_$jscoverage['/custom/observable.js'].branchData['175'][1].init(27, 24, 'context || currentTarget');
function visit29_175_1(result) {
  _$jscoverage['/custom/observable.js'].branchData['175'][1].ranCondition(result);
  return result;
}_$jscoverage['/custom/observable.js'].branchData['174'][1].init(543, 14, 'fn || groupsRe');
function visit28_174_1(result) {
  _$jscoverage['/custom/observable.js'].branchData['174'][1].ranCondition(result);
  return result;
}_$jscoverage['/custom/observable.js'].branchData['167'][1].init(350, 6, 'groups');
function visit27_167_1(result) {
  _$jscoverage['/custom/observable.js'].branchData['167'][1].ranCondition(result);
  return result;
}_$jscoverage['/custom/observable.js'].branchData['163'][1].init(274, 17, '!observers.length');
function visit26_163_1(result) {
  _$jscoverage['/custom/observable.js'].branchData['163'][1].ranCondition(result);
  return result;
}_$jscoverage['/custom/observable.js'].branchData['142'][3].init(95, 17, 'ret !== undefined');
function visit25_142_3(result) {
  _$jscoverage['/custom/observable.js'].branchData['142'][3].ranCondition(result);
  return result;
}_$jscoverage['/custom/observable.js'].branchData['142'][2].init(77, 14, 'gRet !== false');
function visit24_142_2(result) {
  _$jscoverage['/custom/observable.js'].branchData['142'][2].ranCondition(result);
  return result;
}_$jscoverage['/custom/observable.js'].branchData['142'][1].init(77, 35, 'gRet !== false && ret !== undefined');
function visit23_142_1(result) {
  _$jscoverage['/custom/observable.js'].branchData['142'][1].ranCondition(result);
  return result;
}_$jscoverage['/custom/observable.js'].branchData['140'][2].init(246, 7, 'i < len');
function visit22_140_2(result) {
  _$jscoverage['/custom/observable.js'].branchData['140'][2].ranCondition(result);
  return result;
}_$jscoverage['/custom/observable.js'].branchData['140'][1].init(246, 49, 'i < len && !event.isImmediatePropagationStopped()');
function visit21_140_1(result) {
  _$jscoverage['/custom/observable.js'].branchData['140'][1].ranCondition(result);
  return result;
}_$jscoverage['/custom/observable.js'].branchData['116'][1].init(97, 24, 'currentTarget === target');
function visit20_116_1(result) {
  _$jscoverage['/custom/observable.js'].branchData['116'][1].ranCondition(result);
  return result;
}_$jscoverage['/custom/observable.js'].branchData['115'][2].init(184, 73, '!self.defaultTargetOnly && !lowestCustomEventObservable.defaultTargetOnly');
function visit19_115_2(result) {
  _$jscoverage['/custom/observable.js'].branchData['115'][2].ranCondition(result);
  return result;
}_$jscoverage['/custom/observable.js'].branchData['115'][1].init(184, 122, '(!self.defaultTargetOnly && !lowestCustomEventObservable.defaultTargetOnly) || currentTarget === target');
function visit18_115_1(result) {
  _$jscoverage['/custom/observable.js'].branchData['115'][1].ranCondition(result);
  return result;
}_$jscoverage['/custom/observable.js'].branchData['112'][1].init(1558, 52, 'defaultFn && !customEventObject.isDefaultPrevented()');
function visit17_112_1(result) {
  _$jscoverage['/custom/observable.js'].branchData['112'][1].ranCondition(result);
  return result;
}_$jscoverage['/custom/observable.js'].branchData['102'][3].init(147, 17, 'ret !== undefined');
function visit16_102_3(result) {
  _$jscoverage['/custom/observable.js'].branchData['102'][3].ranCondition(result);
  return result;
}_$jscoverage['/custom/observable.js'].branchData['102'][2].init(129, 14, 'gRet !== false');
function visit15_102_2(result) {
  _$jscoverage['/custom/observable.js'].branchData['102'][2].ranCondition(result);
  return result;
}_$jscoverage['/custom/observable.js'].branchData['102'][1].init(129, 35, 'gRet !== false && ret !== undefined');
function visit14_102_1(result) {
  _$jscoverage['/custom/observable.js'].branchData['102'][1].ranCondition(result);
  return result;
}_$jscoverage['/custom/observable.js'].branchData['97'][2].init(147, 14, 'i < parentsLen');
function visit13_97_2(result) {
  _$jscoverage['/custom/observable.js'].branchData['97'][2].ranCondition(result);
  return result;
}_$jscoverage['/custom/observable.js'].branchData['97'][1].init(147, 59, 'i < parentsLen && !customEventObject.isPropagationStopped()');
function visit12_97_1(result) {
  _$jscoverage['/custom/observable.js'].branchData['97'][1].ranCondition(result);
  return result;
}_$jscoverage['/custom/observable.js'].branchData['95'][2].init(86, 25, 'parents && parents.length');
function visit11_95_2(result) {
  _$jscoverage['/custom/observable.js'].branchData['95'][2].ranCondition(result);
  return result;
}_$jscoverage['/custom/observable.js'].branchData['95'][1].init(86, 30, 'parents && parents.length || 0');
function visit10_95_1(result) {
  _$jscoverage['/custom/observable.js'].branchData['95'][1].ranCondition(result);
  return result;
}_$jscoverage['/custom/observable.js'].branchData['91'][1].init(911, 52, 'bubbles && !customEventObject.isPropagationStopped()');
function visit9_91_1(result) {
  _$jscoverage['/custom/observable.js'].branchData['91'][1].ranCondition(result);
  return result;
}_$jscoverage['/custom/observable.js'].branchData['86'][3].init(793, 17, 'ret !== undefined');
function visit8_86_3(result) {
  _$jscoverage['/custom/observable.js'].branchData['86'][3].ranCondition(result);
  return result;
}_$jscoverage['/custom/observable.js'].branchData['86'][2].init(775, 14, 'gRet !== false');
function visit7_86_2(result) {
  _$jscoverage['/custom/observable.js'].branchData['86'][2].ranCondition(result);
  return result;
}_$jscoverage['/custom/observable.js'].branchData['86'][1].init(775, 35, 'gRet !== false && ret !== undefined');
function visit6_86_1(result) {
  _$jscoverage['/custom/observable.js'].branchData['86'][1].ranCondition(result);
  return result;
}_$jscoverage['/custom/observable.js'].branchData['77'][1].init(441, 50, '!(customEventObject instanceof CustomEventObject)');
function visit5_77_1(result) {
  _$jscoverage['/custom/observable.js'].branchData['77'][1].ranCondition(result);
  return result;
}_$jscoverage['/custom/observable.js'].branchData['62'][1].init(25, 15, 'eventData || {}');
function visit4_62_1(result) {
  _$jscoverage['/custom/observable.js'].branchData['62'][1].ranCondition(result);
  return result;
}_$jscoverage['/custom/observable.js'].branchData['50'][1].init(308, 34, 'this.findObserver(observer) === -1');
function visit3_50_1(result) {
  _$jscoverage['/custom/observable.js'].branchData['50'][1].ranCondition(result);
  return result;
}_$jscoverage['/custom/observable.js'].branchData['46'][1].init(21, 12, '!observer.fn');
function visit2_46_1(result) {
  _$jscoverage['/custom/observable.js'].branchData['46'][1].ranCondition(result);
  return result;
}_$jscoverage['/custom/observable.js'].branchData['45'][1].init(138, 14, 'S.Config.debug');
function visit1_45_1(result) {
  _$jscoverage['/custom/observable.js'].branchData['45'][1].ranCondition(result);
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
  _$jscoverage['/custom/observable.js'].lineData[11]++;
  var Utils = BaseEvent.Utils;
  _$jscoverage['/custom/observable.js'].lineData[19]++;
  function CustomEventObservable() {
    _$jscoverage['/custom/observable.js'].functionData[1]++;
    _$jscoverage['/custom/observable.js'].lineData[20]++;
    var self = this;
    _$jscoverage['/custom/observable.js'].lineData[21]++;
    CustomEventObservable.superclass.constructor.apply(self, arguments);
    _$jscoverage['/custom/observable.js'].lineData[22]++;
    self.defaultFn = null;
    _$jscoverage['/custom/observable.js'].lineData[23]++;
    self.defaultTargetOnly = false;
    _$jscoverage['/custom/observable.js'].lineData[30]++;
    self.bubbles = true;
  }
  _$jscoverage['/custom/observable.js'].lineData[37]++;
  S.extend(CustomEventObservable, BaseEvent.Observable, {
  on: function(cfg) {
  _$jscoverage['/custom/observable.js'].functionData[2]++;
  _$jscoverage['/custom/observable.js'].lineData[43]++;
  var observer = new CustomEventObserver(cfg);
  _$jscoverage['/custom/observable.js'].lineData[45]++;
  if (visit1_45_1(S.Config.debug)) {
    _$jscoverage['/custom/observable.js'].lineData[46]++;
    if (visit2_46_1(!observer.fn)) {
      _$jscoverage['/custom/observable.js'].lineData[47]++;
      S.error('lack event handler for ' + this.type);
    }
  }
  _$jscoverage['/custom/observable.js'].lineData[50]++;
  if (visit3_50_1(this.findObserver(observer) === -1)) {
    _$jscoverage['/custom/observable.js'].lineData[51]++;
    this.observers.push(observer);
  }
}, 
  fire: function(eventData) {
  _$jscoverage['/custom/observable.js'].functionData[3]++;
  _$jscoverage['/custom/observable.js'].lineData[62]++;
  eventData = visit4_62_1(eventData || {});
  _$jscoverage['/custom/observable.js'].lineData[64]++;
  var self = this, bubbles = self.bubbles, currentTarget = self.currentTarget, parents, parentsLen, type = self.type, defaultFn = self.defaultFn, i, customEventObject = eventData, gRet, ret;
  _$jscoverage['/custom/observable.js'].lineData[75]++;
  eventData.type = type;
  _$jscoverage['/custom/observable.js'].lineData[77]++;
  if (visit5_77_1(!(customEventObject instanceof CustomEventObject))) {
    _$jscoverage['/custom/observable.js'].lineData[78]++;
    customEventObject.target = currentTarget;
    _$jscoverage['/custom/observable.js'].lineData[79]++;
    customEventObject = new CustomEventObject(customEventObject);
  }
  _$jscoverage['/custom/observable.js'].lineData[82]++;
  customEventObject.currentTarget = currentTarget;
  _$jscoverage['/custom/observable.js'].lineData[84]++;
  ret = self.notify(customEventObject);
  _$jscoverage['/custom/observable.js'].lineData[86]++;
  if (visit6_86_1(visit7_86_2(gRet !== false) && visit8_86_3(ret !== undefined))) {
    _$jscoverage['/custom/observable.js'].lineData[87]++;
    gRet = ret;
  }
  _$jscoverage['/custom/observable.js'].lineData[91]++;
  if (visit9_91_1(bubbles && !customEventObject.isPropagationStopped())) {
    _$jscoverage['/custom/observable.js'].lineData[93]++;
    parents = currentTarget.getTargets();
    _$jscoverage['/custom/observable.js'].lineData[95]++;
    parentsLen = visit10_95_1(visit11_95_2(parents && parents.length) || 0);
    _$jscoverage['/custom/observable.js'].lineData[97]++;
    for (i = 0; visit12_97_1(visit13_97_2(i < parentsLen) && !customEventObject.isPropagationStopped()); i++) {
      _$jscoverage['/custom/observable.js'].lineData[99]++;
      ret = parents[i].fire(type, customEventObject);
      _$jscoverage['/custom/observable.js'].lineData[102]++;
      if (visit14_102_1(visit15_102_2(gRet !== false) && visit16_102_3(ret !== undefined))) {
        _$jscoverage['/custom/observable.js'].lineData[103]++;
        gRet = ret;
      }
    }
  }
  _$jscoverage['/custom/observable.js'].lineData[112]++;
  if (visit17_112_1(defaultFn && !customEventObject.isDefaultPrevented())) {
    _$jscoverage['/custom/observable.js'].lineData[113]++;
    var target = customEventObject.target, lowestCustomEventObservable = target.getCustomEventObservable(customEventObject.type);
    _$jscoverage['/custom/observable.js'].lineData[115]++;
    if (visit18_115_1((visit19_115_2(!self.defaultTargetOnly && !lowestCustomEventObservable.defaultTargetOnly)) || visit20_116_1(currentTarget === target))) {
      _$jscoverage['/custom/observable.js'].lineData[118]++;
      gRet = defaultFn.call(currentTarget, customEventObject);
    }
  }
  _$jscoverage['/custom/observable.js'].lineData[122]++;
  return gRet;
}, 
  notify: function(event) {
  _$jscoverage['/custom/observable.js'].functionData[4]++;
  _$jscoverage['/custom/observable.js'].lineData[134]++;
  var observers = [].concat(this.observers), ret, gRet, len = observers.length, i;
  _$jscoverage['/custom/observable.js'].lineData[140]++;
  for (i = 0; visit21_140_1(visit22_140_2(i < len) && !event.isImmediatePropagationStopped()); i++) {
    _$jscoverage['/custom/observable.js'].lineData[141]++;
    ret = observers[i].notify(event, this);
    _$jscoverage['/custom/observable.js'].lineData[142]++;
    if (visit23_142_1(visit24_142_2(gRet !== false) && visit25_142_3(ret !== undefined))) {
      _$jscoverage['/custom/observable.js'].lineData[143]++;
      gRet = ret;
    }
  }
  _$jscoverage['/custom/observable.js'].lineData[147]++;
  return gRet;
}, 
  detach: function(cfg) {
  _$jscoverage['/custom/observable.js'].functionData[5]++;
  _$jscoverage['/custom/observable.js'].lineData[155]++;
  var groupsRe, self = this, fn = cfg.fn, context = cfg.context, currentTarget = self.currentTarget, observers = self.observers, groups = cfg.groups;
  _$jscoverage['/custom/observable.js'].lineData[163]++;
  if (visit26_163_1(!observers.length)) {
    _$jscoverage['/custom/observable.js'].lineData[164]++;
    return;
  }
  _$jscoverage['/custom/observable.js'].lineData[167]++;
  if (visit27_167_1(groups)) {
    _$jscoverage['/custom/observable.js'].lineData[168]++;
    groupsRe = Utils.getGroupsRe(groups);
  }
  _$jscoverage['/custom/observable.js'].lineData[171]++;
  var i, j, t, observer, observerContext, len = observers.length;
  _$jscoverage['/custom/observable.js'].lineData[174]++;
  if (visit28_174_1(fn || groupsRe)) {
    _$jscoverage['/custom/observable.js'].lineData[175]++;
    context = visit29_175_1(context || currentTarget);
    _$jscoverage['/custom/observable.js'].lineData[177]++;
    for (i = 0 , j = 0 , t = []; visit30_177_1(i < len); ++i) {
      _$jscoverage['/custom/observable.js'].lineData[178]++;
      observer = observers[i];
      _$jscoverage['/custom/observable.js'].lineData[179]++;
      observerContext = visit31_179_1(observer.context || currentTarget);
      _$jscoverage['/custom/observable.js'].lineData[180]++;
      if (visit32_181_1((visit33_181_2(context !== observerContext)) || visit34_183_1((visit35_183_2(fn && visit36_183_3(fn !== observer.fn))) || (visit37_185_1(groupsRe && !observer.groups.match(groupsRe)))))) {
        _$jscoverage['/custom/observable.js'].lineData[187]++;
        t[j++] = observer;
      }
    }
    _$jscoverage['/custom/observable.js'].lineData[191]++;
    self.observers = t;
  } else {
    _$jscoverage['/custom/observable.js'].lineData[194]++;
    self.reset();
  }
}});
  _$jscoverage['/custom/observable.js'].lineData[203]++;
  return CustomEventObservable;
});
