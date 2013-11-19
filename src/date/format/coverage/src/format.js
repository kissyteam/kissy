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
if (! _$jscoverage['/format.js']) {
  _$jscoverage['/format.js'] = {};
  _$jscoverage['/format.js'].lineData = [];
  _$jscoverage['/format.js'].lineData[7] = 0;
  _$jscoverage['/format.js'].lineData[8] = 0;
  _$jscoverage['/format.js'].lineData[9] = 0;
  _$jscoverage['/format.js'].lineData[10] = 0;
  _$jscoverage['/format.js'].lineData[11] = 0;
  _$jscoverage['/format.js'].lineData[60] = 0;
  _$jscoverage['/format.js'].lineData[63] = 0;
  _$jscoverage['/format.js'].lineData[65] = 0;
  _$jscoverage['/format.js'].lineData[67] = 0;
  _$jscoverage['/format.js'].lineData[68] = 0;
  _$jscoverage['/format.js'].lineData[69] = 0;
  _$jscoverage['/format.js'].lineData[70] = 0;
  _$jscoverage['/format.js'].lineData[71] = 0;
  _$jscoverage['/format.js'].lineData[72] = 0;
  _$jscoverage['/format.js'].lineData[73] = 0;
  _$jscoverage['/format.js'].lineData[74] = 0;
  _$jscoverage['/format.js'].lineData[75] = 0;
  _$jscoverage['/format.js'].lineData[76] = 0;
  _$jscoverage['/format.js'].lineData[77] = 0;
  _$jscoverage['/format.js'].lineData[78] = 0;
  _$jscoverage['/format.js'].lineData[79] = 0;
  _$jscoverage['/format.js'].lineData[81] = 0;
  _$jscoverage['/format.js'].lineData[82] = 0;
  _$jscoverage['/format.js'].lineData[85] = 0;
  _$jscoverage['/format.js'].lineData[90] = 0;
  _$jscoverage['/format.js'].lineData[91] = 0;
  _$jscoverage['/format.js'].lineData[97] = 0;
  _$jscoverage['/format.js'].lineData[98] = 0;
  _$jscoverage['/format.js'].lineData[99] = 0;
  _$jscoverage['/format.js'].lineData[100] = 0;
  _$jscoverage['/format.js'].lineData[101] = 0;
  _$jscoverage['/format.js'].lineData[102] = 0;
  _$jscoverage['/format.js'].lineData[103] = 0;
  _$jscoverage['/format.js'].lineData[105] = 0;
  _$jscoverage['/format.js'].lineData[106] = 0;
  _$jscoverage['/format.js'].lineData[108] = 0;
  _$jscoverage['/format.js'].lineData[111] = 0;
  _$jscoverage['/format.js'].lineData[112] = 0;
  _$jscoverage['/format.js'].lineData[113] = 0;
  _$jscoverage['/format.js'].lineData[114] = 0;
  _$jscoverage['/format.js'].lineData[115] = 0;
  _$jscoverage['/format.js'].lineData[116] = 0;
  _$jscoverage['/format.js'].lineData[117] = 0;
  _$jscoverage['/format.js'].lineData[118] = 0;
  _$jscoverage['/format.js'].lineData[120] = 0;
  _$jscoverage['/format.js'].lineData[121] = 0;
  _$jscoverage['/format.js'].lineData[123] = 0;
  _$jscoverage['/format.js'].lineData[126] = 0;
  _$jscoverage['/format.js'].lineData[127] = 0;
  _$jscoverage['/format.js'].lineData[128] = 0;
  _$jscoverage['/format.js'].lineData[129] = 0;
  _$jscoverage['/format.js'].lineData[130] = 0;
  _$jscoverage['/format.js'].lineData[132] = 0;
  _$jscoverage['/format.js'].lineData[133] = 0;
  _$jscoverage['/format.js'].lineData[135] = 0;
  _$jscoverage['/format.js'].lineData[138] = 0;
  _$jscoverage['/format.js'].lineData[140] = 0;
  _$jscoverage['/format.js'].lineData[142] = 0;
  _$jscoverage['/format.js'].lineData[143] = 0;
  _$jscoverage['/format.js'].lineData[144] = 0;
  _$jscoverage['/format.js'].lineData[146] = 0;
  _$jscoverage['/format.js'].lineData[147] = 0;
  _$jscoverage['/format.js'].lineData[148] = 0;
  _$jscoverage['/format.js'].lineData[149] = 0;
  _$jscoverage['/format.js'].lineData[150] = 0;
  _$jscoverage['/format.js'].lineData[152] = 0;
  _$jscoverage['/format.js'].lineData[155] = 0;
  _$jscoverage['/format.js'].lineData[158] = 0;
  _$jscoverage['/format.js'].lineData[159] = 0;
  _$jscoverage['/format.js'].lineData[163] = 0;
  _$jscoverage['/format.js'].lineData[164] = 0;
  _$jscoverage['/format.js'].lineData[165] = 0;
  _$jscoverage['/format.js'].lineData[166] = 0;
  _$jscoverage['/format.js'].lineData[168] = 0;
  _$jscoverage['/format.js'].lineData[169] = 0;
  _$jscoverage['/format.js'].lineData[170] = 0;
  _$jscoverage['/format.js'].lineData[173] = 0;
  _$jscoverage['/format.js'].lineData[174] = 0;
  _$jscoverage['/format.js'].lineData[177] = 0;
  _$jscoverage['/format.js'].lineData[178] = 0;
  _$jscoverage['/format.js'].lineData[181] = 0;
  _$jscoverage['/format.js'].lineData[184] = 0;
  _$jscoverage['/format.js'].lineData[187] = 0;
  _$jscoverage['/format.js'].lineData[192] = 0;
  _$jscoverage['/format.js'].lineData[193] = 0;
  _$jscoverage['/format.js'].lineData[194] = 0;
  _$jscoverage['/format.js'].lineData[195] = 0;
  _$jscoverage['/format.js'].lineData[196] = 0;
  _$jscoverage['/format.js'].lineData[197] = 0;
  _$jscoverage['/format.js'].lineData[199] = 0;
  _$jscoverage['/format.js'].lineData[200] = 0;
  _$jscoverage['/format.js'].lineData[201] = 0;
  _$jscoverage['/format.js'].lineData[202] = 0;
  _$jscoverage['/format.js'].lineData[203] = 0;
  _$jscoverage['/format.js'].lineData[204] = 0;
  _$jscoverage['/format.js'].lineData[206] = 0;
  _$jscoverage['/format.js'].lineData[207] = 0;
  _$jscoverage['/format.js'].lineData[211] = 0;
  _$jscoverage['/format.js'].lineData[212] = 0;
  _$jscoverage['/format.js'].lineData[340] = 0;
  _$jscoverage['/format.js'].lineData[341] = 0;
  _$jscoverage['/format.js'].lineData[342] = 0;
  _$jscoverage['/format.js'].lineData[343] = 0;
  _$jscoverage['/format.js'].lineData[346] = 0;
  _$jscoverage['/format.js'].lineData[347] = 0;
  _$jscoverage['/format.js'].lineData[349] = 0;
  _$jscoverage['/format.js'].lineData[351] = 0;
  _$jscoverage['/format.js'].lineData[352] = 0;
  _$jscoverage['/format.js'].lineData[353] = 0;
  _$jscoverage['/format.js'].lineData[355] = 0;
  _$jscoverage['/format.js'].lineData[356] = 0;
  _$jscoverage['/format.js'].lineData[357] = 0;
  _$jscoverage['/format.js'].lineData[359] = 0;
  _$jscoverage['/format.js'].lineData[360] = 0;
  _$jscoverage['/format.js'].lineData[362] = 0;
  _$jscoverage['/format.js'].lineData[363] = 0;
  _$jscoverage['/format.js'].lineData[364] = 0;
  _$jscoverage['/format.js'].lineData[365] = 0;
  _$jscoverage['/format.js'].lineData[366] = 0;
  _$jscoverage['/format.js'].lineData[368] = 0;
  _$jscoverage['/format.js'].lineData[370] = 0;
  _$jscoverage['/format.js'].lineData[372] = 0;
  _$jscoverage['/format.js'].lineData[374] = 0;
  _$jscoverage['/format.js'].lineData[376] = 0;
  _$jscoverage['/format.js'].lineData[377] = 0;
  _$jscoverage['/format.js'].lineData[380] = 0;
  _$jscoverage['/format.js'].lineData[382] = 0;
  _$jscoverage['/format.js'].lineData[385] = 0;
  _$jscoverage['/format.js'].lineData[387] = 0;
  _$jscoverage['/format.js'].lineData[389] = 0;
  _$jscoverage['/format.js'].lineData[391] = 0;
  _$jscoverage['/format.js'].lineData[393] = 0;
  _$jscoverage['/format.js'].lineData[395] = 0;
  _$jscoverage['/format.js'].lineData[396] = 0;
  _$jscoverage['/format.js'].lineData[397] = 0;
  _$jscoverage['/format.js'].lineData[398] = 0;
  _$jscoverage['/format.js'].lineData[400] = 0;
  _$jscoverage['/format.js'].lineData[401] = 0;
  _$jscoverage['/format.js'].lineData[412] = 0;
  _$jscoverage['/format.js'].lineData[413] = 0;
  _$jscoverage['/format.js'].lineData[414] = 0;
  _$jscoverage['/format.js'].lineData[416] = 0;
  _$jscoverage['/format.js'].lineData[419] = 0;
  _$jscoverage['/format.js'].lineData[420] = 0;
  _$jscoverage['/format.js'].lineData[424] = 0;
  _$jscoverage['/format.js'].lineData[425] = 0;
  _$jscoverage['/format.js'].lineData[426] = 0;
  _$jscoverage['/format.js'].lineData[427] = 0;
  _$jscoverage['/format.js'].lineData[429] = 0;
  _$jscoverage['/format.js'].lineData[430] = 0;
  _$jscoverage['/format.js'].lineData[433] = 0;
  _$jscoverage['/format.js'].lineData[439] = 0;
  _$jscoverage['/format.js'].lineData[440] = 0;
  _$jscoverage['/format.js'].lineData[441] = 0;
  _$jscoverage['/format.js'].lineData[442] = 0;
  _$jscoverage['/format.js'].lineData[445] = 0;
  _$jscoverage['/format.js'].lineData[448] = 0;
  _$jscoverage['/format.js'].lineData[449] = 0;
  _$jscoverage['/format.js'].lineData[451] = 0;
  _$jscoverage['/format.js'].lineData[452] = 0;
  _$jscoverage['/format.js'].lineData[453] = 0;
  _$jscoverage['/format.js'].lineData[454] = 0;
  _$jscoverage['/format.js'].lineData[457] = 0;
  _$jscoverage['/format.js'].lineData[460] = 0;
  _$jscoverage['/format.js'].lineData[461] = 0;
  _$jscoverage['/format.js'].lineData[462] = 0;
  _$jscoverage['/format.js'].lineData[463] = 0;
  _$jscoverage['/format.js'].lineData[464] = 0;
  _$jscoverage['/format.js'].lineData[466] = 0;
  _$jscoverage['/format.js'].lineData[467] = 0;
  _$jscoverage['/format.js'].lineData[468] = 0;
  _$jscoverage['/format.js'].lineData[471] = 0;
  _$jscoverage['/format.js'].lineData[473] = 0;
  _$jscoverage['/format.js'].lineData[474] = 0;
  _$jscoverage['/format.js'].lineData[475] = 0;
  _$jscoverage['/format.js'].lineData[477] = 0;
  _$jscoverage['/format.js'].lineData[483] = 0;
  _$jscoverage['/format.js'].lineData[484] = 0;
  _$jscoverage['/format.js'].lineData[485] = 0;
  _$jscoverage['/format.js'].lineData[486] = 0;
  _$jscoverage['/format.js'].lineData[488] = 0;
  _$jscoverage['/format.js'].lineData[490] = 0;
  _$jscoverage['/format.js'].lineData[491] = 0;
  _$jscoverage['/format.js'].lineData[492] = 0;
  _$jscoverage['/format.js'].lineData[493] = 0;
  _$jscoverage['/format.js'].lineData[494] = 0;
  _$jscoverage['/format.js'].lineData[497] = 0;
  _$jscoverage['/format.js'].lineData[500] = 0;
  _$jscoverage['/format.js'].lineData[502] = 0;
  _$jscoverage['/format.js'].lineData[503] = 0;
  _$jscoverage['/format.js'].lineData[504] = 0;
  _$jscoverage['/format.js'].lineData[505] = 0;
  _$jscoverage['/format.js'].lineData[506] = 0;
  _$jscoverage['/format.js'].lineData[509] = 0;
  _$jscoverage['/format.js'].lineData[511] = 0;
  _$jscoverage['/format.js'].lineData[513] = 0;
  _$jscoverage['/format.js'].lineData[514] = 0;
  _$jscoverage['/format.js'].lineData[515] = 0;
  _$jscoverage['/format.js'].lineData[517] = 0;
  _$jscoverage['/format.js'].lineData[520] = 0;
  _$jscoverage['/format.js'].lineData[521] = 0;
  _$jscoverage['/format.js'].lineData[524] = 0;
  _$jscoverage['/format.js'].lineData[525] = 0;
  _$jscoverage['/format.js'].lineData[527] = 0;
  _$jscoverage['/format.js'].lineData[529] = 0;
  _$jscoverage['/format.js'].lineData[530] = 0;
  _$jscoverage['/format.js'].lineData[532] = 0;
  _$jscoverage['/format.js'].lineData[534] = 0;
  _$jscoverage['/format.js'].lineData[537] = 0;
  _$jscoverage['/format.js'].lineData[539] = 0;
  _$jscoverage['/format.js'].lineData[541] = 0;
  _$jscoverage['/format.js'].lineData[542] = 0;
  _$jscoverage['/format.js'].lineData[543] = 0;
  _$jscoverage['/format.js'].lineData[544] = 0;
  _$jscoverage['/format.js'].lineData[545] = 0;
  _$jscoverage['/format.js'].lineData[546] = 0;
  _$jscoverage['/format.js'].lineData[550] = 0;
  _$jscoverage['/format.js'].lineData[553] = 0;
  _$jscoverage['/format.js'].lineData[555] = 0;
  _$jscoverage['/format.js'].lineData[556] = 0;
  _$jscoverage['/format.js'].lineData[557] = 0;
  _$jscoverage['/format.js'].lineData[558] = 0;
  _$jscoverage['/format.js'].lineData[560] = 0;
  _$jscoverage['/format.js'].lineData[562] = 0;
  _$jscoverage['/format.js'].lineData[564] = 0;
  _$jscoverage['/format.js'].lineData[565] = 0;
  _$jscoverage['/format.js'].lineData[566] = 0;
  _$jscoverage['/format.js'].lineData[567] = 0;
  _$jscoverage['/format.js'].lineData[569] = 0;
  _$jscoverage['/format.js'].lineData[571] = 0;
  _$jscoverage['/format.js'].lineData[573] = 0;
  _$jscoverage['/format.js'].lineData[574] = 0;
  _$jscoverage['/format.js'].lineData[576] = 0;
  _$jscoverage['/format.js'].lineData[577] = 0;
  _$jscoverage['/format.js'].lineData[578] = 0;
  _$jscoverage['/format.js'].lineData[579] = 0;
  _$jscoverage['/format.js'].lineData[580] = 0;
  _$jscoverage['/format.js'].lineData[582] = 0;
  _$jscoverage['/format.js'].lineData[584] = 0;
  _$jscoverage['/format.js'].lineData[585] = 0;
  _$jscoverage['/format.js'].lineData[586] = 0;
  _$jscoverage['/format.js'].lineData[587] = 0;
  _$jscoverage['/format.js'].lineData[588] = 0;
  _$jscoverage['/format.js'].lineData[590] = 0;
  _$jscoverage['/format.js'].lineData[592] = 0;
  _$jscoverage['/format.js'].lineData[603] = 0;
  _$jscoverage['/format.js'].lineData[604] = 0;
  _$jscoverage['/format.js'].lineData[605] = 0;
  _$jscoverage['/format.js'].lineData[608] = 0;
  _$jscoverage['/format.js'].lineData[609] = 0;
  _$jscoverage['/format.js'].lineData[611] = 0;
  _$jscoverage['/format.js'].lineData[614] = 0;
  _$jscoverage['/format.js'].lineData[621] = 0;
  _$jscoverage['/format.js'].lineData[622] = 0;
  _$jscoverage['/format.js'].lineData[624] = 0;
  _$jscoverage['/format.js'].lineData[625] = 0;
  _$jscoverage['/format.js'].lineData[629] = 0;
  _$jscoverage['/format.js'].lineData[630] = 0;
  _$jscoverage['/format.js'].lineData[631] = 0;
  _$jscoverage['/format.js'].lineData[632] = 0;
  _$jscoverage['/format.js'].lineData[633] = 0;
  _$jscoverage['/format.js'].lineData[634] = 0;
  _$jscoverage['/format.js'].lineData[637] = 0;
  _$jscoverage['/format.js'].lineData[646] = 0;
  _$jscoverage['/format.js'].lineData[659] = 0;
  _$jscoverage['/format.js'].lineData[660] = 0;
  _$jscoverage['/format.js'].lineData[661] = 0;
  _$jscoverage['/format.js'].lineData[662] = 0;
  _$jscoverage['/format.js'].lineData[663] = 0;
  _$jscoverage['/format.js'].lineData[664] = 0;
  _$jscoverage['/format.js'].lineData[665] = 0;
  _$jscoverage['/format.js'].lineData[666] = 0;
  _$jscoverage['/format.js'].lineData[668] = 0;
  _$jscoverage['/format.js'].lineData[669] = 0;
  _$jscoverage['/format.js'].lineData[670] = 0;
  _$jscoverage['/format.js'].lineData[671] = 0;
  _$jscoverage['/format.js'].lineData[674] = 0;
  _$jscoverage['/format.js'].lineData[676] = 0;
  _$jscoverage['/format.js'].lineData[677] = 0;
  _$jscoverage['/format.js'].lineData[678] = 0;
  _$jscoverage['/format.js'].lineData[679] = 0;
  _$jscoverage['/format.js'].lineData[680] = 0;
  _$jscoverage['/format.js'].lineData[681] = 0;
  _$jscoverage['/format.js'].lineData[683] = 0;
  _$jscoverage['/format.js'].lineData[684] = 0;
  _$jscoverage['/format.js'].lineData[685] = 0;
  _$jscoverage['/format.js'].lineData[689] = 0;
  _$jscoverage['/format.js'].lineData[697] = 0;
  _$jscoverage['/format.js'].lineData[698] = 0;
  _$jscoverage['/format.js'].lineData[704] = 0;
  _$jscoverage['/format.js'].lineData[705] = 0;
  _$jscoverage['/format.js'].lineData[706] = 0;
  _$jscoverage['/format.js'].lineData[707] = 0;
  _$jscoverage['/format.js'].lineData[708] = 0;
  _$jscoverage['/format.js'].lineData[710] = 0;
  _$jscoverage['/format.js'].lineData[714] = 0;
  _$jscoverage['/format.js'].lineData[727] = 0;
  _$jscoverage['/format.js'].lineData[739] = 0;
  _$jscoverage['/format.js'].lineData[752] = 0;
  _$jscoverage['/format.js'].lineData[753] = 0;
  _$jscoverage['/format.js'].lineData[754] = 0;
  _$jscoverage['/format.js'].lineData[755] = 0;
  _$jscoverage['/format.js'].lineData[757] = 0;
  _$jscoverage['/format.js'].lineData[758] = 0;
  _$jscoverage['/format.js'].lineData[759] = 0;
  _$jscoverage['/format.js'].lineData[761] = 0;
  _$jscoverage['/format.js'].lineData[762] = 0;
  _$jscoverage['/format.js'].lineData[763] = 0;
  _$jscoverage['/format.js'].lineData[764] = 0;
  _$jscoverage['/format.js'].lineData[769] = 0;
  _$jscoverage['/format.js'].lineData[772] = 0;
  _$jscoverage['/format.js'].lineData[784] = 0;
  _$jscoverage['/format.js'].lineData[788] = 0;
}
if (! _$jscoverage['/format.js'].functionData) {
  _$jscoverage['/format.js'].functionData = [];
  _$jscoverage['/format.js'].functionData[0] = 0;
  _$jscoverage['/format.js'].functionData[1] = 0;
  _$jscoverage['/format.js'].functionData[2] = 0;
  _$jscoverage['/format.js'].functionData[3] = 0;
  _$jscoverage['/format.js'].functionData[4] = 0;
  _$jscoverage['/format.js'].functionData[5] = 0;
  _$jscoverage['/format.js'].functionData[6] = 0;
  _$jscoverage['/format.js'].functionData[7] = 0;
  _$jscoverage['/format.js'].functionData[8] = 0;
  _$jscoverage['/format.js'].functionData[9] = 0;
  _$jscoverage['/format.js'].functionData[10] = 0;
  _$jscoverage['/format.js'].functionData[11] = 0;
  _$jscoverage['/format.js'].functionData[12] = 0;
  _$jscoverage['/format.js'].functionData[13] = 0;
  _$jscoverage['/format.js'].functionData[14] = 0;
  _$jscoverage['/format.js'].functionData[15] = 0;
  _$jscoverage['/format.js'].functionData[16] = 0;
  _$jscoverage['/format.js'].functionData[17] = 0;
}
if (! _$jscoverage['/format.js'].branchData) {
  _$jscoverage['/format.js'].branchData = {};
  _$jscoverage['/format.js'].branchData['105'] = [];
  _$jscoverage['/format.js'].branchData['105'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['108'] = [];
  _$jscoverage['/format.js'].branchData['108'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['111'] = [];
  _$jscoverage['/format.js'].branchData['111'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['113'] = [];
  _$jscoverage['/format.js'].branchData['113'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['115'] = [];
  _$jscoverage['/format.js'].branchData['115'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['120'] = [];
  _$jscoverage['/format.js'].branchData['120'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['126'] = [];
  _$jscoverage['/format.js'].branchData['126'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['127'] = [];
  _$jscoverage['/format.js'].branchData['127'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['142'] = [];
  _$jscoverage['/format.js'].branchData['142'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['146'] = [];
  _$jscoverage['/format.js'].branchData['146'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['146'][2] = new BranchData();
  _$jscoverage['/format.js'].branchData['146'][3] = new BranchData();
  _$jscoverage['/format.js'].branchData['146'][4] = new BranchData();
  _$jscoverage['/format.js'].branchData['146'][5] = new BranchData();
  _$jscoverage['/format.js'].branchData['146'][6] = new BranchData();
  _$jscoverage['/format.js'].branchData['146'][7] = new BranchData();
  _$jscoverage['/format.js'].branchData['146'][8] = new BranchData();
  _$jscoverage['/format.js'].branchData['147'] = [];
  _$jscoverage['/format.js'].branchData['147'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['158'] = [];
  _$jscoverage['/format.js'].branchData['158'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['163'] = [];
  _$jscoverage['/format.js'].branchData['163'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['163'][2] = new BranchData();
  _$jscoverage['/format.js'].branchData['163'][3] = new BranchData();
  _$jscoverage['/format.js'].branchData['173'] = [];
  _$jscoverage['/format.js'].branchData['173'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['177'] = [];
  _$jscoverage['/format.js'].branchData['177'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['192'] = [];
  _$jscoverage['/format.js'].branchData['192'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['193'] = [];
  _$jscoverage['/format.js'].branchData['193'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['194'] = [];
  _$jscoverage['/format.js'].branchData['194'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['195'] = [];
  _$jscoverage['/format.js'].branchData['195'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['195'][2] = new BranchData();
  _$jscoverage['/format.js'].branchData['195'][3] = new BranchData();
  _$jscoverage['/format.js'].branchData['195'][4] = new BranchData();
  _$jscoverage['/format.js'].branchData['195'][5] = new BranchData();
  _$jscoverage['/format.js'].branchData['196'] = [];
  _$jscoverage['/format.js'].branchData['196'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['196'][2] = new BranchData();
  _$jscoverage['/format.js'].branchData['196'][3] = new BranchData();
  _$jscoverage['/format.js'].branchData['201'] = [];
  _$jscoverage['/format.js'].branchData['201'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['201'][2] = new BranchData();
  _$jscoverage['/format.js'].branchData['201'][3] = new BranchData();
  _$jscoverage['/format.js'].branchData['202'] = [];
  _$jscoverage['/format.js'].branchData['202'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['206'] = [];
  _$jscoverage['/format.js'].branchData['206'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['206'][2] = new BranchData();
  _$jscoverage['/format.js'].branchData['206'][3] = new BranchData();
  _$jscoverage['/format.js'].branchData['341'] = [];
  _$jscoverage['/format.js'].branchData['341'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['351'] = [];
  _$jscoverage['/format.js'].branchData['351'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['356'] = [];
  _$jscoverage['/format.js'].branchData['356'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['359'] = [];
  _$jscoverage['/format.js'].branchData['359'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['363'] = [];
  _$jscoverage['/format.js'].branchData['363'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['365'] = [];
  _$jscoverage['/format.js'].branchData['365'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['372'] = [];
  _$jscoverage['/format.js'].branchData['372'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['377'] = [];
  _$jscoverage['/format.js'].branchData['377'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['382'] = [];
  _$jscoverage['/format.js'].branchData['382'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['388'] = [];
  _$jscoverage['/format.js'].branchData['388'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['396'] = [];
  _$jscoverage['/format.js'].branchData['396'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['424'] = [];
  _$jscoverage['/format.js'].branchData['424'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['427'] = [];
  _$jscoverage['/format.js'].branchData['427'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['427'][2] = new BranchData();
  _$jscoverage['/format.js'].branchData['433'] = [];
  _$jscoverage['/format.js'].branchData['433'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['440'] = [];
  _$jscoverage['/format.js'].branchData['440'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['441'] = [];
  _$jscoverage['/format.js'].branchData['441'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['451'] = [];
  _$jscoverage['/format.js'].branchData['451'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['453'] = [];
  _$jscoverage['/format.js'].branchData['453'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['453'][2] = new BranchData();
  _$jscoverage['/format.js'].branchData['453'][3] = new BranchData();
  _$jscoverage['/format.js'].branchData['462'] = [];
  _$jscoverage['/format.js'].branchData['462'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['463'] = [];
  _$jscoverage['/format.js'].branchData['463'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['467'] = [];
  _$jscoverage['/format.js'].branchData['467'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['474'] = [];
  _$jscoverage['/format.js'].branchData['474'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['485'] = [];
  _$jscoverage['/format.js'].branchData['485'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['490'] = [];
  _$jscoverage['/format.js'].branchData['490'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['491'] = [];
  _$jscoverage['/format.js'].branchData['491'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['492'] = [];
  _$jscoverage['/format.js'].branchData['492'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['502'] = [];
  _$jscoverage['/format.js'].branchData['502'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['504'] = [];
  _$jscoverage['/format.js'].branchData['504'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['505'] = [];
  _$jscoverage['/format.js'].branchData['505'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['514'] = [];
  _$jscoverage['/format.js'].branchData['514'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['515'] = [];
  _$jscoverage['/format.js'].branchData['515'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['515'][2] = new BranchData();
  _$jscoverage['/format.js'].branchData['520'] = [];
  _$jscoverage['/format.js'].branchData['520'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['524'] = [];
  _$jscoverage['/format.js'].branchData['524'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['529'] = [];
  _$jscoverage['/format.js'].branchData['529'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['534'] = [];
  _$jscoverage['/format.js'].branchData['534'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['534'][2] = new BranchData();
  _$jscoverage['/format.js'].branchData['541'] = [];
  _$jscoverage['/format.js'].branchData['541'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['542'] = [];
  _$jscoverage['/format.js'].branchData['542'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['543'] = [];
  _$jscoverage['/format.js'].branchData['543'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['545'] = [];
  _$jscoverage['/format.js'].branchData['545'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['555'] = [];
  _$jscoverage['/format.js'].branchData['555'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['557'] = [];
  _$jscoverage['/format.js'].branchData['557'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['564'] = [];
  _$jscoverage['/format.js'].branchData['564'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['566'] = [];
  _$jscoverage['/format.js'].branchData['566'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['573'] = [];
  _$jscoverage['/format.js'].branchData['573'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['576'] = [];
  _$jscoverage['/format.js'].branchData['576'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['579'] = [];
  _$jscoverage['/format.js'].branchData['579'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['584'] = [];
  _$jscoverage['/format.js'].branchData['584'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['587'] = [];
  _$jscoverage['/format.js'].branchData['587'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['603'] = [];
  _$jscoverage['/format.js'].branchData['603'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['608'] = [];
  _$jscoverage['/format.js'].branchData['608'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['629'] = [];
  _$jscoverage['/format.js'].branchData['629'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['631'] = [];
  _$jscoverage['/format.js'].branchData['631'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['633'] = [];
  _$jscoverage['/format.js'].branchData['633'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['660'] = [];
  _$jscoverage['/format.js'].branchData['660'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['660'][2] = new BranchData();
  _$jscoverage['/format.js'].branchData['660'][3] = new BranchData();
  _$jscoverage['/format.js'].branchData['663'] = [];
  _$jscoverage['/format.js'].branchData['663'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['665'] = [];
  _$jscoverage['/format.js'].branchData['665'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['668'] = [];
  _$jscoverage['/format.js'].branchData['668'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['669'] = [];
  _$jscoverage['/format.js'].branchData['669'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['676'] = [];
  _$jscoverage['/format.js'].branchData['676'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['679'] = [];
  _$jscoverage['/format.js'].branchData['679'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['680'] = [];
  _$jscoverage['/format.js'].branchData['680'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['684'] = [];
  _$jscoverage['/format.js'].branchData['684'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['684'][2] = new BranchData();
  _$jscoverage['/format.js'].branchData['684'][3] = new BranchData();
  _$jscoverage['/format.js'].branchData['697'] = [];
  _$jscoverage['/format.js'].branchData['697'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['704'] = [];
  _$jscoverage['/format.js'].branchData['704'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['752'] = [];
  _$jscoverage['/format.js'].branchData['752'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['754'] = [];
  _$jscoverage['/format.js'].branchData['754'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['758'] = [];
  _$jscoverage['/format.js'].branchData['758'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['762'] = [];
  _$jscoverage['/format.js'].branchData['762'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['763'] = [];
  _$jscoverage['/format.js'].branchData['763'][1] = new BranchData();
}
_$jscoverage['/format.js'].branchData['763'][1].init(21, 11, 'datePattern');
function visit120_763_1(result) {
  _$jscoverage['/format.js'].branchData['763'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['762'][1].init(408, 11, 'timePattern');
function visit119_762_1(result) {
  _$jscoverage['/format.js'].branchData['762'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['758'][1].init(250, 23, 'timeStyle !== undefined');
function visit118_758_1(result) {
  _$jscoverage['/format.js'].branchData['758'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['754'][1].init(97, 23, 'dateStyle !== undefined');
function visit117_754_1(result) {
  _$jscoverage['/format.js'].branchData['754'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['752'][1].init(22, 23, 'locale || defaultLocale');
function visit116_752_1(result) {
  _$jscoverage['/format.js'].branchData['752'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['704'][1].init(2447, 15, 'errorIndex >= 0');
function visit115_704_1(result) {
  _$jscoverage['/format.js'].branchData['704'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['697'][1].init(907, 27, 'startIndex == oldStartIndex');
function visit114_697_1(result) {
  _$jscoverage['/format.js'].branchData['697'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['684'][3].init(114, 8, 'c <= \'9\'');
function visit113_684_3(result) {
  _$jscoverage['/format.js'].branchData['684'][3].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['684'][2].init(102, 8, 'c >= \'0\'');
function visit112_684_2(result) {
  _$jscoverage['/format.js'].branchData['684'][2].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['684'][1].init(102, 20, 'c >= \'0\' && c <= \'9\'');
function visit111_684_1(result) {
  _$jscoverage['/format.js'].branchData['684'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['680'][1].init(33, 19, '\'field\' in nextComp');
function visit110_680_1(result) {
  _$jscoverage['/format.js'].branchData['680'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['679'][1].init(127, 8, 'nextComp');
function visit109_679_1(result) {
  _$jscoverage['/format.js'].branchData['679'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['676'][1].init(788, 15, '\'field\' in comp');
function visit108_676_1(result) {
  _$jscoverage['/format.js'].branchData['676'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['669'][1].init(37, 48, 'text.charAt(j) != dateStr.charAt(j + startIndex)');
function visit107_669_1(result) {
  _$jscoverage['/format.js'].branchData['669'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['668'][1].init(41, 11, 'j < textLen');
function visit106_668_1(result) {
  _$jscoverage['/format.js'].branchData['668'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['665'][1].init(77, 34, '(textLen + startIndex) > dateStrLen');
function visit105_665_1(result) {
  _$jscoverage['/format.js'].branchData['665'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['663'][1].init(131, 16, 'text = comp.text');
function visit104_663_1(result) {
  _$jscoverage['/format.js'].branchData['663'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['660'][3].init(47, 7, 'i < len');
function visit103_660_3(result) {
  _$jscoverage['/format.js'].branchData['660'][3].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['660'][2].init(29, 14, 'errorIndex < 0');
function visit102_660_2(result) {
  _$jscoverage['/format.js'].branchData['660'][2].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['660'][1].init(29, 25, 'errorIndex < 0 && i < len');
function visit101_660_1(result) {
  _$jscoverage['/format.js'].branchData['660'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['633'][1].init(142, 15, '\'field\' in comp');
function visit100_633_1(result) {
  _$jscoverage['/format.js'].branchData['633'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['631'][1].init(60, 9, 'comp.text');
function visit99_631_1(result) {
  _$jscoverage['/format.js'].branchData['631'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['629'][1].init(361, 7, 'i < len');
function visit98_629_1(result) {
  _$jscoverage['/format.js'].branchData['629'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['608'][1].init(4678, 5, 'match');
function visit97_608_1(result) {
  _$jscoverage['/format.js'].branchData['608'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['603'][1].init(289, 58, 'match = matchNumber(dateStr, startIndex, count, obeyCount)');
function visit96_603_1(result) {
  _$jscoverage['/format.js'].branchData['603'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['587'][1].init(131, 49, 'match = matchNumber(dateStr, startIndex, 2, true)');
function visit95_587_1(result) {
  _$jscoverage['/format.js'].branchData['587'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['584'][1].init(409, 49, 'match = matchNumber(dateStr, startIndex, 2, true)');
function visit94_584_1(result) {
  _$jscoverage['/format.js'].branchData['584'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['579'][1].init(267, 15, 'zoneChar == \'+\'');
function visit93_579_1(result) {
  _$jscoverage['/format.js'].branchData['579'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['576'][1].init(155, 15, 'zoneChar == \'-\'');
function visit92_576_1(result) {
  _$jscoverage['/format.js'].branchData['576'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['573'][1].init(29, 7, 'dateStr');
function visit91_573_1(result) {
  _$jscoverage['/format.js'].branchData['573'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['566'][1].init(65, 8, 'tmp.ampm');
function visit90_566_1(result) {
  _$jscoverage['/format.js'].branchData['566'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['564'][1].init(29, 58, 'match = matchNumber(dateStr, startIndex, count, obeyCount)');
function visit89_564_1(result) {
  _$jscoverage['/format.js'].branchData['564'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['557'][1].init(71, 8, 'tmp.ampm');
function visit88_557_1(result) {
  _$jscoverage['/format.js'].branchData['557'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['555'][1].init(29, 58, 'match = matchNumber(dateStr, startIndex, count, obeyCount)');
function visit87_555_1(result) {
  _$jscoverage['/format.js'].branchData['555'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['545'][1].init(93, 9, 'hour < 12');
function visit86_545_1(result) {
  _$jscoverage['/format.js'].branchData['545'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['543'][1].init(29, 11, 'match.value');
function visit85_543_1(result) {
  _$jscoverage['/format.js'].branchData['543'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['542'][1].init(25, 25, 'calendar.isSetHourOfDay()');
function visit84_542_1(result) {
  _$jscoverage['/format.js'].branchData['542'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['541'][1].init(29, 53, 'match = matchField(dateStr, startIndex, locale.ampms)');
function visit83_541_1(result) {
  _$jscoverage['/format.js'].branchData['541'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['534'][2].init(76, 9, 'count > 3');
function visit82_534_2(result) {
  _$jscoverage['/format.js'].branchData['534'][2].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['534'][1].init(29, 129, 'match = matchField(dateStr, startIndex, locale[count > 3 ? \'weekdays\' : \'shortWeekdays\'])');
function visit81_534_1(result) {
  _$jscoverage['/format.js'].branchData['534'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['529'][1].init(29, 58, 'match = matchNumber(dateStr, startIndex, count, obeyCount)');
function visit80_529_1(result) {
  _$jscoverage['/format.js'].branchData['529'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['524'][1].init(495, 5, 'match');
function visit79_524_1(result) {
  _$jscoverage['/format.js'].branchData['524'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['520'][1].init(25, 58, 'match = matchNumber(dateStr, startIndex, count, obeyCount)');
function visit78_520_1(result) {
  _$jscoverage['/format.js'].branchData['520'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['515'][2].init(72, 10, 'count == 3');
function visit77_515_2(result) {
  _$jscoverage['/format.js'].branchData['515'][2].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['515'][1].init(25, 110, 'match = matchField(dateStr, startIndex, locale[count == 3 ? \'shortMonths\' : \'months\'])');
function visit76_515_1(result) {
  _$jscoverage['/format.js'].branchData['515'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['514'][1].init(56, 10, 'count >= 3');
function visit75_514_1(result) {
  _$jscoverage['/format.js'].branchData['514'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['505'][1].init(29, 13, 'tmp.era === 0');
function visit74_505_1(result) {
  _$jscoverage['/format.js'].branchData['505'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['504'][1].init(65, 12, '\'era\' in tmp');
function visit73_504_1(result) {
  _$jscoverage['/format.js'].branchData['504'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['502'][1].init(29, 58, 'match = matchNumber(dateStr, startIndex, count, obeyCount)');
function visit72_502_1(result) {
  _$jscoverage['/format.js'].branchData['502'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['492'][1].init(29, 16, 'match.value == 0');
function visit71_492_1(result) {
  _$jscoverage['/format.js'].branchData['492'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['491'][1].init(25, 20, 'calendar.isSetYear()');
function visit70_491_1(result) {
  _$jscoverage['/format.js'].branchData['491'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['490'][1].init(29, 52, 'match = matchField(dateStr, startIndex, locale.eras)');
function visit69_490_1(result) {
  _$jscoverage['/format.js'].branchData['490'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['485'][1].init(44, 28, 'dateStr.length <= startIndex');
function visit68_485_1(result) {
  _$jscoverage['/format.js'].branchData['485'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['474'][1].init(409, 8, 'isNaN(n)');
function visit67_474_1(result) {
  _$jscoverage['/format.js'].branchData['474'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['467'][1].init(172, 19, '!str.match(/^\\d+$/)');
function visit66_467_1(result) {
  _$jscoverage['/format.js'].branchData['467'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['463'][1].init(17, 36, 'dateStr.length <= startIndex + count');
function visit65_463_1(result) {
  _$jscoverage['/format.js'].branchData['463'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['462'][1].init(44, 9, 'obeyCount');
function visit64_462_1(result) {
  _$jscoverage['/format.js'].branchData['462'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['453'][3].init(59, 7, 'c > \'9\'');
function visit63_453_3(result) {
  _$jscoverage['/format.js'].branchData['453'][3].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['453'][2].init(48, 7, 'c < \'0\'');
function visit62_453_2(result) {
  _$jscoverage['/format.js'].branchData['453'][2].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['453'][1].init(48, 18, 'c < \'0\' || c > \'9\'');
function visit61_453_1(result) {
  _$jscoverage['/format.js'].branchData['453'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['451'][1].init(69, 7, 'i < len');
function visit60_451_1(result) {
  _$jscoverage['/format.js'].branchData['451'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['441'][1].init(17, 49, 'dateStr.charAt(startIndex + i) != match.charAt(i)');
function visit59_441_1(result) {
  _$jscoverage['/format.js'].branchData['441'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['440'][1].init(25, 8, 'i < mLen');
function visit58_440_1(result) {
  _$jscoverage['/format.js'].branchData['440'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['433'][1].init(407, 10, 'index >= 0');
function visit57_433_1(result) {
  _$jscoverage['/format.js'].branchData['433'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['427'][2].init(82, 17, 'mLen > matchedLen');
function visit56_427_2(result) {
  _$jscoverage['/format.js'].branchData['427'][2].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['427'][1].init(82, 82, 'mLen > matchedLen && matchPartString(dateStr, startIndex, m, mLen)');
function visit55_427_1(result) {
  _$jscoverage['/format.js'].branchData['427'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['424'][1].init(123, 7, 'i < len');
function visit54_424_1(result) {
  _$jscoverage['/format.js'].branchData['424'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['396'][1].init(97, 10, 'offset < 0');
function visit53_396_1(result) {
  _$jscoverage['/format.js'].branchData['396'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['388'][1].init(17, 55, 'calendar.getHourOfDay() % 12 || 12');
function visit52_388_1(result) {
  _$jscoverage['/format.js'].branchData['388'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['382'][1].init(48, 29, 'calendar.getHourOfDay() >= 12');
function visit51_382_1(result) {
  _$jscoverage['/format.js'].branchData['382'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['377'][1].init(84, 10, 'count >= 4');
function visit50_377_1(result) {
  _$jscoverage['/format.js'].branchData['377'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['372'][1].init(53, 29, 'calendar.getHourOfDay() || 24');
function visit49_372_1(result) {
  _$jscoverage['/format.js'].branchData['372'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['365'][1].init(168, 10, 'count == 3');
function visit48_365_1(result) {
  _$jscoverage['/format.js'].branchData['365'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['363'][1].init(74, 10, 'count >= 4');
function visit47_363_1(result) {
  _$jscoverage['/format.js'].branchData['363'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['359'][1].init(199, 10, 'count != 2');
function visit46_359_1(result) {
  _$jscoverage['/format.js'].branchData['359'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['356'][1].init(73, 10, 'value <= 0');
function visit45_356_1(result) {
  _$jscoverage['/format.js'].branchData['356'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['351'][1].init(33, 22, 'calendar.getYear() > 0');
function visit44_351_1(result) {
  _$jscoverage['/format.js'].branchData['351'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['341'][1].init(23, 23, 'locale || defaultLocale');
function visit43_341_1(result) {
  _$jscoverage['/format.js'].branchData['341'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['206'][3].init(179, 14, 'maxDigits == 2');
function visit42_206_3(result) {
  _$jscoverage['/format.js'].branchData['206'][3].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['206'][2].init(161, 14, 'minDigits == 2');
function visit41_206_2(result) {
  _$jscoverage['/format.js'].branchData['206'][2].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['206'][1].init(161, 32, 'minDigits == 2 && maxDigits == 2');
function visit40_206_1(result) {
  _$jscoverage['/format.js'].branchData['206'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['202'][1].init(21, 14, 'minDigits == 4');
function visit39_202_1(result) {
  _$jscoverage['/format.js'].branchData['202'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['201'][3].init(299, 13, 'value < 10000');
function visit38_201_3(result) {
  _$jscoverage['/format.js'].branchData['201'][3].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['201'][2].init(282, 13, 'value >= 1000');
function visit37_201_2(result) {
  _$jscoverage['/format.js'].branchData['201'][2].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['201'][1].init(282, 30, 'value >= 1000 && value < 10000');
function visit36_201_1(result) {
  _$jscoverage['/format.js'].branchData['201'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['196'][3].init(35, 14, 'minDigits == 2');
function visit35_196_3(result) {
  _$jscoverage['/format.js'].branchData['196'][3].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['196'][2].init(21, 10, 'value < 10');
function visit34_196_2(result) {
  _$jscoverage['/format.js'].branchData['196'][2].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['196'][1].init(21, 28, 'value < 10 && minDigits == 2');
function visit33_196_1(result) {
  _$jscoverage['/format.js'].branchData['196'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['195'][5].init(50, 14, 'minDigits <= 2');
function visit32_195_5(result) {
  _$jscoverage['/format.js'].branchData['195'][5].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['195'][4].init(32, 14, 'minDigits >= 1');
function visit31_195_4(result) {
  _$jscoverage['/format.js'].branchData['195'][4].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['195'][3].init(32, 32, 'minDigits >= 1 && minDigits <= 2');
function visit30_195_3(result) {
  _$jscoverage['/format.js'].branchData['195'][3].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['195'][2].init(17, 11, 'value < 100');
function visit29_195_2(result) {
  _$jscoverage['/format.js'].branchData['195'][2].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['195'][1].init(17, 47, 'value < 100 && minDigits >= 1 && minDigits <= 2');
function visit28_195_1(result) {
  _$jscoverage['/format.js'].branchData['195'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['194'][1].init(355, 10, 'value >= 0');
function visit27_194_1(result) {
  _$jscoverage['/format.js'].branchData['194'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['193'][1].init(319, 22, 'maxDigits || MAX_VALUE');
function visit26_193_1(result) {
  _$jscoverage['/format.js'].branchData['193'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['192'][1].init(285, 12, 'buffer || []');
function visit25_192_1(result) {
  _$jscoverage['/format.js'].branchData['192'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['177'][1].init(2497, 10, 'count != 0');
function visit24_177_1(result) {
  _$jscoverage['/format.js'].branchData['177'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['173'][1].init(2412, 7, 'inQuote');
function visit23_173_1(result) {
  _$jscoverage['/format.js'].branchData['173'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['163'][3].init(1945, 14, 'lastField == c');
function visit22_163_3(result) {
  _$jscoverage['/format.js'].branchData['163'][3].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['163'][2].init(1926, 15, 'lastField == -1');
function visit21_163_2(result) {
  _$jscoverage['/format.js'].branchData['163'][2].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['163'][1].init(1926, 33, 'lastField == -1 || lastField == c');
function visit20_163_1(result) {
  _$jscoverage['/format.js'].branchData['163'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['158'][1].init(1763, 29, 'patternChars.indexOf(c) == -1');
function visit19_158_1(result) {
  _$jscoverage['/format.js'].branchData['158'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['147'][1].init(21, 10, 'count != 0');
function visit18_147_1(result) {
  _$jscoverage['/format.js'].branchData['147'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['146'][8].init(1424, 8, 'c <= \'Z\'');
function visit17_146_8(result) {
  _$jscoverage['/format.js'].branchData['146'][8].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['146'][7].init(1412, 8, 'c >= \'A\'');
function visit16_146_7(result) {
  _$jscoverage['/format.js'].branchData['146'][7].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['146'][6].init(1412, 20, 'c >= \'A\' && c <= \'Z\'');
function visit15_146_6(result) {
  _$jscoverage['/format.js'].branchData['146'][6].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['146'][5].init(1400, 8, 'c <= \'z\'');
function visit14_146_5(result) {
  _$jscoverage['/format.js'].branchData['146'][5].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['146'][4].init(1388, 8, 'c >= \'a\'');
function visit13_146_4(result) {
  _$jscoverage['/format.js'].branchData['146'][4].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['146'][3].init(1388, 20, 'c >= \'a\' && c <= \'z\'');
function visit12_146_3(result) {
  _$jscoverage['/format.js'].branchData['146'][3].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['146'][2].init(1388, 44, 'c >= \'a\' && c <= \'z\' || c >= \'A\' && c <= \'Z\'');
function visit11_146_2(result) {
  _$jscoverage['/format.js'].branchData['146'][2].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['146'][1].init(1386, 47, '!(c >= \'a\' && c <= \'z\' || c >= \'A\' && c <= \'Z\')');
function visit10_146_1(result) {
  _$jscoverage['/format.js'].branchData['146'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['142'][1].init(1287, 7, 'inQuote');
function visit9_142_1(result) {
  _$jscoverage['/format.js'].branchData['142'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['127'][1].init(25, 10, 'count != 0');
function visit8_127_1(result) {
  _$jscoverage['/format.js'].branchData['127'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['126'][1].init(690, 8, '!inQuote');
function visit7_126_1(result) {
  _$jscoverage['/format.js'].branchData['126'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['120'][1].init(280, 7, 'inQuote');
function visit6_120_1(result) {
  _$jscoverage['/format.js'].branchData['120'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['115'][1].init(58, 10, 'count != 0');
function visit5_115_1(result) {
  _$jscoverage['/format.js'].branchData['115'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['113'][1].init(72, 9, 'c == \'\\\'\'');
function visit4_113_1(result) {
  _$jscoverage['/format.js'].branchData['113'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['111'][1].init(133, 15, '(i + 1) < length');
function visit3_111_1(result) {
  _$jscoverage['/format.js'].branchData['111'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['108'][1].init(57, 8, 'c == "\'"');
function visit2_108_1(result) {
  _$jscoverage['/format.js'].branchData['108'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['105'][1].init(207, 10, 'i < length');
function visit1_105_1(result) {
  _$jscoverage['/format.js'].branchData['105'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].lineData[7]++;
KISSY.add(function(S) {
  _$jscoverage['/format.js'].functionData[0]++;
  _$jscoverage['/format.js'].lineData[8]++;
  var module = this;
  _$jscoverage['/format.js'].lineData[9]++;
  var GregorianCalendar = module.require('date/gregorian');
  _$jscoverage['/format.js'].lineData[10]++;
  var defaultLocale = module.require('i18n!date');
  _$jscoverage['/format.js'].lineData[11]++;
  var MAX_VALUE = Number.MAX_VALUE, undefined = undefined, DateTimeStyle = {
  FULL: 0, 
  LONG: 1, 
  MEDIUM: 2, 
  SHORT: 3}, logger = S.getLogger('s/date/format');
  _$jscoverage['/format.js'].lineData[60]++;
  var patternChars = new Array(GregorianCalendar.DAY_OF_WEEK_IN_MONTH + 2).join('1');
  _$jscoverage['/format.js'].lineData[63]++;
  var ERA = 0;
  _$jscoverage['/format.js'].lineData[65]++;
  var calendarIndexMap = {};
  _$jscoverage['/format.js'].lineData[67]++;
  patternChars = patternChars.split('');
  _$jscoverage['/format.js'].lineData[68]++;
  patternChars[ERA] = 'G';
  _$jscoverage['/format.js'].lineData[69]++;
  patternChars[GregorianCalendar.YEAR] = 'y';
  _$jscoverage['/format.js'].lineData[70]++;
  patternChars[GregorianCalendar.MONTH] = 'M';
  _$jscoverage['/format.js'].lineData[71]++;
  patternChars[GregorianCalendar.DAY_OF_MONTH] = 'd';
  _$jscoverage['/format.js'].lineData[72]++;
  patternChars[GregorianCalendar.HOUR_OF_DAY] = 'H';
  _$jscoverage['/format.js'].lineData[73]++;
  patternChars[GregorianCalendar.MINUTES] = 'm';
  _$jscoverage['/format.js'].lineData[74]++;
  patternChars[GregorianCalendar.SECONDS] = 's';
  _$jscoverage['/format.js'].lineData[75]++;
  patternChars[GregorianCalendar.MILLISECONDS] = 'S';
  _$jscoverage['/format.js'].lineData[76]++;
  patternChars[GregorianCalendar.WEEK_OF_YEAR] = 'w';
  _$jscoverage['/format.js'].lineData[77]++;
  patternChars[GregorianCalendar.WEEK_OF_MONTH] = 'W';
  _$jscoverage['/format.js'].lineData[78]++;
  patternChars[GregorianCalendar.DAY_OF_YEAR] = 'D';
  _$jscoverage['/format.js'].lineData[79]++;
  patternChars[GregorianCalendar.DAY_OF_WEEK_IN_MONTH] = 'F';
  _$jscoverage['/format.js'].lineData[81]++;
  S.each(patternChars, function(v, index) {
  _$jscoverage['/format.js'].functionData[1]++;
  _$jscoverage['/format.js'].lineData[82]++;
  calendarIndexMap[v] = index;
});
  _$jscoverage['/format.js'].lineData[85]++;
  patternChars = patternChars.join('') + 'ahkKZE';
  _$jscoverage['/format.js'].lineData[90]++;
  function encode(lastField, count, compiledPattern) {
    _$jscoverage['/format.js'].functionData[2]++;
    _$jscoverage['/format.js'].lineData[91]++;
    compiledPattern.push({
  field: lastField, 
  count: count});
  }
  _$jscoverage['/format.js'].lineData[97]++;
  function compile(pattern) {
    _$jscoverage['/format.js'].functionData[3]++;
    _$jscoverage['/format.js'].lineData[98]++;
    var length = pattern.length;
    _$jscoverage['/format.js'].lineData[99]++;
    var inQuote = false;
    _$jscoverage['/format.js'].lineData[100]++;
    var compiledPattern = [];
    _$jscoverage['/format.js'].lineData[101]++;
    var tmpBuffer = null;
    _$jscoverage['/format.js'].lineData[102]++;
    var count = 0;
    _$jscoverage['/format.js'].lineData[103]++;
    var lastField = -1;
    _$jscoverage['/format.js'].lineData[105]++;
    for (var i = 0; visit1_105_1(i < length); i++) {
      _$jscoverage['/format.js'].lineData[106]++;
      var c = pattern.charAt(i);
      _$jscoverage['/format.js'].lineData[108]++;
      if (visit2_108_1(c == "'")) {
        _$jscoverage['/format.js'].lineData[111]++;
        if (visit3_111_1((i + 1) < length)) {
          _$jscoverage['/format.js'].lineData[112]++;
          c = pattern.charAt(i + 1);
          _$jscoverage['/format.js'].lineData[113]++;
          if (visit4_113_1(c == '\'')) {
            _$jscoverage['/format.js'].lineData[114]++;
            i++;
            _$jscoverage['/format.js'].lineData[115]++;
            if (visit5_115_1(count != 0)) {
              _$jscoverage['/format.js'].lineData[116]++;
              encode(lastField, count, compiledPattern);
              _$jscoverage['/format.js'].lineData[117]++;
              lastField = -1;
              _$jscoverage['/format.js'].lineData[118]++;
              count = 0;
            }
            _$jscoverage['/format.js'].lineData[120]++;
            if (visit6_120_1(inQuote)) {
              _$jscoverage['/format.js'].lineData[121]++;
              tmpBuffer += c;
            }
            _$jscoverage['/format.js'].lineData[123]++;
            continue;
          }
        }
        _$jscoverage['/format.js'].lineData[126]++;
        if (visit7_126_1(!inQuote)) {
          _$jscoverage['/format.js'].lineData[127]++;
          if (visit8_127_1(count != 0)) {
            _$jscoverage['/format.js'].lineData[128]++;
            encode(lastField, count, compiledPattern);
            _$jscoverage['/format.js'].lineData[129]++;
            lastField = -1;
            _$jscoverage['/format.js'].lineData[130]++;
            count = 0;
          }
          _$jscoverage['/format.js'].lineData[132]++;
          tmpBuffer = '';
          _$jscoverage['/format.js'].lineData[133]++;
          inQuote = true;
        } else {
          _$jscoverage['/format.js'].lineData[135]++;
          compiledPattern.push({
  text: tmpBuffer});
          _$jscoverage['/format.js'].lineData[138]++;
          inQuote = false;
        }
        _$jscoverage['/format.js'].lineData[140]++;
        continue;
      }
      _$jscoverage['/format.js'].lineData[142]++;
      if (visit9_142_1(inQuote)) {
        _$jscoverage['/format.js'].lineData[143]++;
        tmpBuffer += c;
        _$jscoverage['/format.js'].lineData[144]++;
        continue;
      }
      _$jscoverage['/format.js'].lineData[146]++;
      if (visit10_146_1(!(visit11_146_2(visit12_146_3(visit13_146_4(c >= 'a') && visit14_146_5(c <= 'z')) || visit15_146_6(visit16_146_7(c >= 'A') && visit17_146_8(c <= 'Z')))))) {
        _$jscoverage['/format.js'].lineData[147]++;
        if (visit18_147_1(count != 0)) {
          _$jscoverage['/format.js'].lineData[148]++;
          encode(lastField, count, compiledPattern);
          _$jscoverage['/format.js'].lineData[149]++;
          lastField = -1;
          _$jscoverage['/format.js'].lineData[150]++;
          count = 0;
        }
        _$jscoverage['/format.js'].lineData[152]++;
        compiledPattern.push({
  text: c});
        _$jscoverage['/format.js'].lineData[155]++;
        continue;
      }
      _$jscoverage['/format.js'].lineData[158]++;
      if (visit19_158_1(patternChars.indexOf(c) == -1)) {
        _$jscoverage['/format.js'].lineData[159]++;
        throw new Error("Illegal pattern character " + "'" + c + "'");
      }
      _$jscoverage['/format.js'].lineData[163]++;
      if (visit20_163_1(visit21_163_2(lastField == -1) || visit22_163_3(lastField == c))) {
        _$jscoverage['/format.js'].lineData[164]++;
        lastField = c;
        _$jscoverage['/format.js'].lineData[165]++;
        count++;
        _$jscoverage['/format.js'].lineData[166]++;
        continue;
      }
      _$jscoverage['/format.js'].lineData[168]++;
      encode(lastField, count, compiledPattern);
      _$jscoverage['/format.js'].lineData[169]++;
      lastField = c;
      _$jscoverage['/format.js'].lineData[170]++;
      count = 1;
    }
    _$jscoverage['/format.js'].lineData[173]++;
    if (visit23_173_1(inQuote)) {
      _$jscoverage['/format.js'].lineData[174]++;
      throw new Error("Unterminated quote");
    }
    _$jscoverage['/format.js'].lineData[177]++;
    if (visit24_177_1(count != 0)) {
      _$jscoverage['/format.js'].lineData[178]++;
      encode(lastField, count, compiledPattern);
    }
    _$jscoverage['/format.js'].lineData[181]++;
    return compiledPattern;
  }
  _$jscoverage['/format.js'].lineData[184]++;
  var zeroDigit = '0';
  _$jscoverage['/format.js'].lineData[187]++;
  function zeroPaddingNumber(value, minDigits, maxDigits, buffer) {
    _$jscoverage['/format.js'].functionData[4]++;
    _$jscoverage['/format.js'].lineData[192]++;
    buffer = visit25_192_1(buffer || []);
    _$jscoverage['/format.js'].lineData[193]++;
    maxDigits = visit26_193_1(maxDigits || MAX_VALUE);
    _$jscoverage['/format.js'].lineData[194]++;
    if (visit27_194_1(value >= 0)) {
      _$jscoverage['/format.js'].lineData[195]++;
      if (visit28_195_1(visit29_195_2(value < 100) && visit30_195_3(visit31_195_4(minDigits >= 1) && visit32_195_5(minDigits <= 2)))) {
        _$jscoverage['/format.js'].lineData[196]++;
        if (visit33_196_1(visit34_196_2(value < 10) && visit35_196_3(minDigits == 2))) {
          _$jscoverage['/format.js'].lineData[197]++;
          buffer.push(zeroDigit);
        }
        _$jscoverage['/format.js'].lineData[199]++;
        buffer.push(value);
        _$jscoverage['/format.js'].lineData[200]++;
        return buffer.join('');
      } else {
        _$jscoverage['/format.js'].lineData[201]++;
        if (visit36_201_1(visit37_201_2(value >= 1000) && visit38_201_3(value < 10000))) {
          _$jscoverage['/format.js'].lineData[202]++;
          if (visit39_202_1(minDigits == 4)) {
            _$jscoverage['/format.js'].lineData[203]++;
            buffer.push(value);
            _$jscoverage['/format.js'].lineData[204]++;
            return buffer.join('');
          }
          _$jscoverage['/format.js'].lineData[206]++;
          if (visit40_206_1(visit41_206_2(minDigits == 2) && visit42_206_3(maxDigits == 2))) {
            _$jscoverage['/format.js'].lineData[207]++;
            return zeroPaddingNumber(value % 100, 2, 2, buffer);
          }
        }
      }
    }
    _$jscoverage['/format.js'].lineData[211]++;
    buffer.push(value + '');
    _$jscoverage['/format.js'].lineData[212]++;
    return buffer.join('');
  }
  _$jscoverage['/format.js'].lineData[340]++;
  function DateTimeFormat(pattern, locale, timeZoneOffset) {
    _$jscoverage['/format.js'].functionData[5]++;
    _$jscoverage['/format.js'].lineData[341]++;
    this.locale = visit43_341_1(locale || defaultLocale);
    _$jscoverage['/format.js'].lineData[342]++;
    this.pattern = compile(pattern);
    _$jscoverage['/format.js'].lineData[343]++;
    this.timezoneOffset = timeZoneOffset;
  }
  _$jscoverage['/format.js'].lineData[346]++;
  function formatField(field, count, locale, calendar) {
    _$jscoverage['/format.js'].functionData[6]++;
    _$jscoverage['/format.js'].lineData[347]++;
    var current, value;
    _$jscoverage['/format.js'].lineData[349]++;
    switch (field) {
      case 'G':
        _$jscoverage['/format.js'].lineData[351]++;
        value = visit44_351_1(calendar.getYear() > 0) ? 1 : 0;
        _$jscoverage['/format.js'].lineData[352]++;
        current = locale.eras[value];
        _$jscoverage['/format.js'].lineData[353]++;
        break;
      case 'y':
        _$jscoverage['/format.js'].lineData[355]++;
        value = calendar.getYear();
        _$jscoverage['/format.js'].lineData[356]++;
        if (visit45_356_1(value <= 0)) {
          _$jscoverage['/format.js'].lineData[357]++;
          value = 1 - value;
        }
        _$jscoverage['/format.js'].lineData[359]++;
        current = (zeroPaddingNumber(value, 2, visit46_359_1(count != 2) ? MAX_VALUE : 2));
        _$jscoverage['/format.js'].lineData[360]++;
        break;
      case 'M':
        _$jscoverage['/format.js'].lineData[362]++;
        value = calendar.getMonth();
        _$jscoverage['/format.js'].lineData[363]++;
        if (visit47_363_1(count >= 4)) {
          _$jscoverage['/format.js'].lineData[364]++;
          current = locale.months[value];
        } else {
          _$jscoverage['/format.js'].lineData[365]++;
          if (visit48_365_1(count == 3)) {
            _$jscoverage['/format.js'].lineData[366]++;
            current = locale.shortMonths[value];
          } else {
            _$jscoverage['/format.js'].lineData[368]++;
            current = zeroPaddingNumber(value + 1, count);
          }
        }
        _$jscoverage['/format.js'].lineData[370]++;
        break;
      case 'k':
        _$jscoverage['/format.js'].lineData[372]++;
        current = zeroPaddingNumber(visit49_372_1(calendar.getHourOfDay() || 24), count);
        _$jscoverage['/format.js'].lineData[374]++;
        break;
      case 'E':
        _$jscoverage['/format.js'].lineData[376]++;
        value = calendar.getDayOfWeek();
        _$jscoverage['/format.js'].lineData[377]++;
        current = visit50_377_1(count >= 4) ? locale.weekdays[value] : locale.shortWeekdays[value];
        _$jscoverage['/format.js'].lineData[380]++;
        break;
      case 'a':
        _$jscoverage['/format.js'].lineData[382]++;
        current = locale.ampms[visit51_382_1(calendar.getHourOfDay() >= 12) ? 1 : 0];
        _$jscoverage['/format.js'].lineData[385]++;
        break;
      case 'h':
        _$jscoverage['/format.js'].lineData[387]++;
        current = zeroPaddingNumber(visit52_388_1(calendar.getHourOfDay() % 12 || 12), count);
        _$jscoverage['/format.js'].lineData[389]++;
        break;
      case 'K':
        _$jscoverage['/format.js'].lineData[391]++;
        current = zeroPaddingNumber(calendar.getHourOfDay() % 12, count);
        _$jscoverage['/format.js'].lineData[393]++;
        break;
      case 'Z':
        _$jscoverage['/format.js'].lineData[395]++;
        var offset = calendar.getTimezoneOffset();
        _$jscoverage['/format.js'].lineData[396]++;
        var parts = [visit53_396_1(offset < 0) ? '-' : '+'];
        _$jscoverage['/format.js'].lineData[397]++;
        offset = Math.abs(offset);
        _$jscoverage['/format.js'].lineData[398]++;
        parts.push(zeroPaddingNumber(Math.floor(offset / 60) % 100, 2), zeroPaddingNumber(offset % 60, 2));
        _$jscoverage['/format.js'].lineData[400]++;
        current = parts.join('');
        _$jscoverage['/format.js'].lineData[401]++;
        break;
      default:
        _$jscoverage['/format.js'].lineData[412]++;
        var index = calendarIndexMap[field];
        _$jscoverage['/format.js'].lineData[413]++;
        value = calendar.get(index);
        _$jscoverage['/format.js'].lineData[414]++;
        current = zeroPaddingNumber(value, count);
    }
    _$jscoverage['/format.js'].lineData[416]++;
    return current;
  }
  _$jscoverage['/format.js'].lineData[419]++;
  function matchField(dateStr, startIndex, matches) {
    _$jscoverage['/format.js'].functionData[7]++;
    _$jscoverage['/format.js'].lineData[420]++;
    var matchedLen = -1, index = -1, i, len = matches.length;
    _$jscoverage['/format.js'].lineData[424]++;
    for (i = 0; visit54_424_1(i < len); i++) {
      _$jscoverage['/format.js'].lineData[425]++;
      var m = matches[i];
      _$jscoverage['/format.js'].lineData[426]++;
      var mLen = m.length;
      _$jscoverage['/format.js'].lineData[427]++;
      if (visit55_427_1(visit56_427_2(mLen > matchedLen) && matchPartString(dateStr, startIndex, m, mLen))) {
        _$jscoverage['/format.js'].lineData[429]++;
        matchedLen = mLen;
        _$jscoverage['/format.js'].lineData[430]++;
        index = i;
      }
    }
    _$jscoverage['/format.js'].lineData[433]++;
    return visit57_433_1(index >= 0) ? {
  value: index, 
  startIndex: startIndex + matchedLen} : null;
  }
  _$jscoverage['/format.js'].lineData[439]++;
  function matchPartString(dateStr, startIndex, match, mLen) {
    _$jscoverage['/format.js'].functionData[8]++;
    _$jscoverage['/format.js'].lineData[440]++;
    for (var i = 0; visit58_440_1(i < mLen); i++) {
      _$jscoverage['/format.js'].lineData[441]++;
      if (visit59_441_1(dateStr.charAt(startIndex + i) != match.charAt(i))) {
        _$jscoverage['/format.js'].lineData[442]++;
        return false;
      }
    }
    _$jscoverage['/format.js'].lineData[445]++;
    return true;
  }
  _$jscoverage['/format.js'].lineData[448]++;
  function getLeadingNumberLen(str) {
    _$jscoverage['/format.js'].functionData[9]++;
    _$jscoverage['/format.js'].lineData[449]++;
    var i, c, len = str.length;
    _$jscoverage['/format.js'].lineData[451]++;
    for (i = 0; visit60_451_1(i < len); i++) {
      _$jscoverage['/format.js'].lineData[452]++;
      c = str.charAt(i);
      _$jscoverage['/format.js'].lineData[453]++;
      if (visit61_453_1(visit62_453_2(c < '0') || visit63_453_3(c > '9'))) {
        _$jscoverage['/format.js'].lineData[454]++;
        break;
      }
    }
    _$jscoverage['/format.js'].lineData[457]++;
    return i;
  }
  _$jscoverage['/format.js'].lineData[460]++;
  function matchNumber(dateStr, startIndex, count, obeyCount) {
    _$jscoverage['/format.js'].functionData[10]++;
    _$jscoverage['/format.js'].lineData[461]++;
    var str = dateStr, n;
    _$jscoverage['/format.js'].lineData[462]++;
    if (visit64_462_1(obeyCount)) {
      _$jscoverage['/format.js'].lineData[463]++;
      if (visit65_463_1(dateStr.length <= startIndex + count)) {
        _$jscoverage['/format.js'].lineData[464]++;
        return null;
      }
      _$jscoverage['/format.js'].lineData[466]++;
      str = dateStr.substring(startIndex, count);
      _$jscoverage['/format.js'].lineData[467]++;
      if (visit66_467_1(!str.match(/^\d+$/))) {
        _$jscoverage['/format.js'].lineData[468]++;
        return null;
      }
    } else {
      _$jscoverage['/format.js'].lineData[471]++;
      str = str.substring(startIndex);
    }
    _$jscoverage['/format.js'].lineData[473]++;
    n = parseInt(str, 10);
    _$jscoverage['/format.js'].lineData[474]++;
    if (visit67_474_1(isNaN(n))) {
      _$jscoverage['/format.js'].lineData[475]++;
      return null;
    }
    _$jscoverage['/format.js'].lineData[477]++;
    return {
  value: n, 
  startIndex: startIndex + getLeadingNumberLen(str)};
  }
  _$jscoverage['/format.js'].lineData[483]++;
  function parseField(calendar, dateStr, startIndex, field, count, locale, obeyCount, tmp) {
    _$jscoverage['/format.js'].functionData[11]++;
    _$jscoverage['/format.js'].lineData[484]++;
    var match, year, hour;
    _$jscoverage['/format.js'].lineData[485]++;
    if (visit68_485_1(dateStr.length <= startIndex)) {
      _$jscoverage['/format.js'].lineData[486]++;
      return startIndex;
    }
    _$jscoverage['/format.js'].lineData[488]++;
    switch (field) {
      case 'G':
        _$jscoverage['/format.js'].lineData[490]++;
        if (visit69_490_1(match = matchField(dateStr, startIndex, locale.eras))) {
          _$jscoverage['/format.js'].lineData[491]++;
          if (visit70_491_1(calendar.isSetYear())) {
            _$jscoverage['/format.js'].lineData[492]++;
            if (visit71_492_1(match.value == 0)) {
              _$jscoverage['/format.js'].lineData[493]++;
              year = calendar.getYear();
              _$jscoverage['/format.js'].lineData[494]++;
              calendar.setYear(1 - year);
            }
          } else {
            _$jscoverage['/format.js'].lineData[497]++;
            tmp.era = match.value;
          }
        }
        _$jscoverage['/format.js'].lineData[500]++;
        break;
      case 'y':
        _$jscoverage['/format.js'].lineData[502]++;
        if (visit72_502_1(match = matchNumber(dateStr, startIndex, count, obeyCount))) {
          _$jscoverage['/format.js'].lineData[503]++;
          year = match.value;
          _$jscoverage['/format.js'].lineData[504]++;
          if (visit73_504_1('era' in tmp)) {
            _$jscoverage['/format.js'].lineData[505]++;
            if (visit74_505_1(tmp.era === 0)) {
              _$jscoverage['/format.js'].lineData[506]++;
              year = 1 - year;
            }
          }
          _$jscoverage['/format.js'].lineData[509]++;
          calendar.setYear(year);
        }
        _$jscoverage['/format.js'].lineData[511]++;
        break;
      case 'M':
        _$jscoverage['/format.js'].lineData[513]++;
        var month;
        _$jscoverage['/format.js'].lineData[514]++;
        if (visit75_514_1(count >= 3)) {
          _$jscoverage['/format.js'].lineData[515]++;
          if (visit76_515_1(match = matchField(dateStr, startIndex, locale[visit77_515_2(count == 3) ? 'shortMonths' : 'months']))) {
            _$jscoverage['/format.js'].lineData[517]++;
            month = match.value;
          }
        } else {
          _$jscoverage['/format.js'].lineData[520]++;
          if (visit78_520_1(match = matchNumber(dateStr, startIndex, count, obeyCount))) {
            _$jscoverage['/format.js'].lineData[521]++;
            month = match.value - 1;
          }
        }
        _$jscoverage['/format.js'].lineData[524]++;
        if (visit79_524_1(match)) {
          _$jscoverage['/format.js'].lineData[525]++;
          calendar.setMonth(month);
        }
        _$jscoverage['/format.js'].lineData[527]++;
        break;
      case 'k':
        _$jscoverage['/format.js'].lineData[529]++;
        if (visit80_529_1(match = matchNumber(dateStr, startIndex, count, obeyCount))) {
          _$jscoverage['/format.js'].lineData[530]++;
          calendar.setHourOfDay(match.value % 24);
        }
        _$jscoverage['/format.js'].lineData[532]++;
        break;
      case 'E':
        _$jscoverage['/format.js'].lineData[534]++;
        if (visit81_534_1(match = matchField(dateStr, startIndex, locale[visit82_534_2(count > 3) ? 'weekdays' : 'shortWeekdays']))) {
          _$jscoverage['/format.js'].lineData[537]++;
          calendar.setDayOfWeek(match.value);
        }
        _$jscoverage['/format.js'].lineData[539]++;
        break;
      case 'a':
        _$jscoverage['/format.js'].lineData[541]++;
        if (visit83_541_1(match = matchField(dateStr, startIndex, locale.ampms))) {
          _$jscoverage['/format.js'].lineData[542]++;
          if (visit84_542_1(calendar.isSetHourOfDay())) {
            _$jscoverage['/format.js'].lineData[543]++;
            if (visit85_543_1(match.value)) {
              _$jscoverage['/format.js'].lineData[544]++;
              hour = calendar.getHourOfDay();
              _$jscoverage['/format.js'].lineData[545]++;
              if (visit86_545_1(hour < 12)) {
                _$jscoverage['/format.js'].lineData[546]++;
                calendar.setHourOfDay((hour + 12) % 24);
              }
            }
          } else {
            _$jscoverage['/format.js'].lineData[550]++;
            tmp.ampm = match.value;
          }
        }
        _$jscoverage['/format.js'].lineData[553]++;
        break;
      case 'h':
        _$jscoverage['/format.js'].lineData[555]++;
        if (visit87_555_1(match = matchNumber(dateStr, startIndex, count, obeyCount))) {
          _$jscoverage['/format.js'].lineData[556]++;
          hour = match.value %= 12;
          _$jscoverage['/format.js'].lineData[557]++;
          if (visit88_557_1(tmp.ampm)) {
            _$jscoverage['/format.js'].lineData[558]++;
            hour += 12;
          }
          _$jscoverage['/format.js'].lineData[560]++;
          calendar.setHourOfDay(hour);
        }
        _$jscoverage['/format.js'].lineData[562]++;
        break;
      case 'K':
        _$jscoverage['/format.js'].lineData[564]++;
        if (visit89_564_1(match = matchNumber(dateStr, startIndex, count, obeyCount))) {
          _$jscoverage['/format.js'].lineData[565]++;
          hour = match.value;
          _$jscoverage['/format.js'].lineData[566]++;
          if (visit90_566_1(tmp.ampm)) {
            _$jscoverage['/format.js'].lineData[567]++;
            hour += 12;
          }
          _$jscoverage['/format.js'].lineData[569]++;
          calendar.setHourOfDay(hour);
        }
        _$jscoverage['/format.js'].lineData[571]++;
        break;
      case 'Z':
        _$jscoverage['/format.js'].lineData[573]++;
        if (visit91_573_1(dateStr)) {
          _$jscoverage['/format.js'].lineData[574]++;
          var sign = 1, zoneChar = dateStr.charAt(startIndex);
        }
        _$jscoverage['/format.js'].lineData[576]++;
        if (visit92_576_1(zoneChar == '-')) {
          _$jscoverage['/format.js'].lineData[577]++;
          sign = -1;
          _$jscoverage['/format.js'].lineData[578]++;
          startIndex++;
        } else {
          _$jscoverage['/format.js'].lineData[579]++;
          if (visit93_579_1(zoneChar == '+')) {
            _$jscoverage['/format.js'].lineData[580]++;
            startIndex++;
          } else {
            _$jscoverage['/format.js'].lineData[582]++;
            break;
          }
        }
        _$jscoverage['/format.js'].lineData[584]++;
        if (visit94_584_1(match = matchNumber(dateStr, startIndex, 2, true))) {
          _$jscoverage['/format.js'].lineData[585]++;
          var zoneOffset = match.value * 60;
          _$jscoverage['/format.js'].lineData[586]++;
          startIndex = match.startIndex;
          _$jscoverage['/format.js'].lineData[587]++;
          if (visit95_587_1(match = matchNumber(dateStr, startIndex, 2, true))) {
            _$jscoverage['/format.js'].lineData[588]++;
            zoneOffset += match.value;
          }
          _$jscoverage['/format.js'].lineData[590]++;
          calendar.setTimezoneOffset(zoneOffset);
        }
        _$jscoverage['/format.js'].lineData[592]++;
        break;
      default:
        _$jscoverage['/format.js'].lineData[603]++;
        if (visit96_603_1(match = matchNumber(dateStr, startIndex, count, obeyCount))) {
          _$jscoverage['/format.js'].lineData[604]++;
          var index = calendarIndexMap[field];
          _$jscoverage['/format.js'].lineData[605]++;
          calendar.set(index, match.value);
        }
    }
    _$jscoverage['/format.js'].lineData[608]++;
    if (visit97_608_1(match)) {
      _$jscoverage['/format.js'].lineData[609]++;
      startIndex = match.startIndex;
    }
    _$jscoverage['/format.js'].lineData[611]++;
    return startIndex;
  }
  _$jscoverage['/format.js'].lineData[614]++;
  DateTimeFormat.prototype = {
  format: function(calendar) {
  _$jscoverage['/format.js'].functionData[12]++;
  _$jscoverage['/format.js'].lineData[621]++;
  var time = calendar.getTime();
  _$jscoverage['/format.js'].lineData[622]++;
  calendar = new GregorianCalendar(this.timezoneOffset, this.locale);
  _$jscoverage['/format.js'].lineData[624]++;
  calendar.setTime(time);
  _$jscoverage['/format.js'].lineData[625]++;
  var i, ret = [], pattern = this.pattern, len = pattern.length;
  _$jscoverage['/format.js'].lineData[629]++;
  for (i = 0; visit98_629_1(i < len); i++) {
    _$jscoverage['/format.js'].lineData[630]++;
    var comp = pattern[i];
    _$jscoverage['/format.js'].lineData[631]++;
    if (visit99_631_1(comp.text)) {
      _$jscoverage['/format.js'].lineData[632]++;
      ret.push(comp.text);
    } else {
      _$jscoverage['/format.js'].lineData[633]++;
      if (visit100_633_1('field' in comp)) {
        _$jscoverage['/format.js'].lineData[634]++;
        ret.push(formatField(comp.field, comp.count, this.locale, calendar));
      }
    }
  }
  _$jscoverage['/format.js'].lineData[637]++;
  return ret.join('');
}, 
  parse: function(dateStr) {
  _$jscoverage['/format.js'].functionData[13]++;
  _$jscoverage['/format.js'].lineData[646]++;
  var calendar = new GregorianCalendar(this.timezoneOffset, this.locale), i, j, tmp = {}, obeyCount = false, dateStrLen = dateStr.length, errorIndex = -1, startIndex = 0, oldStartIndex = 0, pattern = this.pattern, len = pattern.length;
  _$jscoverage['/format.js'].lineData[659]++;
  loopPattern:
    {
      _$jscoverage['/format.js'].lineData[660]++;
      for (i = 0; visit101_660_1(visit102_660_2(errorIndex < 0) && visit103_660_3(i < len)); i++) {
        _$jscoverage['/format.js'].lineData[661]++;
        var comp = pattern[i], text, textLen;
        _$jscoverage['/format.js'].lineData[662]++;
        oldStartIndex = startIndex;
        _$jscoverage['/format.js'].lineData[663]++;
        if (visit104_663_1(text = comp.text)) {
          _$jscoverage['/format.js'].lineData[664]++;
          textLen = text.length;
          _$jscoverage['/format.js'].lineData[665]++;
          if (visit105_665_1((textLen + startIndex) > dateStrLen)) {
            _$jscoverage['/format.js'].lineData[666]++;
            errorIndex = startIndex;
          } else {
            _$jscoverage['/format.js'].lineData[668]++;
            for (j = 0; visit106_668_1(j < textLen); j++) {
              _$jscoverage['/format.js'].lineData[669]++;
              if (visit107_669_1(text.charAt(j) != dateStr.charAt(j + startIndex))) {
                _$jscoverage['/format.js'].lineData[670]++;
                errorIndex = startIndex;
                _$jscoverage['/format.js'].lineData[671]++;
                break loopPattern;
              }
            }
            _$jscoverage['/format.js'].lineData[674]++;
            startIndex += textLen;
          }
        } else {
          _$jscoverage['/format.js'].lineData[676]++;
          if (visit108_676_1('field' in comp)) {
            _$jscoverage['/format.js'].lineData[677]++;
            obeyCount = false;
            _$jscoverage['/format.js'].lineData[678]++;
            var nextComp = pattern[i + 1];
            _$jscoverage['/format.js'].lineData[679]++;
            if (visit109_679_1(nextComp)) {
              _$jscoverage['/format.js'].lineData[680]++;
              if (visit110_680_1('field' in nextComp)) {
                _$jscoverage['/format.js'].lineData[681]++;
                obeyCount = true;
              } else {
                _$jscoverage['/format.js'].lineData[683]++;
                var c = nextComp.text.charAt(0);
                _$jscoverage['/format.js'].lineData[684]++;
                if (visit111_684_1(visit112_684_2(c >= '0') && visit113_684_3(c <= '9'))) {
                  _$jscoverage['/format.js'].lineData[685]++;
                  obeyCount = true;
                }
              }
            }
            _$jscoverage['/format.js'].lineData[689]++;
            startIndex = parseField(calendar, dateStr, startIndex, comp.field, comp.count, this.locale, obeyCount, tmp);
            _$jscoverage['/format.js'].lineData[697]++;
            if (visit114_697_1(startIndex == oldStartIndex)) {
              _$jscoverage['/format.js'].lineData[698]++;
              errorIndex = startIndex;
            }
          }
        }
      }
    }
  _$jscoverage['/format.js'].lineData[704]++;
  if (visit115_704_1(errorIndex >= 0)) {
    _$jscoverage['/format.js'].lineData[705]++;
    logger.error('error when parsing date');
    _$jscoverage['/format.js'].lineData[706]++;
    logger.error(dateStr);
    _$jscoverage['/format.js'].lineData[707]++;
    logger.error(dateStr.substring(0, errorIndex) + '^');
    _$jscoverage['/format.js'].lineData[708]++;
    return undefined;
  }
  _$jscoverage['/format.js'].lineData[710]++;
  return calendar;
}};
  _$jscoverage['/format.js'].lineData[714]++;
  S.mix(DateTimeFormat, {
  Style: DateTimeStyle, 
  getInstance: function(locale, timeZoneOffset) {
  _$jscoverage['/format.js'].functionData[14]++;
  _$jscoverage['/format.js'].lineData[727]++;
  return this.getDateTimeInstance(DateTimeStyle.SHORT, DateTimeStyle.SHORT, locale, timeZoneOffset);
}, 
  'getDateInstance': function(dateStyle, locale, timeZoneOffset) {
  _$jscoverage['/format.js'].functionData[15]++;
  _$jscoverage['/format.js'].lineData[739]++;
  return this.getDateTimeInstance(dateStyle, undefined, locale, timeZoneOffset);
}, 
  getDateTimeInstance: function(dateStyle, timeStyle, locale, timeZoneOffset) {
  _$jscoverage['/format.js'].functionData[16]++;
  _$jscoverage['/format.js'].lineData[752]++;
  locale = visit116_752_1(locale || defaultLocale);
  _$jscoverage['/format.js'].lineData[753]++;
  var datePattern = '';
  _$jscoverage['/format.js'].lineData[754]++;
  if (visit117_754_1(dateStyle !== undefined)) {
    _$jscoverage['/format.js'].lineData[755]++;
    datePattern = locale.datePatterns[dateStyle];
  }
  _$jscoverage['/format.js'].lineData[757]++;
  var timePattern = '';
  _$jscoverage['/format.js'].lineData[758]++;
  if (visit118_758_1(timeStyle !== undefined)) {
    _$jscoverage['/format.js'].lineData[759]++;
    timePattern = locale.timePatterns[timeStyle];
  }
  _$jscoverage['/format.js'].lineData[761]++;
  var pattern = datePattern;
  _$jscoverage['/format.js'].lineData[762]++;
  if (visit119_762_1(timePattern)) {
    _$jscoverage['/format.js'].lineData[763]++;
    if (visit120_763_1(datePattern)) {
      _$jscoverage['/format.js'].lineData[764]++;
      pattern = S.substitute(locale.dateTimePattern, {
  date: datePattern, 
  time: timePattern});
    } else {
      _$jscoverage['/format.js'].lineData[769]++;
      pattern = timePattern;
    }
  }
  _$jscoverage['/format.js'].lineData[772]++;
  return new DateTimeFormat(pattern, locale, timeZoneOffset);
}, 
  'getTimeInstance': function(timeStyle, locale, timeZoneOffset) {
  _$jscoverage['/format.js'].functionData[17]++;
  _$jscoverage['/format.js'].lineData[784]++;
  return this.getDateTimeInstance(undefined, timeStyle, locale, timeZoneOffset);
}});
  _$jscoverage['/format.js'].lineData[788]++;
  return DateTimeFormat;
});
