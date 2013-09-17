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
  _$jscoverage['/custom/observable.js'].lineData[17] = 0;
  _$jscoverage['/custom/observable.js'].lineData[18] = 0;
  _$jscoverage['/custom/observable.js'].lineData[19] = 0;
  _$jscoverage['/custom/observable.js'].lineData[20] = 0;
  _$jscoverage['/custom/observable.js'].lineData[21] = 0;
  _$jscoverage['/custom/observable.js'].lineData[28] = 0;
  _$jscoverage['/custom/observable.js'].lineData[35] = 0;
  _$jscoverage['/custom/observable.js'].lineData[41] = 0;
  _$jscoverage['/custom/observable.js'].lineData[43] = 0;
  _$jscoverage['/custom/observable.js'].lineData[44] = 0;
  _$jscoverage['/custom/observable.js'].lineData[45] = 0;
  _$jscoverage['/custom/observable.js'].lineData[48] = 0;
  _$jscoverage['/custom/observable.js'].lineData[49] = 0;
  _$jscoverage['/custom/observable.js'].lineData[60] = 0;
  _$jscoverage['/custom/observable.js'].lineData[62] = 0;
  _$jscoverage['/custom/observable.js'].lineData[73] = 0;
  _$jscoverage['/custom/observable.js'].lineData[75] = 0;
  _$jscoverage['/custom/observable.js'].lineData[76] = 0;
  _$jscoverage['/custom/observable.js'].lineData[77] = 0;
  _$jscoverage['/custom/observable.js'].lineData[80] = 0;
  _$jscoverage['/custom/observable.js'].lineData[82] = 0;
  _$jscoverage['/custom/observable.js'].lineData[84] = 0;
  _$jscoverage['/custom/observable.js'].lineData[85] = 0;
  _$jscoverage['/custom/observable.js'].lineData[89] = 0;
  _$jscoverage['/custom/observable.js'].lineData[91] = 0;
  _$jscoverage['/custom/observable.js'].lineData[93] = 0;
  _$jscoverage['/custom/observable.js'].lineData[95] = 0;
  _$jscoverage['/custom/observable.js'].lineData[97] = 0;
  _$jscoverage['/custom/observable.js'].lineData[100] = 0;
  _$jscoverage['/custom/observable.js'].lineData[101] = 0;
  _$jscoverage['/custom/observable.js'].lineData[110] = 0;
  _$jscoverage['/custom/observable.js'].lineData[111] = 0;
  _$jscoverage['/custom/observable.js'].lineData[113] = 0;
  _$jscoverage['/custom/observable.js'].lineData[116] = 0;
  _$jscoverage['/custom/observable.js'].lineData[120] = 0;
  _$jscoverage['/custom/observable.js'].lineData[132] = 0;
  _$jscoverage['/custom/observable.js'].lineData[138] = 0;
  _$jscoverage['/custom/observable.js'].lineData[139] = 0;
  _$jscoverage['/custom/observable.js'].lineData[140] = 0;
  _$jscoverage['/custom/observable.js'].lineData[141] = 0;
  _$jscoverage['/custom/observable.js'].lineData[145] = 0;
  _$jscoverage['/custom/observable.js'].lineData[153] = 0;
  _$jscoverage['/custom/observable.js'].lineData[161] = 0;
  _$jscoverage['/custom/observable.js'].lineData[162] = 0;
  _$jscoverage['/custom/observable.js'].lineData[165] = 0;
  _$jscoverage['/custom/observable.js'].lineData[166] = 0;
  _$jscoverage['/custom/observable.js'].lineData[169] = 0;
  _$jscoverage['/custom/observable.js'].lineData[172] = 0;
  _$jscoverage['/custom/observable.js'].lineData[173] = 0;
  _$jscoverage['/custom/observable.js'].lineData[175] = 0;
  _$jscoverage['/custom/observable.js'].lineData[176] = 0;
  _$jscoverage['/custom/observable.js'].lineData[177] = 0;
  _$jscoverage['/custom/observable.js'].lineData[178] = 0;
  _$jscoverage['/custom/observable.js'].lineData[185] = 0;
  _$jscoverage['/custom/observable.js'].lineData[189] = 0;
  _$jscoverage['/custom/observable.js'].lineData[192] = 0;
  _$jscoverage['/custom/observable.js'].lineData[201] = 0;
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
  _$jscoverage['/custom/observable.js'].branchData['43'] = [];
  _$jscoverage['/custom/observable.js'].branchData['43'][1] = new BranchData();
  _$jscoverage['/custom/observable.js'].branchData['44'] = [];
  _$jscoverage['/custom/observable.js'].branchData['44'][1] = new BranchData();
  _$jscoverage['/custom/observable.js'].branchData['48'] = [];
  _$jscoverage['/custom/observable.js'].branchData['48'][1] = new BranchData();
  _$jscoverage['/custom/observable.js'].branchData['60'] = [];
  _$jscoverage['/custom/observable.js'].branchData['60'][1] = new BranchData();
  _$jscoverage['/custom/observable.js'].branchData['75'] = [];
  _$jscoverage['/custom/observable.js'].branchData['75'][1] = new BranchData();
  _$jscoverage['/custom/observable.js'].branchData['84'] = [];
  _$jscoverage['/custom/observable.js'].branchData['84'][1] = new BranchData();
  _$jscoverage['/custom/observable.js'].branchData['84'][2] = new BranchData();
  _$jscoverage['/custom/observable.js'].branchData['84'][3] = new BranchData();
  _$jscoverage['/custom/observable.js'].branchData['89'] = [];
  _$jscoverage['/custom/observable.js'].branchData['89'][1] = new BranchData();
  _$jscoverage['/custom/observable.js'].branchData['93'] = [];
  _$jscoverage['/custom/observable.js'].branchData['93'][1] = new BranchData();
  _$jscoverage['/custom/observable.js'].branchData['93'][2] = new BranchData();
  _$jscoverage['/custom/observable.js'].branchData['95'] = [];
  _$jscoverage['/custom/observable.js'].branchData['95'][1] = new BranchData();
  _$jscoverage['/custom/observable.js'].branchData['95'][2] = new BranchData();
  _$jscoverage['/custom/observable.js'].branchData['100'] = [];
  _$jscoverage['/custom/observable.js'].branchData['100'][1] = new BranchData();
  _$jscoverage['/custom/observable.js'].branchData['100'][2] = new BranchData();
  _$jscoverage['/custom/observable.js'].branchData['100'][3] = new BranchData();
  _$jscoverage['/custom/observable.js'].branchData['110'] = [];
  _$jscoverage['/custom/observable.js'].branchData['110'][1] = new BranchData();
  _$jscoverage['/custom/observable.js'].branchData['113'] = [];
  _$jscoverage['/custom/observable.js'].branchData['113'][1] = new BranchData();
  _$jscoverage['/custom/observable.js'].branchData['113'][2] = new BranchData();
  _$jscoverage['/custom/observable.js'].branchData['114'] = [];
  _$jscoverage['/custom/observable.js'].branchData['114'][1] = new BranchData();
  _$jscoverage['/custom/observable.js'].branchData['138'] = [];
  _$jscoverage['/custom/observable.js'].branchData['138'][1] = new BranchData();
  _$jscoverage['/custom/observable.js'].branchData['138'][2] = new BranchData();
  _$jscoverage['/custom/observable.js'].branchData['140'] = [];
  _$jscoverage['/custom/observable.js'].branchData['140'][1] = new BranchData();
  _$jscoverage['/custom/observable.js'].branchData['140'][2] = new BranchData();
  _$jscoverage['/custom/observable.js'].branchData['140'][3] = new BranchData();
  _$jscoverage['/custom/observable.js'].branchData['161'] = [];
  _$jscoverage['/custom/observable.js'].branchData['161'][1] = new BranchData();
  _$jscoverage['/custom/observable.js'].branchData['165'] = [];
  _$jscoverage['/custom/observable.js'].branchData['165'][1] = new BranchData();
  _$jscoverage['/custom/observable.js'].branchData['172'] = [];
  _$jscoverage['/custom/observable.js'].branchData['172'][1] = new BranchData();
  _$jscoverage['/custom/observable.js'].branchData['173'] = [];
  _$jscoverage['/custom/observable.js'].branchData['173'][1] = new BranchData();
  _$jscoverage['/custom/observable.js'].branchData['175'] = [];
  _$jscoverage['/custom/observable.js'].branchData['175'][1] = new BranchData();
  _$jscoverage['/custom/observable.js'].branchData['177'] = [];
  _$jscoverage['/custom/observable.js'].branchData['177'][1] = new BranchData();
  _$jscoverage['/custom/observable.js'].branchData['179'] = [];
  _$jscoverage['/custom/observable.js'].branchData['179'][1] = new BranchData();
  _$jscoverage['/custom/observable.js'].branchData['179'][2] = new BranchData();
  _$jscoverage['/custom/observable.js'].branchData['181'] = [];
  _$jscoverage['/custom/observable.js'].branchData['181'][1] = new BranchData();
  _$jscoverage['/custom/observable.js'].branchData['181'][2] = new BranchData();
  _$jscoverage['/custom/observable.js'].branchData['181'][3] = new BranchData();
  _$jscoverage['/custom/observable.js'].branchData['183'] = [];
  _$jscoverage['/custom/observable.js'].branchData['183'][1] = new BranchData();
}
_$jscoverage['/custom/observable.js'].branchData['183'][1].init(126, 44, 'groupsRe && !observer.groups.match(groupsRe)');
function visit37_183_1(result) {
  _$jscoverage['/custom/observable.js'].branchData['183'][1].ranCondition(result);
  return result;
}_$jscoverage['/custom/observable.js'].branchData['181'][3].init(289, 17, 'fn != observer.fn');
function visit36_181_3(result) {
  _$jscoverage['/custom/observable.js'].branchData['181'][3].ranCondition(result);
  return result;
}_$jscoverage['/custom/observable.js'].branchData['181'][2].init(283, 23, 'fn && fn != observer.fn');
function visit35_181_2(result) {
  _$jscoverage['/custom/observable.js'].branchData['181'][2].ranCondition(result);
  return result;
}_$jscoverage['/custom/observable.js'].branchData['181'][1].init(107, 172, '(fn && fn != observer.fn) || (groupsRe && !observer.groups.match(groupsRe))');
function visit34_181_1(result) {
  _$jscoverage['/custom/observable.js'].branchData['181'][1].ranCondition(result);
  return result;
}_$jscoverage['/custom/observable.js'].branchData['179'][2].init(174, 26, 'context != observerContext');
function visit33_179_2(result) {
  _$jscoverage['/custom/observable.js'].branchData['179'][2].ranCondition(result);
  return result;
}_$jscoverage['/custom/observable.js'].branchData['179'][1].init(30, 280, '(context != observerContext) || (fn && fn != observer.fn) || (groupsRe && !observer.groups.match(groupsRe))');
function visit32_179_1(result) {
  _$jscoverage['/custom/observable.js'].branchData['179'][1].ranCondition(result);
  return result;
}_$jscoverage['/custom/observable.js'].branchData['177'][1].init(86, 33, 'observer.context || currentTarget');
function visit31_177_1(result) {
  _$jscoverage['/custom/observable.js'].branchData['177'][1].ranCondition(result);
  return result;
}_$jscoverage['/custom/observable.js'].branchData['175'][1].init(100, 7, 'i < len');
function visit30_175_1(result) {
  _$jscoverage['/custom/observable.js'].branchData['175'][1].ranCondition(result);
  return result;
}_$jscoverage['/custom/observable.js'].branchData['173'][1].init(28, 24, 'context || currentTarget');
function visit29_173_1(result) {
  _$jscoverage['/custom/observable.js'].branchData['173'][1].ranCondition(result);
  return result;
}_$jscoverage['/custom/observable.js'].branchData['172'][1].init(563, 14, 'fn || groupsRe');
function visit28_172_1(result) {
  _$jscoverage['/custom/observable.js'].branchData['172'][1].ranCondition(result);
  return result;
}_$jscoverage['/custom/observable.js'].branchData['165'][1].init(363, 6, 'groups');
function visit27_165_1(result) {
  _$jscoverage['/custom/observable.js'].branchData['165'][1].ranCondition(result);
  return result;
}_$jscoverage['/custom/observable.js'].branchData['161'][1].init(283, 17, '!observers.length');
function visit26_161_1(result) {
  _$jscoverage['/custom/observable.js'].branchData['161'][1].ranCondition(result);
  return result;
}_$jscoverage['/custom/observable.js'].branchData['140'][3].init(97, 17, 'ret !== undefined');
function visit25_140_3(result) {
  _$jscoverage['/custom/observable.js'].branchData['140'][3].ranCondition(result);
  return result;
}_$jscoverage['/custom/observable.js'].branchData['140'][2].init(79, 14, 'gRet !== false');
function visit24_140_2(result) {
  _$jscoverage['/custom/observable.js'].branchData['140'][2].ranCondition(result);
  return result;
}_$jscoverage['/custom/observable.js'].branchData['140'][1].init(79, 35, 'gRet !== false && ret !== undefined');
function visit23_140_1(result) {
  _$jscoverage['/custom/observable.js'].branchData['140'][1].ranCondition(result);
  return result;
}_$jscoverage['/custom/observable.js'].branchData['138'][2].init(254, 7, 'i < len');
function visit22_138_2(result) {
  _$jscoverage['/custom/observable.js'].branchData['138'][2].ranCondition(result);
  return result;
}_$jscoverage['/custom/observable.js'].branchData['138'][1].init(254, 49, 'i < len && !event.isImmediatePropagationStopped()');
function visit21_138_1(result) {
  _$jscoverage['/custom/observable.js'].branchData['138'][1].ranCondition(result);
  return result;
}_$jscoverage['/custom/observable.js'].branchData['114'][1].init(98, 23, 'currentTarget == target');
function visit20_114_1(result) {
  _$jscoverage['/custom/observable.js'].branchData['114'][1].ranCondition(result);
  return result;
}_$jscoverage['/custom/observable.js'].branchData['113'][2].init(185, 73, '!self.defaultTargetOnly && !lowestCustomEventObservable.defaultTargetOnly');
function visit19_113_2(result) {
  _$jscoverage['/custom/observable.js'].branchData['113'][2].ranCondition(result);
  return result;
}_$jscoverage['/custom/observable.js'].branchData['113'][1].init(185, 122, '(!self.defaultTargetOnly && !lowestCustomEventObservable.defaultTargetOnly) || currentTarget == target');
function visit18_113_1(result) {
  _$jscoverage['/custom/observable.js'].branchData['113'][1].ranCondition(result);
  return result;
}_$jscoverage['/custom/observable.js'].branchData['110'][1].init(1608, 52, 'defaultFn && !customEventObject.isDefaultPrevented()');
function visit17_110_1(result) {
  _$jscoverage['/custom/observable.js'].branchData['110'][1].ranCondition(result);
  return result;
}_$jscoverage['/custom/observable.js'].branchData['100'][3].init(152, 17, 'ret !== undefined');
function visit16_100_3(result) {
  _$jscoverage['/custom/observable.js'].branchData['100'][3].ranCondition(result);
  return result;
}_$jscoverage['/custom/observable.js'].branchData['100'][2].init(134, 14, 'gRet !== false');
function visit15_100_2(result) {
  _$jscoverage['/custom/observable.js'].branchData['100'][2].ranCondition(result);
  return result;
}_$jscoverage['/custom/observable.js'].branchData['100'][1].init(134, 35, 'gRet !== false && ret !== undefined');
function visit14_100_1(result) {
  _$jscoverage['/custom/observable.js'].branchData['100'][1].ranCondition(result);
  return result;
}_$jscoverage['/custom/observable.js'].branchData['95'][2].init(153, 14, 'i < parentsLen');
function visit13_95_2(result) {
  _$jscoverage['/custom/observable.js'].branchData['95'][2].ranCondition(result);
  return result;
}_$jscoverage['/custom/observable.js'].branchData['95'][1].init(153, 59, 'i < parentsLen && !customEventObject.isPropagationStopped()');
function visit12_95_1(result) {
  _$jscoverage['/custom/observable.js'].branchData['95'][1].ranCondition(result);
  return result;
}_$jscoverage['/custom/observable.js'].branchData['93'][2].init(90, 25, 'parents && parents.length');
function visit11_93_2(result) {
  _$jscoverage['/custom/observable.js'].branchData['93'][2].ranCondition(result);
  return result;
}_$jscoverage['/custom/observable.js'].branchData['93'][1].init(90, 30, 'parents && parents.length || 0');
function visit10_93_1(result) {
  _$jscoverage['/custom/observable.js'].branchData['93'][1].ranCondition(result);
  return result;
}_$jscoverage['/custom/observable.js'].branchData['89'][1].init(940, 52, 'bubbles && !customEventObject.isPropagationStopped()');
function visit9_89_1(result) {
  _$jscoverage['/custom/observable.js'].branchData['89'][1].ranCondition(result);
  return result;
}_$jscoverage['/custom/observable.js'].branchData['84'][3].init(818, 16, 'ret != undefined');
function visit8_84_3(result) {
  _$jscoverage['/custom/observable.js'].branchData['84'][3].ranCondition(result);
  return result;
}_$jscoverage['/custom/observable.js'].branchData['84'][2].init(800, 14, 'gRet !== false');
function visit7_84_2(result) {
  _$jscoverage['/custom/observable.js'].branchData['84'][2].ranCondition(result);
  return result;
}_$jscoverage['/custom/observable.js'].branchData['84'][1].init(800, 34, 'gRet !== false && ret != undefined');
function visit6_84_1(result) {
  _$jscoverage['/custom/observable.js'].branchData['84'][1].ranCondition(result);
  return result;
}_$jscoverage['/custom/observable.js'].branchData['75'][1].init(457, 50, '!(customEventObject instanceof CustomEventObject)');
function visit5_75_1(result) {
  _$jscoverage['/custom/observable.js'].branchData['75'][1].ranCondition(result);
  return result;
}_$jscoverage['/custom/observable.js'].branchData['60'][1].init(26, 15, 'eventData || {}');
function visit4_60_1(result) {
  _$jscoverage['/custom/observable.js'].branchData['60'][1].ranCondition(result);
  return result;
}_$jscoverage['/custom/observable.js'].branchData['48'][1].init(316, 33, 'this.findObserver(observer) == -1');
function visit3_48_1(result) {
  _$jscoverage['/custom/observable.js'].branchData['48'][1].ranCondition(result);
  return result;
}_$jscoverage['/custom/observable.js'].branchData['44'][1].init(22, 12, '!observer.fn');
function visit2_44_1(result) {
  _$jscoverage['/custom/observable.js'].branchData['44'][1].ranCondition(result);
  return result;
}_$jscoverage['/custom/observable.js'].branchData['43'][1].init(141, 14, 'S.Config.debug');
function visit1_43_1(result) {
  _$jscoverage['/custom/observable.js'].branchData['43'][1].ranCondition(result);
  return result;
}_$jscoverage['/custom/observable.js'].lineData[7]++;
KISSY.add('event/custom/observable', function(S, CustomEventObserver, CustomEventObject, BaseEvent) {
  _$jscoverage['/custom/observable.js'].functionData[0]++;
  _$jscoverage['/custom/observable.js'].lineData[8]++;
  var Utils = BaseEvent.Utils;
  _$jscoverage['/custom/observable.js'].lineData[9]++;
  var undefined = undefined;
  _$jscoverage['/custom/observable.js'].lineData[17]++;
  function CustomEventObservable() {
    _$jscoverage['/custom/observable.js'].functionData[1]++;
    _$jscoverage['/custom/observable.js'].lineData[18]++;
    var self = this;
    _$jscoverage['/custom/observable.js'].lineData[19]++;
    CustomEventObservable.superclass.constructor.apply(self, arguments);
    _$jscoverage['/custom/observable.js'].lineData[20]++;
    self.defaultFn = null;
    _$jscoverage['/custom/observable.js'].lineData[21]++;
    self.defaultTargetOnly = false;
    _$jscoverage['/custom/observable.js'].lineData[28]++;
    self.bubbles = true;
  }
  _$jscoverage['/custom/observable.js'].lineData[35]++;
  S.extend(CustomEventObservable, BaseEvent.Observable, {
  on: function(cfg) {
  _$jscoverage['/custom/observable.js'].functionData[2]++;
  _$jscoverage['/custom/observable.js'].lineData[41]++;
  var observer = new CustomEventObserver(cfg);
  _$jscoverage['/custom/observable.js'].lineData[43]++;
  if (visit1_43_1(S.Config.debug)) {
    _$jscoverage['/custom/observable.js'].lineData[44]++;
    if (visit2_44_1(!observer.fn)) {
      _$jscoverage['/custom/observable.js'].lineData[45]++;
      S.error('lack event handler for ' + this.type);
    }
  }
  _$jscoverage['/custom/observable.js'].lineData[48]++;
  if (visit3_48_1(this.findObserver(observer) == -1)) {
    _$jscoverage['/custom/observable.js'].lineData[49]++;
    this.observers.push(observer);
  }
}, 
  fire: function(eventData) {
  _$jscoverage['/custom/observable.js'].functionData[3]++;
  _$jscoverage['/custom/observable.js'].lineData[60]++;
  eventData = visit4_60_1(eventData || {});
  _$jscoverage['/custom/observable.js'].lineData[62]++;
  var self = this, bubbles = self.bubbles, currentTarget = self.currentTarget, parents, parentsLen, type = self.type, defaultFn = self.defaultFn, i, customEventObject = eventData, gRet, ret;
  _$jscoverage['/custom/observable.js'].lineData[73]++;
  eventData.type = type;
  _$jscoverage['/custom/observable.js'].lineData[75]++;
  if (visit5_75_1(!(customEventObject instanceof CustomEventObject))) {
    _$jscoverage['/custom/observable.js'].lineData[76]++;
    customEventObject.target = currentTarget;
    _$jscoverage['/custom/observable.js'].lineData[77]++;
    customEventObject = new CustomEventObject(customEventObject);
  }
  _$jscoverage['/custom/observable.js'].lineData[80]++;
  customEventObject.currentTarget = currentTarget;
  _$jscoverage['/custom/observable.js'].lineData[82]++;
  ret = self.notify(customEventObject);
  _$jscoverage['/custom/observable.js'].lineData[84]++;
  if (visit6_84_1(visit7_84_2(gRet !== false) && visit8_84_3(ret != undefined))) {
    _$jscoverage['/custom/observable.js'].lineData[85]++;
    gRet = ret;
  }
  _$jscoverage['/custom/observable.js'].lineData[89]++;
  if (visit9_89_1(bubbles && !customEventObject.isPropagationStopped())) {
    _$jscoverage['/custom/observable.js'].lineData[91]++;
    parents = currentTarget.getTargets();
    _$jscoverage['/custom/observable.js'].lineData[93]++;
    parentsLen = visit10_93_1(visit11_93_2(parents && parents.length) || 0);
    _$jscoverage['/custom/observable.js'].lineData[95]++;
    for (i = 0; visit12_95_1(visit13_95_2(i < parentsLen) && !customEventObject.isPropagationStopped()); i++) {
      _$jscoverage['/custom/observable.js'].lineData[97]++;
      ret = parents[i].fire(type, customEventObject);
      _$jscoverage['/custom/observable.js'].lineData[100]++;
      if (visit14_100_1(visit15_100_2(gRet !== false) && visit16_100_3(ret !== undefined))) {
        _$jscoverage['/custom/observable.js'].lineData[101]++;
        gRet = ret;
      }
    }
  }
  _$jscoverage['/custom/observable.js'].lineData[110]++;
  if (visit17_110_1(defaultFn && !customEventObject.isDefaultPrevented())) {
    _$jscoverage['/custom/observable.js'].lineData[111]++;
    var target = customEventObject.target, lowestCustomEventObservable = target.getCustomEventObservable(customEventObject.type);
    _$jscoverage['/custom/observable.js'].lineData[113]++;
    if (visit18_113_1((visit19_113_2(!self.defaultTargetOnly && !lowestCustomEventObservable.defaultTargetOnly)) || visit20_114_1(currentTarget == target))) {
      _$jscoverage['/custom/observable.js'].lineData[116]++;
      gRet = defaultFn.call(currentTarget, customEventObject);
    }
  }
  _$jscoverage['/custom/observable.js'].lineData[120]++;
  return gRet;
}, 
  notify: function(event) {
  _$jscoverage['/custom/observable.js'].functionData[4]++;
  _$jscoverage['/custom/observable.js'].lineData[132]++;
  var observers = [].concat(this.observers), ret, gRet, len = observers.length, i;
  _$jscoverage['/custom/observable.js'].lineData[138]++;
  for (i = 0; visit21_138_1(visit22_138_2(i < len) && !event.isImmediatePropagationStopped()); i++) {
    _$jscoverage['/custom/observable.js'].lineData[139]++;
    ret = observers[i].notify(event, this);
    _$jscoverage['/custom/observable.js'].lineData[140]++;
    if (visit23_140_1(visit24_140_2(gRet !== false) && visit25_140_3(ret !== undefined))) {
      _$jscoverage['/custom/observable.js'].lineData[141]++;
      gRet = ret;
    }
  }
  _$jscoverage['/custom/observable.js'].lineData[145]++;
  return gRet;
}, 
  detach: function(cfg) {
  _$jscoverage['/custom/observable.js'].functionData[5]++;
  _$jscoverage['/custom/observable.js'].lineData[153]++;
  var groupsRe, self = this, fn = cfg.fn, context = cfg.context, currentTarget = self.currentTarget, observers = self.observers, groups = cfg.groups;
  _$jscoverage['/custom/observable.js'].lineData[161]++;
  if (visit26_161_1(!observers.length)) {
    _$jscoverage['/custom/observable.js'].lineData[162]++;
    return;
  }
  _$jscoverage['/custom/observable.js'].lineData[165]++;
  if (visit27_165_1(groups)) {
    _$jscoverage['/custom/observable.js'].lineData[166]++;
    groupsRe = Utils.getGroupsRe(groups);
  }
  _$jscoverage['/custom/observable.js'].lineData[169]++;
  var i, j, t, observer, observerContext, len = observers.length;
  _$jscoverage['/custom/observable.js'].lineData[172]++;
  if (visit28_172_1(fn || groupsRe)) {
    _$jscoverage['/custom/observable.js'].lineData[173]++;
    context = visit29_173_1(context || currentTarget);
    _$jscoverage['/custom/observable.js'].lineData[175]++;
    for (i = 0 , j = 0 , t = []; visit30_175_1(i < len); ++i) {
      _$jscoverage['/custom/observable.js'].lineData[176]++;
      observer = observers[i];
      _$jscoverage['/custom/observable.js'].lineData[177]++;
      observerContext = visit31_177_1(observer.context || currentTarget);
      _$jscoverage['/custom/observable.js'].lineData[178]++;
      if (visit32_179_1((visit33_179_2(context != observerContext)) || visit34_181_1((visit35_181_2(fn && visit36_181_3(fn != observer.fn))) || (visit37_183_1(groupsRe && !observer.groups.match(groupsRe)))))) {
        _$jscoverage['/custom/observable.js'].lineData[185]++;
        t[j++] = observer;
      }
    }
    _$jscoverage['/custom/observable.js'].lineData[189]++;
    self.observers = t;
  } else {
    _$jscoverage['/custom/observable.js'].lineData[192]++;
    self.reset();
  }
}});
  _$jscoverage['/custom/observable.js'].lineData[201]++;
  return CustomEventObservable;
}, {
  requires: ['./observer', './object', 'event/base']});
