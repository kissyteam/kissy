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
if (! _$jscoverage['/mvc/router.js']) {
  _$jscoverage['/mvc/router.js'] = {};
  _$jscoverage['/mvc/router.js'].lineData = [];
  _$jscoverage['/mvc/router.js'].lineData[5] = 0;
  _$jscoverage['/mvc/router.js'].lineData[6] = 0;
  _$jscoverage['/mvc/router.js'].lineData[20] = 0;
  _$jscoverage['/mvc/router.js'].lineData[21] = 0;
  _$jscoverage['/mvc/router.js'].lineData[22] = 0;
  _$jscoverage['/mvc/router.js'].lineData[23] = 0;
  _$jscoverage['/mvc/router.js'].lineData[25] = 0;
  _$jscoverage['/mvc/router.js'].lineData[26] = 0;
  _$jscoverage['/mvc/router.js'].lineData[27] = 0;
  _$jscoverage['/mvc/router.js'].lineData[28] = 0;
  _$jscoverage['/mvc/router.js'].lineData[31] = 0;
  _$jscoverage['/mvc/router.js'].lineData[34] = 0;
  _$jscoverage['/mvc/router.js'].lineData[44] = 0;
  _$jscoverage['/mvc/router.js'].lineData[50] = 0;
  _$jscoverage['/mvc/router.js'].lineData[51] = 0;
  _$jscoverage['/mvc/router.js'].lineData[52] = 0;
  _$jscoverage['/mvc/router.js'].lineData[53] = 0;
  _$jscoverage['/mvc/router.js'].lineData[54] = 0;
  _$jscoverage['/mvc/router.js'].lineData[55] = 0;
  _$jscoverage['/mvc/router.js'].lineData[57] = 0;
  _$jscoverage['/mvc/router.js'].lineData[69] = 0;
  _$jscoverage['/mvc/router.js'].lineData[70] = 0;
  _$jscoverage['/mvc/router.js'].lineData[73] = 0;
  _$jscoverage['/mvc/router.js'].lineData[74] = 0;
  _$jscoverage['/mvc/router.js'].lineData[77] = 0;
  _$jscoverage['/mvc/router.js'].lineData[78] = 0;
  _$jscoverage['/mvc/router.js'].lineData[79] = 0;
  _$jscoverage['/mvc/router.js'].lineData[81] = 0;
  _$jscoverage['/mvc/router.js'].lineData[84] = 0;
  _$jscoverage['/mvc/router.js'].lineData[85] = 0;
  _$jscoverage['/mvc/router.js'].lineData[86] = 0;
  _$jscoverage['/mvc/router.js'].lineData[88] = 0;
  _$jscoverage['/mvc/router.js'].lineData[91] = 0;
  _$jscoverage['/mvc/router.js'].lineData[92] = 0;
  _$jscoverage['/mvc/router.js'].lineData[95] = 0;
  _$jscoverage['/mvc/router.js'].lineData[96] = 0;
  _$jscoverage['/mvc/router.js'].lineData[97] = 0;
  _$jscoverage['/mvc/router.js'].lineData[99] = 0;
  _$jscoverage['/mvc/router.js'].lineData[103] = 0;
  _$jscoverage['/mvc/router.js'].lineData[104] = 0;
  _$jscoverage['/mvc/router.js'].lineData[105] = 0;
  _$jscoverage['/mvc/router.js'].lineData[106] = 0;
  _$jscoverage['/mvc/router.js'].lineData[117] = 0;
  _$jscoverage['/mvc/router.js'].lineData[118] = 0;
  _$jscoverage['/mvc/router.js'].lineData[125] = 0;
  _$jscoverage['/mvc/router.js'].lineData[126] = 0;
  _$jscoverage['/mvc/router.js'].lineData[138] = 0;
  _$jscoverage['/mvc/router.js'].lineData[139] = 0;
  _$jscoverage['/mvc/router.js'].lineData[140] = 0;
  _$jscoverage['/mvc/router.js'].lineData[143] = 0;
  _$jscoverage['/mvc/router.js'].lineData[144] = 0;
  _$jscoverage['/mvc/router.js'].lineData[147] = 0;
  _$jscoverage['/mvc/router.js'].lineData[148] = 0;
  _$jscoverage['/mvc/router.js'].lineData[155] = 0;
  _$jscoverage['/mvc/router.js'].lineData[157] = 0;
  _$jscoverage['/mvc/router.js'].lineData[159] = 0;
  _$jscoverage['/mvc/router.js'].lineData[160] = 0;
  _$jscoverage['/mvc/router.js'].lineData[161] = 0;
  _$jscoverage['/mvc/router.js'].lineData[162] = 0;
  _$jscoverage['/mvc/router.js'].lineData[163] = 0;
  _$jscoverage['/mvc/router.js'].lineData[165] = 0;
  _$jscoverage['/mvc/router.js'].lineData[169] = 0;
  _$jscoverage['/mvc/router.js'].lineData[173] = 0;
  _$jscoverage['/mvc/router.js'].lineData[174] = 0;
  _$jscoverage['/mvc/router.js'].lineData[175] = 0;
  _$jscoverage['/mvc/router.js'].lineData[176] = 0;
  _$jscoverage['/mvc/router.js'].lineData[177] = 0;
  _$jscoverage['/mvc/router.js'].lineData[178] = 0;
  _$jscoverage['/mvc/router.js'].lineData[179] = 0;
  _$jscoverage['/mvc/router.js'].lineData[180] = 0;
  _$jscoverage['/mvc/router.js'].lineData[184] = 0;
  _$jscoverage['/mvc/router.js'].lineData[185] = 0;
  _$jscoverage['/mvc/router.js'].lineData[186] = 0;
  _$jscoverage['/mvc/router.js'].lineData[187] = 0;
  _$jscoverage['/mvc/router.js'].lineData[189] = 0;
  _$jscoverage['/mvc/router.js'].lineData[191] = 0;
  _$jscoverage['/mvc/router.js'].lineData[195] = 0;
  _$jscoverage['/mvc/router.js'].lineData[196] = 0;
  _$jscoverage['/mvc/router.js'].lineData[199] = 0;
  _$jscoverage['/mvc/router.js'].lineData[205] = 0;
  _$jscoverage['/mvc/router.js'].lineData[206] = 0;
  _$jscoverage['/mvc/router.js'].lineData[207] = 0;
  _$jscoverage['/mvc/router.js'].lineData[208] = 0;
  _$jscoverage['/mvc/router.js'].lineData[213] = 0;
  _$jscoverage['/mvc/router.js'].lineData[214] = 0;
  _$jscoverage['/mvc/router.js'].lineData[221] = 0;
  _$jscoverage['/mvc/router.js'].lineData[222] = 0;
  _$jscoverage['/mvc/router.js'].lineData[223] = 0;
  _$jscoverage['/mvc/router.js'].lineData[226] = 0;
  _$jscoverage['/mvc/router.js'].lineData[230] = 0;
  _$jscoverage['/mvc/router.js'].lineData[231] = 0;
  _$jscoverage['/mvc/router.js'].lineData[233] = 0;
  _$jscoverage['/mvc/router.js'].lineData[237] = 0;
  _$jscoverage['/mvc/router.js'].lineData[238] = 0;
  _$jscoverage['/mvc/router.js'].lineData[239] = 0;
  _$jscoverage['/mvc/router.js'].lineData[243] = 0;
  _$jscoverage['/mvc/router.js'].lineData[250] = 0;
  _$jscoverage['/mvc/router.js'].lineData[251] = 0;
  _$jscoverage['/mvc/router.js'].lineData[261] = 0;
  _$jscoverage['/mvc/router.js'].lineData[262] = 0;
  _$jscoverage['/mvc/router.js'].lineData[265] = 0;
  _$jscoverage['/mvc/router.js'].lineData[267] = 0;
  _$jscoverage['/mvc/router.js'].lineData[269] = 0;
  _$jscoverage['/mvc/router.js'].lineData[270] = 0;
  _$jscoverage['/mvc/router.js'].lineData[272] = 0;
  _$jscoverage['/mvc/router.js'].lineData[273] = 0;
  _$jscoverage['/mvc/router.js'].lineData[276] = 0;
  _$jscoverage['/mvc/router.js'].lineData[277] = 0;
  _$jscoverage['/mvc/router.js'].lineData[279] = 0;
  _$jscoverage['/mvc/router.js'].lineData[282] = 0;
  _$jscoverage['/mvc/router.js'].lineData[290] = 0;
  _$jscoverage['/mvc/router.js'].lineData[303] = 0;
  _$jscoverage['/mvc/router.js'].lineData[304] = 0;
  _$jscoverage['/mvc/router.js'].lineData[305] = 0;
  _$jscoverage['/mvc/router.js'].lineData[306] = 0;
  _$jscoverage['/mvc/router.js'].lineData[307] = 0;
  _$jscoverage['/mvc/router.js'].lineData[309] = 0;
  _$jscoverage['/mvc/router.js'].lineData[312] = 0;
  _$jscoverage['/mvc/router.js'].lineData[313] = 0;
  _$jscoverage['/mvc/router.js'].lineData[314] = 0;
  _$jscoverage['/mvc/router.js'].lineData[315] = 0;
  _$jscoverage['/mvc/router.js'].lineData[318] = 0;
  _$jscoverage['/mvc/router.js'].lineData[327] = 0;
  _$jscoverage['/mvc/router.js'].lineData[329] = 0;
  _$jscoverage['/mvc/router.js'].lineData[330] = 0;
  _$jscoverage['/mvc/router.js'].lineData[331] = 0;
  _$jscoverage['/mvc/router.js'].lineData[332] = 0;
  _$jscoverage['/mvc/router.js'].lineData[350] = 0;
  _$jscoverage['/mvc/router.js'].lineData[351] = 0;
  _$jscoverage['/mvc/router.js'].lineData[352] = 0;
  _$jscoverage['/mvc/router.js'].lineData[382] = 0;
  _$jscoverage['/mvc/router.js'].lineData[384] = 0;
  _$jscoverage['/mvc/router.js'].lineData[385] = 0;
  _$jscoverage['/mvc/router.js'].lineData[386] = 0;
  _$jscoverage['/mvc/router.js'].lineData[387] = 0;
  _$jscoverage['/mvc/router.js'].lineData[388] = 0;
  _$jscoverage['/mvc/router.js'].lineData[389] = 0;
  _$jscoverage['/mvc/router.js'].lineData[390] = 0;
  _$jscoverage['/mvc/router.js'].lineData[392] = 0;
  _$jscoverage['/mvc/router.js'].lineData[394] = 0;
  _$jscoverage['/mvc/router.js'].lineData[395] = 0;
  _$jscoverage['/mvc/router.js'].lineData[397] = 0;
  _$jscoverage['/mvc/router.js'].lineData[399] = 0;
  _$jscoverage['/mvc/router.js'].lineData[408] = 0;
  _$jscoverage['/mvc/router.js'].lineData[409] = 0;
  _$jscoverage['/mvc/router.js'].lineData[421] = 0;
  _$jscoverage['/mvc/router.js'].lineData[422] = 0;
  _$jscoverage['/mvc/router.js'].lineData[423] = 0;
  _$jscoverage['/mvc/router.js'].lineData[424] = 0;
  _$jscoverage['/mvc/router.js'].lineData[425] = 0;
  _$jscoverage['/mvc/router.js'].lineData[430] = 0;
  _$jscoverage['/mvc/router.js'].lineData[432] = 0;
  _$jscoverage['/mvc/router.js'].lineData[433] = 0;
  _$jscoverage['/mvc/router.js'].lineData[435] = 0;
  _$jscoverage['/mvc/router.js'].lineData[438] = 0;
  _$jscoverage['/mvc/router.js'].lineData[441] = 0;
  _$jscoverage['/mvc/router.js'].lineData[442] = 0;
  _$jscoverage['/mvc/router.js'].lineData[453] = 0;
  _$jscoverage['/mvc/router.js'].lineData[455] = 0;
  _$jscoverage['/mvc/router.js'].lineData[456] = 0;
  _$jscoverage['/mvc/router.js'].lineData[460] = 0;
  _$jscoverage['/mvc/router.js'].lineData[462] = 0;
  _$jscoverage['/mvc/router.js'].lineData[468] = 0;
  _$jscoverage['/mvc/router.js'].lineData[469] = 0;
  _$jscoverage['/mvc/router.js'].lineData[471] = 0;
  _$jscoverage['/mvc/router.js'].lineData[473] = 0;
  _$jscoverage['/mvc/router.js'].lineData[479] = 0;
  _$jscoverage['/mvc/router.js'].lineData[480] = 0;
  _$jscoverage['/mvc/router.js'].lineData[482] = 0;
  _$jscoverage['/mvc/router.js'].lineData[483] = 0;
  _$jscoverage['/mvc/router.js'].lineData[485] = 0;
  _$jscoverage['/mvc/router.js'].lineData[494] = 0;
  _$jscoverage['/mvc/router.js'].lineData[495] = 0;
  _$jscoverage['/mvc/router.js'].lineData[496] = 0;
  _$jscoverage['/mvc/router.js'].lineData[502] = 0;
  _$jscoverage['/mvc/router.js'].lineData[504] = 0;
  _$jscoverage['/mvc/router.js'].lineData[505] = 0;
  _$jscoverage['/mvc/router.js'].lineData[509] = 0;
  _$jscoverage['/mvc/router.js'].lineData[511] = 0;
  _$jscoverage['/mvc/router.js'].lineData[517] = 0;
  _$jscoverage['/mvc/router.js'].lineData[518] = 0;
  _$jscoverage['/mvc/router.js'].lineData[520] = 0;
  _$jscoverage['/mvc/router.js'].lineData[524] = 0;
  _$jscoverage['/mvc/router.js'].lineData[525] = 0;
  _$jscoverage['/mvc/router.js'].lineData[529] = 0;
  _$jscoverage['/mvc/router.js'].lineData[530] = 0;
  _$jscoverage['/mvc/router.js'].lineData[531] = 0;
  _$jscoverage['/mvc/router.js'].lineData[532] = 0;
}
if (! _$jscoverage['/mvc/router.js'].functionData) {
  _$jscoverage['/mvc/router.js'].functionData = [];
  _$jscoverage['/mvc/router.js'].functionData[0] = 0;
  _$jscoverage['/mvc/router.js'].functionData[1] = 0;
  _$jscoverage['/mvc/router.js'].functionData[2] = 0;
  _$jscoverage['/mvc/router.js'].functionData[3] = 0;
  _$jscoverage['/mvc/router.js'].functionData[4] = 0;
  _$jscoverage['/mvc/router.js'].functionData[5] = 0;
  _$jscoverage['/mvc/router.js'].functionData[6] = 0;
  _$jscoverage['/mvc/router.js'].functionData[7] = 0;
  _$jscoverage['/mvc/router.js'].functionData[8] = 0;
  _$jscoverage['/mvc/router.js'].functionData[9] = 0;
  _$jscoverage['/mvc/router.js'].functionData[10] = 0;
  _$jscoverage['/mvc/router.js'].functionData[11] = 0;
  _$jscoverage['/mvc/router.js'].functionData[12] = 0;
  _$jscoverage['/mvc/router.js'].functionData[13] = 0;
  _$jscoverage['/mvc/router.js'].functionData[14] = 0;
  _$jscoverage['/mvc/router.js'].functionData[15] = 0;
  _$jscoverage['/mvc/router.js'].functionData[16] = 0;
  _$jscoverage['/mvc/router.js'].functionData[17] = 0;
  _$jscoverage['/mvc/router.js'].functionData[18] = 0;
  _$jscoverage['/mvc/router.js'].functionData[19] = 0;
  _$jscoverage['/mvc/router.js'].functionData[20] = 0;
  _$jscoverage['/mvc/router.js'].functionData[21] = 0;
  _$jscoverage['/mvc/router.js'].functionData[22] = 0;
  _$jscoverage['/mvc/router.js'].functionData[23] = 0;
  _$jscoverage['/mvc/router.js'].functionData[24] = 0;
  _$jscoverage['/mvc/router.js'].functionData[25] = 0;
  _$jscoverage['/mvc/router.js'].functionData[26] = 0;
  _$jscoverage['/mvc/router.js'].functionData[27] = 0;
  _$jscoverage['/mvc/router.js'].functionData[28] = 0;
  _$jscoverage['/mvc/router.js'].functionData[29] = 0;
  _$jscoverage['/mvc/router.js'].functionData[30] = 0;
  _$jscoverage['/mvc/router.js'].functionData[31] = 0;
  _$jscoverage['/mvc/router.js'].functionData[32] = 0;
}
if (! _$jscoverage['/mvc/router.js'].branchData) {
  _$jscoverage['/mvc/router.js'].branchData = {};
  _$jscoverage['/mvc/router.js'].branchData['15'] = [];
  _$jscoverage['/mvc/router.js'].branchData['15'][1] = new BranchData();
  _$jscoverage['/mvc/router.js'].branchData['17'] = [];
  _$jscoverage['/mvc/router.js'].branchData['17'][1] = new BranchData();
  _$jscoverage['/mvc/router.js'].branchData['22'] = [];
  _$jscoverage['/mvc/router.js'].branchData['22'][1] = new BranchData();
  _$jscoverage['/mvc/router.js'].branchData['25'] = [];
  _$jscoverage['/mvc/router.js'].branchData['25'][1] = new BranchData();
  _$jscoverage['/mvc/router.js'].branchData['27'] = [];
  _$jscoverage['/mvc/router.js'].branchData['27'][1] = new BranchData();
  _$jscoverage['/mvc/router.js'].branchData['51'] = [];
  _$jscoverage['/mvc/router.js'].branchData['51'][1] = new BranchData();
  _$jscoverage['/mvc/router.js'].branchData['52'] = [];
  _$jscoverage['/mvc/router.js'].branchData['52'][1] = new BranchData();
  _$jscoverage['/mvc/router.js'].branchData['78'] = [];
  _$jscoverage['/mvc/router.js'].branchData['78'][1] = new BranchData();
  _$jscoverage['/mvc/router.js'].branchData['85'] = [];
  _$jscoverage['/mvc/router.js'].branchData['85'][1] = new BranchData();
  _$jscoverage['/mvc/router.js'].branchData['96'] = [];
  _$jscoverage['/mvc/router.js'].branchData['96'][1] = new BranchData();
  _$jscoverage['/mvc/router.js'].branchData['106'] = [];
  _$jscoverage['/mvc/router.js'].branchData['106'][1] = new BranchData();
  _$jscoverage['/mvc/router.js'].branchData['155'] = [];
  _$jscoverage['/mvc/router.js'].branchData['155'][1] = new BranchData();
  _$jscoverage['/mvc/router.js'].branchData['160'] = [];
  _$jscoverage['/mvc/router.js'].branchData['160'][1] = new BranchData();
  _$jscoverage['/mvc/router.js'].branchData['184'] = [];
  _$jscoverage['/mvc/router.js'].branchData['184'][1] = new BranchData();
  _$jscoverage['/mvc/router.js'].branchData['189'] = [];
  _$jscoverage['/mvc/router.js'].branchData['189'][1] = new BranchData();
  _$jscoverage['/mvc/router.js'].branchData['195'] = [];
  _$jscoverage['/mvc/router.js'].branchData['195'][1] = new BranchData();
  _$jscoverage['/mvc/router.js'].branchData['200'] = [];
  _$jscoverage['/mvc/router.js'].branchData['200'][1] = new BranchData();
  _$jscoverage['/mvc/router.js'].branchData['200'][2] = new BranchData();
  _$jscoverage['/mvc/router.js'].branchData['201'] = [];
  _$jscoverage['/mvc/router.js'].branchData['201'][1] = new BranchData();
  _$jscoverage['/mvc/router.js'].branchData['205'] = [];
  _$jscoverage['/mvc/router.js'].branchData['205'][1] = new BranchData();
  _$jscoverage['/mvc/router.js'].branchData['207'] = [];
  _$jscoverage['/mvc/router.js'].branchData['207'][1] = new BranchData();
  _$jscoverage['/mvc/router.js'].branchData['213'] = [];
  _$jscoverage['/mvc/router.js'].branchData['213'][1] = new BranchData();
  _$jscoverage['/mvc/router.js'].branchData['230'] = [];
  _$jscoverage['/mvc/router.js'].branchData['230'][1] = new BranchData();
  _$jscoverage['/mvc/router.js'].branchData['237'] = [];
  _$jscoverage['/mvc/router.js'].branchData['237'][1] = new BranchData();
  _$jscoverage['/mvc/router.js'].branchData['265'] = [];
  _$jscoverage['/mvc/router.js'].branchData['265'][1] = new BranchData();
  _$jscoverage['/mvc/router.js'].branchData['270'] = [];
  _$jscoverage['/mvc/router.js'].branchData['270'][1] = new BranchData();
  _$jscoverage['/mvc/router.js'].branchData['272'] = [];
  _$jscoverage['/mvc/router.js'].branchData['272'][1] = new BranchData();
  _$jscoverage['/mvc/router.js'].branchData['276'] = [];
  _$jscoverage['/mvc/router.js'].branchData['276'][1] = new BranchData();
  _$jscoverage['/mvc/router.js'].branchData['304'] = [];
  _$jscoverage['/mvc/router.js'].branchData['304'][1] = new BranchData();
  _$jscoverage['/mvc/router.js'].branchData['306'] = [];
  _$jscoverage['/mvc/router.js'].branchData['306'][1] = new BranchData();
  _$jscoverage['/mvc/router.js'].branchData['388'] = [];
  _$jscoverage['/mvc/router.js'].branchData['388'][1] = new BranchData();
  _$jscoverage['/mvc/router.js'].branchData['394'] = [];
  _$jscoverage['/mvc/router.js'].branchData['394'][1] = new BranchData();
  _$jscoverage['/mvc/router.js'].branchData['421'] = [];
  _$jscoverage['/mvc/router.js'].branchData['421'][1] = new BranchData();
  _$jscoverage['/mvc/router.js'].branchData['423'] = [];
  _$jscoverage['/mvc/router.js'].branchData['423'][1] = new BranchData();
  _$jscoverage['/mvc/router.js'].branchData['424'] = [];
  _$jscoverage['/mvc/router.js'].branchData['424'][1] = new BranchData();
  _$jscoverage['/mvc/router.js'].branchData['433'] = [];
  _$jscoverage['/mvc/router.js'].branchData['433'][1] = new BranchData();
  _$jscoverage['/mvc/router.js'].branchData['436'] = [];
  _$jscoverage['/mvc/router.js'].branchData['436'][1] = new BranchData();
  _$jscoverage['/mvc/router.js'].branchData['436'][2] = new BranchData();
  _$jscoverage['/mvc/router.js'].branchData['441'] = [];
  _$jscoverage['/mvc/router.js'].branchData['441'][1] = new BranchData();
  _$jscoverage['/mvc/router.js'].branchData['453'] = [];
  _$jscoverage['/mvc/router.js'].branchData['453'][1] = new BranchData();
  _$jscoverage['/mvc/router.js'].branchData['455'] = [];
  _$jscoverage['/mvc/router.js'].branchData['455'][1] = new BranchData();
  _$jscoverage['/mvc/router.js'].branchData['456'] = [];
  _$jscoverage['/mvc/router.js'].branchData['456'][1] = new BranchData();
  _$jscoverage['/mvc/router.js'].branchData['460'] = [];
  _$jscoverage['/mvc/router.js'].branchData['460'][1] = new BranchData();
  _$jscoverage['/mvc/router.js'].branchData['471'] = [];
  _$jscoverage['/mvc/router.js'].branchData['471'][1] = new BranchData();
  _$jscoverage['/mvc/router.js'].branchData['473'] = [];
  _$jscoverage['/mvc/router.js'].branchData['473'][1] = new BranchData();
  _$jscoverage['/mvc/router.js'].branchData['479'] = [];
  _$jscoverage['/mvc/router.js'].branchData['479'][1] = new BranchData();
  _$jscoverage['/mvc/router.js'].branchData['480'] = [];
  _$jscoverage['/mvc/router.js'].branchData['480'][1] = new BranchData();
  _$jscoverage['/mvc/router.js'].branchData['494'] = [];
  _$jscoverage['/mvc/router.js'].branchData['494'][1] = new BranchData();
  _$jscoverage['/mvc/router.js'].branchData['504'] = [];
  _$jscoverage['/mvc/router.js'].branchData['504'][1] = new BranchData();
  _$jscoverage['/mvc/router.js'].branchData['517'] = [];
  _$jscoverage['/mvc/router.js'].branchData['517'][1] = new BranchData();
  _$jscoverage['/mvc/router.js'].branchData['520'] = [];
  _$jscoverage['/mvc/router.js'].branchData['520'][1] = new BranchData();
}
_$jscoverage['/mvc/router.js'].branchData['520'][1].init(785, 30, 'opts.success && opts.success()');
function visit99_520_1(result) {
  _$jscoverage['/mvc/router.js'].branchData['520'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/router.js'].branchData['517'][1].init(695, 17, 'opts.triggerRoute');
function visit98_517_1(result) {
  _$jscoverage['/mvc/router.js'].branchData['517'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/router.js'].branchData['504'][1].init(24, 37, 'nativeHistory && supportNativeHistory');
function visit97_504_1(result) {
  _$jscoverage['/mvc/router.js'].branchData['504'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/router.js'].branchData['494'][1].init(946, 36, '!equalsIgnoreSlash(locPath, urlRoot)');
function visit96_494_1(result) {
  _$jscoverage['/mvc/router.js'].branchData['494'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/router.js'].branchData['480'][1].init(30, 35, 'equalsIgnoreSlash(locPath, urlRoot)');
function visit95_480_1(result) {
  _$jscoverage['/mvc/router.js'].branchData['480'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/router.js'].branchData['479'][1].init(240, 11, 'hashIsValid');
function visit94_479_1(result) {
  _$jscoverage['/mvc/router.js'].branchData['479'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/router.js'].branchData['473'][1].init(24, 20, 'supportNativeHistory');
function visit93_473_1(result) {
  _$jscoverage['/mvc/router.js'].branchData['473'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/router.js'].branchData['471'][1].init(599, 13, 'nativeHistory');
function visit92_471_1(result) {
  _$jscoverage['/mvc/router.js'].branchData['471'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/router.js'].branchData['460'][1].init(207, 18, 'opts.urlRoot || ""');
function visit91_460_1(result) {
  _$jscoverage['/mvc/router.js'].branchData['460'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/router.js'].branchData['456'][1].init(25, 30, 'opts.success && opts.success()');
function visit90_456_1(result) {
  _$jscoverage['/mvc/router.js'].branchData['456'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/router.js'].branchData['455'][1].init(52, 16, 'Router.__started');
function visit89_455_1(result) {
  _$jscoverage['/mvc/router.js'].branchData['455'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/router.js'].branchData['453'][1].init(21, 10, 'opts || {}');
function visit88_453_1(result) {
  _$jscoverage['/mvc/router.js'].branchData['453'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/router.js'].branchData['441'][1].init(1006, 25, 'opts && opts.triggerRoute');
function visit87_441_1(result) {
  _$jscoverage['/mvc/router.js'].branchData['441'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/router.js'].branchData['436'][2].init(52, 6, 'ie < 8');
function visit86_436_2(result) {
  _$jscoverage['/mvc/router.js'].branchData['436'][2].ranCondition(result);
  return result;
}_$jscoverage['/mvc/router.js'].branchData['436'][1].init(46, 12, 'ie && ie < 8');
function visit85_436_1(result) {
  _$jscoverage['/mvc/router.js'].branchData['436'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/router.js'].branchData['433'][1].init(77, 14, 'replaceHistory');
function visit84_433_1(result) {
  _$jscoverage['/mvc/router.js'].branchData['433'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/router.js'].branchData['424'][1].init(22, 44, 'Router.nativeHistory && supportNativeHistory');
function visit83_424_1(result) {
  _$jscoverage['/mvc/router.js'].branchData['424'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/router.js'].branchData['423'][1].init(121, 22, 'getFragment() !== path');
function visit82_423_1(result) {
  _$jscoverage['/mvc/router.js'].branchData['423'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/router.js'].branchData['421'][1].init(21, 10, 'opts || {}');
function visit81_421_1(result) {
  _$jscoverage['/mvc/router.js'].branchData['421'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/router.js'].branchData['394'][1].init(368, 5, 'match');
function visit80_394_1(result) {
  _$jscoverage['/mvc/router.js'].branchData['394'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/router.js'].branchData['388'][1].init(67, 15, 'path.match(reg)');
function visit79_388_1(result) {
  _$jscoverage['/mvc/router.js'].branchData['388'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/router.js'].branchData['306'][1].init(99, 27, 'typeof callback == \'string\'');
function visit78_306_1(result) {
  _$jscoverage['/mvc/router.js'].branchData['306'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/router.js'].branchData['304'][1].init(14, 30, 'typeof callback === \'function\'');
function visit77_304_1(result) {
  _$jscoverage['/mvc/router.js'].branchData['304'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/router.js'].branchData['276'][1].init(209, 2, 'g4');
function visit76_276_1(result) {
  _$jscoverage['/mvc/router.js'].branchData['276'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/router.js'].branchData['272'][1].init(92, 2, 'g2');
function visit75_272_1(result) {
  _$jscoverage['/mvc/router.js'].branchData['272'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/router.js'].branchData['270'][1].init(34, 8, 'g2 || g4');
function visit74_270_1(result) {
  _$jscoverage['/mvc/router.js'].branchData['270'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/router.js'].branchData['265'][1].init(71, 30, 'typeof callback === \'function\'');
function visit73_265_1(result) {
  _$jscoverage['/mvc/router.js'].branchData['265'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/router.js'].branchData['237'][1].init(4430, 10, 'finalParam');
function visit72_237_1(result) {
  _$jscoverage['/mvc/router.js'].branchData['237'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/router.js'].branchData['230'][1].init(3785, 12, 'exactlyMatch');
function visit71_230_1(result) {
  _$jscoverage['/mvc/router.js'].branchData['230'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/router.js'].branchData['213'][1].init(1130, 11, '!finalRoute');
function visit70_213_1(result) {
  _$jscoverage['/mvc/router.js'].branchData['213'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/router.js'].branchData['207'][1].init(285, 34, 'regStr.length > finalRegStr.length');
function visit69_207_1(result) {
  _$jscoverage['/mvc/router.js'].branchData['207'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/router.js'].branchData['205'][1].init(160, 27, 'm.length < finalMatchLength');
function visit68_205_1(result) {
  _$jscoverage['/mvc/router.js'].branchData['205'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/router.js'].branchData['201'][1].init(93, 28, 'finalMatchLength >= m.length');
function visit67_201_1(result) {
  _$jscoverage['/mvc/router.js'].branchData['201'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/router.js'].branchData['200'][2].init(436, 53, 'firstCaptureGroupIndex == finalFirstCaptureGroupIndex');
function visit66_200_2(result) {
  _$jscoverage['/mvc/router.js'].branchData['200'][2].ranCondition(result);
  return result;
}_$jscoverage['/mvc/router.js'].branchData['200'][1].init(37, 122, 'firstCaptureGroupIndex == finalFirstCaptureGroupIndex && finalMatchLength >= m.length');
function visit65_200_1(result) {
  _$jscoverage['/mvc/router.js'].branchData['200'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/router.js'].branchData['195'][1].init(227, 52, 'firstCaptureGroupIndex > finalFirstCaptureGroupIndex');
function visit64_195_1(result) {
  _$jscoverage['/mvc/router.js'].branchData['195'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/router.js'].branchData['189'][1].init(1506, 6, 'regStr');
function visit63_189_1(result) {
  _$jscoverage['/mvc/router.js'].branchData['189'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/router.js'].branchData['184'][1].init(1299, 9, '!m.length');
function visit62_184_1(result) {
  _$jscoverage['/mvc/router.js'].branchData['184'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/router.js'].branchData['160'][1].init(34, 10, 'paramNames');
function visit61_160_1(result) {
  _$jscoverage['/mvc/router.js'].branchData['160'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/router.js'].branchData['155'][1].init(345, 19, 'm = path.match(reg)');
function visit60_155_1(result) {
  _$jscoverage['/mvc/router.js'].branchData['155'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/router.js'].branchData['106'][1].init(93, 12, 'str1 == str2');
function visit59_106_1(result) {
  _$jscoverage['/mvc/router.js'].branchData['106'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/router.js'].branchData['96'][1].init(14, 3, 'str');
function visit58_96_1(result) {
  _$jscoverage['/mvc/router.js'].branchData['96'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/router.js'].branchData['85'][1].init(14, 19, 'startWithSlash(str)');
function visit57_85_1(result) {
  _$jscoverage['/mvc/router.js'].branchData['85'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/router.js'].branchData['78'][1].init(14, 17, 'endWithSlash(str)');
function visit56_78_1(result) {
  _$jscoverage['/mvc/router.js'].branchData['78'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/router.js'].branchData['52'][1].init(51, 44, 'Router.nativeHistory && supportNativeHistory');
function visit55_52_1(result) {
  _$jscoverage['/mvc/router.js'].branchData['52'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/router.js'].branchData['51'][1].init(16, 20, 'url || location.href');
function visit54_51_1(result) {
  _$jscoverage['/mvc/router.js'].branchData['51'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/router.js'].branchData['27'][1].init(156, 8, 'r == "("');
function visit53_27_1(result) {
  _$jscoverage['/mvc/router.js'].branchData['27'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/router.js'].branchData['25'][1].init(96, 9, 'r == "\\\\"');
function visit52_25_1(result) {
  _$jscoverage['/mvc/router.js'].branchData['25'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/router.js'].branchData['22'][1].init(41, 17, 'i < regStr.length');
function visit51_22_1(result) {
  _$jscoverage['/mvc/router.js'].branchData['22'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/router.js'].branchData['17'][1].init(411, 31, 'history && history[\'pushState\']');
function visit50_17_1(result) {
  _$jscoverage['/mvc/router.js'].branchData['17'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/router.js'].branchData['15'][1].init(305, 36, 'win.document.documentMode || S.UA.ie');
function visit49_15_1(result) {
  _$jscoverage['/mvc/router.js'].branchData['15'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/router.js'].lineData[5]++;
KISSY.add('mvc/router', function(S, Node, Base, undefined) {
  _$jscoverage['/mvc/router.js'].functionData[0]++;
  _$jscoverage['/mvc/router.js'].lineData[6]++;
  var each = S.each, BREATH_INTERVAL = 100, grammar = /(:([\w\d]+))|(\\\*([\w\d]+))/g, allRoutes = [], win = S.Env.host, $ = Node.all, $win = $(win), ie = visit49_15_1(win.document.documentMode || S.UA.ie), history = win.history, supportNativeHistory = !!(visit50_17_1(history && history['pushState'])), ROUTER_MAP = "__routerMap";
  _$jscoverage['/mvc/router.js'].lineData[20]++;
  function findFirstCaptureGroupIndex(regStr) {
    _$jscoverage['/mvc/router.js'].functionData[1]++;
    _$jscoverage['/mvc/router.js'].lineData[21]++;
    var r, i;
    _$jscoverage['/mvc/router.js'].lineData[22]++;
    for (i = 0; visit51_22_1(i < regStr.length); i++) {
      _$jscoverage['/mvc/router.js'].lineData[23]++;
      r = regStr.charAt(i);
      _$jscoverage['/mvc/router.js'].lineData[25]++;
      if (visit52_25_1(r == "\\")) {
        _$jscoverage['/mvc/router.js'].lineData[26]++;
        i++;
      } else {
        _$jscoverage['/mvc/router.js'].lineData[27]++;
        if (visit53_27_1(r == "(")) {
          _$jscoverage['/mvc/router.js'].lineData[28]++;
          return i;
        }
      }
    }
    _$jscoverage['/mvc/router.js'].lineData[31]++;
    throw new Error("impossible to not to get capture group in kissy mvc route");
  }
  _$jscoverage['/mvc/router.js'].lineData[34]++;
  function getHash(url) {
    _$jscoverage['/mvc/router.js'].functionData[2]++;
    _$jscoverage['/mvc/router.js'].lineData[44]++;
    return new S.Uri(url).getFragment().replace(/^!/, "");
  }
  _$jscoverage['/mvc/router.js'].lineData[50]++;
  function getFragment(url) {
    _$jscoverage['/mvc/router.js'].functionData[3]++;
    _$jscoverage['/mvc/router.js'].lineData[51]++;
    url = visit54_51_1(url || location.href);
    _$jscoverage['/mvc/router.js'].lineData[52]++;
    if (visit55_52_1(Router.nativeHistory && supportNativeHistory)) {
      _$jscoverage['/mvc/router.js'].lineData[53]++;
      url = new S.Uri(url);
      _$jscoverage['/mvc/router.js'].lineData[54]++;
      var query = url.getQuery().toString();
      _$jscoverage['/mvc/router.js'].lineData[55]++;
      return url.getPath().substr(Router.urlRoot.length) + (query ? ('?' + query) : '');
    } else {
      _$jscoverage['/mvc/router.js'].lineData[57]++;
      return getHash(url);
    }
  }
  _$jscoverage['/mvc/router.js'].lineData[69]++;
  function endWithSlash(str) {
    _$jscoverage['/mvc/router.js'].functionData[4]++;
    _$jscoverage['/mvc/router.js'].lineData[70]++;
    return S.endsWith(str, "/");
  }
  _$jscoverage['/mvc/router.js'].lineData[73]++;
  function startWithSlash(str) {
    _$jscoverage['/mvc/router.js'].functionData[5]++;
    _$jscoverage['/mvc/router.js'].lineData[74]++;
    return S.startsWith(str, "/");
  }
  _$jscoverage['/mvc/router.js'].lineData[77]++;
  function removeEndSlash(str) {
    _$jscoverage['/mvc/router.js'].functionData[6]++;
    _$jscoverage['/mvc/router.js'].lineData[78]++;
    if (visit56_78_1(endWithSlash(str))) {
      _$jscoverage['/mvc/router.js'].lineData[79]++;
      str = str.substring(0, str.length - 1);
    }
    _$jscoverage['/mvc/router.js'].lineData[81]++;
    return str;
  }
  _$jscoverage['/mvc/router.js'].lineData[84]++;
  function removeStartSlash(str) {
    _$jscoverage['/mvc/router.js'].functionData[7]++;
    _$jscoverage['/mvc/router.js'].lineData[85]++;
    if (visit57_85_1(startWithSlash(str))) {
      _$jscoverage['/mvc/router.js'].lineData[86]++;
      str = str.substring(1);
    }
    _$jscoverage['/mvc/router.js'].lineData[88]++;
    return str;
  }
  _$jscoverage['/mvc/router.js'].lineData[91]++;
  function addEndSlash(str) {
    _$jscoverage['/mvc/router.js'].functionData[8]++;
    _$jscoverage['/mvc/router.js'].lineData[92]++;
    return removeEndSlash(str) + "/";
  }
  _$jscoverage['/mvc/router.js'].lineData[95]++;
  function addStartSlash(str) {
    _$jscoverage['/mvc/router.js'].functionData[9]++;
    _$jscoverage['/mvc/router.js'].lineData[96]++;
    if (visit58_96_1(str)) {
      _$jscoverage['/mvc/router.js'].lineData[97]++;
      return "/" + removeStartSlash(str);
    } else {
      _$jscoverage['/mvc/router.js'].lineData[99]++;
      return str;
    }
  }
  _$jscoverage['/mvc/router.js'].lineData[103]++;
  function equalsIgnoreSlash(str1, str2) {
    _$jscoverage['/mvc/router.js'].functionData[10]++;
    _$jscoverage['/mvc/router.js'].lineData[104]++;
    str1 = removeEndSlash(str1);
    _$jscoverage['/mvc/router.js'].lineData[105]++;
    str2 = removeEndSlash(str2);
    _$jscoverage['/mvc/router.js'].lineData[106]++;
    return visit59_106_1(str1 == str2);
  }
  _$jscoverage['/mvc/router.js'].lineData[117]++;
  function getFullPath(fragment) {
    _$jscoverage['/mvc/router.js'].functionData[11]++;
    _$jscoverage['/mvc/router.js'].lineData[118]++;
    return location.protocol + "//" + location.host + removeEndSlash(Router.urlRoot) + addStartSlash(fragment);
  }
  _$jscoverage['/mvc/router.js'].lineData[125]++;
  function dispatch() {
    _$jscoverage['/mvc/router.js'].functionData[12]++;
    _$jscoverage['/mvc/router.js'].lineData[126]++;
    var query, path, arg, finalRoute = 0, finalMatchLength = -1, finalRegStr = "", finalFirstCaptureGroupIndex = -1, finalCallback = 0, finalRouteName = "", pathUri = new S.Uri(getFragment()), finalParam = 0;
    _$jscoverage['/mvc/router.js'].lineData[138]++;
    path = pathUri.clone();
    _$jscoverage['/mvc/router.js'].lineData[139]++;
    path.query.reset();
    _$jscoverage['/mvc/router.js'].lineData[140]++;
    path = path.toString();
    _$jscoverage['/mvc/router.js'].lineData[143]++;
    each(allRoutes, function(route) {
  _$jscoverage['/mvc/router.js'].functionData[13]++;
  _$jscoverage['/mvc/router.js'].lineData[144]++;
  var routeRegs = route[ROUTER_MAP], exactlyMatch = 0;
  _$jscoverage['/mvc/router.js'].lineData[147]++;
  each(routeRegs, function(desc) {
  _$jscoverage['/mvc/router.js'].functionData[14]++;
  _$jscoverage['/mvc/router.js'].lineData[148]++;
  var reg = desc.reg, regStr = desc.regStr, paramNames = desc.paramNames, firstCaptureGroupIndex = -1, m, name = desc.name, callback = desc.callback;
  _$jscoverage['/mvc/router.js'].lineData[155]++;
  if (visit60_155_1(m = path.match(reg))) {
    _$jscoverage['/mvc/router.js'].lineData[157]++;
    m.shift();
    _$jscoverage['/mvc/router.js'].lineData[159]++;
    function genParam() {
      _$jscoverage['/mvc/router.js'].functionData[15]++;
      _$jscoverage['/mvc/router.js'].lineData[160]++;
      if (visit61_160_1(paramNames)) {
        _$jscoverage['/mvc/router.js'].lineData[161]++;
        var params = {};
        _$jscoverage['/mvc/router.js'].lineData[162]++;
        each(m, function(sm, i) {
  _$jscoverage['/mvc/router.js'].functionData[16]++;
  _$jscoverage['/mvc/router.js'].lineData[163]++;
  params[paramNames[i]] = sm;
});
        _$jscoverage['/mvc/router.js'].lineData[165]++;
        return params;
      } else {
        _$jscoverage['/mvc/router.js'].lineData[169]++;
        return [].concat(m);
      }
    }    _$jscoverage['/mvc/router.js'].lineData[173]++;
    function upToFinal() {
      _$jscoverage['/mvc/router.js'].functionData[17]++;
      _$jscoverage['/mvc/router.js'].lineData[174]++;
      finalRegStr = regStr;
      _$jscoverage['/mvc/router.js'].lineData[175]++;
      finalFirstCaptureGroupIndex = firstCaptureGroupIndex;
      _$jscoverage['/mvc/router.js'].lineData[176]++;
      finalCallback = callback;
      _$jscoverage['/mvc/router.js'].lineData[177]++;
      finalParam = genParam();
      _$jscoverage['/mvc/router.js'].lineData[178]++;
      finalRoute = route;
      _$jscoverage['/mvc/router.js'].lineData[179]++;
      finalRouteName = name;
      _$jscoverage['/mvc/router.js'].lineData[180]++;
      finalMatchLength = m.length;
    }    _$jscoverage['/mvc/router.js'].lineData[184]++;
    if (visit62_184_1(!m.length)) {
      _$jscoverage['/mvc/router.js'].lineData[185]++;
      upToFinal();
      _$jscoverage['/mvc/router.js'].lineData[186]++;
      exactlyMatch = 1;
      _$jscoverage['/mvc/router.js'].lineData[187]++;
      return false;
    } else {
      _$jscoverage['/mvc/router.js'].lineData[189]++;
      if (visit63_189_1(regStr)) {
        _$jscoverage['/mvc/router.js'].lineData[191]++;
        firstCaptureGroupIndex = findFirstCaptureGroupIndex(regStr);
        _$jscoverage['/mvc/router.js'].lineData[195]++;
        if (visit64_195_1(firstCaptureGroupIndex > finalFirstCaptureGroupIndex)) {
          _$jscoverage['/mvc/router.js'].lineData[196]++;
          upToFinal();
        } else {
          _$jscoverage['/mvc/router.js'].lineData[199]++;
          if (visit65_200_1(visit66_200_2(firstCaptureGroupIndex == finalFirstCaptureGroupIndex) && visit67_201_1(finalMatchLength >= m.length))) {
            _$jscoverage['/mvc/router.js'].lineData[205]++;
            if (visit68_205_1(m.length < finalMatchLength)) {
              _$jscoverage['/mvc/router.js'].lineData[206]++;
              upToFinal();
            } else {
              _$jscoverage['/mvc/router.js'].lineData[207]++;
              if (visit69_207_1(regStr.length > finalRegStr.length)) {
                _$jscoverage['/mvc/router.js'].lineData[208]++;
                upToFinal();
              }
            }
          } else {
            _$jscoverage['/mvc/router.js'].lineData[213]++;
            if (visit70_213_1(!finalRoute)) {
              _$jscoverage['/mvc/router.js'].lineData[214]++;
              upToFinal();
            }
          }
        }
      } else {
        _$jscoverage['/mvc/router.js'].lineData[221]++;
        upToFinal();
        _$jscoverage['/mvc/router.js'].lineData[222]++;
        exactlyMatch = 1;
        _$jscoverage['/mvc/router.js'].lineData[223]++;
        return false;
      }
    }
  }
  _$jscoverage['/mvc/router.js'].lineData[226]++;
  return undefined;
});
  _$jscoverage['/mvc/router.js'].lineData[230]++;
  if (visit71_230_1(exactlyMatch)) {
    _$jscoverage['/mvc/router.js'].lineData[231]++;
    return false;
  }
  _$jscoverage['/mvc/router.js'].lineData[233]++;
  return undefined;
});
    _$jscoverage['/mvc/router.js'].lineData[237]++;
    if (visit72_237_1(finalParam)) {
      _$jscoverage['/mvc/router.js'].lineData[238]++;
      query = pathUri.query.get();
      _$jscoverage['/mvc/router.js'].lineData[239]++;
      finalCallback.apply(finalRoute, [finalParam, query, {
  path: path, 
  url: location.href}]);
      _$jscoverage['/mvc/router.js'].lineData[243]++;
      arg = {
  name: finalRouteName, 
  "paths": finalParam, 
  path: path, 
  url: location.href, 
  query: query};
      _$jscoverage['/mvc/router.js'].lineData[250]++;
      finalRoute.fire('route:' + finalRouteName, arg);
      _$jscoverage['/mvc/router.js'].lineData[251]++;
      finalRoute.fire('route', arg);
    }
  }
  _$jscoverage['/mvc/router.js'].lineData[261]++;
  function transformRouterReg(self, str, callback) {
    _$jscoverage['/mvc/router.js'].functionData[18]++;
    _$jscoverage['/mvc/router.js'].lineData[262]++;
    var name = str, paramNames = [];
    _$jscoverage['/mvc/router.js'].lineData[265]++;
    if (visit73_265_1(typeof callback === 'function')) {
      _$jscoverage['/mvc/router.js'].lineData[267]++;
      str = S.escapeRegExp(str);
      _$jscoverage['/mvc/router.js'].lineData[269]++;
      str = str.replace(grammar, function(m, g1, g2, g3, g4) {
  _$jscoverage['/mvc/router.js'].functionData[19]++;
  _$jscoverage['/mvc/router.js'].lineData[270]++;
  paramNames.push(visit74_270_1(g2 || g4));
  _$jscoverage['/mvc/router.js'].lineData[272]++;
  if (visit75_272_1(g2)) {
    _$jscoverage['/mvc/router.js'].lineData[273]++;
    return "([^/]+)";
  } else {
    _$jscoverage['/mvc/router.js'].lineData[276]++;
    if (visit76_276_1(g4)) {
      _$jscoverage['/mvc/router.js'].lineData[277]++;
      return "(.*)";
    }
  }
  _$jscoverage['/mvc/router.js'].lineData[279]++;
  return undefined;
});
      _$jscoverage['/mvc/router.js'].lineData[282]++;
      return {
  name: name, 
  paramNames: paramNames, 
  reg: new RegExp("^" + str + "$"), 
  regStr: str, 
  callback: callback};
    } else {
      _$jscoverage['/mvc/router.js'].lineData[290]++;
      return {
  name: name, 
  reg: callback.reg, 
  callback: normFn(self, callback.callback)};
    }
  }
  _$jscoverage['/mvc/router.js'].lineData[303]++;
  function normFn(self, callback) {
    _$jscoverage['/mvc/router.js'].functionData[20]++;
    _$jscoverage['/mvc/router.js'].lineData[304]++;
    if (visit77_304_1(typeof callback === 'function')) {
      _$jscoverage['/mvc/router.js'].lineData[305]++;
      return callback;
    } else {
      _$jscoverage['/mvc/router.js'].lineData[306]++;
      if (visit78_306_1(typeof callback == 'string')) {
        _$jscoverage['/mvc/router.js'].lineData[307]++;
        return self[callback];
      }
    }
    _$jscoverage['/mvc/router.js'].lineData[309]++;
    return callback;
  }
  _$jscoverage['/mvc/router.js'].lineData[312]++;
  function _afterRoutesChange(e) {
    _$jscoverage['/mvc/router.js'].functionData[21]++;
    _$jscoverage['/mvc/router.js'].lineData[313]++;
    var self = this;
    _$jscoverage['/mvc/router.js'].lineData[314]++;
    self[ROUTER_MAP] = {};
    _$jscoverage['/mvc/router.js'].lineData[315]++;
    self.addRoutes(e.newVal);
  }
  _$jscoverage['/mvc/router.js'].lineData[318]++;
  var Router;
  _$jscoverage['/mvc/router.js'].lineData[327]++;
  return Router = Base.extend({
  initializer: function() {
  _$jscoverage['/mvc/router.js'].functionData[22]++;
  _$jscoverage['/mvc/router.js'].lineData[329]++;
  var self = this;
  _$jscoverage['/mvc/router.js'].lineData[330]++;
  self.on("afterRoutesChange", _afterRoutesChange, self);
  _$jscoverage['/mvc/router.js'].lineData[331]++;
  _afterRoutesChange.call(self, {
  newVal: self.get("routes")});
  _$jscoverage['/mvc/router.js'].lineData[332]++;
  allRoutes.push(self);
}, 
  addRoutes: function(routes) {
  _$jscoverage['/mvc/router.js'].functionData[23]++;
  _$jscoverage['/mvc/router.js'].lineData[350]++;
  var self = this;
  _$jscoverage['/mvc/router.js'].lineData[351]++;
  each(routes, function(callback, name) {
  _$jscoverage['/mvc/router.js'].functionData[24]++;
  _$jscoverage['/mvc/router.js'].lineData[352]++;
  self[ROUTER_MAP][name] = transformRouterReg(self, name, normFn(self, callback));
});
}}, {
  ATTRS: {
  routes: {}}, 
  hasRoute: function(path) {
  _$jscoverage['/mvc/router.js'].functionData[25]++;
  _$jscoverage['/mvc/router.js'].lineData[382]++;
  var match = 0;
  _$jscoverage['/mvc/router.js'].lineData[384]++;
  each(allRoutes, function(route) {
  _$jscoverage['/mvc/router.js'].functionData[26]++;
  _$jscoverage['/mvc/router.js'].lineData[385]++;
  var routeRegs = route[ROUTER_MAP];
  _$jscoverage['/mvc/router.js'].lineData[386]++;
  each(routeRegs, function(desc) {
  _$jscoverage['/mvc/router.js'].functionData[27]++;
  _$jscoverage['/mvc/router.js'].lineData[387]++;
  var reg = desc.reg;
  _$jscoverage['/mvc/router.js'].lineData[388]++;
  if (visit79_388_1(path.match(reg))) {
    _$jscoverage['/mvc/router.js'].lineData[389]++;
    match = 1;
    _$jscoverage['/mvc/router.js'].lineData[390]++;
    return false;
  }
  _$jscoverage['/mvc/router.js'].lineData[392]++;
  return undefined;
});
  _$jscoverage['/mvc/router.js'].lineData[394]++;
  if (visit80_394_1(match)) {
    _$jscoverage['/mvc/router.js'].lineData[395]++;
    return false;
  }
  _$jscoverage['/mvc/router.js'].lineData[397]++;
  return undefined;
});
  _$jscoverage['/mvc/router.js'].lineData[399]++;
  return !!match;
}, 
  removeRoot: function(url) {
  _$jscoverage['/mvc/router.js'].functionData[28]++;
  _$jscoverage['/mvc/router.js'].lineData[408]++;
  var u = new S.Uri(url);
  _$jscoverage['/mvc/router.js'].lineData[409]++;
  return u.getPath().substr(Router.urlRoot.length);
}, 
  navigate: function(path, opts) {
  _$jscoverage['/mvc/router.js'].functionData[29]++;
  _$jscoverage['/mvc/router.js'].lineData[421]++;
  opts = visit81_421_1(opts || {});
  _$jscoverage['/mvc/router.js'].lineData[422]++;
  var replaceHistory = opts.replaceHistory, normalizedPath;
  _$jscoverage['/mvc/router.js'].lineData[423]++;
  if (visit82_423_1(getFragment() !== path)) {
    _$jscoverage['/mvc/router.js'].lineData[424]++;
    if (visit83_424_1(Router.nativeHistory && supportNativeHistory)) {
      _$jscoverage['/mvc/router.js'].lineData[425]++;
      history[replaceHistory ? 'replaceState' : 'pushState']({}, "", getFullPath(path));
      _$jscoverage['/mvc/router.js'].lineData[430]++;
      dispatch();
    } else {
      _$jscoverage['/mvc/router.js'].lineData[432]++;
      normalizedPath = '#!' + path;
      _$jscoverage['/mvc/router.js'].lineData[433]++;
      if (visit84_433_1(replaceHistory)) {
        _$jscoverage['/mvc/router.js'].lineData[435]++;
        location.replace(normalizedPath + (visit85_436_1(ie && visit86_436_2(ie < 8)) ? Node.REPLACE_HISTORY : ''));
      } else {
        _$jscoverage['/mvc/router.js'].lineData[438]++;
        location.hash = normalizedPath;
      }
    }
  } else {
    _$jscoverage['/mvc/router.js'].lineData[441]++;
    if (visit87_441_1(opts && opts.triggerRoute)) {
      _$jscoverage['/mvc/router.js'].lineData[442]++;
      dispatch();
    }
  }
}, 
  start: function(opts) {
  _$jscoverage['/mvc/router.js'].functionData[30]++;
  _$jscoverage['/mvc/router.js'].lineData[453]++;
  opts = visit88_453_1(opts || {});
  _$jscoverage['/mvc/router.js'].lineData[455]++;
  if (visit89_455_1(Router.__started)) {
    _$jscoverage['/mvc/router.js'].lineData[456]++;
    return visit90_456_1(opts.success && opts.success());
  }
  _$jscoverage['/mvc/router.js'].lineData[460]++;
  opts.urlRoot = (visit91_460_1(opts.urlRoot || "")).replace(/\/$/, '');
  _$jscoverage['/mvc/router.js'].lineData[462]++;
  var urlRoot, nativeHistory = opts.nativeHistory, locPath = location.pathname, hash = getFragment(), hashIsValid = location.hash.match(/#!.+/);
  _$jscoverage['/mvc/router.js'].lineData[468]++;
  urlRoot = Router.urlRoot = opts.urlRoot;
  _$jscoverage['/mvc/router.js'].lineData[469]++;
  Router.nativeHistory = nativeHistory;
  _$jscoverage['/mvc/router.js'].lineData[471]++;
  if (visit92_471_1(nativeHistory)) {
    _$jscoverage['/mvc/router.js'].lineData[473]++;
    if (visit93_473_1(supportNativeHistory)) {
      _$jscoverage['/mvc/router.js'].lineData[479]++;
      if (visit94_479_1(hashIsValid)) {
        _$jscoverage['/mvc/router.js'].lineData[480]++;
        if (visit95_480_1(equalsIgnoreSlash(locPath, urlRoot))) {
          _$jscoverage['/mvc/router.js'].lineData[482]++;
          history['replaceState']({}, "", getFullPath(hash));
          _$jscoverage['/mvc/router.js'].lineData[483]++;
          opts.triggerRoute = 1;
        } else {
          _$jscoverage['/mvc/router.js'].lineData[485]++;
          S.error("location path must be same with urlRoot!");
        }
      }
    } else {
      _$jscoverage['/mvc/router.js'].lineData[494]++;
      if (visit96_494_1(!equalsIgnoreSlash(locPath, urlRoot))) {
        _$jscoverage['/mvc/router.js'].lineData[495]++;
        location.replace(addEndSlash(urlRoot) + "#!" + hash);
        _$jscoverage['/mvc/router.js'].lineData[496]++;
        return undefined;
      }
    }
  }
  _$jscoverage['/mvc/router.js'].lineData[502]++;
  setTimeout(function() {
  _$jscoverage['/mvc/router.js'].functionData[31]++;
  _$jscoverage['/mvc/router.js'].lineData[504]++;
  if (visit97_504_1(nativeHistory && supportNativeHistory)) {
    _$jscoverage['/mvc/router.js'].lineData[505]++;
    $win.on('popstate', dispatch);
  } else {
    _$jscoverage['/mvc/router.js'].lineData[509]++;
    $win.on("hashchange", dispatch);
    _$jscoverage['/mvc/router.js'].lineData[511]++;
    opts.triggerRoute = 1;
  }
  _$jscoverage['/mvc/router.js'].lineData[517]++;
  if (visit98_517_1(opts.triggerRoute)) {
    _$jscoverage['/mvc/router.js'].lineData[518]++;
    dispatch();
  }
  _$jscoverage['/mvc/router.js'].lineData[520]++;
  visit99_520_1(opts.success && opts.success());
}, BREATH_INTERVAL);
  _$jscoverage['/mvc/router.js'].lineData[524]++;
  Router.__started = 1;
  _$jscoverage['/mvc/router.js'].lineData[525]++;
  return undefined;
}, 
  stop: function() {
  _$jscoverage['/mvc/router.js'].functionData[32]++;
  _$jscoverage['/mvc/router.js'].lineData[529]++;
  Router.__started = 0;
  _$jscoverage['/mvc/router.js'].lineData[530]++;
  $win.detach('popstate', dispatch);
  _$jscoverage['/mvc/router.js'].lineData[531]++;
  $win.detach("hashchange", dispatch);
  _$jscoverage['/mvc/router.js'].lineData[532]++;
  allRoutes = [];
}});
}, {
  requires: ['node', 'base']});
