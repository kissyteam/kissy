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
  _$jscoverage['/editor/elementPath.js'].lineData[59] = 0;
  _$jscoverage['/editor/elementPath.js'].lineData[66] = 0;
  _$jscoverage['/editor/elementPath.js'].lineData[67] = 0;
  _$jscoverage['/editor/elementPath.js'].lineData[73] = 0;
  _$jscoverage['/editor/elementPath.js'].lineData[74] = 0;
  _$jscoverage['/editor/elementPath.js'].lineData[75] = 0;
  _$jscoverage['/editor/elementPath.js'].lineData[76] = 0;
  _$jscoverage['/editor/elementPath.js'].lineData[78] = 0;
  _$jscoverage['/editor/elementPath.js'].lineData[80] = 0;
  _$jscoverage['/editor/elementPath.js'].lineData[81] = 0;
  _$jscoverage['/editor/elementPath.js'].lineData[82] = 0;
  _$jscoverage['/editor/elementPath.js'].lineData[84] = 0;
  _$jscoverage['/editor/elementPath.js'].lineData[87] = 0;
  _$jscoverage['/editor/elementPath.js'].lineData[88] = 0;
  _$jscoverage['/editor/elementPath.js'].lineData[90] = 0;
  _$jscoverage['/editor/elementPath.js'].lineData[94] = 0;
  _$jscoverage['/editor/elementPath.js'].lineData[95] = 0;
  _$jscoverage['/editor/elementPath.js'].lineData[96] = 0;
  _$jscoverage['/editor/elementPath.js'].lineData[99] = 0;
  _$jscoverage['/editor/elementPath.js'].lineData[102] = 0;
  _$jscoverage['/editor/elementPath.js'].lineData[103] = 0;
  _$jscoverage['/editor/elementPath.js'].lineData[104] = 0;
  _$jscoverage['/editor/elementPath.js'].lineData[107] = 0;
  _$jscoverage['/editor/elementPath.js'].lineData[117] = 0;
  _$jscoverage['/editor/elementPath.js'].lineData[118] = 0;
  _$jscoverage['/editor/elementPath.js'].lineData[120] = 0;
  _$jscoverage['/editor/elementPath.js'].lineData[121] = 0;
  _$jscoverage['/editor/elementPath.js'].lineData[123] = 0;
  _$jscoverage['/editor/elementPath.js'].lineData[124] = 0;
  _$jscoverage['/editor/elementPath.js'].lineData[125] = 0;
  _$jscoverage['/editor/elementPath.js'].lineData[128] = 0;
  _$jscoverage['/editor/elementPath.js'].lineData[132] = 0;
  _$jscoverage['/editor/elementPath.js'].lineData[133] = 0;
  _$jscoverage['/editor/elementPath.js'].lineData[134] = 0;
  _$jscoverage['/editor/elementPath.js'].lineData[135] = 0;
  _$jscoverage['/editor/elementPath.js'].lineData[137] = 0;
  _$jscoverage['/editor/elementPath.js'].lineData[140] = 0;
  _$jscoverage['/editor/elementPath.js'].lineData[141] = 0;
  _$jscoverage['/editor/elementPath.js'].lineData[142] = 0;
  _$jscoverage['/editor/elementPath.js'].lineData[144] = 0;
  _$jscoverage['/editor/elementPath.js'].lineData[147] = 0;
  _$jscoverage['/editor/elementPath.js'].lineData[149] = 0;
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
  _$jscoverage['/editor/elementPath.js'].branchData['74'] = [];
  _$jscoverage['/editor/elementPath.js'].branchData['74'][1] = new BranchData();
  _$jscoverage['/editor/elementPath.js'].branchData['75'] = [];
  _$jscoverage['/editor/elementPath.js'].branchData['75'][1] = new BranchData();
  _$jscoverage['/editor/elementPath.js'].branchData['80'] = [];
  _$jscoverage['/editor/elementPath.js'].branchData['80'][1] = new BranchData();
  _$jscoverage['/editor/elementPath.js'].branchData['81'] = [];
  _$jscoverage['/editor/elementPath.js'].branchData['81'][1] = new BranchData();
  _$jscoverage['/editor/elementPath.js'].branchData['84'] = [];
  _$jscoverage['/editor/elementPath.js'].branchData['84'][1] = new BranchData();
  _$jscoverage['/editor/elementPath.js'].branchData['87'] = [];
  _$jscoverage['/editor/elementPath.js'].branchData['87'][1] = new BranchData();
  _$jscoverage['/editor/elementPath.js'].branchData['87'][2] = new BranchData();
  _$jscoverage['/editor/elementPath.js'].branchData['87'][3] = new BranchData();
  _$jscoverage['/editor/elementPath.js'].branchData['95'] = [];
  _$jscoverage['/editor/elementPath.js'].branchData['95'][1] = new BranchData();
  _$jscoverage['/editor/elementPath.js'].branchData['118'] = [];
  _$jscoverage['/editor/elementPath.js'].branchData['118'][1] = new BranchData();
  _$jscoverage['/editor/elementPath.js'].branchData['120'] = [];
  _$jscoverage['/editor/elementPath.js'].branchData['120'][1] = new BranchData();
  _$jscoverage['/editor/elementPath.js'].branchData['120'][2] = new BranchData();
  _$jscoverage['/editor/elementPath.js'].branchData['123'] = [];
  _$jscoverage['/editor/elementPath.js'].branchData['123'][1] = new BranchData();
  _$jscoverage['/editor/elementPath.js'].branchData['124'] = [];
  _$jscoverage['/editor/elementPath.js'].branchData['124'][1] = new BranchData();
  _$jscoverage['/editor/elementPath.js'].branchData['133'] = [];
  _$jscoverage['/editor/elementPath.js'].branchData['133'][1] = new BranchData();
  _$jscoverage['/editor/elementPath.js'].branchData['134'] = [];
  _$jscoverage['/editor/elementPath.js'].branchData['134'][1] = new BranchData();
  _$jscoverage['/editor/elementPath.js'].branchData['141'] = [];
  _$jscoverage['/editor/elementPath.js'].branchData['141'][1] = new BranchData();
}
_$jscoverage['/editor/elementPath.js'].branchData['141'][1].init(84, 19, 'i < elements.length');
function visit294_141_1(result) {
  _$jscoverage['/editor/elementPath.js'].branchData['141'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/elementPath.js'].branchData['134'][1].init(21, 36, 'elements[i].nodeName() in tagNames');
function visit293_134_1(result) {
  _$jscoverage['/editor/elementPath.js'].branchData['134'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/elementPath.js'].branchData['133'][1].init(71, 19, 'i < elements.length');
function visit292_133_1(result) {
  _$jscoverage['/editor/elementPath.js'].branchData['133'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/elementPath.js'].branchData['124'][1].init(21, 50, '!Dom.equals(thisElements[i], otherElements[i])');
function visit291_124_1(result) {
  _$jscoverage['/editor/elementPath.js'].branchData['124'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/elementPath.js'].branchData['123'][1].init(251, 23, 'i < thisElements.length');
function visit290_123_1(result) {
  _$jscoverage['/editor/elementPath.js'].branchData['123'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/elementPath.js'].branchData['120'][2].init(147, 43, 'thisElements.length != otherElements.length');
function visit289_120_2(result) {
  _$jscoverage['/editor/elementPath.js'].branchData['120'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/elementPath.js'].branchData['120'][1].init(129, 61, '!otherElements || thisElements.length != otherElements.length');
function visit288_120_1(result) {
  _$jscoverage['/editor/elementPath.js'].branchData['120'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/elementPath.js'].branchData['118'][1].init(79, 31, 'otherPath && otherPath.elements');
function visit287_118_1(result) {
  _$jscoverage['/editor/elementPath.js'].branchData['118'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/elementPath.js'].branchData['95'][1].init(802, 21, 'elementName == \'body\'');
function visit286_95_1(result) {
  _$jscoverage['/editor/elementPath.js'].branchData['95'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/elementPath.js'].branchData['87'][3].init(194, 20, 'elementName == \'div\'');
function visit285_87_3(result) {
  _$jscoverage['/editor/elementPath.js'].branchData['87'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/elementPath.js'].branchData['87'][2].init(194, 41, 'elementName == \'div\' && !checkHasBlock(e)');
function visit284_87_2(result) {
  _$jscoverage['/editor/elementPath.js'].branchData['87'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/elementPath.js'].branchData['87'][1].init(184, 51, '!block && elementName == \'div\' && !checkHasBlock(e)');
function visit283_87_1(result) {
  _$jscoverage['/editor/elementPath.js'].branchData['87'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/elementPath.js'].branchData['84'][1].init(152, 37, 'pathBlockLimitElements[elementName]');
function visit282_84_1(result) {
  _$jscoverage['/editor/elementPath.js'].branchData['84'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/elementPath.js'].branchData['81'][1].init(25, 42, '!block && pathBlockElements[elementName]');
function visit281_81_1(result) {
  _$jscoverage['/editor/elementPath.js'].branchData['81'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/elementPath.js'].branchData['80'][1].init(152, 11, '!blockLimit');
function visit280_80_1(result) {
  _$jscoverage['/editor/elementPath.js'].branchData['80'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/elementPath.js'].branchData['75'][1].init(21, 17, '!this.lastElement');
function visit279_75_1(result) {
  _$jscoverage['/editor/elementPath.js'].branchData['75'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/elementPath.js'].branchData['74'][1].init(17, 42, 'e[0].nodeType == Dom.NodeType.ELEMENT_NODE');
function visit278_74_1(result) {
  _$jscoverage['/editor/elementPath.js'].branchData['74'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/elementPath.js'].branchData['55'][2].init(64, 43, 'child.nodeType == Dom.NodeType.ELEMENT_NODE');
function visit277_55_2(result) {
  _$jscoverage['/editor/elementPath.js'].branchData['55'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/elementPath.js'].branchData['55'][1].init(64, 109, 'child.nodeType == Dom.NodeType.ELEMENT_NODE && dtd.$block[child.nodeName.toLowerCase()]');
function visit276_55_1(result) {
  _$jscoverage['/editor/elementPath.js'].branchData['55'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/elementPath.js'].branchData['53'][1].init(108, 9, 'i < count');
function visit275_53_1(result) {
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
  _$jscoverage['/editor/elementPath.js'].lineData[52]++;
  var childNodes = element[0].childNodes;
  _$jscoverage['/editor/elementPath.js'].lineData[53]++;
  for (var i = 0, count = childNodes.length; visit275_53_1(i < count); i++) {
    _$jscoverage['/editor/elementPath.js'].lineData[54]++;
    var child = childNodes[i];
    _$jscoverage['/editor/elementPath.js'].lineData[55]++;
    if (visit276_55_1(visit277_55_2(child.nodeType == Dom.NodeType.ELEMENT_NODE) && dtd.$block[child.nodeName.toLowerCase()])) {
      _$jscoverage['/editor/elementPath.js'].lineData[57]++;
      return TRUE;
    }
  }
  _$jscoverage['/editor/elementPath.js'].lineData[59]++;
  return FALSE;
};
  _$jscoverage['/editor/elementPath.js'].lineData[66]++;
  function ElementPath(lastNode) {
    _$jscoverage['/editor/elementPath.js'].functionData[2]++;
    _$jscoverage['/editor/elementPath.js'].lineData[67]++;
    var self = this, block = NULL, blockLimit = NULL, elements = [], e = lastNode;
    _$jscoverage['/editor/elementPath.js'].lineData[73]++;
    while (e) {
      _$jscoverage['/editor/elementPath.js'].lineData[74]++;
      if (visit278_74_1(e[0].nodeType == Dom.NodeType.ELEMENT_NODE)) {
        _$jscoverage['/editor/elementPath.js'].lineData[75]++;
        if (visit279_75_1(!this.lastElement)) {
          _$jscoverage['/editor/elementPath.js'].lineData[76]++;
          this.lastElement = e;
        }
        _$jscoverage['/editor/elementPath.js'].lineData[78]++;
        var elementName = e.nodeName();
        _$jscoverage['/editor/elementPath.js'].lineData[80]++;
        if (visit280_80_1(!blockLimit)) {
          _$jscoverage['/editor/elementPath.js'].lineData[81]++;
          if (visit281_81_1(!block && pathBlockElements[elementName])) {
            _$jscoverage['/editor/elementPath.js'].lineData[82]++;
            block = e;
          }
          _$jscoverage['/editor/elementPath.js'].lineData[84]++;
          if (visit282_84_1(pathBlockLimitElements[elementName])) {
            _$jscoverage['/editor/elementPath.js'].lineData[87]++;
            if (visit283_87_1(!block && visit284_87_2(visit285_87_3(elementName == 'div') && !checkHasBlock(e)))) {
              _$jscoverage['/editor/elementPath.js'].lineData[88]++;
              block = e;
            } else {
              _$jscoverage['/editor/elementPath.js'].lineData[90]++;
              blockLimit = e;
            }
          }
        }
        _$jscoverage['/editor/elementPath.js'].lineData[94]++;
        elements.push(e);
        _$jscoverage['/editor/elementPath.js'].lineData[95]++;
        if (visit286_95_1(elementName == 'body')) {
          _$jscoverage['/editor/elementPath.js'].lineData[96]++;
          break;
        }
      }
      _$jscoverage['/editor/elementPath.js'].lineData[99]++;
      e = e.parent();
    }
    _$jscoverage['/editor/elementPath.js'].lineData[102]++;
    self.block = block;
    _$jscoverage['/editor/elementPath.js'].lineData[103]++;
    self.blockLimit = blockLimit;
    _$jscoverage['/editor/elementPath.js'].lineData[104]++;
    self.elements = elements;
  }
  _$jscoverage['/editor/elementPath.js'].lineData[107]++;
  ElementPath.prototype = {
  constructor: ElementPath, 
  compare: function(otherPath) {
  _$jscoverage['/editor/elementPath.js'].functionData[3]++;
  _$jscoverage['/editor/elementPath.js'].lineData[117]++;
  var thisElements = this.elements;
  _$jscoverage['/editor/elementPath.js'].lineData[118]++;
  var otherElements = visit287_118_1(otherPath && otherPath.elements);
  _$jscoverage['/editor/elementPath.js'].lineData[120]++;
  if (visit288_120_1(!otherElements || visit289_120_2(thisElements.length != otherElements.length))) {
    _$jscoverage['/editor/elementPath.js'].lineData[121]++;
    return FALSE;
  }
  _$jscoverage['/editor/elementPath.js'].lineData[123]++;
  for (var i = 0; visit290_123_1(i < thisElements.length); i++) {
    _$jscoverage['/editor/elementPath.js'].lineData[124]++;
    if (visit291_124_1(!Dom.equals(thisElements[i], otherElements[i]))) {
      _$jscoverage['/editor/elementPath.js'].lineData[125]++;
      return FALSE;
    }
  }
  _$jscoverage['/editor/elementPath.js'].lineData[128]++;
  return TRUE;
}, 
  contains: function(tagNames) {
  _$jscoverage['/editor/elementPath.js'].functionData[4]++;
  _$jscoverage['/editor/elementPath.js'].lineData[132]++;
  var elements = this.elements;
  _$jscoverage['/editor/elementPath.js'].lineData[133]++;
  for (var i = 0; visit292_133_1(i < elements.length); i++) {
    _$jscoverage['/editor/elementPath.js'].lineData[134]++;
    if (visit293_134_1(elements[i].nodeName() in tagNames)) {
      _$jscoverage['/editor/elementPath.js'].lineData[135]++;
      return elements[i];
    }
  }
  _$jscoverage['/editor/elementPath.js'].lineData[137]++;
  return NULL;
}, 
  toString: function() {
  _$jscoverage['/editor/elementPath.js'].functionData[5]++;
  _$jscoverage['/editor/elementPath.js'].lineData[140]++;
  var elements = this.elements, i, elNames = [];
  _$jscoverage['/editor/elementPath.js'].lineData[141]++;
  for (i = 0; visit294_141_1(i < elements.length); i++) {
    _$jscoverage['/editor/elementPath.js'].lineData[142]++;
    elNames.push(elements[i].nodeName());
  }
  _$jscoverage['/editor/elementPath.js'].lineData[144]++;
  return elNames.toString();
}};
  _$jscoverage['/editor/elementPath.js'].lineData[147]++;
  Editor.ElementPath = ElementPath;
  _$jscoverage['/editor/elementPath.js'].lineData[149]++;
  return ElementPath;
});
