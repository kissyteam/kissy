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
  _$jscoverage['/dialog.js'].lineData[5] = 0;
  _$jscoverage['/dialog.js'].lineData[6] = 0;
  _$jscoverage['/dialog.js'].lineData[7] = 0;
  _$jscoverage['/dialog.js'].lineData[8] = 0;
  _$jscoverage['/dialog.js'].lineData[10] = 0;
  _$jscoverage['/dialog.js'].lineData[49] = 0;
  _$jscoverage['/dialog.js'].lineData[80] = 0;
  _$jscoverage['/dialog.js'].lineData[81] = 0;
  _$jscoverage['/dialog.js'].lineData[84] = 0;
  _$jscoverage['/dialog.js'].lineData[86] = 0;
  _$jscoverage['/dialog.js'].lineData[90] = 0;
  _$jscoverage['/dialog.js'].lineData[101] = 0;
  _$jscoverage['/dialog.js'].lineData[103] = 0;
  _$jscoverage['/dialog.js'].lineData[104] = 0;
  _$jscoverage['/dialog.js'].lineData[105] = 0;
  _$jscoverage['/dialog.js'].lineData[115] = 0;
  _$jscoverage['/dialog.js'].lineData[116] = 0;
  _$jscoverage['/dialog.js'].lineData[117] = 0;
  _$jscoverage['/dialog.js'].lineData[120] = 0;
  _$jscoverage['/dialog.js'].lineData[123] = 0;
  _$jscoverage['/dialog.js'].lineData[127] = 0;
  _$jscoverage['/dialog.js'].lineData[128] = 0;
  _$jscoverage['/dialog.js'].lineData[129] = 0;
  _$jscoverage['/dialog.js'].lineData[131] = 0;
  _$jscoverage['/dialog.js'].lineData[135] = 0;
  _$jscoverage['/dialog.js'].lineData[142] = 0;
  _$jscoverage['/dialog.js'].lineData[143] = 0;
  _$jscoverage['/dialog.js'].lineData[145] = 0;
  _$jscoverage['/dialog.js'].lineData[146] = 0;
  _$jscoverage['/dialog.js'].lineData[149] = 0;
  _$jscoverage['/dialog.js'].lineData[153] = 0;
  _$jscoverage['/dialog.js'].lineData[154] = 0;
  _$jscoverage['/dialog.js'].lineData[155] = 0;
  _$jscoverage['/dialog.js'].lineData[157] = 0;
  _$jscoverage['/dialog.js'].lineData[159] = 0;
  _$jscoverage['/dialog.js'].lineData[160] = 0;
  _$jscoverage['/dialog.js'].lineData[163] = 0;
  _$jscoverage['/dialog.js'].lineData[164] = 0;
  _$jscoverage['/dialog.js'].lineData[166] = 0;
  _$jscoverage['/dialog.js'].lineData[170] = 0;
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
}
if (! _$jscoverage['/dialog.js'].branchData) {
  _$jscoverage['/dialog.js'].branchData = {};
  _$jscoverage['/dialog.js'].branchData['127'] = [];
  _$jscoverage['/dialog.js'].branchData['127'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['146'] = [];
  _$jscoverage['/dialog.js'].branchData['146'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['146'][2] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['146'][3] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['149'] = [];
  _$jscoverage['/dialog.js'].branchData['149'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['150'] = [];
  _$jscoverage['/dialog.js'].branchData['150'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['154'] = [];
  _$jscoverage['/dialog.js'].branchData['154'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['163'] = [];
  _$jscoverage['/dialog.js'].branchData['163'][1] = new BranchData();
}
_$jscoverage['/dialog.js'].branchData['163'][1].init(18, 12, '!this.dialog');
function visit8_163_1(result) {
  _$jscoverage['/dialog.js'].branchData['163'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['154'][1].init(91, 8, '!S.UA.ie');
function visit7_154_1(result) {
  _$jscoverage['/dialog.js'].branchData['154'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['150'][1].init(28, 79, 'xhtml_dtd.$block[nextName] && xhtml_dtd[nextName][\'#text\']');
function visit6_150_1(result) {
  _$jscoverage['/dialog.js'].branchData['150'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['149'][1].init(1014, 108, 'nextName && xhtml_dtd.$block[nextName] && xhtml_dtd[nextName][\'#text\']');
function visit5_149_1(result) {
  _$jscoverage['/dialog.js'].branchData['149'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['146'][3].init(853, 41, 'next[0].nodeType == NodeType.ELEMENT_NODE');
function visit4_146_3(result) {
  _$jscoverage['/dialog.js'].branchData['146'][3].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['146'][2].init(853, 77, 'next[0].nodeType == NodeType.ELEMENT_NODE && next.nodeName()');
function visit3_146_2(result) {
  _$jscoverage['/dialog.js'].branchData['146'][2].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['146'][1].init(845, 85, 'next && next[0].nodeType == NodeType.ELEMENT_NODE && next.nodeName()');
function visit2_146_1(result) {
  _$jscoverage['/dialog.js'].branchData['146'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['127'][1].init(144, 25, '!S.trim(val = code.val())');
function visit1_127_1(result) {
  _$jscoverage['/dialog.js'].branchData['127'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].lineData[5]++;
KISSY.add('editor/plugin/code/dialog', function(S, Editor, Dialog4E, MenuButton) {
  _$jscoverage['/dialog.js'].functionData[0]++;
  _$jscoverage['/dialog.js'].lineData[6]++;
  var xhtml_dtd = Editor.XHTML_DTD;
  _$jscoverage['/dialog.js'].lineData[7]++;
  var NodeType = S.DOM.NodeType;
  _$jscoverage['/dialog.js'].lineData[8]++;
  var notWhitespaceEval = Editor.Walker.whitespaces(true);
  _$jscoverage['/dialog.js'].lineData[10]++;
  var codeTypes = [['ActionScript3', 'as3'], ['Bash/Shell', 'bash'], ['C/C++', 'cpp'], ['Css', 'css'], ['CodeFunction', 'cf'], ['C#', 'c#'], ['Delphi', 'delphi'], ['Diff', 'diff'], ['Erlang', 'erlang'], ['Groovy', 'groovy'], ['HTML', 'html'], ['Java', 'java'], ['JavaFx', 'jfx'], ['Javascript', 'js'], ['Perl', 'pl'], ['Php', 'php'], ['Plain Text', 'plain'], ['PowerShell', 'ps'], ['Python', 'python'], ['Ruby', 'ruby'], ['Scala', 'scala'], ['Sql', 'sql'], ['Vb', 'vb'], ['Xml', 'xml']], bodyTpl = '<div class="{prefixCls}code-wrap">' + '<table class="{prefixCls}code-table">' + '<tr>' + '<td class="{prefixCls}code-label">' + '<label for="ks-editor-code-type">' + '\u7c7b\u578b\uff1a' + '</label>' + '</td>' + '<td class="{prefixCls}code-content">' + '<select ' + 'id="ks-editor-code-type" ' + ' class="{prefixCls}code-type">' + S.map(codeTypes, function(codeType) {
  _$jscoverage['/dialog.js'].functionData[1]++;
  _$jscoverage['/dialog.js'].lineData[49]++;
  return '<option value="' + codeType[1] + '">' + codeType[0] + '</option>';
}) + '</select>' + '</td>' + '</tr>' + '<tr>' + '<td>' + '<label for="ks-editor-code-textarea">' + '\u4ee3\u7801\uff1a' + '</label>' + '</td>' + '<td>' + '<textarea ' + 'id="ks-editor-code-textarea" ' + ' class="{prefixCls}code-textarea {prefixCls}input">' + '</textarea>' + '</td>' + '</tr>' + '</table>' + '</div>', footTpl = '<div class="{prefixCls}code-table-action">' + '<a href="javascript:void(\'\u63d2\u5165\')"' + ' class="{prefixCls}code-insert {prefixCls}button">\u63d2\u5165</a>' + '<a href="javascript:void(\'\u53d6\u6d88\')"' + ' class="{prefixCls}code-cancel {prefixCls}button">\u53d6\u6d88</a>' + '</td>' + '</div>', codeTpl = '<pre class="prettyprint ks-editor-code brush:{type};toolbar:false;">' + '{code}' + '</pre>';
  _$jscoverage['/dialog.js'].lineData[80]++;
  function CodeDialog(editor) {
    _$jscoverage['/dialog.js'].functionData[2]++;
    _$jscoverage['/dialog.js'].lineData[81]++;
    this.editor = editor;
  }
  _$jscoverage['/dialog.js'].lineData[84]++;
  S.augment(CodeDialog, {
  initDialog: function() {
  _$jscoverage['/dialog.js'].functionData[3]++;
  _$jscoverage['/dialog.js'].lineData[86]++;
  var self = this, prefixCls = self.editor.get('prefixCls') + 'editor-', el, d;
  _$jscoverage['/dialog.js'].lineData[90]++;
  d = self.dialog = new Dialog4E({
  width: 500, 
  mask: true, 
  headerContent: '\u63d2\u5165\u4ee3\u7801', 
  bodyContent: S.substitute(bodyTpl, {
  prefixCls: prefixCls}), 
  footerContent: S.substitute(footTpl, {
  prefixCls: prefixCls})}).render();
  _$jscoverage['/dialog.js'].lineData[101]++;
  el = d.get('el');
  _$jscoverage['/dialog.js'].lineData[103]++;
  self.insert = el.one('.' + prefixCls + 'code-insert');
  _$jscoverage['/dialog.js'].lineData[104]++;
  self.cancel = el.one('.' + prefixCls + 'code-cancel');
  _$jscoverage['/dialog.js'].lineData[105]++;
  self.type = MenuButton.Select.decorate(el.one('.' + prefixCls + 'code-type'), {
  prefixCls: prefixCls + 'big-', 
  width: 150, 
  menuCfg: {
  prefixCls: prefixCls, 
  height: 320, 
  render: d.get('contentEl')}});
  _$jscoverage['/dialog.js'].lineData[115]++;
  self.code = el.one('.' + prefixCls + 'code-textarea');
  _$jscoverage['/dialog.js'].lineData[116]++;
  self.insert.on('click', self._insert, self);
  _$jscoverage['/dialog.js'].lineData[117]++;
  self.cancel.on('click', self.hide, self);
}, 
  hide: function() {
  _$jscoverage['/dialog.js'].functionData[4]++;
  _$jscoverage['/dialog.js'].lineData[120]++;
  this.dialog.hide();
}, 
  _insert: function() {
  _$jscoverage['/dialog.js'].functionData[5]++;
  _$jscoverage['/dialog.js'].lineData[123]++;
  var self = this, val, editor = self.editor, code = self.code;
  _$jscoverage['/dialog.js'].lineData[127]++;
  if (visit1_127_1(!S.trim(val = code.val()))) {
    _$jscoverage['/dialog.js'].lineData[128]++;
    alert('\u8bf7\u8f93\u5165\u4ee3\u7801!');
    _$jscoverage['/dialog.js'].lineData[129]++;
    return;
  }
  _$jscoverage['/dialog.js'].lineData[131]++;
  var codeEl = S.all(S.substitute(codeTpl, {
  type: self.type.get('value'), 
  code: S.escapeHtml(val)}), editor.get('document')[0]);
  _$jscoverage['/dialog.js'].lineData[135]++;
  self.dialog.hide();
  _$jscoverage['/dialog.js'].lineData[142]++;
  editor.insertElement(codeEl);
  _$jscoverage['/dialog.js'].lineData[143]++;
  var range = editor.getSelection().getRanges()[0];
  _$jscoverage['/dialog.js'].lineData[145]++;
  var next = codeEl.next(notWhitespaceEval, 1);
  _$jscoverage['/dialog.js'].lineData[146]++;
  var nextName = visit2_146_1(next && visit3_146_2(visit4_146_3(next[0].nodeType == NodeType.ELEMENT_NODE) && next.nodeName()));
  _$jscoverage['/dialog.js'].lineData[149]++;
  if (visit5_149_1(nextName && visit6_150_1(xhtml_dtd.$block[nextName] && xhtml_dtd[nextName]['#text']))) {
  } else {
    _$jscoverage['/dialog.js'].lineData[153]++;
    next = S.all("<p></p>", editor.get('document')[0]);
    _$jscoverage['/dialog.js'].lineData[154]++;
    if (visit7_154_1(!S.UA.ie)) {
      _$jscoverage['/dialog.js'].lineData[155]++;
      next._4e_appendBogus();
    }
    _$jscoverage['/dialog.js'].lineData[157]++;
    codeEl.after(next);
  }
  _$jscoverage['/dialog.js'].lineData[159]++;
  range.moveToElementEditablePosition(next);
  _$jscoverage['/dialog.js'].lineData[160]++;
  editor.getSelection().selectRanges([range]);
}, 
  show: function() {
  _$jscoverage['/dialog.js'].functionData[6]++;
  _$jscoverage['/dialog.js'].lineData[163]++;
  if (visit8_163_1(!this.dialog)) {
    _$jscoverage['/dialog.js'].lineData[164]++;
    this.initDialog();
  }
  _$jscoverage['/dialog.js'].lineData[166]++;
  this.dialog.show();
}});
  _$jscoverage['/dialog.js'].lineData[170]++;
  return CodeDialog;
}, {
  requires: ['editor', '../dialog', 'menubutton']});
