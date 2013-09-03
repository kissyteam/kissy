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
if (! _$jscoverage['/base/create.js']) {
  _$jscoverage['/base/create.js'] = {};
  _$jscoverage['/base/create.js'].lineData = [];
  _$jscoverage['/base/create.js'].lineData[6] = 0;
  _$jscoverage['/base/create.js'].lineData[7] = 0;
  _$jscoverage['/base/create.js'].lineData[24] = 0;
  _$jscoverage['/base/create.js'].lineData[25] = 0;
  _$jscoverage['/base/create.js'].lineData[28] = 0;
  _$jscoverage['/base/create.js'].lineData[29] = 0;
  _$jscoverage['/base/create.js'].lineData[30] = 0;
  _$jscoverage['/base/create.js'].lineData[31] = 0;
  _$jscoverage['/base/create.js'].lineData[33] = 0;
  _$jscoverage['/base/create.js'].lineData[36] = 0;
  _$jscoverage['/base/create.js'].lineData[37] = 0;
  _$jscoverage['/base/create.js'].lineData[40] = 0;
  _$jscoverage['/base/create.js'].lineData[41] = 0;
  _$jscoverage['/base/create.js'].lineData[43] = 0;
  _$jscoverage['/base/create.js'].lineData[46] = 0;
  _$jscoverage['/base/create.js'].lineData[47] = 0;
  _$jscoverage['/base/create.js'].lineData[49] = 0;
  _$jscoverage['/base/create.js'].lineData[50] = 0;
  _$jscoverage['/base/create.js'].lineData[53] = 0;
  _$jscoverage['/base/create.js'].lineData[70] = 0;
  _$jscoverage['/base/create.js'].lineData[72] = 0;
  _$jscoverage['/base/create.js'].lineData[73] = 0;
  _$jscoverage['/base/create.js'].lineData[76] = 0;
  _$jscoverage['/base/create.js'].lineData[77] = 0;
  _$jscoverage['/base/create.js'].lineData[81] = 0;
  _$jscoverage['/base/create.js'].lineData[82] = 0;
  _$jscoverage['/base/create.js'].lineData[85] = 0;
  _$jscoverage['/base/create.js'].lineData[86] = 0;
  _$jscoverage['/base/create.js'].lineData[89] = 0;
  _$jscoverage['/base/create.js'].lineData[90] = 0;
  _$jscoverage['/base/create.js'].lineData[93] = 0;
  _$jscoverage['/base/create.js'].lineData[102] = 0;
  _$jscoverage['/base/create.js'].lineData[103] = 0;
  _$jscoverage['/base/create.js'].lineData[106] = 0;
  _$jscoverage['/base/create.js'].lineData[107] = 0;
  _$jscoverage['/base/create.js'].lineData[112] = 0;
  _$jscoverage['/base/create.js'].lineData[114] = 0;
  _$jscoverage['/base/create.js'].lineData[115] = 0;
  _$jscoverage['/base/create.js'].lineData[118] = 0;
  _$jscoverage['/base/create.js'].lineData[120] = 0;
  _$jscoverage['/base/create.js'].lineData[122] = 0;
  _$jscoverage['/base/create.js'].lineData[125] = 0;
  _$jscoverage['/base/create.js'].lineData[127] = 0;
  _$jscoverage['/base/create.js'].lineData[130] = 0;
  _$jscoverage['/base/create.js'].lineData[132] = 0;
  _$jscoverage['/base/create.js'].lineData[134] = 0;
  _$jscoverage['/base/create.js'].lineData[135] = 0;
  _$jscoverage['/base/create.js'].lineData[137] = 0;
  _$jscoverage['/base/create.js'].lineData[139] = 0;
  _$jscoverage['/base/create.js'].lineData[143] = 0;
  _$jscoverage['/base/create.js'].lineData[148] = 0;
  _$jscoverage['/base/create.js'].lineData[149] = 0;
  _$jscoverage['/base/create.js'].lineData[150] = 0;
  _$jscoverage['/base/create.js'].lineData[170] = 0;
  _$jscoverage['/base/create.js'].lineData[175] = 0;
  _$jscoverage['/base/create.js'].lineData[176] = 0;
  _$jscoverage['/base/create.js'].lineData[179] = 0;
  _$jscoverage['/base/create.js'].lineData[181] = 0;
  _$jscoverage['/base/create.js'].lineData[182] = 0;
  _$jscoverage['/base/create.js'].lineData[183] = 0;
  _$jscoverage['/base/create.js'].lineData[184] = 0;
  _$jscoverage['/base/create.js'].lineData[185] = 0;
  _$jscoverage['/base/create.js'].lineData[186] = 0;
  _$jscoverage['/base/create.js'].lineData[188] = 0;
  _$jscoverage['/base/create.js'].lineData[193] = 0;
  _$jscoverage['/base/create.js'].lineData[197] = 0;
  _$jscoverage['/base/create.js'].lineData[200] = 0;
  _$jscoverage['/base/create.js'].lineData[201] = 0;
  _$jscoverage['/base/create.js'].lineData[202] = 0;
  _$jscoverage['/base/create.js'].lineData[203] = 0;
  _$jscoverage['/base/create.js'].lineData[204] = 0;
  _$jscoverage['/base/create.js'].lineData[205] = 0;
  _$jscoverage['/base/create.js'].lineData[208] = 0;
  _$jscoverage['/base/create.js'].lineData[216] = 0;
  _$jscoverage['/base/create.js'].lineData[217] = 0;
  _$jscoverage['/base/create.js'].lineData[218] = 0;
  _$jscoverage['/base/create.js'].lineData[219] = 0;
  _$jscoverage['/base/create.js'].lineData[222] = 0;
  _$jscoverage['/base/create.js'].lineData[234] = 0;
  _$jscoverage['/base/create.js'].lineData[240] = 0;
  _$jscoverage['/base/create.js'].lineData[241] = 0;
  _$jscoverage['/base/create.js'].lineData[244] = 0;
  _$jscoverage['/base/create.js'].lineData[245] = 0;
  _$jscoverage['/base/create.js'].lineData[246] = 0;
  _$jscoverage['/base/create.js'].lineData[248] = 0;
  _$jscoverage['/base/create.js'].lineData[249] = 0;
  _$jscoverage['/base/create.js'].lineData[250] = 0;
  _$jscoverage['/base/create.js'].lineData[253] = 0;
  _$jscoverage['/base/create.js'].lineData[254] = 0;
  _$jscoverage['/base/create.js'].lineData[255] = 0;
  _$jscoverage['/base/create.js'].lineData[256] = 0;
  _$jscoverage['/base/create.js'].lineData[257] = 0;
  _$jscoverage['/base/create.js'].lineData[258] = 0;
  _$jscoverage['/base/create.js'].lineData[259] = 0;
  _$jscoverage['/base/create.js'].lineData[260] = 0;
  _$jscoverage['/base/create.js'].lineData[264] = 0;
  _$jscoverage['/base/create.js'].lineData[265] = 0;
  _$jscoverage['/base/create.js'].lineData[266] = 0;
  _$jscoverage['/base/create.js'].lineData[269] = 0;
  _$jscoverage['/base/create.js'].lineData[278] = 0;
  _$jscoverage['/base/create.js'].lineData[284] = 0;
  _$jscoverage['/base/create.js'].lineData[285] = 0;
  _$jscoverage['/base/create.js'].lineData[286] = 0;
  _$jscoverage['/base/create.js'].lineData[287] = 0;
  _$jscoverage['/base/create.js'].lineData[288] = 0;
  _$jscoverage['/base/create.js'].lineData[289] = 0;
  _$jscoverage['/base/create.js'].lineData[290] = 0;
  _$jscoverage['/base/create.js'].lineData[291] = 0;
  _$jscoverage['/base/create.js'].lineData[294] = 0;
  _$jscoverage['/base/create.js'].lineData[300] = 0;
  _$jscoverage['/base/create.js'].lineData[327] = 0;
  _$jscoverage['/base/create.js'].lineData[328] = 0;
  _$jscoverage['/base/create.js'].lineData[329] = 0;
  _$jscoverage['/base/create.js'].lineData[330] = 0;
  _$jscoverage['/base/create.js'].lineData[333] = 0;
  _$jscoverage['/base/create.js'].lineData[338] = 0;
  _$jscoverage['/base/create.js'].lineData[339] = 0;
  _$jscoverage['/base/create.js'].lineData[342] = 0;
  _$jscoverage['/base/create.js'].lineData[348] = 0;
  _$jscoverage['/base/create.js'].lineData[352] = 0;
  _$jscoverage['/base/create.js'].lineData[359] = 0;
  _$jscoverage['/base/create.js'].lineData[360] = 0;
  _$jscoverage['/base/create.js'].lineData[363] = 0;
  _$jscoverage['/base/create.js'].lineData[364] = 0;
  _$jscoverage['/base/create.js'].lineData[368] = 0;
  _$jscoverage['/base/create.js'].lineData[369] = 0;
  _$jscoverage['/base/create.js'].lineData[370] = 0;
  _$jscoverage['/base/create.js'].lineData[371] = 0;
  _$jscoverage['/base/create.js'].lineData[374] = 0;
  _$jscoverage['/base/create.js'].lineData[382] = 0;
  _$jscoverage['/base/create.js'].lineData[384] = 0;
  _$jscoverage['/base/create.js'].lineData[385] = 0;
  _$jscoverage['/base/create.js'].lineData[386] = 0;
  _$jscoverage['/base/create.js'].lineData[394] = 0;
  _$jscoverage['/base/create.js'].lineData[396] = 0;
  _$jscoverage['/base/create.js'].lineData[397] = 0;
  _$jscoverage['/base/create.js'].lineData[398] = 0;
  _$jscoverage['/base/create.js'].lineData[399] = 0;
  _$jscoverage['/base/create.js'].lineData[402] = 0;
  _$jscoverage['/base/create.js'].lineData[403] = 0;
  _$jscoverage['/base/create.js'].lineData[404] = 0;
  _$jscoverage['/base/create.js'].lineData[406] = 0;
  _$jscoverage['/base/create.js'].lineData[408] = 0;
  _$jscoverage['/base/create.js'].lineData[409] = 0;
  _$jscoverage['/base/create.js'].lineData[412] = 0;
  _$jscoverage['/base/create.js'].lineData[413] = 0;
  _$jscoverage['/base/create.js'].lineData[414] = 0;
  _$jscoverage['/base/create.js'].lineData[416] = 0;
  _$jscoverage['/base/create.js'].lineData[422] = 0;
  _$jscoverage['/base/create.js'].lineData[423] = 0;
  _$jscoverage['/base/create.js'].lineData[427] = 0;
  _$jscoverage['/base/create.js'].lineData[428] = 0;
  _$jscoverage['/base/create.js'].lineData[431] = 0;
  _$jscoverage['/base/create.js'].lineData[434] = 0;
  _$jscoverage['/base/create.js'].lineData[435] = 0;
  _$jscoverage['/base/create.js'].lineData[439] = 0;
  _$jscoverage['/base/create.js'].lineData[441] = 0;
  _$jscoverage['/base/create.js'].lineData[446] = 0;
  _$jscoverage['/base/create.js'].lineData[447] = 0;
  _$jscoverage['/base/create.js'].lineData[448] = 0;
  _$jscoverage['/base/create.js'].lineData[449] = 0;
  _$jscoverage['/base/create.js'].lineData[452] = 0;
  _$jscoverage['/base/create.js'].lineData[453] = 0;
  _$jscoverage['/base/create.js'].lineData[456] = 0;
  _$jscoverage['/base/create.js'].lineData[460] = 0;
  _$jscoverage['/base/create.js'].lineData[461] = 0;
  _$jscoverage['/base/create.js'].lineData[465] = 0;
  _$jscoverage['/base/create.js'].lineData[466] = 0;
  _$jscoverage['/base/create.js'].lineData[467] = 0;
  _$jscoverage['/base/create.js'].lineData[468] = 0;
  _$jscoverage['/base/create.js'].lineData[469] = 0;
  _$jscoverage['/base/create.js'].lineData[470] = 0;
  _$jscoverage['/base/create.js'].lineData[473] = 0;
  _$jscoverage['/base/create.js'].lineData[475] = 0;
  _$jscoverage['/base/create.js'].lineData[479] = 0;
  _$jscoverage['/base/create.js'].lineData[495] = 0;
  _$jscoverage['/base/create.js'].lineData[496] = 0;
  _$jscoverage['/base/create.js'].lineData[497] = 0;
  _$jscoverage['/base/create.js'].lineData[498] = 0;
  _$jscoverage['/base/create.js'].lineData[506] = 0;
  _$jscoverage['/base/create.js'].lineData[507] = 0;
  _$jscoverage['/base/create.js'].lineData[510] = 0;
}
if (! _$jscoverage['/base/create.js'].functionData) {
  _$jscoverage['/base/create.js'].functionData = [];
  _$jscoverage['/base/create.js'].functionData[0] = 0;
  _$jscoverage['/base/create.js'].functionData[1] = 0;
  _$jscoverage['/base/create.js'].functionData[2] = 0;
  _$jscoverage['/base/create.js'].functionData[3] = 0;
  _$jscoverage['/base/create.js'].functionData[4] = 0;
  _$jscoverage['/base/create.js'].functionData[5] = 0;
  _$jscoverage['/base/create.js'].functionData[6] = 0;
  _$jscoverage['/base/create.js'].functionData[7] = 0;
  _$jscoverage['/base/create.js'].functionData[8] = 0;
  _$jscoverage['/base/create.js'].functionData[9] = 0;
  _$jscoverage['/base/create.js'].functionData[10] = 0;
  _$jscoverage['/base/create.js'].functionData[11] = 0;
  _$jscoverage['/base/create.js'].functionData[12] = 0;
  _$jscoverage['/base/create.js'].functionData[13] = 0;
  _$jscoverage['/base/create.js'].functionData[14] = 0;
  _$jscoverage['/base/create.js'].functionData[15] = 0;
  _$jscoverage['/base/create.js'].functionData[16] = 0;
  _$jscoverage['/base/create.js'].functionData[17] = 0;
  _$jscoverage['/base/create.js'].functionData[18] = 0;
}
if (! _$jscoverage['/base/create.js'].branchData) {
  _$jscoverage['/base/create.js'].branchData = {};
  _$jscoverage['/base/create.js'].branchData['13'] = [];
  _$jscoverage['/base/create.js'].branchData['13'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['18'] = [];
  _$jscoverage['/base/create.js'].branchData['18'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['18'][2] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['20'] = [];
  _$jscoverage['/base/create.js'].branchData['20'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['30'] = [];
  _$jscoverage['/base/create.js'].branchData['30'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['37'] = [];
  _$jscoverage['/base/create.js'].branchData['37'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['37'][2] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['40'] = [];
  _$jscoverage['/base/create.js'].branchData['40'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['72'] = [];
  _$jscoverage['/base/create.js'].branchData['72'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['76'] = [];
  _$jscoverage['/base/create.js'].branchData['76'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['81'] = [];
  _$jscoverage['/base/create.js'].branchData['81'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['85'] = [];
  _$jscoverage['/base/create.js'].branchData['85'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['89'] = [];
  _$jscoverage['/base/create.js'].branchData['89'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['96'] = [];
  _$jscoverage['/base/create.js'].branchData['96'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['102'] = [];
  _$jscoverage['/base/create.js'].branchData['102'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['114'] = [];
  _$jscoverage['/base/create.js'].branchData['114'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['118'] = [];
  _$jscoverage['/base/create.js'].branchData['118'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['120'] = [];
  _$jscoverage['/base/create.js'].branchData['120'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['125'] = [];
  _$jscoverage['/base/create.js'].branchData['125'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['125'][2] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['132'] = [];
  _$jscoverage['/base/create.js'].branchData['132'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['135'] = [];
  _$jscoverage['/base/create.js'].branchData['135'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['148'] = [];
  _$jscoverage['/base/create.js'].branchData['148'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['175'] = [];
  _$jscoverage['/base/create.js'].branchData['175'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['179'] = [];
  _$jscoverage['/base/create.js'].branchData['179'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['181'] = [];
  _$jscoverage['/base/create.js'].branchData['181'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['183'] = [];
  _$jscoverage['/base/create.js'].branchData['183'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['197'] = [];
  _$jscoverage['/base/create.js'].branchData['197'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['198'] = [];
  _$jscoverage['/base/create.js'].branchData['198'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['198'][2] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['198'][3] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['201'] = [];
  _$jscoverage['/base/create.js'].branchData['201'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['203'] = [];
  _$jscoverage['/base/create.js'].branchData['203'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['216'] = [];
  _$jscoverage['/base/create.js'].branchData['216'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['240'] = [];
  _$jscoverage['/base/create.js'].branchData['240'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['244'] = [];
  _$jscoverage['/base/create.js'].branchData['244'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['245'] = [];
  _$jscoverage['/base/create.js'].branchData['245'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['245'][2] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['254'] = [];
  _$jscoverage['/base/create.js'].branchData['254'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['255'] = [];
  _$jscoverage['/base/create.js'].branchData['255'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['257'] = [];
  _$jscoverage['/base/create.js'].branchData['257'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['284'] = [];
  _$jscoverage['/base/create.js'].branchData['284'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['286'] = [];
  _$jscoverage['/base/create.js'].branchData['286'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['286'][2] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['290'] = [];
  _$jscoverage['/base/create.js'].branchData['290'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['294'] = [];
  _$jscoverage['/base/create.js'].branchData['294'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['300'] = [];
  _$jscoverage['/base/create.js'].branchData['300'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['300'][2] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['327'] = [];
  _$jscoverage['/base/create.js'].branchData['327'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['338'] = [];
  _$jscoverage['/base/create.js'].branchData['338'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['352'] = [];
  _$jscoverage['/base/create.js'].branchData['352'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['352'][2] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['353'] = [];
  _$jscoverage['/base/create.js'].branchData['353'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['359'] = [];
  _$jscoverage['/base/create.js'].branchData['359'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['359'][2] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['363'] = [];
  _$jscoverage['/base/create.js'].branchData['363'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['368'] = [];
  _$jscoverage['/base/create.js'].branchData['368'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['370'] = [];
  _$jscoverage['/base/create.js'].branchData['370'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['384'] = [];
  _$jscoverage['/base/create.js'].branchData['384'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['398'] = [];
  _$jscoverage['/base/create.js'].branchData['398'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['403'] = [];
  _$jscoverage['/base/create.js'].branchData['403'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['408'] = [];
  _$jscoverage['/base/create.js'].branchData['408'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['413'] = [];
  _$jscoverage['/base/create.js'].branchData['413'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['427'] = [];
  _$jscoverage['/base/create.js'].branchData['427'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['427'][2] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['439'] = [];
  _$jscoverage['/base/create.js'].branchData['439'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['447'] = [];
  _$jscoverage['/base/create.js'].branchData['447'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['448'] = [];
  _$jscoverage['/base/create.js'].branchData['448'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['452'] = [];
  _$jscoverage['/base/create.js'].branchData['452'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['465'] = [];
  _$jscoverage['/base/create.js'].branchData['465'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['465'][2] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['465'][3] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['469'] = [];
  _$jscoverage['/base/create.js'].branchData['469'][1] = new BranchData();
}
_$jscoverage['/base/create.js'].branchData['469'][1].init(189, 7, 'i < len');
function visit184_469_1(result) {
  _$jscoverage['/base/create.js'].branchData['469'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['465'][3].init(106, 24, 'nodes.push || nodes.item');
function visit183_465_3(result) {
  _$jscoverage['/base/create.js'].branchData['465'][3].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['465'][2].init(106, 37, '(nodes.push || nodes.item) && nodes[0]');
function visit182_465_2(result) {
  _$jscoverage['/base/create.js'].branchData['465'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['465'][1].init(96, 47, 'nodes && (nodes.push || nodes.item) && nodes[0]');
function visit181_465_1(result) {
  _$jscoverage['/base/create.js'].branchData['465'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['452'][1].init(178, 48, 'elem.nodeType == NodeType.DOCUMENT_FRAGMENT_NODE');
function visit180_452_1(result) {
  _$jscoverage['/base/create.js'].branchData['452'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['448'][1].init(18, 38, 'elem.nodeType == NodeType.ELEMENT_NODE');
function visit179_448_1(result) {
  _$jscoverage['/base/create.js'].branchData['448'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['447'][1].init(14, 22, 'S.isPlainObject(props)');
function visit178_447_1(result) {
  _$jscoverage['/base/create.js'].branchData['447'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['439'][1].init(384, 8, 'DOMEvent');
function visit177_439_1(result) {
  _$jscoverage['/base/create.js'].branchData['439'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['427'][2].init(102, 38, 'dest.nodeType == NodeType.ELEMENT_NODE');
function visit176_427_2(result) {
  _$jscoverage['/base/create.js'].branchData['427'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['427'][1].init(102, 59, 'dest.nodeType == NodeType.ELEMENT_NODE && !Dom.hasData(src)');
function visit175_427_1(result) {
  _$jscoverage['/base/create.js'].branchData['427'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['413'][1].init(22, 21, 'cloneChildren[cIndex]');
function visit174_413_1(result) {
  _$jscoverage['/base/create.js'].branchData['413'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['408'][1].init(446, 37, 'elemNodeType == NodeType.ELEMENT_NODE');
function visit173_408_1(result) {
  _$jscoverage['/base/create.js'].branchData['408'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['403'][1].init(22, 15, 'cloneCs[fIndex]');
function visit172_403_1(result) {
  _$jscoverage['/base/create.js'].branchData['403'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['398'][1].init(57, 47, 'elemNodeType == NodeType.DOCUMENT_FRAGMENT_NODE');
function visit171_398_1(result) {
  _$jscoverage['/base/create.js'].branchData['398'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['384'][1].init(119, 6, 'i >= 0');
function visit170_384_1(result) {
  _$jscoverage['/base/create.js'].branchData['384'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['370'][1].init(83, 28, 'deep && deepWithDataAndEvent');
function visit169_370_1(result) {
  _$jscoverage['/base/create.js'].branchData['370'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['368'][1].init(1778, 16, 'withDataAndEvent');
function visit168_368_1(result) {
  _$jscoverage['/base/create.js'].branchData['368'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['363'][1].init(584, 27, 'deep && _fixCloneAttributes');
function visit167_363_1(result) {
  _$jscoverage['/base/create.js'].branchData['363'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['359'][2].init(434, 37, 'elemNodeType == NodeType.ELEMENT_NODE');
function visit166_359_2(result) {
  _$jscoverage['/base/create.js'].branchData['359'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['359'][1].init(411, 60, '_fixCloneAttributes && elemNodeType == NodeType.ELEMENT_NODE');
function visit165_359_1(result) {
  _$jscoverage['/base/create.js'].branchData['359'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['353'][1].init(61, 47, 'elemNodeType == NodeType.DOCUMENT_FRAGMENT_NODE');
function visit164_353_1(result) {
  _$jscoverage['/base/create.js'].branchData['353'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['352'][2].init(882, 37, 'elemNodeType == NodeType.ELEMENT_NODE');
function visit163_352_2(result) {
  _$jscoverage['/base/create.js'].branchData['352'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['352'][1].init(882, 109, 'elemNodeType == NodeType.ELEMENT_NODE || elemNodeType == NodeType.DOCUMENT_FRAGMENT_NODE');
function visit162_352_1(result) {
  _$jscoverage['/base/create.js'].branchData['352'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['338'][1].init(454, 5, '!elem');
function visit161_338_1(result) {
  _$jscoverage['/base/create.js'].branchData['338'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['327'][1].init(22, 24, 'typeof deep === \'object\'');
function visit160_327_1(result) {
  _$jscoverage['/base/create.js'].branchData['327'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['300'][2].init(651, 44, 'parent.canHaveChildren && "removeNode" in el');
function visit159_300_2(result) {
  _$jscoverage['/base/create.js'].branchData['300'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['300'][1].init(642, 53, 'UA.ie && parent.canHaveChildren && "removeNode" in el');
function visit158_300_1(result) {
  _$jscoverage['/base/create.js'].branchData['300'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['294'][1].init(440, 22, 'parent = el.parentNode');
function visit157_294_1(result) {
  _$jscoverage['/base/create.js'].branchData['294'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['290'][1].init(190, 8, 'DOMEvent');
function visit156_290_1(result) {
  _$jscoverage['/base/create.js'].branchData['290'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['286'][2].init(73, 36, 'el.nodeType == NodeType.ELEMENT_NODE');
function visit155_286_2(result) {
  _$jscoverage['/base/create.js'].branchData['286'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['286'][1].init(60, 49, '!keepData && el.nodeType == NodeType.ELEMENT_NODE');
function visit154_286_1(result) {
  _$jscoverage['/base/create.js'].branchData['286'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['284'][1].init(251, 6, 'i >= 0');
function visit153_284_1(result) {
  _$jscoverage['/base/create.js'].branchData['284'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['257'][1].init(76, 36, 'el.nodeType == NodeType.ELEMENT_NODE');
function visit152_257_1(result) {
  _$jscoverage['/base/create.js'].branchData['257'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['255'][1].init(47, 6, 'i >= 0');
function visit151_255_1(result) {
  _$jscoverage['/base/create.js'].branchData['255'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['254'][1].init(65, 64, '!htmlString.match(/<(?:script|style|link)/i) && supportOuterHTML');
function visit150_254_1(result) {
  _$jscoverage['/base/create.js'].branchData['254'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['245'][2].init(46, 41, 'el.nodeType != Dom.DOCUMENT_FRAGMENT_NODE');
function visit149_245_2(result) {
  _$jscoverage['/base/create.js'].branchData['245'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['245'][1].init(26, 61, 'supportOuterHTML && el.nodeType != Dom.DOCUMENT_FRAGMENT_NODE');
function visit148_245_1(result) {
  _$jscoverage['/base/create.js'].branchData['245'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['244'][1].init(337, 24, 'htmlString === undefined');
function visit147_244_1(result) {
  _$jscoverage['/base/create.js'].branchData['244'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['240'][1].init(229, 3, '!el');
function visit146_240_1(result) {
  _$jscoverage['/base/create.js'].branchData['240'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['216'][1].init(1109, 8, '!success');
function visit145_216_1(result) {
  _$jscoverage['/base/create.js'].branchData['216'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['203'][1].init(86, 38, 'elem.nodeType == NodeType.ELEMENT_NODE');
function visit144_203_1(result) {
  _$jscoverage['/base/create.js'].branchData['203'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['201'][1].init(55, 6, 'i >= 0');
function visit143_201_1(result) {
  _$jscoverage['/base/create.js'].branchData['201'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['198'][3].init(347, 36, 'htmlString.match(RE_TAG) || [\'\', \'\']');
function visit142_198_3(result) {
  _$jscoverage['/base/create.js'].branchData['198'][3].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['198'][2].init(258, 69, '!lostLeadingTailWhitespace || !htmlString.match(R_LEADING_WHITESPACE)');
function visit141_198_2(result) {
  _$jscoverage['/base/create.js'].branchData['198'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['198'][1].init(73, 145, '(!lostLeadingTailWhitespace || !htmlString.match(R_LEADING_WHITESPACE)) && !creatorsMap[(htmlString.match(RE_TAG) || [\'\', \'\'])[1].toLowerCase()]');
function visit140_198_1(result) {
  _$jscoverage['/base/create.js'].branchData['198'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['197'][1].init(182, 219, '!htmlString.match(/<(?:script|style|link)/i) && (!lostLeadingTailWhitespace || !htmlString.match(R_LEADING_WHITESPACE)) && !creatorsMap[(htmlString.match(RE_TAG) || [\'\', \'\'])[1].toLowerCase()]');
function visit139_197_1(result) {
  _$jscoverage['/base/create.js'].branchData['197'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['183'][1].init(215, 46, 'el.nodeType == NodeType.DOCUMENT_FRAGMENT_NODE');
function visit138_183_1(result) {
  _$jscoverage['/base/create.js'].branchData['183'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['181'][1].init(96, 36, 'el.nodeType == NodeType.ELEMENT_NODE');
function visit137_181_1(result) {
  _$jscoverage['/base/create.js'].branchData['181'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['179'][1].init(366, 24, 'htmlString === undefined');
function visit136_179_1(result) {
  _$jscoverage['/base/create.js'].branchData['179'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['175'][1].init(258, 3, '!el');
function visit135_175_1(result) {
  _$jscoverage['/base/create.js'].branchData['175'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['148'][1].init(97, 32, 'Dom.nodeName(src) === \'textarea\'');
function visit134_148_1(result) {
  _$jscoverage['/base/create.js'].branchData['148'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['135'][1].init(1249, 12, 'nodes.length');
function visit133_135_1(result) {
  _$jscoverage['/base/create.js'].branchData['135'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['132'][1].init(1030, 18, 'nodes.length === 1');
function visit132_132_1(result) {
  _$jscoverage['/base/create.js'].branchData['132'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['125'][2].init(744, 93, '/\\S/.test(html) && (whitespaceMatch = html.match(R_TAIL_WHITESPACE))');
function visit131_125_2(result) {
  _$jscoverage['/base/create.js'].branchData['125'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['125'][1].init(715, 122, 'lostLeadingTailWhitespace && /\\S/.test(html) && (whitespaceMatch = html.match(R_TAIL_WHITESPACE))');
function visit130_125_1(result) {
  _$jscoverage['/base/create.js'].branchData['125'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['120'][1].init(419, 106, 'lostLeadingTailWhitespace && (whitespaceMatch = html.match(R_LEADING_WHITESPACE))');
function visit129_120_1(result) {
  _$jscoverage['/base/create.js'].branchData['120'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['118'][1].init(309, 31, 'creators[tag] || defaultCreator');
function visit128_118_1(result) {
  _$jscoverage['/base/create.js'].branchData['118'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['114'][1].init(165, 36, '(m = RE_TAG.exec(html)) && (k = m[1])');
function visit127_114_1(result) {
  _$jscoverage['/base/create.js'].branchData['114'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['102'][1].init(814, 18, '!R_HTML.test(html)');
function visit126_102_1(result) {
  _$jscoverage['/base/create.js'].branchData['102'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['96'][1].init(127, 15, 'ownerDoc || doc');
function visit125_96_1(result) {
  _$jscoverage['/base/create.js'].branchData['96'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['89'][1].init(449, 5, '_trim');
function visit124_89_1(result) {
  _$jscoverage['/base/create.js'].branchData['89'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['85'][1].init(349, 19, '_trim === undefined');
function visit123_85_1(result) {
  _$jscoverage['/base/create.js'].branchData['85'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['81'][1].init(247, 23, 'typeof html != \'string\'');
function visit122_81_1(result) {
  _$jscoverage['/base/create.js'].branchData['81'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['76'][1].init(141, 13, 'html.nodeType');
function visit121_76_1(result) {
  _$jscoverage['/base/create.js'].branchData['76'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['72'][1].init(57, 5, '!html');
function visit120_72_1(result) {
  _$jscoverage['/base/create.js'].branchData['72'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['40'][1].init(135, 22, 'holder === DEFAULT_DIV');
function visit119_40_1(result) {
  _$jscoverage['/base/create.js'].branchData['40'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['37'][2].init(35, 15, 'ownerDoc != doc');
function visit118_37_2(result) {
  _$jscoverage['/base/create.js'].branchData['37'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['37'][1].init(23, 27, 'ownerDoc && ownerDoc != doc');
function visit117_37_1(result) {
  _$jscoverage['/base/create.js'].branchData['37'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['30'][1].init(62, 8, 'DOMEvent');
function visit116_30_1(result) {
  _$jscoverage['/base/create.js'].branchData['30'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['20'][1].init(537, 41, 'doc && \'outerHTML\' in doc.documentElement');
function visit115_20_1(result) {
  _$jscoverage['/base/create.js'].branchData['20'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['18'][2].init(470, 6, 'ie < 9');
function visit114_18_2(result) {
  _$jscoverage['/base/create.js'].branchData['18'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['18'][1].init(464, 12, 'ie && ie < 9');
function visit113_18_1(result) {
  _$jscoverage['/base/create.js'].branchData['18'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['13'][1].init(190, 29, 'doc && doc.createElement(DIV)');
function visit112_13_1(result) {
  _$jscoverage['/base/create.js'].branchData['13'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].lineData[6]++;
KISSY.add('dom/base/create', function(S, Dom, undefined) {
  _$jscoverage['/base/create.js'].functionData[0]++;
  _$jscoverage['/base/create.js'].lineData[7]++;
  var doc = S.Env.host.document, NodeType = Dom.NodeType, UA = S.UA, ie = UA['ie'], DIV = 'div', PARENT_NODE = 'parentNode', DEFAULT_DIV = visit112_13_1(doc && doc.createElement(DIV)), R_XHTML_TAG = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/ig, RE_TAG = /<([\w:]+)/, R_LEADING_WHITESPACE = /^\s+/, R_TAIL_WHITESPACE = /\s+$/, lostLeadingTailWhitespace = visit113_18_1(ie && visit114_18_2(ie < 9)), R_HTML = /<|&#?\w+;/, supportOuterHTML = visit115_20_1(doc && 'outerHTML' in doc.documentElement), RE_SIMPLE_TAG = /^<(\w+)\s*\/?>(?:<\/\1>)?$/;
  _$jscoverage['/base/create.js'].lineData[24]++;
  function getElementsByTagName(el, tag) {
    _$jscoverage['/base/create.js'].functionData[1]++;
    _$jscoverage['/base/create.js'].lineData[25]++;
    return el.getElementsByTagName(tag);
  }
  _$jscoverage['/base/create.js'].lineData[28]++;
  function cleanData(els) {
    _$jscoverage['/base/create.js'].functionData[2]++;
    _$jscoverage['/base/create.js'].lineData[29]++;
    var DOMEvent = S.require('event/dom');
    _$jscoverage['/base/create.js'].lineData[30]++;
    if (visit116_30_1(DOMEvent)) {
      _$jscoverage['/base/create.js'].lineData[31]++;
      DOMEvent.detach(els);
    }
    _$jscoverage['/base/create.js'].lineData[33]++;
    Dom.removeData(els);
  }
  _$jscoverage['/base/create.js'].lineData[36]++;
  function getHolderDiv(ownerDoc) {
    _$jscoverage['/base/create.js'].functionData[3]++;
    _$jscoverage['/base/create.js'].lineData[37]++;
    var holder = visit117_37_1(ownerDoc && visit118_37_2(ownerDoc != doc)) ? ownerDoc.createElement(DIV) : DEFAULT_DIV;
    _$jscoverage['/base/create.js'].lineData[40]++;
    if (visit119_40_1(holder === DEFAULT_DIV)) {
      _$jscoverage['/base/create.js'].lineData[41]++;
      holder.innerHTML = '';
    }
    _$jscoverage['/base/create.js'].lineData[43]++;
    return holder;
  }
  _$jscoverage['/base/create.js'].lineData[46]++;
  function defaultCreator(html, ownerDoc) {
    _$jscoverage['/base/create.js'].functionData[4]++;
    _$jscoverage['/base/create.js'].lineData[47]++;
    var frag = getHolderDiv(ownerDoc);
    _$jscoverage['/base/create.js'].lineData[49]++;
    frag.innerHTML = 'm<div>' + html + '<' + '/div>';
    _$jscoverage['/base/create.js'].lineData[50]++;
    return frag.lastChild;
  }
  _$jscoverage['/base/create.js'].lineData[53]++;
  S.mix(Dom, {
  create: function(html, props, ownerDoc, _trim) {
  _$jscoverage['/base/create.js'].functionData[5]++;
  _$jscoverage['/base/create.js'].lineData[70]++;
  var ret = null;
  _$jscoverage['/base/create.js'].lineData[72]++;
  if (visit120_72_1(!html)) {
    _$jscoverage['/base/create.js'].lineData[73]++;
    return ret;
  }
  _$jscoverage['/base/create.js'].lineData[76]++;
  if (visit121_76_1(html.nodeType)) {
    _$jscoverage['/base/create.js'].lineData[77]++;
    return Dom.clone(html);
  }
  _$jscoverage['/base/create.js'].lineData[81]++;
  if (visit122_81_1(typeof html != 'string')) {
    _$jscoverage['/base/create.js'].lineData[82]++;
    return ret;
  }
  _$jscoverage['/base/create.js'].lineData[85]++;
  if (visit123_85_1(_trim === undefined)) {
    _$jscoverage['/base/create.js'].lineData[86]++;
    _trim = true;
  }
  _$jscoverage['/base/create.js'].lineData[89]++;
  if (visit124_89_1(_trim)) {
    _$jscoverage['/base/create.js'].lineData[90]++;
    html = S.trim(html);
  }
  _$jscoverage['/base/create.js'].lineData[93]++;
  var creators = Dom._creators, holder, whitespaceMatch, context = visit125_96_1(ownerDoc || doc), m, tag = DIV, k, nodes;
  _$jscoverage['/base/create.js'].lineData[102]++;
  if (visit126_102_1(!R_HTML.test(html))) {
    _$jscoverage['/base/create.js'].lineData[103]++;
    ret = context.createTextNode(html);
  } else {
    _$jscoverage['/base/create.js'].lineData[106]++;
    if ((m = RE_SIMPLE_TAG.exec(html))) {
      _$jscoverage['/base/create.js'].lineData[107]++;
      ret = context.createElement(m[1]);
    } else {
      _$jscoverage['/base/create.js'].lineData[112]++;
      html = html.replace(R_XHTML_TAG, '<$1><' + '/$2>');
      _$jscoverage['/base/create.js'].lineData[114]++;
      if (visit127_114_1((m = RE_TAG.exec(html)) && (k = m[1]))) {
        _$jscoverage['/base/create.js'].lineData[115]++;
        tag = k.toLowerCase();
      }
      _$jscoverage['/base/create.js'].lineData[118]++;
      holder = (visit128_118_1(creators[tag] || defaultCreator))(html, context);
      _$jscoverage['/base/create.js'].lineData[120]++;
      if (visit129_120_1(lostLeadingTailWhitespace && (whitespaceMatch = html.match(R_LEADING_WHITESPACE)))) {
        _$jscoverage['/base/create.js'].lineData[122]++;
        holder.insertBefore(context.createTextNode(whitespaceMatch[0]), holder.firstChild);
      }
      _$jscoverage['/base/create.js'].lineData[125]++;
      if (visit130_125_1(lostLeadingTailWhitespace && visit131_125_2(/\S/.test(html) && (whitespaceMatch = html.match(R_TAIL_WHITESPACE))))) {
        _$jscoverage['/base/create.js'].lineData[127]++;
        holder.appendChild(context.createTextNode(whitespaceMatch[0]));
      }
      _$jscoverage['/base/create.js'].lineData[130]++;
      nodes = holder.childNodes;
      _$jscoverage['/base/create.js'].lineData[132]++;
      if (visit132_132_1(nodes.length === 1)) {
        _$jscoverage['/base/create.js'].lineData[134]++;
        ret = nodes[0][PARENT_NODE].removeChild(nodes[0]);
      } else {
        _$jscoverage['/base/create.js'].lineData[135]++;
        if (visit133_135_1(nodes.length)) {
          _$jscoverage['/base/create.js'].lineData[137]++;
          ret = nodeListToFragment(nodes);
        } else {
          _$jscoverage['/base/create.js'].lineData[139]++;
          S.error(html + ' : create node error');
        }
      }
    }
  }
  _$jscoverage['/base/create.js'].lineData[143]++;
  return attachProps(ret, props);
}, 
  _fixCloneAttributes: function(src, dest) {
  _$jscoverage['/base/create.js'].functionData[6]++;
  _$jscoverage['/base/create.js'].lineData[148]++;
  if (visit134_148_1(Dom.nodeName(src) === 'textarea')) {
    _$jscoverage['/base/create.js'].lineData[149]++;
    dest.defaultValue = src.defaultValue;
    _$jscoverage['/base/create.js'].lineData[150]++;
    dest.value = src.value;
  }
}, 
  _creators: {
  div: defaultCreator}, 
  _defaultCreator: defaultCreator, 
  html: function(selector, htmlString, loadScripts) {
  _$jscoverage['/base/create.js'].functionData[7]++;
  _$jscoverage['/base/create.js'].lineData[170]++;
  var els = Dom.query(selector), el = els[0], success = false, valNode, i, elem;
  _$jscoverage['/base/create.js'].lineData[175]++;
  if (visit135_175_1(!el)) {
    _$jscoverage['/base/create.js'].lineData[176]++;
    return null;
  }
  _$jscoverage['/base/create.js'].lineData[179]++;
  if (visit136_179_1(htmlString === undefined)) {
    _$jscoverage['/base/create.js'].lineData[181]++;
    if (visit137_181_1(el.nodeType == NodeType.ELEMENT_NODE)) {
      _$jscoverage['/base/create.js'].lineData[182]++;
      return el.innerHTML;
    } else {
      _$jscoverage['/base/create.js'].lineData[183]++;
      if (visit138_183_1(el.nodeType == NodeType.DOCUMENT_FRAGMENT_NODE)) {
        _$jscoverage['/base/create.js'].lineData[184]++;
        var holder = getHolderDiv(el.ownerDocument);
        _$jscoverage['/base/create.js'].lineData[185]++;
        holder.appendChild(el);
        _$jscoverage['/base/create.js'].lineData[186]++;
        return holder.innerHTML;
      } else {
        _$jscoverage['/base/create.js'].lineData[188]++;
        return null;
      }
    }
  } else {
    _$jscoverage['/base/create.js'].lineData[193]++;
    htmlString += '';
    _$jscoverage['/base/create.js'].lineData[197]++;
    if (visit139_197_1(!htmlString.match(/<(?:script|style|link)/i) && visit140_198_1((visit141_198_2(!lostLeadingTailWhitespace || !htmlString.match(R_LEADING_WHITESPACE))) && !creatorsMap[(visit142_198_3(htmlString.match(RE_TAG) || ['', '']))[1].toLowerCase()]))) {
      _$jscoverage['/base/create.js'].lineData[200]++;
      try {
        _$jscoverage['/base/create.js'].lineData[201]++;
        for (i = els.length - 1; visit143_201_1(i >= 0); i--) {
          _$jscoverage['/base/create.js'].lineData[202]++;
          elem = els[i];
          _$jscoverage['/base/create.js'].lineData[203]++;
          if (visit144_203_1(elem.nodeType == NodeType.ELEMENT_NODE)) {
            _$jscoverage['/base/create.js'].lineData[204]++;
            cleanData(getElementsByTagName(elem, '*'));
            _$jscoverage['/base/create.js'].lineData[205]++;
            elem.innerHTML = htmlString;
          }
        }
        _$jscoverage['/base/create.js'].lineData[208]++;
        success = true;
      }      catch (e) {
}
    }
    _$jscoverage['/base/create.js'].lineData[216]++;
    if (visit145_216_1(!success)) {
      _$jscoverage['/base/create.js'].lineData[217]++;
      valNode = Dom.create(htmlString, 0, el.ownerDocument, 0);
      _$jscoverage['/base/create.js'].lineData[218]++;
      Dom.empty(els);
      _$jscoverage['/base/create.js'].lineData[219]++;
      Dom.append(valNode, els, loadScripts);
    }
  }
  _$jscoverage['/base/create.js'].lineData[222]++;
  return undefined;
}, 
  outerHtml: function(selector, htmlString, loadScripts) {
  _$jscoverage['/base/create.js'].functionData[8]++;
  _$jscoverage['/base/create.js'].lineData[234]++;
  var els = Dom.query(selector), holder, i, valNode, length = els.length, el = els[0];
  _$jscoverage['/base/create.js'].lineData[240]++;
  if (visit146_240_1(!el)) {
    _$jscoverage['/base/create.js'].lineData[241]++;
    return null;
  }
  _$jscoverage['/base/create.js'].lineData[244]++;
  if (visit147_244_1(htmlString === undefined)) {
    _$jscoverage['/base/create.js'].lineData[245]++;
    if (visit148_245_1(supportOuterHTML && visit149_245_2(el.nodeType != Dom.DOCUMENT_FRAGMENT_NODE))) {
      _$jscoverage['/base/create.js'].lineData[246]++;
      return el.outerHTML;
    } else {
      _$jscoverage['/base/create.js'].lineData[248]++;
      holder = getHolderDiv(el.ownerDocument);
      _$jscoverage['/base/create.js'].lineData[249]++;
      holder.appendChild(Dom.clone(el, true));
      _$jscoverage['/base/create.js'].lineData[250]++;
      return holder.innerHTML;
    }
  } else {
    _$jscoverage['/base/create.js'].lineData[253]++;
    htmlString += '';
    _$jscoverage['/base/create.js'].lineData[254]++;
    if (visit150_254_1(!htmlString.match(/<(?:script|style|link)/i) && supportOuterHTML)) {
      _$jscoverage['/base/create.js'].lineData[255]++;
      for (i = length - 1; visit151_255_1(i >= 0); i--) {
        _$jscoverage['/base/create.js'].lineData[256]++;
        el = els[i];
        _$jscoverage['/base/create.js'].lineData[257]++;
        if (visit152_257_1(el.nodeType == NodeType.ELEMENT_NODE)) {
          _$jscoverage['/base/create.js'].lineData[258]++;
          cleanData(el);
          _$jscoverage['/base/create.js'].lineData[259]++;
          cleanData(getElementsByTagName(el, '*'));
          _$jscoverage['/base/create.js'].lineData[260]++;
          el.outerHTML = htmlString;
        }
      }
    } else {
      _$jscoverage['/base/create.js'].lineData[264]++;
      valNode = Dom.create(htmlString, 0, el.ownerDocument, 0);
      _$jscoverage['/base/create.js'].lineData[265]++;
      Dom.insertBefore(valNode, els, loadScripts);
      _$jscoverage['/base/create.js'].lineData[266]++;
      Dom.remove(els);
    }
  }
  _$jscoverage['/base/create.js'].lineData[269]++;
  return undefined;
}, 
  remove: function(selector, keepData) {
  _$jscoverage['/base/create.js'].functionData[9]++;
  _$jscoverage['/base/create.js'].lineData[278]++;
  var el, els = Dom.query(selector), all, parent, DOMEvent = S.require('event/dom'), i;
  _$jscoverage['/base/create.js'].lineData[284]++;
  for (i = els.length - 1; visit153_284_1(i >= 0); i--) {
    _$jscoverage['/base/create.js'].lineData[285]++;
    el = els[i];
    _$jscoverage['/base/create.js'].lineData[286]++;
    if (visit154_286_1(!keepData && visit155_286_2(el.nodeType == NodeType.ELEMENT_NODE))) {
      _$jscoverage['/base/create.js'].lineData[287]++;
      all = S.makeArray(getElementsByTagName(el, '*'));
      _$jscoverage['/base/create.js'].lineData[288]++;
      all.push(el);
      _$jscoverage['/base/create.js'].lineData[289]++;
      Dom.removeData(all);
      _$jscoverage['/base/create.js'].lineData[290]++;
      if (visit156_290_1(DOMEvent)) {
        _$jscoverage['/base/create.js'].lineData[291]++;
        DOMEvent.detach(all);
      }
    }
    _$jscoverage['/base/create.js'].lineData[294]++;
    if (visit157_294_1(parent = el.parentNode)) {
      _$jscoverage['/base/create.js'].lineData[300]++;
            visit158_300_1(UA.ie && visit159_300_2(parent.canHaveChildren && "removeNode" in el)) ? el.removeNode(false) : parent.removeChild(el);
    }
  }
}, 
  clone: function(selector, deep, withDataAndEvent, deepWithDataAndEvent) {
  _$jscoverage['/base/create.js'].functionData[10]++;
  _$jscoverage['/base/create.js'].lineData[327]++;
  if (visit160_327_1(typeof deep === 'object')) {
    _$jscoverage['/base/create.js'].lineData[328]++;
    deepWithDataAndEvent = deep['deepWithDataAndEvent'];
    _$jscoverage['/base/create.js'].lineData[329]++;
    withDataAndEvent = deep['withDataAndEvent'];
    _$jscoverage['/base/create.js'].lineData[330]++;
    deep = deep['deep'];
  }
  _$jscoverage['/base/create.js'].lineData[333]++;
  var elem = Dom.get(selector), clone, _fixCloneAttributes = Dom._fixCloneAttributes, elemNodeType;
  _$jscoverage['/base/create.js'].lineData[338]++;
  if (visit161_338_1(!elem)) {
    _$jscoverage['/base/create.js'].lineData[339]++;
    return null;
  }
  _$jscoverage['/base/create.js'].lineData[342]++;
  elemNodeType = elem.nodeType;
  _$jscoverage['/base/create.js'].lineData[348]++;
  clone = elem.cloneNode(deep);
  _$jscoverage['/base/create.js'].lineData[352]++;
  if (visit162_352_1(visit163_352_2(elemNodeType == NodeType.ELEMENT_NODE) || visit164_353_1(elemNodeType == NodeType.DOCUMENT_FRAGMENT_NODE))) {
    _$jscoverage['/base/create.js'].lineData[359]++;
    if (visit165_359_1(_fixCloneAttributes && visit166_359_2(elemNodeType == NodeType.ELEMENT_NODE))) {
      _$jscoverage['/base/create.js'].lineData[360]++;
      _fixCloneAttributes(elem, clone);
    }
    _$jscoverage['/base/create.js'].lineData[363]++;
    if (visit167_363_1(deep && _fixCloneAttributes)) {
      _$jscoverage['/base/create.js'].lineData[364]++;
      processAll(_fixCloneAttributes, elem, clone);
    }
  }
  _$jscoverage['/base/create.js'].lineData[368]++;
  if (visit168_368_1(withDataAndEvent)) {
    _$jscoverage['/base/create.js'].lineData[369]++;
    cloneWithDataAndEvent(elem, clone);
    _$jscoverage['/base/create.js'].lineData[370]++;
    if (visit169_370_1(deep && deepWithDataAndEvent)) {
      _$jscoverage['/base/create.js'].lineData[371]++;
      processAll(cloneWithDataAndEvent, elem, clone);
    }
  }
  _$jscoverage['/base/create.js'].lineData[374]++;
  return clone;
}, 
  empty: function(selector) {
  _$jscoverage['/base/create.js'].functionData[11]++;
  _$jscoverage['/base/create.js'].lineData[382]++;
  var els = Dom.query(selector), el, i;
  _$jscoverage['/base/create.js'].lineData[384]++;
  for (i = els.length - 1; visit170_384_1(i >= 0); i--) {
    _$jscoverage['/base/create.js'].lineData[385]++;
    el = els[i];
    _$jscoverage['/base/create.js'].lineData[386]++;
    Dom.remove(el.childNodes);
  }
}, 
  _nodeListToFragment: nodeListToFragment});
  _$jscoverage['/base/create.js'].lineData[394]++;
  Dom.outerHTML = Dom.outerHtml;
  _$jscoverage['/base/create.js'].lineData[396]++;
  function processAll(fn, elem, clone) {
    _$jscoverage['/base/create.js'].functionData[12]++;
    _$jscoverage['/base/create.js'].lineData[397]++;
    var elemNodeType = elem.nodeType;
    _$jscoverage['/base/create.js'].lineData[398]++;
    if (visit171_398_1(elemNodeType == NodeType.DOCUMENT_FRAGMENT_NODE)) {
      _$jscoverage['/base/create.js'].lineData[399]++;
      var eCs = elem.childNodes, cloneCs = clone.childNodes, fIndex = 0;
      _$jscoverage['/base/create.js'].lineData[402]++;
      while (eCs[fIndex]) {
        _$jscoverage['/base/create.js'].lineData[403]++;
        if (visit172_403_1(cloneCs[fIndex])) {
          _$jscoverage['/base/create.js'].lineData[404]++;
          processAll(fn, eCs[fIndex], cloneCs[fIndex]);
        }
        _$jscoverage['/base/create.js'].lineData[406]++;
        fIndex++;
      }
    } else {
      _$jscoverage['/base/create.js'].lineData[408]++;
      if (visit173_408_1(elemNodeType == NodeType.ELEMENT_NODE)) {
        _$jscoverage['/base/create.js'].lineData[409]++;
        var elemChildren = getElementsByTagName(elem, '*'), cloneChildren = getElementsByTagName(clone, '*'), cIndex = 0;
        _$jscoverage['/base/create.js'].lineData[412]++;
        while (elemChildren[cIndex]) {
          _$jscoverage['/base/create.js'].lineData[413]++;
          if (visit174_413_1(cloneChildren[cIndex])) {
            _$jscoverage['/base/create.js'].lineData[414]++;
            fn(elemChildren[cIndex], cloneChildren[cIndex]);
          }
          _$jscoverage['/base/create.js'].lineData[416]++;
          cIndex++;
        }
      }
    }
  }
  _$jscoverage['/base/create.js'].lineData[422]++;
  function cloneWithDataAndEvent(src, dest) {
    _$jscoverage['/base/create.js'].functionData[13]++;
    _$jscoverage['/base/create.js'].lineData[423]++;
    var DOMEvent = S.require('event/dom'), srcData, d;
    _$jscoverage['/base/create.js'].lineData[427]++;
    if (visit175_427_1(visit176_427_2(dest.nodeType == NodeType.ELEMENT_NODE) && !Dom.hasData(src))) {
      _$jscoverage['/base/create.js'].lineData[428]++;
      return;
    }
    _$jscoverage['/base/create.js'].lineData[431]++;
    srcData = Dom.data(src);
    _$jscoverage['/base/create.js'].lineData[434]++;
    for (d in srcData) {
      _$jscoverage['/base/create.js'].lineData[435]++;
      Dom.data(dest, d, srcData[d]);
    }
    _$jscoverage['/base/create.js'].lineData[439]++;
    if (visit177_439_1(DOMEvent)) {
      _$jscoverage['/base/create.js'].lineData[441]++;
      DOMEvent.clone(src, dest);
    }
  }
  _$jscoverage['/base/create.js'].lineData[446]++;
  function attachProps(elem, props) {
    _$jscoverage['/base/create.js'].functionData[14]++;
    _$jscoverage['/base/create.js'].lineData[447]++;
    if (visit178_447_1(S.isPlainObject(props))) {
      _$jscoverage['/base/create.js'].lineData[448]++;
      if (visit179_448_1(elem.nodeType == NodeType.ELEMENT_NODE)) {
        _$jscoverage['/base/create.js'].lineData[449]++;
        Dom.attr(elem, props, true);
      } else {
        _$jscoverage['/base/create.js'].lineData[452]++;
        if (visit180_452_1(elem.nodeType == NodeType.DOCUMENT_FRAGMENT_NODE)) {
          _$jscoverage['/base/create.js'].lineData[453]++;
          Dom.attr(elem.childNodes, props, true);
        }
      }
    }
    _$jscoverage['/base/create.js'].lineData[456]++;
    return elem;
  }
  _$jscoverage['/base/create.js'].lineData[460]++;
  function nodeListToFragment(nodes) {
    _$jscoverage['/base/create.js'].functionData[15]++;
    _$jscoverage['/base/create.js'].lineData[461]++;
    var ret = null, i, ownerDoc, len;
    _$jscoverage['/base/create.js'].lineData[465]++;
    if (visit181_465_1(nodes && visit182_465_2((visit183_465_3(nodes.push || nodes.item)) && nodes[0]))) {
      _$jscoverage['/base/create.js'].lineData[466]++;
      ownerDoc = nodes[0].ownerDocument;
      _$jscoverage['/base/create.js'].lineData[467]++;
      ret = ownerDoc.createDocumentFragment();
      _$jscoverage['/base/create.js'].lineData[468]++;
      nodes = S.makeArray(nodes);
      _$jscoverage['/base/create.js'].lineData[469]++;
      for (i = 0 , len = nodes.length; visit184_469_1(i < len); i++) {
        _$jscoverage['/base/create.js'].lineData[470]++;
        ret.appendChild(nodes[i]);
      }
    } else {
      _$jscoverage['/base/create.js'].lineData[473]++;
      S.log('Unable to convert ' + nodes + ' to fragment.');
    }
    _$jscoverage['/base/create.js'].lineData[475]++;
    return ret;
  }
  _$jscoverage['/base/create.js'].lineData[479]++;
  var creators = Dom._creators, create = Dom.create, creatorsMap = {
  area: 'map', 
  thead: 'table', 
  td: 'tr', 
  th: 'tr', 
  tr: 'tbody', 
  tbody: 'table', 
  tfoot: 'table', 
  caption: 'table', 
  colgroup: 'table', 
  col: 'colgroup', 
  legend: 'fieldset'}, p;
  _$jscoverage['/base/create.js'].lineData[495]++;
  for (p in creatorsMap) {
    _$jscoverage['/base/create.js'].lineData[496]++;
    (function(tag) {
  _$jscoverage['/base/create.js'].functionData[16]++;
  _$jscoverage['/base/create.js'].lineData[497]++;
  creators[p] = function(html, ownerDoc) {
  _$jscoverage['/base/create.js'].functionData[17]++;
  _$jscoverage['/base/create.js'].lineData[498]++;
  return create('<' + tag + '>' + html + '<' + '/' + tag + '>', undefined, ownerDoc);
};
})(creatorsMap[p]);
  }
  _$jscoverage['/base/create.js'].lineData[506]++;
  creatorsMap['option'] = creatorsMap['optgroup'] = function(html, ownerDoc) {
  _$jscoverage['/base/create.js'].functionData[18]++;
  _$jscoverage['/base/create.js'].lineData[507]++;
  return create('<select multiple="multiple">' + html + '</select>', undefined, ownerDoc);
};
  _$jscoverage['/base/create.js'].lineData[510]++;
  return Dom;
}, {
  requires: ['./api']});
