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
if (! _$jscoverage['/picker/year-panel/year-panel-xtpl.js']) {
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'] = {};
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData = [];
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[2] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[4] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[5] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[9] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[10] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[12] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[17] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[18] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[19] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[20] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[21] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[22] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[23] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[24] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[25] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[26] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[27] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[28] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[29] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[30] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[31] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[32] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[33] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[34] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[35] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[36] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[37] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[38] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[39] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[40] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[41] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[42] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[43] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[44] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[45] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[46] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[47] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[48] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[49] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[50] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[51] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[52] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[53] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[54] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[55] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[56] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[57] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[58] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[59] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[60] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[61] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[62] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[63] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[64] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[65] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[66] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[67] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[68] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[69] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[70] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[71] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[72] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[73] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[74] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[75] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[76] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[77] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[78] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[79] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[80] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[81] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[82] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[83] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[84] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[85] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[86] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[87] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[88] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[89] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[90] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[91] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[92] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[93] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[94] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[95] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[96] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[97] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[98] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[99] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[100] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[101] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[102] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[103] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[105] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[106] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[107] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[108] = 0;
}
if (! _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].functionData) {
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].functionData = [];
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].functionData[0] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].functionData[1] = 0;
}
if (! _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].branchData) {
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].branchData = {};
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].branchData['9'] = [];
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].branchData['9'][1] = new BranchData();
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].branchData['9'][2] = new BranchData();
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].branchData['101'] = [];
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].branchData['101'][1] = new BranchData();
}
_$jscoverage['/picker/year-panel/year-panel-xtpl.js'].branchData['101'][1].init(5444, 10, 'moduleWrap');
function visit66_101_1(result) {
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].branchData['101'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/year-panel/year-panel-xtpl.js'].branchData['9'][2].init(165, 29, 'typeof module !== "undefined"');
function visit65_9_2(result) {
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].branchData['9'][2].ranCondition(result);
  return result;
}_$jscoverage['/picker/year-panel/year-panel-xtpl.js'].branchData['9'][1].init(165, 45, 'typeof module !== "undefined" && module.kissy');
function visit64_9_1(result) {
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].branchData['9'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[2]++;
KISSY.add(function(S, require, exports, module) {
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].functionData[0]++;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[4]++;
  return function(scope, S, undefined) {
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].functionData[1]++;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[5]++;
  var buffer = "", config = this.config, engine = this, moduleWrap, utils = config.utils;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[9]++;
  if (visit64_9_1(visit65_9_2(typeof module !== "undefined") && module.kissy)) {
    _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[10]++;
    moduleWrap = module;
  }
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[12]++;
  var runBlockCommandUtil = utils.runBlockCommand, renderOutputUtil = utils.renderOutput, getPropertyUtil = utils.getProperty, runInlineCommandUtil = utils.runInlineCommand, getPropertyOrRunCommandUtil = utils.getPropertyOrRunCommand;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[17]++;
  buffer += '<div class="';
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[18]++;
  var config1 = {};
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[19]++;
  var params2 = [];
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[20]++;
  params2.push('header');
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[21]++;
  config1.params = params2;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[22]++;
  var id0 = runInlineCommandUtil(engine, scope, config1, "getBaseCssClasses", 1);
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[23]++;
  buffer += renderOutputUtil(id0, true);
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[24]++;
  buffer += '">\n    <a id="ks-date-picker-year-panel-previous-decade-btn-';
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[25]++;
  var id3 = getPropertyOrRunCommandUtil(engine, scope, {}, "id", 0, 2);
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[26]++;
  buffer += renderOutputUtil(id3, true);
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[27]++;
  buffer += '"\n       class="';
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[28]++;
  var config5 = {};
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[29]++;
  var params6 = [];
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[30]++;
  params6.push('prev-decade-btn');
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[31]++;
  config5.params = params6;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[32]++;
  var id4 = runInlineCommandUtil(engine, scope, config5, "getBaseCssClasses", 3);
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[33]++;
  buffer += renderOutputUtil(id4, true);
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[34]++;
  buffer += '"\n       href="#"\n       role="button"\n       title="';
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[35]++;
  var id7 = getPropertyOrRunCommandUtil(engine, scope, {}, "previousDecadeLabel", 0, 6);
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[36]++;
  buffer += renderOutputUtil(id7, true);
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[37]++;
  buffer += '"\n       hidefocus="on">\n    </a>\n\n    <a class="';
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[38]++;
  var config9 = {};
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[39]++;
  var params10 = [];
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[40]++;
  params10.push('decade-select');
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[41]++;
  config9.params = params10;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[42]++;
  var id8 = runInlineCommandUtil(engine, scope, config9, "getBaseCssClasses", 10);
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[43]++;
  buffer += renderOutputUtil(id8, true);
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[44]++;
  buffer += '"\n       role="button"\n       href="#"\n       hidefocus="on"\n       title="';
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[45]++;
  var id11 = getPropertyOrRunCommandUtil(engine, scope, {}, "decadeSelectLabel", 0, 14);
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[46]++;
  buffer += renderOutputUtil(id11, true);
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[47]++;
  buffer += '"\n       id="ks-date-picker-year-panel-decade-select-';
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[48]++;
  var id12 = getPropertyOrRunCommandUtil(engine, scope, {}, "id", 0, 15);
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[49]++;
  buffer += renderOutputUtil(id12, true);
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[50]++;
  buffer += '">\n            <span id="ks-date-picker-year-panel-decade-select-content-';
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[51]++;
  var id13 = getPropertyOrRunCommandUtil(engine, scope, {}, "id", 0, 16);
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[52]++;
  buffer += renderOutputUtil(id13, true);
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[53]++;
  buffer += '">\n                ';
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[54]++;
  var id14 = getPropertyOrRunCommandUtil(engine, scope, {}, "startYear", 0, 17);
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[55]++;
  buffer += renderOutputUtil(id14, true);
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[56]++;
  buffer += '-';
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[57]++;
  var id15 = getPropertyOrRunCommandUtil(engine, scope, {}, "endYear", 0, 17);
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[58]++;
  buffer += renderOutputUtil(id15, true);
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[59]++;
  buffer += '\n            </span>\n        <span class="';
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[60]++;
  var config17 = {};
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[61]++;
  var params18 = [];
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[62]++;
  params18.push('decade-select-arrow');
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[63]++;
  config17.params = params18;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[64]++;
  var id16 = runInlineCommandUtil(engine, scope, config17, "getBaseCssClasses", 19);
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[65]++;
  buffer += renderOutputUtil(id16, true);
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[66]++;
  buffer += '">x</span>\n    </a>\n\n    <a id="ks-date-picker-year-panel-next-decade-btn-';
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[67]++;
  var id19 = getPropertyOrRunCommandUtil(engine, scope, {}, "id", 0, 22);
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[68]++;
  buffer += renderOutputUtil(id19, true);
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[69]++;
  buffer += '"\n       class="';
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[70]++;
  var config21 = {};
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[71]++;
  var params22 = [];
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[72]++;
  params22.push('next-decade-btn');
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[73]++;
  config21.params = params22;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[74]++;
  var id20 = runInlineCommandUtil(engine, scope, config21, "getBaseCssClasses", 23);
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[75]++;
  buffer += renderOutputUtil(id20, true);
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[76]++;
  buffer += '"\n       href="#"\n       role="button"\n       title="';
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[77]++;
  var id23 = getPropertyOrRunCommandUtil(engine, scope, {}, "nextDecadeLabel", 0, 26);
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[78]++;
  buffer += renderOutputUtil(id23, true);
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[79]++;
  buffer += '"\n       hidefocus="on">\n    </a>\n</div>\n<div class="';
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[80]++;
  var config25 = {};
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[81]++;
  var params26 = [];
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[82]++;
  params26.push('body');
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[83]++;
  config25.params = params26;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[84]++;
  var id24 = runInlineCommandUtil(engine, scope, config25, "getBaseCssClasses", 30);
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[85]++;
  buffer += renderOutputUtil(id24, true);
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[86]++;
  buffer += '">\n    <table class="';
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[87]++;
  var config28 = {};
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[88]++;
  var params29 = [];
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[89]++;
  params29.push('table');
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[90]++;
  config28.params = params29;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[91]++;
  var id27 = runInlineCommandUtil(engine, scope, config28, "getBaseCssClasses", 31);
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[92]++;
  buffer += renderOutputUtil(id27, true);
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[93]++;
  buffer += '" cellspacing="0" role="grid">\n        <tbody id="ks-date-picker-year-panel-tbody-';
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[94]++;
  var id30 = getPropertyOrRunCommandUtil(engine, scope, {}, "id", 0, 32);
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[95]++;
  buffer += renderOutputUtil(id30, true);
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[96]++;
  buffer += '">\n        ';
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[97]++;
  var config32 = {};
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[98]++;
  var params33 = [];
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[99]++;
  params33.push('date/picker/year-panel/years-xtpl');
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[100]++;
  config32.params = params33;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[101]++;
  if (visit66_101_1(moduleWrap)) {
    _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[102]++;
    require("date/picker/year-panel/years-xtpl");
    _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[103]++;
    config32.params[0] = moduleWrap.resolveByName(config32.params[0]);
  }
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[105]++;
  var id31 = runInlineCommandUtil(engine, scope, config32, "include", 33);
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[106]++;
  buffer += renderOutputUtil(id31, false);
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[107]++;
  buffer += '\n        </tbody>\n    </table>\n</div>';
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[108]++;
  return buffer;
};
});
