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
if (! _$jscoverage['/base/style.js']) {
  _$jscoverage['/base/style.js'] = {};
  _$jscoverage['/base/style.js'].lineData = [];
  _$jscoverage['/base/style.js'].lineData[6] = 0;
  _$jscoverage['/base/style.js'].lineData[7] = 0;
  _$jscoverage['/base/style.js'].lineData[8] = 0;
  _$jscoverage['/base/style.js'].lineData[9] = 0;
  _$jscoverage['/base/style.js'].lineData[42] = 0;
  _$jscoverage['/base/style.js'].lineData[50] = 0;
  _$jscoverage['/base/style.js'].lineData[52] = 0;
  _$jscoverage['/base/style.js'].lineData[53] = 0;
  _$jscoverage['/base/style.js'].lineData[54] = 0;
  _$jscoverage['/base/style.js'].lineData[55] = 0;
  _$jscoverage['/base/style.js'].lineData[57] = 0;
  _$jscoverage['/base/style.js'].lineData[61] = 0;
  _$jscoverage['/base/style.js'].lineData[62] = 0;
  _$jscoverage['/base/style.js'].lineData[63] = 0;
  _$jscoverage['/base/style.js'].lineData[64] = 0;
  _$jscoverage['/base/style.js'].lineData[67] = 0;
  _$jscoverage['/base/style.js'].lineData[68] = 0;
  _$jscoverage['/base/style.js'].lineData[71] = 0;
  _$jscoverage['/base/style.js'].lineData[72] = 0;
  _$jscoverage['/base/style.js'].lineData[75] = 0;
  _$jscoverage['/base/style.js'].lineData[77] = 0;
  _$jscoverage['/base/style.js'].lineData[80] = 0;
  _$jscoverage['/base/style.js'].lineData[81] = 0;
  _$jscoverage['/base/style.js'].lineData[84] = 0;
  _$jscoverage['/base/style.js'].lineData[85] = 0;
  _$jscoverage['/base/style.js'].lineData[86] = 0;
  _$jscoverage['/base/style.js'].lineData[88] = 0;
  _$jscoverage['/base/style.js'].lineData[89] = 0;
  _$jscoverage['/base/style.js'].lineData[90] = 0;
  _$jscoverage['/base/style.js'].lineData[92] = 0;
  _$jscoverage['/base/style.js'].lineData[94] = 0;
  _$jscoverage['/base/style.js'].lineData[97] = 0;
  _$jscoverage['/base/style.js'].lineData[111] = 0;
  _$jscoverage['/base/style.js'].lineData[119] = 0;
  _$jscoverage['/base/style.js'].lineData[122] = 0;
  _$jscoverage['/base/style.js'].lineData[123] = 0;
  _$jscoverage['/base/style.js'].lineData[127] = 0;
  _$jscoverage['/base/style.js'].lineData[128] = 0;
  _$jscoverage['/base/style.js'].lineData[132] = 0;
  _$jscoverage['/base/style.js'].lineData[133] = 0;
  _$jscoverage['/base/style.js'].lineData[134] = 0;
  _$jscoverage['/base/style.js'].lineData[135] = 0;
  _$jscoverage['/base/style.js'].lineData[136] = 0;
  _$jscoverage['/base/style.js'].lineData[138] = 0;
  _$jscoverage['/base/style.js'].lineData[139] = 0;
  _$jscoverage['/base/style.js'].lineData[141] = 0;
  _$jscoverage['/base/style.js'].lineData[142] = 0;
  _$jscoverage['/base/style.js'].lineData[143] = 0;
  _$jscoverage['/base/style.js'].lineData[146] = 0;
  _$jscoverage['/base/style.js'].lineData[159] = 0;
  _$jscoverage['/base/style.js'].lineData[164] = 0;
  _$jscoverage['/base/style.js'].lineData[165] = 0;
  _$jscoverage['/base/style.js'].lineData[166] = 0;
  _$jscoverage['/base/style.js'].lineData[167] = 0;
  _$jscoverage['/base/style.js'].lineData[170] = 0;
  _$jscoverage['/base/style.js'].lineData[172] = 0;
  _$jscoverage['/base/style.js'].lineData[173] = 0;
  _$jscoverage['/base/style.js'].lineData[174] = 0;
  _$jscoverage['/base/style.js'].lineData[175] = 0;
  _$jscoverage['/base/style.js'].lineData[177] = 0;
  _$jscoverage['/base/style.js'].lineData[179] = 0;
  _$jscoverage['/base/style.js'].lineData[180] = 0;
  _$jscoverage['/base/style.js'].lineData[183] = 0;
  _$jscoverage['/base/style.js'].lineData[196] = 0;
  _$jscoverage['/base/style.js'].lineData[203] = 0;
  _$jscoverage['/base/style.js'].lineData[204] = 0;
  _$jscoverage['/base/style.js'].lineData[205] = 0;
  _$jscoverage['/base/style.js'].lineData[206] = 0;
  _$jscoverage['/base/style.js'].lineData[209] = 0;
  _$jscoverage['/base/style.js'].lineData[212] = 0;
  _$jscoverage['/base/style.js'].lineData[213] = 0;
  _$jscoverage['/base/style.js'].lineData[215] = 0;
  _$jscoverage['/base/style.js'].lineData[217] = 0;
  _$jscoverage['/base/style.js'].lineData[218] = 0;
  _$jscoverage['/base/style.js'].lineData[220] = 0;
  _$jscoverage['/base/style.js'].lineData[222] = 0;
  _$jscoverage['/base/style.js'].lineData[225] = 0;
  _$jscoverage['/base/style.js'].lineData[229] = 0;
  _$jscoverage['/base/style.js'].lineData[230] = 0;
  _$jscoverage['/base/style.js'].lineData[233] = 0;
  _$jscoverage['/base/style.js'].lineData[241] = 0;
  _$jscoverage['/base/style.js'].lineData[245] = 0;
  _$jscoverage['/base/style.js'].lineData[246] = 0;
  _$jscoverage['/base/style.js'].lineData[247] = 0;
  _$jscoverage['/base/style.js'].lineData[249] = 0;
  _$jscoverage['/base/style.js'].lineData[250] = 0;
  _$jscoverage['/base/style.js'].lineData[251] = 0;
  _$jscoverage['/base/style.js'].lineData[252] = 0;
  _$jscoverage['/base/style.js'].lineData[253] = 0;
  _$jscoverage['/base/style.js'].lineData[263] = 0;
  _$jscoverage['/base/style.js'].lineData[265] = 0;
  _$jscoverage['/base/style.js'].lineData[266] = 0;
  _$jscoverage['/base/style.js'].lineData[267] = 0;
  _$jscoverage['/base/style.js'].lineData[269] = 0;
  _$jscoverage['/base/style.js'].lineData[270] = 0;
  _$jscoverage['/base/style.js'].lineData[271] = 0;
  _$jscoverage['/base/style.js'].lineData[273] = 0;
  _$jscoverage['/base/style.js'].lineData[283] = 0;
  _$jscoverage['/base/style.js'].lineData[285] = 0;
  _$jscoverage['/base/style.js'].lineData[286] = 0;
  _$jscoverage['/base/style.js'].lineData[287] = 0;
  _$jscoverage['/base/style.js'].lineData[288] = 0;
  _$jscoverage['/base/style.js'].lineData[290] = 0;
  _$jscoverage['/base/style.js'].lineData[304] = 0;
  _$jscoverage['/base/style.js'].lineData[305] = 0;
  _$jscoverage['/base/style.js'].lineData[306] = 0;
  _$jscoverage['/base/style.js'].lineData[308] = 0;
  _$jscoverage['/base/style.js'].lineData[311] = 0;
  _$jscoverage['/base/style.js'].lineData[314] = 0;
  _$jscoverage['/base/style.js'].lineData[315] = 0;
  _$jscoverage['/base/style.js'].lineData[319] = 0;
  _$jscoverage['/base/style.js'].lineData[320] = 0;
  _$jscoverage['/base/style.js'].lineData[323] = 0;
  _$jscoverage['/base/style.js'].lineData[326] = 0;
  _$jscoverage['/base/style.js'].lineData[328] = 0;
  _$jscoverage['/base/style.js'].lineData[329] = 0;
  _$jscoverage['/base/style.js'].lineData[331] = 0;
  _$jscoverage['/base/style.js'].lineData[340] = 0;
  _$jscoverage['/base/style.js'].lineData[348] = 0;
  _$jscoverage['/base/style.js'].lineData[349] = 0;
  _$jscoverage['/base/style.js'].lineData[350] = 0;
  _$jscoverage['/base/style.js'].lineData[351] = 0;
  _$jscoverage['/base/style.js'].lineData[352] = 0;
  _$jscoverage['/base/style.js'].lineData[353] = 0;
  _$jscoverage['/base/style.js'].lineData[354] = 0;
  _$jscoverage['/base/style.js'].lineData[355] = 0;
  _$jscoverage['/base/style.js'].lineData[356] = 0;
  _$jscoverage['/base/style.js'].lineData[357] = 0;
  _$jscoverage['/base/style.js'].lineData[358] = 0;
  _$jscoverage['/base/style.js'].lineData[359] = 0;
  _$jscoverage['/base/style.js'].lineData[420] = 0;
  _$jscoverage['/base/style.js'].lineData[421] = 0;
  _$jscoverage['/base/style.js'].lineData[422] = 0;
  _$jscoverage['/base/style.js'].lineData[423] = 0;
  _$jscoverage['/base/style.js'].lineData[426] = 0;
  _$jscoverage['/base/style.js'].lineData[427] = 0;
  _$jscoverage['/base/style.js'].lineData[428] = 0;
  _$jscoverage['/base/style.js'].lineData[431] = 0;
  _$jscoverage['/base/style.js'].lineData[432] = 0;
  _$jscoverage['/base/style.js'].lineData[433] = 0;
  _$jscoverage['/base/style.js'].lineData[434] = 0;
  _$jscoverage['/base/style.js'].lineData[436] = 0;
  _$jscoverage['/base/style.js'].lineData[442] = 0;
  _$jscoverage['/base/style.js'].lineData[447] = 0;
  _$jscoverage['/base/style.js'].lineData[448] = 0;
  _$jscoverage['/base/style.js'].lineData[449] = 0;
  _$jscoverage['/base/style.js'].lineData[451] = 0;
  _$jscoverage['/base/style.js'].lineData[456] = 0;
  _$jscoverage['/base/style.js'].lineData[458] = 0;
  _$jscoverage['/base/style.js'].lineData[459] = 0;
  _$jscoverage['/base/style.js'].lineData[461] = 0;
  _$jscoverage['/base/style.js'].lineData[464] = 0;
  _$jscoverage['/base/style.js'].lineData[465] = 0;
  _$jscoverage['/base/style.js'].lineData[466] = 0;
  _$jscoverage['/base/style.js'].lineData[467] = 0;
  _$jscoverage['/base/style.js'].lineData[469] = 0;
  _$jscoverage['/base/style.js'].lineData[470] = 0;
  _$jscoverage['/base/style.js'].lineData[471] = 0;
  _$jscoverage['/base/style.js'].lineData[472] = 0;
  _$jscoverage['/base/style.js'].lineData[475] = 0;
  _$jscoverage['/base/style.js'].lineData[476] = 0;
  _$jscoverage['/base/style.js'].lineData[479] = 0;
  _$jscoverage['/base/style.js'].lineData[484] = 0;
  _$jscoverage['/base/style.js'].lineData[485] = 0;
  _$jscoverage['/base/style.js'].lineData[490] = 0;
  _$jscoverage['/base/style.js'].lineData[491] = 0;
  _$jscoverage['/base/style.js'].lineData[492] = 0;
  _$jscoverage['/base/style.js'].lineData[495] = 0;
  _$jscoverage['/base/style.js'].lineData[498] = 0;
  _$jscoverage['/base/style.js'].lineData[499] = 0;
  _$jscoverage['/base/style.js'].lineData[503] = 0;
  _$jscoverage['/base/style.js'].lineData[504] = 0;
  _$jscoverage['/base/style.js'].lineData[507] = 0;
  _$jscoverage['/base/style.js'].lineData[509] = 0;
  _$jscoverage['/base/style.js'].lineData[511] = 0;
  _$jscoverage['/base/style.js'].lineData[512] = 0;
  _$jscoverage['/base/style.js'].lineData[513] = 0;
  _$jscoverage['/base/style.js'].lineData[515] = 0;
  _$jscoverage['/base/style.js'].lineData[517] = 0;
  _$jscoverage['/base/style.js'].lineData[518] = 0;
  _$jscoverage['/base/style.js'].lineData[521] = 0;
  _$jscoverage['/base/style.js'].lineData[522] = 0;
  _$jscoverage['/base/style.js'].lineData[524] = 0;
  _$jscoverage['/base/style.js'].lineData[525] = 0;
  _$jscoverage['/base/style.js'].lineData[527] = 0;
  _$jscoverage['/base/style.js'].lineData[529] = 0;
  _$jscoverage['/base/style.js'].lineData[531] = 0;
  _$jscoverage['/base/style.js'].lineData[533] = 0;
  _$jscoverage['/base/style.js'].lineData[536] = 0;
  _$jscoverage['/base/style.js'].lineData[537] = 0;
  _$jscoverage['/base/style.js'].lineData[540] = 0;
  _$jscoverage['/base/style.js'].lineData[543] = 0;
  _$jscoverage['/base/style.js'].lineData[544] = 0;
  _$jscoverage['/base/style.js'].lineData[546] = 0;
  _$jscoverage['/base/style.js'].lineData[551] = 0;
  _$jscoverage['/base/style.js'].lineData[555] = 0;
  _$jscoverage['/base/style.js'].lineData[557] = 0;
  _$jscoverage['/base/style.js'].lineData[562] = 0;
  _$jscoverage['/base/style.js'].lineData[563] = 0;
  _$jscoverage['/base/style.js'].lineData[566] = 0;
  _$jscoverage['/base/style.js'].lineData[567] = 0;
  _$jscoverage['/base/style.js'].lineData[569] = 0;
  _$jscoverage['/base/style.js'].lineData[570] = 0;
  _$jscoverage['/base/style.js'].lineData[573] = 0;
  _$jscoverage['/base/style.js'].lineData[585] = 0;
  _$jscoverage['/base/style.js'].lineData[586] = 0;
  _$jscoverage['/base/style.js'].lineData[587] = 0;
  _$jscoverage['/base/style.js'].lineData[588] = 0;
  _$jscoverage['/base/style.js'].lineData[589] = 0;
  _$jscoverage['/base/style.js'].lineData[591] = 0;
  _$jscoverage['/base/style.js'].lineData[594] = 0;
  _$jscoverage['/base/style.js'].lineData[595] = 0;
  _$jscoverage['/base/style.js'].lineData[596] = 0;
  _$jscoverage['/base/style.js'].lineData[597] = 0;
  _$jscoverage['/base/style.js'].lineData[598] = 0;
  _$jscoverage['/base/style.js'].lineData[600] = 0;
  _$jscoverage['/base/style.js'].lineData[601] = 0;
  _$jscoverage['/base/style.js'].lineData[603] = 0;
  _$jscoverage['/base/style.js'].lineData[608] = 0;
  _$jscoverage['/base/style.js'].lineData[612] = 0;
  _$jscoverage['/base/style.js'].lineData[613] = 0;
  _$jscoverage['/base/style.js'].lineData[614] = 0;
  _$jscoverage['/base/style.js'].lineData[617] = 0;
  _$jscoverage['/base/style.js'].lineData[620] = 0;
  _$jscoverage['/base/style.js'].lineData[621] = 0;
  _$jscoverage['/base/style.js'].lineData[622] = 0;
  _$jscoverage['/base/style.js'].lineData[623] = 0;
  _$jscoverage['/base/style.js'].lineData[624] = 0;
  _$jscoverage['/base/style.js'].lineData[626] = 0;
  _$jscoverage['/base/style.js'].lineData[627] = 0;
  _$jscoverage['/base/style.js'].lineData[632] = 0;
  _$jscoverage['/base/style.js'].lineData[635] = 0;
  _$jscoverage['/base/style.js'].lineData[637] = 0;
  _$jscoverage['/base/style.js'].lineData[638] = 0;
  _$jscoverage['/base/style.js'].lineData[642] = 0;
  _$jscoverage['/base/style.js'].lineData[643] = 0;
  _$jscoverage['/base/style.js'].lineData[648] = 0;
  _$jscoverage['/base/style.js'].lineData[649] = 0;
  _$jscoverage['/base/style.js'].lineData[650] = 0;
  _$jscoverage['/base/style.js'].lineData[651] = 0;
  _$jscoverage['/base/style.js'].lineData[652] = 0;
  _$jscoverage['/base/style.js'].lineData[655] = 0;
  _$jscoverage['/base/style.js'].lineData[656] = 0;
  _$jscoverage['/base/style.js'].lineData[660] = 0;
  _$jscoverage['/base/style.js'].lineData[666] = 0;
  _$jscoverage['/base/style.js'].lineData[667] = 0;
  _$jscoverage['/base/style.js'].lineData[668] = 0;
  _$jscoverage['/base/style.js'].lineData[670] = 0;
  _$jscoverage['/base/style.js'].lineData[672] = 0;
  _$jscoverage['/base/style.js'].lineData[675] = 0;
}
if (! _$jscoverage['/base/style.js'].functionData) {
  _$jscoverage['/base/style.js'].functionData = [];
  _$jscoverage['/base/style.js'].functionData[0] = 0;
  _$jscoverage['/base/style.js'].functionData[1] = 0;
  _$jscoverage['/base/style.js'].functionData[2] = 0;
  _$jscoverage['/base/style.js'].functionData[3] = 0;
  _$jscoverage['/base/style.js'].functionData[4] = 0;
  _$jscoverage['/base/style.js'].functionData[5] = 0;
  _$jscoverage['/base/style.js'].functionData[6] = 0;
  _$jscoverage['/base/style.js'].functionData[7] = 0;
  _$jscoverage['/base/style.js'].functionData[8] = 0;
  _$jscoverage['/base/style.js'].functionData[9] = 0;
  _$jscoverage['/base/style.js'].functionData[10] = 0;
  _$jscoverage['/base/style.js'].functionData[11] = 0;
  _$jscoverage['/base/style.js'].functionData[12] = 0;
  _$jscoverage['/base/style.js'].functionData[13] = 0;
  _$jscoverage['/base/style.js'].functionData[14] = 0;
  _$jscoverage['/base/style.js'].functionData[15] = 0;
  _$jscoverage['/base/style.js'].functionData[16] = 0;
  _$jscoverage['/base/style.js'].functionData[17] = 0;
  _$jscoverage['/base/style.js'].functionData[18] = 0;
  _$jscoverage['/base/style.js'].functionData[19] = 0;
  _$jscoverage['/base/style.js'].functionData[20] = 0;
  _$jscoverage['/base/style.js'].functionData[21] = 0;
  _$jscoverage['/base/style.js'].functionData[22] = 0;
  _$jscoverage['/base/style.js'].functionData[23] = 0;
  _$jscoverage['/base/style.js'].functionData[24] = 0;
  _$jscoverage['/base/style.js'].functionData[25] = 0;
  _$jscoverage['/base/style.js'].functionData[26] = 0;
  _$jscoverage['/base/style.js'].functionData[27] = 0;
  _$jscoverage['/base/style.js'].functionData[28] = 0;
}
if (! _$jscoverage['/base/style.js'].branchData) {
  _$jscoverage['/base/style.js'].branchData = {};
  _$jscoverage['/base/style.js'].branchData['50'] = [];
  _$jscoverage['/base/style.js'].branchData['50'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['50'][2] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['55'] = [];
  _$jscoverage['/base/style.js'].branchData['55'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['55'][2] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['61'] = [];
  _$jscoverage['/base/style.js'].branchData['61'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['67'] = [];
  _$jscoverage['/base/style.js'].branchData['67'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['84'] = [];
  _$jscoverage['/base/style.js'].branchData['84'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['85'] = [];
  _$jscoverage['/base/style.js'].branchData['85'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['119'] = [];
  _$jscoverage['/base/style.js'].branchData['119'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['122'] = [];
  _$jscoverage['/base/style.js'].branchData['122'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['123'] = [];
  _$jscoverage['/base/style.js'].branchData['123'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['127'] = [];
  _$jscoverage['/base/style.js'].branchData['127'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['127'][2] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['132'] = [];
  _$jscoverage['/base/style.js'].branchData['132'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['164'] = [];
  _$jscoverage['/base/style.js'].branchData['164'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['166'] = [];
  _$jscoverage['/base/style.js'].branchData['166'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['172'] = [];
  _$jscoverage['/base/style.js'].branchData['172'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['174'] = [];
  _$jscoverage['/base/style.js'].branchData['174'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['179'] = [];
  _$jscoverage['/base/style.js'].branchData['179'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['203'] = [];
  _$jscoverage['/base/style.js'].branchData['203'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['205'] = [];
  _$jscoverage['/base/style.js'].branchData['205'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['215'] = [];
  _$jscoverage['/base/style.js'].branchData['215'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['218'] = [];
  _$jscoverage['/base/style.js'].branchData['218'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['220'] = [];
  _$jscoverage['/base/style.js'].branchData['220'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['220'][2] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['220'][3] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['225'] = [];
  _$jscoverage['/base/style.js'].branchData['225'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['229'] = [];
  _$jscoverage['/base/style.js'].branchData['229'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['245'] = [];
  _$jscoverage['/base/style.js'].branchData['245'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['247'] = [];
  _$jscoverage['/base/style.js'].branchData['247'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['249'] = [];
  _$jscoverage['/base/style.js'].branchData['249'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['265'] = [];
  _$jscoverage['/base/style.js'].branchData['265'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['269'] = [];
  _$jscoverage['/base/style.js'].branchData['269'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['270'] = [];
  _$jscoverage['/base/style.js'].branchData['270'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['285'] = [];
  _$jscoverage['/base/style.js'].branchData['285'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['287'] = [];
  _$jscoverage['/base/style.js'].branchData['287'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['304'] = [];
  _$jscoverage['/base/style.js'].branchData['304'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['314'] = [];
  _$jscoverage['/base/style.js'].branchData['314'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['319'] = [];
  _$jscoverage['/base/style.js'].branchData['319'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['328'] = [];
  _$jscoverage['/base/style.js'].branchData['328'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['348'] = [];
  _$jscoverage['/base/style.js'].branchData['348'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['351'] = [];
  _$jscoverage['/base/style.js'].branchData['351'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['353'] = [];
  _$jscoverage['/base/style.js'].branchData['353'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['358'] = [];
  _$jscoverage['/base/style.js'].branchData['358'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['423'] = [];
  _$jscoverage['/base/style.js'].branchData['423'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['428'] = [];
  _$jscoverage['/base/style.js'].branchData['428'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['433'] = [];
  _$jscoverage['/base/style.js'].branchData['433'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['448'] = [];
  _$jscoverage['/base/style.js'].branchData['448'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['464'] = [];
  _$jscoverage['/base/style.js'].branchData['464'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['466'] = [];
  _$jscoverage['/base/style.js'].branchData['466'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['470'] = [];
  _$jscoverage['/base/style.js'].branchData['470'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['471'] = [];
  _$jscoverage['/base/style.js'].branchData['471'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['471'][2] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['475'] = [];
  _$jscoverage['/base/style.js'].branchData['475'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['507'] = [];
  _$jscoverage['/base/style.js'].branchData['507'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['507'][2] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['508'] = [];
  _$jscoverage['/base/style.js'].branchData['508'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['508'][2] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['513'] = [];
  _$jscoverage['/base/style.js'].branchData['513'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['515'] = [];
  _$jscoverage['/base/style.js'].branchData['515'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['517'] = [];
  _$jscoverage['/base/style.js'].branchData['517'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['517'][2] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['517'][3] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['521'] = [];
  _$jscoverage['/base/style.js'].branchData['521'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['524'] = [];
  _$jscoverage['/base/style.js'].branchData['524'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['527'] = [];
  _$jscoverage['/base/style.js'].branchData['527'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['536'] = [];
  _$jscoverage['/base/style.js'].branchData['536'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['536'][2] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['540'] = [];
  _$jscoverage['/base/style.js'].branchData['540'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['543'] = [];
  _$jscoverage['/base/style.js'].branchData['543'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['551'] = [];
  _$jscoverage['/base/style.js'].branchData['551'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['551'][2] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['551'][3] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['557'] = [];
  _$jscoverage['/base/style.js'].branchData['557'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['566'] = [];
  _$jscoverage['/base/style.js'].branchData['566'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['586'] = [];
  _$jscoverage['/base/style.js'].branchData['586'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['587'] = [];
  _$jscoverage['/base/style.js'].branchData['587'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['588'] = [];
  _$jscoverage['/base/style.js'].branchData['588'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['589'] = [];
  _$jscoverage['/base/style.js'].branchData['589'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['591'] = [];
  _$jscoverage['/base/style.js'].branchData['591'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['592'] = [];
  _$jscoverage['/base/style.js'].branchData['592'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['594'] = [];
  _$jscoverage['/base/style.js'].branchData['594'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['595'] = [];
  _$jscoverage['/base/style.js'].branchData['595'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['597'] = [];
  _$jscoverage['/base/style.js'].branchData['597'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['598'] = [];
  _$jscoverage['/base/style.js'].branchData['598'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['600'] = [];
  _$jscoverage['/base/style.js'].branchData['600'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['601'] = [];
  _$jscoverage['/base/style.js'].branchData['601'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['603'] = [];
  _$jscoverage['/base/style.js'].branchData['603'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['613'] = [];
  _$jscoverage['/base/style.js'].branchData['613'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['613'][2] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['613'][3] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['614'] = [];
  _$jscoverage['/base/style.js'].branchData['614'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['617'] = [];
  _$jscoverage['/base/style.js'].branchData['617'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['620'] = [];
  _$jscoverage['/base/style.js'].branchData['620'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['622'] = [];
  _$jscoverage['/base/style.js'].branchData['622'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['623'] = [];
  _$jscoverage['/base/style.js'].branchData['623'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['624'] = [];
  _$jscoverage['/base/style.js'].branchData['624'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['626'] = [];
  _$jscoverage['/base/style.js'].branchData['626'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['627'] = [];
  _$jscoverage['/base/style.js'].branchData['627'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['642'] = [];
  _$jscoverage['/base/style.js'].branchData['642'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['651'] = [];
  _$jscoverage['/base/style.js'].branchData['651'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['652'] = [];
  _$jscoverage['/base/style.js'].branchData['652'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['655'] = [];
  _$jscoverage['/base/style.js'].branchData['655'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['656'] = [];
  _$jscoverage['/base/style.js'].branchData['656'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['667'] = [];
  _$jscoverage['/base/style.js'].branchData['667'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['667'][2] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['668'] = [];
  _$jscoverage['/base/style.js'].branchData['668'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['668'][2] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['669'] = [];
  _$jscoverage['/base/style.js'].branchData['669'][1] = new BranchData();
}
_$jscoverage['/base/style.js'].branchData['669'][1].init(52, 46, 'Dom.css(offsetParent, "position") === "static"');
function visit507_669_1(result) {
  _$jscoverage['/base/style.js'].branchData['669'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['668'][2].init(111, 99, '!ROOT_REG.test(offsetParent.nodeName) && Dom.css(offsetParent, "position") === "static"');
function visit506_668_2(result) {
  _$jscoverage['/base/style.js'].branchData['668'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['668'][1].init(95, 115, 'offsetParent && !ROOT_REG.test(offsetParent.nodeName) && Dom.css(offsetParent, "position") === "static"');
function visit505_668_1(result) {
  _$jscoverage['/base/style.js'].branchData['668'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['667'][2].init(49, 23, 'el.ownerDocument || doc');
function visit504_667_2(result) {
  _$jscoverage['/base/style.js'].branchData['667'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['667'][1].init(28, 50, 'el.offsetParent || (el.ownerDocument || doc).body');
function visit503_667_1(result) {
  _$jscoverage['/base/style.js'].branchData['667'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['656'][1].init(807, 42, 'parseFloat(Dom.css(el, "marginLeft")) || 0');
function visit502_656_1(result) {
  _$jscoverage['/base/style.js'].branchData['656'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['655'][1].init(741, 41, 'parseFloat(Dom.css(el, "marginTop")) || 0');
function visit501_655_1(result) {
  _$jscoverage['/base/style.js'].branchData['655'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['652'][1].init(438, 57, 'parseFloat(Dom.css(offsetParent, "borderLeftWidth")) || 0');
function visit500_652_1(result) {
  _$jscoverage['/base/style.js'].branchData['652'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['651'][1].init(347, 56, 'parseFloat(Dom.css(offsetParent, "borderTopWidth")) || 0');
function visit499_651_1(result) {
  _$jscoverage['/base/style.js'].branchData['651'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['642'][1].init(108, 34, 'Dom.css(el, \'position\') == \'fixed\'');
function visit498_642_1(result) {
  _$jscoverage['/base/style.js'].branchData['642'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['627'][1].init(28, 41, 'parseFloat(Dom.css(elem, extra + w)) || 0');
function visit497_627_1(result) {
  _$jscoverage['/base/style.js'].branchData['627'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['626'][1].init(235, 18, 'extra === \'margin\'');
function visit496_626_1(result) {
  _$jscoverage['/base/style.js'].branchData['626'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['624'][1].init(28, 54, 'parseFloat(Dom.css(elem, \'border\' + w + \'Width\')) || 0');
function visit495_624_1(result) {
  _$jscoverage['/base/style.js'].branchData['624'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['623'][1].init(91, 19, 'extra !== \'padding\'');
function visit494_623_1(result) {
  _$jscoverage['/base/style.js'].branchData['623'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['622'][1].init(24, 45, 'parseFloat(Dom.css(elem, \'padding\' + w)) || 0');
function visit493_622_1(result) {
  _$jscoverage['/base/style.js'].branchData['622'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['620'][1].init(1324, 5, 'extra');
function visit492_620_1(result) {
  _$jscoverage['/base/style.js'].branchData['620'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['617'][1].init(1250, 20, 'parseFloat(val) || 0');
function visit491_617_1(result) {
  _$jscoverage['/base/style.js'].branchData['617'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['614'][1].init(19, 23, 'elem.style[name] || 0');
function visit490_614_1(result) {
  _$jscoverage['/base/style.js'].branchData['614'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['613'][3].init(1110, 16, '(Number(val)) < 0');
function visit489_613_3(result) {
  _$jscoverage['/base/style.js'].branchData['613'][3].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['613'][2].init(1094, 11, 'val == null');
function visit488_613_2(result) {
  _$jscoverage['/base/style.js'].branchData['613'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['613'][1].init(1094, 32, 'val == null || (Number(val)) < 0');
function visit487_613_1(result) {
  _$jscoverage['/base/style.js'].branchData['613'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['603'][1].init(32, 54, 'parseFloat(Dom.css(elem, \'border\' + w + \'Width\')) || 0');
function visit486_603_1(result) {
  _$jscoverage['/base/style.js'].branchData['603'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['601'][1].init(32, 41, 'parseFloat(Dom.css(elem, extra + w)) || 0');
function visit485_601_1(result) {
  _$jscoverage['/base/style.js'].branchData['601'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['600'][1].init(159, 18, 'extra === \'margin\'');
function visit484_600_1(result) {
  _$jscoverage['/base/style.js'].branchData['600'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['598'][1].init(32, 45, 'parseFloat(Dom.css(elem, \'padding\' + w)) || 0');
function visit483_598_1(result) {
  _$jscoverage['/base/style.js'].branchData['598'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['597'][1].init(25, 6, '!extra');
function visit482_597_1(result) {
  _$jscoverage['/base/style.js'].branchData['597'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['595'][1].init(17, 18, 'extra !== \'border\'');
function visit481_595_1(result) {
  _$jscoverage['/base/style.js'].branchData['595'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['594'][1].init(410, 7, 'val > 0');
function visit480_594_1(result) {
  _$jscoverage['/base/style.js'].branchData['594'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['592'][1].init(85, 14, 'name === WIDTH');
function visit479_592_1(result) {
  _$jscoverage['/base/style.js'].branchData['592'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['591'][1].init(268, 14, 'name === WIDTH');
function visit478_591_1(result) {
  _$jscoverage['/base/style.js'].branchData['591'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['589'][1].init(20, 13, 'name == WIDTH');
function visit477_589_1(result) {
  _$jscoverage['/base/style.js'].branchData['589'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['588'][1].init(140, 18, 'elem.nodeType == 9');
function visit476_588_1(result) {
  _$jscoverage['/base/style.js'].branchData['588'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['587'][1].init(20, 13, 'name == WIDTH');
function visit475_587_1(result) {
  _$jscoverage['/base/style.js'].branchData['587'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['586'][1].init(13, 16, 'S.isWindow(elem)');
function visit474_586_1(result) {
  _$jscoverage['/base/style.js'].branchData['586'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['566'][1].init(124, 22, 'elem.offsetWidth !== 0');
function visit473_566_1(result) {
  _$jscoverage['/base/style.js'].branchData['566'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['557'][1].init(327, 17, 'ret === undefined');
function visit472_557_1(result) {
  _$jscoverage['/base/style.js'].branchData['557'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['551'][3].init(119, 42, '(ret = hook.get(elem, false)) !== undefined');
function visit471_551_3(result) {
  _$jscoverage['/base/style.js'].branchData['551'][3].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['551'][2].init(101, 60, '\'get\' in hook && (ret = hook.get(elem, false)) !== undefined');
function visit470_551_2(result) {
  _$jscoverage['/base/style.js'].branchData['551'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['551'][1].init(93, 68, 'hook && \'get\' in hook && (ret = hook.get(elem, false)) !== undefined');
function visit469_551_1(result) {
  _$jscoverage['/base/style.js'].branchData['551'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['543'][1].init(133, 37, 'UA.webkit && (style = elem.outerHTML)');
function visit468_543_1(result) {
  _$jscoverage['/base/style.js'].branchData['543'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['540'][1].init(851, 14, '!style.cssText');
function visit467_540_1(result) {
  _$jscoverage['/base/style.js'].branchData['540'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['536'][2].init(299, 13, 'val === EMPTY');
function visit466_536_2(result) {
  _$jscoverage['/base/style.js'].branchData['536'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['536'][1].init(299, 38, 'val === EMPTY && style.removeAttribute');
function visit465_536_1(result) {
  _$jscoverage['/base/style.js'].branchData['536'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['527'][1].init(393, 17, 'val !== undefined');
function visit464_527_1(result) {
  _$jscoverage['/base/style.js'].branchData['527'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['524'][1].init(300, 16, 'hook && hook.set');
function visit463_524_1(result) {
  _$jscoverage['/base/style.js'].branchData['524'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['521'][1].init(191, 39, '!isNaN(Number(val)) && !cssNumber[name]');
function visit462_521_1(result) {
  _$jscoverage['/base/style.js'].branchData['521'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['517'][3].init(64, 13, 'val === EMPTY');
function visit461_517_3(result) {
  _$jscoverage['/base/style.js'].branchData['517'][3].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['517'][2].init(48, 12, 'val === null');
function visit460_517_2(result) {
  _$jscoverage['/base/style.js'].branchData['517'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['517'][1].init(48, 29, 'val === null || val === EMPTY');
function visit459_517_1(result) {
  _$jscoverage['/base/style.js'].branchData['517'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['515'][1].init(322, 17, 'val !== undefined');
function visit458_515_1(result) {
  _$jscoverage['/base/style.js'].branchData['515'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['513'][1].init(268, 22, 'cssProps[name] || name');
function visit457_513_1(result) {
  _$jscoverage['/base/style.js'].branchData['513'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['508'][2].init(104, 19, 'elem.nodeType === 8');
function visit456_508_2(result) {
  _$jscoverage['/base/style.js'].branchData['508'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['508'][1].init(34, 44, 'elem.nodeType === 8 || !(style = elem.style)');
function visit455_508_1(result) {
  _$jscoverage['/base/style.js'].branchData['508'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['507'][2].init(67, 19, 'elem.nodeType === 3');
function visit454_507_2(result) {
  _$jscoverage['/base/style.js'].branchData['507'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['507'][1].init(67, 79, 'elem.nodeType === 3 || elem.nodeType === 8 || !(style = elem.style)');
function visit453_507_1(result) {
  _$jscoverage['/base/style.js'].branchData['507'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['475'][1].init(501, 37, 'isAutoPosition || NO_PX_REG.test(val)');
function visit452_475_1(result) {
  _$jscoverage['/base/style.js'].branchData['475'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['471'][2].init(321, 23, 'position === "relative"');
function visit451_471_2(result) {
  _$jscoverage['/base/style.js'].branchData['471'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['471'][1].init(303, 41, 'isAutoPosition && position === "relative"');
function visit450_471_1(result) {
  _$jscoverage['/base/style.js'].branchData['471'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['470'][1].init(263, 14, 'val === "auto"');
function visit449_470_1(result) {
  _$jscoverage['/base/style.js'].branchData['470'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['466'][1].init(81, 21, 'position === "static"');
function visit448_466_1(result) {
  _$jscoverage['/base/style.js'].branchData['466'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['464'][1].init(112, 8, 'computed');
function visit447_464_1(result) {
  _$jscoverage['/base/style.js'].branchData['464'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['448'][1].init(46, 8, 'computed');
function visit446_448_1(result) {
  _$jscoverage['/base/style.js'].branchData['448'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['433'][1].init(69, 3, 'ret');
function visit445_433_1(result) {
  _$jscoverage['/base/style.js'].branchData['433'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['428'][1].init(60, 71, 'el && getWHIgnoreDisplay(el, name, includeMargin ? \'margin\' : \'border\')');
function visit444_428_1(result) {
  _$jscoverage['/base/style.js'].branchData['428'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['423'][1].init(60, 45, 'el && getWHIgnoreDisplay(el, name, \'padding\')');
function visit443_423_1(result) {
  _$jscoverage['/base/style.js'].branchData['423'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['358'][1].init(33, 36, '!S.inArray(getNodeName(e), excludes)');
function visit442_358_1(result) {
  _$jscoverage['/base/style.js'].branchData['358'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['353'][1].init(229, 5, 'UA.ie');
function visit441_353_1(result) {
  _$jscoverage['/base/style.js'].branchData['353'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['351'][1].init(101, 32, 'userSelectProperty !== undefined');
function visit440_351_1(result) {
  _$jscoverage['/base/style.js'].branchData['351'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['348'][1].init(272, 6, 'j >= 0');
function visit439_348_1(result) {
  _$jscoverage['/base/style.js'].branchData['348'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['328'][1].init(745, 15, 'elem.styleSheet');
function visit438_328_1(result) {
  _$jscoverage['/base/style.js'].branchData['328'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['319'][1].init(488, 4, 'elem');
function visit437_319_1(result) {
  _$jscoverage['/base/style.js'].branchData['319'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['314'][1].init(328, 35, 'id && (id = id.replace(\'#\', EMPTY))');
function visit436_314_1(result) {
  _$jscoverage['/base/style.js'].branchData['314'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['304'][1].init(21, 25, 'typeof refWin == \'string\'');
function visit435_304_1(result) {
  _$jscoverage['/base/style.js'].branchData['304'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['287'][1].init(60, 31, 'Dom.css(elem, DISPLAY) === NONE');
function visit434_287_1(result) {
  _$jscoverage['/base/style.js'].branchData['287'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['285'][1].init(118, 6, 'i >= 0');
function visit433_285_1(result) {
  _$jscoverage['/base/style.js'].branchData['285'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['270'][1].init(29, 3, 'old');
function visit432_270_1(result) {
  _$jscoverage['/base/style.js'].branchData['270'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['269'][1].init(150, 12, 'old !== NONE');
function visit431_269_1(result) {
  _$jscoverage['/base/style.js'].branchData['269'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['265'][1].init(118, 6, 'i >= 0');
function visit430_265_1(result) {
  _$jscoverage['/base/style.js'].branchData['265'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['249'][1].init(201, 31, 'Dom.css(elem, DISPLAY) === NONE');
function visit429_249_1(result) {
  _$jscoverage['/base/style.js'].branchData['249'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['247'][1].init(78, 36, 'Dom.data(elem, OLD_DISPLAY) || EMPTY');
function visit428_247_1(result) {
  _$jscoverage['/base/style.js'].branchData['247'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['245'][1].init(172, 6, 'i >= 0');
function visit427_245_1(result) {
  _$jscoverage['/base/style.js'].branchData['245'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['229'][1].init(46, 6, 'i >= 0');
function visit426_229_1(result) {
  _$jscoverage['/base/style.js'].branchData['229'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['225'][1].init(483, 25, 'typeof ret == \'undefined\'');
function visit425_225_1(result) {
  _$jscoverage['/base/style.js'].branchData['225'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['220'][3].init(139, 41, '(ret = hook.get(elem, true)) !== undefined');
function visit424_220_3(result) {
  _$jscoverage['/base/style.js'].branchData['220'][3].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['220'][2].init(121, 59, '\'get\' in hook && (ret = hook.get(elem, true)) !== undefined');
function visit423_220_2(result) {
  _$jscoverage['/base/style.js'].branchData['220'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['220'][1].init(113, 67, 'hook && \'get\' in hook && (ret = hook.get(elem, true)) !== undefined');
function visit422_220_1(result) {
  _$jscoverage['/base/style.js'].branchData['220'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['218'][1].init(114, 4, 'elem');
function visit421_218_1(result) {
  _$jscoverage['/base/style.js'].branchData['218'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['215'][1].init(645, 17, 'val === undefined');
function visit420_215_1(result) {
  _$jscoverage['/base/style.js'].branchData['215'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['205'][1].init(50, 6, 'i >= 0');
function visit419_205_1(result) {
  _$jscoverage['/base/style.js'].branchData['205'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['203'][1].init(233, 21, 'S.isPlainObject(name)');
function visit418_203_1(result) {
  _$jscoverage['/base/style.js'].branchData['203'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['179'][1].init(46, 6, 'i >= 0');
function visit417_179_1(result) {
  _$jscoverage['/base/style.js'].branchData['179'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['174'][1].init(55, 4, 'elem');
function visit416_174_1(result) {
  _$jscoverage['/base/style.js'].branchData['174'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['172'][1].init(493, 17, 'val === undefined');
function visit415_172_1(result) {
  _$jscoverage['/base/style.js'].branchData['172'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['166'][1].init(50, 6, 'i >= 0');
function visit414_166_1(result) {
  _$jscoverage['/base/style.js'].branchData['166'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['164'][1].init(187, 21, 'S.isPlainObject(name)');
function visit413_164_1(result) {
  _$jscoverage['/base/style.js'].branchData['164'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['132'][1].init(768, 51, 'Dom._RE_NUM_NO_PX.test(val) && RE_MARGIN.test(name)');
function visit412_132_1(result) {
  _$jscoverage['/base/style.js'].branchData['132'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['127'][2].init(585, 10, 'val === \'\'');
function visit411_127_2(result) {
  _$jscoverage['/base/style.js'].branchData['127'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['127'][1].init(585, 36, 'val === \'\' && !Dom.contains(d, elem)');
function visit410_127_1(result) {
  _$jscoverage['/base/style.js'].branchData['127'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['123'][1].init(27, 59, 'computedStyle.getPropertyValue(name) || computedStyle[name]');
function visit409_123_1(result) {
  _$jscoverage['/base/style.js'].branchData['123'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['122'][1].init(357, 58, 'computedStyle = d.defaultView.getComputedStyle(elem, null)');
function visit408_122_1(result) {
  _$jscoverage['/base/style.js'].branchData['122'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['119'][1].init(248, 22, 'cssProps[name] || name');
function visit407_119_1(result) {
  _$jscoverage['/base/style.js'].branchData['119'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['85'][1].init(20, 31, 'doc.body || doc.documentElement');
function visit406_85_1(result) {
  _$jscoverage['/base/style.js'].branchData['85'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['84'][1].init(101, 26, '!defaultDisplay[tagName]');
function visit405_84_1(result) {
  _$jscoverage['/base/style.js'].branchData['84'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['67'][1].init(1657, 32, 'Features.isTransitionSupported()');
function visit404_67_1(result) {
  _$jscoverage['/base/style.js'].branchData['67'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['61'][1].init(1453, 31, 'Features.isTransformSupported()');
function visit403_61_1(result) {
  _$jscoverage['/base/style.js'].branchData['61'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['55'][2].init(79, 32, 'userSelectProperty === undefined');
function visit402_55_2(result) {
  _$jscoverage['/base/style.js'].branchData['55'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['55'][1].init(79, 82, 'userSelectProperty === undefined && userSelect in documentElementStyle');
function visit401_55_1(result) {
  _$jscoverage['/base/style.js'].branchData['55'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['50'][2].init(1111, 32, 'doc && doc.documentElement.style');
function visit400_50_2(result) {
  _$jscoverage['/base/style.js'].branchData['50'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['50'][1].init(1111, 38, 'doc && doc.documentElement.style || {}');
function visit399_50_1(result) {
  _$jscoverage['/base/style.js'].branchData['50'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/base/style.js'].functionData[0]++;
  _$jscoverage['/base/style.js'].lineData[7]++;
  var Dom = require('./api');
  _$jscoverage['/base/style.js'].lineData[8]++;
  var logger = S.getLogger('s/dom');
  _$jscoverage['/base/style.js'].lineData[9]++;
  var globalWindow = S.Env.host, UA = S.UA, undefined = undefined, Features = S.Features, getNodeName = Dom.nodeName, doc = globalWindow.document, RE_MARGIN = /^margin/, WIDTH = 'width', HEIGHT = 'height', DISPLAY = 'display', OLD_DISPLAY = DISPLAY + S.now(), NONE = 'none', cssNumber = {
  'fillOpacity': 1, 
  'fontWeight': 1, 
  'lineHeight': 1, 
  'opacity': 1, 
  'orphans': 1, 
  'widows': 1, 
  'zIndex': 1, 
  'zoom': 1}, rmsPrefix = /^-ms-/, EMPTY = '', DEFAULT_UNIT = 'px', NO_PX_REG = /\d(?!px)[a-z%]+$/i, cssHooks = {}, cssProps = {
  'float': 'cssFloat'}, defaultDisplay = {}, RE_DASH = /-([a-z])/ig;
  _$jscoverage['/base/style.js'].lineData[42]++;
  var VENDORS = ['', 'Webkit', 'Moz', 'O', 'ms'];
  _$jscoverage['/base/style.js'].lineData[50]++;
  var documentElementStyle = visit399_50_1(visit400_50_2(doc && doc.documentElement.style) || {});
  _$jscoverage['/base/style.js'].lineData[52]++;
  var userSelectProperty;
  _$jscoverage['/base/style.js'].lineData[53]++;
  S.each(VENDORS, function(val) {
  _$jscoverage['/base/style.js'].functionData[1]++;
  _$jscoverage['/base/style.js'].lineData[54]++;
  var userSelect = val ? val + 'UserSelect' : 'userSelect';
  _$jscoverage['/base/style.js'].lineData[55]++;
  if (visit401_55_1(visit402_55_2(userSelectProperty === undefined) && userSelect in documentElementStyle)) {
    _$jscoverage['/base/style.js'].lineData[57]++;
    userSelectProperty = userSelect;
  }
});
  _$jscoverage['/base/style.js'].lineData[61]++;
  if (visit403_61_1(Features.isTransformSupported())) {
    _$jscoverage['/base/style.js'].lineData[62]++;
    var transform;
    _$jscoverage['/base/style.js'].lineData[63]++;
    transform = cssProps.transform = Features.getTransformProperty();
    _$jscoverage['/base/style.js'].lineData[64]++;
    cssProps.transformOrigin = transform + 'Origin';
  }
  _$jscoverage['/base/style.js'].lineData[67]++;
  if (visit404_67_1(Features.isTransitionSupported())) {
    _$jscoverage['/base/style.js'].lineData[68]++;
    cssProps.transition = Features.getTransitionProperty();
  }
  _$jscoverage['/base/style.js'].lineData[71]++;
  function upperCase() {
    _$jscoverage['/base/style.js'].functionData[2]++;
    _$jscoverage['/base/style.js'].lineData[72]++;
    return arguments[1].toUpperCase();
  }
  _$jscoverage['/base/style.js'].lineData[75]++;
  function camelCase(name) {
    _$jscoverage['/base/style.js'].functionData[3]++;
    _$jscoverage['/base/style.js'].lineData[77]++;
    return name.replace(rmsPrefix, 'ms-').replace(RE_DASH, upperCase);
  }
  _$jscoverage['/base/style.js'].lineData[80]++;
  function getDefaultDisplay(tagName) {
    _$jscoverage['/base/style.js'].functionData[4]++;
    _$jscoverage['/base/style.js'].lineData[81]++;
    var body, oldDisplay = defaultDisplay[tagName], elem;
    _$jscoverage['/base/style.js'].lineData[84]++;
    if (visit405_84_1(!defaultDisplay[tagName])) {
      _$jscoverage['/base/style.js'].lineData[85]++;
      body = visit406_85_1(doc.body || doc.documentElement);
      _$jscoverage['/base/style.js'].lineData[86]++;
      elem = doc.createElement(tagName);
      _$jscoverage['/base/style.js'].lineData[88]++;
      Dom.prepend(elem, body);
      _$jscoverage['/base/style.js'].lineData[89]++;
      oldDisplay = Dom.css(elem, 'display');
      _$jscoverage['/base/style.js'].lineData[90]++;
      body.removeChild(elem);
      _$jscoverage['/base/style.js'].lineData[92]++;
      defaultDisplay[tagName] = oldDisplay;
    }
    _$jscoverage['/base/style.js'].lineData[94]++;
    return oldDisplay;
  }
  _$jscoverage['/base/style.js'].lineData[97]++;
  S.mix(Dom, {
  _camelCase: camelCase, 
  _cssHooks: cssHooks, 
  _cssProps: cssProps, 
  _getComputedStyle: function(elem, name) {
  _$jscoverage['/base/style.js'].functionData[5]++;
  _$jscoverage['/base/style.js'].lineData[111]++;
  var val = '', computedStyle, width, minWidth, maxWidth, style, d = elem.ownerDocument;
  _$jscoverage['/base/style.js'].lineData[119]++;
  name = visit407_119_1(cssProps[name] || name);
  _$jscoverage['/base/style.js'].lineData[122]++;
  if (visit408_122_1(computedStyle = d.defaultView.getComputedStyle(elem, null))) {
    _$jscoverage['/base/style.js'].lineData[123]++;
    val = visit409_123_1(computedStyle.getPropertyValue(name) || computedStyle[name]);
  }
  _$jscoverage['/base/style.js'].lineData[127]++;
  if (visit410_127_1(visit411_127_2(val === '') && !Dom.contains(d, elem))) {
    _$jscoverage['/base/style.js'].lineData[128]++;
    val = elem.style[name];
  }
  _$jscoverage['/base/style.js'].lineData[132]++;
  if (visit412_132_1(Dom._RE_NUM_NO_PX.test(val) && RE_MARGIN.test(name))) {
    _$jscoverage['/base/style.js'].lineData[133]++;
    style = elem.style;
    _$jscoverage['/base/style.js'].lineData[134]++;
    width = style.width;
    _$jscoverage['/base/style.js'].lineData[135]++;
    minWidth = style.minWidth;
    _$jscoverage['/base/style.js'].lineData[136]++;
    maxWidth = style.maxWidth;
    _$jscoverage['/base/style.js'].lineData[138]++;
    style.minWidth = style.maxWidth = style.width = val;
    _$jscoverage['/base/style.js'].lineData[139]++;
    val = computedStyle.width;
    _$jscoverage['/base/style.js'].lineData[141]++;
    style.width = width;
    _$jscoverage['/base/style.js'].lineData[142]++;
    style.minWidth = minWidth;
    _$jscoverage['/base/style.js'].lineData[143]++;
    style.maxWidth = maxWidth;
  }
  _$jscoverage['/base/style.js'].lineData[146]++;
  return val;
}, 
  style: function(selector, name, val) {
  _$jscoverage['/base/style.js'].functionData[6]++;
  _$jscoverage['/base/style.js'].lineData[159]++;
  var els = Dom.query(selector), k, ret, elem = els[0], i;
  _$jscoverage['/base/style.js'].lineData[164]++;
  if (visit413_164_1(S.isPlainObject(name))) {
    _$jscoverage['/base/style.js'].lineData[165]++;
    for (k in name) {
      _$jscoverage['/base/style.js'].lineData[166]++;
      for (i = els.length - 1; visit414_166_1(i >= 0); i--) {
        _$jscoverage['/base/style.js'].lineData[167]++;
        style(els[i], k, name[k]);
      }
    }
    _$jscoverage['/base/style.js'].lineData[170]++;
    return undefined;
  }
  _$jscoverage['/base/style.js'].lineData[172]++;
  if (visit415_172_1(val === undefined)) {
    _$jscoverage['/base/style.js'].lineData[173]++;
    ret = '';
    _$jscoverage['/base/style.js'].lineData[174]++;
    if (visit416_174_1(elem)) {
      _$jscoverage['/base/style.js'].lineData[175]++;
      ret = style(elem, name, val);
    }
    _$jscoverage['/base/style.js'].lineData[177]++;
    return ret;
  } else {
    _$jscoverage['/base/style.js'].lineData[179]++;
    for (i = els.length - 1; visit417_179_1(i >= 0); i--) {
      _$jscoverage['/base/style.js'].lineData[180]++;
      style(els[i], name, val);
    }
  }
  _$jscoverage['/base/style.js'].lineData[183]++;
  return undefined;
}, 
  css: function(selector, name, val) {
  _$jscoverage['/base/style.js'].functionData[7]++;
  _$jscoverage['/base/style.js'].lineData[196]++;
  var els = Dom.query(selector), elem = els[0], k, hook, ret, i;
  _$jscoverage['/base/style.js'].lineData[203]++;
  if (visit418_203_1(S.isPlainObject(name))) {
    _$jscoverage['/base/style.js'].lineData[204]++;
    for (k in name) {
      _$jscoverage['/base/style.js'].lineData[205]++;
      for (i = els.length - 1; visit419_205_1(i >= 0); i--) {
        _$jscoverage['/base/style.js'].lineData[206]++;
        style(els[i], k, name[k]);
      }
    }
    _$jscoverage['/base/style.js'].lineData[209]++;
    return undefined;
  }
  _$jscoverage['/base/style.js'].lineData[212]++;
  name = camelCase(name);
  _$jscoverage['/base/style.js'].lineData[213]++;
  hook = cssHooks[name];
  _$jscoverage['/base/style.js'].lineData[215]++;
  if (visit420_215_1(val === undefined)) {
    _$jscoverage['/base/style.js'].lineData[217]++;
    ret = '';
    _$jscoverage['/base/style.js'].lineData[218]++;
    if (visit421_218_1(elem)) {
      _$jscoverage['/base/style.js'].lineData[220]++;
      if (visit422_220_1(hook && visit423_220_2('get' in hook && visit424_220_3((ret = hook.get(elem, true)) !== undefined)))) {
      } else {
        _$jscoverage['/base/style.js'].lineData[222]++;
        ret = Dom._getComputedStyle(elem, name);
      }
    }
    _$jscoverage['/base/style.js'].lineData[225]++;
    return (visit425_225_1(typeof ret == 'undefined')) ? '' : ret;
  } else {
    _$jscoverage['/base/style.js'].lineData[229]++;
    for (i = els.length - 1; visit426_229_1(i >= 0); i--) {
      _$jscoverage['/base/style.js'].lineData[230]++;
      style(els[i], name, val);
    }
  }
  _$jscoverage['/base/style.js'].lineData[233]++;
  return undefined;
}, 
  show: function(selector) {
  _$jscoverage['/base/style.js'].functionData[8]++;
  _$jscoverage['/base/style.js'].lineData[241]++;
  var els = Dom.query(selector), tagName, old, elem, i;
  _$jscoverage['/base/style.js'].lineData[245]++;
  for (i = els.length - 1; visit427_245_1(i >= 0); i--) {
    _$jscoverage['/base/style.js'].lineData[246]++;
    elem = els[i];
    _$jscoverage['/base/style.js'].lineData[247]++;
    elem.style[DISPLAY] = visit428_247_1(Dom.data(elem, OLD_DISPLAY) || EMPTY);
    _$jscoverage['/base/style.js'].lineData[249]++;
    if (visit429_249_1(Dom.css(elem, DISPLAY) === NONE)) {
      _$jscoverage['/base/style.js'].lineData[250]++;
      tagName = elem.tagName.toLowerCase();
      _$jscoverage['/base/style.js'].lineData[251]++;
      old = getDefaultDisplay(tagName);
      _$jscoverage['/base/style.js'].lineData[252]++;
      Dom.data(elem, OLD_DISPLAY, old);
      _$jscoverage['/base/style.js'].lineData[253]++;
      elem.style[DISPLAY] = old;
    }
  }
}, 
  hide: function(selector) {
  _$jscoverage['/base/style.js'].functionData[9]++;
  _$jscoverage['/base/style.js'].lineData[263]++;
  var els = Dom.query(selector), elem, i;
  _$jscoverage['/base/style.js'].lineData[265]++;
  for (i = els.length - 1; visit430_265_1(i >= 0); i--) {
    _$jscoverage['/base/style.js'].lineData[266]++;
    elem = els[i];
    _$jscoverage['/base/style.js'].lineData[267]++;
    var style = elem.style, old = style[DISPLAY];
    _$jscoverage['/base/style.js'].lineData[269]++;
    if (visit431_269_1(old !== NONE)) {
      _$jscoverage['/base/style.js'].lineData[270]++;
      if (visit432_270_1(old)) {
        _$jscoverage['/base/style.js'].lineData[271]++;
        Dom.data(elem, OLD_DISPLAY, old);
      }
      _$jscoverage['/base/style.js'].lineData[273]++;
      style[DISPLAY] = NONE;
    }
  }
}, 
  toggle: function(selector) {
  _$jscoverage['/base/style.js'].functionData[10]++;
  _$jscoverage['/base/style.js'].lineData[283]++;
  var els = Dom.query(selector), elem, i;
  _$jscoverage['/base/style.js'].lineData[285]++;
  for (i = els.length - 1; visit433_285_1(i >= 0); i--) {
    _$jscoverage['/base/style.js'].lineData[286]++;
    elem = els[i];
    _$jscoverage['/base/style.js'].lineData[287]++;
    if (visit434_287_1(Dom.css(elem, DISPLAY) === NONE)) {
      _$jscoverage['/base/style.js'].lineData[288]++;
      Dom.show(elem);
    } else {
      _$jscoverage['/base/style.js'].lineData[290]++;
      Dom.hide(elem);
    }
  }
}, 
  addStyleSheet: function(refWin, cssText, id) {
  _$jscoverage['/base/style.js'].functionData[11]++;
  _$jscoverage['/base/style.js'].lineData[304]++;
  if (visit435_304_1(typeof refWin == 'string')) {
    _$jscoverage['/base/style.js'].lineData[305]++;
    id = cssText;
    _$jscoverage['/base/style.js'].lineData[306]++;
    cssText = refWin;
    _$jscoverage['/base/style.js'].lineData[308]++;
    refWin = globalWindow;
  }
  _$jscoverage['/base/style.js'].lineData[311]++;
  var doc = Dom.getDocument(refWin), elem;
  _$jscoverage['/base/style.js'].lineData[314]++;
  if (visit436_314_1(id && (id = id.replace('#', EMPTY)))) {
    _$jscoverage['/base/style.js'].lineData[315]++;
    elem = Dom.get('#' + id, doc);
  }
  _$jscoverage['/base/style.js'].lineData[319]++;
  if (visit437_319_1(elem)) {
    _$jscoverage['/base/style.js'].lineData[320]++;
    return;
  }
  _$jscoverage['/base/style.js'].lineData[323]++;
  elem = Dom.create('<style>', {
  id: id}, doc);
  _$jscoverage['/base/style.js'].lineData[326]++;
  Dom.get('head', doc).appendChild(elem);
  _$jscoverage['/base/style.js'].lineData[328]++;
  if (visit438_328_1(elem.styleSheet)) {
    _$jscoverage['/base/style.js'].lineData[329]++;
    elem.styleSheet.cssText = cssText;
  } else {
    _$jscoverage['/base/style.js'].lineData[331]++;
    elem.appendChild(doc.createTextNode(cssText));
  }
}, 
  unselectable: function(selector) {
  _$jscoverage['/base/style.js'].functionData[12]++;
  _$jscoverage['/base/style.js'].lineData[340]++;
  var _els = Dom.query(selector), elem, j, e, i = 0, excludes, style, els;
  _$jscoverage['/base/style.js'].lineData[348]++;
  for (j = _els.length - 1; visit439_348_1(j >= 0); j--) {
    _$jscoverage['/base/style.js'].lineData[349]++;
    elem = _els[j];
    _$jscoverage['/base/style.js'].lineData[350]++;
    style = elem.style;
    _$jscoverage['/base/style.js'].lineData[351]++;
    if (visit440_351_1(userSelectProperty !== undefined)) {
      _$jscoverage['/base/style.js'].lineData[352]++;
      style[userSelectProperty] = 'none';
    } else {
      _$jscoverage['/base/style.js'].lineData[353]++;
      if (visit441_353_1(UA.ie)) {
        _$jscoverage['/base/style.js'].lineData[354]++;
        els = elem.getElementsByTagName('*');
        _$jscoverage['/base/style.js'].lineData[355]++;
        elem.setAttribute('unselectable', 'on');
        _$jscoverage['/base/style.js'].lineData[356]++;
        excludes = ['iframe', 'textarea', 'input', 'select'];
        _$jscoverage['/base/style.js'].lineData[357]++;
        while (e = els[i++]) {
          _$jscoverage['/base/style.js'].lineData[358]++;
          if (visit442_358_1(!S.inArray(getNodeName(e), excludes))) {
            _$jscoverage['/base/style.js'].lineData[359]++;
            e.setAttribute('unselectable', 'on');
          }
        }
      }
    }
  }
}, 
  innerWidth: 0, 
  innerHeight: 0, 
  outerWidth: 0, 
  outerHeight: 0, 
  width: 0, 
  height: 0});
  _$jscoverage['/base/style.js'].lineData[420]++;
  S.each([WIDTH, HEIGHT], function(name) {
  _$jscoverage['/base/style.js'].functionData[13]++;
  _$jscoverage['/base/style.js'].lineData[421]++;
  Dom['inner' + S.ucfirst(name)] = function(selector) {
  _$jscoverage['/base/style.js'].functionData[14]++;
  _$jscoverage['/base/style.js'].lineData[422]++;
  var el = Dom.get(selector);
  _$jscoverage['/base/style.js'].lineData[423]++;
  return visit443_423_1(el && getWHIgnoreDisplay(el, name, 'padding'));
};
  _$jscoverage['/base/style.js'].lineData[426]++;
  Dom['outer' + S.ucfirst(name)] = function(selector, includeMargin) {
  _$jscoverage['/base/style.js'].functionData[15]++;
  _$jscoverage['/base/style.js'].lineData[427]++;
  var el = Dom.get(selector);
  _$jscoverage['/base/style.js'].lineData[428]++;
  return visit444_428_1(el && getWHIgnoreDisplay(el, name, includeMargin ? 'margin' : 'border'));
};
  _$jscoverage['/base/style.js'].lineData[431]++;
  Dom[name] = function(selector, val) {
  _$jscoverage['/base/style.js'].functionData[16]++;
  _$jscoverage['/base/style.js'].lineData[432]++;
  var ret = Dom.css(selector, name, val);
  _$jscoverage['/base/style.js'].lineData[433]++;
  if (visit445_433_1(ret)) {
    _$jscoverage['/base/style.js'].lineData[434]++;
    ret = parseFloat(ret);
  }
  _$jscoverage['/base/style.js'].lineData[436]++;
  return ret;
};
  _$jscoverage['/base/style.js'].lineData[442]++;
  cssHooks[name] = {
  get: function(elem, computed) {
  _$jscoverage['/base/style.js'].functionData[17]++;
  _$jscoverage['/base/style.js'].lineData[447]++;
  var val;
  _$jscoverage['/base/style.js'].lineData[448]++;
  if (visit446_448_1(computed)) {
    _$jscoverage['/base/style.js'].lineData[449]++;
    val = getWHIgnoreDisplay(elem, name) + 'px';
  }
  _$jscoverage['/base/style.js'].lineData[451]++;
  return val;
}};
});
  _$jscoverage['/base/style.js'].lineData[456]++;
  var cssShow = {
  position: 'absolute', 
  visibility: 'hidden', 
  display: 'block'};
  _$jscoverage['/base/style.js'].lineData[458]++;
  S.each(['left', 'top'], function(name) {
  _$jscoverage['/base/style.js'].functionData[18]++;
  _$jscoverage['/base/style.js'].lineData[459]++;
  cssHooks[name] = {
  get: function(el, computed) {
  _$jscoverage['/base/style.js'].functionData[19]++;
  _$jscoverage['/base/style.js'].lineData[461]++;
  var val, isAutoPosition, position;
  _$jscoverage['/base/style.js'].lineData[464]++;
  if (visit447_464_1(computed)) {
    _$jscoverage['/base/style.js'].lineData[465]++;
    position = Dom.css(el, 'position');
    _$jscoverage['/base/style.js'].lineData[466]++;
    if (visit448_466_1(position === "static")) {
      _$jscoverage['/base/style.js'].lineData[467]++;
      return "auto";
    }
    _$jscoverage['/base/style.js'].lineData[469]++;
    val = Dom._getComputedStyle(el, name);
    _$jscoverage['/base/style.js'].lineData[470]++;
    isAutoPosition = visit449_470_1(val === "auto");
    _$jscoverage['/base/style.js'].lineData[471]++;
    if (visit450_471_1(isAutoPosition && visit451_471_2(position === "relative"))) {
      _$jscoverage['/base/style.js'].lineData[472]++;
      return "0px";
    }
    _$jscoverage['/base/style.js'].lineData[475]++;
    if (visit452_475_1(isAutoPosition || NO_PX_REG.test(val))) {
      _$jscoverage['/base/style.js'].lineData[476]++;
      val = getPosition(el)[name] + 'px';
    }
  }
  _$jscoverage['/base/style.js'].lineData[479]++;
  return val;
}};
});
  _$jscoverage['/base/style.js'].lineData[484]++;
  function swap(elem, options, callback) {
    _$jscoverage['/base/style.js'].functionData[20]++;
    _$jscoverage['/base/style.js'].lineData[485]++;
    var old = {}, style = elem.style, name;
    _$jscoverage['/base/style.js'].lineData[490]++;
    for (name in options) {
      _$jscoverage['/base/style.js'].lineData[491]++;
      old[name] = style[name];
      _$jscoverage['/base/style.js'].lineData[492]++;
      style[name] = options[name];
    }
    _$jscoverage['/base/style.js'].lineData[495]++;
    callback.call(elem);
    _$jscoverage['/base/style.js'].lineData[498]++;
    for (name in options) {
      _$jscoverage['/base/style.js'].lineData[499]++;
      style[name] = old[name];
    }
  }
  _$jscoverage['/base/style.js'].lineData[503]++;
  function style(elem, name, val) {
    _$jscoverage['/base/style.js'].functionData[21]++;
    _$jscoverage['/base/style.js'].lineData[504]++;
    var style, ret, hook;
    _$jscoverage['/base/style.js'].lineData[507]++;
    if (visit453_507_1(visit454_507_2(elem.nodeType === 3) || visit455_508_1(visit456_508_2(elem.nodeType === 8) || !(style = elem.style)))) {
      _$jscoverage['/base/style.js'].lineData[509]++;
      return undefined;
    }
    _$jscoverage['/base/style.js'].lineData[511]++;
    name = camelCase(name);
    _$jscoverage['/base/style.js'].lineData[512]++;
    hook = cssHooks[name];
    _$jscoverage['/base/style.js'].lineData[513]++;
    name = visit457_513_1(cssProps[name] || name);
    _$jscoverage['/base/style.js'].lineData[515]++;
    if (visit458_515_1(val !== undefined)) {
      _$jscoverage['/base/style.js'].lineData[517]++;
      if (visit459_517_1(visit460_517_2(val === null) || visit461_517_3(val === EMPTY))) {
        _$jscoverage['/base/style.js'].lineData[518]++;
        val = EMPTY;
      } else {
        _$jscoverage['/base/style.js'].lineData[521]++;
        if (visit462_521_1(!isNaN(Number(val)) && !cssNumber[name])) {
          _$jscoverage['/base/style.js'].lineData[522]++;
          val += DEFAULT_UNIT;
        }
      }
      _$jscoverage['/base/style.js'].lineData[524]++;
      if (visit463_524_1(hook && hook.set)) {
        _$jscoverage['/base/style.js'].lineData[525]++;
        val = hook.set(elem, val);
      }
      _$jscoverage['/base/style.js'].lineData[527]++;
      if (visit464_527_1(val !== undefined)) {
        _$jscoverage['/base/style.js'].lineData[529]++;
        try {
          _$jscoverage['/base/style.js'].lineData[531]++;
          style[name] = val;
        }        catch (e) {
  _$jscoverage['/base/style.js'].lineData[533]++;
  logger.warn('css set error:' + e);
}
        _$jscoverage['/base/style.js'].lineData[536]++;
        if (visit465_536_1(visit466_536_2(val === EMPTY) && style.removeAttribute)) {
          _$jscoverage['/base/style.js'].lineData[537]++;
          style.removeAttribute(name);
        }
      }
      _$jscoverage['/base/style.js'].lineData[540]++;
      if (visit467_540_1(!style.cssText)) {
        _$jscoverage['/base/style.js'].lineData[543]++;
        visit468_543_1(UA.webkit && (style = elem.outerHTML));
        _$jscoverage['/base/style.js'].lineData[544]++;
        elem.removeAttribute('style');
      }
      _$jscoverage['/base/style.js'].lineData[546]++;
      return undefined;
    } else {
      _$jscoverage['/base/style.js'].lineData[551]++;
      if (visit469_551_1(hook && visit470_551_2('get' in hook && visit471_551_3((ret = hook.get(elem, false)) !== undefined)))) {
      } else {
        _$jscoverage['/base/style.js'].lineData[555]++;
        ret = style[name];
      }
      _$jscoverage['/base/style.js'].lineData[557]++;
      return visit472_557_1(ret === undefined) ? '' : ret;
    }
  }
  _$jscoverage['/base/style.js'].lineData[562]++;
  function getWHIgnoreDisplay(elem) {
    _$jscoverage['/base/style.js'].functionData[22]++;
    _$jscoverage['/base/style.js'].lineData[563]++;
    var val, args = arguments;
    _$jscoverage['/base/style.js'].lineData[566]++;
    if (visit473_566_1(elem.offsetWidth !== 0)) {
      _$jscoverage['/base/style.js'].lineData[567]++;
      val = getWH.apply(undefined, args);
    } else {
      _$jscoverage['/base/style.js'].lineData[569]++;
      swap(elem, cssShow, function() {
  _$jscoverage['/base/style.js'].functionData[23]++;
  _$jscoverage['/base/style.js'].lineData[570]++;
  val = getWH.apply(undefined, args);
});
    }
    _$jscoverage['/base/style.js'].lineData[573]++;
    return val;
  }
  _$jscoverage['/base/style.js'].lineData[585]++;
  function getWH(elem, name, extra) {
    _$jscoverage['/base/style.js'].functionData[24]++;
    _$jscoverage['/base/style.js'].lineData[586]++;
    if (visit474_586_1(S.isWindow(elem))) {
      _$jscoverage['/base/style.js'].lineData[587]++;
      return visit475_587_1(name == WIDTH) ? Dom.viewportWidth(elem) : Dom.viewportHeight(elem);
    } else {
      _$jscoverage['/base/style.js'].lineData[588]++;
      if (visit476_588_1(elem.nodeType == 9)) {
        _$jscoverage['/base/style.js'].lineData[589]++;
        return visit477_589_1(name == WIDTH) ? Dom.docWidth(elem) : Dom.docHeight(elem);
      }
    }
    _$jscoverage['/base/style.js'].lineData[591]++;
    var which = visit478_591_1(name === WIDTH) ? ['Left', 'Right'] : ['Top', 'Bottom'], val = visit479_592_1(name === WIDTH) ? elem.offsetWidth : elem.offsetHeight;
    _$jscoverage['/base/style.js'].lineData[594]++;
    if (visit480_594_1(val > 0)) {
      _$jscoverage['/base/style.js'].lineData[595]++;
      if (visit481_595_1(extra !== 'border')) {
        _$jscoverage['/base/style.js'].lineData[596]++;
        S.each(which, function(w) {
  _$jscoverage['/base/style.js'].functionData[25]++;
  _$jscoverage['/base/style.js'].lineData[597]++;
  if (visit482_597_1(!extra)) {
    _$jscoverage['/base/style.js'].lineData[598]++;
    val -= visit483_598_1(parseFloat(Dom.css(elem, 'padding' + w)) || 0);
  }
  _$jscoverage['/base/style.js'].lineData[600]++;
  if (visit484_600_1(extra === 'margin')) {
    _$jscoverage['/base/style.js'].lineData[601]++;
    val += visit485_601_1(parseFloat(Dom.css(elem, extra + w)) || 0);
  } else {
    _$jscoverage['/base/style.js'].lineData[603]++;
    val -= visit486_603_1(parseFloat(Dom.css(elem, 'border' + w + 'Width')) || 0);
  }
});
      }
      _$jscoverage['/base/style.js'].lineData[608]++;
      return val;
    }
    _$jscoverage['/base/style.js'].lineData[612]++;
    val = Dom._getComputedStyle(elem, name);
    _$jscoverage['/base/style.js'].lineData[613]++;
    if (visit487_613_1(visit488_613_2(val == null) || visit489_613_3((Number(val)) < 0))) {
      _$jscoverage['/base/style.js'].lineData[614]++;
      val = visit490_614_1(elem.style[name] || 0);
    }
    _$jscoverage['/base/style.js'].lineData[617]++;
    val = visit491_617_1(parseFloat(val) || 0);
    _$jscoverage['/base/style.js'].lineData[620]++;
    if (visit492_620_1(extra)) {
      _$jscoverage['/base/style.js'].lineData[621]++;
      S.each(which, function(w) {
  _$jscoverage['/base/style.js'].functionData[26]++;
  _$jscoverage['/base/style.js'].lineData[622]++;
  val += visit493_622_1(parseFloat(Dom.css(elem, 'padding' + w)) || 0);
  _$jscoverage['/base/style.js'].lineData[623]++;
  if (visit494_623_1(extra !== 'padding')) {
    _$jscoverage['/base/style.js'].lineData[624]++;
    val += visit495_624_1(parseFloat(Dom.css(elem, 'border' + w + 'Width')) || 0);
  }
  _$jscoverage['/base/style.js'].lineData[626]++;
  if (visit496_626_1(extra === 'margin')) {
    _$jscoverage['/base/style.js'].lineData[627]++;
    val += visit497_627_1(parseFloat(Dom.css(elem, extra + w)) || 0);
  }
});
    }
    _$jscoverage['/base/style.js'].lineData[632]++;
    return val;
  }
  _$jscoverage['/base/style.js'].lineData[635]++;
  var ROOT_REG = /^(?:body|html)$/i;
  _$jscoverage['/base/style.js'].lineData[637]++;
  function getPosition(el) {
    _$jscoverage['/base/style.js'].functionData[27]++;
    _$jscoverage['/base/style.js'].lineData[638]++;
    var offsetParent, offset, parentOffset = {
  top: 0, 
  left: 0};
    _$jscoverage['/base/style.js'].lineData[642]++;
    if (visit498_642_1(Dom.css(el, 'position') == 'fixed')) {
      _$jscoverage['/base/style.js'].lineData[643]++;
      offset = el.getBoundingClientRect();
    } else {
      _$jscoverage['/base/style.js'].lineData[648]++;
      offsetParent = getOffsetParent(el);
      _$jscoverage['/base/style.js'].lineData[649]++;
      offset = Dom.offset(el);
      _$jscoverage['/base/style.js'].lineData[650]++;
      parentOffset = Dom.offset(offsetParent);
      _$jscoverage['/base/style.js'].lineData[651]++;
      parentOffset.top += visit499_651_1(parseFloat(Dom.css(offsetParent, "borderTopWidth")) || 0);
      _$jscoverage['/base/style.js'].lineData[652]++;
      parentOffset.left += visit500_652_1(parseFloat(Dom.css(offsetParent, "borderLeftWidth")) || 0);
    }
    _$jscoverage['/base/style.js'].lineData[655]++;
    offset.top -= visit501_655_1(parseFloat(Dom.css(el, "marginTop")) || 0);
    _$jscoverage['/base/style.js'].lineData[656]++;
    offset.left -= visit502_656_1(parseFloat(Dom.css(el, "marginLeft")) || 0);
    _$jscoverage['/base/style.js'].lineData[660]++;
    return {
  top: offset.top - parentOffset.top, 
  left: offset.left - parentOffset.left};
  }
  _$jscoverage['/base/style.js'].lineData[666]++;
  function getOffsetParent(el) {
    _$jscoverage['/base/style.js'].functionData[28]++;
    _$jscoverage['/base/style.js'].lineData[667]++;
    var offsetParent = visit503_667_1(el.offsetParent || (visit504_667_2(el.ownerDocument || doc)).body);
    _$jscoverage['/base/style.js'].lineData[668]++;
    while (visit505_668_1(offsetParent && visit506_668_2(!ROOT_REG.test(offsetParent.nodeName) && visit507_669_1(Dom.css(offsetParent, "position") === "static")))) {
      _$jscoverage['/base/style.js'].lineData[670]++;
      offsetParent = offsetParent.offsetParent;
    }
    _$jscoverage['/base/style.js'].lineData[672]++;
    return offsetParent;
  }
  _$jscoverage['/base/style.js'].lineData[675]++;
  return Dom;
});
