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
if (! _$jscoverage['/editor/styles.js']) {
  _$jscoverage['/editor/styles.js'] = {};
  _$jscoverage['/editor/styles.js'].lineData = [];
  _$jscoverage['/editor/styles.js'].lineData[9] = 0;
  _$jscoverage['/editor/styles.js'].lineData[10] = 0;
  _$jscoverage['/editor/styles.js'].lineData[67] = 0;
  _$jscoverage['/editor/styles.js'].lineData[69] = 0;
  _$jscoverage['/editor/styles.js'].lineData[72] = 0;
  _$jscoverage['/editor/styles.js'].lineData[75] = 0;
  _$jscoverage['/editor/styles.js'].lineData[76] = 0;
  _$jscoverage['/editor/styles.js'].lineData[77] = 0;
  _$jscoverage['/editor/styles.js'].lineData[78] = 0;
  _$jscoverage['/editor/styles.js'].lineData[79] = 0;
  _$jscoverage['/editor/styles.js'].lineData[82] = 0;
  _$jscoverage['/editor/styles.js'].lineData[92] = 0;
  _$jscoverage['/editor/styles.js'].lineData[93] = 0;
  _$jscoverage['/editor/styles.js'].lineData[94] = 0;
  _$jscoverage['/editor/styles.js'].lineData[95] = 0;
  _$jscoverage['/editor/styles.js'].lineData[98] = 0;
  _$jscoverage['/editor/styles.js'].lineData[100] = 0;
  _$jscoverage['/editor/styles.js'].lineData[105] = 0;
  _$jscoverage['/editor/styles.js'].lineData[115] = 0;
  _$jscoverage['/editor/styles.js'].lineData[117] = 0;
  _$jscoverage['/editor/styles.js'].lineData[121] = 0;
  _$jscoverage['/editor/styles.js'].lineData[123] = 0;
  _$jscoverage['/editor/styles.js'].lineData[125] = 0;
  _$jscoverage['/editor/styles.js'].lineData[126] = 0;
  _$jscoverage['/editor/styles.js'].lineData[128] = 0;
  _$jscoverage['/editor/styles.js'].lineData[130] = 0;
  _$jscoverage['/editor/styles.js'].lineData[133] = 0;
  _$jscoverage['/editor/styles.js'].lineData[138] = 0;
  _$jscoverage['/editor/styles.js'].lineData[142] = 0;
  _$jscoverage['/editor/styles.js'].lineData[146] = 0;
  _$jscoverage['/editor/styles.js'].lineData[147] = 0;
  _$jscoverage['/editor/styles.js'].lineData[160] = 0;
  _$jscoverage['/editor/styles.js'].lineData[161] = 0;
  _$jscoverage['/editor/styles.js'].lineData[173] = 0;
  _$jscoverage['/editor/styles.js'].lineData[174] = 0;
  _$jscoverage['/editor/styles.js'].lineData[176] = 0;
  _$jscoverage['/editor/styles.js'].lineData[180] = 0;
  _$jscoverage['/editor/styles.js'].lineData[182] = 0;
  _$jscoverage['/editor/styles.js'].lineData[183] = 0;
  _$jscoverage['/editor/styles.js'].lineData[185] = 0;
  _$jscoverage['/editor/styles.js'].lineData[187] = 0;
  _$jscoverage['/editor/styles.js'].lineData[188] = 0;
  _$jscoverage['/editor/styles.js'].lineData[190] = 0;
  _$jscoverage['/editor/styles.js'].lineData[191] = 0;
  _$jscoverage['/editor/styles.js'].lineData[193] = 0;
  _$jscoverage['/editor/styles.js'].lineData[194] = 0;
  _$jscoverage['/editor/styles.js'].lineData[198] = 0;
  _$jscoverage['/editor/styles.js'].lineData[199] = 0;
  _$jscoverage['/editor/styles.js'].lineData[201] = 0;
  _$jscoverage['/editor/styles.js'].lineData[202] = 0;
  _$jscoverage['/editor/styles.js'].lineData[205] = 0;
  _$jscoverage['/editor/styles.js'].lineData[206] = 0;
  _$jscoverage['/editor/styles.js'].lineData[209] = 0;
  _$jscoverage['/editor/styles.js'].lineData[213] = 0;
  _$jscoverage['/editor/styles.js'].lineData[216] = 0;
  _$jscoverage['/editor/styles.js'].lineData[218] = 0;
  _$jscoverage['/editor/styles.js'].lineData[221] = 0;
  _$jscoverage['/editor/styles.js'].lineData[222] = 0;
  _$jscoverage['/editor/styles.js'].lineData[223] = 0;
  _$jscoverage['/editor/styles.js'].lineData[224] = 0;
  _$jscoverage['/editor/styles.js'].lineData[225] = 0;
  _$jscoverage['/editor/styles.js'].lineData[226] = 0;
  _$jscoverage['/editor/styles.js'].lineData[227] = 0;
  _$jscoverage['/editor/styles.js'].lineData[234] = 0;
  _$jscoverage['/editor/styles.js'].lineData[238] = 0;
  _$jscoverage['/editor/styles.js'].lineData[242] = 0;
  _$jscoverage['/editor/styles.js'].lineData[243] = 0;
  _$jscoverage['/editor/styles.js'].lineData[244] = 0;
  _$jscoverage['/editor/styles.js'].lineData[245] = 0;
  _$jscoverage['/editor/styles.js'].lineData[246] = 0;
  _$jscoverage['/editor/styles.js'].lineData[247] = 0;
  _$jscoverage['/editor/styles.js'].lineData[248] = 0;
  _$jscoverage['/editor/styles.js'].lineData[254] = 0;
  _$jscoverage['/editor/styles.js'].lineData[259] = 0;
  _$jscoverage['/editor/styles.js'].lineData[267] = 0;
  _$jscoverage['/editor/styles.js'].lineData[269] = 0;
  _$jscoverage['/editor/styles.js'].lineData[275] = 0;
  _$jscoverage['/editor/styles.js'].lineData[277] = 0;
  _$jscoverage['/editor/styles.js'].lineData[278] = 0;
  _$jscoverage['/editor/styles.js'].lineData[280] = 0;
  _$jscoverage['/editor/styles.js'].lineData[283] = 0;
  _$jscoverage['/editor/styles.js'].lineData[285] = 0;
  _$jscoverage['/editor/styles.js'].lineData[287] = 0;
  _$jscoverage['/editor/styles.js'].lineData[289] = 0;
  _$jscoverage['/editor/styles.js'].lineData[290] = 0;
  _$jscoverage['/editor/styles.js'].lineData[293] = 0;
  _$jscoverage['/editor/styles.js'].lineData[298] = 0;
  _$jscoverage['/editor/styles.js'].lineData[300] = 0;
  _$jscoverage['/editor/styles.js'].lineData[301] = 0;
  _$jscoverage['/editor/styles.js'].lineData[302] = 0;
  _$jscoverage['/editor/styles.js'].lineData[304] = 0;
  _$jscoverage['/editor/styles.js'].lineData[307] = 0;
  _$jscoverage['/editor/styles.js'].lineData[311] = 0;
  _$jscoverage['/editor/styles.js'].lineData[312] = 0;
  _$jscoverage['/editor/styles.js'].lineData[314] = 0;
  _$jscoverage['/editor/styles.js'].lineData[316] = 0;
  _$jscoverage['/editor/styles.js'].lineData[320] = 0;
  _$jscoverage['/editor/styles.js'].lineData[321] = 0;
  _$jscoverage['/editor/styles.js'].lineData[323] = 0;
  _$jscoverage['/editor/styles.js'].lineData[329] = 0;
  _$jscoverage['/editor/styles.js'].lineData[330] = 0;
  _$jscoverage['/editor/styles.js'].lineData[332] = 0;
  _$jscoverage['/editor/styles.js'].lineData[335] = 0;
  _$jscoverage['/editor/styles.js'].lineData[338] = 0;
  _$jscoverage['/editor/styles.js'].lineData[339] = 0;
  _$jscoverage['/editor/styles.js'].lineData[344] = 0;
  _$jscoverage['/editor/styles.js'].lineData[345] = 0;
  _$jscoverage['/editor/styles.js'].lineData[348] = 0;
  _$jscoverage['/editor/styles.js'].lineData[351] = 0;
  _$jscoverage['/editor/styles.js'].lineData[352] = 0;
  _$jscoverage['/editor/styles.js'].lineData[354] = 0;
  _$jscoverage['/editor/styles.js'].lineData[357] = 0;
  _$jscoverage['/editor/styles.js'].lineData[358] = 0;
  _$jscoverage['/editor/styles.js'].lineData[363] = 0;
  _$jscoverage['/editor/styles.js'].lineData[364] = 0;
  _$jscoverage['/editor/styles.js'].lineData[365] = 0;
  _$jscoverage['/editor/styles.js'].lineData[371] = 0;
  _$jscoverage['/editor/styles.js'].lineData[372] = 0;
  _$jscoverage['/editor/styles.js'].lineData[374] = 0;
  _$jscoverage['/editor/styles.js'].lineData[377] = 0;
  _$jscoverage['/editor/styles.js'].lineData[380] = 0;
  _$jscoverage['/editor/styles.js'].lineData[382] = 0;
  _$jscoverage['/editor/styles.js'].lineData[386] = 0;
  _$jscoverage['/editor/styles.js'].lineData[388] = 0;
  _$jscoverage['/editor/styles.js'].lineData[390] = 0;
  _$jscoverage['/editor/styles.js'].lineData[391] = 0;
  _$jscoverage['/editor/styles.js'].lineData[392] = 0;
  _$jscoverage['/editor/styles.js'].lineData[394] = 0;
  _$jscoverage['/editor/styles.js'].lineData[398] = 0;
  _$jscoverage['/editor/styles.js'].lineData[399] = 0;
  _$jscoverage['/editor/styles.js'].lineData[402] = 0;
  _$jscoverage['/editor/styles.js'].lineData[404] = 0;
  _$jscoverage['/editor/styles.js'].lineData[405] = 0;
  _$jscoverage['/editor/styles.js'].lineData[406] = 0;
  _$jscoverage['/editor/styles.js'].lineData[408] = 0;
  _$jscoverage['/editor/styles.js'].lineData[414] = 0;
  _$jscoverage['/editor/styles.js'].lineData[416] = 0;
  _$jscoverage['/editor/styles.js'].lineData[419] = 0;
  _$jscoverage['/editor/styles.js'].lineData[422] = 0;
  _$jscoverage['/editor/styles.js'].lineData[426] = 0;
  _$jscoverage['/editor/styles.js'].lineData[429] = 0;
  _$jscoverage['/editor/styles.js'].lineData[432] = 0;
  _$jscoverage['/editor/styles.js'].lineData[433] = 0;
  _$jscoverage['/editor/styles.js'].lineData[434] = 0;
  _$jscoverage['/editor/styles.js'].lineData[435] = 0;
  _$jscoverage['/editor/styles.js'].lineData[436] = 0;
  _$jscoverage['/editor/styles.js'].lineData[437] = 0;
  _$jscoverage['/editor/styles.js'].lineData[440] = 0;
  _$jscoverage['/editor/styles.js'].lineData[442] = 0;
  _$jscoverage['/editor/styles.js'].lineData[449] = 0;
  _$jscoverage['/editor/styles.js'].lineData[452] = 0;
  _$jscoverage['/editor/styles.js'].lineData[457] = 0;
  _$jscoverage['/editor/styles.js'].lineData[460] = 0;
  _$jscoverage['/editor/styles.js'].lineData[461] = 0;
  _$jscoverage['/editor/styles.js'].lineData[463] = 0;
  _$jscoverage['/editor/styles.js'].lineData[465] = 0;
  _$jscoverage['/editor/styles.js'].lineData[471] = 0;
  _$jscoverage['/editor/styles.js'].lineData[472] = 0;
  _$jscoverage['/editor/styles.js'].lineData[477] = 0;
  _$jscoverage['/editor/styles.js'].lineData[478] = 0;
  _$jscoverage['/editor/styles.js'].lineData[479] = 0;
  _$jscoverage['/editor/styles.js'].lineData[481] = 0;
  _$jscoverage['/editor/styles.js'].lineData[483] = 0;
  _$jscoverage['/editor/styles.js'].lineData[485] = 0;
  _$jscoverage['/editor/styles.js'].lineData[486] = 0;
  _$jscoverage['/editor/styles.js'].lineData[488] = 0;
  _$jscoverage['/editor/styles.js'].lineData[495] = 0;
  _$jscoverage['/editor/styles.js'].lineData[496] = 0;
  _$jscoverage['/editor/styles.js'].lineData[497] = 0;
  _$jscoverage['/editor/styles.js'].lineData[499] = 0;
  _$jscoverage['/editor/styles.js'].lineData[508] = 0;
  _$jscoverage['/editor/styles.js'].lineData[512] = 0;
  _$jscoverage['/editor/styles.js'].lineData[513] = 0;
  _$jscoverage['/editor/styles.js'].lineData[515] = 0;
  _$jscoverage['/editor/styles.js'].lineData[517] = 0;
  _$jscoverage['/editor/styles.js'].lineData[523] = 0;
  _$jscoverage['/editor/styles.js'].lineData[524] = 0;
  _$jscoverage['/editor/styles.js'].lineData[525] = 0;
  _$jscoverage['/editor/styles.js'].lineData[526] = 0;
  _$jscoverage['/editor/styles.js'].lineData[530] = 0;
  _$jscoverage['/editor/styles.js'].lineData[531] = 0;
  _$jscoverage['/editor/styles.js'].lineData[532] = 0;
  _$jscoverage['/editor/styles.js'].lineData[534] = 0;
  _$jscoverage['/editor/styles.js'].lineData[535] = 0;
  _$jscoverage['/editor/styles.js'].lineData[536] = 0;
  _$jscoverage['/editor/styles.js'].lineData[537] = 0;
  _$jscoverage['/editor/styles.js'].lineData[538] = 0;
  _$jscoverage['/editor/styles.js'].lineData[540] = 0;
  _$jscoverage['/editor/styles.js'].lineData[545] = 0;
  _$jscoverage['/editor/styles.js'].lineData[546] = 0;
  _$jscoverage['/editor/styles.js'].lineData[548] = 0;
  _$jscoverage['/editor/styles.js'].lineData[551] = 0;
  _$jscoverage['/editor/styles.js'].lineData[552] = 0;
  _$jscoverage['/editor/styles.js'].lineData[553] = 0;
  _$jscoverage['/editor/styles.js'].lineData[555] = 0;
  _$jscoverage['/editor/styles.js'].lineData[562] = 0;
  _$jscoverage['/editor/styles.js'].lineData[563] = 0;
  _$jscoverage['/editor/styles.js'].lineData[566] = 0;
  _$jscoverage['/editor/styles.js'].lineData[568] = 0;
  _$jscoverage['/editor/styles.js'].lineData[570] = 0;
  _$jscoverage['/editor/styles.js'].lineData[572] = 0;
  _$jscoverage['/editor/styles.js'].lineData[573] = 0;
  _$jscoverage['/editor/styles.js'].lineData[575] = 0;
  _$jscoverage['/editor/styles.js'].lineData[580] = 0;
  _$jscoverage['/editor/styles.js'].lineData[581] = 0;
  _$jscoverage['/editor/styles.js'].lineData[582] = 0;
  _$jscoverage['/editor/styles.js'].lineData[586] = 0;
  _$jscoverage['/editor/styles.js'].lineData[589] = 0;
  _$jscoverage['/editor/styles.js'].lineData[590] = 0;
  _$jscoverage['/editor/styles.js'].lineData[594] = 0;
  _$jscoverage['/editor/styles.js'].lineData[600] = 0;
  _$jscoverage['/editor/styles.js'].lineData[601] = 0;
  _$jscoverage['/editor/styles.js'].lineData[603] = 0;
  _$jscoverage['/editor/styles.js'].lineData[604] = 0;
  _$jscoverage['/editor/styles.js'].lineData[605] = 0;
  _$jscoverage['/editor/styles.js'].lineData[608] = 0;
  _$jscoverage['/editor/styles.js'].lineData[612] = 0;
  _$jscoverage['/editor/styles.js'].lineData[613] = 0;
  _$jscoverage['/editor/styles.js'].lineData[614] = 0;
  _$jscoverage['/editor/styles.js'].lineData[618] = 0;
  _$jscoverage['/editor/styles.js'].lineData[629] = 0;
  _$jscoverage['/editor/styles.js'].lineData[640] = 0;
  _$jscoverage['/editor/styles.js'].lineData[643] = 0;
  _$jscoverage['/editor/styles.js'].lineData[644] = 0;
  _$jscoverage['/editor/styles.js'].lineData[645] = 0;
  _$jscoverage['/editor/styles.js'].lineData[646] = 0;
  _$jscoverage['/editor/styles.js'].lineData[651] = 0;
  _$jscoverage['/editor/styles.js'].lineData[660] = 0;
  _$jscoverage['/editor/styles.js'].lineData[672] = 0;
  _$jscoverage['/editor/styles.js'].lineData[673] = 0;
  _$jscoverage['/editor/styles.js'].lineData[678] = 0;
  _$jscoverage['/editor/styles.js'].lineData[680] = 0;
  _$jscoverage['/editor/styles.js'].lineData[693] = 0;
  _$jscoverage['/editor/styles.js'].lineData[705] = 0;
  _$jscoverage['/editor/styles.js'].lineData[708] = 0;
  _$jscoverage['/editor/styles.js'].lineData[713] = 0;
  _$jscoverage['/editor/styles.js'].lineData[716] = 0;
  _$jscoverage['/editor/styles.js'].lineData[719] = 0;
  _$jscoverage['/editor/styles.js'].lineData[723] = 0;
  _$jscoverage['/editor/styles.js'].lineData[725] = 0;
  _$jscoverage['/editor/styles.js'].lineData[731] = 0;
  _$jscoverage['/editor/styles.js'].lineData[740] = 0;
  _$jscoverage['/editor/styles.js'].lineData[744] = 0;
  _$jscoverage['/editor/styles.js'].lineData[745] = 0;
  _$jscoverage['/editor/styles.js'].lineData[746] = 0;
  _$jscoverage['/editor/styles.js'].lineData[748] = 0;
  _$jscoverage['/editor/styles.js'].lineData[750] = 0;
  _$jscoverage['/editor/styles.js'].lineData[752] = 0;
  _$jscoverage['/editor/styles.js'].lineData[754] = 0;
  _$jscoverage['/editor/styles.js'].lineData[756] = 0;
  _$jscoverage['/editor/styles.js'].lineData[763] = 0;
  _$jscoverage['/editor/styles.js'].lineData[765] = 0;
  _$jscoverage['/editor/styles.js'].lineData[767] = 0;
  _$jscoverage['/editor/styles.js'].lineData[769] = 0;
  _$jscoverage['/editor/styles.js'].lineData[771] = 0;
  _$jscoverage['/editor/styles.js'].lineData[773] = 0;
  _$jscoverage['/editor/styles.js'].lineData[777] = 0;
  _$jscoverage['/editor/styles.js'].lineData[778] = 0;
  _$jscoverage['/editor/styles.js'].lineData[779] = 0;
  _$jscoverage['/editor/styles.js'].lineData[783] = 0;
  _$jscoverage['/editor/styles.js'].lineData[786] = 0;
  _$jscoverage['/editor/styles.js'].lineData[788] = 0;
  _$jscoverage['/editor/styles.js'].lineData[792] = 0;
  _$jscoverage['/editor/styles.js'].lineData[796] = 0;
  _$jscoverage['/editor/styles.js'].lineData[799] = 0;
  _$jscoverage['/editor/styles.js'].lineData[807] = 0;
  _$jscoverage['/editor/styles.js'].lineData[808] = 0;
  _$jscoverage['/editor/styles.js'].lineData[821] = 0;
  _$jscoverage['/editor/styles.js'].lineData[822] = 0;
  _$jscoverage['/editor/styles.js'].lineData[823] = 0;
  _$jscoverage['/editor/styles.js'].lineData[824] = 0;
  _$jscoverage['/editor/styles.js'].lineData[825] = 0;
  _$jscoverage['/editor/styles.js'].lineData[830] = 0;
  _$jscoverage['/editor/styles.js'].lineData[834] = 0;
  _$jscoverage['/editor/styles.js'].lineData[835] = 0;
  _$jscoverage['/editor/styles.js'].lineData[836] = 0;
  _$jscoverage['/editor/styles.js'].lineData[838] = 0;
  _$jscoverage['/editor/styles.js'].lineData[846] = 0;
  _$jscoverage['/editor/styles.js'].lineData[851] = 0;
  _$jscoverage['/editor/styles.js'].lineData[853] = 0;
  _$jscoverage['/editor/styles.js'].lineData[856] = 0;
  _$jscoverage['/editor/styles.js'].lineData[858] = 0;
  _$jscoverage['/editor/styles.js'].lineData[863] = 0;
  _$jscoverage['/editor/styles.js'].lineData[872] = 0;
  _$jscoverage['/editor/styles.js'].lineData[874] = 0;
  _$jscoverage['/editor/styles.js'].lineData[876] = 0;
  _$jscoverage['/editor/styles.js'].lineData[877] = 0;
  _$jscoverage['/editor/styles.js'].lineData[880] = 0;
  _$jscoverage['/editor/styles.js'].lineData[881] = 0;
  _$jscoverage['/editor/styles.js'].lineData[882] = 0;
  _$jscoverage['/editor/styles.js'].lineData[890] = 0;
  _$jscoverage['/editor/styles.js'].lineData[894] = 0;
  _$jscoverage['/editor/styles.js'].lineData[895] = 0;
  _$jscoverage['/editor/styles.js'].lineData[896] = 0;
  _$jscoverage['/editor/styles.js'].lineData[899] = 0;
  _$jscoverage['/editor/styles.js'].lineData[909] = 0;
  _$jscoverage['/editor/styles.js'].lineData[910] = 0;
  _$jscoverage['/editor/styles.js'].lineData[911] = 0;
  _$jscoverage['/editor/styles.js'].lineData[912] = 0;
  _$jscoverage['/editor/styles.js'].lineData[913] = 0;
  _$jscoverage['/editor/styles.js'].lineData[914] = 0;
  _$jscoverage['/editor/styles.js'].lineData[916] = 0;
  _$jscoverage['/editor/styles.js'].lineData[917] = 0;
  _$jscoverage['/editor/styles.js'].lineData[919] = 0;
  _$jscoverage['/editor/styles.js'].lineData[920] = 0;
  _$jscoverage['/editor/styles.js'].lineData[921] = 0;
  _$jscoverage['/editor/styles.js'].lineData[927] = 0;
  _$jscoverage['/editor/styles.js'].lineData[930] = 0;
  _$jscoverage['/editor/styles.js'].lineData[931] = 0;
  _$jscoverage['/editor/styles.js'].lineData[934] = 0;
  _$jscoverage['/editor/styles.js'].lineData[937] = 0;
  _$jscoverage['/editor/styles.js'].lineData[938] = 0;
  _$jscoverage['/editor/styles.js'].lineData[946] = 0;
  _$jscoverage['/editor/styles.js'].lineData[953] = 0;
  _$jscoverage['/editor/styles.js'].lineData[954] = 0;
  _$jscoverage['/editor/styles.js'].lineData[958] = 0;
  _$jscoverage['/editor/styles.js'].lineData[959] = 0;
  _$jscoverage['/editor/styles.js'].lineData[961] = 0;
  _$jscoverage['/editor/styles.js'].lineData[963] = 0;
  _$jscoverage['/editor/styles.js'].lineData[965] = 0;
  _$jscoverage['/editor/styles.js'].lineData[966] = 0;
  _$jscoverage['/editor/styles.js'].lineData[968] = 0;
  _$jscoverage['/editor/styles.js'].lineData[969] = 0;
  _$jscoverage['/editor/styles.js'].lineData[971] = 0;
  _$jscoverage['/editor/styles.js'].lineData[973] = 0;
  _$jscoverage['/editor/styles.js'].lineData[975] = 0;
  _$jscoverage['/editor/styles.js'].lineData[976] = 0;
  _$jscoverage['/editor/styles.js'].lineData[979] = 0;
  _$jscoverage['/editor/styles.js'].lineData[980] = 0;
  _$jscoverage['/editor/styles.js'].lineData[981] = 0;
  _$jscoverage['/editor/styles.js'].lineData[982] = 0;
  _$jscoverage['/editor/styles.js'].lineData[985] = 0;
  _$jscoverage['/editor/styles.js'].lineData[988] = 0;
  _$jscoverage['/editor/styles.js'].lineData[989] = 0;
  _$jscoverage['/editor/styles.js'].lineData[994] = 0;
  _$jscoverage['/editor/styles.js'].lineData[995] = 0;
  _$jscoverage['/editor/styles.js'].lineData[999] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1000] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1002] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1003] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1014] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1016] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1017] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1020] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1023] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1031] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1032] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1033] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1035] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1037] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1039] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1042] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1043] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1044] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1045] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1049] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1053] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1057] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1065] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1066] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1067] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1070] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1071] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1073] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1076] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1080] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1091] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1093] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1094] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1095] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1097] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1099] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1103] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1104] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1106] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1107] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1113] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1114] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1115] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1116] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1117] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1122] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1125] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1135] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1136] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1137] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1139] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1142] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1145] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1146] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1149] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1150] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1151] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1152] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1153] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1156] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1157] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1160] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1163] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1164] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1170] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1173] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1177] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1179] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1183] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1188] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1192] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1194] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1198] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1205] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1210] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1211] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1222] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1225] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1228] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1229] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1230] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1234] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1237] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1240] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1242] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1244] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1250] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1259] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1260] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1261] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1262] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1267] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1268] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1274] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1275] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1280] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1282] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1283] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1284] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1285] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1286] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1301] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1302] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1304] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1305] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1306] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1308] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1309] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1317] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1320] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1326] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1328] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1329] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1330] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1332] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1333] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1334] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1338] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1343] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1347] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1350] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1353] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1356] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1358] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1360] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1363] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1365] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1370] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1372] = 0;
}
if (! _$jscoverage['/editor/styles.js'].functionData) {
  _$jscoverage['/editor/styles.js'].functionData = [];
  _$jscoverage['/editor/styles.js'].functionData[0] = 0;
  _$jscoverage['/editor/styles.js'].functionData[1] = 0;
  _$jscoverage['/editor/styles.js'].functionData[2] = 0;
  _$jscoverage['/editor/styles.js'].functionData[3] = 0;
  _$jscoverage['/editor/styles.js'].functionData[4] = 0;
  _$jscoverage['/editor/styles.js'].functionData[5] = 0;
  _$jscoverage['/editor/styles.js'].functionData[6] = 0;
  _$jscoverage['/editor/styles.js'].functionData[7] = 0;
  _$jscoverage['/editor/styles.js'].functionData[8] = 0;
  _$jscoverage['/editor/styles.js'].functionData[9] = 0;
  _$jscoverage['/editor/styles.js'].functionData[10] = 0;
  _$jscoverage['/editor/styles.js'].functionData[11] = 0;
  _$jscoverage['/editor/styles.js'].functionData[12] = 0;
  _$jscoverage['/editor/styles.js'].functionData[13] = 0;
  _$jscoverage['/editor/styles.js'].functionData[14] = 0;
  _$jscoverage['/editor/styles.js'].functionData[15] = 0;
  _$jscoverage['/editor/styles.js'].functionData[16] = 0;
  _$jscoverage['/editor/styles.js'].functionData[17] = 0;
  _$jscoverage['/editor/styles.js'].functionData[18] = 0;
  _$jscoverage['/editor/styles.js'].functionData[19] = 0;
  _$jscoverage['/editor/styles.js'].functionData[20] = 0;
  _$jscoverage['/editor/styles.js'].functionData[21] = 0;
  _$jscoverage['/editor/styles.js'].functionData[22] = 0;
  _$jscoverage['/editor/styles.js'].functionData[23] = 0;
  _$jscoverage['/editor/styles.js'].functionData[24] = 0;
  _$jscoverage['/editor/styles.js'].functionData[25] = 0;
  _$jscoverage['/editor/styles.js'].functionData[26] = 0;
  _$jscoverage['/editor/styles.js'].functionData[27] = 0;
  _$jscoverage['/editor/styles.js'].functionData[28] = 0;
  _$jscoverage['/editor/styles.js'].functionData[29] = 0;
  _$jscoverage['/editor/styles.js'].functionData[30] = 0;
  _$jscoverage['/editor/styles.js'].functionData[31] = 0;
  _$jscoverage['/editor/styles.js'].functionData[32] = 0;
  _$jscoverage['/editor/styles.js'].functionData[33] = 0;
  _$jscoverage['/editor/styles.js'].functionData[34] = 0;
  _$jscoverage['/editor/styles.js'].functionData[35] = 0;
  _$jscoverage['/editor/styles.js'].functionData[36] = 0;
  _$jscoverage['/editor/styles.js'].functionData[37] = 0;
  _$jscoverage['/editor/styles.js'].functionData[38] = 0;
  _$jscoverage['/editor/styles.js'].functionData[39] = 0;
  _$jscoverage['/editor/styles.js'].functionData[40] = 0;
}
if (! _$jscoverage['/editor/styles.js'].branchData) {
  _$jscoverage['/editor/styles.js'].branchData = {};
  _$jscoverage['/editor/styles.js'].branchData['77'] = [];
  _$jscoverage['/editor/styles.js'].branchData['77'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['93'] = [];
  _$jscoverage['/editor/styles.js'].branchData['93'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['98'] = [];
  _$jscoverage['/editor/styles.js'].branchData['98'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['100'] = [];
  _$jscoverage['/editor/styles.js'].branchData['100'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['100'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['126'] = [];
  _$jscoverage['/editor/styles.js'].branchData['126'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['148'] = [];
  _$jscoverage['/editor/styles.js'].branchData['148'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['150'] = [];
  _$jscoverage['/editor/styles.js'].branchData['150'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['152'] = [];
  _$jscoverage['/editor/styles.js'].branchData['152'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['162'] = [];
  _$jscoverage['/editor/styles.js'].branchData['162'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['173'] = [];
  _$jscoverage['/editor/styles.js'].branchData['173'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['180'] = [];
  _$jscoverage['/editor/styles.js'].branchData['180'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['182'] = [];
  _$jscoverage['/editor/styles.js'].branchData['182'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['187'] = [];
  _$jscoverage['/editor/styles.js'].branchData['187'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['190'] = [];
  _$jscoverage['/editor/styles.js'].branchData['190'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['193'] = [];
  _$jscoverage['/editor/styles.js'].branchData['193'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['194'] = [];
  _$jscoverage['/editor/styles.js'].branchData['194'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['194'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['197'] = [];
  _$jscoverage['/editor/styles.js'].branchData['197'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['198'] = [];
  _$jscoverage['/editor/styles.js'].branchData['198'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['201'] = [];
  _$jscoverage['/editor/styles.js'].branchData['201'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['205'] = [];
  _$jscoverage['/editor/styles.js'].branchData['205'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['214'] = [];
  _$jscoverage['/editor/styles.js'].branchData['214'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['216'] = [];
  _$jscoverage['/editor/styles.js'].branchData['216'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['218'] = [];
  _$jscoverage['/editor/styles.js'].branchData['218'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['222'] = [];
  _$jscoverage['/editor/styles.js'].branchData['222'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['223'] = [];
  _$jscoverage['/editor/styles.js'].branchData['223'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['226'] = [];
  _$jscoverage['/editor/styles.js'].branchData['226'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['234'] = [];
  _$jscoverage['/editor/styles.js'].branchData['234'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['234'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['235'] = [];
  _$jscoverage['/editor/styles.js'].branchData['235'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['235'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['235'][3] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['236'] = [];
  _$jscoverage['/editor/styles.js'].branchData['236'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['237'] = [];
  _$jscoverage['/editor/styles.js'].branchData['237'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['242'] = [];
  _$jscoverage['/editor/styles.js'].branchData['242'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['243'] = [];
  _$jscoverage['/editor/styles.js'].branchData['243'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['246'] = [];
  _$jscoverage['/editor/styles.js'].branchData['246'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['248'] = [];
  _$jscoverage['/editor/styles.js'].branchData['248'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['248'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['251'] = [];
  _$jscoverage['/editor/styles.js'].branchData['251'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['251'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['251'][3] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['252'] = [];
  _$jscoverage['/editor/styles.js'].branchData['252'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['253'] = [];
  _$jscoverage['/editor/styles.js'].branchData['253'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['269'] = [];
  _$jscoverage['/editor/styles.js'].branchData['269'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['277'] = [];
  _$jscoverage['/editor/styles.js'].branchData['277'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['280'] = [];
  _$jscoverage['/editor/styles.js'].branchData['280'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['280'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['281'] = [];
  _$jscoverage['/editor/styles.js'].branchData['281'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['285'] = [];
  _$jscoverage['/editor/styles.js'].branchData['285'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['285'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['289'] = [];
  _$jscoverage['/editor/styles.js'].branchData['289'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['301'] = [];
  _$jscoverage['/editor/styles.js'].branchData['301'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['307'] = [];
  _$jscoverage['/editor/styles.js'].branchData['307'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['307'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['311'] = [];
  _$jscoverage['/editor/styles.js'].branchData['311'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['320'] = [];
  _$jscoverage['/editor/styles.js'].branchData['320'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['329'] = [];
  _$jscoverage['/editor/styles.js'].branchData['329'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['344'] = [];
  _$jscoverage['/editor/styles.js'].branchData['344'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['351'] = [];
  _$jscoverage['/editor/styles.js'].branchData['351'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['363'] = [];
  _$jscoverage['/editor/styles.js'].branchData['363'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['371'] = [];
  _$jscoverage['/editor/styles.js'].branchData['371'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['404'] = [];
  _$jscoverage['/editor/styles.js'].branchData['404'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['405'] = [];
  _$jscoverage['/editor/styles.js'].branchData['405'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['432'] = [];
  _$jscoverage['/editor/styles.js'].branchData['432'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['472'] = [];
  _$jscoverage['/editor/styles.js'].branchData['472'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['473'] = [];
  _$jscoverage['/editor/styles.js'].branchData['473'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['474'] = [];
  _$jscoverage['/editor/styles.js'].branchData['474'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['475'] = [];
  _$jscoverage['/editor/styles.js'].branchData['475'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['477'] = [];
  _$jscoverage['/editor/styles.js'].branchData['477'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['479'] = [];
  _$jscoverage['/editor/styles.js'].branchData['479'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['486'] = [];
  _$jscoverage['/editor/styles.js'].branchData['486'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['497'] = [];
  _$jscoverage['/editor/styles.js'].branchData['497'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['497'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['498'] = [];
  _$jscoverage['/editor/styles.js'].branchData['498'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['512'] = [];
  _$jscoverage['/editor/styles.js'].branchData['512'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['525'] = [];
  _$jscoverage['/editor/styles.js'].branchData['525'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['535'] = [];
  _$jscoverage['/editor/styles.js'].branchData['535'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['537'] = [];
  _$jscoverage['/editor/styles.js'].branchData['537'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['566'] = [];
  _$jscoverage['/editor/styles.js'].branchData['566'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['580'] = [];
  _$jscoverage['/editor/styles.js'].branchData['580'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['600'] = [];
  _$jscoverage['/editor/styles.js'].branchData['600'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['603'] = [];
  _$jscoverage['/editor/styles.js'].branchData['603'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['609'] = [];
  _$jscoverage['/editor/styles.js'].branchData['609'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['612'] = [];
  _$jscoverage['/editor/styles.js'].branchData['612'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['618'] = [];
  _$jscoverage['/editor/styles.js'].branchData['618'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['619'] = [];
  _$jscoverage['/editor/styles.js'].branchData['619'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['620'] = [];
  _$jscoverage['/editor/styles.js'].branchData['620'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['620'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['627'] = [];
  _$jscoverage['/editor/styles.js'].branchData['627'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['640'] = [];
  _$jscoverage['/editor/styles.js'].branchData['640'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['641'] = [];
  _$jscoverage['/editor/styles.js'].branchData['641'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['641'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['642'] = [];
  _$jscoverage['/editor/styles.js'].branchData['642'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['651'] = [];
  _$jscoverage['/editor/styles.js'].branchData['651'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['651'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['652'] = [];
  _$jscoverage['/editor/styles.js'].branchData['652'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['652'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['653'] = [];
  _$jscoverage['/editor/styles.js'].branchData['653'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['655'] = [];
  _$jscoverage['/editor/styles.js'].branchData['655'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['660'] = [];
  _$jscoverage['/editor/styles.js'].branchData['660'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['661'] = [];
  _$jscoverage['/editor/styles.js'].branchData['661'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['662'] = [];
  _$jscoverage['/editor/styles.js'].branchData['662'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['663'] = [];
  _$jscoverage['/editor/styles.js'].branchData['663'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['678'] = [];
  _$jscoverage['/editor/styles.js'].branchData['678'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['678'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['679'] = [];
  _$jscoverage['/editor/styles.js'].branchData['679'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['679'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['694'] = [];
  _$jscoverage['/editor/styles.js'].branchData['694'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['695'] = [];
  _$jscoverage['/editor/styles.js'].branchData['695'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['695'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['697'] = [];
  _$jscoverage['/editor/styles.js'].branchData['697'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['697'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['704'] = [];
  _$jscoverage['/editor/styles.js'].branchData['704'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['723'] = [];
  _$jscoverage['/editor/styles.js'].branchData['723'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['723'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['744'] = [];
  _$jscoverage['/editor/styles.js'].branchData['744'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['744'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['744'][3] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['745'] = [];
  _$jscoverage['/editor/styles.js'].branchData['745'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['748'] = [];
  _$jscoverage['/editor/styles.js'].branchData['748'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['752'] = [];
  _$jscoverage['/editor/styles.js'].branchData['752'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['765'] = [];
  _$jscoverage['/editor/styles.js'].branchData['765'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['769'] = [];
  _$jscoverage['/editor/styles.js'].branchData['769'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['777'] = [];
  _$jscoverage['/editor/styles.js'].branchData['777'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['786'] = [];
  _$jscoverage['/editor/styles.js'].branchData['786'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['807'] = [];
  _$jscoverage['/editor/styles.js'].branchData['807'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['856'] = [];
  _$jscoverage['/editor/styles.js'].branchData['856'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['863'] = [];
  _$jscoverage['/editor/styles.js'].branchData['863'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['863'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['872'] = [];
  _$jscoverage['/editor/styles.js'].branchData['872'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['872'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['873'] = [];
  _$jscoverage['/editor/styles.js'].branchData['873'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['876'] = [];
  _$jscoverage['/editor/styles.js'].branchData['876'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['878'] = [];
  _$jscoverage['/editor/styles.js'].branchData['878'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['880'] = [];
  _$jscoverage['/editor/styles.js'].branchData['880'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['894'] = [];
  _$jscoverage['/editor/styles.js'].branchData['894'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['897'] = [];
  _$jscoverage['/editor/styles.js'].branchData['897'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['909'] = [];
  _$jscoverage['/editor/styles.js'].branchData['909'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['913'] = [];
  _$jscoverage['/editor/styles.js'].branchData['913'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['916'] = [];
  _$jscoverage['/editor/styles.js'].branchData['916'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['926'] = [];
  _$jscoverage['/editor/styles.js'].branchData['926'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['931'] = [];
  _$jscoverage['/editor/styles.js'].branchData['931'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['933'] = [];
  _$jscoverage['/editor/styles.js'].branchData['933'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['937'] = [];
  _$jscoverage['/editor/styles.js'].branchData['937'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['958'] = [];
  _$jscoverage['/editor/styles.js'].branchData['958'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['961'] = [];
  _$jscoverage['/editor/styles.js'].branchData['961'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['961'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['962'] = [];
  _$jscoverage['/editor/styles.js'].branchData['962'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['965'] = [];
  _$jscoverage['/editor/styles.js'].branchData['965'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['968'] = [];
  _$jscoverage['/editor/styles.js'].branchData['968'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['971'] = [];
  _$jscoverage['/editor/styles.js'].branchData['971'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['971'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['972'] = [];
  _$jscoverage['/editor/styles.js'].branchData['972'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['975'] = [];
  _$jscoverage['/editor/styles.js'].branchData['975'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['979'] = [];
  _$jscoverage['/editor/styles.js'].branchData['979'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['981'] = [];
  _$jscoverage['/editor/styles.js'].branchData['981'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['989'] = [];
  _$jscoverage['/editor/styles.js'].branchData['989'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['995'] = [];
  _$jscoverage['/editor/styles.js'].branchData['995'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['996'] = [];
  _$jscoverage['/editor/styles.js'].branchData['996'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['996'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['999'] = [];
  _$jscoverage['/editor/styles.js'].branchData['999'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1004'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1004'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1014'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1014'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1014'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1043'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1043'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1043'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1044'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1044'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1044'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1049'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1049'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1049'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1050'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1050'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1050'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1051'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1051'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1051'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1052'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1052'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1067'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1067'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1073'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1073'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1094'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1094'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1103'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1103'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1114'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1114'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1115'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1115'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1136'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1136'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1142'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1142'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1145'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1145'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1149'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1149'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1156'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1156'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1170'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1170'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1173'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1173'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1178'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1178'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1188'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1188'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1193'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1193'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1214'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1214'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1214'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1216'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1216'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1216'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1218'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1218'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1225'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1225'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1225'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1225'][3] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1226'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1226'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1229'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1229'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1237'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1237'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1238'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1238'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1242'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1242'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1274'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1274'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1282'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1282'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1284'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1284'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1302'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1302'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1304'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1304'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1305'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1305'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1317'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1317'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1317'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1318'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1318'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1318'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1319'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1319'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1319'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1319'][3] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1326'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1326'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1328'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1328'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1329'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1329'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1334'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1334'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1334'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1336'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1336'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1336'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1337'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1337'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1337'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1337'][3] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1350'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1350'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1358'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1358'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1360'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1360'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1360'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1363'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1363'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1363'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1363'][3] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1364'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1364'][1] = new BranchData();
}
_$jscoverage['/editor/styles.js'].branchData['1364'][1].init(47, 47, 'lastChild.nodeType == Dom.NodeType.ELEMENT_NODE');
function visit1044_1364_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1364'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1363'][3].init(214, 23, 'firstChild != lastChild');
function visit1043_1363_3(result) {
  _$jscoverage['/editor/styles.js'].branchData['1363'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1363'][2].init(214, 95, 'firstChild != lastChild && lastChild.nodeType == Dom.NodeType.ELEMENT_NODE');
function visit1042_1363_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['1363'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1363'][1].init(201, 108, 'lastChild && firstChild != lastChild && lastChild.nodeType == Dom.NodeType.ELEMENT_NODE');
function visit1041_1363_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1363'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1360'][2].init(74, 48, 'firstChild.nodeType == Dom.NodeType.ELEMENT_NODE');
function visit1040_1360_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['1360'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1360'][1].init(74, 102, 'firstChild.nodeType == Dom.NodeType.ELEMENT_NODE && Dom._4e_mergeSiblings(firstChild)');
function visit1039_1360_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1360'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1358'][1].init(318, 10, 'firstChild');
function visit1038_1358_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1358'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1350'][1].init(118, 28, '!element._4e_hasAttributes()');
function visit1037_1350_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1350'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1337'][3].init(116, 30, 'actualStyleValue == styleValue');
function visit1036_1337_3(result) {
  _$jscoverage['/editor/styles.js'].branchData['1337'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1337'][2].init(83, 29, 'typeof styleValue == \'string\'');
function visit1035_1337_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['1337'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1337'][1].init(83, 63, 'typeof styleValue == \'string\' && actualStyleValue == styleValue');
function visit1034_1337_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1337'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1336'][2].init(185, 51, 'styleValue.test && styleValue.test(actualAttrValue)');
function visit1033_1336_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['1336'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1336'][1].init(104, 149, '(styleValue.test && styleValue.test(actualAttrValue)) || (typeof styleValue == \'string\' && actualStyleValue == styleValue)');
function visit1032_1336_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1336'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1334'][2].init(78, 19, 'styleValue === NULL');
function visit1031_1334_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['1334'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1334'][1].init(78, 254, 'styleValue === NULL || (styleValue.test && styleValue.test(actualAttrValue)) || (typeof styleValue == \'string\' && actualStyleValue == styleValue)');
function visit1030_1334_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1334'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1329'][1].init(26, 17, 'i < styles.length');
function visit1029_1329_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1329'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1328'][1].init(1141, 6, 'styles');
function visit1028_1328_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1328'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1326'][1].init(1092, 32, 'overrides && overrides["styles"]');
function visit1027_1326_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1326'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1319'][3].init(110, 27, 'actualAttrValue == attValue');
function visit1026_1319_3(result) {
  _$jscoverage['/editor/styles.js'].branchData['1319'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1319'][2].init(79, 27, 'typeof attValue == \'string\'');
function visit1025_1319_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['1319'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1319'][1].init(79, 58, 'typeof attValue == \'string\' && actualAttrValue == attValue');
function visit1024_1319_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1319'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1318'][2].init(532, 47, 'attValue.test && attValue.test(actualAttrValue)');
function visit1023_1318_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['1318'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1318'][1].init(47, 140, '(attValue.test && attValue.test(actualAttrValue)) || (typeof attValue == \'string\' && actualAttrValue == attValue)');
function visit1022_1318_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1318'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1317'][2].init(482, 17, 'attValue === NULL');
function visit1021_1317_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['1317'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1317'][1].init(482, 188, 'attValue === NULL || (attValue.test && attValue.test(actualAttrValue)) || (typeof attValue == \'string\' && actualAttrValue == attValue)');
function visit1020_1317_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1317'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1305'][1].init(26, 21, 'i < attributes.length');
function visit1019_1305_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1305'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1304'][1].init(83, 10, 'attributes');
function visit1018_1304_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1304'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1302'][1].init(30, 36, 'overrides && overrides["attributes"]');
function visit1017_1302_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1302'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1284'][1].init(116, 6, 'i >= 0');
function visit1016_1284_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1284'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1282'][1].init(20, 35, 'overrideElement != style["element"]');
function visit1015_1282_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1282'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1274'][1].init(263, 8, '--i >= 0');
function visit1014_1274_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1274'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1242'][1].init(307, 41, 'removeEmpty || !!element.style(styleName)');
function visit1013_1242_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1242'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1238'][1].init(51, 100, 'element.style(styleName) != normalizeProperty(styleName, styles[styleName], TRUE)');
function visit1012_1238_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1238'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1237'][1].init(97, 152, 'style._.definition["fullMatch"] && element.style(styleName) != normalizeProperty(styleName, styles[styleName], TRUE)');
function visit1011_1237_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1237'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1229'][1].init(307, 41, 'removeEmpty || !!element.hasAttr(attName)');
function visit1010_1229_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1229'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1226'][1].init(75, 91, 'element.attr(attName) != normalizeProperty(attName, attributes[attName])');
function visit1009_1226_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1226'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1225'][3].init(84, 18, 'attName == \'class\'');
function visit1008_1225_3(result) {
  _$jscoverage['/editor/styles.js'].branchData['1225'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1225'][2].init(84, 53, 'attName == \'class\' || style._.definition["fullMatch"]');
function visit1007_1225_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['1225'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1225'][1].init(84, 167, '(attName == \'class\' || style._.definition["fullMatch"]) && element.attr(attName) != normalizeProperty(attName, attributes[attName])');
function visit1006_1225_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1225'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1218'][1].init(466, 71, 'S.isEmptyObject(attributes) && S.isEmptyObject(styles)');
function visit1005_1218_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1218'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1216'][2].init(74, 20, 'overrides["*"] || {}');
function visit1004_1216_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['1216'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1216'][1].init(40, 54, 'overrides[element.nodeName()] || overrides["*"] || {}');
function visit1003_1216_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1216'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1214'][2].init(78, 20, 'overrides["*"] || {}');
function visit1002_1214_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['1214'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1214'][1].init(44, 54, 'overrides[element.nodeName()] || overrides["*"] || {}');
function visit1001_1214_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1214'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1193'][1].init(47, 35, 'overrideEl["styles"] || new Array()');
function visit1000_1193_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1193'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1188'][1].init(1755, 6, 'styles');
function visit999_1188_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1188'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1178'][1].init(51, 39, 'overrideEl["attributes"] || new Array()');
function visit998_1178_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1178'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1173'][1].init(1005, 5, 'attrs');
function visit997_1173_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1173'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1170'][1].init(898, 82, 'overrides[elementName] || (overrides[elementName] = {})');
function visit996_1170_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1170'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1156'][1].init(236, 27, 'typeof override == \'string\'');
function visit995_1156_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1156'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1149'][1].init(329, 21, 'i < definition.length');
function visit994_1149_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1149'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1145'][1].init(173, 22, '!S.isArray(definition)');
function visit993_1145_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1145'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1142'][1].init(201, 10, 'definition');
function visit992_1142_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1142'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1136'][1].init(14, 17, 'style._.overrides');
function visit991_1136_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1136'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1115'][1].init(18, 19, '!attribs[\'style\']');
function visit990_1115_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1115'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1114'][1].init(653, 9, 'styleText');
function visit989_1114_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1114'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1103'][1].init(342, 12, 'styleAttribs');
function visit988_1103_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1103'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1094'][1].init(118, 7, 'attribs');
function visit987_1094_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1094'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1073'][1].init(326, 24, 'temp.style.cssText || \'\'');
function visit986_1073_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1073'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1067'][1].init(43, 25, 'nativeNormalize !== FALSE');
function visit985_1067_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1067'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1052'][1].init(51, 27, 'target[name] == \'inherit\'');
function visit984_1052_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1052'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1051'][2].init(95, 27, 'source[name] == \'inherit\'');
function visit983_1051_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['1051'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1051'][1].init(56, 79, 'source[name] == \'inherit\' || target[name] == \'inherit\'');
function visit982_1051_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1051'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1050'][2].init(36, 32, 'target[name] == source[name]');
function visit981_1050_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['1050'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1050'][1].init(36, 136, 'target[name] == source[name] || source[name] == \'inherit\' || target[name] == \'inherit\'');
function visit980_1050_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1050'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1049'][2].init(126, 175, 'name in target && (target[name] == source[name] || source[name] == \'inherit\' || target[name] == \'inherit\')');
function visit979_1049_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['1049'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1049'][1].init(123, 180, '!(name in target && (target[name] == source[name] || source[name] == \'inherit\' || target[name] == \'inherit\'))');
function visit978_1049_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1049'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1044'][2].init(85, 25, 'typeof target == \'string\'');
function visit977_1044_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['1044'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1044'][1].init(85, 64, 'typeof target == \'string\' && (target = parseStyleText(target))');
function visit976_1044_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1044'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1043'][2].init(10, 25, 'typeof source == \'string\'');
function visit975_1043_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['1043'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1043'][1].init(10, 64, 'typeof source == \'string\' && (source = parseStyleText(source))');
function visit974_1043_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1043'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1014'][2].init(891, 49, 'nextNode[0].nodeType == Dom.NodeType.ELEMENT_NODE');
function visit973_1014_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['1014'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1014'][1].init(891, 106, 'nextNode[0].nodeType == Dom.NodeType.ELEMENT_NODE && nextNode.contains(startNode)');
function visit972_1014_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1014'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1004'][1].init(57, 53, 'overrides[currentNode.nodeName()] || overrides["*"]');
function visit971_1004_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1004'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['999'][1].init(99, 41, 'currentNode.nodeName() == this["element"]');
function visit970_999_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['999'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['996'][2].init(313, 52, 'currentNode[0].nodeType == Dom.NodeType.ELEMENT_NODE');
function visit969_996_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['996'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['996'][1].init(38, 116, 'currentNode[0].nodeType == Dom.NodeType.ELEMENT_NODE && this.checkElementRemovable(currentNode)');
function visit968_996_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['996'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['995'][1].init(272, 155, 'currentNode[0] && currentNode[0].nodeType == Dom.NodeType.ELEMENT_NODE && this.checkElementRemovable(currentNode)');
function visit967_995_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['995'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['989'][1].init(1806, 29, 'currentNode[0] !== endNode[0]');
function visit966_989_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['989'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['981'][1].init(1119, 10, 'breakStart');
function visit965_981_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['981'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['979'][1].init(1032, 8, 'breakEnd');
function visit964_979_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['979'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['975'][1].init(225, 33, 'me.checkElementRemovable(element)');
function visit963_975_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['975'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['972'][1].init(52, 29, 'element == endPath.blockLimit');
function visit962_972_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['972'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['971'][2].init(82, 24, 'element == endPath.block');
function visit961_971_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['971'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['971'][1].init(82, 82, 'element == endPath.block || element == endPath.blockLimit');
function visit960_971_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['971'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['968'][1].init(650, 27, 'i < endPath.elements.length');
function visit959_968_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['968'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['965'][1].init(235, 33, 'me.checkElementRemovable(element)');
function visit958_965_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['965'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['962'][1].init(54, 31, 'element == startPath.blockLimit');
function visit957_962_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['962'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['961'][2].init(88, 26, 'element == startPath.block');
function visit956_961_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['961'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['961'][1].init(88, 86, 'element == startPath.block || element == startPath.blockLimit');
function visit955_961_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['961'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['958'][1].init(248, 29, 'i < startPath.elements.length');
function visit954_958_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['958'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['937'][1].init(1284, 9, 'UA.webkit');
function visit953_937_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['937'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['933'][1].init(65, 15, 'tmp == \'\\u200b\'');
function visit952_933_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['933'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['931'][1].init(1028, 81, '!tmp || tmp == \'\\u200b\'');
function visit951_931_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['931'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['926'][1].init(14, 32, 'boundaryElement.match == \'start\'');
function visit950_926_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['926'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['916'][1].init(247, 16, 'newElement.match');
function visit949_916_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['916'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['913'][1].init(89, 34, 'newElement.equals(boundaryElement)');
function visit948_913_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['913'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['909'][1].init(2697, 15, 'boundaryElement');
function visit947_909_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['909'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['897'][1].init(57, 51, '_overrides[element.nodeName()] || _overrides["*"]');
function visit946_897_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['897'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['894'][1].init(664, 34, 'element.nodeName() != this.element');
function visit945_894_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['894'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['880'][1].init(252, 30, 'startOfElement || endOfElement');
function visit944_880_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['880'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['878'][1].init(108, 94, '!endOfElement && range.checkBoundaryOfElement(element, KER.START)');
function visit943_878_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['878'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['876'][1].init(598, 35, 'this.checkElementRemovable(element)');
function visit942_876_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['876'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['873'][1].init(50, 31, 'element == startPath.blockLimit');
function visit941_873_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['873'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['872'][2].init(444, 26, 'element == startPath.block');
function visit940_872_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['872'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['872'][1].init(444, 82, 'element == startPath.block || element == startPath.blockLimit');
function visit939_872_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['872'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['863'][2].init(227, 29, 'i < startPath.elements.length');
function visit938_863_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['863'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['863'][1].init(227, 85, 'i < startPath.elements.length && (element = startPath.elements[i])');
function visit937_863_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['863'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['856'][1].init(318, 15, 'range.collapsed');
function visit936_856_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['856'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['807'][1].init(1185, 9, '!UA[\'ie\']');
function visit935_807_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['807'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['786'][1].init(2643, 9, 'styleNode');
function visit934_786_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['786'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['777'][1].init(1471, 30, '!styleNode._4e_hasAttributes()');
function visit933_777_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['777'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['769'][1].init(226, 35, 'styleNode.style(styleName) == value');
function visit932_769_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['769'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['765'][1].init(36, 110, 'removeList.blockedStyles[styleName] || !(value = parent.style(styleName))');
function visit931_765_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['765'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['752'][1].init(222, 32, 'styleNode.attr(attName) == value');
function visit930_752_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['752'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['748'][1].init(36, 106, 'removeList.blockedAttrs[attName] || !(value = parent.attr(styleName))');
function visit929_748_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['748'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['745'][1].init(26, 32, 'parent.nodeName() == elementName');
function visit928_745_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['745'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['744'][3].init(825, 25, 'styleNode[0] && parent[0]');
function visit927_744_3(result) {
  _$jscoverage['/editor/styles.js'].branchData['744'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['744'][2].init(815, 35, 'parent && styleNode[0] && parent[0]');
function visit926_744_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['744'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['744'][1].init(802, 48, 'styleNode && parent && styleNode[0] && parent[0]');
function visit925_744_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['744'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['723'][2].init(6543, 35, 'styleRange && !styleRange.collapsed');
function visit924_723_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['723'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['723'][1].init(6529, 49, 'applyStyle && styleRange && !styleRange.collapsed');
function visit923_723_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['723'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['704'][1].init(468, 49, '!def["childRule"] || def["childRule"](parentNode)');
function visit922_704_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['704'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['697'][2].init(1142, 426, '(parentNode._4e_position(firstNode) | KEP.POSITION_FOLLOWING | KEP.POSITION_IDENTICAL | KEP.POSITION_IS_CONTAINED) == (KEP.POSITION_FOLLOWING + KEP.POSITION_IDENTICAL + KEP.POSITION_IS_CONTAINED)');
function visit921_697_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['697'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['697'][1].init(148, 520, '(parentNode._4e_position(firstNode) | KEP.POSITION_FOLLOWING | KEP.POSITION_IDENTICAL | KEP.POSITION_IS_CONTAINED) == (KEP.POSITION_FOLLOWING + KEP.POSITION_IDENTICAL + KEP.POSITION_IS_CONTAINED) && (!def["childRule"] || def["childRule"](parentNode))');
function visit920_697_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['697'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['695'][2].init(992, 104, '(parentNode = includedNode.parent()) && dtd[parentNode.nodeName()]');
function visit919_695_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['695'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['695'][1].init(91, 669, '((parentNode = includedNode.parent()) && dtd[parentNode.nodeName()]) && (parentNode._4e_position(firstNode) | KEP.POSITION_FOLLOWING | KEP.POSITION_IDENTICAL | KEP.POSITION_IS_CONTAINED) == (KEP.POSITION_FOLLOWING + KEP.POSITION_IDENTICAL + KEP.POSITION_IS_CONTAINED) && (!def["childRule"] || def["childRule"](parentNode))');
function visit918_695_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['695'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['694'][1].init(41, 761, '(applyStyle = !includedNode.next(notBookmark, 1)) && ((parentNode = includedNode.parent()) && dtd[parentNode.nodeName()]) && (parentNode._4e_position(firstNode) | KEP.POSITION_FOLLOWING | KEP.POSITION_IDENTICAL | KEP.POSITION_IS_CONTAINED) == (KEP.POSITION_FOLLOWING + KEP.POSITION_IDENTICAL + KEP.POSITION_IS_CONTAINED) && (!def["childRule"] || def["childRule"](parentNode))');
function visit917_694_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['694'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['679'][2].init(68, 37, 'nodeType == Dom.NodeType.ELEMENT_NODE');
function visit916_679_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['679'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['679'][1].init(68, 74, 'nodeType == Dom.NodeType.ELEMENT_NODE && !currentNode[0].childNodes.length');
function visit915_679_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['679'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['678'][2].init(1311, 34, 'nodeType == Dom.NodeType.TEXT_NODE');
function visit914_678_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['678'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['678'][1].init(1311, 145, 'nodeType == Dom.NodeType.TEXT_NODE || (nodeType == Dom.NodeType.ELEMENT_NODE && !currentNode[0].childNodes.length)');
function visit913_678_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['678'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['663'][1].init(67, 447, '(currentNode._4e_position(lastNode) | (KEP.POSITION_PRECEDING | KEP.POSITION_IDENTICAL | KEP.POSITION_IS_CONTAINED)) == (KEP.POSITION_PRECEDING + KEP.POSITION_IDENTICAL + KEP.POSITION_IS_CONTAINED)');
function visit912_663_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['663'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['662'][1].init(45, 515, '!DTD.$removeEmpty[nodeName] || (currentNode._4e_position(lastNode) | (KEP.POSITION_PRECEDING | KEP.POSITION_IDENTICAL | KEP.POSITION_IS_CONTAINED)) == (KEP.POSITION_PRECEDING + KEP.POSITION_IDENTICAL + KEP.POSITION_IS_CONTAINED)');
function visit911_662_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['662'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['661'][1].init(45, 561, '!nodeName || !DTD.$removeEmpty[nodeName] || (currentNode._4e_position(lastNode) | (KEP.POSITION_PRECEDING | KEP.POSITION_IDENTICAL | KEP.POSITION_IS_CONTAINED)) == (KEP.POSITION_PRECEDING + KEP.POSITION_IDENTICAL + KEP.POSITION_IS_CONTAINED)');
function visit910_661_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['661'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['660'][1].init(342, 642, '!styleRange && (!nodeName || !DTD.$removeEmpty[nodeName] || (currentNode._4e_position(lastNode) | (KEP.POSITION_PRECEDING | KEP.POSITION_IDENTICAL | KEP.POSITION_IS_CONTAINED)) == (KEP.POSITION_PRECEDING + KEP.POSITION_IDENTICAL + KEP.POSITION_IS_CONTAINED))');
function visit909_660_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['660'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['655'][1].init(163, 54, '!def["parentRule"] || def["parentRule"](currentParent)');
function visit908_655_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['655'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['652'][2].init(-1, 69, 'DTD[currentParent.nodeName()] || DTD["span"]');
function visit907_652_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['652'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['653'][1].init(-1, 131, '(DTD[currentParent.nodeName()] || DTD["span"])[elementName] || isUnknownElement');
function visit906_653_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['653'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['652'][1].init(48, 220, '((DTD[currentParent.nodeName()] || DTD["span"])[elementName] || isUnknownElement) && (!def["parentRule"] || def["parentRule"](currentParent))');
function visit905_652_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['652'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['651'][2].init(1285, 269, 'currentParent[0] && ((DTD[currentParent.nodeName()] || DTD["span"])[elementName] || isUnknownElement) && (!def["parentRule"] || def["parentRule"](currentParent))');
function visit904_651_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['651'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['651'][1].init(1268, 286, 'currentParent && currentParent[0] && ((DTD[currentParent.nodeName()] || DTD["span"])[elementName] || isUnknownElement) && (!def["parentRule"] || def["parentRule"](currentParent))');
function visit903_651_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['651'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['642'][1].init(46, 39, 'currentParent.nodeName() == elementName');
function visit902_642_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['642'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['641'][2].init(663, 18, 'elementName == "a"');
function visit901_641_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['641'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['641'][1].init(41, 86, 'elementName == "a" && currentParent.nodeName() == elementName');
function visit900_641_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['641'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['640'][1].init(619, 128, 'currentParent && elementName == "a" && currentParent.nodeName() == elementName');
function visit899_640_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['640'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['627'][1].init(412, 50, '!def["childRule"] || def["childRule"](currentNode)');
function visit898_627_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['627'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['620'][2].init(83, 382, '(currentNode._4e_position(lastNode) | (KEP.POSITION_PRECEDING | KEP.POSITION_IDENTICAL | KEP.POSITION_IS_CONTAINED)) == (KEP.POSITION_PRECEDING + KEP.POSITION_IDENTICAL + KEP.POSITION_IS_CONTAINED)');
function visit897_620_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['620'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['620'][1].init(45, 465, '(currentNode._4e_position(lastNode) | (KEP.POSITION_PRECEDING | KEP.POSITION_IDENTICAL | KEP.POSITION_IS_CONTAINED)) == (KEP.POSITION_PRECEDING + KEP.POSITION_IDENTICAL + KEP.POSITION_IS_CONTAINED) && (!def["childRule"] || def["childRule"](currentNode))');
function visit896_620_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['620'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['619'][1].init(-1, 511, 'dtd[nodeName] && (currentNode._4e_position(lastNode) | (KEP.POSITION_PRECEDING | KEP.POSITION_IDENTICAL | KEP.POSITION_IS_CONTAINED)) == (KEP.POSITION_PRECEDING + KEP.POSITION_IDENTICAL + KEP.POSITION_IS_CONTAINED) && (!def["childRule"] || def["childRule"](currentNode))');
function visit895_619_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['619'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['618'][1].init(486, 570, '!nodeName || (dtd[nodeName] && (currentNode._4e_position(lastNode) | (KEP.POSITION_PRECEDING | KEP.POSITION_IDENTICAL | KEP.POSITION_IS_CONTAINED)) == (KEP.POSITION_PRECEDING + KEP.POSITION_IDENTICAL + KEP.POSITION_IS_CONTAINED) && (!def["childRule"] || def["childRule"](currentNode)))');
function visit894_618_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['618'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['612'][1].init(209, 44, 'nodeName && currentNode.attr(\'_ke_bookmark\')');
function visit893_612_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['612'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['609'][1].init(71, 37, 'nodeType == Dom.NodeType.ELEMENT_NODE');
function visit892_609_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['609'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['603'][1].init(57, 33, 'Dom.equals(currentNode, lastNode)');
function visit891_603_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['603'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['600'][1].init(1431, 29, 'currentNode && currentNode[0]');
function visit890_600_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['600'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['580'][1].init(782, 4, '!dtd');
function visit889_580_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['580'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['566'][1].init(82, 15, 'range.collapsed');
function visit888_566_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['566'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['537'][1].init(135, 7, '!offset');
function visit887_537_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['537'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['535'][1].init(22, 17, 'match.length == 1');
function visit886_535_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['535'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['525'][1].init(101, 19, 'i < preHTMLs.length');
function visit885_525_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['525'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['512'][1].init(812, 8, 'UA[\'ie\']');
function visit884_512_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['512'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['498'][1].init(98, 33, 'previousBlock.nodeName() == \'pre\'');
function visit883_498_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['498'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['497'][2].init(47, 132, '(previousBlock = preBlock._4e_previousSourceNode(TRUE, Dom.NodeType.ELEMENT_NODE)) && previousBlock.nodeName() == \'pre\'');
function visit882_497_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['497'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['497'][1].init(42, 139, '!((previousBlock = preBlock._4e_previousSourceNode(TRUE, Dom.NodeType.ELEMENT_NODE)) && previousBlock.nodeName() == \'pre\')');
function visit881_497_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['497'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['486'][1].init(595, 13, 'newBlockIsPre');
function visit880_486_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['486'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['479'][1].init(312, 9, 'isFromPre');
function visit879_479_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['479'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['477'][1].init(236, 7, 'isToPre');
function visit878_477_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['477'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['475'][1].init(180, 28, '!newBlockIsPre && blockIsPre');
function visit877_475_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['475'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['474'][1].init(125, 28, 'newBlockIsPre && !blockIsPre');
function visit876_474_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['474'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['473'][1].init(75, 25, 'block.nodeName == (\'pre\')');
function visit875_473_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['473'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['472'][1].init(30, 28, 'newBlock.nodeName == (\'pre\')');
function visit874_472_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['472'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['432'][1].init(962, 8, 'UA[\'ie\']');
function visit873_432_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['432'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['405'][1].init(64, 27, 'm2 && (tailBookmark = m2)');
function visit872_405_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['405'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['404'][1].init(18, 27, 'm1 && (headBookmark = m1)');
function visit871_404_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['404'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['371'][1].init(384, 6, 'styles');
function visit870_371_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['371'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['363'][1].init(195, 10, 'attributes');
function visit869_363_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['363'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['351'][1].init(439, 7, 'element');
function visit868_351_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['351'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['344'][1].init(189, 18, 'elementName == \'*\'');
function visit867_344_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['344'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['329'][1].init(1091, 17, 'stylesText.length');
function visit866_329_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['329'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['320'][1].init(251, 21, 'styleVal == \'inherit\'');
function visit865_320_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['320'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['311'][1].init(428, 17, 'stylesText.length');
function visit864_311_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['311'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['307'][2].init(276, 90, 'styleDefinition["attributes"] && styleDefinition["attributes"][\'style\']');
function visit863_307_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['307'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['307'][1].init(276, 98, '(styleDefinition["attributes"] && styleDefinition["attributes"][\'style\']) || \'\'');
function visit862_307_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['307'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['301'][1].init(120, 9, 'stylesDef');
function visit861_301_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['301'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['289'][1].init(511, 41, 'this.checkElementRemovable(element, TRUE)');
function visit860_289_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['289'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['285'][2].init(335, 30, 'this.type == KEST.STYLE_OBJECT');
function visit859_285_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['285'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['285'][1].init(335, 104, 'this.type == KEST.STYLE_OBJECT && !(element.nodeName() in objectElements)');
function visit858_285_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['285'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['281'][1].init(64, 114, 'Dom.equals(element, elementPath.block) || Dom.equals(element, elementPath.blockLimit)');
function visit857_281_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['281'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['280'][2].init(82, 30, 'this.type == KEST.STYLE_INLINE');
function visit856_280_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['280'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['280'][1].init(82, 181, 'this.type == KEST.STYLE_INLINE && (Dom.equals(element, elementPath.block) || Dom.equals(element, elementPath.blockLimit))');
function visit855_280_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['280'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['277'][1].init(132, 19, 'i < elements.length');
function visit854_277_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['277'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['269'][1].init(78, 68, 'elementPath.block || elementPath.blockLimit');
function visit853_269_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['269'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['253'][1].init(134, 52, 'styleValue.test && styleValue.test(actualStyleValue)');
function visit852_253_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['253'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['252'][1].init(65, 30, 'actualStyleValue == styleValue');
function visit851_252_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['252'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['251'][3].init(270, 29, 'typeof styleValue == \'string\'');
function visit850_251_3(result) {
  _$jscoverage['/editor/styles.js'].branchData['251'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['251'][2].init(270, 96, 'typeof styleValue == \'string\' && actualStyleValue == styleValue');
function visit849_251_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['251'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['251'][1].init(173, 187, '(typeof styleValue == \'string\' && actualStyleValue == styleValue) || styleValue.test && styleValue.test(actualStyleValue)');
function visit848_251_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['251'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['248'][2].init(94, 19, 'styleValue === NULL');
function visit847_248_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['248'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['248'][1].init(94, 361, 'styleValue === NULL || (typeof styleValue == \'string\' && actualStyleValue == styleValue) || styleValue.test && styleValue.test(actualStyleValue)');
function visit846_248_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['248'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['246'][1].init(157, 16, 'actualStyleValue');
function visit845_246_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['246'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['243'][1].init(34, 17, 'i < styles.length');
function visit844_243_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['243'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['242'][1].init(1421, 6, 'styles');
function visit843_242_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['242'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['237'][1].init(133, 47, 'attValue.test && attValue.test(actualAttrValue)');
function visit842_237_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['237'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['236'][1].init(67, 27, 'actualAttrValue == attValue');
function visit841_236_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['236'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['235'][3].init(598, 27, 'typeof attValue == \'string\'');
function visit840_235_3(result) {
  _$jscoverage['/editor/styles.js'].branchData['235'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['235'][2].init(598, 95, 'typeof attValue == \'string\' && actualAttrValue == attValue');
function visit839_235_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['235'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['235'][1].init(55, 181, '(typeof attValue == \'string\' && actualAttrValue == attValue) || attValue.test && attValue.test(actualAttrValue)');
function visit838_235_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['235'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['234'][2].init(540, 17, 'attValue === NULL');
function visit837_234_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['234'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['234'][1].init(540, 237, 'attValue === NULL || (typeof attValue == \'string\' && actualAttrValue == attValue) || attValue.test && attValue.test(actualAttrValue)');
function visit836_234_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['234'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['226'][1].init(150, 15, 'actualAttrValue');
function visit835_226_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['226'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['223'][1].init(38, 18, 'i < attribs.length');
function visit834_223_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['223'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['222'][1].init(264, 7, 'attribs');
function visit833_222_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['222'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['218'][1].init(98, 87, '!(attribs = override.attributes) && !(styles = override.styles)');
function visit832_218_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['218'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['216'][1].init(1610, 8, 'override');
function visit831_216_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['216'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['214'][1].init(63, 49, 'overrides[element.nodeName()] || overrides["*"]');
function visit830_214_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['214'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['205'][1].init(728, 9, 'fullMatch');
function visit829_205_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['205'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['201'][1].init(573, 9, 'fullMatch');
function visit828_201_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['201'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['198'][1].init(34, 10, '!fullMatch');
function visit827_198_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['198'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['197'][1].init(186, 33, 'attribs[attName] == elementAttr');
function visit826_197_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['197'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['194'][2].init(196, 18, 'attName == \'style\'');
function visit825_194_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['194'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['194'][1].init(196, 220, 'attName == \'style\' ? compareCssText(attribs[attName], normalizeCssText(elementAttr, FALSE)) : attribs[attName] == elementAttr');
function visit824_194_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['194'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['193'][1].init(138, 27, 'element.attr(attName) || \'\'');
function visit823_193_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['193'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['190'][1].init(32, 20, 'attName == \'_length\'');
function visit822_190_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['190'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['187'][1].init(250, 18, 'attribs["_length"]');
function visit821_187_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['187'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['182'][1].init(87, 42, '!fullMatch && !element._4e_hasAttributes()');
function visit820_182_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['182'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['180'][1].init(223, 34, 'element.nodeName() == this.element');
function visit819_180_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['180'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['173'][1].init(18, 8, '!element');
function visit818_173_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['173'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['162'][1].init(39, 30, 'self.type == KEST.STYLE_INLINE');
function visit817_162_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['162'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['152'][1].init(91, 30, 'self.type == KEST.STYLE_OBJECT');
function visit816_152_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['152'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['150'][1].init(93, 29, 'self.type == KEST.STYLE_BLOCK');
function visit815_150_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['150'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['148'][1].init(36, 30, 'this.type == KEST.STYLE_INLINE');
function visit814_148_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['148'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['126'][1].init(458, 17, 'i < ranges.length');
function visit813_126_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['126'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['100'][2].init(317, 18, 'element == \'#text\'');
function visit812_100_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['100'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['100'][1].init(317, 46, 'element == \'#text\' || blockElements[element]');
function visit811_100_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['100'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['98'][1].init(226, 33, 'styleDefinition["element"] || \'*\'');
function visit810_98_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['98'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['93'][1].init(14, 15, 'variablesValues');
function visit809_93_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['93'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['77'][1].init(18, 33, 'typeof (list[item]) == \'string\'');
function visit808_77_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['77'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].lineData[9]++;
KISSY.add("editor/styles", function(S, Editor) {
  _$jscoverage['/editor/styles.js'].functionData[0]++;
  _$jscoverage['/editor/styles.js'].lineData[10]++;
  var TRUE = true, FALSE = false, NULL = null, $ = S.all, Dom = S.DOM, KEST = {
  STYLE_BLOCK: 1, 
  STYLE_INLINE: 2, 
  STYLE_OBJECT: 3}, KER = Editor.RangeType, KESelection = Editor.Selection, KEP = Editor.PositionType, KERange = Editor.Range, Node = S.Node, UA = S.UA, ElementPath = Editor.ElementPath, blockElements = {
  "address": 1, 
  "div": 1, 
  "h1": 1, 
  "h2": 1, 
  "h3": 1, 
  "h4": 1, 
  "h5": 1, 
  "h6": 1, 
  "p": 1, 
  "pre": 1}, DTD = Editor.XHTML_DTD, objectElements = {
  "embed": 1, 
  "hr": 1, 
  "img": 1, 
  "li": 1, 
  "object": 1, 
  "ol": 1, 
  "table": 1, 
  "td": 1, 
  "tr": 1, 
  "th": 1, 
  "ul": 1, 
  "dl": 1, 
  "dt": 1, 
  "dd": 1, 
  "form": 1}, semicolonFixRegex = /\s*(?:;\s*|$)/g, varRegex = /#\((.+?)\)/g;
  _$jscoverage['/editor/styles.js'].lineData[67]++;
  Editor.StyleType = KEST;
  _$jscoverage['/editor/styles.js'].lineData[69]++;
  function notBookmark(node) {
    _$jscoverage['/editor/styles.js'].functionData[1]++;
    _$jscoverage['/editor/styles.js'].lineData[72]++;
    return !Dom.attr(node, "_ke_bookmark");
  }
  _$jscoverage['/editor/styles.js'].lineData[75]++;
  function replaceVariables(list, variablesValues) {
    _$jscoverage['/editor/styles.js'].functionData[2]++;
    _$jscoverage['/editor/styles.js'].lineData[76]++;
    for (var item in list) {
      _$jscoverage['/editor/styles.js'].lineData[77]++;
      if (visit808_77_1(typeof (list[item]) == 'string')) {
        _$jscoverage['/editor/styles.js'].lineData[78]++;
        list[item] = list[item].replace(varRegex, function(match, varName) {
  _$jscoverage['/editor/styles.js'].functionData[3]++;
  _$jscoverage['/editor/styles.js'].lineData[79]++;
  return variablesValues[varName];
});
      } else {
        _$jscoverage['/editor/styles.js'].lineData[82]++;
        replaceVariables(list[item], variablesValues);
      }
    }
  }
  _$jscoverage['/editor/styles.js'].lineData[92]++;
  function KEStyle(styleDefinition, variablesValues) {
    _$jscoverage['/editor/styles.js'].functionData[4]++;
    _$jscoverage['/editor/styles.js'].lineData[93]++;
    if (visit809_93_1(variablesValues)) {
      _$jscoverage['/editor/styles.js'].lineData[94]++;
      styleDefinition = S.clone(styleDefinition);
      _$jscoverage['/editor/styles.js'].lineData[95]++;
      replaceVariables(styleDefinition, variablesValues);
    }
    _$jscoverage['/editor/styles.js'].lineData[98]++;
    var element = this["element"] = this.element = (visit810_98_1(styleDefinition["element"] || '*')).toLowerCase();
    _$jscoverage['/editor/styles.js'].lineData[100]++;
    this["type"] = this.type = (visit811_100_1(visit812_100_2(element == '#text') || blockElements[element])) ? KEST.STYLE_BLOCK : objectElements[element] ? KEST.STYLE_OBJECT : KEST.STYLE_INLINE;
    _$jscoverage['/editor/styles.js'].lineData[105]++;
    this._ = {
  "definition": styleDefinition};
  }
  _$jscoverage['/editor/styles.js'].lineData[115]++;
  function applyStyle(document, remove) {
    _$jscoverage['/editor/styles.js'].functionData[5]++;
    _$jscoverage['/editor/styles.js'].lineData[117]++;
    var self = this, func = remove ? self.removeFromRange : self.applyToRange;
    _$jscoverage['/editor/styles.js'].lineData[121]++;
    document.body.focus();
    _$jscoverage['/editor/styles.js'].lineData[123]++;
    var selection = new KESelection(document);
    _$jscoverage['/editor/styles.js'].lineData[125]++;
    var ranges = selection.getRanges();
    _$jscoverage['/editor/styles.js'].lineData[126]++;
    for (var i = 0; visit813_126_1(i < ranges.length); i++) {
      _$jscoverage['/editor/styles.js'].lineData[128]++;
      func.call(self, ranges[i]);
    }
    _$jscoverage['/editor/styles.js'].lineData[130]++;
    selection.selectRanges(ranges);
  }
  _$jscoverage['/editor/styles.js'].lineData[133]++;
  KEStyle.prototype = {
  constructor: KEStyle, 
  apply: function(document) {
  _$jscoverage['/editor/styles.js'].functionData[6]++;
  _$jscoverage['/editor/styles.js'].lineData[138]++;
  applyStyle.call(this, document, FALSE);
}, 
  remove: function(document) {
  _$jscoverage['/editor/styles.js'].functionData[7]++;
  _$jscoverage['/editor/styles.js'].lineData[142]++;
  applyStyle.call(this, document, TRUE);
}, 
  applyToRange: function(range) {
  _$jscoverage['/editor/styles.js'].functionData[8]++;
  _$jscoverage['/editor/styles.js'].lineData[146]++;
  var self = this;
  _$jscoverage['/editor/styles.js'].lineData[147]++;
  return (self.applyToRange = visit814_148_1(this.type == KEST.STYLE_INLINE) ? applyInlineStyle : visit815_150_1(self.type == KEST.STYLE_BLOCK) ? applyBlockStyle : visit816_152_1(self.type == KEST.STYLE_OBJECT) ? NULL : NULL).call(self, range);
}, 
  removeFromRange: function(range) {
  _$jscoverage['/editor/styles.js'].functionData[9]++;
  _$jscoverage['/editor/styles.js'].lineData[160]++;
  var self = this;
  _$jscoverage['/editor/styles.js'].lineData[161]++;
  return (self.removeFromRange = visit817_162_1(self.type == KEST.STYLE_INLINE) ? removeInlineStyle : NULL).call(self, range);
}, 
  checkElementRemovable: function(element, fullMatch) {
  _$jscoverage['/editor/styles.js'].functionData[10]++;
  _$jscoverage['/editor/styles.js'].lineData[173]++;
  if (visit818_173_1(!element)) {
    _$jscoverage['/editor/styles.js'].lineData[174]++;
    return FALSE;
  }
  _$jscoverage['/editor/styles.js'].lineData[176]++;
  var def = this._.definition, attribs, styles;
  _$jscoverage['/editor/styles.js'].lineData[180]++;
  if (visit819_180_1(element.nodeName() == this.element)) {
    _$jscoverage['/editor/styles.js'].lineData[182]++;
    if (visit820_182_1(!fullMatch && !element._4e_hasAttributes())) {
      _$jscoverage['/editor/styles.js'].lineData[183]++;
      return TRUE;
    }
    _$jscoverage['/editor/styles.js'].lineData[185]++;
    attribs = getAttributesForComparison(def);
    _$jscoverage['/editor/styles.js'].lineData[187]++;
    if (visit821_187_1(attribs["_length"])) {
      _$jscoverage['/editor/styles.js'].lineData[188]++;
      for (var attName in attribs) {
        _$jscoverage['/editor/styles.js'].lineData[190]++;
        if (visit822_190_1(attName == '_length')) {
          _$jscoverage['/editor/styles.js'].lineData[191]++;
          continue;
        }
        _$jscoverage['/editor/styles.js'].lineData[193]++;
        var elementAttr = visit823_193_1(element.attr(attName) || '');
        _$jscoverage['/editor/styles.js'].lineData[194]++;
        if (visit824_194_1(visit825_194_2(attName == 'style') ? compareCssText(attribs[attName], normalizeCssText(elementAttr, FALSE)) : visit826_197_1(attribs[attName] == elementAttr))) {
          _$jscoverage['/editor/styles.js'].lineData[198]++;
          if (visit827_198_1(!fullMatch)) {
            _$jscoverage['/editor/styles.js'].lineData[199]++;
            return TRUE;
          }
        } else {
          _$jscoverage['/editor/styles.js'].lineData[201]++;
          if (visit828_201_1(fullMatch)) {
            _$jscoverage['/editor/styles.js'].lineData[202]++;
            return FALSE;
          }
        }
      }
      _$jscoverage['/editor/styles.js'].lineData[205]++;
      if (visit829_205_1(fullMatch)) {
        _$jscoverage['/editor/styles.js'].lineData[206]++;
        return TRUE;
      }
    } else {
      _$jscoverage['/editor/styles.js'].lineData[209]++;
      return TRUE;
    }
  }
  _$jscoverage['/editor/styles.js'].lineData[213]++;
  var overrides = getOverrides(this), override = visit830_214_1(overrides[element.nodeName()] || overrides["*"]);
  _$jscoverage['/editor/styles.js'].lineData[216]++;
  if (visit831_216_1(override)) {
    _$jscoverage['/editor/styles.js'].lineData[218]++;
    if (visit832_218_1(!(attribs = override.attributes) && !(styles = override.styles))) {
      _$jscoverage['/editor/styles.js'].lineData[221]++;
      return TRUE;
    }
    _$jscoverage['/editor/styles.js'].lineData[222]++;
    if (visit833_222_1(attribs)) {
      _$jscoverage['/editor/styles.js'].lineData[223]++;
      for (var i = 0; visit834_223_1(i < attribs.length); i++) {
        _$jscoverage['/editor/styles.js'].lineData[224]++;
        attName = attribs[i][0];
        _$jscoverage['/editor/styles.js'].lineData[225]++;
        var actualAttrValue = element.attr(attName);
        _$jscoverage['/editor/styles.js'].lineData[226]++;
        if (visit835_226_1(actualAttrValue)) {
          _$jscoverage['/editor/styles.js'].lineData[227]++;
          var attValue = attribs[i][1];
          _$jscoverage['/editor/styles.js'].lineData[234]++;
          if (visit836_234_1(visit837_234_2(attValue === NULL) || visit838_235_1((visit839_235_2(visit840_235_3(typeof attValue == 'string') && visit841_236_1(actualAttrValue == attValue))) || visit842_237_1(attValue.test && attValue.test(actualAttrValue))))) {
            _$jscoverage['/editor/styles.js'].lineData[238]++;
            return TRUE;
          }
        }
      }
    }
    _$jscoverage['/editor/styles.js'].lineData[242]++;
    if (visit843_242_1(styles)) {
      _$jscoverage['/editor/styles.js'].lineData[243]++;
      for (i = 0; visit844_243_1(i < styles.length); i++) {
        _$jscoverage['/editor/styles.js'].lineData[244]++;
        var styleName = styles[i][0];
        _$jscoverage['/editor/styles.js'].lineData[245]++;
        var actualStyleValue = element.css(styleName);
        _$jscoverage['/editor/styles.js'].lineData[246]++;
        if (visit845_246_1(actualStyleValue)) {
          _$jscoverage['/editor/styles.js'].lineData[247]++;
          var styleValue = styles[i][1];
          _$jscoverage['/editor/styles.js'].lineData[248]++;
          if (visit846_248_1(visit847_248_2(styleValue === NULL) || visit848_251_1((visit849_251_2(visit850_251_3(typeof styleValue == 'string') && visit851_252_1(actualStyleValue == styleValue))) || visit852_253_1(styleValue.test && styleValue.test(actualStyleValue))))) {
            _$jscoverage['/editor/styles.js'].lineData[254]++;
            return TRUE;
          }
        }
      }
    }
  }
  _$jscoverage['/editor/styles.js'].lineData[259]++;
  return FALSE;
}, 
  checkActive: function(elementPath) {
  _$jscoverage['/editor/styles.js'].functionData[11]++;
  _$jscoverage['/editor/styles.js'].lineData[267]++;
  switch (this.type) {
    case KEST.STYLE_BLOCK:
      _$jscoverage['/editor/styles.js'].lineData[269]++;
      return this.checkElementRemovable(visit853_269_1(elementPath.block || elementPath.blockLimit), TRUE);
    case KEST.STYLE_OBJECT:
    case KEST.STYLE_INLINE:
      _$jscoverage['/editor/styles.js'].lineData[275]++;
      var elements = elementPath.elements;
      _$jscoverage['/editor/styles.js'].lineData[277]++;
      for (var i = 0, element; visit854_277_1(i < elements.length); i++) {
        _$jscoverage['/editor/styles.js'].lineData[278]++;
        element = elements[i];
        _$jscoverage['/editor/styles.js'].lineData[280]++;
        if (visit855_280_1(visit856_280_2(this.type == KEST.STYLE_INLINE) && (visit857_281_1(Dom.equals(element, elementPath.block) || Dom.equals(element, elementPath.blockLimit))))) {
          _$jscoverage['/editor/styles.js'].lineData[283]++;
          continue;
        }
        _$jscoverage['/editor/styles.js'].lineData[285]++;
        if (visit858_285_1(visit859_285_2(this.type == KEST.STYLE_OBJECT) && !(element.nodeName() in objectElements))) {
          _$jscoverage['/editor/styles.js'].lineData[287]++;
          continue;
        }
        _$jscoverage['/editor/styles.js'].lineData[289]++;
        if (visit860_289_1(this.checkElementRemovable(element, TRUE))) {
          _$jscoverage['/editor/styles.js'].lineData[290]++;
          return TRUE;
        }
      }
  }
  _$jscoverage['/editor/styles.js'].lineData[293]++;
  return FALSE;
}};
  _$jscoverage['/editor/styles.js'].lineData[298]++;
  KEStyle.getStyleText = function(styleDefinition) {
  _$jscoverage['/editor/styles.js'].functionData[12]++;
  _$jscoverage['/editor/styles.js'].lineData[300]++;
  var stylesDef = styleDefinition._ST;
  _$jscoverage['/editor/styles.js'].lineData[301]++;
  if (visit861_301_1(stylesDef)) {
    _$jscoverage['/editor/styles.js'].lineData[302]++;
    return stylesDef;
  }
  _$jscoverage['/editor/styles.js'].lineData[304]++;
  stylesDef = styleDefinition["styles"];
  _$jscoverage['/editor/styles.js'].lineData[307]++;
  var stylesText = visit862_307_1((visit863_307_2(styleDefinition["attributes"] && styleDefinition["attributes"]['style'])) || ''), specialStylesText = '';
  _$jscoverage['/editor/styles.js'].lineData[311]++;
  if (visit864_311_1(stylesText.length)) {
    _$jscoverage['/editor/styles.js'].lineData[312]++;
    stylesText = stylesText.replace(semicolonFixRegex, ';');
  }
  _$jscoverage['/editor/styles.js'].lineData[314]++;
  for (var style in stylesDef) {
    _$jscoverage['/editor/styles.js'].lineData[316]++;
    var styleVal = stylesDef[style], text = (style + ':' + styleVal).replace(semicolonFixRegex, ';');
    _$jscoverage['/editor/styles.js'].lineData[320]++;
    if (visit865_320_1(styleVal == 'inherit')) {
      _$jscoverage['/editor/styles.js'].lineData[321]++;
      specialStylesText += text;
    } else {
      _$jscoverage['/editor/styles.js'].lineData[323]++;
      stylesText += text;
    }
  }
  _$jscoverage['/editor/styles.js'].lineData[329]++;
  if (visit866_329_1(stylesText.length)) {
    _$jscoverage['/editor/styles.js'].lineData[330]++;
    stylesText = normalizeCssText(stylesText);
  }
  _$jscoverage['/editor/styles.js'].lineData[332]++;
  stylesText += specialStylesText;
  _$jscoverage['/editor/styles.js'].lineData[335]++;
  return (styleDefinition._ST = stylesText);
};
  _$jscoverage['/editor/styles.js'].lineData[338]++;
  function getElement(style, targetDocument, element) {
    _$jscoverage['/editor/styles.js'].functionData[13]++;
    _$jscoverage['/editor/styles.js'].lineData[339]++;
    var el, elementName = style["element"];
    _$jscoverage['/editor/styles.js'].lineData[344]++;
    if (visit867_344_1(elementName == '*')) {
      _$jscoverage['/editor/styles.js'].lineData[345]++;
      elementName = 'span';
    }
    _$jscoverage['/editor/styles.js'].lineData[348]++;
    el = new Node(targetDocument.createElement(elementName));
    _$jscoverage['/editor/styles.js'].lineData[351]++;
    if (visit868_351_1(element)) {
      _$jscoverage['/editor/styles.js'].lineData[352]++;
      element._4e_copyAttributes(el);
    }
    _$jscoverage['/editor/styles.js'].lineData[354]++;
    return setupElement(el, style);
  }
  _$jscoverage['/editor/styles.js'].lineData[357]++;
  function setupElement(el, style) {
    _$jscoverage['/editor/styles.js'].functionData[14]++;
    _$jscoverage['/editor/styles.js'].lineData[358]++;
    var def = style._["definition"], attributes = def["attributes"], styles = KEStyle.getStyleText(def);
    _$jscoverage['/editor/styles.js'].lineData[363]++;
    if (visit869_363_1(attributes)) {
      _$jscoverage['/editor/styles.js'].lineData[364]++;
      for (var att in attributes) {
        _$jscoverage['/editor/styles.js'].lineData[365]++;
        el.attr(att, attributes[att]);
      }
    }
    _$jscoverage['/editor/styles.js'].lineData[371]++;
    if (visit870_371_1(styles)) {
      _$jscoverage['/editor/styles.js'].lineData[372]++;
      el[0].style.cssText = styles;
    }
    _$jscoverage['/editor/styles.js'].lineData[374]++;
    return el;
  }
  _$jscoverage['/editor/styles.js'].lineData[377]++;
  function applyBlockStyle(range) {
    _$jscoverage['/editor/styles.js'].functionData[15]++;
    _$jscoverage['/editor/styles.js'].lineData[380]++;
    var bookmark = range.createBookmark(TRUE), iterator = range.createIterator();
    _$jscoverage['/editor/styles.js'].lineData[382]++;
    iterator.enforceRealBlocks = TRUE;
    _$jscoverage['/editor/styles.js'].lineData[386]++;
    iterator.enlargeBr = TRUE;
    _$jscoverage['/editor/styles.js'].lineData[388]++;
    var block, doc = range.document;
    _$jscoverage['/editor/styles.js'].lineData[390]++;
    while ((block = iterator.getNextParagraph())) {
      _$jscoverage['/editor/styles.js'].lineData[391]++;
      var newBlock = getElement(this, doc, block);
      _$jscoverage['/editor/styles.js'].lineData[392]++;
      replaceBlock(block, newBlock);
    }
    _$jscoverage['/editor/styles.js'].lineData[394]++;
    range.moveToBookmark(bookmark);
  }
  _$jscoverage['/editor/styles.js'].lineData[398]++;
  function replace(str, regexp, replacement) {
    _$jscoverage['/editor/styles.js'].functionData[16]++;
    _$jscoverage['/editor/styles.js'].lineData[399]++;
    var headBookmark = '', tailBookmark = '';
    _$jscoverage['/editor/styles.js'].lineData[402]++;
    str = str.replace(/(^<span[^>]+_ke_bookmark.*?\/span>)|(<span[^>]+_ke_bookmark.*?\/span>$)/gi, function(str, m1, m2) {
  _$jscoverage['/editor/styles.js'].functionData[17]++;
  _$jscoverage['/editor/styles.js'].lineData[404]++;
  visit871_404_1(m1 && (headBookmark = m1));
  _$jscoverage['/editor/styles.js'].lineData[405]++;
  visit872_405_1(m2 && (tailBookmark = m2));
  _$jscoverage['/editor/styles.js'].lineData[406]++;
  return '';
});
    _$jscoverage['/editor/styles.js'].lineData[408]++;
    return headBookmark + str.replace(regexp, replacement) + tailBookmark;
  }
  _$jscoverage['/editor/styles.js'].lineData[414]++;
  function toPre(block, newBlock) {
    _$jscoverage['/editor/styles.js'].functionData[18]++;
    _$jscoverage['/editor/styles.js'].lineData[416]++;
    var preHTML = block.html();
    _$jscoverage['/editor/styles.js'].lineData[419]++;
    preHTML = replace(preHTML, /(?:^[ \t\n\r]+)|(?:[ \t\n\r]+$)/g, '');
    _$jscoverage['/editor/styles.js'].lineData[422]++;
    preHTML = preHTML.replace(/[ \t\r\n]*(<br[^>]*>)[ \t\r\n]*/gi, '$1');
    _$jscoverage['/editor/styles.js'].lineData[426]++;
    preHTML = preHTML.replace(/([ \t\n\r]+|&nbsp;)/g, ' ');
    _$jscoverage['/editor/styles.js'].lineData[429]++;
    preHTML = preHTML.replace(/<br\b[^>]*>/gi, '\n');
    _$jscoverage['/editor/styles.js'].lineData[432]++;
    if (visit873_432_1(UA['ie'])) {
      _$jscoverage['/editor/styles.js'].lineData[433]++;
      var temp = block[0].ownerDocument.createElement('div');
      _$jscoverage['/editor/styles.js'].lineData[434]++;
      temp.appendChild(newBlock[0]);
      _$jscoverage['/editor/styles.js'].lineData[435]++;
      newBlock.outerHtml('<pre>' + preHTML + '</pre>');
      _$jscoverage['/editor/styles.js'].lineData[436]++;
      newBlock = new Node(temp.firstChild);
      _$jscoverage['/editor/styles.js'].lineData[437]++;
      newBlock._4e_remove();
    } else {
      _$jscoverage['/editor/styles.js'].lineData[440]++;
      newBlock.html(preHTML);
    }
    _$jscoverage['/editor/styles.js'].lineData[442]++;
    return newBlock;
  }
  _$jscoverage['/editor/styles.js'].lineData[449]++;
  function splitIntoPres(preBlock) {
    _$jscoverage['/editor/styles.js'].functionData[19]++;
    _$jscoverage['/editor/styles.js'].lineData[452]++;
    var duoBrRegex = /(\S\s*)\n(?:\s|(<span[^>]+_ck_bookmark.*?\/span>))*\n(?!$)/gi, splittedHTML = replace(preBlock.outerHtml(), duoBrRegex, function(match, charBefore, bookmark) {
  _$jscoverage['/editor/styles.js'].functionData[20]++;
  _$jscoverage['/editor/styles.js'].lineData[457]++;
  return charBefore + '</pre>' + bookmark + '<pre>';
});
    _$jscoverage['/editor/styles.js'].lineData[460]++;
    var pres = [];
    _$jscoverage['/editor/styles.js'].lineData[461]++;
    splittedHTML.replace(/<pre\b.*?>([\s\S]*?)<\/pre>/gi, function(match, preContent) {
  _$jscoverage['/editor/styles.js'].functionData[21]++;
  _$jscoverage['/editor/styles.js'].lineData[463]++;
  pres.push(preContent);
});
    _$jscoverage['/editor/styles.js'].lineData[465]++;
    return pres;
  }
  _$jscoverage['/editor/styles.js'].lineData[471]++;
  function replaceBlock(block, newBlock) {
    _$jscoverage['/editor/styles.js'].functionData[22]++;
    _$jscoverage['/editor/styles.js'].lineData[472]++;
    var newBlockIsPre = visit874_472_1(newBlock.nodeName == ('pre')), blockIsPre = visit875_473_1(block.nodeName == ('pre')), isToPre = visit876_474_1(newBlockIsPre && !blockIsPre), isFromPre = visit877_475_1(!newBlockIsPre && blockIsPre);
    _$jscoverage['/editor/styles.js'].lineData[477]++;
    if (visit878_477_1(isToPre)) {
      _$jscoverage['/editor/styles.js'].lineData[478]++;
      newBlock = toPre(block, newBlock);
    } else {
      _$jscoverage['/editor/styles.js'].lineData[479]++;
      if (visit879_479_1(isFromPre)) {
        _$jscoverage['/editor/styles.js'].lineData[481]++;
        newBlock = fromPres(splitIntoPres(block), newBlock);
      } else {
        _$jscoverage['/editor/styles.js'].lineData[483]++;
        block._4e_moveChildren(newBlock);
      }
    }
    _$jscoverage['/editor/styles.js'].lineData[485]++;
    block[0].parentNode.replaceChild(newBlock[0], block[0]);
    _$jscoverage['/editor/styles.js'].lineData[486]++;
    if (visit880_486_1(newBlockIsPre)) {
      _$jscoverage['/editor/styles.js'].lineData[488]++;
      mergePre(newBlock);
    }
  }
  _$jscoverage['/editor/styles.js'].lineData[495]++;
  function mergePre(preBlock) {
    _$jscoverage['/editor/styles.js'].functionData[23]++;
    _$jscoverage['/editor/styles.js'].lineData[496]++;
    var previousBlock;
    _$jscoverage['/editor/styles.js'].lineData[497]++;
    if (visit881_497_1(!(visit882_497_2((previousBlock = preBlock._4e_previousSourceNode(TRUE, Dom.NodeType.ELEMENT_NODE)) && visit883_498_1(previousBlock.nodeName() == 'pre'))))) {
      _$jscoverage['/editor/styles.js'].lineData[499]++;
      return;
    }
    _$jscoverage['/editor/styles.js'].lineData[508]++;
    var mergedHTML = replace(previousBlock.html(), /\n$/, '') + '\n\n' + replace(preBlock.html(), /^\n/, '');
    _$jscoverage['/editor/styles.js'].lineData[512]++;
    if (visit884_512_1(UA['ie'])) {
      _$jscoverage['/editor/styles.js'].lineData[513]++;
      preBlock.outerHtml('<pre>' + mergedHTML + '</pre>');
    } else {
      _$jscoverage['/editor/styles.js'].lineData[515]++;
      preBlock.html(mergedHTML);
    }
    _$jscoverage['/editor/styles.js'].lineData[517]++;
    previousBlock._4e_remove();
  }
  _$jscoverage['/editor/styles.js'].lineData[523]++;
  function fromPres(preHTMLs, newBlock) {
    _$jscoverage['/editor/styles.js'].functionData[24]++;
    _$jscoverage['/editor/styles.js'].lineData[524]++;
    var docFrag = newBlock[0].ownerDocument.createDocumentFragment();
    _$jscoverage['/editor/styles.js'].lineData[525]++;
    for (var i = 0; visit885_525_1(i < preHTMLs.length); i++) {
      _$jscoverage['/editor/styles.js'].lineData[526]++;
      var blockHTML = preHTMLs[i];
      _$jscoverage['/editor/styles.js'].lineData[530]++;
      blockHTML = blockHTML.replace(/(\r\n|\r)/g, '\n');
      _$jscoverage['/editor/styles.js'].lineData[531]++;
      blockHTML = replace(blockHTML, /^[ \t]*\n/, '');
      _$jscoverage['/editor/styles.js'].lineData[532]++;
      blockHTML = replace(blockHTML, /\n$/, '');
      _$jscoverage['/editor/styles.js'].lineData[534]++;
      blockHTML = replace(blockHTML, /^[ \t]+|[ \t]+$/g, function(match, offset) {
  _$jscoverage['/editor/styles.js'].functionData[25]++;
  _$jscoverage['/editor/styles.js'].lineData[535]++;
  if (visit886_535_1(match.length == 1)) {
    _$jscoverage['/editor/styles.js'].lineData[536]++;
    return '&nbsp;';
  } else {
    _$jscoverage['/editor/styles.js'].lineData[537]++;
    if (visit887_537_1(!offset)) {
      _$jscoverage['/editor/styles.js'].lineData[538]++;
      return new Array(match.length).join('&nbsp;') + ' ';
    } else {
      _$jscoverage['/editor/styles.js'].lineData[540]++;
      return ' ' + new Array(match.length).join('&nbsp;');
    }
  }
});
      _$jscoverage['/editor/styles.js'].lineData[545]++;
      blockHTML = blockHTML.replace(/\n/g, '<br>');
      _$jscoverage['/editor/styles.js'].lineData[546]++;
      blockHTML = blockHTML.replace(/[ \t]{2,}/g, function(match) {
  _$jscoverage['/editor/styles.js'].functionData[26]++;
  _$jscoverage['/editor/styles.js'].lineData[548]++;
  return new Array(match.length).join('&nbsp;') + ' ';
});
      _$jscoverage['/editor/styles.js'].lineData[551]++;
      var newBlockClone = newBlock.clone();
      _$jscoverage['/editor/styles.js'].lineData[552]++;
      newBlockClone.html(blockHTML);
      _$jscoverage['/editor/styles.js'].lineData[553]++;
      docFrag.appendChild(newBlockClone[0]);
    }
    _$jscoverage['/editor/styles.js'].lineData[555]++;
    return docFrag;
  }
  _$jscoverage['/editor/styles.js'].lineData[562]++;
  function applyInlineStyle(range) {
    _$jscoverage['/editor/styles.js'].functionData[27]++;
    _$jscoverage['/editor/styles.js'].lineData[563]++;
    var self = this, document = range.document;
    _$jscoverage['/editor/styles.js'].lineData[566]++;
    if (visit888_566_1(range.collapsed)) {
      _$jscoverage['/editor/styles.js'].lineData[568]++;
      var collapsedElement = getElement(this, document, undefined);
      _$jscoverage['/editor/styles.js'].lineData[570]++;
      range.insertNode(collapsedElement);
      _$jscoverage['/editor/styles.js'].lineData[572]++;
      range.moveToPosition(collapsedElement, KER.POSITION_BEFORE_END);
      _$jscoverage['/editor/styles.js'].lineData[573]++;
      return;
    }
    _$jscoverage['/editor/styles.js'].lineData[575]++;
    var elementName = this["element"], def = this._["definition"], isUnknownElement, dtd = DTD[elementName];
    _$jscoverage['/editor/styles.js'].lineData[580]++;
    if (visit889_580_1(!dtd)) {
      _$jscoverage['/editor/styles.js'].lineData[581]++;
      isUnknownElement = TRUE;
      _$jscoverage['/editor/styles.js'].lineData[582]++;
      dtd = DTD["span"];
    }
    _$jscoverage['/editor/styles.js'].lineData[586]++;
    var bookmark = range.createBookmark();
    _$jscoverage['/editor/styles.js'].lineData[589]++;
    range.enlarge(KER.ENLARGE_ELEMENT);
    _$jscoverage['/editor/styles.js'].lineData[590]++;
    range.trim();
    _$jscoverage['/editor/styles.js'].lineData[594]++;
    var boundaryNodes = range.createBookmark(), firstNode = boundaryNodes.startNode, lastNode = boundaryNodes.endNode, currentNode = firstNode, styleRange;
    _$jscoverage['/editor/styles.js'].lineData[600]++;
    while (visit890_600_1(currentNode && currentNode[0])) {
      _$jscoverage['/editor/styles.js'].lineData[601]++;
      var applyStyle = FALSE;
      _$jscoverage['/editor/styles.js'].lineData[603]++;
      if (visit891_603_1(Dom.equals(currentNode, lastNode))) {
        _$jscoverage['/editor/styles.js'].lineData[604]++;
        currentNode = NULL;
        _$jscoverage['/editor/styles.js'].lineData[605]++;
        applyStyle = TRUE;
      } else {
        _$jscoverage['/editor/styles.js'].lineData[608]++;
        var nodeType = currentNode[0].nodeType, nodeName = visit892_609_1(nodeType == Dom.NodeType.ELEMENT_NODE) ? currentNode.nodeName() : NULL;
        _$jscoverage['/editor/styles.js'].lineData[612]++;
        if (visit893_612_1(nodeName && currentNode.attr('_ke_bookmark'))) {
          _$jscoverage['/editor/styles.js'].lineData[613]++;
          currentNode = currentNode._4e_nextSourceNode(TRUE);
          _$jscoverage['/editor/styles.js'].lineData[614]++;
          continue;
        }
        _$jscoverage['/editor/styles.js'].lineData[618]++;
        if (visit894_618_1(!nodeName || (visit895_619_1(dtd[nodeName] && visit896_620_1(visit897_620_2((currentNode._4e_position(lastNode) | (KEP.POSITION_PRECEDING | KEP.POSITION_IDENTICAL | KEP.POSITION_IS_CONTAINED)) == (KEP.POSITION_PRECEDING + KEP.POSITION_IDENTICAL + KEP.POSITION_IS_CONTAINED)) && (visit898_627_1(!def["childRule"] || def["childRule"](currentNode)))))))) {
          _$jscoverage['/editor/styles.js'].lineData[629]++;
          var currentParent = currentNode.parent();
          _$jscoverage['/editor/styles.js'].lineData[640]++;
          if (visit899_640_1(currentParent && visit900_641_1(visit901_641_2(elementName == "a") && visit902_642_1(currentParent.nodeName() == elementName)))) {
            _$jscoverage['/editor/styles.js'].lineData[643]++;
            var tmpANode = getElement(self, document, undefined);
            _$jscoverage['/editor/styles.js'].lineData[644]++;
            currentParent._4e_moveChildren(tmpANode);
            _$jscoverage['/editor/styles.js'].lineData[645]++;
            currentParent[0].parentNode.replaceChild(tmpANode[0], currentParent[0]);
            _$jscoverage['/editor/styles.js'].lineData[646]++;
            tmpANode._4e_mergeSiblings();
          } else {
            _$jscoverage['/editor/styles.js'].lineData[651]++;
            if (visit903_651_1(currentParent && visit904_651_2(currentParent[0] && visit905_652_1((visit906_653_1((visit907_652_2(DTD[currentParent.nodeName()] || DTD["span"]))[elementName] || isUnknownElement)) && (visit908_655_1(!def["parentRule"] || def["parentRule"](currentParent))))))) {
              _$jscoverage['/editor/styles.js'].lineData[660]++;
              if (visit909_660_1(!styleRange && (visit910_661_1(!nodeName || visit911_662_1(!DTD.$removeEmpty[nodeName] || visit912_663_1((currentNode._4e_position(lastNode) | (KEP.POSITION_PRECEDING | KEP.POSITION_IDENTICAL | KEP.POSITION_IS_CONTAINED)) == (KEP.POSITION_PRECEDING + KEP.POSITION_IDENTICAL + KEP.POSITION_IS_CONTAINED))))))) {
                _$jscoverage['/editor/styles.js'].lineData[672]++;
                styleRange = new KERange(document);
                _$jscoverage['/editor/styles.js'].lineData[673]++;
                styleRange.setStartBefore(currentNode);
              }
              _$jscoverage['/editor/styles.js'].lineData[678]++;
              if (visit913_678_1(visit914_678_2(nodeType == Dom.NodeType.TEXT_NODE) || (visit915_679_1(visit916_679_2(nodeType == Dom.NodeType.ELEMENT_NODE) && !currentNode[0].childNodes.length)))) {
                _$jscoverage['/editor/styles.js'].lineData[680]++;
                var includedNode = currentNode, parentNode = null;
                _$jscoverage['/editor/styles.js'].lineData[693]++;
                while (visit917_694_1((applyStyle = !includedNode.next(notBookmark, 1)) && visit918_695_1((visit919_695_2((parentNode = includedNode.parent()) && dtd[parentNode.nodeName()])) && visit920_697_1(visit921_697_2((parentNode._4e_position(firstNode) | KEP.POSITION_FOLLOWING | KEP.POSITION_IDENTICAL | KEP.POSITION_IS_CONTAINED) == (KEP.POSITION_FOLLOWING + KEP.POSITION_IDENTICAL + KEP.POSITION_IS_CONTAINED)) && (visit922_704_1(!def["childRule"] || def["childRule"](parentNode))))))) {
                  _$jscoverage['/editor/styles.js'].lineData[705]++;
                  includedNode = parentNode;
                }
                _$jscoverage['/editor/styles.js'].lineData[708]++;
                styleRange.setEndAfter(includedNode);
              }
            } else {
              _$jscoverage['/editor/styles.js'].lineData[713]++;
              applyStyle = TRUE;
            }
          }
        } else {
          _$jscoverage['/editor/styles.js'].lineData[716]++;
          applyStyle = TRUE;
        }
        _$jscoverage['/editor/styles.js'].lineData[719]++;
        currentNode = currentNode._4e_nextSourceNode();
      }
      _$jscoverage['/editor/styles.js'].lineData[723]++;
      if (visit923_723_1(applyStyle && visit924_723_2(styleRange && !styleRange.collapsed))) {
        _$jscoverage['/editor/styles.js'].lineData[725]++;
        var styleNode = getElement(self, document, undefined), parent = styleRange.getCommonAncestor();
        _$jscoverage['/editor/styles.js'].lineData[731]++;
        var removeList = {
  styles: {}, 
  attrs: {}, 
  blockedStyles: {}, 
  blockedAttrs: {}};
        _$jscoverage['/editor/styles.js'].lineData[740]++;
        var attName, styleName = null, value;
        _$jscoverage['/editor/styles.js'].lineData[744]++;
        while (visit925_744_1(styleNode && visit926_744_2(parent && visit927_744_3(styleNode[0] && parent[0])))) {
          _$jscoverage['/editor/styles.js'].lineData[745]++;
          if (visit928_745_1(parent.nodeName() == elementName)) {
            _$jscoverage['/editor/styles.js'].lineData[746]++;
            for (attName in def.attributes) {
              _$jscoverage['/editor/styles.js'].lineData[748]++;
              if (visit929_748_1(removeList.blockedAttrs[attName] || !(value = parent.attr(styleName)))) {
                _$jscoverage['/editor/styles.js'].lineData[750]++;
                continue;
              }
              _$jscoverage['/editor/styles.js'].lineData[752]++;
              if (visit930_752_1(styleNode.attr(attName) == value)) {
                _$jscoverage['/editor/styles.js'].lineData[754]++;
                styleNode.removeAttr(attName);
              } else {
                _$jscoverage['/editor/styles.js'].lineData[756]++;
                removeList.blockedAttrs[attName] = 1;
              }
            }
            _$jscoverage['/editor/styles.js'].lineData[763]++;
            for (styleName in def.styles) {
              _$jscoverage['/editor/styles.js'].lineData[765]++;
              if (visit931_765_1(removeList.blockedStyles[styleName] || !(value = parent.style(styleName)))) {
                _$jscoverage['/editor/styles.js'].lineData[767]++;
                continue;
              }
              _$jscoverage['/editor/styles.js'].lineData[769]++;
              if (visit932_769_1(styleNode.style(styleName) == value)) {
                _$jscoverage['/editor/styles.js'].lineData[771]++;
                styleNode.style(styleName, "");
              } else {
                _$jscoverage['/editor/styles.js'].lineData[773]++;
                removeList.blockedStyles[styleName] = 1;
              }
            }
            _$jscoverage['/editor/styles.js'].lineData[777]++;
            if (visit933_777_1(!styleNode._4e_hasAttributes())) {
              _$jscoverage['/editor/styles.js'].lineData[778]++;
              styleNode = NULL;
              _$jscoverage['/editor/styles.js'].lineData[779]++;
              break;
            }
          }
          _$jscoverage['/editor/styles.js'].lineData[783]++;
          parent = parent.parent();
        }
        _$jscoverage['/editor/styles.js'].lineData[786]++;
        if (visit934_786_1(styleNode)) {
          _$jscoverage['/editor/styles.js'].lineData[788]++;
          styleNode[0].appendChild(styleRange.extractContents());
          _$jscoverage['/editor/styles.js'].lineData[792]++;
          removeFromInsideElement(self, styleNode);
          _$jscoverage['/editor/styles.js'].lineData[796]++;
          styleRange.insertNode(styleNode);
          _$jscoverage['/editor/styles.js'].lineData[799]++;
          styleNode._4e_mergeSiblings();
          _$jscoverage['/editor/styles.js'].lineData[807]++;
          if (visit935_807_1(!UA['ie'])) {
            _$jscoverage['/editor/styles.js'].lineData[808]++;
            styleNode[0].normalize();
          }
        } else {
          _$jscoverage['/editor/styles.js'].lineData[821]++;
          styleNode = new Node(document.createElement("span"));
          _$jscoverage['/editor/styles.js'].lineData[822]++;
          styleNode[0].appendChild(styleRange.extractContents());
          _$jscoverage['/editor/styles.js'].lineData[823]++;
          styleRange.insertNode(styleNode);
          _$jscoverage['/editor/styles.js'].lineData[824]++;
          removeFromInsideElement(self, styleNode);
          _$jscoverage['/editor/styles.js'].lineData[825]++;
          styleNode._4e_remove(true);
        }
        _$jscoverage['/editor/styles.js'].lineData[830]++;
        styleRange = NULL;
      }
    }
    _$jscoverage['/editor/styles.js'].lineData[834]++;
    firstNode._4e_remove();
    _$jscoverage['/editor/styles.js'].lineData[835]++;
    lastNode._4e_remove();
    _$jscoverage['/editor/styles.js'].lineData[836]++;
    range.moveToBookmark(bookmark);
    _$jscoverage['/editor/styles.js'].lineData[838]++;
    range.shrink(KER.SHRINK_TEXT);
  }
  _$jscoverage['/editor/styles.js'].lineData[846]++;
  function removeInlineStyle(range) {
    _$jscoverage['/editor/styles.js'].functionData[28]++;
    _$jscoverage['/editor/styles.js'].lineData[851]++;
    range.enlarge(KER.ENLARGE_ELEMENT);
    _$jscoverage['/editor/styles.js'].lineData[853]++;
    var bookmark = range.createBookmark(), startNode = bookmark.startNode;
    _$jscoverage['/editor/styles.js'].lineData[856]++;
    if (visit936_856_1(range.collapsed)) {
      _$jscoverage['/editor/styles.js'].lineData[858]++;
      var startPath = new ElementPath(startNode.parent()), boundaryElement;
      _$jscoverage['/editor/styles.js'].lineData[863]++;
      for (var i = 0, element; visit937_863_1(visit938_863_2(i < startPath.elements.length) && (element = startPath.elements[i])); i++) {
        _$jscoverage['/editor/styles.js'].lineData[872]++;
        if (visit939_872_1(visit940_872_2(element == startPath.block) || visit941_873_1(element == startPath.blockLimit))) {
          _$jscoverage['/editor/styles.js'].lineData[874]++;
          break;
        }
        _$jscoverage['/editor/styles.js'].lineData[876]++;
        if (visit942_876_1(this.checkElementRemovable(element))) {
          _$jscoverage['/editor/styles.js'].lineData[877]++;
          var endOfElement = range.checkBoundaryOfElement(element, KER.END), startOfElement = visit943_878_1(!endOfElement && range.checkBoundaryOfElement(element, KER.START));
          _$jscoverage['/editor/styles.js'].lineData[880]++;
          if (visit944_880_1(startOfElement || endOfElement)) {
            _$jscoverage['/editor/styles.js'].lineData[881]++;
            boundaryElement = element;
            _$jscoverage['/editor/styles.js'].lineData[882]++;
            boundaryElement.match = startOfElement ? 'start' : 'end';
          } else {
            _$jscoverage['/editor/styles.js'].lineData[890]++;
            element._4e_mergeSiblings();
            _$jscoverage['/editor/styles.js'].lineData[894]++;
            if (visit945_894_1(element.nodeName() != this.element)) {
              _$jscoverage['/editor/styles.js'].lineData[895]++;
              var _overrides = getOverrides(this);
              _$jscoverage['/editor/styles.js'].lineData[896]++;
              removeOverrides(element, visit946_897_1(_overrides[element.nodeName()] || _overrides["*"]));
            } else {
              _$jscoverage['/editor/styles.js'].lineData[899]++;
              removeFromElement(this, element);
            }
          }
        }
      }
      _$jscoverage['/editor/styles.js'].lineData[909]++;
      if (visit947_909_1(boundaryElement)) {
        _$jscoverage['/editor/styles.js'].lineData[910]++;
        var clonedElement = startNode;
        _$jscoverage['/editor/styles.js'].lineData[911]++;
        for (i = 0; ; i++) {
          _$jscoverage['/editor/styles.js'].lineData[912]++;
          var newElement = startPath.elements[i];
          _$jscoverage['/editor/styles.js'].lineData[913]++;
          if (visit948_913_1(newElement.equals(boundaryElement))) {
            _$jscoverage['/editor/styles.js'].lineData[914]++;
            break;
          } else {
            _$jscoverage['/editor/styles.js'].lineData[916]++;
            if (visit949_916_1(newElement.match)) {
              _$jscoverage['/editor/styles.js'].lineData[917]++;
              continue;
            } else {
              _$jscoverage['/editor/styles.js'].lineData[919]++;
              newElement = newElement.clone();
            }
          }
          _$jscoverage['/editor/styles.js'].lineData[920]++;
          newElement[0].appendChild(clonedElement[0]);
          _$jscoverage['/editor/styles.js'].lineData[921]++;
          clonedElement = newElement;
        }
        _$jscoverage['/editor/styles.js'].lineData[927]++;
        clonedElement[visit950_926_1(boundaryElement.match == 'start') ? 'insertBefore' : 'insertAfter'](boundaryElement);
        _$jscoverage['/editor/styles.js'].lineData[930]++;
        var tmp = boundaryElement.html();
        _$jscoverage['/editor/styles.js'].lineData[931]++;
        if (visit951_931_1(!tmp || visit952_933_1(tmp == '\u200b'))) {
          _$jscoverage['/editor/styles.js'].lineData[934]++;
          boundaryElement.remove();
        } else {
          _$jscoverage['/editor/styles.js'].lineData[937]++;
          if (visit953_937_1(UA.webkit)) {
            _$jscoverage['/editor/styles.js'].lineData[938]++;
            $(range.document.createTextNode('\u200b')).insertBefore(clonedElement);
          }
        }
      }
    } else {
      _$jscoverage['/editor/styles.js'].lineData[946]++;
      var endNode = bookmark.endNode, me = this;
      _$jscoverage['/editor/styles.js'].lineData[953]++;
      function breakNodes() {
        _$jscoverage['/editor/styles.js'].functionData[29]++;
        _$jscoverage['/editor/styles.js'].lineData[954]++;
        var startPath = new ElementPath(startNode.parent()), endPath = new ElementPath(endNode.parent()), breakStart = NULL, breakEnd = NULL;
        _$jscoverage['/editor/styles.js'].lineData[958]++;
        for (var i = 0; visit954_958_1(i < startPath.elements.length); i++) {
          _$jscoverage['/editor/styles.js'].lineData[959]++;
          var element = startPath.elements[i];
          _$jscoverage['/editor/styles.js'].lineData[961]++;
          if (visit955_961_1(visit956_961_2(element == startPath.block) || visit957_962_1(element == startPath.blockLimit))) {
            _$jscoverage['/editor/styles.js'].lineData[963]++;
            break;
          }
          _$jscoverage['/editor/styles.js'].lineData[965]++;
          if (visit958_965_1(me.checkElementRemovable(element))) {
            _$jscoverage['/editor/styles.js'].lineData[966]++;
            breakStart = element;
          }
        }
        _$jscoverage['/editor/styles.js'].lineData[968]++;
        for (i = 0; visit959_968_1(i < endPath.elements.length); i++) {
          _$jscoverage['/editor/styles.js'].lineData[969]++;
          element = endPath.elements[i];
          _$jscoverage['/editor/styles.js'].lineData[971]++;
          if (visit960_971_1(visit961_971_2(element == endPath.block) || visit962_972_1(element == endPath.blockLimit))) {
            _$jscoverage['/editor/styles.js'].lineData[973]++;
            break;
          }
          _$jscoverage['/editor/styles.js'].lineData[975]++;
          if (visit963_975_1(me.checkElementRemovable(element))) {
            _$jscoverage['/editor/styles.js'].lineData[976]++;
            breakEnd = element;
          }
        }
        _$jscoverage['/editor/styles.js'].lineData[979]++;
        if (visit964_979_1(breakEnd)) {
          _$jscoverage['/editor/styles.js'].lineData[980]++;
          endNode._4e_breakParent(breakEnd);
        }
        _$jscoverage['/editor/styles.js'].lineData[981]++;
        if (visit965_981_1(breakStart)) {
          _$jscoverage['/editor/styles.js'].lineData[982]++;
          startNode._4e_breakParent(breakStart);
        }
      }      _$jscoverage['/editor/styles.js'].lineData[985]++;
      breakNodes();
      _$jscoverage['/editor/styles.js'].lineData[988]++;
      var currentNode = new Node(startNode[0].nextSibling);
      _$jscoverage['/editor/styles.js'].lineData[989]++;
      while (visit966_989_1(currentNode[0] !== endNode[0])) {
        _$jscoverage['/editor/styles.js'].lineData[994]++;
        var nextNode = currentNode._4e_nextSourceNode();
        _$jscoverage['/editor/styles.js'].lineData[995]++;
        if (visit967_995_1(currentNode[0] && visit968_996_1(visit969_996_2(currentNode[0].nodeType == Dom.NodeType.ELEMENT_NODE) && this.checkElementRemovable(currentNode)))) {
          _$jscoverage['/editor/styles.js'].lineData[999]++;
          if (visit970_999_1(currentNode.nodeName() == this["element"])) {
            _$jscoverage['/editor/styles.js'].lineData[1000]++;
            removeFromElement(this, currentNode);
          } else {
            _$jscoverage['/editor/styles.js'].lineData[1002]++;
            var overrides = getOverrides(this);
            _$jscoverage['/editor/styles.js'].lineData[1003]++;
            removeOverrides(currentNode, visit971_1004_1(overrides[currentNode.nodeName()] || overrides["*"]));
          }
          _$jscoverage['/editor/styles.js'].lineData[1014]++;
          if (visit972_1014_1(visit973_1014_2(nextNode[0].nodeType == Dom.NodeType.ELEMENT_NODE) && nextNode.contains(startNode))) {
            _$jscoverage['/editor/styles.js'].lineData[1016]++;
            breakNodes();
            _$jscoverage['/editor/styles.js'].lineData[1017]++;
            nextNode = new Node(startNode[0].nextSibling);
          }
        }
        _$jscoverage['/editor/styles.js'].lineData[1020]++;
        currentNode = nextNode;
      }
    }
    _$jscoverage['/editor/styles.js'].lineData[1023]++;
    range.moveToBookmark(bookmark);
  }
  _$jscoverage['/editor/styles.js'].lineData[1031]++;
  function parseStyleText(styleText) {
    _$jscoverage['/editor/styles.js'].functionData[30]++;
    _$jscoverage['/editor/styles.js'].lineData[1032]++;
    styleText = String(styleText);
    _$jscoverage['/editor/styles.js'].lineData[1033]++;
    var retval = {};
    _$jscoverage['/editor/styles.js'].lineData[1035]++;
    styleText.replace(/&quot;/g, '"').replace(/\s*([^ :;]+)\s*:\s*([^;]+)\s*(?=;|$)/g, function(match, name, value) {
  _$jscoverage['/editor/styles.js'].functionData[31]++;
  _$jscoverage['/editor/styles.js'].lineData[1037]++;
  retval[name] = value;
});
    _$jscoverage['/editor/styles.js'].lineData[1039]++;
    return retval;
  }
  _$jscoverage['/editor/styles.js'].lineData[1042]++;
  function compareCssText(source, target) {
    _$jscoverage['/editor/styles.js'].functionData[32]++;
    _$jscoverage['/editor/styles.js'].lineData[1043]++;
    visit974_1043_1(visit975_1043_2(typeof source == 'string') && (source = parseStyleText(source)));
    _$jscoverage['/editor/styles.js'].lineData[1044]++;
    visit976_1044_1(visit977_1044_2(typeof target == 'string') && (target = parseStyleText(target)));
    _$jscoverage['/editor/styles.js'].lineData[1045]++;
    for (var name in source) {
      _$jscoverage['/editor/styles.js'].lineData[1049]++;
      if (visit978_1049_1(!(visit979_1049_2(name in target && (visit980_1050_1(visit981_1050_2(target[name] == source[name]) || visit982_1051_1(visit983_1051_2(source[name] == 'inherit') || visit984_1052_1(target[name] == 'inherit')))))))) {
        _$jscoverage['/editor/styles.js'].lineData[1053]++;
        return FALSE;
      }
    }
    _$jscoverage['/editor/styles.js'].lineData[1057]++;
    return TRUE;
  }
  _$jscoverage['/editor/styles.js'].lineData[1065]++;
  function normalizeCssText(unparsedCssText, nativeNormalize) {
    _$jscoverage['/editor/styles.js'].functionData[33]++;
    _$jscoverage['/editor/styles.js'].lineData[1066]++;
    var styleText = "";
    _$jscoverage['/editor/styles.js'].lineData[1067]++;
    if (visit985_1067_1(nativeNormalize !== FALSE)) {
      _$jscoverage['/editor/styles.js'].lineData[1070]++;
      var temp = document.createElement('span');
      _$jscoverage['/editor/styles.js'].lineData[1071]++;
      temp.style.cssText = unparsedCssText;
      _$jscoverage['/editor/styles.js'].lineData[1073]++;
      styleText = visit986_1073_1(temp.style.cssText || '');
    } else {
      _$jscoverage['/editor/styles.js'].lineData[1076]++;
      styleText = unparsedCssText;
    }
    _$jscoverage['/editor/styles.js'].lineData[1080]++;
    return styleText.replace(/\s*([;:])\s*/, '$1').replace(/([^\s;])$/, "$1;").replace(/,\s+/g, ',').toLowerCase();
  }
  _$jscoverage['/editor/styles.js'].lineData[1091]++;
  function getAttributesForComparison(styleDefinition) {
    _$jscoverage['/editor/styles.js'].functionData[34]++;
    _$jscoverage['/editor/styles.js'].lineData[1093]++;
    var attribs = styleDefinition._AC;
    _$jscoverage['/editor/styles.js'].lineData[1094]++;
    if (visit987_1094_1(attribs)) {
      _$jscoverage['/editor/styles.js'].lineData[1095]++;
      return attribs;
    }
    _$jscoverage['/editor/styles.js'].lineData[1097]++;
    attribs = {};
    _$jscoverage['/editor/styles.js'].lineData[1099]++;
    var length = 0, styleAttribs = styleDefinition["attributes"];
    _$jscoverage['/editor/styles.js'].lineData[1103]++;
    if (visit988_1103_1(styleAttribs)) {
      _$jscoverage['/editor/styles.js'].lineData[1104]++;
      for (var styleAtt in styleAttribs) {
        _$jscoverage['/editor/styles.js'].lineData[1106]++;
        length++;
        _$jscoverage['/editor/styles.js'].lineData[1107]++;
        attribs[styleAtt] = styleAttribs[styleAtt];
      }
    }
    _$jscoverage['/editor/styles.js'].lineData[1113]++;
    var styleText = KEStyle.getStyleText(styleDefinition);
    _$jscoverage['/editor/styles.js'].lineData[1114]++;
    if (visit989_1114_1(styleText)) {
      _$jscoverage['/editor/styles.js'].lineData[1115]++;
      if (visit990_1115_1(!attribs['style'])) {
        _$jscoverage['/editor/styles.js'].lineData[1116]++;
        length++;
      }
      _$jscoverage['/editor/styles.js'].lineData[1117]++;
      attribs['style'] = styleText;
    }
    _$jscoverage['/editor/styles.js'].lineData[1122]++;
    attribs["_length"] = length;
    _$jscoverage['/editor/styles.js'].lineData[1125]++;
    return (styleDefinition._AC = attribs);
  }
  _$jscoverage['/editor/styles.js'].lineData[1135]++;
  function getOverrides(style) {
    _$jscoverage['/editor/styles.js'].functionData[35]++;
    _$jscoverage['/editor/styles.js'].lineData[1136]++;
    if (visit991_1136_1(style._.overrides)) {
      _$jscoverage['/editor/styles.js'].lineData[1137]++;
      return style._.overrides;
    }
    _$jscoverage['/editor/styles.js'].lineData[1139]++;
    var overrides = (style._.overrides = {}), definition = style._.definition["overrides"];
    _$jscoverage['/editor/styles.js'].lineData[1142]++;
    if (visit992_1142_1(definition)) {
      _$jscoverage['/editor/styles.js'].lineData[1145]++;
      if (visit993_1145_1(!S.isArray(definition))) {
        _$jscoverage['/editor/styles.js'].lineData[1146]++;
        definition = [definition];
      }
      _$jscoverage['/editor/styles.js'].lineData[1149]++;
      for (var i = 0; visit994_1149_1(i < definition.length); i++) {
        _$jscoverage['/editor/styles.js'].lineData[1150]++;
        var override = definition[i];
        _$jscoverage['/editor/styles.js'].lineData[1151]++;
        var elementName;
        _$jscoverage['/editor/styles.js'].lineData[1152]++;
        var overrideEl;
        _$jscoverage['/editor/styles.js'].lineData[1153]++;
        var attrs, styles;
        _$jscoverage['/editor/styles.js'].lineData[1156]++;
        if (visit995_1156_1(typeof override == 'string')) {
          _$jscoverage['/editor/styles.js'].lineData[1157]++;
          elementName = override.toLowerCase();
        } else {
          _$jscoverage['/editor/styles.js'].lineData[1160]++;
          elementName = override["element"] ? override["element"].toLowerCase() : style.element;
          _$jscoverage['/editor/styles.js'].lineData[1163]++;
          attrs = override["attributes"];
          _$jscoverage['/editor/styles.js'].lineData[1164]++;
          styles = override["styles"];
        }
        _$jscoverage['/editor/styles.js'].lineData[1170]++;
        overrideEl = visit996_1170_1(overrides[elementName] || (overrides[elementName] = {}));
        _$jscoverage['/editor/styles.js'].lineData[1173]++;
        if (visit997_1173_1(attrs)) {
          _$jscoverage['/editor/styles.js'].lineData[1177]++;
          var overrideAttrs = (overrideEl["attributes"] = visit998_1178_1(overrideEl["attributes"] || new Array()));
          _$jscoverage['/editor/styles.js'].lineData[1179]++;
          for (var attName in attrs) {
            _$jscoverage['/editor/styles.js'].lineData[1183]++;
            overrideAttrs.push([attName.toLowerCase(), attrs[attName]]);
          }
        }
        _$jscoverage['/editor/styles.js'].lineData[1188]++;
        if (visit999_1188_1(styles)) {
          _$jscoverage['/editor/styles.js'].lineData[1192]++;
          var overrideStyles = (overrideEl["styles"] = visit1000_1193_1(overrideEl["styles"] || new Array()));
          _$jscoverage['/editor/styles.js'].lineData[1194]++;
          for (var styleName in styles) {
            _$jscoverage['/editor/styles.js'].lineData[1198]++;
            overrideStyles.push([styleName.toLowerCase(), styles[styleName]]);
          }
        }
      }
    }
    _$jscoverage['/editor/styles.js'].lineData[1205]++;
    return overrides;
  }
  _$jscoverage['/editor/styles.js'].lineData[1210]++;
  function removeFromElement(style, element) {
    _$jscoverage['/editor/styles.js'].functionData[36]++;
    _$jscoverage['/editor/styles.js'].lineData[1211]++;
    var def = style._.definition, overrides = getOverrides(style), attributes = S.merge(def["attributes"], (visit1001_1214_1(overrides[element.nodeName()] || visit1002_1214_2(overrides["*"] || {})))["attributes"]), styles = S.merge(def["styles"], (visit1003_1216_1(overrides[element.nodeName()] || visit1004_1216_2(overrides["*"] || {})))["styles"]), removeEmpty = visit1005_1218_1(S.isEmptyObject(attributes) && S.isEmptyObject(styles));
    _$jscoverage['/editor/styles.js'].lineData[1222]++;
    for (var attName in attributes) {
      _$jscoverage['/editor/styles.js'].lineData[1225]++;
      if (visit1006_1225_1((visit1007_1225_2(visit1008_1225_3(attName == 'class') || style._.definition["fullMatch"])) && visit1009_1226_1(element.attr(attName) != normalizeProperty(attName, attributes[attName])))) {
        _$jscoverage['/editor/styles.js'].lineData[1228]++;
        continue;
      }
      _$jscoverage['/editor/styles.js'].lineData[1229]++;
      removeEmpty = visit1010_1229_1(removeEmpty || !!element.hasAttr(attName));
      _$jscoverage['/editor/styles.js'].lineData[1230]++;
      element.removeAttr(attName);
    }
    _$jscoverage['/editor/styles.js'].lineData[1234]++;
    for (var styleName in styles) {
      _$jscoverage['/editor/styles.js'].lineData[1237]++;
      if (visit1011_1237_1(style._.definition["fullMatch"] && visit1012_1238_1(element.style(styleName) != normalizeProperty(styleName, styles[styleName], TRUE)))) {
        _$jscoverage['/editor/styles.js'].lineData[1240]++;
        continue;
      }
      _$jscoverage['/editor/styles.js'].lineData[1242]++;
      removeEmpty = visit1013_1242_1(removeEmpty || !!element.style(styleName));
      _$jscoverage['/editor/styles.js'].lineData[1244]++;
      element.style(styleName, "");
    }
    _$jscoverage['/editor/styles.js'].lineData[1250]++;
    removeNoAttribsElement(element);
  }
  _$jscoverage['/editor/styles.js'].lineData[1259]++;
  function normalizeProperty(name, value, isStyle) {
    _$jscoverage['/editor/styles.js'].functionData[37]++;
    _$jscoverage['/editor/styles.js'].lineData[1260]++;
    var temp = new Node('<span>');
    _$jscoverage['/editor/styles.js'].lineData[1261]++;
    temp[isStyle ? 'style' : 'attr'](name, value);
    _$jscoverage['/editor/styles.js'].lineData[1262]++;
    return temp[isStyle ? 'style' : 'attr'](name);
  }
  _$jscoverage['/editor/styles.js'].lineData[1267]++;
  function removeFromInsideElement(style, element) {
    _$jscoverage['/editor/styles.js'].functionData[38]++;
    _$jscoverage['/editor/styles.js'].lineData[1268]++;
    var overrides = getOverrides(style), innerElements = element.all(style["element"]);
    _$jscoverage['/editor/styles.js'].lineData[1274]++;
    for (var i = innerElements.length; visit1014_1274_1(--i >= 0); ) {
      _$jscoverage['/editor/styles.js'].lineData[1275]++;
      removeFromElement(style, new Node(innerElements[i]));
    }
    _$jscoverage['/editor/styles.js'].lineData[1280]++;
    for (var overrideElement in overrides) {
      _$jscoverage['/editor/styles.js'].lineData[1282]++;
      if (visit1015_1282_1(overrideElement != style["element"])) {
        _$jscoverage['/editor/styles.js'].lineData[1283]++;
        innerElements = element.all(overrideElement);
        _$jscoverage['/editor/styles.js'].lineData[1284]++;
        for (i = innerElements.length - 1; visit1016_1284_1(i >= 0); i--) {
          _$jscoverage['/editor/styles.js'].lineData[1285]++;
          var innerElement = new Node(innerElements[i]);
          _$jscoverage['/editor/styles.js'].lineData[1286]++;
          removeOverrides(innerElement, overrides[overrideElement]);
        }
      }
    }
  }
  _$jscoverage['/editor/styles.js'].lineData[1301]++;
  function removeOverrides(element, overrides) {
    _$jscoverage['/editor/styles.js'].functionData[39]++;
    _$jscoverage['/editor/styles.js'].lineData[1302]++;
    var i, attributes = visit1017_1302_1(overrides && overrides["attributes"]);
    _$jscoverage['/editor/styles.js'].lineData[1304]++;
    if (visit1018_1304_1(attributes)) {
      _$jscoverage['/editor/styles.js'].lineData[1305]++;
      for (i = 0; visit1019_1305_1(i < attributes.length); i++) {
        _$jscoverage['/editor/styles.js'].lineData[1306]++;
        var attName = attributes[i][0], actualAttrValue;
        _$jscoverage['/editor/styles.js'].lineData[1308]++;
        if ((actualAttrValue = element.attr(attName))) {
          _$jscoverage['/editor/styles.js'].lineData[1309]++;
          var attValue = attributes[i][1];
          _$jscoverage['/editor/styles.js'].lineData[1317]++;
          if (visit1020_1317_1(visit1021_1317_2(attValue === NULL) || visit1022_1318_1((visit1023_1318_2(attValue.test && attValue.test(actualAttrValue))) || (visit1024_1319_1(visit1025_1319_2(typeof attValue == 'string') && visit1026_1319_3(actualAttrValue == attValue)))))) {
            _$jscoverage['/editor/styles.js'].lineData[1320]++;
            element[0].removeAttribute(attName);
          }
        }
      }
    }
    _$jscoverage['/editor/styles.js'].lineData[1326]++;
    var styles = visit1027_1326_1(overrides && overrides["styles"]);
    _$jscoverage['/editor/styles.js'].lineData[1328]++;
    if (visit1028_1328_1(styles)) {
      _$jscoverage['/editor/styles.js'].lineData[1329]++;
      for (i = 0; visit1029_1329_1(i < styles.length); i++) {
        _$jscoverage['/editor/styles.js'].lineData[1330]++;
        var styleName = styles[i][0], actualStyleValue;
        _$jscoverage['/editor/styles.js'].lineData[1332]++;
        if ((actualStyleValue = element.css(styleName))) {
          _$jscoverage['/editor/styles.js'].lineData[1333]++;
          var styleValue = styles[i][1];
          _$jscoverage['/editor/styles.js'].lineData[1334]++;
          if (visit1030_1334_1(visit1031_1334_2(styleValue === NULL) || visit1032_1336_1((visit1033_1336_2(styleValue.test && styleValue.test(actualAttrValue))) || (visit1034_1337_1(visit1035_1337_2(typeof styleValue == 'string') && visit1036_1337_3(actualStyleValue == styleValue)))))) {
            _$jscoverage['/editor/styles.js'].lineData[1338]++;
            element.css(styleName, "");
          }
        }
      }
    }
    _$jscoverage['/editor/styles.js'].lineData[1343]++;
    removeNoAttribsElement(element);
  }
  _$jscoverage['/editor/styles.js'].lineData[1347]++;
  function removeNoAttribsElement(element) {
    _$jscoverage['/editor/styles.js'].functionData[40]++;
    _$jscoverage['/editor/styles.js'].lineData[1350]++;
    if (visit1037_1350_1(!element._4e_hasAttributes())) {
      _$jscoverage['/editor/styles.js'].lineData[1353]++;
      var firstChild = element[0].firstChild, lastChild = element[0].lastChild;
      _$jscoverage['/editor/styles.js'].lineData[1356]++;
      element._4e_remove(TRUE);
      _$jscoverage['/editor/styles.js'].lineData[1358]++;
      if (visit1038_1358_1(firstChild)) {
        _$jscoverage['/editor/styles.js'].lineData[1360]++;
        visit1039_1360_1(visit1040_1360_2(firstChild.nodeType == Dom.NodeType.ELEMENT_NODE) && Dom._4e_mergeSiblings(firstChild));
        _$jscoverage['/editor/styles.js'].lineData[1363]++;
        if (visit1041_1363_1(lastChild && visit1042_1363_2(visit1043_1363_3(firstChild != lastChild) && visit1044_1364_1(lastChild.nodeType == Dom.NodeType.ELEMENT_NODE)))) {
          _$jscoverage['/editor/styles.js'].lineData[1365]++;
          Dom._4e_mergeSiblings(lastChild);
        }
      }
    }
  }
  _$jscoverage['/editor/styles.js'].lineData[1370]++;
  Editor.Style = KEStyle;
  _$jscoverage['/editor/styles.js'].lineData[1372]++;
  return KEStyle;
}, {
  requires: ['./base', './range', './selection', './domIterator', './elementPath', 'node']});
