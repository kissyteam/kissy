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
  _$jscoverage['/list-utils.js'].lineData[26] = 0;
  _$jscoverage['/list-utils.js'].lineData[27] = 0;
  _$jscoverage['/list-utils.js'].lineData[30] = 0;
  _$jscoverage['/list-utils.js'].lineData[32] = 0;
  _$jscoverage['/list-utils.js'].lineData[35] = 0;
  _$jscoverage['/list-utils.js'].lineData[36] = 0;
  _$jscoverage['/list-utils.js'].lineData[38] = 0;
  _$jscoverage['/list-utils.js'].lineData[41] = 0;
  _$jscoverage['/list-utils.js'].lineData[42] = 0;
  _$jscoverage['/list-utils.js'].lineData[43] = 0;
  _$jscoverage['/list-utils.js'].lineData[44] = 0;
  _$jscoverage['/list-utils.js'].lineData[47] = 0;
  _$jscoverage['/list-utils.js'].lineData[49] = 0;
  _$jscoverage['/list-utils.js'].lineData[50] = 0;
  _$jscoverage['/list-utils.js'].lineData[52] = 0;
  _$jscoverage['/list-utils.js'].lineData[54] = 0;
  _$jscoverage['/list-utils.js'].lineData[56] = 0;
  _$jscoverage['/list-utils.js'].lineData[57] = 0;
  _$jscoverage['/list-utils.js'].lineData[61] = 0;
  _$jscoverage['/list-utils.js'].lineData[64] = 0;
  _$jscoverage['/list-utils.js'].lineData[68] = 0;
  _$jscoverage['/list-utils.js'].lineData[74] = 0;
  _$jscoverage['/list-utils.js'].lineData[75] = 0;
  _$jscoverage['/list-utils.js'].lineData[77] = 0;
  _$jscoverage['/list-utils.js'].lineData[78] = 0;
  _$jscoverage['/list-utils.js'].lineData[80] = 0;
  _$jscoverage['/list-utils.js'].lineData[88] = 0;
  _$jscoverage['/list-utils.js'].lineData[89] = 0;
  _$jscoverage['/list-utils.js'].lineData[90] = 0;
  _$jscoverage['/list-utils.js'].lineData[91] = 0;
  _$jscoverage['/list-utils.js'].lineData[95] = 0;
  _$jscoverage['/list-utils.js'].lineData[96] = 0;
  _$jscoverage['/list-utils.js'].lineData[98] = 0;
  _$jscoverage['/list-utils.js'].lineData[99] = 0;
  _$jscoverage['/list-utils.js'].lineData[100] = 0;
  _$jscoverage['/list-utils.js'].lineData[102] = 0;
  _$jscoverage['/list-utils.js'].lineData[103] = 0;
  _$jscoverage['/list-utils.js'].lineData[105] = 0;
  _$jscoverage['/list-utils.js'].lineData[107] = 0;
  _$jscoverage['/list-utils.js'].lineData[108] = 0;
  _$jscoverage['/list-utils.js'].lineData[109] = 0;
  _$jscoverage['/list-utils.js'].lineData[112] = 0;
  _$jscoverage['/list-utils.js'].lineData[113] = 0;
  _$jscoverage['/list-utils.js'].lineData[117] = 0;
  _$jscoverage['/list-utils.js'].lineData[118] = 0;
  _$jscoverage['/list-utils.js'].lineData[119] = 0;
  _$jscoverage['/list-utils.js'].lineData[122] = 0;
  _$jscoverage['/list-utils.js'].lineData[125] = 0;
  _$jscoverage['/list-utils.js'].lineData[126] = 0;
  _$jscoverage['/list-utils.js'].lineData[128] = 0;
  _$jscoverage['/list-utils.js'].lineData[129] = 0;
  _$jscoverage['/list-utils.js'].lineData[131] = 0;
  _$jscoverage['/list-utils.js'].lineData[134] = 0;
  _$jscoverage['/list-utils.js'].lineData[136] = 0;
  _$jscoverage['/list-utils.js'].lineData[139] = 0;
  _$jscoverage['/list-utils.js'].lineData[141] = 0;
  _$jscoverage['/list-utils.js'].lineData[144] = 0;
  _$jscoverage['/list-utils.js'].lineData[147] = 0;
  _$jscoverage['/list-utils.js'].lineData[148] = 0;
  _$jscoverage['/list-utils.js'].lineData[149] = 0;
  _$jscoverage['/list-utils.js'].lineData[151] = 0;
  _$jscoverage['/list-utils.js'].lineData[152] = 0;
  _$jscoverage['/list-utils.js'].lineData[153] = 0;
  _$jscoverage['/list-utils.js'].lineData[157] = 0;
  _$jscoverage['/list-utils.js'].lineData[158] = 0;
  _$jscoverage['/list-utils.js'].lineData[160] = 0;
  _$jscoverage['/list-utils.js'].lineData[162] = 0;
  _$jscoverage['/list-utils.js'].lineData[163] = 0;
  _$jscoverage['/list-utils.js'].lineData[164] = 0;
  _$jscoverage['/list-utils.js'].lineData[167] = 0;
  _$jscoverage['/list-utils.js'].lineData[169] = 0;
  _$jscoverage['/list-utils.js'].lineData[171] = 0;
  _$jscoverage['/list-utils.js'].lineData[175] = 0;
  _$jscoverage['/list-utils.js'].lineData[176] = 0;
  _$jscoverage['/list-utils.js'].lineData[177] = 0;
  _$jscoverage['/list-utils.js'].lineData[178] = 0;
  _$jscoverage['/list-utils.js'].lineData[179] = 0;
  _$jscoverage['/list-utils.js'].lineData[181] = 0;
  _$jscoverage['/list-utils.js'].lineData[185] = 0;
  _$jscoverage['/list-utils.js'].lineData[189] = 0;
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
  _$jscoverage['/list-utils.js'].branchData['26'] = [];
  _$jscoverage['/list-utils.js'].branchData['26'][1] = new BranchData();
  _$jscoverage['/list-utils.js'].branchData['31'] = [];
  _$jscoverage['/list-utils.js'].branchData['31'][1] = new BranchData();
  _$jscoverage['/list-utils.js'].branchData['35'] = [];
  _$jscoverage['/list-utils.js'].branchData['35'][1] = new BranchData();
  _$jscoverage['/list-utils.js'].branchData['41'] = [];
  _$jscoverage['/list-utils.js'].branchData['41'][1] = new BranchData();
  _$jscoverage['/list-utils.js'].branchData['43'] = [];
  _$jscoverage['/list-utils.js'].branchData['43'][1] = new BranchData();
  _$jscoverage['/list-utils.js'].branchData['43'][2] = new BranchData();
  _$jscoverage['/list-utils.js'].branchData['49'] = [];
  _$jscoverage['/list-utils.js'].branchData['49'][1] = new BranchData();
  _$jscoverage['/list-utils.js'].branchData['55'] = [];
  _$jscoverage['/list-utils.js'].branchData['55'][1] = new BranchData();
  _$jscoverage['/list-utils.js'].branchData['57'] = [];
  _$jscoverage['/list-utils.js'].branchData['57'][1] = new BranchData();
  _$jscoverage['/list-utils.js'].branchData['57'][2] = new BranchData();
  _$jscoverage['/list-utils.js'].branchData['74'] = [];
  _$jscoverage['/list-utils.js'].branchData['74'][1] = new BranchData();
  _$jscoverage['/list-utils.js'].branchData['77'] = [];
  _$jscoverage['/list-utils.js'].branchData['77'][1] = new BranchData();
  _$jscoverage['/list-utils.js'].branchData['77'][2] = new BranchData();
  _$jscoverage['/list-utils.js'].branchData['90'] = [];
  _$jscoverage['/list-utils.js'].branchData['90'][1] = new BranchData();
  _$jscoverage['/list-utils.js'].branchData['91'] = [];
  _$jscoverage['/list-utils.js'].branchData['91'][1] = new BranchData();
  _$jscoverage['/list-utils.js'].branchData['94'] = [];
  _$jscoverage['/list-utils.js'].branchData['94'][1] = new BranchData();
  _$jscoverage['/list-utils.js'].branchData['99'] = [];
  _$jscoverage['/list-utils.js'].branchData['99'][1] = new BranchData();
  _$jscoverage['/list-utils.js'].branchData['103'] = [];
  _$jscoverage['/list-utils.js'].branchData['103'][1] = new BranchData();
  _$jscoverage['/list-utils.js'].branchData['109'] = [];
  _$jscoverage['/list-utils.js'].branchData['109'][1] = new BranchData();
  _$jscoverage['/list-utils.js'].branchData['109'][2] = new BranchData();
  _$jscoverage['/list-utils.js'].branchData['109'][3] = new BranchData();
  _$jscoverage['/list-utils.js'].branchData['112'] = [];
  _$jscoverage['/list-utils.js'].branchData['112'][1] = new BranchData();
  _$jscoverage['/list-utils.js'].branchData['117'] = [];
  _$jscoverage['/list-utils.js'].branchData['117'][1] = new BranchData();
  _$jscoverage['/list-utils.js'].branchData['125'] = [];
  _$jscoverage['/list-utils.js'].branchData['125'][1] = new BranchData();
  _$jscoverage['/list-utils.js'].branchData['128'] = [];
  _$jscoverage['/list-utils.js'].branchData['128'][1] = new BranchData();
  _$jscoverage['/list-utils.js'].branchData['134'] = [];
  _$jscoverage['/list-utils.js'].branchData['134'][1] = new BranchData();
  _$jscoverage['/list-utils.js'].branchData['134'][2] = new BranchData();
  _$jscoverage['/list-utils.js'].branchData['135'] = [];
  _$jscoverage['/list-utils.js'].branchData['135'][1] = new BranchData();
  _$jscoverage['/list-utils.js'].branchData['136'] = [];
  _$jscoverage['/list-utils.js'].branchData['136'][1] = new BranchData();
  _$jscoverage['/list-utils.js'].branchData['137'] = [];
  _$jscoverage['/list-utils.js'].branchData['137'][1] = new BranchData();
  _$jscoverage['/list-utils.js'].branchData['137'][2] = new BranchData();
  _$jscoverage['/list-utils.js'].branchData['138'] = [];
  _$jscoverage['/list-utils.js'].branchData['138'][1] = new BranchData();
  _$jscoverage['/list-utils.js'].branchData['144'] = [];
  _$jscoverage['/list-utils.js'].branchData['144'][1] = new BranchData();
  _$jscoverage['/list-utils.js'].branchData['144'][2] = new BranchData();
  _$jscoverage['/list-utils.js'].branchData['145'] = [];
  _$jscoverage['/list-utils.js'].branchData['145'][1] = new BranchData();
  _$jscoverage['/list-utils.js'].branchData['145'][2] = new BranchData();
  _$jscoverage['/list-utils.js'].branchData['149'] = [];
  _$jscoverage['/list-utils.js'].branchData['149'][1] = new BranchData();
  _$jscoverage['/list-utils.js'].branchData['149'][2] = new BranchData();
  _$jscoverage['/list-utils.js'].branchData['158'] = [];
  _$jscoverage['/list-utils.js'].branchData['158'][1] = new BranchData();
  _$jscoverage['/list-utils.js'].branchData['158'][2] = new BranchData();
  _$jscoverage['/list-utils.js'].branchData['158'][3] = new BranchData();
  _$jscoverage['/list-utils.js'].branchData['159'] = [];
  _$jscoverage['/list-utils.js'].branchData['159'][1] = new BranchData();
  _$jscoverage['/list-utils.js'].branchData['169'] = [];
  _$jscoverage['/list-utils.js'].branchData['169'][1] = new BranchData();
  _$jscoverage['/list-utils.js'].branchData['169'][2] = new BranchData();
  _$jscoverage['/list-utils.js'].branchData['170'] = [];
  _$jscoverage['/list-utils.js'].branchData['170'][1] = new BranchData();
  _$jscoverage['/list-utils.js'].branchData['175'] = [];
  _$jscoverage['/list-utils.js'].branchData['175'][1] = new BranchData();
  _$jscoverage['/list-utils.js'].branchData['177'] = [];
  _$jscoverage['/list-utils.js'].branchData['177'][1] = new BranchData();
  _$jscoverage['/list-utils.js'].branchData['178'] = [];
  _$jscoverage['/list-utils.js'].branchData['178'][1] = new BranchData();
}
_$jscoverage['/list-utils.js'].branchData['178'][1].init(30, 52, 'currentNode[0].nodeType == Dom.NodeType.ELEMENT_NODE');
function visit50_178_1(result) {
  _$jscoverage['/list-utils.js'].branchData['178'][1].ranCondition(result);
  return result;
}_$jscoverage['/list-utils.js'].branchData['177'][1].init(97, 29, 'currentNode && currentNode[0]');
function visit49_177_1(result) {
  _$jscoverage['/list-utils.js'].branchData['177'][1].ranCondition(result);
  return result;
}_$jscoverage['/list-utils.js'].branchData['175'][1].init(5543, 8, 'database');
function visit48_175_1(result) {
  _$jscoverage['/list-utils.js'].branchData['175'][1].ranCondition(result);
  return result;
}_$jscoverage['/list-utils.js'].branchData['170'][1].init(60, 59, 'Math.max(listArray[currentIndex].indent, 0) < indentLevel');
function visit47_170_1(result) {
  _$jscoverage['/list-utils.js'].branchData['170'][1].ranCondition(result);
  return result;
}_$jscoverage['/list-utils.js'].branchData['169'][2].init(4608, 32, 'listArray.length <= currentIndex');
function visit46_169_2(result) {
  _$jscoverage['/list-utils.js'].branchData['169'][2].ranCondition(result);
  return result;
}_$jscoverage['/list-utils.js'].branchData['169'][1].init(4608, 120, 'listArray.length <= currentIndex || Math.max(listArray[currentIndex].indent, 0) < indentLevel');
function visit45_169_1(result) {
  _$jscoverage['/list-utils.js'].branchData['169'][1].ranCondition(result);
  return result;
}_$jscoverage['/list-utils.js'].branchData['159'][1].init(60, 26, 'currentListItemName == \'p\'');
function visit44_159_1(result) {
  _$jscoverage['/list-utils.js'].branchData['159'][1].ranCondition(result);
  return result;
}_$jscoverage['/list-utils.js'].branchData['158'][3].init(2783, 28, 'currentListItemName == \'div\'');
function visit43_158_3(result) {
  _$jscoverage['/list-utils.js'].branchData['158'][3].ranCondition(result);
  return result;
}_$jscoverage['/list-utils.js'].branchData['158'][2].init(2783, 87, 'currentListItemName == \'div\' || currentListItemName == \'p\'');
function visit42_158_2(result) {
  _$jscoverage['/list-utils.js'].branchData['158'][2].ranCondition(result);
  return result;
}_$jscoverage['/list-utils.js'].branchData['158'][1].init(2768, 104, '!UA[\'ie\'] && (currentListItemName == \'div\' || currentListItemName == \'p\')');
function visit41_158_1(result) {
  _$jscoverage['/list-utils.js'].branchData['158'][1].ranCondition(result);
  return result;
}_$jscoverage['/list-utils.js'].branchData['149'][2].init(168, 48, 'firstChild.nodeType == Dom.NodeType.ELEMENT_NODE');
function visit40_149_2(result) {
  _$jscoverage['/list-utils.js'].branchData['149'][2].ranCondition(result);
  return result;
}_$jscoverage['/list-utils.js'].branchData['149'][1].init(168, 120, 'firstChild.nodeType == Dom.NodeType.ELEMENT_NODE && Dom._4e_isBlockBoundary(firstChild)');
function visit39_149_1(result) {
  _$jscoverage['/list-utils.js'].branchData['149'][1].ranCondition(result);
  return result;
}_$jscoverage['/list-utils.js'].branchData['145'][2].init(1993, 46, 'Dom.nodeName(currentListItem) == paragraphMode');
function visit38_145_2(result) {
  _$jscoverage['/list-utils.js'].branchData['145'][2].ranCondition(result);
  return result;
}_$jscoverage['/list-utils.js'].branchData['145'][1].init(85, 105, 'Dom.nodeName(currentListItem) == paragraphMode && currentListItem.firstChild');
function visit37_145_1(result) {
  _$jscoverage['/list-utils.js'].branchData['145'][1].ranCondition(result);
  return result;
}_$jscoverage['/list-utils.js'].branchData['144'][2].init(1905, 53, 'currentListItem.nodeType == Dom.NodeType.ELEMENT_NODE');
function visit36_144_2(result) {
  _$jscoverage['/list-utils.js'].branchData['144'][2].ranCondition(result);
  return result;
}_$jscoverage['/list-utils.js'].branchData['144'][1].init(1905, 191, 'currentListItem.nodeType == Dom.NodeType.ELEMENT_NODE && Dom.nodeName(currentListItem) == paragraphMode && currentListItem.firstChild');
function visit35_144_1(result) {
  _$jscoverage['/list-utils.js'].branchData['144'][1].ranCondition(result);
  return result;
}_$jscoverage['/list-utils.js'].branchData['138'][1].init(99, 56, 'currentListItem.lastChild.getAttribute(\'type\') == \'_moz\'');
function visit34_138_1(result) {
  _$jscoverage['/list-utils.js'].branchData['138'][1].ranCondition(result);
  return result;
}_$jscoverage['/list-utils.js'].branchData['137'][2].init(98, 63, 'currentListItem.lastChild.nodeType == Dom.NodeType.ELEMENT_NODE');
function visit33_137_2(result) {
  _$jscoverage['/list-utils.js'].branchData['137'][2].ranCondition(result);
  return result;
}_$jscoverage['/list-utils.js'].branchData['137'][1].init(61, 156, 'currentListItem.lastChild.nodeType == Dom.NodeType.ELEMENT_NODE && currentListItem.lastChild.getAttribute(\'type\') == \'_moz\'');
function visit32_137_1(result) {
  _$jscoverage['/list-utils.js'].branchData['137'][1].ranCondition(result);
  return result;
}_$jscoverage['/list-utils.js'].branchData['136'][1].init(34, 218, 'currentListItem.lastChild && currentListItem.lastChild.nodeType == Dom.NodeType.ELEMENT_NODE && currentListItem.lastChild.getAttribute(\'type\') == \'_moz\'');
function visit31_136_1(result) {
  _$jscoverage['/list-utils.js'].branchData['136'][1].ranCondition(result);
  return result;
}_$jscoverage['/list-utils.js'].branchData['135'][1].init(91, 36, 'currentIndex != listArray.length - 1');
function visit30_135_1(result) {
  _$jscoverage['/list-utils.js'].branchData['135'][1].ranCondition(result);
  return result;
}_$jscoverage['/list-utils.js'].branchData['134'][2].init(1286, 59, 'currentListItem.nodeType == NodeType.DOCUMENT_FRAGMENT_NODE');
function visit29_134_2(result) {
  _$jscoverage['/list-utils.js'].branchData['134'][2].ranCondition(result);
  return result;
}_$jscoverage['/list-utils.js'].branchData['134'][1].init(1286, 128, 'currentListItem.nodeType == NodeType.DOCUMENT_FRAGMENT_NODE && currentIndex != listArray.length - 1');
function visit28_134_1(result) {
  _$jscoverage['/list-utils.js'].branchData['134'][1].ranCondition(result);
  return result;
}_$jscoverage['/list-utils.js'].branchData['128'][1].init(164, 59, 'currentListItem.nodeType == NodeType.DOCUMENT_FRAGMENT_NODE');
function visit27_128_1(result) {
  _$jscoverage['/list-utils.js'].branchData['128'][1].ranCondition(result);
  return result;
}_$jscoverage['/list-utils.js'].branchData['125'][1].init(793, 24, 'i < item.contents.length');
function visit26_125_1(result) {
  _$jscoverage['/list-utils.js'].branchData['125'][1].ranCondition(result);
  return result;
}_$jscoverage['/list-utils.js'].branchData['117'][1].init(174, 35, 'item.grandparent.nodeName() != \'td\'');
function visit25_117_1(result) {
  _$jscoverage['/list-utils.js'].branchData['117'][1].ranCondition(result);
  return result;
}_$jscoverage['/list-utils.js'].branchData['112'][1].init(32, 44, 'listNodeNames[item.grandparent.nodeName()]');
function visit24_112_1(result) {
  _$jscoverage['/list-utils.js'].branchData['112'][1].ranCondition(result);
  return result;
}_$jscoverage['/list-utils.js'].branchData['109'][3].init(1300, 55, '!baseIndex && item.grandparent');
function visit23_109_3(result) {
  _$jscoverage['/list-utils.js'].branchData['109'][3].ranCondition(result);
  return result;
}_$jscoverage['/list-utils.js'].branchData['109'][2].init(1279, 17, 'item.indent == -1');
function visit22_109_2(result) {
  _$jscoverage['/list-utils.js'].branchData['109'][2].ranCondition(result);
  return result;
}_$jscoverage['/list-utils.js'].branchData['109'][1].init(1279, 76, 'item.indent == -1 && !baseIndex && item.grandparent');
function visit21_109_1(result) {
  _$jscoverage['/list-utils.js'].branchData['109'][1].ranCondition(result);
  return result;
}_$jscoverage['/list-utils.js'].branchData['103'][1].init(878, 43, 'item.indent == Math.max(indentLevel, 0) + 1');
function visit20_103_1(result) {
  _$jscoverage['/list-utils.js'].branchData['103'][1].ranCondition(result);
  return result;
}_$jscoverage['/list-utils.js'].branchData['99'][1].init(539, 24, 'i < item.contents.length');
function visit19_99_1(result) {
  _$jscoverage['/list-utils.js'].branchData['99'][1].ranCondition(result);
  return result;
}_$jscoverage['/list-utils.js'].branchData['94'][1].init(123, 66, 'listArray[currentIndex].parent.nodeName() != rootNode.nodeName()');
function visit18_94_1(result) {
  _$jscoverage['/list-utils.js'].branchData['94'][1].ranCondition(result);
  return result;
}_$jscoverage['/list-utils.js'].branchData['91'][1].init(30, 190, '!rootNode || listArray[currentIndex].parent.nodeName() != rootNode.nodeName()');
function visit17_91_1(result) {
  _$jscoverage['/list-utils.js'].branchData['91'][1].ranCondition(result);
  return result;
}_$jscoverage['/list-utils.js'].branchData['90'][1].init(85, 26, 'item.indent == indentLevel');
function visit16_90_1(result) {
  _$jscoverage['/list-utils.js'].branchData['90'][1].ranCondition(result);
  return result;
}_$jscoverage['/list-utils.js'].branchData['77'][2].init(126, 32, 'listArray.length < baseIndex + 1');
function visit15_77_2(result) {
  _$jscoverage['/list-utils.js'].branchData['77'][2].ranCondition(result);
  return result;
}_$jscoverage['/list-utils.js'].branchData['77'][1].init(112, 46, '!listArray || listArray.length < baseIndex + 1');
function visit14_77_1(result) {
  _$jscoverage['/list-utils.js'].branchData['77'][1].ranCondition(result);
  return result;
}_$jscoverage['/list-utils.js'].branchData['74'][1].init(22, 10, '!baseIndex');
function visit13_74_1(result) {
  _$jscoverage['/list-utils.js'].branchData['74'][1].ranCondition(result);
  return result;
}_$jscoverage['/list-utils.js'].branchData['57'][2].init(100, 46, 'child[0].nodeType == Dom.NodeType.ELEMENT_NODE');
function visit12_57_2(result) {
  _$jscoverage['/list-utils.js'].branchData['57'][2].ranCondition(result);
  return result;
}_$jscoverage['/list-utils.js'].branchData['57'][1].init(100, 112, 'child[0].nodeType == Dom.NodeType.ELEMENT_NODE && listNodeNames[child.nodeName()]');
function visit11_57_1(result) {
  _$jscoverage['/list-utils.js'].branchData['57'][1].ranCondition(result);
  return result;
}_$jscoverage['/list-utils.js'].branchData['55'][1].init(96, 18, 'j < itemChildCount');
function visit10_55_1(result) {
  _$jscoverage['/list-utils.js'].branchData['55'][1].ranCondition(result);
  return result;
}_$jscoverage['/list-utils.js'].branchData['49'][1].init(871, 8, 'database');
function visit9_49_1(result) {
  _$jscoverage['/list-utils.js'].branchData['49'][1].ranCondition(result);
  return result;
}_$jscoverage['/list-utils.js'].branchData['43'][2].init(119, 38, 'itemObj.grandparent.nodeName() == \'li\'');
function visit8_43_2(result) {
  _$jscoverage['/list-utils.js'].branchData['43'][2].ranCondition(result);
  return result;
}_$jscoverage['/list-utils.js'].branchData['43'][1].init(96, 61, 'itemObj.grandparent && itemObj.grandparent.nodeName() == \'li\'');
function visit7_43_1(result) {
  _$jscoverage['/list-utils.js'].branchData['43'][1].ranCondition(result);
  return result;
}_$jscoverage['/list-utils.js'].branchData['41'][1].init(449, 16, '!grandparentNode');
function visit6_41_1(result) {
  _$jscoverage['/list-utils.js'].branchData['41'][1].ranCondition(result);
  return result;
}_$jscoverage['/list-utils.js'].branchData['35'][1].init(168, 27, 'listItem.nodeName() != \'li\'');
function visit5_35_1(result) {
  _$jscoverage['/list-utils.js'].branchData['35'][1].ranCondition(result);
  return result;
}_$jscoverage['/list-utils.js'].branchData['31'][1].init(76, 9, 'i < count');
function visit4_31_1(result) {
  _$jscoverage['/list-utils.js'].branchData['31'][1].ranCondition(result);
  return result;
}_$jscoverage['/list-utils.js'].branchData['26'][1].init(216, 10, '!baseArray');
function visit3_26_1(result) {
  _$jscoverage['/list-utils.js'].branchData['26'][1].ranCondition(result);
  return result;
}_$jscoverage['/list-utils.js'].branchData['24'][1].init(135, 16, '!baseIndentLevel');
function visit2_24_1(result) {
  _$jscoverage['/list-utils.js'].branchData['24'][1].ranCondition(result);
  return result;
}_$jscoverage['/list-utils.js'].branchData['21'][1].init(22, 37, '!listNodeNames[listNode.nodeName()]');
function visit1_21_1(result) {
  _$jscoverage['/list-utils.js'].branchData['21'][1].ranCondition(result);
  return result;
}_$jscoverage['/list-utils.js'].lineData[6]++;
KISSY.add('editor/plugin/list-utils', function(S, Editor) {
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
  _$jscoverage['/list-utils.js'].lineData[26]++;
  if (visit3_26_1(!baseArray)) {
    _$jscoverage['/list-utils.js'].lineData[27]++;
    baseArray = [];
  }
  _$jscoverage['/list-utils.js'].lineData[30]++;
  for (var i = 0, count = listNode[0].childNodes.length; visit4_31_1(i < count); i++) {
    _$jscoverage['/list-utils.js'].lineData[32]++;
    var listItem = new Node(listNode[0].childNodes[i]);
    _$jscoverage['/list-utils.js'].lineData[35]++;
    if (visit5_35_1(listItem.nodeName() != 'li')) {
      _$jscoverage['/list-utils.js'].lineData[36]++;
      continue;
    }
    _$jscoverage['/list-utils.js'].lineData[38]++;
    var itemObj = {
  'parent': listNode, 
  indent: baseIndentLevel, 
  element: listItem, 
  contents: []};
    _$jscoverage['/list-utils.js'].lineData[41]++;
    if (visit6_41_1(!grandparentNode)) {
      _$jscoverage['/list-utils.js'].lineData[42]++;
      itemObj.grandparent = listNode.parent();
      _$jscoverage['/list-utils.js'].lineData[43]++;
      if (visit7_43_1(itemObj.grandparent && visit8_43_2(itemObj.grandparent.nodeName() == 'li'))) {
        _$jscoverage['/list-utils.js'].lineData[44]++;
        itemObj.grandparent = itemObj.grandparent.parent();
      }
    } else {
      _$jscoverage['/list-utils.js'].lineData[47]++;
      itemObj.grandparent = grandparentNode;
    }
    _$jscoverage['/list-utils.js'].lineData[49]++;
    if (visit9_49_1(database)) {
      _$jscoverage['/list-utils.js'].lineData[50]++;
      listItem._4e_setMarker(database, 'listarray_index', baseArray.length, undefined);
    }
    _$jscoverage['/list-utils.js'].lineData[52]++;
    baseArray.push(itemObj);
    _$jscoverage['/list-utils.js'].lineData[54]++;
    for (var j = 0, itemChildCount = listItem[0].childNodes.length, child; visit10_55_1(j < itemChildCount); j++) {
      _$jscoverage['/list-utils.js'].lineData[56]++;
      child = new Node(listItem[0].childNodes[j]);
      _$jscoverage['/list-utils.js'].lineData[57]++;
      if (visit11_57_1(visit12_57_2(child[0].nodeType == Dom.NodeType.ELEMENT_NODE) && listNodeNames[child.nodeName()])) {
        _$jscoverage['/list-utils.js'].lineData[61]++;
        list.listToArray(child, database, baseArray, baseIndentLevel + 1, itemObj.grandparent);
      } else {
        _$jscoverage['/list-utils.js'].lineData[64]++;
        itemObj.contents.push(child);
      }
    }
  }
  _$jscoverage['/list-utils.js'].lineData[68]++;
  return baseArray;
}, 
  arrayToList: function(listArray, database, baseIndex, paragraphMode) {
  _$jscoverage['/list-utils.js'].functionData[2]++;
  _$jscoverage['/list-utils.js'].lineData[74]++;
  if (visit13_74_1(!baseIndex)) {
    _$jscoverage['/list-utils.js'].lineData[75]++;
    baseIndex = 0;
  }
  _$jscoverage['/list-utils.js'].lineData[77]++;
  if (visit14_77_1(!listArray || visit15_77_2(listArray.length < baseIndex + 1))) {
    _$jscoverage['/list-utils.js'].lineData[78]++;
    return null;
  }
  _$jscoverage['/list-utils.js'].lineData[80]++;
  var doc = listArray[baseIndex].parent[0].ownerDocument, retval = doc.createDocumentFragment(), rootNode = null, currentIndex = baseIndex, indentLevel = Math.max(listArray[baseIndex].indent, 0), currentListItem = null;
  _$jscoverage['/list-utils.js'].lineData[88]++;
  while (true) {
    _$jscoverage['/list-utils.js'].lineData[89]++;
    var item = listArray[currentIndex];
    _$jscoverage['/list-utils.js'].lineData[90]++;
    if (visit16_90_1(item.indent == indentLevel)) {
      _$jscoverage['/list-utils.js'].lineData[91]++;
      if (visit17_91_1(!rootNode || visit18_94_1(listArray[currentIndex].parent.nodeName() != rootNode.nodeName()))) {
        _$jscoverage['/list-utils.js'].lineData[95]++;
        rootNode = listArray[currentIndex].parent.clone(false);
        _$jscoverage['/list-utils.js'].lineData[96]++;
        retval.appendChild(rootNode[0]);
      }
      _$jscoverage['/list-utils.js'].lineData[98]++;
      currentListItem = rootNode[0].appendChild(item.element.clone(false)[0]);
      _$jscoverage['/list-utils.js'].lineData[99]++;
      for (var i = 0; visit19_99_1(i < item.contents.length); i++) {
        _$jscoverage['/list-utils.js'].lineData[100]++;
        currentListItem.appendChild(item.contents[i].clone(true)[0]);
      }
      _$jscoverage['/list-utils.js'].lineData[102]++;
      currentIndex++;
    } else {
      _$jscoverage['/list-utils.js'].lineData[103]++;
      if (visit20_103_1(item.indent == Math.max(indentLevel, 0) + 1)) {
        _$jscoverage['/list-utils.js'].lineData[105]++;
        var listData = list.arrayToList(listArray, null, currentIndex, paragraphMode);
        _$jscoverage['/list-utils.js'].lineData[107]++;
        currentListItem.appendChild(listData.listNode);
        _$jscoverage['/list-utils.js'].lineData[108]++;
        currentIndex = listData.nextIndex;
      } else {
        _$jscoverage['/list-utils.js'].lineData[109]++;
        if (visit21_109_1(visit22_109_2(item.indent == -1) && visit23_109_3(!baseIndex && item.grandparent))) {
          _$jscoverage['/list-utils.js'].lineData[112]++;
          if (visit24_112_1(listNodeNames[item.grandparent.nodeName()])) {
            _$jscoverage['/list-utils.js'].lineData[113]++;
            currentListItem = item.element.clone(false)[0];
          } else {
            _$jscoverage['/list-utils.js'].lineData[117]++;
            if (visit25_117_1(item.grandparent.nodeName() != 'td')) {
              _$jscoverage['/list-utils.js'].lineData[118]++;
              currentListItem = doc.createElement(paragraphMode);
              _$jscoverage['/list-utils.js'].lineData[119]++;
              item.element._4e_copyAttributes(new Node(currentListItem));
            } else {
              _$jscoverage['/list-utils.js'].lineData[122]++;
              currentListItem = doc.createDocumentFragment();
            }
          }
          _$jscoverage['/list-utils.js'].lineData[125]++;
          for (i = 0; visit26_125_1(i < item.contents.length); i++) {
            _$jscoverage['/list-utils.js'].lineData[126]++;
            var ic = item.contents[i].clone(true);
            _$jscoverage['/list-utils.js'].lineData[128]++;
            if (visit27_128_1(currentListItem.nodeType == NodeType.DOCUMENT_FRAGMENT_NODE)) {
              _$jscoverage['/list-utils.js'].lineData[129]++;
              item.element._4e_copyAttributes(new Node(ic));
            }
            _$jscoverage['/list-utils.js'].lineData[131]++;
            currentListItem.appendChild(ic[0]);
          }
          _$jscoverage['/list-utils.js'].lineData[134]++;
          if (visit28_134_1(visit29_134_2(currentListItem.nodeType == NodeType.DOCUMENT_FRAGMENT_NODE) && visit30_135_1(currentIndex != listArray.length - 1))) {
            _$jscoverage['/list-utils.js'].lineData[136]++;
            if (visit31_136_1(currentListItem.lastChild && visit32_137_1(visit33_137_2(currentListItem.lastChild.nodeType == Dom.NodeType.ELEMENT_NODE) && visit34_138_1(currentListItem.lastChild.getAttribute('type') == '_moz')))) {
              _$jscoverage['/list-utils.js'].lineData[139]++;
              Dom._4e_remove(currentListItem.lastChild);
            }
            _$jscoverage['/list-utils.js'].lineData[141]++;
            Dom._4e_appendBogus(currentListItem);
          }
          _$jscoverage['/list-utils.js'].lineData[144]++;
          if (visit35_144_1(visit36_144_2(currentListItem.nodeType == Dom.NodeType.ELEMENT_NODE) && visit37_145_1(visit38_145_2(Dom.nodeName(currentListItem) == paragraphMode) && currentListItem.firstChild))) {
            _$jscoverage['/list-utils.js'].lineData[147]++;
            Dom._4e_trim(currentListItem);
            _$jscoverage['/list-utils.js'].lineData[148]++;
            var firstChild = currentListItem.firstChild;
            _$jscoverage['/list-utils.js'].lineData[149]++;
            if (visit39_149_1(visit40_149_2(firstChild.nodeType == Dom.NodeType.ELEMENT_NODE) && Dom._4e_isBlockBoundary(firstChild))) {
              _$jscoverage['/list-utils.js'].lineData[151]++;
              var tmp = doc.createDocumentFragment();
              _$jscoverage['/list-utils.js'].lineData[152]++;
              Dom._4e_moveChildren(currentListItem, tmp);
              _$jscoverage['/list-utils.js'].lineData[153]++;
              currentListItem = tmp;
            }
          }
          _$jscoverage['/list-utils.js'].lineData[157]++;
          var currentListItemName = Dom.nodeName(currentListItem);
          _$jscoverage['/list-utils.js'].lineData[158]++;
          if (visit41_158_1(!UA['ie'] && (visit42_158_2(visit43_158_3(currentListItemName == 'div') || visit44_159_1(currentListItemName == 'p'))))) {
            _$jscoverage['/list-utils.js'].lineData[160]++;
            Dom._4e_appendBogus(currentListItem);
          }
          _$jscoverage['/list-utils.js'].lineData[162]++;
          retval.appendChild(currentListItem);
          _$jscoverage['/list-utils.js'].lineData[163]++;
          rootNode = null;
          _$jscoverage['/list-utils.js'].lineData[164]++;
          currentIndex++;
        } else {
          _$jscoverage['/list-utils.js'].lineData[167]++;
          return null;
        }
      }
    }
    _$jscoverage['/list-utils.js'].lineData[169]++;
    if (visit45_169_1(visit46_169_2(listArray.length <= currentIndex) || visit47_170_1(Math.max(listArray[currentIndex].indent, 0) < indentLevel))) {
      _$jscoverage['/list-utils.js'].lineData[171]++;
      break;
    }
  }
  _$jscoverage['/list-utils.js'].lineData[175]++;
  if (visit48_175_1(database)) {
    _$jscoverage['/list-utils.js'].lineData[176]++;
    var currentNode = new Node(retval.firstChild);
    _$jscoverage['/list-utils.js'].lineData[177]++;
    while (visit49_177_1(currentNode && currentNode[0])) {
      _$jscoverage['/list-utils.js'].lineData[178]++;
      if (visit50_178_1(currentNode[0].nodeType == Dom.NodeType.ELEMENT_NODE)) {
        _$jscoverage['/list-utils.js'].lineData[179]++;
        currentNode._4e_clearMarkers(database, true);
      }
      _$jscoverage['/list-utils.js'].lineData[181]++;
      currentNode = currentNode._4e_nextSourceNode();
    }
  }
  _$jscoverage['/list-utils.js'].lineData[185]++;
  return {
  listNode: retval, 
  nextIndex: currentIndex};
}};
  _$jscoverage['/list-utils.js'].lineData[189]++;
  return list;
}, {
  requires: ['editor']});
