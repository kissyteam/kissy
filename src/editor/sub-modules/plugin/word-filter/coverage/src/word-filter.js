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
if (! _$jscoverage['/word-filter.js']) {
  _$jscoverage['/word-filter.js'] = {};
  _$jscoverage['/word-filter.js'].lineData = [];
  _$jscoverage['/word-filter.js'].lineData[6] = 0;
  _$jscoverage['/word-filter.js'].lineData[7] = 0;
  _$jscoverage['/word-filter.js'].lineData[51] = 0;
  _$jscoverage['/word-filter.js'].lineData[52] = 0;
  _$jscoverage['/word-filter.js'].lineData[53] = 0;
  _$jscoverage['/word-filter.js'].lineData[54] = 0;
  _$jscoverage['/word-filter.js'].lineData[55] = 0;
  _$jscoverage['/word-filter.js'].lineData[56] = 0;
  _$jscoverage['/word-filter.js'].lineData[59] = 0;
  _$jscoverage['/word-filter.js'].lineData[63] = 0;
  _$jscoverage['/word-filter.js'].lineData[64] = 0;
  _$jscoverage['/word-filter.js'].lineData[65] = 0;
  _$jscoverage['/word-filter.js'].lineData[66] = 0;
  _$jscoverage['/word-filter.js'].lineData[67] = 0;
  _$jscoverage['/word-filter.js'].lineData[68] = 0;
  _$jscoverage['/word-filter.js'].lineData[70] = 0;
  _$jscoverage['/word-filter.js'].lineData[73] = 0;
  _$jscoverage['/word-filter.js'].lineData[74] = 0;
  _$jscoverage['/word-filter.js'].lineData[75] = 0;
  _$jscoverage['/word-filter.js'].lineData[77] = 0;
  _$jscoverage['/word-filter.js'].lineData[85] = 0;
  _$jscoverage['/word-filter.js'].lineData[86] = 0;
  _$jscoverage['/word-filter.js'].lineData[88] = 0;
  _$jscoverage['/word-filter.js'].lineData[89] = 0;
  _$jscoverage['/word-filter.js'].lineData[90] = 0;
  _$jscoverage['/word-filter.js'].lineData[97] = 0;
  _$jscoverage['/word-filter.js'].lineData[98] = 0;
  _$jscoverage['/word-filter.js'].lineData[99] = 0;
  _$jscoverage['/word-filter.js'].lineData[102] = 0;
  _$jscoverage['/word-filter.js'].lineData[106] = 0;
  _$jscoverage['/word-filter.js'].lineData[110] = 0;
  _$jscoverage['/word-filter.js'].lineData[111] = 0;
  _$jscoverage['/word-filter.js'].lineData[114] = 0;
  _$jscoverage['/word-filter.js'].lineData[117] = 0;
  _$jscoverage['/word-filter.js'].lineData[118] = 0;
  _$jscoverage['/word-filter.js'].lineData[122] = 0;
  _$jscoverage['/word-filter.js'].lineData[123] = 0;
  _$jscoverage['/word-filter.js'].lineData[124] = 0;
  _$jscoverage['/word-filter.js'].lineData[125] = 0;
  _$jscoverage['/word-filter.js'].lineData[127] = 0;
  _$jscoverage['/word-filter.js'].lineData[128] = 0;
  _$jscoverage['/word-filter.js'].lineData[129] = 0;
  _$jscoverage['/word-filter.js'].lineData[131] = 0;
  _$jscoverage['/word-filter.js'].lineData[133] = 0;
  _$jscoverage['/word-filter.js'].lineData[136] = 0;
  _$jscoverage['/word-filter.js'].lineData[137] = 0;
  _$jscoverage['/word-filter.js'].lineData[138] = 0;
  _$jscoverage['/word-filter.js'].lineData[139] = 0;
  _$jscoverage['/word-filter.js'].lineData[141] = 0;
  _$jscoverage['/word-filter.js'].lineData[144] = 0;
  _$jscoverage['/word-filter.js'].lineData[145] = 0;
  _$jscoverage['/word-filter.js'].lineData[149] = 0;
  _$jscoverage['/word-filter.js'].lineData[150] = 0;
  _$jscoverage['/word-filter.js'].lineData[151] = 0;
  _$jscoverage['/word-filter.js'].lineData[152] = 0;
  _$jscoverage['/word-filter.js'].lineData[153] = 0;
  _$jscoverage['/word-filter.js'].lineData[154] = 0;
  _$jscoverage['/word-filter.js'].lineData[155] = 0;
  _$jscoverage['/word-filter.js'].lineData[156] = 0;
  _$jscoverage['/word-filter.js'].lineData[161] = 0;
  _$jscoverage['/word-filter.js'].lineData[165] = 0;
  _$jscoverage['/word-filter.js'].lineData[166] = 0;
  _$jscoverage['/word-filter.js'].lineData[168] = 0;
  _$jscoverage['/word-filter.js'].lineData[169] = 0;
  _$jscoverage['/word-filter.js'].lineData[172] = 0;
  _$jscoverage['/word-filter.js'].lineData[173] = 0;
  _$jscoverage['/word-filter.js'].lineData[175] = 0;
  _$jscoverage['/word-filter.js'].lineData[181] = 0;
  _$jscoverage['/word-filter.js'].lineData[183] = 0;
  _$jscoverage['/word-filter.js'].lineData[187] = 0;
  _$jscoverage['/word-filter.js'].lineData[189] = 0;
  _$jscoverage['/word-filter.js'].lineData[193] = 0;
  _$jscoverage['/word-filter.js'].lineData[197] = 0;
  _$jscoverage['/word-filter.js'].lineData[198] = 0;
  _$jscoverage['/word-filter.js'].lineData[200] = 0;
  _$jscoverage['/word-filter.js'].lineData[202] = 0;
  _$jscoverage['/word-filter.js'].lineData[203] = 0;
  _$jscoverage['/word-filter.js'].lineData[207] = 0;
  _$jscoverage['/word-filter.js'].lineData[210] = 0;
  _$jscoverage['/word-filter.js'].lineData[216] = 0;
  _$jscoverage['/word-filter.js'].lineData[218] = 0;
  _$jscoverage['/word-filter.js'].lineData[221] = 0;
  _$jscoverage['/word-filter.js'].lineData[223] = 0;
  _$jscoverage['/word-filter.js'].lineData[224] = 0;
  _$jscoverage['/word-filter.js'].lineData[226] = 0;
  _$jscoverage['/word-filter.js'].lineData[227] = 0;
  _$jscoverage['/word-filter.js'].lineData[231] = 0;
  _$jscoverage['/word-filter.js'].lineData[234] = 0;
  _$jscoverage['/word-filter.js'].lineData[235] = 0;
  _$jscoverage['/word-filter.js'].lineData[237] = 0;
  _$jscoverage['/word-filter.js'].lineData[238] = 0;
  _$jscoverage['/word-filter.js'].lineData[243] = 0;
  _$jscoverage['/word-filter.js'].lineData[244] = 0;
  _$jscoverage['/word-filter.js'].lineData[246] = 0;
  _$jscoverage['/word-filter.js'].lineData[247] = 0;
  _$jscoverage['/word-filter.js'].lineData[251] = 0;
  _$jscoverage['/word-filter.js'].lineData[254] = 0;
  _$jscoverage['/word-filter.js'].lineData[262] = 0;
  _$jscoverage['/word-filter.js'].lineData[263] = 0;
  _$jscoverage['/word-filter.js'].lineData[267] = 0;
  _$jscoverage['/word-filter.js'].lineData[268] = 0;
  _$jscoverage['/word-filter.js'].lineData[269] = 0;
  _$jscoverage['/word-filter.js'].lineData[270] = 0;
  _$jscoverage['/word-filter.js'].lineData[272] = 0;
  _$jscoverage['/word-filter.js'].lineData[274] = 0;
  _$jscoverage['/word-filter.js'].lineData[276] = 0;
  _$jscoverage['/word-filter.js'].lineData[277] = 0;
  _$jscoverage['/word-filter.js'].lineData[278] = 0;
  _$jscoverage['/word-filter.js'].lineData[281] = 0;
  _$jscoverage['/word-filter.js'].lineData[283] = 0;
  _$jscoverage['/word-filter.js'].lineData[284] = 0;
  _$jscoverage['/word-filter.js'].lineData[285] = 0;
  _$jscoverage['/word-filter.js'].lineData[286] = 0;
  _$jscoverage['/word-filter.js'].lineData[287] = 0;
  _$jscoverage['/word-filter.js'].lineData[292] = 0;
  _$jscoverage['/word-filter.js'].lineData[295] = 0;
  _$jscoverage['/word-filter.js'].lineData[303] = 0;
  _$jscoverage['/word-filter.js'].lineData[315] = 0;
  _$jscoverage['/word-filter.js'].lineData[320] = 0;
  _$jscoverage['/word-filter.js'].lineData[321] = 0;
  _$jscoverage['/word-filter.js'].lineData[323] = 0;
  _$jscoverage['/word-filter.js'].lineData[324] = 0;
  _$jscoverage['/word-filter.js'].lineData[325] = 0;
  _$jscoverage['/word-filter.js'].lineData[327] = 0;
  _$jscoverage['/word-filter.js'].lineData[328] = 0;
  _$jscoverage['/word-filter.js'].lineData[329] = 0;
  _$jscoverage['/word-filter.js'].lineData[331] = 0;
  _$jscoverage['/word-filter.js'].lineData[332] = 0;
  _$jscoverage['/word-filter.js'].lineData[333] = 0;
  _$jscoverage['/word-filter.js'].lineData[338] = 0;
  _$jscoverage['/word-filter.js'].lineData[343] = 0;
  _$jscoverage['/word-filter.js'].lineData[346] = 0;
  _$jscoverage['/word-filter.js'].lineData[347] = 0;
  _$jscoverage['/word-filter.js'].lineData[350] = 0;
  _$jscoverage['/word-filter.js'].lineData[351] = 0;
  _$jscoverage['/word-filter.js'].lineData[352] = 0;
  _$jscoverage['/word-filter.js'].lineData[357] = 0;
  _$jscoverage['/word-filter.js'].lineData[359] = 0;
  _$jscoverage['/word-filter.js'].lineData[360] = 0;
  _$jscoverage['/word-filter.js'].lineData[363] = 0;
  _$jscoverage['/word-filter.js'].lineData[365] = 0;
  _$jscoverage['/word-filter.js'].lineData[367] = 0;
  _$jscoverage['/word-filter.js'].lineData[370] = 0;
  _$jscoverage['/word-filter.js'].lineData[371] = 0;
  _$jscoverage['/word-filter.js'].lineData[372] = 0;
  _$jscoverage['/word-filter.js'].lineData[373] = 0;
  _$jscoverage['/word-filter.js'].lineData[374] = 0;
  _$jscoverage['/word-filter.js'].lineData[375] = 0;
  _$jscoverage['/word-filter.js'].lineData[379] = 0;
  _$jscoverage['/word-filter.js'].lineData[380] = 0;
  _$jscoverage['/word-filter.js'].lineData[381] = 0;
  _$jscoverage['/word-filter.js'].lineData[391] = 0;
  _$jscoverage['/word-filter.js'].lineData[394] = 0;
  _$jscoverage['/word-filter.js'].lineData[395] = 0;
  _$jscoverage['/word-filter.js'].lineData[396] = 0;
  _$jscoverage['/word-filter.js'].lineData[397] = 0;
  _$jscoverage['/word-filter.js'].lineData[400] = 0;
  _$jscoverage['/word-filter.js'].lineData[401] = 0;
  _$jscoverage['/word-filter.js'].lineData[403] = 0;
  _$jscoverage['/word-filter.js'].lineData[404] = 0;
  _$jscoverage['/word-filter.js'].lineData[407] = 0;
  _$jscoverage['/word-filter.js'].lineData[408] = 0;
  _$jscoverage['/word-filter.js'].lineData[411] = 0;
  _$jscoverage['/word-filter.js'].lineData[412] = 0;
  _$jscoverage['/word-filter.js'].lineData[416] = 0;
  _$jscoverage['/word-filter.js'].lineData[420] = 0;
  _$jscoverage['/word-filter.js'].lineData[421] = 0;
  _$jscoverage['/word-filter.js'].lineData[422] = 0;
  _$jscoverage['/word-filter.js'].lineData[423] = 0;
  _$jscoverage['/word-filter.js'].lineData[425] = 0;
  _$jscoverage['/word-filter.js'].lineData[426] = 0;
  _$jscoverage['/word-filter.js'].lineData[427] = 0;
  _$jscoverage['/word-filter.js'].lineData[428] = 0;
  _$jscoverage['/word-filter.js'].lineData[430] = 0;
  _$jscoverage['/word-filter.js'].lineData[432] = 0;
  _$jscoverage['/word-filter.js'].lineData[434] = 0;
  _$jscoverage['/word-filter.js'].lineData[435] = 0;
  _$jscoverage['/word-filter.js'].lineData[437] = 0;
  _$jscoverage['/word-filter.js'].lineData[440] = 0;
  _$jscoverage['/word-filter.js'].lineData[442] = 0;
  _$jscoverage['/word-filter.js'].lineData[445] = 0;
  _$jscoverage['/word-filter.js'].lineData[446] = 0;
  _$jscoverage['/word-filter.js'].lineData[448] = 0;
  _$jscoverage['/word-filter.js'].lineData[450] = 0;
  _$jscoverage['/word-filter.js'].lineData[451] = 0;
  _$jscoverage['/word-filter.js'].lineData[455] = 0;
  _$jscoverage['/word-filter.js'].lineData[456] = 0;
  _$jscoverage['/word-filter.js'].lineData[464] = 0;
  _$jscoverage['/word-filter.js'].lineData[475] = 0;
  _$jscoverage['/word-filter.js'].lineData[476] = 0;
  _$jscoverage['/word-filter.js'].lineData[480] = 0;
  _$jscoverage['/word-filter.js'].lineData[484] = 0;
  _$jscoverage['/word-filter.js'].lineData[485] = 0;
  _$jscoverage['/word-filter.js'].lineData[487] = 0;
  _$jscoverage['/word-filter.js'].lineData[491] = 0;
  _$jscoverage['/word-filter.js'].lineData[492] = 0;
  _$jscoverage['/word-filter.js'].lineData[493] = 0;
  _$jscoverage['/word-filter.js'].lineData[494] = 0;
  _$jscoverage['/word-filter.js'].lineData[495] = 0;
  _$jscoverage['/word-filter.js'].lineData[496] = 0;
  _$jscoverage['/word-filter.js'].lineData[498] = 0;
  _$jscoverage['/word-filter.js'].lineData[500] = 0;
  _$jscoverage['/word-filter.js'].lineData[501] = 0;
  _$jscoverage['/word-filter.js'].lineData[503] = 0;
  _$jscoverage['/word-filter.js'].lineData[504] = 0;
  _$jscoverage['/word-filter.js'].lineData[509] = 0;
  _$jscoverage['/word-filter.js'].lineData[510] = 0;
  _$jscoverage['/word-filter.js'].lineData[511] = 0;
  _$jscoverage['/word-filter.js'].lineData[514] = 0;
  _$jscoverage['/word-filter.js'].lineData[515] = 0;
  _$jscoverage['/word-filter.js'].lineData[518] = 0;
  _$jscoverage['/word-filter.js'].lineData[523] = 0;
  _$jscoverage['/word-filter.js'].lineData[527] = 0;
  _$jscoverage['/word-filter.js'].lineData[528] = 0;
  _$jscoverage['/word-filter.js'].lineData[531] = 0;
  _$jscoverage['/word-filter.js'].lineData[546] = 0;
  _$jscoverage['/word-filter.js'].lineData[547] = 0;
  _$jscoverage['/word-filter.js'].lineData[556] = 0;
  _$jscoverage['/word-filter.js'].lineData[557] = 0;
  _$jscoverage['/word-filter.js'].lineData[559] = 0;
  _$jscoverage['/word-filter.js'].lineData[560] = 0;
  _$jscoverage['/word-filter.js'].lineData[562] = 0;
  _$jscoverage['/word-filter.js'].lineData[563] = 0;
  _$jscoverage['/word-filter.js'].lineData[566] = 0;
  _$jscoverage['/word-filter.js'].lineData[568] = 0;
  _$jscoverage['/word-filter.js'].lineData[569] = 0;
  _$jscoverage['/word-filter.js'].lineData[570] = 0;
  _$jscoverage['/word-filter.js'].lineData[572] = 0;
  _$jscoverage['/word-filter.js'].lineData[573] = 0;
  _$jscoverage['/word-filter.js'].lineData[578] = 0;
  _$jscoverage['/word-filter.js'].lineData[579] = 0;
  _$jscoverage['/word-filter.js'].lineData[580] = 0;
  _$jscoverage['/word-filter.js'].lineData[582] = 0;
  _$jscoverage['/word-filter.js'].lineData[583] = 0;
  _$jscoverage['/word-filter.js'].lineData[586] = 0;
  _$jscoverage['/word-filter.js'].lineData[589] = 0;
  _$jscoverage['/word-filter.js'].lineData[593] = 0;
  _$jscoverage['/word-filter.js'].lineData[596] = 0;
  _$jscoverage['/word-filter.js'].lineData[597] = 0;
  _$jscoverage['/word-filter.js'].lineData[598] = 0;
  _$jscoverage['/word-filter.js'].lineData[599] = 0;
  _$jscoverage['/word-filter.js'].lineData[603] = 0;
  _$jscoverage['/word-filter.js'].lineData[604] = 0;
  _$jscoverage['/word-filter.js'].lineData[605] = 0;
  _$jscoverage['/word-filter.js'].lineData[610] = 0;
  _$jscoverage['/word-filter.js'].lineData[611] = 0;
  _$jscoverage['/word-filter.js'].lineData[617] = 0;
  _$jscoverage['/word-filter.js'].lineData[619] = 0;
  _$jscoverage['/word-filter.js'].lineData[622] = 0;
  _$jscoverage['/word-filter.js'].lineData[624] = 0;
  _$jscoverage['/word-filter.js'].lineData[625] = 0;
  _$jscoverage['/word-filter.js'].lineData[633] = 0;
  _$jscoverage['/word-filter.js'].lineData[634] = 0;
  _$jscoverage['/word-filter.js'].lineData[637] = 0;
  _$jscoverage['/word-filter.js'].lineData[639] = 0;
  _$jscoverage['/word-filter.js'].lineData[642] = 0;
  _$jscoverage['/word-filter.js'].lineData[643] = 0;
  _$jscoverage['/word-filter.js'].lineData[644] = 0;
  _$jscoverage['/word-filter.js'].lineData[650] = 0;
  _$jscoverage['/word-filter.js'].lineData[651] = 0;
  _$jscoverage['/word-filter.js'].lineData[654] = 0;
  _$jscoverage['/word-filter.js'].lineData[655] = 0;
  _$jscoverage['/word-filter.js'].lineData[657] = 0;
  _$jscoverage['/word-filter.js'].lineData[659] = 0;
  _$jscoverage['/word-filter.js'].lineData[663] = 0;
  _$jscoverage['/word-filter.js'].lineData[668] = 0;
  _$jscoverage['/word-filter.js'].lineData[669] = 0;
  _$jscoverage['/word-filter.js'].lineData[670] = 0;
  _$jscoverage['/word-filter.js'].lineData[673] = 0;
  _$jscoverage['/word-filter.js'].lineData[674] = 0;
  _$jscoverage['/word-filter.js'].lineData[677] = 0;
  _$jscoverage['/word-filter.js'].lineData[681] = 0;
  _$jscoverage['/word-filter.js'].lineData[683] = 0;
  _$jscoverage['/word-filter.js'].lineData[688] = 0;
  _$jscoverage['/word-filter.js'].lineData[691] = 0;
  _$jscoverage['/word-filter.js'].lineData[692] = 0;
  _$jscoverage['/word-filter.js'].lineData[693] = 0;
  _$jscoverage['/word-filter.js'].lineData[695] = 0;
  _$jscoverage['/word-filter.js'].lineData[696] = 0;
  _$jscoverage['/word-filter.js'].lineData[699] = 0;
  _$jscoverage['/word-filter.js'].lineData[706] = 0;
  _$jscoverage['/word-filter.js'].lineData[707] = 0;
  _$jscoverage['/word-filter.js'].lineData[717] = 0;
  _$jscoverage['/word-filter.js'].lineData[718] = 0;
  _$jscoverage['/word-filter.js'].lineData[723] = 0;
  _$jscoverage['/word-filter.js'].lineData[731] = 0;
  _$jscoverage['/word-filter.js'].lineData[732] = 0;
  _$jscoverage['/word-filter.js'].lineData[738] = 0;
  _$jscoverage['/word-filter.js'].lineData[739] = 0;
  _$jscoverage['/word-filter.js'].lineData[740] = 0;
  _$jscoverage['/word-filter.js'].lineData[744] = 0;
  _$jscoverage['/word-filter.js'].lineData[748] = 0;
  _$jscoverage['/word-filter.js'].lineData[749] = 0;
  _$jscoverage['/word-filter.js'].lineData[756] = 0;
  _$jscoverage['/word-filter.js'].lineData[757] = 0;
  _$jscoverage['/word-filter.js'].lineData[759] = 0;
  _$jscoverage['/word-filter.js'].lineData[760] = 0;
  _$jscoverage['/word-filter.js'].lineData[764] = 0;
  _$jscoverage['/word-filter.js'].lineData[765] = 0;
  _$jscoverage['/word-filter.js'].lineData[766] = 0;
  _$jscoverage['/word-filter.js'].lineData[767] = 0;
  _$jscoverage['/word-filter.js'].lineData[772] = 0;
  _$jscoverage['/word-filter.js'].lineData[774] = 0;
  _$jscoverage['/word-filter.js'].lineData[777] = 0;
  _$jscoverage['/word-filter.js'].lineData[778] = 0;
  _$jscoverage['/word-filter.js'].lineData[779] = 0;
  _$jscoverage['/word-filter.js'].lineData[780] = 0;
  _$jscoverage['/word-filter.js'].lineData[782] = 0;
  _$jscoverage['/word-filter.js'].lineData[783] = 0;
  _$jscoverage['/word-filter.js'].lineData[785] = 0;
  _$jscoverage['/word-filter.js'].lineData[789] = 0;
  _$jscoverage['/word-filter.js'].lineData[790] = 0;
  _$jscoverage['/word-filter.js'].lineData[791] = 0;
  _$jscoverage['/word-filter.js'].lineData[799] = 0;
  _$jscoverage['/word-filter.js'].lineData[801] = 0;
  _$jscoverage['/word-filter.js'].lineData[806] = 0;
  _$jscoverage['/word-filter.js'].lineData[811] = 0;
  _$jscoverage['/word-filter.js'].lineData[813] = 0;
  _$jscoverage['/word-filter.js'].lineData[814] = 0;
  _$jscoverage['/word-filter.js'].lineData[815] = 0;
  _$jscoverage['/word-filter.js'].lineData[819] = 0;
  _$jscoverage['/word-filter.js'].lineData[821] = 0;
  _$jscoverage['/word-filter.js'].lineData[822] = 0;
  _$jscoverage['/word-filter.js'].lineData[825] = 0;
  _$jscoverage['/word-filter.js'].lineData[826] = 0;
  _$jscoverage['/word-filter.js'].lineData[828] = 0;
  _$jscoverage['/word-filter.js'].lineData[829] = 0;
  _$jscoverage['/word-filter.js'].lineData[831] = 0;
  _$jscoverage['/word-filter.js'].lineData[832] = 0;
  _$jscoverage['/word-filter.js'].lineData[834] = 0;
  _$jscoverage['/word-filter.js'].lineData[840] = 0;
  _$jscoverage['/word-filter.js'].lineData[841] = 0;
  _$jscoverage['/word-filter.js'].lineData[844] = 0;
  _$jscoverage['/word-filter.js'].lineData[845] = 0;
  _$jscoverage['/word-filter.js'].lineData[846] = 0;
  _$jscoverage['/word-filter.js'].lineData[847] = 0;
  _$jscoverage['/word-filter.js'].lineData[849] = 0;
  _$jscoverage['/word-filter.js'].lineData[854] = 0;
  _$jscoverage['/word-filter.js'].lineData[861] = 0;
  _$jscoverage['/word-filter.js'].lineData[862] = 0;
  _$jscoverage['/word-filter.js'].lineData[863] = 0;
  _$jscoverage['/word-filter.js'].lineData[865] = 0;
  _$jscoverage['/word-filter.js'].lineData[866] = 0;
  _$jscoverage['/word-filter.js'].lineData[869] = 0;
  _$jscoverage['/word-filter.js'].lineData[871] = 0;
  _$jscoverage['/word-filter.js'].lineData[878] = 0;
  _$jscoverage['/word-filter.js'].lineData[879] = 0;
  _$jscoverage['/word-filter.js'].lineData[880] = 0;
  _$jscoverage['/word-filter.js'].lineData[882] = 0;
  _$jscoverage['/word-filter.js'].lineData[883] = 0;
  _$jscoverage['/word-filter.js'].lineData[886] = 0;
  _$jscoverage['/word-filter.js'].lineData[887] = 0;
  _$jscoverage['/word-filter.js'].lineData[890] = 0;
  _$jscoverage['/word-filter.js'].lineData[891] = 0;
  _$jscoverage['/word-filter.js'].lineData[892] = 0;
  _$jscoverage['/word-filter.js'].lineData[893] = 0;
  _$jscoverage['/word-filter.js'].lineData[899] = 0;
  _$jscoverage['/word-filter.js'].lineData[900] = 0;
  _$jscoverage['/word-filter.js'].lineData[911] = 0;
  _$jscoverage['/word-filter.js'].lineData[912] = 0;
  _$jscoverage['/word-filter.js'].lineData[913] = 0;
  _$jscoverage['/word-filter.js'].lineData[916] = 0;
  _$jscoverage['/word-filter.js'].lineData[918] = 0;
  _$jscoverage['/word-filter.js'].lineData[921] = 0;
  _$jscoverage['/word-filter.js'].lineData[923] = 0;
  _$jscoverage['/word-filter.js'].lineData[924] = 0;
  _$jscoverage['/word-filter.js'].lineData[926] = 0;
  _$jscoverage['/word-filter.js'].lineData[927] = 0;
  _$jscoverage['/word-filter.js'].lineData[931] = 0;
  _$jscoverage['/word-filter.js'].lineData[933] = 0;
  _$jscoverage['/word-filter.js'].lineData[934] = 0;
  _$jscoverage['/word-filter.js'].lineData[935] = 0;
  _$jscoverage['/word-filter.js'].lineData[937] = 0;
  _$jscoverage['/word-filter.js'].lineData[938] = 0;
  _$jscoverage['/word-filter.js'].lineData[939] = 0;
  _$jscoverage['/word-filter.js'].lineData[941] = 0;
  _$jscoverage['/word-filter.js'].lineData[944] = 0;
  _$jscoverage['/word-filter.js'].lineData[945] = 0;
  _$jscoverage['/word-filter.js'].lineData[948] = 0;
  _$jscoverage['/word-filter.js'].lineData[950] = 0;
  _$jscoverage['/word-filter.js'].lineData[951] = 0;
  _$jscoverage['/word-filter.js'].lineData[957] = 0;
  _$jscoverage['/word-filter.js'].lineData[958] = 0;
  _$jscoverage['/word-filter.js'].lineData[960] = 0;
  _$jscoverage['/word-filter.js'].lineData[961] = 0;
  _$jscoverage['/word-filter.js'].lineData[962] = 0;
  _$jscoverage['/word-filter.js'].lineData[963] = 0;
  _$jscoverage['/word-filter.js'].lineData[968] = 0;
  _$jscoverage['/word-filter.js'].lineData[969] = 0;
  _$jscoverage['/word-filter.js'].lineData[970] = 0;
  _$jscoverage['/word-filter.js'].lineData[973] = 0;
  _$jscoverage['/word-filter.js'].lineData[976] = 0;
  _$jscoverage['/word-filter.js'].lineData[977] = 0;
  _$jscoverage['/word-filter.js'].lineData[981] = 0;
  _$jscoverage['/word-filter.js'].lineData[982] = 0;
  _$jscoverage['/word-filter.js'].lineData[984] = 0;
  _$jscoverage['/word-filter.js'].lineData[986] = 0;
  _$jscoverage['/word-filter.js'].lineData[991] = 0;
  _$jscoverage['/word-filter.js'].lineData[995] = 0;
  _$jscoverage['/word-filter.js'].lineData[997] = 0;
  _$jscoverage['/word-filter.js'].lineData[1012] = 0;
  _$jscoverage['/word-filter.js'].lineData[1013] = 0;
  _$jscoverage['/word-filter.js'].lineData[1014] = 0;
  _$jscoverage['/word-filter.js'].lineData[1015] = 0;
  _$jscoverage['/word-filter.js'].lineData[1016] = 0;
  _$jscoverage['/word-filter.js'].lineData[1020] = 0;
  _$jscoverage['/word-filter.js'].lineData[1021] = 0;
  _$jscoverage['/word-filter.js'].lineData[1047] = 0;
  _$jscoverage['/word-filter.js'].lineData[1048] = 0;
  _$jscoverage['/word-filter.js'].lineData[1051] = 0;
  _$jscoverage['/word-filter.js'].lineData[1052] = 0;
  _$jscoverage['/word-filter.js'].lineData[1054] = 0;
  _$jscoverage['/word-filter.js'].lineData[1055] = 0;
  _$jscoverage['/word-filter.js'].lineData[1058] = 0;
  _$jscoverage['/word-filter.js'].lineData[1059] = 0;
  _$jscoverage['/word-filter.js'].lineData[1063] = 0;
  _$jscoverage['/word-filter.js'].lineData[1071] = 0;
  _$jscoverage['/word-filter.js'].lineData[1072] = 0;
  _$jscoverage['/word-filter.js'].lineData[1077] = 0;
  _$jscoverage['/word-filter.js'].lineData[1078] = 0;
  _$jscoverage['/word-filter.js'].lineData[1084] = 0;
  _$jscoverage['/word-filter.js'].lineData[1085] = 0;
  _$jscoverage['/word-filter.js'].lineData[1089] = 0;
  _$jscoverage['/word-filter.js'].lineData[1090] = 0;
  _$jscoverage['/word-filter.js'].lineData[1104] = 0;
  _$jscoverage['/word-filter.js'].lineData[1105] = 0;
  _$jscoverage['/word-filter.js'].lineData[1115] = 0;
  _$jscoverage['/word-filter.js'].lineData[1119] = 0;
  _$jscoverage['/word-filter.js'].lineData[1121] = 0;
  _$jscoverage['/word-filter.js'].lineData[1123] = 0;
  _$jscoverage['/word-filter.js'].lineData[1127] = 0;
  _$jscoverage['/word-filter.js'].lineData[1128] = 0;
  _$jscoverage['/word-filter.js'].lineData[1135] = 0;
  _$jscoverage['/word-filter.js'].lineData[1136] = 0;
  _$jscoverage['/word-filter.js'].lineData[1139] = 0;
  _$jscoverage['/word-filter.js'].lineData[1145] = 0;
  _$jscoverage['/word-filter.js'].lineData[1164] = 0;
  _$jscoverage['/word-filter.js'].lineData[1165] = 0;
  _$jscoverage['/word-filter.js'].lineData[1170] = 0;
  _$jscoverage['/word-filter.js'].lineData[1172] = 0;
}
if (! _$jscoverage['/word-filter.js'].functionData) {
  _$jscoverage['/word-filter.js'].functionData = [];
  _$jscoverage['/word-filter.js'].functionData[0] = 0;
  _$jscoverage['/word-filter.js'].functionData[1] = 0;
  _$jscoverage['/word-filter.js'].functionData[2] = 0;
  _$jscoverage['/word-filter.js'].functionData[3] = 0;
  _$jscoverage['/word-filter.js'].functionData[4] = 0;
  _$jscoverage['/word-filter.js'].functionData[5] = 0;
  _$jscoverage['/word-filter.js'].functionData[6] = 0;
  _$jscoverage['/word-filter.js'].functionData[7] = 0;
  _$jscoverage['/word-filter.js'].functionData[8] = 0;
  _$jscoverage['/word-filter.js'].functionData[9] = 0;
  _$jscoverage['/word-filter.js'].functionData[10] = 0;
  _$jscoverage['/word-filter.js'].functionData[11] = 0;
  _$jscoverage['/word-filter.js'].functionData[12] = 0;
  _$jscoverage['/word-filter.js'].functionData[13] = 0;
  _$jscoverage['/word-filter.js'].functionData[14] = 0;
  _$jscoverage['/word-filter.js'].functionData[15] = 0;
  _$jscoverage['/word-filter.js'].functionData[16] = 0;
  _$jscoverage['/word-filter.js'].functionData[17] = 0;
  _$jscoverage['/word-filter.js'].functionData[18] = 0;
  _$jscoverage['/word-filter.js'].functionData[19] = 0;
  _$jscoverage['/word-filter.js'].functionData[20] = 0;
  _$jscoverage['/word-filter.js'].functionData[21] = 0;
  _$jscoverage['/word-filter.js'].functionData[22] = 0;
  _$jscoverage['/word-filter.js'].functionData[23] = 0;
  _$jscoverage['/word-filter.js'].functionData[24] = 0;
  _$jscoverage['/word-filter.js'].functionData[25] = 0;
  _$jscoverage['/word-filter.js'].functionData[26] = 0;
  _$jscoverage['/word-filter.js'].functionData[27] = 0;
  _$jscoverage['/word-filter.js'].functionData[28] = 0;
  _$jscoverage['/word-filter.js'].functionData[29] = 0;
  _$jscoverage['/word-filter.js'].functionData[30] = 0;
  _$jscoverage['/word-filter.js'].functionData[31] = 0;
  _$jscoverage['/word-filter.js'].functionData[32] = 0;
  _$jscoverage['/word-filter.js'].functionData[33] = 0;
  _$jscoverage['/word-filter.js'].functionData[34] = 0;
  _$jscoverage['/word-filter.js'].functionData[35] = 0;
  _$jscoverage['/word-filter.js'].functionData[36] = 0;
  _$jscoverage['/word-filter.js'].functionData[37] = 0;
  _$jscoverage['/word-filter.js'].functionData[38] = 0;
  _$jscoverage['/word-filter.js'].functionData[39] = 0;
  _$jscoverage['/word-filter.js'].functionData[40] = 0;
  _$jscoverage['/word-filter.js'].functionData[41] = 0;
  _$jscoverage['/word-filter.js'].functionData[42] = 0;
  _$jscoverage['/word-filter.js'].functionData[43] = 0;
  _$jscoverage['/word-filter.js'].functionData[44] = 0;
  _$jscoverage['/word-filter.js'].functionData[45] = 0;
  _$jscoverage['/word-filter.js'].functionData[46] = 0;
  _$jscoverage['/word-filter.js'].functionData[47] = 0;
  _$jscoverage['/word-filter.js'].functionData[48] = 0;
  _$jscoverage['/word-filter.js'].functionData[49] = 0;
  _$jscoverage['/word-filter.js'].functionData[50] = 0;
  _$jscoverage['/word-filter.js'].functionData[51] = 0;
  _$jscoverage['/word-filter.js'].functionData[52] = 0;
  _$jscoverage['/word-filter.js'].functionData[53] = 0;
  _$jscoverage['/word-filter.js'].functionData[54] = 0;
  _$jscoverage['/word-filter.js'].functionData[55] = 0;
  _$jscoverage['/word-filter.js'].functionData[56] = 0;
  _$jscoverage['/word-filter.js'].functionData[57] = 0;
}
if (! _$jscoverage['/word-filter.js'].branchData) {
  _$jscoverage['/word-filter.js'].branchData = {};
  _$jscoverage['/word-filter.js'].branchData['54'] = [];
  _$jscoverage['/word-filter.js'].branchData['54'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['55'] = [];
  _$jscoverage['/word-filter.js'].branchData['55'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['66'] = [];
  _$jscoverage['/word-filter.js'].branchData['66'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['74'] = [];
  _$jscoverage['/word-filter.js'].branchData['74'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['89'] = [];
  _$jscoverage['/word-filter.js'].branchData['89'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['97'] = [];
  _$jscoverage['/word-filter.js'].branchData['97'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['111'] = [];
  _$jscoverage['/word-filter.js'].branchData['111'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['113'] = [];
  _$jscoverage['/word-filter.js'].branchData['113'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['113'][2] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['114'] = [];
  _$jscoverage['/word-filter.js'].branchData['114'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['118'] = [];
  _$jscoverage['/word-filter.js'].branchData['118'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['122'] = [];
  _$jscoverage['/word-filter.js'].branchData['122'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['124'] = [];
  _$jscoverage['/word-filter.js'].branchData['124'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['127'] = [];
  _$jscoverage['/word-filter.js'].branchData['127'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['138'] = [];
  _$jscoverage['/word-filter.js'].branchData['138'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['138'][2] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['147'] = [];
  _$jscoverage['/word-filter.js'].branchData['147'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['149'] = [];
  _$jscoverage['/word-filter.js'].branchData['149'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['151'] = [];
  _$jscoverage['/word-filter.js'].branchData['151'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['153'] = [];
  _$jscoverage['/word-filter.js'].branchData['153'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['155'] = [];
  _$jscoverage['/word-filter.js'].branchData['155'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['168'] = [];
  _$jscoverage['/word-filter.js'].branchData['168'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['172'] = [];
  _$jscoverage['/word-filter.js'].branchData['172'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['202'] = [];
  _$jscoverage['/word-filter.js'].branchData['202'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['202'][2] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['216'] = [];
  _$jscoverage['/word-filter.js'].branchData['216'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['231'] = [];
  _$jscoverage['/word-filter.js'].branchData['231'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['234'] = [];
  _$jscoverage['/word-filter.js'].branchData['234'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['237'] = [];
  _$jscoverage['/word-filter.js'].branchData['237'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['238'] = [];
  _$jscoverage['/word-filter.js'].branchData['238'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['243'] = [];
  _$jscoverage['/word-filter.js'].branchData['243'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['246'] = [];
  _$jscoverage['/word-filter.js'].branchData['246'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['254'] = [];
  _$jscoverage['/word-filter.js'].branchData['254'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['255'] = [];
  _$jscoverage['/word-filter.js'].branchData['255'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['263'] = [];
  _$jscoverage['/word-filter.js'].branchData['263'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['266'] = [];
  _$jscoverage['/word-filter.js'].branchData['266'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['269'] = [];
  _$jscoverage['/word-filter.js'].branchData['269'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['281'] = [];
  _$jscoverage['/word-filter.js'].branchData['281'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['286'] = [];
  _$jscoverage['/word-filter.js'].branchData['286'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['303'] = [];
  _$jscoverage['/word-filter.js'].branchData['303'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['320'] = [];
  _$jscoverage['/word-filter.js'].branchData['320'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['323'] = [];
  _$jscoverage['/word-filter.js'].branchData['323'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['328'] = [];
  _$jscoverage['/word-filter.js'].branchData['328'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['331'] = [];
  _$jscoverage['/word-filter.js'].branchData['331'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['338'] = [];
  _$jscoverage['/word-filter.js'].branchData['338'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['346'] = [];
  _$jscoverage['/word-filter.js'].branchData['346'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['350'] = [];
  _$jscoverage['/word-filter.js'].branchData['350'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['351'] = [];
  _$jscoverage['/word-filter.js'].branchData['351'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['357'] = [];
  _$jscoverage['/word-filter.js'].branchData['357'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['367'] = [];
  _$jscoverage['/word-filter.js'].branchData['367'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['370'] = [];
  _$jscoverage['/word-filter.js'].branchData['370'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['370'][2] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['372'] = [];
  _$jscoverage['/word-filter.js'].branchData['372'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['372'][2] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['391'] = [];
  _$jscoverage['/word-filter.js'].branchData['391'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['395'] = [];
  _$jscoverage['/word-filter.js'].branchData['395'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['395'][2] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['396'] = [];
  _$jscoverage['/word-filter.js'].branchData['396'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['396'][2] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['396'][3] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['400'] = [];
  _$jscoverage['/word-filter.js'].branchData['400'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['400'][2] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['420'] = [];
  _$jscoverage['/word-filter.js'].branchData['420'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['425'] = [];
  _$jscoverage['/word-filter.js'].branchData['425'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['430'] = [];
  _$jscoverage['/word-filter.js'].branchData['430'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['434'] = [];
  _$jscoverage['/word-filter.js'].branchData['434'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['448'] = [];
  _$jscoverage['/word-filter.js'].branchData['448'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['448'][2] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['450'] = [];
  _$jscoverage['/word-filter.js'].branchData['450'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['455'] = [];
  _$jscoverage['/word-filter.js'].branchData['455'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['480'] = [];
  _$jscoverage['/word-filter.js'].branchData['480'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['485'] = [];
  _$jscoverage['/word-filter.js'].branchData['485'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['485'][2] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['491'] = [];
  _$jscoverage['/word-filter.js'].branchData['491'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['492'] = [];
  _$jscoverage['/word-filter.js'].branchData['492'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['498'] = [];
  _$jscoverage['/word-filter.js'].branchData['498'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['499'] = [];
  _$jscoverage['/word-filter.js'].branchData['499'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['500'] = [];
  _$jscoverage['/word-filter.js'].branchData['500'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['501'] = [];
  _$jscoverage['/word-filter.js'].branchData['501'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['501'][2] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['503'] = [];
  _$jscoverage['/word-filter.js'].branchData['503'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['509'] = [];
  _$jscoverage['/word-filter.js'].branchData['509'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['514'] = [];
  _$jscoverage['/word-filter.js'].branchData['514'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['523'] = [];
  _$jscoverage['/word-filter.js'].branchData['523'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['527'] = [];
  _$jscoverage['/word-filter.js'].branchData['527'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['547'] = [];
  _$jscoverage['/word-filter.js'].branchData['547'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['556'] = [];
  _$jscoverage['/word-filter.js'].branchData['556'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['559'] = [];
  _$jscoverage['/word-filter.js'].branchData['559'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['562'] = [];
  _$jscoverage['/word-filter.js'].branchData['562'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['562'][2] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['568'] = [];
  _$jscoverage['/word-filter.js'].branchData['568'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['569'] = [];
  _$jscoverage['/word-filter.js'].branchData['569'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['569'][2] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['578'] = [];
  _$jscoverage['/word-filter.js'].branchData['578'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['579'] = [];
  _$jscoverage['/word-filter.js'].branchData['579'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['582'] = [];
  _$jscoverage['/word-filter.js'].branchData['582'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['604'] = [];
  _$jscoverage['/word-filter.js'].branchData['604'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['611'] = [];
  _$jscoverage['/word-filter.js'].branchData['611'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['619'] = [];
  _$jscoverage['/word-filter.js'].branchData['619'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['620'] = [];
  _$jscoverage['/word-filter.js'].branchData['620'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['624'] = [];
  _$jscoverage['/word-filter.js'].branchData['624'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['634'] = [];
  _$jscoverage['/word-filter.js'].branchData['634'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['634'][2] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['637'] = [];
  _$jscoverage['/word-filter.js'].branchData['637'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['637'][2] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['637'][3] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['638'] = [];
  _$jscoverage['/word-filter.js'].branchData['638'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['643'] = [];
  _$jscoverage['/word-filter.js'].branchData['643'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['644'] = [];
  _$jscoverage['/word-filter.js'].branchData['644'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['644'][2] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['654'] = [];
  _$jscoverage['/word-filter.js'].branchData['654'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['655'] = [];
  _$jscoverage['/word-filter.js'].branchData['655'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['655'][2] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['668'] = [];
  _$jscoverage['/word-filter.js'].branchData['668'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['695'] = [];
  _$jscoverage['/word-filter.js'].branchData['695'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['739'] = [];
  _$jscoverage['/word-filter.js'].branchData['739'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['744'] = [];
  _$jscoverage['/word-filter.js'].branchData['744'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['748'] = [];
  _$jscoverage['/word-filter.js'].branchData['748'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['756'] = [];
  _$jscoverage['/word-filter.js'].branchData['756'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['759'] = [];
  _$jscoverage['/word-filter.js'].branchData['759'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['764'] = [];
  _$jscoverage['/word-filter.js'].branchData['764'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['766'] = [];
  _$jscoverage['/word-filter.js'].branchData['766'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['772'] = [];
  _$jscoverage['/word-filter.js'].branchData['772'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['772'][2] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['773'] = [];
  _$jscoverage['/word-filter.js'].branchData['773'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['777'] = [];
  _$jscoverage['/word-filter.js'].branchData['777'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['779'] = [];
  _$jscoverage['/word-filter.js'].branchData['779'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['789'] = [];
  _$jscoverage['/word-filter.js'].branchData['789'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['799'] = [];
  _$jscoverage['/word-filter.js'].branchData['799'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['803'] = [];
  _$jscoverage['/word-filter.js'].branchData['803'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['806'] = [];
  _$jscoverage['/word-filter.js'].branchData['806'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['815'] = [];
  _$jscoverage['/word-filter.js'].branchData['815'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['821'] = [];
  _$jscoverage['/word-filter.js'].branchData['821'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['825'] = [];
  _$jscoverage['/word-filter.js'].branchData['825'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['828'] = [];
  _$jscoverage['/word-filter.js'].branchData['828'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['831'] = [];
  _$jscoverage['/word-filter.js'].branchData['831'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['844'] = [];
  _$jscoverage['/word-filter.js'].branchData['844'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['846'] = [];
  _$jscoverage['/word-filter.js'].branchData['846'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['849'] = [];
  _$jscoverage['/word-filter.js'].branchData['849'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['861'] = [];
  _$jscoverage['/word-filter.js'].branchData['861'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['863'] = [];
  _$jscoverage['/word-filter.js'].branchData['863'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['863'][2] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['865'] = [];
  _$jscoverage['/word-filter.js'].branchData['865'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['866'] = [];
  _$jscoverage['/word-filter.js'].branchData['866'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['879'] = [];
  _$jscoverage['/word-filter.js'].branchData['879'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['879'][2] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['886'] = [];
  _$jscoverage['/word-filter.js'].branchData['886'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['899'] = [];
  _$jscoverage['/word-filter.js'].branchData['899'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['911'] = [];
  _$jscoverage['/word-filter.js'].branchData['911'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['921'] = [];
  _$jscoverage['/word-filter.js'].branchData['921'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['926'] = [];
  _$jscoverage['/word-filter.js'].branchData['926'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['931'] = [];
  _$jscoverage['/word-filter.js'].branchData['931'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['933'] = [];
  _$jscoverage['/word-filter.js'].branchData['933'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['934'] = [];
  _$jscoverage['/word-filter.js'].branchData['934'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['934'][2] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['937'] = [];
  _$jscoverage['/word-filter.js'].branchData['937'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['944'] = [];
  _$jscoverage['/word-filter.js'].branchData['944'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['946'] = [];
  _$jscoverage['/word-filter.js'].branchData['946'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['947'] = [];
  _$jscoverage['/word-filter.js'].branchData['947'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['957'] = [];
  _$jscoverage['/word-filter.js'].branchData['957'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['961'] = [];
  _$jscoverage['/word-filter.js'].branchData['961'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['968'] = [];
  _$jscoverage['/word-filter.js'].branchData['968'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['970'] = [];
  _$jscoverage['/word-filter.js'].branchData['970'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['970'][2] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['973'] = [];
  _$jscoverage['/word-filter.js'].branchData['973'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['973'][2] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['974'] = [];
  _$jscoverage['/word-filter.js'].branchData['974'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['976'] = [];
  _$jscoverage['/word-filter.js'].branchData['976'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['982'] = [];
  _$jscoverage['/word-filter.js'].branchData['982'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['995'] = [];
  _$jscoverage['/word-filter.js'].branchData['995'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['1013'] = [];
  _$jscoverage['/word-filter.js'].branchData['1013'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['1015'] = [];
  _$jscoverage['/word-filter.js'].branchData['1015'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['1015'][2] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['1020'] = [];
  _$jscoverage['/word-filter.js'].branchData['1020'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['1047'] = [];
  _$jscoverage['/word-filter.js'].branchData['1047'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['1051'] = [];
  _$jscoverage['/word-filter.js'].branchData['1051'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['1054'] = [];
  _$jscoverage['/word-filter.js'].branchData['1054'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['1058'] = [];
  _$jscoverage['/word-filter.js'].branchData['1058'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['1071'] = [];
  _$jscoverage['/word-filter.js'].branchData['1071'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['1077'] = [];
  _$jscoverage['/word-filter.js'].branchData['1077'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['1084'] = [];
  _$jscoverage['/word-filter.js'].branchData['1084'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['1089'] = [];
  _$jscoverage['/word-filter.js'].branchData['1089'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['1119'] = [];
  _$jscoverage['/word-filter.js'].branchData['1119'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['1121'] = [];
  _$jscoverage['/word-filter.js'].branchData['1121'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['1121'][2] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['1122'] = [];
  _$jscoverage['/word-filter.js'].branchData['1122'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['1127'] = [];
  _$jscoverage['/word-filter.js'].branchData['1127'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['1131'] = [];
  _$jscoverage['/word-filter.js'].branchData['1131'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['1132'] = [];
  _$jscoverage['/word-filter.js'].branchData['1132'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['1135'] = [];
  _$jscoverage['/word-filter.js'].branchData['1135'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['1164'] = [];
  _$jscoverage['/word-filter.js'].branchData['1164'][1] = new BranchData();
}
_$jscoverage['/word-filter.js'].branchData['1164'][1].init(807, 8, 'UA.gecko');
function visit191_1164_1(result) {
  _$jscoverage['/word-filter.js'].branchData['1164'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['1135'][1].init(565, 45, 'imgSrc && (img.setAttribute("src", imgSrc))');
function visit190_1135_1(result) {
  _$jscoverage['/word-filter.js'].branchData['1135'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['1132'][1].init(414, 29, 'imgSrcInfo && imgSrcInfo[1]');
function visit189_1132_1(result) {
  _$jscoverage['/word-filter.js'].branchData['1132'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['1131'][1].init(284, 90, 'previousComment && previousComment.toHtml().match(/<v:imagedata[^>]*o:href=[\'"](.*?)[\'"]/)');
function visit188_1131_1(result) {
  _$jscoverage['/word-filter.js'].branchData['1131'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['1127'][1].init(726, 21, 'UA.gecko && imageInfo');
function visit187_1127_1(result) {
  _$jscoverage['/word-filter.js'].branchData['1127'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['1122'][1].init(96, 60, 'listSymbol && listSymbol.match(/>(?:[(]?)([^\\s]+?)([.)]?)</)');
function visit186_1122_1(result) {
  _$jscoverage['/word-filter.js'].branchData['1122'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['1121'][2].init(138, 17, 'imageInfo && \'l.\'');
function visit185_1121_2(result) {
  _$jscoverage['/word-filter.js'].branchData['1121'][2].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['1121'][1].init(119, 38, 'listInfo[1] || (imageInfo && \'l.\')');
function visit184_1121_1(result) {
  _$jscoverage['/word-filter.js'].branchData['1121'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['1119'][1].init(240, 8, 'listInfo');
function visit183_1119_1(result) {
  _$jscoverage['/word-filter.js'].branchData['1119'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['1089'][1].init(26, 37, 'element.nodeName in dtd.$tableContent');
function visit182_1089_1(result) {
  _$jscoverage['/word-filter.js'].branchData['1089'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['1084'][1].init(26, 37, 'element.nodeName in dtd.$tableContent');
function visit181_1084_1(result) {
  _$jscoverage['/word-filter.js'].branchData['1084'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['1077'][1].init(38, 54, 'element.nodeName in {\n  table: 1, \n  td: 1, \n  th: 1, \n  img: 1}');
function visit180_1077_1(result) {
  _$jscoverage['/word-filter.js'].branchData['1077'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['1071'][1].init(38, 25, 'element.nodeName == \'img\'');
function visit179_1071_1(result) {
  _$jscoverage['/word-filter.js'].branchData['1071'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['1058'][1].init(569, 38, 'value && !emptyMarginRegex.test(value)');
function visit178_1058_1(result) {
  _$jscoverage['/word-filter.js'].branchData['1058'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['1054'][1].init(419, 23, 'name != indentStyleName');
function visit177_1054_1(result) {
  _$jscoverage['/word-filter.js'].branchData['1054'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['1051'][1].init(195, 16, 'name == \'margin\'');
function visit176_1051_1(result) {
  _$jscoverage['/word-filter.js'].branchData['1051'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['1047'][1].init(34, 36, 'element.nodeName in {\n  p: 1, \n  div: 1}');
function visit175_1047_1(result) {
  _$jscoverage['/word-filter.js'].branchData['1047'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['1020'][1].init(26, 27, 'getAncestor(element, /h\\d/)');
function visit174_1020_1(result) {
  _$jscoverage['/word-filter.js'].branchData['1020'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['1015'][2].init(228, 40, 'href && href.match(/file:\\/\\/\\/[\\S]+#/i)');
function visit173_1015_2(result) {
  _$jscoverage['/word-filter.js'].branchData['1015'][2].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['1015'][1].init(215, 53, 'UA.webkit && href && href.match(/file:\\/\\/\\/[\\S]+#/i)');
function visit172_1015_1(result) {
  _$jscoverage['/word-filter.js'].branchData['1015'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['1013'][1].init(57, 70, '!(href = element.getAttribute("href")) && element.getAttribute("name")');
function visit171_1013_1(result) {
  _$jscoverage['/word-filter.js'].branchData['1013'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['995'][1].init(2196, 9, 'styleText');
function visit170_995_1(result) {
  _$jscoverage['/word-filter.js'].branchData['995'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['982'][1].init(468, 120, 'ancestor && (/ mso-hide:\\s*all|display:\\s*none /).test(ancestor.getAttribute("style"))');
function visit169_982_1(result) {
  _$jscoverage['/word-filter.js'].branchData['982'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['976'][1].init(425, 8, 'listType');
function visit168_976_1(result) {
  _$jscoverage['/word-filter.js'].branchData['976'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['974'][1].init(112, 60, 'listSymbol && listSymbol.match(/^(?:[(]?)([^\\s]+?)([.)]?)$/)');
function visit167_974_1(result) {
  _$jscoverage['/word-filter.js'].branchData['974'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['973'][2].init(256, 32, 'listSymbolNode.nodeValue || \'l.\'');
function visit166_973_2(result) {
  _$jscoverage['/word-filter.js'].branchData['973'][2].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['973'][1].init(236, 54, 'listSymbolNode && (listSymbolNode.nodeValue || \'l.\')');
function visit165_973_1(result) {
  _$jscoverage['/word-filter.js'].branchData['973'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['970'][2].init(55, 22, 'node.nodeName == \'img\'');
function visit164_970_2(result) {
  _$jscoverage['/word-filter.js'].branchData['970'][2].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['970'][1].init(37, 40, 'node.nodeValue || node.nodeName == \'img\'');
function visit163_970_1(result) {
  _$jscoverage['/word-filter.js'].branchData['970'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['968'][1].init(620, 30, 'isListBulletIndicator(element)');
function visit162_968_1(result) {
  _$jscoverage['/word-filter.js'].branchData['968'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['961'][1].init(280, 33, 'containsNothingButSpaces(element)');
function visit161_961_1(result) {
  _$jscoverage['/word-filter.js'].branchData['961'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['957'][1].init(101, 41, 'isListBulletIndicator(element.parentNode)');
function visit160_957_1(result) {
  _$jscoverage['/word-filter.js'].branchData['957'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['947'][1].init(59, 8, 'size < 3');
function visit159_947_1(result) {
  _$jscoverage['/word-filter.js'].branchData['947'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['946'][1].init(48, 8, 'size > 3');
function visit158_946_1(result) {
  _$jscoverage['/word-filter.js'].branchData['946'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['944'][1].init(920, 4, 'size');
function visit157_944_1(result) {
  _$jscoverage['/word-filter.js'].branchData['944'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['937'][1].init(461, 28, 'element.getAttribute("face")');
function visit156_937_1(result) {
  _$jscoverage['/word-filter.js'].branchData['937'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['934'][2].init(30, 42, 'element.getAttribute("color") != \'#000000\'');
function visit155_934_2(result) {
  _$jscoverage['/word-filter.js'].branchData['934'][2].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['934'][1].init(30, 109, 'element.getAttribute("color") != \'#000000\' && (styleText += \'color:\' + element.getAttribute("color") + \';\')');
function visit154_934_1(result) {
  _$jscoverage['/word-filter.js'].branchData['934'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['933'][1].init(169, 29, 'element.getAttribute("color")');
function visit153_933_1(result) {
  _$jscoverage['/word-filter.js'].branchData['933'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['931'][1].init(38, 15, 'styleText || \'\'');
function visit152_931_1(result) {
  _$jscoverage['/word-filter.js'].branchData['931'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['926'][1].init(198, 40, 'styleText && addStyle(parent, styleText)');
function visit151_926_1(result) {
  _$jscoverage['/word-filter.js'].branchData['926'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['921'][1].init(455, 21, '\'font\' == parent.name');
function visit150_921_1(result) {
  _$jscoverage['/word-filter.js'].branchData['921'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['911'][1].init(103, 41, 'isListBulletIndicator(element.parentNode)');
function visit149_911_1(result) {
  _$jscoverage['/word-filter.js'].branchData['911'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['899'][1].init(84, 29, 'getAncestor(element, \'thead\')');
function visit148_899_1(result) {
  _$jscoverage['/word-filter.js'].branchData['899'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['886'][1].init(255, 29, 'element.getAttribute("style")');
function visit147_886_1(result) {
  _$jscoverage['/word-filter.js'].branchData['886'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['879'][2].init(398, 31, 'singleChild.nodeName == \'table\'');
function visit146_879_2(result) {
  _$jscoverage['/word-filter.js'].branchData['879'][2].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['879'][1].init(383, 46, 'singleChild && singleChild.nodeName == \'table\'');
function visit145_879_1(result) {
  _$jscoverage['/word-filter.js'].branchData['879'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['866'][1].init(312, 85, '!bullet.getAttribute("style") && (bullet.setAttribute("style", \'mso-list: Ignore;\'))');
function visit144_866_1(result) {
  _$jscoverage['/word-filter.js'].branchData['866'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['865'][1].init(250, 35, 'bulletText && bulletText.parentNode');
function visit143_865_1(result) {
  _$jscoverage['/word-filter.js'].branchData['865'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['863'][2].init(37, 18, 'node.nodeType == 3');
function visit142_863_2(result) {
  _$jscoverage['/word-filter.js'].branchData['863'][2].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['863'][1].init(37, 64, 'node.nodeType == 3 && !containsNothingButSpaces(node.parentNode)');
function visit141_863_1(result) {
  _$jscoverage['/word-filter.js'].branchData['863'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['861'][1].init(261, 54, '/MsoListParagraph/.exec(element.getAttribute(\'class\'))');
function visit140_861_1(result) {
  _$jscoverage['/word-filter.js'].branchData['861'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['849'][1].init(307, 39, 'style && addStyle(element, style, true)');
function visit139_849_1(result) {
  _$jscoverage['/word-filter.js'].branchData['849'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['846'][1].init(102, 24, 'typeof style == \'object\'');
function visit138_846_1(result) {
  _$jscoverage['/word-filter.js'].branchData['846'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['844'][1].init(245, 13, 'name in rules');
function visit137_844_1(result) {
  _$jscoverage['/word-filter.js'].branchData['844'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['831'][1].init(663, 9, 'className');
function visit136_831_1(result) {
  _$jscoverage['/word-filter.js'].branchData['831'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['828'][1].init(462, 17, '!rules[tagName]');
function visit135_828_1(result) {
  _$jscoverage['/word-filter.js'].branchData['828'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['825'][1].init(316, 28, 'className.match(/MsoNormal/)');
function visit134_825_1(result) {
  _$jscoverage['/word-filter.js'].branchData['825'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['821'][1].init(60, 14, 'tagName || \'*\'');
function visit133_821_1(result) {
  _$jscoverage['/word-filter.js'].branchData['821'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['815'][1].init(193, 10, 'i < length');
function visit132_815_1(result) {
  _$jscoverage['/word-filter.js'].branchData['815'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['806'][1].init(418, 12, 'styleDefText');
function visit131_806_1(result) {
  _$jscoverage['/word-filter.js'].branchData['806'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['803'][1].init(180, 39, 'styleDefSection && styleDefSection[1]');
function visit130_803_1(result) {
  _$jscoverage['/word-filter.js'].branchData['803'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['799'][1].init(26, 8, 'UA.gecko');
function visit129_799_1(result) {
  _$jscoverage['/word-filter.js'].branchData['799'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['789'][1].init(2164, 25, 'tagName in listDtdParents');
function visit128_789_1(result) {
  _$jscoverage['/word-filter.js'].branchData['789'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['779'][1].init(106, 4, 'href');
function visit127_779_1(result) {
  _$jscoverage['/word-filter.js'].branchData['779'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['777'][1].init(145, 24, 'tagName == \'v:imagedata\'');
function visit126_777_1(result) {
  _$jscoverage['/word-filter.js'].branchData['777'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['773'][1].init(54, 27, 'tagName.indexOf(\'ke\') == -1');
function visit125_773_1(result) {
  _$jscoverage['/word-filter.js'].branchData['773'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['772'][2].init(1410, 26, 'tagName.indexOf(\':\') != -1');
function visit124_772_2(result) {
  _$jscoverage['/word-filter.js'].branchData['772'][2].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['772'][1].init(1410, 82, 'tagName.indexOf(\':\') != -1 && tagName.indexOf(\'ke\') == -1');
function visit123_772_1(result) {
  _$jscoverage['/word-filter.js'].branchData['772'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['766'][1].init(81, 33, 'containsNothingButSpaces(element)');
function visit122_766_1(result) {
  _$jscoverage['/word-filter.js'].branchData['766'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['764'][1].init(1001, 22, 'tagName in dtd.$inline');
function visit121_764_1(result) {
  _$jscoverage['/word-filter.js'].branchData['764'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['759'][1].init(146, 24, 'resolveListItem(element)');
function visit120_759_1(result) {
  _$jscoverage['/word-filter.js'].branchData['759'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['756'][1].init(606, 20, 'tagName.match(/h\\d/)');
function visit119_756_1(result) {
  _$jscoverage['/word-filter.js'].branchData['756'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['748'][1].init(217, 53, 'tagName in blockLike && element.getAttribute("style")');
function visit118_748_1(result) {
  _$jscoverage['/word-filter.js'].branchData['748'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['744'][1].init(36, 22, 'element.nodeName || \'\'');
function visit117_744_1(result) {
  _$jscoverage['/word-filter.js'].branchData['744'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['739'][1].init(142, 59, 'UA.gecko && (applyStyleFilter = filters.applyStyleFilter)');
function visit116_739_1(result) {
  _$jscoverage['/word-filter.js'].branchData['739'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['695'][1].init(166, 9, 'i < count');
function visit115_695_1(result) {
  _$jscoverage['/word-filter.js'].branchData['695'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['668'][1].init(2653, 34, '!element.getAttribute("ke:indent")');
function visit114_668_1(result) {
  _$jscoverage['/word-filter.js'].branchData['668'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['655'][2].init(38, 25, 'listId !== previousListId');
function visit113_655_2(result) {
  _$jscoverage['/word-filter.js'].branchData['655'][2].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['655'][1].init(38, 68, 'listId !== previousListId && (element.setAttribute(\'ke:reset\', 1))');
function visit112_655_1(result) {
  _$jscoverage['/word-filter.js'].branchData['655'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['654'][1].init(249, 11, 'indent == 1');
function visit111_654_1(result) {
  _$jscoverage['/word-filter.js'].branchData['654'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['644'][2].init(34, 101, 'listBaseIndent && (Math.ceil(margin / listBaseIndent) + 1)');
function visit110_644_2(result) {
  _$jscoverage['/word-filter.js'].branchData['644'][2].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['644'][1].init(72, 106, 'listBaseIndent && (Math.ceil(margin / listBaseIndent) + 1) || 1');
function visit109_644_1(result) {
  _$jscoverage['/word-filter.js'].branchData['644'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['643'][1].init(739, 14, 'listBaseIndent');
function visit108_643_1(result) {
  _$jscoverage['/word-filter.js'].branchData['643'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['638'][1].init(71, 31, 'margin > previousListItemMargin');
function visit107_638_1(result) {
  _$jscoverage['/word-filter.js'].branchData['638'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['637'][3].init(405, 31, 'previousListItemMargin !== null');
function visit106_637_3(result) {
  _$jscoverage['/word-filter.js'].branchData['637'][3].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['637'][2].init(405, 103, 'previousListItemMargin !== null && margin > previousListItemMargin');
function visit105_637_2(result) {
  _$jscoverage['/word-filter.js'].branchData['637'][2].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['637'][1].init(386, 122, '!listBaseIndent && previousListItemMargin !== null && margin > previousListItemMargin');
function visit104_637_1(result) {
  _$jscoverage['/word-filter.js'].branchData['637'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['634'][2].init(36, 27, 'values[1] || values[0]');
function visit103_634_2(result) {
  _$jscoverage['/word-filter.js'].branchData['634'][2].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['634'][1].init(193, 42, 'values[3] || values[1] || values[0]');
function visit102_634_1(result) {
  _$jscoverage['/word-filter.js'].branchData['634'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['624'][1].init(70, 29, 'element.getAttribute("style")');
function visit101_624_1(result) {
  _$jscoverage['/word-filter.js'].branchData['624'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['620'][1].init(83, 70, 'listMarker.length && (listMarker = listMarker[0])');
function visit100_620_1(result) {
  _$jscoverage['/word-filter.js'].branchData['620'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['619'][1].init(105, 154, '(listMarker = removeAnyChildWithName(element, \'ke:listbullet\')) && listMarker.length && (listMarker = listMarker[0])');
function visit99_619_1(result) {
  _$jscoverage['/word-filter.js'].branchData['619'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['611'][1].init(48, 91, '(text = onlyChild(element)) && (/^(:?\\s|&nbsp;)+$/).test(text.nodeValue)');
function visit98_611_1(result) {
  _$jscoverage['/word-filter.js'].branchData['611'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['604'][1].init(78, 40, '/mso-list\\s*:\\s*Ignore/i.test(styleText)');
function visit97_604_1(result) {
  _$jscoverage['/word-filter.js'].branchData['604'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['582'][1].init(90, 5, 'style');
function visit96_582_1(result) {
  _$jscoverage['/word-filter.js'].branchData['582'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['579'][1].init(26, 9, 'i < count');
function visit95_579_1(result) {
  _$jscoverage['/word-filter.js'].branchData['579'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['578'][1].init(957, 10, 'mergeStyle');
function visit94_578_1(result) {
  _$jscoverage['/word-filter.js'].branchData['578'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['569'][2].init(22, 24, 'match[1] == mergeStyle');
function visit93_569_2(result) {
  _$jscoverage['/word-filter.js'].branchData['569'][2].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['569'][1].init(22, 39, 'match[1] == mergeStyle || !mergeStyle');
function visit92_569_1(result) {
  _$jscoverage['/word-filter.js'].branchData['569'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['568'][1].init(292, 5, 'match');
function visit91_568_1(result) {
  _$jscoverage['/word-filter.js'].branchData['568'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['562'][2].init(87, 44, 'Number(child.getAttribute("value")) == i + 1');
function visit90_562_2(result) {
  _$jscoverage['/word-filter.js'].branchData['562'][2].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['562'][1].init(56, 75, 'child.getAttribute("value") && Number(child.getAttribute("value")) == i + 1');
function visit89_562_1(result) {
  _$jscoverage['/word-filter.js'].branchData['562'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['559'][1].init(379, 9, 'i < count');
function visit88_559_1(result) {
  _$jscoverage['/word-filter.js'].branchData['559'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['556'][1].init(281, 48, 'styleTypeRegexp.exec(list.getAttribute("style"))');
function visit87_556_1(result) {
  _$jscoverage['/word-filter.js'].branchData['556'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['547'][1].init(25, 21, 'list.childNodes || []');
function visit86_547_1(result) {
  _$jscoverage['/word-filter.js'].branchData['547'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['527'][1].init(2460, 16, 'i < rules.length');
function visit85_527_1(result) {
  _$jscoverage['/word-filter.js'].branchData['527'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['523'][1].init(1902, 41, '!whitelist && rules.push([name, value])');
function visit84_523_1(result) {
  _$jscoverage['/word-filter.js'].branchData['523'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['514'][1].init(764, 27, 'typeof newValue == \'string\'');
function visit83_514_1(result) {
  _$jscoverage['/word-filter.js'].branchData['514'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['509'][1].init(523, 25, 'newValue && newValue.push');
function visit82_509_1(result) {
  _$jscoverage['/word-filter.js'].branchData['509'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['503'][1].init(189, 29, 'typeof newValue == \'function\'');
function visit81_503_1(result) {
  _$jscoverage['/word-filter.js'].branchData['503'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['501'][2].init(125, 17, 'newValue || value');
function visit80_501_2(result) {
  _$jscoverage['/word-filter.js'].branchData['501'][2].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['501'][1].init(99, 45, 'whitelist && (newValue = newValue || value)');
function visit79_501_1(result) {
  _$jscoverage['/word-filter.js'].branchData['501'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['500'][1].init(45, 15, 'newName || name');
function visit78_500_1(result) {
  _$jscoverage['/word-filter.js'].branchData['500'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['499'][1].init(65, 42, '!valuePattern || value.match(valuePattern)');
function visit77_499_1(result) {
  _$jscoverage['/word-filter.js'].branchData['499'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['498'][1].init(294, 110, 'name.match(namePattern) && (!valuePattern || value.match(valuePattern))');
function visit76_498_1(result) {
  _$jscoverage['/word-filter.js'].branchData['498'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['492'][1].init(34, 11, 'styles[i]');
function visit75_492_1(result) {
  _$jscoverage['/word-filter.js'].branchData['492'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['491'][1].init(348, 17, 'i < styles.length');
function visit74_491_1(result) {
  _$jscoverage['/word-filter.js'].branchData['491'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['485'][2].init(78, 21, 'name == \'font-family\'');
function visit73_485_2(result) {
  _$jscoverage['/word-filter.js'].branchData['485'][2].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['485'][1].init(78, 63, 'name == \'font-family\' && (value = value.replace(/["\']/g, \'\'))');
function visit72_485_1(result) {
  _$jscoverage['/word-filter.js'].branchData['485'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['480'][1].init(-1, 15, 'styleText || \'\'');
function visit71_480_1(result) {
  _$jscoverage['/word-filter.js'].branchData['480'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['455'][1].init(7698, 22, 'i < openedLists.length');
function visit70_455_1(result) {
  _$jscoverage['/word-filter.js'].branchData['455'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['450'][1].init(6797, 4, 'list');
function visit69_450_1(result) {
  _$jscoverage['/word-filter.js'].branchData['450'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['448'][2].init(6679, 19, 'child.nodeType == 3');
function visit68_448_2(result) {
  _$jscoverage['/word-filter.js'].branchData['448'][2].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['448'][1].init(6679, 47, 'child.nodeType == 3 && !S.trim(child.nodeValue)');
function visit67_448_1(result) {
  _$jscoverage['/word-filter.js'].branchData['448'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['434'][1].init(242, 38, 'diff-- && (parent = list.parentNode)');
function visit66_434_1(result) {
  _$jscoverage['/word-filter.js'].branchData['434'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['430'][1].init(325, 27, 'listItemIndent < lastIndent');
function visit65_430_1(result) {
  _$jscoverage['/word-filter.js'].branchData['430'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['425'][1].init(30, 27, 'listItemIndent > lastIndent');
function visit64_425_1(result) {
  _$jscoverage['/word-filter.js'].branchData['425'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['420'][1].init(5205, 5, '!list');
function visit63_420_1(result) {
  _$jscoverage['/word-filter.js'].branchData['420'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['400'][2].init(4257, 16, 'listType == \'ol\'');
function visit62_400_2(result) {
  _$jscoverage['/word-filter.js'].branchData['400'][2].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['400'][1].init(4257, 26, 'listType == \'ol\' && bullet');
function visit61_400_1(result) {
  _$jscoverage['/word-filter.js'].branchData['400'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['396'][3].init(4058, 16, 'listType == \'ol\'');
function visit60_396_3(result) {
  _$jscoverage['/word-filter.js'].branchData['396'][3].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['396'][2].init(4039, 58, 'listStyleType != (listType == \'ol\' ? \'decimal\' : \'disc\')');
function visit59_396_2(result) {
  _$jscoverage['/word-filter.js'].branchData['396'][2].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['396'][1].init(4022, 75, 'listStyleType && listStyleType != (listType == \'ol\' ? \'decimal\' : \'disc\')');
function visit58_396_1(result) {
  _$jscoverage['/word-filter.js'].branchData['396'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['395'][2].init(3956, 16, 'listType == \'ol\'');
function visit57_395_2(result) {
  _$jscoverage['/word-filter.js'].branchData['395'][2].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['395'][1].init(3937, 58, 'listStyleType || (listType == \'ol\' ? \'decimal\' : \'disc\')');
function visit56_395_1(result) {
  _$jscoverage['/word-filter.js'].branchData['395'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['391'][1].init(2278, 53, '!listType && (listType = bullet[2] ? \'ol\' : \'ul\')');
function visit55_391_1(result) {
  _$jscoverage['/word-filter.js'].branchData['391'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['372'][2].init(195, 17, 'num < itemNumeric');
function visit54_372_2(result) {
  _$jscoverage['/word-filter.js'].branchData['372'][2].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['372'][1].init(179, 33, '!itemNumeric || num < itemNumeric');
function visit53_372_1(result) {
  _$jscoverage['/word-filter.js'].branchData['372'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['370'][2].init(231, 12, 'type == \'ol\'');
function visit52_370_2(result) {
  _$jscoverage['/word-filter.js'].branchData['370'][2].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['370'][1].init(231, 45, 'type == \'ol\' && (/alpha|roman/).test(style)');
function visit51_370_1(result) {
  _$jscoverage['/word-filter.js'].branchData['370'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['367'][1].init(44, 53, 'listMarkerPatterns[type][style].test(bullet[1])');
function visit50_367_1(result) {
  _$jscoverage['/word-filter.js'].branchData['367'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['357'][1].init(219, 131, 'previousListType && listMarkerPatterns[previousListType][previousListStyleType].test(bullet[1])');
function visit49_357_1(result) {
  _$jscoverage['/word-filter.js'].branchData['357'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['351'][1].init(37, 44, 'listItem.getAttribute(\'ke:listtype\') || \'ol\'');
function visit48_351_1(result) {
  _$jscoverage['/word-filter.js'].branchData['351'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['350'][1].init(1255, 7, '!bullet');
function visit47_350_1(result) {
  _$jscoverage['/word-filter.js'].branchData['350'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['346'][1].init(1053, 28, 'listItemIndent != lastIndent');
function visit46_346_1(result) {
  _$jscoverage['/word-filter.js'].branchData['346'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['338'][1].init(561, 80, 'listItem.getAttribute(\'ke:reset\') && (list = lastIndent = lastListItem = null)');
function visit45_338_1(result) {
  _$jscoverage['/word-filter.js'].branchData['338'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['331'][1].init(336, 35, 'listItem.getAttribute(\'ke:ignored\')');
function visit44_331_1(result) {
  _$jscoverage['/word-filter.js'].branchData['331'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['328'][1].init(187, 52, 'bullet && bullet.match(/^(?:[(]?)([^\\s]+?)([.)]?)$/)');
function visit43_328_1(result) {
  _$jscoverage['/word-filter.js'].branchData['328'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['323'][1].init(64, 25, '\'ke:li\' == child.nodeName');
function visit42_323_1(result) {
  _$jscoverage['/word-filter.js'].branchData['323'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['320'][1].init(745, 19, 'i < children.length');
function visit41_320_1(result) {
  _$jscoverage['/word-filter.js'].branchData['320'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['303'][1].init(29, 24, 'element.childNodes || []');
function visit40_303_1(result) {
  _$jscoverage['/word-filter.js'].branchData['303'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['286'][1].init(331, 7, 'j < num');
function visit39_286_1(result) {
  _$jscoverage['/word-filter.js'].branchData['286'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['281'][1].init(2272, 27, 'child.nodeName in dtd.$list');
function visit38_281_1(result) {
  _$jscoverage['/word-filter.js'].branchData['281'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['269'][1].init(170, 25, 'listId !== previousListId');
function visit37_269_1(result) {
  _$jscoverage['/word-filter.js'].branchData['269'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['266'][1].init(389, 10, 'level == 1');
function visit36_266_1(result) {
  _$jscoverage['/word-filter.js'].branchData['266'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['263'][1].init(130, 63, 'margin && (previousListItemMargin = convertToPx(margin[0]))');
function visit35_263_1(result) {
  _$jscoverage['/word-filter.js'].branchData['263'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['255'][1].init(57, 90, '!i && (element.setAttribute("value", element.getAttribute("start")))');
function visit34_255_1(result) {
  _$jscoverage['/word-filter.js'].branchData['255'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['254'][1].init(753, 148, 'element.getAttribute("start") && !i && (element.setAttribute("value", element.getAttribute("start")))');
function visit33_254_1(result) {
  _$jscoverage['/word-filter.js'].branchData['254'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['246'][1].init(162, 26, '!--listItemChildren.length');
function visit32_246_1(result) {
  _$jscoverage['/word-filter.js'].branchData['246'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['243'][1].init(263, 26, 'last.nodeName in dtd.$list');
function visit31_243_1(result) {
  _$jscoverage['/word-filter.js'].branchData['243'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['238'][1].init(45, 22, 'child.childNodes || []');
function visit30_238_1(result) {
  _$jscoverage['/word-filter.js'].branchData['238'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['237'][1].init(64, 31, 'child.nodeName in dtd.$listItem');
function visit29_237_1(result) {
  _$jscoverage['/word-filter.js'].branchData['237'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['234'][1].init(609, 19, 'i < children.length');
function visit28_234_1(result) {
  _$jscoverage['/word-filter.js'].branchData['234'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['231'][1].init(528, 24, 'element.childNodes || []');
function visit27_231_1(result) {
  _$jscoverage['/word-filter.js'].branchData['231'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['216'][1].init(22, 24, 'typeof level == \'number\'');
function visit26_216_1(result) {
  _$jscoverage['/word-filter.js'].branchData['216'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['202'][2].init(20, 22, 'tag.indexOf(\'$\') == -1');
function visit25_202_2(result) {
  _$jscoverage['/word-filter.js'].branchData['202'][2].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['202'][1].init(20, 47, 'tag.indexOf(\'$\') == -1 && dtd[tag][tagName]');
function visit24_202_1(result) {
  _$jscoverage['/word-filter.js'].branchData['202'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['172'][1].init(49, 23, 'typeof name == \'object\'');
function visit23_172_1(result) {
  _$jscoverage['/word-filter.js'].branchData['172'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['168'][1].init(96, 24, 'typeof value == \'string\'');
function visit22_168_1(result) {
  _$jscoverage['/word-filter.js'].branchData['168'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['155'][1].init(77, 5, 'child');
function visit21_155_1(result) {
  _$jscoverage['/word-filter.js'].branchData['155'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['153'][1].init(130, 14, 'child.nodeName');
function visit20_153_1(result) {
  _$jscoverage['/word-filter.js'].branchData['153'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['151'][1].init(54, 16, 'evaluator(child)');
function visit19_151_1(result) {
  _$jscoverage['/word-filter.js'].branchData['151'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['149'][1].init(107, 19, 'i < children.length');
function visit18_149_1(result) {
  _$jscoverage['/word-filter.js'].branchData['149'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['147'][1].init(50, 21, 'elem.childNodes || []');
function visit17_147_1(result) {
  _$jscoverage['/word-filter.js'].branchData['147'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['138'][2].init(69, 54, 'parent.nodeName && parent.nodeName.match(tagNameRegex)');
function visit16_138_2(result) {
  _$jscoverage['/word-filter.js'].branchData['138'][2].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['138'][1].init(56, 69, 'parent && !(parent.nodeName && parent.nodeName.match(tagNameRegex))');
function visit15_138_1(result) {
  _$jscoverage['/word-filter.js'].branchData['138'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['127'][1].init(132, 25, 'child.nodeName == tagName');
function visit14_127_1(result) {
  _$jscoverage['/word-filter.js'].branchData['127'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['124'][1].init(54, 15, '!child.nodeName');
function visit13_124_1(result) {
  _$jscoverage['/word-filter.js'].branchData['124'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['122'][1].init(118, 19, 'i < children.length');
function visit12_122_1(result) {
  _$jscoverage['/word-filter.js'].branchData['122'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['118'][1].init(25, 21, 'elem.childNodes || []');
function visit11_118_1(result) {
  _$jscoverage['/word-filter.js'].branchData['118'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['114'][1].init(163, 18, 'firstChild || null');
function visit10_114_1(result) {
  _$jscoverage['/word-filter.js'].branchData['114'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['113'][2].init(106, 10, 'count == 1');
function visit9_113_2(result) {
  _$jscoverage['/word-filter.js'].branchData['113'][2].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['113'][1].init(106, 28, '(count == 1) && childNodes[0]');
function visit8_113_1(result) {
  _$jscoverage['/word-filter.js'].branchData['113'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['111'][1].init(27, 21, 'elem.childNodes || []');
function visit7_111_1(result) {
  _$jscoverage['/word-filter.js'].branchData['111'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['97'][1].init(306, 23, '!(/%$/).test(cssLength)');
function visit6_97_1(result) {
  _$jscoverage['/word-filter.js'].branchData['97'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['89'][1].init(18, 11, '!calculator');
function visit5_89_1(result) {
  _$jscoverage['/word-filter.js'].branchData['89'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['74'][1].init(14, 3, 'str');
function visit4_74_1(result) {
  _$jscoverage['/word-filter.js'].branchData['74'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['66'][1].init(107, 14, 'str.length > 0');
function visit3_66_1(result) {
  _$jscoverage['/word-filter.js'].branchData['66'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['55'][1].init(55, 24, 'str.substr(0, k) == j[1]');
function visit2_55_1(result) {
  _$jscoverage['/word-filter.js'].branchData['55'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['54'][1].init(104, 5, 'i < l');
function visit1_54_1(result) {
  _$jscoverage['/word-filter.js'].branchData['54'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].lineData[6]++;
KISSY.add("editor/plugin/word-filter", function(S, HtmlParser) {
  _$jscoverage['/word-filter.js'].functionData[0]++;
  _$jscoverage['/word-filter.js'].lineData[7]++;
  var $ = S.all, UA = S.UA, dtd = HtmlParser.DTD, wordFilter = new HtmlParser.Filter(), cssLengthRelativeUnit = /^([.\d]*)+(em|ex|px|gd|rem|vw|vh|vm|ch|mm|cm|in|pt|pc|deg|rad|ms|s|hz|khz){1}?/i, emptyMarginRegex = /^(?:\b0[^\s]*\s*){1,4}$/, romanLiteralPattern = '^m{0,4}(cm|cd|d?c{0,3})(xc|xl|l?x{0,3})(ix|iv|v?i{0,3})$', lowerRomanLiteralRegex = new RegExp(romanLiteralPattern), upperRomanLiteralRegex = new RegExp(romanLiteralPattern.toUpperCase()), orderedPatterns = {
  'decimal': /\d+/, 
  'lower-roman': lowerRomanLiteralRegex, 
  'upper-roman': upperRomanLiteralRegex, 
  'lower-alpha': /^[a-z]+$/, 
  'upper-alpha': /^[A-Z]+$/}, unorderedPatterns = {
  'disc': /[l\u00B7\u2002]/, 
  'circle': /[\u006F\u00D8]/, 
  'square': /[\u006E\u25C6]/}, listMarkerPatterns = {
  'ol': orderedPatterns, 
  'ul': unorderedPatterns}, romans = [[1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'], [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'], [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']], alphabets = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  _$jscoverage['/word-filter.js'].lineData[51]++;
  function fromRoman(str) {
    _$jscoverage['/word-filter.js'].functionData[1]++;
    _$jscoverage['/word-filter.js'].lineData[52]++;
    str = str.toUpperCase();
    _$jscoverage['/word-filter.js'].lineData[53]++;
    var l = romans.length, retVal = 0;
    _$jscoverage['/word-filter.js'].lineData[54]++;
    for (var i = 0; visit1_54_1(i < l); ++i) {
      _$jscoverage['/word-filter.js'].lineData[55]++;
      for (var j = romans[i], k = j[1].length; visit2_55_1(str.substr(0, k) == j[1]); str = str.substr(k)) {
        _$jscoverage['/word-filter.js'].lineData[56]++;
        retVal += j[0];
      }
    }
    _$jscoverage['/word-filter.js'].lineData[59]++;
    return retVal;
  }
  _$jscoverage['/word-filter.js'].lineData[63]++;
  function fromAlphabet(str) {
    _$jscoverage['/word-filter.js'].functionData[2]++;
    _$jscoverage['/word-filter.js'].lineData[64]++;
    str = str.toUpperCase();
    _$jscoverage['/word-filter.js'].lineData[65]++;
    var l = alphabets.length, retVal = 1;
    _$jscoverage['/word-filter.js'].lineData[66]++;
    for (var x = 1; visit3_66_1(str.length > 0); x *= l) {
      _$jscoverage['/word-filter.js'].lineData[67]++;
      retVal += alphabets.indexOf(str.charAt(str.length - 1)) * x;
      _$jscoverage['/word-filter.js'].lineData[68]++;
      str = str.substr(0, str.length - 1);
    }
    _$jscoverage['/word-filter.js'].lineData[70]++;
    return retVal;
  }
  _$jscoverage['/word-filter.js'].lineData[73]++;
  function setStyle(element, str) {
    _$jscoverage['/word-filter.js'].functionData[3]++;
    _$jscoverage['/word-filter.js'].lineData[74]++;
    if (visit4_74_1(str)) {
      _$jscoverage['/word-filter.js'].lineData[75]++;
      element.setAttribute("style", str);
    } else {
      _$jscoverage['/word-filter.js'].lineData[77]++;
      element.removeAttribute("style");
    }
  }
  _$jscoverage['/word-filter.js'].lineData[85]++;
  var convertToPx = (function() {
  _$jscoverage['/word-filter.js'].functionData[4]++;
  _$jscoverage['/word-filter.js'].lineData[86]++;
  var calculator;
  _$jscoverage['/word-filter.js'].lineData[88]++;
  return function(cssLength) {
  _$jscoverage['/word-filter.js'].functionData[5]++;
  _$jscoverage['/word-filter.js'].lineData[89]++;
  if (visit5_89_1(!calculator)) {
    _$jscoverage['/word-filter.js'].lineData[90]++;
    calculator = $('<div style="position:absolute;left:-9999px;' + 'top:-9999px;margin:0px;padding:0px;border:0px;"' + '></div>')['prependTo']("body");
  }
  _$jscoverage['/word-filter.js'].lineData[97]++;
  if (visit6_97_1(!(/%$/).test(cssLength))) {
    _$jscoverage['/word-filter.js'].lineData[98]++;
    calculator.css('width', cssLength);
    _$jscoverage['/word-filter.js'].lineData[99]++;
    return calculator[0].clientWidth;
  }
  _$jscoverage['/word-filter.js'].lineData[102]++;
  return cssLength;
};
})();
  _$jscoverage['/word-filter.js'].lineData[106]++;
  var listBaseIndent = 0, previousListItemMargin = null, previousListId;
  _$jscoverage['/word-filter.js'].lineData[110]++;
  function onlyChild(elem) {
    _$jscoverage['/word-filter.js'].functionData[6]++;
    _$jscoverage['/word-filter.js'].lineData[111]++;
    var childNodes = visit7_111_1(elem.childNodes || []), count = childNodes.length, firstChild = visit8_113_1((visit9_113_2(count == 1)) && childNodes[0]);
    _$jscoverage['/word-filter.js'].lineData[114]++;
    return visit10_114_1(firstChild || null);
  }
  _$jscoverage['/word-filter.js'].lineData[117]++;
  function removeAnyChildWithName(elem, tagName) {
    _$jscoverage['/word-filter.js'].functionData[7]++;
    _$jscoverage['/word-filter.js'].lineData[118]++;
    var children = visit11_118_1(elem.childNodes || []), ret = [], child;
    _$jscoverage['/word-filter.js'].lineData[122]++;
    for (var i = 0; visit12_122_1(i < children.length); i++) {
      _$jscoverage['/word-filter.js'].lineData[123]++;
      child = children[i];
      _$jscoverage['/word-filter.js'].lineData[124]++;
      if (visit13_124_1(!child.nodeName)) {
        _$jscoverage['/word-filter.js'].lineData[125]++;
        continue;
      }
      _$jscoverage['/word-filter.js'].lineData[127]++;
      if (visit14_127_1(child.nodeName == tagName)) {
        _$jscoverage['/word-filter.js'].lineData[128]++;
        ret.push(child);
        _$jscoverage['/word-filter.js'].lineData[129]++;
        children.splice(i--, 1);
      }
      _$jscoverage['/word-filter.js'].lineData[131]++;
      ret = ret.concat(removeAnyChildWithName(child, tagName));
    }
    _$jscoverage['/word-filter.js'].lineData[133]++;
    return ret;
  }
  _$jscoverage['/word-filter.js'].lineData[136]++;
  function getAncestor(elem, tagNameRegex) {
    _$jscoverage['/word-filter.js'].functionData[8]++;
    _$jscoverage['/word-filter.js'].lineData[137]++;
    var parent = elem.parentNode;
    _$jscoverage['/word-filter.js'].lineData[138]++;
    while (visit15_138_1(parent && !(visit16_138_2(parent.nodeName && parent.nodeName.match(tagNameRegex))))) {
      _$jscoverage['/word-filter.js'].lineData[139]++;
      parent = parent.parentNode;
    }
    _$jscoverage['/word-filter.js'].lineData[141]++;
    return parent;
  }
  _$jscoverage['/word-filter.js'].lineData[144]++;
  function firstChild(elem, evaluator) {
    _$jscoverage['/word-filter.js'].functionData[9]++;
    _$jscoverage['/word-filter.js'].lineData[145]++;
    var child, i, children = visit17_147_1(elem.childNodes || []);
    _$jscoverage['/word-filter.js'].lineData[149]++;
    for (i = 0; visit18_149_1(i < children.length); i++) {
      _$jscoverage['/word-filter.js'].lineData[150]++;
      child = children[i];
      _$jscoverage['/word-filter.js'].lineData[151]++;
      if (visit19_151_1(evaluator(child))) {
        _$jscoverage['/word-filter.js'].lineData[152]++;
        return child;
      } else {
        _$jscoverage['/word-filter.js'].lineData[153]++;
        if (visit20_153_1(child.nodeName)) {
          _$jscoverage['/word-filter.js'].lineData[154]++;
          child = firstChild(child, evaluator);
          _$jscoverage['/word-filter.js'].lineData[155]++;
          if (visit21_155_1(child)) {
            _$jscoverage['/word-filter.js'].lineData[156]++;
            return child;
          }
        }
      }
    }
    _$jscoverage['/word-filter.js'].lineData[161]++;
    return null;
  }
  _$jscoverage['/word-filter.js'].lineData[165]++;
  function addStyle(elem, name, value, isPrepend) {
    _$jscoverage['/word-filter.js'].functionData[10]++;
    _$jscoverage['/word-filter.js'].lineData[166]++;
    var styleText, addingStyleText = '', style;
    _$jscoverage['/word-filter.js'].lineData[168]++;
    if (visit22_168_1(typeof value == 'string')) {
      _$jscoverage['/word-filter.js'].lineData[169]++;
      addingStyleText += name + ':' + value + ';';
    } else {
      _$jscoverage['/word-filter.js'].lineData[172]++;
      if (visit23_172_1(typeof name == 'object')) {
        _$jscoverage['/word-filter.js'].lineData[173]++;
        for (style in name) {
          _$jscoverage['/word-filter.js'].lineData[175]++;
          addingStyleText += style + ':' + name[style] + ';';
        }
      } else {
        _$jscoverage['/word-filter.js'].lineData[181]++;
        addingStyleText += name;
      }
      _$jscoverage['/word-filter.js'].lineData[183]++;
      isPrepend = value;
    }
    _$jscoverage['/word-filter.js'].lineData[187]++;
    styleText = elem.getAttribute("style");
    _$jscoverage['/word-filter.js'].lineData[189]++;
    styleText = (isPrepend ? [addingStyleText, styleText] : [styleText, addingStyleText]).join(';');
    _$jscoverage['/word-filter.js'].lineData[193]++;
    setStyle(elem, styleText.replace(/^;|;(?=;)/, ''));
  }
  _$jscoverage['/word-filter.js'].lineData[197]++;
  function parentOf(tagName) {
    _$jscoverage['/word-filter.js'].functionData[11]++;
    _$jscoverage['/word-filter.js'].lineData[198]++;
    var result = {}, tag;
    _$jscoverage['/word-filter.js'].lineData[200]++;
    for (tag in dtd) {
      _$jscoverage['/word-filter.js'].lineData[202]++;
      if (visit24_202_1(visit25_202_2(tag.indexOf('$') == -1) && dtd[tag][tagName])) {
        _$jscoverage['/word-filter.js'].lineData[203]++;
        result[tag] = 1;
      }
    }
    _$jscoverage['/word-filter.js'].lineData[207]++;
    return result;
  }
  _$jscoverage['/word-filter.js'].lineData[210]++;
  var filters = {
  flattenList: function(element, level) {
  _$jscoverage['/word-filter.js'].functionData[12]++;
  _$jscoverage['/word-filter.js'].lineData[216]++;
  level = visit26_216_1(typeof level == 'number') ? level : 1;
  _$jscoverage['/word-filter.js'].lineData[218]++;
  var listStyleType;
  _$jscoverage['/word-filter.js'].lineData[221]++;
  switch (element.getAttribute("type")) {
    case 'a':
      _$jscoverage['/word-filter.js'].lineData[223]++;
      listStyleType = 'lower-alpha';
      _$jscoverage['/word-filter.js'].lineData[224]++;
      break;
    case '1':
      _$jscoverage['/word-filter.js'].lineData[226]++;
      listStyleType = 'decimal';
      _$jscoverage['/word-filter.js'].lineData[227]++;
      break;
  }
  _$jscoverage['/word-filter.js'].lineData[231]++;
  var children = visit27_231_1(element.childNodes || []), child;
  _$jscoverage['/word-filter.js'].lineData[234]++;
  for (var i = 0; visit28_234_1(i < children.length); i++) {
    _$jscoverage['/word-filter.js'].lineData[235]++;
    child = children[i];
    _$jscoverage['/word-filter.js'].lineData[237]++;
    if (visit29_237_1(child.nodeName in dtd.$listItem)) {
      _$jscoverage['/word-filter.js'].lineData[238]++;
      var listItemChildren = visit30_238_1(child.childNodes || []), count = listItemChildren.length, last = listItemChildren[count - 1];
      _$jscoverage['/word-filter.js'].lineData[243]++;
      if (visit31_243_1(last.nodeName in dtd.$list)) {
        _$jscoverage['/word-filter.js'].lineData[244]++;
        element.insertAfter(child);
        _$jscoverage['/word-filter.js'].lineData[246]++;
        if (visit32_246_1(!--listItemChildren.length)) {
          _$jscoverage['/word-filter.js'].lineData[247]++;
          element.removeChild(children[i--]);
        }
      }
      _$jscoverage['/word-filter.js'].lineData[251]++;
      child.setTagName('ke:li');
      _$jscoverage['/word-filter.js'].lineData[254]++;
      visit33_254_1(element.getAttribute("start") && visit34_255_1(!i && (element.setAttribute("value", element.getAttribute("start")))));
      _$jscoverage['/word-filter.js'].lineData[274]++;
      filters.stylesFilter([['tab-stops', null, function(val) {
  _$jscoverage['/word-filter.js'].functionData[13]++;
  _$jscoverage['/word-filter.js'].lineData[262]++;
  var margin = val.split(' ')[1].match(cssLengthRelativeUnit);
  _$jscoverage['/word-filter.js'].lineData[263]++;
  visit35_263_1(margin && (previousListItemMargin = convertToPx(margin[0])));
}], (visit36_266_1(level == 1) ? ['mso-list', null, function(val) {
  _$jscoverage['/word-filter.js'].functionData[14]++;
  _$jscoverage['/word-filter.js'].lineData[267]++;
  val = val.split(' ');
  _$jscoverage['/word-filter.js'].lineData[268]++;
  var listId = Number(val[0].match(/\d+/));
  _$jscoverage['/word-filter.js'].lineData[269]++;
  if (visit37_269_1(listId !== previousListId)) {
    _$jscoverage['/word-filter.js'].lineData[270]++;
    child.setAttribute('ke:reset', 1);
  }
  _$jscoverage['/word-filter.js'].lineData[272]++;
  previousListId = listId;
}] : null)])(child.getAttribute("style"));
      _$jscoverage['/word-filter.js'].lineData[276]++;
      child.setAttribute('ke:indent', level);
      _$jscoverage['/word-filter.js'].lineData[277]++;
      child.setAttribute('ke:listtype', element.nodeName);
      _$jscoverage['/word-filter.js'].lineData[278]++;
      child.setAttribute('ke:list-style-type', listStyleType);
    } else {
      _$jscoverage['/word-filter.js'].lineData[281]++;
      if (visit38_281_1(child.nodeName in dtd.$list)) {
        _$jscoverage['/word-filter.js'].lineData[283]++;
        arguments.callee.apply(this, [child, level + 1]);
        _$jscoverage['/word-filter.js'].lineData[284]++;
        children = children.slice(0, i).concat(child.childNodes).concat(children.slice(i + 1));
        _$jscoverage['/word-filter.js'].lineData[285]++;
        element.empty();
        _$jscoverage['/word-filter.js'].lineData[286]++;
        for (var j = 0, num = children.length; visit39_286_1(j < num); j++) {
          _$jscoverage['/word-filter.js'].lineData[287]++;
          element.appendChild(children[j]);
        }
      }
    }
  }
  _$jscoverage['/word-filter.js'].lineData[292]++;
  element.nodeName = element.tagName = null;
  _$jscoverage['/word-filter.js'].lineData[295]++;
  element.setAttribute('ke:list', 1);
}, 
  assembleList: function(element) {
  _$jscoverage['/word-filter.js'].functionData[15]++;
  _$jscoverage['/word-filter.js'].lineData[303]++;
  var children = visit40_303_1(element.childNodes || []), child, listItem, listItemIndent, lastIndent, lastListItem, list, openedLists = [], previousListStyleType, previousListType;
  _$jscoverage['/word-filter.js'].lineData[315]++;
  var bullet, listType, listStyleType, itemNumeric;
  _$jscoverage['/word-filter.js'].lineData[320]++;
  for (var i = 0; visit41_320_1(i < children.length); i++) {
    _$jscoverage['/word-filter.js'].lineData[321]++;
    child = children[i];
    _$jscoverage['/word-filter.js'].lineData[323]++;
    if (visit42_323_1('ke:li' == child.nodeName)) {
      _$jscoverage['/word-filter.js'].lineData[324]++;
      child.setTagName('li');
      _$jscoverage['/word-filter.js'].lineData[325]++;
      listItem = child;
      _$jscoverage['/word-filter.js'].lineData[327]++;
      bullet = listItem.getAttribute('ke:listsymbol');
      _$jscoverage['/word-filter.js'].lineData[328]++;
      bullet = visit43_328_1(bullet && bullet.match(/^(?:[(]?)([^\s]+?)([.)]?)$/));
      _$jscoverage['/word-filter.js'].lineData[329]++;
      listType = listStyleType = itemNumeric = null;
      _$jscoverage['/word-filter.js'].lineData[331]++;
      if (visit44_331_1(listItem.getAttribute('ke:ignored'))) {
        _$jscoverage['/word-filter.js'].lineData[332]++;
        children.splice(i--, 1);
        _$jscoverage['/word-filter.js'].lineData[333]++;
        continue;
      }
      _$jscoverage['/word-filter.js'].lineData[338]++;
      visit45_338_1(listItem.getAttribute('ke:reset') && (list = lastIndent = lastListItem = null));
      _$jscoverage['/word-filter.js'].lineData[343]++;
      listItemIndent = Number(listItem.getAttribute('ke:indent'));
      _$jscoverage['/word-filter.js'].lineData[346]++;
      if (visit46_346_1(listItemIndent != lastIndent)) {
        _$jscoverage['/word-filter.js'].lineData[347]++;
        previousListType = previousListStyleType = null;
      }
      _$jscoverage['/word-filter.js'].lineData[350]++;
      if (visit47_350_1(!bullet)) {
        _$jscoverage['/word-filter.js'].lineData[351]++;
        listType = visit48_351_1(listItem.getAttribute('ke:listtype') || 'ol');
        _$jscoverage['/word-filter.js'].lineData[352]++;
        listStyleType = listItem.getAttribute('ke:list-style-type');
      } else {
        _$jscoverage['/word-filter.js'].lineData[357]++;
        if (visit49_357_1(previousListType && listMarkerPatterns[previousListType][previousListStyleType].test(bullet[1]))) {
          _$jscoverage['/word-filter.js'].lineData[359]++;
          listType = previousListType;
          _$jscoverage['/word-filter.js'].lineData[360]++;
          listStyleType = previousListStyleType;
        } else {
          _$jscoverage['/word-filter.js'].lineData[363]++;
          for (var type in listMarkerPatterns) {
            _$jscoverage['/word-filter.js'].lineData[365]++;
            for (var style in listMarkerPatterns[type]) {
              _$jscoverage['/word-filter.js'].lineData[367]++;
              if (visit50_367_1(listMarkerPatterns[type][style].test(bullet[1]))) {
                _$jscoverage['/word-filter.js'].lineData[370]++;
                if (visit51_370_1(visit52_370_2(type == 'ol') && (/alpha|roman/).test(style))) {
                  _$jscoverage['/word-filter.js'].lineData[371]++;
                  var num = /roman/.test(style) ? fromRoman(bullet[1]) : fromAlphabet(bullet[1]);
                  _$jscoverage['/word-filter.js'].lineData[372]++;
                  if (visit53_372_1(!itemNumeric || visit54_372_2(num < itemNumeric))) {
                    _$jscoverage['/word-filter.js'].lineData[373]++;
                    itemNumeric = num;
                    _$jscoverage['/word-filter.js'].lineData[374]++;
                    listType = type;
                    _$jscoverage['/word-filter.js'].lineData[375]++;
                    listStyleType = style;
                  }
                } else {
                  _$jscoverage['/word-filter.js'].lineData[379]++;
                  listType = type;
                  _$jscoverage['/word-filter.js'].lineData[380]++;
                  listStyleType = style;
                  _$jscoverage['/word-filter.js'].lineData[381]++;
                  break;
                }
              }
            }
          }
        }
        _$jscoverage['/word-filter.js'].lineData[391]++;
        visit55_391_1(!listType && (listType = bullet[2] ? 'ol' : 'ul'));
      }
      _$jscoverage['/word-filter.js'].lineData[394]++;
      previousListType = listType;
      _$jscoverage['/word-filter.js'].lineData[395]++;
      previousListStyleType = visit56_395_1(listStyleType || (visit57_395_2(listType == 'ol') ? 'decimal' : 'disc'));
      _$jscoverage['/word-filter.js'].lineData[396]++;
      if (visit58_396_1(listStyleType && visit59_396_2(listStyleType != (visit60_396_3(listType == 'ol') ? 'decimal' : 'disc')))) {
        _$jscoverage['/word-filter.js'].lineData[397]++;
        addStyle(listItem, 'list-style-type', listStyleType);
      }
      _$jscoverage['/word-filter.js'].lineData[400]++;
      if (visit61_400_1(visit62_400_2(listType == 'ol') && bullet)) {
        _$jscoverage['/word-filter.js'].lineData[401]++;
        switch (listStyleType) {
          case 'decimal':
            _$jscoverage['/word-filter.js'].lineData[403]++;
            itemNumeric = Number(bullet[1]);
            _$jscoverage['/word-filter.js'].lineData[404]++;
            break;
          case 'lower-roman':
          case 'upper-roman':
            _$jscoverage['/word-filter.js'].lineData[407]++;
            itemNumeric = fromRoman(bullet[1]);
            _$jscoverage['/word-filter.js'].lineData[408]++;
            break;
          case 'lower-alpha':
          case 'upper-alpha':
            _$jscoverage['/word-filter.js'].lineData[411]++;
            itemNumeric = fromAlphabet(bullet[1]);
            _$jscoverage['/word-filter.js'].lineData[412]++;
            break;
        }
        _$jscoverage['/word-filter.js'].lineData[416]++;
        listItem.setAttribute("value", itemNumeric);
      }
      _$jscoverage['/word-filter.js'].lineData[420]++;
      if (visit63_420_1(!list)) {
        _$jscoverage['/word-filter.js'].lineData[421]++;
        openedLists.push(list = new HtmlParser.Tag(listType));
        _$jscoverage['/word-filter.js'].lineData[422]++;
        list.appendChild(listItem);
        _$jscoverage['/word-filter.js'].lineData[423]++;
        element.replaceChild(list, children[i]);
      } else {
        _$jscoverage['/word-filter.js'].lineData[425]++;
        if (visit64_425_1(listItemIndent > lastIndent)) {
          _$jscoverage['/word-filter.js'].lineData[426]++;
          openedLists.push(list = new HtmlParser.Tag(listType));
          _$jscoverage['/word-filter.js'].lineData[427]++;
          list.appendChild(listItem);
          _$jscoverage['/word-filter.js'].lineData[428]++;
          lastListItem.appendChild(list);
        } else {
          _$jscoverage['/word-filter.js'].lineData[430]++;
          if (visit65_430_1(listItemIndent < lastIndent)) {
            _$jscoverage['/word-filter.js'].lineData[432]++;
            var diff = lastIndent - listItemIndent, parent;
            _$jscoverage['/word-filter.js'].lineData[434]++;
            while (visit66_434_1(diff-- && (parent = list.parentNode))) {
              _$jscoverage['/word-filter.js'].lineData[435]++;
              list = parent.parentNode;
            }
            _$jscoverage['/word-filter.js'].lineData[437]++;
            list.appendChild(listItem);
          } else {
            _$jscoverage['/word-filter.js'].lineData[440]++;
            list.appendChild(listItem);
          }
        }
        _$jscoverage['/word-filter.js'].lineData[442]++;
        children.splice(i--, 1);
      }
      _$jscoverage['/word-filter.js'].lineData[445]++;
      lastListItem = listItem;
      _$jscoverage['/word-filter.js'].lineData[446]++;
      lastIndent = listItemIndent;
    } else {
      _$jscoverage['/word-filter.js'].lineData[448]++;
      if (visit67_448_1(visit68_448_2(child.nodeType == 3) && !S.trim(child.nodeValue))) {
      } else {
        _$jscoverage['/word-filter.js'].lineData[450]++;
        if (visit69_450_1(list)) {
          _$jscoverage['/word-filter.js'].lineData[451]++;
          list = lastIndent = lastListItem = null;
        }
      }
    }
  }
  _$jscoverage['/word-filter.js'].lineData[455]++;
  for (i = 0; visit70_455_1(i < openedLists.length); i++) {
    _$jscoverage['/word-filter.js'].lineData[456]++;
    postProcessList(openedLists[i]);
  }
}, 
  falsyFilter: function() {
  _$jscoverage['/word-filter.js'].functionData[16]++;
  _$jscoverage['/word-filter.js'].lineData[464]++;
  return false;
}, 
  stylesFilter: function(styles, whitelist) {
  _$jscoverage['/word-filter.js'].functionData[17]++;
  _$jscoverage['/word-filter.js'].lineData[475]++;
  return function(styleText, element) {
  _$jscoverage['/word-filter.js'].functionData[18]++;
  _$jscoverage['/word-filter.js'].lineData[476]++;
  var rules = [];
  _$jscoverage['/word-filter.js'].lineData[480]++;
  (visit71_480_1(styleText || '')).replace(/&quot;/g, '"').replace(/\s*([^ :;]+)\s*:\s*([^;]+)\s*(?=;|$)/g, function(match, name, value) {
  _$jscoverage['/word-filter.js'].functionData[19]++;
  _$jscoverage['/word-filter.js'].lineData[484]++;
  name = name.toLowerCase();
  _$jscoverage['/word-filter.js'].lineData[485]++;
  visit72_485_1(visit73_485_2(name == 'font-family') && (value = value.replace(/["']/g, '')));
  _$jscoverage['/word-filter.js'].lineData[487]++;
  var namePattern, valuePattern, newValue, newName;
  _$jscoverage['/word-filter.js'].lineData[491]++;
  for (var i = 0; visit74_491_1(i < styles.length); i++) {
    _$jscoverage['/word-filter.js'].lineData[492]++;
    if (visit75_492_1(styles[i])) {
      _$jscoverage['/word-filter.js'].lineData[493]++;
      namePattern = styles[i][0];
      _$jscoverage['/word-filter.js'].lineData[494]++;
      valuePattern = styles[i][1];
      _$jscoverage['/word-filter.js'].lineData[495]++;
      newValue = styles[i][2];
      _$jscoverage['/word-filter.js'].lineData[496]++;
      newName = styles[i][3];
      _$jscoverage['/word-filter.js'].lineData[498]++;
      if (visit76_498_1(name.match(namePattern) && (visit77_499_1(!valuePattern || value.match(valuePattern))))) {
        _$jscoverage['/word-filter.js'].lineData[500]++;
        name = visit78_500_1(newName || name);
        _$jscoverage['/word-filter.js'].lineData[501]++;
        visit79_501_1(whitelist && (newValue = visit80_501_2(newValue || value)));
        _$jscoverage['/word-filter.js'].lineData[503]++;
        if (visit81_503_1(typeof newValue == 'function')) {
          _$jscoverage['/word-filter.js'].lineData[504]++;
          newValue = newValue(value, element, name);
        }
        _$jscoverage['/word-filter.js'].lineData[509]++;
        if (visit82_509_1(newValue && newValue.push)) {
          _$jscoverage['/word-filter.js'].lineData[510]++;
          name = newValue[0];
          _$jscoverage['/word-filter.js'].lineData[511]++;
          newValue = newValue[1];
        }
        _$jscoverage['/word-filter.js'].lineData[514]++;
        if (visit83_514_1(typeof newValue == 'string')) {
          _$jscoverage['/word-filter.js'].lineData[515]++;
          rules.push([name, newValue]);
        }
        _$jscoverage['/word-filter.js'].lineData[518]++;
        return;
      }
    }
  }
  _$jscoverage['/word-filter.js'].lineData[523]++;
  visit84_523_1(!whitelist && rules.push([name, value]));
});
  _$jscoverage['/word-filter.js'].lineData[527]++;
  for (var i = 0; visit85_527_1(i < rules.length); i++) {
    _$jscoverage['/word-filter.js'].lineData[528]++;
    rules[i] = rules[i].join(':');
  }
  _$jscoverage['/word-filter.js'].lineData[531]++;
  return rules.length ? (rules.join(';') + ';') : false;
};
}, 
  applyStyleFilter: null};
  _$jscoverage['/word-filter.js'].lineData[546]++;
  function postProcessList(list) {
    _$jscoverage['/word-filter.js'].functionData[20]++;
    _$jscoverage['/word-filter.js'].lineData[547]++;
    var children = visit86_547_1(list.childNodes || []), child, count = children.length, match, mergeStyle, styleTypeRegexp = /list-style-type:(.*?)(?:;|$)/, stylesFilter = filters.stylesFilter;
    _$jscoverage['/word-filter.js'].lineData[556]++;
    if (visit87_556_1(styleTypeRegexp.exec(list.getAttribute("style")))) {
      _$jscoverage['/word-filter.js'].lineData[557]++;
      return;
    }
    _$jscoverage['/word-filter.js'].lineData[559]++;
    for (var i = 0; visit88_559_1(i < count); i++) {
      _$jscoverage['/word-filter.js'].lineData[560]++;
      child = children[i];
      _$jscoverage['/word-filter.js'].lineData[562]++;
      if (visit89_562_1(child.getAttribute("value") && visit90_562_2(Number(child.getAttribute("value")) == i + 1))) {
        _$jscoverage['/word-filter.js'].lineData[563]++;
        child.removeAttribute("value");
      }
      _$jscoverage['/word-filter.js'].lineData[566]++;
      match = styleTypeRegexp.exec(child.getAttribute("style"));
      _$jscoverage['/word-filter.js'].lineData[568]++;
      if (visit91_568_1(match)) {
        _$jscoverage['/word-filter.js'].lineData[569]++;
        if (visit92_569_1(visit93_569_2(match[1] == mergeStyle) || !mergeStyle)) {
          _$jscoverage['/word-filter.js'].lineData[570]++;
          mergeStyle = match[1];
        } else {
          _$jscoverage['/word-filter.js'].lineData[572]++;
          mergeStyle = null;
          _$jscoverage['/word-filter.js'].lineData[573]++;
          break;
        }
      }
    }
    _$jscoverage['/word-filter.js'].lineData[578]++;
    if (visit94_578_1(mergeStyle)) {
      _$jscoverage['/word-filter.js'].lineData[579]++;
      for (i = 0; visit95_579_1(i < count); i++) {
        _$jscoverage['/word-filter.js'].lineData[580]++;
        var style = children[i].getAttribute("style");
        _$jscoverage['/word-filter.js'].lineData[582]++;
        if (visit96_582_1(style)) {
          _$jscoverage['/word-filter.js'].lineData[583]++;
          style = stylesFilter([['list-style-type']])(style);
          _$jscoverage['/word-filter.js'].lineData[586]++;
          setStyle(children[i], style);
        }
      }
      _$jscoverage['/word-filter.js'].lineData[589]++;
      addStyle(list, 'list-style-type', mergeStyle);
    }
  }
  _$jscoverage['/word-filter.js'].lineData[593]++;
  var utils = {
  createListBulletMarker: function(bullet, bulletText) {
  _$jscoverage['/word-filter.js'].functionData[21]++;
  _$jscoverage['/word-filter.js'].lineData[596]++;
  var marker = new HtmlParser.Tag('ke:listbullet');
  _$jscoverage['/word-filter.js'].lineData[597]++;
  marker.setAttribute("ke:listsymbol", bullet[0]);
  _$jscoverage['/word-filter.js'].lineData[598]++;
  marker.appendChild(new HtmlParser.Text(bulletText));
  _$jscoverage['/word-filter.js'].lineData[599]++;
  return marker;
}, 
  isListBulletIndicator: function(element) {
  _$jscoverage['/word-filter.js'].functionData[22]++;
  _$jscoverage['/word-filter.js'].lineData[603]++;
  var styleText = element.getAttribute("style");
  _$jscoverage['/word-filter.js'].lineData[604]++;
  if (visit97_604_1(/mso-list\s*:\s*Ignore/i.test(styleText))) {
    _$jscoverage['/word-filter.js'].lineData[605]++;
    return true;
  }
}, 
  isContainingOnlySpaces: function(element) {
  _$jscoverage['/word-filter.js'].functionData[23]++;
  _$jscoverage['/word-filter.js'].lineData[610]++;
  var text;
  _$jscoverage['/word-filter.js'].lineData[611]++;
  return (visit98_611_1((text = onlyChild(element)) && (/^(:?\s|&nbsp;)+$/).test(text.nodeValue)));
}, 
  resolveList: function(element) {
  _$jscoverage['/word-filter.js'].functionData[24]++;
  _$jscoverage['/word-filter.js'].lineData[617]++;
  var listMarker;
  _$jscoverage['/word-filter.js'].lineData[619]++;
  if (visit99_619_1((listMarker = removeAnyChildWithName(element, 'ke:listbullet')) && visit100_620_1(listMarker.length && (listMarker = listMarker[0])))) {
    _$jscoverage['/word-filter.js'].lineData[622]++;
    element.setTagName('ke:li');
    _$jscoverage['/word-filter.js'].lineData[624]++;
    if (visit101_624_1(element.getAttribute("style"))) {
      _$jscoverage['/word-filter.js'].lineData[625]++;
      var styleStr = filters.stylesFilter([['text-indent'], ['line-height'], [(/^margin(:?-left)?$/), null, function(margin) {
  _$jscoverage['/word-filter.js'].functionData[25]++;
  _$jscoverage['/word-filter.js'].lineData[633]++;
  var values = margin.split(' ');
  _$jscoverage['/word-filter.js'].lineData[634]++;
  margin = convertToPx(visit102_634_1(values[3] || visit103_634_2(values[1] || values[0])));
  _$jscoverage['/word-filter.js'].lineData[637]++;
  if (visit104_637_1(!listBaseIndent && visit105_637_2(visit106_637_3(previousListItemMargin !== null) && visit107_638_1(margin > previousListItemMargin)))) {
    _$jscoverage['/word-filter.js'].lineData[639]++;
    listBaseIndent = margin - previousListItemMargin;
  }
  _$jscoverage['/word-filter.js'].lineData[642]++;
  previousListItemMargin = margin;
  _$jscoverage['/word-filter.js'].lineData[643]++;
  if (visit108_643_1(listBaseIndent)) {
    _$jscoverage['/word-filter.js'].lineData[644]++;
    element.setAttribute('ke:indent', visit109_644_1(visit110_644_2(listBaseIndent && (Math.ceil(margin / listBaseIndent) + 1)) || 1));
  }
}], [(/^mso-list$/), null, function(val) {
  _$jscoverage['/word-filter.js'].functionData[26]++;
  _$jscoverage['/word-filter.js'].lineData[650]++;
  val = val.split(' ');
  _$jscoverage['/word-filter.js'].lineData[651]++;
  var listId = Number(val[0].match(/\d+/)), indent = Number(val[1].match(/\d+/));
  _$jscoverage['/word-filter.js'].lineData[654]++;
  if (visit111_654_1(indent == 1)) {
    _$jscoverage['/word-filter.js'].lineData[655]++;
    visit112_655_1(visit113_655_2(listId !== previousListId) && (element.setAttribute('ke:reset', 1)));
    _$jscoverage['/word-filter.js'].lineData[657]++;
    previousListId = listId;
  }
  _$jscoverage['/word-filter.js'].lineData[659]++;
  element.setAttribute('ke:indent', indent);
}]])(element.getAttribute("style"), element);
      _$jscoverage['/word-filter.js'].lineData[663]++;
      setStyle(element, styleStr);
    }
    _$jscoverage['/word-filter.js'].lineData[668]++;
    if (visit114_668_1(!element.getAttribute("ke:indent"))) {
      _$jscoverage['/word-filter.js'].lineData[669]++;
      previousListItemMargin = 0;
      _$jscoverage['/word-filter.js'].lineData[670]++;
      element.setAttribute('ke:indent', 1);
    }
    _$jscoverage['/word-filter.js'].lineData[673]++;
    S.each(listMarker.attributes, function(a) {
  _$jscoverage['/word-filter.js'].functionData[27]++;
  _$jscoverage['/word-filter.js'].lineData[674]++;
  element.setAttribute(a.name, a.value);
});
    _$jscoverage['/word-filter.js'].lineData[677]++;
    return true;
  } else {
    _$jscoverage['/word-filter.js'].lineData[681]++;
    previousListId = previousListItemMargin = listBaseIndent = null;
  }
  _$jscoverage['/word-filter.js'].lineData[683]++;
  return false;
}, 
  getStyleComponents: (function() {
  _$jscoverage['/word-filter.js'].functionData[28]++;
  _$jscoverage['/word-filter.js'].lineData[688]++;
  var calculator = $('<div style="position:absolute;left:-9999px;top:-9999px;"></div>').prependTo("body");
  _$jscoverage['/word-filter.js'].lineData[691]++;
  return function(name, styleValue, fetchList) {
  _$jscoverage['/word-filter.js'].functionData[29]++;
  _$jscoverage['/word-filter.js'].lineData[692]++;
  calculator.css(name, styleValue);
  _$jscoverage['/word-filter.js'].lineData[693]++;
  var styles = {}, count = fetchList.length;
  _$jscoverage['/word-filter.js'].lineData[695]++;
  for (var i = 0; visit115_695_1(i < count); i++) {
    _$jscoverage['/word-filter.js'].lineData[696]++;
    styles[fetchList[i]] = calculator.css(fetchList[i]);
  }
  _$jscoverage['/word-filter.js'].lineData[699]++;
  return styles;
};
})(), 
  listDtdParents: parentOf('ol')};
  _$jscoverage['/word-filter.js'].lineData[706]++;
  (function() {
  _$jscoverage['/word-filter.js'].functionData[30]++;
  _$jscoverage['/word-filter.js'].lineData[707]++;
  var blockLike = S.merge(dtd.$block, dtd.$listItem, dtd.$tableContent), falsyFilter = filters.falsyFilter, stylesFilter = filters.stylesFilter, createListBulletMarker = utils.createListBulletMarker, flattenList = filters.flattenList, assembleList = filters.assembleList, isListBulletIndicator = utils.isListBulletIndicator, containsNothingButSpaces = utils.isContainingOnlySpaces, resolveListItem = utils.resolveList, convertToPxStr = function(value) {
  _$jscoverage['/word-filter.js'].functionData[31]++;
  _$jscoverage['/word-filter.js'].lineData[717]++;
  value = convertToPx(value);
  _$jscoverage['/word-filter.js'].lineData[718]++;
  return isNaN(value) ? value : value + 'px';
}, getStyleComponents = utils.getStyleComponents, listDtdParents = utils.listDtdParents;
  _$jscoverage['/word-filter.js'].lineData[723]++;
  wordFilter.addRules({
  tagNames: [[(/meta|link|script/), '']], 
  root: function(element) {
  _$jscoverage['/word-filter.js'].functionData[32]++;
  _$jscoverage['/word-filter.js'].lineData[731]++;
  element.filterChildren();
  _$jscoverage['/word-filter.js'].lineData[732]++;
  assembleList(element);
}, 
  tags: {
  '^': function(element) {
  _$jscoverage['/word-filter.js'].functionData[33]++;
  _$jscoverage['/word-filter.js'].lineData[738]++;
  var applyStyleFilter;
  _$jscoverage['/word-filter.js'].lineData[739]++;
  if (visit116_739_1(UA.gecko && (applyStyleFilter = filters.applyStyleFilter))) {
    _$jscoverage['/word-filter.js'].lineData[740]++;
    applyStyleFilter(element);
  }
}, 
  $: function(element) {
  _$jscoverage['/word-filter.js'].functionData[34]++;
  _$jscoverage['/word-filter.js'].lineData[744]++;
  var tagName = visit117_744_1(element.nodeName || '');
  _$jscoverage['/word-filter.js'].lineData[748]++;
  if (visit118_748_1(tagName in blockLike && element.getAttribute("style"))) {
    _$jscoverage['/word-filter.js'].lineData[749]++;
    setStyle(element, stylesFilter([[(/^(:?width|height)$/), null, convertToPxStr]])(element.getAttribute("style")));
  }
  _$jscoverage['/word-filter.js'].lineData[756]++;
  if (visit119_756_1(tagName.match(/h\d/))) {
    _$jscoverage['/word-filter.js'].lineData[757]++;
    element.filterChildren();
    _$jscoverage['/word-filter.js'].lineData[759]++;
    if (visit120_759_1(resolveListItem(element))) {
      _$jscoverage['/word-filter.js'].lineData[760]++;
      return;
    }
  } else {
    _$jscoverage['/word-filter.js'].lineData[764]++;
    if (visit121_764_1(tagName in dtd.$inline)) {
      _$jscoverage['/word-filter.js'].lineData[765]++;
      element.filterChildren();
      _$jscoverage['/word-filter.js'].lineData[766]++;
      if (visit122_766_1(containsNothingButSpaces(element))) {
        _$jscoverage['/word-filter.js'].lineData[767]++;
        element.setTagName(null);
      }
    } else {
      _$jscoverage['/word-filter.js'].lineData[772]++;
      if (visit123_772_1(visit124_772_2(tagName.indexOf(':') != -1) && visit125_773_1(tagName.indexOf('ke') == -1))) {
        _$jscoverage['/word-filter.js'].lineData[774]++;
        element.filterChildren();
        _$jscoverage['/word-filter.js'].lineData[777]++;
        if (visit126_777_1(tagName == 'v:imagedata')) {
          _$jscoverage['/word-filter.js'].lineData[778]++;
          var href = element.getAttribute('o:href');
          _$jscoverage['/word-filter.js'].lineData[779]++;
          if (visit127_779_1(href)) {
            _$jscoverage['/word-filter.js'].lineData[780]++;
            element.setAttribute("src", href);
          }
          _$jscoverage['/word-filter.js'].lineData[782]++;
          element.setTagName('img');
          _$jscoverage['/word-filter.js'].lineData[783]++;
          return;
        }
        _$jscoverage['/word-filter.js'].lineData[785]++;
        element.setTagName(null);
      }
    }
  }
  _$jscoverage['/word-filter.js'].lineData[789]++;
  if (visit128_789_1(tagName in listDtdParents)) {
    _$jscoverage['/word-filter.js'].lineData[790]++;
    element.filterChildren();
    _$jscoverage['/word-filter.js'].lineData[791]++;
    assembleList(element);
  }
}, 
  'style': function(element) {
  _$jscoverage['/word-filter.js'].functionData[35]++;
  _$jscoverage['/word-filter.js'].lineData[799]++;
  if (visit129_799_1(UA.gecko)) {
    _$jscoverage['/word-filter.js'].lineData[801]++;
    var styleDefSection = onlyChild(element).nodeValue.match(/\/\* Style Definitions \*\/([\s\S]*?)\/\*/), styleDefText = visit130_803_1(styleDefSection && styleDefSection[1]), rules = {};
    _$jscoverage['/word-filter.js'].lineData[806]++;
    if (visit131_806_1(styleDefText)) {
      _$jscoverage['/word-filter.js'].lineData[811]++;
      styleDefText.replace(/[\n\r]/g, '').replace(/(.+?)\{(.+?)\}/g, function(rule, selectors, styleBlock) {
  _$jscoverage['/word-filter.js'].functionData[36]++;
  _$jscoverage['/word-filter.js'].lineData[813]++;
  selectors = selectors.split(',');
  _$jscoverage['/word-filter.js'].lineData[814]++;
  var length = selectors.length;
  _$jscoverage['/word-filter.js'].lineData[815]++;
  for (var i = 0; visit132_815_1(i < length); i++) {
    _$jscoverage['/word-filter.js'].lineData[819]++;
    S.trim(selectors[i]).replace(/^(\w+)(\.[\w-]+)?$/g, function(match, tagName, className) {
  _$jscoverage['/word-filter.js'].functionData[37]++;
  _$jscoverage['/word-filter.js'].lineData[821]++;
  tagName = visit133_821_1(tagName || '*');
  _$jscoverage['/word-filter.js'].lineData[822]++;
  className = className.substring(1, className.length);
  _$jscoverage['/word-filter.js'].lineData[825]++;
  if (visit134_825_1(className.match(/MsoNormal/))) {
    _$jscoverage['/word-filter.js'].lineData[826]++;
    return;
  }
  _$jscoverage['/word-filter.js'].lineData[828]++;
  if (visit135_828_1(!rules[tagName])) {
    _$jscoverage['/word-filter.js'].lineData[829]++;
    rules[tagName] = {};
  }
  _$jscoverage['/word-filter.js'].lineData[831]++;
  if (visit136_831_1(className)) {
    _$jscoverage['/word-filter.js'].lineData[832]++;
    rules[tagName][className] = styleBlock;
  } else {
    _$jscoverage['/word-filter.js'].lineData[834]++;
    rules[tagName] = styleBlock;
  }
});
  }
});
      _$jscoverage['/word-filter.js'].lineData[840]++;
      filters.applyStyleFilter = function(element) {
  _$jscoverage['/word-filter.js'].functionData[38]++;
  _$jscoverage['/word-filter.js'].lineData[841]++;
  var name = rules['*'] ? '*' : element.nodeName, className = element.getAttribute('class'), style;
  _$jscoverage['/word-filter.js'].lineData[844]++;
  if (visit137_844_1(name in rules)) {
    _$jscoverage['/word-filter.js'].lineData[845]++;
    style = rules[name];
    _$jscoverage['/word-filter.js'].lineData[846]++;
    if (visit138_846_1(typeof style == 'object')) {
      _$jscoverage['/word-filter.js'].lineData[847]++;
      style = style[className];
    }
    _$jscoverage['/word-filter.js'].lineData[849]++;
    visit139_849_1(style && addStyle(element, style, true));
  }
};
    }
  }
  _$jscoverage['/word-filter.js'].lineData[854]++;
  return false;
}, 
  'p': function(element) {
  _$jscoverage['/word-filter.js'].functionData[39]++;
  _$jscoverage['/word-filter.js'].lineData[861]++;
  if (visit140_861_1(/MsoListParagraph/.exec(element.getAttribute('class')))) {
    _$jscoverage['/word-filter.js'].lineData[862]++;
    var bulletText = firstChild(element, function(node) {
  _$jscoverage['/word-filter.js'].functionData[40]++;
  _$jscoverage['/word-filter.js'].lineData[863]++;
  return visit141_863_1(visit142_863_2(node.nodeType == 3) && !containsNothingButSpaces(node.parentNode));
});
    _$jscoverage['/word-filter.js'].lineData[865]++;
    var bullet = visit143_865_1(bulletText && bulletText.parentNode);
    _$jscoverage['/word-filter.js'].lineData[866]++;
    visit144_866_1(!bullet.getAttribute("style") && (bullet.setAttribute("style", 'mso-list: Ignore;')));
  }
  _$jscoverage['/word-filter.js'].lineData[869]++;
  element.filterChildren();
  _$jscoverage['/word-filter.js'].lineData[871]++;
  resolveListItem(element);
}, 
  'div': function(element) {
  _$jscoverage['/word-filter.js'].functionData[41]++;
  _$jscoverage['/word-filter.js'].lineData[878]++;
  var singleChild = onlyChild(element);
  _$jscoverage['/word-filter.js'].lineData[879]++;
  if (visit145_879_1(singleChild && visit146_879_2(singleChild.nodeName == 'table'))) {
    _$jscoverage['/word-filter.js'].lineData[880]++;
    var attrs = element.attributes;
    _$jscoverage['/word-filter.js'].lineData[882]++;
    S.each(attrs, function(attr) {
  _$jscoverage['/word-filter.js'].functionData[42]++;
  _$jscoverage['/word-filter.js'].lineData[883]++;
  singleChild.setAttribute(attr.name, attr.value);
});
    _$jscoverage['/word-filter.js'].lineData[886]++;
    if (visit147_886_1(element.getAttribute("style"))) {
      _$jscoverage['/word-filter.js'].lineData[887]++;
      addStyle(singleChild, element.getAttribute("style"));
    }
    _$jscoverage['/word-filter.js'].lineData[890]++;
    var clearFloatDiv = new HtmlParser.Tag('div');
    _$jscoverage['/word-filter.js'].lineData[891]++;
    addStyle(clearFloatDiv, 'clear', 'both');
    _$jscoverage['/word-filter.js'].lineData[892]++;
    element.appendChild(clearFloatDiv);
    _$jscoverage['/word-filter.js'].lineData[893]++;
    element.setTagName(null);
  }
}, 
  'td': function(element) {
  _$jscoverage['/word-filter.js'].functionData[43]++;
  _$jscoverage['/word-filter.js'].lineData[899]++;
  if (visit148_899_1(getAncestor(element, 'thead'))) {
    _$jscoverage['/word-filter.js'].lineData[900]++;
    element.setTagName('th');
  }
}, 
  'ol': flattenList, 
  'ul': flattenList, 
  'dl': flattenList, 
  'font': function(element) {
  _$jscoverage['/word-filter.js'].functionData[44]++;
  _$jscoverage['/word-filter.js'].lineData[911]++;
  if (visit149_911_1(isListBulletIndicator(element.parentNode))) {
    _$jscoverage['/word-filter.js'].lineData[912]++;
    element.setTagName(null);
    _$jscoverage['/word-filter.js'].lineData[913]++;
    return;
  }
  _$jscoverage['/word-filter.js'].lineData[916]++;
  element.filterChildren();
  _$jscoverage['/word-filter.js'].lineData[918]++;
  var styleText = element.getAttribute("style"), parent = element.parentNode;
  _$jscoverage['/word-filter.js'].lineData[921]++;
  if (visit150_921_1('font' == parent.name)) {
    _$jscoverage['/word-filter.js'].lineData[923]++;
    S.each(element.attributes, function(attr) {
  _$jscoverage['/word-filter.js'].functionData[45]++;
  _$jscoverage['/word-filter.js'].lineData[924]++;
  parent.setAttribute(attr.name, attr.value);
});
    _$jscoverage['/word-filter.js'].lineData[926]++;
    visit151_926_1(styleText && addStyle(parent, styleText));
    _$jscoverage['/word-filter.js'].lineData[927]++;
    element.setTagName(null);
  } else {
    _$jscoverage['/word-filter.js'].lineData[931]++;
    styleText = visit152_931_1(styleText || '');
    _$jscoverage['/word-filter.js'].lineData[933]++;
    if (visit153_933_1(element.getAttribute("color"))) {
      _$jscoverage['/word-filter.js'].lineData[934]++;
      visit154_934_1(visit155_934_2(element.getAttribute("color") != '#000000') && (styleText += 'color:' + element.getAttribute("color") + ';'));
      _$jscoverage['/word-filter.js'].lineData[935]++;
      element.removeAttribute("color");
    }
    _$jscoverage['/word-filter.js'].lineData[937]++;
    if (visit156_937_1(element.getAttribute("face"))) {
      _$jscoverage['/word-filter.js'].lineData[938]++;
      styleText += 'font-family:' + element.getAttribute("face") + ';';
      _$jscoverage['/word-filter.js'].lineData[939]++;
      element.removeAttribute("face");
    }
    _$jscoverage['/word-filter.js'].lineData[941]++;
    var size = element.getAttribute("size");
    _$jscoverage['/word-filter.js'].lineData[944]++;
    if (visit157_944_1(size)) {
      _$jscoverage['/word-filter.js'].lineData[945]++;
      styleText += 'font-size:' + (visit158_946_1(size > 3) ? 'large' : (visit159_947_1(size < 3) ? 'small' : 'medium')) + ';';
      _$jscoverage['/word-filter.js'].lineData[948]++;
      element.removeAttribute("size");
    }
    _$jscoverage['/word-filter.js'].lineData[950]++;
    element.setTagName("span");
    _$jscoverage['/word-filter.js'].lineData[951]++;
    addStyle(element, styleText);
  }
}, 
  'span': function(element) {
  _$jscoverage['/word-filter.js'].functionData[46]++;
  _$jscoverage['/word-filter.js'].lineData[957]++;
  if (visit160_957_1(isListBulletIndicator(element.parentNode))) {
    _$jscoverage['/word-filter.js'].lineData[958]++;
    return false;
  }
  _$jscoverage['/word-filter.js'].lineData[960]++;
  element.filterChildren();
  _$jscoverage['/word-filter.js'].lineData[961]++;
  if (visit161_961_1(containsNothingButSpaces(element))) {
    _$jscoverage['/word-filter.js'].lineData[962]++;
    element.setTagName(null);
    _$jscoverage['/word-filter.js'].lineData[963]++;
    return null;
  }
  _$jscoverage['/word-filter.js'].lineData[968]++;
  if (visit162_968_1(isListBulletIndicator(element))) {
    _$jscoverage['/word-filter.js'].lineData[969]++;
    var listSymbolNode = firstChild(element, function(node) {
  _$jscoverage['/word-filter.js'].functionData[47]++;
  _$jscoverage['/word-filter.js'].lineData[970]++;
  return visit163_970_1(node.nodeValue || visit164_970_2(node.nodeName == 'img'));
});
    _$jscoverage['/word-filter.js'].lineData[973]++;
    var listSymbol = visit165_973_1(listSymbolNode && (visit166_973_2(listSymbolNode.nodeValue || 'l.'))), listType = visit167_974_1(listSymbol && listSymbol.match(/^(?:[(]?)([^\s]+?)([.)]?)$/));
    _$jscoverage['/word-filter.js'].lineData[976]++;
    if (visit168_976_1(listType)) {
      _$jscoverage['/word-filter.js'].lineData[977]++;
      var marker = createListBulletMarker(listType, listSymbol);
      _$jscoverage['/word-filter.js'].lineData[981]++;
      var ancestor = getAncestor(element, 'span');
      _$jscoverage['/word-filter.js'].lineData[982]++;
      if (visit169_982_1(ancestor && (/ mso-hide:\s*all|display:\s*none /).test(ancestor.getAttribute("style")))) {
        _$jscoverage['/word-filter.js'].lineData[984]++;
        marker.setAttribute('ke:ignored', 1);
      }
      _$jscoverage['/word-filter.js'].lineData[986]++;
      return marker;
    }
  }
  _$jscoverage['/word-filter.js'].lineData[991]++;
  var styleText = element.getAttribute("style");
  _$jscoverage['/word-filter.js'].lineData[995]++;
  if (visit170_995_1(styleText)) {
    _$jscoverage['/word-filter.js'].lineData[997]++;
    setStyle(element, stylesFilter([[/^line-height$/], [/^font-family$/], [/^font-size$/], [/^color$/], [/^background-color$/]])(styleText, element));
  }
}, 
  'a': function(element) {
  _$jscoverage['/word-filter.js'].functionData[48]++;
  _$jscoverage['/word-filter.js'].lineData[1012]++;
  var href;
  _$jscoverage['/word-filter.js'].lineData[1013]++;
  if (visit171_1013_1(!(href = element.getAttribute("href")) && element.getAttribute("name"))) {
    _$jscoverage['/word-filter.js'].lineData[1014]++;
    element.setTagName(null);
  } else {
    _$jscoverage['/word-filter.js'].lineData[1015]++;
    if (visit172_1015_1(UA.webkit && visit173_1015_2(href && href.match(/file:\/\/\/[\S]+#/i)))) {
      _$jscoverage['/word-filter.js'].lineData[1016]++;
      element.setAttribute("href", href.replace(/file:\/\/\/[^#]+/i, ''));
    }
  }
}, 
  'ke:listbullet': function(element) {
  _$jscoverage['/word-filter.js'].functionData[49]++;
  _$jscoverage['/word-filter.js'].lineData[1020]++;
  if (visit174_1020_1(getAncestor(element, /h\d/))) {
    _$jscoverage['/word-filter.js'].lineData[1021]++;
    element.setTagName(null);
  }
}}, 
  attributeNames: [[(/^onmouse(:?out|over)/), ''], [(/^onload$/), ''], [(/(?:v|o):\w+/), ''], [(/^lang/), '']], 
  attributes: {
  'style': stylesFilter([[(/^list-style-type$/)], [(/^margin$|^margin-(?!bottom|top)/), null, function(value, element, name) {
  _$jscoverage['/word-filter.js'].functionData[50]++;
  _$jscoverage['/word-filter.js'].lineData[1047]++;
  if (visit175_1047_1(element.nodeName in {
  p: 1, 
  div: 1})) {
    _$jscoverage['/word-filter.js'].lineData[1048]++;
    var indentStyleName = 'margin-left';
    _$jscoverage['/word-filter.js'].lineData[1051]++;
    if (visit176_1051_1(name == 'margin')) {
      _$jscoverage['/word-filter.js'].lineData[1052]++;
      value = getStyleComponents(name, value, [indentStyleName])[indentStyleName];
    } else {
      _$jscoverage['/word-filter.js'].lineData[1054]++;
      if (visit177_1054_1(name != indentStyleName)) {
        _$jscoverage['/word-filter.js'].lineData[1055]++;
        return null;
      }
    }
    _$jscoverage['/word-filter.js'].lineData[1058]++;
    if (visit178_1058_1(value && !emptyMarginRegex.test(value))) {
      _$jscoverage['/word-filter.js'].lineData[1059]++;
      return [indentStyleName, value];
    }
  }
  _$jscoverage['/word-filter.js'].lineData[1063]++;
  return null;
}], [(/^clear$/)], [(/^border.*|margin.*|vertical-align|float$/), null, function(value, element) {
  _$jscoverage['/word-filter.js'].functionData[51]++;
  _$jscoverage['/word-filter.js'].lineData[1071]++;
  if (visit179_1071_1(element.nodeName == 'img')) {
    _$jscoverage['/word-filter.js'].lineData[1072]++;
    return value;
  }
}], [(/^width|height$/), null, function(value, element) {
  _$jscoverage['/word-filter.js'].functionData[52]++;
  _$jscoverage['/word-filter.js'].lineData[1077]++;
  if (visit180_1077_1(element.nodeName in {
  table: 1, 
  td: 1, 
  th: 1, 
  img: 1})) {
    _$jscoverage['/word-filter.js'].lineData[1078]++;
    return value;
  }
}]], 1), 
  'width': function(value, element) {
  _$jscoverage['/word-filter.js'].functionData[53]++;
  _$jscoverage['/word-filter.js'].lineData[1084]++;
  if (visit181_1084_1(element.nodeName in dtd.$tableContent)) {
    _$jscoverage['/word-filter.js'].lineData[1085]++;
    return false;
  }
}, 
  'border': function(value, element) {
  _$jscoverage['/word-filter.js'].functionData[54]++;
  _$jscoverage['/word-filter.js'].lineData[1089]++;
  if (visit182_1089_1(element.nodeName in dtd.$tableContent)) {
    _$jscoverage['/word-filter.js'].lineData[1090]++;
    return false;
  }
}, 
  'class': falsyFilter, 
  'bgcolor': falsyFilter, 
  'valign': function(value, element) {
  _$jscoverage['/word-filter.js'].functionData[55]++;
  _$jscoverage['/word-filter.js'].lineData[1104]++;
  addStyle(element, 'vertical-align', value);
  _$jscoverage['/word-filter.js'].lineData[1105]++;
  return false;
}}, 
  comment: UA.ie ? function(value, node) {
  _$jscoverage['/word-filter.js'].functionData[56]++;
  _$jscoverage['/word-filter.js'].lineData[1115]++;
  var imageInfo = value.match(/<img.*?>/), listInfo = value.match(/^\[if !supportLists\]([\s\S]*?)\[endif\]$/);
  _$jscoverage['/word-filter.js'].lineData[1119]++;
  if (visit183_1119_1(listInfo)) {
    _$jscoverage['/word-filter.js'].lineData[1121]++;
    var listSymbol = visit184_1121_1(listInfo[1] || (visit185_1121_2(imageInfo && 'l.'))), listType = visit186_1122_1(listSymbol && listSymbol.match(/>(?:[(]?)([^\s]+?)([.)]?)</));
    _$jscoverage['/word-filter.js'].lineData[1123]++;
    return createListBulletMarker(listType, listSymbol);
  }
  _$jscoverage['/word-filter.js'].lineData[1127]++;
  if (visit187_1127_1(UA.gecko && imageInfo)) {
    _$jscoverage['/word-filter.js'].lineData[1128]++;
    var img = new HtmlParser.Parser(imageInfo[0]).parse().childNodes[0], previousComment = node.previousSibling, imgSrcInfo = visit188_1131_1(previousComment && previousComment.toHtml().match(/<v:imagedata[^>]*o:href=['"](.*?)['"]/)), imgSrc = visit189_1132_1(imgSrcInfo && imgSrcInfo[1]);
    _$jscoverage['/word-filter.js'].lineData[1135]++;
    visit190_1135_1(imgSrc && (img.setAttribute("src", imgSrc)));
    _$jscoverage['/word-filter.js'].lineData[1136]++;
    return img;
  }
  _$jscoverage['/word-filter.js'].lineData[1139]++;
  return false;
} : falsyFilter});
})();
  _$jscoverage['/word-filter.js'].lineData[1145]++;
  return {
  toDataFormat: function(html, editor) {
  _$jscoverage['/word-filter.js'].functionData[57]++;
  _$jscoverage['/word-filter.js'].lineData[1164]++;
  if (visit191_1164_1(UA.gecko)) {
    _$jscoverage['/word-filter.js'].lineData[1165]++;
    html = html.replace(/(<!--\[if[^<]*?\])-->([\S\s]*?)<!--(\[endif\]-->)/gi, '$1$2$3');
  }
  _$jscoverage['/word-filter.js'].lineData[1170]++;
  html = editor['htmlDataProcessor'].toDataFormat(html, wordFilter);
  _$jscoverage['/word-filter.js'].lineData[1172]++;
  return html;
}};
}, {
  requires: ['html-parser']});
