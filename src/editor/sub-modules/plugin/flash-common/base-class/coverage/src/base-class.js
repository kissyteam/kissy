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
if (! _$jscoverage['/base-class.js']) {
  _$jscoverage['/base-class.js'] = {};
  _$jscoverage['/base-class.js'].lineData = [];
  _$jscoverage['/base-class.js'].lineData[5] = 0;
  _$jscoverage['/base-class.js'].lineData[7] = 0;
  _$jscoverage['/base-class.js'].lineData[9] = 0;
  _$jscoverage['/base-class.js'].lineData[20] = 0;
  _$jscoverage['/base-class.js'].lineData[22] = 0;
  _$jscoverage['/base-class.js'].lineData[31] = 0;
  _$jscoverage['/base-class.js'].lineData[32] = 0;
  _$jscoverage['/base-class.js'].lineData[37] = 0;
  _$jscoverage['/base-class.js'].lineData[42] = 0;
  _$jscoverage['/base-class.js'].lineData[43] = 0;
  _$jscoverage['/base-class.js'].lineData[44] = 0;
  _$jscoverage['/base-class.js'].lineData[50] = 0;
  _$jscoverage['/base-class.js'].lineData[51] = 0;
  _$jscoverage['/base-class.js'].lineData[56] = 0;
  _$jscoverage['/base-class.js'].lineData[58] = 0;
  _$jscoverage['/base-class.js'].lineData[62] = 0;
  _$jscoverage['/base-class.js'].lineData[67] = 0;
  _$jscoverage['/base-class.js'].lineData[69] = 0;
  _$jscoverage['/base-class.js'].lineData[71] = 0;
  _$jscoverage['/base-class.js'].lineData[72] = 0;
  _$jscoverage['/base-class.js'].lineData[75] = 0;
  _$jscoverage['/base-class.js'].lineData[77] = 0;
  _$jscoverage['/base-class.js'].lineData[78] = 0;
  _$jscoverage['/base-class.js'].lineData[80] = 0;
  _$jscoverage['/base-class.js'].lineData[81] = 0;
  _$jscoverage['/base-class.js'].lineData[82] = 0;
  _$jscoverage['/base-class.js'].lineData[85] = 0;
  _$jscoverage['/base-class.js'].lineData[86] = 0;
  _$jscoverage['/base-class.js'].lineData[87] = 0;
  _$jscoverage['/base-class.js'].lineData[88] = 0;
  _$jscoverage['/base-class.js'].lineData[94] = 0;
  _$jscoverage['/base-class.js'].lineData[95] = 0;
  _$jscoverage['/base-class.js'].lineData[96] = 0;
  _$jscoverage['/base-class.js'].lineData[97] = 0;
  _$jscoverage['/base-class.js'].lineData[105] = 0;
  _$jscoverage['/base-class.js'].lineData[107] = 0;
  _$jscoverage['/base-class.js'].lineData[117] = 0;
  _$jscoverage['/base-class.js'].lineData[126] = 0;
  _$jscoverage['/base-class.js'].lineData[129] = 0;
  _$jscoverage['/base-class.js'].lineData[130] = 0;
  _$jscoverage['/base-class.js'].lineData[132] = 0;
  _$jscoverage['/base-class.js'].lineData[133] = 0;
  _$jscoverage['/base-class.js'].lineData[138] = 0;
  _$jscoverage['/base-class.js'].lineData[140] = 0;
  _$jscoverage['/base-class.js'].lineData[141] = 0;
  _$jscoverage['/base-class.js'].lineData[142] = 0;
  _$jscoverage['/base-class.js'].lineData[147] = 0;
  _$jscoverage['/base-class.js'].lineData[149] = 0;
}
if (! _$jscoverage['/base-class.js'].functionData) {
  _$jscoverage['/base-class.js'].functionData = [];
  _$jscoverage['/base-class.js'].functionData[0] = 0;
  _$jscoverage['/base-class.js'].functionData[1] = 0;
  _$jscoverage['/base-class.js'].functionData[2] = 0;
  _$jscoverage['/base-class.js'].functionData[3] = 0;
  _$jscoverage['/base-class.js'].functionData[4] = 0;
  _$jscoverage['/base-class.js'].functionData[5] = 0;
  _$jscoverage['/base-class.js'].functionData[6] = 0;
  _$jscoverage['/base-class.js'].functionData[7] = 0;
  _$jscoverage['/base-class.js'].functionData[8] = 0;
  _$jscoverage['/base-class.js'].functionData[9] = 0;
  _$jscoverage['/base-class.js'].functionData[10] = 0;
  _$jscoverage['/base-class.js'].functionData[11] = 0;
  _$jscoverage['/base-class.js'].functionData[12] = 0;
  _$jscoverage['/base-class.js'].functionData[13] = 0;
}
if (! _$jscoverage['/base-class.js'].branchData) {
  _$jscoverage['/base-class.js'].branchData = {};
  _$jscoverage['/base-class.js'].branchData['43'] = [];
  _$jscoverage['/base-class.js'].branchData['43'][1] = new BranchData();
  _$jscoverage['/base-class.js'].branchData['51'] = [];
  _$jscoverage['/base-class.js'].branchData['51'][1] = new BranchData();
  _$jscoverage['/base-class.js'].branchData['77'] = [];
  _$jscoverage['/base-class.js'].branchData['77'][1] = new BranchData();
  _$jscoverage['/base-class.js'].branchData['79'] = [];
  _$jscoverage['/base-class.js'].branchData['79'][1] = new BranchData();
  _$jscoverage['/base-class.js'].branchData['80'] = [];
  _$jscoverage['/base-class.js'].branchData['80'][1] = new BranchData();
  _$jscoverage['/base-class.js'].branchData['96'] = [];
  _$jscoverage['/base-class.js'].branchData['96'][1] = new BranchData();
  _$jscoverage['/base-class.js'].branchData['129'] = [];
  _$jscoverage['/base-class.js'].branchData['129'][1] = new BranchData();
  _$jscoverage['/base-class.js'].branchData['140'] = [];
  _$jscoverage['/base-class.js'].branchData['140'][1] = new BranchData();
  _$jscoverage['/base-class.js'].branchData['140'][2] = new BranchData();
}
_$jscoverage['/base-class.js'].branchData['140'][2].init(90, 22, 't.nodeName() === "img"');
function visit9_140_2(result) {
  _$jscoverage['/base-class.js'].branchData['140'][2].ranCondition(result);
  return result;
}_$jscoverage['/base-class.js'].branchData['140'][1].init(90, 64, 't.nodeName() === "img" && t.hasClass(self.get("cls"), undefined)');
function visit8_140_1(result) {
  _$jscoverage['/base-class.js'].branchData['140'][1].ranCondition(result);
  return result;
}_$jscoverage['/base-class.js'].branchData['129'][1].init(157, 2, '!r');
function visit7_129_1(result) {
  _$jscoverage['/base-class.js'].branchData['129'][1].ranCondition(result);
  return result;
}_$jscoverage['/base-class.js'].branchData['96'][1].init(111, 1, 'a');
function visit6_96_1(result) {
  _$jscoverage['/base-class.js'].branchData['96'][1].ranCondition(result);
  return result;
}_$jscoverage['/base-class.js'].branchData['80'][1].init(179, 2, 'r0');
function visit5_80_1(result) {
  _$jscoverage['/base-class.js'].branchData['80'][1].ranCondition(result);
  return result;
}_$jscoverage['/base-class.js'].branchData['79'][1].init(88, 9, 'r && r[0]');
function visit4_79_1(result) {
  _$jscoverage['/base-class.js'].branchData['79'][1].ranCondition(result);
  return result;
}_$jscoverage['/base-class.js'].branchData['77'][1].init(95, 14, 'S.UA[\'webkit\']');
function visit3_77_1(result) {
  _$jscoverage['/base-class.js'].branchData['77'][1].ranCondition(result);
  return result;
}_$jscoverage['/base-class.js'].branchData['51'][1].init(25, 33, 'el.hasClass(cls, undefined) && el');
function visit2_51_1(result) {
  _$jscoverage['/base-class.js'].branchData['51'][1].ranCondition(result);
  return result;
}_$jscoverage['/base-class.js'].branchData['43'][1].init(94, 28, 'contextMenuHandlers[content]');
function visit1_43_1(result) {
  _$jscoverage['/base-class.js'].branchData['43'][1].ranCondition(result);
  return result;
}_$jscoverage['/base-class.js'].lineData[5]++;
KISSY.add("editor/plugin/flash-common/base-class", function(S, Editor, Base, ContextMenu, Bubble, DialogLoader, flashUtils) {
  _$jscoverage['/base-class.js'].functionData[0]++;
  _$jscoverage['/base-class.js'].lineData[7]++;
  var Node = S.Node;
  _$jscoverage['/base-class.js'].lineData[9]++;
  var tipHTML = ' <a ' + 'class="{prefixCls}editor-bubble-url" ' + 'target="_blank" ' + 'href="#">{label}</a>   |   ' + ' <span class="{prefixCls}editor-bubble-link {prefixCls}editor-bubble-change">\u7f16\u8f91</span>   |   ' + ' <span class="{prefixCls}editor-bubble-link {prefixCls}editor-bubble-remove">\u5220\u9664</span>';
  _$jscoverage['/base-class.js'].lineData[20]++;
  return Base.extend({
  initializer: function() {
  _$jscoverage['/base-class.js'].functionData[1]++;
  _$jscoverage['/base-class.js'].lineData[22]++;
  var self = this, cls = self.get("cls"), editor = self.get("editor"), prefixCls = editor.get('prefixCls'), children = [], bubbleId = self.get("bubbleId"), contextMenuId = self.get("contextMenuId"), contextMenuHandlers = self.get("contextMenuHandlers");
  _$jscoverage['/base-class.js'].lineData[31]++;
  S.each(contextMenuHandlers, function(h, content) {
  _$jscoverage['/base-class.js'].functionData[2]++;
  _$jscoverage['/base-class.js'].lineData[32]++;
  children.push({
  content: content});
});
  _$jscoverage['/base-class.js'].lineData[37]++;
  editor.addContextMenu(contextMenuId, "." + cls, {
  width: "120px", 
  children: children, 
  listeners: {
  click: function(e) {
  _$jscoverage['/base-class.js'].functionData[3]++;
  _$jscoverage['/base-class.js'].lineData[42]++;
  var content = e.target.get("content");
  _$jscoverage['/base-class.js'].lineData[43]++;
  if (visit1_43_1(contextMenuHandlers[content])) {
    _$jscoverage['/base-class.js'].lineData[44]++;
    contextMenuHandlers[content].call(this);
  }
}}});
  _$jscoverage['/base-class.js'].lineData[50]++;
  editor.addBubble(bubbleId, function(el) {
  _$jscoverage['/base-class.js'].functionData[4]++;
  _$jscoverage['/base-class.js'].lineData[51]++;
  return visit2_51_1(el.hasClass(cls, undefined) && el);
}, {
  listeners: {
  afterRenderUI: function() {
  _$jscoverage['/base-class.js'].functionData[5]++;
  _$jscoverage['/base-class.js'].lineData[56]++;
  var bubble = this, el = bubble.get("contentEl");
  _$jscoverage['/base-class.js'].lineData[58]++;
  el.html(S.substitute(tipHTML, {
  label: self.get("label"), 
  prefixCls: prefixCls}));
  _$jscoverage['/base-class.js'].lineData[62]++;
  var tipUrlEl = el.one("." + prefixCls + "editor-bubble-url"), tipChangeEl = el.one("." + prefixCls + "editor-bubble-change"), tipRemoveEl = el.one("." + prefixCls + "editor-bubble-remove");
  _$jscoverage['/base-class.js'].lineData[67]++;
  Editor.Utils.preventFocus(el);
  _$jscoverage['/base-class.js'].lineData[69]++;
  tipChangeEl.on("click", function(ev) {
  _$jscoverage['/base-class.js'].functionData[6]++;
  _$jscoverage['/base-class.js'].lineData[71]++;
  self.show(bubble.get("editorSelectedEl"));
  _$jscoverage['/base-class.js'].lineData[72]++;
  ev.halt();
});
  _$jscoverage['/base-class.js'].lineData[75]++;
  tipRemoveEl.on("click", function(ev) {
  _$jscoverage['/base-class.js'].functionData[7]++;
  _$jscoverage['/base-class.js'].lineData[77]++;
  if (visit3_77_1(S.UA['webkit'])) {
    _$jscoverage['/base-class.js'].lineData[78]++;
    var r = editor.getSelection().getRanges(), r0 = visit4_79_1(r && r[0]);
    _$jscoverage['/base-class.js'].lineData[80]++;
    if (visit5_80_1(r0)) {
      _$jscoverage['/base-class.js'].lineData[81]++;
      r0.collapse(true);
      _$jscoverage['/base-class.js'].lineData[82]++;
      r0.select();
    }
  }
  _$jscoverage['/base-class.js'].lineData[85]++;
  bubble.get("editorSelectedEl").remove();
  _$jscoverage['/base-class.js'].lineData[86]++;
  bubble.hide();
  _$jscoverage['/base-class.js'].lineData[87]++;
  editor.notifySelectionChange();
  _$jscoverage['/base-class.js'].lineData[88]++;
  ev.halt();
});
  _$jscoverage['/base-class.js'].lineData[94]++;
  bubble.on("show", function() {
  _$jscoverage['/base-class.js'].functionData[8]++;
  _$jscoverage['/base-class.js'].lineData[95]++;
  var a = bubble.get("editorSelectedEl");
  _$jscoverage['/base-class.js'].lineData[96]++;
  if (visit6_96_1(a)) {
    _$jscoverage['/base-class.js'].lineData[97]++;
    self._updateTip(tipUrlEl, a);
  }
});
}}});
  _$jscoverage['/base-class.js'].lineData[105]++;
  editor.docReady(function() {
  _$jscoverage['/base-class.js'].functionData[9]++;
  _$jscoverage['/base-class.js'].lineData[107]++;
  editor.get("document").on("dblclick", self._dbClick, self);
});
}, 
  _getFlashUrl: function(r) {
  _$jscoverage['/base-class.js'].functionData[10]++;
  _$jscoverage['/base-class.js'].lineData[117]++;
  return flashUtils.getUrl(r);
}, 
  _updateTip: function(tipUrlElEl, selectedFlash) {
  _$jscoverage['/base-class.js'].functionData[11]++;
  _$jscoverage['/base-class.js'].lineData[126]++;
  var self = this, editor = self.get("editor"), r = editor.restoreRealElement(selectedFlash);
  _$jscoverage['/base-class.js'].lineData[129]++;
  if (visit7_129_1(!r)) {
    _$jscoverage['/base-class.js'].lineData[130]++;
    return;
  }
  _$jscoverage['/base-class.js'].lineData[132]++;
  var url = self._getFlashUrl(r);
  _$jscoverage['/base-class.js'].lineData[133]++;
  tipUrlElEl.attr("href", url);
}, 
  _dbClick: function(ev) {
  _$jscoverage['/base-class.js'].functionData[12]++;
  _$jscoverage['/base-class.js'].lineData[138]++;
  var self = this, t = new Node(ev.target);
  _$jscoverage['/base-class.js'].lineData[140]++;
  if (visit8_140_1(visit9_140_2(t.nodeName() === "img") && t.hasClass(self.get("cls"), undefined))) {
    _$jscoverage['/base-class.js'].lineData[141]++;
    self.show(t);
    _$jscoverage['/base-class.js'].lineData[142]++;
    ev.halt();
  }
}, 
  show: function(selectedEl) {
  _$jscoverage['/base-class.js'].functionData[13]++;
  _$jscoverage['/base-class.js'].lineData[147]++;
  var self = this, editor = self.get("editor");
  _$jscoverage['/base-class.js'].lineData[149]++;
  DialogLoader.useDialog(editor, self.get("type"), self.get("pluginConfig"), selectedEl);
}}, {
  ATTRS: {
  cls: {}, 
  type: {}, 
  label: {
  value: "\u5728\u65b0\u7a97\u53e3\u67e5\u770b"}, 
  bubbleId: {}, 
  contextMenuId: {}, 
  contextMenuHandlers: {}}});
}, {
  requires: ['editor', 'base', '../contextmenu', '../bubble', '../dialog-loader', './utils']});
