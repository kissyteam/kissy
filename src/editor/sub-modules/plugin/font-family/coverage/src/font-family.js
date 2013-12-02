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
if (! _$jscoverage['/font-family.js']) {
  _$jscoverage['/font-family.js'] = {};
  _$jscoverage['/font-family.js'].lineData = [];
  _$jscoverage['/font-family.js'].lineData[6] = 0;
  _$jscoverage['/font-family.js'].lineData[7] = 0;
  _$jscoverage['/font-family.js'].lineData[8] = 0;
  _$jscoverage['/font-family.js'].lineData[9] = 0;
  _$jscoverage['/font-family.js'].lineData[10] = 0;
  _$jscoverage['/font-family.js'].lineData[12] = 0;
  _$jscoverage['/font-family.js'].lineData[13] = 0;
  _$jscoverage['/font-family.js'].lineData[16] = 0;
  _$jscoverage['/font-family.js'].lineData[19] = 0;
  _$jscoverage['/font-family.js'].lineData[21] = 0;
  _$jscoverage['/font-family.js'].lineData[23] = 0;
  _$jscoverage['/font-family.js'].lineData[26] = 0;
  _$jscoverage['/font-family.js'].lineData[81] = 0;
  _$jscoverage['/font-family.js'].lineData[82] = 0;
  _$jscoverage['/font-family.js'].lineData[84] = 0;
  _$jscoverage['/font-family.js'].lineData[85] = 0;
  _$jscoverage['/font-family.js'].lineData[86] = 0;
  _$jscoverage['/font-family.js'].lineData[89] = 0;
  _$jscoverage['/font-family.js'].lineData[91] = 0;
  _$jscoverage['/font-family.js'].lineData[100] = 0;
}
if (! _$jscoverage['/font-family.js'].functionData) {
  _$jscoverage['/font-family.js'].functionData = [];
  _$jscoverage['/font-family.js'].functionData[0] = 0;
  _$jscoverage['/font-family.js'].functionData[1] = 0;
  _$jscoverage['/font-family.js'].functionData[2] = 0;
  _$jscoverage['/font-family.js'].functionData[3] = 0;
}
if (! _$jscoverage['/font-family.js'].branchData) {
  _$jscoverage['/font-family.js'].branchData = {};
  _$jscoverage['/font-family.js'].branchData['13'] = [];
  _$jscoverage['/font-family.js'].branchData['13'][1] = new BranchData();
  _$jscoverage['/font-family.js'].branchData['82'] = [];
  _$jscoverage['/font-family.js'].branchData['82'][1] = new BranchData();
  _$jscoverage['/font-family.js'].branchData['84'] = [];
  _$jscoverage['/font-family.js'].branchData['84'][1] = new BranchData();
}
_$jscoverage['/font-family.js'].branchData['84'][1].init(119, 17, 'attrs.style || \'\'');
function visit3_84_1(result) {
  _$jscoverage['/font-family.js'].branchData['84'][1].ranCondition(result);
  return result;
}_$jscoverage['/font-family.js'].branchData['82'][1].init(29, 18, 'item.elAttrs || {}');
function visit2_82_1(result) {
  _$jscoverage['/font-family.js'].branchData['82'][1].ranCondition(result);
  return result;
}_$jscoverage['/font-family.js'].branchData['13'][1].init(23, 12, 'config || {}');
function visit1_13_1(result) {
  _$jscoverage['/font-family.js'].branchData['13'][1].ranCondition(result);
  return result;
}_$jscoverage['/font-family.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/font-family.js'].functionData[0]++;
  _$jscoverage['/font-family.js'].lineData[7]++;
  var Editor = require('editor');
  _$jscoverage['/font-family.js'].lineData[8]++;
  var ui = require('./font/ui');
  _$jscoverage['/font-family.js'].lineData[9]++;
  var cmd = require('./font-family/cmd');
  _$jscoverage['/font-family.js'].lineData[10]++;
  require('./menubutton');
  _$jscoverage['/font-family.js'].lineData[12]++;
  function FontFamilyPlugin(config) {
    _$jscoverage['/font-family.js'].functionData[1]++;
    _$jscoverage['/font-family.js'].lineData[13]++;
    this.config = visit1_13_1(config || {});
  }
  _$jscoverage['/font-family.js'].lineData[16]++;
  S.augment(FontFamilyPlugin, {
  pluginRenderUI: function(editor) {
  _$jscoverage['/font-family.js'].functionData[2]++;
  _$jscoverage['/font-family.js'].lineData[19]++;
  cmd.init(editor);
  _$jscoverage['/font-family.js'].lineData[21]++;
  var fontFamilies = this.config;
  _$jscoverage['/font-family.js'].lineData[23]++;
  var menu = {};
  _$jscoverage['/font-family.js'].lineData[26]++;
  S.mix(menu, {
  children: [{
  content: '\u5b8b\u4f53', 
  value: 'SimSun'}, {
  content: '\u9ed1\u4f53', 
  value: 'SimHei'}, {
  content: '\u96b6\u4e66', 
  value: 'LiSu'}, {
  content: '\u6977\u4f53', 
  value: 'KaiTi_GB2312'}, {
  content: '\u5fae\u8f6f\u96c5\u9ed1', 
  value: '"Microsoft YaHei"'}, {
  content: 'Georgia', 
  value: 'Georgia'}, {
  content: 'Times New Roman', 
  value: '"Times New Roman"'}, {
  content: 'Impact', 
  value: 'Impact'}, {
  content: 'Courier New', 
  value: '"Courier New"'}, {
  content: 'Arial', 
  value: 'Arial'}, {
  content: 'Verdana', 
  value: 'Verdana'}, {
  content: 'Tahoma', 
  value: 'Tahoma'}], 
  width: '130px'});
  _$jscoverage['/font-family.js'].lineData[81]++;
  S.each(menu.children, function(item) {
  _$jscoverage['/font-family.js'].functionData[3]++;
  _$jscoverage['/font-family.js'].lineData[82]++;
  var attrs = visit2_82_1(item.elAttrs || {}), value = item.value;
  _$jscoverage['/font-family.js'].lineData[84]++;
  attrs.style = visit3_84_1(attrs.style || '');
  _$jscoverage['/font-family.js'].lineData[85]++;
  attrs.style += ';font-family:' + value;
  _$jscoverage['/font-family.js'].lineData[86]++;
  item.elAttrs = attrs;
});
  _$jscoverage['/font-family.js'].lineData[89]++;
  fontFamilies.menu = S.mix(menu, fontFamilies.menu);
  _$jscoverage['/font-family.js'].lineData[91]++;
  editor.addSelect('fontFamily', S.mix({
  cmdType: 'fontFamily', 
  defaultCaption: '\u5b57\u4f53', 
  width: 130, 
  mode: Editor.Mode.WYSIWYG_MODE}, fontFamilies), ui.Select);
}});
  _$jscoverage['/font-family.js'].lineData[100]++;
  return FontFamilyPlugin;
});
