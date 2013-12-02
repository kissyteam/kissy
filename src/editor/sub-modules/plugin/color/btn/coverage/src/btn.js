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
  _$jscoverage['/btn.js'].lineData[14] = 0;
  _$jscoverage['/btn.js'].lineData[28] = 0;
  _$jscoverage['/btn.js'].lineData[29] = 0;
  _$jscoverage['/btn.js'].lineData[34] = 0;
  _$jscoverage['/btn.js'].lineData[35] = 0;
  _$jscoverage['/btn.js'].lineData[36] = 0;
  _$jscoverage['/btn.js'].lineData[37] = 0;
  _$jscoverage['/btn.js'].lineData[38] = 0;
  _$jscoverage['/btn.js'].lineData[39] = 0;
  _$jscoverage['/btn.js'].lineData[40] = 0;
  _$jscoverage['/btn.js'].lineData[41] = 0;
  _$jscoverage['/btn.js'].lineData[42] = 0;
  _$jscoverage['/btn.js'].lineData[46] = 0;
  _$jscoverage['/btn.js'].lineData[48] = 0;
  _$jscoverage['/btn.js'].lineData[50] = 0;
  _$jscoverage['/btn.js'].lineData[52] = 0;
  _$jscoverage['/btn.js'].lineData[59] = 0;
  _$jscoverage['/btn.js'].lineData[61] = 0;
  _$jscoverage['/btn.js'].lineData[63] = 0;
  _$jscoverage['/btn.js'].lineData[64] = 0;
  _$jscoverage['/btn.js'].lineData[66] = 0;
  _$jscoverage['/btn.js'].lineData[67] = 0;
  _$jscoverage['/btn.js'].lineData[68] = 0;
  _$jscoverage['/btn.js'].lineData[72] = 0;
  _$jscoverage['/btn.js'].lineData[73] = 0;
  _$jscoverage['/btn.js'].lineData[74] = 0;
  _$jscoverage['/btn.js'].lineData[75] = 0;
  _$jscoverage['/btn.js'].lineData[77] = 0;
  _$jscoverage['/btn.js'].lineData[78] = 0;
  _$jscoverage['/btn.js'].lineData[85] = 0;
  _$jscoverage['/btn.js'].lineData[90] = 0;
  _$jscoverage['/btn.js'].lineData[103] = 0;
  _$jscoverage['/btn.js'].lineData[104] = 0;
  _$jscoverage['/btn.js'].lineData[105] = 0;
  _$jscoverage['/btn.js'].lineData[106] = 0;
  _$jscoverage['/btn.js'].lineData[107] = 0;
  _$jscoverage['/btn.js'].lineData[109] = 0;
  _$jscoverage['/btn.js'].lineData[110] = 0;
  _$jscoverage['/btn.js'].lineData[111] = 0;
  _$jscoverage['/btn.js'].lineData[112] = 0;
  _$jscoverage['/btn.js'].lineData[113] = 0;
  _$jscoverage['/btn.js'].lineData[115] = 0;
  _$jscoverage['/btn.js'].lineData[116] = 0;
  _$jscoverage['/btn.js'].lineData[120] = 0;
  _$jscoverage['/btn.js'].lineData[123] = 0;
  _$jscoverage['/btn.js'].lineData[132] = 0;
  _$jscoverage['/btn.js'].lineData[136] = 0;
  _$jscoverage['/btn.js'].lineData[137] = 0;
  _$jscoverage['/btn.js'].lineData[141] = 0;
  _$jscoverage['/btn.js'].lineData[142] = 0;
  _$jscoverage['/btn.js'].lineData[145] = 0;
  _$jscoverage['/btn.js'].lineData[146] = 0;
  _$jscoverage['/btn.js'].lineData[153] = 0;
  _$jscoverage['/btn.js'].lineData[154] = 0;
  _$jscoverage['/btn.js'].lineData[155] = 0;
  _$jscoverage['/btn.js'].lineData[169] = 0;
  _$jscoverage['/btn.js'].lineData[173] = 0;
  _$jscoverage['/btn.js'].lineData[174] = 0;
  _$jscoverage['/btn.js'].lineData[175] = 0;
  _$jscoverage['/btn.js'].lineData[179] = 0;
  _$jscoverage['/btn.js'].lineData[180] = 0;
  _$jscoverage['/btn.js'].lineData[185] = 0;
  _$jscoverage['/btn.js'].lineData[196] = 0;
  _$jscoverage['/btn.js'].lineData[201] = 0;
  _$jscoverage['/btn.js'].lineData[203] = 0;
  _$jscoverage['/btn.js'].lineData[204] = 0;
  _$jscoverage['/btn.js'].lineData[205] = 0;
  _$jscoverage['/btn.js'].lineData[208] = 0;
  _$jscoverage['/btn.js'].lineData[209] = 0;
  _$jscoverage['/btn.js'].lineData[213] = 0;
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
  _$jscoverage['/btn.js'].branchData['34'] = [];
  _$jscoverage['/btn.js'].branchData['34'][1] = new BranchData();
  _$jscoverage['/btn.js'].branchData['37'] = [];
  _$jscoverage['/btn.js'].branchData['37'][1] = new BranchData();
  _$jscoverage['/btn.js'].branchData['39'] = [];
  _$jscoverage['/btn.js'].branchData['39'][1] = new BranchData();
  _$jscoverage['/btn.js'].branchData['67'] = [];
  _$jscoverage['/btn.js'].branchData['67'][1] = new BranchData();
  _$jscoverage['/btn.js'].branchData['74'] = [];
  _$jscoverage['/btn.js'].branchData['74'][1] = new BranchData();
  _$jscoverage['/btn.js'].branchData['77'] = [];
  _$jscoverage['/btn.js'].branchData['77'][1] = new BranchData();
  _$jscoverage['/btn.js'].branchData['141'] = [];
  _$jscoverage['/btn.js'].branchData['141'][1] = new BranchData();
  _$jscoverage['/btn.js'].branchData['145'] = [];
  _$jscoverage['/btn.js'].branchData['145'][1] = new BranchData();
  _$jscoverage['/btn.js'].branchData['154'] = [];
  _$jscoverage['/btn.js'].branchData['154'][1] = new BranchData();
  _$jscoverage['/btn.js'].branchData['204'] = [];
  _$jscoverage['/btn.js'].branchData['204'][1] = new BranchData();
}
_$jscoverage['/btn.js'].branchData['204'][1].init(47, 23, 'e.color || defaultColor');
function visit10_204_1(result) {
  _$jscoverage['/btn.js'].branchData['204'][1].ranCondition(result);
  return result;
}_$jscoverage['/btn.js'].branchData['154'][1].init(46, 13, 'self.colorWin');
function visit9_154_1(result) {
  _$jscoverage['/btn.js'].branchData['154'][1].ranCondition(result);
  return result;
}_$jscoverage['/btn.js'].branchData['145'][1].init(394, 45, 't.hasClass(prefixCls + \'editor-color-remove\')');
function visit8_145_1(result) {
  _$jscoverage['/btn.js'].branchData['145'][1].ranCondition(result);
  return result;
}_$jscoverage['/btn.js'].branchData['141'][1].init(208, 40, 't.hasClass(prefixCls + \'editor-color-a\')');
function visit7_141_1(result) {
  _$jscoverage['/btn.js'].branchData['141'][1].ranCondition(result);
  return result;
}_$jscoverage['/btn.js'].branchData['77'][1].init(24, 13, 'self.colorWin');
function visit6_77_1(result) {
  _$jscoverage['/btn.js'].branchData['77'][1].ranCondition(result);
  return result;
}_$jscoverage['/btn.js'].branchData['74'][1].init(72, 7, 'checked');
function visit5_74_1(result) {
  _$jscoverage['/btn.js'].branchData['74'][1].ranCondition(result);
  return result;
}_$jscoverage['/btn.js'].branchData['67'][1].init(24, 13, 'self.colorWin');
function visit4_67_1(result) {
  _$jscoverage['/btn.js'].branchData['67'][1].ranCondition(result);
  return result;
}_$jscoverage['/btn.js'].branchData['39'][1].init(65, 5, 'j < 8');
function visit3_39_1(result) {
  _$jscoverage['/btn.js'].branchData['39'][1].ranCondition(result);
  return result;
}_$jscoverage['/btn.js'].branchData['37'][1].init(154, 5, 'k < l');
function visit2_37_1(result) {
  _$jscoverage['/btn.js'].branchData['37'][1].ranCondition(result);
  return result;
}_$jscoverage['/btn.js'].branchData['34'][1].init(235, 5, 'i < 3');
function visit1_34_1(result) {
  _$jscoverage['/btn.js'].branchData['34'][1].ranCondition(result);
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
  var Node = S.Node;
  _$jscoverage['/btn.js'].lineData[14]++;
  var COLORS = [['000', '444', '666', '999', 'CCC', 'EEE', 'F3F3F3', 'FFF'], ['F00', 'F90', 'FF0', '0F0', '0FF', '00F', '90F', 'F0F'], ['F4CC' + 'CC', 'FCE5CD', 'FFF2CC', 'D9EAD3', 'D0E0E3', 'CFE2F3', 'D9D2E9', 'EAD1DC', 'EA9999', 'F9CB9C', 'FFE599', 'B6D7A8', 'A2C4C9', '9FC5E8', 'B4A7D6', 'D5A6BD', 'E06666', 'F6B26B', 'FFD966', '93C47D', '76A5AF', '6FA8DC', '8E7CC3', 'C27BAD', 'CC0000', 'E69138', 'F1C232', '6AA84F', '45818E', '3D85C6', '674EA7', 'A64D79', '990000', 'B45F06', 'BF9000', '38761D', '134F5C', '0B5394', '351C75', '741B47', '660000', '783F04', '7F6000', '274E13', '0C343D', '073763', '20124D', '4C1130']], html;
  _$jscoverage['/btn.js'].lineData[28]++;
  function initHTML() {
    _$jscoverage['/btn.js'].functionData[1]++;
    _$jscoverage['/btn.js'].lineData[29]++;
    html = '<div class="{prefixCls}editor-color-panel">' + '<a class="{prefixCls}editor-color-remove" ' + 'href="javascript:void(\'\u6e05\u9664\');">' + '\u6e05\u9664' + '</a>';
    _$jscoverage['/btn.js'].lineData[34]++;
    for (var i = 0; visit1_34_1(i < 3); i++) {
      _$jscoverage['/btn.js'].lineData[35]++;
      html += '<div class="{prefixCls}editor-color-palette"><table>';
      _$jscoverage['/btn.js'].lineData[36]++;
      var c = COLORS[i], l = c.length / 8;
      _$jscoverage['/btn.js'].lineData[37]++;
      for (var k = 0; visit2_37_1(k < l); k++) {
        _$jscoverage['/btn.js'].lineData[38]++;
        html += '<tr>';
        _$jscoverage['/btn.js'].lineData[39]++;
        for (var j = 0; visit3_39_1(j < 8); j++) {
          _$jscoverage['/btn.js'].lineData[40]++;
          var currentColor = '#' + (c[8 * k + j]);
          _$jscoverage['/btn.js'].lineData[41]++;
          html += '<td>';
          _$jscoverage['/btn.js'].lineData[42]++;
          html += '<a href="javascript:void(0);" ' + 'class="{prefixCls}editor-color-a" ' + 'style="background-color:' + currentColor + '"' + '></a>';
          _$jscoverage['/btn.js'].lineData[46]++;
          html += '</td>';
        }
        _$jscoverage['/btn.js'].lineData[48]++;
        html += '</tr>';
      }
      _$jscoverage['/btn.js'].lineData[50]++;
      html += '</table></div>';
    }
    _$jscoverage['/btn.js'].lineData[52]++;
    html += '' + '<div>' + '<a class="{prefixCls}editor-button {prefixCls}editor-color-others ks-inline-block">\u5176\u4ed6\u989c\u8272</a>' + '</div>' + '</div>';
  }
  _$jscoverage['/btn.js'].lineData[59]++;
  initHTML();
  _$jscoverage['/btn.js'].lineData[61]++;
  var ColorButton = Button.extend({
  initializer: function() {
  _$jscoverage['/btn.js'].functionData[2]++;
  _$jscoverage['/btn.js'].lineData[63]++;
  var self = this;
  _$jscoverage['/btn.js'].lineData[64]++;
  self.on('blur', function() {
  _$jscoverage['/btn.js'].functionData[3]++;
  _$jscoverage['/btn.js'].lineData[66]++;
  setTimeout(function() {
  _$jscoverage['/btn.js'].functionData[4]++;
  _$jscoverage['/btn.js'].lineData[67]++;
  if (visit4_67_1(self.colorWin)) {
    _$jscoverage['/btn.js'].lineData[68]++;
    self.colorWin.hide();
  }
}, 150);
});
  _$jscoverage['/btn.js'].lineData[72]++;
  self.on('click', function() {
  _$jscoverage['/btn.js'].functionData[5]++;
  _$jscoverage['/btn.js'].lineData[73]++;
  var checked = self.get('checked');
  _$jscoverage['/btn.js'].lineData[74]++;
  if (visit5_74_1(checked)) {
    _$jscoverage['/btn.js'].lineData[75]++;
    self._prepare();
  } else {
    _$jscoverage['/btn.js'].lineData[77]++;
    if (visit6_77_1(self.colorWin)) {
      _$jscoverage['/btn.js'].lineData[78]++;
      self.colorWin.hide();
    }
  }
});
}, 
  _prepare: function() {
  _$jscoverage['/btn.js'].functionData[6]++;
  _$jscoverage['/btn.js'].lineData[85]++;
  var self = this, editor = self.get('editor'), prefixCls = editor.get('prefixCls'), colorPanel;
  _$jscoverage['/btn.js'].lineData[90]++;
  self.colorWin = new Overlay4E({
  elAttrs: {
  tabindex: 0}, 
  elCls: prefixCls + 'editor-popup', 
  content: S.substitute(html, {
  prefixCls: prefixCls}), 
  width: 172, 
  zIndex: Editor.baseZIndex(Editor.ZIndexManager.POPUP_MENU)}).render();
  _$jscoverage['/btn.js'].lineData[103]++;
  var colorWin = self.colorWin;
  _$jscoverage['/btn.js'].lineData[104]++;
  colorPanel = colorWin.get('contentEl');
  _$jscoverage['/btn.js'].lineData[105]++;
  colorPanel.on('click', self._selectColor, self);
  _$jscoverage['/btn.js'].lineData[106]++;
  colorWin.on('hide', function() {
  _$jscoverage['/btn.js'].functionData[7]++;
  _$jscoverage['/btn.js'].lineData[107]++;
  self.set('checked', false);
});
  _$jscoverage['/btn.js'].lineData[109]++;
  var others = colorPanel.one('.' + prefixCls + 'editor-color-others');
  _$jscoverage['/btn.js'].lineData[110]++;
  others.on('click', function(ev) {
  _$jscoverage['/btn.js'].functionData[8]++;
  _$jscoverage['/btn.js'].lineData[111]++;
  ev.halt();
  _$jscoverage['/btn.js'].lineData[112]++;
  colorWin.hide();
  _$jscoverage['/btn.js'].lineData[113]++;
  DialogLoader.useDialog(editor, 'color', undefined, self);
});
  _$jscoverage['/btn.js'].lineData[115]++;
  self._prepare = self._show;
  _$jscoverage['/btn.js'].lineData[116]++;
  self._show();
}, 
  _show: function() {
  _$jscoverage['/btn.js'].functionData[9]++;
  _$jscoverage['/btn.js'].lineData[120]++;
  var self = this, el = self.get('el'), colorWin = self.colorWin;
  _$jscoverage['/btn.js'].lineData[123]++;
  colorWin.set('align', {
  node: el, 
  points: ['bl', 'tl'], 
  offset: [0, 2], 
  overflow: {
  adjustX: 1, 
  adjustY: 1}});
  _$jscoverage['/btn.js'].lineData[132]++;
  colorWin.show();
}, 
  _selectColor: function(ev) {
  _$jscoverage['/btn.js'].functionData[10]++;
  _$jscoverage['/btn.js'].lineData[136]++;
  ev.halt();
  _$jscoverage['/btn.js'].lineData[137]++;
  var self = this, editor = self.get('editor'), prefixCls = editor.get('prefixCls'), t = new Node(ev.target);
  _$jscoverage['/btn.js'].lineData[141]++;
  if (visit7_141_1(t.hasClass(prefixCls + 'editor-color-a'))) {
    _$jscoverage['/btn.js'].lineData[142]++;
    self.fire('selectColor', {
  color: t.style('background-color')});
  } else {
    _$jscoverage['/btn.js'].lineData[145]++;
    if (visit8_145_1(t.hasClass(prefixCls + 'editor-color-remove'))) {
      _$jscoverage['/btn.js'].lineData[146]++;
      self.fire('selectColor', {
  color: null});
    }
  }
}, 
  destructor: function() {
  _$jscoverage['/btn.js'].functionData[11]++;
  _$jscoverage['/btn.js'].lineData[153]++;
  var self = this;
  _$jscoverage['/btn.js'].lineData[154]++;
  if (visit9_154_1(self.colorWin)) {
    _$jscoverage['/btn.js'].lineData[155]++;
    self.colorWin.destroy();
  }
}}, {
  ATTRS: {
  checkable: {
  value: true}, 
  mode: {
  value: Editor.Mode.WYSIWYG_MODE}}});
  _$jscoverage['/btn.js'].lineData[169]++;
  var tpl = '<div class="{icon}"></div>' + '<div style="background-color:{defaultColor}"' + ' class="{indicator}"></div>';
  _$jscoverage['/btn.js'].lineData[173]++;
  function runCmd(editor, cmdType, color) {
    _$jscoverage['/btn.js'].functionData[12]++;
    _$jscoverage['/btn.js'].lineData[174]++;
    setTimeout(function() {
  _$jscoverage['/btn.js'].functionData[13]++;
  _$jscoverage['/btn.js'].lineData[175]++;
  editor.execCommand(cmdType, color);
}, 0);
  }
  _$jscoverage['/btn.js'].lineData[179]++;
  ColorButton.init = function(editor, cfg) {
  _$jscoverage['/btn.js'].functionData[14]++;
  _$jscoverage['/btn.js'].lineData[180]++;
  var prefix = editor.get('prefixCls') + 'editor-toolbar-', cmdType = cfg.cmdType, defaultColor = cfg.defaultColor, tooltip = cfg.tooltip;
  _$jscoverage['/btn.js'].lineData[185]++;
  var button = editor.addButton(cmdType, {
  elCls: cmdType + 'Btn', 
  content: S.substitute(tpl, {
  defaultColor: defaultColor, 
  icon: prefix + 'item ' + prefix + cmdType, 
  indicator: prefix + 'color-indicator'}), 
  mode: Editor.Mode.WYSIWYG_MODE, 
  tooltip: '\u8bbe\u7f6e' + tooltip});
  _$jscoverage['/btn.js'].lineData[196]++;
  var arrow = editor.addButton(cmdType + 'Arrow', {
  tooltip: '\u9009\u62e9\u5e76\u8bbe\u7f6e' + tooltip, 
  elCls: cmdType + 'ArrowBtn'}, ColorButton);
  _$jscoverage['/btn.js'].lineData[201]++;
  var indicator = button.get('el').one('.' + prefix + 'color-indicator');
  _$jscoverage['/btn.js'].lineData[203]++;
  arrow.on('selectColor', function(e) {
  _$jscoverage['/btn.js'].functionData[15]++;
  _$jscoverage['/btn.js'].lineData[204]++;
  indicator.css('background-color', visit10_204_1(e.color || defaultColor));
  _$jscoverage['/btn.js'].lineData[205]++;
  runCmd(editor, cmdType, e.color);
});
  _$jscoverage['/btn.js'].lineData[208]++;
  button.on('click', function() {
  _$jscoverage['/btn.js'].functionData[16]++;
  _$jscoverage['/btn.js'].lineData[209]++;
  runCmd(editor, cmdType, indicator.style('background-color'));
});
};
  _$jscoverage['/btn.js'].lineData[213]++;
  return ColorButton;
});
