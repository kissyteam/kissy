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
if (! _$jscoverage['/dialog.js']) {
  _$jscoverage['/dialog.js'] = {};
  _$jscoverage['/dialog.js'].lineData = [];
  _$jscoverage['/dialog.js'].lineData[6] = 0;
  _$jscoverage['/dialog.js'].lineData[7] = 0;
  _$jscoverage['/dialog.js'].lineData[28] = 0;
  _$jscoverage['/dialog.js'].lineData[29] = 0;
  _$jscoverage['/dialog.js'].lineData[30] = 0;
  _$jscoverage['/dialog.js'].lineData[31] = 0;
  _$jscoverage['/dialog.js'].lineData[32] = 0;
  _$jscoverage['/dialog.js'].lineData[33] = 0;
  _$jscoverage['/dialog.js'].lineData[35] = 0;
  _$jscoverage['/dialog.js'].lineData[36] = 0;
  _$jscoverage['/dialog.js'].lineData[38] = 0;
  _$jscoverage['/dialog.js'].lineData[40] = 0;
  _$jscoverage['/dialog.js'].lineData[43] = 0;
  _$jscoverage['/dialog.js'].lineData[44] = 0;
  _$jscoverage['/dialog.js'].lineData[45] = 0;
  _$jscoverage['/dialog.js'].lineData[46] = 0;
  _$jscoverage['/dialog.js'].lineData[47] = 0;
  _$jscoverage['/dialog.js'].lineData[48] = 0;
  _$jscoverage['/dialog.js'].lineData[50] = 0;
  _$jscoverage['/dialog.js'].lineData[51] = 0;
  _$jscoverage['/dialog.js'].lineData[54] = 0;
  _$jscoverage['/dialog.js'].lineData[56] = 0;
  _$jscoverage['/dialog.js'].lineData[57] = 0;
  _$jscoverage['/dialog.js'].lineData[59] = 0;
  _$jscoverage['/dialog.js'].lineData[71] = 0;
  _$jscoverage['/dialog.js'].lineData[76] = 0;
  _$jscoverage['/dialog.js'].lineData[77] = 0;
  _$jscoverage['/dialog.js'].lineData[78] = 0;
  _$jscoverage['/dialog.js'].lineData[82] = 0;
  _$jscoverage['/dialog.js'].lineData[83] = 0;
  _$jscoverage['/dialog.js'].lineData[84] = 0;
  _$jscoverage['/dialog.js'].lineData[85] = 0;
  _$jscoverage['/dialog.js'].lineData[86] = 0;
  _$jscoverage['/dialog.js'].lineData[87] = 0;
  _$jscoverage['/dialog.js'].lineData[95] = 0;
  _$jscoverage['/dialog.js'].lineData[96] = 0;
  _$jscoverage['/dialog.js'].lineData[97] = 0;
  _$jscoverage['/dialog.js'].lineData[98] = 0;
  _$jscoverage['/dialog.js'].lineData[99] = 0;
  _$jscoverage['/dialog.js'].lineData[100] = 0;
  _$jscoverage['/dialog.js'].lineData[101] = 0;
  _$jscoverage['/dialog.js'].lineData[102] = 0;
  _$jscoverage['/dialog.js'].lineData[104] = 0;
  _$jscoverage['/dialog.js'].lineData[105] = 0;
  _$jscoverage['/dialog.js'].lineData[106] = 0;
  _$jscoverage['/dialog.js'].lineData[108] = 0;
  _$jscoverage['/dialog.js'].lineData[110] = 0;
  _$jscoverage['/dialog.js'].lineData[113] = 0;
  _$jscoverage['/dialog.js'].lineData[114] = 0;
  _$jscoverage['/dialog.js'].lineData[115] = 0;
  _$jscoverage['/dialog.js'].lineData[117] = 0;
  _$jscoverage['/dialog.js'].lineData[119] = 0;
  _$jscoverage['/dialog.js'].lineData[122] = 0;
  _$jscoverage['/dialog.js'].lineData[123] = 0;
  _$jscoverage['/dialog.js'].lineData[124] = 0;
  _$jscoverage['/dialog.js'].lineData[127] = 0;
  _$jscoverage['/dialog.js'].lineData[135] = 0;
  _$jscoverage['/dialog.js'].lineData[137] = 0;
  _$jscoverage['/dialog.js'].lineData[138] = 0;
  _$jscoverage['/dialog.js'].lineData[139] = 0;
  _$jscoverage['/dialog.js'].lineData[140] = 0;
  _$jscoverage['/dialog.js'].lineData[142] = 0;
  _$jscoverage['/dialog.js'].lineData[143] = 0;
  _$jscoverage['/dialog.js'].lineData[145] = 0;
  _$jscoverage['/dialog.js'].lineData[149] = 0;
  _$jscoverage['/dialog.js'].lineData[152] = 0;
  _$jscoverage['/dialog.js'].lineData[153] = 0;
  _$jscoverage['/dialog.js'].lineData[154] = 0;
  _$jscoverage['/dialog.js'].lineData[158] = 0;
  _$jscoverage['/dialog.js'].lineData[159] = 0;
  _$jscoverage['/dialog.js'].lineData[162] = 0;
  _$jscoverage['/dialog.js'].lineData[163] = 0;
  _$jscoverage['/dialog.js'].lineData[164] = 0;
  _$jscoverage['/dialog.js'].lineData[167] = 0;
  _$jscoverage['/dialog.js'].lineData[168] = 0;
  _$jscoverage['/dialog.js'].lineData[170] = 0;
  _$jscoverage['/dialog.js'].lineData[171] = 0;
  _$jscoverage['/dialog.js'].lineData[172] = 0;
  _$jscoverage['/dialog.js'].lineData[175] = 0;
  _$jscoverage['/dialog.js'].lineData[177] = 0;
  _$jscoverage['/dialog.js'].lineData[178] = 0;
  _$jscoverage['/dialog.js'].lineData[179] = 0;
  _$jscoverage['/dialog.js'].lineData[182] = 0;
  _$jscoverage['/dialog.js'].lineData[185] = 0;
  _$jscoverage['/dialog.js'].lineData[186] = 0;
  _$jscoverage['/dialog.js'].lineData[187] = 0;
  _$jscoverage['/dialog.js'].lineData[190] = 0;
  _$jscoverage['/dialog.js'].lineData[193] = 0;
  _$jscoverage['/dialog.js'].lineData[195] = 0;
  _$jscoverage['/dialog.js'].lineData[202] = 0;
  _$jscoverage['/dialog.js'].lineData[206] = 0;
  _$jscoverage['/dialog.js'].lineData[207] = 0;
  _$jscoverage['/dialog.js'].lineData[208] = 0;
  _$jscoverage['/dialog.js'].lineData[210] = 0;
  _$jscoverage['/dialog.js'].lineData[211] = 0;
  _$jscoverage['/dialog.js'].lineData[213] = 0;
  _$jscoverage['/dialog.js'].lineData[214] = 0;
  _$jscoverage['/dialog.js'].lineData[215] = 0;
  _$jscoverage['/dialog.js'].lineData[217] = 0;
  _$jscoverage['/dialog.js'].lineData[220] = 0;
  _$jscoverage['/dialog.js'].lineData[221] = 0;
  _$jscoverage['/dialog.js'].lineData[225] = 0;
  _$jscoverage['/dialog.js'].lineData[230] = 0;
  _$jscoverage['/dialog.js'].lineData[236] = 0;
  _$jscoverage['/dialog.js'].lineData[237] = 0;
  _$jscoverage['/dialog.js'].lineData[238] = 0;
  _$jscoverage['/dialog.js'].lineData[242] = 0;
  _$jscoverage['/dialog.js'].lineData[243] = 0;
  _$jscoverage['/dialog.js'].lineData[245] = 0;
  _$jscoverage['/dialog.js'].lineData[247] = 0;
  _$jscoverage['/dialog.js'].lineData[250] = 0;
  _$jscoverage['/dialog.js'].lineData[263] = 0;
  _$jscoverage['/dialog.js'].lineData[264] = 0;
  _$jscoverage['/dialog.js'].lineData[265] = 0;
  _$jscoverage['/dialog.js'].lineData[266] = 0;
  _$jscoverage['/dialog.js'].lineData[267] = 0;
  _$jscoverage['/dialog.js'].lineData[268] = 0;
  _$jscoverage['/dialog.js'].lineData[270] = 0;
  _$jscoverage['/dialog.js'].lineData[271] = 0;
  _$jscoverage['/dialog.js'].lineData[273] = 0;
  _$jscoverage['/dialog.js'].lineData[274] = 0;
  _$jscoverage['/dialog.js'].lineData[276] = 0;
  _$jscoverage['/dialog.js'].lineData[279] = 0;
  _$jscoverage['/dialog.js'].lineData[280] = 0;
  _$jscoverage['/dialog.js'].lineData[284] = 0;
  _$jscoverage['/dialog.js'].lineData[287] = 0;
  _$jscoverage['/dialog.js'].lineData[291] = 0;
  _$jscoverage['/dialog.js'].lineData[300] = 0;
  _$jscoverage['/dialog.js'].lineData[301] = 0;
  _$jscoverage['/dialog.js'].lineData[303] = 0;
  _$jscoverage['/dialog.js'].lineData[304] = 0;
  _$jscoverage['/dialog.js'].lineData[306] = 0;
  _$jscoverage['/dialog.js'].lineData[307] = 0;
  _$jscoverage['/dialog.js'].lineData[309] = 0;
  _$jscoverage['/dialog.js'].lineData[310] = 0;
  _$jscoverage['/dialog.js'].lineData[313] = 0;
  _$jscoverage['/dialog.js'].lineData[320] = 0;
  _$jscoverage['/dialog.js'].lineData[321] = 0;
  _$jscoverage['/dialog.js'].lineData[322] = 0;
  _$jscoverage['/dialog.js'].lineData[323] = 0;
  _$jscoverage['/dialog.js'].lineData[330] = 0;
  _$jscoverage['/dialog.js'].lineData[340] = 0;
  _$jscoverage['/dialog.js'].lineData[345] = 0;
  _$jscoverage['/dialog.js'].lineData[346] = 0;
  _$jscoverage['/dialog.js'].lineData[356] = 0;
  _$jscoverage['/dialog.js'].lineData[357] = 0;
  _$jscoverage['/dialog.js'].lineData[358] = 0;
  _$jscoverage['/dialog.js'].lineData[359] = 0;
  _$jscoverage['/dialog.js'].lineData[360] = 0;
  _$jscoverage['/dialog.js'].lineData[361] = 0;
  _$jscoverage['/dialog.js'].lineData[364] = 0;
  _$jscoverage['/dialog.js'].lineData[365] = 0;
  _$jscoverage['/dialog.js'].lineData[368] = 0;
  _$jscoverage['/dialog.js'].lineData[372] = 0;
  _$jscoverage['/dialog.js'].lineData[374] = 0;
  _$jscoverage['/dialog.js'].lineData[375] = 0;
  _$jscoverage['/dialog.js'].lineData[377] = 0;
  _$jscoverage['/dialog.js'].lineData[380] = 0;
  _$jscoverage['/dialog.js'].lineData[381] = 0;
  _$jscoverage['/dialog.js'].lineData[382] = 0;
  _$jscoverage['/dialog.js'].lineData[383] = 0;
  _$jscoverage['/dialog.js'].lineData[386] = 0;
  _$jscoverage['/dialog.js'].lineData[387] = 0;
  _$jscoverage['/dialog.js'].lineData[389] = 0;
  _$jscoverage['/dialog.js'].lineData[390] = 0;
  _$jscoverage['/dialog.js'].lineData[392] = 0;
  _$jscoverage['/dialog.js'].lineData[393] = 0;
  _$jscoverage['/dialog.js'].lineData[399] = 0;
  _$jscoverage['/dialog.js'].lineData[403] = 0;
  _$jscoverage['/dialog.js'].lineData[404] = 0;
  _$jscoverage['/dialog.js'].lineData[405] = 0;
  _$jscoverage['/dialog.js'].lineData[406] = 0;
  _$jscoverage['/dialog.js'].lineData[408] = 0;
  _$jscoverage['/dialog.js'].lineData[409] = 0;
  _$jscoverage['/dialog.js'].lineData[411] = 0;
  _$jscoverage['/dialog.js'].lineData[413] = 0;
  _$jscoverage['/dialog.js'].lineData[414] = 0;
  _$jscoverage['/dialog.js'].lineData[416] = 0;
  _$jscoverage['/dialog.js'].lineData[418] = 0;
  _$jscoverage['/dialog.js'].lineData[419] = 0;
  _$jscoverage['/dialog.js'].lineData[421] = 0;
  _$jscoverage['/dialog.js'].lineData[422] = 0;
  _$jscoverage['/dialog.js'].lineData[423] = 0;
  _$jscoverage['/dialog.js'].lineData[424] = 0;
  _$jscoverage['/dialog.js'].lineData[426] = 0;
  _$jscoverage['/dialog.js'].lineData[427] = 0;
  _$jscoverage['/dialog.js'].lineData[428] = 0;
  _$jscoverage['/dialog.js'].lineData[429] = 0;
  _$jscoverage['/dialog.js'].lineData[430] = 0;
  _$jscoverage['/dialog.js'].lineData[432] = 0;
  _$jscoverage['/dialog.js'].lineData[433] = 0;
  _$jscoverage['/dialog.js'].lineData[434] = 0;
  _$jscoverage['/dialog.js'].lineData[436] = 0;
  _$jscoverage['/dialog.js'].lineData[437] = 0;
  _$jscoverage['/dialog.js'].lineData[439] = 0;
  _$jscoverage['/dialog.js'].lineData[440] = 0;
  _$jscoverage['/dialog.js'].lineData[441] = 0;
  _$jscoverage['/dialog.js'].lineData[442] = 0;
  _$jscoverage['/dialog.js'].lineData[443] = 0;
  _$jscoverage['/dialog.js'].lineData[444] = 0;
  _$jscoverage['/dialog.js'].lineData[445] = 0;
  _$jscoverage['/dialog.js'].lineData[446] = 0;
  _$jscoverage['/dialog.js'].lineData[447] = 0;
  _$jscoverage['/dialog.js'].lineData[449] = 0;
  _$jscoverage['/dialog.js'].lineData[450] = 0;
  _$jscoverage['/dialog.js'].lineData[451] = 0;
  _$jscoverage['/dialog.js'].lineData[453] = 0;
  _$jscoverage['/dialog.js'].lineData[454] = 0;
  _$jscoverage['/dialog.js'].lineData[456] = 0;
  _$jscoverage['/dialog.js'].lineData[457] = 0;
  _$jscoverage['/dialog.js'].lineData[458] = 0;
  _$jscoverage['/dialog.js'].lineData[459] = 0;
  _$jscoverage['/dialog.js'].lineData[462] = 0;
  _$jscoverage['/dialog.js'].lineData[463] = 0;
  _$jscoverage['/dialog.js'].lineData[464] = 0;
  _$jscoverage['/dialog.js'].lineData[465] = 0;
  _$jscoverage['/dialog.js'].lineData[468] = 0;
  _$jscoverage['/dialog.js'].lineData[469] = 0;
  _$jscoverage['/dialog.js'].lineData[470] = 0;
  _$jscoverage['/dialog.js'].lineData[471] = 0;
  _$jscoverage['/dialog.js'].lineData[472] = 0;
  _$jscoverage['/dialog.js'].lineData[474] = 0;
  _$jscoverage['/dialog.js'].lineData[475] = 0;
  _$jscoverage['/dialog.js'].lineData[480] = 0;
}
if (! _$jscoverage['/dialog.js'].functionData) {
  _$jscoverage['/dialog.js'].functionData = [];
  _$jscoverage['/dialog.js'].functionData[0] = 0;
  _$jscoverage['/dialog.js'].functionData[1] = 0;
  _$jscoverage['/dialog.js'].functionData[2] = 0;
  _$jscoverage['/dialog.js'].functionData[3] = 0;
  _$jscoverage['/dialog.js'].functionData[4] = 0;
  _$jscoverage['/dialog.js'].functionData[5] = 0;
  _$jscoverage['/dialog.js'].functionData[6] = 0;
  _$jscoverage['/dialog.js'].functionData[7] = 0;
  _$jscoverage['/dialog.js'].functionData[8] = 0;
  _$jscoverage['/dialog.js'].functionData[9] = 0;
  _$jscoverage['/dialog.js'].functionData[10] = 0;
  _$jscoverage['/dialog.js'].functionData[11] = 0;
  _$jscoverage['/dialog.js'].functionData[12] = 0;
  _$jscoverage['/dialog.js'].functionData[13] = 0;
  _$jscoverage['/dialog.js'].functionData[14] = 0;
  _$jscoverage['/dialog.js'].functionData[15] = 0;
  _$jscoverage['/dialog.js'].functionData[16] = 0;
  _$jscoverage['/dialog.js'].functionData[17] = 0;
  _$jscoverage['/dialog.js'].functionData[18] = 0;
}
if (! _$jscoverage['/dialog.js'].branchData) {
  _$jscoverage['/dialog.js'].branchData = {};
  _$jscoverage['/dialog.js'].branchData['32'] = [];
  _$jscoverage['/dialog.js'].branchData['32'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['35'] = [];
  _$jscoverage['/dialog.js'].branchData['35'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['46'] = [];
  _$jscoverage['/dialog.js'].branchData['46'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['47'] = [];
  _$jscoverage['/dialog.js'].branchData['47'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['48'] = [];
  _$jscoverage['/dialog.js'].branchData['48'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['48'][2] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['106'] = [];
  _$jscoverage['/dialog.js'].branchData['106'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['106'][2] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['107'] = [];
  _$jscoverage['/dialog.js'].branchData['107'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['115'] = [];
  _$jscoverage['/dialog.js'].branchData['115'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['115'][2] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['116'] = [];
  _$jscoverage['/dialog.js'].branchData['116'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['138'] = [];
  _$jscoverage['/dialog.js'].branchData['138'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['140'] = [];
  _$jscoverage['/dialog.js'].branchData['140'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['154'] = [];
  _$jscoverage['/dialog.js'].branchData['154'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['154'][2] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['154'][3] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['155'] = [];
  _$jscoverage['/dialog.js'].branchData['155'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['158'] = [];
  _$jscoverage['/dialog.js'].branchData['158'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['162'] = [];
  _$jscoverage['/dialog.js'].branchData['162'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['167'] = [];
  _$jscoverage['/dialog.js'].branchData['167'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['177'] = [];
  _$jscoverage['/dialog.js'].branchData['177'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['177'][2] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['190'] = [];
  _$jscoverage['/dialog.js'].branchData['190'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['207'] = [];
  _$jscoverage['/dialog.js'].branchData['207'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['210'] = [];
  _$jscoverage['/dialog.js'].branchData['210'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['213'] = [];
  _$jscoverage['/dialog.js'].branchData['213'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['236'] = [];
  _$jscoverage['/dialog.js'].branchData['236'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['242'] = [];
  _$jscoverage['/dialog.js'].branchData['242'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['243'] = [];
  _$jscoverage['/dialog.js'].branchData['243'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['248'] = [];
  _$jscoverage['/dialog.js'].branchData['248'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['261'] = [];
  _$jscoverage['/dialog.js'].branchData['261'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['263'] = [];
  _$jscoverage['/dialog.js'].branchData['263'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['279'] = [];
  _$jscoverage['/dialog.js'].branchData['279'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['300'] = [];
  _$jscoverage['/dialog.js'].branchData['300'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['303'] = [];
  _$jscoverage['/dialog.js'].branchData['303'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['306'] = [];
  _$jscoverage['/dialog.js'].branchData['306'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['309'] = [];
  _$jscoverage['/dialog.js'].branchData['309'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['309'][2] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['320'] = [];
  _$jscoverage['/dialog.js'].branchData['320'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['356'] = [];
  _$jscoverage['/dialog.js'].branchData['356'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['357'] = [];
  _$jscoverage['/dialog.js'].branchData['357'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['358'] = [];
  _$jscoverage['/dialog.js'].branchData['358'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['358'][2] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['358'][3] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['360'] = [];
  _$jscoverage['/dialog.js'].branchData['360'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['360'][2] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['360'][3] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['364'] = [];
  _$jscoverage['/dialog.js'].branchData['364'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['364'][2] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['364'][3] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['372'] = [];
  _$jscoverage['/dialog.js'].branchData['372'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['374'] = [];
  _$jscoverage['/dialog.js'].branchData['374'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['386'] = [];
  _$jscoverage['/dialog.js'].branchData['386'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['389'] = [];
  _$jscoverage['/dialog.js'].branchData['389'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['392'] = [];
  _$jscoverage['/dialog.js'].branchData['392'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['404'] = [];
  _$jscoverage['/dialog.js'].branchData['404'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['404'][2] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['408'] = [];
  _$jscoverage['/dialog.js'].branchData['408'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['413'] = [];
  _$jscoverage['/dialog.js'].branchData['413'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['418'] = [];
  _$jscoverage['/dialog.js'].branchData['418'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['419'] = [];
  _$jscoverage['/dialog.js'].branchData['419'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['428'] = [];
  _$jscoverage['/dialog.js'].branchData['428'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['429'] = [];
  _$jscoverage['/dialog.js'].branchData['429'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['433'] = [];
  _$jscoverage['/dialog.js'].branchData['433'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['436'] = [];
  _$jscoverage['/dialog.js'].branchData['436'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['449'] = [];
  _$jscoverage['/dialog.js'].branchData['449'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['450'] = [];
  _$jscoverage['/dialog.js'].branchData['450'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['451'] = [];
  _$jscoverage['/dialog.js'].branchData['451'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['471'] = [];
  _$jscoverage['/dialog.js'].branchData['471'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['474'] = [];
  _$jscoverage['/dialog.js'].branchData['474'][1] = new BranchData();
}
_$jscoverage['/dialog.js'].branchData['474'][1].init(212, 13, 'self.imgAlign');
function visit71_474_1(result) {
  _$jscoverage['/dialog.js'].branchData['474'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['471'][1].init(112, 18, 'self.loadingCancel');
function visit70_471_1(result) {
  _$jscoverage['/dialog.js'].branchData['471'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['451'][1].init(143, 31, 'link.attr("target") == "_blank"');
function visit69_451_1(result) {
  _$jscoverage['/dialog.js'].branchData['451'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['450'][1].init(41, 48, 'link.attr("_ke_saved_href") || link.attr("href")');
function visit68_450_1(result) {
  _$jscoverage['/dialog.js'].branchData['450'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['449'][1].init(2246, 4, 'link');
function visit67_449_1(result) {
  _$jscoverage['/dialog.js'].branchData['449'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['436'][1].init(514, 47, 'self.tab.get(\'bar\').get(\'children\').length == 2');
function visit66_436_1(result) {
  _$jscoverage['/dialog.js'].branchData['436'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['433'][1].init(391, 26, 'defaultMargin == undefined');
function visit65_433_1(result) {
  _$jscoverage['/dialog.js'].branchData['433'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['429'][1].init(216, 9, 'inElement');
function visit64_429_1(result) {
  _$jscoverage['/dialog.js'].branchData['429'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['428'][1].init(139, 54, 'editorSelection && editorSelection.getCommonAncestor()');
function visit63_428_1(result) {
  _$jscoverage['/dialog.js'].branchData['428'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['419'][1].init(640, 62, 'parseInt(selectedEl.style("margin")) || 0');
function visit62_419_1(result) {
  _$jscoverage['/dialog.js'].branchData['419'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['418'][1].init(572, 35, 'selectedEl.style("float") || "none"');
function visit61_418_1(result) {
  _$jscoverage['/dialog.js'].branchData['418'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['413'][1].init(381, 1, 'w');
function visit60_413_1(result) {
  _$jscoverage['/dialog.js'].branchData['413'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['408'][1].init(211, 1, 'h');
function visit59_408_1(result) {
  _$jscoverage['/dialog.js'].branchData['408'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['404'][2].init(212, 33, 'self.imageCfg[\'remote\'] !== false');
function visit58_404_2(result) {
  _$jscoverage['/dialog.js'].branchData['404'][2].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['404'][1].init(198, 47, 'selectedEl && self.imageCfg[\'remote\'] !== false');
function visit57_404_1(result) {
  _$jscoverage['/dialog.js'].branchData['404'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['392'][1].init(1922, 5, '!skip');
function visit56_392_1(result) {
  _$jscoverage['/dialog.js'].branchData['392'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['389'][1].init(1784, 15, 'self.selectedEl');
function visit55_389_1(result) {
  _$jscoverage['/dialog.js'].branchData['389'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['386'][1].init(1686, 2, 'bs');
function visit54_386_1(result) {
  _$jscoverage['/dialog.js'].branchData['386'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['374'][1].init(67, 16, '!self.selectedEl');
function visit53_374_1(result) {
  _$jscoverage['/dialog.js'].branchData['374'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['372'][1].init(1123, 16, '!skip && linkVal');
function visit52_372_1(result) {
  _$jscoverage['/dialog.js'].branchData['372'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['364'][3].init(291, 22, 'next.nodeName() == \'a\'');
function visit51_364_3(result) {
  _$jscoverage['/dialog.js'].branchData['364'][3].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['364'][2].init(291, 55, '(next.nodeName() == \'a\') && !(next[0].childNodes.length)');
function visit50_364_2(result) {
  _$jscoverage['/dialog.js'].branchData['364'][2].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['364'][1].init(268, 78, '(next = img.next()) && (next.nodeName() == \'a\') && !(next[0].childNodes.length)');
function visit49_364_1(result) {
  _$jscoverage['/dialog.js'].branchData['364'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['360'][3].init(106, 22, 'prev.nodeName() == \'a\'');
function visit48_360_3(result) {
  _$jscoverage['/dialog.js'].branchData['360'][3].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['360'][2].init(106, 55, '(prev.nodeName() == \'a\') && !(prev[0].childNodes.length)');
function visit47_360_2(result) {
  _$jscoverage['/dialog.js'].branchData['360'][2].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['360'][1].init(83, 78, '(prev = img.prev()) && (prev.nodeName() == \'a\') && !(prev[0].childNodes.length)');
function visit46_360_1(result) {
  _$jscoverage['/dialog.js'].branchData['360'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['358'][3].init(124, 20, 'linkTarget != target');
function visit45_358_3(result) {
  _$jscoverage['/dialog.js'].branchData['358'][3].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['358'][2].init(92, 28, 'linkVal != link.attr(\'href\')');
function visit44_358_2(result) {
  _$jscoverage['/dialog.js'].branchData['358'][2].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['358'][1].init(92, 52, 'linkVal != link.attr(\'href\') || linkTarget != target');
function visit43_358_1(result) {
  _$jscoverage['/dialog.js'].branchData['358'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['357'][1].init(35, 30, 'link.attr(\'target\') || "_self"');
function visit42_357_1(result) {
  _$jscoverage['/dialog.js'].branchData['357'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['356'][1].init(418, 4, 'link');
function visit41_356_1(result) {
  _$jscoverage['/dialog.js'].branchData['356'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['320'][1].init(1018, 15, 'self.selectedEl');
function visit40_320_1(result) {
  _$jscoverage['/dialog.js'].branchData['320'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['309'][2].init(688, 11, 'margin != 0');
function visit39_309_2(result) {
  _$jscoverage['/dialog.js'].branchData['309'][2].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['309'][1].init(670, 29, '!isNaN(margin) && margin != 0');
function visit38_309_1(result) {
  _$jscoverage['/dialog.js'].branchData['309'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['306'][1].init(569, 15, 'align != \'none\'');
function visit37_306_1(result) {
  _$jscoverage['/dialog.js'].branchData['306'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['303'][1].init(476, 5, 'width');
function visit36_303_1(result) {
  _$jscoverage['/dialog.js'].branchData['303'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['300'][1].init(380, 6, 'height');
function visit35_300_1(result) {
  _$jscoverage['/dialog.js'].branchData['300'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['279'][1].init(1722, 33, 'self.imageCfg[\'remote\'] === false');
function visit34_279_1(result) {
  _$jscoverage['/dialog.js'].branchData['279'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['263'][1].init(958, 9, 'sizeLimit');
function visit33_263_1(result) {
  _$jscoverage['/dialog.js'].branchData['263'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['261'][1].init(454, 35, 'self.cfg[\'fileInput\'] || "Filedata"');
function visit32_261_1(result) {
  _$jscoverage['/dialog.js'].branchData['261'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['248'][1].init(93, 33, 'self.cfg && self.cfg[\'sizeLimit\']');
function visit31_248_1(result) {
  _$jscoverage['/dialog.js'].branchData['248'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['243'][1].init(22, 21, 'self.cfg[\'extraHTML\']');
function visit30_243_1(result) {
  _$jscoverage['/dialog.js'].branchData['243'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['242'][1].init(7934, 8, 'self.cfg');
function visit29_242_1(result) {
  _$jscoverage['/dialog.js'].branchData['242'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['236'][1].init(26, 35, '!verifyInputs(content.all("input"))');
function visit28_236_1(result) {
  _$jscoverage['/dialog.js'].branchData['236'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['213'][1].init(516, 10, 'data.error');
function visit27_213_1(result) {
  _$jscoverage['/dialog.js'].branchData['213'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['210'][1].init(381, 5, '!data');
function visit26_210_1(result) {
  _$jscoverage['/dialog.js'].branchData['210'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['207'][1].init(255, 17, 'status == "abort"');
function visit25_207_1(result) {
  _$jscoverage['/dialog.js'].branchData['207'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['190'][1].init(1192, 55, 'Editor.Utils.normParams(self.cfg[\'serverParams\']) || {}');
function visit24_190_1(result) {
  _$jscoverage['/dialog.js'].branchData['190'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['177'][2].init(750, 25, 'sizeLimit < (size / 1000)');
function visit23_177_2(result) {
  _$jscoverage['/dialog.js'].branchData['177'][2].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['177'][1].init(737, 38, 'sizeLimit && sizeLimit < (size / 1000)');
function visit22_177_1(result) {
  _$jscoverage['/dialog.js'].branchData['177'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['167'][1].init(324, 45, '!self.suffix_reg.test(self.imgLocalUrl.val())');
function visit21_167_1(result) {
  _$jscoverage['/dialog.js'].branchData['167'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['162'][1].init(161, 33, 'self.imgLocalUrl.val() == warning');
function visit20_162_1(result) {
  _$jscoverage['/dialog.js'].branchData['162'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['158'][1].init(28, 46, '!verifyInputs(commonSettingTable.all("input"))');
function visit19_158_1(result) {
  _$jscoverage['/dialog.js'].branchData['158'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['155'][1].init(57, 61, 'S.indexOf(self.tab.getSelectedTab(), self.tab.getTabs()) == 1');
function visit18_155_1(result) {
  _$jscoverage['/dialog.js'].branchData['155'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['154'][3].init(51, 33, 'self.imageCfg[\'remote\'] === false');
function visit17_154_3(result) {
  _$jscoverage['/dialog.js'].branchData['154'][3].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['154'][2].init(51, 119, 'self.imageCfg[\'remote\'] === false || S.indexOf(self.tab.getSelectedTab(), self.tab.getTabs()) == 1');
function visit16_154_2(result) {
  _$jscoverage['/dialog.js'].branchData['154'][2].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['154'][1].init(51, 153, '(self.imageCfg[\'remote\'] === false || S.indexOf(self.tab.getSelectedTab(), self.tab.getTabs()) == 1) && self.cfg');
function visit15_154_1(result) {
  _$jscoverage['/dialog.js'].branchData['154'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['140'][1].init(119, 5, '1 > 2');
function visit14_140_1(result) {
  _$jscoverage['/dialog.js'].branchData['140'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['138'][1].init(22, 13, 'file[\'files\']');
function visit13_138_1(result) {
  _$jscoverage['/dialog.js'].branchData['138'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['116'][1].init(49, 48, 'self.imgRatio[0].disabled || !self.imgRatioValue');
function visit12_116_1(result) {
  _$jscoverage['/dialog.js'].branchData['116'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['115'][2].init(88, 98, '!self.imgRatio[0].checked || self.imgRatio[0].disabled || !self.imgRatioValue');
function visit11_115_2(result) {
  _$jscoverage['/dialog.js'].branchData['115'][2].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['115'][1].init(82, 104, '!v || !self.imgRatio[0].checked || self.imgRatio[0].disabled || !self.imgRatioValue');
function visit10_115_1(result) {
  _$jscoverage['/dialog.js'].branchData['115'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['107'][1].init(49, 48, 'self.imgRatio[0].disabled || !self.imgRatioValue');
function visit9_107_1(result) {
  _$jscoverage['/dialog.js'].branchData['107'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['106'][2].init(89, 98, '!self.imgRatio[0].checked || self.imgRatio[0].disabled || !self.imgRatioValue');
function visit8_106_2(result) {
  _$jscoverage['/dialog.js'].branchData['106'][2].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['106'][1].init(83, 104, '!v || !self.imgRatio[0].checked || self.imgRatio[0].disabled || !self.imgRatioValue');
function visit7_106_1(result) {
  _$jscoverage['/dialog.js'].branchData['106'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['48'][2].init(173, 30, 'self.cfg && self.cfg["suffix"]');
function visit6_48_2(result) {
  _$jscoverage['/dialog.js'].branchData['48'][2].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['48'][1].init(173, 52, 'self.cfg && self.cfg["suffix"] || "png,jpg,jpeg,gif"');
function visit5_48_1(result) {
  _$jscoverage['/dialog.js'].branchData['48'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['47'][1].init(117, 31, 'self.imageCfg["upload"] || null');
function visit4_47_1(result) {
  _$jscoverage['/dialog.js'].branchData['47'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['46'][1].init(83, 12, 'config || {}');
function visit3_46_1(result) {
  _$jscoverage['/dialog.js'].branchData['46'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['35'][1].init(134, 41, 'dtd.$block[name] || dtd.$blockLimit[name]');
function visit2_35_1(result) {
  _$jscoverage['/dialog.js'].branchData['35'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['32'][1].init(58, 11, 'name == "a"');
function visit1_32_1(result) {
  _$jscoverage['/dialog.js'].branchData['32'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].lineData[6]++;
KISSY.add("editor/plugin/image/dialog", function(S, IO, Editor, Dialog4E, Tabs, MenuButton, bodyTpl) {
  _$jscoverage['/dialog.js'].functionData[0]++;
  _$jscoverage['/dialog.js'].lineData[7]++;
  var dtd = Editor.XHTML_DTD, UA = S.UA, Node = KISSY.NodeList, HTTP_TIP = "http://", AUTOMATIC_TIP = "\u81ea\u52a8", MARGIN_DEFAULT = 10, IMAGE_DIALOG_BODY_HTML = bodyTpl, IMAGE_DIALOG_FOOT_HTML = "<div style='padding:5px 20px 20px;'>" + "<a " + "href='javascript:void('\u786e\u5b9a')' " + "class='{prefixCls}img-insert {prefixCls}button ks-inline-block' " + "style='margin-right:30px;'>\u786e\u5b9a</a> " + "<a  " + "href='javascript:void('\u53d6\u6d88')' " + "class='{prefixCls}img-cancel {prefixCls}button ks-inline-block'>\u53d6\u6d88</a></div>", warning = "\u8bf7\u70b9\u51fb\u6d4f\u89c8\u4e0a\u4f20\u56fe\u7247", valInput = Editor.Utils.valInput;
  _$jscoverage['/dialog.js'].lineData[28]++;
  function findAWithImg(img) {
    _$jscoverage['/dialog.js'].functionData[1]++;
    _$jscoverage['/dialog.js'].lineData[29]++;
    var ret = img;
    _$jscoverage['/dialog.js'].lineData[30]++;
    while (ret) {
      _$jscoverage['/dialog.js'].lineData[31]++;
      var name = ret.nodeName();
      _$jscoverage['/dialog.js'].lineData[32]++;
      if (visit1_32_1(name == "a")) {
        _$jscoverage['/dialog.js'].lineData[33]++;
        return ret;
      }
      _$jscoverage['/dialog.js'].lineData[35]++;
      if (visit2_35_1(dtd.$block[name] || dtd.$blockLimit[name])) {
        _$jscoverage['/dialog.js'].lineData[36]++;
        return null;
      }
      _$jscoverage['/dialog.js'].lineData[38]++;
      ret = ret.parent();
    }
    _$jscoverage['/dialog.js'].lineData[40]++;
    return null;
  }
  _$jscoverage['/dialog.js'].lineData[43]++;
  function ImageDialog(editor, config) {
    _$jscoverage['/dialog.js'].functionData[2]++;
    _$jscoverage['/dialog.js'].lineData[44]++;
    var self = this;
    _$jscoverage['/dialog.js'].lineData[45]++;
    self.editor = editor;
    _$jscoverage['/dialog.js'].lineData[46]++;
    self.imageCfg = visit3_46_1(config || {});
    _$jscoverage['/dialog.js'].lineData[47]++;
    self.cfg = visit4_47_1(self.imageCfg["upload"] || null);
    _$jscoverage['/dialog.js'].lineData[48]++;
    self.suffix = visit5_48_1(visit6_48_2(self.cfg && self.cfg["suffix"]) || "png,jpg,jpeg,gif");
    _$jscoverage['/dialog.js'].lineData[50]++;
    self.suffix_reg = new RegExp(self.suffix.split(/,/).join("|") + "$", "i");
    _$jscoverage['/dialog.js'].lineData[51]++;
    self.suffix_warning = "\u53ea\u5141\u8bb8\u540e\u7f00\u540d\u4e3a" + self.suffix + "\u7684\u56fe\u7247";
  }
  _$jscoverage['/dialog.js'].lineData[54]++;
  S.augment(ImageDialog, {
  _prepare: function() {
  _$jscoverage['/dialog.js'].functionData[3]++;
  _$jscoverage['/dialog.js'].lineData[56]++;
  var self = this;
  _$jscoverage['/dialog.js'].lineData[57]++;
  var editor = self.editor, prefixCls = editor.get('prefixCls') + 'editor-';
  _$jscoverage['/dialog.js'].lineData[59]++;
  self.dialog = self.d = new Dialog4E({
  width: 500, 
  headerContent: "\u56fe\u7247", 
  bodyContent: S.substitute(IMAGE_DIALOG_BODY_HTML, {
  prefixCls: prefixCls}), 
  footerContent: S.substitute(IMAGE_DIALOG_FOOT_HTML, {
  prefixCls: prefixCls}), 
  mask: true}).render();
  _$jscoverage['/dialog.js'].lineData[71]++;
  var content = self.d.get("el"), cancel = content.one("." + prefixCls + "img-cancel"), ok = content.one("." + prefixCls + "img-insert"), verifyInputs = Editor.Utils.verifyInputs, commonSettingTable = content.one("." + prefixCls + "img-setting");
  _$jscoverage['/dialog.js'].lineData[76]++;
  self.uploadForm = content.one("." + prefixCls + "img-upload-form");
  _$jscoverage['/dialog.js'].lineData[77]++;
  self.imgLocalUrl = content.one("." + prefixCls + "img-local-url");
  _$jscoverage['/dialog.js'].lineData[78]++;
  self.tab = new Tabs({
  "srcNode": self.d.get("body").one('.' + prefixCls + 'img-tabs'), 
  prefixCls: prefixCls + 'img-'}).render();
  _$jscoverage['/dialog.js'].lineData[82]++;
  self.imgLocalUrl.val(warning);
  _$jscoverage['/dialog.js'].lineData[83]++;
  self.imgUrl = content.one("." + prefixCls + "img-url");
  _$jscoverage['/dialog.js'].lineData[84]++;
  self.imgHeight = content.one("." + prefixCls + "img-height");
  _$jscoverage['/dialog.js'].lineData[85]++;
  self.imgWidth = content.one("." + prefixCls + "img-width");
  _$jscoverage['/dialog.js'].lineData[86]++;
  self.imgRatio = content.one("." + prefixCls + "img-ratio");
  _$jscoverage['/dialog.js'].lineData[87]++;
  self.imgAlign = MenuButton.Select.decorate(content.one("." + prefixCls + "img-align"), {
  prefixCls: prefixCls + 'big-', 
  width: 80, 
  menuCfg: {
  prefixCls: prefixCls + '', 
  render: content}});
  _$jscoverage['/dialog.js'].lineData[95]++;
  self.imgMargin = content.one("." + prefixCls + "img-margin");
  _$jscoverage['/dialog.js'].lineData[96]++;
  self.imgLink = content.one("." + prefixCls + "img-link");
  _$jscoverage['/dialog.js'].lineData[97]++;
  self.imgLinkBlank = content.one("." + prefixCls + "img-link-blank");
  _$jscoverage['/dialog.js'].lineData[98]++;
  var placeholder = Editor.Utils.placeholder;
  _$jscoverage['/dialog.js'].lineData[99]++;
  placeholder(self.imgUrl, HTTP_TIP);
  _$jscoverage['/dialog.js'].lineData[100]++;
  placeholder(self.imgHeight, AUTOMATIC_TIP);
  _$jscoverage['/dialog.js'].lineData[101]++;
  placeholder(self.imgWidth, AUTOMATIC_TIP);
  _$jscoverage['/dialog.js'].lineData[102]++;
  placeholder(self.imgLink, "http://");
  _$jscoverage['/dialog.js'].lineData[104]++;
  self.imgHeight.on("keyup", function() {
  _$jscoverage['/dialog.js'].functionData[4]++;
  _$jscoverage['/dialog.js'].lineData[105]++;
  var v = parseInt(valInput(self.imgHeight));
  _$jscoverage['/dialog.js'].lineData[106]++;
  if (visit7_106_1(!v || visit8_106_2(!self.imgRatio[0].checked || visit9_107_1(self.imgRatio[0].disabled || !self.imgRatioValue)))) {
    _$jscoverage['/dialog.js'].lineData[108]++;
    return;
  }
  _$jscoverage['/dialog.js'].lineData[110]++;
  valInput(self.imgWidth, Math.floor(v * self.imgRatioValue));
});
  _$jscoverage['/dialog.js'].lineData[113]++;
  self.imgWidth.on("keyup", function() {
  _$jscoverage['/dialog.js'].functionData[5]++;
  _$jscoverage['/dialog.js'].lineData[114]++;
  var v = parseInt(valInput(self.imgWidth));
  _$jscoverage['/dialog.js'].lineData[115]++;
  if (visit10_115_1(!v || visit11_115_2(!self.imgRatio[0].checked || visit12_116_1(self.imgRatio[0].disabled || !self.imgRatioValue)))) {
    _$jscoverage['/dialog.js'].lineData[117]++;
    return;
  }
  _$jscoverage['/dialog.js'].lineData[119]++;
  valInput(self.imgHeight, Math.floor(v / self.imgRatioValue));
});
  _$jscoverage['/dialog.js'].lineData[122]++;
  cancel.on("click", function(ev) {
  _$jscoverage['/dialog.js'].functionData[6]++;
  _$jscoverage['/dialog.js'].lineData[123]++;
  self.d.hide();
  _$jscoverage['/dialog.js'].lineData[124]++;
  ev.halt();
});
  _$jscoverage['/dialog.js'].lineData[127]++;
  var loadingCancel = new Node("<a class='" + prefixCls + "button ks-inline-block' " + "style='position:absolute;" + "z-index:" + Editor.baseZIndex(Editor.ZIndexManager.LOADING_CANCEL) + ";" + "left:-9999px;" + "top:-9999px;" + "'>\u53d6\u6d88\u4e0a\u4f20</a>").appendTo(document.body, undefined);
  _$jscoverage['/dialog.js'].lineData[135]++;
  self.loadingCancel = loadingCancel;
  _$jscoverage['/dialog.js'].lineData[137]++;
  function getFileSize(file) {
    _$jscoverage['/dialog.js'].functionData[7]++;
    _$jscoverage['/dialog.js'].lineData[138]++;
    if (visit13_138_1(file['files'])) {
      _$jscoverage['/dialog.js'].lineData[139]++;
      return file['files'][0].size;
    } else {
      _$jscoverage['/dialog.js'].lineData[140]++;
      if (visit14_140_1(1 > 2)) {
        _$jscoverage['/dialog.js'].lineData[142]++;
        try {
          _$jscoverage['/dialog.js'].lineData[143]++;
          var fso = new ActiveXObject("Scripting.FileSystemObject"), file2 = fso['GetFile'](file.value);
          _$jscoverage['/dialog.js'].lineData[145]++;
          return file2.size;
        }        catch (e) {
}
      }
    }
    _$jscoverage['/dialog.js'].lineData[149]++;
    return 0;
  }
  _$jscoverage['/dialog.js'].lineData[152]++;
  ok.on("click", function(ev) {
  _$jscoverage['/dialog.js'].functionData[8]++;
  _$jscoverage['/dialog.js'].lineData[153]++;
  ev.halt();
  _$jscoverage['/dialog.js'].lineData[154]++;
  if (visit15_154_1((visit16_154_2(visit17_154_3(self.imageCfg['remote'] === false) || visit18_155_1(S.indexOf(self.tab.getSelectedTab(), self.tab.getTabs()) == 1))) && self.cfg)) {
    _$jscoverage['/dialog.js'].lineData[158]++;
    if (visit19_158_1(!verifyInputs(commonSettingTable.all("input")))) {
      _$jscoverage['/dialog.js'].lineData[159]++;
      return;
    }
    _$jscoverage['/dialog.js'].lineData[162]++;
    if (visit20_162_1(self.imgLocalUrl.val() == warning)) {
      _$jscoverage['/dialog.js'].lineData[163]++;
      alert("\u8bf7\u5148\u9009\u62e9\u6587\u4ef6!");
      _$jscoverage['/dialog.js'].lineData[164]++;
      return;
    }
    _$jscoverage['/dialog.js'].lineData[167]++;
    if (visit21_167_1(!self.suffix_reg.test(self.imgLocalUrl.val()))) {
      _$jscoverage['/dialog.js'].lineData[168]++;
      alert(self.suffix_warning);
      _$jscoverage['/dialog.js'].lineData[170]++;
      self.uploadForm[0].reset();
      _$jscoverage['/dialog.js'].lineData[171]++;
      self.imgLocalUrl.val(warning);
      _$jscoverage['/dialog.js'].lineData[172]++;
      return;
    }
    _$jscoverage['/dialog.js'].lineData[175]++;
    var size = (getFileSize(self.fileInput[0]));
    _$jscoverage['/dialog.js'].lineData[177]++;
    if (visit22_177_1(sizeLimit && visit23_177_2(sizeLimit < (size / 1000)))) {
      _$jscoverage['/dialog.js'].lineData[178]++;
      alert("\u4e0a\u4f20\u56fe\u7247\u6700\u5927\uff1a" + sizeLimit / 1000 + "M");
      _$jscoverage['/dialog.js'].lineData[179]++;
      return;
    }
    _$jscoverage['/dialog.js'].lineData[182]++;
    self.d.loading();
    _$jscoverage['/dialog.js'].lineData[185]++;
    loadingCancel.on("click", function(ev) {
  _$jscoverage['/dialog.js'].functionData[9]++;
  _$jscoverage['/dialog.js'].lineData[186]++;
  ev.halt();
  _$jscoverage['/dialog.js'].lineData[187]++;
  uploadIO.abort();
});
    _$jscoverage['/dialog.js'].lineData[190]++;
    var serverParams = visit24_190_1(Editor.Utils.normParams(self.cfg['serverParams']) || {});
    _$jscoverage['/dialog.js'].lineData[193]++;
    serverParams['document-domain'] = document.domain;
    _$jscoverage['/dialog.js'].lineData[195]++;
    var uploadIO = IO({
  data: serverParams, 
  url: self.cfg['serverUrl'], 
  form: self.uploadForm[0], 
  dataType: 'json', 
  type: 'post', 
  complete: function(data, status) {
  _$jscoverage['/dialog.js'].functionData[10]++;
  _$jscoverage['/dialog.js'].lineData[202]++;
  loadingCancel.css({
  left: -9999, 
  top: -9999});
  _$jscoverage['/dialog.js'].lineData[206]++;
  self.d.unloading();
  _$jscoverage['/dialog.js'].lineData[207]++;
  if (visit25_207_1(status == "abort")) {
    _$jscoverage['/dialog.js'].lineData[208]++;
    return;
  }
  _$jscoverage['/dialog.js'].lineData[210]++;
  if (visit26_210_1(!data)) {
    _$jscoverage['/dialog.js'].lineData[211]++;
    data = {
  error: "\u670d\u52a1\u5668\u51fa\u9519\uff0c\u8bf7\u91cd\u8bd5"};
  }
  _$jscoverage['/dialog.js'].lineData[213]++;
  if (visit27_213_1(data.error)) {
    _$jscoverage['/dialog.js'].lineData[214]++;
    alert(data.error);
    _$jscoverage['/dialog.js'].lineData[215]++;
    return;
  }
  _$jscoverage['/dialog.js'].lineData[217]++;
  valInput(self.imgUrl, data['imgUrl']);
  _$jscoverage['/dialog.js'].lineData[220]++;
  new Image().src = data['imgUrl'];
  _$jscoverage['/dialog.js'].lineData[221]++;
  self._insert();
}});
    _$jscoverage['/dialog.js'].lineData[225]++;
    var loadingMaskEl = self.d.get("el"), offset = loadingMaskEl.offset(), width = loadingMaskEl[0].offsetWidth, height = loadingMaskEl[0].offsetHeight;
    _$jscoverage['/dialog.js'].lineData[230]++;
    loadingCancel.css({
  left: (offset.left + width / 2.5), 
  top: (offset.top + height / 1.5)});
  } else {
    _$jscoverage['/dialog.js'].lineData[236]++;
    if (visit28_236_1(!verifyInputs(content.all("input")))) {
      _$jscoverage['/dialog.js'].lineData[237]++;
      return;
    }
    _$jscoverage['/dialog.js'].lineData[238]++;
    self._insert();
  }
});
  _$jscoverage['/dialog.js'].lineData[242]++;
  if (visit29_242_1(self.cfg)) {
    _$jscoverage['/dialog.js'].lineData[243]++;
    if (visit30_243_1(self.cfg['extraHTML'])) {
      _$jscoverage['/dialog.js'].lineData[245]++;
      content.one("." + prefixCls + "img-up-extraHTML").html(self.cfg['extraHTML']);
    }
    _$jscoverage['/dialog.js'].lineData[247]++;
    var ke_image_up = content.one("." + prefixCls + "image-up"), sizeLimit = visit31_248_1(self.cfg && self.cfg['sizeLimit']);
    _$jscoverage['/dialog.js'].lineData[250]++;
    self.fileInput = new Node("<input " + "type='file' " + "style='position:absolute;" + "cursor:pointer;" + "left:" + (UA['ie'] ? "360" : (UA["chrome"] ? "319" : "369")) + "px;" + "z-index:2;" + "top:0px;" + "height:26px;' " + "size='1' " + "name='" + (visit32_261_1(self.cfg['fileInput'] || "Filedata")) + "'/>").insertAfter(self.imgLocalUrl);
    _$jscoverage['/dialog.js'].lineData[263]++;
    if (visit33_263_1(sizeLimit)) {
      _$jscoverage['/dialog.js'].lineData[264]++;
      warning = "\u5355\u5f20\u56fe\u7247\u5bb9\u91cf\u4e0d\u8d85\u8fc7 " + (sizeLimit / 1000) + " M";
    }
    _$jscoverage['/dialog.js'].lineData[265]++;
    self.imgLocalUrl.val(warning);
    _$jscoverage['/dialog.js'].lineData[266]++;
    self.fileInput.css("opacity", 0);
    _$jscoverage['/dialog.js'].lineData[267]++;
    self.fileInput.on("mouseenter", function() {
  _$jscoverage['/dialog.js'].functionData[11]++;
  _$jscoverage['/dialog.js'].lineData[268]++;
  ke_image_up.addClass("" + prefixCls + "button-hover");
});
    _$jscoverage['/dialog.js'].lineData[270]++;
    self.fileInput.on("mouseleave", function() {
  _$jscoverage['/dialog.js'].functionData[12]++;
  _$jscoverage['/dialog.js'].lineData[271]++;
  ke_image_up.removeClass("" + prefixCls + "button-hover");
});
    _$jscoverage['/dialog.js'].lineData[273]++;
    self.fileInput.on("change", function() {
  _$jscoverage['/dialog.js'].functionData[13]++;
  _$jscoverage['/dialog.js'].lineData[274]++;
  var file = self.fileInput.val();
  _$jscoverage['/dialog.js'].lineData[276]++;
  self.imgLocalUrl.val(file.replace(/.+[\/\\]/, ""));
});
    _$jscoverage['/dialog.js'].lineData[279]++;
    if (visit34_279_1(self.imageCfg['remote'] === false)) {
      _$jscoverage['/dialog.js'].lineData[280]++;
      self.tab.removeItemAt(0, 1);
    }
  } else {
    _$jscoverage['/dialog.js'].lineData[284]++;
    self.tab.removeItemAt(1, 1);
  }
  _$jscoverage['/dialog.js'].lineData[287]++;
  self._prepare = S.noop;
}, 
  _insert: function() {
  _$jscoverage['/dialog.js'].functionData[14]++;
  _$jscoverage['/dialog.js'].lineData[291]++;
  var self = this, url = valInput(self.imgUrl), img, height = parseInt(valInput(self.imgHeight)), width = parseInt(valInput(self.imgWidth)), align = self.imgAlign.get("value"), margin = parseInt(self.imgMargin.val()), style = '';
  _$jscoverage['/dialog.js'].lineData[300]++;
  if (visit35_300_1(height)) {
    _$jscoverage['/dialog.js'].lineData[301]++;
    style += "height:" + height + "px;";
  }
  _$jscoverage['/dialog.js'].lineData[303]++;
  if (visit36_303_1(width)) {
    _$jscoverage['/dialog.js'].lineData[304]++;
    style += "width:" + width + "px;";
  }
  _$jscoverage['/dialog.js'].lineData[306]++;
  if (visit37_306_1(align != 'none')) {
    _$jscoverage['/dialog.js'].lineData[307]++;
    style += "float:" + align + ";";
  }
  _$jscoverage['/dialog.js'].lineData[309]++;
  if (visit38_309_1(!isNaN(margin) && visit39_309_2(margin != 0))) {
    _$jscoverage['/dialog.js'].lineData[310]++;
    style += "margin:" + margin + "px;";
  }
  _$jscoverage['/dialog.js'].lineData[313]++;
  self.d.hide();
  _$jscoverage['/dialog.js'].lineData[320]++;
  if (visit40_320_1(self.selectedEl)) {
    _$jscoverage['/dialog.js'].lineData[321]++;
    img = self.selectedEl;
    _$jscoverage['/dialog.js'].lineData[322]++;
    self.editor.execCommand("save");
    _$jscoverage['/dialog.js'].lineData[323]++;
    self.selectedEl.attr({
  "src": url, 
  "_ke_saved_src": url, 
  "style": style});
  } else {
    _$jscoverage['/dialog.js'].lineData[330]++;
    img = new Node("<img " + (style ? ("style='" + style + "'") : "") + " src='" + url + "' " + "_ke_saved_src='" + url + "' alt='' />", null, self.editor.get("document")[0]);
    _$jscoverage['/dialog.js'].lineData[340]++;
    self.editor.insertElement(img);
  }
  _$jscoverage['/dialog.js'].lineData[345]++;
  setTimeout(function() {
  _$jscoverage['/dialog.js'].functionData[15]++;
  _$jscoverage['/dialog.js'].lineData[346]++;
  var link = findAWithImg(img), linkVal = S.trim(valInput(self.imgLink)), sel = self.editor.getSelection(), target = self.imgLinkBlank.attr("checked") ? "_blank" : "_self", linkTarget, skip = 0, prev, next, bs;
  _$jscoverage['/dialog.js'].lineData[356]++;
  if (visit41_356_1(link)) {
    _$jscoverage['/dialog.js'].lineData[357]++;
    linkTarget = visit42_357_1(link.attr('target') || "_self");
    _$jscoverage['/dialog.js'].lineData[358]++;
    if (visit43_358_1(visit44_358_2(linkVal != link.attr('href')) || visit45_358_3(linkTarget != target))) {
      _$jscoverage['/dialog.js'].lineData[359]++;
      img._4e_breakParent(link);
      _$jscoverage['/dialog.js'].lineData[360]++;
      if (visit46_360_1((prev = img.prev()) && visit47_360_2((visit48_360_3(prev.nodeName() == 'a')) && !(prev[0].childNodes.length)))) {
        _$jscoverage['/dialog.js'].lineData[361]++;
        prev.remove();
      }
      _$jscoverage['/dialog.js'].lineData[364]++;
      if (visit49_364_1((next = img.next()) && visit50_364_2((visit51_364_3(next.nodeName() == 'a')) && !(next[0].childNodes.length)))) {
        _$jscoverage['/dialog.js'].lineData[365]++;
        next.remove();
      }
    } else {
      _$jscoverage['/dialog.js'].lineData[368]++;
      skip = 1;
    }
  }
  _$jscoverage['/dialog.js'].lineData[372]++;
  if (visit52_372_1(!skip && linkVal)) {
    _$jscoverage['/dialog.js'].lineData[374]++;
    if (visit53_374_1(!self.selectedEl)) {
      _$jscoverage['/dialog.js'].lineData[375]++;
      bs = sel.createBookmarks();
    }
    _$jscoverage['/dialog.js'].lineData[377]++;
    link = new Node("<a></a>");
    _$jscoverage['/dialog.js'].lineData[380]++;
    link.attr("_ke_saved_href", linkVal).attr("href", linkVal).attr("target", target);
    _$jscoverage['/dialog.js'].lineData[381]++;
    var t = img[0];
    _$jscoverage['/dialog.js'].lineData[382]++;
    t.parentNode.replaceChild(link[0], t);
    _$jscoverage['/dialog.js'].lineData[383]++;
    link.append(t);
  }
  _$jscoverage['/dialog.js'].lineData[386]++;
  if (visit54_386_1(bs)) {
    _$jscoverage['/dialog.js'].lineData[387]++;
    sel.selectBookmarks(bs);
  } else {
    _$jscoverage['/dialog.js'].lineData[389]++;
    if (visit55_389_1(self.selectedEl)) {
      _$jscoverage['/dialog.js'].lineData[390]++;
      self.editor.getSelection().selectElement(self.selectedEl);
    }
  }
  _$jscoverage['/dialog.js'].lineData[392]++;
  if (visit56_392_1(!skip)) {
    _$jscoverage['/dialog.js'].lineData[393]++;
    self.editor.execCommand("save");
  }
}, 100);
}, 
  _update: function(selectedEl) {
  _$jscoverage['/dialog.js'].functionData[16]++;
  _$jscoverage['/dialog.js'].lineData[399]++;
  var self = this, active = 0, link, resetInput = Editor.Utils.resetInput;
  _$jscoverage['/dialog.js'].lineData[403]++;
  self.selectedEl = selectedEl;
  _$jscoverage['/dialog.js'].lineData[404]++;
  if (visit57_404_1(selectedEl && visit58_404_2(self.imageCfg['remote'] !== false))) {
    _$jscoverage['/dialog.js'].lineData[405]++;
    valInput(self.imgUrl, selectedEl.attr("src"));
    _$jscoverage['/dialog.js'].lineData[406]++;
    var w = parseInt(selectedEl.style("width")), h = parseInt(selectedEl.style("height"));
    _$jscoverage['/dialog.js'].lineData[408]++;
    if (visit59_408_1(h)) {
      _$jscoverage['/dialog.js'].lineData[409]++;
      valInput(self.imgHeight, h);
    } else {
      _$jscoverage['/dialog.js'].lineData[411]++;
      resetInput(self.imgHeight);
    }
    _$jscoverage['/dialog.js'].lineData[413]++;
    if (visit60_413_1(w)) {
      _$jscoverage['/dialog.js'].lineData[414]++;
      valInput(self.imgWidth, w);
    } else {
      _$jscoverage['/dialog.js'].lineData[416]++;
      resetInput(self.imgWidth);
    }
    _$jscoverage['/dialog.js'].lineData[418]++;
    self.imgAlign.set("value", visit61_418_1(selectedEl.style("float") || "none"));
    _$jscoverage['/dialog.js'].lineData[419]++;
    var margin = visit62_419_1(parseInt(selectedEl.style("margin")) || 0);
    _$jscoverage['/dialog.js'].lineData[421]++;
    self.imgMargin.val(margin);
    _$jscoverage['/dialog.js'].lineData[422]++;
    self.imgRatio[0].disabled = false;
    _$jscoverage['/dialog.js'].lineData[423]++;
    self.imgRatioValue = w / h;
    _$jscoverage['/dialog.js'].lineData[424]++;
    link = findAWithImg(selectedEl);
  } else {
    _$jscoverage['/dialog.js'].lineData[426]++;
    var editor = self.editor;
    _$jscoverage['/dialog.js'].lineData[427]++;
    var editorSelection = editor.getSelection();
    _$jscoverage['/dialog.js'].lineData[428]++;
    var inElement = visit63_428_1(editorSelection && editorSelection.getCommonAncestor());
    _$jscoverage['/dialog.js'].lineData[429]++;
    if (visit64_429_1(inElement)) {
      _$jscoverage['/dialog.js'].lineData[430]++;
      link = findAWithImg(inElement);
    }
    _$jscoverage['/dialog.js'].lineData[432]++;
    var defaultMargin = self.imageCfg['defaultMargin'];
    _$jscoverage['/dialog.js'].lineData[433]++;
    if (visit65_433_1(defaultMargin == undefined)) {
      _$jscoverage['/dialog.js'].lineData[434]++;
      defaultMargin = MARGIN_DEFAULT;
    }
    _$jscoverage['/dialog.js'].lineData[436]++;
    if (visit66_436_1(self.tab.get('bar').get('children').length == 2)) {
      _$jscoverage['/dialog.js'].lineData[437]++;
      active = 1;
    }
    _$jscoverage['/dialog.js'].lineData[439]++;
    self.imgLinkBlank.attr("checked", true);
    _$jscoverage['/dialog.js'].lineData[440]++;
    resetInput(self.imgUrl);
    _$jscoverage['/dialog.js'].lineData[441]++;
    resetInput(self.imgLink);
    _$jscoverage['/dialog.js'].lineData[442]++;
    resetInput(self.imgHeight);
    _$jscoverage['/dialog.js'].lineData[443]++;
    resetInput(self.imgWidth);
    _$jscoverage['/dialog.js'].lineData[444]++;
    self.imgAlign.set("value", "none");
    _$jscoverage['/dialog.js'].lineData[445]++;
    self.imgMargin.val(defaultMargin);
    _$jscoverage['/dialog.js'].lineData[446]++;
    self.imgRatio[0].disabled = true;
    _$jscoverage['/dialog.js'].lineData[447]++;
    self.imgRatioValue = null;
  }
  _$jscoverage['/dialog.js'].lineData[449]++;
  if (visit67_449_1(link)) {
    _$jscoverage['/dialog.js'].lineData[450]++;
    valInput(self.imgLink, visit68_450_1(link.attr("_ke_saved_href") || link.attr("href")));
    _$jscoverage['/dialog.js'].lineData[451]++;
    self.imgLinkBlank.attr("checked", visit69_451_1(link.attr("target") == "_blank"));
  } else {
    _$jscoverage['/dialog.js'].lineData[453]++;
    resetInput(self.imgLink);
    _$jscoverage['/dialog.js'].lineData[454]++;
    self.imgLinkBlank.attr("checked", true);
  }
  _$jscoverage['/dialog.js'].lineData[456]++;
  self.uploadForm[0].reset();
  _$jscoverage['/dialog.js'].lineData[457]++;
  self.imgLocalUrl.val(warning);
  _$jscoverage['/dialog.js'].lineData[458]++;
  var tab = self.tab;
  _$jscoverage['/dialog.js'].lineData[459]++;
  tab.setSelectedTab(tab.getTabAt(active));
}, 
  show: function(_selectedEl) {
  _$jscoverage['/dialog.js'].functionData[17]++;
  _$jscoverage['/dialog.js'].lineData[462]++;
  var self = this;
  _$jscoverage['/dialog.js'].lineData[463]++;
  self._prepare();
  _$jscoverage['/dialog.js'].lineData[464]++;
  self._update(_selectedEl);
  _$jscoverage['/dialog.js'].lineData[465]++;
  self.d.show();
}, 
  destroy: function() {
  _$jscoverage['/dialog.js'].functionData[18]++;
  _$jscoverage['/dialog.js'].lineData[468]++;
  var self = this;
  _$jscoverage['/dialog.js'].lineData[469]++;
  self.d.destroy();
  _$jscoverage['/dialog.js'].lineData[470]++;
  self.tab.destroy();
  _$jscoverage['/dialog.js'].lineData[471]++;
  if (visit70_471_1(self.loadingCancel)) {
    _$jscoverage['/dialog.js'].lineData[472]++;
    self.loadingCancel.remove();
  }
  _$jscoverage['/dialog.js'].lineData[474]++;
  if (visit71_474_1(self.imgAlign)) {
    _$jscoverage['/dialog.js'].lineData[475]++;
    self.imgAlign.destroy();
  }
}});
  _$jscoverage['/dialog.js'].lineData[480]++;
  return ImageDialog;
}, {
  requires: ['io', 'editor', '../dialog', 'tabs', '../menubutton', './dialog/dialog-tpl']});
