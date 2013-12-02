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
if (! _$jscoverage['/editor/enterKey.js']) {
  _$jscoverage['/editor/enterKey.js'] = {};
  _$jscoverage['/editor/enterKey.js'].lineData = [];
  _$jscoverage['/editor/enterKey.js'].lineData[10] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[11] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[12] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[13] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[14] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[15] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[16] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[19] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[21] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[23] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[24] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[27] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[30] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[32] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[33] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[35] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[36] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[39] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[43] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[44] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[45] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[46] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[47] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[49] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[55] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[58] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[60] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[61] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[65] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[68] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[71] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[74] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[75] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[76] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[77] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[78] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[81] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[82] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[83] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[84] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[87] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[92] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[96] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[99] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[104] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[105] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[111] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[115] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[117] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[120] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[121] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[124] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[125] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[131] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[132] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[133] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[134] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[136] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[138] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[141] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[142] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[143] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[144] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[149] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[150] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[153] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[160] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[162] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[163] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[167] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[170] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[171] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[174] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[177] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[179] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[180] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[185] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[190] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[197] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[198] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[201] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[202] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[203] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[204] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[205] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[206] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[207] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[208] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[209] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[210] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[211] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[218] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[220] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[223] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[224] = 0;
}
if (! _$jscoverage['/editor/enterKey.js'].functionData) {
  _$jscoverage['/editor/enterKey.js'].functionData = [];
  _$jscoverage['/editor/enterKey.js'].functionData[0] = 0;
  _$jscoverage['/editor/enterKey.js'].functionData[1] = 0;
  _$jscoverage['/editor/enterKey.js'].functionData[2] = 0;
  _$jscoverage['/editor/enterKey.js'].functionData[3] = 0;
  _$jscoverage['/editor/enterKey.js'].functionData[4] = 0;
  _$jscoverage['/editor/enterKey.js'].functionData[5] = 0;
  _$jscoverage['/editor/enterKey.js'].functionData[6] = 0;
}
if (! _$jscoverage['/editor/enterKey.js'].branchData) {
  _$jscoverage['/editor/enterKey.js'].branchData = {};
  _$jscoverage['/editor/enterKey.js'].branchData['15'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['15'][1] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['23'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['23'][1] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['35'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['35'][1] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['39'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['39'][1] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['40'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['40'][1] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['40'][2] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['40'][3] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['43'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['43'][1] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['60'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['60'][1] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['74'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['74'][1] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['76'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['76'][1] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['81'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['81'][1] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['81'][2] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['81'][3] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['92'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['92'][1] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['96'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['96'][1] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['96'][2] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['97'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['97'][1] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['104'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['104'][1] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['111'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['111'][1] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['115'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['115'][1] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['115'][2] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['120'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['120'][1] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['124'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['124'][1] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['132'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['132'][1] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['133'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['133'][1] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['136'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['136'][1] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['141'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['141'][1] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['149'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['149'][1] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['160'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['160'][1] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['160'][2] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['160'][3] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['167'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['167'][1] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['170'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['170'][1] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['171'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['171'][1] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['205'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['205'][1] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['206'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['206'][1] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['206'][2] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['206'][3] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['210'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['210'][1] = new BranchData();
}
_$jscoverage['/editor/enterKey.js'].branchData['210'][1].init(184, 12, 're !== false');
function visit335_210_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['210'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['206'][3].init(38, 24, 'ev.ctrlKey || ev.metaKey');
function visit334_206_3(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['206'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['206'][2].init(23, 39, 'ev.shiftKey || ev.ctrlKey || ev.metaKey');
function visit333_206_2(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['206'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['206'][1].init(21, 42, '!(ev.shiftKey || ev.ctrlKey || ev.metaKey)');
function visit332_206_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['206'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['205'][1].init(55, 14, 'keyCode === 13');
function visit331_205_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['205'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['171'][1].init(17, 9, 'nextBlock');
function visit330_171_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['171'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['170'][1].init(5446, 7, '!OLD_IE');
function visit329_170_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['170'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['167'][1].init(2441, 31, 'isStartOfBlock && !isEndOfBlock');
function visit328_167_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['167'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['160'][3].init(2086, 52, '!isEndOfBlock || !previousBlock[0].childNodes.length');
function visit327_160_3(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['160'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['160'][2].init(2066, 74, 'isStartOfBlock && (!isEndOfBlock || !previousBlock[0].childNodes.length)');
function visit326_160_2(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['160'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['160'][1].init(2056, 84, 'OLD_IE && isStartOfBlock && (!isEndOfBlock || !previousBlock[0].childNodes.length)');
function visit325_160_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['160'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['149'][1].init(1636, 7, '!OLD_IE');
function visit324_149_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['149'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['141'][1].init(316, 38, 'dtd.$removeEmpty[element.nodeName()]');
function visit323_141_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['141'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['136'][1].init(87, 99, 'element.equals(elementPath.block) || element.equals(elementPath.blockLimit)');
function visit322_136_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['136'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['133'][1].init(68, 7, 'i < len');
function visit321_133_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['133'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['132'][1].init(950, 11, 'elementPath');
function visit320_132_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['132'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['124'][1].init(607, 9, '!newBlock');
function visit319_124_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['124'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['120'][1].init(519, 9, 'nextBlock');
function visit318_120_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['120'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['115'][2].init(214, 33, 'previousBlock.nodeName() === \'li\'');
function visit317_115_2(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['115'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['115'][1].init(214, 83, 'previousBlock.nodeName() === \'li\' || !headerTagRegex.test(previousBlock.nodeName())');
function visit316_115_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['115'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['111'][1].init(30, 13, 'previousBlock');
function visit315_111_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['111'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['104'][1].init(608, 9, 'nextBlock');
function visit314_104_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['104'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['97'][1].init(50, 108, '(node = nextBlock.first(Walker.invisible(true))) && S.inArray(node.nodeName(), [\'ul\', \'ol\'])');
function visit313_97_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['97'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['96'][2].init(223, 29, 'nextBlock.nodeName() === \'li\'');
function visit312_96_2(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['96'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['96'][1].init(223, 159, 'nextBlock.nodeName() === \'li\' && (node = nextBlock.first(Walker.invisible(true))) && S.inArray(node.nodeName(), [\'ul\', \'ol\'])');
function visit311_96_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['96'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['92'][1].init(2168, 32, '!isStartOfBlock && !isEndOfBlock');
function visit310_92_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['92'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['81'][3].init(1722, 24, 'node.nodeName() === \'li\'');
function visit309_81_3(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['81'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['81'][2].init(1687, 59, '(node = previousBlock.parent()) && node.nodeName() === \'li\'');
function visit308_81_2(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['81'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['81'][1].init(1668, 78, 'previousBlock && (node = previousBlock.parent()) && node.nodeName() === \'li\'');
function visit307_81_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['81'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['76'][1].init(56, 24, 'node.nodeName() === \'li\'');
function visit306_76_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['76'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['74'][1].init(1423, 9, 'nextBlock');
function visit305_74_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['74'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['60'][1].init(1025, 10, '!splitInfo');
function visit304_60_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['60'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['43'][1].init(21, 28, 'editor.hasCommand(\'outdent\')');
function visit303_43_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['43'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['40'][3].init(55, 34, 'block.parent().nodeName() === \'li\'');
function visit302_40_3(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['40'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['40'][2].init(26, 25, 'block.nodeName() === \'li\'');
function visit301_40_2(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['40'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['40'][1].init(26, 63, 'block.nodeName() === \'li\' || block.parent().nodeName() === \'li\'');
function visit300_40_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['40'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['39'][1].init(135, 92, 'block && (block.nodeName() === \'li\' || block.parent().nodeName() === \'li\')');
function visit299_39_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['39'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['35'][1].init(214, 52, 'range.checkStartOfBlock() && range.checkEndOfBlock()');
function visit298_35_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['35'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['23'][1].init(201, 5, 'i > 0');
function visit297_23_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['23'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['15'][1].init(172, 16, 'S.UA.ieMode < 11');
function visit296_15_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['15'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].lineData[10]++;
KISSY.add(function(S, require) {
  _$jscoverage['/editor/enterKey.js'].functionData[0]++;
  _$jscoverage['/editor/enterKey.js'].lineData[11]++;
  var Node = require('node');
  _$jscoverage['/editor/enterKey.js'].lineData[12]++;
  var Walker = require('./walker');
  _$jscoverage['/editor/enterKey.js'].lineData[13]++;
  var Editor = require('./base');
  _$jscoverage['/editor/enterKey.js'].lineData[14]++;
  var ElementPath = require('./elementPath');
  _$jscoverage['/editor/enterKey.js'].lineData[15]++;
  var OLD_IE = visit296_15_1(S.UA.ieMode < 11);
  _$jscoverage['/editor/enterKey.js'].lineData[16]++;
  var headerTagRegex = /^h[1-6]$/, dtd = Editor.XHTML_DTD;
  _$jscoverage['/editor/enterKey.js'].lineData[19]++;
  function getRange(editor) {
    _$jscoverage['/editor/enterKey.js'].functionData[1]++;
    _$jscoverage['/editor/enterKey.js'].lineData[21]++;
    var ranges = editor.getSelection().getRanges();
    _$jscoverage['/editor/enterKey.js'].lineData[23]++;
    for (var i = ranges.length - 1; visit297_23_1(i > 0); i--) {
      _$jscoverage['/editor/enterKey.js'].lineData[24]++;
      ranges[i].deleteContents();
    }
    _$jscoverage['/editor/enterKey.js'].lineData[27]++;
    return ranges[0];
  }
  _$jscoverage['/editor/enterKey.js'].lineData[30]++;
  function enterBlock(editor) {
    _$jscoverage['/editor/enterKey.js'].functionData[2]++;
    _$jscoverage['/editor/enterKey.js'].lineData[32]++;
    var range = getRange(editor);
    _$jscoverage['/editor/enterKey.js'].lineData[33]++;
    var doc = range.document;
    _$jscoverage['/editor/enterKey.js'].lineData[35]++;
    if (visit298_35_1(range.checkStartOfBlock() && range.checkEndOfBlock())) {
      _$jscoverage['/editor/enterKey.js'].lineData[36]++;
      var path = new ElementPath(range.startContainer), block = path.block;
      _$jscoverage['/editor/enterKey.js'].lineData[39]++;
      if (visit299_39_1(block && (visit300_40_1(visit301_40_2(block.nodeName() === 'li') || visit302_40_3(block.parent().nodeName() === 'li'))))) {
        _$jscoverage['/editor/enterKey.js'].lineData[43]++;
        if (visit303_43_1(editor.hasCommand('outdent'))) {
          _$jscoverage['/editor/enterKey.js'].lineData[44]++;
          editor.execCommand('save');
          _$jscoverage['/editor/enterKey.js'].lineData[45]++;
          editor.execCommand('outdent');
          _$jscoverage['/editor/enterKey.js'].lineData[46]++;
          editor.execCommand('save');
          _$jscoverage['/editor/enterKey.js'].lineData[47]++;
          return true;
        } else {
          _$jscoverage['/editor/enterKey.js'].lineData[49]++;
          return false;
        }
      }
    }
    _$jscoverage['/editor/enterKey.js'].lineData[55]++;
    var blockTag = 'p';
    _$jscoverage['/editor/enterKey.js'].lineData[58]++;
    var splitInfo = range.splitBlock(blockTag);
    _$jscoverage['/editor/enterKey.js'].lineData[60]++;
    if (visit304_60_1(!splitInfo)) {
      _$jscoverage['/editor/enterKey.js'].lineData[61]++;
      return true;
    }
    _$jscoverage['/editor/enterKey.js'].lineData[65]++;
    var previousBlock = splitInfo.previousBlock, nextBlock = splitInfo.nextBlock;
    _$jscoverage['/editor/enterKey.js'].lineData[68]++;
    var isStartOfBlock = splitInfo.wasStartOfBlock, isEndOfBlock = splitInfo.wasEndOfBlock;
    _$jscoverage['/editor/enterKey.js'].lineData[71]++;
    var node;
    _$jscoverage['/editor/enterKey.js'].lineData[74]++;
    if (visit305_74_1(nextBlock)) {
      _$jscoverage['/editor/enterKey.js'].lineData[75]++;
      node = nextBlock.parent();
      _$jscoverage['/editor/enterKey.js'].lineData[76]++;
      if (visit306_76_1(node.nodeName() === 'li')) {
        _$jscoverage['/editor/enterKey.js'].lineData[77]++;
        nextBlock._4eBreakParent(node);
        _$jscoverage['/editor/enterKey.js'].lineData[78]++;
        nextBlock._4eMove(nextBlock.next(), true);
      }
    } else {
      _$jscoverage['/editor/enterKey.js'].lineData[81]++;
      if (visit307_81_1(previousBlock && visit308_81_2((node = previousBlock.parent()) && visit309_81_3(node.nodeName() === 'li')))) {
        _$jscoverage['/editor/enterKey.js'].lineData[82]++;
        previousBlock._4eBreakParent(node);
        _$jscoverage['/editor/enterKey.js'].lineData[83]++;
        range.moveToElementEditablePosition(previousBlock.next());
        _$jscoverage['/editor/enterKey.js'].lineData[84]++;
        previousBlock._4eMove(previousBlock.prev());
      }
    }
    _$jscoverage['/editor/enterKey.js'].lineData[87]++;
    var newBlock;
    _$jscoverage['/editor/enterKey.js'].lineData[92]++;
    if (visit310_92_1(!isStartOfBlock && !isEndOfBlock)) {
      _$jscoverage['/editor/enterKey.js'].lineData[96]++;
      if (visit311_96_1(visit312_96_2(nextBlock.nodeName() === 'li') && visit313_97_1((node = nextBlock.first(Walker.invisible(true))) && S.inArray(node.nodeName(), ['ul', 'ol'])))) {
        _$jscoverage['/editor/enterKey.js'].lineData[99]++;
        (OLD_IE ? new Node(doc.createTextNode('\xa0')) : new Node(doc.createElement('br'))).insertBefore(node);
      }
      _$jscoverage['/editor/enterKey.js'].lineData[104]++;
      if (visit314_104_1(nextBlock)) {
        _$jscoverage['/editor/enterKey.js'].lineData[105]++;
        range.moveToElementEditablePosition(nextBlock);
      }
    } else {
      _$jscoverage['/editor/enterKey.js'].lineData[111]++;
      if (visit315_111_1(previousBlock)) {
        _$jscoverage['/editor/enterKey.js'].lineData[115]++;
        if (visit316_115_1(visit317_115_2(previousBlock.nodeName() === 'li') || !headerTagRegex.test(previousBlock.nodeName()))) {
          _$jscoverage['/editor/enterKey.js'].lineData[117]++;
          newBlock = previousBlock.clone();
        }
      } else {
        _$jscoverage['/editor/enterKey.js'].lineData[120]++;
        if (visit318_120_1(nextBlock)) {
          _$jscoverage['/editor/enterKey.js'].lineData[121]++;
          newBlock = nextBlock.clone();
        }
      }
      _$jscoverage['/editor/enterKey.js'].lineData[124]++;
      if (visit319_124_1(!newBlock)) {
        _$jscoverage['/editor/enterKey.js'].lineData[125]++;
        newBlock = new Node('<' + blockTag + '>', null, doc);
      }
      _$jscoverage['/editor/enterKey.js'].lineData[131]++;
      var elementPath = splitInfo.elementPath;
      _$jscoverage['/editor/enterKey.js'].lineData[132]++;
      if (visit320_132_1(elementPath)) {
        _$jscoverage['/editor/enterKey.js'].lineData[133]++;
        for (var i = 0, len = elementPath.elements.length; visit321_133_1(i < len); i++) {
          _$jscoverage['/editor/enterKey.js'].lineData[134]++;
          var element = elementPath.elements[i];
          _$jscoverage['/editor/enterKey.js'].lineData[136]++;
          if (visit322_136_1(element.equals(elementPath.block) || element.equals(elementPath.blockLimit))) {
            _$jscoverage['/editor/enterKey.js'].lineData[138]++;
            break;
          }
          _$jscoverage['/editor/enterKey.js'].lineData[141]++;
          if (visit323_141_1(dtd.$removeEmpty[element.nodeName()])) {
            _$jscoverage['/editor/enterKey.js'].lineData[142]++;
            element = element.clone();
            _$jscoverage['/editor/enterKey.js'].lineData[143]++;
            newBlock._4eMoveChildren(element);
            _$jscoverage['/editor/enterKey.js'].lineData[144]++;
            newBlock.append(element);
          }
        }
      }
      _$jscoverage['/editor/enterKey.js'].lineData[149]++;
      if (visit324_149_1(!OLD_IE)) {
        _$jscoverage['/editor/enterKey.js'].lineData[150]++;
        newBlock._4eAppendBogus();
      }
      _$jscoverage['/editor/enterKey.js'].lineData[153]++;
      range.insertNode(newBlock);
      _$jscoverage['/editor/enterKey.js'].lineData[160]++;
      if (visit325_160_1(OLD_IE && visit326_160_2(isStartOfBlock && (visit327_160_3(!isEndOfBlock || !previousBlock[0].childNodes.length))))) {
        _$jscoverage['/editor/enterKey.js'].lineData[162]++;
        range.moveToElementEditablePosition(isEndOfBlock ? previousBlock : newBlock);
        _$jscoverage['/editor/enterKey.js'].lineData[163]++;
        range.select();
      }
      _$jscoverage['/editor/enterKey.js'].lineData[167]++;
      range.moveToElementEditablePosition(visit328_167_1(isStartOfBlock && !isEndOfBlock) ? nextBlock : newBlock);
    }
    _$jscoverage['/editor/enterKey.js'].lineData[170]++;
    if (visit329_170_1(!OLD_IE)) {
      _$jscoverage['/editor/enterKey.js'].lineData[171]++;
      if (visit330_171_1(nextBlock)) {
        _$jscoverage['/editor/enterKey.js'].lineData[174]++;
        var tmpNode = new Node(doc.createElement('span'));
        _$jscoverage['/editor/enterKey.js'].lineData[177]++;
        tmpNode.html('&nbsp;');
        _$jscoverage['/editor/enterKey.js'].lineData[179]++;
        range.insertNode(tmpNode);
        _$jscoverage['/editor/enterKey.js'].lineData[180]++;
        tmpNode.scrollIntoView(undefined, {
  alignWithTop: false, 
  allowHorizontalScroll: true, 
  onlyScrollIfNeeded: true});
        _$jscoverage['/editor/enterKey.js'].lineData[185]++;
        range.deleteContents();
      } else {
        _$jscoverage['/editor/enterKey.js'].lineData[190]++;
        newBlock.scrollIntoView(undefined, {
  alignWithTop: false, 
  allowHorizontalScroll: true, 
  onlyScrollIfNeeded: true});
      }
    }
    _$jscoverage['/editor/enterKey.js'].lineData[197]++;
    range.select();
    _$jscoverage['/editor/enterKey.js'].lineData[198]++;
    return true;
  }
  _$jscoverage['/editor/enterKey.js'].lineData[201]++;
  function enterKey(editor) {
    _$jscoverage['/editor/enterKey.js'].functionData[3]++;
    _$jscoverage['/editor/enterKey.js'].lineData[202]++;
    var doc = editor.get('document');
    _$jscoverage['/editor/enterKey.js'].lineData[203]++;
    doc.on('keydown', function(ev) {
  _$jscoverage['/editor/enterKey.js'].functionData[4]++;
  _$jscoverage['/editor/enterKey.js'].lineData[204]++;
  var keyCode = ev.keyCode;
  _$jscoverage['/editor/enterKey.js'].lineData[205]++;
  if (visit331_205_1(keyCode === 13)) {
    _$jscoverage['/editor/enterKey.js'].lineData[206]++;
    if (visit332_206_1(!(visit333_206_2(ev.shiftKey || visit334_206_3(ev.ctrlKey || ev.metaKey))))) {
      _$jscoverage['/editor/enterKey.js'].lineData[207]++;
      editor.execCommand('save');
      _$jscoverage['/editor/enterKey.js'].lineData[208]++;
      var re = editor.execCommand('enterBlock');
      _$jscoverage['/editor/enterKey.js'].lineData[209]++;
      editor.execCommand('save');
      _$jscoverage['/editor/enterKey.js'].lineData[210]++;
      if (visit335_210_1(re !== false)) {
        _$jscoverage['/editor/enterKey.js'].lineData[211]++;
        ev.preventDefault();
      }
    }
  }
});
  }
  _$jscoverage['/editor/enterKey.js'].lineData[218]++;
  return {
  init: function(editor) {
  _$jscoverage['/editor/enterKey.js'].functionData[5]++;
  _$jscoverage['/editor/enterKey.js'].lineData[220]++;
  editor.addCommand('enterBlock', {
  exec: enterBlock});
  _$jscoverage['/editor/enterKey.js'].lineData[223]++;
  editor.docReady(function() {
  _$jscoverage['/editor/enterKey.js'].functionData[6]++;
  _$jscoverage['/editor/enterKey.js'].lineData[224]++;
  enterKey(editor);
});
}};
});
