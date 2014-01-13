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
if (! _$jscoverage['/navigation-view.js']) {
  _$jscoverage['/navigation-view.js'] = {};
  _$jscoverage['/navigation-view.js'].lineData = [];
  _$jscoverage['/navigation-view.js'].lineData[5] = 0;
  _$jscoverage['/navigation-view.js'].lineData[6] = 0;
  _$jscoverage['/navigation-view.js'].lineData[7] = 0;
  _$jscoverage['/navigation-view.js'].lineData[8] = 0;
  _$jscoverage['/navigation-view.js'].lineData[9] = 0;
  _$jscoverage['/navigation-view.js'].lineData[10] = 0;
  _$jscoverage['/navigation-view.js'].lineData[11] = 0;
  _$jscoverage['/navigation-view.js'].lineData[17] = 0;
  _$jscoverage['/navigation-view.js'].lineData[19] = 0;
  _$jscoverage['/navigation-view.js'].lineData[21] = 0;
  _$jscoverage['/navigation-view.js'].lineData[24] = 0;
  _$jscoverage['/navigation-view.js'].lineData[25] = 0;
  _$jscoverage['/navigation-view.js'].lineData[29] = 0;
  _$jscoverage['/navigation-view.js'].lineData[30] = 0;
  _$jscoverage['/navigation-view.js'].lineData[31] = 0;
  _$jscoverage['/navigation-view.js'].lineData[35] = 0;
  _$jscoverage['/navigation-view.js'].lineData[37] = 0;
  _$jscoverage['/navigation-view.js'].lineData[44] = 0;
  _$jscoverage['/navigation-view.js'].lineData[45] = 0;
  _$jscoverage['/navigation-view.js'].lineData[46] = 0;
  _$jscoverage['/navigation-view.js'].lineData[47] = 0;
  _$jscoverage['/navigation-view.js'].lineData[48] = 0;
  _$jscoverage['/navigation-view.js'].lineData[49] = 0;
  _$jscoverage['/navigation-view.js'].lineData[53] = 0;
  _$jscoverage['/navigation-view.js'].lineData[54] = 0;
  _$jscoverage['/navigation-view.js'].lineData[55] = 0;
  _$jscoverage['/navigation-view.js'].lineData[56] = 0;
  _$jscoverage['/navigation-view.js'].lineData[58] = 0;
  _$jscoverage['/navigation-view.js'].lineData[59] = 0;
  _$jscoverage['/navigation-view.js'].lineData[60] = 0;
  _$jscoverage['/navigation-view.js'].lineData[61] = 0;
  _$jscoverage['/navigation-view.js'].lineData[62] = 0;
  _$jscoverage['/navigation-view.js'].lineData[63] = 0;
  _$jscoverage['/navigation-view.js'].lineData[64] = 0;
  _$jscoverage['/navigation-view.js'].lineData[65] = 0;
  _$jscoverage['/navigation-view.js'].lineData[66] = 0;
  _$jscoverage['/navigation-view.js'].lineData[67] = 0;
  _$jscoverage['/navigation-view.js'].lineData[69] = 0;
  _$jscoverage['/navigation-view.js'].lineData[70] = 0;
  _$jscoverage['/navigation-view.js'].lineData[72] = 0;
  _$jscoverage['/navigation-view.js'].lineData[73] = 0;
  _$jscoverage['/navigation-view.js'].lineData[74] = 0;
  _$jscoverage['/navigation-view.js'].lineData[75] = 0;
  _$jscoverage['/navigation-view.js'].lineData[82] = 0;
  _$jscoverage['/navigation-view.js'].lineData[83] = 0;
  _$jscoverage['/navigation-view.js'].lineData[84] = 0;
  _$jscoverage['/navigation-view.js'].lineData[85] = 0;
  _$jscoverage['/navigation-view.js'].lineData[86] = 0;
  _$jscoverage['/navigation-view.js'].lineData[93] = 0;
  _$jscoverage['/navigation-view.js'].lineData[95] = 0;
  _$jscoverage['/navigation-view.js'].lineData[96] = 0;
  _$jscoverage['/navigation-view.js'].lineData[97] = 0;
  _$jscoverage['/navigation-view.js'].lineData[104] = 0;
  _$jscoverage['/navigation-view.js'].lineData[105] = 0;
  _$jscoverage['/navigation-view.js'].lineData[107] = 0;
  _$jscoverage['/navigation-view.js'].lineData[109] = 0;
  _$jscoverage['/navigation-view.js'].lineData[110] = 0;
  _$jscoverage['/navigation-view.js'].lineData[111] = 0;
  _$jscoverage['/navigation-view.js'].lineData[112] = 0;
  _$jscoverage['/navigation-view.js'].lineData[113] = 0;
  _$jscoverage['/navigation-view.js'].lineData[114] = 0;
  _$jscoverage['/navigation-view.js'].lineData[118] = 0;
  _$jscoverage['/navigation-view.js'].lineData[119] = 0;
  _$jscoverage['/navigation-view.js'].lineData[120] = 0;
  _$jscoverage['/navigation-view.js'].lineData[121] = 0;
  _$jscoverage['/navigation-view.js'].lineData[122] = 0;
  _$jscoverage['/navigation-view.js'].lineData[123] = 0;
  _$jscoverage['/navigation-view.js'].lineData[124] = 0;
  _$jscoverage['/navigation-view.js'].lineData[125] = 0;
  _$jscoverage['/navigation-view.js'].lineData[126] = 0;
  _$jscoverage['/navigation-view.js'].lineData[133] = 0;
  _$jscoverage['/navigation-view.js'].lineData[134] = 0;
  _$jscoverage['/navigation-view.js'].lineData[135] = 0;
  _$jscoverage['/navigation-view.js'].lineData[136] = 0;
  _$jscoverage['/navigation-view.js'].lineData[137] = 0;
  _$jscoverage['/navigation-view.js'].lineData[138] = 0;
  _$jscoverage['/navigation-view.js'].lineData[139] = 0;
  _$jscoverage['/navigation-view.js'].lineData[140] = 0;
  _$jscoverage['/navigation-view.js'].lineData[141] = 0;
  _$jscoverage['/navigation-view.js'].lineData[142] = 0;
  _$jscoverage['/navigation-view.js'].lineData[143] = 0;
  _$jscoverage['/navigation-view.js'].lineData[144] = 0;
  _$jscoverage['/navigation-view.js'].lineData[146] = 0;
  _$jscoverage['/navigation-view.js'].lineData[147] = 0;
  _$jscoverage['/navigation-view.js'].lineData[149] = 0;
  _$jscoverage['/navigation-view.js'].lineData[150] = 0;
  _$jscoverage['/navigation-view.js'].lineData[151] = 0;
  _$jscoverage['/navigation-view.js'].lineData[152] = 0;
  _$jscoverage['/navigation-view.js'].lineData[159] = 0;
  _$jscoverage['/navigation-view.js'].lineData[160] = 0;
  _$jscoverage['/navigation-view.js'].lineData[161] = 0;
  _$jscoverage['/navigation-view.js'].lineData[162] = 0;
  _$jscoverage['/navigation-view.js'].lineData[163] = 0;
  _$jscoverage['/navigation-view.js'].lineData[164] = 0;
  _$jscoverage['/navigation-view.js'].lineData[172] = 0;
  _$jscoverage['/navigation-view.js'].lineData[173] = 0;
  _$jscoverage['/navigation-view.js'].lineData[174] = 0;
  _$jscoverage['/navigation-view.js'].lineData[175] = 0;
  _$jscoverage['/navigation-view.js'].lineData[182] = 0;
  _$jscoverage['/navigation-view.js'].lineData[185] = 0;
  _$jscoverage['/navigation-view.js'].lineData[186] = 0;
  _$jscoverage['/navigation-view.js'].lineData[187] = 0;
  _$jscoverage['/navigation-view.js'].lineData[188] = 0;
  _$jscoverage['/navigation-view.js'].lineData[189] = 0;
  _$jscoverage['/navigation-view.js'].lineData[193] = 0;
  _$jscoverage['/navigation-view.js'].lineData[195] = 0;
  _$jscoverage['/navigation-view.js'].lineData[196] = 0;
  _$jscoverage['/navigation-view.js'].lineData[197] = 0;
  _$jscoverage['/navigation-view.js'].lineData[198] = 0;
  _$jscoverage['/navigation-view.js'].lineData[199] = 0;
  _$jscoverage['/navigation-view.js'].lineData[200] = 0;
  _$jscoverage['/navigation-view.js'].lineData[201] = 0;
  _$jscoverage['/navigation-view.js'].lineData[202] = 0;
  _$jscoverage['/navigation-view.js'].lineData[203] = 0;
}
if (! _$jscoverage['/navigation-view.js'].functionData) {
  _$jscoverage['/navigation-view.js'].functionData = [];
  _$jscoverage['/navigation-view.js'].functionData[0] = 0;
  _$jscoverage['/navigation-view.js'].functionData[1] = 0;
  _$jscoverage['/navigation-view.js'].functionData[2] = 0;
  _$jscoverage['/navigation-view.js'].functionData[3] = 0;
  _$jscoverage['/navigation-view.js'].functionData[4] = 0;
  _$jscoverage['/navigation-view.js'].functionData[5] = 0;
  _$jscoverage['/navigation-view.js'].functionData[6] = 0;
  _$jscoverage['/navigation-view.js'].functionData[7] = 0;
  _$jscoverage['/navigation-view.js'].functionData[8] = 0;
}
if (! _$jscoverage['/navigation-view.js'].branchData) {
  _$jscoverage['/navigation-view.js'].branchData = {};
  _$jscoverage['/navigation-view.js'].branchData['30'] = [];
  _$jscoverage['/navigation-view.js'].branchData['30'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['55'] = [];
  _$jscoverage['/navigation-view.js'].branchData['55'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['64'] = [];
  _$jscoverage['/navigation-view.js'].branchData['64'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['66'] = [];
  _$jscoverage['/navigation-view.js'].branchData['66'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['69'] = [];
  _$jscoverage['/navigation-view.js'].branchData['69'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['72'] = [];
  _$jscoverage['/navigation-view.js'].branchData['72'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['82'] = [];
  _$jscoverage['/navigation-view.js'].branchData['82'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['107'] = [];
  _$jscoverage['/navigation-view.js'].branchData['107'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['110'] = [];
  _$jscoverage['/navigation-view.js'].branchData['110'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['118'] = [];
  _$jscoverage['/navigation-view.js'].branchData['118'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['121'] = [];
  _$jscoverage['/navigation-view.js'].branchData['121'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['121'][2] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['125'] = [];
  _$jscoverage['/navigation-view.js'].branchData['125'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['134'] = [];
  _$jscoverage['/navigation-view.js'].branchData['134'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['141'] = [];
  _$jscoverage['/navigation-view.js'].branchData['141'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['143'] = [];
  _$jscoverage['/navigation-view.js'].branchData['143'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['146'] = [];
  _$jscoverage['/navigation-view.js'].branchData['146'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['149'] = [];
  _$jscoverage['/navigation-view.js'].branchData['149'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['159'] = [];
  _$jscoverage['/navigation-view.js'].branchData['159'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['185'] = [];
  _$jscoverage['/navigation-view.js'].branchData['185'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['193'] = [];
  _$jscoverage['/navigation-view.js'].branchData['193'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['193'][2] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['195'] = [];
  _$jscoverage['/navigation-view.js'].branchData['195'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['198'] = [];
  _$jscoverage['/navigation-view.js'].branchData['198'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['198'][2] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['202'] = [];
  _$jscoverage['/navigation-view.js'].branchData['202'][1] = new BranchData();
}
_$jscoverage['/navigation-view.js'].branchData['202'][1].init(228, 27, 'nextView.get(\'title\') || \'\'');
function visit50_202_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['202'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['198'][2].init(50, 39, 'self.waitingView.uuid === nextView.uuid');
function visit49_198_2(result) {
  _$jscoverage['/navigation-view.js'].branchData['198'][2].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['198'][1].init(30, 59, 'self.waitingView && self.waitingView.uuid === nextView.uuid');
function visit48_198_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['198'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['195'][1].init(2697, 16, 'nextView.promise');
function visit47_195_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['195'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['193'][2].init(2646, 25, 'this.viewStack.length > 1');
function visit46_193_2(result) {
  _$jscoverage['/navigation-view.js'].branchData['193'][2].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['193'][1].init(2617, 27, 'nextView.get(\'title\') || \'\'');
function visit45_193_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['193'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['185'][1].init(26, 17, '!nextView.promise');
function visit44_185_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['185'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['159'][1].init(461, 16, 'nextView.promise');
function visit43_159_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['159'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['149'][1].init(656, 10, 'activeView');
function visit42_149_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['149'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['146'][1].init(559, 14, 'nextView.enter');
function visit41_146_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['146'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['143'][1].init(427, 42, 'self.waitingView && self.waitingView.leave');
function visit40_143_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['143'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['141'][1].init(304, 49, '(activeView = this.activeView) && activeView.leave');
function visit39_141_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['141'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['134'][1].init(48, 25, 'this.viewStack.length > 1');
function visit38_134_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['134'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['125'][1].init(212, 27, 'nextView.get(\'title\') || \'\'');
function visit37_125_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['125'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['121'][2].init(46, 39, 'self.waitingView.uuid === nextView.uuid');
function visit36_121_2(result) {
  _$jscoverage['/navigation-view.js'].branchData['121'][2].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['121'][1].init(26, 59, 'self.waitingView && self.waitingView.uuid === nextView.uuid');
function visit35_121_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['121'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['118'][1].init(2670, 16, 'nextView.promise');
function visit34_118_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['118'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['110'][1].init(80, 17, '!nextView.promise');
function visit33_110_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['110'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['107'][1].init(1462, 27, 'nextView.get(\'title\') || \'\'');
function visit32_107_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['107'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['82'][1].init(410, 16, 'nextView.promise');
function visit31_82_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['82'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['72'][1].init(794, 10, 'activeView');
function visit30_72_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['72'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['69'][1].init(709, 14, 'nextView.enter');
function visit29_69_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['69'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['66'][1].init(589, 42, 'self.waitingView && self.waitingView.leave');
function visit28_66_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['66'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['64'][1].init(474, 49, '(activeView = this.activeView) && activeView.leave');
function visit27_64_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['64'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['55'][1].init(88, 23, '!nextView.get(\'render\')');
function visit26_55_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['55'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['30'][1].init(14, 28, 'e.target === this.get(\'bar\')');
function visit25_30_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['30'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].lineData[5]++;
KISSY.add(function(S, require) {
  _$jscoverage['/navigation-view.js'].functionData[0]++;
  _$jscoverage['/navigation-view.js'].lineData[6]++;
  var $ = require('node').all;
  _$jscoverage['/navigation-view.js'].lineData[7]++;
  var Container = require('component/container');
  _$jscoverage['/navigation-view.js'].lineData[8]++;
  var Bar = require('navigation-view/bar');
  _$jscoverage['/navigation-view.js'].lineData[9]++;
  var ContentTpl = require('component/extension/content-xtpl');
  _$jscoverage['/navigation-view.js'].lineData[10]++;
  var ContentRender = require('component/extension/content-render');
  _$jscoverage['/navigation-view.js'].lineData[11]++;
  var LOADING_HTML = '<div class="{prefixCls}navigation-view-loading">' + '<div class="{prefixCls}navigation-view-loading-outer">' + '<div class="{prefixCls}navigation-view-loading-inner"></div>' + '</div>' + '</div>';
  _$jscoverage['/navigation-view.js'].lineData[17]++;
  var uuid = 0;
  _$jscoverage['/navigation-view.js'].lineData[19]++;
  var NavigationViewRender = Container.getDefaultRender().extend([ContentRender], {
  renderUI: function() {
  _$jscoverage['/navigation-view.js'].functionData[1]++;
  _$jscoverage['/navigation-view.js'].lineData[21]++;
  var loadingEl = $(S.substitute(LOADING_HTML, {
  prefixCls: this.control.get('prefixCls')}));
  _$jscoverage['/navigation-view.js'].lineData[24]++;
  this.control.get('contentEl').append(loadingEl);
  _$jscoverage['/navigation-view.js'].lineData[25]++;
  this.control.loadingEl = loadingEl;
}});
  _$jscoverage['/navigation-view.js'].lineData[29]++;
  function onBack(e) {
    _$jscoverage['/navigation-view.js'].functionData[2]++;
    _$jscoverage['/navigation-view.js'].lineData[30]++;
    if (visit25_30_1(e.target === this.get('bar'))) {
      _$jscoverage['/navigation-view.js'].lineData[31]++;
      this.pop();
    }
  }
  _$jscoverage['/navigation-view.js'].lineData[35]++;
  return Container.extend({
  initializer: function() {
  _$jscoverage['/navigation-view.js'].functionData[3]++;
  _$jscoverage['/navigation-view.js'].lineData[37]++;
  this.publish('back', {
  defaultFn: onBack, 
  defaultTargetOnly: false});
}, 
  renderUI: function() {
  _$jscoverage['/navigation-view.js'].functionData[4]++;
  _$jscoverage['/navigation-view.js'].lineData[44]++;
  this.viewStack = [];
  _$jscoverage['/navigation-view.js'].lineData[45]++;
  var bar;
  _$jscoverage['/navigation-view.js'].lineData[46]++;
  var barCfg = this.get('barCfg');
  _$jscoverage['/navigation-view.js'].lineData[47]++;
  barCfg.elBefore = this.get('el')[0].firstChild;
  _$jscoverage['/navigation-view.js'].lineData[48]++;
  this.setInternal('bar', bar = new Bar(barCfg).render());
  _$jscoverage['/navigation-view.js'].lineData[49]++;
  bar.addTarget(this);
}, 
  push: function(nextView) {
  _$jscoverage['/navigation-view.js'].functionData[5]++;
  _$jscoverage['/navigation-view.js'].lineData[53]++;
  var self = this;
  _$jscoverage['/navigation-view.js'].lineData[54]++;
  var bar = this.get('bar');
  _$jscoverage['/navigation-view.js'].lineData[55]++;
  if (visit26_55_1(!nextView.get('render'))) {
    _$jscoverage['/navigation-view.js'].lineData[56]++;
    self.addChild(nextView);
  }
  _$jscoverage['/navigation-view.js'].lineData[58]++;
  var nextViewEl = nextView.get('el');
  _$jscoverage['/navigation-view.js'].lineData[59]++;
  nextViewEl.css('transform', 'translateX(-9999px) translateZ(0)');
  _$jscoverage['/navigation-view.js'].lineData[60]++;
  nextView.uuid = uuid++;
  _$jscoverage['/navigation-view.js'].lineData[61]++;
  var activeView;
  _$jscoverage['/navigation-view.js'].lineData[62]++;
  var loadingEl = this.loadingEl;
  _$jscoverage['/navigation-view.js'].lineData[63]++;
  this.viewStack.push(nextView);
  _$jscoverage['/navigation-view.js'].lineData[64]++;
  if (visit27_64_1((activeView = this.activeView) && activeView.leave)) {
    _$jscoverage['/navigation-view.js'].lineData[65]++;
    activeView.leave();
  } else {
    _$jscoverage['/navigation-view.js'].lineData[66]++;
    if (visit28_66_1(self.waitingView && self.waitingView.leave)) {
      _$jscoverage['/navigation-view.js'].lineData[67]++;
      self.waitingView.leave();
    }
  }
  _$jscoverage['/navigation-view.js'].lineData[69]++;
  if (visit29_69_1(nextView.enter)) {
    _$jscoverage['/navigation-view.js'].lineData[70]++;
    nextView.enter();
  }
  _$jscoverage['/navigation-view.js'].lineData[72]++;
  if (visit30_72_1(activeView)) {
    _$jscoverage['/navigation-view.js'].lineData[73]++;
    var activeEl = activeView.get('el');
    _$jscoverage['/navigation-view.js'].lineData[74]++;
    activeEl.stop(true);
    _$jscoverage['/navigation-view.js'].lineData[75]++;
    activeEl.animate({
  transform: 'translateX(-' + activeEl[0].offsetWidth + 'px) translateZ(0)'}, {
  useTransition: true, 
  easing: 'ease-in-out', 
  duration: 0.25});
    _$jscoverage['/navigation-view.js'].lineData[82]++;
    if (visit31_82_1(nextView.promise)) {
      _$jscoverage['/navigation-view.js'].lineData[83]++;
      loadingEl.stop(true);
      _$jscoverage['/navigation-view.js'].lineData[84]++;
      loadingEl.css('left', '100%');
      _$jscoverage['/navigation-view.js'].lineData[85]++;
      loadingEl.show();
      _$jscoverage['/navigation-view.js'].lineData[86]++;
      loadingEl.animate({
  left: '0'}, {
  useTransition: true, 
  easing: 'ease-in-out', 
  duration: 0.25});
      _$jscoverage['/navigation-view.js'].lineData[93]++;
      this.activeView = null;
    } else {
      _$jscoverage['/navigation-view.js'].lineData[95]++;
      nextViewEl.stop(true);
      _$jscoverage['/navigation-view.js'].lineData[96]++;
      nextViewEl.css('transform', 'translateX(' + activeEl[0].offsetWidth + 'px) translateZ(0)');
      _$jscoverage['/navigation-view.js'].lineData[97]++;
      nextViewEl.animate({
  transform: ''}, {
  useTransition: true, 
  easing: 'ease-in-out', 
  duration: 0.25});
      _$jscoverage['/navigation-view.js'].lineData[104]++;
      this.activeView = nextView;
      _$jscoverage['/navigation-view.js'].lineData[105]++;
      self.waitingView = null;
    }
    _$jscoverage['/navigation-view.js'].lineData[107]++;
    bar.forward(visit32_107_1(nextView.get('title') || ''));
  } else {
    _$jscoverage['/navigation-view.js'].lineData[109]++;
    bar.set('title', nextView.get('title'));
    _$jscoverage['/navigation-view.js'].lineData[110]++;
    if (visit33_110_1(!nextView.promise)) {
      _$jscoverage['/navigation-view.js'].lineData[111]++;
      nextView.get('el').css('transform', '');
      _$jscoverage['/navigation-view.js'].lineData[112]++;
      this.activeView = nextView;
      _$jscoverage['/navigation-view.js'].lineData[113]++;
      self.waitingView = null;
      _$jscoverage['/navigation-view.js'].lineData[114]++;
      loadingEl.hide();
    }
  }
  _$jscoverage['/navigation-view.js'].lineData[118]++;
  if (visit34_118_1(nextView.promise)) {
    _$jscoverage['/navigation-view.js'].lineData[119]++;
    self.waitingView = nextView;
    _$jscoverage['/navigation-view.js'].lineData[120]++;
    nextView.promise.then(function() {
  _$jscoverage['/navigation-view.js'].functionData[6]++;
  _$jscoverage['/navigation-view.js'].lineData[121]++;
  if (visit35_121_1(self.waitingView && visit36_121_2(self.waitingView.uuid === nextView.uuid))) {
    _$jscoverage['/navigation-view.js'].lineData[122]++;
    self.activeView = nextView;
    _$jscoverage['/navigation-view.js'].lineData[123]++;
    self.waitingView = null;
    _$jscoverage['/navigation-view.js'].lineData[124]++;
    nextView.get('el').css('transform', '');
    _$jscoverage['/navigation-view.js'].lineData[125]++;
    bar.set('title', visit37_125_1(nextView.get('title') || ''));
    _$jscoverage['/navigation-view.js'].lineData[126]++;
    loadingEl.hide();
  }
});
  }
}, 
  pop: function() {
  _$jscoverage['/navigation-view.js'].functionData[7]++;
  _$jscoverage['/navigation-view.js'].lineData[133]++;
  var self = this;
  _$jscoverage['/navigation-view.js'].lineData[134]++;
  if (visit38_134_1(this.viewStack.length > 1)) {
    _$jscoverage['/navigation-view.js'].lineData[135]++;
    this.viewStack.pop();
    _$jscoverage['/navigation-view.js'].lineData[136]++;
    var nextView = this.viewStack[this.viewStack.length - 1];
    _$jscoverage['/navigation-view.js'].lineData[137]++;
    nextView.uuid = uuid++;
    _$jscoverage['/navigation-view.js'].lineData[138]++;
    var activeView;
    _$jscoverage['/navigation-view.js'].lineData[139]++;
    var loadingEl = this.loadingEl;
    _$jscoverage['/navigation-view.js'].lineData[140]++;
    var bar = this.get('bar');
    _$jscoverage['/navigation-view.js'].lineData[141]++;
    if (visit39_141_1((activeView = this.activeView) && activeView.leave)) {
      _$jscoverage['/navigation-view.js'].lineData[142]++;
      activeView.leave();
    } else {
      _$jscoverage['/navigation-view.js'].lineData[143]++;
      if (visit40_143_1(self.waitingView && self.waitingView.leave)) {
        _$jscoverage['/navigation-view.js'].lineData[144]++;
        self.waitingView.leave();
      }
    }
    _$jscoverage['/navigation-view.js'].lineData[146]++;
    if (visit41_146_1(nextView.enter)) {
      _$jscoverage['/navigation-view.js'].lineData[147]++;
      nextView.enter();
    }
    _$jscoverage['/navigation-view.js'].lineData[149]++;
    if (visit42_149_1(activeView)) {
      _$jscoverage['/navigation-view.js'].lineData[150]++;
      var activeEl = activeView.get('el');
      _$jscoverage['/navigation-view.js'].lineData[151]++;
      activeEl.stop(true);
      _$jscoverage['/navigation-view.js'].lineData[152]++;
      activeEl.animate({
  transform: 'translateX(' + activeView.get('el')[0].offsetWidth + 'px) translateZ(0)'}, {
  useTransition: true, 
  easing: 'ease-in-out', 
  duration: 0.25});
      _$jscoverage['/navigation-view.js'].lineData[159]++;
      if (visit43_159_1(nextView.promise)) {
        _$jscoverage['/navigation-view.js'].lineData[160]++;
        this.activeView = null;
        _$jscoverage['/navigation-view.js'].lineData[161]++;
        loadingEl.stop(true);
        _$jscoverage['/navigation-view.js'].lineData[162]++;
        loadingEl.css('left', '-100%');
        _$jscoverage['/navigation-view.js'].lineData[163]++;
        loadingEl.show();
        _$jscoverage['/navigation-view.js'].lineData[164]++;
        loadingEl.animate({
  left: '0'}, {
  useTransition: true, 
  easing: 'ease-in-out', 
  duration: 0.25});
      } else {
        _$jscoverage['/navigation-view.js'].lineData[172]++;
        var nextViewEl = nextView.get('el');
        _$jscoverage['/navigation-view.js'].lineData[173]++;
        nextViewEl.stop(true);
        _$jscoverage['/navigation-view.js'].lineData[174]++;
        nextViewEl.css('transform', 'translateX(-' + activeEl[0].offsetWidth + 'px) translateZ(0)');
        _$jscoverage['/navigation-view.js'].lineData[175]++;
        nextViewEl.animate({
  transform: ''}, {
  useTransition: true, 
  easing: 'ease-in-out', 
  duration: 0.25});
        _$jscoverage['/navigation-view.js'].lineData[182]++;
        this.activeView = nextView;
      }
    } else {
      _$jscoverage['/navigation-view.js'].lineData[185]++;
      if (visit44_185_1(!nextView.promise)) {
        _$jscoverage['/navigation-view.js'].lineData[186]++;
        nextView.get('el').css('transform', '');
        _$jscoverage['/navigation-view.js'].lineData[187]++;
        this.activeView = nextView;
        _$jscoverage['/navigation-view.js'].lineData[188]++;
        self.waitingView = null;
        _$jscoverage['/navigation-view.js'].lineData[189]++;
        loadingEl.hide();
      }
    }
    _$jscoverage['/navigation-view.js'].lineData[193]++;
    bar.back(visit45_193_1(nextView.get('title') || ''), visit46_193_2(this.viewStack.length > 1));
    _$jscoverage['/navigation-view.js'].lineData[195]++;
    if (visit47_195_1(nextView.promise)) {
      _$jscoverage['/navigation-view.js'].lineData[196]++;
      self.waitingView = nextView;
      _$jscoverage['/navigation-view.js'].lineData[197]++;
      nextView.promise.then(function() {
  _$jscoverage['/navigation-view.js'].functionData[8]++;
  _$jscoverage['/navigation-view.js'].lineData[198]++;
  if (visit48_198_1(self.waitingView && visit49_198_2(self.waitingView.uuid === nextView.uuid))) {
    _$jscoverage['/navigation-view.js'].lineData[199]++;
    self.waitingView = null;
    _$jscoverage['/navigation-view.js'].lineData[200]++;
    self.activeView = nextView;
    _$jscoverage['/navigation-view.js'].lineData[201]++;
    nextView.get('el').css('transform', '');
    _$jscoverage['/navigation-view.js'].lineData[202]++;
    bar.set('title', visit50_202_1(nextView.get('title') || ''));
    _$jscoverage['/navigation-view.js'].lineData[203]++;
    loadingEl.hide();
  }
});
    }
  }
}}, {
  xclass: 'navigation-view', 
  ATTRS: {
  barCfg: {
  value: {}}, 
  handleMouseEvents: {
  value: false}, 
  focusable: {
  value: false}, 
  xrender: {
  value: NavigationViewRender}, 
  contentTpl: {
  value: ContentTpl}}});
});
