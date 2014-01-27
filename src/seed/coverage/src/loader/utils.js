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
if (! _$jscoverage['/loader/utils.js']) {
  _$jscoverage['/loader/utils.js'] = {};
  _$jscoverage['/loader/utils.js'].lineData = [];
  _$jscoverage['/loader/utils.js'].lineData[6] = 0;
  _$jscoverage['/loader/utils.js'].lineData[7] = 0;
  _$jscoverage['/loader/utils.js'].lineData[30] = 0;
  _$jscoverage['/loader/utils.js'].lineData[31] = 0;
  _$jscoverage['/loader/utils.js'].lineData[32] = 0;
  _$jscoverage['/loader/utils.js'].lineData[34] = 0;
  _$jscoverage['/loader/utils.js'].lineData[37] = 0;
  _$jscoverage['/loader/utils.js'].lineData[38] = 0;
  _$jscoverage['/loader/utils.js'].lineData[40] = 0;
  _$jscoverage['/loader/utils.js'].lineData[44] = 0;
  _$jscoverage['/loader/utils.js'].lineData[46] = 0;
  _$jscoverage['/loader/utils.js'].lineData[47] = 0;
  _$jscoverage['/loader/utils.js'].lineData[49] = 0;
  _$jscoverage['/loader/utils.js'].lineData[50] = 0;
  _$jscoverage['/loader/utils.js'].lineData[52] = 0;
  _$jscoverage['/loader/utils.js'].lineData[55] = 0;
  _$jscoverage['/loader/utils.js'].lineData[56] = 0;
  _$jscoverage['/loader/utils.js'].lineData[57] = 0;
  _$jscoverage['/loader/utils.js'].lineData[58] = 0;
  _$jscoverage['/loader/utils.js'].lineData[59] = 0;
  _$jscoverage['/loader/utils.js'].lineData[60] = 0;
  _$jscoverage['/loader/utils.js'].lineData[63] = 0;
  _$jscoverage['/loader/utils.js'].lineData[65] = 0;
  _$jscoverage['/loader/utils.js'].lineData[70] = 0;
  _$jscoverage['/loader/utils.js'].lineData[73] = 0;
  _$jscoverage['/loader/utils.js'].lineData[79] = 0;
  _$jscoverage['/loader/utils.js'].lineData[89] = 0;
  _$jscoverage['/loader/utils.js'].lineData[91] = 0;
  _$jscoverage['/loader/utils.js'].lineData[92] = 0;
  _$jscoverage['/loader/utils.js'].lineData[95] = 0;
  _$jscoverage['/loader/utils.js'].lineData[96] = 0;
  _$jscoverage['/loader/utils.js'].lineData[98] = 0;
  _$jscoverage['/loader/utils.js'].lineData[101] = 0;
  _$jscoverage['/loader/utils.js'].lineData[104] = 0;
  _$jscoverage['/loader/utils.js'].lineData[105] = 0;
  _$jscoverage['/loader/utils.js'].lineData[107] = 0;
  _$jscoverage['/loader/utils.js'].lineData[116] = 0;
  _$jscoverage['/loader/utils.js'].lineData[117] = 0;
  _$jscoverage['/loader/utils.js'].lineData[129] = 0;
  _$jscoverage['/loader/utils.js'].lineData[131] = 0;
  _$jscoverage['/loader/utils.js'].lineData[134] = 0;
  _$jscoverage['/loader/utils.js'].lineData[135] = 0;
  _$jscoverage['/loader/utils.js'].lineData[139] = 0;
  _$jscoverage['/loader/utils.js'].lineData[144] = 0;
  _$jscoverage['/loader/utils.js'].lineData[154] = 0;
  _$jscoverage['/loader/utils.js'].lineData[160] = 0;
  _$jscoverage['/loader/utils.js'].lineData[161] = 0;
  _$jscoverage['/loader/utils.js'].lineData[162] = 0;
  _$jscoverage['/loader/utils.js'].lineData[163] = 0;
  _$jscoverage['/loader/utils.js'].lineData[164] = 0;
  _$jscoverage['/loader/utils.js'].lineData[165] = 0;
  _$jscoverage['/loader/utils.js'].lineData[167] = 0;
  _$jscoverage['/loader/utils.js'].lineData[169] = 0;
  _$jscoverage['/loader/utils.js'].lineData[170] = 0;
  _$jscoverage['/loader/utils.js'].lineData[172] = 0;
  _$jscoverage['/loader/utils.js'].lineData[175] = 0;
  _$jscoverage['/loader/utils.js'].lineData[179] = 0;
  _$jscoverage['/loader/utils.js'].lineData[188] = 0;
  _$jscoverage['/loader/utils.js'].lineData[190] = 0;
  _$jscoverage['/loader/utils.js'].lineData[191] = 0;
  _$jscoverage['/loader/utils.js'].lineData[197] = 0;
  _$jscoverage['/loader/utils.js'].lineData[199] = 0;
  _$jscoverage['/loader/utils.js'].lineData[200] = 0;
  _$jscoverage['/loader/utils.js'].lineData[204] = 0;
  _$jscoverage['/loader/utils.js'].lineData[205] = 0;
  _$jscoverage['/loader/utils.js'].lineData[206] = 0;
  _$jscoverage['/loader/utils.js'].lineData[208] = 0;
  _$jscoverage['/loader/utils.js'].lineData[209] = 0;
  _$jscoverage['/loader/utils.js'].lineData[211] = 0;
  _$jscoverage['/loader/utils.js'].lineData[215] = 0;
  _$jscoverage['/loader/utils.js'].lineData[218] = 0;
  _$jscoverage['/loader/utils.js'].lineData[219] = 0;
  _$jscoverage['/loader/utils.js'].lineData[221] = 0;
  _$jscoverage['/loader/utils.js'].lineData[222] = 0;
  _$jscoverage['/loader/utils.js'].lineData[223] = 0;
  _$jscoverage['/loader/utils.js'].lineData[225] = 0;
  _$jscoverage['/loader/utils.js'].lineData[226] = 0;
  _$jscoverage['/loader/utils.js'].lineData[227] = 0;
  _$jscoverage['/loader/utils.js'].lineData[228] = 0;
  _$jscoverage['/loader/utils.js'].lineData[229] = 0;
  _$jscoverage['/loader/utils.js'].lineData[231] = 0;
  _$jscoverage['/loader/utils.js'].lineData[232] = 0;
  _$jscoverage['/loader/utils.js'].lineData[233] = 0;
  _$jscoverage['/loader/utils.js'].lineData[235] = 0;
  _$jscoverage['/loader/utils.js'].lineData[236] = 0;
  _$jscoverage['/loader/utils.js'].lineData[237] = 0;
  _$jscoverage['/loader/utils.js'].lineData[239] = 0;
  _$jscoverage['/loader/utils.js'].lineData[240] = 0;
  _$jscoverage['/loader/utils.js'].lineData[241] = 0;
  _$jscoverage['/loader/utils.js'].lineData[243] = 0;
  _$jscoverage['/loader/utils.js'].lineData[246] = 0;
  _$jscoverage['/loader/utils.js'].lineData[247] = 0;
  _$jscoverage['/loader/utils.js'].lineData[248] = 0;
  _$jscoverage['/loader/utils.js'].lineData[251] = 0;
  _$jscoverage['/loader/utils.js'].lineData[254] = 0;
  _$jscoverage['/loader/utils.js'].lineData[256] = 0;
  _$jscoverage['/loader/utils.js'].lineData[257] = 0;
  _$jscoverage['/loader/utils.js'].lineData[258] = 0;
  _$jscoverage['/loader/utils.js'].lineData[261] = 0;
  _$jscoverage['/loader/utils.js'].lineData[262] = 0;
  _$jscoverage['/loader/utils.js'].lineData[271] = 0;
  _$jscoverage['/loader/utils.js'].lineData[274] = 0;
  _$jscoverage['/loader/utils.js'].lineData[276] = 0;
  _$jscoverage['/loader/utils.js'].lineData[277] = 0;
  _$jscoverage['/loader/utils.js'].lineData[279] = 0;
  _$jscoverage['/loader/utils.js'].lineData[280] = 0;
  _$jscoverage['/loader/utils.js'].lineData[282] = 0;
  _$jscoverage['/loader/utils.js'].lineData[284] = 0;
  _$jscoverage['/loader/utils.js'].lineData[285] = 0;
  _$jscoverage['/loader/utils.js'].lineData[295] = 0;
  _$jscoverage['/loader/utils.js'].lineData[298] = 0;
  _$jscoverage['/loader/utils.js'].lineData[301] = 0;
  _$jscoverage['/loader/utils.js'].lineData[302] = 0;
  _$jscoverage['/loader/utils.js'].lineData[303] = 0;
  _$jscoverage['/loader/utils.js'].lineData[308] = 0;
  _$jscoverage['/loader/utils.js'].lineData[312] = 0;
  _$jscoverage['/loader/utils.js'].lineData[314] = 0;
  _$jscoverage['/loader/utils.js'].lineData[318] = 0;
  _$jscoverage['/loader/utils.js'].lineData[321] = 0;
  _$jscoverage['/loader/utils.js'].lineData[330] = 0;
  _$jscoverage['/loader/utils.js'].lineData[331] = 0;
  _$jscoverage['/loader/utils.js'].lineData[333] = 0;
  _$jscoverage['/loader/utils.js'].lineData[348] = 0;
  _$jscoverage['/loader/utils.js'].lineData[359] = 0;
  _$jscoverage['/loader/utils.js'].lineData[365] = 0;
  _$jscoverage['/loader/utils.js'].lineData[366] = 0;
  _$jscoverage['/loader/utils.js'].lineData[367] = 0;
  _$jscoverage['/loader/utils.js'].lineData[368] = 0;
  _$jscoverage['/loader/utils.js'].lineData[369] = 0;
  _$jscoverage['/loader/utils.js'].lineData[370] = 0;
  _$jscoverage['/loader/utils.js'].lineData[371] = 0;
  _$jscoverage['/loader/utils.js'].lineData[373] = 0;
  _$jscoverage['/loader/utils.js'].lineData[374] = 0;
  _$jscoverage['/loader/utils.js'].lineData[375] = 0;
  _$jscoverage['/loader/utils.js'].lineData[378] = 0;
  _$jscoverage['/loader/utils.js'].lineData[382] = 0;
  _$jscoverage['/loader/utils.js'].lineData[393] = 0;
  _$jscoverage['/loader/utils.js'].lineData[394] = 0;
  _$jscoverage['/loader/utils.js'].lineData[396] = 0;
  _$jscoverage['/loader/utils.js'].lineData[399] = 0;
  _$jscoverage['/loader/utils.js'].lineData[400] = 0;
  _$jscoverage['/loader/utils.js'].lineData[405] = 0;
  _$jscoverage['/loader/utils.js'].lineData[406] = 0;
  _$jscoverage['/loader/utils.js'].lineData[408] = 0;
  _$jscoverage['/loader/utils.js'].lineData[419] = 0;
  _$jscoverage['/loader/utils.js'].lineData[421] = 0;
  _$jscoverage['/loader/utils.js'].lineData[424] = 0;
  _$jscoverage['/loader/utils.js'].lineData[425] = 0;
  _$jscoverage['/loader/utils.js'].lineData[426] = 0;
  _$jscoverage['/loader/utils.js'].lineData[430] = 0;
  _$jscoverage['/loader/utils.js'].lineData[432] = 0;
  _$jscoverage['/loader/utils.js'].lineData[436] = 0;
  _$jscoverage['/loader/utils.js'].lineData[442] = 0;
  _$jscoverage['/loader/utils.js'].lineData[451] = 0;
  _$jscoverage['/loader/utils.js'].lineData[453] = 0;
  _$jscoverage['/loader/utils.js'].lineData[454] = 0;
  _$jscoverage['/loader/utils.js'].lineData[457] = 0;
  _$jscoverage['/loader/utils.js'].lineData[461] = 0;
  _$jscoverage['/loader/utils.js'].lineData[467] = 0;
  _$jscoverage['/loader/utils.js'].lineData[468] = 0;
  _$jscoverage['/loader/utils.js'].lineData[470] = 0;
  _$jscoverage['/loader/utils.js'].lineData[474] = 0;
  _$jscoverage['/loader/utils.js'].lineData[477] = 0;
  _$jscoverage['/loader/utils.js'].lineData[478] = 0;
  _$jscoverage['/loader/utils.js'].lineData[480] = 0;
  _$jscoverage['/loader/utils.js'].lineData[481] = 0;
  _$jscoverage['/loader/utils.js'].lineData[483] = 0;
}
if (! _$jscoverage['/loader/utils.js'].functionData) {
  _$jscoverage['/loader/utils.js'].functionData = [];
  _$jscoverage['/loader/utils.js'].functionData[0] = 0;
  _$jscoverage['/loader/utils.js'].functionData[1] = 0;
  _$jscoverage['/loader/utils.js'].functionData[2] = 0;
  _$jscoverage['/loader/utils.js'].functionData[3] = 0;
  _$jscoverage['/loader/utils.js'].functionData[4] = 0;
  _$jscoverage['/loader/utils.js'].functionData[5] = 0;
  _$jscoverage['/loader/utils.js'].functionData[6] = 0;
  _$jscoverage['/loader/utils.js'].functionData[7] = 0;
  _$jscoverage['/loader/utils.js'].functionData[8] = 0;
  _$jscoverage['/loader/utils.js'].functionData[9] = 0;
  _$jscoverage['/loader/utils.js'].functionData[10] = 0;
  _$jscoverage['/loader/utils.js'].functionData[11] = 0;
  _$jscoverage['/loader/utils.js'].functionData[12] = 0;
  _$jscoverage['/loader/utils.js'].functionData[13] = 0;
  _$jscoverage['/loader/utils.js'].functionData[14] = 0;
  _$jscoverage['/loader/utils.js'].functionData[15] = 0;
  _$jscoverage['/loader/utils.js'].functionData[16] = 0;
  _$jscoverage['/loader/utils.js'].functionData[17] = 0;
  _$jscoverage['/loader/utils.js'].functionData[18] = 0;
  _$jscoverage['/loader/utils.js'].functionData[19] = 0;
  _$jscoverage['/loader/utils.js'].functionData[20] = 0;
  _$jscoverage['/loader/utils.js'].functionData[21] = 0;
  _$jscoverage['/loader/utils.js'].functionData[22] = 0;
  _$jscoverage['/loader/utils.js'].functionData[23] = 0;
  _$jscoverage['/loader/utils.js'].functionData[24] = 0;
  _$jscoverage['/loader/utils.js'].functionData[25] = 0;
  _$jscoverage['/loader/utils.js'].functionData[26] = 0;
}
if (! _$jscoverage['/loader/utils.js'].branchData) {
  _$jscoverage['/loader/utils.js'].branchData = {};
  _$jscoverage['/loader/utils.js'].branchData['31'] = [];
  _$jscoverage['/loader/utils.js'].branchData['31'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['37'] = [];
  _$jscoverage['/loader/utils.js'].branchData['37'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['46'] = [];
  _$jscoverage['/loader/utils.js'].branchData['46'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['49'] = [];
  _$jscoverage['/loader/utils.js'].branchData['49'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['57'] = [];
  _$jscoverage['/loader/utils.js'].branchData['57'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['63'] = [];
  _$jscoverage['/loader/utils.js'].branchData['63'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['79'] = [];
  _$jscoverage['/loader/utils.js'].branchData['79'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['91'] = [];
  _$jscoverage['/loader/utils.js'].branchData['91'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['95'] = [];
  _$jscoverage['/loader/utils.js'].branchData['95'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['96'] = [];
  _$jscoverage['/loader/utils.js'].branchData['96'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['104'] = [];
  _$jscoverage['/loader/utils.js'].branchData['104'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['134'] = [];
  _$jscoverage['/loader/utils.js'].branchData['134'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['162'] = [];
  _$jscoverage['/loader/utils.js'].branchData['162'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['162'][2] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['167'] = [];
  _$jscoverage['/loader/utils.js'].branchData['167'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['167'][2] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['167'][3] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['169'] = [];
  _$jscoverage['/loader/utils.js'].branchData['169'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['190'] = [];
  _$jscoverage['/loader/utils.js'].branchData['190'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['197'] = [];
  _$jscoverage['/loader/utils.js'].branchData['197'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['199'] = [];
  _$jscoverage['/loader/utils.js'].branchData['199'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['204'] = [];
  _$jscoverage['/loader/utils.js'].branchData['204'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['205'] = [];
  _$jscoverage['/loader/utils.js'].branchData['205'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['218'] = [];
  _$jscoverage['/loader/utils.js'].branchData['218'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['221'] = [];
  _$jscoverage['/loader/utils.js'].branchData['221'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['226'] = [];
  _$jscoverage['/loader/utils.js'].branchData['226'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['231'] = [];
  _$jscoverage['/loader/utils.js'].branchData['231'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['235'] = [];
  _$jscoverage['/loader/utils.js'].branchData['235'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['239'] = [];
  _$jscoverage['/loader/utils.js'].branchData['239'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['240'] = [];
  _$jscoverage['/loader/utils.js'].branchData['240'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['246'] = [];
  _$jscoverage['/loader/utils.js'].branchData['246'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['254'] = [];
  _$jscoverage['/loader/utils.js'].branchData['254'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['276'] = [];
  _$jscoverage['/loader/utils.js'].branchData['276'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['280'] = [];
  _$jscoverage['/loader/utils.js'].branchData['280'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['298'] = [];
  _$jscoverage['/loader/utils.js'].branchData['298'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['302'] = [];
  _$jscoverage['/loader/utils.js'].branchData['302'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['302'][2] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['312'] = [];
  _$jscoverage['/loader/utils.js'].branchData['312'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['330'] = [];
  _$jscoverage['/loader/utils.js'].branchData['330'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['367'] = [];
  _$jscoverage['/loader/utils.js'].branchData['367'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['368'] = [];
  _$jscoverage['/loader/utils.js'].branchData['368'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['368'][2] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['370'] = [];
  _$jscoverage['/loader/utils.js'].branchData['370'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['373'] = [];
  _$jscoverage['/loader/utils.js'].branchData['373'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['374'] = [];
  _$jscoverage['/loader/utils.js'].branchData['374'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['394'] = [];
  _$jscoverage['/loader/utils.js'].branchData['394'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['396'] = [];
  _$jscoverage['/loader/utils.js'].branchData['396'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['399'] = [];
  _$jscoverage['/loader/utils.js'].branchData['399'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['405'] = [];
  _$jscoverage['/loader/utils.js'].branchData['405'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['424'] = [];
  _$jscoverage['/loader/utils.js'].branchData['424'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['424'][2] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['453'] = [];
  _$jscoverage['/loader/utils.js'].branchData['453'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['480'] = [];
  _$jscoverage['/loader/utils.js'].branchData['480'][1] = new BranchData();
}
_$jscoverage['/loader/utils.js'].branchData['480'][1].init(56, 46, '!(m = str.match(/^\\s*["\']([^\'"\\s]+)["\']\\s*$/))');
function visit539_480_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['480'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['453'][1].init(85, 8, '--i > -1');
function visit538_453_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['453'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['424'][2].init(170, 28, 'module.factory !== undefined');
function visit537_424_2(result) {
  _$jscoverage['/loader/utils.js'].branchData['424'][2].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['424'][1].init(160, 38, 'module && module.factory !== undefined');
function visit536_424_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['424'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['405'][1].init(536, 10, 'refModName');
function visit535_405_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['405'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['399'][1].init(143, 11, 'modNames[i]');
function visit534_399_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['399'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['396'][1].init(84, 5, 'i < l');
function visit533_396_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['396'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['394'][1].init(51, 8, 'modNames');
function visit532_394_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['394'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['374'][1].init(34, 9, '!alias[j]');
function visit531_374_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['374'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['373'][1].init(217, 6, 'j >= 0');
function visit530_373_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['373'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['370'][1].init(63, 25, 'typeof alias === \'string\'');
function visit529_370_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['370'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['368'][2].init(77, 35, '(alias = m.getAlias()) !== undefined');
function visit528_368_2(result) {
  _$jscoverage['/loader/utils.js'].branchData['368'][2].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['368'][1].init(27, 86, '(m = Utils.createModuleInfo(runtime, ret[i])) && ((alias = m.getAlias()) !== undefined)');
function visit527_368_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['368'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['367'][1].init(68, 6, 'i >= 0');
function visit526_367_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['367'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['330'][1].init(18, 28, 'typeof modNames === \'string\'');
function visit525_330_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['330'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['312'][1].init(737, 21, 'exports !== undefined');
function visit524_312_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['312'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['302'][2].init(172, 36, 'module.requires.length && module.cjs');
function visit523_302_2(result) {
  _$jscoverage['/loader/utils.js'].branchData['302'][2].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['302'][1].init(153, 55, 'module.requires && module.requires.length && module.cjs');
function visit522_302_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['302'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['298'][1].init(89, 29, 'typeof factory === \'function\'');
function visit521_298_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['298'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['280'][1].init(316, 5, 'm.cjs');
function visit520_280_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['280'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['276'][1].init(201, 19, 'status >= ATTACHING');
function visit519_276_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['276'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['254'][1].init(1249, 108, 'Utils.checkModsLoadRecursively(m.getNormalizedRequires(), runtime, stack, errorList, cache)');
function visit518_254_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['254'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['246'][1].init(1027, 14, 'stack[modName]');
function visit517_246_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['246'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['240'][1].init(22, 14, 'stack[modName]');
function visit516_240_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['240'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['239'][1].init(771, 9, '\'@DEBUG@\'');
function visit515_239_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['239'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['235'][1].init(646, 17, 'status !== LOADED');
function visit514_235_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['235'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['231'][1].init(515, 25, 'status >= READY_TO_ATTACH');
function visit513_231_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['231'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['226'][1].init(355, 16, 'status === ERROR');
function visit512_226_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['226'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['221'][1].init(213, 2, '!m');
function visit511_221_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['221'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['218'][1].init(121, 16, 'modName in cache');
function visit510_218_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['218'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['205'][1].init(22, 2, '!s');
function visit509_205_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['205'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['204'][1].init(340, 5, 'i < l');
function visit508_204_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['204'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['199'][1].init(176, 11, 'cache || {}');
function visit507_199_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['199'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['197'][1].init(77, 11, 'stack || []');
function visit506_197_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['197'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['190'][1].init(84, 5, 'i < l');
function visit505_190_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['190'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['169'][1].init(367, 5, 'allOk');
function visit504_169_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['169'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['167'][3].init(159, 21, 'm.status >= ATTACHING');
function visit503_167_3(result) {
  _$jscoverage['/loader/utils.js'].branchData['167'][3].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['167'][2].init(154, 26, 'm && m.status >= ATTACHING');
function visit502_167_2(result) {
  _$jscoverage['/loader/utils.js'].branchData['167'][2].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['167'][1].init(149, 31, 'a && m && m.status >= ATTACHING');
function visit501_167_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['167'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['162'][2].init(81, 26, 'module.getType() !== \'css\'');
function visit500_162_2(result) {
  _$jscoverage['/loader/utils.js'].branchData['162'][2].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['162'][1].init(70, 37, '!module || module.getType() !== \'css\'');
function visit499_162_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['162'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['134'][1].init(169, 6, 'module');
function visit498_134_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['134'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['104'][1].init(477, 5, 'i < l');
function visit497_104_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['104'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['96'][1].init(22, 55, 'startsWith(depName, \'../\') || startsWith(depName, \'./\')');
function visit496_96_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['96'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['95'][1].init(126, 27, 'typeof depName === \'string\'');
function visit495_95_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['95'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['91'][1].init(47, 8, '!depName');
function visit494_91_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['91'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['79'][1].init(21, 58, 'doc.getElementsByTagName(\'head\')[0] || doc.documentElement');
function visit493_79_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['79'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['63'][1].init(26, 12, 'Plugin.alias');
function visit492_63_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['63'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['57'][1].init(54, 12, 'index !== -1');
function visit491_57_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['57'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['49'][1].init(134, 23, 'S.endsWith(name, \'.js\')');
function visit490_49_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['49'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['46'][1].init(40, 36, 'name.charAt(name.length - 1) === \'/\'');
function visit489_46_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['46'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['37'][1].init(103, 5, 'i < l');
function visit488_37_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['37'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['31'][1].init(14, 21, 'typeof s === \'string\'');
function visit487_31_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['31'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].lineData[6]++;
(function(S) {
  _$jscoverage['/loader/utils.js'].functionData[0]++;
  _$jscoverage['/loader/utils.js'].lineData[7]++;
  var Loader = S.Loader, Path = S.Path, host = S.Env.host, TRUE = !0, FALSE = !1, startsWith = S.startsWith, data = Loader.Status, ATTACHED = data.ATTACHED, READY_TO_ATTACH = data.READY_TO_ATTACH, LOADED = data.LOADED, ATTACHING = data.ATTACHING, ERROR = data.ERROR, Utils = Loader.Utils = {}, doc = host.document;
  _$jscoverage['/loader/utils.js'].lineData[30]++;
  function addIndexAndRemoveJsExt(s) {
    _$jscoverage['/loader/utils.js'].functionData[1]++;
    _$jscoverage['/loader/utils.js'].lineData[31]++;
    if (visit487_31_1(typeof s === 'string')) {
      _$jscoverage['/loader/utils.js'].lineData[32]++;
      return addIndexAndRemoveJsExtFromName(s);
    } else {
      _$jscoverage['/loader/utils.js'].lineData[34]++;
      var ret = [], i = 0, l = s.length;
      _$jscoverage['/loader/utils.js'].lineData[37]++;
      for (; visit488_37_1(i < l); i++) {
        _$jscoverage['/loader/utils.js'].lineData[38]++;
        ret[i] = addIndexAndRemoveJsExtFromName(s[i]);
      }
      _$jscoverage['/loader/utils.js'].lineData[40]++;
      return ret;
    }
  }
  _$jscoverage['/loader/utils.js'].lineData[44]++;
  function addIndexAndRemoveJsExtFromName(name) {
    _$jscoverage['/loader/utils.js'].functionData[2]++;
    _$jscoverage['/loader/utils.js'].lineData[46]++;
    if (visit489_46_1(name.charAt(name.length - 1) === '/')) {
      _$jscoverage['/loader/utils.js'].lineData[47]++;
      name += 'index';
    }
    _$jscoverage['/loader/utils.js'].lineData[49]++;
    if (visit490_49_1(S.endsWith(name, '.js'))) {
      _$jscoverage['/loader/utils.js'].lineData[50]++;
      name = name.slice(0, -3);
    }
    _$jscoverage['/loader/utils.js'].lineData[52]++;
    return name;
  }
  _$jscoverage['/loader/utils.js'].lineData[55]++;
  function pluginAlias(runtime, name) {
    _$jscoverage['/loader/utils.js'].functionData[3]++;
    _$jscoverage['/loader/utils.js'].lineData[56]++;
    var index = name.indexOf('!');
    _$jscoverage['/loader/utils.js'].lineData[57]++;
    if (visit491_57_1(index !== -1)) {
      _$jscoverage['/loader/utils.js'].lineData[58]++;
      var pluginName = name.substring(0, index);
      _$jscoverage['/loader/utils.js'].lineData[59]++;
      name = name.substring(index + 1);
      _$jscoverage['/loader/utils.js'].lineData[60]++;
      S.use(pluginName, {
  sync: true, 
  success: function(S, Plugin) {
  _$jscoverage['/loader/utils.js'].functionData[4]++;
  _$jscoverage['/loader/utils.js'].lineData[63]++;
  if (visit492_63_1(Plugin.alias)) {
    _$jscoverage['/loader/utils.js'].lineData[65]++;
    name = Plugin.alias(runtime, name, pluginName);
  }
}});
    }
    _$jscoverage['/loader/utils.js'].lineData[70]++;
    return name;
  }
  _$jscoverage['/loader/utils.js'].lineData[73]++;
  S.mix(Utils, {
  docHead: function() {
  _$jscoverage['/loader/utils.js'].functionData[5]++;
  _$jscoverage['/loader/utils.js'].lineData[79]++;
  return visit493_79_1(doc.getElementsByTagName('head')[0] || doc.documentElement);
}, 
  normalDepModuleName: function(moduleName, depName) {
  _$jscoverage['/loader/utils.js'].functionData[6]++;
  _$jscoverage['/loader/utils.js'].lineData[89]++;
  var i = 0, l;
  _$jscoverage['/loader/utils.js'].lineData[91]++;
  if (visit494_91_1(!depName)) {
    _$jscoverage['/loader/utils.js'].lineData[92]++;
    return depName;
  }
  _$jscoverage['/loader/utils.js'].lineData[95]++;
  if (visit495_95_1(typeof depName === 'string')) {
    _$jscoverage['/loader/utils.js'].lineData[96]++;
    if (visit496_96_1(startsWith(depName, '../') || startsWith(depName, './'))) {
      _$jscoverage['/loader/utils.js'].lineData[98]++;
      return Path.resolve(Path.dirname(moduleName), depName);
    }
    _$jscoverage['/loader/utils.js'].lineData[101]++;
    return Path.normalize(depName);
  }
  _$jscoverage['/loader/utils.js'].lineData[104]++;
  for (l = depName.length; visit497_104_1(i < l); i++) {
    _$jscoverage['/loader/utils.js'].lineData[105]++;
    depName[i] = Utils.normalDepModuleName(moduleName, depName[i]);
  }
  _$jscoverage['/loader/utils.js'].lineData[107]++;
  return depName;
}, 
  createModulesInfo: function(runtime, modNames) {
  _$jscoverage['/loader/utils.js'].functionData[7]++;
  _$jscoverage['/loader/utils.js'].lineData[116]++;
  S.each(modNames, function(m) {
  _$jscoverage['/loader/utils.js'].functionData[8]++;
  _$jscoverage['/loader/utils.js'].lineData[117]++;
  Utils.createModuleInfo(runtime, m);
});
}, 
  createModuleInfo: function(runtime, modName, cfg) {
  _$jscoverage['/loader/utils.js'].functionData[9]++;
  _$jscoverage['/loader/utils.js'].lineData[129]++;
  modName = addIndexAndRemoveJsExtFromName(modName);
  _$jscoverage['/loader/utils.js'].lineData[131]++;
  var mods = runtime.Env.mods, module = mods[modName];
  _$jscoverage['/loader/utils.js'].lineData[134]++;
  if (visit498_134_1(module)) {
    _$jscoverage['/loader/utils.js'].lineData[135]++;
    return module;
  }
  _$jscoverage['/loader/utils.js'].lineData[139]++;
  mods[modName] = module = new Loader.Module(S.mix({
  name: modName, 
  runtime: runtime}, cfg));
  _$jscoverage['/loader/utils.js'].lineData[144]++;
  return module;
}, 
  getModules: function(runtime, modNames) {
  _$jscoverage['/loader/utils.js'].functionData[10]++;
  _$jscoverage['/loader/utils.js'].lineData[154]++;
  var mods = [runtime], module, unalias, allOk, m, runtimeMods = runtime.Env.mods;
  _$jscoverage['/loader/utils.js'].lineData[160]++;
  S.each(modNames, function(modName) {
  _$jscoverage['/loader/utils.js'].functionData[11]++;
  _$jscoverage['/loader/utils.js'].lineData[161]++;
  module = runtimeMods[modName];
  _$jscoverage['/loader/utils.js'].lineData[162]++;
  if (visit499_162_1(!module || visit500_162_2(module.getType() !== 'css'))) {
    _$jscoverage['/loader/utils.js'].lineData[163]++;
    unalias = Utils.unalias(runtime, modName);
    _$jscoverage['/loader/utils.js'].lineData[164]++;
    allOk = S.reduce(unalias, function(a, n) {
  _$jscoverage['/loader/utils.js'].functionData[12]++;
  _$jscoverage['/loader/utils.js'].lineData[165]++;
  m = runtimeMods[n];
  _$jscoverage['/loader/utils.js'].lineData[167]++;
  return visit501_167_1(a && visit502_167_2(m && visit503_167_3(m.status >= ATTACHING)));
}, true);
    _$jscoverage['/loader/utils.js'].lineData[169]++;
    if (visit504_169_1(allOk)) {
      _$jscoverage['/loader/utils.js'].lineData[170]++;
      mods.push(runtimeMods[unalias[0]].exports);
    } else {
      _$jscoverage['/loader/utils.js'].lineData[172]++;
      mods.push(null);
    }
  } else {
    _$jscoverage['/loader/utils.js'].lineData[175]++;
    mods.push(undefined);
  }
});
  _$jscoverage['/loader/utils.js'].lineData[179]++;
  return mods;
}, 
  attachModsRecursively: function(modNames, runtime) {
  _$jscoverage['/loader/utils.js'].functionData[13]++;
  _$jscoverage['/loader/utils.js'].lineData[188]++;
  var i, l = modNames.length;
  _$jscoverage['/loader/utils.js'].lineData[190]++;
  for (i = 0; visit505_190_1(i < l); i++) {
    _$jscoverage['/loader/utils.js'].lineData[191]++;
    Utils.attachModRecursively(modNames[i], runtime);
  }
}, 
  checkModsLoadRecursively: function(modNames, runtime, stack, errorList, cache) {
  _$jscoverage['/loader/utils.js'].functionData[14]++;
  _$jscoverage['/loader/utils.js'].lineData[197]++;
  stack = visit506_197_1(stack || []);
  _$jscoverage['/loader/utils.js'].lineData[199]++;
  cache = visit507_199_1(cache || {});
  _$jscoverage['/loader/utils.js'].lineData[200]++;
  var i, s = 1, l = modNames.length, stackDepth = stack.length;
  _$jscoverage['/loader/utils.js'].lineData[204]++;
  for (i = 0; visit508_204_1(i < l); i++) {
    _$jscoverage['/loader/utils.js'].lineData[205]++;
    if (visit509_205_1(!s)) {
      _$jscoverage['/loader/utils.js'].lineData[206]++;
      return !!s;
    }
    _$jscoverage['/loader/utils.js'].lineData[208]++;
    s = Utils.checkModLoadRecursively(modNames[i], runtime, stack, errorList, cache);
    _$jscoverage['/loader/utils.js'].lineData[209]++;
    stack.length = stackDepth;
  }
  _$jscoverage['/loader/utils.js'].lineData[211]++;
  return !!s;
}, 
  checkModLoadRecursively: function(modName, runtime, stack, errorList, cache) {
  _$jscoverage['/loader/utils.js'].functionData[15]++;
  _$jscoverage['/loader/utils.js'].lineData[215]++;
  var mods = runtime.Env.mods, status, m = mods[modName];
  _$jscoverage['/loader/utils.js'].lineData[218]++;
  if (visit510_218_1(modName in cache)) {
    _$jscoverage['/loader/utils.js'].lineData[219]++;
    return cache[modName];
  }
  _$jscoverage['/loader/utils.js'].lineData[221]++;
  if (visit511_221_1(!m)) {
    _$jscoverage['/loader/utils.js'].lineData[222]++;
    cache[modName] = FALSE;
    _$jscoverage['/loader/utils.js'].lineData[223]++;
    return FALSE;
  }
  _$jscoverage['/loader/utils.js'].lineData[225]++;
  status = m.status;
  _$jscoverage['/loader/utils.js'].lineData[226]++;
  if (visit512_226_1(status === ERROR)) {
    _$jscoverage['/loader/utils.js'].lineData[227]++;
    errorList.push(m);
    _$jscoverage['/loader/utils.js'].lineData[228]++;
    cache[modName] = FALSE;
    _$jscoverage['/loader/utils.js'].lineData[229]++;
    return FALSE;
  }
  _$jscoverage['/loader/utils.js'].lineData[231]++;
  if (visit513_231_1(status >= READY_TO_ATTACH)) {
    _$jscoverage['/loader/utils.js'].lineData[232]++;
    cache[modName] = TRUE;
    _$jscoverage['/loader/utils.js'].lineData[233]++;
    return TRUE;
  }
  _$jscoverage['/loader/utils.js'].lineData[235]++;
  if (visit514_235_1(status !== LOADED)) {
    _$jscoverage['/loader/utils.js'].lineData[236]++;
    cache[modName] = FALSE;
    _$jscoverage['/loader/utils.js'].lineData[237]++;
    return FALSE;
  }
  _$jscoverage['/loader/utils.js'].lineData[239]++;
  if (visit515_239_1('@DEBUG@')) {
    _$jscoverage['/loader/utils.js'].lineData[240]++;
    if (visit516_240_1(stack[modName])) {
      _$jscoverage['/loader/utils.js'].lineData[241]++;
      S.log('find cyclic dependency between mods: ' + stack, 'warn');
    } else {
      _$jscoverage['/loader/utils.js'].lineData[243]++;
      stack.push(modName);
    }
  }
  _$jscoverage['/loader/utils.js'].lineData[246]++;
  if (visit517_246_1(stack[modName])) {
    _$jscoverage['/loader/utils.js'].lineData[247]++;
    cache[modName] = TRUE;
    _$jscoverage['/loader/utils.js'].lineData[248]++;
    return TRUE;
  } else {
    _$jscoverage['/loader/utils.js'].lineData[251]++;
    stack[modName] = 1;
  }
  _$jscoverage['/loader/utils.js'].lineData[254]++;
  if (visit518_254_1(Utils.checkModsLoadRecursively(m.getNormalizedRequires(), runtime, stack, errorList, cache))) {
    _$jscoverage['/loader/utils.js'].lineData[256]++;
    m.status = READY_TO_ATTACH;
    _$jscoverage['/loader/utils.js'].lineData[257]++;
    cache[modName] = TRUE;
    _$jscoverage['/loader/utils.js'].lineData[258]++;
    return TRUE;
  }
  _$jscoverage['/loader/utils.js'].lineData[261]++;
  cache[modName] = FALSE;
  _$jscoverage['/loader/utils.js'].lineData[262]++;
  return FALSE;
}, 
  attachModRecursively: function(modName, runtime) {
  _$jscoverage['/loader/utils.js'].functionData[16]++;
  _$jscoverage['/loader/utils.js'].lineData[271]++;
  var mods = runtime.Env.mods, status, m = mods[modName];
  _$jscoverage['/loader/utils.js'].lineData[274]++;
  status = m.status;
  _$jscoverage['/loader/utils.js'].lineData[276]++;
  if (visit519_276_1(status >= ATTACHING)) {
    _$jscoverage['/loader/utils.js'].lineData[277]++;
    return;
  }
  _$jscoverage['/loader/utils.js'].lineData[279]++;
  m.status = ATTACHING;
  _$jscoverage['/loader/utils.js'].lineData[280]++;
  if (visit520_280_1(m.cjs)) {
    _$jscoverage['/loader/utils.js'].lineData[282]++;
    Utils.attachMod(runtime, m);
  } else {
    _$jscoverage['/loader/utils.js'].lineData[284]++;
    Utils.attachModsRecursively(m.getNormalizedRequires(), runtime);
    _$jscoverage['/loader/utils.js'].lineData[285]++;
    Utils.attachMod(runtime, m);
  }
}, 
  attachMod: function(runtime, module) {
  _$jscoverage['/loader/utils.js'].functionData[17]++;
  _$jscoverage['/loader/utils.js'].lineData[295]++;
  var factory = module.factory, exports;
  _$jscoverage['/loader/utils.js'].lineData[298]++;
  if (visit521_298_1(typeof factory === 'function')) {
    _$jscoverage['/loader/utils.js'].lineData[301]++;
    var require;
    _$jscoverage['/loader/utils.js'].lineData[302]++;
    if (visit522_302_1(module.requires && visit523_302_2(module.requires.length && module.cjs))) {
      _$jscoverage['/loader/utils.js'].lineData[303]++;
      require = S.bind(module.require, module);
    }
    _$jscoverage['/loader/utils.js'].lineData[308]++;
    exports = factory.apply(module, (module.cjs ? [runtime, require, module.exports, module] : Utils.getModules(runtime, module.getRequiresWithAlias())));
    _$jscoverage['/loader/utils.js'].lineData[312]++;
    if (visit524_312_1(exports !== undefined)) {
      _$jscoverage['/loader/utils.js'].lineData[314]++;
      module.exports = exports;
    }
  } else {
    _$jscoverage['/loader/utils.js'].lineData[318]++;
    module.exports = factory;
  }
  _$jscoverage['/loader/utils.js'].lineData[321]++;
  module.status = ATTACHED;
}, 
  getModNamesAsArray: function(modNames) {
  _$jscoverage['/loader/utils.js'].functionData[18]++;
  _$jscoverage['/loader/utils.js'].lineData[330]++;
  if (visit525_330_1(typeof modNames === 'string')) {
    _$jscoverage['/loader/utils.js'].lineData[331]++;
    modNames = modNames.replace(/\s+/g, '').split(',');
  }
  _$jscoverage['/loader/utils.js'].lineData[333]++;
  return modNames;
}, 
  normalizeModNames: function(runtime, modNames, refModName) {
  _$jscoverage['/loader/utils.js'].functionData[19]++;
  _$jscoverage['/loader/utils.js'].lineData[348]++;
  return Utils.unalias(runtime, Utils.normalizeModNamesWithAlias(runtime, modNames, refModName));
}, 
  unalias: function(runtime, names) {
  _$jscoverage['/loader/utils.js'].functionData[20]++;
  _$jscoverage['/loader/utils.js'].lineData[359]++;
  var ret = [].concat(names), i, m, alias, ok = 0, j;
  _$jscoverage['/loader/utils.js'].lineData[365]++;
  while (!ok) {
    _$jscoverage['/loader/utils.js'].lineData[366]++;
    ok = 1;
    _$jscoverage['/loader/utils.js'].lineData[367]++;
    for (i = ret.length - 1; visit526_367_1(i >= 0); i--) {
      _$jscoverage['/loader/utils.js'].lineData[368]++;
      if (visit527_368_1((m = Utils.createModuleInfo(runtime, ret[i])) && (visit528_368_2((alias = m.getAlias()) !== undefined)))) {
        _$jscoverage['/loader/utils.js'].lineData[369]++;
        ok = 0;
        _$jscoverage['/loader/utils.js'].lineData[370]++;
        if (visit529_370_1(typeof alias === 'string')) {
          _$jscoverage['/loader/utils.js'].lineData[371]++;
          alias = [alias];
        }
        _$jscoverage['/loader/utils.js'].lineData[373]++;
        for (j = alias.length - 1; visit530_373_1(j >= 0); j--) {
          _$jscoverage['/loader/utils.js'].lineData[374]++;
          if (visit531_374_1(!alias[j])) {
            _$jscoverage['/loader/utils.js'].lineData[375]++;
            alias.splice(j, 1);
          }
        }
        _$jscoverage['/loader/utils.js'].lineData[378]++;
        ret.splice.apply(ret, [i, 1].concat(addIndexAndRemoveJsExt(alias)));
      }
    }
  }
  _$jscoverage['/loader/utils.js'].lineData[382]++;
  return ret;
}, 
  normalizeModNamesWithAlias: function(runtime, modNames, refModName) {
  _$jscoverage['/loader/utils.js'].functionData[21]++;
  _$jscoverage['/loader/utils.js'].lineData[393]++;
  var ret = [], i, l;
  _$jscoverage['/loader/utils.js'].lineData[394]++;
  if (visit532_394_1(modNames)) {
    _$jscoverage['/loader/utils.js'].lineData[396]++;
    for (i = 0 , l = modNames.length; visit533_396_1(i < l); i++) {
      _$jscoverage['/loader/utils.js'].lineData[399]++;
      if (visit534_399_1(modNames[i])) {
        _$jscoverage['/loader/utils.js'].lineData[400]++;
        ret.push(pluginAlias(runtime, addIndexAndRemoveJsExt(modNames[i])));
      }
    }
  }
  _$jscoverage['/loader/utils.js'].lineData[405]++;
  if (visit535_405_1(refModName)) {
    _$jscoverage['/loader/utils.js'].lineData[406]++;
    ret = Utils.normalDepModuleName(refModName, ret);
  }
  _$jscoverage['/loader/utils.js'].lineData[408]++;
  return ret;
}, 
  registerModule: function(runtime, name, factory, config) {
  _$jscoverage['/loader/utils.js'].functionData[22]++;
  _$jscoverage['/loader/utils.js'].lineData[419]++;
  name = addIndexAndRemoveJsExtFromName(name);
  _$jscoverage['/loader/utils.js'].lineData[421]++;
  var mods = runtime.Env.mods, module = mods[name];
  _$jscoverage['/loader/utils.js'].lineData[424]++;
  if (visit536_424_1(module && visit537_424_2(module.factory !== undefined))) {
    _$jscoverage['/loader/utils.js'].lineData[425]++;
    S.log(name + ' is defined more than once', 'warn');
    _$jscoverage['/loader/utils.js'].lineData[426]++;
    return;
  }
  _$jscoverage['/loader/utils.js'].lineData[430]++;
  Utils.createModuleInfo(runtime, name);
  _$jscoverage['/loader/utils.js'].lineData[432]++;
  module = mods[name];
  _$jscoverage['/loader/utils.js'].lineData[436]++;
  S.mix(module, {
  name: name, 
  status: LOADED, 
  factory: factory});
  _$jscoverage['/loader/utils.js'].lineData[442]++;
  S.mix(module, config);
}, 
  getHash: function(str) {
  _$jscoverage['/loader/utils.js'].functionData[23]++;
  _$jscoverage['/loader/utils.js'].lineData[451]++;
  var hash = 5381, i;
  _$jscoverage['/loader/utils.js'].lineData[453]++;
  for (i = str.length; visit538_453_1(--i > -1); ) {
    _$jscoverage['/loader/utils.js'].lineData[454]++;
    hash = ((hash << 5) + hash) + str.charCodeAt(i);
  }
  _$jscoverage['/loader/utils.js'].lineData[457]++;
  return hash + '';
}, 
  getRequiresFromFn: function(fn) {
  _$jscoverage['/loader/utils.js'].functionData[24]++;
  _$jscoverage['/loader/utils.js'].lineData[461]++;
  var requires = [];
  _$jscoverage['/loader/utils.js'].lineData[467]++;
  fn.toString().replace(commentRegExp, '').replace(requireRegExp, function(match, dep) {
  _$jscoverage['/loader/utils.js'].functionData[25]++;
  _$jscoverage['/loader/utils.js'].lineData[468]++;
  requires.push(getRequireVal(dep));
});
  _$jscoverage['/loader/utils.js'].lineData[470]++;
  return requires;
}});
  _$jscoverage['/loader/utils.js'].lineData[474]++;
  var commentRegExp = /(\/\*([\s\S]*?)\*\/|([^:]|^)\/\/(.*)$)/mg, requireRegExp = /[^.'"]\s*require\s*\(([^)]+)\)/g;
  _$jscoverage['/loader/utils.js'].lineData[477]++;
  function getRequireVal(str) {
    _$jscoverage['/loader/utils.js'].functionData[26]++;
    _$jscoverage['/loader/utils.js'].lineData[478]++;
    var m;
    _$jscoverage['/loader/utils.js'].lineData[480]++;
    if (visit539_480_1(!(m = str.match(/^\s*["']([^'"\s]+)["']\s*$/)))) {
      _$jscoverage['/loader/utils.js'].lineData[481]++;
      S.error('can not find required mod in require call: ' + str);
    }
    _$jscoverage['/loader/utils.js'].lineData[483]++;
    return m[1];
  }
})(KISSY);
