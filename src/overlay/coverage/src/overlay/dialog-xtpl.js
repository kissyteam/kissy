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
if (! _$jscoverage['/overlay/dialog-xtpl.js']) {
  _$jscoverage['/overlay/dialog-xtpl.js'] = {};
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData = [];
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[3] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[4] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[5] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[9] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[12] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[13] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[14] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[15] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[16] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[17] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[18] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[19] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[20] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[21] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[22] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[23] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[24] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[25] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[26] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[27] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[28] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[29] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[30] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[31] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[32] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[33] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[34] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[36] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[37] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[38] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[39] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[40] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[41] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[42] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[43] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[44] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[45] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[46] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[47] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[48] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[49] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[50] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[51] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[52] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[53] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[54] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[55] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[56] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[57] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[58] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[59] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[60] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[61] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[62] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[63] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[64] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[65] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[67] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[68] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[69] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[70] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[71] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[72] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[73] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[74] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[75] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[76] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[77] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[78] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[79] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[80] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[81] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[82] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[83] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[84] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[85] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[86] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[87] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[88] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[89] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[90] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[91] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[92] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[93] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[94] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[95] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[96] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[98] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[99] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[100] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[101] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[102] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[103] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[104] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[105] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[106] = 0;
}
if (! _$jscoverage['/overlay/dialog-xtpl.js'].functionData) {
  _$jscoverage['/overlay/dialog-xtpl.js'].functionData = [];
  _$jscoverage['/overlay/dialog-xtpl.js'].functionData[0] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].functionData[1] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].functionData[2] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].functionData[3] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].functionData[4] = 0;
}
if (! _$jscoverage['/overlay/dialog-xtpl.js'].branchData) {
  _$jscoverage['/overlay/dialog-xtpl.js'].branchData = {};
}
_$jscoverage['/overlay/dialog-xtpl.js'].lineData[3]++;
KISSY.add('overlay/dialog-xtpl', function() {
  _$jscoverage['/overlay/dialog-xtpl.js'].functionData[0]++;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[4]++;
  return function(scopes, S, undefined) {
  _$jscoverage['/overlay/dialog-xtpl.js'].functionData[1]++;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[5]++;
  var buffer = "", config = this.config, engine = this, utils = config.utils;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[9]++;
  var runBlockCommandUtil = utils["runBlockCommand"], getExpressionUtil = utils["getExpression"], getPropertyOrRunCommandUtil = utils["getPropertyOrRunCommand"];
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[12]++;
  buffer += '<div class="';
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[13]++;
  var config1 = {};
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[14]++;
  var params2 = [];
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[15]++;
  params2.push('header');
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[16]++;
  config1.params = params2;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[17]++;
  var id0 = getPropertyOrRunCommandUtil(engine, scopes, config1, "getBaseCssClasses", 0, 1, true, undefined);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[18]++;
  buffer += id0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[19]++;
  buffer += '"\r\n     style="\r\n';
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[20]++;
  var config3 = {};
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[21]++;
  var params4 = [];
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[22]++;
  var id5 = getPropertyOrRunCommandUtil(engine, scopes, {}, "headerStyle", 0, 3, undefined, true);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[23]++;
  params4.push(id5);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[24]++;
  config3.params = params4;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[25]++;
  config3.fn = function(scopes) {
  _$jscoverage['/overlay/dialog-xtpl.js'].functionData[2]++;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[26]++;
  var buffer = "";
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[27]++;
  buffer += ' \r\n ';
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[28]++;
  var id6 = getPropertyOrRunCommandUtil(engine, scopes, {}, "xindex", 0, 4, undefined, false);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[29]++;
  buffer += getExpressionUtil(id6, true);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[30]++;
  buffer += ':';
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[31]++;
  var id7 = getPropertyOrRunCommandUtil(engine, scopes, {}, ".", 0, 4, undefined, false);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[32]++;
  buffer += getExpressionUtil(id7, true);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[33]++;
  buffer += ';\r\n';
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[34]++;
  return buffer;
};
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[36]++;
  buffer += runBlockCommandUtil(engine, scopes, config3, "each", 3);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[37]++;
  buffer += '\r\n"\r\n     id="ks-stdmod-header-';
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[38]++;
  var id8 = getPropertyOrRunCommandUtil(engine, scopes, {}, "id", 0, 7, undefined, false);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[39]++;
  buffer += getExpressionUtil(id8, true);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[40]++;
  buffer += '">';
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[41]++;
  var id9 = getPropertyOrRunCommandUtil(engine, scopes, {}, "headerContent", 0, 7, undefined, false);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[42]++;
  buffer += getExpressionUtil(id9, false);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[43]++;
  buffer += '</div>\r\n\r\n<div class="';
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[44]++;
  var config11 = {};
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[45]++;
  var params12 = [];
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[46]++;
  params12.push('body');
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[47]++;
  config11.params = params12;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[48]++;
  var id10 = getPropertyOrRunCommandUtil(engine, scopes, config11, "getBaseCssClasses", 0, 9, true, undefined);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[49]++;
  buffer += id10;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[50]++;
  buffer += '"\r\n     style="\r\n';
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[51]++;
  var config13 = {};
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[52]++;
  var params14 = [];
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[53]++;
  var id15 = getPropertyOrRunCommandUtil(engine, scopes, {}, "bodyStyle", 0, 11, undefined, true);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[54]++;
  params14.push(id15);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[55]++;
  config13.params = params14;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[56]++;
  config13.fn = function(scopes) {
  _$jscoverage['/overlay/dialog-xtpl.js'].functionData[3]++;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[57]++;
  var buffer = "";
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[58]++;
  buffer += ' \r\n ';
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[59]++;
  var id16 = getPropertyOrRunCommandUtil(engine, scopes, {}, "xindex", 0, 12, undefined, false);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[60]++;
  buffer += getExpressionUtil(id16, true);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[61]++;
  buffer += ':';
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[62]++;
  var id17 = getPropertyOrRunCommandUtil(engine, scopes, {}, ".", 0, 12, undefined, false);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[63]++;
  buffer += getExpressionUtil(id17, true);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[64]++;
  buffer += ';\r\n';
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[65]++;
  return buffer;
};
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[67]++;
  buffer += runBlockCommandUtil(engine, scopes, config13, "each", 11);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[68]++;
  buffer += '\r\n"\r\n     id="ks-stdmod-body-';
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[69]++;
  var id18 = getPropertyOrRunCommandUtil(engine, scopes, {}, "id", 0, 15, undefined, false);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[70]++;
  buffer += getExpressionUtil(id18, true);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[71]++;
  buffer += '">';
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[72]++;
  var id19 = getPropertyOrRunCommandUtil(engine, scopes, {}, "bodyContent", 0, 15, undefined, false);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[73]++;
  buffer += getExpressionUtil(id19, false);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[74]++;
  buffer += '</div>\r\n\r\n<div class="';
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[75]++;
  var config21 = {};
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[76]++;
  var params22 = [];
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[77]++;
  params22.push('footer');
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[78]++;
  config21.params = params22;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[79]++;
  var id20 = getPropertyOrRunCommandUtil(engine, scopes, config21, "getBaseCssClasses", 0, 17, true, undefined);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[80]++;
  buffer += id20;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[81]++;
  buffer += '"\r\n     style="\r\n';
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[82]++;
  var config23 = {};
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[83]++;
  var params24 = [];
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[84]++;
  var id25 = getPropertyOrRunCommandUtil(engine, scopes, {}, "footerStyle", 0, 19, undefined, true);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[85]++;
  params24.push(id25);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[86]++;
  config23.params = params24;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[87]++;
  config23.fn = function(scopes) {
  _$jscoverage['/overlay/dialog-xtpl.js'].functionData[4]++;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[88]++;
  var buffer = "";
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[89]++;
  buffer += ' \r\n ';
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[90]++;
  var id26 = getPropertyOrRunCommandUtil(engine, scopes, {}, "xindex", 0, 20, undefined, false);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[91]++;
  buffer += getExpressionUtil(id26, true);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[92]++;
  buffer += ':';
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[93]++;
  var id27 = getPropertyOrRunCommandUtil(engine, scopes, {}, ".", 0, 20, undefined, false);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[94]++;
  buffer += getExpressionUtil(id27, true);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[95]++;
  buffer += ';\r\n';
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[96]++;
  return buffer;
};
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[98]++;
  buffer += runBlockCommandUtil(engine, scopes, config23, "each", 19);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[99]++;
  buffer += '\r\n"\r\n     id="ks-stdmod-footer-';
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[100]++;
  var id28 = getPropertyOrRunCommandUtil(engine, scopes, {}, "id", 0, 23, undefined, false);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[101]++;
  buffer += getExpressionUtil(id28, true);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[102]++;
  buffer += '">';
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[103]++;
  var id29 = getPropertyOrRunCommandUtil(engine, scopes, {}, "footerContent", 0, 23, undefined, false);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[104]++;
  buffer += getExpressionUtil(id29, false);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[105]++;
  buffer += '</div>';
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[106]++;
  return buffer;
};
});
