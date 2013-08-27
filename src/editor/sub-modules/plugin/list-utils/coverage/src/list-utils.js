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
  _$jscoverage['/list-utils.js'].lineData[5] = 0;
  _$jscoverage['/list-utils.js'].lineData[6] = 0;
  _$jscoverage['/list-utils.js'].lineData[20] = 0;
  _$jscoverage['/list-utils.js'].lineData[21] = 0;
  _$jscoverage['/list-utils.js'].lineData[23] = 0;
  _$jscoverage['/list-utils.js'].lineData[24] = 0;
  _$jscoverage['/list-utils.js'].lineData[25] = 0;
  _$jscoverage['/list-utils.js'].lineData[26] = 0;
  _$jscoverage['/list-utils.js'].lineData[29] = 0;
  _$jscoverage['/list-utils.js'].lineData[31] = 0;
  _$jscoverage['/list-utils.js'].lineData[34] = 0;
  _$jscoverage['/list-utils.js'].lineData[35] = 0;
  _$jscoverage['/list-utils.js'].lineData[37] = 0;
  _$jscoverage['/list-utils.js'].lineData[40] = 0;
  _$jscoverage['/list-utils.js'].lineData[41] = 0;
  _$jscoverage['/list-utils.js'].lineData[42] = 0;
  _$jscoverage['/list-utils.js'].lineData[43] = 0;
  _$jscoverage['/list-utils.js'].lineData[46] = 0;
  _$jscoverage['/list-utils.js'].lineData[48] = 0;
  _$jscoverage['/list-utils.js'].lineData[49] = 0;
  _$jscoverage['/list-utils.js'].lineData[51] = 0;
  _$jscoverage['/list-utils.js'].lineData[53] = 0;
  _$jscoverage['/list-utils.js'].lineData[55] = 0;
  _$jscoverage['/list-utils.js'].lineData[56] = 0;
  _$jscoverage['/list-utils.js'].lineData[60] = 0;
  _$jscoverage['/list-utils.js'].lineData[63] = 0;
  _$jscoverage['/list-utils.js'].lineData[67] = 0;
  _$jscoverage['/list-utils.js'].lineData[73] = 0;
  _$jscoverage['/list-utils.js'].lineData[74] = 0;
  _$jscoverage['/list-utils.js'].lineData[76] = 0;
  _$jscoverage['/list-utils.js'].lineData[77] = 0;
  _$jscoverage['/list-utils.js'].lineData[79] = 0;
  _$jscoverage['/list-utils.js'].lineData[87] = 0;
  _$jscoverage['/list-utils.js'].lineData[88] = 0;
  _$jscoverage['/list-utils.js'].lineData[89] = 0;
  _$jscoverage['/list-utils.js'].lineData[90] = 0;
  _$jscoverage['/list-utils.js'].lineData[94] = 0;
  _$jscoverage['/list-utils.js'].lineData[95] = 0;
  _$jscoverage['/list-utils.js'].lineData[97] = 0;
  _$jscoverage['/list-utils.js'].lineData[98] = 0;
  _$jscoverage['/list-utils.js'].lineData[99] = 0;
  _$jscoverage['/list-utils.js'].lineData[101] = 0;
  _$jscoverage['/list-utils.js'].lineData[102] = 0;
  _$jscoverage['/list-utils.js'].lineData[104] = 0;
  _$jscoverage['/list-utils.js'].lineData[106] = 0;
  _$jscoverage['/list-utils.js'].lineData[107] = 0;
  _$jscoverage['/list-utils.js'].lineData[108] = 0;
  _$jscoverage['/list-utils.js'].lineData[111] = 0;
  _$jscoverage['/list-utils.js'].lineData[112] = 0;
  _$jscoverage['/list-utils.js'].lineData[116] = 0;
  _$jscoverage['/list-utils.js'].lineData[117] = 0;
  _$jscoverage['/list-utils.js'].lineData[118] = 0;
  _$jscoverage['/list-utils.js'].lineData[121] = 0;
  _$jscoverage['/list-utils.js'].lineData[124] = 0;
  _$jscoverage['/list-utils.js'].lineData[125] = 0;
  _$jscoverage['/list-utils.js'].lineData[127] = 0;
  _$jscoverage['/list-utils.js'].lineData[128] = 0;
  _$jscoverage['/list-utils.js'].lineData[130] = 0;
  _$jscoverage['/list-utils.js'].lineData[133] = 0;
  _$jscoverage['/list-utils.js'].lineData[135] = 0;
  _$jscoverage['/list-utils.js'].lineData[138] = 0;
  _$jscoverage['/list-utils.js'].lineData[140] = 0;
  _$jscoverage['/list-utils.js'].lineData[143] = 0;
  _$jscoverage['/list-utils.js'].lineData[146] = 0;
  _$jscoverage['/list-utils.js'].lineData[147] = 0;
  _$jscoverage['/list-utils.js'].lineData[148] = 0;
  _$jscoverage['/list-utils.js'].lineData[150] = 0;
  _$jscoverage['/list-utils.js'].lineData[151] = 0;
  _$jscoverage['/list-utils.js'].lineData[152] = 0;
  _$jscoverage['/list-utils.js'].lineData[156] = 0;
  _$jscoverage['/list-utils.js'].lineData[157] = 0;
  _$jscoverage['/list-utils.js'].lineData[159] = 0;
  _$jscoverage['/list-utils.js'].lineData[161] = 0;
  _$jscoverage['/list-utils.js'].lineData[162] = 0;
  _$jscoverage['/list-utils.js'].lineData[163] = 0;
  _$jscoverage['/list-utils.js'].lineData[166] = 0;
  _$jscoverage['/list-utils.js'].lineData[168] = 0;
  _$jscoverage['/list-utils.js'].lineData[170] = 0;
  _$jscoverage['/list-utils.js'].lineData[174] = 0;
  _$jscoverage['/list-utils.js'].lineData[175] = 0;
  _$jscoverage['/list-utils.js'].lineData[176] = 0;
  _$jscoverage['/list-utils.js'].lineData[177] = 0;
  _$jscoverage['/list-utils.js'].lineData[178] = 0;
  _$jscoverage['/list-utils.js'].lineData[180] = 0;
  _$jscoverage['/list-utils.js'].lineData[184] = 0;
  _$jscoverage['/list-utils.js'].lineData[188] = 0;
}
if (! _$jscoverage['/list-utils.js'].functionData) {
  _$jscoverage['/list-utils.js'].functionData = [];
  _$jscoverage['/list-utils.js'].functionData[0] = 0;
  _$jscoverage['/list-utils.js'].functionData[1] = 0;
  _$jscoverage['/list-utils.js'].functionData[2] = 0;
}
if (! _$jscoverage['/list-utils.js'].branchData) {
  _$jscoverage['/list-utils.js'].branchData = {};
  _$jscoverage['/list-utils.js'].branchData['20'] = [];
  _$jscoverage['/list-utils.js'].branchData['20'][1] = new BranchData();
  _$jscoverage['/list-utils.js'].branchData['23'] = [];
  _$jscoverage['/list-utils.js'].branchData['23'][1] = new BranchData();
  _$jscoverage['/list-utils.js'].branchData['25'] = [];
  _$jscoverage['/list-utils.js'].branchData['25'][1] = new BranchData();
  _$jscoverage['/list-utils.js'].branchData['30'] = [];
  _$jscoverage['/list-utils.js'].branchData['30'][1] = new BranchData();
  _$jscoverage['/list-utils.js'].branchData['34'] = [];
  _$jscoverage['/list-utils.js'].branchData['34'][1] = new BranchData();
  _$jscoverage['/list-utils.js'].branchData['40'] = [];
  _$jscoverage['/list-utils.js'].branchData['40'][1] = new BranchData();
  _$jscoverage['/list-utils.js'].branchData['42'] = [];
  _$jscoverage['/list-utils.js'].branchData['42'][1] = new BranchData();
  _$jscoverage['/list-utils.js'].branchData['42'][2] = new BranchData();
  _$jscoverage['/list-utils.js'].branchData['48'] = [];
  _$jscoverage['/list-utils.js'].branchData['48'][1] = new BranchData();
  _$jscoverage['/list-utils.js'].branchData['54'] = [];
  _$jscoverage['/list-utils.js'].branchData['54'][1] = new BranchData();
  _$jscoverage['/list-utils.js'].branchData['56'] = [];
  _$jscoverage['/list-utils.js'].branchData['56'][1] = new BranchData();
  _$jscoverage['/list-utils.js'].branchData['56'][2] = new BranchData();
  _$jscoverage['/list-utils.js'].branchData['73'] = [];
  _$jscoverage['/list-utils.js'].branchData['73'][1] = new BranchData();
  _$jscoverage['/list-utils.js'].branchData['76'] = [];
  _$jscoverage['/list-utils.js'].branchData['76'][1] = new BranchData();
  _$jscoverage['/list-utils.js'].branchData['76'][2] = new BranchData();
  _$jscoverage['/list-utils.js'].branchData['89'] = [];
  _$jscoverage['/list-utils.js'].branchData['89'][1] = new BranchData();
  _$jscoverage['/list-utils.js'].branchData['90'] = [];
  _$jscoverage['/list-utils.js'].branchData['90'][1] = new BranchData();
  _$jscoverage['/list-utils.js'].branchData['93'] = [];
  _$jscoverage['/list-utils.js'].branchData['93'][1] = new BranchData();
  _$jscoverage['/list-utils.js'].branchData['98'] = [];
  _$jscoverage['/list-utils.js'].branchData['98'][1] = new BranchData();
  _$jscoverage['/list-utils.js'].branchData['102'] = [];
  _$jscoverage['/list-utils.js'].branchData['102'][1] = new BranchData();
  _$jscoverage['/list-utils.js'].branchData['108'] = [];
  _$jscoverage['/list-utils.js'].branchData['108'][1] = new BranchData();
  _$jscoverage['/list-utils.js'].branchData['108'][2] = new BranchData();
  _$jscoverage['/list-utils.js'].branchData['108'][3] = new BranchData();
  _$jscoverage['/list-utils.js'].branchData['111'] = [];
  _$jscoverage['/list-utils.js'].branchData['111'][1] = new BranchData();
  _$jscoverage['/list-utils.js'].branchData['116'] = [];
  _$jscoverage['/list-utils.js'].branchData['116'][1] = new BranchData();
  _$jscoverage['/list-utils.js'].branchData['124'] = [];
  _$jscoverage['/list-utils.js'].branchData['124'][1] = new BranchData();
  _$jscoverage['/list-utils.js'].branchData['127'] = [];
  _$jscoverage['/list-utils.js'].branchData['127'][1] = new BranchData();
  _$jscoverage['/list-utils.js'].branchData['133'] = [];
  _$jscoverage['/list-utils.js'].branchData['133'][1] = new BranchData();
  _$jscoverage['/list-utils.js'].branchData['133'][2] = new BranchData();
  _$jscoverage['/list-utils.js'].branchData['134'] = [];
  _$jscoverage['/list-utils.js'].branchData['134'][1] = new BranchData();
  _$jscoverage['/list-utils.js'].branchData['135'] = [];
  _$jscoverage['/list-utils.js'].branchData['135'][1] = new BranchData();
  _$jscoverage['/list-utils.js'].branchData['136'] = [];
  _$jscoverage['/list-utils.js'].branchData['136'][1] = new BranchData();
  _$jscoverage['/list-utils.js'].branchData['136'][2] = new BranchData();
  _$jscoverage['/list-utils.js'].branchData['137'] = [];
  _$jscoverage['/list-utils.js'].branchData['137'][1] = new BranchData();
  _$jscoverage['/list-utils.js'].branchData['143'] = [];
  _$jscoverage['/list-utils.js'].branchData['143'][1] = new BranchData();
  _$jscoverage['/list-utils.js'].branchData['143'][2] = new BranchData();
  _$jscoverage['/list-utils.js'].branchData['144'] = [];
  _$jscoverage['/list-utils.js'].branchData['144'][1] = new BranchData();
  _$jscoverage['/list-utils.js'].branchData['144'][2] = new BranchData();
  _$jscoverage['/list-utils.js'].branchData['148'] = [];
  _$jscoverage['/list-utils.js'].branchData['148'][1] = new BranchData();
  _$jscoverage['/list-utils.js'].branchData['148'][2] = new BranchData();
  _$jscoverage['/list-utils.js'].branchData['157'] = [];
  _$jscoverage['/list-utils.js'].branchData['157'][1] = new BranchData();
  _$jscoverage['/list-utils.js'].branchData['157'][2] = new BranchData();
  _$jscoverage['/list-utils.js'].branchData['157'][3] = new BranchData();
  _$jscoverage['/list-utils.js'].branchData['158'] = [];
  _$jscoverage['/list-utils.js'].branchData['158'][1] = new BranchData();
  _$jscoverage['/list-utils.js'].branchData['168'] = [];
  _$jscoverage['/list-utils.js'].branchData['168'][1] = new BranchData();
  _$jscoverage['/list-utils.js'].branchData['168'][2] = new BranchData();
  _$jscoverage['/list-utils.js'].branchData['169'] = [];
  _$jscoverage['/list-utils.js'].branchData['169'][1] = new BranchData();
  _$jscoverage['/list-utils.js'].branchData['174'] = [];
  _$jscoverage['/list-utils.js'].branchData['174'][1] = new BranchData();
  _$jscoverage['/list-utils.js'].branchData['176'] = [];
  _$jscoverage['/list-utils.js'].branchData['176'][1] = new BranchData();
  _$jscoverage['/list-utils.js'].branchData['177'] = [];
  _$jscoverage['/list-utils.js'].branchData['177'][1] = new BranchData();
}
_$jscoverage['/list-utils.js'].branchData['177'][1].init(30, 52, 'currentNode[0].nodeType == Dom.NodeType.ELEMENT_NODE');
function visit50_177_1(result) {
  _$jscoverage['/list-utils.js'].branchData['177'][1].ranCondition(result);
  return result;
}_$jscoverage['/list-utils.js'].branchData['176'][1].init(97, 29, 'currentNode && currentNode[0]');
function visit49_176_1(result) {
  _$jscoverage['/list-utils.js'].branchData['176'][1].ranCondition(result);
  return result;
}_$jscoverage['/list-utils.js'].branchData['174'][1].init(5543, 8, 'database');
function visit48_174_1(result) {
  _$jscoverage['/list-utils.js'].branchData['174'][1].ranCondition(result);
  return result;
}_$jscoverage['/list-utils.js'].branchData['169'][1].init(60, 59, 'Math.max(listArray[currentIndex].indent, 0) < indentLevel');
function visit47_169_1(result) {
  _$jscoverage['/list-utils.js'].branchData['169'][1].ranCondition(result);
  return result;
}_$jscoverage['/list-utils.js'].branchData['168'][2].init(4608, 32, 'listArray.length <= currentIndex');
function visit46_168_2(result) {
  _$jscoverage['/list-utils.js'].branchData['168'][2].ranCondition(result);
  return result;
}_$jscoverage['/list-utils.js'].branchData['168'][1].init(4608, 120, 'listArray.length <= currentIndex || Math.max(listArray[currentIndex].indent, 0) < indentLevel');
function visit45_168_1(result) {
  _$jscoverage['/list-utils.js'].branchData['168'][1].ranCondition(result);
  return result;
}_$jscoverage['/list-utils.js'].branchData['158'][1].init(60, 26, 'currentListItemName == \'p\'');
function visit44_158_1(result) {
  _$jscoverage['/list-utils.js'].branchData['158'][1].ranCondition(result);
  return result;
}_$jscoverage['/list-utils.js'].branchData['157'][3].init(2783, 28, 'currentListItemName == \'div\'');
function visit43_157_3(result) {
  _$jscoverage['/list-utils.js'].branchData['157'][3].ranCondition(result);
  return result;
}_$jscoverage['/list-utils.js'].branchData['157'][2].init(2783, 87, 'currentListItemName == \'div\' || currentListItemName == \'p\'');
function visit42_157_2(result) {
  _$jscoverage['/list-utils.js'].branchData['157'][2].ranCondition(result);
  return result;
}_$jscoverage['/list-utils.js'].branchData['157'][1].init(2768, 104, '!UA[\'ie\'] && (currentListItemName == \'div\' || currentListItemName == \'p\')');
function visit41_157_1(result) {
  _$jscoverage['/list-utils.js'].branchData['157'][1].ranCondition(result);
  return result;
}_$jscoverage['/list-utils.js'].branchData['148'][2].init(168, 48, 'firstChild.nodeType == Dom.NodeType.ELEMENT_NODE');
function visit40_148_2(result) {
  _$jscoverage['/list-utils.js'].branchData['148'][2].ranCondition(result);
  return result;
}_$jscoverage['/list-utils.js'].branchData['148'][1].init(168, 120, 'firstChild.nodeType == Dom.NodeType.ELEMENT_NODE && Dom._4e_isBlockBoundary(firstChild)');
function visit39_148_1(result) {
  _$jscoverage['/list-utils.js'].branchData['148'][1].ranCondition(result);
  return result;
}_$jscoverage['/list-utils.js'].branchData['144'][2].init(1993, 46, 'Dom.nodeName(currentListItem) == paragraphMode');
function visit38_144_2(result) {
  _$jscoverage['/list-utils.js'].branchData['144'][2].ranCondition(result);
  return result;
}_$jscoverage['/list-utils.js'].branchData['144'][1].init(85, 105, 'Dom.nodeName(currentListItem) == paragraphMode && currentListItem.firstChild');
function visit37_144_1(result) {
  _$jscoverage['/list-utils.js'].branchData['144'][1].ranCondition(result);
  return result;
}_$jscoverage['/list-utils.js'].branchData['143'][2].init(1905, 53, 'currentListItem.nodeType == Dom.NodeType.ELEMENT_NODE');
function visit36_143_2(result) {
  _$jscoverage['/list-utils.js'].branchData['143'][2].ranCondition(result);
  return result;
}_$jscoverage['/list-utils.js'].branchData['143'][1].init(1905, 191, 'currentListItem.nodeType == Dom.NodeType.ELEMENT_NODE && Dom.nodeName(currentListItem) == paragraphMode && currentListItem.firstChild');
function visit35_143_1(result) {
  _$jscoverage['/list-utils.js'].branchData['143'][1].ranCondition(result);
  return result;
}_$jscoverage['/list-utils.js'].branchData['137'][1].init(99, 56, 'currentListItem.lastChild.getAttribute(\'type\') == \'_moz\'');
function visit34_137_1(result) {
  _$jscoverage['/list-utils.js'].branchData['137'][1].ranCondition(result);
  return result;
}_$jscoverage['/list-utils.js'].branchData['136'][2].init(98, 63, 'currentListItem.lastChild.nodeType == Dom.NodeType.ELEMENT_NODE');
function visit33_136_2(result) {
  _$jscoverage['/list-utils.js'].branchData['136'][2].ranCondition(result);
  return result;
}_$jscoverage['/list-utils.js'].branchData['136'][1].init(61, 156, 'currentListItem.lastChild.nodeType == Dom.NodeType.ELEMENT_NODE && currentListItem.lastChild.getAttribute(\'type\') == \'_moz\'');
function visit32_136_1(result) {
  _$jscoverage['/list-utils.js'].branchData['136'][1].ranCondition(result);
  return result;
}_$jscoverage['/list-utils.js'].branchData['135'][1].init(34, 218, 'currentListItem.lastChild && currentListItem.lastChild.nodeType == Dom.NodeType.ELEMENT_NODE && currentListItem.lastChild.getAttribute(\'type\') == \'_moz\'');
function visit31_135_1(result) {
  _$jscoverage['/list-utils.js'].branchData['135'][1].ranCondition(result);
  return result;
}_$jscoverage['/list-utils.js'].branchData['134'][1].init(91, 36, 'currentIndex != listArray.length - 1');
function visit30_134_1(result) {
  _$jscoverage['/list-utils.js'].branchData['134'][1].ranCondition(result);
  return result;
}_$jscoverage['/list-utils.js'].branchData['133'][2].init(1286, 59, 'currentListItem.nodeType == NodeType.DOCUMENT_FRAGMENT_NODE');
function visit29_133_2(result) {
  _$jscoverage['/list-utils.js'].branchData['133'][2].ranCondition(result);
  return result;
}_$jscoverage['/list-utils.js'].branchData['133'][1].init(1286, 128, 'currentListItem.nodeType == NodeType.DOCUMENT_FRAGMENT_NODE && currentIndex != listArray.length - 1');
function visit28_133_1(result) {
  _$jscoverage['/list-utils.js'].branchData['133'][1].ranCondition(result);
  return result;
}_$jscoverage['/list-utils.js'].branchData['127'][1].init(164, 59, 'currentListItem.nodeType == NodeType.DOCUMENT_FRAGMENT_NODE');
function visit27_127_1(result) {
  _$jscoverage['/list-utils.js'].branchData['127'][1].ranCondition(result);
  return result;
}_$jscoverage['/list-utils.js'].branchData['124'][1].init(793, 24, 'i < item.contents.length');
function visit26_124_1(result) {
  _$jscoverage['/list-utils.js'].branchData['124'][1].ranCondition(result);
  return result;
}_$jscoverage['/list-utils.js'].branchData['116'][1].init(174, 35, 'item.grandparent.nodeName() != \'td\'');
function visit25_116_1(result) {
  _$jscoverage['/list-utils.js'].branchData['116'][1].ranCondition(result);
  return result;
}_$jscoverage['/list-utils.js'].branchData['111'][1].init(32, 44, 'listNodeNames[item.grandparent.nodeName()]');
function visit24_111_1(result) {
  _$jscoverage['/list-utils.js'].branchData['111'][1].ranCondition(result);
  return result;
}_$jscoverage['/list-utils.js'].branchData['108'][3].init(1300, 55, '!baseIndex && item.grandparent');
function visit23_108_3(result) {
  _$jscoverage['/list-utils.js'].branchData['108'][3].ranCondition(result);
  return result;
}_$jscoverage['/list-utils.js'].branchData['108'][2].init(1279, 17, 'item.indent == -1');
function visit22_108_2(result) {
  _$jscoverage['/list-utils.js'].branchData['108'][2].ranCondition(result);
  return result;
}_$jscoverage['/list-utils.js'].branchData['108'][1].init(1279, 76, 'item.indent == -1 && !baseIndex && item.grandparent');
function visit21_108_1(result) {
  _$jscoverage['/list-utils.js'].branchData['108'][1].ranCondition(result);
  return result;
}_$jscoverage['/list-utils.js'].branchData['102'][1].init(878, 43, 'item.indent == Math.max(indentLevel, 0) + 1');
function visit20_102_1(result) {
  _$jscoverage['/list-utils.js'].branchData['102'][1].ranCondition(result);
  return result;
}_$jscoverage['/list-utils.js'].branchData['98'][1].init(539, 24, 'i < item.contents.length');
function visit19_98_1(result) {
  _$jscoverage['/list-utils.js'].branchData['98'][1].ranCondition(result);
  return result;
}_$jscoverage['/list-utils.js'].branchData['93'][1].init(123, 66, 'listArray[currentIndex].parent.nodeName() != rootNode.nodeName()');
function visit18_93_1(result) {
  _$jscoverage['/list-utils.js'].branchData['93'][1].ranCondition(result);
  return result;
}_$jscoverage['/list-utils.js'].branchData['90'][1].init(30, 190, '!rootNode || listArray[currentIndex].parent.nodeName() != rootNode.nodeName()');
function visit17_90_1(result) {
  _$jscoverage['/list-utils.js'].branchData['90'][1].ranCondition(result);
  return result;
}_$jscoverage['/list-utils.js'].branchData['89'][1].init(85, 26, 'item.indent == indentLevel');
function visit16_89_1(result) {
  _$jscoverage['/list-utils.js'].branchData['89'][1].ranCondition(result);
  return result;
}_$jscoverage['/list-utils.js'].branchData['76'][2].init(126, 32, 'listArray.length < baseIndex + 1');
function visit15_76_2(result) {
  _$jscoverage['/list-utils.js'].branchData['76'][2].ranCondition(result);
  return result;
}_$jscoverage['/list-utils.js'].branchData['76'][1].init(112, 46, '!listArray || listArray.length < baseIndex + 1');
function visit14_76_1(result) {
  _$jscoverage['/list-utils.js'].branchData['76'][1].ranCondition(result);
  return result;
}_$jscoverage['/list-utils.js'].branchData['73'][1].init(22, 10, '!baseIndex');
function visit13_73_1(result) {
  _$jscoverage['/list-utils.js'].branchData['73'][1].ranCondition(result);
  return result;
}_$jscoverage['/list-utils.js'].branchData['56'][2].init(100, 46, 'child[0].nodeType == Dom.NodeType.ELEMENT_NODE');
function visit12_56_2(result) {
  _$jscoverage['/list-utils.js'].branchData['56'][2].ranCondition(result);
  return result;
}_$jscoverage['/list-utils.js'].branchData['56'][1].init(100, 112, 'child[0].nodeType == Dom.NodeType.ELEMENT_NODE && listNodeNames[child.nodeName()]');
function visit11_56_1(result) {
  _$jscoverage['/list-utils.js'].branchData['56'][1].ranCondition(result);
  return result;
}_$jscoverage['/list-utils.js'].branchData['54'][1].init(96, 18, 'j < itemChildCount');
function visit10_54_1(result) {
  _$jscoverage['/list-utils.js'].branchData['54'][1].ranCondition(result);
  return result;
}_$jscoverage['/list-utils.js'].branchData['48'][1].init(871, 8, 'database');
function visit9_48_1(result) {
  _$jscoverage['/list-utils.js'].branchData['48'][1].ranCondition(result);
  return result;
}_$jscoverage['/list-utils.js'].branchData['42'][2].init(119, 38, 'itemObj.grandparent.nodeName() == \'li\'');
function visit8_42_2(result) {
  _$jscoverage['/list-utils.js'].branchData['42'][2].ranCondition(result);
  return result;
}_$jscoverage['/list-utils.js'].branchData['42'][1].init(96, 61, 'itemObj.grandparent && itemObj.grandparent.nodeName() == \'li\'');
function visit7_42_1(result) {
  _$jscoverage['/list-utils.js'].branchData['42'][1].ranCondition(result);
  return result;
}_$jscoverage['/list-utils.js'].branchData['40'][1].init(449, 16, '!grandparentNode');
function visit6_40_1(result) {
  _$jscoverage['/list-utils.js'].branchData['40'][1].ranCondition(result);
  return result;
}_$jscoverage['/list-utils.js'].branchData['34'][1].init(168, 27, 'listItem.nodeName() != \'li\'');
function visit5_34_1(result) {
  _$jscoverage['/list-utils.js'].branchData['34'][1].ranCondition(result);
  return result;
}_$jscoverage['/list-utils.js'].branchData['30'][1].init(76, 9, 'i < count');
function visit4_30_1(result) {
  _$jscoverage['/list-utils.js'].branchData['30'][1].ranCondition(result);
  return result;
}_$jscoverage['/list-utils.js'].branchData['25'][1].init(216, 10, '!baseArray');
function visit3_25_1(result) {
  _$jscoverage['/list-utils.js'].branchData['25'][1].ranCondition(result);
  return result;
}_$jscoverage['/list-utils.js'].branchData['23'][1].init(135, 16, '!baseIndentLevel');
function visit2_23_1(result) {
  _$jscoverage['/list-utils.js'].branchData['23'][1].ranCondition(result);
  return result;
}_$jscoverage['/list-utils.js'].branchData['20'][1].init(22, 37, '!listNodeNames[listNode.nodeName()]');
function visit1_20_1(result) {
  _$jscoverage['/list-utils.js'].branchData['20'][1].ranCondition(result);
  return result;
}_$jscoverage['/list-utils.js'].lineData[5]++;
KISSY.add('editor/plugin/list-utils', function(S, Editor) {
  _$jscoverage['/list-utils.js'].functionData[0]++;
  _$jscoverage['/list-utils.js'].lineData[6]++;
  var listNodeNames = {
  ol: 1, 
  ul: 1}, Node = S.Node, Dom = S.DOM, NodeType = Dom.NodeType, UA = S.UA, list = {
  listToArray: function(listNode, database, baseArray, baseIndentLevel, grandparentNode) {
  _$jscoverage['/list-utils.js'].functionData[1]++;
  _$jscoverage['/list-utils.js'].lineData[20]++;
  if (visit1_20_1(!listNodeNames[listNode.nodeName()])) {
    _$jscoverage['/list-utils.js'].lineData[21]++;
    return [];
  }
  _$jscoverage['/list-utils.js'].lineData[23]++;
  if (visit2_23_1(!baseIndentLevel)) {
    _$jscoverage['/list-utils.js'].lineData[24]++;
    baseIndentLevel = 0;
  }
  _$jscoverage['/list-utils.js'].lineData[25]++;
  if (visit3_25_1(!baseArray)) {
    _$jscoverage['/list-utils.js'].lineData[26]++;
    baseArray = [];
  }
  _$jscoverage['/list-utils.js'].lineData[29]++;
  for (var i = 0, count = listNode[0].childNodes.length; visit4_30_1(i < count); i++) {
    _$jscoverage['/list-utils.js'].lineData[31]++;
    var listItem = new Node(listNode[0].childNodes[i]);
    _$jscoverage['/list-utils.js'].lineData[34]++;
    if (visit5_34_1(listItem.nodeName() != 'li')) {
      _$jscoverage['/list-utils.js'].lineData[35]++;
      continue;
    }
    _$jscoverage['/list-utils.js'].lineData[37]++;
    var itemObj = {
  'parent': listNode, 
  indent: baseIndentLevel, 
  element: listItem, 
  contents: []};
    _$jscoverage['/list-utils.js'].lineData[40]++;
    if (visit6_40_1(!grandparentNode)) {
      _$jscoverage['/list-utils.js'].lineData[41]++;
      itemObj.grandparent = listNode.parent();
      _$jscoverage['/list-utils.js'].lineData[42]++;
      if (visit7_42_1(itemObj.grandparent && visit8_42_2(itemObj.grandparent.nodeName() == 'li'))) {
        _$jscoverage['/list-utils.js'].lineData[43]++;
        itemObj.grandparent = itemObj.grandparent.parent();
      }
    } else {
      _$jscoverage['/list-utils.js'].lineData[46]++;
      itemObj.grandparent = grandparentNode;
    }
    _$jscoverage['/list-utils.js'].lineData[48]++;
    if (visit9_48_1(database)) {
      _$jscoverage['/list-utils.js'].lineData[49]++;
      listItem._4e_setMarker(database, 'listarray_index', baseArray.length, undefined);
    }
    _$jscoverage['/list-utils.js'].lineData[51]++;
    baseArray.push(itemObj);
    _$jscoverage['/list-utils.js'].lineData[53]++;
    for (var j = 0, itemChildCount = listItem[0].childNodes.length, child; visit10_54_1(j < itemChildCount); j++) {
      _$jscoverage['/list-utils.js'].lineData[55]++;
      child = new Node(listItem[0].childNodes[j]);
      _$jscoverage['/list-utils.js'].lineData[56]++;
      if (visit11_56_1(visit12_56_2(child[0].nodeType == Dom.NodeType.ELEMENT_NODE) && listNodeNames[child.nodeName()])) {
        _$jscoverage['/list-utils.js'].lineData[60]++;
        list.listToArray(child, database, baseArray, baseIndentLevel + 1, itemObj.grandparent);
      } else {
        _$jscoverage['/list-utils.js'].lineData[63]++;
        itemObj.contents.push(child);
      }
    }
  }
  _$jscoverage['/list-utils.js'].lineData[67]++;
  return baseArray;
}, 
  arrayToList: function(listArray, database, baseIndex, paragraphMode) {
  _$jscoverage['/list-utils.js'].functionData[2]++;
  _$jscoverage['/list-utils.js'].lineData[73]++;
  if (visit13_73_1(!baseIndex)) {
    _$jscoverage['/list-utils.js'].lineData[74]++;
    baseIndex = 0;
  }
  _$jscoverage['/list-utils.js'].lineData[76]++;
  if (visit14_76_1(!listArray || visit15_76_2(listArray.length < baseIndex + 1))) {
    _$jscoverage['/list-utils.js'].lineData[77]++;
    return null;
  }
  _$jscoverage['/list-utils.js'].lineData[79]++;
  var doc = listArray[baseIndex].parent[0].ownerDocument, retval = doc.createDocumentFragment(), rootNode = null, currentIndex = baseIndex, indentLevel = Math.max(listArray[baseIndex].indent, 0), currentListItem = null;
  _$jscoverage['/list-utils.js'].lineData[87]++;
  while (true) {
    _$jscoverage['/list-utils.js'].lineData[88]++;
    var item = listArray[currentIndex];
    _$jscoverage['/list-utils.js'].lineData[89]++;
    if (visit16_89_1(item.indent == indentLevel)) {
      _$jscoverage['/list-utils.js'].lineData[90]++;
      if (visit17_90_1(!rootNode || visit18_93_1(listArray[currentIndex].parent.nodeName() != rootNode.nodeName()))) {
        _$jscoverage['/list-utils.js'].lineData[94]++;
        rootNode = listArray[currentIndex].parent.clone(false);
        _$jscoverage['/list-utils.js'].lineData[95]++;
        retval.appendChild(rootNode[0]);
      }
      _$jscoverage['/list-utils.js'].lineData[97]++;
      currentListItem = rootNode[0].appendChild(item.element.clone(false)[0]);
      _$jscoverage['/list-utils.js'].lineData[98]++;
      for (var i = 0; visit19_98_1(i < item.contents.length); i++) {
        _$jscoverage['/list-utils.js'].lineData[99]++;
        currentListItem.appendChild(item.contents[i].clone(true)[0]);
      }
      _$jscoverage['/list-utils.js'].lineData[101]++;
      currentIndex++;
    } else {
      _$jscoverage['/list-utils.js'].lineData[102]++;
      if (visit20_102_1(item.indent == Math.max(indentLevel, 0) + 1)) {
        _$jscoverage['/list-utils.js'].lineData[104]++;
        var listData = list.arrayToList(listArray, null, currentIndex, paragraphMode);
        _$jscoverage['/list-utils.js'].lineData[106]++;
        currentListItem.appendChild(listData.listNode);
        _$jscoverage['/list-utils.js'].lineData[107]++;
        currentIndex = listData.nextIndex;
      } else {
        _$jscoverage['/list-utils.js'].lineData[108]++;
        if (visit21_108_1(visit22_108_2(item.indent == -1) && visit23_108_3(!baseIndex && item.grandparent))) {
          _$jscoverage['/list-utils.js'].lineData[111]++;
          if (visit24_111_1(listNodeNames[item.grandparent.nodeName()])) {
            _$jscoverage['/list-utils.js'].lineData[112]++;
            currentListItem = item.element.clone(false)[0];
          } else {
            _$jscoverage['/list-utils.js'].lineData[116]++;
            if (visit25_116_1(item.grandparent.nodeName() != 'td')) {
              _$jscoverage['/list-utils.js'].lineData[117]++;
              currentListItem = doc.createElement(paragraphMode);
              _$jscoverage['/list-utils.js'].lineData[118]++;
              item.element._4e_copyAttributes(new Node(currentListItem));
            } else {
              _$jscoverage['/list-utils.js'].lineData[121]++;
              currentListItem = doc.createDocumentFragment();
            }
          }
          _$jscoverage['/list-utils.js'].lineData[124]++;
          for (i = 0; visit26_124_1(i < item.contents.length); i++) {
            _$jscoverage['/list-utils.js'].lineData[125]++;
            var ic = item.contents[i].clone(true);
            _$jscoverage['/list-utils.js'].lineData[127]++;
            if (visit27_127_1(currentListItem.nodeType == NodeType.DOCUMENT_FRAGMENT_NODE)) {
              _$jscoverage['/list-utils.js'].lineData[128]++;
              item.element._4e_copyAttributes(new Node(ic));
            }
            _$jscoverage['/list-utils.js'].lineData[130]++;
            currentListItem.appendChild(ic[0]);
          }
          _$jscoverage['/list-utils.js'].lineData[133]++;
          if (visit28_133_1(visit29_133_2(currentListItem.nodeType == NodeType.DOCUMENT_FRAGMENT_NODE) && visit30_134_1(currentIndex != listArray.length - 1))) {
            _$jscoverage['/list-utils.js'].lineData[135]++;
            if (visit31_135_1(currentListItem.lastChild && visit32_136_1(visit33_136_2(currentListItem.lastChild.nodeType == Dom.NodeType.ELEMENT_NODE) && visit34_137_1(currentListItem.lastChild.getAttribute('type') == '_moz')))) {
              _$jscoverage['/list-utils.js'].lineData[138]++;
              Dom._4e_remove(currentListItem.lastChild);
            }
            _$jscoverage['/list-utils.js'].lineData[140]++;
            Dom._4e_appendBogus(currentListItem);
          }
          _$jscoverage['/list-utils.js'].lineData[143]++;
          if (visit35_143_1(visit36_143_2(currentListItem.nodeType == Dom.NodeType.ELEMENT_NODE) && visit37_144_1(visit38_144_2(Dom.nodeName(currentListItem) == paragraphMode) && currentListItem.firstChild))) {
            _$jscoverage['/list-utils.js'].lineData[146]++;
            Dom._4e_trim(currentListItem);
            _$jscoverage['/list-utils.js'].lineData[147]++;
            var firstChild = currentListItem.firstChild;
            _$jscoverage['/list-utils.js'].lineData[148]++;
            if (visit39_148_1(visit40_148_2(firstChild.nodeType == Dom.NodeType.ELEMENT_NODE) && Dom._4e_isBlockBoundary(firstChild))) {
              _$jscoverage['/list-utils.js'].lineData[150]++;
              var tmp = doc.createDocumentFragment();
              _$jscoverage['/list-utils.js'].lineData[151]++;
              Dom._4e_moveChildren(currentListItem, tmp);
              _$jscoverage['/list-utils.js'].lineData[152]++;
              currentListItem = tmp;
            }
          }
          _$jscoverage['/list-utils.js'].lineData[156]++;
          var currentListItemName = Dom.nodeName(currentListItem);
          _$jscoverage['/list-utils.js'].lineData[157]++;
          if (visit41_157_1(!UA['ie'] && (visit42_157_2(visit43_157_3(currentListItemName == 'div') || visit44_158_1(currentListItemName == 'p'))))) {
            _$jscoverage['/list-utils.js'].lineData[159]++;
            Dom._4e_appendBogus(currentListItem);
          }
          _$jscoverage['/list-utils.js'].lineData[161]++;
          retval.appendChild(currentListItem);
          _$jscoverage['/list-utils.js'].lineData[162]++;
          rootNode = null;
          _$jscoverage['/list-utils.js'].lineData[163]++;
          currentIndex++;
        } else {
          _$jscoverage['/list-utils.js'].lineData[166]++;
          return null;
        }
      }
    }
    _$jscoverage['/list-utils.js'].lineData[168]++;
    if (visit45_168_1(visit46_168_2(listArray.length <= currentIndex) || visit47_169_1(Math.max(listArray[currentIndex].indent, 0) < indentLevel))) {
      _$jscoverage['/list-utils.js'].lineData[170]++;
      break;
    }
  }
  _$jscoverage['/list-utils.js'].lineData[174]++;
  if (visit48_174_1(database)) {
    _$jscoverage['/list-utils.js'].lineData[175]++;
    var currentNode = new Node(retval.firstChild);
    _$jscoverage['/list-utils.js'].lineData[176]++;
    while (visit49_176_1(currentNode && currentNode[0])) {
      _$jscoverage['/list-utils.js'].lineData[177]++;
      if (visit50_177_1(currentNode[0].nodeType == Dom.NodeType.ELEMENT_NODE)) {
        _$jscoverage['/list-utils.js'].lineData[178]++;
        currentNode._4e_clearMarkers(database, true);
      }
      _$jscoverage['/list-utils.js'].lineData[180]++;
      currentNode = currentNode._4e_nextSourceNode();
    }
  }
  _$jscoverage['/list-utils.js'].lineData[184]++;
  return {
  listNode: retval, 
  nextIndex: currentIndex};
}};
  _$jscoverage['/list-utils.js'].lineData[188]++;
  return list;
}, {
  requires: ['editor']});
