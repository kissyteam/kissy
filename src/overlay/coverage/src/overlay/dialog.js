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
if (! _$jscoverage['/overlay/dialog.js']) {
  _$jscoverage['/overlay/dialog.js'] = {};
  _$jscoverage['/overlay/dialog.js'].lineData = [];
  _$jscoverage['/overlay/dialog.js'].lineData[6] = 0;
  _$jscoverage['/overlay/dialog.js'].lineData[7] = 0;
  _$jscoverage['/overlay/dialog.js'].lineData[8] = 0;
  _$jscoverage['/overlay/dialog.js'].lineData[9] = 0;
  _$jscoverage['/overlay/dialog.js'].lineData[10] = 0;
  _$jscoverage['/overlay/dialog.js'].lineData[12] = 0;
  _$jscoverage['/overlay/dialog.js'].lineData[13] = 0;
  _$jscoverage['/overlay/dialog.js'].lineData[14] = 0;
  _$jscoverage['/overlay/dialog.js'].lineData[22] = 0;
  _$jscoverage['/overlay/dialog.js'].lineData[24] = 0;
  _$jscoverage['/overlay/dialog.js'].lineData[31] = 0;
  _$jscoverage['/overlay/dialog.js'].lineData[36] = 0;
  _$jscoverage['/overlay/dialog.js'].lineData[44] = 0;
  _$jscoverage['/overlay/dialog.js'].lineData[46] = 0;
  _$jscoverage['/overlay/dialog.js'].lineData[50] = 0;
  _$jscoverage['/overlay/dialog.js'].lineData[52] = 0;
  _$jscoverage['/overlay/dialog.js'].lineData[54] = 0;
  _$jscoverage['/overlay/dialog.js'].lineData[55] = 0;
  _$jscoverage['/overlay/dialog.js'].lineData[57] = 0;
  _$jscoverage['/overlay/dialog.js'].lineData[59] = 0;
  _$jscoverage['/overlay/dialog.js'].lineData[63] = 0;
  _$jscoverage['/overlay/dialog.js'].lineData[65] = 0;
  _$jscoverage['/overlay/dialog.js'].lineData[66] = 0;
  _$jscoverage['/overlay/dialog.js'].lineData[67] = 0;
  _$jscoverage['/overlay/dialog.js'].lineData[68] = 0;
  _$jscoverage['/overlay/dialog.js'].lineData[73] = 0;
  _$jscoverage['/overlay/dialog.js'].lineData[75] = 0;
  _$jscoverage['/overlay/dialog.js'].lineData[76] = 0;
  _$jscoverage['/overlay/dialog.js'].lineData[77] = 0;
  _$jscoverage['/overlay/dialog.js'].lineData[78] = 0;
  _$jscoverage['/overlay/dialog.js'].lineData[87] = 0;
  _$jscoverage['/overlay/dialog.js'].lineData[91] = 0;
  _$jscoverage['/overlay/dialog.js'].lineData[95] = 0;
  _$jscoverage['/overlay/dialog.js'].lineData[114] = 0;
  _$jscoverage['/overlay/dialog.js'].lineData[128] = 0;
  _$jscoverage['/overlay/dialog.js'].lineData[142] = 0;
  _$jscoverage['/overlay/dialog.js'].lineData[190] = 0;
  _$jscoverage['/overlay/dialog.js'].lineData[205] = 0;
  _$jscoverage['/overlay/dialog.js'].lineData[220] = 0;
  _$jscoverage['/overlay/dialog.js'].lineData[272] = 0;
  _$jscoverage['/overlay/dialog.js'].lineData[275] = 0;
  _$jscoverage['/overlay/dialog.js'].lineData[276] = 0;
  _$jscoverage['/overlay/dialog.js'].lineData[279] = 0;
  _$jscoverage['/overlay/dialog.js'].lineData[280] = 0;
  _$jscoverage['/overlay/dialog.js'].lineData[282] = 0;
  _$jscoverage['/overlay/dialog.js'].lineData[286] = 0;
  _$jscoverage['/overlay/dialog.js'].lineData[291] = 0;
  _$jscoverage['/overlay/dialog.js'].lineData[296] = 0;
  _$jscoverage['/overlay/dialog.js'].lineData[297] = 0;
  _$jscoverage['/overlay/dialog.js'].lineData[298] = 0;
  _$jscoverage['/overlay/dialog.js'].lineData[299] = 0;
  _$jscoverage['/overlay/dialog.js'].lineData[301] = 0;
  _$jscoverage['/overlay/dialog.js'].lineData[302] = 0;
  _$jscoverage['/overlay/dialog.js'].lineData[305] = 0;
  _$jscoverage['/overlay/dialog.js'].lineData[306] = 0;
  _$jscoverage['/overlay/dialog.js'].lineData[311] = 0;
  _$jscoverage['/overlay/dialog.js'].lineData[314] = 0;
}
if (! _$jscoverage['/overlay/dialog.js'].functionData) {
  _$jscoverage['/overlay/dialog.js'].functionData = [];
  _$jscoverage['/overlay/dialog.js'].functionData[0] = 0;
  _$jscoverage['/overlay/dialog.js'].functionData[1] = 0;
  _$jscoverage['/overlay/dialog.js'].functionData[2] = 0;
  _$jscoverage['/overlay/dialog.js'].functionData[3] = 0;
  _$jscoverage['/overlay/dialog.js'].functionData[4] = 0;
  _$jscoverage['/overlay/dialog.js'].functionData[5] = 0;
  _$jscoverage['/overlay/dialog.js'].functionData[6] = 0;
  _$jscoverage['/overlay/dialog.js'].functionData[7] = 0;
  _$jscoverage['/overlay/dialog.js'].functionData[8] = 0;
  _$jscoverage['/overlay/dialog.js'].functionData[9] = 0;
  _$jscoverage['/overlay/dialog.js'].functionData[10] = 0;
  _$jscoverage['/overlay/dialog.js'].functionData[11] = 0;
  _$jscoverage['/overlay/dialog.js'].functionData[12] = 0;
  _$jscoverage['/overlay/dialog.js'].functionData[13] = 0;
  _$jscoverage['/overlay/dialog.js'].functionData[14] = 0;
  _$jscoverage['/overlay/dialog.js'].functionData[15] = 0;
  _$jscoverage['/overlay/dialog.js'].functionData[16] = 0;
}
if (! _$jscoverage['/overlay/dialog.js'].branchData) {
  _$jscoverage['/overlay/dialog.js'].branchData = {};
  _$jscoverage['/overlay/dialog.js'].branchData['50'] = [];
  _$jscoverage['/overlay/dialog.js'].branchData['50'][1] = new BranchData();
  _$jscoverage['/overlay/dialog.js'].branchData['51'] = [];
  _$jscoverage['/overlay/dialog.js'].branchData['51'][1] = new BranchData();
  _$jscoverage['/overlay/dialog.js'].branchData['52'] = [];
  _$jscoverage['/overlay/dialog.js'].branchData['52'][1] = new BranchData();
  _$jscoverage['/overlay/dialog.js'].branchData['52'][2] = new BranchData();
  _$jscoverage['/overlay/dialog.js'].branchData['52'][3] = new BranchData();
  _$jscoverage['/overlay/dialog.js'].branchData['66'] = [];
  _$jscoverage['/overlay/dialog.js'].branchData['66'][1] = new BranchData();
  _$jscoverage['/overlay/dialog.js'].branchData['77'] = [];
  _$jscoverage['/overlay/dialog.js'].branchData['77'][1] = new BranchData();
  _$jscoverage['/overlay/dialog.js'].branchData['279'] = [];
  _$jscoverage['/overlay/dialog.js'].branchData['279'][1] = new BranchData();
  _$jscoverage['/overlay/dialog.js'].branchData['296'] = [];
  _$jscoverage['/overlay/dialog.js'].branchData['296'][1] = new BranchData();
  _$jscoverage['/overlay/dialog.js'].branchData['299'] = [];
  _$jscoverage['/overlay/dialog.js'].branchData['299'][1] = new BranchData();
  _$jscoverage['/overlay/dialog.js'].branchData['305'] = [];
  _$jscoverage['/overlay/dialog.js'].branchData['305'][1] = new BranchData();
}
_$jscoverage['/overlay/dialog.js'].branchData['305'][1].init(67, 38, 'node.equals($el) || $el.contains(node)');
function visit17_305_1(result) {
  _$jscoverage['/overlay/dialog.js'].branchData['305'][1].ranCondition(result);
  return result;
}_$jscoverage['/overlay/dialog.js'].branchData['299'][1].init(945, 41, 'node.equals(lastFocusItem) && !e.shiftKey');
function visit16_299_1(result) {
  _$jscoverage['/overlay/dialog.js'].branchData['299'][1].ranCondition(result);
  return result;
}_$jscoverage['/overlay/dialog.js'].branchData['296'][1].init(761, 30, 'node.equals($el) && e.shiftKey');
function visit15_296_1(result) {
  _$jscoverage['/overlay/dialog.js'].branchData['296'][1].ranCondition(result);
  return result;
}_$jscoverage['/overlay/dialog.js'].branchData['279'][1].init(76, 19, 'keyCode !== KEY_TAB');
function visit14_279_1(result) {
  _$jscoverage['/overlay/dialog.js'].branchData['279'][1].ranCondition(result);
  return result;
}_$jscoverage['/overlay/dialog.js'].branchData['77'][1].init(26, 17, 'self.__lastActive');
function visit13_77_1(result) {
  _$jscoverage['/overlay/dialog.js'].branchData['77'][1].ranCondition(result);
  return result;
}_$jscoverage['/overlay/dialog.js'].branchData['66'][1].init(114, 1, 'v');
function visit12_66_1(result) {
  _$jscoverage['/overlay/dialog.js'].branchData['66'][1].ranCondition(result);
  return result;
}_$jscoverage['/overlay/dialog.js'].branchData['52'][3].init(24, 44, 'e.target.nodeName.toLowerCase() === \'select\'');
function visit11_52_3(result) {
  _$jscoverage['/overlay/dialog.js'].branchData['52'][3].ranCondition(result);
  return result;
}_$jscoverage['/overlay/dialog.js'].branchData['52'][2].init(24, 66, 'e.target.nodeName.toLowerCase() === \'select\' && !e.target.disabled');
function visit10_52_2(result) {
  _$jscoverage['/overlay/dialog.js'].branchData['52'][2].ranCondition(result);
  return result;
}_$jscoverage['/overlay/dialog.js'].branchData['52'][1].init(22, 69, '!(e.target.nodeName.toLowerCase() === \'select\' && !e.target.disabled)');
function visit9_52_1(result) {
  _$jscoverage['/overlay/dialog.js'].branchData['52'][1].ranCondition(result);
  return result;
}_$jscoverage['/overlay/dialog.js'].branchData['51'][1].init(45, 30, 'e.keyCode === Node.KeyCode.ESC');
function visit8_51_1(result) {
  _$jscoverage['/overlay/dialog.js'].branchData['51'][1].ranCondition(result);
  return result;
}_$jscoverage['/overlay/dialog.js'].branchData['50'][1].init(18, 76, 'this.get(\'escapeToClose\') && e.keyCode === Node.KeyCode.ESC');
function visit7_50_1(result) {
  _$jscoverage['/overlay/dialog.js'].branchData['50'][1].ranCondition(result);
  return result;
}_$jscoverage['/overlay/dialog.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/overlay/dialog.js'].functionData[0]++;
  _$jscoverage['/overlay/dialog.js'].lineData[7]++;
  var util = require('util');
  _$jscoverage['/overlay/dialog.js'].lineData[8]++;
  var Overlay = require('./control');
  _$jscoverage['/overlay/dialog.js'].lineData[9]++;
  var Node = require('node');
  _$jscoverage['/overlay/dialog.js'].lineData[10]++;
  var DialogTpl = require('./dialog-xtpl');
  _$jscoverage['/overlay/dialog.js'].lineData[12]++;
  function _setStdModRenderContent(self, part, v) {
    _$jscoverage['/overlay/dialog.js'].functionData[1]++;
    _$jscoverage['/overlay/dialog.js'].lineData[13]++;
    part = self.get(part);
    _$jscoverage['/overlay/dialog.js'].lineData[14]++;
    part.html(v);
  }
  _$jscoverage['/overlay/dialog.js'].lineData[22]++;
  var Dialog = Overlay.extend({
  beforeCreateDom: function(renderData) {
  _$jscoverage['/overlay/dialog.js'].functionData[2]++;
  _$jscoverage['/overlay/dialog.js'].lineData[24]++;
  util.mix(renderData.elAttrs, {
  role: 'dialog', 
  'aria-labelledby': 'ks-stdmod-header-' + this.get('id')});
}, 
  getChildrenContainerEl: function() {
  _$jscoverage['/overlay/dialog.js'].functionData[3]++;
  _$jscoverage['/overlay/dialog.js'].lineData[31]++;
  return this.get('body');
}, 
  __afterCreateEffectGhost: function(ghost) {
  _$jscoverage['/overlay/dialog.js'].functionData[4]++;
  _$jscoverage['/overlay/dialog.js'].lineData[36]++;
  var self = this, elBody = self.get('body');
  _$jscoverage['/overlay/dialog.js'].lineData[44]++;
  ghost.all('.' + self.get('prefixCls') + 'stdmod-body').css({
  height: elBody.height(), 
  width: elBody.width()}).html('');
  _$jscoverage['/overlay/dialog.js'].lineData[46]++;
  return ghost;
}, 
  handleKeyDownInternal: function(e) {
  _$jscoverage['/overlay/dialog.js'].functionData[5]++;
  _$jscoverage['/overlay/dialog.js'].lineData[50]++;
  if (visit7_50_1(this.get('escapeToClose') && visit8_51_1(e.keyCode === Node.KeyCode.ESC))) {
    _$jscoverage['/overlay/dialog.js'].lineData[52]++;
    if (visit9_52_1(!(visit10_52_2(visit11_52_3(e.target.nodeName.toLowerCase() === 'select') && !e.target.disabled)))) {
      _$jscoverage['/overlay/dialog.js'].lineData[54]++;
      this.close();
      _$jscoverage['/overlay/dialog.js'].lineData[55]++;
      e.halt();
    }
    _$jscoverage['/overlay/dialog.js'].lineData[57]++;
    return;
  }
  _$jscoverage['/overlay/dialog.js'].lineData[59]++;
  trapFocus.call(this, e);
}, 
  _onSetVisible: function(v, e) {
  _$jscoverage['/overlay/dialog.js'].functionData[6]++;
  _$jscoverage['/overlay/dialog.js'].lineData[63]++;
  var self = this, el = self.el;
  _$jscoverage['/overlay/dialog.js'].lineData[65]++;
  self.callSuper(v, e);
  _$jscoverage['/overlay/dialog.js'].lineData[66]++;
  if (visit12_66_1(v)) {
    _$jscoverage['/overlay/dialog.js'].lineData[67]++;
    self.__lastActive = el.ownerDocument.activeElement;
    _$jscoverage['/overlay/dialog.js'].lineData[68]++;
    self.focus();
    _$jscoverage['/overlay/dialog.js'].lineData[73]++;
    el.setAttribute('aria-hidden', 'false');
  } else {
    _$jscoverage['/overlay/dialog.js'].lineData[75]++;
    el.setAttribute('aria-hidden', 'true');
    _$jscoverage['/overlay/dialog.js'].lineData[76]++;
    try {
      _$jscoverage['/overlay/dialog.js'].lineData[77]++;
      if (visit13_77_1(self.__lastActive)) {
        _$jscoverage['/overlay/dialog.js'].lineData[78]++;
        self.__lastActive.focus();
      }
    }    catch (ee) {
}
  }
}, 
  _onSetBodyContent: function(v) {
  _$jscoverage['/overlay/dialog.js'].functionData[7]++;
  _$jscoverage['/overlay/dialog.js'].lineData[87]++;
  _setStdModRenderContent(this, 'body', v);
}, 
  _onSetHeaderContent: function(v) {
  _$jscoverage['/overlay/dialog.js'].functionData[8]++;
  _$jscoverage['/overlay/dialog.js'].lineData[91]++;
  _setStdModRenderContent(this, 'header', v);
}, 
  _onSetFooterContent: function(v) {
  _$jscoverage['/overlay/dialog.js'].functionData[9]++;
  _$jscoverage['/overlay/dialog.js'].lineData[95]++;
  _setStdModRenderContent(this, 'footer', v);
}}, {
  ATTRS: {
  contentTpl: {
  value: DialogTpl}, 
  header: {
  selector: function() {
  _$jscoverage['/overlay/dialog.js'].functionData[10]++;
  _$jscoverage['/overlay/dialog.js'].lineData[114]++;
  return '.' + this.getBaseCssClass('header');
}}, 
  body: {
  selector: function() {
  _$jscoverage['/overlay/dialog.js'].functionData[11]++;
  _$jscoverage['/overlay/dialog.js'].lineData[128]++;
  return '.' + this.getBaseCssClass('body');
}}, 
  footer: {
  selector: function() {
  _$jscoverage['/overlay/dialog.js'].functionData[12]++;
  _$jscoverage['/overlay/dialog.js'].lineData[142]++;
  return '.' + this.getBaseCssClass('footer');
}}, 
  bodyStyle: {
  value: {}, 
  sync: 0}, 
  footerStyle: {
  value: {}, 
  render: 1}, 
  headerStyle: {
  value: {}, 
  render: 1}, 
  headerContent: {
  value: '', 
  sync: 0, 
  render: 1, 
  parse: function() {
  _$jscoverage['/overlay/dialog.js'].functionData[13]++;
  _$jscoverage['/overlay/dialog.js'].lineData[190]++;
  return this.get('header').html();
}}, 
  bodyContent: {
  value: '', 
  sync: 0, 
  render: 1, 
  parse: function() {
  _$jscoverage['/overlay/dialog.js'].functionData[14]++;
  _$jscoverage['/overlay/dialog.js'].lineData[205]++;
  return this.get('body').html();
}}, 
  footerContent: {
  value: '', 
  sync: 0, 
  render: 1, 
  parse: function() {
  _$jscoverage['/overlay/dialog.js'].functionData[15]++;
  _$jscoverage['/overlay/dialog.js'].lineData[220]++;
  return this.get('footer').html();
}}, 
  closable: {
  value: true}, 
  focusable: {
  value: true}, 
  escapeToClose: {
  value: true}}, 
  xclass: 'dialog'});
  _$jscoverage['/overlay/dialog.js'].lineData[272]++;
  var KEY_TAB = Node.KeyCode.TAB;
  _$jscoverage['/overlay/dialog.js'].lineData[275]++;
  function trapFocus(e) {
    _$jscoverage['/overlay/dialog.js'].functionData[16]++;
    _$jscoverage['/overlay/dialog.js'].lineData[276]++;
    var self = this, keyCode = e.keyCode;
    _$jscoverage['/overlay/dialog.js'].lineData[279]++;
    if (visit14_279_1(keyCode !== KEY_TAB)) {
      _$jscoverage['/overlay/dialog.js'].lineData[280]++;
      return;
    }
    _$jscoverage['/overlay/dialog.js'].lineData[282]++;
    var $el = self.$el;
    _$jscoverage['/overlay/dialog.js'].lineData[286]++;
    var node = Node.all(e.target);
    _$jscoverage['/overlay/dialog.js'].lineData[291]++;
    var lastFocusItem = $el.last();
    _$jscoverage['/overlay/dialog.js'].lineData[296]++;
    if (visit15_296_1(node.equals($el) && e.shiftKey)) {
      _$jscoverage['/overlay/dialog.js'].lineData[297]++;
      lastFocusItem[0].focus();
      _$jscoverage['/overlay/dialog.js'].lineData[298]++;
      e.halt();
    } else {
      _$jscoverage['/overlay/dialog.js'].lineData[299]++;
      if (visit16_299_1(node.equals(lastFocusItem) && !e.shiftKey)) {
        _$jscoverage['/overlay/dialog.js'].lineData[301]++;
        self.focus();
        _$jscoverage['/overlay/dialog.js'].lineData[302]++;
        e.halt();
      } else {
        _$jscoverage['/overlay/dialog.js'].lineData[305]++;
        if (visit17_305_1(node.equals($el) || $el.contains(node))) {
          _$jscoverage['/overlay/dialog.js'].lineData[306]++;
          return;
        }
      }
    }
    _$jscoverage['/overlay/dialog.js'].lineData[311]++;
    e.halt();
  }
  _$jscoverage['/overlay/dialog.js'].lineData[314]++;
  return Dialog;
});
