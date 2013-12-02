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
if (! _$jscoverage['/ie/insertion.js']) {
  _$jscoverage['/ie/insertion.js'] = {};
  _$jscoverage['/ie/insertion.js'].lineData = [];
  _$jscoverage['/ie/insertion.js'].lineData[6] = 0;
  _$jscoverage['/ie/insertion.js'].lineData[7] = 0;
  _$jscoverage['/ie/insertion.js'].lineData[8] = 0;
  _$jscoverage['/ie/insertion.js'].lineData[10] = 0;
  _$jscoverage['/ie/insertion.js'].lineData[19] = 0;
  _$jscoverage['/ie/insertion.js'].lineData[20] = 0;
  _$jscoverage['/ie/insertion.js'].lineData[21] = 0;
  _$jscoverage['/ie/insertion.js'].lineData[22] = 0;
  _$jscoverage['/ie/insertion.js'].lineData[23] = 0;
  _$jscoverage['/ie/insertion.js'].lineData[24] = 0;
  _$jscoverage['/ie/insertion.js'].lineData[25] = 0;
  _$jscoverage['/ie/insertion.js'].lineData[26] = 0;
  _$jscoverage['/ie/insertion.js'].lineData[27] = 0;
  _$jscoverage['/ie/insertion.js'].lineData[28] = 0;
  _$jscoverage['/ie/insertion.js'].lineData[29] = 0;
  _$jscoverage['/ie/insertion.js'].lineData[36] = 0;
  _$jscoverage['/ie/insertion.js'].lineData[37] = 0;
  _$jscoverage['/ie/insertion.js'].lineData[39] = 0;
}
if (! _$jscoverage['/ie/insertion.js'].functionData) {
  _$jscoverage['/ie/insertion.js'].functionData = [];
  _$jscoverage['/ie/insertion.js'].functionData[0] = 0;
  _$jscoverage['/ie/insertion.js'].functionData[1] = 0;
  _$jscoverage['/ie/insertion.js'].functionData[2] = 0;
}
if (! _$jscoverage['/ie/insertion.js'].branchData) {
  _$jscoverage['/ie/insertion.js'].branchData = {};
  _$jscoverage['/ie/insertion.js'].branchData['10'] = [];
  _$jscoverage['/ie/insertion.js'].branchData['10'][1] = new BranchData();
  _$jscoverage['/ie/insertion.js'].branchData['20'] = [];
  _$jscoverage['/ie/insertion.js'].branchData['20'][1] = new BranchData();
  _$jscoverage['/ie/insertion.js'].branchData['22'] = [];
  _$jscoverage['/ie/insertion.js'].branchData['22'][1] = new BranchData();
  _$jscoverage['/ie/insertion.js'].branchData['24'] = [];
  _$jscoverage['/ie/insertion.js'].branchData['24'][1] = new BranchData();
  _$jscoverage['/ie/insertion.js'].branchData['26'] = [];
  _$jscoverage['/ie/insertion.js'].branchData['26'][1] = new BranchData();
  _$jscoverage['/ie/insertion.js'].branchData['28'] = [];
  _$jscoverage['/ie/insertion.js'].branchData['28'][1] = new BranchData();
  _$jscoverage['/ie/insertion.js'].branchData['37'] = [];
  _$jscoverage['/ie/insertion.js'].branchData['37'][1] = new BranchData();
  _$jscoverage['/ie/insertion.js'].branchData['37'][2] = new BranchData();
  _$jscoverage['/ie/insertion.js'].branchData['37'][3] = new BranchData();
}
_$jscoverage['/ie/insertion.js'].branchData['37'][3].init(39, 19, 'el.type === \'radio\'');
function visit59_37_3(result) {
  _$jscoverage['/ie/insertion.js'].branchData['37'][3].ranCondition(result);
  return result;
}_$jscoverage['/ie/insertion.js'].branchData['37'][2].init(13, 22, 'el.type === \'checkbox\'');
function visit58_37_2(result) {
  _$jscoverage['/ie/insertion.js'].branchData['37'][2].ranCondition(result);
  return result;
}_$jscoverage['/ie/insertion.js'].branchData['37'][1].init(13, 45, 'el.type === \'checkbox\' || el.type === \'radio\'');
function visit57_37_1(result) {
  _$jscoverage['/ie/insertion.js'].branchData['37'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/insertion.js'].branchData['28'][1].init(100, 13, 'j < cs.length');
function visit56_28_1(result) {
  _$jscoverage['/ie/insertion.js'].branchData['28'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/insertion.js'].branchData['26'][1].init(288, 41, 'el.nodeType === Dom.NodeType.ELEMENT_NODE');
function visit55_26_1(result) {
  _$jscoverage['/ie/insertion.js'].branchData['26'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/insertion.js'].branchData['24'][1].init(184, 28, 'Dom.nodeName(el) === \'input\'');
function visit54_24_1(result) {
  _$jscoverage['/ie/insertion.js'].branchData['24'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/insertion.js'].branchData['22'][1].init(54, 51, 'el.nodeType === Dom.NodeType.DOCUMENT_FRAGMENT_NODE');
function visit53_22_1(result) {
  _$jscoverage['/ie/insertion.js'].branchData['22'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/insertion.js'].branchData['20'][1].init(29, 14, 'i < ret.length');
function visit52_20_1(result) {
  _$jscoverage['/ie/insertion.js'].branchData['20'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/insertion.js'].branchData['10'][1].init(64, 13, 'UA.ieMode < 8');
function visit51_10_1(result) {
  _$jscoverage['/ie/insertion.js'].branchData['10'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/insertion.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/ie/insertion.js'].functionData[0]++;
  _$jscoverage['/ie/insertion.js'].lineData[7]++;
  var Dom = require('dom/base');
  _$jscoverage['/ie/insertion.js'].lineData[8]++;
  var UA = S.UA;
  _$jscoverage['/ie/insertion.js'].lineData[10]++;
  if (visit51_10_1(UA.ieMode < 8)) {
    _$jscoverage['/ie/insertion.js'].lineData[19]++;
    Dom._fixInsertionChecked = function fixChecked(ret) {
  _$jscoverage['/ie/insertion.js'].functionData[1]++;
  _$jscoverage['/ie/insertion.js'].lineData[20]++;
  for (var i = 0; visit52_20_1(i < ret.length); i++) {
    _$jscoverage['/ie/insertion.js'].lineData[21]++;
    var el = ret[i];
    _$jscoverage['/ie/insertion.js'].lineData[22]++;
    if (visit53_22_1(el.nodeType === Dom.NodeType.DOCUMENT_FRAGMENT_NODE)) {
      _$jscoverage['/ie/insertion.js'].lineData[23]++;
      fixChecked(el.childNodes);
    } else {
      _$jscoverage['/ie/insertion.js'].lineData[24]++;
      if (visit54_24_1(Dom.nodeName(el) === 'input')) {
        _$jscoverage['/ie/insertion.js'].lineData[25]++;
        fixCheckedInternal(el);
      } else {
        _$jscoverage['/ie/insertion.js'].lineData[26]++;
        if (visit55_26_1(el.nodeType === Dom.NodeType.ELEMENT_NODE)) {
          _$jscoverage['/ie/insertion.js'].lineData[27]++;
          var cs = el.getElementsByTagName('input');
          _$jscoverage['/ie/insertion.js'].lineData[28]++;
          for (var j = 0; visit56_28_1(j < cs.length); j++) {
            _$jscoverage['/ie/insertion.js'].lineData[29]++;
            fixChecked(cs[j]);
          }
        }
      }
    }
  }
};
  }
  _$jscoverage['/ie/insertion.js'].lineData[36]++;
  function fixCheckedInternal(el) {
    _$jscoverage['/ie/insertion.js'].functionData[2]++;
    _$jscoverage['/ie/insertion.js'].lineData[37]++;
    if (visit57_37_1(visit58_37_2(el.type === 'checkbox') || visit59_37_3(el.type === 'radio'))) {
      _$jscoverage['/ie/insertion.js'].lineData[39]++;
      el.defaultChecked = el.checked;
    }
  }
});
