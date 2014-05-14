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
if (! _$jscoverage['/base/insertion.js']) {
  _$jscoverage['/base/insertion.js'] = {};
  _$jscoverage['/base/insertion.js'].lineData = [];
  _$jscoverage['/base/insertion.js'].lineData[6] = 0;
  _$jscoverage['/base/insertion.js'].lineData[7] = 0;
  _$jscoverage['/base/insertion.js'].lineData[8] = 0;
  _$jscoverage['/base/insertion.js'].lineData[17] = 0;
  _$jscoverage['/base/insertion.js'].lineData[18] = 0;
  _$jscoverage['/base/insertion.js'].lineData[22] = 0;
  _$jscoverage['/base/insertion.js'].lineData[23] = 0;
  _$jscoverage['/base/insertion.js'].lineData[24] = 0;
  _$jscoverage['/base/insertion.js'].lineData[25] = 0;
  _$jscoverage['/base/insertion.js'].lineData[26] = 0;
  _$jscoverage['/base/insertion.js'].lineData[27] = 0;
  _$jscoverage['/base/insertion.js'].lineData[28] = 0;
  _$jscoverage['/base/insertion.js'].lineData[29] = 0;
  _$jscoverage['/base/insertion.js'].lineData[31] = 0;
  _$jscoverage['/base/insertion.js'].lineData[32] = 0;
  _$jscoverage['/base/insertion.js'].lineData[34] = 0;
  _$jscoverage['/base/insertion.js'].lineData[35] = 0;
  _$jscoverage['/base/insertion.js'].lineData[38] = 0;
  _$jscoverage['/base/insertion.js'].lineData[41] = 0;
  _$jscoverage['/base/insertion.js'].lineData[45] = 0;
  _$jscoverage['/base/insertion.js'].lineData[46] = 0;
  _$jscoverage['/base/insertion.js'].lineData[47] = 0;
  _$jscoverage['/base/insertion.js'].lineData[48] = 0;
  _$jscoverage['/base/insertion.js'].lineData[51] = 0;
  _$jscoverage['/base/insertion.js'].lineData[53] = 0;
  _$jscoverage['/base/insertion.js'].lineData[56] = 0;
  _$jscoverage['/base/insertion.js'].lineData[60] = 0;
  _$jscoverage['/base/insertion.js'].lineData[61] = 0;
  _$jscoverage['/base/insertion.js'].lineData[62] = 0;
  _$jscoverage['/base/insertion.js'].lineData[64] = 0;
  _$jscoverage['/base/insertion.js'].lineData[65] = 0;
  _$jscoverage['/base/insertion.js'].lineData[66] = 0;
  _$jscoverage['/base/insertion.js'].lineData[72] = 0;
  _$jscoverage['/base/insertion.js'].lineData[73] = 0;
  _$jscoverage['/base/insertion.js'].lineData[75] = 0;
  _$jscoverage['/base/insertion.js'].lineData[76] = 0;
  _$jscoverage['/base/insertion.js'].lineData[80] = 0;
  _$jscoverage['/base/insertion.js'].lineData[84] = 0;
  _$jscoverage['/base/insertion.js'].lineData[85] = 0;
  _$jscoverage['/base/insertion.js'].lineData[88] = 0;
  _$jscoverage['/base/insertion.js'].lineData[90] = 0;
  _$jscoverage['/base/insertion.js'].lineData[98] = 0;
  _$jscoverage['/base/insertion.js'].lineData[99] = 0;
  _$jscoverage['/base/insertion.js'].lineData[105] = 0;
  _$jscoverage['/base/insertion.js'].lineData[107] = 0;
  _$jscoverage['/base/insertion.js'].lineData[108] = 0;
  _$jscoverage['/base/insertion.js'].lineData[109] = 0;
  _$jscoverage['/base/insertion.js'].lineData[112] = 0;
  _$jscoverage['/base/insertion.js'].lineData[113] = 0;
  _$jscoverage['/base/insertion.js'].lineData[114] = 0;
  _$jscoverage['/base/insertion.js'].lineData[116] = 0;
  _$jscoverage['/base/insertion.js'].lineData[117] = 0;
  _$jscoverage['/base/insertion.js'].lineData[119] = 0;
  _$jscoverage['/base/insertion.js'].lineData[120] = 0;
  _$jscoverage['/base/insertion.js'].lineData[126] = 0;
  _$jscoverage['/base/insertion.js'].lineData[143] = 0;
  _$jscoverage['/base/insertion.js'].lineData[144] = 0;
  _$jscoverage['/base/insertion.js'].lineData[145] = 0;
  _$jscoverage['/base/insertion.js'].lineData[157] = 0;
  _$jscoverage['/base/insertion.js'].lineData[158] = 0;
  _$jscoverage['/base/insertion.js'].lineData[159] = 0;
  _$jscoverage['/base/insertion.js'].lineData[171] = 0;
  _$jscoverage['/base/insertion.js'].lineData[172] = 0;
  _$jscoverage['/base/insertion.js'].lineData[183] = 0;
  _$jscoverage['/base/insertion.js'].lineData[184] = 0;
  _$jscoverage['/base/insertion.js'].lineData[195] = 0;
  _$jscoverage['/base/insertion.js'].lineData[196] = 0;
  _$jscoverage['/base/insertion.js'].lineData[197] = 0;
  _$jscoverage['/base/insertion.js'].lineData[198] = 0;
  _$jscoverage['/base/insertion.js'].lineData[200] = 0;
  _$jscoverage['/base/insertion.js'].lineData[201] = 0;
  _$jscoverage['/base/insertion.js'].lineData[202] = 0;
  _$jscoverage['/base/insertion.js'].lineData[204] = 0;
  _$jscoverage['/base/insertion.js'].lineData[213] = 0;
  _$jscoverage['/base/insertion.js'].lineData[214] = 0;
  _$jscoverage['/base/insertion.js'].lineData[215] = 0;
  _$jscoverage['/base/insertion.js'].lineData[216] = 0;
  _$jscoverage['/base/insertion.js'].lineData[226] = 0;
  _$jscoverage['/base/insertion.js'].lineData[227] = 0;
  _$jscoverage['/base/insertion.js'].lineData[228] = 0;
  _$jscoverage['/base/insertion.js'].lineData[229] = 0;
  _$jscoverage['/base/insertion.js'].lineData[230] = 0;
  _$jscoverage['/base/insertion.js'].lineData[231] = 0;
  _$jscoverage['/base/insertion.js'].lineData[233] = 0;
  _$jscoverage['/base/insertion.js'].lineData[244] = 0;
  _$jscoverage['/base/insertion.js'].lineData[245] = 0;
  _$jscoverage['/base/insertion.js'].lineData[246] = 0;
  _$jscoverage['/base/insertion.js'].lineData[247] = 0;
  _$jscoverage['/base/insertion.js'].lineData[257] = 0;
  _$jscoverage['/base/insertion.js'].lineData[258] = 0;
  _$jscoverage['/base/insertion.js'].lineData[259] = 0;
  _$jscoverage['/base/insertion.js'].lineData[260] = 0;
  _$jscoverage['/base/insertion.js'].lineData[261] = 0;
  _$jscoverage['/base/insertion.js'].lineData[264] = 0;
  _$jscoverage['/base/insertion.js'].lineData[270] = 0;
  _$jscoverage['/base/insertion.js'].lineData[272] = 0;
}
if (! _$jscoverage['/base/insertion.js'].functionData) {
  _$jscoverage['/base/insertion.js'].functionData = [];
  _$jscoverage['/base/insertion.js'].functionData[0] = 0;
  _$jscoverage['/base/insertion.js'].functionData[1] = 0;
  _$jscoverage['/base/insertion.js'].functionData[2] = 0;
  _$jscoverage['/base/insertion.js'].functionData[3] = 0;
  _$jscoverage['/base/insertion.js'].functionData[4] = 0;
  _$jscoverage['/base/insertion.js'].functionData[5] = 0;
  _$jscoverage['/base/insertion.js'].functionData[6] = 0;
  _$jscoverage['/base/insertion.js'].functionData[7] = 0;
  _$jscoverage['/base/insertion.js'].functionData[8] = 0;
  _$jscoverage['/base/insertion.js'].functionData[9] = 0;
  _$jscoverage['/base/insertion.js'].functionData[10] = 0;
  _$jscoverage['/base/insertion.js'].functionData[11] = 0;
  _$jscoverage['/base/insertion.js'].functionData[12] = 0;
  _$jscoverage['/base/insertion.js'].functionData[13] = 0;
  _$jscoverage['/base/insertion.js'].functionData[14] = 0;
  _$jscoverage['/base/insertion.js'].functionData[15] = 0;
  _$jscoverage['/base/insertion.js'].functionData[16] = 0;
  _$jscoverage['/base/insertion.js'].functionData[17] = 0;
  _$jscoverage['/base/insertion.js'].functionData[18] = 0;
  _$jscoverage['/base/insertion.js'].functionData[19] = 0;
  _$jscoverage['/base/insertion.js'].functionData[20] = 0;
  _$jscoverage['/base/insertion.js'].functionData[21] = 0;
}
if (! _$jscoverage['/base/insertion.js'].branchData) {
  _$jscoverage['/base/insertion.js'].branchData = {};
  _$jscoverage['/base/insertion.js'].branchData['18'] = [];
  _$jscoverage['/base/insertion.js'].branchData['18'][1] = new BranchData();
  _$jscoverage['/base/insertion.js'].branchData['27'] = [];
  _$jscoverage['/base/insertion.js'].branchData['27'][1] = new BranchData();
  _$jscoverage['/base/insertion.js'].branchData['29'] = [];
  _$jscoverage['/base/insertion.js'].branchData['29'][1] = new BranchData();
  _$jscoverage['/base/insertion.js'].branchData['29'][2] = new BranchData();
  _$jscoverage['/base/insertion.js'].branchData['31'] = [];
  _$jscoverage['/base/insertion.js'].branchData['31'][1] = new BranchData();
  _$jscoverage['/base/insertion.js'].branchData['34'] = [];
  _$jscoverage['/base/insertion.js'].branchData['34'][1] = new BranchData();
  _$jscoverage['/base/insertion.js'].branchData['38'] = [];
  _$jscoverage['/base/insertion.js'].branchData['38'][1] = new BranchData();
  _$jscoverage['/base/insertion.js'].branchData['38'][2] = new BranchData();
  _$jscoverage['/base/insertion.js'].branchData['45'] = [];
  _$jscoverage['/base/insertion.js'].branchData['45'][1] = new BranchData();
  _$jscoverage['/base/insertion.js'].branchData['47'] = [];
  _$jscoverage['/base/insertion.js'].branchData['47'][1] = new BranchData();
  _$jscoverage['/base/insertion.js'].branchData['61'] = [];
  _$jscoverage['/base/insertion.js'].branchData['61'][1] = new BranchData();
  _$jscoverage['/base/insertion.js'].branchData['64'] = [];
  _$jscoverage['/base/insertion.js'].branchData['64'][1] = new BranchData();
  _$jscoverage['/base/insertion.js'].branchData['64'][2] = new BranchData();
  _$jscoverage['/base/insertion.js'].branchData['64'][3] = new BranchData();
  _$jscoverage['/base/insertion.js'].branchData['65'] = [];
  _$jscoverage['/base/insertion.js'].branchData['65'][1] = new BranchData();
  _$jscoverage['/base/insertion.js'].branchData['75'] = [];
  _$jscoverage['/base/insertion.js'].branchData['75'][1] = new BranchData();
  _$jscoverage['/base/insertion.js'].branchData['84'] = [];
  _$jscoverage['/base/insertion.js'].branchData['84'][1] = new BranchData();
  _$jscoverage['/base/insertion.js'].branchData['98'] = [];
  _$jscoverage['/base/insertion.js'].branchData['98'][1] = new BranchData();
  _$jscoverage['/base/insertion.js'].branchData['98'][2] = new BranchData();
  _$jscoverage['/base/insertion.js'].branchData['98'][3] = new BranchData();
  _$jscoverage['/base/insertion.js'].branchData['107'] = [];
  _$jscoverage['/base/insertion.js'].branchData['107'][1] = new BranchData();
  _$jscoverage['/base/insertion.js'].branchData['112'] = [];
  _$jscoverage['/base/insertion.js'].branchData['112'][1] = new BranchData();
  _$jscoverage['/base/insertion.js'].branchData['114'] = [];
  _$jscoverage['/base/insertion.js'].branchData['114'][1] = new BranchData();
  _$jscoverage['/base/insertion.js'].branchData['116'] = [];
  _$jscoverage['/base/insertion.js'].branchData['116'][1] = new BranchData();
  _$jscoverage['/base/insertion.js'].branchData['119'] = [];
  _$jscoverage['/base/insertion.js'].branchData['119'][1] = new BranchData();
  _$jscoverage['/base/insertion.js'].branchData['144'] = [];
  _$jscoverage['/base/insertion.js'].branchData['144'][1] = new BranchData();
  _$jscoverage['/base/insertion.js'].branchData['158'] = [];
  _$jscoverage['/base/insertion.js'].branchData['158'][1] = new BranchData();
  _$jscoverage['/base/insertion.js'].branchData['197'] = [];
  _$jscoverage['/base/insertion.js'].branchData['197'][1] = new BranchData();
  _$jscoverage['/base/insertion.js'].branchData['201'] = [];
  _$jscoverage['/base/insertion.js'].branchData['201'][1] = new BranchData();
  _$jscoverage['/base/insertion.js'].branchData['201'][2] = new BranchData();
  _$jscoverage['/base/insertion.js'].branchData['230'] = [];
  _$jscoverage['/base/insertion.js'].branchData['230'][1] = new BranchData();
}
_$jscoverage['/base/insertion.js'].branchData['230'][1].init(74, 15, 'contents.length');
function visit262_230_1(result) {
  _$jscoverage['/base/insertion.js'].branchData['230'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/insertion.js'].branchData['201'][2].init(370, 16, 'c.nodeType === 1');
function visit261_201_2(result) {
  _$jscoverage['/base/insertion.js'].branchData['201'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/insertion.js'].branchData['201'][1].init(339, 47, '(c = wrapperNode.firstChild) && c.nodeType === 1');
function visit260_201_1(result) {
  _$jscoverage['/base/insertion.js'].branchData['201'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/insertion.js'].branchData['197'][1].init(176, 26, 'wrappedNodes[0].parentNode');
function visit259_197_1(result) {
  _$jscoverage['/base/insertion.js'].branchData['197'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/insertion.js'].branchData['158'][1].init(25, 20, 'refNode[PARENT_NODE]');
function visit258_158_1(result) {
  _$jscoverage['/base/insertion.js'].branchData['158'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/insertion.js'].branchData['144'][1].init(25, 20, 'refNode[PARENT_NODE]');
function visit257_144_1(result) {
  _$jscoverage['/base/insertion.js'].branchData['144'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/insertion.js'].branchData['119'][1].init(236, 25, 'scripts && scripts.length');
function visit256_119_1(result) {
  _$jscoverage['/base/insertion.js'].branchData['119'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/insertion.js'].branchData['116'][1].init(62, 5, 'i > 0');
function visit255_116_1(result) {
  _$jscoverage['/base/insertion.js'].branchData['116'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/insertion.js'].branchData['114'][1].init(52, 7, 'newNode');
function visit254_114_1(result) {
  _$jscoverage['/base/insertion.js'].branchData['114'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/insertion.js'].branchData['112'][1].init(1177, 18, 'i < refNodesLength');
function visit253_112_1(result) {
  _$jscoverage['/base/insertion.js'].branchData['112'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/insertion.js'].branchData['107'][1].init(1027, 18, 'refNodesLength > 1');
function visit252_107_1(result) {
  _$jscoverage['/base/insertion.js'].branchData['107'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/insertion.js'].branchData['98'][3].init(705, 27, '!scripts || !scripts.length');
function visit251_98_3(result) {
  _$jscoverage['/base/insertion.js'].branchData['98'][3].ranCondition(result);
  return result;
}_$jscoverage['/base/insertion.js'].branchData['98'][2].init(685, 48, '!newNodesLength && (!scripts || !scripts.length)');
function visit250_98_2(result) {
  _$jscoverage['/base/insertion.js'].branchData['98'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/insertion.js'].branchData['98'][1].init(685, 68, '(!newNodesLength && (!scripts || !scripts.length)) || !refNodesLength');
function visit249_98_1(result) {
  _$jscoverage['/base/insertion.js'].branchData['98'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/insertion.js'].branchData['84'][1].init(352, 24, 'Dom._fixInsertionChecked');
function visit248_84_1(result) {
  _$jscoverage['/base/insertion.js'].branchData['84'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/insertion.js'].branchData['75'][1].init(54, 7, 'scripts');
function visit247_75_1(result) {
  _$jscoverage['/base/insertion.js'].branchData['75'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/insertion.js'].branchData['65'][1].init(97, 4, 'code');
function visit246_65_1(result) {
  _$jscoverage['/base/insertion.js'].branchData['65'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/insertion.js'].branchData['64'][3].init(43, 18, 'el.innerHTML || \'\'');
function visit245_64_3(result) {
  _$jscoverage['/base/insertion.js'].branchData['64'][3].ranCondition(result);
  return result;
}_$jscoverage['/base/insertion.js'].branchData['64'][2].init(25, 36, 'el.textContent || el.innerHTML || \'\'');
function visit244_64_2(result) {
  _$jscoverage['/base/insertion.js'].branchData['64'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/insertion.js'].branchData['64'][1].init(31, 47, 'el.text || el.textContent || el.innerHTML || \'\'');
function visit243_64_1(result) {
  _$jscoverage['/base/insertion.js'].branchData['64'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/insertion.js'].branchData['61'][1].init(13, 6, 'el.src');
function visit242_61_1(result) {
  _$jscoverage['/base/insertion.js'].branchData['61'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/insertion.js'].branchData['47'][1].init(64, 7, 'isJs(s)');
function visit241_47_1(result) {
  _$jscoverage['/base/insertion.js'].branchData['47'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/insertion.js'].branchData['45'][1].init(185, 13, 'j < ss.length');
function visit240_45_1(result) {
  _$jscoverage['/base/insertion.js'].branchData['45'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/insertion.js'].branchData['38'][2].init(21, 37, 'el.nodeType === NodeType.ELEMENT_NODE');
function visit239_38_2(result) {
  _$jscoverage['/base/insertion.js'].branchData['38'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/insertion.js'].branchData['38'][1].init(21, 158, 'el.nodeType === NodeType.ELEMENT_NODE && !RE_FORM_EL.test(nodeName)');
function visit238_38_1(result) {
  _$jscoverage['/base/insertion.js'].branchData['38'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/insertion.js'].branchData['34'][1].init(205, 7, 'scripts');
function visit237_34_1(result) {
  _$jscoverage['/base/insertion.js'].branchData['34'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/insertion.js'].branchData['31'][1].init(99, 13, 'el.parentNode');
function visit236_31_1(result) {
  _$jscoverage['/base/insertion.js'].branchData['31'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/insertion.js'].branchData['29'][2].init(246, 21, 'nodeName === \'script\'');
function visit235_29_2(result) {
  _$jscoverage['/base/insertion.js'].branchData['29'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/insertion.js'].branchData['29'][1].init(246, 33, 'nodeName === \'script\' && isJs(el)');
function visit234_29_1(result) {
  _$jscoverage['/base/insertion.js'].branchData['29'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/insertion.js'].branchData['27'][1].init(84, 47, 'el.nodeType === NodeType.DOCUMENT_FRAGMENT_NODE');
function visit233_27_1(result) {
  _$jscoverage['/base/insertion.js'].branchData['27'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/insertion.js'].branchData['18'][1].init(16, 39, '!el.type || R_SCRIPT_TYPE.test(el.type)');
function visit232_18_1(result) {
  _$jscoverage['/base/insertion.js'].branchData['18'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/insertion.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/base/insertion.js'].functionData[0]++;
  _$jscoverage['/base/insertion.js'].lineData[7]++;
  var Dom = require('./api');
  _$jscoverage['/base/insertion.js'].lineData[8]++;
  var PARENT_NODE = 'parentNode', NodeType = Dom.NodeType, RE_FORM_EL = /^(?:button|input|object|select|textarea)$/i, getNodeName = Dom.nodeName, makeArray = S.makeArray, splice = [].splice, NEXT_SIBLING = 'nextSibling', R_SCRIPT_TYPE = /\/(java|ecma)script/i;
  _$jscoverage['/base/insertion.js'].lineData[17]++;
  function isJs(el) {
    _$jscoverage['/base/insertion.js'].functionData[1]++;
    _$jscoverage['/base/insertion.js'].lineData[18]++;
    return visit232_18_1(!el.type || R_SCRIPT_TYPE.test(el.type));
  }
  _$jscoverage['/base/insertion.js'].lineData[22]++;
  function filterScripts(nodes, scripts) {
    _$jscoverage['/base/insertion.js'].functionData[2]++;
    _$jscoverage['/base/insertion.js'].lineData[23]++;
    var ret = [], i, el, nodeName;
    _$jscoverage['/base/insertion.js'].lineData[24]++;
    for (i = 0; nodes[i]; i++) {
      _$jscoverage['/base/insertion.js'].lineData[25]++;
      el = nodes[i];
      _$jscoverage['/base/insertion.js'].lineData[26]++;
      nodeName = getNodeName(el);
      _$jscoverage['/base/insertion.js'].lineData[27]++;
      if (visit233_27_1(el.nodeType === NodeType.DOCUMENT_FRAGMENT_NODE)) {
        _$jscoverage['/base/insertion.js'].lineData[28]++;
        ret.push.apply(ret, filterScripts(makeArray(el.childNodes), scripts));
      } else {
        _$jscoverage['/base/insertion.js'].lineData[29]++;
        if (visit234_29_1(visit235_29_2(nodeName === 'script') && isJs(el))) {
          _$jscoverage['/base/insertion.js'].lineData[31]++;
          if (visit236_31_1(el.parentNode)) {
            _$jscoverage['/base/insertion.js'].lineData[32]++;
            el.parentNode.removeChild(el);
          }
          _$jscoverage['/base/insertion.js'].lineData[34]++;
          if (visit237_34_1(scripts)) {
            _$jscoverage['/base/insertion.js'].lineData[35]++;
            scripts.push(el);
          }
        } else {
          _$jscoverage['/base/insertion.js'].lineData[38]++;
          if (visit238_38_1(visit239_38_2(el.nodeType === NodeType.ELEMENT_NODE) && !RE_FORM_EL.test(nodeName))) {
            _$jscoverage['/base/insertion.js'].lineData[41]++;
            var tmp = [], s, j, ss = el.getElementsByTagName('script');
            _$jscoverage['/base/insertion.js'].lineData[45]++;
            for (j = 0; visit240_45_1(j < ss.length); j++) {
              _$jscoverage['/base/insertion.js'].lineData[46]++;
              s = ss[j];
              _$jscoverage['/base/insertion.js'].lineData[47]++;
              if (visit241_47_1(isJs(s))) {
                _$jscoverage['/base/insertion.js'].lineData[48]++;
                tmp.push(s);
              }
            }
            _$jscoverage['/base/insertion.js'].lineData[51]++;
            splice.apply(nodes, [i + 1, 0].concat(tmp));
          }
          _$jscoverage['/base/insertion.js'].lineData[53]++;
          ret.push(el);
        }
      }
    }
    _$jscoverage['/base/insertion.js'].lineData[56]++;
    return ret;
  }
  _$jscoverage['/base/insertion.js'].lineData[60]++;
  function evalScript(el) {
    _$jscoverage['/base/insertion.js'].functionData[3]++;
    _$jscoverage['/base/insertion.js'].lineData[61]++;
    if (visit242_61_1(el.src)) {
      _$jscoverage['/base/insertion.js'].lineData[62]++;
      S.getScript(el.src);
    } else {
      _$jscoverage['/base/insertion.js'].lineData[64]++;
      var code = S.trim(visit243_64_1(el.text || visit244_64_2(el.textContent || visit245_64_3(el.innerHTML || ''))));
      _$jscoverage['/base/insertion.js'].lineData[65]++;
      if (visit246_65_1(code)) {
        _$jscoverage['/base/insertion.js'].lineData[66]++;
        S.globalEval(code);
      }
    }
  }
  _$jscoverage['/base/insertion.js'].lineData[72]++;
  function insertion(newNodes, refNodes, fn, scripts) {
    _$jscoverage['/base/insertion.js'].functionData[4]++;
    _$jscoverage['/base/insertion.js'].lineData[73]++;
    newNodes = Dom.query(newNodes);
    _$jscoverage['/base/insertion.js'].lineData[75]++;
    if (visit247_75_1(scripts)) {
      _$jscoverage['/base/insertion.js'].lineData[76]++;
      scripts = [];
    }
    _$jscoverage['/base/insertion.js'].lineData[80]++;
    newNodes = filterScripts(newNodes, scripts);
    _$jscoverage['/base/insertion.js'].lineData[84]++;
    if (visit248_84_1(Dom._fixInsertionChecked)) {
      _$jscoverage['/base/insertion.js'].lineData[85]++;
      Dom._fixInsertionChecked(newNodes);
    }
    _$jscoverage['/base/insertion.js'].lineData[88]++;
    refNodes = Dom.query(refNodes);
    _$jscoverage['/base/insertion.js'].lineData[90]++;
    var newNodesLength = newNodes.length, newNode, i, refNode, node, clonedNode, refNodesLength = refNodes.length;
    _$jscoverage['/base/insertion.js'].lineData[98]++;
    if (visit249_98_1((visit250_98_2(!newNodesLength && (visit251_98_3(!scripts || !scripts.length)))) || !refNodesLength)) {
      _$jscoverage['/base/insertion.js'].lineData[99]++;
      return;
    }
    _$jscoverage['/base/insertion.js'].lineData[105]++;
    newNode = Dom._nodeListToFragment(newNodes);
    _$jscoverage['/base/insertion.js'].lineData[107]++;
    if (visit252_107_1(refNodesLength > 1)) {
      _$jscoverage['/base/insertion.js'].lineData[108]++;
      clonedNode = Dom.clone(newNode, true);
      _$jscoverage['/base/insertion.js'].lineData[109]++;
      refNodes = S.makeArray(refNodes);
    }
    _$jscoverage['/base/insertion.js'].lineData[112]++;
    for (i = 0; visit253_112_1(i < refNodesLength); i++) {
      _$jscoverage['/base/insertion.js'].lineData[113]++;
      refNode = refNodes[i];
      _$jscoverage['/base/insertion.js'].lineData[114]++;
      if (visit254_114_1(newNode)) {
        _$jscoverage['/base/insertion.js'].lineData[116]++;
        node = visit255_116_1(i > 0) ? Dom.clone(clonedNode, true) : newNode;
        _$jscoverage['/base/insertion.js'].lineData[117]++;
        fn(node, refNode);
      }
      _$jscoverage['/base/insertion.js'].lineData[119]++;
      if (visit256_119_1(scripts && scripts.length)) {
        _$jscoverage['/base/insertion.js'].lineData[120]++;
        S.each(scripts, evalScript);
      }
    }
  }
  _$jscoverage['/base/insertion.js'].lineData[126]++;
  S.mix(Dom, {
  _fixInsertionChecked: null, 
  insertBefore: function(newNodes, refNodes, loadScripts) {
  _$jscoverage['/base/insertion.js'].functionData[5]++;
  _$jscoverage['/base/insertion.js'].lineData[143]++;
  insertion(newNodes, refNodes, function(newNode, refNode) {
  _$jscoverage['/base/insertion.js'].functionData[6]++;
  _$jscoverage['/base/insertion.js'].lineData[144]++;
  if (visit257_144_1(refNode[PARENT_NODE])) {
    _$jscoverage['/base/insertion.js'].lineData[145]++;
    refNode[PARENT_NODE].insertBefore(newNode, refNode);
  }
}, loadScripts);
}, 
  insertAfter: function(newNodes, refNodes, loadScripts) {
  _$jscoverage['/base/insertion.js'].functionData[7]++;
  _$jscoverage['/base/insertion.js'].lineData[157]++;
  insertion(newNodes, refNodes, function(newNode, refNode) {
  _$jscoverage['/base/insertion.js'].functionData[8]++;
  _$jscoverage['/base/insertion.js'].lineData[158]++;
  if (visit258_158_1(refNode[PARENT_NODE])) {
    _$jscoverage['/base/insertion.js'].lineData[159]++;
    refNode[PARENT_NODE].insertBefore(newNode, refNode[NEXT_SIBLING]);
  }
}, loadScripts);
}, 
  appendTo: function(newNodes, parents, loadScripts) {
  _$jscoverage['/base/insertion.js'].functionData[9]++;
  _$jscoverage['/base/insertion.js'].lineData[171]++;
  insertion(newNodes, parents, function(newNode, parent) {
  _$jscoverage['/base/insertion.js'].functionData[10]++;
  _$jscoverage['/base/insertion.js'].lineData[172]++;
  parent.appendChild(newNode);
}, loadScripts);
}, 
  prependTo: function(newNodes, parents, loadScripts) {
  _$jscoverage['/base/insertion.js'].functionData[11]++;
  _$jscoverage['/base/insertion.js'].lineData[183]++;
  insertion(newNodes, parents, function(newNode, parent) {
  _$jscoverage['/base/insertion.js'].functionData[12]++;
  _$jscoverage['/base/insertion.js'].lineData[184]++;
  parent.insertBefore(newNode, parent.firstChild);
}, loadScripts);
}, 
  wrapAll: function(wrappedNodes, wrapperNode) {
  _$jscoverage['/base/insertion.js'].functionData[13]++;
  _$jscoverage['/base/insertion.js'].lineData[195]++;
  wrapperNode = Dom.clone(Dom.get(wrapperNode), true);
  _$jscoverage['/base/insertion.js'].lineData[196]++;
  wrappedNodes = Dom.query(wrappedNodes);
  _$jscoverage['/base/insertion.js'].lineData[197]++;
  if (visit259_197_1(wrappedNodes[0].parentNode)) {
    _$jscoverage['/base/insertion.js'].lineData[198]++;
    Dom.insertBefore(wrapperNode, wrappedNodes[0]);
  }
  _$jscoverage['/base/insertion.js'].lineData[200]++;
  var c;
  _$jscoverage['/base/insertion.js'].lineData[201]++;
  while (visit260_201_1((c = wrapperNode.firstChild) && visit261_201_2(c.nodeType === 1))) {
    _$jscoverage['/base/insertion.js'].lineData[202]++;
    wrapperNode = c;
  }
  _$jscoverage['/base/insertion.js'].lineData[204]++;
  Dom.appendTo(wrappedNodes, wrapperNode);
}, 
  wrap: function(wrappedNodes, wrapperNode) {
  _$jscoverage['/base/insertion.js'].functionData[14]++;
  _$jscoverage['/base/insertion.js'].lineData[213]++;
  wrappedNodes = Dom.query(wrappedNodes);
  _$jscoverage['/base/insertion.js'].lineData[214]++;
  wrapperNode = Dom.get(wrapperNode);
  _$jscoverage['/base/insertion.js'].lineData[215]++;
  S.each(wrappedNodes, function(w) {
  _$jscoverage['/base/insertion.js'].functionData[15]++;
  _$jscoverage['/base/insertion.js'].lineData[216]++;
  Dom.wrapAll(w, wrapperNode);
});
}, 
  wrapInner: function(wrappedNodes, wrapperNode) {
  _$jscoverage['/base/insertion.js'].functionData[16]++;
  _$jscoverage['/base/insertion.js'].lineData[226]++;
  wrappedNodes = Dom.query(wrappedNodes);
  _$jscoverage['/base/insertion.js'].lineData[227]++;
  wrapperNode = Dom.get(wrapperNode);
  _$jscoverage['/base/insertion.js'].lineData[228]++;
  S.each(wrappedNodes, function(w) {
  _$jscoverage['/base/insertion.js'].functionData[17]++;
  _$jscoverage['/base/insertion.js'].lineData[229]++;
  var contents = w.childNodes;
  _$jscoverage['/base/insertion.js'].lineData[230]++;
  if (visit262_230_1(contents.length)) {
    _$jscoverage['/base/insertion.js'].lineData[231]++;
    Dom.wrapAll(contents, wrapperNode);
  } else {
    _$jscoverage['/base/insertion.js'].lineData[233]++;
    w.appendChild(wrapperNode);
  }
});
}, 
  unwrap: function(wrappedNodes) {
  _$jscoverage['/base/insertion.js'].functionData[18]++;
  _$jscoverage['/base/insertion.js'].lineData[244]++;
  wrappedNodes = Dom.query(wrappedNodes);
  _$jscoverage['/base/insertion.js'].lineData[245]++;
  S.each(wrappedNodes, function(w) {
  _$jscoverage['/base/insertion.js'].functionData[19]++;
  _$jscoverage['/base/insertion.js'].lineData[246]++;
  var p = w.parentNode;
  _$jscoverage['/base/insertion.js'].lineData[247]++;
  Dom.replaceWith(p, p.childNodes);
});
}, 
  replaceWith: function(selector, newNodes) {
  _$jscoverage['/base/insertion.js'].functionData[20]++;
  _$jscoverage['/base/insertion.js'].lineData[257]++;
  var nodes = Dom.query(selector);
  _$jscoverage['/base/insertion.js'].lineData[258]++;
  newNodes = Dom.query(newNodes);
  _$jscoverage['/base/insertion.js'].lineData[259]++;
  Dom.remove(newNodes, true);
  _$jscoverage['/base/insertion.js'].lineData[260]++;
  Dom.insertBefore(newNodes, nodes);
  _$jscoverage['/base/insertion.js'].lineData[261]++;
  Dom.remove(nodes);
}});
  _$jscoverage['/base/insertion.js'].lineData[264]++;
  S.each({
  'prepend': 'prependTo', 
  'append': 'appendTo', 
  'before': 'insertBefore', 
  'after': 'insertAfter'}, function(value, key) {
  _$jscoverage['/base/insertion.js'].functionData[21]++;
  _$jscoverage['/base/insertion.js'].lineData[270]++;
  Dom[key] = Dom[value];
});
  _$jscoverage['/base/insertion.js'].lineData[272]++;
  return Dom;
});
