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
  _$jscoverage['/image.js'].lineData[6] = 0;
  _$jscoverage['/image.js'].lineData[7] = 0;
  _$jscoverage['/image.js'].lineData[8] = 0;
  _$jscoverage['/image.js'].lineData[9] = 0;
  _$jscoverage['/image.js'].lineData[10] = 0;
  _$jscoverage['/image.js'].lineData[11] = 0;
  _$jscoverage['/image.js'].lineData[13] = 0;
  _$jscoverage['/image.js'].lineData[17] = 0;
  _$jscoverage['/image.js'].lineData[18] = 0;
  _$jscoverage['/image.js'].lineData[21] = 0;
  _$jscoverage['/image.js'].lineData[30] = 0;
  _$jscoverage['/image.js'].lineData[31] = 0;
  _$jscoverage['/image.js'].lineData[34] = 0;
  _$jscoverage['/image.js'].lineData[37] = 0;
  _$jscoverage['/image.js'].lineData[39] = 0;
  _$jscoverage['/image.js'].lineData[41] = 0;
  _$jscoverage['/image.js'].lineData[42] = 0;
  _$jscoverage['/image.js'].lineData[48] = 0;
  _$jscoverage['/image.js'].lineData[52] = 0;
  _$jscoverage['/image.js'].lineData[59] = 0;
  _$jscoverage['/image.js'].lineData[63] = 0;
  _$jscoverage['/image.js'].lineData[64] = 0;
  _$jscoverage['/image.js'].lineData[66] = 0;
  _$jscoverage['/image.js'].lineData[67] = 0;
  _$jscoverage['/image.js'].lineData[74] = 0;
  _$jscoverage['/image.js'].lineData[75] = 0;
  _$jscoverage['/image.js'].lineData[77] = 0;
  _$jscoverage['/image.js'].lineData[78] = 0;
  _$jscoverage['/image.js'].lineData[80] = 0;
  _$jscoverage['/image.js'].lineData[81] = 0;
  _$jscoverage['/image.js'].lineData[82] = 0;
  _$jscoverage['/image.js'].lineData[83] = 0;
  _$jscoverage['/image.js'].lineData[84] = 0;
  _$jscoverage['/image.js'].lineData[85] = 0;
  _$jscoverage['/image.js'].lineData[90] = 0;
  _$jscoverage['/image.js'].lineData[92] = 0;
  _$jscoverage['/image.js'].lineData[93] = 0;
  _$jscoverage['/image.js'].lineData[98] = 0;
  _$jscoverage['/image.js'].lineData[103] = 0;
  _$jscoverage['/image.js'].lineData[104] = 0;
  _$jscoverage['/image.js'].lineData[105] = 0;
  _$jscoverage['/image.js'].lineData[106] = 0;
  _$jscoverage['/image.js'].lineData[114] = 0;
  _$jscoverage['/image.js'].lineData[115] = 0;
  _$jscoverage['/image.js'].lineData[116] = 0;
  _$jscoverage['/image.js'].lineData[117] = 0;
  _$jscoverage['/image.js'].lineData[118] = 0;
  _$jscoverage['/image.js'].lineData[119] = 0;
  _$jscoverage['/image.js'].lineData[124] = 0;
  _$jscoverage['/image.js'].lineData[127] = 0;
  _$jscoverage['/image.js'].lineData[129] = 0;
  _$jscoverage['/image.js'].lineData[132] = 0;
  _$jscoverage['/image.js'].lineData[135] = 0;
  _$jscoverage['/image.js'].lineData[136] = 0;
  _$jscoverage['/image.js'].lineData[137] = 0;
  _$jscoverage['/image.js'].lineData[138] = 0;
  _$jscoverage['/image.js'].lineData[140] = 0;
  _$jscoverage['/image.js'].lineData[141] = 0;
  _$jscoverage['/image.js'].lineData[142] = 0;
  _$jscoverage['/image.js'].lineData[143] = 0;
  _$jscoverage['/image.js'].lineData[144] = 0;
  _$jscoverage['/image.js'].lineData[145] = 0;
  _$jscoverage['/image.js'].lineData[148] = 0;
  _$jscoverage['/image.js'].lineData[149] = 0;
  _$jscoverage['/image.js'].lineData[150] = 0;
  _$jscoverage['/image.js'].lineData[151] = 0;
  _$jscoverage['/image.js'].lineData[153] = 0;
  _$jscoverage['/image.js'].lineData[154] = 0;
  _$jscoverage['/image.js'].lineData[155] = 0;
  _$jscoverage['/image.js'].lineData[156] = 0;
  _$jscoverage['/image.js'].lineData[157] = 0;
  _$jscoverage['/image.js'].lineData[166] = 0;
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
  _$jscoverage['/image.js'].branchData['18'] = [];
  _$jscoverage['/image.js'].branchData['18'][1] = new BranchData();
  _$jscoverage['/image.js'].branchData['18'][2] = new BranchData();
  _$jscoverage['/image.js'].branchData['31'] = [];
  _$jscoverage['/image.js'].branchData['31'][1] = new BranchData();
  _$jscoverage['/image.js'].branchData['64'] = [];
  _$jscoverage['/image.js'].branchData['64'][1] = new BranchData();
  _$jscoverage['/image.js'].branchData['77'] = [];
  _$jscoverage['/image.js'].branchData['77'][1] = new BranchData();
  _$jscoverage['/image.js'].branchData['105'] = [];
  _$jscoverage['/image.js'].branchData['105'][1] = new BranchData();
  _$jscoverage['/image.js'].branchData['118'] = [];
  _$jscoverage['/image.js'].branchData['118'][1] = new BranchData();
  _$jscoverage['/image.js'].branchData['141'] = [];
  _$jscoverage['/image.js'].branchData['141'][1] = new BranchData();
  _$jscoverage['/image.js'].branchData['143'] = [];
  _$jscoverage['/image.js'].branchData['143'][1] = new BranchData();
  _$jscoverage['/image.js'].branchData['155'] = [];
  _$jscoverage['/image.js'].branchData['155'][1] = new BranchData();
  _$jscoverage['/image.js'].branchData['156'] = [];
  _$jscoverage['/image.js'].branchData['156'][1] = new BranchData();
}
_$jscoverage['/image.js'].branchData['156'][1].init(43, 40, 'a.attr(\'_ke_saved_src\') || a.attr(\'src\')');
function visit11_156_1(result) {
  _$jscoverage['/image.js'].branchData['156'][1].ranCondition(result);
  return result;
}_$jscoverage['/image.js'].branchData['155'][1].init(101, 1, 'a');
function visit10_155_1(result) {
  _$jscoverage['/image.js'].branchData['155'][1].ranCondition(result);
  return result;
}_$jscoverage['/image.js'].branchData['143'][1].init(112, 9, 'r && r[0]');
function visit9_143_1(result) {
  _$jscoverage['/image.js'].branchData['143'][1].ranCondition(result);
  return result;
}_$jscoverage['/image.js'].branchData['141'][1].init(33, 9, 'UA.webkit');
function visit8_141_1(result) {
  _$jscoverage['/image.js'].branchData['141'][1].ranCondition(result);
  return result;
}_$jscoverage['/image.js'].branchData['118'][1].init(98, 11, 'checkImg(t)');
function visit7_118_1(result) {
  _$jscoverage['/image.js'].branchData['118'][1].ranCondition(result);
  return result;
}_$jscoverage['/image.js'].branchData['105'][1].init(33, 21, 'h.content === content');
function visit6_105_1(result) {
  _$jscoverage['/image.js'].branchData['105'][1].ranCondition(result);
  return result;
}_$jscoverage['/image.js'].branchData['77'][1].init(193, 6, '!UA.ie');
function visit5_77_1(result) {
  _$jscoverage['/image.js'].branchData['77'][1].ranCondition(result);
  return result;
}_$jscoverage['/image.js'].branchData['64'][1].init(103, 3, 'img');
function visit4_64_1(result) {
  _$jscoverage['/image.js'].branchData['64'][1].ranCondition(result);
  return result;
}_$jscoverage['/image.js'].branchData['31'][1].init(23, 12, 'config || {}');
function visit3_31_1(result) {
  _$jscoverage['/image.js'].branchData['31'][1].ranCondition(result);
  return result;
}_$jscoverage['/image.js'].branchData['18'][2].init(45, 25, 'node.nodeName() === \'img\'');
function visit2_18_2(result) {
  _$jscoverage['/image.js'].branchData['18'][2].ranCondition(result);
  return result;
}_$jscoverage['/image.js'].branchData['18'][1].init(45, 139, 'node.nodeName() === \'img\' && (!/(^|\\s+)ke_/.test(node[0].className))');
function visit1_18_1(result) {
  _$jscoverage['/image.js'].branchData['18'][1].ranCondition(result);
  return result;
}_$jscoverage['/image.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/image.js'].functionData[0]++;
  _$jscoverage['/image.js'].lineData[7]++;
  require('./button');
  _$jscoverage['/image.js'].lineData[8]++;
  var Editor = require('editor');
  _$jscoverage['/image.js'].lineData[9]++;
  require('./bubble');
  _$jscoverage['/image.js'].lineData[10]++;
  var DialogLoader = require('./dialog-loader');
  _$jscoverage['/image.js'].lineData[11]++;
  require('./contextmenu');
  _$jscoverage['/image.js'].lineData[13]++;
  var UA = S.UA, Node = KISSY.NodeList, $ = S.all, checkImg = function(node) {
  _$jscoverage['/image.js'].functionData[1]++;
  _$jscoverage['/image.js'].lineData[17]++;
  node = $(node);
  _$jscoverage['/image.js'].lineData[18]++;
  if (visit1_18_1(visit2_18_2(node.nodeName() === 'img') && (!/(^|\s+)ke_/.test(node[0].className)))) {
    _$jscoverage['/image.js'].lineData[21]++;
    return node;
  }
}, tipHTML = '<a class="{prefixCls}editor-bubble-url" ' + 'target="_blank" href="#">\u5728\u65b0\u7a97\u53e3\u67e5\u770b</a>  |  ' + '<a class="{prefixCls}editor-bubble-link ' + '{prefixCls}editor-bubble-change" href="#">\u7f16\u8f91</a>  |  ' + '<a class="{prefixCls}editor-bubble-link ' + '{prefixCls}editor-bubble-remove" href="#">\u5220\u9664</a>';
  _$jscoverage['/image.js'].lineData[30]++;
  function ImagePlugin(config) {
    _$jscoverage['/image.js'].functionData[2]++;
    _$jscoverage['/image.js'].lineData[31]++;
    this.config = visit3_31_1(config || {});
  }
  _$jscoverage['/image.js'].lineData[34]++;
  S.augment(ImagePlugin, {
  pluginRenderUI: function(editor) {
  _$jscoverage['/image.js'].functionData[3]++;
  _$jscoverage['/image.js'].lineData[37]++;
  var self = this;
  _$jscoverage['/image.js'].lineData[39]++;
  var prefixCls = editor.get('prefixCls');
  _$jscoverage['/image.js'].lineData[41]++;
  function showImageEditor(selectedEl) {
    _$jscoverage['/image.js'].functionData[4]++;
    _$jscoverage['/image.js'].lineData[42]++;
    DialogLoader.useDialog(editor, 'image', self.config, selectedEl);
  }
  _$jscoverage['/image.js'].lineData[48]++;
  editor.addButton('image', {
  tooltip: '\u63d2\u5165\u56fe\u7247', 
  listeners: {
  click: function() {
  _$jscoverage['/image.js'].functionData[5]++;
  _$jscoverage['/image.js'].lineData[52]++;
  showImageEditor(null);
}}, 
  mode: Editor.Mode.WYSIWYG_MODE});
  _$jscoverage['/image.js'].lineData[59]++;
  var handlers = [{
  content: '\u56fe\u7247\u5c5e\u6027', 
  fn: function() {
  _$jscoverage['/image.js'].functionData[6]++;
  _$jscoverage['/image.js'].lineData[63]++;
  var img = checkImg(this.get('editorSelectedEl'));
  _$jscoverage['/image.js'].lineData[64]++;
  if (visit4_64_1(img)) {
    _$jscoverage['/image.js'].lineData[66]++;
    this.hide();
    _$jscoverage['/image.js'].lineData[67]++;
    showImageEditor($(img));
  }
}}, {
  content: '\u63d2\u5165\u65b0\u884c', 
  fn: function() {
  _$jscoverage['/image.js'].functionData[7]++;
  _$jscoverage['/image.js'].lineData[74]++;
  this.hide();
  _$jscoverage['/image.js'].lineData[75]++;
  var doc = editor.get('document')[0], p = new Node(doc.createElement('p'));
  _$jscoverage['/image.js'].lineData[77]++;
  if (visit5_77_1(!UA.ie)) {
    _$jscoverage['/image.js'].lineData[78]++;
    p._4eAppendBogus(undefined);
  }
  _$jscoverage['/image.js'].lineData[80]++;
  var r = new Editor.Range(doc);
  _$jscoverage['/image.js'].lineData[81]++;
  r.setStartAfter(this.get('editorSelectedEl'));
  _$jscoverage['/image.js'].lineData[82]++;
  r.select();
  _$jscoverage['/image.js'].lineData[83]++;
  editor.insertElement(p);
  _$jscoverage['/image.js'].lineData[84]++;
  r.moveToElementEditablePosition(p, 1);
  _$jscoverage['/image.js'].lineData[85]++;
  r.select();
}}];
  _$jscoverage['/image.js'].lineData[90]++;
  var children = [];
  _$jscoverage['/image.js'].lineData[92]++;
  S.each(handlers, function(h) {
  _$jscoverage['/image.js'].functionData[8]++;
  _$jscoverage['/image.js'].lineData[93]++;
  children.push({
  content: h.content});
});
  _$jscoverage['/image.js'].lineData[98]++;
  editor.addContextMenu('image', checkImg, {
  width: 120, 
  children: children, 
  listeners: {
  click: function(e) {
  _$jscoverage['/image.js'].functionData[9]++;
  _$jscoverage['/image.js'].lineData[103]++;
  var self = this, content = e.target.get('content');
  _$jscoverage['/image.js'].lineData[104]++;
  S.each(handlers, function(h) {
  _$jscoverage['/image.js'].functionData[10]++;
  _$jscoverage['/image.js'].lineData[105]++;
  if (visit6_105_1(h.content === content)) {
    _$jscoverage['/image.js'].lineData[106]++;
    h.fn.call(self);
  }
});
}}});
  _$jscoverage['/image.js'].lineData[114]++;
  editor.docReady(function() {
  _$jscoverage['/image.js'].functionData[11]++;
  _$jscoverage['/image.js'].lineData[115]++;
  editor.get('document').on('dblclick', function(ev) {
  _$jscoverage['/image.js'].functionData[12]++;
  _$jscoverage['/image.js'].lineData[116]++;
  ev.halt();
  _$jscoverage['/image.js'].lineData[117]++;
  var t = $(ev.target);
  _$jscoverage['/image.js'].lineData[118]++;
  if (visit7_118_1(checkImg(t))) {
    _$jscoverage['/image.js'].lineData[119]++;
    showImageEditor(t);
  }
});
});
  _$jscoverage['/image.js'].lineData[124]++;
  editor.addBubble('image', checkImg, {
  listeners: {
  afterRenderUI: function() {
  _$jscoverage['/image.js'].functionData[13]++;
  _$jscoverage['/image.js'].lineData[127]++;
  var bubble = this, el = bubble.get('contentEl');
  _$jscoverage['/image.js'].lineData[129]++;
  el.html(S.substitute(tipHTML, {
  prefixCls: prefixCls}));
  _$jscoverage['/image.js'].lineData[132]++;
  var tipUrlEl = el.one('.' + prefixCls + 'editor-bubble-url'), tipChangeEl = el.one('.' + prefixCls + 'editor-bubble-change'), tipRemoveEl = el.one('.' + prefixCls + 'editor-bubble-remove');
  _$jscoverage['/image.js'].lineData[135]++;
  Editor.Utils.preventFocus(el);
  _$jscoverage['/image.js'].lineData[136]++;
  tipChangeEl.on('click', function(ev) {
  _$jscoverage['/image.js'].functionData[14]++;
  _$jscoverage['/image.js'].lineData[137]++;
  showImageEditor(bubble.get('editorSelectedEl'));
  _$jscoverage['/image.js'].lineData[138]++;
  ev.halt();
});
  _$jscoverage['/image.js'].lineData[140]++;
  tipRemoveEl.on('click', function(ev) {
  _$jscoverage['/image.js'].functionData[15]++;
  _$jscoverage['/image.js'].lineData[141]++;
  if (visit8_141_1(UA.webkit)) {
    _$jscoverage['/image.js'].lineData[142]++;
    var r = editor.getSelection().getRanges();
    _$jscoverage['/image.js'].lineData[143]++;
    if (visit9_143_1(r && r[0])) {
      _$jscoverage['/image.js'].lineData[144]++;
      r[0].collapse();
      _$jscoverage['/image.js'].lineData[145]++;
      r[0].select();
    }
  }
  _$jscoverage['/image.js'].lineData[148]++;
  bubble.get('editorSelectedEl').remove();
  _$jscoverage['/image.js'].lineData[149]++;
  bubble.hide();
  _$jscoverage['/image.js'].lineData[150]++;
  editor.notifySelectionChange();
  _$jscoverage['/image.js'].lineData[151]++;
  ev.halt();
});
  _$jscoverage['/image.js'].lineData[153]++;
  bubble.on('show', function() {
  _$jscoverage['/image.js'].functionData[16]++;
  _$jscoverage['/image.js'].lineData[154]++;
  var a = bubble.get('editorSelectedEl');
  _$jscoverage['/image.js'].lineData[155]++;
  if (visit10_155_1(a)) {
    _$jscoverage['/image.js'].lineData[156]++;
    var src = visit11_156_1(a.attr('_ke_saved_src') || a.attr('src'));
    _$jscoverage['/image.js'].lineData[157]++;
    tipUrlEl.attr('href', src);
  }
});
}}});
}});
  _$jscoverage['/image.js'].lineData[166]++;
  return ImagePlugin;
});
