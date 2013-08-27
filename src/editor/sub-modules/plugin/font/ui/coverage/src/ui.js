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
if (! _$jscoverage['/ui.js']) {
  _$jscoverage['/ui.js'] = {};
  _$jscoverage['/ui.js'].lineData = [];
  _$jscoverage['/ui.js'].lineData[5] = 0;
  _$jscoverage['/ui.js'].lineData[7] = 0;
  _$jscoverage['/ui.js'].lineData[10] = 0;
  _$jscoverage['/ui.js'].lineData[12] = 0;
  _$jscoverage['/ui.js'].lineData[13] = 0;
  _$jscoverage['/ui.js'].lineData[15] = 0;
  _$jscoverage['/ui.js'].lineData[18] = 0;
  _$jscoverage['/ui.js'].lineData[19] = 0;
  _$jscoverage['/ui.js'].lineData[20] = 0;
  _$jscoverage['/ui.js'].lineData[23] = 0;
  _$jscoverage['/ui.js'].lineData[27] = 0;
  _$jscoverage['/ui.js'].lineData[30] = 0;
  _$jscoverage['/ui.js'].lineData[31] = 0;
  _$jscoverage['/ui.js'].lineData[32] = 0;
  _$jscoverage['/ui.js'].lineData[33] = 0;
  _$jscoverage['/ui.js'].lineData[34] = 0;
  _$jscoverage['/ui.js'].lineData[35] = 0;
  _$jscoverage['/ui.js'].lineData[36] = 0;
  _$jscoverage['/ui.js'].lineData[37] = 0;
  _$jscoverage['/ui.js'].lineData[38] = 0;
  _$jscoverage['/ui.js'].lineData[42] = 0;
  _$jscoverage['/ui.js'].lineData[49] = 0;
  _$jscoverage['/ui.js'].lineData[52] = 0;
  _$jscoverage['/ui.js'].lineData[55] = 0;
  _$jscoverage['/ui.js'].lineData[56] = 0;
  _$jscoverage['/ui.js'].lineData[57] = 0;
  _$jscoverage['/ui.js'].lineData[58] = 0;
  _$jscoverage['/ui.js'].lineData[59] = 0;
  _$jscoverage['/ui.js'].lineData[61] = 0;
  _$jscoverage['/ui.js'].lineData[62] = 0;
  _$jscoverage['/ui.js'].lineData[65] = 0;
  _$jscoverage['/ui.js'].lineData[67] = 0;
  _$jscoverage['/ui.js'].lineData[68] = 0;
  _$jscoverage['/ui.js'].lineData[70] = 0;
  _$jscoverage['/ui.js'].lineData[71] = 0;
  _$jscoverage['/ui.js'].lineData[72] = 0;
  _$jscoverage['/ui.js'].lineData[74] = 0;
  _$jscoverage['/ui.js'].lineData[89] = 0;
}
if (! _$jscoverage['/ui.js'].functionData) {
  _$jscoverage['/ui.js'].functionData = [];
  _$jscoverage['/ui.js'].functionData[0] = 0;
  _$jscoverage['/ui.js'].functionData[1] = 0;
  _$jscoverage['/ui.js'].functionData[2] = 0;
  _$jscoverage['/ui.js'].functionData[3] = 0;
  _$jscoverage['/ui.js'].functionData[4] = 0;
  _$jscoverage['/ui.js'].functionData[5] = 0;
  _$jscoverage['/ui.js'].functionData[6] = 0;
}
if (! _$jscoverage['/ui.js'].branchData) {
  _$jscoverage['/ui.js'].branchData = {};
  _$jscoverage['/ui.js'].branchData['19'] = [];
  _$jscoverage['/ui.js'].branchData['19'][1] = new BranchData();
  _$jscoverage['/ui.js'].branchData['25'] = [];
  _$jscoverage['/ui.js'].branchData['25'][1] = new BranchData();
  _$jscoverage['/ui.js'].branchData['27'] = [];
  _$jscoverage['/ui.js'].branchData['27'][1] = new BranchData();
  _$jscoverage['/ui.js'].branchData['31'] = [];
  _$jscoverage['/ui.js'].branchData['31'][1] = new BranchData();
  _$jscoverage['/ui.js'].branchData['33'] = [];
  _$jscoverage['/ui.js'].branchData['33'][1] = new BranchData();
  _$jscoverage['/ui.js'].branchData['36'] = [];
  _$jscoverage['/ui.js'].branchData['36'][1] = new BranchData();
  _$jscoverage['/ui.js'].branchData['57'] = [];
  _$jscoverage['/ui.js'].branchData['57'][1] = new BranchData();
  _$jscoverage['/ui.js'].branchData['67'] = [];
  _$jscoverage['/ui.js'].branchData['67'][1] = new BranchData();
  _$jscoverage['/ui.js'].branchData['71'] = [];
  _$jscoverage['/ui.js'].branchData['71'][1] = new BranchData();
}
_$jscoverage['/ui.js'].branchData['71'][1].init(194, 33, 'editor.queryCommandValue(cmdType)');
function visit9_71_1(result) {
  _$jscoverage['/ui.js'].branchData['71'][1].ranCondition(result);
  return result;
}_$jscoverage['/ui.js'].branchData['67'][1].init(24, 45, 'editor.get("mode") == Editor.Mode.SOURCE_MODE');
function visit8_67_1(result) {
  _$jscoverage['/ui.js'].branchData['67'][1].ranCondition(result);
  return result;
}_$jscoverage['/ui.js'].branchData['57'][1].init(74, 7, 'checked');
function visit7_57_1(result) {
  _$jscoverage['/ui.js'].branchData['57'][1].ranCondition(result);
  return result;
}_$jscoverage['/ui.js'].branchData['36'][1].init(147, 35, 'currentValue == value.toLowerCase()');
function visit6_36_1(result) {
  _$jscoverage['/ui.js'].branchData['36'][1].ranCondition(result);
  return result;
}_$jscoverage['/ui.js'].branchData['33'][1].init(117, 19, 'j < children.length');
function visit5_33_1(result) {
  _$jscoverage['/ui.js'].branchData['33'][1].ranCondition(result);
  return result;
}_$jscoverage['/ui.js'].branchData['31'][1].init(205, 22, 'currentValue !== false');
function visit4_31_1(result) {
  _$jscoverage['/ui.js'].branchData['31'][1].ranCondition(result);
  return result;
}_$jscoverage['/ui.js'].branchData['27'][1].init(308, 8, 'children');
function visit3_27_1(result) {
  _$jscoverage['/ui.js'].branchData['27'][1].ranCondition(result);
  return result;
}_$jscoverage['/ui.js'].branchData['25'][1].init(112, 32, 'menu.get && menu.get("children")');
function visit2_25_1(result) {
  _$jscoverage['/ui.js'].branchData['25'][1].ranCondition(result);
  return result;
}_$jscoverage['/ui.js'].branchData['19'][1].init(22, 45, 'editor.get("mode") == Editor.Mode.SOURCE_MODE');
function visit1_19_1(result) {
  _$jscoverage['/ui.js'].branchData['19'][1].ranCondition(result);
  return result;
}_$jscoverage['/ui.js'].lineData[5]++;
KISSY.add("editor/plugin/font/ui", function(S, Editor, Button, MenuButton) {
  _$jscoverage['/ui.js'].functionData[0]++;
  _$jscoverage['/ui.js'].lineData[7]++;
  var FontSelect = MenuButton.Select.extend({
  initializer: function() {
  _$jscoverage['/ui.js'].functionData[1]++;
  _$jscoverage['/ui.js'].lineData[10]++;
  var self = this, editor = self.get("editor");
  _$jscoverage['/ui.js'].lineData[12]++;
  self.on("click", function(ev) {
  _$jscoverage['/ui.js'].functionData[2]++;
  _$jscoverage['/ui.js'].lineData[13]++;
  var v = ev.target.get("value"), cmdType = self.get("cmdType");
  _$jscoverage['/ui.js'].lineData[15]++;
  editor.execCommand(cmdType, v);
});
  _$jscoverage['/ui.js'].lineData[18]++;
  editor.on("selectionChange", function() {
  _$jscoverage['/ui.js'].functionData[3]++;
  _$jscoverage['/ui.js'].lineData[19]++;
  if (visit1_19_1(editor.get("mode") == Editor.Mode.SOURCE_MODE)) {
    _$jscoverage['/ui.js'].lineData[20]++;
    return;
  }
  _$jscoverage['/ui.js'].lineData[23]++;
  var cmdType = self.get("cmdType"), menu = self.get("menu"), children = visit2_25_1(menu.get && menu.get("children"));
  _$jscoverage['/ui.js'].lineData[27]++;
  if (visit3_27_1(children)) {
    _$jscoverage['/ui.js'].lineData[30]++;
    var currentValue = editor.queryCommandValue(cmdType);
    _$jscoverage['/ui.js'].lineData[31]++;
    if (visit4_31_1(currentValue !== false)) {
      _$jscoverage['/ui.js'].lineData[32]++;
      currentValue = (currentValue + "").toLowerCase();
      _$jscoverage['/ui.js'].lineData[33]++;
      for (var j = 0; visit5_33_1(j < children.length); j++) {
        _$jscoverage['/ui.js'].lineData[34]++;
        var item = children[j];
        _$jscoverage['/ui.js'].lineData[35]++;
        var value = item.get("value");
        _$jscoverage['/ui.js'].lineData[36]++;
        if (visit6_36_1(currentValue == value.toLowerCase())) {
          _$jscoverage['/ui.js'].lineData[37]++;
          self.set("value", value);
          _$jscoverage['/ui.js'].lineData[38]++;
          return;
        }
      }
    }
    _$jscoverage['/ui.js'].lineData[42]++;
    self.set("value", null);
  }
});
}});
  _$jscoverage['/ui.js'].lineData[49]++;
  var FontButton = Button.extend({
  initializer: function() {
  _$jscoverage['/ui.js'].functionData[4]++;
  _$jscoverage['/ui.js'].lineData[52]++;
  var self = this, editor = self.get("editor"), cmdType = self.get("cmdType");
  _$jscoverage['/ui.js'].lineData[55]++;
  self.on("click", function() {
  _$jscoverage['/ui.js'].functionData[5]++;
  _$jscoverage['/ui.js'].lineData[56]++;
  var checked = self.get("checked");
  _$jscoverage['/ui.js'].lineData[57]++;
  if (visit7_57_1(checked)) {
    _$jscoverage['/ui.js'].lineData[58]++;
    editor.execCommand(cmdType);
    _$jscoverage['/ui.js'].lineData[59]++;
    editor.focus();
  } else {
    _$jscoverage['/ui.js'].lineData[61]++;
    editor.execCommand(cmdType, false);
    _$jscoverage['/ui.js'].lineData[62]++;
    editor.focus();
  }
});
  _$jscoverage['/ui.js'].lineData[65]++;
  editor.on("selectionChange", function() {
  _$jscoverage['/ui.js'].functionData[6]++;
  _$jscoverage['/ui.js'].lineData[67]++;
  if (visit8_67_1(editor.get("mode") == Editor.Mode.SOURCE_MODE)) {
    _$jscoverage['/ui.js'].lineData[68]++;
    return;
  }
  _$jscoverage['/ui.js'].lineData[70]++;
  var cmdType = self.get("cmdType");
  _$jscoverage['/ui.js'].lineData[71]++;
  if (visit9_71_1(editor.queryCommandValue(cmdType))) {
    _$jscoverage['/ui.js'].lineData[72]++;
    self.set("checked", true);
  } else {
    _$jscoverage['/ui.js'].lineData[74]++;
    self.set("checked", false);
  }
});
}}, {
  ATTRS: {
  checkable: {
  value: true}, 
  mode: {
  value: Editor.Mode.WYSIWYG_MODE}}});
  _$jscoverage['/ui.js'].lineData[89]++;
  return {
  Button: FontButton, 
  Select: FontSelect};
}, {
  requires: ['editor', '../button', '../menubutton']});
