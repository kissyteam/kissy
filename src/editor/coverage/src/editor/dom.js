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
if (! _$jscoverage['/editor/dom.js']) {
  _$jscoverage['/editor/dom.js'] = {};
  _$jscoverage['/editor/dom.js'].lineData = [];
  _$jscoverage['/editor/dom.js'].lineData[10] = 0;
  _$jscoverage['/editor/dom.js'].lineData[11] = 0;
  _$jscoverage['/editor/dom.js'].lineData[12] = 0;
  _$jscoverage['/editor/dom.js'].lineData[13] = 0;
  _$jscoverage['/editor/dom.js'].lineData[14] = 0;
  _$jscoverage['/editor/dom.js'].lineData[56] = 0;
  _$jscoverage['/editor/dom.js'].lineData[64] = 0;
  _$jscoverage['/editor/dom.js'].lineData[72] = 0;
  _$jscoverage['/editor/dom.js'].lineData[87] = 0;
  _$jscoverage['/editor/dom.js'].lineData[90] = 0;
  _$jscoverage['/editor/dom.js'].lineData[95] = 0;
  _$jscoverage['/editor/dom.js'].lineData[96] = 0;
  _$jscoverage['/editor/dom.js'].lineData[97] = 0;
  _$jscoverage['/editor/dom.js'].lineData[102] = 0;
  _$jscoverage['/editor/dom.js'].lineData[103] = 0;
  _$jscoverage['/editor/dom.js'].lineData[108] = 0;
  _$jscoverage['/editor/dom.js'].lineData[112] = 0;
  _$jscoverage['/editor/dom.js'].lineData[113] = 0;
  _$jscoverage['/editor/dom.js'].lineData[116] = 0;
  _$jscoverage['/editor/dom.js'].lineData[120] = 0;
  _$jscoverage['/editor/dom.js'].lineData[123] = 0;
  _$jscoverage['/editor/dom.js'].lineData[125] = 0;
  _$jscoverage['/editor/dom.js'].lineData[126] = 0;
  _$jscoverage['/editor/dom.js'].lineData[129] = 0;
  _$jscoverage['/editor/dom.js'].lineData[134] = 0;
  _$jscoverage['/editor/dom.js'].lineData[135] = 0;
  _$jscoverage['/editor/dom.js'].lineData[136] = 0;
  _$jscoverage['/editor/dom.js'].lineData[138] = 0;
  _$jscoverage['/editor/dom.js'].lineData[144] = 0;
  _$jscoverage['/editor/dom.js'].lineData[145] = 0;
  _$jscoverage['/editor/dom.js'].lineData[148] = 0;
  _$jscoverage['/editor/dom.js'].lineData[150] = 0;
  _$jscoverage['/editor/dom.js'].lineData[151] = 0;
  _$jscoverage['/editor/dom.js'].lineData[154] = 0;
  _$jscoverage['/editor/dom.js'].lineData[159] = 0;
  _$jscoverage['/editor/dom.js'].lineData[162] = 0;
  _$jscoverage['/editor/dom.js'].lineData[163] = 0;
  _$jscoverage['/editor/dom.js'].lineData[166] = 0;
  _$jscoverage['/editor/dom.js'].lineData[167] = 0;
  _$jscoverage['/editor/dom.js'].lineData[168] = 0;
  _$jscoverage['/editor/dom.js'].lineData[169] = 0;
  _$jscoverage['/editor/dom.js'].lineData[171] = 0;
  _$jscoverage['/editor/dom.js'].lineData[178] = 0;
  _$jscoverage['/editor/dom.js'].lineData[179] = 0;
  _$jscoverage['/editor/dom.js'].lineData[180] = 0;
  _$jscoverage['/editor/dom.js'].lineData[181] = 0;
  _$jscoverage['/editor/dom.js'].lineData[182] = 0;
  _$jscoverage['/editor/dom.js'].lineData[184] = 0;
  _$jscoverage['/editor/dom.js'].lineData[189] = 0;
  _$jscoverage['/editor/dom.js'].lineData[194] = 0;
  _$jscoverage['/editor/dom.js'].lineData[195] = 0;
  _$jscoverage['/editor/dom.js'].lineData[197] = 0;
  _$jscoverage['/editor/dom.js'].lineData[198] = 0;
  _$jscoverage['/editor/dom.js'].lineData[199] = 0;
  _$jscoverage['/editor/dom.js'].lineData[202] = 0;
  _$jscoverage['/editor/dom.js'].lineData[204] = 0;
  _$jscoverage['/editor/dom.js'].lineData[207] = 0;
  _$jscoverage['/editor/dom.js'].lineData[209] = 0;
  _$jscoverage['/editor/dom.js'].lineData[212] = 0;
  _$jscoverage['/editor/dom.js'].lineData[217] = 0;
  _$jscoverage['/editor/dom.js'].lineData[219] = 0;
  _$jscoverage['/editor/dom.js'].lineData[220] = 0;
  _$jscoverage['/editor/dom.js'].lineData[223] = 0;
  _$jscoverage['/editor/dom.js'].lineData[225] = 0;
  _$jscoverage['/editor/dom.js'].lineData[226] = 0;
  _$jscoverage['/editor/dom.js'].lineData[227] = 0;
  _$jscoverage['/editor/dom.js'].lineData[230] = 0;
  _$jscoverage['/editor/dom.js'].lineData[231] = 0;
  _$jscoverage['/editor/dom.js'].lineData[244] = 0;
  _$jscoverage['/editor/dom.js'].lineData[246] = 0;
  _$jscoverage['/editor/dom.js'].lineData[247] = 0;
  _$jscoverage['/editor/dom.js'].lineData[248] = 0;
  _$jscoverage['/editor/dom.js'].lineData[255] = 0;
  _$jscoverage['/editor/dom.js'].lineData[257] = 0;
  _$jscoverage['/editor/dom.js'].lineData[258] = 0;
  _$jscoverage['/editor/dom.js'].lineData[263] = 0;
  _$jscoverage['/editor/dom.js'].lineData[264] = 0;
  _$jscoverage['/editor/dom.js'].lineData[265] = 0;
  _$jscoverage['/editor/dom.js'].lineData[266] = 0;
  _$jscoverage['/editor/dom.js'].lineData[269] = 0;
  _$jscoverage['/editor/dom.js'].lineData[278] = 0;
  _$jscoverage['/editor/dom.js'].lineData[279] = 0;
  _$jscoverage['/editor/dom.js'].lineData[280] = 0;
  _$jscoverage['/editor/dom.js'].lineData[281] = 0;
  _$jscoverage['/editor/dom.js'].lineData[284] = 0;
  _$jscoverage['/editor/dom.js'].lineData[289] = 0;
  _$jscoverage['/editor/dom.js'].lineData[290] = 0;
  _$jscoverage['/editor/dom.js'].lineData[291] = 0;
  _$jscoverage['/editor/dom.js'].lineData[292] = 0;
  _$jscoverage['/editor/dom.js'].lineData[294] = 0;
  _$jscoverage['/editor/dom.js'].lineData[300] = 0;
  _$jscoverage['/editor/dom.js'].lineData[301] = 0;
  _$jscoverage['/editor/dom.js'].lineData[302] = 0;
  _$jscoverage['/editor/dom.js'].lineData[303] = 0;
  _$jscoverage['/editor/dom.js'].lineData[307] = 0;
  _$jscoverage['/editor/dom.js'].lineData[312] = 0;
  _$jscoverage['/editor/dom.js'].lineData[313] = 0;
  _$jscoverage['/editor/dom.js'].lineData[315] = 0;
  _$jscoverage['/editor/dom.js'].lineData[317] = 0;
  _$jscoverage['/editor/dom.js'].lineData[320] = 0;
  _$jscoverage['/editor/dom.js'].lineData[323] = 0;
  _$jscoverage['/editor/dom.js'].lineData[324] = 0;
  _$jscoverage['/editor/dom.js'].lineData[326] = 0;
  _$jscoverage['/editor/dom.js'].lineData[329] = 0;
  _$jscoverage['/editor/dom.js'].lineData[330] = 0;
  _$jscoverage['/editor/dom.js'].lineData[333] = 0;
  _$jscoverage['/editor/dom.js'].lineData[334] = 0;
  _$jscoverage['/editor/dom.js'].lineData[337] = 0;
  _$jscoverage['/editor/dom.js'].lineData[338] = 0;
  _$jscoverage['/editor/dom.js'].lineData[341] = 0;
  _$jscoverage['/editor/dom.js'].lineData[346] = 0;
  _$jscoverage['/editor/dom.js'].lineData[347] = 0;
  _$jscoverage['/editor/dom.js'].lineData[348] = 0;
  _$jscoverage['/editor/dom.js'].lineData[349] = 0;
  _$jscoverage['/editor/dom.js'].lineData[353] = 0;
  _$jscoverage['/editor/dom.js'].lineData[358] = 0;
  _$jscoverage['/editor/dom.js'].lineData[359] = 0;
  _$jscoverage['/editor/dom.js'].lineData[361] = 0;
  _$jscoverage['/editor/dom.js'].lineData[363] = 0;
  _$jscoverage['/editor/dom.js'].lineData[366] = 0;
  _$jscoverage['/editor/dom.js'].lineData[369] = 0;
  _$jscoverage['/editor/dom.js'].lineData[370] = 0;
  _$jscoverage['/editor/dom.js'].lineData[372] = 0;
  _$jscoverage['/editor/dom.js'].lineData[375] = 0;
  _$jscoverage['/editor/dom.js'].lineData[376] = 0;
  _$jscoverage['/editor/dom.js'].lineData[379] = 0;
  _$jscoverage['/editor/dom.js'].lineData[380] = 0;
  _$jscoverage['/editor/dom.js'].lineData[383] = 0;
  _$jscoverage['/editor/dom.js'].lineData[384] = 0;
  _$jscoverage['/editor/dom.js'].lineData[387] = 0;
  _$jscoverage['/editor/dom.js'].lineData[393] = 0;
  _$jscoverage['/editor/dom.js'].lineData[395] = 0;
  _$jscoverage['/editor/dom.js'].lineData[396] = 0;
  _$jscoverage['/editor/dom.js'].lineData[399] = 0;
  _$jscoverage['/editor/dom.js'].lineData[400] = 0;
  _$jscoverage['/editor/dom.js'].lineData[403] = 0;
  _$jscoverage['/editor/dom.js'].lineData[405] = 0;
  _$jscoverage['/editor/dom.js'].lineData[406] = 0;
  _$jscoverage['/editor/dom.js'].lineData[407] = 0;
  _$jscoverage['/editor/dom.js'].lineData[411] = 0;
  _$jscoverage['/editor/dom.js'].lineData[417] = 0;
  _$jscoverage['/editor/dom.js'].lineData[418] = 0;
  _$jscoverage['/editor/dom.js'].lineData[419] = 0;
  _$jscoverage['/editor/dom.js'].lineData[420] = 0;
  _$jscoverage['/editor/dom.js'].lineData[426] = 0;
  _$jscoverage['/editor/dom.js'].lineData[427] = 0;
  _$jscoverage['/editor/dom.js'].lineData[429] = 0;
  _$jscoverage['/editor/dom.js'].lineData[431] = 0;
  _$jscoverage['/editor/dom.js'].lineData[432] = 0;
  _$jscoverage['/editor/dom.js'].lineData[436] = 0;
  _$jscoverage['/editor/dom.js'].lineData[439] = 0;
  _$jscoverage['/editor/dom.js'].lineData[440] = 0;
  _$jscoverage['/editor/dom.js'].lineData[444] = 0;
  _$jscoverage['/editor/dom.js'].lineData[452] = 0;
  _$jscoverage['/editor/dom.js'].lineData[454] = 0;
  _$jscoverage['/editor/dom.js'].lineData[455] = 0;
  _$jscoverage['/editor/dom.js'].lineData[460] = 0;
  _$jscoverage['/editor/dom.js'].lineData[461] = 0;
  _$jscoverage['/editor/dom.js'].lineData[465] = 0;
  _$jscoverage['/editor/dom.js'].lineData[467] = 0;
  _$jscoverage['/editor/dom.js'].lineData[468] = 0;
  _$jscoverage['/editor/dom.js'].lineData[471] = 0;
  _$jscoverage['/editor/dom.js'].lineData[472] = 0;
  _$jscoverage['/editor/dom.js'].lineData[475] = 0;
  _$jscoverage['/editor/dom.js'].lineData[476] = 0;
  _$jscoverage['/editor/dom.js'].lineData[486] = 0;
  _$jscoverage['/editor/dom.js'].lineData[491] = 0;
  _$jscoverage['/editor/dom.js'].lineData[492] = 0;
  _$jscoverage['/editor/dom.js'].lineData[493] = 0;
  _$jscoverage['/editor/dom.js'].lineData[499] = 0;
  _$jscoverage['/editor/dom.js'].lineData[506] = 0;
  _$jscoverage['/editor/dom.js'].lineData[510] = 0;
  _$jscoverage['/editor/dom.js'].lineData[511] = 0;
  _$jscoverage['/editor/dom.js'].lineData[512] = 0;
  _$jscoverage['/editor/dom.js'].lineData[515] = 0;
  _$jscoverage['/editor/dom.js'].lineData[520] = 0;
  _$jscoverage['/editor/dom.js'].lineData[521] = 0;
  _$jscoverage['/editor/dom.js'].lineData[522] = 0;
  _$jscoverage['/editor/dom.js'].lineData[524] = 0;
  _$jscoverage['/editor/dom.js'].lineData[525] = 0;
  _$jscoverage['/editor/dom.js'].lineData[528] = 0;
  _$jscoverage['/editor/dom.js'].lineData[530] = 0;
  _$jscoverage['/editor/dom.js'].lineData[535] = 0;
  _$jscoverage['/editor/dom.js'].lineData[536] = 0;
  _$jscoverage['/editor/dom.js'].lineData[541] = 0;
  _$jscoverage['/editor/dom.js'].lineData[542] = 0;
  _$jscoverage['/editor/dom.js'].lineData[543] = 0;
  _$jscoverage['/editor/dom.js'].lineData[544] = 0;
  _$jscoverage['/editor/dom.js'].lineData[547] = 0;
  _$jscoverage['/editor/dom.js'].lineData[548] = 0;
  _$jscoverage['/editor/dom.js'].lineData[549] = 0;
  _$jscoverage['/editor/dom.js'].lineData[550] = 0;
  _$jscoverage['/editor/dom.js'].lineData[551] = 0;
  _$jscoverage['/editor/dom.js'].lineData[553] = 0;
  _$jscoverage['/editor/dom.js'].lineData[556] = 0;
  _$jscoverage['/editor/dom.js'].lineData[562] = 0;
  _$jscoverage['/editor/dom.js'].lineData[563] = 0;
  _$jscoverage['/editor/dom.js'].lineData[564] = 0;
  _$jscoverage['/editor/dom.js'].lineData[565] = 0;
  _$jscoverage['/editor/dom.js'].lineData[567] = 0;
  _$jscoverage['/editor/dom.js'].lineData[568] = 0;
  _$jscoverage['/editor/dom.js'].lineData[569] = 0;
  _$jscoverage['/editor/dom.js'].lineData[570] = 0;
  _$jscoverage['/editor/dom.js'].lineData[571] = 0;
  _$jscoverage['/editor/dom.js'].lineData[574] = 0;
  _$jscoverage['/editor/dom.js'].lineData[577] = 0;
  _$jscoverage['/editor/dom.js'].lineData[580] = 0;
  _$jscoverage['/editor/dom.js'].lineData[581] = 0;
  _$jscoverage['/editor/dom.js'].lineData[582] = 0;
  _$jscoverage['/editor/dom.js'].lineData[585] = 0;
  _$jscoverage['/editor/dom.js'].lineData[592] = 0;
  _$jscoverage['/editor/dom.js'].lineData[595] = 0;
  _$jscoverage['/editor/dom.js'].lineData[597] = 0;
  _$jscoverage['/editor/dom.js'].lineData[600] = 0;
  _$jscoverage['/editor/dom.js'].lineData[603] = 0;
  _$jscoverage['/editor/dom.js'].lineData[609] = 0;
  _$jscoverage['/editor/dom.js'].lineData[615] = 0;
  _$jscoverage['/editor/dom.js'].lineData[616] = 0;
  _$jscoverage['/editor/dom.js'].lineData[620] = 0;
  _$jscoverage['/editor/dom.js'].lineData[621] = 0;
  _$jscoverage['/editor/dom.js'].lineData[622] = 0;
  _$jscoverage['/editor/dom.js'].lineData[627] = 0;
  _$jscoverage['/editor/dom.js'].lineData[628] = 0;
  _$jscoverage['/editor/dom.js'].lineData[630] = 0;
  _$jscoverage['/editor/dom.js'].lineData[631] = 0;
  _$jscoverage['/editor/dom.js'].lineData[633] = 0;
  _$jscoverage['/editor/dom.js'].lineData[634] = 0;
  _$jscoverage['/editor/dom.js'].lineData[635] = 0;
  _$jscoverage['/editor/dom.js'].lineData[636] = 0;
  _$jscoverage['/editor/dom.js'].lineData[642] = 0;
  _$jscoverage['/editor/dom.js'].lineData[643] = 0;
  _$jscoverage['/editor/dom.js'].lineData[644] = 0;
  _$jscoverage['/editor/dom.js'].lineData[646] = 0;
  _$jscoverage['/editor/dom.js'].lineData[649] = 0;
  _$jscoverage['/editor/dom.js'].lineData[654] = 0;
  _$jscoverage['/editor/dom.js'].lineData[655] = 0;
  _$jscoverage['/editor/dom.js'].lineData[658] = 0;
  _$jscoverage['/editor/dom.js'].lineData[659] = 0;
  _$jscoverage['/editor/dom.js'].lineData[660] = 0;
  _$jscoverage['/editor/dom.js'].lineData[663] = 0;
  _$jscoverage['/editor/dom.js'].lineData[664] = 0;
  _$jscoverage['/editor/dom.js'].lineData[665] = 0;
  _$jscoverage['/editor/dom.js'].lineData[667] = 0;
  _$jscoverage['/editor/dom.js'].lineData[672] = 0;
  _$jscoverage['/editor/dom.js'].lineData[673] = 0;
  _$jscoverage['/editor/dom.js'].lineData[680] = 0;
  _$jscoverage['/editor/dom.js'].lineData[684] = 0;
  _$jscoverage['/editor/dom.js'].lineData[689] = 0;
  _$jscoverage['/editor/dom.js'].lineData[691] = 0;
  _$jscoverage['/editor/dom.js'].lineData[692] = 0;
  _$jscoverage['/editor/dom.js'].lineData[694] = 0;
  _$jscoverage['/editor/dom.js'].lineData[695] = 0;
  _$jscoverage['/editor/dom.js'].lineData[696] = 0;
  _$jscoverage['/editor/dom.js'].lineData[699] = 0;
  _$jscoverage['/editor/dom.js'].lineData[701] = 0;
  _$jscoverage['/editor/dom.js'].lineData[702] = 0;
  _$jscoverage['/editor/dom.js'].lineData[704] = 0;
  _$jscoverage['/editor/dom.js'].lineData[708] = 0;
  _$jscoverage['/editor/dom.js'].lineData[711] = 0;
  _$jscoverage['/editor/dom.js'].lineData[713] = 0;
  _$jscoverage['/editor/dom.js'].lineData[714] = 0;
  _$jscoverage['/editor/dom.js'].lineData[715] = 0;
  _$jscoverage['/editor/dom.js'].lineData[720] = 0;
  _$jscoverage['/editor/dom.js'].lineData[724] = 0;
  _$jscoverage['/editor/dom.js'].lineData[725] = 0;
  _$jscoverage['/editor/dom.js'].lineData[727] = 0;
  _$jscoverage['/editor/dom.js'].lineData[731] = 0;
  _$jscoverage['/editor/dom.js'].lineData[733] = 0;
  _$jscoverage['/editor/dom.js'].lineData[734] = 0;
  _$jscoverage['/editor/dom.js'].lineData[735] = 0;
  _$jscoverage['/editor/dom.js'].lineData[736] = 0;
  _$jscoverage['/editor/dom.js'].lineData[737] = 0;
  _$jscoverage['/editor/dom.js'].lineData[741] = 0;
  _$jscoverage['/editor/dom.js'].lineData[744] = 0;
  _$jscoverage['/editor/dom.js'].lineData[747] = 0;
  _$jscoverage['/editor/dom.js'].lineData[748] = 0;
  _$jscoverage['/editor/dom.js'].lineData[751] = 0;
  _$jscoverage['/editor/dom.js'].lineData[752] = 0;
  _$jscoverage['/editor/dom.js'].lineData[755] = 0;
  _$jscoverage['/editor/dom.js'].lineData[756] = 0;
  _$jscoverage['/editor/dom.js'].lineData[762] = 0;
}
if (! _$jscoverage['/editor/dom.js'].functionData) {
  _$jscoverage['/editor/dom.js'].functionData = [];
  _$jscoverage['/editor/dom.js'].functionData[0] = 0;
  _$jscoverage['/editor/dom.js'].functionData[1] = 0;
  _$jscoverage['/editor/dom.js'].functionData[2] = 0;
  _$jscoverage['/editor/dom.js'].functionData[3] = 0;
  _$jscoverage['/editor/dom.js'].functionData[4] = 0;
  _$jscoverage['/editor/dom.js'].functionData[5] = 0;
  _$jscoverage['/editor/dom.js'].functionData[6] = 0;
  _$jscoverage['/editor/dom.js'].functionData[7] = 0;
  _$jscoverage['/editor/dom.js'].functionData[8] = 0;
  _$jscoverage['/editor/dom.js'].functionData[9] = 0;
  _$jscoverage['/editor/dom.js'].functionData[10] = 0;
  _$jscoverage['/editor/dom.js'].functionData[11] = 0;
  _$jscoverage['/editor/dom.js'].functionData[12] = 0;
  _$jscoverage['/editor/dom.js'].functionData[13] = 0;
  _$jscoverage['/editor/dom.js'].functionData[14] = 0;
  _$jscoverage['/editor/dom.js'].functionData[15] = 0;
  _$jscoverage['/editor/dom.js'].functionData[16] = 0;
  _$jscoverage['/editor/dom.js'].functionData[17] = 0;
  _$jscoverage['/editor/dom.js'].functionData[18] = 0;
  _$jscoverage['/editor/dom.js'].functionData[19] = 0;
  _$jscoverage['/editor/dom.js'].functionData[20] = 0;
  _$jscoverage['/editor/dom.js'].functionData[21] = 0;
  _$jscoverage['/editor/dom.js'].functionData[22] = 0;
  _$jscoverage['/editor/dom.js'].functionData[23] = 0;
  _$jscoverage['/editor/dom.js'].functionData[24] = 0;
  _$jscoverage['/editor/dom.js'].functionData[25] = 0;
  _$jscoverage['/editor/dom.js'].functionData[26] = 0;
  _$jscoverage['/editor/dom.js'].functionData[27] = 0;
  _$jscoverage['/editor/dom.js'].functionData[28] = 0;
  _$jscoverage['/editor/dom.js'].functionData[29] = 0;
  _$jscoverage['/editor/dom.js'].functionData[30] = 0;
  _$jscoverage['/editor/dom.js'].functionData[31] = 0;
  _$jscoverage['/editor/dom.js'].functionData[32] = 0;
}
if (! _$jscoverage['/editor/dom.js'].branchData) {
  _$jscoverage['/editor/dom.js'].branchData = {};
  _$jscoverage['/editor/dom.js'].branchData['87'] = [];
  _$jscoverage['/editor/dom.js'].branchData['87'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['87'][2] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['97'] = [];
  _$jscoverage['/editor/dom.js'].branchData['97'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['97'][2] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['103'] = [];
  _$jscoverage['/editor/dom.js'].branchData['103'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['112'] = [];
  _$jscoverage['/editor/dom.js'].branchData['112'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['116'] = [];
  _$jscoverage['/editor/dom.js'].branchData['116'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['117'] = [];
  _$jscoverage['/editor/dom.js'].branchData['117'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['117'][2] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['118'] = [];
  _$jscoverage['/editor/dom.js'].branchData['118'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['119'] = [];
  _$jscoverage['/editor/dom.js'].branchData['119'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['125'] = [];
  _$jscoverage['/editor/dom.js'].branchData['125'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['135'] = [];
  _$jscoverage['/editor/dom.js'].branchData['135'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['144'] = [];
  _$jscoverage['/editor/dom.js'].branchData['144'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['150'] = [];
  _$jscoverage['/editor/dom.js'].branchData['150'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['162'] = [];
  _$jscoverage['/editor/dom.js'].branchData['162'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['166'] = [];
  _$jscoverage['/editor/dom.js'].branchData['166'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['169'] = [];
  _$jscoverage['/editor/dom.js'].branchData['169'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['170'] = [];
  _$jscoverage['/editor/dom.js'].branchData['170'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['178'] = [];
  _$jscoverage['/editor/dom.js'].branchData['178'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['179'] = [];
  _$jscoverage['/editor/dom.js'].branchData['179'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['182'] = [];
  _$jscoverage['/editor/dom.js'].branchData['182'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['183'] = [];
  _$jscoverage['/editor/dom.js'].branchData['183'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['194'] = [];
  _$jscoverage['/editor/dom.js'].branchData['194'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['198'] = [];
  _$jscoverage['/editor/dom.js'].branchData['198'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['202'] = [];
  _$jscoverage['/editor/dom.js'].branchData['202'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['202'][2] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['207'] = [];
  _$jscoverage['/editor/dom.js'].branchData['207'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['207'][2] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['207'][3] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['208'] = [];
  _$jscoverage['/editor/dom.js'].branchData['208'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['208'][2] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['219'] = [];
  _$jscoverage['/editor/dom.js'].branchData['219'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['225'] = [];
  _$jscoverage['/editor/dom.js'].branchData['225'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['246'] = [];
  _$jscoverage['/editor/dom.js'].branchData['246'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['257'] = [];
  _$jscoverage['/editor/dom.js'].branchData['257'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['263'] = [];
  _$jscoverage['/editor/dom.js'].branchData['263'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['263'][2] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['278'] = [];
  _$jscoverage['/editor/dom.js'].branchData['278'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['300'] = [];
  _$jscoverage['/editor/dom.js'].branchData['300'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['303'] = [];
  _$jscoverage['/editor/dom.js'].branchData['303'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['307'] = [];
  _$jscoverage['/editor/dom.js'].branchData['307'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['312'] = [];
  _$jscoverage['/editor/dom.js'].branchData['312'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['313'] = [];
  _$jscoverage['/editor/dom.js'].branchData['313'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['313'][2] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['314'] = [];
  _$jscoverage['/editor/dom.js'].branchData['314'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['314'][2] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['320'] = [];
  _$jscoverage['/editor/dom.js'].branchData['320'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['323'] = [];
  _$jscoverage['/editor/dom.js'].branchData['323'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['323'][2] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['329'] = [];
  _$jscoverage['/editor/dom.js'].branchData['329'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['333'] = [];
  _$jscoverage['/editor/dom.js'].branchData['333'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['333'][2] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['337'] = [];
  _$jscoverage['/editor/dom.js'].branchData['337'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['337'][2] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['346'] = [];
  _$jscoverage['/editor/dom.js'].branchData['346'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['349'] = [];
  _$jscoverage['/editor/dom.js'].branchData['349'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['353'] = [];
  _$jscoverage['/editor/dom.js'].branchData['353'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['358'] = [];
  _$jscoverage['/editor/dom.js'].branchData['358'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['359'] = [];
  _$jscoverage['/editor/dom.js'].branchData['359'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['359'][2] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['360'] = [];
  _$jscoverage['/editor/dom.js'].branchData['360'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['360'][2] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['366'] = [];
  _$jscoverage['/editor/dom.js'].branchData['366'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['369'] = [];
  _$jscoverage['/editor/dom.js'].branchData['369'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['369'][2] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['375'] = [];
  _$jscoverage['/editor/dom.js'].branchData['375'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['379'] = [];
  _$jscoverage['/editor/dom.js'].branchData['379'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['379'][2] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['383'] = [];
  _$jscoverage['/editor/dom.js'].branchData['383'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['383'][2] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['395'] = [];
  _$jscoverage['/editor/dom.js'].branchData['395'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['399'] = [];
  _$jscoverage['/editor/dom.js'].branchData['399'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['406'] = [];
  _$jscoverage['/editor/dom.js'].branchData['406'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['415'] = [];
  _$jscoverage['/editor/dom.js'].branchData['415'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['418'] = [];
  _$jscoverage['/editor/dom.js'].branchData['418'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['426'] = [];
  _$jscoverage['/editor/dom.js'].branchData['426'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['431'] = [];
  _$jscoverage['/editor/dom.js'].branchData['431'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['439'] = [];
  _$jscoverage['/editor/dom.js'].branchData['439'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['454'] = [];
  _$jscoverage['/editor/dom.js'].branchData['454'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['460'] = [];
  _$jscoverage['/editor/dom.js'].branchData['460'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['465'] = [];
  _$jscoverage['/editor/dom.js'].branchData['465'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['465'][2] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['466'] = [];
  _$jscoverage['/editor/dom.js'].branchData['466'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['467'] = [];
  _$jscoverage['/editor/dom.js'].branchData['467'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['471'] = [];
  _$jscoverage['/editor/dom.js'].branchData['471'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['475'] = [];
  _$jscoverage['/editor/dom.js'].branchData['475'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['476'] = [];
  _$jscoverage['/editor/dom.js'].branchData['476'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['476'][2] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['476'][3] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['478'] = [];
  _$jscoverage['/editor/dom.js'].branchData['478'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['491'] = [];
  _$jscoverage['/editor/dom.js'].branchData['491'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['492'] = [];
  _$jscoverage['/editor/dom.js'].branchData['492'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['493'] = [];
  _$jscoverage['/editor/dom.js'].branchData['493'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['499'] = [];
  _$jscoverage['/editor/dom.js'].branchData['499'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['510'] = [];
  _$jscoverage['/editor/dom.js'].branchData['510'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['510'][2] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['521'] = [];
  _$jscoverage['/editor/dom.js'].branchData['521'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['522'] = [];
  _$jscoverage['/editor/dom.js'].branchData['522'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['543'] = [];
  _$jscoverage['/editor/dom.js'].branchData['543'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['547'] = [];
  _$jscoverage['/editor/dom.js'].branchData['547'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['550'] = [];
  _$jscoverage['/editor/dom.js'].branchData['550'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['564'] = [];
  _$jscoverage['/editor/dom.js'].branchData['564'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['567'] = [];
  _$jscoverage['/editor/dom.js'].branchData['567'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['570'] = [];
  _$jscoverage['/editor/dom.js'].branchData['570'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['580'] = [];
  _$jscoverage['/editor/dom.js'].branchData['580'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['582'] = [];
  _$jscoverage['/editor/dom.js'].branchData['582'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['583'] = [];
  _$jscoverage['/editor/dom.js'].branchData['583'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['583'][2] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['584'] = [];
  _$jscoverage['/editor/dom.js'].branchData['584'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['595'] = [];
  _$jscoverage['/editor/dom.js'].branchData['595'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['596'] = [];
  _$jscoverage['/editor/dom.js'].branchData['596'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['596'][2] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['600'] = [];
  _$jscoverage['/editor/dom.js'].branchData['600'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['601'] = [];
  _$jscoverage['/editor/dom.js'].branchData['601'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['601'][2] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['602'] = [];
  _$jscoverage['/editor/dom.js'].branchData['602'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['616'] = [];
  _$jscoverage['/editor/dom.js'].branchData['616'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['618'] = [];
  _$jscoverage['/editor/dom.js'].branchData['618'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['634'] = [];
  _$jscoverage['/editor/dom.js'].branchData['634'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['644'] = [];
  _$jscoverage['/editor/dom.js'].branchData['644'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['646'] = [];
  _$jscoverage['/editor/dom.js'].branchData['646'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['654'] = [];
  _$jscoverage['/editor/dom.js'].branchData['654'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['658'] = [];
  _$jscoverage['/editor/dom.js'].branchData['658'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['658'][2] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['660'] = [];
  _$jscoverage['/editor/dom.js'].branchData['660'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['661'] = [];
  _$jscoverage['/editor/dom.js'].branchData['661'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['661'][2] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['661'][3] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['664'] = [];
  _$jscoverage['/editor/dom.js'].branchData['664'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['672'] = [];
  _$jscoverage['/editor/dom.js'].branchData['672'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['681'] = [];
  _$jscoverage['/editor/dom.js'].branchData['681'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['682'] = [];
  _$jscoverage['/editor/dom.js'].branchData['682'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['684'] = [];
  _$jscoverage['/editor/dom.js'].branchData['684'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['691'] = [];
  _$jscoverage['/editor/dom.js'].branchData['691'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['691'][2] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['694'] = [];
  _$jscoverage['/editor/dom.js'].branchData['694'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['701'] = [];
  _$jscoverage['/editor/dom.js'].branchData['701'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['704'] = [];
  _$jscoverage['/editor/dom.js'].branchData['704'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['704'][2] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['705'] = [];
  _$jscoverage['/editor/dom.js'].branchData['705'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['705'][2] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['706'] = [];
  _$jscoverage['/editor/dom.js'].branchData['706'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['707'] = [];
  _$jscoverage['/editor/dom.js'].branchData['707'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['713'] = [];
  _$jscoverage['/editor/dom.js'].branchData['713'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['727'] = [];
  _$jscoverage['/editor/dom.js'].branchData['727'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['727'][2] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['733'] = [];
  _$jscoverage['/editor/dom.js'].branchData['733'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['736'] = [];
  _$jscoverage['/editor/dom.js'].branchData['736'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['741'] = [];
  _$jscoverage['/editor/dom.js'].branchData['741'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['755'] = [];
  _$jscoverage['/editor/dom.js'].branchData['755'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['755'][2] = new BranchData();
}
_$jscoverage['/editor/dom.js'].branchData['755'][2].init(680, 50, 'innerSibling[0].nodeType === NodeType.ELEMENT_NODE');
function visit209_755_2(result) {
  _$jscoverage['/editor/dom.js'].branchData['755'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['755'][1].init(661, 69, 'innerSibling[0] && innerSibling[0].nodeType === NodeType.ELEMENT_NODE');
function visit208_755_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['755'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['741'][1].init(528, 42, 'element._4eIsIdentical(sibling, undefined)');
function visit207_741_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['741'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['736'][1].init(157, 8, '!sibling');
function visit206_736_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['736'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['733'][1].init(203, 76, 'sibling.attr(\'_ke_bookmark\') || sibling._4eIsEmptyInlineRemovable(undefined)');
function visit205_733_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['733'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['727'][2].init(96, 45, 'sibling[0].nodeType === NodeType.ELEMENT_NODE');
function visit204_727_2(result) {
  _$jscoverage['/editor/dom.js'].branchData['727'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['727'][1].init(85, 56, 'sibling && sibling[0].nodeType === NodeType.ELEMENT_NODE');
function visit203_727_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['727'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['713'][1].init(431, 23, 'currentIndex === target');
function visit202_713_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['713'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['707'][1].init(56, 40, 'candidate.previousSibling.nodeType === 3');
function visit201_707_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['707'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['706'][1].init(55, 97, 'candidate.previousSibling && candidate.previousSibling.nodeType === 3');
function visit200_706_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['706'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['705'][2].init(142, 24, 'candidate.nodeType === 3');
function visit199_705_2(result) {
  _$jscoverage['/editor/dom.js'].branchData['705'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['705'][1].init(50, 153, 'candidate.nodeType === 3 && candidate.previousSibling && candidate.previousSibling.nodeType === 3');
function visit198_705_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['705'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['704'][2].init(89, 19, 'normalized === TRUE');
function visit197_704_2(result) {
  _$jscoverage['/editor/dom.js'].branchData['704'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['704'][1].init(89, 204, 'normalized === TRUE && candidate.nodeType === 3 && candidate.previousSibling && candidate.previousSibling.nodeType === 3');
function visit196_704_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['704'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['701'][1].init(277, 23, 'j < $.childNodes.length');
function visit195_701_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['701'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['694'][1].init(73, 11, '!normalized');
function visit194_694_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['694'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['691'][2].init(84, 18, 'i < address.length');
function visit193_691_2(result) {
  _$jscoverage['/editor/dom.js'].branchData['691'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['691'][1].init(79, 23, '$ && i < address.length');
function visit192_691_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['691'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['684'][1].init(317, 19, 'dtd && dtd[\'#text\']');
function visit191_684_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['684'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['682'][1].init(58, 33, 'xhtmlDtd[name] || xhtmlDtd.span');
function visit190_682_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['682'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['681'][1].init(54, 93, '!xhtmlDtd.$nonEditable[name] && (xhtmlDtd[name] || xhtmlDtd.span)');
function visit189_681_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['681'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['672'][1].init(1421, 23, 'el.style.cssText !== \'\'');
function visit188_672_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['672'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['664'][1].init(178, 18, 'attrValue === NULL');
function visit187_664_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['664'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['661'][3].init(75, 20, 'attrName === \'value\'');
function visit186_661_3(result) {
  _$jscoverage['/editor/dom.js'].branchData['661'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['661'][2].init(56, 39, 'attribute.value && attrName === \'value\'');
function visit185_661_2(result) {
  _$jscoverage['/editor/dom.js'].branchData['661'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['661'][1].init(47, 48, 'UA.ie && attribute.value && attrName === \'value\'');
function visit184_661_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['661'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['660'][1].init(677, 97, 'attribute.specified || (UA.ie && attribute.value && attrName === \'value\')');
function visit183_660_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['660'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['658'][2].init(521, 22, 'attrName === \'checked\'');
function visit182_658_2(result) {
  _$jscoverage['/editor/dom.js'].branchData['658'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['658'][1].init(521, 62, 'attrName === \'checked\' && (attrValue = Dom.attr(el, attrName))');
function visit181_658_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['658'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['654'][1].init(410, 26, 'attrName in skipAttributes');
function visit180_654_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['654'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['646'][1].init(180, 21, 'n < attributes.length');
function visit179_646_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['646'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['644'][1].init(125, 20, 'skipAttributes || {}');
function visit178_644_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['644'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['634'][1].init(343, 18, 'removeFromDatabase');
function visit177_634_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['634'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['618'][1].init(167, 126, 'element.data(\'list_marker_names\') || (element.data(\'list_marker_names\', {}).data(\'list_marker_names\'))');
function visit176_618_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['618'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['616'][1].init(71, 123, 'element.data(\'list_marker_id\') || (element.data(\'list_marker_id\', S.guid()).data(\'list_marker_id\'))');
function visit175_616_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['616'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['602'][1].init(68, 32, 'Dom.nodeName(lastChild) !== \'br\'');
function visit174_602_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['602'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['601'][2].init(371, 45, 'lastChild.nodeType === Dom.NodeType.TEXT_NODE');
function visit173_601_2(result) {
  _$jscoverage['/editor/dom.js'].branchData['601'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['601'][1].init(33, 101, 'lastChild.nodeType === Dom.NodeType.TEXT_NODE || Dom.nodeName(lastChild) !== \'br\'');
function visit172_601_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['601'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['600'][1].init(335, 135, '!lastChild || lastChild.nodeType === Dom.NodeType.TEXT_NODE || Dom.nodeName(lastChild) !== \'br\'');
function visit171_600_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['600'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['596'][2].init(158, 45, 'lastChild.nodeType === Dom.NodeType.TEXT_NODE');
function visit170_596_2(result) {
  _$jscoverage['/editor/dom.js'].branchData['596'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['596'][1].init(32, 77, 'lastChild.nodeType === Dom.NodeType.TEXT_NODE && !S.trim(lastChild.nodeValue)');
function visit169_596_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['596'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['595'][1].init(123, 110, 'lastChild && lastChild.nodeType === Dom.NodeType.TEXT_NODE && !S.trim(lastChild.nodeValue)');
function visit168_595_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['595'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['584'][1].init(47, 28, 'Dom.nodeName(child) === \'br\'');
function visit167_584_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['584'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['583'][2].init(102, 20, 'child.nodeType === 1');
function visit166_583_2(result) {
  _$jscoverage['/editor/dom.js'].branchData['583'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['583'][1].init(32, 76, 'child.nodeType === 1 && Dom.nodeName(child) === \'br\'');
function visit165_583_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['583'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['582'][1].init(67, 109, 'child && child.nodeType === 1 && Dom.nodeName(child) === \'br\'');
function visit164_582_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['582'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['580'][1].init(854, 19, '!UA.ie && !UA.opera');
function visit163_580_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['580'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['570'][1].init(303, 31, 'trimmed.length < originalLength');
function visit162_570_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['570'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['567'][1].init(166, 8, '!trimmed');
function visit161_567_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['567'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['564'][1].init(25, 37, 'child.type === Dom.NodeType.TEXT_NODE');
function visit160_564_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['564'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['550'][1].init(304, 31, 'trimmed.length < originalLength');
function visit159_550_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['550'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['547'][1].init(167, 8, '!trimmed');
function visit158_547_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['547'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['543'][1].init(25, 41, 'child.nodeType === Dom.NodeType.TEXT_NODE');
function visit157_543_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['543'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['522'][1].init(25, 16, 'preserveChildren');
function visit156_522_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['522'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['521'][1].init(65, 6, 'parent');
function visit155_521_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['521'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['510'][2].init(171, 25, 'node !== $documentElement');
function visit154_510_2(result) {
  _$jscoverage['/editor/dom.js'].branchData['510'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['510'][1].init(163, 33, 'node && node !== $documentElement');
function visit153_510_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['510'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['499'][1].init(2106, 44, 'addressOfThis.length < addressOfOther.length');
function visit152_499_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['499'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['493'][1].init(32, 40, 'addressOfThis[i] < addressOfOther[i]');
function visit151_493_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['493'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['492'][1].init(25, 42, 'addressOfThis[i] !== addressOfOther[i]');
function visit150_492_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['492'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['491'][1].init(1730, 17, 'i <= minLevel - 1');
function visit149_491_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['491'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['478'][1].init(132, 35, 'el.sourceIndex < $other.sourceIndex');
function visit148_478_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['478'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['476'][3].init(55, 22, '$other.sourceIndex < 0');
function visit147_476_3(result) {
  _$jscoverage['/editor/dom.js'].branchData['476'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['476'][2].init(33, 18, 'el.sourceIndex < 0');
function visit146_476_2(result) {
  _$jscoverage['/editor/dom.js'].branchData['476'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['476'][1].init(33, 44, 'el.sourceIndex < 0 || $other.sourceIndex < 0');
function visit145_476_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['476'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['475'][1].init(337, 19, '\'sourceIndex\' in el');
function visit144_475_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['475'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['471'][1].init(179, 24, 'Dom.contains($other, el)');
function visit143_471_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['471'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['467'][1].init(25, 24, 'Dom.contains(el, $other)');
function visit142_467_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['467'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['466'][1].init(60, 41, '$other.nodeType === NodeType.ELEMENT_NODE');
function visit141_466_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['466'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['465'][2].init(465, 37, 'el.nodeType === NodeType.ELEMENT_NODE');
function visit140_465_2(result) {
  _$jscoverage['/editor/dom.js'].branchData['465'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['465'][1].init(465, 102, 'el.nodeType === NodeType.ELEMENT_NODE && $other.nodeType === NodeType.ELEMENT_NODE');
function visit139_465_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['465'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['460'][1].init(286, 13, 'el === $other');
function visit138_460_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['460'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['454'][1].init(75, 26, 'el.compareDocumentPosition');
function visit137_454_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['454'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['439'][1].init(57, 8, 'UA.gecko');
function visit136_439_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['439'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['431'][1].init(45, 19, 'attribute.specified');
function visit135_431_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['431'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['426'][1].init(434, 24, 'el.getAttribute(\'class\')');
function visit134_426_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['426'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['418'][1].init(89, 21, 'i < attributes.length');
function visit133_418_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['418'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['415'][1].init(11734, 13, 'UA.ieMode < 9');
function visit132_415_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['415'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['406'][1].init(25, 25, 'Dom.contains(start, node)');
function visit131_406_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['406'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['399'][1].init(150, 22, 'Dom.contains(node, el)');
function visit130_399_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['399'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['395'][1].init(65, 11, 'el === node');
function visit129_395_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['395'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['383'][2].init(1425, 26, 'node.nodeType !== nodeType');
function visit128_383_2(result) {
  _$jscoverage['/editor/dom.js'].branchData['383'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['383'][1].init(1413, 38, 'nodeType && node.nodeType !== nodeType');
function visit127_383_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['383'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['379'][2].init(1316, 21, 'guard(node) === FALSE');
function visit126_379_2(result) {
  _$jscoverage['/editor/dom.js'].branchData['379'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['379'][1].init(1307, 30, 'guard && guard(node) === FALSE');
function visit125_379_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['379'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['375'][1].init(1226, 5, '!node');
function visit124_375_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['375'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['369'][2].init(176, 29, 'guard(parent, TRUE) === FALSE');
function visit123_369_2(result) {
  _$jscoverage['/editor/dom.js'].branchData['369'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['369'][1].init(167, 38, 'guard && guard(parent, TRUE) === FALSE');
function visit122_369_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['369'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['366'][1].init(828, 37, '!node && (parent = parent.parentNode)');
function visit121_366_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['366'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['360'][2].init(101, 25, 'guard(el, TRUE) === FALSE');
function visit120_360_2(result) {
  _$jscoverage['/editor/dom.js'].branchData['360'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['360'][1].init(64, 34, 'guard && guard(el, TRUE) === FALSE');
function visit119_360_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['360'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['359'][2].init(25, 37, 'el.nodeType === NodeType.ELEMENT_NODE');
function visit118_359_2(result) {
  _$jscoverage['/editor/dom.js'].branchData['359'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['359'][1].init(25, 99, 'el.nodeType === NodeType.ELEMENT_NODE && guard && guard(el, TRUE) === FALSE');
function visit117_359_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['359'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['358'][1].init(544, 5, '!node');
function visit116_358_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['358'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['353'][1].init(267, 33, '!startFromSibling && el.lastChild');
function visit115_353_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['353'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['349'][1].init(32, 18, 'node !== guardNode');
function visit114_349_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['349'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['346'][1].init(21, 20, 'guard && !guard.call');
function visit113_346_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['346'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['337'][2].init(1487, 26, 'nodeType !== node.nodeType');
function visit112_337_2(result) {
  _$jscoverage['/editor/dom.js'].branchData['337'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['337'][1].init(1475, 38, 'nodeType && nodeType !== node.nodeType');
function visit111_337_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['337'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['333'][2].init(1378, 21, 'guard(node) === FALSE');
function visit110_333_2(result) {
  _$jscoverage['/editor/dom.js'].branchData['333'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['333'][1].init(1369, 30, 'guard && guard(node) === FALSE');
function visit109_333_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['333'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['329'][1].init(1288, 5, '!node');
function visit108_329_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['329'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['323'][2].init(176, 29, 'guard(parent, TRUE) === FALSE');
function visit107_323_2(result) {
  _$jscoverage['/editor/dom.js'].branchData['323'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['323'][1].init(167, 38, 'guard && guard(parent, TRUE) === FALSE');
function visit106_323_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['323'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['320'][1].init(894, 37, '!node && (parent = parent.parentNode)');
function visit105_320_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['320'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['314'][2].init(101, 25, 'guard(el, TRUE) === FALSE');
function visit104_314_2(result) {
  _$jscoverage['/editor/dom.js'].branchData['314'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['314'][1].init(64, 34, 'guard && guard(el, TRUE) === FALSE');
function visit103_314_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['314'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['313'][2].init(25, 37, 'el.nodeType === NodeType.ELEMENT_NODE');
function visit102_313_2(result) {
  _$jscoverage['/editor/dom.js'].branchData['313'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['313'][1].init(25, 99, 'el.nodeType === NodeType.ELEMENT_NODE && guard && guard(el, TRUE) === FALSE');
function visit101_313_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['313'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['312'][1].init(614, 5, '!node');
function visit100_312_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['312'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['307'][1].init(336, 34, '!startFromSibling && el.firstChild');
function visit99_307_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['307'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['303'][1].init(32, 18, 'node !== guardNode');
function visit98_303_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['303'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['300'][1].init(90, 20, 'guard && !guard.call');
function visit97_300_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['300'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['278'][1].init(1055, 20, '!!(doc.documentMode)');
function visit96_278_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['278'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['263'][2].init(396, 30, 'offset === el.nodeValue.length');
function visit95_263_2(result) {
  _$jscoverage['/editor/dom.js'].branchData['263'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['263'][1].init(387, 39, 'UA.ie && offset === el.nodeValue.length');
function visit94_263_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['263'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['257'][1].init(66, 38, 'el.nodeType !== Dom.NodeType.TEXT_NODE');
function visit93_257_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['257'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['246'][1].init(108, 36, 'REMOVE_EMPTY[thisElement.nodeName()]');
function visit92_246_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['246'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['225'][1].init(189, 7, 'toStart');
function visit91_225_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['225'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['219'][1].init(68, 22, 'thisElement === target');
function visit90_219_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['219'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['208'][2].init(408, 35, 'nodeType === Dom.NodeType.TEXT_NODE');
function visit89_208_2(result) {
  _$jscoverage['/editor/dom.js'].branchData['208'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['208'][1].init(102, 62, 'nodeType === Dom.NodeType.TEXT_NODE && S.trim(child.nodeValue)');
function visit88_208_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['208'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['207'][3].init(303, 34, 'nodeType === NodeType.ELEMENT_NODE');
function visit87_207_3(result) {
  _$jscoverage['/editor/dom.js'].branchData['207'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['207'][2].init(303, 75, 'nodeType === NodeType.ELEMENT_NODE && !Dom._4eIsEmptyInlineRemovable(child)');
function visit86_207_2(result) {
  _$jscoverage['/editor/dom.js'].branchData['207'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['207'][1].init(303, 165, 'nodeType === NodeType.ELEMENT_NODE && !Dom._4eIsEmptyInlineRemovable(child) || nodeType === Dom.NodeType.TEXT_NODE && S.trim(child.nodeValue)');
function visit85_207_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['207'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['202'][2].init(122, 34, 'nodeType === NodeType.ELEMENT_NODE');
function visit84_202_2(result) {
  _$jscoverage['/editor/dom.js'].branchData['202'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['202'][1].init(122, 96, 'nodeType === NodeType.ELEMENT_NODE && child.getAttribute(\'_ke_bookmark\')');
function visit83_202_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['202'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['198'][1].init(238, 9, 'i < count');
function visit82_198_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['198'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['194'][1].init(21, 49, '!xhtmlDtd.$removeEmpty[Dom.nodeName(thisElement)]');
function visit81_194_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['194'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['183'][1].init(50, 60, 'Dom.attr(thisElement, name) !== Dom.attr(otherElement, name)');
function visit80_183_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['183'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['182'][1].init(134, 111, 'attribute.specified && Dom.attr(thisElement, name) !== Dom.attr(otherElement, name)');
function visit79_182_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['182'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['179'][1].init(33, 15, 'i < otherLength');
function visit78_179_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['179'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['178'][1].init(1259, 13, 'UA.ieMode < 8');
function visit77_178_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['178'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['170'][1].init(46, 60, 'Dom.attr(thisElement, name) !== Dom.attr(otherElement, name)');
function visit76_170_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['170'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['169'][1].init(119, 107, 'attribute.specified && Dom.attr(thisElement, name) !== Dom.attr(otherElement, name)');
function visit75_169_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['169'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['166'][1].init(715, 14, 'i < thisLength');
function visit74_166_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['166'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['162'][1].init(600, 26, 'thisLength !== otherLength');
function visit73_162_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['162'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['150'][1].init(170, 56, 'Dom.nodeName(thisElement) !== Dom.nodeName(otherElement)');
function visit72_150_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['150'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['144'][1].init(21, 13, '!otherElement');
function visit71_144_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['144'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['135'][1].init(67, 7, 'toStart');
function visit70_135_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['135'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['125'][1].init(410, 16, 'candidate === el');
function visit69_125_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['125'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['119'][1].init(52, 40, 'candidate.previousSibling.nodeType === 3');
function visit68_119_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['119'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['118'][1].init(51, 93, 'candidate.previousSibling && candidate.previousSibling.nodeType === 3');
function visit67_118_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['118'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['117'][2].init(145, 24, 'candidate.nodeType === 3');
function visit66_117_2(result) {
  _$jscoverage['/editor/dom.js'].branchData['117'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['117'][1].init(37, 145, 'candidate.nodeType === 3 && candidate.previousSibling && candidate.previousSibling.nodeType === 3');
function visit65_117_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['117'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['116'][1].init(105, 183, 'normalized && candidate.nodeType === 3 && candidate.previousSibling && candidate.previousSibling.nodeType === 3');
function visit64_116_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['116'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['112'][1].init(161, 19, 'i < siblings.length');
function visit63_112_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['112'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['103'][1].init(119, 90, 'blockBoundaryDisplayMatch[Dom.css(el, \'display\')] || nodeNameMatches[Dom.nodeName(el)]');
function visit62_103_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['103'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['97'][2].init(113, 22, 'e1p === el2.parentNode');
function visit61_97_2(result) {
  _$jscoverage['/editor/dom.js'].branchData['97'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['97'][1].init(106, 29, 'e1p && e1p === el2.parentNode');
function visit60_97_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['97'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['87'][2].init(27, 11, 'el[0] || el');
function visit59_87_2(result) {
  _$jscoverage['/editor/dom.js'].branchData['87'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['87'][1].init(20, 19, 'el && (el[0] || el)');
function visit58_87_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['87'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].lineData[10]++;
KISSY.add(function(S, require) {
  _$jscoverage['/editor/dom.js'].functionData[0]++;
  _$jscoverage['/editor/dom.js'].lineData[11]++;
  var Node = require('node');
  _$jscoverage['/editor/dom.js'].lineData[12]++;
  var Editor = require('./base');
  _$jscoverage['/editor/dom.js'].lineData[13]++;
  var Utils = require('./utils');
  _$jscoverage['/editor/dom.js'].lineData[14]++;
  var TRUE = true, FALSE = false, NULL = null, xhtmlDtd = Editor.XHTML_DTD, Dom = S.require('dom'), NodeType = Dom.NodeType, UA = S.UA, REMOVE_EMPTY = {
  a: 1, 
  abbr: 1, 
  acronym: 1, 
  address: 1, 
  b: 1, 
  bdo: 1, 
  big: 1, 
  cite: 1, 
  code: 1, 
  del: 1, 
  dfn: 1, 
  em: 1, 
  font: 1, 
  i: 1, 
  ins: 1, 
  label: 1, 
  kbd: 1, 
  q: 1, 
  s: 1, 
  samp: 1, 
  small: 1, 
  span: 1, 
  strike: 1, 
  strong: 1, 
  sub: 1, 
  sup: 1, 
  tt: 1, 
  u: 1, 
  'var': 1};
  _$jscoverage['/editor/dom.js'].lineData[56]++;
  Editor.PositionType = {
  POSITION_IDENTICAL: 0, 
  POSITION_DISCONNECTED: 1, 
  POSITION_FOLLOWING: 2, 
  POSITION_PRECEDING: 4, 
  POSITION_IS_CONTAINED: 8, 
  POSITION_CONTAINS: 16};
  _$jscoverage['/editor/dom.js'].lineData[64]++;
  var KEP = Editor.PositionType;
  _$jscoverage['/editor/dom.js'].lineData[72]++;
  var blockBoundaryDisplayMatch = {
  block: 1, 
  'list-item': 1, 
  table: 1, 
  'table-row-group': 1, 
  'table-header-group': 1, 
  'table-footer-group': 1, 
  'table-row': 1, 
  'table-column-group': 1, 
  'table-column': 1, 
  'table-cell': 1, 
  'table-caption': 1}, blockBoundaryNodeNameMatch = {
  hr: 1}, normalElDom = function(el) {
  _$jscoverage['/editor/dom.js'].functionData[1]++;
  _$jscoverage['/editor/dom.js'].lineData[87]++;
  return visit58_87_1(el && (visit59_87_2(el[0] || el)));
}, normalEl = function(el) {
  _$jscoverage['/editor/dom.js'].functionData[2]++;
  _$jscoverage['/editor/dom.js'].lineData[90]++;
  return new Node(el);
}, editorDom = {
  _4eSameLevel: function(el1, el2) {
  _$jscoverage['/editor/dom.js'].functionData[3]++;
  _$jscoverage['/editor/dom.js'].lineData[95]++;
  el2 = normalElDom(el2);
  _$jscoverage['/editor/dom.js'].lineData[96]++;
  var e1p = el1.parentNode;
  _$jscoverage['/editor/dom.js'].lineData[97]++;
  return visit60_97_1(e1p && visit61_97_2(e1p === el2.parentNode));
}, 
  _4eIsBlockBoundary: function(el, customNodeNames) {
  _$jscoverage['/editor/dom.js'].functionData[4]++;
  _$jscoverage['/editor/dom.js'].lineData[102]++;
  var nodeNameMatches = S.merge(blockBoundaryNodeNameMatch, customNodeNames);
  _$jscoverage['/editor/dom.js'].lineData[103]++;
  return !!(visit62_103_1(blockBoundaryDisplayMatch[Dom.css(el, 'display')] || nodeNameMatches[Dom.nodeName(el)]));
}, 
  _4eIndex: function(el, normalized) {
  _$jscoverage['/editor/dom.js'].functionData[5]++;
  _$jscoverage['/editor/dom.js'].lineData[108]++;
  var siblings = el.parentNode.childNodes, candidate, currentIndex = -1;
  _$jscoverage['/editor/dom.js'].lineData[112]++;
  for (var i = 0; visit63_112_1(i < siblings.length); i++) {
    _$jscoverage['/editor/dom.js'].lineData[113]++;
    candidate = siblings[i];
    _$jscoverage['/editor/dom.js'].lineData[116]++;
    if (visit64_116_1(normalized && visit65_117_1(visit66_117_2(candidate.nodeType === 3) && visit67_118_1(candidate.previousSibling && visit68_119_1(candidate.previousSibling.nodeType === 3))))) {
      _$jscoverage['/editor/dom.js'].lineData[120]++;
      continue;
    }
    _$jscoverage['/editor/dom.js'].lineData[123]++;
    currentIndex++;
    _$jscoverage['/editor/dom.js'].lineData[125]++;
    if (visit69_125_1(candidate === el)) {
      _$jscoverage['/editor/dom.js'].lineData[126]++;
      return currentIndex;
    }
  }
  _$jscoverage['/editor/dom.js'].lineData[129]++;
  return -1;
}, 
  _4eMove: function(thisElement, target, toStart) {
  _$jscoverage['/editor/dom.js'].functionData[6]++;
  _$jscoverage['/editor/dom.js'].lineData[134]++;
  target = normalElDom(target);
  _$jscoverage['/editor/dom.js'].lineData[135]++;
  if (visit70_135_1(toStart)) {
    _$jscoverage['/editor/dom.js'].lineData[136]++;
    target.insertBefore(thisElement, target.firstChild);
  } else {
    _$jscoverage['/editor/dom.js'].lineData[138]++;
    target.appendChild(thisElement);
  }
}, 
  _4eIsIdentical: function(thisElement, otherElement) {
  _$jscoverage['/editor/dom.js'].functionData[7]++;
  _$jscoverage['/editor/dom.js'].lineData[144]++;
  if (visit71_144_1(!otherElement)) {
    _$jscoverage['/editor/dom.js'].lineData[145]++;
    return FALSE;
  }
  _$jscoverage['/editor/dom.js'].lineData[148]++;
  otherElement = normalElDom(otherElement);
  _$jscoverage['/editor/dom.js'].lineData[150]++;
  if (visit72_150_1(Dom.nodeName(thisElement) !== Dom.nodeName(otherElement))) {
    _$jscoverage['/editor/dom.js'].lineData[151]++;
    return FALSE;
  }
  _$jscoverage['/editor/dom.js'].lineData[154]++;
  var thisAttributes = thisElement.attributes, attribute, name, otherAttributes = otherElement.attributes;
  _$jscoverage['/editor/dom.js'].lineData[159]++;
  var thisLength = thisAttributes.length, otherLength = otherAttributes.length;
  _$jscoverage['/editor/dom.js'].lineData[162]++;
  if (visit73_162_1(thisLength !== otherLength)) {
    _$jscoverage['/editor/dom.js'].lineData[163]++;
    return FALSE;
  }
  _$jscoverage['/editor/dom.js'].lineData[166]++;
  for (var i = 0; visit74_166_1(i < thisLength); i++) {
    _$jscoverage['/editor/dom.js'].lineData[167]++;
    attribute = thisAttributes[i];
    _$jscoverage['/editor/dom.js'].lineData[168]++;
    name = attribute.name;
    _$jscoverage['/editor/dom.js'].lineData[169]++;
    if (visit75_169_1(attribute.specified && visit76_170_1(Dom.attr(thisElement, name) !== Dom.attr(otherElement, name)))) {
      _$jscoverage['/editor/dom.js'].lineData[171]++;
      return FALSE;
    }
  }
  _$jscoverage['/editor/dom.js'].lineData[178]++;
  if (visit77_178_1(UA.ieMode < 8)) {
    _$jscoverage['/editor/dom.js'].lineData[179]++;
    for (i = 0; visit78_179_1(i < otherLength); i++) {
      _$jscoverage['/editor/dom.js'].lineData[180]++;
      attribute = otherAttributes[i];
      _$jscoverage['/editor/dom.js'].lineData[181]++;
      name = attribute.name;
      _$jscoverage['/editor/dom.js'].lineData[182]++;
      if (visit79_182_1(attribute.specified && visit80_183_1(Dom.attr(thisElement, name) !== Dom.attr(otherElement, name)))) {
        _$jscoverage['/editor/dom.js'].lineData[184]++;
        return FALSE;
      }
    }
  }
  _$jscoverage['/editor/dom.js'].lineData[189]++;
  return TRUE;
}, 
  _4eIsEmptyInlineRemovable: function(thisElement) {
  _$jscoverage['/editor/dom.js'].functionData[8]++;
  _$jscoverage['/editor/dom.js'].lineData[194]++;
  if (visit81_194_1(!xhtmlDtd.$removeEmpty[Dom.nodeName(thisElement)])) {
    _$jscoverage['/editor/dom.js'].lineData[195]++;
    return false;
  }
  _$jscoverage['/editor/dom.js'].lineData[197]++;
  var children = thisElement.childNodes;
  _$jscoverage['/editor/dom.js'].lineData[198]++;
  for (var i = 0, count = children.length; visit82_198_1(i < count); i++) {
    _$jscoverage['/editor/dom.js'].lineData[199]++;
    var child = children[i], nodeType = child.nodeType;
    _$jscoverage['/editor/dom.js'].lineData[202]++;
    if (visit83_202_1(visit84_202_2(nodeType === NodeType.ELEMENT_NODE) && child.getAttribute('_ke_bookmark'))) {
      _$jscoverage['/editor/dom.js'].lineData[204]++;
      continue;
    }
    _$jscoverage['/editor/dom.js'].lineData[207]++;
    if (visit85_207_1(visit86_207_2(visit87_207_3(nodeType === NodeType.ELEMENT_NODE) && !Dom._4eIsEmptyInlineRemovable(child)) || visit88_208_1(visit89_208_2(nodeType === Dom.NodeType.TEXT_NODE) && S.trim(child.nodeValue)))) {
      _$jscoverage['/editor/dom.js'].lineData[209]++;
      return FALSE;
    }
  }
  _$jscoverage['/editor/dom.js'].lineData[212]++;
  return TRUE;
}, 
  _4eMoveChildren: function(thisElement, target, toStart) {
  _$jscoverage['/editor/dom.js'].functionData[9]++;
  _$jscoverage['/editor/dom.js'].lineData[217]++;
  target = normalElDom(target);
  _$jscoverage['/editor/dom.js'].lineData[219]++;
  if (visit90_219_1(thisElement === target)) {
    _$jscoverage['/editor/dom.js'].lineData[220]++;
    return;
  }
  _$jscoverage['/editor/dom.js'].lineData[223]++;
  var child;
  _$jscoverage['/editor/dom.js'].lineData[225]++;
  if (visit91_225_1(toStart)) {
    _$jscoverage['/editor/dom.js'].lineData[226]++;
    while ((child = thisElement.lastChild)) {
      _$jscoverage['/editor/dom.js'].lineData[227]++;
      target.insertBefore(thisElement.removeChild(child), target.firstChild);
    }
  } else {
    _$jscoverage['/editor/dom.js'].lineData[230]++;
    while ((child = thisElement.firstChild)) {
      _$jscoverage['/editor/dom.js'].lineData[231]++;
      target.appendChild(thisElement.removeChild(child));
    }
  }
}, 
  _4eMergeSiblings: function(thisElement) {
  _$jscoverage['/editor/dom.js'].functionData[10]++;
  _$jscoverage['/editor/dom.js'].lineData[244]++;
  thisElement = normalEl(thisElement);
  _$jscoverage['/editor/dom.js'].lineData[246]++;
  if (visit92_246_1(REMOVE_EMPTY[thisElement.nodeName()])) {
    _$jscoverage['/editor/dom.js'].lineData[247]++;
    mergeElements(thisElement, TRUE);
    _$jscoverage['/editor/dom.js'].lineData[248]++;
    mergeElements(thisElement);
  }
}, 
  _4eSplitText: function(el, offset) {
  _$jscoverage['/editor/dom.js'].functionData[11]++;
  _$jscoverage['/editor/dom.js'].lineData[255]++;
  var doc = el.ownerDocument;
  _$jscoverage['/editor/dom.js'].lineData[257]++;
  if (visit93_257_1(el.nodeType !== Dom.NodeType.TEXT_NODE)) {
    _$jscoverage['/editor/dom.js'].lineData[258]++;
    return undefined;
  }
  _$jscoverage['/editor/dom.js'].lineData[263]++;
  if (visit94_263_1(UA.ie && visit95_263_2(offset === el.nodeValue.length))) {
    _$jscoverage['/editor/dom.js'].lineData[264]++;
    var next = doc.createTextNode('');
    _$jscoverage['/editor/dom.js'].lineData[265]++;
    Dom.insertAfter(next, el);
    _$jscoverage['/editor/dom.js'].lineData[266]++;
    return next;
  }
  _$jscoverage['/editor/dom.js'].lineData[269]++;
  var ret = el.splitText(offset);
  _$jscoverage['/editor/dom.js'].lineData[278]++;
  if (visit96_278_1(!!(doc.documentMode))) {
    _$jscoverage['/editor/dom.js'].lineData[279]++;
    var workaround = doc.createTextNode('');
    _$jscoverage['/editor/dom.js'].lineData[280]++;
    Dom.insertAfter(workaround, ret);
    _$jscoverage['/editor/dom.js'].lineData[281]++;
    Dom.remove(workaround);
  }
  _$jscoverage['/editor/dom.js'].lineData[284]++;
  return ret;
}, 
  _4eParents: function(node, closerFirst) {
  _$jscoverage['/editor/dom.js'].functionData[12]++;
  _$jscoverage['/editor/dom.js'].lineData[289]++;
  var parents = [];
  _$jscoverage['/editor/dom.js'].lineData[290]++;
  parents.__IS_NODELIST = 1;
  _$jscoverage['/editor/dom.js'].lineData[291]++;
  do {
    _$jscoverage['/editor/dom.js'].lineData[292]++;
    parents[closerFirst ? 'push' : 'unshift'](node);
  } while ((node = node.parentNode));
  _$jscoverage['/editor/dom.js'].lineData[294]++;
  return parents;
}, 
  _4eNextSourceNode: function(el, startFromSibling, nodeType, guard) {
  _$jscoverage['/editor/dom.js'].functionData[13]++;
  _$jscoverage['/editor/dom.js'].lineData[300]++;
  if (visit97_300_1(guard && !guard.call)) {
    _$jscoverage['/editor/dom.js'].lineData[301]++;
    var guardNode = normalElDom(guard);
    _$jscoverage['/editor/dom.js'].lineData[302]++;
    guard = function(node) {
  _$jscoverage['/editor/dom.js'].functionData[14]++;
  _$jscoverage['/editor/dom.js'].lineData[303]++;
  return visit98_303_1(node !== guardNode);
};
  }
  _$jscoverage['/editor/dom.js'].lineData[307]++;
  var node = visit99_307_1(!startFromSibling && el.firstChild), parent = el;
  _$jscoverage['/editor/dom.js'].lineData[312]++;
  if (visit100_312_1(!node)) {
    _$jscoverage['/editor/dom.js'].lineData[313]++;
    if (visit101_313_1(visit102_313_2(el.nodeType === NodeType.ELEMENT_NODE) && visit103_314_1(guard && visit104_314_2(guard(el, TRUE) === FALSE)))) {
      _$jscoverage['/editor/dom.js'].lineData[315]++;
      return NULL;
    }
    _$jscoverage['/editor/dom.js'].lineData[317]++;
    node = el.nextSibling;
  }
  _$jscoverage['/editor/dom.js'].lineData[320]++;
  while (visit105_320_1(!node && (parent = parent.parentNode))) {
    _$jscoverage['/editor/dom.js'].lineData[323]++;
    if (visit106_323_1(guard && visit107_323_2(guard(parent, TRUE) === FALSE))) {
      _$jscoverage['/editor/dom.js'].lineData[324]++;
      return NULL;
    }
    _$jscoverage['/editor/dom.js'].lineData[326]++;
    node = parent.nextSibling;
  }
  _$jscoverage['/editor/dom.js'].lineData[329]++;
  if (visit108_329_1(!node)) {
    _$jscoverage['/editor/dom.js'].lineData[330]++;
    return NULL;
  }
  _$jscoverage['/editor/dom.js'].lineData[333]++;
  if (visit109_333_1(guard && visit110_333_2(guard(node) === FALSE))) {
    _$jscoverage['/editor/dom.js'].lineData[334]++;
    return NULL;
  }
  _$jscoverage['/editor/dom.js'].lineData[337]++;
  if (visit111_337_1(nodeType && visit112_337_2(nodeType !== node.nodeType))) {
    _$jscoverage['/editor/dom.js'].lineData[338]++;
    return Dom._4eNextSourceNode(node, FALSE, nodeType, guard);
  }
  _$jscoverage['/editor/dom.js'].lineData[341]++;
  return node;
}, 
  _4ePreviousSourceNode: function(el, startFromSibling, nodeType, guard) {
  _$jscoverage['/editor/dom.js'].functionData[15]++;
  _$jscoverage['/editor/dom.js'].lineData[346]++;
  if (visit113_346_1(guard && !guard.call)) {
    _$jscoverage['/editor/dom.js'].lineData[347]++;
    var guardNode = normalElDom(guard);
    _$jscoverage['/editor/dom.js'].lineData[348]++;
    guard = function(node) {
  _$jscoverage['/editor/dom.js'].functionData[16]++;
  _$jscoverage['/editor/dom.js'].lineData[349]++;
  return visit114_349_1(node !== guardNode);
};
  }
  _$jscoverage['/editor/dom.js'].lineData[353]++;
  var node = visit115_353_1(!startFromSibling && el.lastChild), parent = el;
  _$jscoverage['/editor/dom.js'].lineData[358]++;
  if (visit116_358_1(!node)) {
    _$jscoverage['/editor/dom.js'].lineData[359]++;
    if (visit117_359_1(visit118_359_2(el.nodeType === NodeType.ELEMENT_NODE) && visit119_360_1(guard && visit120_360_2(guard(el, TRUE) === FALSE)))) {
      _$jscoverage['/editor/dom.js'].lineData[361]++;
      return NULL;
    }
    _$jscoverage['/editor/dom.js'].lineData[363]++;
    node = el.previousSibling;
  }
  _$jscoverage['/editor/dom.js'].lineData[366]++;
  while (visit121_366_1(!node && (parent = parent.parentNode))) {
    _$jscoverage['/editor/dom.js'].lineData[369]++;
    if (visit122_369_1(guard && visit123_369_2(guard(parent, TRUE) === FALSE))) {
      _$jscoverage['/editor/dom.js'].lineData[370]++;
      return NULL;
    }
    _$jscoverage['/editor/dom.js'].lineData[372]++;
    node = parent.previousSibling;
  }
  _$jscoverage['/editor/dom.js'].lineData[375]++;
  if (visit124_375_1(!node)) {
    _$jscoverage['/editor/dom.js'].lineData[376]++;
    return NULL;
  }
  _$jscoverage['/editor/dom.js'].lineData[379]++;
  if (visit125_379_1(guard && visit126_379_2(guard(node) === FALSE))) {
    _$jscoverage['/editor/dom.js'].lineData[380]++;
    return NULL;
  }
  _$jscoverage['/editor/dom.js'].lineData[383]++;
  if (visit127_383_1(nodeType && visit128_383_2(node.nodeType !== nodeType))) {
    _$jscoverage['/editor/dom.js'].lineData[384]++;
    return Dom._4ePreviousSourceNode(node, FALSE, nodeType, guard);
  }
  _$jscoverage['/editor/dom.js'].lineData[387]++;
  return node;
}, 
  _4eCommonAncestor: function(el, node) {
  _$jscoverage['/editor/dom.js'].functionData[17]++;
  _$jscoverage['/editor/dom.js'].lineData[393]++;
  node = normalElDom(node);
  _$jscoverage['/editor/dom.js'].lineData[395]++;
  if (visit129_395_1(el === node)) {
    _$jscoverage['/editor/dom.js'].lineData[396]++;
    return el;
  }
  _$jscoverage['/editor/dom.js'].lineData[399]++;
  if (visit130_399_1(Dom.contains(node, el))) {
    _$jscoverage['/editor/dom.js'].lineData[400]++;
    return node;
  }
  _$jscoverage['/editor/dom.js'].lineData[403]++;
  var start = el;
  _$jscoverage['/editor/dom.js'].lineData[405]++;
  do {
    _$jscoverage['/editor/dom.js'].lineData[406]++;
    if (visit131_406_1(Dom.contains(start, node))) {
      _$jscoverage['/editor/dom.js'].lineData[407]++;
      return start;
    }
  } while ((start = start.parentNode));
  _$jscoverage['/editor/dom.js'].lineData[411]++;
  return NULL;
}, 
  _4eHasAttributes: visit132_415_1(UA.ieMode < 9) ? function(el) {
  _$jscoverage['/editor/dom.js'].functionData[18]++;
  _$jscoverage['/editor/dom.js'].lineData[417]++;
  var attributes = el.attributes;
  _$jscoverage['/editor/dom.js'].lineData[418]++;
  for (var i = 0; visit133_418_1(i < attributes.length); i++) {
    _$jscoverage['/editor/dom.js'].lineData[419]++;
    var attribute = attributes[i];
    _$jscoverage['/editor/dom.js'].lineData[420]++;
    switch (attribute.name) {
      case 'class':
        _$jscoverage['/editor/dom.js'].lineData[426]++;
        if (visit134_426_1(el.getAttribute('class'))) {
          _$jscoverage['/editor/dom.js'].lineData[427]++;
          return TRUE;
        }
        _$jscoverage['/editor/dom.js'].lineData[429]++;
        break;
      default:
        _$jscoverage['/editor/dom.js'].lineData[431]++;
        if (visit135_431_1(attribute.specified)) {
          _$jscoverage['/editor/dom.js'].lineData[432]++;
          return TRUE;
        }
    }
  }
  _$jscoverage['/editor/dom.js'].lineData[436]++;
  return FALSE;
} : function(el) {
  _$jscoverage['/editor/dom.js'].functionData[19]++;
  _$jscoverage['/editor/dom.js'].lineData[439]++;
  if (visit136_439_1(UA.gecko)) {
    _$jscoverage['/editor/dom.js'].lineData[440]++;
    el.removeAttribute('_moz_dirty');
  }
  _$jscoverage['/editor/dom.js'].lineData[444]++;
  return el.hasAttributes();
}, 
  _4ePosition: function(el, otherNode) {
  _$jscoverage['/editor/dom.js'].functionData[20]++;
  _$jscoverage['/editor/dom.js'].lineData[452]++;
  var $other = normalElDom(otherNode);
  _$jscoverage['/editor/dom.js'].lineData[454]++;
  if (visit137_454_1(el.compareDocumentPosition)) {
    _$jscoverage['/editor/dom.js'].lineData[455]++;
    return el.compareDocumentPosition($other);
  }
  _$jscoverage['/editor/dom.js'].lineData[460]++;
  if (visit138_460_1(el === $other)) {
    _$jscoverage['/editor/dom.js'].lineData[461]++;
    return KEP.POSITION_IDENTICAL;
  }
  _$jscoverage['/editor/dom.js'].lineData[465]++;
  if (visit139_465_1(visit140_465_2(el.nodeType === NodeType.ELEMENT_NODE) && visit141_466_1($other.nodeType === NodeType.ELEMENT_NODE))) {
    _$jscoverage['/editor/dom.js'].lineData[467]++;
    if (visit142_467_1(Dom.contains(el, $other))) {
      _$jscoverage['/editor/dom.js'].lineData[468]++;
      return KEP.POSITION_CONTAINS + KEP.POSITION_PRECEDING;
    }
    _$jscoverage['/editor/dom.js'].lineData[471]++;
    if (visit143_471_1(Dom.contains($other, el))) {
      _$jscoverage['/editor/dom.js'].lineData[472]++;
      return KEP.POSITION_IS_CONTAINED + KEP.POSITION_FOLLOWING;
    }
    _$jscoverage['/editor/dom.js'].lineData[475]++;
    if (visit144_475_1('sourceIndex' in el)) {
      _$jscoverage['/editor/dom.js'].lineData[476]++;
      return (visit145_476_1(visit146_476_2(el.sourceIndex < 0) || visit147_476_3($other.sourceIndex < 0))) ? KEP.POSITION_DISCONNECTED : (visit148_478_1(el.sourceIndex < $other.sourceIndex)) ? KEP.POSITION_PRECEDING : KEP.POSITION_FOLLOWING;
    }
  }
  _$jscoverage['/editor/dom.js'].lineData[486]++;
  var addressOfThis = Dom._4eAddress(el), addressOfOther = Dom._4eAddress($other), minLevel = Math.min(addressOfThis.length, addressOfOther.length);
  _$jscoverage['/editor/dom.js'].lineData[491]++;
  for (var i = 0; visit149_491_1(i <= minLevel - 1); i++) {
    _$jscoverage['/editor/dom.js'].lineData[492]++;
    if (visit150_492_1(addressOfThis[i] !== addressOfOther[i])) {
      _$jscoverage['/editor/dom.js'].lineData[493]++;
      return visit151_493_1(addressOfThis[i] < addressOfOther[i]) ? KEP.POSITION_PRECEDING : KEP.POSITION_FOLLOWING;
    }
  }
  _$jscoverage['/editor/dom.js'].lineData[499]++;
  return (visit152_499_1(addressOfThis.length < addressOfOther.length)) ? KEP.POSITION_CONTAINS + KEP.POSITION_PRECEDING : KEP.POSITION_IS_CONTAINED + KEP.POSITION_FOLLOWING;
}, 
  _4eAddress: function(el, normalized) {
  _$jscoverage['/editor/dom.js'].functionData[21]++;
  _$jscoverage['/editor/dom.js'].lineData[506]++;
  var address = [], $documentElement = el.ownerDocument.documentElement, node = el;
  _$jscoverage['/editor/dom.js'].lineData[510]++;
  while (visit153_510_1(node && visit154_510_2(node !== $documentElement))) {
    _$jscoverage['/editor/dom.js'].lineData[511]++;
    address.unshift(Dom._4eIndex(node, normalized));
    _$jscoverage['/editor/dom.js'].lineData[512]++;
    node = node.parentNode;
  }
  _$jscoverage['/editor/dom.js'].lineData[515]++;
  return address;
}, 
  _4eRemove: function(el, preserveChildren) {
  _$jscoverage['/editor/dom.js'].functionData[22]++;
  _$jscoverage['/editor/dom.js'].lineData[520]++;
  var parent = el.parentNode;
  _$jscoverage['/editor/dom.js'].lineData[521]++;
  if (visit155_521_1(parent)) {
    _$jscoverage['/editor/dom.js'].lineData[522]++;
    if (visit156_522_1(preserveChildren)) {
      _$jscoverage['/editor/dom.js'].lineData[524]++;
      for (var child; (child = el.firstChild); ) {
        _$jscoverage['/editor/dom.js'].lineData[525]++;
        parent.insertBefore(el.removeChild(child), el);
      }
    }
    _$jscoverage['/editor/dom.js'].lineData[528]++;
    parent.removeChild(el);
  }
  _$jscoverage['/editor/dom.js'].lineData[530]++;
  return el;
}, 
  _4eTrim: function(el) {
  _$jscoverage['/editor/dom.js'].functionData[23]++;
  _$jscoverage['/editor/dom.js'].lineData[535]++;
  Dom._4eLtrim(el);
  _$jscoverage['/editor/dom.js'].lineData[536]++;
  Dom._4eRtrim(el);
}, 
  _4eLtrim: function(el) {
  _$jscoverage['/editor/dom.js'].functionData[24]++;
  _$jscoverage['/editor/dom.js'].lineData[541]++;
  var child;
  _$jscoverage['/editor/dom.js'].lineData[542]++;
  while ((child = el.firstChild)) {
    _$jscoverage['/editor/dom.js'].lineData[543]++;
    if (visit157_543_1(child.nodeType === Dom.NodeType.TEXT_NODE)) {
      _$jscoverage['/editor/dom.js'].lineData[544]++;
      var trimmed = Utils.ltrim(child.nodeValue), originalLength = child.nodeValue.length;
      _$jscoverage['/editor/dom.js'].lineData[547]++;
      if (visit158_547_1(!trimmed)) {
        _$jscoverage['/editor/dom.js'].lineData[548]++;
        el.removeChild(child);
        _$jscoverage['/editor/dom.js'].lineData[549]++;
        continue;
      } else {
        _$jscoverage['/editor/dom.js'].lineData[550]++;
        if (visit159_550_1(trimmed.length < originalLength)) {
          _$jscoverage['/editor/dom.js'].lineData[551]++;
          Dom._4eSplitText(child, originalLength - trimmed.length);
          _$jscoverage['/editor/dom.js'].lineData[553]++;
          el.removeChild(el.firstChild);
        }
      }
    }
    _$jscoverage['/editor/dom.js'].lineData[556]++;
    break;
  }
}, 
  _4eRtrim: function(el) {
  _$jscoverage['/editor/dom.js'].functionData[25]++;
  _$jscoverage['/editor/dom.js'].lineData[562]++;
  var child;
  _$jscoverage['/editor/dom.js'].lineData[563]++;
  while ((child = el.lastChild)) {
    _$jscoverage['/editor/dom.js'].lineData[564]++;
    if (visit160_564_1(child.type === Dom.NodeType.TEXT_NODE)) {
      _$jscoverage['/editor/dom.js'].lineData[565]++;
      var trimmed = Utils.rtrim(child.nodeValue), originalLength = child.nodeValue.length;
      _$jscoverage['/editor/dom.js'].lineData[567]++;
      if (visit161_567_1(!trimmed)) {
        _$jscoverage['/editor/dom.js'].lineData[568]++;
        el.removeChild(child);
        _$jscoverage['/editor/dom.js'].lineData[569]++;
        continue;
      } else {
        _$jscoverage['/editor/dom.js'].lineData[570]++;
        if (visit162_570_1(trimmed.length < originalLength)) {
          _$jscoverage['/editor/dom.js'].lineData[571]++;
          Dom._4eSplitText(child, trimmed.length);
          _$jscoverage['/editor/dom.js'].lineData[574]++;
          el.removeChild(el.lastChild);
        }
      }
    }
    _$jscoverage['/editor/dom.js'].lineData[577]++;
    break;
  }
  _$jscoverage['/editor/dom.js'].lineData[580]++;
  if (visit163_580_1(!UA.ie && !UA.opera)) {
    _$jscoverage['/editor/dom.js'].lineData[581]++;
    child = el.lastChild;
    _$jscoverage['/editor/dom.js'].lineData[582]++;
    if (visit164_582_1(child && visit165_583_1(visit166_583_2(child.nodeType === 1) && visit167_584_1(Dom.nodeName(child) === 'br')))) {
      _$jscoverage['/editor/dom.js'].lineData[585]++;
      el.removeChild(child);
    }
  }
}, 
  _4eAppendBogus: function(el) {
  _$jscoverage['/editor/dom.js'].functionData[26]++;
  _$jscoverage['/editor/dom.js'].lineData[592]++;
  var lastChild = el.lastChild, bogus;
  _$jscoverage['/editor/dom.js'].lineData[595]++;
  while (visit168_595_1(lastChild && visit169_596_1(visit170_596_2(lastChild.nodeType === Dom.NodeType.TEXT_NODE) && !S.trim(lastChild.nodeValue)))) {
    _$jscoverage['/editor/dom.js'].lineData[597]++;
    lastChild = lastChild.previousSibling;
  }
  _$jscoverage['/editor/dom.js'].lineData[600]++;
  if (visit171_600_1(!lastChild || visit172_601_1(visit173_601_2(lastChild.nodeType === Dom.NodeType.TEXT_NODE) || visit174_602_1(Dom.nodeName(lastChild) !== 'br')))) {
    _$jscoverage['/editor/dom.js'].lineData[603]++;
    bogus = UA.opera ? el.ownerDocument.createTextNode('') : el.ownerDocument.createElement('br');
    _$jscoverage['/editor/dom.js'].lineData[609]++;
    el.appendChild(bogus);
  }
}, 
  _4eSetMarker: function(element, database, name, value) {
  _$jscoverage['/editor/dom.js'].functionData[27]++;
  _$jscoverage['/editor/dom.js'].lineData[615]++;
  element = normalEl(element);
  _$jscoverage['/editor/dom.js'].lineData[616]++;
  var id = visit175_616_1(element.data('list_marker_id') || (element.data('list_marker_id', S.guid()).data('list_marker_id'))), markerNames = visit176_618_1(element.data('list_marker_names') || (element.data('list_marker_names', {}).data('list_marker_names')));
  _$jscoverage['/editor/dom.js'].lineData[620]++;
  database[id] = element;
  _$jscoverage['/editor/dom.js'].lineData[621]++;
  markerNames[name] = 1;
  _$jscoverage['/editor/dom.js'].lineData[622]++;
  return element.data(name, value);
}, 
  _4eClearMarkers: function(element, database, removeFromDatabase) {
  _$jscoverage['/editor/dom.js'].functionData[28]++;
  _$jscoverage['/editor/dom.js'].lineData[627]++;
  element = normalEl(element);
  _$jscoverage['/editor/dom.js'].lineData[628]++;
  var names = element.data('list_marker_names'), id = element.data('list_marker_id');
  _$jscoverage['/editor/dom.js'].lineData[630]++;
  for (var i in names) {
    _$jscoverage['/editor/dom.js'].lineData[631]++;
    element.removeData(i);
  }
  _$jscoverage['/editor/dom.js'].lineData[633]++;
  element.removeData('list_marker_names');
  _$jscoverage['/editor/dom.js'].lineData[634]++;
  if (visit177_634_1(removeFromDatabase)) {
    _$jscoverage['/editor/dom.js'].lineData[635]++;
    element.removeData('list_marker_id');
    _$jscoverage['/editor/dom.js'].lineData[636]++;
    delete database[id];
  }
}, 
  _4eCopyAttributes: function(el, target, skipAttributes) {
  _$jscoverage['/editor/dom.js'].functionData[29]++;
  _$jscoverage['/editor/dom.js'].lineData[642]++;
  target = normalEl(target);
  _$jscoverage['/editor/dom.js'].lineData[643]++;
  var attributes = el.attributes;
  _$jscoverage['/editor/dom.js'].lineData[644]++;
  skipAttributes = visit178_644_1(skipAttributes || {});
  _$jscoverage['/editor/dom.js'].lineData[646]++;
  for (var n = 0; visit179_646_1(n < attributes.length); n++) {
    _$jscoverage['/editor/dom.js'].lineData[649]++;
    var attribute = attributes[n], attrName = attribute.name.toLowerCase(), attrValue;
    _$jscoverage['/editor/dom.js'].lineData[654]++;
    if (visit180_654_1(attrName in skipAttributes)) {
      _$jscoverage['/editor/dom.js'].lineData[655]++;
      continue;
    }
    _$jscoverage['/editor/dom.js'].lineData[658]++;
    if (visit181_658_1(visit182_658_2(attrName === 'checked') && (attrValue = Dom.attr(el, attrName)))) {
      _$jscoverage['/editor/dom.js'].lineData[659]++;
      target.attr(attrName, attrValue);
    } else {
      _$jscoverage['/editor/dom.js'].lineData[660]++;
      if (visit183_660_1(attribute.specified || (visit184_661_1(UA.ie && visit185_661_2(attribute.value && visit186_661_3(attrName === 'value')))))) {
        _$jscoverage['/editor/dom.js'].lineData[663]++;
        attrValue = Dom.attr(el, attrName);
        _$jscoverage['/editor/dom.js'].lineData[664]++;
        if (visit187_664_1(attrValue === NULL)) {
          _$jscoverage['/editor/dom.js'].lineData[665]++;
          attrValue = attribute.nodeValue;
        }
        _$jscoverage['/editor/dom.js'].lineData[667]++;
        target.attr(attrName, attrValue);
      }
    }
  }
  _$jscoverage['/editor/dom.js'].lineData[672]++;
  if (visit188_672_1(el.style.cssText !== '')) {
    _$jscoverage['/editor/dom.js'].lineData[673]++;
    target[0].style.cssText = el.style.cssText;
  }
}, 
  _4eIsEditable: function(el) {
  _$jscoverage['/editor/dom.js'].functionData[30]++;
  _$jscoverage['/editor/dom.js'].lineData[680]++;
  var name = Dom.nodeName(el), dtd = visit189_681_1(!xhtmlDtd.$nonEditable[name] && (visit190_682_1(xhtmlDtd[name] || xhtmlDtd.span)));
  _$jscoverage['/editor/dom.js'].lineData[684]++;
  return visit191_684_1(dtd && dtd['#text']);
}, 
  _4eGetByAddress: function(doc, address, normalized) {
  _$jscoverage['/editor/dom.js'].functionData[31]++;
  _$jscoverage['/editor/dom.js'].lineData[689]++;
  var $ = doc.documentElement;
  _$jscoverage['/editor/dom.js'].lineData[691]++;
  for (var i = 0; visit192_691_1($ && visit193_691_2(i < address.length)); i++) {
    _$jscoverage['/editor/dom.js'].lineData[692]++;
    var target = address[i];
    _$jscoverage['/editor/dom.js'].lineData[694]++;
    if (visit194_694_1(!normalized)) {
      _$jscoverage['/editor/dom.js'].lineData[695]++;
      $ = $.childNodes[target];
      _$jscoverage['/editor/dom.js'].lineData[696]++;
      continue;
    }
    _$jscoverage['/editor/dom.js'].lineData[699]++;
    var currentIndex = -1;
    _$jscoverage['/editor/dom.js'].lineData[701]++;
    for (var j = 0; visit195_701_1(j < $.childNodes.length); j++) {
      _$jscoverage['/editor/dom.js'].lineData[702]++;
      var candidate = $.childNodes[j];
      _$jscoverage['/editor/dom.js'].lineData[704]++;
      if (visit196_704_1(visit197_704_2(normalized === TRUE) && visit198_705_1(visit199_705_2(candidate.nodeType === 3) && visit200_706_1(candidate.previousSibling && visit201_707_1(candidate.previousSibling.nodeType === 3))))) {
        _$jscoverage['/editor/dom.js'].lineData[708]++;
        continue;
      }
      _$jscoverage['/editor/dom.js'].lineData[711]++;
      currentIndex++;
      _$jscoverage['/editor/dom.js'].lineData[713]++;
      if (visit202_713_1(currentIndex === target)) {
        _$jscoverage['/editor/dom.js'].lineData[714]++;
        $ = candidate;
        _$jscoverage['/editor/dom.js'].lineData[715]++;
        break;
      }
    }
  }
  _$jscoverage['/editor/dom.js'].lineData[720]++;
  return $;
}};
  _$jscoverage['/editor/dom.js'].lineData[724]++;
  function mergeElements(element, isNext) {
    _$jscoverage['/editor/dom.js'].functionData[32]++;
    _$jscoverage['/editor/dom.js'].lineData[725]++;
    var sibling = element[isNext ? 'next' : 'prev'](undefined, 1);
    _$jscoverage['/editor/dom.js'].lineData[727]++;
    if (visit203_727_1(sibling && visit204_727_2(sibling[0].nodeType === NodeType.ELEMENT_NODE))) {
      _$jscoverage['/editor/dom.js'].lineData[731]++;
      var pendingNodes = [];
      _$jscoverage['/editor/dom.js'].lineData[733]++;
      while (visit205_733_1(sibling.attr('_ke_bookmark') || sibling._4eIsEmptyInlineRemovable(undefined))) {
        _$jscoverage['/editor/dom.js'].lineData[734]++;
        pendingNodes.push(sibling);
        _$jscoverage['/editor/dom.js'].lineData[735]++;
        sibling = isNext ? sibling.next(undefined, 1) : sibling.prev(undefined, 1);
        _$jscoverage['/editor/dom.js'].lineData[736]++;
        if (visit206_736_1(!sibling)) {
          _$jscoverage['/editor/dom.js'].lineData[737]++;
          return;
        }
      }
      _$jscoverage['/editor/dom.js'].lineData[741]++;
      if (visit207_741_1(element._4eIsIdentical(sibling, undefined))) {
        _$jscoverage['/editor/dom.js'].lineData[744]++;
        var innerSibling = new Node(isNext ? element[0].lastChild : element[0].firstChild);
        _$jscoverage['/editor/dom.js'].lineData[747]++;
        while (pendingNodes.length) {
          _$jscoverage['/editor/dom.js'].lineData[748]++;
          pendingNodes.shift()._4eMove(element, !isNext, undefined);
        }
        _$jscoverage['/editor/dom.js'].lineData[751]++;
        sibling._4eMoveChildren(element, !isNext, undefined);
        _$jscoverage['/editor/dom.js'].lineData[752]++;
        sibling.remove();
        _$jscoverage['/editor/dom.js'].lineData[755]++;
        if (visit208_755_1(innerSibling[0] && visit209_755_2(innerSibling[0].nodeType === NodeType.ELEMENT_NODE))) {
          _$jscoverage['/editor/dom.js'].lineData[756]++;
          innerSibling._4eMergeSiblings();
        }
      }
    }
  }
  _$jscoverage['/editor/dom.js'].lineData[762]++;
  Utils.injectDom(editorDom);
});
