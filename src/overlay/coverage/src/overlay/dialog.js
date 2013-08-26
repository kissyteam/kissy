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
  _$jscoverage['/overlay/dialog.js'].lineData[14] = 0;
  _$jscoverage['/overlay/dialog.js'].lineData[17] = 0;
  _$jscoverage['/overlay/dialog.js'].lineData[26] = 0;
  _$jscoverage['/overlay/dialog.js'].lineData[28] = 0;
  _$jscoverage['/overlay/dialog.js'].lineData[32] = 0;
  _$jscoverage['/overlay/dialog.js'].lineData[34] = 0;
  _$jscoverage['/overlay/dialog.js'].lineData[38] = 0;
  _$jscoverage['/overlay/dialog.js'].lineData[39] = 0;
  _$jscoverage['/overlay/dialog.js'].lineData[41] = 0;
  _$jscoverage['/overlay/dialog.js'].lineData[43] = 0;
  _$jscoverage['/overlay/dialog.js'].lineData[47] = 0;
  _$jscoverage['/overlay/dialog.js'].lineData[49] = 0;
  _$jscoverage['/overlay/dialog.js'].lineData[50] = 0;
  _$jscoverage['/overlay/dialog.js'].lineData[51] = 0;
  _$jscoverage['/overlay/dialog.js'].lineData[56] = 0;
  _$jscoverage['/overlay/dialog.js'].lineData[58] = 0;
  _$jscoverage['/overlay/dialog.js'].lineData[59] = 0;
  _$jscoverage['/overlay/dialog.js'].lineData[60] = 0;
  _$jscoverage['/overlay/dialog.js'].lineData[66] = 0;
  _$jscoverage['/overlay/dialog.js'].lineData[230] = 0;
  _$jscoverage['/overlay/dialog.js'].lineData[233] = 0;
  _$jscoverage['/overlay/dialog.js'].lineData[235] = 0;
  _$jscoverage['/overlay/dialog.js'].lineData[238] = 0;
  _$jscoverage['/overlay/dialog.js'].lineData[239] = 0;
  _$jscoverage['/overlay/dialog.js'].lineData[241] = 0;
  _$jscoverage['/overlay/dialog.js'].lineData[245] = 0;
  _$jscoverage['/overlay/dialog.js'].lineData[250] = 0;
  _$jscoverage['/overlay/dialog.js'].lineData[255] = 0;
  _$jscoverage['/overlay/dialog.js'].lineData[256] = 0;
  _$jscoverage['/overlay/dialog.js'].lineData[257] = 0;
  _$jscoverage['/overlay/dialog.js'].lineData[260] = 0;
  _$jscoverage['/overlay/dialog.js'].lineData[261] = 0;
  _$jscoverage['/overlay/dialog.js'].lineData[262] = 0;
  _$jscoverage['/overlay/dialog.js'].lineData[266] = 0;
  _$jscoverage['/overlay/dialog.js'].lineData[267] = 0;
  _$jscoverage['/overlay/dialog.js'].lineData[272] = 0;
  _$jscoverage['/overlay/dialog.js'].lineData[274] = 0;
}
if (! _$jscoverage['/overlay/dialog.js'].functionData) {
  _$jscoverage['/overlay/dialog.js'].functionData = [];
  _$jscoverage['/overlay/dialog.js'].functionData[0] = 0;
  _$jscoverage['/overlay/dialog.js'].functionData[1] = 0;
  _$jscoverage['/overlay/dialog.js'].functionData[2] = 0;
  _$jscoverage['/overlay/dialog.js'].functionData[3] = 0;
  _$jscoverage['/overlay/dialog.js'].functionData[4] = 0;
}
if (! _$jscoverage['/overlay/dialog.js'].branchData) {
  _$jscoverage['/overlay/dialog.js'].branchData = {};
  _$jscoverage['/overlay/dialog.js'].branchData['32'] = [];
  _$jscoverage['/overlay/dialog.js'].branchData['32'][1] = new BranchData();
  _$jscoverage['/overlay/dialog.js'].branchData['33'] = [];
  _$jscoverage['/overlay/dialog.js'].branchData['33'][1] = new BranchData();
  _$jscoverage['/overlay/dialog.js'].branchData['34'] = [];
  _$jscoverage['/overlay/dialog.js'].branchData['34'][1] = new BranchData();
  _$jscoverage['/overlay/dialog.js'].branchData['34'][2] = new BranchData();
  _$jscoverage['/overlay/dialog.js'].branchData['49'] = [];
  _$jscoverage['/overlay/dialog.js'].branchData['49'][1] = new BranchData();
  _$jscoverage['/overlay/dialog.js'].branchData['60'] = [];
  _$jscoverage['/overlay/dialog.js'].branchData['60'][1] = new BranchData();
  _$jscoverage['/overlay/dialog.js'].branchData['238'] = [];
  _$jscoverage['/overlay/dialog.js'].branchData['238'][1] = new BranchData();
  _$jscoverage['/overlay/dialog.js'].branchData['255'] = [];
  _$jscoverage['/overlay/dialog.js'].branchData['255'][1] = new BranchData();
  _$jscoverage['/overlay/dialog.js'].branchData['260'] = [];
  _$jscoverage['/overlay/dialog.js'].branchData['260'][1] = new BranchData();
  _$jscoverage['/overlay/dialog.js'].branchData['266'] = [];
  _$jscoverage['/overlay/dialog.js'].branchData['266'][1] = new BranchData();
}
_$jscoverage['/overlay/dialog.js'].branchData['266'][1].init(67, 38, 'node.equals($el) || $el.contains(node)');
function visit13_266_1(result) {
  _$jscoverage['/overlay/dialog.js'].branchData['266'][1].ranCondition(result);
  return result;
}_$jscoverage['/overlay/dialog.js'].branchData['260'][1].init(1017, 41, 'node.equals(lastFocusItem) && !e.shiftKey');
function visit12_260_1(result) {
  _$jscoverage['/overlay/dialog.js'].branchData['260'][1].ranCondition(result);
  return result;
}_$jscoverage['/overlay/dialog.js'].branchData['255'][1].init(762, 29, 'node.equals(el) && e.shiftKey');
function visit11_255_1(result) {
  _$jscoverage['/overlay/dialog.js'].branchData['255'][1].ranCondition(result);
  return result;
}_$jscoverage['/overlay/dialog.js'].branchData['238'][1].init(78, 18, 'keyCode != KEY_TAB');
function visit10_238_1(result) {
  _$jscoverage['/overlay/dialog.js'].branchData['238'][1].ranCondition(result);
  return result;
}_$jscoverage['/overlay/dialog.js'].branchData['60'][1].init(26, 46, 'self.__lastActive && self.__lastActive.focus()');
function visit9_60_1(result) {
  _$jscoverage['/overlay/dialog.js'].branchData['60'][1].ranCondition(result);
  return result;
}_$jscoverage['/overlay/dialog.js'].branchData['49'][1].init(91, 1, 'v');
function visit8_49_1(result) {
  _$jscoverage['/overlay/dialog.js'].branchData['49'][1].ranCondition(result);
  return result;
}_$jscoverage['/overlay/dialog.js'].branchData['34'][2].init(26, 43, 'e.target.nodeName.toLowerCase() == \'select\'');
function visit7_34_2(result) {
  _$jscoverage['/overlay/dialog.js'].branchData['34'][2].ranCondition(result);
  return result;
}_$jscoverage['/overlay/dialog.js'].branchData['34'][1].init(26, 90, 'e.target.nodeName.toLowerCase() == \'select\' && !e.target.disabled');
function visit6_34_1(result) {
  _$jscoverage['/overlay/dialog.js'].branchData['34'][1].ranCondition(result);
  return result;
}_$jscoverage['/overlay/dialog.js'].branchData['33'][1].init(49, 30, 'e.keyCode === Node.KeyCode.ESC');
function visit5_33_1(result) {
  _$jscoverage['/overlay/dialog.js'].branchData['33'][1].ranCondition(result);
  return result;
}_$jscoverage['/overlay/dialog.js'].branchData['32'][1].init(22, 80, 'this.get(\'escapeToClose\') && e.keyCode === Node.KeyCode.ESC');
function visit4_32_1(result) {
  _$jscoverage['/overlay/dialog.js'].branchData['32'][1].ranCondition(result);
  return result;
}_$jscoverage['/overlay/dialog.js'].lineData[6]++;
KISSY.add('overlay/dialog', function(S, Overlay, DialogRender, Node) {
  _$jscoverage['/overlay/dialog.js'].functionData[0]++;
  _$jscoverage['/overlay/dialog.js'].lineData[14]++;
  var Dialog = Overlay.extend({
  __afterCreateEffectGhost: function(ghost) {
  _$jscoverage['/overlay/dialog.js'].functionData[1]++;
  _$jscoverage['/overlay/dialog.js'].lineData[17]++;
  var self = this, body, elBody = self.get("body");
  _$jscoverage['/overlay/dialog.js'].lineData[26]++;
  ghost.all('.' + self.get('prefixCls') + 'stdmod-body').css({
  height: elBody.height(), 
  width: elBody.width()}).html('');
  _$jscoverage['/overlay/dialog.js'].lineData[28]++;
  return ghost;
}, 
  handleKeyDownInternal: function(e) {
  _$jscoverage['/overlay/dialog.js'].functionData[2]++;
  _$jscoverage['/overlay/dialog.js'].lineData[32]++;
  if (visit4_32_1(this.get('escapeToClose') && visit5_33_1(e.keyCode === Node.KeyCode.ESC))) {
    _$jscoverage['/overlay/dialog.js'].lineData[34]++;
    if (visit6_34_1(visit7_34_2(e.target.nodeName.toLowerCase() == 'select') && !e.target.disabled)) {
    } else {
      _$jscoverage['/overlay/dialog.js'].lineData[38]++;
      this.close();
      _$jscoverage['/overlay/dialog.js'].lineData[39]++;
      e.halt();
    }
    _$jscoverage['/overlay/dialog.js'].lineData[41]++;
    return;
  }
  _$jscoverage['/overlay/dialog.js'].lineData[43]++;
  trapFocus.call(this, e);
}, 
  _onSetVisible: function(v, e) {
  _$jscoverage['/overlay/dialog.js'].functionData[3]++;
  _$jscoverage['/overlay/dialog.js'].lineData[47]++;
  var self = this, el = self.el;
  _$jscoverage['/overlay/dialog.js'].lineData[49]++;
  if (visit8_49_1(v)) {
    _$jscoverage['/overlay/dialog.js'].lineData[50]++;
    self.__lastActive = el.ownerDocument.activeElement;
    _$jscoverage['/overlay/dialog.js'].lineData[51]++;
    self.focus();
    _$jscoverage['/overlay/dialog.js'].lineData[56]++;
    el.setAttribute("aria-hidden", "false");
  } else {
    _$jscoverage['/overlay/dialog.js'].lineData[58]++;
    el.setAttribute("aria-hidden", "true");
    _$jscoverage['/overlay/dialog.js'].lineData[59]++;
    try {
      _$jscoverage['/overlay/dialog.js'].lineData[60]++;
      visit9_60_1(self.__lastActive && self.__lastActive.focus());
    }    catch (e) {
}
  }
  _$jscoverage['/overlay/dialog.js'].lineData[66]++;
  self.callSuper(v, e);
}}, {
  ATTRS: {
  header: {
  view: 1}, 
  body: {
  view: 1}, 
  footer: {
  view: 1}, 
  bodyStyle: {
  value: {}, 
  view: 1}, 
  footerStyle: {
  value: {}, 
  view: 1}, 
  headerStyle: {
  value: {}, 
  view: 1}, 
  headerContent: {
  value: '', 
  view: 1}, 
  bodyContent: {
  value: '', 
  view: 1}, 
  footerContent: {
  value: '', 
  view: 1}, 
  closable: {
  value: true}, 
  xrender: {
  value: DialogRender}, 
  focusable: {
  value: true}, 
  escapeToClose: {
  value: true}}, 
  xclass: 'dialog'});
  _$jscoverage['/overlay/dialog.js'].lineData[230]++;
  var KEY_TAB = Node.KeyCode.TAB;
  _$jscoverage['/overlay/dialog.js'].lineData[233]++;
  function trapFocus(e) {
    _$jscoverage['/overlay/dialog.js'].functionData[4]++;
    _$jscoverage['/overlay/dialog.js'].lineData[235]++;
    var self = this, keyCode = e.keyCode;
    _$jscoverage['/overlay/dialog.js'].lineData[238]++;
    if (visit10_238_1(keyCode != KEY_TAB)) {
      _$jscoverage['/overlay/dialog.js'].lineData[239]++;
      return;
    }
    _$jscoverage['/overlay/dialog.js'].lineData[241]++;
    var $el = self.$el;
    _$jscoverage['/overlay/dialog.js'].lineData[245]++;
    var node = Node.all(e.target);
    _$jscoverage['/overlay/dialog.js'].lineData[250]++;
    var lastFocusItem = $el.last();
    _$jscoverage['/overlay/dialog.js'].lineData[255]++;
    if (visit11_255_1(node.equals(el) && e.shiftKey)) {
      _$jscoverage['/overlay/dialog.js'].lineData[256]++;
      lastFocusItem[0].focus();
      _$jscoverage['/overlay/dialog.js'].lineData[257]++;
      e.halt();
    } else {
      _$jscoverage['/overlay/dialog.js'].lineData[260]++;
      if (visit12_260_1(node.equals(lastFocusItem) && !e.shiftKey)) {
        _$jscoverage['/overlay/dialog.js'].lineData[261]++;
        self.focus();
        _$jscoverage['/overlay/dialog.js'].lineData[262]++;
        e.halt();
      } else {
        _$jscoverage['/overlay/dialog.js'].lineData[266]++;
        if (visit13_266_1(node.equals($el) || $el.contains(node))) {
          _$jscoverage['/overlay/dialog.js'].lineData[267]++;
          return;
        }
      }
    }
    _$jscoverage['/overlay/dialog.js'].lineData[272]++;
    e.halt();
  }
  _$jscoverage['/overlay/dialog.js'].lineData[274]++;
  return Dialog;
}, {
  requires: ["./control", './dialog-render', 'node']});
