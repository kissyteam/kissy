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
  _$jscoverage['/btn.js'].lineData[10] = 0;
  _$jscoverage['/btn.js'].lineData[12] = 0;
  _$jscoverage['/btn.js'].lineData[13] = 0;
  _$jscoverage['/btn.js'].lineData[15] = 0;
  _$jscoverage['/btn.js'].lineData[29] = 0;
  _$jscoverage['/btn.js'].lineData[30] = 0;
  _$jscoverage['/btn.js'].lineData[35] = 0;
  _$jscoverage['/btn.js'].lineData[36] = 0;
  _$jscoverage['/btn.js'].lineData[37] = 0;
  _$jscoverage['/btn.js'].lineData[38] = 0;
  _$jscoverage['/btn.js'].lineData[39] = 0;
  _$jscoverage['/btn.js'].lineData[40] = 0;
  _$jscoverage['/btn.js'].lineData[41] = 0;
  _$jscoverage['/btn.js'].lineData[42] = 0;
  _$jscoverage['/btn.js'].lineData[43] = 0;
  _$jscoverage['/btn.js'].lineData[47] = 0;
  _$jscoverage['/btn.js'].lineData[49] = 0;
  _$jscoverage['/btn.js'].lineData[51] = 0;
  _$jscoverage['/btn.js'].lineData[53] = 0;
  _$jscoverage['/btn.js'].lineData[60] = 0;
  _$jscoverage['/btn.js'].lineData[62] = 0;
  _$jscoverage['/btn.js'].lineData[64] = 0;
  _$jscoverage['/btn.js'].lineData[65] = 0;
  _$jscoverage['/btn.js'].lineData[67] = 0;
  _$jscoverage['/btn.js'].lineData[68] = 0;
  _$jscoverage['/btn.js'].lineData[69] = 0;
  _$jscoverage['/btn.js'].lineData[73] = 0;
  _$jscoverage['/btn.js'].lineData[74] = 0;
  _$jscoverage['/btn.js'].lineData[75] = 0;
  _$jscoverage['/btn.js'].lineData[76] = 0;
  _$jscoverage['/btn.js'].lineData[78] = 0;
  _$jscoverage['/btn.js'].lineData[79] = 0;
  _$jscoverage['/btn.js'].lineData[86] = 0;
  _$jscoverage['/btn.js'].lineData[91] = 0;
  _$jscoverage['/btn.js'].lineData[104] = 0;
  _$jscoverage['/btn.js'].lineData[105] = 0;
  _$jscoverage['/btn.js'].lineData[106] = 0;
  _$jscoverage['/btn.js'].lineData[107] = 0;
  _$jscoverage['/btn.js'].lineData[108] = 0;
  _$jscoverage['/btn.js'].lineData[110] = 0;
  _$jscoverage['/btn.js'].lineData[111] = 0;
  _$jscoverage['/btn.js'].lineData[112] = 0;
  _$jscoverage['/btn.js'].lineData[113] = 0;
  _$jscoverage['/btn.js'].lineData[114] = 0;
  _$jscoverage['/btn.js'].lineData[116] = 0;
  _$jscoverage['/btn.js'].lineData[117] = 0;
  _$jscoverage['/btn.js'].lineData[121] = 0;
  _$jscoverage['/btn.js'].lineData[124] = 0;
  _$jscoverage['/btn.js'].lineData[133] = 0;
  _$jscoverage['/btn.js'].lineData[137] = 0;
  _$jscoverage['/btn.js'].lineData[138] = 0;
  _$jscoverage['/btn.js'].lineData[142] = 0;
  _$jscoverage['/btn.js'].lineData[143] = 0;
  _$jscoverage['/btn.js'].lineData[146] = 0;
  _$jscoverage['/btn.js'].lineData[147] = 0;
  _$jscoverage['/btn.js'].lineData[154] = 0;
  _$jscoverage['/btn.js'].lineData[155] = 0;
  _$jscoverage['/btn.js'].lineData[156] = 0;
  _$jscoverage['/btn.js'].lineData[170] = 0;
  _$jscoverage['/btn.js'].lineData[174] = 0;
  _$jscoverage['/btn.js'].lineData[175] = 0;
  _$jscoverage['/btn.js'].lineData[176] = 0;
  _$jscoverage['/btn.js'].lineData[180] = 0;
  _$jscoverage['/btn.js'].lineData[181] = 0;
  _$jscoverage['/btn.js'].lineData[186] = 0;
  _$jscoverage['/btn.js'].lineData[197] = 0;
  _$jscoverage['/btn.js'].lineData[202] = 0;
  _$jscoverage['/btn.js'].lineData[204] = 0;
  _$jscoverage['/btn.js'].lineData[205] = 0;
  _$jscoverage['/btn.js'].lineData[206] = 0;
  _$jscoverage['/btn.js'].lineData[209] = 0;
  _$jscoverage['/btn.js'].lineData[210] = 0;
  _$jscoverage['/btn.js'].lineData[214] = 0;
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
  _$jscoverage['/btn.js'].functionData[9] = 0;
  _$jscoverage['/btn.js'].functionData[10] = 0;
  _$jscoverage['/btn.js'].functionData[11] = 0;
  _$jscoverage['/btn.js'].functionData[12] = 0;
  _$jscoverage['/btn.js'].functionData[13] = 0;
  _$jscoverage['/btn.js'].functionData[14] = 0;
  _$jscoverage['/btn.js'].functionData[15] = 0;
  _$jscoverage['/btn.js'].functionData[16] = 0;
}
if (! _$jscoverage['/btn.js'].branchData) {
  _$jscoverage['/btn.js'].branchData = {};
  _$jscoverage['/btn.js'].branchData['35'] = [];
  _$jscoverage['/btn.js'].branchData['35'][1] = new BranchData();
  _$jscoverage['/btn.js'].branchData['38'] = [];
  _$jscoverage['/btn.js'].branchData['38'][1] = new BranchData();
  _$jscoverage['/btn.js'].branchData['40'] = [];
  _$jscoverage['/btn.js'].branchData['40'][1] = new BranchData();
  _$jscoverage['/btn.js'].branchData['68'] = [];
  _$jscoverage['/btn.js'].branchData['68'][1] = new BranchData();
  _$jscoverage['/btn.js'].branchData['75'] = [];
  _$jscoverage['/btn.js'].branchData['75'][1] = new BranchData();
  _$jscoverage['/btn.js'].branchData['78'] = [];
  _$jscoverage['/btn.js'].branchData['78'][1] = new BranchData();
  _$jscoverage['/btn.js'].branchData['142'] = [];
  _$jscoverage['/btn.js'].branchData['142'][1] = new BranchData();
  _$jscoverage['/btn.js'].branchData['146'] = [];
  _$jscoverage['/btn.js'].branchData['146'][1] = new BranchData();
  _$jscoverage['/btn.js'].branchData['155'] = [];
  _$jscoverage['/btn.js'].branchData['155'][1] = new BranchData();
  _$jscoverage['/btn.js'].branchData['205'] = [];
  _$jscoverage['/btn.js'].branchData['205'][1] = new BranchData();
}
_$jscoverage['/btn.js'].branchData['205'][1].init(48, 23, 'e.color || defaultColor');
function visit10_205_1(result) {
  _$jscoverage['/btn.js'].branchData['205'][1].ranCondition(result);
  return result;
}_$jscoverage['/btn.js'].branchData['155'][1].init(48, 13, 'self.colorWin');
function visit9_155_1(result) {
  _$jscoverage['/btn.js'].branchData['155'][1].ranCondition(result);
  return result;
}_$jscoverage['/btn.js'].branchData['146'][1].init(404, 45, 't.hasClass(prefixCls + \'editor-color-remove\')');
function visit8_146_1(result) {
  _$jscoverage['/btn.js'].branchData['146'][1].ranCondition(result);
  return result;
}_$jscoverage['/btn.js'].branchData['142'][1].init(214, 40, 't.hasClass(prefixCls + \'editor-color-a\')');
function visit7_142_1(result) {
  _$jscoverage['/btn.js'].branchData['142'][1].ranCondition(result);
  return result;
}_$jscoverage['/btn.js'].branchData['78'][1].init(25, 13, 'self.colorWin');
function visit6_78_1(result) {
  _$jscoverage['/btn.js'].branchData['78'][1].ranCondition(result);
  return result;
}_$jscoverage['/btn.js'].branchData['75'][1].init(74, 7, 'checked');
function visit5_75_1(result) {
  _$jscoverage['/btn.js'].branchData['75'][1].ranCondition(result);
  return result;
}_$jscoverage['/btn.js'].branchData['68'][1].init(25, 13, 'self.colorWin');
function visit4_68_1(result) {
  _$jscoverage['/btn.js'].branchData['68'][1].ranCondition(result);
  return result;
}_$jscoverage['/btn.js'].branchData['40'][1].init(67, 5, 'j < 8');
function visit3_40_1(result) {
  _$jscoverage['/btn.js'].branchData['40'][1].ranCondition(result);
  return result;
}_$jscoverage['/btn.js'].branchData['38'][1].init(157, 5, 'k < l');
function visit2_38_1(result) {
  _$jscoverage['/btn.js'].branchData['38'][1].ranCondition(result);
  return result;
}_$jscoverage['/btn.js'].branchData['35'][1].init(241, 5, 'i < 3');
function visit1_35_1(result) {
  _$jscoverage['/btn.js'].branchData['35'][1].ranCondition(result);
  return result;
}_$jscoverage['/btn.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/btn.js'].functionData[0]++;
  _$jscoverage['/btn.js'].lineData[7]++;
  var Editor = require('editor');
  _$jscoverage['/btn.js'].lineData[8]++;
  var Button = require('../button');
  _$jscoverage['/btn.js'].lineData[9]++;
  var Overlay4E = require('../overlay');
  _$jscoverage['/btn.js'].lineData[10]++;
  var DialogLoader = require('../dialog-loader');
  _$jscoverage['/btn.js'].lineData[12]++;
  var Node = require('node');
  _$jscoverage['/btn.js'].lineData[13]++;
  var util = require('util');
  _$jscoverage['/btn.js'].lineData[15]++;
  var COLORS = [['000', '444', '666', '999', 'CCC', 'EEE', 'F3F3F3', 'FFF'], ['F00', 'F90', 'FF0', '0F0', '0FF', '00F', '90F', 'F0F'], ['F4CC' + 'CC', 'FCE5CD', 'FFF2CC', 'D9EAD3', 'D0E0E3', 'CFE2F3', 'D9D2E9', 'EAD1DC', 'EA9999', 'F9CB9C', 'FFE599', 'B6D7A8', 'A2C4C9', '9FC5E8', 'B4A7D6', 'D5A6BD', 'E06666', 'F6B26B', 'FFD966', '93C47D', '76A5AF', '6FA8DC', '8E7CC3', 'C27BAD', 'CC0000', 'E69138', 'F1C232', '6AA84F', '45818E', '3D85C6', '674EA7', 'A64D79', '990000', 'B45F06', 'BF9000', '38761D', '134F5C', '0B5394', '351C75', '741B47', '660000', '783F04', '7F6000', '274E13', '0C343D', '073763', '20124D', '4C1130']], html;
  _$jscoverage['/btn.js'].lineData[29]++;
  function initHTML() {
    _$jscoverage['/btn.js'].functionData[1]++;
    _$jscoverage['/btn.js'].lineData[30]++;
    html = '<div class="{prefixCls}editor-color-panel">' + '<a class="{prefixCls}editor-color-remove" ' + 'href="javascript:void(\'\u6e05\u9664\');">' + '\u6e05\u9664' + '</a>';
    _$jscoverage['/btn.js'].lineData[35]++;
    for (var i = 0; visit1_35_1(i < 3); i++) {
      _$jscoverage['/btn.js'].lineData[36]++;
      html += '<div class="{prefixCls}editor-color-palette"><table>';
      _$jscoverage['/btn.js'].lineData[37]++;
      var c = COLORS[i], l = c.length / 8;
      _$jscoverage['/btn.js'].lineData[38]++;
      for (var k = 0; visit2_38_1(k < l); k++) {
        _$jscoverage['/btn.js'].lineData[39]++;
        html += '<tr>';
        _$jscoverage['/btn.js'].lineData[40]++;
        for (var j = 0; visit3_40_1(j < 8); j++) {
          _$jscoverage['/btn.js'].lineData[41]++;
          var currentColor = '#' + (c[8 * k + j]);
          _$jscoverage['/btn.js'].lineData[42]++;
          html += '<td>';
          _$jscoverage['/btn.js'].lineData[43]++;
          html += '<a href="javascript:void(0);" ' + 'class="{prefixCls}editor-color-a" ' + 'style="background-color:' + currentColor + '"' + '></a>';
          _$jscoverage['/btn.js'].lineData[47]++;
          html += '</td>';
        }
        _$jscoverage['/btn.js'].lineData[49]++;
        html += '</tr>';
      }
      _$jscoverage['/btn.js'].lineData[51]++;
      html += '</table></div>';
    }
    _$jscoverage['/btn.js'].lineData[53]++;
    html += '' + '<div>' + '<a class="{prefixCls}editor-button {prefixCls}editor-color-others ks-inline-block">\u5176\u4ed6\u989c\u8272</a>' + '</div>' + '</div>';
  }
  _$jscoverage['/btn.js'].lineData[60]++;
  initHTML();
  _$jscoverage['/btn.js'].lineData[62]++;
  var ColorButton = Button.extend({
  initializer: function() {
  _$jscoverage['/btn.js'].functionData[2]++;
  _$jscoverage['/btn.js'].lineData[64]++;
  var self = this;
  _$jscoverage['/btn.js'].lineData[65]++;
  self.on('blur', function() {
  _$jscoverage['/btn.js'].functionData[3]++;
  _$jscoverage['/btn.js'].lineData[67]++;
  setTimeout(function() {
  _$jscoverage['/btn.js'].functionData[4]++;
  _$jscoverage['/btn.js'].lineData[68]++;
  if (visit4_68_1(self.colorWin)) {
    _$jscoverage['/btn.js'].lineData[69]++;
    self.colorWin.hide();
  }
}, 150);
});
  _$jscoverage['/btn.js'].lineData[73]++;
  self.on('click', function() {
  _$jscoverage['/btn.js'].functionData[5]++;
  _$jscoverage['/btn.js'].lineData[74]++;
  var checked = self.get('checked');
  _$jscoverage['/btn.js'].lineData[75]++;
  if (visit5_75_1(checked)) {
    _$jscoverage['/btn.js'].lineData[76]++;
    self._prepare();
  } else {
    _$jscoverage['/btn.js'].lineData[78]++;
    if (visit6_78_1(self.colorWin)) {
      _$jscoverage['/btn.js'].lineData[79]++;
      self.colorWin.hide();
    }
  }
});
}, 
  _prepare: function() {
  _$jscoverage['/btn.js'].functionData[6]++;
  _$jscoverage['/btn.js'].lineData[86]++;
  var self = this, editor = self.get('editor'), prefixCls = editor.get('prefixCls'), colorPanel;
  _$jscoverage['/btn.js'].lineData[91]++;
  self.colorWin = new Overlay4E({
  elAttrs: {
  tabindex: 0}, 
  elCls: prefixCls + 'editor-popup', 
  content: util.substitute(html, {
  prefixCls: prefixCls}), 
  width: 172, 
  zIndex: Editor.baseZIndex(Editor.ZIndexManager.POPUP_MENU)}).render();
  _$jscoverage['/btn.js'].lineData[104]++;
  var colorWin = self.colorWin;
  _$jscoverage['/btn.js'].lineData[105]++;
  colorPanel = colorWin.get('contentEl');
  _$jscoverage['/btn.js'].lineData[106]++;
  colorPanel.on('click', self._selectColor, self);
  _$jscoverage['/btn.js'].lineData[107]++;
  colorWin.on('hide', function() {
  _$jscoverage['/btn.js'].functionData[7]++;
  _$jscoverage['/btn.js'].lineData[108]++;
  self.set('checked', false);
});
  _$jscoverage['/btn.js'].lineData[110]++;
  var others = colorPanel.one('.' + prefixCls + 'editor-color-others');
  _$jscoverage['/btn.js'].lineData[111]++;
  others.on('click', function(ev) {
  _$jscoverage['/btn.js'].functionData[8]++;
  _$jscoverage['/btn.js'].lineData[112]++;
  ev.halt();
  _$jscoverage['/btn.js'].lineData[113]++;
  colorWin.hide();
  _$jscoverage['/btn.js'].lineData[114]++;
  DialogLoader.useDialog(editor, 'color', undefined, self);
});
  _$jscoverage['/btn.js'].lineData[116]++;
  self._prepare = self._show;
  _$jscoverage['/btn.js'].lineData[117]++;
  self._show();
}, 
  _show: function() {
  _$jscoverage['/btn.js'].functionData[9]++;
  _$jscoverage['/btn.js'].lineData[121]++;
  var self = this, el = self.get('el'), colorWin = self.colorWin;
  _$jscoverage['/btn.js'].lineData[124]++;
  colorWin.set('align', {
  node: el, 
  points: ['bl', 'tl'], 
  offset: [0, 2], 
  overflow: {
  adjustX: 1, 
  adjustY: 1}});
  _$jscoverage['/btn.js'].lineData[133]++;
  colorWin.show();
}, 
  _selectColor: function(ev) {
  _$jscoverage['/btn.js'].functionData[10]++;
  _$jscoverage['/btn.js'].lineData[137]++;
  ev.halt();
  _$jscoverage['/btn.js'].lineData[138]++;
  var self = this, editor = self.get('editor'), prefixCls = editor.get('prefixCls'), t = new Node(ev.target);
  _$jscoverage['/btn.js'].lineData[142]++;
  if (visit7_142_1(t.hasClass(prefixCls + 'editor-color-a'))) {
    _$jscoverage['/btn.js'].lineData[143]++;
    self.fire('selectColor', {
  color: t.style('background-color')});
  } else {
    _$jscoverage['/btn.js'].lineData[146]++;
    if (visit8_146_1(t.hasClass(prefixCls + 'editor-color-remove'))) {
      _$jscoverage['/btn.js'].lineData[147]++;
      self.fire('selectColor', {
  color: null});
    }
  }
}, 
  destructor: function() {
  _$jscoverage['/btn.js'].functionData[11]++;
  _$jscoverage['/btn.js'].lineData[154]++;
  var self = this;
  _$jscoverage['/btn.js'].lineData[155]++;
  if (visit9_155_1(self.colorWin)) {
    _$jscoverage['/btn.js'].lineData[156]++;
    self.colorWin.destroy();
  }
}}, {
  ATTRS: {
  checkable: {
  value: true}, 
  mode: {
  value: Editor.Mode.WYSIWYG_MODE}}});
  _$jscoverage['/btn.js'].lineData[170]++;
  var tpl = '<div class="{icon}"></div>' + '<div style="background-color:{defaultColor}"' + ' class="{indicator}"></div>';
  _$jscoverage['/btn.js'].lineData[174]++;
  function runCmd(editor, cmdType, color) {
    _$jscoverage['/btn.js'].functionData[12]++;
    _$jscoverage['/btn.js'].lineData[175]++;
    setTimeout(function() {
  _$jscoverage['/btn.js'].functionData[13]++;
  _$jscoverage['/btn.js'].lineData[176]++;
  editor.execCommand(cmdType, color);
}, 0);
  }
  _$jscoverage['/btn.js'].lineData[180]++;
  ColorButton.init = function(editor, cfg) {
  _$jscoverage['/btn.js'].functionData[14]++;
  _$jscoverage['/btn.js'].lineData[181]++;
  var prefix = editor.get('prefixCls') + 'editor-toolbar-', cmdType = cfg.cmdType, defaultColor = cfg.defaultColor, tooltip = cfg.tooltip;
  _$jscoverage['/btn.js'].lineData[186]++;
  var button = editor.addButton(cmdType, {
  elCls: cmdType + 'Btn', 
  content: util.substitute(tpl, {
  defaultColor: defaultColor, 
  icon: prefix + 'item ' + prefix + cmdType, 
  indicator: prefix + 'color-indicator'}), 
  mode: Editor.Mode.WYSIWYG_MODE, 
  tooltip: '\u8bbe\u7f6e' + tooltip});
  _$jscoverage['/btn.js'].lineData[197]++;
  var arrow = editor.addButton(cmdType + 'Arrow', {
  tooltip: '\u9009\u62e9\u5e76\u8bbe\u7f6e' + tooltip, 
  elCls: cmdType + 'ArrowBtn'}, ColorButton);
  _$jscoverage['/btn.js'].lineData[202]++;
  var indicator = button.get('el').one('.' + prefix + 'color-indicator');
  _$jscoverage['/btn.js'].lineData[204]++;
  arrow.on('selectColor', function(e) {
  _$jscoverage['/btn.js'].functionData[15]++;
  _$jscoverage['/btn.js'].lineData[205]++;
  indicator.css('background-color', visit10_205_1(e.color || defaultColor));
  _$jscoverage['/btn.js'].lineData[206]++;
  runCmd(editor, cmdType, e.color);
});
  _$jscoverage['/btn.js'].lineData[209]++;
  button.on('click', function() {
  _$jscoverage['/btn.js'].functionData[16]++;
  _$jscoverage['/btn.js'].lineData[210]++;
  runCmd(editor, cmdType, indicator.style('background-color'));
});
};
  _$jscoverage['/btn.js'].lineData[214]++;
  return ColorButton;
});
