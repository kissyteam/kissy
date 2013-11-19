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
if (! _$jscoverage['/combobox/combobox-xtpl.js']) {
  _$jscoverage['/combobox/combobox-xtpl.js'] = {};
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData = [];
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[2] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[3] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[4] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[8] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[11] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[12] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[13] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[14] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[15] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[16] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[17] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[18] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[19] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[20] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[21] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[22] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[23] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[24] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[25] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[26] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[27] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[28] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[29] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[30] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[31] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[32] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[33] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[34] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[35] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[36] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[37] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[38] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[39] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[40] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[41] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[42] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[43] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[44] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[45] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[46] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[47] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[48] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[49] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[50] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[51] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[52] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[53] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[54] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[56] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[57] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[58] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[59] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[60] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[61] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[62] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[63] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[64] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[65] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[66] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[67] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[68] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[69] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[70] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[71] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[72] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[73] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[74] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[75] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[76] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[78] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[79] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[80] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[81] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[82] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[83] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[84] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[85] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[86] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[87] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[88] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[89] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[90] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[91] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[92] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[93] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[94] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[95] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[96] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[97] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[98] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[99] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[100] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[101] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[102] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[103] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[104] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[106] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[107] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[108] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[109] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[111] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[112] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[113] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[114] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[115] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[116] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[117] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[118] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[119] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[120] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[121] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[122] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[123] = 0;
}
if (! _$jscoverage['/combobox/combobox-xtpl.js'].functionData) {
  _$jscoverage['/combobox/combobox-xtpl.js'].functionData = [];
  _$jscoverage['/combobox/combobox-xtpl.js'].functionData[0] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].functionData[1] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].functionData[2] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].functionData[3] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].functionData[4] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].functionData[5] = 0;
}
if (! _$jscoverage['/combobox/combobox-xtpl.js'].branchData) {
  _$jscoverage['/combobox/combobox-xtpl.js'].branchData = {};
}
_$jscoverage['/combobox/combobox-xtpl.js'].lineData[2]++;
KISSY.add(function() {
  _$jscoverage['/combobox/combobox-xtpl.js'].functionData[0]++;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[3]++;
  return function(scopes, S, undefined) {
  _$jscoverage['/combobox/combobox-xtpl.js'].functionData[1]++;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[4]++;
  var buffer = "", config = this.config, engine = this, utils = config.utils;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[8]++;
  var runBlockCommandUtil = utils["runBlockCommand"], getExpressionUtil = utils["getExpression"], getPropertyOrRunCommandUtil = utils["getPropertyOrRunCommand"];
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[11]++;
  buffer += '<div id="ks-combobox-invalid-el-';
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[12]++;
  var id0 = getPropertyOrRunCommandUtil(engine, scopes, {}, "id", 0, 1, undefined, false);
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[13]++;
  buffer += getExpressionUtil(id0, true);
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[14]++;
  buffer += '"\n     class="';
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[15]++;
  var config2 = {};
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[16]++;
  var params3 = [];
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[17]++;
  params3.push('invalid-el');
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[18]++;
  config2.params = params3;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[19]++;
  var id1 = getPropertyOrRunCommandUtil(engine, scopes, config2, "getBaseCssClasses", 0, 2, true, undefined);
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[20]++;
  buffer += id1;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[21]++;
  buffer += '">\n    <div class="';
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[22]++;
  var config5 = {};
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[23]++;
  var params6 = [];
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[24]++;
  params6.push('invalid-inner');
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[25]++;
  config5.params = params6;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[26]++;
  var id4 = getPropertyOrRunCommandUtil(engine, scopes, config5, "getBaseCssClasses", 0, 3, true, undefined);
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[27]++;
  buffer += id4;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[28]++;
  buffer += '"></div>\n</div>\n\n';
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[29]++;
  var config7 = {};
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[30]++;
  var params8 = [];
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[31]++;
  var id9 = getPropertyOrRunCommandUtil(engine, scopes, {}, "hasTrigger", 0, 6, undefined, true);
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[32]++;
  params8.push(id9);
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[33]++;
  config7.params = params8;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[34]++;
  config7.fn = function(scopes) {
  _$jscoverage['/combobox/combobox-xtpl.js'].functionData[2]++;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[35]++;
  var buffer = "";
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[36]++;
  buffer += '\n<div id="ks-combobox-trigger-';
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[37]++;
  var id10 = getPropertyOrRunCommandUtil(engine, scopes, {}, "id", 0, 7, undefined, false);
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[38]++;
  buffer += getExpressionUtil(id10, true);
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[39]++;
  buffer += '"\n     class="';
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[40]++;
  var config12 = {};
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[41]++;
  var params13 = [];
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[42]++;
  params13.push('trigger');
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[43]++;
  config12.params = params13;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[44]++;
  var id11 = getPropertyOrRunCommandUtil(engine, scopes, config12, "getBaseCssClasses", 0, 8, true, undefined);
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[45]++;
  buffer += id11;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[46]++;
  buffer += '">\n    <div class="';
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[47]++;
  var config15 = {};
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[48]++;
  var params16 = [];
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[49]++;
  params16.push('trigger-inner');
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[50]++;
  config15.params = params16;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[51]++;
  var id14 = getPropertyOrRunCommandUtil(engine, scopes, config15, "getBaseCssClasses", 0, 9, true, undefined);
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[52]++;
  buffer += id14;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[53]++;
  buffer += '">&#x25BC;</div>\n</div>\n';
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[54]++;
  return buffer;
};
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[56]++;
  buffer += runBlockCommandUtil(engine, scopes, config7, "if", 6);
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[57]++;
  buffer += '\n\n<div class="';
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[58]++;
  var config18 = {};
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[59]++;
  var params19 = [];
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[60]++;
  params19.push('input-wrap');
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[61]++;
  config18.params = params19;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[62]++;
  var id17 = getPropertyOrRunCommandUtil(engine, scopes, config18, "getBaseCssClasses", 0, 13, true, undefined);
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[63]++;
  buffer += id17;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[64]++;
  buffer += '">\n\n    <input id="ks-combobox-input-';
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[65]++;
  var id20 = getPropertyOrRunCommandUtil(engine, scopes, {}, "id", 0, 15, undefined, false);
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[66]++;
  buffer += getExpressionUtil(id20, true);
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[67]++;
  buffer += '"\n           aria-haspopup="true"\n           aria-autocomplete="list"\n           aria-haspopup="true"\n           role="autocomplete"\n           aria-expanded="false"\n\n    ';
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[68]++;
  var config21 = {};
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[69]++;
  var params22 = [];
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[70]++;
  var id23 = getPropertyOrRunCommandUtil(engine, scopes, {}, "disabled", 0, 22, undefined, true);
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[71]++;
  params22.push(id23);
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[72]++;
  config21.params = params22;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[73]++;
  config21.fn = function(scopes) {
  _$jscoverage['/combobox/combobox-xtpl.js'].functionData[3]++;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[74]++;
  var buffer = "";
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[75]++;
  buffer += '\n    disabled\n    ';
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[76]++;
  return buffer;
};
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[78]++;
  buffer += runBlockCommandUtil(engine, scopes, config21, "if", 22);
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[79]++;
  buffer += '\n\n    autocomplete="off"\n    class="';
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[80]++;
  var config25 = {};
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[81]++;
  var params26 = [];
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[82]++;
  params26.push('input');
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[83]++;
  config25.params = params26;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[84]++;
  var id24 = getPropertyOrRunCommandUtil(engine, scopes, config25, "getBaseCssClasses", 0, 27, true, undefined);
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[85]++;
  buffer += id24;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[86]++;
  buffer += '"\n\n    value="';
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[87]++;
  var id27 = getPropertyOrRunCommandUtil(engine, scopes, {}, "value", 0, 29, undefined, false);
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[88]++;
  buffer += getExpressionUtil(id27, true);
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[89]++;
  buffer += '"\n    />\n\n\n    <label id="ks-combobox-placeholder-';
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[90]++;
  var id28 = getPropertyOrRunCommandUtil(engine, scopes, {}, "id", 0, 33, undefined, false);
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[91]++;
  buffer += getExpressionUtil(id28, true);
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[92]++;
  buffer += '"\n           for="ks-combobox-input-';
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[93]++;
  var id29 = getPropertyOrRunCommandUtil(engine, scopes, {}, "id", 0, 34, undefined, false);
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[94]++;
  buffer += getExpressionUtil(id29, true);
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[95]++;
  buffer += '"\n            style=\'display:';
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[96]++;
  var config30 = {};
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[97]++;
  var params31 = [];
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[98]++;
  var id32 = getPropertyOrRunCommandUtil(engine, scopes, {}, "value", 0, 35, undefined, true);
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[99]++;
  params31.push(id32);
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[100]++;
  config30.params = params31;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[101]++;
  config30.fn = function(scopes) {
  _$jscoverage['/combobox/combobox-xtpl.js'].functionData[4]++;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[102]++;
  var buffer = "";
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[103]++;
  buffer += 'none';
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[104]++;
  return buffer;
};
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[106]++;
  config30.inverse = function(scopes) {
  _$jscoverage['/combobox/combobox-xtpl.js'].functionData[5]++;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[107]++;
  var buffer = "";
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[108]++;
  buffer += 'block';
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[109]++;
  return buffer;
};
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[111]++;
  buffer += runBlockCommandUtil(engine, scopes, config30, "if", 35);
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[112]++;
  buffer += ';\'\n    class="';
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[113]++;
  var config34 = {};
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[114]++;
  var params35 = [];
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[115]++;
  params35.push('placeholder');
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[116]++;
  config34.params = params35;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[117]++;
  var id33 = getPropertyOrRunCommandUtil(engine, scopes, config34, "getBaseCssClasses", 0, 36, true, undefined);
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[118]++;
  buffer += id33;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[119]++;
  buffer += '">\n    ';
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[120]++;
  var id36 = getPropertyOrRunCommandUtil(engine, scopes, {}, "placeholder", 0, 37, undefined, false);
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[121]++;
  buffer += getExpressionUtil(id36, true);
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[122]++;
  buffer += '\n    </label>\n</div>\n';
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[123]++;
  return buffer;
};
});
