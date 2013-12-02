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
if (! _$jscoverage['/btn.js']) {
  _$jscoverage['/btn.js'] = {};
  _$jscoverage['/btn.js'].lineData = [];
  _$jscoverage['/btn.js'].lineData[6] = 0;
  _$jscoverage['/btn.js'].lineData[7] = 0;
  _$jscoverage['/btn.js'].lineData[8] = 0;
  _$jscoverage['/btn.js'].lineData[9] = 0;
  _$jscoverage['/btn.js'].lineData[14] = 0;
  _$jscoverage['/btn.js'].lineData[17] = 0;
  _$jscoverage['/btn.js'].lineData[18] = 0;
  _$jscoverage['/btn.js'].lineData[20] = 0;
  _$jscoverage['/btn.js'].lineData[21] = 0;
  _$jscoverage['/btn.js'].lineData[23] = 0;
  _$jscoverage['/btn.js'].lineData[24] = 0;
  _$jscoverage['/btn.js'].lineData[26] = 0;
  _$jscoverage['/btn.js'].lineData[40] = 0;
  _$jscoverage['/btn.js'].lineData[41] = 0;
  _$jscoverage['/btn.js'].lineData[43] = 0;
  _$jscoverage['/btn.js'].lineData[50] = 0;
  _$jscoverage['/btn.js'].lineData[55] = 0;
  _$jscoverage['/btn.js'].lineData[57] = 0;
  _$jscoverage['/btn.js'].lineData[58] = 0;
  _$jscoverage['/btn.js'].lineData[60] = 0;
  _$jscoverage['/btn.js'].lineData[61] = 0;
  _$jscoverage['/btn.js'].lineData[64] = 0;
  _$jscoverage['/btn.js'].lineData[65] = 0;
  _$jscoverage['/btn.js'].lineData[67] = 0;
  _$jscoverage['/btn.js'].lineData[82] = 0;
  _$jscoverage['/btn.js'].lineData[83] = 0;
  _$jscoverage['/btn.js'].lineData[85] = 0;
  _$jscoverage['/btn.js'].lineData[92] = 0;
}
if (! _$jscoverage['/btn.js'].functionData) {
  _$jscoverage['/btn.js'].functionData = [];
  _$jscoverage['/btn.js'].functionData[0] = 0;
  _$jscoverage['/btn.js'].functionData[1] = 0;
  _$jscoverage['/btn.js'].functionData[2] = 0;
  _$jscoverage['/btn.js'].functionData[3] = 0;
  _$jscoverage['/btn.js'].functionData[4] = 0;
  _$jscoverage['/btn.js'].functionData[5] = 0;
  _$jscoverage['/btn.js'].functionData[6] = 0;
  _$jscoverage['/btn.js'].functionData[7] = 0;
  _$jscoverage['/btn.js'].functionData[8] = 0;
}
if (! _$jscoverage['/btn.js'].branchData) {
  _$jscoverage['/btn.js'].branchData = {};
  _$jscoverage['/btn.js'].branchData['23'] = [];
  _$jscoverage['/btn.js'].branchData['23'][1] = new BranchData();
  _$jscoverage['/btn.js'].branchData['40'] = [];
  _$jscoverage['/btn.js'].branchData['40'][1] = new BranchData();
  _$jscoverage['/btn.js'].branchData['64'] = [];
  _$jscoverage['/btn.js'].branchData['64'][1] = new BranchData();
  _$jscoverage['/btn.js'].branchData['82'] = [];
  _$jscoverage['/btn.js'].branchData['82'][1] = new BranchData();
}
_$jscoverage['/btn.js'].branchData['82'][1].init(69, 11, 'this.__lock');
function visit4_82_1(result) {
  _$jscoverage['/btn.js'].branchData['82'][1].ranCondition(result);
  return result;
}_$jscoverage['/btn.js'].branchData['64'][1].init(126, 26, 'index < history.length - 1');
function visit3_64_1(result) {
  _$jscoverage['/btn.js'].branchData['64'][1].ranCondition(result);
  return result;
}_$jscoverage['/btn.js'].branchData['40'][1].init(69, 11, 'this.__lock');
function visit2_40_1(result) {
  _$jscoverage['/btn.js'].branchData['40'][1].ranCondition(result);
  return result;
}_$jscoverage['/btn.js'].branchData['23'][1].init(84, 9, 'index > 0');
function visit1_23_1(result) {
  _$jscoverage['/btn.js'].branchData['23'][1].ranCondition(result);
  return result;
}_$jscoverage['/btn.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/btn.js'].functionData[0]++;
  _$jscoverage['/btn.js'].lineData[7]++;
  var Button = require('../button');
  _$jscoverage['/btn.js'].lineData[8]++;
  var Editor = require('editor');
  _$jscoverage['/btn.js'].lineData[9]++;
  var UndoBtn = Button.extend({
  __lock: true, 
  bindUI: function() {
  _$jscoverage['/btn.js'].functionData[1]++;
  _$jscoverage['/btn.js'].lineData[14]++;
  var self = this, editor = self.get('editor');
  _$jscoverage['/btn.js'].lineData[17]++;
  self.on('click', function() {
  _$jscoverage['/btn.js'].functionData[2]++;
  _$jscoverage['/btn.js'].lineData[18]++;
  editor.execCommand('undo');
});
  _$jscoverage['/btn.js'].lineData[20]++;
  editor.on('afterUndo afterRedo afterSave', function(ev) {
  _$jscoverage['/btn.js'].functionData[3]++;
  _$jscoverage['/btn.js'].lineData[21]++;
  var index = ev.index;
  _$jscoverage['/btn.js'].lineData[23]++;
  if (visit1_23_1(index > 0)) {
    _$jscoverage['/btn.js'].lineData[24]++;
    self.set('disabled', self.__lock = false);
  } else {
    _$jscoverage['/btn.js'].lineData[26]++;
    self.set('disabled', self.__lock = true);
  }
});
}}, {
  ATTRS: {
  mode: {
  value: Editor.Mode.WYSIWYG_MODE}, 
  disabled: {
  value: true, 
  setter: function(v) {
  _$jscoverage['/btn.js'].functionData[4]++;
  _$jscoverage['/btn.js'].lineData[40]++;
  if (visit2_40_1(this.__lock)) {
    _$jscoverage['/btn.js'].lineData[41]++;
    v = true;
  }
  _$jscoverage['/btn.js'].lineData[43]++;
  return v;
}}}});
  _$jscoverage['/btn.js'].lineData[50]++;
  var RedoBtn = Button.extend({
  __lock: true, 
  bindUI: function() {
  _$jscoverage['/btn.js'].functionData[5]++;
  _$jscoverage['/btn.js'].lineData[55]++;
  var self = this, editor = self.get('editor');
  _$jscoverage['/btn.js'].lineData[57]++;
  self.on('click', function() {
  _$jscoverage['/btn.js'].functionData[6]++;
  _$jscoverage['/btn.js'].lineData[58]++;
  editor.execCommand('redo');
});
  _$jscoverage['/btn.js'].lineData[60]++;
  editor.on('afterUndo afterRedo afterSave', function(ev) {
  _$jscoverage['/btn.js'].functionData[7]++;
  _$jscoverage['/btn.js'].lineData[61]++;
  var history = ev.history, index = ev.index;
  _$jscoverage['/btn.js'].lineData[64]++;
  if (visit3_64_1(index < history.length - 1)) {
    _$jscoverage['/btn.js'].lineData[65]++;
    self.set('disabled', self.__lock = false);
  } else {
    _$jscoverage['/btn.js'].lineData[67]++;
    self.set('disabled', self.__lock = true);
  }
});
}}, {
  ATTRS: {
  mode: {
  value: Editor.Mode.WYSIWYG_MODE}, 
  disabled: {
  value: true, 
  setter: function(v) {
  _$jscoverage['/btn.js'].functionData[8]++;
  _$jscoverage['/btn.js'].lineData[82]++;
  if (visit4_82_1(this.__lock)) {
    _$jscoverage['/btn.js'].lineData[83]++;
    v = true;
  }
  _$jscoverage['/btn.js'].lineData[85]++;
  return v;
}}}});
  _$jscoverage['/btn.js'].lineData[92]++;
  return {
  RedoBtn: RedoBtn, 
  UndoBtn: UndoBtn};
});
