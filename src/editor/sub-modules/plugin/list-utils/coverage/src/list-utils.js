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
if (! _$jscoverage['/list-utils.js']) {
  _$jscoverage['/list-utils.js'] = {};
  _$jscoverage['/list-utils.js'].lineData = [];
  _$jscoverage['/list-utils.js'].lineData[6] = 0;
  _$jscoverage['/list-utils.js'].lineData[7] = 0;
  _$jscoverage['/list-utils.js'].lineData[21] = 0;
  _$jscoverage['/list-utils.js'].lineData[22] = 0;
  _$jscoverage['/list-utils.js'].lineData[24] = 0;
  _$jscoverage['/list-utils.js'].lineData[25] = 0;
  _$jscoverage['/list-utils.js'].lineData[27] = 0;
  _$jscoverage['/list-utils.js'].lineData[28] = 0;
  _$jscoverage['/list-utils.js'].lineData[31] = 0;
  _$jscoverage['/list-utils.js'].lineData[33] = 0;
  _$jscoverage['/list-utils.js'].lineData[36] = 0;
  _$jscoverage['/list-utils.js'].lineData[37] = 0;
  _$jscoverage['/list-utils.js'].lineData[39] = 0;
  _$jscoverage['/list-utils.js'].lineData[42] = 0;
  _$jscoverage['/list-utils.js'].lineData[43] = 0;
  _$jscoverage['/list-utils.js'].lineData[44] = 0;
  _$jscoverage['/list-utils.js'].lineData[45] = 0;
  _$jscoverage['/list-utils.js'].lineData[49] = 0;
  _$jscoverage['/list-utils.js'].lineData[51] = 0;
  _$jscoverage['/list-utils.js'].lineData[52] = 0;
  _$jscoverage['/list-utils.js'].lineData[54] = 0;
  _$jscoverage['/list-utils.js'].lineData[56] = 0;
  _$jscoverage['/list-utils.js'].lineData[58] = 0;
  _$jscoverage['/list-utils.js'].lineData[59] = 0;
  _$jscoverage['/list-utils.js'].lineData[63] = 0;
  _$jscoverage['/list-utils.js'].lineData[66] = 0;
  _$jscoverage['/list-utils.js'].lineData[70] = 0;
  _$jscoverage['/list-utils.js'].lineData[76] = 0;
  _$jscoverage['/list-utils.js'].lineData[77] = 0;
  _$jscoverage['/list-utils.js'].lineData[79] = 0;
  _$jscoverage['/list-utils.js'].lineData[80] = 0;
  _$jscoverage['/list-utils.js'].lineData[82] = 0;
  _$jscoverage['/list-utils.js'].lineData[91] = 0;
  _$jscoverage['/list-utils.js'].lineData[92] = 0;
  _$jscoverage['/list-utils.js'].lineData[93] = 0;
  _$jscoverage['/list-utils.js'].lineData[94] = 0;
  _$jscoverage['/list-utils.js'].lineData[97] = 0;
  _$jscoverage['/list-utils.js'].lineData[98] = 0;
  _$jscoverage['/list-utils.js'].lineData[100] = 0;
  _$jscoverage['/list-utils.js'].lineData[101] = 0;
  _$jscoverage['/list-utils.js'].lineData[102] = 0;
  _$jscoverage['/list-utils.js'].lineData[104] = 0;
  _$jscoverage['/list-utils.js'].lineData[105] = 0;
  _$jscoverage['/list-utils.js'].lineData[107] = 0;
  _$jscoverage['/list-utils.js'].lineData[109] = 0;
  _$jscoverage['/list-utils.js'].lineData[110] = 0;
  _$jscoverage['/list-utils.js'].lineData[111] = 0;
  _$jscoverage['/list-utils.js'].lineData[114] = 0;
  _$jscoverage['/list-utils.js'].lineData[115] = 0;
  _$jscoverage['/list-utils.js'].lineData[119] = 0;
  _$jscoverage['/list-utils.js'].lineData[120] = 0;
  _$jscoverage['/list-utils.js'].lineData[121] = 0;
  _$jscoverage['/list-utils.js'].lineData[124] = 0;
  _$jscoverage['/list-utils.js'].lineData[128] = 0;
  _$jscoverage['/list-utils.js'].lineData[129] = 0;
  _$jscoverage['/list-utils.js'].lineData[131] = 0;
  _$jscoverage['/list-utils.js'].lineData[132] = 0;
  _$jscoverage['/list-utils.js'].lineData[134] = 0;
  _$jscoverage['/list-utils.js'].lineData[137] = 0;
  _$jscoverage['/list-utils.js'].lineData[138] = 0;
  _$jscoverage['/list-utils.js'].lineData[141] = 0;
  _$jscoverage['/list-utils.js'].lineData[143] = 0;
  _$jscoverage['/list-utils.js'].lineData[146] = 0;
  _$jscoverage['/list-utils.js'].lineData[149] = 0;
  _$jscoverage['/list-utils.js'].lineData[150] = 0;
  _$jscoverage['/list-utils.js'].lineData[151] = 0;
  _$jscoverage['/list-utils.js'].lineData[153] = 0;
  _$jscoverage['/list-utils.js'].lineData[154] = 0;
  _$jscoverage['/list-utils.js'].lineData[155] = 0;
  _$jscoverage['/list-utils.js'].lineData[159] = 0;
  _$jscoverage['/list-utils.js'].lineData[160] = 0;
  _$jscoverage['/list-utils.js'].lineData[162] = 0;
  _$jscoverage['/list-utils.js'].lineData[164] = 0;
  _$jscoverage['/list-utils.js'].lineData[165] = 0;
  _$jscoverage['/list-utils.js'].lineData[166] = 0;
  _$jscoverage['/list-utils.js'].lineData[169] = 0;
  _$jscoverage['/list-utils.js'].lineData[171] = 0;
  _$jscoverage['/list-utils.js'].lineData[173] = 0;
  _$jscoverage['/list-utils.js'].lineData[178] = 0;
  _$jscoverage['/list-utils.js'].lineData[179] = 0;
  _$jscoverage['/list-utils.js'].lineData[180] = 0;
  _$jscoverage['/list-utils.js'].lineData[181] = 0;
  _$jscoverage['/list-utils.js'].lineData[182] = 0;
  _$jscoverage['/list-utils.js'].lineData[184] = 0;
  _$jscoverage['/list-utils.js'].lineData[188] = 0;
  _$jscoverage['/list-utils.js'].lineData[192] = 0;
}
if (! _$jscoverage['/list-utils.js'].functionData) {
  _$jscoverage['/list-utils.js'].functionData = [];
  _$jscoverage['/list-utils.js'].functionData[0] = 0;
  _$jscoverage['/list-utils.js'].functionData[1] = 0;
  _$jscoverage['/list-utils.js'].functionData[2] = 0;
}
if (! _$jscoverage['/list-utils.js'].branchData) {
  _$jscoverage['/list-utils.js'].branchData = {};
  _$jscoverage['/list-utils.js'].branchData['21'] = [];
  _$jscoverage['/list-utils.js'].branchData['21'][1] = new BranchData();
  _$jscoverage['/list-utils.js'].branchData['24'] = [];
  _$jscoverage['/list-utils.js'].branchData['24'][1] = new BranchData();
  _$jscoverage['/list-utils.js'].branchData['27'] = [];
  _$jscoverage['/list-utils.js'].branchData['27'][1] = new BranchData();
  _$jscoverage['/list-utils.js'].branchData['32'] = [];
  _$jscoverage['/list-utils.js'].branchData['32'][1] = new BranchData();
  _$jscoverage['/list-utils.js'].branchData['36'] = [];
  _$jscoverage['/list-utils.js'].branchData['36'][1] = new BranchData();
  _$jscoverage['/list-utils.js'].branchData['42'] = [];
  _$jscoverage['/list-utils.js'].branchData['42'][1] = new BranchData();
  _$jscoverage['/list-utils.js'].branchData['44'] = [];
  _$jscoverage['/list-utils.js'].branchData['44'][1] = new BranchData();
  _$jscoverage['/list-utils.js'].branchData['44'][2] = new BranchData();
  _$jscoverage['/list-utils.js'].branchData['51'] = [];
  _$jscoverage['/list-utils.js'].branchData['51'][1] = new BranchData();
  _$jscoverage['/list-utils.js'].branchData['57'] = [];
  _$jscoverage['/list-utils.js'].branchData['57'][1] = new BranchData();
  _$jscoverage['/list-utils.js'].branchData['59'] = [];
  _$jscoverage['/list-utils.js'].branchData['59'][1] = new BranchData();
  _$jscoverage['/list-utils.js'].branchData['59'][2] = new BranchData();
  _$jscoverage['/list-utils.js'].branchData['76'] = [];
  _$jscoverage['/list-utils.js'].branchData['76'][1] = new BranchData();
  _$jscoverage['/list-utils.js'].branchData['79'] = [];
  _$jscoverage['/list-utils.js'].branchData['79'][1] = new BranchData();
  _$jscoverage['/list-utils.js'].branchData['79'][2] = new BranchData();
  _$jscoverage['/list-utils.js'].branchData['93'] = [];
  _$jscoverage['/list-utils.js'].branchData['93'][1] = new BranchData();
  _$jscoverage['/list-utils.js'].branchData['94'] = [];
  _$jscoverage['/list-utils.js'].branchData['94'][1] = new BranchData();
  _$jscoverage['/list-utils.js'].branchData['96'] = [];
  _$jscoverage['/list-utils.js'].branchData['96'][1] = new BranchData();
  _$jscoverage['/list-utils.js'].branchData['101'] = [];
  _$jscoverage['/list-utils.js'].branchData['101'][1] = new BranchData();
  _$jscoverage['/list-utils.js'].branchData['105'] = [];
  _$jscoverage['/list-utils.js'].branchData['105'][1] = new BranchData();
  _$jscoverage['/list-utils.js'].branchData['111'] = [];
  _$jscoverage['/list-utils.js'].branchData['111'][1] = new BranchData();
  _$jscoverage['/list-utils.js'].branchData['111'][2] = new BranchData();
  _$jscoverage['/list-utils.js'].branchData['111'][3] = new BranchData();
  _$jscoverage['/list-utils.js'].branchData['114'] = [];
  _$jscoverage['/list-utils.js'].branchData['114'][1] = new BranchData();
  _$jscoverage['/list-utils.js'].branchData['119'] = [];
  _$jscoverage['/list-utils.js'].branchData['119'][1] = new BranchData();
  _$jscoverage['/list-utils.js'].branchData['128'] = [];
  _$jscoverage['/list-utils.js'].branchData['128'][1] = new BranchData();
  _$jscoverage['/list-utils.js'].branchData['131'] = [];
  _$jscoverage['/list-utils.js'].branchData['131'][1] = new BranchData();
  _$jscoverage['/list-utils.js'].branchData['137'] = [];
  _$jscoverage['/list-utils.js'].branchData['137'][1] = new BranchData();
  _$jscoverage['/list-utils.js'].branchData['137'][2] = new BranchData();
  _$jscoverage['/list-utils.js'].branchData['137'][3] = new BranchData();
  _$jscoverage['/list-utils.js'].branchData['138'] = [];
  _$jscoverage['/list-utils.js'].branchData['138'][1] = new BranchData();
  _$jscoverage['/list-utils.js'].branchData['139'] = [];
  _$jscoverage['/list-utils.js'].branchData['139'][1] = new BranchData();
  _$jscoverage['/list-utils.js'].branchData['139'][2] = new BranchData();
  _$jscoverage['/list-utils.js'].branchData['140'] = [];
  _$jscoverage['/list-utils.js'].branchData['140'][1] = new BranchData();
  _$jscoverage['/list-utils.js'].branchData['146'] = [];
  _$jscoverage['/list-utils.js'].branchData['146'][1] = new BranchData();
  _$jscoverage['/list-utils.js'].branchData['146'][2] = new BranchData();
  _$jscoverage['/list-utils.js'].branchData['147'] = [];
  _$jscoverage['/list-utils.js'].branchData['147'][1] = new BranchData();
  _$jscoverage['/list-utils.js'].branchData['147'][2] = new BranchData();
  _$jscoverage['/list-utils.js'].branchData['151'] = [];
  _$jscoverage['/list-utils.js'].branchData['151'][1] = new BranchData();
  _$jscoverage['/list-utils.js'].branchData['151'][2] = new BranchData();
  _$jscoverage['/list-utils.js'].branchData['160'] = [];
  _$jscoverage['/list-utils.js'].branchData['160'][1] = new BranchData();
  _$jscoverage['/list-utils.js'].branchData['160'][2] = new BranchData();
  _$jscoverage['/list-utils.js'].branchData['160'][3] = new BranchData();
  _$jscoverage['/list-utils.js'].branchData['161'] = [];
  _$jscoverage['/list-utils.js'].branchData['161'][1] = new BranchData();
  _$jscoverage['/list-utils.js'].branchData['171'] = [];
  _$jscoverage['/list-utils.js'].branchData['171'][1] = new BranchData();
  _$jscoverage['/list-utils.js'].branchData['171'][2] = new BranchData();
  _$jscoverage['/list-utils.js'].branchData['172'] = [];
  _$jscoverage['/list-utils.js'].branchData['172'][1] = new BranchData();
  _$jscoverage['/list-utils.js'].branchData['178'] = [];
  _$jscoverage['/list-utils.js'].branchData['178'][1] = new BranchData();
  _$jscoverage['/list-utils.js'].branchData['180'] = [];
  _$jscoverage['/list-utils.js'].branchData['180'][1] = new BranchData();
  _$jscoverage['/list-utils.js'].branchData['181'] = [];
  _$jscoverage['/list-utils.js'].branchData['181'][1] = new BranchData();
}
_$jscoverage['/list-utils.js'].branchData['181'][1].init(29, 53, 'currentNode[0].nodeType === Dom.NodeType.ELEMENT_NODE');
function visit50_181_1(result) {
  _$jscoverage['/list-utils.js'].branchData['181'][1].ranCondition(result);
  return result;
}_$jscoverage['/list-utils.js'].branchData['180'][1].init(95, 29, 'currentNode && currentNode[0]');
function visit49_180_1(result) {
  _$jscoverage['/list-utils.js'].branchData['180'][1].ranCondition(result);
  return result;
}_$jscoverage['/list-utils.js'].branchData['178'][1].init(5464, 8, 'database');
function visit48_178_1(result) {
  _$jscoverage['/list-utils.js'].branchData['178'][1].ranCondition(result);
  return result;
}_$jscoverage['/list-utils.js'].branchData['172'][1].init(59, 59, 'Math.max(listArray[currentIndex].indent, 0) < indentLevel');
function visit47_172_1(result) {
  _$jscoverage['/list-utils.js'].branchData['172'][1].ranCondition(result);
  return result;
}_$jscoverage['/list-utils.js'].branchData['171'][2].init(4503, 32, 'listArray.length <= currentIndex');
function visit46_171_2(result) {
  _$jscoverage['/list-utils.js'].branchData['171'][2].ranCondition(result);
  return result;
}_$jscoverage['/list-utils.js'].branchData['171'][1].init(4503, 119, 'listArray.length <= currentIndex || Math.max(listArray[currentIndex].indent, 0) < indentLevel');
function visit45_171_1(result) {
  _$jscoverage['/list-utils.js'].branchData['171'][1].ranCondition(result);
  return result;
}_$jscoverage['/list-utils.js'].branchData['161'][1].init(60, 27, 'currentListItemName === \'p\'');
function visit44_161_1(result) {
  _$jscoverage['/list-utils.js'].branchData['161'][1].ranCondition(result);
  return result;
}_$jscoverage['/list-utils.js'].branchData['160'][3].init(2738, 29, 'currentListItemName === \'div\'');
function visit43_160_3(result) {
  _$jscoverage['/list-utils.js'].branchData['160'][3].ranCondition(result);
  return result;
}_$jscoverage['/list-utils.js'].branchData['160'][2].init(2738, 88, 'currentListItemName === \'div\' || currentListItemName === \'p\'');
function visit42_160_2(result) {
  _$jscoverage['/list-utils.js'].branchData['160'][2].ranCondition(result);
  return result;
}_$jscoverage['/list-utils.js'].branchData['160'][1].init(2726, 102, '!UA.ie && (currentListItemName === \'div\' || currentListItemName === \'p\')');
function visit41_160_1(result) {
  _$jscoverage['/list-utils.js'].branchData['160'][1].ranCondition(result);
  return result;
}_$jscoverage['/list-utils.js'].branchData['151'][2].init(164, 49, 'firstChild.nodeType === Dom.NodeType.ELEMENT_NODE');
function visit40_151_2(result) {
  _$jscoverage['/list-utils.js'].branchData['151'][2].ranCondition(result);
  return result;
}_$jscoverage['/list-utils.js'].branchData['151'][1].init(164, 119, 'firstChild.nodeType === Dom.NodeType.ELEMENT_NODE && Dom._4eIsBlockBoundary(firstChild)');
function visit39_151_1(result) {
  _$jscoverage['/list-utils.js'].branchData['151'][1].ranCondition(result);
  return result;
}_$jscoverage['/list-utils.js'].branchData['147'][2].init(1965, 47, 'Dom.nodeName(currentListItem) === paragraphMode');
function visit38_147_2(result) {
  _$jscoverage['/list-utils.js'].branchData['147'][2].ranCondition(result);
  return result;
}_$jscoverage['/list-utils.js'].branchData['147'][1].init(85, 105, 'Dom.nodeName(currentListItem) === paragraphMode && currentListItem.firstChild');
function visit37_147_1(result) {
  _$jscoverage['/list-utils.js'].branchData['147'][1].ranCondition(result);
  return result;
}_$jscoverage['/list-utils.js'].branchData['146'][2].init(1877, 54, 'currentListItem.nodeType === Dom.NodeType.ELEMENT_NODE');
function visit36_146_2(result) {
  _$jscoverage['/list-utils.js'].branchData['146'][2].ranCondition(result);
  return result;
}_$jscoverage['/list-utils.js'].branchData['146'][1].init(1877, 191, 'currentListItem.nodeType === Dom.NodeType.ELEMENT_NODE && Dom.nodeName(currentListItem) === paragraphMode && currentListItem.firstChild');
function visit35_146_1(result) {
  _$jscoverage['/list-utils.js'].branchData['146'][1].ranCondition(result);
  return result;
}_$jscoverage['/list-utils.js'].branchData['140'][1].init(99, 57, 'currentListItem.lastChild.getAttribute(\'type\') === \'_moz\'');
function visit34_140_1(result) {
  _$jscoverage['/list-utils.js'].branchData['140'][1].ranCondition(result);
  return result;
}_$jscoverage['/list-utils.js'].branchData['139'][2].init(96, 64, 'currentListItem.lastChild.nodeType === Dom.NodeType.ELEMENT_NODE');
function visit33_139_2(result) {
  _$jscoverage['/list-utils.js'].branchData['139'][2].ranCondition(result);
  return result;
}_$jscoverage['/list-utils.js'].branchData['139'][1].init(60, 157, 'currentListItem.lastChild.nodeType === Dom.NodeType.ELEMENT_NODE && currentListItem.lastChild.getAttribute(\'type\') === \'_moz\'');
function visit32_139_1(result) {
  _$jscoverage['/list-utils.js'].branchData['139'][1].ranCondition(result);
  return result;
}_$jscoverage['/list-utils.js'].branchData['138'][1].init(33, 218, 'currentListItem.lastChild && currentListItem.lastChild.nodeType === Dom.NodeType.ELEMENT_NODE && currentListItem.lastChild.getAttribute(\'type\') === \'_moz\'');
function visit31_138_1(result) {
  _$jscoverage['/list-utils.js'].branchData['138'][1].ranCondition(result);
  return result;
}_$jscoverage['/list-utils.js'].branchData['137'][3].init(1358, 37, 'currentIndex !== listArray.length - 1');
function visit30_137_3(result) {
  _$jscoverage['/list-utils.js'].branchData['137'][3].ranCondition(result);
  return result;
}_$jscoverage['/list-utils.js'].branchData['137'][2].init(1294, 60, 'currentListItem.nodeType === NodeType.DOCUMENT_FRAGMENT_NODE');
function visit29_137_2(result) {
  _$jscoverage['/list-utils.js'].branchData['137'][2].ranCondition(result);
  return result;
}_$jscoverage['/list-utils.js'].branchData['137'][1].init(1294, 101, 'currentListItem.nodeType === NodeType.DOCUMENT_FRAGMENT_NODE && currentIndex !== listArray.length - 1');
function visit28_137_1(result) {
  _$jscoverage['/list-utils.js'].branchData['137'][1].ranCondition(result);
  return result;
}_$jscoverage['/list-utils.js'].branchData['131'][1].init(161, 60, 'currentListItem.nodeType === NodeType.DOCUMENT_FRAGMENT_NODE');
function visit27_131_1(result) {
  _$jscoverage['/list-utils.js'].branchData['131'][1].ranCondition(result);
  return result;
}_$jscoverage['/list-utils.js'].branchData['128'][1].init(810, 24, 'i < item.contents.length');
function visit26_128_1(result) {
  _$jscoverage['/list-utils.js'].branchData['128'][1].ranCondition(result);
  return result;
}_$jscoverage['/list-utils.js'].branchData['119'][1].init(171, 36, 'item.grandparent.nodeName() !== \'td\'');
function visit25_119_1(result) {
  _$jscoverage['/list-utils.js'].branchData['119'][1].ranCondition(result);
  return result;
}_$jscoverage['/list-utils.js'].branchData['114'][1].init(30, 44, 'listNodeNames[item.grandparent.nodeName()]');
function visit24_114_1(result) {
  _$jscoverage['/list-utils.js'].branchData['114'][1].ranCondition(result);
  return result;
}_$jscoverage['/list-utils.js'].branchData['111'][3].init(1251, 54, '!baseIndex && item.grandparent');
function visit23_111_3(result) {
  _$jscoverage['/list-utils.js'].branchData['111'][3].ranCondition(result);
  return result;
}_$jscoverage['/list-utils.js'].branchData['111'][2].init(1229, 18, 'item.indent === -1');
function visit22_111_2(result) {
  _$jscoverage['/list-utils.js'].branchData['111'][2].ranCondition(result);
  return result;
}_$jscoverage['/list-utils.js'].branchData['111'][1].init(1229, 76, 'item.indent === -1 && !baseIndex && item.grandparent');
function visit21_111_1(result) {
  _$jscoverage['/list-utils.js'].branchData['111'][1].ranCondition(result);
  return result;
}_$jscoverage['/list-utils.js'].branchData['105'][1].init(833, 44, 'item.indent === Math.max(indentLevel, 0) + 1');
function visit20_105_1(result) {
  _$jscoverage['/list-utils.js'].branchData['105'][1].ranCondition(result);
  return result;
}_$jscoverage['/list-utils.js'].branchData['101'][1].init(499, 24, 'i < item.contents.length');
function visit19_101_1(result) {
  _$jscoverage['/list-utils.js'].branchData['101'][1].ranCondition(result);
  return result;
}_$jscoverage['/list-utils.js'].branchData['96'][1].init(92, 67, 'listArray[currentIndex].parent.nodeName() !== rootNode.nodeName()');
function visit18_96_1(result) {
  _$jscoverage['/list-utils.js'].branchData['96'][1].ranCondition(result);
  return result;
}_$jscoverage['/list-utils.js'].branchData['94'][1].init(29, 160, '!rootNode || listArray[currentIndex].parent.nodeName() !== rootNode.nodeName()');
function visit17_94_1(result) {
  _$jscoverage['/list-utils.js'].branchData['94'][1].ranCondition(result);
  return result;
}_$jscoverage['/list-utils.js'].branchData['93'][1].init(83, 27, 'item.indent === indentLevel');
function visit16_93_1(result) {
  _$jscoverage['/list-utils.js'].branchData['93'][1].ranCondition(result);
  return result;
}_$jscoverage['/list-utils.js'].branchData['79'][2].init(122, 32, 'listArray.length < baseIndex + 1');
function visit15_79_2(result) {
  _$jscoverage['/list-utils.js'].branchData['79'][2].ranCondition(result);
  return result;
}_$jscoverage['/list-utils.js'].branchData['79'][1].init(108, 46, '!listArray || listArray.length < baseIndex + 1');
function visit14_79_1(result) {
  _$jscoverage['/list-utils.js'].branchData['79'][1].ranCondition(result);
  return result;
}_$jscoverage['/list-utils.js'].branchData['76'][1].init(21, 10, '!baseIndex');
function visit13_76_1(result) {
  _$jscoverage['/list-utils.js'].branchData['76'][1].ranCondition(result);
  return result;
}_$jscoverage['/list-utils.js'].branchData['59'][2].init(98, 47, 'child[0].nodeType === Dom.NodeType.ELEMENT_NODE');
function visit12_59_2(result) {
  _$jscoverage['/list-utils.js'].branchData['59'][2].ranCondition(result);
  return result;
}_$jscoverage['/list-utils.js'].branchData['59'][1].init(98, 112, 'child[0].nodeType === Dom.NodeType.ELEMENT_NODE && listNodeNames[child.nodeName()]');
function visit11_59_1(result) {
  _$jscoverage['/list-utils.js'].branchData['59'][1].ranCondition(result);
  return result;
}_$jscoverage['/list-utils.js'].branchData['57'][1].init(95, 18, 'j < itemChildCount');
function visit10_57_1(result) {
  _$jscoverage['/list-utils.js'].branchData['57'][1].ranCondition(result);
  return result;
}_$jscoverage['/list-utils.js'].branchData['51'][1].init(883, 8, 'database');
function visit9_51_1(result) {
  _$jscoverage['/list-utils.js'].branchData['51'][1].ranCondition(result);
  return result;
}_$jscoverage['/list-utils.js'].branchData['44'][2].init(117, 39, 'itemObj.grandparent.nodeName() === \'li\'');
function visit8_44_2(result) {
  _$jscoverage['/list-utils.js'].branchData['44'][2].ranCondition(result);
  return result;
}_$jscoverage['/list-utils.js'].branchData['44'][1].init(94, 62, 'itemObj.grandparent && itemObj.grandparent.nodeName() === \'li\'');
function visit7_44_1(result) {
  _$jscoverage['/list-utils.js'].branchData['44'][1].ranCondition(result);
  return result;
}_$jscoverage['/list-utils.js'].branchData['42'][1].init(440, 16, '!grandparentNode');
function visit6_42_1(result) {
  _$jscoverage['/list-utils.js'].branchData['42'][1].ranCondition(result);
  return result;
}_$jscoverage['/list-utils.js'].branchData['36'][1].init(164, 28, 'listItem.nodeName() !== \'li\'');
function visit5_36_1(result) {
  _$jscoverage['/list-utils.js'].branchData['36'][1].ranCondition(result);
  return result;
}_$jscoverage['/list-utils.js'].branchData['32'][1].init(75, 9, 'i < count');
function visit4_32_1(result) {
  _$jscoverage['/list-utils.js'].branchData['32'][1].ranCondition(result);
  return result;
}_$jscoverage['/list-utils.js'].branchData['27'][1].init(230, 10, '!baseArray');
function visit3_27_1(result) {
  _$jscoverage['/list-utils.js'].branchData['27'][1].ranCondition(result);
  return result;
}_$jscoverage['/list-utils.js'].branchData['24'][1].init(131, 16, '!baseIndentLevel');
function visit2_24_1(result) {
  _$jscoverage['/list-utils.js'].branchData['24'][1].ranCondition(result);
  return result;
}_$jscoverage['/list-utils.js'].branchData['21'][1].init(21, 37, '!listNodeNames[listNode.nodeName()]');
function visit1_21_1(result) {
  _$jscoverage['/list-utils.js'].branchData['21'][1].ranCondition(result);
  return result;
}_$jscoverage['/list-utils.js'].lineData[6]++;
KISSY.add(function(S) {
  _$jscoverage['/list-utils.js'].functionData[0]++;
  _$jscoverage['/list-utils.js'].lineData[7]++;
  var listNodeNames = {
  ol: 1, 
  ul: 1}, Node = S.Node, Dom = S.DOM, NodeType = Dom.NodeType, UA = S.UA, list = {
  listToArray: function(listNode, database, baseArray, baseIndentLevel, grandparentNode) {
  _$jscoverage['/list-utils.js'].functionData[1]++;
  _$jscoverage['/list-utils.js'].lineData[21]++;
  if (visit1_21_1(!listNodeNames[listNode.nodeName()])) {
    _$jscoverage['/list-utils.js'].lineData[22]++;
    return [];
  }
  _$jscoverage['/list-utils.js'].lineData[24]++;
  if (visit2_24_1(!baseIndentLevel)) {
    _$jscoverage['/list-utils.js'].lineData[25]++;
    baseIndentLevel = 0;
  }
  _$jscoverage['/list-utils.js'].lineData[27]++;
  if (visit3_27_1(!baseArray)) {
    _$jscoverage['/list-utils.js'].lineData[28]++;
    baseArray = [];
  }
  _$jscoverage['/list-utils.js'].lineData[31]++;
  for (var i = 0, count = listNode[0].childNodes.length; visit4_32_1(i < count); i++) {
    _$jscoverage['/list-utils.js'].lineData[33]++;
    var listItem = new Node(listNode[0].childNodes[i]);
    _$jscoverage['/list-utils.js'].lineData[36]++;
    if (visit5_36_1(listItem.nodeName() !== 'li')) {
      _$jscoverage['/list-utils.js'].lineData[37]++;
      continue;
    }
    _$jscoverage['/list-utils.js'].lineData[39]++;
    var itemObj = {
  'parent': listNode, 
  indent: baseIndentLevel, 
  element: listItem, 
  contents: []};
    _$jscoverage['/list-utils.js'].lineData[42]++;
    if (visit6_42_1(!grandparentNode)) {
      _$jscoverage['/list-utils.js'].lineData[43]++;
      itemObj.grandparent = listNode.parent();
      _$jscoverage['/list-utils.js'].lineData[44]++;
      if (visit7_44_1(itemObj.grandparent && visit8_44_2(itemObj.grandparent.nodeName() === 'li'))) {
        _$jscoverage['/list-utils.js'].lineData[45]++;
        itemObj.grandparent = itemObj.grandparent.parent();
      }
    } else {
      _$jscoverage['/list-utils.js'].lineData[49]++;
      itemObj.grandparent = grandparentNode;
    }
    _$jscoverage['/list-utils.js'].lineData[51]++;
    if (visit9_51_1(database)) {
      _$jscoverage['/list-utils.js'].lineData[52]++;
      listItem._4eSetMarker(database, 'listarray_index', baseArray.length, undefined);
    }
    _$jscoverage['/list-utils.js'].lineData[54]++;
    baseArray.push(itemObj);
    _$jscoverage['/list-utils.js'].lineData[56]++;
    for (var j = 0, itemChildCount = listItem[0].childNodes.length, child; visit10_57_1(j < itemChildCount); j++) {
      _$jscoverage['/list-utils.js'].lineData[58]++;
      child = new Node(listItem[0].childNodes[j]);
      _$jscoverage['/list-utils.js'].lineData[59]++;
      if (visit11_59_1(visit12_59_2(child[0].nodeType === Dom.NodeType.ELEMENT_NODE) && listNodeNames[child.nodeName()])) {
        _$jscoverage['/list-utils.js'].lineData[63]++;
        list.listToArray(child, database, baseArray, baseIndentLevel + 1, itemObj.grandparent);
      } else {
        _$jscoverage['/list-utils.js'].lineData[66]++;
        itemObj.contents.push(child);
      }
    }
  }
  _$jscoverage['/list-utils.js'].lineData[70]++;
  return baseArray;
}, 
  arrayToList: function(listArray, database, baseIndex, paragraphMode) {
  _$jscoverage['/list-utils.js'].functionData[2]++;
  _$jscoverage['/list-utils.js'].lineData[76]++;
  if (visit13_76_1(!baseIndex)) {
    _$jscoverage['/list-utils.js'].lineData[77]++;
    baseIndex = 0;
  }
  _$jscoverage['/list-utils.js'].lineData[79]++;
  if (visit14_79_1(!listArray || visit15_79_2(listArray.length < baseIndex + 1))) {
    _$jscoverage['/list-utils.js'].lineData[80]++;
    return null;
  }
  _$jscoverage['/list-utils.js'].lineData[82]++;
  var doc = listArray[baseIndex].parent[0].ownerDocument, retval = doc.createDocumentFragment(), rootNode = null, i, currentIndex = baseIndex, indentLevel = Math.max(listArray[baseIndex].indent, 0), currentListItem = null;
  _$jscoverage['/list-utils.js'].lineData[91]++;
  while (true) {
    _$jscoverage['/list-utils.js'].lineData[92]++;
    var item = listArray[currentIndex];
    _$jscoverage['/list-utils.js'].lineData[93]++;
    if (visit16_93_1(item.indent === indentLevel)) {
      _$jscoverage['/list-utils.js'].lineData[94]++;
      if (visit17_94_1(!rootNode || visit18_96_1(listArray[currentIndex].parent.nodeName() !== rootNode.nodeName()))) {
        _$jscoverage['/list-utils.js'].lineData[97]++;
        rootNode = listArray[currentIndex].parent.clone(false);
        _$jscoverage['/list-utils.js'].lineData[98]++;
        retval.appendChild(rootNode[0]);
      }
      _$jscoverage['/list-utils.js'].lineData[100]++;
      currentListItem = rootNode[0].appendChild(item.element.clone(false)[0]);
      _$jscoverage['/list-utils.js'].lineData[101]++;
      for (i = 0; visit19_101_1(i < item.contents.length); i++) {
        _$jscoverage['/list-utils.js'].lineData[102]++;
        currentListItem.appendChild(item.contents[i].clone(true)[0]);
      }
      _$jscoverage['/list-utils.js'].lineData[104]++;
      currentIndex++;
    } else {
      _$jscoverage['/list-utils.js'].lineData[105]++;
      if (visit20_105_1(item.indent === Math.max(indentLevel, 0) + 1)) {
        _$jscoverage['/list-utils.js'].lineData[107]++;
        var listData = list.arrayToList(listArray, null, currentIndex, paragraphMode);
        _$jscoverage['/list-utils.js'].lineData[109]++;
        currentListItem.appendChild(listData.listNode);
        _$jscoverage['/list-utils.js'].lineData[110]++;
        currentIndex = listData.nextIndex;
      } else {
        _$jscoverage['/list-utils.js'].lineData[111]++;
        if (visit21_111_1(visit22_111_2(item.indent === -1) && visit23_111_3(!baseIndex && item.grandparent))) {
          _$jscoverage['/list-utils.js'].lineData[114]++;
          if (visit24_114_1(listNodeNames[item.grandparent.nodeName()])) {
            _$jscoverage['/list-utils.js'].lineData[115]++;
            currentListItem = item.element.clone(false)[0];
          } else {
            _$jscoverage['/list-utils.js'].lineData[119]++;
            if (visit25_119_1(item.grandparent.nodeName() !== 'td')) {
              _$jscoverage['/list-utils.js'].lineData[120]++;
              currentListItem = doc.createElement(paragraphMode);
              _$jscoverage['/list-utils.js'].lineData[121]++;
              item.element._4eCopyAttributes(new Node(currentListItem));
            } else {
              _$jscoverage['/list-utils.js'].lineData[124]++;
              currentListItem = doc.createDocumentFragment();
            }
          }
          _$jscoverage['/list-utils.js'].lineData[128]++;
          for (i = 0; visit26_128_1(i < item.contents.length); i++) {
            _$jscoverage['/list-utils.js'].lineData[129]++;
            var ic = item.contents[i].clone(true);
            _$jscoverage['/list-utils.js'].lineData[131]++;
            if (visit27_131_1(currentListItem.nodeType === NodeType.DOCUMENT_FRAGMENT_NODE)) {
              _$jscoverage['/list-utils.js'].lineData[132]++;
              item.element._4eCopyAttributes(new Node(ic));
            }
            _$jscoverage['/list-utils.js'].lineData[134]++;
            currentListItem.appendChild(ic[0]);
          }
          _$jscoverage['/list-utils.js'].lineData[137]++;
          if (visit28_137_1(visit29_137_2(currentListItem.nodeType === NodeType.DOCUMENT_FRAGMENT_NODE) && visit30_137_3(currentIndex !== listArray.length - 1))) {
            _$jscoverage['/list-utils.js'].lineData[138]++;
            if (visit31_138_1(currentListItem.lastChild && visit32_139_1(visit33_139_2(currentListItem.lastChild.nodeType === Dom.NodeType.ELEMENT_NODE) && visit34_140_1(currentListItem.lastChild.getAttribute('type') === '_moz')))) {
              _$jscoverage['/list-utils.js'].lineData[141]++;
              Dom._4eRemove(currentListItem.lastChild);
            }
            _$jscoverage['/list-utils.js'].lineData[143]++;
            Dom._4eAppendBogus(currentListItem);
          }
          _$jscoverage['/list-utils.js'].lineData[146]++;
          if (visit35_146_1(visit36_146_2(currentListItem.nodeType === Dom.NodeType.ELEMENT_NODE) && visit37_147_1(visit38_147_2(Dom.nodeName(currentListItem) === paragraphMode) && currentListItem.firstChild))) {
            _$jscoverage['/list-utils.js'].lineData[149]++;
            Dom._4eTrim(currentListItem);
            _$jscoverage['/list-utils.js'].lineData[150]++;
            var firstChild = currentListItem.firstChild;
            _$jscoverage['/list-utils.js'].lineData[151]++;
            if (visit39_151_1(visit40_151_2(firstChild.nodeType === Dom.NodeType.ELEMENT_NODE) && Dom._4eIsBlockBoundary(firstChild))) {
              _$jscoverage['/list-utils.js'].lineData[153]++;
              var tmp = doc.createDocumentFragment();
              _$jscoverage['/list-utils.js'].lineData[154]++;
              Dom._4eMoveChildren(currentListItem, tmp);
              _$jscoverage['/list-utils.js'].lineData[155]++;
              currentListItem = tmp;
            }
          }
          _$jscoverage['/list-utils.js'].lineData[159]++;
          var currentListItemName = Dom.nodeName(currentListItem);
          _$jscoverage['/list-utils.js'].lineData[160]++;
          if (visit41_160_1(!UA.ie && (visit42_160_2(visit43_160_3(currentListItemName === 'div') || visit44_161_1(currentListItemName === 'p'))))) {
            _$jscoverage['/list-utils.js'].lineData[162]++;
            Dom._4eAppendBogus(currentListItem);
          }
          _$jscoverage['/list-utils.js'].lineData[164]++;
          retval.appendChild(currentListItem);
          _$jscoverage['/list-utils.js'].lineData[165]++;
          rootNode = null;
          _$jscoverage['/list-utils.js'].lineData[166]++;
          currentIndex++;
        } else {
          _$jscoverage['/list-utils.js'].lineData[169]++;
          return null;
        }
      }
    }
    _$jscoverage['/list-utils.js'].lineData[171]++;
    if (visit45_171_1(visit46_171_2(listArray.length <= currentIndex) || visit47_172_1(Math.max(listArray[currentIndex].indent, 0) < indentLevel))) {
      _$jscoverage['/list-utils.js'].lineData[173]++;
      break;
    }
  }
  _$jscoverage['/list-utils.js'].lineData[178]++;
  if (visit48_178_1(database)) {
    _$jscoverage['/list-utils.js'].lineData[179]++;
    var currentNode = new Node(retval.firstChild);
    _$jscoverage['/list-utils.js'].lineData[180]++;
    while (visit49_180_1(currentNode && currentNode[0])) {
      _$jscoverage['/list-utils.js'].lineData[181]++;
      if (visit50_181_1(currentNode[0].nodeType === Dom.NodeType.ELEMENT_NODE)) {
        _$jscoverage['/list-utils.js'].lineData[182]++;
        currentNode._4eClearMarkers(database, true);
      }
      _$jscoverage['/list-utils.js'].lineData[184]++;
      currentNode = currentNode._4eNextSourceNode();
    }
  }
  _$jscoverage['/list-utils.js'].lineData[188]++;
  return {
  listNode: retval, 
  nextIndex: currentIndex};
}};
  _$jscoverage['/list-utils.js'].lineData[192]++;
  return list;
});
