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
if (! _$jscoverage['/justify-cmd.js']) {
  _$jscoverage['/justify-cmd.js'] = {};
  _$jscoverage['/justify-cmd.js'].lineData = [];
  _$jscoverage['/justify-cmd.js'].lineData[6] = 0;
  _$jscoverage['/justify-cmd.js'].lineData[7] = 0;
  _$jscoverage['/justify-cmd.js'].lineData[10] = 0;
  _$jscoverage['/justify-cmd.js'].lineData[11] = 0;
  _$jscoverage['/justify-cmd.js'].lineData[12] = 0;
  _$jscoverage['/justify-cmd.js'].lineData[13] = 0;
  _$jscoverage['/justify-cmd.js'].lineData[18] = 0;
  _$jscoverage['/justify-cmd.js'].lineData[19] = 0;
  _$jscoverage['/justify-cmd.js'].lineData[20] = 0;
  _$jscoverage['/justify-cmd.js'].lineData[21] = 0;
  _$jscoverage['/justify-cmd.js'].lineData[22] = 0;
  _$jscoverage['/justify-cmd.js'].lineData[23] = 0;
  _$jscoverage['/justify-cmd.js'].lineData[24] = 0;
  _$jscoverage['/justify-cmd.js'].lineData[26] = 0;
  _$jscoverage['/justify-cmd.js'].lineData[30] = 0;
  _$jscoverage['/justify-cmd.js'].lineData[31] = 0;
  _$jscoverage['/justify-cmd.js'].lineData[32] = 0;
  _$jscoverage['/justify-cmd.js'].lineData[35] = 0;
  _$jscoverage['/justify-cmd.js'].lineData[36] = 0;
  _$jscoverage['/justify-cmd.js'].lineData[40] = 0;
  _$jscoverage['/justify-cmd.js'].lineData[43] = 0;
  _$jscoverage['/justify-cmd.js'].lineData[45] = 0;
  _$jscoverage['/justify-cmd.js'].lineData[47] = 0;
  _$jscoverage['/justify-cmd.js'].lineData[49] = 0;
  _$jscoverage['/justify-cmd.js'].lineData[53] = 0;
  _$jscoverage['/justify-cmd.js'].lineData[55] = 0;
  _$jscoverage['/justify-cmd.js'].lineData[56] = 0;
  _$jscoverage['/justify-cmd.js'].lineData[57] = 0;
  _$jscoverage['/justify-cmd.js'].lineData[58] = 0;
  _$jscoverage['/justify-cmd.js'].lineData[59] = 0;
  _$jscoverage['/justify-cmd.js'].lineData[60] = 0;
  _$jscoverage['/justify-cmd.js'].lineData[61] = 0;
  _$jscoverage['/justify-cmd.js'].lineData[63] = 0;
}
if (! _$jscoverage['/justify-cmd.js'].functionData) {
  _$jscoverage['/justify-cmd.js'].functionData = [];
  _$jscoverage['/justify-cmd.js'].functionData[0] = 0;
  _$jscoverage['/justify-cmd.js'].functionData[1] = 0;
  _$jscoverage['/justify-cmd.js'].functionData[2] = 0;
  _$jscoverage['/justify-cmd.js'].functionData[3] = 0;
  _$jscoverage['/justify-cmd.js'].functionData[4] = 0;
  _$jscoverage['/justify-cmd.js'].functionData[5] = 0;
}
if (! _$jscoverage['/justify-cmd.js'].branchData) {
  _$jscoverage['/justify-cmd.js'].branchData = {};
  _$jscoverage['/justify-cmd.js'].branchData['18'] = [];
  _$jscoverage['/justify-cmd.js'].branchData['18'][1] = new BranchData();
  _$jscoverage['/justify-cmd.js'].branchData['23'] = [];
  _$jscoverage['/justify-cmd.js'].branchData['23'][1] = new BranchData();
  _$jscoverage['/justify-cmd.js'].branchData['37'] = [];
  _$jscoverage['/justify-cmd.js'].branchData['37'][1] = new BranchData();
  _$jscoverage['/justify-cmd.js'].branchData['40'] = [];
  _$jscoverage['/justify-cmd.js'].branchData['40'][1] = new BranchData();
  _$jscoverage['/justify-cmd.js'].branchData['45'] = [];
  _$jscoverage['/justify-cmd.js'].branchData['45'][1] = new BranchData();
  _$jscoverage['/justify-cmd.js'].branchData['56'] = [];
  _$jscoverage['/justify-cmd.js'].branchData['56'][1] = new BranchData();
  _$jscoverage['/justify-cmd.js'].branchData['59'] = [];
  _$jscoverage['/justify-cmd.js'].branchData['59'][1] = new BranchData();
  _$jscoverage['/justify-cmd.js'].branchData['60'] = [];
  _$jscoverage['/justify-cmd.js'].branchData['60'][1] = new BranchData();
  _$jscoverage['/justify-cmd.js'].branchData['60'][2] = new BranchData();
}
_$jscoverage['/justify-cmd.js'].branchData['60'][2].init(271, 27, 'block.nodeName() === "body"');
function visit9_60_2(result) {
  _$jscoverage['/justify-cmd.js'].branchData['60'][2].ranCondition(result);
  return result;
}_$jscoverage['/justify-cmd.js'].branchData['60'][1].init(261, 37, '!block || block.nodeName() === "body"');
function visit8_60_1(result) {
  _$jscoverage['/justify-cmd.js'].branchData['60'][1].ranCondition(result);
  return result;
}_$jscoverage['/justify-cmd.js'].branchData['59'][1].init(197, 29, 'path.block || path.blockLimit');
function visit7_59_1(result) {
  _$jscoverage['/justify-cmd.js'].branchData['59'][1].ranCondition(result);
  return result;
}_$jscoverage['/justify-cmd.js'].branchData['56'][1].init(94, 33, 'selection && !selection.isInvalid');
function visit6_56_1(result) {
  _$jscoverage['/justify-cmd.js'].branchData['56'][1].ranCondition(result);
  return result;
}_$jscoverage['/justify-cmd.js'].branchData['45'][1].init(18, 27, '!editor.hasCommand(command)');
function visit5_45_1(result) {
  _$jscoverage['/justify-cmd.js'].branchData['45'][1].ranCondition(result);
  return result;
}_$jscoverage['/justify-cmd.js'].branchData['40'][1].init(161, 18, 'align == textAlign');
function visit4_40_1(result) {
  _$jscoverage['/justify-cmd.js'].branchData['40'][1].ranCondition(result);
  return result;
}_$jscoverage['/justify-cmd.js'].branchData['37'][1].init(7, 121, 'block.css("text-align").replace(alignRemoveRegex, "") || default_align');
function visit3_37_1(result) {
  _$jscoverage['/justify-cmd.js'].branchData['37'][1].ranCondition(result);
  return result;
}_$jscoverage['/justify-cmd.js'].branchData['23'][1].init(66, 25, 'isAlign(block, textAlign)');
function visit2_23_1(result) {
  _$jscoverage['/justify-cmd.js'].branchData['23'][1].ranCondition(result);
  return result;
}_$jscoverage['/justify-cmd.js'].branchData['18'][1].init(294, 6, 'i >= 0');
function visit1_18_1(result) {
  _$jscoverage['/justify-cmd.js'].branchData['18'][1].ranCondition(result);
  return result;
}_$jscoverage['/justify-cmd.js'].lineData[6]++;
KISSY.add("editor/plugin/justify-cmd", function(S, Editor) {
  _$jscoverage['/justify-cmd.js'].functionData[0]++;
  _$jscoverage['/justify-cmd.js'].lineData[7]++;
  var alignRemoveRegex = /(-moz-|-webkit-|start|auto)/gi, default_align = "left";
  _$jscoverage['/justify-cmd.js'].lineData[10]++;
  function exec(editor, textAlign) {
    _$jscoverage['/justify-cmd.js'].functionData[1]++;
    _$jscoverage['/justify-cmd.js'].lineData[11]++;
    editor.focus();
    _$jscoverage['/justify-cmd.js'].lineData[12]++;
    editor.execCommand("save");
    _$jscoverage['/justify-cmd.js'].lineData[13]++;
    var selection = editor.getSelection(), bookmarks = selection.createBookmarks(), ranges = selection.getRanges(), iterator, block;
    _$jscoverage['/justify-cmd.js'].lineData[18]++;
    for (var i = ranges.length - 1; visit1_18_1(i >= 0); i--) {
      _$jscoverage['/justify-cmd.js'].lineData[19]++;
      iterator = ranges[i].createIterator();
      _$jscoverage['/justify-cmd.js'].lineData[20]++;
      iterator.enlargeBr = true;
      _$jscoverage['/justify-cmd.js'].lineData[21]++;
      while ((block = iterator.getNextParagraph())) {
        _$jscoverage['/justify-cmd.js'].lineData[22]++;
        block.removeAttr('align');
        _$jscoverage['/justify-cmd.js'].lineData[23]++;
        if (visit2_23_1(isAlign(block, textAlign))) {
          _$jscoverage['/justify-cmd.js'].lineData[24]++;
          block.css('text-align', '');
        } else {
          _$jscoverage['/justify-cmd.js'].lineData[26]++;
          block.css('text-align', textAlign);
        }
      }
    }
    _$jscoverage['/justify-cmd.js'].lineData[30]++;
    selection.selectBookmarks(bookmarks);
    _$jscoverage['/justify-cmd.js'].lineData[31]++;
    editor.execCommand("save");
    _$jscoverage['/justify-cmd.js'].lineData[32]++;
    editor.notifySelectionChange();
  }
  _$jscoverage['/justify-cmd.js'].lineData[35]++;
  function isAlign(block, textAlign) {
    _$jscoverage['/justify-cmd.js'].functionData[2]++;
    _$jscoverage['/justify-cmd.js'].lineData[36]++;
    var align = visit3_37_1(block.css("text-align").replace(alignRemoveRegex, "") || default_align);
    _$jscoverage['/justify-cmd.js'].lineData[40]++;
    return visit4_40_1(align == textAlign);
  }
  _$jscoverage['/justify-cmd.js'].lineData[43]++;
  return {
  addCommand: function(editor, command, textAlign) {
  _$jscoverage['/justify-cmd.js'].functionData[3]++;
  _$jscoverage['/justify-cmd.js'].lineData[45]++;
  if (visit5_45_1(!editor.hasCommand(command))) {
    _$jscoverage['/justify-cmd.js'].lineData[47]++;
    editor.addCommand(command, {
  exec: function(editor) {
  _$jscoverage['/justify-cmd.js'].functionData[4]++;
  _$jscoverage['/justify-cmd.js'].lineData[49]++;
  exec(editor, textAlign);
}});
    _$jscoverage['/justify-cmd.js'].lineData[53]++;
    editor.addCommand(Editor.Utils.getQueryCmd(command), {
  exec: function(editor) {
  _$jscoverage['/justify-cmd.js'].functionData[5]++;
  _$jscoverage['/justify-cmd.js'].lineData[55]++;
  var selection = editor.getSelection();
  _$jscoverage['/justify-cmd.js'].lineData[56]++;
  if (visit6_56_1(selection && !selection.isInvalid)) {
    _$jscoverage['/justify-cmd.js'].lineData[57]++;
    var startElement = selection.getStartElement();
    _$jscoverage['/justify-cmd.js'].lineData[58]++;
    var path = new Editor.ElementPath(startElement);
    _$jscoverage['/justify-cmd.js'].lineData[59]++;
    var block = visit7_59_1(path.block || path.blockLimit);
    _$jscoverage['/justify-cmd.js'].lineData[60]++;
    if (visit8_60_1(!block || visit9_60_2(block.nodeName() === "body"))) {
      _$jscoverage['/justify-cmd.js'].lineData[61]++;
      return false;
    }
    _$jscoverage['/justify-cmd.js'].lineData[63]++;
    return isAlign(block, textAlign);
  }
}});
  }
}};
}, {
  requires: ['editor']});
