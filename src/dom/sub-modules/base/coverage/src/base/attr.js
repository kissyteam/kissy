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
if (! _$jscoverage['/base/attr.js']) {
  _$jscoverage['/base/attr.js'] = {};
  _$jscoverage['/base/attr.js'].lineData = [];
  _$jscoverage['/base/attr.js'].lineData[6] = 0;
  _$jscoverage['/base/attr.js'].lineData[7] = 0;
  _$jscoverage['/base/attr.js'].lineData[8] = 0;
  _$jscoverage['/base/attr.js'].lineData[39] = 0;
  _$jscoverage['/base/attr.js'].lineData[40] = 0;
  _$jscoverage['/base/attr.js'].lineData[74] = 0;
  _$jscoverage['/base/attr.js'].lineData[80] = 0;
  _$jscoverage['/base/attr.js'].lineData[81] = 0;
  _$jscoverage['/base/attr.js'].lineData[83] = 0;
  _$jscoverage['/base/attr.js'].lineData[86] = 0;
  _$jscoverage['/base/attr.js'].lineData[87] = 0;
  _$jscoverage['/base/attr.js'].lineData[89] = 0;
  _$jscoverage['/base/attr.js'].lineData[91] = 0;
  _$jscoverage['/base/attr.js'].lineData[93] = 0;
  _$jscoverage['/base/attr.js'].lineData[109] = 0;
  _$jscoverage['/base/attr.js'].lineData[117] = 0;
  _$jscoverage['/base/attr.js'].lineData[118] = 0;
  _$jscoverage['/base/attr.js'].lineData[119] = 0;
  _$jscoverage['/base/attr.js'].lineData[120] = 0;
  _$jscoverage['/base/attr.js'].lineData[124] = 0;
  _$jscoverage['/base/attr.js'].lineData[125] = 0;
  _$jscoverage['/base/attr.js'].lineData[126] = 0;
  _$jscoverage['/base/attr.js'].lineData[127] = 0;
  _$jscoverage['/base/attr.js'].lineData[128] = 0;
  _$jscoverage['/base/attr.js'].lineData[129] = 0;
  _$jscoverage['/base/attr.js'].lineData[133] = 0;
  _$jscoverage['/base/attr.js'].lineData[137] = 0;
  _$jscoverage['/base/attr.js'].lineData[139] = 0;
  _$jscoverage['/base/attr.js'].lineData[140] = 0;
  _$jscoverage['/base/attr.js'].lineData[143] = 0;
  _$jscoverage['/base/attr.js'].lineData[144] = 0;
  _$jscoverage['/base/attr.js'].lineData[146] = 0;
  _$jscoverage['/base/attr.js'].lineData[153] = 0;
  _$jscoverage['/base/attr.js'].lineData[154] = 0;
  _$jscoverage['/base/attr.js'].lineData[158] = 0;
  _$jscoverage['/base/attr.js'].lineData[161] = 0;
  _$jscoverage['/base/attr.js'].lineData[162] = 0;
  _$jscoverage['/base/attr.js'].lineData[163] = 0;
  _$jscoverage['/base/attr.js'].lineData[165] = 0;
  _$jscoverage['/base/attr.js'].lineData[172] = 0;
  _$jscoverage['/base/attr.js'].lineData[174] = 0;
  _$jscoverage['/base/attr.js'].lineData[178] = 0;
  _$jscoverage['/base/attr.js'].lineData[179] = 0;
  _$jscoverage['/base/attr.js'].lineData[183] = 0;
  _$jscoverage['/base/attr.js'].lineData[184] = 0;
  _$jscoverage['/base/attr.js'].lineData[185] = 0;
  _$jscoverage['/base/attr.js'].lineData[186] = 0;
  _$jscoverage['/base/attr.js'].lineData[187] = 0;
  _$jscoverage['/base/attr.js'].lineData[189] = 0;
  _$jscoverage['/base/attr.js'].lineData[193] = 0;
  _$jscoverage['/base/attr.js'].lineData[226] = 0;
  _$jscoverage['/base/attr.js'].lineData[232] = 0;
  _$jscoverage['/base/attr.js'].lineData[233] = 0;
  _$jscoverage['/base/attr.js'].lineData[234] = 0;
  _$jscoverage['/base/attr.js'].lineData[236] = 0;
  _$jscoverage['/base/attr.js'].lineData[240] = 0;
  _$jscoverage['/base/attr.js'].lineData[241] = 0;
  _$jscoverage['/base/attr.js'].lineData[242] = 0;
  _$jscoverage['/base/attr.js'].lineData[243] = 0;
  _$jscoverage['/base/attr.js'].lineData[244] = 0;
  _$jscoverage['/base/attr.js'].lineData[245] = 0;
  _$jscoverage['/base/attr.js'].lineData[246] = 0;
  _$jscoverage['/base/attr.js'].lineData[248] = 0;
  _$jscoverage['/base/attr.js'].lineData[252] = 0;
  _$jscoverage['/base/attr.js'].lineData[253] = 0;
  _$jscoverage['/base/attr.js'].lineData[256] = 0;
  _$jscoverage['/base/attr.js'].lineData[266] = 0;
  _$jscoverage['/base/attr.js'].lineData[270] = 0;
  _$jscoverage['/base/attr.js'].lineData[271] = 0;
  _$jscoverage['/base/attr.js'].lineData[272] = 0;
  _$jscoverage['/base/attr.js'].lineData[273] = 0;
  _$jscoverage['/base/attr.js'].lineData[276] = 0;
  _$jscoverage['/base/attr.js'].lineData[285] = 0;
  _$jscoverage['/base/attr.js'].lineData[286] = 0;
  _$jscoverage['/base/attr.js'].lineData[289] = 0;
  _$jscoverage['/base/attr.js'].lineData[290] = 0;
  _$jscoverage['/base/attr.js'].lineData[291] = 0;
  _$jscoverage['/base/attr.js'].lineData[292] = 0;
  _$jscoverage['/base/attr.js'].lineData[293] = 0;
  _$jscoverage['/base/attr.js'].lineData[341] = 0;
  _$jscoverage['/base/attr.js'].lineData[348] = 0;
  _$jscoverage['/base/attr.js'].lineData[349] = 0;
  _$jscoverage['/base/attr.js'].lineData[350] = 0;
  _$jscoverage['/base/attr.js'].lineData[351] = 0;
  _$jscoverage['/base/attr.js'].lineData[353] = 0;
  _$jscoverage['/base/attr.js'].lineData[357] = 0;
  _$jscoverage['/base/attr.js'].lineData[358] = 0;
  _$jscoverage['/base/attr.js'].lineData[362] = 0;
  _$jscoverage['/base/attr.js'].lineData[364] = 0;
  _$jscoverage['/base/attr.js'].lineData[365] = 0;
  _$jscoverage['/base/attr.js'].lineData[369] = 0;
  _$jscoverage['/base/attr.js'].lineData[371] = 0;
  _$jscoverage['/base/attr.js'].lineData[372] = 0;
  _$jscoverage['/base/attr.js'].lineData[375] = 0;
  _$jscoverage['/base/attr.js'].lineData[376] = 0;
  _$jscoverage['/base/attr.js'].lineData[378] = 0;
  _$jscoverage['/base/attr.js'].lineData[381] = 0;
  _$jscoverage['/base/attr.js'].lineData[382] = 0;
  _$jscoverage['/base/attr.js'].lineData[384] = 0;
  _$jscoverage['/base/attr.js'].lineData[385] = 0;
  _$jscoverage['/base/attr.js'].lineData[387] = 0;
  _$jscoverage['/base/attr.js'].lineData[388] = 0;
  _$jscoverage['/base/attr.js'].lineData[391] = 0;
  _$jscoverage['/base/attr.js'].lineData[393] = 0;
  _$jscoverage['/base/attr.js'].lineData[394] = 0;
  _$jscoverage['/base/attr.js'].lineData[395] = 0;
  _$jscoverage['/base/attr.js'].lineData[396] = 0;
  _$jscoverage['/base/attr.js'].lineData[403] = 0;
  _$jscoverage['/base/attr.js'].lineData[406] = 0;
  _$jscoverage['/base/attr.js'].lineData[407] = 0;
  _$jscoverage['/base/attr.js'].lineData[408] = 0;
  _$jscoverage['/base/attr.js'].lineData[409] = 0;
  _$jscoverage['/base/attr.js'].lineData[410] = 0;
  _$jscoverage['/base/attr.js'].lineData[412] = 0;
  _$jscoverage['/base/attr.js'].lineData[413] = 0;
  _$jscoverage['/base/attr.js'].lineData[416] = 0;
  _$jscoverage['/base/attr.js'].lineData[421] = 0;
  _$jscoverage['/base/attr.js'].lineData[430] = 0;
  _$jscoverage['/base/attr.js'].lineData[431] = 0;
  _$jscoverage['/base/attr.js'].lineData[432] = 0;
  _$jscoverage['/base/attr.js'].lineData[435] = 0;
  _$jscoverage['/base/attr.js'].lineData[436] = 0;
  _$jscoverage['/base/attr.js'].lineData[437] = 0;
  _$jscoverage['/base/attr.js'].lineData[438] = 0;
  _$jscoverage['/base/attr.js'].lineData[440] = 0;
  _$jscoverage['/base/attr.js'].lineData[441] = 0;
  _$jscoverage['/base/attr.js'].lineData[456] = 0;
  _$jscoverage['/base/attr.js'].lineData[457] = 0;
  _$jscoverage['/base/attr.js'].lineData[463] = 0;
  _$jscoverage['/base/attr.js'].lineData[464] = 0;
  _$jscoverage['/base/attr.js'].lineData[465] = 0;
  _$jscoverage['/base/attr.js'].lineData[466] = 0;
  _$jscoverage['/base/attr.js'].lineData[467] = 0;
  _$jscoverage['/base/attr.js'].lineData[470] = 0;
  _$jscoverage['/base/attr.js'].lineData[473] = 0;
  _$jscoverage['/base/attr.js'].lineData[475] = 0;
  _$jscoverage['/base/attr.js'].lineData[477] = 0;
  _$jscoverage['/base/attr.js'].lineData[478] = 0;
  _$jscoverage['/base/attr.js'].lineData[481] = 0;
  _$jscoverage['/base/attr.js'].lineData[493] = 0;
  _$jscoverage['/base/attr.js'].lineData[496] = 0;
  _$jscoverage['/base/attr.js'].lineData[498] = 0;
  _$jscoverage['/base/attr.js'].lineData[500] = 0;
  _$jscoverage['/base/attr.js'].lineData[501] = 0;
  _$jscoverage['/base/attr.js'].lineData[503] = 0;
  _$jscoverage['/base/attr.js'].lineData[505] = 0;
  _$jscoverage['/base/attr.js'].lineData[508] = 0;
  _$jscoverage['/base/attr.js'].lineData[510] = 0;
  _$jscoverage['/base/attr.js'].lineData[517] = 0;
  _$jscoverage['/base/attr.js'].lineData[520] = 0;
  _$jscoverage['/base/attr.js'].lineData[521] = 0;
  _$jscoverage['/base/attr.js'].lineData[522] = 0;
  _$jscoverage['/base/attr.js'].lineData[523] = 0;
  _$jscoverage['/base/attr.js'].lineData[524] = 0;
  _$jscoverage['/base/attr.js'].lineData[527] = 0;
  _$jscoverage['/base/attr.js'].lineData[530] = 0;
  _$jscoverage['/base/attr.js'].lineData[531] = 0;
  _$jscoverage['/base/attr.js'].lineData[532] = 0;
  _$jscoverage['/base/attr.js'].lineData[533] = 0;
  _$jscoverage['/base/attr.js'].lineData[534] = 0;
  _$jscoverage['/base/attr.js'].lineData[535] = 0;
  _$jscoverage['/base/attr.js'].lineData[538] = 0;
  _$jscoverage['/base/attr.js'].lineData[541] = 0;
  _$jscoverage['/base/attr.js'].lineData[542] = 0;
  _$jscoverage['/base/attr.js'].lineData[545] = 0;
  _$jscoverage['/base/attr.js'].lineData[557] = 0;
  _$jscoverage['/base/attr.js'].lineData[559] = 0;
  _$jscoverage['/base/attr.js'].lineData[561] = 0;
  _$jscoverage['/base/attr.js'].lineData[562] = 0;
  _$jscoverage['/base/attr.js'].lineData[564] = 0;
  _$jscoverage['/base/attr.js'].lineData[565] = 0;
  _$jscoverage['/base/attr.js'].lineData[566] = 0;
  _$jscoverage['/base/attr.js'].lineData[567] = 0;
  _$jscoverage['/base/attr.js'].lineData[568] = 0;
  _$jscoverage['/base/attr.js'].lineData[569] = 0;
  _$jscoverage['/base/attr.js'].lineData[570] = 0;
  _$jscoverage['/base/attr.js'].lineData[571] = 0;
  _$jscoverage['/base/attr.js'].lineData[573] = 0;
  _$jscoverage['/base/attr.js'].lineData[576] = 0;
  _$jscoverage['/base/attr.js'].lineData[577] = 0;
  _$jscoverage['/base/attr.js'].lineData[581] = 0;
  _$jscoverage['/base/attr.js'].lineData[585] = 0;
  _$jscoverage['/base/attr.js'].lineData[589] = 0;
}
if (! _$jscoverage['/base/attr.js'].functionData) {
  _$jscoverage['/base/attr.js'].functionData = [];
  _$jscoverage['/base/attr.js'].functionData[0] = 0;
  _$jscoverage['/base/attr.js'].functionData[1] = 0;
  _$jscoverage['/base/attr.js'].functionData[2] = 0;
  _$jscoverage['/base/attr.js'].functionData[3] = 0;
  _$jscoverage['/base/attr.js'].functionData[4] = 0;
  _$jscoverage['/base/attr.js'].functionData[5] = 0;
  _$jscoverage['/base/attr.js'].functionData[6] = 0;
  _$jscoverage['/base/attr.js'].functionData[7] = 0;
  _$jscoverage['/base/attr.js'].functionData[8] = 0;
  _$jscoverage['/base/attr.js'].functionData[9] = 0;
  _$jscoverage['/base/attr.js'].functionData[10] = 0;
  _$jscoverage['/base/attr.js'].functionData[11] = 0;
  _$jscoverage['/base/attr.js'].functionData[12] = 0;
  _$jscoverage['/base/attr.js'].functionData[13] = 0;
  _$jscoverage['/base/attr.js'].functionData[14] = 0;
  _$jscoverage['/base/attr.js'].functionData[15] = 0;
  _$jscoverage['/base/attr.js'].functionData[16] = 0;
  _$jscoverage['/base/attr.js'].functionData[17] = 0;
  _$jscoverage['/base/attr.js'].functionData[18] = 0;
  _$jscoverage['/base/attr.js'].functionData[19] = 0;
  _$jscoverage['/base/attr.js'].functionData[20] = 0;
  _$jscoverage['/base/attr.js'].functionData[21] = 0;
  _$jscoverage['/base/attr.js'].functionData[22] = 0;
  _$jscoverage['/base/attr.js'].functionData[23] = 0;
}
if (! _$jscoverage['/base/attr.js'].branchData) {
  _$jscoverage['/base/attr.js'].branchData = {};
  _$jscoverage['/base/attr.js'].branchData['10'] = [];
  _$jscoverage['/base/attr.js'].branchData['10'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['40'] = [];
  _$jscoverage['/base/attr.js'].branchData['40'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['42'] = [];
  _$jscoverage['/base/attr.js'].branchData['42'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['43'] = [];
  _$jscoverage['/base/attr.js'].branchData['43'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['81'] = [];
  _$jscoverage['/base/attr.js'].branchData['81'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['86'] = [];
  _$jscoverage['/base/attr.js'].branchData['86'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['87'] = [];
  _$jscoverage['/base/attr.js'].branchData['87'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['114'] = [];
  _$jscoverage['/base/attr.js'].branchData['114'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['117'] = [];
  _$jscoverage['/base/attr.js'].branchData['117'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['119'] = [];
  _$jscoverage['/base/attr.js'].branchData['119'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['127'] = [];
  _$jscoverage['/base/attr.js'].branchData['127'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['128'] = [];
  _$jscoverage['/base/attr.js'].branchData['128'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['143'] = [];
  _$jscoverage['/base/attr.js'].branchData['143'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['158'] = [];
  _$jscoverage['/base/attr.js'].branchData['158'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['161'] = [];
  _$jscoverage['/base/attr.js'].branchData['161'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['179'] = [];
  _$jscoverage['/base/attr.js'].branchData['179'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['184'] = [];
  _$jscoverage['/base/attr.js'].branchData['184'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['186'] = [];
  _$jscoverage['/base/attr.js'].branchData['186'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['232'] = [];
  _$jscoverage['/base/attr.js'].branchData['232'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['240'] = [];
  _$jscoverage['/base/attr.js'].branchData['240'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['242'] = [];
  _$jscoverage['/base/attr.js'].branchData['242'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['243'] = [];
  _$jscoverage['/base/attr.js'].branchData['243'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['245'] = [];
  _$jscoverage['/base/attr.js'].branchData['245'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['252'] = [];
  _$jscoverage['/base/attr.js'].branchData['252'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['270'] = [];
  _$jscoverage['/base/attr.js'].branchData['270'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['272'] = [];
  _$jscoverage['/base/attr.js'].branchData['272'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['285'] = [];
  _$jscoverage['/base/attr.js'].branchData['285'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['289'] = [];
  _$jscoverage['/base/attr.js'].branchData['289'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['348'] = [];
  _$jscoverage['/base/attr.js'].branchData['348'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['357'] = [];
  _$jscoverage['/base/attr.js'].branchData['357'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['364'] = [];
  _$jscoverage['/base/attr.js'].branchData['364'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['369'] = [];
  _$jscoverage['/base/attr.js'].branchData['369'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['371'] = [];
  _$jscoverage['/base/attr.js'].branchData['371'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['375'] = [];
  _$jscoverage['/base/attr.js'].branchData['375'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['381'] = [];
  _$jscoverage['/base/attr.js'].branchData['381'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['382'] = [];
  _$jscoverage['/base/attr.js'].branchData['382'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['382'][2] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['384'] = [];
  _$jscoverage['/base/attr.js'].branchData['384'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['387'] = [];
  _$jscoverage['/base/attr.js'].branchData['387'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['393'] = [];
  _$jscoverage['/base/attr.js'].branchData['393'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['395'] = [];
  _$jscoverage['/base/attr.js'].branchData['395'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['403'] = [];
  _$jscoverage['/base/attr.js'].branchData['403'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['406'] = [];
  _$jscoverage['/base/attr.js'].branchData['406'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['408'] = [];
  _$jscoverage['/base/attr.js'].branchData['408'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['408'][2] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['409'] = [];
  _$jscoverage['/base/attr.js'].branchData['409'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['412'] = [];
  _$jscoverage['/base/attr.js'].branchData['412'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['431'] = [];
  _$jscoverage['/base/attr.js'].branchData['431'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['435'] = [];
  _$jscoverage['/base/attr.js'].branchData['435'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['437'] = [];
  _$jscoverage['/base/attr.js'].branchData['437'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['440'] = [];
  _$jscoverage['/base/attr.js'].branchData['440'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['440'][2] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['454'] = [];
  _$jscoverage['/base/attr.js'].branchData['454'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['463'] = [];
  _$jscoverage['/base/attr.js'].branchData['463'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['466'] = [];
  _$jscoverage['/base/attr.js'].branchData['466'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['475'] = [];
  _$jscoverage['/base/attr.js'].branchData['475'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['477'] = [];
  _$jscoverage['/base/attr.js'].branchData['477'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['496'] = [];
  _$jscoverage['/base/attr.js'].branchData['496'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['500'] = [];
  _$jscoverage['/base/attr.js'].branchData['500'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['501'] = [];
  _$jscoverage['/base/attr.js'].branchData['501'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['503'] = [];
  _$jscoverage['/base/attr.js'].branchData['503'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['503'][2] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['504'] = [];
  _$jscoverage['/base/attr.js'].branchData['504'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['510'] = [];
  _$jscoverage['/base/attr.js'].branchData['510'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['514'] = [];
  _$jscoverage['/base/attr.js'].branchData['514'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['521'] = [];
  _$jscoverage['/base/attr.js'].branchData['521'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['523'] = [];
  _$jscoverage['/base/attr.js'].branchData['523'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['530'] = [];
  _$jscoverage['/base/attr.js'].branchData['530'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['532'] = [];
  _$jscoverage['/base/attr.js'].branchData['532'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['534'] = [];
  _$jscoverage['/base/attr.js'].branchData['534'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['538'] = [];
  _$jscoverage['/base/attr.js'].branchData['538'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['541'] = [];
  _$jscoverage['/base/attr.js'].branchData['541'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['541'][2] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['541'][3] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['559'] = [];
  _$jscoverage['/base/attr.js'].branchData['559'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['565'] = [];
  _$jscoverage['/base/attr.js'].branchData['565'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['568'] = [];
  _$jscoverage['/base/attr.js'].branchData['568'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['570'] = [];
  _$jscoverage['/base/attr.js'].branchData['570'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['576'] = [];
  _$jscoverage['/base/attr.js'].branchData['576'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['576'][2] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['576'][3] = new BranchData();
}
_$jscoverage['/base/attr.js'].branchData['576'][3].init(548, 40, 'nodeType === NodeType.CDATA_SECTION_NODE');
function visit100_576_3(result) {
  _$jscoverage['/base/attr.js'].branchData['576'][3].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['576'][2].init(513, 31, 'nodeType === NodeType.TEXT_NODE');
function visit99_576_2(result) {
  _$jscoverage['/base/attr.js'].branchData['576'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['576'][1].init(513, 75, 'nodeType === NodeType.TEXT_NODE || nodeType === NodeType.CDATA_SECTION_NODE');
function visit98_576_1(result) {
  _$jscoverage['/base/attr.js'].branchData['576'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['570'][1].init(106, 19, '\'textContent\' in el');
function visit97_570_1(result) {
  _$jscoverage['/base/attr.js'].branchData['570'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['568'][1].init(114, 34, 'nodeType === NodeType.ELEMENT_NODE');
function visit96_568_1(result) {
  _$jscoverage['/base/attr.js'].branchData['568'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['565'][1].init(93, 6, 'i >= 0');
function visit95_565_1(result) {
  _$jscoverage['/base/attr.js'].branchData['565'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['559'][1].init(89, 17, 'val === undefined');
function visit94_559_1(result) {
  _$jscoverage['/base/attr.js'].branchData['559'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['541'][3].init(756, 42, 'hook.set(elem, val, \'value\') === undefined');
function visit93_541_3(result) {
  _$jscoverage['/base/attr.js'].branchData['541'][3].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['541'][2].init(736, 62, '!(\'set\' in hook) || hook.set(elem, val, \'value\') === undefined');
function visit92_541_2(result) {
  _$jscoverage['/base/attr.js'].branchData['541'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['541'][1].init(727, 71, '!hook || !(\'set\' in hook) || hook.set(elem, val, \'value\') === undefined');
function visit91_541_1(result) {
  _$jscoverage['/base/attr.js'].branchData['541'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['538'][1].init(573, 50, 'valHooks[nodeName(elem)] || valHooks[elem.type]');
function visit90_538_1(result) {
  _$jscoverage['/base/attr.js'].branchData['538'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['534'][1].init(458, 14, 'S.isArray(val)');
function visit89_534_1(result) {
  _$jscoverage['/base/attr.js'].branchData['534'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['532'][1].init(364, 23, 'typeof val === \'number\'');
function visit88_532_1(result) {
  _$jscoverage['/base/attr.js'].branchData['532'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['530'][1].init(283, 11, 'val == null');
function visit87_530_1(result) {
  _$jscoverage['/base/attr.js'].branchData['530'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['523'][1].init(60, 19, 'elem.nodeType !== 1');
function visit86_523_1(result) {
  _$jscoverage['/base/attr.js'].branchData['523'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['521'][1].init(1001, 6, 'i >= 0');
function visit85_521_1(result) {
  _$jscoverage['/base/attr.js'].branchData['521'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['514'][1].init(256, 11, 'ret == null');
function visit84_514_1(result) {
  _$jscoverage['/base/attr.js'].branchData['514'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['510'][1].init(357, 23, 'typeof ret === \'string\'');
function visit83_510_1(result) {
  _$jscoverage['/base/attr.js'].branchData['510'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['504'][1].init(45, 44, '(ret = hook.get(elem, \'value\')) !== undefined');
function visit82_504_1(result) {
  _$jscoverage['/base/attr.js'].branchData['504'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['503'][2].init(122, 90, '\'get\' in hook && (ret = hook.get(elem, \'value\')) !== undefined');
function visit81_503_2(result) {
  _$jscoverage['/base/attr.js'].branchData['503'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['503'][1].init(114, 98, 'hook && \'get\' in hook && (ret = hook.get(elem, \'value\')) !== undefined');
function visit80_503_1(result) {
  _$jscoverage['/base/attr.js'].branchData['503'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['501'][1].init(32, 51, 'valHooks[nodeName(elem)] || valHooks[elem.type]');
function visit79_501_1(result) {
  _$jscoverage['/base/attr.js'].branchData['501'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['500'][1].init(73, 4, 'elem');
function visit78_500_1(result) {
  _$jscoverage['/base/attr.js'].branchData['500'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['496'][1].init(97, 19, 'value === undefined');
function visit77_496_1(result) {
  _$jscoverage['/base/attr.js'].branchData['496'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['477'][1].init(62, 27, 'elems[i].hasAttribute(name)');
function visit76_477_1(result) {
  _$jscoverage['/base/attr.js'].branchData['477'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['475'][1].init(133, 7, 'i < len');
function visit75_475_1(result) {
  _$jscoverage['/base/attr.js'].branchData['475'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['466'][1].init(130, 30, 'attrNode && attrNode.specified');
function visit74_466_1(result) {
  _$jscoverage['/base/attr.js'].branchData['466'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['463'][1].init(407, 16, 'i < elems.length');
function visit73_463_1(result) {
  _$jscoverage['/base/attr.js'].branchData['463'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['454'][1].init(10262, 38, 'docElement && !docElement.hasAttribute');
function visit72_454_1(result) {
  _$jscoverage['/base/attr.js'].branchData['454'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['440'][2].init(201, 23, 'propFix[name] || name');
function visit71_440_2(result) {
  _$jscoverage['/base/attr.js'].branchData['440'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['440'][1].init(165, 66, 'R_BOOLEAN.test(name) && (propName = propFix[name] || name) in el');
function visit70_440_1(result) {
  _$jscoverage['/base/attr.js'].branchData['440'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['437'][1].init(58, 37, 'el.nodeType === NodeType.ELEMENT_NODE');
function visit69_437_1(result) {
  _$jscoverage['/base/attr.js'].branchData['437'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['435'][1].init(235, 6, 'i >= 0');
function visit68_435_1(result) {
  _$jscoverage['/base/attr.js'].branchData['435'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['431'][1].init(67, 21, 'attrFix[name] || name');
function visit67_431_1(result) {
  _$jscoverage['/base/attr.js'].branchData['431'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['412'][1].init(185, 36, 'attrNormalizer && attrNormalizer.set');
function visit66_412_1(result) {
  _$jscoverage['/base/attr.js'].branchData['412'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['409'][1].init(33, 23, 'nodeName(el) === \'form\'');
function visit65_409_1(result) {
  _$jscoverage['/base/attr.js'].branchData['409'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['408'][2].init(72, 37, 'el.nodeType === NodeType.ELEMENT_NODE');
function visit64_408_2(result) {
  _$jscoverage['/base/attr.js'].branchData['408'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['408'][1].init(66, 43, 'el && el.nodeType === NodeType.ELEMENT_NODE');
function visit63_408_1(result) {
  _$jscoverage['/base/attr.js'].branchData['408'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['406'][1].init(46, 6, 'i >= 0');
function visit62_406_1(result) {
  _$jscoverage['/base/attr.js'].branchData['406'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['403'][1].init(984, 12, 'ret === null');
function visit61_403_1(result) {
  _$jscoverage['/base/attr.js'].branchData['403'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['395'][1].init(103, 32, '!attrNode || !attrNode.specified');
function visit60_395_1(result) {
  _$jscoverage['/base/attr.js'].branchData['395'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['393'][1].init(484, 10, 'ret === \'\'');
function visit59_393_1(result) {
  _$jscoverage['/base/attr.js'].branchData['393'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['387'][1].init(270, 36, 'attrNormalizer && attrNormalizer.get');
function visit58_387_1(result) {
  _$jscoverage['/base/attr.js'].branchData['387'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['384'][1].init(130, 23, 'nodeName(el) === \'form\'');
function visit57_384_1(result) {
  _$jscoverage['/base/attr.js'].branchData['384'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['382'][2].init(31, 37, 'el.nodeType === NodeType.ELEMENT_NODE');
function visit56_382_2(result) {
  _$jscoverage['/base/attr.js'].branchData['382'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['382'][1].init(25, 43, 'el && el.nodeType === NodeType.ELEMENT_NODE');
function visit55_382_1(result) {
  _$jscoverage['/base/attr.js'].branchData['382'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['381'][1].init(2870, 17, 'val === undefined');
function visit54_381_1(result) {
  _$jscoverage['/base/attr.js'].branchData['381'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['375'][1].init(2673, 25, 'R_INVALID_CHAR.test(name)');
function visit53_375_1(result) {
  _$jscoverage['/base/attr.js'].branchData['375'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['371'][1].init(2526, 20, 'R_BOOLEAN.test(name)');
function visit52_371_1(result) {
  _$jscoverage['/base/attr.js'].branchData['371'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['369'][1].init(2482, 21, 'attrFix[name] || name');
function visit51_369_1(result) {
  _$jscoverage['/base/attr.js'].branchData['369'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['364'][1].init(2331, 20, 'pass && attrFn[name]');
function visit50_364_1(result) {
  _$jscoverage['/base/attr.js'].branchData['364'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['357'][1].init(2141, 20, 'pass && attrFn[name]');
function visit49_357_1(result) {
  _$jscoverage['/base/attr.js'].branchData['357'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['348'][1].init(1852, 21, 'S.isPlainObject(name)');
function visit48_348_1(result) {
  _$jscoverage['/base/attr.js'].branchData['348'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['289'][1].init(188, 6, 'i >= 0');
function visit47_289_1(result) {
  _$jscoverage['/base/attr.js'].branchData['289'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['285'][1].init(24, 23, 'propFix[name] || name');
function visit46_285_1(result) {
  _$jscoverage['/base/attr.js'].branchData['285'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['272'][1].init(60, 31, 'getProp(el, name) !== undefined');
function visit45_272_1(result) {
  _$jscoverage['/base/attr.js'].branchData['272'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['270'][1].init(165, 7, 'i < len');
function visit44_270_1(result) {
  _$jscoverage['/base/attr.js'].branchData['270'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['252'][1].init(25, 12, 'elems.length');
function visit43_252_1(result) {
  _$jscoverage['/base/attr.js'].branchData['252'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['245'][1].init(70, 16, 'hook && hook.set');
function visit42_245_1(result) {
  _$jscoverage['/base/attr.js'].branchData['245'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['243'][1].init(48, 6, 'i >= 0');
function visit41_243_1(result) {
  _$jscoverage['/base/attr.js'].branchData['243'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['242'][1].init(542, 19, 'value !== undefined');
function visit40_242_1(result) {
  _$jscoverage['/base/attr.js'].branchData['242'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['240'][1].init(455, 23, 'propFix[name] || name');
function visit39_240_1(result) {
  _$jscoverage['/base/attr.js'].branchData['240'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['232'][1].init(179, 21, 'S.isPlainObject(name)');
function visit38_232_1(result) {
  _$jscoverage['/base/attr.js'].branchData['232'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['186'][1].init(87, 16, 'hook && hook.get');
function visit37_186_1(result) {
  _$jscoverage['/base/attr.js'].branchData['186'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['184'][1].init(16, 21, 'propFix[name] || name');
function visit36_184_1(result) {
  _$jscoverage['/base/attr.js'].branchData['184'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['179'][1].init(16, 13, 'value == null');
function visit35_179_1(result) {
  _$jscoverage['/base/attr.js'].branchData['179'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['161'][1].init(21, 16, 'S.isArray(value)');
function visit34_161_1(result) {
  _$jscoverage['/base/attr.js'].branchData['161'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['158'][1].init(152, 35, 'elem.getAttribute(\'value\') === null');
function visit33_158_1(result) {
  _$jscoverage['/base/attr.js'].branchData['158'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['143'][1].init(270, 14, '!values.length');
function visit32_143_1(result) {
  _$jscoverage['/base/attr.js'].branchData['143'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['128'][1].init(29, 19, 'options[i].selected');
function visit31_128_1(result) {
  _$jscoverage['/base/attr.js'].branchData['128'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['127'][1].init(677, 7, 'i < len');
function visit30_127_1(result) {
  _$jscoverage['/base/attr.js'].branchData['127'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['119'][1].init(405, 3, 'one');
function visit29_119_1(result) {
  _$jscoverage['/base/attr.js'].branchData['119'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['117'][1].init(323, 9, 'index < 0');
function visit28_117_1(result) {
  _$jscoverage['/base/attr.js'].branchData['117'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['114'][1].init(195, 34, 'String(elem.type) === \'select-one\'');
function visit27_114_1(result) {
  _$jscoverage['/base/attr.js'].branchData['114'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['87'][1].init(128, 16, 'propName in elem');
function visit26_87_1(result) {
  _$jscoverage['/base/attr.js'].branchData['87'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['86'][1].init(79, 23, 'propFix[name] || name');
function visit25_86_1(result) {
  _$jscoverage['/base/attr.js'].branchData['86'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['81'][1].init(51, 15, 'value === false');
function visit24_81_1(result) {
  _$jscoverage['/base/attr.js'].branchData['81'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['43'][1].init(60, 40, 'R_CLICKABLE.test(el.nodeName) && el.href');
function visit23_43_1(result) {
  _$jscoverage['/base/attr.js'].branchData['43'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['42'][1].init(-1, 101, 'R_FOCUSABLE.test(el.nodeName) || R_CLICKABLE.test(el.nodeName) && el.href');
function visit22_42_1(result) {
  _$jscoverage['/base/attr.js'].branchData['42'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['40'][1].init(213, 40, 'attributeNode && attributeNode.specified');
function visit21_40_1(result) {
  _$jscoverage['/base/attr.js'].branchData['40'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['10'][1].init(84, 26, 'doc && doc.documentElement');
function visit20_10_1(result) {
  _$jscoverage['/base/attr.js'].branchData['10'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/base/attr.js'].functionData[0]++;
  _$jscoverage['/base/attr.js'].lineData[7]++;
  var Dom = require('./api');
  _$jscoverage['/base/attr.js'].lineData[8]++;
  var doc = S.Env.host.document, NodeType = Dom.NodeType, docElement = visit20_10_1(doc && doc.documentElement), EMPTY = '', nodeName = Dom.nodeName, R_BOOLEAN = /^(?:autofocus|autoplay|async|checked|controls|defer|disabled|hidden|loop|multiple|open|readonly|required|scoped|selected)$/i, R_FOCUSABLE = /^(?:button|input|object|select|textarea)$/i, R_CLICKABLE = /^a(?:rea)?$/i, R_INVALID_CHAR = /:|^on/, R_RETURN = /\r/g, attrFix = {}, attrFn = {
  val: 1, 
  css: 1, 
  html: 1, 
  text: 1, 
  data: 1, 
  width: 1, 
  height: 1, 
  offset: 1, 
  scrollTop: 1, 
  scrollLeft: 1}, attrHooks = {
  tabindex: {
  get: function(el) {
  _$jscoverage['/base/attr.js'].functionData[1]++;
  _$jscoverage['/base/attr.js'].lineData[39]++;
  var attributeNode = el.getAttributeNode('tabindex');
  _$jscoverage['/base/attr.js'].lineData[40]++;
  return visit21_40_1(attributeNode && attributeNode.specified) ? parseInt(attributeNode.value, 10) : visit22_42_1(R_FOCUSABLE.test(el.nodeName) || visit23_43_1(R_CLICKABLE.test(el.nodeName) && el.href)) ? 0 : undefined;
}}}, propFix = {
  'hidefocus': 'hideFocus', 
  tabindex: 'tabIndex', 
  readonly: 'readOnly', 
  'for': 'htmlFor', 
  'class': 'className', 
  maxlength: 'maxLength', 
  'cellspacing': 'cellSpacing', 
  'cellpadding': 'cellPadding', 
  rowspan: 'rowSpan', 
  colspan: 'colSpan', 
  usemap: 'useMap', 
  'frameborder': 'frameBorder', 
  'contenteditable': 'contentEditable'}, boolHook = {
  get: function(elem, name) {
  _$jscoverage['/base/attr.js'].functionData[2]++;
  _$jscoverage['/base/attr.js'].lineData[74]++;
  return Dom.prop(elem, name) ? name.toLowerCase() : undefined;
}, 
  set: function(elem, value, name) {
  _$jscoverage['/base/attr.js'].functionData[3]++;
  _$jscoverage['/base/attr.js'].lineData[80]++;
  var propName;
  _$jscoverage['/base/attr.js'].lineData[81]++;
  if (visit24_81_1(value === false)) {
    _$jscoverage['/base/attr.js'].lineData[83]++;
    Dom.removeAttr(elem, name);
  } else {
    _$jscoverage['/base/attr.js'].lineData[86]++;
    propName = visit25_86_1(propFix[name] || name);
    _$jscoverage['/base/attr.js'].lineData[87]++;
    if (visit26_87_1(propName in elem)) {
      _$jscoverage['/base/attr.js'].lineData[89]++;
      elem[propName] = true;
    }
    _$jscoverage['/base/attr.js'].lineData[91]++;
    elem.setAttribute(name, name.toLowerCase());
  }
  _$jscoverage['/base/attr.js'].lineData[93]++;
  return name;
}}, propHooks = {}, attrNodeHook = {}, valHooks = {
  select: {
  get: function(elem) {
  _$jscoverage['/base/attr.js'].functionData[4]++;
  _$jscoverage['/base/attr.js'].lineData[109]++;
  var index = elem.selectedIndex, options = elem.options, ret, i, len, one = (visit27_114_1(String(elem.type) === 'select-one'));
  _$jscoverage['/base/attr.js'].lineData[117]++;
  if (visit28_117_1(index < 0)) {
    _$jscoverage['/base/attr.js'].lineData[118]++;
    return null;
  } else {
    _$jscoverage['/base/attr.js'].lineData[119]++;
    if (visit29_119_1(one)) {
      _$jscoverage['/base/attr.js'].lineData[120]++;
      return Dom.val(options[index]);
    }
  }
  _$jscoverage['/base/attr.js'].lineData[124]++;
  ret = [];
  _$jscoverage['/base/attr.js'].lineData[125]++;
  i = 0;
  _$jscoverage['/base/attr.js'].lineData[126]++;
  len = options.length;
  _$jscoverage['/base/attr.js'].lineData[127]++;
  for (; visit30_127_1(i < len); ++i) {
    _$jscoverage['/base/attr.js'].lineData[128]++;
    if (visit31_128_1(options[i].selected)) {
      _$jscoverage['/base/attr.js'].lineData[129]++;
      ret.push(Dom.val(options[i]));
    }
  }
  _$jscoverage['/base/attr.js'].lineData[133]++;
  return ret;
}, 
  set: function(elem, value) {
  _$jscoverage['/base/attr.js'].functionData[5]++;
  _$jscoverage['/base/attr.js'].lineData[137]++;
  var values = S.makeArray(value), opts = elem.options;
  _$jscoverage['/base/attr.js'].lineData[139]++;
  S.each(opts, function(opt) {
  _$jscoverage['/base/attr.js'].functionData[6]++;
  _$jscoverage['/base/attr.js'].lineData[140]++;
  opt.selected = S.inArray(Dom.val(opt), values);
});
  _$jscoverage['/base/attr.js'].lineData[143]++;
  if (visit32_143_1(!values.length)) {
    _$jscoverage['/base/attr.js'].lineData[144]++;
    elem.selectedIndex = -1;
  }
  _$jscoverage['/base/attr.js'].lineData[146]++;
  return values;
}}};
  _$jscoverage['/base/attr.js'].lineData[153]++;
  S.each(['radio', 'checkbox'], function(r) {
  _$jscoverage['/base/attr.js'].functionData[7]++;
  _$jscoverage['/base/attr.js'].lineData[154]++;
  valHooks[r] = {
  get: function(elem) {
  _$jscoverage['/base/attr.js'].functionData[8]++;
  _$jscoverage['/base/attr.js'].lineData[158]++;
  return visit33_158_1(elem.getAttribute('value') === null) ? 'on' : elem.value;
}, 
  set: function(elem, value) {
  _$jscoverage['/base/attr.js'].functionData[9]++;
  _$jscoverage['/base/attr.js'].lineData[161]++;
  if (visit34_161_1(S.isArray(value))) {
    _$jscoverage['/base/attr.js'].lineData[162]++;
    elem.checked = S.inArray(Dom.val(elem), value);
    _$jscoverage['/base/attr.js'].lineData[163]++;
    return 1;
  }
  _$jscoverage['/base/attr.js'].lineData[165]++;
  return undefined;
}};
});
  _$jscoverage['/base/attr.js'].lineData[172]++;
  attrHooks.style = {
  get: function(el) {
  _$jscoverage['/base/attr.js'].functionData[10]++;
  _$jscoverage['/base/attr.js'].lineData[174]++;
  return el.style.cssText;
}};
  _$jscoverage['/base/attr.js'].lineData[178]++;
  function toStr(value) {
    _$jscoverage['/base/attr.js'].functionData[11]++;
    _$jscoverage['/base/attr.js'].lineData[179]++;
    return visit35_179_1(value == null) ? '' : value + '';
  }
  _$jscoverage['/base/attr.js'].lineData[183]++;
  function getProp(elem, name) {
    _$jscoverage['/base/attr.js'].functionData[12]++;
    _$jscoverage['/base/attr.js'].lineData[184]++;
    name = visit36_184_1(propFix[name] || name);
    _$jscoverage['/base/attr.js'].lineData[185]++;
    var hook = propHooks[name];
    _$jscoverage['/base/attr.js'].lineData[186]++;
    if (visit37_186_1(hook && hook.get)) {
      _$jscoverage['/base/attr.js'].lineData[187]++;
      return hook.get(elem, name);
    } else {
      _$jscoverage['/base/attr.js'].lineData[189]++;
      return elem[name];
    }
  }
  _$jscoverage['/base/attr.js'].lineData[193]++;
  S.mix(Dom, {
  _valHooks: valHooks, 
  _propFix: propFix, 
  _attrHooks: attrHooks, 
  _propHooks: propHooks, 
  _attrNodeHook: attrNodeHook, 
  _attrFix: attrFix, 
  prop: function(selector, name, value) {
  _$jscoverage['/base/attr.js'].functionData[13]++;
  _$jscoverage['/base/attr.js'].lineData[226]++;
  var elems = Dom.query(selector), i, elem, hook;
  _$jscoverage['/base/attr.js'].lineData[232]++;
  if (visit38_232_1(S.isPlainObject(name))) {
    _$jscoverage['/base/attr.js'].lineData[233]++;
    S.each(name, function(v, k) {
  _$jscoverage['/base/attr.js'].functionData[14]++;
  _$jscoverage['/base/attr.js'].lineData[234]++;
  Dom.prop(elems, k, v);
});
    _$jscoverage['/base/attr.js'].lineData[236]++;
    return undefined;
  }
  _$jscoverage['/base/attr.js'].lineData[240]++;
  name = visit39_240_1(propFix[name] || name);
  _$jscoverage['/base/attr.js'].lineData[241]++;
  hook = propHooks[name];
  _$jscoverage['/base/attr.js'].lineData[242]++;
  if (visit40_242_1(value !== undefined)) {
    _$jscoverage['/base/attr.js'].lineData[243]++;
    for (i = elems.length - 1; visit41_243_1(i >= 0); i--) {
      _$jscoverage['/base/attr.js'].lineData[244]++;
      elem = elems[i];
      _$jscoverage['/base/attr.js'].lineData[245]++;
      if (visit42_245_1(hook && hook.set)) {
        _$jscoverage['/base/attr.js'].lineData[246]++;
        hook.set(elem, value, name);
      } else {
        _$jscoverage['/base/attr.js'].lineData[248]++;
        elem[name] = value;
      }
    }
  } else {
    _$jscoverage['/base/attr.js'].lineData[252]++;
    if (visit43_252_1(elems.length)) {
      _$jscoverage['/base/attr.js'].lineData[253]++;
      return getProp(elems[0], name);
    }
  }
  _$jscoverage['/base/attr.js'].lineData[256]++;
  return undefined;
}, 
  hasProp: function(selector, name) {
  _$jscoverage['/base/attr.js'].functionData[15]++;
  _$jscoverage['/base/attr.js'].lineData[266]++;
  var elems = Dom.query(selector), i, len = elems.length, el;
  _$jscoverage['/base/attr.js'].lineData[270]++;
  for (i = 0; visit44_270_1(i < len); i++) {
    _$jscoverage['/base/attr.js'].lineData[271]++;
    el = elems[i];
    _$jscoverage['/base/attr.js'].lineData[272]++;
    if (visit45_272_1(getProp(el, name) !== undefined)) {
      _$jscoverage['/base/attr.js'].lineData[273]++;
      return true;
    }
  }
  _$jscoverage['/base/attr.js'].lineData[276]++;
  return false;
}, 
  removeProp: function(selector, name) {
  _$jscoverage['/base/attr.js'].functionData[16]++;
  _$jscoverage['/base/attr.js'].lineData[285]++;
  name = visit46_285_1(propFix[name] || name);
  _$jscoverage['/base/attr.js'].lineData[286]++;
  var elems = Dom.query(selector), i, el;
  _$jscoverage['/base/attr.js'].lineData[289]++;
  for (i = elems.length - 1; visit47_289_1(i >= 0); i--) {
    _$jscoverage['/base/attr.js'].lineData[290]++;
    el = elems[i];
    _$jscoverage['/base/attr.js'].lineData[291]++;
    try {
      _$jscoverage['/base/attr.js'].lineData[292]++;
      el[name] = undefined;
      _$jscoverage['/base/attr.js'].lineData[293]++;
      delete el[name];
    }    catch (e) {
}
  }
}, 
  attr: function(selector, name, val, pass) {
  _$jscoverage['/base/attr.js'].functionData[17]++;
  _$jscoverage['/base/attr.js'].lineData[341]++;
  var els = Dom.query(selector), attrNormalizer, i, el = els[0], ret;
  _$jscoverage['/base/attr.js'].lineData[348]++;
  if (visit48_348_1(S.isPlainObject(name))) {
    _$jscoverage['/base/attr.js'].lineData[349]++;
    pass = val;
    _$jscoverage['/base/attr.js'].lineData[350]++;
    for (var k in name) {
      _$jscoverage['/base/attr.js'].lineData[351]++;
      Dom.attr(els, k, name[k], pass);
    }
    _$jscoverage['/base/attr.js'].lineData[353]++;
    return undefined;
  }
  _$jscoverage['/base/attr.js'].lineData[357]++;
  if (visit49_357_1(pass && attrFn[name])) {
    _$jscoverage['/base/attr.js'].lineData[358]++;
    return Dom[name](selector, val);
  }
  _$jscoverage['/base/attr.js'].lineData[362]++;
  name = name.toLowerCase();
  _$jscoverage['/base/attr.js'].lineData[364]++;
  if (visit50_364_1(pass && attrFn[name])) {
    _$jscoverage['/base/attr.js'].lineData[365]++;
    return Dom[name](selector, val);
  }
  _$jscoverage['/base/attr.js'].lineData[369]++;
  name = visit51_369_1(attrFix[name] || name);
  _$jscoverage['/base/attr.js'].lineData[371]++;
  if (visit52_371_1(R_BOOLEAN.test(name))) {
    _$jscoverage['/base/attr.js'].lineData[372]++;
    attrNormalizer = boolHook;
  } else {
    _$jscoverage['/base/attr.js'].lineData[375]++;
    if (visit53_375_1(R_INVALID_CHAR.test(name))) {
      _$jscoverage['/base/attr.js'].lineData[376]++;
      attrNormalizer = attrNodeHook;
    } else {
      _$jscoverage['/base/attr.js'].lineData[378]++;
      attrNormalizer = attrHooks[name];
    }
  }
  _$jscoverage['/base/attr.js'].lineData[381]++;
  if (visit54_381_1(val === undefined)) {
    _$jscoverage['/base/attr.js'].lineData[382]++;
    if (visit55_382_1(el && visit56_382_2(el.nodeType === NodeType.ELEMENT_NODE))) {
      _$jscoverage['/base/attr.js'].lineData[384]++;
      if (visit57_384_1(nodeName(el) === 'form')) {
        _$jscoverage['/base/attr.js'].lineData[385]++;
        attrNormalizer = attrNodeHook;
      }
      _$jscoverage['/base/attr.js'].lineData[387]++;
      if (visit58_387_1(attrNormalizer && attrNormalizer.get)) {
        _$jscoverage['/base/attr.js'].lineData[388]++;
        return attrNormalizer.get(el, name);
      }
      _$jscoverage['/base/attr.js'].lineData[391]++;
      ret = el.getAttribute(name);
      _$jscoverage['/base/attr.js'].lineData[393]++;
      if (visit59_393_1(ret === '')) {
        _$jscoverage['/base/attr.js'].lineData[394]++;
        var attrNode = el.getAttributeNode(name);
        _$jscoverage['/base/attr.js'].lineData[395]++;
        if (visit60_395_1(!attrNode || !attrNode.specified)) {
          _$jscoverage['/base/attr.js'].lineData[396]++;
          return undefined;
        }
      }
      _$jscoverage['/base/attr.js'].lineData[403]++;
      return visit61_403_1(ret === null) ? undefined : ret;
    }
  } else {
    _$jscoverage['/base/attr.js'].lineData[406]++;
    for (i = els.length - 1; visit62_406_1(i >= 0); i--) {
      _$jscoverage['/base/attr.js'].lineData[407]++;
      el = els[i];
      _$jscoverage['/base/attr.js'].lineData[408]++;
      if (visit63_408_1(el && visit64_408_2(el.nodeType === NodeType.ELEMENT_NODE))) {
        _$jscoverage['/base/attr.js'].lineData[409]++;
        if (visit65_409_1(nodeName(el) === 'form')) {
          _$jscoverage['/base/attr.js'].lineData[410]++;
          attrNormalizer = attrNodeHook;
        }
        _$jscoverage['/base/attr.js'].lineData[412]++;
        if (visit66_412_1(attrNormalizer && attrNormalizer.set)) {
          _$jscoverage['/base/attr.js'].lineData[413]++;
          attrNormalizer.set(el, val, name);
        } else {
          _$jscoverage['/base/attr.js'].lineData[416]++;
          el.setAttribute(name, EMPTY + val);
        }
      }
    }
  }
  _$jscoverage['/base/attr.js'].lineData[421]++;
  return undefined;
}, 
  removeAttr: function(selector, name) {
  _$jscoverage['/base/attr.js'].functionData[18]++;
  _$jscoverage['/base/attr.js'].lineData[430]++;
  name = name.toLowerCase();
  _$jscoverage['/base/attr.js'].lineData[431]++;
  name = visit67_431_1(attrFix[name] || name);
  _$jscoverage['/base/attr.js'].lineData[432]++;
  var els = Dom.query(selector), propName, el, i;
  _$jscoverage['/base/attr.js'].lineData[435]++;
  for (i = els.length - 1; visit68_435_1(i >= 0); i--) {
    _$jscoverage['/base/attr.js'].lineData[436]++;
    el = els[i];
    _$jscoverage['/base/attr.js'].lineData[437]++;
    if (visit69_437_1(el.nodeType === NodeType.ELEMENT_NODE)) {
      _$jscoverage['/base/attr.js'].lineData[438]++;
      el.removeAttribute(name);
      _$jscoverage['/base/attr.js'].lineData[440]++;
      if (visit70_440_1(R_BOOLEAN.test(name) && (propName = visit71_440_2(propFix[name] || name)) in el)) {
        _$jscoverage['/base/attr.js'].lineData[441]++;
        el[propName] = false;
      }
    }
  }
}, 
  hasAttr: visit72_454_1(docElement && !docElement.hasAttribute) ? function(selector, name) {
  _$jscoverage['/base/attr.js'].functionData[19]++;
  _$jscoverage['/base/attr.js'].lineData[456]++;
  name = name.toLowerCase();
  _$jscoverage['/base/attr.js'].lineData[457]++;
  var elems = Dom.query(selector), i, el, attrNode;
  _$jscoverage['/base/attr.js'].lineData[463]++;
  for (i = 0; visit73_463_1(i < elems.length); i++) {
    _$jscoverage['/base/attr.js'].lineData[464]++;
    el = elems[i];
    _$jscoverage['/base/attr.js'].lineData[465]++;
    attrNode = el.getAttributeNode(name);
    _$jscoverage['/base/attr.js'].lineData[466]++;
    if (visit74_466_1(attrNode && attrNode.specified)) {
      _$jscoverage['/base/attr.js'].lineData[467]++;
      return true;
    }
  }
  _$jscoverage['/base/attr.js'].lineData[470]++;
  return false;
} : function(selector, name) {
  _$jscoverage['/base/attr.js'].functionData[20]++;
  _$jscoverage['/base/attr.js'].lineData[473]++;
  var elems = Dom.query(selector), i, len = elems.length;
  _$jscoverage['/base/attr.js'].lineData[475]++;
  for (i = 0; visit75_475_1(i < len); i++) {
    _$jscoverage['/base/attr.js'].lineData[477]++;
    if (visit76_477_1(elems[i].hasAttribute(name))) {
      _$jscoverage['/base/attr.js'].lineData[478]++;
      return true;
    }
  }
  _$jscoverage['/base/attr.js'].lineData[481]++;
  return false;
}, 
  val: function(selector, value) {
  _$jscoverage['/base/attr.js'].functionData[21]++;
  _$jscoverage['/base/attr.js'].lineData[493]++;
  var hook, ret, elem, els, i, val;
  _$jscoverage['/base/attr.js'].lineData[496]++;
  if (visit77_496_1(value === undefined)) {
    _$jscoverage['/base/attr.js'].lineData[498]++;
    elem = Dom.get(selector);
    _$jscoverage['/base/attr.js'].lineData[500]++;
    if (visit78_500_1(elem)) {
      _$jscoverage['/base/attr.js'].lineData[501]++;
      hook = visit79_501_1(valHooks[nodeName(elem)] || valHooks[elem.type]);
      _$jscoverage['/base/attr.js'].lineData[503]++;
      if (visit80_503_1(hook && visit81_503_2('get' in hook && visit82_504_1((ret = hook.get(elem, 'value')) !== undefined)))) {
        _$jscoverage['/base/attr.js'].lineData[505]++;
        return ret;
      }
      _$jscoverage['/base/attr.js'].lineData[508]++;
      ret = elem.value;
      _$jscoverage['/base/attr.js'].lineData[510]++;
      return visit83_510_1(typeof ret === 'string') ? ret.replace(R_RETURN, '') : visit84_514_1(ret == null) ? '' : ret;
    }
    _$jscoverage['/base/attr.js'].lineData[517]++;
    return undefined;
  }
  _$jscoverage['/base/attr.js'].lineData[520]++;
  els = Dom.query(selector);
  _$jscoverage['/base/attr.js'].lineData[521]++;
  for (i = els.length - 1; visit85_521_1(i >= 0); i--) {
    _$jscoverage['/base/attr.js'].lineData[522]++;
    elem = els[i];
    _$jscoverage['/base/attr.js'].lineData[523]++;
    if (visit86_523_1(elem.nodeType !== 1)) {
      _$jscoverage['/base/attr.js'].lineData[524]++;
      return undefined;
    }
    _$jscoverage['/base/attr.js'].lineData[527]++;
    val = value;
    _$jscoverage['/base/attr.js'].lineData[530]++;
    if (visit87_530_1(val == null)) {
      _$jscoverage['/base/attr.js'].lineData[531]++;
      val = '';
    } else {
      _$jscoverage['/base/attr.js'].lineData[532]++;
      if (visit88_532_1(typeof val === 'number')) {
        _$jscoverage['/base/attr.js'].lineData[533]++;
        val += '';
      } else {
        _$jscoverage['/base/attr.js'].lineData[534]++;
        if (visit89_534_1(S.isArray(val))) {
          _$jscoverage['/base/attr.js'].lineData[535]++;
          val = S.map(val, toStr);
        }
      }
    }
    _$jscoverage['/base/attr.js'].lineData[538]++;
    hook = visit90_538_1(valHooks[nodeName(elem)] || valHooks[elem.type]);
    _$jscoverage['/base/attr.js'].lineData[541]++;
    if (visit91_541_1(!hook || visit92_541_2(!('set' in hook) || visit93_541_3(hook.set(elem, val, 'value') === undefined)))) {
      _$jscoverage['/base/attr.js'].lineData[542]++;
      elem.value = val;
    }
  }
  _$jscoverage['/base/attr.js'].lineData[545]++;
  return undefined;
}, 
  text: function(selector, val) {
  _$jscoverage['/base/attr.js'].functionData[22]++;
  _$jscoverage['/base/attr.js'].lineData[557]++;
  var el, els, i, nodeType;
  _$jscoverage['/base/attr.js'].lineData[559]++;
  if (visit94_559_1(val === undefined)) {
    _$jscoverage['/base/attr.js'].lineData[561]++;
    el = Dom.get(selector);
    _$jscoverage['/base/attr.js'].lineData[562]++;
    return Dom._getText(el);
  } else {
    _$jscoverage['/base/attr.js'].lineData[564]++;
    els = Dom.query(selector);
    _$jscoverage['/base/attr.js'].lineData[565]++;
    for (i = els.length - 1; visit95_565_1(i >= 0); i--) {
      _$jscoverage['/base/attr.js'].lineData[566]++;
      el = els[i];
      _$jscoverage['/base/attr.js'].lineData[567]++;
      nodeType = el.nodeType;
      _$jscoverage['/base/attr.js'].lineData[568]++;
      if (visit96_568_1(nodeType === NodeType.ELEMENT_NODE)) {
        _$jscoverage['/base/attr.js'].lineData[569]++;
        Dom.cleanData(el.getElementsByTagName('*'));
        _$jscoverage['/base/attr.js'].lineData[570]++;
        if (visit97_570_1('textContent' in el)) {
          _$jscoverage['/base/attr.js'].lineData[571]++;
          el.textContent = val;
        } else {
          _$jscoverage['/base/attr.js'].lineData[573]++;
          el.innerText = val;
        }
      } else {
        _$jscoverage['/base/attr.js'].lineData[576]++;
        if (visit98_576_1(visit99_576_2(nodeType === NodeType.TEXT_NODE) || visit100_576_3(nodeType === NodeType.CDATA_SECTION_NODE))) {
          _$jscoverage['/base/attr.js'].lineData[577]++;
          el.nodeValue = val;
        }
      }
    }
  }
  _$jscoverage['/base/attr.js'].lineData[581]++;
  return undefined;
}, 
  _getText: function(el) {
  _$jscoverage['/base/attr.js'].functionData[23]++;
  _$jscoverage['/base/attr.js'].lineData[585]++;
  return el.textContent;
}});
  _$jscoverage['/base/attr.js'].lineData[589]++;
  return Dom;
});
