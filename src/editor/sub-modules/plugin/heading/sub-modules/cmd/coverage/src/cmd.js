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
  _$jscoverage['/cmd.js'].lineData[7] = 0;
  _$jscoverage['/cmd.js'].lineData[8] = 0;
  _$jscoverage['/cmd.js'].lineData[10] = 0;
  _$jscoverage['/cmd.js'].lineData[12] = 0;
  _$jscoverage['/cmd.js'].lineData[13] = 0;
  _$jscoverage['/cmd.js'].lineData[15] = 0;
  _$jscoverage['/cmd.js'].lineData[16] = 0;
  _$jscoverage['/cmd.js'].lineData[17] = 0;
  _$jscoverage['/cmd.js'].lineData[19] = 0;
  _$jscoverage['/cmd.js'].lineData[20] = 0;
  _$jscoverage['/cmd.js'].lineData[22] = 0;
  _$jscoverage['/cmd.js'].lineData[25] = 0;
  _$jscoverage['/cmd.js'].lineData[29] = 0;
  _$jscoverage['/cmd.js'].lineData[31] = 0;
  _$jscoverage['/cmd.js'].lineData[33] = 0;
  _$jscoverage['/cmd.js'].lineData[34] = 0;
  _$jscoverage['/cmd.js'].lineData[35] = 0;
  _$jscoverage['/cmd.js'].lineData[36] = 0;
  _$jscoverage['/cmd.js'].lineData[37] = 0;
  _$jscoverage['/cmd.js'].lineData[38] = 0;
  _$jscoverage['/cmd.js'].lineData[39] = 0;
  _$jscoverage['/cmd.js'].lineData[40] = 0;
}
if (! _$jscoverage['/cmd.js'].functionData) {
  _$jscoverage['/cmd.js'].functionData = [];
  _$jscoverage['/cmd.js'].functionData[0] = 0;
  _$jscoverage['/cmd.js'].functionData[1] = 0;
  _$jscoverage['/cmd.js'].functionData[2] = 0;
  _$jscoverage['/cmd.js'].functionData[3] = 0;
}
if (! _$jscoverage['/cmd.js'].branchData) {
  _$jscoverage['/cmd.js'].branchData = {};
  _$jscoverage['/cmd.js'].branchData['12'] = [];
  _$jscoverage['/cmd.js'].branchData['12'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['16'] = [];
  _$jscoverage['/cmd.js'].branchData['16'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['19'] = [];
  _$jscoverage['/cmd.js'].branchData['19'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['34'] = [];
  _$jscoverage['/cmd.js'].branchData['34'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['37'] = [];
  _$jscoverage['/cmd.js'].branchData['37'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['38'] = [];
  _$jscoverage['/cmd.js'].branchData['38'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['38'][2] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['39'] = [];
  _$jscoverage['/cmd.js'].branchData['39'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['39'][2] = new BranchData();
}
_$jscoverage['/cmd.js'].branchData['39'][2].init(381, 15, 'nodeName == "p"');
function visit9_39_2(result) {
  _$jscoverage['/cmd.js'].branchData['39'][2].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['39'][1].init(354, 42, 'nodeName.match(/^h\\d$/) || nodeName == "p"');
function visit8_39_1(result) {
  _$jscoverage['/cmd.js'].branchData['39'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['38'][2].init(289, 25, 'block && block.nodeName()');
function visit7_38_2(result) {
  _$jscoverage['/cmd.js'].branchData['38'][2].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['38'][1].init(289, 31, 'block && block.nodeName() || ""');
function visit6_38_1(result) {
  _$jscoverage['/cmd.js'].branchData['38'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['37'][1].init(201, 43, 'currentPath.block || currentPath.blockLimit');
function visit5_37_1(result) {
  _$jscoverage['/cmd.js'].branchData['37'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['34'][1].init(92, 33, 'selection && !selection.isInvalid');
function visit4_34_1(result) {
  _$jscoverage['/cmd.js'].branchData['34'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['19'][1].init(233, 19, 'tag == currentValue');
function visit3_19_1(result) {
  _$jscoverage['/cmd.js'].branchData['19'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['16'][1].init(81, 10, 'tag != "p"');
function visit2_16_1(result) {
  _$jscoverage['/cmd.js'].branchData['16'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['12'][1].init(17, 29, '!editor.hasCommand("heading")');
function visit1_12_1(result) {
  _$jscoverage['/cmd.js'].branchData['12'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].lineData[7]++;
KISSY.add(function(S, require) {
  _$jscoverage['/cmd.js'].functionData[0]++;
  _$jscoverage['/cmd.js'].lineData[8]++;
  var Editor = require('editor');
  _$jscoverage['/cmd.js'].lineData[10]++;
  return {
  init: function(editor) {
  _$jscoverage['/cmd.js'].functionData[1]++;
  _$jscoverage['/cmd.js'].lineData[12]++;
  if (visit1_12_1(!editor.hasCommand("heading"))) {
    _$jscoverage['/cmd.js'].lineData[13]++;
    editor.addCommand("heading", {
  exec: function(editor, tag) {
  _$jscoverage['/cmd.js'].functionData[2]++;
  _$jscoverage['/cmd.js'].lineData[15]++;
  editor.execCommand("save");
  _$jscoverage['/cmd.js'].lineData[16]++;
  if (visit2_16_1(tag != "p")) {
    _$jscoverage['/cmd.js'].lineData[17]++;
    var currentValue = editor.queryCommandValue("heading");
  }
  _$jscoverage['/cmd.js'].lineData[19]++;
  if (visit3_19_1(tag == currentValue)) {
    _$jscoverage['/cmd.js'].lineData[20]++;
    tag = "p";
  }
  _$jscoverage['/cmd.js'].lineData[22]++;
  new Editor.Style({
  element: tag}).apply(editor.get('document')[0]);
  _$jscoverage['/cmd.js'].lineData[25]++;
  editor.execCommand("save");
}});
    _$jscoverage['/cmd.js'].lineData[29]++;
    var queryCmd = Editor.Utils.getQueryCmd("heading");
    _$jscoverage['/cmd.js'].lineData[31]++;
    editor.addCommand(queryCmd, {
  exec: function(editor) {
  _$jscoverage['/cmd.js'].functionData[3]++;
  _$jscoverage['/cmd.js'].lineData[33]++;
  var selection = editor.getSelection();
  _$jscoverage['/cmd.js'].lineData[34]++;
  if (visit4_34_1(selection && !selection.isInvalid)) {
    _$jscoverage['/cmd.js'].lineData[35]++;
    var startElement = selection.getStartElement();
    _$jscoverage['/cmd.js'].lineData[36]++;
    var currentPath = new Editor.ElementPath(startElement);
    _$jscoverage['/cmd.js'].lineData[37]++;
    var block = visit5_37_1(currentPath.block || currentPath.blockLimit);
    _$jscoverage['/cmd.js'].lineData[38]++;
    var nodeName = visit6_38_1(visit7_38_2(block && block.nodeName()) || "");
    _$jscoverage['/cmd.js'].lineData[39]++;
    if (visit8_39_1(nodeName.match(/^h\d$/) || visit9_39_2(nodeName == "p"))) {
      _$jscoverage['/cmd.js'].lineData[40]++;
      return nodeName;
    }
  }
}});
  }
}};
});
