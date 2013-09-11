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
if (! _$jscoverage['/editor/focusManager.js']) {
  _$jscoverage['/editor/focusManager.js'] = {};
  _$jscoverage['/editor/focusManager.js'].lineData = [];
  _$jscoverage['/editor/focusManager.js'].lineData[6] = 0;
  _$jscoverage['/editor/focusManager.js'].lineData[8] = 0;
  _$jscoverage['/editor/focusManager.js'].lineData[22] = 0;
  _$jscoverage['/editor/focusManager.js'].lineData[23] = 0;
  _$jscoverage['/editor/focusManager.js'].lineData[24] = 0;
  _$jscoverage['/editor/focusManager.js'].lineData[25] = 0;
  _$jscoverage['/editor/focusManager.js'].lineData[32] = 0;
  _$jscoverage['/editor/focusManager.js'].lineData[39] = 0;
  _$jscoverage['/editor/focusManager.js'].lineData[46] = 0;
  _$jscoverage['/editor/focusManager.js'].lineData[53] = 0;
  _$jscoverage['/editor/focusManager.js'].lineData[55] = 0;
  _$jscoverage['/editor/focusManager.js'].lineData[62] = 0;
  _$jscoverage['/editor/focusManager.js'].lineData[64] = 0;
  _$jscoverage['/editor/focusManager.js'].lineData[71] = 0;
  _$jscoverage['/editor/focusManager.js'].lineData[72] = 0;
  _$jscoverage['/editor/focusManager.js'].lineData[73] = 0;
  _$jscoverage['/editor/focusManager.js'].lineData[74] = 0;
  _$jscoverage['/editor/focusManager.js'].lineData[75] = 0;
  _$jscoverage['/editor/focusManager.js'].lineData[76] = 0;
  _$jscoverage['/editor/focusManager.js'].lineData[78] = 0;
  _$jscoverage['/editor/focusManager.js'].lineData[79] = 0;
  _$jscoverage['/editor/focusManager.js'].lineData[83] = 0;
  _$jscoverage['/editor/focusManager.js'].lineData[84] = 0;
  _$jscoverage['/editor/focusManager.js'].lineData[85] = 0;
  _$jscoverage['/editor/focusManager.js'].lineData[86] = 0;
  _$jscoverage['/editor/focusManager.js'].lineData[87] = 0;
  _$jscoverage['/editor/focusManager.js'].lineData[88] = 0;
  _$jscoverage['/editor/focusManager.js'].lineData[94] = 0;
  _$jscoverage['/editor/focusManager.js'].lineData[95] = 0;
  _$jscoverage['/editor/focusManager.js'].lineData[99] = 0;
  _$jscoverage['/editor/focusManager.js'].lineData[100] = 0;
  _$jscoverage['/editor/focusManager.js'].lineData[101] = 0;
  _$jscoverage['/editor/focusManager.js'].lineData[102] = 0;
  _$jscoverage['/editor/focusManager.js'].lineData[105] = 0;
}
if (! _$jscoverage['/editor/focusManager.js'].functionData) {
  _$jscoverage['/editor/focusManager.js'].functionData = [];
  _$jscoverage['/editor/focusManager.js'].functionData[0] = 0;
  _$jscoverage['/editor/focusManager.js'].functionData[1] = 0;
  _$jscoverage['/editor/focusManager.js'].functionData[2] = 0;
  _$jscoverage['/editor/focusManager.js'].functionData[3] = 0;
  _$jscoverage['/editor/focusManager.js'].functionData[4] = 0;
  _$jscoverage['/editor/focusManager.js'].functionData[5] = 0;
  _$jscoverage['/editor/focusManager.js'].functionData[6] = 0;
  _$jscoverage['/editor/focusManager.js'].functionData[7] = 0;
  _$jscoverage['/editor/focusManager.js'].functionData[8] = 0;
  _$jscoverage['/editor/focusManager.js'].functionData[9] = 0;
  _$jscoverage['/editor/focusManager.js'].functionData[10] = 0;
  _$jscoverage['/editor/focusManager.js'].functionData[11] = 0;
}
if (! _$jscoverage['/editor/focusManager.js'].branchData) {
  _$jscoverage['/editor/focusManager.js'].branchData = {};
  _$jscoverage['/editor/focusManager.js'].branchData['75'] = [];
  _$jscoverage['/editor/focusManager.js'].branchData['75'][1] = new BranchData();
  _$jscoverage['/editor/focusManager.js'].branchData['87'] = [];
  _$jscoverage['/editor/focusManager.js'].branchData['87'][1] = new BranchData();
}
_$jscoverage['/editor/focusManager.js'].branchData['87'][1].init(114, 5, 'timer');
function visit334_87_1(result) {
  _$jscoverage['/editor/focusManager.js'].branchData['87'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/focusManager.js'].branchData['75'][1].init(115, 5, 'timer');
function visit333_75_1(result) {
  _$jscoverage['/editor/focusManager.js'].branchData['75'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/focusManager.js'].lineData[6]++;
KISSY.add("editor/focusManager", function(S, Editor) {
  _$jscoverage['/editor/focusManager.js'].functionData[0]++;
  _$jscoverage['/editor/focusManager.js'].lineData[8]++;
  var INSTANCES = {}, timer, currentInstance, focusManager = {
  refreshAll: function() {
  _$jscoverage['/editor/focusManager.js'].functionData[1]++;
  _$jscoverage['/editor/focusManager.js'].lineData[22]++;
  for (var i in INSTANCES) {
    _$jscoverage['/editor/focusManager.js'].lineData[23]++;
    var e = INSTANCES[i], doc = e.get("document")[0];
    _$jscoverage['/editor/focusManager.js'].lineData[24]++;
    doc.designMode = "off";
    _$jscoverage['/editor/focusManager.js'].lineData[25]++;
    doc.designMode = "on";
  }
}, 
  currentInstance: function() {
  _$jscoverage['/editor/focusManager.js'].functionData[2]++;
  _$jscoverage['/editor/focusManager.js'].lineData[32]++;
  return currentInstance;
}, 
  getInstance: function(id) {
  _$jscoverage['/editor/focusManager.js'].functionData[3]++;
  _$jscoverage['/editor/focusManager.js'].lineData[39]++;
  return INSTANCES[id];
}, 
  register: function(editor) {
  _$jscoverage['/editor/focusManager.js'].functionData[4]++;
  _$jscoverage['/editor/focusManager.js'].lineData[46]++;
  INSTANCES[editor.get('id')] = editor;
}, 
  add: function(editor) {
  _$jscoverage['/editor/focusManager.js'].functionData[5]++;
  _$jscoverage['/editor/focusManager.js'].lineData[53]++;
  this.register(editor);
  _$jscoverage['/editor/focusManager.js'].lineData[55]++;
  editor.get("window").on("focus", focus, editor).on("blur", blur, editor);
}, 
  remove: function(editor) {
  _$jscoverage['/editor/focusManager.js'].functionData[6]++;
  _$jscoverage['/editor/focusManager.js'].lineData[62]++;
  delete INSTANCES[editor.get('id')];
  _$jscoverage['/editor/focusManager.js'].lineData[64]++;
  editor.get("window").detach("focus", focus, editor).detach("blur", blur, editor);
}}, TRUE = true, FALSE = false, NULL = null;
  _$jscoverage['/editor/focusManager.js'].lineData[71]++;
  function focus() {
    _$jscoverage['/editor/focusManager.js'].functionData[7]++;
    _$jscoverage['/editor/focusManager.js'].lineData[72]++;
    var editor = this;
    _$jscoverage['/editor/focusManager.js'].lineData[73]++;
    editor.__iframeFocus = TRUE;
    _$jscoverage['/editor/focusManager.js'].lineData[74]++;
    currentInstance = editor;
    _$jscoverage['/editor/focusManager.js'].lineData[75]++;
    if (visit333_75_1(timer)) {
      _$jscoverage['/editor/focusManager.js'].lineData[76]++;
      clearTimeout(timer);
    }
    _$jscoverage['/editor/focusManager.js'].lineData[78]++;
    timer = setTimeout(function() {
  _$jscoverage['/editor/focusManager.js'].functionData[8]++;
  _$jscoverage['/editor/focusManager.js'].lineData[79]++;
  editor.fire("focus");
}, 30);
  }
  _$jscoverage['/editor/focusManager.js'].lineData[83]++;
  function blur() {
    _$jscoverage['/editor/focusManager.js'].functionData[9]++;
    _$jscoverage['/editor/focusManager.js'].lineData[84]++;
    var editor = this;
    _$jscoverage['/editor/focusManager.js'].lineData[85]++;
    editor.__iframeFocus = FALSE;
    _$jscoverage['/editor/focusManager.js'].lineData[86]++;
    currentInstance = NULL;
    _$jscoverage['/editor/focusManager.js'].lineData[87]++;
    if (visit334_87_1(timer)) {
      _$jscoverage['/editor/focusManager.js'].lineData[88]++;
      clearTimeout(timer);
    }
    _$jscoverage['/editor/focusManager.js'].lineData[94]++;
    timer = setTimeout(function() {
  _$jscoverage['/editor/focusManager.js'].functionData[10]++;
  _$jscoverage['/editor/focusManager.js'].lineData[95]++;
  editor.fire("blur");
}, 30);
  }
  _$jscoverage['/editor/focusManager.js'].lineData[99]++;
  focusManager['refreshAll'] = focusManager.refreshAll;
  _$jscoverage['/editor/focusManager.js'].lineData[100]++;
  Editor.focusManager = focusManager;
  _$jscoverage['/editor/focusManager.js'].lineData[101]++;
  Editor.getInstances = function() {
  _$jscoverage['/editor/focusManager.js'].functionData[11]++;
  _$jscoverage['/editor/focusManager.js'].lineData[102]++;
  return INSTANCES;
};
  _$jscoverage['/editor/focusManager.js'].lineData[105]++;
  return focusManager;
}, {
  requires: ['./base', './dom']});
