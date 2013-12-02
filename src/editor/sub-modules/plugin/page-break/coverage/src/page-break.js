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
if (! _$jscoverage['/page-break.js']) {
  _$jscoverage['/page-break.js'] = {};
  _$jscoverage['/page-break.js'].lineData = [];
  _$jscoverage['/page-break.js'].lineData[6] = 0;
  _$jscoverage['/page-break.js'].lineData[7] = 0;
  _$jscoverage['/page-break.js'].lineData[8] = 0;
  _$jscoverage['/page-break.js'].lineData[9] = 0;
  _$jscoverage['/page-break.js'].lineData[10] = 0;
  _$jscoverage['/page-break.js'].lineData[18] = 0;
  _$jscoverage['/page-break.js'].lineData[21] = 0;
  _$jscoverage['/page-break.js'].lineData[23] = 0;
  _$jscoverage['/page-break.js'].lineData[25] = 0;
  _$jscoverage['/page-break.js'].lineData[28] = 0;
  _$jscoverage['/page-break.js'].lineData[31] = 0;
  _$jscoverage['/page-break.js'].lineData[34] = 0;
  _$jscoverage['/page-break.js'].lineData[35] = 0;
  _$jscoverage['/page-break.js'].lineData[36] = 0;
  _$jscoverage['/page-break.js'].lineData[37] = 0;
  _$jscoverage['/page-break.js'].lineData[38] = 0;
  _$jscoverage['/page-break.js'].lineData[43] = 0;
  _$jscoverage['/page-break.js'].lineData[47] = 0;
  _$jscoverage['/page-break.js'].lineData[50] = 0;
  _$jscoverage['/page-break.js'].lineData[52] = 0;
  _$jscoverage['/page-break.js'].lineData[57] = 0;
  _$jscoverage['/page-break.js'].lineData[61] = 0;
  _$jscoverage['/page-break.js'].lineData[69] = 0;
  _$jscoverage['/page-break.js'].lineData[71] = 0;
  _$jscoverage['/page-break.js'].lineData[74] = 0;
  _$jscoverage['/page-break.js'].lineData[75] = 0;
  _$jscoverage['/page-break.js'].lineData[78] = 0;
  _$jscoverage['/page-break.js'].lineData[80] = 0;
  _$jscoverage['/page-break.js'].lineData[83] = 0;
  _$jscoverage['/page-break.js'].lineData[84] = 0;
  _$jscoverage['/page-break.js'].lineData[85] = 0;
  _$jscoverage['/page-break.js'].lineData[88] = 0;
  _$jscoverage['/page-break.js'].lineData[90] = 0;
  _$jscoverage['/page-break.js'].lineData[92] = 0;
  _$jscoverage['/page-break.js'].lineData[94] = 0;
  _$jscoverage['/page-break.js'].lineData[103] = 0;
}
if (! _$jscoverage['/page-break.js'].functionData) {
  _$jscoverage['/page-break.js'].functionData = [];
  _$jscoverage['/page-break.js'].functionData[0] = 0;
  _$jscoverage['/page-break.js'].functionData[1] = 0;
  _$jscoverage['/page-break.js'].functionData[2] = 0;
  _$jscoverage['/page-break.js'].functionData[3] = 0;
  _$jscoverage['/page-break.js'].functionData[4] = 0;
}
if (! _$jscoverage['/page-break.js'].branchData) {
  _$jscoverage['/page-break.js'].branchData = {};
  _$jscoverage['/page-break.js'].branchData['26'] = [];
  _$jscoverage['/page-break.js'].branchData['26'][1] = new BranchData();
  _$jscoverage['/page-break.js'].branchData['34'] = [];
  _$jscoverage['/page-break.js'].branchData['34'][1] = new BranchData();
  _$jscoverage['/page-break.js'].branchData['36'] = [];
  _$jscoverage['/page-break.js'].branchData['36'][1] = new BranchData();
  _$jscoverage['/page-break.js'].branchData['37'] = [];
  _$jscoverage['/page-break.js'].branchData['37'][1] = new BranchData();
  _$jscoverage['/page-break.js'].branchData['43'] = [];
  _$jscoverage['/page-break.js'].branchData['43'][1] = new BranchData();
  _$jscoverage['/page-break.js'].branchData['44'] = [];
  _$jscoverage['/page-break.js'].branchData['44'][1] = new BranchData();
  _$jscoverage['/page-break.js'].branchData['44'][2] = new BranchData();
  _$jscoverage['/page-break.js'].branchData['47'] = [];
  _$jscoverage['/page-break.js'].branchData['47'][1] = new BranchData();
  _$jscoverage['/page-break.js'].branchData['48'] = [];
  _$jscoverage['/page-break.js'].branchData['48'][1] = new BranchData();
  _$jscoverage['/page-break.js'].branchData['72'] = [];
  _$jscoverage['/page-break.js'].branchData['72'][1] = new BranchData();
  _$jscoverage['/page-break.js'].branchData['74'] = [];
  _$jscoverage['/page-break.js'].branchData['74'][1] = new BranchData();
  _$jscoverage['/page-break.js'].branchData['83'] = [];
  _$jscoverage['/page-break.js'].branchData['83'][1] = new BranchData();
}
_$jscoverage['/page-break.js'].branchData['83'][1].init(827, 27, 'start.nodeName() !== \'body\'');
function visit12_83_1(result) {
  _$jscoverage['/page-break.js'].branchData['83'][1].ranCondition(result);
  return result;
}_$jscoverage['/page-break.js'].branchData['74'][1].init(570, 6, '!range');
function visit11_74_1(result) {
  _$jscoverage['/page-break.js'].branchData['74'][1].ranCondition(result);
  return result;
}_$jscoverage['/page-break.js'].branchData['72'][1].init(68, 25, 'sel && sel.getRanges()[0]');
function visit10_72_1(result) {
  _$jscoverage['/page-break.js'].branchData['72'][1].ranCondition(result);
  return result;
}_$jscoverage['/page-break.js'].branchData['48'][1].init(43, 120, '(/page-break-after\\s*:\\s*always/i).test(style) && (/display\\s*:\\s*none/i).test(childStyle)');
function visit9_48_1(result) {
  _$jscoverage['/page-break.js'].branchData['48'][1].ranCondition(result);
  return result;
}_$jscoverage['/page-break.js'].branchData['47'][1].init(695, 164, 'childStyle && (/page-break-after\\s*:\\s*always/i).test(style) && (/display\\s*:\\s*none/i).test(childStyle)');
function visit8_47_1(result) {
  _$jscoverage['/page-break.js'].branchData['47'][1].ranCondition(result);
  return result;
}_$jscoverage['/page-break.js'].branchData['44'][2].init(57, 25, 'child.nodeName === \'span\'');
function visit7_44_2(result) {
  _$jscoverage['/page-break.js'].branchData['44'][2].ranCondition(result);
  return result;
}_$jscoverage['/page-break.js'].branchData['44'][1].init(38, 86, '(child.nodeName === \'span\') && child.getAttribute(\'style\')');
function visit6_44_1(result) {
  _$jscoverage['/page-break.js'].branchData['44'][1].ranCondition(result);
  return result;
}_$jscoverage['/page-break.js'].branchData['43'][1].init(539, 125, 'child && (child.nodeName === \'span\') && child.getAttribute(\'style\')');
function visit5_43_1(result) {
  _$jscoverage['/page-break.js'].branchData['43'][1].ranCondition(result);
  return result;
}_$jscoverage['/page-break.js'].branchData['37'][1].init(37, 28, 'childNodes[i].nodeType === 1');
function visit4_37_1(result) {
  _$jscoverage['/page-break.js'].branchData['37'][1].ranCondition(result);
  return result;
}_$jscoverage['/page-break.js'].branchData['36'][1].init(110, 21, 'i < childNodes.length');
function visit3_36_1(result) {
  _$jscoverage['/page-break.js'].branchData['36'][1].ranCondition(result);
  return result;
}_$jscoverage['/page-break.js'].branchData['34'][1].init(132, 5, 'style');
function visit2_34_1(result) {
  _$jscoverage['/page-break.js'].branchData['34'][1].ranCondition(result);
  return result;
}_$jscoverage['/page-break.js'].branchData['26'][1].init(74, 41, 'dataProcessor && dataProcessor.dataFilter');
function visit1_26_1(result) {
  _$jscoverage['/page-break.js'].branchData['26'][1].ranCondition(result);
  return result;
}_$jscoverage['/page-break.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/page-break.js'].functionData[0]++;
  _$jscoverage['/page-break.js'].lineData[7]++;
  var Editor = require('editor');
  _$jscoverage['/page-break.js'].lineData[8]++;
  var fakeObjects = require('./fake-objects');
  _$jscoverage['/page-break.js'].lineData[9]++;
  require('./button');
  _$jscoverage['/page-break.js'].lineData[10]++;
  var Node = S.Node, CLS = 'ke_pagebreak', TYPE = 'div', PAGE_BREAK_MARKUP = '<div' + ' style="page-break-after: always; ">' + '<span style="DISPLAY:none">&nbsp;</span>' + '</div>';
  _$jscoverage['/page-break.js'].lineData[18]++;
  function pageBreak() {
    _$jscoverage['/page-break.js'].functionData[1]++;
  }
  _$jscoverage['/page-break.js'].lineData[21]++;
  S.augment(pageBreak, {
  pluginRenderUI: function(editor) {
  _$jscoverage['/page-break.js'].functionData[2]++;
  _$jscoverage['/page-break.js'].lineData[23]++;
  fakeObjects.init(editor);
  _$jscoverage['/page-break.js'].lineData[25]++;
  var dataProcessor = editor.htmlDataProcessor, dataFilter = visit1_26_1(dataProcessor && dataProcessor.dataFilter);
  _$jscoverage['/page-break.js'].lineData[28]++;
  dataFilter.addRules({
  tags: {
  div: function(element) {
  _$jscoverage['/page-break.js'].functionData[3]++;
  _$jscoverage['/page-break.js'].lineData[31]++;
  var style = element.getAttribute('style'), child;
  _$jscoverage['/page-break.js'].lineData[34]++;
  if (visit2_34_1(style)) {
    _$jscoverage['/page-break.js'].lineData[35]++;
    var childNodes = element.childNodes;
    _$jscoverage['/page-break.js'].lineData[36]++;
    for (var i = 0; visit3_36_1(i < childNodes.length); i++) {
      _$jscoverage['/page-break.js'].lineData[37]++;
      if (visit4_37_1(childNodes[i].nodeType === 1)) {
        _$jscoverage['/page-break.js'].lineData[38]++;
        child = childNodes[i];
      }
    }
  }
  _$jscoverage['/page-break.js'].lineData[43]++;
  var childStyle = visit5_43_1(child && visit6_44_1((visit7_44_2(child.nodeName === 'span')) && child.getAttribute('style')));
  _$jscoverage['/page-break.js'].lineData[47]++;
  if (visit8_47_1(childStyle && visit9_48_1((/page-break-after\s*:\s*always/i).test(style) && (/display\s*:\s*none/i).test(childStyle)))) {
    _$jscoverage['/page-break.js'].lineData[50]++;
    return dataProcessor.createFakeParserElement(element, CLS, TYPE);
  }
  _$jscoverage['/page-break.js'].lineData[52]++;
  return undefined;
}}});
  _$jscoverage['/page-break.js'].lineData[57]++;
  editor.addButton('pageBreak', {
  tooltip: '\u5206\u9875', 
  listeners: {
  click: function() {
  _$jscoverage['/page-break.js'].functionData[4]++;
  _$jscoverage['/page-break.js'].lineData[61]++;
  var real = new Node(PAGE_BREAK_MARKUP, null, editor.get('document')[0]), substitute = editor.createFakeElement(real, CLS, TYPE, false, PAGE_BREAK_MARKUP);
  _$jscoverage['/page-break.js'].lineData[69]++;
  editor.focus();
  _$jscoverage['/page-break.js'].lineData[71]++;
  var sel = editor.getSelection(), range = visit10_72_1(sel && sel.getRanges()[0]);
  _$jscoverage['/page-break.js'].lineData[74]++;
  if (visit11_74_1(!range)) {
    _$jscoverage['/page-break.js'].lineData[75]++;
    return;
  }
  _$jscoverage['/page-break.js'].lineData[78]++;
  editor.execCommand('save');
  _$jscoverage['/page-break.js'].lineData[80]++;
  var start = range.startContainer, pre = start;
  _$jscoverage['/page-break.js'].lineData[83]++;
  while (visit12_83_1(start.nodeName() !== 'body')) {
    _$jscoverage['/page-break.js'].lineData[84]++;
    pre = start;
    _$jscoverage['/page-break.js'].lineData[85]++;
    start = start.parent();
  }
  _$jscoverage['/page-break.js'].lineData[88]++;
  range.collapse(true);
  _$jscoverage['/page-break.js'].lineData[90]++;
  range.splitElement(pre);
  _$jscoverage['/page-break.js'].lineData[92]++;
  substitute.insertAfter(pre);
  _$jscoverage['/page-break.js'].lineData[94]++;
  editor.execCommand('save');
}}, 
  mode: Editor.Mode.WYSIWYG_MODE});
}});
  _$jscoverage['/page-break.js'].lineData[103]++;
  return pageBreak;
});
