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
if (! _$jscoverage['/navigation-view.js']) {
  _$jscoverage['/navigation-view.js'] = {};
  _$jscoverage['/navigation-view.js'].lineData = [];
  _$jscoverage['/navigation-view.js'].lineData[5] = 0;
  _$jscoverage['/navigation-view.js'].lineData[6] = 0;
  _$jscoverage['/navigation-view.js'].lineData[7] = 0;
  _$jscoverage['/navigation-view.js'].lineData[8] = 0;
  _$jscoverage['/navigation-view.js'].lineData[9] = 0;
  _$jscoverage['/navigation-view.js'].lineData[10] = 0;
  _$jscoverage['/navigation-view.js'].lineData[15] = 0;
  _$jscoverage['/navigation-view.js'].lineData[16] = 0;
  _$jscoverage['/navigation-view.js'].lineData[21] = 0;
  _$jscoverage['/navigation-view.js'].lineData[23] = 0;
  _$jscoverage['/navigation-view.js'].lineData[25] = 0;
  _$jscoverage['/navigation-view.js'].lineData[27] = 0;
  _$jscoverage['/navigation-view.js'].lineData[30] = 0;
  _$jscoverage['/navigation-view.js'].lineData[31] = 0;
  _$jscoverage['/navigation-view.js'].lineData[32] = 0;
  _$jscoverage['/navigation-view.js'].lineData[33] = 0;
  _$jscoverage['/navigation-view.js'].lineData[37] = 0;
  _$jscoverage['/navigation-view.js'].lineData[38] = 0;
  _$jscoverage['/navigation-view.js'].lineData[39] = 0;
  _$jscoverage['/navigation-view.js'].lineData[40] = 0;
  _$jscoverage['/navigation-view.js'].lineData[41] = 0;
  _$jscoverage['/navigation-view.js'].lineData[42] = 0;
  _$jscoverage['/navigation-view.js'].lineData[43] = 0;
  _$jscoverage['/navigation-view.js'].lineData[44] = 0;
  _$jscoverage['/navigation-view.js'].lineData[47] = 0;
  _$jscoverage['/navigation-view.js'].lineData[51] = 0;
  _$jscoverage['/navigation-view.js'].lineData[54] = 0;
  _$jscoverage['/navigation-view.js'].lineData[55] = 0;
  _$jscoverage['/navigation-view.js'].lineData[56] = 0;
  _$jscoverage['/navigation-view.js'].lineData[57] = 0;
  _$jscoverage['/navigation-view.js'].lineData[58] = 0;
  _$jscoverage['/navigation-view.js'].lineData[60] = 0;
  _$jscoverage['/navigation-view.js'].lineData[61] = 0;
  _$jscoverage['/navigation-view.js'].lineData[62] = 0;
  _$jscoverage['/navigation-view.js'].lineData[64] = 0;
  _$jscoverage['/navigation-view.js'].lineData[65] = 0;
  _$jscoverage['/navigation-view.js'].lineData[76] = 0;
  _$jscoverage['/navigation-view.js'].lineData[77] = 0;
  _$jscoverage['/navigation-view.js'].lineData[80] = 0;
  _$jscoverage['/navigation-view.js'].lineData[81] = 0;
  _$jscoverage['/navigation-view.js'].lineData[90] = 0;
  _$jscoverage['/navigation-view.js'].lineData[91] = 0;
  _$jscoverage['/navigation-view.js'].lineData[94] = 0;
  _$jscoverage['/navigation-view.js'].lineData[95] = 0;
  _$jscoverage['/navigation-view.js'].lineData[96] = 0;
  _$jscoverage['/navigation-view.js'].lineData[97] = 0;
  _$jscoverage['/navigation-view.js'].lineData[98] = 0;
  _$jscoverage['/navigation-view.js'].lineData[102] = 0;
  _$jscoverage['/navigation-view.js'].lineData[103] = 0;
  _$jscoverage['/navigation-view.js'].lineData[106] = 0;
  _$jscoverage['/navigation-view.js'].lineData[107] = 0;
  _$jscoverage['/navigation-view.js'].lineData[108] = 0;
  _$jscoverage['/navigation-view.js'].lineData[111] = 0;
  _$jscoverage['/navigation-view.js'].lineData[112] = 0;
  _$jscoverage['/navigation-view.js'].lineData[115] = 0;
  _$jscoverage['/navigation-view.js'].lineData[116] = 0;
  _$jscoverage['/navigation-view.js'].lineData[118] = 0;
  _$jscoverage['/navigation-view.js'].lineData[121] = 0;
  _$jscoverage['/navigation-view.js'].lineData[122] = 0;
  _$jscoverage['/navigation-view.js'].lineData[125] = 0;
  _$jscoverage['/navigation-view.js'].lineData[128] = 0;
  _$jscoverage['/navigation-view.js'].lineData[129] = 0;
  _$jscoverage['/navigation-view.js'].lineData[133] = 0;
  _$jscoverage['/navigation-view.js'].lineData[134] = 0;
  _$jscoverage['/navigation-view.js'].lineData[136] = 0;
  _$jscoverage['/navigation-view.js'].lineData[138] = 0;
  _$jscoverage['/navigation-view.js'].lineData[139] = 0;
  _$jscoverage['/navigation-view.js'].lineData[140] = 0;
  _$jscoverage['/navigation-view.js'].lineData[141] = 0;
  _$jscoverage['/navigation-view.js'].lineData[142] = 0;
  _$jscoverage['/navigation-view.js'].lineData[147] = 0;
  _$jscoverage['/navigation-view.js'].lineData[148] = 0;
  _$jscoverage['/navigation-view.js'].lineData[152] = 0;
  _$jscoverage['/navigation-view.js'].lineData[160] = 0;
  _$jscoverage['/navigation-view.js'].lineData[161] = 0;
  _$jscoverage['/navigation-view.js'].lineData[162] = 0;
  _$jscoverage['/navigation-view.js'].lineData[163] = 0;
  _$jscoverage['/navigation-view.js'].lineData[164] = 0;
  _$jscoverage['/navigation-view.js'].lineData[166] = 0;
  _$jscoverage['/navigation-view.js'].lineData[168] = 0;
  _$jscoverage['/navigation-view.js'].lineData[169] = 0;
  _$jscoverage['/navigation-view.js'].lineData[171] = 0;
  _$jscoverage['/navigation-view.js'].lineData[173] = 0;
  _$jscoverage['/navigation-view.js'].lineData[174] = 0;
  _$jscoverage['/navigation-view.js'].lineData[175] = 0;
  _$jscoverage['/navigation-view.js'].lineData[177] = 0;
  _$jscoverage['/navigation-view.js'].lineData[180] = 0;
  _$jscoverage['/navigation-view.js'].lineData[186] = 0;
  _$jscoverage['/navigation-view.js'].lineData[188] = 0;
  _$jscoverage['/navigation-view.js'].lineData[189] = 0;
  _$jscoverage['/navigation-view.js'].lineData[192] = 0;
  _$jscoverage['/navigation-view.js'].lineData[193] = 0;
  _$jscoverage['/navigation-view.js'].lineData[194] = 0;
  _$jscoverage['/navigation-view.js'].lineData[197] = 0;
  _$jscoverage['/navigation-view.js'].lineData[200] = 0;
  _$jscoverage['/navigation-view.js'].lineData[203] = 0;
  _$jscoverage['/navigation-view.js'].lineData[204] = 0;
  _$jscoverage['/navigation-view.js'].lineData[206] = 0;
  _$jscoverage['/navigation-view.js'].lineData[210] = 0;
  _$jscoverage['/navigation-view.js'].lineData[211] = 0;
  _$jscoverage['/navigation-view.js'].lineData[214] = 0;
  _$jscoverage['/navigation-view.js'].lineData[215] = 0;
  _$jscoverage['/navigation-view.js'].lineData[218] = 0;
  _$jscoverage['/navigation-view.js'].lineData[219] = 0;
  _$jscoverage['/navigation-view.js'].lineData[220] = 0;
  _$jscoverage['/navigation-view.js'].lineData[224] = 0;
  _$jscoverage['/navigation-view.js'].lineData[225] = 0;
  _$jscoverage['/navigation-view.js'].lineData[226] = 0;
  _$jscoverage['/navigation-view.js'].lineData[227] = 0;
  _$jscoverage['/navigation-view.js'].lineData[228] = 0;
  _$jscoverage['/navigation-view.js'].lineData[229] = 0;
  _$jscoverage['/navigation-view.js'].lineData[230] = 0;
  _$jscoverage['/navigation-view.js'].lineData[234] = 0;
  _$jscoverage['/navigation-view.js'].lineData[236] = 0;
  _$jscoverage['/navigation-view.js'].lineData[237] = 0;
  _$jscoverage['/navigation-view.js'].lineData[238] = 0;
  _$jscoverage['/navigation-view.js'].lineData[239] = 0;
  _$jscoverage['/navigation-view.js'].lineData[240] = 0;
  _$jscoverage['/navigation-view.js'].lineData[241] = 0;
  _$jscoverage['/navigation-view.js'].lineData[242] = 0;
  _$jscoverage['/navigation-view.js'].lineData[243] = 0;
  _$jscoverage['/navigation-view.js'].lineData[244] = 0;
  _$jscoverage['/navigation-view.js'].lineData[253] = 0;
  _$jscoverage['/navigation-view.js'].lineData[254] = 0;
  _$jscoverage['/navigation-view.js'].lineData[255] = 0;
  _$jscoverage['/navigation-view.js'].lineData[256] = 0;
  _$jscoverage['/navigation-view.js'].lineData[257] = 0;
  _$jscoverage['/navigation-view.js'].lineData[258] = 0;
  _$jscoverage['/navigation-view.js'].lineData[259] = 0;
  _$jscoverage['/navigation-view.js'].lineData[261] = 0;
  _$jscoverage['/navigation-view.js'].lineData[265] = 0;
  _$jscoverage['/navigation-view.js'].lineData[276] = 0;
  _$jscoverage['/navigation-view.js'].lineData[278] = 0;
  _$jscoverage['/navigation-view.js'].lineData[279] = 0;
  _$jscoverage['/navigation-view.js'].lineData[282] = 0;
  _$jscoverage['/navigation-view.js'].lineData[285] = 0;
  _$jscoverage['/navigation-view.js'].lineData[286] = 0;
  _$jscoverage['/navigation-view.js'].lineData[287] = 0;
  _$jscoverage['/navigation-view.js'].lineData[288] = 0;
  _$jscoverage['/navigation-view.js'].lineData[289] = 0;
  _$jscoverage['/navigation-view.js'].lineData[290] = 0;
  _$jscoverage['/navigation-view.js'].lineData[291] = 0;
  _$jscoverage['/navigation-view.js'].lineData[292] = 0;
  _$jscoverage['/navigation-view.js'].lineData[295] = 0;
  _$jscoverage['/navigation-view.js'].lineData[296] = 0;
  _$jscoverage['/navigation-view.js'].lineData[298] = 0;
  _$jscoverage['/navigation-view.js'].lineData[300] = 0;
  _$jscoverage['/navigation-view.js'].lineData[304] = 0;
  _$jscoverage['/navigation-view.js'].lineData[306] = 0;
  _$jscoverage['/navigation-view.js'].lineData[310] = 0;
  _$jscoverage['/navigation-view.js'].lineData[318] = 0;
  _$jscoverage['/navigation-view.js'].lineData[319] = 0;
  _$jscoverage['/navigation-view.js'].lineData[320] = 0;
  _$jscoverage['/navigation-view.js'].lineData[321] = 0;
  _$jscoverage['/navigation-view.js'].lineData[322] = 0;
  _$jscoverage['/navigation-view.js'].lineData[324] = 0;
  _$jscoverage['/navigation-view.js'].lineData[325] = 0;
  _$jscoverage['/navigation-view.js'].lineData[326] = 0;
  _$jscoverage['/navigation-view.js'].lineData[327] = 0;
  _$jscoverage['/navigation-view.js'].lineData[329] = 0;
  _$jscoverage['/navigation-view.js'].lineData[331] = 0;
}
if (! _$jscoverage['/navigation-view.js'].functionData) {
  _$jscoverage['/navigation-view.js'].functionData = [];
  _$jscoverage['/navigation-view.js'].functionData[0] = 0;
  _$jscoverage['/navigation-view.js'].functionData[1] = 0;
  _$jscoverage['/navigation-view.js'].functionData[2] = 0;
  _$jscoverage['/navigation-view.js'].functionData[3] = 0;
  _$jscoverage['/navigation-view.js'].functionData[4] = 0;
  _$jscoverage['/navigation-view.js'].functionData[5] = 0;
  _$jscoverage['/navigation-view.js'].functionData[6] = 0;
  _$jscoverage['/navigation-view.js'].functionData[7] = 0;
  _$jscoverage['/navigation-view.js'].functionData[8] = 0;
  _$jscoverage['/navigation-view.js'].functionData[9] = 0;
  _$jscoverage['/navigation-view.js'].functionData[10] = 0;
  _$jscoverage['/navigation-view.js'].functionData[11] = 0;
  _$jscoverage['/navigation-view.js'].functionData[12] = 0;
  _$jscoverage['/navigation-view.js'].functionData[13] = 0;
  _$jscoverage['/navigation-view.js'].functionData[14] = 0;
  _$jscoverage['/navigation-view.js'].functionData[15] = 0;
  _$jscoverage['/navigation-view.js'].functionData[16] = 0;
  _$jscoverage['/navigation-view.js'].functionData[17] = 0;
  _$jscoverage['/navigation-view.js'].functionData[18] = 0;
  _$jscoverage['/navigation-view.js'].functionData[19] = 0;
  _$jscoverage['/navigation-view.js'].functionData[20] = 0;
  _$jscoverage['/navigation-view.js'].functionData[21] = 0;
}
if (! _$jscoverage['/navigation-view.js'].branchData) {
  _$jscoverage['/navigation-view.js'].branchData = {};
  _$jscoverage['/navigation-view.js'].branchData['40'] = [];
  _$jscoverage['/navigation-view.js'].branchData['40'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['41'] = [];
  _$jscoverage['/navigation-view.js'].branchData['41'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['42'] = [];
  _$jscoverage['/navigation-view.js'].branchData['42'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['43'] = [];
  _$jscoverage['/navigation-view.js'].branchData['43'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['57'] = [];
  _$jscoverage['/navigation-view.js'].branchData['57'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['64'] = [];
  _$jscoverage['/navigation-view.js'].branchData['64'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['94'] = [];
  _$jscoverage['/navigation-view.js'].branchData['94'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['95'] = [];
  _$jscoverage['/navigation-view.js'].branchData['95'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['97'] = [];
  _$jscoverage['/navigation-view.js'].branchData['97'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['102'] = [];
  _$jscoverage['/navigation-view.js'].branchData['102'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['106'] = [];
  _$jscoverage['/navigation-view.js'].branchData['106'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['111'] = [];
  _$jscoverage['/navigation-view.js'].branchData['111'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['115'] = [];
  _$jscoverage['/navigation-view.js'].branchData['115'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['128'] = [];
  _$jscoverage['/navigation-view.js'].branchData['128'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['138'] = [];
  _$jscoverage['/navigation-view.js'].branchData['138'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['141'] = [];
  _$jscoverage['/navigation-view.js'].branchData['141'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['141'][2] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['162'] = [];
  _$jscoverage['/navigation-view.js'].branchData['162'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['163'] = [];
  _$jscoverage['/navigation-view.js'].branchData['163'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['173'] = [];
  _$jscoverage['/navigation-view.js'].branchData['173'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['174'] = [];
  _$jscoverage['/navigation-view.js'].branchData['174'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['188'] = [];
  _$jscoverage['/navigation-view.js'].branchData['188'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['192'] = [];
  _$jscoverage['/navigation-view.js'].branchData['192'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['193'] = [];
  _$jscoverage['/navigation-view.js'].branchData['193'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['203'] = [];
  _$jscoverage['/navigation-view.js'].branchData['203'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['227'] = [];
  _$jscoverage['/navigation-view.js'].branchData['227'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['229'] = [];
  _$jscoverage['/navigation-view.js'].branchData['229'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['256'] = [];
  _$jscoverage['/navigation-view.js'].branchData['256'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['278'] = [];
  _$jscoverage['/navigation-view.js'].branchData['278'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['279'] = [];
  _$jscoverage['/navigation-view.js'].branchData['279'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['291'] = [];
  _$jscoverage['/navigation-view.js'].branchData['291'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['292'] = [];
  _$jscoverage['/navigation-view.js'].branchData['292'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['295'] = [];
  _$jscoverage['/navigation-view.js'].branchData['295'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['295'][2] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['318'] = [];
  _$jscoverage['/navigation-view.js'].branchData['318'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['326'] = [];
  _$jscoverage['/navigation-view.js'].branchData['326'][1] = new BranchData();
}
_$jscoverage['/navigation-view.js'].branchData['326'][1].init(367, 58, 'config.animation.leave || activeViewConfig.animation.leave');
function visit36_326_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['326'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['318'][1].init(258, 20, 'viewStack.length > 1');
function visit35_318_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['318'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['295'][2].init(1081, 56, 'enterAnimation && getAnimCss(self, enterAnimation, true)');
function visit34_295_2(result) {
  _$jscoverage['/navigation-view.js'].branchData['295'][2].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['295'][1].init(1081, 62, 'enterAnimation && getAnimCss(self, enterAnimation, true) || \'\'');
function visit33_295_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['295'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['292'][1].init(35, 50, 'activeViewConfig.animation.leave || leaveAnimation');
function visit32_292_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['292'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['291'][1].init(931, 10, 'activeView');
function visit31_291_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['291'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['279'][1].init(37, 41, 'config.animation || self.get(\'animation\')');
function visit30_279_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['279'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['278'][1].init(438, 10, 'activeView');
function visit29_278_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['278'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['256'][1].init(136, 9, '!nextView');
function visit28_256_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['256'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['229'][1].init(169, 27, 'isLeaveCss(className, self)');
function visit27_229_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['229'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['227'][1].init(79, 27, 'isEnterCss(className, self)');
function visit26_227_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['227'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['203'][1].init(64, 55, 'self.$loadingEl.hasClass(self.showViewClass) && oldView');
function visit25_203_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['203'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['193'][1].init(18, 7, 'oldView');
function visit24_193_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['193'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['192'][1].init(777, 7, 'promise');
function visit23_192_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['192'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['188'][1].init(675, 7, 'oldView');
function visit22_188_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['188'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['174'][1].init(18, 13, 'newView.enter');
function visit21_174_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['174'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['173'][1].init(322, 7, 'newView');
function visit20_173_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['173'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['163'][1].init(18, 13, 'oldView.leave');
function visit19_163_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['163'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['162'][1].init(55, 7, 'oldView');
function visit18_162_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['162'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['141'][2].init(94, 32, 'activeView.uuid === newView.uuid');
function visit17_141_2(result) {
  _$jscoverage['/navigation-view.js'].branchData['141'][2].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['141'][1].init(80, 46, 'activeView && activeView.uuid === newView.uuid');
function visit16_141_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['141'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['138'][1].init(77, 7, 'promise');
function visit15_138_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['138'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['128'][1].init(216, 31, 'className !== originalClassName');
function visit14_128_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['128'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['115'][1].init(738, 31, 'className !== originalClassName');
function visit13_115_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['115'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['111'][1].init(612, 44, 'className.indexOf(self.showViewClass) === -1');
function visit12_111_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['111'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['106'][1].init(491, 3, 'css');
function visit11_106_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['106'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['102'][1].init(348, 40, 'className.match(self.animateClassRegExp)');
function visit10_102_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['102'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['97'][1].init(112, 38, 'css.match(self.animateNoneLeaveRegExp)');
function visit9_97_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['97'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['95'][1].init(18, 38, 'css.match(self.animateNoneEnterRegExp)');
function visit8_95_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['95'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['94'][1].init(99, 3, 'css');
function visit7_94_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['94'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['64'][1].init(387, 15, 'i < removedSize');
function visit6_64_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['64'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['57'][1].init(145, 32, 'children.length <= viewCacheSize');
function visit5_57_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['57'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['43'][1].init(26, 36, 'children[i].get(\'viewId\') === viewId');
function visit4_43_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['43'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['42'][1].init(22, 6, 'viewId');
function visit3_42_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['42'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['41'][1].init(18, 48, 'children[i].constructor.xclass === config.xclass');
function visit2_41_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['41'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['40'][1].init(119, 19, 'i < children.length');
function visit1_40_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['40'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].lineData[5]++;
KISSY.add(function(S, require) {
  _$jscoverage['/navigation-view.js'].functionData[0]++;
  _$jscoverage['/navigation-view.js'].lineData[6]++;
  var $ = require('node').all;
  _$jscoverage['/navigation-view.js'].lineData[7]++;
  var Container = require('component/container');
  _$jscoverage['/navigation-view.js'].lineData[8]++;
  var ContentTpl = require('component/extension/content-xtpl');
  _$jscoverage['/navigation-view.js'].lineData[9]++;
  var ContentRender = require('component/extension/content-render');
  _$jscoverage['/navigation-view.js'].lineData[10]++;
  var LOADING_HTML = '<div class="{prefixCls}navigation-view-loading">' + '<div class="{prefixCls}navigation-view-loading-outer">' + '<div class="{prefixCls}navigation-view-loading-inner"></div>' + '</div>' + '</div>';
  _$jscoverage['/navigation-view.js'].lineData[15]++;
  var vendorPrefix = S.Feature.getVendorCssPropPrefix('animation');
  _$jscoverage['/navigation-view.js'].lineData[16]++;
  var ANIMATION_END_EVENT = vendorPrefix ? (vendorPrefix.toLowerCase() + 'AnimationEnd') : 'animationend webkitAnimationEnd';
  _$jscoverage['/navigation-view.js'].lineData[21]++;
  var uuid = 0;
  _$jscoverage['/navigation-view.js'].lineData[23]++;
  var NavigationViewRender = Container.getDefaultRender().extend([ContentRender], {
  createDom: function() {
  _$jscoverage['/navigation-view.js'].functionData[1]++;
  _$jscoverage['/navigation-view.js'].lineData[25]++;
  var self = this, control = self.control;
  _$jscoverage['/navigation-view.js'].lineData[27]++;
  var $loadingEl = $(S.substitute(LOADING_HTML, {
  prefixCls: self.control.get('prefixCls')}));
  _$jscoverage['/navigation-view.js'].lineData[30]++;
  control.get('contentEl').append($loadingEl);
  _$jscoverage['/navigation-view.js'].lineData[31]++;
  control.$loadingEl = $loadingEl;
  _$jscoverage['/navigation-view.js'].lineData[32]++;
  control.loadingEl = $loadingEl[0];
  _$jscoverage['/navigation-view.js'].lineData[33]++;
  $loadingEl.on(ANIMATION_END_EVENT, onAnimEnd($loadingEl[0]), control);
}});
  _$jscoverage['/navigation-view.js'].lineData[37]++;
  function getViewInstance(navigationView, config) {
    _$jscoverage['/navigation-view.js'].functionData[2]++;
    _$jscoverage['/navigation-view.js'].lineData[38]++;
    var children = navigationView.get('children');
    _$jscoverage['/navigation-view.js'].lineData[39]++;
    var viewId = config.viewId;
    _$jscoverage['/navigation-view.js'].lineData[40]++;
    for (var i = 0; visit1_40_1(i < children.length); i++) {
      _$jscoverage['/navigation-view.js'].lineData[41]++;
      if (visit2_41_1(children[i].constructor.xclass === config.xclass)) {
        _$jscoverage['/navigation-view.js'].lineData[42]++;
        if (visit3_42_1(viewId)) {
          _$jscoverage['/navigation-view.js'].lineData[43]++;
          if (visit4_43_1(children[i].get('viewId') === viewId)) {
            _$jscoverage['/navigation-view.js'].lineData[44]++;
            return children[i];
          }
        } else {
          _$jscoverage['/navigation-view.js'].lineData[47]++;
          return children[i];
        }
      }
    }
    _$jscoverage['/navigation-view.js'].lineData[51]++;
    return null;
  }
  _$jscoverage['/navigation-view.js'].lineData[54]++;
  function gc(navigationView) {
    _$jscoverage['/navigation-view.js'].functionData[3]++;
    _$jscoverage['/navigation-view.js'].lineData[55]++;
    var children = navigationView.get('children').concat();
    _$jscoverage['/navigation-view.js'].lineData[56]++;
    var viewCacheSize = navigationView.get('viewCacheSize');
    _$jscoverage['/navigation-view.js'].lineData[57]++;
    if (visit5_57_1(children.length <= viewCacheSize)) {
      _$jscoverage['/navigation-view.js'].lineData[58]++;
      return;
    }
    _$jscoverage['/navigation-view.js'].lineData[60]++;
    var removedSize = Math.floor(viewCacheSize / 3);
    _$jscoverage['/navigation-view.js'].lineData[61]++;
    children.sort(function(a, b) {
  _$jscoverage['/navigation-view.js'].functionData[4]++;
  _$jscoverage['/navigation-view.js'].lineData[62]++;
  return a.uuid - b.uuid;
});
    _$jscoverage['/navigation-view.js'].lineData[64]++;
    for (var i = 0; visit6_64_1(i < removedSize); i++) {
      _$jscoverage['/navigation-view.js'].lineData[65]++;
      navigationView.removeChild(children[i]);
    }
  }
  _$jscoverage['/navigation-view.js'].lineData[76]++;
  function getAnimCss(self, css, enter) {
    _$jscoverage['/navigation-view.js'].functionData[5]++;
    _$jscoverage['/navigation-view.js'].lineData[77]++;
    return self.view.getBaseCssClass('anim-' + css + '-' + (enter ? 'enter' : 'leave'));
  }
  _$jscoverage['/navigation-view.js'].lineData[80]++;
  function trimClassName(className) {
    _$jscoverage['/navigation-view.js'].functionData[6]++;
    _$jscoverage['/navigation-view.js'].lineData[81]++;
    return S.trim(className).replace(/\s+/, ' ');
  }
  _$jscoverage['/navigation-view.js'].lineData[90]++;
  function showAnimateEl(el, self, css) {
    _$jscoverage['/navigation-view.js'].functionData[7]++;
    _$jscoverage['/navigation-view.js'].lineData[91]++;
    var className = el.className, originalClassName = className;
    _$jscoverage['/navigation-view.js'].lineData[94]++;
    if (visit7_94_1(css)) {
      _$jscoverage['/navigation-view.js'].lineData[95]++;
      if (visit8_95_1(css.match(self.animateNoneEnterRegExp))) {
        _$jscoverage['/navigation-view.js'].lineData[96]++;
        css = '';
      } else {
        _$jscoverage['/navigation-view.js'].lineData[97]++;
        if (visit9_97_1(css.match(self.animateNoneLeaveRegExp))) {
          _$jscoverage['/navigation-view.js'].lineData[98]++;
          return hideAnimateEl(el, self);
        }
      }
    }
    _$jscoverage['/navigation-view.js'].lineData[102]++;
    if (visit10_102_1(className.match(self.animateClassRegExp))) {
      _$jscoverage['/navigation-view.js'].lineData[103]++;
      className = className.replace(self.animateClassRegExp, '');
    }
    _$jscoverage['/navigation-view.js'].lineData[106]++;
    if (visit11_106_1(css)) {
      _$jscoverage['/navigation-view.js'].lineData[107]++;
      className += ' ' + css;
      _$jscoverage['/navigation-view.js'].lineData[108]++;
      className += ' ' + self.animingClass;
    }
    _$jscoverage['/navigation-view.js'].lineData[111]++;
    if (visit12_111_1(className.indexOf(self.showViewClass) === -1)) {
      _$jscoverage['/navigation-view.js'].lineData[112]++;
      className += ' ' + self.showViewClass;
    }
    _$jscoverage['/navigation-view.js'].lineData[115]++;
    if (visit13_115_1(className !== originalClassName)) {
      _$jscoverage['/navigation-view.js'].lineData[116]++;
      el.className = trimClassName(className);
    }
    _$jscoverage['/navigation-view.js'].lineData[118]++;
    return undefined;
  }
  _$jscoverage['/navigation-view.js'].lineData[121]++;
  function hideAnimateEl(el, self) {
    _$jscoverage['/navigation-view.js'].functionData[8]++;
    _$jscoverage['/navigation-view.js'].lineData[122]++;
    var className = el.className, originalClassName = className;
    _$jscoverage['/navigation-view.js'].lineData[125]++;
    className = className.replace(self.animateClassRegExp, '').replace(self.showViewClass, '');
    _$jscoverage['/navigation-view.js'].lineData[128]++;
    if (visit14_128_1(className !== originalClassName)) {
      _$jscoverage['/navigation-view.js'].lineData[129]++;
      el.className = trimClassName(className);
    }
  }
  _$jscoverage['/navigation-view.js'].lineData[133]++;
  function postProcessSwitchView(self, oldView, newView, backward) {
    _$jscoverage['/navigation-view.js'].functionData[9]++;
    _$jscoverage['/navigation-view.js'].lineData[134]++;
    var promise = newView.promise;
    _$jscoverage['/navigation-view.js'].lineData[136]++;
    gc(self);
    _$jscoverage['/navigation-view.js'].lineData[138]++;
    if (visit15_138_1(promise)) {
      _$jscoverage['/navigation-view.js'].lineData[139]++;
      promise.then(function() {
  _$jscoverage['/navigation-view.js'].functionData[10]++;
  _$jscoverage['/navigation-view.js'].lineData[140]++;
  var activeView = self.get('activeView');
  _$jscoverage['/navigation-view.js'].lineData[141]++;
  if (visit16_141_1(activeView && visit17_141_2(activeView.uuid === newView.uuid))) {
    _$jscoverage['/navigation-view.js'].lineData[142]++;
    self.fire('afterInnerViewChange', {
  oldView: oldView, 
  newView: newView, 
  backward: backward});
    _$jscoverage['/navigation-view.js'].lineData[147]++;
    hideAnimateEl(self.loadingEl, self);
    _$jscoverage['/navigation-view.js'].lineData[148]++;
    showAnimateEl(newView.el, self);
  }
});
    } else {
      _$jscoverage['/navigation-view.js'].lineData[152]++;
      self.fire('afterInnerViewChange', {
  oldView: oldView, 
  newView: newView, 
  backward: backward});
    }
  }
  _$jscoverage['/navigation-view.js'].lineData[160]++;
  function processSwitchView(self, config, oldView, newView, enterAnimCssClass, leaveAnimCssClass, backward) {
    _$jscoverage['/navigation-view.js'].functionData[11]++;
    _$jscoverage['/navigation-view.js'].lineData[161]++;
    var loadingEl = self.loadingEl;
    _$jscoverage['/navigation-view.js'].lineData[162]++;
    if (visit18_162_1(oldView)) {
      _$jscoverage['/navigation-view.js'].lineData[163]++;
      if (visit19_163_1(oldView.leave)) {
        _$jscoverage['/navigation-view.js'].lineData[164]++;
        oldView.leave();
      }
      _$jscoverage['/navigation-view.js'].lineData[166]++;
      oldView.fire('leave');
    }
    _$jscoverage['/navigation-view.js'].lineData[168]++;
    var newViewEl = newView.el;
    _$jscoverage['/navigation-view.js'].lineData[169]++;
    newView.set(config);
    _$jscoverage['/navigation-view.js'].lineData[171]++;
    self.set('activeView', newView);
    _$jscoverage['/navigation-view.js'].lineData[173]++;
    if (visit20_173_1(newView)) {
      _$jscoverage['/navigation-view.js'].lineData[174]++;
      if (visit21_174_1(newView.enter)) {
        _$jscoverage['/navigation-view.js'].lineData[175]++;
        newView.enter();
      }
      _$jscoverage['/navigation-view.js'].lineData[177]++;
      newView.fire('enter');
    }
    _$jscoverage['/navigation-view.js'].lineData[180]++;
    self.fire('beforeInnerViewChange', {
  oldView: oldView, 
  newView: newView, 
  backward: backward});
    _$jscoverage['/navigation-view.js'].lineData[186]++;
    var promise = newView.promise;
    _$jscoverage['/navigation-view.js'].lineData[188]++;
    if (visit22_188_1(oldView)) {
      _$jscoverage['/navigation-view.js'].lineData[189]++;
      showAnimateEl(oldView.el, self, leaveAnimCssClass);
    }
    _$jscoverage['/navigation-view.js'].lineData[192]++;
    if (visit23_192_1(promise)) {
      _$jscoverage['/navigation-view.js'].lineData[193]++;
      if (visit24_193_1(oldView)) {
        _$jscoverage['/navigation-view.js'].lineData[194]++;
        showAnimateEl(loadingEl, self, enterAnimCssClass);
      } else {
        _$jscoverage['/navigation-view.js'].lineData[197]++;
        showAnimateEl(loadingEl, self);
      }
      _$jscoverage['/navigation-view.js'].lineData[200]++;
      hideAnimateEl(newViewEl, self);
    } else {
      _$jscoverage['/navigation-view.js'].lineData[203]++;
      if (visit25_203_1(self.$loadingEl.hasClass(self.showViewClass) && oldView)) {
        _$jscoverage['/navigation-view.js'].lineData[204]++;
        showAnimateEl(loadingEl, self, leaveAnimCssClass);
      }
      _$jscoverage['/navigation-view.js'].lineData[206]++;
      showAnimateEl(newViewEl, self, enterAnimCssClass);
    }
  }
  _$jscoverage['/navigation-view.js'].lineData[210]++;
  function isEnterCss(css, self) {
    _$jscoverage['/navigation-view.js'].functionData[12]++;
    _$jscoverage['/navigation-view.js'].lineData[211]++;
    return css.match(self.animateEnterRegExp);
  }
  _$jscoverage['/navigation-view.js'].lineData[214]++;
  function isLeaveCss(css, self) {
    _$jscoverage['/navigation-view.js'].functionData[13]++;
    _$jscoverage['/navigation-view.js'].lineData[215]++;
    return css.match(self.animateLeaveRegExp);
  }
  _$jscoverage['/navigation-view.js'].lineData[218]++;
  function onAnimEnd(el) {
    _$jscoverage['/navigation-view.js'].functionData[14]++;
    _$jscoverage['/navigation-view.js'].lineData[219]++;
    return function() {
  _$jscoverage['/navigation-view.js'].functionData[15]++;
  _$jscoverage['/navigation-view.js'].lineData[220]++;
  animEndEl.call(this, el);
};
  }
  _$jscoverage['/navigation-view.js'].lineData[224]++;
  function animEndEl(el) {
    _$jscoverage['/navigation-view.js'].functionData[16]++;
    _$jscoverage['/navigation-view.js'].lineData[225]++;
    var self = this;
    _$jscoverage['/navigation-view.js'].lineData[226]++;
    var className = el.className;
    _$jscoverage['/navigation-view.js'].lineData[227]++;
    if (visit26_227_1(isEnterCss(className, self))) {
      _$jscoverage['/navigation-view.js'].lineData[228]++;
      showAnimateEl(el, self);
    } else {
      _$jscoverage['/navigation-view.js'].lineData[229]++;
      if (visit27_229_1(isLeaveCss(className, self))) {
        _$jscoverage['/navigation-view.js'].lineData[230]++;
        hideAnimateEl(el, self);
      }
    }
  }
  _$jscoverage['/navigation-view.js'].lineData[234]++;
  return Container.extend({
  createDom: function() {
  _$jscoverage['/navigation-view.js'].functionData[17]++;
  _$jscoverage['/navigation-view.js'].lineData[236]++;
  var self = this;
  _$jscoverage['/navigation-view.js'].lineData[237]++;
  self.animateClassRegExp = new RegExp(self.view.getBaseCssClass() + '-anim-[^\\s]+', 'g');
  _$jscoverage['/navigation-view.js'].lineData[238]++;
  self.animateEnterRegExp = new RegExp('-enter(?:\\s|$)');
  _$jscoverage['/navigation-view.js'].lineData[239]++;
  self.animateLeaveRegExp = new RegExp('-leave(?:\\s|$)');
  _$jscoverage['/navigation-view.js'].lineData[240]++;
  self.animateNoneEnterRegExp = new RegExp('none-enter(?:\\s|$)');
  _$jscoverage['/navigation-view.js'].lineData[241]++;
  self.animateNoneLeaveRegExp = new RegExp('none-leave(?:\\s|$)');
  _$jscoverage['/navigation-view.js'].lineData[242]++;
  self.animingClass = self.view.getBaseCssClass() + '-anim-ing';
  _$jscoverage['/navigation-view.js'].lineData[243]++;
  self.showViewClass = self.view.getBaseCssClass('show-view');
  _$jscoverage['/navigation-view.js'].lineData[244]++;
  self.viewStack = [];
}, 
  createView: function(config) {
  _$jscoverage['/navigation-view.js'].functionData[18]++;
  _$jscoverage['/navigation-view.js'].lineData[253]++;
  var self = this;
  _$jscoverage['/navigation-view.js'].lineData[254]++;
  var nextView = getViewInstance(self, config);
  _$jscoverage['/navigation-view.js'].lineData[255]++;
  var nextViewEl;
  _$jscoverage['/navigation-view.js'].lineData[256]++;
  if (visit28_256_1(!nextView)) {
    _$jscoverage['/navigation-view.js'].lineData[257]++;
    nextView = self.addChild(config);
    _$jscoverage['/navigation-view.js'].lineData[258]++;
    nextViewEl = nextView.get('el');
    _$jscoverage['/navigation-view.js'].lineData[259]++;
    nextViewEl.on(ANIMATION_END_EVENT, onAnimEnd(nextViewEl[0]), self);
  }
  _$jscoverage['/navigation-view.js'].lineData[261]++;
  return nextView;
}, 
  push: function(config) {
  _$jscoverage['/navigation-view.js'].functionData[19]++;
  _$jscoverage['/navigation-view.js'].lineData[265]++;
  var self = this, nextView, animation, enterAnimation, leaveAnimation, enterAnimCssClass, leaveAnimCssClass, activeView, viewStack = self.viewStack, activeViewConfig = viewStack[viewStack.length - 1];
  _$jscoverage['/navigation-view.js'].lineData[276]++;
  activeView = self.get('activeView');
  _$jscoverage['/navigation-view.js'].lineData[278]++;
  if (visit29_278_1(activeView)) {
    _$jscoverage['/navigation-view.js'].lineData[279]++;
    config.animation = visit30_279_1(config.animation || self.get('animation'));
  } else {
    _$jscoverage['/navigation-view.js'].lineData[282]++;
    config.animation = {};
  }
  _$jscoverage['/navigation-view.js'].lineData[285]++;
  animation = config.animation;
  _$jscoverage['/navigation-view.js'].lineData[286]++;
  nextView = self.createView(config);
  _$jscoverage['/navigation-view.js'].lineData[287]++;
  nextView.uuid = uuid++;
  _$jscoverage['/navigation-view.js'].lineData[288]++;
  viewStack.push(config);
  _$jscoverage['/navigation-view.js'].lineData[289]++;
  enterAnimation = animation.enter;
  _$jscoverage['/navigation-view.js'].lineData[290]++;
  leaveAnimation = animation.leave;
  _$jscoverage['/navigation-view.js'].lineData[291]++;
  if (visit31_291_1(activeView)) {
    _$jscoverage['/navigation-view.js'].lineData[292]++;
    leaveAnimation = visit32_292_1(activeViewConfig.animation.leave || leaveAnimation);
  }
  _$jscoverage['/navigation-view.js'].lineData[295]++;
  enterAnimCssClass = visit33_295_1(visit34_295_2(enterAnimation && getAnimCss(self, enterAnimation, true)) || '');
  _$jscoverage['/navigation-view.js'].lineData[296]++;
  leaveAnimCssClass = getAnimCss(self, leaveAnimation);
  _$jscoverage['/navigation-view.js'].lineData[298]++;
  processSwitchView(self, config, activeView, nextView, enterAnimCssClass, leaveAnimCssClass);
  _$jscoverage['/navigation-view.js'].lineData[300]++;
  postProcessSwitchView(self, activeView, nextView);
}, 
  replace: function(config) {
  _$jscoverage['/navigation-view.js'].functionData[20]++;
  _$jscoverage['/navigation-view.js'].lineData[304]++;
  var self = this, viewStack = self.viewStack;
  _$jscoverage['/navigation-view.js'].lineData[306]++;
  S.mix(viewStack[viewStack.length - 1], config);
}, 
  pop: function(config) {
  _$jscoverage['/navigation-view.js'].functionData[21]++;
  _$jscoverage['/navigation-view.js'].lineData[310]++;
  var self = this, activeView, nextView, enterAnimCssClass, leaveAnimCssClass, activeViewConfig, viewStack = self.viewStack;
  _$jscoverage['/navigation-view.js'].lineData[318]++;
  if (visit35_318_1(viewStack.length > 1)) {
    _$jscoverage['/navigation-view.js'].lineData[319]++;
    activeViewConfig = viewStack[viewStack.length - 1];
    _$jscoverage['/navigation-view.js'].lineData[320]++;
    viewStack.pop();
    _$jscoverage['/navigation-view.js'].lineData[321]++;
    activeView = self.get('activeView');
    _$jscoverage['/navigation-view.js'].lineData[322]++;
    config = viewStack[viewStack.length - 1];
    _$jscoverage['/navigation-view.js'].lineData[324]++;
    nextView = self.createView(config);
    _$jscoverage['/navigation-view.js'].lineData[325]++;
    nextView.uuid = uuid++;
    _$jscoverage['/navigation-view.js'].lineData[326]++;
    enterAnimCssClass = getAnimCss(self, visit36_326_1(config.animation.leave || activeViewConfig.animation.leave), true);
    _$jscoverage['/navigation-view.js'].lineData[327]++;
    leaveAnimCssClass = getAnimCss(self, activeViewConfig.animation.enter);
    _$jscoverage['/navigation-view.js'].lineData[329]++;
    processSwitchView(self, config, activeView, nextView, enterAnimCssClass, leaveAnimCssClass, true);
    _$jscoverage['/navigation-view.js'].lineData[331]++;
    postProcessSwitchView(self, activeView, nextView, true);
  }
}}, {
  xclass: 'navigation-view', 
  ATTRS: {
  animation: {
  value: {
  'enter': 'slide-right', 
  'leave': 'slide-left'}}, 
  handleGestureEvents: {
  value: false}, 
  viewCacheSize: {
  value: 20}, 
  focusable: {
  value: false}, 
  allowTextSelection: {
  value: true}, 
  xrender: {
  value: NavigationViewRender}, 
  contentTpl: {
  value: ContentTpl}, 
  defaultChildCfg: {
  value: {
  handleGestureEvents: false, 
  allowTextSelection: true}}}});
});
