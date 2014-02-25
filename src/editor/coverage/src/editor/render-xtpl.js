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
if (! _$jscoverage['/editor/render-xtpl.js']) {
  _$jscoverage['/editor/render-xtpl.js'] = {};
  _$jscoverage['/editor/render-xtpl.js'].lineData = [];
  _$jscoverage['/editor/render-xtpl.js'].lineData[2] = 0;
  _$jscoverage['/editor/render-xtpl.js'].lineData[4] = 0;
  _$jscoverage['/editor/render-xtpl.js'].lineData[5] = 0;
  _$jscoverage['/editor/render-xtpl.js'].lineData[10] = 0;
  _$jscoverage['/editor/render-xtpl.js'].lineData[11] = 0;
  _$jscoverage['/editor/render-xtpl.js'].lineData[13] = 0;
  _$jscoverage['/editor/render-xtpl.js'].lineData[23] = 0;
  _$jscoverage['/editor/render-xtpl.js'].lineData[24] = 0;
  _$jscoverage['/editor/render-xtpl.js'].lineData[25] = 0;
  _$jscoverage['/editor/render-xtpl.js'].lineData[26] = 0;
  _$jscoverage['/editor/render-xtpl.js'].lineData[27] = 0;
  _$jscoverage['/editor/render-xtpl.js'].lineData[28] = 0;
  _$jscoverage['/editor/render-xtpl.js'].lineData[29] = 0;
  _$jscoverage['/editor/render-xtpl.js'].lineData[30] = 0;
  _$jscoverage['/editor/render-xtpl.js'].lineData[31] = 0;
  _$jscoverage['/editor/render-xtpl.js'].lineData[32] = 0;
  _$jscoverage['/editor/render-xtpl.js'].lineData[33] = 0;
  _$jscoverage['/editor/render-xtpl.js'].lineData[34] = 0;
  _$jscoverage['/editor/render-xtpl.js'].lineData[35] = 0;
  _$jscoverage['/editor/render-xtpl.js'].lineData[36] = 0;
  _$jscoverage['/editor/render-xtpl.js'].lineData[37] = 0;
  _$jscoverage['/editor/render-xtpl.js'].lineData[38] = 0;
  _$jscoverage['/editor/render-xtpl.js'].lineData[39] = 0;
  _$jscoverage['/editor/render-xtpl.js'].lineData[40] = 0;
  _$jscoverage['/editor/render-xtpl.js'].lineData[41] = 0;
  _$jscoverage['/editor/render-xtpl.js'].lineData[43] = 0;
  _$jscoverage['/editor/render-xtpl.js'].lineData[44] = 0;
  _$jscoverage['/editor/render-xtpl.js'].lineData[45] = 0;
  _$jscoverage['/editor/render-xtpl.js'].lineData[46] = 0;
  _$jscoverage['/editor/render-xtpl.js'].lineData[47] = 0;
  _$jscoverage['/editor/render-xtpl.js'].lineData[48] = 0;
  _$jscoverage['/editor/render-xtpl.js'].lineData[49] = 0;
  _$jscoverage['/editor/render-xtpl.js'].lineData[50] = 0;
  _$jscoverage['/editor/render-xtpl.js'].lineData[51] = 0;
  _$jscoverage['/editor/render-xtpl.js'].lineData[52] = 0;
  _$jscoverage['/editor/render-xtpl.js'].lineData[53] = 0;
  _$jscoverage['/editor/render-xtpl.js'].lineData[54] = 0;
  _$jscoverage['/editor/render-xtpl.js'].lineData[55] = 0;
  _$jscoverage['/editor/render-xtpl.js'].lineData[56] = 0;
  _$jscoverage['/editor/render-xtpl.js'].lineData[57] = 0;
  _$jscoverage['/editor/render-xtpl.js'].lineData[58] = 0;
  _$jscoverage['/editor/render-xtpl.js'].lineData[59] = 0;
  _$jscoverage['/editor/render-xtpl.js'].lineData[60] = 0;
  _$jscoverage['/editor/render-xtpl.js'].lineData[61] = 0;
  _$jscoverage['/editor/render-xtpl.js'].lineData[62] = 0;
  _$jscoverage['/editor/render-xtpl.js'].lineData[63] = 0;
  _$jscoverage['/editor/render-xtpl.js'].lineData[64] = 0;
  _$jscoverage['/editor/render-xtpl.js'].lineData[65] = 0;
  _$jscoverage['/editor/render-xtpl.js'].lineData[66] = 0;
  _$jscoverage['/editor/render-xtpl.js'].lineData[67] = 0;
  _$jscoverage['/editor/render-xtpl.js'].lineData[68] = 0;
  _$jscoverage['/editor/render-xtpl.js'].lineData[70] = 0;
  _$jscoverage['/editor/render-xtpl.js'].lineData[71] = 0;
  _$jscoverage['/editor/render-xtpl.js'].lineData[72] = 0;
  _$jscoverage['/editor/render-xtpl.js'].lineData[73] = 0;
  _$jscoverage['/editor/render-xtpl.js'].lineData[74] = 0;
  _$jscoverage['/editor/render-xtpl.js'].lineData[75] = 0;
  _$jscoverage['/editor/render-xtpl.js'].lineData[76] = 0;
  _$jscoverage['/editor/render-xtpl.js'].lineData[77] = 0;
  _$jscoverage['/editor/render-xtpl.js'].lineData[78] = 0;
  _$jscoverage['/editor/render-xtpl.js'].lineData[79] = 0;
  _$jscoverage['/editor/render-xtpl.js'].lineData[80] = 0;
  _$jscoverage['/editor/render-xtpl.js'].lineData[82] = 0;
  _$jscoverage['/editor/render-xtpl.js'].lineData[83] = 0;
  _$jscoverage['/editor/render-xtpl.js'].lineData[84] = 0;
  _$jscoverage['/editor/render-xtpl.js'].lineData[85] = 0;
  _$jscoverage['/editor/render-xtpl.js'].lineData[86] = 0;
  _$jscoverage['/editor/render-xtpl.js'].lineData[87] = 0;
  _$jscoverage['/editor/render-xtpl.js'].lineData[88] = 0;
  _$jscoverage['/editor/render-xtpl.js'].lineData[89] = 0;
  _$jscoverage['/editor/render-xtpl.js'].lineData[90] = 0;
  _$jscoverage['/editor/render-xtpl.js'].lineData[91] = 0;
  _$jscoverage['/editor/render-xtpl.js'].lineData[92] = 0;
  _$jscoverage['/editor/render-xtpl.js'].lineData[93] = 0;
  _$jscoverage['/editor/render-xtpl.js'].lineData[95] = 0;
  _$jscoverage['/editor/render-xtpl.js'].lineData[96] = 0;
}
if (! _$jscoverage['/editor/render-xtpl.js'].functionData) {
  _$jscoverage['/editor/render-xtpl.js'].functionData = [];
  _$jscoverage['/editor/render-xtpl.js'].functionData[0] = 0;
  _$jscoverage['/editor/render-xtpl.js'].functionData[1] = 0;
  _$jscoverage['/editor/render-xtpl.js'].functionData[2] = 0;
  _$jscoverage['/editor/render-xtpl.js'].functionData[3] = 0;
  _$jscoverage['/editor/render-xtpl.js'].functionData[4] = 0;
}
if (! _$jscoverage['/editor/render-xtpl.js'].branchData) {
  _$jscoverage['/editor/render-xtpl.js'].branchData = {};
  _$jscoverage['/editor/render-xtpl.js'].branchData['10'] = [];
  _$jscoverage['/editor/render-xtpl.js'].branchData['10'][1] = new BranchData();
  _$jscoverage['/editor/render-xtpl.js'].branchData['10'][2] = new BranchData();
}
_$jscoverage['/editor/render-xtpl.js'].branchData['10'][2].init(226, 29, 'typeof module !== "undefined"');
function visit627_10_2(result) {
  _$jscoverage['/editor/render-xtpl.js'].branchData['10'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/render-xtpl.js'].branchData['10'][1].init(226, 45, 'typeof module !== "undefined" && module.kissy');
function visit626_10_1(result) {
  _$jscoverage['/editor/render-xtpl.js'].branchData['10'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/render-xtpl.js'].lineData[2]++;
KISSY.add(function(S, require, exports, module) {
  _$jscoverage['/editor/render-xtpl.js'].functionData[0]++;
  _$jscoverage['/editor/render-xtpl.js'].lineData[4]++;
  var t = function(scope, S, payload, undefined) {
  _$jscoverage['/editor/render-xtpl.js'].functionData[1]++;
  _$jscoverage['/editor/render-xtpl.js'].lineData[5]++;
  var buffer = "", engine = this, moduleWrap, escapeHtml = S.escapeHtml, nativeCommands = engine.nativeCommands, utils = engine.utils;
  _$jscoverage['/editor/render-xtpl.js'].lineData[10]++;
  if (visit626_10_1(visit627_10_2(typeof module !== "undefined") && module.kissy)) {
    _$jscoverage['/editor/render-xtpl.js'].lineData[11]++;
    moduleWrap = module;
  }
  _$jscoverage['/editor/render-xtpl.js'].lineData[13]++;
  var callCommandUtil = utils.callCommand, eachCommand = nativeCommands.each, withCommand = nativeCommands["with"], ifCommand = nativeCommands["if"], setCommand = nativeCommands.set, includeCommand = nativeCommands.include, parseCommand = nativeCommands.parse, extendCommand = nativeCommands.extend, blockCommand = nativeCommands.block, macroCommand = nativeCommands.macro;
  _$jscoverage['/editor/render-xtpl.js'].lineData[23]++;
  buffer += '<div class="';
  _$jscoverage['/editor/render-xtpl.js'].lineData[24]++;
  var id0 = scope.resolve(["prefixCls"]);
  _$jscoverage['/editor/render-xtpl.js'].lineData[25]++;
  buffer += escapeHtml(id0);
  _$jscoverage['/editor/render-xtpl.js'].lineData[26]++;
  buffer += 'editor-tools"\n     id="ks-editor-tools-';
  _$jscoverage['/editor/render-xtpl.js'].lineData[27]++;
  var id1 = scope.resolve(["id"]);
  _$jscoverage['/editor/render-xtpl.js'].lineData[28]++;
  buffer += escapeHtml(id1);
  _$jscoverage['/editor/render-xtpl.js'].lineData[29]++;
  buffer += '">\n\n</div>\n\n<!--\nhttp://johanbrook.com/browsers/native-momentum-scrolling-ios-5/\nios \u4e0d\u80fd\u653e\u5728 iframe \u4e0a\uff01\n-->\n\n<div class="';
  _$jscoverage['/editor/render-xtpl.js'].lineData[30]++;
  var id2 = scope.resolve(["prefixCls"]);
  _$jscoverage['/editor/render-xtpl.js'].lineData[31]++;
  buffer += escapeHtml(id2);
  _$jscoverage['/editor/render-xtpl.js'].lineData[32]++;
  buffer += 'editor-textarea-wrap"\n\n';
  _$jscoverage['/editor/render-xtpl.js'].lineData[33]++;
  var option3 = {};
  _$jscoverage['/editor/render-xtpl.js'].lineData[34]++;
  var params4 = [];
  _$jscoverage['/editor/render-xtpl.js'].lineData[35]++;
  var id5 = scope.resolve(["mobile"]);
  _$jscoverage['/editor/render-xtpl.js'].lineData[36]++;
  params4.push(id5);
  _$jscoverage['/editor/render-xtpl.js'].lineData[37]++;
  option3.params = params4;
  _$jscoverage['/editor/render-xtpl.js'].lineData[38]++;
  option3.fn = function(scope) {
  _$jscoverage['/editor/render-xtpl.js'].functionData[2]++;
  _$jscoverage['/editor/render-xtpl.js'].lineData[39]++;
  var buffer = "";
  _$jscoverage['/editor/render-xtpl.js'].lineData[40]++;
  buffer += '\nstyle="overflow:scroll;-webkit-overflow-scrolling:touch;"\n';
  _$jscoverage['/editor/render-xtpl.js'].lineData[41]++;
  return buffer;
};
  _$jscoverage['/editor/render-xtpl.js'].lineData[43]++;
  buffer += ifCommand.call(engine, scope, option3, payload);
  _$jscoverage['/editor/render-xtpl.js'].lineData[44]++;
  buffer += '\n\nid="ks-editor-textarea-wrap-';
  _$jscoverage['/editor/render-xtpl.js'].lineData[45]++;
  var id6 = scope.resolve(["id"]);
  _$jscoverage['/editor/render-xtpl.js'].lineData[46]++;
  buffer += escapeHtml(id6);
  _$jscoverage['/editor/render-xtpl.js'].lineData[47]++;
  buffer += '"\n>\n\n<textarea\n        id="ks-editor-textarea-';
  _$jscoverage['/editor/render-xtpl.js'].lineData[48]++;
  var id7 = scope.resolve(["id"]);
  _$jscoverage['/editor/render-xtpl.js'].lineData[49]++;
  buffer += escapeHtml(id7);
  _$jscoverage['/editor/render-xtpl.js'].lineData[50]++;
  buffer += '"\n        class="';
  _$jscoverage['/editor/render-xtpl.js'].lineData[51]++;
  var id8 = scope.resolve(["prefixCls"]);
  _$jscoverage['/editor/render-xtpl.js'].lineData[52]++;
  buffer += escapeHtml(id8);
  _$jscoverage['/editor/render-xtpl.js'].lineData[53]++;
  buffer += 'editor-textarea"\n\n';
  _$jscoverage['/editor/render-xtpl.js'].lineData[54]++;
  var option9 = {};
  _$jscoverage['/editor/render-xtpl.js'].lineData[55]++;
  var params10 = [];
  _$jscoverage['/editor/render-xtpl.js'].lineData[56]++;
  var id11 = scope.resolve(["textareaAttrs"]);
  _$jscoverage['/editor/render-xtpl.js'].lineData[57]++;
  params10.push(id11);
  _$jscoverage['/editor/render-xtpl.js'].lineData[58]++;
  option9.params = params10;
  _$jscoverage['/editor/render-xtpl.js'].lineData[59]++;
  option9.fn = function(scope) {
  _$jscoverage['/editor/render-xtpl.js'].functionData[3]++;
  _$jscoverage['/editor/render-xtpl.js'].lineData[60]++;
  var buffer = "";
  _$jscoverage['/editor/render-xtpl.js'].lineData[61]++;
  buffer += '\n';
  _$jscoverage['/editor/render-xtpl.js'].lineData[62]++;
  var id12 = scope.resolve(["xindex"]);
  _$jscoverage['/editor/render-xtpl.js'].lineData[63]++;
  buffer += escapeHtml(id12);
  _$jscoverage['/editor/render-xtpl.js'].lineData[64]++;
  buffer += '="';
  _$jscoverage['/editor/render-xtpl.js'].lineData[65]++;
  var id13 = scope.resolve(["this"]);
  _$jscoverage['/editor/render-xtpl.js'].lineData[66]++;
  buffer += escapeHtml(id13);
  _$jscoverage['/editor/render-xtpl.js'].lineData[67]++;
  buffer += '"\n';
  _$jscoverage['/editor/render-xtpl.js'].lineData[68]++;
  return buffer;
};
  _$jscoverage['/editor/render-xtpl.js'].lineData[70]++;
  buffer += eachCommand.call(engine, scope, option9, payload);
  _$jscoverage['/editor/render-xtpl.js'].lineData[71]++;
  buffer += '\n\n';
  _$jscoverage['/editor/render-xtpl.js'].lineData[72]++;
  var option14 = {};
  _$jscoverage['/editor/render-xtpl.js'].lineData[73]++;
  var params15 = [];
  _$jscoverage['/editor/render-xtpl.js'].lineData[74]++;
  var id16 = scope.resolve(["mode"]);
  _$jscoverage['/editor/render-xtpl.js'].lineData[75]++;
  params15.push(id16);
  _$jscoverage['/editor/render-xtpl.js'].lineData[76]++;
  option14.params = params15;
  _$jscoverage['/editor/render-xtpl.js'].lineData[77]++;
  option14.fn = function(scope) {
  _$jscoverage['/editor/render-xtpl.js'].functionData[4]++;
  _$jscoverage['/editor/render-xtpl.js'].lineData[78]++;
  var buffer = "";
  _$jscoverage['/editor/render-xtpl.js'].lineData[79]++;
  buffer += '\nstyle="display:none"\n';
  _$jscoverage['/editor/render-xtpl.js'].lineData[80]++;
  return buffer;
};
  _$jscoverage['/editor/render-xtpl.js'].lineData[82]++;
  buffer += ifCommand.call(engine, scope, option14, payload);
  _$jscoverage['/editor/render-xtpl.js'].lineData[83]++;
  buffer += '\n\n>';
  _$jscoverage['/editor/render-xtpl.js'].lineData[84]++;
  var id17 = scope.resolve(["data"]);
  _$jscoverage['/editor/render-xtpl.js'].lineData[85]++;
  buffer += escapeHtml(id17);
  _$jscoverage['/editor/render-xtpl.js'].lineData[86]++;
  buffer += '</textarea>\n\n</div>\n\n<div class="';
  _$jscoverage['/editor/render-xtpl.js'].lineData[87]++;
  var id18 = scope.resolve(["prefixCls"]);
  _$jscoverage['/editor/render-xtpl.js'].lineData[88]++;
  buffer += escapeHtml(id18);
  _$jscoverage['/editor/render-xtpl.js'].lineData[89]++;
  buffer += 'editor-status"\n     id="ks-editor-status-';
  _$jscoverage['/editor/render-xtpl.js'].lineData[90]++;
  var id19 = scope.resolve(["id"]);
  _$jscoverage['/editor/render-xtpl.js'].lineData[91]++;
  buffer += escapeHtml(id19);
  _$jscoverage['/editor/render-xtpl.js'].lineData[92]++;
  buffer += '">\n\n</div>';
  _$jscoverage['/editor/render-xtpl.js'].lineData[93]++;
  return buffer;
};
  _$jscoverage['/editor/render-xtpl.js'].lineData[95]++;
  t.TPL_NAME = "E:/code/kissy_git/kissy/kissy/src/editor/src/editor/render.xtpl.html";
  _$jscoverage['/editor/render-xtpl.js'].lineData[96]++;
  return t;
});
