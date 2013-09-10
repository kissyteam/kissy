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
  _$jscoverage['/editor/range.js'].lineData[9] = 0;
  _$jscoverage['/editor/range.js'].lineData[14] = 0;
  _$jscoverage['/editor/range.js'].lineData[28] = 0;
  _$jscoverage['/editor/range.js'].lineData[48] = 0;
  _$jscoverage['/editor/range.js'].lineData[53] = 0;
  _$jscoverage['/editor/range.js'].lineData[64] = 0;
  _$jscoverage['/editor/range.js'].lineData[68] = 0;
  _$jscoverage['/editor/range.js'].lineData[74] = 0;
  _$jscoverage['/editor/range.js'].lineData[77] = 0;
  _$jscoverage['/editor/range.js'].lineData[79] = 0;
  _$jscoverage['/editor/range.js'].lineData[82] = 0;
  _$jscoverage['/editor/range.js'].lineData[83] = 0;
  _$jscoverage['/editor/range.js'].lineData[84] = 0;
  _$jscoverage['/editor/range.js'].lineData[86] = 0;
  _$jscoverage['/editor/range.js'].lineData[87] = 0;
  _$jscoverage['/editor/range.js'].lineData[89] = 0;
  _$jscoverage['/editor/range.js'].lineData[91] = 0;
  _$jscoverage['/editor/range.js'].lineData[92] = 0;
  _$jscoverage['/editor/range.js'].lineData[94] = 0;
  _$jscoverage['/editor/range.js'].lineData[95] = 0;
  _$jscoverage['/editor/range.js'].lineData[98] = 0;
  _$jscoverage['/editor/range.js'].lineData[101] = 0;
  _$jscoverage['/editor/range.js'].lineData[102] = 0;
  _$jscoverage['/editor/range.js'].lineData[104] = 0;
  _$jscoverage['/editor/range.js'].lineData[108] = 0;
  _$jscoverage['/editor/range.js'].lineData[121] = 0;
  _$jscoverage['/editor/range.js'].lineData[122] = 0;
  _$jscoverage['/editor/range.js'].lineData[134] = 0;
  _$jscoverage['/editor/range.js'].lineData[135] = 0;
  _$jscoverage['/editor/range.js'].lineData[138] = 0;
  _$jscoverage['/editor/range.js'].lineData[139] = 0;
  _$jscoverage['/editor/range.js'].lineData[143] = 0;
  _$jscoverage['/editor/range.js'].lineData[151] = 0;
  _$jscoverage['/editor/range.js'].lineData[152] = 0;
  _$jscoverage['/editor/range.js'].lineData[153] = 0;
  _$jscoverage['/editor/range.js'].lineData[157] = 0;
  _$jscoverage['/editor/range.js'].lineData[159] = 0;
  _$jscoverage['/editor/range.js'].lineData[161] = 0;
  _$jscoverage['/editor/range.js'].lineData[164] = 0;
  _$jscoverage['/editor/range.js'].lineData[166] = 0;
  _$jscoverage['/editor/range.js'].lineData[175] = 0;
  _$jscoverage['/editor/range.js'].lineData[176] = 0;
  _$jscoverage['/editor/range.js'].lineData[177] = 0;
  _$jscoverage['/editor/range.js'].lineData[184] = 0;
  _$jscoverage['/editor/range.js'].lineData[186] = 0;
  _$jscoverage['/editor/range.js'].lineData[187] = 0;
  _$jscoverage['/editor/range.js'].lineData[188] = 0;
  _$jscoverage['/editor/range.js'].lineData[189] = 0;
  _$jscoverage['/editor/range.js'].lineData[191] = 0;
  _$jscoverage['/editor/range.js'].lineData[193] = 0;
  _$jscoverage['/editor/range.js'].lineData[195] = 0;
  _$jscoverage['/editor/range.js'].lineData[197] = 0;
  _$jscoverage['/editor/range.js'].lineData[204] = 0;
  _$jscoverage['/editor/range.js'].lineData[207] = 0;
  _$jscoverage['/editor/range.js'].lineData[208] = 0;
  _$jscoverage['/editor/range.js'].lineData[211] = 0;
  _$jscoverage['/editor/range.js'].lineData[212] = 0;
  _$jscoverage['/editor/range.js'].lineData[217] = 0;
  _$jscoverage['/editor/range.js'].lineData[219] = 0;
  _$jscoverage['/editor/range.js'].lineData[220] = 0;
  _$jscoverage['/editor/range.js'].lineData[221] = 0;
  _$jscoverage['/editor/range.js'].lineData[227] = 0;
  _$jscoverage['/editor/range.js'].lineData[228] = 0;
  _$jscoverage['/editor/range.js'].lineData[232] = 0;
  _$jscoverage['/editor/range.js'].lineData[240] = 0;
  _$jscoverage['/editor/range.js'].lineData[241] = 0;
  _$jscoverage['/editor/range.js'].lineData[244] = 0;
  _$jscoverage['/editor/range.js'].lineData[246] = 0;
  _$jscoverage['/editor/range.js'].lineData[248] = 0;
  _$jscoverage['/editor/range.js'].lineData[252] = 0;
  _$jscoverage['/editor/range.js'].lineData[254] = 0;
  _$jscoverage['/editor/range.js'].lineData[258] = 0;
  _$jscoverage['/editor/range.js'].lineData[261] = 0;
  _$jscoverage['/editor/range.js'].lineData[262] = 0;
  _$jscoverage['/editor/range.js'].lineData[266] = 0;
  _$jscoverage['/editor/range.js'].lineData[269] = 0;
  _$jscoverage['/editor/range.js'].lineData[271] = 0;
  _$jscoverage['/editor/range.js'].lineData[276] = 0;
  _$jscoverage['/editor/range.js'].lineData[277] = 0;
  _$jscoverage['/editor/range.js'].lineData[278] = 0;
  _$jscoverage['/editor/range.js'].lineData[279] = 0;
  _$jscoverage['/editor/range.js'].lineData[282] = 0;
  _$jscoverage['/editor/range.js'].lineData[286] = 0;
  _$jscoverage['/editor/range.js'].lineData[288] = 0;
  _$jscoverage['/editor/range.js'].lineData[292] = 0;
  _$jscoverage['/editor/range.js'].lineData[295] = 0;
  _$jscoverage['/editor/range.js'].lineData[296] = 0;
  _$jscoverage['/editor/range.js'].lineData[300] = 0;
  _$jscoverage['/editor/range.js'].lineData[304] = 0;
  _$jscoverage['/editor/range.js'].lineData[305] = 0;
  _$jscoverage['/editor/range.js'].lineData[308] = 0;
  _$jscoverage['/editor/range.js'].lineData[311] = 0;
  _$jscoverage['/editor/range.js'].lineData[313] = 0;
  _$jscoverage['/editor/range.js'].lineData[317] = 0;
  _$jscoverage['/editor/range.js'].lineData[322] = 0;
  _$jscoverage['/editor/range.js'].lineData[323] = 0;
  _$jscoverage['/editor/range.js'].lineData[325] = 0;
  _$jscoverage['/editor/range.js'].lineData[328] = 0;
  _$jscoverage['/editor/range.js'].lineData[329] = 0;
  _$jscoverage['/editor/range.js'].lineData[333] = 0;
  _$jscoverage['/editor/range.js'].lineData[336] = 0;
  _$jscoverage['/editor/range.js'].lineData[338] = 0;
  _$jscoverage['/editor/range.js'].lineData[342] = 0;
  _$jscoverage['/editor/range.js'].lineData[346] = 0;
  _$jscoverage['/editor/range.js'].lineData[347] = 0;
  _$jscoverage['/editor/range.js'].lineData[351] = 0;
  _$jscoverage['/editor/range.js'].lineData[355] = 0;
  _$jscoverage['/editor/range.js'].lineData[356] = 0;
  _$jscoverage['/editor/range.js'].lineData[357] = 0;
  _$jscoverage['/editor/range.js'].lineData[361] = 0;
  _$jscoverage['/editor/range.js'].lineData[362] = 0;
  _$jscoverage['/editor/range.js'].lineData[366] = 0;
  _$jscoverage['/editor/range.js'].lineData[367] = 0;
  _$jscoverage['/editor/range.js'].lineData[368] = 0;
  _$jscoverage['/editor/range.js'].lineData[371] = 0;
  _$jscoverage['/editor/range.js'].lineData[372] = 0;
  _$jscoverage['/editor/range.js'].lineData[382] = 0;
  _$jscoverage['/editor/range.js'].lineData[389] = 0;
  _$jscoverage['/editor/range.js'].lineData[393] = 0;
  _$jscoverage['/editor/range.js'].lineData[396] = 0;
  _$jscoverage['/editor/range.js'].lineData[399] = 0;
  _$jscoverage['/editor/range.js'].lineData[403] = 0;
  _$jscoverage['/editor/range.js'].lineData[408] = 0;
  _$jscoverage['/editor/range.js'].lineData[409] = 0;
  _$jscoverage['/editor/range.js'].lineData[412] = 0;
  _$jscoverage['/editor/range.js'].lineData[413] = 0;
  _$jscoverage['/editor/range.js'].lineData[416] = 0;
  _$jscoverage['/editor/range.js'].lineData[419] = 0;
  _$jscoverage['/editor/range.js'].lineData[420] = 0;
  _$jscoverage['/editor/range.js'].lineData[435] = 0;
  _$jscoverage['/editor/range.js'].lineData[436] = 0;
  _$jscoverage['/editor/range.js'].lineData[437] = 0;
  _$jscoverage['/editor/range.js'].lineData[438] = 0;
  _$jscoverage['/editor/range.js'].lineData[439] = 0;
  _$jscoverage['/editor/range.js'].lineData[440] = 0;
  _$jscoverage['/editor/range.js'].lineData[441] = 0;
  _$jscoverage['/editor/range.js'].lineData[442] = 0;
  _$jscoverage['/editor/range.js'].lineData[445] = 0;
  _$jscoverage['/editor/range.js'].lineData[451] = 0;
  _$jscoverage['/editor/range.js'].lineData[455] = 0;
  _$jscoverage['/editor/range.js'].lineData[456] = 0;
  _$jscoverage['/editor/range.js'].lineData[457] = 0;
  _$jscoverage['/editor/range.js'].lineData[467] = 0;
  _$jscoverage['/editor/range.js'].lineData[471] = 0;
  _$jscoverage['/editor/range.js'].lineData[472] = 0;
  _$jscoverage['/editor/range.js'].lineData[473] = 0;
  _$jscoverage['/editor/range.js'].lineData[474] = 0;
  _$jscoverage['/editor/range.js'].lineData[475] = 0;
  _$jscoverage['/editor/range.js'].lineData[479] = 0;
  _$jscoverage['/editor/range.js'].lineData[480] = 0;
  _$jscoverage['/editor/range.js'].lineData[482] = 0;
  _$jscoverage['/editor/range.js'].lineData[483] = 0;
  _$jscoverage['/editor/range.js'].lineData[484] = 0;
  _$jscoverage['/editor/range.js'].lineData[485] = 0;
  _$jscoverage['/editor/range.js'].lineData[486] = 0;
  _$jscoverage['/editor/range.js'].lineData[496] = 0;
  _$jscoverage['/editor/range.js'].lineData[503] = 0;
  _$jscoverage['/editor/range.js'].lineData[510] = 0;
  _$jscoverage['/editor/range.js'].lineData[517] = 0;
  _$jscoverage['/editor/range.js'].lineData[524] = 0;
  _$jscoverage['/editor/range.js'].lineData[528] = 0;
  _$jscoverage['/editor/range.js'].lineData[531] = 0;
  _$jscoverage['/editor/range.js'].lineData[533] = 0;
  _$jscoverage['/editor/range.js'].lineData[536] = 0;
  _$jscoverage['/editor/range.js'].lineData[554] = 0;
  _$jscoverage['/editor/range.js'].lineData[555] = 0;
  _$jscoverage['/editor/range.js'].lineData[556] = 0;
  _$jscoverage['/editor/range.js'].lineData[557] = 0;
  _$jscoverage['/editor/range.js'].lineData[560] = 0;
  _$jscoverage['/editor/range.js'].lineData[561] = 0;
  _$jscoverage['/editor/range.js'].lineData[563] = 0;
  _$jscoverage['/editor/range.js'].lineData[564] = 0;
  _$jscoverage['/editor/range.js'].lineData[565] = 0;
  _$jscoverage['/editor/range.js'].lineData[568] = 0;
  _$jscoverage['/editor/range.js'].lineData[585] = 0;
  _$jscoverage['/editor/range.js'].lineData[586] = 0;
  _$jscoverage['/editor/range.js'].lineData[587] = 0;
  _$jscoverage['/editor/range.js'].lineData[588] = 0;
  _$jscoverage['/editor/range.js'].lineData[591] = 0;
  _$jscoverage['/editor/range.js'].lineData[592] = 0;
  _$jscoverage['/editor/range.js'].lineData[594] = 0;
  _$jscoverage['/editor/range.js'].lineData[595] = 0;
  _$jscoverage['/editor/range.js'].lineData[596] = 0;
  _$jscoverage['/editor/range.js'].lineData[599] = 0;
  _$jscoverage['/editor/range.js'].lineData[608] = 0;
  _$jscoverage['/editor/range.js'].lineData[609] = 0;
  _$jscoverage['/editor/range.js'].lineData[611] = 0;
  _$jscoverage['/editor/range.js'].lineData[612] = 0;
  _$jscoverage['/editor/range.js'].lineData[615] = 0;
  _$jscoverage['/editor/range.js'].lineData[616] = 0;
  _$jscoverage['/editor/range.js'].lineData[618] = 0;
  _$jscoverage['/editor/range.js'].lineData[620] = 0;
  _$jscoverage['/editor/range.js'].lineData[623] = 0;
  _$jscoverage['/editor/range.js'].lineData[624] = 0;
  _$jscoverage['/editor/range.js'].lineData[627] = 0;
  _$jscoverage['/editor/range.js'].lineData[630] = 0;
  _$jscoverage['/editor/range.js'].lineData[639] = 0;
  _$jscoverage['/editor/range.js'].lineData[640] = 0;
  _$jscoverage['/editor/range.js'].lineData[642] = 0;
  _$jscoverage['/editor/range.js'].lineData[643] = 0;
  _$jscoverage['/editor/range.js'].lineData[646] = 0;
  _$jscoverage['/editor/range.js'].lineData[647] = 0;
  _$jscoverage['/editor/range.js'].lineData[649] = 0;
  _$jscoverage['/editor/range.js'].lineData[651] = 0;
  _$jscoverage['/editor/range.js'].lineData[654] = 0;
  _$jscoverage['/editor/range.js'].lineData[655] = 0;
  _$jscoverage['/editor/range.js'].lineData[658] = 0;
  _$jscoverage['/editor/range.js'].lineData[661] = 0;
  _$jscoverage['/editor/range.js'].lineData[668] = 0;
  _$jscoverage['/editor/range.js'].lineData[675] = 0;
  _$jscoverage['/editor/range.js'].lineData[682] = 0;
  _$jscoverage['/editor/range.js'].lineData[690] = 0;
  _$jscoverage['/editor/range.js'].lineData[691] = 0;
  _$jscoverage['/editor/range.js'].lineData[692] = 0;
  _$jscoverage['/editor/range.js'].lineData[693] = 0;
  _$jscoverage['/editor/range.js'].lineData[695] = 0;
  _$jscoverage['/editor/range.js'].lineData[696] = 0;
  _$jscoverage['/editor/range.js'].lineData[698] = 0;
  _$jscoverage['/editor/range.js'].lineData[706] = 0;
  _$jscoverage['/editor/range.js'].lineData[709] = 0;
  _$jscoverage['/editor/range.js'].lineData[710] = 0;
  _$jscoverage['/editor/range.js'].lineData[711] = 0;
  _$jscoverage['/editor/range.js'].lineData[712] = 0;
  _$jscoverage['/editor/range.js'].lineData[713] = 0;
  _$jscoverage['/editor/range.js'].lineData[715] = 0;
  _$jscoverage['/editor/range.js'].lineData[728] = 0;
  _$jscoverage['/editor/range.js'].lineData[731] = 0;
  _$jscoverage['/editor/range.js'].lineData[733] = 0;
  _$jscoverage['/editor/range.js'].lineData[735] = 0;
  _$jscoverage['/editor/range.js'].lineData[738] = 0;
  _$jscoverage['/editor/range.js'].lineData[741] = 0;
  _$jscoverage['/editor/range.js'].lineData[742] = 0;
  _$jscoverage['/editor/range.js'].lineData[749] = 0;
  _$jscoverage['/editor/range.js'].lineData[750] = 0;
  _$jscoverage['/editor/range.js'].lineData[751] = 0;
  _$jscoverage['/editor/range.js'].lineData[753] = 0;
  _$jscoverage['/editor/range.js'].lineData[763] = 0;
  _$jscoverage['/editor/range.js'].lineData[764] = 0;
  _$jscoverage['/editor/range.js'].lineData[765] = 0;
  _$jscoverage['/editor/range.js'].lineData[767] = 0;
  _$jscoverage['/editor/range.js'].lineData[778] = 0;
  _$jscoverage['/editor/range.js'].lineData[780] = 0;
  _$jscoverage['/editor/range.js'].lineData[781] = 0;
  _$jscoverage['/editor/range.js'].lineData[782] = 0;
  _$jscoverage['/editor/range.js'].lineData[783] = 0;
  _$jscoverage['/editor/range.js'].lineData[787] = 0;
  _$jscoverage['/editor/range.js'].lineData[788] = 0;
  _$jscoverage['/editor/range.js'].lineData[792] = 0;
  _$jscoverage['/editor/range.js'].lineData[794] = 0;
  _$jscoverage['/editor/range.js'].lineData[795] = 0;
  _$jscoverage['/editor/range.js'].lineData[796] = 0;
  _$jscoverage['/editor/range.js'].lineData[797] = 0;
  _$jscoverage['/editor/range.js'].lineData[799] = 0;
  _$jscoverage['/editor/range.js'].lineData[800] = 0;
  _$jscoverage['/editor/range.js'].lineData[804] = 0;
  _$jscoverage['/editor/range.js'].lineData[806] = 0;
  _$jscoverage['/editor/range.js'].lineData[808] = 0;
  _$jscoverage['/editor/range.js'].lineData[809] = 0;
  _$jscoverage['/editor/range.js'].lineData[813] = 0;
  _$jscoverage['/editor/range.js'].lineData[815] = 0;
  _$jscoverage['/editor/range.js'].lineData[817] = 0;
  _$jscoverage['/editor/range.js'].lineData[820] = 0;
  _$jscoverage['/editor/range.js'].lineData[821] = 0;
  _$jscoverage['/editor/range.js'].lineData[823] = 0;
  _$jscoverage['/editor/range.js'].lineData[824] = 0;
  _$jscoverage['/editor/range.js'].lineData[826] = 0;
  _$jscoverage['/editor/range.js'].lineData[831] = 0;
  _$jscoverage['/editor/range.js'].lineData[832] = 0;
  _$jscoverage['/editor/range.js'].lineData[833] = 0;
  _$jscoverage['/editor/range.js'].lineData[834] = 0;
  _$jscoverage['/editor/range.js'].lineData[838] = 0;
  _$jscoverage['/editor/range.js'].lineData[839] = 0;
  _$jscoverage['/editor/range.js'].lineData[840] = 0;
  _$jscoverage['/editor/range.js'].lineData[841] = 0;
  _$jscoverage['/editor/range.js'].lineData[842] = 0;
  _$jscoverage['/editor/range.js'].lineData[846] = 0;
  _$jscoverage['/editor/range.js'].lineData[856] = 0;
  _$jscoverage['/editor/range.js'].lineData[866] = 0;
  _$jscoverage['/editor/range.js'].lineData[867] = 0;
  _$jscoverage['/editor/range.js'].lineData[873] = 0;
  _$jscoverage['/editor/range.js'].lineData[876] = 0;
  _$jscoverage['/editor/range.js'].lineData[877] = 0;
  _$jscoverage['/editor/range.js'].lineData[881] = 0;
  _$jscoverage['/editor/range.js'].lineData[883] = 0;
  _$jscoverage['/editor/range.js'].lineData[884] = 0;
  _$jscoverage['/editor/range.js'].lineData[890] = 0;
  _$jscoverage['/editor/range.js'].lineData[893] = 0;
  _$jscoverage['/editor/range.js'].lineData[894] = 0;
  _$jscoverage['/editor/range.js'].lineData[898] = 0;
  _$jscoverage['/editor/range.js'].lineData[901] = 0;
  _$jscoverage['/editor/range.js'].lineData[902] = 0;
  _$jscoverage['/editor/range.js'].lineData[906] = 0;
  _$jscoverage['/editor/range.js'].lineData[909] = 0;
  _$jscoverage['/editor/range.js'].lineData[910] = 0;
  _$jscoverage['/editor/range.js'].lineData[915] = 0;
  _$jscoverage['/editor/range.js'].lineData[918] = 0;
  _$jscoverage['/editor/range.js'].lineData[919] = 0;
  _$jscoverage['/editor/range.js'].lineData[924] = 0;
  _$jscoverage['/editor/range.js'].lineData[938] = 0;
  _$jscoverage['/editor/range.js'].lineData[944] = 0;
  _$jscoverage['/editor/range.js'].lineData[945] = 0;
  _$jscoverage['/editor/range.js'].lineData[946] = 0;
  _$jscoverage['/editor/range.js'].lineData[950] = 0;
  _$jscoverage['/editor/range.js'].lineData[952] = 0;
  _$jscoverage['/editor/range.js'].lineData[953] = 0;
  _$jscoverage['/editor/range.js'].lineData[954] = 0;
  _$jscoverage['/editor/range.js'].lineData[958] = 0;
  _$jscoverage['/editor/range.js'].lineData[959] = 0;
  _$jscoverage['/editor/range.js'].lineData[960] = 0;
  _$jscoverage['/editor/range.js'].lineData[962] = 0;
  _$jscoverage['/editor/range.js'].lineData[963] = 0;
  _$jscoverage['/editor/range.js'].lineData[966] = 0;
  _$jscoverage['/editor/range.js'].lineData[967] = 0;
  _$jscoverage['/editor/range.js'].lineData[968] = 0;
  _$jscoverage['/editor/range.js'].lineData[971] = 0;
  _$jscoverage['/editor/range.js'].lineData[972] = 0;
  _$jscoverage['/editor/range.js'].lineData[973] = 0;
  _$jscoverage['/editor/range.js'].lineData[976] = 0;
  _$jscoverage['/editor/range.js'].lineData[977] = 0;
  _$jscoverage['/editor/range.js'].lineData[978] = 0;
  _$jscoverage['/editor/range.js'].lineData[980] = 0;
  _$jscoverage['/editor/range.js'].lineData[983] = 0;
  _$jscoverage['/editor/range.js'].lineData[997] = 0;
  _$jscoverage['/editor/range.js'].lineData[998] = 0;
  _$jscoverage['/editor/range.js'].lineData[999] = 0;
  _$jscoverage['/editor/range.js'].lineData[1008] = 0;
  _$jscoverage['/editor/range.js'].lineData[1013] = 0;
  _$jscoverage['/editor/range.js'].lineData[1018] = 0;
  _$jscoverage['/editor/range.js'].lineData[1019] = 0;
  _$jscoverage['/editor/range.js'].lineData[1020] = 0;
  _$jscoverage['/editor/range.js'].lineData[1024] = 0;
  _$jscoverage['/editor/range.js'].lineData[1025] = 0;
  _$jscoverage['/editor/range.js'].lineData[1026] = 0;
  _$jscoverage['/editor/range.js'].lineData[1031] = 0;
  _$jscoverage['/editor/range.js'].lineData[1033] = 0;
  _$jscoverage['/editor/range.js'].lineData[1034] = 0;
  _$jscoverage['/editor/range.js'].lineData[1037] = 0;
  _$jscoverage['/editor/range.js'].lineData[1038] = 0;
  _$jscoverage['/editor/range.js'].lineData[1039] = 0;
  _$jscoverage['/editor/range.js'].lineData[1040] = 0;
  _$jscoverage['/editor/range.js'].lineData[1044] = 0;
  _$jscoverage['/editor/range.js'].lineData[1046] = 0;
  _$jscoverage['/editor/range.js'].lineData[1047] = 0;
  _$jscoverage['/editor/range.js'].lineData[1048] = 0;
  _$jscoverage['/editor/range.js'].lineData[1052] = 0;
  _$jscoverage['/editor/range.js'].lineData[1055] = 0;
  _$jscoverage['/editor/range.js'].lineData[1059] = 0;
  _$jscoverage['/editor/range.js'].lineData[1060] = 0;
  _$jscoverage['/editor/range.js'].lineData[1061] = 0;
  _$jscoverage['/editor/range.js'].lineData[1065] = 0;
  _$jscoverage['/editor/range.js'].lineData[1066] = 0;
  _$jscoverage['/editor/range.js'].lineData[1067] = 0;
  _$jscoverage['/editor/range.js'].lineData[1072] = 0;
  _$jscoverage['/editor/range.js'].lineData[1074] = 0;
  _$jscoverage['/editor/range.js'].lineData[1075] = 0;
  _$jscoverage['/editor/range.js'].lineData[1078] = 0;
  _$jscoverage['/editor/range.js'].lineData[1086] = 0;
  _$jscoverage['/editor/range.js'].lineData[1087] = 0;
  _$jscoverage['/editor/range.js'].lineData[1088] = 0;
  _$jscoverage['/editor/range.js'].lineData[1089] = 0;
  _$jscoverage['/editor/range.js'].lineData[1093] = 0;
  _$jscoverage['/editor/range.js'].lineData[1095] = 0;
  _$jscoverage['/editor/range.js'].lineData[1096] = 0;
  _$jscoverage['/editor/range.js'].lineData[1099] = 0;
  _$jscoverage['/editor/range.js'].lineData[1107] = 0;
  _$jscoverage['/editor/range.js'].lineData[1109] = 0;
  _$jscoverage['/editor/range.js'].lineData[1111] = 0;
  _$jscoverage['/editor/range.js'].lineData[1117] = 0;
  _$jscoverage['/editor/range.js'].lineData[1120] = 0;
  _$jscoverage['/editor/range.js'].lineData[1121] = 0;
  _$jscoverage['/editor/range.js'].lineData[1123] = 0;
  _$jscoverage['/editor/range.js'].lineData[1127] = 0;
  _$jscoverage['/editor/range.js'].lineData[1134] = 0;
  _$jscoverage['/editor/range.js'].lineData[1137] = 0;
  _$jscoverage['/editor/range.js'].lineData[1141] = 0;
  _$jscoverage['/editor/range.js'].lineData[1142] = 0;
  _$jscoverage['/editor/range.js'].lineData[1143] = 0;
  _$jscoverage['/editor/range.js'].lineData[1145] = 0;
  _$jscoverage['/editor/range.js'].lineData[1156] = 0;
  _$jscoverage['/editor/range.js'].lineData[1161] = 0;
  _$jscoverage['/editor/range.js'].lineData[1162] = 0;
  _$jscoverage['/editor/range.js'].lineData[1165] = 0;
  _$jscoverage['/editor/range.js'].lineData[1167] = 0;
  _$jscoverage['/editor/range.js'].lineData[1170] = 0;
  _$jscoverage['/editor/range.js'].lineData[1173] = 0;
  _$jscoverage['/editor/range.js'].lineData[1189] = 0;
  _$jscoverage['/editor/range.js'].lineData[1190] = 0;
  _$jscoverage['/editor/range.js'].lineData[1198] = 0;
  _$jscoverage['/editor/range.js'].lineData[1199] = 0;
  _$jscoverage['/editor/range.js'].lineData[1201] = 0;
  _$jscoverage['/editor/range.js'].lineData[1202] = 0;
  _$jscoverage['/editor/range.js'].lineData[1205] = 0;
  _$jscoverage['/editor/range.js'].lineData[1206] = 0;
  _$jscoverage['/editor/range.js'].lineData[1211] = 0;
  _$jscoverage['/editor/range.js'].lineData[1213] = 0;
  _$jscoverage['/editor/range.js'].lineData[1216] = 0;
  _$jscoverage['/editor/range.js'].lineData[1218] = 0;
  _$jscoverage['/editor/range.js'].lineData[1221] = 0;
  _$jscoverage['/editor/range.js'].lineData[1223] = 0;
  _$jscoverage['/editor/range.js'].lineData[1224] = 0;
  _$jscoverage['/editor/range.js'].lineData[1225] = 0;
  _$jscoverage['/editor/range.js'].lineData[1227] = 0;
  _$jscoverage['/editor/range.js'].lineData[1232] = 0;
  _$jscoverage['/editor/range.js'].lineData[1234] = 0;
  _$jscoverage['/editor/range.js'].lineData[1236] = 0;
  _$jscoverage['/editor/range.js'].lineData[1238] = 0;
  _$jscoverage['/editor/range.js'].lineData[1245] = 0;
  _$jscoverage['/editor/range.js'].lineData[1247] = 0;
  _$jscoverage['/editor/range.js'].lineData[1248] = 0;
  _$jscoverage['/editor/range.js'].lineData[1251] = 0;
  _$jscoverage['/editor/range.js'].lineData[1252] = 0;
  _$jscoverage['/editor/range.js'].lineData[1253] = 0;
  _$jscoverage['/editor/range.js'].lineData[1256] = 0;
  _$jscoverage['/editor/range.js'].lineData[1259] = 0;
  _$jscoverage['/editor/range.js'].lineData[1260] = 0;
  _$jscoverage['/editor/range.js'].lineData[1265] = 0;
  _$jscoverage['/editor/range.js'].lineData[1266] = 0;
  _$jscoverage['/editor/range.js'].lineData[1267] = 0;
  _$jscoverage['/editor/range.js'].lineData[1270] = 0;
  _$jscoverage['/editor/range.js'].lineData[1271] = 0;
  _$jscoverage['/editor/range.js'].lineData[1274] = 0;
  _$jscoverage['/editor/range.js'].lineData[1277] = 0;
  _$jscoverage['/editor/range.js'].lineData[1278] = 0;
  _$jscoverage['/editor/range.js'].lineData[1280] = 0;
  _$jscoverage['/editor/range.js'].lineData[1281] = 0;
  _$jscoverage['/editor/range.js'].lineData[1282] = 0;
  _$jscoverage['/editor/range.js'].lineData[1283] = 0;
  _$jscoverage['/editor/range.js'].lineData[1286] = 0;
  _$jscoverage['/editor/range.js'].lineData[1292] = 0;
  _$jscoverage['/editor/range.js'].lineData[1293] = 0;
  _$jscoverage['/editor/range.js'].lineData[1295] = 0;
  _$jscoverage['/editor/range.js'].lineData[1296] = 0;
  _$jscoverage['/editor/range.js'].lineData[1298] = 0;
  _$jscoverage['/editor/range.js'].lineData[1306] = 0;
  _$jscoverage['/editor/range.js'].lineData[1307] = 0;
  _$jscoverage['/editor/range.js'].lineData[1308] = 0;
  _$jscoverage['/editor/range.js'].lineData[1310] = 0;
  _$jscoverage['/editor/range.js'].lineData[1314] = 0;
  _$jscoverage['/editor/range.js'].lineData[1315] = 0;
  _$jscoverage['/editor/range.js'].lineData[1316] = 0;
  _$jscoverage['/editor/range.js'].lineData[1318] = 0;
  _$jscoverage['/editor/range.js'].lineData[1321] = 0;
  _$jscoverage['/editor/range.js'].lineData[1323] = 0;
  _$jscoverage['/editor/range.js'].lineData[1326] = 0;
  _$jscoverage['/editor/range.js'].lineData[1330] = 0;
  _$jscoverage['/editor/range.js'].lineData[1346] = 0;
  _$jscoverage['/editor/range.js'].lineData[1347] = 0;
  _$jscoverage['/editor/range.js'].lineData[1348] = 0;
  _$jscoverage['/editor/range.js'].lineData[1349] = 0;
  _$jscoverage['/editor/range.js'].lineData[1352] = 0;
  _$jscoverage['/editor/range.js'].lineData[1354] = 0;
  _$jscoverage['/editor/range.js'].lineData[1357] = 0;
  _$jscoverage['/editor/range.js'].lineData[1360] = 0;
  _$jscoverage['/editor/range.js'].lineData[1364] = 0;
  _$jscoverage['/editor/range.js'].lineData[1372] = 0;
  _$jscoverage['/editor/range.js'].lineData[1373] = 0;
  _$jscoverage['/editor/range.js'].lineData[1384] = 0;
  _$jscoverage['/editor/range.js'].lineData[1390] = 0;
  _$jscoverage['/editor/range.js'].lineData[1391] = 0;
  _$jscoverage['/editor/range.js'].lineData[1392] = 0;
  _$jscoverage['/editor/range.js'].lineData[1393] = 0;
  _$jscoverage['/editor/range.js'].lineData[1400] = 0;
  _$jscoverage['/editor/range.js'].lineData[1404] = 0;
  _$jscoverage['/editor/range.js'].lineData[1407] = 0;
  _$jscoverage['/editor/range.js'].lineData[1408] = 0;
  _$jscoverage['/editor/range.js'].lineData[1409] = 0;
  _$jscoverage['/editor/range.js'].lineData[1411] = 0;
  _$jscoverage['/editor/range.js'].lineData[1412] = 0;
  _$jscoverage['/editor/range.js'].lineData[1414] = 0;
  _$jscoverage['/editor/range.js'].lineData[1422] = 0;
  _$jscoverage['/editor/range.js'].lineData[1427] = 0;
  _$jscoverage['/editor/range.js'].lineData[1428] = 0;
  _$jscoverage['/editor/range.js'].lineData[1429] = 0;
  _$jscoverage['/editor/range.js'].lineData[1430] = 0;
  _$jscoverage['/editor/range.js'].lineData[1437] = 0;
  _$jscoverage['/editor/range.js'].lineData[1441] = 0;
  _$jscoverage['/editor/range.js'].lineData[1444] = 0;
  _$jscoverage['/editor/range.js'].lineData[1445] = 0;
  _$jscoverage['/editor/range.js'].lineData[1446] = 0;
  _$jscoverage['/editor/range.js'].lineData[1448] = 0;
  _$jscoverage['/editor/range.js'].lineData[1449] = 0;
  _$jscoverage['/editor/range.js'].lineData[1451] = 0;
  _$jscoverage['/editor/range.js'].lineData[1460] = 0;
  _$jscoverage['/editor/range.js'].lineData[1464] = 0;
  _$jscoverage['/editor/range.js'].lineData[1468] = 0;
  _$jscoverage['/editor/range.js'].lineData[1470] = 0;
  _$jscoverage['/editor/range.js'].lineData[1471] = 0;
  _$jscoverage['/editor/range.js'].lineData[1480] = 0;
  _$jscoverage['/editor/range.js'].lineData[1487] = 0;
  _$jscoverage['/editor/range.js'].lineData[1488] = 0;
  _$jscoverage['/editor/range.js'].lineData[1489] = 0;
  _$jscoverage['/editor/range.js'].lineData[1490] = 0;
  _$jscoverage['/editor/range.js'].lineData[1491] = 0;
  _$jscoverage['/editor/range.js'].lineData[1493] = 0;
  _$jscoverage['/editor/range.js'].lineData[1497] = 0;
  _$jscoverage['/editor/range.js'].lineData[1498] = 0;
  _$jscoverage['/editor/range.js'].lineData[1499] = 0;
  _$jscoverage['/editor/range.js'].lineData[1502] = 0;
  _$jscoverage['/editor/range.js'].lineData[1507] = 0;
  _$jscoverage['/editor/range.js'].lineData[1511] = 0;
  _$jscoverage['/editor/range.js'].lineData[1512] = 0;
  _$jscoverage['/editor/range.js'].lineData[1513] = 0;
  _$jscoverage['/editor/range.js'].lineData[1514] = 0;
  _$jscoverage['/editor/range.js'].lineData[1517] = 0;
  _$jscoverage['/editor/range.js'].lineData[1518] = 0;
  _$jscoverage['/editor/range.js'].lineData[1522] = 0;
  _$jscoverage['/editor/range.js'].lineData[1523] = 0;
  _$jscoverage['/editor/range.js'].lineData[1524] = 0;
  _$jscoverage['/editor/range.js'].lineData[1525] = 0;
  _$jscoverage['/editor/range.js'].lineData[1531] = 0;
  _$jscoverage['/editor/range.js'].lineData[1532] = 0;
  _$jscoverage['/editor/range.js'].lineData[1535] = 0;
  _$jscoverage['/editor/range.js'].lineData[1546] = 0;
  _$jscoverage['/editor/range.js'].lineData[1549] = 0;
  _$jscoverage['/editor/range.js'].lineData[1550] = 0;
  _$jscoverage['/editor/range.js'].lineData[1551] = 0;
  _$jscoverage['/editor/range.js'].lineData[1552] = 0;
  _$jscoverage['/editor/range.js'].lineData[1553] = 0;
  _$jscoverage['/editor/range.js'].lineData[1554] = 0;
  _$jscoverage['/editor/range.js'].lineData[1556] = 0;
  _$jscoverage['/editor/range.js'].lineData[1557] = 0;
  _$jscoverage['/editor/range.js'].lineData[1558] = 0;
  _$jscoverage['/editor/range.js'].lineData[1567] = 0;
  _$jscoverage['/editor/range.js'].lineData[1577] = 0;
  _$jscoverage['/editor/range.js'].lineData[1578] = 0;
  _$jscoverage['/editor/range.js'].lineData[1582] = 0;
  _$jscoverage['/editor/range.js'].lineData[1583] = 0;
  _$jscoverage['/editor/range.js'].lineData[1584] = 0;
  _$jscoverage['/editor/range.js'].lineData[1585] = 0;
  _$jscoverage['/editor/range.js'].lineData[1588] = 0;
  _$jscoverage['/editor/range.js'].lineData[1589] = 0;
  _$jscoverage['/editor/range.js'].lineData[1594] = 0;
  _$jscoverage['/editor/range.js'].lineData[1598] = 0;
  _$jscoverage['/editor/range.js'].lineData[1600] = 0;
  _$jscoverage['/editor/range.js'].lineData[1601] = 0;
  _$jscoverage['/editor/range.js'].lineData[1602] = 0;
  _$jscoverage['/editor/range.js'].lineData[1603] = 0;
  _$jscoverage['/editor/range.js'].lineData[1604] = 0;
  _$jscoverage['/editor/range.js'].lineData[1606] = 0;
  _$jscoverage['/editor/range.js'].lineData[1607] = 0;
  _$jscoverage['/editor/range.js'].lineData[1608] = 0;
  _$jscoverage['/editor/range.js'].lineData[1609] = 0;
  _$jscoverage['/editor/range.js'].lineData[1612] = 0;
  _$jscoverage['/editor/range.js'].lineData[1616] = 0;
  _$jscoverage['/editor/range.js'].lineData[1617] = 0;
  _$jscoverage['/editor/range.js'].lineData[1622] = 0;
  _$jscoverage['/editor/range.js'].lineData[1637] = 0;
  _$jscoverage['/editor/range.js'].lineData[1638] = 0;
  _$jscoverage['/editor/range.js'].lineData[1639] = 0;
  _$jscoverage['/editor/range.js'].lineData[1643] = 0;
  _$jscoverage['/editor/range.js'].lineData[1644] = 0;
  _$jscoverage['/editor/range.js'].lineData[1649] = 0;
  _$jscoverage['/editor/range.js'].lineData[1651] = 0;
  _$jscoverage['/editor/range.js'].lineData[1652] = 0;
  _$jscoverage['/editor/range.js'].lineData[1653] = 0;
  _$jscoverage['/editor/range.js'].lineData[1665] = 0;
  _$jscoverage['/editor/range.js'].lineData[1666] = 0;
  _$jscoverage['/editor/range.js'].lineData[1668] = 0;
  _$jscoverage['/editor/range.js'].lineData[1670] = 0;
  _$jscoverage['/editor/range.js'].lineData[1673] = 0;
  _$jscoverage['/editor/range.js'].lineData[1674] = 0;
  _$jscoverage['/editor/range.js'].lineData[1677] = 0;
  _$jscoverage['/editor/range.js'].lineData[1680] = 0;
  _$jscoverage['/editor/range.js'].lineData[1682] = 0;
  _$jscoverage['/editor/range.js'].lineData[1684] = 0;
  _$jscoverage['/editor/range.js'].lineData[1685] = 0;
  _$jscoverage['/editor/range.js'].lineData[1688] = 0;
  _$jscoverage['/editor/range.js'].lineData[1689] = 0;
  _$jscoverage['/editor/range.js'].lineData[1693] = 0;
  _$jscoverage['/editor/range.js'].lineData[1694] = 0;
  _$jscoverage['/editor/range.js'].lineData[1697] = 0;
  _$jscoverage['/editor/range.js'].lineData[1700] = 0;
  _$jscoverage['/editor/range.js'].lineData[1703] = 0;
  _$jscoverage['/editor/range.js'].lineData[1711] = 0;
  _$jscoverage['/editor/range.js'].lineData[1712] = 0;
  _$jscoverage['/editor/range.js'].lineData[1713] = 0;
  _$jscoverage['/editor/range.js'].lineData[1723] = 0;
  _$jscoverage['/editor/range.js'].lineData[1729] = 0;
  _$jscoverage['/editor/range.js'].lineData[1730] = 0;
  _$jscoverage['/editor/range.js'].lineData[1731] = 0;
  _$jscoverage['/editor/range.js'].lineData[1732] = 0;
  _$jscoverage['/editor/range.js'].lineData[1733] = 0;
  _$jscoverage['/editor/range.js'].lineData[1736] = 0;
  _$jscoverage['/editor/range.js'].lineData[1737] = 0;
  _$jscoverage['/editor/range.js'].lineData[1738] = 0;
  _$jscoverage['/editor/range.js'].lineData[1739] = 0;
  _$jscoverage['/editor/range.js'].lineData[1741] = 0;
  _$jscoverage['/editor/range.js'].lineData[1743] = 0;
  _$jscoverage['/editor/range.js'].lineData[1746] = 0;
  _$jscoverage['/editor/range.js'].lineData[1747] = 0;
  _$jscoverage['/editor/range.js'].lineData[1751] = 0;
  _$jscoverage['/editor/range.js'].lineData[1755] = 0;
  _$jscoverage['/editor/range.js'].lineData[1757] = 0;
  _$jscoverage['/editor/range.js'].lineData[1758] = 0;
  _$jscoverage['/editor/range.js'].lineData[1760] = 0;
  _$jscoverage['/editor/range.js'].lineData[1766] = 0;
  _$jscoverage['/editor/range.js'].lineData[1767] = 0;
  _$jscoverage['/editor/range.js'].lineData[1770] = 0;
  _$jscoverage['/editor/range.js'].lineData[1773] = 0;
  _$jscoverage['/editor/range.js'].lineData[1776] = 0;
  _$jscoverage['/editor/range.js'].lineData[1780] = 0;
  _$jscoverage['/editor/range.js'].lineData[1782] = 0;
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
  _$jscoverage['/editor/range.js'].branchData['68'] = [];
  _$jscoverage['/editor/range.js'].branchData['68'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['68'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['71'] = [];
  _$jscoverage['/editor/range.js'].branchData['71'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['71'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['74'] = [];
  _$jscoverage['/editor/range.js'].branchData['74'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['74'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['79'] = [];
  _$jscoverage['/editor/range.js'].branchData['79'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['86'] = [];
  _$jscoverage['/editor/range.js'].branchData['86'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['89'] = [];
  _$jscoverage['/editor/range.js'].branchData['89'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['91'] = [];
  _$jscoverage['/editor/range.js'].branchData['91'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['94'] = [];
  _$jscoverage['/editor/range.js'].branchData['94'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['98'] = [];
  _$jscoverage['/editor/range.js'].branchData['98'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['101'] = [];
  _$jscoverage['/editor/range.js'].branchData['101'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['101'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['101'][3] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['101'][4] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['134'] = [];
  _$jscoverage['/editor/range.js'].branchData['134'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['138'] = [];
  _$jscoverage['/editor/range.js'].branchData['138'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['151'] = [];
  _$jscoverage['/editor/range.js'].branchData['151'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['157'] = [];
  _$jscoverage['/editor/range.js'].branchData['157'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['159'] = [];
  _$jscoverage['/editor/range.js'].branchData['159'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['175'] = [];
  _$jscoverage['/editor/range.js'].branchData['175'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['184'] = [];
  _$jscoverage['/editor/range.js'].branchData['184'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['191'] = [];
  _$jscoverage['/editor/range.js'].branchData['191'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['219'] = [];
  _$jscoverage['/editor/range.js'].branchData['219'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['227'] = [];
  _$jscoverage['/editor/range.js'].branchData['227'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['240'] = [];
  _$jscoverage['/editor/range.js'].branchData['240'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['244'] = [];
  _$jscoverage['/editor/range.js'].branchData['244'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['244'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['256'] = [];
  _$jscoverage['/editor/range.js'].branchData['256'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['261'] = [];
  _$jscoverage['/editor/range.js'].branchData['261'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['261'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['261'][3] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['269'] = [];
  _$jscoverage['/editor/range.js'].branchData['269'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['276'] = [];
  _$jscoverage['/editor/range.js'].branchData['276'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['286'] = [];
  _$jscoverage['/editor/range.js'].branchData['286'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['295'] = [];
  _$jscoverage['/editor/range.js'].branchData['295'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['304'] = [];
  _$jscoverage['/editor/range.js'].branchData['304'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['308'] = [];
  _$jscoverage['/editor/range.js'].branchData['308'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['308'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['318'] = [];
  _$jscoverage['/editor/range.js'].branchData['318'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['328'] = [];
  _$jscoverage['/editor/range.js'].branchData['328'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['336'] = [];
  _$jscoverage['/editor/range.js'].branchData['336'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['346'] = [];
  _$jscoverage['/editor/range.js'].branchData['346'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['351'] = [];
  _$jscoverage['/editor/range.js'].branchData['351'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['355'] = [];
  _$jscoverage['/editor/range.js'].branchData['355'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['357'] = [];
  _$jscoverage['/editor/range.js'].branchData['357'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['357'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['358'] = [];
  _$jscoverage['/editor/range.js'].branchData['358'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['360'] = [];
  _$jscoverage['/editor/range.js'].branchData['360'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['366'] = [];
  _$jscoverage['/editor/range.js'].branchData['366'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['368'] = [];
  _$jscoverage['/editor/range.js'].branchData['368'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['368'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['369'] = [];
  _$jscoverage['/editor/range.js'].branchData['369'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['370'] = [];
  _$jscoverage['/editor/range.js'].branchData['370'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['383'] = [];
  _$jscoverage['/editor/range.js'].branchData['383'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['383'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['385'] = [];
  _$jscoverage['/editor/range.js'].branchData['385'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['393'] = [];
  _$jscoverage['/editor/range.js'].branchData['393'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['408'] = [];
  _$jscoverage['/editor/range.js'].branchData['408'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['412'] = [];
  _$jscoverage['/editor/range.js'].branchData['412'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['421'] = [];
  _$jscoverage['/editor/range.js'].branchData['421'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['422'] = [];
  _$jscoverage['/editor/range.js'].branchData['422'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['423'] = [];
  _$jscoverage['/editor/range.js'].branchData['423'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['423'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['424'] = [];
  _$jscoverage['/editor/range.js'].branchData['424'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['455'] = [];
  _$jscoverage['/editor/range.js'].branchData['455'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['456'] = [];
  _$jscoverage['/editor/range.js'].branchData['456'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['471'] = [];
  _$jscoverage['/editor/range.js'].branchData['471'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['472'] = [];
  _$jscoverage['/editor/range.js'].branchData['472'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['474'] = [];
  _$jscoverage['/editor/range.js'].branchData['474'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['482'] = [];
  _$jscoverage['/editor/range.js'].branchData['482'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['483'] = [];
  _$jscoverage['/editor/range.js'].branchData['483'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['485'] = [];
  _$jscoverage['/editor/range.js'].branchData['485'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['528'] = [];
  _$jscoverage['/editor/range.js'].branchData['528'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['529'] = [];
  _$jscoverage['/editor/range.js'].branchData['529'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['529'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['533'] = [];
  _$jscoverage['/editor/range.js'].branchData['533'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['534'] = [];
  _$jscoverage['/editor/range.js'].branchData['534'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['534'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['555'] = [];
  _$jscoverage['/editor/range.js'].branchData['555'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['555'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['563'] = [];
  _$jscoverage['/editor/range.js'].branchData['563'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['586'] = [];
  _$jscoverage['/editor/range.js'].branchData['586'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['586'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['594'] = [];
  _$jscoverage['/editor/range.js'].branchData['594'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['615'] = [];
  _$jscoverage['/editor/range.js'].branchData['615'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['646'] = [];
  _$jscoverage['/editor/range.js'].branchData['646'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['691'] = [];
  _$jscoverage['/editor/range.js'].branchData['691'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['733'] = [];
  _$jscoverage['/editor/range.js'].branchData['733'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['733'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['734'] = [];
  _$jscoverage['/editor/range.js'].branchData['734'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['742'] = [];
  _$jscoverage['/editor/range.js'].branchData['742'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['753'] = [];
  _$jscoverage['/editor/range.js'].branchData['753'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['764'] = [];
  _$jscoverage['/editor/range.js'].branchData['764'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['765'] = [];
  _$jscoverage['/editor/range.js'].branchData['765'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['778'] = [];
  _$jscoverage['/editor/range.js'].branchData['778'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['779'] = [];
  _$jscoverage['/editor/range.js'].branchData['779'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['780'] = [];
  _$jscoverage['/editor/range.js'].branchData['780'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['782'] = [];
  _$jscoverage['/editor/range.js'].branchData['782'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['792'] = [];
  _$jscoverage['/editor/range.js'].branchData['792'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['793'] = [];
  _$jscoverage['/editor/range.js'].branchData['793'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['794'] = [];
  _$jscoverage['/editor/range.js'].branchData['794'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['796'] = [];
  _$jscoverage['/editor/range.js'].branchData['796'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['804'] = [];
  _$jscoverage['/editor/range.js'].branchData['804'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['809'] = [];
  _$jscoverage['/editor/range.js'].branchData['809'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['809'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['815'] = [];
  _$jscoverage['/editor/range.js'].branchData['815'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['815'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['816'] = [];
  _$jscoverage['/editor/range.js'].branchData['816'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['820'] = [];
  _$jscoverage['/editor/range.js'].branchData['820'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['820'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['823'] = [];
  _$jscoverage['/editor/range.js'].branchData['823'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['823'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['831'] = [];
  _$jscoverage['/editor/range.js'].branchData['831'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['832'] = [];
  _$jscoverage['/editor/range.js'].branchData['832'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['833'] = [];
  _$jscoverage['/editor/range.js'].branchData['833'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['838'] = [];
  _$jscoverage['/editor/range.js'].branchData['838'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['840'] = [];
  _$jscoverage['/editor/range.js'].branchData['840'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['841'] = [];
  _$jscoverage['/editor/range.js'].branchData['841'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['846'] = [];
  _$jscoverage['/editor/range.js'].branchData['846'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['866'] = [];
  _$jscoverage['/editor/range.js'].branchData['866'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['873'] = [];
  _$jscoverage['/editor/range.js'].branchData['873'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['876'] = [];
  _$jscoverage['/editor/range.js'].branchData['876'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['881'] = [];
  _$jscoverage['/editor/range.js'].branchData['881'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['881'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['881'][3] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['881'][4] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['882'] = [];
  _$jscoverage['/editor/range.js'].branchData['882'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['882'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['882'][3] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['890'] = [];
  _$jscoverage['/editor/range.js'].branchData['890'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['890'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['891'] = [];
  _$jscoverage['/editor/range.js'].branchData['891'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['892'] = [];
  _$jscoverage['/editor/range.js'].branchData['892'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['898'] = [];
  _$jscoverage['/editor/range.js'].branchData['898'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['901'] = [];
  _$jscoverage['/editor/range.js'].branchData['901'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['906'] = [];
  _$jscoverage['/editor/range.js'].branchData['906'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['906'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['907'] = [];
  _$jscoverage['/editor/range.js'].branchData['907'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['907'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['907'][3] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['907'][4] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['908'] = [];
  _$jscoverage['/editor/range.js'].branchData['908'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['915'] = [];
  _$jscoverage['/editor/range.js'].branchData['915'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['915'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['916'] = [];
  _$jscoverage['/editor/range.js'].branchData['916'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['917'] = [];
  _$jscoverage['/editor/range.js'].branchData['917'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['952'] = [];
  _$jscoverage['/editor/range.js'].branchData['952'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['958'] = [];
  _$jscoverage['/editor/range.js'].branchData['958'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['962'] = [];
  _$jscoverage['/editor/range.js'].branchData['962'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['976'] = [];
  _$jscoverage['/editor/range.js'].branchData['976'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1013'] = [];
  _$jscoverage['/editor/range.js'].branchData['1013'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1013'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1014'] = [];
  _$jscoverage['/editor/range.js'].branchData['1014'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1015'] = [];
  _$jscoverage['/editor/range.js'].branchData['1015'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1018'] = [];
  _$jscoverage['/editor/range.js'].branchData['1018'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1024'] = [];
  _$jscoverage['/editor/range.js'].branchData['1024'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1037'] = [];
  _$jscoverage['/editor/range.js'].branchData['1037'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1039'] = [];
  _$jscoverage['/editor/range.js'].branchData['1039'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1046'] = [];
  _$jscoverage['/editor/range.js'].branchData['1046'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1055'] = [];
  _$jscoverage['/editor/range.js'].branchData['1055'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1055'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1056'] = [];
  _$jscoverage['/editor/range.js'].branchData['1056'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1056'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1059'] = [];
  _$jscoverage['/editor/range.js'].branchData['1059'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1065'] = [];
  _$jscoverage['/editor/range.js'].branchData['1065'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1091'] = [];
  _$jscoverage['/editor/range.js'].branchData['1091'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1095'] = [];
  _$jscoverage['/editor/range.js'].branchData['1095'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1109'] = [];
  _$jscoverage['/editor/range.js'].branchData['1109'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1113'] = [];
  _$jscoverage['/editor/range.js'].branchData['1113'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1120'] = [];
  _$jscoverage['/editor/range.js'].branchData['1120'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1141'] = [];
  _$jscoverage['/editor/range.js'].branchData['1141'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1161'] = [];
  _$jscoverage['/editor/range.js'].branchData['1161'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1162'] = [];
  _$jscoverage['/editor/range.js'].branchData['1162'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1163'] = [];
  _$jscoverage['/editor/range.js'].branchData['1163'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1163'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1164'] = [];
  _$jscoverage['/editor/range.js'].branchData['1164'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1173'] = [];
  _$jscoverage['/editor/range.js'].branchData['1173'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1173'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1198'] = [];
  _$jscoverage['/editor/range.js'].branchData['1198'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1199'] = [];
  _$jscoverage['/editor/range.js'].branchData['1199'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1201'] = [];
  _$jscoverage['/editor/range.js'].branchData['1201'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1205'] = [];
  _$jscoverage['/editor/range.js'].branchData['1205'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1216'] = [];
  _$jscoverage['/editor/range.js'].branchData['1216'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1224'] = [];
  _$jscoverage['/editor/range.js'].branchData['1224'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1232'] = [];
  _$jscoverage['/editor/range.js'].branchData['1232'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1234'] = [];
  _$jscoverage['/editor/range.js'].branchData['1234'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1247'] = [];
  _$jscoverage['/editor/range.js'].branchData['1247'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1251'] = [];
  _$jscoverage['/editor/range.js'].branchData['1251'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1270'] = [];
  _$jscoverage['/editor/range.js'].branchData['1270'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1280'] = [];
  _$jscoverage['/editor/range.js'].branchData['1280'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1302'] = [];
  _$jscoverage['/editor/range.js'].branchData['1302'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1307'] = [];
  _$jscoverage['/editor/range.js'].branchData['1307'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1315'] = [];
  _$jscoverage['/editor/range.js'].branchData['1315'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1315'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1326'] = [];
  _$jscoverage['/editor/range.js'].branchData['1326'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1332'] = [];
  _$jscoverage['/editor/range.js'].branchData['1332'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1332'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1340'] = [];
  _$jscoverage['/editor/range.js'].branchData['1340'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1340'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1341'] = [];
  _$jscoverage['/editor/range.js'].branchData['1341'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1352'] = [];
  _$jscoverage['/editor/range.js'].branchData['1352'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1360'] = [];
  _$jscoverage['/editor/range.js'].branchData['1360'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1366'] = [];
  _$jscoverage['/editor/range.js'].branchData['1366'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1366'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1367'] = [];
  _$jscoverage['/editor/range.js'].branchData['1367'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1372'] = [];
  _$jscoverage['/editor/range.js'].branchData['1372'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1390'] = [];
  _$jscoverage['/editor/range.js'].branchData['1390'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1390'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1392'] = [];
  _$jscoverage['/editor/range.js'].branchData['1392'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1409'] = [];
  _$jscoverage['/editor/range.js'].branchData['1409'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1427'] = [];
  _$jscoverage['/editor/range.js'].branchData['1427'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1429'] = [];
  _$jscoverage['/editor/range.js'].branchData['1429'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1446'] = [];
  _$jscoverage['/editor/range.js'].branchData['1446'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1462'] = [];
  _$jscoverage['/editor/range.js'].branchData['1462'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1464'] = [];
  _$jscoverage['/editor/range.js'].branchData['1464'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1471'] = [];
  _$jscoverage['/editor/range.js'].branchData['1471'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1487'] = [];
  _$jscoverage['/editor/range.js'].branchData['1487'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1489'] = [];
  _$jscoverage['/editor/range.js'].branchData['1489'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1491'] = [];
  _$jscoverage['/editor/range.js'].branchData['1491'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1507'] = [];
  _$jscoverage['/editor/range.js'].branchData['1507'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1511'] = [];
  _$jscoverage['/editor/range.js'].branchData['1511'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1513'] = [];
  _$jscoverage['/editor/range.js'].branchData['1513'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1517'] = [];
  _$jscoverage['/editor/range.js'].branchData['1517'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1531'] = [];
  _$jscoverage['/editor/range.js'].branchData['1531'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1553'] = [];
  _$jscoverage['/editor/range.js'].branchData['1553'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1577'] = [];
  _$jscoverage['/editor/range.js'].branchData['1577'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1582'] = [];
  _$jscoverage['/editor/range.js'].branchData['1582'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1583'] = [];
  _$jscoverage['/editor/range.js'].branchData['1583'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1588'] = [];
  _$jscoverage['/editor/range.js'].branchData['1588'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1594'] = [];
  _$jscoverage['/editor/range.js'].branchData['1594'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1595'] = [];
  _$jscoverage['/editor/range.js'].branchData['1595'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1600'] = [];
  _$jscoverage['/editor/range.js'].branchData['1600'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1600'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1601'] = [];
  _$jscoverage['/editor/range.js'].branchData['1601'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1606'] = [];
  _$jscoverage['/editor/range.js'].branchData['1606'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1616'] = [];
  _$jscoverage['/editor/range.js'].branchData['1616'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1638'] = [];
  _$jscoverage['/editor/range.js'].branchData['1638'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1668'] = [];
  _$jscoverage['/editor/range.js'].branchData['1668'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1668'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1673'] = [];
  _$jscoverage['/editor/range.js'].branchData['1673'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1684'] = [];
  _$jscoverage['/editor/range.js'].branchData['1684'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1693'] = [];
  _$jscoverage['/editor/range.js'].branchData['1693'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1693'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1713'] = [];
  _$jscoverage['/editor/range.js'].branchData['1713'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1730'] = [];
  _$jscoverage['/editor/range.js'].branchData['1730'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1732'] = [];
  _$jscoverage['/editor/range.js'].branchData['1732'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1732'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1736'] = [];
  _$jscoverage['/editor/range.js'].branchData['1736'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1746'] = [];
  _$jscoverage['/editor/range.js'].branchData['1746'][1] = new BranchData();
}
_$jscoverage['/editor/range.js'].branchData['1746'][1].init(780, 4, 'last');
function visit620_1746_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1746'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1736'][1].init(236, 50, 'self.checkStartOfBlock() && self.checkEndOfBlock()');
function visit619_1736_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1736'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1732'][2].init(134, 32, 'tmpDtd && tmpDtd[elementName]');
function visit618_1732_2(result) {
  _$jscoverage['/editor/range.js'].branchData['1732'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1732'][1].init(91, 77, '(tmpDtd = dtd[current.nodeName()]) && !(tmpDtd && tmpDtd[elementName])');
function visit617_1732_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1732'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1730'][1].init(269, 7, 'isBlock');
function visit616_1730_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1730'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1713'][1].init(118, 42, 'domNode.nodeType == Dom.NodeType.TEXT_NODE');
function visit615_1713_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1713'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1693'][2].init(492, 43, 'el[0].nodeType == Dom.NodeType.ELEMENT_NODE');
function visit614_1693_2(result) {
  _$jscoverage['/editor/range.js'].branchData['1693'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1693'][1].init(492, 66, 'el[0].nodeType == Dom.NodeType.ELEMENT_NODE && el._4e_isEditable()');
function visit613_1693_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1693'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1684'][1].init(87, 40, 'el[0].nodeType == Dom.NodeType.TEXT_NODE');
function visit612_1684_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1684'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1673'][1].init(286, 19, '!childOnly && !next');
function visit611_1673_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1673'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1668'][2].init(51, 45, 'node[0].nodeType == Dom.NodeType.ELEMENT_NODE');
function visit610_1668_2(result) {
  _$jscoverage['/editor/range.js'].branchData['1668'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1668'][1].init(51, 91, 'node[0].nodeType == Dom.NodeType.ELEMENT_NODE && node._4e_isEditable()');
function visit609_1668_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1668'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1638'][1].init(48, 15, '!self.collapsed');
function visit608_1638_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1638'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1616'][1].init(301, 60, '!UA[\'ie\'] && !S.inArray(startBlock.nodeName(), [\'ul\', \'ol\'])');
function visit607_1616_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1616'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1606'][1].init(271, 14, 'isStartOfBlock');
function visit606_1606_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1606'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1601'][1].init(22, 12, 'isEndOfBlock');
function visit605_1601_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1601'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1600'][2].init(1290, 28, 'startBlock[0] == endBlock[0]');
function visit604_1600_2(result) {
  _$jscoverage['/editor/range.js'].branchData['1600'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1600'][1].init(1276, 42, 'startBlock && startBlock[0] == endBlock[0]');
function visit603_1600_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1600'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1595'][1].init(92, 34, 'endBlock && self.checkEndOfBlock()');
function visit602_1595_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1595'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1594'][1].init(1066, 38, 'startBlock && self.checkStartOfBlock()');
function visit601_1594_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1594'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1588'][1].init(218, 9, '!endBlock');
function visit600_1588_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1588'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1583'][1].init(22, 11, '!startBlock');
function visit599_1583_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1583'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1582'][1].init(642, 16, 'blockTag != \'br\'');
function visit598_1582_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1582'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1577'][1].init(493, 38, '!startBlockLimit.equals(endBlockLimit)');
function visit597_1577_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1577'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1553'][1].init(363, 9, '!UA[\'ie\']');
function visit596_1553_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1553'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1531'][1].init(2382, 56, 'startNode._4e_position(endNode) & KEP.POSITION_FOLLOWING');
function visit595_1531_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1531'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1517'][1].init(311, 15, 'childCount == 0');
function visit594_1517_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1517'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1513'][1].init(82, 22, 'childCount > endOffset');
function visit593_1513_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1513'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1511'][1].init(1396, 48, 'endNode[0].nodeType == Dom.NodeType.ELEMENT_NODE');
function visit592_1511_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1511'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1507'][1].init(612, 43, 'startNode._4e_nextSourceNode() || startNode');
function visit591_1507_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1507'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1491'][1].init(215, 15, 'childCount == 0');
function visit590_1491_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1491'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1489'][1].init(84, 24, 'childCount > startOffset');
function visit589_1489_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1489'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1487'][1].init(269, 50, 'startNode[0].nodeType == Dom.NodeType.ELEMENT_NODE');
function visit588_1487_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1487'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1471'][1].init(7, 22, 'checkType == KER.START');
function visit587_1471_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1471'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1464'][1].init(223, 22, 'checkType == KER.START');
function visit586_1464_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1464'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1462'][1].init(12, 22, 'checkType == KER.START');
function visit585_1462_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1462'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1446'][1].init(1137, 29, 'path.block || path.blockLimit');
function visit584_1446_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1446'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1429'][1].init(111, 16, 'textAfter.length');
function visit583_1429_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1429'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1427'][1].init(271, 50, 'endContainer[0].nodeType == Dom.NodeType.TEXT_NODE');
function visit582_1427_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1427'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1409'][1].init(1196, 29, 'path.block || path.blockLimit');
function visit581_1409_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1409'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1392'][1].init(119, 17, 'textBefore.length');
function visit580_1392_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1392'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1390'][2].init(316, 52, 'startContainer[0].nodeType == Dom.NodeType.TEXT_NODE');
function visit579_1390_2(result) {
  _$jscoverage['/editor/range.js'].branchData['1390'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1390'][1].init(301, 67, 'startOffset && startContainer[0].nodeType == Dom.NodeType.TEXT_NODE');
function visit578_1390_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1390'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1372'][1].init(4532, 6, 'tailBr');
function visit577_1372_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1372'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1367'][1].init(74, 50, 'enlargeable && blockBoundary.contains(enlargeable)');
function visit576_1367_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1367'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1366'][2].init(-1, 38, '!enlargeable && self.checkEndOfBlock()');
function visit575_1366_2(result) {
  _$jscoverage['/editor/range.js'].branchData['1366'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1366'][1].init(-1, 125, '!enlargeable && self.checkEndOfBlock() || enlargeable && blockBoundary.contains(enlargeable)');
function visit574_1366_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1366'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1360'][1].init(3798, 21, 'blockBoundary || body');
function visit573_1360_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1360'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1352'][1].init(3365, 38, 'unit == KER.ENLARGE_LIST_ITEM_CONTENTS');
function visit572_1352_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1352'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1341'][1].init(80, 50, 'enlargeable && blockBoundary.contains(enlargeable)');
function visit571_1341_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1341'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1340'][2].init(462, 40, '!enlargeable && self.checkStartOfBlock()');
function visit570_1340_2(result) {
  _$jscoverage['/editor/range.js'].branchData['1340'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1340'][1].init(462, 131, '!enlargeable && self.checkStartOfBlock() || enlargeable && blockBoundary.contains(enlargeable)');
function visit569_1340_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1340'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1332'][2].init(90, 32, 'blockBoundary.nodeName() != \'br\'');
function visit568_1332_2(result) {
  _$jscoverage['/editor/range.js'].branchData['1332'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1332'][1].init(-1, 596, 'blockBoundary.nodeName() != \'br\' && (!enlargeable && self.checkStartOfBlock() || enlargeable && blockBoundary.contains(enlargeable))');
function visit567_1332_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1332'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1326'][1].init(1939, 21, 'blockBoundary || body');
function visit566_1326_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1326'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1315'][2].init(116, 26, 'Dom.nodeName(node) == \'br\'');
function visit565_1315_2(result) {
  _$jscoverage['/editor/range.js'].branchData['1315'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1315'][1].init(105, 37, '!retVal && Dom.nodeName(node) == \'br\'');
function visit564_1315_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1315'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1307'][1].init(104, 7, '!retVal');
function visit563_1307_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1307'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1302'][1].init(56, 38, 'unit == KER.ENLARGE_LIST_ITEM_CONTENTS');
function visit562_1302_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1302'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1280'][1].init(430, 18, 'stop[0] && stop[1]');
function visit561_1280_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1280'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1270'][1].init(57, 14, 'self.collapsed');
function visit560_1270_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1270'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1251'][1].init(990, 47, 'commonReached || enlarge.equals(commonAncestor)');
function visit559_1251_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1251'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1247'][1].init(875, 28, 'enlarge.nodeName() == "body"');
function visit558_1247_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1247'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1234'][1].init(69, 14, '!commonReached');
function visit557_1234_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1234'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1232'][1].init(396, 7, 'sibling');
function visit556_1232_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1232'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1224'][1].init(30, 44, 'isWhitespace(sibling) || isBookmark(sibling)');
function visit555_1224_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1224'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1216'][1].init(66, 57, 'container[0].childNodes[offset + (left ? -1 : 1)] || null');
function visit554_1216_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1216'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1205'][1].init(30, 38, 'offset < container[0].nodeValue.length');
function visit553_1205_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1205'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1201'][1].init(70, 6, 'offset');
function visit552_1201_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1201'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1199'][1].init(26, 4, 'left');
function visit551_1199_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1199'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1198'][1].init(395, 47, 'container[0].nodeType == Dom.NodeType.TEXT_NODE');
function visit550_1198_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1198'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1173'][2].init(25, 46, 'ancestor[0].nodeType == Dom.NodeType.TEXT_NODE');
function visit549_1173_2(result) {
  _$jscoverage['/editor/range.js'].branchData['1173'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1173'][1].init(-1, 64, 'ignoreTextNode && ancestor[0].nodeType == Dom.NodeType.TEXT_NODE');
function visit548_1173_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1173'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1164'][1].init(70, 38, 'self.startOffset == self.endOffset - 1');
function visit547_1164_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1164'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1163'][2].init(60, 46, 'start[0].nodeType == Dom.NodeType.ELEMENT_NODE');
function visit546_1163_2(result) {
  _$jscoverage['/editor/range.js'].branchData['1163'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1163'][1].init(35, 109, 'start[0].nodeType == Dom.NodeType.ELEMENT_NODE && self.startOffset == self.endOffset - 1');
function visit545_1163_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1163'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1162'][1].init(22, 145, 'includeSelf && start[0].nodeType == Dom.NodeType.ELEMENT_NODE && self.startOffset == self.endOffset - 1');
function visit544_1162_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1162'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1161'][1].init(165, 18, 'start[0] == end[0]');
function visit543_1161_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1161'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1141'][1].init(784, 21, 'endNode && endNode[0]');
function visit542_1141_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1141'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1120'][1].init(567, 12, 'endContainer');
function visit541_1120_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1120'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1113'][1].init(172, 71, 'bookmark.end && doc._4e_getByAddress(bookmark.end, bookmark.normalized)');
function visit540_1113_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1113'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1109'][1].init(89, 12, 'bookmark.is2');
function visit539_1109_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1109'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1095'][1].init(433, 41, 'startContainer[0] == self.endContainer[0]');
function visit538_1095_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1095'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1091'][1].init(118, 49, 'startContainer[0].childNodes[startOffset] || null');
function visit537_1091_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1091'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1065'][1].init(415, 45, 'endOffset >= endContainer[0].nodeValue.length');
function visit536_1065_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1065'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1059'][1].init(131, 10, '!endOffset');
function visit535_1059_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1059'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1056'][2].init(2122, 50, 'endContainer[0].nodeType == Dom.NodeType.TEXT_NODE');
function visit534_1056_2(result) {
  _$jscoverage['/editor/range.js'].branchData['1056'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1056'][1].init(47, 69, 'endContainer[0] && endContainer[0].nodeType == Dom.NodeType.TEXT_NODE');
function visit533_1056_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1056'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1055'][2].init(2056, 22, 'ignoreEnd || collapsed');
function visit532_1055_2(result) {
  _$jscoverage['/editor/range.js'].branchData['1055'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1055'][1].init(2053, 117, '!(ignoreEnd || collapsed) && endContainer[0] && endContainer[0].nodeType == Dom.NodeType.TEXT_NODE');
function visit531_1055_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1055'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1046'][1].init(1476, 9, 'collapsed');
function visit530_1046_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1046'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1039'][1].init(483, 45, 'Dom.equals(startContainer, self.endContainer)');
function visit529_1039_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1039'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1037'][1].init(313, 50, 'Dom.equals(self.startContainer, self.endContainer)');
function visit528_1037_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1037'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1024'][1].init(425, 49, 'startOffset >= startContainer[0].nodeValue.length');
function visit527_1024_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1024'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1018'][1].init(131, 12, '!startOffset');
function visit526_1018_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1018'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1015'][1].init(37, 52, 'startContainer[0].nodeType == Dom.NodeType.TEXT_NODE');
function visit525_1015_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1015'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1014'][1].init(47, 90, 'startContainer[0] && startContainer[0].nodeType == Dom.NodeType.TEXT_NODE');
function visit524_1014_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1014'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1013'][2].init(201, 25, '!ignoreStart || collapsed');
function visit523_1013_2(result) {
  _$jscoverage['/editor/range.js'].branchData['1013'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1013'][1].init(201, 138, '(!ignoreStart || collapsed) && startContainer[0] && startContainer[0].nodeType == Dom.NodeType.TEXT_NODE');
function visit522_1013_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1013'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['976'][1].init(1257, 7, 'endNode');
function visit521_976_1(result) {
  _$jscoverage['/editor/range.js'].branchData['976'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['962'][1].init(111, 12, 'serializable');
function visit520_962_1(result) {
  _$jscoverage['/editor/range.js'].branchData['962'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['958'][1].init(732, 10, '!collapsed');
function visit519_958_1(result) {
  _$jscoverage['/editor/range.js'].branchData['958'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['952'][1].init(522, 12, 'serializable');
function visit518_952_1(result) {
  _$jscoverage['/editor/range.js'].branchData['952'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['917'][1].init(72, 46, 'previous[0].nodeType == Dom.NodeType.TEXT_NODE');
function visit517_917_1(result) {
  _$jscoverage['/editor/range.js'].branchData['917'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['916'][1].init(80, 119, '(previous = endContainer.prev(undefined, 1)) && previous[0].nodeType == Dom.NodeType.TEXT_NODE');
function visit516_916_1(result) {
  _$jscoverage['/editor/range.js'].branchData['916'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['915'][2].init(858, 50, 'endContainer[0].nodeType == Dom.NodeType.TEXT_NODE');
function visit515_915_2(result) {
  _$jscoverage['/editor/range.js'].branchData['915'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['915'][1].init(858, 200, 'endContainer[0].nodeType == Dom.NodeType.TEXT_NODE && (previous = endContainer.prev(undefined, 1)) && previous[0].nodeType == Dom.NodeType.TEXT_NODE');
function visit514_915_1(result) {
  _$jscoverage['/editor/range.js'].branchData['915'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['908'][1].init(45, 59, 'child[0].previousSibling.nodeType == Dom.NodeType.TEXT_NODE');
function visit513_908_1(result) {
  _$jscoverage['/editor/range.js'].branchData['908'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['907'][4].init(331, 13, 'endOffset > 0');
function visit512_907_4(result) {
  _$jscoverage['/editor/range.js'].branchData['907'][4].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['907'][3].init(46, 105, 'endOffset > 0 && child[0].previousSibling.nodeType == Dom.NodeType.TEXT_NODE');
function visit511_907_3(result) {
  _$jscoverage['/editor/range.js'].branchData['907'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['907'][2].init(283, 43, 'child[0].nodeType == Dom.NodeType.TEXT_NODE');
function visit510_907_2(result) {
  _$jscoverage['/editor/range.js'].branchData['907'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['907'][1].init(40, 152, 'child[0].nodeType == Dom.NodeType.TEXT_NODE && endOffset > 0 && child[0].previousSibling.nodeType == Dom.NodeType.TEXT_NODE');
function visit509_907_1(result) {
  _$jscoverage['/editor/range.js'].branchData['907'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['906'][2].init(239, 193, 'child[0] && child[0].nodeType == Dom.NodeType.TEXT_NODE && endOffset > 0 && child[0].previousSibling.nodeType == Dom.NodeType.TEXT_NODE');
function visit508_906_2(result) {
  _$jscoverage['/editor/range.js'].branchData['906'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['906'][1].init(230, 202, 'child && child[0] && child[0].nodeType == Dom.NodeType.TEXT_NODE && endOffset > 0 && child[0].previousSibling.nodeType == Dom.NodeType.TEXT_NODE');
function visit507_906_1(result) {
  _$jscoverage['/editor/range.js'].branchData['906'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['901'][1].init(148, 53, 'endContainer[0].nodeType == Dom.NodeType.ELEMENT_NODE');
function visit506_901_1(result) {
  _$jscoverage['/editor/range.js'].branchData['901'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['898'][1].init(1205, 15, '!self.collapsed');
function visit505_898_1(result) {
  _$jscoverage['/editor/range.js'].branchData['898'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['892'][1].init(70, 46, 'previous[0].nodeType == Dom.NodeType.TEXT_NODE');
function visit504_892_1(result) {
  _$jscoverage['/editor/range.js'].branchData['892'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['891'][1].init(78, 117, '(previous = startContainer.prev(undefined, 1)) && previous[0].nodeType == Dom.NodeType.TEXT_NODE');
function visit503_891_1(result) {
  _$jscoverage['/editor/range.js'].branchData['891'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['890'][2].init(789, 52, 'startContainer[0].nodeType == Dom.NodeType.TEXT_NODE');
function visit502_890_2(result) {
  _$jscoverage['/editor/range.js'].branchData['890'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['890'][1].init(789, 196, 'startContainer[0].nodeType == Dom.NodeType.TEXT_NODE && (previous = startContainer.prev(undefined, 1)) && previous[0].nodeType == Dom.NodeType.TEXT_NODE');
function visit501_890_1(result) {
  _$jscoverage['/editor/range.js'].branchData['890'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['882'][3].init(18, 59, 'child[0].previousSibling.nodeType == Dom.NodeType.TEXT_NODE');
function visit500_882_3(result) {
  _$jscoverage['/editor/range.js'].branchData['882'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['882'][2].init(315, 15, 'startOffset > 0');
function visit499_882_2(result) {
  _$jscoverage['/editor/range.js'].branchData['882'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['882'][1].init(71, 78, 'startOffset > 0 && child[0].previousSibling.nodeType == Dom.NodeType.TEXT_NODE');
function visit498_882_1(result) {
  _$jscoverage['/editor/range.js'].branchData['882'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['881'][4].init(239, 43, 'child[0].nodeType == Dom.NodeType.TEXT_NODE');
function visit497_881_4(result) {
  _$jscoverage['/editor/range.js'].branchData['881'][4].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['881'][3].init(239, 150, 'child[0].nodeType == Dom.NodeType.TEXT_NODE && startOffset > 0 && child[0].previousSibling.nodeType == Dom.NodeType.TEXT_NODE');
function visit496_881_3(result) {
  _$jscoverage['/editor/range.js'].branchData['881'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['881'][2].init(227, 162, 'child[0] && child[0].nodeType == Dom.NodeType.TEXT_NODE && startOffset > 0 && child[0].previousSibling.nodeType == Dom.NodeType.TEXT_NODE');
function visit495_881_2(result) {
  _$jscoverage['/editor/range.js'].branchData['881'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['881'][1].init(218, 171, 'child && child[0] && child[0].nodeType == Dom.NodeType.TEXT_NODE && startOffset > 0 && child[0].previousSibling.nodeType == Dom.NodeType.TEXT_NODE');
function visit494_881_1(result) {
  _$jscoverage['/editor/range.js'].branchData['881'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['876'][1].init(136, 55, 'startContainer[0].nodeType == Dom.NodeType.ELEMENT_NODE');
function visit493_876_1(result) {
  _$jscoverage['/editor/range.js'].branchData['876'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['873'][1].init(640, 10, 'normalized');
function visit492_873_1(result) {
  _$jscoverage['/editor/range.js'].branchData['873'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['866'][1].init(465, 32, '!startContainer || !endContainer');
function visit491_866_1(result) {
  _$jscoverage['/editor/range.js'].branchData['866'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['846'][1].init(3710, 20, 'moveStart || moveEnd');
function visit490_846_1(result) {
  _$jscoverage['/editor/range.js'].branchData['846'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['841'][1].init(166, 7, 'textEnd');
function visit489_841_1(result) {
  _$jscoverage['/editor/range.js'].branchData['841'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['840'][1].init(80, 26, 'mode == KER.SHRINK_ELEMENT');
function visit488_840_1(result) {
  _$jscoverage['/editor/range.js'].branchData['840'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['838'][1].init(3339, 7, 'moveEnd');
function visit487_838_1(result) {
  _$jscoverage['/editor/range.js'].branchData['838'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['833'][1].init(126, 9, 'textStart');
function visit486_833_1(result) {
  _$jscoverage['/editor/range.js'].branchData['833'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['832'][1].init(45, 26, 'mode == KER.SHRINK_ELEMENT');
function visit485_832_1(result) {
  _$jscoverage['/editor/range.js'].branchData['832'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['831'][1].init(2999, 9, 'moveStart');
function visit484_831_1(result) {
  _$jscoverage['/editor/range.js'].branchData['831'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['823'][2].init(563, 42, 'node.nodeType == Dom.NodeType.ELEMENT_NODE');
function visit483_823_2(result) {
  _$jscoverage['/editor/range.js'].branchData['823'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['823'][1].init(549, 56, '!movingOut && node.nodeType == Dom.NodeType.ELEMENT_NODE');
function visit482_823_1(result) {
  _$jscoverage['/editor/range.js'].branchData['823'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['820'][2].init(424, 22, 'node == currentElement');
function visit481_820_2(result) {
  _$jscoverage['/editor/range.js'].branchData['820'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['820'][1].init(411, 35, 'movingOut && node == currentElement');
function visit480_820_1(result) {
  _$jscoverage['/editor/range.js'].branchData['820'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['816'][1].init(58, 39, 'node.nodeType == Dom.NodeType.TEXT_NODE');
function visit479_816_1(result) {
  _$jscoverage['/editor/range.js'].branchData['816'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['815'][2].init(129, 26, 'mode == KER.SHRINK_ELEMENT');
function visit478_815_2(result) {
  _$jscoverage['/editor/range.js'].branchData['815'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['815'][1].init(129, 98, 'mode == KER.SHRINK_ELEMENT && node.nodeType == Dom.NodeType.TEXT_NODE');
function visit477_815_1(result) {
  _$jscoverage['/editor/range.js'].branchData['815'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['809'][2].init(52, 26, 'mode == KER.SHRINK_ELEMENT');
function visit476_809_2(result) {
  _$jscoverage['/editor/range.js'].branchData['809'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['809'][1].init(33, 129, 'node.nodeType == (mode == KER.SHRINK_ELEMENT ? Dom.NodeType.ELEMENT_NODE : Dom.NodeType.TEXT_NODE)');
function visit475_809_1(result) {
  _$jscoverage['/editor/range.js'].branchData['809'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['804'][1].init(1811, 20, 'moveStart || moveEnd');
function visit474_804_1(result) {
  _$jscoverage['/editor/range.js'].branchData['804'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['796'][1].init(138, 45, 'endOffset >= endContainer[0].nodeValue.length');
function visit473_796_1(result) {
  _$jscoverage['/editor/range.js'].branchData['796'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['794'][1].init(26, 10, '!endOffset');
function visit472_794_1(result) {
  _$jscoverage['/editor/range.js'].branchData['794'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['793'][1].init(36, 50, 'endContainer[0].nodeType == Dom.NodeType.TEXT_NODE');
function visit471_793_1(result) {
  _$jscoverage['/editor/range.js'].branchData['793'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['792'][1].init(1270, 87, 'endContainer && endContainer[0].nodeType == Dom.NodeType.TEXT_NODE');
function visit470_792_1(result) {
  _$jscoverage['/editor/range.js'].branchData['792'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['782'][1].init(144, 49, 'startOffset >= startContainer[0].nodeValue.length');
function visit469_782_1(result) {
  _$jscoverage['/editor/range.js'].branchData['782'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['780'][1].init(26, 12, '!startOffset');
function visit468_780_1(result) {
  _$jscoverage['/editor/range.js'].branchData['780'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['779'][1].init(38, 52, 'startContainer[0].nodeType == Dom.NodeType.TEXT_NODE');
function visit467_779_1(result) {
  _$jscoverage['/editor/range.js'].branchData['779'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['778'][1].init(545, 91, 'startContainer && startContainer[0].nodeType == Dom.NodeType.TEXT_NODE');
function visit466_778_1(result) {
  _$jscoverage['/editor/range.js'].branchData['778'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['765'][1].init(25, 23, 'mode || KER.SHRINK_TEXT');
function visit465_765_1(result) {
  _$jscoverage['/editor/range.js'].branchData['765'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['764'][1].init(100, 15, '!self.collapsed');
function visit464_764_1(result) {
  _$jscoverage['/editor/range.js'].branchData['764'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['753'][1].init(882, 24, 'node && node.equals(pre)');
function visit463_753_1(result) {
  _$jscoverage['/editor/range.js'].branchData['753'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['742'][1].init(25, 46, 'isNotWhitespaces(node) && isNotBookmarks(node)');
function visit462_742_1(result) {
  _$jscoverage['/editor/range.js'].branchData['742'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['734'][1].init(87, 65, 'walkerRange.endContainer[0].nodeType != Dom.NodeType.ELEMENT_NODE');
function visit461_734_1(result) {
  _$jscoverage['/editor/range.js'].branchData['734'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['733'][2].init(194, 67, 'walkerRange.startContainer[0].nodeType != Dom.NodeType.ELEMENT_NODE');
function visit460_733_2(result) {
  _$jscoverage['/editor/range.js'].branchData['733'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['733'][1].init(194, 153, 'walkerRange.startContainer[0].nodeType != Dom.NodeType.ELEMENT_NODE || walkerRange.endContainer[0].nodeType != Dom.NodeType.ELEMENT_NODE');
function visit459_733_1(result) {
  _$jscoverage['/editor/range.js'].branchData['733'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['691'][1].init(48, 7, 'toStart');
function visit458_691_1(result) {
  _$jscoverage['/editor/range.js'].branchData['691'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['646'][1].init(55, 42, 'node[0].nodeType == Dom.NodeType.TEXT_NODE');
function visit457_646_1(result) {
  _$jscoverage['/editor/range.js'].branchData['646'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['615'][1].init(55, 42, 'node[0].nodeType == Dom.NodeType.TEXT_NODE');
function visit456_615_1(result) {
  _$jscoverage['/editor/range.js'].branchData['615'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['594'][1].init(700, 20, '!self.startContainer');
function visit455_594_1(result) {
  _$jscoverage['/editor/range.js'].branchData['594'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['586'][2].init(399, 48, 'endNode[0].nodeType == Dom.NodeType.ELEMENT_NODE');
function visit454_586_2(result) {
  _$jscoverage['/editor/range.js'].branchData['586'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['586'][1].init(399, 79, 'endNode[0].nodeType == Dom.NodeType.ELEMENT_NODE && EMPTY[endNode.nodeName()]');
function visit453_586_1(result) {
  _$jscoverage['/editor/range.js'].branchData['586'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['563'][1].init(717, 18, '!self.endContainer');
function visit452_563_1(result) {
  _$jscoverage['/editor/range.js'].branchData['563'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['555'][2].init(400, 50, 'startNode[0].nodeType == Dom.NodeType.ELEMENT_NODE');
function visit451_555_2(result) {
  _$jscoverage['/editor/range.js'].branchData['555'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['555'][1].init(400, 83, 'startNode[0].nodeType == Dom.NodeType.ELEMENT_NODE && EMPTY[startNode.nodeName()]');
function visit450_555_1(result) {
  _$jscoverage['/editor/range.js'].branchData['555'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['534'][2].init(372, 28, 'endNode.nodeName() == \'span\'');
function visit449_534_2(result) {
  _$jscoverage['/editor/range.js'].branchData['534'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['534'][1].init(27, 77, 'endNode.nodeName() == \'span\' && endNode.attr(\'_ke_bookmark\')');
function visit448_534_1(result) {
  _$jscoverage['/editor/range.js'].branchData['534'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['533'][1].init(342, 105, 'endNode && endNode.nodeName() == \'span\' && endNode.attr(\'_ke_bookmark\')');
function visit447_533_1(result) {
  _$jscoverage['/editor/range.js'].branchData['533'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['529'][2].init(178, 30, 'startNode.nodeName() == \'span\'');
function visit446_529_2(result) {
  _$jscoverage['/editor/range.js'].branchData['529'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['529'][1].init(29, 81, 'startNode.nodeName() == \'span\' && startNode.attr(\'_ke_bookmark\')');
function visit445_529_1(result) {
  _$jscoverage['/editor/range.js'].branchData['529'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['528'][1].init(146, 111, 'startNode && startNode.nodeName() == \'span\' && startNode.attr(\'_ke_bookmark\')');
function visit444_528_1(result) {
  _$jscoverage['/editor/range.js'].branchData['528'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['485'][1].init(113, 39, 'offset >= container[0].nodeValue.length');
function visit443_485_1(result) {
  _$jscoverage['/editor/range.js'].branchData['485'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['483'][1].init(22, 7, '!offset');
function visit442_483_1(result) {
  _$jscoverage['/editor/range.js'].branchData['483'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['482'][1].init(543, 50, 'container[0].nodeType != Dom.NodeType.ELEMENT_NODE');
function visit441_482_1(result) {
  _$jscoverage['/editor/range.js'].branchData['482'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['474'][1].init(115, 39, 'offset >= container[0].nodeValue.length');
function visit440_474_1(result) {
  _$jscoverage['/editor/range.js'].branchData['474'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['472'][1].init(22, 7, '!offset');
function visit439_472_1(result) {
  _$jscoverage['/editor/range.js'].branchData['472'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['471'][1].init(144, 50, 'container[0].nodeType != Dom.NodeType.ELEMENT_NODE');
function visit438_471_1(result) {
  _$jscoverage['/editor/range.js'].branchData['471'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['456'][1].init(283, 40, 'endContainer.id || endContainer.nodeName');
function visit437_456_1(result) {
  _$jscoverage['/editor/range.js'].branchData['456'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['455'][1].init(189, 44, 'startContainer.id || startContainer.nodeName');
function visit436_455_1(result) {
  _$jscoverage['/editor/range.js'].branchData['455'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['424'][1].init(66, 34, 'self.startOffset == self.endOffset');
function visit435_424_1(result) {
  _$jscoverage['/editor/range.js'].branchData['424'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['423'][2].init(112, 46, 'self.startContainer[0] == self.endContainer[0]');
function visit434_423_2(result) {
  _$jscoverage['/editor/range.js'].branchData['423'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['423'][1].init(37, 101, 'self.startContainer[0] == self.endContainer[0] && self.startOffset == self.endOffset');
function visit433_423_1(result) {
  _$jscoverage['/editor/range.js'].branchData['423'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['422'][1].init(39, 139, 'self.endContainer && self.startContainer[0] == self.endContainer[0] && self.startOffset == self.endOffset');
function visit432_422_1(result) {
  _$jscoverage['/editor/range.js'].branchData['422'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['421'][1].init(-1, 179, 'self.startContainer && self.endContainer && self.startContainer[0] == self.endContainer[0] && self.startOffset == self.endOffset');
function visit431_421_1(result) {
  _$jscoverage['/editor/range.js'].branchData['421'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['412'][1].init(11077, 13, 'removeEndNode');
function visit430_412_1(result) {
  _$jscoverage['/editor/range.js'].branchData['412'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['408'][1].init(10999, 15, 'removeStartNode');
function visit429_408_1(result) {
  _$jscoverage['/editor/range.js'].branchData['408'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['393'][1].init(206, 123, 'removeStartNode && (topStart._4e_sameLevel(startNode))');
function visit428_393_1(result) {
  _$jscoverage['/editor/range.js'].branchData['393'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['385'][1].init(-1, 97, '!startNode._4e_sameLevel(topStart) || !endNode._4e_sameLevel(topEnd)');
function visit427_385_1(result) {
  _$jscoverage['/editor/range.js'].branchData['385'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['383'][2].init(279, 182, 'topEnd && (!startNode._4e_sameLevel(topStart) || !endNode._4e_sameLevel(topEnd))');
function visit426_383_2(result) {
  _$jscoverage['/editor/range.js'].branchData['383'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['383'][1].init(21, 194, 'topStart && topEnd && (!startNode._4e_sameLevel(topStart) || !endNode._4e_sameLevel(topEnd))');
function visit425_383_1(result) {
  _$jscoverage['/editor/range.js'].branchData['383'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['370'][1].init(51, 62, 'endTextNode.previousSibling.nodeType == Dom.NodeType.TEXT_NODE');
function visit424_370_1(result) {
  _$jscoverage['/editor/range.js'].branchData['370'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['369'][1].init(70, 114, 'endTextNode.previousSibling && endTextNode.previousSibling.nodeType == Dom.NodeType.TEXT_NODE');
function visit423_369_1(result) {
  _$jscoverage['/editor/range.js'].branchData['369'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['368'][2].init(69, 46, 'endTextNode.nodeType == Dom.NodeType.TEXT_NODE');
function visit422_368_2(result) {
  _$jscoverage['/editor/range.js'].branchData['368'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['368'][1].init(69, 185, 'endTextNode.nodeType == Dom.NodeType.TEXT_NODE && endTextNode.previousSibling && endTextNode.previousSibling.nodeType == Dom.NodeType.TEXT_NODE');
function visit421_368_1(result) {
  _$jscoverage['/editor/range.js'].branchData['368'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['366'][1].init(664, 11, 'hasSplitEnd');
function visit420_366_1(result) {
  _$jscoverage['/editor/range.js'].branchData['366'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['360'][1].init(115, 60, 'startTextNode.nextSibling.nodeType == Dom.NodeType.TEXT_NODE');
function visit419_360_1(result) {
  _$jscoverage['/editor/range.js'].branchData['360'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['358'][1].init(72, 176, 'startTextNode.nextSibling && startTextNode.nextSibling.nodeType == Dom.NodeType.TEXT_NODE');
function visit418_358_1(result) {
  _$jscoverage['/editor/range.js'].branchData['358'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['357'][2].init(73, 48, 'startTextNode.nodeType == Dom.NodeType.TEXT_NODE');
function visit417_357_2(result) {
  _$jscoverage['/editor/range.js'].branchData['357'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['357'][1].init(73, 249, 'startTextNode.nodeType == Dom.NodeType.TEXT_NODE && startTextNode.nextSibling && startTextNode.nextSibling.nodeType == Dom.NodeType.TEXT_NODE');
function visit416_357_1(result) {
  _$jscoverage['/editor/range.js'].branchData['357'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['355'][1].init(108, 13, 'hasSplitStart');
function visit415_355_1(result) {
  _$jscoverage['/editor/range.js'].branchData['355'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['351'][1].init(8756, 11, 'action == 2');
function visit414_351_1(result) {
  _$jscoverage['/editor/range.js'].branchData['351'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['346'][1].init(1695, 10, 'levelClone');
function visit413_346_1(result) {
  _$jscoverage['/editor/range.js'].branchData['346'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['336'][1].init(243, 11, 'action == 1');
function visit412_336_1(result) {
  _$jscoverage['/editor/range.js'].branchData['336'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['328'][1].init(194, 11, 'action == 2');
function visit411_328_1(result) {
  _$jscoverage['/editor/range.js'].branchData['328'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['318'][1].init(21, 140, '!startParents[k] || !levelStartNode._4e_sameLevel(startParents[k])');
function visit410_318_1(result) {
  _$jscoverage['/editor/range.js'].branchData['318'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['308'][2].init(132, 10, 'action > 0');
function visit409_308_2(result) {
  _$jscoverage['/editor/range.js'].branchData['308'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['308'][1].init(132, 45, 'action > 0 && !levelStartNode.equals(endNode)');
function visit408_308_1(result) {
  _$jscoverage['/editor/range.js'].branchData['308'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['304'][1].init(6919, 21, 'k < endParents.length');
function visit407_304_1(result) {
  _$jscoverage['/editor/range.js'].branchData['304'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['295'][1].init(2234, 10, 'levelClone');
function visit406_295_1(result) {
  _$jscoverage['/editor/range.js'].branchData['295'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['286'][1].init(657, 11, 'action == 1');
function visit405_286_1(result) {
  _$jscoverage['/editor/range.js'].branchData['286'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['276'][1].init(159, 48, 'UN_REMOVABLE[currentNode.nodeName.toLowerCase()]');
function visit404_276_1(result) {
  _$jscoverage['/editor/range.js'].branchData['276'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['269'][1].init(446, 11, 'action == 2');
function visit403_269_1(result) {
  _$jscoverage['/editor/range.js'].branchData['269'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['261'][3].init(195, 25, 'domEndNode == currentNode');
function visit402_261_3(result) {
  _$jscoverage['/editor/range.js'].branchData['261'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['261'][2].init(163, 28, 'domEndParentJ == currentNode');
function visit401_261_2(result) {
  _$jscoverage['/editor/range.js'].branchData['261'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['261'][1].init(163, 57, 'domEndParentJ == currentNode || domEndNode == currentNode');
function visit400_261_1(result) {
  _$jscoverage['/editor/range.js'].branchData['261'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['256'][1].init(108, 27, 'endParentJ && endParentJ[0]');
function visit399_256_1(result) {
  _$jscoverage['/editor/range.js'].branchData['256'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['244'][2].init(132, 10, 'action > 0');
function visit398_244_2(result) {
  _$jscoverage['/editor/range.js'].branchData['244'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['244'][1].init(132, 47, 'action > 0 && !levelStartNode.equals(startNode)');
function visit397_244_1(result) {
  _$jscoverage['/editor/range.js'].branchData['244'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['240'][1].init(4425, 23, 'j < startParents.length');
function visit396_240_1(result) {
  _$jscoverage['/editor/range.js'].branchData['240'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['227'][1].init(348, 24, '!topStart.equals(topEnd)');
function visit395_227_1(result) {
  _$jscoverage['/editor/range.js'].branchData['227'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['219'][1].init(3699, 23, 'i < startParents.length');
function visit394_219_1(result) {
  _$jscoverage['/editor/range.js'].branchData['219'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['191'][1].init(621, 45, 'startOffset >= startNode[0].childNodes.length');
function visit393_191_1(result) {
  _$jscoverage['/editor/range.js'].branchData['191'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['184'][1].init(325, 12, '!startOffset');
function visit392_184_1(result) {
  _$jscoverage['/editor/range.js'].branchData['184'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['175'][1].init(1990, 47, 'startNode[0].nodeType == Dom.NodeType.TEXT_NODE');
function visit391_175_1(result) {
  _$jscoverage['/editor/range.js'].branchData['175'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['159'][1].init(84, 41, 'endOffset >= endNode[0].childNodes.length');
function visit390_159_1(result) {
  _$jscoverage['/editor/range.js'].branchData['159'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['157'][1].init(153, 32, 'endNode[0].childNodes.length > 0');
function visit389_157_1(result) {
  _$jscoverage['/editor/range.js'].branchData['157'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['151'][1].init(904, 45, 'endNode[0].nodeType == Dom.NodeType.TEXT_NODE');
function visit388_151_1(result) {
  _$jscoverage['/editor/range.js'].branchData['151'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['138'][1].init(495, 14, 'self.collapsed');
function visit387_138_1(result) {
  _$jscoverage['/editor/range.js'].branchData['138'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['134'][1].init(402, 10, 'action > 0');
function visit386_134_1(result) {
  _$jscoverage['/editor/range.js'].branchData['134'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['101'][4].init(182, 16, 'nodeName == \'br\'');
function visit385_101_4(result) {
  _$jscoverage['/editor/range.js'].branchData['101'][4].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['101'][3].init(182, 26, 'nodeName == \'br\' && !hadBr');
function visit384_101_3(result) {
  _$jscoverage['/editor/range.js'].branchData['101'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['101'][2].init(169, 39, '!UA[\'ie\'] && nodeName == \'br\' && !hadBr');
function visit383_101_2(result) {
  _$jscoverage['/editor/range.js'].branchData['101'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['101'][1].init(157, 51, '!isStart && !UA[\'ie\'] && nodeName == \'br\' && !hadBr');
function visit382_101_1(result) {
  _$jscoverage['/editor/range.js'].branchData['101'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['98'][1].init(198, 35, '!inlineChildReqElements[nodeName]');
function visit381_98_1(result) {
  _$jscoverage['/editor/range.js'].branchData['98'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['94'][1].init(384, 42, 'node.nodeType == Dom.NodeType.ELEMENT_NODE');
function visit380_94_1(result) {
  _$jscoverage['/editor/range.js'].branchData['94'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['91'][1].init(100, 29, 'S.trim(node.nodeValue).length');
function visit379_91_1(result) {
  _$jscoverage['/editor/range.js'].branchData['91'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['89'][1].init(130, 39, 'node.nodeType == Dom.NodeType.TEXT_NODE');
function visit378_89_1(result) {
  _$jscoverage['/editor/range.js'].branchData['89'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['86'][1].init(63, 16, 'isBookmark(node)');
function visit377_86_1(result) {
  _$jscoverage['/editor/range.js'].branchData['86'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['79'][1].init(79, 40, '!isWhitespace(node) && !isBookmark(node)');
function visit376_79_1(result) {
  _$jscoverage['/editor/range.js'].branchData['79'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['74'][2].init(491, 8, 'c2 || c3');
function visit375_74_2(result) {
  _$jscoverage['/editor/range.js'].branchData['74'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['74'][1].init(485, 14, 'c1 || c2 || c3');
function visit374_74_1(result) {
  _$jscoverage['/editor/range.js'].branchData['74'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['71'][2].init(156, 39, 'node.nodeType == Dom.NodeType.TEXT_NODE');
function visit373_71_2(result) {
  _$jscoverage['/editor/range.js'].branchData['71'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['71'][1].init(156, 66, 'node.nodeType == Dom.NodeType.TEXT_NODE && !S.trim(node.nodeValue)');
function visit372_71_1(result) {
  _$jscoverage['/editor/range.js'].branchData['71'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['68'][2].init(154, 39, 'node.nodeType != Dom.NodeType.TEXT_NODE');
function visit371_68_2(result) {
  _$jscoverage['/editor/range.js'].branchData['68'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['68'][1].init(154, 98, 'node.nodeType != Dom.NodeType.TEXT_NODE && Dom.nodeName(node) in dtd.$removeEmpty');
function visit370_68_1(result) {
  _$jscoverage['/editor/range.js'].branchData['68'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].lineData[9]++;
KISSY.add("editor/range", function(S, Editor, Utils, Walker, ElementPath) {
  _$jscoverage['/editor/range.js'].functionData[0]++;
  _$jscoverage['/editor/range.js'].lineData[14]++;
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
  _$jscoverage['/editor/range.js'].lineData[28]++;
  var TRUE = true, FALSE = false, NULL = null, KER = Editor.RangeType, KEP = Editor.PositionType, Dom = S.DOM, UA = S.UA, dtd = Editor.XHTML_DTD, Node = S.Node, $ = Node.all, UN_REMOVABLE = {
  'td': 1}, EMPTY = {
  "area": 1, 
  "base": 1, 
  "br": 1, 
  "col": 1, 
  "hr": 1, 
  "img": 1, 
  "input": 1, 
  "link": 1, 
  "meta": 1, 
  "param": 1};
  _$jscoverage['/editor/range.js'].lineData[48]++;
  var isWhitespace = new Walker.whitespaces(), isBookmark = new Walker.bookmark(), isNotWhitespaces = Walker.whitespaces(TRUE), isNotBookmarks = Walker.bookmark(false, true);
  _$jscoverage['/editor/range.js'].lineData[53]++;
  var inlineChildReqElements = {
  "abbr": 1, 
  "acronym": 1, 
  "b": 1, 
  "bdo": 1, 
  "big": 1, 
  "cite": 1, 
  "code": 1, 
  "del": 1, 
  "dfn": 1, 
  "em": 1, 
  "font": 1, 
  "i": 1, 
  "ins": 1, 
  "label": 1, 
  "kbd": 1, 
  "q": 1, 
  "samp": 1, 
  "small": 1, 
  "span": 1, 
  "strike": 1, 
  "strong": 1, 
  "sub": 1, 
  "sup": 1, 
  "tt": 1, 
  "u": 1, 
  'var': 1};
  _$jscoverage['/editor/range.js'].lineData[64]++;
  function elementBoundaryEval(node) {
    _$jscoverage['/editor/range.js'].functionData[1]++;
    _$jscoverage['/editor/range.js'].lineData[68]++;
    var c1 = visit370_68_1(visit371_68_2(node.nodeType != Dom.NodeType.TEXT_NODE) && Dom.nodeName(node) in dtd.$removeEmpty), c2 = visit372_71_1(visit373_71_2(node.nodeType == Dom.NodeType.TEXT_NODE) && !S.trim(node.nodeValue)), c3 = !!node.parentNode.getAttribute('_ke_bookmark');
    _$jscoverage['/editor/range.js'].lineData[74]++;
    return visit374_74_1(c1 || visit375_74_2(c2 || c3));
  }
  _$jscoverage['/editor/range.js'].lineData[77]++;
  function nonWhitespaceOrIsBookmark(node) {
    _$jscoverage['/editor/range.js'].functionData[2]++;
    _$jscoverage['/editor/range.js'].lineData[79]++;
    return visit376_79_1(!isWhitespace(node) && !isBookmark(node));
  }
  _$jscoverage['/editor/range.js'].lineData[82]++;
  function getCheckStartEndBlockEvalFunction(isStart) {
    _$jscoverage['/editor/range.js'].functionData[3]++;
    _$jscoverage['/editor/range.js'].lineData[83]++;
    var hadBr = FALSE;
    _$jscoverage['/editor/range.js'].lineData[84]++;
    return function(node) {
  _$jscoverage['/editor/range.js'].functionData[4]++;
  _$jscoverage['/editor/range.js'].lineData[86]++;
  if (visit377_86_1(isBookmark(node))) {
    _$jscoverage['/editor/range.js'].lineData[87]++;
    return TRUE;
  }
  _$jscoverage['/editor/range.js'].lineData[89]++;
  if (visit378_89_1(node.nodeType == Dom.NodeType.TEXT_NODE)) {
    _$jscoverage['/editor/range.js'].lineData[91]++;
    if (visit379_91_1(S.trim(node.nodeValue).length)) {
      _$jscoverage['/editor/range.js'].lineData[92]++;
      return FALSE;
    }
  } else {
    _$jscoverage['/editor/range.js'].lineData[94]++;
    if (visit380_94_1(node.nodeType == Dom.NodeType.ELEMENT_NODE)) {
      _$jscoverage['/editor/range.js'].lineData[95]++;
      var nodeName = Dom.nodeName(node);
      _$jscoverage['/editor/range.js'].lineData[98]++;
      if (visit381_98_1(!inlineChildReqElements[nodeName])) {
        _$jscoverage['/editor/range.js'].lineData[101]++;
        if (visit382_101_1(!isStart && visit383_101_2(!UA['ie'] && visit384_101_3(visit385_101_4(nodeName == 'br') && !hadBr)))) {
          _$jscoverage['/editor/range.js'].lineData[102]++;
          hadBr = TRUE;
        } else {
          _$jscoverage['/editor/range.js'].lineData[104]++;
          return FALSE;
        }
      }
    }
  }
  _$jscoverage['/editor/range.js'].lineData[108]++;
  return TRUE;
};
  }
  _$jscoverage['/editor/range.js'].lineData[121]++;
  function execContentsAction(self, action) {
    _$jscoverage['/editor/range.js'].functionData[5]++;
    _$jscoverage['/editor/range.js'].lineData[122]++;
    var startNode = self.startContainer, endNode = self.endContainer, startOffset = self.startOffset, endOffset = self.endOffset, removeStartNode, hasSplitStart = FALSE, hasSplitEnd = FALSE, t, docFrag = undefined, doc = self.document, removeEndNode;
    _$jscoverage['/editor/range.js'].lineData[134]++;
    if (visit386_134_1(action > 0)) {
      _$jscoverage['/editor/range.js'].lineData[135]++;
      docFrag = doc.createDocumentFragment();
    }
    _$jscoverage['/editor/range.js'].lineData[138]++;
    if (visit387_138_1(self.collapsed)) {
      _$jscoverage['/editor/range.js'].lineData[139]++;
      return docFrag;
    }
    _$jscoverage['/editor/range.js'].lineData[143]++;
    self.optimizeBookmark();
    _$jscoverage['/editor/range.js'].lineData[151]++;
    if (visit388_151_1(endNode[0].nodeType == Dom.NodeType.TEXT_NODE)) {
      _$jscoverage['/editor/range.js'].lineData[152]++;
      hasSplitEnd = TRUE;
      _$jscoverage['/editor/range.js'].lineData[153]++;
      endNode = endNode._4e_splitText(endOffset);
    } else {
      _$jscoverage['/editor/range.js'].lineData[157]++;
      if (visit389_157_1(endNode[0].childNodes.length > 0)) {
        _$jscoverage['/editor/range.js'].lineData[159]++;
        if (visit390_159_1(endOffset >= endNode[0].childNodes.length)) {
          _$jscoverage['/editor/range.js'].lineData[161]++;
          endNode = new Node(endNode[0].appendChild(doc.createTextNode("")));
          _$jscoverage['/editor/range.js'].lineData[164]++;
          removeEndNode = TRUE;
        } else {
          _$jscoverage['/editor/range.js'].lineData[166]++;
          endNode = new Node(endNode[0].childNodes[endOffset]);
        }
      }
    }
    _$jscoverage['/editor/range.js'].lineData[175]++;
    if (visit391_175_1(startNode[0].nodeType == Dom.NodeType.TEXT_NODE)) {
      _$jscoverage['/editor/range.js'].lineData[176]++;
      hasSplitStart = TRUE;
      _$jscoverage['/editor/range.js'].lineData[177]++;
      startNode._4e_splitText(startOffset);
    } else {
      _$jscoverage['/editor/range.js'].lineData[184]++;
      if (visit392_184_1(!startOffset)) {
        _$jscoverage['/editor/range.js'].lineData[186]++;
        t = new Node(doc.createTextNode(""));
        _$jscoverage['/editor/range.js'].lineData[187]++;
        startNode.prepend(t);
        _$jscoverage['/editor/range.js'].lineData[188]++;
        startNode = t;
        _$jscoverage['/editor/range.js'].lineData[189]++;
        removeStartNode = TRUE;
      } else {
        _$jscoverage['/editor/range.js'].lineData[191]++;
        if (visit393_191_1(startOffset >= startNode[0].childNodes.length)) {
          _$jscoverage['/editor/range.js'].lineData[193]++;
          startNode = new Node(startNode[0].appendChild(doc.createTextNode('')));
          _$jscoverage['/editor/range.js'].lineData[195]++;
          removeStartNode = TRUE;
        } else {
          _$jscoverage['/editor/range.js'].lineData[197]++;
          startNode = new Node(startNode[0].childNodes[startOffset].previousSibling);
        }
      }
    }
    _$jscoverage['/editor/range.js'].lineData[204]++;
    var startParents = startNode._4e_parents(), endParents = endNode._4e_parents();
    _$jscoverage['/editor/range.js'].lineData[207]++;
    startParents.each(function(n, i) {
  _$jscoverage['/editor/range.js'].functionData[6]++;
  _$jscoverage['/editor/range.js'].lineData[208]++;
  startParents[i] = n;
});
    _$jscoverage['/editor/range.js'].lineData[211]++;
    endParents.each(function(n, i) {
  _$jscoverage['/editor/range.js'].functionData[7]++;
  _$jscoverage['/editor/range.js'].lineData[212]++;
  endParents[i] = n;
});
    _$jscoverage['/editor/range.js'].lineData[217]++;
    var i, topStart, topEnd;
    _$jscoverage['/editor/range.js'].lineData[219]++;
    for (i = 0; visit394_219_1(i < startParents.length); i++) {
      _$jscoverage['/editor/range.js'].lineData[220]++;
      topStart = startParents[i];
      _$jscoverage['/editor/range.js'].lineData[221]++;
      topEnd = endParents[i];
      _$jscoverage['/editor/range.js'].lineData[227]++;
      if (visit395_227_1(!topStart.equals(topEnd))) {
        _$jscoverage['/editor/range.js'].lineData[228]++;
        break;
      }
    }
    _$jscoverage['/editor/range.js'].lineData[232]++;
    var clone = docFrag, levelStartNode, levelClone, currentNode, currentSibling;
    _$jscoverage['/editor/range.js'].lineData[240]++;
    for (var j = i; visit396_240_1(j < startParents.length); j++) {
      _$jscoverage['/editor/range.js'].lineData[241]++;
      levelStartNode = startParents[j];
      _$jscoverage['/editor/range.js'].lineData[244]++;
      if (visit397_244_1(visit398_244_2(action > 0) && !levelStartNode.equals(startNode))) {
        _$jscoverage['/editor/range.js'].lineData[246]++;
        levelClone = clone.appendChild(levelStartNode.clone()[0]);
      } else {
        _$jscoverage['/editor/range.js'].lineData[248]++;
        levelClone = null;
      }
      _$jscoverage['/editor/range.js'].lineData[252]++;
      currentNode = levelStartNode[0].nextSibling;
      _$jscoverage['/editor/range.js'].lineData[254]++;
      var endParentJ = endParents[j], domEndNode = endNode[0], domEndParentJ = visit399_256_1(endParentJ && endParentJ[0]);
      _$jscoverage['/editor/range.js'].lineData[258]++;
      while (currentNode) {
        _$jscoverage['/editor/range.js'].lineData[261]++;
        if (visit400_261_1(visit401_261_2(domEndParentJ == currentNode) || visit402_261_3(domEndNode == currentNode))) {
          _$jscoverage['/editor/range.js'].lineData[262]++;
          break;
        }
        _$jscoverage['/editor/range.js'].lineData[266]++;
        currentSibling = currentNode.nextSibling;
        _$jscoverage['/editor/range.js'].lineData[269]++;
        if (visit403_269_1(action == 2)) {
          _$jscoverage['/editor/range.js'].lineData[271]++;
          clone.appendChild(currentNode.cloneNode(TRUE));
        } else {
          _$jscoverage['/editor/range.js'].lineData[276]++;
          if (visit404_276_1(UN_REMOVABLE[currentNode.nodeName.toLowerCase()])) {
            _$jscoverage['/editor/range.js'].lineData[277]++;
            var tmp = currentNode.cloneNode(TRUE);
            _$jscoverage['/editor/range.js'].lineData[278]++;
            currentNode.innerHTML = '';
            _$jscoverage['/editor/range.js'].lineData[279]++;
            currentNode = tmp;
          } else {
            _$jscoverage['/editor/range.js'].lineData[282]++;
            Dom._4e_remove(currentNode);
          }
          _$jscoverage['/editor/range.js'].lineData[286]++;
          if (visit405_286_1(action == 1)) {
            _$jscoverage['/editor/range.js'].lineData[288]++;
            clone.appendChild(currentNode);
          }
        }
        _$jscoverage['/editor/range.js'].lineData[292]++;
        currentNode = currentSibling;
      }
      _$jscoverage['/editor/range.js'].lineData[295]++;
      if (visit406_295_1(levelClone)) {
        _$jscoverage['/editor/range.js'].lineData[296]++;
        clone = levelClone;
      }
    }
    _$jscoverage['/editor/range.js'].lineData[300]++;
    clone = docFrag;
    _$jscoverage['/editor/range.js'].lineData[304]++;
    for (var k = i; visit407_304_1(k < endParents.length); k++) {
      _$jscoverage['/editor/range.js'].lineData[305]++;
      levelStartNode = endParents[k];
      _$jscoverage['/editor/range.js'].lineData[308]++;
      if (visit408_308_1(visit409_308_2(action > 0) && !levelStartNode.equals(endNode))) {
        _$jscoverage['/editor/range.js'].lineData[311]++;
        levelClone = clone.appendChild(levelStartNode.clone()[0]);
      } else {
        _$jscoverage['/editor/range.js'].lineData[313]++;
        levelClone = null;
      }
      _$jscoverage['/editor/range.js'].lineData[317]++;
      if (visit410_318_1(!startParents[k] || !levelStartNode._4e_sameLevel(startParents[k]))) {
        _$jscoverage['/editor/range.js'].lineData[322]++;
        currentNode = levelStartNode[0].previousSibling;
        _$jscoverage['/editor/range.js'].lineData[323]++;
        while (currentNode) {
          _$jscoverage['/editor/range.js'].lineData[325]++;
          currentSibling = currentNode.previousSibling;
          _$jscoverage['/editor/range.js'].lineData[328]++;
          if (visit411_328_1(action == 2)) {
            _$jscoverage['/editor/range.js'].lineData[329]++;
            clone.insertBefore(currentNode.cloneNode(TRUE), clone.firstChild);
          } else {
            _$jscoverage['/editor/range.js'].lineData[333]++;
            Dom._4e_remove(currentNode);
            _$jscoverage['/editor/range.js'].lineData[336]++;
            if (visit412_336_1(action == 1)) {
              _$jscoverage['/editor/range.js'].lineData[338]++;
              clone.insertBefore(currentNode, clone.firstChild);
            }
          }
          _$jscoverage['/editor/range.js'].lineData[342]++;
          currentNode = currentSibling;
        }
      }
      _$jscoverage['/editor/range.js'].lineData[346]++;
      if (visit413_346_1(levelClone)) {
        _$jscoverage['/editor/range.js'].lineData[347]++;
        clone = levelClone;
      }
    }
    _$jscoverage['/editor/range.js'].lineData[351]++;
    if (visit414_351_1(action == 2)) {
      _$jscoverage['/editor/range.js'].lineData[355]++;
      if (visit415_355_1(hasSplitStart)) {
        _$jscoverage['/editor/range.js'].lineData[356]++;
        var startTextNode = startNode[0];
        _$jscoverage['/editor/range.js'].lineData[357]++;
        if (visit416_357_1(visit417_357_2(startTextNode.nodeType == Dom.NodeType.TEXT_NODE) && visit418_358_1(startTextNode.nextSibling && visit419_360_1(startTextNode.nextSibling.nodeType == Dom.NodeType.TEXT_NODE)))) {
          _$jscoverage['/editor/range.js'].lineData[361]++;
          startTextNode.data += startTextNode.nextSibling.data;
          _$jscoverage['/editor/range.js'].lineData[362]++;
          startTextNode.parentNode.removeChild(startTextNode.nextSibling);
        }
      }
      _$jscoverage['/editor/range.js'].lineData[366]++;
      if (visit420_366_1(hasSplitEnd)) {
        _$jscoverage['/editor/range.js'].lineData[367]++;
        var endTextNode = endNode[0];
        _$jscoverage['/editor/range.js'].lineData[368]++;
        if (visit421_368_1(visit422_368_2(endTextNode.nodeType == Dom.NodeType.TEXT_NODE) && visit423_369_1(endTextNode.previousSibling && visit424_370_1(endTextNode.previousSibling.nodeType == Dom.NodeType.TEXT_NODE)))) {
          _$jscoverage['/editor/range.js'].lineData[371]++;
          endTextNode.previousSibling.data += endTextNode.data;
          _$jscoverage['/editor/range.js'].lineData[372]++;
          endTextNode.parentNode.removeChild(endTextNode);
        }
      }
    } else {
      _$jscoverage['/editor/range.js'].lineData[382]++;
      if (visit425_383_1(topStart && visit426_383_2(topEnd && (visit427_385_1(!startNode._4e_sameLevel(topStart) || !endNode._4e_sameLevel(topEnd)))))) {
        _$jscoverage['/editor/range.js'].lineData[389]++;
        var startIndex = topStart._4e_index();
        _$jscoverage['/editor/range.js'].lineData[393]++;
        if (visit428_393_1(removeStartNode && (topStart._4e_sameLevel(startNode)))) {
          _$jscoverage['/editor/range.js'].lineData[396]++;
          startIndex--;
        }
        _$jscoverage['/editor/range.js'].lineData[399]++;
        self.setStart(topStart.parent(), startIndex + 1);
      }
      _$jscoverage['/editor/range.js'].lineData[403]++;
      self.collapse(TRUE);
    }
    _$jscoverage['/editor/range.js'].lineData[408]++;
    if (visit429_408_1(removeStartNode)) {
      _$jscoverage['/editor/range.js'].lineData[409]++;
      startNode.remove();
    }
    _$jscoverage['/editor/range.js'].lineData[412]++;
    if (visit430_412_1(removeEndNode)) {
      _$jscoverage['/editor/range.js'].lineData[413]++;
      endNode.remove();
    }
    _$jscoverage['/editor/range.js'].lineData[416]++;
    return docFrag;
  }
  _$jscoverage['/editor/range.js'].lineData[419]++;
  function updateCollapsed(self) {
    _$jscoverage['/editor/range.js'].functionData[8]++;
    _$jscoverage['/editor/range.js'].lineData[420]++;
    self.collapsed = (visit431_421_1(self.startContainer && visit432_422_1(self.endContainer && visit433_423_1(visit434_423_2(self.startContainer[0] == self.endContainer[0]) && visit435_424_1(self.startOffset == self.endOffset)))));
  }
  _$jscoverage['/editor/range.js'].lineData[435]++;
  function KERange(document) {
    _$jscoverage['/editor/range.js'].functionData[9]++;
    _$jscoverage['/editor/range.js'].lineData[436]++;
    var self = this;
    _$jscoverage['/editor/range.js'].lineData[437]++;
    self.startContainer = NULL;
    _$jscoverage['/editor/range.js'].lineData[438]++;
    self.startOffset = NULL;
    _$jscoverage['/editor/range.js'].lineData[439]++;
    self.endContainer = NULL;
    _$jscoverage['/editor/range.js'].lineData[440]++;
    self.endOffset = NULL;
    _$jscoverage['/editor/range.js'].lineData[441]++;
    self.collapsed = TRUE;
    _$jscoverage['/editor/range.js'].lineData[442]++;
    self.document = document;
  }
  _$jscoverage['/editor/range.js'].lineData[445]++;
  S.augment(KERange, {
  toString: function() {
  _$jscoverage['/editor/range.js'].functionData[10]++;
  _$jscoverage['/editor/range.js'].lineData[451]++;
  var s = [], self = this, startContainer = self.startContainer[0], endContainer = self.endContainer[0];
  _$jscoverage['/editor/range.js'].lineData[455]++;
  s.push((visit436_455_1(startContainer.id || startContainer.nodeName)) + ":" + self.startOffset);
  _$jscoverage['/editor/range.js'].lineData[456]++;
  s.push((visit437_456_1(endContainer.id || endContainer.nodeName)) + ":" + self.endOffset);
  _$jscoverage['/editor/range.js'].lineData[457]++;
  return s.join("<br/>");
}, 
  optimize: function() {
  _$jscoverage['/editor/range.js'].functionData[11]++;
  _$jscoverage['/editor/range.js'].lineData[467]++;
  var self = this, container = self.startContainer, offset = self.startOffset;
  _$jscoverage['/editor/range.js'].lineData[471]++;
  if (visit438_471_1(container[0].nodeType != Dom.NodeType.ELEMENT_NODE)) {
    _$jscoverage['/editor/range.js'].lineData[472]++;
    if (visit439_472_1(!offset)) {
      _$jscoverage['/editor/range.js'].lineData[473]++;
      self.setStartBefore(container);
    } else {
      _$jscoverage['/editor/range.js'].lineData[474]++;
      if (visit440_474_1(offset >= container[0].nodeValue.length)) {
        _$jscoverage['/editor/range.js'].lineData[475]++;
        self.setStartAfter(container);
      }
    }
  }
  _$jscoverage['/editor/range.js'].lineData[479]++;
  container = self.endContainer;
  _$jscoverage['/editor/range.js'].lineData[480]++;
  offset = self.endOffset;
  _$jscoverage['/editor/range.js'].lineData[482]++;
  if (visit441_482_1(container[0].nodeType != Dom.NodeType.ELEMENT_NODE)) {
    _$jscoverage['/editor/range.js'].lineData[483]++;
    if (visit442_483_1(!offset)) {
      _$jscoverage['/editor/range.js'].lineData[484]++;
      self.setEndBefore(container);
    } else {
      _$jscoverage['/editor/range.js'].lineData[485]++;
      if (visit443_485_1(offset >= container[0].nodeValue.length)) {
        _$jscoverage['/editor/range.js'].lineData[486]++;
        self.setEndAfter(container);
      }
    }
  }
}, 
  setStartAfter: function(node) {
  _$jscoverage['/editor/range.js'].functionData[12]++;
  _$jscoverage['/editor/range.js'].lineData[496]++;
  this.setStart(node.parent(), node._4e_index() + 1);
}, 
  setStartBefore: function(node) {
  _$jscoverage['/editor/range.js'].functionData[13]++;
  _$jscoverage['/editor/range.js'].lineData[503]++;
  this.setStart(node.parent(), node._4e_index());
}, 
  setEndAfter: function(node) {
  _$jscoverage['/editor/range.js'].functionData[14]++;
  _$jscoverage['/editor/range.js'].lineData[510]++;
  this.setEnd(node.parent(), node._4e_index() + 1);
}, 
  setEndBefore: function(node) {
  _$jscoverage['/editor/range.js'].functionData[15]++;
  _$jscoverage['/editor/range.js'].lineData[517]++;
  this.setEnd(node.parent(), node._4e_index());
}, 
  optimizeBookmark: function() {
  _$jscoverage['/editor/range.js'].functionData[16]++;
  _$jscoverage['/editor/range.js'].lineData[524]++;
  var self = this, startNode = self.startContainer, endNode = self.endContainer;
  _$jscoverage['/editor/range.js'].lineData[528]++;
  if (visit444_528_1(startNode && visit445_529_1(visit446_529_2(startNode.nodeName() == 'span') && startNode.attr('_ke_bookmark')))) {
    _$jscoverage['/editor/range.js'].lineData[531]++;
    self.setStartBefore(startNode);
  }
  _$jscoverage['/editor/range.js'].lineData[533]++;
  if (visit447_533_1(endNode && visit448_534_1(visit449_534_2(endNode.nodeName() == 'span') && endNode.attr('_ke_bookmark')))) {
    _$jscoverage['/editor/range.js'].lineData[536]++;
    self.setEndAfter(endNode);
  }
}, 
  setStart: function(startNode, startOffset) {
  _$jscoverage['/editor/range.js'].functionData[17]++;
  _$jscoverage['/editor/range.js'].lineData[554]++;
  var self = this;
  _$jscoverage['/editor/range.js'].lineData[555]++;
  if (visit450_555_1(visit451_555_2(startNode[0].nodeType == Dom.NodeType.ELEMENT_NODE) && EMPTY[startNode.nodeName()])) {
    _$jscoverage['/editor/range.js'].lineData[556]++;
    startNode = startNode.parent();
    _$jscoverage['/editor/range.js'].lineData[557]++;
    startOffset = startNode._4e_index();
  }
  _$jscoverage['/editor/range.js'].lineData[560]++;
  self.startContainer = startNode;
  _$jscoverage['/editor/range.js'].lineData[561]++;
  self.startOffset = startOffset;
  _$jscoverage['/editor/range.js'].lineData[563]++;
  if (visit452_563_1(!self.endContainer)) {
    _$jscoverage['/editor/range.js'].lineData[564]++;
    self.endContainer = startNode;
    _$jscoverage['/editor/range.js'].lineData[565]++;
    self.endOffset = startOffset;
  }
  _$jscoverage['/editor/range.js'].lineData[568]++;
  updateCollapsed(self);
}, 
  setEnd: function(endNode, endOffset) {
  _$jscoverage['/editor/range.js'].functionData[18]++;
  _$jscoverage['/editor/range.js'].lineData[585]++;
  var self = this;
  _$jscoverage['/editor/range.js'].lineData[586]++;
  if (visit453_586_1(visit454_586_2(endNode[0].nodeType == Dom.NodeType.ELEMENT_NODE) && EMPTY[endNode.nodeName()])) {
    _$jscoverage['/editor/range.js'].lineData[587]++;
    endNode = endNode.parent();
    _$jscoverage['/editor/range.js'].lineData[588]++;
    endOffset = endNode._4e_index() + 1;
  }
  _$jscoverage['/editor/range.js'].lineData[591]++;
  self.endContainer = endNode;
  _$jscoverage['/editor/range.js'].lineData[592]++;
  self.endOffset = endOffset;
  _$jscoverage['/editor/range.js'].lineData[594]++;
  if (visit455_594_1(!self.startContainer)) {
    _$jscoverage['/editor/range.js'].lineData[595]++;
    self.startContainer = endNode;
    _$jscoverage['/editor/range.js'].lineData[596]++;
    self.startOffset = endOffset;
  }
  _$jscoverage['/editor/range.js'].lineData[599]++;
  updateCollapsed(self);
}, 
  setStartAt: function(node, position) {
  _$jscoverage['/editor/range.js'].functionData[19]++;
  _$jscoverage['/editor/range.js'].lineData[608]++;
  var self = this;
  _$jscoverage['/editor/range.js'].lineData[609]++;
  switch (position) {
    case KER.POSITION_AFTER_START:
      _$jscoverage['/editor/range.js'].lineData[611]++;
      self.setStart(node, 0);
      _$jscoverage['/editor/range.js'].lineData[612]++;
      break;
    case KER.POSITION_BEFORE_END:
      _$jscoverage['/editor/range.js'].lineData[615]++;
      if (visit456_615_1(node[0].nodeType == Dom.NodeType.TEXT_NODE)) {
        _$jscoverage['/editor/range.js'].lineData[616]++;
        self.setStart(node, node[0].nodeValue.length);
      } else {
        _$jscoverage['/editor/range.js'].lineData[618]++;
        self.setStart(node, node[0].childNodes.length);
      }
      _$jscoverage['/editor/range.js'].lineData[620]++;
      break;
    case KER.POSITION_BEFORE_START:
      _$jscoverage['/editor/range.js'].lineData[623]++;
      self.setStartBefore(node);
      _$jscoverage['/editor/range.js'].lineData[624]++;
      break;
    case KER.POSITION_AFTER_END:
      _$jscoverage['/editor/range.js'].lineData[627]++;
      self.setStartAfter(node);
  }
  _$jscoverage['/editor/range.js'].lineData[630]++;
  updateCollapsed(self);
}, 
  setEndAt: function(node, position) {
  _$jscoverage['/editor/range.js'].functionData[20]++;
  _$jscoverage['/editor/range.js'].lineData[639]++;
  var self = this;
  _$jscoverage['/editor/range.js'].lineData[640]++;
  switch (position) {
    case KER.POSITION_AFTER_START:
      _$jscoverage['/editor/range.js'].lineData[642]++;
      self.setEnd(node, 0);
      _$jscoverage['/editor/range.js'].lineData[643]++;
      break;
    case KER.POSITION_BEFORE_END:
      _$jscoverage['/editor/range.js'].lineData[646]++;
      if (visit457_646_1(node[0].nodeType == Dom.NodeType.TEXT_NODE)) {
        _$jscoverage['/editor/range.js'].lineData[647]++;
        self.setEnd(node, node[0].nodeValue.length);
      } else {
        _$jscoverage['/editor/range.js'].lineData[649]++;
        self.setEnd(node, node[0].childNodes.length);
      }
      _$jscoverage['/editor/range.js'].lineData[651]++;
      break;
    case KER.POSITION_BEFORE_START:
      _$jscoverage['/editor/range.js'].lineData[654]++;
      self.setEndBefore(node);
      _$jscoverage['/editor/range.js'].lineData[655]++;
      break;
    case KER.POSITION_AFTER_END:
      _$jscoverage['/editor/range.js'].lineData[658]++;
      self.setEndAfter(node);
  }
  _$jscoverage['/editor/range.js'].lineData[661]++;
  updateCollapsed(self);
}, 
  cloneContents: function() {
  _$jscoverage['/editor/range.js'].functionData[21]++;
  _$jscoverage['/editor/range.js'].lineData[668]++;
  return execContentsAction(this, 2);
}, 
  deleteContents: function() {
  _$jscoverage['/editor/range.js'].functionData[22]++;
  _$jscoverage['/editor/range.js'].lineData[675]++;
  return execContentsAction(this, 0);
}, 
  extractContents: function() {
  _$jscoverage['/editor/range.js'].functionData[23]++;
  _$jscoverage['/editor/range.js'].lineData[682]++;
  return execContentsAction(this, 1);
}, 
  collapse: function(toStart) {
  _$jscoverage['/editor/range.js'].functionData[24]++;
  _$jscoverage['/editor/range.js'].lineData[690]++;
  var self = this;
  _$jscoverage['/editor/range.js'].lineData[691]++;
  if (visit458_691_1(toStart)) {
    _$jscoverage['/editor/range.js'].lineData[692]++;
    self.endContainer = self.startContainer;
    _$jscoverage['/editor/range.js'].lineData[693]++;
    self.endOffset = self.startOffset;
  } else {
    _$jscoverage['/editor/range.js'].lineData[695]++;
    self.startContainer = self.endContainer;
    _$jscoverage['/editor/range.js'].lineData[696]++;
    self.startOffset = self.endOffset;
  }
  _$jscoverage['/editor/range.js'].lineData[698]++;
  self.collapsed = TRUE;
}, 
  clone: function() {
  _$jscoverage['/editor/range.js'].functionData[25]++;
  _$jscoverage['/editor/range.js'].lineData[706]++;
  var self = this, clone = new KERange(self.document);
  _$jscoverage['/editor/range.js'].lineData[709]++;
  clone.startContainer = self.startContainer;
  _$jscoverage['/editor/range.js'].lineData[710]++;
  clone.startOffset = self.startOffset;
  _$jscoverage['/editor/range.js'].lineData[711]++;
  clone.endContainer = self.endContainer;
  _$jscoverage['/editor/range.js'].lineData[712]++;
  clone.endOffset = self.endOffset;
  _$jscoverage['/editor/range.js'].lineData[713]++;
  clone.collapsed = self.collapsed;
  _$jscoverage['/editor/range.js'].lineData[715]++;
  return clone;
}, 
  getEnclosedNode: function() {
  _$jscoverage['/editor/range.js'].functionData[26]++;
  _$jscoverage['/editor/range.js'].lineData[728]++;
  var walkerRange = this.clone();
  _$jscoverage['/editor/range.js'].lineData[731]++;
  walkerRange.optimize();
  _$jscoverage['/editor/range.js'].lineData[733]++;
  if (visit459_733_1(visit460_733_2(walkerRange.startContainer[0].nodeType != Dom.NodeType.ELEMENT_NODE) || visit461_734_1(walkerRange.endContainer[0].nodeType != Dom.NodeType.ELEMENT_NODE))) {
    _$jscoverage['/editor/range.js'].lineData[735]++;
    return NULL;
  }
  _$jscoverage['/editor/range.js'].lineData[738]++;
  var walker = new Walker(walkerRange), node, pre;
  _$jscoverage['/editor/range.js'].lineData[741]++;
  walker.evaluator = function(node) {
  _$jscoverage['/editor/range.js'].functionData[27]++;
  _$jscoverage['/editor/range.js'].lineData[742]++;
  return visit462_742_1(isNotWhitespaces(node) && isNotBookmarks(node));
};
  _$jscoverage['/editor/range.js'].lineData[749]++;
  node = walker.next();
  _$jscoverage['/editor/range.js'].lineData[750]++;
  walker.reset();
  _$jscoverage['/editor/range.js'].lineData[751]++;
  pre = walker.previous();
  _$jscoverage['/editor/range.js'].lineData[753]++;
  return visit463_753_1(node && node.equals(pre)) ? node : NULL;
}, 
  shrink: function(mode, selectContents) {
  _$jscoverage['/editor/range.js'].functionData[28]++;
  _$jscoverage['/editor/range.js'].lineData[763]++;
  var self = this;
  _$jscoverage['/editor/range.js'].lineData[764]++;
  if (visit464_764_1(!self.collapsed)) {
    _$jscoverage['/editor/range.js'].lineData[765]++;
    mode = visit465_765_1(mode || KER.SHRINK_TEXT);
    _$jscoverage['/editor/range.js'].lineData[767]++;
    var walkerRange = self.clone(), startContainer = self.startContainer, endContainer = self.endContainer, startOffset = self.startOffset, endOffset = self.endOffset, moveStart = TRUE, currentElement, walker, moveEnd = TRUE;
    _$jscoverage['/editor/range.js'].lineData[778]++;
    if (visit466_778_1(startContainer && visit467_779_1(startContainer[0].nodeType == Dom.NodeType.TEXT_NODE))) {
      _$jscoverage['/editor/range.js'].lineData[780]++;
      if (visit468_780_1(!startOffset)) {
        _$jscoverage['/editor/range.js'].lineData[781]++;
        walkerRange.setStartBefore(startContainer);
      } else {
        _$jscoverage['/editor/range.js'].lineData[782]++;
        if (visit469_782_1(startOffset >= startContainer[0].nodeValue.length)) {
          _$jscoverage['/editor/range.js'].lineData[783]++;
          walkerRange.setStartAfter(startContainer);
        } else {
          _$jscoverage['/editor/range.js'].lineData[787]++;
          walkerRange.setStartBefore(startContainer);
          _$jscoverage['/editor/range.js'].lineData[788]++;
          moveStart = FALSE;
        }
      }
    }
    _$jscoverage['/editor/range.js'].lineData[792]++;
    if (visit470_792_1(endContainer && visit471_793_1(endContainer[0].nodeType == Dom.NodeType.TEXT_NODE))) {
      _$jscoverage['/editor/range.js'].lineData[794]++;
      if (visit472_794_1(!endOffset)) {
        _$jscoverage['/editor/range.js'].lineData[795]++;
        walkerRange.setEndBefore(endContainer);
      } else {
        _$jscoverage['/editor/range.js'].lineData[796]++;
        if (visit473_796_1(endOffset >= endContainer[0].nodeValue.length)) {
          _$jscoverage['/editor/range.js'].lineData[797]++;
          walkerRange.setEndAfter(endContainer);
        } else {
          _$jscoverage['/editor/range.js'].lineData[799]++;
          walkerRange.setEndAfter(endContainer);
          _$jscoverage['/editor/range.js'].lineData[800]++;
          moveEnd = FALSE;
        }
      }
    }
    _$jscoverage['/editor/range.js'].lineData[804]++;
    if (visit474_804_1(moveStart || moveEnd)) {
      _$jscoverage['/editor/range.js'].lineData[806]++;
      walker = new Walker(walkerRange);
      _$jscoverage['/editor/range.js'].lineData[808]++;
      walker.evaluator = function(node) {
  _$jscoverage['/editor/range.js'].functionData[29]++;
  _$jscoverage['/editor/range.js'].lineData[809]++;
  return visit475_809_1(node.nodeType == (visit476_809_2(mode == KER.SHRINK_ELEMENT) ? Dom.NodeType.ELEMENT_NODE : Dom.NodeType.TEXT_NODE));
};
      _$jscoverage['/editor/range.js'].lineData[813]++;
      walker.guard = function(node, movingOut) {
  _$jscoverage['/editor/range.js'].functionData[30]++;
  _$jscoverage['/editor/range.js'].lineData[815]++;
  if (visit477_815_1(visit478_815_2(mode == KER.SHRINK_ELEMENT) && visit479_816_1(node.nodeType == Dom.NodeType.TEXT_NODE))) {
    _$jscoverage['/editor/range.js'].lineData[817]++;
    return FALSE;
  }
  _$jscoverage['/editor/range.js'].lineData[820]++;
  if (visit480_820_1(movingOut && visit481_820_2(node == currentElement))) {
    _$jscoverage['/editor/range.js'].lineData[821]++;
    return FALSE;
  }
  _$jscoverage['/editor/range.js'].lineData[823]++;
  if (visit482_823_1(!movingOut && visit483_823_2(node.nodeType == Dom.NodeType.ELEMENT_NODE))) {
    _$jscoverage['/editor/range.js'].lineData[824]++;
    currentElement = node;
  }
  _$jscoverage['/editor/range.js'].lineData[826]++;
  return TRUE;
};
    }
    _$jscoverage['/editor/range.js'].lineData[831]++;
    if (visit484_831_1(moveStart)) {
      _$jscoverage['/editor/range.js'].lineData[832]++;
      var textStart = walker[visit485_832_1(mode == KER.SHRINK_ELEMENT) ? 'lastForward' : 'next']();
      _$jscoverage['/editor/range.js'].lineData[833]++;
      if (visit486_833_1(textStart)) {
        _$jscoverage['/editor/range.js'].lineData[834]++;
        self.setStartAt(textStart, selectContents ? KER.POSITION_AFTER_START : KER.POSITION_BEFORE_START);
      }
    }
    _$jscoverage['/editor/range.js'].lineData[838]++;
    if (visit487_838_1(moveEnd)) {
      _$jscoverage['/editor/range.js'].lineData[839]++;
      walker.reset();
      _$jscoverage['/editor/range.js'].lineData[840]++;
      var textEnd = walker[visit488_840_1(mode == KER.SHRINK_ELEMENT) ? 'lastBackward' : 'previous']();
      _$jscoverage['/editor/range.js'].lineData[841]++;
      if (visit489_841_1(textEnd)) {
        _$jscoverage['/editor/range.js'].lineData[842]++;
        self.setEndAt(textEnd, selectContents ? KER.POSITION_BEFORE_END : KER.POSITION_AFTER_END);
      }
    }
    _$jscoverage['/editor/range.js'].lineData[846]++;
    return visit490_846_1(moveStart || moveEnd);
  }
}, 
  createBookmark2: function(normalized) {
  _$jscoverage['/editor/range.js'].functionData[31]++;
  _$jscoverage['/editor/range.js'].lineData[856]++;
  var self = this, startContainer = self.startContainer, endContainer = self.endContainer, startOffset = self.startOffset, endOffset = self.endOffset, child, previous;
  _$jscoverage['/editor/range.js'].lineData[866]++;
  if (visit491_866_1(!startContainer || !endContainer)) {
    _$jscoverage['/editor/range.js'].lineData[867]++;
    return {
  start: 0, 
  end: 0};
  }
  _$jscoverage['/editor/range.js'].lineData[873]++;
  if (visit492_873_1(normalized)) {
    _$jscoverage['/editor/range.js'].lineData[876]++;
    if (visit493_876_1(startContainer[0].nodeType == Dom.NodeType.ELEMENT_NODE)) {
      _$jscoverage['/editor/range.js'].lineData[877]++;
      child = new Node(startContainer[0].childNodes[startOffset]);
      _$jscoverage['/editor/range.js'].lineData[881]++;
      if (visit494_881_1(child && visit495_881_2(child[0] && visit496_881_3(visit497_881_4(child[0].nodeType == Dom.NodeType.TEXT_NODE) && visit498_882_1(visit499_882_2(startOffset > 0) && visit500_882_3(child[0].previousSibling.nodeType == Dom.NodeType.TEXT_NODE)))))) {
        _$jscoverage['/editor/range.js'].lineData[883]++;
        startContainer = child;
        _$jscoverage['/editor/range.js'].lineData[884]++;
        startOffset = 0;
      }
    }
    _$jscoverage['/editor/range.js'].lineData[890]++;
    while (visit501_890_1(visit502_890_2(startContainer[0].nodeType == Dom.NodeType.TEXT_NODE) && visit503_891_1((previous = startContainer.prev(undefined, 1)) && visit504_892_1(previous[0].nodeType == Dom.NodeType.TEXT_NODE)))) {
      _$jscoverage['/editor/range.js'].lineData[893]++;
      startContainer = previous;
      _$jscoverage['/editor/range.js'].lineData[894]++;
      startOffset += previous[0].nodeValue.length;
    }
    _$jscoverage['/editor/range.js'].lineData[898]++;
    if (visit505_898_1(!self.collapsed)) {
      _$jscoverage['/editor/range.js'].lineData[901]++;
      if (visit506_901_1(endContainer[0].nodeType == Dom.NodeType.ELEMENT_NODE)) {
        _$jscoverage['/editor/range.js'].lineData[902]++;
        child = new Node(endContainer[0].childNodes[endOffset]);
        _$jscoverage['/editor/range.js'].lineData[906]++;
        if (visit507_906_1(child && visit508_906_2(child[0] && visit509_907_1(visit510_907_2(child[0].nodeType == Dom.NodeType.TEXT_NODE) && visit511_907_3(visit512_907_4(endOffset > 0) && visit513_908_1(child[0].previousSibling.nodeType == Dom.NodeType.TEXT_NODE)))))) {
          _$jscoverage['/editor/range.js'].lineData[909]++;
          endContainer = child;
          _$jscoverage['/editor/range.js'].lineData[910]++;
          endOffset = 0;
        }
      }
      _$jscoverage['/editor/range.js'].lineData[915]++;
      while (visit514_915_1(visit515_915_2(endContainer[0].nodeType == Dom.NodeType.TEXT_NODE) && visit516_916_1((previous = endContainer.prev(undefined, 1)) && visit517_917_1(previous[0].nodeType == Dom.NodeType.TEXT_NODE)))) {
        _$jscoverage['/editor/range.js'].lineData[918]++;
        endContainer = previous;
        _$jscoverage['/editor/range.js'].lineData[919]++;
        endOffset += previous[0].nodeValue.length;
      }
    }
  }
  _$jscoverage['/editor/range.js'].lineData[924]++;
  return {
  start: startContainer._4e_address(normalized), 
  end: self.collapsed ? NULL : endContainer._4e_address(normalized), 
  startOffset: startOffset, 
  endOffset: endOffset, 
  normalized: normalized, 
  is2: TRUE};
}, 
  createBookmark: function(serializable) {
  _$jscoverage['/editor/range.js'].functionData[32]++;
  _$jscoverage['/editor/range.js'].lineData[938]++;
  var startNode, endNode, baseId, clone, self = this, collapsed = self.collapsed;
  _$jscoverage['/editor/range.js'].lineData[944]++;
  startNode = new Node("<span>", NULL, self.document);
  _$jscoverage['/editor/range.js'].lineData[945]++;
  startNode.attr('_ke_bookmark', 1);
  _$jscoverage['/editor/range.js'].lineData[946]++;
  startNode.css('display', 'none');
  _$jscoverage['/editor/range.js'].lineData[950]++;
  startNode.html('&nbsp;');
  _$jscoverage['/editor/range.js'].lineData[952]++;
  if (visit518_952_1(serializable)) {
    _$jscoverage['/editor/range.js'].lineData[953]++;
    baseId = S.guid('ke_bm_');
    _$jscoverage['/editor/range.js'].lineData[954]++;
    startNode.attr('id', baseId + 'S');
  }
  _$jscoverage['/editor/range.js'].lineData[958]++;
  if (visit519_958_1(!collapsed)) {
    _$jscoverage['/editor/range.js'].lineData[959]++;
    endNode = startNode.clone();
    _$jscoverage['/editor/range.js'].lineData[960]++;
    endNode.html('&nbsp;');
    _$jscoverage['/editor/range.js'].lineData[962]++;
    if (visit520_962_1(serializable)) {
      _$jscoverage['/editor/range.js'].lineData[963]++;
      endNode.attr('id', baseId + 'E');
    }
    _$jscoverage['/editor/range.js'].lineData[966]++;
    clone = self.clone();
    _$jscoverage['/editor/range.js'].lineData[967]++;
    clone.collapse();
    _$jscoverage['/editor/range.js'].lineData[968]++;
    clone.insertNode(endNode);
  }
  _$jscoverage['/editor/range.js'].lineData[971]++;
  clone = self.clone();
  _$jscoverage['/editor/range.js'].lineData[972]++;
  clone.collapse(TRUE);
  _$jscoverage['/editor/range.js'].lineData[973]++;
  clone.insertNode(startNode);
  _$jscoverage['/editor/range.js'].lineData[976]++;
  if (visit521_976_1(endNode)) {
    _$jscoverage['/editor/range.js'].lineData[977]++;
    self.setStartAfter(startNode);
    _$jscoverage['/editor/range.js'].lineData[978]++;
    self.setEndBefore(endNode);
  } else {
    _$jscoverage['/editor/range.js'].lineData[980]++;
    self.moveToPosition(startNode, KER.POSITION_AFTER_END);
  }
  _$jscoverage['/editor/range.js'].lineData[983]++;
  return {
  startNode: serializable ? baseId + 'S' : startNode, 
  endNode: serializable ? baseId + 'E' : endNode, 
  serializable: serializable, 
  collapsed: collapsed};
}, 
  moveToPosition: function(node, position) {
  _$jscoverage['/editor/range.js'].functionData[33]++;
  _$jscoverage['/editor/range.js'].lineData[997]++;
  var self = this;
  _$jscoverage['/editor/range.js'].lineData[998]++;
  self.setStartAt(node, position);
  _$jscoverage['/editor/range.js'].lineData[999]++;
  self.collapse(TRUE);
}, 
  trim: function(ignoreStart, ignoreEnd) {
  _$jscoverage['/editor/range.js'].functionData[34]++;
  _$jscoverage['/editor/range.js'].lineData[1008]++;
  var self = this, startContainer = self.startContainer, startOffset = self.startOffset, collapsed = self.collapsed;
  _$jscoverage['/editor/range.js'].lineData[1013]++;
  if (visit522_1013_1((visit523_1013_2(!ignoreStart || collapsed)) && visit524_1014_1(startContainer[0] && visit525_1015_1(startContainer[0].nodeType == Dom.NodeType.TEXT_NODE)))) {
    _$jscoverage['/editor/range.js'].lineData[1018]++;
    if (visit526_1018_1(!startOffset)) {
      _$jscoverage['/editor/range.js'].lineData[1019]++;
      startOffset = startContainer._4e_index();
      _$jscoverage['/editor/range.js'].lineData[1020]++;
      startContainer = startContainer.parent();
    } else {
      _$jscoverage['/editor/range.js'].lineData[1024]++;
      if (visit527_1024_1(startOffset >= startContainer[0].nodeValue.length)) {
        _$jscoverage['/editor/range.js'].lineData[1025]++;
        startOffset = startContainer._4e_index() + 1;
        _$jscoverage['/editor/range.js'].lineData[1026]++;
        startContainer = startContainer.parent();
      } else {
        _$jscoverage['/editor/range.js'].lineData[1031]++;
        var nextText = startContainer._4e_splitText(startOffset);
        _$jscoverage['/editor/range.js'].lineData[1033]++;
        startOffset = startContainer._4e_index() + 1;
        _$jscoverage['/editor/range.js'].lineData[1034]++;
        startContainer = startContainer.parent();
        _$jscoverage['/editor/range.js'].lineData[1037]++;
        if (visit528_1037_1(Dom.equals(self.startContainer, self.endContainer))) {
          _$jscoverage['/editor/range.js'].lineData[1038]++;
          self.setEnd(nextText, self.endOffset - self.startOffset);
        } else {
          _$jscoverage['/editor/range.js'].lineData[1039]++;
          if (visit529_1039_1(Dom.equals(startContainer, self.endContainer))) {
            _$jscoverage['/editor/range.js'].lineData[1040]++;
            self.endOffset += 1;
          }
        }
      }
    }
    _$jscoverage['/editor/range.js'].lineData[1044]++;
    self.setStart(startContainer, startOffset);
    _$jscoverage['/editor/range.js'].lineData[1046]++;
    if (visit530_1046_1(collapsed)) {
      _$jscoverage['/editor/range.js'].lineData[1047]++;
      self.collapse(TRUE);
      _$jscoverage['/editor/range.js'].lineData[1048]++;
      return;
    }
  }
  _$jscoverage['/editor/range.js'].lineData[1052]++;
  var endContainer = self.endContainer, endOffset = self.endOffset;
  _$jscoverage['/editor/range.js'].lineData[1055]++;
  if (visit531_1055_1(!(visit532_1055_2(ignoreEnd || collapsed)) && visit533_1056_1(endContainer[0] && visit534_1056_2(endContainer[0].nodeType == Dom.NodeType.TEXT_NODE)))) {
    _$jscoverage['/editor/range.js'].lineData[1059]++;
    if (visit535_1059_1(!endOffset)) {
      _$jscoverage['/editor/range.js'].lineData[1060]++;
      endOffset = endContainer._4e_index();
      _$jscoverage['/editor/range.js'].lineData[1061]++;
      endContainer = endContainer.parent();
    } else {
      _$jscoverage['/editor/range.js'].lineData[1065]++;
      if (visit536_1065_1(endOffset >= endContainer[0].nodeValue.length)) {
        _$jscoverage['/editor/range.js'].lineData[1066]++;
        endOffset = endContainer._4e_index() + 1;
        _$jscoverage['/editor/range.js'].lineData[1067]++;
        endContainer = endContainer.parent();
      } else {
        _$jscoverage['/editor/range.js'].lineData[1072]++;
        endContainer._4e_splitText(endOffset);
        _$jscoverage['/editor/range.js'].lineData[1074]++;
        endOffset = endContainer._4e_index() + 1;
        _$jscoverage['/editor/range.js'].lineData[1075]++;
        endContainer = endContainer.parent();
      }
    }
    _$jscoverage['/editor/range.js'].lineData[1078]++;
    self.setEnd(endContainer, endOffset);
  }
}, 
  insertNode: function(node) {
  _$jscoverage['/editor/range.js'].functionData[35]++;
  _$jscoverage['/editor/range.js'].lineData[1086]++;
  var self = this;
  _$jscoverage['/editor/range.js'].lineData[1087]++;
  self.optimizeBookmark();
  _$jscoverage['/editor/range.js'].lineData[1088]++;
  self.trim(FALSE, TRUE);
  _$jscoverage['/editor/range.js'].lineData[1089]++;
  var startContainer = self.startContainer, startOffset = self.startOffset, nextNode = visit537_1091_1(startContainer[0].childNodes[startOffset] || null);
  _$jscoverage['/editor/range.js'].lineData[1093]++;
  startContainer[0].insertBefore(node[0], nextNode);
  _$jscoverage['/editor/range.js'].lineData[1095]++;
  if (visit538_1095_1(startContainer[0] == self.endContainer[0])) {
    _$jscoverage['/editor/range.js'].lineData[1096]++;
    self.endOffset++;
  }
  _$jscoverage['/editor/range.js'].lineData[1099]++;
  self.setStartBefore(node);
}, 
  moveToBookmark: function(bookmark) {
  _$jscoverage['/editor/range.js'].functionData[36]++;
  _$jscoverage['/editor/range.js'].lineData[1107]++;
  var self = this, doc = $(self.document);
  _$jscoverage['/editor/range.js'].lineData[1109]++;
  if (visit539_1109_1(bookmark.is2)) {
    _$jscoverage['/editor/range.js'].lineData[1111]++;
    var startContainer = doc._4e_getByAddress(bookmark.start, bookmark.normalized), startOffset = bookmark.startOffset, endContainer = visit540_1113_1(bookmark.end && doc._4e_getByAddress(bookmark.end, bookmark.normalized)), endOffset = bookmark.endOffset;
    _$jscoverage['/editor/range.js'].lineData[1117]++;
    self.setStart(startContainer, startOffset);
    _$jscoverage['/editor/range.js'].lineData[1120]++;
    if (visit541_1120_1(endContainer)) {
      _$jscoverage['/editor/range.js'].lineData[1121]++;
      self.setEnd(endContainer, endOffset);
    } else {
      _$jscoverage['/editor/range.js'].lineData[1123]++;
      self.collapse(TRUE);
    }
  } else {
    _$jscoverage['/editor/range.js'].lineData[1127]++;
    var serializable = bookmark.serializable, startNode = serializable ? S.one("#" + bookmark.startNode, doc) : bookmark.startNode, endNode = serializable ? S.one("#" + bookmark.endNode, doc) : bookmark.endNode;
    _$jscoverage['/editor/range.js'].lineData[1134]++;
    self.setStartBefore(startNode);
    _$jscoverage['/editor/range.js'].lineData[1137]++;
    startNode._4e_remove();
    _$jscoverage['/editor/range.js'].lineData[1141]++;
    if (visit542_1141_1(endNode && endNode[0])) {
      _$jscoverage['/editor/range.js'].lineData[1142]++;
      self.setEndBefore(endNode);
      _$jscoverage['/editor/range.js'].lineData[1143]++;
      endNode._4e_remove();
    } else {
      _$jscoverage['/editor/range.js'].lineData[1145]++;
      self.collapse(TRUE);
    }
  }
}, 
  getCommonAncestor: function(includeSelf, ignoreTextNode) {
  _$jscoverage['/editor/range.js'].functionData[37]++;
  _$jscoverage['/editor/range.js'].lineData[1156]++;
  var self = this, start = self.startContainer, end = self.endContainer, ancestor;
  _$jscoverage['/editor/range.js'].lineData[1161]++;
  if (visit543_1161_1(start[0] == end[0])) {
    _$jscoverage['/editor/range.js'].lineData[1162]++;
    if (visit544_1162_1(includeSelf && visit545_1163_1(visit546_1163_2(start[0].nodeType == Dom.NodeType.ELEMENT_NODE) && visit547_1164_1(self.startOffset == self.endOffset - 1)))) {
      _$jscoverage['/editor/range.js'].lineData[1165]++;
      ancestor = new Node(start[0].childNodes[self.startOffset]);
    } else {
      _$jscoverage['/editor/range.js'].lineData[1167]++;
      ancestor = start;
    }
  } else {
    _$jscoverage['/editor/range.js'].lineData[1170]++;
    ancestor = start._4e_commonAncestor(end);
  }
  _$jscoverage['/editor/range.js'].lineData[1173]++;
  return visit548_1173_1(ignoreTextNode && visit549_1173_2(ancestor[0].nodeType == Dom.NodeType.TEXT_NODE)) ? ancestor.parent() : ancestor;
}, 
  enlarge: (function() {
  _$jscoverage['/editor/range.js'].functionData[38]++;
  _$jscoverage['/editor/range.js'].lineData[1189]++;
  function enlargeElement(self, left, stop, commonAncestor) {
    _$jscoverage['/editor/range.js'].functionData[39]++;
    _$jscoverage['/editor/range.js'].lineData[1190]++;
    var container = self[left ? 'startContainer' : 'endContainer'], enlarge, sibling, index = left ? 0 : 1, commonReached = 0, direction = left ? "previousSibling" : "nextSibling", offset = self[left ? 'startOffset' : 'endOffset'];
    _$jscoverage['/editor/range.js'].lineData[1198]++;
    if (visit550_1198_1(container[0].nodeType == Dom.NodeType.TEXT_NODE)) {
      _$jscoverage['/editor/range.js'].lineData[1199]++;
      if (visit551_1199_1(left)) {
        _$jscoverage['/editor/range.js'].lineData[1201]++;
        if (visit552_1201_1(offset)) {
          _$jscoverage['/editor/range.js'].lineData[1202]++;
          return;
        }
      } else {
        _$jscoverage['/editor/range.js'].lineData[1205]++;
        if (visit553_1205_1(offset < container[0].nodeValue.length)) {
          _$jscoverage['/editor/range.js'].lineData[1206]++;
          return;
        }
      }
      _$jscoverage['/editor/range.js'].lineData[1211]++;
      sibling = container[0][direction];
      _$jscoverage['/editor/range.js'].lineData[1213]++;
      enlarge = container[0].parentNode;
    } else {
      _$jscoverage['/editor/range.js'].lineData[1216]++;
      sibling = visit554_1216_1(container[0].childNodes[offset + (left ? -1 : 1)] || null);
      _$jscoverage['/editor/range.js'].lineData[1218]++;
      enlarge = container[0];
    }
    _$jscoverage['/editor/range.js'].lineData[1221]++;
    while (enlarge) {
      _$jscoverage['/editor/range.js'].lineData[1223]++;
      while (sibling) {
        _$jscoverage['/editor/range.js'].lineData[1224]++;
        if (visit555_1224_1(isWhitespace(sibling) || isBookmark(sibling))) {
          _$jscoverage['/editor/range.js'].lineData[1225]++;
          sibling = sibling[direction];
        } else {
          _$jscoverage['/editor/range.js'].lineData[1227]++;
          break;
        }
      }
      _$jscoverage['/editor/range.js'].lineData[1232]++;
      if (visit556_1232_1(sibling)) {
        _$jscoverage['/editor/range.js'].lineData[1234]++;
        if (visit557_1234_1(!commonReached)) {
          _$jscoverage['/editor/range.js'].lineData[1236]++;
          self[left ? 'setStartAfter' : 'setEndBefore']($(sibling));
        }
        _$jscoverage['/editor/range.js'].lineData[1238]++;
        return;
      }
      _$jscoverage['/editor/range.js'].lineData[1245]++;
      enlarge = $(enlarge);
      _$jscoverage['/editor/range.js'].lineData[1247]++;
      if (visit558_1247_1(enlarge.nodeName() == "body")) {
        _$jscoverage['/editor/range.js'].lineData[1248]++;
        return;
      }
      _$jscoverage['/editor/range.js'].lineData[1251]++;
      if (visit559_1251_1(commonReached || enlarge.equals(commonAncestor))) {
        _$jscoverage['/editor/range.js'].lineData[1252]++;
        stop[index] = enlarge;
        _$jscoverage['/editor/range.js'].lineData[1253]++;
        commonReached = 1;
      } else {
        _$jscoverage['/editor/range.js'].lineData[1256]++;
        self[left ? 'setStartBefore' : 'setEndAfter'](enlarge);
      }
      _$jscoverage['/editor/range.js'].lineData[1259]++;
      sibling = enlarge[0][direction];
      _$jscoverage['/editor/range.js'].lineData[1260]++;
      enlarge = enlarge[0].parentNode;
    }
  }
  _$jscoverage['/editor/range.js'].lineData[1265]++;
  return function(unit) {
  _$jscoverage['/editor/range.js'].functionData[40]++;
  _$jscoverage['/editor/range.js'].lineData[1266]++;
  var self = this;
  _$jscoverage['/editor/range.js'].lineData[1267]++;
  switch (unit) {
    case KER.ENLARGE_ELEMENT:
      _$jscoverage['/editor/range.js'].lineData[1270]++;
      if (visit560_1270_1(self.collapsed)) {
        _$jscoverage['/editor/range.js'].lineData[1271]++;
        return;
      }
      _$jscoverage['/editor/range.js'].lineData[1274]++;
      var commonAncestor = self.getCommonAncestor(), stop = [];
      _$jscoverage['/editor/range.js'].lineData[1277]++;
      enlargeElement(self, 1, stop, commonAncestor);
      _$jscoverage['/editor/range.js'].lineData[1278]++;
      enlargeElement(self, 0, stop, commonAncestor);
      _$jscoverage['/editor/range.js'].lineData[1280]++;
      if (visit561_1280_1(stop[0] && stop[1])) {
        _$jscoverage['/editor/range.js'].lineData[1281]++;
        var commonStop = stop[0].contains(stop[1]) ? stop[1] : stop[0];
        _$jscoverage['/editor/range.js'].lineData[1282]++;
        self.setStartBefore(commonStop);
        _$jscoverage['/editor/range.js'].lineData[1283]++;
        self.setEndAfter(commonStop);
      }
      _$jscoverage['/editor/range.js'].lineData[1286]++;
      break;
    case KER.ENLARGE_BLOCK_CONTENTS:
    case KER.ENLARGE_LIST_ITEM_CONTENTS:
      _$jscoverage['/editor/range.js'].lineData[1292]++;
      var walkerRange = new KERange(self.document);
      _$jscoverage['/editor/range.js'].lineData[1293]++;
      var body = new Node(self.document.body);
      _$jscoverage['/editor/range.js'].lineData[1295]++;
      walkerRange.setStartAt(body, KER.POSITION_AFTER_START);
      _$jscoverage['/editor/range.js'].lineData[1296]++;
      walkerRange.setEnd(self.startContainer, self.startOffset);
      _$jscoverage['/editor/range.js'].lineData[1298]++;
      var walker = new Walker(walkerRange), blockBoundary, tailBr, defaultGuard = Walker.blockBoundary((visit562_1302_1(unit == KER.ENLARGE_LIST_ITEM_CONTENTS)) ? {
  br: 1} : NULL), boundaryGuard = function(node) {
  _$jscoverage['/editor/range.js'].functionData[41]++;
  _$jscoverage['/editor/range.js'].lineData[1306]++;
  var retVal = defaultGuard(node);
  _$jscoverage['/editor/range.js'].lineData[1307]++;
  if (visit563_1307_1(!retVal)) {
    _$jscoverage['/editor/range.js'].lineData[1308]++;
    blockBoundary = $(node);
  }
  _$jscoverage['/editor/range.js'].lineData[1310]++;
  return retVal;
}, tailBrGuard = function(node) {
  _$jscoverage['/editor/range.js'].functionData[42]++;
  _$jscoverage['/editor/range.js'].lineData[1314]++;
  var retVal = boundaryGuard(node);
  _$jscoverage['/editor/range.js'].lineData[1315]++;
  if (visit564_1315_1(!retVal && visit565_1315_2(Dom.nodeName(node) == 'br'))) {
    _$jscoverage['/editor/range.js'].lineData[1316]++;
    tailBr = $(node);
  }
  _$jscoverage['/editor/range.js'].lineData[1318]++;
  return retVal;
};
      _$jscoverage['/editor/range.js'].lineData[1321]++;
      walker.guard = boundaryGuard;
      _$jscoverage['/editor/range.js'].lineData[1323]++;
      enlargeable = walker.lastBackward();
      _$jscoverage['/editor/range.js'].lineData[1326]++;
      blockBoundary = visit566_1326_1(blockBoundary || body);
      _$jscoverage['/editor/range.js'].lineData[1330]++;
      self.setStartAt(blockBoundary, visit567_1332_1(visit568_1332_2(blockBoundary.nodeName() != 'br') && (visit569_1340_1(visit570_1340_2(!enlargeable && self.checkStartOfBlock()) || visit571_1341_1(enlargeable && blockBoundary.contains(enlargeable))))) ? KER.POSITION_AFTER_START : KER.POSITION_AFTER_END);
      _$jscoverage['/editor/range.js'].lineData[1346]++;
      walkerRange = self.clone();
      _$jscoverage['/editor/range.js'].lineData[1347]++;
      walkerRange.collapse();
      _$jscoverage['/editor/range.js'].lineData[1348]++;
      walkerRange.setEndAt(body, KER.POSITION_BEFORE_END);
      _$jscoverage['/editor/range.js'].lineData[1349]++;
      walker = new Walker(walkerRange);
      _$jscoverage['/editor/range.js'].lineData[1352]++;
      walker.guard = (visit572_1352_1(unit == KER.ENLARGE_LIST_ITEM_CONTENTS)) ? tailBrGuard : boundaryGuard;
      _$jscoverage['/editor/range.js'].lineData[1354]++;
      blockBoundary = NULL;
      _$jscoverage['/editor/range.js'].lineData[1357]++;
      var enlargeable = walker.lastForward();
      _$jscoverage['/editor/range.js'].lineData[1360]++;
      blockBoundary = visit573_1360_1(blockBoundary || body);
      _$jscoverage['/editor/range.js'].lineData[1364]++;
      self.setEndAt(blockBoundary, (visit574_1366_1(visit575_1366_2(!enlargeable && self.checkEndOfBlock()) || visit576_1367_1(enlargeable && blockBoundary.contains(enlargeable)))) ? KER.POSITION_BEFORE_END : KER.POSITION_BEFORE_START);
      _$jscoverage['/editor/range.js'].lineData[1372]++;
      if (visit577_1372_1(tailBr)) {
        _$jscoverage['/editor/range.js'].lineData[1373]++;
        self.setEndAfter(tailBr);
      }
  }
};
})(), 
  checkStartOfBlock: function() {
  _$jscoverage['/editor/range.js'].functionData[43]++;
  _$jscoverage['/editor/range.js'].lineData[1384]++;
  var self = this, startContainer = self.startContainer, startOffset = self.startOffset;
  _$jscoverage['/editor/range.js'].lineData[1390]++;
  if (visit578_1390_1(startOffset && visit579_1390_2(startContainer[0].nodeType == Dom.NodeType.TEXT_NODE))) {
    _$jscoverage['/editor/range.js'].lineData[1391]++;
    var textBefore = S.trim(startContainer[0].nodeValue.substring(0, startOffset));
    _$jscoverage['/editor/range.js'].lineData[1392]++;
    if (visit580_1392_1(textBefore.length)) {
      _$jscoverage['/editor/range.js'].lineData[1393]++;
      return FALSE;
    }
  }
  _$jscoverage['/editor/range.js'].lineData[1400]++;
  self.trim();
  _$jscoverage['/editor/range.js'].lineData[1404]++;
  var path = new ElementPath(self.startContainer);
  _$jscoverage['/editor/range.js'].lineData[1407]++;
  var walkerRange = self.clone();
  _$jscoverage['/editor/range.js'].lineData[1408]++;
  walkerRange.collapse(TRUE);
  _$jscoverage['/editor/range.js'].lineData[1409]++;
  walkerRange.setStartAt(visit581_1409_1(path.block || path.blockLimit), KER.POSITION_AFTER_START);
  _$jscoverage['/editor/range.js'].lineData[1411]++;
  var walker = new Walker(walkerRange);
  _$jscoverage['/editor/range.js'].lineData[1412]++;
  walker.evaluator = getCheckStartEndBlockEvalFunction(TRUE);
  _$jscoverage['/editor/range.js'].lineData[1414]++;
  return walker.checkBackward();
}, 
  checkEndOfBlock: function() {
  _$jscoverage['/editor/range.js'].functionData[44]++;
  _$jscoverage['/editor/range.js'].lineData[1422]++;
  var self = this, endContainer = self.endContainer, endOffset = self.endOffset;
  _$jscoverage['/editor/range.js'].lineData[1427]++;
  if (visit582_1427_1(endContainer[0].nodeType == Dom.NodeType.TEXT_NODE)) {
    _$jscoverage['/editor/range.js'].lineData[1428]++;
    var textAfter = S.trim(endContainer[0].nodeValue.substring(endOffset));
    _$jscoverage['/editor/range.js'].lineData[1429]++;
    if (visit583_1429_1(textAfter.length)) {
      _$jscoverage['/editor/range.js'].lineData[1430]++;
      return FALSE;
    }
  }
  _$jscoverage['/editor/range.js'].lineData[1437]++;
  self.trim();
  _$jscoverage['/editor/range.js'].lineData[1441]++;
  var path = new ElementPath(self.endContainer);
  _$jscoverage['/editor/range.js'].lineData[1444]++;
  var walkerRange = self.clone();
  _$jscoverage['/editor/range.js'].lineData[1445]++;
  walkerRange.collapse(FALSE);
  _$jscoverage['/editor/range.js'].lineData[1446]++;
  walkerRange.setEndAt(visit584_1446_1(path.block || path.blockLimit), KER.POSITION_BEFORE_END);
  _$jscoverage['/editor/range.js'].lineData[1448]++;
  var walker = new Walker(walkerRange);
  _$jscoverage['/editor/range.js'].lineData[1449]++;
  walker.evaluator = getCheckStartEndBlockEvalFunction(FALSE);
  _$jscoverage['/editor/range.js'].lineData[1451]++;
  return walker.checkForward();
}, 
  checkBoundaryOfElement: function(element, checkType) {
  _$jscoverage['/editor/range.js'].functionData[45]++;
  _$jscoverage['/editor/range.js'].lineData[1460]++;
  var walkerRange = this.clone();
  _$jscoverage['/editor/range.js'].lineData[1464]++;
  walkerRange[visit585_1462_1(checkType == KER.START) ? 'setStartAt' : 'setEndAt'](element, visit586_1464_1(checkType == KER.START) ? KER.POSITION_AFTER_START : KER.POSITION_BEFORE_END);
  _$jscoverage['/editor/range.js'].lineData[1468]++;
  var walker = new Walker(walkerRange);
  _$jscoverage['/editor/range.js'].lineData[1470]++;
  walker.evaluator = elementBoundaryEval;
  _$jscoverage['/editor/range.js'].lineData[1471]++;
  return walker[visit587_1471_1(checkType == KER.START) ? 'checkBackward' : 'checkForward']();
}, 
  getBoundaryNodes: function() {
  _$jscoverage['/editor/range.js'].functionData[46]++;
  _$jscoverage['/editor/range.js'].lineData[1480]++;
  var self = this, startNode = self.startContainer, endNode = self.endContainer, startOffset = self.startOffset, endOffset = self.endOffset, childCount;
  _$jscoverage['/editor/range.js'].lineData[1487]++;
  if (visit588_1487_1(startNode[0].nodeType == Dom.NodeType.ELEMENT_NODE)) {
    _$jscoverage['/editor/range.js'].lineData[1488]++;
    childCount = startNode[0].childNodes.length;
    _$jscoverage['/editor/range.js'].lineData[1489]++;
    if (visit589_1489_1(childCount > startOffset)) {
      _$jscoverage['/editor/range.js'].lineData[1490]++;
      startNode = $(startNode[0].childNodes[startOffset]);
    } else {
      _$jscoverage['/editor/range.js'].lineData[1491]++;
      if (visit590_1491_1(childCount == 0)) {
        _$jscoverage['/editor/range.js'].lineData[1493]++;
        startNode = startNode._4e_previousSourceNode();
      } else {
        _$jscoverage['/editor/range.js'].lineData[1497]++;
        startNode = startNode[0];
        _$jscoverage['/editor/range.js'].lineData[1498]++;
        while (startNode.lastChild) {
          _$jscoverage['/editor/range.js'].lineData[1499]++;
          startNode = startNode.lastChild;
        }
        _$jscoverage['/editor/range.js'].lineData[1502]++;
        startNode = $(startNode);
        _$jscoverage['/editor/range.js'].lineData[1507]++;
        startNode = visit591_1507_1(startNode._4e_nextSourceNode() || startNode);
      }
    }
  }
  _$jscoverage['/editor/range.js'].lineData[1511]++;
  if (visit592_1511_1(endNode[0].nodeType == Dom.NodeType.ELEMENT_NODE)) {
    _$jscoverage['/editor/range.js'].lineData[1512]++;
    childCount = endNode[0].childNodes.length;
    _$jscoverage['/editor/range.js'].lineData[1513]++;
    if (visit593_1513_1(childCount > endOffset)) {
      _$jscoverage['/editor/range.js'].lineData[1514]++;
      endNode = $(endNode[0].childNodes[endOffset])._4e_previousSourceNode(TRUE);
    } else {
      _$jscoverage['/editor/range.js'].lineData[1517]++;
      if (visit594_1517_1(childCount == 0)) {
        _$jscoverage['/editor/range.js'].lineData[1518]++;
        endNode = endNode._4e_previousSourceNode();
      } else {
        _$jscoverage['/editor/range.js'].lineData[1522]++;
        endNode = endNode[0];
        _$jscoverage['/editor/range.js'].lineData[1523]++;
        while (endNode.lastChild) {
          _$jscoverage['/editor/range.js'].lineData[1524]++;
          endNode = endNode.lastChild;
        }
        _$jscoverage['/editor/range.js'].lineData[1525]++;
        endNode = $(endNode);
      }
    }
  }
  _$jscoverage['/editor/range.js'].lineData[1531]++;
  if (visit595_1531_1(startNode._4e_position(endNode) & KEP.POSITION_FOLLOWING)) {
    _$jscoverage['/editor/range.js'].lineData[1532]++;
    startNode = endNode;
  }
  _$jscoverage['/editor/range.js'].lineData[1535]++;
  return {
  startNode: startNode, 
  endNode: endNode};
}, 
  fixBlock: function(isStart, blockTag) {
  _$jscoverage['/editor/range.js'].functionData[47]++;
  _$jscoverage['/editor/range.js'].lineData[1546]++;
  var self = this, bookmark = self.createBookmark(), fixedBlock = $(self.document.createElement(blockTag));
  _$jscoverage['/editor/range.js'].lineData[1549]++;
  self.collapse(isStart);
  _$jscoverage['/editor/range.js'].lineData[1550]++;
  self.enlarge(KER.ENLARGE_BLOCK_CONTENTS);
  _$jscoverage['/editor/range.js'].lineData[1551]++;
  fixedBlock[0].appendChild(self.extractContents());
  _$jscoverage['/editor/range.js'].lineData[1552]++;
  fixedBlock._4e_trim();
  _$jscoverage['/editor/range.js'].lineData[1553]++;
  if (visit596_1553_1(!UA['ie'])) {
    _$jscoverage['/editor/range.js'].lineData[1554]++;
    fixedBlock._4e_appendBogus();
  }
  _$jscoverage['/editor/range.js'].lineData[1556]++;
  self.insertNode(fixedBlock);
  _$jscoverage['/editor/range.js'].lineData[1557]++;
  self.moveToBookmark(bookmark);
  _$jscoverage['/editor/range.js'].lineData[1558]++;
  return fixedBlock;
}, 
  splitBlock: function(blockTag) {
  _$jscoverage['/editor/range.js'].functionData[48]++;
  _$jscoverage['/editor/range.js'].lineData[1567]++;
  var self = this, startPath = new ElementPath(self.startContainer), endPath = new ElementPath(self.endContainer), startBlockLimit = startPath.blockLimit, endBlockLimit = endPath.blockLimit, startBlock = startPath.block, endBlock = endPath.block, elementPath = NULL;
  _$jscoverage['/editor/range.js'].lineData[1577]++;
  if (visit597_1577_1(!startBlockLimit.equals(endBlockLimit))) {
    _$jscoverage['/editor/range.js'].lineData[1578]++;
    return NULL;
  }
  _$jscoverage['/editor/range.js'].lineData[1582]++;
  if (visit598_1582_1(blockTag != 'br')) {
    _$jscoverage['/editor/range.js'].lineData[1583]++;
    if (visit599_1583_1(!startBlock)) {
      _$jscoverage['/editor/range.js'].lineData[1584]++;
      startBlock = self.fixBlock(TRUE, blockTag);
      _$jscoverage['/editor/range.js'].lineData[1585]++;
      endBlock = new ElementPath(self.endContainer).block;
    }
    _$jscoverage['/editor/range.js'].lineData[1588]++;
    if (visit600_1588_1(!endBlock)) {
      _$jscoverage['/editor/range.js'].lineData[1589]++;
      endBlock = self.fixBlock(FALSE, blockTag);
    }
  }
  _$jscoverage['/editor/range.js'].lineData[1594]++;
  var isStartOfBlock = visit601_1594_1(startBlock && self.checkStartOfBlock()), isEndOfBlock = visit602_1595_1(endBlock && self.checkEndOfBlock());
  _$jscoverage['/editor/range.js'].lineData[1598]++;
  self.deleteContents();
  _$jscoverage['/editor/range.js'].lineData[1600]++;
  if (visit603_1600_1(startBlock && visit604_1600_2(startBlock[0] == endBlock[0]))) {
    _$jscoverage['/editor/range.js'].lineData[1601]++;
    if (visit605_1601_1(isEndOfBlock)) {
      _$jscoverage['/editor/range.js'].lineData[1602]++;
      elementPath = new ElementPath(self.startContainer);
      _$jscoverage['/editor/range.js'].lineData[1603]++;
      self.moveToPosition(endBlock, KER.POSITION_AFTER_END);
      _$jscoverage['/editor/range.js'].lineData[1604]++;
      endBlock = NULL;
    } else {
      _$jscoverage['/editor/range.js'].lineData[1606]++;
      if (visit606_1606_1(isStartOfBlock)) {
        _$jscoverage['/editor/range.js'].lineData[1607]++;
        elementPath = new ElementPath(self.startContainer);
        _$jscoverage['/editor/range.js'].lineData[1608]++;
        self.moveToPosition(startBlock, KER.POSITION_BEFORE_START);
        _$jscoverage['/editor/range.js'].lineData[1609]++;
        startBlock = NULL;
      } else {
        _$jscoverage['/editor/range.js'].lineData[1612]++;
        endBlock = self.splitElement(startBlock);
        _$jscoverage['/editor/range.js'].lineData[1616]++;
        if (visit607_1616_1(!UA['ie'] && !S.inArray(startBlock.nodeName(), ['ul', 'ol']))) {
          _$jscoverage['/editor/range.js'].lineData[1617]++;
          startBlock._4e_appendBogus();
        }
      }
    }
  }
  _$jscoverage['/editor/range.js'].lineData[1622]++;
  return {
  previousBlock: startBlock, 
  nextBlock: endBlock, 
  wasStartOfBlock: isStartOfBlock, 
  wasEndOfBlock: isEndOfBlock, 
  elementPath: elementPath};
}, 
  splitElement: function(toSplit) {
  _$jscoverage['/editor/range.js'].functionData[49]++;
  _$jscoverage['/editor/range.js'].lineData[1637]++;
  var self = this;
  _$jscoverage['/editor/range.js'].lineData[1638]++;
  if (visit608_1638_1(!self.collapsed)) {
    _$jscoverage['/editor/range.js'].lineData[1639]++;
    return NULL;
  }
  _$jscoverage['/editor/range.js'].lineData[1643]++;
  self.setEndAt(toSplit, KER.POSITION_BEFORE_END);
  _$jscoverage['/editor/range.js'].lineData[1644]++;
  var documentFragment = self.extractContents(), clone = toSplit.clone(FALSE);
  _$jscoverage['/editor/range.js'].lineData[1649]++;
  clone[0].appendChild(documentFragment);
  _$jscoverage['/editor/range.js'].lineData[1651]++;
  clone.insertAfter(toSplit);
  _$jscoverage['/editor/range.js'].lineData[1652]++;
  self.moveToPosition(toSplit, KER.POSITION_AFTER_END);
  _$jscoverage['/editor/range.js'].lineData[1653]++;
  return clone;
}, 
  moveToElementEditablePosition: function(el, isMoveToEnd) {
  _$jscoverage['/editor/range.js'].functionData[50]++;
  _$jscoverage['/editor/range.js'].lineData[1665]++;
  function nextDFS(node, childOnly) {
    _$jscoverage['/editor/range.js'].functionData[51]++;
    _$jscoverage['/editor/range.js'].lineData[1666]++;
    var next;
    _$jscoverage['/editor/range.js'].lineData[1668]++;
    if (visit609_1668_1(visit610_1668_2(node[0].nodeType == Dom.NodeType.ELEMENT_NODE) && node._4e_isEditable())) {
      _$jscoverage['/editor/range.js'].lineData[1670]++;
      next = node[isMoveToEnd ? 'last' : 'first'](nonWhitespaceOrIsBookmark, 1);
    }
    _$jscoverage['/editor/range.js'].lineData[1673]++;
    if (visit611_1673_1(!childOnly && !next)) {
      _$jscoverage['/editor/range.js'].lineData[1674]++;
      next = node[isMoveToEnd ? 'prev' : 'next'](nonWhitespaceOrIsBookmark, 1);
    }
    _$jscoverage['/editor/range.js'].lineData[1677]++;
    return next;
  }
  _$jscoverage['/editor/range.js'].lineData[1680]++;
  var found = 0, self = this;
  _$jscoverage['/editor/range.js'].lineData[1682]++;
  while (el) {
    _$jscoverage['/editor/range.js'].lineData[1684]++;
    if (visit612_1684_1(el[0].nodeType == Dom.NodeType.TEXT_NODE)) {
      _$jscoverage['/editor/range.js'].lineData[1685]++;
      self.moveToPosition(el, isMoveToEnd ? KER.POSITION_AFTER_END : KER.POSITION_BEFORE_START);
      _$jscoverage['/editor/range.js'].lineData[1688]++;
      found = 1;
      _$jscoverage['/editor/range.js'].lineData[1689]++;
      break;
    }
    _$jscoverage['/editor/range.js'].lineData[1693]++;
    if (visit613_1693_1(visit614_1693_2(el[0].nodeType == Dom.NodeType.ELEMENT_NODE) && el._4e_isEditable())) {
      _$jscoverage['/editor/range.js'].lineData[1694]++;
      self.moveToPosition(el, isMoveToEnd ? KER.POSITION_BEFORE_END : KER.POSITION_AFTER_START);
      _$jscoverage['/editor/range.js'].lineData[1697]++;
      found = 1;
    }
    _$jscoverage['/editor/range.js'].lineData[1700]++;
    el = nextDFS(el, found);
  }
  _$jscoverage['/editor/range.js'].lineData[1703]++;
  return !!found;
}, 
  selectNodeContents: function(node) {
  _$jscoverage['/editor/range.js'].functionData[52]++;
  _$jscoverage['/editor/range.js'].lineData[1711]++;
  var self = this, domNode = node[0];
  _$jscoverage['/editor/range.js'].lineData[1712]++;
  self.setStart(node, 0);
  _$jscoverage['/editor/range.js'].lineData[1713]++;
  self.setEnd(node, visit615_1713_1(domNode.nodeType == Dom.NodeType.TEXT_NODE) ? domNode.nodeValue.length : domNode.childNodes.length);
}, 
  insertNodeByDtd: function(element) {
  _$jscoverage['/editor/range.js'].functionData[53]++;
  _$jscoverage['/editor/range.js'].lineData[1723]++;
  var current, self = this, tmpDtd, last, elementName = element['nodeName'](), isBlock = dtd['$block'][elementName];
  _$jscoverage['/editor/range.js'].lineData[1729]++;
  self.deleteContents();
  _$jscoverage['/editor/range.js'].lineData[1730]++;
  if (visit616_1730_1(isBlock)) {
    _$jscoverage['/editor/range.js'].lineData[1731]++;
    current = self.getCommonAncestor(FALSE, TRUE);
    _$jscoverage['/editor/range.js'].lineData[1732]++;
    while (visit617_1732_1((tmpDtd = dtd[current.nodeName()]) && !(visit618_1732_2(tmpDtd && tmpDtd[elementName])))) {
      _$jscoverage['/editor/range.js'].lineData[1733]++;
      var parent = current.parent();
      _$jscoverage['/editor/range.js'].lineData[1736]++;
      if (visit619_1736_1(self.checkStartOfBlock() && self.checkEndOfBlock())) {
        _$jscoverage['/editor/range.js'].lineData[1737]++;
        self.setStartBefore(current);
        _$jscoverage['/editor/range.js'].lineData[1738]++;
        self.collapse(TRUE);
        _$jscoverage['/editor/range.js'].lineData[1739]++;
        current.remove();
      } else {
        _$jscoverage['/editor/range.js'].lineData[1741]++;
        last = current;
      }
      _$jscoverage['/editor/range.js'].lineData[1743]++;
      current = parent;
    }
    _$jscoverage['/editor/range.js'].lineData[1746]++;
    if (visit620_1746_1(last)) {
      _$jscoverage['/editor/range.js'].lineData[1747]++;
      self.splitElement(last);
    }
  }
  _$jscoverage['/editor/range.js'].lineData[1751]++;
  self.insertNode(element);
}});
  _$jscoverage['/editor/range.js'].lineData[1755]++;
  Utils.injectDom({
  _4e_breakParent: function(el, parent) {
  _$jscoverage['/editor/range.js'].functionData[54]++;
  _$jscoverage['/editor/range.js'].lineData[1757]++;
  parent = $(parent);
  _$jscoverage['/editor/range.js'].lineData[1758]++;
  el = $(el);
  _$jscoverage['/editor/range.js'].lineData[1760]++;
  var KERange = Editor.Range, docFrag, range = new KERange(el[0].ownerDocument);
  _$jscoverage['/editor/range.js'].lineData[1766]++;
  range.setStartAfter(el);
  _$jscoverage['/editor/range.js'].lineData[1767]++;
  range.setEndAfter(parent);
  _$jscoverage['/editor/range.js'].lineData[1770]++;
  docFrag = range.extractContents();
  _$jscoverage['/editor/range.js'].lineData[1773]++;
  range.insertNode(el.remove());
  _$jscoverage['/editor/range.js'].lineData[1776]++;
  el.after(docFrag);
}});
  _$jscoverage['/editor/range.js'].lineData[1780]++;
  Editor.Range = KERange;
  _$jscoverage['/editor/range.js'].lineData[1782]++;
  return KERange;
}, {
  requires: ['./base', './utils', './walker', './elementPath', './dom', 'node']});
