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
if (! _$jscoverage['/editor/elementPath.js']) {
  _$jscoverage['/editor/elementPath.js'] = {};
  _$jscoverage['/editor/elementPath.js'].lineData = [];
  _$jscoverage['/editor/elementPath.js'].lineData[10] = 0;
  _$jscoverage['/editor/elementPath.js'].lineData[11] = 0;
  _$jscoverage['/editor/elementPath.js'].lineData[12] = 0;
  _$jscoverage['/editor/elementPath.js'].lineData[13] = 0;
  _$jscoverage['/editor/elementPath.js'].lineData[15] = 0;
  _$jscoverage['/editor/elementPath.js'].lineData[52] = 0;
  _$jscoverage['/editor/elementPath.js'].lineData[53] = 0;
  _$jscoverage['/editor/elementPath.js'].lineData[54] = 0;
  _$jscoverage['/editor/elementPath.js'].lineData[55] = 0;
  _$jscoverage['/editor/elementPath.js'].lineData[57] = 0;
  _$jscoverage['/editor/elementPath.js'].lineData[60] = 0;
  _$jscoverage['/editor/elementPath.js'].lineData[67] = 0;
  _$jscoverage['/editor/elementPath.js'].lineData[68] = 0;
  _$jscoverage['/editor/elementPath.js'].lineData[74] = 0;
  _$jscoverage['/editor/elementPath.js'].lineData[75] = 0;
  _$jscoverage['/editor/elementPath.js'].lineData[76] = 0;
  _$jscoverage['/editor/elementPath.js'].lineData[77] = 0;
  _$jscoverage['/editor/elementPath.js'].lineData[80] = 0;
  _$jscoverage['/editor/elementPath.js'].lineData[82] = 0;
  _$jscoverage['/editor/elementPath.js'].lineData[83] = 0;
  _$jscoverage['/editor/elementPath.js'].lineData[84] = 0;
  _$jscoverage['/editor/elementPath.js'].lineData[86] = 0;
  _$jscoverage['/editor/elementPath.js'].lineData[89] = 0;
  _$jscoverage['/editor/elementPath.js'].lineData[90] = 0;
  _$jscoverage['/editor/elementPath.js'].lineData[93] = 0;
  _$jscoverage['/editor/elementPath.js'].lineData[98] = 0;
  _$jscoverage['/editor/elementPath.js'].lineData[99] = 0;
  _$jscoverage['/editor/elementPath.js'].lineData[100] = 0;
  _$jscoverage['/editor/elementPath.js'].lineData[103] = 0;
  _$jscoverage['/editor/elementPath.js'].lineData[106] = 0;
  _$jscoverage['/editor/elementPath.js'].lineData[107] = 0;
  _$jscoverage['/editor/elementPath.js'].lineData[108] = 0;
  _$jscoverage['/editor/elementPath.js'].lineData[111] = 0;
  _$jscoverage['/editor/elementPath.js'].lineData[121] = 0;
  _$jscoverage['/editor/elementPath.js'].lineData[122] = 0;
  _$jscoverage['/editor/elementPath.js'].lineData[124] = 0;
  _$jscoverage['/editor/elementPath.js'].lineData[125] = 0;
  _$jscoverage['/editor/elementPath.js'].lineData[128] = 0;
  _$jscoverage['/editor/elementPath.js'].lineData[129] = 0;
  _$jscoverage['/editor/elementPath.js'].lineData[130] = 0;
  _$jscoverage['/editor/elementPath.js'].lineData[134] = 0;
  _$jscoverage['/editor/elementPath.js'].lineData[138] = 0;
  _$jscoverage['/editor/elementPath.js'].lineData[139] = 0;
  _$jscoverage['/editor/elementPath.js'].lineData[140] = 0;
  _$jscoverage['/editor/elementPath.js'].lineData[141] = 0;
  _$jscoverage['/editor/elementPath.js'].lineData[144] = 0;
  _$jscoverage['/editor/elementPath.js'].lineData[147] = 0;
  _$jscoverage['/editor/elementPath.js'].lineData[148] = 0;
  _$jscoverage['/editor/elementPath.js'].lineData[149] = 0;
  _$jscoverage['/editor/elementPath.js'].lineData[151] = 0;
  _$jscoverage['/editor/elementPath.js'].lineData[154] = 0;
  _$jscoverage['/editor/elementPath.js'].lineData[156] = 0;
}
if (! _$jscoverage['/editor/elementPath.js'].functionData) {
  _$jscoverage['/editor/elementPath.js'].functionData = [];
  _$jscoverage['/editor/elementPath.js'].functionData[0] = 0;
  _$jscoverage['/editor/elementPath.js'].functionData[1] = 0;
  _$jscoverage['/editor/elementPath.js'].functionData[2] = 0;
  _$jscoverage['/editor/elementPath.js'].functionData[3] = 0;
  _$jscoverage['/editor/elementPath.js'].functionData[4] = 0;
  _$jscoverage['/editor/elementPath.js'].functionData[5] = 0;
}
if (! _$jscoverage['/editor/elementPath.js'].branchData) {
  _$jscoverage['/editor/elementPath.js'].branchData = {};
  _$jscoverage['/editor/elementPath.js'].branchData['53'] = [];
  _$jscoverage['/editor/elementPath.js'].branchData['53'][1] = new BranchData();
  _$jscoverage['/editor/elementPath.js'].branchData['55'] = [];
  _$jscoverage['/editor/elementPath.js'].branchData['55'][1] = new BranchData();
  _$jscoverage['/editor/elementPath.js'].branchData['55'][2] = new BranchData();
  _$jscoverage['/editor/elementPath.js'].branchData['75'] = [];
  _$jscoverage['/editor/elementPath.js'].branchData['75'][1] = new BranchData();
  _$jscoverage['/editor/elementPath.js'].branchData['76'] = [];
  _$jscoverage['/editor/elementPath.js'].branchData['76'][1] = new BranchData();
  _$jscoverage['/editor/elementPath.js'].branchData['82'] = [];
  _$jscoverage['/editor/elementPath.js'].branchData['82'][1] = new BranchData();
  _$jscoverage['/editor/elementPath.js'].branchData['83'] = [];
  _$jscoverage['/editor/elementPath.js'].branchData['83'][1] = new BranchData();
  _$jscoverage['/editor/elementPath.js'].branchData['86'] = [];
  _$jscoverage['/editor/elementPath.js'].branchData['86'][1] = new BranchData();
  _$jscoverage['/editor/elementPath.js'].branchData['89'] = [];
  _$jscoverage['/editor/elementPath.js'].branchData['89'][1] = new BranchData();
  _$jscoverage['/editor/elementPath.js'].branchData['89'][2] = new BranchData();
  _$jscoverage['/editor/elementPath.js'].branchData['89'][3] = new BranchData();
  _$jscoverage['/editor/elementPath.js'].branchData['99'] = [];
  _$jscoverage['/editor/elementPath.js'].branchData['99'][1] = new BranchData();
  _$jscoverage['/editor/elementPath.js'].branchData['122'] = [];
  _$jscoverage['/editor/elementPath.js'].branchData['122'][1] = new BranchData();
  _$jscoverage['/editor/elementPath.js'].branchData['124'] = [];
  _$jscoverage['/editor/elementPath.js'].branchData['124'][1] = new BranchData();
  _$jscoverage['/editor/elementPath.js'].branchData['124'][2] = new BranchData();
  _$jscoverage['/editor/elementPath.js'].branchData['128'] = [];
  _$jscoverage['/editor/elementPath.js'].branchData['128'][1] = new BranchData();
  _$jscoverage['/editor/elementPath.js'].branchData['129'] = [];
  _$jscoverage['/editor/elementPath.js'].branchData['129'][1] = new BranchData();
  _$jscoverage['/editor/elementPath.js'].branchData['139'] = [];
  _$jscoverage['/editor/elementPath.js'].branchData['139'][1] = new BranchData();
  _$jscoverage['/editor/elementPath.js'].branchData['140'] = [];
  _$jscoverage['/editor/elementPath.js'].branchData['140'][1] = new BranchData();
  _$jscoverage['/editor/elementPath.js'].branchData['148'] = [];
  _$jscoverage['/editor/elementPath.js'].branchData['148'][1] = new BranchData();
}
_$jscoverage['/editor/elementPath.js'].branchData['148'][1].init(84, 19, 'i < elements.length');
function visit295_148_1(result) {
  _$jscoverage['/editor/elementPath.js'].branchData['148'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/elementPath.js'].branchData['140'][1].init(21, 36, 'elements[i].nodeName() in tagNames');
function visit294_140_1(result) {
  _$jscoverage['/editor/elementPath.js'].branchData['140'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/elementPath.js'].branchData['139'][1].init(71, 19, 'i < elements.length');
function visit293_139_1(result) {
  _$jscoverage['/editor/elementPath.js'].branchData['139'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/elementPath.js'].branchData['129'][1].init(21, 50, '!Dom.equals(thisElements[i], otherElements[i])');
function visit292_129_1(result) {
  _$jscoverage['/editor/elementPath.js'].branchData['129'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/elementPath.js'].branchData['128'][1].init(267, 23, 'i < thisElements.length');
function visit291_128_1(result) {
  _$jscoverage['/editor/elementPath.js'].branchData['128'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/elementPath.js'].branchData['124'][2].init(147, 44, 'thisElements.length !== otherElements.length');
function visit290_124_2(result) {
  _$jscoverage['/editor/elementPath.js'].branchData['124'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/elementPath.js'].branchData['124'][1].init(129, 62, '!otherElements || thisElements.length !== otherElements.length');
function visit289_124_1(result) {
  _$jscoverage['/editor/elementPath.js'].branchData['124'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/elementPath.js'].branchData['122'][1].init(79, 31, 'otherPath && otherPath.elements');
function visit288_122_1(result) {
  _$jscoverage['/editor/elementPath.js'].branchData['122'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/elementPath.js'].branchData['99'][1].init(876, 22, 'elementName === \'body\'');
function visit287_99_1(result) {
  _$jscoverage['/editor/elementPath.js'].branchData['99'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/elementPath.js'].branchData['89'][3].init(194, 21, 'elementName === \'div\'');
function visit286_89_3(result) {
  _$jscoverage['/editor/elementPath.js'].branchData['89'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/elementPath.js'].branchData['89'][2].init(194, 42, 'elementName === \'div\' && !checkHasBlock(e)');
function visit285_89_2(result) {
  _$jscoverage['/editor/elementPath.js'].branchData['89'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/elementPath.js'].branchData['89'][1].init(184, 52, '!block && elementName === \'div\' && !checkHasBlock(e)');
function visit284_89_1(result) {
  _$jscoverage['/editor/elementPath.js'].branchData['89'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/elementPath.js'].branchData['86'][1].init(152, 37, 'pathBlockLimitElements[elementName]');
function visit283_86_1(result) {
  _$jscoverage['/editor/elementPath.js'].branchData['86'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/elementPath.js'].branchData['83'][1].init(25, 42, '!block && pathBlockElements[elementName]');
function visit282_83_1(result) {
  _$jscoverage['/editor/elementPath.js'].branchData['83'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/elementPath.js'].branchData['82'][1].init(171, 11, '!blockLimit');
function visit281_82_1(result) {
  _$jscoverage['/editor/elementPath.js'].branchData['82'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/elementPath.js'].branchData['76'][1].init(21, 17, '!this.lastElement');
function visit280_76_1(result) {
  _$jscoverage['/editor/elementPath.js'].branchData['76'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/elementPath.js'].branchData['75'][1].init(17, 43, 'e[0].nodeType === Dom.NodeType.ELEMENT_NODE');
function visit279_75_1(result) {
  _$jscoverage['/editor/elementPath.js'].branchData['75'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/elementPath.js'].branchData['55'][2].init(64, 44, 'child.nodeType === Dom.NodeType.ELEMENT_NODE');
function visit278_55_2(result) {
  _$jscoverage['/editor/elementPath.js'].branchData['55'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/elementPath.js'].branchData['55'][1].init(64, 110, 'child.nodeType === Dom.NodeType.ELEMENT_NODE && dtd.$block[child.nodeName.toLowerCase()]');
function visit277_55_1(result) {
  _$jscoverage['/editor/elementPath.js'].branchData['55'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/elementPath.js'].branchData['53'][1].init(108, 9, 'i < count');
function visit276_53_1(result) {
  _$jscoverage['/editor/elementPath.js'].branchData['53'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/elementPath.js'].lineData[10]++;
KISSY.add(function(S, require) {
  _$jscoverage['/editor/elementPath.js'].functionData[0]++;
  _$jscoverage['/editor/elementPath.js'].lineData[11]++;
  require('node');
  _$jscoverage['/editor/elementPath.js'].lineData[12]++;
  var Editor = require('./base');
  _$jscoverage['/editor/elementPath.js'].lineData[13]++;
  require('./dom');
  _$jscoverage['/editor/elementPath.js'].lineData[15]++;
  var Dom = S.DOM, dtd = Editor.XHTML_DTD, TRUE = true, FALSE = false, NULL = null, pathBlockElements = {
  'address': 1, 
  'blockquote': 1, 
  'dl': 1, 
  'h1': 1, 
  'h2': 1, 
  'h3': 1, 
  'h4': 1, 
  'h5': 1, 
  'h6': 1, 
  'p': 1, 
  'pre': 1, 
  'li': 1, 
  'dt': 1, 
  'dd': 1}, pathBlockLimitElements = {
  'body': 1, 
  'div': 1, 
  'table': 1, 
  'tbody': 1, 
  'tr': 1, 
  'td': 1, 
  'th': 1, 
  'caption': 1, 
  'form': 1}, checkHasBlock = function(element) {
  _$jscoverage['/editor/elementPath.js'].functionData[1]++;
  _$jscoverage['/editor/elementPath.js'].lineData[52]++;
  var childNodes = element[0].childNodes;
  _$jscoverage['/editor/elementPath.js'].lineData[53]++;
  for (var i = 0, count = childNodes.length; visit276_53_1(i < count); i++) {
    _$jscoverage['/editor/elementPath.js'].lineData[54]++;
    var child = childNodes[i];
    _$jscoverage['/editor/elementPath.js'].lineData[55]++;
    if (visit277_55_1(visit278_55_2(child.nodeType === Dom.NodeType.ELEMENT_NODE) && dtd.$block[child.nodeName.toLowerCase()])) {
      _$jscoverage['/editor/elementPath.js'].lineData[57]++;
      return TRUE;
    }
  }
  _$jscoverage['/editor/elementPath.js'].lineData[60]++;
  return FALSE;
};
  _$jscoverage['/editor/elementPath.js'].lineData[67]++;
  function ElementPath(lastNode) {
    _$jscoverage['/editor/elementPath.js'].functionData[2]++;
    _$jscoverage['/editor/elementPath.js'].lineData[68]++;
    var self = this, block = NULL, blockLimit = NULL, elements = [], e = lastNode;
    _$jscoverage['/editor/elementPath.js'].lineData[74]++;
    while (e) {
      _$jscoverage['/editor/elementPath.js'].lineData[75]++;
      if (visit279_75_1(e[0].nodeType === Dom.NodeType.ELEMENT_NODE)) {
        _$jscoverage['/editor/elementPath.js'].lineData[76]++;
        if (visit280_76_1(!this.lastElement)) {
          _$jscoverage['/editor/elementPath.js'].lineData[77]++;
          this.lastElement = e;
        }
        _$jscoverage['/editor/elementPath.js'].lineData[80]++;
        var elementName = e.nodeName();
        _$jscoverage['/editor/elementPath.js'].lineData[82]++;
        if (visit281_82_1(!blockLimit)) {
          _$jscoverage['/editor/elementPath.js'].lineData[83]++;
          if (visit282_83_1(!block && pathBlockElements[elementName])) {
            _$jscoverage['/editor/elementPath.js'].lineData[84]++;
            block = e;
          }
          _$jscoverage['/editor/elementPath.js'].lineData[86]++;
          if (visit283_86_1(pathBlockLimitElements[elementName])) {
            _$jscoverage['/editor/elementPath.js'].lineData[89]++;
            if (visit284_89_1(!block && visit285_89_2(visit286_89_3(elementName === 'div') && !checkHasBlock(e)))) {
              _$jscoverage['/editor/elementPath.js'].lineData[90]++;
              block = e;
            } else {
              _$jscoverage['/editor/elementPath.js'].lineData[93]++;
              blockLimit = e;
            }
          }
        }
        _$jscoverage['/editor/elementPath.js'].lineData[98]++;
        elements.push(e);
        _$jscoverage['/editor/elementPath.js'].lineData[99]++;
        if (visit287_99_1(elementName === 'body')) {
          _$jscoverage['/editor/elementPath.js'].lineData[100]++;
          break;
        }
      }
      _$jscoverage['/editor/elementPath.js'].lineData[103]++;
      e = e.parent();
    }
    _$jscoverage['/editor/elementPath.js'].lineData[106]++;
    self.block = block;
    _$jscoverage['/editor/elementPath.js'].lineData[107]++;
    self.blockLimit = blockLimit;
    _$jscoverage['/editor/elementPath.js'].lineData[108]++;
    self.elements = elements;
  }
  _$jscoverage['/editor/elementPath.js'].lineData[111]++;
  ElementPath.prototype = {
  constructor: ElementPath, 
  compare: function(otherPath) {
  _$jscoverage['/editor/elementPath.js'].functionData[3]++;
  _$jscoverage['/editor/elementPath.js'].lineData[121]++;
  var thisElements = this.elements;
  _$jscoverage['/editor/elementPath.js'].lineData[122]++;
  var otherElements = visit288_122_1(otherPath && otherPath.elements);
  _$jscoverage['/editor/elementPath.js'].lineData[124]++;
  if (visit289_124_1(!otherElements || visit290_124_2(thisElements.length !== otherElements.length))) {
    _$jscoverage['/editor/elementPath.js'].lineData[125]++;
    return FALSE;
  }
  _$jscoverage['/editor/elementPath.js'].lineData[128]++;
  for (var i = 0; visit291_128_1(i < thisElements.length); i++) {
    _$jscoverage['/editor/elementPath.js'].lineData[129]++;
    if (visit292_129_1(!Dom.equals(thisElements[i], otherElements[i]))) {
      _$jscoverage['/editor/elementPath.js'].lineData[130]++;
      return FALSE;
    }
  }
  _$jscoverage['/editor/elementPath.js'].lineData[134]++;
  return TRUE;
}, 
  contains: function(tagNames) {
  _$jscoverage['/editor/elementPath.js'].functionData[4]++;
  _$jscoverage['/editor/elementPath.js'].lineData[138]++;
  var elements = this.elements;
  _$jscoverage['/editor/elementPath.js'].lineData[139]++;
  for (var i = 0; visit293_139_1(i < elements.length); i++) {
    _$jscoverage['/editor/elementPath.js'].lineData[140]++;
    if (visit294_140_1(elements[i].nodeName() in tagNames)) {
      _$jscoverage['/editor/elementPath.js'].lineData[141]++;
      return elements[i];
    }
  }
  _$jscoverage['/editor/elementPath.js'].lineData[144]++;
  return NULL;
}, 
  toString: function() {
  _$jscoverage['/editor/elementPath.js'].functionData[5]++;
  _$jscoverage['/editor/elementPath.js'].lineData[147]++;
  var elements = this.elements, i, elNames = [];
  _$jscoverage['/editor/elementPath.js'].lineData[148]++;
  for (i = 0; visit295_148_1(i < elements.length); i++) {
    _$jscoverage['/editor/elementPath.js'].lineData[149]++;
    elNames.push(elements[i].nodeName());
  }
  _$jscoverage['/editor/elementPath.js'].lineData[151]++;
  return elNames.toString();
}};
  _$jscoverage['/editor/elementPath.js'].lineData[154]++;
  Editor.ElementPath = ElementPath;
  _$jscoverage['/editor/elementPath.js'].lineData[156]++;
  return ElementPath;
});
