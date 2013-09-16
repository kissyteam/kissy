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
if (! _$jscoverage['/tree/node-xtpl.js']) {
  _$jscoverage['/tree/node-xtpl.js'] = {};
  _$jscoverage['/tree/node-xtpl.js'].lineData = [];
  _$jscoverage['/tree/node-xtpl.js'].lineData[3] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[4] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[5] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[9] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[12] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[13] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[14] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[15] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[16] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[17] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[18] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[19] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[20] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[21] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[22] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[23] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[24] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[25] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[26] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[27] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[28] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[29] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[30] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[31] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[32] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[33] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[34] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[35] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[36] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[37] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[38] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[40] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[41] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[42] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[43] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[44] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[45] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[46] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[47] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[48] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[49] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[50] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[51] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[52] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[53] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[54] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[55] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[56] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[57] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[58] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[59] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[60] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[61] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[62] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[63] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[64] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[65] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[66] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[67] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[68] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[69] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[70] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[71] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[73] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[74] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[75] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[76] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[77] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[78] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[79] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[80] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[81] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[82] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[83] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[84] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[85] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[86] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[87] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[88] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[89] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[90] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[91] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[92] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[93] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[94] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[95] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[96] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[97] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[98] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[99] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[100] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[101] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[102] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[103] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[104] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[105] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[106] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[107] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[108] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[109] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[110] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[112] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[113] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[114] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[115] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[116] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[117] = 0;
}
if (! _$jscoverage['/tree/node-xtpl.js'].functionData) {
  _$jscoverage['/tree/node-xtpl.js'].functionData = [];
  _$jscoverage['/tree/node-xtpl.js'].functionData[0] = 0;
  _$jscoverage['/tree/node-xtpl.js'].functionData[1] = 0;
  _$jscoverage['/tree/node-xtpl.js'].functionData[2] = 0;
  _$jscoverage['/tree/node-xtpl.js'].functionData[3] = 0;
  _$jscoverage['/tree/node-xtpl.js'].functionData[4] = 0;
}
if (! _$jscoverage['/tree/node-xtpl.js'].branchData) {
  _$jscoverage['/tree/node-xtpl.js'].branchData = {};
}
_$jscoverage['/tree/node-xtpl.js'].lineData[3]++;
KISSY.add('tree/node-xtpl', function() {
  _$jscoverage['/tree/node-xtpl.js'].functionData[0]++;
  _$jscoverage['/tree/node-xtpl.js'].lineData[4]++;
  return function(scopes, S, undefined) {
  _$jscoverage['/tree/node-xtpl.js'].functionData[1]++;
  _$jscoverage['/tree/node-xtpl.js'].lineData[5]++;
  var buffer = "", config = this.config, engine = this, utils = config.utils;
  _$jscoverage['/tree/node-xtpl.js'].lineData[9]++;
  var runBlockCommandUtil = utils["runBlockCommand"], getExpressionUtil = utils["getExpression"], getPropertyOrRunCommandUtil = utils["getPropertyOrRunCommand"];
  _$jscoverage['/tree/node-xtpl.js'].lineData[12]++;
  buffer += '<div id="ks-tree-node-row-';
  _$jscoverage['/tree/node-xtpl.js'].lineData[13]++;
  var id0 = getPropertyOrRunCommandUtil(engine, scopes, {}, "id", 0, 1, undefined, false);
  _$jscoverage['/tree/node-xtpl.js'].lineData[14]++;
  buffer += getExpressionUtil(id0, true);
  _$jscoverage['/tree/node-xtpl.js'].lineData[15]++;
  buffer += '"\r\n     class="';
  _$jscoverage['/tree/node-xtpl.js'].lineData[16]++;
  var config2 = {};
  _$jscoverage['/tree/node-xtpl.js'].lineData[17]++;
  var params3 = [];
  _$jscoverage['/tree/node-xtpl.js'].lineData[18]++;
  params3.push('row');
  _$jscoverage['/tree/node-xtpl.js'].lineData[19]++;
  config2.params = params3;
  _$jscoverage['/tree/node-xtpl.js'].lineData[20]++;
  var id1 = getPropertyOrRunCommandUtil(engine, scopes, config2, "getBaseCssClasses", 0, 2, true, undefined);
  _$jscoverage['/tree/node-xtpl.js'].lineData[21]++;
  buffer += id1;
  _$jscoverage['/tree/node-xtpl.js'].lineData[22]++;
  buffer += '\r\n     ';
  _$jscoverage['/tree/node-xtpl.js'].lineData[23]++;
  var config4 = {};
  _$jscoverage['/tree/node-xtpl.js'].lineData[24]++;
  var params5 = [];
  _$jscoverage['/tree/node-xtpl.js'].lineData[25]++;
  var id6 = getPropertyOrRunCommandUtil(engine, scopes, {}, "selected", 0, 3, undefined, true);
  _$jscoverage['/tree/node-xtpl.js'].lineData[26]++;
  params5.push(id6);
  _$jscoverage['/tree/node-xtpl.js'].lineData[27]++;
  config4.params = params5;
  _$jscoverage['/tree/node-xtpl.js'].lineData[28]++;
  config4.fn = function(scopes) {
  _$jscoverage['/tree/node-xtpl.js'].functionData[2]++;
  _$jscoverage['/tree/node-xtpl.js'].lineData[29]++;
  var buffer = "";
  _$jscoverage['/tree/node-xtpl.js'].lineData[30]++;
  buffer += '\r\n        ';
  _$jscoverage['/tree/node-xtpl.js'].lineData[31]++;
  var config8 = {};
  _$jscoverage['/tree/node-xtpl.js'].lineData[32]++;
  var params9 = [];
  _$jscoverage['/tree/node-xtpl.js'].lineData[33]++;
  params9.push('selected');
  _$jscoverage['/tree/node-xtpl.js'].lineData[34]++;
  config8.params = params9;
  _$jscoverage['/tree/node-xtpl.js'].lineData[35]++;
  var id7 = getPropertyOrRunCommandUtil(engine, scopes, config8, "getBaseCssClasses", 0, 4, true, undefined);
  _$jscoverage['/tree/node-xtpl.js'].lineData[36]++;
  buffer += id7;
  _$jscoverage['/tree/node-xtpl.js'].lineData[37]++;
  buffer += '\r\n     ';
  _$jscoverage['/tree/node-xtpl.js'].lineData[38]++;
  return buffer;
};
  _$jscoverage['/tree/node-xtpl.js'].lineData[40]++;
  buffer += runBlockCommandUtil(engine, scopes, config4, "if", 3);
  _$jscoverage['/tree/node-xtpl.js'].lineData[41]++;
  buffer += '\r\n     ">\r\n    <div id="ks-tree-node-expand-icon-';
  _$jscoverage['/tree/node-xtpl.js'].lineData[42]++;
  var id10 = getPropertyOrRunCommandUtil(engine, scopes, {}, "id", 0, 7, undefined, false);
  _$jscoverage['/tree/node-xtpl.js'].lineData[43]++;
  buffer += getExpressionUtil(id10, true);
  _$jscoverage['/tree/node-xtpl.js'].lineData[44]++;
  buffer += '"\r\n         class="';
  _$jscoverage['/tree/node-xtpl.js'].lineData[45]++;
  var config12 = {};
  _$jscoverage['/tree/node-xtpl.js'].lineData[46]++;
  var params13 = [];
  _$jscoverage['/tree/node-xtpl.js'].lineData[47]++;
  params13.push('expand-icon');
  _$jscoverage['/tree/node-xtpl.js'].lineData[48]++;
  config12.params = params13;
  _$jscoverage['/tree/node-xtpl.js'].lineData[49]++;
  var id11 = getPropertyOrRunCommandUtil(engine, scopes, config12, "getBaseCssClasses", 0, 8, true, undefined);
  _$jscoverage['/tree/node-xtpl.js'].lineData[50]++;
  buffer += id11;
  _$jscoverage['/tree/node-xtpl.js'].lineData[51]++;
  buffer += '">\r\n    </div>\r\n    ';
  _$jscoverage['/tree/node-xtpl.js'].lineData[52]++;
  var config14 = {};
  _$jscoverage['/tree/node-xtpl.js'].lineData[53]++;
  var params15 = [];
  _$jscoverage['/tree/node-xtpl.js'].lineData[54]++;
  var id16 = getPropertyOrRunCommandUtil(engine, scopes, {}, "checkable", 0, 10, undefined, true);
  _$jscoverage['/tree/node-xtpl.js'].lineData[55]++;
  params15.push(id16);
  _$jscoverage['/tree/node-xtpl.js'].lineData[56]++;
  config14.params = params15;
  _$jscoverage['/tree/node-xtpl.js'].lineData[57]++;
  config14.fn = function(scopes) {
  _$jscoverage['/tree/node-xtpl.js'].functionData[3]++;
  _$jscoverage['/tree/node-xtpl.js'].lineData[58]++;
  var buffer = "";
  _$jscoverage['/tree/node-xtpl.js'].lineData[59]++;
  buffer += '\r\n    <div id="ks-tree-node-checked-';
  _$jscoverage['/tree/node-xtpl.js'].lineData[60]++;
  var id17 = getPropertyOrRunCommandUtil(engine, scopes, {}, "id", 0, 11, undefined, false);
  _$jscoverage['/tree/node-xtpl.js'].lineData[61]++;
  buffer += getExpressionUtil(id17, true);
  _$jscoverage['/tree/node-xtpl.js'].lineData[62]++;
  buffer += '"\r\n         class="';
  _$jscoverage['/tree/node-xtpl.js'].lineData[63]++;
  var config19 = {};
  _$jscoverage['/tree/node-xtpl.js'].lineData[64]++;
  var params20 = [];
  _$jscoverage['/tree/node-xtpl.js'].lineData[65]++;
  var id21 = getPropertyOrRunCommandUtil(engine, scopes, {}, "checkState", 0, 12, undefined, true);
  _$jscoverage['/tree/node-xtpl.js'].lineData[66]++;
  params20.push(('checked') + id21);
  _$jscoverage['/tree/node-xtpl.js'].lineData[67]++;
  config19.params = params20;
  _$jscoverage['/tree/node-xtpl.js'].lineData[68]++;
  var id18 = getPropertyOrRunCommandUtil(engine, scopes, config19, "getBaseCssClasses", 0, 12, true, undefined);
  _$jscoverage['/tree/node-xtpl.js'].lineData[69]++;
  buffer += id18;
  _$jscoverage['/tree/node-xtpl.js'].lineData[70]++;
  buffer += '"></div>\r\n    ';
  _$jscoverage['/tree/node-xtpl.js'].lineData[71]++;
  return buffer;
};
  _$jscoverage['/tree/node-xtpl.js'].lineData[73]++;
  buffer += runBlockCommandUtil(engine, scopes, config14, "if", 10);
  _$jscoverage['/tree/node-xtpl.js'].lineData[74]++;
  buffer += '\r\n    <div id="ks-tree-node-icon-';
  _$jscoverage['/tree/node-xtpl.js'].lineData[75]++;
  var id22 = getPropertyOrRunCommandUtil(engine, scopes, {}, "id", 0, 14, undefined, false);
  _$jscoverage['/tree/node-xtpl.js'].lineData[76]++;
  buffer += getExpressionUtil(id22, true);
  _$jscoverage['/tree/node-xtpl.js'].lineData[77]++;
  buffer += '"\r\n         class="';
  _$jscoverage['/tree/node-xtpl.js'].lineData[78]++;
  var config24 = {};
  _$jscoverage['/tree/node-xtpl.js'].lineData[79]++;
  var params25 = [];
  _$jscoverage['/tree/node-xtpl.js'].lineData[80]++;
  params25.push('icon');
  _$jscoverage['/tree/node-xtpl.js'].lineData[81]++;
  config24.params = params25;
  _$jscoverage['/tree/node-xtpl.js'].lineData[82]++;
  var id23 = getPropertyOrRunCommandUtil(engine, scopes, config24, "getBaseCssClasses", 0, 15, true, undefined);
  _$jscoverage['/tree/node-xtpl.js'].lineData[83]++;
  buffer += id23;
  _$jscoverage['/tree/node-xtpl.js'].lineData[84]++;
  buffer += '">\r\n\r\n    </div>\r\n    ';
  _$jscoverage['/tree/node-xtpl.js'].lineData[85]++;
  var config27 = {};
  _$jscoverage['/tree/node-xtpl.js'].lineData[86]++;
  var params28 = [];
  _$jscoverage['/tree/node-xtpl.js'].lineData[87]++;
  params28.push('component/extension/content-render/content-xtpl');
  _$jscoverage['/tree/node-xtpl.js'].lineData[88]++;
  config27.params = params28;
  _$jscoverage['/tree/node-xtpl.js'].lineData[89]++;
  var id26 = getPropertyOrRunCommandUtil(engine, scopes, config27, "include", 0, 18, false, undefined);
  _$jscoverage['/tree/node-xtpl.js'].lineData[90]++;
  buffer += id26;
  _$jscoverage['/tree/node-xtpl.js'].lineData[91]++;
  buffer += '\r\n</div>\r\n<div id="ks-tree-node-children-';
  _$jscoverage['/tree/node-xtpl.js'].lineData[92]++;
  var id29 = getPropertyOrRunCommandUtil(engine, scopes, {}, "id", 0, 20, undefined, false);
  _$jscoverage['/tree/node-xtpl.js'].lineData[93]++;
  buffer += getExpressionUtil(id29, true);
  _$jscoverage['/tree/node-xtpl.js'].lineData[94]++;
  buffer += '"\r\n     class="';
  _$jscoverage['/tree/node-xtpl.js'].lineData[95]++;
  var config31 = {};
  _$jscoverage['/tree/node-xtpl.js'].lineData[96]++;
  var params32 = [];
  _$jscoverage['/tree/node-xtpl.js'].lineData[97]++;
  params32.push('children');
  _$jscoverage['/tree/node-xtpl.js'].lineData[98]++;
  config31.params = params32;
  _$jscoverage['/tree/node-xtpl.js'].lineData[99]++;
  var id30 = getPropertyOrRunCommandUtil(engine, scopes, config31, "getBaseCssClasses", 0, 21, true, undefined);
  _$jscoverage['/tree/node-xtpl.js'].lineData[100]++;
  buffer += id30;
  _$jscoverage['/tree/node-xtpl.js'].lineData[101]++;
  buffer += '"\r\n';
  _$jscoverage['/tree/node-xtpl.js'].lineData[102]++;
  var config33 = {};
  _$jscoverage['/tree/node-xtpl.js'].lineData[103]++;
  var params34 = [];
  _$jscoverage['/tree/node-xtpl.js'].lineData[104]++;
  var id35 = getPropertyOrRunCommandUtil(engine, scopes, {}, "expanded", 0, 22, undefined, true);
  _$jscoverage['/tree/node-xtpl.js'].lineData[105]++;
  params34.push(id35);
  _$jscoverage['/tree/node-xtpl.js'].lineData[106]++;
  config33.params = params34;
  _$jscoverage['/tree/node-xtpl.js'].lineData[107]++;
  config33.fn = function(scopes) {
  _$jscoverage['/tree/node-xtpl.js'].functionData[4]++;
  _$jscoverage['/tree/node-xtpl.js'].lineData[108]++;
  var buffer = "";
  _$jscoverage['/tree/node-xtpl.js'].lineData[109]++;
  buffer += '\r\nstyle="display:none"\r\n';
  _$jscoverage['/tree/node-xtpl.js'].lineData[110]++;
  return buffer;
};
  _$jscoverage['/tree/node-xtpl.js'].lineData[112]++;
  var inverse36 = config33.fn;
  _$jscoverage['/tree/node-xtpl.js'].lineData[113]++;
  config33.fn = config33.inverse;
  _$jscoverage['/tree/node-xtpl.js'].lineData[114]++;
  config33.inverse = inverse36;
  _$jscoverage['/tree/node-xtpl.js'].lineData[115]++;
  buffer += runBlockCommandUtil(engine, scopes, config33, "if", 22);
  _$jscoverage['/tree/node-xtpl.js'].lineData[116]++;
  buffer += '\r\n>\r\n</div>';
  _$jscoverage['/tree/node-xtpl.js'].lineData[117]++;
  return buffer;
};
});
