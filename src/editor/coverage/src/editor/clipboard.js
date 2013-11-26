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
if (! _$jscoverage['/editor/clipboard.js']) {
  _$jscoverage['/editor/clipboard.js'] = {};
  _$jscoverage['/editor/clipboard.js'].lineData = [];
  _$jscoverage['/editor/clipboard.js'].lineData[6] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[7] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[8] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[9] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[10] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[11] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[17] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[18] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[19] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[20] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[23] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[25] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[30] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[33] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[35] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[36] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[37] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[38] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[39] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[40] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[41] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[45] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[46] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[51] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[52] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[62] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[64] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[65] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[66] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[67] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[68] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[69] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[70] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[75] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[76] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[77] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[81] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[83] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[84] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[87] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[90] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[95] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[96] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[97] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[99] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[103] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[104] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[105] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[108] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[112] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[114] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[117] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[121] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[122] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[123] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[125] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[126] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[127] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[135] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[137] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[143] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[146] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[147] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[151] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[152] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[155] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[157] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[162] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[163] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[164] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[167] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[171] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[176] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[178] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[179] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[182] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[184] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[196] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[198] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[201] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[202] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[203] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[205] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[211] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[212] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[214] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[219] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[221] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[223] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[225] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[229] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[232] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[234] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[239] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[240] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[243] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[244] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[248] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[250] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[251] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[254] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[262] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[263] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[267] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[274] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[277] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[279] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[281] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[285] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[287] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[291] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[293] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[296] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[300] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[307] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[308] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[309] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[310] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[311] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[313] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[314] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[315] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[316] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[317] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[318] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[321] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[323] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[324] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[325] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[331] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[332] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[334] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[335] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[336] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[338] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[339] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[340] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[342] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[343] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[345] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[347] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[351] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[352] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[357] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[358] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[362] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[364] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[365] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[366] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[368] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[374] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[375] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[381] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[383] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[384] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[386] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[387] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[388] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[392] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[395] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[396] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[397] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[398] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[400] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[401] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[403] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[405] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[406] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[407] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[409] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[412] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[413] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[416] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[419] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[425] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[428] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[430] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[431] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[435] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[436] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[439] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[440] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[441] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[442] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[443] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[444] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[445] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[446] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[447] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[456] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[461] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[465] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[466] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[468] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[470] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[471] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[472] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[473] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[479] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[480] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[481] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[482] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[485] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[486] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[487] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[488] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[489] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[496] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[499] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[500] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[501] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[502] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[503] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[505] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[507] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[508] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[509] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[510] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[511] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[513] = 0;
}
if (! _$jscoverage['/editor/clipboard.js'].functionData) {
  _$jscoverage['/editor/clipboard.js'].functionData = [];
  _$jscoverage['/editor/clipboard.js'].functionData[0] = 0;
  _$jscoverage['/editor/clipboard.js'].functionData[1] = 0;
  _$jscoverage['/editor/clipboard.js'].functionData[2] = 0;
  _$jscoverage['/editor/clipboard.js'].functionData[3] = 0;
  _$jscoverage['/editor/clipboard.js'].functionData[4] = 0;
  _$jscoverage['/editor/clipboard.js'].functionData[5] = 0;
  _$jscoverage['/editor/clipboard.js'].functionData[6] = 0;
  _$jscoverage['/editor/clipboard.js'].functionData[7] = 0;
  _$jscoverage['/editor/clipboard.js'].functionData[8] = 0;
  _$jscoverage['/editor/clipboard.js'].functionData[9] = 0;
  _$jscoverage['/editor/clipboard.js'].functionData[10] = 0;
  _$jscoverage['/editor/clipboard.js'].functionData[11] = 0;
  _$jscoverage['/editor/clipboard.js'].functionData[12] = 0;
  _$jscoverage['/editor/clipboard.js'].functionData[13] = 0;
  _$jscoverage['/editor/clipboard.js'].functionData[14] = 0;
  _$jscoverage['/editor/clipboard.js'].functionData[15] = 0;
  _$jscoverage['/editor/clipboard.js'].functionData[16] = 0;
  _$jscoverage['/editor/clipboard.js'].functionData[17] = 0;
  _$jscoverage['/editor/clipboard.js'].functionData[18] = 0;
  _$jscoverage['/editor/clipboard.js'].functionData[19] = 0;
  _$jscoverage['/editor/clipboard.js'].functionData[20] = 0;
  _$jscoverage['/editor/clipboard.js'].functionData[21] = 0;
  _$jscoverage['/editor/clipboard.js'].functionData[22] = 0;
  _$jscoverage['/editor/clipboard.js'].functionData[23] = 0;
  _$jscoverage['/editor/clipboard.js'].functionData[24] = 0;
  _$jscoverage['/editor/clipboard.js'].functionData[25] = 0;
  _$jscoverage['/editor/clipboard.js'].functionData[26] = 0;
  _$jscoverage['/editor/clipboard.js'].functionData[27] = 0;
  _$jscoverage['/editor/clipboard.js'].functionData[28] = 0;
  _$jscoverage['/editor/clipboard.js'].functionData[29] = 0;
  _$jscoverage['/editor/clipboard.js'].functionData[30] = 0;
  _$jscoverage['/editor/clipboard.js'].functionData[31] = 0;
  _$jscoverage['/editor/clipboard.js'].functionData[32] = 0;
  _$jscoverage['/editor/clipboard.js'].functionData[33] = 0;
  _$jscoverage['/editor/clipboard.js'].functionData[34] = 0;
  _$jscoverage['/editor/clipboard.js'].functionData[35] = 0;
  _$jscoverage['/editor/clipboard.js'].functionData[36] = 0;
  _$jscoverage['/editor/clipboard.js'].functionData[37] = 0;
}
if (! _$jscoverage['/editor/clipboard.js'].branchData) {
  _$jscoverage['/editor/clipboard.js'].branchData = {};
  _$jscoverage['/editor/clipboard.js'].branchData['38'] = [];
  _$jscoverage['/editor/clipboard.js'].branchData['38'][1] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['39'] = [];
  _$jscoverage['/editor/clipboard.js'].branchData['39'][1] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['41'] = [];
  _$jscoverage['/editor/clipboard.js'].branchData['41'][1] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['51'] = [];
  _$jscoverage['/editor/clipboard.js'].branchData['51'][1] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['64'] = [];
  _$jscoverage['/editor/clipboard.js'].branchData['64'][1] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['83'] = [];
  _$jscoverage['/editor/clipboard.js'].branchData['83'][1] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['87'] = [];
  _$jscoverage['/editor/clipboard.js'].branchData['87'][1] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['87'][2] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['87'][3] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['89'] = [];
  _$jscoverage['/editor/clipboard.js'].branchData['89'][1] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['89'][2] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['99'] = [];
  _$jscoverage['/editor/clipboard.js'].branchData['99'][1] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['113'] = [];
  _$jscoverage['/editor/clipboard.js'].branchData['113'][1] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['114'] = [];
  _$jscoverage['/editor/clipboard.js'].branchData['114'][1] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['114'][2] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['114'][3] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['122'] = [];
  _$jscoverage['/editor/clipboard.js'].branchData['122'][1] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['137'] = [];
  _$jscoverage['/editor/clipboard.js'].branchData['137'][1] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['151'] = [];
  _$jscoverage['/editor/clipboard.js'].branchData['151'][1] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['162'] = [];
  _$jscoverage['/editor/clipboard.js'].branchData['162'][1] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['178'] = [];
  _$jscoverage['/editor/clipboard.js'].branchData['178'][1] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['214'] = [];
  _$jscoverage['/editor/clipboard.js'].branchData['214'][1] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['215'] = [];
  _$jscoverage['/editor/clipboard.js'].branchData['215'][1] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['225'] = [];
  _$jscoverage['/editor/clipboard.js'].branchData['225'][1] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['239'] = [];
  _$jscoverage['/editor/clipboard.js'].branchData['239'][1] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['243'] = [];
  _$jscoverage['/editor/clipboard.js'].branchData['243'][1] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['248'] = [];
  _$jscoverage['/editor/clipboard.js'].branchData['248'][1] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['277'] = [];
  _$jscoverage['/editor/clipboard.js'].branchData['277'][1] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['311'] = [];
  _$jscoverage['/editor/clipboard.js'].branchData['311'][1] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['311'][2] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['323'] = [];
  _$jscoverage['/editor/clipboard.js'].branchData['323'][1] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['332'] = [];
  _$jscoverage['/editor/clipboard.js'].branchData['332'][1] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['334'] = [];
  _$jscoverage['/editor/clipboard.js'].branchData['334'][1] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['336'] = [];
  _$jscoverage['/editor/clipboard.js'].branchData['336'][1] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['338'] = [];
  _$jscoverage['/editor/clipboard.js'].branchData['338'][1] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['340'] = [];
  _$jscoverage['/editor/clipboard.js'].branchData['340'][1] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['342'] = [];
  _$jscoverage['/editor/clipboard.js'].branchData['342'][1] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['357'] = [];
  _$jscoverage['/editor/clipboard.js'].branchData['357'][1] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['362'] = [];
  _$jscoverage['/editor/clipboard.js'].branchData['362'][1] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['362'][2] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['364'] = [];
  _$jscoverage['/editor/clipboard.js'].branchData['364'][1] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['374'] = [];
  _$jscoverage['/editor/clipboard.js'].branchData['374'][1] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['381'] = [];
  _$jscoverage['/editor/clipboard.js'].branchData['381'][1] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['383'] = [];
  _$jscoverage['/editor/clipboard.js'].branchData['383'][1] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['386'] = [];
  _$jscoverage['/editor/clipboard.js'].branchData['386'][1] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['398'] = [];
  _$jscoverage['/editor/clipboard.js'].branchData['398'][1] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['405'] = [];
  _$jscoverage['/editor/clipboard.js'].branchData['405'][1] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['412'] = [];
  _$jscoverage['/editor/clipboard.js'].branchData['412'][1] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['435'] = [];
  _$jscoverage['/editor/clipboard.js'].branchData['435'][1] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['468'] = [];
  _$jscoverage['/editor/clipboard.js'].branchData['468'][1] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['472'] = [];
  _$jscoverage['/editor/clipboard.js'].branchData['472'][1] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['481'] = [];
  _$jscoverage['/editor/clipboard.js'].branchData['481'][1] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['499'] = [];
  _$jscoverage['/editor/clipboard.js'].branchData['499'][1] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['502'] = [];
  _$jscoverage['/editor/clipboard.js'].branchData['502'][1] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['508'] = [];
  _$jscoverage['/editor/clipboard.js'].branchData['508'][1] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['510'] = [];
  _$jscoverage['/editor/clipboard.js'].branchData['510'][1] = new BranchData();
}
_$jscoverage['/editor/clipboard.js'].branchData['510'][1].init(102, 5, 'c.set');
function visit56_510_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['510'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['508'][1].init(301, 24, 'clipboardCommands[value]');
function visit55_508_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['508'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['502'][1].init(101, 5, 'c.get');
function visit54_502_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['502'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['499'][1].init(1415, 6, 'i >= 0');
function visit53_499_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['499'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['481'][1].init(88, 24, 'clipboardCommands[value]');
function visit52_481_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['481'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['472'][1].init(108, 32, 'i < clipboardCommandsList.length');
function visit51_472_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['472'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['468'][1].init(72, 23, '!contextmenu.__copy_fix');
function visit50_468_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['468'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['435'][1].init(195, 1, '0');
function visit49_435_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['435'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['412'][1].init(855, 30, '!htmlMode && isPlainText(html)');
function visit48_412_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['412'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['405'][1].init(415, 59, 'html.indexOf(\'<br class="Apple-interchange-newline">\') > -1');
function visit47_405_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['405'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['398'][1].init(123, 28, 'html.indexOf(\'Apple-\') != -1');
function visit46_398_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['398'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['386'][1].init(145, 29, 'html.indexOf(\'<br><br>\') > -1');
function visit45_386_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['386'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['383'][1].init(44, 8, 'UA.gecko');
function visit44_383_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['383'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['381'][1].init(1066, 20, 'UA.gecko || UA.opera');
function visit43_381_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['381'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['374'][1].init(497, 26, 'html.match(/<\\/div><div>/)');
function visit42_374_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['374'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['364'][1].init(80, 35, 'html.match(/<div>(?:<br>)?<\\/div>/)');
function visit41_364_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['364'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['362'][2].init(258, 26, 'html.indexOf(\'<div>\') > -1');
function visit40_362_2(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['362'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['362'][1].init(245, 39, 'UA.webkit && html.indexOf(\'<div>\') > -1');
function visit39_362_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['362'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['357'][1].init(154, 20, 'html.match(/^[^<]$/)');
function visit38_357_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['357'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['342'][1].init(46, 38, '!html.match(/^([^<]|<br( ?\\/)?>)*$/gi)');
function visit37_342_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['342'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['340'][1].init(523, 20, 'UA.gecko || UA.opera');
function visit36_340_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['340'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['338'][1].init(117, 98, '!html.match(/^([^<]|<br( ?\\/)?>)*$/gi) && !html.match(/^(<p>([^<]|<br( ?\\/)?>)*<\\/p>|(\\r\\n))*$/gi)');
function visit35_338_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['338'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['336'][1].init(252, 5, 'UA.ie');
function visit34_336_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['336'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['334'][1].init(89, 90, '!html.match(/^[^<]*$/g) && !html.match(/^(<div><br( ?\\/)?><\\/div>|<div>[^<]*<\\/div>)*$/gi)');
function visit33_334_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['334'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['332'][1].init(13, 9, 'UA.webkit');
function visit32_332_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['332'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['323'][1].init(62, 16, 'control.parent()');
function visit31_323_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['323'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['311'][2].init(128, 38, 'sel.getType() == KES.SELECTION_ELEMENT');
function visit30_311_2(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['311'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['311'][1].init(128, 94, '(sel.getType() == KES.SELECTION_ELEMENT) && (control = sel.getSelectedElement())');
function visit29_311_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['311'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['277'][1].init(572, 12, 'UA[\'ie\'] > 7');
function visit28_277_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['277'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['248'][1].init(1331, 61, '/(class="?Mso|style="[^"]*\\bmso\\-|w:WordDocument)/.test(html)');
function visit27_248_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['248'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['243'][1].init(1197, 16, 're !== undefined');
function visit26_243_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['243'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['239'][1].init(1114, 12, 're === false');
function visit25_239_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['239'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['225'][1].init(697, 27, '!(html = cleanPaste(html))');
function visit24_225_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['225'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['215'][1].init(37, 95, '(bogusSpan = pasteBin.first()) && (bogusSpan.hasClass(\'Apple-style-span\'))');
function visit23_215_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['215'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['214'][1].init(-1, 133, 'UA[\'webkit\'] && (bogusSpan = pasteBin.first()) && (bogusSpan.hasClass(\'Apple-style-span\'))');
function visit22_214_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['214'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['178'][1].init(990, 12, 'UA[\'webkit\']');
function visit21_178_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['178'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['162'][1].init(376, 34, 'doc.getElementById(\'ke-paste-bin\')');
function visit20_162_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['162'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['151'][1].init(17, 26, 'this._isPreventBeforePaste');
function visit19_151_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['151'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['137'][1].init(84, 20, 'self._isPreventPaste');
function visit18_137_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['137'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['122'][1].init(46, 23, 'self._preventPasteTimer');
function visit17_122_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['122'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['114'][3].init(138, 18, 'ranges.length == 1');
function visit16_114_3(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['114'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['114'][2].init(138, 43, 'ranges.length == 1 && ranges[0].collapsed');
function visit15_114_2(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['114'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['114'][1].init(125, 58, 'ranges && !(ranges.length == 1 && ranges[0].collapsed)');
function visit14_114_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['114'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['113'][1].init(61, 22, 'sel && sel.getRanges()');
function visit13_113_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['113'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['99'][1].init(106, 18, 'command == \'paste\'');
function visit12_99_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['99'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['89'][2].init(306, 15, 'e.keyCode == 45');
function visit11_89_2(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['89'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['89'][1].init(79, 29, 'e.shiftKey && e.keyCode == 45');
function visit10_89_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['89'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['87'][3].init(223, 15, 'e.keyCode == 86');
function visit9_87_3(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['87'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['87'][2].init(210, 28, 'e.ctrlKey && e.keyCode == 86');
function visit8_87_2(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['87'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['87'][1].init(210, 109, 'e.ctrlKey && e.keyCode == 86 || e.shiftKey && e.keyCode == 45');
function visit7_87_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['87'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['83'][1].init(84, 46, 'editor.get(\'mode\') != Editor.Mode.WYSIWYG_MODE');
function visit6_83_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['83'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['64'][1].init(1753, 5, 'UA.ie');
function visit5_64_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['64'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['51'][1].init(708, 32, '!tryToCutCopyPaste(editor, type)');
function visit4_51_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['51'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['41'][1].init(138, 15, 'type == \'paste\'');
function visit3_41_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['41'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['39'][1].init(33, 13, 'type == \'cut\'');
function visit2_39_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['39'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['38'][1].init(29, 5, 'UA.ie');
function visit1_38_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['38'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/editor/clipboard.js'].functionData[0]++;
  _$jscoverage['/editor/clipboard.js'].lineData[7]++;
  var Node = require('node');
  _$jscoverage['/editor/clipboard.js'].lineData[8]++;
  var Editor = require('./base');
  _$jscoverage['/editor/clipboard.js'].lineData[9]++;
  var KERange = require('./range');
  _$jscoverage['/editor/clipboard.js'].lineData[10]++;
  var KES = require('./selection');
  _$jscoverage['/editor/clipboard.js'].lineData[11]++;
  var $ = Node.all, UA = S.UA, logger = S.getLogger('s/editor'), pasteEvent = UA.ie ? 'beforepaste' : 'paste', KER = Editor.RangeType;
  _$jscoverage['/editor/clipboard.js'].lineData[17]++;
  function Paste(editor) {
    _$jscoverage['/editor/clipboard.js'].functionData[1]++;
    _$jscoverage['/editor/clipboard.js'].lineData[18]++;
    var self = this;
    _$jscoverage['/editor/clipboard.js'].lineData[19]++;
    self.editor = editor;
    _$jscoverage['/editor/clipboard.js'].lineData[20]++;
    self._init();
  }
  _$jscoverage['/editor/clipboard.js'].lineData[23]++;
  S.augment(Paste, {
  _init: function() {
  _$jscoverage['/editor/clipboard.js'].functionData[2]++;
  _$jscoverage['/editor/clipboard.js'].lineData[25]++;
  var self = this, editor = self.editor, editorDoc = editor.get("document"), editorBody = editorDoc.one('body'), CutCopyPasteCmd = function(type) {
  _$jscoverage['/editor/clipboard.js'].functionData[3]++;
  _$jscoverage['/editor/clipboard.js'].lineData[30]++;
  this.type = type;
};
  _$jscoverage['/editor/clipboard.js'].lineData[33]++;
  CutCopyPasteCmd.prototype = {
  exec: function(editor) {
  _$jscoverage['/editor/clipboard.js'].functionData[4]++;
  _$jscoverage['/editor/clipboard.js'].lineData[35]++;
  var type = this.type;
  _$jscoverage['/editor/clipboard.js'].lineData[36]++;
  editor.focus();
  _$jscoverage['/editor/clipboard.js'].lineData[37]++;
  setTimeout(function() {
  _$jscoverage['/editor/clipboard.js'].functionData[5]++;
  _$jscoverage['/editor/clipboard.js'].lineData[38]++;
  if (visit1_38_1(UA.ie)) {
    _$jscoverage['/editor/clipboard.js'].lineData[39]++;
    if (visit2_39_1(type == 'cut')) {
      _$jscoverage['/editor/clipboard.js'].lineData[40]++;
      fixCut(editor);
    } else {
      _$jscoverage['/editor/clipboard.js'].lineData[41]++;
      if (visit3_41_1(type == 'paste')) {
        _$jscoverage['/editor/clipboard.js'].lineData[45]++;
        self._preventPasteEvent();
        _$jscoverage['/editor/clipboard.js'].lineData[46]++;
        self._getClipboardDataFromPasteBin();
      }
    }
  }
  _$jscoverage['/editor/clipboard.js'].lineData[51]++;
  if (visit4_51_1(!tryToCutCopyPaste(editor, type))) {
    _$jscoverage['/editor/clipboard.js'].lineData[52]++;
    alert(error_types[type]);
  }
}, 0);
}};
  _$jscoverage['/editor/clipboard.js'].lineData[62]++;
  editorBody.on(pasteEvent, self._getClipboardDataFromPasteBin, self);
  _$jscoverage['/editor/clipboard.js'].lineData[64]++;
  if (visit5_64_1(UA.ie)) {
    _$jscoverage['/editor/clipboard.js'].lineData[65]++;
    editorBody.on('paste', self._iePaste, self);
    _$jscoverage['/editor/clipboard.js'].lineData[66]++;
    editorDoc.on('keydown', self._onKeyDown, self);
    _$jscoverage['/editor/clipboard.js'].lineData[67]++;
    editorDoc.on('contextmenu', function() {
  _$jscoverage['/editor/clipboard.js'].functionData[6]++;
  _$jscoverage['/editor/clipboard.js'].lineData[68]++;
  self._isPreventBeforePaste = 1;
  _$jscoverage['/editor/clipboard.js'].lineData[69]++;
  setTimeout(function() {
  _$jscoverage['/editor/clipboard.js'].functionData[7]++;
  _$jscoverage['/editor/clipboard.js'].lineData[70]++;
  self._isPreventBeforePaste = 0;
}, 0);
});
  }
  _$jscoverage['/editor/clipboard.js'].lineData[75]++;
  editor.addCommand("copy", new CutCopyPasteCmd("copy"));
  _$jscoverage['/editor/clipboard.js'].lineData[76]++;
  editor.addCommand("cut", new CutCopyPasteCmd("cut"));
  _$jscoverage['/editor/clipboard.js'].lineData[77]++;
  editor.addCommand("paste", new CutCopyPasteCmd("paste"));
}, 
  '_onKeyDown': function(e) {
  _$jscoverage['/editor/clipboard.js'].functionData[8]++;
  _$jscoverage['/editor/clipboard.js'].lineData[81]++;
  var self = this, editor = self.editor;
  _$jscoverage['/editor/clipboard.js'].lineData[83]++;
  if (visit6_83_1(editor.get('mode') != Editor.Mode.WYSIWYG_MODE)) {
    _$jscoverage['/editor/clipboard.js'].lineData[84]++;
    return;
  }
  _$jscoverage['/editor/clipboard.js'].lineData[87]++;
  if (visit7_87_1(visit8_87_2(e.ctrlKey && visit9_87_3(e.keyCode == 86)) || visit10_89_1(e.shiftKey && visit11_89_2(e.keyCode == 45)))) {
    _$jscoverage['/editor/clipboard.js'].lineData[90]++;
    self._preventPasteEvent();
  }
}, 
  _stateFromNamedCommand: function(command) {
  _$jscoverage['/editor/clipboard.js'].functionData[9]++;
  _$jscoverage['/editor/clipboard.js'].lineData[95]++;
  var ret;
  _$jscoverage['/editor/clipboard.js'].lineData[96]++;
  var self = this;
  _$jscoverage['/editor/clipboard.js'].lineData[97]++;
  var editor = self.editor;
  _$jscoverage['/editor/clipboard.js'].lineData[99]++;
  if (visit12_99_1(command == 'paste')) {
    _$jscoverage['/editor/clipboard.js'].lineData[103]++;
    self._isPreventBeforePaste = 1;
    _$jscoverage['/editor/clipboard.js'].lineData[104]++;
    try {
      _$jscoverage['/editor/clipboard.js'].lineData[105]++;
      ret = editor.get('document')[0].queryCommandEnabled(command);
    }    catch (e) {
}
    _$jscoverage['/editor/clipboard.js'].lineData[108]++;
    self._isPreventBeforePaste = 0;
  } else {
    _$jscoverage['/editor/clipboard.js'].lineData[112]++;
    var sel = editor.getSelection(), ranges = visit13_113_1(sel && sel.getRanges());
    _$jscoverage['/editor/clipboard.js'].lineData[114]++;
    ret = visit14_114_1(ranges && !(visit15_114_2(visit16_114_3(ranges.length == 1) && ranges[0].collapsed)));
  }
  _$jscoverage['/editor/clipboard.js'].lineData[117]++;
  return ret;
}, 
  '_preventPasteEvent': function() {
  _$jscoverage['/editor/clipboard.js'].functionData[10]++;
  _$jscoverage['/editor/clipboard.js'].lineData[121]++;
  var self = this;
  _$jscoverage['/editor/clipboard.js'].lineData[122]++;
  if (visit17_122_1(self._preventPasteTimer)) {
    _$jscoverage['/editor/clipboard.js'].lineData[123]++;
    clearTimeout(self._preventPasteTimer);
  }
  _$jscoverage['/editor/clipboard.js'].lineData[125]++;
  self._isPreventPaste = 1;
  _$jscoverage['/editor/clipboard.js'].lineData[126]++;
  self._preventPasteTimer = setTimeout(function() {
  _$jscoverage['/editor/clipboard.js'].functionData[11]++;
  _$jscoverage['/editor/clipboard.js'].lineData[127]++;
  self._isPreventPaste = 0;
}, 70);
}, 
  _iePaste: function(e) {
  _$jscoverage['/editor/clipboard.js'].functionData[12]++;
  _$jscoverage['/editor/clipboard.js'].lineData[135]++;
  var self = this, editor = self.editor;
  _$jscoverage['/editor/clipboard.js'].lineData[137]++;
  if (visit18_137_1(self._isPreventPaste)) {
    _$jscoverage['/editor/clipboard.js'].lineData[143]++;
    return;
  }
  _$jscoverage['/editor/clipboard.js'].lineData[146]++;
  e.preventDefault();
  _$jscoverage['/editor/clipboard.js'].lineData[147]++;
  editor.execCommand('paste');
}, 
  _getClipboardDataFromPasteBin: function() {
  _$jscoverage['/editor/clipboard.js'].functionData[13]++;
  _$jscoverage['/editor/clipboard.js'].lineData[151]++;
  if (visit19_151_1(this._isPreventBeforePaste)) {
    _$jscoverage['/editor/clipboard.js'].lineData[152]++;
    return;
  }
  _$jscoverage['/editor/clipboard.js'].lineData[155]++;
  logger.debug(pasteEvent + ": " + " paste event happen");
  _$jscoverage['/editor/clipboard.js'].lineData[157]++;
  var self = this, editor = self.editor, doc = editor.get("document")[0];
  _$jscoverage['/editor/clipboard.js'].lineData[162]++;
  if (visit20_162_1(doc.getElementById('ke-paste-bin'))) {
    _$jscoverage['/editor/clipboard.js'].lineData[163]++;
    logger.debug(pasteEvent + ": trigger more than once ...");
    _$jscoverage['/editor/clipboard.js'].lineData[164]++;
    return;
  }
  _$jscoverage['/editor/clipboard.js'].lineData[167]++;
  var sel = editor.getSelection(), range = new KERange(doc);
  _$jscoverage['/editor/clipboard.js'].lineData[171]++;
  var pasteBin = $(UA['webkit'] ? '<body></body>' : '<div></div>', doc);
  _$jscoverage['/editor/clipboard.js'].lineData[176]++;
  pasteBin.attr('id', 'ke-paste-bin');
  _$jscoverage['/editor/clipboard.js'].lineData[178]++;
  if (visit21_178_1(UA['webkit'])) {
    _$jscoverage['/editor/clipboard.js'].lineData[179]++;
    pasteBin[0].appendChild(doc.createTextNode('\u200b'));
  }
  _$jscoverage['/editor/clipboard.js'].lineData[182]++;
  doc.body.appendChild(pasteBin[0]);
  _$jscoverage['/editor/clipboard.js'].lineData[184]++;
  pasteBin.css({
  position: 'absolute', 
  top: sel.getStartElement().offset().top + 'px', 
  width: '1px', 
  height: '1px', 
  overflow: 'hidden'});
  _$jscoverage['/editor/clipboard.js'].lineData[196]++;
  pasteBin.css('left', '-1000px');
  _$jscoverage['/editor/clipboard.js'].lineData[198]++;
  var bms = sel.createBookmarks();
  _$jscoverage['/editor/clipboard.js'].lineData[201]++;
  range.setStartAt(pasteBin, KER.POSITION_AFTER_START);
  _$jscoverage['/editor/clipboard.js'].lineData[202]++;
  range.setEndAt(pasteBin, KER.POSITION_BEFORE_END);
  _$jscoverage['/editor/clipboard.js'].lineData[203]++;
  range.select(true);
  _$jscoverage['/editor/clipboard.js'].lineData[205]++;
  setTimeout(function() {
  _$jscoverage['/editor/clipboard.js'].functionData[14]++;
  _$jscoverage['/editor/clipboard.js'].lineData[211]++;
  var bogusSpan;
  _$jscoverage['/editor/clipboard.js'].lineData[212]++;
  var oldPasteBin = pasteBin;
  _$jscoverage['/editor/clipboard.js'].lineData[214]++;
  pasteBin = (visit22_214_1(UA['webkit'] && visit23_215_1((bogusSpan = pasteBin.first()) && (bogusSpan.hasClass('Apple-style-span')))) ? bogusSpan : pasteBin);
  _$jscoverage['/editor/clipboard.js'].lineData[219]++;
  sel.selectBookmarks(bms);
  _$jscoverage['/editor/clipboard.js'].lineData[221]++;
  var html = pasteBin.html();
  _$jscoverage['/editor/clipboard.js'].lineData[223]++;
  oldPasteBin.remove();
  _$jscoverage['/editor/clipboard.js'].lineData[225]++;
  if (visit24_225_1(!(html = cleanPaste(html)))) {
    _$jscoverage['/editor/clipboard.js'].lineData[229]++;
    return;
  }
  _$jscoverage['/editor/clipboard.js'].lineData[232]++;
  logger.debug("paste " + html);
  _$jscoverage['/editor/clipboard.js'].lineData[234]++;
  var re = editor.fire("paste", {
  html: html});
  _$jscoverage['/editor/clipboard.js'].lineData[239]++;
  if (visit25_239_1(re === false)) {
    _$jscoverage['/editor/clipboard.js'].lineData[240]++;
    return;
  }
  _$jscoverage['/editor/clipboard.js'].lineData[243]++;
  if (visit26_243_1(re !== undefined)) {
    _$jscoverage['/editor/clipboard.js'].lineData[244]++;
    html = re;
  }
  _$jscoverage['/editor/clipboard.js'].lineData[248]++;
  if (visit27_248_1(/(class="?Mso|style="[^"]*\bmso\-|w:WordDocument)/.test(html))) {
    _$jscoverage['/editor/clipboard.js'].lineData[250]++;
    S.use("editor/plugin/word-filter", function(S, wordFilter) {
  _$jscoverage['/editor/clipboard.js'].functionData[15]++;
  _$jscoverage['/editor/clipboard.js'].lineData[251]++;
  editor.insertHtml(wordFilter.toDataFormat(html, editor));
});
  } else {
    _$jscoverage['/editor/clipboard.js'].lineData[254]++;
    editor.insertHtml(html);
  }
}, 0);
}});
  _$jscoverage['/editor/clipboard.js'].lineData[262]++;
  var execIECommand = function(editor, command) {
  _$jscoverage['/editor/clipboard.js'].functionData[16]++;
  _$jscoverage['/editor/clipboard.js'].lineData[263]++;
  var doc = editor.get("document")[0], body = $(doc.body), enabled = false, onExec = function() {
  _$jscoverage['/editor/clipboard.js'].functionData[17]++;
  _$jscoverage['/editor/clipboard.js'].lineData[267]++;
  enabled = true;
};
  _$jscoverage['/editor/clipboard.js'].lineData[274]++;
  body.on(command, onExec);
  _$jscoverage['/editor/clipboard.js'].lineData[277]++;
  (visit28_277_1(UA['ie'] > 7) ? doc : doc.selection.createRange())['execCommand'](command);
  _$jscoverage['/editor/clipboard.js'].lineData[279]++;
  body.detach(command, onExec);
  _$jscoverage['/editor/clipboard.js'].lineData[281]++;
  return enabled;
};
  _$jscoverage['/editor/clipboard.js'].lineData[285]++;
  var tryToCutCopyPaste = UA['ie'] ? function(editor, type) {
  _$jscoverage['/editor/clipboard.js'].functionData[18]++;
  _$jscoverage['/editor/clipboard.js'].lineData[287]++;
  return execIECommand(editor, type);
} : function(editor, type) {
  _$jscoverage['/editor/clipboard.js'].functionData[19]++;
  _$jscoverage['/editor/clipboard.js'].lineData[291]++;
  try {
    _$jscoverage['/editor/clipboard.js'].lineData[293]++;
    return editor.get("document")[0].execCommand(type);
  }  catch (e) {
  _$jscoverage['/editor/clipboard.js'].lineData[296]++;
  return false;
}
};
  _$jscoverage['/editor/clipboard.js'].lineData[300]++;
  var error_types = {
  "cut": "\u60a8\u7684\u6d4f\u89c8\u5668\u5b89\u5168\u8bbe\u7f6e\u4e0d\u5141\u8bb8\u7f16\u8f91\u5668\u81ea\u52a8\u6267\u884c\u526a\u5207\u64cd\u4f5c\uff0c\u8bf7\u4f7f\u7528\u952e\u76d8\u5feb\u6377\u952e(Ctrl/Cmd+X)\u6765\u5b8c\u6210", 
  "copy": "\u60a8\u7684\u6d4f\u89c8\u5668\u5b89\u5168\u8bbe\u7f6e\u4e0d\u5141\u8bb8\u7f16\u8f91\u5668\u81ea\u52a8\u6267\u884c\u590d\u5236\u64cd\u4f5c\uff0c\u8bf7\u4f7f\u7528\u952e\u76d8\u5feb\u6377\u952e(Ctrl/Cmd+C)\u6765\u5b8c\u6210", 
  "paste": "\u60a8\u7684\u6d4f\u89c8\u5668\u5b89\u5168\u8bbe\u7f6e\u4e0d\u5141\u8bb8\u7f16\u8f91\u5668\u81ea\u52a8\u6267\u884c\u7c98\u8d34\u64cd\u4f5c\uff0c\u8bf7\u4f7f\u7528\u952e\u76d8\u5feb\u6377\u952e(Ctrl/Cmd+V)\u6765\u5b8c\u6210"};
  _$jscoverage['/editor/clipboard.js'].lineData[307]++;
  function fixCut(editor) {
    _$jscoverage['/editor/clipboard.js'].functionData[20]++;
    _$jscoverage['/editor/clipboard.js'].lineData[308]++;
    var editorDoc = editor.get("document")[0];
    _$jscoverage['/editor/clipboard.js'].lineData[309]++;
    var sel = editor.getSelection();
    _$jscoverage['/editor/clipboard.js'].lineData[310]++;
    var control;
    _$jscoverage['/editor/clipboard.js'].lineData[311]++;
    if (visit29_311_1((visit30_311_2(sel.getType() == KES.SELECTION_ELEMENT)) && (control = sel.getSelectedElement()))) {
      _$jscoverage['/editor/clipboard.js'].lineData[313]++;
      var range = sel.getRanges()[0];
      _$jscoverage['/editor/clipboard.js'].lineData[314]++;
      var dummy = $(editorDoc.createTextNode(''));
      _$jscoverage['/editor/clipboard.js'].lineData[315]++;
      dummy.insertBefore(control);
      _$jscoverage['/editor/clipboard.js'].lineData[316]++;
      range.setStartBefore(dummy);
      _$jscoverage['/editor/clipboard.js'].lineData[317]++;
      range.setEndAfter(control);
      _$jscoverage['/editor/clipboard.js'].lineData[318]++;
      sel.selectRanges([range]);
      _$jscoverage['/editor/clipboard.js'].lineData[321]++;
      setTimeout(function() {
  _$jscoverage['/editor/clipboard.js'].functionData[21]++;
  _$jscoverage['/editor/clipboard.js'].lineData[323]++;
  if (visit31_323_1(control.parent())) {
    _$jscoverage['/editor/clipboard.js'].lineData[324]++;
    dummy.remove();
    _$jscoverage['/editor/clipboard.js'].lineData[325]++;
    sel.selectElement(control);
  }
}, 0);
    }
  }
  _$jscoverage['/editor/clipboard.js'].lineData[331]++;
  function isPlainText(html) {
    _$jscoverage['/editor/clipboard.js'].functionData[22]++;
    _$jscoverage['/editor/clipboard.js'].lineData[332]++;
    if (visit32_332_1(UA.webkit)) {
      _$jscoverage['/editor/clipboard.js'].lineData[334]++;
      if (visit33_334_1(!html.match(/^[^<]*$/g) && !html.match(/^(<div><br( ?\/)?><\/div>|<div>[^<]*<\/div>)*$/gi))) {
        _$jscoverage['/editor/clipboard.js'].lineData[335]++;
        return 0;
      }
    } else {
      _$jscoverage['/editor/clipboard.js'].lineData[336]++;
      if (visit34_336_1(UA.ie)) {
        _$jscoverage['/editor/clipboard.js'].lineData[338]++;
        if (visit35_338_1(!html.match(/^([^<]|<br( ?\/)?>)*$/gi) && !html.match(/^(<p>([^<]|<br( ?\/)?>)*<\/p>|(\r\n))*$/gi))) {
          _$jscoverage['/editor/clipboard.js'].lineData[339]++;
          return 0;
        }
      } else {
        _$jscoverage['/editor/clipboard.js'].lineData[340]++;
        if (visit36_340_1(UA.gecko || UA.opera)) {
          _$jscoverage['/editor/clipboard.js'].lineData[342]++;
          if (visit37_342_1(!html.match(/^([^<]|<br( ?\/)?>)*$/gi))) {
            _$jscoverage['/editor/clipboard.js'].lineData[343]++;
            return 0;
          }
        } else {
          _$jscoverage['/editor/clipboard.js'].lineData[345]++;
          return 0;
        }
      }
    }
    _$jscoverage['/editor/clipboard.js'].lineData[347]++;
    return 1;
  }
  _$jscoverage['/editor/clipboard.js'].lineData[351]++;
  function plainTextToHtml(html) {
    _$jscoverage['/editor/clipboard.js'].functionData[23]++;
    _$jscoverage['/editor/clipboard.js'].lineData[352]++;
    html = html.replace(/\s+/g, ' ').replace(/> +</g, '><').replace(/<br ?\/>/gi, '<br>');
    _$jscoverage['/editor/clipboard.js'].lineData[357]++;
    if (visit38_357_1(html.match(/^[^<]$/))) {
      _$jscoverage['/editor/clipboard.js'].lineData[358]++;
      return html;
    }
    _$jscoverage['/editor/clipboard.js'].lineData[362]++;
    if (visit39_362_1(UA.webkit && visit40_362_2(html.indexOf('<div>') > -1))) {
      _$jscoverage['/editor/clipboard.js'].lineData[364]++;
      if (visit41_364_1(html.match(/<div>(?:<br>)?<\/div>/))) {
        _$jscoverage['/editor/clipboard.js'].lineData[365]++;
        html = html.replace(/<div>(?:<br>)?<\/div>/g, function() {
  _$jscoverage['/editor/clipboard.js'].functionData[24]++;
  _$jscoverage['/editor/clipboard.js'].lineData[366]++;
  return '<p></p>';
});
        _$jscoverage['/editor/clipboard.js'].lineData[368]++;
        html = html.replace(/<\/p><div>/g, '</p><p>').replace(/<\/div><p>/g, '</p><p>').replace(/^<div>/, '<p>').replace(/^<\/div>/, '</p>');
      }
      _$jscoverage['/editor/clipboard.js'].lineData[374]++;
      if (visit42_374_1(html.match(/<\/div><div>/))) {
        _$jscoverage['/editor/clipboard.js'].lineData[375]++;
        html = html.replace(/<\/div><div>/g, '</p><p>').replace(/^<div>/, '<p>').replace(/^<\/div>/, '</p>');
      }
    } else {
      _$jscoverage['/editor/clipboard.js'].lineData[381]++;
      if (visit43_381_1(UA.gecko || UA.opera)) {
        _$jscoverage['/editor/clipboard.js'].lineData[383]++;
        if (visit44_383_1(UA.gecko)) {
          _$jscoverage['/editor/clipboard.js'].lineData[384]++;
          html = html.replace(/^<br><br>$/, '<br>');
        }
        _$jscoverage['/editor/clipboard.js'].lineData[386]++;
        if (visit45_386_1(html.indexOf('<br><br>') > -1)) {
          _$jscoverage['/editor/clipboard.js'].lineData[387]++;
          html = '<p>' + html.replace(/<br><br>/g, function() {
  _$jscoverage['/editor/clipboard.js'].functionData[25]++;
  _$jscoverage['/editor/clipboard.js'].lineData[388]++;
  return '</p><p>';
}) + '</p>';
        }
      }
    }
    _$jscoverage['/editor/clipboard.js'].lineData[392]++;
    return html;
  }
  _$jscoverage['/editor/clipboard.js'].lineData[395]++;
  function cleanPaste(html) {
    _$jscoverage['/editor/clipboard.js'].functionData[26]++;
    _$jscoverage['/editor/clipboard.js'].lineData[396]++;
    var htmlMode = 0;
    _$jscoverage['/editor/clipboard.js'].lineData[397]++;
    html = html.replace(/<span[^>]+_ke_bookmark[^<]*?<\/span>(&nbsp;)*/ig, '');
    _$jscoverage['/editor/clipboard.js'].lineData[398]++;
    if (visit46_398_1(html.indexOf('Apple-') != -1)) {
      _$jscoverage['/editor/clipboard.js'].lineData[400]++;
      html = html.replace(/<span class="Apple-converted-space">&nbsp;<\/span>/gi, ' ');
      _$jscoverage['/editor/clipboard.js'].lineData[401]++;
      html = html.replace(/<span class="Apple-tab-span"[^>]*>([^<]*)<\/span>/gi, function(all, spaces) {
  _$jscoverage['/editor/clipboard.js'].functionData[27]++;
  _$jscoverage['/editor/clipboard.js'].lineData[403]++;
  return spaces.replace(/\t/g, new Array(5).join('&nbsp;'));
});
      _$jscoverage['/editor/clipboard.js'].lineData[405]++;
      if (visit47_405_1(html.indexOf('<br class="Apple-interchange-newline">') > -1)) {
        _$jscoverage['/editor/clipboard.js'].lineData[406]++;
        htmlMode = 1;
        _$jscoverage['/editor/clipboard.js'].lineData[407]++;
        html = html.replace(/<br class="Apple-interchange-newline">/, '');
      }
      _$jscoverage['/editor/clipboard.js'].lineData[409]++;
      html = html.replace(/(<[^>]+) class="Apple-[^"]*"/gi, '$1');
    }
    _$jscoverage['/editor/clipboard.js'].lineData[412]++;
    if (visit48_412_1(!htmlMode && isPlainText(html))) {
      _$jscoverage['/editor/clipboard.js'].lineData[413]++;
      html = plainTextToHtml(html);
    }
    _$jscoverage['/editor/clipboard.js'].lineData[416]++;
    return html;
  }
  _$jscoverage['/editor/clipboard.js'].lineData[419]++;
  var lang = {
  "copy": "\u590d\u5236", 
  "paste": "\u7c98\u8d34", 
  "cut": "\u526a\u5207"};
  _$jscoverage['/editor/clipboard.js'].lineData[425]++;
  return {
  init: function(editor) {
  _$jscoverage['/editor/clipboard.js'].functionData[28]++;
  _$jscoverage['/editor/clipboard.js'].lineData[428]++;
  var currentPaste;
  _$jscoverage['/editor/clipboard.js'].lineData[430]++;
  editor.docReady(function() {
  _$jscoverage['/editor/clipboard.js'].functionData[29]++;
  _$jscoverage['/editor/clipboard.js'].lineData[431]++;
  currentPaste = new Paste(editor);
});
  _$jscoverage['/editor/clipboard.js'].lineData[435]++;
  if (visit49_435_1(0)) {
    _$jscoverage['/editor/clipboard.js'].lineData[436]++;
    var defaultContextMenuFn;
    _$jscoverage['/editor/clipboard.js'].lineData[439]++;
    editor.docReady(defaultContextMenuFn = function() {
  _$jscoverage['/editor/clipboard.js'].functionData[30]++;
  _$jscoverage['/editor/clipboard.js'].lineData[440]++;
  editor.detach('docReady', defaultContextMenuFn);
  _$jscoverage['/editor/clipboard.js'].lineData[441]++;
  var firstFn;
  _$jscoverage['/editor/clipboard.js'].lineData[442]++;
  editor.get('document').on('contextmenu', firstFn = function(e) {
  _$jscoverage['/editor/clipboard.js'].functionData[31]++;
  _$jscoverage['/editor/clipboard.js'].lineData[443]++;
  e.preventDefault();
  _$jscoverage['/editor/clipboard.js'].lineData[444]++;
  editor.get('document').detach('contextmenu', firstFn);
  _$jscoverage['/editor/clipboard.js'].lineData[445]++;
  S.use('editor/plugin/contextmenu', function() {
  _$jscoverage['/editor/clipboard.js'].functionData[32]++;
  _$jscoverage['/editor/clipboard.js'].lineData[446]++;
  editor.addContextMenu('default', function() {
  _$jscoverage['/editor/clipboard.js'].functionData[33]++;
  _$jscoverage['/editor/clipboard.js'].lineData[447]++;
  return 1;
}, {
  event: e});
});
});
});
  }
  _$jscoverage['/editor/clipboard.js'].lineData[456]++;
  var clipboardCommands = {
  "copy": 1, 
  "cut": 1, 
  "paste": 1};
  _$jscoverage['/editor/clipboard.js'].lineData[461]++;
  var clipboardCommandsList = ["copy", "cut", "paste"];
  _$jscoverage['/editor/clipboard.js'].lineData[465]++;
  editor.on("contextmenu", function(ev) {
  _$jscoverage['/editor/clipboard.js'].functionData[34]++;
  _$jscoverage['/editor/clipboard.js'].lineData[466]++;
  var contextmenu = ev.contextmenu;
  _$jscoverage['/editor/clipboard.js'].lineData[468]++;
  if (visit50_468_1(!contextmenu.__copy_fix)) {
    _$jscoverage['/editor/clipboard.js'].lineData[470]++;
    contextmenu.__copy_fix = 1;
    _$jscoverage['/editor/clipboard.js'].lineData[471]++;
    var i = 0;
    _$jscoverage['/editor/clipboard.js'].lineData[472]++;
    for (; visit51_472_1(i < clipboardCommandsList.length); i++) {
      _$jscoverage['/editor/clipboard.js'].lineData[473]++;
      contextmenu.addChild({
  content: lang[clipboardCommandsList[i]], 
  value: clipboardCommandsList[i]});
    }
    _$jscoverage['/editor/clipboard.js'].lineData[479]++;
    contextmenu.on('click', function(e) {
  _$jscoverage['/editor/clipboard.js'].functionData[35]++;
  _$jscoverage['/editor/clipboard.js'].lineData[480]++;
  var value = e.target.get("value");
  _$jscoverage['/editor/clipboard.js'].lineData[481]++;
  if (visit52_481_1(clipboardCommands[value])) {
    _$jscoverage['/editor/clipboard.js'].lineData[482]++;
    contextmenu.hide();
    _$jscoverage['/editor/clipboard.js'].lineData[485]++;
    setTimeout(function() {
  _$jscoverage['/editor/clipboard.js'].functionData[36]++;
  _$jscoverage['/editor/clipboard.js'].lineData[486]++;
  editor.execCommand('save');
  _$jscoverage['/editor/clipboard.js'].lineData[487]++;
  editor.execCommand(value);
  _$jscoverage['/editor/clipboard.js'].lineData[488]++;
  setTimeout(function() {
  _$jscoverage['/editor/clipboard.js'].functionData[37]++;
  _$jscoverage['/editor/clipboard.js'].lineData[489]++;
  editor.execCommand('save');
}, 10);
}, 30);
  }
});
  }
  _$jscoverage['/editor/clipboard.js'].lineData[496]++;
  var menuChildren = contextmenu.get('children');
  _$jscoverage['/editor/clipboard.js'].lineData[499]++;
  for (i = menuChildren.length - 1; visit53_499_1(i >= 0); i >= 0) {
    _$jscoverage['/editor/clipboard.js'].lineData[500]++;
    var c = menuChildren[i];
    _$jscoverage['/editor/clipboard.js'].lineData[501]++;
    var value;
    _$jscoverage['/editor/clipboard.js'].lineData[502]++;
    if (visit54_502_1(c.get)) {
      _$jscoverage['/editor/clipboard.js'].lineData[503]++;
      value = c.get("value");
    } else {
      _$jscoverage['/editor/clipboard.js'].lineData[505]++;
      value = c.value;
    }
    _$jscoverage['/editor/clipboard.js'].lineData[507]++;
    var v;
    _$jscoverage['/editor/clipboard.js'].lineData[508]++;
    if (visit55_508_1(clipboardCommands[value])) {
      _$jscoverage['/editor/clipboard.js'].lineData[509]++;
      v = !currentPaste._stateFromNamedCommand(value);
      _$jscoverage['/editor/clipboard.js'].lineData[510]++;
      if (visit56_510_1(c.set)) {
        _$jscoverage['/editor/clipboard.js'].lineData[511]++;
        c.set('disabled', v);
      } else {
        _$jscoverage['/editor/clipboard.js'].lineData[513]++;
        c.disabled = v;
      }
    }
  }
});
}};
});
