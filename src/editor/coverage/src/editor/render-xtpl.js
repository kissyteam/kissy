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
  _$jscoverage['/editor/render-xtpl.js'].lineData[32] = 0;
  _$jscoverage['/editor/render-xtpl.js'].lineData[33] = 0;
  _$jscoverage['/editor/render-xtpl.js'].lineData[34] = 0;
  _$jscoverage['/editor/render-xtpl.js'].lineData[35] = 0;
  _$jscoverage['/editor/render-xtpl.js'].lineData[36] = 0;
  _$jscoverage['/editor/render-xtpl.js'].lineData[38] = 0;
  _$jscoverage['/editor/render-xtpl.js'].lineData[40] = 0;
  _$jscoverage['/editor/render-xtpl.js'].lineData[42] = 0;
  _$jscoverage['/editor/render-xtpl.js'].lineData[43] = 0;
  _$jscoverage['/editor/render-xtpl.js'].lineData[44] = 0;
  _$jscoverage['/editor/render-xtpl.js'].lineData[45] = 0;
  _$jscoverage['/editor/render-xtpl.js'].lineData[46] = 0;
  _$jscoverage['/editor/render-xtpl.js'].lineData[47] = 0;
  _$jscoverage['/editor/render-xtpl.js'].lineData[50] = 0;
  _$jscoverage['/editor/render-xtpl.js'].lineData[51] = 0;
  _$jscoverage['/editor/render-xtpl.js'].lineData[52] = 0;
  _$jscoverage['/editor/render-xtpl.js'].lineData[53] = 0;
  _$jscoverage['/editor/render-xtpl.js'].lineData[54] = 0;
  _$jscoverage['/editor/render-xtpl.js'].lineData[56] = 0;
  _$jscoverage['/editor/render-xtpl.js'].lineData[57] = 0;
  _$jscoverage['/editor/render-xtpl.js'].lineData[58] = 0;
  _$jscoverage['/editor/render-xtpl.js'].lineData[59] = 0;
  _$jscoverage['/editor/render-xtpl.js'].lineData[60] = 0;
  _$jscoverage['/editor/render-xtpl.js'].lineData[61] = 0;
  _$jscoverage['/editor/render-xtpl.js'].lineData[62] = 0;
  _$jscoverage['/editor/render-xtpl.js'].lineData[64] = 0;
  _$jscoverage['/editor/render-xtpl.js'].lineData[66] = 0;
  _$jscoverage['/editor/render-xtpl.js'].lineData[67] = 0;
  _$jscoverage['/editor/render-xtpl.js'].lineData[68] = 0;
  _$jscoverage['/editor/render-xtpl.js'].lineData[71] = 0;
  _$jscoverage['/editor/render-xtpl.js'].lineData[72] = 0;
  _$jscoverage['/editor/render-xtpl.js'].lineData[73] = 0;
  _$jscoverage['/editor/render-xtpl.js'].lineData[74] = 0;
  _$jscoverage['/editor/render-xtpl.js'].lineData[75] = 0;
  _$jscoverage['/editor/render-xtpl.js'].lineData[77] = 0;
  _$jscoverage['/editor/render-xtpl.js'].lineData[79] = 0;
  _$jscoverage['/editor/render-xtpl.js'].lineData[81] = 0;
  _$jscoverage['/editor/render-xtpl.js'].lineData[82] = 0;
  _$jscoverage['/editor/render-xtpl.js'].lineData[83] = 0;
  _$jscoverage['/editor/render-xtpl.js'].lineData[84] = 0;
  _$jscoverage['/editor/render-xtpl.js'].lineData[85] = 0;
  _$jscoverage['/editor/render-xtpl.js'].lineData[86] = 0;
  _$jscoverage['/editor/render-xtpl.js'].lineData[87] = 0;
  _$jscoverage['/editor/render-xtpl.js'].lineData[88] = 0;
  _$jscoverage['/editor/render-xtpl.js'].lineData[89] = 0;
  _$jscoverage['/editor/render-xtpl.js'].lineData[91] = 0;
  _$jscoverage['/editor/render-xtpl.js'].lineData[92] = 0;
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
_$jscoverage['/editor/render-xtpl.js'].branchData['8'][1].init(142, 21, '"5.0.0" !== S.version');
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
  if (visit626_8_1("5.0.0" !== S.version)) {
    _$jscoverage['/editor/render-xtpl.js'].lineData[9]++;
    throw new Error("current xtemplate file(" + engine.name + ")(v5.0.0) need to be recompiled using current kissy(v" + S.version + ")!");
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
  buffer.write('editor-tools">\r\n\r\n</div>\r\n\r\n<!--\r\nhttp://johanbrook.com/browsers/native-momentum-scrolling-ios-5/\r\nios \u4e0d\u80fd\u653e\u5728 iframe \u4e0a\uff01\r\n-->\r\n\r\n<div class="');
  _$jscoverage['/editor/render-xtpl.js'].lineData[26]++;
  var id1 = scope.resolve(["prefixCls"]);
  _$jscoverage['/editor/render-xtpl.js'].lineData[27]++;
  buffer.write(id1, true);
  _$jscoverage['/editor/render-xtpl.js'].lineData[28]++;
  buffer.write('editor-textarea-wrap"\r\n\r\n');
  _$jscoverage['/editor/render-xtpl.js'].lineData[29]++;
  var option2 = {
  escape: 1};
  _$jscoverage['/editor/render-xtpl.js'].lineData[32]++;
  var params3 = [];
  _$jscoverage['/editor/render-xtpl.js'].lineData[33]++;
  var id4 = scope.resolve(["mobile"]);
  _$jscoverage['/editor/render-xtpl.js'].lineData[34]++;
  params3.push(id4);
  _$jscoverage['/editor/render-xtpl.js'].lineData[35]++;
  option2.params = params3;
  _$jscoverage['/editor/render-xtpl.js'].lineData[36]++;
  option2.fn = function(scope, buffer) {
  _$jscoverage['/editor/render-xtpl.js'].functionData[2]++;
  _$jscoverage['/editor/render-xtpl.js'].lineData[38]++;
  buffer.write('\r\nstyle="overflow:scroll;-webkit-overflow-scrolling:touch;"\r\n');
  _$jscoverage['/editor/render-xtpl.js'].lineData[40]++;
  return buffer;
};
  _$jscoverage['/editor/render-xtpl.js'].lineData[42]++;
  buffer = ifCommand.call(engine, scope, option2, buffer, 12, payload);
  _$jscoverage['/editor/render-xtpl.js'].lineData[43]++;
  buffer.write('\r\n>\r\n\r\n<textarea class="');
  _$jscoverage['/editor/render-xtpl.js'].lineData[44]++;
  var id5 = scope.resolve(["prefixCls"]);
  _$jscoverage['/editor/render-xtpl.js'].lineData[45]++;
  buffer.write(id5, true);
  _$jscoverage['/editor/render-xtpl.js'].lineData[46]++;
  buffer.write('editor-textarea"\r\n\r\n');
  _$jscoverage['/editor/render-xtpl.js'].lineData[47]++;
  var option6 = {
  escape: 1};
  _$jscoverage['/editor/render-xtpl.js'].lineData[50]++;
  var params7 = [];
  _$jscoverage['/editor/render-xtpl.js'].lineData[51]++;
  var id8 = scope.resolve(["textareaAttrs"]);
  _$jscoverage['/editor/render-xtpl.js'].lineData[52]++;
  params7.push(id8);
  _$jscoverage['/editor/render-xtpl.js'].lineData[53]++;
  option6.params = params7;
  _$jscoverage['/editor/render-xtpl.js'].lineData[54]++;
  option6.fn = function(scope, buffer) {
  _$jscoverage['/editor/render-xtpl.js'].functionData[3]++;
  _$jscoverage['/editor/render-xtpl.js'].lineData[56]++;
  buffer.write('\r\n');
  _$jscoverage['/editor/render-xtpl.js'].lineData[57]++;
  var id9 = scope.resolve(["xindex"]);
  _$jscoverage['/editor/render-xtpl.js'].lineData[58]++;
  buffer.write(id9, true);
  _$jscoverage['/editor/render-xtpl.js'].lineData[59]++;
  buffer.write('="');
  _$jscoverage['/editor/render-xtpl.js'].lineData[60]++;
  var id10 = scope.resolve(["this"]);
  _$jscoverage['/editor/render-xtpl.js'].lineData[61]++;
  buffer.write(id10, true);
  _$jscoverage['/editor/render-xtpl.js'].lineData[62]++;
  buffer.write('"\r\n');
  _$jscoverage['/editor/render-xtpl.js'].lineData[64]++;
  return buffer;
};
  _$jscoverage['/editor/render-xtpl.js'].lineData[66]++;
  buffer = eachCommand.call(engine, scope, option6, buffer, 19, payload);
  _$jscoverage['/editor/render-xtpl.js'].lineData[67]++;
  buffer.write('\r\n\r\n');
  _$jscoverage['/editor/render-xtpl.js'].lineData[68]++;
  var option11 = {
  escape: 1};
  _$jscoverage['/editor/render-xtpl.js'].lineData[71]++;
  var params12 = [];
  _$jscoverage['/editor/render-xtpl.js'].lineData[72]++;
  var id13 = scope.resolve(["mode"]);
  _$jscoverage['/editor/render-xtpl.js'].lineData[73]++;
  params12.push(id13);
  _$jscoverage['/editor/render-xtpl.js'].lineData[74]++;
  option11.params = params12;
  _$jscoverage['/editor/render-xtpl.js'].lineData[75]++;
  option11.fn = function(scope, buffer) {
  _$jscoverage['/editor/render-xtpl.js'].functionData[4]++;
  _$jscoverage['/editor/render-xtpl.js'].lineData[77]++;
  buffer.write('\r\nstyle="display:none"\r\n');
  _$jscoverage['/editor/render-xtpl.js'].lineData[79]++;
  return buffer;
};
  _$jscoverage['/editor/render-xtpl.js'].lineData[81]++;
  buffer = ifCommand.call(engine, scope, option11, buffer, 23, payload);
  _$jscoverage['/editor/render-xtpl.js'].lineData[82]++;
  buffer.write('\r\n\r\n>');
  _$jscoverage['/editor/render-xtpl.js'].lineData[83]++;
  var id14 = scope.resolve(["data"]);
  _$jscoverage['/editor/render-xtpl.js'].lineData[84]++;
  buffer.write(id14, true);
  _$jscoverage['/editor/render-xtpl.js'].lineData[85]++;
  buffer.write('</textarea>\r\n\r\n</div>\r\n\r\n<div class="');
  _$jscoverage['/editor/render-xtpl.js'].lineData[86]++;
  var id15 = scope.resolve(["prefixCls"]);
  _$jscoverage['/editor/render-xtpl.js'].lineData[87]++;
  buffer.write(id15, true);
  _$jscoverage['/editor/render-xtpl.js'].lineData[88]++;
  buffer.write('editor-status">\r\n\r\n</div>');
  _$jscoverage['/editor/render-xtpl.js'].lineData[89]++;
  return buffer;
};
  _$jscoverage['/editor/render-xtpl.js'].lineData[91]++;
  t.TPL_NAME = module.name;
  _$jscoverage['/editor/render-xtpl.js'].lineData[92]++;
  return t;
});
