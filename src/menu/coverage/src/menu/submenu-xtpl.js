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
if (! _$jscoverage['/menu/submenu-xtpl.js']) {
  _$jscoverage['/menu/submenu-xtpl.js'] = {};
  _$jscoverage['/menu/submenu-xtpl.js'].lineData = [];
  _$jscoverage['/menu/submenu-xtpl.js'].lineData[2] = 0;
  _$jscoverage['/menu/submenu-xtpl.js'].lineData[4] = 0;
  _$jscoverage['/menu/submenu-xtpl.js'].lineData[5] = 0;
  _$jscoverage['/menu/submenu-xtpl.js'].lineData[8] = 0;
  _$jscoverage['/menu/submenu-xtpl.js'].lineData[20] = 0;
  _$jscoverage['/menu/submenu-xtpl.js'].lineData[21] = 0;
  _$jscoverage['/menu/submenu-xtpl.js'].lineData[24] = 0;
  _$jscoverage['/menu/submenu-xtpl.js'].lineData[25] = 0;
  _$jscoverage['/menu/submenu-xtpl.js'].lineData[26] = 0;
  _$jscoverage['/menu/submenu-xtpl.js'].lineData[27] = 0;
  _$jscoverage['/menu/submenu-xtpl.js'].lineData[28] = 0;
  _$jscoverage['/menu/submenu-xtpl.js'].lineData[29] = 0;
  _$jscoverage['/menu/submenu-xtpl.js'].lineData[30] = 0;
  _$jscoverage['/menu/submenu-xtpl.js'].lineData[31] = 0;
  _$jscoverage['/menu/submenu-xtpl.js'].lineData[33] = 0;
  _$jscoverage['/menu/submenu-xtpl.js'].lineData[34] = 0;
  _$jscoverage['/menu/submenu-xtpl.js'].lineData[35] = 0;
  _$jscoverage['/menu/submenu-xtpl.js'].lineData[36] = 0;
  _$jscoverage['/menu/submenu-xtpl.js'].lineData[37] = 0;
  _$jscoverage['/menu/submenu-xtpl.js'].lineData[38] = 0;
  _$jscoverage['/menu/submenu-xtpl.js'].lineData[39] = 0;
  _$jscoverage['/menu/submenu-xtpl.js'].lineData[40] = 0;
  _$jscoverage['/menu/submenu-xtpl.js'].lineData[41] = 0;
  _$jscoverage['/menu/submenu-xtpl.js'].lineData[43] = 0;
  _$jscoverage['/menu/submenu-xtpl.js'].lineData[44] = 0;
  _$jscoverage['/menu/submenu-xtpl.js'].lineData[45] = 0;
}
if (! _$jscoverage['/menu/submenu-xtpl.js'].functionData) {
  _$jscoverage['/menu/submenu-xtpl.js'].functionData = [];
  _$jscoverage['/menu/submenu-xtpl.js'].functionData[0] = 0;
  _$jscoverage['/menu/submenu-xtpl.js'].functionData[1] = 0;
}
if (! _$jscoverage['/menu/submenu-xtpl.js'].branchData) {
  _$jscoverage['/menu/submenu-xtpl.js'].branchData = {};
  _$jscoverage['/menu/submenu-xtpl.js'].branchData['29'] = [];
  _$jscoverage['/menu/submenu-xtpl.js'].branchData['29'][1] = new BranchData();
}
_$jscoverage['/menu/submenu-xtpl.js'].branchData['29'][1].init(1140, 29, 'callRet2 && callRet2.isBuffer');
function visit42_29_1(result) {
  _$jscoverage['/menu/submenu-xtpl.js'].branchData['29'][1].ranCondition(result);
  return result;
}_$jscoverage['/menu/submenu-xtpl.js'].lineData[2]++;
KISSY.add(function(S, require, exports, module) {
  _$jscoverage['/menu/submenu-xtpl.js'].functionData[0]++;
  _$jscoverage['/menu/submenu-xtpl.js'].lineData[4]++;
  var submenu = function(scope, buffer, undefined) {
  _$jscoverage['/menu/submenu-xtpl.js'].functionData[1]++;
  _$jscoverage['/menu/submenu-xtpl.js'].lineData[5]++;
  var tpl = this, nativeCommands = tpl.root.nativeCommands, utils = tpl.root.utils;
  _$jscoverage['/menu/submenu-xtpl.js'].lineData[8]++;
  var callFnUtil = utils["callFn"], callCommandUtil = utils["callCommand"], eachCommand = nativeCommands["each"], withCommand = nativeCommands["with"], ifCommand = nativeCommands["if"], setCommand = nativeCommands["set"], includeCommand = nativeCommands["include"], parseCommand = nativeCommands["parse"], extendCommand = nativeCommands["extend"], blockCommand = nativeCommands["block"], macroCommand = nativeCommands["macro"], debuggerCommand = nativeCommands["debugger"];
  _$jscoverage['/menu/submenu-xtpl.js'].lineData[20]++;
  buffer.write('<div class="', 0);
  _$jscoverage['/menu/submenu-xtpl.js'].lineData[21]++;
  var option0 = {
  escape: 1};
  _$jscoverage['/menu/submenu-xtpl.js'].lineData[24]++;
  var params1 = [];
  _$jscoverage['/menu/submenu-xtpl.js'].lineData[25]++;
  params1.push('content');
  _$jscoverage['/menu/submenu-xtpl.js'].lineData[26]++;
  option0.params = params1;
  _$jscoverage['/menu/submenu-xtpl.js'].lineData[27]++;
  var callRet2;
  _$jscoverage['/menu/submenu-xtpl.js'].lineData[28]++;
  callRet2 = callFnUtil(tpl, scope, option0, buffer, ["getBaseCssClasses"], 0, 1);
  _$jscoverage['/menu/submenu-xtpl.js'].lineData[29]++;
  if (visit42_29_1(callRet2 && callRet2.isBuffer)) {
    _$jscoverage['/menu/submenu-xtpl.js'].lineData[30]++;
    buffer = callRet2;
    _$jscoverage['/menu/submenu-xtpl.js'].lineData[31]++;
    callRet2 = undefined;
  }
  _$jscoverage['/menu/submenu-xtpl.js'].lineData[33]++;
  buffer.write(callRet2, true);
  _$jscoverage['/menu/submenu-xtpl.js'].lineData[34]++;
  buffer.write('">', 0);
  _$jscoverage['/menu/submenu-xtpl.js'].lineData[35]++;
  var id3 = scope.resolve(["content"], 0);
  _$jscoverage['/menu/submenu-xtpl.js'].lineData[36]++;
  buffer.write(id3, false);
  _$jscoverage['/menu/submenu-xtpl.js'].lineData[37]++;
  buffer.write('</div>\r\n<span class="', 0);
  _$jscoverage['/menu/submenu-xtpl.js'].lineData[38]++;
  var id4 = scope.resolve(["prefixCls"], 0);
  _$jscoverage['/menu/submenu-xtpl.js'].lineData[39]++;
  buffer.write(id4, true);
  _$jscoverage['/menu/submenu-xtpl.js'].lineData[40]++;
  buffer.write('submenu-arrow">\u25ba</span>', 0);
  _$jscoverage['/menu/submenu-xtpl.js'].lineData[41]++;
  return buffer;
};
  _$jscoverage['/menu/submenu-xtpl.js'].lineData[43]++;
  submenu.TPL_NAME = module.name;
  _$jscoverage['/menu/submenu-xtpl.js'].lineData[44]++;
  submenu.version = "5.0.0";
  _$jscoverage['/menu/submenu-xtpl.js'].lineData[45]++;
  return submenu;
});
