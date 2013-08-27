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
  _$jscoverage['/word-filter.js'].lineData[5] = 0;
  _$jscoverage['/word-filter.js'].lineData[6] = 0;
  _$jscoverage['/word-filter.js'].lineData[50] = 0;
  _$jscoverage['/word-filter.js'].lineData[51] = 0;
  _$jscoverage['/word-filter.js'].lineData[52] = 0;
  _$jscoverage['/word-filter.js'].lineData[53] = 0;
  _$jscoverage['/word-filter.js'].lineData[54] = 0;
  _$jscoverage['/word-filter.js'].lineData[55] = 0;
  _$jscoverage['/word-filter.js'].lineData[58] = 0;
  _$jscoverage['/word-filter.js'].lineData[62] = 0;
  _$jscoverage['/word-filter.js'].lineData[63] = 0;
  _$jscoverage['/word-filter.js'].lineData[64] = 0;
  _$jscoverage['/word-filter.js'].lineData[65] = 0;
  _$jscoverage['/word-filter.js'].lineData[66] = 0;
  _$jscoverage['/word-filter.js'].lineData[67] = 0;
  _$jscoverage['/word-filter.js'].lineData[69] = 0;
  _$jscoverage['/word-filter.js'].lineData[72] = 0;
  _$jscoverage['/word-filter.js'].lineData[73] = 0;
  _$jscoverage['/word-filter.js'].lineData[74] = 0;
  _$jscoverage['/word-filter.js'].lineData[76] = 0;
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
  _$jscoverage['/word-filter.js'].lineData[304] = 0;
  _$jscoverage['/word-filter.js'].lineData[316] = 0;
  _$jscoverage['/word-filter.js'].lineData[321] = 0;
  _$jscoverage['/word-filter.js'].lineData[322] = 0;
  _$jscoverage['/word-filter.js'].lineData[324] = 0;
  _$jscoverage['/word-filter.js'].lineData[325] = 0;
  _$jscoverage['/word-filter.js'].lineData[326] = 0;
  _$jscoverage['/word-filter.js'].lineData[328] = 0;
  _$jscoverage['/word-filter.js'].lineData[329] = 0;
  _$jscoverage['/word-filter.js'].lineData[330] = 0;
  _$jscoverage['/word-filter.js'].lineData[332] = 0;
  _$jscoverage['/word-filter.js'].lineData[333] = 0;
  _$jscoverage['/word-filter.js'].lineData[334] = 0;
  _$jscoverage['/word-filter.js'].lineData[339] = 0;
  _$jscoverage['/word-filter.js'].lineData[344] = 0;
  _$jscoverage['/word-filter.js'].lineData[347] = 0;
  _$jscoverage['/word-filter.js'].lineData[348] = 0;
  _$jscoverage['/word-filter.js'].lineData[351] = 0;
  _$jscoverage['/word-filter.js'].lineData[352] = 0;
  _$jscoverage['/word-filter.js'].lineData[353] = 0;
  _$jscoverage['/word-filter.js'].lineData[358] = 0;
  _$jscoverage['/word-filter.js'].lineData[360] = 0;
  _$jscoverage['/word-filter.js'].lineData[361] = 0;
  _$jscoverage['/word-filter.js'].lineData[364] = 0;
  _$jscoverage['/word-filter.js'].lineData[366] = 0;
  _$jscoverage['/word-filter.js'].lineData[368] = 0;
  _$jscoverage['/word-filter.js'].lineData[371] = 0;
  _$jscoverage['/word-filter.js'].lineData[372] = 0;
  _$jscoverage['/word-filter.js'].lineData[373] = 0;
  _$jscoverage['/word-filter.js'].lineData[374] = 0;
  _$jscoverage['/word-filter.js'].lineData[375] = 0;
  _$jscoverage['/word-filter.js'].lineData[376] = 0;
  _$jscoverage['/word-filter.js'].lineData[380] = 0;
  _$jscoverage['/word-filter.js'].lineData[381] = 0;
  _$jscoverage['/word-filter.js'].lineData[382] = 0;
  _$jscoverage['/word-filter.js'].lineData[392] = 0;
  _$jscoverage['/word-filter.js'].lineData[395] = 0;
  _$jscoverage['/word-filter.js'].lineData[396] = 0;
  _$jscoverage['/word-filter.js'].lineData[397] = 0;
  _$jscoverage['/word-filter.js'].lineData[398] = 0;
  _$jscoverage['/word-filter.js'].lineData[401] = 0;
  _$jscoverage['/word-filter.js'].lineData[402] = 0;
  _$jscoverage['/word-filter.js'].lineData[404] = 0;
  _$jscoverage['/word-filter.js'].lineData[405] = 0;
  _$jscoverage['/word-filter.js'].lineData[408] = 0;
  _$jscoverage['/word-filter.js'].lineData[409] = 0;
  _$jscoverage['/word-filter.js'].lineData[412] = 0;
  _$jscoverage['/word-filter.js'].lineData[413] = 0;
  _$jscoverage['/word-filter.js'].lineData[417] = 0;
  _$jscoverage['/word-filter.js'].lineData[421] = 0;
  _$jscoverage['/word-filter.js'].lineData[422] = 0;
  _$jscoverage['/word-filter.js'].lineData[423] = 0;
  _$jscoverage['/word-filter.js'].lineData[424] = 0;
  _$jscoverage['/word-filter.js'].lineData[426] = 0;
  _$jscoverage['/word-filter.js'].lineData[427] = 0;
  _$jscoverage['/word-filter.js'].lineData[428] = 0;
  _$jscoverage['/word-filter.js'].lineData[429] = 0;
  _$jscoverage['/word-filter.js'].lineData[431] = 0;
  _$jscoverage['/word-filter.js'].lineData[433] = 0;
  _$jscoverage['/word-filter.js'].lineData[435] = 0;
  _$jscoverage['/word-filter.js'].lineData[436] = 0;
  _$jscoverage['/word-filter.js'].lineData[438] = 0;
  _$jscoverage['/word-filter.js'].lineData[441] = 0;
  _$jscoverage['/word-filter.js'].lineData[443] = 0;
  _$jscoverage['/word-filter.js'].lineData[446] = 0;
  _$jscoverage['/word-filter.js'].lineData[447] = 0;
  _$jscoverage['/word-filter.js'].lineData[449] = 0;
  _$jscoverage['/word-filter.js'].lineData[451] = 0;
  _$jscoverage['/word-filter.js'].lineData[452] = 0;
  _$jscoverage['/word-filter.js'].lineData[456] = 0;
  _$jscoverage['/word-filter.js'].lineData[457] = 0;
  _$jscoverage['/word-filter.js'].lineData[465] = 0;
  _$jscoverage['/word-filter.js'].lineData[476] = 0;
  _$jscoverage['/word-filter.js'].lineData[477] = 0;
  _$jscoverage['/word-filter.js'].lineData[481] = 0;
  _$jscoverage['/word-filter.js'].lineData[485] = 0;
  _$jscoverage['/word-filter.js'].lineData[486] = 0;
  _$jscoverage['/word-filter.js'].lineData[488] = 0;
  _$jscoverage['/word-filter.js'].lineData[492] = 0;
  _$jscoverage['/word-filter.js'].lineData[493] = 0;
  _$jscoverage['/word-filter.js'].lineData[494] = 0;
  _$jscoverage['/word-filter.js'].lineData[495] = 0;
  _$jscoverage['/word-filter.js'].lineData[496] = 0;
  _$jscoverage['/word-filter.js'].lineData[497] = 0;
  _$jscoverage['/word-filter.js'].lineData[499] = 0;
  _$jscoverage['/word-filter.js'].lineData[501] = 0;
  _$jscoverage['/word-filter.js'].lineData[502] = 0;
  _$jscoverage['/word-filter.js'].lineData[504] = 0;
  _$jscoverage['/word-filter.js'].lineData[505] = 0;
  _$jscoverage['/word-filter.js'].lineData[510] = 0;
  _$jscoverage['/word-filter.js'].lineData[511] = 0;
  _$jscoverage['/word-filter.js'].lineData[512] = 0;
  _$jscoverage['/word-filter.js'].lineData[515] = 0;
  _$jscoverage['/word-filter.js'].lineData[516] = 0;
  _$jscoverage['/word-filter.js'].lineData[519] = 0;
  _$jscoverage['/word-filter.js'].lineData[524] = 0;
  _$jscoverage['/word-filter.js'].lineData[528] = 0;
  _$jscoverage['/word-filter.js'].lineData[529] = 0;
  _$jscoverage['/word-filter.js'].lineData[532] = 0;
  _$jscoverage['/word-filter.js'].lineData[547] = 0;
  _$jscoverage['/word-filter.js'].lineData[548] = 0;
  _$jscoverage['/word-filter.js'].lineData[557] = 0;
  _$jscoverage['/word-filter.js'].lineData[558] = 0;
  _$jscoverage['/word-filter.js'].lineData[560] = 0;
  _$jscoverage['/word-filter.js'].lineData[561] = 0;
  _$jscoverage['/word-filter.js'].lineData[563] = 0;
  _$jscoverage['/word-filter.js'].lineData[564] = 0;
  _$jscoverage['/word-filter.js'].lineData[567] = 0;
  _$jscoverage['/word-filter.js'].lineData[569] = 0;
  _$jscoverage['/word-filter.js'].lineData[570] = 0;
  _$jscoverage['/word-filter.js'].lineData[571] = 0;
  _$jscoverage['/word-filter.js'].lineData[573] = 0;
  _$jscoverage['/word-filter.js'].lineData[574] = 0;
  _$jscoverage['/word-filter.js'].lineData[579] = 0;
  _$jscoverage['/word-filter.js'].lineData[580] = 0;
  _$jscoverage['/word-filter.js'].lineData[581] = 0;
  _$jscoverage['/word-filter.js'].lineData[583] = 0;
  _$jscoverage['/word-filter.js'].lineData[584] = 0;
  _$jscoverage['/word-filter.js'].lineData[587] = 0;
  _$jscoverage['/word-filter.js'].lineData[590] = 0;
  _$jscoverage['/word-filter.js'].lineData[594] = 0;
  _$jscoverage['/word-filter.js'].lineData[597] = 0;
  _$jscoverage['/word-filter.js'].lineData[598] = 0;
  _$jscoverage['/word-filter.js'].lineData[599] = 0;
  _$jscoverage['/word-filter.js'].lineData[600] = 0;
  _$jscoverage['/word-filter.js'].lineData[604] = 0;
  _$jscoverage['/word-filter.js'].lineData[605] = 0;
  _$jscoverage['/word-filter.js'].lineData[606] = 0;
  _$jscoverage['/word-filter.js'].lineData[611] = 0;
  _$jscoverage['/word-filter.js'].lineData[612] = 0;
  _$jscoverage['/word-filter.js'].lineData[618] = 0;
  _$jscoverage['/word-filter.js'].lineData[620] = 0;
  _$jscoverage['/word-filter.js'].lineData[623] = 0;
  _$jscoverage['/word-filter.js'].lineData[625] = 0;
  _$jscoverage['/word-filter.js'].lineData[626] = 0;
  _$jscoverage['/word-filter.js'].lineData[634] = 0;
  _$jscoverage['/word-filter.js'].lineData[635] = 0;
  _$jscoverage['/word-filter.js'].lineData[638] = 0;
  _$jscoverage['/word-filter.js'].lineData[640] = 0;
  _$jscoverage['/word-filter.js'].lineData[643] = 0;
  _$jscoverage['/word-filter.js'].lineData[644] = 0;
  _$jscoverage['/word-filter.js'].lineData[645] = 0;
  _$jscoverage['/word-filter.js'].lineData[651] = 0;
  _$jscoverage['/word-filter.js'].lineData[652] = 0;
  _$jscoverage['/word-filter.js'].lineData[655] = 0;
  _$jscoverage['/word-filter.js'].lineData[656] = 0;
  _$jscoverage['/word-filter.js'].lineData[658] = 0;
  _$jscoverage['/word-filter.js'].lineData[660] = 0;
  _$jscoverage['/word-filter.js'].lineData[664] = 0;
  _$jscoverage['/word-filter.js'].lineData[669] = 0;
  _$jscoverage['/word-filter.js'].lineData[670] = 0;
  _$jscoverage['/word-filter.js'].lineData[671] = 0;
  _$jscoverage['/word-filter.js'].lineData[674] = 0;
  _$jscoverage['/word-filter.js'].lineData[675] = 0;
  _$jscoverage['/word-filter.js'].lineData[678] = 0;
  _$jscoverage['/word-filter.js'].lineData[682] = 0;
  _$jscoverage['/word-filter.js'].lineData[684] = 0;
  _$jscoverage['/word-filter.js'].lineData[689] = 0;
  _$jscoverage['/word-filter.js'].lineData[692] = 0;
  _$jscoverage['/word-filter.js'].lineData[693] = 0;
  _$jscoverage['/word-filter.js'].lineData[694] = 0;
  _$jscoverage['/word-filter.js'].lineData[696] = 0;
  _$jscoverage['/word-filter.js'].lineData[697] = 0;
  _$jscoverage['/word-filter.js'].lineData[700] = 0;
  _$jscoverage['/word-filter.js'].lineData[707] = 0;
  _$jscoverage['/word-filter.js'].lineData[708] = 0;
  _$jscoverage['/word-filter.js'].lineData[718] = 0;
  _$jscoverage['/word-filter.js'].lineData[719] = 0;
  _$jscoverage['/word-filter.js'].lineData[724] = 0;
  _$jscoverage['/word-filter.js'].lineData[732] = 0;
  _$jscoverage['/word-filter.js'].lineData[733] = 0;
  _$jscoverage['/word-filter.js'].lineData[739] = 0;
  _$jscoverage['/word-filter.js'].lineData[740] = 0;
  _$jscoverage['/word-filter.js'].lineData[741] = 0;
  _$jscoverage['/word-filter.js'].lineData[745] = 0;
  _$jscoverage['/word-filter.js'].lineData[749] = 0;
  _$jscoverage['/word-filter.js'].lineData[750] = 0;
  _$jscoverage['/word-filter.js'].lineData[757] = 0;
  _$jscoverage['/word-filter.js'].lineData[758] = 0;
  _$jscoverage['/word-filter.js'].lineData[760] = 0;
  _$jscoverage['/word-filter.js'].lineData[761] = 0;
  _$jscoverage['/word-filter.js'].lineData[765] = 0;
  _$jscoverage['/word-filter.js'].lineData[766] = 0;
  _$jscoverage['/word-filter.js'].lineData[767] = 0;
  _$jscoverage['/word-filter.js'].lineData[768] = 0;
  _$jscoverage['/word-filter.js'].lineData[773] = 0;
  _$jscoverage['/word-filter.js'].lineData[775] = 0;
  _$jscoverage['/word-filter.js'].lineData[778] = 0;
  _$jscoverage['/word-filter.js'].lineData[779] = 0;
  _$jscoverage['/word-filter.js'].lineData[780] = 0;
  _$jscoverage['/word-filter.js'].lineData[781] = 0;
  _$jscoverage['/word-filter.js'].lineData[783] = 0;
  _$jscoverage['/word-filter.js'].lineData[784] = 0;
  _$jscoverage['/word-filter.js'].lineData[786] = 0;
  _$jscoverage['/word-filter.js'].lineData[790] = 0;
  _$jscoverage['/word-filter.js'].lineData[791] = 0;
  _$jscoverage['/word-filter.js'].lineData[792] = 0;
  _$jscoverage['/word-filter.js'].lineData[800] = 0;
  _$jscoverage['/word-filter.js'].lineData[802] = 0;
  _$jscoverage['/word-filter.js'].lineData[807] = 0;
  _$jscoverage['/word-filter.js'].lineData[812] = 0;
  _$jscoverage['/word-filter.js'].lineData[814] = 0;
  _$jscoverage['/word-filter.js'].lineData[815] = 0;
  _$jscoverage['/word-filter.js'].lineData[816] = 0;
  _$jscoverage['/word-filter.js'].lineData[820] = 0;
  _$jscoverage['/word-filter.js'].lineData[822] = 0;
  _$jscoverage['/word-filter.js'].lineData[823] = 0;
  _$jscoverage['/word-filter.js'].lineData[826] = 0;
  _$jscoverage['/word-filter.js'].lineData[827] = 0;
  _$jscoverage['/word-filter.js'].lineData[829] = 0;
  _$jscoverage['/word-filter.js'].lineData[830] = 0;
  _$jscoverage['/word-filter.js'].lineData[832] = 0;
  _$jscoverage['/word-filter.js'].lineData[833] = 0;
  _$jscoverage['/word-filter.js'].lineData[835] = 0;
  _$jscoverage['/word-filter.js'].lineData[841] = 0;
  _$jscoverage['/word-filter.js'].lineData[842] = 0;
  _$jscoverage['/word-filter.js'].lineData[845] = 0;
  _$jscoverage['/word-filter.js'].lineData[846] = 0;
  _$jscoverage['/word-filter.js'].lineData[847] = 0;
  _$jscoverage['/word-filter.js'].lineData[848] = 0;
  _$jscoverage['/word-filter.js'].lineData[850] = 0;
  _$jscoverage['/word-filter.js'].lineData[855] = 0;
  _$jscoverage['/word-filter.js'].lineData[862] = 0;
  _$jscoverage['/word-filter.js'].lineData[863] = 0;
  _$jscoverage['/word-filter.js'].lineData[864] = 0;
  _$jscoverage['/word-filter.js'].lineData[866] = 0;
  _$jscoverage['/word-filter.js'].lineData[867] = 0;
  _$jscoverage['/word-filter.js'].lineData[870] = 0;
  _$jscoverage['/word-filter.js'].lineData[872] = 0;
  _$jscoverage['/word-filter.js'].lineData[879] = 0;
  _$jscoverage['/word-filter.js'].lineData[880] = 0;
  _$jscoverage['/word-filter.js'].lineData[881] = 0;
  _$jscoverage['/word-filter.js'].lineData[883] = 0;
  _$jscoverage['/word-filter.js'].lineData[884] = 0;
  _$jscoverage['/word-filter.js'].lineData[887] = 0;
  _$jscoverage['/word-filter.js'].lineData[888] = 0;
  _$jscoverage['/word-filter.js'].lineData[891] = 0;
  _$jscoverage['/word-filter.js'].lineData[892] = 0;
  _$jscoverage['/word-filter.js'].lineData[893] = 0;
  _$jscoverage['/word-filter.js'].lineData[894] = 0;
  _$jscoverage['/word-filter.js'].lineData[900] = 0;
  _$jscoverage['/word-filter.js'].lineData[901] = 0;
  _$jscoverage['/word-filter.js'].lineData[912] = 0;
  _$jscoverage['/word-filter.js'].lineData[913] = 0;
  _$jscoverage['/word-filter.js'].lineData[914] = 0;
  _$jscoverage['/word-filter.js'].lineData[917] = 0;
  _$jscoverage['/word-filter.js'].lineData[919] = 0;
  _$jscoverage['/word-filter.js'].lineData[922] = 0;
  _$jscoverage['/word-filter.js'].lineData[924] = 0;
  _$jscoverage['/word-filter.js'].lineData[925] = 0;
  _$jscoverage['/word-filter.js'].lineData[927] = 0;
  _$jscoverage['/word-filter.js'].lineData[928] = 0;
  _$jscoverage['/word-filter.js'].lineData[932] = 0;
  _$jscoverage['/word-filter.js'].lineData[934] = 0;
  _$jscoverage['/word-filter.js'].lineData[935] = 0;
  _$jscoverage['/word-filter.js'].lineData[936] = 0;
  _$jscoverage['/word-filter.js'].lineData[938] = 0;
  _$jscoverage['/word-filter.js'].lineData[939] = 0;
  _$jscoverage['/word-filter.js'].lineData[940] = 0;
  _$jscoverage['/word-filter.js'].lineData[942] = 0;
  _$jscoverage['/word-filter.js'].lineData[945] = 0;
  _$jscoverage['/word-filter.js'].lineData[946] = 0;
  _$jscoverage['/word-filter.js'].lineData[949] = 0;
  _$jscoverage['/word-filter.js'].lineData[951] = 0;
  _$jscoverage['/word-filter.js'].lineData[952] = 0;
  _$jscoverage['/word-filter.js'].lineData[958] = 0;
  _$jscoverage['/word-filter.js'].lineData[959] = 0;
  _$jscoverage['/word-filter.js'].lineData[961] = 0;
  _$jscoverage['/word-filter.js'].lineData[962] = 0;
  _$jscoverage['/word-filter.js'].lineData[963] = 0;
  _$jscoverage['/word-filter.js'].lineData[964] = 0;
  _$jscoverage['/word-filter.js'].lineData[969] = 0;
  _$jscoverage['/word-filter.js'].lineData[970] = 0;
  _$jscoverage['/word-filter.js'].lineData[971] = 0;
  _$jscoverage['/word-filter.js'].lineData[974] = 0;
  _$jscoverage['/word-filter.js'].lineData[977] = 0;
  _$jscoverage['/word-filter.js'].lineData[978] = 0;
  _$jscoverage['/word-filter.js'].lineData[982] = 0;
  _$jscoverage['/word-filter.js'].lineData[983] = 0;
  _$jscoverage['/word-filter.js'].lineData[985] = 0;
  _$jscoverage['/word-filter.js'].lineData[987] = 0;
  _$jscoverage['/word-filter.js'].lineData[992] = 0;
  _$jscoverage['/word-filter.js'].lineData[996] = 0;
  _$jscoverage['/word-filter.js'].lineData[998] = 0;
  _$jscoverage['/word-filter.js'].lineData[1013] = 0;
  _$jscoverage['/word-filter.js'].lineData[1014] = 0;
  _$jscoverage['/word-filter.js'].lineData[1015] = 0;
  _$jscoverage['/word-filter.js'].lineData[1016] = 0;
  _$jscoverage['/word-filter.js'].lineData[1017] = 0;
  _$jscoverage['/word-filter.js'].lineData[1021] = 0;
  _$jscoverage['/word-filter.js'].lineData[1022] = 0;
  _$jscoverage['/word-filter.js'].lineData[1048] = 0;
  _$jscoverage['/word-filter.js'].lineData[1049] = 0;
  _$jscoverage['/word-filter.js'].lineData[1052] = 0;
  _$jscoverage['/word-filter.js'].lineData[1053] = 0;
  _$jscoverage['/word-filter.js'].lineData[1055] = 0;
  _$jscoverage['/word-filter.js'].lineData[1056] = 0;
  _$jscoverage['/word-filter.js'].lineData[1059] = 0;
  _$jscoverage['/word-filter.js'].lineData[1060] = 0;
  _$jscoverage['/word-filter.js'].lineData[1064] = 0;
  _$jscoverage['/word-filter.js'].lineData[1072] = 0;
  _$jscoverage['/word-filter.js'].lineData[1073] = 0;
  _$jscoverage['/word-filter.js'].lineData[1078] = 0;
  _$jscoverage['/word-filter.js'].lineData[1079] = 0;
  _$jscoverage['/word-filter.js'].lineData[1085] = 0;
  _$jscoverage['/word-filter.js'].lineData[1086] = 0;
  _$jscoverage['/word-filter.js'].lineData[1090] = 0;
  _$jscoverage['/word-filter.js'].lineData[1091] = 0;
  _$jscoverage['/word-filter.js'].lineData[1105] = 0;
  _$jscoverage['/word-filter.js'].lineData[1106] = 0;
  _$jscoverage['/word-filter.js'].lineData[1116] = 0;
  _$jscoverage['/word-filter.js'].lineData[1120] = 0;
  _$jscoverage['/word-filter.js'].lineData[1122] = 0;
  _$jscoverage['/word-filter.js'].lineData[1124] = 0;
  _$jscoverage['/word-filter.js'].lineData[1128] = 0;
  _$jscoverage['/word-filter.js'].lineData[1129] = 0;
  _$jscoverage['/word-filter.js'].lineData[1136] = 0;
  _$jscoverage['/word-filter.js'].lineData[1137] = 0;
  _$jscoverage['/word-filter.js'].lineData[1140] = 0;
  _$jscoverage['/word-filter.js'].lineData[1146] = 0;
  _$jscoverage['/word-filter.js'].lineData[1165] = 0;
  _$jscoverage['/word-filter.js'].lineData[1166] = 0;
  _$jscoverage['/word-filter.js'].lineData[1171] = 0;
  _$jscoverage['/word-filter.js'].lineData[1173] = 0;
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
  _$jscoverage['/word-filter.js'].branchData['53'] = [];
  _$jscoverage['/word-filter.js'].branchData['53'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['54'] = [];
  _$jscoverage['/word-filter.js'].branchData['54'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['65'] = [];
  _$jscoverage['/word-filter.js'].branchData['65'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['73'] = [];
  _$jscoverage['/word-filter.js'].branchData['73'][1] = new BranchData();
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
  _$jscoverage['/word-filter.js'].branchData['304'] = [];
  _$jscoverage['/word-filter.js'].branchData['304'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['321'] = [];
  _$jscoverage['/word-filter.js'].branchData['321'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['324'] = [];
  _$jscoverage['/word-filter.js'].branchData['324'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['329'] = [];
  _$jscoverage['/word-filter.js'].branchData['329'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['332'] = [];
  _$jscoverage['/word-filter.js'].branchData['332'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['339'] = [];
  _$jscoverage['/word-filter.js'].branchData['339'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['347'] = [];
  _$jscoverage['/word-filter.js'].branchData['347'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['351'] = [];
  _$jscoverage['/word-filter.js'].branchData['351'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['352'] = [];
  _$jscoverage['/word-filter.js'].branchData['352'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['358'] = [];
  _$jscoverage['/word-filter.js'].branchData['358'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['368'] = [];
  _$jscoverage['/word-filter.js'].branchData['368'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['371'] = [];
  _$jscoverage['/word-filter.js'].branchData['371'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['371'][2] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['373'] = [];
  _$jscoverage['/word-filter.js'].branchData['373'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['373'][2] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['392'] = [];
  _$jscoverage['/word-filter.js'].branchData['392'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['396'] = [];
  _$jscoverage['/word-filter.js'].branchData['396'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['396'][2] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['397'] = [];
  _$jscoverage['/word-filter.js'].branchData['397'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['397'][2] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['397'][3] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['401'] = [];
  _$jscoverage['/word-filter.js'].branchData['401'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['401'][2] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['421'] = [];
  _$jscoverage['/word-filter.js'].branchData['421'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['426'] = [];
  _$jscoverage['/word-filter.js'].branchData['426'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['431'] = [];
  _$jscoverage['/word-filter.js'].branchData['431'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['435'] = [];
  _$jscoverage['/word-filter.js'].branchData['435'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['449'] = [];
  _$jscoverage['/word-filter.js'].branchData['449'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['449'][2] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['451'] = [];
  _$jscoverage['/word-filter.js'].branchData['451'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['456'] = [];
  _$jscoverage['/word-filter.js'].branchData['456'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['481'] = [];
  _$jscoverage['/word-filter.js'].branchData['481'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['486'] = [];
  _$jscoverage['/word-filter.js'].branchData['486'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['486'][2] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['492'] = [];
  _$jscoverage['/word-filter.js'].branchData['492'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['493'] = [];
  _$jscoverage['/word-filter.js'].branchData['493'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['499'] = [];
  _$jscoverage['/word-filter.js'].branchData['499'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['500'] = [];
  _$jscoverage['/word-filter.js'].branchData['500'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['501'] = [];
  _$jscoverage['/word-filter.js'].branchData['501'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['502'] = [];
  _$jscoverage['/word-filter.js'].branchData['502'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['502'][2] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['504'] = [];
  _$jscoverage['/word-filter.js'].branchData['504'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['510'] = [];
  _$jscoverage['/word-filter.js'].branchData['510'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['515'] = [];
  _$jscoverage['/word-filter.js'].branchData['515'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['524'] = [];
  _$jscoverage['/word-filter.js'].branchData['524'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['528'] = [];
  _$jscoverage['/word-filter.js'].branchData['528'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['548'] = [];
  _$jscoverage['/word-filter.js'].branchData['548'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['557'] = [];
  _$jscoverage['/word-filter.js'].branchData['557'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['560'] = [];
  _$jscoverage['/word-filter.js'].branchData['560'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['563'] = [];
  _$jscoverage['/word-filter.js'].branchData['563'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['563'][2] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['569'] = [];
  _$jscoverage['/word-filter.js'].branchData['569'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['570'] = [];
  _$jscoverage['/word-filter.js'].branchData['570'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['570'][2] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['579'] = [];
  _$jscoverage['/word-filter.js'].branchData['579'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['580'] = [];
  _$jscoverage['/word-filter.js'].branchData['580'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['583'] = [];
  _$jscoverage['/word-filter.js'].branchData['583'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['605'] = [];
  _$jscoverage['/word-filter.js'].branchData['605'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['612'] = [];
  _$jscoverage['/word-filter.js'].branchData['612'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['620'] = [];
  _$jscoverage['/word-filter.js'].branchData['620'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['621'] = [];
  _$jscoverage['/word-filter.js'].branchData['621'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['625'] = [];
  _$jscoverage['/word-filter.js'].branchData['625'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['635'] = [];
  _$jscoverage['/word-filter.js'].branchData['635'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['635'][2] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['638'] = [];
  _$jscoverage['/word-filter.js'].branchData['638'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['638'][2] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['638'][3] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['639'] = [];
  _$jscoverage['/word-filter.js'].branchData['639'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['644'] = [];
  _$jscoverage['/word-filter.js'].branchData['644'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['645'] = [];
  _$jscoverage['/word-filter.js'].branchData['645'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['645'][2] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['655'] = [];
  _$jscoverage['/word-filter.js'].branchData['655'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['656'] = [];
  _$jscoverage['/word-filter.js'].branchData['656'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['656'][2] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['669'] = [];
  _$jscoverage['/word-filter.js'].branchData['669'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['696'] = [];
  _$jscoverage['/word-filter.js'].branchData['696'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['740'] = [];
  _$jscoverage['/word-filter.js'].branchData['740'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['745'] = [];
  _$jscoverage['/word-filter.js'].branchData['745'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['749'] = [];
  _$jscoverage['/word-filter.js'].branchData['749'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['757'] = [];
  _$jscoverage['/word-filter.js'].branchData['757'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['760'] = [];
  _$jscoverage['/word-filter.js'].branchData['760'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['765'] = [];
  _$jscoverage['/word-filter.js'].branchData['765'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['767'] = [];
  _$jscoverage['/word-filter.js'].branchData['767'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['773'] = [];
  _$jscoverage['/word-filter.js'].branchData['773'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['773'][2] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['774'] = [];
  _$jscoverage['/word-filter.js'].branchData['774'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['778'] = [];
  _$jscoverage['/word-filter.js'].branchData['778'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['780'] = [];
  _$jscoverage['/word-filter.js'].branchData['780'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['790'] = [];
  _$jscoverage['/word-filter.js'].branchData['790'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['800'] = [];
  _$jscoverage['/word-filter.js'].branchData['800'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['804'] = [];
  _$jscoverage['/word-filter.js'].branchData['804'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['807'] = [];
  _$jscoverage['/word-filter.js'].branchData['807'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['816'] = [];
  _$jscoverage['/word-filter.js'].branchData['816'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['822'] = [];
  _$jscoverage['/word-filter.js'].branchData['822'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['826'] = [];
  _$jscoverage['/word-filter.js'].branchData['826'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['829'] = [];
  _$jscoverage['/word-filter.js'].branchData['829'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['832'] = [];
  _$jscoverage['/word-filter.js'].branchData['832'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['845'] = [];
  _$jscoverage['/word-filter.js'].branchData['845'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['847'] = [];
  _$jscoverage['/word-filter.js'].branchData['847'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['850'] = [];
  _$jscoverage['/word-filter.js'].branchData['850'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['862'] = [];
  _$jscoverage['/word-filter.js'].branchData['862'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['864'] = [];
  _$jscoverage['/word-filter.js'].branchData['864'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['864'][2] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['866'] = [];
  _$jscoverage['/word-filter.js'].branchData['866'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['867'] = [];
  _$jscoverage['/word-filter.js'].branchData['867'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['880'] = [];
  _$jscoverage['/word-filter.js'].branchData['880'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['880'][2] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['887'] = [];
  _$jscoverage['/word-filter.js'].branchData['887'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['900'] = [];
  _$jscoverage['/word-filter.js'].branchData['900'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['912'] = [];
  _$jscoverage['/word-filter.js'].branchData['912'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['922'] = [];
  _$jscoverage['/word-filter.js'].branchData['922'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['927'] = [];
  _$jscoverage['/word-filter.js'].branchData['927'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['932'] = [];
  _$jscoverage['/word-filter.js'].branchData['932'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['934'] = [];
  _$jscoverage['/word-filter.js'].branchData['934'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['935'] = [];
  _$jscoverage['/word-filter.js'].branchData['935'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['935'][2] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['938'] = [];
  _$jscoverage['/word-filter.js'].branchData['938'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['945'] = [];
  _$jscoverage['/word-filter.js'].branchData['945'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['947'] = [];
  _$jscoverage['/word-filter.js'].branchData['947'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['948'] = [];
  _$jscoverage['/word-filter.js'].branchData['948'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['958'] = [];
  _$jscoverage['/word-filter.js'].branchData['958'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['962'] = [];
  _$jscoverage['/word-filter.js'].branchData['962'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['969'] = [];
  _$jscoverage['/word-filter.js'].branchData['969'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['971'] = [];
  _$jscoverage['/word-filter.js'].branchData['971'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['971'][2] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['974'] = [];
  _$jscoverage['/word-filter.js'].branchData['974'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['974'][2] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['975'] = [];
  _$jscoverage['/word-filter.js'].branchData['975'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['977'] = [];
  _$jscoverage['/word-filter.js'].branchData['977'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['983'] = [];
  _$jscoverage['/word-filter.js'].branchData['983'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['996'] = [];
  _$jscoverage['/word-filter.js'].branchData['996'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['1014'] = [];
  _$jscoverage['/word-filter.js'].branchData['1014'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['1016'] = [];
  _$jscoverage['/word-filter.js'].branchData['1016'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['1016'][2] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['1021'] = [];
  _$jscoverage['/word-filter.js'].branchData['1021'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['1048'] = [];
  _$jscoverage['/word-filter.js'].branchData['1048'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['1052'] = [];
  _$jscoverage['/word-filter.js'].branchData['1052'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['1055'] = [];
  _$jscoverage['/word-filter.js'].branchData['1055'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['1059'] = [];
  _$jscoverage['/word-filter.js'].branchData['1059'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['1072'] = [];
  _$jscoverage['/word-filter.js'].branchData['1072'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['1078'] = [];
  _$jscoverage['/word-filter.js'].branchData['1078'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['1085'] = [];
  _$jscoverage['/word-filter.js'].branchData['1085'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['1090'] = [];
  _$jscoverage['/word-filter.js'].branchData['1090'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['1120'] = [];
  _$jscoverage['/word-filter.js'].branchData['1120'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['1122'] = [];
  _$jscoverage['/word-filter.js'].branchData['1122'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['1122'][2] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['1123'] = [];
  _$jscoverage['/word-filter.js'].branchData['1123'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['1128'] = [];
  _$jscoverage['/word-filter.js'].branchData['1128'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['1132'] = [];
  _$jscoverage['/word-filter.js'].branchData['1132'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['1133'] = [];
  _$jscoverage['/word-filter.js'].branchData['1133'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['1136'] = [];
  _$jscoverage['/word-filter.js'].branchData['1136'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['1165'] = [];
  _$jscoverage['/word-filter.js'].branchData['1165'][1] = new BranchData();
}
_$jscoverage['/word-filter.js'].branchData['1165'][1].init(807, 8, 'UA.gecko');
function visit191_1165_1(result) {
  _$jscoverage['/word-filter.js'].branchData['1165'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['1136'][1].init(565, 45, 'imgSrc && (img.setAttribute("src", imgSrc))');
function visit190_1136_1(result) {
  _$jscoverage['/word-filter.js'].branchData['1136'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['1133'][1].init(414, 29, 'imgSrcInfo && imgSrcInfo[1]');
function visit189_1133_1(result) {
  _$jscoverage['/word-filter.js'].branchData['1133'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['1132'][1].init(284, 90, 'previousComment && previousComment.toHtml().match(/<v:imagedata[^>]*o:href=[\'"](.*?)[\'"]/)');
function visit188_1132_1(result) {
  _$jscoverage['/word-filter.js'].branchData['1132'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['1128'][1].init(726, 21, 'UA.gecko && imageInfo');
function visit187_1128_1(result) {
  _$jscoverage['/word-filter.js'].branchData['1128'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['1123'][1].init(96, 60, 'listSymbol && listSymbol.match(/>(?:[(]?)([^\\s]+?)([.)]?)</)');
function visit186_1123_1(result) {
  _$jscoverage['/word-filter.js'].branchData['1123'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['1122'][2].init(138, 17, 'imageInfo && \'l.\'');
function visit185_1122_2(result) {
  _$jscoverage['/word-filter.js'].branchData['1122'][2].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['1122'][1].init(119, 38, 'listInfo[1] || (imageInfo && \'l.\')');
function visit184_1122_1(result) {
  _$jscoverage['/word-filter.js'].branchData['1122'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['1120'][1].init(240, 8, 'listInfo');
function visit183_1120_1(result) {
  _$jscoverage['/word-filter.js'].branchData['1120'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['1090'][1].init(26, 37, 'element.nodeName in dtd.$tableContent');
function visit182_1090_1(result) {
  _$jscoverage['/word-filter.js'].branchData['1090'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['1085'][1].init(26, 37, 'element.nodeName in dtd.$tableContent');
function visit181_1085_1(result) {
  _$jscoverage['/word-filter.js'].branchData['1085'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['1078'][1].init(38, 54, 'element.nodeName in {\n  table: 1, \n  td: 1, \n  th: 1, \n  img: 1}');
function visit180_1078_1(result) {
  _$jscoverage['/word-filter.js'].branchData['1078'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['1072'][1].init(38, 25, 'element.nodeName == \'img\'');
function visit179_1072_1(result) {
  _$jscoverage['/word-filter.js'].branchData['1072'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['1059'][1].init(569, 38, 'value && !emptyMarginRegex.test(value)');
function visit178_1059_1(result) {
  _$jscoverage['/word-filter.js'].branchData['1059'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['1055'][1].init(419, 23, 'name != indentStyleName');
function visit177_1055_1(result) {
  _$jscoverage['/word-filter.js'].branchData['1055'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['1052'][1].init(195, 16, 'name == \'margin\'');
function visit176_1052_1(result) {
  _$jscoverage['/word-filter.js'].branchData['1052'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['1048'][1].init(34, 36, 'element.nodeName in {\n  p: 1, \n  div: 1}');
function visit175_1048_1(result) {
  _$jscoverage['/word-filter.js'].branchData['1048'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['1021'][1].init(26, 27, 'getAncestor(element, /h\\d/)');
function visit174_1021_1(result) {
  _$jscoverage['/word-filter.js'].branchData['1021'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['1016'][2].init(228, 40, 'href && href.match(/file:\\/\\/\\/[\\S]+#/i)');
function visit173_1016_2(result) {
  _$jscoverage['/word-filter.js'].branchData['1016'][2].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['1016'][1].init(215, 53, 'UA.webkit && href && href.match(/file:\\/\\/\\/[\\S]+#/i)');
function visit172_1016_1(result) {
  _$jscoverage['/word-filter.js'].branchData['1016'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['1014'][1].init(57, 70, '!(href = element.getAttribute("href")) && element.getAttribute("name")');
function visit171_1014_1(result) {
  _$jscoverage['/word-filter.js'].branchData['1014'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['996'][1].init(2196, 9, 'styleText');
function visit170_996_1(result) {
  _$jscoverage['/word-filter.js'].branchData['996'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['983'][1].init(468, 120, 'ancestor && (/ mso-hide:\\s*all|display:\\s*none /).test(ancestor.getAttribute("style"))');
function visit169_983_1(result) {
  _$jscoverage['/word-filter.js'].branchData['983'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['977'][1].init(425, 8, 'listType');
function visit168_977_1(result) {
  _$jscoverage['/word-filter.js'].branchData['977'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['975'][1].init(112, 60, 'listSymbol && listSymbol.match(/^(?:[(]?)([^\\s]+?)([.)]?)$/)');
function visit167_975_1(result) {
  _$jscoverage['/word-filter.js'].branchData['975'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['974'][2].init(256, 32, 'listSymbolNode.nodeValue || \'l.\'');
function visit166_974_2(result) {
  _$jscoverage['/word-filter.js'].branchData['974'][2].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['974'][1].init(236, 54, 'listSymbolNode && (listSymbolNode.nodeValue || \'l.\')');
function visit165_974_1(result) {
  _$jscoverage['/word-filter.js'].branchData['974'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['971'][2].init(55, 22, 'node.nodeName == \'img\'');
function visit164_971_2(result) {
  _$jscoverage['/word-filter.js'].branchData['971'][2].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['971'][1].init(37, 40, 'node.nodeValue || node.nodeName == \'img\'');
function visit163_971_1(result) {
  _$jscoverage['/word-filter.js'].branchData['971'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['969'][1].init(620, 30, 'isListBulletIndicator(element)');
function visit162_969_1(result) {
  _$jscoverage['/word-filter.js'].branchData['969'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['962'][1].init(280, 33, 'containsNothingButSpaces(element)');
function visit161_962_1(result) {
  _$jscoverage['/word-filter.js'].branchData['962'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['958'][1].init(101, 41, 'isListBulletIndicator(element.parentNode)');
function visit160_958_1(result) {
  _$jscoverage['/word-filter.js'].branchData['958'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['948'][1].init(59, 8, 'size < 3');
function visit159_948_1(result) {
  _$jscoverage['/word-filter.js'].branchData['948'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['947'][1].init(48, 8, 'size > 3');
function visit158_947_1(result) {
  _$jscoverage['/word-filter.js'].branchData['947'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['945'][1].init(920, 4, 'size');
function visit157_945_1(result) {
  _$jscoverage['/word-filter.js'].branchData['945'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['938'][1].init(461, 28, 'element.getAttribute("face")');
function visit156_938_1(result) {
  _$jscoverage['/word-filter.js'].branchData['938'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['935'][2].init(30, 42, 'element.getAttribute("color") != \'#000000\'');
function visit155_935_2(result) {
  _$jscoverage['/word-filter.js'].branchData['935'][2].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['935'][1].init(30, 109, 'element.getAttribute("color") != \'#000000\' && (styleText += \'color:\' + element.getAttribute("color") + \';\')');
function visit154_935_1(result) {
  _$jscoverage['/word-filter.js'].branchData['935'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['934'][1].init(169, 29, 'element.getAttribute("color")');
function visit153_934_1(result) {
  _$jscoverage['/word-filter.js'].branchData['934'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['932'][1].init(38, 15, 'styleText || \'\'');
function visit152_932_1(result) {
  _$jscoverage['/word-filter.js'].branchData['932'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['927'][1].init(198, 40, 'styleText && addStyle(parent, styleText)');
function visit151_927_1(result) {
  _$jscoverage['/word-filter.js'].branchData['927'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['922'][1].init(455, 21, '\'font\' == parent.name');
function visit150_922_1(result) {
  _$jscoverage['/word-filter.js'].branchData['922'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['912'][1].init(103, 41, 'isListBulletIndicator(element.parentNode)');
function visit149_912_1(result) {
  _$jscoverage['/word-filter.js'].branchData['912'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['900'][1].init(84, 29, 'getAncestor(element, \'thead\')');
function visit148_900_1(result) {
  _$jscoverage['/word-filter.js'].branchData['900'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['887'][1].init(255, 29, 'element.getAttribute("style")');
function visit147_887_1(result) {
  _$jscoverage['/word-filter.js'].branchData['887'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['880'][2].init(398, 31, 'singleChild.nodeName == \'table\'');
function visit146_880_2(result) {
  _$jscoverage['/word-filter.js'].branchData['880'][2].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['880'][1].init(383, 46, 'singleChild && singleChild.nodeName == \'table\'');
function visit145_880_1(result) {
  _$jscoverage['/word-filter.js'].branchData['880'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['867'][1].init(312, 85, '!bullet.getAttribute("style") && (bullet.setAttribute("style", \'mso-list: Ignore;\'))');
function visit144_867_1(result) {
  _$jscoverage['/word-filter.js'].branchData['867'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['866'][1].init(250, 35, 'bulletText && bulletText.parentNode');
function visit143_866_1(result) {
  _$jscoverage['/word-filter.js'].branchData['866'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['864'][2].init(37, 18, 'node.nodeType == 3');
function visit142_864_2(result) {
  _$jscoverage['/word-filter.js'].branchData['864'][2].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['864'][1].init(37, 64, 'node.nodeType == 3 && !containsNothingButSpaces(node.parentNode)');
function visit141_864_1(result) {
  _$jscoverage['/word-filter.js'].branchData['864'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['862'][1].init(261, 54, '/MsoListParagraph/.exec(element.getAttribute(\'class\'))');
function visit140_862_1(result) {
  _$jscoverage['/word-filter.js'].branchData['862'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['850'][1].init(307, 39, 'style && addStyle(element, style, true)');
function visit139_850_1(result) {
  _$jscoverage['/word-filter.js'].branchData['850'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['847'][1].init(102, 24, 'typeof style == \'object\'');
function visit138_847_1(result) {
  _$jscoverage['/word-filter.js'].branchData['847'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['845'][1].init(245, 13, 'name in rules');
function visit137_845_1(result) {
  _$jscoverage['/word-filter.js'].branchData['845'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['832'][1].init(663, 9, 'className');
function visit136_832_1(result) {
  _$jscoverage['/word-filter.js'].branchData['832'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['829'][1].init(462, 17, '!rules[tagName]');
function visit135_829_1(result) {
  _$jscoverage['/word-filter.js'].branchData['829'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['826'][1].init(316, 28, 'className.match(/MsoNormal/)');
function visit134_826_1(result) {
  _$jscoverage['/word-filter.js'].branchData['826'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['822'][1].init(60, 14, 'tagName || \'*\'');
function visit133_822_1(result) {
  _$jscoverage['/word-filter.js'].branchData['822'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['816'][1].init(193, 10, 'i < length');
function visit132_816_1(result) {
  _$jscoverage['/word-filter.js'].branchData['816'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['807'][1].init(418, 12, 'styleDefText');
function visit131_807_1(result) {
  _$jscoverage['/word-filter.js'].branchData['807'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['804'][1].init(180, 39, 'styleDefSection && styleDefSection[1]');
function visit130_804_1(result) {
  _$jscoverage['/word-filter.js'].branchData['804'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['800'][1].init(26, 8, 'UA.gecko');
function visit129_800_1(result) {
  _$jscoverage['/word-filter.js'].branchData['800'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['790'][1].init(2164, 25, 'tagName in listDtdParents');
function visit128_790_1(result) {
  _$jscoverage['/word-filter.js'].branchData['790'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['780'][1].init(106, 4, 'href');
function visit127_780_1(result) {
  _$jscoverage['/word-filter.js'].branchData['780'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['778'][1].init(145, 24, 'tagName == \'v:imagedata\'');
function visit126_778_1(result) {
  _$jscoverage['/word-filter.js'].branchData['778'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['774'][1].init(54, 27, 'tagName.indexOf(\'ke\') == -1');
function visit125_774_1(result) {
  _$jscoverage['/word-filter.js'].branchData['774'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['773'][2].init(1410, 26, 'tagName.indexOf(\':\') != -1');
function visit124_773_2(result) {
  _$jscoverage['/word-filter.js'].branchData['773'][2].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['773'][1].init(1410, 82, 'tagName.indexOf(\':\') != -1 && tagName.indexOf(\'ke\') == -1');
function visit123_773_1(result) {
  _$jscoverage['/word-filter.js'].branchData['773'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['767'][1].init(81, 33, 'containsNothingButSpaces(element)');
function visit122_767_1(result) {
  _$jscoverage['/word-filter.js'].branchData['767'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['765'][1].init(1001, 22, 'tagName in dtd.$inline');
function visit121_765_1(result) {
  _$jscoverage['/word-filter.js'].branchData['765'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['760'][1].init(146, 24, 'resolveListItem(element)');
function visit120_760_1(result) {
  _$jscoverage['/word-filter.js'].branchData['760'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['757'][1].init(606, 20, 'tagName.match(/h\\d/)');
function visit119_757_1(result) {
  _$jscoverage['/word-filter.js'].branchData['757'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['749'][1].init(217, 53, 'tagName in blockLike && element.getAttribute("style")');
function visit118_749_1(result) {
  _$jscoverage['/word-filter.js'].branchData['749'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['745'][1].init(36, 22, 'element.nodeName || \'\'');
function visit117_745_1(result) {
  _$jscoverage['/word-filter.js'].branchData['745'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['740'][1].init(142, 59, 'UA.gecko && (applyStyleFilter = filters.applyStyleFilter)');
function visit116_740_1(result) {
  _$jscoverage['/word-filter.js'].branchData['740'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['696'][1].init(166, 9, 'i < count');
function visit115_696_1(result) {
  _$jscoverage['/word-filter.js'].branchData['696'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['669'][1].init(2653, 34, '!element.getAttribute("ke:indent")');
function visit114_669_1(result) {
  _$jscoverage['/word-filter.js'].branchData['669'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['656'][2].init(38, 25, 'listId !== previousListId');
function visit113_656_2(result) {
  _$jscoverage['/word-filter.js'].branchData['656'][2].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['656'][1].init(38, 68, 'listId !== previousListId && (element.setAttribute(\'ke:reset\', 1))');
function visit112_656_1(result) {
  _$jscoverage['/word-filter.js'].branchData['656'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['655'][1].init(249, 11, 'indent == 1');
function visit111_655_1(result) {
  _$jscoverage['/word-filter.js'].branchData['655'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['645'][2].init(34, 101, 'listBaseIndent && (Math.ceil(margin / listBaseIndent) + 1)');
function visit110_645_2(result) {
  _$jscoverage['/word-filter.js'].branchData['645'][2].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['645'][1].init(72, 106, 'listBaseIndent && (Math.ceil(margin / listBaseIndent) + 1) || 1');
function visit109_645_1(result) {
  _$jscoverage['/word-filter.js'].branchData['645'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['644'][1].init(739, 14, 'listBaseIndent');
function visit108_644_1(result) {
  _$jscoverage['/word-filter.js'].branchData['644'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['639'][1].init(71, 31, 'margin > previousListItemMargin');
function visit107_639_1(result) {
  _$jscoverage['/word-filter.js'].branchData['639'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['638'][3].init(405, 31, 'previousListItemMargin !== null');
function visit106_638_3(result) {
  _$jscoverage['/word-filter.js'].branchData['638'][3].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['638'][2].init(405, 103, 'previousListItemMargin !== null && margin > previousListItemMargin');
function visit105_638_2(result) {
  _$jscoverage['/word-filter.js'].branchData['638'][2].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['638'][1].init(386, 122, '!listBaseIndent && previousListItemMargin !== null && margin > previousListItemMargin');
function visit104_638_1(result) {
  _$jscoverage['/word-filter.js'].branchData['638'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['635'][2].init(36, 27, 'values[1] || values[0]');
function visit103_635_2(result) {
  _$jscoverage['/word-filter.js'].branchData['635'][2].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['635'][1].init(193, 42, 'values[3] || values[1] || values[0]');
function visit102_635_1(result) {
  _$jscoverage['/word-filter.js'].branchData['635'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['625'][1].init(70, 29, 'element.getAttribute("style")');
function visit101_625_1(result) {
  _$jscoverage['/word-filter.js'].branchData['625'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['621'][1].init(83, 70, 'listMarker.length && (listMarker = listMarker[0])');
function visit100_621_1(result) {
  _$jscoverage['/word-filter.js'].branchData['621'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['620'][1].init(105, 154, '(listMarker = removeAnyChildWithName(element, \'ke:listbullet\')) && listMarker.length && (listMarker = listMarker[0])');
function visit99_620_1(result) {
  _$jscoverage['/word-filter.js'].branchData['620'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['612'][1].init(48, 91, '(text = onlyChild(element)) && (/^(:?\\s|&nbsp;)+$/).test(text.nodeValue)');
function visit98_612_1(result) {
  _$jscoverage['/word-filter.js'].branchData['612'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['605'][1].init(78, 40, '/mso-list\\s*:\\s*Ignore/i.test(styleText)');
function visit97_605_1(result) {
  _$jscoverage['/word-filter.js'].branchData['605'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['583'][1].init(90, 5, 'style');
function visit96_583_1(result) {
  _$jscoverage['/word-filter.js'].branchData['583'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['580'][1].init(26, 9, 'i < count');
function visit95_580_1(result) {
  _$jscoverage['/word-filter.js'].branchData['580'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['579'][1].init(957, 10, 'mergeStyle');
function visit94_579_1(result) {
  _$jscoverage['/word-filter.js'].branchData['579'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['570'][2].init(22, 24, 'match[1] == mergeStyle');
function visit93_570_2(result) {
  _$jscoverage['/word-filter.js'].branchData['570'][2].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['570'][1].init(22, 39, 'match[1] == mergeStyle || !mergeStyle');
function visit92_570_1(result) {
  _$jscoverage['/word-filter.js'].branchData['570'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['569'][1].init(292, 5, 'match');
function visit91_569_1(result) {
  _$jscoverage['/word-filter.js'].branchData['569'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['563'][2].init(87, 44, 'Number(child.getAttribute("value")) == i + 1');
function visit90_563_2(result) {
  _$jscoverage['/word-filter.js'].branchData['563'][2].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['563'][1].init(56, 75, 'child.getAttribute("value") && Number(child.getAttribute("value")) == i + 1');
function visit89_563_1(result) {
  _$jscoverage['/word-filter.js'].branchData['563'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['560'][1].init(379, 9, 'i < count');
function visit88_560_1(result) {
  _$jscoverage['/word-filter.js'].branchData['560'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['557'][1].init(281, 48, 'styleTypeRegexp.exec(list.getAttribute("style"))');
function visit87_557_1(result) {
  _$jscoverage['/word-filter.js'].branchData['557'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['548'][1].init(25, 21, 'list.childNodes || []');
function visit86_548_1(result) {
  _$jscoverage['/word-filter.js'].branchData['548'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['528'][1].init(2460, 16, 'i < rules.length');
function visit85_528_1(result) {
  _$jscoverage['/word-filter.js'].branchData['528'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['524'][1].init(1902, 41, '!whitelist && rules.push([name, value])');
function visit84_524_1(result) {
  _$jscoverage['/word-filter.js'].branchData['524'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['515'][1].init(764, 27, 'typeof newValue == \'string\'');
function visit83_515_1(result) {
  _$jscoverage['/word-filter.js'].branchData['515'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['510'][1].init(523, 25, 'newValue && newValue.push');
function visit82_510_1(result) {
  _$jscoverage['/word-filter.js'].branchData['510'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['504'][1].init(189, 29, 'typeof newValue == \'function\'');
function visit81_504_1(result) {
  _$jscoverage['/word-filter.js'].branchData['504'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['502'][2].init(125, 17, 'newValue || value');
function visit80_502_2(result) {
  _$jscoverage['/word-filter.js'].branchData['502'][2].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['502'][1].init(99, 45, 'whitelist && (newValue = newValue || value)');
function visit79_502_1(result) {
  _$jscoverage['/word-filter.js'].branchData['502'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['501'][1].init(45, 15, 'newName || name');
function visit78_501_1(result) {
  _$jscoverage['/word-filter.js'].branchData['501'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['500'][1].init(65, 42, '!valuePattern || value.match(valuePattern)');
function visit77_500_1(result) {
  _$jscoverage['/word-filter.js'].branchData['500'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['499'][1].init(294, 110, 'name.match(namePattern) && (!valuePattern || value.match(valuePattern))');
function visit76_499_1(result) {
  _$jscoverage['/word-filter.js'].branchData['499'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['493'][1].init(34, 11, 'styles[i]');
function visit75_493_1(result) {
  _$jscoverage['/word-filter.js'].branchData['493'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['492'][1].init(348, 17, 'i < styles.length');
function visit74_492_1(result) {
  _$jscoverage['/word-filter.js'].branchData['492'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['486'][2].init(78, 21, 'name == \'font-family\'');
function visit73_486_2(result) {
  _$jscoverage['/word-filter.js'].branchData['486'][2].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['486'][1].init(78, 63, 'name == \'font-family\' && (value = value.replace(/["\']/g, \'\'))');
function visit72_486_1(result) {
  _$jscoverage['/word-filter.js'].branchData['486'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['481'][1].init(-1, 15, 'styleText || \'\'');
function visit71_481_1(result) {
  _$jscoverage['/word-filter.js'].branchData['481'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['456'][1].init(7698, 22, 'i < openedLists.length');
function visit70_456_1(result) {
  _$jscoverage['/word-filter.js'].branchData['456'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['451'][1].init(6797, 4, 'list');
function visit69_451_1(result) {
  _$jscoverage['/word-filter.js'].branchData['451'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['449'][2].init(6679, 19, 'child.nodeType == 3');
function visit68_449_2(result) {
  _$jscoverage['/word-filter.js'].branchData['449'][2].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['449'][1].init(6679, 47, 'child.nodeType == 3 && !S.trim(child.nodeValue)');
function visit67_449_1(result) {
  _$jscoverage['/word-filter.js'].branchData['449'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['435'][1].init(242, 38, 'diff-- && (parent = list.parentNode)');
function visit66_435_1(result) {
  _$jscoverage['/word-filter.js'].branchData['435'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['431'][1].init(325, 27, 'listItemIndent < lastIndent');
function visit65_431_1(result) {
  _$jscoverage['/word-filter.js'].branchData['431'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['426'][1].init(30, 27, 'listItemIndent > lastIndent');
function visit64_426_1(result) {
  _$jscoverage['/word-filter.js'].branchData['426'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['421'][1].init(5205, 5, '!list');
function visit63_421_1(result) {
  _$jscoverage['/word-filter.js'].branchData['421'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['401'][2].init(4257, 16, 'listType == \'ol\'');
function visit62_401_2(result) {
  _$jscoverage['/word-filter.js'].branchData['401'][2].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['401'][1].init(4257, 26, 'listType == \'ol\' && bullet');
function visit61_401_1(result) {
  _$jscoverage['/word-filter.js'].branchData['401'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['397'][3].init(4058, 16, 'listType == \'ol\'');
function visit60_397_3(result) {
  _$jscoverage['/word-filter.js'].branchData['397'][3].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['397'][2].init(4039, 58, 'listStyleType != (listType == \'ol\' ? \'decimal\' : \'disc\')');
function visit59_397_2(result) {
  _$jscoverage['/word-filter.js'].branchData['397'][2].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['397'][1].init(4022, 75, 'listStyleType && listStyleType != (listType == \'ol\' ? \'decimal\' : \'disc\')');
function visit58_397_1(result) {
  _$jscoverage['/word-filter.js'].branchData['397'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['396'][2].init(3956, 16, 'listType == \'ol\'');
function visit57_396_2(result) {
  _$jscoverage['/word-filter.js'].branchData['396'][2].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['396'][1].init(3937, 58, 'listStyleType || (listType == \'ol\' ? \'decimal\' : \'disc\')');
function visit56_396_1(result) {
  _$jscoverage['/word-filter.js'].branchData['396'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['392'][1].init(2278, 53, '!listType && (listType = bullet[2] ? \'ol\' : \'ul\')');
function visit55_392_1(result) {
  _$jscoverage['/word-filter.js'].branchData['392'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['373'][2].init(195, 17, 'num < itemNumeric');
function visit54_373_2(result) {
  _$jscoverage['/word-filter.js'].branchData['373'][2].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['373'][1].init(179, 33, '!itemNumeric || num < itemNumeric');
function visit53_373_1(result) {
  _$jscoverage['/word-filter.js'].branchData['373'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['371'][2].init(231, 12, 'type == \'ol\'');
function visit52_371_2(result) {
  _$jscoverage['/word-filter.js'].branchData['371'][2].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['371'][1].init(231, 45, 'type == \'ol\' && (/alpha|roman/).test(style)');
function visit51_371_1(result) {
  _$jscoverage['/word-filter.js'].branchData['371'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['368'][1].init(44, 53, 'listMarkerPatterns[type][style].test(bullet[1])');
function visit50_368_1(result) {
  _$jscoverage['/word-filter.js'].branchData['368'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['358'][1].init(219, 131, 'previousListType && listMarkerPatterns[previousListType][previousListStyleType].test(bullet[1])');
function visit49_358_1(result) {
  _$jscoverage['/word-filter.js'].branchData['358'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['352'][1].init(37, 44, 'listItem.getAttribute(\'ke:listtype\') || \'ol\'');
function visit48_352_1(result) {
  _$jscoverage['/word-filter.js'].branchData['352'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['351'][1].init(1255, 7, '!bullet');
function visit47_351_1(result) {
  _$jscoverage['/word-filter.js'].branchData['351'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['347'][1].init(1053, 28, 'listItemIndent != lastIndent');
function visit46_347_1(result) {
  _$jscoverage['/word-filter.js'].branchData['347'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['339'][1].init(561, 80, 'listItem.getAttribute(\'ke:reset\') && (list = lastIndent = lastListItem = null)');
function visit45_339_1(result) {
  _$jscoverage['/word-filter.js'].branchData['339'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['332'][1].init(336, 35, 'listItem.getAttribute(\'ke:ignored\')');
function visit44_332_1(result) {
  _$jscoverage['/word-filter.js'].branchData['332'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['329'][1].init(187, 52, 'bullet && bullet.match(/^(?:[(]?)([^\\s]+?)([.)]?)$/)');
function visit43_329_1(result) {
  _$jscoverage['/word-filter.js'].branchData['329'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['324'][1].init(64, 25, '\'ke:li\' == child.nodeName');
function visit42_324_1(result) {
  _$jscoverage['/word-filter.js'].branchData['324'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['321'][1].init(745, 19, 'i < children.length');
function visit41_321_1(result) {
  _$jscoverage['/word-filter.js'].branchData['321'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['304'][1].init(29, 24, 'element.childNodes || []');
function visit40_304_1(result) {
  _$jscoverage['/word-filter.js'].branchData['304'][1].ranCondition(result);
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
}_$jscoverage['/word-filter.js'].branchData['73'][1].init(14, 3, 'str');
function visit4_73_1(result) {
  _$jscoverage['/word-filter.js'].branchData['73'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['65'][1].init(107, 14, 'str.length > 0');
function visit3_65_1(result) {
  _$jscoverage['/word-filter.js'].branchData['65'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['54'][1].init(55, 24, 'str.substr(0, k) == j[1]');
function visit2_54_1(result) {
  _$jscoverage['/word-filter.js'].branchData['54'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['53'][1].init(104, 5, 'i < l');
function visit1_53_1(result) {
  _$jscoverage['/word-filter.js'].branchData['53'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].lineData[5]++;
KISSY.add("editor/plugin/word-filter", function(S, HtmlParser) {
  _$jscoverage['/word-filter.js'].functionData[0]++;
  _$jscoverage['/word-filter.js'].lineData[6]++;
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
  _$jscoverage['/word-filter.js'].lineData[50]++;
  function fromRoman(str) {
    _$jscoverage['/word-filter.js'].functionData[1]++;
    _$jscoverage['/word-filter.js'].lineData[51]++;
    str = str.toUpperCase();
    _$jscoverage['/word-filter.js'].lineData[52]++;
    var l = romans.length, retVal = 0;
    _$jscoverage['/word-filter.js'].lineData[53]++;
    for (var i = 0; visit1_53_1(i < l); ++i) {
      _$jscoverage['/word-filter.js'].lineData[54]++;
      for (var j = romans[i], k = j[1].length; visit2_54_1(str.substr(0, k) == j[1]); str = str.substr(k)) {
        _$jscoverage['/word-filter.js'].lineData[55]++;
        retVal += j[0];
      }
    }
    _$jscoverage['/word-filter.js'].lineData[58]++;
    return retVal;
  }
  _$jscoverage['/word-filter.js'].lineData[62]++;
  function fromAlphabet(str) {
    _$jscoverage['/word-filter.js'].functionData[2]++;
    _$jscoverage['/word-filter.js'].lineData[63]++;
    str = str.toUpperCase();
    _$jscoverage['/word-filter.js'].lineData[64]++;
    var l = alphabets.length, retVal = 1;
    _$jscoverage['/word-filter.js'].lineData[65]++;
    for (var x = 1; visit3_65_1(str.length > 0); x *= l) {
      _$jscoverage['/word-filter.js'].lineData[66]++;
      retVal += alphabets.indexOf(str.charAt(str.length - 1)) * x;
      _$jscoverage['/word-filter.js'].lineData[67]++;
      str = str.substr(0, str.length - 1);
    }
    _$jscoverage['/word-filter.js'].lineData[69]++;
    return retVal;
  }
  _$jscoverage['/word-filter.js'].lineData[72]++;
  function setStyle(element, str) {
    _$jscoverage['/word-filter.js'].functionData[3]++;
    _$jscoverage['/word-filter.js'].lineData[73]++;
    if (visit4_73_1(str)) {
      _$jscoverage['/word-filter.js'].lineData[74]++;
      element.setAttribute("style", str);
    } else {
      _$jscoverage['/word-filter.js'].lineData[76]++;
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
  _$jscoverage['/word-filter.js'].lineData[304]++;
  var children = visit40_304_1(element.childNodes || []), child, listItem, listItemIndent, lastIndent, lastListItem, list, openedLists = [], previousListStyleType, previousListType;
  _$jscoverage['/word-filter.js'].lineData[316]++;
  var bullet, listType, listStyleType, itemNumeric;
  _$jscoverage['/word-filter.js'].lineData[321]++;
  for (var i = 0; visit41_321_1(i < children.length); i++) {
    _$jscoverage['/word-filter.js'].lineData[322]++;
    child = children[i];
    _$jscoverage['/word-filter.js'].lineData[324]++;
    if (visit42_324_1('ke:li' == child.nodeName)) {
      _$jscoverage['/word-filter.js'].lineData[325]++;
      child.setTagName('li');
      _$jscoverage['/word-filter.js'].lineData[326]++;
      listItem = child;
      _$jscoverage['/word-filter.js'].lineData[328]++;
      bullet = listItem.getAttribute('ke:listsymbol');
      _$jscoverage['/word-filter.js'].lineData[329]++;
      bullet = visit43_329_1(bullet && bullet.match(/^(?:[(]?)([^\s]+?)([.)]?)$/));
      _$jscoverage['/word-filter.js'].lineData[330]++;
      listType = listStyleType = itemNumeric = null;
      _$jscoverage['/word-filter.js'].lineData[332]++;
      if (visit44_332_1(listItem.getAttribute('ke:ignored'))) {
        _$jscoverage['/word-filter.js'].lineData[333]++;
        children.splice(i--, 1);
        _$jscoverage['/word-filter.js'].lineData[334]++;
        continue;
      }
      _$jscoverage['/word-filter.js'].lineData[339]++;
      visit45_339_1(listItem.getAttribute('ke:reset') && (list = lastIndent = lastListItem = null));
      _$jscoverage['/word-filter.js'].lineData[344]++;
      listItemIndent = Number(listItem.getAttribute('ke:indent'));
      _$jscoverage['/word-filter.js'].lineData[347]++;
      if (visit46_347_1(listItemIndent != lastIndent)) {
        _$jscoverage['/word-filter.js'].lineData[348]++;
        previousListType = previousListStyleType = null;
      }
      _$jscoverage['/word-filter.js'].lineData[351]++;
      if (visit47_351_1(!bullet)) {
        _$jscoverage['/word-filter.js'].lineData[352]++;
        listType = visit48_352_1(listItem.getAttribute('ke:listtype') || 'ol');
        _$jscoverage['/word-filter.js'].lineData[353]++;
        listStyleType = listItem.getAttribute('ke:list-style-type');
      } else {
        _$jscoverage['/word-filter.js'].lineData[358]++;
        if (visit49_358_1(previousListType && listMarkerPatterns[previousListType][previousListStyleType].test(bullet[1]))) {
          _$jscoverage['/word-filter.js'].lineData[360]++;
          listType = previousListType;
          _$jscoverage['/word-filter.js'].lineData[361]++;
          listStyleType = previousListStyleType;
        } else {
          _$jscoverage['/word-filter.js'].lineData[364]++;
          for (var type in listMarkerPatterns) {
            _$jscoverage['/word-filter.js'].lineData[366]++;
            for (var style in listMarkerPatterns[type]) {
              _$jscoverage['/word-filter.js'].lineData[368]++;
              if (visit50_368_1(listMarkerPatterns[type][style].test(bullet[1]))) {
                _$jscoverage['/word-filter.js'].lineData[371]++;
                if (visit51_371_1(visit52_371_2(type == 'ol') && (/alpha|roman/).test(style))) {
                  _$jscoverage['/word-filter.js'].lineData[372]++;
                  var num = /roman/.test(style) ? fromRoman(bullet[1]) : fromAlphabet(bullet[1]);
                  _$jscoverage['/word-filter.js'].lineData[373]++;
                  if (visit53_373_1(!itemNumeric || visit54_373_2(num < itemNumeric))) {
                    _$jscoverage['/word-filter.js'].lineData[374]++;
                    itemNumeric = num;
                    _$jscoverage['/word-filter.js'].lineData[375]++;
                    listType = type;
                    _$jscoverage['/word-filter.js'].lineData[376]++;
                    listStyleType = style;
                  }
                } else {
                  _$jscoverage['/word-filter.js'].lineData[380]++;
                  listType = type;
                  _$jscoverage['/word-filter.js'].lineData[381]++;
                  listStyleType = style;
                  _$jscoverage['/word-filter.js'].lineData[382]++;
                  break;
                }
              }
            }
          }
        }
        _$jscoverage['/word-filter.js'].lineData[392]++;
        visit55_392_1(!listType && (listType = bullet[2] ? 'ol' : 'ul'));
      }
      _$jscoverage['/word-filter.js'].lineData[395]++;
      previousListType = listType;
      _$jscoverage['/word-filter.js'].lineData[396]++;
      previousListStyleType = visit56_396_1(listStyleType || (visit57_396_2(listType == 'ol') ? 'decimal' : 'disc'));
      _$jscoverage['/word-filter.js'].lineData[397]++;
      if (visit58_397_1(listStyleType && visit59_397_2(listStyleType != (visit60_397_3(listType == 'ol') ? 'decimal' : 'disc')))) {
        _$jscoverage['/word-filter.js'].lineData[398]++;
        addStyle(listItem, 'list-style-type', listStyleType);
      }
      _$jscoverage['/word-filter.js'].lineData[401]++;
      if (visit61_401_1(visit62_401_2(listType == 'ol') && bullet)) {
        _$jscoverage['/word-filter.js'].lineData[402]++;
        switch (listStyleType) {
          case 'decimal':
            _$jscoverage['/word-filter.js'].lineData[404]++;
            itemNumeric = Number(bullet[1]);
            _$jscoverage['/word-filter.js'].lineData[405]++;
            break;
          case 'lower-roman':
          case 'upper-roman':
            _$jscoverage['/word-filter.js'].lineData[408]++;
            itemNumeric = fromRoman(bullet[1]);
            _$jscoverage['/word-filter.js'].lineData[409]++;
            break;
          case 'lower-alpha':
          case 'upper-alpha':
            _$jscoverage['/word-filter.js'].lineData[412]++;
            itemNumeric = fromAlphabet(bullet[1]);
            _$jscoverage['/word-filter.js'].lineData[413]++;
            break;
        }
        _$jscoverage['/word-filter.js'].lineData[417]++;
        listItem.setAttribute("value", itemNumeric);
      }
      _$jscoverage['/word-filter.js'].lineData[421]++;
      if (visit63_421_1(!list)) {
        _$jscoverage['/word-filter.js'].lineData[422]++;
        openedLists.push(list = new HtmlParser.Tag(listType));
        _$jscoverage['/word-filter.js'].lineData[423]++;
        list.appendChild(listItem);
        _$jscoverage['/word-filter.js'].lineData[424]++;
        element.replaceChild(list, children[i]);
      } else {
        _$jscoverage['/word-filter.js'].lineData[426]++;
        if (visit64_426_1(listItemIndent > lastIndent)) {
          _$jscoverage['/word-filter.js'].lineData[427]++;
          openedLists.push(list = new HtmlParser.Tag(listType));
          _$jscoverage['/word-filter.js'].lineData[428]++;
          list.appendChild(listItem);
          _$jscoverage['/word-filter.js'].lineData[429]++;
          lastListItem.appendChild(list);
        } else {
          _$jscoverage['/word-filter.js'].lineData[431]++;
          if (visit65_431_1(listItemIndent < lastIndent)) {
            _$jscoverage['/word-filter.js'].lineData[433]++;
            var diff = lastIndent - listItemIndent, parent;
            _$jscoverage['/word-filter.js'].lineData[435]++;
            while (visit66_435_1(diff-- && (parent = list.parentNode))) {
              _$jscoverage['/word-filter.js'].lineData[436]++;
              list = parent.parentNode;
            }
            _$jscoverage['/word-filter.js'].lineData[438]++;
            list.appendChild(listItem);
          } else {
            _$jscoverage['/word-filter.js'].lineData[441]++;
            list.appendChild(listItem);
          }
        }
        _$jscoverage['/word-filter.js'].lineData[443]++;
        children.splice(i--, 1);
      }
      _$jscoverage['/word-filter.js'].lineData[446]++;
      lastListItem = listItem;
      _$jscoverage['/word-filter.js'].lineData[447]++;
      lastIndent = listItemIndent;
    } else {
      _$jscoverage['/word-filter.js'].lineData[449]++;
      if (visit67_449_1(visit68_449_2(child.nodeType == 3) && !S.trim(child.nodeValue))) {
      } else {
        _$jscoverage['/word-filter.js'].lineData[451]++;
        if (visit69_451_1(list)) {
          _$jscoverage['/word-filter.js'].lineData[452]++;
          list = lastIndent = lastListItem = null;
        }
      }
    }
  }
  _$jscoverage['/word-filter.js'].lineData[456]++;
  for (i = 0; visit70_456_1(i < openedLists.length); i++) {
    _$jscoverage['/word-filter.js'].lineData[457]++;
    postProcessList(openedLists[i]);
  }
}, 
  falsyFilter: function() {
  _$jscoverage['/word-filter.js'].functionData[16]++;
  _$jscoverage['/word-filter.js'].lineData[465]++;
  return false;
}, 
  stylesFilter: function(styles, whitelist) {
  _$jscoverage['/word-filter.js'].functionData[17]++;
  _$jscoverage['/word-filter.js'].lineData[476]++;
  return function(styleText, element) {
  _$jscoverage['/word-filter.js'].functionData[18]++;
  _$jscoverage['/word-filter.js'].lineData[477]++;
  var rules = [];
  _$jscoverage['/word-filter.js'].lineData[481]++;
  (visit71_481_1(styleText || '')).replace(/&quot;/g, '"').replace(/\s*([^ :;]+)\s*:\s*([^;]+)\s*(?=;|$)/g, function(match, name, value) {
  _$jscoverage['/word-filter.js'].functionData[19]++;
  _$jscoverage['/word-filter.js'].lineData[485]++;
  name = name.toLowerCase();
  _$jscoverage['/word-filter.js'].lineData[486]++;
  visit72_486_1(visit73_486_2(name == 'font-family') && (value = value.replace(/["']/g, '')));
  _$jscoverage['/word-filter.js'].lineData[488]++;
  var namePattern, valuePattern, newValue, newName;
  _$jscoverage['/word-filter.js'].lineData[492]++;
  for (var i = 0; visit74_492_1(i < styles.length); i++) {
    _$jscoverage['/word-filter.js'].lineData[493]++;
    if (visit75_493_1(styles[i])) {
      _$jscoverage['/word-filter.js'].lineData[494]++;
      namePattern = styles[i][0];
      _$jscoverage['/word-filter.js'].lineData[495]++;
      valuePattern = styles[i][1];
      _$jscoverage['/word-filter.js'].lineData[496]++;
      newValue = styles[i][2];
      _$jscoverage['/word-filter.js'].lineData[497]++;
      newName = styles[i][3];
      _$jscoverage['/word-filter.js'].lineData[499]++;
      if (visit76_499_1(name.match(namePattern) && (visit77_500_1(!valuePattern || value.match(valuePattern))))) {
        _$jscoverage['/word-filter.js'].lineData[501]++;
        name = visit78_501_1(newName || name);
        _$jscoverage['/word-filter.js'].lineData[502]++;
        visit79_502_1(whitelist && (newValue = visit80_502_2(newValue || value)));
        _$jscoverage['/word-filter.js'].lineData[504]++;
        if (visit81_504_1(typeof newValue == 'function')) {
          _$jscoverage['/word-filter.js'].lineData[505]++;
          newValue = newValue(value, element, name);
        }
        _$jscoverage['/word-filter.js'].lineData[510]++;
        if (visit82_510_1(newValue && newValue.push)) {
          _$jscoverage['/word-filter.js'].lineData[511]++;
          name = newValue[0];
          _$jscoverage['/word-filter.js'].lineData[512]++;
          newValue = newValue[1];
        }
        _$jscoverage['/word-filter.js'].lineData[515]++;
        if (visit83_515_1(typeof newValue == 'string')) {
          _$jscoverage['/word-filter.js'].lineData[516]++;
          rules.push([name, newValue]);
        }
        _$jscoverage['/word-filter.js'].lineData[519]++;
        return;
      }
    }
  }
  _$jscoverage['/word-filter.js'].lineData[524]++;
  visit84_524_1(!whitelist && rules.push([name, value]));
});
  _$jscoverage['/word-filter.js'].lineData[528]++;
  for (var i = 0; visit85_528_1(i < rules.length); i++) {
    _$jscoverage['/word-filter.js'].lineData[529]++;
    rules[i] = rules[i].join(':');
  }
  _$jscoverage['/word-filter.js'].lineData[532]++;
  return rules.length ? (rules.join(';') + ';') : false;
};
}, 
  applyStyleFilter: null};
  _$jscoverage['/word-filter.js'].lineData[547]++;
  function postProcessList(list) {
    _$jscoverage['/word-filter.js'].functionData[20]++;
    _$jscoverage['/word-filter.js'].lineData[548]++;
    var children = visit86_548_1(list.childNodes || []), child, count = children.length, match, mergeStyle, styleTypeRegexp = /list-style-type:(.*?)(?:;|$)/, stylesFilter = filters.stylesFilter;
    _$jscoverage['/word-filter.js'].lineData[557]++;
    if (visit87_557_1(styleTypeRegexp.exec(list.getAttribute("style")))) {
      _$jscoverage['/word-filter.js'].lineData[558]++;
      return;
    }
    _$jscoverage['/word-filter.js'].lineData[560]++;
    for (var i = 0; visit88_560_1(i < count); i++) {
      _$jscoverage['/word-filter.js'].lineData[561]++;
      child = children[i];
      _$jscoverage['/word-filter.js'].lineData[563]++;
      if (visit89_563_1(child.getAttribute("value") && visit90_563_2(Number(child.getAttribute("value")) == i + 1))) {
        _$jscoverage['/word-filter.js'].lineData[564]++;
        child.removeAttribute("value");
      }
      _$jscoverage['/word-filter.js'].lineData[567]++;
      match = styleTypeRegexp.exec(child.getAttribute("style"));
      _$jscoverage['/word-filter.js'].lineData[569]++;
      if (visit91_569_1(match)) {
        _$jscoverage['/word-filter.js'].lineData[570]++;
        if (visit92_570_1(visit93_570_2(match[1] == mergeStyle) || !mergeStyle)) {
          _$jscoverage['/word-filter.js'].lineData[571]++;
          mergeStyle = match[1];
        } else {
          _$jscoverage['/word-filter.js'].lineData[573]++;
          mergeStyle = null;
          _$jscoverage['/word-filter.js'].lineData[574]++;
          break;
        }
      }
    }
    _$jscoverage['/word-filter.js'].lineData[579]++;
    if (visit94_579_1(mergeStyle)) {
      _$jscoverage['/word-filter.js'].lineData[580]++;
      for (i = 0; visit95_580_1(i < count); i++) {
        _$jscoverage['/word-filter.js'].lineData[581]++;
        var style = children[i].getAttribute("style");
        _$jscoverage['/word-filter.js'].lineData[583]++;
        if (visit96_583_1(style)) {
          _$jscoverage['/word-filter.js'].lineData[584]++;
          style = stylesFilter([['list-style-type']])(style);
          _$jscoverage['/word-filter.js'].lineData[587]++;
          setStyle(children[i], style);
        }
      }
      _$jscoverage['/word-filter.js'].lineData[590]++;
      addStyle(list, 'list-style-type', mergeStyle);
    }
  }
  _$jscoverage['/word-filter.js'].lineData[594]++;
  var utils = {
  createListBulletMarker: function(bullet, bulletText) {
  _$jscoverage['/word-filter.js'].functionData[21]++;
  _$jscoverage['/word-filter.js'].lineData[597]++;
  var marker = new HtmlParser.Tag('ke:listbullet');
  _$jscoverage['/word-filter.js'].lineData[598]++;
  marker.setAttribute("ke:listsymbol", bullet[0]);
  _$jscoverage['/word-filter.js'].lineData[599]++;
  marker.appendChild(new HtmlParser.Text(bulletText));
  _$jscoverage['/word-filter.js'].lineData[600]++;
  return marker;
}, 
  isListBulletIndicator: function(element) {
  _$jscoverage['/word-filter.js'].functionData[22]++;
  _$jscoverage['/word-filter.js'].lineData[604]++;
  var styleText = element.getAttribute("style");
  _$jscoverage['/word-filter.js'].lineData[605]++;
  if (visit97_605_1(/mso-list\s*:\s*Ignore/i.test(styleText))) {
    _$jscoverage['/word-filter.js'].lineData[606]++;
    return true;
  }
}, 
  isContainingOnlySpaces: function(element) {
  _$jscoverage['/word-filter.js'].functionData[23]++;
  _$jscoverage['/word-filter.js'].lineData[611]++;
  var text;
  _$jscoverage['/word-filter.js'].lineData[612]++;
  return (visit98_612_1((text = onlyChild(element)) && (/^(:?\s|&nbsp;)+$/).test(text.nodeValue)));
}, 
  resolveList: function(element) {
  _$jscoverage['/word-filter.js'].functionData[24]++;
  _$jscoverage['/word-filter.js'].lineData[618]++;
  var listMarker;
  _$jscoverage['/word-filter.js'].lineData[620]++;
  if (visit99_620_1((listMarker = removeAnyChildWithName(element, 'ke:listbullet')) && visit100_621_1(listMarker.length && (listMarker = listMarker[0])))) {
    _$jscoverage['/word-filter.js'].lineData[623]++;
    element.setTagName('ke:li');
    _$jscoverage['/word-filter.js'].lineData[625]++;
    if (visit101_625_1(element.getAttribute("style"))) {
      _$jscoverage['/word-filter.js'].lineData[626]++;
      var styleStr = filters.stylesFilter([['text-indent'], ['line-height'], [(/^margin(:?-left)?$/), null, function(margin) {
  _$jscoverage['/word-filter.js'].functionData[25]++;
  _$jscoverage['/word-filter.js'].lineData[634]++;
  var values = margin.split(' ');
  _$jscoverage['/word-filter.js'].lineData[635]++;
  margin = convertToPx(visit102_635_1(values[3] || visit103_635_2(values[1] || values[0])));
  _$jscoverage['/word-filter.js'].lineData[638]++;
  if (visit104_638_1(!listBaseIndent && visit105_638_2(visit106_638_3(previousListItemMargin !== null) && visit107_639_1(margin > previousListItemMargin)))) {
    _$jscoverage['/word-filter.js'].lineData[640]++;
    listBaseIndent = margin - previousListItemMargin;
  }
  _$jscoverage['/word-filter.js'].lineData[643]++;
  previousListItemMargin = margin;
  _$jscoverage['/word-filter.js'].lineData[644]++;
  if (visit108_644_1(listBaseIndent)) {
    _$jscoverage['/word-filter.js'].lineData[645]++;
    element.setAttribute('ke:indent', visit109_645_1(visit110_645_2(listBaseIndent && (Math.ceil(margin / listBaseIndent) + 1)) || 1));
  }
}], [(/^mso-list$/), null, function(val) {
  _$jscoverage['/word-filter.js'].functionData[26]++;
  _$jscoverage['/word-filter.js'].lineData[651]++;
  val = val.split(' ');
  _$jscoverage['/word-filter.js'].lineData[652]++;
  var listId = Number(val[0].match(/\d+/)), indent = Number(val[1].match(/\d+/));
  _$jscoverage['/word-filter.js'].lineData[655]++;
  if (visit111_655_1(indent == 1)) {
    _$jscoverage['/word-filter.js'].lineData[656]++;
    visit112_656_1(visit113_656_2(listId !== previousListId) && (element.setAttribute('ke:reset', 1)));
    _$jscoverage['/word-filter.js'].lineData[658]++;
    previousListId = listId;
  }
  _$jscoverage['/word-filter.js'].lineData[660]++;
  element.setAttribute('ke:indent', indent);
}]])(element.getAttribute("style"), element);
      _$jscoverage['/word-filter.js'].lineData[664]++;
      setStyle(element, styleStr);
    }
    _$jscoverage['/word-filter.js'].lineData[669]++;
    if (visit114_669_1(!element.getAttribute("ke:indent"))) {
      _$jscoverage['/word-filter.js'].lineData[670]++;
      previousListItemMargin = 0;
      _$jscoverage['/word-filter.js'].lineData[671]++;
      element.setAttribute('ke:indent', 1);
    }
    _$jscoverage['/word-filter.js'].lineData[674]++;
    S.each(listMarker.attributes, function(a) {
  _$jscoverage['/word-filter.js'].functionData[27]++;
  _$jscoverage['/word-filter.js'].lineData[675]++;
  element.setAttribute(a.name, a.value);
});
    _$jscoverage['/word-filter.js'].lineData[678]++;
    return true;
  } else {
    _$jscoverage['/word-filter.js'].lineData[682]++;
    previousListId = previousListItemMargin = listBaseIndent = null;
  }
  _$jscoverage['/word-filter.js'].lineData[684]++;
  return false;
}, 
  getStyleComponents: (function() {
  _$jscoverage['/word-filter.js'].functionData[28]++;
  _$jscoverage['/word-filter.js'].lineData[689]++;
  var calculator = $('<div style="position:absolute;left:-9999px;top:-9999px;"></div>').prependTo("body");
  _$jscoverage['/word-filter.js'].lineData[692]++;
  return function(name, styleValue, fetchList) {
  _$jscoverage['/word-filter.js'].functionData[29]++;
  _$jscoverage['/word-filter.js'].lineData[693]++;
  calculator.css(name, styleValue);
  _$jscoverage['/word-filter.js'].lineData[694]++;
  var styles = {}, count = fetchList.length;
  _$jscoverage['/word-filter.js'].lineData[696]++;
  for (var i = 0; visit115_696_1(i < count); i++) {
    _$jscoverage['/word-filter.js'].lineData[697]++;
    styles[fetchList[i]] = calculator.css(fetchList[i]);
  }
  _$jscoverage['/word-filter.js'].lineData[700]++;
  return styles;
};
})(), 
  listDtdParents: parentOf('ol')};
  _$jscoverage['/word-filter.js'].lineData[707]++;
  (function() {
  _$jscoverage['/word-filter.js'].functionData[30]++;
  _$jscoverage['/word-filter.js'].lineData[708]++;
  var blockLike = S.merge(dtd.$block, dtd.$listItem, dtd.$tableContent), falsyFilter = filters.falsyFilter, stylesFilter = filters.stylesFilter, createListBulletMarker = utils.createListBulletMarker, flattenList = filters.flattenList, assembleList = filters.assembleList, isListBulletIndicator = utils.isListBulletIndicator, containsNothingButSpaces = utils.isContainingOnlySpaces, resolveListItem = utils.resolveList, convertToPxStr = function(value) {
  _$jscoverage['/word-filter.js'].functionData[31]++;
  _$jscoverage['/word-filter.js'].lineData[718]++;
  value = convertToPx(value);
  _$jscoverage['/word-filter.js'].lineData[719]++;
  return isNaN(value) ? value : value + 'px';
}, getStyleComponents = utils.getStyleComponents, listDtdParents = utils.listDtdParents;
  _$jscoverage['/word-filter.js'].lineData[724]++;
  wordFilter.addRules({
  tagNames: [[(/meta|link|script/), '']], 
  root: function(element) {
  _$jscoverage['/word-filter.js'].functionData[32]++;
  _$jscoverage['/word-filter.js'].lineData[732]++;
  element.filterChildren();
  _$jscoverage['/word-filter.js'].lineData[733]++;
  assembleList(element);
}, 
  tags: {
  '^': function(element) {
  _$jscoverage['/word-filter.js'].functionData[33]++;
  _$jscoverage['/word-filter.js'].lineData[739]++;
  var applyStyleFilter;
  _$jscoverage['/word-filter.js'].lineData[740]++;
  if (visit116_740_1(UA.gecko && (applyStyleFilter = filters.applyStyleFilter))) {
    _$jscoverage['/word-filter.js'].lineData[741]++;
    applyStyleFilter(element);
  }
}, 
  $: function(element) {
  _$jscoverage['/word-filter.js'].functionData[34]++;
  _$jscoverage['/word-filter.js'].lineData[745]++;
  var tagName = visit117_745_1(element.nodeName || '');
  _$jscoverage['/word-filter.js'].lineData[749]++;
  if (visit118_749_1(tagName in blockLike && element.getAttribute("style"))) {
    _$jscoverage['/word-filter.js'].lineData[750]++;
    setStyle(element, stylesFilter([[(/^(:?width|height)$/), null, convertToPxStr]])(element.getAttribute("style")));
  }
  _$jscoverage['/word-filter.js'].lineData[757]++;
  if (visit119_757_1(tagName.match(/h\d/))) {
    _$jscoverage['/word-filter.js'].lineData[758]++;
    element.filterChildren();
    _$jscoverage['/word-filter.js'].lineData[760]++;
    if (visit120_760_1(resolveListItem(element))) {
      _$jscoverage['/word-filter.js'].lineData[761]++;
      return;
    }
  } else {
    _$jscoverage['/word-filter.js'].lineData[765]++;
    if (visit121_765_1(tagName in dtd.$inline)) {
      _$jscoverage['/word-filter.js'].lineData[766]++;
      element.filterChildren();
      _$jscoverage['/word-filter.js'].lineData[767]++;
      if (visit122_767_1(containsNothingButSpaces(element))) {
        _$jscoverage['/word-filter.js'].lineData[768]++;
        element.setTagName(null);
      }
    } else {
      _$jscoverage['/word-filter.js'].lineData[773]++;
      if (visit123_773_1(visit124_773_2(tagName.indexOf(':') != -1) && visit125_774_1(tagName.indexOf('ke') == -1))) {
        _$jscoverage['/word-filter.js'].lineData[775]++;
        element.filterChildren();
        _$jscoverage['/word-filter.js'].lineData[778]++;
        if (visit126_778_1(tagName == 'v:imagedata')) {
          _$jscoverage['/word-filter.js'].lineData[779]++;
          var href = element.getAttribute('o:href');
          _$jscoverage['/word-filter.js'].lineData[780]++;
          if (visit127_780_1(href)) {
            _$jscoverage['/word-filter.js'].lineData[781]++;
            element.setAttribute("src", href);
          }
          _$jscoverage['/word-filter.js'].lineData[783]++;
          element.setTagName('img');
          _$jscoverage['/word-filter.js'].lineData[784]++;
          return;
        }
        _$jscoverage['/word-filter.js'].lineData[786]++;
        element.setTagName(null);
      }
    }
  }
  _$jscoverage['/word-filter.js'].lineData[790]++;
  if (visit128_790_1(tagName in listDtdParents)) {
    _$jscoverage['/word-filter.js'].lineData[791]++;
    element.filterChildren();
    _$jscoverage['/word-filter.js'].lineData[792]++;
    assembleList(element);
  }
}, 
  'style': function(element) {
  _$jscoverage['/word-filter.js'].functionData[35]++;
  _$jscoverage['/word-filter.js'].lineData[800]++;
  if (visit129_800_1(UA.gecko)) {
    _$jscoverage['/word-filter.js'].lineData[802]++;
    var styleDefSection = onlyChild(element).nodeValue.match(/\/\* Style Definitions \*\/([\s\S]*?)\/\*/), styleDefText = visit130_804_1(styleDefSection && styleDefSection[1]), rules = {};
    _$jscoverage['/word-filter.js'].lineData[807]++;
    if (visit131_807_1(styleDefText)) {
      _$jscoverage['/word-filter.js'].lineData[812]++;
      styleDefText.replace(/[\n\r]/g, '').replace(/(.+?)\{(.+?)\}/g, function(rule, selectors, styleBlock) {
  _$jscoverage['/word-filter.js'].functionData[36]++;
  _$jscoverage['/word-filter.js'].lineData[814]++;
  selectors = selectors.split(',');
  _$jscoverage['/word-filter.js'].lineData[815]++;
  var length = selectors.length;
  _$jscoverage['/word-filter.js'].lineData[816]++;
  for (var i = 0; visit132_816_1(i < length); i++) {
    _$jscoverage['/word-filter.js'].lineData[820]++;
    S.trim(selectors[i]).replace(/^(\w+)(\.[\w-]+)?$/g, function(match, tagName, className) {
  _$jscoverage['/word-filter.js'].functionData[37]++;
  _$jscoverage['/word-filter.js'].lineData[822]++;
  tagName = visit133_822_1(tagName || '*');
  _$jscoverage['/word-filter.js'].lineData[823]++;
  className = className.substring(1, className.length);
  _$jscoverage['/word-filter.js'].lineData[826]++;
  if (visit134_826_1(className.match(/MsoNormal/))) {
    _$jscoverage['/word-filter.js'].lineData[827]++;
    return;
  }
  _$jscoverage['/word-filter.js'].lineData[829]++;
  if (visit135_829_1(!rules[tagName])) {
    _$jscoverage['/word-filter.js'].lineData[830]++;
    rules[tagName] = {};
  }
  _$jscoverage['/word-filter.js'].lineData[832]++;
  if (visit136_832_1(className)) {
    _$jscoverage['/word-filter.js'].lineData[833]++;
    rules[tagName][className] = styleBlock;
  } else {
    _$jscoverage['/word-filter.js'].lineData[835]++;
    rules[tagName] = styleBlock;
  }
});
  }
});
      _$jscoverage['/word-filter.js'].lineData[841]++;
      filters.applyStyleFilter = function(element) {
  _$jscoverage['/word-filter.js'].functionData[38]++;
  _$jscoverage['/word-filter.js'].lineData[842]++;
  var name = rules['*'] ? '*' : element.nodeName, className = element.getAttribute('class'), style;
  _$jscoverage['/word-filter.js'].lineData[845]++;
  if (visit137_845_1(name in rules)) {
    _$jscoverage['/word-filter.js'].lineData[846]++;
    style = rules[name];
    _$jscoverage['/word-filter.js'].lineData[847]++;
    if (visit138_847_1(typeof style == 'object')) {
      _$jscoverage['/word-filter.js'].lineData[848]++;
      style = style[className];
    }
    _$jscoverage['/word-filter.js'].lineData[850]++;
    visit139_850_1(style && addStyle(element, style, true));
  }
};
    }
  }
  _$jscoverage['/word-filter.js'].lineData[855]++;
  return false;
}, 
  'p': function(element) {
  _$jscoverage['/word-filter.js'].functionData[39]++;
  _$jscoverage['/word-filter.js'].lineData[862]++;
  if (visit140_862_1(/MsoListParagraph/.exec(element.getAttribute('class')))) {
    _$jscoverage['/word-filter.js'].lineData[863]++;
    var bulletText = firstChild(element, function(node) {
  _$jscoverage['/word-filter.js'].functionData[40]++;
  _$jscoverage['/word-filter.js'].lineData[864]++;
  return visit141_864_1(visit142_864_2(node.nodeType == 3) && !containsNothingButSpaces(node.parentNode));
});
    _$jscoverage['/word-filter.js'].lineData[866]++;
    var bullet = visit143_866_1(bulletText && bulletText.parentNode);
    _$jscoverage['/word-filter.js'].lineData[867]++;
    visit144_867_1(!bullet.getAttribute("style") && (bullet.setAttribute("style", 'mso-list: Ignore;')));
  }
  _$jscoverage['/word-filter.js'].lineData[870]++;
  element.filterChildren();
  _$jscoverage['/word-filter.js'].lineData[872]++;
  resolveListItem(element);
}, 
  'div': function(element) {
  _$jscoverage['/word-filter.js'].functionData[41]++;
  _$jscoverage['/word-filter.js'].lineData[879]++;
  var singleChild = onlyChild(element);
  _$jscoverage['/word-filter.js'].lineData[880]++;
  if (visit145_880_1(singleChild && visit146_880_2(singleChild.nodeName == 'table'))) {
    _$jscoverage['/word-filter.js'].lineData[881]++;
    var attrs = element.attributes;
    _$jscoverage['/word-filter.js'].lineData[883]++;
    S.each(attrs, function(attr) {
  _$jscoverage['/word-filter.js'].functionData[42]++;
  _$jscoverage['/word-filter.js'].lineData[884]++;
  singleChild.setAttribute(attr.name, attr.value);
});
    _$jscoverage['/word-filter.js'].lineData[887]++;
    if (visit147_887_1(element.getAttribute("style"))) {
      _$jscoverage['/word-filter.js'].lineData[888]++;
      addStyle(singleChild, element.getAttribute("style"));
    }
    _$jscoverage['/word-filter.js'].lineData[891]++;
    var clearFloatDiv = new HtmlParser.Tag('div');
    _$jscoverage['/word-filter.js'].lineData[892]++;
    addStyle(clearFloatDiv, 'clear', 'both');
    _$jscoverage['/word-filter.js'].lineData[893]++;
    element.appendChild(clearFloatDiv);
    _$jscoverage['/word-filter.js'].lineData[894]++;
    element.setTagName(null);
  }
}, 
  'td': function(element) {
  _$jscoverage['/word-filter.js'].functionData[43]++;
  _$jscoverage['/word-filter.js'].lineData[900]++;
  if (visit148_900_1(getAncestor(element, 'thead'))) {
    _$jscoverage['/word-filter.js'].lineData[901]++;
    element.setTagName('th');
  }
}, 
  'ol': flattenList, 
  'ul': flattenList, 
  'dl': flattenList, 
  'font': function(element) {
  _$jscoverage['/word-filter.js'].functionData[44]++;
  _$jscoverage['/word-filter.js'].lineData[912]++;
  if (visit149_912_1(isListBulletIndicator(element.parentNode))) {
    _$jscoverage['/word-filter.js'].lineData[913]++;
    element.setTagName(null);
    _$jscoverage['/word-filter.js'].lineData[914]++;
    return;
  }
  _$jscoverage['/word-filter.js'].lineData[917]++;
  element.filterChildren();
  _$jscoverage['/word-filter.js'].lineData[919]++;
  var styleText = element.getAttribute("style"), parent = element.parentNode;
  _$jscoverage['/word-filter.js'].lineData[922]++;
  if (visit150_922_1('font' == parent.name)) {
    _$jscoverage['/word-filter.js'].lineData[924]++;
    S.each(element.attributes, function(attr) {
  _$jscoverage['/word-filter.js'].functionData[45]++;
  _$jscoverage['/word-filter.js'].lineData[925]++;
  parent.setAttribute(attr.name, attr.value);
});
    _$jscoverage['/word-filter.js'].lineData[927]++;
    visit151_927_1(styleText && addStyle(parent, styleText));
    _$jscoverage['/word-filter.js'].lineData[928]++;
    element.setTagName(null);
  } else {
    _$jscoverage['/word-filter.js'].lineData[932]++;
    styleText = visit152_932_1(styleText || '');
    _$jscoverage['/word-filter.js'].lineData[934]++;
    if (visit153_934_1(element.getAttribute("color"))) {
      _$jscoverage['/word-filter.js'].lineData[935]++;
      visit154_935_1(visit155_935_2(element.getAttribute("color") != '#000000') && (styleText += 'color:' + element.getAttribute("color") + ';'));
      _$jscoverage['/word-filter.js'].lineData[936]++;
      element.removeAttribute("color");
    }
    _$jscoverage['/word-filter.js'].lineData[938]++;
    if (visit156_938_1(element.getAttribute("face"))) {
      _$jscoverage['/word-filter.js'].lineData[939]++;
      styleText += 'font-family:' + element.getAttribute("face") + ';';
      _$jscoverage['/word-filter.js'].lineData[940]++;
      element.removeAttribute("face");
    }
    _$jscoverage['/word-filter.js'].lineData[942]++;
    var size = element.getAttribute("size");
    _$jscoverage['/word-filter.js'].lineData[945]++;
    if (visit157_945_1(size)) {
      _$jscoverage['/word-filter.js'].lineData[946]++;
      styleText += 'font-size:' + (visit158_947_1(size > 3) ? 'large' : (visit159_948_1(size < 3) ? 'small' : 'medium')) + ';';
      _$jscoverage['/word-filter.js'].lineData[949]++;
      element.removeAttribute("size");
    }
    _$jscoverage['/word-filter.js'].lineData[951]++;
    element.setTagName("span");
    _$jscoverage['/word-filter.js'].lineData[952]++;
    addStyle(element, styleText);
  }
}, 
  'span': function(element) {
  _$jscoverage['/word-filter.js'].functionData[46]++;
  _$jscoverage['/word-filter.js'].lineData[958]++;
  if (visit160_958_1(isListBulletIndicator(element.parentNode))) {
    _$jscoverage['/word-filter.js'].lineData[959]++;
    return false;
  }
  _$jscoverage['/word-filter.js'].lineData[961]++;
  element.filterChildren();
  _$jscoverage['/word-filter.js'].lineData[962]++;
  if (visit161_962_1(containsNothingButSpaces(element))) {
    _$jscoverage['/word-filter.js'].lineData[963]++;
    element.setTagName(null);
    _$jscoverage['/word-filter.js'].lineData[964]++;
    return null;
  }
  _$jscoverage['/word-filter.js'].lineData[969]++;
  if (visit162_969_1(isListBulletIndicator(element))) {
    _$jscoverage['/word-filter.js'].lineData[970]++;
    var listSymbolNode = firstChild(element, function(node) {
  _$jscoverage['/word-filter.js'].functionData[47]++;
  _$jscoverage['/word-filter.js'].lineData[971]++;
  return visit163_971_1(node.nodeValue || visit164_971_2(node.nodeName == 'img'));
});
    _$jscoverage['/word-filter.js'].lineData[974]++;
    var listSymbol = visit165_974_1(listSymbolNode && (visit166_974_2(listSymbolNode.nodeValue || 'l.'))), listType = visit167_975_1(listSymbol && listSymbol.match(/^(?:[(]?)([^\s]+?)([.)]?)$/));
    _$jscoverage['/word-filter.js'].lineData[977]++;
    if (visit168_977_1(listType)) {
      _$jscoverage['/word-filter.js'].lineData[978]++;
      var marker = createListBulletMarker(listType, listSymbol);
      _$jscoverage['/word-filter.js'].lineData[982]++;
      var ancestor = getAncestor(element, 'span');
      _$jscoverage['/word-filter.js'].lineData[983]++;
      if (visit169_983_1(ancestor && (/ mso-hide:\s*all|display:\s*none /).test(ancestor.getAttribute("style")))) {
        _$jscoverage['/word-filter.js'].lineData[985]++;
        marker.setAttribute('ke:ignored', 1);
      }
      _$jscoverage['/word-filter.js'].lineData[987]++;
      return marker;
    }
  }
  _$jscoverage['/word-filter.js'].lineData[992]++;
  var styleText = element.getAttribute("style");
  _$jscoverage['/word-filter.js'].lineData[996]++;
  if (visit170_996_1(styleText)) {
    _$jscoverage['/word-filter.js'].lineData[998]++;
    setStyle(element, stylesFilter([[/^line-height$/], [/^font-family$/], [/^font-size$/], [/^color$/], [/^background-color$/]])(styleText, element));
  }
}, 
  'a': function(element) {
  _$jscoverage['/word-filter.js'].functionData[48]++;
  _$jscoverage['/word-filter.js'].lineData[1013]++;
  var href;
  _$jscoverage['/word-filter.js'].lineData[1014]++;
  if (visit171_1014_1(!(href = element.getAttribute("href")) && element.getAttribute("name"))) {
    _$jscoverage['/word-filter.js'].lineData[1015]++;
    element.setTagName(null);
  } else {
    _$jscoverage['/word-filter.js'].lineData[1016]++;
    if (visit172_1016_1(UA.webkit && visit173_1016_2(href && href.match(/file:\/\/\/[\S]+#/i)))) {
      _$jscoverage['/word-filter.js'].lineData[1017]++;
      element.setAttribute("href", href.replace(/file:\/\/\/[^#]+/i, ''));
    }
  }
}, 
  'ke:listbullet': function(element) {
  _$jscoverage['/word-filter.js'].functionData[49]++;
  _$jscoverage['/word-filter.js'].lineData[1021]++;
  if (visit174_1021_1(getAncestor(element, /h\d/))) {
    _$jscoverage['/word-filter.js'].lineData[1022]++;
    element.setTagName(null);
  }
}}, 
  attributeNames: [[(/^onmouse(:?out|over)/), ''], [(/^onload$/), ''], [(/(?:v|o):\w+/), ''], [(/^lang/), '']], 
  attributes: {
  'style': stylesFilter([[(/^list-style-type$/)], [(/^margin$|^margin-(?!bottom|top)/), null, function(value, element, name) {
  _$jscoverage['/word-filter.js'].functionData[50]++;
  _$jscoverage['/word-filter.js'].lineData[1048]++;
  if (visit175_1048_1(element.nodeName in {
  p: 1, 
  div: 1})) {
    _$jscoverage['/word-filter.js'].lineData[1049]++;
    var indentStyleName = 'margin-left';
    _$jscoverage['/word-filter.js'].lineData[1052]++;
    if (visit176_1052_1(name == 'margin')) {
      _$jscoverage['/word-filter.js'].lineData[1053]++;
      value = getStyleComponents(name, value, [indentStyleName])[indentStyleName];
    } else {
      _$jscoverage['/word-filter.js'].lineData[1055]++;
      if (visit177_1055_1(name != indentStyleName)) {
        _$jscoverage['/word-filter.js'].lineData[1056]++;
        return null;
      }
    }
    _$jscoverage['/word-filter.js'].lineData[1059]++;
    if (visit178_1059_1(value && !emptyMarginRegex.test(value))) {
      _$jscoverage['/word-filter.js'].lineData[1060]++;
      return [indentStyleName, value];
    }
  }
  _$jscoverage['/word-filter.js'].lineData[1064]++;
  return null;
}], [(/^clear$/)], [(/^border.*|margin.*|vertical-align|float$/), null, function(value, element) {
  _$jscoverage['/word-filter.js'].functionData[51]++;
  _$jscoverage['/word-filter.js'].lineData[1072]++;
  if (visit179_1072_1(element.nodeName == 'img')) {
    _$jscoverage['/word-filter.js'].lineData[1073]++;
    return value;
  }
}], [(/^width|height$/), null, function(value, element) {
  _$jscoverage['/word-filter.js'].functionData[52]++;
  _$jscoverage['/word-filter.js'].lineData[1078]++;
  if (visit180_1078_1(element.nodeName in {
  table: 1, 
  td: 1, 
  th: 1, 
  img: 1})) {
    _$jscoverage['/word-filter.js'].lineData[1079]++;
    return value;
  }
}]], 1), 
  'width': function(value, element) {
  _$jscoverage['/word-filter.js'].functionData[53]++;
  _$jscoverage['/word-filter.js'].lineData[1085]++;
  if (visit181_1085_1(element.nodeName in dtd.$tableContent)) {
    _$jscoverage['/word-filter.js'].lineData[1086]++;
    return false;
  }
}, 
  'border': function(value, element) {
  _$jscoverage['/word-filter.js'].functionData[54]++;
  _$jscoverage['/word-filter.js'].lineData[1090]++;
  if (visit182_1090_1(element.nodeName in dtd.$tableContent)) {
    _$jscoverage['/word-filter.js'].lineData[1091]++;
    return false;
  }
}, 
  'class': falsyFilter, 
  'bgcolor': falsyFilter, 
  'valign': function(value, element) {
  _$jscoverage['/word-filter.js'].functionData[55]++;
  _$jscoverage['/word-filter.js'].lineData[1105]++;
  addStyle(element, 'vertical-align', value);
  _$jscoverage['/word-filter.js'].lineData[1106]++;
  return false;
}}, 
  comment: UA.ie ? function(value, node) {
  _$jscoverage['/word-filter.js'].functionData[56]++;
  _$jscoverage['/word-filter.js'].lineData[1116]++;
  var imageInfo = value.match(/<img.*?>/), listInfo = value.match(/^\[if !supportLists\]([\s\S]*?)\[endif\]$/);
  _$jscoverage['/word-filter.js'].lineData[1120]++;
  if (visit183_1120_1(listInfo)) {
    _$jscoverage['/word-filter.js'].lineData[1122]++;
    var listSymbol = visit184_1122_1(listInfo[1] || (visit185_1122_2(imageInfo && 'l.'))), listType = visit186_1123_1(listSymbol && listSymbol.match(/>(?:[(]?)([^\s]+?)([.)]?)</));
    _$jscoverage['/word-filter.js'].lineData[1124]++;
    return createListBulletMarker(listType, listSymbol);
  }
  _$jscoverage['/word-filter.js'].lineData[1128]++;
  if (visit187_1128_1(UA.gecko && imageInfo)) {
    _$jscoverage['/word-filter.js'].lineData[1129]++;
    var img = new HtmlParser.Parser(imageInfo[0]).parse().childNodes[0], previousComment = node.previousSibling, imgSrcInfo = visit188_1132_1(previousComment && previousComment.toHtml().match(/<v:imagedata[^>]*o:href=['"](.*?)['"]/)), imgSrc = visit189_1133_1(imgSrcInfo && imgSrcInfo[1]);
    _$jscoverage['/word-filter.js'].lineData[1136]++;
    visit190_1136_1(imgSrc && (img.setAttribute("src", imgSrc)));
    _$jscoverage['/word-filter.js'].lineData[1137]++;
    return img;
  }
  _$jscoverage['/word-filter.js'].lineData[1140]++;
  return false;
} : falsyFilter});
})();
  _$jscoverage['/word-filter.js'].lineData[1146]++;
  return {
  toDataFormat: function(html, editor) {
  _$jscoverage['/word-filter.js'].functionData[57]++;
  _$jscoverage['/word-filter.js'].lineData[1165]++;
  if (visit191_1165_1(UA.gecko)) {
    _$jscoverage['/word-filter.js'].lineData[1166]++;
    html = html.replace(/(<!--\[if[^<]*?\])-->([\S\s]*?)<!--(\[endif\]-->)/gi, '$1$2$3');
  }
  _$jscoverage['/word-filter.js'].lineData[1171]++;
  html = editor['htmlDataProcessor'].toDataFormat(html, wordFilter);
  _$jscoverage['/word-filter.js'].lineData[1173]++;
  return html;
}};
}, {
  requires: ['html-parser']});
