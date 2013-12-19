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
if (! _$jscoverage['/base/data.js']) {
  _$jscoverage['/base/data.js'] = {};
  _$jscoverage['/base/data.js'].lineData = [];
  _$jscoverage['/base/data.js'].lineData[6] = 0;
  _$jscoverage['/base/data.js'].lineData[9] = 0;
  _$jscoverage['/base/data.js'].lineData[10] = 0;
  _$jscoverage['/base/data.js'].lineData[21] = 0;
  _$jscoverage['/base/data.js'].lineData[23] = 0;
  _$jscoverage['/base/data.js'].lineData[24] = 0;
  _$jscoverage['/base/data.js'].lineData[25] = 0;
  _$jscoverage['/base/data.js'].lineData[26] = 0;
  _$jscoverage['/base/data.js'].lineData[28] = 0;
  _$jscoverage['/base/data.js'].lineData[29] = 0;
  _$jscoverage['/base/data.js'].lineData[32] = 0;
  _$jscoverage['/base/data.js'].lineData[36] = 0;
  _$jscoverage['/base/data.js'].lineData[39] = 0;
  _$jscoverage['/base/data.js'].lineData[40] = 0;
  _$jscoverage['/base/data.js'].lineData[43] = 0;
  _$jscoverage['/base/data.js'].lineData[44] = 0;
  _$jscoverage['/base/data.js'].lineData[48] = 0;
  _$jscoverage['/base/data.js'].lineData[49] = 0;
  _$jscoverage['/base/data.js'].lineData[51] = 0;
  _$jscoverage['/base/data.js'].lineData[52] = 0;
  _$jscoverage['/base/data.js'].lineData[53] = 0;
  _$jscoverage['/base/data.js'].lineData[54] = 0;
  _$jscoverage['/base/data.js'].lineData[56] = 0;
  _$jscoverage['/base/data.js'].lineData[57] = 0;
  _$jscoverage['/base/data.js'].lineData[59] = 0;
  _$jscoverage['/base/data.js'].lineData[60] = 0;
  _$jscoverage['/base/data.js'].lineData[65] = 0;
  _$jscoverage['/base/data.js'].lineData[66] = 0;
  _$jscoverage['/base/data.js'].lineData[68] = 0;
  _$jscoverage['/base/data.js'].lineData[69] = 0;
  _$jscoverage['/base/data.js'].lineData[70] = 0;
  _$jscoverage['/base/data.js'].lineData[71] = 0;
  _$jscoverage['/base/data.js'].lineData[72] = 0;
  _$jscoverage['/base/data.js'].lineData[75] = 0;
  _$jscoverage['/base/data.js'].lineData[78] = 0;
  _$jscoverage['/base/data.js'].lineData[80] = 0;
  _$jscoverage['/base/data.js'].lineData[86] = 0;
  _$jscoverage['/base/data.js'].lineData[88] = 0;
  _$jscoverage['/base/data.js'].lineData[89] = 0;
  _$jscoverage['/base/data.js'].lineData[90] = 0;
  _$jscoverage['/base/data.js'].lineData[92] = 0;
  _$jscoverage['/base/data.js'].lineData[93] = 0;
  _$jscoverage['/base/data.js'].lineData[97] = 0;
  _$jscoverage['/base/data.js'].lineData[98] = 0;
  _$jscoverage['/base/data.js'].lineData[100] = 0;
  _$jscoverage['/base/data.js'].lineData[101] = 0;
  _$jscoverage['/base/data.js'].lineData[103] = 0;
  _$jscoverage['/base/data.js'].lineData[105] = 0;
  _$jscoverage['/base/data.js'].lineData[108] = 0;
  _$jscoverage['/base/data.js'].lineData[110] = 0;
  _$jscoverage['/base/data.js'].lineData[111] = 0;
  _$jscoverage['/base/data.js'].lineData[113] = 0;
  _$jscoverage['/base/data.js'].lineData[114] = 0;
  _$jscoverage['/base/data.js'].lineData[116] = 0;
  _$jscoverage['/base/data.js'].lineData[117] = 0;
  _$jscoverage['/base/data.js'].lineData[120] = 0;
  _$jscoverage['/base/data.js'].lineData[121] = 0;
  _$jscoverage['/base/data.js'].lineData[127] = 0;
  _$jscoverage['/base/data.js'].lineData[128] = 0;
  _$jscoverage['/base/data.js'].lineData[129] = 0;
  _$jscoverage['/base/data.js'].lineData[131] = 0;
  _$jscoverage['/base/data.js'].lineData[132] = 0;
  _$jscoverage['/base/data.js'].lineData[133] = 0;
  _$jscoverage['/base/data.js'].lineData[134] = 0;
  _$jscoverage['/base/data.js'].lineData[135] = 0;
  _$jscoverage['/base/data.js'].lineData[138] = 0;
  _$jscoverage['/base/data.js'].lineData[139] = 0;
  _$jscoverage['/base/data.js'].lineData[140] = 0;
  _$jscoverage['/base/data.js'].lineData[142] = 0;
  _$jscoverage['/base/data.js'].lineData[144] = 0;
  _$jscoverage['/base/data.js'].lineData[145] = 0;
  _$jscoverage['/base/data.js'].lineData[151] = 0;
  _$jscoverage['/base/data.js'].lineData[168] = 0;
  _$jscoverage['/base/data.js'].lineData[170] = 0;
  _$jscoverage['/base/data.js'].lineData[171] = 0;
  _$jscoverage['/base/data.js'].lineData[172] = 0;
  _$jscoverage['/base/data.js'].lineData[173] = 0;
  _$jscoverage['/base/data.js'].lineData[176] = 0;
  _$jscoverage['/base/data.js'].lineData[178] = 0;
  _$jscoverage['/base/data.js'].lineData[179] = 0;
  _$jscoverage['/base/data.js'].lineData[182] = 0;
  _$jscoverage['/base/data.js'].lineData[197] = 0;
  _$jscoverage['/base/data.js'].lineData[200] = 0;
  _$jscoverage['/base/data.js'].lineData[201] = 0;
  _$jscoverage['/base/data.js'].lineData[202] = 0;
  _$jscoverage['/base/data.js'].lineData[204] = 0;
  _$jscoverage['/base/data.js'].lineData[208] = 0;
  _$jscoverage['/base/data.js'].lineData[209] = 0;
  _$jscoverage['/base/data.js'].lineData[210] = 0;
  _$jscoverage['/base/data.js'].lineData[211] = 0;
  _$jscoverage['/base/data.js'].lineData[214] = 0;
  _$jscoverage['/base/data.js'].lineData[218] = 0;
  _$jscoverage['/base/data.js'].lineData[219] = 0;
  _$jscoverage['/base/data.js'].lineData[220] = 0;
  _$jscoverage['/base/data.js'].lineData[221] = 0;
  _$jscoverage['/base/data.js'].lineData[224] = 0;
  _$jscoverage['/base/data.js'].lineData[228] = 0;
  _$jscoverage['/base/data.js'].lineData[239] = 0;
  _$jscoverage['/base/data.js'].lineData[240] = 0;
  _$jscoverage['/base/data.js'].lineData[241] = 0;
  _$jscoverage['/base/data.js'].lineData[242] = 0;
  _$jscoverage['/base/data.js'].lineData[243] = 0;
  _$jscoverage['/base/data.js'].lineData[246] = 0;
  _$jscoverage['/base/data.js'].lineData[256] = 0;
  _$jscoverage['/base/data.js'].lineData[257] = 0;
  _$jscoverage['/base/data.js'].lineData[258] = 0;
  _$jscoverage['/base/data.js'].lineData[259] = 0;
  _$jscoverage['/base/data.js'].lineData[260] = 0;
  _$jscoverage['/base/data.js'].lineData[261] = 0;
  _$jscoverage['/base/data.js'].lineData[262] = 0;
  _$jscoverage['/base/data.js'].lineData[263] = 0;
  _$jscoverage['/base/data.js'].lineData[264] = 0;
  _$jscoverage['/base/data.js'].lineData[266] = 0;
  _$jscoverage['/base/data.js'].lineData[267] = 0;
  _$jscoverage['/base/data.js'].lineData[271] = 0;
  _$jscoverage['/base/data.js'].lineData[277] = 0;
}
if (! _$jscoverage['/base/data.js'].functionData) {
  _$jscoverage['/base/data.js'].functionData = [];
  _$jscoverage['/base/data.js'].functionData[0] = 0;
  _$jscoverage['/base/data.js'].functionData[1] = 0;
  _$jscoverage['/base/data.js'].functionData[2] = 0;
  _$jscoverage['/base/data.js'].functionData[3] = 0;
  _$jscoverage['/base/data.js'].functionData[4] = 0;
  _$jscoverage['/base/data.js'].functionData[5] = 0;
  _$jscoverage['/base/data.js'].functionData[6] = 0;
  _$jscoverage['/base/data.js'].functionData[7] = 0;
  _$jscoverage['/base/data.js'].functionData[8] = 0;
  _$jscoverage['/base/data.js'].functionData[9] = 0;
  _$jscoverage['/base/data.js'].functionData[10] = 0;
  _$jscoverage['/base/data.js'].functionData[11] = 0;
}
if (! _$jscoverage['/base/data.js'].branchData) {
  _$jscoverage['/base/data.js'].branchData = {};
  _$jscoverage['/base/data.js'].branchData['23'] = [];
  _$jscoverage['/base/data.js'].branchData['23'][1] = new BranchData();
  _$jscoverage['/base/data.js'].branchData['24'] = [];
  _$jscoverage['/base/data.js'].branchData['24'][1] = new BranchData();
  _$jscoverage['/base/data.js'].branchData['25'] = [];
  _$jscoverage['/base/data.js'].branchData['25'][1] = new BranchData();
  _$jscoverage['/base/data.js'].branchData['28'] = [];
  _$jscoverage['/base/data.js'].branchData['28'][1] = new BranchData();
  _$jscoverage['/base/data.js'].branchData['39'] = [];
  _$jscoverage['/base/data.js'].branchData['39'][1] = new BranchData();
  _$jscoverage['/base/data.js'].branchData['48'] = [];
  _$jscoverage['/base/data.js'].branchData['48'][1] = new BranchData();
  _$jscoverage['/base/data.js'].branchData['52'] = [];
  _$jscoverage['/base/data.js'].branchData['52'][1] = new BranchData();
  _$jscoverage['/base/data.js'].branchData['53'] = [];
  _$jscoverage['/base/data.js'].branchData['53'][1] = new BranchData();
  _$jscoverage['/base/data.js'].branchData['56'] = [];
  _$jscoverage['/base/data.js'].branchData['56'][1] = new BranchData();
  _$jscoverage['/base/data.js'].branchData['57'] = [];
  _$jscoverage['/base/data.js'].branchData['57'][1] = new BranchData();
  _$jscoverage['/base/data.js'].branchData['59'] = [];
  _$jscoverage['/base/data.js'].branchData['59'][1] = new BranchData();
  _$jscoverage['/base/data.js'].branchData['65'] = [];
  _$jscoverage['/base/data.js'].branchData['65'][1] = new BranchData();
  _$jscoverage['/base/data.js'].branchData['69'] = [];
  _$jscoverage['/base/data.js'].branchData['69'][1] = new BranchData();
  _$jscoverage['/base/data.js'].branchData['71'] = [];
  _$jscoverage['/base/data.js'].branchData['71'][1] = new BranchData();
  _$jscoverage['/base/data.js'].branchData['89'] = [];
  _$jscoverage['/base/data.js'].branchData['89'][1] = new BranchData();
  _$jscoverage['/base/data.js'].branchData['97'] = [];
  _$jscoverage['/base/data.js'].branchData['97'][1] = new BranchData();
  _$jscoverage['/base/data.js'].branchData['101'] = [];
  _$jscoverage['/base/data.js'].branchData['101'][1] = new BranchData();
  _$jscoverage['/base/data.js'].branchData['103'] = [];
  _$jscoverage['/base/data.js'].branchData['103'][1] = new BranchData();
  _$jscoverage['/base/data.js'].branchData['103'][2] = new BranchData();
  _$jscoverage['/base/data.js'].branchData['104'] = [];
  _$jscoverage['/base/data.js'].branchData['104'][1] = new BranchData();
  _$jscoverage['/base/data.js'].branchData['111'] = [];
  _$jscoverage['/base/data.js'].branchData['111'][1] = new BranchData();
  _$jscoverage['/base/data.js'].branchData['113'] = [];
  _$jscoverage['/base/data.js'].branchData['113'][1] = new BranchData();
  _$jscoverage['/base/data.js'].branchData['116'] = [];
  _$jscoverage['/base/data.js'].branchData['116'][1] = new BranchData();
  _$jscoverage['/base/data.js'].branchData['117'] = [];
  _$jscoverage['/base/data.js'].branchData['117'][1] = new BranchData();
  _$jscoverage['/base/data.js'].branchData['120'] = [];
  _$jscoverage['/base/data.js'].branchData['120'][1] = new BranchData();
  _$jscoverage['/base/data.js'].branchData['128'] = [];
  _$jscoverage['/base/data.js'].branchData['128'][1] = new BranchData();
  _$jscoverage['/base/data.js'].branchData['132'] = [];
  _$jscoverage['/base/data.js'].branchData['132'][1] = new BranchData();
  _$jscoverage['/base/data.js'].branchData['134'] = [];
  _$jscoverage['/base/data.js'].branchData['134'][1] = new BranchData();
  _$jscoverage['/base/data.js'].branchData['144'] = [];
  _$jscoverage['/base/data.js'].branchData['144'][1] = new BranchData();
  _$jscoverage['/base/data.js'].branchData['170'] = [];
  _$jscoverage['/base/data.js'].branchData['170'][1] = new BranchData();
  _$jscoverage['/base/data.js'].branchData['172'] = [];
  _$jscoverage['/base/data.js'].branchData['172'][1] = new BranchData();
  _$jscoverage['/base/data.js'].branchData['178'] = [];
  _$jscoverage['/base/data.js'].branchData['178'][1] = new BranchData();
  _$jscoverage['/base/data.js'].branchData['200'] = [];
  _$jscoverage['/base/data.js'].branchData['200'][1] = new BranchData();
  _$jscoverage['/base/data.js'].branchData['208'] = [];
  _$jscoverage['/base/data.js'].branchData['208'][1] = new BranchData();
  _$jscoverage['/base/data.js'].branchData['209'] = [];
  _$jscoverage['/base/data.js'].branchData['209'][1] = new BranchData();
  _$jscoverage['/base/data.js'].branchData['210'] = [];
  _$jscoverage['/base/data.js'].branchData['210'][1] = new BranchData();
  _$jscoverage['/base/data.js'].branchData['218'] = [];
  _$jscoverage['/base/data.js'].branchData['218'][1] = new BranchData();
  _$jscoverage['/base/data.js'].branchData['220'] = [];
  _$jscoverage['/base/data.js'].branchData['220'][1] = new BranchData();
  _$jscoverage['/base/data.js'].branchData['240'] = [];
  _$jscoverage['/base/data.js'].branchData['240'][1] = new BranchData();
  _$jscoverage['/base/data.js'].branchData['242'] = [];
  _$jscoverage['/base/data.js'].branchData['242'][1] = new BranchData();
  _$jscoverage['/base/data.js'].branchData['258'] = [];
  _$jscoverage['/base/data.js'].branchData['258'][1] = new BranchData();
  _$jscoverage['/base/data.js'].branchData['260'] = [];
  _$jscoverage['/base/data.js'].branchData['260'][1] = new BranchData();
  _$jscoverage['/base/data.js'].branchData['261'] = [];
  _$jscoverage['/base/data.js'].branchData['261'][1] = new BranchData();
  _$jscoverage['/base/data.js'].branchData['261'][2] = new BranchData();
  _$jscoverage['/base/data.js'].branchData['263'] = [];
  _$jscoverage['/base/data.js'].branchData['263'][1] = new BranchData();
  _$jscoverage['/base/data.js'].branchData['266'] = [];
  _$jscoverage['/base/data.js'].branchData['266'][1] = new BranchData();
}
_$jscoverage['/base/data.js'].branchData['266'][1].init(349, 8, 'DOMEvent');
function visit228_266_1(result) {
  _$jscoverage['/base/data.js'].branchData['266'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/data.js'].branchData['263'][1].init(216, 7, 'j < len');
function visit227_263_1(result) {
  _$jscoverage['/base/data.js'].branchData['263'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/data.js'].branchData['261'][2].init(43, 51, 'deep && S.makeArray(elem.getElementsByTagName(\'*\'))');
function visit226_261_2(result) {
  _$jscoverage['/base/data.js'].branchData['261'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/data.js'].branchData['261'][1].init(43, 57, 'deep && S.makeArray(elem.getElementsByTagName(\'*\')) || []');
function visit225_261_1(result) {
  _$jscoverage['/base/data.js'].branchData['261'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/data.js'].branchData['260'][1].init(60, 13, 'elem.nodeType');
function visit224_260_1(result) {
  _$jscoverage['/base/data.js'].branchData['260'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/data.js'].branchData['258'][1].init(153, 6, 'i >= 0');
function visit223_258_1(result) {
  _$jscoverage['/base/data.js'].branchData['258'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/data.js'].branchData['242'][1].init(60, 13, 'elem.nodeType');
function visit222_242_1(result) {
  _$jscoverage['/base/data.js'].branchData['242'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/data.js'].branchData['240'][1].init(98, 6, 'i >= 0');
function visit221_240_1(result) {
  _$jscoverage['/base/data.js'].branchData['240'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/data.js'].branchData['220'][1].init(70, 13, 'elem.nodeType');
function visit220_220_1(result) {
  _$jscoverage['/base/data.js'].branchData['220'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/data.js'].branchData['218'][1].init(52, 6, 'i >= 0');
function visit219_218_1(result) {
  _$jscoverage['/base/data.js'].branchData['218'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/data.js'].branchData['210'][1].init(29, 13, 'elem.nodeType');
function visit218_210_1(result) {
  _$jscoverage['/base/data.js'].branchData['210'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/data.js'].branchData['209'][1].init(25, 4, 'elem');
function visit217_209_1(result) {
  _$jscoverage['/base/data.js'].branchData['209'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/data.js'].branchData['208'][1].init(366, 18, 'data === undefined');
function visit216_208_1(result) {
  _$jscoverage['/base/data.js'].branchData['208'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/data.js'].branchData['200'][1].init(121, 21, 'S.isPlainObject(name)');
function visit215_200_1(result) {
  _$jscoverage['/base/data.js'].branchData['200'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/data.js'].branchData['178'][1].init(311, 3, 'ret');
function visit214_178_1(result) {
  _$jscoverage['/base/data.js'].branchData['178'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/data.js'].branchData['172'][1].init(66, 13, 'elem.nodeType');
function visit213_172_1(result) {
  _$jscoverage['/base/data.js'].branchData['172'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/data.js'].branchData['170'][1].init(115, 16, 'i < elems.length');
function visit212_170_1(result) {
  _$jscoverage['/base/data.js'].branchData['170'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/data.js'].branchData['144'][1].init(219, 20, 'elem.removeAttribute');
function visit211_144_1(result) {
  _$jscoverage['/base/data.js'].branchData['144'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/data.js'].branchData['134'][1].init(57, 22, 'S.isEmptyObject(cache)');
function visit210_134_1(result) {
  _$jscoverage['/base/data.js'].branchData['134'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/data.js'].branchData['132'][1].init(159, 18, 'name !== undefined');
function visit209_132_1(result) {
  _$jscoverage['/base/data.js'].branchData['132'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/data.js'].branchData['128'][1].init(61, 4, '!key');
function visit208_128_1(result) {
  _$jscoverage['/base/data.js'].branchData['128'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/data.js'].branchData['120'][1].init(74, 20, 'dataCache[key] || {}');
function visit207_120_1(result) {
  _$jscoverage['/base/data.js'].branchData['120'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/data.js'].branchData['117'][1].init(28, 20, 'cache && cache[name]');
function visit206_117_1(result) {
  _$jscoverage['/base/data.js'].branchData['117'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/data.js'].branchData['116'][1].init(21, 18, 'name !== undefined');
function visit205_116_1(result) {
  _$jscoverage['/base/data.js'].branchData['116'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/data.js'].branchData['113'][1].init(66, 20, 'dataCache[key] || {}');
function visit204_113_1(result) {
  _$jscoverage['/base/data.js'].branchData['113'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/data.js'].branchData['111'][1].init(485, 19, 'value !== undefined');
function visit203_111_1(result) {
  _$jscoverage['/base/data.js'].branchData['111'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/data.js'].branchData['104'][1].init(41, 19, 'value === undefined');
function visit202_104_1(result) {
  _$jscoverage['/base/data.js'].branchData['104'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/data.js'].branchData['103'][2].init(49, 18, 'name !== undefined');
function visit201_103_2(result) {
  _$jscoverage['/base/data.js'].branchData['103'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/data.js'].branchData['103'][1].init(49, 61, 'name !== undefined && value === undefined');
function visit200_103_1(result) {
  _$jscoverage['/base/data.js'].branchData['103'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/data.js'].branchData['101'][1].init(164, 4, '!key');
function visit199_101_1(result) {
  _$jscoverage['/base/data.js'].branchData['101'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/data.js'].branchData['97'][1].init(17, 35, 'noData[elem.nodeName.toLowerCase()]');
function visit198_97_1(result) {
  _$jscoverage['/base/data.js'].branchData['97'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/data.js'].branchData['89'][1].init(54, 4, '!key');
function visit197_89_1(result) {
  _$jscoverage['/base/data.js'].branchData['89'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/data.js'].branchData['71'][1].init(57, 22, 'S.isEmptyObject(cache)');
function visit196_71_1(result) {
  _$jscoverage['/base/data.js'].branchData['71'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/data.js'].branchData['69'][1].init(162, 18, 'name !== undefined');
function visit195_69_1(result) {
  _$jscoverage['/base/data.js'].branchData['69'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/data.js'].branchData['65'][1].init(17, 9, 'ob == win');
function visit194_65_1(result) {
  _$jscoverage['/base/data.js'].branchData['65'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/data.js'].branchData['59'][1].init(43, 17, 'ob[EXPANDO] || {}');
function visit193_59_1(result) {
  _$jscoverage['/base/data.js'].branchData['59'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/data.js'].branchData['57'][1].init(28, 20, 'cache && cache[name]');
function visit192_57_1(result) {
  _$jscoverage['/base/data.js'].branchData['57'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/data.js'].branchData['56'][1].init(21, 18, 'name !== undefined');
function visit191_56_1(result) {
  _$jscoverage['/base/data.js'].branchData['56'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/data.js'].branchData['53'][1].init(39, 17, 'ob[EXPANDO] || {}');
function visit190_53_1(result) {
  _$jscoverage['/base/data.js'].branchData['53'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/data.js'].branchData['52'][1].init(163, 19, 'value !== undefined');
function visit189_52_1(result) {
  _$jscoverage['/base/data.js'].branchData['52'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/data.js'].branchData['48'][1].init(17, 9, 'ob == win');
function visit188_48_1(result) {
  _$jscoverage['/base/data.js'].branchData['48'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/data.js'].branchData['39'][1].init(61, 9, 'ob == win');
function visit187_39_1(result) {
  _$jscoverage['/base/data.js'].branchData['39'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/data.js'].branchData['28'][1].init(171, 23, '!S.isEmptyObject(cache)');
function visit186_28_1(result) {
  _$jscoverage['/base/data.js'].branchData['28'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/data.js'].branchData['25'][1].init(25, 13, 'name in cache');
function visit185_25_1(result) {
  _$jscoverage['/base/data.js'].branchData['25'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/data.js'].branchData['24'][1].init(21, 18, 'name !== undefined');
function visit184_24_1(result) {
  _$jscoverage['/base/data.js'].branchData['24'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/data.js'].branchData['23'][1].init(17, 5, 'cache');
function visit183_23_1(result) {
  _$jscoverage['/base/data.js'].branchData['23'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/data.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/base/data.js'].functionData[0]++;
  _$jscoverage['/base/data.js'].lineData[9]++;
  var Dom = require('./api');
  _$jscoverage['/base/data.js'].lineData[10]++;
  var win = S.Env.host, EXPANDO = '_ks_data_' + S.now(), dataCache = {}, winDataCache = {}, noData = {
  applet: 1, 
  object: 1, 
  embed: 1};
  _$jscoverage['/base/data.js'].lineData[21]++;
  var commonOps = {
  hasData: function(cache, name) {
  _$jscoverage['/base/data.js'].functionData[1]++;
  _$jscoverage['/base/data.js'].lineData[23]++;
  if (visit183_23_1(cache)) {
    _$jscoverage['/base/data.js'].lineData[24]++;
    if (visit184_24_1(name !== undefined)) {
      _$jscoverage['/base/data.js'].lineData[25]++;
      if (visit185_25_1(name in cache)) {
        _$jscoverage['/base/data.js'].lineData[26]++;
        return true;
      }
    } else {
      _$jscoverage['/base/data.js'].lineData[28]++;
      if (visit186_28_1(!S.isEmptyObject(cache))) {
        _$jscoverage['/base/data.js'].lineData[29]++;
        return true;
      }
    }
  }
  _$jscoverage['/base/data.js'].lineData[32]++;
  return false;
}};
  _$jscoverage['/base/data.js'].lineData[36]++;
  var objectOps = {
  hasData: function(ob, name) {
  _$jscoverage['/base/data.js'].functionData[2]++;
  _$jscoverage['/base/data.js'].lineData[39]++;
  if (visit187_39_1(ob == win)) {
    _$jscoverage['/base/data.js'].lineData[40]++;
    return objectOps.hasData(winDataCache, name);
  }
  _$jscoverage['/base/data.js'].lineData[43]++;
  var thisCache = ob[EXPANDO];
  _$jscoverage['/base/data.js'].lineData[44]++;
  return commonOps.hasData(thisCache, name);
}, 
  data: function(ob, name, value) {
  _$jscoverage['/base/data.js'].functionData[3]++;
  _$jscoverage['/base/data.js'].lineData[48]++;
  if (visit188_48_1(ob == win)) {
    _$jscoverage['/base/data.js'].lineData[49]++;
    return objectOps.data(winDataCache, name, value);
  }
  _$jscoverage['/base/data.js'].lineData[51]++;
  var cache = ob[EXPANDO];
  _$jscoverage['/base/data.js'].lineData[52]++;
  if (visit189_52_1(value !== undefined)) {
    _$jscoverage['/base/data.js'].lineData[53]++;
    cache = ob[EXPANDO] = visit190_53_1(ob[EXPANDO] || {});
    _$jscoverage['/base/data.js'].lineData[54]++;
    cache[name] = value;
  } else {
    _$jscoverage['/base/data.js'].lineData[56]++;
    if (visit191_56_1(name !== undefined)) {
      _$jscoverage['/base/data.js'].lineData[57]++;
      return visit192_57_1(cache && cache[name]);
    } else {
      _$jscoverage['/base/data.js'].lineData[59]++;
      cache = ob[EXPANDO] = visit193_59_1(ob[EXPANDO] || {});
      _$jscoverage['/base/data.js'].lineData[60]++;
      return cache;
    }
  }
}, 
  removeData: function(ob, name) {
  _$jscoverage['/base/data.js'].functionData[4]++;
  _$jscoverage['/base/data.js'].lineData[65]++;
  if (visit194_65_1(ob == win)) {
    _$jscoverage['/base/data.js'].lineData[66]++;
    return objectOps.removeData(winDataCache, name);
  }
  _$jscoverage['/base/data.js'].lineData[68]++;
  var cache = ob[EXPANDO];
  _$jscoverage['/base/data.js'].lineData[69]++;
  if (visit195_69_1(name !== undefined)) {
    _$jscoverage['/base/data.js'].lineData[70]++;
    delete cache[name];
    _$jscoverage['/base/data.js'].lineData[71]++;
    if (visit196_71_1(S.isEmptyObject(cache))) {
      _$jscoverage['/base/data.js'].lineData[72]++;
      objectOps.removeData(ob);
    }
  } else {
    _$jscoverage['/base/data.js'].lineData[75]++;
    try {
      _$jscoverage['/base/data.js'].lineData[78]++;
      delete ob[EXPANDO];
    }    catch (e) {
  _$jscoverage['/base/data.js'].lineData[80]++;
  ob[EXPANDO] = undefined;
}
  }
}};
  _$jscoverage['/base/data.js'].lineData[86]++;
  var domOps = {
  hasData: function(elem, name) {
  _$jscoverage['/base/data.js'].functionData[5]++;
  _$jscoverage['/base/data.js'].lineData[88]++;
  var key = elem[EXPANDO];
  _$jscoverage['/base/data.js'].lineData[89]++;
  if (visit197_89_1(!key)) {
    _$jscoverage['/base/data.js'].lineData[90]++;
    return false;
  }
  _$jscoverage['/base/data.js'].lineData[92]++;
  var thisCache = dataCache[key];
  _$jscoverage['/base/data.js'].lineData[93]++;
  return commonOps.hasData(thisCache, name);
}, 
  data: function(elem, name, value) {
  _$jscoverage['/base/data.js'].functionData[6]++;
  _$jscoverage['/base/data.js'].lineData[97]++;
  if (visit198_97_1(noData[elem.nodeName.toLowerCase()])) {
    _$jscoverage['/base/data.js'].lineData[98]++;
    return undefined;
  }
  _$jscoverage['/base/data.js'].lineData[100]++;
  var key = elem[EXPANDO], cache;
  _$jscoverage['/base/data.js'].lineData[101]++;
  if (visit199_101_1(!key)) {
    _$jscoverage['/base/data.js'].lineData[103]++;
    if (visit200_103_1(visit201_103_2(name !== undefined) && visit202_104_1(value === undefined))) {
      _$jscoverage['/base/data.js'].lineData[105]++;
      return undefined;
    }
    _$jscoverage['/base/data.js'].lineData[108]++;
    key = elem[EXPANDO] = S.guid();
  }
  _$jscoverage['/base/data.js'].lineData[110]++;
  cache = dataCache[key];
  _$jscoverage['/base/data.js'].lineData[111]++;
  if (visit203_111_1(value !== undefined)) {
    _$jscoverage['/base/data.js'].lineData[113]++;
    cache = dataCache[key] = visit204_113_1(dataCache[key] || {});
    _$jscoverage['/base/data.js'].lineData[114]++;
    cache[name] = value;
  } else {
    _$jscoverage['/base/data.js'].lineData[116]++;
    if (visit205_116_1(name !== undefined)) {
      _$jscoverage['/base/data.js'].lineData[117]++;
      return visit206_117_1(cache && cache[name]);
    } else {
      _$jscoverage['/base/data.js'].lineData[120]++;
      cache = dataCache[key] = visit207_120_1(dataCache[key] || {});
      _$jscoverage['/base/data.js'].lineData[121]++;
      return cache;
    }
  }
}, 
  removeData: function(elem, name) {
  _$jscoverage['/base/data.js'].functionData[7]++;
  _$jscoverage['/base/data.js'].lineData[127]++;
  var key = elem[EXPANDO], cache;
  _$jscoverage['/base/data.js'].lineData[128]++;
  if (visit208_128_1(!key)) {
    _$jscoverage['/base/data.js'].lineData[129]++;
    return;
  }
  _$jscoverage['/base/data.js'].lineData[131]++;
  cache = dataCache[key];
  _$jscoverage['/base/data.js'].lineData[132]++;
  if (visit209_132_1(name !== undefined)) {
    _$jscoverage['/base/data.js'].lineData[133]++;
    delete cache[name];
    _$jscoverage['/base/data.js'].lineData[134]++;
    if (visit210_134_1(S.isEmptyObject(cache))) {
      _$jscoverage['/base/data.js'].lineData[135]++;
      domOps.removeData(elem);
    }
  } else {
    _$jscoverage['/base/data.js'].lineData[138]++;
    delete dataCache[key];
    _$jscoverage['/base/data.js'].lineData[139]++;
    try {
      _$jscoverage['/base/data.js'].lineData[140]++;
      delete elem[EXPANDO];
    }    catch (e) {
  _$jscoverage['/base/data.js'].lineData[142]++;
  elem[EXPANDO] = undefined;
}
    _$jscoverage['/base/data.js'].lineData[144]++;
    if (visit211_144_1(elem.removeAttribute)) {
      _$jscoverage['/base/data.js'].lineData[145]++;
      elem.removeAttribute(EXPANDO);
    }
  }
}};
  _$jscoverage['/base/data.js'].lineData[151]++;
  S.mix(Dom, {
  __EXPANDO: EXPANDO, 
  hasData: function(selector, name) {
  _$jscoverage['/base/data.js'].functionData[8]++;
  _$jscoverage['/base/data.js'].lineData[168]++;
  var ret = false, elems = Dom.query(selector);
  _$jscoverage['/base/data.js'].lineData[170]++;
  for (var i = 0; visit212_170_1(i < elems.length); i++) {
    _$jscoverage['/base/data.js'].lineData[171]++;
    var elem = elems[i];
    _$jscoverage['/base/data.js'].lineData[172]++;
    if (visit213_172_1(elem.nodeType)) {
      _$jscoverage['/base/data.js'].lineData[173]++;
      ret = domOps.hasData(elem, name);
    } else {
      _$jscoverage['/base/data.js'].lineData[176]++;
      ret = objectOps.hasData(elem, name);
    }
    _$jscoverage['/base/data.js'].lineData[178]++;
    if (visit214_178_1(ret)) {
      _$jscoverage['/base/data.js'].lineData[179]++;
      return ret;
    }
  }
  _$jscoverage['/base/data.js'].lineData[182]++;
  return ret;
}, 
  data: function(selector, name, data) {
  _$jscoverage['/base/data.js'].functionData[9]++;
  _$jscoverage['/base/data.js'].lineData[197]++;
  var elems = Dom.query(selector), elem = elems[0];
  _$jscoverage['/base/data.js'].lineData[200]++;
  if (visit215_200_1(S.isPlainObject(name))) {
    _$jscoverage['/base/data.js'].lineData[201]++;
    for (var k in name) {
      _$jscoverage['/base/data.js'].lineData[202]++;
      Dom.data(elems, k, name[k]);
    }
    _$jscoverage['/base/data.js'].lineData[204]++;
    return undefined;
  }
  _$jscoverage['/base/data.js'].lineData[208]++;
  if (visit216_208_1(data === undefined)) {
    _$jscoverage['/base/data.js'].lineData[209]++;
    if (visit217_209_1(elem)) {
      _$jscoverage['/base/data.js'].lineData[210]++;
      if (visit218_210_1(elem.nodeType)) {
        _$jscoverage['/base/data.js'].lineData[211]++;
        return domOps.data(elem, name);
      } else {
        _$jscoverage['/base/data.js'].lineData[214]++;
        return objectOps.data(elem, name);
      }
    }
  } else {
    _$jscoverage['/base/data.js'].lineData[218]++;
    for (var i = elems.length - 1; visit219_218_1(i >= 0); i--) {
      _$jscoverage['/base/data.js'].lineData[219]++;
      elem = elems[i];
      _$jscoverage['/base/data.js'].lineData[220]++;
      if (visit220_220_1(elem.nodeType)) {
        _$jscoverage['/base/data.js'].lineData[221]++;
        domOps.data(elem, name, data);
      } else {
        _$jscoverage['/base/data.js'].lineData[224]++;
        objectOps.data(elem, name, data);
      }
    }
  }
  _$jscoverage['/base/data.js'].lineData[228]++;
  return undefined;
}, 
  removeData: function(selector, name) {
  _$jscoverage['/base/data.js'].functionData[10]++;
  _$jscoverage['/base/data.js'].lineData[239]++;
  var els = Dom.query(selector), elem, i;
  _$jscoverage['/base/data.js'].lineData[240]++;
  for (i = els.length - 1; visit221_240_1(i >= 0); i--) {
    _$jscoverage['/base/data.js'].lineData[241]++;
    elem = els[i];
    _$jscoverage['/base/data.js'].lineData[242]++;
    if (visit222_242_1(elem.nodeType)) {
      _$jscoverage['/base/data.js'].lineData[243]++;
      domOps.removeData(elem, name);
    } else {
      _$jscoverage['/base/data.js'].lineData[246]++;
      objectOps.removeData(elem, name);
    }
  }
}, 
  cleanData: function(selector, deep) {
  _$jscoverage['/base/data.js'].functionData[11]++;
  _$jscoverage['/base/data.js'].lineData[256]++;
  var els = Dom.query(selector), elem, i;
  _$jscoverage['/base/data.js'].lineData[257]++;
  var DOMEvent = S.require('event/dom');
  _$jscoverage['/base/data.js'].lineData[258]++;
  for (i = els.length - 1; visit223_258_1(i >= 0); i--) {
    _$jscoverage['/base/data.js'].lineData[259]++;
    elem = els[i];
    _$jscoverage['/base/data.js'].lineData[260]++;
    if (visit224_260_1(elem.nodeType)) {
      _$jscoverage['/base/data.js'].lineData[261]++;
      var descendants = visit225_261_1(visit226_261_2(deep && S.makeArray(elem.getElementsByTagName('*'))) || []);
      _$jscoverage['/base/data.js'].lineData[262]++;
      descendants.push(elem);
      _$jscoverage['/base/data.js'].lineData[263]++;
      for (var j = 0, len = descendants.length; visit227_263_1(j < len); j++) {
        _$jscoverage['/base/data.js'].lineData[264]++;
        domOps.removeData(descendants[j]);
      }
      _$jscoverage['/base/data.js'].lineData[266]++;
      if (visit228_266_1(DOMEvent)) {
        _$jscoverage['/base/data.js'].lineData[267]++;
        DOMEvent.detach(descendants);
      }
    } else {
      _$jscoverage['/base/data.js'].lineData[271]++;
      objectOps.removeData(elem);
    }
  }
}});
  _$jscoverage['/base/data.js'].lineData[277]++;
  return Dom;
});
