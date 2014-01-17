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
if (! _$jscoverage['/bar/bar-xtpl.js']) {
  _$jscoverage['/bar/bar-xtpl.js'] = {};
  _$jscoverage['/bar/bar-xtpl.js'].lineData = [];
  _$jscoverage['/bar/bar-xtpl.js'].lineData[2] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[4] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[5] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[9] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[10] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[12] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[17] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[18] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[19] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[20] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[21] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[22] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[23] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[24] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[25] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[26] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[27] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[28] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[29] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[30] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[31] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[32] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[33] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[34] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[35] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[36] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[37] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[38] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[39] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[40] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[41] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[42] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[43] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[44] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[45] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[46] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[48] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[49] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[50] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[51] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[52] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[53] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[54] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[55] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[56] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[57] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[58] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[59] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[60] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[61] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[62] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[63] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[64] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[65] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[66] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[67] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[68] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[69] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[70] = 0;
}
if (! _$jscoverage['/bar/bar-xtpl.js'].functionData) {
  _$jscoverage['/bar/bar-xtpl.js'].functionData = [];
  _$jscoverage['/bar/bar-xtpl.js'].functionData[0] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].functionData[1] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].functionData[2] = 0;
}
if (! _$jscoverage['/bar/bar-xtpl.js'].branchData) {
  _$jscoverage['/bar/bar-xtpl.js'].branchData = {};
  _$jscoverage['/bar/bar-xtpl.js'].branchData['9'] = [];
  _$jscoverage['/bar/bar-xtpl.js'].branchData['9'][1] = new BranchData();
  _$jscoverage['/bar/bar-xtpl.js'].branchData['9'][2] = new BranchData();
}
_$jscoverage['/bar/bar-xtpl.js'].branchData['9'][2].init(165, 29, 'typeof module !== "undefined"');
function visit5_9_2(result) {
  _$jscoverage['/bar/bar-xtpl.js'].branchData['9'][2].ranCondition(result);
  return result;
}_$jscoverage['/bar/bar-xtpl.js'].branchData['9'][1].init(165, 45, 'typeof module !== "undefined" && module.kissy');
function visit4_9_1(result) {
  _$jscoverage['/bar/bar-xtpl.js'].branchData['9'][1].ranCondition(result);
  return result;
}_$jscoverage['/bar/bar-xtpl.js'].lineData[2]++;
KISSY.add(function(S, require, exports, module) {
  _$jscoverage['/bar/bar-xtpl.js'].functionData[0]++;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[4]++;
  return function(scope, S, undefined) {
  _$jscoverage['/bar/bar-xtpl.js'].functionData[1]++;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[5]++;
  var buffer = "", config = this.config, engine = this, moduleWrap, utils = config.utils;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[9]++;
  if (visit4_9_1(visit5_9_2(typeof module !== "undefined") && module.kissy)) {
    _$jscoverage['/bar/bar-xtpl.js'].lineData[10]++;
    moduleWrap = module;
  }
  _$jscoverage['/bar/bar-xtpl.js'].lineData[12]++;
  var runBlockCommandUtil = utils.runBlockCommand, renderOutputUtil = utils.renderOutput, getPropertyUtil = utils.getProperty, runInlineCommandUtil = utils.runInlineCommand, getPropertyOrRunCommandUtil = utils.getPropertyOrRunCommand;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[17]++;
  buffer += '';
  _$jscoverage['/bar/bar-xtpl.js'].lineData[18]++;
  var config0 = {};
  _$jscoverage['/bar/bar-xtpl.js'].lineData[19]++;
  var params1 = [];
  _$jscoverage['/bar/bar-xtpl.js'].lineData[20]++;
  var id2 = getPropertyUtil(engine, scope, "withTitle", 0, 1);
  _$jscoverage['/bar/bar-xtpl.js'].lineData[21]++;
  params1.push(id2);
  _$jscoverage['/bar/bar-xtpl.js'].lineData[22]++;
  config0.params = params1;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[23]++;
  config0.fn = function(scope) {
  _$jscoverage['/bar/bar-xtpl.js'].functionData[2]++;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[24]++;
  var buffer = "";
  _$jscoverage['/bar/bar-xtpl.js'].lineData[25]++;
  buffer += '\r\n<div class="';
  _$jscoverage['/bar/bar-xtpl.js'].lineData[26]++;
  var config4 = {};
  _$jscoverage['/bar/bar-xtpl.js'].lineData[27]++;
  var params5 = [];
  _$jscoverage['/bar/bar-xtpl.js'].lineData[28]++;
  params5.push('title-wrap');
  _$jscoverage['/bar/bar-xtpl.js'].lineData[29]++;
  config4.params = params5;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[30]++;
  var id3 = runInlineCommandUtil(engine, scope, config4, "getBaseCssClasses", 2);
  _$jscoverage['/bar/bar-xtpl.js'].lineData[31]++;
  buffer += renderOutputUtil(id3, true);
  _$jscoverage['/bar/bar-xtpl.js'].lineData[32]++;
  buffer += '">\r\n    <div class="';
  _$jscoverage['/bar/bar-xtpl.js'].lineData[33]++;
  var config7 = {};
  _$jscoverage['/bar/bar-xtpl.js'].lineData[34]++;
  var params8 = [];
  _$jscoverage['/bar/bar-xtpl.js'].lineData[35]++;
  params8.push('title');
  _$jscoverage['/bar/bar-xtpl.js'].lineData[36]++;
  config7.params = params8;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[37]++;
  var id6 = runInlineCommandUtil(engine, scope, config7, "getBaseCssClasses", 3);
  _$jscoverage['/bar/bar-xtpl.js'].lineData[38]++;
  buffer += renderOutputUtil(id6, true);
  _$jscoverage['/bar/bar-xtpl.js'].lineData[39]++;
  buffer += '" id="ks-navigation-bar-title-';
  _$jscoverage['/bar/bar-xtpl.js'].lineData[40]++;
  var id9 = getPropertyOrRunCommandUtil(engine, scope, {}, "id", 0, 3);
  _$jscoverage['/bar/bar-xtpl.js'].lineData[41]++;
  buffer += renderOutputUtil(id9, true);
  _$jscoverage['/bar/bar-xtpl.js'].lineData[42]++;
  buffer += '">';
  _$jscoverage['/bar/bar-xtpl.js'].lineData[43]++;
  var id10 = getPropertyOrRunCommandUtil(engine, scope, {}, "title", 0, 3);
  _$jscoverage['/bar/bar-xtpl.js'].lineData[44]++;
  buffer += renderOutputUtil(id10, true);
  _$jscoverage['/bar/bar-xtpl.js'].lineData[45]++;
  buffer += '</div>\r\n</div>\r\n';
  _$jscoverage['/bar/bar-xtpl.js'].lineData[46]++;
  return buffer;
};
  _$jscoverage['/bar/bar-xtpl.js'].lineData[48]++;
  buffer += runBlockCommandUtil(engine, scope, config0, "if", 1);
  _$jscoverage['/bar/bar-xtpl.js'].lineData[49]++;
  buffer += '\r\n<div class="';
  _$jscoverage['/bar/bar-xtpl.js'].lineData[50]++;
  var config12 = {};
  _$jscoverage['/bar/bar-xtpl.js'].lineData[51]++;
  var params13 = [];
  _$jscoverage['/bar/bar-xtpl.js'].lineData[52]++;
  params13.push('content');
  _$jscoverage['/bar/bar-xtpl.js'].lineData[53]++;
  config12.params = params13;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[54]++;
  var id11 = runInlineCommandUtil(engine, scope, config12, "getBaseCssClasses", 6);
  _$jscoverage['/bar/bar-xtpl.js'].lineData[55]++;
  buffer += renderOutputUtil(id11, true);
  _$jscoverage['/bar/bar-xtpl.js'].lineData[56]++;
  buffer += '" id="ks-navigation-bar-content-';
  _$jscoverage['/bar/bar-xtpl.js'].lineData[57]++;
  var id14 = getPropertyOrRunCommandUtil(engine, scope, {}, "id", 0, 6);
  _$jscoverage['/bar/bar-xtpl.js'].lineData[58]++;
  buffer += renderOutputUtil(id14, true);
  _$jscoverage['/bar/bar-xtpl.js'].lineData[59]++;
  buffer += '">\r\n    <div class="';
  _$jscoverage['/bar/bar-xtpl.js'].lineData[60]++;
  var config16 = {};
  _$jscoverage['/bar/bar-xtpl.js'].lineData[61]++;
  var params17 = [];
  _$jscoverage['/bar/bar-xtpl.js'].lineData[62]++;
  params17.push('center');
  _$jscoverage['/bar/bar-xtpl.js'].lineData[63]++;
  config16.params = params17;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[64]++;
  var id15 = runInlineCommandUtil(engine, scope, config16, "getBaseCssClasses", 7);
  _$jscoverage['/bar/bar-xtpl.js'].lineData[65]++;
  buffer += renderOutputUtil(id15, true);
  _$jscoverage['/bar/bar-xtpl.js'].lineData[66]++;
  buffer += '" id="ks-navigation-bar-center-';
  _$jscoverage['/bar/bar-xtpl.js'].lineData[67]++;
  var id18 = getPropertyOrRunCommandUtil(engine, scope, {}, "id", 0, 7);
  _$jscoverage['/bar/bar-xtpl.js'].lineData[68]++;
  buffer += renderOutputUtil(id18, true);
  _$jscoverage['/bar/bar-xtpl.js'].lineData[69]++;
  buffer += '"></div>\r\n</div>';
  _$jscoverage['/bar/bar-xtpl.js'].lineData[70]++;
  return buffer;
};
});
