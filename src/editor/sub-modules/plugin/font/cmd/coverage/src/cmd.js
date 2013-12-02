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
if (! _$jscoverage['/cmd.js']) {
  _$jscoverage['/cmd.js'] = {};
  _$jscoverage['/cmd.js'].lineData = [];
  _$jscoverage['/cmd.js'].lineData[6] = 0;
  _$jscoverage['/cmd.js'].lineData[7] = 0;
  _$jscoverage['/cmd.js'].lineData[8] = 0;
  _$jscoverage['/cmd.js'].lineData[10] = 0;
  _$jscoverage['/cmd.js'].lineData[11] = 0;
  _$jscoverage['/cmd.js'].lineData[12] = 0;
  _$jscoverage['/cmd.js'].lineData[13] = 0;
  _$jscoverage['/cmd.js'].lineData[15] = 0;
  _$jscoverage['/cmd.js'].lineData[16] = 0;
  _$jscoverage['/cmd.js'].lineData[17] = 0;
  _$jscoverage['/cmd.js'].lineData[18] = 0;
  _$jscoverage['/cmd.js'].lineData[21] = 0;
  _$jscoverage['/cmd.js'].lineData[22] = 0;
  _$jscoverage['/cmd.js'].lineData[23] = 0;
  _$jscoverage['/cmd.js'].lineData[24] = 0;
  _$jscoverage['/cmd.js'].lineData[25] = 0;
  _$jscoverage['/cmd.js'].lineData[27] = 0;
  _$jscoverage['/cmd.js'].lineData[28] = 0;
  _$jscoverage['/cmd.js'].lineData[29] = 0;
  _$jscoverage['/cmd.js'].lineData[30] = 0;
  _$jscoverage['/cmd.js'].lineData[34] = 0;
  _$jscoverage['/cmd.js'].lineData[37] = 0;
  _$jscoverage['/cmd.js'].lineData[38] = 0;
  _$jscoverage['/cmd.js'].lineData[42] = 0;
  _$jscoverage['/cmd.js'].lineData[43] = 0;
  _$jscoverage['/cmd.js'].lineData[44] = 0;
  _$jscoverage['/cmd.js'].lineData[46] = 0;
  _$jscoverage['/cmd.js'].lineData[48] = 0;
  _$jscoverage['/cmd.js'].lineData[49] = 0;
  _$jscoverage['/cmd.js'].lineData[50] = 0;
  _$jscoverage['/cmd.js'].lineData[53] = 0;
  _$jscoverage['/cmd.js'].lineData[56] = 0;
  _$jscoverage['/cmd.js'].lineData[58] = 0;
  _$jscoverage['/cmd.js'].lineData[59] = 0;
  _$jscoverage['/cmd.js'].lineData[60] = 0;
  _$jscoverage['/cmd.js'].lineData[62] = 0;
  _$jscoverage['/cmd.js'].lineData[63] = 0;
  _$jscoverage['/cmd.js'].lineData[64] = 0;
  _$jscoverage['/cmd.js'].lineData[65] = 0;
  _$jscoverage['/cmd.js'].lineData[66] = 0;
  _$jscoverage['/cmd.js'].lineData[68] = 0;
  _$jscoverage['/cmd.js'].lineData[70] = 0;
  _$jscoverage['/cmd.js'].lineData[71] = 0;
  _$jscoverage['/cmd.js'].lineData[75] = 0;
  _$jscoverage['/cmd.js'].lineData[77] = 0;
  _$jscoverage['/cmd.js'].lineData[78] = 0;
  _$jscoverage['/cmd.js'].lineData[79] = 0;
  _$jscoverage['/cmd.js'].lineData[81] = 0;
  _$jscoverage['/cmd.js'].lineData[89] = 0;
  _$jscoverage['/cmd.js'].lineData[90] = 0;
  _$jscoverage['/cmd.js'].lineData[91] = 0;
  _$jscoverage['/cmd.js'].lineData[93] = 0;
  _$jscoverage['/cmd.js'].lineData[94] = 0;
  _$jscoverage['/cmd.js'].lineData[95] = 0;
  _$jscoverage['/cmd.js'].lineData[99] = 0;
  _$jscoverage['/cmd.js'].lineData[100] = 0;
  _$jscoverage['/cmd.js'].lineData[101] = 0;
  _$jscoverage['/cmd.js'].lineData[103] = 0;
  _$jscoverage['/cmd.js'].lineData[105] = 0;
  _$jscoverage['/cmd.js'].lineData[108] = 0;
  _$jscoverage['/cmd.js'].lineData[110] = 0;
  _$jscoverage['/cmd.js'].lineData[111] = 0;
  _$jscoverage['/cmd.js'].lineData[112] = 0;
  _$jscoverage['/cmd.js'].lineData[113] = 0;
  _$jscoverage['/cmd.js'].lineData[114] = 0;
}
if (! _$jscoverage['/cmd.js'].functionData) {
  _$jscoverage['/cmd.js'].functionData = [];
  _$jscoverage['/cmd.js'].functionData[0] = 0;
  _$jscoverage['/cmd.js'].functionData[1] = 0;
  _$jscoverage['/cmd.js'].functionData[2] = 0;
  _$jscoverage['/cmd.js'].functionData[3] = 0;
  _$jscoverage['/cmd.js'].functionData[4] = 0;
  _$jscoverage['/cmd.js'].functionData[5] = 0;
  _$jscoverage['/cmd.js'].functionData[6] = 0;
  _$jscoverage['/cmd.js'].functionData[7] = 0;
  _$jscoverage['/cmd.js'].functionData[8] = 0;
}
if (! _$jscoverage['/cmd.js'].branchData) {
  _$jscoverage['/cmd.js'].branchData = {};
  _$jscoverage['/cmd.js'].branchData['12'] = [];
  _$jscoverage['/cmd.js'].branchData['12'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['22'] = [];
  _$jscoverage['/cmd.js'].branchData['22'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['24'] = [];
  _$jscoverage['/cmd.js'].branchData['24'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['42'] = [];
  _$jscoverage['/cmd.js'].branchData['42'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['44'] = [];
  _$jscoverage['/cmd.js'].branchData['44'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['44'][2] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['44'][3] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['45'] = [];
  _$jscoverage['/cmd.js'].branchData['45'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['45'][2] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['49'] = [];
  _$jscoverage['/cmd.js'].branchData['49'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['59'] = [];
  _$jscoverage['/cmd.js'].branchData['59'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['65'] = [];
  _$jscoverage['/cmd.js'].branchData['65'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['78'] = [];
  _$jscoverage['/cmd.js'].branchData['78'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['90'] = [];
  _$jscoverage['/cmd.js'].branchData['90'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['94'] = [];
  _$jscoverage['/cmd.js'].branchData['94'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['100'] = [];
  _$jscoverage['/cmd.js'].branchData['100'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['111'] = [];
  _$jscoverage['/cmd.js'].branchData['111'][1] = new BranchData();
}
_$jscoverage['/cmd.js'].branchData['111'][1].init(92, 33, 'selection && !selection.isInvalid');
function visit17_111_1(result) {
  _$jscoverage['/cmd.js'].branchData['111'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['100'][1].init(408, 50, 'value.toLowerCase() === currentValue.toLowerCase()');
function visit16_100_1(result) {
  _$jscoverage['/cmd.js'].branchData['100'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['94'][1].init(84, 39, 'editor.queryCommandValue(cmdType) || \'\'');
function visit15_94_1(result) {
  _$jscoverage['/cmd.js'].branchData['94'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['90'][1].init(66, 27, '!editor.hasCommand(cmdType)');
function visit14_90_1(result) {
  _$jscoverage['/cmd.js'].branchData['90'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['78'][1].init(92, 33, 'selection && !selection.isInvalid');
function visit13_78_1(result) {
  _$jscoverage['/cmd.js'].branchData['78'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['65'][1].init(215, 7, 'checked');
function visit12_65_1(result) {
  _$jscoverage['/cmd.js'].branchData['65'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['59'][1].init(66, 27, '!editor.hasCommand(cmdType)');
function visit11_59_1(result) {
  _$jscoverage['/cmd.js'].branchData['59'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['49'][1].init(311, 11, 'v !== false');
function visit10_49_1(result) {
  _$jscoverage['/cmd.js'].branchData['49'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['45'][2].init(158, 40, 'element[0] === elementPath.blockLimit[0]');
function visit9_45_2(result) {
  _$jscoverage['/cmd.js'].branchData['45'][2].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['45'][1].init(75, 66, 'elementPath.blockLimit && element[0] === elementPath.blockLimit[0]');
function visit8_45_1(result) {
  _$jscoverage['/cmd.js'].branchData['45'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['44'][3].init(75, 35, 'element[0] === elementPath.block[0]');
function visit7_44_3(result) {
  _$jscoverage['/cmd.js'].branchData['44'][3].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['44'][2].init(54, 56, 'elementPath.block && element[0] === elementPath.block[0]');
function visit6_44_2(result) {
  _$jscoverage['/cmd.js'].branchData['44'][2].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['44'][1].init(54, 142, 'elementPath.block && element[0] === elementPath.block[0] || elementPath.blockLimit && element[0] === elementPath.blockLimit[0]');
function visit5_44_1(result) {
  _$jscoverage['/cmd.js'].branchData['44'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['42'][1].init(117, 19, 'i < elements.length');
function visit4_42_1(result) {
  _$jscoverage['/cmd.js'].branchData['42'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['24'][1].init(59, 29, 'override.element !== nodeName');
function visit3_24_1(result) {
  _$jscoverage['/cmd.js'].branchData['24'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['22'][1].init(358, 20, 'i < overrides.length');
function visit2_22_1(result) {
  _$jscoverage['/cmd.js'].branchData['22'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['12'][1].init(56, 29, 'styleObj.element !== nodeName');
function visit1_12_1(result) {
  _$jscoverage['/cmd.js'].branchData['12'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/cmd.js'].functionData[0]++;
  _$jscoverage['/cmd.js'].lineData[7]++;
  var Editor = require('editor');
  _$jscoverage['/cmd.js'].lineData[8]++;
  var getQueryCmd = Editor.Utils.getQueryCmd;
  _$jscoverage['/cmd.js'].lineData[10]++;
  function getValueFromSingle(element, styleObj) {
    _$jscoverage['/cmd.js'].functionData[1]++;
    _$jscoverage['/cmd.js'].lineData[11]++;
    var nodeName = element.nodeName();
    _$jscoverage['/cmd.js'].lineData[12]++;
    if (visit1_12_1(styleObj.element !== nodeName)) {
      _$jscoverage['/cmd.js'].lineData[13]++;
      return false;
    }
    _$jscoverage['/cmd.js'].lineData[15]++;
    var styles = styleObj.styles, v;
    _$jscoverage['/cmd.js'].lineData[16]++;
    for (var s in styles) {
      _$jscoverage['/cmd.js'].lineData[17]++;
      if ((v = element.style(s))) {
        _$jscoverage['/cmd.js'].lineData[18]++;
        return v;
      }
    }
    _$jscoverage['/cmd.js'].lineData[21]++;
    var overrides = styleObj.overrides;
    _$jscoverage['/cmd.js'].lineData[22]++;
    for (var i = 0; visit2_22_1(i < overrides.length); i++) {
      _$jscoverage['/cmd.js'].lineData[23]++;
      var override = overrides[i];
      _$jscoverage['/cmd.js'].lineData[24]++;
      if ((visit3_24_1(override.element !== nodeName))) {
        _$jscoverage['/cmd.js'].lineData[25]++;
        continue;
      }
      _$jscoverage['/cmd.js'].lineData[27]++;
      var attributes = override.attributes;
      _$jscoverage['/cmd.js'].lineData[28]++;
      for (var a in attributes) {
        _$jscoverage['/cmd.js'].lineData[29]++;
        if ((v = element.attr(a))) {
          _$jscoverage['/cmd.js'].lineData[30]++;
          return v;
        }
      }
    }
    _$jscoverage['/cmd.js'].lineData[34]++;
    return false;
  }
  _$jscoverage['/cmd.js'].lineData[37]++;
  function getValueFromStyleObj(elementPath, styleObj) {
    _$jscoverage['/cmd.js'].functionData[2]++;
    _$jscoverage['/cmd.js'].lineData[38]++;
    var elements = elementPath.elements, element, i, v;
    _$jscoverage['/cmd.js'].lineData[42]++;
    for (i = 0; visit4_42_1(i < elements.length); i++) {
      _$jscoverage['/cmd.js'].lineData[43]++;
      element = elements[i];
      _$jscoverage['/cmd.js'].lineData[44]++;
      if (visit5_44_1(visit6_44_2(elementPath.block && visit7_44_3(element[0] === elementPath.block[0])) || visit8_45_1(elementPath.blockLimit && visit9_45_2(element[0] === elementPath.blockLimit[0])))) {
        _$jscoverage['/cmd.js'].lineData[46]++;
        continue;
      }
      _$jscoverage['/cmd.js'].lineData[48]++;
      v = getValueFromSingle(element, styleObj);
      _$jscoverage['/cmd.js'].lineData[49]++;
      if (visit10_49_1(v !== false)) {
        _$jscoverage['/cmd.js'].lineData[50]++;
        return v;
      }
    }
    _$jscoverage['/cmd.js'].lineData[53]++;
    return v;
  }
  _$jscoverage['/cmd.js'].lineData[56]++;
  return {
  addButtonCmd: function(editor, cmdType, style) {
  _$jscoverage['/cmd.js'].functionData[3]++;
  _$jscoverage['/cmd.js'].lineData[58]++;
  var queryCmd = getQueryCmd(cmdType);
  _$jscoverage['/cmd.js'].lineData[59]++;
  if (visit11_59_1(!editor.hasCommand(cmdType))) {
    _$jscoverage['/cmd.js'].lineData[60]++;
    editor.addCommand(cmdType, {
  exec: function(editor) {
  _$jscoverage['/cmd.js'].functionData[4]++;
  _$jscoverage['/cmd.js'].lineData[62]++;
  var doc = editor.get('document')[0];
  _$jscoverage['/cmd.js'].lineData[63]++;
  editor.execCommand('save');
  _$jscoverage['/cmd.js'].lineData[64]++;
  var checked = editor.queryCommandValue(cmdType);
  _$jscoverage['/cmd.js'].lineData[65]++;
  if (visit12_65_1(checked)) {
    _$jscoverage['/cmd.js'].lineData[66]++;
    style.remove(doc);
  } else {
    _$jscoverage['/cmd.js'].lineData[68]++;
    style.apply(doc);
  }
  _$jscoverage['/cmd.js'].lineData[70]++;
  editor.execCommand('save');
  _$jscoverage['/cmd.js'].lineData[71]++;
  editor.notifySelectionChange();
}});
    _$jscoverage['/cmd.js'].lineData[75]++;
    editor.addCommand(queryCmd, {
  exec: function(editor) {
  _$jscoverage['/cmd.js'].functionData[5]++;
  _$jscoverage['/cmd.js'].lineData[77]++;
  var selection = editor.getSelection();
  _$jscoverage['/cmd.js'].lineData[78]++;
  if (visit13_78_1(selection && !selection.isInvalid)) {
    _$jscoverage['/cmd.js'].lineData[79]++;
    var startElement = selection.getStartElement(), currentPath = new Editor.ElementPath(startElement);
    _$jscoverage['/cmd.js'].lineData[81]++;
    return style.checkActive(currentPath);
  }
}});
  }
}, 
  addSelectCmd: function(editor, cmdType, styleObj) {
  _$jscoverage['/cmd.js'].functionData[6]++;
  _$jscoverage['/cmd.js'].lineData[89]++;
  var queryCmd = getQueryCmd(cmdType);
  _$jscoverage['/cmd.js'].lineData[90]++;
  if (visit14_90_1(!editor.hasCommand(cmdType))) {
    _$jscoverage['/cmd.js'].lineData[91]++;
    editor.addCommand(cmdType, {
  exec: function(editor, value) {
  _$jscoverage['/cmd.js'].functionData[7]++;
  _$jscoverage['/cmd.js'].lineData[93]++;
  editor.focus();
  _$jscoverage['/cmd.js'].lineData[94]++;
  var currentValue = visit15_94_1(editor.queryCommandValue(cmdType) || '');
  _$jscoverage['/cmd.js'].lineData[95]++;
  var style = new Editor.Style(styleObj, {
  value: value}), doc = editor.get('document')[0];
  _$jscoverage['/cmd.js'].lineData[99]++;
  editor.execCommand('save');
  _$jscoverage['/cmd.js'].lineData[100]++;
  if (visit16_100_1(value.toLowerCase() === currentValue.toLowerCase())) {
    _$jscoverage['/cmd.js'].lineData[101]++;
    style.remove(doc);
  } else {
    _$jscoverage['/cmd.js'].lineData[103]++;
    style.apply(doc);
  }
  _$jscoverage['/cmd.js'].lineData[105]++;
  editor.execCommand('save');
}});
    _$jscoverage['/cmd.js'].lineData[108]++;
    editor.addCommand(queryCmd, {
  exec: function(editor) {
  _$jscoverage['/cmd.js'].functionData[8]++;
  _$jscoverage['/cmd.js'].lineData[110]++;
  var selection = editor.getSelection();
  _$jscoverage['/cmd.js'].lineData[111]++;
  if (visit17_111_1(selection && !selection.isInvalid)) {
    _$jscoverage['/cmd.js'].lineData[112]++;
    var startElement = selection.getStartElement();
    _$jscoverage['/cmd.js'].lineData[113]++;
    var currentPath = new Editor.ElementPath(startElement);
    _$jscoverage['/cmd.js'].lineData[114]++;
    return getValueFromStyleObj(currentPath, styleObj);
  }
}});
  }
}};
});
