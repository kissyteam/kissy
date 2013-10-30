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
if (! _$jscoverage['/loader/data-structure.js']) {
  _$jscoverage['/loader/data-structure.js'] = {};
  _$jscoverage['/loader/data-structure.js'].lineData = [];
  _$jscoverage['/loader/data-structure.js'].lineData[6] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[7] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[12] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[13] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[23] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[24] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[27] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[29] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[38] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[46] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[54] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[58] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[60] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[71] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[72] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[73] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[75] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[83] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[91] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[99] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[107] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[115] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[123] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[127] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[134] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[135] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[136] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[137] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[140] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[142] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[146] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[147] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[149] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[150] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[151] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[152] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[154] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[155] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[159] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[167] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[175] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[177] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[178] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[179] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[181] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[183] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[185] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[193] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[200] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[201] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[202] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[204] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[205] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[206] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[208] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[211] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[213] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[214] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[215] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[216] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[219] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[221] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[229] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[231] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[232] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[233] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[235] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[243] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[244] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[253] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[261] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[269] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[270] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[280] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[281] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[289] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[290] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[298] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[300] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[301] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[306] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[309] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[310] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[311] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[312] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[315] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[323] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[328] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[329] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[330] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[333] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[335] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[336] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[342] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[344] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[345] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[349] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[351] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[352] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[355] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[358] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[363] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[364] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[368] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[369] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[370] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[373] = 0;
}
if (! _$jscoverage['/loader/data-structure.js'].functionData) {
  _$jscoverage['/loader/data-structure.js'].functionData = [];
  _$jscoverage['/loader/data-structure.js'].functionData[0] = 0;
  _$jscoverage['/loader/data-structure.js'].functionData[1] = 0;
  _$jscoverage['/loader/data-structure.js'].functionData[2] = 0;
  _$jscoverage['/loader/data-structure.js'].functionData[3] = 0;
  _$jscoverage['/loader/data-structure.js'].functionData[4] = 0;
  _$jscoverage['/loader/data-structure.js'].functionData[5] = 0;
  _$jscoverage['/loader/data-structure.js'].functionData[6] = 0;
  _$jscoverage['/loader/data-structure.js'].functionData[7] = 0;
  _$jscoverage['/loader/data-structure.js'].functionData[8] = 0;
  _$jscoverage['/loader/data-structure.js'].functionData[9] = 0;
  _$jscoverage['/loader/data-structure.js'].functionData[10] = 0;
  _$jscoverage['/loader/data-structure.js'].functionData[11] = 0;
  _$jscoverage['/loader/data-structure.js'].functionData[12] = 0;
  _$jscoverage['/loader/data-structure.js'].functionData[13] = 0;
  _$jscoverage['/loader/data-structure.js'].functionData[14] = 0;
  _$jscoverage['/loader/data-structure.js'].functionData[15] = 0;
  _$jscoverage['/loader/data-structure.js'].functionData[16] = 0;
  _$jscoverage['/loader/data-structure.js'].functionData[17] = 0;
  _$jscoverage['/loader/data-structure.js'].functionData[18] = 0;
  _$jscoverage['/loader/data-structure.js'].functionData[19] = 0;
  _$jscoverage['/loader/data-structure.js'].functionData[20] = 0;
  _$jscoverage['/loader/data-structure.js'].functionData[21] = 0;
  _$jscoverage['/loader/data-structure.js'].functionData[22] = 0;
  _$jscoverage['/loader/data-structure.js'].functionData[23] = 0;
  _$jscoverage['/loader/data-structure.js'].functionData[24] = 0;
  _$jscoverage['/loader/data-structure.js'].functionData[25] = 0;
  _$jscoverage['/loader/data-structure.js'].functionData[26] = 0;
  _$jscoverage['/loader/data-structure.js'].functionData[27] = 0;
  _$jscoverage['/loader/data-structure.js'].functionData[28] = 0;
  _$jscoverage['/loader/data-structure.js'].functionData[29] = 0;
  _$jscoverage['/loader/data-structure.js'].functionData[30] = 0;
  _$jscoverage['/loader/data-structure.js'].functionData[31] = 0;
  _$jscoverage['/loader/data-structure.js'].functionData[32] = 0;
  _$jscoverage['/loader/data-structure.js'].functionData[33] = 0;
  _$jscoverage['/loader/data-structure.js'].functionData[34] = 0;
}
if (! _$jscoverage['/loader/data-structure.js'].branchData) {
  _$jscoverage['/loader/data-structure.js'].branchData = {};
  _$jscoverage['/loader/data-structure.js'].branchData['61'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['61'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['72'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['72'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['149'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['149'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['177'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['177'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['178'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['178'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['200'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['200'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['201'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['201'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['208'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['208'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['214'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['214'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['231'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['231'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['244'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['244'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['270'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['270'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['281'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['281'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['290'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['290'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['309'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['309'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['309'][2] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['310'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['310'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['311'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['311'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['328'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['328'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['328'][2] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['329'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['329'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['330'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['330'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['332'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['332'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['351'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['351'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['369'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['369'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['369'][2] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['373'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['373'][1] = new BranchData();
}
_$jscoverage['/loader/data-structure.js'].branchData['373'][1].init(318, 32, 'packages[pName] || systemPackage');
function visit406_373_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['373'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['369'][2].init(57, 23, 'p.length > pName.length');
function visit405_369_2(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['369'][2].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['369'][1].init(18, 62, 'S.startsWith(modNameSlash, p + \'/\') && p.length > pName.length');
function visit404_369_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['369'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['351'][1].init(192, 24, 'm.getPackage().isDebug()');
function visit403_351_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['351'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['332'][1].init(114, 34, 'normalizedRequiresStatus == status');
function visit402_332_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['332'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['330'][1].init(345, 150, '(normalizedRequires = self.normalizedRequires) && (normalizedRequiresStatus == status)');
function visit401_330_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['330'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['329'][1].init(25, 14, 'requires || []');
function visit400_329_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['329'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['328'][2].init(255, 20, 'requires.length == 0');
function visit399_328_2(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['328'][2].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['328'][1].init(242, 33, '!requires || requires.length == 0');
function visit398_328_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['328'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['311'][1].init(254, 18, '!requiresWithAlias');
function visit397_311_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['311'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['310'][1].init(25, 14, 'requires || []');
function visit396_310_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['310'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['309'][2].init(165, 20, 'requires.length == 0');
function visit395_309_2(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['309'][2].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['309'][1].init(152, 33, '!requires || requires.length == 0');
function visit394_309_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['309'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['290'][1].init(51, 46, 'self.charset || self.getPackage().getCharset()');
function visit393_290_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['290'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['281'][1].init(51, 38, 'self.tag || self.getPackage().getTag()');
function visit392_281_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['281'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['270'][1].init(51, 93, 'self.packageInfo || (self.packageInfo = getPackage(self.runtime, self.name))');
function visit391_270_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['270'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['244'][1].init(51, 72, 'self.path || (self.path = defaultComponentJsName(self))');
function visit390_244_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['244'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['231'][1].init(78, 14, '!self.fullpath');
function visit389_231_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['231'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['214'][1].init(578, 17, 't = self.getTag()');
function visit388_214_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['214'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['208'][1].init(217, 178, 'packageInfo.isIgnorePackageNameInUri() && (packageName = packageInfo.getName())');
function visit387_208_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['208'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['201'][1].init(22, 13, 'self.fullpath');
function visit386_201_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['201'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['200'][1].init(214, 17, '!self.fullPathUri');
function visit385_200_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['200'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['178'][1].init(22, 47, 'Path.extname(self.name).toLowerCase() == \'.css\'');
function visit384_178_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['178'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['177'][1].init(80, 2, '!v');
function visit383_177_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['177'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['149'][1].init(124, 7, 'i < len');
function visit382_149_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['149'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['72'][1].init(48, 15, 'self.packageUri');
function visit381_72_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['72'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['61'][1].init(-1, 47, 'packageName && !self.isIgnorePackageNameInUri()');
function visit380_61_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['61'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].lineData[6]++;
(function(S) {
  _$jscoverage['/loader/data-structure.js'].functionData[0]++;
  _$jscoverage['/loader/data-structure.js'].lineData[7]++;
  var Loader = S.Loader, Path = S.Path, IGNORE_PACKAGE_NAME_IN_URI = 'ignorePackageNameInUri', Utils = Loader.Utils;
  _$jscoverage['/loader/data-structure.js'].lineData[12]++;
  function forwardSystemPackage(self, property) {
    _$jscoverage['/loader/data-structure.js'].functionData[1]++;
    _$jscoverage['/loader/data-structure.js'].lineData[13]++;
    return property in self ? self[property] : self.runtime.Config[property];
  }
  _$jscoverage['/loader/data-structure.js'].lineData[23]++;
  function Package(cfg) {
    _$jscoverage['/loader/data-structure.js'].functionData[2]++;
    _$jscoverage['/loader/data-structure.js'].lineData[24]++;
    S.mix(this, cfg);
  }
  _$jscoverage['/loader/data-structure.js'].lineData[27]++;
  S.augment(Package, {
  reset: function(cfg) {
  _$jscoverage['/loader/data-structure.js'].functionData[3]++;
  _$jscoverage['/loader/data-structure.js'].lineData[29]++;
  S.mix(this, cfg);
}, 
  getTag: function() {
  _$jscoverage['/loader/data-structure.js'].functionData[4]++;
  _$jscoverage['/loader/data-structure.js'].lineData[38]++;
  return forwardSystemPackage(this, 'tag');
}, 
  getName: function() {
  _$jscoverage['/loader/data-structure.js'].functionData[5]++;
  _$jscoverage['/loader/data-structure.js'].lineData[46]++;
  return this.name;
}, 
  'getBase': function() {
  _$jscoverage['/loader/data-structure.js'].functionData[6]++;
  _$jscoverage['/loader/data-structure.js'].lineData[54]++;
  return forwardSystemPackage(this, 'base');
}, 
  getPrefixUriForCombo: function() {
  _$jscoverage['/loader/data-structure.js'].functionData[7]++;
  _$jscoverage['/loader/data-structure.js'].lineData[58]++;
  var self = this, packageName = self.getName();
  _$jscoverage['/loader/data-structure.js'].lineData[60]++;
  return self.getBase() + (visit380_61_1(packageName && !self.isIgnorePackageNameInUri()) ? (packageName + '/') : '');
}, 
  getPackageUri: function() {
  _$jscoverage['/loader/data-structure.js'].functionData[8]++;
  _$jscoverage['/loader/data-structure.js'].lineData[71]++;
  var self = this;
  _$jscoverage['/loader/data-structure.js'].lineData[72]++;
  if (visit381_72_1(self.packageUri)) {
    _$jscoverage['/loader/data-structure.js'].lineData[73]++;
    return self.packageUri;
  }
  _$jscoverage['/loader/data-structure.js'].lineData[75]++;
  return self.packageUri = new S.Uri(this.getPrefixUriForCombo());
}, 
  getBaseUri: function() {
  _$jscoverage['/loader/data-structure.js'].functionData[9]++;
  _$jscoverage['/loader/data-structure.js'].lineData[83]++;
  return forwardSystemPackage(this, 'baseUri');
}, 
  isDebug: function() {
  _$jscoverage['/loader/data-structure.js'].functionData[10]++;
  _$jscoverage['/loader/data-structure.js'].lineData[91]++;
  return forwardSystemPackage(this, 'debug');
}, 
  isIgnorePackageNameInUri: function() {
  _$jscoverage['/loader/data-structure.js'].functionData[11]++;
  _$jscoverage['/loader/data-structure.js'].lineData[99]++;
  return forwardSystemPackage(this, IGNORE_PACKAGE_NAME_IN_URI);
}, 
  getCharset: function() {
  _$jscoverage['/loader/data-structure.js'].functionData[12]++;
  _$jscoverage['/loader/data-structure.js'].lineData[107]++;
  return forwardSystemPackage(this, 'charset');
}, 
  isCombine: function() {
  _$jscoverage['/loader/data-structure.js'].functionData[13]++;
  _$jscoverage['/loader/data-structure.js'].lineData[115]++;
  return forwardSystemPackage(this, 'combine');
}, 
  getGroup: function() {
  _$jscoverage['/loader/data-structure.js'].functionData[14]++;
  _$jscoverage['/loader/data-structure.js'].lineData[123]++;
  return forwardSystemPackage(this, 'group');
}});
  _$jscoverage['/loader/data-structure.js'].lineData[127]++;
  Loader.Package = Package;
  _$jscoverage['/loader/data-structure.js'].lineData[134]++;
  function Module(cfg) {
    _$jscoverage['/loader/data-structure.js'].functionData[15]++;
    _$jscoverage['/loader/data-structure.js'].lineData[135]++;
    this.status = Loader.Status.INIT;
    _$jscoverage['/loader/data-structure.js'].lineData[136]++;
    S.mix(this, cfg);
    _$jscoverage['/loader/data-structure.js'].lineData[137]++;
    this.waitedCallbacks = [];
  }
  _$jscoverage['/loader/data-structure.js'].lineData[140]++;
  S.augment(Module, {
  wait: function(callback) {
  _$jscoverage['/loader/data-structure.js'].functionData[16]++;
  _$jscoverage['/loader/data-structure.js'].lineData[142]++;
  this.waitedCallbacks.push(callback);
}, 
  notifyAll: function() {
  _$jscoverage['/loader/data-structure.js'].functionData[17]++;
  _$jscoverage['/loader/data-structure.js'].lineData[146]++;
  var callback;
  _$jscoverage['/loader/data-structure.js'].lineData[147]++;
  var len = this.waitedCallbacks.length, i = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[149]++;
  for (; visit382_149_1(i < len); i++) {
    _$jscoverage['/loader/data-structure.js'].lineData[150]++;
    callback = this.waitedCallbacks[i];
    _$jscoverage['/loader/data-structure.js'].lineData[151]++;
    try {
      _$jscoverage['/loader/data-structure.js'].lineData[152]++;
      callback(this);
    }    catch (e) {
  _$jscoverage['/loader/data-structure.js'].lineData[154]++;
  setTimeout(function() {
  _$jscoverage['/loader/data-structure.js'].functionData[18]++;
  _$jscoverage['/loader/data-structure.js'].lineData[155]++;
  throw e;
}, 0);
}
  }
  _$jscoverage['/loader/data-structure.js'].lineData[159]++;
  this.waitedCallbacks = [];
}, 
  'setValue': function(v) {
  _$jscoverage['/loader/data-structure.js'].functionData[19]++;
  _$jscoverage['/loader/data-structure.js'].lineData[167]++;
  this.value = v;
}, 
  getType: function() {
  _$jscoverage['/loader/data-structure.js'].functionData[20]++;
  _$jscoverage['/loader/data-structure.js'].lineData[175]++;
  var self = this, v = self.type;
  _$jscoverage['/loader/data-structure.js'].lineData[177]++;
  if (visit383_177_1(!v)) {
    _$jscoverage['/loader/data-structure.js'].lineData[178]++;
    if (visit384_178_1(Path.extname(self.name).toLowerCase() == '.css')) {
      _$jscoverage['/loader/data-structure.js'].lineData[179]++;
      v = 'css';
    } else {
      _$jscoverage['/loader/data-structure.js'].lineData[181]++;
      v = 'js';
    }
    _$jscoverage['/loader/data-structure.js'].lineData[183]++;
    self.type = v;
  }
  _$jscoverage['/loader/data-structure.js'].lineData[185]++;
  return v;
}, 
  getFullPathUri: function() {
  _$jscoverage['/loader/data-structure.js'].functionData[21]++;
  _$jscoverage['/loader/data-structure.js'].lineData[193]++;
  var self = this, t, fullPathUri, packageBaseUri, packageInfo, packageName, path;
  _$jscoverage['/loader/data-structure.js'].lineData[200]++;
  if (visit385_200_1(!self.fullPathUri)) {
    _$jscoverage['/loader/data-structure.js'].lineData[201]++;
    if (visit386_201_1(self.fullpath)) {
      _$jscoverage['/loader/data-structure.js'].lineData[202]++;
      fullPathUri = new S.Uri(self.fullpath);
    } else {
      _$jscoverage['/loader/data-structure.js'].lineData[204]++;
      packageInfo = self.getPackage();
      _$jscoverage['/loader/data-structure.js'].lineData[205]++;
      packageBaseUri = packageInfo.getBaseUri();
      _$jscoverage['/loader/data-structure.js'].lineData[206]++;
      path = self.getPath();
      _$jscoverage['/loader/data-structure.js'].lineData[208]++;
      if (visit387_208_1(packageInfo.isIgnorePackageNameInUri() && (packageName = packageInfo.getName()))) {
        _$jscoverage['/loader/data-structure.js'].lineData[211]++;
        path = Path.relative(packageName, path);
      }
      _$jscoverage['/loader/data-structure.js'].lineData[213]++;
      fullPathUri = packageBaseUri.resolve(path);
      _$jscoverage['/loader/data-structure.js'].lineData[214]++;
      if (visit388_214_1(t = self.getTag())) {
        _$jscoverage['/loader/data-structure.js'].lineData[215]++;
        t += '.' + self.getType();
        _$jscoverage['/loader/data-structure.js'].lineData[216]++;
        fullPathUri.query.set('t', t);
      }
    }
    _$jscoverage['/loader/data-structure.js'].lineData[219]++;
    self.fullPathUri = fullPathUri;
  }
  _$jscoverage['/loader/data-structure.js'].lineData[221]++;
  return self.fullPathUri;
}, 
  getFullPath: function() {
  _$jscoverage['/loader/data-structure.js'].functionData[22]++;
  _$jscoverage['/loader/data-structure.js'].lineData[229]++;
  var self = this, fullPathUri;
  _$jscoverage['/loader/data-structure.js'].lineData[231]++;
  if (visit389_231_1(!self.fullpath)) {
    _$jscoverage['/loader/data-structure.js'].lineData[232]++;
    fullPathUri = self.getFullPathUri();
    _$jscoverage['/loader/data-structure.js'].lineData[233]++;
    self.fullpath = Utils.getMappedPath(self.runtime, fullPathUri.toString());
  }
  _$jscoverage['/loader/data-structure.js'].lineData[235]++;
  return self.fullpath;
}, 
  getPath: function() {
  _$jscoverage['/loader/data-structure.js'].functionData[23]++;
  _$jscoverage['/loader/data-structure.js'].lineData[243]++;
  var self = this;
  _$jscoverage['/loader/data-structure.js'].lineData[244]++;
  return visit390_244_1(self.path || (self.path = defaultComponentJsName(self)));
}, 
  getValue: function() {
  _$jscoverage['/loader/data-structure.js'].functionData[24]++;
  _$jscoverage['/loader/data-structure.js'].lineData[253]++;
  return this.value;
}, 
  getName: function() {
  _$jscoverage['/loader/data-structure.js'].functionData[25]++;
  _$jscoverage['/loader/data-structure.js'].lineData[261]++;
  return this.name;
}, 
  getPackage: function() {
  _$jscoverage['/loader/data-structure.js'].functionData[26]++;
  _$jscoverage['/loader/data-structure.js'].lineData[269]++;
  var self = this;
  _$jscoverage['/loader/data-structure.js'].lineData[270]++;
  return visit391_270_1(self.packageInfo || (self.packageInfo = getPackage(self.runtime, self.name)));
}, 
  getTag: function() {
  _$jscoverage['/loader/data-structure.js'].functionData[27]++;
  _$jscoverage['/loader/data-structure.js'].lineData[280]++;
  var self = this;
  _$jscoverage['/loader/data-structure.js'].lineData[281]++;
  return visit392_281_1(self.tag || self.getPackage().getTag());
}, 
  getCharset: function() {
  _$jscoverage['/loader/data-structure.js'].functionData[28]++;
  _$jscoverage['/loader/data-structure.js'].lineData[289]++;
  var self = this;
  _$jscoverage['/loader/data-structure.js'].lineData[290]++;
  return visit393_290_1(self.charset || self.getPackage().getCharset());
}, 
  'getRequiredMods': function() {
  _$jscoverage['/loader/data-structure.js'].functionData[29]++;
  _$jscoverage['/loader/data-structure.js'].lineData[298]++;
  var self = this, runtime = self.runtime;
  _$jscoverage['/loader/data-structure.js'].lineData[300]++;
  return S.map(self.getNormalizedRequires(), function(r) {
  _$jscoverage['/loader/data-structure.js'].functionData[30]++;
  _$jscoverage['/loader/data-structure.js'].lineData[301]++;
  return Utils.createModuleInfo(runtime, r);
});
}, 
  getRequiresWithAlias: function() {
  _$jscoverage['/loader/data-structure.js'].functionData[31]++;
  _$jscoverage['/loader/data-structure.js'].lineData[306]++;
  var self = this, requiresWithAlias = self.requiresWithAlias, requires = self.requires;
  _$jscoverage['/loader/data-structure.js'].lineData[309]++;
  if (visit394_309_1(!requires || visit395_309_2(requires.length == 0))) {
    _$jscoverage['/loader/data-structure.js'].lineData[310]++;
    return visit396_310_1(requires || []);
  } else {
    _$jscoverage['/loader/data-structure.js'].lineData[311]++;
    if (visit397_311_1(!requiresWithAlias)) {
      _$jscoverage['/loader/data-structure.js'].lineData[312]++;
      self.requiresWithAlias = requiresWithAlias = Utils.normalizeModNamesWithAlias(self.runtime, requires, self.name);
    }
  }
  _$jscoverage['/loader/data-structure.js'].lineData[315]++;
  return requiresWithAlias;
}, 
  getNormalizedRequires: function() {
  _$jscoverage['/loader/data-structure.js'].functionData[32]++;
  _$jscoverage['/loader/data-structure.js'].lineData[323]++;
  var self = this, normalizedRequires, normalizedRequiresStatus = self.normalizedRequiresStatus, status = self.status, requires = self.requires;
  _$jscoverage['/loader/data-structure.js'].lineData[328]++;
  if (visit398_328_1(!requires || visit399_328_2(requires.length == 0))) {
    _$jscoverage['/loader/data-structure.js'].lineData[329]++;
    return visit400_329_1(requires || []);
  } else {
    _$jscoverage['/loader/data-structure.js'].lineData[330]++;
    if (visit401_330_1((normalizedRequires = self.normalizedRequires) && (visit402_332_1(normalizedRequiresStatus == status)))) {
      _$jscoverage['/loader/data-structure.js'].lineData[333]++;
      return normalizedRequires;
    } else {
      _$jscoverage['/loader/data-structure.js'].lineData[335]++;
      self.normalizedRequiresStatus = status;
      _$jscoverage['/loader/data-structure.js'].lineData[336]++;
      return self.normalizedRequires = Utils.normalizeModNames(self.runtime, requires, self.name);
    }
  }
}});
  _$jscoverage['/loader/data-structure.js'].lineData[342]++;
  Loader.Module = Module;
  _$jscoverage['/loader/data-structure.js'].lineData[344]++;
  function defaultComponentJsName(m) {
    _$jscoverage['/loader/data-structure.js'].functionData[33]++;
    _$jscoverage['/loader/data-structure.js'].lineData[345]++;
    var name = m.name, extname = '.' + m.getType(), min = '-min';
    _$jscoverage['/loader/data-structure.js'].lineData[349]++;
    name = Path.join(Path.dirname(name), Path.basename(name, extname));
    _$jscoverage['/loader/data-structure.js'].lineData[351]++;
    if (visit403_351_1(m.getPackage().isDebug())) {
      _$jscoverage['/loader/data-structure.js'].lineData[352]++;
      min = '';
    }
    _$jscoverage['/loader/data-structure.js'].lineData[355]++;
    return name + min + extname;
  }
  _$jscoverage['/loader/data-structure.js'].lineData[358]++;
  var systemPackage = new Package({
  name: '', 
  runtime: S});
  _$jscoverage['/loader/data-structure.js'].lineData[363]++;
  function getPackage(self, modName) {
    _$jscoverage['/loader/data-structure.js'].functionData[34]++;
    _$jscoverage['/loader/data-structure.js'].lineData[364]++;
    var packages = self.config('packages'), modNameSlash = modName + '/', pName = '', p;
    _$jscoverage['/loader/data-structure.js'].lineData[368]++;
    for (p in packages) {
      _$jscoverage['/loader/data-structure.js'].lineData[369]++;
      if (visit404_369_1(S.startsWith(modNameSlash, p + '/') && visit405_369_2(p.length > pName.length))) {
        _$jscoverage['/loader/data-structure.js'].lineData[370]++;
        pName = p;
      }
    }
    _$jscoverage['/loader/data-structure.js'].lineData[373]++;
    return visit406_373_1(packages[pName] || systemPackage);
  }
})(KISSY);
