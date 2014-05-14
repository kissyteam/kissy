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
if (! _$jscoverage['/selector/parser.js']) {
  _$jscoverage['/selector/parser.js'] = {};
  _$jscoverage['/selector/parser.js'].lineData = [];
  _$jscoverage['/selector/parser.js'].lineData[3] = 0;
  _$jscoverage['/selector/parser.js'].lineData[6] = 0;
  _$jscoverage['/selector/parser.js'].lineData[16] = 0;
  _$jscoverage['/selector/parser.js'].lineData[17] = 0;
  _$jscoverage['/selector/parser.js'].lineData[18] = 0;
  _$jscoverage['/selector/parser.js'].lineData[22] = 0;
  _$jscoverage['/selector/parser.js'].lineData[23] = 0;
  _$jscoverage['/selector/parser.js'].lineData[26] = 0;
  _$jscoverage['/selector/parser.js'].lineData[27] = 0;
  _$jscoverage['/selector/parser.js'].lineData[28] = 0;
  _$jscoverage['/selector/parser.js'].lineData[33] = 0;
  _$jscoverage['/selector/parser.js'].lineData[35] = 0;
  _$jscoverage['/selector/parser.js'].lineData[36] = 0;
  _$jscoverage['/selector/parser.js'].lineData[38] = 0;
  _$jscoverage['/selector/parser.js'].lineData[39] = 0;
  _$jscoverage['/selector/parser.js'].lineData[43] = 0;
  _$jscoverage['/selector/parser.js'].lineData[44] = 0;
  _$jscoverage['/selector/parser.js'].lineData[45] = 0;
  _$jscoverage['/selector/parser.js'].lineData[46] = 0;
  _$jscoverage['/selector/parser.js'].lineData[53] = 0;
  _$jscoverage['/selector/parser.js'].lineData[54] = 0;
  _$jscoverage['/selector/parser.js'].lineData[55] = 0;
  _$jscoverage['/selector/parser.js'].lineData[56] = 0;
  _$jscoverage['/selector/parser.js'].lineData[59] = 0;
  _$jscoverage['/selector/parser.js'].lineData[61] = 0;
  _$jscoverage['/selector/parser.js'].lineData[63] = 0;
  _$jscoverage['/selector/parser.js'].lineData[79] = 0;
  _$jscoverage['/selector/parser.js'].lineData[81] = 0;
  _$jscoverage['/selector/parser.js'].lineData[88] = 0;
  _$jscoverage['/selector/parser.js'].lineData[90] = 0;
  _$jscoverage['/selector/parser.js'].lineData[92] = 0;
  _$jscoverage['/selector/parser.js'].lineData[106] = 0;
  _$jscoverage['/selector/parser.js'].lineData[110] = 0;
  _$jscoverage['/selector/parser.js'].lineData[111] = 0;
  _$jscoverage['/selector/parser.js'].lineData[113] = 0;
  _$jscoverage['/selector/parser.js'].lineData[114] = 0;
  _$jscoverage['/selector/parser.js'].lineData[115] = 0;
  _$jscoverage['/selector/parser.js'].lineData[116] = 0;
  _$jscoverage['/selector/parser.js'].lineData[117] = 0;
  _$jscoverage['/selector/parser.js'].lineData[119] = 0;
  _$jscoverage['/selector/parser.js'].lineData[120] = 0;
  _$jscoverage['/selector/parser.js'].lineData[123] = 0;
  _$jscoverage['/selector/parser.js'].lineData[126] = 0;
  _$jscoverage['/selector/parser.js'].lineData[129] = 0;
  _$jscoverage['/selector/parser.js'].lineData[130] = 0;
  _$jscoverage['/selector/parser.js'].lineData[131] = 0;
  _$jscoverage['/selector/parser.js'].lineData[132] = 0;
  _$jscoverage['/selector/parser.js'].lineData[134] = 0;
  _$jscoverage['/selector/parser.js'].lineData[137] = 0;
  _$jscoverage['/selector/parser.js'].lineData[142] = 0;
  _$jscoverage['/selector/parser.js'].lineData[144] = 0;
  _$jscoverage['/selector/parser.js'].lineData[148] = 0;
  _$jscoverage['/selector/parser.js'].lineData[150] = 0;
  _$jscoverage['/selector/parser.js'].lineData[153] = 0;
  _$jscoverage['/selector/parser.js'].lineData[156] = 0;
  _$jscoverage['/selector/parser.js'].lineData[160] = 0;
  _$jscoverage['/selector/parser.js'].lineData[161] = 0;
  _$jscoverage['/selector/parser.js'].lineData[162] = 0;
  _$jscoverage['/selector/parser.js'].lineData[163] = 0;
  _$jscoverage['/selector/parser.js'].lineData[167] = 0;
  _$jscoverage['/selector/parser.js'].lineData[168] = 0;
  _$jscoverage['/selector/parser.js'].lineData[170] = 0;
  _$jscoverage['/selector/parser.js'].lineData[174] = 0;
  _$jscoverage['/selector/parser.js'].lineData[183] = 0;
  _$jscoverage['/selector/parser.js'].lineData[185] = 0;
  _$jscoverage['/selector/parser.js'].lineData[186] = 0;
  _$jscoverage['/selector/parser.js'].lineData[189] = 0;
  _$jscoverage['/selector/parser.js'].lineData[190] = 0;
  _$jscoverage['/selector/parser.js'].lineData[192] = 0;
  _$jscoverage['/selector/parser.js'].lineData[196] = 0;
  _$jscoverage['/selector/parser.js'].lineData[197] = 0;
  _$jscoverage['/selector/parser.js'].lineData[198] = 0;
  _$jscoverage['/selector/parser.js'].lineData[199] = 0;
  _$jscoverage['/selector/parser.js'].lineData[201] = 0;
  _$jscoverage['/selector/parser.js'].lineData[208] = 0;
  _$jscoverage['/selector/parser.js'].lineData[210] = 0;
  _$jscoverage['/selector/parser.js'].lineData[213] = 0;
  _$jscoverage['/selector/parser.js'].lineData[215] = 0;
  _$jscoverage['/selector/parser.js'].lineData[217] = 0;
  _$jscoverage['/selector/parser.js'].lineData[218] = 0;
  _$jscoverage['/selector/parser.js'].lineData[219] = 0;
  _$jscoverage['/selector/parser.js'].lineData[220] = 0;
  _$jscoverage['/selector/parser.js'].lineData[222] = 0;
  _$jscoverage['/selector/parser.js'].lineData[224] = 0;
  _$jscoverage['/selector/parser.js'].lineData[225] = 0;
  _$jscoverage['/selector/parser.js'].lineData[227] = 0;
  _$jscoverage['/selector/parser.js'].lineData[228] = 0;
  _$jscoverage['/selector/parser.js'].lineData[231] = 0;
  _$jscoverage['/selector/parser.js'].lineData[237] = 0;
  _$jscoverage['/selector/parser.js'].lineData[242] = 0;
  _$jscoverage['/selector/parser.js'].lineData[246] = 0;
  _$jscoverage['/selector/parser.js'].lineData[251] = 0;
  _$jscoverage['/selector/parser.js'].lineData[256] = 0;
  _$jscoverage['/selector/parser.js'].lineData[261] = 0;
  _$jscoverage['/selector/parser.js'].lineData[266] = 0;
  _$jscoverage['/selector/parser.js'].lineData[271] = 0;
  _$jscoverage['/selector/parser.js'].lineData[276] = 0;
  _$jscoverage['/selector/parser.js'].lineData[281] = 0;
  _$jscoverage['/selector/parser.js'].lineData[286] = 0;
  _$jscoverage['/selector/parser.js'].lineData[287] = 0;
  _$jscoverage['/selector/parser.js'].lineData[292] = 0;
  _$jscoverage['/selector/parser.js'].lineData[298] = 0;
  _$jscoverage['/selector/parser.js'].lineData[303] = 0;
  _$jscoverage['/selector/parser.js'].lineData[308] = 0;
  _$jscoverage['/selector/parser.js'].lineData[313] = 0;
  _$jscoverage['/selector/parser.js'].lineData[318] = 0;
  _$jscoverage['/selector/parser.js'].lineData[323] = 0;
  _$jscoverage['/selector/parser.js'].lineData[328] = 0;
  _$jscoverage['/selector/parser.js'].lineData[333] = 0;
  _$jscoverage['/selector/parser.js'].lineData[339] = 0;
  _$jscoverage['/selector/parser.js'].lineData[344] = 0;
  _$jscoverage['/selector/parser.js'].lineData[349] = 0;
  _$jscoverage['/selector/parser.js'].lineData[357] = 0;
  _$jscoverage['/selector/parser.js'].lineData[358] = 0;
  _$jscoverage['/selector/parser.js'].lineData[401] = 0;
  _$jscoverage['/selector/parser.js'].lineData[405] = 0;
  _$jscoverage['/selector/parser.js'].lineData[410] = 0;
  _$jscoverage['/selector/parser.js'].lineData[418] = 0;
  _$jscoverage['/selector/parser.js'].lineData[419] = 0;
  _$jscoverage['/selector/parser.js'].lineData[420] = 0;
  _$jscoverage['/selector/parser.js'].lineData[421] = 0;
  _$jscoverage['/selector/parser.js'].lineData[422] = 0;
  _$jscoverage['/selector/parser.js'].lineData[423] = 0;
  _$jscoverage['/selector/parser.js'].lineData[424] = 0;
  _$jscoverage['/selector/parser.js'].lineData[432] = 0;
  _$jscoverage['/selector/parser.js'].lineData[437] = 0;
  _$jscoverage['/selector/parser.js'].lineData[445] = 0;
  _$jscoverage['/selector/parser.js'].lineData[453] = 0;
  _$jscoverage['/selector/parser.js'].lineData[461] = 0;
  _$jscoverage['/selector/parser.js'].lineData[475] = 0;
  _$jscoverage['/selector/parser.js'].lineData[487] = 0;
  _$jscoverage['/selector/parser.js'].lineData[499] = 0;
  _$jscoverage['/selector/parser.js'].lineData[510] = 0;
  _$jscoverage['/selector/parser.js'].lineData[520] = 0;
  _$jscoverage['/selector/parser.js'].lineData[541] = 0;
  _$jscoverage['/selector/parser.js'].lineData[546] = 0;
  _$jscoverage['/selector/parser.js'].lineData[552] = 0;
  _$jscoverage['/selector/parser.js'].lineData[559] = 0;
  _$jscoverage['/selector/parser.js'].lineData[567] = 0;
  _$jscoverage['/selector/parser.js'].lineData[1093] = 0;
  _$jscoverage['/selector/parser.js'].lineData[1094] = 0;
  _$jscoverage['/selector/parser.js'].lineData[1108] = 0;
  _$jscoverage['/selector/parser.js'].lineData[1110] = 0;
  _$jscoverage['/selector/parser.js'].lineData[1112] = 0;
  _$jscoverage['/selector/parser.js'].lineData[1114] = 0;
  _$jscoverage['/selector/parser.js'].lineData[1115] = 0;
  _$jscoverage['/selector/parser.js'].lineData[1118] = 0;
  _$jscoverage['/selector/parser.js'].lineData[1120] = 0;
  _$jscoverage['/selector/parser.js'].lineData[1122] = 0;
  _$jscoverage['/selector/parser.js'].lineData[1125] = 0;
  _$jscoverage['/selector/parser.js'].lineData[1126] = 0;
  _$jscoverage['/selector/parser.js'].lineData[1129] = 0;
  _$jscoverage['/selector/parser.js'].lineData[1130] = 0;
  _$jscoverage['/selector/parser.js'].lineData[1131] = 0;
  _$jscoverage['/selector/parser.js'].lineData[1134] = 0;
  _$jscoverage['/selector/parser.js'].lineData[1137] = 0;
  _$jscoverage['/selector/parser.js'].lineData[1140] = 0;
  _$jscoverage['/selector/parser.js'].lineData[1142] = 0;
  _$jscoverage['/selector/parser.js'].lineData[1144] = 0;
  _$jscoverage['/selector/parser.js'].lineData[1147] = 0;
  _$jscoverage['/selector/parser.js'].lineData[1150] = 0;
  _$jscoverage['/selector/parser.js'].lineData[1152] = 0;
  _$jscoverage['/selector/parser.js'].lineData[1155] = 0;
  _$jscoverage['/selector/parser.js'].lineData[1164] = 0;
  _$jscoverage['/selector/parser.js'].lineData[1166] = 0;
  _$jscoverage['/selector/parser.js'].lineData[1168] = 0;
  _$jscoverage['/selector/parser.js'].lineData[1169] = 0;
  _$jscoverage['/selector/parser.js'].lineData[1172] = 0;
  _$jscoverage['/selector/parser.js'].lineData[1173] = 0;
  _$jscoverage['/selector/parser.js'].lineData[1176] = 0;
  _$jscoverage['/selector/parser.js'].lineData[1177] = 0;
  _$jscoverage['/selector/parser.js'].lineData[1179] = 0;
  _$jscoverage['/selector/parser.js'].lineData[1182] = 0;
  _$jscoverage['/selector/parser.js'].lineData[1183] = 0;
  _$jscoverage['/selector/parser.js'].lineData[1185] = 0;
  _$jscoverage['/selector/parser.js'].lineData[1187] = 0;
  _$jscoverage['/selector/parser.js'].lineData[1189] = 0;
  _$jscoverage['/selector/parser.js'].lineData[1191] = 0;
  _$jscoverage['/selector/parser.js'].lineData[1193] = 0;
  _$jscoverage['/selector/parser.js'].lineData[1196] = 0;
  _$jscoverage['/selector/parser.js'].lineData[1200] = 0;
}
if (! _$jscoverage['/selector/parser.js'].functionData) {
  _$jscoverage['/selector/parser.js'].functionData = [];
  _$jscoverage['/selector/parser.js'].functionData[0] = 0;
  _$jscoverage['/selector/parser.js'].functionData[1] = 0;
  _$jscoverage['/selector/parser.js'].functionData[2] = 0;
  _$jscoverage['/selector/parser.js'].functionData[3] = 0;
  _$jscoverage['/selector/parser.js'].functionData[4] = 0;
  _$jscoverage['/selector/parser.js'].functionData[5] = 0;
  _$jscoverage['/selector/parser.js'].functionData[6] = 0;
  _$jscoverage['/selector/parser.js'].functionData[7] = 0;
  _$jscoverage['/selector/parser.js'].functionData[8] = 0;
  _$jscoverage['/selector/parser.js'].functionData[9] = 0;
  _$jscoverage['/selector/parser.js'].functionData[10] = 0;
  _$jscoverage['/selector/parser.js'].functionData[11] = 0;
  _$jscoverage['/selector/parser.js'].functionData[12] = 0;
  _$jscoverage['/selector/parser.js'].functionData[13] = 0;
  _$jscoverage['/selector/parser.js'].functionData[14] = 0;
  _$jscoverage['/selector/parser.js'].functionData[15] = 0;
  _$jscoverage['/selector/parser.js'].functionData[16] = 0;
  _$jscoverage['/selector/parser.js'].functionData[17] = 0;
  _$jscoverage['/selector/parser.js'].functionData[18] = 0;
  _$jscoverage['/selector/parser.js'].functionData[19] = 0;
  _$jscoverage['/selector/parser.js'].functionData[20] = 0;
  _$jscoverage['/selector/parser.js'].functionData[21] = 0;
  _$jscoverage['/selector/parser.js'].functionData[22] = 0;
  _$jscoverage['/selector/parser.js'].functionData[23] = 0;
  _$jscoverage['/selector/parser.js'].functionData[24] = 0;
  _$jscoverage['/selector/parser.js'].functionData[25] = 0;
  _$jscoverage['/selector/parser.js'].functionData[26] = 0;
  _$jscoverage['/selector/parser.js'].functionData[27] = 0;
  _$jscoverage['/selector/parser.js'].functionData[28] = 0;
  _$jscoverage['/selector/parser.js'].functionData[29] = 0;
  _$jscoverage['/selector/parser.js'].functionData[30] = 0;
  _$jscoverage['/selector/parser.js'].functionData[31] = 0;
  _$jscoverage['/selector/parser.js'].functionData[32] = 0;
  _$jscoverage['/selector/parser.js'].functionData[33] = 0;
  _$jscoverage['/selector/parser.js'].functionData[34] = 0;
  _$jscoverage['/selector/parser.js'].functionData[35] = 0;
  _$jscoverage['/selector/parser.js'].functionData[36] = 0;
  _$jscoverage['/selector/parser.js'].functionData[37] = 0;
  _$jscoverage['/selector/parser.js'].functionData[38] = 0;
  _$jscoverage['/selector/parser.js'].functionData[39] = 0;
  _$jscoverage['/selector/parser.js'].functionData[40] = 0;
  _$jscoverage['/selector/parser.js'].functionData[41] = 0;
  _$jscoverage['/selector/parser.js'].functionData[42] = 0;
  _$jscoverage['/selector/parser.js'].functionData[43] = 0;
  _$jscoverage['/selector/parser.js'].functionData[44] = 0;
  _$jscoverage['/selector/parser.js'].functionData[45] = 0;
  _$jscoverage['/selector/parser.js'].functionData[46] = 0;
  _$jscoverage['/selector/parser.js'].functionData[47] = 0;
  _$jscoverage['/selector/parser.js'].functionData[48] = 0;
  _$jscoverage['/selector/parser.js'].functionData[49] = 0;
  _$jscoverage['/selector/parser.js'].functionData[50] = 0;
  _$jscoverage['/selector/parser.js'].functionData[51] = 0;
  _$jscoverage['/selector/parser.js'].functionData[52] = 0;
  _$jscoverage['/selector/parser.js'].functionData[53] = 0;
}
if (! _$jscoverage['/selector/parser.js'].branchData) {
  _$jscoverage['/selector/parser.js'].branchData = {};
  _$jscoverage['/selector/parser.js'].branchData['23'] = [];
  _$jscoverage['/selector/parser.js'].branchData['23'][1] = new BranchData();
  _$jscoverage['/selector/parser.js'].branchData['27'] = [];
  _$jscoverage['/selector/parser.js'].branchData['27'][1] = new BranchData();
  _$jscoverage['/selector/parser.js'].branchData['33'] = [];
  _$jscoverage['/selector/parser.js'].branchData['33'][1] = new BranchData();
  _$jscoverage['/selector/parser.js'].branchData['35'] = [];
  _$jscoverage['/selector/parser.js'].branchData['35'][1] = new BranchData();
  _$jscoverage['/selector/parser.js'].branchData['38'] = [];
  _$jscoverage['/selector/parser.js'].branchData['38'][1] = new BranchData();
  _$jscoverage['/selector/parser.js'].branchData['44'] = [];
  _$jscoverage['/selector/parser.js'].branchData['44'][1] = new BranchData();
  _$jscoverage['/selector/parser.js'].branchData['45'] = [];
  _$jscoverage['/selector/parser.js'].branchData['45'][1] = new BranchData();
  _$jscoverage['/selector/parser.js'].branchData['54'] = [];
  _$jscoverage['/selector/parser.js'].branchData['54'][1] = new BranchData();
  _$jscoverage['/selector/parser.js'].branchData['55'] = [];
  _$jscoverage['/selector/parser.js'].branchData['55'][1] = new BranchData();
  _$jscoverage['/selector/parser.js'].branchData['110'] = [];
  _$jscoverage['/selector/parser.js'].branchData['110'][1] = new BranchData();
  _$jscoverage['/selector/parser.js'].branchData['114'] = [];
  _$jscoverage['/selector/parser.js'].branchData['114'][1] = new BranchData();
  _$jscoverage['/selector/parser.js'].branchData['115'] = [];
  _$jscoverage['/selector/parser.js'].branchData['115'][1] = new BranchData();
  _$jscoverage['/selector/parser.js'].branchData['116'] = [];
  _$jscoverage['/selector/parser.js'].branchData['116'][1] = new BranchData();
  _$jscoverage['/selector/parser.js'].branchData['119'] = [];
  _$jscoverage['/selector/parser.js'].branchData['119'][1] = new BranchData();
  _$jscoverage['/selector/parser.js'].branchData['129'] = [];
  _$jscoverage['/selector/parser.js'].branchData['129'][1] = new BranchData();
  _$jscoverage['/selector/parser.js'].branchData['144'] = [];
  _$jscoverage['/selector/parser.js'].branchData['144'][1] = new BranchData();
  _$jscoverage['/selector/parser.js'].branchData['149'] = [];
  _$jscoverage['/selector/parser.js'].branchData['149'][1] = new BranchData();
  _$jscoverage['/selector/parser.js'].branchData['160'] = [];
  _$jscoverage['/selector/parser.js'].branchData['160'][1] = new BranchData();
  _$jscoverage['/selector/parser.js'].branchData['167'] = [];
  _$jscoverage['/selector/parser.js'].branchData['167'][1] = new BranchData();
  _$jscoverage['/selector/parser.js'].branchData['185'] = [];
  _$jscoverage['/selector/parser.js'].branchData['185'][1] = new BranchData();
  _$jscoverage['/selector/parser.js'].branchData['189'] = [];
  _$jscoverage['/selector/parser.js'].branchData['189'][1] = new BranchData();
  _$jscoverage['/selector/parser.js'].branchData['192'] = [];
  _$jscoverage['/selector/parser.js'].branchData['192'][1] = new BranchData();
  _$jscoverage['/selector/parser.js'].branchData['193'] = [];
  _$jscoverage['/selector/parser.js'].branchData['193'][1] = new BranchData();
  _$jscoverage['/selector/parser.js'].branchData['194'] = [];
  _$jscoverage['/selector/parser.js'].branchData['194'][1] = new BranchData();
  _$jscoverage['/selector/parser.js'].branchData['194'][2] = new BranchData();
  _$jscoverage['/selector/parser.js'].branchData['198'] = [];
  _$jscoverage['/selector/parser.js'].branchData['198'][1] = new BranchData();
  _$jscoverage['/selector/parser.js'].branchData['218'] = [];
  _$jscoverage['/selector/parser.js'].branchData['218'][1] = new BranchData();
  _$jscoverage['/selector/parser.js'].branchData['219'] = [];
  _$jscoverage['/selector/parser.js'].branchData['219'][1] = new BranchData();
  _$jscoverage['/selector/parser.js'].branchData['227'] = [];
  _$jscoverage['/selector/parser.js'].branchData['227'][1] = new BranchData();
  _$jscoverage['/selector/parser.js'].branchData['420'] = [];
  _$jscoverage['/selector/parser.js'].branchData['420'][1] = new BranchData();
  _$jscoverage['/selector/parser.js'].branchData['1114'] = [];
  _$jscoverage['/selector/parser.js'].branchData['1114'][1] = new BranchData();
  _$jscoverage['/selector/parser.js'].branchData['1118'] = [];
  _$jscoverage['/selector/parser.js'].branchData['1118'][1] = new BranchData();
  _$jscoverage['/selector/parser.js'].branchData['1120'] = [];
  _$jscoverage['/selector/parser.js'].branchData['1120'][1] = new BranchData();
  _$jscoverage['/selector/parser.js'].branchData['1125'] = [];
  _$jscoverage['/selector/parser.js'].branchData['1125'][1] = new BranchData();
  _$jscoverage['/selector/parser.js'].branchData['1129'] = [];
  _$jscoverage['/selector/parser.js'].branchData['1129'][1] = new BranchData();
  _$jscoverage['/selector/parser.js'].branchData['1156'] = [];
  _$jscoverage['/selector/parser.js'].branchData['1156'][1] = new BranchData();
  _$jscoverage['/selector/parser.js'].branchData['1157'] = [];
  _$jscoverage['/selector/parser.js'].branchData['1157'][1] = new BranchData();
  _$jscoverage['/selector/parser.js'].branchData['1158'] = [];
  _$jscoverage['/selector/parser.js'].branchData['1158'][1] = new BranchData();
  _$jscoverage['/selector/parser.js'].branchData['1168'] = [];
  _$jscoverage['/selector/parser.js'].branchData['1168'][1] = new BranchData();
  _$jscoverage['/selector/parser.js'].branchData['1172'] = [];
  _$jscoverage['/selector/parser.js'].branchData['1172'][1] = new BranchData();
  _$jscoverage['/selector/parser.js'].branchData['1176'] = [];
  _$jscoverage['/selector/parser.js'].branchData['1176'][1] = new BranchData();
}
_$jscoverage['/selector/parser.js'].branchData['1176'][1].init(841, 17, 'ret !== undefined');
function visit41_1176_1(result) {
  _$jscoverage['/selector/parser.js'].branchData['1176'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector/parser.js'].branchData['1172'][1].init(733, 13, 'reducedAction');
function visit40_1172_1(result) {
  _$jscoverage['/selector/parser.js'].branchData['1172'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector/parser.js'].branchData['1168'][1].init(595, 7, 'i < len');
function visit39_1168_1(result) {
  _$jscoverage['/selector/parser.js'].branchData['1168'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector/parser.js'].branchData['1158'][1].init(245, 31, 'production.rhs || production[1]');
function visit38_1158_1(result) {
  _$jscoverage['/selector/parser.js'].branchData['1158'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector/parser.js'].branchData['1157'][1].init(176, 34, 'production.action || production[2]');
function visit37_1157_1(result) {
  _$jscoverage['/selector/parser.js'].branchData['1157'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector/parser.js'].branchData['1156'][1].init(104, 34, 'production.symbol || production[0]');
function visit36_1156_1(result) {
  _$jscoverage['/selector/parser.js'].branchData['1156'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector/parser.js'].branchData['1129'][1].init(116, 18, 'tableAction[state]');
function visit35_1129_1(result) {
  _$jscoverage['/selector/parser.js'].branchData['1129'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector/parser.js'].branchData['1125'][1].init(431, 7, '!action');
function visit34_1125_1(result) {
  _$jscoverage['/selector/parser.js'].branchData['1125'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector/parser.js'].branchData['1120'][1].init(91, 48, 'tableAction[state] && tableAction[state][symbol]');
function visit33_1120_1(result) {
  _$jscoverage['/selector/parser.js'].branchData['1120'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector/parser.js'].branchData['1118'][1].init(198, 6, 'symbol');
function visit32_1118_1(result) {
  _$jscoverage['/selector/parser.js'].branchData['1118'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector/parser.js'].branchData['1114'][1].init(118, 7, '!symbol');
function visit31_1114_1(result) {
  _$jscoverage['/selector/parser.js'].branchData['1114'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector/parser.js'].branchData['420'][1].init(174, 18, 'this.$1.order || 0');
function visit30_420_1(result) {
  _$jscoverage['/selector/parser.js'].branchData['420'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector/parser.js'].branchData['227'][1].init(1240, 3, 'ret');
function visit29_227_1(result) {
  _$jscoverage['/selector/parser.js'].branchData['227'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector/parser.js'].branchData['219'][1].init(960, 17, 'ret === undefined');
function visit28_219_1(result) {
  _$jscoverage['/selector/parser.js'].branchData['219'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector/parser.js'].branchData['218'][1].init(907, 27, 'action && action.call(self)');
function visit27_218_1(result) {
  _$jscoverage['/selector/parser.js'].branchData['218'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector/parser.js'].branchData['198'][1].init(74, 5, 'lines');
function visit26_198_1(result) {
  _$jscoverage['/selector/parser.js'].branchData['198'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector/parser.js'].branchData['194'][2].init(131, 20, 'rule[2] || undefined');
function visit25_194_2(result) {
  _$jscoverage['/selector/parser.js'].branchData['194'][2].ranCondition(result);
  return result;
}_$jscoverage['/selector/parser.js'].branchData['194'][1].init(116, 35, 'rule.action || rule[2] || undefined');
function visit24_194_1(result) {
  _$jscoverage['/selector/parser.js'].branchData['194'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector/parser.js'].branchData['193'][1].init(64, 21, 'rule.token || rule[0]');
function visit23_193_1(result) {
  _$jscoverage['/selector/parser.js'].branchData['193'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector/parser.js'].branchData['192'][1].init(98, 22, 'rule.regexp || rule[1]');
function visit22_192_1(result) {
  _$jscoverage['/selector/parser.js'].branchData['192'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector/parser.js'].branchData['189'][1].init(387, 16, 'i < rules.length');
function visit21_189_1(result) {
  _$jscoverage['/selector/parser.js'].branchData['189'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector/parser.js'].branchData['185'][1].init(277, 6, '!input');
function visit20_185_1(result) {
  _$jscoverage['/selector/parser.js'].branchData['185'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector/parser.js'].branchData['167'][1].init(436, 16, 'reverseSymbolMap');
function visit19_167_1(result) {
  _$jscoverage['/selector/parser.js'].branchData['167'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector/parser.js'].branchData['160'][1].init(167, 30, '!reverseSymbolMap && symbolMap');
function visit18_160_1(result) {
  _$jscoverage['/selector/parser.js'].branchData['160'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector/parser.js'].branchData['149'][1].init(53, 33, 'next.length > DEBUG_CONTEXT_LIMIT');
function visit17_149_1(result) {
  _$jscoverage['/selector/parser.js'].branchData['149'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector/parser.js'].branchData['144'][1].init(340, 36, 'matched.length > DEBUG_CONTEXT_LIMIT');
function visit16_144_1(result) {
  _$jscoverage['/selector/parser.js'].branchData['144'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector/parser.js'].branchData['129'][1].init(19, 8, 'num || 1');
function visit15_129_1(result) {
  _$jscoverage['/selector/parser.js'].branchData['129'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector/parser.js'].branchData['119'][1].init(230, 28, 'inArray(currentState, state)');
function visit14_119_1(result) {
  _$jscoverage['/selector/parser.js'].branchData['119'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector/parser.js'].branchData['116'][1].init(25, 37, 'currentState === Lexer.STATIC.INITIAL');
function visit13_116_1(result) {
  _$jscoverage['/selector/parser.js'].branchData['116'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector/parser.js'].branchData['115'][1].init(66, 6, '!state');
function visit12_115_1(result) {
  _$jscoverage['/selector/parser.js'].branchData['115'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector/parser.js'].branchData['114'][1].init(29, 15, 'r.state || r[3]');
function visit11_114_1(result) {
  _$jscoverage['/selector/parser.js'].branchData['114'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector/parser.js'].branchData['110'][1].init(179, 13, 'self.mapState');
function visit10_110_1(result) {
  _$jscoverage['/selector/parser.js'].branchData['110'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector/parser.js'].branchData['55'][1].init(17, 15, 'arr[i] === item');
function visit9_55_1(result) {
  _$jscoverage['/selector/parser.js'].branchData['55'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector/parser.js'].branchData['54'][1].init(41, 5, 'i < l');
function visit8_54_1(result) {
  _$jscoverage['/selector/parser.js'].branchData['54'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector/parser.js'].branchData['45'][1].init(25, 42, 'fn.call(context, val, i, object) === false');
function visit7_45_1(result) {
  _$jscoverage['/selector/parser.js'].branchData['45'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector/parser.js'].branchData['44'][1].init(79, 10, 'i < length');
function visit6_44_1(result) {
  _$jscoverage['/selector/parser.js'].branchData['44'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector/parser.js'].branchData['38'][1].init(75, 52, 'fn.call(context, object[key], key, object) === false');
function visit5_38_1(result) {
  _$jscoverage['/selector/parser.js'].branchData['38'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector/parser.js'].branchData['35'][1].init(147, 16, '!isArray(object)');
function visit4_35_1(result) {
  _$jscoverage['/selector/parser.js'].branchData['35'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector/parser.js'].branchData['33'][1].init(113, 15, 'context || null');
function visit3_33_1(result) {
  _$jscoverage['/selector/parser.js'].branchData['33'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector/parser.js'].branchData['27'][1].init(13, 6, 'object');
function visit2_27_1(result) {
  _$jscoverage['/selector/parser.js'].branchData['27'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector/parser.js'].branchData['23'][1].init(16, 56, '\'[object Array]\' === Object.prototype.toString.call(obj)');
function visit1_23_1(result) {
  _$jscoverage['/selector/parser.js'].branchData['23'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector/parser.js'].lineData[3]++;
KISSY.add(function(_, undefined) {
  _$jscoverage['/selector/parser.js'].functionData[0]++;
  _$jscoverage['/selector/parser.js'].lineData[6]++;
  var parser = {}, GrammarConst = {
  'SHIFT_TYPE': 1, 
  'REDUCE_TYPE': 2, 
  'ACCEPT_TYPE': 0, 
  'TYPE_INDEX': 0, 
  'PRODUCTION_INDEX': 1, 
  'TO_INDEX': 2};
  _$jscoverage['/selector/parser.js'].lineData[16]++;
  function mix(to, from) {
    _$jscoverage['/selector/parser.js'].functionData[1]++;
    _$jscoverage['/selector/parser.js'].lineData[17]++;
    for (var f in from) {
      _$jscoverage['/selector/parser.js'].lineData[18]++;
      to[f] = from[f];
    }
  }
  _$jscoverage['/selector/parser.js'].lineData[22]++;
  function isArray(obj) {
    _$jscoverage['/selector/parser.js'].functionData[2]++;
    _$jscoverage['/selector/parser.js'].lineData[23]++;
    return visit1_23_1('[object Array]' === Object.prototype.toString.call(obj));
  }
  _$jscoverage['/selector/parser.js'].lineData[26]++;
  function each(object, fn, context) {
    _$jscoverage['/selector/parser.js'].functionData[3]++;
    _$jscoverage['/selector/parser.js'].lineData[27]++;
    if (visit2_27_1(object)) {
      _$jscoverage['/selector/parser.js'].lineData[28]++;
      var key, val, length, i = 0;
      _$jscoverage['/selector/parser.js'].lineData[33]++;
      context = visit3_33_1(context || null);
      _$jscoverage['/selector/parser.js'].lineData[35]++;
      if (visit4_35_1(!isArray(object))) {
        _$jscoverage['/selector/parser.js'].lineData[36]++;
        for (key in object) {
          _$jscoverage['/selector/parser.js'].lineData[38]++;
          if (visit5_38_1(fn.call(context, object[key], key, object) === false)) {
            _$jscoverage['/selector/parser.js'].lineData[39]++;
            break;
          }
        }
      } else {
        _$jscoverage['/selector/parser.js'].lineData[43]++;
        length = object.length;
        _$jscoverage['/selector/parser.js'].lineData[44]++;
        for (val = object[0]; visit6_44_1(i < length); val = object[++i]) {
          _$jscoverage['/selector/parser.js'].lineData[45]++;
          if (visit7_45_1(fn.call(context, val, i, object) === false)) {
            _$jscoverage['/selector/parser.js'].lineData[46]++;
            break;
          }
        }
      }
    }
  }
  _$jscoverage['/selector/parser.js'].lineData[53]++;
  function inArray(item, arr) {
    _$jscoverage['/selector/parser.js'].functionData[4]++;
    _$jscoverage['/selector/parser.js'].lineData[54]++;
    for (var i = 0, l = arr.length; visit8_54_1(i < l); i++) {
      _$jscoverage['/selector/parser.js'].lineData[55]++;
      if (visit9_55_1(arr[i] === item)) {
        _$jscoverage['/selector/parser.js'].lineData[56]++;
        return true;
      }
    }
    _$jscoverage['/selector/parser.js'].lineData[59]++;
    return false;
  }
  _$jscoverage['/selector/parser.js'].lineData[61]++;
  var Lexer = function Lexer(cfg) {
  _$jscoverage['/selector/parser.js'].functionData[5]++;
  _$jscoverage['/selector/parser.js'].lineData[63]++;
  var self = this;
  _$jscoverage['/selector/parser.js'].lineData[79]++;
  self.rules = [];
  _$jscoverage['/selector/parser.js'].lineData[81]++;
  mix(self, cfg);
  _$jscoverage['/selector/parser.js'].lineData[88]++;
  self.resetInput(self.input);
};
  _$jscoverage['/selector/parser.js'].lineData[90]++;
  Lexer.prototype = {
  'resetInput': function(input) {
  _$jscoverage['/selector/parser.js'].functionData[6]++;
  _$jscoverage['/selector/parser.js'].lineData[92]++;
  mix(this, {
  input: input, 
  matched: '', 
  stateStack: [Lexer.STATIC.INITIAL], 
  match: '', 
  text: '', 
  firstLine: 1, 
  lineNumber: 1, 
  lastLine: 1, 
  firstColumn: 1, 
  lastColumn: 1});
}, 
  'getCurrentRules': function() {
  _$jscoverage['/selector/parser.js'].functionData[7]++;
  _$jscoverage['/selector/parser.js'].lineData[106]++;
  var self = this, currentState = self.stateStack[self.stateStack.length - 1], rules = [];
  _$jscoverage['/selector/parser.js'].lineData[110]++;
  if (visit10_110_1(self.mapState)) {
    _$jscoverage['/selector/parser.js'].lineData[111]++;
    currentState = self.mapState(currentState);
  }
  _$jscoverage['/selector/parser.js'].lineData[113]++;
  each(self.rules, function(r) {
  _$jscoverage['/selector/parser.js'].functionData[8]++;
  _$jscoverage['/selector/parser.js'].lineData[114]++;
  var state = visit11_114_1(r.state || r[3]);
  _$jscoverage['/selector/parser.js'].lineData[115]++;
  if (visit12_115_1(!state)) {
    _$jscoverage['/selector/parser.js'].lineData[116]++;
    if (visit13_116_1(currentState === Lexer.STATIC.INITIAL)) {
      _$jscoverage['/selector/parser.js'].lineData[117]++;
      rules.push(r);
    }
  } else {
    _$jscoverage['/selector/parser.js'].lineData[119]++;
    if (visit14_119_1(inArray(currentState, state))) {
      _$jscoverage['/selector/parser.js'].lineData[120]++;
      rules.push(r);
    }
  }
});
  _$jscoverage['/selector/parser.js'].lineData[123]++;
  return rules;
}, 
  'pushState': function(state) {
  _$jscoverage['/selector/parser.js'].functionData[9]++;
  _$jscoverage['/selector/parser.js'].lineData[126]++;
  this.stateStack.push(state);
}, 
  'popState': function(num) {
  _$jscoverage['/selector/parser.js'].functionData[10]++;
  _$jscoverage['/selector/parser.js'].lineData[129]++;
  num = visit15_129_1(num || 1);
  _$jscoverage['/selector/parser.js'].lineData[130]++;
  var ret;
  _$jscoverage['/selector/parser.js'].lineData[131]++;
  while (num--) {
    _$jscoverage['/selector/parser.js'].lineData[132]++;
    ret = this.stateStack.pop();
  }
  _$jscoverage['/selector/parser.js'].lineData[134]++;
  return ret;
}, 
  'showDebugInfo': function() {
  _$jscoverage['/selector/parser.js'].functionData[11]++;
  _$jscoverage['/selector/parser.js'].lineData[137]++;
  var self = this, DEBUG_CONTEXT_LIMIT = Lexer.STATIC.DEBUG_CONTEXT_LIMIT, matched = self.matched, match = self.match, input = self.input;
  _$jscoverage['/selector/parser.js'].lineData[142]++;
  matched = matched.slice(0, matched.length - match.length);
  _$jscoverage['/selector/parser.js'].lineData[144]++;
  var past = (visit16_144_1(matched.length > DEBUG_CONTEXT_LIMIT) ? '...' : '') + matched.slice(0 - DEBUG_CONTEXT_LIMIT).replace(/\n/, ' '), next = match + input;
  _$jscoverage['/selector/parser.js'].lineData[148]++;
  next = next.slice(0, DEBUG_CONTEXT_LIMIT) + (visit17_149_1(next.length > DEBUG_CONTEXT_LIMIT) ? '...' : '');
  _$jscoverage['/selector/parser.js'].lineData[150]++;
  return past + next + '\n' + new Array(past.length + 1).join('-') + '^';
}, 
  'mapSymbol': function mapSymbolForCodeGen(t) {
  _$jscoverage['/selector/parser.js'].functionData[12]++;
  _$jscoverage['/selector/parser.js'].lineData[153]++;
  return this.symbolMap[t];
}, 
  'mapReverseSymbol': function(rs) {
  _$jscoverage['/selector/parser.js'].functionData[13]++;
  _$jscoverage['/selector/parser.js'].lineData[156]++;
  var self = this, symbolMap = self.symbolMap, i, reverseSymbolMap = self.reverseSymbolMap;
  _$jscoverage['/selector/parser.js'].lineData[160]++;
  if (visit18_160_1(!reverseSymbolMap && symbolMap)) {
    _$jscoverage['/selector/parser.js'].lineData[161]++;
    reverseSymbolMap = self.reverseSymbolMap = {};
    _$jscoverage['/selector/parser.js'].lineData[162]++;
    for (i in symbolMap) {
      _$jscoverage['/selector/parser.js'].lineData[163]++;
      reverseSymbolMap[symbolMap[i]] = i;
    }
  }
  _$jscoverage['/selector/parser.js'].lineData[167]++;
  if (visit19_167_1(reverseSymbolMap)) {
    _$jscoverage['/selector/parser.js'].lineData[168]++;
    return reverseSymbolMap[rs];
  } else {
    _$jscoverage['/selector/parser.js'].lineData[170]++;
    return rs;
  }
}, 
  'lex': function() {
  _$jscoverage['/selector/parser.js'].functionData[14]++;
  _$jscoverage['/selector/parser.js'].lineData[174]++;
  var self = this, input = self.input, i, rule, m, ret, lines, rules = self.getCurrentRules();
  _$jscoverage['/selector/parser.js'].lineData[183]++;
  self.match = self.text = '';
  _$jscoverage['/selector/parser.js'].lineData[185]++;
  if (visit20_185_1(!input)) {
    _$jscoverage['/selector/parser.js'].lineData[186]++;
    return self.mapSymbol(Lexer.STATIC.END_TAG);
  }
  _$jscoverage['/selector/parser.js'].lineData[189]++;
  for (i = 0; visit21_189_1(i < rules.length); i++) {
    _$jscoverage['/selector/parser.js'].lineData[190]++;
    rule = rules[i];
    _$jscoverage['/selector/parser.js'].lineData[192]++;
    var regexp = visit22_192_1(rule.regexp || rule[1]), token = visit23_193_1(rule.token || rule[0]), action = visit24_194_1(rule.action || visit25_194_2(rule[2] || undefined));
    _$jscoverage['/selector/parser.js'].lineData[196]++;
    if ((m = input.match(regexp))) {
      _$jscoverage['/selector/parser.js'].lineData[197]++;
      lines = m[0].match(/\n.*/g);
      _$jscoverage['/selector/parser.js'].lineData[198]++;
      if (visit26_198_1(lines)) {
        _$jscoverage['/selector/parser.js'].lineData[199]++;
        self.lineNumber += lines.length;
      }
      _$jscoverage['/selector/parser.js'].lineData[201]++;
      mix(self, {
  firstLine: self.lastLine, 
  lastLine: self.lineNumber + 1, 
  firstColumn: self.lastColumn, 
  lastColumn: lines ? lines[lines.length - 1].length - 1 : self.lastColumn + m[0].length});
      _$jscoverage['/selector/parser.js'].lineData[208]++;
      var match;
      _$jscoverage['/selector/parser.js'].lineData[210]++;
      match = self.match = m[0];
      _$jscoverage['/selector/parser.js'].lineData[213]++;
      self.matches = m;
      _$jscoverage['/selector/parser.js'].lineData[215]++;
      self.text = match;
      _$jscoverage['/selector/parser.js'].lineData[217]++;
      self.matched += match;
      _$jscoverage['/selector/parser.js'].lineData[218]++;
      ret = visit27_218_1(action && action.call(self));
      _$jscoverage['/selector/parser.js'].lineData[219]++;
      if (visit28_219_1(ret === undefined)) {
        _$jscoverage['/selector/parser.js'].lineData[220]++;
        ret = token;
      } else {
        _$jscoverage['/selector/parser.js'].lineData[222]++;
        ret = self.mapSymbol(ret);
      }
      _$jscoverage['/selector/parser.js'].lineData[224]++;
      input = input.slice(match.length);
      _$jscoverage['/selector/parser.js'].lineData[225]++;
      self.input = input;
      _$jscoverage['/selector/parser.js'].lineData[227]++;
      if (visit29_227_1(ret)) {
        _$jscoverage['/selector/parser.js'].lineData[228]++;
        return ret;
      } else {
        _$jscoverage['/selector/parser.js'].lineData[231]++;
        return self.lex();
      }
    }
  }
}};
  _$jscoverage['/selector/parser.js'].lineData[237]++;
  Lexer.STATIC = {
  'INITIAL': 'I', 
  'DEBUG_CONTEXT_LIMIT': 20, 
  'END_TAG': '$EOF'};
  _$jscoverage['/selector/parser.js'].lineData[242]++;
  var lexer = new Lexer({
  'rules': [['b', /^\[(?:[\t\r\n\f\x20]*)/, function() {
  _$jscoverage['/selector/parser.js'].functionData[15]++;
  _$jscoverage['/selector/parser.js'].lineData[246]++;
  this.text = this.yy.trim(this.text);
}], ['c', /^(?:[\t\r\n\f\x20]*)\]/, function() {
  _$jscoverage['/selector/parser.js'].functionData[16]++;
  _$jscoverage['/selector/parser.js'].lineData[251]++;
  this.text = this.yy.trim(this.text);
}], ['d', /^(?:[\t\r\n\f\x20]*)~=(?:[\t\r\n\f\x20]*)/, function() {
  _$jscoverage['/selector/parser.js'].functionData[17]++;
  _$jscoverage['/selector/parser.js'].lineData[256]++;
  this.text = this.yy.trim(this.text);
}], ['e', /^(?:[\t\r\n\f\x20]*)\|=(?:[\t\r\n\f\x20]*)/, function() {
  _$jscoverage['/selector/parser.js'].functionData[18]++;
  _$jscoverage['/selector/parser.js'].lineData[261]++;
  this.text = this.yy.trim(this.text);
}], ['f', /^(?:[\t\r\n\f\x20]*)\^=(?:[\t\r\n\f\x20]*)/, function() {
  _$jscoverage['/selector/parser.js'].functionData[19]++;
  _$jscoverage['/selector/parser.js'].lineData[266]++;
  this.text = this.yy.trim(this.text);
}], ['g', /^(?:[\t\r\n\f\x20]*)\$=(?:[\t\r\n\f\x20]*)/, function() {
  _$jscoverage['/selector/parser.js'].functionData[20]++;
  _$jscoverage['/selector/parser.js'].lineData[271]++;
  this.text = this.yy.trim(this.text);
}], ['h', /^(?:[\t\r\n\f\x20]*)\*=(?:[\t\r\n\f\x20]*)/, function() {
  _$jscoverage['/selector/parser.js'].functionData[21]++;
  _$jscoverage['/selector/parser.js'].lineData[276]++;
  this.text = this.yy.trim(this.text);
}], ['i', /^(?:[\t\r\n\f\x20]*)\=(?:[\t\r\n\f\x20]*)/, function() {
  _$jscoverage['/selector/parser.js'].functionData[22]++;
  _$jscoverage['/selector/parser.js'].lineData[281]++;
  this.text = this.yy.trim(this.text);
}], ['j', /^(?:(?:[\w]|[^\x00-\xa0]|(?:\\[^\n\r\f0-9a-f]))(?:[\w\d-]|[^\x00-\xa0]|(?:\\[^\n\r\f0-9a-f]))*)\(/, function() {
  _$jscoverage['/selector/parser.js'].functionData[23]++;
  _$jscoverage['/selector/parser.js'].lineData[286]++;
  this.text = this.yy.trim(this.text).slice(0, -1);
  _$jscoverage['/selector/parser.js'].lineData[287]++;
  this.pushState('fn');
}], ['k', /^[^\)]*/, function() {
  _$jscoverage['/selector/parser.js'].functionData[24]++;
  _$jscoverage['/selector/parser.js'].lineData[292]++;
  this.popState();
}, ['fn']], ['l', /^(?:[\t\r\n\f\x20]*)\)/, function() {
  _$jscoverage['/selector/parser.js'].functionData[25]++;
  _$jscoverage['/selector/parser.js'].lineData[298]++;
  this.text = this.yy.trim(this.text);
}], ['m', /^:not\((?:[\t\r\n\f\x20]*)/i, function() {
  _$jscoverage['/selector/parser.js'].functionData[26]++;
  _$jscoverage['/selector/parser.js'].lineData[303]++;
  this.text = this.yy.trim(this.text);
}], ['n', /^(?:(?:[\w]|[^\x00-\xa0]|(?:\\[^\n\r\f0-9a-f]))(?:[\w\d-]|[^\x00-\xa0]|(?:\\[^\n\r\f0-9a-f]))*)/, function() {
  _$jscoverage['/selector/parser.js'].functionData[27]++;
  _$jscoverage['/selector/parser.js'].lineData[308]++;
  this.text = this.yy.unEscape(this.text);
}], ['o', /^"(\\"|[^"])*"/, function() {
  _$jscoverage['/selector/parser.js'].functionData[28]++;
  _$jscoverage['/selector/parser.js'].lineData[313]++;
  this.text = this.yy.unEscapeStr(this.text);
}], ['o', /^'(\\'|[^'])*'/, function() {
  _$jscoverage['/selector/parser.js'].functionData[29]++;
  _$jscoverage['/selector/parser.js'].lineData[318]++;
  this.text = this.yy.unEscapeStr(this.text);
}], ['p', /^#(?:(?:[\w\d-]|[^\x00-\xa0]|(?:\\[^\n\r\f0-9a-f]))+)/, function() {
  _$jscoverage['/selector/parser.js'].functionData[30]++;
  _$jscoverage['/selector/parser.js'].lineData[323]++;
  this.text = this.yy.unEscape(this.text.slice(1));
}], ['q', /^\.(?:(?:[\w]|[^\x00-\xa0]|(?:\\[^\n\r\f0-9a-f]))(?:[\w\d-]|[^\x00-\xa0]|(?:\\[^\n\r\f0-9a-f]))*)/, function() {
  _$jscoverage['/selector/parser.js'].functionData[31]++;
  _$jscoverage['/selector/parser.js'].lineData[328]++;
  this.text = this.yy.unEscape(this.text.slice(1));
}], ['r', /^(?:[\t\r\n\f\x20]*),(?:[\t\r\n\f\x20]*)/, function() {
  _$jscoverage['/selector/parser.js'].functionData[32]++;
  _$jscoverage['/selector/parser.js'].lineData[333]++;
  this.text = this.yy.trim(this.text);
}], ['s', /^::?/, 0], ['t', /^(?:[\t\r\n\f\x20]*)\+(?:[\t\r\n\f\x20]*)/, function() {
  _$jscoverage['/selector/parser.js'].functionData[33]++;
  _$jscoverage['/selector/parser.js'].lineData[339]++;
  this.text = this.yy.trim(this.text);
}], ['u', /^(?:[\t\r\n\f\x20]*)>(?:[\t\r\n\f\x20]*)/, function() {
  _$jscoverage['/selector/parser.js'].functionData[34]++;
  _$jscoverage['/selector/parser.js'].lineData[344]++;
  this.text = this.yy.trim(this.text);
}], ['v', /^(?:[\t\r\n\f\x20]*)~(?:[\t\r\n\f\x20]*)/, function() {
  _$jscoverage['/selector/parser.js'].functionData[35]++;
  _$jscoverage['/selector/parser.js'].lineData[349]++;
  this.text = this.yy.trim(this.text);
}], ['w', /^\*/, 0], ['x', /^(?:[\t\r\n\f\x20]+)/, 0], ['y', /^./, 0]]});
  _$jscoverage['/selector/parser.js'].lineData[357]++;
  parser.lexer = lexer;
  _$jscoverage['/selector/parser.js'].lineData[358]++;
  lexer.symbolMap = {
  '$EOF': 'a', 
  'LEFT_BRACKET': 'b', 
  'RIGHT_BRACKET': 'c', 
  'INCLUDES': 'd', 
  'DASH_MATCH': 'e', 
  'PREFIX_MATCH': 'f', 
  'SUFFIX_MATCH': 'g', 
  'SUBSTRING_MATCH': 'h', 
  'ALL_MATCH': 'i', 
  'FUNCTION': 'j', 
  'PARAMETER': 'k', 
  'RIGHT_PARENTHESES': 'l', 
  'NOT': 'm', 
  'IDENT': 'n', 
  'STRING': 'o', 
  'HASH': 'p', 
  'CLASS': 'q', 
  'COMMA': 'r', 
  'COLON': 's', 
  'PLUS': 't', 
  'GREATER': 'u', 
  'TILDE': 'v', 
  'UNIVERSAL': 'w', 
  'S': 'x', 
  'INVALID': 'y', 
  '$START': 'z', 
  'selectors_group': 'aa', 
  'selector': 'ab', 
  'simple_selector_sequence': 'ac', 
  'combinator': 'ad', 
  'type_selector': 'ae', 
  'id_selector': 'af', 
  'class_selector': 'ag', 
  'attrib_match': 'ah', 
  'attrib': 'ai', 
  'attrib_val': 'aj', 
  'pseudo': 'ak', 
  'negation': 'al', 
  'negation_arg': 'am', 
  'suffix_selector': 'an', 
  'suffix_selectors': 'ao'};
  _$jscoverage['/selector/parser.js'].lineData[401]++;
  parser.productions = [['z', ['aa']], ['aa', ['ab'], function() {
  _$jscoverage['/selector/parser.js'].functionData[36]++;
  _$jscoverage['/selector/parser.js'].lineData[405]++;
  return [this.$1];
}], ['aa', ['aa', 'r', 'ab'], function() {
  _$jscoverage['/selector/parser.js'].functionData[37]++;
  _$jscoverage['/selector/parser.js'].lineData[410]++;
  this.$1.push(this.$3);
}], ['ab', ['ac']], ['ab', ['ab', 'ad', 'ac'], function() {
  _$jscoverage['/selector/parser.js'].functionData[38]++;
  _$jscoverage['/selector/parser.js'].lineData[418]++;
  this.$1.nextCombinator = this.$3.prevCombinator = this.$2;
  _$jscoverage['/selector/parser.js'].lineData[419]++;
  var order;
  _$jscoverage['/selector/parser.js'].lineData[420]++;
  order = this.$1.order = visit30_420_1(this.$1.order || 0);
  _$jscoverage['/selector/parser.js'].lineData[421]++;
  this.$3.order = order + 1;
  _$jscoverage['/selector/parser.js'].lineData[422]++;
  this.$3.prev = this.$1;
  _$jscoverage['/selector/parser.js'].lineData[423]++;
  this.$1.next = this.$3;
  _$jscoverage['/selector/parser.js'].lineData[424]++;
  return this.$3;
}], ['ad', ['t']], ['ad', ['u']], ['ad', ['v']], ['ad', ['x'], function() {
  _$jscoverage['/selector/parser.js'].functionData[39]++;
  _$jscoverage['/selector/parser.js'].lineData[432]++;
  return ' ';
}], ['ae', ['n'], function() {
  _$jscoverage['/selector/parser.js'].functionData[40]++;
  _$jscoverage['/selector/parser.js'].lineData[437]++;
  return {
  t: 'tag', 
  value: this.$1};
}], ['ae', ['w'], function() {
  _$jscoverage['/selector/parser.js'].functionData[41]++;
  _$jscoverage['/selector/parser.js'].lineData[445]++;
  return {
  t: 'tag', 
  value: this.$1};
}], ['af', ['p'], function() {
  _$jscoverage['/selector/parser.js'].functionData[42]++;
  _$jscoverage['/selector/parser.js'].lineData[453]++;
  return {
  t: 'id', 
  value: this.$1};
}], ['ag', ['q'], function() {
  _$jscoverage['/selector/parser.js'].functionData[43]++;
  _$jscoverage['/selector/parser.js'].lineData[461]++;
  return {
  t: 'cls', 
  value: this.$1};
}], ['ah', ['f']], ['ah', ['g']], ['ah', ['h']], ['ah', ['i']], ['ah', ['d']], ['ah', ['e']], ['ai', ['b', 'n', 'c'], function() {
  _$jscoverage['/selector/parser.js'].functionData[44]++;
  _$jscoverage['/selector/parser.js'].lineData[475]++;
  return {
  t: 'attrib', 
  value: {
  ident: this.$2}};
}], ['aj', ['n']], ['aj', ['o']], ['ai', ['b', 'n', 'ah', 'aj', 'c'], function() {
  _$jscoverage['/selector/parser.js'].functionData[45]++;
  _$jscoverage['/selector/parser.js'].lineData[487]++;
  return {
  t: 'attrib', 
  value: {
  ident: this.$2, 
  match: this.$3, 
  value: this.$4}};
}], ['ak', ['s', 'j', 'k', 'l'], function() {
  _$jscoverage['/selector/parser.js'].functionData[46]++;
  _$jscoverage['/selector/parser.js'].lineData[499]++;
  return {
  t: 'pseudo', 
  value: {
  fn: this.$2.toLowerCase(), 
  param: this.$3}};
}], ['ak', ['s', 'n'], function() {
  _$jscoverage['/selector/parser.js'].functionData[47]++;
  _$jscoverage['/selector/parser.js'].lineData[510]++;
  return {
  t: 'pseudo', 
  value: {
  ident: this.$2.toLowerCase()}};
}], ['al', ['m', 'am', 'l'], function() {
  _$jscoverage['/selector/parser.js'].functionData[48]++;
  _$jscoverage['/selector/parser.js'].lineData[520]++;
  return {
  t: 'pseudo', 
  value: {
  fn: 'not', 
  param: this.$2}};
}], ['am', ['ae']], ['am', ['af']], ['am', ['ag']], ['am', ['ai']], ['am', ['ak']], ['an', ['af']], ['an', ['ag']], ['an', ['ai']], ['an', ['ak']], ['an', ['al']], ['ao', ['an'], function() {
  _$jscoverage['/selector/parser.js'].functionData[49]++;
  _$jscoverage['/selector/parser.js'].lineData[541]++;
  return [this.$1];
}], ['ao', ['ao', 'an'], function() {
  _$jscoverage['/selector/parser.js'].functionData[50]++;
  _$jscoverage['/selector/parser.js'].lineData[546]++;
  this.$1.push(this.$2);
}], ['ac', ['ae']], ['ac', ['ao'], function() {
  _$jscoverage['/selector/parser.js'].functionData[51]++;
  _$jscoverage['/selector/parser.js'].lineData[552]++;
  return {
  suffix: this.$1};
}], ['ac', ['ae', 'ao'], function() {
  _$jscoverage['/selector/parser.js'].functionData[52]++;
  _$jscoverage['/selector/parser.js'].lineData[559]++;
  return {
  t: 'tag', 
  value: this.$1.value, 
  suffix: this.$2};
}]];
  _$jscoverage['/selector/parser.js'].lineData[567]++;
  parser.table = {
  'gotos': {
  '0': {
  'aa': 8, 
  'ab': 9, 
  'ae': 10, 
  'af': 11, 
  'ag': 12, 
  'ai': 13, 
  'ak': 14, 
  'al': 15, 
  'an': 16, 
  'ao': 17, 
  'ac': 18}, 
  '2': {
  'ae': 20, 
  'af': 21, 
  'ag': 22, 
  'ai': 23, 
  'ak': 24, 
  'am': 25}, 
  '9': {
  'ad': 33}, 
  '10': {
  'af': 11, 
  'ag': 12, 
  'ai': 13, 
  'ak': 14, 
  'al': 15, 
  'an': 16, 
  'ao': 34}, 
  '17': {
  'af': 11, 
  'ag': 12, 
  'ai': 13, 
  'ak': 14, 
  'al': 15, 
  'an': 35}, 
  '19': {
  'ah': 43}, 
  '28': {
  'ab': 46, 
  'ae': 10, 
  'af': 11, 
  'ag': 12, 
  'ai': 13, 
  'ak': 14, 
  'al': 15, 
  'an': 16, 
  'ao': 17, 
  'ac': 18}, 
  '33': {
  'ae': 10, 
  'af': 11, 
  'ag': 12, 
  'ai': 13, 
  'ak': 14, 
  'al': 15, 
  'an': 16, 
  'ao': 17, 
  'ac': 47}, 
  '34': {
  'af': 11, 
  'ag': 12, 
  'ai': 13, 
  'ak': 14, 
  'al': 15, 
  'an': 35}, 
  '43': {
  'aj': 50}, 
  '46': {
  'ad': 33}}, 
  'action': {
  '0': {
  'b': [1, undefined, 1], 
  'm': [1, undefined, 2], 
  'n': [1, undefined, 3], 
  'p': [1, undefined, 4], 
  'q': [1, undefined, 5], 
  's': [1, undefined, 6], 
  'w': [1, undefined, 7]}, 
  '1': {
  'n': [1, undefined, 19]}, 
  '2': {
  'b': [1, undefined, 1], 
  'n': [1, undefined, 3], 
  'p': [1, undefined, 4], 
  'q': [1, undefined, 5], 
  's': [1, undefined, 6], 
  'w': [1, undefined, 7]}, 
  '3': {
  'a': [2, 9], 
  'r': [2, 9], 
  't': [2, 9], 
  'u': [2, 9], 
  'v': [2, 9], 
  'x': [2, 9], 
  'p': [2, 9], 
  'q': [2, 9], 
  'b': [2, 9], 
  's': [2, 9], 
  'm': [2, 9], 
  'l': [2, 9]}, 
  '4': {
  'a': [2, 11], 
  'r': [2, 11], 
  't': [2, 11], 
  'u': [2, 11], 
  'v': [2, 11], 
  'x': [2, 11], 
  'p': [2, 11], 
  'q': [2, 11], 
  'b': [2, 11], 
  's': [2, 11], 
  'm': [2, 11], 
  'l': [2, 11]}, 
  '5': {
  'a': [2, 12], 
  'r': [2, 12], 
  't': [2, 12], 
  'u': [2, 12], 
  'v': [2, 12], 
  'x': [2, 12], 
  'p': [2, 12], 
  'q': [2, 12], 
  'b': [2, 12], 
  's': [2, 12], 
  'm': [2, 12], 
  'l': [2, 12]}, 
  '6': {
  'j': [1, undefined, 26], 
  'n': [1, undefined, 27]}, 
  '7': {
  'a': [2, 10], 
  'r': [2, 10], 
  't': [2, 10], 
  'u': [2, 10], 
  'v': [2, 10], 
  'x': [2, 10], 
  'p': [2, 10], 
  'q': [2, 10], 
  'b': [2, 10], 
  's': [2, 10], 
  'm': [2, 10], 
  'l': [2, 10]}, 
  '8': {
  'a': [0], 
  'r': [1, undefined, 28]}, 
  '9': {
  'a': [2, 1], 
  'r': [2, 1], 
  't': [1, undefined, 29], 
  'u': [1, undefined, 30], 
  'v': [1, undefined, 31], 
  'x': [1, undefined, 32]}, 
  '10': {
  'a': [2, 38], 
  'r': [2, 38], 
  't': [2, 38], 
  'u': [2, 38], 
  'v': [2, 38], 
  'x': [2, 38], 
  'b': [1, undefined, 1], 
  'm': [1, undefined, 2], 
  'p': [1, undefined, 4], 
  'q': [1, undefined, 5], 
  's': [1, undefined, 6]}, 
  '11': {
  'a': [2, 31], 
  'r': [2, 31], 
  't': [2, 31], 
  'u': [2, 31], 
  'v': [2, 31], 
  'x': [2, 31], 
  'p': [2, 31], 
  'q': [2, 31], 
  'b': [2, 31], 
  's': [2, 31], 
  'm': [2, 31]}, 
  '12': {
  'a': [2, 32], 
  'r': [2, 32], 
  't': [2, 32], 
  'u': [2, 32], 
  'v': [2, 32], 
  'x': [2, 32], 
  'p': [2, 32], 
  'q': [2, 32], 
  'b': [2, 32], 
  's': [2, 32], 
  'm': [2, 32]}, 
  '13': {
  'a': [2, 33], 
  'r': [2, 33], 
  't': [2, 33], 
  'u': [2, 33], 
  'v': [2, 33], 
  'x': [2, 33], 
  'p': [2, 33], 
  'q': [2, 33], 
  'b': [2, 33], 
  's': [2, 33], 
  'm': [2, 33]}, 
  '14': {
  'a': [2, 34], 
  'r': [2, 34], 
  't': [2, 34], 
  'u': [2, 34], 
  'v': [2, 34], 
  'x': [2, 34], 
  'p': [2, 34], 
  'q': [2, 34], 
  'b': [2, 34], 
  's': [2, 34], 
  'm': [2, 34]}, 
  '15': {
  'a': [2, 35], 
  'r': [2, 35], 
  't': [2, 35], 
  'u': [2, 35], 
  'v': [2, 35], 
  'x': [2, 35], 
  'p': [2, 35], 
  'q': [2, 35], 
  'b': [2, 35], 
  's': [2, 35], 
  'm': [2, 35]}, 
  '16': {
  'a': [2, 36], 
  'r': [2, 36], 
  't': [2, 36], 
  'u': [2, 36], 
  'v': [2, 36], 
  'x': [2, 36], 
  'p': [2, 36], 
  'q': [2, 36], 
  'b': [2, 36], 
  's': [2, 36], 
  'm': [2, 36]}, 
  '17': {
  'a': [2, 39], 
  'r': [2, 39], 
  't': [2, 39], 
  'u': [2, 39], 
  'v': [2, 39], 
  'x': [2, 39], 
  'b': [1, undefined, 1], 
  'm': [1, undefined, 2], 
  'p': [1, undefined, 4], 
  'q': [1, undefined, 5], 
  's': [1, undefined, 6]}, 
  '18': {
  'a': [2, 3], 
  'r': [2, 3], 
  't': [2, 3], 
  'u': [2, 3], 
  'v': [2, 3], 
  'x': [2, 3]}, 
  '19': {
  'c': [1, undefined, 36], 
  'd': [1, undefined, 37], 
  'e': [1, undefined, 38], 
  'f': [1, undefined, 39], 
  'g': [1, undefined, 40], 
  'h': [1, undefined, 41], 
  'i': [1, undefined, 42]}, 
  '20': {
  'l': [2, 26]}, 
  '21': {
  'l': [2, 27]}, 
  '22': {
  'l': [2, 28]}, 
  '23': {
  'l': [2, 29]}, 
  '24': {
  'l': [2, 30]}, 
  '25': {
  'l': [1, undefined, 44]}, 
  '26': {
  'k': [1, undefined, 45]}, 
  '27': {
  'a': [2, 24], 
  'r': [2, 24], 
  't': [2, 24], 
  'u': [2, 24], 
  'v': [2, 24], 
  'x': [2, 24], 
  'p': [2, 24], 
  'q': [2, 24], 
  'b': [2, 24], 
  's': [2, 24], 
  'm': [2, 24], 
  'l': [2, 24]}, 
  '28': {
  'b': [1, undefined, 1], 
  'm': [1, undefined, 2], 
  'n': [1, undefined, 3], 
  'p': [1, undefined, 4], 
  'q': [1, undefined, 5], 
  's': [1, undefined, 6], 
  'w': [1, undefined, 7]}, 
  '29': {
  'n': [2, 5], 
  'w': [2, 5], 
  'p': [2, 5], 
  'q': [2, 5], 
  'b': [2, 5], 
  's': [2, 5], 
  'm': [2, 5]}, 
  '30': {
  'n': [2, 6], 
  'w': [2, 6], 
  'p': [2, 6], 
  'q': [2, 6], 
  'b': [2, 6], 
  's': [2, 6], 
  'm': [2, 6]}, 
  '31': {
  'n': [2, 7], 
  'w': [2, 7], 
  'p': [2, 7], 
  'q': [2, 7], 
  'b': [2, 7], 
  's': [2, 7], 
  'm': [2, 7]}, 
  '32': {
  'n': [2, 8], 
  'w': [2, 8], 
  'p': [2, 8], 
  'q': [2, 8], 
  'b': [2, 8], 
  's': [2, 8], 
  'm': [2, 8]}, 
  '33': {
  'b': [1, undefined, 1], 
  'm': [1, undefined, 2], 
  'n': [1, undefined, 3], 
  'p': [1, undefined, 4], 
  'q': [1, undefined, 5], 
  's': [1, undefined, 6], 
  'w': [1, undefined, 7]}, 
  '34': {
  'a': [2, 40], 
  'r': [2, 40], 
  't': [2, 40], 
  'u': [2, 40], 
  'v': [2, 40], 
  'x': [2, 40], 
  'b': [1, undefined, 1], 
  'm': [1, undefined, 2], 
  'p': [1, undefined, 4], 
  'q': [1, undefined, 5], 
  's': [1, undefined, 6]}, 
  '35': {
  'a': [2, 37], 
  'r': [2, 37], 
  't': [2, 37], 
  'u': [2, 37], 
  'v': [2, 37], 
  'x': [2, 37], 
  'p': [2, 37], 
  'q': [2, 37], 
  'b': [2, 37], 
  's': [2, 37], 
  'm': [2, 37]}, 
  '36': {
  'a': [2, 19], 
  'r': [2, 19], 
  't': [2, 19], 
  'u': [2, 19], 
  'v': [2, 19], 
  'x': [2, 19], 
  'p': [2, 19], 
  'q': [2, 19], 
  'b': [2, 19], 
  's': [2, 19], 
  'm': [2, 19], 
  'l': [2, 19]}, 
  '37': {
  'n': [2, 17], 
  'o': [2, 17]}, 
  '38': {
  'n': [2, 18], 
  'o': [2, 18]}, 
  '39': {
  'n': [2, 13], 
  'o': [2, 13]}, 
  '40': {
  'n': [2, 14], 
  'o': [2, 14]}, 
  '41': {
  'n': [2, 15], 
  'o': [2, 15]}, 
  '42': {
  'n': [2, 16], 
  'o': [2, 16]}, 
  '43': {
  'n': [1, undefined, 48], 
  'o': [1, undefined, 49]}, 
  '44': {
  'a': [2, 25], 
  'r': [2, 25], 
  't': [2, 25], 
  'u': [2, 25], 
  'v': [2, 25], 
  'x': [2, 25], 
  'p': [2, 25], 
  'q': [2, 25], 
  'b': [2, 25], 
  's': [2, 25], 
  'm': [2, 25]}, 
  '45': {
  'l': [1, undefined, 51]}, 
  '46': {
  'a': [2, 2], 
  'r': [2, 2], 
  't': [1, undefined, 29], 
  'u': [1, undefined, 30], 
  'v': [1, undefined, 31], 
  'x': [1, undefined, 32]}, 
  '47': {
  'a': [2, 4], 
  'r': [2, 4], 
  't': [2, 4], 
  'u': [2, 4], 
  'v': [2, 4], 
  'x': [2, 4]}, 
  '48': {
  'c': [2, 20]}, 
  '49': {
  'c': [2, 21]}, 
  '50': {
  'c': [1, undefined, 52]}, 
  '51': {
  'a': [2, 23], 
  'r': [2, 23], 
  't': [2, 23], 
  'u': [2, 23], 
  'v': [2, 23], 
  'x': [2, 23], 
  'p': [2, 23], 
  'q': [2, 23], 
  'b': [2, 23], 
  's': [2, 23], 
  'm': [2, 23], 
  'l': [2, 23]}, 
  '52': {
  'a': [2, 22], 
  'r': [2, 22], 
  't': [2, 22], 
  'u': [2, 22], 
  'v': [2, 22], 
  'x': [2, 22], 
  'p': [2, 22], 
  'q': [2, 22], 
  'b': [2, 22], 
  's': [2, 22], 
  'm': [2, 22], 
  'l': [2, 22]}}};
  _$jscoverage['/selector/parser.js'].lineData[1093]++;
  parser.parse = function parse(input, filename) {
  _$jscoverage['/selector/parser.js'].functionData[53]++;
  _$jscoverage['/selector/parser.js'].lineData[1094]++;
  var self = this, lexer = self.lexer, state, symbol, action, table = self.table, gotos = table.gotos, tableAction = table.action, productions = self.productions, valueStack = [null], prefix = filename ? ('in file: ' + filename + ' ') : '', stack = [0];
  _$jscoverage['/selector/parser.js'].lineData[1108]++;
  lexer.resetInput(input);
  _$jscoverage['/selector/parser.js'].lineData[1110]++;
  while (1) {
    _$jscoverage['/selector/parser.js'].lineData[1112]++;
    state = stack[stack.length - 1];
    _$jscoverage['/selector/parser.js'].lineData[1114]++;
    if (visit31_1114_1(!symbol)) {
      _$jscoverage['/selector/parser.js'].lineData[1115]++;
      symbol = lexer.lex();
    }
    _$jscoverage['/selector/parser.js'].lineData[1118]++;
    if (visit32_1118_1(symbol)) {
      _$jscoverage['/selector/parser.js'].lineData[1120]++;
      action = visit33_1120_1(tableAction[state] && tableAction[state][symbol]);
    } else {
      _$jscoverage['/selector/parser.js'].lineData[1122]++;
      action = null;
    }
    _$jscoverage['/selector/parser.js'].lineData[1125]++;
    if (visit34_1125_1(!action)) {
      _$jscoverage['/selector/parser.js'].lineData[1126]++;
      var expected = [], error;
      _$jscoverage['/selector/parser.js'].lineData[1129]++;
      if (visit35_1129_1(tableAction[state])) {
        _$jscoverage['/selector/parser.js'].lineData[1130]++;
        for (var symbolForState in tableAction[state]) {
          _$jscoverage['/selector/parser.js'].lineData[1131]++;
          expected.push(self.lexer.mapReverseSymbol(symbolForState));
        }
      }
      _$jscoverage['/selector/parser.js'].lineData[1134]++;
      error = prefix + 'syntax error at line ' + lexer.lineNumber + ':\n' + lexer.showDebugInfo() + '\n' + 'expect ' + expected.join(', ');
      _$jscoverage['/selector/parser.js'].lineData[1137]++;
      throw new Error(error);
    }
    _$jscoverage['/selector/parser.js'].lineData[1140]++;
    switch (action[GrammarConst.TYPE_INDEX]) {
      case GrammarConst.SHIFT_TYPE:
        _$jscoverage['/selector/parser.js'].lineData[1142]++;
        stack.push(symbol);
        _$jscoverage['/selector/parser.js'].lineData[1144]++;
        valueStack.push(lexer.text);
        _$jscoverage['/selector/parser.js'].lineData[1147]++;
        stack.push(action[GrammarConst.TO_INDEX]);
        _$jscoverage['/selector/parser.js'].lineData[1150]++;
        symbol = null;
        _$jscoverage['/selector/parser.js'].lineData[1152]++;
        break;
      case GrammarConst.REDUCE_TYPE:
        _$jscoverage['/selector/parser.js'].lineData[1155]++;
        var production = productions[action[GrammarConst.PRODUCTION_INDEX]], reducedSymbol = visit36_1156_1(production.symbol || production[0]), reducedAction = visit37_1157_1(production.action || production[2]), reducedRhs = visit38_1158_1(production.rhs || production[1]), len = reducedRhs.length, i = 0, ret, $$ = valueStack[valueStack.length - len];
        _$jscoverage['/selector/parser.js'].lineData[1164]++;
        ret = undefined;
        _$jscoverage['/selector/parser.js'].lineData[1166]++;
        self.$$ = $$;
        _$jscoverage['/selector/parser.js'].lineData[1168]++;
        for (; visit39_1168_1(i < len); i++) {
          _$jscoverage['/selector/parser.js'].lineData[1169]++;
          self['$' + (len - i)] = valueStack[valueStack.length - 1 - i];
        }
        _$jscoverage['/selector/parser.js'].lineData[1172]++;
        if (visit40_1172_1(reducedAction)) {
          _$jscoverage['/selector/parser.js'].lineData[1173]++;
          ret = reducedAction.call(self);
        }
        _$jscoverage['/selector/parser.js'].lineData[1176]++;
        if (visit41_1176_1(ret !== undefined)) {
          _$jscoverage['/selector/parser.js'].lineData[1177]++;
          $$ = ret;
        } else {
          _$jscoverage['/selector/parser.js'].lineData[1179]++;
          $$ = self.$$;
        }
        _$jscoverage['/selector/parser.js'].lineData[1182]++;
        stack = stack.slice(0, -1 * len * 2);
        _$jscoverage['/selector/parser.js'].lineData[1183]++;
        valueStack = valueStack.slice(0, -1 * len);
        _$jscoverage['/selector/parser.js'].lineData[1185]++;
        stack.push(reducedSymbol);
        _$jscoverage['/selector/parser.js'].lineData[1187]++;
        valueStack.push($$);
        _$jscoverage['/selector/parser.js'].lineData[1189]++;
        var newState = gotos[stack[stack.length - 2]][stack[stack.length - 1]];
        _$jscoverage['/selector/parser.js'].lineData[1191]++;
        stack.push(newState);
        _$jscoverage['/selector/parser.js'].lineData[1193]++;
        break;
      case GrammarConst.ACCEPT_TYPE:
        _$jscoverage['/selector/parser.js'].lineData[1196]++;
        return $$;
    }
  }
};
  _$jscoverage['/selector/parser.js'].lineData[1200]++;
  return parser;
});
