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
if (! _$jscoverage['/outdent.js']) {
  _$jscoverage['/outdent.js'] = {};
  _$jscoverage['/outdent.js'].lineData = [];
  _$jscoverage['/outdent.js'].lineData[6] = 0;
  _$jscoverage['/outdent.js'].lineData[7] = 0;
  _$jscoverage['/outdent.js'].lineData[8] = 0;
  _$jscoverage['/outdent.js'].lineData[9] = 0;
  _$jscoverage['/outdent.js'].lineData[11] = 0;
  _$jscoverage['/outdent.js'].lineData[15] = 0;
  _$jscoverage['/outdent.js'].lineData[18] = 0;
  _$jscoverage['/outdent.js'].lineData[20] = 0;
  _$jscoverage['/outdent.js'].lineData[24] = 0;
  _$jscoverage['/outdent.js'].lineData[25] = 0;
  _$jscoverage['/outdent.js'].lineData[29] = 0;
  _$jscoverage['/outdent.js'].lineData[30] = 0;
  _$jscoverage['/outdent.js'].lineData[31] = 0;
  _$jscoverage['/outdent.js'].lineData[32] = 0;
  _$jscoverage['/outdent.js'].lineData[34] = 0;
  _$jscoverage['/outdent.js'].lineData[35] = 0;
  _$jscoverage['/outdent.js'].lineData[37] = 0;
  _$jscoverage['/outdent.js'].lineData[48] = 0;
}
if (! _$jscoverage['/outdent.js'].functionData) {
  _$jscoverage['/outdent.js'].functionData = [];
  _$jscoverage['/outdent.js'].functionData[0] = 0;
  _$jscoverage['/outdent.js'].functionData[1] = 0;
  _$jscoverage['/outdent.js'].functionData[2] = 0;
  _$jscoverage['/outdent.js'].functionData[3] = 0;
  _$jscoverage['/outdent.js'].functionData[4] = 0;
  _$jscoverage['/outdent.js'].functionData[5] = 0;
}
if (! _$jscoverage['/outdent.js'].branchData) {
  _$jscoverage['/outdent.js'].branchData = {};
  _$jscoverage['/outdent.js'].branchData['31'] = [];
  _$jscoverage['/outdent.js'].branchData['31'][1] = new BranchData();
  _$jscoverage['/outdent.js'].branchData['34'] = [];
  _$jscoverage['/outdent.js'].branchData['34'][1] = new BranchData();
}
_$jscoverage['/outdent.js'].branchData['34'][1].init(185, 35, 'editor.queryCommandValue(\'outdent\')');
function visit2_34_1(result) {
  _$jscoverage['/outdent.js'].branchData['34'][1].ranCondition(result);
  return result;
}_$jscoverage['/outdent.js'].branchData['31'][1].init(33, 46, 'editor.get(\'mode\') === Editor.Mode.SOURCE_MODE');
function visit1_31_1(result) {
  _$jscoverage['/outdent.js'].branchData['31'][1].ranCondition(result);
  return result;
}_$jscoverage['/outdent.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/outdent.js'].functionData[0]++;
  _$jscoverage['/outdent.js'].lineData[7]++;
  var Editor = require('editor');
  _$jscoverage['/outdent.js'].lineData[8]++;
  require('./button');
  _$jscoverage['/outdent.js'].lineData[9]++;
  var indexCmd = require('./outdent/cmd');
  _$jscoverage['/outdent.js'].lineData[11]++;
  function outdent() {
    _$jscoverage['/outdent.js'].functionData[1]++;
  }
  _$jscoverage['/outdent.js'].lineData[15]++;
  S.augment(outdent, {
  pluginRenderUI: function(editor) {
  _$jscoverage['/outdent.js'].functionData[2]++;
  _$jscoverage['/outdent.js'].lineData[18]++;
  indexCmd.init(editor);
  _$jscoverage['/outdent.js'].lineData[20]++;
  editor.addButton('outdent', {
  tooltip: '\u51cf\u5c11\u7f29\u8fdb\u91cf', 
  listeners: {
  click: function() {
  _$jscoverage['/outdent.js'].functionData[3]++;
  _$jscoverage['/outdent.js'].lineData[24]++;
  editor.execCommand('outdent');
  _$jscoverage['/outdent.js'].lineData[25]++;
  editor.focus();
}, 
  afterSyncUI: function() {
  _$jscoverage['/outdent.js'].functionData[4]++;
  _$jscoverage['/outdent.js'].lineData[29]++;
  var self = this;
  _$jscoverage['/outdent.js'].lineData[30]++;
  editor.on('selectionChange', function() {
  _$jscoverage['/outdent.js'].functionData[5]++;
  _$jscoverage['/outdent.js'].lineData[31]++;
  if (visit1_31_1(editor.get('mode') === Editor.Mode.SOURCE_MODE)) {
    _$jscoverage['/outdent.js'].lineData[32]++;
    return;
  }
  _$jscoverage['/outdent.js'].lineData[34]++;
  if (visit2_34_1(editor.queryCommandValue('outdent'))) {
    _$jscoverage['/outdent.js'].lineData[35]++;
    self.set('disabled', false);
  } else {
    _$jscoverage['/outdent.js'].lineData[37]++;
    self.set('disabled', true);
  }
});
}}, 
  mode: Editor.Mode.WYSIWYG_MODE});
}});
  _$jscoverage['/outdent.js'].lineData[48]++;
  return outdent;
});
