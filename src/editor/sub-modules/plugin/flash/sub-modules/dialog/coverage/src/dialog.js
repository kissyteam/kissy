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
  _$jscoverage['/dialog.js'].lineData[13] = 0;
  _$jscoverage['/dialog.js'].lineData[77] = 0;
  _$jscoverage['/dialog.js'].lineData[78] = 0;
  _$jscoverage['/dialog.js'].lineData[79] = 0;
  _$jscoverage['/dialog.js'].lineData[80] = 0;
  _$jscoverage['/dialog.js'].lineData[81] = 0;
  _$jscoverage['/dialog.js'].lineData[82] = 0;
  _$jscoverage['/dialog.js'].lineData[85] = 0;
  _$jscoverage['/dialog.js'].lineData[89] = 0;
  _$jscoverage['/dialog.js'].lineData[92] = 0;
  _$jscoverage['/dialog.js'].lineData[93] = 0;
  _$jscoverage['/dialog.js'].lineData[94] = 0;
  _$jscoverage['/dialog.js'].lineData[95] = 0;
  _$jscoverage['/dialog.js'].lineData[96] = 0;
  _$jscoverage['/dialog.js'].lineData[97] = 0;
  _$jscoverage['/dialog.js'].lineData[100] = 0;
  _$jscoverage['/dialog.js'].lineData[106] = 0;
  _$jscoverage['/dialog.js'].lineData[107] = 0;
  _$jscoverage['/dialog.js'].lineData[114] = 0;
  _$jscoverage['/dialog.js'].lineData[115] = 0;
  _$jscoverage['/dialog.js'].lineData[120] = 0;
  _$jscoverage['/dialog.js'].lineData[121] = 0;
  _$jscoverage['/dialog.js'].lineData[126] = 0;
  _$jscoverage['/dialog.js'].lineData[131] = 0;
  _$jscoverage['/dialog.js'].lineData[135] = 0;
  _$jscoverage['/dialog.js'].lineData[136] = 0;
  _$jscoverage['/dialog.js'].lineData[137] = 0;
  _$jscoverage['/dialog.js'].lineData[138] = 0;
  _$jscoverage['/dialog.js'].lineData[140] = 0;
  _$jscoverage['/dialog.js'].lineData[141] = 0;
  _$jscoverage['/dialog.js'].lineData[143] = 0;
  _$jscoverage['/dialog.js'].lineData[144] = 0;
  _$jscoverage['/dialog.js'].lineData[146] = 0;
  _$jscoverage['/dialog.js'].lineData[147] = 0;
  _$jscoverage['/dialog.js'].lineData[148] = 0;
  _$jscoverage['/dialog.js'].lineData[150] = 0;
  _$jscoverage['/dialog.js'].lineData[151] = 0;
  _$jscoverage['/dialog.js'].lineData[152] = 0;
  _$jscoverage['/dialog.js'].lineData[153] = 0;
  _$jscoverage['/dialog.js'].lineData[154] = 0;
  _$jscoverage['/dialog.js'].lineData[158] = 0;
  _$jscoverage['/dialog.js'].lineData[159] = 0;
  _$jscoverage['/dialog.js'].lineData[160] = 0;
  _$jscoverage['/dialog.js'].lineData[166] = 0;
  _$jscoverage['/dialog.js'].lineData[171] = 0;
  _$jscoverage['/dialog.js'].lineData[172] = 0;
  _$jscoverage['/dialog.js'].lineData[173] = 0;
  _$jscoverage['/dialog.js'].lineData[174] = 0;
  _$jscoverage['/dialog.js'].lineData[183] = 0;
  _$jscoverage['/dialog.js'].lineData[184] = 0;
  _$jscoverage['/dialog.js'].lineData[186] = 0;
  _$jscoverage['/dialog.js'].lineData[187] = 0;
  _$jscoverage['/dialog.js'].lineData[188] = 0;
  _$jscoverage['/dialog.js'].lineData[189] = 0;
  _$jscoverage['/dialog.js'].lineData[192] = 0;
  _$jscoverage['/dialog.js'].lineData[193] = 0;
  _$jscoverage['/dialog.js'].lineData[199] = 0;
  _$jscoverage['/dialog.js'].lineData[200] = 0;
  _$jscoverage['/dialog.js'].lineData[216] = 0;
  _$jscoverage['/dialog.js'].lineData[217] = 0;
  _$jscoverage['/dialog.js'].lineData[219] = 0;
  _$jscoverage['/dialog.js'].lineData[224] = 0;
  _$jscoverage['/dialog.js'].lineData[225] = 0;
  _$jscoverage['/dialog.js'].lineData[227] = 0;
  _$jscoverage['/dialog.js'].lineData[228] = 0;
  _$jscoverage['/dialog.js'].lineData[229] = 0;
  _$jscoverage['/dialog.js'].lineData[231] = 0;
  _$jscoverage['/dialog.js'].lineData[232] = 0;
  _$jscoverage['/dialog.js'].lineData[234] = 0;
  _$jscoverage['/dialog.js'].lineData[236] = 0;
  _$jscoverage['/dialog.js'].lineData[238] = 0;
  _$jscoverage['/dialog.js'].lineData[242] = 0;
  _$jscoverage['/dialog.js'].lineData[246] = 0;
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
  _$jscoverage['/dialog.js'].branchData['80'] = [];
  _$jscoverage['/dialog.js'].branchData['80'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['111'] = [];
  _$jscoverage['/dialog.js'].branchData['111'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['135'] = [];
  _$jscoverage['/dialog.js'].branchData['135'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['137'] = [];
  _$jscoverage['/dialog.js'].branchData['137'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['140'] = [];
  _$jscoverage['/dialog.js'].branchData['140'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['143'] = [];
  _$jscoverage['/dialog.js'].branchData['143'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['148'] = [];
  _$jscoverage['/dialog.js'].branchData['148'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['151'] = [];
  _$jscoverage['/dialog.js'].branchData['151'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['152'] = [];
  _$jscoverage['/dialog.js'].branchData['152'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['206'] = [];
  _$jscoverage['/dialog.js'].branchData['206'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['216'] = [];
  _$jscoverage['/dialog.js'].branchData['216'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['222'] = [];
  _$jscoverage['/dialog.js'].branchData['222'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['223'] = [];
  _$jscoverage['/dialog.js'].branchData['223'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['224'] = [];
  _$jscoverage['/dialog.js'].branchData['224'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['228'] = [];
  _$jscoverage['/dialog.js'].branchData['228'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['234'] = [];
  _$jscoverage['/dialog.js'].branchData['234'][1] = new BranchData();
}
_$jscoverage['/dialog.js'].branchData['234'][1].init(647, 18, 'self.selectedFlash');
function visit16_234_1(result) {
  _$jscoverage['/dialog.js'].branchData['234'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['228'][1].init(433, 3, '!re');
function visit15_228_1(result) {
  _$jscoverage['/dialog.js'].branchData['228'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['224'][1].init(285, 6, '!dinfo');
function visit14_224_1(result) {
  _$jscoverage['/dialog.js'].branchData['224'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['223'][1].init(170, 20, 'dinfo && dinfo.attrs');
function visit13_223_1(result) {
  _$jscoverage['/dialog.js'].branchData['223'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['222'][1].init(118, 26, 'dinfo && S.trim(dinfo.url)');
function visit12_222_1(result) {
  _$jscoverage['/dialog.js'].branchData['222'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['216'][1].init(17, 2, 'ev');
function visit11_216_1(result) {
  _$jscoverage['/dialog.js'].branchData['216'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['206'][1].init(36, 36, 'parseInt(self.dMargin.val(), 10) || 0');
function visit10_206_1(result) {
  _$jscoverage['/dialog.js'].branchData['206'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['152'][1].init(143, 23, 'cfg.defaultHeight || \'\'');
function visit9_152_1(result) {
  _$jscoverage['/dialog.js'].branchData['152'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['151'][1].init(85, 22, 'cfg.defaultWidth || \'\'');
function visit8_151_1(result) {
  _$jscoverage['/dialog.js'].branchData['151'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['148'][1].init(537, 35, 'parseInt(r.style(\'margin\'), 10) || 0');
function visit7_148_1(result) {
  _$jscoverage['/dialog.js'].branchData['148'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['143'][1].init(269, 15, 'f.css(\'height\')');
function visit6_143_1(result) {
  _$jscoverage['/dialog.js'].branchData['143'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['140'][1].init(147, 14, 'f.css(\'width\')');
function visit5_140_1(result) {
  _$jscoverage['/dialog.js'].branchData['140'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['137'][1].init(75, 2, '!r');
function visit4_137_1(result) {
  _$jscoverage['/dialog.js'].branchData['137'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['135'][1].init(159, 1, 'f');
function visit3_135_1(result) {
  _$jscoverage['/dialog.js'].branchData['135'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['111'][1].init(160, 29, 'self._configDWidth || \'500px\'');
function visit2_111_1(result) {
  _$jscoverage['/dialog.js'].branchData['111'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['80'][1].init(78, 12, 'config || {}');
function visit1_80_1(result) {
  _$jscoverage['/dialog.js'].branchData['80'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/dialog.js'].functionData[0]++;
  _$jscoverage['/dialog.js'].lineData[7]++;
  var Editor = require('editor');
  _$jscoverage['/dialog.js'].lineData[8]++;
  var flashUtils = require('../flash-common/utils');
  _$jscoverage['/dialog.js'].lineData[9]++;
  var Dialog4E = require('../dialog');
  _$jscoverage['/dialog.js'].lineData[10]++;
  var MenuButton = require('../menubutton');
  _$jscoverage['/dialog.js'].lineData[13]++;
  var CLS_FLASH = 'ke_flash', TYPE_FLASH = 'flash', TIP = '\u8bf7\u8f93\u5165\u5982 http://www.xxx.com/xxx.swf', bodyHTML = '<div style="padding:20px 20px 0 20px">' + '<p>' + '<label>\u7f51\u5740\uff1a ' + '<input ' + ' data-verify="^https?://[^\\s]+$" ' + ' data-warning="\u7f51\u5740\u683c\u5f0f\u4e3a\uff1ahttp://" ' + 'class="{prefixCls}editor-flash-url {prefixCls}editor-input" style="width:300px;' + '" />' + '</label>' + '</p>' + '<table style="margin:10px 0 5px  40px;width:300px;">' + '<tr>' + '<td>' + '<label>\u5bbd\u5ea6\uff1a ' + '<input ' + ' data-verify="^(?!0$)\\d+$" ' + ' data-warning="\u5bbd\u5ea6\u8bf7\u8f93\u5165\u6b63\u6574\u6570" ' + 'class="{prefixCls}editor-flash-width {prefixCls}editor-input" style="width:60px;' + '" /> \u50cf\u7d20 </label>' + '</td>' + '<td>' + '<label>\u9ad8\u5ea6\uff1a ' + '<input ' + ' data-verify="^(?!0$)\\d+$" ' + ' data-warning="\u9ad8\u5ea6\u8bf7\u8f93\u5165\u6b63\u6574\u6570" ' + 'class="{prefixCls}editor-flash-height {prefixCls}editor-input" ' + 'style="width:60px;' + '" /> \u50cf\u7d20 ' + '</label>' + '</td>' + '</tr>' + '<tr>' + '<td>' + '<label>' + '\u5bf9\u9f50\uff1a ' + '</label>' + '<select class="{prefixCls}editor-flash-align" title="\u5bf9\u9f50">' + '<option value="none">\u65e0</option>' + '<option value="left">\u5de6\u5bf9\u9f50</option>' + '<option value="right">\u53f3\u5bf9\u9f50</option>' + '</select>' + '</td>' + '<td>' + '<label>\u95f4\u8ddd\uff1a ' + '</label>' + '<input ' + ' data-verify="^\\d+$" ' + ' data-warning="\u95f4\u8ddd\u8bf7\u8f93\u5165\u975e\u8d1f\u6574\u6570" ' + 'class="{prefixCls}editor-flash-margin {prefixCls}editor-input" ' + 'style="width:60px;' + '" value="' + 5 + '"/> \u50cf\u7d20' + '</td></tr>' + '</table>' + '</div>', footHTML = '<div style="padding:10px 0 35px 20px;">' + '<a ' + 'class="{prefixCls}editor-flash-ok {prefixCls}editor-button ks-inline-block" ' + 'style="margin-left:40px;margin-right:20px;">\u786e\u5b9a</a> ' + '<a class="{prefixCls}editor-flash-cancel {prefixCls}editor-button ks-inline-block">\u53d6\u6d88</a></div>';
  _$jscoverage['/dialog.js'].lineData[77]++;
  function FlashDialog(editor, config) {
    _$jscoverage['/dialog.js'].functionData[1]++;
    _$jscoverage['/dialog.js'].lineData[78]++;
    var self = this;
    _$jscoverage['/dialog.js'].lineData[79]++;
    self.editor = editor;
    _$jscoverage['/dialog.js'].lineData[80]++;
    self.config = visit1_80_1(config || {});
    _$jscoverage['/dialog.js'].lineData[81]++;
    Editor.Utils.lazyRun(self, '_prepareShow', '_realShow');
    _$jscoverage['/dialog.js'].lineData[82]++;
    self._config();
  }
  _$jscoverage['/dialog.js'].lineData[85]++;
  S.augment(FlashDialog, {
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
  self._bodyHTML = S.substitute(bodyHTML, {
  prefixCls: prefixCls});
  _$jscoverage['/dialog.js'].lineData[100]++;
  self._footHTML = S.substitute(footHTML, {
  prefixCls: prefixCls});
}, 
  _prepareShow: function() {
  _$jscoverage['/dialog.js'].functionData[3]++;
  _$jscoverage['/dialog.js'].lineData[106]++;
  var self = this;
  _$jscoverage['/dialog.js'].lineData[107]++;
  self.dialog = new Dialog4E({
  headerContent: self._title, 
  bodyContent: self._bodyHTML, 
  footerContent: self._footHTML, 
  width: visit2_111_1(self._configDWidth || '500px'), 
  mask: true}).render();
  _$jscoverage['/dialog.js'].lineData[114]++;
  self.addRes(self.dialog);
  _$jscoverage['/dialog.js'].lineData[115]++;
  self._initD();
}, 
  _realShow: function() {
  _$jscoverage['/dialog.js'].functionData[4]++;
  _$jscoverage['/dialog.js'].lineData[120]++;
  this._updateD();
  _$jscoverage['/dialog.js'].lineData[121]++;
  this.dialog.show();
}, 
  _getFlashUrl: function(r) {
  _$jscoverage['/dialog.js'].functionData[5]++;
  _$jscoverage['/dialog.js'].lineData[126]++;
  return flashUtils.getUrl(r);
}, 
  _updateD: function() {
  _$jscoverage['/dialog.js'].functionData[6]++;
  _$jscoverage['/dialog.js'].lineData[131]++;
  var self = this, editor = self.editor, cfg = self.config, f = self.selectedFlash;
  _$jscoverage['/dialog.js'].lineData[135]++;
  if (visit3_135_1(f)) {
    _$jscoverage['/dialog.js'].lineData[136]++;
    var r = editor.restoreRealElement(f);
    _$jscoverage['/dialog.js'].lineData[137]++;
    if (visit4_137_1(!r)) {
      _$jscoverage['/dialog.js'].lineData[138]++;
      return;
    }
    _$jscoverage['/dialog.js'].lineData[140]++;
    if (visit5_140_1(f.css('width'))) {
      _$jscoverage['/dialog.js'].lineData[141]++;
      self.dWidth.val(parseInt(f.css('width'), 10));
    }
    _$jscoverage['/dialog.js'].lineData[143]++;
    if (visit6_143_1(f.css('height'))) {
      _$jscoverage['/dialog.js'].lineData[144]++;
      self.dHeight.val(parseInt(f.css('height'), 10));
    }
    _$jscoverage['/dialog.js'].lineData[146]++;
    self.dAlign.set('value', f.css('float'));
    _$jscoverage['/dialog.js'].lineData[147]++;
    Editor.Utils.valInput(self.dUrl, self._getFlashUrl(r));
    _$jscoverage['/dialog.js'].lineData[148]++;
    self.dMargin.val(visit7_148_1(parseInt(r.style('margin'), 10) || 0));
  } else {
    _$jscoverage['/dialog.js'].lineData[150]++;
    Editor.Utils.resetInput(self.dUrl);
    _$jscoverage['/dialog.js'].lineData[151]++;
    self.dWidth.val(visit8_151_1(cfg.defaultWidth || ''));
    _$jscoverage['/dialog.js'].lineData[152]++;
    self.dHeight.val(visit9_152_1(cfg.defaultHeight || ''));
    _$jscoverage['/dialog.js'].lineData[153]++;
    self.dAlign.set('value', 'none');
    _$jscoverage['/dialog.js'].lineData[154]++;
    self.dMargin.val('5');
  }
}, 
  show: function(_selectedEl) {
  _$jscoverage['/dialog.js'].functionData[7]++;
  _$jscoverage['/dialog.js'].lineData[158]++;
  var self = this;
  _$jscoverage['/dialog.js'].lineData[159]++;
  self.selectedFlash = _selectedEl;
  _$jscoverage['/dialog.js'].lineData[160]++;
  self._prepareShow();
}, 
  _initD: function() {
  _$jscoverage['/dialog.js'].functionData[8]++;
  _$jscoverage['/dialog.js'].lineData[166]++;
  var self = this, d = self.dialog, editor = self.editor, prefixCls = editor.get('prefixCls'), el = d.get('el');
  _$jscoverage['/dialog.js'].lineData[171]++;
  self.dHeight = el.one('.' + prefixCls + 'editor-flash-height');
  _$jscoverage['/dialog.js'].lineData[172]++;
  self.dWidth = el.one('.' + prefixCls + 'editor-flash-width');
  _$jscoverage['/dialog.js'].lineData[173]++;
  self.dUrl = el.one('.' + prefixCls + 'editor-flash-url');
  _$jscoverage['/dialog.js'].lineData[174]++;
  self.dAlign = MenuButton.Select.decorate(el.one('.' + prefixCls + 'editor-flash-align'), {
  prefixCls: prefixCls + 'editor-big-', 
  width: 80, 
  menuCfg: {
  prefixCls: prefixCls + 'editor-', 
  render: el}});
  _$jscoverage['/dialog.js'].lineData[183]++;
  self.dMargin = el.one('.' + prefixCls + 'editor-flash-margin');
  _$jscoverage['/dialog.js'].lineData[184]++;
  var action = el.one('.' + prefixCls + 'editor-flash-ok'), cancel = el.one('.' + prefixCls + 'editor-flash-cancel');
  _$jscoverage['/dialog.js'].lineData[186]++;
  action.on('click', self._gen, self);
  _$jscoverage['/dialog.js'].lineData[187]++;
  cancel.on('click', function(ev) {
  _$jscoverage['/dialog.js'].functionData[9]++;
  _$jscoverage['/dialog.js'].lineData[188]++;
  d.hide();
  _$jscoverage['/dialog.js'].lineData[189]++;
  ev.halt();
});
  _$jscoverage['/dialog.js'].lineData[192]++;
  Editor.Utils.placeholder(self.dUrl, self._urlTip);
  _$jscoverage['/dialog.js'].lineData[193]++;
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
  _$jscoverage['/dialog.js'].lineData[216]++;
  if (visit11_216_1(ev)) {
    _$jscoverage['/dialog.js'].lineData[217]++;
    ev.halt();
  }
  _$jscoverage['/dialog.js'].lineData[219]++;
  var self = this, editor = self.editor, dinfo = self._getDInfo(), url = visit12_222_1(dinfo && S.trim(dinfo.url)), attrs = visit13_223_1(dinfo && dinfo.attrs);
  _$jscoverage['/dialog.js'].lineData[224]++;
  if (visit14_224_1(!dinfo)) {
    _$jscoverage['/dialog.js'].lineData[225]++;
    return;
  }
  _$jscoverage['/dialog.js'].lineData[227]++;
  var re = Editor.Utils.verifyInputs(self.dialog.get('el').all('input'));
  _$jscoverage['/dialog.js'].lineData[228]++;
  if (visit15_228_1(!re)) {
    _$jscoverage['/dialog.js'].lineData[229]++;
    return;
  }
  _$jscoverage['/dialog.js'].lineData[231]++;
  self.dialog.hide();
  _$jscoverage['/dialog.js'].lineData[232]++;
  var substitute = flashUtils.insertFlash(editor, url, attrs, self._cls, self._type);
  _$jscoverage['/dialog.js'].lineData[234]++;
  if (visit16_234_1(self.selectedFlash)) {
    _$jscoverage['/dialog.js'].lineData[236]++;
    editor.getSelection().selectElement(substitute);
  }
  _$jscoverage['/dialog.js'].lineData[238]++;
  editor.notifySelectionChange();
}, 
  destroy: function() {
  _$jscoverage['/dialog.js'].functionData[12]++;
  _$jscoverage['/dialog.js'].lineData[242]++;
  this.destroyRes();
}});
  _$jscoverage['/dialog.js'].lineData[246]++;
  return FlashDialog;
});
