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
  _$jscoverage['/overlay/dialog.js'].lineData[11] = 0;
  _$jscoverage['/overlay/dialog.js'].lineData[12] = 0;
  _$jscoverage['/overlay/dialog.js'].lineData[13] = 0;
  _$jscoverage['/overlay/dialog.js'].lineData[21] = 0;
  _$jscoverage['/overlay/dialog.js'].lineData[23] = 0;
  _$jscoverage['/overlay/dialog.js'].lineData[30] = 0;
  _$jscoverage['/overlay/dialog.js'].lineData[35] = 0;
  _$jscoverage['/overlay/dialog.js'].lineData[43] = 0;
  _$jscoverage['/overlay/dialog.js'].lineData[45] = 0;
  _$jscoverage['/overlay/dialog.js'].lineData[49] = 0;
  _$jscoverage['/overlay/dialog.js'].lineData[51] = 0;
  _$jscoverage['/overlay/dialog.js'].lineData[53] = 0;
  _$jscoverage['/overlay/dialog.js'].lineData[54] = 0;
  _$jscoverage['/overlay/dialog.js'].lineData[56] = 0;
  _$jscoverage['/overlay/dialog.js'].lineData[58] = 0;
  _$jscoverage['/overlay/dialog.js'].lineData[62] = 0;
  _$jscoverage['/overlay/dialog.js'].lineData[64] = 0;
  _$jscoverage['/overlay/dialog.js'].lineData[65] = 0;
  _$jscoverage['/overlay/dialog.js'].lineData[66] = 0;
  _$jscoverage['/overlay/dialog.js'].lineData[67] = 0;
  _$jscoverage['/overlay/dialog.js'].lineData[72] = 0;
  _$jscoverage['/overlay/dialog.js'].lineData[74] = 0;
  _$jscoverage['/overlay/dialog.js'].lineData[75] = 0;
  _$jscoverage['/overlay/dialog.js'].lineData[76] = 0;
  _$jscoverage['/overlay/dialog.js'].lineData[77] = 0;
  _$jscoverage['/overlay/dialog.js'].lineData[86] = 0;
  _$jscoverage['/overlay/dialog.js'].lineData[90] = 0;
  _$jscoverage['/overlay/dialog.js'].lineData[94] = 0;
  _$jscoverage['/overlay/dialog.js'].lineData[113] = 0;
  _$jscoverage['/overlay/dialog.js'].lineData[127] = 0;
  _$jscoverage['/overlay/dialog.js'].lineData[141] = 0;
  _$jscoverage['/overlay/dialog.js'].lineData[189] = 0;
  _$jscoverage['/overlay/dialog.js'].lineData[204] = 0;
  _$jscoverage['/overlay/dialog.js'].lineData[219] = 0;
  _$jscoverage['/overlay/dialog.js'].lineData[271] = 0;
  _$jscoverage['/overlay/dialog.js'].lineData[274] = 0;
  _$jscoverage['/overlay/dialog.js'].lineData[275] = 0;
  _$jscoverage['/overlay/dialog.js'].lineData[278] = 0;
  _$jscoverage['/overlay/dialog.js'].lineData[279] = 0;
  _$jscoverage['/overlay/dialog.js'].lineData[281] = 0;
  _$jscoverage['/overlay/dialog.js'].lineData[285] = 0;
  _$jscoverage['/overlay/dialog.js'].lineData[290] = 0;
  _$jscoverage['/overlay/dialog.js'].lineData[295] = 0;
  _$jscoverage['/overlay/dialog.js'].lineData[296] = 0;
  _$jscoverage['/overlay/dialog.js'].lineData[297] = 0;
  _$jscoverage['/overlay/dialog.js'].lineData[298] = 0;
  _$jscoverage['/overlay/dialog.js'].lineData[300] = 0;
  _$jscoverage['/overlay/dialog.js'].lineData[301] = 0;
  _$jscoverage['/overlay/dialog.js'].lineData[304] = 0;
  _$jscoverage['/overlay/dialog.js'].lineData[305] = 0;
  _$jscoverage['/overlay/dialog.js'].lineData[310] = 0;
  _$jscoverage['/overlay/dialog.js'].lineData[313] = 0;
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
  _$jscoverage['/overlay/dialog.js'].branchData['49'] = [];
  _$jscoverage['/overlay/dialog.js'].branchData['49'][1] = new BranchData();
  _$jscoverage['/overlay/dialog.js'].branchData['50'] = [];
  _$jscoverage['/overlay/dialog.js'].branchData['50'][1] = new BranchData();
  _$jscoverage['/overlay/dialog.js'].branchData['51'] = [];
  _$jscoverage['/overlay/dialog.js'].branchData['51'][1] = new BranchData();
  _$jscoverage['/overlay/dialog.js'].branchData['51'][2] = new BranchData();
  _$jscoverage['/overlay/dialog.js'].branchData['51'][3] = new BranchData();
  _$jscoverage['/overlay/dialog.js'].branchData['65'] = [];
  _$jscoverage['/overlay/dialog.js'].branchData['65'][1] = new BranchData();
  _$jscoverage['/overlay/dialog.js'].branchData['76'] = [];
  _$jscoverage['/overlay/dialog.js'].branchData['76'][1] = new BranchData();
  _$jscoverage['/overlay/dialog.js'].branchData['278'] = [];
  _$jscoverage['/overlay/dialog.js'].branchData['278'][1] = new BranchData();
  _$jscoverage['/overlay/dialog.js'].branchData['295'] = [];
  _$jscoverage['/overlay/dialog.js'].branchData['295'][1] = new BranchData();
  _$jscoverage['/overlay/dialog.js'].branchData['298'] = [];
  _$jscoverage['/overlay/dialog.js'].branchData['298'][1] = new BranchData();
  _$jscoverage['/overlay/dialog.js'].branchData['304'] = [];
  _$jscoverage['/overlay/dialog.js'].branchData['304'][1] = new BranchData();
}
_$jscoverage['/overlay/dialog.js'].branchData['304'][1].init(67, 38, 'node.equals($el) || $el.contains(node)');
function visit17_304_1(result) {
  _$jscoverage['/overlay/dialog.js'].branchData['304'][1].ranCondition(result);
  return result;
}_$jscoverage['/overlay/dialog.js'].branchData['298'][1].init(945, 41, 'node.equals(lastFocusItem) && !e.shiftKey');
function visit16_298_1(result) {
  _$jscoverage['/overlay/dialog.js'].branchData['298'][1].ranCondition(result);
  return result;
}_$jscoverage['/overlay/dialog.js'].branchData['295'][1].init(761, 30, 'node.equals($el) && e.shiftKey');
function visit15_295_1(result) {
  _$jscoverage['/overlay/dialog.js'].branchData['295'][1].ranCondition(result);
  return result;
}_$jscoverage['/overlay/dialog.js'].branchData['278'][1].init(76, 19, 'keyCode !== KEY_TAB');
function visit14_278_1(result) {
  _$jscoverage['/overlay/dialog.js'].branchData['278'][1].ranCondition(result);
  return result;
}_$jscoverage['/overlay/dialog.js'].branchData['76'][1].init(26, 17, 'self.__lastActive');
function visit13_76_1(result) {
  _$jscoverage['/overlay/dialog.js'].branchData['76'][1].ranCondition(result);
  return result;
}_$jscoverage['/overlay/dialog.js'].branchData['65'][1].init(114, 1, 'v');
function visit12_65_1(result) {
  _$jscoverage['/overlay/dialog.js'].branchData['65'][1].ranCondition(result);
  return result;
}_$jscoverage['/overlay/dialog.js'].branchData['51'][3].init(24, 44, 'e.target.nodeName.toLowerCase() === \'select\'');
function visit11_51_3(result) {
  _$jscoverage['/overlay/dialog.js'].branchData['51'][3].ranCondition(result);
  return result;
}_$jscoverage['/overlay/dialog.js'].branchData['51'][2].init(24, 66, 'e.target.nodeName.toLowerCase() === \'select\' && !e.target.disabled');
function visit10_51_2(result) {
  _$jscoverage['/overlay/dialog.js'].branchData['51'][2].ranCondition(result);
  return result;
}_$jscoverage['/overlay/dialog.js'].branchData['51'][1].init(22, 69, '!(e.target.nodeName.toLowerCase() === \'select\' && !e.target.disabled)');
function visit9_51_1(result) {
  _$jscoverage['/overlay/dialog.js'].branchData['51'][1].ranCondition(result);
  return result;
}_$jscoverage['/overlay/dialog.js'].branchData['50'][1].init(45, 30, 'e.keyCode === Node.KeyCode.ESC');
function visit8_50_1(result) {
  _$jscoverage['/overlay/dialog.js'].branchData['50'][1].ranCondition(result);
  return result;
}_$jscoverage['/overlay/dialog.js'].branchData['49'][1].init(18, 76, 'this.get(\'escapeToClose\') && e.keyCode === Node.KeyCode.ESC');
function visit7_49_1(result) {
  _$jscoverage['/overlay/dialog.js'].branchData['49'][1].ranCondition(result);
  return result;
}_$jscoverage['/overlay/dialog.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/overlay/dialog.js'].functionData[0]++;
  _$jscoverage['/overlay/dialog.js'].lineData[7]++;
  var Overlay = require('./control');
  _$jscoverage['/overlay/dialog.js'].lineData[8]++;
  var Node = require('node');
  _$jscoverage['/overlay/dialog.js'].lineData[9]++;
  var DialogTpl = require('./dialog-xtpl');
  _$jscoverage['/overlay/dialog.js'].lineData[11]++;
  function _setStdModRenderContent(self, part, v) {
    _$jscoverage['/overlay/dialog.js'].functionData[1]++;
    _$jscoverage['/overlay/dialog.js'].lineData[12]++;
    part = self.get(part);
    _$jscoverage['/overlay/dialog.js'].lineData[13]++;
    part.html(v);
  }
  _$jscoverage['/overlay/dialog.js'].lineData[21]++;
  var Dialog = Overlay.extend({
  beforeCreateDom: function(renderData) {
  _$jscoverage['/overlay/dialog.js'].functionData[2]++;
  _$jscoverage['/overlay/dialog.js'].lineData[23]++;
  S.mix(renderData.elAttrs, {
  role: 'dialog', 
  'aria-labelledby': 'ks-stdmod-header-' + this.get('id')});
}, 
  getChildrenContainerEl: function() {
  _$jscoverage['/overlay/dialog.js'].functionData[3]++;
  _$jscoverage['/overlay/dialog.js'].lineData[30]++;
  return this.get('body');
}, 
  __afterCreateEffectGhost: function(ghost) {
  _$jscoverage['/overlay/dialog.js'].functionData[4]++;
  _$jscoverage['/overlay/dialog.js'].lineData[35]++;
  var self = this, elBody = self.get('body');
  _$jscoverage['/overlay/dialog.js'].lineData[43]++;
  ghost.all('.' + self.get('prefixCls') + 'stdmod-body').css({
  height: elBody.height(), 
  width: elBody.width()}).html('');
  _$jscoverage['/overlay/dialog.js'].lineData[45]++;
  return ghost;
}, 
  handleKeyDownInternal: function(e) {
  _$jscoverage['/overlay/dialog.js'].functionData[5]++;
  _$jscoverage['/overlay/dialog.js'].lineData[49]++;
  if (visit7_49_1(this.get('escapeToClose') && visit8_50_1(e.keyCode === Node.KeyCode.ESC))) {
    _$jscoverage['/overlay/dialog.js'].lineData[51]++;
    if (visit9_51_1(!(visit10_51_2(visit11_51_3(e.target.nodeName.toLowerCase() === 'select') && !e.target.disabled)))) {
      _$jscoverage['/overlay/dialog.js'].lineData[53]++;
      this.close();
      _$jscoverage['/overlay/dialog.js'].lineData[54]++;
      e.halt();
    }
    _$jscoverage['/overlay/dialog.js'].lineData[56]++;
    return;
  }
  _$jscoverage['/overlay/dialog.js'].lineData[58]++;
  trapFocus.call(this, e);
}, 
  _onSetVisible: function(v, e) {
  _$jscoverage['/overlay/dialog.js'].functionData[6]++;
  _$jscoverage['/overlay/dialog.js'].lineData[62]++;
  var self = this, el = self.el;
  _$jscoverage['/overlay/dialog.js'].lineData[64]++;
  self.callSuper(v, e);
  _$jscoverage['/overlay/dialog.js'].lineData[65]++;
  if (visit12_65_1(v)) {
    _$jscoverage['/overlay/dialog.js'].lineData[66]++;
    self.__lastActive = el.ownerDocument.activeElement;
    _$jscoverage['/overlay/dialog.js'].lineData[67]++;
    self.focus();
    _$jscoverage['/overlay/dialog.js'].lineData[72]++;
    el.setAttribute('aria-hidden', 'false');
  } else {
    _$jscoverage['/overlay/dialog.js'].lineData[74]++;
    el.setAttribute('aria-hidden', 'true');
    _$jscoverage['/overlay/dialog.js'].lineData[75]++;
    try {
      _$jscoverage['/overlay/dialog.js'].lineData[76]++;
      if (visit13_76_1(self.__lastActive)) {
        _$jscoverage['/overlay/dialog.js'].lineData[77]++;
        self.__lastActive.focus();
      }
    }    catch (ee) {
}
  }
}, 
  _onSetBodyContent: function(v) {
  _$jscoverage['/overlay/dialog.js'].functionData[7]++;
  _$jscoverage['/overlay/dialog.js'].lineData[86]++;
  _setStdModRenderContent(this, 'body', v);
}, 
  _onSetHeaderContent: function(v) {
  _$jscoverage['/overlay/dialog.js'].functionData[8]++;
  _$jscoverage['/overlay/dialog.js'].lineData[90]++;
  _setStdModRenderContent(this, 'header', v);
}, 
  _onSetFooterContent: function(v) {
  _$jscoverage['/overlay/dialog.js'].functionData[9]++;
  _$jscoverage['/overlay/dialog.js'].lineData[94]++;
  _setStdModRenderContent(this, 'footer', v);
}}, {
  ATTRS: {
  contentTpl: {
  value: DialogTpl}, 
  header: {
  selector: function() {
  _$jscoverage['/overlay/dialog.js'].functionData[10]++;
  _$jscoverage['/overlay/dialog.js'].lineData[113]++;
  return '.' + this.getBaseCssClass('header');
}}, 
  body: {
  selector: function() {
  _$jscoverage['/overlay/dialog.js'].functionData[11]++;
  _$jscoverage['/overlay/dialog.js'].lineData[127]++;
  return '.' + this.getBaseCssClass('body');
}}, 
  footer: {
  selector: function() {
  _$jscoverage['/overlay/dialog.js'].functionData[12]++;
  _$jscoverage['/overlay/dialog.js'].lineData[141]++;
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
  _$jscoverage['/overlay/dialog.js'].lineData[189]++;
  return this.get('header').html();
}}, 
  bodyContent: {
  value: '', 
  sync: 0, 
  render: 1, 
  parse: function() {
  _$jscoverage['/overlay/dialog.js'].functionData[14]++;
  _$jscoverage['/overlay/dialog.js'].lineData[204]++;
  return this.get('body').html();
}}, 
  footerContent: {
  value: '', 
  sync: 0, 
  render: 1, 
  parse: function() {
  _$jscoverage['/overlay/dialog.js'].functionData[15]++;
  _$jscoverage['/overlay/dialog.js'].lineData[219]++;
  return this.get('footer').html();
}}, 
  closable: {
  value: true}, 
  focusable: {
  value: true}, 
  escapeToClose: {
  value: true}}, 
  xclass: 'dialog'});
  _$jscoverage['/overlay/dialog.js'].lineData[271]++;
  var KEY_TAB = Node.KeyCode.TAB;
  _$jscoverage['/overlay/dialog.js'].lineData[274]++;
  function trapFocus(e) {
    _$jscoverage['/overlay/dialog.js'].functionData[16]++;
    _$jscoverage['/overlay/dialog.js'].lineData[275]++;
    var self = this, keyCode = e.keyCode;
    _$jscoverage['/overlay/dialog.js'].lineData[278]++;
    if (visit14_278_1(keyCode !== KEY_TAB)) {
      _$jscoverage['/overlay/dialog.js'].lineData[279]++;
      return;
    }
    _$jscoverage['/overlay/dialog.js'].lineData[281]++;
    var $el = self.$el;
    _$jscoverage['/overlay/dialog.js'].lineData[285]++;
    var node = Node.all(e.target);
    _$jscoverage['/overlay/dialog.js'].lineData[290]++;
    var lastFocusItem = $el.last();
    _$jscoverage['/overlay/dialog.js'].lineData[295]++;
    if (visit15_295_1(node.equals($el) && e.shiftKey)) {
      _$jscoverage['/overlay/dialog.js'].lineData[296]++;
      lastFocusItem[0].focus();
      _$jscoverage['/overlay/dialog.js'].lineData[297]++;
      e.halt();
    } else {
      _$jscoverage['/overlay/dialog.js'].lineData[298]++;
      if (visit16_298_1(node.equals(lastFocusItem) && !e.shiftKey)) {
        _$jscoverage['/overlay/dialog.js'].lineData[300]++;
        self.focus();
        _$jscoverage['/overlay/dialog.js'].lineData[301]++;
        e.halt();
      } else {
        _$jscoverage['/overlay/dialog.js'].lineData[304]++;
        if (visit17_304_1(node.equals($el) || $el.contains(node))) {
          _$jscoverage['/overlay/dialog.js'].lineData[305]++;
          return;
        }
      }
    }
    _$jscoverage['/overlay/dialog.js'].lineData[310]++;
    e.halt();
  }
  _$jscoverage['/overlay/dialog.js'].lineData[313]++;
  return Dialog;
});
