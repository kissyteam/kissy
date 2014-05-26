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
  _$jscoverage['/custom/observable.js'].lineData[12] = 0;
  _$jscoverage['/custom/observable.js'].lineData[20] = 0;
  _$jscoverage['/custom/observable.js'].lineData[21] = 0;
  _$jscoverage['/custom/observable.js'].lineData[22] = 0;
  _$jscoverage['/custom/observable.js'].lineData[23] = 0;
  _$jscoverage['/custom/observable.js'].lineData[24] = 0;
  _$jscoverage['/custom/observable.js'].lineData[31] = 0;
  _$jscoverage['/custom/observable.js'].lineData[38] = 0;
  _$jscoverage['/custom/observable.js'].lineData[44] = 0;
  _$jscoverage['/custom/observable.js'].lineData[46] = 0;
  _$jscoverage['/custom/observable.js'].lineData[47] = 0;
  _$jscoverage['/custom/observable.js'].lineData[58] = 0;
  _$jscoverage['/custom/observable.js'].lineData[60] = 0;
  _$jscoverage['/custom/observable.js'].lineData[71] = 0;
  _$jscoverage['/custom/observable.js'].lineData[73] = 0;
  _$jscoverage['/custom/observable.js'].lineData[74] = 0;
  _$jscoverage['/custom/observable.js'].lineData[77] = 0;
  _$jscoverage['/custom/observable.js'].lineData[78] = 0;
  _$jscoverage['/custom/observable.js'].lineData[80] = 0;
  _$jscoverage['/custom/observable.js'].lineData[82] = 0;
  _$jscoverage['/custom/observable.js'].lineData[83] = 0;
  _$jscoverage['/custom/observable.js'].lineData[87] = 0;
  _$jscoverage['/custom/observable.js'].lineData[89] = 0;
  _$jscoverage['/custom/observable.js'].lineData[91] = 0;
  _$jscoverage['/custom/observable.js'].lineData[93] = 0;
  _$jscoverage['/custom/observable.js'].lineData[95] = 0;
  _$jscoverage['/custom/observable.js'].lineData[98] = 0;
  _$jscoverage['/custom/observable.js'].lineData[99] = 0;
  _$jscoverage['/custom/observable.js'].lineData[108] = 0;
  _$jscoverage['/custom/observable.js'].lineData[109] = 0;
  _$jscoverage['/custom/observable.js'].lineData[111] = 0;
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
  _$jscoverage['/custom/observable.js'].branchData['46'] = [];
  _$jscoverage['/custom/observable.js'].branchData['46'][1] = new BranchData();
  _$jscoverage['/custom/observable.js'].branchData['58'] = [];
  _$jscoverage['/custom/observable.js'].branchData['58'][1] = new BranchData();
  _$jscoverage['/custom/observable.js'].branchData['73'] = [];
  _$jscoverage['/custom/observable.js'].branchData['73'][1] = new BranchData();
  _$jscoverage['/custom/observable.js'].branchData['77'] = [];
  _$jscoverage['/custom/observable.js'].branchData['77'][1] = new BranchData();
  _$jscoverage['/custom/observable.js'].branchData['82'] = [];
  _$jscoverage['/custom/observable.js'].branchData['82'][1] = new BranchData();
  _$jscoverage['/custom/observable.js'].branchData['82'][2] = new BranchData();
  _$jscoverage['/custom/observable.js'].branchData['82'][3] = new BranchData();
  _$jscoverage['/custom/observable.js'].branchData['87'] = [];
  _$jscoverage['/custom/observable.js'].branchData['87'][1] = new BranchData();
  _$jscoverage['/custom/observable.js'].branchData['91'] = [];
  _$jscoverage['/custom/observable.js'].branchData['91'][1] = new BranchData();
  _$jscoverage['/custom/observable.js'].branchData['91'][2] = new BranchData();
  _$jscoverage['/custom/observable.js'].branchData['93'] = [];
  _$jscoverage['/custom/observable.js'].branchData['93'][1] = new BranchData();
  _$jscoverage['/custom/observable.js'].branchData['93'][2] = new BranchData();
  _$jscoverage['/custom/observable.js'].branchData['98'] = [];
  _$jscoverage['/custom/observable.js'].branchData['98'][1] = new BranchData();
  _$jscoverage['/custom/observable.js'].branchData['98'][2] = new BranchData();
  _$jscoverage['/custom/observable.js'].branchData['98'][3] = new BranchData();
  _$jscoverage['/custom/observable.js'].branchData['108'] = [];
  _$jscoverage['/custom/observable.js'].branchData['108'][1] = new BranchData();
  _$jscoverage['/custom/observable.js'].branchData['111'] = [];
  _$jscoverage['/custom/observable.js'].branchData['111'][1] = new BranchData();
  _$jscoverage['/custom/observable.js'].branchData['111'][2] = new BranchData();
  _$jscoverage['/custom/observable.js'].branchData['113'] = [];
  _$jscoverage['/custom/observable.js'].branchData['113'][1] = new BranchData();
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
_$jscoverage['/custom/observable.js'].branchData['183'][1].init(119, 44, 'groupsRe && !observer.groups.match(groupsRe)');
function visit37_183_1(result) {
  _$jscoverage['/custom/observable.js'].branchData['183'][1].ranCondition(result);
  return result;
}_$jscoverage['/custom/observable.js'].branchData['181'][3].init(282, 18, 'fn !== observer.fn');
function visit36_181_3(result) {
  _$jscoverage['/custom/observable.js'].branchData['181'][3].ranCondition(result);
  return result;
}_$jscoverage['/custom/observable.js'].branchData['181'][2].init(276, 24, 'fn && fn !== observer.fn');
function visit35_181_2(result) {
  _$jscoverage['/custom/observable.js'].branchData['181'][2].ranCondition(result);
  return result;
}_$jscoverage['/custom/observable.js'].branchData['181'][1].init(100, 165, '(fn && fn !== observer.fn) || (groupsRe && !observer.groups.match(groupsRe))');
function visit34_181_1(result) {
  _$jscoverage['/custom/observable.js'].branchData['181'][1].ranCondition(result);
  return result;
}_$jscoverage['/custom/observable.js'].branchData['179'][2].init(174, 27, 'context !== observerContext');
function visit33_179_2(result) {
  _$jscoverage['/custom/observable.js'].branchData['179'][2].ranCondition(result);
  return result;
}_$jscoverage['/custom/observable.js'].branchData['179'][1].init(30, 266, '(context !== observerContext) || (fn && fn !== observer.fn) || (groupsRe && !observer.groups.match(groupsRe))');
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
}_$jscoverage['/custom/observable.js'].branchData['114'][1].init(195, 24, 'currentTarget === target');
function visit20_114_1(result) {
  _$jscoverage['/custom/observable.js'].branchData['114'][1].ranCondition(result);
  return result;
}_$jscoverage['/custom/observable.js'].branchData['113'][1].init(90, 78, '!lowestCustomEventObservable || !lowestCustomEventObservable.defaultTargetOnly');
function visit19_113_1(result) {
  _$jscoverage['/custom/observable.js'].branchData['113'][1].ranCondition(result);
  return result;
}_$jscoverage['/custom/observable.js'].branchData['111'][2].init(187, 170, '!self.defaultTargetOnly && (!lowestCustomEventObservable || !lowestCustomEventObservable.defaultTargetOnly)');
function visit18_111_2(result) {
  _$jscoverage['/custom/observable.js'].branchData['111'][2].ranCondition(result);
  return result;
}_$jscoverage['/custom/observable.js'].branchData['111'][1].init(187, 220, '(!self.defaultTargetOnly && (!lowestCustomEventObservable || !lowestCustomEventObservable.defaultTargetOnly)) || currentTarget === target');
function visit17_111_1(result) {
  _$jscoverage['/custom/observable.js'].branchData['111'][1].ranCondition(result);
  return result;
}_$jscoverage['/custom/observable.js'].branchData['108'][1].init(1615, 52, 'defaultFn && !customEventObject.isDefaultPrevented()');
function visit16_108_1(result) {
  _$jscoverage['/custom/observable.js'].branchData['108'][1].ranCondition(result);
  return result;
}_$jscoverage['/custom/observable.js'].branchData['98'][3].init(152, 17, 'ret !== undefined');
function visit15_98_3(result) {
  _$jscoverage['/custom/observable.js'].branchData['98'][3].ranCondition(result);
  return result;
}_$jscoverage['/custom/observable.js'].branchData['98'][2].init(134, 14, 'gRet !== false');
function visit14_98_2(result) {
  _$jscoverage['/custom/observable.js'].branchData['98'][2].ranCondition(result);
  return result;
}_$jscoverage['/custom/observable.js'].branchData['98'][1].init(134, 35, 'gRet !== false && ret !== undefined');
function visit13_98_1(result) {
  _$jscoverage['/custom/observable.js'].branchData['98'][1].ranCondition(result);
  return result;
}_$jscoverage['/custom/observable.js'].branchData['93'][2].init(153, 14, 'i < parentsLen');
function visit12_93_2(result) {
  _$jscoverage['/custom/observable.js'].branchData['93'][2].ranCondition(result);
  return result;
}_$jscoverage['/custom/observable.js'].branchData['93'][1].init(153, 59, 'i < parentsLen && !customEventObject.isPropagationStopped()');
function visit11_93_1(result) {
  _$jscoverage['/custom/observable.js'].branchData['93'][1].ranCondition(result);
  return result;
}_$jscoverage['/custom/observable.js'].branchData['91'][2].init(90, 25, 'parents && parents.length');
function visit10_91_2(result) {
  _$jscoverage['/custom/observable.js'].branchData['91'][2].ranCondition(result);
  return result;
}_$jscoverage['/custom/observable.js'].branchData['91'][1].init(90, 30, 'parents && parents.length || 0');
function visit9_91_1(result) {
  _$jscoverage['/custom/observable.js'].branchData['91'][1].ranCondition(result);
  return result;
}_$jscoverage['/custom/observable.js'].branchData['87'][1].init(947, 52, 'bubbles && !customEventObject.isPropagationStopped()');
function visit8_87_1(result) {
  _$jscoverage['/custom/observable.js'].branchData['87'][1].ranCondition(result);
  return result;
}_$jscoverage['/custom/observable.js'].branchData['82'][3].init(824, 17, 'ret !== undefined');
function visit7_82_3(result) {
  _$jscoverage['/custom/observable.js'].branchData['82'][3].ranCondition(result);
  return result;
}_$jscoverage['/custom/observable.js'].branchData['82'][2].init(806, 14, 'gRet !== false');
function visit6_82_2(result) {
  _$jscoverage['/custom/observable.js'].branchData['82'][2].ranCondition(result);
  return result;
}_$jscoverage['/custom/observable.js'].branchData['82'][1].init(806, 35, 'gRet !== false && ret !== undefined');
function visit5_82_1(result) {
  _$jscoverage['/custom/observable.js'].branchData['82'][1].ranCondition(result);
  return result;
}_$jscoverage['/custom/observable.js'].branchData['77'][1].init(629, 41, 'customEventObject.target || currentTarget');
function visit4_77_1(result) {
  _$jscoverage['/custom/observable.js'].branchData['77'][1].ranCondition(result);
  return result;
}_$jscoverage['/custom/observable.js'].branchData['73'][1].init(457, 32, '!customEventObject.isEventObject');
function visit3_73_1(result) {
  _$jscoverage['/custom/observable.js'].branchData['73'][1].ranCondition(result);
  return result;
}_$jscoverage['/custom/observable.js'].branchData['58'][1].init(26, 15, 'eventData || {}');
function visit2_58_1(result) {
  _$jscoverage['/custom/observable.js'].branchData['58'][1].ranCondition(result);
  return result;
}_$jscoverage['/custom/observable.js'].branchData['46'][1].init(141, 34, 'this.findObserver(observer) === -1');
function visit1_46_1(result) {
  _$jscoverage['/custom/observable.js'].branchData['46'][1].ranCondition(result);
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
  _$jscoverage['/custom/observable.js'].lineData[12]++;
  var util = require('util');
  _$jscoverage['/custom/observable.js'].lineData[20]++;
  function CustomEventObservable() {
    _$jscoverage['/custom/observable.js'].functionData[1]++;
    _$jscoverage['/custom/observable.js'].lineData[21]++;
    var self = this;
    _$jscoverage['/custom/observable.js'].lineData[22]++;
    CustomEventObservable.superclass.constructor.apply(self, arguments);
    _$jscoverage['/custom/observable.js'].lineData[23]++;
    self.defaultFn = null;
    _$jscoverage['/custom/observable.js'].lineData[24]++;
    self.defaultTargetOnly = false;
    _$jscoverage['/custom/observable.js'].lineData[31]++;
    self.bubbles = true;
  }
  _$jscoverage['/custom/observable.js'].lineData[38]++;
  util.extend(CustomEventObservable, BaseEvent.Observable, {
  on: function(cfg) {
  _$jscoverage['/custom/observable.js'].functionData[2]++;
  _$jscoverage['/custom/observable.js'].lineData[44]++;
  var observer = new CustomEventObserver(cfg);
  _$jscoverage['/custom/observable.js'].lineData[46]++;
  if (visit1_46_1(this.findObserver(observer) === -1)) {
    _$jscoverage['/custom/observable.js'].lineData[47]++;
    this.observers.push(observer);
  }
}, 
  fire: function(eventData) {
  _$jscoverage['/custom/observable.js'].functionData[3]++;
  _$jscoverage['/custom/observable.js'].lineData[58]++;
  eventData = visit2_58_1(eventData || {});
  _$jscoverage['/custom/observable.js'].lineData[60]++;
  var self = this, bubbles = self.bubbles, currentTarget = self.currentTarget, parents, parentsLen, type = self.type, defaultFn = self.defaultFn, i, customEventObject = eventData, gRet, ret;
  _$jscoverage['/custom/observable.js'].lineData[71]++;
  eventData.type = type;
  _$jscoverage['/custom/observable.js'].lineData[73]++;
  if (visit3_73_1(!customEventObject.isEventObject)) {
    _$jscoverage['/custom/observable.js'].lineData[74]++;
    customEventObject = new CustomEventObject(customEventObject);
  }
  _$jscoverage['/custom/observable.js'].lineData[77]++;
  customEventObject.target = visit4_77_1(customEventObject.target || currentTarget);
  _$jscoverage['/custom/observable.js'].lineData[78]++;
  customEventObject.currentTarget = currentTarget;
  _$jscoverage['/custom/observable.js'].lineData[80]++;
  ret = self.notify(customEventObject);
  _$jscoverage['/custom/observable.js'].lineData[82]++;
  if (visit5_82_1(visit6_82_2(gRet !== false) && visit7_82_3(ret !== undefined))) {
    _$jscoverage['/custom/observable.js'].lineData[83]++;
    gRet = ret;
  }
  _$jscoverage['/custom/observable.js'].lineData[87]++;
  if (visit8_87_1(bubbles && !customEventObject.isPropagationStopped())) {
    _$jscoverage['/custom/observable.js'].lineData[89]++;
    parents = currentTarget.getTargets();
    _$jscoverage['/custom/observable.js'].lineData[91]++;
    parentsLen = visit9_91_1(visit10_91_2(parents && parents.length) || 0);
    _$jscoverage['/custom/observable.js'].lineData[93]++;
    for (i = 0; visit11_93_1(visit12_93_2(i < parentsLen) && !customEventObject.isPropagationStopped()); i++) {
      _$jscoverage['/custom/observable.js'].lineData[95]++;
      ret = parents[i].fire(type, customEventObject);
      _$jscoverage['/custom/observable.js'].lineData[98]++;
      if (visit13_98_1(visit14_98_2(gRet !== false) && visit15_98_3(ret !== undefined))) {
        _$jscoverage['/custom/observable.js'].lineData[99]++;
        gRet = ret;
      }
    }
  }
  _$jscoverage['/custom/observable.js'].lineData[108]++;
  if (visit16_108_1(defaultFn && !customEventObject.isDefaultPrevented())) {
    _$jscoverage['/custom/observable.js'].lineData[109]++;
    var target = customEventObject.target, lowestCustomEventObservable = target.getCustomEventObservable(customEventObject.type);
    _$jscoverage['/custom/observable.js'].lineData[111]++;
    if (visit17_111_1((visit18_111_2(!self.defaultTargetOnly && (visit19_113_1(!lowestCustomEventObservable || !lowestCustomEventObservable.defaultTargetOnly)))) || visit20_114_1(currentTarget === target))) {
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
      if (visit32_179_1((visit33_179_2(context !== observerContext)) || visit34_181_1((visit35_181_2(fn && visit36_181_3(fn !== observer.fn))) || (visit37_183_1(groupsRe && !observer.groups.match(groupsRe)))))) {
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
});
