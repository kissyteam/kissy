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
if (! _$jscoverage['/dialog.js']) {
  _$jscoverage['/dialog.js'] = {};
  _$jscoverage['/dialog.js'].lineData = [];
  _$jscoverage['/dialog.js'].lineData[6] = 0;
  _$jscoverage['/dialog.js'].lineData[7] = 0;
  _$jscoverage['/dialog.js'].lineData[8] = 0;
  _$jscoverage['/dialog.js'].lineData[9] = 0;
  _$jscoverage['/dialog.js'].lineData[10] = 0;
  _$jscoverage['/dialog.js'].lineData[11] = 0;
  _$jscoverage['/dialog.js'].lineData[12] = 0;
  _$jscoverage['/dialog.js'].lineData[75] = 0;
  _$jscoverage['/dialog.js'].lineData[76] = 0;
  _$jscoverage['/dialog.js'].lineData[77] = 0;
  _$jscoverage['/dialog.js'].lineData[78] = 0;
  _$jscoverage['/dialog.js'].lineData[79] = 0;
  _$jscoverage['/dialog.js'].lineData[80] = 0;
  _$jscoverage['/dialog.js'].lineData[83] = 0;
  _$jscoverage['/dialog.js'].lineData[89] = 0;
  _$jscoverage['/dialog.js'].lineData[92] = 0;
  _$jscoverage['/dialog.js'].lineData[93] = 0;
  _$jscoverage['/dialog.js'].lineData[94] = 0;
  _$jscoverage['/dialog.js'].lineData[95] = 0;
  _$jscoverage['/dialog.js'].lineData[96] = 0;
  _$jscoverage['/dialog.js'].lineData[97] = 0;
  _$jscoverage['/dialog.js'].lineData[100] = 0;
  _$jscoverage['/dialog.js'].lineData[107] = 0;
  _$jscoverage['/dialog.js'].lineData[108] = 0;
  _$jscoverage['/dialog.js'].lineData[115] = 0;
  _$jscoverage['/dialog.js'].lineData[116] = 0;
  _$jscoverage['/dialog.js'].lineData[121] = 0;
  _$jscoverage['/dialog.js'].lineData[122] = 0;
  _$jscoverage['/dialog.js'].lineData[127] = 0;
  _$jscoverage['/dialog.js'].lineData[132] = 0;
  _$jscoverage['/dialog.js'].lineData[136] = 0;
  _$jscoverage['/dialog.js'].lineData[137] = 0;
  _$jscoverage['/dialog.js'].lineData[138] = 0;
  _$jscoverage['/dialog.js'].lineData[139] = 0;
  _$jscoverage['/dialog.js'].lineData[141] = 0;
  _$jscoverage['/dialog.js'].lineData[142] = 0;
  _$jscoverage['/dialog.js'].lineData[144] = 0;
  _$jscoverage['/dialog.js'].lineData[145] = 0;
  _$jscoverage['/dialog.js'].lineData[147] = 0;
  _$jscoverage['/dialog.js'].lineData[148] = 0;
  _$jscoverage['/dialog.js'].lineData[149] = 0;
  _$jscoverage['/dialog.js'].lineData[151] = 0;
  _$jscoverage['/dialog.js'].lineData[152] = 0;
  _$jscoverage['/dialog.js'].lineData[153] = 0;
  _$jscoverage['/dialog.js'].lineData[154] = 0;
  _$jscoverage['/dialog.js'].lineData[155] = 0;
  _$jscoverage['/dialog.js'].lineData[160] = 0;
  _$jscoverage['/dialog.js'].lineData[161] = 0;
  _$jscoverage['/dialog.js'].lineData[162] = 0;
  _$jscoverage['/dialog.js'].lineData[167] = 0;
  _$jscoverage['/dialog.js'].lineData[172] = 0;
  _$jscoverage['/dialog.js'].lineData[173] = 0;
  _$jscoverage['/dialog.js'].lineData[174] = 0;
  _$jscoverage['/dialog.js'].lineData[175] = 0;
  _$jscoverage['/dialog.js'].lineData[184] = 0;
  _$jscoverage['/dialog.js'].lineData[185] = 0;
  _$jscoverage['/dialog.js'].lineData[187] = 0;
  _$jscoverage['/dialog.js'].lineData[188] = 0;
  _$jscoverage['/dialog.js'].lineData[189] = 0;
  _$jscoverage['/dialog.js'].lineData[190] = 0;
  _$jscoverage['/dialog.js'].lineData[193] = 0;
  _$jscoverage['/dialog.js'].lineData[194] = 0;
  _$jscoverage['/dialog.js'].lineData[199] = 0;
  _$jscoverage['/dialog.js'].lineData[200] = 0;
  _$jscoverage['/dialog.js'].lineData[215] = 0;
  _$jscoverage['/dialog.js'].lineData[216] = 0;
  _$jscoverage['/dialog.js'].lineData[218] = 0;
  _$jscoverage['/dialog.js'].lineData[223] = 0;
  _$jscoverage['/dialog.js'].lineData[224] = 0;
  _$jscoverage['/dialog.js'].lineData[226] = 0;
  _$jscoverage['/dialog.js'].lineData[227] = 0;
  _$jscoverage['/dialog.js'].lineData[228] = 0;
  _$jscoverage['/dialog.js'].lineData[230] = 0;
  _$jscoverage['/dialog.js'].lineData[231] = 0;
  _$jscoverage['/dialog.js'].lineData[233] = 0;
  _$jscoverage['/dialog.js'].lineData[235] = 0;
  _$jscoverage['/dialog.js'].lineData[237] = 0;
  _$jscoverage['/dialog.js'].lineData[241] = 0;
  _$jscoverage['/dialog.js'].lineData[245] = 0;
}
if (! _$jscoverage['/dialog.js'].functionData) {
  _$jscoverage['/dialog.js'].functionData = [];
  _$jscoverage['/dialog.js'].functionData[0] = 0;
  _$jscoverage['/dialog.js'].functionData[1] = 0;
  _$jscoverage['/dialog.js'].functionData[2] = 0;
  _$jscoverage['/dialog.js'].functionData[3] = 0;
  _$jscoverage['/dialog.js'].functionData[4] = 0;
  _$jscoverage['/dialog.js'].functionData[5] = 0;
  _$jscoverage['/dialog.js'].functionData[6] = 0;
  _$jscoverage['/dialog.js'].functionData[7] = 0;
  _$jscoverage['/dialog.js'].functionData[8] = 0;
  _$jscoverage['/dialog.js'].functionData[9] = 0;
  _$jscoverage['/dialog.js'].functionData[10] = 0;
  _$jscoverage['/dialog.js'].functionData[11] = 0;
  _$jscoverage['/dialog.js'].functionData[12] = 0;
}
if (! _$jscoverage['/dialog.js'].branchData) {
  _$jscoverage['/dialog.js'].branchData = {};
  _$jscoverage['/dialog.js'].branchData['78'] = [];
  _$jscoverage['/dialog.js'].branchData['78'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['112'] = [];
  _$jscoverage['/dialog.js'].branchData['112'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['136'] = [];
  _$jscoverage['/dialog.js'].branchData['136'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['138'] = [];
  _$jscoverage['/dialog.js'].branchData['138'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['141'] = [];
  _$jscoverage['/dialog.js'].branchData['141'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['144'] = [];
  _$jscoverage['/dialog.js'].branchData['144'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['149'] = [];
  _$jscoverage['/dialog.js'].branchData['149'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['152'] = [];
  _$jscoverage['/dialog.js'].branchData['152'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['153'] = [];
  _$jscoverage['/dialog.js'].branchData['153'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['206'] = [];
  _$jscoverage['/dialog.js'].branchData['206'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['215'] = [];
  _$jscoverage['/dialog.js'].branchData['215'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['221'] = [];
  _$jscoverage['/dialog.js'].branchData['221'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['222'] = [];
  _$jscoverage['/dialog.js'].branchData['222'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['223'] = [];
  _$jscoverage['/dialog.js'].branchData['223'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['227'] = [];
  _$jscoverage['/dialog.js'].branchData['227'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['233'] = [];
  _$jscoverage['/dialog.js'].branchData['233'][1] = new BranchData();
}
_$jscoverage['/dialog.js'].branchData['233'][1].init(669, 18, 'self.selectedFlash');
function visit16_233_1(result) {
  _$jscoverage['/dialog.js'].branchData['233'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['227'][1].init(449, 3, '!re');
function visit15_227_1(result) {
  _$jscoverage['/dialog.js'].branchData['227'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['223'][1].init(297, 6, '!dinfo');
function visit14_223_1(result) {
  _$jscoverage['/dialog.js'].branchData['223'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['222'][1].init(177, 20, 'dinfo && dinfo.attrs');
function visit13_222_1(result) {
  _$jscoverage['/dialog.js'].branchData['222'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['221'][1].init(121, 29, 'dinfo && util.trim(dinfo.url)');
function visit12_221_1(result) {
  _$jscoverage['/dialog.js'].branchData['221'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['215'][1].init(18, 2, 'ev');
function visit11_215_1(result) {
  _$jscoverage['/dialog.js'].branchData['215'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['206'][1].init(37, 36, 'parseInt(self.dMargin.val(), 10) || 0');
function visit10_206_1(result) {
  _$jscoverage['/dialog.js'].branchData['206'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['153'][1].init(146, 23, 'cfg.defaultHeight || \'\'');
function visit9_153_1(result) {
  _$jscoverage['/dialog.js'].branchData['153'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['152'][1].init(87, 22, 'cfg.defaultWidth || \'\'');
function visit8_152_1(result) {
  _$jscoverage['/dialog.js'].branchData['152'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['149'][1].init(550, 35, 'parseInt(r.style(\'margin\'), 10) || 0');
function visit7_149_1(result) {
  _$jscoverage['/dialog.js'].branchData['149'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['144'][1].init(277, 15, 'f.css(\'height\')');
function visit6_144_1(result) {
  _$jscoverage['/dialog.js'].branchData['144'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['141'][1].init(152, 14, 'f.css(\'width\')');
function visit5_141_1(result) {
  _$jscoverage['/dialog.js'].branchData['141'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['138'][1].init(77, 2, '!r');
function visit4_138_1(result) {
  _$jscoverage['/dialog.js'].branchData['138'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['136'][1].init(164, 1, 'f');
function visit3_136_1(result) {
  _$jscoverage['/dialog.js'].branchData['136'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['112'][1].init(164, 29, 'self._configDWidth || \'500px\'');
function visit2_112_1(result) {
  _$jscoverage['/dialog.js'].branchData['112'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['78'][1].init(81, 12, 'config || {}');
function visit1_78_1(result) {
  _$jscoverage['/dialog.js'].branchData['78'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/dialog.js'].functionData[0]++;
  _$jscoverage['/dialog.js'].lineData[7]++;
  var util = require('util');
  _$jscoverage['/dialog.js'].lineData[8]++;
  var Editor = require('editor');
  _$jscoverage['/dialog.js'].lineData[9]++;
  var flashUtils = require('../flash-common/utils');
  _$jscoverage['/dialog.js'].lineData[10]++;
  var Dialog4E = require('../dialog');
  _$jscoverage['/dialog.js'].lineData[11]++;
  var MenuButton = require('../menubutton');
  _$jscoverage['/dialog.js'].lineData[12]++;
  var CLS_FLASH = 'ke_flash', TYPE_FLASH = 'flash', TIP = '\u8bf7\u8f93\u5165\u5982 http://www.xxx.com/xxx.swf', bodyHTML = '<div style="padding:20px 20px 0 20px">' + '<p>' + '<label>\u7f51\u5740\uff1a ' + '<input ' + ' data-verify="^https?://[^\\s]+$" ' + ' data-warning="\u7f51\u5740\u683c\u5f0f\u4e3a\uff1ahttp://" ' + 'class="{prefixCls}editor-flash-url {prefixCls}editor-input" style="width:300px;' + '" />' + '</label>' + '</p>' + '<table style="margin:10px 0 5px  40px;width:300px;">' + '<tr>' + '<td>' + '<label>\u5bbd\u5ea6\uff1a ' + '<input ' + ' data-verify="^(?!0$)\\d+$" ' + ' data-warning="\u5bbd\u5ea6\u8bf7\u8f93\u5165\u6b63\u6574\u6570" ' + 'class="{prefixCls}editor-flash-width {prefixCls}editor-input" style="width:60px;' + '" /> \u50cf\u7d20 </label>' + '</td>' + '<td>' + '<label>\u9ad8\u5ea6\uff1a ' + '<input ' + ' data-verify="^(?!0$)\\d+$" ' + ' data-warning="\u9ad8\u5ea6\u8bf7\u8f93\u5165\u6b63\u6574\u6570" ' + 'class="{prefixCls}editor-flash-height {prefixCls}editor-input" ' + 'style="width:60px;' + '" /> \u50cf\u7d20 ' + '</label>' + '</td>' + '</tr>' + '<tr>' + '<td>' + '<label>' + '\u5bf9\u9f50\uff1a ' + '</label>' + '<select class="{prefixCls}editor-flash-align" title="\u5bf9\u9f50">' + '<option value="none">\u65e0</option>' + '<option value="left">\u5de6\u5bf9\u9f50</option>' + '<option value="right">\u53f3\u5bf9\u9f50</option>' + '</select>' + '</td>' + '<td>' + '<label>\u95f4\u8ddd\uff1a ' + '</label>' + '<input ' + ' data-verify="^\\d+$" ' + ' data-warning="\u95f4\u8ddd\u8bf7\u8f93\u5165\u975e\u8d1f\u6574\u6570" ' + 'class="{prefixCls}editor-flash-margin {prefixCls}editor-input" ' + 'style="width:60px;' + '" value="' + 5 + '"/> \u50cf\u7d20' + '</td></tr>' + '</table>' + '</div>', footHTML = '<div style="padding:10px 0 35px 20px;">' + '<a ' + 'class="{prefixCls}editor-flash-ok {prefixCls}editor-button ks-inline-block" ' + 'style="margin-left:40px;margin-right:20px;">\u786e\u5b9a</a> ' + '<a class="{prefixCls}editor-flash-cancel {prefixCls}editor-button ks-inline-block">\u53d6\u6d88</a></div>';
  _$jscoverage['/dialog.js'].lineData[75]++;
  function FlashDialog(editor, config) {
    _$jscoverage['/dialog.js'].functionData[1]++;
    _$jscoverage['/dialog.js'].lineData[76]++;
    var self = this;
    _$jscoverage['/dialog.js'].lineData[77]++;
    self.editor = editor;
    _$jscoverage['/dialog.js'].lineData[78]++;
    self.config = visit1_78_1(config || {});
    _$jscoverage['/dialog.js'].lineData[79]++;
    Editor.Utils.lazyRun(self, '_prepareShow', '_realShow');
    _$jscoverage['/dialog.js'].lineData[80]++;
    self._config();
  }
  _$jscoverage['/dialog.js'].lineData[83]++;
  util.augment(FlashDialog, {
  addRes: Editor.Utils.addRes, 
  destroyRes: Editor.Utils.destroyRes, 
  _config: function() {
  _$jscoverage['/dialog.js'].functionData[2]++;
  _$jscoverage['/dialog.js'].lineData[89]++;
  var self = this, editor = self.editor, prefixCls = editor.get('prefixCls');
  _$jscoverage['/dialog.js'].lineData[92]++;
  self._urlTip = TIP;
  _$jscoverage['/dialog.js'].lineData[93]++;
  self._type = TYPE_FLASH;
  _$jscoverage['/dialog.js'].lineData[94]++;
  self._cls = CLS_FLASH;
  _$jscoverage['/dialog.js'].lineData[95]++;
  self._configDWidth = '400px';
  _$jscoverage['/dialog.js'].lineData[96]++;
  self._title = 'Flash';
  _$jscoverage['/dialog.js'].lineData[97]++;
  self._bodyHTML = util.substitute(bodyHTML, {
  prefixCls: prefixCls});
  _$jscoverage['/dialog.js'].lineData[100]++;
  self._footHTML = util.substitute(footHTML, {
  prefixCls: prefixCls});
}, 
  _prepareShow: function() {
  _$jscoverage['/dialog.js'].functionData[3]++;
  _$jscoverage['/dialog.js'].lineData[107]++;
  var self = this;
  _$jscoverage['/dialog.js'].lineData[108]++;
  self.dialog = new Dialog4E({
  headerContent: self._title, 
  bodyContent: self._bodyHTML, 
  footerContent: self._footHTML, 
  width: visit2_112_1(self._configDWidth || '500px'), 
  mask: true}).render();
  _$jscoverage['/dialog.js'].lineData[115]++;
  self.addRes(self.dialog);
  _$jscoverage['/dialog.js'].lineData[116]++;
  self._initD();
}, 
  _realShow: function() {
  _$jscoverage['/dialog.js'].functionData[4]++;
  _$jscoverage['/dialog.js'].lineData[121]++;
  this._updateD();
  _$jscoverage['/dialog.js'].lineData[122]++;
  this.dialog.show();
}, 
  _getFlashUrl: function(r) {
  _$jscoverage['/dialog.js'].functionData[5]++;
  _$jscoverage['/dialog.js'].lineData[127]++;
  return flashUtils.getUrl(r);
}, 
  _updateD: function() {
  _$jscoverage['/dialog.js'].functionData[6]++;
  _$jscoverage['/dialog.js'].lineData[132]++;
  var self = this, editor = self.editor, cfg = self.config, f = self.selectedFlash;
  _$jscoverage['/dialog.js'].lineData[136]++;
  if (visit3_136_1(f)) {
    _$jscoverage['/dialog.js'].lineData[137]++;
    var r = editor.restoreRealElement(f);
    _$jscoverage['/dialog.js'].lineData[138]++;
    if (visit4_138_1(!r)) {
      _$jscoverage['/dialog.js'].lineData[139]++;
      return;
    }
    _$jscoverage['/dialog.js'].lineData[141]++;
    if (visit5_141_1(f.css('width'))) {
      _$jscoverage['/dialog.js'].lineData[142]++;
      self.dWidth.val(parseInt(f.css('width'), 10));
    }
    _$jscoverage['/dialog.js'].lineData[144]++;
    if (visit6_144_1(f.css('height'))) {
      _$jscoverage['/dialog.js'].lineData[145]++;
      self.dHeight.val(parseInt(f.css('height'), 10));
    }
    _$jscoverage['/dialog.js'].lineData[147]++;
    self.dAlign.set('value', f.css('float'));
    _$jscoverage['/dialog.js'].lineData[148]++;
    Editor.Utils.valInput(self.dUrl, self._getFlashUrl(r));
    _$jscoverage['/dialog.js'].lineData[149]++;
    self.dMargin.val(visit7_149_1(parseInt(r.style('margin'), 10) || 0));
  } else {
    _$jscoverage['/dialog.js'].lineData[151]++;
    Editor.Utils.resetInput(self.dUrl);
    _$jscoverage['/dialog.js'].lineData[152]++;
    self.dWidth.val(visit8_152_1(cfg.defaultWidth || ''));
    _$jscoverage['/dialog.js'].lineData[153]++;
    self.dHeight.val(visit9_153_1(cfg.defaultHeight || ''));
    _$jscoverage['/dialog.js'].lineData[154]++;
    self.dAlign.set('value', 'none');
    _$jscoverage['/dialog.js'].lineData[155]++;
    self.dMargin.val('5');
  }
}, 
  show: function(_selectedEl) {
  _$jscoverage['/dialog.js'].functionData[7]++;
  _$jscoverage['/dialog.js'].lineData[160]++;
  var self = this;
  _$jscoverage['/dialog.js'].lineData[161]++;
  self.selectedFlash = _selectedEl;
  _$jscoverage['/dialog.js'].lineData[162]++;
  self._prepareShow();
}, 
  _initD: function() {
  _$jscoverage['/dialog.js'].functionData[8]++;
  _$jscoverage['/dialog.js'].lineData[167]++;
  var self = this, d = self.dialog, editor = self.editor, prefixCls = editor.get('prefixCls'), el = d.get('el');
  _$jscoverage['/dialog.js'].lineData[172]++;
  self.dHeight = el.one('.' + prefixCls + 'editor-flash-height');
  _$jscoverage['/dialog.js'].lineData[173]++;
  self.dWidth = el.one('.' + prefixCls + 'editor-flash-width');
  _$jscoverage['/dialog.js'].lineData[174]++;
  self.dUrl = el.one('.' + prefixCls + 'editor-flash-url');
  _$jscoverage['/dialog.js'].lineData[175]++;
  self.dAlign = MenuButton.Select.decorate(el.one('.' + prefixCls + 'editor-flash-align'), {
  prefixCls: prefixCls + 'editor-big-', 
  width: 80, 
  menuCfg: {
  prefixCls: prefixCls + 'editor-', 
  render: el}});
  _$jscoverage['/dialog.js'].lineData[184]++;
  self.dMargin = el.one('.' + prefixCls + 'editor-flash-margin');
  _$jscoverage['/dialog.js'].lineData[185]++;
  var action = el.one('.' + prefixCls + 'editor-flash-ok'), cancel = el.one('.' + prefixCls + 'editor-flash-cancel');
  _$jscoverage['/dialog.js'].lineData[187]++;
  action.on('click', self._gen, self);
  _$jscoverage['/dialog.js'].lineData[188]++;
  cancel.on('click', function(ev) {
  _$jscoverage['/dialog.js'].functionData[9]++;
  _$jscoverage['/dialog.js'].lineData[189]++;
  d.hide();
  _$jscoverage['/dialog.js'].lineData[190]++;
  ev.halt();
});
  _$jscoverage['/dialog.js'].lineData[193]++;
  Editor.Utils.placeholder(self.dUrl, self._urlTip);
  _$jscoverage['/dialog.js'].lineData[194]++;
  self.addRes(self.dAlign);
}, 
  _getDInfo: function() {
  _$jscoverage['/dialog.js'].functionData[10]++;
  _$jscoverage['/dialog.js'].lineData[199]++;
  var self = this;
  _$jscoverage['/dialog.js'].lineData[200]++;
  return {
  url: self.dUrl.val(), 
  attrs: {
  width: self.dWidth.val(), 
  height: self.dHeight.val(), 
  style: 'margin:' + (visit10_206_1(parseInt(self.dMargin.val(), 10) || 0)) + 'px;' + 'float:' + self.dAlign.get('value') + ';'}};
}, 
  _gen: function(ev) {
  _$jscoverage['/dialog.js'].functionData[11]++;
  _$jscoverage['/dialog.js'].lineData[215]++;
  if (visit11_215_1(ev)) {
    _$jscoverage['/dialog.js'].lineData[216]++;
    ev.halt();
  }
  _$jscoverage['/dialog.js'].lineData[218]++;
  var self = this, editor = self.editor, dinfo = self._getDInfo(), url = visit12_221_1(dinfo && util.trim(dinfo.url)), attrs = visit13_222_1(dinfo && dinfo.attrs);
  _$jscoverage['/dialog.js'].lineData[223]++;
  if (visit14_223_1(!dinfo)) {
    _$jscoverage['/dialog.js'].lineData[224]++;
    return;
  }
  _$jscoverage['/dialog.js'].lineData[226]++;
  var re = Editor.Utils.verifyInputs(self.dialog.get('el').all('input'));
  _$jscoverage['/dialog.js'].lineData[227]++;
  if (visit15_227_1(!re)) {
    _$jscoverage['/dialog.js'].lineData[228]++;
    return;
  }
  _$jscoverage['/dialog.js'].lineData[230]++;
  self.dialog.hide();
  _$jscoverage['/dialog.js'].lineData[231]++;
  var substitute = flashUtils.insertFlash(editor, url, attrs, self._cls, self._type);
  _$jscoverage['/dialog.js'].lineData[233]++;
  if (visit16_233_1(self.selectedFlash)) {
    _$jscoverage['/dialog.js'].lineData[235]++;
    editor.getSelection().selectElement(substitute);
  }
  _$jscoverage['/dialog.js'].lineData[237]++;
  editor.notifySelectionChange();
}, 
  destroy: function() {
  _$jscoverage['/dialog.js'].functionData[12]++;
  _$jscoverage['/dialog.js'].lineData[241]++;
  this.destroyRes();
}});
  _$jscoverage['/dialog.js'].lineData[245]++;
  return FlashDialog;
});
