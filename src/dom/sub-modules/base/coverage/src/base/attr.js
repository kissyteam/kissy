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
  _$jscoverage['/base/attr.js'].lineData[9] = 0;
  _$jscoverage['/base/attr.js'].lineData[40] = 0;
  _$jscoverage['/base/attr.js'].lineData[41] = 0;
  _$jscoverage['/base/attr.js'].lineData[75] = 0;
  _$jscoverage['/base/attr.js'].lineData[81] = 0;
  _$jscoverage['/base/attr.js'].lineData[82] = 0;
  _$jscoverage['/base/attr.js'].lineData[84] = 0;
  _$jscoverage['/base/attr.js'].lineData[87] = 0;
  _$jscoverage['/base/attr.js'].lineData[88] = 0;
  _$jscoverage['/base/attr.js'].lineData[90] = 0;
  _$jscoverage['/base/attr.js'].lineData[92] = 0;
  _$jscoverage['/base/attr.js'].lineData[94] = 0;
  _$jscoverage['/base/attr.js'].lineData[110] = 0;
  _$jscoverage['/base/attr.js'].lineData[118] = 0;
  _$jscoverage['/base/attr.js'].lineData[119] = 0;
  _$jscoverage['/base/attr.js'].lineData[120] = 0;
  _$jscoverage['/base/attr.js'].lineData[121] = 0;
  _$jscoverage['/base/attr.js'].lineData[125] = 0;
  _$jscoverage['/base/attr.js'].lineData[126] = 0;
  _$jscoverage['/base/attr.js'].lineData[127] = 0;
  _$jscoverage['/base/attr.js'].lineData[128] = 0;
  _$jscoverage['/base/attr.js'].lineData[129] = 0;
  _$jscoverage['/base/attr.js'].lineData[130] = 0;
  _$jscoverage['/base/attr.js'].lineData[134] = 0;
  _$jscoverage['/base/attr.js'].lineData[138] = 0;
  _$jscoverage['/base/attr.js'].lineData[140] = 0;
  _$jscoverage['/base/attr.js'].lineData[141] = 0;
  _$jscoverage['/base/attr.js'].lineData[144] = 0;
  _$jscoverage['/base/attr.js'].lineData[145] = 0;
  _$jscoverage['/base/attr.js'].lineData[147] = 0;
  _$jscoverage['/base/attr.js'].lineData[154] = 0;
  _$jscoverage['/base/attr.js'].lineData[155] = 0;
  _$jscoverage['/base/attr.js'].lineData[159] = 0;
  _$jscoverage['/base/attr.js'].lineData[162] = 0;
  _$jscoverage['/base/attr.js'].lineData[163] = 0;
  _$jscoverage['/base/attr.js'].lineData[164] = 0;
  _$jscoverage['/base/attr.js'].lineData[166] = 0;
  _$jscoverage['/base/attr.js'].lineData[173] = 0;
  _$jscoverage['/base/attr.js'].lineData[175] = 0;
  _$jscoverage['/base/attr.js'].lineData[179] = 0;
  _$jscoverage['/base/attr.js'].lineData[180] = 0;
  _$jscoverage['/base/attr.js'].lineData[184] = 0;
  _$jscoverage['/base/attr.js'].lineData[185] = 0;
  _$jscoverage['/base/attr.js'].lineData[186] = 0;
  _$jscoverage['/base/attr.js'].lineData[187] = 0;
  _$jscoverage['/base/attr.js'].lineData[188] = 0;
  _$jscoverage['/base/attr.js'].lineData[190] = 0;
  _$jscoverage['/base/attr.js'].lineData[194] = 0;
  _$jscoverage['/base/attr.js'].lineData[224] = 0;
  _$jscoverage['/base/attr.js'].lineData[230] = 0;
  _$jscoverage['/base/attr.js'].lineData[231] = 0;
  _$jscoverage['/base/attr.js'].lineData[232] = 0;
  _$jscoverage['/base/attr.js'].lineData[234] = 0;
  _$jscoverage['/base/attr.js'].lineData[238] = 0;
  _$jscoverage['/base/attr.js'].lineData[239] = 0;
  _$jscoverage['/base/attr.js'].lineData[240] = 0;
  _$jscoverage['/base/attr.js'].lineData[241] = 0;
  _$jscoverage['/base/attr.js'].lineData[242] = 0;
  _$jscoverage['/base/attr.js'].lineData[243] = 0;
  _$jscoverage['/base/attr.js'].lineData[244] = 0;
  _$jscoverage['/base/attr.js'].lineData[246] = 0;
  _$jscoverage['/base/attr.js'].lineData[250] = 0;
  _$jscoverage['/base/attr.js'].lineData[251] = 0;
  _$jscoverage['/base/attr.js'].lineData[254] = 0;
  _$jscoverage['/base/attr.js'].lineData[264] = 0;
  _$jscoverage['/base/attr.js'].lineData[268] = 0;
  _$jscoverage['/base/attr.js'].lineData[269] = 0;
  _$jscoverage['/base/attr.js'].lineData[270] = 0;
  _$jscoverage['/base/attr.js'].lineData[271] = 0;
  _$jscoverage['/base/attr.js'].lineData[274] = 0;
  _$jscoverage['/base/attr.js'].lineData[283] = 0;
  _$jscoverage['/base/attr.js'].lineData[284] = 0;
  _$jscoverage['/base/attr.js'].lineData[287] = 0;
  _$jscoverage['/base/attr.js'].lineData[288] = 0;
  _$jscoverage['/base/attr.js'].lineData[289] = 0;
  _$jscoverage['/base/attr.js'].lineData[290] = 0;
  _$jscoverage['/base/attr.js'].lineData[291] = 0;
  _$jscoverage['/base/attr.js'].lineData[339] = 0;
  _$jscoverage['/base/attr.js'].lineData[346] = 0;
  _$jscoverage['/base/attr.js'].lineData[347] = 0;
  _$jscoverage['/base/attr.js'].lineData[348] = 0;
  _$jscoverage['/base/attr.js'].lineData[349] = 0;
  _$jscoverage['/base/attr.js'].lineData[351] = 0;
  _$jscoverage['/base/attr.js'].lineData[355] = 0;
  _$jscoverage['/base/attr.js'].lineData[356] = 0;
  _$jscoverage['/base/attr.js'].lineData[360] = 0;
  _$jscoverage['/base/attr.js'].lineData[362] = 0;
  _$jscoverage['/base/attr.js'].lineData[363] = 0;
  _$jscoverage['/base/attr.js'].lineData[367] = 0;
  _$jscoverage['/base/attr.js'].lineData[369] = 0;
  _$jscoverage['/base/attr.js'].lineData[370] = 0;
  _$jscoverage['/base/attr.js'].lineData[371] = 0;
  _$jscoverage['/base/attr.js'].lineData[373] = 0;
  _$jscoverage['/base/attr.js'].lineData[375] = 0;
  _$jscoverage['/base/attr.js'].lineData[378] = 0;
  _$jscoverage['/base/attr.js'].lineData[379] = 0;
  _$jscoverage['/base/attr.js'].lineData[381] = 0;
  _$jscoverage['/base/attr.js'].lineData[382] = 0;
  _$jscoverage['/base/attr.js'].lineData[384] = 0;
  _$jscoverage['/base/attr.js'].lineData[385] = 0;
  _$jscoverage['/base/attr.js'].lineData[388] = 0;
  _$jscoverage['/base/attr.js'].lineData[390] = 0;
  _$jscoverage['/base/attr.js'].lineData[391] = 0;
  _$jscoverage['/base/attr.js'].lineData[392] = 0;
  _$jscoverage['/base/attr.js'].lineData[393] = 0;
  _$jscoverage['/base/attr.js'].lineData[400] = 0;
  _$jscoverage['/base/attr.js'].lineData[403] = 0;
  _$jscoverage['/base/attr.js'].lineData[404] = 0;
  _$jscoverage['/base/attr.js'].lineData[405] = 0;
  _$jscoverage['/base/attr.js'].lineData[406] = 0;
  _$jscoverage['/base/attr.js'].lineData[407] = 0;
  _$jscoverage['/base/attr.js'].lineData[409] = 0;
  _$jscoverage['/base/attr.js'].lineData[410] = 0;
  _$jscoverage['/base/attr.js'].lineData[413] = 0;
  _$jscoverage['/base/attr.js'].lineData[418] = 0;
  _$jscoverage['/base/attr.js'].lineData[427] = 0;
  _$jscoverage['/base/attr.js'].lineData[428] = 0;
  _$jscoverage['/base/attr.js'].lineData[429] = 0;
  _$jscoverage['/base/attr.js'].lineData[432] = 0;
  _$jscoverage['/base/attr.js'].lineData[433] = 0;
  _$jscoverage['/base/attr.js'].lineData[434] = 0;
  _$jscoverage['/base/attr.js'].lineData[435] = 0;
  _$jscoverage['/base/attr.js'].lineData[437] = 0;
  _$jscoverage['/base/attr.js'].lineData[438] = 0;
  _$jscoverage['/base/attr.js'].lineData[453] = 0;
  _$jscoverage['/base/attr.js'].lineData[454] = 0;
  _$jscoverage['/base/attr.js'].lineData[460] = 0;
  _$jscoverage['/base/attr.js'].lineData[461] = 0;
  _$jscoverage['/base/attr.js'].lineData[462] = 0;
  _$jscoverage['/base/attr.js'].lineData[463] = 0;
  _$jscoverage['/base/attr.js'].lineData[464] = 0;
  _$jscoverage['/base/attr.js'].lineData[467] = 0;
  _$jscoverage['/base/attr.js'].lineData[470] = 0;
  _$jscoverage['/base/attr.js'].lineData[472] = 0;
  _$jscoverage['/base/attr.js'].lineData[474] = 0;
  _$jscoverage['/base/attr.js'].lineData[475] = 0;
  _$jscoverage['/base/attr.js'].lineData[478] = 0;
  _$jscoverage['/base/attr.js'].lineData[490] = 0;
  _$jscoverage['/base/attr.js'].lineData[493] = 0;
  _$jscoverage['/base/attr.js'].lineData[495] = 0;
  _$jscoverage['/base/attr.js'].lineData[497] = 0;
  _$jscoverage['/base/attr.js'].lineData[498] = 0;
  _$jscoverage['/base/attr.js'].lineData[500] = 0;
  _$jscoverage['/base/attr.js'].lineData[502] = 0;
  _$jscoverage['/base/attr.js'].lineData[505] = 0;
  _$jscoverage['/base/attr.js'].lineData[507] = 0;
  _$jscoverage['/base/attr.js'].lineData[514] = 0;
  _$jscoverage['/base/attr.js'].lineData[517] = 0;
  _$jscoverage['/base/attr.js'].lineData[518] = 0;
  _$jscoverage['/base/attr.js'].lineData[519] = 0;
  _$jscoverage['/base/attr.js'].lineData[520] = 0;
  _$jscoverage['/base/attr.js'].lineData[521] = 0;
  _$jscoverage['/base/attr.js'].lineData[524] = 0;
  _$jscoverage['/base/attr.js'].lineData[527] = 0;
  _$jscoverage['/base/attr.js'].lineData[528] = 0;
  _$jscoverage['/base/attr.js'].lineData[529] = 0;
  _$jscoverage['/base/attr.js'].lineData[530] = 0;
  _$jscoverage['/base/attr.js'].lineData[531] = 0;
  _$jscoverage['/base/attr.js'].lineData[532] = 0;
  _$jscoverage['/base/attr.js'].lineData[535] = 0;
  _$jscoverage['/base/attr.js'].lineData[536] = 0;
  _$jscoverage['/base/attr.js'].lineData[538] = 0;
  _$jscoverage['/base/attr.js'].lineData[539] = 0;
  _$jscoverage['/base/attr.js'].lineData[542] = 0;
  _$jscoverage['/base/attr.js'].lineData[554] = 0;
  _$jscoverage['/base/attr.js'].lineData[556] = 0;
  _$jscoverage['/base/attr.js'].lineData[558] = 0;
  _$jscoverage['/base/attr.js'].lineData[559] = 0;
  _$jscoverage['/base/attr.js'].lineData[561] = 0;
  _$jscoverage['/base/attr.js'].lineData[562] = 0;
  _$jscoverage['/base/attr.js'].lineData[563] = 0;
  _$jscoverage['/base/attr.js'].lineData[564] = 0;
  _$jscoverage['/base/attr.js'].lineData[565] = 0;
  _$jscoverage['/base/attr.js'].lineData[566] = 0;
  _$jscoverage['/base/attr.js'].lineData[567] = 0;
  _$jscoverage['/base/attr.js'].lineData[568] = 0;
  _$jscoverage['/base/attr.js'].lineData[570] = 0;
  _$jscoverage['/base/attr.js'].lineData[572] = 0;
  _$jscoverage['/base/attr.js'].lineData[573] = 0;
  _$jscoverage['/base/attr.js'].lineData[577] = 0;
  _$jscoverage['/base/attr.js'].lineData[581] = 0;
  _$jscoverage['/base/attr.js'].lineData[585] = 0;
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
  _$jscoverage['/base/attr.js'].branchData['11'] = [];
  _$jscoverage['/base/attr.js'].branchData['11'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['41'] = [];
  _$jscoverage['/base/attr.js'].branchData['41'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['43'] = [];
  _$jscoverage['/base/attr.js'].branchData['43'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['44'] = [];
  _$jscoverage['/base/attr.js'].branchData['44'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['82'] = [];
  _$jscoverage['/base/attr.js'].branchData['82'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['87'] = [];
  _$jscoverage['/base/attr.js'].branchData['87'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['88'] = [];
  _$jscoverage['/base/attr.js'].branchData['88'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['115'] = [];
  _$jscoverage['/base/attr.js'].branchData['115'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['118'] = [];
  _$jscoverage['/base/attr.js'].branchData['118'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['120'] = [];
  _$jscoverage['/base/attr.js'].branchData['120'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['128'] = [];
  _$jscoverage['/base/attr.js'].branchData['128'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['129'] = [];
  _$jscoverage['/base/attr.js'].branchData['129'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['144'] = [];
  _$jscoverage['/base/attr.js'].branchData['144'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['159'] = [];
  _$jscoverage['/base/attr.js'].branchData['159'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['162'] = [];
  _$jscoverage['/base/attr.js'].branchData['162'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['180'] = [];
  _$jscoverage['/base/attr.js'].branchData['180'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['185'] = [];
  _$jscoverage['/base/attr.js'].branchData['185'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['187'] = [];
  _$jscoverage['/base/attr.js'].branchData['187'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['230'] = [];
  _$jscoverage['/base/attr.js'].branchData['230'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['238'] = [];
  _$jscoverage['/base/attr.js'].branchData['238'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['240'] = [];
  _$jscoverage['/base/attr.js'].branchData['240'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['241'] = [];
  _$jscoverage['/base/attr.js'].branchData['241'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['243'] = [];
  _$jscoverage['/base/attr.js'].branchData['243'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['250'] = [];
  _$jscoverage['/base/attr.js'].branchData['250'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['268'] = [];
  _$jscoverage['/base/attr.js'].branchData['268'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['270'] = [];
  _$jscoverage['/base/attr.js'].branchData['270'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['283'] = [];
  _$jscoverage['/base/attr.js'].branchData['283'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['287'] = [];
  _$jscoverage['/base/attr.js'].branchData['287'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['346'] = [];
  _$jscoverage['/base/attr.js'].branchData['346'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['355'] = [];
  _$jscoverage['/base/attr.js'].branchData['355'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['362'] = [];
  _$jscoverage['/base/attr.js'].branchData['362'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['367'] = [];
  _$jscoverage['/base/attr.js'].branchData['367'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['369'] = [];
  _$jscoverage['/base/attr.js'].branchData['369'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['371'] = [];
  _$jscoverage['/base/attr.js'].branchData['371'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['378'] = [];
  _$jscoverage['/base/attr.js'].branchData['378'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['379'] = [];
  _$jscoverage['/base/attr.js'].branchData['379'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['379'][2] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['381'] = [];
  _$jscoverage['/base/attr.js'].branchData['381'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['384'] = [];
  _$jscoverage['/base/attr.js'].branchData['384'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['390'] = [];
  _$jscoverage['/base/attr.js'].branchData['390'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['392'] = [];
  _$jscoverage['/base/attr.js'].branchData['392'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['400'] = [];
  _$jscoverage['/base/attr.js'].branchData['400'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['403'] = [];
  _$jscoverage['/base/attr.js'].branchData['403'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['405'] = [];
  _$jscoverage['/base/attr.js'].branchData['405'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['405'][2] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['406'] = [];
  _$jscoverage['/base/attr.js'].branchData['406'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['409'] = [];
  _$jscoverage['/base/attr.js'].branchData['409'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['428'] = [];
  _$jscoverage['/base/attr.js'].branchData['428'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['432'] = [];
  _$jscoverage['/base/attr.js'].branchData['432'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['434'] = [];
  _$jscoverage['/base/attr.js'].branchData['434'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['437'] = [];
  _$jscoverage['/base/attr.js'].branchData['437'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['437'][2] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['451'] = [];
  _$jscoverage['/base/attr.js'].branchData['451'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['460'] = [];
  _$jscoverage['/base/attr.js'].branchData['460'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['463'] = [];
  _$jscoverage['/base/attr.js'].branchData['463'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['472'] = [];
  _$jscoverage['/base/attr.js'].branchData['472'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['474'] = [];
  _$jscoverage['/base/attr.js'].branchData['474'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['493'] = [];
  _$jscoverage['/base/attr.js'].branchData['493'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['497'] = [];
  _$jscoverage['/base/attr.js'].branchData['497'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['498'] = [];
  _$jscoverage['/base/attr.js'].branchData['498'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['500'] = [];
  _$jscoverage['/base/attr.js'].branchData['500'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['500'][2] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['501'] = [];
  _$jscoverage['/base/attr.js'].branchData['501'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['507'] = [];
  _$jscoverage['/base/attr.js'].branchData['507'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['511'] = [];
  _$jscoverage['/base/attr.js'].branchData['511'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['518'] = [];
  _$jscoverage['/base/attr.js'].branchData['518'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['520'] = [];
  _$jscoverage['/base/attr.js'].branchData['520'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['527'] = [];
  _$jscoverage['/base/attr.js'].branchData['527'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['529'] = [];
  _$jscoverage['/base/attr.js'].branchData['529'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['531'] = [];
  _$jscoverage['/base/attr.js'].branchData['531'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['535'] = [];
  _$jscoverage['/base/attr.js'].branchData['535'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['536'] = [];
  _$jscoverage['/base/attr.js'].branchData['536'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['538'] = [];
  _$jscoverage['/base/attr.js'].branchData['538'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['538'][2] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['556'] = [];
  _$jscoverage['/base/attr.js'].branchData['556'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['562'] = [];
  _$jscoverage['/base/attr.js'].branchData['562'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['565'] = [];
  _$jscoverage['/base/attr.js'].branchData['565'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['567'] = [];
  _$jscoverage['/base/attr.js'].branchData['567'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['572'] = [];
  _$jscoverage['/base/attr.js'].branchData['572'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['572'][2] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['572'][3] = new BranchData();
}
_$jscoverage['/base/attr.js'].branchData['572'][3].init(534, 40, 'nodeType === NodeType.CDATA_SECTION_NODE');
function visit100_572_3(result) {
  _$jscoverage['/base/attr.js'].branchData['572'][3].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['572'][2].init(499, 31, 'nodeType === NodeType.TEXT_NODE');
function visit99_572_2(result) {
  _$jscoverage['/base/attr.js'].branchData['572'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['572'][1].init(499, 75, 'nodeType === NodeType.TEXT_NODE || nodeType === NodeType.CDATA_SECTION_NODE');
function visit98_572_1(result) {
  _$jscoverage['/base/attr.js'].branchData['572'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['567'][1].init(108, 19, '\'textContent\' in el');
function visit97_567_1(result) {
  _$jscoverage['/base/attr.js'].branchData['567'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['565'][1].init(117, 34, 'nodeType === NodeType.ELEMENT_NODE');
function visit96_565_1(result) {
  _$jscoverage['/base/attr.js'].branchData['565'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['562'][1].init(95, 6, 'i >= 0');
function visit95_562_1(result) {
  _$jscoverage['/base/attr.js'].branchData['562'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['556'][1].init(92, 17, 'val === undefined');
function visit94_556_1(result) {
  _$jscoverage['/base/attr.js'].branchData['556'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['538'][2].init(827, 42, 'hook.set(elem, val, \'value\') === undefined');
function visit93_538_2(result) {
  _$jscoverage['/base/attr.js'].branchData['538'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['538'][1].init(811, 59, '!hookHasSet || (hook.set(elem, val, \'value\') === undefined)');
function visit92_538_1(result) {
  _$jscoverage['/base/attr.js'].branchData['538'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['536'][1].init(683, 23, 'hook && (\'set\' in hook)');
function visit91_536_1(result) {
  _$jscoverage['/base/attr.js'].branchData['536'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['535'][1].init(596, 47, 'valHooks[nodeName(elem)] || valHooks[elem.type]');
function visit90_535_1(result) {
  _$jscoverage['/base/attr.js'].branchData['535'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['531'][1].init(471, 17, 'util.isArray(val)');
function visit89_531_1(result) {
  _$jscoverage['/base/attr.js'].branchData['531'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['529'][1].init(375, 23, 'typeof val === \'number\'');
function visit88_529_1(result) {
  _$jscoverage['/base/attr.js'].branchData['529'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['527'][1].init(292, 11, 'val == null');
function visit87_527_1(result) {
  _$jscoverage['/base/attr.js'].branchData['527'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['520'][1].init(62, 19, 'elem.nodeType !== 1');
function visit86_520_1(result) {
  _$jscoverage['/base/attr.js'].branchData['520'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['518'][1].init(1030, 6, 'i >= 0');
function visit85_518_1(result) {
  _$jscoverage['/base/attr.js'].branchData['518'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['511'][1].init(260, 11, 'ret == null');
function visit84_511_1(result) {
  _$jscoverage['/base/attr.js'].branchData['511'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['507'][1].init(367, 23, 'typeof ret === \'string\'');
function visit83_507_1(result) {
  _$jscoverage['/base/attr.js'].branchData['507'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['501'][1].init(46, 44, '(ret = hook.get(elem, \'value\')) !== undefined');
function visit82_501_1(result) {
  _$jscoverage['/base/attr.js'].branchData['501'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['500'][2].init(125, 91, '\'get\' in hook && (ret = hook.get(elem, \'value\')) !== undefined');
function visit81_500_2(result) {
  _$jscoverage['/base/attr.js'].branchData['500'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['500'][1].init(117, 99, 'hook && \'get\' in hook && (ret = hook.get(elem, \'value\')) !== undefined');
function visit80_500_1(result) {
  _$jscoverage['/base/attr.js'].branchData['500'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['498'][1].init(33, 51, 'valHooks[nodeName(elem)] || valHooks[elem.type]');
function visit79_498_1(result) {
  _$jscoverage['/base/attr.js'].branchData['498'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['497'][1].init(77, 4, 'elem');
function visit78_497_1(result) {
  _$jscoverage['/base/attr.js'].branchData['497'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['493'][1].init(101, 19, 'value === undefined');
function visit77_493_1(result) {
  _$jscoverage['/base/attr.js'].branchData['493'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['474'][1].init(64, 27, 'elems[i].hasAttribute(name)');
function visit76_474_1(result) {
  _$jscoverage['/base/attr.js'].branchData['474'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['472'][1].init(136, 7, 'i < len');
function visit75_472_1(result) {
  _$jscoverage['/base/attr.js'].branchData['472'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['463'][1].init(133, 30, 'attrNode && attrNode.specified');
function visit74_463_1(result) {
  _$jscoverage['/base/attr.js'].branchData['463'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['460'][1].init(415, 16, 'i < elems.length');
function visit73_460_1(result) {
  _$jscoverage['/base/attr.js'].branchData['460'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['451'][1].init(10482, 38, 'docElement && !docElement.hasAttribute');
function visit72_451_1(result) {
  _$jscoverage['/base/attr.js'].branchData['451'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['437'][2].init(204, 23, 'propFix[name] || name');
function visit71_437_2(result) {
  _$jscoverage['/base/attr.js'].branchData['437'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['437'][1].init(168, 66, 'R_BOOLEAN.test(name) && (propName = propFix[name] || name) in el');
function visit70_437_1(result) {
  _$jscoverage['/base/attr.js'].branchData['437'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['434'][1].init(60, 37, 'el.nodeType === NodeType.ELEMENT_NODE');
function visit69_434_1(result) {
  _$jscoverage['/base/attr.js'].branchData['434'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['432'][1].init(241, 6, 'i >= 0');
function visit68_432_1(result) {
  _$jscoverage['/base/attr.js'].branchData['432'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['428'][1].init(69, 21, 'attrFix[name] || name');
function visit67_428_1(result) {
  _$jscoverage['/base/attr.js'].branchData['428'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['409'][1].init(189, 36, 'attrNormalizer && attrNormalizer.set');
function visit66_409_1(result) {
  _$jscoverage['/base/attr.js'].branchData['409'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['406'][1].init(34, 23, 'nodeName(el) === \'form\'');
function visit65_406_1(result) {
  _$jscoverage['/base/attr.js'].branchData['406'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['405'][2].init(74, 37, 'el.nodeType === NodeType.ELEMENT_NODE');
function visit64_405_2(result) {
  _$jscoverage['/base/attr.js'].branchData['405'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['405'][1].init(68, 43, 'el && el.nodeType === NodeType.ELEMENT_NODE');
function visit63_405_1(result) {
  _$jscoverage['/base/attr.js'].branchData['405'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['403'][1].init(47, 6, 'i >= 0');
function visit62_403_1(result) {
  _$jscoverage['/base/attr.js'].branchData['403'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['400'][1].init(1005, 12, 'ret === null');
function visit61_400_1(result) {
  _$jscoverage['/base/attr.js'].branchData['400'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['392'][1].init(105, 32, '!attrNode || !attrNode.specified');
function visit60_392_1(result) {
  _$jscoverage['/base/attr.js'].branchData['392'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['390'][1].init(495, 10, 'ret === \'\'');
function visit59_390_1(result) {
  _$jscoverage['/base/attr.js'].branchData['390'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['384'][1].init(275, 36, 'attrNormalizer && attrNormalizer.get');
function visit58_384_1(result) {
  _$jscoverage['/base/attr.js'].branchData['384'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['381'][1].init(132, 23, 'nodeName(el) === \'form\'');
function visit57_381_1(result) {
  _$jscoverage['/base/attr.js'].branchData['381'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['379'][2].init(32, 37, 'el.nodeType === NodeType.ELEMENT_NODE');
function visit56_379_2(result) {
  _$jscoverage['/base/attr.js'].branchData['379'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['379'][1].init(26, 43, 'el && el.nodeType === NodeType.ELEMENT_NODE');
function visit55_379_1(result) {
  _$jscoverage['/base/attr.js'].branchData['379'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['378'][1].init(2932, 17, 'val === undefined');
function visit54_378_1(result) {
  _$jscoverage['/base/attr.js'].branchData['378'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['371'][1].init(2692, 25, 'R_INVALID_CHAR.test(name)');
function visit53_371_1(result) {
  _$jscoverage['/base/attr.js'].branchData['371'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['369'][1].init(2591, 20, 'R_BOOLEAN.test(name)');
function visit52_369_1(result) {
  _$jscoverage['/base/attr.js'].branchData['369'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['367'][1].init(2545, 21, 'attrFix[name] || name');
function visit51_367_1(result) {
  _$jscoverage['/base/attr.js'].branchData['367'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['362'][1].init(2389, 20, 'pass && attrFn[name]');
function visit50_362_1(result) {
  _$jscoverage['/base/attr.js'].branchData['362'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['355'][1].init(2192, 20, 'pass && attrFn[name]');
function visit49_355_1(result) {
  _$jscoverage['/base/attr.js'].branchData['355'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['346'][1].init(1891, 24, 'util.isPlainObject(name)');
function visit48_346_1(result) {
  _$jscoverage['/base/attr.js'].branchData['346'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['287'][1].init(193, 6, 'i >= 0');
function visit47_287_1(result) {
  _$jscoverage['/base/attr.js'].branchData['287'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['283'][1].init(25, 23, 'propFix[name] || name');
function visit46_283_1(result) {
  _$jscoverage['/base/attr.js'].branchData['283'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['270'][1].init(62, 31, 'getProp(el, name) !== undefined');
function visit45_270_1(result) {
  _$jscoverage['/base/attr.js'].branchData['270'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['268'][1].init(170, 7, 'i < len');
function visit44_268_1(result) {
  _$jscoverage['/base/attr.js'].branchData['268'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['250'][1].init(26, 12, 'elems.length');
function visit43_250_1(result) {
  _$jscoverage['/base/attr.js'].branchData['250'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['243'][1].init(72, 16, 'hook && hook.set');
function visit42_243_1(result) {
  _$jscoverage['/base/attr.js'].branchData['243'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['241'][1].init(49, 6, 'i >= 0');
function visit41_241_1(result) {
  _$jscoverage['/base/attr.js'].branchData['241'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['240'][1].init(565, 19, 'value !== undefined');
function visit40_240_1(result) {
  _$jscoverage['/base/attr.js'].branchData['240'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['238'][1].init(476, 23, 'propFix[name] || name');
function visit39_238_1(result) {
  _$jscoverage['/base/attr.js'].branchData['238'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['230'][1].init(186, 24, 'util.isPlainObject(name)');
function visit38_230_1(result) {
  _$jscoverage['/base/attr.js'].branchData['230'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['187'][1].init(90, 16, 'hook && hook.get');
function visit37_187_1(result) {
  _$jscoverage['/base/attr.js'].branchData['187'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['185'][1].init(17, 21, 'propFix[name] || name');
function visit36_185_1(result) {
  _$jscoverage['/base/attr.js'].branchData['185'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['180'][1].init(17, 13, 'value == null');
function visit35_180_1(result) {
  _$jscoverage['/base/attr.js'].branchData['180'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['162'][1].init(22, 19, 'util.isArray(value)');
function visit34_162_1(result) {
  _$jscoverage['/base/attr.js'].branchData['162'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['159'][1].init(155, 35, 'elem.getAttribute(\'value\') === null');
function visit33_159_1(result) {
  _$jscoverage['/base/attr.js'].branchData['159'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['144'][1].init(286, 14, '!values.length');
function visit32_144_1(result) {
  _$jscoverage['/base/attr.js'].branchData['144'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['129'][1].init(30, 19, 'options[i].selected');
function visit31_129_1(result) {
  _$jscoverage['/base/attr.js'].branchData['129'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['128'][1].init(696, 7, 'i < len');
function visit30_128_1(result) {
  _$jscoverage['/base/attr.js'].branchData['128'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['120'][1].init(416, 3, 'one');
function visit29_120_1(result) {
  _$jscoverage['/base/attr.js'].branchData['120'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['118'][1].init(332, 9, 'index < 0');
function visit28_118_1(result) {
  _$jscoverage['/base/attr.js'].branchData['118'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['115'][1].init(200, 34, 'String(elem.type) === \'select-one\'');
function visit27_115_1(result) {
  _$jscoverage['/base/attr.js'].branchData['115'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['88'][1].init(131, 16, 'propName in elem');
function visit26_88_1(result) {
  _$jscoverage['/base/attr.js'].branchData['88'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['87'][1].init(81, 23, 'propFix[name] || name');
function visit25_87_1(result) {
  _$jscoverage['/base/attr.js'].branchData['87'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['82'][1].init(53, 15, 'value === false');
function visit24_82_1(result) {
  _$jscoverage['/base/attr.js'].branchData['82'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['44'][1].init(61, 40, 'R_CLICKABLE.test(el.nodeName) && el.href');
function visit23_44_1(result) {
  _$jscoverage['/base/attr.js'].branchData['44'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['43'][1].init(-1, 102, 'R_FOCUSABLE.test(el.nodeName) || R_CLICKABLE.test(el.nodeName) && el.href');
function visit22_43_1(result) {
  _$jscoverage['/base/attr.js'].branchData['43'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['41'][1].init(216, 40, 'attributeNode && attributeNode.specified');
function visit21_41_1(result) {
  _$jscoverage['/base/attr.js'].branchData['41'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['11'][1].init(86, 26, 'doc && doc.documentElement');
function visit20_11_1(result) {
  _$jscoverage['/base/attr.js'].branchData['11'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/base/attr.js'].functionData[0]++;
  _$jscoverage['/base/attr.js'].lineData[7]++;
  var util = require('util');
  _$jscoverage['/base/attr.js'].lineData[8]++;
  var Dom = require('./api');
  _$jscoverage['/base/attr.js'].lineData[9]++;
  var doc = S.Env.host.document, NodeType = Dom.NodeType, docElement = visit20_11_1(doc && doc.documentElement), EMPTY = '', nodeName = Dom.nodeName, R_BOOLEAN = /^(?:autofocus|autoplay|async|checked|controls|defer|disabled|hidden|loop|multiple|open|readonly|required|scoped|selected)$/i, R_FOCUSABLE = /^(?:button|input|object|select|textarea)$/i, R_CLICKABLE = /^a(?:rea)?$/i, R_INVALID_CHAR = /:|^on/, R_RETURN = /\r/g, attrFix = {}, attrFn = {
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
  _$jscoverage['/base/attr.js'].lineData[40]++;
  var attributeNode = el.getAttributeNode('tabindex');
  _$jscoverage['/base/attr.js'].lineData[41]++;
  return visit21_41_1(attributeNode && attributeNode.specified) ? parseInt(attributeNode.value, 10) : visit22_43_1(R_FOCUSABLE.test(el.nodeName) || visit23_44_1(R_CLICKABLE.test(el.nodeName) && el.href)) ? 0 : undefined;
}}}, propFix = {
  hidefocus: 'hideFocus', 
  tabindex: 'tabIndex', 
  readonly: 'readOnly', 
  'for': 'htmlFor', 
  'class': 'className', 
  maxlength: 'maxLength', 
  cellspacing: 'cellSpacing', 
  cellpadding: 'cellPadding', 
  rowspan: 'rowSpan', 
  colspan: 'colSpan', 
  usemap: 'useMap', 
  frameborder: 'frameBorder', 
  contenteditable: 'contentEditable'}, boolHook = {
  get: function(elem, name) {
  _$jscoverage['/base/attr.js'].functionData[2]++;
  _$jscoverage['/base/attr.js'].lineData[75]++;
  return Dom.prop(elem, name) ? name.toLowerCase() : undefined;
}, 
  set: function(elem, value, name) {
  _$jscoverage['/base/attr.js'].functionData[3]++;
  _$jscoverage['/base/attr.js'].lineData[81]++;
  var propName;
  _$jscoverage['/base/attr.js'].lineData[82]++;
  if (visit24_82_1(value === false)) {
    _$jscoverage['/base/attr.js'].lineData[84]++;
    Dom.removeAttr(elem, name);
  } else {
    _$jscoverage['/base/attr.js'].lineData[87]++;
    propName = visit25_87_1(propFix[name] || name);
    _$jscoverage['/base/attr.js'].lineData[88]++;
    if (visit26_88_1(propName in elem)) {
      _$jscoverage['/base/attr.js'].lineData[90]++;
      elem[propName] = true;
    }
    _$jscoverage['/base/attr.js'].lineData[92]++;
    elem.setAttribute(name, name.toLowerCase());
  }
  _$jscoverage['/base/attr.js'].lineData[94]++;
  return name;
}}, propHooks = {}, attrNodeHook = {}, valHooks = {
  select: {
  get: function(elem) {
  _$jscoverage['/base/attr.js'].functionData[4]++;
  _$jscoverage['/base/attr.js'].lineData[110]++;
  var index = elem.selectedIndex, options = elem.options, ret, i, len, one = (visit27_115_1(String(elem.type) === 'select-one'));
  _$jscoverage['/base/attr.js'].lineData[118]++;
  if (visit28_118_1(index < 0)) {
    _$jscoverage['/base/attr.js'].lineData[119]++;
    return null;
  } else {
    _$jscoverage['/base/attr.js'].lineData[120]++;
    if (visit29_120_1(one)) {
      _$jscoverage['/base/attr.js'].lineData[121]++;
      return Dom.val(options[index]);
    }
  }
  _$jscoverage['/base/attr.js'].lineData[125]++;
  ret = [];
  _$jscoverage['/base/attr.js'].lineData[126]++;
  i = 0;
  _$jscoverage['/base/attr.js'].lineData[127]++;
  len = options.length;
  _$jscoverage['/base/attr.js'].lineData[128]++;
  for (; visit30_128_1(i < len); ++i) {
    _$jscoverage['/base/attr.js'].lineData[129]++;
    if (visit31_129_1(options[i].selected)) {
      _$jscoverage['/base/attr.js'].lineData[130]++;
      ret.push(Dom.val(options[i]));
    }
  }
  _$jscoverage['/base/attr.js'].lineData[134]++;
  return ret;
}, 
  set: function(elem, value) {
  _$jscoverage['/base/attr.js'].functionData[5]++;
  _$jscoverage['/base/attr.js'].lineData[138]++;
  var values = util.makeArray(value), opts = elem.options;
  _$jscoverage['/base/attr.js'].lineData[140]++;
  util.each(opts, function(opt) {
  _$jscoverage['/base/attr.js'].functionData[6]++;
  _$jscoverage['/base/attr.js'].lineData[141]++;
  opt.selected = util.inArray(Dom.val(opt), values);
});
  _$jscoverage['/base/attr.js'].lineData[144]++;
  if (visit32_144_1(!values.length)) {
    _$jscoverage['/base/attr.js'].lineData[145]++;
    elem.selectedIndex = -1;
  }
  _$jscoverage['/base/attr.js'].lineData[147]++;
  return values;
}}};
  _$jscoverage['/base/attr.js'].lineData[154]++;
  util.each(['radio', 'checkbox'], function(r) {
  _$jscoverage['/base/attr.js'].functionData[7]++;
  _$jscoverage['/base/attr.js'].lineData[155]++;
  valHooks[r] = {
  get: function(elem) {
  _$jscoverage['/base/attr.js'].functionData[8]++;
  _$jscoverage['/base/attr.js'].lineData[159]++;
  return visit33_159_1(elem.getAttribute('value') === null) ? 'on' : elem.value;
}, 
  set: function(elem, value) {
  _$jscoverage['/base/attr.js'].functionData[9]++;
  _$jscoverage['/base/attr.js'].lineData[162]++;
  if (visit34_162_1(util.isArray(value))) {
    _$jscoverage['/base/attr.js'].lineData[163]++;
    elem.checked = util.inArray(Dom.val(elem), value);
    _$jscoverage['/base/attr.js'].lineData[164]++;
    return 1;
  }
  _$jscoverage['/base/attr.js'].lineData[166]++;
  return undefined;
}};
});
  _$jscoverage['/base/attr.js'].lineData[173]++;
  attrHooks.style = {
  get: function(el) {
  _$jscoverage['/base/attr.js'].functionData[10]++;
  _$jscoverage['/base/attr.js'].lineData[175]++;
  return el.style.cssText;
}};
  _$jscoverage['/base/attr.js'].lineData[179]++;
  function toStr(value) {
    _$jscoverage['/base/attr.js'].functionData[11]++;
    _$jscoverage['/base/attr.js'].lineData[180]++;
    return visit35_180_1(value == null) ? '' : value + '';
  }
  _$jscoverage['/base/attr.js'].lineData[184]++;
  function getProp(elem, name) {
    _$jscoverage['/base/attr.js'].functionData[12]++;
    _$jscoverage['/base/attr.js'].lineData[185]++;
    name = visit36_185_1(propFix[name] || name);
    _$jscoverage['/base/attr.js'].lineData[186]++;
    var hook = propHooks[name];
    _$jscoverage['/base/attr.js'].lineData[187]++;
    if (visit37_187_1(hook && hook.get)) {
      _$jscoverage['/base/attr.js'].lineData[188]++;
      return hook.get(elem, name);
    } else {
      _$jscoverage['/base/attr.js'].lineData[190]++;
      return elem[name];
    }
  }
  _$jscoverage['/base/attr.js'].lineData[194]++;
  util.mix(Dom, {
  _valHooks: valHooks, 
  _propFix: propFix, 
  _attrHooks: attrHooks, 
  _propHooks: propHooks, 
  _attrNodeHook: attrNodeHook, 
  _attrFix: attrFix, 
  prop: function(selector, name, value) {
  _$jscoverage['/base/attr.js'].functionData[13]++;
  _$jscoverage['/base/attr.js'].lineData[224]++;
  var elems = Dom.query(selector), i, elem, hook;
  _$jscoverage['/base/attr.js'].lineData[230]++;
  if (visit38_230_1(util.isPlainObject(name))) {
    _$jscoverage['/base/attr.js'].lineData[231]++;
    util.each(name, function(v, k) {
  _$jscoverage['/base/attr.js'].functionData[14]++;
  _$jscoverage['/base/attr.js'].lineData[232]++;
  Dom.prop(elems, k, v);
});
    _$jscoverage['/base/attr.js'].lineData[234]++;
    return undefined;
  }
  _$jscoverage['/base/attr.js'].lineData[238]++;
  name = visit39_238_1(propFix[name] || name);
  _$jscoverage['/base/attr.js'].lineData[239]++;
  hook = propHooks[name];
  _$jscoverage['/base/attr.js'].lineData[240]++;
  if (visit40_240_1(value !== undefined)) {
    _$jscoverage['/base/attr.js'].lineData[241]++;
    for (i = elems.length - 1; visit41_241_1(i >= 0); i--) {
      _$jscoverage['/base/attr.js'].lineData[242]++;
      elem = elems[i];
      _$jscoverage['/base/attr.js'].lineData[243]++;
      if (visit42_243_1(hook && hook.set)) {
        _$jscoverage['/base/attr.js'].lineData[244]++;
        hook.set(elem, value, name);
      } else {
        _$jscoverage['/base/attr.js'].lineData[246]++;
        elem[name] = value;
      }
    }
  } else {
    _$jscoverage['/base/attr.js'].lineData[250]++;
    if (visit43_250_1(elems.length)) {
      _$jscoverage['/base/attr.js'].lineData[251]++;
      return getProp(elems[0], name);
    }
  }
  _$jscoverage['/base/attr.js'].lineData[254]++;
  return undefined;
}, 
  hasProp: function(selector, name) {
  _$jscoverage['/base/attr.js'].functionData[15]++;
  _$jscoverage['/base/attr.js'].lineData[264]++;
  var elems = Dom.query(selector), i, len = elems.length, el;
  _$jscoverage['/base/attr.js'].lineData[268]++;
  for (i = 0; visit44_268_1(i < len); i++) {
    _$jscoverage['/base/attr.js'].lineData[269]++;
    el = elems[i];
    _$jscoverage['/base/attr.js'].lineData[270]++;
    if (visit45_270_1(getProp(el, name) !== undefined)) {
      _$jscoverage['/base/attr.js'].lineData[271]++;
      return true;
    }
  }
  _$jscoverage['/base/attr.js'].lineData[274]++;
  return false;
}, 
  removeProp: function(selector, name) {
  _$jscoverage['/base/attr.js'].functionData[16]++;
  _$jscoverage['/base/attr.js'].lineData[283]++;
  name = visit46_283_1(propFix[name] || name);
  _$jscoverage['/base/attr.js'].lineData[284]++;
  var elems = Dom.query(selector), i, el;
  _$jscoverage['/base/attr.js'].lineData[287]++;
  for (i = elems.length - 1; visit47_287_1(i >= 0); i--) {
    _$jscoverage['/base/attr.js'].lineData[288]++;
    el = elems[i];
    _$jscoverage['/base/attr.js'].lineData[289]++;
    try {
      _$jscoverage['/base/attr.js'].lineData[290]++;
      el[name] = undefined;
      _$jscoverage['/base/attr.js'].lineData[291]++;
      delete el[name];
    }    catch (e) {
}
  }
}, 
  attr: function(selector, name, val, pass) {
  _$jscoverage['/base/attr.js'].functionData[17]++;
  _$jscoverage['/base/attr.js'].lineData[339]++;
  var els = Dom.query(selector), attrNormalizer, i, el = els[0], ret;
  _$jscoverage['/base/attr.js'].lineData[346]++;
  if (visit48_346_1(util.isPlainObject(name))) {
    _$jscoverage['/base/attr.js'].lineData[347]++;
    pass = val;
    _$jscoverage['/base/attr.js'].lineData[348]++;
    for (var k in name) {
      _$jscoverage['/base/attr.js'].lineData[349]++;
      Dom.attr(els, k, name[k], pass);
    }
    _$jscoverage['/base/attr.js'].lineData[351]++;
    return undefined;
  }
  _$jscoverage['/base/attr.js'].lineData[355]++;
  if (visit49_355_1(pass && attrFn[name])) {
    _$jscoverage['/base/attr.js'].lineData[356]++;
    return Dom[name](selector, val);
  }
  _$jscoverage['/base/attr.js'].lineData[360]++;
  name = name.toLowerCase();
  _$jscoverage['/base/attr.js'].lineData[362]++;
  if (visit50_362_1(pass && attrFn[name])) {
    _$jscoverage['/base/attr.js'].lineData[363]++;
    return Dom[name](selector, val);
  }
  _$jscoverage['/base/attr.js'].lineData[367]++;
  name = visit51_367_1(attrFix[name] || name);
  _$jscoverage['/base/attr.js'].lineData[369]++;
  if (visit52_369_1(R_BOOLEAN.test(name))) {
    _$jscoverage['/base/attr.js'].lineData[370]++;
    attrNormalizer = boolHook;
  } else {
    _$jscoverage['/base/attr.js'].lineData[371]++;
    if (visit53_371_1(R_INVALID_CHAR.test(name))) {
      _$jscoverage['/base/attr.js'].lineData[373]++;
      attrNormalizer = attrNodeHook;
    } else {
      _$jscoverage['/base/attr.js'].lineData[375]++;
      attrNormalizer = attrHooks[name];
    }
  }
  _$jscoverage['/base/attr.js'].lineData[378]++;
  if (visit54_378_1(val === undefined)) {
    _$jscoverage['/base/attr.js'].lineData[379]++;
    if (visit55_379_1(el && visit56_379_2(el.nodeType === NodeType.ELEMENT_NODE))) {
      _$jscoverage['/base/attr.js'].lineData[381]++;
      if (visit57_381_1(nodeName(el) === 'form')) {
        _$jscoverage['/base/attr.js'].lineData[382]++;
        attrNormalizer = attrNodeHook;
      }
      _$jscoverage['/base/attr.js'].lineData[384]++;
      if (visit58_384_1(attrNormalizer && attrNormalizer.get)) {
        _$jscoverage['/base/attr.js'].lineData[385]++;
        return attrNormalizer.get(el, name);
      }
      _$jscoverage['/base/attr.js'].lineData[388]++;
      ret = el.getAttribute(name);
      _$jscoverage['/base/attr.js'].lineData[390]++;
      if (visit59_390_1(ret === '')) {
        _$jscoverage['/base/attr.js'].lineData[391]++;
        var attrNode = el.getAttributeNode(name);
        _$jscoverage['/base/attr.js'].lineData[392]++;
        if (visit60_392_1(!attrNode || !attrNode.specified)) {
          _$jscoverage['/base/attr.js'].lineData[393]++;
          return undefined;
        }
      }
      _$jscoverage['/base/attr.js'].lineData[400]++;
      return visit61_400_1(ret === null) ? undefined : ret;
    }
  } else {
    _$jscoverage['/base/attr.js'].lineData[403]++;
    for (i = els.length - 1; visit62_403_1(i >= 0); i--) {
      _$jscoverage['/base/attr.js'].lineData[404]++;
      el = els[i];
      _$jscoverage['/base/attr.js'].lineData[405]++;
      if (visit63_405_1(el && visit64_405_2(el.nodeType === NodeType.ELEMENT_NODE))) {
        _$jscoverage['/base/attr.js'].lineData[406]++;
        if (visit65_406_1(nodeName(el) === 'form')) {
          _$jscoverage['/base/attr.js'].lineData[407]++;
          attrNormalizer = attrNodeHook;
        }
        _$jscoverage['/base/attr.js'].lineData[409]++;
        if (visit66_409_1(attrNormalizer && attrNormalizer.set)) {
          _$jscoverage['/base/attr.js'].lineData[410]++;
          attrNormalizer.set(el, val, name);
        } else {
          _$jscoverage['/base/attr.js'].lineData[413]++;
          el.setAttribute(name, EMPTY + val);
        }
      }
    }
  }
  _$jscoverage['/base/attr.js'].lineData[418]++;
  return undefined;
}, 
  removeAttr: function(selector, name) {
  _$jscoverage['/base/attr.js'].functionData[18]++;
  _$jscoverage['/base/attr.js'].lineData[427]++;
  name = name.toLowerCase();
  _$jscoverage['/base/attr.js'].lineData[428]++;
  name = visit67_428_1(attrFix[name] || name);
  _$jscoverage['/base/attr.js'].lineData[429]++;
  var els = Dom.query(selector), propName, el, i;
  _$jscoverage['/base/attr.js'].lineData[432]++;
  for (i = els.length - 1; visit68_432_1(i >= 0); i--) {
    _$jscoverage['/base/attr.js'].lineData[433]++;
    el = els[i];
    _$jscoverage['/base/attr.js'].lineData[434]++;
    if (visit69_434_1(el.nodeType === NodeType.ELEMENT_NODE)) {
      _$jscoverage['/base/attr.js'].lineData[435]++;
      el.removeAttribute(name);
      _$jscoverage['/base/attr.js'].lineData[437]++;
      if (visit70_437_1(R_BOOLEAN.test(name) && (propName = visit71_437_2(propFix[name] || name)) in el)) {
        _$jscoverage['/base/attr.js'].lineData[438]++;
        el[propName] = false;
      }
    }
  }
}, 
  hasAttr: visit72_451_1(docElement && !docElement.hasAttribute) ? function(selector, name) {
  _$jscoverage['/base/attr.js'].functionData[19]++;
  _$jscoverage['/base/attr.js'].lineData[453]++;
  name = name.toLowerCase();
  _$jscoverage['/base/attr.js'].lineData[454]++;
  var elems = Dom.query(selector), i, el, attrNode;
  _$jscoverage['/base/attr.js'].lineData[460]++;
  for (i = 0; visit73_460_1(i < elems.length); i++) {
    _$jscoverage['/base/attr.js'].lineData[461]++;
    el = elems[i];
    _$jscoverage['/base/attr.js'].lineData[462]++;
    attrNode = el.getAttributeNode(name);
    _$jscoverage['/base/attr.js'].lineData[463]++;
    if (visit74_463_1(attrNode && attrNode.specified)) {
      _$jscoverage['/base/attr.js'].lineData[464]++;
      return true;
    }
  }
  _$jscoverage['/base/attr.js'].lineData[467]++;
  return false;
} : function(selector, name) {
  _$jscoverage['/base/attr.js'].functionData[20]++;
  _$jscoverage['/base/attr.js'].lineData[470]++;
  var elems = Dom.query(selector), i, len = elems.length;
  _$jscoverage['/base/attr.js'].lineData[472]++;
  for (i = 0; visit75_472_1(i < len); i++) {
    _$jscoverage['/base/attr.js'].lineData[474]++;
    if (visit76_474_1(elems[i].hasAttribute(name))) {
      _$jscoverage['/base/attr.js'].lineData[475]++;
      return true;
    }
  }
  _$jscoverage['/base/attr.js'].lineData[478]++;
  return false;
}, 
  val: function(selector, value) {
  _$jscoverage['/base/attr.js'].functionData[21]++;
  _$jscoverage['/base/attr.js'].lineData[490]++;
  var hook, ret, elem, els, i, val;
  _$jscoverage['/base/attr.js'].lineData[493]++;
  if (visit77_493_1(value === undefined)) {
    _$jscoverage['/base/attr.js'].lineData[495]++;
    elem = Dom.get(selector);
    _$jscoverage['/base/attr.js'].lineData[497]++;
    if (visit78_497_1(elem)) {
      _$jscoverage['/base/attr.js'].lineData[498]++;
      hook = visit79_498_1(valHooks[nodeName(elem)] || valHooks[elem.type]);
      _$jscoverage['/base/attr.js'].lineData[500]++;
      if (visit80_500_1(hook && visit81_500_2('get' in hook && visit82_501_1((ret = hook.get(elem, 'value')) !== undefined)))) {
        _$jscoverage['/base/attr.js'].lineData[502]++;
        return ret;
      }
      _$jscoverage['/base/attr.js'].lineData[505]++;
      ret = elem.value;
      _$jscoverage['/base/attr.js'].lineData[507]++;
      return visit83_507_1(typeof ret === 'string') ? ret.replace(R_RETURN, '') : visit84_511_1(ret == null) ? '' : ret;
    }
    _$jscoverage['/base/attr.js'].lineData[514]++;
    return undefined;
  }
  _$jscoverage['/base/attr.js'].lineData[517]++;
  els = Dom.query(selector);
  _$jscoverage['/base/attr.js'].lineData[518]++;
  for (i = els.length - 1; visit85_518_1(i >= 0); i--) {
    _$jscoverage['/base/attr.js'].lineData[519]++;
    elem = els[i];
    _$jscoverage['/base/attr.js'].lineData[520]++;
    if (visit86_520_1(elem.nodeType !== 1)) {
      _$jscoverage['/base/attr.js'].lineData[521]++;
      return undefined;
    }
    _$jscoverage['/base/attr.js'].lineData[524]++;
    val = value;
    _$jscoverage['/base/attr.js'].lineData[527]++;
    if (visit87_527_1(val == null)) {
      _$jscoverage['/base/attr.js'].lineData[528]++;
      val = '';
    } else {
      _$jscoverage['/base/attr.js'].lineData[529]++;
      if (visit88_529_1(typeof val === 'number')) {
        _$jscoverage['/base/attr.js'].lineData[530]++;
        val += '';
      } else {
        _$jscoverage['/base/attr.js'].lineData[531]++;
        if (visit89_531_1(util.isArray(val))) {
          _$jscoverage['/base/attr.js'].lineData[532]++;
          val = util.map(val, toStr);
        }
      }
    }
    _$jscoverage['/base/attr.js'].lineData[535]++;
    hook = visit90_535_1(valHooks[nodeName(elem)] || valHooks[elem.type]);
    _$jscoverage['/base/attr.js'].lineData[536]++;
    var hookHasSet = visit91_536_1(hook && ('set' in hook));
    _$jscoverage['/base/attr.js'].lineData[538]++;
    if (visit92_538_1(!hookHasSet || (visit93_538_2(hook.set(elem, val, 'value') === undefined)))) {
      _$jscoverage['/base/attr.js'].lineData[539]++;
      elem.value = val;
    }
  }
  _$jscoverage['/base/attr.js'].lineData[542]++;
  return undefined;
}, 
  text: function(selector, val) {
  _$jscoverage['/base/attr.js'].functionData[22]++;
  _$jscoverage['/base/attr.js'].lineData[554]++;
  var el, els, i, nodeType;
  _$jscoverage['/base/attr.js'].lineData[556]++;
  if (visit94_556_1(val === undefined)) {
    _$jscoverage['/base/attr.js'].lineData[558]++;
    el = Dom.get(selector);
    _$jscoverage['/base/attr.js'].lineData[559]++;
    return Dom._getText(el);
  } else {
    _$jscoverage['/base/attr.js'].lineData[561]++;
    els = Dom.query(selector);
    _$jscoverage['/base/attr.js'].lineData[562]++;
    for (i = els.length - 1; visit95_562_1(i >= 0); i--) {
      _$jscoverage['/base/attr.js'].lineData[563]++;
      el = els[i];
      _$jscoverage['/base/attr.js'].lineData[564]++;
      nodeType = el.nodeType;
      _$jscoverage['/base/attr.js'].lineData[565]++;
      if (visit96_565_1(nodeType === NodeType.ELEMENT_NODE)) {
        _$jscoverage['/base/attr.js'].lineData[566]++;
        Dom.cleanData(el.getElementsByTagName('*'));
        _$jscoverage['/base/attr.js'].lineData[567]++;
        if (visit97_567_1('textContent' in el)) {
          _$jscoverage['/base/attr.js'].lineData[568]++;
          el.textContent = val;
        } else {
          _$jscoverage['/base/attr.js'].lineData[570]++;
          el.innerText = val;
        }
      } else {
        _$jscoverage['/base/attr.js'].lineData[572]++;
        if (visit98_572_1(visit99_572_2(nodeType === NodeType.TEXT_NODE) || visit100_572_3(nodeType === NodeType.CDATA_SECTION_NODE))) {
          _$jscoverage['/base/attr.js'].lineData[573]++;
          el.nodeValue = val;
        }
      }
    }
  }
  _$jscoverage['/base/attr.js'].lineData[577]++;
  return undefined;
}, 
  _getText: function(el) {
  _$jscoverage['/base/attr.js'].functionData[23]++;
  _$jscoverage['/base/attr.js'].lineData[581]++;
  return el.textContent;
}});
  _$jscoverage['/base/attr.js'].lineData[585]++;
  return Dom;
});
