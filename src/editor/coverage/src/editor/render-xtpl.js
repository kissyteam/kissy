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
  _$jscoverage['/editor/render-xtpl.js'].lineData[9] = 0;
  _$jscoverage['/editor/render-xtpl.js'].lineData[10] = 0;
  _$jscoverage['/editor/render-xtpl.js'].lineData[12] = 0;
  _$jscoverage['/editor/render-xtpl.js'].lineData[17] = 0;
  _$jscoverage['/editor/render-xtpl.js'].lineData[18] = 0;
  _$jscoverage['/editor/render-xtpl.js'].lineData[19] = 0;
  _$jscoverage['/editor/render-xtpl.js'].lineData[20] = 0;
  _$jscoverage['/editor/render-xtpl.js'].lineData[21] = 0;
  _$jscoverage['/editor/render-xtpl.js'].lineData[22] = 0;
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
  _$jscoverage['/editor/render-xtpl.js'].lineData[37] = 0;
  _$jscoverage['/editor/render-xtpl.js'].lineData[38] = 0;
  _$jscoverage['/editor/render-xtpl.js'].lineData[39] = 0;
  _$jscoverage['/editor/render-xtpl.js'].lineData[40] = 0;
  _$jscoverage['/editor/render-xtpl.js'].lineData[41] = 0;
  _$jscoverage['/editor/render-xtpl.js'].lineData[42] = 0;
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
  _$jscoverage['/editor/render-xtpl.js'].lineData[64] = 0;
  _$jscoverage['/editor/render-xtpl.js'].lineData[65] = 0;
  _$jscoverage['/editor/render-xtpl.js'].lineData[66] = 0;
  _$jscoverage['/editor/render-xtpl.js'].lineData[67] = 0;
  _$jscoverage['/editor/render-xtpl.js'].lineData[68] = 0;
  _$jscoverage['/editor/render-xtpl.js'].lineData[69] = 0;
  _$jscoverage['/editor/render-xtpl.js'].lineData[70] = 0;
  _$jscoverage['/editor/render-xtpl.js'].lineData[71] = 0;
  _$jscoverage['/editor/render-xtpl.js'].lineData[72] = 0;
  _$jscoverage['/editor/render-xtpl.js'].lineData[73] = 0;
  _$jscoverage['/editor/render-xtpl.js'].lineData[74] = 0;
  _$jscoverage['/editor/render-xtpl.js'].lineData[76] = 0;
  _$jscoverage['/editor/render-xtpl.js'].lineData[77] = 0;
  _$jscoverage['/editor/render-xtpl.js'].lineData[78] = 0;
  _$jscoverage['/editor/render-xtpl.js'].lineData[79] = 0;
  _$jscoverage['/editor/render-xtpl.js'].lineData[80] = 0;
  _$jscoverage['/editor/render-xtpl.js'].lineData[81] = 0;
  _$jscoverage['/editor/render-xtpl.js'].lineData[82] = 0;
  _$jscoverage['/editor/render-xtpl.js'].lineData[83] = 0;
  _$jscoverage['/editor/render-xtpl.js'].lineData[84] = 0;
  _$jscoverage['/editor/render-xtpl.js'].lineData[85] = 0;
  _$jscoverage['/editor/render-xtpl.js'].lineData[86] = 0;
  _$jscoverage['/editor/render-xtpl.js'].lineData[87] = 0;
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
  _$jscoverage['/editor/render-xtpl.js'].branchData['9'] = [];
  _$jscoverage['/editor/render-xtpl.js'].branchData['9'][1] = new BranchData();
  _$jscoverage['/editor/render-xtpl.js'].branchData['9'][2] = new BranchData();
}
_$jscoverage['/editor/render-xtpl.js'].branchData['9'][2].init(165, 29, 'typeof module !== "undefined"');
function visit638_9_2(result) {
  _$jscoverage['/editor/render-xtpl.js'].branchData['9'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/render-xtpl.js'].branchData['9'][1].init(165, 45, 'typeof module !== "undefined" && module.kissy');
function visit637_9_1(result) {
  _$jscoverage['/editor/render-xtpl.js'].branchData['9'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/render-xtpl.js'].lineData[2]++;
KISSY.add(function(S, require, exports, module) {
  _$jscoverage['/editor/render-xtpl.js'].functionData[0]++;
  _$jscoverage['/editor/render-xtpl.js'].lineData[4]++;
  return function(scope, S, undefined) {
  _$jscoverage['/editor/render-xtpl.js'].functionData[1]++;
  _$jscoverage['/editor/render-xtpl.js'].lineData[5]++;
  var buffer = "", config = this.config, engine = this, moduleWrap, utils = config.utils;
  _$jscoverage['/editor/render-xtpl.js'].lineData[9]++;
  if (visit637_9_1(visit638_9_2(typeof module !== "undefined") && module.kissy)) {
    _$jscoverage['/editor/render-xtpl.js'].lineData[10]++;
    moduleWrap = module;
  }
  _$jscoverage['/editor/render-xtpl.js'].lineData[12]++;
  var runBlockCommandUtil = utils.runBlockCommand, renderOutputUtil = utils.renderOutput, getPropertyUtil = utils.getProperty, runInlineCommandUtil = utils.runInlineCommand, getPropertyOrRunCommandUtil = utils.getPropertyOrRunCommand;
  _$jscoverage['/editor/render-xtpl.js'].lineData[17]++;
  buffer += '<div class="';
  _$jscoverage['/editor/render-xtpl.js'].lineData[18]++;
  var id0 = getPropertyOrRunCommandUtil(engine, scope, {}, "prefixCls", 0, 1);
  _$jscoverage['/editor/render-xtpl.js'].lineData[19]++;
  buffer += renderOutputUtil(id0, true);
  _$jscoverage['/editor/render-xtpl.js'].lineData[20]++;
  buffer += 'editor-tools"\n     id="ks-editor-tools-';
  _$jscoverage['/editor/render-xtpl.js'].lineData[21]++;
  var id1 = getPropertyOrRunCommandUtil(engine, scope, {}, "id", 0, 2);
  _$jscoverage['/editor/render-xtpl.js'].lineData[22]++;
  buffer += renderOutputUtil(id1, true);
  _$jscoverage['/editor/render-xtpl.js'].lineData[23]++;
  buffer += '">\n\n</div>\n\n<!--\nhttp://johanbrook.com/browsers/native-momentum-scrolling-ios-5/\nios \u4e0d\u80fd\u653e\u5728 iframe \u4e0a\uff01\n-->\n\n<div class="';
  _$jscoverage['/editor/render-xtpl.js'].lineData[24]++;
  var id2 = getPropertyOrRunCommandUtil(engine, scope, {}, "prefixCls", 0, 11);
  _$jscoverage['/editor/render-xtpl.js'].lineData[25]++;
  buffer += renderOutputUtil(id2, true);
  _$jscoverage['/editor/render-xtpl.js'].lineData[26]++;
  buffer += 'editor-textarea-wrap"\n\n';
  _$jscoverage['/editor/render-xtpl.js'].lineData[27]++;
  var config3 = {};
  _$jscoverage['/editor/render-xtpl.js'].lineData[28]++;
  var params4 = [];
  _$jscoverage['/editor/render-xtpl.js'].lineData[29]++;
  var id5 = getPropertyUtil(engine, scope, "mobile", 0, 13);
  _$jscoverage['/editor/render-xtpl.js'].lineData[30]++;
  params4.push(id5);
  _$jscoverage['/editor/render-xtpl.js'].lineData[31]++;
  config3.params = params4;
  _$jscoverage['/editor/render-xtpl.js'].lineData[32]++;
  config3.fn = function(scope) {
  _$jscoverage['/editor/render-xtpl.js'].functionData[2]++;
  _$jscoverage['/editor/render-xtpl.js'].lineData[33]++;
  var buffer = "";
  _$jscoverage['/editor/render-xtpl.js'].lineData[34]++;
  buffer += '\nstyle="overflow:scroll;-webkit-overflow-scrolling:touch;"\n';
  _$jscoverage['/editor/render-xtpl.js'].lineData[35]++;
  return buffer;
};
  _$jscoverage['/editor/render-xtpl.js'].lineData[37]++;
  buffer += runBlockCommandUtil(engine, scope, config3, "if", 13);
  _$jscoverage['/editor/render-xtpl.js'].lineData[38]++;
  buffer += '\n\nid="ks-editor-textarea-wrap-';
  _$jscoverage['/editor/render-xtpl.js'].lineData[39]++;
  var id6 = getPropertyOrRunCommandUtil(engine, scope, {}, "id", 0, 17);
  _$jscoverage['/editor/render-xtpl.js'].lineData[40]++;
  buffer += renderOutputUtil(id6, true);
  _$jscoverage['/editor/render-xtpl.js'].lineData[41]++;
  buffer += '"\n>\n\n<textarea\n        id="ks-editor-textarea-';
  _$jscoverage['/editor/render-xtpl.js'].lineData[42]++;
  var id7 = getPropertyOrRunCommandUtil(engine, scope, {}, "id", 0, 21);
  _$jscoverage['/editor/render-xtpl.js'].lineData[43]++;
  buffer += renderOutputUtil(id7, true);
  _$jscoverage['/editor/render-xtpl.js'].lineData[44]++;
  buffer += '"\n        class="';
  _$jscoverage['/editor/render-xtpl.js'].lineData[45]++;
  var id8 = getPropertyOrRunCommandUtil(engine, scope, {}, "prefixCls", 0, 22);
  _$jscoverage['/editor/render-xtpl.js'].lineData[46]++;
  buffer += renderOutputUtil(id8, true);
  _$jscoverage['/editor/render-xtpl.js'].lineData[47]++;
  buffer += 'editor-textarea"\n\n';
  _$jscoverage['/editor/render-xtpl.js'].lineData[48]++;
  var config9 = {};
  _$jscoverage['/editor/render-xtpl.js'].lineData[49]++;
  var params10 = [];
  _$jscoverage['/editor/render-xtpl.js'].lineData[50]++;
  var id11 = getPropertyUtil(engine, scope, "textareaAttrs", 0, 24);
  _$jscoverage['/editor/render-xtpl.js'].lineData[51]++;
  params10.push(id11);
  _$jscoverage['/editor/render-xtpl.js'].lineData[52]++;
  config9.params = params10;
  _$jscoverage['/editor/render-xtpl.js'].lineData[53]++;
  config9.fn = function(scope) {
  _$jscoverage['/editor/render-xtpl.js'].functionData[3]++;
  _$jscoverage['/editor/render-xtpl.js'].lineData[54]++;
  var buffer = "";
  _$jscoverage['/editor/render-xtpl.js'].lineData[55]++;
  buffer += '\n';
  _$jscoverage['/editor/render-xtpl.js'].lineData[56]++;
  var id12 = getPropertyOrRunCommandUtil(engine, scope, {}, "xindex", 0, 25);
  _$jscoverage['/editor/render-xtpl.js'].lineData[57]++;
  buffer += renderOutputUtil(id12, true);
  _$jscoverage['/editor/render-xtpl.js'].lineData[58]++;
  buffer += '="';
  _$jscoverage['/editor/render-xtpl.js'].lineData[59]++;
  var id13 = getPropertyOrRunCommandUtil(engine, scope, {}, ".", 0, 25);
  _$jscoverage['/editor/render-xtpl.js'].lineData[60]++;
  buffer += renderOutputUtil(id13, true);
  _$jscoverage['/editor/render-xtpl.js'].lineData[61]++;
  buffer += '"\n';
  _$jscoverage['/editor/render-xtpl.js'].lineData[62]++;
  return buffer;
};
  _$jscoverage['/editor/render-xtpl.js'].lineData[64]++;
  buffer += runBlockCommandUtil(engine, scope, config9, "each", 24);
  _$jscoverage['/editor/render-xtpl.js'].lineData[65]++;
  buffer += '\n\n';
  _$jscoverage['/editor/render-xtpl.js'].lineData[66]++;
  var config14 = {};
  _$jscoverage['/editor/render-xtpl.js'].lineData[67]++;
  var params15 = [];
  _$jscoverage['/editor/render-xtpl.js'].lineData[68]++;
  var id16 = getPropertyUtil(engine, scope, "mode", 0, 28);
  _$jscoverage['/editor/render-xtpl.js'].lineData[69]++;
  params15.push(id16);
  _$jscoverage['/editor/render-xtpl.js'].lineData[70]++;
  config14.params = params15;
  _$jscoverage['/editor/render-xtpl.js'].lineData[71]++;
  config14.fn = function(scope) {
  _$jscoverage['/editor/render-xtpl.js'].functionData[4]++;
  _$jscoverage['/editor/render-xtpl.js'].lineData[72]++;
  var buffer = "";
  _$jscoverage['/editor/render-xtpl.js'].lineData[73]++;
  buffer += '\nstyle="display:none"\n';
  _$jscoverage['/editor/render-xtpl.js'].lineData[74]++;
  return buffer;
};
  _$jscoverage['/editor/render-xtpl.js'].lineData[76]++;
  buffer += runBlockCommandUtil(engine, scope, config14, "if", 28);
  _$jscoverage['/editor/render-xtpl.js'].lineData[77]++;
  buffer += '\n\n>';
  _$jscoverage['/editor/render-xtpl.js'].lineData[78]++;
  var id17 = getPropertyOrRunCommandUtil(engine, scope, {}, "data", 0, 32);
  _$jscoverage['/editor/render-xtpl.js'].lineData[79]++;
  buffer += renderOutputUtil(id17, true);
  _$jscoverage['/editor/render-xtpl.js'].lineData[80]++;
  buffer += '</textarea>\n\n</div>\n\n<div class="';
  _$jscoverage['/editor/render-xtpl.js'].lineData[81]++;
  var id18 = getPropertyOrRunCommandUtil(engine, scope, {}, "prefixCls", 0, 36);
  _$jscoverage['/editor/render-xtpl.js'].lineData[82]++;
  buffer += renderOutputUtil(id18, true);
  _$jscoverage['/editor/render-xtpl.js'].lineData[83]++;
  buffer += 'editor-status"\n     id="ks-editor-status-';
  _$jscoverage['/editor/render-xtpl.js'].lineData[84]++;
  var id19 = getPropertyOrRunCommandUtil(engine, scope, {}, "id", 0, 37);
  _$jscoverage['/editor/render-xtpl.js'].lineData[85]++;
  buffer += renderOutputUtil(id19, true);
  _$jscoverage['/editor/render-xtpl.js'].lineData[86]++;
  buffer += '">\n\n</div>';
  _$jscoverage['/editor/render-xtpl.js'].lineData[87]++;
  return buffer;
};
});
