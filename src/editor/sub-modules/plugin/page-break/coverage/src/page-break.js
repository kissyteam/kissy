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
  _$jscoverage['/page-break.js'].lineData[15] = 0;
  _$jscoverage['/page-break.js'].lineData[17] = 0;
  _$jscoverage['/page-break.js'].lineData[19] = 0;
  _$jscoverage['/page-break.js'].lineData[21] = 0;
  _$jscoverage['/page-break.js'].lineData[24] = 0;
  _$jscoverage['/page-break.js'].lineData[27] = 0;
  _$jscoverage['/page-break.js'].lineData[30] = 0;
  _$jscoverage['/page-break.js'].lineData[31] = 0;
  _$jscoverage['/page-break.js'].lineData[32] = 0;
  _$jscoverage['/page-break.js'].lineData[33] = 0;
  _$jscoverage['/page-break.js'].lineData[34] = 0;
  _$jscoverage['/page-break.js'].lineData[39] = 0;
  _$jscoverage['/page-break.js'].lineData[43] = 0;
  _$jscoverage['/page-break.js'].lineData[46] = 0;
  _$jscoverage['/page-break.js'].lineData[48] = 0;
  _$jscoverage['/page-break.js'].lineData[53] = 0;
  _$jscoverage['/page-break.js'].lineData[57] = 0;
  _$jscoverage['/page-break.js'].lineData[65] = 0;
  _$jscoverage['/page-break.js'].lineData[67] = 0;
  _$jscoverage['/page-break.js'].lineData[70] = 0;
  _$jscoverage['/page-break.js'].lineData[71] = 0;
  _$jscoverage['/page-break.js'].lineData[74] = 0;
  _$jscoverage['/page-break.js'].lineData[76] = 0;
  _$jscoverage['/page-break.js'].lineData[79] = 0;
  _$jscoverage['/page-break.js'].lineData[80] = 0;
  _$jscoverage['/page-break.js'].lineData[81] = 0;
  _$jscoverage['/page-break.js'].lineData[84] = 0;
  _$jscoverage['/page-break.js'].lineData[86] = 0;
  _$jscoverage['/page-break.js'].lineData[88] = 0;
  _$jscoverage['/page-break.js'].lineData[90] = 0;
  _$jscoverage['/page-break.js'].lineData[99] = 0;
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
  _$jscoverage['/page-break.js'].branchData['22'] = [];
  _$jscoverage['/page-break.js'].branchData['22'][1] = new BranchData();
  _$jscoverage['/page-break.js'].branchData['30'] = [];
  _$jscoverage['/page-break.js'].branchData['30'][1] = new BranchData();
  _$jscoverage['/page-break.js'].branchData['32'] = [];
  _$jscoverage['/page-break.js'].branchData['32'][1] = new BranchData();
  _$jscoverage['/page-break.js'].branchData['33'] = [];
  _$jscoverage['/page-break.js'].branchData['33'][1] = new BranchData();
  _$jscoverage['/page-break.js'].branchData['39'] = [];
  _$jscoverage['/page-break.js'].branchData['39'][1] = new BranchData();
  _$jscoverage['/page-break.js'].branchData['40'] = [];
  _$jscoverage['/page-break.js'].branchData['40'][1] = new BranchData();
  _$jscoverage['/page-break.js'].branchData['40'][2] = new BranchData();
  _$jscoverage['/page-break.js'].branchData['43'] = [];
  _$jscoverage['/page-break.js'].branchData['43'][1] = new BranchData();
  _$jscoverage['/page-break.js'].branchData['44'] = [];
  _$jscoverage['/page-break.js'].branchData['44'][1] = new BranchData();
  _$jscoverage['/page-break.js'].branchData['68'] = [];
  _$jscoverage['/page-break.js'].branchData['68'][1] = new BranchData();
  _$jscoverage['/page-break.js'].branchData['70'] = [];
  _$jscoverage['/page-break.js'].branchData['70'][1] = new BranchData();
  _$jscoverage['/page-break.js'].branchData['79'] = [];
  _$jscoverage['/page-break.js'].branchData['79'][1] = new BranchData();
}
_$jscoverage['/page-break.js'].branchData['79'][1].init(850, 27, 'start.nodeName() !== "body"');
function visit12_79_1(result) {
  _$jscoverage['/page-break.js'].branchData['79'][1].ranCondition(result);
  return result;
}_$jscoverage['/page-break.js'].branchData['70'][1].init(584, 6, '!range');
function visit11_70_1(result) {
  _$jscoverage['/page-break.js'].branchData['70'][1].ranCondition(result);
  return result;
}_$jscoverage['/page-break.js'].branchData['68'][1].init(69, 25, 'sel && sel.getRanges()[0]');
function visit10_68_1(result) {
  _$jscoverage['/page-break.js'].branchData['68'][1].ranCondition(result);
  return result;
}_$jscoverage['/page-break.js'].branchData['44'][1].init(44, 121, '(/page-break-after\\s*:\\s*always/i).test(style) && (/display\\s*:\\s*none/i).test(childStyle)');
function visit9_44_1(result) {
  _$jscoverage['/page-break.js'].branchData['44'][1].ranCondition(result);
  return result;
}_$jscoverage['/page-break.js'].branchData['43'][1].init(710, 166, 'childStyle && (/page-break-after\\s*:\\s*always/i).test(style) && (/display\\s*:\\s*none/i).test(childStyle)');
function visit8_43_1(result) {
  _$jscoverage['/page-break.js'].branchData['43'][1].ranCondition(result);
  return result;
}_$jscoverage['/page-break.js'].branchData['40'][2].init(58, 24, 'child.nodeName == \'span\'');
function visit7_40_2(result) {
  _$jscoverage['/page-break.js'].branchData['40'][2].ranCondition(result);
  return result;
}_$jscoverage['/page-break.js'].branchData['40'][1].init(39, 86, '(child.nodeName == \'span\') && child.getAttribute("style")');
function visit6_40_1(result) {
  _$jscoverage['/page-break.js'].branchData['40'][1].ranCondition(result);
  return result;
}_$jscoverage['/page-break.js'].branchData['39'][1].init(551, 126, 'child && (child.nodeName == \'span\') && child.getAttribute("style")');
function visit5_39_1(result) {
  _$jscoverage['/page-break.js'].branchData['39'][1].ranCondition(result);
  return result;
}_$jscoverage['/page-break.js'].branchData['33'][1].init(38, 27, 'childNodes[i].nodeType == 1');
function visit4_33_1(result) {
  _$jscoverage['/page-break.js'].branchData['33'][1].ranCondition(result);
  return result;
}_$jscoverage['/page-break.js'].branchData['32'][1].init(112, 21, 'i < childNodes.length');
function visit3_32_1(result) {
  _$jscoverage['/page-break.js'].branchData['32'][1].ranCondition(result);
  return result;
}_$jscoverage['/page-break.js'].branchData['30'][1].init(136, 5, 'style');
function visit2_30_1(result) {
  _$jscoverage['/page-break.js'].branchData['30'][1].ranCondition(result);
  return result;
}_$jscoverage['/page-break.js'].branchData['22'][1].init(75, 41, 'dataProcessor && dataProcessor.dataFilter');
function visit1_22_1(result) {
  _$jscoverage['/page-break.js'].branchData['22'][1].ranCondition(result);
  return result;
}_$jscoverage['/page-break.js'].lineData[6]++;
KISSY.add("editor/plugin/page-break", function(S, Editor, fakeObjects) {
  _$jscoverage['/page-break.js'].functionData[0]++;
  _$jscoverage['/page-break.js'].lineData[7]++;
  var Node = S.Node, CLS = "ke_pagebreak", TYPE = "div", PAGE_BREAK_MARKUP = '<div' + ' style="page-break-after: always; ">' + '<span style="DISPLAY:none">&nbsp;</span>' + '</div>';
  _$jscoverage['/page-break.js'].lineData[15]++;
  function pageBreak() {
    _$jscoverage['/page-break.js'].functionData[1]++;
  }
  _$jscoverage['/page-break.js'].lineData[17]++;
  S.augment(pageBreak, {
  pluginRenderUI: function(editor) {
  _$jscoverage['/page-break.js'].functionData[2]++;
  _$jscoverage['/page-break.js'].lineData[19]++;
  fakeObjects.init(editor);
  _$jscoverage['/page-break.js'].lineData[21]++;
  var dataProcessor = editor.htmlDataProcessor, dataFilter = visit1_22_1(dataProcessor && dataProcessor.dataFilter);
  _$jscoverage['/page-break.js'].lineData[24]++;
  dataFilter.addRules({
  tags: {
  div: function(element) {
  _$jscoverage['/page-break.js'].functionData[3]++;
  _$jscoverage['/page-break.js'].lineData[27]++;
  var style = element.getAttribute("style"), child;
  _$jscoverage['/page-break.js'].lineData[30]++;
  if (visit2_30_1(style)) {
    _$jscoverage['/page-break.js'].lineData[31]++;
    var childNodes = element.childNodes;
    _$jscoverage['/page-break.js'].lineData[32]++;
    for (var i = 0; visit3_32_1(i < childNodes.length); i++) {
      _$jscoverage['/page-break.js'].lineData[33]++;
      if (visit4_33_1(childNodes[i].nodeType == 1)) {
        _$jscoverage['/page-break.js'].lineData[34]++;
        child = childNodes[i];
      }
    }
  }
  _$jscoverage['/page-break.js'].lineData[39]++;
  var childStyle = visit5_39_1(child && visit6_40_1((visit7_40_2(child.nodeName == 'span')) && child.getAttribute("style")));
  _$jscoverage['/page-break.js'].lineData[43]++;
  if (visit8_43_1(childStyle && visit9_44_1((/page-break-after\s*:\s*always/i).test(style) && (/display\s*:\s*none/i).test(childStyle)))) {
    _$jscoverage['/page-break.js'].lineData[46]++;
    return dataProcessor.createFakeParserElement(element, CLS, TYPE);
  }
  _$jscoverage['/page-break.js'].lineData[48]++;
  return undefined;
}}});
  _$jscoverage['/page-break.js'].lineData[53]++;
  editor.addButton("pageBreak", {
  tooltip: "\u5206\u9875", 
  listeners: {
  click: function() {
  _$jscoverage['/page-break.js'].functionData[4]++;
  _$jscoverage['/page-break.js'].lineData[57]++;
  var real = new Node(PAGE_BREAK_MARKUP, null, editor.get("document")[0]), substitute = editor.createFakeElement(real, CLS, TYPE, false, PAGE_BREAK_MARKUP);
  _$jscoverage['/page-break.js'].lineData[65]++;
  editor.focus();
  _$jscoverage['/page-break.js'].lineData[67]++;
  var sel = editor.getSelection(), range = visit10_68_1(sel && sel.getRanges()[0]);
  _$jscoverage['/page-break.js'].lineData[70]++;
  if (visit11_70_1(!range)) {
    _$jscoverage['/page-break.js'].lineData[71]++;
    return;
  }
  _$jscoverage['/page-break.js'].lineData[74]++;
  editor.execCommand("save");
  _$jscoverage['/page-break.js'].lineData[76]++;
  var start = range.startContainer, pre = start;
  _$jscoverage['/page-break.js'].lineData[79]++;
  while (visit12_79_1(start.nodeName() !== "body")) {
    _$jscoverage['/page-break.js'].lineData[80]++;
    pre = start;
    _$jscoverage['/page-break.js'].lineData[81]++;
    start = start.parent();
  }
  _$jscoverage['/page-break.js'].lineData[84]++;
  range.collapse(true);
  _$jscoverage['/page-break.js'].lineData[86]++;
  range.splitElement(pre);
  _$jscoverage['/page-break.js'].lineData[88]++;
  substitute.insertAfter(pre);
  _$jscoverage['/page-break.js'].lineData[90]++;
  editor.execCommand("save");
}}, 
  mode: Editor.Mode.WYSIWYG_MODE});
}});
  _$jscoverage['/page-break.js'].lineData[99]++;
  return pageBreak;
}, {
  "requires": ["editor", "./fake-objects"]});
