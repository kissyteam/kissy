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
  _$jscoverage['/ie/traversal.js'].lineData[5] = 0;
  _$jscoverage['/ie/traversal.js'].lineData[6] = 0;
  _$jscoverage['/ie/traversal.js'].lineData[7] = 0;
  _$jscoverage['/ie/traversal.js'].lineData[8] = 0;
  _$jscoverage['/ie/traversal.js'].lineData[12] = 0;
  _$jscoverage['/ie/traversal.js'].lineData[14] = 0;
  _$jscoverage['/ie/traversal.js'].lineData[15] = 0;
  _$jscoverage['/ie/traversal.js'].lineData[19] = 0;
  _$jscoverage['/ie/traversal.js'].lineData[20] = 0;
  _$jscoverage['/ie/traversal.js'].lineData[22] = 0;
  _$jscoverage['/ie/traversal.js'].lineData[26] = 0;
  _$jscoverage['/ie/traversal.js'].lineData[27] = 0;
  _$jscoverage['/ie/traversal.js'].lineData[29] = 0;
  _$jscoverage['/ie/traversal.js'].lineData[31] = 0;
  _$jscoverage['/ie/traversal.js'].lineData[32] = 0;
  _$jscoverage['/ie/traversal.js'].lineData[33] = 0;
  _$jscoverage['/ie/traversal.js'].lineData[36] = 0;
  _$jscoverage['/ie/traversal.js'].lineData[37] = 0;
  _$jscoverage['/ie/traversal.js'].lineData[40] = 0;
  _$jscoverage['/ie/traversal.js'].lineData[41] = 0;
  _$jscoverage['/ie/traversal.js'].lineData[42] = 0;
  _$jscoverage['/ie/traversal.js'].lineData[45] = 0;
  _$jscoverage['/ie/traversal.js'].lineData[47] = 0;
  _$jscoverage['/ie/traversal.js'].lineData[51] = 0;
  _$jscoverage['/ie/traversal.js'].lineData[52] = 0;
  _$jscoverage['/ie/traversal.js'].lineData[56] = 0;
  _$jscoverage['/ie/traversal.js'].lineData[58] = 0;
  _$jscoverage['/ie/traversal.js'].lineData[59] = 0;
  _$jscoverage['/ie/traversal.js'].lineData[60] = 0;
  _$jscoverage['/ie/traversal.js'].lineData[61] = 0;
  _$jscoverage['/ie/traversal.js'].lineData[62] = 0;
  _$jscoverage['/ie/traversal.js'].lineData[63] = 0;
  _$jscoverage['/ie/traversal.js'].lineData[64] = 0;
  _$jscoverage['/ie/traversal.js'].lineData[65] = 0;
  _$jscoverage['/ie/traversal.js'].lineData[69] = 0;
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
  _$jscoverage['/ie/traversal.js'].branchData['7'] = [];
  _$jscoverage['/ie/traversal.js'].branchData['7'][1] = new BranchData();
  _$jscoverage['/ie/traversal.js'].branchData['14'] = [];
  _$jscoverage['/ie/traversal.js'].branchData['14'][1] = new BranchData();
  _$jscoverage['/ie/traversal.js'].branchData['19'] = [];
  _$jscoverage['/ie/traversal.js'].branchData['19'][1] = new BranchData();
  _$jscoverage['/ie/traversal.js'].branchData['19'][2] = new BranchData();
  _$jscoverage['/ie/traversal.js'].branchData['20'] = [];
  _$jscoverage['/ie/traversal.js'].branchData['20'][1] = new BranchData();
  _$jscoverage['/ie/traversal.js'].branchData['31'] = [];
  _$jscoverage['/ie/traversal.js'].branchData['31'][1] = new BranchData();
  _$jscoverage['/ie/traversal.js'].branchData['34'] = [];
  _$jscoverage['/ie/traversal.js'].branchData['34'][1] = new BranchData();
  _$jscoverage['/ie/traversal.js'].branchData['36'] = [];
  _$jscoverage['/ie/traversal.js'].branchData['36'][1] = new BranchData();
  _$jscoverage['/ie/traversal.js'].branchData['36'][2] = new BranchData();
  _$jscoverage['/ie/traversal.js'].branchData['41'] = [];
  _$jscoverage['/ie/traversal.js'].branchData['41'][1] = new BranchData();
  _$jscoverage['/ie/traversal.js'].branchData['41'][2] = new BranchData();
  _$jscoverage['/ie/traversal.js'].branchData['61'] = [];
  _$jscoverage['/ie/traversal.js'].branchData['61'][1] = new BranchData();
  _$jscoverage['/ie/traversal.js'].branchData['61'][2] = new BranchData();
  _$jscoverage['/ie/traversal.js'].branchData['63'] = [];
  _$jscoverage['/ie/traversal.js'].branchData['63'][1] = new BranchData();
  _$jscoverage['/ie/traversal.js'].branchData['64'] = [];
  _$jscoverage['/ie/traversal.js'].branchData['64'][1] = new BranchData();
}
_$jscoverage['/ie/traversal.js'].branchData['64'][1].init(22, 32, 'getAttr(children[i], \'id\') == id');
function visit129_64_1(result) {
  _$jscoverage['/ie/traversal.js'].branchData['64'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/traversal.js'].branchData['63'][1].init(111, 5, 'i < l');
function visit128_63_1(result) {
  _$jscoverage['/ie/traversal.js'].branchData['63'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/traversal.js'].branchData['61'][2].init(62, 24, 'getAttr(el, \'id\') !== id');
function visit127_61_2(result) {
  _$jscoverage['/ie/traversal.js'].branchData['61'][2].ranCondition(result);
  return result;
}_$jscoverage['/ie/traversal.js'].branchData['61'][1].init(56, 30, 'el && getAttr(el, \'id\') !== id');
function visit126_61_1(result) {
  _$jscoverage['/ie/traversal.js'].branchData['61'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/traversal.js'].branchData['41'][2].init(42, 17, 'el.nodeType === 1');
function visit125_41_2(result) {
  _$jscoverage['/ie/traversal.js'].branchData['41'][2].ranCondition(result);
  return result;
}_$jscoverage['/ie/traversal.js'].branchData['41'][1].init(26, 33, '!needsFilter || el.nodeType === 1');
function visit124_41_1(result) {
  _$jscoverage['/ie/traversal.js'].branchData['41'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/traversal.js'].branchData['36'][2].init(174, 31, 'typeof nodes.length != \'number\'');
function visit123_36_2(result) {
  _$jscoverage['/ie/traversal.js'].branchData['36'][2].ranCondition(result);
  return result;
}_$jscoverage['/ie/traversal.js'].branchData['36'][1].init(159, 46, 'needsFilter || typeof nodes.length != \'number\'');
function visit122_36_1(result) {
  _$jscoverage['/ie/traversal.js'].branchData['36'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/traversal.js'].branchData['34'][1].init(78, 11, 'name == \'*\'');
function visit121_34_1(result) {
  _$jscoverage['/ie/traversal.js'].branchData['34'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/traversal.js'].branchData['31'][1].init(703, 36, 'div.getElementsByTagName("*").length');
function visit120_31_1(result) {
  _$jscoverage['/ie/traversal.js'].branchData['31'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/traversal.js'].branchData['20'][1].init(21, 27, 'a.contains && a.contains(b)');
function visit119_20_1(result) {
  _$jscoverage['/ie/traversal.js'].branchData['20'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/traversal.js'].branchData['19'][2].init(366, 39, 'b.nodeType == Dom.NodeType.ELEMENT_NODE');
function visit118_19_2(result) {
  _$jscoverage['/ie/traversal.js'].branchData['19'][2].ranCondition(result);
  return result;
}_$jscoverage['/ie/traversal.js'].branchData['19'][1].init(361, 44, 'b && b.nodeType == Dom.NodeType.ELEMENT_NODE');
function visit117_19_1(result) {
  _$jscoverage['/ie/traversal.js'].branchData['19'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/traversal.js'].branchData['14'][1].init(240, 6, 'a == b');
function visit116_14_1(result) {
  _$jscoverage['/ie/traversal.js'].branchData['14'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/traversal.js'].branchData['7'][1].init(14, 40, 'a.nodeType == Dom.NodeType.DOCUMENT_NODE');
function visit115_7_1(result) {
  _$jscoverage['/ie/traversal.js'].branchData['7'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/traversal.js'].lineData[5]++;
KISSY.add('dom/ie/traversal', function(S, Dom) {
  _$jscoverage['/ie/traversal.js'].functionData[0]++;
  _$jscoverage['/ie/traversal.js'].lineData[6]++;
  Dom._contains = function(a, b) {
  _$jscoverage['/ie/traversal.js'].functionData[1]++;
  _$jscoverage['/ie/traversal.js'].lineData[7]++;
  if (visit115_7_1(a.nodeType == Dom.NodeType.DOCUMENT_NODE)) {
    _$jscoverage['/ie/traversal.js'].lineData[8]++;
    a = a.documentElement;
  }
  _$jscoverage['/ie/traversal.js'].lineData[12]++;
  b = b.parentNode;
  _$jscoverage['/ie/traversal.js'].lineData[14]++;
  if (visit116_14_1(a == b)) {
    _$jscoverage['/ie/traversal.js'].lineData[15]++;
    return true;
  }
  _$jscoverage['/ie/traversal.js'].lineData[19]++;
  if (visit117_19_1(b && visit118_19_2(b.nodeType == Dom.NodeType.ELEMENT_NODE))) {
    _$jscoverage['/ie/traversal.js'].lineData[20]++;
    return visit119_20_1(a.contains && a.contains(b));
  } else {
    _$jscoverage['/ie/traversal.js'].lineData[22]++;
    return false;
  }
};
  _$jscoverage['/ie/traversal.js'].lineData[26]++;
  var div = document.createElement("div");
  _$jscoverage['/ie/traversal.js'].lineData[27]++;
  div.appendChild(document.createComment(""));
  _$jscoverage['/ie/traversal.js'].lineData[29]++;
  var getElementsByTagName;
  _$jscoverage['/ie/traversal.js'].lineData[31]++;
  if (visit120_31_1(div.getElementsByTagName("*").length)) {
    _$jscoverage['/ie/traversal.js'].lineData[32]++;
    getElementsByTagName = function(name, context) {
  _$jscoverage['/ie/traversal.js'].functionData[2]++;
  _$jscoverage['/ie/traversal.js'].lineData[33]++;
  var nodes = context.getElementsByTagName(name), needsFilter = visit121_34_1(name == '*');
  _$jscoverage['/ie/traversal.js'].lineData[36]++;
  if (visit122_36_1(needsFilter || visit123_36_2(typeof nodes.length != 'number'))) {
    _$jscoverage['/ie/traversal.js'].lineData[37]++;
    var ret = [], i = 0, el;
    _$jscoverage['/ie/traversal.js'].lineData[40]++;
    while (el = nodes[i++]) {
      _$jscoverage['/ie/traversal.js'].lineData[41]++;
      if (visit124_41_1(!needsFilter || visit125_41_2(el.nodeType === 1))) {
        _$jscoverage['/ie/traversal.js'].lineData[42]++;
        ret.push(el);
      }
    }
    _$jscoverage['/ie/traversal.js'].lineData[45]++;
    return ret;
  } else {
    _$jscoverage['/ie/traversal.js'].lineData[47]++;
    return nodes;
  }
};
  } else {
    _$jscoverage['/ie/traversal.js'].lineData[51]++;
    getElementsByTagName = function(name, context) {
  _$jscoverage['/ie/traversal.js'].functionData[3]++;
  _$jscoverage['/ie/traversal.js'].lineData[52]++;
  return context.getElementsByTagName(name);
};
  }
  _$jscoverage['/ie/traversal.js'].lineData[56]++;
  Dom._getElementsByTagName = getElementsByTagName;
  _$jscoverage['/ie/traversal.js'].lineData[58]++;
  var getAttr = Dom._getSimpleAttr;
  _$jscoverage['/ie/traversal.js'].lineData[59]++;
  Dom._getElementById = function(id, doc) {
  _$jscoverage['/ie/traversal.js'].functionData[4]++;
  _$jscoverage['/ie/traversal.js'].lineData[60]++;
  var el = doc.getElementById(id);
  _$jscoverage['/ie/traversal.js'].lineData[61]++;
  if (visit126_61_1(el && visit127_61_2(getAttr(el, 'id') !== id))) {
    _$jscoverage['/ie/traversal.js'].lineData[62]++;
    var children = getElementsByTagName('*', doc);
    _$jscoverage['/ie/traversal.js'].lineData[63]++;
    for (var i = 0, l = children.length; visit128_63_1(i < l); i++) {
      _$jscoverage['/ie/traversal.js'].lineData[64]++;
      if (visit129_64_1(getAttr(children[i], 'id') == id)) {
        _$jscoverage['/ie/traversal.js'].lineData[65]++;
        return children[i];
      }
    }
  }
  _$jscoverage['/ie/traversal.js'].lineData[69]++;
  return el;
};
}, {
  requires: ['dom/base']});
