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
  _$jscoverage['/base/style.js'].lineData[41] = 0;
  _$jscoverage['/base/style.js'].lineData[49] = 0;
  _$jscoverage['/base/style.js'].lineData[51] = 0;
  _$jscoverage['/base/style.js'].lineData[52] = 0;
  _$jscoverage['/base/style.js'].lineData[53] = 0;
  _$jscoverage['/base/style.js'].lineData[54] = 0;
  _$jscoverage['/base/style.js'].lineData[56] = 0;
  _$jscoverage['/base/style.js'].lineData[60] = 0;
  _$jscoverage['/base/style.js'].lineData[61] = 0;
  _$jscoverage['/base/style.js'].lineData[62] = 0;
  _$jscoverage['/base/style.js'].lineData[63] = 0;
  _$jscoverage['/base/style.js'].lineData[66] = 0;
  _$jscoverage['/base/style.js'].lineData[67] = 0;
  _$jscoverage['/base/style.js'].lineData[70] = 0;
  _$jscoverage['/base/style.js'].lineData[71] = 0;
  _$jscoverage['/base/style.js'].lineData[74] = 0;
  _$jscoverage['/base/style.js'].lineData[76] = 0;
  _$jscoverage['/base/style.js'].lineData[79] = 0;
  _$jscoverage['/base/style.js'].lineData[80] = 0;
  _$jscoverage['/base/style.js'].lineData[83] = 0;
  _$jscoverage['/base/style.js'].lineData[84] = 0;
  _$jscoverage['/base/style.js'].lineData[85] = 0;
  _$jscoverage['/base/style.js'].lineData[87] = 0;
  _$jscoverage['/base/style.js'].lineData[88] = 0;
  _$jscoverage['/base/style.js'].lineData[89] = 0;
  _$jscoverage['/base/style.js'].lineData[91] = 0;
  _$jscoverage['/base/style.js'].lineData[93] = 0;
  _$jscoverage['/base/style.js'].lineData[96] = 0;
  _$jscoverage['/base/style.js'].lineData[110] = 0;
  _$jscoverage['/base/style.js'].lineData[118] = 0;
  _$jscoverage['/base/style.js'].lineData[121] = 0;
  _$jscoverage['/base/style.js'].lineData[122] = 0;
  _$jscoverage['/base/style.js'].lineData[126] = 0;
  _$jscoverage['/base/style.js'].lineData[127] = 0;
  _$jscoverage['/base/style.js'].lineData[131] = 0;
  _$jscoverage['/base/style.js'].lineData[132] = 0;
  _$jscoverage['/base/style.js'].lineData[133] = 0;
  _$jscoverage['/base/style.js'].lineData[134] = 0;
  _$jscoverage['/base/style.js'].lineData[135] = 0;
  _$jscoverage['/base/style.js'].lineData[137] = 0;
  _$jscoverage['/base/style.js'].lineData[138] = 0;
  _$jscoverage['/base/style.js'].lineData[140] = 0;
  _$jscoverage['/base/style.js'].lineData[141] = 0;
  _$jscoverage['/base/style.js'].lineData[142] = 0;
  _$jscoverage['/base/style.js'].lineData[145] = 0;
  _$jscoverage['/base/style.js'].lineData[158] = 0;
  _$jscoverage['/base/style.js'].lineData[163] = 0;
  _$jscoverage['/base/style.js'].lineData[164] = 0;
  _$jscoverage['/base/style.js'].lineData[165] = 0;
  _$jscoverage['/base/style.js'].lineData[166] = 0;
  _$jscoverage['/base/style.js'].lineData[169] = 0;
  _$jscoverage['/base/style.js'].lineData[171] = 0;
  _$jscoverage['/base/style.js'].lineData[172] = 0;
  _$jscoverage['/base/style.js'].lineData[173] = 0;
  _$jscoverage['/base/style.js'].lineData[174] = 0;
  _$jscoverage['/base/style.js'].lineData[176] = 0;
  _$jscoverage['/base/style.js'].lineData[178] = 0;
  _$jscoverage['/base/style.js'].lineData[179] = 0;
  _$jscoverage['/base/style.js'].lineData[182] = 0;
  _$jscoverage['/base/style.js'].lineData[195] = 0;
  _$jscoverage['/base/style.js'].lineData[202] = 0;
  _$jscoverage['/base/style.js'].lineData[203] = 0;
  _$jscoverage['/base/style.js'].lineData[204] = 0;
  _$jscoverage['/base/style.js'].lineData[205] = 0;
  _$jscoverage['/base/style.js'].lineData[208] = 0;
  _$jscoverage['/base/style.js'].lineData[211] = 0;
  _$jscoverage['/base/style.js'].lineData[212] = 0;
  _$jscoverage['/base/style.js'].lineData[214] = 0;
  _$jscoverage['/base/style.js'].lineData[216] = 0;
  _$jscoverage['/base/style.js'].lineData[217] = 0;
  _$jscoverage['/base/style.js'].lineData[219] = 0;
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
  _$jscoverage['/base/style.js'].lineData[548] = 0;
  _$jscoverage['/base/style.js'].lineData[553] = 0;
  _$jscoverage['/base/style.js'].lineData[556] = 0;
  _$jscoverage['/base/style.js'].lineData[558] = 0;
  _$jscoverage['/base/style.js'].lineData[563] = 0;
  _$jscoverage['/base/style.js'].lineData[564] = 0;
  _$jscoverage['/base/style.js'].lineData[567] = 0;
  _$jscoverage['/base/style.js'].lineData[568] = 0;
  _$jscoverage['/base/style.js'].lineData[570] = 0;
  _$jscoverage['/base/style.js'].lineData[571] = 0;
  _$jscoverage['/base/style.js'].lineData[574] = 0;
  _$jscoverage['/base/style.js'].lineData[586] = 0;
  _$jscoverage['/base/style.js'].lineData[587] = 0;
  _$jscoverage['/base/style.js'].lineData[588] = 0;
  _$jscoverage['/base/style.js'].lineData[589] = 0;
  _$jscoverage['/base/style.js'].lineData[590] = 0;
  _$jscoverage['/base/style.js'].lineData[592] = 0;
  _$jscoverage['/base/style.js'].lineData[595] = 0;
  _$jscoverage['/base/style.js'].lineData[596] = 0;
  _$jscoverage['/base/style.js'].lineData[597] = 0;
  _$jscoverage['/base/style.js'].lineData[598] = 0;
  _$jscoverage['/base/style.js'].lineData[599] = 0;
  _$jscoverage['/base/style.js'].lineData[601] = 0;
  _$jscoverage['/base/style.js'].lineData[602] = 0;
  _$jscoverage['/base/style.js'].lineData[604] = 0;
  _$jscoverage['/base/style.js'].lineData[609] = 0;
  _$jscoverage['/base/style.js'].lineData[613] = 0;
  _$jscoverage['/base/style.js'].lineData[614] = 0;
  _$jscoverage['/base/style.js'].lineData[615] = 0;
  _$jscoverage['/base/style.js'].lineData[618] = 0;
  _$jscoverage['/base/style.js'].lineData[621] = 0;
  _$jscoverage['/base/style.js'].lineData[622] = 0;
  _$jscoverage['/base/style.js'].lineData[623] = 0;
  _$jscoverage['/base/style.js'].lineData[624] = 0;
  _$jscoverage['/base/style.js'].lineData[625] = 0;
  _$jscoverage['/base/style.js'].lineData[627] = 0;
  _$jscoverage['/base/style.js'].lineData[628] = 0;
  _$jscoverage['/base/style.js'].lineData[633] = 0;
  _$jscoverage['/base/style.js'].lineData[636] = 0;
  _$jscoverage['/base/style.js'].lineData[638] = 0;
  _$jscoverage['/base/style.js'].lineData[639] = 0;
  _$jscoverage['/base/style.js'].lineData[643] = 0;
  _$jscoverage['/base/style.js'].lineData[644] = 0;
  _$jscoverage['/base/style.js'].lineData[649] = 0;
  _$jscoverage['/base/style.js'].lineData[650] = 0;
  _$jscoverage['/base/style.js'].lineData[651] = 0;
  _$jscoverage['/base/style.js'].lineData[652] = 0;
  _$jscoverage['/base/style.js'].lineData[653] = 0;
  _$jscoverage['/base/style.js'].lineData[656] = 0;
  _$jscoverage['/base/style.js'].lineData[657] = 0;
  _$jscoverage['/base/style.js'].lineData[661] = 0;
  _$jscoverage['/base/style.js'].lineData[667] = 0;
  _$jscoverage['/base/style.js'].lineData[668] = 0;
  _$jscoverage['/base/style.js'].lineData[669] = 0;
  _$jscoverage['/base/style.js'].lineData[671] = 0;
  _$jscoverage['/base/style.js'].lineData[673] = 0;
  _$jscoverage['/base/style.js'].lineData[676] = 0;
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
  _$jscoverage['/base/style.js'].branchData['49'] = [];
  _$jscoverage['/base/style.js'].branchData['49'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['49'][2] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['54'] = [];
  _$jscoverage['/base/style.js'].branchData['54'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['54'][2] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['60'] = [];
  _$jscoverage['/base/style.js'].branchData['60'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['66'] = [];
  _$jscoverage['/base/style.js'].branchData['66'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['83'] = [];
  _$jscoverage['/base/style.js'].branchData['83'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['84'] = [];
  _$jscoverage['/base/style.js'].branchData['84'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['118'] = [];
  _$jscoverage['/base/style.js'].branchData['118'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['122'] = [];
  _$jscoverage['/base/style.js'].branchData['122'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['126'] = [];
  _$jscoverage['/base/style.js'].branchData['126'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['126'][2] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['131'] = [];
  _$jscoverage['/base/style.js'].branchData['131'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['163'] = [];
  _$jscoverage['/base/style.js'].branchData['163'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['165'] = [];
  _$jscoverage['/base/style.js'].branchData['165'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['171'] = [];
  _$jscoverage['/base/style.js'].branchData['171'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['173'] = [];
  _$jscoverage['/base/style.js'].branchData['173'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['178'] = [];
  _$jscoverage['/base/style.js'].branchData['178'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['202'] = [];
  _$jscoverage['/base/style.js'].branchData['202'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['204'] = [];
  _$jscoverage['/base/style.js'].branchData['204'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['214'] = [];
  _$jscoverage['/base/style.js'].branchData['214'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['217'] = [];
  _$jscoverage['/base/style.js'].branchData['217'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['219'] = [];
  _$jscoverage['/base/style.js'].branchData['219'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['219'][2] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['219'][3] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['220'] = [];
  _$jscoverage['/base/style.js'].branchData['220'][1] = new BranchData();
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
  _$jscoverage['/base/style.js'].branchData['553'] = [];
  _$jscoverage['/base/style.js'].branchData['553'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['553'][2] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['553'][3] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['554'] = [];
  _$jscoverage['/base/style.js'].branchData['554'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['558'] = [];
  _$jscoverage['/base/style.js'].branchData['558'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['567'] = [];
  _$jscoverage['/base/style.js'].branchData['567'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['587'] = [];
  _$jscoverage['/base/style.js'].branchData['587'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['588'] = [];
  _$jscoverage['/base/style.js'].branchData['588'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['589'] = [];
  _$jscoverage['/base/style.js'].branchData['589'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['590'] = [];
  _$jscoverage['/base/style.js'].branchData['590'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['592'] = [];
  _$jscoverage['/base/style.js'].branchData['592'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['593'] = [];
  _$jscoverage['/base/style.js'].branchData['593'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['595'] = [];
  _$jscoverage['/base/style.js'].branchData['595'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['596'] = [];
  _$jscoverage['/base/style.js'].branchData['596'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['598'] = [];
  _$jscoverage['/base/style.js'].branchData['598'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['599'] = [];
  _$jscoverage['/base/style.js'].branchData['599'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['601'] = [];
  _$jscoverage['/base/style.js'].branchData['601'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['602'] = [];
  _$jscoverage['/base/style.js'].branchData['602'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['604'] = [];
  _$jscoverage['/base/style.js'].branchData['604'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['614'] = [];
  _$jscoverage['/base/style.js'].branchData['614'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['614'][2] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['614'][3] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['615'] = [];
  _$jscoverage['/base/style.js'].branchData['615'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['618'] = [];
  _$jscoverage['/base/style.js'].branchData['618'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['621'] = [];
  _$jscoverage['/base/style.js'].branchData['621'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['623'] = [];
  _$jscoverage['/base/style.js'].branchData['623'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['624'] = [];
  _$jscoverage['/base/style.js'].branchData['624'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['625'] = [];
  _$jscoverage['/base/style.js'].branchData['625'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['627'] = [];
  _$jscoverage['/base/style.js'].branchData['627'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['628'] = [];
  _$jscoverage['/base/style.js'].branchData['628'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['643'] = [];
  _$jscoverage['/base/style.js'].branchData['643'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['652'] = [];
  _$jscoverage['/base/style.js'].branchData['652'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['653'] = [];
  _$jscoverage['/base/style.js'].branchData['653'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['656'] = [];
  _$jscoverage['/base/style.js'].branchData['656'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['657'] = [];
  _$jscoverage['/base/style.js'].branchData['657'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['668'] = [];
  _$jscoverage['/base/style.js'].branchData['668'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['668'][2] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['669'] = [];
  _$jscoverage['/base/style.js'].branchData['669'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['669'][2] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['670'] = [];
  _$jscoverage['/base/style.js'].branchData['670'][1] = new BranchData();
}
_$jscoverage['/base/style.js'].branchData['670'][1].init(52, 46, 'Dom.css(offsetParent, \'position\') === \'static\'');
function visit505_670_1(result) {
  _$jscoverage['/base/style.js'].branchData['670'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['669'][2].init(111, 99, '!ROOT_REG.test(offsetParent.nodeName) && Dom.css(offsetParent, \'position\') === \'static\'');
function visit504_669_2(result) {
  _$jscoverage['/base/style.js'].branchData['669'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['669'][1].init(95, 115, 'offsetParent && !ROOT_REG.test(offsetParent.nodeName) && Dom.css(offsetParent, \'position\') === \'static\'');
function visit503_669_1(result) {
  _$jscoverage['/base/style.js'].branchData['669'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['668'][2].init(49, 23, 'el.ownerDocument || doc');
function visit502_668_2(result) {
  _$jscoverage['/base/style.js'].branchData['668'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['668'][1].init(28, 50, 'el.offsetParent || (el.ownerDocument || doc).body');
function visit501_668_1(result) {
  _$jscoverage['/base/style.js'].branchData['668'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['657'][1].init(808, 42, 'parseFloat(Dom.css(el, \'marginLeft\')) || 0');
function visit500_657_1(result) {
  _$jscoverage['/base/style.js'].branchData['657'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['656'][1].init(742, 41, 'parseFloat(Dom.css(el, \'marginTop\')) || 0');
function visit499_656_1(result) {
  _$jscoverage['/base/style.js'].branchData['656'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['653'][1].init(438, 57, 'parseFloat(Dom.css(offsetParent, \'borderLeftWidth\')) || 0');
function visit498_653_1(result) {
  _$jscoverage['/base/style.js'].branchData['653'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['652'][1].init(347, 56, 'parseFloat(Dom.css(offsetParent, \'borderTopWidth\')) || 0');
function visit497_652_1(result) {
  _$jscoverage['/base/style.js'].branchData['652'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['643'][1].init(108, 35, 'Dom.css(el, \'position\') === \'fixed\'');
function visit496_643_1(result) {
  _$jscoverage['/base/style.js'].branchData['643'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['628'][1].init(28, 41, 'parseFloat(Dom.css(elem, extra + w)) || 0');
function visit495_628_1(result) {
  _$jscoverage['/base/style.js'].branchData['628'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['627'][1].init(235, 18, 'extra === \'margin\'');
function visit494_627_1(result) {
  _$jscoverage['/base/style.js'].branchData['627'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['625'][1].init(28, 54, 'parseFloat(Dom.css(elem, \'border\' + w + \'Width\')) || 0');
function visit493_625_1(result) {
  _$jscoverage['/base/style.js'].branchData['625'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['624'][1].init(91, 19, 'extra !== \'padding\'');
function visit492_624_1(result) {
  _$jscoverage['/base/style.js'].branchData['624'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['623'][1].init(24, 45, 'parseFloat(Dom.css(elem, \'padding\' + w)) || 0');
function visit491_623_1(result) {
  _$jscoverage['/base/style.js'].branchData['623'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['621'][1].init(1328, 5, 'extra');
function visit490_621_1(result) {
  _$jscoverage['/base/style.js'].branchData['621'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['618'][1].init(1254, 20, 'parseFloat(val) || 0');
function visit489_618_1(result) {
  _$jscoverage['/base/style.js'].branchData['618'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['615'][1].init(19, 23, 'elem.style[name] || 0');
function visit488_615_1(result) {
  _$jscoverage['/base/style.js'].branchData['615'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['614'][3].init(1114, 16, '(Number(val)) < 0');
function visit487_614_3(result) {
  _$jscoverage['/base/style.js'].branchData['614'][3].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['614'][2].init(1097, 12, 'val === null');
function visit486_614_2(result) {
  _$jscoverage['/base/style.js'].branchData['614'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['614'][1].init(1097, 33, 'val === null || (Number(val)) < 0');
function visit485_614_1(result) {
  _$jscoverage['/base/style.js'].branchData['614'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['604'][1].init(32, 54, 'parseFloat(Dom.css(elem, \'border\' + w + \'Width\')) || 0');
function visit484_604_1(result) {
  _$jscoverage['/base/style.js'].branchData['604'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['602'][1].init(32, 41, 'parseFloat(Dom.css(elem, extra + w)) || 0');
function visit483_602_1(result) {
  _$jscoverage['/base/style.js'].branchData['602'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['601'][1].init(159, 18, 'extra === \'margin\'');
function visit482_601_1(result) {
  _$jscoverage['/base/style.js'].branchData['601'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['599'][1].init(32, 45, 'parseFloat(Dom.css(elem, \'padding\' + w)) || 0');
function visit481_599_1(result) {
  _$jscoverage['/base/style.js'].branchData['599'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['598'][1].init(25, 6, '!extra');
function visit480_598_1(result) {
  _$jscoverage['/base/style.js'].branchData['598'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['596'][1].init(17, 18, 'extra !== \'border\'');
function visit479_596_1(result) {
  _$jscoverage['/base/style.js'].branchData['596'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['595'][1].init(413, 7, 'val > 0');
function visit478_595_1(result) {
  _$jscoverage['/base/style.js'].branchData['595'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['593'][1].init(85, 14, 'name === WIDTH');
function visit477_593_1(result) {
  _$jscoverage['/base/style.js'].branchData['593'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['592'][1].init(271, 14, 'name === WIDTH');
function visit476_592_1(result) {
  _$jscoverage['/base/style.js'].branchData['592'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['590'][1].init(20, 14, 'name === WIDTH');
function visit475_590_1(result) {
  _$jscoverage['/base/style.js'].branchData['590'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['589'][1].init(141, 19, 'elem.nodeType === 9');
function visit474_589_1(result) {
  _$jscoverage['/base/style.js'].branchData['589'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['588'][1].init(20, 14, 'name === WIDTH');
function visit473_588_1(result) {
  _$jscoverage['/base/style.js'].branchData['588'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['587'][1].init(13, 16, 'S.isWindow(elem)');
function visit472_587_1(result) {
  _$jscoverage['/base/style.js'].branchData['587'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['567'][1].init(124, 22, 'elem.offsetWidth !== 0');
function visit471_567_1(result) {
  _$jscoverage['/base/style.js'].branchData['567'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['558'][1].init(326, 17, 'ret === undefined');
function visit470_558_1(result) {
  _$jscoverage['/base/style.js'].branchData['558'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['554'][1].init(33, 42, '(ret = hook.get(elem, false)) !== undefined');
function visit469_554_1(result) {
  _$jscoverage['/base/style.js'].branchData['554'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['553'][3].init(103, 76, '\'get\' in hook && (ret = hook.get(elem, false)) !== undefined');
function visit468_553_3(result) {
  _$jscoverage['/base/style.js'].branchData['553'][3].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['553'][2].init(95, 84, 'hook && \'get\' in hook && (ret = hook.get(elem, false)) !== undefined');
function visit467_553_2(result) {
  _$jscoverage['/base/style.js'].branchData['553'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['553'][1].init(93, 87, '!(hook && \'get\' in hook && (ret = hook.get(elem, false)) !== undefined)');
function visit466_553_1(result) {
  _$jscoverage['/base/style.js'].branchData['553'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['543'][1].init(136, 9, 'UA.webkit');
function visit465_543_1(result) {
  _$jscoverage['/base/style.js'].branchData['543'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['540'][1].init(857, 16, '!elStyle.cssText');
function visit464_540_1(result) {
  _$jscoverage['/base/style.js'].branchData['540'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['536'][2].init(301, 13, 'val === EMPTY');
function visit463_536_2(result) {
  _$jscoverage['/base/style.js'].branchData['536'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['536'][1].init(301, 40, 'val === EMPTY && elStyle.removeAttribute');
function visit462_536_1(result) {
  _$jscoverage['/base/style.js'].branchData['536'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['527'][1].init(393, 17, 'val !== undefined');
function visit461_527_1(result) {
  _$jscoverage['/base/style.js'].branchData['527'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['524'][1].init(300, 16, 'hook && hook.set');
function visit460_524_1(result) {
  _$jscoverage['/base/style.js'].branchData['524'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['521'][1].init(191, 39, '!isNaN(Number(val)) && !cssNumber[name]');
function visit459_521_1(result) {
  _$jscoverage['/base/style.js'].branchData['521'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['517'][3].init(64, 13, 'val === EMPTY');
function visit458_517_3(result) {
  _$jscoverage['/base/style.js'].branchData['517'][3].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['517'][2].init(48, 12, 'val === null');
function visit457_517_2(result) {
  _$jscoverage['/base/style.js'].branchData['517'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['517'][1].init(48, 29, 'val === null || val === EMPTY');
function visit456_517_1(result) {
  _$jscoverage['/base/style.js'].branchData['517'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['515'][1].init(326, 17, 'val !== undefined');
function visit455_515_1(result) {
  _$jscoverage['/base/style.js'].branchData['515'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['513'][1].init(272, 22, 'cssProps[name] || name');
function visit454_513_1(result) {
  _$jscoverage['/base/style.js'].branchData['513'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['508'][2].init(106, 19, 'elem.nodeType === 8');
function visit453_508_2(result) {
  _$jscoverage['/base/style.js'].branchData['508'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['508'][1].init(34, 46, 'elem.nodeType === 8 || !(elStyle = elem.style)');
function visit452_508_1(result) {
  _$jscoverage['/base/style.js'].branchData['508'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['507'][2].init(69, 19, 'elem.nodeType === 3');
function visit451_507_2(result) {
  _$jscoverage['/base/style.js'].branchData['507'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['507'][1].init(69, 81, 'elem.nodeType === 3 || elem.nodeType === 8 || !(elStyle = elem.style)');
function visit450_507_1(result) {
  _$jscoverage['/base/style.js'].branchData['507'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['475'][1].init(501, 37, 'isAutoPosition || NO_PX_REG.test(val)');
function visit449_475_1(result) {
  _$jscoverage['/base/style.js'].branchData['475'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['471'][2].init(321, 23, 'position === \'relative\'');
function visit448_471_2(result) {
  _$jscoverage['/base/style.js'].branchData['471'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['471'][1].init(303, 41, 'isAutoPosition && position === \'relative\'');
function visit447_471_1(result) {
  _$jscoverage['/base/style.js'].branchData['471'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['470'][1].init(263, 14, 'val === \'auto\'');
function visit446_470_1(result) {
  _$jscoverage['/base/style.js'].branchData['470'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['466'][1].init(81, 21, 'position === \'static\'');
function visit445_466_1(result) {
  _$jscoverage['/base/style.js'].branchData['466'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['464'][1].init(112, 8, 'computed');
function visit444_464_1(result) {
  _$jscoverage['/base/style.js'].branchData['464'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['448'][1].init(46, 8, 'computed');
function visit443_448_1(result) {
  _$jscoverage['/base/style.js'].branchData['448'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['433'][1].init(69, 3, 'ret');
function visit442_433_1(result) {
  _$jscoverage['/base/style.js'].branchData['433'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['428'][1].init(60, 71, 'el && getWHIgnoreDisplay(el, name, includeMargin ? \'margin\' : \'border\')');
function visit441_428_1(result) {
  _$jscoverage['/base/style.js'].branchData['428'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['423'][1].init(60, 45, 'el && getWHIgnoreDisplay(el, name, \'padding\')');
function visit440_423_1(result) {
  _$jscoverage['/base/style.js'].branchData['423'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['358'][1].init(33, 36, '!S.inArray(getNodeName(e), excludes)');
function visit439_358_1(result) {
  _$jscoverage['/base/style.js'].branchData['358'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['353'][1].init(229, 5, 'UA.ie');
function visit438_353_1(result) {
  _$jscoverage['/base/style.js'].branchData['353'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['351'][1].init(101, 32, 'userSelectProperty !== undefined');
function visit437_351_1(result) {
  _$jscoverage['/base/style.js'].branchData['351'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['348'][1].init(272, 6, 'j >= 0');
function visit436_348_1(result) {
  _$jscoverage['/base/style.js'].branchData['348'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['328'][1].init(746, 15, 'elem.styleSheet');
function visit435_328_1(result) {
  _$jscoverage['/base/style.js'].branchData['328'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['319'][1].init(489, 4, 'elem');
function visit434_319_1(result) {
  _$jscoverage['/base/style.js'].branchData['319'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['314'][1].init(329, 35, 'id && (id = id.replace(\'#\', EMPTY))');
function visit433_314_1(result) {
  _$jscoverage['/base/style.js'].branchData['314'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['304'][1].init(21, 26, 'typeof refWin === \'string\'');
function visit432_304_1(result) {
  _$jscoverage['/base/style.js'].branchData['304'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['287'][1].init(60, 31, 'Dom.css(elem, DISPLAY) === NONE');
function visit431_287_1(result) {
  _$jscoverage['/base/style.js'].branchData['287'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['285'][1].init(118, 6, 'i >= 0');
function visit430_285_1(result) {
  _$jscoverage['/base/style.js'].branchData['285'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['270'][1].init(29, 3, 'old');
function visit429_270_1(result) {
  _$jscoverage['/base/style.js'].branchData['270'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['269'][1].init(150, 12, 'old !== NONE');
function visit428_269_1(result) {
  _$jscoverage['/base/style.js'].branchData['269'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['265'][1].init(118, 6, 'i >= 0');
function visit427_265_1(result) {
  _$jscoverage['/base/style.js'].branchData['265'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['249'][1].init(201, 31, 'Dom.css(elem, DISPLAY) === NONE');
function visit426_249_1(result) {
  _$jscoverage['/base/style.js'].branchData['249'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['247'][1].init(78, 36, 'Dom.data(elem, OLD_DISPLAY) || EMPTY');
function visit425_247_1(result) {
  _$jscoverage['/base/style.js'].branchData['247'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['245'][1].init(172, 6, 'i >= 0');
function visit424_245_1(result) {
  _$jscoverage['/base/style.js'].branchData['245'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['229'][1].init(46, 6, 'i >= 0');
function visit423_229_1(result) {
  _$jscoverage['/base/style.js'].branchData['229'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['225'][1].init(482, 26, 'typeof ret === \'undefined\'');
function visit422_225_1(result) {
  _$jscoverage['/base/style.js'].branchData['225'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['220'][1].init(45, 41, '(ret = hook.get(elem, true)) !== undefined');
function visit421_220_1(result) {
  _$jscoverage['/base/style.js'].branchData['220'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['219'][3].init(123, 87, '\'get\' in hook && (ret = hook.get(elem, true)) !== undefined');
function visit420_219_3(result) {
  _$jscoverage['/base/style.js'].branchData['219'][3].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['219'][2].init(115, 95, 'hook && \'get\' in hook && (ret = hook.get(elem, true)) !== undefined');
function visit419_219_2(result) {
  _$jscoverage['/base/style.js'].branchData['219'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['219'][1].init(113, 98, '!(hook && \'get\' in hook && (ret = hook.get(elem, true)) !== undefined)');
function visit418_219_1(result) {
  _$jscoverage['/base/style.js'].branchData['219'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['217'][1].init(114, 4, 'elem');
function visit417_217_1(result) {
  _$jscoverage['/base/style.js'].branchData['217'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['214'][1].init(645, 17, 'val === undefined');
function visit416_214_1(result) {
  _$jscoverage['/base/style.js'].branchData['214'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['204'][1].init(50, 6, 'i >= 0');
function visit415_204_1(result) {
  _$jscoverage['/base/style.js'].branchData['204'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['202'][1].init(233, 21, 'S.isPlainObject(name)');
function visit414_202_1(result) {
  _$jscoverage['/base/style.js'].branchData['202'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['178'][1].init(46, 6, 'i >= 0');
function visit413_178_1(result) {
  _$jscoverage['/base/style.js'].branchData['178'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['173'][1].init(55, 4, 'elem');
function visit412_173_1(result) {
  _$jscoverage['/base/style.js'].branchData['173'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['171'][1].init(493, 17, 'val === undefined');
function visit411_171_1(result) {
  _$jscoverage['/base/style.js'].branchData['171'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['165'][1].init(50, 6, 'i >= 0');
function visit410_165_1(result) {
  _$jscoverage['/base/style.js'].branchData['165'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['163'][1].init(187, 21, 'S.isPlainObject(name)');
function visit409_163_1(result) {
  _$jscoverage['/base/style.js'].branchData['163'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['131'][1].init(770, 51, 'Dom._RE_NUM_NO_PX.test(val) && RE_MARGIN.test(name)');
function visit408_131_1(result) {
  _$jscoverage['/base/style.js'].branchData['131'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['126'][2].init(587, 10, 'val === \'\'');
function visit407_126_2(result) {
  _$jscoverage['/base/style.js'].branchData['126'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['126'][1].init(587, 36, 'val === \'\' && !Dom.contains(d, elem)');
function visit406_126_1(result) {
  _$jscoverage['/base/style.js'].branchData['126'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['122'][1].init(27, 59, 'computedStyle.getPropertyValue(name) || computedStyle[name]');
function visit405_122_1(result) {
  _$jscoverage['/base/style.js'].branchData['122'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['118'][1].init(248, 22, 'cssProps[name] || name');
function visit404_118_1(result) {
  _$jscoverage['/base/style.js'].branchData['118'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['84'][1].init(20, 31, 'doc.body || doc.documentElement');
function visit403_84_1(result) {
  _$jscoverage['/base/style.js'].branchData['84'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['83'][1].init(101, 26, '!defaultDisplay[tagName]');
function visit402_83_1(result) {
  _$jscoverage['/base/style.js'].branchData['83'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['66'][1].init(1626, 32, 'Features.isTransitionSupported()');
function visit401_66_1(result) {
  _$jscoverage['/base/style.js'].branchData['66'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['60'][1].init(1422, 31, 'Features.isTransformSupported()');
function visit400_60_1(result) {
  _$jscoverage['/base/style.js'].branchData['60'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['54'][2].init(79, 32, 'userSelectProperty === undefined');
function visit399_54_2(result) {
  _$jscoverage['/base/style.js'].branchData['54'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['54'][1].init(79, 82, 'userSelectProperty === undefined && userSelect in documentElementStyle');
function visit398_54_1(result) {
  _$jscoverage['/base/style.js'].branchData['54'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['49'][2].init(1080, 32, 'doc && doc.documentElement.style');
function visit397_49_2(result) {
  _$jscoverage['/base/style.js'].branchData['49'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['49'][1].init(1080, 38, 'doc && doc.documentElement.style || {}');
function visit396_49_1(result) {
  _$jscoverage['/base/style.js'].branchData['49'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/base/style.js'].functionData[0]++;
  _$jscoverage['/base/style.js'].lineData[7]++;
  var Dom = require('./api');
  _$jscoverage['/base/style.js'].lineData[8]++;
  var logger = S.getLogger('s/dom');
  _$jscoverage['/base/style.js'].lineData[9]++;
  var globalWindow = S.Env.host, UA = S.UA, Features = S.Features, getNodeName = Dom.nodeName, doc = globalWindow.document, RE_MARGIN = /^margin/, WIDTH = 'width', HEIGHT = 'height', DISPLAY = 'display', OLD_DISPLAY = DISPLAY + S.now(), NONE = 'none', cssNumber = {
  'fillOpacity': 1, 
  'fontWeight': 1, 
  'lineHeight': 1, 
  'opacity': 1, 
  'orphans': 1, 
  'widows': 1, 
  'zIndex': 1, 
  'zoom': 1}, rmsPrefix = /^-ms-/, EMPTY = '', DEFAULT_UNIT = 'px', NO_PX_REG = /\d(?!px)[a-z%]+$/i, cssHooks = {}, cssProps = {
  'float': 'cssFloat'}, defaultDisplay = {}, RE_DASH = /-([a-z])/ig;
  _$jscoverage['/base/style.js'].lineData[41]++;
  var VENDORS = ['', 'Webkit', 'Moz', 'O', 'ms'];
  _$jscoverage['/base/style.js'].lineData[49]++;
  var documentElementStyle = visit396_49_1(visit397_49_2(doc && doc.documentElement.style) || {});
  _$jscoverage['/base/style.js'].lineData[51]++;
  var userSelectProperty;
  _$jscoverage['/base/style.js'].lineData[52]++;
  S.each(VENDORS, function(val) {
  _$jscoverage['/base/style.js'].functionData[1]++;
  _$jscoverage['/base/style.js'].lineData[53]++;
  var userSelect = val ? val + 'UserSelect' : 'userSelect';
  _$jscoverage['/base/style.js'].lineData[54]++;
  if (visit398_54_1(visit399_54_2(userSelectProperty === undefined) && userSelect in documentElementStyle)) {
    _$jscoverage['/base/style.js'].lineData[56]++;
    userSelectProperty = userSelect;
  }
});
  _$jscoverage['/base/style.js'].lineData[60]++;
  if (visit400_60_1(Features.isTransformSupported())) {
    _$jscoverage['/base/style.js'].lineData[61]++;
    var transform;
    _$jscoverage['/base/style.js'].lineData[62]++;
    transform = cssProps.transform = Features.getTransformProperty();
    _$jscoverage['/base/style.js'].lineData[63]++;
    cssProps.transformOrigin = transform + 'Origin';
  }
  _$jscoverage['/base/style.js'].lineData[66]++;
  if (visit401_66_1(Features.isTransitionSupported())) {
    _$jscoverage['/base/style.js'].lineData[67]++;
    cssProps.transition = Features.getTransitionProperty();
  }
  _$jscoverage['/base/style.js'].lineData[70]++;
  function upperCase() {
    _$jscoverage['/base/style.js'].functionData[2]++;
    _$jscoverage['/base/style.js'].lineData[71]++;
    return arguments[1].toUpperCase();
  }
  _$jscoverage['/base/style.js'].lineData[74]++;
  function camelCase(name) {
    _$jscoverage['/base/style.js'].functionData[3]++;
    _$jscoverage['/base/style.js'].lineData[76]++;
    return name.replace(rmsPrefix, 'ms-').replace(RE_DASH, upperCase);
  }
  _$jscoverage['/base/style.js'].lineData[79]++;
  function getDefaultDisplay(tagName) {
    _$jscoverage['/base/style.js'].functionData[4]++;
    _$jscoverage['/base/style.js'].lineData[80]++;
    var body, oldDisplay = defaultDisplay[tagName], elem;
    _$jscoverage['/base/style.js'].lineData[83]++;
    if (visit402_83_1(!defaultDisplay[tagName])) {
      _$jscoverage['/base/style.js'].lineData[84]++;
      body = visit403_84_1(doc.body || doc.documentElement);
      _$jscoverage['/base/style.js'].lineData[85]++;
      elem = doc.createElement(tagName);
      _$jscoverage['/base/style.js'].lineData[87]++;
      Dom.prepend(elem, body);
      _$jscoverage['/base/style.js'].lineData[88]++;
      oldDisplay = Dom.css(elem, 'display');
      _$jscoverage['/base/style.js'].lineData[89]++;
      body.removeChild(elem);
      _$jscoverage['/base/style.js'].lineData[91]++;
      defaultDisplay[tagName] = oldDisplay;
    }
    _$jscoverage['/base/style.js'].lineData[93]++;
    return oldDisplay;
  }
  _$jscoverage['/base/style.js'].lineData[96]++;
  S.mix(Dom, {
  _camelCase: camelCase, 
  _cssHooks: cssHooks, 
  _cssProps: cssProps, 
  _getComputedStyle: function(elem, name) {
  _$jscoverage['/base/style.js'].functionData[5]++;
  _$jscoverage['/base/style.js'].lineData[110]++;
  var val = '', computedStyle, width, minWidth, maxWidth, style, d = elem.ownerDocument;
  _$jscoverage['/base/style.js'].lineData[118]++;
  name = visit404_118_1(cssProps[name] || name);
  _$jscoverage['/base/style.js'].lineData[121]++;
  if ((computedStyle = d.defaultView.getComputedStyle(elem, null))) {
    _$jscoverage['/base/style.js'].lineData[122]++;
    val = visit405_122_1(computedStyle.getPropertyValue(name) || computedStyle[name]);
  }
  _$jscoverage['/base/style.js'].lineData[126]++;
  if (visit406_126_1(visit407_126_2(val === '') && !Dom.contains(d, elem))) {
    _$jscoverage['/base/style.js'].lineData[127]++;
    val = elem.style[name];
  }
  _$jscoverage['/base/style.js'].lineData[131]++;
  if (visit408_131_1(Dom._RE_NUM_NO_PX.test(val) && RE_MARGIN.test(name))) {
    _$jscoverage['/base/style.js'].lineData[132]++;
    style = elem.style;
    _$jscoverage['/base/style.js'].lineData[133]++;
    width = style.width;
    _$jscoverage['/base/style.js'].lineData[134]++;
    minWidth = style.minWidth;
    _$jscoverage['/base/style.js'].lineData[135]++;
    maxWidth = style.maxWidth;
    _$jscoverage['/base/style.js'].lineData[137]++;
    style.minWidth = style.maxWidth = style.width = val;
    _$jscoverage['/base/style.js'].lineData[138]++;
    val = computedStyle.width;
    _$jscoverage['/base/style.js'].lineData[140]++;
    style.width = width;
    _$jscoverage['/base/style.js'].lineData[141]++;
    style.minWidth = minWidth;
    _$jscoverage['/base/style.js'].lineData[142]++;
    style.maxWidth = maxWidth;
  }
  _$jscoverage['/base/style.js'].lineData[145]++;
  return val;
}, 
  style: function(selector, name, val) {
  _$jscoverage['/base/style.js'].functionData[6]++;
  _$jscoverage['/base/style.js'].lineData[158]++;
  var els = Dom.query(selector), k, ret, elem = els[0], i;
  _$jscoverage['/base/style.js'].lineData[163]++;
  if (visit409_163_1(S.isPlainObject(name))) {
    _$jscoverage['/base/style.js'].lineData[164]++;
    for (k in name) {
      _$jscoverage['/base/style.js'].lineData[165]++;
      for (i = els.length - 1; visit410_165_1(i >= 0); i--) {
        _$jscoverage['/base/style.js'].lineData[166]++;
        style(els[i], k, name[k]);
      }
    }
    _$jscoverage['/base/style.js'].lineData[169]++;
    return undefined;
  }
  _$jscoverage['/base/style.js'].lineData[171]++;
  if (visit411_171_1(val === undefined)) {
    _$jscoverage['/base/style.js'].lineData[172]++;
    ret = '';
    _$jscoverage['/base/style.js'].lineData[173]++;
    if (visit412_173_1(elem)) {
      _$jscoverage['/base/style.js'].lineData[174]++;
      ret = style(elem, name, val);
    }
    _$jscoverage['/base/style.js'].lineData[176]++;
    return ret;
  } else {
    _$jscoverage['/base/style.js'].lineData[178]++;
    for (i = els.length - 1; visit413_178_1(i >= 0); i--) {
      _$jscoverage['/base/style.js'].lineData[179]++;
      style(els[i], name, val);
    }
  }
  _$jscoverage['/base/style.js'].lineData[182]++;
  return undefined;
}, 
  css: function(selector, name, val) {
  _$jscoverage['/base/style.js'].functionData[7]++;
  _$jscoverage['/base/style.js'].lineData[195]++;
  var els = Dom.query(selector), elem = els[0], k, hook, ret, i;
  _$jscoverage['/base/style.js'].lineData[202]++;
  if (visit414_202_1(S.isPlainObject(name))) {
    _$jscoverage['/base/style.js'].lineData[203]++;
    for (k in name) {
      _$jscoverage['/base/style.js'].lineData[204]++;
      for (i = els.length - 1; visit415_204_1(i >= 0); i--) {
        _$jscoverage['/base/style.js'].lineData[205]++;
        style(els[i], k, name[k]);
      }
    }
    _$jscoverage['/base/style.js'].lineData[208]++;
    return undefined;
  }
  _$jscoverage['/base/style.js'].lineData[211]++;
  name = camelCase(name);
  _$jscoverage['/base/style.js'].lineData[212]++;
  hook = cssHooks[name];
  _$jscoverage['/base/style.js'].lineData[214]++;
  if (visit416_214_1(val === undefined)) {
    _$jscoverage['/base/style.js'].lineData[216]++;
    ret = '';
    _$jscoverage['/base/style.js'].lineData[217]++;
    if (visit417_217_1(elem)) {
      _$jscoverage['/base/style.js'].lineData[219]++;
      if (visit418_219_1(!(visit419_219_2(hook && visit420_219_3('get' in hook && visit421_220_1((ret = hook.get(elem, true)) !== undefined)))))) {
        _$jscoverage['/base/style.js'].lineData[222]++;
        ret = Dom._getComputedStyle(elem, name);
      }
    }
    _$jscoverage['/base/style.js'].lineData[225]++;
    return (visit422_225_1(typeof ret === 'undefined')) ? '' : ret;
  } else {
    _$jscoverage['/base/style.js'].lineData[229]++;
    for (i = els.length - 1; visit423_229_1(i >= 0); i--) {
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
  for (i = els.length - 1; visit424_245_1(i >= 0); i--) {
    _$jscoverage['/base/style.js'].lineData[246]++;
    elem = els[i];
    _$jscoverage['/base/style.js'].lineData[247]++;
    elem.style[DISPLAY] = visit425_247_1(Dom.data(elem, OLD_DISPLAY) || EMPTY);
    _$jscoverage['/base/style.js'].lineData[249]++;
    if (visit426_249_1(Dom.css(elem, DISPLAY) === NONE)) {
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
  for (i = els.length - 1; visit427_265_1(i >= 0); i--) {
    _$jscoverage['/base/style.js'].lineData[266]++;
    elem = els[i];
    _$jscoverage['/base/style.js'].lineData[267]++;
    var style = elem.style, old = style[DISPLAY];
    _$jscoverage['/base/style.js'].lineData[269]++;
    if (visit428_269_1(old !== NONE)) {
      _$jscoverage['/base/style.js'].lineData[270]++;
      if (visit429_270_1(old)) {
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
  for (i = els.length - 1; visit430_285_1(i >= 0); i--) {
    _$jscoverage['/base/style.js'].lineData[286]++;
    elem = els[i];
    _$jscoverage['/base/style.js'].lineData[287]++;
    if (visit431_287_1(Dom.css(elem, DISPLAY) === NONE)) {
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
  if (visit432_304_1(typeof refWin === 'string')) {
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
  if (visit433_314_1(id && (id = id.replace('#', EMPTY)))) {
    _$jscoverage['/base/style.js'].lineData[315]++;
    elem = Dom.get('#' + id, doc);
  }
  _$jscoverage['/base/style.js'].lineData[319]++;
  if (visit434_319_1(elem)) {
    _$jscoverage['/base/style.js'].lineData[320]++;
    return;
  }
  _$jscoverage['/base/style.js'].lineData[323]++;
  elem = Dom.create('<style>', {
  id: id}, doc);
  _$jscoverage['/base/style.js'].lineData[326]++;
  Dom.get('head', doc).appendChild(elem);
  _$jscoverage['/base/style.js'].lineData[328]++;
  if (visit435_328_1(elem.styleSheet)) {
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
  for (j = _els.length - 1; visit436_348_1(j >= 0); j--) {
    _$jscoverage['/base/style.js'].lineData[349]++;
    elem = _els[j];
    _$jscoverage['/base/style.js'].lineData[350]++;
    style = elem.style;
    _$jscoverage['/base/style.js'].lineData[351]++;
    if (visit437_351_1(userSelectProperty !== undefined)) {
      _$jscoverage['/base/style.js'].lineData[352]++;
      style[userSelectProperty] = 'none';
    } else {
      _$jscoverage['/base/style.js'].lineData[353]++;
      if (visit438_353_1(UA.ie)) {
        _$jscoverage['/base/style.js'].lineData[354]++;
        els = elem.getElementsByTagName('*');
        _$jscoverage['/base/style.js'].lineData[355]++;
        elem.setAttribute('unselectable', 'on');
        _$jscoverage['/base/style.js'].lineData[356]++;
        excludes = ['iframe', 'textarea', 'input', 'select'];
        _$jscoverage['/base/style.js'].lineData[357]++;
        while ((e = els[i++])) {
          _$jscoverage['/base/style.js'].lineData[358]++;
          if (visit439_358_1(!S.inArray(getNodeName(e), excludes))) {
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
  return visit440_423_1(el && getWHIgnoreDisplay(el, name, 'padding'));
};
  _$jscoverage['/base/style.js'].lineData[426]++;
  Dom['outer' + S.ucfirst(name)] = function(selector, includeMargin) {
  _$jscoverage['/base/style.js'].functionData[15]++;
  _$jscoverage['/base/style.js'].lineData[427]++;
  var el = Dom.get(selector);
  _$jscoverage['/base/style.js'].lineData[428]++;
  return visit441_428_1(el && getWHIgnoreDisplay(el, name, includeMargin ? 'margin' : 'border'));
};
  _$jscoverage['/base/style.js'].lineData[431]++;
  Dom[name] = function(selector, val) {
  _$jscoverage['/base/style.js'].functionData[16]++;
  _$jscoverage['/base/style.js'].lineData[432]++;
  var ret = Dom.css(selector, name, val);
  _$jscoverage['/base/style.js'].lineData[433]++;
  if (visit442_433_1(ret)) {
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
  if (visit443_448_1(computed)) {
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
  if (visit444_464_1(computed)) {
    _$jscoverage['/base/style.js'].lineData[465]++;
    position = Dom.css(el, 'position');
    _$jscoverage['/base/style.js'].lineData[466]++;
    if (visit445_466_1(position === 'static')) {
      _$jscoverage['/base/style.js'].lineData[467]++;
      return 'auto';
    }
    _$jscoverage['/base/style.js'].lineData[469]++;
    val = Dom._getComputedStyle(el, name);
    _$jscoverage['/base/style.js'].lineData[470]++;
    isAutoPosition = visit446_470_1(val === 'auto');
    _$jscoverage['/base/style.js'].lineData[471]++;
    if (visit447_471_1(isAutoPosition && visit448_471_2(position === 'relative'))) {
      _$jscoverage['/base/style.js'].lineData[472]++;
      return '0px';
    }
    _$jscoverage['/base/style.js'].lineData[475]++;
    if (visit449_475_1(isAutoPosition || NO_PX_REG.test(val))) {
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
    var elStyle, ret, hook;
    _$jscoverage['/base/style.js'].lineData[507]++;
    if (visit450_507_1(visit451_507_2(elem.nodeType === 3) || visit452_508_1(visit453_508_2(elem.nodeType === 8) || !(elStyle = elem.style)))) {
      _$jscoverage['/base/style.js'].lineData[509]++;
      return undefined;
    }
    _$jscoverage['/base/style.js'].lineData[511]++;
    name = camelCase(name);
    _$jscoverage['/base/style.js'].lineData[512]++;
    hook = cssHooks[name];
    _$jscoverage['/base/style.js'].lineData[513]++;
    name = visit454_513_1(cssProps[name] || name);
    _$jscoverage['/base/style.js'].lineData[515]++;
    if (visit455_515_1(val !== undefined)) {
      _$jscoverage['/base/style.js'].lineData[517]++;
      if (visit456_517_1(visit457_517_2(val === null) || visit458_517_3(val === EMPTY))) {
        _$jscoverage['/base/style.js'].lineData[518]++;
        val = EMPTY;
      } else {
        _$jscoverage['/base/style.js'].lineData[521]++;
        if (visit459_521_1(!isNaN(Number(val)) && !cssNumber[name])) {
          _$jscoverage['/base/style.js'].lineData[522]++;
          val += DEFAULT_UNIT;
        }
      }
      _$jscoverage['/base/style.js'].lineData[524]++;
      if (visit460_524_1(hook && hook.set)) {
        _$jscoverage['/base/style.js'].lineData[525]++;
        val = hook.set(elem, val);
      }
      _$jscoverage['/base/style.js'].lineData[527]++;
      if (visit461_527_1(val !== undefined)) {
        _$jscoverage['/base/style.js'].lineData[529]++;
        try {
          _$jscoverage['/base/style.js'].lineData[531]++;
          elStyle[name] = val;
        }        catch (e) {
  _$jscoverage['/base/style.js'].lineData[533]++;
  logger.warn('css set error:' + e);
}
        _$jscoverage['/base/style.js'].lineData[536]++;
        if (visit462_536_1(visit463_536_2(val === EMPTY) && elStyle.removeAttribute)) {
          _$jscoverage['/base/style.js'].lineData[537]++;
          elStyle.removeAttribute(name);
        }
      }
      _$jscoverage['/base/style.js'].lineData[540]++;
      if (visit464_540_1(!elStyle.cssText)) {
        _$jscoverage['/base/style.js'].lineData[543]++;
        if (visit465_543_1(UA.webkit)) {
          _$jscoverage['/base/style.js'].lineData[544]++;
          elStyle = elem.outerHTML;
        }
        _$jscoverage['/base/style.js'].lineData[546]++;
        elem.removeAttribute('style');
      }
      _$jscoverage['/base/style.js'].lineData[548]++;
      return undefined;
    } else {
      _$jscoverage['/base/style.js'].lineData[553]++;
      if (visit466_553_1(!(visit467_553_2(hook && visit468_553_3('get' in hook && visit469_554_1((ret = hook.get(elem, false)) !== undefined)))))) {
        _$jscoverage['/base/style.js'].lineData[556]++;
        ret = elStyle[name];
      }
      _$jscoverage['/base/style.js'].lineData[558]++;
      return visit470_558_1(ret === undefined) ? '' : ret;
    }
  }
  _$jscoverage['/base/style.js'].lineData[563]++;
  function getWHIgnoreDisplay(elem) {
    _$jscoverage['/base/style.js'].functionData[22]++;
    _$jscoverage['/base/style.js'].lineData[564]++;
    var val, args = arguments;
    _$jscoverage['/base/style.js'].lineData[567]++;
    if (visit471_567_1(elem.offsetWidth !== 0)) {
      _$jscoverage['/base/style.js'].lineData[568]++;
      val = getWH.apply(undefined, args);
    } else {
      _$jscoverage['/base/style.js'].lineData[570]++;
      swap(elem, cssShow, function() {
  _$jscoverage['/base/style.js'].functionData[23]++;
  _$jscoverage['/base/style.js'].lineData[571]++;
  val = getWH.apply(undefined, args);
});
    }
    _$jscoverage['/base/style.js'].lineData[574]++;
    return val;
  }
  _$jscoverage['/base/style.js'].lineData[586]++;
  function getWH(elem, name, extra) {
    _$jscoverage['/base/style.js'].functionData[24]++;
    _$jscoverage['/base/style.js'].lineData[587]++;
    if (visit472_587_1(S.isWindow(elem))) {
      _$jscoverage['/base/style.js'].lineData[588]++;
      return visit473_588_1(name === WIDTH) ? Dom.viewportWidth(elem) : Dom.viewportHeight(elem);
    } else {
      _$jscoverage['/base/style.js'].lineData[589]++;
      if (visit474_589_1(elem.nodeType === 9)) {
        _$jscoverage['/base/style.js'].lineData[590]++;
        return visit475_590_1(name === WIDTH) ? Dom.docWidth(elem) : Dom.docHeight(elem);
      }
    }
    _$jscoverage['/base/style.js'].lineData[592]++;
    var which = visit476_592_1(name === WIDTH) ? ['Left', 'Right'] : ['Top', 'Bottom'], val = visit477_593_1(name === WIDTH) ? elem.offsetWidth : elem.offsetHeight;
    _$jscoverage['/base/style.js'].lineData[595]++;
    if (visit478_595_1(val > 0)) {
      _$jscoverage['/base/style.js'].lineData[596]++;
      if (visit479_596_1(extra !== 'border')) {
        _$jscoverage['/base/style.js'].lineData[597]++;
        S.each(which, function(w) {
  _$jscoverage['/base/style.js'].functionData[25]++;
  _$jscoverage['/base/style.js'].lineData[598]++;
  if (visit480_598_1(!extra)) {
    _$jscoverage['/base/style.js'].lineData[599]++;
    val -= visit481_599_1(parseFloat(Dom.css(elem, 'padding' + w)) || 0);
  }
  _$jscoverage['/base/style.js'].lineData[601]++;
  if (visit482_601_1(extra === 'margin')) {
    _$jscoverage['/base/style.js'].lineData[602]++;
    val += visit483_602_1(parseFloat(Dom.css(elem, extra + w)) || 0);
  } else {
    _$jscoverage['/base/style.js'].lineData[604]++;
    val -= visit484_604_1(parseFloat(Dom.css(elem, 'border' + w + 'Width')) || 0);
  }
});
      }
      _$jscoverage['/base/style.js'].lineData[609]++;
      return val;
    }
    _$jscoverage['/base/style.js'].lineData[613]++;
    val = Dom._getComputedStyle(elem, name);
    _$jscoverage['/base/style.js'].lineData[614]++;
    if (visit485_614_1(visit486_614_2(val === null) || visit487_614_3((Number(val)) < 0))) {
      _$jscoverage['/base/style.js'].lineData[615]++;
      val = visit488_615_1(elem.style[name] || 0);
    }
    _$jscoverage['/base/style.js'].lineData[618]++;
    val = visit489_618_1(parseFloat(val) || 0);
    _$jscoverage['/base/style.js'].lineData[621]++;
    if (visit490_621_1(extra)) {
      _$jscoverage['/base/style.js'].lineData[622]++;
      S.each(which, function(w) {
  _$jscoverage['/base/style.js'].functionData[26]++;
  _$jscoverage['/base/style.js'].lineData[623]++;
  val += visit491_623_1(parseFloat(Dom.css(elem, 'padding' + w)) || 0);
  _$jscoverage['/base/style.js'].lineData[624]++;
  if (visit492_624_1(extra !== 'padding')) {
    _$jscoverage['/base/style.js'].lineData[625]++;
    val += visit493_625_1(parseFloat(Dom.css(elem, 'border' + w + 'Width')) || 0);
  }
  _$jscoverage['/base/style.js'].lineData[627]++;
  if (visit494_627_1(extra === 'margin')) {
    _$jscoverage['/base/style.js'].lineData[628]++;
    val += visit495_628_1(parseFloat(Dom.css(elem, extra + w)) || 0);
  }
});
    }
    _$jscoverage['/base/style.js'].lineData[633]++;
    return val;
  }
  _$jscoverage['/base/style.js'].lineData[636]++;
  var ROOT_REG = /^(?:body|html)$/i;
  _$jscoverage['/base/style.js'].lineData[638]++;
  function getPosition(el) {
    _$jscoverage['/base/style.js'].functionData[27]++;
    _$jscoverage['/base/style.js'].lineData[639]++;
    var offsetParent, offset, parentOffset = {
  top: 0, 
  left: 0};
    _$jscoverage['/base/style.js'].lineData[643]++;
    if (visit496_643_1(Dom.css(el, 'position') === 'fixed')) {
      _$jscoverage['/base/style.js'].lineData[644]++;
      offset = el.getBoundingClientRect();
    } else {
      _$jscoverage['/base/style.js'].lineData[649]++;
      offsetParent = getOffsetParent(el);
      _$jscoverage['/base/style.js'].lineData[650]++;
      offset = Dom.offset(el);
      _$jscoverage['/base/style.js'].lineData[651]++;
      parentOffset = Dom.offset(offsetParent);
      _$jscoverage['/base/style.js'].lineData[652]++;
      parentOffset.top += visit497_652_1(parseFloat(Dom.css(offsetParent, 'borderTopWidth')) || 0);
      _$jscoverage['/base/style.js'].lineData[653]++;
      parentOffset.left += visit498_653_1(parseFloat(Dom.css(offsetParent, 'borderLeftWidth')) || 0);
    }
    _$jscoverage['/base/style.js'].lineData[656]++;
    offset.top -= visit499_656_1(parseFloat(Dom.css(el, 'marginTop')) || 0);
    _$jscoverage['/base/style.js'].lineData[657]++;
    offset.left -= visit500_657_1(parseFloat(Dom.css(el, 'marginLeft')) || 0);
    _$jscoverage['/base/style.js'].lineData[661]++;
    return {
  top: offset.top - parentOffset.top, 
  left: offset.left - parentOffset.left};
  }
  _$jscoverage['/base/style.js'].lineData[667]++;
  function getOffsetParent(el) {
    _$jscoverage['/base/style.js'].functionData[28]++;
    _$jscoverage['/base/style.js'].lineData[668]++;
    var offsetParent = visit501_668_1(el.offsetParent || (visit502_668_2(el.ownerDocument || doc)).body);
    _$jscoverage['/base/style.js'].lineData[669]++;
    while (visit503_669_1(offsetParent && visit504_669_2(!ROOT_REG.test(offsetParent.nodeName) && visit505_670_1(Dom.css(offsetParent, 'position') === 'static')))) {
      _$jscoverage['/base/style.js'].lineData[671]++;
      offsetParent = offsetParent.offsetParent;
    }
    _$jscoverage['/base/style.js'].lineData[673]++;
    return offsetParent;
  }
  _$jscoverage['/base/style.js'].lineData[676]++;
  return Dom;
});
