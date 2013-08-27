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
  _$jscoverage['/cmd.js'].lineData[5] = 0;
  _$jscoverage['/cmd.js'].lineData[7] = 0;
  _$jscoverage['/cmd.js'].lineData[9] = 0;
  _$jscoverage['/cmd.js'].lineData[10] = 0;
  _$jscoverage['/cmd.js'].lineData[11] = 0;
  _$jscoverage['/cmd.js'].lineData[12] = 0;
  _$jscoverage['/cmd.js'].lineData[14] = 0;
  _$jscoverage['/cmd.js'].lineData[15] = 0;
  _$jscoverage['/cmd.js'].lineData[16] = 0;
  _$jscoverage['/cmd.js'].lineData[17] = 0;
  _$jscoverage['/cmd.js'].lineData[20] = 0;
  _$jscoverage['/cmd.js'].lineData[21] = 0;
  _$jscoverage['/cmd.js'].lineData[22] = 0;
  _$jscoverage['/cmd.js'].lineData[23] = 0;
  _$jscoverage['/cmd.js'].lineData[24] = 0;
  _$jscoverage['/cmd.js'].lineData[26] = 0;
  _$jscoverage['/cmd.js'].lineData[27] = 0;
  _$jscoverage['/cmd.js'].lineData[28] = 0;
  _$jscoverage['/cmd.js'].lineData[29] = 0;
  _$jscoverage['/cmd.js'].lineData[33] = 0;
  _$jscoverage['/cmd.js'].lineData[36] = 0;
  _$jscoverage['/cmd.js'].lineData[37] = 0;
  _$jscoverage['/cmd.js'].lineData[41] = 0;
  _$jscoverage['/cmd.js'].lineData[42] = 0;
  _$jscoverage['/cmd.js'].lineData[43] = 0;
  _$jscoverage['/cmd.js'].lineData[45] = 0;
  _$jscoverage['/cmd.js'].lineData[47] = 0;
  _$jscoverage['/cmd.js'].lineData[48] = 0;
  _$jscoverage['/cmd.js'].lineData[49] = 0;
  _$jscoverage['/cmd.js'].lineData[52] = 0;
  _$jscoverage['/cmd.js'].lineData[55] = 0;
  _$jscoverage['/cmd.js'].lineData[57] = 0;
  _$jscoverage['/cmd.js'].lineData[58] = 0;
  _$jscoverage['/cmd.js'].lineData[59] = 0;
  _$jscoverage['/cmd.js'].lineData[61] = 0;
  _$jscoverage['/cmd.js'].lineData[62] = 0;
  _$jscoverage['/cmd.js'].lineData[63] = 0;
  _$jscoverage['/cmd.js'].lineData[64] = 0;
  _$jscoverage['/cmd.js'].lineData[65] = 0;
  _$jscoverage['/cmd.js'].lineData[67] = 0;
  _$jscoverage['/cmd.js'].lineData[69] = 0;
  _$jscoverage['/cmd.js'].lineData[70] = 0;
  _$jscoverage['/cmd.js'].lineData[74] = 0;
  _$jscoverage['/cmd.js'].lineData[76] = 0;
  _$jscoverage['/cmd.js'].lineData[77] = 0;
  _$jscoverage['/cmd.js'].lineData[78] = 0;
  _$jscoverage['/cmd.js'].lineData[80] = 0;
  _$jscoverage['/cmd.js'].lineData[88] = 0;
  _$jscoverage['/cmd.js'].lineData[89] = 0;
  _$jscoverage['/cmd.js'].lineData[90] = 0;
  _$jscoverage['/cmd.js'].lineData[92] = 0;
  _$jscoverage['/cmd.js'].lineData[93] = 0;
  _$jscoverage['/cmd.js'].lineData[94] = 0;
  _$jscoverage['/cmd.js'].lineData[98] = 0;
  _$jscoverage['/cmd.js'].lineData[99] = 0;
  _$jscoverage['/cmd.js'].lineData[100] = 0;
  _$jscoverage['/cmd.js'].lineData[102] = 0;
  _$jscoverage['/cmd.js'].lineData[104] = 0;
  _$jscoverage['/cmd.js'].lineData[107] = 0;
  _$jscoverage['/cmd.js'].lineData[109] = 0;
  _$jscoverage['/cmd.js'].lineData[110] = 0;
  _$jscoverage['/cmd.js'].lineData[111] = 0;
  _$jscoverage['/cmd.js'].lineData[112] = 0;
  _$jscoverage['/cmd.js'].lineData[113] = 0;
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
  _$jscoverage['/cmd.js'].branchData['11'] = [];
  _$jscoverage['/cmd.js'].branchData['11'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['16'] = [];
  _$jscoverage['/cmd.js'].branchData['16'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['21'] = [];
  _$jscoverage['/cmd.js'].branchData['21'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['23'] = [];
  _$jscoverage['/cmd.js'].branchData['23'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['28'] = [];
  _$jscoverage['/cmd.js'].branchData['28'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['41'] = [];
  _$jscoverage['/cmd.js'].branchData['41'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['43'] = [];
  _$jscoverage['/cmd.js'].branchData['43'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['43'][2] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['43'][3] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['44'] = [];
  _$jscoverage['/cmd.js'].branchData['44'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['44'][2] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['48'] = [];
  _$jscoverage['/cmd.js'].branchData['48'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['58'] = [];
  _$jscoverage['/cmd.js'].branchData['58'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['64'] = [];
  _$jscoverage['/cmd.js'].branchData['64'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['77'] = [];
  _$jscoverage['/cmd.js'].branchData['77'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['89'] = [];
  _$jscoverage['/cmd.js'].branchData['89'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['93'] = [];
  _$jscoverage['/cmd.js'].branchData['93'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['99'] = [];
  _$jscoverage['/cmd.js'].branchData['99'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['110'] = [];
  _$jscoverage['/cmd.js'].branchData['110'][1] = new BranchData();
}
_$jscoverage['/cmd.js'].branchData['110'][1].init(94, 33, 'selection && !selection.isInvalid');
function visit19_110_1(result) {
  _$jscoverage['/cmd.js'].branchData['110'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['99'][1].init(416, 49, 'value.toLowerCase() == currentValue.toLowerCase()');
function visit18_99_1(result) {
  _$jscoverage['/cmd.js'].branchData['99'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['93'][1].init(86, 39, 'editor.queryCommandValue(cmdType) || ""');
function visit17_93_1(result) {
  _$jscoverage['/cmd.js'].branchData['93'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['89'][1].init(68, 27, '!editor.hasCommand(cmdType)');
function visit16_89_1(result) {
  _$jscoverage['/cmd.js'].branchData['89'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['77'][1].init(94, 33, 'selection && !selection.isInvalid');
function visit15_77_1(result) {
  _$jscoverage['/cmd.js'].branchData['77'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['64'][1].init(219, 7, 'checked');
function visit14_64_1(result) {
  _$jscoverage['/cmd.js'].branchData['64'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['58'][1].init(68, 27, '!editor.hasCommand(cmdType)');
function visit13_58_1(result) {
  _$jscoverage['/cmd.js'].branchData['58'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['48'][1].init(316, 11, 'v !== false');
function visit12_48_1(result) {
  _$jscoverage['/cmd.js'].branchData['48'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['44'][2].init(160, 39, 'element[0] == elementPath.blockLimit[0]');
function visit11_44_2(result) {
  _$jscoverage['/cmd.js'].branchData['44'][2].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['44'][1].init(75, 65, 'elementPath.blockLimit && element[0] == elementPath.blockLimit[0]');
function visit10_44_1(result) {
  _$jscoverage['/cmd.js'].branchData['44'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['43'][3].init(77, 34, 'element[0] == elementPath.block[0]');
function visit9_43_3(result) {
  _$jscoverage['/cmd.js'].branchData['43'][3].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['43'][2].init(56, 55, 'elementPath.block && element[0] == elementPath.block[0]');
function visit8_43_2(result) {
  _$jscoverage['/cmd.js'].branchData['43'][2].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['43'][1].init(56, 141, 'elementPath.block && element[0] == elementPath.block[0] || elementPath.blockLimit && element[0] == elementPath.blockLimit[0]');
function visit7_43_1(result) {
  _$jscoverage['/cmd.js'].branchData['43'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['41'][1].init(122, 19, 'i < elements.length');
function visit6_41_1(result) {
  _$jscoverage['/cmd.js'].branchData['41'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['28'][1].init(22, 19, 'v = element.attr(a)');
function visit5_28_1(result) {
  _$jscoverage['/cmd.js'].branchData['28'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['23'][1].init(60, 28, 'override.element != nodeName');
function visit4_23_1(result) {
  _$jscoverage['/cmd.js'].branchData['23'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['21'][1].init(367, 20, 'i < overrides.length');
function visit3_21_1(result) {
  _$jscoverage['/cmd.js'].branchData['21'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['16'][1].init(18, 20, 'v = element.style(s)');
function visit2_16_1(result) {
  _$jscoverage['/cmd.js'].branchData['16'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['11'][1].init(58, 28, 'styleObj.element != nodeName');
function visit1_11_1(result) {
  _$jscoverage['/cmd.js'].branchData['11'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].lineData[5]++;
KISSY.add("editor/plugin/font/cmd", function(S, Editor) {
  _$jscoverage['/cmd.js'].functionData[0]++;
  _$jscoverage['/cmd.js'].lineData[7]++;
  var getQueryCmd = Editor.Utils.getQueryCmd;
  _$jscoverage['/cmd.js'].lineData[9]++;
  function getValueFromSingle(element, styleObj) {
    _$jscoverage['/cmd.js'].functionData[1]++;
    _$jscoverage['/cmd.js'].lineData[10]++;
    var nodeName = element.nodeName();
    _$jscoverage['/cmd.js'].lineData[11]++;
    if (visit1_11_1(styleObj.element != nodeName)) {
      _$jscoverage['/cmd.js'].lineData[12]++;
      return false;
    }
    _$jscoverage['/cmd.js'].lineData[14]++;
    var styles = styleObj.styles, v;
    _$jscoverage['/cmd.js'].lineData[15]++;
    for (var s in styles) {
      _$jscoverage['/cmd.js'].lineData[16]++;
      if (visit2_16_1(v = element.style(s))) {
        _$jscoverage['/cmd.js'].lineData[17]++;
        return v;
      }
    }
    _$jscoverage['/cmd.js'].lineData[20]++;
    var overrides = styleObj.overrides;
    _$jscoverage['/cmd.js'].lineData[21]++;
    for (var i = 0; visit3_21_1(i < overrides.length); i++) {
      _$jscoverage['/cmd.js'].lineData[22]++;
      var override = overrides[i];
      _$jscoverage['/cmd.js'].lineData[23]++;
      if (visit4_23_1(override.element != nodeName)) {
        _$jscoverage['/cmd.js'].lineData[24]++;
        continue;
      }
      _$jscoverage['/cmd.js'].lineData[26]++;
      var attributes = override.attributes;
      _$jscoverage['/cmd.js'].lineData[27]++;
      for (var a in attributes) {
        _$jscoverage['/cmd.js'].lineData[28]++;
        if (visit5_28_1(v = element.attr(a))) {
          _$jscoverage['/cmd.js'].lineData[29]++;
          return v;
        }
      }
    }
    _$jscoverage['/cmd.js'].lineData[33]++;
    return false;
  }
  _$jscoverage['/cmd.js'].lineData[36]++;
  function getValueFromStyleObj(elementPath, styleObj) {
    _$jscoverage['/cmd.js'].functionData[2]++;
    _$jscoverage['/cmd.js'].lineData[37]++;
    var elements = elementPath.elements, element, i, v;
    _$jscoverage['/cmd.js'].lineData[41]++;
    for (i = 0; visit6_41_1(i < elements.length); i++) {
      _$jscoverage['/cmd.js'].lineData[42]++;
      element = elements[i];
      _$jscoverage['/cmd.js'].lineData[43]++;
      if (visit7_43_1(visit8_43_2(elementPath.block && visit9_43_3(element[0] == elementPath.block[0])) || visit10_44_1(elementPath.blockLimit && visit11_44_2(element[0] == elementPath.blockLimit[0])))) {
        _$jscoverage['/cmd.js'].lineData[45]++;
        continue;
      }
      _$jscoverage['/cmd.js'].lineData[47]++;
      v = getValueFromSingle(element, styleObj);
      _$jscoverage['/cmd.js'].lineData[48]++;
      if (visit12_48_1(v !== false)) {
        _$jscoverage['/cmd.js'].lineData[49]++;
        return v;
      }
    }
    _$jscoverage['/cmd.js'].lineData[52]++;
    return v;
  }
  _$jscoverage['/cmd.js'].lineData[55]++;
  return {
  addButtonCmd: function(editor, cmdType, style) {
  _$jscoverage['/cmd.js'].functionData[3]++;
  _$jscoverage['/cmd.js'].lineData[57]++;
  var queryCmd = getQueryCmd(cmdType);
  _$jscoverage['/cmd.js'].lineData[58]++;
  if (visit13_58_1(!editor.hasCommand(cmdType))) {
    _$jscoverage['/cmd.js'].lineData[59]++;
    editor.addCommand(cmdType, {
  exec: function(editor, effect) {
  _$jscoverage['/cmd.js'].functionData[4]++;
  _$jscoverage['/cmd.js'].lineData[61]++;
  var doc = editor.get("document")[0];
  _$jscoverage['/cmd.js'].lineData[62]++;
  editor.execCommand("save");
  _$jscoverage['/cmd.js'].lineData[63]++;
  var checked = editor.queryCommandValue(cmdType);
  _$jscoverage['/cmd.js'].lineData[64]++;
  if (visit14_64_1(checked)) {
    _$jscoverage['/cmd.js'].lineData[65]++;
    style.remove(doc);
  } else {
    _$jscoverage['/cmd.js'].lineData[67]++;
    style.apply(doc);
  }
  _$jscoverage['/cmd.js'].lineData[69]++;
  editor.execCommand("save");
  _$jscoverage['/cmd.js'].lineData[70]++;
  editor.notifySelectionChange();
}});
    _$jscoverage['/cmd.js'].lineData[74]++;
    editor.addCommand(queryCmd, {
  exec: function(editor) {
  _$jscoverage['/cmd.js'].functionData[5]++;
  _$jscoverage['/cmd.js'].lineData[76]++;
  var selection = editor.getSelection();
  _$jscoverage['/cmd.js'].lineData[77]++;
  if (visit15_77_1(selection && !selection.isInvalid)) {
    _$jscoverage['/cmd.js'].lineData[78]++;
    var startElement = selection.getStartElement(), currentPath = new Editor.ElementPath(startElement);
    _$jscoverage['/cmd.js'].lineData[80]++;
    return style.checkActive(currentPath);
  }
}});
  }
}, 
  addSelectCmd: function(editor, cmdType, styleObj) {
  _$jscoverage['/cmd.js'].functionData[6]++;
  _$jscoverage['/cmd.js'].lineData[88]++;
  var queryCmd = getQueryCmd(cmdType);
  _$jscoverage['/cmd.js'].lineData[89]++;
  if (visit16_89_1(!editor.hasCommand(cmdType))) {
    _$jscoverage['/cmd.js'].lineData[90]++;
    editor.addCommand(cmdType, {
  exec: function(editor, value) {
  _$jscoverage['/cmd.js'].functionData[7]++;
  _$jscoverage['/cmd.js'].lineData[92]++;
  editor.focus();
  _$jscoverage['/cmd.js'].lineData[93]++;
  var currentValue = visit17_93_1(editor.queryCommandValue(cmdType) || "");
  _$jscoverage['/cmd.js'].lineData[94]++;
  var style = new Editor.Style(styleObj, {
  value: value}), doc = editor.get("document")[0];
  _$jscoverage['/cmd.js'].lineData[98]++;
  editor.execCommand("save");
  _$jscoverage['/cmd.js'].lineData[99]++;
  if (visit18_99_1(value.toLowerCase() == currentValue.toLowerCase())) {
    _$jscoverage['/cmd.js'].lineData[100]++;
    style.remove(doc);
  } else {
    _$jscoverage['/cmd.js'].lineData[102]++;
    style.apply(doc);
  }
  _$jscoverage['/cmd.js'].lineData[104]++;
  editor.execCommand("save");
}});
    _$jscoverage['/cmd.js'].lineData[107]++;
    editor.addCommand(queryCmd, {
  exec: function(editor) {
  _$jscoverage['/cmd.js'].functionData[8]++;
  _$jscoverage['/cmd.js'].lineData[109]++;
  var selection = editor.getSelection();
  _$jscoverage['/cmd.js'].lineData[110]++;
  if (visit19_110_1(selection && !selection.isInvalid)) {
    _$jscoverage['/cmd.js'].lineData[111]++;
    var startElement = selection.getStartElement();
    _$jscoverage['/cmd.js'].lineData[112]++;
    var currentPath = new Editor.ElementPath(startElement);
    _$jscoverage['/cmd.js'].lineData[113]++;
    return getValueFromStyleObj(currentPath, styleObj);
  }
}});
  }
}};
}, {
  requires: ['editor']});
