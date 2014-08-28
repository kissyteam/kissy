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
  _$jscoverage['/selector/parser.js'].lineData[4] = 0;
  _$jscoverage['/selector/parser.js'].lineData[6] = 0;
  _$jscoverage['/selector/parser.js'].lineData[15] = 0;
  _$jscoverage['/selector/parser.js'].lineData[17] = 0;
  _$jscoverage['/selector/parser.js'].lineData[33] = 0;
  _$jscoverage['/selector/parser.js'].lineData[35] = 0;
  _$jscoverage['/selector/parser.js'].lineData[42] = 0;
  _$jscoverage['/selector/parser.js'].lineData[45] = 0;
  _$jscoverage['/selector/parser.js'].lineData[48] = 0;
  _$jscoverage['/selector/parser.js'].lineData[64] = 0;
  _$jscoverage['/selector/parser.js'].lineData[66] = 0;
  _$jscoverage['/selector/parser.js'].lineData[73] = 0;
  _$jscoverage['/selector/parser.js'].lineData[77] = 0;
  _$jscoverage['/selector/parser.js'].lineData[91] = 0;
  _$jscoverage['/selector/parser.js'].lineData[94] = 0;
  _$jscoverage['/selector/parser.js'].lineData[95] = 0;
  _$jscoverage['/selector/parser.js'].lineData[96] = 0;
  _$jscoverage['/selector/parser.js'].lineData[97] = 0;
  _$jscoverage['/selector/parser.js'].lineData[98] = 0;
  _$jscoverage['/selector/parser.js'].lineData[99] = 0;
  _$jscoverage['/selector/parser.js'].lineData[101] = 0;
  _$jscoverage['/selector/parser.js'].lineData[102] = 0;
  _$jscoverage['/selector/parser.js'].lineData[105] = 0;
  _$jscoverage['/selector/parser.js'].lineData[108] = 0;
  _$jscoverage['/selector/parser.js'].lineData[111] = 0;
  _$jscoverage['/selector/parser.js'].lineData[114] = 0;
  _$jscoverage['/selector/parser.js'].lineData[117] = 0;
  _$jscoverage['/selector/parser.js'].lineData[122] = 0;
  _$jscoverage['/selector/parser.js'].lineData[123] = 0;
  _$jscoverage['/selector/parser.js'].lineData[125] = 0;
  _$jscoverage['/selector/parser.js'].lineData[126] = 0;
  _$jscoverage['/selector/parser.js'].lineData[129] = 0;
  _$jscoverage['/selector/parser.js'].lineData[131] = 0;
  _$jscoverage['/selector/parser.js'].lineData[132] = 0;
  _$jscoverage['/selector/parser.js'].lineData[134] = 0;
  _$jscoverage['/selector/parser.js'].lineData[137] = 0;
  _$jscoverage['/selector/parser.js'].lineData[141] = 0;
  _$jscoverage['/selector/parser.js'].lineData[142] = 0;
  _$jscoverage['/selector/parser.js'].lineData[143] = 0;
  _$jscoverage['/selector/parser.js'].lineData[144] = 0;
  _$jscoverage['/selector/parser.js'].lineData[147] = 0;
  _$jscoverage['/selector/parser.js'].lineData[148] = 0;
  _$jscoverage['/selector/parser.js'].lineData[150] = 0;
  _$jscoverage['/selector/parser.js'].lineData[154] = 0;
  _$jscoverage['/selector/parser.js'].lineData[156] = 0;
  _$jscoverage['/selector/parser.js'].lineData[157] = 0;
  _$jscoverage['/selector/parser.js'].lineData[159] = 0;
  _$jscoverage['/selector/parser.js'].lineData[162] = 0;
  _$jscoverage['/selector/parser.js'].lineData[171] = 0;
  _$jscoverage['/selector/parser.js'].lineData[173] = 0;
  _$jscoverage['/selector/parser.js'].lineData[174] = 0;
  _$jscoverage['/selector/parser.js'].lineData[177] = 0;
  _$jscoverage['/selector/parser.js'].lineData[178] = 0;
  _$jscoverage['/selector/parser.js'].lineData[179] = 0;
  _$jscoverage['/selector/parser.js'].lineData[182] = 0;
  _$jscoverage['/selector/parser.js'].lineData[183] = 0;
  _$jscoverage['/selector/parser.js'].lineData[184] = 0;
  _$jscoverage['/selector/parser.js'].lineData[185] = 0;
  _$jscoverage['/selector/parser.js'].lineData[187] = 0;
  _$jscoverage['/selector/parser.js'].lineData[193] = 0;
  _$jscoverage['/selector/parser.js'].lineData[195] = 0;
  _$jscoverage['/selector/parser.js'].lineData[198] = 0;
  _$jscoverage['/selector/parser.js'].lineData[200] = 0;
  _$jscoverage['/selector/parser.js'].lineData[202] = 0;
  _$jscoverage['/selector/parser.js'].lineData[203] = 0;
  _$jscoverage['/selector/parser.js'].lineData[204] = 0;
  _$jscoverage['/selector/parser.js'].lineData[205] = 0;
  _$jscoverage['/selector/parser.js'].lineData[207] = 0;
  _$jscoverage['/selector/parser.js'].lineData[209] = 0;
  _$jscoverage['/selector/parser.js'].lineData[210] = 0;
  _$jscoverage['/selector/parser.js'].lineData[212] = 0;
  _$jscoverage['/selector/parser.js'].lineData[213] = 0;
  _$jscoverage['/selector/parser.js'].lineData[216] = 0;
  _$jscoverage['/selector/parser.js'].lineData[221] = 0;
  _$jscoverage['/selector/parser.js'].lineData[222] = 0;
  _$jscoverage['/selector/parser.js'].lineData[225] = 0;
  _$jscoverage['/selector/parser.js'].lineData[230] = 0;
  _$jscoverage['/selector/parser.js'].lineData[233] = 0;
  _$jscoverage['/selector/parser.js'].lineData[236] = 0;
  _$jscoverage['/selector/parser.js'].lineData[239] = 0;
  _$jscoverage['/selector/parser.js'].lineData[242] = 0;
  _$jscoverage['/selector/parser.js'].lineData[245] = 0;
  _$jscoverage['/selector/parser.js'].lineData[248] = 0;
  _$jscoverage['/selector/parser.js'].lineData[251] = 0;
  _$jscoverage['/selector/parser.js'].lineData[254] = 0;
  _$jscoverage['/selector/parser.js'].lineData[257] = 0;
  _$jscoverage['/selector/parser.js'].lineData[258] = 0;
  _$jscoverage['/selector/parser.js'].lineData[261] = 0;
  _$jscoverage['/selector/parser.js'].lineData[264] = 0;
  _$jscoverage['/selector/parser.js'].lineData[267] = 0;
  _$jscoverage['/selector/parser.js'].lineData[270] = 0;
  _$jscoverage['/selector/parser.js'].lineData[273] = 0;
  _$jscoverage['/selector/parser.js'].lineData[276] = 0;
  _$jscoverage['/selector/parser.js'].lineData[279] = 0;
  _$jscoverage['/selector/parser.js'].lineData[282] = 0;
  _$jscoverage['/selector/parser.js'].lineData[285] = 0;
  _$jscoverage['/selector/parser.js'].lineData[289] = 0;
  _$jscoverage['/selector/parser.js'].lineData[292] = 0;
  _$jscoverage['/selector/parser.js'].lineData[295] = 0;
  _$jscoverage['/selector/parser.js'].lineData[302] = 0;
  _$jscoverage['/selector/parser.js'].lineData[303] = 0;
  _$jscoverage['/selector/parser.js'].lineData[346] = 0;
  _$jscoverage['/selector/parser.js'].lineData[349] = 0;
  _$jscoverage['/selector/parser.js'].lineData[352] = 0;
  _$jscoverage['/selector/parser.js'].lineData[358] = 0;
  _$jscoverage['/selector/parser.js'].lineData[359] = 0;
  _$jscoverage['/selector/parser.js'].lineData[360] = 0;
  _$jscoverage['/selector/parser.js'].lineData[361] = 0;
  _$jscoverage['/selector/parser.js'].lineData[362] = 0;
  _$jscoverage['/selector/parser.js'].lineData[363] = 0;
  _$jscoverage['/selector/parser.js'].lineData[364] = 0;
  _$jscoverage['/selector/parser.js'].lineData[370] = 0;
  _$jscoverage['/selector/parser.js'].lineData[373] = 0;
  _$jscoverage['/selector/parser.js'].lineData[379] = 0;
  _$jscoverage['/selector/parser.js'].lineData[385] = 0;
  _$jscoverage['/selector/parser.js'].lineData[391] = 0;
  _$jscoverage['/selector/parser.js'].lineData[403] = 0;
  _$jscoverage['/selector/parser.js'].lineData[413] = 0;
  _$jscoverage['/selector/parser.js'].lineData[423] = 0;
  _$jscoverage['/selector/parser.js'].lineData[432] = 0;
  _$jscoverage['/selector/parser.js'].lineData[440] = 0;
  _$jscoverage['/selector/parser.js'].lineData[459] = 0;
  _$jscoverage['/selector/parser.js'].lineData[462] = 0;
  _$jscoverage['/selector/parser.js'].lineData[466] = 0;
  _$jscoverage['/selector/parser.js'].lineData[471] = 0;
  _$jscoverage['/selector/parser.js'].lineData[478] = 0;
  _$jscoverage['/selector/parser.js'].lineData[1004] = 0;
  _$jscoverage['/selector/parser.js'].lineData[1006] = 0;
  _$jscoverage['/selector/parser.js'].lineData[1018] = 0;
  _$jscoverage['/selector/parser.js'].lineData[1020] = 0;
  _$jscoverage['/selector/parser.js'].lineData[1022] = 0;
  _$jscoverage['/selector/parser.js'].lineData[1024] = 0;
  _$jscoverage['/selector/parser.js'].lineData[1025] = 0;
  _$jscoverage['/selector/parser.js'].lineData[1028] = 0;
  _$jscoverage['/selector/parser.js'].lineData[1029] = 0;
  _$jscoverage['/selector/parser.js'].lineData[1030] = 0;
  _$jscoverage['/selector/parser.js'].lineData[1034] = 0;
  _$jscoverage['/selector/parser.js'].lineData[1036] = 0;
  _$jscoverage['/selector/parser.js'].lineData[1037] = 0;
  _$jscoverage['/selector/parser.js'].lineData[1039] = 0;
  _$jscoverage['/selector/parser.js'].lineData[1040] = 0;
  _$jscoverage['/selector/parser.js'].lineData[1041] = 0;
  _$jscoverage['/selector/parser.js'].lineData[1044] = 0;
  _$jscoverage['/selector/parser.js'].lineData[1046] = 0;
  _$jscoverage['/selector/parser.js'].lineData[1047] = 0;
  _$jscoverage['/selector/parser.js'].lineData[1050] = 0;
  _$jscoverage['/selector/parser.js'].lineData[1054] = 0;
  _$jscoverage['/selector/parser.js'].lineData[1056] = 0;
  _$jscoverage['/selector/parser.js'].lineData[1059] = 0;
  _$jscoverage['/selector/parser.js'].lineData[1062] = 0;
  _$jscoverage['/selector/parser.js'].lineData[1064] = 0;
  _$jscoverage['/selector/parser.js'].lineData[1068] = 0;
  _$jscoverage['/selector/parser.js'].lineData[1077] = 0;
  _$jscoverage['/selector/parser.js'].lineData[1079] = 0;
  _$jscoverage['/selector/parser.js'].lineData[1081] = 0;
  _$jscoverage['/selector/parser.js'].lineData[1082] = 0;
  _$jscoverage['/selector/parser.js'].lineData[1085] = 0;
  _$jscoverage['/selector/parser.js'].lineData[1086] = 0;
  _$jscoverage['/selector/parser.js'].lineData[1089] = 0;
  _$jscoverage['/selector/parser.js'].lineData[1090] = 0;
  _$jscoverage['/selector/parser.js'].lineData[1092] = 0;
  _$jscoverage['/selector/parser.js'].lineData[1095] = 0;
  _$jscoverage['/selector/parser.js'].lineData[1096] = 0;
  _$jscoverage['/selector/parser.js'].lineData[1097] = 0;
  _$jscoverage['/selector/parser.js'].lineData[1100] = 0;
  _$jscoverage['/selector/parser.js'].lineData[1102] = 0;
  _$jscoverage['/selector/parser.js'].lineData[1104] = 0;
  _$jscoverage['/selector/parser.js'].lineData[1106] = 0;
  _$jscoverage['/selector/parser.js'].lineData[1108] = 0;
  _$jscoverage['/selector/parser.js'].lineData[1112] = 0;
  _$jscoverage['/selector/parser.js'].lineData[1117] = 0;
  _$jscoverage['/selector/parser.js'].lineData[1120] = 0;
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
  _$jscoverage['/selector/parser.js'].branchData['96'] = [];
  _$jscoverage['/selector/parser.js'].branchData['96'][1] = new BranchData();
  _$jscoverage['/selector/parser.js'].branchData['97'] = [];
  _$jscoverage['/selector/parser.js'].branchData['97'][1] = new BranchData();
  _$jscoverage['/selector/parser.js'].branchData['98'] = [];
  _$jscoverage['/selector/parser.js'].branchData['98'][1] = new BranchData();
  _$jscoverage['/selector/parser.js'].branchData['101'] = [];
  _$jscoverage['/selector/parser.js'].branchData['101'][1] = new BranchData();
  _$jscoverage['/selector/parser.js'].branchData['123'] = [];
  _$jscoverage['/selector/parser.js'].branchData['123'][1] = new BranchData();
  _$jscoverage['/selector/parser.js'].branchData['125'] = [];
  _$jscoverage['/selector/parser.js'].branchData['125'][1] = new BranchData();
  _$jscoverage['/selector/parser.js'].branchData['131'] = [];
  _$jscoverage['/selector/parser.js'].branchData['131'][1] = new BranchData();
  _$jscoverage['/selector/parser.js'].branchData['134'] = [];
  _$jscoverage['/selector/parser.js'].branchData['134'][1] = new BranchData();
  _$jscoverage['/selector/parser.js'].branchData['141'] = [];
  _$jscoverage['/selector/parser.js'].branchData['141'][1] = new BranchData();
  _$jscoverage['/selector/parser.js'].branchData['147'] = [];
  _$jscoverage['/selector/parser.js'].branchData['147'][1] = new BranchData();
  _$jscoverage['/selector/parser.js'].branchData['156'] = [];
  _$jscoverage['/selector/parser.js'].branchData['156'][1] = new BranchData();
  _$jscoverage['/selector/parser.js'].branchData['159'] = [];
  _$jscoverage['/selector/parser.js'].branchData['159'][1] = new BranchData();
  _$jscoverage['/selector/parser.js'].branchData['173'] = [];
  _$jscoverage['/selector/parser.js'].branchData['173'][1] = new BranchData();
  _$jscoverage['/selector/parser.js'].branchData['177'] = [];
  _$jscoverage['/selector/parser.js'].branchData['177'][1] = new BranchData();
  _$jscoverage['/selector/parser.js'].branchData['179'] = [];
  _$jscoverage['/selector/parser.js'].branchData['179'][1] = new BranchData();
  _$jscoverage['/selector/parser.js'].branchData['180'] = [];
  _$jscoverage['/selector/parser.js'].branchData['180'][1] = new BranchData();
  _$jscoverage['/selector/parser.js'].branchData['181'] = [];
  _$jscoverage['/selector/parser.js'].branchData['181'][1] = new BranchData();
  _$jscoverage['/selector/parser.js'].branchData['181'][2] = new BranchData();
  _$jscoverage['/selector/parser.js'].branchData['184'] = [];
  _$jscoverage['/selector/parser.js'].branchData['184'][1] = new BranchData();
  _$jscoverage['/selector/parser.js'].branchData['203'] = [];
  _$jscoverage['/selector/parser.js'].branchData['203'][1] = new BranchData();
  _$jscoverage['/selector/parser.js'].branchData['204'] = [];
  _$jscoverage['/selector/parser.js'].branchData['204'][1] = new BranchData();
  _$jscoverage['/selector/parser.js'].branchData['212'] = [];
  _$jscoverage['/selector/parser.js'].branchData['212'][1] = new BranchData();
  _$jscoverage['/selector/parser.js'].branchData['360'] = [];
  _$jscoverage['/selector/parser.js'].branchData['360'][1] = new BranchData();
  _$jscoverage['/selector/parser.js'].branchData['1024'] = [];
  _$jscoverage['/selector/parser.js'].branchData['1024'][1] = new BranchData();
  _$jscoverage['/selector/parser.js'].branchData['1028'] = [];
  _$jscoverage['/selector/parser.js'].branchData['1028'][1] = new BranchData();
  _$jscoverage['/selector/parser.js'].branchData['1034'] = [];
  _$jscoverage['/selector/parser.js'].branchData['1034'][1] = new BranchData();
  _$jscoverage['/selector/parser.js'].branchData['1036'] = [];
  _$jscoverage['/selector/parser.js'].branchData['1036'][1] = new BranchData();
  _$jscoverage['/selector/parser.js'].branchData['1039'] = [];
  _$jscoverage['/selector/parser.js'].branchData['1039'][1] = new BranchData();
  _$jscoverage['/selector/parser.js'].branchData['1069'] = [];
  _$jscoverage['/selector/parser.js'].branchData['1069'][1] = new BranchData();
  _$jscoverage['/selector/parser.js'].branchData['1070'] = [];
  _$jscoverage['/selector/parser.js'].branchData['1070'][1] = new BranchData();
  _$jscoverage['/selector/parser.js'].branchData['1071'] = [];
  _$jscoverage['/selector/parser.js'].branchData['1071'][1] = new BranchData();
  _$jscoverage['/selector/parser.js'].branchData['1081'] = [];
  _$jscoverage['/selector/parser.js'].branchData['1081'][1] = new BranchData();
  _$jscoverage['/selector/parser.js'].branchData['1085'] = [];
  _$jscoverage['/selector/parser.js'].branchData['1085'][1] = new BranchData();
  _$jscoverage['/selector/parser.js'].branchData['1089'] = [];
  _$jscoverage['/selector/parser.js'].branchData['1089'][1] = new BranchData();
  _$jscoverage['/selector/parser.js'].branchData['1095'] = [];
  _$jscoverage['/selector/parser.js'].branchData['1095'][1] = new BranchData();
}
_$jscoverage['/selector/parser.js'].branchData['1095'][1].init(1108, 3, 'len');
function visit35_1095_1(result) {
  _$jscoverage['/selector/parser.js'].branchData['1095'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector/parser.js'].branchData['1089'][1].init(933, 17, 'ret !== undefined');
function visit34_1089_1(result) {
  _$jscoverage['/selector/parser.js'].branchData['1089'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector/parser.js'].branchData['1085'][1].init(809, 13, 'reducedAction');
function visit33_1085_1(result) {
  _$jscoverage['/selector/parser.js'].branchData['1085'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector/parser.js'].branchData['1081'][1].init(655, 7, 'i < len');
function visit32_1081_1(result) {
  _$jscoverage['/selector/parser.js'].branchData['1081'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector/parser.js'].branchData['1071'][1].init(260, 31, 'production.rhs || production[1]');
function visit31_1071_1(result) {
  _$jscoverage['/selector/parser.js'].branchData['1071'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector/parser.js'].branchData['1070'][1].init(186, 34, 'production.action || production[2]');
function visit30_1070_1(result) {
  _$jscoverage['/selector/parser.js'].branchData['1070'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector/parser.js'].branchData['1069'][1].init(109, 34, 'production.symbol || production[0]');
function visit29_1069_1(result) {
  _$jscoverage['/selector/parser.js'].branchData['1069'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector/parser.js'].branchData['1039'][1].init(86, 18, 'tableAction[state]');
function visit28_1039_1(result) {
  _$jscoverage['/selector/parser.js'].branchData['1039'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector/parser.js'].branchData['1036'][1].init(488, 7, '!action');
function visit27_1036_1(result) {
  _$jscoverage['/selector/parser.js'].branchData['1036'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector/parser.js'].branchData['1034'][1].init(419, 48, 'tableAction[state] && tableAction[state][symbol]');
function visit26_1034_1(result) {
  _$jscoverage['/selector/parser.js'].branchData['1034'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector/parser.js'].branchData['1028'][1].init(206, 7, '!symbol');
function visit25_1028_1(result) {
  _$jscoverage['/selector/parser.js'].branchData['1028'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector/parser.js'].branchData['1024'][1].init(122, 7, '!symbol');
function visit24_1024_1(result) {
  _$jscoverage['/selector/parser.js'].branchData['1024'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector/parser.js'].branchData['360'][1].init(163, 18, 'this.$1.order || 0');
function visit23_360_1(result) {
  _$jscoverage['/selector/parser.js'].branchData['360'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector/parser.js'].branchData['212'][1].init(1244, 3, 'ret');
function visit22_212_1(result) {
  _$jscoverage['/selector/parser.js'].branchData['212'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector/parser.js'].branchData['204'][1].init(956, 17, 'ret === undefined');
function visit21_204_1(result) {
  _$jscoverage['/selector/parser.js'].branchData['204'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector/parser.js'].branchData['203'][1].init(902, 27, 'action && action.call(self)');
function visit20_203_1(result) {
  _$jscoverage['/selector/parser.js'].branchData['203'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector/parser.js'].branchData['184'][1].init(76, 5, 'lines');
function visit19_184_1(result) {
  _$jscoverage['/selector/parser.js'].branchData['184'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector/parser.js'].branchData['181'][2].init(133, 20, 'rule[2] || undefined');
function visit18_181_2(result) {
  _$jscoverage['/selector/parser.js'].branchData['181'][2].ranCondition(result);
  return result;
}_$jscoverage['/selector/parser.js'].branchData['181'][1].init(118, 35, 'rule.action || rule[2] || undefined');
function visit17_181_1(result) {
  _$jscoverage['/selector/parser.js'].branchData['181'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector/parser.js'].branchData['180'][1].init(65, 21, 'rule.token || rule[0]');
function visit16_180_1(result) {
  _$jscoverage['/selector/parser.js'].branchData['180'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector/parser.js'].branchData['179'][1].init(65, 22, 'rule.regexp || rule[1]');
function visit15_179_1(result) {
  _$jscoverage['/selector/parser.js'].branchData['179'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector/parser.js'].branchData['177'][1].init(403, 16, 'i < rules.length');
function visit14_177_1(result) {
  _$jscoverage['/selector/parser.js'].branchData['177'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector/parser.js'].branchData['173'][1].init(289, 6, '!input');
function visit13_173_1(result) {
  _$jscoverage['/selector/parser.js'].branchData['173'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector/parser.js'].branchData['159'][1].init(166, 47, 'stateMap[s] || (stateMap[s] = (++self.stateId))');
function visit12_159_1(result) {
  _$jscoverage['/selector/parser.js'].branchData['159'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector/parser.js'].branchData['156'][1].init(91, 9, '!stateMap');
function visit11_156_1(result) {
  _$jscoverage['/selector/parser.js'].branchData['156'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector/parser.js'].branchData['147'][1].init(418, 16, 'reverseSymbolMap');
function visit10_147_1(result) {
  _$jscoverage['/selector/parser.js'].branchData['147'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector/parser.js'].branchData['141'][1].init(172, 30, '!reverseSymbolMap && symbolMap');
function visit9_141_1(result) {
  _$jscoverage['/selector/parser.js'].branchData['141'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector/parser.js'].branchData['134'][1].init(169, 50, 'symbolMap[t] || (symbolMap[t] = (++self.symbolId))');
function visit8_134_1(result) {
  _$jscoverage['/selector/parser.js'].branchData['134'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector/parser.js'].branchData['131'][1].init(93, 10, '!symbolMap');
function visit7_131_1(result) {
  _$jscoverage['/selector/parser.js'].branchData['131'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector/parser.js'].branchData['125'][1].init(522, 33, 'next.length > DEBUG_CONTEXT_LIMIT');
function visit6_125_1(result) {
  _$jscoverage['/selector/parser.js'].branchData['125'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector/parser.js'].branchData['123'][1].init(316, 36, 'matched.length > DEBUG_CONTEXT_LIMIT');
function visit5_123_1(result) {
  _$jscoverage['/selector/parser.js'].branchData['123'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector/parser.js'].branchData['101'][1].init(236, 30, 'S.inArray(currentState, state)');
function visit4_101_1(result) {
  _$jscoverage['/selector/parser.js'].branchData['101'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector/parser.js'].branchData['98'][1].init(26, 37, 'currentState === Lexer.STATIC.INITIAL');
function visit3_98_1(result) {
  _$jscoverage['/selector/parser.js'].branchData['98'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector/parser.js'].branchData['97'][1].init(68, 6, '!state');
function visit2_97_1(result) {
  _$jscoverage['/selector/parser.js'].branchData['97'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector/parser.js'].branchData['96'][1].init(30, 15, 'r.state || r[3]');
function visit1_96_1(result) {
  _$jscoverage['/selector/parser.js'].branchData['96'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector/parser.js'].lineData[4]++;
KISSY.add(function() {
  _$jscoverage['/selector/parser.js'].functionData[0]++;
  _$jscoverage['/selector/parser.js'].lineData[6]++;
  var parser = {}, S = KISSY, GrammarConst = {
  'SHIFT_TYPE': 1, 
  'REDUCE_TYPE': 2, 
  'ACCEPT_TYPE': 0, 
  'TYPE_INDEX': 0, 
  'PRODUCTION_INDEX': 1, 
  'TO_INDEX': 2};
  _$jscoverage['/selector/parser.js'].lineData[15]++;
  var Lexer = function(cfg) {
  _$jscoverage['/selector/parser.js'].functionData[1]++;
  _$jscoverage['/selector/parser.js'].lineData[17]++;
  var self = this;
  _$jscoverage['/selector/parser.js'].lineData[33]++;
  self.rules = [];
  _$jscoverage['/selector/parser.js'].lineData[35]++;
  S.mix(self, cfg);
  _$jscoverage['/selector/parser.js'].lineData[42]++;
  self.resetInput(self.input);
};
  _$jscoverage['/selector/parser.js'].lineData[45]++;
  Lexer.prototype = {
  'constructor': function(cfg) {
  _$jscoverage['/selector/parser.js'].functionData[2]++;
  _$jscoverage['/selector/parser.js'].lineData[48]++;
  var self = this;
  _$jscoverage['/selector/parser.js'].lineData[64]++;
  self.rules = [];
  _$jscoverage['/selector/parser.js'].lineData[66]++;
  S.mix(self, cfg);
  _$jscoverage['/selector/parser.js'].lineData[73]++;
  self.resetInput(self.input);
}, 
  'resetInput': function(input) {
  _$jscoverage['/selector/parser.js'].functionData[3]++;
  _$jscoverage['/selector/parser.js'].lineData[77]++;
  S.mix(this, {
  input: input, 
  matched: "", 
  stateStack: [Lexer.STATIC.INITIAL], 
  match: "", 
  text: "", 
  firstLine: 1, 
  lineNumber: 1, 
  lastLine: 1, 
  firstColumn: 1, 
  lastColumn: 1});
}, 
  'getCurrentRules': function() {
  _$jscoverage['/selector/parser.js'].functionData[4]++;
  _$jscoverage['/selector/parser.js'].lineData[91]++;
  var self = this, currentState = self.stateStack[self.stateStack.length - 1], rules = [];
  _$jscoverage['/selector/parser.js'].lineData[94]++;
  currentState = self.mapState(currentState);
  _$jscoverage['/selector/parser.js'].lineData[95]++;
  S.each(self.rules, function(r) {
  _$jscoverage['/selector/parser.js'].functionData[5]++;
  _$jscoverage['/selector/parser.js'].lineData[96]++;
  var state = visit1_96_1(r.state || r[3]);
  _$jscoverage['/selector/parser.js'].lineData[97]++;
  if (visit2_97_1(!state)) {
    _$jscoverage['/selector/parser.js'].lineData[98]++;
    if (visit3_98_1(currentState === Lexer.STATIC.INITIAL)) {
      _$jscoverage['/selector/parser.js'].lineData[99]++;
      rules.push(r);
    }
  } else {
    _$jscoverage['/selector/parser.js'].lineData[101]++;
    if (visit4_101_1(S.inArray(currentState, state))) {
      _$jscoverage['/selector/parser.js'].lineData[102]++;
      rules.push(r);
    }
  }
});
  _$jscoverage['/selector/parser.js'].lineData[105]++;
  return rules;
}, 
  'pushState': function(state) {
  _$jscoverage['/selector/parser.js'].functionData[6]++;
  _$jscoverage['/selector/parser.js'].lineData[108]++;
  this.stateStack.push(state);
}, 
  'popState': function() {
  _$jscoverage['/selector/parser.js'].functionData[7]++;
  _$jscoverage['/selector/parser.js'].lineData[111]++;
  return this.stateStack.pop();
}, 
  'getStateStack': function() {
  _$jscoverage['/selector/parser.js'].functionData[8]++;
  _$jscoverage['/selector/parser.js'].lineData[114]++;
  return this.stateStack;
}, 
  'showDebugInfo': function() {
  _$jscoverage['/selector/parser.js'].functionData[9]++;
  _$jscoverage['/selector/parser.js'].lineData[117]++;
  var self = this, DEBUG_CONTEXT_LIMIT = Lexer.STATIC.DEBUG_CONTEXT_LIMIT, matched = self.matched, match = self.match, input = self.input;
  _$jscoverage['/selector/parser.js'].lineData[122]++;
  matched = matched.slice(0, matched.length - match.length);
  _$jscoverage['/selector/parser.js'].lineData[123]++;
  var past = (visit5_123_1(matched.length > DEBUG_CONTEXT_LIMIT) ? "..." : "") + matched.slice(-DEBUG_CONTEXT_LIMIT).replace(/\n/, " "), next = match + input;
  _$jscoverage['/selector/parser.js'].lineData[125]++;
  next = next.slice(0, DEBUG_CONTEXT_LIMIT) + (visit6_125_1(next.length > DEBUG_CONTEXT_LIMIT) ? "..." : "");
  _$jscoverage['/selector/parser.js'].lineData[126]++;
  return past + next + "\n" + new Array(past.length + 1).join("-") + "^";
}, 
  'mapSymbol': function(t) {
  _$jscoverage['/selector/parser.js'].functionData[10]++;
  _$jscoverage['/selector/parser.js'].lineData[129]++;
  var self = this, symbolMap = self.symbolMap;
  _$jscoverage['/selector/parser.js'].lineData[131]++;
  if (visit7_131_1(!symbolMap)) {
    _$jscoverage['/selector/parser.js'].lineData[132]++;
    return t;
  }
  _$jscoverage['/selector/parser.js'].lineData[134]++;
  return visit8_134_1(symbolMap[t] || (symbolMap[t] = (++self.symbolId)));
}, 
  'mapReverseSymbol': function(rs) {
  _$jscoverage['/selector/parser.js'].functionData[11]++;
  _$jscoverage['/selector/parser.js'].lineData[137]++;
  var self = this, symbolMap = self.symbolMap, i, reverseSymbolMap = self.reverseSymbolMap;
  _$jscoverage['/selector/parser.js'].lineData[141]++;
  if (visit9_141_1(!reverseSymbolMap && symbolMap)) {
    _$jscoverage['/selector/parser.js'].lineData[142]++;
    reverseSymbolMap = self.reverseSymbolMap = {};
    _$jscoverage['/selector/parser.js'].lineData[143]++;
    for (i in symbolMap) {
      _$jscoverage['/selector/parser.js'].lineData[144]++;
      reverseSymbolMap[symbolMap[i]] = i;
    }
  }
  _$jscoverage['/selector/parser.js'].lineData[147]++;
  if (visit10_147_1(reverseSymbolMap)) {
    _$jscoverage['/selector/parser.js'].lineData[148]++;
    return reverseSymbolMap[rs];
  } else {
    _$jscoverage['/selector/parser.js'].lineData[150]++;
    return rs;
  }
}, 
  'mapState': function(s) {
  _$jscoverage['/selector/parser.js'].functionData[12]++;
  _$jscoverage['/selector/parser.js'].lineData[154]++;
  var self = this, stateMap = self.stateMap;
  _$jscoverage['/selector/parser.js'].lineData[156]++;
  if (visit11_156_1(!stateMap)) {
    _$jscoverage['/selector/parser.js'].lineData[157]++;
    return s;
  }
  _$jscoverage['/selector/parser.js'].lineData[159]++;
  return visit12_159_1(stateMap[s] || (stateMap[s] = (++self.stateId)));
}, 
  'lex': function() {
  _$jscoverage['/selector/parser.js'].functionData[13]++;
  _$jscoverage['/selector/parser.js'].lineData[162]++;
  var self = this, input = self.input, i, rule, m, ret, lines, rules = self.getCurrentRules();
  _$jscoverage['/selector/parser.js'].lineData[171]++;
  self.match = self.text = "";
  _$jscoverage['/selector/parser.js'].lineData[173]++;
  if (visit13_173_1(!input)) {
    _$jscoverage['/selector/parser.js'].lineData[174]++;
    return self.mapSymbol(Lexer.STATIC.END_TAG);
  }
  _$jscoverage['/selector/parser.js'].lineData[177]++;
  for (i = 0; visit14_177_1(i < rules.length); i++) {
    _$jscoverage['/selector/parser.js'].lineData[178]++;
    rule = rules[i];
    _$jscoverage['/selector/parser.js'].lineData[179]++;
    var regexp = visit15_179_1(rule.regexp || rule[1]), token = visit16_180_1(rule.token || rule[0]), action = visit17_181_1(rule.action || visit18_181_2(rule[2] || undefined));
    _$jscoverage['/selector/parser.js'].lineData[182]++;
    if ((m = input.match(regexp))) {
      _$jscoverage['/selector/parser.js'].lineData[183]++;
      lines = m[0].match(/\n.*/g);
      _$jscoverage['/selector/parser.js'].lineData[184]++;
      if (visit19_184_1(lines)) {
        _$jscoverage['/selector/parser.js'].lineData[185]++;
        self.lineNumber += lines.length;
      }
      _$jscoverage['/selector/parser.js'].lineData[187]++;
      S.mix(self, {
  firstLine: self.lastLine, 
  lastLine: self.lineNumber + 1, 
  firstColumn: self.lastColumn, 
  lastColumn: lines ? lines[lines.length - 1].length - 1 : self.lastColumn + m[0].length});
      _$jscoverage['/selector/parser.js'].lineData[193]++;
      var match;
      _$jscoverage['/selector/parser.js'].lineData[195]++;
      match = self.match = m[0];
      _$jscoverage['/selector/parser.js'].lineData[198]++;
      self.matches = m;
      _$jscoverage['/selector/parser.js'].lineData[200]++;
      self.text = match;
      _$jscoverage['/selector/parser.js'].lineData[202]++;
      self.matched += match;
      _$jscoverage['/selector/parser.js'].lineData[203]++;
      ret = visit20_203_1(action && action.call(self));
      _$jscoverage['/selector/parser.js'].lineData[204]++;
      if (visit21_204_1(ret === undefined)) {
        _$jscoverage['/selector/parser.js'].lineData[205]++;
        ret = token;
      } else {
        _$jscoverage['/selector/parser.js'].lineData[207]++;
        ret = self.mapSymbol(ret);
      }
      _$jscoverage['/selector/parser.js'].lineData[209]++;
      input = input.slice(match.length);
      _$jscoverage['/selector/parser.js'].lineData[210]++;
      self.input = input;
      _$jscoverage['/selector/parser.js'].lineData[212]++;
      if (visit22_212_1(ret)) {
        _$jscoverage['/selector/parser.js'].lineData[213]++;
        return ret;
      } else {
        _$jscoverage['/selector/parser.js'].lineData[216]++;
        return self.lex();
      }
    }
  }
  _$jscoverage['/selector/parser.js'].lineData[221]++;
  S.error("lex error at line " + self.lineNumber + ":\n" + self.showDebugInfo());
  _$jscoverage['/selector/parser.js'].lineData[222]++;
  return undefined;
}};
  _$jscoverage['/selector/parser.js'].lineData[225]++;
  Lexer.STATIC = {
  'INITIAL': 'I', 
  'DEBUG_CONTEXT_LIMIT': 20, 
  'END_TAG': '$EOF'};
  _$jscoverage['/selector/parser.js'].lineData[230]++;
  var lexer = new Lexer({
  'rules': [[2, /^\[(?:[\t\r\n\f\x20]*)/, function() {
  _$jscoverage['/selector/parser.js'].functionData[14]++;
  _$jscoverage['/selector/parser.js'].lineData[233]++;
  this.text = KISSY.trim(this.text);
}], [3, /^(?:[\t\r\n\f\x20]*)\]/, function() {
  _$jscoverage['/selector/parser.js'].functionData[15]++;
  _$jscoverage['/selector/parser.js'].lineData[236]++;
  this.text = KISSY.trim(this.text);
}], [4, /^(?:[\t\r\n\f\x20]*)~=(?:[\t\r\n\f\x20]*)/, function() {
  _$jscoverage['/selector/parser.js'].functionData[16]++;
  _$jscoverage['/selector/parser.js'].lineData[239]++;
  this.text = KISSY.trim(this.text);
}], [5, /^(?:[\t\r\n\f\x20]*)\|=(?:[\t\r\n\f\x20]*)/, function() {
  _$jscoverage['/selector/parser.js'].functionData[17]++;
  _$jscoverage['/selector/parser.js'].lineData[242]++;
  this.text = KISSY.trim(this.text);
}], [6, /^(?:[\t\r\n\f\x20]*)\^=(?:[\t\r\n\f\x20]*)/, function() {
  _$jscoverage['/selector/parser.js'].functionData[18]++;
  _$jscoverage['/selector/parser.js'].lineData[245]++;
  this.text = KISSY.trim(this.text);
}], [7, /^(?:[\t\r\n\f\x20]*)\$=(?:[\t\r\n\f\x20]*)/, function() {
  _$jscoverage['/selector/parser.js'].functionData[19]++;
  _$jscoverage['/selector/parser.js'].lineData[248]++;
  this.text = KISSY.trim(this.text);
}], [8, /^(?:[\t\r\n\f\x20]*)\*=(?:[\t\r\n\f\x20]*)/, function() {
  _$jscoverage['/selector/parser.js'].functionData[20]++;
  _$jscoverage['/selector/parser.js'].lineData[251]++;
  this.text = KISSY.trim(this.text);
}], [9, /^(?:[\t\r\n\f\x20]*)\=(?:[\t\r\n\f\x20]*)/, function() {
  _$jscoverage['/selector/parser.js'].functionData[21]++;
  _$jscoverage['/selector/parser.js'].lineData[254]++;
  this.text = KISSY.trim(this.text);
}], [10, /^(?:(?:[\w]|[^\x00-\xa0]|(?:\\[^\n\r\f0-9a-f]))(?:[\w\d-]|[^\x00-\xa0]|(?:\\[^\n\r\f0-9a-f]))*)\(/, function() {
  _$jscoverage['/selector/parser.js'].functionData[22]++;
  _$jscoverage['/selector/parser.js'].lineData[257]++;
  this.text = KISSY.trim(this.text).slice(0, -1);
  _$jscoverage['/selector/parser.js'].lineData[258]++;
  this.pushState('fn');
}], [11, /^[^\)]*/, function() {
  _$jscoverage['/selector/parser.js'].functionData[23]++;
  _$jscoverage['/selector/parser.js'].lineData[261]++;
  this.popState();
}, ['fn']], [12, /^(?:[\t\r\n\f\x20]*)\)/, function() {
  _$jscoverage['/selector/parser.js'].functionData[24]++;
  _$jscoverage['/selector/parser.js'].lineData[264]++;
  this.text = KISSY.trim(this.text);
}], [13, /^:not\((?:[\t\r\n\f\x20]*)/, function() {
  _$jscoverage['/selector/parser.js'].functionData[25]++;
  _$jscoverage['/selector/parser.js'].lineData[267]++;
  this.text = KISSY.trim(this.text);
}], [14, /^(?:(?:[\w]|[^\x00-\xa0]|(?:\\[^\n\r\f0-9a-f]))(?:[\w\d-]|[^\x00-\xa0]|(?:\\[^\n\r\f0-9a-f]))*)/, function() {
  _$jscoverage['/selector/parser.js'].functionData[26]++;
  _$jscoverage['/selector/parser.js'].lineData[270]++;
  this.text = this.yy.unEscape(this.text);
}], [15, /^"(\\"|[^"])*"/, function() {
  _$jscoverage['/selector/parser.js'].functionData[27]++;
  _$jscoverage['/selector/parser.js'].lineData[273]++;
  this.text = this.yy.unEscapeStr(this.text);
}], [15, /^'(\\'|[^'])*'/, function() {
  _$jscoverage['/selector/parser.js'].functionData[28]++;
  _$jscoverage['/selector/parser.js'].lineData[276]++;
  this.text = this.yy.unEscapeStr(this.text);
}], [16, /^#(?:(?:[\w\d-]|[^\x00-\xa0]|(?:\\[^\n\r\f0-9a-f]))+)/, function() {
  _$jscoverage['/selector/parser.js'].functionData[29]++;
  _$jscoverage['/selector/parser.js'].lineData[279]++;
  this.text = this.yy.unEscape(this.text.slice(1));
}], [17, /^\.(?:(?:[\w]|[^\x00-\xa0]|(?:\\[^\n\r\f0-9a-f]))(?:[\w\d-]|[^\x00-\xa0]|(?:\\[^\n\r\f0-9a-f]))*)/, function() {
  _$jscoverage['/selector/parser.js'].functionData[30]++;
  _$jscoverage['/selector/parser.js'].lineData[282]++;
  this.text = this.yy.unEscape(this.text.slice(1));
}], [18, /^(?:[\t\r\n\f\x20]*),(?:[\t\r\n\f\x20]*)/, function() {
  _$jscoverage['/selector/parser.js'].functionData[31]++;
  _$jscoverage['/selector/parser.js'].lineData[285]++;
  this.text = KISSY.trim(this.text);
}], [19, /^::?/, 0], [20, /^(?:[\t\r\n\f\x20]*)\+(?:[\t\r\n\f\x20]*)/, function() {
  _$jscoverage['/selector/parser.js'].functionData[32]++;
  _$jscoverage['/selector/parser.js'].lineData[289]++;
  this.text = KISSY.trim(this.text);
}], [21, /^(?:[\t\r\n\f\x20]*)>(?:[\t\r\n\f\x20]*)/, function() {
  _$jscoverage['/selector/parser.js'].functionData[33]++;
  _$jscoverage['/selector/parser.js'].lineData[292]++;
  this.text = KISSY.trim(this.text);
}], [22, /^(?:[\t\r\n\f\x20]*)~(?:[\t\r\n\f\x20]*)/, function() {
  _$jscoverage['/selector/parser.js'].functionData[34]++;
  _$jscoverage['/selector/parser.js'].lineData[295]++;
  this.text = KISSY.trim(this.text);
}], [23, /^\*/, 0], [24, /^(?:[\t\r\n\f\x20]+)/, 0], [25, /^./, 0]]});
  _$jscoverage['/selector/parser.js'].lineData[302]++;
  parser.lexer = lexer;
  _$jscoverage['/selector/parser.js'].lineData[303]++;
  lexer.symbolMap = {
  '$EOF': 1, 
  'LEFT_BRACKET': 2, 
  'RIGHT_BRACKET': 3, 
  'INCLUDES': 4, 
  'DASH_MATCH': 5, 
  'PREFIX_MATCH': 6, 
  'SUFFIX_MATCH': 7, 
  'SUBSTRING_MATCH': 8, 
  'ALL_MATCH': 9, 
  'FUNCTION': 10, 
  'PARAMETER': 11, 
  'RIGHT_PARENTHESES': 12, 
  'NOT': 13, 
  'IDENT': 14, 
  'STRING': 15, 
  'HASH': 16, 
  'CLASS': 17, 
  'COMMA': 18, 
  'COLON': 19, 
  'PLUS': 20, 
  'GREATER': 21, 
  'TILDE': 22, 
  'UNIVERSAL': 23, 
  'S': 24, 
  'INVALID': 25, 
  '$START': 26, 
  'selectors_group': 27, 
  'selector': 28, 
  'simple_selector_sequence': 29, 
  'combinator': 30, 
  'type_selector': 31, 
  'id_selector': 32, 
  'class_selector': 33, 
  'attrib_match': 34, 
  'attrib': 35, 
  'attrib_val': 36, 
  'pseudo': 37, 
  'negation': 38, 
  'negation_arg': 39, 
  'suffix_selector': 40, 
  'suffix_selectors': 41};
  _$jscoverage['/selector/parser.js'].lineData[346]++;
  parser.productions = [[26, [27]], [27, [28], function() {
  _$jscoverage['/selector/parser.js'].functionData[35]++;
  _$jscoverage['/selector/parser.js'].lineData[349]++;
  return [this.$1];
}], [27, [27, 18, 28], function() {
  _$jscoverage['/selector/parser.js'].functionData[36]++;
  _$jscoverage['/selector/parser.js'].lineData[352]++;
  this.$1.push(this.$3);
}], [28, [29]], [28, [28, 30, 29], function() {
  _$jscoverage['/selector/parser.js'].functionData[37]++;
  _$jscoverage['/selector/parser.js'].lineData[358]++;
  this.$1.nextCombinator = this.$3.prevCombinator = this.$2;
  _$jscoverage['/selector/parser.js'].lineData[359]++;
  var order;
  _$jscoverage['/selector/parser.js'].lineData[360]++;
  order = this.$1.order = visit23_360_1(this.$1.order || 0);
  _$jscoverage['/selector/parser.js'].lineData[361]++;
  this.$3.order = order + 1;
  _$jscoverage['/selector/parser.js'].lineData[362]++;
  this.$3.prev = this.$1;
  _$jscoverage['/selector/parser.js'].lineData[363]++;
  this.$1.next = this.$3;
  _$jscoverage['/selector/parser.js'].lineData[364]++;
  return this.$3;
}], [30, [20]], [30, [21]], [30, [22]], [30, [24], function() {
  _$jscoverage['/selector/parser.js'].functionData[38]++;
  _$jscoverage['/selector/parser.js'].lineData[370]++;
  return ' ';
}], [31, [14], function() {
  _$jscoverage['/selector/parser.js'].functionData[39]++;
  _$jscoverage['/selector/parser.js'].lineData[373]++;
  return {
  t: 'tag', 
  value: this.$1};
}], [31, [23], function() {
  _$jscoverage['/selector/parser.js'].functionData[40]++;
  _$jscoverage['/selector/parser.js'].lineData[379]++;
  return {
  t: 'tag', 
  value: this.$1};
}], [32, [16], function() {
  _$jscoverage['/selector/parser.js'].functionData[41]++;
  _$jscoverage['/selector/parser.js'].lineData[385]++;
  return {
  t: 'id', 
  value: this.$1};
}], [33, [17], function() {
  _$jscoverage['/selector/parser.js'].functionData[42]++;
  _$jscoverage['/selector/parser.js'].lineData[391]++;
  return {
  t: 'cls', 
  value: this.$1};
}], [34, [6]], [34, [7]], [34, [8]], [34, [9]], [34, [4]], [34, [5]], [35, [2, 14, 3], function() {
  _$jscoverage['/selector/parser.js'].functionData[43]++;
  _$jscoverage['/selector/parser.js'].lineData[403]++;
  return {
  t: 'attrib', 
  value: {
  ident: this.$2}};
}], [36, [14]], [36, [15]], [35, [2, 14, 34, 36, 3], function() {
  _$jscoverage['/selector/parser.js'].functionData[44]++;
  _$jscoverage['/selector/parser.js'].lineData[413]++;
  return {
  t: 'attrib', 
  value: {
  ident: this.$2, 
  match: this.$3, 
  value: this.$4}};
}], [37, [19, 10, 11, 12], function() {
  _$jscoverage['/selector/parser.js'].functionData[45]++;
  _$jscoverage['/selector/parser.js'].lineData[423]++;
  return {
  t: 'pseudo', 
  value: {
  fn: this.$2.toLowerCase(), 
  param: this.$3}};
}], [37, [19, 14], function() {
  _$jscoverage['/selector/parser.js'].functionData[46]++;
  _$jscoverage['/selector/parser.js'].lineData[432]++;
  return {
  t: 'pseudo', 
  value: {
  ident: this.$2.toLowerCase()}};
}], [38, [13, 39, 12], function() {
  _$jscoverage['/selector/parser.js'].functionData[47]++;
  _$jscoverage['/selector/parser.js'].lineData[440]++;
  return {
  t: 'pseudo', 
  value: {
  fn: 'not', 
  param: this.$2}};
}], [39, [31]], [39, [32]], [39, [33]], [39, [35]], [39, [37]], [40, [32]], [40, [33]], [40, [35]], [40, [37]], [40, [38]], [41, [40], function() {
  _$jscoverage['/selector/parser.js'].functionData[48]++;
  _$jscoverage['/selector/parser.js'].lineData[459]++;
  return [this.$1];
}], [41, [41, 40], function() {
  _$jscoverage['/selector/parser.js'].functionData[49]++;
  _$jscoverage['/selector/parser.js'].lineData[462]++;
  this.$1.push(this.$2);
}], [29, [31]], [29, [41], function() {
  _$jscoverage['/selector/parser.js'].functionData[50]++;
  _$jscoverage['/selector/parser.js'].lineData[466]++;
  return {
  suffix: this.$1};
}], [29, [31, 41], function() {
  _$jscoverage['/selector/parser.js'].functionData[51]++;
  _$jscoverage['/selector/parser.js'].lineData[471]++;
  return {
  t: 'tag', 
  value: this.$1.value, 
  suffix: this.$2};
}]];
  _$jscoverage['/selector/parser.js'].lineData[478]++;
  parser.table = {
  'gotos': {
  '0': {
  '27': 8, 
  '28': 9, 
  '29': 10, 
  '31': 11, 
  '32': 12, 
  '33': 13, 
  '35': 14, 
  '37': 15, 
  '38': 16, 
  '40': 17, 
  '41': 18}, 
  '2': {
  '31': 20, 
  '32': 21, 
  '33': 22, 
  '35': 23, 
  '37': 24, 
  '39': 25}, 
  '9': {
  '30': 33}, 
  '11': {
  '32': 12, 
  '33': 13, 
  '35': 14, 
  '37': 15, 
  '38': 16, 
  '40': 17, 
  '41': 34}, 
  '18': {
  '32': 12, 
  '33': 13, 
  '35': 14, 
  '37': 15, 
  '38': 16, 
  '40': 35}, 
  '19': {
  '34': 43}, 
  '28': {
  '28': 46, 
  '29': 10, 
  '31': 11, 
  '32': 12, 
  '33': 13, 
  '35': 14, 
  '37': 15, 
  '38': 16, 
  '40': 17, 
  '41': 18}, 
  '33': {
  '29': 47, 
  '31': 11, 
  '32': 12, 
  '33': 13, 
  '35': 14, 
  '37': 15, 
  '38': 16, 
  '40': 17, 
  '41': 18}, 
  '34': {
  '32': 12, 
  '33': 13, 
  '35': 14, 
  '37': 15, 
  '38': 16, 
  '40': 35}, 
  '43': {
  '36': 50}, 
  '46': {
  '30': 33}}, 
  'action': {
  '0': {
  '2': [1, 0, 1], 
  '13': [1, 0, 2], 
  '14': [1, 0, 3], 
  '16': [1, 0, 4], 
  '17': [1, 0, 5], 
  '19': [1, 0, 6], 
  '23': [1, 0, 7]}, 
  '1': {
  '14': [1, 0, 19]}, 
  '2': {
  '2': [1, 0, 1], 
  '14': [1, 0, 3], 
  '16': [1, 0, 4], 
  '17': [1, 0, 5], 
  '19': [1, 0, 6], 
  '23': [1, 0, 7]}, 
  '3': {
  '1': [2, 9, 0], 
  '2': [2, 9, 0], 
  '12': [2, 9, 0], 
  '13': [2, 9, 0], 
  '16': [2, 9, 0], 
  '17': [2, 9, 0], 
  '18': [2, 9, 0], 
  '19': [2, 9, 0], 
  '20': [2, 9, 0], 
  '21': [2, 9, 0], 
  '22': [2, 9, 0], 
  '24': [2, 9, 0]}, 
  '4': {
  '1': [2, 11, 0], 
  '2': [2, 11, 0], 
  '12': [2, 11, 0], 
  '13': [2, 11, 0], 
  '16': [2, 11, 0], 
  '17': [2, 11, 0], 
  '18': [2, 11, 0], 
  '19': [2, 11, 0], 
  '20': [2, 11, 0], 
  '21': [2, 11, 0], 
  '22': [2, 11, 0], 
  '24': [2, 11, 0]}, 
  '5': {
  '1': [2, 12, 0], 
  '2': [2, 12, 0], 
  '12': [2, 12, 0], 
  '13': [2, 12, 0], 
  '16': [2, 12, 0], 
  '17': [2, 12, 0], 
  '18': [2, 12, 0], 
  '19': [2, 12, 0], 
  '20': [2, 12, 0], 
  '21': [2, 12, 0], 
  '22': [2, 12, 0], 
  '24': [2, 12, 0]}, 
  '6': {
  '10': [1, 0, 26], 
  '14': [1, 0, 27]}, 
  '7': {
  '1': [2, 10, 0], 
  '2': [2, 10, 0], 
  '12': [2, 10, 0], 
  '13': [2, 10, 0], 
  '16': [2, 10, 0], 
  '17': [2, 10, 0], 
  '18': [2, 10, 0], 
  '19': [2, 10, 0], 
  '20': [2, 10, 0], 
  '21': [2, 10, 0], 
  '22': [2, 10, 0], 
  '24': [2, 10, 0]}, 
  '8': {
  '1': [0, 0, 0], 
  '18': [1, 0, 28]}, 
  '9': {
  '1': [2, 1, 0], 
  '18': [2, 1, 0], 
  '20': [1, 0, 29], 
  '21': [1, 0, 30], 
  '22': [1, 0, 31], 
  '24': [1, 0, 32]}, 
  '10': {
  '1': [2, 3, 0], 
  '18': [2, 3, 0], 
  '20': [2, 3, 0], 
  '21': [2, 3, 0], 
  '22': [2, 3, 0], 
  '24': [2, 3, 0]}, 
  '11': {
  '1': [2, 38, 0], 
  '2': [1, 0, 1], 
  '13': [1, 0, 2], 
  '16': [1, 0, 4], 
  '17': [1, 0, 5], 
  '18': [2, 38, 0], 
  '19': [1, 0, 6], 
  '20': [2, 38, 0], 
  '21': [2, 38, 0], 
  '22': [2, 38, 0], 
  '24': [2, 38, 0]}, 
  '12': {
  '1': [2, 31, 0], 
  '2': [2, 31, 0], 
  '13': [2, 31, 0], 
  '16': [2, 31, 0], 
  '17': [2, 31, 0], 
  '18': [2, 31, 0], 
  '19': [2, 31, 0], 
  '20': [2, 31, 0], 
  '21': [2, 31, 0], 
  '22': [2, 31, 0], 
  '24': [2, 31, 0]}, 
  '13': {
  '1': [2, 32, 0], 
  '2': [2, 32, 0], 
  '13': [2, 32, 0], 
  '16': [2, 32, 0], 
  '17': [2, 32, 0], 
  '18': [2, 32, 0], 
  '19': [2, 32, 0], 
  '20': [2, 32, 0], 
  '21': [2, 32, 0], 
  '22': [2, 32, 0], 
  '24': [2, 32, 0]}, 
  '14': {
  '1': [2, 33, 0], 
  '2': [2, 33, 0], 
  '13': [2, 33, 0], 
  '16': [2, 33, 0], 
  '17': [2, 33, 0], 
  '18': [2, 33, 0], 
  '19': [2, 33, 0], 
  '20': [2, 33, 0], 
  '21': [2, 33, 0], 
  '22': [2, 33, 0], 
  '24': [2, 33, 0]}, 
  '15': {
  '1': [2, 34, 0], 
  '2': [2, 34, 0], 
  '13': [2, 34, 0], 
  '16': [2, 34, 0], 
  '17': [2, 34, 0], 
  '18': [2, 34, 0], 
  '19': [2, 34, 0], 
  '20': [2, 34, 0], 
  '21': [2, 34, 0], 
  '22': [2, 34, 0], 
  '24': [2, 34, 0]}, 
  '16': {
  '1': [2, 35, 0], 
  '2': [2, 35, 0], 
  '13': [2, 35, 0], 
  '16': [2, 35, 0], 
  '17': [2, 35, 0], 
  '18': [2, 35, 0], 
  '19': [2, 35, 0], 
  '20': [2, 35, 0], 
  '21': [2, 35, 0], 
  '22': [2, 35, 0], 
  '24': [2, 35, 0]}, 
  '17': {
  '1': [2, 36, 0], 
  '2': [2, 36, 0], 
  '13': [2, 36, 0], 
  '16': [2, 36, 0], 
  '17': [2, 36, 0], 
  '18': [2, 36, 0], 
  '19': [2, 36, 0], 
  '20': [2, 36, 0], 
  '21': [2, 36, 0], 
  '22': [2, 36, 0], 
  '24': [2, 36, 0]}, 
  '18': {
  '1': [2, 39, 0], 
  '2': [1, 0, 1], 
  '13': [1, 0, 2], 
  '16': [1, 0, 4], 
  '17': [1, 0, 5], 
  '18': [2, 39, 0], 
  '19': [1, 0, 6], 
  '20': [2, 39, 0], 
  '21': [2, 39, 0], 
  '22': [2, 39, 0], 
  '24': [2, 39, 0]}, 
  '19': {
  '3': [1, 0, 36], 
  '4': [1, 0, 37], 
  '5': [1, 0, 38], 
  '6': [1, 0, 39], 
  '7': [1, 0, 40], 
  '8': [1, 0, 41], 
  '9': [1, 0, 42]}, 
  '20': {
  '12': [2, 26, 0]}, 
  '21': {
  '12': [2, 27, 0]}, 
  '22': {
  '12': [2, 28, 0]}, 
  '23': {
  '12': [2, 29, 0]}, 
  '24': {
  '12': [2, 30, 0]}, 
  '25': {
  '12': [1, 0, 44]}, 
  '26': {
  '11': [1, 0, 45]}, 
  '27': {
  '1': [2, 24, 0], 
  '2': [2, 24, 0], 
  '12': [2, 24, 0], 
  '13': [2, 24, 0], 
  '16': [2, 24, 0], 
  '17': [2, 24, 0], 
  '18': [2, 24, 0], 
  '19': [2, 24, 0], 
  '20': [2, 24, 0], 
  '21': [2, 24, 0], 
  '22': [2, 24, 0], 
  '24': [2, 24, 0]}, 
  '28': {
  '2': [1, 0, 1], 
  '13': [1, 0, 2], 
  '14': [1, 0, 3], 
  '16': [1, 0, 4], 
  '17': [1, 0, 5], 
  '19': [1, 0, 6], 
  '23': [1, 0, 7]}, 
  '29': {
  '2': [2, 5, 0], 
  '13': [2, 5, 0], 
  '14': [2, 5, 0], 
  '16': [2, 5, 0], 
  '17': [2, 5, 0], 
  '19': [2, 5, 0], 
  '23': [2, 5, 0]}, 
  '30': {
  '2': [2, 6, 0], 
  '13': [2, 6, 0], 
  '14': [2, 6, 0], 
  '16': [2, 6, 0], 
  '17': [2, 6, 0], 
  '19': [2, 6, 0], 
  '23': [2, 6, 0]}, 
  '31': {
  '2': [2, 7, 0], 
  '13': [2, 7, 0], 
  '14': [2, 7, 0], 
  '16': [2, 7, 0], 
  '17': [2, 7, 0], 
  '19': [2, 7, 0], 
  '23': [2, 7, 0]}, 
  '32': {
  '2': [2, 8, 0], 
  '13': [2, 8, 0], 
  '14': [2, 8, 0], 
  '16': [2, 8, 0], 
  '17': [2, 8, 0], 
  '19': [2, 8, 0], 
  '23': [2, 8, 0]}, 
  '33': {
  '2': [1, 0, 1], 
  '13': [1, 0, 2], 
  '14': [1, 0, 3], 
  '16': [1, 0, 4], 
  '17': [1, 0, 5], 
  '19': [1, 0, 6], 
  '23': [1, 0, 7]}, 
  '34': {
  '1': [2, 40, 0], 
  '2': [1, 0, 1], 
  '13': [1, 0, 2], 
  '16': [1, 0, 4], 
  '17': [1, 0, 5], 
  '18': [2, 40, 0], 
  '19': [1, 0, 6], 
  '20': [2, 40, 0], 
  '21': [2, 40, 0], 
  '22': [2, 40, 0], 
  '24': [2, 40, 0]}, 
  '35': {
  '1': [2, 37, 0], 
  '2': [2, 37, 0], 
  '13': [2, 37, 0], 
  '16': [2, 37, 0], 
  '17': [2, 37, 0], 
  '18': [2, 37, 0], 
  '19': [2, 37, 0], 
  '20': [2, 37, 0], 
  '21': [2, 37, 0], 
  '22': [2, 37, 0], 
  '24': [2, 37, 0]}, 
  '36': {
  '1': [2, 19, 0], 
  '2': [2, 19, 0], 
  '12': [2, 19, 0], 
  '13': [2, 19, 0], 
  '16': [2, 19, 0], 
  '17': [2, 19, 0], 
  '18': [2, 19, 0], 
  '19': [2, 19, 0], 
  '20': [2, 19, 0], 
  '21': [2, 19, 0], 
  '22': [2, 19, 0], 
  '24': [2, 19, 0]}, 
  '37': {
  '14': [2, 17, 0], 
  '15': [2, 17, 0]}, 
  '38': {
  '14': [2, 18, 0], 
  '15': [2, 18, 0]}, 
  '39': {
  '14': [2, 13, 0], 
  '15': [2, 13, 0]}, 
  '40': {
  '14': [2, 14, 0], 
  '15': [2, 14, 0]}, 
  '41': {
  '14': [2, 15, 0], 
  '15': [2, 15, 0]}, 
  '42': {
  '14': [2, 16, 0], 
  '15': [2, 16, 0]}, 
  '43': {
  '14': [1, 0, 48], 
  '15': [1, 0, 49]}, 
  '44': {
  '1': [2, 25, 0], 
  '2': [2, 25, 0], 
  '13': [2, 25, 0], 
  '16': [2, 25, 0], 
  '17': [2, 25, 0], 
  '18': [2, 25, 0], 
  '19': [2, 25, 0], 
  '20': [2, 25, 0], 
  '21': [2, 25, 0], 
  '22': [2, 25, 0], 
  '24': [2, 25, 0]}, 
  '45': {
  '12': [1, 0, 51]}, 
  '46': {
  '1': [2, 2, 0], 
  '18': [2, 2, 0], 
  '20': [1, 0, 29], 
  '21': [1, 0, 30], 
  '22': [1, 0, 31], 
  '24': [1, 0, 32]}, 
  '47': {
  '1': [2, 4, 0], 
  '18': [2, 4, 0], 
  '20': [2, 4, 0], 
  '21': [2, 4, 0], 
  '22': [2, 4, 0], 
  '24': [2, 4, 0]}, 
  '48': {
  '3': [2, 20, 0]}, 
  '49': {
  '3': [2, 21, 0]}, 
  '50': {
  '3': [1, 0, 52]}, 
  '51': {
  '1': [2, 23, 0], 
  '2': [2, 23, 0], 
  '12': [2, 23, 0], 
  '13': [2, 23, 0], 
  '16': [2, 23, 0], 
  '17': [2, 23, 0], 
  '18': [2, 23, 0], 
  '19': [2, 23, 0], 
  '20': [2, 23, 0], 
  '21': [2, 23, 0], 
  '22': [2, 23, 0], 
  '24': [2, 23, 0]}, 
  '52': {
  '1': [2, 22, 0], 
  '2': [2, 22, 0], 
  '12': [2, 22, 0], 
  '13': [2, 22, 0], 
  '16': [2, 22, 0], 
  '17': [2, 22, 0], 
  '18': [2, 22, 0], 
  '19': [2, 22, 0], 
  '20': [2, 22, 0], 
  '21': [2, 22, 0], 
  '22': [2, 22, 0], 
  '24': [2, 22, 0]}}};
  _$jscoverage['/selector/parser.js'].lineData[1004]++;
  parser.parse = function parse(input) {
  _$jscoverage['/selector/parser.js'].functionData[52]++;
  _$jscoverage['/selector/parser.js'].lineData[1006]++;
  var self = this, lexer = self.lexer, state, symbol, action, table = self.table, gotos = table.gotos, tableAction = table.action, productions = self.productions, valueStack = [null], stack = [0];
  _$jscoverage['/selector/parser.js'].lineData[1018]++;
  lexer.resetInput(input);
  _$jscoverage['/selector/parser.js'].lineData[1020]++;
  while (1) {
    _$jscoverage['/selector/parser.js'].lineData[1022]++;
    state = stack[stack.length - 1];
    _$jscoverage['/selector/parser.js'].lineData[1024]++;
    if (visit24_1024_1(!symbol)) {
      _$jscoverage['/selector/parser.js'].lineData[1025]++;
      symbol = lexer.lex();
    }
    _$jscoverage['/selector/parser.js'].lineData[1028]++;
    if (visit25_1028_1(!symbol)) {
      _$jscoverage['/selector/parser.js'].lineData[1029]++;
      S.log("it is not a valid input: " + input, "error");
      _$jscoverage['/selector/parser.js'].lineData[1030]++;
      return false;
    }
    _$jscoverage['/selector/parser.js'].lineData[1034]++;
    action = visit26_1034_1(tableAction[state] && tableAction[state][symbol]);
    _$jscoverage['/selector/parser.js'].lineData[1036]++;
    if (visit27_1036_1(!action)) {
      _$jscoverage['/selector/parser.js'].lineData[1037]++;
      var expected = [], error;
      _$jscoverage['/selector/parser.js'].lineData[1039]++;
      if (visit28_1039_1(tableAction[state])) {
        _$jscoverage['/selector/parser.js'].lineData[1040]++;
        S.each(tableAction[state], function(_, symbol) {
  _$jscoverage['/selector/parser.js'].functionData[53]++;
  _$jscoverage['/selector/parser.js'].lineData[1041]++;
  expected.push(self.lexer.mapReverseSymbol(symbol));
});
      }
      _$jscoverage['/selector/parser.js'].lineData[1044]++;
      error = 'Syntax error at line ' + lexer.lineNumber + ':\n' + lexer.showDebugInfo() + '\n' + 'expect ' + expected.join(', ');
      _$jscoverage['/selector/parser.js'].lineData[1046]++;
      S.error(error);
      _$jscoverage['/selector/parser.js'].lineData[1047]++;
      return false;
    }
    _$jscoverage['/selector/parser.js'].lineData[1050]++;
    switch (action[GrammarConst.TYPE_INDEX]) {
      case GrammarConst.SHIFT_TYPE:
        _$jscoverage['/selector/parser.js'].lineData[1054]++;
        stack.push(symbol);
        _$jscoverage['/selector/parser.js'].lineData[1056]++;
        valueStack.push(lexer.text);
        _$jscoverage['/selector/parser.js'].lineData[1059]++;
        stack.push(action[GrammarConst.TO_INDEX]);
        _$jscoverage['/selector/parser.js'].lineData[1062]++;
        symbol = null;
        _$jscoverage['/selector/parser.js'].lineData[1064]++;
        break;
      case GrammarConst.REDUCE_TYPE:
        _$jscoverage['/selector/parser.js'].lineData[1068]++;
        var production = productions[action[GrammarConst.PRODUCTION_INDEX]], reducedSymbol = visit29_1069_1(production.symbol || production[0]), reducedAction = visit30_1070_1(production.action || production[2]), reducedRhs = visit31_1071_1(production.rhs || production[1]), len = reducedRhs.length, i = 0, ret, $$ = valueStack[valueStack.length - len];
        _$jscoverage['/selector/parser.js'].lineData[1077]++;
        ret = undefined;
        _$jscoverage['/selector/parser.js'].lineData[1079]++;
        self.$$ = $$;
        _$jscoverage['/selector/parser.js'].lineData[1081]++;
        for (; visit32_1081_1(i < len); i++) {
          _$jscoverage['/selector/parser.js'].lineData[1082]++;
          self["$" + (len - i)] = valueStack[valueStack.length - 1 - i];
        }
        _$jscoverage['/selector/parser.js'].lineData[1085]++;
        if (visit33_1085_1(reducedAction)) {
          _$jscoverage['/selector/parser.js'].lineData[1086]++;
          ret = reducedAction.call(self);
        }
        _$jscoverage['/selector/parser.js'].lineData[1089]++;
        if (visit34_1089_1(ret !== undefined)) {
          _$jscoverage['/selector/parser.js'].lineData[1090]++;
          $$ = ret;
        } else {
          _$jscoverage['/selector/parser.js'].lineData[1092]++;
          $$ = self.$$;
        }
        _$jscoverage['/selector/parser.js'].lineData[1095]++;
        if (visit35_1095_1(len)) {
          _$jscoverage['/selector/parser.js'].lineData[1096]++;
          stack = stack.slice(0, -1 * len * 2);
          _$jscoverage['/selector/parser.js'].lineData[1097]++;
          valueStack = valueStack.slice(0, -1 * len);
        }
        _$jscoverage['/selector/parser.js'].lineData[1100]++;
        stack.push(reducedSymbol);
        _$jscoverage['/selector/parser.js'].lineData[1102]++;
        valueStack.push($$);
        _$jscoverage['/selector/parser.js'].lineData[1104]++;
        var newState = gotos[stack[stack.length - 2]][stack[stack.length - 1]];
        _$jscoverage['/selector/parser.js'].lineData[1106]++;
        stack.push(newState);
        _$jscoverage['/selector/parser.js'].lineData[1108]++;
        break;
      case GrammarConst.ACCEPT_TYPE:
        _$jscoverage['/selector/parser.js'].lineData[1112]++;
        return $$;
    }
  }
  _$jscoverage['/selector/parser.js'].lineData[1117]++;
  return undefined;
};
  _$jscoverage['/selector/parser.js'].lineData[1120]++;
  return parser;
});
