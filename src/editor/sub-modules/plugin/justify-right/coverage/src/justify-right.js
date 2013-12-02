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
if (! _$jscoverage['/justify-right.js']) {
  _$jscoverage['/justify-right.js'] = {};
  _$jscoverage['/justify-right.js'].lineData = [];
  _$jscoverage['/justify-right.js'].lineData[6] = 0;
  _$jscoverage['/justify-right.js'].lineData[7] = 0;
  _$jscoverage['/justify-right.js'].lineData[8] = 0;
  _$jscoverage['/justify-right.js'].lineData[9] = 0;
  _$jscoverage['/justify-right.js'].lineData[10] = 0;
  _$jscoverage['/justify-right.js'].lineData[11] = 0;
  _$jscoverage['/justify-right.js'].lineData[12] = 0;
  _$jscoverage['/justify-right.js'].lineData[13] = 0;
  _$jscoverage['/justify-right.js'].lineData[16] = 0;
  _$jscoverage['/justify-right.js'].lineData[20] = 0;
  _$jscoverage['/justify-right.js'].lineData[23] = 0;
  _$jscoverage['/justify-right.js'].lineData[25] = 0;
  _$jscoverage['/justify-right.js'].lineData[31] = 0;
  _$jscoverage['/justify-right.js'].lineData[32] = 0;
  _$jscoverage['/justify-right.js'].lineData[33] = 0;
  _$jscoverage['/justify-right.js'].lineData[34] = 0;
  _$jscoverage['/justify-right.js'].lineData[36] = 0;
  _$jscoverage['/justify-right.js'].lineData[37] = 0;
  _$jscoverage['/justify-right.js'].lineData[39] = 0;
  _$jscoverage['/justify-right.js'].lineData[48] = 0;
  _$jscoverage['/justify-right.js'].lineData[49] = 0;
  _$jscoverage['/justify-right.js'].lineData[50] = 0;
  _$jscoverage['/justify-right.js'].lineData[51] = 0;
  _$jscoverage['/justify-right.js'].lineData[52] = 0;
  _$jscoverage['/justify-right.js'].lineData[59] = 0;
}
if (! _$jscoverage['/justify-right.js'].functionData) {
  _$jscoverage['/justify-right.js'].functionData = [];
  _$jscoverage['/justify-right.js'].functionData[0] = 0;
  _$jscoverage['/justify-right.js'].functionData[1] = 0;
  _$jscoverage['/justify-right.js'].functionData[2] = 0;
  _$jscoverage['/justify-right.js'].functionData[3] = 0;
  _$jscoverage['/justify-right.js'].functionData[4] = 0;
  _$jscoverage['/justify-right.js'].functionData[5] = 0;
  _$jscoverage['/justify-right.js'].functionData[6] = 0;
  _$jscoverage['/justify-right.js'].functionData[7] = 0;
}
if (! _$jscoverage['/justify-right.js'].branchData) {
  _$jscoverage['/justify-right.js'].branchData = {};
  _$jscoverage['/justify-right.js'].branchData['33'] = [];
  _$jscoverage['/justify-right.js'].branchData['33'][1] = new BranchData();
  _$jscoverage['/justify-right.js'].branchData['36'] = [];
  _$jscoverage['/justify-right.js'].branchData['36'][1] = new BranchData();
  _$jscoverage['/justify-right.js'].branchData['50'] = [];
  _$jscoverage['/justify-right.js'].branchData['50'][1] = new BranchData();
  _$jscoverage['/justify-right.js'].branchData['50'][2] = new BranchData();
}
_$jscoverage['/justify-right.js'].branchData['50'][2].init(38, 30, 'e.keyCode === S.Node.KeyCode.R');
function visit4_50_2(result) {
  _$jscoverage['/justify-right.js'].branchData['50'][2].ranCondition(result);
  return result;
}_$jscoverage['/justify-right.js'].branchData['50'][1].init(25, 43, 'e.ctrlKey && e.keyCode === S.Node.KeyCode.R');
function visit3_50_1(result) {
  _$jscoverage['/justify-right.js'].branchData['50'][1].ranCondition(result);
  return result;
}_$jscoverage['/justify-right.js'].branchData['36'][1].init(185, 40, 'editor.queryCommandValue(\'justifyRight\')');
function visit2_36_1(result) {
  _$jscoverage['/justify-right.js'].branchData['36'][1].ranCondition(result);
  return result;
}_$jscoverage['/justify-right.js'].branchData['33'][1].init(33, 46, 'editor.get(\'mode\') === Editor.Mode.SOURCE_MODE');
function visit1_33_1(result) {
  _$jscoverage['/justify-right.js'].branchData['33'][1].ranCondition(result);
  return result;
}_$jscoverage['/justify-right.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/justify-right.js'].functionData[0]++;
  _$jscoverage['/justify-right.js'].lineData[7]++;
  var Editor = require('editor');
  _$jscoverage['/justify-right.js'].lineData[8]++;
  var justifyCenterCmd = require('./justify-right/cmd');
  _$jscoverage['/justify-right.js'].lineData[9]++;
  require('./button');
  _$jscoverage['/justify-right.js'].lineData[10]++;
  function exec() {
    _$jscoverage['/justify-right.js'].functionData[1]++;
    _$jscoverage['/justify-right.js'].lineData[11]++;
    var editor = this.get('editor');
    _$jscoverage['/justify-right.js'].lineData[12]++;
    editor.execCommand('justifyRight');
    _$jscoverage['/justify-right.js'].lineData[13]++;
    editor.focus();
  }
  _$jscoverage['/justify-right.js'].lineData[16]++;
  function justifyRight() {
    _$jscoverage['/justify-right.js'].functionData[2]++;
  }
  _$jscoverage['/justify-right.js'].lineData[20]++;
  S.augment(justifyRight, {
  pluginRenderUI: function(editor) {
  _$jscoverage['/justify-right.js'].functionData[3]++;
  _$jscoverage['/justify-right.js'].lineData[23]++;
  justifyCenterCmd.init(editor);
  _$jscoverage['/justify-right.js'].lineData[25]++;
  editor.addButton('justifyRight', {
  tooltip: '\u53f3\u5bf9\u9f50', 
  checkable: true, 
  listeners: {
  click: exec, 
  afterSyncUI: function() {
  _$jscoverage['/justify-right.js'].functionData[4]++;
  _$jscoverage['/justify-right.js'].lineData[31]++;
  var self = this;
  _$jscoverage['/justify-right.js'].lineData[32]++;
  editor.on('selectionChange', function() {
  _$jscoverage['/justify-right.js'].functionData[5]++;
  _$jscoverage['/justify-right.js'].lineData[33]++;
  if (visit1_33_1(editor.get('mode') === Editor.Mode.SOURCE_MODE)) {
    _$jscoverage['/justify-right.js'].lineData[34]++;
    return;
  }
  _$jscoverage['/justify-right.js'].lineData[36]++;
  if (visit2_36_1(editor.queryCommandValue('justifyRight'))) {
    _$jscoverage['/justify-right.js'].lineData[37]++;
    self.set('checked', true);
  } else {
    _$jscoverage['/justify-right.js'].lineData[39]++;
    self.set('checked', false);
  }
});
}}, 
  mode: Editor.Mode.WYSIWYG_MODE});
  _$jscoverage['/justify-right.js'].lineData[48]++;
  editor.docReady(function() {
  _$jscoverage['/justify-right.js'].functionData[6]++;
  _$jscoverage['/justify-right.js'].lineData[49]++;
  editor.get('document').on('keydown', function(e) {
  _$jscoverage['/justify-right.js'].functionData[7]++;
  _$jscoverage['/justify-right.js'].lineData[50]++;
  if (visit3_50_1(e.ctrlKey && visit4_50_2(e.keyCode === S.Node.KeyCode.R))) {
    _$jscoverage['/justify-right.js'].lineData[51]++;
    editor.execCommand('justifyRight');
    _$jscoverage['/justify-right.js'].lineData[52]++;
    e.preventDefault();
  }
});
});
}});
  _$jscoverage['/justify-right.js'].lineData[59]++;
  return justifyRight;
});
