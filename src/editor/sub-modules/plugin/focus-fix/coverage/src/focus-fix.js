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
if (! _$jscoverage['/focus-fix.js']) {
  _$jscoverage['/focus-fix.js'] = {};
  _$jscoverage['/focus-fix.js'].lineData = [];
  _$jscoverage['/focus-fix.js'].lineData[6] = 0;
  _$jscoverage['/focus-fix.js'].lineData[7] = 0;
  _$jscoverage['/focus-fix.js'].lineData[8] = 0;
  _$jscoverage['/focus-fix.js'].lineData[11] = 0;
  _$jscoverage['/focus-fix.js'].lineData[12] = 0;
  _$jscoverage['/focus-fix.js'].lineData[15] = 0;
  _$jscoverage['/focus-fix.js'].lineData[16] = 0;
  _$jscoverage['/focus-fix.js'].lineData[23] = 0;
  _$jscoverage['/focus-fix.js'].lineData[27] = 0;
  _$jscoverage['/focus-fix.js'].lineData[28] = 0;
  _$jscoverage['/focus-fix.js'].lineData[30] = 0;
  _$jscoverage['/focus-fix.js'].lineData[34] = 0;
  _$jscoverage['/focus-fix.js'].lineData[35] = 0;
  _$jscoverage['/focus-fix.js'].lineData[37] = 0;
  _$jscoverage['/focus-fix.js'].lineData[39] = 0;
  _$jscoverage['/focus-fix.js'].lineData[40] = 0;
  _$jscoverage['/focus-fix.js'].lineData[47] = 0;
  _$jscoverage['/focus-fix.js'].lineData[48] = 0;
  _$jscoverage['/focus-fix.js'].lineData[49] = 0;
  _$jscoverage['/focus-fix.js'].lineData[50] = 0;
  _$jscoverage['/focus-fix.js'].lineData[56] = 0;
  _$jscoverage['/focus-fix.js'].lineData[57] = 0;
  _$jscoverage['/focus-fix.js'].lineData[59] = 0;
  _$jscoverage['/focus-fix.js'].lineData[60] = 0;
  _$jscoverage['/focus-fix.js'].lineData[64] = 0;
  _$jscoverage['/focus-fix.js'].lineData[66] = 0;
  _$jscoverage['/focus-fix.js'].lineData[67] = 0;
  _$jscoverage['/focus-fix.js'].lineData[68] = 0;
  _$jscoverage['/focus-fix.js'].lineData[71] = 0;
  _$jscoverage['/focus-fix.js'].lineData[72] = 0;
}
if (! _$jscoverage['/focus-fix.js'].functionData) {
  _$jscoverage['/focus-fix.js'].functionData = [];
  _$jscoverage['/focus-fix.js'].functionData[0] = 0;
  _$jscoverage['/focus-fix.js'].functionData[1] = 0;
  _$jscoverage['/focus-fix.js'].functionData[2] = 0;
  _$jscoverage['/focus-fix.js'].functionData[3] = 0;
  _$jscoverage['/focus-fix.js'].functionData[4] = 0;
  _$jscoverage['/focus-fix.js'].functionData[5] = 0;
}
if (! _$jscoverage['/focus-fix.js'].branchData) {
  _$jscoverage['/focus-fix.js'].branchData = {};
  _$jscoverage['/focus-fix.js'].branchData['23'] = [];
  _$jscoverage['/focus-fix.js'].branchData['23'][1] = new BranchData();
  _$jscoverage['/focus-fix.js'].branchData['39'] = [];
  _$jscoverage['/focus-fix.js'].branchData['39'][1] = new BranchData();
  _$jscoverage['/focus-fix.js'].branchData['46'] = [];
  _$jscoverage['/focus-fix.js'].branchData['46'][1] = new BranchData();
  _$jscoverage['/focus-fix.js'].branchData['46'][2] = new BranchData();
  _$jscoverage['/focus-fix.js'].branchData['59'] = [];
  _$jscoverage['/focus-fix.js'].branchData['59'][1] = new BranchData();
  _$jscoverage['/focus-fix.js'].branchData['67'] = [];
  _$jscoverage['/focus-fix.js'].branchData['67'][1] = new BranchData();
}
_$jscoverage['/focus-fix.js'].branchData['67'][1].init(21, 8, 'e.newVal');
function visit6_67_1(result) {
  _$jscoverage['/focus-fix.js'].branchData['67'][1].ranCondition(result);
  return result;
}_$jscoverage['/focus-fix.js'].branchData['59'][1].init(78, 6, 'editor');
function visit5_59_1(result) {
  _$jscoverage['/focus-fix.js'].branchData['59'][1].ranCondition(result);
  return result;
}_$jscoverage['/focus-fix.js'].branchData['46'][2].init(269, 58, '$range.item(0).ownerDocument === editor.get(\'document\')[0]');
function visit4_46_2(result) {
  _$jscoverage['/focus-fix.js'].branchData['46'][2].ranCondition(result);
  return result;
}_$jscoverage['/focus-fix.js'].branchData['46'][1].init(235, 73, '$range.item && $range.item(0).ownerDocument === editor.get(\'document\')[0]');
function visit3_46_1(result) {
  _$jscoverage['/focus-fix.js'].branchData['46'][1].ranCondition(result);
  return result;
}_$jscoverage['/focus-fix.js'].branchData['39'][1].init(471, 6, '$range');
function visit2_39_1(result) {
  _$jscoverage['/focus-fix.js'].branchData['39'][1].ranCondition(result);
  return result;
}_$jscoverage['/focus-fix.js'].branchData['23'][1].init(439, 15, 'UA.ie && editor');
function visit1_23_1(result) {
  _$jscoverage['/focus-fix.js'].branchData['23'][1].ranCondition(result);
  return result;
}_$jscoverage['/focus-fix.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/focus-fix.js'].functionData[0]++;
  _$jscoverage['/focus-fix.js'].lineData[7]++;
  var Editor = require('editor');
  _$jscoverage['/focus-fix.js'].lineData[8]++;
  var UA = S.UA, focusManager = Editor.focusManager;
  _$jscoverage['/focus-fix.js'].lineData[11]++;
  function _show4FocusExt() {
    _$jscoverage['/focus-fix.js'].functionData[1]++;
    _$jscoverage['/focus-fix.js'].lineData[12]++;
    var self = this;
    _$jscoverage['/focus-fix.js'].lineData[15]++;
    self._focusEditor = focusManager.currentInstance();
    _$jscoverage['/focus-fix.js'].lineData[16]++;
    var editor = self._focusEditor;
    _$jscoverage['/focus-fix.js'].lineData[23]++;
    if (visit1_23_1(UA.ie && editor)) {
      _$jscoverage['/focus-fix.js'].lineData[27]++;
      window.focus();
      _$jscoverage['/focus-fix.js'].lineData[28]++;
      document.body.focus();
      _$jscoverage['/focus-fix.js'].lineData[30]++;
      var $selection = editor.get('document')[0].selection, $range;
      _$jscoverage['/focus-fix.js'].lineData[34]++;
      try {
        _$jscoverage['/focus-fix.js'].lineData[35]++;
        $range = $selection.createRange();
      }      catch (e) {
  _$jscoverage['/focus-fix.js'].lineData[37]++;
  $range = 0;
}
      _$jscoverage['/focus-fix.js'].lineData[39]++;
      if (visit2_39_1($range)) {
        _$jscoverage['/focus-fix.js'].lineData[40]++;
        if (visit3_46_1($range.item && visit4_46_2($range.item(0).ownerDocument === editor.get('document')[0]))) {
          _$jscoverage['/focus-fix.js'].lineData[47]++;
          var $myRange = document.body.createTextRange();
          _$jscoverage['/focus-fix.js'].lineData[48]++;
          $myRange.moveToElementText(self.get('el').first()[0]);
          _$jscoverage['/focus-fix.js'].lineData[49]++;
          $myRange.collapse(true);
          _$jscoverage['/focus-fix.js'].lineData[50]++;
          $myRange.select();
        }
      }
    }
  }
  _$jscoverage['/focus-fix.js'].lineData[56]++;
  function _hide4FocusExt() {
    _$jscoverage['/focus-fix.js'].functionData[2]++;
    _$jscoverage['/focus-fix.js'].lineData[57]++;
    var self = this, editor = self._focusEditor;
    _$jscoverage['/focus-fix.js'].lineData[59]++;
    if (visit5_59_1(editor)) {
      _$jscoverage['/focus-fix.js'].lineData[60]++;
      editor.focus();
    }
  }
  _$jscoverage['/focus-fix.js'].lineData[64]++;
  return {
  init: function(self) {
  _$jscoverage['/focus-fix.js'].functionData[3]++;
  _$jscoverage['/focus-fix.js'].lineData[66]++;
  self.on('beforeVisibleChange', function(e) {
  _$jscoverage['/focus-fix.js'].functionData[4]++;
  _$jscoverage['/focus-fix.js'].lineData[67]++;
  if (visit6_67_1(e.newVal)) {
    _$jscoverage['/focus-fix.js'].lineData[68]++;
    _show4FocusExt.call(self);
  }
});
  _$jscoverage['/focus-fix.js'].lineData[71]++;
  self.on('hide', function() {
  _$jscoverage['/focus-fix.js'].functionData[5]++;
  _$jscoverage['/focus-fix.js'].lineData[72]++;
  _hide4FocusExt.call(self);
});
}};
});
