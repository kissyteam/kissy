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
if (! _$jscoverage['/editor/selection.js']) {
  _$jscoverage['/editor/selection.js'] = {};
  _$jscoverage['/editor/selection.js'].lineData = [];
  _$jscoverage['/editor/selection.js'].lineData[10] = 0;
  _$jscoverage['/editor/selection.js'].lineData[11] = 0;
  _$jscoverage['/editor/selection.js'].lineData[12] = 0;
  _$jscoverage['/editor/selection.js'].lineData[13] = 0;
  _$jscoverage['/editor/selection.js'].lineData[14] = 0;
  _$jscoverage['/editor/selection.js'].lineData[19] = 0;
  _$jscoverage['/editor/selection.js'].lineData[24] = 0;
  _$jscoverage['/editor/selection.js'].lineData[40] = 0;
  _$jscoverage['/editor/selection.js'].lineData[41] = 0;
  _$jscoverage['/editor/selection.js'].lineData[42] = 0;
  _$jscoverage['/editor/selection.js'].lineData[43] = 0;
  _$jscoverage['/editor/selection.js'].lineData[51] = 0;
  _$jscoverage['/editor/selection.js'].lineData[52] = 0;
  _$jscoverage['/editor/selection.js'].lineData[53] = 0;
  _$jscoverage['/editor/selection.js'].lineData[54] = 0;
  _$jscoverage['/editor/selection.js'].lineData[56] = 0;
  _$jscoverage['/editor/selection.js'].lineData[62] = 0;
  _$jscoverage['/editor/selection.js'].lineData[67] = 0;
  _$jscoverage['/editor/selection.js'].lineData[90] = 0;
  _$jscoverage['/editor/selection.js'].lineData[100] = 0;
  _$jscoverage['/editor/selection.js'].lineData[102] = 0;
  _$jscoverage['/editor/selection.js'].lineData[106] = 0;
  _$jscoverage['/editor/selection.js'].lineData[107] = 0;
  _$jscoverage['/editor/selection.js'].lineData[130] = 0;
  _$jscoverage['/editor/selection.js'].lineData[131] = 0;
  _$jscoverage['/editor/selection.js'].lineData[132] = 0;
  _$jscoverage['/editor/selection.js'].lineData[135] = 0;
  _$jscoverage['/editor/selection.js'].lineData[138] = 0;
  _$jscoverage['/editor/selection.js'].lineData[139] = 0;
  _$jscoverage['/editor/selection.js'].lineData[140] = 0;
  _$jscoverage['/editor/selection.js'].lineData[144] = 0;
  _$jscoverage['/editor/selection.js'].lineData[147] = 0;
  _$jscoverage['/editor/selection.js'].lineData[151] = 0;
  _$jscoverage['/editor/selection.js'].lineData[155] = 0;
  _$jscoverage['/editor/selection.js'].lineData[156] = 0;
  _$jscoverage['/editor/selection.js'].lineData[159] = 0;
  _$jscoverage['/editor/selection.js'].lineData[160] = 0;
  _$jscoverage['/editor/selection.js'].lineData[161] = 0;
  _$jscoverage['/editor/selection.js'].lineData[164] = 0;
  _$jscoverage['/editor/selection.js'].lineData[166] = 0;
  _$jscoverage['/editor/selection.js'].lineData[167] = 0;
  _$jscoverage['/editor/selection.js'].lineData[170] = 0;
  _$jscoverage['/editor/selection.js'].lineData[171] = 0;
  _$jscoverage['/editor/selection.js'].lineData[174] = 0;
  _$jscoverage['/editor/selection.js'].lineData[175] = 0;
  _$jscoverage['/editor/selection.js'].lineData[183] = 0;
  _$jscoverage['/editor/selection.js'].lineData[184] = 0;
  _$jscoverage['/editor/selection.js'].lineData[190] = 0;
  _$jscoverage['/editor/selection.js'].lineData[191] = 0;
  _$jscoverage['/editor/selection.js'].lineData[198] = 0;
  _$jscoverage['/editor/selection.js'].lineData[200] = 0;
  _$jscoverage['/editor/selection.js'].lineData[201] = 0;
  _$jscoverage['/editor/selection.js'].lineData[204] = 0;
  _$jscoverage['/editor/selection.js'].lineData[207] = 0;
  _$jscoverage['/editor/selection.js'].lineData[208] = 0;
  _$jscoverage['/editor/selection.js'].lineData[210] = 0;
  _$jscoverage['/editor/selection.js'].lineData[211] = 0;
  _$jscoverage['/editor/selection.js'].lineData[213] = 0;
  _$jscoverage['/editor/selection.js'].lineData[215] = 0;
  _$jscoverage['/editor/selection.js'].lineData[218] = 0;
  _$jscoverage['/editor/selection.js'].lineData[220] = 0;
  _$jscoverage['/editor/selection.js'].lineData[221] = 0;
  _$jscoverage['/editor/selection.js'].lineData[222] = 0;
  _$jscoverage['/editor/selection.js'].lineData[225] = 0;
  _$jscoverage['/editor/selection.js'].lineData[226] = 0;
  _$jscoverage['/editor/selection.js'].lineData[227] = 0;
  _$jscoverage['/editor/selection.js'].lineData[230] = 0;
  _$jscoverage['/editor/selection.js'].lineData[234] = 0;
  _$jscoverage['/editor/selection.js'].lineData[235] = 0;
  _$jscoverage['/editor/selection.js'].lineData[236] = 0;
  _$jscoverage['/editor/selection.js'].lineData[237] = 0;
  _$jscoverage['/editor/selection.js'].lineData[240] = 0;
  _$jscoverage['/editor/selection.js'].lineData[244] = 0;
  _$jscoverage['/editor/selection.js'].lineData[247] = 0;
  _$jscoverage['/editor/selection.js'].lineData[248] = 0;
  _$jscoverage['/editor/selection.js'].lineData[253] = 0;
  _$jscoverage['/editor/selection.js'].lineData[257] = 0;
  _$jscoverage['/editor/selection.js'].lineData[260] = 0;
  _$jscoverage['/editor/selection.js'].lineData[261] = 0;
  _$jscoverage['/editor/selection.js'].lineData[266] = 0;
  _$jscoverage['/editor/selection.js'].lineData[273] = 0;
  _$jscoverage['/editor/selection.js'].lineData[274] = 0;
  _$jscoverage['/editor/selection.js'].lineData[275] = 0;
  _$jscoverage['/editor/selection.js'].lineData[276] = 0;
  _$jscoverage['/editor/selection.js'].lineData[283] = 0;
  _$jscoverage['/editor/selection.js'].lineData[288] = 0;
  _$jscoverage['/editor/selection.js'].lineData[289] = 0;
  _$jscoverage['/editor/selection.js'].lineData[292] = 0;
  _$jscoverage['/editor/selection.js'].lineData[293] = 0;
  _$jscoverage['/editor/selection.js'].lineData[294] = 0;
  _$jscoverage['/editor/selection.js'].lineData[295] = 0;
  _$jscoverage['/editor/selection.js'].lineData[296] = 0;
  _$jscoverage['/editor/selection.js'].lineData[297] = 0;
  _$jscoverage['/editor/selection.js'].lineData[298] = 0;
  _$jscoverage['/editor/selection.js'].lineData[299] = 0;
  _$jscoverage['/editor/selection.js'].lineData[300] = 0;
  _$jscoverage['/editor/selection.js'].lineData[301] = 0;
  _$jscoverage['/editor/selection.js'].lineData[303] = 0;
  _$jscoverage['/editor/selection.js'].lineData[304] = 0;
  _$jscoverage['/editor/selection.js'].lineData[308] = 0;
  _$jscoverage['/editor/selection.js'].lineData[311] = 0;
  _$jscoverage['/editor/selection.js'].lineData[314] = 0;
  _$jscoverage['/editor/selection.js'].lineData[315] = 0;
  _$jscoverage['/editor/selection.js'].lineData[316] = 0;
  _$jscoverage['/editor/selection.js'].lineData[319] = 0;
  _$jscoverage['/editor/selection.js'].lineData[322] = 0;
  _$jscoverage['/editor/selection.js'].lineData[323] = 0;
  _$jscoverage['/editor/selection.js'].lineData[328] = 0;
  _$jscoverage['/editor/selection.js'].lineData[329] = 0;
  _$jscoverage['/editor/selection.js'].lineData[330] = 0;
  _$jscoverage['/editor/selection.js'].lineData[337] = 0;
  _$jscoverage['/editor/selection.js'].lineData[339] = 0;
  _$jscoverage['/editor/selection.js'].lineData[340] = 0;
  _$jscoverage['/editor/selection.js'].lineData[343] = 0;
  _$jscoverage['/editor/selection.js'].lineData[344] = 0;
  _$jscoverage['/editor/selection.js'].lineData[346] = 0;
  _$jscoverage['/editor/selection.js'].lineData[347] = 0;
  _$jscoverage['/editor/selection.js'].lineData[348] = 0;
  _$jscoverage['/editor/selection.js'].lineData[351] = 0;
  _$jscoverage['/editor/selection.js'].lineData[352] = 0;
  _$jscoverage['/editor/selection.js'].lineData[365] = 0;
  _$jscoverage['/editor/selection.js'].lineData[366] = 0;
  _$jscoverage['/editor/selection.js'].lineData[367] = 0;
  _$jscoverage['/editor/selection.js'].lineData[370] = 0;
  _$jscoverage['/editor/selection.js'].lineData[373] = 0;
  _$jscoverage['/editor/selection.js'].lineData[375] = 0;
  _$jscoverage['/editor/selection.js'].lineData[379] = 0;
  _$jscoverage['/editor/selection.js'].lineData[381] = 0;
  _$jscoverage['/editor/selection.js'].lineData[382] = 0;
  _$jscoverage['/editor/selection.js'].lineData[383] = 0;
  _$jscoverage['/editor/selection.js'].lineData[388] = 0;
  _$jscoverage['/editor/selection.js'].lineData[389] = 0;
  _$jscoverage['/editor/selection.js'].lineData[392] = 0;
  _$jscoverage['/editor/selection.js'].lineData[394] = 0;
  _$jscoverage['/editor/selection.js'].lineData[396] = 0;
  _$jscoverage['/editor/selection.js'].lineData[400] = 0;
  _$jscoverage['/editor/selection.js'].lineData[402] = 0;
  _$jscoverage['/editor/selection.js'].lineData[403] = 0;
  _$jscoverage['/editor/selection.js'].lineData[406] = 0;
  _$jscoverage['/editor/selection.js'].lineData[408] = 0;
  _$jscoverage['/editor/selection.js'].lineData[409] = 0;
  _$jscoverage['/editor/selection.js'].lineData[412] = 0;
  _$jscoverage['/editor/selection.js'].lineData[413] = 0;
  _$jscoverage['/editor/selection.js'].lineData[414] = 0;
  _$jscoverage['/editor/selection.js'].lineData[415] = 0;
  _$jscoverage['/editor/selection.js'].lineData[417] = 0;
  _$jscoverage['/editor/selection.js'].lineData[421] = 0;
  _$jscoverage['/editor/selection.js'].lineData[422] = 0;
  _$jscoverage['/editor/selection.js'].lineData[423] = 0;
  _$jscoverage['/editor/selection.js'].lineData[424] = 0;
  _$jscoverage['/editor/selection.js'].lineData[426] = 0;
  _$jscoverage['/editor/selection.js'].lineData[427] = 0;
  _$jscoverage['/editor/selection.js'].lineData[428] = 0;
  _$jscoverage['/editor/selection.js'].lineData[430] = 0;
  _$jscoverage['/editor/selection.js'].lineData[431] = 0;
  _$jscoverage['/editor/selection.js'].lineData[436] = 0;
  _$jscoverage['/editor/selection.js'].lineData[437] = 0;
  _$jscoverage['/editor/selection.js'].lineData[451] = 0;
  _$jscoverage['/editor/selection.js'].lineData[455] = 0;
  _$jscoverage['/editor/selection.js'].lineData[456] = 0;
  _$jscoverage['/editor/selection.js'].lineData[460] = 0;
  _$jscoverage['/editor/selection.js'].lineData[461] = 0;
  _$jscoverage['/editor/selection.js'].lineData[462] = 0;
  _$jscoverage['/editor/selection.js'].lineData[468] = 0;
  _$jscoverage['/editor/selection.js'].lineData[469] = 0;
  _$jscoverage['/editor/selection.js'].lineData[470] = 0;
  _$jscoverage['/editor/selection.js'].lineData[478] = 0;
  _$jscoverage['/editor/selection.js'].lineData[490] = 0;
  _$jscoverage['/editor/selection.js'].lineData[493] = 0;
  _$jscoverage['/editor/selection.js'].lineData[496] = 0;
  _$jscoverage['/editor/selection.js'].lineData[499] = 0;
  _$jscoverage['/editor/selection.js'].lineData[500] = 0;
  _$jscoverage['/editor/selection.js'].lineData[504] = 0;
  _$jscoverage['/editor/selection.js'].lineData[508] = 0;
  _$jscoverage['/editor/selection.js'].lineData[511] = 0;
  _$jscoverage['/editor/selection.js'].lineData[515] = 0;
  _$jscoverage['/editor/selection.js'].lineData[517] = 0;
  _$jscoverage['/editor/selection.js'].lineData[518] = 0;
  _$jscoverage['/editor/selection.js'].lineData[519] = 0;
  _$jscoverage['/editor/selection.js'].lineData[522] = 0;
  _$jscoverage['/editor/selection.js'].lineData[523] = 0;
  _$jscoverage['/editor/selection.js'].lineData[524] = 0;
  _$jscoverage['/editor/selection.js'].lineData[528] = 0;
  _$jscoverage['/editor/selection.js'].lineData[531] = 0;
  _$jscoverage['/editor/selection.js'].lineData[532] = 0;
  _$jscoverage['/editor/selection.js'].lineData[534] = 0;
  _$jscoverage['/editor/selection.js'].lineData[535] = 0;
  _$jscoverage['/editor/selection.js'].lineData[536] = 0;
  _$jscoverage['/editor/selection.js'].lineData[537] = 0;
  _$jscoverage['/editor/selection.js'].lineData[542] = 0;
  _$jscoverage['/editor/selection.js'].lineData[543] = 0;
  _$jscoverage['/editor/selection.js'].lineData[544] = 0;
  _$jscoverage['/editor/selection.js'].lineData[546] = 0;
  _$jscoverage['/editor/selection.js'].lineData[547] = 0;
  _$jscoverage['/editor/selection.js'].lineData[548] = 0;
  _$jscoverage['/editor/selection.js'].lineData[553] = 0;
  _$jscoverage['/editor/selection.js'].lineData[554] = 0;
  _$jscoverage['/editor/selection.js'].lineData[557] = 0;
  _$jscoverage['/editor/selection.js'].lineData[559] = 0;
  _$jscoverage['/editor/selection.js'].lineData[560] = 0;
  _$jscoverage['/editor/selection.js'].lineData[561] = 0;
  _$jscoverage['/editor/selection.js'].lineData[563] = 0;
  _$jscoverage['/editor/selection.js'].lineData[564] = 0;
  _$jscoverage['/editor/selection.js'].lineData[565] = 0;
  _$jscoverage['/editor/selection.js'].lineData[573] = 0;
  _$jscoverage['/editor/selection.js'].lineData[577] = 0;
  _$jscoverage['/editor/selection.js'].lineData[580] = 0;
  _$jscoverage['/editor/selection.js'].lineData[581] = 0;
  _$jscoverage['/editor/selection.js'].lineData[584] = 0;
  _$jscoverage['/editor/selection.js'].lineData[585] = 0;
  _$jscoverage['/editor/selection.js'].lineData[587] = 0;
  _$jscoverage['/editor/selection.js'].lineData[589] = 0;
  _$jscoverage['/editor/selection.js'].lineData[593] = 0;
  _$jscoverage['/editor/selection.js'].lineData[596] = 0;
  _$jscoverage['/editor/selection.js'].lineData[597] = 0;
  _$jscoverage['/editor/selection.js'].lineData[600] = 0;
  _$jscoverage['/editor/selection.js'].lineData[603] = 0;
  _$jscoverage['/editor/selection.js'].lineData[607] = 0;
  _$jscoverage['/editor/selection.js'].lineData[608] = 0;
  _$jscoverage['/editor/selection.js'].lineData[609] = 0;
  _$jscoverage['/editor/selection.js'].lineData[610] = 0;
  _$jscoverage['/editor/selection.js'].lineData[611] = 0;
  _$jscoverage['/editor/selection.js'].lineData[613] = 0;
  _$jscoverage['/editor/selection.js'].lineData[617] = 0;
  _$jscoverage['/editor/selection.js'].lineData[618] = 0;
  _$jscoverage['/editor/selection.js'].lineData[622] = 0;
  _$jscoverage['/editor/selection.js'].lineData[623] = 0;
  _$jscoverage['/editor/selection.js'].lineData[625] = 0;
  _$jscoverage['/editor/selection.js'].lineData[626] = 0;
  _$jscoverage['/editor/selection.js'].lineData[628] = 0;
  _$jscoverage['/editor/selection.js'].lineData[629] = 0;
  _$jscoverage['/editor/selection.js'].lineData[631] = 0;
  _$jscoverage['/editor/selection.js'].lineData[632] = 0;
  _$jscoverage['/editor/selection.js'].lineData[637] = 0;
  _$jscoverage['/editor/selection.js'].lineData[641] = 0;
  _$jscoverage['/editor/selection.js'].lineData[642] = 0;
  _$jscoverage['/editor/selection.js'].lineData[643] = 0;
  _$jscoverage['/editor/selection.js'].lineData[644] = 0;
  _$jscoverage['/editor/selection.js'].lineData[645] = 0;
  _$jscoverage['/editor/selection.js'].lineData[647] = 0;
  _$jscoverage['/editor/selection.js'].lineData[648] = 0;
  _$jscoverage['/editor/selection.js'].lineData[652] = 0;
  _$jscoverage['/editor/selection.js'].lineData[655] = 0;
  _$jscoverage['/editor/selection.js'].lineData[662] = 0;
  _$jscoverage['/editor/selection.js'].lineData[663] = 0;
  _$jscoverage['/editor/selection.js'].lineData[664] = 0;
  _$jscoverage['/editor/selection.js'].lineData[672] = 0;
  _$jscoverage['/editor/selection.js'].lineData[673] = 0;
  _$jscoverage['/editor/selection.js'].lineData[674] = 0;
  _$jscoverage['/editor/selection.js'].lineData[675] = 0;
  _$jscoverage['/editor/selection.js'].lineData[678] = 0;
  _$jscoverage['/editor/selection.js'].lineData[679] = 0;
  _$jscoverage['/editor/selection.js'].lineData[685] = 0;
  _$jscoverage['/editor/selection.js'].lineData[692] = 0;
  _$jscoverage['/editor/selection.js'].lineData[694] = 0;
  _$jscoverage['/editor/selection.js'].lineData[698] = 0;
  _$jscoverage['/editor/selection.js'].lineData[700] = 0;
  _$jscoverage['/editor/selection.js'].lineData[704] = 0;
  _$jscoverage['/editor/selection.js'].lineData[705] = 0;
  _$jscoverage['/editor/selection.js'].lineData[708] = 0;
  _$jscoverage['/editor/selection.js'].lineData[709] = 0;
  _$jscoverage['/editor/selection.js'].lineData[711] = 0;
  _$jscoverage['/editor/selection.js'].lineData[712] = 0;
  _$jscoverage['/editor/selection.js'].lineData[717] = 0;
  _$jscoverage['/editor/selection.js'].lineData[718] = 0;
  _$jscoverage['/editor/selection.js'].lineData[719] = 0;
  _$jscoverage['/editor/selection.js'].lineData[721] = 0;
  _$jscoverage['/editor/selection.js'].lineData[725] = 0;
  _$jscoverage['/editor/selection.js'].lineData[726] = 0;
  _$jscoverage['/editor/selection.js'].lineData[727] = 0;
  _$jscoverage['/editor/selection.js'].lineData[731] = 0;
  _$jscoverage['/editor/selection.js'].lineData[737] = 0;
  _$jscoverage['/editor/selection.js'].lineData[741] = 0;
  _$jscoverage['/editor/selection.js'].lineData[742] = 0;
  _$jscoverage['/editor/selection.js'].lineData[743] = 0;
  _$jscoverage['/editor/selection.js'].lineData[744] = 0;
  _$jscoverage['/editor/selection.js'].lineData[749] = 0;
  _$jscoverage['/editor/selection.js'].lineData[753] = 0;
  _$jscoverage['/editor/selection.js'].lineData[756] = 0;
  _$jscoverage['/editor/selection.js'].lineData[760] = 0;
  _$jscoverage['/editor/selection.js'].lineData[761] = 0;
  _$jscoverage['/editor/selection.js'].lineData[765] = 0;
  _$jscoverage['/editor/selection.js'].lineData[768] = 0;
  _$jscoverage['/editor/selection.js'].lineData[770] = 0;
  _$jscoverage['/editor/selection.js'].lineData[772] = 0;
  _$jscoverage['/editor/selection.js'].lineData[774] = 0;
  _$jscoverage['/editor/selection.js'].lineData[776] = 0;
  _$jscoverage['/editor/selection.js'].lineData[778] = 0;
  _$jscoverage['/editor/selection.js'].lineData[779] = 0;
  _$jscoverage['/editor/selection.js'].lineData[785] = 0;
  _$jscoverage['/editor/selection.js'].lineData[786] = 0;
  _$jscoverage['/editor/selection.js'].lineData[787] = 0;
  _$jscoverage['/editor/selection.js'].lineData[789] = 0;
  _$jscoverage['/editor/selection.js'].lineData[805] = 0;
  _$jscoverage['/editor/selection.js'].lineData[806] = 0;
  _$jscoverage['/editor/selection.js'].lineData[807] = 0;
  _$jscoverage['/editor/selection.js'].lineData[808] = 0;
  _$jscoverage['/editor/selection.js'].lineData[813] = 0;
  _$jscoverage['/editor/selection.js'].lineData[818] = 0;
  _$jscoverage['/editor/selection.js'].lineData[819] = 0;
  _$jscoverage['/editor/selection.js'].lineData[821] = 0;
  _$jscoverage['/editor/selection.js'].lineData[822] = 0;
  _$jscoverage['/editor/selection.js'].lineData[824] = 0;
  _$jscoverage['/editor/selection.js'].lineData[825] = 0;
  _$jscoverage['/editor/selection.js'].lineData[827] = 0;
  _$jscoverage['/editor/selection.js'].lineData[829] = 0;
  _$jscoverage['/editor/selection.js'].lineData[831] = 0;
  _$jscoverage['/editor/selection.js'].lineData[832] = 0;
  _$jscoverage['/editor/selection.js'].lineData[833] = 0;
  _$jscoverage['/editor/selection.js'].lineData[836] = 0;
  _$jscoverage['/editor/selection.js'].lineData[837] = 0;
  _$jscoverage['/editor/selection.js'].lineData[838] = 0;
  _$jscoverage['/editor/selection.js'].lineData[842] = 0;
  _$jscoverage['/editor/selection.js'].lineData[843] = 0;
  _$jscoverage['/editor/selection.js'].lineData[844] = 0;
  _$jscoverage['/editor/selection.js'].lineData[847] = 0;
  _$jscoverage['/editor/selection.js'].lineData[849] = 0;
  _$jscoverage['/editor/selection.js'].lineData[851] = 0;
}
if (! _$jscoverage['/editor/selection.js'].functionData) {
  _$jscoverage['/editor/selection.js'].functionData = [];
  _$jscoverage['/editor/selection.js'].functionData[0] = 0;
  _$jscoverage['/editor/selection.js'].functionData[1] = 0;
  _$jscoverage['/editor/selection.js'].functionData[2] = 0;
  _$jscoverage['/editor/selection.js'].functionData[3] = 0;
  _$jscoverage['/editor/selection.js'].functionData[4] = 0;
  _$jscoverage['/editor/selection.js'].functionData[5] = 0;
  _$jscoverage['/editor/selection.js'].functionData[6] = 0;
  _$jscoverage['/editor/selection.js'].functionData[7] = 0;
  _$jscoverage['/editor/selection.js'].functionData[8] = 0;
  _$jscoverage['/editor/selection.js'].functionData[9] = 0;
  _$jscoverage['/editor/selection.js'].functionData[10] = 0;
  _$jscoverage['/editor/selection.js'].functionData[11] = 0;
  _$jscoverage['/editor/selection.js'].functionData[12] = 0;
  _$jscoverage['/editor/selection.js'].functionData[13] = 0;
  _$jscoverage['/editor/selection.js'].functionData[14] = 0;
  _$jscoverage['/editor/selection.js'].functionData[15] = 0;
  _$jscoverage['/editor/selection.js'].functionData[16] = 0;
  _$jscoverage['/editor/selection.js'].functionData[17] = 0;
  _$jscoverage['/editor/selection.js'].functionData[18] = 0;
  _$jscoverage['/editor/selection.js'].functionData[19] = 0;
  _$jscoverage['/editor/selection.js'].functionData[20] = 0;
  _$jscoverage['/editor/selection.js'].functionData[21] = 0;
  _$jscoverage['/editor/selection.js'].functionData[22] = 0;
  _$jscoverage['/editor/selection.js'].functionData[23] = 0;
  _$jscoverage['/editor/selection.js'].functionData[24] = 0;
}
if (! _$jscoverage['/editor/selection.js'].branchData) {
  _$jscoverage['/editor/selection.js'].branchData = {};
  _$jscoverage['/editor/selection.js'].branchData['51'] = [];
  _$jscoverage['/editor/selection.js'].branchData['51'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['54'] = [];
  _$jscoverage['/editor/selection.js'].branchData['54'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['54'][2] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['54'][3] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['54'][4] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['55'] = [];
  _$jscoverage['/editor/selection.js'].branchData['55'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['55'][2] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['102'] = [];
  _$jscoverage['/editor/selection.js'].branchData['102'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['107'] = [];
  _$jscoverage['/editor/selection.js'].branchData['107'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['131'] = [];
  _$jscoverage['/editor/selection.js'].branchData['131'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['138'] = [];
  _$jscoverage['/editor/selection.js'].branchData['138'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['140'] = [];
  _$jscoverage['/editor/selection.js'].branchData['140'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['147'] = [];
  _$jscoverage['/editor/selection.js'].branchData['147'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['147'][2] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['148'] = [];
  _$jscoverage['/editor/selection.js'].branchData['148'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['148'][2] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['149'] = [];
  _$jscoverage['/editor/selection.js'].branchData['149'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['149'][2] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['160'] = [];
  _$jscoverage['/editor/selection.js'].branchData['160'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['170'] = [];
  _$jscoverage['/editor/selection.js'].branchData['170'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['174'] = [];
  _$jscoverage['/editor/selection.js'].branchData['174'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['183'] = [];
  _$jscoverage['/editor/selection.js'].branchData['183'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['207'] = [];
  _$jscoverage['/editor/selection.js'].branchData['207'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['210'] = [];
  _$jscoverage['/editor/selection.js'].branchData['210'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['220'] = [];
  _$jscoverage['/editor/selection.js'].branchData['220'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['222'] = [];
  _$jscoverage['/editor/selection.js'].branchData['222'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['222'][2] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['222'][3] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['222'][4] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['226'] = [];
  _$jscoverage['/editor/selection.js'].branchData['226'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['234'] = [];
  _$jscoverage['/editor/selection.js'].branchData['234'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['248'] = [];
  _$jscoverage['/editor/selection.js'].branchData['248'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['260'] = [];
  _$jscoverage['/editor/selection.js'].branchData['260'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['275'] = [];
  _$jscoverage['/editor/selection.js'].branchData['275'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['284'] = [];
  _$jscoverage['/editor/selection.js'].branchData['284'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['288'] = [];
  _$jscoverage['/editor/selection.js'].branchData['288'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['292'] = [];
  _$jscoverage['/editor/selection.js'].branchData['292'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['300'] = [];
  _$jscoverage['/editor/selection.js'].branchData['300'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['303'] = [];
  _$jscoverage['/editor/selection.js'].branchData['303'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['311'] = [];
  _$jscoverage['/editor/selection.js'].branchData['311'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['311'][2] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['311'][3] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['329'] = [];
  _$jscoverage['/editor/selection.js'].branchData['329'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['339'] = [];
  _$jscoverage['/editor/selection.js'].branchData['339'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['343'] = [];
  _$jscoverage['/editor/selection.js'].branchData['343'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['366'] = [];
  _$jscoverage['/editor/selection.js'].branchData['366'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['381'] = [];
  _$jscoverage['/editor/selection.js'].branchData['381'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['382'] = [];
  _$jscoverage['/editor/selection.js'].branchData['382'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['392'] = [];
  _$jscoverage['/editor/selection.js'].branchData['392'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['392'][2] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['392'][3] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['402'] = [];
  _$jscoverage['/editor/selection.js'].branchData['402'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['408'] = [];
  _$jscoverage['/editor/selection.js'].branchData['408'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['408'][2] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['413'] = [];
  _$jscoverage['/editor/selection.js'].branchData['413'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['413'][2] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['421'] = [];
  _$jscoverage['/editor/selection.js'].branchData['421'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['427'] = [];
  _$jscoverage['/editor/selection.js'].branchData['427'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['427'][2] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['430'] = [];
  _$jscoverage['/editor/selection.js'].branchData['430'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['455'] = [];
  _$jscoverage['/editor/selection.js'].branchData['455'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['460'] = [];
  _$jscoverage['/editor/selection.js'].branchData['460'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['462'] = [];
  _$jscoverage['/editor/selection.js'].branchData['462'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['468'] = [];
  _$jscoverage['/editor/selection.js'].branchData['468'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['479'] = [];
  _$jscoverage['/editor/selection.js'].branchData['479'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['479'][2] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['480'] = [];
  _$jscoverage['/editor/selection.js'].branchData['480'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['480'][2] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['482'] = [];
  _$jscoverage['/editor/selection.js'].branchData['482'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['511'] = [];
  _$jscoverage['/editor/selection.js'].branchData['511'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['543'] = [];
  _$jscoverage['/editor/selection.js'].branchData['543'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['544'] = [];
  _$jscoverage['/editor/selection.js'].branchData['544'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['553'] = [];
  _$jscoverage['/editor/selection.js'].branchData['553'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['560'] = [];
  _$jscoverage['/editor/selection.js'].branchData['560'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['564'] = [];
  _$jscoverage['/editor/selection.js'].branchData['564'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['573'] = [];
  _$jscoverage['/editor/selection.js'].branchData['573'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['574'] = [];
  _$jscoverage['/editor/selection.js'].branchData['574'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['574'][2] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['574'][3] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['574'][4] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['574'][5] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['575'] = [];
  _$jscoverage['/editor/selection.js'].branchData['575'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['575'][2] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['596'] = [];
  _$jscoverage['/editor/selection.js'].branchData['596'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['607'] = [];
  _$jscoverage['/editor/selection.js'].branchData['607'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['609'] = [];
  _$jscoverage['/editor/selection.js'].branchData['609'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['617'] = [];
  _$jscoverage['/editor/selection.js'].branchData['617'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['622'] = [];
  _$jscoverage['/editor/selection.js'].branchData['622'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['625'] = [];
  _$jscoverage['/editor/selection.js'].branchData['625'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['628'] = [];
  _$jscoverage['/editor/selection.js'].branchData['628'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['631'] = [];
  _$jscoverage['/editor/selection.js'].branchData['631'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['642'] = [];
  _$jscoverage['/editor/selection.js'].branchData['642'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['663'] = [];
  _$jscoverage['/editor/selection.js'].branchData['663'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['673'] = [];
  _$jscoverage['/editor/selection.js'].branchData['673'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['674'] = [];
  _$jscoverage['/editor/selection.js'].branchData['674'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['678'] = [];
  _$jscoverage['/editor/selection.js'].branchData['678'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['698'] = [];
  _$jscoverage['/editor/selection.js'].branchData['698'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['699'] = [];
  _$jscoverage['/editor/selection.js'].branchData['699'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['699'][2] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['717'] = [];
  _$jscoverage['/editor/selection.js'].branchData['717'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['740'] = [];
  _$jscoverage['/editor/selection.js'].branchData['740'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['740'][2] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['740'][3] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['742'] = [];
  _$jscoverage['/editor/selection.js'].branchData['742'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['749'] = [];
  _$jscoverage['/editor/selection.js'].branchData['749'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['749'][2] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['749'][3] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['751'] = [];
  _$jscoverage['/editor/selection.js'].branchData['751'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['751'][2] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['760'] = [];
  _$jscoverage['/editor/selection.js'].branchData['760'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['772'] = [];
  _$jscoverage['/editor/selection.js'].branchData['772'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['786'] = [];
  _$jscoverage['/editor/selection.js'].branchData['786'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['790'] = [];
  _$jscoverage['/editor/selection.js'].branchData['790'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['790'][2] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['790'][3] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['792'] = [];
  _$jscoverage['/editor/selection.js'].branchData['792'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['792'][2] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['794'] = [];
  _$jscoverage['/editor/selection.js'].branchData['794'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['795'] = [];
  _$jscoverage['/editor/selection.js'].branchData['795'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['808'] = [];
  _$jscoverage['/editor/selection.js'].branchData['808'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['813'] = [];
  _$jscoverage['/editor/selection.js'].branchData['813'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['821'] = [];
  _$jscoverage['/editor/selection.js'].branchData['821'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['822'] = [];
  _$jscoverage['/editor/selection.js'].branchData['822'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['831'] = [];
  _$jscoverage['/editor/selection.js'].branchData['831'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['844'] = [];
  _$jscoverage['/editor/selection.js'].branchData['844'][1] = new BranchData();
}
_$jscoverage['/editor/selection.js'].branchData['844'][1].init(59, 21, '!sel || sel.isInvalid');
function visit819_844_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['844'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['831'][1].init(473, 9, 'dummySpan');
function visit818_831_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['831'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['822'][1].init(26, 18, 'isStartMarkerAlone');
function visit817_822_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['822'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['821'][1].init(5025, 9, 'collapsed');
function visit816_821_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['821'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['813'][1].init(381, 25, 'startNode[0] || startNode');
function visit815_813_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['813'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['808'][1].init(1775, 18, 'isStartMarkerAlone');
function visit814_808_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['808'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['795'][1].init(72, 51, 'Dom.nodeName(startNode[0].previousSibling) === \'br\'');
function visit813_795_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['795'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['794'][1].init(-1, 124, 'startNode[0].previousSibling && Dom.nodeName(startNode[0].previousSibling) === \'br\'');
function visit812_794_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['794'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['792'][2].init(170, 268, '!startNode[0].previousSibling || (startNode[0].previousSibling && Dom.nodeName(startNode[0].previousSibling) === \'br\')');
function visit811_792_2(result) {
  _$jscoverage['/editor/selection.js'].branchData['792'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['792'][1].init(155, 283, 'forceExpand || !startNode[0].previousSibling || (startNode[0].previousSibling && Dom.nodeName(startNode[0].previousSibling) === \'br\')');
function visit810_792_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['792'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['790'][3].init(58, 55, 'next.nodeValue && next.nodeValue.match(fillerTextRegex)');
function visit809_790_3(result) {
  _$jscoverage['/editor/selection.js'].branchData['790'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['790'][2].init(50, 63, 'next && next.nodeValue && next.nodeValue.match(fillerTextRegex)');
function visit808_790_2(result) {
  _$jscoverage['/editor/selection.js'].branchData['790'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['790'][1].init(-1, 474, '!(next && next.nodeValue && next.nodeValue.match(fillerTextRegex)) && (forceExpand || !startNode[0].previousSibling || (startNode[0].previousSibling && Dom.nodeName(startNode[0].previousSibling) === \'br\'))');
function visit807_790_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['790'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['786'][1].init(433, 29, 'next && !notWhitespaces(next)');
function visit806_786_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['786'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['772'][1].init(2061, 7, 'endNode');
function visit805_772_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['772'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['760'][1].init(1595, 10, '!collapsed');
function visit804_760_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['760'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['751'][2].init(1152, 59, 'self.endContainer[0].nodeType === Dom.NodeType.ELEMENT_NODE');
function visit803_751_2(result) {
  _$jscoverage['/editor/selection.js'].branchData['751'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['751'][1].init(152, 128, 'self.endContainer[0].nodeType === Dom.NodeType.ELEMENT_NODE && self.endContainer.nodeName() in nonCells');
function visit802_751_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['751'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['749'][3].init(997, 61, 'self.startContainer[0].nodeType === Dom.NodeType.ELEMENT_NODE');
function visit801_749_3(result) {
  _$jscoverage['/editor/selection.js'].branchData['749'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['749'][2].init(997, 128, 'self.startContainer[0].nodeType === Dom.NodeType.ELEMENT_NODE && self.startContainer.nodeName() in nonCells');
function visit800_749_2(result) {
  _$jscoverage['/editor/selection.js'].branchData['749'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['749'][1].init(997, 281, 'self.startContainer[0].nodeType === Dom.NodeType.ELEMENT_NODE && self.startContainer.nodeName() in nonCells || self.endContainer[0].nodeType === Dom.NodeType.ELEMENT_NODE && self.endContainer.nodeName() in nonCells');
function visit799_749_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['749'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['742'][1].init(112, 44, 'selEl.nodeType === Dom.NodeType.ELEMENT_NODE');
function visit798_742_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['742'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['740'][3].init(50, 39, 'self.endOffset - self.startOffset === 1');
function visit797_740_3(result) {
  _$jscoverage['/editor/selection.js'].branchData['740'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['740'][2].init(350, 47, 'self.startContainer[0] === self.endContainer[0]');
function visit796_740_2(result) {
  _$jscoverage['/editor/selection.js'].branchData['740'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['740'][1].init(91, 90, 'self.startContainer[0] === self.endContainer[0] && self.endOffset - self.startOffset === 1');
function visit795_740_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['740'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['717'][1].init(280, 51, 'e.toString().indexOf(\'NS_ERROR_ILLEGAL_VALUE\') >= 0');
function visit794_717_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['717'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['699'][2].init(282, 56, 'startContainer[0].nodeType === Dom.NodeType.ELEMENT_NODE');
function visit793_699_2(result) {
  _$jscoverage['/editor/selection.js'].branchData['699'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['699'][1].init(34, 96, 'startContainer[0].nodeType === Dom.NodeType.ELEMENT_NODE && !startContainer[0].childNodes.length');
function visit792_699_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['699'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['698'][1].init(245, 131, 'self.collapsed && startContainer[0].nodeType === Dom.NodeType.ELEMENT_NODE && !startContainer[0].childNodes.length');
function visit791_698_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['698'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['678'][1].init(22, 3, 'sel');
function visit790_678_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['678'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['674'][1].init(22, 3, 'sel');
function visit789_674_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['674'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['673'][1].init(59, 7, '!OLD_IE');
function visit788_673_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['673'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['663'][1].init(200, 5, 'start');
function visit787_663_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['663'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['642'][1].init(73, 20, 'i < bookmarks.length');
function visit786_642_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['642'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['631'][1].init(646, 42, 'Dom.equals(rangeEnd, bookmarkEnd.parent())');
function visit785_631_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['631'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['628'][1].init(501, 44, 'Dom.equals(rangeEnd, bookmarkStart.parent())');
function visit784_628_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['628'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['625'][1].init(354, 44, 'Dom.equals(rangeStart, bookmarkEnd.parent())');
function visit783_625_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['625'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['622'][1].init(205, 46, 'Dom.equals(rangeStart, bookmarkStart.parent())');
function visit782_622_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['622'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['617'][1].init(500, 10, 'j < length');
function visit781_617_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['617'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['609'][1].init(246, 10, 'i < length');
function visit780_609_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['609'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['607'][1].init(148, 26, 'ranges || self.getRanges()');
function visit779_607_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['607'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['596'][1].init(109, 17, 'i < ranges.length');
function visit778_596_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['596'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['575'][2].init(599, 56, 'startContainer[0].nodeType === Dom.NodeType.ELEMENT_NODE');
function visit777_575_2(result) {
  _$jscoverage['/editor/selection.js'].branchData['575'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['575'][1].init(84, 96, 'startContainer[0].nodeType === Dom.NodeType.ELEMENT_NODE && !startContainer[0].childNodes.length');
function visit776_575_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['575'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['574'][5].init(547, 21, 'UA.opera || UA.webkit');
function visit775_574_5(result) {
  _$jscoverage['/editor/selection.js'].branchData['574'][5].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['574'][4].init(525, 17, 'UA.gecko < 1.0900');
function visit774_574_4(result) {
  _$jscoverage['/editor/selection.js'].branchData['574'][4].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['574'][3].init(513, 29, 'UA.gecko && UA.gecko < 1.0900');
function visit773_574_3(result) {
  _$jscoverage['/editor/selection.js'].branchData['574'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['574'][2].init(513, 55, '(UA.gecko && UA.gecko < 1.0900) || UA.opera || UA.webkit');
function visit772_574_2(result) {
  _$jscoverage['/editor/selection.js'].branchData['574'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['574'][1].init(45, 181, '((UA.gecko && UA.gecko < 1.0900) || UA.opera || UA.webkit) && startContainer[0].nodeType === Dom.NodeType.ELEMENT_NODE && !startContainer[0].childNodes.length');
function visit771_574_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['574'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['573'][1].init(465, 227, 'range.collapsed && ((UA.gecko && UA.gecko < 1.0900) || UA.opera || UA.webkit) && startContainer[0].nodeType === Dom.NodeType.ELEMENT_NODE && !startContainer[0].childNodes.length');
function visit770_573_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['573'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['564'][1].init(196, 17, 'i < ranges.length');
function visit769_564_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['564'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['560'][1].init(67, 4, '!sel');
function visit768_560_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['560'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['553'][1].init(474, 11, 'ranges[0]');
function visit767_553_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['553'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['544'][1].init(22, 17, 'ranges.length > 1');
function visit766_544_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['544'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['543'][1].init(48, 6, 'OLD_IE');
function visit765_543_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['543'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['511'][1].init(110, 6, 'OLD_IE');
function visit764_511_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['511'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['482'][1].init(130, 97, 'styleObjectElements[enclosed.nodeName()] && (selected = enclosed)');
function visit763_482_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['482'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['480'][2].init(74, 50, 'enclosed[0].nodeType === Dom.NodeType.ELEMENT_NODE');
function visit762_480_2(result) {
  _$jscoverage['/editor/selection.js'].branchData['480'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['480'][1].init(69, 228, '(enclosed[0].nodeType === Dom.NodeType.ELEMENT_NODE) && styleObjectElements[enclosed.nodeName()] && (selected = enclosed)');
function visit761_480_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['480'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['479'][2].init(368, 298, '(enclosed = range.getEnclosedNode()) && (enclosed[0].nodeType === Dom.NodeType.ELEMENT_NODE) && styleObjectElements[enclosed.nodeName()] && (selected = enclosed)');
function visit760_479_2(result) {
  _$jscoverage['/editor/selection.js'].branchData['479'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['479'][1].init(41, 307, 'i && !((enclosed = range.getEnclosedNode()) && (enclosed[0].nodeType === Dom.NodeType.ELEMENT_NODE) && styleObjectElements[enclosed.nodeName()] && (selected = enclosed))');
function visit759_479_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['479'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['468'][1].init(584, 5, '!node');
function visit758_468_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['468'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['462'][1].init(86, 27, 'range.item && range.item(0)');
function visit757_462_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['462'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['460'][1].init(288, 6, 'OLD_IE');
function visit756_460_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['460'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['455'][1].init(112, 35, 'cache.selectedElement !== undefined');
function visit755_455_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['455'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['430'][1].init(242, 4, 'node');
function visit754_430_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['430'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['427'][2].init(86, 43, 'node.nodeType !== Dom.NodeType.ELEMENT_NODE');
function visit753_427_2(result) {
  _$jscoverage['/editor/selection.js'].branchData['427'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['427'][1].init(78, 51, 'node && node.nodeType !== Dom.NodeType.ELEMENT_NODE');
function visit752_427_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['427'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['421'][1].init(2118, 6, 'OLD_IE');
function visit751_421_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['421'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['413'][2].init(1639, 44, 'child.nodeType === Dom.NodeType.ELEMENT_NODE');
function visit750_413_2(result) {
  _$jscoverage['/editor/selection.js'].branchData['413'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['413'][1].init(1630, 53, 'child && child.nodeType === Dom.NodeType.ELEMENT_NODE');
function visit749_413_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['413'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['408'][2].init(1388, 46, 'node[0].nodeType !== Dom.NodeType.ELEMENT_NODE');
function visit748_408_2(result) {
  _$jscoverage['/editor/selection.js'].branchData['408'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['408'][1].init(1376, 58, '!node[0] || node[0].nodeType !== Dom.NodeType.ELEMENT_NODE');
function visit747_408_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['408'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['402'][1].init(1118, 46, 'node[0].nodeType !== Dom.NodeType.ELEMENT_NODE');
function visit746_402_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['402'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['392'][3].init(286, 56, 'startContainer[0].nodeType === Dom.NodeType.ELEMENT_NODE');
function visit745_392_3(result) {
  _$jscoverage['/editor/selection.js'].branchData['392'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['392'][2].init(269, 186, 'startOffset === (startContainer[0].nodeType === Dom.NodeType.ELEMENT_NODE ? startContainer[0].childNodes.length : startContainer[0].nodeValue.length)');
function visit744_392_2(result) {
  _$jscoverage['/editor/selection.js'].branchData['392'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['392'][1].init(269, 226, 'startOffset === (startContainer[0].nodeType === Dom.NodeType.ELEMENT_NODE ? startContainer[0].childNodes.length : startContainer[0].nodeValue.length) && !startContainer._4eIsBlockBoundary()');
function visit743_392_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['392'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['382'][1].init(30, 16, '!range.collapsed');
function visit742_382_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['382'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['381'][1].init(108, 5, 'range');
function visit741_381_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['381'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['366'][1].init(70, 32, 'cache.startElement !== undefined');
function visit740_366_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['366'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['343'][1].init(501, 18, 'i < sel.rangeCount');
function visit739_343_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['343'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['339'][1].init(407, 4, '!sel');
function visit738_339_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['339'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['329'][1].init(78, 22, 'cache.ranges && !force');
function visit737_329_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['329'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['311'][3].init(372, 39, 'parentElement.childNodes[j] !== element');
function visit736_311_3(result) {
  _$jscoverage['/editor/selection.js'].branchData['311'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['311'][2].init(333, 35, 'j < parentElement.childNodes.length');
function visit735_311_2(result) {
  _$jscoverage['/editor/selection.js'].branchData['311'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['311'][1].init(333, 78, 'j < parentElement.childNodes.length && parentElement.childNodes[j] !== element');
function visit734_311_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['311'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['303'][1].init(101, 22, 'i < nativeRange.length');
function visit733_303_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['303'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['300'][1].init(1263, 30, 'type === KES.SELECTION_ELEMENT');
function visit732_300_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['300'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['292'][1].init(694, 27, 'type === KES.SELECTION_TEXT');
function visit731_292_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['292'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['288'][1].init(600, 4, '!sel');
function visit730_288_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['288'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['284'][1].init(66, 24, 'sel && sel.createRange()');
function visit729_284_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['284'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['275'][1].init(86, 22, 'cache.ranges && !force');
function visit728_275_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['275'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['260'][1].init(2989, 14, 'distance === 0');
function visit727_260_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['260'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['248'][1].init(33, 12, 'distance > 0');
function visit726_248_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['248'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['234'][1].init(1757, 10, '!testRange');
function visit725_234_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['234'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['226'][1].init(941, 14, '!comparisonEnd');
function visit724_226_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['226'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['222'][4].init(602, 22, 'comparisonStart === -1');
function visit723_222_4(result) {
  _$jscoverage['/editor/selection.js'].branchData['222'][4].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['222'][3].init(579, 19, 'comparisonEnd === 1');
function visit722_222_3(result) {
  _$jscoverage['/editor/selection.js'].branchData['222'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['222'][2].init(579, 45, 'comparisonEnd === 1 && comparisonStart === -1');
function visit721_222_2(result) {
  _$jscoverage['/editor/selection.js'].branchData['222'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['222'][1].init(559, 65, '!comparisonStart || comparisonEnd === 1 && comparisonStart === -1');
function visit720_222_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['222'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['220'][1].init(455, 19, 'comparisonStart > 0');
function visit719_220_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['220'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['210'][1].init(84, 44, 'child.nodeType === Dom.NodeType.ELEMENT_NODE');
function visit718_210_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['210'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['207'][1].init(409, 19, 'i < siblings.length');
function visit717_207_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['207'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['183'][1].init(718, 31, 'sel.createRange().parentElement');
function visit716_183_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['183'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['174'][1].init(244, 20, 'ieType === \'Control\'');
function visit715_174_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['174'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['170'][1].init(121, 17, 'ieType === \'Text\'');
function visit714_170_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['170'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['160'][1].init(78, 10, 'cache.type');
function visit713_160_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['160'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['149'][2].init(414, 49, 'Number(range.endOffset - range.startOffset) === 1');
function visit712_149_2(result) {
  _$jscoverage['/editor/selection.js'].branchData['149'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['149'][1].init(81, 170, 'Number(range.endOffset - range.startOffset) === 1 && styleObjectElements[startContainer.childNodes[range.startOffset].nodeName.toLowerCase()]');
function visit711_149_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['149'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['148'][2].init(331, 53, 'startContainer.nodeType === Dom.NodeType.ELEMENT_NODE');
function visit710_148_2(result) {
  _$jscoverage['/editor/selection.js'].branchData['148'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['148'][1].init(65, 252, 'startContainer.nodeType === Dom.NodeType.ELEMENT_NODE && Number(range.endOffset - range.startOffset) === 1 && styleObjectElements[startContainer.childNodes[range.startOffset].nodeName.toLowerCase()]');
function visit709_148_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['148'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['147'][2].init(263, 37, 'startContainer === range.endContainer');
function visit708_147_2(result) {
  _$jscoverage['/editor/selection.js'].branchData['147'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['147'][1].init(263, 318, 'startContainer === range.endContainer && startContainer.nodeType === Dom.NodeType.ELEMENT_NODE && Number(range.endOffset - range.startOffset) === 1 && styleObjectElements[startContainer.childNodes[range.startOffset].nodeName.toLowerCase()]');
function visit707_147_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['147'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['140'][1].init(354, 20, 'sel.rangeCount === 1');
function visit706_140_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['140'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['138'][1].init(269, 4, '!sel');
function visit705_138_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['138'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['131'][1].init(78, 10, 'cache.type');
function visit704_131_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['131'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['107'][1].init(81, 62, 'cache.nativeSel || (cache.nativeSel = self.document.selection)');
function visit703_107_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['107'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['102'][1].init(102, 82, 'cache.nativeSel || (cache.nativeSel = Dom.getWindow(self.document).getSelection())');
function visit702_102_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['102'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['55'][2].init(103, 48, 'range.parentElement().ownerDocument !== document');
function visit701_55_2(result) {
  _$jscoverage['/editor/selection.js'].branchData['55'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['55'][1].init(80, 71, 'range.parentElement && range.parentElement().ownerDocument !== document');
function visit700_55_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['55'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['54'][4].init(108, 40, 'range.item(0).ownerDocument !== document');
function visit699_54_4(result) {
  _$jscoverage['/editor/selection.js'].branchData['54'][4].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['54'][3].init(94, 54, 'range.item && range.item(0).ownerDocument !== document');
function visit698_54_3(result) {
  _$jscoverage['/editor/selection.js'].branchData['54'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['54'][2].init(94, 153, '(range.item && range.item(0).ownerDocument !== document) || (range.parentElement && range.parentElement().ownerDocument !== document)');
function visit697_54_2(result) {
  _$jscoverage['/editor/selection.js'].branchData['54'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['54'][1].init(83, 164, '!range || (range.item && range.item(0).ownerDocument !== document) || (range.parentElement && range.parentElement().ownerDocument !== document)');
function visit696_54_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['54'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['51'][1].init(296, 6, 'OLD_IE');
function visit695_51_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['51'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].lineData[10]++;
KISSY.add(function(S, require) {
  _$jscoverage['/editor/selection.js'].functionData[0]++;
  _$jscoverage['/editor/selection.js'].lineData[11]++;
  var Node = require('node');
  _$jscoverage['/editor/selection.js'].lineData[12]++;
  var Walker = require('./walker');
  _$jscoverage['/editor/selection.js'].lineData[13]++;
  var KERange = require('./range');
  _$jscoverage['/editor/selection.js'].lineData[14]++;
  var Editor = require('./base');
  _$jscoverage['/editor/selection.js'].lineData[19]++;
  Editor.SelectionType = {
  SELECTION_NONE: 1, 
  SELECTION_TEXT: 2, 
  SELECTION_ELEMENT: 3};
  _$jscoverage['/editor/selection.js'].lineData[24]++;
  var TRUE = true, FALSE = false, NULL = null, UA = S.UA, Dom = S.require('dom'), KES = Editor.SelectionType, KER = Editor.RangeType, OLD_IE = document.selection;
  _$jscoverage['/editor/selection.js'].lineData[40]++;
  function KESelection(document) {
    _$jscoverage['/editor/selection.js'].functionData[1]++;
    _$jscoverage['/editor/selection.js'].lineData[41]++;
    var self = this;
    _$jscoverage['/editor/selection.js'].lineData[42]++;
    self.document = document;
    _$jscoverage['/editor/selection.js'].lineData[43]++;
    self._ = {
  cache: {}};
    _$jscoverage['/editor/selection.js'].lineData[51]++;
    if (visit695_51_1(OLD_IE)) {
      _$jscoverage['/editor/selection.js'].lineData[52]++;
      try {
        _$jscoverage['/editor/selection.js'].lineData[53]++;
        var range = self.getNative().createRange();
        _$jscoverage['/editor/selection.js'].lineData[54]++;
        if (visit696_54_1(!range || visit697_54_2((visit698_54_3(range.item && visit699_54_4(range.item(0).ownerDocument !== document))) || (visit700_55_1(range.parentElement && visit701_55_2(range.parentElement().ownerDocument !== document)))))) {
          _$jscoverage['/editor/selection.js'].lineData[56]++;
          self.isInvalid = TRUE;
        }
      }      catch (e) {
  _$jscoverage['/editor/selection.js'].lineData[62]++;
  self.isInvalid = TRUE;
}
    }
  }
  _$jscoverage['/editor/selection.js'].lineData[67]++;
  var styleObjectElements = {
  img: 1, 
  hr: 1, 
  li: 1, 
  table: 1, 
  tr: 1, 
  td: 1, 
  th: 1, 
  embed: 1, 
  object: 1, 
  ol: 1, 
  ul: 1, 
  a: 1, 
  input: 1, 
  form: 1, 
  select: 1, 
  textarea: 1, 
  button: 1, 
  fieldset: 1, 
  thead: 1, 
  tfoot: 1};
  _$jscoverage['/editor/selection.js'].lineData[90]++;
  S.augment(KESelection, {
  getNative: !OLD_IE ? function() {
  _$jscoverage['/editor/selection.js'].functionData[2]++;
  _$jscoverage['/editor/selection.js'].lineData[100]++;
  var self = this, cache = self._.cache;
  _$jscoverage['/editor/selection.js'].lineData[102]++;
  return visit702_102_1(cache.nativeSel || (cache.nativeSel = Dom.getWindow(self.document).getSelection()));
} : function() {
  _$jscoverage['/editor/selection.js'].functionData[3]++;
  _$jscoverage['/editor/selection.js'].lineData[106]++;
  var self = this, cache = self._.cache;
  _$jscoverage['/editor/selection.js'].lineData[107]++;
  return visit703_107_1(cache.nativeSel || (cache.nativeSel = self.document.selection));
}, 
  getType: !OLD_IE ? function() {
  _$jscoverage['/editor/selection.js'].functionData[4]++;
  _$jscoverage['/editor/selection.js'].lineData[130]++;
  var self = this, cache = self._.cache;
  _$jscoverage['/editor/selection.js'].lineData[131]++;
  if (visit704_131_1(cache.type)) {
    _$jscoverage['/editor/selection.js'].lineData[132]++;
    return cache.type;
  }
  _$jscoverage['/editor/selection.js'].lineData[135]++;
  var type = KES.SELECTION_TEXT, sel = self.getNative();
  _$jscoverage['/editor/selection.js'].lineData[138]++;
  if (visit705_138_1(!sel)) {
    _$jscoverage['/editor/selection.js'].lineData[139]++;
    type = KES.SELECTION_NONE;
  } else {
    _$jscoverage['/editor/selection.js'].lineData[140]++;
    if (visit706_140_1(sel.rangeCount === 1)) {
      _$jscoverage['/editor/selection.js'].lineData[144]++;
      var range = sel.getRangeAt(0), startContainer = range.startContainer;
      _$jscoverage['/editor/selection.js'].lineData[147]++;
      if (visit707_147_1(visit708_147_2(startContainer === range.endContainer) && visit709_148_1(visit710_148_2(startContainer.nodeType === Dom.NodeType.ELEMENT_NODE) && visit711_149_1(visit712_149_2(Number(range.endOffset - range.startOffset) === 1) && styleObjectElements[startContainer.childNodes[range.startOffset].nodeName.toLowerCase()])))) {
        _$jscoverage['/editor/selection.js'].lineData[151]++;
        type = KES.SELECTION_ELEMENT;
      }
    }
  }
  _$jscoverage['/editor/selection.js'].lineData[155]++;
  cache.type = type;
  _$jscoverage['/editor/selection.js'].lineData[156]++;
  return type;
} : function() {
  _$jscoverage['/editor/selection.js'].functionData[5]++;
  _$jscoverage['/editor/selection.js'].lineData[159]++;
  var self = this, cache = self._.cache;
  _$jscoverage['/editor/selection.js'].lineData[160]++;
  if (visit713_160_1(cache.type)) {
    _$jscoverage['/editor/selection.js'].lineData[161]++;
    return cache.type;
  }
  _$jscoverage['/editor/selection.js'].lineData[164]++;
  var type = KES.SELECTION_NONE;
  _$jscoverage['/editor/selection.js'].lineData[166]++;
  try {
    _$jscoverage['/editor/selection.js'].lineData[167]++;
    var sel = self.getNative(), ieType = sel.type;
    _$jscoverage['/editor/selection.js'].lineData[170]++;
    if (visit714_170_1(ieType === 'Text')) {
      _$jscoverage['/editor/selection.js'].lineData[171]++;
      type = KES.SELECTION_TEXT;
    }
    _$jscoverage['/editor/selection.js'].lineData[174]++;
    if (visit715_174_1(ieType === 'Control')) {
      _$jscoverage['/editor/selection.js'].lineData[175]++;
      type = KES.SELECTION_ELEMENT;
    }
    _$jscoverage['/editor/selection.js'].lineData[183]++;
    if (visit716_183_1(sel.createRange().parentElement)) {
      _$jscoverage['/editor/selection.js'].lineData[184]++;
      type = KES.SELECTION_TEXT;
    }
  }  catch (e) {
}
  _$jscoverage['/editor/selection.js'].lineData[190]++;
  cache.type = type;
  _$jscoverage['/editor/selection.js'].lineData[191]++;
  return type;
}, 
  getRanges: OLD_IE ? (function() {
  _$jscoverage['/editor/selection.js'].functionData[6]++;
  _$jscoverage['/editor/selection.js'].lineData[198]++;
  var getBoundaryInformation = function(range, start) {
  _$jscoverage['/editor/selection.js'].functionData[7]++;
  _$jscoverage['/editor/selection.js'].lineData[200]++;
  range = range.duplicate();
  _$jscoverage['/editor/selection.js'].lineData[201]++;
  range.collapse(start);
  _$jscoverage['/editor/selection.js'].lineData[204]++;
  var parent = range.parentElement(), siblings = parent.childNodes, testRange;
  _$jscoverage['/editor/selection.js'].lineData[207]++;
  for (var i = 0; visit717_207_1(i < siblings.length); i++) {
    _$jscoverage['/editor/selection.js'].lineData[208]++;
    var child = siblings[i];
    _$jscoverage['/editor/selection.js'].lineData[210]++;
    if (visit718_210_1(child.nodeType === Dom.NodeType.ELEMENT_NODE)) {
      _$jscoverage['/editor/selection.js'].lineData[211]++;
      testRange = range.duplicate();
      _$jscoverage['/editor/selection.js'].lineData[213]++;
      testRange.moveToElementText(child);
      _$jscoverage['/editor/selection.js'].lineData[215]++;
      var comparisonStart = testRange.compareEndPoints('StartToStart', range), comparisonEnd = testRange.compareEndPoints('EndToStart', range);
      _$jscoverage['/editor/selection.js'].lineData[218]++;
      testRange.collapse();
      _$jscoverage['/editor/selection.js'].lineData[220]++;
      if (visit719_220_1(comparisonStart > 0)) {
        _$jscoverage['/editor/selection.js'].lineData[221]++;
        break;
      } else {
        _$jscoverage['/editor/selection.js'].lineData[222]++;
        if (visit720_222_1(!comparisonStart || visit721_222_2(visit722_222_3(comparisonEnd === 1) && visit723_222_4(comparisonStart === -1)))) {
          _$jscoverage['/editor/selection.js'].lineData[225]++;
          return {
  container: parent, 
  offset: i};
        } else {
          _$jscoverage['/editor/selection.js'].lineData[226]++;
          if (visit724_226_1(!comparisonEnd)) {
            _$jscoverage['/editor/selection.js'].lineData[227]++;
            return {
  container: parent, 
  offset: i + 1};
          }
        }
      }
      _$jscoverage['/editor/selection.js'].lineData[230]++;
      testRange = NULL;
    }
  }
  _$jscoverage['/editor/selection.js'].lineData[234]++;
  if (visit725_234_1(!testRange)) {
    _$jscoverage['/editor/selection.js'].lineData[235]++;
    testRange = range.duplicate();
    _$jscoverage['/editor/selection.js'].lineData[236]++;
    testRange.moveToElementText(parent);
    _$jscoverage['/editor/selection.js'].lineData[237]++;
    testRange.collapse(FALSE);
  }
  _$jscoverage['/editor/selection.js'].lineData[240]++;
  testRange.setEndPoint('StartToStart', range);
  _$jscoverage['/editor/selection.js'].lineData[244]++;
  var distance = String(testRange.text).replace(/\r\n|\r/g, '\n').length;
  _$jscoverage['/editor/selection.js'].lineData[247]++;
  try {
    _$jscoverage['/editor/selection.js'].lineData[248]++;
    while (visit726_248_1(distance > 0)) {
      _$jscoverage['/editor/selection.js'].lineData[253]++;
      distance -= siblings[--i].nodeValue.length;
    }
  }  catch (e) {
  _$jscoverage['/editor/selection.js'].lineData[257]++;
  distance = 0;
}
  _$jscoverage['/editor/selection.js'].lineData[260]++;
  if (visit727_260_1(distance === 0)) {
    _$jscoverage['/editor/selection.js'].lineData[261]++;
    return {
  container: parent, 
  offset: i};
  } else {
    _$jscoverage['/editor/selection.js'].lineData[266]++;
    return {
  container: siblings[i], 
  offset: -distance};
  }
};
  _$jscoverage['/editor/selection.js'].lineData[273]++;
  return function(force) {
  _$jscoverage['/editor/selection.js'].functionData[8]++;
  _$jscoverage['/editor/selection.js'].lineData[274]++;
  var self = this, cache = self._.cache;
  _$jscoverage['/editor/selection.js'].lineData[275]++;
  if (visit728_275_1(cache.ranges && !force)) {
    _$jscoverage['/editor/selection.js'].lineData[276]++;
    return cache.ranges;
  }
  _$jscoverage['/editor/selection.js'].lineData[283]++;
  var sel = self.getNative(), nativeRange = visit729_284_1(sel && sel.createRange()), type = self.getType(), range;
  _$jscoverage['/editor/selection.js'].lineData[288]++;
  if (visit730_288_1(!sel)) {
    _$jscoverage['/editor/selection.js'].lineData[289]++;
    return [];
  }
  _$jscoverage['/editor/selection.js'].lineData[292]++;
  if (visit731_292_1(type === KES.SELECTION_TEXT)) {
    _$jscoverage['/editor/selection.js'].lineData[293]++;
    range = new KERange(self.document);
    _$jscoverage['/editor/selection.js'].lineData[294]++;
    var boundaryInfo = getBoundaryInformation(nativeRange, TRUE);
    _$jscoverage['/editor/selection.js'].lineData[295]++;
    range.setStart(new Node(boundaryInfo.container), boundaryInfo.offset);
    _$jscoverage['/editor/selection.js'].lineData[296]++;
    boundaryInfo = getBoundaryInformation(nativeRange);
    _$jscoverage['/editor/selection.js'].lineData[297]++;
    range.setEnd(new Node(boundaryInfo.container), boundaryInfo.offset);
    _$jscoverage['/editor/selection.js'].lineData[298]++;
    cache.ranges = [range];
    _$jscoverage['/editor/selection.js'].lineData[299]++;
    return [range];
  } else {
    _$jscoverage['/editor/selection.js'].lineData[300]++;
    if (visit732_300_1(type === KES.SELECTION_ELEMENT)) {
      _$jscoverage['/editor/selection.js'].lineData[301]++;
      var retval = cache.ranges = [];
      _$jscoverage['/editor/selection.js'].lineData[303]++;
      for (var i = 0; visit733_303_1(i < nativeRange.length); i++) {
        _$jscoverage['/editor/selection.js'].lineData[304]++;
        var element = nativeRange.item(i), parentElement = element.parentNode, j = 0;
        _$jscoverage['/editor/selection.js'].lineData[308]++;
        range = new KERange(self.document);
        _$jscoverage['/editor/selection.js'].lineData[311]++;
        for (; visit734_311_1(visit735_311_2(j < parentElement.childNodes.length) && visit736_311_3(parentElement.childNodes[j] !== element)); j++) {
        }
        _$jscoverage['/editor/selection.js'].lineData[314]++;
        range.setStart(new Node(parentElement), j);
        _$jscoverage['/editor/selection.js'].lineData[315]++;
        range.setEnd(new Node(parentElement), j + 1);
        _$jscoverage['/editor/selection.js'].lineData[316]++;
        retval.push(range);
      }
      _$jscoverage['/editor/selection.js'].lineData[319]++;
      return retval;
    }
  }
  _$jscoverage['/editor/selection.js'].lineData[322]++;
  cache.ranges = [];
  _$jscoverage['/editor/selection.js'].lineData[323]++;
  return [];
};
})() : function(force) {
  _$jscoverage['/editor/selection.js'].functionData[9]++;
  _$jscoverage['/editor/selection.js'].lineData[328]++;
  var self = this, cache = self._.cache;
  _$jscoverage['/editor/selection.js'].lineData[329]++;
  if (visit737_329_1(cache.ranges && !force)) {
    _$jscoverage['/editor/selection.js'].lineData[330]++;
    return cache.ranges;
  }
  _$jscoverage['/editor/selection.js'].lineData[337]++;
  var ranges = [], sel = self.getNative();
  _$jscoverage['/editor/selection.js'].lineData[339]++;
  if (visit738_339_1(!sel)) {
    _$jscoverage['/editor/selection.js'].lineData[340]++;
    return [];
  }
  _$jscoverage['/editor/selection.js'].lineData[343]++;
  for (var i = 0; visit739_343_1(i < sel.rangeCount); i++) {
    _$jscoverage['/editor/selection.js'].lineData[344]++;
    var nativeRange = sel.getRangeAt(i), range = new KERange(self.document);
    _$jscoverage['/editor/selection.js'].lineData[346]++;
    range.setStart(new Node(nativeRange.startContainer), nativeRange.startOffset);
    _$jscoverage['/editor/selection.js'].lineData[347]++;
    range.setEnd(new Node(nativeRange.endContainer), nativeRange.endOffset);
    _$jscoverage['/editor/selection.js'].lineData[348]++;
    ranges.push(range);
  }
  _$jscoverage['/editor/selection.js'].lineData[351]++;
  cache.ranges = ranges;
  _$jscoverage['/editor/selection.js'].lineData[352]++;
  return ranges;
}, 
  getStartElement: function() {
  _$jscoverage['/editor/selection.js'].functionData[10]++;
  _$jscoverage['/editor/selection.js'].lineData[365]++;
  var self = this, cache = self._.cache;
  _$jscoverage['/editor/selection.js'].lineData[366]++;
  if (visit740_366_1(cache.startElement !== undefined)) {
    _$jscoverage['/editor/selection.js'].lineData[367]++;
    return cache.startElement;
  }
  _$jscoverage['/editor/selection.js'].lineData[370]++;
  var node, sel = self.getNative();
  _$jscoverage['/editor/selection.js'].lineData[373]++;
  switch (self.getType()) {
    case KES.SELECTION_ELEMENT:
      _$jscoverage['/editor/selection.js'].lineData[375]++;
      return this.getSelectedElement();
    case KES.SELECTION_TEXT:
      _$jscoverage['/editor/selection.js'].lineData[379]++;
      var range = self.getRanges()[0];
      _$jscoverage['/editor/selection.js'].lineData[381]++;
      if (visit741_381_1(range)) {
        _$jscoverage['/editor/selection.js'].lineData[382]++;
        if (visit742_382_1(!range.collapsed)) {
          _$jscoverage['/editor/selection.js'].lineData[383]++;
          range.optimize();
          _$jscoverage['/editor/selection.js'].lineData[388]++;
          while (TRUE) {
            _$jscoverage['/editor/selection.js'].lineData[389]++;
            var startContainer = range.startContainer, startOffset = range.startOffset;
            _$jscoverage['/editor/selection.js'].lineData[392]++;
            if (visit743_392_1(visit744_392_2(startOffset === (visit745_392_3(startContainer[0].nodeType === Dom.NodeType.ELEMENT_NODE) ? startContainer[0].childNodes.length : startContainer[0].nodeValue.length)) && !startContainer._4eIsBlockBoundary())) {
              _$jscoverage['/editor/selection.js'].lineData[394]++;
              range.setStartAfter(startContainer);
            } else {
              _$jscoverage['/editor/selection.js'].lineData[396]++;
              break;
            }
          }
          _$jscoverage['/editor/selection.js'].lineData[400]++;
          node = range.startContainer;
          _$jscoverage['/editor/selection.js'].lineData[402]++;
          if (visit746_402_1(node[0].nodeType !== Dom.NodeType.ELEMENT_NODE)) {
            _$jscoverage['/editor/selection.js'].lineData[403]++;
            return node.parent();
          }
          _$jscoverage['/editor/selection.js'].lineData[406]++;
          node = new Node(node[0].childNodes[range.startOffset]);
          _$jscoverage['/editor/selection.js'].lineData[408]++;
          if (visit747_408_1(!node[0] || visit748_408_2(node[0].nodeType !== Dom.NodeType.ELEMENT_NODE))) {
            _$jscoverage['/editor/selection.js'].lineData[409]++;
            return range.startContainer;
          }
          _$jscoverage['/editor/selection.js'].lineData[412]++;
          var child = node[0].firstChild;
          _$jscoverage['/editor/selection.js'].lineData[413]++;
          while (visit749_413_1(child && visit750_413_2(child.nodeType === Dom.NodeType.ELEMENT_NODE))) {
            _$jscoverage['/editor/selection.js'].lineData[414]++;
            node = new Node(child);
            _$jscoverage['/editor/selection.js'].lineData[415]++;
            child = child.firstChild;
          }
          _$jscoverage['/editor/selection.js'].lineData[417]++;
          return node;
        }
      }
      _$jscoverage['/editor/selection.js'].lineData[421]++;
      if (visit751_421_1(OLD_IE)) {
        _$jscoverage['/editor/selection.js'].lineData[422]++;
        range = sel.createRange();
        _$jscoverage['/editor/selection.js'].lineData[423]++;
        range.collapse(TRUE);
        _$jscoverage['/editor/selection.js'].lineData[424]++;
        node = new Node(range.parentElement());
      } else {
        _$jscoverage['/editor/selection.js'].lineData[426]++;
        node = sel.anchorNode;
        _$jscoverage['/editor/selection.js'].lineData[427]++;
        if (visit752_427_1(node && visit753_427_2(node.nodeType !== Dom.NodeType.ELEMENT_NODE))) {
          _$jscoverage['/editor/selection.js'].lineData[428]++;
          node = node.parentNode;
        }
        _$jscoverage['/editor/selection.js'].lineData[430]++;
        if (visit754_430_1(node)) {
          _$jscoverage['/editor/selection.js'].lineData[431]++;
          node = new Node(node);
        }
      }
  }
  _$jscoverage['/editor/selection.js'].lineData[436]++;
  cache.startElement = node;
  _$jscoverage['/editor/selection.js'].lineData[437]++;
  return node;
}, 
  getSelectedElement: function() {
  _$jscoverage['/editor/selection.js'].functionData[11]++;
  _$jscoverage['/editor/selection.js'].lineData[451]++;
  var self = this, node, cache = self._.cache;
  _$jscoverage['/editor/selection.js'].lineData[455]++;
  if (visit755_455_1(cache.selectedElement !== undefined)) {
    _$jscoverage['/editor/selection.js'].lineData[456]++;
    return cache.selectedElement;
  }
  _$jscoverage['/editor/selection.js'].lineData[460]++;
  if (visit756_460_1(OLD_IE)) {
    _$jscoverage['/editor/selection.js'].lineData[461]++;
    var range = self.getNative().createRange();
    _$jscoverage['/editor/selection.js'].lineData[462]++;
    node = visit757_462_1(range.item && range.item(0));
  }
  _$jscoverage['/editor/selection.js'].lineData[468]++;
  if (visit758_468_1(!node)) {
    _$jscoverage['/editor/selection.js'].lineData[469]++;
    node = (function() {
  _$jscoverage['/editor/selection.js'].functionData[12]++;
  _$jscoverage['/editor/selection.js'].lineData[470]++;
  var range = self.getRanges()[0], enclosed, selected;
  _$jscoverage['/editor/selection.js'].lineData[478]++;
  for (var i = 2; visit759_479_1(i && !(visit760_479_2((enclosed = range.getEnclosedNode()) && visit761_480_1((visit762_480_2(enclosed[0].nodeType === Dom.NodeType.ELEMENT_NODE)) && visit763_482_1(styleObjectElements[enclosed.nodeName()] && (selected = enclosed)))))); i--) {
    _$jscoverage['/editor/selection.js'].lineData[490]++;
    range.shrink(KER.SHRINK_ELEMENT);
  }
  _$jscoverage['/editor/selection.js'].lineData[493]++;
  return selected;
})();
  } else {
    _$jscoverage['/editor/selection.js'].lineData[496]++;
    node = new Node(node);
  }
  _$jscoverage['/editor/selection.js'].lineData[499]++;
  cache.selectedElement = node;
  _$jscoverage['/editor/selection.js'].lineData[500]++;
  return node;
}, 
  reset: function() {
  _$jscoverage['/editor/selection.js'].functionData[13]++;
  _$jscoverage['/editor/selection.js'].lineData[504]++;
  this._.cache = {};
}, 
  selectElement: function(element) {
  _$jscoverage['/editor/selection.js'].functionData[14]++;
  _$jscoverage['/editor/selection.js'].lineData[508]++;
  var range, self = this, doc = self.document;
  _$jscoverage['/editor/selection.js'].lineData[511]++;
  if (visit764_511_1(OLD_IE)) {
    _$jscoverage['/editor/selection.js'].lineData[515]++;
    try {
      _$jscoverage['/editor/selection.js'].lineData[517]++;
      range = doc.body.createControlRange();
      _$jscoverage['/editor/selection.js'].lineData[518]++;
      range.addElement(element[0]);
      _$jscoverage['/editor/selection.js'].lineData[519]++;
      range.select();
    }    catch (e) {
  _$jscoverage['/editor/selection.js'].lineData[522]++;
  range = doc.body.createTextRange();
  _$jscoverage['/editor/selection.js'].lineData[523]++;
  range.moveToElementText(element[0]);
  _$jscoverage['/editor/selection.js'].lineData[524]++;
  range.select();
}
 finally     {
    }
    _$jscoverage['/editor/selection.js'].lineData[528]++;
    self.reset();
  } else {
    _$jscoverage['/editor/selection.js'].lineData[531]++;
    range = doc.createRange();
    _$jscoverage['/editor/selection.js'].lineData[532]++;
    range.selectNode(element[0]);
    _$jscoverage['/editor/selection.js'].lineData[534]++;
    var sel = self.getNative();
    _$jscoverage['/editor/selection.js'].lineData[535]++;
    sel.removeAllRanges();
    _$jscoverage['/editor/selection.js'].lineData[536]++;
    sel.addRange(range);
    _$jscoverage['/editor/selection.js'].lineData[537]++;
    self.reset();
  }
}, 
  selectRanges: function(ranges) {
  _$jscoverage['/editor/selection.js'].functionData[15]++;
  _$jscoverage['/editor/selection.js'].lineData[542]++;
  var self = this;
  _$jscoverage['/editor/selection.js'].lineData[543]++;
  if (visit765_543_1(OLD_IE)) {
    _$jscoverage['/editor/selection.js'].lineData[544]++;
    if (visit766_544_1(ranges.length > 1)) {
      _$jscoverage['/editor/selection.js'].lineData[546]++;
      var last = ranges[ranges.length - 1];
      _$jscoverage['/editor/selection.js'].lineData[547]++;
      ranges[0].setEnd(last.endContainer, last.endOffset);
      _$jscoverage['/editor/selection.js'].lineData[548]++;
      ranges.length = 1;
    }
    _$jscoverage['/editor/selection.js'].lineData[553]++;
    if (visit767_553_1(ranges[0])) {
      _$jscoverage['/editor/selection.js'].lineData[554]++;
      ranges[0].select();
    }
    _$jscoverage['/editor/selection.js'].lineData[557]++;
    self.reset();
  } else {
    _$jscoverage['/editor/selection.js'].lineData[559]++;
    var sel = self.getNative();
    _$jscoverage['/editor/selection.js'].lineData[560]++;
    if (visit768_560_1(!sel)) {
      _$jscoverage['/editor/selection.js'].lineData[561]++;
      return;
    }
    _$jscoverage['/editor/selection.js'].lineData[563]++;
    sel.removeAllRanges();
    _$jscoverage['/editor/selection.js'].lineData[564]++;
    for (var i = 0; visit769_564_1(i < ranges.length); i++) {
      _$jscoverage['/editor/selection.js'].lineData[565]++;
      var range = ranges[i], nativeRange = self.document.createRange(), startContainer = range.startContainer;
      _$jscoverage['/editor/selection.js'].lineData[573]++;
      if (visit770_573_1(range.collapsed && visit771_574_1((visit772_574_2((visit773_574_3(UA.gecko && visit774_574_4(UA.gecko < 1.0900))) || visit775_574_5(UA.opera || UA.webkit))) && visit776_575_1(visit777_575_2(startContainer[0].nodeType === Dom.NodeType.ELEMENT_NODE) && !startContainer[0].childNodes.length)))) {
        _$jscoverage['/editor/selection.js'].lineData[577]++;
        startContainer[0].appendChild(self.document.createTextNode(UA.webkit ? '\u200b' : ''));
        _$jscoverage['/editor/selection.js'].lineData[580]++;
        range.startOffset++;
        _$jscoverage['/editor/selection.js'].lineData[581]++;
        range.endOffset++;
      }
      _$jscoverage['/editor/selection.js'].lineData[584]++;
      nativeRange.setStart(startContainer[0], range.startOffset);
      _$jscoverage['/editor/selection.js'].lineData[585]++;
      nativeRange.setEnd(range.endContainer[0], range.endOffset);
      _$jscoverage['/editor/selection.js'].lineData[587]++;
      sel.addRange(nativeRange);
    }
    _$jscoverage['/editor/selection.js'].lineData[589]++;
    self.reset();
  }
}, 
  createBookmarks2: function(normalized) {
  _$jscoverage['/editor/selection.js'].functionData[16]++;
  _$jscoverage['/editor/selection.js'].lineData[593]++;
  var bookmarks = [], ranges = this.getRanges();
  _$jscoverage['/editor/selection.js'].lineData[596]++;
  for (var i = 0; visit778_596_1(i < ranges.length); i++) {
    _$jscoverage['/editor/selection.js'].lineData[597]++;
    bookmarks.push(ranges[i].createBookmark2(normalized));
  }
  _$jscoverage['/editor/selection.js'].lineData[600]++;
  return bookmarks;
}, 
  createBookmarks: function(serializable, ranges) {
  _$jscoverage['/editor/selection.js'].functionData[17]++;
  _$jscoverage['/editor/selection.js'].lineData[603]++;
  var self = this, retval = [], doc = self.document, bookmark;
  _$jscoverage['/editor/selection.js'].lineData[607]++;
  ranges = visit779_607_1(ranges || self.getRanges());
  _$jscoverage['/editor/selection.js'].lineData[608]++;
  var length = ranges.length;
  _$jscoverage['/editor/selection.js'].lineData[609]++;
  for (var i = 0; visit780_609_1(i < length); i++) {
    _$jscoverage['/editor/selection.js'].lineData[610]++;
    retval.push(bookmark = ranges[i].createBookmark(serializable, TRUE));
    _$jscoverage['/editor/selection.js'].lineData[611]++;
    serializable = bookmark.serializable;
    _$jscoverage['/editor/selection.js'].lineData[613]++;
    var bookmarkStart = serializable ? S.one('#' + bookmark.startNode, doc) : bookmark.startNode, bookmarkEnd = serializable ? S.one('#' + bookmark.endNode, doc) : bookmark.endNode;
    _$jscoverage['/editor/selection.js'].lineData[617]++;
    for (var j = i + 1; visit781_617_1(j < length); j++) {
      _$jscoverage['/editor/selection.js'].lineData[618]++;
      var dirtyRange = ranges[j], rangeStart = dirtyRange.startContainer, rangeEnd = dirtyRange.endContainer;
      _$jscoverage['/editor/selection.js'].lineData[622]++;
      if (visit782_622_1(Dom.equals(rangeStart, bookmarkStart.parent()))) {
        _$jscoverage['/editor/selection.js'].lineData[623]++;
        dirtyRange.startOffset++;
      }
      _$jscoverage['/editor/selection.js'].lineData[625]++;
      if (visit783_625_1(Dom.equals(rangeStart, bookmarkEnd.parent()))) {
        _$jscoverage['/editor/selection.js'].lineData[626]++;
        dirtyRange.startOffset++;
      }
      _$jscoverage['/editor/selection.js'].lineData[628]++;
      if (visit784_628_1(Dom.equals(rangeEnd, bookmarkStart.parent()))) {
        _$jscoverage['/editor/selection.js'].lineData[629]++;
        dirtyRange.endOffset++;
      }
      _$jscoverage['/editor/selection.js'].lineData[631]++;
      if (visit785_631_1(Dom.equals(rangeEnd, bookmarkEnd.parent()))) {
        _$jscoverage['/editor/selection.js'].lineData[632]++;
        dirtyRange.endOffset++;
      }
    }
  }
  _$jscoverage['/editor/selection.js'].lineData[637]++;
  return retval;
}, 
  selectBookmarks: function(bookmarks) {
  _$jscoverage['/editor/selection.js'].functionData[18]++;
  _$jscoverage['/editor/selection.js'].lineData[641]++;
  var self = this, ranges = [];
  _$jscoverage['/editor/selection.js'].lineData[642]++;
  for (var i = 0; visit786_642_1(i < bookmarks.length); i++) {
    _$jscoverage['/editor/selection.js'].lineData[643]++;
    var range = new KERange(self.document);
    _$jscoverage['/editor/selection.js'].lineData[644]++;
    range.moveToBookmark(bookmarks[i]);
    _$jscoverage['/editor/selection.js'].lineData[645]++;
    ranges.push(range);
  }
  _$jscoverage['/editor/selection.js'].lineData[647]++;
  self.selectRanges(ranges);
  _$jscoverage['/editor/selection.js'].lineData[648]++;
  return self;
}, 
  getCommonAncestor: function() {
  _$jscoverage['/editor/selection.js'].functionData[19]++;
  _$jscoverage['/editor/selection.js'].lineData[652]++;
  var ranges = this.getRanges(), startNode = ranges[0].startContainer, endNode = ranges[ranges.length - 1].endContainer;
  _$jscoverage['/editor/selection.js'].lineData[655]++;
  return startNode._4eCommonAncestor(endNode);
}, 
  scrollIntoView: function() {
  _$jscoverage['/editor/selection.js'].functionData[20]++;
  _$jscoverage['/editor/selection.js'].lineData[662]++;
  var start = this.getStartElement();
  _$jscoverage['/editor/selection.js'].lineData[663]++;
  if (visit787_663_1(start)) {
    _$jscoverage['/editor/selection.js'].lineData[664]++;
    start.scrollIntoView(undefined, {
  alignWithTop: false, 
  allowHorizontalScroll: true, 
  onlyScrollIfNeeded: true});
  }
}, 
  removeAllRanges: function() {
  _$jscoverage['/editor/selection.js'].functionData[21]++;
  _$jscoverage['/editor/selection.js'].lineData[672]++;
  var sel = this.getNative();
  _$jscoverage['/editor/selection.js'].lineData[673]++;
  if (visit788_673_1(!OLD_IE)) {
    _$jscoverage['/editor/selection.js'].lineData[674]++;
    if (visit789_674_1(sel)) {
      _$jscoverage['/editor/selection.js'].lineData[675]++;
      sel.removeAllRanges();
    }
  } else {
    _$jscoverage['/editor/selection.js'].lineData[678]++;
    if (visit790_678_1(sel)) {
      _$jscoverage['/editor/selection.js'].lineData[679]++;
      sel.clear();
    }
  }
}});
  _$jscoverage['/editor/selection.js'].lineData[685]++;
  var nonCells = {
  table: 1, 
  tbody: 1, 
  tr: 1}, notWhitespaces = Walker.whitespaces(TRUE), fillerTextRegex = /\ufeff|\u00a0/;
  _$jscoverage['/editor/selection.js'].lineData[692]++;
  KERange.prototype.select = !OLD_IE ? function() {
  _$jscoverage['/editor/selection.js'].functionData[22]++;
  _$jscoverage['/editor/selection.js'].lineData[694]++;
  var self = this, startContainer = self.startContainer;
  _$jscoverage['/editor/selection.js'].lineData[698]++;
  if (visit791_698_1(self.collapsed && visit792_699_1(visit793_699_2(startContainer[0].nodeType === Dom.NodeType.ELEMENT_NODE) && !startContainer[0].childNodes.length))) {
    _$jscoverage['/editor/selection.js'].lineData[700]++;
    startContainer[0].appendChild(self.document.createTextNode(UA.webkit ? '\u200b' : ''));
    _$jscoverage['/editor/selection.js'].lineData[704]++;
    self.startOffset++;
    _$jscoverage['/editor/selection.js'].lineData[705]++;
    self.endOffset++;
  }
  _$jscoverage['/editor/selection.js'].lineData[708]++;
  var nativeRange = self.document.createRange();
  _$jscoverage['/editor/selection.js'].lineData[709]++;
  nativeRange.setStart(startContainer[0], self.startOffset);
  _$jscoverage['/editor/selection.js'].lineData[711]++;
  try {
    _$jscoverage['/editor/selection.js'].lineData[712]++;
    nativeRange.setEnd(self.endContainer[0], self.endOffset);
  }  catch (e) {
  _$jscoverage['/editor/selection.js'].lineData[717]++;
  if (visit794_717_1(e.toString().indexOf('NS_ERROR_ILLEGAL_VALUE') >= 0)) {
    _$jscoverage['/editor/selection.js'].lineData[718]++;
    self.collapse(TRUE);
    _$jscoverage['/editor/selection.js'].lineData[719]++;
    nativeRange.setEnd(self.endContainer[0], self.endOffset);
  } else {
    _$jscoverage['/editor/selection.js'].lineData[721]++;
    throw (e);
  }
}
  _$jscoverage['/editor/selection.js'].lineData[725]++;
  var selection = getSelection(self.document).getNative();
  _$jscoverage['/editor/selection.js'].lineData[726]++;
  selection.removeAllRanges();
  _$jscoverage['/editor/selection.js'].lineData[727]++;
  selection.addRange(nativeRange);
} : function(forceExpand) {
  _$jscoverage['/editor/selection.js'].functionData[23]++;
  _$jscoverage['/editor/selection.js'].lineData[731]++;
  var self = this, collapsed = self.collapsed, isStartMarkerAlone, dummySpan;
  _$jscoverage['/editor/selection.js'].lineData[737]++;
  if (visit795_740_1(visit796_740_2(self.startContainer[0] === self.endContainer[0]) && visit797_740_3(self.endOffset - self.startOffset === 1))) {
    _$jscoverage['/editor/selection.js'].lineData[741]++;
    var selEl = self.startContainer[0].childNodes[self.startOffset];
    _$jscoverage['/editor/selection.js'].lineData[742]++;
    if (visit798_742_1(selEl.nodeType === Dom.NodeType.ELEMENT_NODE)) {
      _$jscoverage['/editor/selection.js'].lineData[743]++;
      new KESelection(self.document).selectElement(new Node(selEl));
      _$jscoverage['/editor/selection.js'].lineData[744]++;
      return;
    }
  }
  _$jscoverage['/editor/selection.js'].lineData[749]++;
  if (visit799_749_1(visit800_749_2(visit801_749_3(self.startContainer[0].nodeType === Dom.NodeType.ELEMENT_NODE) && self.startContainer.nodeName() in nonCells) || visit802_751_1(visit803_751_2(self.endContainer[0].nodeType === Dom.NodeType.ELEMENT_NODE) && self.endContainer.nodeName() in nonCells))) {
    _$jscoverage['/editor/selection.js'].lineData[753]++;
    self.shrink(KER.SHRINK_ELEMENT, TRUE);
  }
  _$jscoverage['/editor/selection.js'].lineData[756]++;
  var bookmark = self.createBookmark(), startNode = bookmark.startNode, endNode;
  _$jscoverage['/editor/selection.js'].lineData[760]++;
  if (visit804_760_1(!collapsed)) {
    _$jscoverage['/editor/selection.js'].lineData[761]++;
    endNode = bookmark.endNode;
  }
  _$jscoverage['/editor/selection.js'].lineData[765]++;
  var ieRange = self.document.body.createTextRange();
  _$jscoverage['/editor/selection.js'].lineData[768]++;
  ieRange.moveToElementText(startNode[0]);
  _$jscoverage['/editor/selection.js'].lineData[770]++;
  ieRange.moveStart('character', 1);
  _$jscoverage['/editor/selection.js'].lineData[772]++;
  if (visit805_772_1(endNode)) {
    _$jscoverage['/editor/selection.js'].lineData[774]++;
    var ieRangeEnd = self.document.body.createTextRange();
    _$jscoverage['/editor/selection.js'].lineData[776]++;
    ieRangeEnd.moveToElementText(endNode[0]);
    _$jscoverage['/editor/selection.js'].lineData[778]++;
    ieRange.setEndPoint('EndToEnd', ieRangeEnd);
    _$jscoverage['/editor/selection.js'].lineData[779]++;
    ieRange.moveEnd('character', -1);
  } else {
    _$jscoverage['/editor/selection.js'].lineData[785]++;
    var next = startNode[0].nextSibling;
    _$jscoverage['/editor/selection.js'].lineData[786]++;
    while (visit806_786_1(next && !notWhitespaces(next))) {
      _$jscoverage['/editor/selection.js'].lineData[787]++;
      next = next.nextSibling;
    }
    _$jscoverage['/editor/selection.js'].lineData[789]++;
    isStartMarkerAlone = (visit807_790_1(!(visit808_790_2(next && visit809_790_3(next.nodeValue && next.nodeValue.match(fillerTextRegex)))) && (visit810_792_1(forceExpand || visit811_792_2(!startNode[0].previousSibling || (visit812_794_1(startNode[0].previousSibling && visit813_795_1(Dom.nodeName(startNode[0].previousSibling) === 'br'))))))));
    _$jscoverage['/editor/selection.js'].lineData[805]++;
    dummySpan = new Node(self.document.createElement('span'));
    _$jscoverage['/editor/selection.js'].lineData[806]++;
    dummySpan.html('&#65279;');
    _$jscoverage['/editor/selection.js'].lineData[807]++;
    dummySpan.insertBefore(startNode);
    _$jscoverage['/editor/selection.js'].lineData[808]++;
    if (visit814_808_1(isStartMarkerAlone)) {
      _$jscoverage['/editor/selection.js'].lineData[813]++;
      Dom.insertBefore(self.document.createTextNode('\ufeff'), visit815_813_1(startNode[0] || startNode));
    }
  }
  _$jscoverage['/editor/selection.js'].lineData[818]++;
  self.setStartBefore(startNode);
  _$jscoverage['/editor/selection.js'].lineData[819]++;
  startNode._4eRemove();
  _$jscoverage['/editor/selection.js'].lineData[821]++;
  if (visit816_821_1(collapsed)) {
    _$jscoverage['/editor/selection.js'].lineData[822]++;
    if (visit817_822_1(isStartMarkerAlone)) {
      _$jscoverage['/editor/selection.js'].lineData[824]++;
      ieRange.moveStart('character', -1);
      _$jscoverage['/editor/selection.js'].lineData[825]++;
      ieRange.select();
      _$jscoverage['/editor/selection.js'].lineData[827]++;
      self.document.selection.clear();
    } else {
      _$jscoverage['/editor/selection.js'].lineData[829]++;
      ieRange.select();
    }
    _$jscoverage['/editor/selection.js'].lineData[831]++;
    if (visit818_831_1(dummySpan)) {
      _$jscoverage['/editor/selection.js'].lineData[832]++;
      self.moveToPosition(dummySpan, KER.POSITION_BEFORE_START);
      _$jscoverage['/editor/selection.js'].lineData[833]++;
      dummySpan._4eRemove();
    }
  } else {
    _$jscoverage['/editor/selection.js'].lineData[836]++;
    self.setEndBefore(endNode);
    _$jscoverage['/editor/selection.js'].lineData[837]++;
    endNode._4eRemove();
    _$jscoverage['/editor/selection.js'].lineData[838]++;
    ieRange.select();
  }
};
  _$jscoverage['/editor/selection.js'].lineData[842]++;
  function getSelection(doc) {
    _$jscoverage['/editor/selection.js'].functionData[24]++;
    _$jscoverage['/editor/selection.js'].lineData[843]++;
    var sel = new KESelection(doc);
    _$jscoverage['/editor/selection.js'].lineData[844]++;
    return (visit819_844_1(!sel || sel.isInvalid)) ? NULL : sel;
  }
  _$jscoverage['/editor/selection.js'].lineData[847]++;
  KESelection.getSelection = getSelection;
  _$jscoverage['/editor/selection.js'].lineData[849]++;
  Editor.Selection = KESelection;
  _$jscoverage['/editor/selection.js'].lineData[851]++;
  return KESelection;
});
