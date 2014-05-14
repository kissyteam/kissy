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
if (! _$jscoverage['/editor/range.js']) {
  _$jscoverage['/editor/range.js'] = {};
  _$jscoverage['/editor/range.js'].lineData = [];
  _$jscoverage['/editor/range.js'].lineData[10] = 0;
  _$jscoverage['/editor/range.js'].lineData[11] = 0;
  _$jscoverage['/editor/range.js'].lineData[12] = 0;
  _$jscoverage['/editor/range.js'].lineData[13] = 0;
  _$jscoverage['/editor/range.js'].lineData[14] = 0;
  _$jscoverage['/editor/range.js'].lineData[15] = 0;
  _$jscoverage['/editor/range.js'].lineData[16] = 0;
  _$jscoverage['/editor/range.js'].lineData[21] = 0;
  _$jscoverage['/editor/range.js'].lineData[35] = 0;
  _$jscoverage['/editor/range.js'].lineData[60] = 0;
  _$jscoverage['/editor/range.js'].lineData[65] = 0;
  _$jscoverage['/editor/range.js'].lineData[96] = 0;
  _$jscoverage['/editor/range.js'].lineData[100] = 0;
  _$jscoverage['/editor/range.js'].lineData[106] = 0;
  _$jscoverage['/editor/range.js'].lineData[109] = 0;
  _$jscoverage['/editor/range.js'].lineData[111] = 0;
  _$jscoverage['/editor/range.js'].lineData[114] = 0;
  _$jscoverage['/editor/range.js'].lineData[115] = 0;
  _$jscoverage['/editor/range.js'].lineData[116] = 0;
  _$jscoverage['/editor/range.js'].lineData[118] = 0;
  _$jscoverage['/editor/range.js'].lineData[119] = 0;
  _$jscoverage['/editor/range.js'].lineData[122] = 0;
  _$jscoverage['/editor/range.js'].lineData[124] = 0;
  _$jscoverage['/editor/range.js'].lineData[125] = 0;
  _$jscoverage['/editor/range.js'].lineData[127] = 0;
  _$jscoverage['/editor/range.js'].lineData[128] = 0;
  _$jscoverage['/editor/range.js'].lineData[131] = 0;
  _$jscoverage['/editor/range.js'].lineData[134] = 0;
  _$jscoverage['/editor/range.js'].lineData[135] = 0;
  _$jscoverage['/editor/range.js'].lineData[137] = 0;
  _$jscoverage['/editor/range.js'].lineData[141] = 0;
  _$jscoverage['/editor/range.js'].lineData[152] = 0;
  _$jscoverage['/editor/range.js'].lineData[153] = 0;
  _$jscoverage['/editor/range.js'].lineData[165] = 0;
  _$jscoverage['/editor/range.js'].lineData[166] = 0;
  _$jscoverage['/editor/range.js'].lineData[169] = 0;
  _$jscoverage['/editor/range.js'].lineData[170] = 0;
  _$jscoverage['/editor/range.js'].lineData[174] = 0;
  _$jscoverage['/editor/range.js'].lineData[182] = 0;
  _$jscoverage['/editor/range.js'].lineData[183] = 0;
  _$jscoverage['/editor/range.js'].lineData[184] = 0;
  _$jscoverage['/editor/range.js'].lineData[188] = 0;
  _$jscoverage['/editor/range.js'].lineData[190] = 0;
  _$jscoverage['/editor/range.js'].lineData[192] = 0;
  _$jscoverage['/editor/range.js'].lineData[195] = 0;
  _$jscoverage['/editor/range.js'].lineData[197] = 0;
  _$jscoverage['/editor/range.js'].lineData[206] = 0;
  _$jscoverage['/editor/range.js'].lineData[207] = 0;
  _$jscoverage['/editor/range.js'].lineData[208] = 0;
  _$jscoverage['/editor/range.js'].lineData[215] = 0;
  _$jscoverage['/editor/range.js'].lineData[217] = 0;
  _$jscoverage['/editor/range.js'].lineData[218] = 0;
  _$jscoverage['/editor/range.js'].lineData[219] = 0;
  _$jscoverage['/editor/range.js'].lineData[220] = 0;
  _$jscoverage['/editor/range.js'].lineData[222] = 0;
  _$jscoverage['/editor/range.js'].lineData[224] = 0;
  _$jscoverage['/editor/range.js'].lineData[226] = 0;
  _$jscoverage['/editor/range.js'].lineData[228] = 0;
  _$jscoverage['/editor/range.js'].lineData[236] = 0;
  _$jscoverage['/editor/range.js'].lineData[239] = 0;
  _$jscoverage['/editor/range.js'].lineData[240] = 0;
  _$jscoverage['/editor/range.js'].lineData[243] = 0;
  _$jscoverage['/editor/range.js'].lineData[244] = 0;
  _$jscoverage['/editor/range.js'].lineData[249] = 0;
  _$jscoverage['/editor/range.js'].lineData[251] = 0;
  _$jscoverage['/editor/range.js'].lineData[252] = 0;
  _$jscoverage['/editor/range.js'].lineData[253] = 0;
  _$jscoverage['/editor/range.js'].lineData[259] = 0;
  _$jscoverage['/editor/range.js'].lineData[260] = 0;
  _$jscoverage['/editor/range.js'].lineData[264] = 0;
  _$jscoverage['/editor/range.js'].lineData[272] = 0;
  _$jscoverage['/editor/range.js'].lineData[273] = 0;
  _$jscoverage['/editor/range.js'].lineData[276] = 0;
  _$jscoverage['/editor/range.js'].lineData[278] = 0;
  _$jscoverage['/editor/range.js'].lineData[280] = 0;
  _$jscoverage['/editor/range.js'].lineData[284] = 0;
  _$jscoverage['/editor/range.js'].lineData[286] = 0;
  _$jscoverage['/editor/range.js'].lineData[290] = 0;
  _$jscoverage['/editor/range.js'].lineData[293] = 0;
  _$jscoverage['/editor/range.js'].lineData[294] = 0;
  _$jscoverage['/editor/range.js'].lineData[298] = 0;
  _$jscoverage['/editor/range.js'].lineData[301] = 0;
  _$jscoverage['/editor/range.js'].lineData[303] = 0;
  _$jscoverage['/editor/range.js'].lineData[308] = 0;
  _$jscoverage['/editor/range.js'].lineData[309] = 0;
  _$jscoverage['/editor/range.js'].lineData[310] = 0;
  _$jscoverage['/editor/range.js'].lineData[311] = 0;
  _$jscoverage['/editor/range.js'].lineData[314] = 0;
  _$jscoverage['/editor/range.js'].lineData[318] = 0;
  _$jscoverage['/editor/range.js'].lineData[320] = 0;
  _$jscoverage['/editor/range.js'].lineData[324] = 0;
  _$jscoverage['/editor/range.js'].lineData[327] = 0;
  _$jscoverage['/editor/range.js'].lineData[328] = 0;
  _$jscoverage['/editor/range.js'].lineData[332] = 0;
  _$jscoverage['/editor/range.js'].lineData[336] = 0;
  _$jscoverage['/editor/range.js'].lineData[337] = 0;
  _$jscoverage['/editor/range.js'].lineData[340] = 0;
  _$jscoverage['/editor/range.js'].lineData[343] = 0;
  _$jscoverage['/editor/range.js'].lineData[345] = 0;
  _$jscoverage['/editor/range.js'].lineData[349] = 0;
  _$jscoverage['/editor/range.js'].lineData[354] = 0;
  _$jscoverage['/editor/range.js'].lineData[355] = 0;
  _$jscoverage['/editor/range.js'].lineData[357] = 0;
  _$jscoverage['/editor/range.js'].lineData[360] = 0;
  _$jscoverage['/editor/range.js'].lineData[361] = 0;
  _$jscoverage['/editor/range.js'].lineData[365] = 0;
  _$jscoverage['/editor/range.js'].lineData[368] = 0;
  _$jscoverage['/editor/range.js'].lineData[370] = 0;
  _$jscoverage['/editor/range.js'].lineData[374] = 0;
  _$jscoverage['/editor/range.js'].lineData[378] = 0;
  _$jscoverage['/editor/range.js'].lineData[379] = 0;
  _$jscoverage['/editor/range.js'].lineData[383] = 0;
  _$jscoverage['/editor/range.js'].lineData[387] = 0;
  _$jscoverage['/editor/range.js'].lineData[388] = 0;
  _$jscoverage['/editor/range.js'].lineData[389] = 0;
  _$jscoverage['/editor/range.js'].lineData[392] = 0;
  _$jscoverage['/editor/range.js'].lineData[393] = 0;
  _$jscoverage['/editor/range.js'].lineData[397] = 0;
  _$jscoverage['/editor/range.js'].lineData[398] = 0;
  _$jscoverage['/editor/range.js'].lineData[399] = 0;
  _$jscoverage['/editor/range.js'].lineData[402] = 0;
  _$jscoverage['/editor/range.js'].lineData[403] = 0;
  _$jscoverage['/editor/range.js'].lineData[413] = 0;
  _$jscoverage['/editor/range.js'].lineData[419] = 0;
  _$jscoverage['/editor/range.js'].lineData[423] = 0;
  _$jscoverage['/editor/range.js'].lineData[426] = 0;
  _$jscoverage['/editor/range.js'].lineData[429] = 0;
  _$jscoverage['/editor/range.js'].lineData[433] = 0;
  _$jscoverage['/editor/range.js'].lineData[438] = 0;
  _$jscoverage['/editor/range.js'].lineData[439] = 0;
  _$jscoverage['/editor/range.js'].lineData[442] = 0;
  _$jscoverage['/editor/range.js'].lineData[443] = 0;
  _$jscoverage['/editor/range.js'].lineData[446] = 0;
  _$jscoverage['/editor/range.js'].lineData[449] = 0;
  _$jscoverage['/editor/range.js'].lineData[450] = 0;
  _$jscoverage['/editor/range.js'].lineData[463] = 0;
  _$jscoverage['/editor/range.js'].lineData[464] = 0;
  _$jscoverage['/editor/range.js'].lineData[465] = 0;
  _$jscoverage['/editor/range.js'].lineData[466] = 0;
  _$jscoverage['/editor/range.js'].lineData[467] = 0;
  _$jscoverage['/editor/range.js'].lineData[468] = 0;
  _$jscoverage['/editor/range.js'].lineData[469] = 0;
  _$jscoverage['/editor/range.js'].lineData[470] = 0;
  _$jscoverage['/editor/range.js'].lineData[473] = 0;
  _$jscoverage['/editor/range.js'].lineData[479] = 0;
  _$jscoverage['/editor/range.js'].lineData[483] = 0;
  _$jscoverage['/editor/range.js'].lineData[484] = 0;
  _$jscoverage['/editor/range.js'].lineData[485] = 0;
  _$jscoverage['/editor/range.js'].lineData[495] = 0;
  _$jscoverage['/editor/range.js'].lineData[499] = 0;
  _$jscoverage['/editor/range.js'].lineData[500] = 0;
  _$jscoverage['/editor/range.js'].lineData[501] = 0;
  _$jscoverage['/editor/range.js'].lineData[502] = 0;
  _$jscoverage['/editor/range.js'].lineData[503] = 0;
  _$jscoverage['/editor/range.js'].lineData[507] = 0;
  _$jscoverage['/editor/range.js'].lineData[508] = 0;
  _$jscoverage['/editor/range.js'].lineData[510] = 0;
  _$jscoverage['/editor/range.js'].lineData[511] = 0;
  _$jscoverage['/editor/range.js'].lineData[512] = 0;
  _$jscoverage['/editor/range.js'].lineData[513] = 0;
  _$jscoverage['/editor/range.js'].lineData[514] = 0;
  _$jscoverage['/editor/range.js'].lineData[524] = 0;
  _$jscoverage['/editor/range.js'].lineData[531] = 0;
  _$jscoverage['/editor/range.js'].lineData[538] = 0;
  _$jscoverage['/editor/range.js'].lineData[545] = 0;
  _$jscoverage['/editor/range.js'].lineData[552] = 0;
  _$jscoverage['/editor/range.js'].lineData[556] = 0;
  _$jscoverage['/editor/range.js'].lineData[559] = 0;
  _$jscoverage['/editor/range.js'].lineData[561] = 0;
  _$jscoverage['/editor/range.js'].lineData[564] = 0;
  _$jscoverage['/editor/range.js'].lineData[582] = 0;
  _$jscoverage['/editor/range.js'].lineData[583] = 0;
  _$jscoverage['/editor/range.js'].lineData[584] = 0;
  _$jscoverage['/editor/range.js'].lineData[585] = 0;
  _$jscoverage['/editor/range.js'].lineData[588] = 0;
  _$jscoverage['/editor/range.js'].lineData[589] = 0;
  _$jscoverage['/editor/range.js'].lineData[591] = 0;
  _$jscoverage['/editor/range.js'].lineData[592] = 0;
  _$jscoverage['/editor/range.js'].lineData[593] = 0;
  _$jscoverage['/editor/range.js'].lineData[596] = 0;
  _$jscoverage['/editor/range.js'].lineData[613] = 0;
  _$jscoverage['/editor/range.js'].lineData[614] = 0;
  _$jscoverage['/editor/range.js'].lineData[615] = 0;
  _$jscoverage['/editor/range.js'].lineData[616] = 0;
  _$jscoverage['/editor/range.js'].lineData[619] = 0;
  _$jscoverage['/editor/range.js'].lineData[620] = 0;
  _$jscoverage['/editor/range.js'].lineData[622] = 0;
  _$jscoverage['/editor/range.js'].lineData[623] = 0;
  _$jscoverage['/editor/range.js'].lineData[624] = 0;
  _$jscoverage['/editor/range.js'].lineData[627] = 0;
  _$jscoverage['/editor/range.js'].lineData[636] = 0;
  _$jscoverage['/editor/range.js'].lineData[637] = 0;
  _$jscoverage['/editor/range.js'].lineData[639] = 0;
  _$jscoverage['/editor/range.js'].lineData[640] = 0;
  _$jscoverage['/editor/range.js'].lineData[643] = 0;
  _$jscoverage['/editor/range.js'].lineData[644] = 0;
  _$jscoverage['/editor/range.js'].lineData[646] = 0;
  _$jscoverage['/editor/range.js'].lineData[648] = 0;
  _$jscoverage['/editor/range.js'].lineData[651] = 0;
  _$jscoverage['/editor/range.js'].lineData[652] = 0;
  _$jscoverage['/editor/range.js'].lineData[655] = 0;
  _$jscoverage['/editor/range.js'].lineData[658] = 0;
  _$jscoverage['/editor/range.js'].lineData[667] = 0;
  _$jscoverage['/editor/range.js'].lineData[668] = 0;
  _$jscoverage['/editor/range.js'].lineData[670] = 0;
  _$jscoverage['/editor/range.js'].lineData[671] = 0;
  _$jscoverage['/editor/range.js'].lineData[674] = 0;
  _$jscoverage['/editor/range.js'].lineData[675] = 0;
  _$jscoverage['/editor/range.js'].lineData[677] = 0;
  _$jscoverage['/editor/range.js'].lineData[679] = 0;
  _$jscoverage['/editor/range.js'].lineData[682] = 0;
  _$jscoverage['/editor/range.js'].lineData[683] = 0;
  _$jscoverage['/editor/range.js'].lineData[686] = 0;
  _$jscoverage['/editor/range.js'].lineData[689] = 0;
  _$jscoverage['/editor/range.js'].lineData[696] = 0;
  _$jscoverage['/editor/range.js'].lineData[703] = 0;
  _$jscoverage['/editor/range.js'].lineData[710] = 0;
  _$jscoverage['/editor/range.js'].lineData[718] = 0;
  _$jscoverage['/editor/range.js'].lineData[719] = 0;
  _$jscoverage['/editor/range.js'].lineData[720] = 0;
  _$jscoverage['/editor/range.js'].lineData[721] = 0;
  _$jscoverage['/editor/range.js'].lineData[723] = 0;
  _$jscoverage['/editor/range.js'].lineData[724] = 0;
  _$jscoverage['/editor/range.js'].lineData[726] = 0;
  _$jscoverage['/editor/range.js'].lineData[734] = 0;
  _$jscoverage['/editor/range.js'].lineData[737] = 0;
  _$jscoverage['/editor/range.js'].lineData[738] = 0;
  _$jscoverage['/editor/range.js'].lineData[739] = 0;
  _$jscoverage['/editor/range.js'].lineData[740] = 0;
  _$jscoverage['/editor/range.js'].lineData[741] = 0;
  _$jscoverage['/editor/range.js'].lineData[743] = 0;
  _$jscoverage['/editor/range.js'].lineData[755] = 0;
  _$jscoverage['/editor/range.js'].lineData[758] = 0;
  _$jscoverage['/editor/range.js'].lineData[760] = 0;
  _$jscoverage['/editor/range.js'].lineData[762] = 0;
  _$jscoverage['/editor/range.js'].lineData[765] = 0;
  _$jscoverage['/editor/range.js'].lineData[768] = 0;
  _$jscoverage['/editor/range.js'].lineData[769] = 0;
  _$jscoverage['/editor/range.js'].lineData[776] = 0;
  _$jscoverage['/editor/range.js'].lineData[777] = 0;
  _$jscoverage['/editor/range.js'].lineData[778] = 0;
  _$jscoverage['/editor/range.js'].lineData[780] = 0;
  _$jscoverage['/editor/range.js'].lineData[790] = 0;
  _$jscoverage['/editor/range.js'].lineData[791] = 0;
  _$jscoverage['/editor/range.js'].lineData[792] = 0;
  _$jscoverage['/editor/range.js'].lineData[794] = 0;
  _$jscoverage['/editor/range.js'].lineData[805] = 0;
  _$jscoverage['/editor/range.js'].lineData[807] = 0;
  _$jscoverage['/editor/range.js'].lineData[808] = 0;
  _$jscoverage['/editor/range.js'].lineData[809] = 0;
  _$jscoverage['/editor/range.js'].lineData[810] = 0;
  _$jscoverage['/editor/range.js'].lineData[814] = 0;
  _$jscoverage['/editor/range.js'].lineData[815] = 0;
  _$jscoverage['/editor/range.js'].lineData[819] = 0;
  _$jscoverage['/editor/range.js'].lineData[821] = 0;
  _$jscoverage['/editor/range.js'].lineData[822] = 0;
  _$jscoverage['/editor/range.js'].lineData[823] = 0;
  _$jscoverage['/editor/range.js'].lineData[824] = 0;
  _$jscoverage['/editor/range.js'].lineData[826] = 0;
  _$jscoverage['/editor/range.js'].lineData[827] = 0;
  _$jscoverage['/editor/range.js'].lineData[831] = 0;
  _$jscoverage['/editor/range.js'].lineData[833] = 0;
  _$jscoverage['/editor/range.js'].lineData[835] = 0;
  _$jscoverage['/editor/range.js'].lineData[836] = 0;
  _$jscoverage['/editor/range.js'].lineData[840] = 0;
  _$jscoverage['/editor/range.js'].lineData[842] = 0;
  _$jscoverage['/editor/range.js'].lineData[844] = 0;
  _$jscoverage['/editor/range.js'].lineData[847] = 0;
  _$jscoverage['/editor/range.js'].lineData[848] = 0;
  _$jscoverage['/editor/range.js'].lineData[850] = 0;
  _$jscoverage['/editor/range.js'].lineData[851] = 0;
  _$jscoverage['/editor/range.js'].lineData[853] = 0;
  _$jscoverage['/editor/range.js'].lineData[858] = 0;
  _$jscoverage['/editor/range.js'].lineData[859] = 0;
  _$jscoverage['/editor/range.js'].lineData[860] = 0;
  _$jscoverage['/editor/range.js'].lineData[861] = 0;
  _$jscoverage['/editor/range.js'].lineData[865] = 0;
  _$jscoverage['/editor/range.js'].lineData[866] = 0;
  _$jscoverage['/editor/range.js'].lineData[867] = 0;
  _$jscoverage['/editor/range.js'].lineData[868] = 0;
  _$jscoverage['/editor/range.js'].lineData[869] = 0;
  _$jscoverage['/editor/range.js'].lineData[873] = 0;
  _$jscoverage['/editor/range.js'].lineData[883] = 0;
  _$jscoverage['/editor/range.js'].lineData[893] = 0;
  _$jscoverage['/editor/range.js'].lineData[894] = 0;
  _$jscoverage['/editor/range.js'].lineData[900] = 0;
  _$jscoverage['/editor/range.js'].lineData[903] = 0;
  _$jscoverage['/editor/range.js'].lineData[904] = 0;
  _$jscoverage['/editor/range.js'].lineData[908] = 0;
  _$jscoverage['/editor/range.js'].lineData[910] = 0;
  _$jscoverage['/editor/range.js'].lineData[911] = 0;
  _$jscoverage['/editor/range.js'].lineData[917] = 0;
  _$jscoverage['/editor/range.js'].lineData[920] = 0;
  _$jscoverage['/editor/range.js'].lineData[921] = 0;
  _$jscoverage['/editor/range.js'].lineData[925] = 0;
  _$jscoverage['/editor/range.js'].lineData[928] = 0;
  _$jscoverage['/editor/range.js'].lineData[929] = 0;
  _$jscoverage['/editor/range.js'].lineData[933] = 0;
  _$jscoverage['/editor/range.js'].lineData[936] = 0;
  _$jscoverage['/editor/range.js'].lineData[937] = 0;
  _$jscoverage['/editor/range.js'].lineData[942] = 0;
  _$jscoverage['/editor/range.js'].lineData[945] = 0;
  _$jscoverage['/editor/range.js'].lineData[946] = 0;
  _$jscoverage['/editor/range.js'].lineData[951] = 0;
  _$jscoverage['/editor/range.js'].lineData[965] = 0;
  _$jscoverage['/editor/range.js'].lineData[971] = 0;
  _$jscoverage['/editor/range.js'].lineData[972] = 0;
  _$jscoverage['/editor/range.js'].lineData[973] = 0;
  _$jscoverage['/editor/range.js'].lineData[977] = 0;
  _$jscoverage['/editor/range.js'].lineData[979] = 0;
  _$jscoverage['/editor/range.js'].lineData[980] = 0;
  _$jscoverage['/editor/range.js'].lineData[981] = 0;
  _$jscoverage['/editor/range.js'].lineData[985] = 0;
  _$jscoverage['/editor/range.js'].lineData[986] = 0;
  _$jscoverage['/editor/range.js'].lineData[987] = 0;
  _$jscoverage['/editor/range.js'].lineData[989] = 0;
  _$jscoverage['/editor/range.js'].lineData[990] = 0;
  _$jscoverage['/editor/range.js'].lineData[993] = 0;
  _$jscoverage['/editor/range.js'].lineData[994] = 0;
  _$jscoverage['/editor/range.js'].lineData[995] = 0;
  _$jscoverage['/editor/range.js'].lineData[998] = 0;
  _$jscoverage['/editor/range.js'].lineData[999] = 0;
  _$jscoverage['/editor/range.js'].lineData[1000] = 0;
  _$jscoverage['/editor/range.js'].lineData[1003] = 0;
  _$jscoverage['/editor/range.js'].lineData[1004] = 0;
  _$jscoverage['/editor/range.js'].lineData[1005] = 0;
  _$jscoverage['/editor/range.js'].lineData[1007] = 0;
  _$jscoverage['/editor/range.js'].lineData[1010] = 0;
  _$jscoverage['/editor/range.js'].lineData[1024] = 0;
  _$jscoverage['/editor/range.js'].lineData[1025] = 0;
  _$jscoverage['/editor/range.js'].lineData[1026] = 0;
  _$jscoverage['/editor/range.js'].lineData[1035] = 0;
  _$jscoverage['/editor/range.js'].lineData[1040] = 0;
  _$jscoverage['/editor/range.js'].lineData[1045] = 0;
  _$jscoverage['/editor/range.js'].lineData[1046] = 0;
  _$jscoverage['/editor/range.js'].lineData[1047] = 0;
  _$jscoverage['/editor/range.js'].lineData[1051] = 0;
  _$jscoverage['/editor/range.js'].lineData[1052] = 0;
  _$jscoverage['/editor/range.js'].lineData[1053] = 0;
  _$jscoverage['/editor/range.js'].lineData[1058] = 0;
  _$jscoverage['/editor/range.js'].lineData[1060] = 0;
  _$jscoverage['/editor/range.js'].lineData[1061] = 0;
  _$jscoverage['/editor/range.js'].lineData[1064] = 0;
  _$jscoverage['/editor/range.js'].lineData[1065] = 0;
  _$jscoverage['/editor/range.js'].lineData[1066] = 0;
  _$jscoverage['/editor/range.js'].lineData[1067] = 0;
  _$jscoverage['/editor/range.js'].lineData[1071] = 0;
  _$jscoverage['/editor/range.js'].lineData[1073] = 0;
  _$jscoverage['/editor/range.js'].lineData[1074] = 0;
  _$jscoverage['/editor/range.js'].lineData[1075] = 0;
  _$jscoverage['/editor/range.js'].lineData[1079] = 0;
  _$jscoverage['/editor/range.js'].lineData[1082] = 0;
  _$jscoverage['/editor/range.js'].lineData[1086] = 0;
  _$jscoverage['/editor/range.js'].lineData[1087] = 0;
  _$jscoverage['/editor/range.js'].lineData[1088] = 0;
  _$jscoverage['/editor/range.js'].lineData[1092] = 0;
  _$jscoverage['/editor/range.js'].lineData[1093] = 0;
  _$jscoverage['/editor/range.js'].lineData[1094] = 0;
  _$jscoverage['/editor/range.js'].lineData[1099] = 0;
  _$jscoverage['/editor/range.js'].lineData[1101] = 0;
  _$jscoverage['/editor/range.js'].lineData[1102] = 0;
  _$jscoverage['/editor/range.js'].lineData[1105] = 0;
  _$jscoverage['/editor/range.js'].lineData[1113] = 0;
  _$jscoverage['/editor/range.js'].lineData[1114] = 0;
  _$jscoverage['/editor/range.js'].lineData[1115] = 0;
  _$jscoverage['/editor/range.js'].lineData[1116] = 0;
  _$jscoverage['/editor/range.js'].lineData[1120] = 0;
  _$jscoverage['/editor/range.js'].lineData[1122] = 0;
  _$jscoverage['/editor/range.js'].lineData[1123] = 0;
  _$jscoverage['/editor/range.js'].lineData[1126] = 0;
  _$jscoverage['/editor/range.js'].lineData[1134] = 0;
  _$jscoverage['/editor/range.js'].lineData[1136] = 0;
  _$jscoverage['/editor/range.js'].lineData[1138] = 0;
  _$jscoverage['/editor/range.js'].lineData[1144] = 0;
  _$jscoverage['/editor/range.js'].lineData[1147] = 0;
  _$jscoverage['/editor/range.js'].lineData[1148] = 0;
  _$jscoverage['/editor/range.js'].lineData[1150] = 0;
  _$jscoverage['/editor/range.js'].lineData[1154] = 0;
  _$jscoverage['/editor/range.js'].lineData[1161] = 0;
  _$jscoverage['/editor/range.js'].lineData[1164] = 0;
  _$jscoverage['/editor/range.js'].lineData[1168] = 0;
  _$jscoverage['/editor/range.js'].lineData[1169] = 0;
  _$jscoverage['/editor/range.js'].lineData[1170] = 0;
  _$jscoverage['/editor/range.js'].lineData[1172] = 0;
  _$jscoverage['/editor/range.js'].lineData[1183] = 0;
  _$jscoverage['/editor/range.js'].lineData[1188] = 0;
  _$jscoverage['/editor/range.js'].lineData[1189] = 0;
  _$jscoverage['/editor/range.js'].lineData[1192] = 0;
  _$jscoverage['/editor/range.js'].lineData[1194] = 0;
  _$jscoverage['/editor/range.js'].lineData[1197] = 0;
  _$jscoverage['/editor/range.js'].lineData[1200] = 0;
  _$jscoverage['/editor/range.js'].lineData[1213] = 0;
  _$jscoverage['/editor/range.js'].lineData[1214] = 0;
  _$jscoverage['/editor/range.js'].lineData[1222] = 0;
  _$jscoverage['/editor/range.js'].lineData[1223] = 0;
  _$jscoverage['/editor/range.js'].lineData[1225] = 0;
  _$jscoverage['/editor/range.js'].lineData[1226] = 0;
  _$jscoverage['/editor/range.js'].lineData[1229] = 0;
  _$jscoverage['/editor/range.js'].lineData[1230] = 0;
  _$jscoverage['/editor/range.js'].lineData[1235] = 0;
  _$jscoverage['/editor/range.js'].lineData[1237] = 0;
  _$jscoverage['/editor/range.js'].lineData[1240] = 0;
  _$jscoverage['/editor/range.js'].lineData[1242] = 0;
  _$jscoverage['/editor/range.js'].lineData[1245] = 0;
  _$jscoverage['/editor/range.js'].lineData[1247] = 0;
  _$jscoverage['/editor/range.js'].lineData[1248] = 0;
  _$jscoverage['/editor/range.js'].lineData[1249] = 0;
  _$jscoverage['/editor/range.js'].lineData[1251] = 0;
  _$jscoverage['/editor/range.js'].lineData[1256] = 0;
  _$jscoverage['/editor/range.js'].lineData[1258] = 0;
  _$jscoverage['/editor/range.js'].lineData[1260] = 0;
  _$jscoverage['/editor/range.js'].lineData[1262] = 0;
  _$jscoverage['/editor/range.js'].lineData[1269] = 0;
  _$jscoverage['/editor/range.js'].lineData[1271] = 0;
  _$jscoverage['/editor/range.js'].lineData[1272] = 0;
  _$jscoverage['/editor/range.js'].lineData[1275] = 0;
  _$jscoverage['/editor/range.js'].lineData[1276] = 0;
  _$jscoverage['/editor/range.js'].lineData[1277] = 0;
  _$jscoverage['/editor/range.js'].lineData[1280] = 0;
  _$jscoverage['/editor/range.js'].lineData[1283] = 0;
  _$jscoverage['/editor/range.js'].lineData[1284] = 0;
  _$jscoverage['/editor/range.js'].lineData[1289] = 0;
  _$jscoverage['/editor/range.js'].lineData[1290] = 0;
  _$jscoverage['/editor/range.js'].lineData[1291] = 0;
  _$jscoverage['/editor/range.js'].lineData[1294] = 0;
  _$jscoverage['/editor/range.js'].lineData[1295] = 0;
  _$jscoverage['/editor/range.js'].lineData[1298] = 0;
  _$jscoverage['/editor/range.js'].lineData[1301] = 0;
  _$jscoverage['/editor/range.js'].lineData[1302] = 0;
  _$jscoverage['/editor/range.js'].lineData[1304] = 0;
  _$jscoverage['/editor/range.js'].lineData[1305] = 0;
  _$jscoverage['/editor/range.js'].lineData[1306] = 0;
  _$jscoverage['/editor/range.js'].lineData[1307] = 0;
  _$jscoverage['/editor/range.js'].lineData[1310] = 0;
  _$jscoverage['/editor/range.js'].lineData[1316] = 0;
  _$jscoverage['/editor/range.js'].lineData[1317] = 0;
  _$jscoverage['/editor/range.js'].lineData[1319] = 0;
  _$jscoverage['/editor/range.js'].lineData[1320] = 0;
  _$jscoverage['/editor/range.js'].lineData[1322] = 0;
  _$jscoverage['/editor/range.js'].lineData[1330] = 0;
  _$jscoverage['/editor/range.js'].lineData[1331] = 0;
  _$jscoverage['/editor/range.js'].lineData[1332] = 0;
  _$jscoverage['/editor/range.js'].lineData[1334] = 0;
  _$jscoverage['/editor/range.js'].lineData[1338] = 0;
  _$jscoverage['/editor/range.js'].lineData[1339] = 0;
  _$jscoverage['/editor/range.js'].lineData[1340] = 0;
  _$jscoverage['/editor/range.js'].lineData[1342] = 0;
  _$jscoverage['/editor/range.js'].lineData[1345] = 0;
  _$jscoverage['/editor/range.js'].lineData[1347] = 0;
  _$jscoverage['/editor/range.js'].lineData[1350] = 0;
  _$jscoverage['/editor/range.js'].lineData[1354] = 0;
  _$jscoverage['/editor/range.js'].lineData[1369] = 0;
  _$jscoverage['/editor/range.js'].lineData[1370] = 0;
  _$jscoverage['/editor/range.js'].lineData[1371] = 0;
  _$jscoverage['/editor/range.js'].lineData[1372] = 0;
  _$jscoverage['/editor/range.js'].lineData[1375] = 0;
  _$jscoverage['/editor/range.js'].lineData[1377] = 0;
  _$jscoverage['/editor/range.js'].lineData[1380] = 0;
  _$jscoverage['/editor/range.js'].lineData[1383] = 0;
  _$jscoverage['/editor/range.js'].lineData[1387] = 0;
  _$jscoverage['/editor/range.js'].lineData[1394] = 0;
  _$jscoverage['/editor/range.js'].lineData[1395] = 0;
  _$jscoverage['/editor/range.js'].lineData[1406] = 0;
  _$jscoverage['/editor/range.js'].lineData[1412] = 0;
  _$jscoverage['/editor/range.js'].lineData[1413] = 0;
  _$jscoverage['/editor/range.js'].lineData[1414] = 0;
  _$jscoverage['/editor/range.js'].lineData[1415] = 0;
  _$jscoverage['/editor/range.js'].lineData[1422] = 0;
  _$jscoverage['/editor/range.js'].lineData[1426] = 0;
  _$jscoverage['/editor/range.js'].lineData[1429] = 0;
  _$jscoverage['/editor/range.js'].lineData[1430] = 0;
  _$jscoverage['/editor/range.js'].lineData[1431] = 0;
  _$jscoverage['/editor/range.js'].lineData[1433] = 0;
  _$jscoverage['/editor/range.js'].lineData[1434] = 0;
  _$jscoverage['/editor/range.js'].lineData[1436] = 0;
  _$jscoverage['/editor/range.js'].lineData[1444] = 0;
  _$jscoverage['/editor/range.js'].lineData[1449] = 0;
  _$jscoverage['/editor/range.js'].lineData[1450] = 0;
  _$jscoverage['/editor/range.js'].lineData[1451] = 0;
  _$jscoverage['/editor/range.js'].lineData[1452] = 0;
  _$jscoverage['/editor/range.js'].lineData[1459] = 0;
  _$jscoverage['/editor/range.js'].lineData[1463] = 0;
  _$jscoverage['/editor/range.js'].lineData[1466] = 0;
  _$jscoverage['/editor/range.js'].lineData[1467] = 0;
  _$jscoverage['/editor/range.js'].lineData[1468] = 0;
  _$jscoverage['/editor/range.js'].lineData[1470] = 0;
  _$jscoverage['/editor/range.js'].lineData[1471] = 0;
  _$jscoverage['/editor/range.js'].lineData[1473] = 0;
  _$jscoverage['/editor/range.js'].lineData[1482] = 0;
  _$jscoverage['/editor/range.js'].lineData[1486] = 0;
  _$jscoverage['/editor/range.js'].lineData[1490] = 0;
  _$jscoverage['/editor/range.js'].lineData[1492] = 0;
  _$jscoverage['/editor/range.js'].lineData[1493] = 0;
  _$jscoverage['/editor/range.js'].lineData[1502] = 0;
  _$jscoverage['/editor/range.js'].lineData[1509] = 0;
  _$jscoverage['/editor/range.js'].lineData[1510] = 0;
  _$jscoverage['/editor/range.js'].lineData[1511] = 0;
  _$jscoverage['/editor/range.js'].lineData[1512] = 0;
  _$jscoverage['/editor/range.js'].lineData[1513] = 0;
  _$jscoverage['/editor/range.js'].lineData[1515] = 0;
  _$jscoverage['/editor/range.js'].lineData[1519] = 0;
  _$jscoverage['/editor/range.js'].lineData[1520] = 0;
  _$jscoverage['/editor/range.js'].lineData[1521] = 0;
  _$jscoverage['/editor/range.js'].lineData[1524] = 0;
  _$jscoverage['/editor/range.js'].lineData[1529] = 0;
  _$jscoverage['/editor/range.js'].lineData[1533] = 0;
  _$jscoverage['/editor/range.js'].lineData[1534] = 0;
  _$jscoverage['/editor/range.js'].lineData[1535] = 0;
  _$jscoverage['/editor/range.js'].lineData[1536] = 0;
  _$jscoverage['/editor/range.js'].lineData[1539] = 0;
  _$jscoverage['/editor/range.js'].lineData[1540] = 0;
  _$jscoverage['/editor/range.js'].lineData[1544] = 0;
  _$jscoverage['/editor/range.js'].lineData[1545] = 0;
  _$jscoverage['/editor/range.js'].lineData[1546] = 0;
  _$jscoverage['/editor/range.js'].lineData[1548] = 0;
  _$jscoverage['/editor/range.js'].lineData[1554] = 0;
  _$jscoverage['/editor/range.js'].lineData[1555] = 0;
  _$jscoverage['/editor/range.js'].lineData[1558] = 0;
  _$jscoverage['/editor/range.js'].lineData[1569] = 0;
  _$jscoverage['/editor/range.js'].lineData[1572] = 0;
  _$jscoverage['/editor/range.js'].lineData[1573] = 0;
  _$jscoverage['/editor/range.js'].lineData[1574] = 0;
  _$jscoverage['/editor/range.js'].lineData[1575] = 0;
  _$jscoverage['/editor/range.js'].lineData[1576] = 0;
  _$jscoverage['/editor/range.js'].lineData[1577] = 0;
  _$jscoverage['/editor/range.js'].lineData[1579] = 0;
  _$jscoverage['/editor/range.js'].lineData[1580] = 0;
  _$jscoverage['/editor/range.js'].lineData[1581] = 0;
  _$jscoverage['/editor/range.js'].lineData[1590] = 0;
  _$jscoverage['/editor/range.js'].lineData[1600] = 0;
  _$jscoverage['/editor/range.js'].lineData[1601] = 0;
  _$jscoverage['/editor/range.js'].lineData[1605] = 0;
  _$jscoverage['/editor/range.js'].lineData[1606] = 0;
  _$jscoverage['/editor/range.js'].lineData[1607] = 0;
  _$jscoverage['/editor/range.js'].lineData[1608] = 0;
  _$jscoverage['/editor/range.js'].lineData[1611] = 0;
  _$jscoverage['/editor/range.js'].lineData[1612] = 0;
  _$jscoverage['/editor/range.js'].lineData[1617] = 0;
  _$jscoverage['/editor/range.js'].lineData[1621] = 0;
  _$jscoverage['/editor/range.js'].lineData[1623] = 0;
  _$jscoverage['/editor/range.js'].lineData[1624] = 0;
  _$jscoverage['/editor/range.js'].lineData[1625] = 0;
  _$jscoverage['/editor/range.js'].lineData[1626] = 0;
  _$jscoverage['/editor/range.js'].lineData[1627] = 0;
  _$jscoverage['/editor/range.js'].lineData[1629] = 0;
  _$jscoverage['/editor/range.js'].lineData[1630] = 0;
  _$jscoverage['/editor/range.js'].lineData[1631] = 0;
  _$jscoverage['/editor/range.js'].lineData[1632] = 0;
  _$jscoverage['/editor/range.js'].lineData[1635] = 0;
  _$jscoverage['/editor/range.js'].lineData[1639] = 0;
  _$jscoverage['/editor/range.js'].lineData[1640] = 0;
  _$jscoverage['/editor/range.js'].lineData[1645] = 0;
  _$jscoverage['/editor/range.js'].lineData[1660] = 0;
  _$jscoverage['/editor/range.js'].lineData[1661] = 0;
  _$jscoverage['/editor/range.js'].lineData[1662] = 0;
  _$jscoverage['/editor/range.js'].lineData[1667] = 0;
  _$jscoverage['/editor/range.js'].lineData[1668] = 0;
  _$jscoverage['/editor/range.js'].lineData[1673] = 0;
  _$jscoverage['/editor/range.js'].lineData[1675] = 0;
  _$jscoverage['/editor/range.js'].lineData[1676] = 0;
  _$jscoverage['/editor/range.js'].lineData[1677] = 0;
  _$jscoverage['/editor/range.js'].lineData[1689] = 0;
  _$jscoverage['/editor/range.js'].lineData[1690] = 0;
  _$jscoverage['/editor/range.js'].lineData[1692] = 0;
  _$jscoverage['/editor/range.js'].lineData[1694] = 0;
  _$jscoverage['/editor/range.js'].lineData[1697] = 0;
  _$jscoverage['/editor/range.js'].lineData[1698] = 0;
  _$jscoverage['/editor/range.js'].lineData[1701] = 0;
  _$jscoverage['/editor/range.js'].lineData[1704] = 0;
  _$jscoverage['/editor/range.js'].lineData[1706] = 0;
  _$jscoverage['/editor/range.js'].lineData[1708] = 0;
  _$jscoverage['/editor/range.js'].lineData[1709] = 0;
  _$jscoverage['/editor/range.js'].lineData[1712] = 0;
  _$jscoverage['/editor/range.js'].lineData[1713] = 0;
  _$jscoverage['/editor/range.js'].lineData[1717] = 0;
  _$jscoverage['/editor/range.js'].lineData[1718] = 0;
  _$jscoverage['/editor/range.js'].lineData[1721] = 0;
  _$jscoverage['/editor/range.js'].lineData[1724] = 0;
  _$jscoverage['/editor/range.js'].lineData[1727] = 0;
  _$jscoverage['/editor/range.js'].lineData[1735] = 0;
  _$jscoverage['/editor/range.js'].lineData[1736] = 0;
  _$jscoverage['/editor/range.js'].lineData[1737] = 0;
  _$jscoverage['/editor/range.js'].lineData[1747] = 0;
  _$jscoverage['/editor/range.js'].lineData[1753] = 0;
  _$jscoverage['/editor/range.js'].lineData[1754] = 0;
  _$jscoverage['/editor/range.js'].lineData[1755] = 0;
  _$jscoverage['/editor/range.js'].lineData[1756] = 0;
  _$jscoverage['/editor/range.js'].lineData[1757] = 0;
  _$jscoverage['/editor/range.js'].lineData[1760] = 0;
  _$jscoverage['/editor/range.js'].lineData[1761] = 0;
  _$jscoverage['/editor/range.js'].lineData[1762] = 0;
  _$jscoverage['/editor/range.js'].lineData[1763] = 0;
  _$jscoverage['/editor/range.js'].lineData[1765] = 0;
  _$jscoverage['/editor/range.js'].lineData[1767] = 0;
  _$jscoverage['/editor/range.js'].lineData[1770] = 0;
  _$jscoverage['/editor/range.js'].lineData[1771] = 0;
  _$jscoverage['/editor/range.js'].lineData[1775] = 0;
  _$jscoverage['/editor/range.js'].lineData[1779] = 0;
  _$jscoverage['/editor/range.js'].lineData[1781] = 0;
  _$jscoverage['/editor/range.js'].lineData[1782] = 0;
  _$jscoverage['/editor/range.js'].lineData[1784] = 0;
  _$jscoverage['/editor/range.js'].lineData[1790] = 0;
  _$jscoverage['/editor/range.js'].lineData[1791] = 0;
  _$jscoverage['/editor/range.js'].lineData[1794] = 0;
  _$jscoverage['/editor/range.js'].lineData[1797] = 0;
  _$jscoverage['/editor/range.js'].lineData[1800] = 0;
  _$jscoverage['/editor/range.js'].lineData[1804] = 0;
  _$jscoverage['/editor/range.js'].lineData[1806] = 0;
}
if (! _$jscoverage['/editor/range.js'].functionData) {
  _$jscoverage['/editor/range.js'].functionData = [];
  _$jscoverage['/editor/range.js'].functionData[0] = 0;
  _$jscoverage['/editor/range.js'].functionData[1] = 0;
  _$jscoverage['/editor/range.js'].functionData[2] = 0;
  _$jscoverage['/editor/range.js'].functionData[3] = 0;
  _$jscoverage['/editor/range.js'].functionData[4] = 0;
  _$jscoverage['/editor/range.js'].functionData[5] = 0;
  _$jscoverage['/editor/range.js'].functionData[6] = 0;
  _$jscoverage['/editor/range.js'].functionData[7] = 0;
  _$jscoverage['/editor/range.js'].functionData[8] = 0;
  _$jscoverage['/editor/range.js'].functionData[9] = 0;
  _$jscoverage['/editor/range.js'].functionData[10] = 0;
  _$jscoverage['/editor/range.js'].functionData[11] = 0;
  _$jscoverage['/editor/range.js'].functionData[12] = 0;
  _$jscoverage['/editor/range.js'].functionData[13] = 0;
  _$jscoverage['/editor/range.js'].functionData[14] = 0;
  _$jscoverage['/editor/range.js'].functionData[15] = 0;
  _$jscoverage['/editor/range.js'].functionData[16] = 0;
  _$jscoverage['/editor/range.js'].functionData[17] = 0;
  _$jscoverage['/editor/range.js'].functionData[18] = 0;
  _$jscoverage['/editor/range.js'].functionData[19] = 0;
  _$jscoverage['/editor/range.js'].functionData[20] = 0;
  _$jscoverage['/editor/range.js'].functionData[21] = 0;
  _$jscoverage['/editor/range.js'].functionData[22] = 0;
  _$jscoverage['/editor/range.js'].functionData[23] = 0;
  _$jscoverage['/editor/range.js'].functionData[24] = 0;
  _$jscoverage['/editor/range.js'].functionData[25] = 0;
  _$jscoverage['/editor/range.js'].functionData[26] = 0;
  _$jscoverage['/editor/range.js'].functionData[27] = 0;
  _$jscoverage['/editor/range.js'].functionData[28] = 0;
  _$jscoverage['/editor/range.js'].functionData[29] = 0;
  _$jscoverage['/editor/range.js'].functionData[30] = 0;
  _$jscoverage['/editor/range.js'].functionData[31] = 0;
  _$jscoverage['/editor/range.js'].functionData[32] = 0;
  _$jscoverage['/editor/range.js'].functionData[33] = 0;
  _$jscoverage['/editor/range.js'].functionData[34] = 0;
  _$jscoverage['/editor/range.js'].functionData[35] = 0;
  _$jscoverage['/editor/range.js'].functionData[36] = 0;
  _$jscoverage['/editor/range.js'].functionData[37] = 0;
  _$jscoverage['/editor/range.js'].functionData[38] = 0;
  _$jscoverage['/editor/range.js'].functionData[39] = 0;
  _$jscoverage['/editor/range.js'].functionData[40] = 0;
  _$jscoverage['/editor/range.js'].functionData[41] = 0;
  _$jscoverage['/editor/range.js'].functionData[42] = 0;
  _$jscoverage['/editor/range.js'].functionData[43] = 0;
  _$jscoverage['/editor/range.js'].functionData[44] = 0;
  _$jscoverage['/editor/range.js'].functionData[45] = 0;
  _$jscoverage['/editor/range.js'].functionData[46] = 0;
  _$jscoverage['/editor/range.js'].functionData[47] = 0;
  _$jscoverage['/editor/range.js'].functionData[48] = 0;
  _$jscoverage['/editor/range.js'].functionData[49] = 0;
  _$jscoverage['/editor/range.js'].functionData[50] = 0;
  _$jscoverage['/editor/range.js'].functionData[51] = 0;
  _$jscoverage['/editor/range.js'].functionData[52] = 0;
  _$jscoverage['/editor/range.js'].functionData[53] = 0;
  _$jscoverage['/editor/range.js'].functionData[54] = 0;
}
if (! _$jscoverage['/editor/range.js'].branchData) {
  _$jscoverage['/editor/range.js'].branchData = {};
  _$jscoverage['/editor/range.js'].branchData['100'] = [];
  _$jscoverage['/editor/range.js'].branchData['100'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['100'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['103'] = [];
  _$jscoverage['/editor/range.js'].branchData['103'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['103'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['106'] = [];
  _$jscoverage['/editor/range.js'].branchData['106'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['106'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['111'] = [];
  _$jscoverage['/editor/range.js'].branchData['111'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['118'] = [];
  _$jscoverage['/editor/range.js'].branchData['118'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['122'] = [];
  _$jscoverage['/editor/range.js'].branchData['122'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['124'] = [];
  _$jscoverage['/editor/range.js'].branchData['124'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['127'] = [];
  _$jscoverage['/editor/range.js'].branchData['127'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['131'] = [];
  _$jscoverage['/editor/range.js'].branchData['131'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['134'] = [];
  _$jscoverage['/editor/range.js'].branchData['134'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['134'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['134'][3] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['134'][4] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['165'] = [];
  _$jscoverage['/editor/range.js'].branchData['165'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['169'] = [];
  _$jscoverage['/editor/range.js'].branchData['169'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['182'] = [];
  _$jscoverage['/editor/range.js'].branchData['182'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['188'] = [];
  _$jscoverage['/editor/range.js'].branchData['188'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['190'] = [];
  _$jscoverage['/editor/range.js'].branchData['190'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['206'] = [];
  _$jscoverage['/editor/range.js'].branchData['206'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['215'] = [];
  _$jscoverage['/editor/range.js'].branchData['215'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['222'] = [];
  _$jscoverage['/editor/range.js'].branchData['222'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['251'] = [];
  _$jscoverage['/editor/range.js'].branchData['251'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['259'] = [];
  _$jscoverage['/editor/range.js'].branchData['259'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['272'] = [];
  _$jscoverage['/editor/range.js'].branchData['272'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['276'] = [];
  _$jscoverage['/editor/range.js'].branchData['276'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['276'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['288'] = [];
  _$jscoverage['/editor/range.js'].branchData['288'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['293'] = [];
  _$jscoverage['/editor/range.js'].branchData['293'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['293'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['293'][3] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['301'] = [];
  _$jscoverage['/editor/range.js'].branchData['301'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['308'] = [];
  _$jscoverage['/editor/range.js'].branchData['308'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['318'] = [];
  _$jscoverage['/editor/range.js'].branchData['318'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['327'] = [];
  _$jscoverage['/editor/range.js'].branchData['327'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['336'] = [];
  _$jscoverage['/editor/range.js'].branchData['336'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['340'] = [];
  _$jscoverage['/editor/range.js'].branchData['340'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['340'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['350'] = [];
  _$jscoverage['/editor/range.js'].branchData['350'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['360'] = [];
  _$jscoverage['/editor/range.js'].branchData['360'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['368'] = [];
  _$jscoverage['/editor/range.js'].branchData['368'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['378'] = [];
  _$jscoverage['/editor/range.js'].branchData['378'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['383'] = [];
  _$jscoverage['/editor/range.js'].branchData['383'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['387'] = [];
  _$jscoverage['/editor/range.js'].branchData['387'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['389'] = [];
  _$jscoverage['/editor/range.js'].branchData['389'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['389'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['389'][3] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['391'] = [];
  _$jscoverage['/editor/range.js'].branchData['391'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['397'] = [];
  _$jscoverage['/editor/range.js'].branchData['397'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['399'] = [];
  _$jscoverage['/editor/range.js'].branchData['399'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['399'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['400'] = [];
  _$jscoverage['/editor/range.js'].branchData['400'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['401'] = [];
  _$jscoverage['/editor/range.js'].branchData['401'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['414'] = [];
  _$jscoverage['/editor/range.js'].branchData['414'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['414'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['416'] = [];
  _$jscoverage['/editor/range.js'].branchData['416'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['423'] = [];
  _$jscoverage['/editor/range.js'].branchData['423'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['438'] = [];
  _$jscoverage['/editor/range.js'].branchData['438'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['442'] = [];
  _$jscoverage['/editor/range.js'].branchData['442'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['451'] = [];
  _$jscoverage['/editor/range.js'].branchData['451'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['452'] = [];
  _$jscoverage['/editor/range.js'].branchData['452'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['453'] = [];
  _$jscoverage['/editor/range.js'].branchData['453'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['453'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['454'] = [];
  _$jscoverage['/editor/range.js'].branchData['454'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['483'] = [];
  _$jscoverage['/editor/range.js'].branchData['483'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['484'] = [];
  _$jscoverage['/editor/range.js'].branchData['484'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['499'] = [];
  _$jscoverage['/editor/range.js'].branchData['499'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['500'] = [];
  _$jscoverage['/editor/range.js'].branchData['500'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['502'] = [];
  _$jscoverage['/editor/range.js'].branchData['502'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['510'] = [];
  _$jscoverage['/editor/range.js'].branchData['510'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['511'] = [];
  _$jscoverage['/editor/range.js'].branchData['511'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['513'] = [];
  _$jscoverage['/editor/range.js'].branchData['513'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['556'] = [];
  _$jscoverage['/editor/range.js'].branchData['556'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['557'] = [];
  _$jscoverage['/editor/range.js'].branchData['557'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['557'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['561'] = [];
  _$jscoverage['/editor/range.js'].branchData['561'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['562'] = [];
  _$jscoverage['/editor/range.js'].branchData['562'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['562'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['583'] = [];
  _$jscoverage['/editor/range.js'].branchData['583'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['583'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['591'] = [];
  _$jscoverage['/editor/range.js'].branchData['591'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['614'] = [];
  _$jscoverage['/editor/range.js'].branchData['614'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['614'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['622'] = [];
  _$jscoverage['/editor/range.js'].branchData['622'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['643'] = [];
  _$jscoverage['/editor/range.js'].branchData['643'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['674'] = [];
  _$jscoverage['/editor/range.js'].branchData['674'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['719'] = [];
  _$jscoverage['/editor/range.js'].branchData['719'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['760'] = [];
  _$jscoverage['/editor/range.js'].branchData['760'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['760'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['761'] = [];
  _$jscoverage['/editor/range.js'].branchData['761'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['769'] = [];
  _$jscoverage['/editor/range.js'].branchData['769'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['780'] = [];
  _$jscoverage['/editor/range.js'].branchData['780'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['791'] = [];
  _$jscoverage['/editor/range.js'].branchData['791'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['792'] = [];
  _$jscoverage['/editor/range.js'].branchData['792'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['805'] = [];
  _$jscoverage['/editor/range.js'].branchData['805'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['806'] = [];
  _$jscoverage['/editor/range.js'].branchData['806'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['807'] = [];
  _$jscoverage['/editor/range.js'].branchData['807'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['809'] = [];
  _$jscoverage['/editor/range.js'].branchData['809'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['819'] = [];
  _$jscoverage['/editor/range.js'].branchData['819'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['820'] = [];
  _$jscoverage['/editor/range.js'].branchData['820'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['821'] = [];
  _$jscoverage['/editor/range.js'].branchData['821'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['823'] = [];
  _$jscoverage['/editor/range.js'].branchData['823'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['831'] = [];
  _$jscoverage['/editor/range.js'].branchData['831'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['836'] = [];
  _$jscoverage['/editor/range.js'].branchData['836'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['836'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['842'] = [];
  _$jscoverage['/editor/range.js'].branchData['842'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['842'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['843'] = [];
  _$jscoverage['/editor/range.js'].branchData['843'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['847'] = [];
  _$jscoverage['/editor/range.js'].branchData['847'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['847'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['850'] = [];
  _$jscoverage['/editor/range.js'].branchData['850'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['850'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['858'] = [];
  _$jscoverage['/editor/range.js'].branchData['858'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['859'] = [];
  _$jscoverage['/editor/range.js'].branchData['859'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['860'] = [];
  _$jscoverage['/editor/range.js'].branchData['860'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['865'] = [];
  _$jscoverage['/editor/range.js'].branchData['865'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['867'] = [];
  _$jscoverage['/editor/range.js'].branchData['867'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['868'] = [];
  _$jscoverage['/editor/range.js'].branchData['868'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['873'] = [];
  _$jscoverage['/editor/range.js'].branchData['873'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['893'] = [];
  _$jscoverage['/editor/range.js'].branchData['893'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['900'] = [];
  _$jscoverage['/editor/range.js'].branchData['900'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['903'] = [];
  _$jscoverage['/editor/range.js'].branchData['903'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['908'] = [];
  _$jscoverage['/editor/range.js'].branchData['908'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['908'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['908'][3] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['908'][4] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['909'] = [];
  _$jscoverage['/editor/range.js'].branchData['909'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['909'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['909'][3] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['917'] = [];
  _$jscoverage['/editor/range.js'].branchData['917'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['917'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['918'] = [];
  _$jscoverage['/editor/range.js'].branchData['918'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['919'] = [];
  _$jscoverage['/editor/range.js'].branchData['919'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['925'] = [];
  _$jscoverage['/editor/range.js'].branchData['925'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['928'] = [];
  _$jscoverage['/editor/range.js'].branchData['928'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['933'] = [];
  _$jscoverage['/editor/range.js'].branchData['933'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['933'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['934'] = [];
  _$jscoverage['/editor/range.js'].branchData['934'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['934'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['934'][3] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['934'][4] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['935'] = [];
  _$jscoverage['/editor/range.js'].branchData['935'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['942'] = [];
  _$jscoverage['/editor/range.js'].branchData['942'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['942'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['943'] = [];
  _$jscoverage['/editor/range.js'].branchData['943'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['944'] = [];
  _$jscoverage['/editor/range.js'].branchData['944'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['979'] = [];
  _$jscoverage['/editor/range.js'].branchData['979'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['985'] = [];
  _$jscoverage['/editor/range.js'].branchData['985'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['989'] = [];
  _$jscoverage['/editor/range.js'].branchData['989'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1003'] = [];
  _$jscoverage['/editor/range.js'].branchData['1003'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1040'] = [];
  _$jscoverage['/editor/range.js'].branchData['1040'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1040'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1041'] = [];
  _$jscoverage['/editor/range.js'].branchData['1041'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1042'] = [];
  _$jscoverage['/editor/range.js'].branchData['1042'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1045'] = [];
  _$jscoverage['/editor/range.js'].branchData['1045'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1051'] = [];
  _$jscoverage['/editor/range.js'].branchData['1051'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1064'] = [];
  _$jscoverage['/editor/range.js'].branchData['1064'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1066'] = [];
  _$jscoverage['/editor/range.js'].branchData['1066'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1073'] = [];
  _$jscoverage['/editor/range.js'].branchData['1073'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1082'] = [];
  _$jscoverage['/editor/range.js'].branchData['1082'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1082'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1083'] = [];
  _$jscoverage['/editor/range.js'].branchData['1083'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1083'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1086'] = [];
  _$jscoverage['/editor/range.js'].branchData['1086'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1092'] = [];
  _$jscoverage['/editor/range.js'].branchData['1092'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1118'] = [];
  _$jscoverage['/editor/range.js'].branchData['1118'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1122'] = [];
  _$jscoverage['/editor/range.js'].branchData['1122'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1136'] = [];
  _$jscoverage['/editor/range.js'].branchData['1136'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1140'] = [];
  _$jscoverage['/editor/range.js'].branchData['1140'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1147'] = [];
  _$jscoverage['/editor/range.js'].branchData['1147'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1168'] = [];
  _$jscoverage['/editor/range.js'].branchData['1168'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1188'] = [];
  _$jscoverage['/editor/range.js'].branchData['1188'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1189'] = [];
  _$jscoverage['/editor/range.js'].branchData['1189'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1190'] = [];
  _$jscoverage['/editor/range.js'].branchData['1190'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1190'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1191'] = [];
  _$jscoverage['/editor/range.js'].branchData['1191'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1200'] = [];
  _$jscoverage['/editor/range.js'].branchData['1200'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1200'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1222'] = [];
  _$jscoverage['/editor/range.js'].branchData['1222'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1223'] = [];
  _$jscoverage['/editor/range.js'].branchData['1223'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1225'] = [];
  _$jscoverage['/editor/range.js'].branchData['1225'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1229'] = [];
  _$jscoverage['/editor/range.js'].branchData['1229'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1240'] = [];
  _$jscoverage['/editor/range.js'].branchData['1240'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1248'] = [];
  _$jscoverage['/editor/range.js'].branchData['1248'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1256'] = [];
  _$jscoverage['/editor/range.js'].branchData['1256'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1258'] = [];
  _$jscoverage['/editor/range.js'].branchData['1258'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1271'] = [];
  _$jscoverage['/editor/range.js'].branchData['1271'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1275'] = [];
  _$jscoverage['/editor/range.js'].branchData['1275'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1294'] = [];
  _$jscoverage['/editor/range.js'].branchData['1294'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1304'] = [];
  _$jscoverage['/editor/range.js'].branchData['1304'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1326'] = [];
  _$jscoverage['/editor/range.js'].branchData['1326'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1331'] = [];
  _$jscoverage['/editor/range.js'].branchData['1331'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1339'] = [];
  _$jscoverage['/editor/range.js'].branchData['1339'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1339'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1350'] = [];
  _$jscoverage['/editor/range.js'].branchData['1350'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1356'] = [];
  _$jscoverage['/editor/range.js'].branchData['1356'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1356'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1364'] = [];
  _$jscoverage['/editor/range.js'].branchData['1364'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1364'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1364'][3] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1375'] = [];
  _$jscoverage['/editor/range.js'].branchData['1375'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1383'] = [];
  _$jscoverage['/editor/range.js'].branchData['1383'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1389'] = [];
  _$jscoverage['/editor/range.js'].branchData['1389'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1389'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1389'][3] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1394'] = [];
  _$jscoverage['/editor/range.js'].branchData['1394'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1412'] = [];
  _$jscoverage['/editor/range.js'].branchData['1412'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1412'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1414'] = [];
  _$jscoverage['/editor/range.js'].branchData['1414'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1431'] = [];
  _$jscoverage['/editor/range.js'].branchData['1431'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1449'] = [];
  _$jscoverage['/editor/range.js'].branchData['1449'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1451'] = [];
  _$jscoverage['/editor/range.js'].branchData['1451'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1468'] = [];
  _$jscoverage['/editor/range.js'].branchData['1468'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1484'] = [];
  _$jscoverage['/editor/range.js'].branchData['1484'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1486'] = [];
  _$jscoverage['/editor/range.js'].branchData['1486'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1493'] = [];
  _$jscoverage['/editor/range.js'].branchData['1493'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1509'] = [];
  _$jscoverage['/editor/range.js'].branchData['1509'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1511'] = [];
  _$jscoverage['/editor/range.js'].branchData['1511'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1513'] = [];
  _$jscoverage['/editor/range.js'].branchData['1513'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1529'] = [];
  _$jscoverage['/editor/range.js'].branchData['1529'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1533'] = [];
  _$jscoverage['/editor/range.js'].branchData['1533'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1535'] = [];
  _$jscoverage['/editor/range.js'].branchData['1535'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1539'] = [];
  _$jscoverage['/editor/range.js'].branchData['1539'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1554'] = [];
  _$jscoverage['/editor/range.js'].branchData['1554'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1576'] = [];
  _$jscoverage['/editor/range.js'].branchData['1576'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1600'] = [];
  _$jscoverage['/editor/range.js'].branchData['1600'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1605'] = [];
  _$jscoverage['/editor/range.js'].branchData['1605'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1606'] = [];
  _$jscoverage['/editor/range.js'].branchData['1606'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1611'] = [];
  _$jscoverage['/editor/range.js'].branchData['1611'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1617'] = [];
  _$jscoverage['/editor/range.js'].branchData['1617'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1618'] = [];
  _$jscoverage['/editor/range.js'].branchData['1618'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1623'] = [];
  _$jscoverage['/editor/range.js'].branchData['1623'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1623'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1624'] = [];
  _$jscoverage['/editor/range.js'].branchData['1624'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1629'] = [];
  _$jscoverage['/editor/range.js'].branchData['1629'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1639'] = [];
  _$jscoverage['/editor/range.js'].branchData['1639'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1661'] = [];
  _$jscoverage['/editor/range.js'].branchData['1661'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1692'] = [];
  _$jscoverage['/editor/range.js'].branchData['1692'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1692'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1697'] = [];
  _$jscoverage['/editor/range.js'].branchData['1697'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1708'] = [];
  _$jscoverage['/editor/range.js'].branchData['1708'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1717'] = [];
  _$jscoverage['/editor/range.js'].branchData['1717'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1717'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1737'] = [];
  _$jscoverage['/editor/range.js'].branchData['1737'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1754'] = [];
  _$jscoverage['/editor/range.js'].branchData['1754'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1756'] = [];
  _$jscoverage['/editor/range.js'].branchData['1756'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1756'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1760'] = [];
  _$jscoverage['/editor/range.js'].branchData['1760'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1770'] = [];
  _$jscoverage['/editor/range.js'].branchData['1770'][1] = new BranchData();
}
_$jscoverage['/editor/range.js'].branchData['1770'][1].init(764, 4, 'last');
function visit636_1770_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1770'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1760'][1].init(232, 50, 'self.checkStartOfBlock() && self.checkEndOfBlock()');
function visit635_1760_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1760'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1756'][2].init(132, 32, 'tmpDtd && tmpDtd[elementName]');
function visit634_1756_2(result) {
  _$jscoverage['/editor/range.js'].branchData['1756'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1756'][1].init(89, 77, '(tmpDtd = dtd[current.nodeName()]) && !(tmpDtd && tmpDtd[elementName])');
function visit633_1756_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1756'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1754'][1].init(255, 7, 'isBlock');
function visit632_1754_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1754'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1737'][1].init(115, 43, 'domNode.nodeType === Dom.NodeType.TEXT_NODE');
function visit631_1737_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1737'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1717'][2].init(482, 44, 'el[0].nodeType === Dom.NodeType.ELEMENT_NODE');
function visit630_1717_2(result) {
  _$jscoverage['/editor/range.js'].branchData['1717'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1717'][1].init(482, 66, 'el[0].nodeType === Dom.NodeType.ELEMENT_NODE && el._4eIsEditable()');
function visit629_1717_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1717'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1708'][1].init(85, 41, 'el[0].nodeType === Dom.NodeType.TEXT_NODE');
function visit628_1708_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1708'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1697'][1].init(278, 19, '!childOnly && !next');
function visit627_1697_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1697'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1692'][2].init(48, 46, 'node[0].nodeType === Dom.NodeType.ELEMENT_NODE');
function visit626_1692_2(result) {
  _$jscoverage['/editor/range.js'].branchData['1692'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1692'][1].init(48, 90, 'node[0].nodeType === Dom.NodeType.ELEMENT_NODE && node._4eIsEditable()');
function visit625_1692_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1692'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1661'][1].init(46, 15, '!self.collapsed');
function visit624_1661_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1661'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1639'][1].init(296, 57, '!UA.ie && !S.inArray(startBlock.nodeName(), [\'ul\', \'ol\'])');
function visit623_1639_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1639'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1629'][1].init(265, 14, 'isStartOfBlock');
function visit622_1629_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1629'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1624'][1].init(21, 12, 'isEndOfBlock');
function visit621_1624_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1624'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1623'][2].init(1257, 29, 'startBlock[0] === endBlock[0]');
function visit620_1623_2(result) {
  _$jscoverage['/editor/range.js'].branchData['1623'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1623'][1].init(1243, 43, 'startBlock && startBlock[0] === endBlock[0]');
function visit619_1623_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1623'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1618'][1].init(91, 34, 'endBlock && self.checkEndOfBlock()');
function visit618_1618_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1618'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1617'][1].init(1039, 38, 'startBlock && self.checkStartOfBlock()');
function visit617_1617_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1617'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1611'][1].init(212, 9, '!endBlock');
function visit616_1611_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1611'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1606'][1].init(21, 11, '!startBlock');
function visit615_1606_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1606'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1605'][1].init(626, 17, 'blockTag !== \'br\'');
function visit614_1605_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1605'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1600'][1].init(482, 38, '!startBlockLimit.equals(endBlockLimit)');
function visit613_1600_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1600'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1576'][1].init(354, 6, '!UA.ie');
function visit612_1576_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1576'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1554'][1].init(2355, 55, 'startNode._4ePosition(endNode) & KEP.POSITION_FOLLOWING');
function visit611_1554_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1554'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1539'][1].init(305, 16, 'childCount === 0');
function visit610_1539_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1539'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1535'][1].init(80, 22, 'childCount > endOffset');
function visit609_1535_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1535'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1533'][1].init(1364, 49, 'endNode[0].nodeType === Dom.NodeType.ELEMENT_NODE');
function visit608_1533_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1533'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1529'][1].init(599, 42, 'startNode._4eNextSourceNode() || startNode');
function visit607_1529_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1529'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1513'][1].init(211, 16, 'childCount === 0');
function visit606_1513_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1513'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1511'][1].init(82, 24, 'childCount > startOffset');
function visit605_1511_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1511'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1509'][1].init(261, 51, 'startNode[0].nodeType === Dom.NodeType.ELEMENT_NODE');
function visit604_1509_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1509'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1493'][1].init(7, 23, 'checkType === KER.START');
function visit603_1493_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1493'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1486'][1].init(219, 23, 'checkType === KER.START');
function visit602_1486_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1486'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1484'][1].init(12, 23, 'checkType === KER.START');
function visit601_1484_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1484'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1468'][1].init(1113, 29, 'path.block || path.blockLimit');
function visit600_1468_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1468'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1451'][1].init(109, 16, 'textAfter.length');
function visit599_1451_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1451'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1449'][1].init(265, 51, 'endContainer[0].nodeType === Dom.NodeType.TEXT_NODE');
function visit598_1449_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1449'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1431'][1].init(1171, 29, 'path.block || path.blockLimit');
function visit597_1431_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1431'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1414'][1].init(117, 17, 'textBefore.length');
function visit596_1414_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1414'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1412'][2].init(309, 53, 'startContainer[0].nodeType === Dom.NodeType.TEXT_NODE');
function visit595_1412_2(result) {
  _$jscoverage['/editor/range.js'].branchData['1412'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1412'][1].init(294, 68, 'startOffset && startContainer[0].nodeType === Dom.NodeType.TEXT_NODE');
function visit594_1412_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1412'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1394'][1].init(4381, 6, 'tailBr');
function visit593_1394_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1394'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1389'][3].init(129, 50, 'enlargeable && blockBoundary.contains(enlargeable)');
function visit592_1389_3(result) {
  _$jscoverage['/editor/range.js'].branchData['1389'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1389'][2].init(87, 38, '!enlargeable && self.checkEndOfBlock()');
function visit591_1389_2(result) {
  _$jscoverage['/editor/range.js'].branchData['1389'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1389'][1].init(87, 92, '!enlargeable && self.checkEndOfBlock() || enlargeable && blockBoundary.contains(enlargeable)');
function visit590_1389_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1389'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1383'][1].init(3691, 21, 'blockBoundary || body');
function visit589_1383_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1383'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1375'][1].init(3269, 39, 'unit === KER.ENLARGE_LIST_ITEM_CONTENTS');
function visit588_1375_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1375'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1364'][3].init(587, 50, 'enlargeable && blockBoundary.contains(enlargeable)');
function visit587_1364_3(result) {
  _$jscoverage['/editor/range.js'].branchData['1364'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1364'][2].init(543, 40, '!enlargeable && self.checkStartOfBlock()');
function visit586_1364_2(result) {
  _$jscoverage['/editor/range.js'].branchData['1364'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1364'][1].init(543, 94, '!enlargeable && self.checkStartOfBlock() || enlargeable && blockBoundary.contains(enlargeable)');
function visit585_1364_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1364'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1356'][2].init(88, 33, 'blockBoundary.nodeName() !== \'br\'');
function visit584_1356_2(result) {
  _$jscoverage['/editor/range.js'].branchData['1356'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1356'][1].init(-1, 552, 'blockBoundary.nodeName() !== \'br\' && (!enlargeable && self.checkStartOfBlock() || enlargeable && blockBoundary.contains(enlargeable))');
function visit583_1356_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1356'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1350'][1].init(1904, 21, 'blockBoundary || body');
function visit582_1350_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1350'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1339'][2].init(114, 27, 'Dom.nodeName(node) === \'br\'');
function visit581_1339_2(result) {
  _$jscoverage['/editor/range.js'].branchData['1339'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1339'][1].init(103, 38, '!retVal && Dom.nodeName(node) === \'br\'');
function visit580_1339_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1339'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1331'][1].init(102, 7, '!retVal');
function visit579_1331_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1331'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1326'][1].init(55, 39, 'unit === KER.ENLARGE_LIST_ITEM_CONTENTS');
function visit578_1326_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1326'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1304'][1].init(418, 18, 'stop[0] && stop[1]');
function visit577_1304_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1304'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1294'][1].init(55, 14, 'self.collapsed');
function visit576_1294_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1294'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1275'][1].init(961, 47, 'commonReached || enlarge.equals(commonAncestor)');
function visit575_1275_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1275'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1271'][1].init(849, 29, 'enlarge.nodeName() === \'body\'');
function visit574_1271_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1271'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1258'][1].init(67, 14, '!commonReached');
function visit573_1258_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1258'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1256'][1].init(385, 7, 'sibling');
function visit572_1256_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1256'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1248'][1].init(29, 44, 'isWhitespace(sibling) || isBookmark(sibling)');
function visit571_1248_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1248'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1240'][1].init(64, 57, 'container[0].childNodes[offset + (left ? -1 : 1)] || null');
function visit570_1240_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1240'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1229'][1].init(29, 38, 'offset < container[0].nodeValue.length');
function visit569_1229_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1229'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1225'][1].init(68, 6, 'offset');
function visit568_1225_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1225'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1223'][1].init(25, 4, 'left');
function visit567_1223_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1223'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1222'][1].init(386, 48, 'container[0].nodeType === Dom.NodeType.TEXT_NODE');
function visit566_1222_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1222'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1200'][2].init(642, 47, 'ancestor[0].nodeType === Dom.NodeType.TEXT_NODE');
function visit565_1200_2(result) {
  _$jscoverage['/editor/range.js'].branchData['1200'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1200'][1].init(624, 65, 'ignoreTextNode && ancestor[0].nodeType === Dom.NodeType.TEXT_NODE');
function visit564_1200_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1200'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1191'][1].init(70, 39, 'self.startOffset === self.endOffset - 1');
function visit563_1191_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1191'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1190'][2].init(58, 47, 'start[0].nodeType === Dom.NodeType.ELEMENT_NODE');
function visit562_1190_2(result) {
  _$jscoverage['/editor/range.js'].branchData['1190'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1190'][1].init(34, 110, 'start[0].nodeType === Dom.NodeType.ELEMENT_NODE && self.startOffset === self.endOffset - 1');
function visit561_1190_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1190'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1189'][1].init(21, 145, 'includeSelf && start[0].nodeType === Dom.NodeType.ELEMENT_NODE && self.startOffset === self.endOffset - 1');
function visit560_1189_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1189'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1188'][1].init(159, 19, 'start[0] === end[0]');
function visit559_1188_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1188'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1168'][1].init(767, 21, 'endNode && endNode[0]');
function visit558_1168_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1168'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1147'][1].init(554, 12, 'endContainer');
function visit557_1147_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1147'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1140'][1].init(169, 70, 'bookmark.end && doc._4eGetByAddress(bookmark.end, bookmark.normalized)');
function visit556_1140_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1140'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1136'][1].init(86, 12, 'bookmark.is2');
function visit555_1136_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1136'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1122'][1].init(423, 42, 'startContainer[0] === self.endContainer[0]');
function visit554_1122_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1122'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1118'][1].init(116, 49, 'startContainer[0].childNodes[startOffset] || null');
function visit553_1118_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1118'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1092'][1].init(405, 45, 'endOffset >= endContainer[0].nodeValue.length');
function visit552_1092_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1092'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1086'][1].init(128, 10, '!endOffset');
function visit551_1086_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1086'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1083'][2].init(2070, 51, 'endContainer[0].nodeType === Dom.NodeType.TEXT_NODE');
function visit550_1083_2(result) {
  _$jscoverage['/editor/range.js'].branchData['1083'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1083'][1].init(46, 70, 'endContainer[0] && endContainer[0].nodeType === Dom.NodeType.TEXT_NODE');
function visit549_1083_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1083'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1082'][2].init(2005, 22, 'ignoreEnd || collapsed');
function visit548_1082_2(result) {
  _$jscoverage['/editor/range.js'].branchData['1082'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1082'][1].init(2002, 117, '!(ignoreEnd || collapsed) && endContainer[0] && endContainer[0].nodeType === Dom.NodeType.TEXT_NODE');
function visit547_1082_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1082'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1073'][1].init(1441, 9, 'collapsed');
function visit546_1073_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1073'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1066'][1].init(472, 45, 'Dom.equals(startContainer, self.endContainer)');
function visit545_1066_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1066'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1064'][1].init(304, 50, 'Dom.equals(self.startContainer, self.endContainer)');
function visit544_1064_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1064'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1051'][1].init(415, 49, 'startOffset >= startContainer[0].nodeValue.length');
function visit543_1051_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1051'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1045'][1].init(128, 12, '!startOffset');
function visit542_1045_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1045'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1042'][1].init(36, 53, 'startContainer[0].nodeType === Dom.NodeType.TEXT_NODE');
function visit541_1042_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1042'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1041'][1].init(46, 90, 'startContainer[0] && startContainer[0].nodeType === Dom.NodeType.TEXT_NODE');
function visit540_1041_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1041'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1040'][2].init(195, 25, '!ignoreStart || collapsed');
function visit539_1040_2(result) {
  _$jscoverage['/editor/range.js'].branchData['1040'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1040'][1].init(195, 137, '(!ignoreStart || collapsed) && startContainer[0] && startContainer[0].nodeType === Dom.NodeType.TEXT_NODE');
function visit538_1040_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1040'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1003'][1].init(1218, 7, 'endNode');
function visit537_1003_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1003'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['989'][1].init(107, 12, 'serializable');
function visit536_989_1(result) {
  _$jscoverage['/editor/range.js'].branchData['989'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['985'][1].init(711, 10, '!collapsed');
function visit535_985_1(result) {
  _$jscoverage['/editor/range.js'].branchData['985'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['979'][1].init(507, 12, 'serializable');
function visit534_979_1(result) {
  _$jscoverage['/editor/range.js'].branchData['979'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['944'][1].init(71, 47, 'previous[0].nodeType === Dom.NodeType.TEXT_NODE');
function visit533_944_1(result) {
  _$jscoverage['/editor/range.js'].branchData['944'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['943'][1].init(80, 119, '(previous = endContainer.prev(undefined, 1)) && previous[0].nodeType === Dom.NodeType.TEXT_NODE');
function visit532_943_1(result) {
  _$jscoverage['/editor/range.js'].branchData['943'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['942'][2].init(844, 51, 'endContainer[0].nodeType === Dom.NodeType.TEXT_NODE');
function visit531_942_2(result) {
  _$jscoverage['/editor/range.js'].branchData['942'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['942'][1].init(844, 200, 'endContainer[0].nodeType === Dom.NodeType.TEXT_NODE && (previous = endContainer.prev(undefined, 1)) && previous[0].nodeType === Dom.NodeType.TEXT_NODE');
function visit530_942_1(result) {
  _$jscoverage['/editor/range.js'].branchData['942'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['935'][1].init(44, 60, 'child[0].previousSibling.nodeType === Dom.NodeType.TEXT_NODE');
function visit529_935_1(result) {
  _$jscoverage['/editor/range.js'].branchData['935'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['934'][4].init(326, 13, 'endOffset > 0');
function visit528_934_4(result) {
  _$jscoverage['/editor/range.js'].branchData['934'][4].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['934'][3].init(47, 105, 'endOffset > 0 && child[0].previousSibling.nodeType === Dom.NodeType.TEXT_NODE');
function visit527_934_3(result) {
  _$jscoverage['/editor/range.js'].branchData['934'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['934'][2].init(277, 44, 'child[0].nodeType === Dom.NodeType.TEXT_NODE');
function visit526_934_2(result) {
  _$jscoverage['/editor/range.js'].branchData['934'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['934'][1].init(39, 153, 'child[0].nodeType === Dom.NodeType.TEXT_NODE && endOffset > 0 && child[0].previousSibling.nodeType === Dom.NodeType.TEXT_NODE');
function visit525_934_1(result) {
  _$jscoverage['/editor/range.js'].branchData['934'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['933'][2].init(234, 193, 'child[0] && child[0].nodeType === Dom.NodeType.TEXT_NODE && endOffset > 0 && child[0].previousSibling.nodeType === Dom.NodeType.TEXT_NODE');
function visit524_933_2(result) {
  _$jscoverage['/editor/range.js'].branchData['933'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['933'][1].init(225, 202, 'child && child[0] && child[0].nodeType === Dom.NodeType.TEXT_NODE && endOffset > 0 && child[0].previousSibling.nodeType === Dom.NodeType.TEXT_NODE');
function visit523_933_1(result) {
  _$jscoverage['/editor/range.js'].branchData['933'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['928'][1].init(145, 54, 'endContainer[0].nodeType === Dom.NodeType.ELEMENT_NODE');
function visit522_928_1(result) {
  _$jscoverage['/editor/range.js'].branchData['928'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['925'][1].init(1185, 15, '!self.collapsed');
function visit521_925_1(result) {
  _$jscoverage['/editor/range.js'].branchData['925'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['919'][1].init(69, 47, 'previous[0].nodeType === Dom.NodeType.TEXT_NODE');
function visit520_919_1(result) {
  _$jscoverage['/editor/range.js'].branchData['919'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['918'][1].init(78, 117, '(previous = startContainer.prev(undefined, 1)) && previous[0].nodeType === Dom.NodeType.TEXT_NODE');
function visit519_918_1(result) {
  _$jscoverage['/editor/range.js'].branchData['918'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['917'][2].init(775, 53, 'startContainer[0].nodeType === Dom.NodeType.TEXT_NODE');
function visit518_917_2(result) {
  _$jscoverage['/editor/range.js'].branchData['917'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['917'][1].init(775, 196, 'startContainer[0].nodeType === Dom.NodeType.TEXT_NODE && (previous = startContainer.prev(undefined, 1)) && previous[0].nodeType === Dom.NodeType.TEXT_NODE');
function visit517_917_1(result) {
  _$jscoverage['/editor/range.js'].branchData['917'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['909'][3].init(18, 60, 'child[0].previousSibling.nodeType === Dom.NodeType.TEXT_NODE');
function visit516_909_3(result) {
  _$jscoverage['/editor/range.js'].branchData['909'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['909'][2].init(310, 15, 'startOffset > 0');
function visit515_909_2(result) {
  _$jscoverage['/editor/range.js'].branchData['909'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['909'][1].init(71, 79, 'startOffset > 0 && child[0].previousSibling.nodeType === Dom.NodeType.TEXT_NODE');
function visit514_909_1(result) {
  _$jscoverage['/editor/range.js'].branchData['909'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['908'][4].init(234, 44, 'child[0].nodeType === Dom.NodeType.TEXT_NODE');
function visit513_908_4(result) {
  _$jscoverage['/editor/range.js'].branchData['908'][4].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['908'][3].init(234, 151, 'child[0].nodeType === Dom.NodeType.TEXT_NODE && startOffset > 0 && child[0].previousSibling.nodeType === Dom.NodeType.TEXT_NODE');
function visit512_908_3(result) {
  _$jscoverage['/editor/range.js'].branchData['908'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['908'][2].init(222, 163, 'child[0] && child[0].nodeType === Dom.NodeType.TEXT_NODE && startOffset > 0 && child[0].previousSibling.nodeType === Dom.NodeType.TEXT_NODE');
function visit511_908_2(result) {
  _$jscoverage['/editor/range.js'].branchData['908'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['908'][1].init(213, 172, 'child && child[0] && child[0].nodeType === Dom.NodeType.TEXT_NODE && startOffset > 0 && child[0].previousSibling.nodeType === Dom.NodeType.TEXT_NODE');
function visit510_908_1(result) {
  _$jscoverage['/editor/range.js'].branchData['908'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['903'][1].init(133, 56, 'startContainer[0].nodeType === Dom.NodeType.ELEMENT_NODE');
function visit509_903_1(result) {
  _$jscoverage['/editor/range.js'].branchData['903'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['900'][1].init(621, 10, 'normalized');
function visit508_900_1(result) {
  _$jscoverage['/editor/range.js'].branchData['900'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['893'][1].init(453, 32, '!startContainer || !endContainer');
function visit507_893_1(result) {
  _$jscoverage['/editor/range.js'].branchData['893'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['873'][1].init(3638, 20, 'moveStart || moveEnd');
function visit506_873_1(result) {
  _$jscoverage['/editor/range.js'].branchData['873'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['868'][1].init(164, 7, 'textEnd');
function visit505_868_1(result) {
  _$jscoverage['/editor/range.js'].branchData['868'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['867'][1].init(78, 27, 'mode === KER.SHRINK_ELEMENT');
function visit504_867_1(result) {
  _$jscoverage['/editor/range.js'].branchData['867'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['865'][1].init(3274, 7, 'moveEnd');
function visit503_865_1(result) {
  _$jscoverage['/editor/range.js'].branchData['865'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['860'][1].init(125, 9, 'textStart');
function visit502_860_1(result) {
  _$jscoverage['/editor/range.js'].branchData['860'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['859'][1].init(44, 27, 'mode === KER.SHRINK_ELEMENT');
function visit501_859_1(result) {
  _$jscoverage['/editor/range.js'].branchData['859'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['858'][1].init(2940, 9, 'moveStart');
function visit500_858_1(result) {
  _$jscoverage['/editor/range.js'].branchData['858'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['850'][2].init(556, 43, 'node.nodeType === Dom.NodeType.ELEMENT_NODE');
function visit499_850_2(result) {
  _$jscoverage['/editor/range.js'].branchData['850'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['850'][1].init(542, 57, '!movingOut && node.nodeType === Dom.NodeType.ELEMENT_NODE');
function visit498_850_1(result) {
  _$jscoverage['/editor/range.js'].branchData['850'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['847'][2].init(419, 23, 'node === currentElement');
function visit497_847_2(result) {
  _$jscoverage['/editor/range.js'].branchData['847'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['847'][1].init(406, 36, 'movingOut && node === currentElement');
function visit496_847_1(result) {
  _$jscoverage['/editor/range.js'].branchData['847'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['843'][1].init(58, 40, 'node.nodeType === Dom.NodeType.TEXT_NODE');
function visit495_843_1(result) {
  _$jscoverage['/editor/range.js'].branchData['843'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['842'][2].init(127, 27, 'mode === KER.SHRINK_ELEMENT');
function visit494_842_2(result) {
  _$jscoverage['/editor/range.js'].branchData['842'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['842'][1].init(127, 99, 'mode === KER.SHRINK_ELEMENT && node.nodeType === Dom.NodeType.TEXT_NODE');
function visit493_842_1(result) {
  _$jscoverage['/editor/range.js'].branchData['842'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['836'][2].init(52, 27, 'mode === KER.SHRINK_ELEMENT');
function visit492_836_2(result) {
  _$jscoverage['/editor/range.js'].branchData['836'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['836'][1].init(32, 130, 'node.nodeType === (mode === KER.SHRINK_ELEMENT ? Dom.NodeType.ELEMENT_NODE : Dom.NodeType.TEXT_NODE)');
function visit491_836_1(result) {
  _$jscoverage['/editor/range.js'].branchData['836'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['831'][1].init(1773, 20, 'moveStart || moveEnd');
function visit490_831_1(result) {
  _$jscoverage['/editor/range.js'].branchData['831'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['823'][1].init(135, 45, 'endOffset >= endContainer[0].nodeValue.length');
function visit489_823_1(result) {
  _$jscoverage['/editor/range.js'].branchData['823'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['821'][1].init(25, 10, '!endOffset');
function visit488_821_1(result) {
  _$jscoverage['/editor/range.js'].branchData['821'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['820'][1].init(35, 51, 'endContainer[0].nodeType === Dom.NodeType.TEXT_NODE');
function visit487_820_1(result) {
  _$jscoverage['/editor/range.js'].branchData['820'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['819'][1].init(1243, 87, 'endContainer && endContainer[0].nodeType === Dom.NodeType.TEXT_NODE');
function visit486_819_1(result) {
  _$jscoverage['/editor/range.js'].branchData['819'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['809'][1].init(141, 49, 'startOffset >= startContainer[0].nodeValue.length');
function visit485_809_1(result) {
  _$jscoverage['/editor/range.js'].branchData['809'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['807'][1].init(25, 12, '!startOffset');
function visit484_807_1(result) {
  _$jscoverage['/editor/range.js'].branchData['807'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['806'][1].init(37, 53, 'startContainer[0].nodeType === Dom.NodeType.TEXT_NODE');
function visit483_806_1(result) {
  _$jscoverage['/editor/range.js'].branchData['806'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['805'][1].init(531, 91, 'startContainer && startContainer[0].nodeType === Dom.NodeType.TEXT_NODE');
function visit482_805_1(result) {
  _$jscoverage['/editor/range.js'].branchData['805'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['792'][1].init(24, 23, 'mode || KER.SHRINK_TEXT');
function visit481_792_1(result) {
  _$jscoverage['/editor/range.js'].branchData['792'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['791'][1].init(97, 15, '!self.collapsed');
function visit480_791_1(result) {
  _$jscoverage['/editor/range.js'].branchData['791'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['780'][1].init(858, 24, 'node && node.equals(pre)');
function visit479_780_1(result) {
  _$jscoverage['/editor/range.js'].branchData['780'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['769'][1].init(24, 46, 'isNotWhitespaces(node) && isNotBookmarks(node)');
function visit478_769_1(result) {
  _$jscoverage['/editor/range.js'].branchData['769'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['761'][1].init(87, 66, 'walkerRange.endContainer[0].nodeType !== Dom.NodeType.ELEMENT_NODE');
function visit477_761_1(result) {
  _$jscoverage['/editor/range.js'].branchData['761'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['760'][2].init(188, 68, 'walkerRange.startContainer[0].nodeType !== Dom.NodeType.ELEMENT_NODE');
function visit476_760_2(result) {
  _$jscoverage['/editor/range.js'].branchData['760'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['760'][1].init(188, 154, 'walkerRange.startContainer[0].nodeType !== Dom.NodeType.ELEMENT_NODE || walkerRange.endContainer[0].nodeType !== Dom.NodeType.ELEMENT_NODE');
function visit475_760_1(result) {
  _$jscoverage['/editor/range.js'].branchData['760'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['719'][1].init(46, 7, 'toStart');
function visit474_719_1(result) {
  _$jscoverage['/editor/range.js'].branchData['719'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['674'][1].init(54, 43, 'node[0].nodeType === Dom.NodeType.TEXT_NODE');
function visit473_674_1(result) {
  _$jscoverage['/editor/range.js'].branchData['674'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['643'][1].init(54, 43, 'node[0].nodeType === Dom.NodeType.TEXT_NODE');
function visit472_643_1(result) {
  _$jscoverage['/editor/range.js'].branchData['643'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['622'][1].init(684, 20, '!self.startContainer');
function visit471_622_1(result) {
  _$jscoverage['/editor/range.js'].branchData['622'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['614'][2].init(391, 49, 'endNode[0].nodeType === Dom.NodeType.ELEMENT_NODE');
function visit470_614_2(result) {
  _$jscoverage['/editor/range.js'].branchData['614'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['614'][1].init(391, 80, 'endNode[0].nodeType === Dom.NodeType.ELEMENT_NODE && EMPTY[endNode.nodeName()]');
function visit469_614_1(result) {
  _$jscoverage['/editor/range.js'].branchData['614'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['591'][1].init(701, 18, '!self.endContainer');
function visit468_591_1(result) {
  _$jscoverage['/editor/range.js'].branchData['591'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['583'][2].init(392, 51, 'startNode[0].nodeType === Dom.NodeType.ELEMENT_NODE');
function visit467_583_2(result) {
  _$jscoverage['/editor/range.js'].branchData['583'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['583'][1].init(392, 84, 'startNode[0].nodeType === Dom.NodeType.ELEMENT_NODE && EMPTY[startNode.nodeName()]');
function visit466_583_1(result) {
  _$jscoverage['/editor/range.js'].branchData['583'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['562'][2].init(362, 29, 'endNode.nodeName() === \'span\'');
function visit465_562_2(result) {
  _$jscoverage['/editor/range.js'].branchData['562'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['562'][1].init(26, 77, 'endNode.nodeName() === \'span\' && endNode.attr(\'_ke_bookmark\')');
function visit464_562_1(result) {
  _$jscoverage['/editor/range.js'].branchData['562'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['561'][1].init(333, 104, 'endNode && endNode.nodeName() === \'span\' && endNode.attr(\'_ke_bookmark\')');
function visit463_561_1(result) {
  _$jscoverage['/editor/range.js'].branchData['561'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['557'][2].init(172, 31, 'startNode.nodeName() === \'span\'');
function visit462_557_2(result) {
  _$jscoverage['/editor/range.js'].branchData['557'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['557'][1].init(28, 81, 'startNode.nodeName() === \'span\' && startNode.attr(\'_ke_bookmark\')');
function visit461_557_1(result) {
  _$jscoverage['/editor/range.js'].branchData['557'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['556'][1].init(141, 110, 'startNode && startNode.nodeName() === \'span\' && startNode.attr(\'_ke_bookmark\')');
function visit460_556_1(result) {
  _$jscoverage['/editor/range.js'].branchData['556'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['513'][1].init(110, 39, 'offset >= container[0].nodeValue.length');
function visit459_513_1(result) {
  _$jscoverage['/editor/range.js'].branchData['513'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['511'][1].init(21, 7, '!offset');
function visit458_511_1(result) {
  _$jscoverage['/editor/range.js'].branchData['511'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['510'][1].init(528, 51, 'container[0].nodeType !== Dom.NodeType.ELEMENT_NODE');
function visit457_510_1(result) {
  _$jscoverage['/editor/range.js'].branchData['510'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['502'][1].init(112, 39, 'offset >= container[0].nodeValue.length');
function visit456_502_1(result) {
  _$jscoverage['/editor/range.js'].branchData['502'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['500'][1].init(21, 7, '!offset');
function visit455_500_1(result) {
  _$jscoverage['/editor/range.js'].branchData['500'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['499'][1].init(139, 51, 'container[0].nodeType !== Dom.NodeType.ELEMENT_NODE');
function visit454_499_1(result) {
  _$jscoverage['/editor/range.js'].branchData['499'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['484'][1].init(277, 40, 'endContainer.id || endContainer.nodeName');
function visit453_484_1(result) {
  _$jscoverage['/editor/range.js'].branchData['484'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['483'][1].init(184, 44, 'startContainer.id || startContainer.nodeName');
function visit452_483_1(result) {
  _$jscoverage['/editor/range.js'].branchData['483'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['454'][1].init(66, 35, 'self.startOffset === self.endOffset');
function visit451_454_1(result) {
  _$jscoverage['/editor/range.js'].branchData['454'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['453'][2].init(109, 47, 'self.startContainer[0] === self.endContainer[0]');
function visit450_453_2(result) {
  _$jscoverage['/editor/range.js'].branchData['453'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['453'][1].init(36, 102, 'self.startContainer[0] === self.endContainer[0] && self.startOffset === self.endOffset');
function visit449_453_1(result) {
  _$jscoverage['/editor/range.js'].branchData['453'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['452'][1].init(38, 139, 'self.endContainer && self.startContainer[0] === self.endContainer[0] && self.startOffset === self.endOffset');
function visit448_452_1(result) {
  _$jscoverage['/editor/range.js'].branchData['452'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['451'][1].init(-1, 178, 'self.startContainer && self.endContainer && self.startContainer[0] === self.endContainer[0] && self.startOffset === self.endOffset');
function visit447_451_1(result) {
  _$jscoverage['/editor/range.js'].branchData['451'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['442'][1].init(10746, 13, 'removeEndNode');
function visit446_442_1(result) {
  _$jscoverage['/editor/range.js'].branchData['442'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['438'][1].init(10672, 15, 'removeStartNode');
function visit445_438_1(result) {
  _$jscoverage['/editor/range.js'].branchData['438'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['423'][1].init(200, 120, 'removeStartNode && (topStart._4eSameLevel(startNode))');
function visit444_423_1(result) {
  _$jscoverage['/editor/range.js'].branchData['423'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['416'][1].init(-1, 66, '!startNode._4eSameLevel(topStart) || !endNode._4eSameLevel(topEnd)');
function visit443_416_1(result) {
  _$jscoverage['/editor/range.js'].branchData['416'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['414'][2].init(272, 148, 'topEnd && (!startNode._4eSameLevel(topStart) || !endNode._4eSameLevel(topEnd))');
function visit442_414_2(result) {
  _$jscoverage['/editor/range.js'].branchData['414'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['414'][1].init(20, 160, 'topStart && topEnd && (!startNode._4eSameLevel(topStart) || !endNode._4eSameLevel(topEnd))');
function visit441_414_1(result) {
  _$jscoverage['/editor/range.js'].branchData['414'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['401'][1].init(50, 63, 'endTextNode.previousSibling.nodeType === Dom.NodeType.TEXT_NODE');
function visit440_401_1(result) {
  _$jscoverage['/editor/range.js'].branchData['401'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['400'][1].init(70, 114, 'endTextNode.previousSibling && endTextNode.previousSibling.nodeType === Dom.NodeType.TEXT_NODE');
function visit439_400_1(result) {
  _$jscoverage['/editor/range.js'].branchData['400'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['399'][2].init(67, 47, 'endTextNode.nodeType === Dom.NodeType.TEXT_NODE');
function visit438_399_2(result) {
  _$jscoverage['/editor/range.js'].branchData['399'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['399'][1].init(67, 185, 'endTextNode.nodeType === Dom.NodeType.TEXT_NODE && endTextNode.previousSibling && endTextNode.previousSibling.nodeType === Dom.NodeType.TEXT_NODE');
function visit437_399_1(result) {
  _$jscoverage['/editor/range.js'].branchData['399'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['397'][1].init(631, 11, 'hasSplitEnd');
function visit436_397_1(result) {
  _$jscoverage['/editor/range.js'].branchData['397'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['391'][1].init(113, 61, 'startTextNode.nextSibling.nodeType === Dom.NodeType.TEXT_NODE');
function visit435_391_1(result) {
  _$jscoverage['/editor/range.js'].branchData['391'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['389'][3].init(124, 175, 'startTextNode.nextSibling && startTextNode.nextSibling.nodeType === Dom.NodeType.TEXT_NODE');
function visit434_389_3(result) {
  _$jscoverage['/editor/range.js'].branchData['389'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['389'][2].init(71, 49, 'startTextNode.nodeType === Dom.NodeType.TEXT_NODE');
function visit433_389_2(result) {
  _$jscoverage['/editor/range.js'].branchData['389'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['389'][1].init(71, 228, 'startTextNode.nodeType === Dom.NodeType.TEXT_NODE && startTextNode.nextSibling && startTextNode.nextSibling.nodeType === Dom.NodeType.TEXT_NODE');
function visit432_389_1(result) {
  _$jscoverage['/editor/range.js'].branchData['389'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['387'][1].init(104, 13, 'hasSplitStart');
function visit431_387_1(result) {
  _$jscoverage['/editor/range.js'].branchData['387'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['383'][1].init(8533, 12, 'action === 2');
function visit430_383_1(result) {
  _$jscoverage['/editor/range.js'].branchData['383'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['378'][1].init(1653, 10, 'levelClone');
function visit429_378_1(result) {
  _$jscoverage['/editor/range.js'].branchData['378'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['368'][1].init(237, 12, 'action === 1');
function visit428_368_1(result) {
  _$jscoverage['/editor/range.js'].branchData['368'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['360'][1].init(189, 12, 'action === 2');
function visit427_360_1(result) {
  _$jscoverage['/editor/range.js'].branchData['360'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['350'][1].init(20, 137, '!startParents[k] || !levelStartNode._4eSameLevel(startParents[k])');
function visit426_350_1(result) {
  _$jscoverage['/editor/range.js'].branchData['350'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['340'][2].init(128, 10, 'action > 0');
function visit425_340_2(result) {
  _$jscoverage['/editor/range.js'].branchData['340'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['340'][1].init(128, 45, 'action > 0 && !levelStartNode.equals(endNode)');
function visit424_340_1(result) {
  _$jscoverage['/editor/range.js'].branchData['340'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['336'][1].init(6743, 21, 'k < endParents.length');
function visit423_336_1(result) {
  _$jscoverage['/editor/range.js'].branchData['336'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['327'][1].init(2184, 10, 'levelClone');
function visit422_327_1(result) {
  _$jscoverage['/editor/range.js'].branchData['327'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['318'][1].init(644, 12, 'action === 1');
function visit421_318_1(result) {
  _$jscoverage['/editor/range.js'].branchData['318'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['308'][1].init(155, 48, 'UN_REMOVABLE[currentNode.nodeName.toLowerCase()]');
function visit420_308_1(result) {
  _$jscoverage['/editor/range.js'].branchData['308'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['301'][1].init(437, 12, 'action === 2');
function visit419_301_1(result) {
  _$jscoverage['/editor/range.js'].branchData['301'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['293'][3].init(193, 26, 'domEndNode === currentNode');
function visit418_293_3(result) {
  _$jscoverage['/editor/range.js'].branchData['293'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['293'][2].init(160, 29, 'domEndParentJ === currentNode');
function visit417_293_2(result) {
  _$jscoverage['/editor/range.js'].branchData['293'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['293'][1].init(160, 59, 'domEndParentJ === currentNode || domEndNode === currentNode');
function visit416_293_1(result) {
  _$jscoverage['/editor/range.js'].branchData['293'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['288'][1].init(106, 27, 'endParentJ && endParentJ[0]');
function visit415_288_1(result) {
  _$jscoverage['/editor/range.js'].branchData['288'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['276'][2].init(128, 10, 'action > 0');
function visit414_276_2(result) {
  _$jscoverage['/editor/range.js'].branchData['276'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['276'][1].init(128, 47, 'action > 0 && !levelStartNode.equals(startNode)');
function visit413_276_1(result) {
  _$jscoverage['/editor/range.js'].branchData['276'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['272'][1].init(4308, 23, 'j < startParents.length');
function visit412_272_1(result) {
  _$jscoverage['/editor/range.js'].branchData['272'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['259'][1].init(340, 24, '!topStart.equals(topEnd)');
function visit411_259_1(result) {
  _$jscoverage['/editor/range.js'].branchData['259'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['251'][1].init(3603, 23, 'i < startParents.length');
function visit410_251_1(result) {
  _$jscoverage['/editor/range.js'].branchData['251'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['222'][1].init(608, 45, 'startOffset >= startNode[0].childNodes.length');
function visit409_222_1(result) {
  _$jscoverage['/editor/range.js'].branchData['222'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['215'][1].init(319, 12, '!startOffset');
function visit408_215_1(result) {
  _$jscoverage['/editor/range.js'].branchData['215'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['206'][1].init(1924, 48, 'startNode[0].nodeType === Dom.NodeType.TEXT_NODE');
function visit407_206_1(result) {
  _$jscoverage['/editor/range.js'].branchData['206'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['190'][1].init(82, 41, 'endOffset >= endNode[0].childNodes.length');
function visit406_190_1(result) {
  _$jscoverage['/editor/range.js'].branchData['190'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['188'][1].init(150, 32, 'endNode[0].childNodes.length > 0');
function visit405_188_1(result) {
  _$jscoverage['/editor/range.js'].branchData['188'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['182'][1].init(862, 46, 'endNode[0].nodeType === Dom.NodeType.TEXT_NODE');
function visit404_182_1(result) {
  _$jscoverage['/editor/range.js'].branchData['182'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['169'][1].init(466, 14, 'self.collapsed');
function visit403_169_1(result) {
  _$jscoverage['/editor/range.js'].branchData['169'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['165'][1].init(377, 10, 'action > 0');
function visit402_165_1(result) {
  _$jscoverage['/editor/range.js'].branchData['165'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['134'][4].init(176, 17, 'nodeName === \'br\'');
function visit401_134_4(result) {
  _$jscoverage['/editor/range.js'].branchData['134'][4].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['134'][3].init(176, 27, 'nodeName === \'br\' && !hadBr');
function visit400_134_3(result) {
  _$jscoverage['/editor/range.js'].branchData['134'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['134'][2].init(166, 37, '!UA.ie && nodeName === \'br\' && !hadBr');
function visit399_134_2(result) {
  _$jscoverage['/editor/range.js'].branchData['134'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['134'][1].init(154, 49, '!isStart && !UA.ie && nodeName === \'br\' && !hadBr');
function visit398_134_1(result) {
  _$jscoverage['/editor/range.js'].branchData['134'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['131'][1].init(194, 35, '!inlineChildReqElements[nodeName]');
function visit397_131_1(result) {
  _$jscoverage['/editor/range.js'].branchData['131'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['127'][1].init(391, 43, 'node.nodeType === Dom.NodeType.ELEMENT_NODE');
function visit396_127_1(result) {
  _$jscoverage['/editor/range.js'].branchData['127'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['124'][1].init(98, 29, 'S.trim(node.nodeValue).length');
function visit395_124_1(result) {
  _$jscoverage['/editor/range.js'].branchData['124'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['122'][1].init(141, 40, 'node.nodeType === Dom.NodeType.TEXT_NODE');
function visit394_122_1(result) {
  _$jscoverage['/editor/range.js'].branchData['122'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['118'][1].init(61, 16, 'isBookmark(node)');
function visit393_118_1(result) {
  _$jscoverage['/editor/range.js'].branchData['118'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['111'][1].init(77, 40, '!isWhitespace(node) && !isBookmark(node)');
function visit392_111_1(result) {
  _$jscoverage['/editor/range.js'].branchData['111'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['106'][2].init(483, 8, 'c2 || c3');
function visit391_106_2(result) {
  _$jscoverage['/editor/range.js'].branchData['106'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['106'][1].init(477, 14, 'c1 || c2 || c3');
function visit390_106_1(result) {
  _$jscoverage['/editor/range.js'].branchData['106'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['103'][2].init(154, 40, 'node.nodeType === Dom.NodeType.TEXT_NODE');
function visit389_103_2(result) {
  _$jscoverage['/editor/range.js'].branchData['103'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['103'][1].init(154, 67, 'node.nodeType === Dom.NodeType.TEXT_NODE && !S.trim(node.nodeValue)');
function visit388_103_1(result) {
  _$jscoverage['/editor/range.js'].branchData['103'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['100'][2].init(150, 40, 'node.nodeType !== Dom.NodeType.TEXT_NODE');
function visit387_100_2(result) {
  _$jscoverage['/editor/range.js'].branchData['100'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['100'][1].init(150, 98, 'node.nodeType !== Dom.NodeType.TEXT_NODE && Dom.nodeName(node) in dtd.$removeEmpty');
function visit386_100_1(result) {
  _$jscoverage['/editor/range.js'].branchData['100'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].lineData[10]++;
KISSY.add(function(S, require) {
  _$jscoverage['/editor/range.js'].functionData[0]++;
  _$jscoverage['/editor/range.js'].lineData[11]++;
  require('./dom');
  _$jscoverage['/editor/range.js'].lineData[12]++;
  var Node = require('node');
  _$jscoverage['/editor/range.js'].lineData[13]++;
  var Utils = require('./utils');
  _$jscoverage['/editor/range.js'].lineData[14]++;
  var Walker = require('./walker');
  _$jscoverage['/editor/range.js'].lineData[15]++;
  var Editor = require('./base');
  _$jscoverage['/editor/range.js'].lineData[16]++;
  var ElementPath = require('./elementPath');
  _$jscoverage['/editor/range.js'].lineData[21]++;
  Editor.RangeType = {
  POSITION_AFTER_START: 1, 
  POSITION_BEFORE_END: 2, 
  POSITION_BEFORE_START: 3, 
  POSITION_AFTER_END: 4, 
  ENLARGE_ELEMENT: 1, 
  ENLARGE_BLOCK_CONTENTS: 2, 
  ENLARGE_LIST_ITEM_CONTENTS: 3, 
  START: 1, 
  END: 2, 
  SHRINK_ELEMENT: 1, 
  SHRINK_TEXT: 2};
  _$jscoverage['/editor/range.js'].lineData[35]++;
  var TRUE = true, FALSE = false, NULL = null, KER = Editor.RangeType, KEP = Editor.PositionType, Dom = S.DOM, UA = S.UA, dtd = Editor.XHTML_DTD, $ = Node.all, UN_REMOVABLE = {
  'td': 1}, EMPTY = {
  'area': 1, 
  'base': 1, 
  'br': 1, 
  'col': 1, 
  'hr': 1, 
  'img': 1, 
  'input': 1, 
  'link': 1, 
  'meta': 1, 
  'param': 1};
  _$jscoverage['/editor/range.js'].lineData[60]++;
  var isWhitespace = new Walker.whitespaces(), isBookmark = new Walker.bookmark(), isNotWhitespaces = Walker.whitespaces(TRUE), isNotBookmarks = Walker.bookmark(false, true);
  _$jscoverage['/editor/range.js'].lineData[65]++;
  var inlineChildReqElements = {
  'abbr': 1, 
  'acronym': 1, 
  'b': 1, 
  'bdo': 1, 
  'big': 1, 
  'cite': 1, 
  'code': 1, 
  'del': 1, 
  'dfn': 1, 
  'em': 1, 
  'font': 1, 
  'i': 1, 
  'ins': 1, 
  'label': 1, 
  'kbd': 1, 
  'q': 1, 
  'samp': 1, 
  'small': 1, 
  'span': 1, 
  'strike': 1, 
  'strong': 1, 
  'sub': 1, 
  'sup': 1, 
  'tt': 1, 
  'u': 1, 
  'var': 1};
  _$jscoverage['/editor/range.js'].lineData[96]++;
  function elementBoundaryEval(node) {
    _$jscoverage['/editor/range.js'].functionData[1]++;
    _$jscoverage['/editor/range.js'].lineData[100]++;
    var c1 = visit386_100_1(visit387_100_2(node.nodeType !== Dom.NodeType.TEXT_NODE) && Dom.nodeName(node) in dtd.$removeEmpty), c2 = visit388_103_1(visit389_103_2(node.nodeType === Dom.NodeType.TEXT_NODE) && !S.trim(node.nodeValue)), c3 = !!node.parentNode.getAttribute('_ke_bookmark');
    _$jscoverage['/editor/range.js'].lineData[106]++;
    return visit390_106_1(c1 || visit391_106_2(c2 || c3));
  }
  _$jscoverage['/editor/range.js'].lineData[109]++;
  function nonWhitespaceOrIsBookmark(node) {
    _$jscoverage['/editor/range.js'].functionData[2]++;
    _$jscoverage['/editor/range.js'].lineData[111]++;
    return visit392_111_1(!isWhitespace(node) && !isBookmark(node));
  }
  _$jscoverage['/editor/range.js'].lineData[114]++;
  function getCheckStartEndBlockEvalFunction(isStart) {
    _$jscoverage['/editor/range.js'].functionData[3]++;
    _$jscoverage['/editor/range.js'].lineData[115]++;
    var hadBr = FALSE;
    _$jscoverage['/editor/range.js'].lineData[116]++;
    return function(node) {
  _$jscoverage['/editor/range.js'].functionData[4]++;
  _$jscoverage['/editor/range.js'].lineData[118]++;
  if (visit393_118_1(isBookmark(node))) {
    _$jscoverage['/editor/range.js'].lineData[119]++;
    return TRUE;
  }
  _$jscoverage['/editor/range.js'].lineData[122]++;
  if (visit394_122_1(node.nodeType === Dom.NodeType.TEXT_NODE)) {
    _$jscoverage['/editor/range.js'].lineData[124]++;
    if (visit395_124_1(S.trim(node.nodeValue).length)) {
      _$jscoverage['/editor/range.js'].lineData[125]++;
      return FALSE;
    }
  } else {
    _$jscoverage['/editor/range.js'].lineData[127]++;
    if (visit396_127_1(node.nodeType === Dom.NodeType.ELEMENT_NODE)) {
      _$jscoverage['/editor/range.js'].lineData[128]++;
      var nodeName = Dom.nodeName(node);
      _$jscoverage['/editor/range.js'].lineData[131]++;
      if (visit397_131_1(!inlineChildReqElements[nodeName])) {
        _$jscoverage['/editor/range.js'].lineData[134]++;
        if (visit398_134_1(!isStart && visit399_134_2(!UA.ie && visit400_134_3(visit401_134_4(nodeName === 'br') && !hadBr)))) {
          _$jscoverage['/editor/range.js'].lineData[135]++;
          hadBr = TRUE;
        } else {
          _$jscoverage['/editor/range.js'].lineData[137]++;
          return FALSE;
        }
      }
    }
  }
  _$jscoverage['/editor/range.js'].lineData[141]++;
  return TRUE;
};
  }
  _$jscoverage['/editor/range.js'].lineData[152]++;
  function execContentsAction(self, action) {
    _$jscoverage['/editor/range.js'].functionData[5]++;
    _$jscoverage['/editor/range.js'].lineData[153]++;
    var startNode = self.startContainer, endNode = self.endContainer, startOffset = self.startOffset, endOffset = self.endOffset, removeStartNode, hasSplitStart = FALSE, hasSplitEnd = FALSE, t, docFrag, doc = self.document, removeEndNode;
    _$jscoverage['/editor/range.js'].lineData[165]++;
    if (visit402_165_1(action > 0)) {
      _$jscoverage['/editor/range.js'].lineData[166]++;
      docFrag = doc.createDocumentFragment();
    }
    _$jscoverage['/editor/range.js'].lineData[169]++;
    if (visit403_169_1(self.collapsed)) {
      _$jscoverage['/editor/range.js'].lineData[170]++;
      return docFrag;
    }
    _$jscoverage['/editor/range.js'].lineData[174]++;
    self.optimizeBookmark();
    _$jscoverage['/editor/range.js'].lineData[182]++;
    if (visit404_182_1(endNode[0].nodeType === Dom.NodeType.TEXT_NODE)) {
      _$jscoverage['/editor/range.js'].lineData[183]++;
      hasSplitEnd = TRUE;
      _$jscoverage['/editor/range.js'].lineData[184]++;
      endNode = endNode._4eSplitText(endOffset);
    } else {
      _$jscoverage['/editor/range.js'].lineData[188]++;
      if (visit405_188_1(endNode[0].childNodes.length > 0)) {
        _$jscoverage['/editor/range.js'].lineData[190]++;
        if (visit406_190_1(endOffset >= endNode[0].childNodes.length)) {
          _$jscoverage['/editor/range.js'].lineData[192]++;
          endNode = new Node(endNode[0].appendChild(doc.createTextNode('')));
          _$jscoverage['/editor/range.js'].lineData[195]++;
          removeEndNode = TRUE;
        } else {
          _$jscoverage['/editor/range.js'].lineData[197]++;
          endNode = new Node(endNode[0].childNodes[endOffset]);
        }
      }
    }
    _$jscoverage['/editor/range.js'].lineData[206]++;
    if (visit407_206_1(startNode[0].nodeType === Dom.NodeType.TEXT_NODE)) {
      _$jscoverage['/editor/range.js'].lineData[207]++;
      hasSplitStart = TRUE;
      _$jscoverage['/editor/range.js'].lineData[208]++;
      startNode._4eSplitText(startOffset);
    } else {
      _$jscoverage['/editor/range.js'].lineData[215]++;
      if (visit408_215_1(!startOffset)) {
        _$jscoverage['/editor/range.js'].lineData[217]++;
        t = new Node(doc.createTextNode(''));
        _$jscoverage['/editor/range.js'].lineData[218]++;
        startNode.prepend(t);
        _$jscoverage['/editor/range.js'].lineData[219]++;
        startNode = t;
        _$jscoverage['/editor/range.js'].lineData[220]++;
        removeStartNode = TRUE;
      } else {
        _$jscoverage['/editor/range.js'].lineData[222]++;
        if (visit409_222_1(startOffset >= startNode[0].childNodes.length)) {
          _$jscoverage['/editor/range.js'].lineData[224]++;
          startNode = new Node(startNode[0].appendChild(doc.createTextNode('')));
          _$jscoverage['/editor/range.js'].lineData[226]++;
          removeStartNode = TRUE;
        } else {
          _$jscoverage['/editor/range.js'].lineData[228]++;
          startNode = new Node(startNode[0].childNodes[startOffset].previousSibling);
        }
      }
    }
    _$jscoverage['/editor/range.js'].lineData[236]++;
    var startParents = startNode._4eParents(), endParents = endNode._4eParents();
    _$jscoverage['/editor/range.js'].lineData[239]++;
    startParents.each(function(n, i) {
  _$jscoverage['/editor/range.js'].functionData[6]++;
  _$jscoverage['/editor/range.js'].lineData[240]++;
  startParents[i] = n;
});
    _$jscoverage['/editor/range.js'].lineData[243]++;
    endParents.each(function(n, i) {
  _$jscoverage['/editor/range.js'].functionData[7]++;
  _$jscoverage['/editor/range.js'].lineData[244]++;
  endParents[i] = n;
});
    _$jscoverage['/editor/range.js'].lineData[249]++;
    var i, topStart, topEnd;
    _$jscoverage['/editor/range.js'].lineData[251]++;
    for (i = 0; visit410_251_1(i < startParents.length); i++) {
      _$jscoverage['/editor/range.js'].lineData[252]++;
      topStart = startParents[i];
      _$jscoverage['/editor/range.js'].lineData[253]++;
      topEnd = endParents[i];
      _$jscoverage['/editor/range.js'].lineData[259]++;
      if (visit411_259_1(!topStart.equals(topEnd))) {
        _$jscoverage['/editor/range.js'].lineData[260]++;
        break;
      }
    }
    _$jscoverage['/editor/range.js'].lineData[264]++;
    var clone = docFrag, levelStartNode, levelClone, currentNode, currentSibling;
    _$jscoverage['/editor/range.js'].lineData[272]++;
    for (var j = i; visit412_272_1(j < startParents.length); j++) {
      _$jscoverage['/editor/range.js'].lineData[273]++;
      levelStartNode = startParents[j];
      _$jscoverage['/editor/range.js'].lineData[276]++;
      if (visit413_276_1(visit414_276_2(action > 0) && !levelStartNode.equals(startNode))) {
        _$jscoverage['/editor/range.js'].lineData[278]++;
        levelClone = clone.appendChild(levelStartNode.clone()[0]);
      } else {
        _$jscoverage['/editor/range.js'].lineData[280]++;
        levelClone = null;
      }
      _$jscoverage['/editor/range.js'].lineData[284]++;
      currentNode = levelStartNode[0].nextSibling;
      _$jscoverage['/editor/range.js'].lineData[286]++;
      var endParentJ = endParents[j], domEndNode = endNode[0], domEndParentJ = visit415_288_1(endParentJ && endParentJ[0]);
      _$jscoverage['/editor/range.js'].lineData[290]++;
      while (currentNode) {
        _$jscoverage['/editor/range.js'].lineData[293]++;
        if (visit416_293_1(visit417_293_2(domEndParentJ === currentNode) || visit418_293_3(domEndNode === currentNode))) {
          _$jscoverage['/editor/range.js'].lineData[294]++;
          break;
        }
        _$jscoverage['/editor/range.js'].lineData[298]++;
        currentSibling = currentNode.nextSibling;
        _$jscoverage['/editor/range.js'].lineData[301]++;
        if (visit419_301_1(action === 2)) {
          _$jscoverage['/editor/range.js'].lineData[303]++;
          clone.appendChild(currentNode.cloneNode(TRUE));
        } else {
          _$jscoverage['/editor/range.js'].lineData[308]++;
          if (visit420_308_1(UN_REMOVABLE[currentNode.nodeName.toLowerCase()])) {
            _$jscoverage['/editor/range.js'].lineData[309]++;
            var tmp = currentNode.cloneNode(TRUE);
            _$jscoverage['/editor/range.js'].lineData[310]++;
            currentNode.innerHTML = '';
            _$jscoverage['/editor/range.js'].lineData[311]++;
            currentNode = tmp;
          } else {
            _$jscoverage['/editor/range.js'].lineData[314]++;
            Dom._4eRemove(currentNode);
          }
          _$jscoverage['/editor/range.js'].lineData[318]++;
          if (visit421_318_1(action === 1)) {
            _$jscoverage['/editor/range.js'].lineData[320]++;
            clone.appendChild(currentNode);
          }
        }
        _$jscoverage['/editor/range.js'].lineData[324]++;
        currentNode = currentSibling;
      }
      _$jscoverage['/editor/range.js'].lineData[327]++;
      if (visit422_327_1(levelClone)) {
        _$jscoverage['/editor/range.js'].lineData[328]++;
        clone = levelClone;
      }
    }
    _$jscoverage['/editor/range.js'].lineData[332]++;
    clone = docFrag;
    _$jscoverage['/editor/range.js'].lineData[336]++;
    for (var k = i; visit423_336_1(k < endParents.length); k++) {
      _$jscoverage['/editor/range.js'].lineData[337]++;
      levelStartNode = endParents[k];
      _$jscoverage['/editor/range.js'].lineData[340]++;
      if (visit424_340_1(visit425_340_2(action > 0) && !levelStartNode.equals(endNode))) {
        _$jscoverage['/editor/range.js'].lineData[343]++;
        levelClone = clone.appendChild(levelStartNode.clone()[0]);
      } else {
        _$jscoverage['/editor/range.js'].lineData[345]++;
        levelClone = null;
      }
      _$jscoverage['/editor/range.js'].lineData[349]++;
      if (visit426_350_1(!startParents[k] || !levelStartNode._4eSameLevel(startParents[k]))) {
        _$jscoverage['/editor/range.js'].lineData[354]++;
        currentNode = levelStartNode[0].previousSibling;
        _$jscoverage['/editor/range.js'].lineData[355]++;
        while (currentNode) {
          _$jscoverage['/editor/range.js'].lineData[357]++;
          currentSibling = currentNode.previousSibling;
          _$jscoverage['/editor/range.js'].lineData[360]++;
          if (visit427_360_1(action === 2)) {
            _$jscoverage['/editor/range.js'].lineData[361]++;
            clone.insertBefore(currentNode.cloneNode(TRUE), clone.firstChild);
          } else {
            _$jscoverage['/editor/range.js'].lineData[365]++;
            Dom._4eRemove(currentNode);
            _$jscoverage['/editor/range.js'].lineData[368]++;
            if (visit428_368_1(action === 1)) {
              _$jscoverage['/editor/range.js'].lineData[370]++;
              clone.insertBefore(currentNode, clone.firstChild);
            }
          }
          _$jscoverage['/editor/range.js'].lineData[374]++;
          currentNode = currentSibling;
        }
      }
      _$jscoverage['/editor/range.js'].lineData[378]++;
      if (visit429_378_1(levelClone)) {
        _$jscoverage['/editor/range.js'].lineData[379]++;
        clone = levelClone;
      }
    }
    _$jscoverage['/editor/range.js'].lineData[383]++;
    if (visit430_383_1(action === 2)) {
      _$jscoverage['/editor/range.js'].lineData[387]++;
      if (visit431_387_1(hasSplitStart)) {
        _$jscoverage['/editor/range.js'].lineData[388]++;
        var startTextNode = startNode[0];
        _$jscoverage['/editor/range.js'].lineData[389]++;
        if (visit432_389_1(visit433_389_2(startTextNode.nodeType === Dom.NodeType.TEXT_NODE) && visit434_389_3(startTextNode.nextSibling && visit435_391_1(startTextNode.nextSibling.nodeType === Dom.NodeType.TEXT_NODE)))) {
          _$jscoverage['/editor/range.js'].lineData[392]++;
          startTextNode.data += startTextNode.nextSibling.data;
          _$jscoverage['/editor/range.js'].lineData[393]++;
          startTextNode.parentNode.removeChild(startTextNode.nextSibling);
        }
      }
      _$jscoverage['/editor/range.js'].lineData[397]++;
      if (visit436_397_1(hasSplitEnd)) {
        _$jscoverage['/editor/range.js'].lineData[398]++;
        var endTextNode = endNode[0];
        _$jscoverage['/editor/range.js'].lineData[399]++;
        if (visit437_399_1(visit438_399_2(endTextNode.nodeType === Dom.NodeType.TEXT_NODE) && visit439_400_1(endTextNode.previousSibling && visit440_401_1(endTextNode.previousSibling.nodeType === Dom.NodeType.TEXT_NODE)))) {
          _$jscoverage['/editor/range.js'].lineData[402]++;
          endTextNode.previousSibling.data += endTextNode.data;
          _$jscoverage['/editor/range.js'].lineData[403]++;
          endTextNode.parentNode.removeChild(endTextNode);
        }
      }
    } else {
      _$jscoverage['/editor/range.js'].lineData[413]++;
      if (visit441_414_1(topStart && visit442_414_2(topEnd && (visit443_416_1(!startNode._4eSameLevel(topStart) || !endNode._4eSameLevel(topEnd)))))) {
        _$jscoverage['/editor/range.js'].lineData[419]++;
        var startIndex = topStart._4eIndex();
        _$jscoverage['/editor/range.js'].lineData[423]++;
        if (visit444_423_1(removeStartNode && (topStart._4eSameLevel(startNode)))) {
          _$jscoverage['/editor/range.js'].lineData[426]++;
          startIndex--;
        }
        _$jscoverage['/editor/range.js'].lineData[429]++;
        self.setStart(topStart.parent(), startIndex + 1);
      }
      _$jscoverage['/editor/range.js'].lineData[433]++;
      self.collapse(TRUE);
    }
    _$jscoverage['/editor/range.js'].lineData[438]++;
    if (visit445_438_1(removeStartNode)) {
      _$jscoverage['/editor/range.js'].lineData[439]++;
      startNode.remove();
    }
    _$jscoverage['/editor/range.js'].lineData[442]++;
    if (visit446_442_1(removeEndNode)) {
      _$jscoverage['/editor/range.js'].lineData[443]++;
      endNode.remove();
    }
    _$jscoverage['/editor/range.js'].lineData[446]++;
    return docFrag;
  }
  _$jscoverage['/editor/range.js'].lineData[449]++;
  function updateCollapsed(self) {
    _$jscoverage['/editor/range.js'].functionData[8]++;
    _$jscoverage['/editor/range.js'].lineData[450]++;
    self.collapsed = (visit447_451_1(self.startContainer && visit448_452_1(self.endContainer && visit449_453_1(visit450_453_2(self.startContainer[0] === self.endContainer[0]) && visit451_454_1(self.startOffset === self.endOffset)))));
  }
  _$jscoverage['/editor/range.js'].lineData[463]++;
  function KERange(document) {
    _$jscoverage['/editor/range.js'].functionData[9]++;
    _$jscoverage['/editor/range.js'].lineData[464]++;
    var self = this;
    _$jscoverage['/editor/range.js'].lineData[465]++;
    self.startContainer = NULL;
    _$jscoverage['/editor/range.js'].lineData[466]++;
    self.startOffset = NULL;
    _$jscoverage['/editor/range.js'].lineData[467]++;
    self.endContainer = NULL;
    _$jscoverage['/editor/range.js'].lineData[468]++;
    self.endOffset = NULL;
    _$jscoverage['/editor/range.js'].lineData[469]++;
    self.collapsed = TRUE;
    _$jscoverage['/editor/range.js'].lineData[470]++;
    self.document = document;
  }
  _$jscoverage['/editor/range.js'].lineData[473]++;
  S.augment(KERange, {
  toString: function() {
  _$jscoverage['/editor/range.js'].functionData[10]++;
  _$jscoverage['/editor/range.js'].lineData[479]++;
  var s = [], self = this, startContainer = self.startContainer[0], endContainer = self.endContainer[0];
  _$jscoverage['/editor/range.js'].lineData[483]++;
  s.push((visit452_483_1(startContainer.id || startContainer.nodeName)) + ':' + self.startOffset);
  _$jscoverage['/editor/range.js'].lineData[484]++;
  s.push((visit453_484_1(endContainer.id || endContainer.nodeName)) + ':' + self.endOffset);
  _$jscoverage['/editor/range.js'].lineData[485]++;
  return s.join('<br/>');
}, 
  optimize: function() {
  _$jscoverage['/editor/range.js'].functionData[11]++;
  _$jscoverage['/editor/range.js'].lineData[495]++;
  var self = this, container = self.startContainer, offset = self.startOffset;
  _$jscoverage['/editor/range.js'].lineData[499]++;
  if (visit454_499_1(container[0].nodeType !== Dom.NodeType.ELEMENT_NODE)) {
    _$jscoverage['/editor/range.js'].lineData[500]++;
    if (visit455_500_1(!offset)) {
      _$jscoverage['/editor/range.js'].lineData[501]++;
      self.setStartBefore(container);
    } else {
      _$jscoverage['/editor/range.js'].lineData[502]++;
      if (visit456_502_1(offset >= container[0].nodeValue.length)) {
        _$jscoverage['/editor/range.js'].lineData[503]++;
        self.setStartAfter(container);
      }
    }
  }
  _$jscoverage['/editor/range.js'].lineData[507]++;
  container = self.endContainer;
  _$jscoverage['/editor/range.js'].lineData[508]++;
  offset = self.endOffset;
  _$jscoverage['/editor/range.js'].lineData[510]++;
  if (visit457_510_1(container[0].nodeType !== Dom.NodeType.ELEMENT_NODE)) {
    _$jscoverage['/editor/range.js'].lineData[511]++;
    if (visit458_511_1(!offset)) {
      _$jscoverage['/editor/range.js'].lineData[512]++;
      self.setEndBefore(container);
    } else {
      _$jscoverage['/editor/range.js'].lineData[513]++;
      if (visit459_513_1(offset >= container[0].nodeValue.length)) {
        _$jscoverage['/editor/range.js'].lineData[514]++;
        self.setEndAfter(container);
      }
    }
  }
}, 
  setStartAfter: function(node) {
  _$jscoverage['/editor/range.js'].functionData[12]++;
  _$jscoverage['/editor/range.js'].lineData[524]++;
  this.setStart(node.parent(), node._4eIndex() + 1);
}, 
  setStartBefore: function(node) {
  _$jscoverage['/editor/range.js'].functionData[13]++;
  _$jscoverage['/editor/range.js'].lineData[531]++;
  this.setStart(node.parent(), node._4eIndex());
}, 
  setEndAfter: function(node) {
  _$jscoverage['/editor/range.js'].functionData[14]++;
  _$jscoverage['/editor/range.js'].lineData[538]++;
  this.setEnd(node.parent(), node._4eIndex() + 1);
}, 
  setEndBefore: function(node) {
  _$jscoverage['/editor/range.js'].functionData[15]++;
  _$jscoverage['/editor/range.js'].lineData[545]++;
  this.setEnd(node.parent(), node._4eIndex());
}, 
  optimizeBookmark: function() {
  _$jscoverage['/editor/range.js'].functionData[16]++;
  _$jscoverage['/editor/range.js'].lineData[552]++;
  var self = this, startNode = self.startContainer, endNode = self.endContainer;
  _$jscoverage['/editor/range.js'].lineData[556]++;
  if (visit460_556_1(startNode && visit461_557_1(visit462_557_2(startNode.nodeName() === 'span') && startNode.attr('_ke_bookmark')))) {
    _$jscoverage['/editor/range.js'].lineData[559]++;
    self.setStartBefore(startNode);
  }
  _$jscoverage['/editor/range.js'].lineData[561]++;
  if (visit463_561_1(endNode && visit464_562_1(visit465_562_2(endNode.nodeName() === 'span') && endNode.attr('_ke_bookmark')))) {
    _$jscoverage['/editor/range.js'].lineData[564]++;
    self.setEndAfter(endNode);
  }
}, 
  setStart: function(startNode, startOffset) {
  _$jscoverage['/editor/range.js'].functionData[17]++;
  _$jscoverage['/editor/range.js'].lineData[582]++;
  var self = this;
  _$jscoverage['/editor/range.js'].lineData[583]++;
  if (visit466_583_1(visit467_583_2(startNode[0].nodeType === Dom.NodeType.ELEMENT_NODE) && EMPTY[startNode.nodeName()])) {
    _$jscoverage['/editor/range.js'].lineData[584]++;
    startNode = startNode.parent();
    _$jscoverage['/editor/range.js'].lineData[585]++;
    startOffset = startNode._4eIndex();
  }
  _$jscoverage['/editor/range.js'].lineData[588]++;
  self.startContainer = startNode;
  _$jscoverage['/editor/range.js'].lineData[589]++;
  self.startOffset = startOffset;
  _$jscoverage['/editor/range.js'].lineData[591]++;
  if (visit468_591_1(!self.endContainer)) {
    _$jscoverage['/editor/range.js'].lineData[592]++;
    self.endContainer = startNode;
    _$jscoverage['/editor/range.js'].lineData[593]++;
    self.endOffset = startOffset;
  }
  _$jscoverage['/editor/range.js'].lineData[596]++;
  updateCollapsed(self);
}, 
  setEnd: function(endNode, endOffset) {
  _$jscoverage['/editor/range.js'].functionData[18]++;
  _$jscoverage['/editor/range.js'].lineData[613]++;
  var self = this;
  _$jscoverage['/editor/range.js'].lineData[614]++;
  if (visit469_614_1(visit470_614_2(endNode[0].nodeType === Dom.NodeType.ELEMENT_NODE) && EMPTY[endNode.nodeName()])) {
    _$jscoverage['/editor/range.js'].lineData[615]++;
    endNode = endNode.parent();
    _$jscoverage['/editor/range.js'].lineData[616]++;
    endOffset = endNode._4eIndex() + 1;
  }
  _$jscoverage['/editor/range.js'].lineData[619]++;
  self.endContainer = endNode;
  _$jscoverage['/editor/range.js'].lineData[620]++;
  self.endOffset = endOffset;
  _$jscoverage['/editor/range.js'].lineData[622]++;
  if (visit471_622_1(!self.startContainer)) {
    _$jscoverage['/editor/range.js'].lineData[623]++;
    self.startContainer = endNode;
    _$jscoverage['/editor/range.js'].lineData[624]++;
    self.startOffset = endOffset;
  }
  _$jscoverage['/editor/range.js'].lineData[627]++;
  updateCollapsed(self);
}, 
  setStartAt: function(node, position) {
  _$jscoverage['/editor/range.js'].functionData[19]++;
  _$jscoverage['/editor/range.js'].lineData[636]++;
  var self = this;
  _$jscoverage['/editor/range.js'].lineData[637]++;
  switch (position) {
    case KER.POSITION_AFTER_START:
      _$jscoverage['/editor/range.js'].lineData[639]++;
      self.setStart(node, 0);
      _$jscoverage['/editor/range.js'].lineData[640]++;
      break;
    case KER.POSITION_BEFORE_END:
      _$jscoverage['/editor/range.js'].lineData[643]++;
      if (visit472_643_1(node[0].nodeType === Dom.NodeType.TEXT_NODE)) {
        _$jscoverage['/editor/range.js'].lineData[644]++;
        self.setStart(node, node[0].nodeValue.length);
      } else {
        _$jscoverage['/editor/range.js'].lineData[646]++;
        self.setStart(node, node[0].childNodes.length);
      }
      _$jscoverage['/editor/range.js'].lineData[648]++;
      break;
    case KER.POSITION_BEFORE_START:
      _$jscoverage['/editor/range.js'].lineData[651]++;
      self.setStartBefore(node);
      _$jscoverage['/editor/range.js'].lineData[652]++;
      break;
    case KER.POSITION_AFTER_END:
      _$jscoverage['/editor/range.js'].lineData[655]++;
      self.setStartAfter(node);
  }
  _$jscoverage['/editor/range.js'].lineData[658]++;
  updateCollapsed(self);
}, 
  setEndAt: function(node, position) {
  _$jscoverage['/editor/range.js'].functionData[20]++;
  _$jscoverage['/editor/range.js'].lineData[667]++;
  var self = this;
  _$jscoverage['/editor/range.js'].lineData[668]++;
  switch (position) {
    case KER.POSITION_AFTER_START:
      _$jscoverage['/editor/range.js'].lineData[670]++;
      self.setEnd(node, 0);
      _$jscoverage['/editor/range.js'].lineData[671]++;
      break;
    case KER.POSITION_BEFORE_END:
      _$jscoverage['/editor/range.js'].lineData[674]++;
      if (visit473_674_1(node[0].nodeType === Dom.NodeType.TEXT_NODE)) {
        _$jscoverage['/editor/range.js'].lineData[675]++;
        self.setEnd(node, node[0].nodeValue.length);
      } else {
        _$jscoverage['/editor/range.js'].lineData[677]++;
        self.setEnd(node, node[0].childNodes.length);
      }
      _$jscoverage['/editor/range.js'].lineData[679]++;
      break;
    case KER.POSITION_BEFORE_START:
      _$jscoverage['/editor/range.js'].lineData[682]++;
      self.setEndBefore(node);
      _$jscoverage['/editor/range.js'].lineData[683]++;
      break;
    case KER.POSITION_AFTER_END:
      _$jscoverage['/editor/range.js'].lineData[686]++;
      self.setEndAfter(node);
  }
  _$jscoverage['/editor/range.js'].lineData[689]++;
  updateCollapsed(self);
}, 
  cloneContents: function() {
  _$jscoverage['/editor/range.js'].functionData[21]++;
  _$jscoverage['/editor/range.js'].lineData[696]++;
  return execContentsAction(this, 2);
}, 
  deleteContents: function() {
  _$jscoverage['/editor/range.js'].functionData[22]++;
  _$jscoverage['/editor/range.js'].lineData[703]++;
  return execContentsAction(this, 0);
}, 
  extractContents: function() {
  _$jscoverage['/editor/range.js'].functionData[23]++;
  _$jscoverage['/editor/range.js'].lineData[710]++;
  return execContentsAction(this, 1);
}, 
  collapse: function(toStart) {
  _$jscoverage['/editor/range.js'].functionData[24]++;
  _$jscoverage['/editor/range.js'].lineData[718]++;
  var self = this;
  _$jscoverage['/editor/range.js'].lineData[719]++;
  if (visit474_719_1(toStart)) {
    _$jscoverage['/editor/range.js'].lineData[720]++;
    self.endContainer = self.startContainer;
    _$jscoverage['/editor/range.js'].lineData[721]++;
    self.endOffset = self.startOffset;
  } else {
    _$jscoverage['/editor/range.js'].lineData[723]++;
    self.startContainer = self.endContainer;
    _$jscoverage['/editor/range.js'].lineData[724]++;
    self.startOffset = self.endOffset;
  }
  _$jscoverage['/editor/range.js'].lineData[726]++;
  self.collapsed = TRUE;
}, 
  clone: function() {
  _$jscoverage['/editor/range.js'].functionData[25]++;
  _$jscoverage['/editor/range.js'].lineData[734]++;
  var self = this, clone = new KERange(self.document);
  _$jscoverage['/editor/range.js'].lineData[737]++;
  clone.startContainer = self.startContainer;
  _$jscoverage['/editor/range.js'].lineData[738]++;
  clone.startOffset = self.startOffset;
  _$jscoverage['/editor/range.js'].lineData[739]++;
  clone.endContainer = self.endContainer;
  _$jscoverage['/editor/range.js'].lineData[740]++;
  clone.endOffset = self.endOffset;
  _$jscoverage['/editor/range.js'].lineData[741]++;
  clone.collapsed = self.collapsed;
  _$jscoverage['/editor/range.js'].lineData[743]++;
  return clone;
}, 
  getEnclosedNode: function() {
  _$jscoverage['/editor/range.js'].functionData[26]++;
  _$jscoverage['/editor/range.js'].lineData[755]++;
  var walkerRange = this.clone();
  _$jscoverage['/editor/range.js'].lineData[758]++;
  walkerRange.optimize();
  _$jscoverage['/editor/range.js'].lineData[760]++;
  if (visit475_760_1(visit476_760_2(walkerRange.startContainer[0].nodeType !== Dom.NodeType.ELEMENT_NODE) || visit477_761_1(walkerRange.endContainer[0].nodeType !== Dom.NodeType.ELEMENT_NODE))) {
    _$jscoverage['/editor/range.js'].lineData[762]++;
    return NULL;
  }
  _$jscoverage['/editor/range.js'].lineData[765]++;
  var walker = new Walker(walkerRange), node, pre;
  _$jscoverage['/editor/range.js'].lineData[768]++;
  walker.evaluator = function(node) {
  _$jscoverage['/editor/range.js'].functionData[27]++;
  _$jscoverage['/editor/range.js'].lineData[769]++;
  return visit478_769_1(isNotWhitespaces(node) && isNotBookmarks(node));
};
  _$jscoverage['/editor/range.js'].lineData[776]++;
  node = walker.next();
  _$jscoverage['/editor/range.js'].lineData[777]++;
  walker.reset();
  _$jscoverage['/editor/range.js'].lineData[778]++;
  pre = walker.previous();
  _$jscoverage['/editor/range.js'].lineData[780]++;
  return visit479_780_1(node && node.equals(pre)) ? node : NULL;
}, 
  shrink: function(mode, selectContents) {
  _$jscoverage['/editor/range.js'].functionData[28]++;
  _$jscoverage['/editor/range.js'].lineData[790]++;
  var self = this;
  _$jscoverage['/editor/range.js'].lineData[791]++;
  if (visit480_791_1(!self.collapsed)) {
    _$jscoverage['/editor/range.js'].lineData[792]++;
    mode = visit481_792_1(mode || KER.SHRINK_TEXT);
    _$jscoverage['/editor/range.js'].lineData[794]++;
    var walkerRange = self.clone(), startContainer = self.startContainer, endContainer = self.endContainer, startOffset = self.startOffset, endOffset = self.endOffset, moveStart = TRUE, currentElement, walker, moveEnd = TRUE;
    _$jscoverage['/editor/range.js'].lineData[805]++;
    if (visit482_805_1(startContainer && visit483_806_1(startContainer[0].nodeType === Dom.NodeType.TEXT_NODE))) {
      _$jscoverage['/editor/range.js'].lineData[807]++;
      if (visit484_807_1(!startOffset)) {
        _$jscoverage['/editor/range.js'].lineData[808]++;
        walkerRange.setStartBefore(startContainer);
      } else {
        _$jscoverage['/editor/range.js'].lineData[809]++;
        if (visit485_809_1(startOffset >= startContainer[0].nodeValue.length)) {
          _$jscoverage['/editor/range.js'].lineData[810]++;
          walkerRange.setStartAfter(startContainer);
        } else {
          _$jscoverage['/editor/range.js'].lineData[814]++;
          walkerRange.setStartBefore(startContainer);
          _$jscoverage['/editor/range.js'].lineData[815]++;
          moveStart = FALSE;
        }
      }
    }
    _$jscoverage['/editor/range.js'].lineData[819]++;
    if (visit486_819_1(endContainer && visit487_820_1(endContainer[0].nodeType === Dom.NodeType.TEXT_NODE))) {
      _$jscoverage['/editor/range.js'].lineData[821]++;
      if (visit488_821_1(!endOffset)) {
        _$jscoverage['/editor/range.js'].lineData[822]++;
        walkerRange.setEndBefore(endContainer);
      } else {
        _$jscoverage['/editor/range.js'].lineData[823]++;
        if (visit489_823_1(endOffset >= endContainer[0].nodeValue.length)) {
          _$jscoverage['/editor/range.js'].lineData[824]++;
          walkerRange.setEndAfter(endContainer);
        } else {
          _$jscoverage['/editor/range.js'].lineData[826]++;
          walkerRange.setEndAfter(endContainer);
          _$jscoverage['/editor/range.js'].lineData[827]++;
          moveEnd = FALSE;
        }
      }
    }
    _$jscoverage['/editor/range.js'].lineData[831]++;
    if (visit490_831_1(moveStart || moveEnd)) {
      _$jscoverage['/editor/range.js'].lineData[833]++;
      walker = new Walker(walkerRange);
      _$jscoverage['/editor/range.js'].lineData[835]++;
      walker.evaluator = function(node) {
  _$jscoverage['/editor/range.js'].functionData[29]++;
  _$jscoverage['/editor/range.js'].lineData[836]++;
  return visit491_836_1(node.nodeType === (visit492_836_2(mode === KER.SHRINK_ELEMENT) ? Dom.NodeType.ELEMENT_NODE : Dom.NodeType.TEXT_NODE));
};
      _$jscoverage['/editor/range.js'].lineData[840]++;
      walker.guard = function(node, movingOut) {
  _$jscoverage['/editor/range.js'].functionData[30]++;
  _$jscoverage['/editor/range.js'].lineData[842]++;
  if (visit493_842_1(visit494_842_2(mode === KER.SHRINK_ELEMENT) && visit495_843_1(node.nodeType === Dom.NodeType.TEXT_NODE))) {
    _$jscoverage['/editor/range.js'].lineData[844]++;
    return FALSE;
  }
  _$jscoverage['/editor/range.js'].lineData[847]++;
  if (visit496_847_1(movingOut && visit497_847_2(node === currentElement))) {
    _$jscoverage['/editor/range.js'].lineData[848]++;
    return FALSE;
  }
  _$jscoverage['/editor/range.js'].lineData[850]++;
  if (visit498_850_1(!movingOut && visit499_850_2(node.nodeType === Dom.NodeType.ELEMENT_NODE))) {
    _$jscoverage['/editor/range.js'].lineData[851]++;
    currentElement = node;
  }
  _$jscoverage['/editor/range.js'].lineData[853]++;
  return TRUE;
};
    }
    _$jscoverage['/editor/range.js'].lineData[858]++;
    if (visit500_858_1(moveStart)) {
      _$jscoverage['/editor/range.js'].lineData[859]++;
      var textStart = walker[visit501_859_1(mode === KER.SHRINK_ELEMENT) ? 'lastForward' : 'next']();
      _$jscoverage['/editor/range.js'].lineData[860]++;
      if (visit502_860_1(textStart)) {
        _$jscoverage['/editor/range.js'].lineData[861]++;
        self.setStartAt(textStart, selectContents ? KER.POSITION_AFTER_START : KER.POSITION_BEFORE_START);
      }
    }
    _$jscoverage['/editor/range.js'].lineData[865]++;
    if (visit503_865_1(moveEnd)) {
      _$jscoverage['/editor/range.js'].lineData[866]++;
      walker.reset();
      _$jscoverage['/editor/range.js'].lineData[867]++;
      var textEnd = walker[visit504_867_1(mode === KER.SHRINK_ELEMENT) ? 'lastBackward' : 'previous']();
      _$jscoverage['/editor/range.js'].lineData[868]++;
      if (visit505_868_1(textEnd)) {
        _$jscoverage['/editor/range.js'].lineData[869]++;
        self.setEndAt(textEnd, selectContents ? KER.POSITION_BEFORE_END : KER.POSITION_AFTER_END);
      }
    }
    _$jscoverage['/editor/range.js'].lineData[873]++;
    return visit506_873_1(moveStart || moveEnd);
  }
}, 
  createBookmark2: function(normalized) {
  _$jscoverage['/editor/range.js'].functionData[31]++;
  _$jscoverage['/editor/range.js'].lineData[883]++;
  var self = this, startContainer = self.startContainer, endContainer = self.endContainer, startOffset = self.startOffset, endOffset = self.endOffset, child, previous;
  _$jscoverage['/editor/range.js'].lineData[893]++;
  if (visit507_893_1(!startContainer || !endContainer)) {
    _$jscoverage['/editor/range.js'].lineData[894]++;
    return {
  start: 0, 
  end: 0};
  }
  _$jscoverage['/editor/range.js'].lineData[900]++;
  if (visit508_900_1(normalized)) {
    _$jscoverage['/editor/range.js'].lineData[903]++;
    if (visit509_903_1(startContainer[0].nodeType === Dom.NodeType.ELEMENT_NODE)) {
      _$jscoverage['/editor/range.js'].lineData[904]++;
      child = new Node(startContainer[0].childNodes[startOffset]);
      _$jscoverage['/editor/range.js'].lineData[908]++;
      if (visit510_908_1(child && visit511_908_2(child[0] && visit512_908_3(visit513_908_4(child[0].nodeType === Dom.NodeType.TEXT_NODE) && visit514_909_1(visit515_909_2(startOffset > 0) && visit516_909_3(child[0].previousSibling.nodeType === Dom.NodeType.TEXT_NODE)))))) {
        _$jscoverage['/editor/range.js'].lineData[910]++;
        startContainer = child;
        _$jscoverage['/editor/range.js'].lineData[911]++;
        startOffset = 0;
      }
    }
    _$jscoverage['/editor/range.js'].lineData[917]++;
    while (visit517_917_1(visit518_917_2(startContainer[0].nodeType === Dom.NodeType.TEXT_NODE) && visit519_918_1((previous = startContainer.prev(undefined, 1)) && visit520_919_1(previous[0].nodeType === Dom.NodeType.TEXT_NODE)))) {
      _$jscoverage['/editor/range.js'].lineData[920]++;
      startContainer = previous;
      _$jscoverage['/editor/range.js'].lineData[921]++;
      startOffset += previous[0].nodeValue.length;
    }
    _$jscoverage['/editor/range.js'].lineData[925]++;
    if (visit521_925_1(!self.collapsed)) {
      _$jscoverage['/editor/range.js'].lineData[928]++;
      if (visit522_928_1(endContainer[0].nodeType === Dom.NodeType.ELEMENT_NODE)) {
        _$jscoverage['/editor/range.js'].lineData[929]++;
        child = new Node(endContainer[0].childNodes[endOffset]);
        _$jscoverage['/editor/range.js'].lineData[933]++;
        if (visit523_933_1(child && visit524_933_2(child[0] && visit525_934_1(visit526_934_2(child[0].nodeType === Dom.NodeType.TEXT_NODE) && visit527_934_3(visit528_934_4(endOffset > 0) && visit529_935_1(child[0].previousSibling.nodeType === Dom.NodeType.TEXT_NODE)))))) {
          _$jscoverage['/editor/range.js'].lineData[936]++;
          endContainer = child;
          _$jscoverage['/editor/range.js'].lineData[937]++;
          endOffset = 0;
        }
      }
      _$jscoverage['/editor/range.js'].lineData[942]++;
      while (visit530_942_1(visit531_942_2(endContainer[0].nodeType === Dom.NodeType.TEXT_NODE) && visit532_943_1((previous = endContainer.prev(undefined, 1)) && visit533_944_1(previous[0].nodeType === Dom.NodeType.TEXT_NODE)))) {
        _$jscoverage['/editor/range.js'].lineData[945]++;
        endContainer = previous;
        _$jscoverage['/editor/range.js'].lineData[946]++;
        endOffset += previous[0].nodeValue.length;
      }
    }
  }
  _$jscoverage['/editor/range.js'].lineData[951]++;
  return {
  start: startContainer._4eAddress(normalized), 
  end: self.collapsed ? NULL : endContainer._4eAddress(normalized), 
  startOffset: startOffset, 
  endOffset: endOffset, 
  normalized: normalized, 
  is2: TRUE};
}, 
  createBookmark: function(serializable) {
  _$jscoverage['/editor/range.js'].functionData[32]++;
  _$jscoverage['/editor/range.js'].lineData[965]++;
  var startNode, endNode, baseId, clone, self = this, collapsed = self.collapsed;
  _$jscoverage['/editor/range.js'].lineData[971]++;
  startNode = new Node('<span>', NULL, self.document);
  _$jscoverage['/editor/range.js'].lineData[972]++;
  startNode.attr('_ke_bookmark', 1);
  _$jscoverage['/editor/range.js'].lineData[973]++;
  startNode.css('display', 'none');
  _$jscoverage['/editor/range.js'].lineData[977]++;
  startNode.html('&nbsp;');
  _$jscoverage['/editor/range.js'].lineData[979]++;
  if (visit534_979_1(serializable)) {
    _$jscoverage['/editor/range.js'].lineData[980]++;
    baseId = S.guid('ke_bm_');
    _$jscoverage['/editor/range.js'].lineData[981]++;
    startNode.attr('id', baseId + 'S');
  }
  _$jscoverage['/editor/range.js'].lineData[985]++;
  if (visit535_985_1(!collapsed)) {
    _$jscoverage['/editor/range.js'].lineData[986]++;
    endNode = startNode.clone();
    _$jscoverage['/editor/range.js'].lineData[987]++;
    endNode.html('&nbsp;');
    _$jscoverage['/editor/range.js'].lineData[989]++;
    if (visit536_989_1(serializable)) {
      _$jscoverage['/editor/range.js'].lineData[990]++;
      endNode.attr('id', baseId + 'E');
    }
    _$jscoverage['/editor/range.js'].lineData[993]++;
    clone = self.clone();
    _$jscoverage['/editor/range.js'].lineData[994]++;
    clone.collapse();
    _$jscoverage['/editor/range.js'].lineData[995]++;
    clone.insertNode(endNode);
  }
  _$jscoverage['/editor/range.js'].lineData[998]++;
  clone = self.clone();
  _$jscoverage['/editor/range.js'].lineData[999]++;
  clone.collapse(TRUE);
  _$jscoverage['/editor/range.js'].lineData[1000]++;
  clone.insertNode(startNode);
  _$jscoverage['/editor/range.js'].lineData[1003]++;
  if (visit537_1003_1(endNode)) {
    _$jscoverage['/editor/range.js'].lineData[1004]++;
    self.setStartAfter(startNode);
    _$jscoverage['/editor/range.js'].lineData[1005]++;
    self.setEndBefore(endNode);
  } else {
    _$jscoverage['/editor/range.js'].lineData[1007]++;
    self.moveToPosition(startNode, KER.POSITION_AFTER_END);
  }
  _$jscoverage['/editor/range.js'].lineData[1010]++;
  return {
  startNode: serializable ? baseId + 'S' : startNode, 
  endNode: serializable ? baseId + 'E' : endNode, 
  serializable: serializable, 
  collapsed: collapsed};
}, 
  moveToPosition: function(node, position) {
  _$jscoverage['/editor/range.js'].functionData[33]++;
  _$jscoverage['/editor/range.js'].lineData[1024]++;
  var self = this;
  _$jscoverage['/editor/range.js'].lineData[1025]++;
  self.setStartAt(node, position);
  _$jscoverage['/editor/range.js'].lineData[1026]++;
  self.collapse(TRUE);
}, 
  trim: function(ignoreStart, ignoreEnd) {
  _$jscoverage['/editor/range.js'].functionData[34]++;
  _$jscoverage['/editor/range.js'].lineData[1035]++;
  var self = this, startContainer = self.startContainer, startOffset = self.startOffset, collapsed = self.collapsed;
  _$jscoverage['/editor/range.js'].lineData[1040]++;
  if (visit538_1040_1((visit539_1040_2(!ignoreStart || collapsed)) && visit540_1041_1(startContainer[0] && visit541_1042_1(startContainer[0].nodeType === Dom.NodeType.TEXT_NODE)))) {
    _$jscoverage['/editor/range.js'].lineData[1045]++;
    if (visit542_1045_1(!startOffset)) {
      _$jscoverage['/editor/range.js'].lineData[1046]++;
      startOffset = startContainer._4eIndex();
      _$jscoverage['/editor/range.js'].lineData[1047]++;
      startContainer = startContainer.parent();
    } else {
      _$jscoverage['/editor/range.js'].lineData[1051]++;
      if (visit543_1051_1(startOffset >= startContainer[0].nodeValue.length)) {
        _$jscoverage['/editor/range.js'].lineData[1052]++;
        startOffset = startContainer._4eIndex() + 1;
        _$jscoverage['/editor/range.js'].lineData[1053]++;
        startContainer = startContainer.parent();
      } else {
        _$jscoverage['/editor/range.js'].lineData[1058]++;
        var nextText = startContainer._4eSplitText(startOffset);
        _$jscoverage['/editor/range.js'].lineData[1060]++;
        startOffset = startContainer._4eIndex() + 1;
        _$jscoverage['/editor/range.js'].lineData[1061]++;
        startContainer = startContainer.parent();
        _$jscoverage['/editor/range.js'].lineData[1064]++;
        if (visit544_1064_1(Dom.equals(self.startContainer, self.endContainer))) {
          _$jscoverage['/editor/range.js'].lineData[1065]++;
          self.setEnd(nextText, self.endOffset - self.startOffset);
        } else {
          _$jscoverage['/editor/range.js'].lineData[1066]++;
          if (visit545_1066_1(Dom.equals(startContainer, self.endContainer))) {
            _$jscoverage['/editor/range.js'].lineData[1067]++;
            self.endOffset += 1;
          }
        }
      }
    }
    _$jscoverage['/editor/range.js'].lineData[1071]++;
    self.setStart(startContainer, startOffset);
    _$jscoverage['/editor/range.js'].lineData[1073]++;
    if (visit546_1073_1(collapsed)) {
      _$jscoverage['/editor/range.js'].lineData[1074]++;
      self.collapse(TRUE);
      _$jscoverage['/editor/range.js'].lineData[1075]++;
      return;
    }
  }
  _$jscoverage['/editor/range.js'].lineData[1079]++;
  var endContainer = self.endContainer, endOffset = self.endOffset;
  _$jscoverage['/editor/range.js'].lineData[1082]++;
  if (visit547_1082_1(!(visit548_1082_2(ignoreEnd || collapsed)) && visit549_1083_1(endContainer[0] && visit550_1083_2(endContainer[0].nodeType === Dom.NodeType.TEXT_NODE)))) {
    _$jscoverage['/editor/range.js'].lineData[1086]++;
    if (visit551_1086_1(!endOffset)) {
      _$jscoverage['/editor/range.js'].lineData[1087]++;
      endOffset = endContainer._4eIndex();
      _$jscoverage['/editor/range.js'].lineData[1088]++;
      endContainer = endContainer.parent();
    } else {
      _$jscoverage['/editor/range.js'].lineData[1092]++;
      if (visit552_1092_1(endOffset >= endContainer[0].nodeValue.length)) {
        _$jscoverage['/editor/range.js'].lineData[1093]++;
        endOffset = endContainer._4eIndex() + 1;
        _$jscoverage['/editor/range.js'].lineData[1094]++;
        endContainer = endContainer.parent();
      } else {
        _$jscoverage['/editor/range.js'].lineData[1099]++;
        endContainer._4eSplitText(endOffset);
        _$jscoverage['/editor/range.js'].lineData[1101]++;
        endOffset = endContainer._4eIndex() + 1;
        _$jscoverage['/editor/range.js'].lineData[1102]++;
        endContainer = endContainer.parent();
      }
    }
    _$jscoverage['/editor/range.js'].lineData[1105]++;
    self.setEnd(endContainer, endOffset);
  }
}, 
  insertNode: function(node) {
  _$jscoverage['/editor/range.js'].functionData[35]++;
  _$jscoverage['/editor/range.js'].lineData[1113]++;
  var self = this;
  _$jscoverage['/editor/range.js'].lineData[1114]++;
  self.optimizeBookmark();
  _$jscoverage['/editor/range.js'].lineData[1115]++;
  self.trim(FALSE, TRUE);
  _$jscoverage['/editor/range.js'].lineData[1116]++;
  var startContainer = self.startContainer, startOffset = self.startOffset, nextNode = visit553_1118_1(startContainer[0].childNodes[startOffset] || null);
  _$jscoverage['/editor/range.js'].lineData[1120]++;
  startContainer[0].insertBefore(node[0], nextNode);
  _$jscoverage['/editor/range.js'].lineData[1122]++;
  if (visit554_1122_1(startContainer[0] === self.endContainer[0])) {
    _$jscoverage['/editor/range.js'].lineData[1123]++;
    self.endOffset++;
  }
  _$jscoverage['/editor/range.js'].lineData[1126]++;
  self.setStartBefore(node);
}, 
  moveToBookmark: function(bookmark) {
  _$jscoverage['/editor/range.js'].functionData[36]++;
  _$jscoverage['/editor/range.js'].lineData[1134]++;
  var self = this, doc = $(self.document);
  _$jscoverage['/editor/range.js'].lineData[1136]++;
  if (visit555_1136_1(bookmark.is2)) {
    _$jscoverage['/editor/range.js'].lineData[1138]++;
    var startContainer = doc._4eGetByAddress(bookmark.start, bookmark.normalized), startOffset = bookmark.startOffset, endContainer = visit556_1140_1(bookmark.end && doc._4eGetByAddress(bookmark.end, bookmark.normalized)), endOffset = bookmark.endOffset;
    _$jscoverage['/editor/range.js'].lineData[1144]++;
    self.setStart(startContainer, startOffset);
    _$jscoverage['/editor/range.js'].lineData[1147]++;
    if (visit557_1147_1(endContainer)) {
      _$jscoverage['/editor/range.js'].lineData[1148]++;
      self.setEnd(endContainer, endOffset);
    } else {
      _$jscoverage['/editor/range.js'].lineData[1150]++;
      self.collapse(TRUE);
    }
  } else {
    _$jscoverage['/editor/range.js'].lineData[1154]++;
    var serializable = bookmark.serializable, startNode = serializable ? S.one('#' + bookmark.startNode, doc) : bookmark.startNode, endNode = serializable ? S.one('#' + bookmark.endNode, doc) : bookmark.endNode;
    _$jscoverage['/editor/range.js'].lineData[1161]++;
    self.setStartBefore(startNode);
    _$jscoverage['/editor/range.js'].lineData[1164]++;
    startNode._4eRemove();
    _$jscoverage['/editor/range.js'].lineData[1168]++;
    if (visit558_1168_1(endNode && endNode[0])) {
      _$jscoverage['/editor/range.js'].lineData[1169]++;
      self.setEndBefore(endNode);
      _$jscoverage['/editor/range.js'].lineData[1170]++;
      endNode._4eRemove();
    } else {
      _$jscoverage['/editor/range.js'].lineData[1172]++;
      self.collapse(TRUE);
    }
  }
}, 
  getCommonAncestor: function(includeSelf, ignoreTextNode) {
  _$jscoverage['/editor/range.js'].functionData[37]++;
  _$jscoverage['/editor/range.js'].lineData[1183]++;
  var self = this, start = self.startContainer, end = self.endContainer, ancestor;
  _$jscoverage['/editor/range.js'].lineData[1188]++;
  if (visit559_1188_1(start[0] === end[0])) {
    _$jscoverage['/editor/range.js'].lineData[1189]++;
    if (visit560_1189_1(includeSelf && visit561_1190_1(visit562_1190_2(start[0].nodeType === Dom.NodeType.ELEMENT_NODE) && visit563_1191_1(self.startOffset === self.endOffset - 1)))) {
      _$jscoverage['/editor/range.js'].lineData[1192]++;
      ancestor = new Node(start[0].childNodes[self.startOffset]);
    } else {
      _$jscoverage['/editor/range.js'].lineData[1194]++;
      ancestor = start;
    }
  } else {
    _$jscoverage['/editor/range.js'].lineData[1197]++;
    ancestor = start._4eCommonAncestor(end);
  }
  _$jscoverage['/editor/range.js'].lineData[1200]++;
  return visit564_1200_1(ignoreTextNode && visit565_1200_2(ancestor[0].nodeType === Dom.NodeType.TEXT_NODE)) ? ancestor.parent() : ancestor;
}, 
  enlarge: (function() {
  _$jscoverage['/editor/range.js'].functionData[38]++;
  _$jscoverage['/editor/range.js'].lineData[1213]++;
  function enlargeElement(self, left, stop, commonAncestor) {
    _$jscoverage['/editor/range.js'].functionData[39]++;
    _$jscoverage['/editor/range.js'].lineData[1214]++;
    var container = self[left ? 'startContainer' : 'endContainer'], enlarge, sibling, index = left ? 0 : 1, commonReached = 0, direction = left ? 'previousSibling' : 'nextSibling', offset = self[left ? 'startOffset' : 'endOffset'];
    _$jscoverage['/editor/range.js'].lineData[1222]++;
    if (visit566_1222_1(container[0].nodeType === Dom.NodeType.TEXT_NODE)) {
      _$jscoverage['/editor/range.js'].lineData[1223]++;
      if (visit567_1223_1(left)) {
        _$jscoverage['/editor/range.js'].lineData[1225]++;
        if (visit568_1225_1(offset)) {
          _$jscoverage['/editor/range.js'].lineData[1226]++;
          return;
        }
      } else {
        _$jscoverage['/editor/range.js'].lineData[1229]++;
        if (visit569_1229_1(offset < container[0].nodeValue.length)) {
          _$jscoverage['/editor/range.js'].lineData[1230]++;
          return;
        }
      }
      _$jscoverage['/editor/range.js'].lineData[1235]++;
      sibling = container[0][direction];
      _$jscoverage['/editor/range.js'].lineData[1237]++;
      enlarge = container[0].parentNode;
    } else {
      _$jscoverage['/editor/range.js'].lineData[1240]++;
      sibling = visit570_1240_1(container[0].childNodes[offset + (left ? -1 : 1)] || null);
      _$jscoverage['/editor/range.js'].lineData[1242]++;
      enlarge = container[0];
    }
    _$jscoverage['/editor/range.js'].lineData[1245]++;
    while (enlarge) {
      _$jscoverage['/editor/range.js'].lineData[1247]++;
      while (sibling) {
        _$jscoverage['/editor/range.js'].lineData[1248]++;
        if (visit571_1248_1(isWhitespace(sibling) || isBookmark(sibling))) {
          _$jscoverage['/editor/range.js'].lineData[1249]++;
          sibling = sibling[direction];
        } else {
          _$jscoverage['/editor/range.js'].lineData[1251]++;
          break;
        }
      }
      _$jscoverage['/editor/range.js'].lineData[1256]++;
      if (visit572_1256_1(sibling)) {
        _$jscoverage['/editor/range.js'].lineData[1258]++;
        if (visit573_1258_1(!commonReached)) {
          _$jscoverage['/editor/range.js'].lineData[1260]++;
          self[left ? 'setStartAfter' : 'setEndBefore']($(sibling));
        }
        _$jscoverage['/editor/range.js'].lineData[1262]++;
        return;
      }
      _$jscoverage['/editor/range.js'].lineData[1269]++;
      enlarge = $(enlarge);
      _$jscoverage['/editor/range.js'].lineData[1271]++;
      if (visit574_1271_1(enlarge.nodeName() === 'body')) {
        _$jscoverage['/editor/range.js'].lineData[1272]++;
        return;
      }
      _$jscoverage['/editor/range.js'].lineData[1275]++;
      if (visit575_1275_1(commonReached || enlarge.equals(commonAncestor))) {
        _$jscoverage['/editor/range.js'].lineData[1276]++;
        stop[index] = enlarge;
        _$jscoverage['/editor/range.js'].lineData[1277]++;
        commonReached = 1;
      } else {
        _$jscoverage['/editor/range.js'].lineData[1280]++;
        self[left ? 'setStartBefore' : 'setEndAfter'](enlarge);
      }
      _$jscoverage['/editor/range.js'].lineData[1283]++;
      sibling = enlarge[0][direction];
      _$jscoverage['/editor/range.js'].lineData[1284]++;
      enlarge = enlarge[0].parentNode;
    }
  }
  _$jscoverage['/editor/range.js'].lineData[1289]++;
  return function(unit) {
  _$jscoverage['/editor/range.js'].functionData[40]++;
  _$jscoverage['/editor/range.js'].lineData[1290]++;
  var self = this, enlargeable;
  _$jscoverage['/editor/range.js'].lineData[1291]++;
  switch (unit) {
    case KER.ENLARGE_ELEMENT:
      _$jscoverage['/editor/range.js'].lineData[1294]++;
      if (visit576_1294_1(self.collapsed)) {
        _$jscoverage['/editor/range.js'].lineData[1295]++;
        return;
      }
      _$jscoverage['/editor/range.js'].lineData[1298]++;
      var commonAncestor = self.getCommonAncestor(), stop = [];
      _$jscoverage['/editor/range.js'].lineData[1301]++;
      enlargeElement(self, 1, stop, commonAncestor);
      _$jscoverage['/editor/range.js'].lineData[1302]++;
      enlargeElement(self, 0, stop, commonAncestor);
      _$jscoverage['/editor/range.js'].lineData[1304]++;
      if (visit577_1304_1(stop[0] && stop[1])) {
        _$jscoverage['/editor/range.js'].lineData[1305]++;
        var commonStop = stop[0].contains(stop[1]) ? stop[1] : stop[0];
        _$jscoverage['/editor/range.js'].lineData[1306]++;
        self.setStartBefore(commonStop);
        _$jscoverage['/editor/range.js'].lineData[1307]++;
        self.setEndAfter(commonStop);
      }
      _$jscoverage['/editor/range.js'].lineData[1310]++;
      break;
    case KER.ENLARGE_BLOCK_CONTENTS:
    case KER.ENLARGE_LIST_ITEM_CONTENTS:
      _$jscoverage['/editor/range.js'].lineData[1316]++;
      var walkerRange = new KERange(self.document);
      _$jscoverage['/editor/range.js'].lineData[1317]++;
      var body = new Node(self.document.body);
      _$jscoverage['/editor/range.js'].lineData[1319]++;
      walkerRange.setStartAt(body, KER.POSITION_AFTER_START);
      _$jscoverage['/editor/range.js'].lineData[1320]++;
      walkerRange.setEnd(self.startContainer, self.startOffset);
      _$jscoverage['/editor/range.js'].lineData[1322]++;
      var walker = new Walker(walkerRange), blockBoundary, tailBr, defaultGuard = Walker.blockBoundary((visit578_1326_1(unit === KER.ENLARGE_LIST_ITEM_CONTENTS)) ? {
  br: 1} : NULL), boundaryGuard = function(node) {
  _$jscoverage['/editor/range.js'].functionData[41]++;
  _$jscoverage['/editor/range.js'].lineData[1330]++;
  var retVal = defaultGuard(node);
  _$jscoverage['/editor/range.js'].lineData[1331]++;
  if (visit579_1331_1(!retVal)) {
    _$jscoverage['/editor/range.js'].lineData[1332]++;
    blockBoundary = $(node);
  }
  _$jscoverage['/editor/range.js'].lineData[1334]++;
  return retVal;
}, tailBrGuard = function(node) {
  _$jscoverage['/editor/range.js'].functionData[42]++;
  _$jscoverage['/editor/range.js'].lineData[1338]++;
  var retVal = boundaryGuard(node);
  _$jscoverage['/editor/range.js'].lineData[1339]++;
  if (visit580_1339_1(!retVal && visit581_1339_2(Dom.nodeName(node) === 'br'))) {
    _$jscoverage['/editor/range.js'].lineData[1340]++;
    tailBr = $(node);
  }
  _$jscoverage['/editor/range.js'].lineData[1342]++;
  return retVal;
};
      _$jscoverage['/editor/range.js'].lineData[1345]++;
      walker.guard = boundaryGuard;
      _$jscoverage['/editor/range.js'].lineData[1347]++;
      enlargeable = walker.lastBackward();
      _$jscoverage['/editor/range.js'].lineData[1350]++;
      blockBoundary = visit582_1350_1(blockBoundary || body);
      _$jscoverage['/editor/range.js'].lineData[1354]++;
      self.setStartAt(blockBoundary, visit583_1356_1(visit584_1356_2(blockBoundary.nodeName() !== 'br') && (visit585_1364_1(visit586_1364_2(!enlargeable && self.checkStartOfBlock()) || visit587_1364_3(enlargeable && blockBoundary.contains(enlargeable))))) ? KER.POSITION_AFTER_START : KER.POSITION_AFTER_END);
      _$jscoverage['/editor/range.js'].lineData[1369]++;
      walkerRange = self.clone();
      _$jscoverage['/editor/range.js'].lineData[1370]++;
      walkerRange.collapse();
      _$jscoverage['/editor/range.js'].lineData[1371]++;
      walkerRange.setEndAt(body, KER.POSITION_BEFORE_END);
      _$jscoverage['/editor/range.js'].lineData[1372]++;
      walker = new Walker(walkerRange);
      _$jscoverage['/editor/range.js'].lineData[1375]++;
      walker.guard = (visit588_1375_1(unit === KER.ENLARGE_LIST_ITEM_CONTENTS)) ? tailBrGuard : boundaryGuard;
      _$jscoverage['/editor/range.js'].lineData[1377]++;
      blockBoundary = NULL;
      _$jscoverage['/editor/range.js'].lineData[1380]++;
      enlargeable = walker.lastForward();
      _$jscoverage['/editor/range.js'].lineData[1383]++;
      blockBoundary = visit589_1383_1(blockBoundary || body);
      _$jscoverage['/editor/range.js'].lineData[1387]++;
      self.setEndAt(blockBoundary, (visit590_1389_1(visit591_1389_2(!enlargeable && self.checkEndOfBlock()) || visit592_1389_3(enlargeable && blockBoundary.contains(enlargeable)))) ? KER.POSITION_BEFORE_END : KER.POSITION_BEFORE_START);
      _$jscoverage['/editor/range.js'].lineData[1394]++;
      if (visit593_1394_1(tailBr)) {
        _$jscoverage['/editor/range.js'].lineData[1395]++;
        self.setEndAfter(tailBr);
      }
  }
};
})(), 
  checkStartOfBlock: function() {
  _$jscoverage['/editor/range.js'].functionData[43]++;
  _$jscoverage['/editor/range.js'].lineData[1406]++;
  var self = this, startContainer = self.startContainer, startOffset = self.startOffset;
  _$jscoverage['/editor/range.js'].lineData[1412]++;
  if (visit594_1412_1(startOffset && visit595_1412_2(startContainer[0].nodeType === Dom.NodeType.TEXT_NODE))) {
    _$jscoverage['/editor/range.js'].lineData[1413]++;
    var textBefore = S.trim(startContainer[0].nodeValue.substring(0, startOffset));
    _$jscoverage['/editor/range.js'].lineData[1414]++;
    if (visit596_1414_1(textBefore.length)) {
      _$jscoverage['/editor/range.js'].lineData[1415]++;
      return FALSE;
    }
  }
  _$jscoverage['/editor/range.js'].lineData[1422]++;
  self.trim();
  _$jscoverage['/editor/range.js'].lineData[1426]++;
  var path = new ElementPath(self.startContainer);
  _$jscoverage['/editor/range.js'].lineData[1429]++;
  var walkerRange = self.clone();
  _$jscoverage['/editor/range.js'].lineData[1430]++;
  walkerRange.collapse(TRUE);
  _$jscoverage['/editor/range.js'].lineData[1431]++;
  walkerRange.setStartAt(visit597_1431_1(path.block || path.blockLimit), KER.POSITION_AFTER_START);
  _$jscoverage['/editor/range.js'].lineData[1433]++;
  var walker = new Walker(walkerRange);
  _$jscoverage['/editor/range.js'].lineData[1434]++;
  walker.evaluator = getCheckStartEndBlockEvalFunction(TRUE);
  _$jscoverage['/editor/range.js'].lineData[1436]++;
  return walker.checkBackward();
}, 
  checkEndOfBlock: function() {
  _$jscoverage['/editor/range.js'].functionData[44]++;
  _$jscoverage['/editor/range.js'].lineData[1444]++;
  var self = this, endContainer = self.endContainer, endOffset = self.endOffset;
  _$jscoverage['/editor/range.js'].lineData[1449]++;
  if (visit598_1449_1(endContainer[0].nodeType === Dom.NodeType.TEXT_NODE)) {
    _$jscoverage['/editor/range.js'].lineData[1450]++;
    var textAfter = S.trim(endContainer[0].nodeValue.substring(endOffset));
    _$jscoverage['/editor/range.js'].lineData[1451]++;
    if (visit599_1451_1(textAfter.length)) {
      _$jscoverage['/editor/range.js'].lineData[1452]++;
      return FALSE;
    }
  }
  _$jscoverage['/editor/range.js'].lineData[1459]++;
  self.trim();
  _$jscoverage['/editor/range.js'].lineData[1463]++;
  var path = new ElementPath(self.endContainer);
  _$jscoverage['/editor/range.js'].lineData[1466]++;
  var walkerRange = self.clone();
  _$jscoverage['/editor/range.js'].lineData[1467]++;
  walkerRange.collapse(FALSE);
  _$jscoverage['/editor/range.js'].lineData[1468]++;
  walkerRange.setEndAt(visit600_1468_1(path.block || path.blockLimit), KER.POSITION_BEFORE_END);
  _$jscoverage['/editor/range.js'].lineData[1470]++;
  var walker = new Walker(walkerRange);
  _$jscoverage['/editor/range.js'].lineData[1471]++;
  walker.evaluator = getCheckStartEndBlockEvalFunction(FALSE);
  _$jscoverage['/editor/range.js'].lineData[1473]++;
  return walker.checkForward();
}, 
  checkBoundaryOfElement: function(element, checkType) {
  _$jscoverage['/editor/range.js'].functionData[45]++;
  _$jscoverage['/editor/range.js'].lineData[1482]++;
  var walkerRange = this.clone();
  _$jscoverage['/editor/range.js'].lineData[1486]++;
  walkerRange[visit601_1484_1(checkType === KER.START) ? 'setStartAt' : 'setEndAt'](element, visit602_1486_1(checkType === KER.START) ? KER.POSITION_AFTER_START : KER.POSITION_BEFORE_END);
  _$jscoverage['/editor/range.js'].lineData[1490]++;
  var walker = new Walker(walkerRange);
  _$jscoverage['/editor/range.js'].lineData[1492]++;
  walker.evaluator = elementBoundaryEval;
  _$jscoverage['/editor/range.js'].lineData[1493]++;
  return walker[visit603_1493_1(checkType === KER.START) ? 'checkBackward' : 'checkForward']();
}, 
  getBoundaryNodes: function() {
  _$jscoverage['/editor/range.js'].functionData[46]++;
  _$jscoverage['/editor/range.js'].lineData[1502]++;
  var self = this, startNode = self.startContainer, endNode = self.endContainer, startOffset = self.startOffset, endOffset = self.endOffset, childCount;
  _$jscoverage['/editor/range.js'].lineData[1509]++;
  if (visit604_1509_1(startNode[0].nodeType === Dom.NodeType.ELEMENT_NODE)) {
    _$jscoverage['/editor/range.js'].lineData[1510]++;
    childCount = startNode[0].childNodes.length;
    _$jscoverage['/editor/range.js'].lineData[1511]++;
    if (visit605_1511_1(childCount > startOffset)) {
      _$jscoverage['/editor/range.js'].lineData[1512]++;
      startNode = $(startNode[0].childNodes[startOffset]);
    } else {
      _$jscoverage['/editor/range.js'].lineData[1513]++;
      if (visit606_1513_1(childCount === 0)) {
        _$jscoverage['/editor/range.js'].lineData[1515]++;
        startNode = startNode._4ePreviousSourceNode();
      } else {
        _$jscoverage['/editor/range.js'].lineData[1519]++;
        startNode = startNode[0];
        _$jscoverage['/editor/range.js'].lineData[1520]++;
        while (startNode.lastChild) {
          _$jscoverage['/editor/range.js'].lineData[1521]++;
          startNode = startNode.lastChild;
        }
        _$jscoverage['/editor/range.js'].lineData[1524]++;
        startNode = $(startNode);
        _$jscoverage['/editor/range.js'].lineData[1529]++;
        startNode = visit607_1529_1(startNode._4eNextSourceNode() || startNode);
      }
    }
  }
  _$jscoverage['/editor/range.js'].lineData[1533]++;
  if (visit608_1533_1(endNode[0].nodeType === Dom.NodeType.ELEMENT_NODE)) {
    _$jscoverage['/editor/range.js'].lineData[1534]++;
    childCount = endNode[0].childNodes.length;
    _$jscoverage['/editor/range.js'].lineData[1535]++;
    if (visit609_1535_1(childCount > endOffset)) {
      _$jscoverage['/editor/range.js'].lineData[1536]++;
      endNode = $(endNode[0].childNodes[endOffset])._4ePreviousSourceNode(TRUE);
    } else {
      _$jscoverage['/editor/range.js'].lineData[1539]++;
      if (visit610_1539_1(childCount === 0)) {
        _$jscoverage['/editor/range.js'].lineData[1540]++;
        endNode = endNode._4ePreviousSourceNode();
      } else {
        _$jscoverage['/editor/range.js'].lineData[1544]++;
        endNode = endNode[0];
        _$jscoverage['/editor/range.js'].lineData[1545]++;
        while (endNode.lastChild) {
          _$jscoverage['/editor/range.js'].lineData[1546]++;
          endNode = endNode.lastChild;
        }
        _$jscoverage['/editor/range.js'].lineData[1548]++;
        endNode = $(endNode);
      }
    }
  }
  _$jscoverage['/editor/range.js'].lineData[1554]++;
  if (visit611_1554_1(startNode._4ePosition(endNode) & KEP.POSITION_FOLLOWING)) {
    _$jscoverage['/editor/range.js'].lineData[1555]++;
    startNode = endNode;
  }
  _$jscoverage['/editor/range.js'].lineData[1558]++;
  return {
  startNode: startNode, 
  endNode: endNode};
}, 
  fixBlock: function(isStart, blockTag) {
  _$jscoverage['/editor/range.js'].functionData[47]++;
  _$jscoverage['/editor/range.js'].lineData[1569]++;
  var self = this, bookmark = self.createBookmark(), fixedBlock = $(self.document.createElement(blockTag));
  _$jscoverage['/editor/range.js'].lineData[1572]++;
  self.collapse(isStart);
  _$jscoverage['/editor/range.js'].lineData[1573]++;
  self.enlarge(KER.ENLARGE_BLOCK_CONTENTS);
  _$jscoverage['/editor/range.js'].lineData[1574]++;
  fixedBlock[0].appendChild(self.extractContents());
  _$jscoverage['/editor/range.js'].lineData[1575]++;
  fixedBlock._4eTrim();
  _$jscoverage['/editor/range.js'].lineData[1576]++;
  if (visit612_1576_1(!UA.ie)) {
    _$jscoverage['/editor/range.js'].lineData[1577]++;
    fixedBlock._4eAppendBogus();
  }
  _$jscoverage['/editor/range.js'].lineData[1579]++;
  self.insertNode(fixedBlock);
  _$jscoverage['/editor/range.js'].lineData[1580]++;
  self.moveToBookmark(bookmark);
  _$jscoverage['/editor/range.js'].lineData[1581]++;
  return fixedBlock;
}, 
  splitBlock: function(blockTag) {
  _$jscoverage['/editor/range.js'].functionData[48]++;
  _$jscoverage['/editor/range.js'].lineData[1590]++;
  var self = this, startPath = new ElementPath(self.startContainer), endPath = new ElementPath(self.endContainer), startBlockLimit = startPath.blockLimit, endBlockLimit = endPath.blockLimit, startBlock = startPath.block, endBlock = endPath.block, elementPath = NULL;
  _$jscoverage['/editor/range.js'].lineData[1600]++;
  if (visit613_1600_1(!startBlockLimit.equals(endBlockLimit))) {
    _$jscoverage['/editor/range.js'].lineData[1601]++;
    return NULL;
  }
  _$jscoverage['/editor/range.js'].lineData[1605]++;
  if (visit614_1605_1(blockTag !== 'br')) {
    _$jscoverage['/editor/range.js'].lineData[1606]++;
    if (visit615_1606_1(!startBlock)) {
      _$jscoverage['/editor/range.js'].lineData[1607]++;
      startBlock = self.fixBlock(TRUE, blockTag);
      _$jscoverage['/editor/range.js'].lineData[1608]++;
      endBlock = new ElementPath(self.endContainer).block;
    }
    _$jscoverage['/editor/range.js'].lineData[1611]++;
    if (visit616_1611_1(!endBlock)) {
      _$jscoverage['/editor/range.js'].lineData[1612]++;
      endBlock = self.fixBlock(FALSE, blockTag);
    }
  }
  _$jscoverage['/editor/range.js'].lineData[1617]++;
  var isStartOfBlock = visit617_1617_1(startBlock && self.checkStartOfBlock()), isEndOfBlock = visit618_1618_1(endBlock && self.checkEndOfBlock());
  _$jscoverage['/editor/range.js'].lineData[1621]++;
  self.deleteContents();
  _$jscoverage['/editor/range.js'].lineData[1623]++;
  if (visit619_1623_1(startBlock && visit620_1623_2(startBlock[0] === endBlock[0]))) {
    _$jscoverage['/editor/range.js'].lineData[1624]++;
    if (visit621_1624_1(isEndOfBlock)) {
      _$jscoverage['/editor/range.js'].lineData[1625]++;
      elementPath = new ElementPath(self.startContainer);
      _$jscoverage['/editor/range.js'].lineData[1626]++;
      self.moveToPosition(endBlock, KER.POSITION_AFTER_END);
      _$jscoverage['/editor/range.js'].lineData[1627]++;
      endBlock = NULL;
    } else {
      _$jscoverage['/editor/range.js'].lineData[1629]++;
      if (visit622_1629_1(isStartOfBlock)) {
        _$jscoverage['/editor/range.js'].lineData[1630]++;
        elementPath = new ElementPath(self.startContainer);
        _$jscoverage['/editor/range.js'].lineData[1631]++;
        self.moveToPosition(startBlock, KER.POSITION_BEFORE_START);
        _$jscoverage['/editor/range.js'].lineData[1632]++;
        startBlock = NULL;
      } else {
        _$jscoverage['/editor/range.js'].lineData[1635]++;
        endBlock = self.splitElement(startBlock);
        _$jscoverage['/editor/range.js'].lineData[1639]++;
        if (visit623_1639_1(!UA.ie && !S.inArray(startBlock.nodeName(), ['ul', 'ol']))) {
          _$jscoverage['/editor/range.js'].lineData[1640]++;
          startBlock._4eAppendBogus();
        }
      }
    }
  }
  _$jscoverage['/editor/range.js'].lineData[1645]++;
  return {
  previousBlock: startBlock, 
  nextBlock: endBlock, 
  wasStartOfBlock: isStartOfBlock, 
  wasEndOfBlock: isEndOfBlock, 
  elementPath: elementPath};
}, 
  splitElement: function(toSplit) {
  _$jscoverage['/editor/range.js'].functionData[49]++;
  _$jscoverage['/editor/range.js'].lineData[1660]++;
  var self = this;
  _$jscoverage['/editor/range.js'].lineData[1661]++;
  if (visit624_1661_1(!self.collapsed)) {
    _$jscoverage['/editor/range.js'].lineData[1662]++;
    return NULL;
  }
  _$jscoverage['/editor/range.js'].lineData[1667]++;
  self.setEndAt(toSplit, KER.POSITION_BEFORE_END);
  _$jscoverage['/editor/range.js'].lineData[1668]++;
  var documentFragment = self.extractContents(), clone = toSplit.clone(FALSE);
  _$jscoverage['/editor/range.js'].lineData[1673]++;
  clone[0].appendChild(documentFragment);
  _$jscoverage['/editor/range.js'].lineData[1675]++;
  clone.insertAfter(toSplit);
  _$jscoverage['/editor/range.js'].lineData[1676]++;
  self.moveToPosition(toSplit, KER.POSITION_AFTER_END);
  _$jscoverage['/editor/range.js'].lineData[1677]++;
  return clone;
}, 
  moveToElementEditablePosition: function(el, isMoveToEnd) {
  _$jscoverage['/editor/range.js'].functionData[50]++;
  _$jscoverage['/editor/range.js'].lineData[1689]++;
  function nextDFS(node, childOnly) {
    _$jscoverage['/editor/range.js'].functionData[51]++;
    _$jscoverage['/editor/range.js'].lineData[1690]++;
    var next;
    _$jscoverage['/editor/range.js'].lineData[1692]++;
    if (visit625_1692_1(visit626_1692_2(node[0].nodeType === Dom.NodeType.ELEMENT_NODE) && node._4eIsEditable())) {
      _$jscoverage['/editor/range.js'].lineData[1694]++;
      next = node[isMoveToEnd ? 'last' : 'first'](nonWhitespaceOrIsBookmark, 1);
    }
    _$jscoverage['/editor/range.js'].lineData[1697]++;
    if (visit627_1697_1(!childOnly && !next)) {
      _$jscoverage['/editor/range.js'].lineData[1698]++;
      next = node[isMoveToEnd ? 'prev' : 'next'](nonWhitespaceOrIsBookmark, 1);
    }
    _$jscoverage['/editor/range.js'].lineData[1701]++;
    return next;
  }
  _$jscoverage['/editor/range.js'].lineData[1704]++;
  var found = 0, self = this;
  _$jscoverage['/editor/range.js'].lineData[1706]++;
  while (el) {
    _$jscoverage['/editor/range.js'].lineData[1708]++;
    if (visit628_1708_1(el[0].nodeType === Dom.NodeType.TEXT_NODE)) {
      _$jscoverage['/editor/range.js'].lineData[1709]++;
      self.moveToPosition(el, isMoveToEnd ? KER.POSITION_AFTER_END : KER.POSITION_BEFORE_START);
      _$jscoverage['/editor/range.js'].lineData[1712]++;
      found = 1;
      _$jscoverage['/editor/range.js'].lineData[1713]++;
      break;
    }
    _$jscoverage['/editor/range.js'].lineData[1717]++;
    if (visit629_1717_1(visit630_1717_2(el[0].nodeType === Dom.NodeType.ELEMENT_NODE) && el._4eIsEditable())) {
      _$jscoverage['/editor/range.js'].lineData[1718]++;
      self.moveToPosition(el, isMoveToEnd ? KER.POSITION_BEFORE_END : KER.POSITION_AFTER_START);
      _$jscoverage['/editor/range.js'].lineData[1721]++;
      found = 1;
    }
    _$jscoverage['/editor/range.js'].lineData[1724]++;
    el = nextDFS(el, found);
  }
  _$jscoverage['/editor/range.js'].lineData[1727]++;
  return !!found;
}, 
  selectNodeContents: function(node) {
  _$jscoverage['/editor/range.js'].functionData[52]++;
  _$jscoverage['/editor/range.js'].lineData[1735]++;
  var self = this, domNode = node[0];
  _$jscoverage['/editor/range.js'].lineData[1736]++;
  self.setStart(node, 0);
  _$jscoverage['/editor/range.js'].lineData[1737]++;
  self.setEnd(node, visit631_1737_1(domNode.nodeType === Dom.NodeType.TEXT_NODE) ? domNode.nodeValue.length : domNode.childNodes.length);
}, 
  insertNodeByDtd: function(element) {
  _$jscoverage['/editor/range.js'].functionData[53]++;
  _$jscoverage['/editor/range.js'].lineData[1747]++;
  var current, self = this, tmpDtd, last, elementName = element.nodeName(), isBlock = dtd.$block[elementName];
  _$jscoverage['/editor/range.js'].lineData[1753]++;
  self.deleteContents();
  _$jscoverage['/editor/range.js'].lineData[1754]++;
  if (visit632_1754_1(isBlock)) {
    _$jscoverage['/editor/range.js'].lineData[1755]++;
    current = self.getCommonAncestor(FALSE, TRUE);
    _$jscoverage['/editor/range.js'].lineData[1756]++;
    while (visit633_1756_1((tmpDtd = dtd[current.nodeName()]) && !(visit634_1756_2(tmpDtd && tmpDtd[elementName])))) {
      _$jscoverage['/editor/range.js'].lineData[1757]++;
      var parent = current.parent();
      _$jscoverage['/editor/range.js'].lineData[1760]++;
      if (visit635_1760_1(self.checkStartOfBlock() && self.checkEndOfBlock())) {
        _$jscoverage['/editor/range.js'].lineData[1761]++;
        self.setStartBefore(current);
        _$jscoverage['/editor/range.js'].lineData[1762]++;
        self.collapse(TRUE);
        _$jscoverage['/editor/range.js'].lineData[1763]++;
        current.remove();
      } else {
        _$jscoverage['/editor/range.js'].lineData[1765]++;
        last = current;
      }
      _$jscoverage['/editor/range.js'].lineData[1767]++;
      current = parent;
    }
    _$jscoverage['/editor/range.js'].lineData[1770]++;
    if (visit636_1770_1(last)) {
      _$jscoverage['/editor/range.js'].lineData[1771]++;
      self.splitElement(last);
    }
  }
  _$jscoverage['/editor/range.js'].lineData[1775]++;
  self.insertNode(element);
}});
  _$jscoverage['/editor/range.js'].lineData[1779]++;
  Utils.injectDom({
  _4eBreakParent: function(el, parent) {
  _$jscoverage['/editor/range.js'].functionData[54]++;
  _$jscoverage['/editor/range.js'].lineData[1781]++;
  parent = $(parent);
  _$jscoverage['/editor/range.js'].lineData[1782]++;
  el = $(el);
  _$jscoverage['/editor/range.js'].lineData[1784]++;
  var KERange = Editor.Range, docFrag, range = new KERange(el[0].ownerDocument);
  _$jscoverage['/editor/range.js'].lineData[1790]++;
  range.setStartAfter(el);
  _$jscoverage['/editor/range.js'].lineData[1791]++;
  range.setEndAfter(parent);
  _$jscoverage['/editor/range.js'].lineData[1794]++;
  docFrag = range.extractContents();
  _$jscoverage['/editor/range.js'].lineData[1797]++;
  range.insertNode(el.remove());
  _$jscoverage['/editor/range.js'].lineData[1800]++;
  el.after(docFrag);
}});
  _$jscoverage['/editor/range.js'].lineData[1804]++;
  Editor.Range = KERange;
  _$jscoverage['/editor/range.js'].lineData[1806]++;
  return KERange;
});
