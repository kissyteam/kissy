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
if (! _$jscoverage['/kison/lexer.js']) {
  _$jscoverage['/kison/lexer.js'] = {};
  _$jscoverage['/kison/lexer.js'].lineData = [];
  _$jscoverage['/kison/lexer.js'].lineData[5] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[7] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[11] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[27] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[29] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[36] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[40] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[46] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[51] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[67] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[74] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[76] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[77] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[78] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[81] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[82] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[85] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[87] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[89] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[91] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[93] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[94] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[98] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[99] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[101] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[106] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[107] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[108] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[111] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[112] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[114] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[116] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[119] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[121] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[123] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[124] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[125] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[129] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[133] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[136] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[137] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[138] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[139] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[140] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[141] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[143] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[144] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[147] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[151] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[155] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[159] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[163] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[168] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[169] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[172] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[174] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[178] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[180] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[181] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[183] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[187] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[191] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[192] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[193] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[194] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[197] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[198] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[200] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[205] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[207] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[208] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[210] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[214] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[223] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[225] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[226] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[229] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[230] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[231] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[234] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[235] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[236] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[237] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[239] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[247] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[249] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[252] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[254] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[256] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[257] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[258] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[259] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[261] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[263] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[264] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[266] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[267] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[270] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[275] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[276] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[280] = 0;
}
if (! _$jscoverage['/kison/lexer.js'].functionData) {
  _$jscoverage['/kison/lexer.js'].functionData = [];
  _$jscoverage['/kison/lexer.js'].functionData[0] = 0;
  _$jscoverage['/kison/lexer.js'].functionData[1] = 0;
  _$jscoverage['/kison/lexer.js'].functionData[2] = 0;
  _$jscoverage['/kison/lexer.js'].functionData[3] = 0;
  _$jscoverage['/kison/lexer.js'].functionData[4] = 0;
  _$jscoverage['/kison/lexer.js'].functionData[5] = 0;
  _$jscoverage['/kison/lexer.js'].functionData[6] = 0;
  _$jscoverage['/kison/lexer.js'].functionData[7] = 0;
  _$jscoverage['/kison/lexer.js'].functionData[8] = 0;
  _$jscoverage['/kison/lexer.js'].functionData[9] = 0;
  _$jscoverage['/kison/lexer.js'].functionData[10] = 0;
  _$jscoverage['/kison/lexer.js'].functionData[11] = 0;
  _$jscoverage['/kison/lexer.js'].functionData[12] = 0;
  _$jscoverage['/kison/lexer.js'].functionData[13] = 0;
  _$jscoverage['/kison/lexer.js'].functionData[14] = 0;
  _$jscoverage['/kison/lexer.js'].functionData[15] = 0;
}
if (! _$jscoverage['/kison/lexer.js'].branchData) {
  _$jscoverage['/kison/lexer.js'].branchData = {};
  _$jscoverage['/kison/lexer.js'].branchData['76'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['76'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['81'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['81'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['92'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['92'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['93'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['93'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['97'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['97'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['98'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['98'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['104'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['104'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['106'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['106'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['111'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['111'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['121'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['121'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['124'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['124'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['138'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['138'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['139'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['139'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['140'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['140'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['143'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['143'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['169'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['169'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['173'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['173'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['180'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['180'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['183'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['183'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['191'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['191'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['197'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['197'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['207'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['207'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['210'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['210'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['225'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['225'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['229'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['229'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['231'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['231'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['232'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['232'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['233'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['233'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['233'][2] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['234'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['234'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['236'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['236'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['257'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['257'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['258'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['258'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['266'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['266'][1] = new BranchData();
}
_$jscoverage['/kison/lexer.js'].branchData['266'][1].init(1301, 3, 'ret');
function visit122_266_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['266'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['258'][1].init(1014, 16, 'ret == undefined');
function visit121_258_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['258'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['257'][1].init(960, 27, 'action && action.call(self)');
function visit120_257_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['257'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['236'][1].init(76, 5, 'lines');
function visit119_236_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['236'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['234'][1].init(229, 23, 'm = input.match(regexp)');
function visit118_234_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['234'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['233'][2].init(133, 20, 'rule[2] || undefined');
function visit117_233_2(result) {
  _$jscoverage['/kison/lexer.js'].branchData['233'][2].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['233'][1].init(118, 35, 'rule.action || rule[2] || undefined');
function visit116_233_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['233'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['232'][1].init(65, 21, 'rule.token || rule[0]');
function visit115_232_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['232'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['231'][1].init(65, 22, 'rule.regexp || rule[1]');
function visit114_231_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['231'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['229'][1].init(403, 16, 'i < rules.length');
function visit113_229_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['229'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['225'][1].init(289, 6, '!input');
function visit112_225_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['225'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['210'][1].init(166, 47, 'stateMap[s] || (stateMap[s] = (++self.stateId))');
function visit111_210_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['210'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['207'][1].init(91, 9, '!stateMap');
function visit110_207_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['207'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['197'][1].init(418, 16, 'reverseSymbolMap');
function visit109_197_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['197'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['191'][1].init(172, 30, '!reverseSymbolMap && symbolMap');
function visit108_191_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['191'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['183'][1].init(169, 50, 'symbolMap[t] || (symbolMap[t] = (++self.symbolId))');
function visit107_183_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['183'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['180'][1].init(93, 10, '!symbolMap');
function visit106_180_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['180'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['173'][1].init(54, 33, 'next.length > DEBUG_CONTEXT_LIMIT');
function visit105_173_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['173'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['169'][1].init(316, 36, 'matched.length > DEBUG_CONTEXT_LIMIT');
function visit104_169_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['169'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['143'][1].init(235, 30, 'S.inArray(currentState, state)');
function visit103_143_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['143'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['140'][1].init(26, 36, 'currentState == Lexer.STATIC.INITIAL');
function visit102_140_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['140'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['139'][1].init(68, 6, '!state');
function visit101_139_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['139'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['138'][1].init(30, 15, 'r.state || r[3]');
function visit100_138_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['138'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['124'][1].init(116, 13, 'compressState');
function visit99_124_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['124'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['121'][1].init(1984, 31, 'compressState || compressSymbol');
function visit98_121_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['121'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['111'][1].init(749, 5, 'state');
function visit97_111_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['111'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['106'][1].init(511, 22, 'compressState && state');
function visit96_106_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['106'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['104'][1].init(105, 11, 'action || 0');
function visit95_104_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['104'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['98'][1].init(209, 5, 'token');
function visit94_98_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['98'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['97'][1].init(139, 12, 'v.token || 0');
function visit93_97_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['97'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['93'][1].init(26, 13, 'v && v.regexp');
function visit92_93_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['93'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['92'][1].init(54, 31, 'compressState || compressSymbol');
function visit91_92_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['92'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['81'][1].init(446, 13, 'compressState');
function visit90_81_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['81'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['76'][1].init(307, 14, 'compressSymbol');
function visit89_76_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['76'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].lineData[5]++;
KISSY.add("kison/lexer", function(S, Utils) {
  _$jscoverage['/kison/lexer.js'].functionData[0]++;
  _$jscoverage['/kison/lexer.js'].lineData[7]++;
  var serializeObject = Utils.serializeObject, Lexer = function(cfg) {
  _$jscoverage['/kison/lexer.js'].functionData[1]++;
  _$jscoverage['/kison/lexer.js'].lineData[11]++;
  var self = this;
  _$jscoverage['/kison/lexer.js'].lineData[27]++;
  self.rules = [];
  _$jscoverage['/kison/lexer.js'].lineData[29]++;
  S.mix(self, cfg);
  _$jscoverage['/kison/lexer.js'].lineData[36]++;
  self.resetInput(self.input);
};
  _$jscoverage['/kison/lexer.js'].lineData[40]++;
  Lexer.STATIC = {
  INITIAL: 'I', 
  DEBUG_CONTEXT_LIMIT: 20, 
  END_TAG: '$EOF'};
  _$jscoverage['/kison/lexer.js'].lineData[46]++;
  Lexer.prototype = {
  constructor: Lexer, 
  resetInput: function(input) {
  _$jscoverage['/kison/lexer.js'].functionData[2]++;
  _$jscoverage['/kison/lexer.js'].lineData[51]++;
  S.mix(this, {
  input: input, 
  matched: "", 
  stateStack: [Lexer.STATIC.INITIAL], 
  match: "", 
  text: "", 
  firstLine: 1, 
  lineNumber: 1, 
  lastLine: 1, 
  firstColumn: 1, 
  lastColumn: 1});
}, 
  genCode: function(cfg) {
  _$jscoverage['/kison/lexer.js'].functionData[3]++;
  _$jscoverage['/kison/lexer.js'].lineData[67]++;
  var STATIC = Lexer.STATIC, self = this, compressSymbol = cfg.compressSymbol, compressState = cfg.compressLexerState, code = [], stateMap;
  _$jscoverage['/kison/lexer.js'].lineData[74]++;
  self.symbolId = self.stateId = 0;
  _$jscoverage['/kison/lexer.js'].lineData[76]++;
  if (visit89_76_1(compressSymbol)) {
    _$jscoverage['/kison/lexer.js'].lineData[77]++;
    self.symbolMap = {};
    _$jscoverage['/kison/lexer.js'].lineData[78]++;
    self.mapSymbol(STATIC.END_TAG);
  }
  _$jscoverage['/kison/lexer.js'].lineData[81]++;
  if (visit90_81_1(compressState)) {
    _$jscoverage['/kison/lexer.js'].lineData[82]++;
    stateMap = self.stateMap = {};
  }
  _$jscoverage['/kison/lexer.js'].lineData[85]++;
  code.push("var Lexer = " + Lexer.toString() + ';');
  _$jscoverage['/kison/lexer.js'].lineData[87]++;
  code.push("Lexer.prototype= " + serializeObject(Lexer.prototype, /genCode/) + ";");
  _$jscoverage['/kison/lexer.js'].lineData[89]++;
  code.push("Lexer.STATIC= " + serializeObject(STATIC) + ";");
  _$jscoverage['/kison/lexer.js'].lineData[91]++;
  var newCfg = serializeObject({
  rules: self.rules}, (visit91_92_1(compressState || compressSymbol)) ? function(v) {
  _$jscoverage['/kison/lexer.js'].functionData[4]++;
  _$jscoverage['/kison/lexer.js'].lineData[93]++;
  if (visit92_93_1(v && v.regexp)) {
    _$jscoverage['/kison/lexer.js'].lineData[94]++;
    var state = v.state, ret, action = v.action, token = visit93_97_1(v.token || 0);
    _$jscoverage['/kison/lexer.js'].lineData[98]++;
    if (visit94_98_1(token)) {
      _$jscoverage['/kison/lexer.js'].lineData[99]++;
      token = self.mapSymbol(token);
    }
    _$jscoverage['/kison/lexer.js'].lineData[101]++;
    ret = [token, v.regexp, visit95_104_1(action || 0)];
    _$jscoverage['/kison/lexer.js'].lineData[106]++;
    if (visit96_106_1(compressState && state)) {
      _$jscoverage['/kison/lexer.js'].lineData[107]++;
      state = S.map(state, function(s) {
  _$jscoverage['/kison/lexer.js'].functionData[5]++;
  _$jscoverage['/kison/lexer.js'].lineData[108]++;
  return self.mapState(s);
});
    }
    _$jscoverage['/kison/lexer.js'].lineData[111]++;
    if (visit97_111_1(state)) {
      _$jscoverage['/kison/lexer.js'].lineData[112]++;
      ret.push(state);
    }
    _$jscoverage['/kison/lexer.js'].lineData[114]++;
    return ret;
  }
  _$jscoverage['/kison/lexer.js'].lineData[116]++;
  return undefined;
} : 0);
  _$jscoverage['/kison/lexer.js'].lineData[119]++;
  code.push("var lexer = new Lexer(" + newCfg + ");");
  _$jscoverage['/kison/lexer.js'].lineData[121]++;
  if (visit98_121_1(compressState || compressSymbol)) {
    _$jscoverage['/kison/lexer.js'].lineData[123]++;
    self.rules = eval('(' + newCfg + ')').rules;
    _$jscoverage['/kison/lexer.js'].lineData[124]++;
    if (visit99_124_1(compressState)) {
      _$jscoverage['/kison/lexer.js'].lineData[125]++;
      code.push('lexer.stateMap = ' + serializeObject(stateMap) + ';');
    }
  }
  _$jscoverage['/kison/lexer.js'].lineData[129]++;
  return code.join("\n");
}, 
  getCurrentRules: function() {
  _$jscoverage['/kison/lexer.js'].functionData[6]++;
  _$jscoverage['/kison/lexer.js'].lineData[133]++;
  var self = this, currentState = self.stateStack[self.stateStack.length - 1], rules = [];
  _$jscoverage['/kison/lexer.js'].lineData[136]++;
  currentState = self.mapState(currentState);
  _$jscoverage['/kison/lexer.js'].lineData[137]++;
  S.each(self.rules, function(r) {
  _$jscoverage['/kison/lexer.js'].functionData[7]++;
  _$jscoverage['/kison/lexer.js'].lineData[138]++;
  var state = visit100_138_1(r.state || r[3]);
  _$jscoverage['/kison/lexer.js'].lineData[139]++;
  if (visit101_139_1(!state)) {
    _$jscoverage['/kison/lexer.js'].lineData[140]++;
    if (visit102_140_1(currentState == Lexer.STATIC.INITIAL)) {
      _$jscoverage['/kison/lexer.js'].lineData[141]++;
      rules.push(r);
    }
  } else {
    _$jscoverage['/kison/lexer.js'].lineData[143]++;
    if (visit103_143_1(S.inArray(currentState, state))) {
      _$jscoverage['/kison/lexer.js'].lineData[144]++;
      rules.push(r);
    }
  }
});
  _$jscoverage['/kison/lexer.js'].lineData[147]++;
  return rules;
}, 
  pushState: function(state) {
  _$jscoverage['/kison/lexer.js'].functionData[8]++;
  _$jscoverage['/kison/lexer.js'].lineData[151]++;
  this.stateStack.push(state);
}, 
  popState: function() {
  _$jscoverage['/kison/lexer.js'].functionData[9]++;
  _$jscoverage['/kison/lexer.js'].lineData[155]++;
  return this.stateStack.pop();
}, 
  getStateStack: function() {
  _$jscoverage['/kison/lexer.js'].functionData[10]++;
  _$jscoverage['/kison/lexer.js'].lineData[159]++;
  return this.stateStack;
}, 
  showDebugInfo: function() {
  _$jscoverage['/kison/lexer.js'].functionData[11]++;
  _$jscoverage['/kison/lexer.js'].lineData[163]++;
  var self = this, DEBUG_CONTEXT_LIMIT = Lexer.STATIC.DEBUG_CONTEXT_LIMIT, matched = self.matched, match = self.match, input = self.input;
  _$jscoverage['/kison/lexer.js'].lineData[168]++;
  matched = matched.slice(0, matched.length - match.length);
  _$jscoverage['/kison/lexer.js'].lineData[169]++;
  var past = (visit104_169_1(matched.length > DEBUG_CONTEXT_LIMIT) ? "..." : "") + matched.slice(-DEBUG_CONTEXT_LIMIT).replace(/\n/, " "), next = match + input;
  _$jscoverage['/kison/lexer.js'].lineData[172]++;
  next = next.slice(0, DEBUG_CONTEXT_LIMIT) + (visit105_173_1(next.length > DEBUG_CONTEXT_LIMIT) ? "..." : "");
  _$jscoverage['/kison/lexer.js'].lineData[174]++;
  return past + next + "\n" + new Array(past.length + 1).join("-") + "^";
}, 
  mapSymbol: function(t) {
  _$jscoverage['/kison/lexer.js'].functionData[12]++;
  _$jscoverage['/kison/lexer.js'].lineData[178]++;
  var self = this, symbolMap = self.symbolMap;
  _$jscoverage['/kison/lexer.js'].lineData[180]++;
  if (visit106_180_1(!symbolMap)) {
    _$jscoverage['/kison/lexer.js'].lineData[181]++;
    return t;
  }
  _$jscoverage['/kison/lexer.js'].lineData[183]++;
  return visit107_183_1(symbolMap[t] || (symbolMap[t] = (++self.symbolId)));
}, 
  mapReverseSymbol: function(rs) {
  _$jscoverage['/kison/lexer.js'].functionData[13]++;
  _$jscoverage['/kison/lexer.js'].lineData[187]++;
  var self = this, symbolMap = self.symbolMap, i, reverseSymbolMap = self.reverseSymbolMap;
  _$jscoverage['/kison/lexer.js'].lineData[191]++;
  if (visit108_191_1(!reverseSymbolMap && symbolMap)) {
    _$jscoverage['/kison/lexer.js'].lineData[192]++;
    reverseSymbolMap = self.reverseSymbolMap = {};
    _$jscoverage['/kison/lexer.js'].lineData[193]++;
    for (i in symbolMap) {
      _$jscoverage['/kison/lexer.js'].lineData[194]++;
      reverseSymbolMap[symbolMap[i]] = i;
    }
  }
  _$jscoverage['/kison/lexer.js'].lineData[197]++;
  if (visit109_197_1(reverseSymbolMap)) {
    _$jscoverage['/kison/lexer.js'].lineData[198]++;
    return reverseSymbolMap[rs];
  } else {
    _$jscoverage['/kison/lexer.js'].lineData[200]++;
    return rs;
  }
}, 
  mapState: function(s) {
  _$jscoverage['/kison/lexer.js'].functionData[14]++;
  _$jscoverage['/kison/lexer.js'].lineData[205]++;
  var self = this, stateMap = self.stateMap;
  _$jscoverage['/kison/lexer.js'].lineData[207]++;
  if (visit110_207_1(!stateMap)) {
    _$jscoverage['/kison/lexer.js'].lineData[208]++;
    return s;
  }
  _$jscoverage['/kison/lexer.js'].lineData[210]++;
  return visit111_210_1(stateMap[s] || (stateMap[s] = (++self.stateId)));
}, 
  lex: function() {
  _$jscoverage['/kison/lexer.js'].functionData[15]++;
  _$jscoverage['/kison/lexer.js'].lineData[214]++;
  var self = this, input = self.input, i, rule, m, ret, lines, rules = self.getCurrentRules();
  _$jscoverage['/kison/lexer.js'].lineData[223]++;
  self.match = self.text = "";
  _$jscoverage['/kison/lexer.js'].lineData[225]++;
  if (visit112_225_1(!input)) {
    _$jscoverage['/kison/lexer.js'].lineData[226]++;
    return self.mapSymbol(Lexer.STATIC.END_TAG);
  }
  _$jscoverage['/kison/lexer.js'].lineData[229]++;
  for (i = 0; visit113_229_1(i < rules.length); i++) {
    _$jscoverage['/kison/lexer.js'].lineData[230]++;
    rule = rules[i];
    _$jscoverage['/kison/lexer.js'].lineData[231]++;
    var regexp = visit114_231_1(rule.regexp || rule[1]), token = visit115_232_1(rule.token || rule[0]), action = visit116_233_1(rule.action || visit117_233_2(rule[2] || undefined));
    _$jscoverage['/kison/lexer.js'].lineData[234]++;
    if (visit118_234_1(m = input.match(regexp))) {
      _$jscoverage['/kison/lexer.js'].lineData[235]++;
      lines = m[0].match(/\n.*/g);
      _$jscoverage['/kison/lexer.js'].lineData[236]++;
      if (visit119_236_1(lines)) {
        _$jscoverage['/kison/lexer.js'].lineData[237]++;
        self.lineNumber += lines.length;
      }
      _$jscoverage['/kison/lexer.js'].lineData[239]++;
      S.mix(self, {
  firstLine: self.lastLine, 
  lastLine: self.lineNumber + 1, 
  firstColumn: self.lastColumn, 
  lastColumn: lines ? lines[lines.length - 1].length - 1 : self.lastColumn + m[0].length});
      _$jscoverage['/kison/lexer.js'].lineData[247]++;
      var match;
      _$jscoverage['/kison/lexer.js'].lineData[249]++;
      match = self.match = m[0];
      _$jscoverage['/kison/lexer.js'].lineData[252]++;
      self.matches = m;
      _$jscoverage['/kison/lexer.js'].lineData[254]++;
      self.text = match;
      _$jscoverage['/kison/lexer.js'].lineData[256]++;
      self.matched += match;
      _$jscoverage['/kison/lexer.js'].lineData[257]++;
      ret = visit120_257_1(action && action.call(self));
      _$jscoverage['/kison/lexer.js'].lineData[258]++;
      if (visit121_258_1(ret == undefined)) {
        _$jscoverage['/kison/lexer.js'].lineData[259]++;
        ret = token;
      } else {
        _$jscoverage['/kison/lexer.js'].lineData[261]++;
        ret = self.mapSymbol(ret);
      }
      _$jscoverage['/kison/lexer.js'].lineData[263]++;
      input = input.slice(match.length);
      _$jscoverage['/kison/lexer.js'].lineData[264]++;
      self.input = input;
      _$jscoverage['/kison/lexer.js'].lineData[266]++;
      if (visit122_266_1(ret)) {
        _$jscoverage['/kison/lexer.js'].lineData[267]++;
        return ret;
      } else {
        _$jscoverage['/kison/lexer.js'].lineData[270]++;
        return self.lex();
      }
    }
  }
  _$jscoverage['/kison/lexer.js'].lineData[275]++;
  S.error("lex error at line " + self.lineNumber + ":\n" + self.showDebugInfo());
  _$jscoverage['/kison/lexer.js'].lineData[276]++;
  return undefined;
}};
  _$jscoverage['/kison/lexer.js'].lineData[280]++;
  return Lexer;
}, {
  requires: ['./utils']});
