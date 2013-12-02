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
if (! _$jscoverage['/font-size.js']) {
  _$jscoverage['/font-size.js'] = {};
  _$jscoverage['/font-size.js'].lineData = [];
  _$jscoverage['/font-size.js'].lineData[6] = 0;
  _$jscoverage['/font-size.js'].lineData[7] = 0;
  _$jscoverage['/font-size.js'].lineData[8] = 0;
  _$jscoverage['/font-size.js'].lineData[9] = 0;
  _$jscoverage['/font-size.js'].lineData[10] = 0;
  _$jscoverage['/font-size.js'].lineData[12] = 0;
  _$jscoverage['/font-size.js'].lineData[13] = 0;
  _$jscoverage['/font-size.js'].lineData[16] = 0;
  _$jscoverage['/font-size.js'].lineData[19] = 0;
  _$jscoverage['/font-size.js'].lineData[21] = 0;
  _$jscoverage['/font-size.js'].lineData[22] = 0;
  _$jscoverage['/font-size.js'].lineData[23] = 0;
  _$jscoverage['/font-size.js'].lineData[24] = 0;
  _$jscoverage['/font-size.js'].lineData[29] = 0;
  _$jscoverage['/font-size.js'].lineData[32] = 0;
  _$jscoverage['/font-size.js'].lineData[34] = 0;
  _$jscoverage['/font-size.js'].lineData[43] = 0;
  _$jscoverage['/font-size.js'].lineData[52] = 0;
}
if (! _$jscoverage['/font-size.js'].functionData) {
  _$jscoverage['/font-size.js'].functionData = [];
  _$jscoverage['/font-size.js'].functionData[0] = 0;
  _$jscoverage['/font-size.js'].functionData[1] = 0;
  _$jscoverage['/font-size.js'].functionData[2] = 0;
  _$jscoverage['/font-size.js'].functionData[3] = 0;
  _$jscoverage['/font-size.js'].functionData[4] = 0;
}
if (! _$jscoverage['/font-size.js'].branchData) {
  _$jscoverage['/font-size.js'].branchData = {};
  _$jscoverage['/font-size.js'].branchData['13'] = [];
  _$jscoverage['/font-size.js'].branchData['13'][1] = new BranchData();
}
_$jscoverage['/font-size.js'].branchData['13'][1].init(23, 12, 'config || {}');
function visit1_13_1(result) {
  _$jscoverage['/font-size.js'].branchData['13'][1].ranCondition(result);
  return result;
}_$jscoverage['/font-size.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/font-size.js'].functionData[0]++;
  _$jscoverage['/font-size.js'].lineData[7]++;
  var Editor = require('editor');
  _$jscoverage['/font-size.js'].lineData[8]++;
  var ui = require('./font/ui');
  _$jscoverage['/font-size.js'].lineData[9]++;
  var cmd = require('./font-size/cmd');
  _$jscoverage['/font-size.js'].lineData[10]++;
  require('./menubutton');
  _$jscoverage['/font-size.js'].lineData[12]++;
  function FontSizePlugin(config) {
    _$jscoverage['/font-size.js'].functionData[1]++;
    _$jscoverage['/font-size.js'].lineData[13]++;
    this.config = visit1_13_1(config || {});
  }
  _$jscoverage['/font-size.js'].lineData[16]++;
  S.augment(FontSizePlugin, {
  pluginRenderUI: function(editor) {
  _$jscoverage['/font-size.js'].functionData[2]++;
  _$jscoverage['/font-size.js'].lineData[19]++;
  cmd.init(editor);
  _$jscoverage['/font-size.js'].lineData[21]++;
  function wrapFont(vs) {
    _$jscoverage['/font-size.js'].functionData[3]++;
    _$jscoverage['/font-size.js'].lineData[22]++;
    var v = [];
    _$jscoverage['/font-size.js'].lineData[23]++;
    S.each(vs, function(n) {
  _$jscoverage['/font-size.js'].functionData[4]++;
  _$jscoverage['/font-size.js'].lineData[24]++;
  v.push({
  content: n, 
  value: n});
});
    _$jscoverage['/font-size.js'].lineData[29]++;
    return v;
  }
  _$jscoverage['/font-size.js'].lineData[32]++;
  var fontSizeConfig = this.config;
  _$jscoverage['/font-size.js'].lineData[34]++;
  fontSizeConfig.menu = S.mix({
  children: wrapFont(['8px', '10px', '12px', '14px', '18px', '24px', '36px', '48px', '60px', '72px', '84px', '96px'])}, fontSizeConfig.menu);
  _$jscoverage['/font-size.js'].lineData[43]++;
  editor.addSelect('fontSize', S.mix({
  cmdType: 'fontSize', 
  defaultCaption: '\u5927\u5c0f', 
  width: '70px', 
  mode: Editor.Mode.WYSIWYG_MODE}, fontSizeConfig), ui.Select);
}});
  _$jscoverage['/font-size.js'].lineData[52]++;
  return FontSizePlugin;
});
