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
  _$jscoverage['/ui.js'].lineData[6] = 0;
  _$jscoverage['/ui.js'].lineData[7] = 0;
  _$jscoverage['/ui.js'].lineData[8] = 0;
  _$jscoverage['/ui.js'].lineData[9] = 0;
  _$jscoverage['/ui.js'].lineData[11] = 0;
  _$jscoverage['/ui.js'].lineData[14] = 0;
  _$jscoverage['/ui.js'].lineData[16] = 0;
  _$jscoverage['/ui.js'].lineData[17] = 0;
  _$jscoverage['/ui.js'].lineData[19] = 0;
  _$jscoverage['/ui.js'].lineData[22] = 0;
  _$jscoverage['/ui.js'].lineData[23] = 0;
  _$jscoverage['/ui.js'].lineData[24] = 0;
  _$jscoverage['/ui.js'].lineData[27] = 0;
  _$jscoverage['/ui.js'].lineData[31] = 0;
  _$jscoverage['/ui.js'].lineData[34] = 0;
  _$jscoverage['/ui.js'].lineData[35] = 0;
  _$jscoverage['/ui.js'].lineData[36] = 0;
  _$jscoverage['/ui.js'].lineData[37] = 0;
  _$jscoverage['/ui.js'].lineData[38] = 0;
  _$jscoverage['/ui.js'].lineData[39] = 0;
  _$jscoverage['/ui.js'].lineData[40] = 0;
  _$jscoverage['/ui.js'].lineData[41] = 0;
  _$jscoverage['/ui.js'].lineData[42] = 0;
  _$jscoverage['/ui.js'].lineData[46] = 0;
  _$jscoverage['/ui.js'].lineData[53] = 0;
  _$jscoverage['/ui.js'].lineData[56] = 0;
  _$jscoverage['/ui.js'].lineData[59] = 0;
  _$jscoverage['/ui.js'].lineData[60] = 0;
  _$jscoverage['/ui.js'].lineData[61] = 0;
  _$jscoverage['/ui.js'].lineData[62] = 0;
  _$jscoverage['/ui.js'].lineData[63] = 0;
  _$jscoverage['/ui.js'].lineData[65] = 0;
  _$jscoverage['/ui.js'].lineData[66] = 0;
  _$jscoverage['/ui.js'].lineData[69] = 0;
  _$jscoverage['/ui.js'].lineData[71] = 0;
  _$jscoverage['/ui.js'].lineData[72] = 0;
  _$jscoverage['/ui.js'].lineData[74] = 0;
  _$jscoverage['/ui.js'].lineData[75] = 0;
  _$jscoverage['/ui.js'].lineData[76] = 0;
  _$jscoverage['/ui.js'].lineData[78] = 0;
  _$jscoverage['/ui.js'].lineData[93] = 0;
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
  _$jscoverage['/ui.js'].branchData['23'] = [];
  _$jscoverage['/ui.js'].branchData['23'][1] = new BranchData();
  _$jscoverage['/ui.js'].branchData['29'] = [];
  _$jscoverage['/ui.js'].branchData['29'][1] = new BranchData();
  _$jscoverage['/ui.js'].branchData['31'] = [];
  _$jscoverage['/ui.js'].branchData['31'][1] = new BranchData();
  _$jscoverage['/ui.js'].branchData['35'] = [];
  _$jscoverage['/ui.js'].branchData['35'][1] = new BranchData();
  _$jscoverage['/ui.js'].branchData['37'] = [];
  _$jscoverage['/ui.js'].branchData['37'][1] = new BranchData();
  _$jscoverage['/ui.js'].branchData['40'] = [];
  _$jscoverage['/ui.js'].branchData['40'][1] = new BranchData();
  _$jscoverage['/ui.js'].branchData['61'] = [];
  _$jscoverage['/ui.js'].branchData['61'][1] = new BranchData();
  _$jscoverage['/ui.js'].branchData['71'] = [];
  _$jscoverage['/ui.js'].branchData['71'][1] = new BranchData();
  _$jscoverage['/ui.js'].branchData['75'] = [];
  _$jscoverage['/ui.js'].branchData['75'][1] = new BranchData();
}
_$jscoverage['/ui.js'].branchData['75'][1].init(189, 33, 'editor.queryCommandValue(cmdType)');
function visit9_75_1(result) {
  _$jscoverage['/ui.js'].branchData['75'][1].ranCondition(result);
  return result;
}_$jscoverage['/ui.js'].branchData['71'][1].init(22, 46, 'editor.get(\'mode\') === Editor.Mode.SOURCE_MODE');
function visit8_71_1(result) {
  _$jscoverage['/ui.js'].branchData['71'][1].ranCondition(result);
  return result;
}_$jscoverage['/ui.js'].branchData['61'][1].init(72, 7, 'checked');
function visit7_61_1(result) {
  _$jscoverage['/ui.js'].branchData['61'][1].ranCondition(result);
  return result;
}_$jscoverage['/ui.js'].branchData['40'][1].init(144, 36, 'currentValue === value.toLowerCase()');
function visit6_40_1(result) {
  _$jscoverage['/ui.js'].branchData['40'][1].ranCondition(result);
  return result;
}_$jscoverage['/ui.js'].branchData['37'][1].init(115, 19, 'j < children.length');
function visit5_37_1(result) {
  _$jscoverage['/ui.js'].branchData['37'][1].ranCondition(result);
  return result;
}_$jscoverage['/ui.js'].branchData['35'][1].init(201, 22, 'currentValue !== false');
function visit4_35_1(result) {
  _$jscoverage['/ui.js'].branchData['35'][1].ranCondition(result);
  return result;
}_$jscoverage['/ui.js'].branchData['31'][1].init(300, 8, 'children');
function visit3_31_1(result) {
  _$jscoverage['/ui.js'].branchData['31'][1].ranCondition(result);
  return result;
}_$jscoverage['/ui.js'].branchData['29'][1].init(110, 32, 'menu.get && menu.get(\'children\')');
function visit2_29_1(result) {
  _$jscoverage['/ui.js'].branchData['29'][1].ranCondition(result);
  return result;
}_$jscoverage['/ui.js'].branchData['23'][1].init(21, 46, 'editor.get(\'mode\') === Editor.Mode.SOURCE_MODE');
function visit1_23_1(result) {
  _$jscoverage['/ui.js'].branchData['23'][1].ranCondition(result);
  return result;
}_$jscoverage['/ui.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/ui.js'].functionData[0]++;
  _$jscoverage['/ui.js'].lineData[7]++;
  var Editor = require('editor');
  _$jscoverage['/ui.js'].lineData[8]++;
  var Button = require('../button');
  _$jscoverage['/ui.js'].lineData[9]++;
  var MenuButton = require('../menubutton');
  _$jscoverage['/ui.js'].lineData[11]++;
  var FontSelect = MenuButton.Select.extend({
  initializer: function() {
  _$jscoverage['/ui.js'].functionData[1]++;
  _$jscoverage['/ui.js'].lineData[14]++;
  var self = this, editor = self.get('editor');
  _$jscoverage['/ui.js'].lineData[16]++;
  self.on('click', function(ev) {
  _$jscoverage['/ui.js'].functionData[2]++;
  _$jscoverage['/ui.js'].lineData[17]++;
  var v = ev.target.get('value'), cmdType = self.get('cmdType');
  _$jscoverage['/ui.js'].lineData[19]++;
  editor.execCommand(cmdType, v);
});
  _$jscoverage['/ui.js'].lineData[22]++;
  editor.on('selectionChange', function() {
  _$jscoverage['/ui.js'].functionData[3]++;
  _$jscoverage['/ui.js'].lineData[23]++;
  if (visit1_23_1(editor.get('mode') === Editor.Mode.SOURCE_MODE)) {
    _$jscoverage['/ui.js'].lineData[24]++;
    return;
  }
  _$jscoverage['/ui.js'].lineData[27]++;
  var cmdType = self.get('cmdType'), menu = self.get('menu'), children = visit2_29_1(menu.get && menu.get('children'));
  _$jscoverage['/ui.js'].lineData[31]++;
  if (visit3_31_1(children)) {
    _$jscoverage['/ui.js'].lineData[34]++;
    var currentValue = editor.queryCommandValue(cmdType);
    _$jscoverage['/ui.js'].lineData[35]++;
    if (visit4_35_1(currentValue !== false)) {
      _$jscoverage['/ui.js'].lineData[36]++;
      currentValue = (currentValue + '').toLowerCase();
      _$jscoverage['/ui.js'].lineData[37]++;
      for (var j = 0; visit5_37_1(j < children.length); j++) {
        _$jscoverage['/ui.js'].lineData[38]++;
        var item = children[j];
        _$jscoverage['/ui.js'].lineData[39]++;
        var value = item.get('value');
        _$jscoverage['/ui.js'].lineData[40]++;
        if (visit6_40_1(currentValue === value.toLowerCase())) {
          _$jscoverage['/ui.js'].lineData[41]++;
          self.set('value', value);
          _$jscoverage['/ui.js'].lineData[42]++;
          return;
        }
      }
    }
    _$jscoverage['/ui.js'].lineData[46]++;
    self.set('value', null);
  }
});
}});
  _$jscoverage['/ui.js'].lineData[53]++;
  var FontButton = Button.extend({
  initializer: function() {
  _$jscoverage['/ui.js'].functionData[4]++;
  _$jscoverage['/ui.js'].lineData[56]++;
  var self = this, editor = self.get('editor'), cmdType = self.get('cmdType');
  _$jscoverage['/ui.js'].lineData[59]++;
  self.on('click', function() {
  _$jscoverage['/ui.js'].functionData[5]++;
  _$jscoverage['/ui.js'].lineData[60]++;
  var checked = self.get('checked');
  _$jscoverage['/ui.js'].lineData[61]++;
  if (visit7_61_1(checked)) {
    _$jscoverage['/ui.js'].lineData[62]++;
    editor.execCommand(cmdType);
    _$jscoverage['/ui.js'].lineData[63]++;
    editor.focus();
  } else {
    _$jscoverage['/ui.js'].lineData[65]++;
    editor.execCommand(cmdType, false);
    _$jscoverage['/ui.js'].lineData[66]++;
    editor.focus();
  }
});
  _$jscoverage['/ui.js'].lineData[69]++;
  editor.on('selectionChange', function() {
  _$jscoverage['/ui.js'].functionData[6]++;
  _$jscoverage['/ui.js'].lineData[71]++;
  if (visit8_71_1(editor.get('mode') === Editor.Mode.SOURCE_MODE)) {
    _$jscoverage['/ui.js'].lineData[72]++;
    return;
  }
  _$jscoverage['/ui.js'].lineData[74]++;
  var cmdType = self.get('cmdType');
  _$jscoverage['/ui.js'].lineData[75]++;
  if (visit9_75_1(editor.queryCommandValue(cmdType))) {
    _$jscoverage['/ui.js'].lineData[76]++;
    self.set('checked', true);
  } else {
    _$jscoverage['/ui.js'].lineData[78]++;
    self.set('checked', false);
  }
});
}}, {
  ATTRS: {
  checkable: {
  value: true}, 
  mode: {
  value: Editor.Mode.WYSIWYG_MODE}}});
  _$jscoverage['/ui.js'].lineData[93]++;
  return {
  Button: FontButton, 
  Select: FontSelect};
});
