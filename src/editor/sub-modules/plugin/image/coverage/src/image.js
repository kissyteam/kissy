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
if (! _$jscoverage['/image.js']) {
  _$jscoverage['/image.js'] = {};
  _$jscoverage['/image.js'].lineData = [];
  _$jscoverage['/image.js'].lineData[5] = 0;
  _$jscoverage['/image.js'].lineData[6] = 0;
  _$jscoverage['/image.js'].lineData[11] = 0;
  _$jscoverage['/image.js'].lineData[12] = 0;
  _$jscoverage['/image.js'].lineData[15] = 0;
  _$jscoverage['/image.js'].lineData[26] = 0;
  _$jscoverage['/image.js'].lineData[27] = 0;
  _$jscoverage['/image.js'].lineData[30] = 0;
  _$jscoverage['/image.js'].lineData[33] = 0;
  _$jscoverage['/image.js'].lineData[35] = 0;
  _$jscoverage['/image.js'].lineData[37] = 0;
  _$jscoverage['/image.js'].lineData[38] = 0;
  _$jscoverage['/image.js'].lineData[44] = 0;
  _$jscoverage['/image.js'].lineData[48] = 0;
  _$jscoverage['/image.js'].lineData[55] = 0;
  _$jscoverage['/image.js'].lineData[59] = 0;
  _$jscoverage['/image.js'].lineData[60] = 0;
  _$jscoverage['/image.js'].lineData[62] = 0;
  _$jscoverage['/image.js'].lineData[63] = 0;
  _$jscoverage['/image.js'].lineData[70] = 0;
  _$jscoverage['/image.js'].lineData[71] = 0;
  _$jscoverage['/image.js'].lineData[73] = 0;
  _$jscoverage['/image.js'].lineData[74] = 0;
  _$jscoverage['/image.js'].lineData[76] = 0;
  _$jscoverage['/image.js'].lineData[77] = 0;
  _$jscoverage['/image.js'].lineData[78] = 0;
  _$jscoverage['/image.js'].lineData[79] = 0;
  _$jscoverage['/image.js'].lineData[80] = 0;
  _$jscoverage['/image.js'].lineData[81] = 0;
  _$jscoverage['/image.js'].lineData[86] = 0;
  _$jscoverage['/image.js'].lineData[88] = 0;
  _$jscoverage['/image.js'].lineData[89] = 0;
  _$jscoverage['/image.js'].lineData[94] = 0;
  _$jscoverage['/image.js'].lineData[99] = 0;
  _$jscoverage['/image.js'].lineData[100] = 0;
  _$jscoverage['/image.js'].lineData[101] = 0;
  _$jscoverage['/image.js'].lineData[102] = 0;
  _$jscoverage['/image.js'].lineData[110] = 0;
  _$jscoverage['/image.js'].lineData[111] = 0;
  _$jscoverage['/image.js'].lineData[112] = 0;
  _$jscoverage['/image.js'].lineData[113] = 0;
  _$jscoverage['/image.js'].lineData[114] = 0;
  _$jscoverage['/image.js'].lineData[115] = 0;
  _$jscoverage['/image.js'].lineData[120] = 0;
  _$jscoverage['/image.js'].lineData[123] = 0;
  _$jscoverage['/image.js'].lineData[125] = 0;
  _$jscoverage['/image.js'].lineData[128] = 0;
  _$jscoverage['/image.js'].lineData[131] = 0;
  _$jscoverage['/image.js'].lineData[132] = 0;
  _$jscoverage['/image.js'].lineData[133] = 0;
  _$jscoverage['/image.js'].lineData[134] = 0;
  _$jscoverage['/image.js'].lineData[136] = 0;
  _$jscoverage['/image.js'].lineData[137] = 0;
  _$jscoverage['/image.js'].lineData[138] = 0;
  _$jscoverage['/image.js'].lineData[139] = 0;
  _$jscoverage['/image.js'].lineData[140] = 0;
  _$jscoverage['/image.js'].lineData[141] = 0;
  _$jscoverage['/image.js'].lineData[144] = 0;
  _$jscoverage['/image.js'].lineData[145] = 0;
  _$jscoverage['/image.js'].lineData[146] = 0;
  _$jscoverage['/image.js'].lineData[147] = 0;
  _$jscoverage['/image.js'].lineData[149] = 0;
  _$jscoverage['/image.js'].lineData[150] = 0;
  _$jscoverage['/image.js'].lineData[151] = 0;
  _$jscoverage['/image.js'].lineData[152] = 0;
  _$jscoverage['/image.js'].lineData[153] = 0;
  _$jscoverage['/image.js'].lineData[162] = 0;
}
if (! _$jscoverage['/image.js'].functionData) {
  _$jscoverage['/image.js'].functionData = [];
  _$jscoverage['/image.js'].functionData[0] = 0;
  _$jscoverage['/image.js'].functionData[1] = 0;
  _$jscoverage['/image.js'].functionData[2] = 0;
  _$jscoverage['/image.js'].functionData[3] = 0;
  _$jscoverage['/image.js'].functionData[4] = 0;
  _$jscoverage['/image.js'].functionData[5] = 0;
  _$jscoverage['/image.js'].functionData[6] = 0;
  _$jscoverage['/image.js'].functionData[7] = 0;
  _$jscoverage['/image.js'].functionData[8] = 0;
  _$jscoverage['/image.js'].functionData[9] = 0;
  _$jscoverage['/image.js'].functionData[10] = 0;
  _$jscoverage['/image.js'].functionData[11] = 0;
  _$jscoverage['/image.js'].functionData[12] = 0;
  _$jscoverage['/image.js'].functionData[13] = 0;
  _$jscoverage['/image.js'].functionData[14] = 0;
  _$jscoverage['/image.js'].functionData[15] = 0;
  _$jscoverage['/image.js'].functionData[16] = 0;
}
if (! _$jscoverage['/image.js'].branchData) {
  _$jscoverage['/image.js'].branchData = {};
  _$jscoverage['/image.js'].branchData['12'] = [];
  _$jscoverage['/image.js'].branchData['12'][1] = new BranchData();
  _$jscoverage['/image.js'].branchData['12'][2] = new BranchData();
  _$jscoverage['/image.js'].branchData['27'] = [];
  _$jscoverage['/image.js'].branchData['27'][1] = new BranchData();
  _$jscoverage['/image.js'].branchData['60'] = [];
  _$jscoverage['/image.js'].branchData['60'][1] = new BranchData();
  _$jscoverage['/image.js'].branchData['73'] = [];
  _$jscoverage['/image.js'].branchData['73'][1] = new BranchData();
  _$jscoverage['/image.js'].branchData['101'] = [];
  _$jscoverage['/image.js'].branchData['101'][1] = new BranchData();
  _$jscoverage['/image.js'].branchData['114'] = [];
  _$jscoverage['/image.js'].branchData['114'][1] = new BranchData();
  _$jscoverage['/image.js'].branchData['137'] = [];
  _$jscoverage['/image.js'].branchData['137'][1] = new BranchData();
  _$jscoverage['/image.js'].branchData['139'] = [];
  _$jscoverage['/image.js'].branchData['139'][1] = new BranchData();
  _$jscoverage['/image.js'].branchData['151'] = [];
  _$jscoverage['/image.js'].branchData['151'][1] = new BranchData();
  _$jscoverage['/image.js'].branchData['152'] = [];
  _$jscoverage['/image.js'].branchData['152'][1] = new BranchData();
}
_$jscoverage['/image.js'].branchData['152'][1].init(44, 40, 'a.attr("_ke_saved_src") || a.attr("src")');
function visit11_152_1(result) {
  _$jscoverage['/image.js'].branchData['152'][1].ranCondition(result);
  return result;
}_$jscoverage['/image.js'].branchData['151'][1].init(103, 1, 'a');
function visit10_151_1(result) {
  _$jscoverage['/image.js'].branchData['151'][1].ranCondition(result);
  return result;
}_$jscoverage['/image.js'].branchData['139'][1].init(114, 9, 'r && r[0]');
function visit9_139_1(result) {
  _$jscoverage['/image.js'].branchData['139'][1].ranCondition(result);
  return result;
}_$jscoverage['/image.js'].branchData['137'][1].init(34, 12, 'UA[\'webkit\']');
function visit8_137_1(result) {
  _$jscoverage['/image.js'].branchData['137'][1].ranCondition(result);
  return result;
}_$jscoverage['/image.js'].branchData['114'][1].init(101, 11, 'checkImg(t)');
function visit7_114_1(result) {
  _$jscoverage['/image.js'].branchData['114'][1].ranCondition(result);
  return result;
}_$jscoverage['/image.js'].branchData['101'][1].init(34, 20, 'h.content == content');
function visit6_101_1(result) {
  _$jscoverage['/image.js'].branchData['101'][1].ranCondition(result);
  return result;
}_$jscoverage['/image.js'].branchData['73'][1].init(197, 9, '!UA[\'ie\']');
function visit5_73_1(result) {
  _$jscoverage['/image.js'].branchData['73'][1].ranCondition(result);
  return result;
}_$jscoverage['/image.js'].branchData['60'][1].init(105, 3, 'img');
function visit4_60_1(result) {
  _$jscoverage['/image.js'].branchData['60'][1].ranCondition(result);
  return result;
}_$jscoverage['/image.js'].branchData['27'][1].init(24, 12, 'config || {}');
function visit3_27_1(result) {
  _$jscoverage['/image.js'].branchData['27'][1].ranCondition(result);
  return result;
}_$jscoverage['/image.js'].branchData['12'][2].init(47, 25, 'node.nodeName() === \'img\'');
function visit2_12_2(result) {
  _$jscoverage['/image.js'].branchData['12'][2].ranCondition(result);
  return result;
}_$jscoverage['/image.js'].branchData['12'][1].init(47, 141, 'node.nodeName() === \'img\' && (!/(^|\\s+)ke_/.test(node[0].className))');
function visit1_12_1(result) {
  _$jscoverage['/image.js'].branchData['12'][1].ranCondition(result);
  return result;
}_$jscoverage['/image.js'].lineData[5]++;
KISSY.add("editor/plugin/image", function(S, Editor, Button, Bubble, ContextMenu, DialogLoader) {
  _$jscoverage['/image.js'].functionData[0]++;
  _$jscoverage['/image.js'].lineData[6]++;
  var UA = S.UA, Node = KISSY.NodeList, $ = S.all, Event = S.Event, checkImg = function(node) {
  _$jscoverage['/image.js'].functionData[1]++;
  _$jscoverage['/image.js'].lineData[11]++;
  node = $(node);
  _$jscoverage['/image.js'].lineData[12]++;
  if (visit1_12_1(visit2_12_2(node.nodeName() === 'img') && (!/(^|\s+)ke_/.test(node[0].className)))) {
    _$jscoverage['/image.js'].lineData[15]++;
    return node;
  }
}, tipHTML = '<a class="{prefixCls}editor-bubble-url" ' + 'target="_blank" href="#">\u5728\u65b0\u7a97\u53e3\u67e5\u770b</a>  |  ' + '<a class="{prefixCls}editor-bubble-link ' + '{prefixCls}editor-bubble-change" href="#">\u7f16\u8f91</a>  |  ' + '<a class="{prefixCls}editor-bubble-link ' + '{prefixCls}editor-bubble-remove" href="#">\u5220\u9664</a>';
  _$jscoverage['/image.js'].lineData[26]++;
  function ImagePlugin(config) {
    _$jscoverage['/image.js'].functionData[2]++;
    _$jscoverage['/image.js'].lineData[27]++;
    this.config = visit3_27_1(config || {});
  }
  _$jscoverage['/image.js'].lineData[30]++;
  S.augment(ImagePlugin, {
  pluginRenderUI: function(editor) {
  _$jscoverage['/image.js'].functionData[3]++;
  _$jscoverage['/image.js'].lineData[33]++;
  var self = this;
  _$jscoverage['/image.js'].lineData[35]++;
  var prefixCls = editor.get('prefixCls');
  _$jscoverage['/image.js'].lineData[37]++;
  function showImageEditor(selectedEl) {
    _$jscoverage['/image.js'].functionData[4]++;
    _$jscoverage['/image.js'].lineData[38]++;
    DialogLoader.useDialog(editor, "image", self.config, selectedEl);
  }
  _$jscoverage['/image.js'].lineData[44]++;
  editor.addButton("image", {
  tooltip: "\u63d2\u5165\u56fe\u7247", 
  listeners: {
  click: function() {
  _$jscoverage['/image.js'].functionData[5]++;
  _$jscoverage['/image.js'].lineData[48]++;
  showImageEditor(null);
}}, 
  mode: Editor.Mode.WYSIWYG_MODE});
  _$jscoverage['/image.js'].lineData[55]++;
  var handlers = [{
  content: "\u56fe\u7247\u5c5e\u6027", 
  fn: function() {
  _$jscoverage['/image.js'].functionData[6]++;
  _$jscoverage['/image.js'].lineData[59]++;
  var img = checkImg(this.get("editorSelectedEl"));
  _$jscoverage['/image.js'].lineData[60]++;
  if (visit4_60_1(img)) {
    _$jscoverage['/image.js'].lineData[62]++;
    this.hide();
    _$jscoverage['/image.js'].lineData[63]++;
    showImageEditor($(img));
  }
}}, {
  content: "\u63d2\u5165\u65b0\u884c", 
  fn: function() {
  _$jscoverage['/image.js'].functionData[7]++;
  _$jscoverage['/image.js'].lineData[70]++;
  this.hide();
  _$jscoverage['/image.js'].lineData[71]++;
  var doc = editor.get("document")[0], p = new Node(doc.createElement("p"));
  _$jscoverage['/image.js'].lineData[73]++;
  if (visit5_73_1(!UA['ie'])) {
    _$jscoverage['/image.js'].lineData[74]++;
    p._4e_appendBogus(undefined);
  }
  _$jscoverage['/image.js'].lineData[76]++;
  var r = new Editor.Range(doc);
  _$jscoverage['/image.js'].lineData[77]++;
  r.setStartAfter(this.get("editorSelectedEl"));
  _$jscoverage['/image.js'].lineData[78]++;
  r.select();
  _$jscoverage['/image.js'].lineData[79]++;
  editor.insertElement(p);
  _$jscoverage['/image.js'].lineData[80]++;
  r.moveToElementEditablePosition(p, 1);
  _$jscoverage['/image.js'].lineData[81]++;
  r.select();
}}];
  _$jscoverage['/image.js'].lineData[86]++;
  var children = [];
  _$jscoverage['/image.js'].lineData[88]++;
  S.each(handlers, function(h) {
  _$jscoverage['/image.js'].functionData[8]++;
  _$jscoverage['/image.js'].lineData[89]++;
  children.push({
  content: h.content});
});
  _$jscoverage['/image.js'].lineData[94]++;
  editor.addContextMenu("image", checkImg, {
  width: 120, 
  children: children, 
  listeners: {
  click: function(e) {
  _$jscoverage['/image.js'].functionData[9]++;
  _$jscoverage['/image.js'].lineData[99]++;
  var self = this, content = e.target.get('content');
  _$jscoverage['/image.js'].lineData[100]++;
  S.each(handlers, function(h) {
  _$jscoverage['/image.js'].functionData[10]++;
  _$jscoverage['/image.js'].lineData[101]++;
  if (visit6_101_1(h.content == content)) {
    _$jscoverage['/image.js'].lineData[102]++;
    h.fn.call(self);
  }
});
}}});
  _$jscoverage['/image.js'].lineData[110]++;
  editor.docReady(function() {
  _$jscoverage['/image.js'].functionData[11]++;
  _$jscoverage['/image.js'].lineData[111]++;
  Event.on(editor.get("document")[0], "dblclick", function(ev) {
  _$jscoverage['/image.js'].functionData[12]++;
  _$jscoverage['/image.js'].lineData[112]++;
  ev.halt();
  _$jscoverage['/image.js'].lineData[113]++;
  var t = $(ev.target);
  _$jscoverage['/image.js'].lineData[114]++;
  if (visit7_114_1(checkImg(t))) {
    _$jscoverage['/image.js'].lineData[115]++;
    showImageEditor(t);
  }
});
});
  _$jscoverage['/image.js'].lineData[120]++;
  editor.addBubble("image", checkImg, {
  listeners: {
  afterRenderUI: function() {
  _$jscoverage['/image.js'].functionData[13]++;
  _$jscoverage['/image.js'].lineData[123]++;
  var bubble = this, el = bubble.get("contentEl");
  _$jscoverage['/image.js'].lineData[125]++;
  el.html(S.substitute(tipHTML, {
  prefixCls: prefixCls}));
  _$jscoverage['/image.js'].lineData[128]++;
  var tipUrlEl = el.one("." + prefixCls + "editor-bubble-url"), tipChangeEl = el.one("." + prefixCls + "editor-bubble-change"), tipRemoveEl = el.one("." + prefixCls + "editor-bubble-remove");
  _$jscoverage['/image.js'].lineData[131]++;
  Editor.Utils.preventFocus(el);
  _$jscoverage['/image.js'].lineData[132]++;
  tipChangeEl.on("click", function(ev) {
  _$jscoverage['/image.js'].functionData[14]++;
  _$jscoverage['/image.js'].lineData[133]++;
  showImageEditor(bubble.get("editorSelectedEl"));
  _$jscoverage['/image.js'].lineData[134]++;
  ev.halt();
});
  _$jscoverage['/image.js'].lineData[136]++;
  tipRemoveEl.on("click", function(ev) {
  _$jscoverage['/image.js'].functionData[15]++;
  _$jscoverage['/image.js'].lineData[137]++;
  if (visit8_137_1(UA['webkit'])) {
    _$jscoverage['/image.js'].lineData[138]++;
    var r = editor.getSelection().getRanges();
    _$jscoverage['/image.js'].lineData[139]++;
    if (visit9_139_1(r && r[0])) {
      _$jscoverage['/image.js'].lineData[140]++;
      r[0].collapse();
      _$jscoverage['/image.js'].lineData[141]++;
      r[0].select();
    }
  }
  _$jscoverage['/image.js'].lineData[144]++;
  bubble.get("editorSelectedEl").remove();
  _$jscoverage['/image.js'].lineData[145]++;
  bubble.hide();
  _$jscoverage['/image.js'].lineData[146]++;
  editor.notifySelectionChange();
  _$jscoverage['/image.js'].lineData[147]++;
  ev.halt();
});
  _$jscoverage['/image.js'].lineData[149]++;
  bubble.on("show", function() {
  _$jscoverage['/image.js'].functionData[16]++;
  _$jscoverage['/image.js'].lineData[150]++;
  var a = bubble.get("editorSelectedEl");
  _$jscoverage['/image.js'].lineData[151]++;
  if (visit10_151_1(a)) {
    _$jscoverage['/image.js'].lineData[152]++;
    var src = visit11_152_1(a.attr("_ke_saved_src") || a.attr("src"));
    _$jscoverage['/image.js'].lineData[153]++;
    tipUrlEl.attr("href", src);
  }
});
}}});
}});
  _$jscoverage['/image.js'].lineData[162]++;
  return ImagePlugin;
}, {
  requires: ['editor', './button', './bubble', './contextmenu', './dialog-loader']});
