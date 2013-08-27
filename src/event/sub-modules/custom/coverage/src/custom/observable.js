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
  _$jscoverage['/custom/observable.js'].lineData[61] = 0;
  _$jscoverage['/custom/observable.js'].lineData[63] = 0;
  _$jscoverage['/custom/observable.js'].lineData[74] = 0;
  _$jscoverage['/custom/observable.js'].lineData[76] = 0;
  _$jscoverage['/custom/observable.js'].lineData[77] = 0;
  _$jscoverage['/custom/observable.js'].lineData[78] = 0;
  _$jscoverage['/custom/observable.js'].lineData[81] = 0;
  _$jscoverage['/custom/observable.js'].lineData[83] = 0;
  _$jscoverage['/custom/observable.js'].lineData[85] = 0;
  _$jscoverage['/custom/observable.js'].lineData[86] = 0;
  _$jscoverage['/custom/observable.js'].lineData[90] = 0;
  _$jscoverage['/custom/observable.js'].lineData[92] = 0;
  _$jscoverage['/custom/observable.js'].lineData[94] = 0;
  _$jscoverage['/custom/observable.js'].lineData[96] = 0;
  _$jscoverage['/custom/observable.js'].lineData[98] = 0;
  _$jscoverage['/custom/observable.js'].lineData[101] = 0;
  _$jscoverage['/custom/observable.js'].lineData[102] = 0;
  _$jscoverage['/custom/observable.js'].lineData[111] = 0;
  _$jscoverage['/custom/observable.js'].lineData[112] = 0;
  _$jscoverage['/custom/observable.js'].lineData[114] = 0;
  _$jscoverage['/custom/observable.js'].lineData[117] = 0;
  _$jscoverage['/custom/observable.js'].lineData[121] = 0;
  _$jscoverage['/custom/observable.js'].lineData[133] = 0;
  _$jscoverage['/custom/observable.js'].lineData[139] = 0;
  _$jscoverage['/custom/observable.js'].lineData[140] = 0;
  _$jscoverage['/custom/observable.js'].lineData[141] = 0;
  _$jscoverage['/custom/observable.js'].lineData[142] = 0;
  _$jscoverage['/custom/observable.js'].lineData[144] = 0;
  _$jscoverage['/custom/observable.js'].lineData[146] = 0;
  _$jscoverage['/custom/observable.js'].lineData[150] = 0;
  _$jscoverage['/custom/observable.js'].lineData[158] = 0;
  _$jscoverage['/custom/observable.js'].lineData[166] = 0;
  _$jscoverage['/custom/observable.js'].lineData[167] = 0;
  _$jscoverage['/custom/observable.js'].lineData[170] = 0;
  _$jscoverage['/custom/observable.js'].lineData[171] = 0;
  _$jscoverage['/custom/observable.js'].lineData[174] = 0;
  _$jscoverage['/custom/observable.js'].lineData[177] = 0;
  _$jscoverage['/custom/observable.js'].lineData[178] = 0;
  _$jscoverage['/custom/observable.js'].lineData[180] = 0;
  _$jscoverage['/custom/observable.js'].lineData[181] = 0;
  _$jscoverage['/custom/observable.js'].lineData[182] = 0;
  _$jscoverage['/custom/observable.js'].lineData[183] = 0;
  _$jscoverage['/custom/observable.js'].lineData[190] = 0;
  _$jscoverage['/custom/observable.js'].lineData[194] = 0;
  _$jscoverage['/custom/observable.js'].lineData[197] = 0;
  _$jscoverage['/custom/observable.js'].lineData[206] = 0;
  _$jscoverage['/custom/observable.js'].lineData[218] = 0;
  _$jscoverage['/custom/observable.js'].lineData[219] = 0;
  _$jscoverage['/custom/observable.js'].lineData[221] = 0;
  _$jscoverage['/custom/observable.js'].lineData[222] = 0;
  _$jscoverage['/custom/observable.js'].lineData[223] = 0;
  _$jscoverage['/custom/observable.js'].lineData[228] = 0;
  _$jscoverage['/custom/observable.js'].lineData[239] = 0;
  _$jscoverage['/custom/observable.js'].lineData[240] = 0;
  _$jscoverage['/custom/observable.js'].lineData[241] = 0;
  _$jscoverage['/custom/observable.js'].lineData[243] = 0;
  _$jscoverage['/custom/observable.js'].lineData[246] = 0;
}
if (! _$jscoverage['/custom/observable.js'].functionData) {
  _$jscoverage['/custom/observable.js'].functionData = [];
  _$jscoverage['/custom/observable.js'].functionData[0] = 0;
  _$jscoverage['/custom/observable.js'].functionData[1] = 0;
  _$jscoverage['/custom/observable.js'].functionData[2] = 0;
  _$jscoverage['/custom/observable.js'].functionData[3] = 0;
  _$jscoverage['/custom/observable.js'].functionData[4] = 0;
  _$jscoverage['/custom/observable.js'].functionData[5] = 0;
  _$jscoverage['/custom/observable.js'].functionData[6] = 0;
  _$jscoverage['/custom/observable.js'].functionData[7] = 0;
}
if (! _$jscoverage['/custom/observable.js'].branchData) {
  _$jscoverage['/custom/observable.js'].branchData = {};
  _$jscoverage['/custom/observable.js'].branchData['43'] = [];
  _$jscoverage['/custom/observable.js'].branchData['43'][1] = new BranchData();
  _$jscoverage['/custom/observable.js'].branchData['44'] = [];
  _$jscoverage['/custom/observable.js'].branchData['44'][1] = new BranchData();
  _$jscoverage['/custom/observable.js'].branchData['48'] = [];
  _$jscoverage['/custom/observable.js'].branchData['48'][1] = new BranchData();
  _$jscoverage['/custom/observable.js'].branchData['61'] = [];
  _$jscoverage['/custom/observable.js'].branchData['61'][1] = new BranchData();
  _$jscoverage['/custom/observable.js'].branchData['76'] = [];
  _$jscoverage['/custom/observable.js'].branchData['76'][1] = new BranchData();
  _$jscoverage['/custom/observable.js'].branchData['85'] = [];
  _$jscoverage['/custom/observable.js'].branchData['85'][1] = new BranchData();
  _$jscoverage['/custom/observable.js'].branchData['90'] = [];
  _$jscoverage['/custom/observable.js'].branchData['90'][1] = new BranchData();
  _$jscoverage['/custom/observable.js'].branchData['94'] = [];
  _$jscoverage['/custom/observable.js'].branchData['94'][1] = new BranchData();
  _$jscoverage['/custom/observable.js'].branchData['94'][2] = new BranchData();
  _$jscoverage['/custom/observable.js'].branchData['96'] = [];
  _$jscoverage['/custom/observable.js'].branchData['96'][1] = new BranchData();
  _$jscoverage['/custom/observable.js'].branchData['96'][2] = new BranchData();
  _$jscoverage['/custom/observable.js'].branchData['101'] = [];
  _$jscoverage['/custom/observable.js'].branchData['101'][1] = new BranchData();
  _$jscoverage['/custom/observable.js'].branchData['111'] = [];
  _$jscoverage['/custom/observable.js'].branchData['111'][1] = new BranchData();
  _$jscoverage['/custom/observable.js'].branchData['114'] = [];
  _$jscoverage['/custom/observable.js'].branchData['114'][1] = new BranchData();
  _$jscoverage['/custom/observable.js'].branchData['114'][2] = new BranchData();
  _$jscoverage['/custom/observable.js'].branchData['115'] = [];
  _$jscoverage['/custom/observable.js'].branchData['115'][1] = new BranchData();
  _$jscoverage['/custom/observable.js'].branchData['139'] = [];
  _$jscoverage['/custom/observable.js'].branchData['139'][1] = new BranchData();
  _$jscoverage['/custom/observable.js'].branchData['139'][2] = new BranchData();
  _$jscoverage['/custom/observable.js'].branchData['141'] = [];
  _$jscoverage['/custom/observable.js'].branchData['141'][1] = new BranchData();
  _$jscoverage['/custom/observable.js'].branchData['144'] = [];
  _$jscoverage['/custom/observable.js'].branchData['144'][1] = new BranchData();
  _$jscoverage['/custom/observable.js'].branchData['166'] = [];
  _$jscoverage['/custom/observable.js'].branchData['166'][1] = new BranchData();
  _$jscoverage['/custom/observable.js'].branchData['170'] = [];
  _$jscoverage['/custom/observable.js'].branchData['170'][1] = new BranchData();
  _$jscoverage['/custom/observable.js'].branchData['177'] = [];
  _$jscoverage['/custom/observable.js'].branchData['177'][1] = new BranchData();
  _$jscoverage['/custom/observable.js'].branchData['178'] = [];
  _$jscoverage['/custom/observable.js'].branchData['178'][1] = new BranchData();
  _$jscoverage['/custom/observable.js'].branchData['180'] = [];
  _$jscoverage['/custom/observable.js'].branchData['180'][1] = new BranchData();
  _$jscoverage['/custom/observable.js'].branchData['182'] = [];
  _$jscoverage['/custom/observable.js'].branchData['182'][1] = new BranchData();
  _$jscoverage['/custom/observable.js'].branchData['184'] = [];
  _$jscoverage['/custom/observable.js'].branchData['184'][1] = new BranchData();
  _$jscoverage['/custom/observable.js'].branchData['184'][2] = new BranchData();
  _$jscoverage['/custom/observable.js'].branchData['186'] = [];
  _$jscoverage['/custom/observable.js'].branchData['186'][1] = new BranchData();
  _$jscoverage['/custom/observable.js'].branchData['186'][2] = new BranchData();
  _$jscoverage['/custom/observable.js'].branchData['186'][3] = new BranchData();
  _$jscoverage['/custom/observable.js'].branchData['188'] = [];
  _$jscoverage['/custom/observable.js'].branchData['188'][1] = new BranchData();
  _$jscoverage['/custom/observable.js'].branchData['221'] = [];
  _$jscoverage['/custom/observable.js'].branchData['221'][1] = new BranchData();
  _$jscoverage['/custom/observable.js'].branchData['222'] = [];
  _$jscoverage['/custom/observable.js'].branchData['222'][1] = new BranchData();
  _$jscoverage['/custom/observable.js'].branchData['240'] = [];
  _$jscoverage['/custom/observable.js'].branchData['240'][1] = new BranchData();
}
_$jscoverage['/custom/observable.js'].branchData['240'][1].init(14, 35, '!target[KS_CUSTOM_EVENTS] && create');
function visit35_240_1(result) {
  _$jscoverage['/custom/observable.js'].branchData['240'][1].ranCondition(result);
  return result;
}_$jscoverage['/custom/observable.js'].branchData['222'][1].init(222, 22, '!customEvent && create');
function visit34_222_1(result) {
  _$jscoverage['/custom/observable.js'].branchData['222'][1].ranCondition(result);
  return result;
}_$jscoverage['/custom/observable.js'].branchData['221'][1].init(153, 54, 'customEventObservables && customEventObservables[type]');
function visit33_221_1(result) {
  _$jscoverage['/custom/observable.js'].branchData['221'][1].ranCondition(result);
  return result;
}_$jscoverage['/custom/observable.js'].branchData['188'][1].init(126, 44, 'groupsRe && !observer.groups.match(groupsRe)');
function visit32_188_1(result) {
  _$jscoverage['/custom/observable.js'].branchData['188'][1].ranCondition(result);
  return result;
}_$jscoverage['/custom/observable.js'].branchData['186'][3].init(289, 17, 'fn != observer.fn');
function visit31_186_3(result) {
  _$jscoverage['/custom/observable.js'].branchData['186'][3].ranCondition(result);
  return result;
}_$jscoverage['/custom/observable.js'].branchData['186'][2].init(283, 23, 'fn && fn != observer.fn');
function visit30_186_2(result) {
  _$jscoverage['/custom/observable.js'].branchData['186'][2].ranCondition(result);
  return result;
}_$jscoverage['/custom/observable.js'].branchData['186'][1].init(107, 172, '(fn && fn != observer.fn) || (groupsRe && !observer.groups.match(groupsRe))');
function visit29_186_1(result) {
  _$jscoverage['/custom/observable.js'].branchData['186'][1].ranCondition(result);
  return result;
}_$jscoverage['/custom/observable.js'].branchData['184'][2].init(174, 26, 'context != observerContext');
function visit28_184_2(result) {
  _$jscoverage['/custom/observable.js'].branchData['184'][2].ranCondition(result);
  return result;
}_$jscoverage['/custom/observable.js'].branchData['184'][1].init(30, 280, '(context != observerContext) || (fn && fn != observer.fn) || (groupsRe && !observer.groups.match(groupsRe))');
function visit27_184_1(result) {
  _$jscoverage['/custom/observable.js'].branchData['184'][1].ranCondition(result);
  return result;
}_$jscoverage['/custom/observable.js'].branchData['182'][1].init(86, 33, 'observer.context || currentTarget');
function visit26_182_1(result) {
  _$jscoverage['/custom/observable.js'].branchData['182'][1].ranCondition(result);
  return result;
}_$jscoverage['/custom/observable.js'].branchData['180'][1].init(100, 7, 'i < len');
function visit25_180_1(result) {
  _$jscoverage['/custom/observable.js'].branchData['180'][1].ranCondition(result);
  return result;
}_$jscoverage['/custom/observable.js'].branchData['178'][1].init(28, 24, 'context || currentTarget');
function visit24_178_1(result) {
  _$jscoverage['/custom/observable.js'].branchData['178'][1].ranCondition(result);
  return result;
}_$jscoverage['/custom/observable.js'].branchData['177'][1].init(563, 14, 'fn || groupsRe');
function visit23_177_1(result) {
  _$jscoverage['/custom/observable.js'].branchData['177'][1].ranCondition(result);
  return result;
}_$jscoverage['/custom/observable.js'].branchData['170'][1].init(363, 6, 'groups');
function visit22_170_1(result) {
  _$jscoverage['/custom/observable.js'].branchData['170'][1].ranCondition(result);
  return result;
}_$jscoverage['/custom/observable.js'].branchData['166'][1].init(283, 17, '!observers.length');
function visit21_166_1(result) {
  _$jscoverage['/custom/observable.js'].branchData['166'][1].ranCondition(result);
  return result;
}_$jscoverage['/custom/observable.js'].branchData['144'][1].init(170, 13, 'ret === false');
function visit20_144_1(result) {
  _$jscoverage['/custom/observable.js'].branchData['144'][1].ranCondition(result);
  return result;
}_$jscoverage['/custom/observable.js'].branchData['141'][1].init(79, 14, 'gRet !== false');
function visit19_141_1(result) {
  _$jscoverage['/custom/observable.js'].branchData['141'][1].ranCondition(result);
  return result;
}_$jscoverage['/custom/observable.js'].branchData['139'][2].init(254, 7, 'i < len');
function visit18_139_2(result) {
  _$jscoverage['/custom/observable.js'].branchData['139'][2].ranCondition(result);
  return result;
}_$jscoverage['/custom/observable.js'].branchData['139'][1].init(254, 49, 'i < len && !event.isImmediatePropagationStopped()');
function visit17_139_1(result) {
  _$jscoverage['/custom/observable.js'].branchData['139'][1].ranCondition(result);
  return result;
}_$jscoverage['/custom/observable.js'].branchData['115'][1].init(98, 41, 'currentTarget == customEventObject.target');
function visit16_115_1(result) {
  _$jscoverage['/custom/observable.js'].branchData['115'][1].ranCondition(result);
  return result;
}_$jscoverage['/custom/observable.js'].branchData['114'][2].init(193, 73, '!self.defaultTargetOnly && !lowestCustomEventObservable.defaultTargetOnly');
function visit15_114_2(result) {
  _$jscoverage['/custom/observable.js'].branchData['114'][2].ranCondition(result);
  return result;
}_$jscoverage['/custom/observable.js'].branchData['114'][1].init(193, 140, '(!self.defaultTargetOnly && !lowestCustomEventObservable.defaultTargetOnly) || currentTarget == customEventObject.target');
function visit14_114_1(result) {
  _$jscoverage['/custom/observable.js'].branchData['114'][1].ranCondition(result);
  return result;
}_$jscoverage['/custom/observable.js'].branchData['111'][1].init(1570, 52, 'defaultFn && !customEventObject.isDefaultPrevented()');
function visit13_111_1(result) {
  _$jscoverage['/custom/observable.js'].branchData['111'][1].ranCondition(result);
  return result;
}_$jscoverage['/custom/observable.js'].branchData['101'][1].init(134, 14, 'gRet !== false');
function visit12_101_1(result) {
  _$jscoverage['/custom/observable.js'].branchData['101'][1].ranCondition(result);
  return result;
}_$jscoverage['/custom/observable.js'].branchData['96'][2].init(154, 14, 'i < parentsLen');
function visit11_96_2(result) {
  _$jscoverage['/custom/observable.js'].branchData['96'][2].ranCondition(result);
  return result;
}_$jscoverage['/custom/observable.js'].branchData['96'][1].init(154, 59, 'i < parentsLen && !customEventObject.isPropagationStopped()');
function visit10_96_1(result) {
  _$jscoverage['/custom/observable.js'].branchData['96'][1].ranCondition(result);
  return result;
}_$jscoverage['/custom/observable.js'].branchData['94'][2].init(91, 25, 'parents && parents.length');
function visit9_94_2(result) {
  _$jscoverage['/custom/observable.js'].branchData['94'][2].ranCondition(result);
  return result;
}_$jscoverage['/custom/observable.js'].branchData['94'][1].init(91, 30, 'parents && parents.length || 0');
function visit8_94_1(result) {
  _$jscoverage['/custom/observable.js'].branchData['94'][1].ranCondition(result);
  return result;
}_$jscoverage['/custom/observable.js'].branchData['90'][1].init(922, 52, 'bubbles && !customEventObject.isPropagationStopped()');
function visit7_90_1(result) {
  _$jscoverage['/custom/observable.js'].branchData['90'][1].ranCondition(result);
  return result;
}_$jscoverage['/custom/observable.js'].branchData['85'][1].init(802, 14, 'gRet !== false');
function visit6_85_1(result) {
  _$jscoverage['/custom/observable.js'].branchData['85'][1].ranCondition(result);
  return result;
}_$jscoverage['/custom/observable.js'].branchData['76'][1].init(459, 50, '!(customEventObject instanceof CustomEventObject)');
function visit5_76_1(result) {
  _$jscoverage['/custom/observable.js'].branchData['76'][1].ranCondition(result);
  return result;
}_$jscoverage['/custom/observable.js'].branchData['61'][1].init(28, 15, 'eventData || {}');
function visit4_61_1(result) {
  _$jscoverage['/custom/observable.js'].branchData['61'][1].ranCondition(result);
  return result;
}_$jscoverage['/custom/observable.js'].branchData['48'][1].init(315, 33, 'this.findObserver(observer) == -1');
function visit3_48_1(result) {
  _$jscoverage['/custom/observable.js'].branchData['48'][1].ranCondition(result);
  return result;
}_$jscoverage['/custom/observable.js'].branchData['44'][1].init(22, 12, '!observer.fn');
function visit2_44_1(result) {
  _$jscoverage['/custom/observable.js'].branchData['44'][1].ranCondition(result);
  return result;
}_$jscoverage['/custom/observable.js'].branchData['43'][1].init(140, 14, 'S.Config.debug');
function visit1_43_1(result) {
  _$jscoverage['/custom/observable.js'].branchData['43'][1].ranCondition(result);
  return result;
}_$jscoverage['/custom/observable.js'].lineData[7]++;
KISSY.add('event/custom/observable', function(S, CustomEventObserver, CustomEventObject, BaseEvent) {
  _$jscoverage['/custom/observable.js'].functionData[0]++;
  _$jscoverage['/custom/observable.js'].lineData[9]++;
  var Utils = BaseEvent.Utils;
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
  _$jscoverage['/custom/observable.js'].lineData[61]++;
  eventData = visit4_61_1(eventData || {});
  _$jscoverage['/custom/observable.js'].lineData[63]++;
  var self = this, bubbles = self.bubbles, currentTarget = self.currentTarget, parents, parentsLen, type = self.type, defaultFn = self.defaultFn, i, customEventObject = eventData, gRet, ret;
  _$jscoverage['/custom/observable.js'].lineData[74]++;
  eventData.type = type;
  _$jscoverage['/custom/observable.js'].lineData[76]++;
  if (visit5_76_1(!(customEventObject instanceof CustomEventObject))) {
    _$jscoverage['/custom/observable.js'].lineData[77]++;
    customEventObject.target = currentTarget;
    _$jscoverage['/custom/observable.js'].lineData[78]++;
    customEventObject = new CustomEventObject(customEventObject);
  }
  _$jscoverage['/custom/observable.js'].lineData[81]++;
  customEventObject.currentTarget = currentTarget;
  _$jscoverage['/custom/observable.js'].lineData[83]++;
  ret = self.notify(customEventObject);
  _$jscoverage['/custom/observable.js'].lineData[85]++;
  if (visit6_85_1(gRet !== false)) {
    _$jscoverage['/custom/observable.js'].lineData[86]++;
    gRet = ret;
  }
  _$jscoverage['/custom/observable.js'].lineData[90]++;
  if (visit7_90_1(bubbles && !customEventObject.isPropagationStopped())) {
    _$jscoverage['/custom/observable.js'].lineData[92]++;
    parents = currentTarget.getTargets(1);
    _$jscoverage['/custom/observable.js'].lineData[94]++;
    parentsLen = visit8_94_1(visit9_94_2(parents && parents.length) || 0);
    _$jscoverage['/custom/observable.js'].lineData[96]++;
    for (i = 0; visit10_96_1(visit11_96_2(i < parentsLen) && !customEventObject.isPropagationStopped()); i++) {
      _$jscoverage['/custom/observable.js'].lineData[98]++;
      ret = parents[i].fire(type, customEventObject);
      _$jscoverage['/custom/observable.js'].lineData[101]++;
      if (visit12_101_1(gRet !== false)) {
        _$jscoverage['/custom/observable.js'].lineData[102]++;
        gRet = ret;
      }
    }
  }
  _$jscoverage['/custom/observable.js'].lineData[111]++;
  if (visit13_111_1(defaultFn && !customEventObject.isDefaultPrevented())) {
    _$jscoverage['/custom/observable.js'].lineData[112]++;
    var lowestCustomEventObservable = CustomEventObservable.getCustomEventObservable(customEventObject.target, customEventObject.type);
    _$jscoverage['/custom/observable.js'].lineData[114]++;
    if (visit14_114_1((visit15_114_2(!self.defaultTargetOnly && !lowestCustomEventObservable.defaultTargetOnly)) || visit16_115_1(currentTarget == customEventObject.target))) {
      _$jscoverage['/custom/observable.js'].lineData[117]++;
      gRet = defaultFn.call(currentTarget, customEventObject);
    }
  }
  _$jscoverage['/custom/observable.js'].lineData[121]++;
  return gRet;
}, 
  notify: function(event) {
  _$jscoverage['/custom/observable.js'].functionData[4]++;
  _$jscoverage['/custom/observable.js'].lineData[133]++;
  var observers = [].concat(this.observers), ret, gRet, len = observers.length, i;
  _$jscoverage['/custom/observable.js'].lineData[139]++;
  for (i = 0; visit17_139_1(visit18_139_2(i < len) && !event.isImmediatePropagationStopped()); i++) {
    _$jscoverage['/custom/observable.js'].lineData[140]++;
    ret = observers[i].notify(event, this);
    _$jscoverage['/custom/observable.js'].lineData[141]++;
    if (visit19_141_1(gRet !== false)) {
      _$jscoverage['/custom/observable.js'].lineData[142]++;
      gRet = ret;
    }
    _$jscoverage['/custom/observable.js'].lineData[144]++;
    if (visit20_144_1(ret === false)) {
      _$jscoverage['/custom/observable.js'].lineData[146]++;
      event.halt();
    }
  }
  _$jscoverage['/custom/observable.js'].lineData[150]++;
  return gRet;
}, 
  detach: function(cfg) {
  _$jscoverage['/custom/observable.js'].functionData[5]++;
  _$jscoverage['/custom/observable.js'].lineData[158]++;
  var groupsRe, self = this, fn = cfg.fn, context = cfg.context, currentTarget = self.currentTarget, observers = self.observers, groups = cfg.groups;
  _$jscoverage['/custom/observable.js'].lineData[166]++;
  if (visit21_166_1(!observers.length)) {
    _$jscoverage['/custom/observable.js'].lineData[167]++;
    return;
  }
  _$jscoverage['/custom/observable.js'].lineData[170]++;
  if (visit22_170_1(groups)) {
    _$jscoverage['/custom/observable.js'].lineData[171]++;
    groupsRe = Utils.getGroupsRe(groups);
  }
  _$jscoverage['/custom/observable.js'].lineData[174]++;
  var i, j, t, observer, observerContext, len = observers.length;
  _$jscoverage['/custom/observable.js'].lineData[177]++;
  if (visit23_177_1(fn || groupsRe)) {
    _$jscoverage['/custom/observable.js'].lineData[178]++;
    context = visit24_178_1(context || currentTarget);
    _$jscoverage['/custom/observable.js'].lineData[180]++;
    for (i = 0 , j = 0 , t = []; visit25_180_1(i < len); ++i) {
      _$jscoverage['/custom/observable.js'].lineData[181]++;
      observer = observers[i];
      _$jscoverage['/custom/observable.js'].lineData[182]++;
      observerContext = visit26_182_1(observer.context || currentTarget);
      _$jscoverage['/custom/observable.js'].lineData[183]++;
      if (visit27_184_1((visit28_184_2(context != observerContext)) || visit29_186_1((visit30_186_2(fn && visit31_186_3(fn != observer.fn))) || (visit32_188_1(groupsRe && !observer.groups.match(groupsRe)))))) {
        _$jscoverage['/custom/observable.js'].lineData[190]++;
        t[j++] = observer;
      }
    }
    _$jscoverage['/custom/observable.js'].lineData[194]++;
    self.observers = t;
  } else {
    _$jscoverage['/custom/observable.js'].lineData[197]++;
    self.reset();
  }
}});
  _$jscoverage['/custom/observable.js'].lineData[206]++;
  var KS_CUSTOM_EVENTS = '__~ks_custom_events';
  _$jscoverage['/custom/observable.js'].lineData[218]++;
  CustomEventObservable.getCustomEventObservable = function(target, type, create) {
  _$jscoverage['/custom/observable.js'].functionData[6]++;
  _$jscoverage['/custom/observable.js'].lineData[219]++;
  var customEvent, customEventObservables = CustomEventObservable.getCustomEventObservables(target, create);
  _$jscoverage['/custom/observable.js'].lineData[221]++;
  customEvent = visit33_221_1(customEventObservables && customEventObservables[type]);
  _$jscoverage['/custom/observable.js'].lineData[222]++;
  if (visit34_222_1(!customEvent && create)) {
    _$jscoverage['/custom/observable.js'].lineData[223]++;
    customEvent = customEventObservables[type] = new CustomEventObservable({
  currentTarget: target, 
  type: type});
  }
  _$jscoverage['/custom/observable.js'].lineData[228]++;
  return customEvent;
};
  _$jscoverage['/custom/observable.js'].lineData[239]++;
  CustomEventObservable.getCustomEventObservables = function(target, create) {
  _$jscoverage['/custom/observable.js'].functionData[7]++;
  _$jscoverage['/custom/observable.js'].lineData[240]++;
  if (visit35_240_1(!target[KS_CUSTOM_EVENTS] && create)) {
    _$jscoverage['/custom/observable.js'].lineData[241]++;
    target[KS_CUSTOM_EVENTS] = {};
  }
  _$jscoverage['/custom/observable.js'].lineData[243]++;
  return target[KS_CUSTOM_EVENTS];
};
  _$jscoverage['/custom/observable.js'].lineData[246]++;
  return CustomEventObservable;
}, {
  requires: ['./observer', './object', 'event/base']});
