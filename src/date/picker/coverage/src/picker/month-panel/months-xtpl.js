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
if (! _$jscoverage['/picker/month-panel/months-xtpl.js']) {
  _$jscoverage['/picker/month-panel/months-xtpl.js'] = {};
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData = [];
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[2] = 0;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[3] = 0;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[4] = 0;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[8] = 0;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[11] = 0;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[12] = 0;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[13] = 0;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[14] = 0;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[15] = 0;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[16] = 0;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[17] = 0;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[18] = 0;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[19] = 0;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[20] = 0;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[21] = 0;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[22] = 0;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[23] = 0;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[24] = 0;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[25] = 0;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[26] = 0;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[27] = 0;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[28] = 0;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[29] = 0;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[30] = 0;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[31] = 0;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[32] = 0;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[33] = 0;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[34] = 0;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[35] = 0;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[36] = 0;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[37] = 0;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[38] = 0;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[39] = 0;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[40] = 0;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[41] = 0;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[42] = 0;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[43] = 0;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[44] = 0;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[45] = 0;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[46] = 0;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[47] = 0;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[48] = 0;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[49] = 0;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[50] = 0;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[51] = 0;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[52] = 0;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[53] = 0;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[54] = 0;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[55] = 0;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[57] = 0;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[58] = 0;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[59] = 0;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[60] = 0;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[61] = 0;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[62] = 0;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[63] = 0;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[64] = 0;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[65] = 0;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[66] = 0;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[67] = 0;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[68] = 0;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[69] = 0;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[71] = 0;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[72] = 0;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[73] = 0;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[75] = 0;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[76] = 0;
}
if (! _$jscoverage['/picker/month-panel/months-xtpl.js'].functionData) {
  _$jscoverage['/picker/month-panel/months-xtpl.js'].functionData = [];
  _$jscoverage['/picker/month-panel/months-xtpl.js'].functionData[0] = 0;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].functionData[1] = 0;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].functionData[2] = 0;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].functionData[3] = 0;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].functionData[4] = 0;
}
if (! _$jscoverage['/picker/month-panel/months-xtpl.js'].branchData) {
  _$jscoverage['/picker/month-panel/months-xtpl.js'].branchData = {};
  _$jscoverage['/picker/month-panel/months-xtpl.js'].branchData['43'] = [];
  _$jscoverage['/picker/month-panel/months-xtpl.js'].branchData['43'][1] = new BranchData();
}
_$jscoverage['/picker/month-panel/months-xtpl.js'].branchData['43'][1].init(980, 13, 'id13 === id14');
function visit15_43_1(result) {
  _$jscoverage['/picker/month-panel/months-xtpl.js'].branchData['43'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[2]++;
KISSY.add(function() {
  _$jscoverage['/picker/month-panel/months-xtpl.js'].functionData[0]++;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[3]++;
  return function(scopes, S, undefined) {
  _$jscoverage['/picker/month-panel/months-xtpl.js'].functionData[1]++;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[4]++;
  var buffer = "", config = this.config, engine = this, utils = config.utils;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[8]++;
  var runBlockCommandUtil = utils["runBlockCommand"], getExpressionUtil = utils["getExpression"], getPropertyOrRunCommandUtil = utils["getPropertyOrRunCommand"];
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[11]++;
  buffer += '';
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[12]++;
  var config0 = {};
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[13]++;
  var params1 = [];
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[14]++;
  var id2 = getPropertyOrRunCommandUtil(engine, scopes, {}, "months", 0, 1, undefined, true);
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[15]++;
  params1.push(id2);
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[16]++;
  config0.params = params1;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[17]++;
  config0.fn = function(scopes) {
  _$jscoverage['/picker/month-panel/months-xtpl.js'].functionData[2]++;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[18]++;
  var buffer = "";
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[19]++;
  buffer += '\n<tr role="row">\n    ';
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[20]++;
  var config3 = {};
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[21]++;
  var params4 = [];
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[22]++;
  var id6 = getPropertyOrRunCommandUtil(engine, scopes, {}, "xindex", 0, 3, undefined, true);
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[23]++;
  var id5 = getPropertyOrRunCommandUtil(engine, scopes, {}, "months." + id6 + "", 0, 3, undefined, true);
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[24]++;
  params4.push(id5);
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[25]++;
  config3.params = params4;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[26]++;
  config3.fn = function(scopes) {
  _$jscoverage['/picker/month-panel/months-xtpl.js'].functionData[3]++;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[27]++;
  var buffer = "";
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[28]++;
  buffer += '\n    <td role="gridcell"\n        title="';
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[29]++;
  var id7 = getPropertyOrRunCommandUtil(engine, scopes, {}, "title", 0, 5, undefined, false);
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[30]++;
  buffer += getExpressionUtil(id7, true);
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[31]++;
  buffer += '"\n        class="';
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[32]++;
  var config9 = {};
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[33]++;
  var params10 = [];
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[34]++;
  params10.push('cell');
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[35]++;
  config9.params = params10;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[36]++;
  var id8 = getPropertyOrRunCommandUtil(engine, scopes, config9, "getBaseCssClasses", 0, 6, true, undefined);
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[37]++;
  buffer += id8;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[38]++;
  buffer += '\n        ';
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[39]++;
  var config11 = {};
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[40]++;
  var params12 = [];
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[41]++;
  var id13 = getPropertyOrRunCommandUtil(engine, scopes, {}, "month", 0, 7, undefined, true);
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[42]++;
  var id14 = getPropertyOrRunCommandUtil(engine, scopes, {}, "value", 0, 7, undefined, true);
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[43]++;
  params12.push(visit15_43_1(id13 === id14));
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[44]++;
  config11.params = params12;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[45]++;
  config11.fn = function(scopes) {
  _$jscoverage['/picker/month-panel/months-xtpl.js'].functionData[4]++;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[46]++;
  var buffer = "";
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[47]++;
  buffer += '\n        ';
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[48]++;
  var config16 = {};
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[49]++;
  var params17 = [];
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[50]++;
  params17.push('selected-cell');
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[51]++;
  config16.params = params17;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[52]++;
  var id15 = getPropertyOrRunCommandUtil(engine, scopes, config16, "getBaseCssClasses", 0, 8, true, undefined);
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[53]++;
  buffer += id15;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[54]++;
  buffer += '\n        ';
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[55]++;
  return buffer;
};
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[57]++;
  buffer += runBlockCommandUtil(engine, scopes, config11, "if", 7);
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[58]++;
  buffer += '\n        ">\n        <a hidefocus="on"\n           href="#"\n           class="';
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[59]++;
  var config19 = {};
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[60]++;
  var params20 = [];
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[61]++;
  params20.push('month');
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[62]++;
  config19.params = params20;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[63]++;
  var id18 = getPropertyOrRunCommandUtil(engine, scopes, config19, "getBaseCssClasses", 0, 13, true, undefined);
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[64]++;
  buffer += id18;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[65]++;
  buffer += '">\n            ';
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[66]++;
  var id21 = getPropertyOrRunCommandUtil(engine, scopes, {}, "content", 0, 14, undefined, false);
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[67]++;
  buffer += getExpressionUtil(id21, true);
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[68]++;
  buffer += '\n        </a>\n    </td>\n    ';
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[69]++;
  return buffer;
};
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[71]++;
  buffer += runBlockCommandUtil(engine, scopes, config3, "each", 3);
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[72]++;
  buffer += '\n</tr>\n';
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[73]++;
  return buffer;
};
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[75]++;
  buffer += runBlockCommandUtil(engine, scopes, config0, "each", 1);
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[76]++;
  return buffer;
};
});
