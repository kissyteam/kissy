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
if (! _$jscoverage['/ie/traversal.js']) {
  _$jscoverage['/ie/traversal.js'] = {};
  _$jscoverage['/ie/traversal.js'].lineData = [];
  _$jscoverage['/ie/traversal.js'].lineData[6] = 0;
  _$jscoverage['/ie/traversal.js'].lineData[7] = 0;
  _$jscoverage['/ie/traversal.js'].lineData[8] = 0;
  _$jscoverage['/ie/traversal.js'].lineData[9] = 0;
  _$jscoverage['/ie/traversal.js'].lineData[13] = 0;
  _$jscoverage['/ie/traversal.js'].lineData[15] = 0;
  _$jscoverage['/ie/traversal.js'].lineData[16] = 0;
  _$jscoverage['/ie/traversal.js'].lineData[20] = 0;
  _$jscoverage['/ie/traversal.js'].lineData[21] = 0;
  _$jscoverage['/ie/traversal.js'].lineData[23] = 0;
  _$jscoverage['/ie/traversal.js'].lineData[27] = 0;
  _$jscoverage['/ie/traversal.js'].lineData[28] = 0;
  _$jscoverage['/ie/traversal.js'].lineData[30] = 0;
  _$jscoverage['/ie/traversal.js'].lineData[32] = 0;
  _$jscoverage['/ie/traversal.js'].lineData[33] = 0;
  _$jscoverage['/ie/traversal.js'].lineData[34] = 0;
  _$jscoverage['/ie/traversal.js'].lineData[37] = 0;
  _$jscoverage['/ie/traversal.js'].lineData[38] = 0;
  _$jscoverage['/ie/traversal.js'].lineData[41] = 0;
  _$jscoverage['/ie/traversal.js'].lineData[42] = 0;
  _$jscoverage['/ie/traversal.js'].lineData[43] = 0;
  _$jscoverage['/ie/traversal.js'].lineData[46] = 0;
  _$jscoverage['/ie/traversal.js'].lineData[48] = 0;
  _$jscoverage['/ie/traversal.js'].lineData[52] = 0;
  _$jscoverage['/ie/traversal.js'].lineData[53] = 0;
  _$jscoverage['/ie/traversal.js'].lineData[57] = 0;
  _$jscoverage['/ie/traversal.js'].lineData[59] = 0;
  _$jscoverage['/ie/traversal.js'].lineData[60] = 0;
  _$jscoverage['/ie/traversal.js'].lineData[61] = 0;
  _$jscoverage['/ie/traversal.js'].lineData[62] = 0;
  _$jscoverage['/ie/traversal.js'].lineData[63] = 0;
  _$jscoverage['/ie/traversal.js'].lineData[64] = 0;
  _$jscoverage['/ie/traversal.js'].lineData[65] = 0;
  _$jscoverage['/ie/traversal.js'].lineData[66] = 0;
  _$jscoverage['/ie/traversal.js'].lineData[70] = 0;
}
if (! _$jscoverage['/ie/traversal.js'].functionData) {
  _$jscoverage['/ie/traversal.js'].functionData = [];
  _$jscoverage['/ie/traversal.js'].functionData[0] = 0;
  _$jscoverage['/ie/traversal.js'].functionData[1] = 0;
  _$jscoverage['/ie/traversal.js'].functionData[2] = 0;
  _$jscoverage['/ie/traversal.js'].functionData[3] = 0;
  _$jscoverage['/ie/traversal.js'].functionData[4] = 0;
}
if (! _$jscoverage['/ie/traversal.js'].branchData) {
  _$jscoverage['/ie/traversal.js'].branchData = {};
  _$jscoverage['/ie/traversal.js'].branchData['8'] = [];
  _$jscoverage['/ie/traversal.js'].branchData['8'][1] = new BranchData();
  _$jscoverage['/ie/traversal.js'].branchData['15'] = [];
  _$jscoverage['/ie/traversal.js'].branchData['15'][1] = new BranchData();
  _$jscoverage['/ie/traversal.js'].branchData['20'] = [];
  _$jscoverage['/ie/traversal.js'].branchData['20'][1] = new BranchData();
  _$jscoverage['/ie/traversal.js'].branchData['20'][2] = new BranchData();
  _$jscoverage['/ie/traversal.js'].branchData['21'] = [];
  _$jscoverage['/ie/traversal.js'].branchData['21'][1] = new BranchData();
  _$jscoverage['/ie/traversal.js'].branchData['32'] = [];
  _$jscoverage['/ie/traversal.js'].branchData['32'][1] = new BranchData();
  _$jscoverage['/ie/traversal.js'].branchData['35'] = [];
  _$jscoverage['/ie/traversal.js'].branchData['35'][1] = new BranchData();
  _$jscoverage['/ie/traversal.js'].branchData['37'] = [];
  _$jscoverage['/ie/traversal.js'].branchData['37'][1] = new BranchData();
  _$jscoverage['/ie/traversal.js'].branchData['37'][2] = new BranchData();
  _$jscoverage['/ie/traversal.js'].branchData['42'] = [];
  _$jscoverage['/ie/traversal.js'].branchData['42'][1] = new BranchData();
  _$jscoverage['/ie/traversal.js'].branchData['42'][2] = new BranchData();
  _$jscoverage['/ie/traversal.js'].branchData['62'] = [];
  _$jscoverage['/ie/traversal.js'].branchData['62'][1] = new BranchData();
  _$jscoverage['/ie/traversal.js'].branchData['62'][2] = new BranchData();
  _$jscoverage['/ie/traversal.js'].branchData['64'] = [];
  _$jscoverage['/ie/traversal.js'].branchData['64'][1] = new BranchData();
  _$jscoverage['/ie/traversal.js'].branchData['65'] = [];
  _$jscoverage['/ie/traversal.js'].branchData['65'][1] = new BranchData();
}
_$jscoverage['/ie/traversal.js'].branchData['65'][1].init(22, 32, 'getAttr(children[i], \'id\') == id');
function visit129_65_1(result) {
  _$jscoverage['/ie/traversal.js'].branchData['65'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/traversal.js'].branchData['64'][1].init(111, 5, 'i < l');
function visit128_64_1(result) {
  _$jscoverage['/ie/traversal.js'].branchData['64'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/traversal.js'].branchData['62'][2].init(62, 24, 'getAttr(el, \'id\') !== id');
function visit127_62_2(result) {
  _$jscoverage['/ie/traversal.js'].branchData['62'][2].ranCondition(result);
  return result;
}_$jscoverage['/ie/traversal.js'].branchData['62'][1].init(56, 30, 'el && getAttr(el, \'id\') !== id');
function visit126_62_1(result) {
  _$jscoverage['/ie/traversal.js'].branchData['62'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/traversal.js'].branchData['42'][2].init(42, 17, 'el.nodeType === 1');
function visit125_42_2(result) {
  _$jscoverage['/ie/traversal.js'].branchData['42'][2].ranCondition(result);
  return result;
}_$jscoverage['/ie/traversal.js'].branchData['42'][1].init(26, 33, '!needsFilter || el.nodeType === 1');
function visit124_42_1(result) {
  _$jscoverage['/ie/traversal.js'].branchData['42'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/traversal.js'].branchData['37'][2].init(174, 31, 'typeof nodes.length != \'number\'');
function visit123_37_2(result) {
  _$jscoverage['/ie/traversal.js'].branchData['37'][2].ranCondition(result);
  return result;
}_$jscoverage['/ie/traversal.js'].branchData['37'][1].init(159, 46, 'needsFilter || typeof nodes.length != \'number\'');
function visit122_37_1(result) {
  _$jscoverage['/ie/traversal.js'].branchData['37'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/traversal.js'].branchData['35'][1].init(78, 11, 'name == \'*\'');
function visit121_35_1(result) {
  _$jscoverage['/ie/traversal.js'].branchData['35'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/traversal.js'].branchData['32'][1].init(703, 36, 'div.getElementsByTagName("*").length');
function visit120_32_1(result) {
  _$jscoverage['/ie/traversal.js'].branchData['32'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/traversal.js'].branchData['21'][1].init(21, 27, 'a.contains && a.contains(b)');
function visit119_21_1(result) {
  _$jscoverage['/ie/traversal.js'].branchData['21'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/traversal.js'].branchData['20'][2].init(366, 39, 'b.nodeType == Dom.NodeType.ELEMENT_NODE');
function visit118_20_2(result) {
  _$jscoverage['/ie/traversal.js'].branchData['20'][2].ranCondition(result);
  return result;
}_$jscoverage['/ie/traversal.js'].branchData['20'][1].init(361, 44, 'b && b.nodeType == Dom.NodeType.ELEMENT_NODE');
function visit117_20_1(result) {
  _$jscoverage['/ie/traversal.js'].branchData['20'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/traversal.js'].branchData['15'][1].init(240, 6, 'a == b');
function visit116_15_1(result) {
  _$jscoverage['/ie/traversal.js'].branchData['15'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/traversal.js'].branchData['8'][1].init(14, 40, 'a.nodeType == Dom.NodeType.DOCUMENT_NODE');
function visit115_8_1(result) {
  _$jscoverage['/ie/traversal.js'].branchData['8'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/traversal.js'].lineData[6]++;
KISSY.add('dom/ie/traversal', function(S, Dom) {
  _$jscoverage['/ie/traversal.js'].functionData[0]++;
  _$jscoverage['/ie/traversal.js'].lineData[7]++;
  Dom._contains = function(a, b) {
  _$jscoverage['/ie/traversal.js'].functionData[1]++;
  _$jscoverage['/ie/traversal.js'].lineData[8]++;
  if (visit115_8_1(a.nodeType == Dom.NodeType.DOCUMENT_NODE)) {
    _$jscoverage['/ie/traversal.js'].lineData[9]++;
    a = a.documentElement;
  }
  _$jscoverage['/ie/traversal.js'].lineData[13]++;
  b = b.parentNode;
  _$jscoverage['/ie/traversal.js'].lineData[15]++;
  if (visit116_15_1(a == b)) {
    _$jscoverage['/ie/traversal.js'].lineData[16]++;
    return true;
  }
  _$jscoverage['/ie/traversal.js'].lineData[20]++;
  if (visit117_20_1(b && visit118_20_2(b.nodeType == Dom.NodeType.ELEMENT_NODE))) {
    _$jscoverage['/ie/traversal.js'].lineData[21]++;
    return visit119_21_1(a.contains && a.contains(b));
  } else {
    _$jscoverage['/ie/traversal.js'].lineData[23]++;
    return false;
  }
};
  _$jscoverage['/ie/traversal.js'].lineData[27]++;
  var div = document.createElement("div");
  _$jscoverage['/ie/traversal.js'].lineData[28]++;
  div.appendChild(document.createComment(""));
  _$jscoverage['/ie/traversal.js'].lineData[30]++;
  var getElementsByTagName;
  _$jscoverage['/ie/traversal.js'].lineData[32]++;
  if (visit120_32_1(div.getElementsByTagName("*").length)) {
    _$jscoverage['/ie/traversal.js'].lineData[33]++;
    getElementsByTagName = function(name, context) {
  _$jscoverage['/ie/traversal.js'].functionData[2]++;
  _$jscoverage['/ie/traversal.js'].lineData[34]++;
  var nodes = context.getElementsByTagName(name), needsFilter = visit121_35_1(name == '*');
  _$jscoverage['/ie/traversal.js'].lineData[37]++;
  if (visit122_37_1(needsFilter || visit123_37_2(typeof nodes.length != 'number'))) {
    _$jscoverage['/ie/traversal.js'].lineData[38]++;
    var ret = [], i = 0, el;
    _$jscoverage['/ie/traversal.js'].lineData[41]++;
    while (el = nodes[i++]) {
      _$jscoverage['/ie/traversal.js'].lineData[42]++;
      if (visit124_42_1(!needsFilter || visit125_42_2(el.nodeType === 1))) {
        _$jscoverage['/ie/traversal.js'].lineData[43]++;
        ret.push(el);
      }
    }
    _$jscoverage['/ie/traversal.js'].lineData[46]++;
    return ret;
  } else {
    _$jscoverage['/ie/traversal.js'].lineData[48]++;
    return nodes;
  }
};
  } else {
    _$jscoverage['/ie/traversal.js'].lineData[52]++;
    getElementsByTagName = function(name, context) {
  _$jscoverage['/ie/traversal.js'].functionData[3]++;
  _$jscoverage['/ie/traversal.js'].lineData[53]++;
  return context.getElementsByTagName(name);
};
  }
  _$jscoverage['/ie/traversal.js'].lineData[57]++;
  Dom._getElementsByTagName = getElementsByTagName;
  _$jscoverage['/ie/traversal.js'].lineData[59]++;
  var getAttr = Dom._getSimpleAttr;
  _$jscoverage['/ie/traversal.js'].lineData[60]++;
  Dom._getElementById = function(id, doc) {
  _$jscoverage['/ie/traversal.js'].functionData[4]++;
  _$jscoverage['/ie/traversal.js'].lineData[61]++;
  var el = doc.getElementById(id);
  _$jscoverage['/ie/traversal.js'].lineData[62]++;
  if (visit126_62_1(el && visit127_62_2(getAttr(el, 'id') !== id))) {
    _$jscoverage['/ie/traversal.js'].lineData[63]++;
    var children = getElementsByTagName('*', doc);
    _$jscoverage['/ie/traversal.js'].lineData[64]++;
    for (var i = 0, l = children.length; visit128_64_1(i < l); i++) {
      _$jscoverage['/ie/traversal.js'].lineData[65]++;
      if (visit129_65_1(getAttr(children[i], 'id') == id)) {
        _$jscoverage['/ie/traversal.js'].lineData[66]++;
        return children[i];
      }
    }
  }
  _$jscoverage['/ie/traversal.js'].lineData[70]++;
  return el;
};
}, {
  requires: ['dom/base']});
