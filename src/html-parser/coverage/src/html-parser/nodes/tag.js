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
if (! _$jscoverage['/html-parser/nodes/tag.js']) {
  _$jscoverage['/html-parser/nodes/tag.js'] = {};
  _$jscoverage['/html-parser/nodes/tag.js'].lineData = [];
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[5] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[7] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[8] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[9] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[10] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[11] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[15] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[16] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[18] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[19] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[20] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[21] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[22] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[24] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[25] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[27] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[29] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[32] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[33] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[35] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[36] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[37] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[40] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[43] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[44] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[48] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[52] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[54] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[55] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[58] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[59] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[60] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[61] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[62] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[63] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[64] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[66] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[67] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[68] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[69] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[70] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[72] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[76] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[79] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[81] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[82] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[83] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[85] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[89] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[91] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[92] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[94] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[107] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[111] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[112] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[113] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[114] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[119] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[120] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[122] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[123] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[125] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[126] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[128] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[129] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[130] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[133] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[137] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[141] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[142] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[146] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[148] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[149] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[153] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[155] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[156] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[157] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[161] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[162] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[166] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[168] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[169] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[174] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[176] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[177] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[179] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[184] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[185] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[189] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[191] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[192] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[196] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[197] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[201] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[202] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[203] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[205] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[210] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[211] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[212] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[213] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[221] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[222] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[223] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[224] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[225] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[227] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[228] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[229] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[231] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[241] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[247] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[248] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[249] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[252] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[253] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[256] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[258] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[259] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[262] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[264] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[266] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[267] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[271] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[272] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[276] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[277] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[278] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[282] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[283] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[284] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[288] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[291] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[292] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[293] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[294] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[295] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[297] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[298] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[300] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[302] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[303] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[306] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[310] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[312] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[313] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[315] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[325] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[328] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[329] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[335] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[336] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[337] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[338] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[339] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[343] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[346] = 0;
}
if (! _$jscoverage['/html-parser/nodes/tag.js'].functionData) {
  _$jscoverage['/html-parser/nodes/tag.js'].functionData = [];
  _$jscoverage['/html-parser/nodes/tag.js'].functionData[0] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].functionData[1] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].functionData[2] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].functionData[3] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].functionData[4] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].functionData[5] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].functionData[6] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].functionData[7] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].functionData[8] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].functionData[9] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].functionData[10] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].functionData[11] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].functionData[12] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].functionData[13] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].functionData[14] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].functionData[15] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].functionData[16] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].functionData[17] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].functionData[18] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].functionData[19] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].functionData[20] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].functionData[21] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].functionData[22] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].functionData[23] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].functionData[24] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].functionData[25] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].functionData[26] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].functionData[27] = 0;
}
if (! _$jscoverage['/html-parser/nodes/tag.js'].branchData) {
  _$jscoverage['/html-parser/nodes/tag.js'].branchData = {};
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['21'] = [];
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['21'][1] = new BranchData();
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['24'] = [];
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['24'][1] = new BranchData();
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['32'] = [];
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['32'][1] = new BranchData();
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['41'] = [];
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['41'][1] = new BranchData();
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['43'] = [];
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['43'][1] = new BranchData();
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['48'] = [];
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['48'][1] = new BranchData();
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['62'] = [];
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['62'][1] = new BranchData();
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['66'] = [];
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['66'][1] = new BranchData();
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['67'] = [];
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['67'][1] = new BranchData();
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['82'] = [];
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['82'][1] = new BranchData();
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['113'] = [];
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['113'][1] = new BranchData();
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['119'] = [];
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['119'][1] = new BranchData();
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['119'][2] = new BranchData();
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['122'] = [];
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['122'][1] = new BranchData();
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['125'] = [];
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['125'][1] = new BranchData();
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['128'] = [];
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['128'][1] = new BranchData();
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['129'] = [];
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['129'][1] = new BranchData();
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['176'] = [];
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['176'][1] = new BranchData();
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['197'] = [];
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['197'][1] = new BranchData();
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['202'] = [];
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['202'][1] = new BranchData();
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['211'] = [];
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['211'][1] = new BranchData();
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['222'] = [];
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['222'][1] = new BranchData();
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['247'] = [];
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['247'][1] = new BranchData();
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['256'] = [];
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['256'][1] = new BranchData();
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['258'] = [];
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['258'][1] = new BranchData();
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['266'] = [];
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['266'][1] = new BranchData();
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['271'] = [];
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['271'][1] = new BranchData();
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['276'] = [];
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['276'][1] = new BranchData();
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['282'] = [];
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['282'][1] = new BranchData();
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['292'] = [];
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['292'][1] = new BranchData();
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['295'] = [];
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['295'][1] = new BranchData();
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['297'] = [];
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['297'][1] = new BranchData();
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['302'] = [];
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['302'][1] = new BranchData();
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['312'] = [];
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['312'][1] = new BranchData();
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['336'] = [];
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['336'][1] = new BranchData();
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['337'] = [];
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['337'][1] = new BranchData();
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['338'] = [];
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['338'][1] = new BranchData();
}
_$jscoverage['/html-parser/nodes/tag.js'].branchData['338'][1].init(22, 26, 'attributes[i].name == name');
function visit229_338_1(result) {
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['338'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/nodes/tag.js'].branchData['337'][1].init(30, 21, 'i < attributes.length');
function visit228_337_1(result) {
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['337'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/nodes/tag.js'].branchData['336'][1].init(14, 31, 'attributes && attributes.length');
function visit227_336_1(result) {
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['336'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/nodes/tag.js'].branchData['312'][1].init(2165, 16, '!el.isSelfClosed');
function visit226_312_1(result) {
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['312'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/nodes/tag.js'].branchData['302'][1].init(307, 38, 'filter.onAttribute(attr, el) === false');
function visit225_302_1(result) {
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['302'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/nodes/tag.js'].branchData['297'][1].init(76, 50, '!(attrName = filter.onAttributeName(attrName, el))');
function visit224_297_1(result) {
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['297'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/nodes/tag.js'].branchData['295'][1].init(104, 6, 'filter');
function visit223_295_1(result) {
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['295'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/nodes/tag.js'].branchData['292'][1].init(1443, 21, 'i < attributes.length');
function visit222_292_1(result) {
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['292'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/nodes/tag.js'].branchData['282'][1].init(724, 11, '!el.tagName');
function visit221_282_1(result) {
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['282'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/nodes/tag.js'].branchData['276'][1].init(525, 17, 'el.nodeType !== 1');
function visit220_276_1(result) {
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['276'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/nodes/tag.js'].branchData['271'][1].init(394, 3, 'tmp');
function visit219_271_1(result) {
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['271'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/nodes/tag.js'].branchData['266'][1].init(277, 13, 'tmp === false');
function visit218_266_1(result) {
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['266'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/nodes/tag.js'].branchData['258'][1].init(80, 38, '!(tagName = filter.onTagName(tagName))');
function visit217_258_1(result) {
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['258'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/nodes/tag.js'].branchData['256'][1].init(430, 6, 'filter');
function visit216_256_1(result) {
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['256'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/nodes/tag.js'].branchData['247'][1].init(178, 21, 'tagName == "!doctype"');
function visit215_247_1(result) {
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['247'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/nodes/tag.js'].branchData['222'][1].init(48, 24, '!self.isChildrenFiltered');
function visit214_222_1(result) {
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['222'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/nodes/tag.js'].branchData['211'][1].init(86, 4, 'attr');
function visit213_211_1(result) {
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['211'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/nodes/tag.js'].branchData['202'][1].init(86, 4, 'attr');
function visit212_202_1(result) {
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['202'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/nodes/tag.js'].branchData['197'][1].init(89, 18, 'attr && attr.value');
function visit211_197_1(result) {
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['197'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/nodes/tag.js'].branchData['176'][1].init(122, 27, 'index == silbing.length - 1');
function visit210_176_1(result) {
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['176'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/nodes/tag.js'].branchData['129'][1].init(22, 45, '!this.attributes[i].equals(tag.attributes[i])');
function visit209_129_1(result) {
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['129'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/nodes/tag.js'].branchData['128'][1].init(332, 26, 'i < this.attributes.length');
function visit208_128_1(result) {
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['128'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/nodes/tag.js'].branchData['125'][1].init(210, 47, 'this.attributes.length != tag.attributes.length');
function visit207_125_1(result) {
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['125'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/nodes/tag.js'].branchData['122'][1].init(118, 29, 'this.nodeType != tag.nodeType');
function visit206_122_1(result) {
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['122'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/nodes/tag.js'].branchData['119'][2].init(26, 29, 'this.nodeName != tag.nodeName');
function visit205_119_2(result) {
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['119'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/nodes/tag.js'].branchData['119'][1].init(18, 37, '!tag || this.nodeName != tag.nodeName');
function visit204_119_1(result) {
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['119'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/nodes/tag.js'].branchData['113'][1].init(95, 1, 'v');
function visit203_113_1(result) {
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['113'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/nodes/tag.js'].branchData['82'][1].init(181, 18, '!self.isSelfClosed');
function visit202_82_1(result) {
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['82'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/nodes/tag.js'].branchData['67'][1].init(30, 16, 'i < c.length - 1');
function visit201_67_1(result) {
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['67'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/nodes/tag.js'].branchData['66'][1].init(259, 12, 'c.length > 1');
function visit200_66_1(result) {
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['66'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/nodes/tag.js'].branchData['62'][1].init(124, 13, 'c.length >= 1');
function visit199_62_1(result) {
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['62'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/nodes/tag.js'].branchData['48'][1].init(838, 30, 'self.isSelfClosed || lastSlash');
function visit198_48_1(result) {
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['48'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/nodes/tag.js'].branchData['43'][1].init(681, 9, 'lastSlash');
function visit197_43_1(result) {
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['43'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/nodes/tag.js'].branchData['41'][1].init(81, 37, 'lastAttr && /\\/$/.test(lastAttr.name)');
function visit196_41_1(result) {
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['41'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/nodes/tag.js'].branchData['32'][1].init(182, 13, 'attributes[0]');
function visit195_32_1(result) {
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['32'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/nodes/tag.js'].branchData['24'][1].init(213, 23, 'typeof page == \'string\'');
function visit194_24_1(result) {
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['24'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/nodes/tag.js'].branchData['21'][1].init(152, 16, 'attributes || []');
function visit193_21_1(result) {
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['21'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/nodes/tag.js'].lineData[5]++;
KISSY.add("html-parser/nodes/tag", function(S, Node, Attribute, Dtd) {
  _$jscoverage['/html-parser/nodes/tag.js'].functionData[0]++;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[7]++;
  function createTag(self, tagName, attrs) {
    _$jscoverage['/html-parser/nodes/tag.js'].functionData[1]++;
    _$jscoverage['/html-parser/nodes/tag.js'].lineData[8]++;
    self.nodeName = self.tagName = tagName.toLowerCase();
    _$jscoverage['/html-parser/nodes/tag.js'].lineData[9]++;
    self._updateSelfClosed();
    _$jscoverage['/html-parser/nodes/tag.js'].lineData[10]++;
    S.each(attrs, function(v, n) {
  _$jscoverage['/html-parser/nodes/tag.js'].functionData[2]++;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[11]++;
  self.setAttribute(n, v);
});
  }
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[15]++;
  function Tag(page, startPosition, endPosition, attributes) {
    _$jscoverage['/html-parser/nodes/tag.js'].functionData[3]++;
    _$jscoverage['/html-parser/nodes/tag.js'].lineData[16]++;
    var self = this;
    _$jscoverage['/html-parser/nodes/tag.js'].lineData[18]++;
    self.childNodes = [];
    _$jscoverage['/html-parser/nodes/tag.js'].lineData[19]++;
    self.firstChild = null;
    _$jscoverage['/html-parser/nodes/tag.js'].lineData[20]++;
    self.lastChild = null;
    _$jscoverage['/html-parser/nodes/tag.js'].lineData[21]++;
    self.attributes = visit193_21_1(attributes || []);
    _$jscoverage['/html-parser/nodes/tag.js'].lineData[22]++;
    self.nodeType = 1;
    _$jscoverage['/html-parser/nodes/tag.js'].lineData[24]++;
    if (visit194_24_1(typeof page == 'string')) {
      _$jscoverage['/html-parser/nodes/tag.js'].lineData[25]++;
      createTag.apply(null, [self].concat(S.makeArray(arguments)));
    } else {
      _$jscoverage['/html-parser/nodes/tag.js'].lineData[27]++;
      Tag.superclass.constructor.apply(self, arguments);
      _$jscoverage['/html-parser/nodes/tag.js'].lineData[29]++;
      attributes = self.attributes;
      _$jscoverage['/html-parser/nodes/tag.js'].lineData[32]++;
      if (visit195_32_1(attributes[0])) {
        _$jscoverage['/html-parser/nodes/tag.js'].lineData[33]++;
        self.nodeName = attributes[0].name.toLowerCase();
        _$jscoverage['/html-parser/nodes/tag.js'].lineData[35]++;
        self.tagName = self.nodeName.replace(/\//, "");
        _$jscoverage['/html-parser/nodes/tag.js'].lineData[36]++;
        self._updateSelfClosed();
        _$jscoverage['/html-parser/nodes/tag.js'].lineData[37]++;
        attributes.splice(0, 1);
      }
      _$jscoverage['/html-parser/nodes/tag.js'].lineData[40]++;
      var lastAttr = attributes[attributes.length - 1], lastSlash = !!(visit196_41_1(lastAttr && /\/$/.test(lastAttr.name)));
      _$jscoverage['/html-parser/nodes/tag.js'].lineData[43]++;
      if (visit197_43_1(lastSlash)) {
        _$jscoverage['/html-parser/nodes/tag.js'].lineData[44]++;
        attributes.length = attributes.length - 1;
      }
      _$jscoverage['/html-parser/nodes/tag.js'].lineData[48]++;
      self.isSelfClosed = visit198_48_1(self.isSelfClosed || lastSlash);
      _$jscoverage['/html-parser/nodes/tag.js'].lineData[52]++;
      self['closed'] = self.isSelfClosed;
    }
    _$jscoverage['/html-parser/nodes/tag.js'].lineData[54]++;
    self['closedStartPosition'] = -1;
    _$jscoverage['/html-parser/nodes/tag.js'].lineData[55]++;
    self['closedEndPosition'] = -1;
  }
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[58]++;
  function refreshChildNodes(self) {
    _$jscoverage['/html-parser/nodes/tag.js'].functionData[4]++;
    _$jscoverage['/html-parser/nodes/tag.js'].lineData[59]++;
    var c = self.childNodes;
    _$jscoverage['/html-parser/nodes/tag.js'].lineData[60]++;
    self.firstChild = c[0];
    _$jscoverage['/html-parser/nodes/tag.js'].lineData[61]++;
    self.lastChild = c[c.length - 1];
    _$jscoverage['/html-parser/nodes/tag.js'].lineData[62]++;
    if (visit199_62_1(c.length >= 1)) {
      _$jscoverage['/html-parser/nodes/tag.js'].lineData[63]++;
      c[0].nextSibling = c[0].nextSibling = null;
      _$jscoverage['/html-parser/nodes/tag.js'].lineData[64]++;
      c[0].parentNode = self;
    }
    _$jscoverage['/html-parser/nodes/tag.js'].lineData[66]++;
    if (visit200_66_1(c.length > 1)) {
      _$jscoverage['/html-parser/nodes/tag.js'].lineData[67]++;
      for (var i = 0; visit201_67_1(i < c.length - 1); i++) {
        _$jscoverage['/html-parser/nodes/tag.js'].lineData[68]++;
        c[i].nextSibling = c[i + 1];
        _$jscoverage['/html-parser/nodes/tag.js'].lineData[69]++;
        c[i + 1].previousSibling = c[i];
        _$jscoverage['/html-parser/nodes/tag.js'].lineData[70]++;
        c[i + 1].parentNode = self;
      }
      _$jscoverage['/html-parser/nodes/tag.js'].lineData[72]++;
      c[c.length - 1].nextSibling = null;
    }
  }
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[76]++;
  S.extend(Tag, Node, {
  _updateSelfClosed: function() {
  _$jscoverage['/html-parser/nodes/tag.js'].functionData[5]++;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[79]++;
  var self = this;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[81]++;
  self.isSelfClosed = !!(Dtd.$empty[self.nodeName]);
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[82]++;
  if (visit202_82_1(!self.isSelfClosed)) {
    _$jscoverage['/html-parser/nodes/tag.js'].lineData[83]++;
    self.isSelfClosed = /\/$/.test(self.nodeName);
  }
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[85]++;
  self['closed'] = self.isSelfClosed;
}, 
  clone: function() {
  _$jscoverage['/html-parser/nodes/tag.js'].functionData[6]++;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[89]++;
  var ret = new Tag(), attrs = [];
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[91]++;
  S.each(this.attributes, function(a) {
  _$jscoverage['/html-parser/nodes/tag.js'].functionData[7]++;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[92]++;
  attrs.push(a.clone());
});
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[94]++;
  S.mix(ret, {
  childNodes: [], 
  firstChild: null, 
  lastChild: null, 
  attributes: attrs, 
  nodeType: this.nodeType, 
  nodeName: this.nodeName, 
  tagName: this.tagName, 
  isSelfClosed: this.isSelfClosed, 
  closed: this.closed, 
  closedStartPosition: this.closedStartPosition, 
  closedEndPosition: this.closedEndPosition});
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[107]++;
  return ret;
}, 
  setTagName: function(v) {
  _$jscoverage['/html-parser/nodes/tag.js'].functionData[8]++;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[111]++;
  var self = this;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[112]++;
  self.nodeName = self.tagName = v;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[113]++;
  if (visit203_113_1(v)) {
    _$jscoverage['/html-parser/nodes/tag.js'].lineData[114]++;
    self._updateSelfClosed();
  }
}, 
  equals: function(tag) {
  _$jscoverage['/html-parser/nodes/tag.js'].functionData[9]++;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[119]++;
  if (visit204_119_1(!tag || visit205_119_2(this.nodeName != tag.nodeName))) {
    _$jscoverage['/html-parser/nodes/tag.js'].lineData[120]++;
    return 0;
  }
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[122]++;
  if (visit206_122_1(this.nodeType != tag.nodeType)) {
    _$jscoverage['/html-parser/nodes/tag.js'].lineData[123]++;
    return 0;
  }
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[125]++;
  if (visit207_125_1(this.attributes.length != tag.attributes.length)) {
    _$jscoverage['/html-parser/nodes/tag.js'].lineData[126]++;
    return 0;
  }
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[128]++;
  for (var i = 0; visit208_128_1(i < this.attributes.length); i++) {
    _$jscoverage['/html-parser/nodes/tag.js'].lineData[129]++;
    if (visit209_129_1(!this.attributes[i].equals(tag.attributes[i]))) {
      _$jscoverage['/html-parser/nodes/tag.js'].lineData[130]++;
      return 0;
    }
  }
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[133]++;
  return 1;
}, 
  isEndTag: function() {
  _$jscoverage['/html-parser/nodes/tag.js'].functionData[10]++;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[137]++;
  return /^\//.test(this.nodeName);
}, 
  appendChild: function(node) {
  _$jscoverage['/html-parser/nodes/tag.js'].functionData[11]++;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[141]++;
  this.childNodes.push(node);
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[142]++;
  refreshChildNodes(this);
}, 
  replace: function(ref) {
  _$jscoverage['/html-parser/nodes/tag.js'].functionData[12]++;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[146]++;
  var silbing = ref.parentNode.childNodes, index = S.indexOf(ref, silbing);
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[148]++;
  silbing[index] = this;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[149]++;
  refreshChildNodes(ref.parentNode);
}, 
  replaceChild: function(newC, refC) {
  _$jscoverage['/html-parser/nodes/tag.js'].functionData[13]++;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[153]++;
  var self = this, childNodes = self.childNodes;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[155]++;
  var index = S.indexOf(refC, childNodes);
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[156]++;
  childNodes[index] = newC;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[157]++;
  refreshChildNodes(self);
}, 
  prepend: function(node) {
  _$jscoverage['/html-parser/nodes/tag.js'].functionData[14]++;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[161]++;
  this.childNodes.unshift(node);
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[162]++;
  refreshChildNodes(this);
}, 
  insertBefore: function(ref) {
  _$jscoverage['/html-parser/nodes/tag.js'].functionData[15]++;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[166]++;
  var silbing = ref.parentNode.childNodes, index = S.indexOf(ref, silbing);
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[168]++;
  silbing.splice(index, 0, this);
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[169]++;
  refreshChildNodes(ref.parentNode);
}, 
  insertAfter: function(ref) {
  _$jscoverage['/html-parser/nodes/tag.js'].functionData[16]++;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[174]++;
  var silbing = ref.parentNode.childNodes, index = S.indexOf(ref, silbing);
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[176]++;
  if (visit210_176_1(index == silbing.length - 1)) {
    _$jscoverage['/html-parser/nodes/tag.js'].lineData[177]++;
    ref.parentNode.appendChild(this);
  } else {
    _$jscoverage['/html-parser/nodes/tag.js'].lineData[179]++;
    this.insertBefore(ref.parentNode.childNodes[[index + 1]]);
  }
}, 
  empty: function() {
  _$jscoverage['/html-parser/nodes/tag.js'].functionData[17]++;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[184]++;
  this.childNodes = [];
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[185]++;
  refreshChildNodes(this);
}, 
  removeChild: function(node) {
  _$jscoverage['/html-parser/nodes/tag.js'].functionData[18]++;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[189]++;
  var silbing = node.parentNode.childNodes, index = S.indexOf(node, silbing);
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[191]++;
  silbing.splice(index, 1);
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[192]++;
  refreshChildNodes(node.parentNode);
}, 
  getAttribute: function(name) {
  _$jscoverage['/html-parser/nodes/tag.js'].functionData[19]++;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[196]++;
  var attr = findAttributeByName(this.attributes, name);
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[197]++;
  return visit211_197_1(attr && attr.value);
}, 
  setAttribute: function(name, value) {
  _$jscoverage['/html-parser/nodes/tag.js'].functionData[20]++;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[201]++;
  var attr = findAttributeByName(this.attributes, name);
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[202]++;
  if (visit212_202_1(attr)) {
    _$jscoverage['/html-parser/nodes/tag.js'].lineData[203]++;
    attr.value = value;
  } else {
    _$jscoverage['/html-parser/nodes/tag.js'].lineData[205]++;
    this.attributes.push(new Attribute(name, '=', value, '"'));
  }
}, 
  removeAttribute: function(name) {
  _$jscoverage['/html-parser/nodes/tag.js'].functionData[21]++;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[210]++;
  var attr = findAttributeByName(this.attributes, name);
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[211]++;
  if (visit213_211_1(attr)) {
    _$jscoverage['/html-parser/nodes/tag.js'].lineData[212]++;
    var index = S.indexOf(attr, this.attributes);
    _$jscoverage['/html-parser/nodes/tag.js'].lineData[213]++;
    this.attributes.splice(index, 1);
  }
}, 
  filterChildren: function() {
  _$jscoverage['/html-parser/nodes/tag.js'].functionData[22]++;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[221]++;
  var self = this;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[222]++;
  if (visit214_222_1(!self.isChildrenFiltered)) {
    _$jscoverage['/html-parser/nodes/tag.js'].lineData[223]++;
    var writer = new (S.require('html-parser/writer/basic'))();
    _$jscoverage['/html-parser/nodes/tag.js'].lineData[224]++;
    self._writeChildrenHTML(writer);
    _$jscoverage['/html-parser/nodes/tag.js'].lineData[225]++;
    var parser = new (S.require('html-parser/parser'))(writer.getHtml()), children = parser.parse().childNodes;
    _$jscoverage['/html-parser/nodes/tag.js'].lineData[227]++;
    self.empty();
    _$jscoverage['/html-parser/nodes/tag.js'].lineData[228]++;
    S.each(children, function(c) {
  _$jscoverage['/html-parser/nodes/tag.js'].functionData[23]++;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[229]++;
  self.appendChild(c);
});
    _$jscoverage['/html-parser/nodes/tag.js'].lineData[231]++;
    self.isChildrenFiltered = 1;
  }
}, 
  writeHtml: function(writer, filter) {
  _$jscoverage['/html-parser/nodes/tag.js'].functionData[24]++;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[241]++;
  var el = this, tmp, attrName, tagName = el.tagName;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[247]++;
  if (visit215_247_1(tagName == "!doctype")) {
    _$jscoverage['/html-parser/nodes/tag.js'].lineData[248]++;
    writer.append(this.toHtml() + "\n");
    _$jscoverage['/html-parser/nodes/tag.js'].lineData[249]++;
    return;
  }
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[252]++;
  el.__filter = filter;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[253]++;
  el.isChildrenFiltered = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[256]++;
  if (visit216_256_1(filter)) {
    _$jscoverage['/html-parser/nodes/tag.js'].lineData[258]++;
    if (visit217_258_1(!(tagName = filter.onTagName(tagName)))) {
      _$jscoverage['/html-parser/nodes/tag.js'].lineData[259]++;
      return;
    }
    _$jscoverage['/html-parser/nodes/tag.js'].lineData[262]++;
    el.tagName = tagName;
    _$jscoverage['/html-parser/nodes/tag.js'].lineData[264]++;
    tmp = filter.onTag(el);
    _$jscoverage['/html-parser/nodes/tag.js'].lineData[266]++;
    if (visit218_266_1(tmp === false)) {
      _$jscoverage['/html-parser/nodes/tag.js'].lineData[267]++;
      return;
    }
    _$jscoverage['/html-parser/nodes/tag.js'].lineData[271]++;
    if (visit219_271_1(tmp)) {
      _$jscoverage['/html-parser/nodes/tag.js'].lineData[272]++;
      el = tmp;
    }
    _$jscoverage['/html-parser/nodes/tag.js'].lineData[276]++;
    if (visit220_276_1(el.nodeType !== 1)) {
      _$jscoverage['/html-parser/nodes/tag.js'].lineData[277]++;
      el.writeHtml(writer, filter);
      _$jscoverage['/html-parser/nodes/tag.js'].lineData[278]++;
      return;
    }
    _$jscoverage['/html-parser/nodes/tag.js'].lineData[282]++;
    if (visit221_282_1(!el.tagName)) {
      _$jscoverage['/html-parser/nodes/tag.js'].lineData[283]++;
      el._writeChildrenHTML(writer);
      _$jscoverage['/html-parser/nodes/tag.js'].lineData[284]++;
      return;
    }
  }
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[288]++;
  writer.openTag(el);
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[291]++;
  var attributes = el.attributes;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[292]++;
  for (var i = 0; visit222_292_1(i < attributes.length); i++) {
    _$jscoverage['/html-parser/nodes/tag.js'].lineData[293]++;
    var attr = attributes[i];
    _$jscoverage['/html-parser/nodes/tag.js'].lineData[294]++;
    attrName = attr.name;
    _$jscoverage['/html-parser/nodes/tag.js'].lineData[295]++;
    if (visit223_295_1(filter)) {
      _$jscoverage['/html-parser/nodes/tag.js'].lineData[297]++;
      if (visit224_297_1(!(attrName = filter.onAttributeName(attrName, el)))) {
        _$jscoverage['/html-parser/nodes/tag.js'].lineData[298]++;
        continue;
      }
      _$jscoverage['/html-parser/nodes/tag.js'].lineData[300]++;
      attr.name = attrName;
      _$jscoverage['/html-parser/nodes/tag.js'].lineData[302]++;
      if (visit225_302_1(filter.onAttribute(attr, el) === false)) {
        _$jscoverage['/html-parser/nodes/tag.js'].lineData[303]++;
        continue;
      }
    }
    _$jscoverage['/html-parser/nodes/tag.js'].lineData[306]++;
    writer.attribute(attr, el);
  }
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[310]++;
  writer.openTagClose(el);
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[312]++;
  if (visit226_312_1(!el.isSelfClosed)) {
    _$jscoverage['/html-parser/nodes/tag.js'].lineData[313]++;
    el._writeChildrenHTML(writer);
    _$jscoverage['/html-parser/nodes/tag.js'].lineData[315]++;
    writer.closeTag(el);
  }
}, 
  _writeChildrenHTML: function(writer) {
  _$jscoverage['/html-parser/nodes/tag.js'].functionData[25]++;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[325]++;
  var self = this, filter = self.isChildrenFiltered ? 0 : self.__filter;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[328]++;
  S.each(self.childNodes, function(child) {
  _$jscoverage['/html-parser/nodes/tag.js'].functionData[26]++;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[329]++;
  child.writeHtml(writer, filter);
});
}});
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[335]++;
  function findAttributeByName(attributes, name) {
    _$jscoverage['/html-parser/nodes/tag.js'].functionData[27]++;
    _$jscoverage['/html-parser/nodes/tag.js'].lineData[336]++;
    if (visit227_336_1(attributes && attributes.length)) {
      _$jscoverage['/html-parser/nodes/tag.js'].lineData[337]++;
      for (var i = 0; visit228_337_1(i < attributes.length); i++) {
        _$jscoverage['/html-parser/nodes/tag.js'].lineData[338]++;
        if (visit229_338_1(attributes[i].name == name)) {
          _$jscoverage['/html-parser/nodes/tag.js'].lineData[339]++;
          return attributes[i];
        }
      }
    }
    _$jscoverage['/html-parser/nodes/tag.js'].lineData[343]++;
    return null;
  }
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[346]++;
  return Tag;
}, {
  requires: ['./node', './attribute', '../dtd']});
