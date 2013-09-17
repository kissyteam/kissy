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
if (! _$jscoverage['/dialog-loader.js']) {
  _$jscoverage['/dialog-loader.js'] = {};
  _$jscoverage['/dialog-loader.js'].lineData = [];
  _$jscoverage['/dialog-loader.js'].lineData[6] = 0;
  _$jscoverage['/dialog-loader.js'].lineData[7] = 0;
  _$jscoverage['/dialog-loader.js'].lineData[10] = 0;
  _$jscoverage['/dialog-loader.js'].lineData[11] = 0;
  _$jscoverage['/dialog-loader.js'].lineData[21] = 0;
  _$jscoverage['/dialog-loader.js'].lineData[22] = 0;
  _$jscoverage['/dialog-loader.js'].lineData[23] = 0;
  _$jscoverage['/dialog-loader.js'].lineData[26] = 0;
  _$jscoverage['/dialog-loader.js'].lineData[30] = 0;
  _$jscoverage['/dialog-loader.js'].lineData[34] = 0;
  _$jscoverage['/dialog-loader.js'].lineData[35] = 0;
  _$jscoverage['/dialog-loader.js'].lineData[36] = 0;
  _$jscoverage['/dialog-loader.js'].lineData[37] = 0;
  _$jscoverage['/dialog-loader.js'].lineData[38] = 0;
  _$jscoverage['/dialog-loader.js'].lineData[40] = 0;
  _$jscoverage['/dialog-loader.js'].lineData[42] = 0;
  _$jscoverage['/dialog-loader.js'].lineData[43] = 0;
  _$jscoverage['/dialog-loader.js'].lineData[44] = 0;
  _$jscoverage['/dialog-loader.js'].lineData[45] = 0;
  _$jscoverage['/dialog-loader.js'].lineData[46] = 0;
}
if (! _$jscoverage['/dialog-loader.js'].functionData) {
  _$jscoverage['/dialog-loader.js'].functionData = [];
  _$jscoverage['/dialog-loader.js'].functionData[0] = 0;
  _$jscoverage['/dialog-loader.js'].functionData[1] = 0;
  _$jscoverage['/dialog-loader.js'].functionData[2] = 0;
  _$jscoverage['/dialog-loader.js'].functionData[3] = 0;
  _$jscoverage['/dialog-loader.js'].functionData[4] = 0;
  _$jscoverage['/dialog-loader.js'].functionData[5] = 0;
}
if (! _$jscoverage['/dialog-loader.js'].branchData) {
  _$jscoverage['/dialog-loader.js'].branchData = {};
  _$jscoverage['/dialog-loader.js'].branchData['10'] = [];
  _$jscoverage['/dialog-loader.js'].branchData['10'][1] = new BranchData();
  _$jscoverage['/dialog-loader.js'].branchData['13'] = [];
  _$jscoverage['/dialog-loader.js'].branchData['13'][1] = new BranchData();
  _$jscoverage['/dialog-loader.js'].branchData['36'] = [];
  _$jscoverage['/dialog-loader.js'].branchData['36'][1] = new BranchData();
}
_$jscoverage['/dialog-loader.js'].branchData['36'][1].init(176, 35, 'editor.getControl(name + "/dialog")');
function visit3_36_1(result) {
  _$jscoverage['/dialog-loader.js'].branchData['36'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog-loader.js'].branchData['13'][1].init(62, 15, 'S.UA[\'ie\'] == 6');
function visit2_13_1(result) {
  _$jscoverage['/dialog-loader.js'].branchData['13'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog-loader.js'].branchData['10'][1].init(22, 11, '!globalMask');
function visit1_10_1(result) {
  _$jscoverage['/dialog-loader.js'].branchData['10'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog-loader.js'].lineData[6]++;
KISSY.add("editor/plugin/dialog-loader", function(S, Overlay, Editor) {
  _$jscoverage['/dialog-loader.js'].functionData[0]++;
  _$jscoverage['/dialog-loader.js'].lineData[7]++;
  var globalMask, loadMask = {
  loading: function(prefixCls) {
  _$jscoverage['/dialog-loader.js'].functionData[1]++;
  _$jscoverage['/dialog-loader.js'].lineData[10]++;
  if (visit1_10_1(!globalMask)) {
    _$jscoverage['/dialog-loader.js'].lineData[11]++;
    globalMask = new Overlay({
  x: 0, 
  width: visit2_13_1(S.UA['ie'] == 6) ? S.DOM.docWidth() : "100%", 
  y: 0, 
  "zIndex": Editor.baseZIndex(Editor.ZIndexManager.LOADING),
  prefixCls: prefixCls + 'editor-', 
  elCls: prefixCls + "editor-global-loading"});
  }
  _$jscoverage['/dialog-loader.js'].lineData[21]++;
  globalMask.set("height", S.DOM.docHeight());
  _$jscoverage['/dialog-loader.js'].lineData[22]++;
  globalMask.show();
  _$jscoverage['/dialog-loader.js'].lineData[23]++;
  globalMask.loading();
}, 
  unloading: function() {
  _$jscoverage['/dialog-loader.js'].functionData[2]++;
  _$jscoverage['/dialog-loader.js'].lineData[26]++;
  globalMask.hide();
}};
  _$jscoverage['/dialog-loader.js'].lineData[30]++;
  return {
  useDialog: function(editor, name, config, args) {
  _$jscoverage['/dialog-loader.js'].functionData[3]++;
  _$jscoverage['/dialog-loader.js'].lineData[34]++;
  editor.focus();
  _$jscoverage['/dialog-loader.js'].lineData[35]++;
  var prefixCls = editor.get('prefixCls');
  _$jscoverage['/dialog-loader.js'].lineData[36]++;
  if (visit3_36_1(editor.getControl(name + "/dialog"))) {
    _$jscoverage['/dialog-loader.js'].lineData[37]++;
    setTimeout(function() {
  _$jscoverage['/dialog-loader.js'].functionData[4]++;
  _$jscoverage['/dialog-loader.js'].lineData[38]++;
  editor.showDialog(name, args);
}, 0);
    _$jscoverage['/dialog-loader.js'].lineData[40]++;
    return;
  }
  _$jscoverage['/dialog-loader.js'].lineData[42]++;
  loadMask.loading(prefixCls);
  _$jscoverage['/dialog-loader.js'].lineData[43]++;
  S.use("editor/plugin/" + name + "/dialog", function(S, Dialog) {
  _$jscoverage['/dialog-loader.js'].functionData[5]++;
  _$jscoverage['/dialog-loader.js'].lineData[44]++;
  loadMask.unloading();
  _$jscoverage['/dialog-loader.js'].lineData[45]++;
  editor.addControl(name + "/dialog", new Dialog(editor, config));
  _$jscoverage['/dialog-loader.js'].lineData[46]++;
  editor.showDialog(name, args);
});
}};
}, {
  requires: ['overlay', 'editor']});
