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
  _$jscoverage['/editor/render-xtpl.js'].lineData[8] = 0;
  _$jscoverage['/editor/render-xtpl.js'].lineData[9] = 0;
  _$jscoverage['/editor/render-xtpl.js'].lineData[11] = 0;
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
  _$jscoverage['/editor/render-xtpl.js'].lineData[35] = 0;
  _$jscoverage['/editor/render-xtpl.js'].lineData[36] = 0;
  _$jscoverage['/editor/render-xtpl.js'].lineData[37] = 0;
  _$jscoverage['/editor/render-xtpl.js'].lineData[38] = 0;
  _$jscoverage['/editor/render-xtpl.js'].lineData[39] = 0;
  _$jscoverage['/editor/render-xtpl.js'].lineData[41] = 0;
  _$jscoverage['/editor/render-xtpl.js'].lineData[43] = 0;
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
  _$jscoverage['/editor/render-xtpl.js'].lineData[59] = 0;
  _$jscoverage['/editor/render-xtpl.js'].lineData[60] = 0;
  _$jscoverage['/editor/render-xtpl.js'].lineData[61] = 0;
  _$jscoverage['/editor/render-xtpl.js'].lineData[62] = 0;
  _$jscoverage['/editor/render-xtpl.js'].lineData[63] = 0;
  _$jscoverage['/editor/render-xtpl.js'].lineData[65] = 0;
  _$jscoverage['/editor/render-xtpl.js'].lineData[66] = 0;
  _$jscoverage['/editor/render-xtpl.js'].lineData[67] = 0;
  _$jscoverage['/editor/render-xtpl.js'].lineData[68] = 0;
  _$jscoverage['/editor/render-xtpl.js'].lineData[69] = 0;
  _$jscoverage['/editor/render-xtpl.js'].lineData[70] = 0;
  _$jscoverage['/editor/render-xtpl.js'].lineData[71] = 0;
  _$jscoverage['/editor/render-xtpl.js'].lineData[73] = 0;
  _$jscoverage['/editor/render-xtpl.js'].lineData[75] = 0;
  _$jscoverage['/editor/render-xtpl.js'].lineData[76] = 0;
  _$jscoverage['/editor/render-xtpl.js'].lineData[77] = 0;
  _$jscoverage['/editor/render-xtpl.js'].lineData[80] = 0;
  _$jscoverage['/editor/render-xtpl.js'].lineData[81] = 0;
  _$jscoverage['/editor/render-xtpl.js'].lineData[82] = 0;
  _$jscoverage['/editor/render-xtpl.js'].lineData[83] = 0;
  _$jscoverage['/editor/render-xtpl.js'].lineData[84] = 0;
  _$jscoverage['/editor/render-xtpl.js'].lineData[86] = 0;
  _$jscoverage['/editor/render-xtpl.js'].lineData[88] = 0;
  _$jscoverage['/editor/render-xtpl.js'].lineData[90] = 0;
  _$jscoverage['/editor/render-xtpl.js'].lineData[91] = 0;
  _$jscoverage['/editor/render-xtpl.js'].lineData[92] = 0;
  _$jscoverage['/editor/render-xtpl.js'].lineData[93] = 0;
  _$jscoverage['/editor/render-xtpl.js'].lineData[94] = 0;
  _$jscoverage['/editor/render-xtpl.js'].lineData[95] = 0;
  _$jscoverage['/editor/render-xtpl.js'].lineData[96] = 0;
  _$jscoverage['/editor/render-xtpl.js'].lineData[97] = 0;
  _$jscoverage['/editor/render-xtpl.js'].lineData[98] = 0;
  _$jscoverage['/editor/render-xtpl.js'].lineData[99] = 0;
  _$jscoverage['/editor/render-xtpl.js'].lineData[100] = 0;
  _$jscoverage['/editor/render-xtpl.js'].lineData[101] = 0;
  _$jscoverage['/editor/render-xtpl.js'].lineData[103] = 0;
  _$jscoverage['/editor/render-xtpl.js'].lineData[104] = 0;
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
  _$jscoverage['/editor/render-xtpl.js'].branchData['8'] = [];
  _$jscoverage['/editor/render-xtpl.js'].branchData['8'][1] = new BranchData();
}
_$jscoverage['/editor/render-xtpl.js'].branchData['8'][1].init(142, 20, '"1.50" !== S.version');
function visit626_8_1(result) {
  _$jscoverage['/editor/render-xtpl.js'].branchData['8'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/render-xtpl.js'].lineData[2]++;
KISSY.add(function(S, require, exports, module) {
  _$jscoverage['/editor/render-xtpl.js'].functionData[0]++;
  _$jscoverage['/editor/render-xtpl.js'].lineData[4]++;
  var t = function(scope, buffer, payload, undefined) {
  _$jscoverage['/editor/render-xtpl.js'].functionData[1]++;
  _$jscoverage['/editor/render-xtpl.js'].lineData[5]++;
  var engine = this, nativeCommands = engine.nativeCommands, utils = engine.utils;
  _$jscoverage['/editor/render-xtpl.js'].lineData[8]++;
  if (visit626_8_1("1.50" !== S.version)) {
    _$jscoverage['/editor/render-xtpl.js'].lineData[9]++;
    throw new Error("current xtemplate file(" + engine.name + ")(v1.50) need to be recompiled using current kissy(v" + S.version + ")!");
  }
  _$jscoverage['/editor/render-xtpl.js'].lineData[11]++;
  var callCommandUtil = utils.callCommand, eachCommand = nativeCommands.each, withCommand = nativeCommands["with"], ifCommand = nativeCommands["if"], setCommand = nativeCommands.set, includeCommand = nativeCommands.include, parseCommand = nativeCommands.parse, extendCommand = nativeCommands.extend, blockCommand = nativeCommands.block, macroCommand = nativeCommands.macro, debuggerCommand = nativeCommands["debugger"];
  _$jscoverage['/editor/render-xtpl.js'].lineData[22]++;
  buffer.write('<div class="');
  _$jscoverage['/editor/render-xtpl.js'].lineData[23]++;
  var id0 = scope.resolve(["prefixCls"]);
  _$jscoverage['/editor/render-xtpl.js'].lineData[24]++;
  buffer.write(id0, true);
  _$jscoverage['/editor/render-xtpl.js'].lineData[25]++;
  buffer.write('editor-tools"\n     id="ks-editor-tools-');
  _$jscoverage['/editor/render-xtpl.js'].lineData[26]++;
  var id1 = scope.resolve(["id"]);
  _$jscoverage['/editor/render-xtpl.js'].lineData[27]++;
  buffer.write(id1, true);
  _$jscoverage['/editor/render-xtpl.js'].lineData[28]++;
  buffer.write('">\n\n</div>\n\n<!--\nhttp://johanbrook.com/browsers/native-momentum-scrolling-ios-5/\nios \u4e0d\u80fd\u653e\u5728 iframe \u4e0a\uff01\n-->\n\n<div class="');
  _$jscoverage['/editor/render-xtpl.js'].lineData[29]++;
  var id2 = scope.resolve(["prefixCls"]);
  _$jscoverage['/editor/render-xtpl.js'].lineData[30]++;
  buffer.write(id2, true);
  _$jscoverage['/editor/render-xtpl.js'].lineData[31]++;
  buffer.write('editor-textarea-wrap"\n\n');
  _$jscoverage['/editor/render-xtpl.js'].lineData[32]++;
  var option3 = {
  escape: 1};
  _$jscoverage['/editor/render-xtpl.js'].lineData[35]++;
  var params4 = [];
  _$jscoverage['/editor/render-xtpl.js'].lineData[36]++;
  var id5 = scope.resolve(["mobile"]);
  _$jscoverage['/editor/render-xtpl.js'].lineData[37]++;
  params4.push(id5);
  _$jscoverage['/editor/render-xtpl.js'].lineData[38]++;
  option3.params = params4;
  _$jscoverage['/editor/render-xtpl.js'].lineData[39]++;
  option3.fn = function(scope, buffer) {
  _$jscoverage['/editor/render-xtpl.js'].functionData[2]++;
  _$jscoverage['/editor/render-xtpl.js'].lineData[41]++;
  buffer.write('\nstyle="overflow:scroll;-webkit-overflow-scrolling:touch;"\n');
  _$jscoverage['/editor/render-xtpl.js'].lineData[43]++;
  return buffer;
};
  _$jscoverage['/editor/render-xtpl.js'].lineData[45]++;
  buffer = ifCommand.call(engine, scope, option3, buffer, 13, payload);
  _$jscoverage['/editor/render-xtpl.js'].lineData[46]++;
  buffer.write('\n\nid="ks-editor-textarea-wrap-');
  _$jscoverage['/editor/render-xtpl.js'].lineData[47]++;
  var id6 = scope.resolve(["id"]);
  _$jscoverage['/editor/render-xtpl.js'].lineData[48]++;
  buffer.write(id6, true);
  _$jscoverage['/editor/render-xtpl.js'].lineData[49]++;
  buffer.write('"\n>\n\n<textarea\n        id="ks-editor-textarea-');
  _$jscoverage['/editor/render-xtpl.js'].lineData[50]++;
  var id7 = scope.resolve(["id"]);
  _$jscoverage['/editor/render-xtpl.js'].lineData[51]++;
  buffer.write(id7, true);
  _$jscoverage['/editor/render-xtpl.js'].lineData[52]++;
  buffer.write('"\n        class="');
  _$jscoverage['/editor/render-xtpl.js'].lineData[53]++;
  var id8 = scope.resolve(["prefixCls"]);
  _$jscoverage['/editor/render-xtpl.js'].lineData[54]++;
  buffer.write(id8, true);
  _$jscoverage['/editor/render-xtpl.js'].lineData[55]++;
  buffer.write('editor-textarea"\n\n');
  _$jscoverage['/editor/render-xtpl.js'].lineData[56]++;
  var option9 = {
  escape: 1};
  _$jscoverage['/editor/render-xtpl.js'].lineData[59]++;
  var params10 = [];
  _$jscoverage['/editor/render-xtpl.js'].lineData[60]++;
  var id11 = scope.resolve(["textareaAttrs"]);
  _$jscoverage['/editor/render-xtpl.js'].lineData[61]++;
  params10.push(id11);
  _$jscoverage['/editor/render-xtpl.js'].lineData[62]++;
  option9.params = params10;
  _$jscoverage['/editor/render-xtpl.js'].lineData[63]++;
  option9.fn = function(scope, buffer) {
  _$jscoverage['/editor/render-xtpl.js'].functionData[3]++;
  _$jscoverage['/editor/render-xtpl.js'].lineData[65]++;
  buffer.write('\n');
  _$jscoverage['/editor/render-xtpl.js'].lineData[66]++;
  var id12 = scope.resolve(["xindex"]);
  _$jscoverage['/editor/render-xtpl.js'].lineData[67]++;
  buffer.write(id12, true);
  _$jscoverage['/editor/render-xtpl.js'].lineData[68]++;
  buffer.write('="');
  _$jscoverage['/editor/render-xtpl.js'].lineData[69]++;
  var id13 = scope.resolve(["this"]);
  _$jscoverage['/editor/render-xtpl.js'].lineData[70]++;
  buffer.write(id13, true);
  _$jscoverage['/editor/render-xtpl.js'].lineData[71]++;
  buffer.write('"\n');
  _$jscoverage['/editor/render-xtpl.js'].lineData[73]++;
  return buffer;
};
  _$jscoverage['/editor/render-xtpl.js'].lineData[75]++;
  buffer = eachCommand.call(engine, scope, option9, buffer, 24, payload);
  _$jscoverage['/editor/render-xtpl.js'].lineData[76]++;
  buffer.write('\n\n');
  _$jscoverage['/editor/render-xtpl.js'].lineData[77]++;
  var option14 = {
  escape: 1};
  _$jscoverage['/editor/render-xtpl.js'].lineData[80]++;
  var params15 = [];
  _$jscoverage['/editor/render-xtpl.js'].lineData[81]++;
  var id16 = scope.resolve(["mode"]);
  _$jscoverage['/editor/render-xtpl.js'].lineData[82]++;
  params15.push(id16);
  _$jscoverage['/editor/render-xtpl.js'].lineData[83]++;
  option14.params = params15;
  _$jscoverage['/editor/render-xtpl.js'].lineData[84]++;
  option14.fn = function(scope, buffer) {
  _$jscoverage['/editor/render-xtpl.js'].functionData[4]++;
  _$jscoverage['/editor/render-xtpl.js'].lineData[86]++;
  buffer.write('\nstyle="display:none"\n');
  _$jscoverage['/editor/render-xtpl.js'].lineData[88]++;
  return buffer;
};
  _$jscoverage['/editor/render-xtpl.js'].lineData[90]++;
  buffer = ifCommand.call(engine, scope, option14, buffer, 28, payload);
  _$jscoverage['/editor/render-xtpl.js'].lineData[91]++;
  buffer.write('\n\n>');
  _$jscoverage['/editor/render-xtpl.js'].lineData[92]++;
  var id17 = scope.resolve(["data"]);
  _$jscoverage['/editor/render-xtpl.js'].lineData[93]++;
  buffer.write(id17, true);
  _$jscoverage['/editor/render-xtpl.js'].lineData[94]++;
  buffer.write('</textarea>\n\n</div>\n\n<div class="');
  _$jscoverage['/editor/render-xtpl.js'].lineData[95]++;
  var id18 = scope.resolve(["prefixCls"]);
  _$jscoverage['/editor/render-xtpl.js'].lineData[96]++;
  buffer.write(id18, true);
  _$jscoverage['/editor/render-xtpl.js'].lineData[97]++;
  buffer.write('editor-status"\n     id="ks-editor-status-');
  _$jscoverage['/editor/render-xtpl.js'].lineData[98]++;
  var id19 = scope.resolve(["id"]);
  _$jscoverage['/editor/render-xtpl.js'].lineData[99]++;
  buffer.write(id19, true);
  _$jscoverage['/editor/render-xtpl.js'].lineData[100]++;
  buffer.write('">\n\n</div>');
  _$jscoverage['/editor/render-xtpl.js'].lineData[101]++;
  return buffer;
};
  _$jscoverage['/editor/render-xtpl.js'].lineData[103]++;
  t.TPL_NAME = module.name;
  _$jscoverage['/editor/render-xtpl.js'].lineData[104]++;
  return t;
});
