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
  _$jscoverage['/bar/bar-xtpl.js'].lineData[10] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[11] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[13] = 0;
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
  _$jscoverage['/bar/bar-xtpl.js'].lineData[47] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[48] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[49] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[50] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[51] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[52] = 0;
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
  _$jscoverage['/bar/bar-xtpl.js'].lineData[71] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[72] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[73] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[74] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[75] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[76] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[78] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[79] = 0;
}
if (! _$jscoverage['/bar/bar-xtpl.js'].functionData) {
  _$jscoverage['/bar/bar-xtpl.js'].functionData = [];
  _$jscoverage['/bar/bar-xtpl.js'].functionData[0] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].functionData[1] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].functionData[2] = 0;
}
if (! _$jscoverage['/bar/bar-xtpl.js'].branchData) {
  _$jscoverage['/bar/bar-xtpl.js'].branchData = {};
  _$jscoverage['/bar/bar-xtpl.js'].branchData['10'] = [];
  _$jscoverage['/bar/bar-xtpl.js'].branchData['10'][1] = new BranchData();
  _$jscoverage['/bar/bar-xtpl.js'].branchData['10'][2] = new BranchData();
}
_$jscoverage['/bar/bar-xtpl.js'].branchData['10'][2].init(226, 29, 'typeof module !== "undefined"');
function visit5_10_2(result) {
  _$jscoverage['/bar/bar-xtpl.js'].branchData['10'][2].ranCondition(result);
  return result;
}_$jscoverage['/bar/bar-xtpl.js'].branchData['10'][1].init(226, 45, 'typeof module !== "undefined" && module.kissy');
function visit4_10_1(result) {
  _$jscoverage['/bar/bar-xtpl.js'].branchData['10'][1].ranCondition(result);
  return result;
}_$jscoverage['/bar/bar-xtpl.js'].lineData[2]++;
KISSY.add(function(S, require, exports, module) {
  _$jscoverage['/bar/bar-xtpl.js'].functionData[0]++;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[4]++;
  var t = function(scope, S, payload, undefined) {
  _$jscoverage['/bar/bar-xtpl.js'].functionData[1]++;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[5]++;
  var buffer = "", engine = this, moduleWrap, escapeHtml = S.escapeHtml, nativeCommands = engine.nativeCommands, utils = engine.utils;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[10]++;
  if (visit4_10_1(visit5_10_2(typeof module !== "undefined") && module.kissy)) {
    _$jscoverage['/bar/bar-xtpl.js'].lineData[11]++;
    moduleWrap = module;
  }
  _$jscoverage['/bar/bar-xtpl.js'].lineData[13]++;
  var callCommandUtil = utils.callCommand, eachCommand = nativeCommands.each, withCommand = nativeCommands["with"], ifCommand = nativeCommands["if"], setCommand = nativeCommands.set, includeCommand = nativeCommands.include, parseCommand = nativeCommands.parse, extendCommand = nativeCommands.extend, blockCommand = nativeCommands.block, macroCommand = nativeCommands.macro;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[23]++;
  buffer += '';
  _$jscoverage['/bar/bar-xtpl.js'].lineData[24]++;
  var option0 = {};
  _$jscoverage['/bar/bar-xtpl.js'].lineData[25]++;
  var params1 = [];
  _$jscoverage['/bar/bar-xtpl.js'].lineData[26]++;
  var id2 = scope.resolve(["withTitle"]);
  _$jscoverage['/bar/bar-xtpl.js'].lineData[27]++;
  params1.push(id2);
  _$jscoverage['/bar/bar-xtpl.js'].lineData[28]++;
  option0.params = params1;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[29]++;
  option0.fn = function(scope) {
  _$jscoverage['/bar/bar-xtpl.js'].functionData[2]++;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[30]++;
  var buffer = "";
  _$jscoverage['/bar/bar-xtpl.js'].lineData[31]++;
  buffer += '\r\n<div class="';
  _$jscoverage['/bar/bar-xtpl.js'].lineData[32]++;
  var option4 = {};
  _$jscoverage['/bar/bar-xtpl.js'].lineData[33]++;
  var params5 = [];
  _$jscoverage['/bar/bar-xtpl.js'].lineData[34]++;
  params5.push('title-wrap');
  _$jscoverage['/bar/bar-xtpl.js'].lineData[35]++;
  option4.params = params5;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[36]++;
  var id3 = callCommandUtil(engine, scope, option4, "getBaseCssClasses", 2);
  _$jscoverage['/bar/bar-xtpl.js'].lineData[37]++;
  buffer += escapeHtml(id3);
  _$jscoverage['/bar/bar-xtpl.js'].lineData[38]++;
  buffer += '">\r\n    <div class="';
  _$jscoverage['/bar/bar-xtpl.js'].lineData[39]++;
  var option7 = {};
  _$jscoverage['/bar/bar-xtpl.js'].lineData[40]++;
  var params8 = [];
  _$jscoverage['/bar/bar-xtpl.js'].lineData[41]++;
  params8.push('title');
  _$jscoverage['/bar/bar-xtpl.js'].lineData[42]++;
  option7.params = params8;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[43]++;
  var id6 = callCommandUtil(engine, scope, option7, "getBaseCssClasses", 3);
  _$jscoverage['/bar/bar-xtpl.js'].lineData[44]++;
  buffer += escapeHtml(id6);
  _$jscoverage['/bar/bar-xtpl.js'].lineData[45]++;
  buffer += '" id="ks-navigation-bar-title-';
  _$jscoverage['/bar/bar-xtpl.js'].lineData[46]++;
  var id9 = scope.resolve(["id"]);
  _$jscoverage['/bar/bar-xtpl.js'].lineData[47]++;
  buffer += escapeHtml(id9);
  _$jscoverage['/bar/bar-xtpl.js'].lineData[48]++;
  buffer += '">';
  _$jscoverage['/bar/bar-xtpl.js'].lineData[49]++;
  var id10 = scope.resolve(["title"]);
  _$jscoverage['/bar/bar-xtpl.js'].lineData[50]++;
  buffer += escapeHtml(id10);
  _$jscoverage['/bar/bar-xtpl.js'].lineData[51]++;
  buffer += '</div>\r\n</div>\r\n';
  _$jscoverage['/bar/bar-xtpl.js'].lineData[52]++;
  return buffer;
};
  _$jscoverage['/bar/bar-xtpl.js'].lineData[54]++;
  buffer += ifCommand.call(engine, scope, option0, payload);
  _$jscoverage['/bar/bar-xtpl.js'].lineData[55]++;
  buffer += '\r\n<div class="';
  _$jscoverage['/bar/bar-xtpl.js'].lineData[56]++;
  var option12 = {};
  _$jscoverage['/bar/bar-xtpl.js'].lineData[57]++;
  var params13 = [];
  _$jscoverage['/bar/bar-xtpl.js'].lineData[58]++;
  params13.push('content');
  _$jscoverage['/bar/bar-xtpl.js'].lineData[59]++;
  option12.params = params13;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[60]++;
  var id11 = callCommandUtil(engine, scope, option12, "getBaseCssClasses", 6);
  _$jscoverage['/bar/bar-xtpl.js'].lineData[61]++;
  buffer += escapeHtml(id11);
  _$jscoverage['/bar/bar-xtpl.js'].lineData[62]++;
  buffer += '" id="ks-navigation-bar-content-';
  _$jscoverage['/bar/bar-xtpl.js'].lineData[63]++;
  var id14 = scope.resolve(["id"]);
  _$jscoverage['/bar/bar-xtpl.js'].lineData[64]++;
  buffer += escapeHtml(id14);
  _$jscoverage['/bar/bar-xtpl.js'].lineData[65]++;
  buffer += '">\r\n    <div class="';
  _$jscoverage['/bar/bar-xtpl.js'].lineData[66]++;
  var option16 = {};
  _$jscoverage['/bar/bar-xtpl.js'].lineData[67]++;
  var params17 = [];
  _$jscoverage['/bar/bar-xtpl.js'].lineData[68]++;
  params17.push('center');
  _$jscoverage['/bar/bar-xtpl.js'].lineData[69]++;
  option16.params = params17;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[70]++;
  var id15 = callCommandUtil(engine, scope, option16, "getBaseCssClasses", 7);
  _$jscoverage['/bar/bar-xtpl.js'].lineData[71]++;
  buffer += escapeHtml(id15);
  _$jscoverage['/bar/bar-xtpl.js'].lineData[72]++;
  buffer += '" id="ks-navigation-bar-center-';
  _$jscoverage['/bar/bar-xtpl.js'].lineData[73]++;
  var id18 = scope.resolve(["id"]);
  _$jscoverage['/bar/bar-xtpl.js'].lineData[74]++;
  buffer += escapeHtml(id18);
  _$jscoverage['/bar/bar-xtpl.js'].lineData[75]++;
  buffer += '"></div>\r\n</div>';
  _$jscoverage['/bar/bar-xtpl.js'].lineData[76]++;
  return buffer;
};
  _$jscoverage['/bar/bar-xtpl.js'].lineData[78]++;
  t.TPL_NAME = "E:/code/kissy_git/kissy/kissy/src/navigation-view/sub-modules/bar/src/bar/bar.xtpl.html";
  _$jscoverage['/bar/bar-xtpl.js'].lineData[79]++;
  return t;
});
