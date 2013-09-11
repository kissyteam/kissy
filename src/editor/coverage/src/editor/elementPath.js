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
  _$jscoverage['/editor/elementPath.js'].lineData[48] = 0;
  _$jscoverage['/editor/elementPath.js'].lineData[49] = 0;
  _$jscoverage['/editor/elementPath.js'].lineData[50] = 0;
  _$jscoverage['/editor/elementPath.js'].lineData[51] = 0;
  _$jscoverage['/editor/elementPath.js'].lineData[53] = 0;
  _$jscoverage['/editor/elementPath.js'].lineData[55] = 0;
  _$jscoverage['/editor/elementPath.js'].lineData[62] = 0;
  _$jscoverage['/editor/elementPath.js'].lineData[63] = 0;
  _$jscoverage['/editor/elementPath.js'].lineData[69] = 0;
  _$jscoverage['/editor/elementPath.js'].lineData[70] = 0;
  _$jscoverage['/editor/elementPath.js'].lineData[71] = 0;
  _$jscoverage['/editor/elementPath.js'].lineData[72] = 0;
  _$jscoverage['/editor/elementPath.js'].lineData[74] = 0;
  _$jscoverage['/editor/elementPath.js'].lineData[76] = 0;
  _$jscoverage['/editor/elementPath.js'].lineData[77] = 0;
  _$jscoverage['/editor/elementPath.js'].lineData[78] = 0;
  _$jscoverage['/editor/elementPath.js'].lineData[80] = 0;
  _$jscoverage['/editor/elementPath.js'].lineData[83] = 0;
  _$jscoverage['/editor/elementPath.js'].lineData[84] = 0;
  _$jscoverage['/editor/elementPath.js'].lineData[86] = 0;
  _$jscoverage['/editor/elementPath.js'].lineData[90] = 0;
  _$jscoverage['/editor/elementPath.js'].lineData[91] = 0;
  _$jscoverage['/editor/elementPath.js'].lineData[92] = 0;
  _$jscoverage['/editor/elementPath.js'].lineData[95] = 0;
  _$jscoverage['/editor/elementPath.js'].lineData[98] = 0;
  _$jscoverage['/editor/elementPath.js'].lineData[99] = 0;
  _$jscoverage['/editor/elementPath.js'].lineData[100] = 0;
  _$jscoverage['/editor/elementPath.js'].lineData[103] = 0;
  _$jscoverage['/editor/elementPath.js'].lineData[113] = 0;
  _$jscoverage['/editor/elementPath.js'].lineData[114] = 0;
  _$jscoverage['/editor/elementPath.js'].lineData[116] = 0;
  _$jscoverage['/editor/elementPath.js'].lineData[117] = 0;
  _$jscoverage['/editor/elementPath.js'].lineData[119] = 0;
  _$jscoverage['/editor/elementPath.js'].lineData[120] = 0;
  _$jscoverage['/editor/elementPath.js'].lineData[121] = 0;
  _$jscoverage['/editor/elementPath.js'].lineData[124] = 0;
  _$jscoverage['/editor/elementPath.js'].lineData[128] = 0;
  _$jscoverage['/editor/elementPath.js'].lineData[129] = 0;
  _$jscoverage['/editor/elementPath.js'].lineData[130] = 0;
  _$jscoverage['/editor/elementPath.js'].lineData[131] = 0;
  _$jscoverage['/editor/elementPath.js'].lineData[133] = 0;
  _$jscoverage['/editor/elementPath.js'].lineData[136] = 0;
  _$jscoverage['/editor/elementPath.js'].lineData[137] = 0;
  _$jscoverage['/editor/elementPath.js'].lineData[138] = 0;
  _$jscoverage['/editor/elementPath.js'].lineData[140] = 0;
  _$jscoverage['/editor/elementPath.js'].lineData[143] = 0;
  _$jscoverage['/editor/elementPath.js'].lineData[145] = 0;
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
  _$jscoverage['/editor/elementPath.js'].branchData['49'] = [];
  _$jscoverage['/editor/elementPath.js'].branchData['49'][1] = new BranchData();
  _$jscoverage['/editor/elementPath.js'].branchData['51'] = [];
  _$jscoverage['/editor/elementPath.js'].branchData['51'][1] = new BranchData();
  _$jscoverage['/editor/elementPath.js'].branchData['51'][2] = new BranchData();
  _$jscoverage['/editor/elementPath.js'].branchData['70'] = [];
  _$jscoverage['/editor/elementPath.js'].branchData['70'][1] = new BranchData();
  _$jscoverage['/editor/elementPath.js'].branchData['71'] = [];
  _$jscoverage['/editor/elementPath.js'].branchData['71'][1] = new BranchData();
  _$jscoverage['/editor/elementPath.js'].branchData['76'] = [];
  _$jscoverage['/editor/elementPath.js'].branchData['76'][1] = new BranchData();
  _$jscoverage['/editor/elementPath.js'].branchData['77'] = [];
  _$jscoverage['/editor/elementPath.js'].branchData['77'][1] = new BranchData();
  _$jscoverage['/editor/elementPath.js'].branchData['80'] = [];
  _$jscoverage['/editor/elementPath.js'].branchData['80'][1] = new BranchData();
  _$jscoverage['/editor/elementPath.js'].branchData['83'] = [];
  _$jscoverage['/editor/elementPath.js'].branchData['83'][1] = new BranchData();
  _$jscoverage['/editor/elementPath.js'].branchData['83'][2] = new BranchData();
  _$jscoverage['/editor/elementPath.js'].branchData['83'][3] = new BranchData();
  _$jscoverage['/editor/elementPath.js'].branchData['91'] = [];
  _$jscoverage['/editor/elementPath.js'].branchData['91'][1] = new BranchData();
  _$jscoverage['/editor/elementPath.js'].branchData['114'] = [];
  _$jscoverage['/editor/elementPath.js'].branchData['114'][1] = new BranchData();
  _$jscoverage['/editor/elementPath.js'].branchData['116'] = [];
  _$jscoverage['/editor/elementPath.js'].branchData['116'][1] = new BranchData();
  _$jscoverage['/editor/elementPath.js'].branchData['116'][2] = new BranchData();
  _$jscoverage['/editor/elementPath.js'].branchData['119'] = [];
  _$jscoverage['/editor/elementPath.js'].branchData['119'][1] = new BranchData();
  _$jscoverage['/editor/elementPath.js'].branchData['120'] = [];
  _$jscoverage['/editor/elementPath.js'].branchData['120'][1] = new BranchData();
  _$jscoverage['/editor/elementPath.js'].branchData['129'] = [];
  _$jscoverage['/editor/elementPath.js'].branchData['129'][1] = new BranchData();
  _$jscoverage['/editor/elementPath.js'].branchData['130'] = [];
  _$jscoverage['/editor/elementPath.js'].branchData['130'][1] = new BranchData();
  _$jscoverage['/editor/elementPath.js'].branchData['137'] = [];
  _$jscoverage['/editor/elementPath.js'].branchData['137'][1] = new BranchData();
}
_$jscoverage['/editor/elementPath.js'].branchData['137'][1].init(86, 19, 'i < elements.length');
function visit294_137_1(result) {
  _$jscoverage['/editor/elementPath.js'].branchData['137'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/elementPath.js'].branchData['130'][1].init(22, 36, 'elements[i].nodeName() in tagNames');
function visit293_130_1(result) {
  _$jscoverage['/editor/elementPath.js'].branchData['130'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/elementPath.js'].branchData['129'][1].init(73, 19, 'i < elements.length');
function visit292_129_1(result) {
  _$jscoverage['/editor/elementPath.js'].branchData['129'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/elementPath.js'].branchData['120'][1].init(22, 50, '!Dom.equals(thisElements[i], otherElements[i])');
function visit291_120_1(result) {
  _$jscoverage['/editor/elementPath.js'].branchData['120'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/elementPath.js'].branchData['119'][1].init(258, 23, 'i < thisElements.length');
function visit290_119_1(result) {
  _$jscoverage['/editor/elementPath.js'].branchData['119'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/elementPath.js'].branchData['116'][2].init(151, 43, 'thisElements.length != otherElements.length');
function visit289_116_2(result) {
  _$jscoverage['/editor/elementPath.js'].branchData['116'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/elementPath.js'].branchData['116'][1].init(133, 61, '!otherElements || thisElements.length != otherElements.length');
function visit288_116_1(result) {
  _$jscoverage['/editor/elementPath.js'].branchData['116'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/elementPath.js'].branchData['114'][1].init(81, 31, 'otherPath && otherPath.elements');
function visit287_114_1(result) {
  _$jscoverage['/editor/elementPath.js'].branchData['114'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/elementPath.js'].branchData['91'][1].init(823, 21, 'elementName == \'body\'');
function visit286_91_1(result) {
  _$jscoverage['/editor/elementPath.js'].branchData['91'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/elementPath.js'].branchData['83'][3].init(197, 20, 'elementName == \'div\'');
function visit285_83_3(result) {
  _$jscoverage['/editor/elementPath.js'].branchData['83'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/elementPath.js'].branchData['83'][2].init(197, 41, 'elementName == \'div\' && !checkHasBlock(e)');
function visit284_83_2(result) {
  _$jscoverage['/editor/elementPath.js'].branchData['83'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/elementPath.js'].branchData['83'][1].init(187, 51, '!block && elementName == \'div\' && !checkHasBlock(e)');
function visit283_83_1(result) {
  _$jscoverage['/editor/elementPath.js'].branchData['83'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/elementPath.js'].branchData['80'][1].init(156, 37, 'pathBlockLimitElements[elementName]');
function visit282_80_1(result) {
  _$jscoverage['/editor/elementPath.js'].branchData['80'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/elementPath.js'].branchData['77'][1].init(26, 42, '!block && pathBlockElements[elementName]');
function visit281_77_1(result) {
  _$jscoverage['/editor/elementPath.js'].branchData['77'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/elementPath.js'].branchData['76'][1].init(158, 11, '!blockLimit');
function visit280_76_1(result) {
  _$jscoverage['/editor/elementPath.js'].branchData['76'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/elementPath.js'].branchData['71'][1].init(22, 17, '!this.lastElement');
function visit279_71_1(result) {
  _$jscoverage['/editor/elementPath.js'].branchData['71'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/elementPath.js'].branchData['70'][1].init(18, 42, 'e[0].nodeType == Dom.NodeType.ELEMENT_NODE');
function visit278_70_1(result) {
  _$jscoverage['/editor/elementPath.js'].branchData['70'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/elementPath.js'].branchData['51'][2].init(66, 43, 'child.nodeType == Dom.NodeType.ELEMENT_NODE');
function visit277_51_2(result) {
  _$jscoverage['/editor/elementPath.js'].branchData['51'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/elementPath.js'].branchData['51'][1].init(66, 110, 'child.nodeType == Dom.NodeType.ELEMENT_NODE && dtd.$block[child.nodeName.toLowerCase()]');
function visit276_51_1(result) {
  _$jscoverage['/editor/elementPath.js'].branchData['51'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/elementPath.js'].branchData['49'][1].init(110, 9, 'i < count');
function visit275_49_1(result) {
  _$jscoverage['/editor/elementPath.js'].branchData['49'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/elementPath.js'].lineData[10]++;
KISSY.add("editor/elementPath", function(S, Editor) {
  _$jscoverage['/editor/elementPath.js'].functionData[0]++;
  _$jscoverage['/editor/elementPath.js'].lineData[11]++;
  var Dom = S.DOM, dtd = Editor.XHTML_DTD, TRUE = true, FALSE = false, NULL = null, pathBlockElements = {
  "address": 1, 
  "blockquote": 1, 
  "dl": 1, 
  "h1": 1, 
  "h2": 1, 
  "h3": 1, 
  "h4": 1, 
  "h5": 1, 
  "h6": 1, 
  "p": 1, 
  "pre": 1, 
  "li": 1, 
  "dt": 1, 
  "dd": 1}, pathBlockLimitElements = {
  "body": 1, 
  "div": 1, 
  "table": 1, 
  "tbody": 1, 
  "tr": 1, 
  "td": 1, 
  "th": 1, 
  "caption": 1, 
  "form": 1}, checkHasBlock = function(element) {
  _$jscoverage['/editor/elementPath.js'].functionData[1]++;
  _$jscoverage['/editor/elementPath.js'].lineData[48]++;
  var childNodes = element[0].childNodes;
  _$jscoverage['/editor/elementPath.js'].lineData[49]++;
  for (var i = 0, count = childNodes.length; visit275_49_1(i < count); i++) {
    _$jscoverage['/editor/elementPath.js'].lineData[50]++;
    var child = childNodes[i];
    _$jscoverage['/editor/elementPath.js'].lineData[51]++;
    if (visit276_51_1(visit277_51_2(child.nodeType == Dom.NodeType.ELEMENT_NODE) && dtd.$block[child.nodeName.toLowerCase()])) {
      _$jscoverage['/editor/elementPath.js'].lineData[53]++;
      return TRUE;
    }
  }
  _$jscoverage['/editor/elementPath.js'].lineData[55]++;
  return FALSE;
};
  _$jscoverage['/editor/elementPath.js'].lineData[62]++;
  function ElementPath(lastNode) {
    _$jscoverage['/editor/elementPath.js'].functionData[2]++;
    _$jscoverage['/editor/elementPath.js'].lineData[63]++;
    var self = this, block = NULL, blockLimit = NULL, elements = [], e = lastNode;
    _$jscoverage['/editor/elementPath.js'].lineData[69]++;
    while (e) {
      _$jscoverage['/editor/elementPath.js'].lineData[70]++;
      if (visit278_70_1(e[0].nodeType == Dom.NodeType.ELEMENT_NODE)) {
        _$jscoverage['/editor/elementPath.js'].lineData[71]++;
        if (visit279_71_1(!this.lastElement)) {
          _$jscoverage['/editor/elementPath.js'].lineData[72]++;
          this.lastElement = e;
        }
        _$jscoverage['/editor/elementPath.js'].lineData[74]++;
        var elementName = e.nodeName();
        _$jscoverage['/editor/elementPath.js'].lineData[76]++;
        if (visit280_76_1(!blockLimit)) {
          _$jscoverage['/editor/elementPath.js'].lineData[77]++;
          if (visit281_77_1(!block && pathBlockElements[elementName])) {
            _$jscoverage['/editor/elementPath.js'].lineData[78]++;
            block = e;
          }
          _$jscoverage['/editor/elementPath.js'].lineData[80]++;
          if (visit282_80_1(pathBlockLimitElements[elementName])) {
            _$jscoverage['/editor/elementPath.js'].lineData[83]++;
            if (visit283_83_1(!block && visit284_83_2(visit285_83_3(elementName == 'div') && !checkHasBlock(e)))) {
              _$jscoverage['/editor/elementPath.js'].lineData[84]++;
              block = e;
            } else {
              _$jscoverage['/editor/elementPath.js'].lineData[86]++;
              blockLimit = e;
            }
          }
        }
        _$jscoverage['/editor/elementPath.js'].lineData[90]++;
        elements.push(e);
        _$jscoverage['/editor/elementPath.js'].lineData[91]++;
        if (visit286_91_1(elementName == 'body')) {
          _$jscoverage['/editor/elementPath.js'].lineData[92]++;
          break;
        }
      }
      _$jscoverage['/editor/elementPath.js'].lineData[95]++;
      e = e.parent();
    }
    _$jscoverage['/editor/elementPath.js'].lineData[98]++;
    self.block = block;
    _$jscoverage['/editor/elementPath.js'].lineData[99]++;
    self.blockLimit = blockLimit;
    _$jscoverage['/editor/elementPath.js'].lineData[100]++;
    self.elements = elements;
  }
  _$jscoverage['/editor/elementPath.js'].lineData[103]++;
  ElementPath.prototype = {
  constructor: ElementPath, 
  compare: function(otherPath) {
  _$jscoverage['/editor/elementPath.js'].functionData[3]++;
  _$jscoverage['/editor/elementPath.js'].lineData[113]++;
  var thisElements = this.elements;
  _$jscoverage['/editor/elementPath.js'].lineData[114]++;
  var otherElements = visit287_114_1(otherPath && otherPath.elements);
  _$jscoverage['/editor/elementPath.js'].lineData[116]++;
  if (visit288_116_1(!otherElements || visit289_116_2(thisElements.length != otherElements.length))) {
    _$jscoverage['/editor/elementPath.js'].lineData[117]++;
    return FALSE;
  }
  _$jscoverage['/editor/elementPath.js'].lineData[119]++;
  for (var i = 0; visit290_119_1(i < thisElements.length); i++) {
    _$jscoverage['/editor/elementPath.js'].lineData[120]++;
    if (visit291_120_1(!Dom.equals(thisElements[i], otherElements[i]))) {
      _$jscoverage['/editor/elementPath.js'].lineData[121]++;
      return FALSE;
    }
  }
  _$jscoverage['/editor/elementPath.js'].lineData[124]++;
  return TRUE;
}, 
  contains: function(tagNames) {
  _$jscoverage['/editor/elementPath.js'].functionData[4]++;
  _$jscoverage['/editor/elementPath.js'].lineData[128]++;
  var elements = this.elements;
  _$jscoverage['/editor/elementPath.js'].lineData[129]++;
  for (var i = 0; visit292_129_1(i < elements.length); i++) {
    _$jscoverage['/editor/elementPath.js'].lineData[130]++;
    if (visit293_130_1(elements[i].nodeName() in tagNames)) {
      _$jscoverage['/editor/elementPath.js'].lineData[131]++;
      return elements[i];
    }
  }
  _$jscoverage['/editor/elementPath.js'].lineData[133]++;
  return NULL;
}, 
  toString: function() {
  _$jscoverage['/editor/elementPath.js'].functionData[5]++;
  _$jscoverage['/editor/elementPath.js'].lineData[136]++;
  var elements = this.elements, i, elNames = [];
  _$jscoverage['/editor/elementPath.js'].lineData[137]++;
  for (i = 0; visit294_137_1(i < elements.length); i++) {
    _$jscoverage['/editor/elementPath.js'].lineData[138]++;
    elNames.push(elements[i].nodeName());
  }
  _$jscoverage['/editor/elementPath.js'].lineData[140]++;
  return elNames.toString();
}};
  _$jscoverage['/editor/elementPath.js'].lineData[143]++;
  Editor.ElementPath = ElementPath;
  _$jscoverage['/editor/elementPath.js'].lineData[145]++;
  return ElementPath;
}, {
  requires: ['./base', './dom', 'node']});
