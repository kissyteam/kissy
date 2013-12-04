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
  _$jscoverage['/ie/traversal.js'].lineData[10] = 0;
  _$jscoverage['/ie/traversal.js'].lineData[14] = 0;
  _$jscoverage['/ie/traversal.js'].lineData[16] = 0;
  _$jscoverage['/ie/traversal.js'].lineData[17] = 0;
  _$jscoverage['/ie/traversal.js'].lineData[21] = 0;
  _$jscoverage['/ie/traversal.js'].lineData[22] = 0;
  _$jscoverage['/ie/traversal.js'].lineData[24] = 0;
  _$jscoverage['/ie/traversal.js'].lineData[28] = 0;
  _$jscoverage['/ie/traversal.js'].lineData[29] = 0;
  _$jscoverage['/ie/traversal.js'].lineData[31] = 0;
  _$jscoverage['/ie/traversal.js'].lineData[33] = 0;
  _$jscoverage['/ie/traversal.js'].lineData[34] = 0;
  _$jscoverage['/ie/traversal.js'].lineData[35] = 0;
  _$jscoverage['/ie/traversal.js'].lineData[38] = 0;
  _$jscoverage['/ie/traversal.js'].lineData[39] = 0;
  _$jscoverage['/ie/traversal.js'].lineData[42] = 0;
  _$jscoverage['/ie/traversal.js'].lineData[43] = 0;
  _$jscoverage['/ie/traversal.js'].lineData[44] = 0;
  _$jscoverage['/ie/traversal.js'].lineData[47] = 0;
  _$jscoverage['/ie/traversal.js'].lineData[49] = 0;
  _$jscoverage['/ie/traversal.js'].lineData[53] = 0;
  _$jscoverage['/ie/traversal.js'].lineData[54] = 0;
  _$jscoverage['/ie/traversal.js'].lineData[58] = 0;
  _$jscoverage['/ie/traversal.js'].lineData[60] = 0;
  _$jscoverage['/ie/traversal.js'].lineData[61] = 0;
  _$jscoverage['/ie/traversal.js'].lineData[62] = 0;
  _$jscoverage['/ie/traversal.js'].lineData[63] = 0;
  _$jscoverage['/ie/traversal.js'].lineData[64] = 0;
  _$jscoverage['/ie/traversal.js'].lineData[65] = 0;
  _$jscoverage['/ie/traversal.js'].lineData[66] = 0;
  _$jscoverage['/ie/traversal.js'].lineData[67] = 0;
  _$jscoverage['/ie/traversal.js'].lineData[71] = 0;
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
  _$jscoverage['/ie/traversal.js'].branchData['9'] = [];
  _$jscoverage['/ie/traversal.js'].branchData['9'][1] = new BranchData();
  _$jscoverage['/ie/traversal.js'].branchData['16'] = [];
  _$jscoverage['/ie/traversal.js'].branchData['16'][1] = new BranchData();
  _$jscoverage['/ie/traversal.js'].branchData['21'] = [];
  _$jscoverage['/ie/traversal.js'].branchData['21'][1] = new BranchData();
  _$jscoverage['/ie/traversal.js'].branchData['21'][2] = new BranchData();
  _$jscoverage['/ie/traversal.js'].branchData['22'] = [];
  _$jscoverage['/ie/traversal.js'].branchData['22'][1] = new BranchData();
  _$jscoverage['/ie/traversal.js'].branchData['33'] = [];
  _$jscoverage['/ie/traversal.js'].branchData['33'][1] = new BranchData();
  _$jscoverage['/ie/traversal.js'].branchData['36'] = [];
  _$jscoverage['/ie/traversal.js'].branchData['36'][1] = new BranchData();
  _$jscoverage['/ie/traversal.js'].branchData['38'] = [];
  _$jscoverage['/ie/traversal.js'].branchData['38'][1] = new BranchData();
  _$jscoverage['/ie/traversal.js'].branchData['38'][2] = new BranchData();
  _$jscoverage['/ie/traversal.js'].branchData['43'] = [];
  _$jscoverage['/ie/traversal.js'].branchData['43'][1] = new BranchData();
  _$jscoverage['/ie/traversal.js'].branchData['43'][2] = new BranchData();
  _$jscoverage['/ie/traversal.js'].branchData['63'] = [];
  _$jscoverage['/ie/traversal.js'].branchData['63'][1] = new BranchData();
  _$jscoverage['/ie/traversal.js'].branchData['63'][2] = new BranchData();
  _$jscoverage['/ie/traversal.js'].branchData['65'] = [];
  _$jscoverage['/ie/traversal.js'].branchData['65'][1] = new BranchData();
  _$jscoverage['/ie/traversal.js'].branchData['66'] = [];
  _$jscoverage['/ie/traversal.js'].branchData['66'][1] = new BranchData();
}
_$jscoverage['/ie/traversal.js'].branchData['66'][1].init(21, 33, 'getAttr(children[i], \'id\') === id');
function visit130_66_1(result) {
  _$jscoverage['/ie/traversal.js'].branchData['66'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/traversal.js'].branchData['65'][1].init(109, 5, 'i < l');
function visit129_65_1(result) {
  _$jscoverage['/ie/traversal.js'].branchData['65'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/traversal.js'].branchData['63'][2].init(60, 24, 'getAttr(el, \'id\') !== id');
function visit128_63_2(result) {
  _$jscoverage['/ie/traversal.js'].branchData['63'][2].ranCondition(result);
  return result;
}_$jscoverage['/ie/traversal.js'].branchData['63'][1].init(54, 30, 'el && getAttr(el, \'id\') !== id');
function visit127_63_1(result) {
  _$jscoverage['/ie/traversal.js'].branchData['63'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/traversal.js'].branchData['43'][2].init(41, 17, 'el.nodeType === 1');
function visit126_43_2(result) {
  _$jscoverage['/ie/traversal.js'].branchData['43'][2].ranCondition(result);
  return result;
}_$jscoverage['/ie/traversal.js'].branchData['43'][1].init(25, 33, '!needsFilter || el.nodeType === 1');
function visit125_43_1(result) {
  _$jscoverage['/ie/traversal.js'].branchData['43'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/traversal.js'].branchData['38'][2].init(171, 32, 'typeof nodes.length !== \'number\'');
function visit124_38_2(result) {
  _$jscoverage['/ie/traversal.js'].branchData['38'][2].ranCondition(result);
  return result;
}_$jscoverage['/ie/traversal.js'].branchData['38'][1].init(156, 47, 'needsFilter || typeof nodes.length !== \'number\'');
function visit123_38_1(result) {
  _$jscoverage['/ie/traversal.js'].branchData['38'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/traversal.js'].branchData['36'][1].init(77, 12, 'name === \'*\'');
function visit122_36_1(result) {
  _$jscoverage['/ie/traversal.js'].branchData['36'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/traversal.js'].branchData['33'][1].init(715, 36, 'div.getElementsByTagName(\'*\').length');
function visit121_33_1(result) {
  _$jscoverage['/ie/traversal.js'].branchData['33'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/traversal.js'].branchData['22'][1].init(20, 27, 'a.contains && a.contains(b)');
function visit120_22_1(result) {
  _$jscoverage['/ie/traversal.js'].branchData['22'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/traversal.js'].branchData['21'][2].init(355, 40, 'b.nodeType === Dom.NodeType.ELEMENT_NODE');
function visit119_21_2(result) {
  _$jscoverage['/ie/traversal.js'].branchData['21'][2].ranCondition(result);
  return result;
}_$jscoverage['/ie/traversal.js'].branchData['21'][1].init(350, 45, 'b && b.nodeType === Dom.NodeType.ELEMENT_NODE');
function visit118_21_1(result) {
  _$jscoverage['/ie/traversal.js'].branchData['21'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/traversal.js'].branchData['16'][1].init(233, 7, 'a === b');
function visit117_16_1(result) {
  _$jscoverage['/ie/traversal.js'].branchData['16'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/traversal.js'].branchData['9'][1].init(13, 41, 'a.nodeType === Dom.NodeType.DOCUMENT_NODE');
function visit116_9_1(result) {
  _$jscoverage['/ie/traversal.js'].branchData['9'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/traversal.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/ie/traversal.js'].functionData[0]++;
  _$jscoverage['/ie/traversal.js'].lineData[7]++;
  var Dom = require('dom/base');
  _$jscoverage['/ie/traversal.js'].lineData[8]++;
  Dom._contains = function(a, b) {
  _$jscoverage['/ie/traversal.js'].functionData[1]++;
  _$jscoverage['/ie/traversal.js'].lineData[9]++;
  if (visit116_9_1(a.nodeType === Dom.NodeType.DOCUMENT_NODE)) {
    _$jscoverage['/ie/traversal.js'].lineData[10]++;
    a = a.documentElement;
  }
  _$jscoverage['/ie/traversal.js'].lineData[14]++;
  b = b.parentNode;
  _$jscoverage['/ie/traversal.js'].lineData[16]++;
  if (visit117_16_1(a === b)) {
    _$jscoverage['/ie/traversal.js'].lineData[17]++;
    return true;
  }
  _$jscoverage['/ie/traversal.js'].lineData[21]++;
  if (visit118_21_1(b && visit119_21_2(b.nodeType === Dom.NodeType.ELEMENT_NODE))) {
    _$jscoverage['/ie/traversal.js'].lineData[22]++;
    return visit120_22_1(a.contains && a.contains(b));
  } else {
    _$jscoverage['/ie/traversal.js'].lineData[24]++;
    return false;
  }
};
  _$jscoverage['/ie/traversal.js'].lineData[28]++;
  var div = document.createElement('div');
  _$jscoverage['/ie/traversal.js'].lineData[29]++;
  div.appendChild(document.createComment(''));
  _$jscoverage['/ie/traversal.js'].lineData[31]++;
  var getElementsByTagName;
  _$jscoverage['/ie/traversal.js'].lineData[33]++;
  if (visit121_33_1(div.getElementsByTagName('*').length)) {
    _$jscoverage['/ie/traversal.js'].lineData[34]++;
    getElementsByTagName = function(name, context) {
  _$jscoverage['/ie/traversal.js'].functionData[2]++;
  _$jscoverage['/ie/traversal.js'].lineData[35]++;
  var nodes = context.getElementsByTagName(name), needsFilter = visit122_36_1(name === '*');
  _$jscoverage['/ie/traversal.js'].lineData[38]++;
  if (visit123_38_1(needsFilter || visit124_38_2(typeof nodes.length !== 'number'))) {
    _$jscoverage['/ie/traversal.js'].lineData[39]++;
    var ret = [], i = 0, el;
    _$jscoverage['/ie/traversal.js'].lineData[42]++;
    while ((el = nodes[i++])) {
      _$jscoverage['/ie/traversal.js'].lineData[43]++;
      if (visit125_43_1(!needsFilter || visit126_43_2(el.nodeType === 1))) {
        _$jscoverage['/ie/traversal.js'].lineData[44]++;
        ret.push(el);
      }
    }
    _$jscoverage['/ie/traversal.js'].lineData[47]++;
    return ret;
  } else {
    _$jscoverage['/ie/traversal.js'].lineData[49]++;
    return nodes;
  }
};
  } else {
    _$jscoverage['/ie/traversal.js'].lineData[53]++;
    getElementsByTagName = function(name, context) {
  _$jscoverage['/ie/traversal.js'].functionData[3]++;
  _$jscoverage['/ie/traversal.js'].lineData[54]++;
  return context.getElementsByTagName(name);
};
  }
  _$jscoverage['/ie/traversal.js'].lineData[58]++;
  Dom._getElementsByTagName = getElementsByTagName;
  _$jscoverage['/ie/traversal.js'].lineData[60]++;
  var getAttr = Dom._getSimpleAttr;
  _$jscoverage['/ie/traversal.js'].lineData[61]++;
  Dom._getElementById = function(id, doc) {
  _$jscoverage['/ie/traversal.js'].functionData[4]++;
  _$jscoverage['/ie/traversal.js'].lineData[62]++;
  var el = doc.getElementById(id);
  _$jscoverage['/ie/traversal.js'].lineData[63]++;
  if (visit127_63_1(el && visit128_63_2(getAttr(el, 'id') !== id))) {
    _$jscoverage['/ie/traversal.js'].lineData[64]++;
    var children = getElementsByTagName('*', doc);
    _$jscoverage['/ie/traversal.js'].lineData[65]++;
    for (var i = 0, l = children.length; visit129_65_1(i < l); i++) {
      _$jscoverage['/ie/traversal.js'].lineData[66]++;
      if (visit130_66_1(getAttr(children[i], 'id') === id)) {
        _$jscoverage['/ie/traversal.js'].lineData[67]++;
        return children[i];
      }
    }
  }
  _$jscoverage['/ie/traversal.js'].lineData[71]++;
  return el;
};
});
