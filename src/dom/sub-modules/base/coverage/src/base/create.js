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
  _$jscoverage['/base/create.js'].lineData[8] = 0;
  _$jscoverage['/base/create.js'].lineData[9] = 0;
  _$jscoverage['/base/create.js'].lineData[28] = 0;
  _$jscoverage['/base/create.js'].lineData[29] = 0;
  _$jscoverage['/base/create.js'].lineData[32] = 0;
  _$jscoverage['/base/create.js'].lineData[33] = 0;
  _$jscoverage['/base/create.js'].lineData[36] = 0;
  _$jscoverage['/base/create.js'].lineData[37] = 0;
  _$jscoverage['/base/create.js'].lineData[39] = 0;
  _$jscoverage['/base/create.js'].lineData[42] = 0;
  _$jscoverage['/base/create.js'].lineData[43] = 0;
  _$jscoverage['/base/create.js'].lineData[45] = 0;
  _$jscoverage['/base/create.js'].lineData[46] = 0;
  _$jscoverage['/base/create.js'].lineData[49] = 0;
  _$jscoverage['/base/create.js'].lineData[50] = 0;
  _$jscoverage['/base/create.js'].lineData[52] = 0;
  _$jscoverage['/base/create.js'].lineData[53] = 0;
  _$jscoverage['/base/create.js'].lineData[59] = 0;
  _$jscoverage['/base/create.js'].lineData[60] = 0;
  _$jscoverage['/base/create.js'].lineData[64] = 0;
  _$jscoverage['/base/create.js'].lineData[65] = 0;
  _$jscoverage['/base/create.js'].lineData[70] = 0;
  _$jscoverage['/base/create.js'].lineData[72] = 0;
  _$jscoverage['/base/create.js'].lineData[73] = 0;
  _$jscoverage['/base/create.js'].lineData[75] = 0;
  _$jscoverage['/base/create.js'].lineData[77] = 0;
  _$jscoverage['/base/create.js'].lineData[82] = 0;
  _$jscoverage['/base/create.js'].lineData[100] = 0;
  _$jscoverage['/base/create.js'].lineData[102] = 0;
  _$jscoverage['/base/create.js'].lineData[103] = 0;
  _$jscoverage['/base/create.js'].lineData[106] = 0;
  _$jscoverage['/base/create.js'].lineData[107] = 0;
  _$jscoverage['/base/create.js'].lineData[110] = 0;
  _$jscoverage['/base/create.js'].lineData[111] = 0;
  _$jscoverage['/base/create.js'].lineData[114] = 0;
  _$jscoverage['/base/create.js'].lineData[115] = 0;
  _$jscoverage['/base/create.js'].lineData[118] = 0;
  _$jscoverage['/base/create.js'].lineData[119] = 0;
  _$jscoverage['/base/create.js'].lineData[122] = 0;
  _$jscoverage['/base/create.js'].lineData[131] = 0;
  _$jscoverage['/base/create.js'].lineData[132] = 0;
  _$jscoverage['/base/create.js'].lineData[133] = 0;
  _$jscoverage['/base/create.js'].lineData[135] = 0;
  _$jscoverage['/base/create.js'].lineData[139] = 0;
  _$jscoverage['/base/create.js'].lineData[141] = 0;
  _$jscoverage['/base/create.js'].lineData[142] = 0;
  _$jscoverage['/base/create.js'].lineData[145] = 0;
  _$jscoverage['/base/create.js'].lineData[147] = 0;
  _$jscoverage['/base/create.js'].lineData[149] = 0;
  _$jscoverage['/base/create.js'].lineData[152] = 0;
  _$jscoverage['/base/create.js'].lineData[154] = 0;
  _$jscoverage['/base/create.js'].lineData[157] = 0;
  _$jscoverage['/base/create.js'].lineData[159] = 0;
  _$jscoverage['/base/create.js'].lineData[161] = 0;
  _$jscoverage['/base/create.js'].lineData[162] = 0;
  _$jscoverage['/base/create.js'].lineData[164] = 0;
  _$jscoverage['/base/create.js'].lineData[166] = 0;
  _$jscoverage['/base/create.js'].lineData[170] = 0;
  _$jscoverage['/base/create.js'].lineData[174] = 0;
  _$jscoverage['/base/create.js'].lineData[175] = 0;
  _$jscoverage['/base/create.js'].lineData[176] = 0;
  _$jscoverage['/base/create.js'].lineData[178] = 0;
  _$jscoverage['/base/create.js'].lineData[179] = 0;
  _$jscoverage['/base/create.js'].lineData[180] = 0;
  _$jscoverage['/base/create.js'].lineData[181] = 0;
  _$jscoverage['/base/create.js'].lineData[183] = 0;
  _$jscoverage['/base/create.js'].lineData[184] = 0;
  _$jscoverage['/base/create.js'].lineData[185] = 0;
  _$jscoverage['/base/create.js'].lineData[187] = 0;
  _$jscoverage['/base/create.js'].lineData[188] = 0;
  _$jscoverage['/base/create.js'].lineData[189] = 0;
  _$jscoverage['/base/create.js'].lineData[210] = 0;
  _$jscoverage['/base/create.js'].lineData[215] = 0;
  _$jscoverage['/base/create.js'].lineData[216] = 0;
  _$jscoverage['/base/create.js'].lineData[219] = 0;
  _$jscoverage['/base/create.js'].lineData[221] = 0;
  _$jscoverage['/base/create.js'].lineData[222] = 0;
  _$jscoverage['/base/create.js'].lineData[223] = 0;
  _$jscoverage['/base/create.js'].lineData[224] = 0;
  _$jscoverage['/base/create.js'].lineData[225] = 0;
  _$jscoverage['/base/create.js'].lineData[226] = 0;
  _$jscoverage['/base/create.js'].lineData[228] = 0;
  _$jscoverage['/base/create.js'].lineData[231] = 0;
  _$jscoverage['/base/create.js'].lineData[235] = 0;
  _$jscoverage['/base/create.js'].lineData[238] = 0;
  _$jscoverage['/base/create.js'].lineData[239] = 0;
  _$jscoverage['/base/create.js'].lineData[240] = 0;
  _$jscoverage['/base/create.js'].lineData[241] = 0;
  _$jscoverage['/base/create.js'].lineData[242] = 0;
  _$jscoverage['/base/create.js'].lineData[243] = 0;
  _$jscoverage['/base/create.js'].lineData[246] = 0;
  _$jscoverage['/base/create.js'].lineData[254] = 0;
  _$jscoverage['/base/create.js'].lineData[255] = 0;
  _$jscoverage['/base/create.js'].lineData[256] = 0;
  _$jscoverage['/base/create.js'].lineData[257] = 0;
  _$jscoverage['/base/create.js'].lineData[260] = 0;
  _$jscoverage['/base/create.js'].lineData[272] = 0;
  _$jscoverage['/base/create.js'].lineData[278] = 0;
  _$jscoverage['/base/create.js'].lineData[279] = 0;
  _$jscoverage['/base/create.js'].lineData[282] = 0;
  _$jscoverage['/base/create.js'].lineData[283] = 0;
  _$jscoverage['/base/create.js'].lineData[284] = 0;
  _$jscoverage['/base/create.js'].lineData[286] = 0;
  _$jscoverage['/base/create.js'].lineData[287] = 0;
  _$jscoverage['/base/create.js'].lineData[288] = 0;
  _$jscoverage['/base/create.js'].lineData[291] = 0;
  _$jscoverage['/base/create.js'].lineData[292] = 0;
  _$jscoverage['/base/create.js'].lineData[293] = 0;
  _$jscoverage['/base/create.js'].lineData[294] = 0;
  _$jscoverage['/base/create.js'].lineData[295] = 0;
  _$jscoverage['/base/create.js'].lineData[296] = 0;
  _$jscoverage['/base/create.js'].lineData[297] = 0;
  _$jscoverage['/base/create.js'].lineData[301] = 0;
  _$jscoverage['/base/create.js'].lineData[302] = 0;
  _$jscoverage['/base/create.js'].lineData[303] = 0;
  _$jscoverage['/base/create.js'].lineData[306] = 0;
  _$jscoverage['/base/create.js'].lineData[315] = 0;
  _$jscoverage['/base/create.js'].lineData[320] = 0;
  _$jscoverage['/base/create.js'].lineData[321] = 0;
  _$jscoverage['/base/create.js'].lineData[322] = 0;
  _$jscoverage['/base/create.js'].lineData[323] = 0;
  _$jscoverage['/base/create.js'].lineData[324] = 0;
  _$jscoverage['/base/create.js'].lineData[325] = 0;
  _$jscoverage['/base/create.js'].lineData[326] = 0;
  _$jscoverage['/base/create.js'].lineData[327] = 0;
  _$jscoverage['/base/create.js'].lineData[335] = 0;
  _$jscoverage['/base/create.js'].lineData[359] = 0;
  _$jscoverage['/base/create.js'].lineData[360] = 0;
  _$jscoverage['/base/create.js'].lineData[361] = 0;
  _$jscoverage['/base/create.js'].lineData[362] = 0;
  _$jscoverage['/base/create.js'].lineData[365] = 0;
  _$jscoverage['/base/create.js'].lineData[370] = 0;
  _$jscoverage['/base/create.js'].lineData[371] = 0;
  _$jscoverage['/base/create.js'].lineData[374] = 0;
  _$jscoverage['/base/create.js'].lineData[380] = 0;
  _$jscoverage['/base/create.js'].lineData[384] = 0;
  _$jscoverage['/base/create.js'].lineData[391] = 0;
  _$jscoverage['/base/create.js'].lineData[392] = 0;
  _$jscoverage['/base/create.js'].lineData[395] = 0;
  _$jscoverage['/base/create.js'].lineData[396] = 0;
  _$jscoverage['/base/create.js'].lineData[400] = 0;
  _$jscoverage['/base/create.js'].lineData[401] = 0;
  _$jscoverage['/base/create.js'].lineData[402] = 0;
  _$jscoverage['/base/create.js'].lineData[403] = 0;
  _$jscoverage['/base/create.js'].lineData[406] = 0;
  _$jscoverage['/base/create.js'].lineData[414] = 0;
  _$jscoverage['/base/create.js'].lineData[416] = 0;
  _$jscoverage['/base/create.js'].lineData[417] = 0;
  _$jscoverage['/base/create.js'].lineData[418] = 0;
  _$jscoverage['/base/create.js'].lineData[426] = 0;
  _$jscoverage['/base/create.js'].lineData[428] = 0;
  _$jscoverage['/base/create.js'].lineData[429] = 0;
  _$jscoverage['/base/create.js'].lineData[430] = 0;
  _$jscoverage['/base/create.js'].lineData[431] = 0;
  _$jscoverage['/base/create.js'].lineData[434] = 0;
  _$jscoverage['/base/create.js'].lineData[435] = 0;
  _$jscoverage['/base/create.js'].lineData[436] = 0;
  _$jscoverage['/base/create.js'].lineData[438] = 0;
  _$jscoverage['/base/create.js'].lineData[440] = 0;
  _$jscoverage['/base/create.js'].lineData[441] = 0;
  _$jscoverage['/base/create.js'].lineData[444] = 0;
  _$jscoverage['/base/create.js'].lineData[445] = 0;
  _$jscoverage['/base/create.js'].lineData[446] = 0;
  _$jscoverage['/base/create.js'].lineData[448] = 0;
  _$jscoverage['/base/create.js'].lineData[454] = 0;
  _$jscoverage['/base/create.js'].lineData[455] = 0;
  _$jscoverage['/base/create.js'].lineData[459] = 0;
  _$jscoverage['/base/create.js'].lineData[460] = 0;
  _$jscoverage['/base/create.js'].lineData[463] = 0;
  _$jscoverage['/base/create.js'].lineData[466] = 0;
  _$jscoverage['/base/create.js'].lineData[467] = 0;
  _$jscoverage['/base/create.js'].lineData[471] = 0;
  _$jscoverage['/base/create.js'].lineData[473] = 0;
  _$jscoverage['/base/create.js'].lineData[478] = 0;
  _$jscoverage['/base/create.js'].lineData[479] = 0;
  _$jscoverage['/base/create.js'].lineData[480] = 0;
  _$jscoverage['/base/create.js'].lineData[481] = 0;
  _$jscoverage['/base/create.js'].lineData[482] = 0;
  _$jscoverage['/base/create.js'].lineData[484] = 0;
  _$jscoverage['/base/create.js'].lineData[487] = 0;
  _$jscoverage['/base/create.js'].lineData[491] = 0;
  _$jscoverage['/base/create.js'].lineData[492] = 0;
  _$jscoverage['/base/create.js'].lineData[496] = 0;
  _$jscoverage['/base/create.js'].lineData[497] = 0;
  _$jscoverage['/base/create.js'].lineData[498] = 0;
  _$jscoverage['/base/create.js'].lineData[499] = 0;
  _$jscoverage['/base/create.js'].lineData[500] = 0;
  _$jscoverage['/base/create.js'].lineData[501] = 0;
  _$jscoverage['/base/create.js'].lineData[504] = 0;
  _$jscoverage['/base/create.js'].lineData[506] = 0;
  _$jscoverage['/base/create.js'].lineData[510] = 0;
  _$jscoverage['/base/create.js'].lineData[526] = 0;
  _$jscoverage['/base/create.js'].lineData[528] = 0;
  _$jscoverage['/base/create.js'].lineData[529] = 0;
  _$jscoverage['/base/create.js'].lineData[530] = 0;
  _$jscoverage['/base/create.js'].lineData[538] = 0;
  _$jscoverage['/base/create.js'].lineData[539] = 0;
  _$jscoverage['/base/create.js'].lineData[542] = 0;
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
  _$jscoverage['/base/create.js'].functionData[19] = 0;
}
if (! _$jscoverage['/base/create.js'].branchData) {
  _$jscoverage['/base/create.js'].branchData = {};
  _$jscoverage['/base/create.js'].branchData['16'] = [];
  _$jscoverage['/base/create.js'].branchData['16'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['21'] = [];
  _$jscoverage['/base/create.js'].branchData['21'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['21'][2] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['24'] = [];
  _$jscoverage['/base/create.js'].branchData['24'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['33'] = [];
  _$jscoverage['/base/create.js'].branchData['33'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['33'][2] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['36'] = [];
  _$jscoverage['/base/create.js'].branchData['36'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['65'] = [];
  _$jscoverage['/base/create.js'].branchData['65'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['70'] = [];
  _$jscoverage['/base/create.js'].branchData['70'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['70'][2] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['72'] = [];
  _$jscoverage['/base/create.js'].branchData['72'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['102'] = [];
  _$jscoverage['/base/create.js'].branchData['102'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['106'] = [];
  _$jscoverage['/base/create.js'].branchData['106'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['110'] = [];
  _$jscoverage['/base/create.js'].branchData['110'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['114'] = [];
  _$jscoverage['/base/create.js'].branchData['114'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['118'] = [];
  _$jscoverage['/base/create.js'].branchData['118'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['125'] = [];
  _$jscoverage['/base/create.js'].branchData['125'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['131'] = [];
  _$jscoverage['/base/create.js'].branchData['131'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['141'] = [];
  _$jscoverage['/base/create.js'].branchData['141'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['145'] = [];
  _$jscoverage['/base/create.js'].branchData['145'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['147'] = [];
  _$jscoverage['/base/create.js'].branchData['147'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['152'] = [];
  _$jscoverage['/base/create.js'].branchData['152'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['152'][2] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['159'] = [];
  _$jscoverage['/base/create.js'].branchData['159'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['162'] = [];
  _$jscoverage['/base/create.js'].branchData['162'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['175'] = [];
  _$jscoverage['/base/create.js'].branchData['175'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['178'] = [];
  _$jscoverage['/base/create.js'].branchData['178'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['181'] = [];
  _$jscoverage['/base/create.js'].branchData['181'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['181'][2] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['181'][3] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['181'][4] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['181'][5] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['184'] = [];
  _$jscoverage['/base/create.js'].branchData['184'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['188'] = [];
  _$jscoverage['/base/create.js'].branchData['188'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['215'] = [];
  _$jscoverage['/base/create.js'].branchData['215'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['219'] = [];
  _$jscoverage['/base/create.js'].branchData['219'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['221'] = [];
  _$jscoverage['/base/create.js'].branchData['221'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['223'] = [];
  _$jscoverage['/base/create.js'].branchData['223'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['235'] = [];
  _$jscoverage['/base/create.js'].branchData['235'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['236'] = [];
  _$jscoverage['/base/create.js'].branchData['236'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['236'][2] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['236'][3] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['239'] = [];
  _$jscoverage['/base/create.js'].branchData['239'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['241'] = [];
  _$jscoverage['/base/create.js'].branchData['241'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['254'] = [];
  _$jscoverage['/base/create.js'].branchData['254'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['278'] = [];
  _$jscoverage['/base/create.js'].branchData['278'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['282'] = [];
  _$jscoverage['/base/create.js'].branchData['282'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['283'] = [];
  _$jscoverage['/base/create.js'].branchData['283'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['283'][2] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['292'] = [];
  _$jscoverage['/base/create.js'].branchData['292'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['293'] = [];
  _$jscoverage['/base/create.js'].branchData['293'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['295'] = [];
  _$jscoverage['/base/create.js'].branchData['295'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['320'] = [];
  _$jscoverage['/base/create.js'].branchData['320'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['322'] = [];
  _$jscoverage['/base/create.js'].branchData['322'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['322'][2] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['326'] = [];
  _$jscoverage['/base/create.js'].branchData['326'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['359'] = [];
  _$jscoverage['/base/create.js'].branchData['359'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['370'] = [];
  _$jscoverage['/base/create.js'].branchData['370'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['384'] = [];
  _$jscoverage['/base/create.js'].branchData['384'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['384'][2] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['385'] = [];
  _$jscoverage['/base/create.js'].branchData['385'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['391'] = [];
  _$jscoverage['/base/create.js'].branchData['391'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['391'][2] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['395'] = [];
  _$jscoverage['/base/create.js'].branchData['395'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['400'] = [];
  _$jscoverage['/base/create.js'].branchData['400'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['402'] = [];
  _$jscoverage['/base/create.js'].branchData['402'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['416'] = [];
  _$jscoverage['/base/create.js'].branchData['416'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['430'] = [];
  _$jscoverage['/base/create.js'].branchData['430'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['435'] = [];
  _$jscoverage['/base/create.js'].branchData['435'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['440'] = [];
  _$jscoverage['/base/create.js'].branchData['440'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['445'] = [];
  _$jscoverage['/base/create.js'].branchData['445'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['459'] = [];
  _$jscoverage['/base/create.js'].branchData['459'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['459'][2] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['471'] = [];
  _$jscoverage['/base/create.js'].branchData['471'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['479'] = [];
  _$jscoverage['/base/create.js'].branchData['479'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['480'] = [];
  _$jscoverage['/base/create.js'].branchData['480'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['482'] = [];
  _$jscoverage['/base/create.js'].branchData['482'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['496'] = [];
  _$jscoverage['/base/create.js'].branchData['496'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['496'][2] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['496'][3] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['500'] = [];
  _$jscoverage['/base/create.js'].branchData['500'][1] = new BranchData();
}
_$jscoverage['/base/create.js'].branchData['500'][1].init(185, 7, 'i < len');
function visit190_500_1(result) {
  _$jscoverage['/base/create.js'].branchData['500'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['496'][3].init(101, 24, 'nodes.push || nodes.item');
function visit189_496_3(result) {
  _$jscoverage['/base/create.js'].branchData['496'][3].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['496'][2].init(101, 37, '(nodes.push || nodes.item) && nodes[0]');
function visit188_496_2(result) {
  _$jscoverage['/base/create.js'].branchData['496'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['496'][1].init(91, 47, 'nodes && (nodes.push || nodes.item) && nodes[0]');
function visit187_496_1(result) {
  _$jscoverage['/base/create.js'].branchData['496'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['482'][1].init(129, 49, 'elem.nodeType === NodeType.DOCUMENT_FRAGMENT_NODE');
function visit186_482_1(result) {
  _$jscoverage['/base/create.js'].branchData['482'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['480'][1].init(17, 39, 'elem.nodeType === NodeType.ELEMENT_NODE');
function visit185_480_1(result) {
  _$jscoverage['/base/create.js'].branchData['480'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['479'][1].init(13, 22, 'S.isPlainObject(props)');
function visit184_479_1(result) {
  _$jscoverage['/base/create.js'].branchData['479'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['471'][1].init(368, 8, 'DOMEvent');
function visit183_471_1(result) {
  _$jscoverage['/base/create.js'].branchData['471'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['459'][2].init(97, 39, 'dest.nodeType === NodeType.ELEMENT_NODE');
function visit182_459_2(result) {
  _$jscoverage['/base/create.js'].branchData['459'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['459'][1].init(97, 60, 'dest.nodeType === NodeType.ELEMENT_NODE && !Dom.hasData(src)');
function visit181_459_1(result) {
  _$jscoverage['/base/create.js'].branchData['459'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['445'][1].init(21, 21, 'cloneChildren[cIndex]');
function visit180_445_1(result) {
  _$jscoverage['/base/create.js'].branchData['445'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['440'][1].init(435, 38, 'elemNodeType === NodeType.ELEMENT_NODE');
function visit179_440_1(result) {
  _$jscoverage['/base/create.js'].branchData['440'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['435'][1].init(21, 15, 'cloneCs[fIndex]');
function visit178_435_1(result) {
  _$jscoverage['/base/create.js'].branchData['435'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['430'][1].init(55, 48, 'elemNodeType === NodeType.DOCUMENT_FRAGMENT_NODE');
function visit177_430_1(result) {
  _$jscoverage['/base/create.js'].branchData['430'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['416'][1].init(116, 6, 'i >= 0');
function visit176_416_1(result) {
  _$jscoverage['/base/create.js'].branchData['416'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['402'][1].init(81, 28, 'deep && deepWithDataAndEvent');
function visit175_402_1(result) {
  _$jscoverage['/base/create.js'].branchData['402'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['400'][1].init(1730, 16, 'withDataAndEvent');
function visit174_400_1(result) {
  _$jscoverage['/base/create.js'].branchData['400'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['395'][1].init(575, 27, 'deep && _fixCloneAttributes');
function visit173_395_1(result) {
  _$jscoverage['/base/create.js'].branchData['395'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['391'][2].init(428, 38, 'elemNodeType === NodeType.ELEMENT_NODE');
function visit172_391_2(result) {
  _$jscoverage['/base/create.js'].branchData['391'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['391'][1].init(405, 61, '_fixCloneAttributes && elemNodeType === NodeType.ELEMENT_NODE');
function visit171_391_1(result) {
  _$jscoverage['/base/create.js'].branchData['391'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['385'][1].init(61, 48, 'elemNodeType === NodeType.DOCUMENT_FRAGMENT_NODE');
function visit170_385_1(result) {
  _$jscoverage['/base/create.js'].branchData['385'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['384'][2].init(847, 38, 'elemNodeType === NodeType.ELEMENT_NODE');
function visit169_384_2(result) {
  _$jscoverage['/base/create.js'].branchData['384'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['384'][1].init(847, 110, 'elemNodeType === NodeType.ELEMENT_NODE || elemNodeType === NodeType.DOCUMENT_FRAGMENT_NODE');
function visit168_384_1(result) {
  _$jscoverage['/base/create.js'].branchData['384'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['370'][1].init(433, 5, '!elem');
function visit167_370_1(result) {
  _$jscoverage['/base/create.js'].branchData['370'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['359'][1].init(21, 24, 'typeof deep === \'object\'');
function visit166_359_1(result) {
  _$jscoverage['/base/create.js'].branchData['359'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['326'][1].init(186, 8, 'DOMEvent');
function visit165_326_1(result) {
  _$jscoverage['/base/create.js'].branchData['326'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['322'][2].init(71, 37, 'el.nodeType === NodeType.ELEMENT_NODE');
function visit164_322_2(result) {
  _$jscoverage['/base/create.js'].branchData['322'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['322'][1].init(58, 50, '!keepData && el.nodeType === NodeType.ELEMENT_NODE');
function visit163_322_1(result) {
  _$jscoverage['/base/create.js'].branchData['322'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['320'][1].init(216, 6, 'i >= 0');
function visit162_320_1(result) {
  _$jscoverage['/base/create.js'].branchData['320'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['295'][1].init(74, 37, 'el.nodeType === NodeType.ELEMENT_NODE');
function visit161_295_1(result) {
  _$jscoverage['/base/create.js'].branchData['295'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['293'][1].init(46, 6, 'i >= 0');
function visit160_293_1(result) {
  _$jscoverage['/base/create.js'].branchData['293'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['292'][1].init(63, 64, '!htmlString.match(/<(?:script|style|link)/i) && supportOuterHTML');
function visit159_292_1(result) {
  _$jscoverage['/base/create.js'].branchData['292'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['283'][2].init(45, 42, 'el.nodeType !== Dom.DOCUMENT_FRAGMENT_NODE');
function visit158_283_2(result) {
  _$jscoverage['/base/create.js'].branchData['283'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['283'][1].init(25, 62, 'supportOuterHTML && el.nodeType !== Dom.DOCUMENT_FRAGMENT_NODE');
function visit157_283_1(result) {
  _$jscoverage['/base/create.js'].branchData['283'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['282'][1].init(326, 24, 'htmlString === undefined');
function visit156_282_1(result) {
  _$jscoverage['/base/create.js'].branchData['282'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['278'][1].init(222, 3, '!el');
function visit155_278_1(result) {
  _$jscoverage['/base/create.js'].branchData['278'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['254'][1].init(1090, 8, '!success');
function visit154_254_1(result) {
  _$jscoverage['/base/create.js'].branchData['254'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['241'][1].init(84, 39, 'elem.nodeType === NodeType.ELEMENT_NODE');
function visit153_241_1(result) {
  _$jscoverage['/base/create.js'].branchData['241'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['239'][1].init(54, 6, 'i >= 0');
function visit152_239_1(result) {
  _$jscoverage['/base/create.js'].branchData['239'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['236'][3].init(341, 36, 'htmlString.match(RE_TAG) || [\'\', \'\']');
function visit151_236_3(result) {
  _$jscoverage['/base/create.js'].branchData['236'][3].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['236'][2].init(252, 69, '!lostLeadingTailWhitespace || !htmlString.match(R_LEADING_WHITESPACE)');
function visit150_236_2(result) {
  _$jscoverage['/base/create.js'].branchData['236'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['236'][1].init(72, 145, '(!lostLeadingTailWhitespace || !htmlString.match(R_LEADING_WHITESPACE)) && !creatorsMap[(htmlString.match(RE_TAG) || [\'\', \'\'])[1].toLowerCase()]');
function visit149_236_1(result) {
  _$jscoverage['/base/create.js'].branchData['236'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['235'][1].init(177, 218, '!htmlString.match(/<(?:script|style|link)/i) && (!lostLeadingTailWhitespace || !htmlString.match(R_LEADING_WHITESPACE)) && !creatorsMap[(htmlString.match(RE_TAG) || [\'\', \'\'])[1].toLowerCase()]');
function visit148_235_1(result) {
  _$jscoverage['/base/create.js'].branchData['235'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['223'][1].init(212, 47, 'el.nodeType === NodeType.DOCUMENT_FRAGMENT_NODE');
function visit147_223_1(result) {
  _$jscoverage['/base/create.js'].branchData['223'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['221'][1].init(94, 37, 'el.nodeType === NodeType.ELEMENT_NODE');
function visit146_221_1(result) {
  _$jscoverage['/base/create.js'].branchData['221'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['219'][1].init(355, 24, 'htmlString === undefined');
function visit145_219_1(result) {
  _$jscoverage['/base/create.js'].branchData['219'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['215'][1].init(251, 3, '!el');
function visit144_215_1(result) {
  _$jscoverage['/base/create.js'].branchData['215'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['188'][1].init(281, 23, 'dest.value !== srcValue');
function visit143_188_1(result) {
  _$jscoverage['/base/create.js'].branchData['188'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['184'][1].init(106, 10, 'srcChecked');
function visit142_184_1(result) {
  _$jscoverage['/base/create.js'].branchData['184'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['181'][5].init(458, 16, 'type === \'radio\'');
function visit141_181_5(result) {
  _$jscoverage['/base/create.js'].branchData['181'][5].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['181'][4].init(435, 19, 'type === \'checkbox\'');
function visit140_181_4(result) {
  _$jscoverage['/base/create.js'].branchData['181'][4].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['181'][3].init(435, 39, 'type === \'checkbox\' || type === \'radio\'');
function visit139_181_3(result) {
  _$jscoverage['/base/create.js'].branchData['181'][3].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['181'][2].init(410, 20, 'nodeName === \'input\'');
function visit138_181_2(result) {
  _$jscoverage['/base/create.js'].branchData['181'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['181'][1].init(410, 65, 'nodeName === \'input\' && (type === \'checkbox\' || type === \'radio\')');
function visit137_181_1(result) {
  _$jscoverage['/base/create.js'].branchData['181'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['178'][1].init(253, 23, 'nodeName === \'textarea\'');
function visit136_178_1(result) {
  _$jscoverage['/base/create.js'].branchData['178'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['175'][1].init(88, 14, 'src.type || \'\'');
function visit135_175_1(result) {
  _$jscoverage['/base/create.js'].branchData['175'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['162'][1].init(1294, 12, 'nodes.length');
function visit134_162_1(result) {
  _$jscoverage['/base/create.js'].branchData['162'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['159'][1].init(1078, 18, 'nodes.length === 1');
function visit133_159_1(result) {
  _$jscoverage['/base/create.js'].branchData['159'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['152'][2].init(799, 92, '/\\S/.test(html) && (whitespaceMatch = html.match(R_TAIL_WHITESPACE))');
function visit132_152_2(result) {
  _$jscoverage['/base/create.js'].branchData['152'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['152'][1].init(770, 121, 'lostLeadingTailWhitespace && /\\S/.test(html) && (whitespaceMatch = html.match(R_TAIL_WHITESPACE))');
function visit131_152_1(result) {
  _$jscoverage['/base/create.js'].branchData['152'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['147'][1].init(479, 105, 'lostLeadingTailWhitespace && (whitespaceMatch = html.match(R_LEADING_WHITESPACE))');
function visit130_147_1(result) {
  _$jscoverage['/base/create.js'].branchData['147'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['145'][1].init(371, 31, 'creators[tag] || defaultCreator');
function visit129_145_1(result) {
  _$jscoverage['/base/create.js'].branchData['145'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['141'][1].init(231, 36, '(m = RE_TAG.exec(html)) && (k = m[1])');
function visit128_141_1(result) {
  _$jscoverage['/base/create.js'].branchData['141'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['131'][1].init(781, 18, '!R_HTML.test(html)');
function visit127_131_1(result) {
  _$jscoverage['/base/create.js'].branchData['131'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['125'][1].init(124, 15, 'ownerDoc || doc');
function visit126_125_1(result) {
  _$jscoverage['/base/create.js'].branchData['125'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['118'][1].init(429, 5, '_trim');
function visit125_118_1(result) {
  _$jscoverage['/base/create.js'].branchData['118'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['114'][1].init(333, 19, '_trim === undefined');
function visit124_114_1(result) {
  _$jscoverage['/base/create.js'].branchData['114'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['110'][1].init(234, 24, 'typeof html !== \'string\'');
function visit123_110_1(result) {
  _$jscoverage['/base/create.js'].branchData['110'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['106'][1].init(134, 13, 'html.nodeType');
function visit122_106_1(result) {
  _$jscoverage['/base/create.js'].branchData['106'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['102'][1].init(54, 5, '!html');
function visit121_102_1(result) {
  _$jscoverage['/base/create.js'].branchData['102'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['72'][1].init(135, 15, 'node.firstChild');
function visit120_72_1(result) {
  _$jscoverage['/base/create.js'].branchData['72'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['70'][2].init(516, 46, 'parent.canHaveChildren && \'removeNode\' in node');
function visit119_70_2(result) {
  _$jscoverage['/base/create.js'].branchData['70'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['70'][1].init(507, 55, 'oldIE && parent.canHaveChildren && \'removeNode\' in node');
function visit118_70_1(result) {
  _$jscoverage['/base/create.js'].branchData['70'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['65'][1].init(13, 6, 'parent');
function visit117_65_1(result) {
  _$jscoverage['/base/create.js'].branchData['65'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['36'][1].init(132, 22, 'holder === DEFAULT_DIV');
function visit116_36_1(result) {
  _$jscoverage['/base/create.js'].branchData['36'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['33'][2].init(34, 16, 'ownerDoc !== doc');
function visit115_33_2(result) {
  _$jscoverage['/base/create.js'].branchData['33'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['33'][1].init(22, 28, 'ownerDoc && ownerDoc !== doc');
function visit114_33_1(result) {
  _$jscoverage['/base/create.js'].branchData['33'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['24'][1].init(553, 41, 'doc && \'outerHTML\' in doc.documentElement');
function visit113_24_1(result) {
  _$jscoverage['/base/create.js'].branchData['24'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['21'][2].init(444, 6, 'ie < 9');
function visit112_21_2(result) {
  _$jscoverage['/base/create.js'].branchData['21'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['21'][1].init(438, 12, 'ie && ie < 9');
function visit111_21_1(result) {
  _$jscoverage['/base/create.js'].branchData['21'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['16'][1].init(186, 29, 'doc && doc.createElement(DIV)');
function visit110_16_1(result) {
  _$jscoverage['/base/create.js'].branchData['16'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/base/create.js'].functionData[0]++;
  _$jscoverage['/base/create.js'].lineData[7]++;
  var Dom = require('./api');
  _$jscoverage['/base/create.js'].lineData[8]++;
  var logger = S.getLogger('s/dom');
  _$jscoverage['/base/create.js'].lineData[9]++;
  var doc = S.Env.host.document, NodeType = Dom.NodeType, UA = S.UA, ie = UA.ieMode, DIV = 'div', PARENT_NODE = 'parentNode', DEFAULT_DIV = visit110_16_1(doc && doc.createElement(DIV)), R_XHTML_TAG = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/ig, RE_TAG = /<([\w:]+)/, R_LEADING_WHITESPACE = /^\s+/, R_TAIL_WHITESPACE = /\s+$/, oldIE = !!(visit111_21_1(ie && visit112_21_2(ie < 9))), lostLeadingTailWhitespace = oldIE, R_HTML = /<|&#?\w+;/, supportOuterHTML = visit113_24_1(doc && 'outerHTML' in doc.documentElement), RE_SIMPLE_TAG = /^<(\w+)\s*\/?>(?:<\/\1>)?$/;
  _$jscoverage['/base/create.js'].lineData[28]++;
  function getElementsByTagName(el, tag) {
    _$jscoverage['/base/create.js'].functionData[1]++;
    _$jscoverage['/base/create.js'].lineData[29]++;
    return el.getElementsByTagName(tag);
  }
  _$jscoverage['/base/create.js'].lineData[32]++;
  function getHolderDiv(ownerDoc) {
    _$jscoverage['/base/create.js'].functionData[2]++;
    _$jscoverage['/base/create.js'].lineData[33]++;
    var holder = visit114_33_1(ownerDoc && visit115_33_2(ownerDoc !== doc)) ? ownerDoc.createElement(DIV) : DEFAULT_DIV;
    _$jscoverage['/base/create.js'].lineData[36]++;
    if (visit116_36_1(holder === DEFAULT_DIV)) {
      _$jscoverage['/base/create.js'].lineData[37]++;
      holder.innerHTML = '';
    }
    _$jscoverage['/base/create.js'].lineData[39]++;
    return holder;
  }
  _$jscoverage['/base/create.js'].lineData[42]++;
  function defaultCreator(html, ownerDoc) {
    _$jscoverage['/base/create.js'].functionData[3]++;
    _$jscoverage['/base/create.js'].lineData[43]++;
    var frag = getHolderDiv(ownerDoc);
    _$jscoverage['/base/create.js'].lineData[45]++;
    frag.innerHTML = 'm<div>' + html + '<' + '/div>';
    _$jscoverage['/base/create.js'].lineData[46]++;
    return frag.lastChild;
  }
  _$jscoverage['/base/create.js'].lineData[49]++;
  function _empty(node) {
    _$jscoverage['/base/create.js'].functionData[4]++;
    _$jscoverage['/base/create.js'].lineData[50]++;
    try {
      _$jscoverage['/base/create.js'].lineData[52]++;
      node.innerHTML = '';
      _$jscoverage['/base/create.js'].lineData[53]++;
      return;
    }    catch (e) {
}
    _$jscoverage['/base/create.js'].lineData[59]++;
    for (var c; (c = node.lastChild); ) {
      _$jscoverage['/base/create.js'].lineData[60]++;
      _destroy(c, node);
    }
  }
  _$jscoverage['/base/create.js'].lineData[64]++;
  function _destroy(node, parent) {
    _$jscoverage['/base/create.js'].functionData[5]++;
    _$jscoverage['/base/create.js'].lineData[65]++;
    if (visit117_65_1(parent)) {
      _$jscoverage['/base/create.js'].lineData[70]++;
      if (visit118_70_1(oldIE && visit119_70_2(parent.canHaveChildren && 'removeNode' in node))) {
        _$jscoverage['/base/create.js'].lineData[72]++;
        if (visit120_72_1(node.firstChild)) {
          _$jscoverage['/base/create.js'].lineData[73]++;
          _empty(node);
        }
        _$jscoverage['/base/create.js'].lineData[75]++;
        node.removeNode(false);
      } else {
        _$jscoverage['/base/create.js'].lineData[77]++;
        parent.removeChild(node);
      }
    }
  }
  _$jscoverage['/base/create.js'].lineData[82]++;
  S.mix(Dom, {
  create: function(html, props, ownerDoc, _trim) {
  _$jscoverage['/base/create.js'].functionData[6]++;
  _$jscoverage['/base/create.js'].lineData[100]++;
  var ret = null;
  _$jscoverage['/base/create.js'].lineData[102]++;
  if (visit121_102_1(!html)) {
    _$jscoverage['/base/create.js'].lineData[103]++;
    return ret;
  }
  _$jscoverage['/base/create.js'].lineData[106]++;
  if (visit122_106_1(html.nodeType)) {
    _$jscoverage['/base/create.js'].lineData[107]++;
    return Dom.clone(html);
  }
  _$jscoverage['/base/create.js'].lineData[110]++;
  if (visit123_110_1(typeof html !== 'string')) {
    _$jscoverage['/base/create.js'].lineData[111]++;
    return ret;
  }
  _$jscoverage['/base/create.js'].lineData[114]++;
  if (visit124_114_1(_trim === undefined)) {
    _$jscoverage['/base/create.js'].lineData[115]++;
    _trim = true;
  }
  _$jscoverage['/base/create.js'].lineData[118]++;
  if (visit125_118_1(_trim)) {
    _$jscoverage['/base/create.js'].lineData[119]++;
    html = S.trim(html);
  }
  _$jscoverage['/base/create.js'].lineData[122]++;
  var creators = Dom._creators, holder, whitespaceMatch, context = visit126_125_1(ownerDoc || doc), m, tag = DIV, k, nodes;
  _$jscoverage['/base/create.js'].lineData[131]++;
  if (visit127_131_1(!R_HTML.test(html))) {
    _$jscoverage['/base/create.js'].lineData[132]++;
    ret = context.createTextNode(html);
  } else {
    _$jscoverage['/base/create.js'].lineData[133]++;
    if ((m = RE_SIMPLE_TAG.exec(html))) {
      _$jscoverage['/base/create.js'].lineData[135]++;
      ret = context.createElement(m[1]);
    } else {
      _$jscoverage['/base/create.js'].lineData[139]++;
      html = html.replace(R_XHTML_TAG, '<$1><' + '/$2>');
      _$jscoverage['/base/create.js'].lineData[141]++;
      if (visit128_141_1((m = RE_TAG.exec(html)) && (k = m[1]))) {
        _$jscoverage['/base/create.js'].lineData[142]++;
        tag = k.toLowerCase();
      }
      _$jscoverage['/base/create.js'].lineData[145]++;
      holder = (visit129_145_1(creators[tag] || defaultCreator))(html, context);
      _$jscoverage['/base/create.js'].lineData[147]++;
      if (visit130_147_1(lostLeadingTailWhitespace && (whitespaceMatch = html.match(R_LEADING_WHITESPACE)))) {
        _$jscoverage['/base/create.js'].lineData[149]++;
        holder.insertBefore(context.createTextNode(whitespaceMatch[0]), holder.firstChild);
      }
      _$jscoverage['/base/create.js'].lineData[152]++;
      if (visit131_152_1(lostLeadingTailWhitespace && visit132_152_2(/\S/.test(html) && (whitespaceMatch = html.match(R_TAIL_WHITESPACE))))) {
        _$jscoverage['/base/create.js'].lineData[154]++;
        holder.appendChild(context.createTextNode(whitespaceMatch[0]));
      }
      _$jscoverage['/base/create.js'].lineData[157]++;
      nodes = holder.childNodes;
      _$jscoverage['/base/create.js'].lineData[159]++;
      if (visit133_159_1(nodes.length === 1)) {
        _$jscoverage['/base/create.js'].lineData[161]++;
        ret = nodes[0][PARENT_NODE].removeChild(nodes[0]);
      } else {
        _$jscoverage['/base/create.js'].lineData[162]++;
        if (visit134_162_1(nodes.length)) {
          _$jscoverage['/base/create.js'].lineData[164]++;
          ret = nodeListToFragment(nodes);
        } else {
          _$jscoverage['/base/create.js'].lineData[166]++;
          S.error(html + ' : create node error');
        }
      }
    }
  }
  _$jscoverage['/base/create.js'].lineData[170]++;
  return attachProps(ret, props);
}, 
  _fixCloneAttributes: function(src, dest) {
  _$jscoverage['/base/create.js'].functionData[7]++;
  _$jscoverage['/base/create.js'].lineData[174]++;
  var nodeName = src.nodeName.toLowerCase();
  _$jscoverage['/base/create.js'].lineData[175]++;
  var type = (visit135_175_1(src.type || '')).toLowerCase();
  _$jscoverage['/base/create.js'].lineData[176]++;
  var srcValue, srcChecked;
  _$jscoverage['/base/create.js'].lineData[178]++;
  if (visit136_178_1(nodeName === 'textarea')) {
    _$jscoverage['/base/create.js'].lineData[179]++;
    dest.defaultValue = src.defaultValue;
    _$jscoverage['/base/create.js'].lineData[180]++;
    dest.value = src.value;
  } else {
    _$jscoverage['/base/create.js'].lineData[181]++;
    if (visit137_181_1(visit138_181_2(nodeName === 'input') && (visit139_181_3(visit140_181_4(type === 'checkbox') || visit141_181_5(type === 'radio'))))) {
      _$jscoverage['/base/create.js'].lineData[183]++;
      srcChecked = src.checked;
      _$jscoverage['/base/create.js'].lineData[184]++;
      if (visit142_184_1(srcChecked)) {
        _$jscoverage['/base/create.js'].lineData[185]++;
        dest.defaultChecked = dest.checked = srcChecked;
      }
      _$jscoverage['/base/create.js'].lineData[187]++;
      srcValue = src.value;
      _$jscoverage['/base/create.js'].lineData[188]++;
      if (visit143_188_1(dest.value !== srcValue)) {
        _$jscoverage['/base/create.js'].lineData[189]++;
        dest.value = srcValue;
      }
    }
  }
}, 
  _creators: {
  div: defaultCreator}, 
  _defaultCreator: defaultCreator, 
  html: function(selector, htmlString, loadScripts) {
  _$jscoverage['/base/create.js'].functionData[8]++;
  _$jscoverage['/base/create.js'].lineData[210]++;
  var els = Dom.query(selector), el = els[0], success = false, valNode, i, elem;
  _$jscoverage['/base/create.js'].lineData[215]++;
  if (visit144_215_1(!el)) {
    _$jscoverage['/base/create.js'].lineData[216]++;
    return null;
  }
  _$jscoverage['/base/create.js'].lineData[219]++;
  if (visit145_219_1(htmlString === undefined)) {
    _$jscoverage['/base/create.js'].lineData[221]++;
    if (visit146_221_1(el.nodeType === NodeType.ELEMENT_NODE)) {
      _$jscoverage['/base/create.js'].lineData[222]++;
      return el.innerHTML;
    } else {
      _$jscoverage['/base/create.js'].lineData[223]++;
      if (visit147_223_1(el.nodeType === NodeType.DOCUMENT_FRAGMENT_NODE)) {
        _$jscoverage['/base/create.js'].lineData[224]++;
        var holder = getHolderDiv(el.ownerDocument);
        _$jscoverage['/base/create.js'].lineData[225]++;
        holder.appendChild(el);
        _$jscoverage['/base/create.js'].lineData[226]++;
        return holder.innerHTML;
      } else {
        _$jscoverage['/base/create.js'].lineData[228]++;
        return null;
      }
    }
  } else {
    _$jscoverage['/base/create.js'].lineData[231]++;
    htmlString += '';
    _$jscoverage['/base/create.js'].lineData[235]++;
    if (visit148_235_1(!htmlString.match(/<(?:script|style|link)/i) && visit149_236_1((visit150_236_2(!lostLeadingTailWhitespace || !htmlString.match(R_LEADING_WHITESPACE))) && !creatorsMap[(visit151_236_3(htmlString.match(RE_TAG) || ['', '']))[1].toLowerCase()]))) {
      _$jscoverage['/base/create.js'].lineData[238]++;
      try {
        _$jscoverage['/base/create.js'].lineData[239]++;
        for (i = els.length - 1; visit152_239_1(i >= 0); i--) {
          _$jscoverage['/base/create.js'].lineData[240]++;
          elem = els[i];
          _$jscoverage['/base/create.js'].lineData[241]++;
          if (visit153_241_1(elem.nodeType === NodeType.ELEMENT_NODE)) {
            _$jscoverage['/base/create.js'].lineData[242]++;
            Dom.cleanData(getElementsByTagName(elem, '*'));
            _$jscoverage['/base/create.js'].lineData[243]++;
            elem.innerHTML = htmlString;
          }
        }
        _$jscoverage['/base/create.js'].lineData[246]++;
        success = true;
      }      catch (e) {
}
    }
    _$jscoverage['/base/create.js'].lineData[254]++;
    if (visit154_254_1(!success)) {
      _$jscoverage['/base/create.js'].lineData[255]++;
      valNode = Dom.create(htmlString, 0, el.ownerDocument, 0);
      _$jscoverage['/base/create.js'].lineData[256]++;
      Dom.empty(els);
      _$jscoverage['/base/create.js'].lineData[257]++;
      Dom.append(valNode, els, loadScripts);
    }
  }
  _$jscoverage['/base/create.js'].lineData[260]++;
  return undefined;
}, 
  outerHtml: function(selector, htmlString, loadScripts) {
  _$jscoverage['/base/create.js'].functionData[9]++;
  _$jscoverage['/base/create.js'].lineData[272]++;
  var els = Dom.query(selector), holder, i, valNode, length = els.length, el = els[0];
  _$jscoverage['/base/create.js'].lineData[278]++;
  if (visit155_278_1(!el)) {
    _$jscoverage['/base/create.js'].lineData[279]++;
    return null;
  }
  _$jscoverage['/base/create.js'].lineData[282]++;
  if (visit156_282_1(htmlString === undefined)) {
    _$jscoverage['/base/create.js'].lineData[283]++;
    if (visit157_283_1(supportOuterHTML && visit158_283_2(el.nodeType !== Dom.DOCUMENT_FRAGMENT_NODE))) {
      _$jscoverage['/base/create.js'].lineData[284]++;
      return el.outerHTML;
    } else {
      _$jscoverage['/base/create.js'].lineData[286]++;
      holder = getHolderDiv(el.ownerDocument);
      _$jscoverage['/base/create.js'].lineData[287]++;
      holder.appendChild(Dom.clone(el, true));
      _$jscoverage['/base/create.js'].lineData[288]++;
      return holder.innerHTML;
    }
  } else {
    _$jscoverage['/base/create.js'].lineData[291]++;
    htmlString += '';
    _$jscoverage['/base/create.js'].lineData[292]++;
    if (visit159_292_1(!htmlString.match(/<(?:script|style|link)/i) && supportOuterHTML)) {
      _$jscoverage['/base/create.js'].lineData[293]++;
      for (i = length - 1; visit160_293_1(i >= 0); i--) {
        _$jscoverage['/base/create.js'].lineData[294]++;
        el = els[i];
        _$jscoverage['/base/create.js'].lineData[295]++;
        if (visit161_295_1(el.nodeType === NodeType.ELEMENT_NODE)) {
          _$jscoverage['/base/create.js'].lineData[296]++;
          Dom.cleanData(el, 1);
          _$jscoverage['/base/create.js'].lineData[297]++;
          el.outerHTML = htmlString;
        }
      }
    } else {
      _$jscoverage['/base/create.js'].lineData[301]++;
      valNode = Dom.create(htmlString, 0, el.ownerDocument, 0);
      _$jscoverage['/base/create.js'].lineData[302]++;
      Dom.insertBefore(valNode, els, loadScripts);
      _$jscoverage['/base/create.js'].lineData[303]++;
      Dom.remove(els);
    }
  }
  _$jscoverage['/base/create.js'].lineData[306]++;
  return undefined;
}, 
  remove: function(selector, keepData) {
  _$jscoverage['/base/create.js'].functionData[10]++;
  _$jscoverage['/base/create.js'].lineData[315]++;
  var el, els = Dom.query(selector), all, DOMEvent = S.require('event/dom'), i;
  _$jscoverage['/base/create.js'].lineData[320]++;
  for (i = els.length - 1; visit162_320_1(i >= 0); i--) {
    _$jscoverage['/base/create.js'].lineData[321]++;
    el = els[i];
    _$jscoverage['/base/create.js'].lineData[322]++;
    if (visit163_322_1(!keepData && visit164_322_2(el.nodeType === NodeType.ELEMENT_NODE))) {
      _$jscoverage['/base/create.js'].lineData[323]++;
      all = S.makeArray(getElementsByTagName(el, '*'));
      _$jscoverage['/base/create.js'].lineData[324]++;
      all.push(el);
      _$jscoverage['/base/create.js'].lineData[325]++;
      Dom.removeData(all);
      _$jscoverage['/base/create.js'].lineData[326]++;
      if (visit165_326_1(DOMEvent)) {
        _$jscoverage['/base/create.js'].lineData[327]++;
        DOMEvent.detach(all);
      }
    }
    _$jscoverage['/base/create.js'].lineData[335]++;
    _destroy(el, el.parentNode);
  }
}, 
  clone: function(selector, deep, withDataAndEvent, deepWithDataAndEvent) {
  _$jscoverage['/base/create.js'].functionData[11]++;
  _$jscoverage['/base/create.js'].lineData[359]++;
  if (visit166_359_1(typeof deep === 'object')) {
    _$jscoverage['/base/create.js'].lineData[360]++;
    deepWithDataAndEvent = deep.deepWithDataAndEvent;
    _$jscoverage['/base/create.js'].lineData[361]++;
    withDataAndEvent = deep.withDataAndEvent;
    _$jscoverage['/base/create.js'].lineData[362]++;
    deep = deep.deep;
  }
  _$jscoverage['/base/create.js'].lineData[365]++;
  var elem = Dom.get(selector), clone, _fixCloneAttributes = Dom._fixCloneAttributes, elemNodeType;
  _$jscoverage['/base/create.js'].lineData[370]++;
  if (visit167_370_1(!elem)) {
    _$jscoverage['/base/create.js'].lineData[371]++;
    return null;
  }
  _$jscoverage['/base/create.js'].lineData[374]++;
  elemNodeType = elem.nodeType;
  _$jscoverage['/base/create.js'].lineData[380]++;
  clone = elem.cloneNode(deep);
  _$jscoverage['/base/create.js'].lineData[384]++;
  if (visit168_384_1(visit169_384_2(elemNodeType === NodeType.ELEMENT_NODE) || visit170_385_1(elemNodeType === NodeType.DOCUMENT_FRAGMENT_NODE))) {
    _$jscoverage['/base/create.js'].lineData[391]++;
    if (visit171_391_1(_fixCloneAttributes && visit172_391_2(elemNodeType === NodeType.ELEMENT_NODE))) {
      _$jscoverage['/base/create.js'].lineData[392]++;
      _fixCloneAttributes(elem, clone);
    }
    _$jscoverage['/base/create.js'].lineData[395]++;
    if (visit173_395_1(deep && _fixCloneAttributes)) {
      _$jscoverage['/base/create.js'].lineData[396]++;
      processAll(_fixCloneAttributes, elem, clone);
    }
  }
  _$jscoverage['/base/create.js'].lineData[400]++;
  if (visit174_400_1(withDataAndEvent)) {
    _$jscoverage['/base/create.js'].lineData[401]++;
    cloneWithDataAndEvent(elem, clone);
    _$jscoverage['/base/create.js'].lineData[402]++;
    if (visit175_402_1(deep && deepWithDataAndEvent)) {
      _$jscoverage['/base/create.js'].lineData[403]++;
      processAll(cloneWithDataAndEvent, elem, clone);
    }
  }
  _$jscoverage['/base/create.js'].lineData[406]++;
  return clone;
}, 
  empty: function(selector) {
  _$jscoverage['/base/create.js'].functionData[12]++;
  _$jscoverage['/base/create.js'].lineData[414]++;
  var els = Dom.query(selector), el, i;
  _$jscoverage['/base/create.js'].lineData[416]++;
  for (i = els.length - 1; visit176_416_1(i >= 0); i--) {
    _$jscoverage['/base/create.js'].lineData[417]++;
    el = els[i];
    _$jscoverage['/base/create.js'].lineData[418]++;
    Dom.remove(el.childNodes);
  }
}, 
  _nodeListToFragment: nodeListToFragment});
  _$jscoverage['/base/create.js'].lineData[426]++;
  Dom.outerHTML = Dom.outerHtml;
  _$jscoverage['/base/create.js'].lineData[428]++;
  function processAll(fn, elem, clone) {
    _$jscoverage['/base/create.js'].functionData[13]++;
    _$jscoverage['/base/create.js'].lineData[429]++;
    var elemNodeType = elem.nodeType;
    _$jscoverage['/base/create.js'].lineData[430]++;
    if (visit177_430_1(elemNodeType === NodeType.DOCUMENT_FRAGMENT_NODE)) {
      _$jscoverage['/base/create.js'].lineData[431]++;
      var eCs = elem.childNodes, cloneCs = clone.childNodes, fIndex = 0;
      _$jscoverage['/base/create.js'].lineData[434]++;
      while (eCs[fIndex]) {
        _$jscoverage['/base/create.js'].lineData[435]++;
        if (visit178_435_1(cloneCs[fIndex])) {
          _$jscoverage['/base/create.js'].lineData[436]++;
          processAll(fn, eCs[fIndex], cloneCs[fIndex]);
        }
        _$jscoverage['/base/create.js'].lineData[438]++;
        fIndex++;
      }
    } else {
      _$jscoverage['/base/create.js'].lineData[440]++;
      if (visit179_440_1(elemNodeType === NodeType.ELEMENT_NODE)) {
        _$jscoverage['/base/create.js'].lineData[441]++;
        var elemChildren = getElementsByTagName(elem, '*'), cloneChildren = getElementsByTagName(clone, '*'), cIndex = 0;
        _$jscoverage['/base/create.js'].lineData[444]++;
        while (elemChildren[cIndex]) {
          _$jscoverage['/base/create.js'].lineData[445]++;
          if (visit180_445_1(cloneChildren[cIndex])) {
            _$jscoverage['/base/create.js'].lineData[446]++;
            fn(elemChildren[cIndex], cloneChildren[cIndex]);
          }
          _$jscoverage['/base/create.js'].lineData[448]++;
          cIndex++;
        }
      }
    }
  }
  _$jscoverage['/base/create.js'].lineData[454]++;
  function cloneWithDataAndEvent(src, dest) {
    _$jscoverage['/base/create.js'].functionData[14]++;
    _$jscoverage['/base/create.js'].lineData[455]++;
    var DOMEvent = S.require('event/dom'), srcData, d;
    _$jscoverage['/base/create.js'].lineData[459]++;
    if (visit181_459_1(visit182_459_2(dest.nodeType === NodeType.ELEMENT_NODE) && !Dom.hasData(src))) {
      _$jscoverage['/base/create.js'].lineData[460]++;
      return;
    }
    _$jscoverage['/base/create.js'].lineData[463]++;
    srcData = Dom.data(src);
    _$jscoverage['/base/create.js'].lineData[466]++;
    for (d in srcData) {
      _$jscoverage['/base/create.js'].lineData[467]++;
      Dom.data(dest, d, srcData[d]);
    }
    _$jscoverage['/base/create.js'].lineData[471]++;
    if (visit183_471_1(DOMEvent)) {
      _$jscoverage['/base/create.js'].lineData[473]++;
      DOMEvent.clone(src, dest);
    }
  }
  _$jscoverage['/base/create.js'].lineData[478]++;
  function attachProps(elem, props) {
    _$jscoverage['/base/create.js'].functionData[15]++;
    _$jscoverage['/base/create.js'].lineData[479]++;
    if (visit184_479_1(S.isPlainObject(props))) {
      _$jscoverage['/base/create.js'].lineData[480]++;
      if (visit185_480_1(elem.nodeType === NodeType.ELEMENT_NODE)) {
        _$jscoverage['/base/create.js'].lineData[481]++;
        Dom.attr(elem, props, true);
      } else {
        _$jscoverage['/base/create.js'].lineData[482]++;
        if (visit186_482_1(elem.nodeType === NodeType.DOCUMENT_FRAGMENT_NODE)) {
          _$jscoverage['/base/create.js'].lineData[484]++;
          Dom.attr(elem.childNodes, props, true);
        }
      }
    }
    _$jscoverage['/base/create.js'].lineData[487]++;
    return elem;
  }
  _$jscoverage['/base/create.js'].lineData[491]++;
  function nodeListToFragment(nodes) {
    _$jscoverage['/base/create.js'].functionData[16]++;
    _$jscoverage['/base/create.js'].lineData[492]++;
    var ret = null, i, ownerDoc, len;
    _$jscoverage['/base/create.js'].lineData[496]++;
    if (visit187_496_1(nodes && visit188_496_2((visit189_496_3(nodes.push || nodes.item)) && nodes[0]))) {
      _$jscoverage['/base/create.js'].lineData[497]++;
      ownerDoc = nodes[0].ownerDocument;
      _$jscoverage['/base/create.js'].lineData[498]++;
      ret = ownerDoc.createDocumentFragment();
      _$jscoverage['/base/create.js'].lineData[499]++;
      nodes = S.makeArray(nodes);
      _$jscoverage['/base/create.js'].lineData[500]++;
      for (i = 0 , len = nodes.length; visit190_500_1(i < len); i++) {
        _$jscoverage['/base/create.js'].lineData[501]++;
        ret.appendChild(nodes[i]);
      }
    } else {
      _$jscoverage['/base/create.js'].lineData[504]++;
      logger.error('Unable to convert ' + nodes + ' to fragment.');
    }
    _$jscoverage['/base/create.js'].lineData[506]++;
    return ret;
  }
  _$jscoverage['/base/create.js'].lineData[510]++;
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
  _$jscoverage['/base/create.js'].lineData[526]++;
  for (p in creatorsMap) {
    _$jscoverage['/base/create.js'].lineData[528]++;
    (function(tag) {
  _$jscoverage['/base/create.js'].functionData[17]++;
  _$jscoverage['/base/create.js'].lineData[529]++;
  creators[p] = function(html, ownerDoc) {
  _$jscoverage['/base/create.js'].functionData[18]++;
  _$jscoverage['/base/create.js'].lineData[530]++;
  return create('<' + tag + '>' + html + '<' + '/' + tag + '>', undefined, ownerDoc);
};
})(creatorsMap[p]);
  }
  _$jscoverage['/base/create.js'].lineData[538]++;
  creators.option = creators.optgroup = function(html, ownerDoc) {
  _$jscoverage['/base/create.js'].functionData[19]++;
  _$jscoverage['/base/create.js'].lineData[539]++;
  return create('<select multiple="multiple">' + html + '</select>', undefined, ownerDoc);
};
  _$jscoverage['/base/create.js'].lineData[542]++;
  return Dom;
});
