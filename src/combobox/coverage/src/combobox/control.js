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
if (! _$jscoverage['/combobox/control.js']) {
  _$jscoverage['/combobox/control.js'] = {};
  _$jscoverage['/combobox/control.js'].lineData = [];
  _$jscoverage['/combobox/control.js'].lineData[6] = 0;
  _$jscoverage['/combobox/control.js'].lineData[7] = 0;
  _$jscoverage['/combobox/control.js'].lineData[8] = 0;
  _$jscoverage['/combobox/control.js'].lineData[9] = 0;
  _$jscoverage['/combobox/control.js'].lineData[10] = 0;
  _$jscoverage['/combobox/control.js'].lineData[11] = 0;
  _$jscoverage['/combobox/control.js'].lineData[13] = 0;
  _$jscoverage['/combobox/control.js'].lineData[15] = 0;
  _$jscoverage['/combobox/control.js'].lineData[24] = 0;
  _$jscoverage['/combobox/control.js'].lineData[30] = 0;
  _$jscoverage['/combobox/control.js'].lineData[41] = 0;
  _$jscoverage['/combobox/control.js'].lineData[44] = 0;
  _$jscoverage['/combobox/control.js'].lineData[54] = 0;
  _$jscoverage['/combobox/control.js'].lineData[56] = 0;
  _$jscoverage['/combobox/control.js'].lineData[58] = 0;
  _$jscoverage['/combobox/control.js'].lineData[59] = 0;
  _$jscoverage['/combobox/control.js'].lineData[61] = 0;
  _$jscoverage['/combobox/control.js'].lineData[66] = 0;
  _$jscoverage['/combobox/control.js'].lineData[67] = 0;
  _$jscoverage['/combobox/control.js'].lineData[68] = 0;
  _$jscoverage['/combobox/control.js'].lineData[77] = 0;
  _$jscoverage['/combobox/control.js'].lineData[79] = 0;
  _$jscoverage['/combobox/control.js'].lineData[80] = 0;
  _$jscoverage['/combobox/control.js'].lineData[81] = 0;
  _$jscoverage['/combobox/control.js'].lineData[82] = 0;
  _$jscoverage['/combobox/control.js'].lineData[85] = 0;
  _$jscoverage['/combobox/control.js'].lineData[87] = 0;
  _$jscoverage['/combobox/control.js'].lineData[88] = 0;
  _$jscoverage['/combobox/control.js'].lineData[89] = 0;
  _$jscoverage['/combobox/control.js'].lineData[95] = 0;
  _$jscoverage['/combobox/control.js'].lineData[97] = 0;
  _$jscoverage['/combobox/control.js'].lineData[105] = 0;
  _$jscoverage['/combobox/control.js'].lineData[115] = 0;
  _$jscoverage['/combobox/control.js'].lineData[120] = 0;
  _$jscoverage['/combobox/control.js'].lineData[124] = 0;
  _$jscoverage['/combobox/control.js'].lineData[125] = 0;
  _$jscoverage['/combobox/control.js'].lineData[127] = 0;
  _$jscoverage['/combobox/control.js'].lineData[128] = 0;
  _$jscoverage['/combobox/control.js'].lineData[129] = 0;
  _$jscoverage['/combobox/control.js'].lineData[131] = 0;
  _$jscoverage['/combobox/control.js'].lineData[132] = 0;
  _$jscoverage['/combobox/control.js'].lineData[134] = 0;
  _$jscoverage['/combobox/control.js'].lineData[137] = 0;
  _$jscoverage['/combobox/control.js'].lineData[138] = 0;
  _$jscoverage['/combobox/control.js'].lineData[139] = 0;
  _$jscoverage['/combobox/control.js'].lineData[140] = 0;
  _$jscoverage['/combobox/control.js'].lineData[145] = 0;
  _$jscoverage['/combobox/control.js'].lineData[147] = 0;
  _$jscoverage['/combobox/control.js'].lineData[148] = 0;
  _$jscoverage['/combobox/control.js'].lineData[149] = 0;
  _$jscoverage['/combobox/control.js'].lineData[151] = 0;
  _$jscoverage['/combobox/control.js'].lineData[152] = 0;
  _$jscoverage['/combobox/control.js'].lineData[157] = 0;
  _$jscoverage['/combobox/control.js'].lineData[159] = 0;
  _$jscoverage['/combobox/control.js'].lineData[160] = 0;
  _$jscoverage['/combobox/control.js'].lineData[161] = 0;
  _$jscoverage['/combobox/control.js'].lineData[162] = 0;
  _$jscoverage['/combobox/control.js'].lineData[163] = 0;
  _$jscoverage['/combobox/control.js'].lineData[164] = 0;
  _$jscoverage['/combobox/control.js'].lineData[165] = 0;
  _$jscoverage['/combobox/control.js'].lineData[168] = 0;
  _$jscoverage['/combobox/control.js'].lineData[172] = 0;
  _$jscoverage['/combobox/control.js'].lineData[173] = 0;
  _$jscoverage['/combobox/control.js'].lineData[178] = 0;
  _$jscoverage['/combobox/control.js'].lineData[180] = 0;
  _$jscoverage['/combobox/control.js'].lineData[181] = 0;
  _$jscoverage['/combobox/control.js'].lineData[182] = 0;
  _$jscoverage['/combobox/control.js'].lineData[183] = 0;
  _$jscoverage['/combobox/control.js'].lineData[184] = 0;
  _$jscoverage['/combobox/control.js'].lineData[185] = 0;
  _$jscoverage['/combobox/control.js'].lineData[187] = 0;
  _$jscoverage['/combobox/control.js'].lineData[188] = 0;
  _$jscoverage['/combobox/control.js'].lineData[191] = 0;
  _$jscoverage['/combobox/control.js'].lineData[193] = 0;
  _$jscoverage['/combobox/control.js'].lineData[194] = 0;
  _$jscoverage['/combobox/control.js'].lineData[195] = 0;
  _$jscoverage['/combobox/control.js'].lineData[197] = 0;
  _$jscoverage['/combobox/control.js'].lineData[202] = 0;
  _$jscoverage['/combobox/control.js'].lineData[207] = 0;
  _$jscoverage['/combobox/control.js'].lineData[215] = 0;
  _$jscoverage['/combobox/control.js'].lineData[216] = 0;
  _$jscoverage['/combobox/control.js'].lineData[218] = 0;
  _$jscoverage['/combobox/control.js'].lineData[220] = 0;
  _$jscoverage['/combobox/control.js'].lineData[224] = 0;
  _$jscoverage['/combobox/control.js'].lineData[225] = 0;
  _$jscoverage['/combobox/control.js'].lineData[226] = 0;
  _$jscoverage['/combobox/control.js'].lineData[231] = 0;
  _$jscoverage['/combobox/control.js'].lineData[232] = 0;
  _$jscoverage['/combobox/control.js'].lineData[233] = 0;
  _$jscoverage['/combobox/control.js'].lineData[237] = 0;
  _$jscoverage['/combobox/control.js'].lineData[239] = 0;
  _$jscoverage['/combobox/control.js'].lineData[242] = 0;
  _$jscoverage['/combobox/control.js'].lineData[243] = 0;
  _$jscoverage['/combobox/control.js'].lineData[244] = 0;
  _$jscoverage['/combobox/control.js'].lineData[248] = 0;
  _$jscoverage['/combobox/control.js'].lineData[250] = 0;
  _$jscoverage['/combobox/control.js'].lineData[253] = 0;
  _$jscoverage['/combobox/control.js'].lineData[256] = 0;
  _$jscoverage['/combobox/control.js'].lineData[261] = 0;
  _$jscoverage['/combobox/control.js'].lineData[263] = 0;
  _$jscoverage['/combobox/control.js'].lineData[265] = 0;
  _$jscoverage['/combobox/control.js'].lineData[266] = 0;
  _$jscoverage['/combobox/control.js'].lineData[270] = 0;
  _$jscoverage['/combobox/control.js'].lineData[271] = 0;
  _$jscoverage['/combobox/control.js'].lineData[273] = 0;
  _$jscoverage['/combobox/control.js'].lineData[274] = 0;
  _$jscoverage['/combobox/control.js'].lineData[275] = 0;
  _$jscoverage['/combobox/control.js'].lineData[276] = 0;
  _$jscoverage['/combobox/control.js'].lineData[279] = 0;
  _$jscoverage['/combobox/control.js'].lineData[283] = 0;
  _$jscoverage['/combobox/control.js'].lineData[287] = 0;
  _$jscoverage['/combobox/control.js'].lineData[288] = 0;
  _$jscoverage['/combobox/control.js'].lineData[289] = 0;
  _$jscoverage['/combobox/control.js'].lineData[292] = 0;
  _$jscoverage['/combobox/control.js'].lineData[301] = 0;
  _$jscoverage['/combobox/control.js'].lineData[303] = 0;
  _$jscoverage['/combobox/control.js'].lineData[307] = 0;
  _$jscoverage['/combobox/control.js'].lineData[311] = 0;
  _$jscoverage['/combobox/control.js'].lineData[314] = 0;
  _$jscoverage['/combobox/control.js'].lineData[315] = 0;
  _$jscoverage['/combobox/control.js'].lineData[318] = 0;
  _$jscoverage['/combobox/control.js'].lineData[319] = 0;
  _$jscoverage['/combobox/control.js'].lineData[320] = 0;
  _$jscoverage['/combobox/control.js'].lineData[321] = 0;
  _$jscoverage['/combobox/control.js'].lineData[322] = 0;
  _$jscoverage['/combobox/control.js'].lineData[323] = 0;
  _$jscoverage['/combobox/control.js'].lineData[326] = 0;
  _$jscoverage['/combobox/control.js'].lineData[328] = 0;
  _$jscoverage['/combobox/control.js'].lineData[331] = 0;
  _$jscoverage['/combobox/control.js'].lineData[335] = 0;
  _$jscoverage['/combobox/control.js'].lineData[336] = 0;
  _$jscoverage['/combobox/control.js'].lineData[354] = 0;
  _$jscoverage['/combobox/control.js'].lineData[370] = 0;
  _$jscoverage['/combobox/control.js'].lineData[380] = 0;
  _$jscoverage['/combobox/control.js'].lineData[395] = 0;
  _$jscoverage['/combobox/control.js'].lineData[396] = 0;
  _$jscoverage['/combobox/control.js'].lineData[406] = 0;
  _$jscoverage['/combobox/control.js'].lineData[412] = 0;
  _$jscoverage['/combobox/control.js'].lineData[433] = 0;
  _$jscoverage['/combobox/control.js'].lineData[469] = 0;
  _$jscoverage['/combobox/control.js'].lineData[470] = 0;
  _$jscoverage['/combobox/control.js'].lineData[471] = 0;
  _$jscoverage['/combobox/control.js'].lineData[472] = 0;
  _$jscoverage['/combobox/control.js'].lineData[473] = 0;
  _$jscoverage['/combobox/control.js'].lineData[475] = 0;
  _$jscoverage['/combobox/control.js'].lineData[478] = 0;
  _$jscoverage['/combobox/control.js'].lineData[479] = 0;
  _$jscoverage['/combobox/control.js'].lineData[480] = 0;
  _$jscoverage['/combobox/control.js'].lineData[488] = 0;
  _$jscoverage['/combobox/control.js'].lineData[592] = 0;
  _$jscoverage['/combobox/control.js'].lineData[593] = 0;
  _$jscoverage['/combobox/control.js'].lineData[594] = 0;
  _$jscoverage['/combobox/control.js'].lineData[595] = 0;
  _$jscoverage['/combobox/control.js'].lineData[598] = 0;
  _$jscoverage['/combobox/control.js'].lineData[601] = 0;
  _$jscoverage['/combobox/control.js'].lineData[602] = 0;
  _$jscoverage['/combobox/control.js'].lineData[605] = 0;
  _$jscoverage['/combobox/control.js'].lineData[606] = 0;
  _$jscoverage['/combobox/control.js'].lineData[610] = 0;
  _$jscoverage['/combobox/control.js'].lineData[611] = 0;
  _$jscoverage['/combobox/control.js'].lineData[615] = 0;
  _$jscoverage['/combobox/control.js'].lineData[616] = 0;
  _$jscoverage['/combobox/control.js'].lineData[618] = 0;
  _$jscoverage['/combobox/control.js'].lineData[620] = 0;
  _$jscoverage['/combobox/control.js'].lineData[623] = 0;
  _$jscoverage['/combobox/control.js'].lineData[624] = 0;
  _$jscoverage['/combobox/control.js'].lineData[628] = 0;
  _$jscoverage['/combobox/control.js'].lineData[633] = 0;
  _$jscoverage['/combobox/control.js'].lineData[634] = 0;
  _$jscoverage['/combobox/control.js'].lineData[636] = 0;
  _$jscoverage['/combobox/control.js'].lineData[637] = 0;
  _$jscoverage['/combobox/control.js'].lineData[638] = 0;
  _$jscoverage['/combobox/control.js'].lineData[639] = 0;
  _$jscoverage['/combobox/control.js'].lineData[640] = 0;
  _$jscoverage['/combobox/control.js'].lineData[641] = 0;
  _$jscoverage['/combobox/control.js'].lineData[643] = 0;
  _$jscoverage['/combobox/control.js'].lineData[644] = 0;
  _$jscoverage['/combobox/control.js'].lineData[645] = 0;
  _$jscoverage['/combobox/control.js'].lineData[648] = 0;
  _$jscoverage['/combobox/control.js'].lineData[649] = 0;
  _$jscoverage['/combobox/control.js'].lineData[650] = 0;
  _$jscoverage['/combobox/control.js'].lineData[655] = 0;
  _$jscoverage['/combobox/control.js'].lineData[656] = 0;
  _$jscoverage['/combobox/control.js'].lineData[657] = 0;
  _$jscoverage['/combobox/control.js'].lineData[658] = 0;
  _$jscoverage['/combobox/control.js'].lineData[659] = 0;
  _$jscoverage['/combobox/control.js'].lineData[660] = 0;
  _$jscoverage['/combobox/control.js'].lineData[661] = 0;
  _$jscoverage['/combobox/control.js'].lineData[663] = 0;
  _$jscoverage['/combobox/control.js'].lineData[667] = 0;
  _$jscoverage['/combobox/control.js'].lineData[668] = 0;
  _$jscoverage['/combobox/control.js'].lineData[671] = 0;
  _$jscoverage['/combobox/control.js'].lineData[672] = 0;
  _$jscoverage['/combobox/control.js'].lineData[673] = 0;
  _$jscoverage['/combobox/control.js'].lineData[674] = 0;
  _$jscoverage['/combobox/control.js'].lineData[675] = 0;
  _$jscoverage['/combobox/control.js'].lineData[679] = 0;
  _$jscoverage['/combobox/control.js'].lineData[680] = 0;
  _$jscoverage['/combobox/control.js'].lineData[683] = 0;
  _$jscoverage['/combobox/control.js'].lineData[684] = 0;
  _$jscoverage['/combobox/control.js'].lineData[685] = 0;
  _$jscoverage['/combobox/control.js'].lineData[686] = 0;
  _$jscoverage['/combobox/control.js'].lineData[688] = 0;
  _$jscoverage['/combobox/control.js'].lineData[689] = 0;
  _$jscoverage['/combobox/control.js'].lineData[693] = 0;
  _$jscoverage['/combobox/control.js'].lineData[694] = 0;
  _$jscoverage['/combobox/control.js'].lineData[695] = 0;
  _$jscoverage['/combobox/control.js'].lineData[697] = 0;
  _$jscoverage['/combobox/control.js'].lineData[699] = 0;
  _$jscoverage['/combobox/control.js'].lineData[700] = 0;
  _$jscoverage['/combobox/control.js'].lineData[707] = 0;
  _$jscoverage['/combobox/control.js'].lineData[708] = 0;
  _$jscoverage['/combobox/control.js'].lineData[709] = 0;
  _$jscoverage['/combobox/control.js'].lineData[710] = 0;
  _$jscoverage['/combobox/control.js'].lineData[711] = 0;
  _$jscoverage['/combobox/control.js'].lineData[715] = 0;
  _$jscoverage['/combobox/control.js'].lineData[716] = 0;
  _$jscoverage['/combobox/control.js'].lineData[723] = 0;
  _$jscoverage['/combobox/control.js'].lineData[724] = 0;
  _$jscoverage['/combobox/control.js'].lineData[732] = 0;
  _$jscoverage['/combobox/control.js'].lineData[734] = 0;
  _$jscoverage['/combobox/control.js'].lineData[736] = 0;
  _$jscoverage['/combobox/control.js'].lineData[737] = 0;
  _$jscoverage['/combobox/control.js'].lineData[738] = 0;
  _$jscoverage['/combobox/control.js'].lineData[739] = 0;
  _$jscoverage['/combobox/control.js'].lineData[741] = 0;
  _$jscoverage['/combobox/control.js'].lineData[744] = 0;
  _$jscoverage['/combobox/control.js'].lineData[746] = 0;
  _$jscoverage['/combobox/control.js'].lineData[747] = 0;
  _$jscoverage['/combobox/control.js'].lineData[748] = 0;
  _$jscoverage['/combobox/control.js'].lineData[749] = 0;
  _$jscoverage['/combobox/control.js'].lineData[750] = 0;
  _$jscoverage['/combobox/control.js'].lineData[751] = 0;
  _$jscoverage['/combobox/control.js'].lineData[757] = 0;
  _$jscoverage['/combobox/control.js'].lineData[758] = 0;
  _$jscoverage['/combobox/control.js'].lineData[759] = 0;
  _$jscoverage['/combobox/control.js'].lineData[760] = 0;
  _$jscoverage['/combobox/control.js'].lineData[761] = 0;
  _$jscoverage['/combobox/control.js'].lineData[765] = 0;
  _$jscoverage['/combobox/control.js'].lineData[767] = 0;
  _$jscoverage['/combobox/control.js'].lineData[769] = 0;
  _$jscoverage['/combobox/control.js'].lineData[775] = 0;
}
if (! _$jscoverage['/combobox/control.js'].functionData) {
  _$jscoverage['/combobox/control.js'].functionData = [];
  _$jscoverage['/combobox/control.js'].functionData[0] = 0;
  _$jscoverage['/combobox/control.js'].functionData[1] = 0;
  _$jscoverage['/combobox/control.js'].functionData[2] = 0;
  _$jscoverage['/combobox/control.js'].functionData[3] = 0;
  _$jscoverage['/combobox/control.js'].functionData[4] = 0;
  _$jscoverage['/combobox/control.js'].functionData[5] = 0;
  _$jscoverage['/combobox/control.js'].functionData[6] = 0;
  _$jscoverage['/combobox/control.js'].functionData[7] = 0;
  _$jscoverage['/combobox/control.js'].functionData[8] = 0;
  _$jscoverage['/combobox/control.js'].functionData[9] = 0;
  _$jscoverage['/combobox/control.js'].functionData[10] = 0;
  _$jscoverage['/combobox/control.js'].functionData[11] = 0;
  _$jscoverage['/combobox/control.js'].functionData[12] = 0;
  _$jscoverage['/combobox/control.js'].functionData[13] = 0;
  _$jscoverage['/combobox/control.js'].functionData[14] = 0;
  _$jscoverage['/combobox/control.js'].functionData[15] = 0;
  _$jscoverage['/combobox/control.js'].functionData[16] = 0;
  _$jscoverage['/combobox/control.js'].functionData[17] = 0;
  _$jscoverage['/combobox/control.js'].functionData[18] = 0;
  _$jscoverage['/combobox/control.js'].functionData[19] = 0;
  _$jscoverage['/combobox/control.js'].functionData[20] = 0;
  _$jscoverage['/combobox/control.js'].functionData[21] = 0;
  _$jscoverage['/combobox/control.js'].functionData[22] = 0;
  _$jscoverage['/combobox/control.js'].functionData[23] = 0;
  _$jscoverage['/combobox/control.js'].functionData[24] = 0;
  _$jscoverage['/combobox/control.js'].functionData[25] = 0;
  _$jscoverage['/combobox/control.js'].functionData[26] = 0;
  _$jscoverage['/combobox/control.js'].functionData[27] = 0;
  _$jscoverage['/combobox/control.js'].functionData[28] = 0;
  _$jscoverage['/combobox/control.js'].functionData[29] = 0;
  _$jscoverage['/combobox/control.js'].functionData[30] = 0;
  _$jscoverage['/combobox/control.js'].functionData[31] = 0;
  _$jscoverage['/combobox/control.js'].functionData[32] = 0;
  _$jscoverage['/combobox/control.js'].functionData[33] = 0;
  _$jscoverage['/combobox/control.js'].functionData[34] = 0;
  _$jscoverage['/combobox/control.js'].functionData[35] = 0;
  _$jscoverage['/combobox/control.js'].functionData[36] = 0;
  _$jscoverage['/combobox/control.js'].functionData[37] = 0;
  _$jscoverage['/combobox/control.js'].functionData[38] = 0;
  _$jscoverage['/combobox/control.js'].functionData[39] = 0;
  _$jscoverage['/combobox/control.js'].functionData[40] = 0;
  _$jscoverage['/combobox/control.js'].functionData[41] = 0;
  _$jscoverage['/combobox/control.js'].functionData[42] = 0;
}
if (! _$jscoverage['/combobox/control.js'].branchData) {
  _$jscoverage['/combobox/control.js'].branchData = {};
  _$jscoverage['/combobox/control.js'].branchData['58'] = [];
  _$jscoverage['/combobox/control.js'].branchData['58'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['79'] = [];
  _$jscoverage['/combobox/control.js'].branchData['79'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['81'] = [];
  _$jscoverage['/combobox/control.js'].branchData['81'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['87'] = [];
  _$jscoverage['/combobox/control.js'].branchData['87'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['124'] = [];
  _$jscoverage['/combobox/control.js'].branchData['124'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['127'] = [];
  _$jscoverage['/combobox/control.js'].branchData['127'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['137'] = [];
  _$jscoverage['/combobox/control.js'].branchData['137'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['139'] = [];
  _$jscoverage['/combobox/control.js'].branchData['139'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['148'] = [];
  _$jscoverage['/combobox/control.js'].branchData['148'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['161'] = [];
  _$jscoverage['/combobox/control.js'].branchData['161'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['163'] = [];
  _$jscoverage['/combobox/control.js'].branchData['163'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['164'] = [];
  _$jscoverage['/combobox/control.js'].branchData['164'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['164'][2] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['172'] = [];
  _$jscoverage['/combobox/control.js'].branchData['172'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['184'] = [];
  _$jscoverage['/combobox/control.js'].branchData['184'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['184'][2] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['184'][3] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['185'] = [];
  _$jscoverage['/combobox/control.js'].branchData['185'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['194'] = [];
  _$jscoverage['/combobox/control.js'].branchData['194'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['194'][2] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['194'][3] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['218'] = [];
  _$jscoverage['/combobox/control.js'].branchData['218'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['224'] = [];
  _$jscoverage['/combobox/control.js'].branchData['224'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['226'] = [];
  _$jscoverage['/combobox/control.js'].branchData['226'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['226'][2] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['226'][3] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['227'] = [];
  _$jscoverage['/combobox/control.js'].branchData['227'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['228'] = [];
  _$jscoverage['/combobox/control.js'].branchData['228'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['228'][2] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['229'] = [];
  _$jscoverage['/combobox/control.js'].branchData['229'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['242'] = [];
  _$jscoverage['/combobox/control.js'].branchData['242'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['244'] = [];
  _$jscoverage['/combobox/control.js'].branchData['244'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['253'] = [];
  _$jscoverage['/combobox/control.js'].branchData['253'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['261'] = [];
  _$jscoverage['/combobox/control.js'].branchData['261'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['261'][2] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['265'] = [];
  _$jscoverage['/combobox/control.js'].branchData['265'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['271'] = [];
  _$jscoverage['/combobox/control.js'].branchData['271'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['271'][2] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['271'][3] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['274'] = [];
  _$jscoverage['/combobox/control.js'].branchData['274'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['287'] = [];
  _$jscoverage['/combobox/control.js'].branchData['287'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['314'] = [];
  _$jscoverage['/combobox/control.js'].branchData['314'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['319'] = [];
  _$jscoverage['/combobox/control.js'].branchData['319'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['320'] = [];
  _$jscoverage['/combobox/control.js'].branchData['320'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['324'] = [];
  _$jscoverage['/combobox/control.js'].branchData['324'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['325'] = [];
  _$jscoverage['/combobox/control.js'].branchData['325'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['396'] = [];
  _$jscoverage['/combobox/control.js'].branchData['396'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['469'] = [];
  _$jscoverage['/combobox/control.js'].branchData['469'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['470'] = [];
  _$jscoverage['/combobox/control.js'].branchData['470'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['471'] = [];
  _$jscoverage['/combobox/control.js'].branchData['471'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['478'] = [];
  _$jscoverage['/combobox/control.js'].branchData['478'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['593'] = [];
  _$jscoverage['/combobox/control.js'].branchData['593'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['594'] = [];
  _$jscoverage['/combobox/control.js'].branchData['594'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['637'] = [];
  _$jscoverage['/combobox/control.js'].branchData['637'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['637'][2] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['649'] = [];
  _$jscoverage['/combobox/control.js'].branchData['649'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['658'] = [];
  _$jscoverage['/combobox/control.js'].branchData['658'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['661'] = [];
  _$jscoverage['/combobox/control.js'].branchData['661'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['662'] = [];
  _$jscoverage['/combobox/control.js'].branchData['662'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['671'] = [];
  _$jscoverage['/combobox/control.js'].branchData['671'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['683'] = [];
  _$jscoverage['/combobox/control.js'].branchData['683'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['694'] = [];
  _$jscoverage['/combobox/control.js'].branchData['694'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['699'] = [];
  _$jscoverage['/combobox/control.js'].branchData['699'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['709'] = [];
  _$jscoverage['/combobox/control.js'].branchData['709'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['736'] = [];
  _$jscoverage['/combobox/control.js'].branchData['736'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['746'] = [];
  _$jscoverage['/combobox/control.js'].branchData['746'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['747'] = [];
  _$jscoverage['/combobox/control.js'].branchData['747'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['748'] = [];
  _$jscoverage['/combobox/control.js'].branchData['748'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['757'] = [];
  _$jscoverage['/combobox/control.js'].branchData['757'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['758'] = [];
  _$jscoverage['/combobox/control.js'].branchData['758'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['759'] = [];
  _$jscoverage['/combobox/control.js'].branchData['759'][1] = new BranchData();
}
_$jscoverage['/combobox/control.js'].branchData['759'][1].init(26, 28, '!children[i].get(\'disabled\')');
function visit80_759_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['759'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['758'][1].init(30, 19, 'i < children.length');
function visit79_758_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['758'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['757'][1].init(787, 43, '!matchVal && self.get(\'autoHighlightFirst\')');
function visit78_757_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['757'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['748'][1].init(26, 38, 'children[i].get(\'textContent\') === val');
function visit77_748_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['748'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['747'][1].init(30, 19, 'i < children.length');
function visit76_747_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['747'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['746'][1].init(337, 30, 'self.get(\'highlightMatchItem\')');
function visit75_746_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['746'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['736'][1].init(267, 19, 'data && data.length');
function visit74_736_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['736'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['709'][1].init(59, 1, 't');
function visit73_709_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['709'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['699'][1].init(50, 26, 'self._focusoutDismissTimer');
function visit72_699_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['699'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['694'][1].init(14, 26, 'self._focusoutDismissTimer');
function visit71_694_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['694'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['683'][1].init(145, 5, 'error');
function visit70_683_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['683'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['671'][1].init(96, 15, 'item.isMenuItem');
function visit69_671_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['671'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['662'][1].init(69, 49, 'parseInt(menuEl.css(\'borderRightWidth\'), 10) || 0');
function visit68_662_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['662'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['661'][1].init(113, 48, 'parseInt(menuEl.css(\'borderLeftWidth\'), 10) || 0');
function visit67_661_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['661'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['658'][1].init(78, 19, 'menu.get(\'visible\')');
function visit66_658_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['658'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['649'][1].init(571, 24, 'self.get(\'matchElWidth\')');
function visit65_649_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['649'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['637'][2].init(108, 17, 'menu === e.target');
function visit64_637_2(result) {
  _$jscoverage['/combobox/control.js'].branchData['637'][2].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['637'][1].init(102, 23, '!e || menu === e.target');
function visit63_637_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['637'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['594'][1].init(18, 28, '!children[i].get(\'disabled\')');
function visit62_594_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['594'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['593'][1].init(26, 19, 'i < children.length');
function visit61_593_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['593'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['478'][1].init(26, 11, 'm.isControl');
function visit60_478_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['478'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['471'][1].init(37, 23, 'v.xclass || \'popupmenu\'');
function visit59_471_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['471'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['470'][1].init(60, 12, '!v.isControl');
function visit58_470_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['470'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['469'][1].init(26, 7, 'v || {}');
function visit57_469_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['469'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['396'][1].init(95, 33, 'placeHolder && placeHolder.html()');
function visit56_396_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['396'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['325'][1].init(81, 49, 'parseInt(menuEl.css(\'borderRightWidth\'), 10) || 0');
function visit55_325_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['325'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['324'][1].init(43, 48, 'parseInt(menuEl.css(\'borderLeftWidth\'), 10) || 0');
function visit54_324_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['324'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['320'][1].init(26, 24, 'self.get(\'matchElWidth\')');
function visit53_320_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['320'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['319'][1].init(107, 20, '!menu.get(\'visible\')');
function visit52_319_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['319'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['314'][1].init(122, 1, 'v');
function visit51_314_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['314'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['287'][1].init(149, 9, 'validator');
function visit50_287_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['287'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['274'][1].init(125, 15, 'v !== undefined');
function visit49_274_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['274'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['271'][3].init(2755, 22, 'keyCode === KeyCode.UP');
function visit48_271_3(result) {
  _$jscoverage['/combobox/control.js'].branchData['271'][3].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['271'][2].init(2727, 24, 'keyCode === KeyCode.DOWN');
function visit47_271_2(result) {
  _$jscoverage['/combobox/control.js'].branchData['271'][2].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['271'][1].init(2727, 50, 'keyCode === KeyCode.DOWN || keyCode === KeyCode.UP');
function visit46_271_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['271'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['265'][1].init(200, 20, 'self.get(\'multiple\')');
function visit45_265_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['265'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['261'][2].init(1922, 23, 'keyCode === KeyCode.TAB');
function visit44_261_2(result) {
  _$jscoverage['/combobox/control.js'].branchData['261'][2].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['261'][1].init(1922, 42, 'keyCode === KeyCode.TAB && highlightedItem');
function visit43_261_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['261'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['253'][1].init(1519, 93, 'updateInputOnDownUp && util.inArray(keyCode, [KeyCode.DOWN, KeyCode.UP])');
function visit42_253_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['253'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['244'][1].init(76, 19, 'updateInputOnDownUp');
function visit41_244_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['244'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['242'][1].init(1042, 23, 'keyCode === KeyCode.ESC');
function visit40_242_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['242'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['229'][1].init(50, 53, 'highlightedItem === getFirstEnabledItem(menuChildren)');
function visit39_229_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['229'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['228'][2].init(244, 22, 'keyCode === KeyCode.UP');
function visit38_228_2(result) {
  _$jscoverage['/combobox/control.js'].branchData['228'][2].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['228'][1].init(153, 104, 'keyCode === KeyCode.UP && highlightedItem === getFirstEnabledItem(menuChildren)');
function visit37_228_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['228'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['227'][1].init(52, 72, 'highlightedItem === getFirstEnabledItem(menuChildren.concat().reverse())');
function visit36_227_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['227'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['226'][3].init(88, 24, 'keyCode === KeyCode.DOWN');
function visit35_226_3(result) {
  _$jscoverage['/combobox/control.js'].branchData['226'][3].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['226'][2].init(88, 125, 'keyCode === KeyCode.DOWN && highlightedItem === getFirstEnabledItem(menuChildren.concat().reverse())');
function visit34_226_2(result) {
  _$jscoverage['/combobox/control.js'].branchData['226'][2].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['226'][1].init(88, 258, 'keyCode === KeyCode.DOWN && highlightedItem === getFirstEnabledItem(menuChildren.concat().reverse()) || keyCode === KeyCode.UP && highlightedItem === getFirstEnabledItem(menuChildren)');
function visit33_226_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['226'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['224'][1].init(233, 38, 'updateInputOnDownUp && highlightedItem');
function visit32_224_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['224'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['218'][1].init(368, 19, 'menu.get(\'visible\')');
function visit31_218_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['218'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['194'][3].init(690, 21, 'clearEl[0] === target');
function visit30_194_3(result) {
  _$jscoverage['/combobox/control.js'].branchData['194'][3].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['194'][2].init(690, 49, 'clearEl[0] === target || clearEl.contains(target)');
function visit29_194_2(result) {
  _$jscoverage['/combobox/control.js'].branchData['194'][2].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['194'][1].init(678, 62, 'clearEl && (clearEl[0] === target || clearEl.contains(target))');
function visit28_194_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['194'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['185'][1].init(22, 21, 'self.get(\'collapsed\')');
function visit27_185_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['185'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['184'][3].init(255, 21, 'trigger[0] === target');
function visit26_184_3(result) {
  _$jscoverage['/combobox/control.js'].branchData['184'][3].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['184'][2].init(255, 49, 'trigger[0] === target || trigger.contains(target)');
function visit25_184_2(result) {
  _$jscoverage['/combobox/control.js'].branchData['184'][2].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['184'][1].init(243, 62, 'trigger && (trigger[0] === target || trigger.contains(target))');
function visit24_184_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['184'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['172'][1].init(605, 35, 'placeholderEl && !self.get(\'value\')');
function visit23_172_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['172'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['164'][2].init(55, 25, 'val === self.get(\'value\')');
function visit22_164_2(result) {
  _$jscoverage['/combobox/control.js'].branchData['164'][2].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['164'][1].init(30, 51, '!self.get(\'focused\') && (val === self.get(\'value\'))');
function visit21_164_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['164'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['163'][1].init(26, 5, 'error');
function visit20_163_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['163'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['161'][1].init(170, 21, 'self.get(\'invalidEl\')');
function visit19_161_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['161'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['148'][1].init(118, 21, 'self.get(\'invalidEl\')');
function visit18_148_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['148'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['139'][1].init(707, 13, '!v && clearEl');
function visit17_139_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['139'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['137'][1].init(633, 12, 'v && clearEl');
function visit16_137_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['137'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['127'][1].init(127, 19, 'value === undefined');
function visit15_127_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['127'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['124'][1].init(178, 20, 'e.causedByInputEvent');
function visit14_124_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['124'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['87'][1].init(337, 15, 'i < data.length');
function visit13_87_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['87'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['81'][1].init(87, 18, 'self.get(\'format\')');
function visit12_81_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['81'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['79'][1].init(84, 19, 'data && data.length');
function visit11_79_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['79'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['58'][1].init(520, 20, 'menu.get(\'rendered\')');
function visit10_58_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['58'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/combobox/control.js'].functionData[0]++;
  _$jscoverage['/combobox/control.js'].lineData[7]++;
  var util = require('util');
  _$jscoverage['/combobox/control.js'].lineData[8]++;
  var logger = S.getLogger('combobox');
  _$jscoverage['/combobox/control.js'].lineData[9]++;
  var Node = require('node');
  _$jscoverage['/combobox/control.js'].lineData[10]++;
  var Control = require('component/control');
  _$jscoverage['/combobox/control.js'].lineData[11]++;
  var ComboboxTpl = require('./combobox-xtpl');
  _$jscoverage['/combobox/control.js'].lineData[13]++;
  require('menu');
  _$jscoverage['/combobox/control.js'].lineData[15]++;
  var ComboBox, KeyCode = Node.KeyCode;
  _$jscoverage['/combobox/control.js'].lineData[24]++;
  ComboBox = Control.extend({
  initializer: function() {
  _$jscoverage['/combobox/control.js'].functionData[1]++;
  _$jscoverage['/combobox/control.js'].lineData[30]++;
  this.publish('afterRenderData', {
  bubbles: false});
}, 
  _savedValue: null, 
  bindUI: function() {
  _$jscoverage['/combobox/control.js'].functionData[2]++;
  _$jscoverage['/combobox/control.js'].lineData[41]++;
  var self = this, input = self.get('input');
  _$jscoverage['/combobox/control.js'].lineData[44]++;
  input.on('input', onValueChange, self);
  _$jscoverage['/combobox/control.js'].lineData[54]++;
  self.on('click', onMenuItemClick, self);
  _$jscoverage['/combobox/control.js'].lineData[56]++;
  var menu = self.get('menu');
  _$jscoverage['/combobox/control.js'].lineData[58]++;
  if (visit10_58_1(menu.get('rendered'))) {
    _$jscoverage['/combobox/control.js'].lineData[59]++;
    onMenuAfterRenderUI.call(self);
  } else {
    _$jscoverage['/combobox/control.js'].lineData[61]++;
    menu.on('afterRenderUI', onMenuAfterRenderUI, self);
  }
}, 
  destructor: function() {
  _$jscoverage['/combobox/control.js'].functionData[3]++;
  _$jscoverage['/combobox/control.js'].lineData[66]++;
  var self = this;
  _$jscoverage['/combobox/control.js'].lineData[67]++;
  self.get('menu').destroy();
  _$jscoverage['/combobox/control.js'].lineData[68]++;
  self.$el.getWindow().detach('resize', onWindowResize, self);
}, 
  normalizeData: function(data) {
  _$jscoverage['/combobox/control.js'].functionData[4]++;
  _$jscoverage['/combobox/control.js'].lineData[77]++;
  var self = this, contents, v, i, c;
  _$jscoverage['/combobox/control.js'].lineData[79]++;
  if (visit11_79_1(data && data.length)) {
    _$jscoverage['/combobox/control.js'].lineData[80]++;
    data = data.slice(0, self.get('maxItemCount'));
    _$jscoverage['/combobox/control.js'].lineData[81]++;
    if (visit12_81_1(self.get('format'))) {
      _$jscoverage['/combobox/control.js'].lineData[82]++;
      contents = self.get('format').call(self, self.getCurrentValue(), data);
    } else {
      _$jscoverage['/combobox/control.js'].lineData[85]++;
      contents = [];
    }
    _$jscoverage['/combobox/control.js'].lineData[87]++;
    for (i = 0; visit13_87_1(i < data.length); i++) {
      _$jscoverage['/combobox/control.js'].lineData[88]++;
      v = data[i];
      _$jscoverage['/combobox/control.js'].lineData[89]++;
      c = contents[i] = util.mix({
  content: v, 
  textContent: v, 
  value: v}, contents[i]);
    }
    _$jscoverage['/combobox/control.js'].lineData[95]++;
    return contents;
  }
  _$jscoverage['/combobox/control.js'].lineData[97]++;
  return contents;
}, 
  getCurrentValue: function() {
  _$jscoverage['/combobox/control.js'].functionData[5]++;
  _$jscoverage['/combobox/control.js'].lineData[105]++;
  return this.get('value');
}, 
  setCurrentValue: function(value, setCfg) {
  _$jscoverage['/combobox/control.js'].functionData[6]++;
  _$jscoverage['/combobox/control.js'].lineData[115]++;
  this.set('value', value, setCfg);
}, 
  _onSetValue: function(v, e) {
  _$jscoverage['/combobox/control.js'].functionData[7]++;
  _$jscoverage['/combobox/control.js'].lineData[120]++;
  var self = this, clearEl = self.get('clearEl'), value;
  _$jscoverage['/combobox/control.js'].lineData[124]++;
  if (visit14_124_1(e.causedByInputEvent)) {
    _$jscoverage['/combobox/control.js'].lineData[125]++;
    value = self.getCurrentValue();
    _$jscoverage['/combobox/control.js'].lineData[127]++;
    if (visit15_127_1(value === undefined)) {
      _$jscoverage['/combobox/control.js'].lineData[128]++;
      self.set('collapsed', true);
      _$jscoverage['/combobox/control.js'].lineData[129]++;
      return;
    }
    _$jscoverage['/combobox/control.js'].lineData[131]++;
    self._savedValue = value;
    _$jscoverage['/combobox/control.js'].lineData[132]++;
    self.sendRequest(value);
  } else {
    _$jscoverage['/combobox/control.js'].lineData[134]++;
    self.get('input').val(v);
  }
  _$jscoverage['/combobox/control.js'].lineData[137]++;
  if (visit16_137_1(v && clearEl)) {
    _$jscoverage['/combobox/control.js'].lineData[138]++;
    clearEl.show();
  } else {
    _$jscoverage['/combobox/control.js'].lineData[139]++;
    if (visit17_139_1(!v && clearEl)) {
      _$jscoverage['/combobox/control.js'].lineData[140]++;
      clearEl.hide();
    }
  }
}, 
  handleFocusInternal: function() {
  _$jscoverage['/combobox/control.js'].functionData[8]++;
  _$jscoverage['/combobox/control.js'].lineData[145]++;
  var self = this, placeholderEl;
  _$jscoverage['/combobox/control.js'].lineData[147]++;
  clearDismissTimer(self);
  _$jscoverage['/combobox/control.js'].lineData[148]++;
  if (visit18_148_1(self.get('invalidEl'))) {
    _$jscoverage['/combobox/control.js'].lineData[149]++;
    setInvalid(self, false);
  }
  _$jscoverage['/combobox/control.js'].lineData[151]++;
  if ((placeholderEl = self.get('placeholderEl'))) {
    _$jscoverage['/combobox/control.js'].lineData[152]++;
    placeholderEl.hide();
  }
}, 
  handleBlurInternal: function(e) {
  _$jscoverage['/combobox/control.js'].functionData[9]++;
  _$jscoverage['/combobox/control.js'].lineData[157]++;
  var self = this, placeholderEl = self.get('placeholderEl');
  _$jscoverage['/combobox/control.js'].lineData[159]++;
  self.callSuper(e);
  _$jscoverage['/combobox/control.js'].lineData[160]++;
  delayHide(self);
  _$jscoverage['/combobox/control.js'].lineData[161]++;
  if (visit19_161_1(self.get('invalidEl'))) {
    _$jscoverage['/combobox/control.js'].lineData[162]++;
    self.validate(function(error, val) {
  _$jscoverage['/combobox/control.js'].functionData[10]++;
  _$jscoverage['/combobox/control.js'].lineData[163]++;
  if (visit20_163_1(error)) {
    _$jscoverage['/combobox/control.js'].lineData[164]++;
    if (visit21_164_1(!self.get('focused') && (visit22_164_2(val === self.get('value'))))) {
      _$jscoverage['/combobox/control.js'].lineData[165]++;
      setInvalid(self, error);
    }
  } else {
    _$jscoverage['/combobox/control.js'].lineData[168]++;
    setInvalid(self, false);
  }
});
  }
  _$jscoverage['/combobox/control.js'].lineData[172]++;
  if (visit23_172_1(placeholderEl && !self.get('value'))) {
    _$jscoverage['/combobox/control.js'].lineData[173]++;
    placeholderEl.show();
  }
}, 
  handleMouseDownInternal: function(e) {
  _$jscoverage['/combobox/control.js'].functionData[11]++;
  _$jscoverage['/combobox/control.js'].lineData[178]++;
  var self = this, target, clearEl, trigger;
  _$jscoverage['/combobox/control.js'].lineData[180]++;
  self.callSuper(e);
  _$jscoverage['/combobox/control.js'].lineData[181]++;
  target = e.target;
  _$jscoverage['/combobox/control.js'].lineData[182]++;
  trigger = self.get('trigger');
  _$jscoverage['/combobox/control.js'].lineData[183]++;
  clearEl = self.get('clearEl');
  _$jscoverage['/combobox/control.js'].lineData[184]++;
  if (visit24_184_1(trigger && (visit25_184_2(visit26_184_3(trigger[0] === target) || trigger.contains(target))))) {
    _$jscoverage['/combobox/control.js'].lineData[185]++;
    if (visit27_185_1(self.get('collapsed'))) {
      _$jscoverage['/combobox/control.js'].lineData[187]++;
      self.focus();
      _$jscoverage['/combobox/control.js'].lineData[188]++;
      self.sendRequest('');
    } else {
      _$jscoverage['/combobox/control.js'].lineData[191]++;
      self.set('collapsed', true);
    }
    _$jscoverage['/combobox/control.js'].lineData[193]++;
    e.preventDefault();
  } else {
    _$jscoverage['/combobox/control.js'].lineData[194]++;
    if (visit28_194_1(clearEl && (visit29_194_2(visit30_194_3(clearEl[0] === target) || clearEl.contains(target))))) {
      _$jscoverage['/combobox/control.js'].lineData[195]++;
      self.get('input').val('');
      _$jscoverage['/combobox/control.js'].lineData[197]++;
      self.setCurrentValue('', {
  data: {
  causedByInputEvent: 1}});
      _$jscoverage['/combobox/control.js'].lineData[202]++;
      clearEl.hide();
    }
  }
}, 
  handleKeyDownInternal: function(e) {
  _$jscoverage['/combobox/control.js'].functionData[12]++;
  _$jscoverage['/combobox/control.js'].lineData[207]++;
  var self = this, updateInputOnDownUp, input, keyCode = e.keyCode, highlightedItem, handledByMenu, menu = self.get('menu');
  _$jscoverage['/combobox/control.js'].lineData[215]++;
  input = self.get('input');
  _$jscoverage['/combobox/control.js'].lineData[216]++;
  updateInputOnDownUp = self.get('updateInputOnDownUp');
  _$jscoverage['/combobox/control.js'].lineData[218]++;
  if (visit31_218_1(menu.get('visible'))) {
    _$jscoverage['/combobox/control.js'].lineData[220]++;
    highlightedItem = menu.get('highlightedItem');
    _$jscoverage['/combobox/control.js'].lineData[224]++;
    if (visit32_224_1(updateInputOnDownUp && highlightedItem)) {
      _$jscoverage['/combobox/control.js'].lineData[225]++;
      var menuChildren = menu.get('children');
      _$jscoverage['/combobox/control.js'].lineData[226]++;
      if (visit33_226_1(visit34_226_2(visit35_226_3(keyCode === KeyCode.DOWN) && visit36_227_1(highlightedItem === getFirstEnabledItem(menuChildren.concat().reverse()))) || visit37_228_1(visit38_228_2(keyCode === KeyCode.UP) && visit39_229_1(highlightedItem === getFirstEnabledItem(menuChildren))))) {
        _$jscoverage['/combobox/control.js'].lineData[231]++;
        self.setCurrentValue(self._savedValue);
        _$jscoverage['/combobox/control.js'].lineData[232]++;
        highlightedItem.set('highlighted', false);
        _$jscoverage['/combobox/control.js'].lineData[233]++;
        return true;
      }
    }
    _$jscoverage['/combobox/control.js'].lineData[237]++;
    handledByMenu = menu.handleKeyDownInternal(e);
    _$jscoverage['/combobox/control.js'].lineData[239]++;
    highlightedItem = menu.get('highlightedItem');
    _$jscoverage['/combobox/control.js'].lineData[242]++;
    if (visit40_242_1(keyCode === KeyCode.ESC)) {
      _$jscoverage['/combobox/control.js'].lineData[243]++;
      self.set('collapsed', true);
      _$jscoverage['/combobox/control.js'].lineData[244]++;
      if (visit41_244_1(updateInputOnDownUp)) {
        _$jscoverage['/combobox/control.js'].lineData[248]++;
        self.setCurrentValue(self._savedValue);
      }
      _$jscoverage['/combobox/control.js'].lineData[250]++;
      return true;
    }
    _$jscoverage['/combobox/control.js'].lineData[253]++;
    if (visit42_253_1(updateInputOnDownUp && util.inArray(keyCode, [KeyCode.DOWN, KeyCode.UP]))) {
      _$jscoverage['/combobox/control.js'].lineData[256]++;
      self.setCurrentValue(highlightedItem.get('textContent'));
    }
    _$jscoverage['/combobox/control.js'].lineData[261]++;
    if (visit43_261_1(visit44_261_2(keyCode === KeyCode.TAB) && highlightedItem)) {
      _$jscoverage['/combobox/control.js'].lineData[263]++;
      highlightedItem.handleClickInternal(e);
      _$jscoverage['/combobox/control.js'].lineData[265]++;
      if (visit45_265_1(self.get('multiple'))) {
        _$jscoverage['/combobox/control.js'].lineData[266]++;
        return true;
      }
    }
    _$jscoverage['/combobox/control.js'].lineData[270]++;
    return handledByMenu;
  } else {
    _$jscoverage['/combobox/control.js'].lineData[271]++;
    if (visit46_271_1(visit47_271_2(keyCode === KeyCode.DOWN) || visit48_271_3(keyCode === KeyCode.UP))) {
      _$jscoverage['/combobox/control.js'].lineData[273]++;
      var v = self.getCurrentValue();
      _$jscoverage['/combobox/control.js'].lineData[274]++;
      if (visit49_274_1(v !== undefined)) {
        _$jscoverage['/combobox/control.js'].lineData[275]++;
        self.sendRequest(v);
        _$jscoverage['/combobox/control.js'].lineData[276]++;
        return true;
      }
    }
  }
  _$jscoverage['/combobox/control.js'].lineData[279]++;
  return undefined;
}, 
  validate: function(callback) {
  _$jscoverage['/combobox/control.js'].functionData[13]++;
  _$jscoverage['/combobox/control.js'].lineData[283]++;
  var self = this, validator = self.get('validator'), val = self.getCurrentValue();
  _$jscoverage['/combobox/control.js'].lineData[287]++;
  if (visit50_287_1(validator)) {
    _$jscoverage['/combobox/control.js'].lineData[288]++;
    validator(val, function(error) {
  _$jscoverage['/combobox/control.js'].functionData[14]++;
  _$jscoverage['/combobox/control.js'].lineData[289]++;
  callback(error, val);
});
  } else {
    _$jscoverage['/combobox/control.js'].lineData[292]++;
    callback(false, val);
  }
}, 
  sendRequest: function(value) {
  _$jscoverage['/combobox/control.js'].functionData[15]++;
  _$jscoverage['/combobox/control.js'].lineData[301]++;
  var self = this, dataSource = self.get('dataSource');
  _$jscoverage['/combobox/control.js'].lineData[303]++;
  dataSource.fetchData(value, renderData, self);
}, 
  getKeyEventTarget: function() {
  _$jscoverage['/combobox/control.js'].functionData[16]++;
  _$jscoverage['/combobox/control.js'].lineData[307]++;
  return this.get('input');
}, 
  _onSetCollapsed: function(v) {
  _$jscoverage['/combobox/control.js'].functionData[17]++;
  _$jscoverage['/combobox/control.js'].lineData[311]++;
  var self = this, el = self.$el, menu = self.get('menu');
  _$jscoverage['/combobox/control.js'].lineData[314]++;
  if (visit51_314_1(v)) {
    _$jscoverage['/combobox/control.js'].lineData[315]++;
    menu.hide();
  } else {
    _$jscoverage['/combobox/control.js'].lineData[318]++;
    clearDismissTimer(self);
    _$jscoverage['/combobox/control.js'].lineData[319]++;
    if (visit52_319_1(!menu.get('visible'))) {
      _$jscoverage['/combobox/control.js'].lineData[320]++;
      if (visit53_320_1(self.get('matchElWidth'))) {
        _$jscoverage['/combobox/control.js'].lineData[321]++;
        menu.render();
        _$jscoverage['/combobox/control.js'].lineData[322]++;
        var menuEl = menu.get('el');
        _$jscoverage['/combobox/control.js'].lineData[323]++;
        var borderWidth = (visit54_324_1(parseInt(menuEl.css('borderLeftWidth'), 10) || 0)) + (visit55_325_1(parseInt(menuEl.css('borderRightWidth'), 10) || 0));
        _$jscoverage['/combobox/control.js'].lineData[326]++;
        menu.set('width', el[0].offsetWidth - borderWidth);
      }
      _$jscoverage['/combobox/control.js'].lineData[328]++;
      menu.show();
    }
  }
  _$jscoverage['/combobox/control.js'].lineData[331]++;
  this.get('input').attr('aria-expanded', !v);
}, 
  _onSetDisabled: function(v, e) {
  _$jscoverage['/combobox/control.js'].functionData[18]++;
  _$jscoverage['/combobox/control.js'].lineData[335]++;
  this.callSuper(v, e);
  _$jscoverage['/combobox/control.js'].lineData[336]++;
  this.get('input').attr('disabled', v);
}}, {
  ATTRS: {
  contentTpl: {
  value: ComboboxTpl}, 
  input: {
  selector: function() {
  _$jscoverage['/combobox/control.js'].functionData[19]++;
  _$jscoverage['/combobox/control.js'].lineData[354]++;
  return ('.' + this.getBaseCssClass('input'));
}}, 
  value: {
  value: '', 
  sync: 0, 
  render: 1, 
  parse: function() {
  _$jscoverage['/combobox/control.js'].functionData[20]++;
  _$jscoverage['/combobox/control.js'].lineData[370]++;
  return this.get('input').val();
}}, 
  trigger: {
  selector: function() {
  _$jscoverage['/combobox/control.js'].functionData[21]++;
  _$jscoverage['/combobox/control.js'].lineData[380]++;
  return '.' + this.getBaseCssClass('trigger');
}}, 
  placeholder: {
  render: 1, 
  sync: 0, 
  parse: function() {
  _$jscoverage['/combobox/control.js'].functionData[22]++;
  _$jscoverage['/combobox/control.js'].lineData[395]++;
  var placeHolder = this.get('placeholderEl');
  _$jscoverage['/combobox/control.js'].lineData[396]++;
  return visit56_396_1(placeHolder && placeHolder.html());
}}, 
  placeholderEl: {
  selector: function() {
  _$jscoverage['/combobox/control.js'].functionData[23]++;
  _$jscoverage['/combobox/control.js'].lineData[406]++;
  return ('.' + this.getBaseCssClass('placeholder'));
}}, 
  clearEl: {
  selector: function() {
  _$jscoverage['/combobox/control.js'].functionData[24]++;
  _$jscoverage['/combobox/control.js'].lineData[412]++;
  return ('.' + this.getBaseCssClass('clear'));
}}, 
  validator: {}, 
  invalidEl: {
  selector: function() {
  _$jscoverage['/combobox/control.js'].functionData[25]++;
  _$jscoverage['/combobox/control.js'].lineData[433]++;
  return '.' + this.getBaseCssClass('invalid-el');
}}, 
  allowTextSelection: {
  value: true}, 
  hasTrigger: {
  value: true, 
  sync: 0, 
  render: 1}, 
  menu: {
  getter: function(v) {
  _$jscoverage['/combobox/control.js'].functionData[26]++;
  _$jscoverage['/combobox/control.js'].lineData[469]++;
  v = visit57_469_1(v || {});
  _$jscoverage['/combobox/control.js'].lineData[470]++;
  if (visit58_470_1(!v.isControl)) {
    _$jscoverage['/combobox/control.js'].lineData[471]++;
    v.xclass = visit59_471_1(v.xclass || 'popupmenu');
    _$jscoverage['/combobox/control.js'].lineData[472]++;
    v = this.createComponent(v);
    _$jscoverage['/combobox/control.js'].lineData[473]++;
    this.setInternal('menu', v);
  }
  _$jscoverage['/combobox/control.js'].lineData[475]++;
  return v;
}, 
  setter: function(m) {
  _$jscoverage['/combobox/control.js'].functionData[27]++;
  _$jscoverage['/combobox/control.js'].lineData[478]++;
  if (visit60_478_1(m.isControl)) {
    _$jscoverage['/combobox/control.js'].lineData[479]++;
    m.setInternal('parent', this);
    _$jscoverage['/combobox/control.js'].lineData[480]++;
    var align = {
  node: this.$el, 
  points: ['bl', 'tl'], 
  overflow: {
  adjustX: 1, 
  adjustY: 1}};
    _$jscoverage['/combobox/control.js'].lineData[488]++;
    util.mix(m.get('align'), align, false);
  }
}}, 
  collapsed: {
  render: 1, 
  sync: 0, 
  value: true}, 
  dataSource: {}, 
  maxItemCount: {
  value: 99999}, 
  matchElWidth: {
  value: true}, 
  format: {}, 
  updateInputOnDownUp: {
  value: true}, 
  autoHighlightFirst: {}, 
  highlightMatchItem: {
  value: true}}, 
  xclass: 'combobox'});
  _$jscoverage['/combobox/control.js'].lineData[592]++;
  function getFirstEnabledItem(children) {
    _$jscoverage['/combobox/control.js'].functionData[28]++;
    _$jscoverage['/combobox/control.js'].lineData[593]++;
    for (var i = 0; visit61_593_1(i < children.length); i++) {
      _$jscoverage['/combobox/control.js'].lineData[594]++;
      if (visit62_594_1(!children[i].get('disabled'))) {
        _$jscoverage['/combobox/control.js'].lineData[595]++;
        return children[i];
      }
    }
    _$jscoverage['/combobox/control.js'].lineData[598]++;
    return null;
  }
  _$jscoverage['/combobox/control.js'].lineData[601]++;
  function onMenuFocusout() {
    _$jscoverage['/combobox/control.js'].functionData[29]++;
    _$jscoverage['/combobox/control.js'].lineData[602]++;
    delayHide(this);
  }
  _$jscoverage['/combobox/control.js'].lineData[605]++;
  function onMenuFocusin() {
    _$jscoverage['/combobox/control.js'].functionData[30]++;
    _$jscoverage['/combobox/control.js'].lineData[606]++;
    var self = this;
    _$jscoverage['/combobox/control.js'].lineData[610]++;
    setTimeout(function() {
  _$jscoverage['/combobox/control.js'].functionData[31]++;
  _$jscoverage['/combobox/control.js'].lineData[611]++;
  clearDismissTimer(self);
}, 0);
  }
  _$jscoverage['/combobox/control.js'].lineData[615]++;
  function onMenuMouseOver() {
    _$jscoverage['/combobox/control.js'].functionData[32]++;
    _$jscoverage['/combobox/control.js'].lineData[616]++;
    var self = this;
    _$jscoverage['/combobox/control.js'].lineData[618]++;
    self.focus();
    _$jscoverage['/combobox/control.js'].lineData[620]++;
    clearDismissTimer(self);
  }
  _$jscoverage['/combobox/control.js'].lineData[623]++;
  function onMenuMouseDown() {
    _$jscoverage['/combobox/control.js'].functionData[33]++;
    _$jscoverage['/combobox/control.js'].lineData[624]++;
    var self = this;
    _$jscoverage['/combobox/control.js'].lineData[628]++;
    self.setCurrentValue(self.getCurrentValue(), {
  force: 1});
  }
  _$jscoverage['/combobox/control.js'].lineData[633]++;
  function onMenuAfterRenderUI(e) {
    _$jscoverage['/combobox/control.js'].functionData[34]++;
    _$jscoverage['/combobox/control.js'].lineData[634]++;
    var self = this, contentEl;
    _$jscoverage['/combobox/control.js'].lineData[636]++;
    var menu = self.get('menu');
    _$jscoverage['/combobox/control.js'].lineData[637]++;
    if (visit63_637_1(!e || visit64_637_2(menu === e.target))) {
      _$jscoverage['/combobox/control.js'].lineData[638]++;
      var input = self.get('input');
      _$jscoverage['/combobox/control.js'].lineData[639]++;
      var el = menu.get('el');
      _$jscoverage['/combobox/control.js'].lineData[640]++;
      contentEl = menu.get('contentEl');
      _$jscoverage['/combobox/control.js'].lineData[641]++;
      input.attr('aria-owns', el.attr('id'));
      _$jscoverage['/combobox/control.js'].lineData[643]++;
      el.on('focusout', onMenuFocusout, self);
      _$jscoverage['/combobox/control.js'].lineData[644]++;
      el.on('focusin', onMenuFocusin, self);
      _$jscoverage['/combobox/control.js'].lineData[645]++;
      contentEl.on('mouseover', onMenuMouseOver, self);
      _$jscoverage['/combobox/control.js'].lineData[648]++;
      contentEl.on('mousedown', onMenuMouseDown, self);
      _$jscoverage['/combobox/control.js'].lineData[649]++;
      if (visit65_649_1(self.get('matchElWidth'))) {
        _$jscoverage['/combobox/control.js'].lineData[650]++;
        el.getWindow().on('resize', onWindowResize, self);
      }
    }
  }
  _$jscoverage['/combobox/control.js'].lineData[655]++;
  function onWindowResize() {
    _$jscoverage['/combobox/control.js'].functionData[35]++;
    _$jscoverage['/combobox/control.js'].lineData[656]++;
    var self = this;
    _$jscoverage['/combobox/control.js'].lineData[657]++;
    var menu = self.get('menu');
    _$jscoverage['/combobox/control.js'].lineData[658]++;
    if (visit66_658_1(menu.get('visible'))) {
      _$jscoverage['/combobox/control.js'].lineData[659]++;
      var el = self.get('el');
      _$jscoverage['/combobox/control.js'].lineData[660]++;
      var menuEl = menu.get('el');
      _$jscoverage['/combobox/control.js'].lineData[661]++;
      var borderWidth = (visit67_661_1(parseInt(menuEl.css('borderLeftWidth'), 10) || 0)) + (visit68_662_1(parseInt(menuEl.css('borderRightWidth'), 10) || 0));
      _$jscoverage['/combobox/control.js'].lineData[663]++;
      menu.set('width', el[0].offsetWidth - borderWidth);
    }
  }
  _$jscoverage['/combobox/control.js'].lineData[667]++;
  function onMenuItemClick(e) {
    _$jscoverage['/combobox/control.js'].functionData[36]++;
    _$jscoverage['/combobox/control.js'].lineData[668]++;
    var item = e.target, self = this, textContent;
    _$jscoverage['/combobox/control.js'].lineData[671]++;
    if (visit69_671_1(item.isMenuItem)) {
      _$jscoverage['/combobox/control.js'].lineData[672]++;
      textContent = item.get('textContent');
      _$jscoverage['/combobox/control.js'].lineData[673]++;
      self.setCurrentValue(textContent);
      _$jscoverage['/combobox/control.js'].lineData[674]++;
      self._savedValue = textContent;
      _$jscoverage['/combobox/control.js'].lineData[675]++;
      self.set('collapsed', true);
    }
  }
  _$jscoverage['/combobox/control.js'].lineData[679]++;
  function setInvalid(self, error) {
    _$jscoverage['/combobox/control.js'].functionData[37]++;
    _$jscoverage['/combobox/control.js'].lineData[680]++;
    var $el = self.$el, cls = self.getBaseCssClasses('invalid'), invalidEl = self.get('invalidEl');
    _$jscoverage['/combobox/control.js'].lineData[683]++;
    if (visit70_683_1(error)) {
      _$jscoverage['/combobox/control.js'].lineData[684]++;
      $el.addClass(cls);
      _$jscoverage['/combobox/control.js'].lineData[685]++;
      invalidEl.attr('title', error);
      _$jscoverage['/combobox/control.js'].lineData[686]++;
      invalidEl.show();
    } else {
      _$jscoverage['/combobox/control.js'].lineData[688]++;
      $el.removeClass(cls);
      _$jscoverage['/combobox/control.js'].lineData[689]++;
      invalidEl.hide();
    }
  }
  _$jscoverage['/combobox/control.js'].lineData[693]++;
  function delayHide(self) {
    _$jscoverage['/combobox/control.js'].functionData[38]++;
    _$jscoverage['/combobox/control.js'].lineData[694]++;
    if (visit71_694_1(self._focusoutDismissTimer)) {
      _$jscoverage['/combobox/control.js'].lineData[695]++;
      return;
    }
    _$jscoverage['/combobox/control.js'].lineData[697]++;
    self._focusoutDismissTimer = setTimeout(function() {
  _$jscoverage['/combobox/control.js'].functionData[39]++;
  _$jscoverage['/combobox/control.js'].lineData[699]++;
  if (visit72_699_1(self._focusoutDismissTimer)) {
    _$jscoverage['/combobox/control.js'].lineData[700]++;
    self.set('collapsed', true);
  }
}, 50);
  }
  _$jscoverage['/combobox/control.js'].lineData[707]++;
  function clearDismissTimer(self) {
    _$jscoverage['/combobox/control.js'].functionData[40]++;
    _$jscoverage['/combobox/control.js'].lineData[708]++;
    var t = self._focusoutDismissTimer;
    _$jscoverage['/combobox/control.js'].lineData[709]++;
    if (visit73_709_1(t)) {
      _$jscoverage['/combobox/control.js'].lineData[710]++;
      clearTimeout(t);
      _$jscoverage['/combobox/control.js'].lineData[711]++;
      self._focusoutDismissTimer = null;
    }
  }
  _$jscoverage['/combobox/control.js'].lineData[715]++;
  function onValueChange(e) {
    _$jscoverage['/combobox/control.js'].functionData[41]++;
    _$jscoverage['/combobox/control.js'].lineData[716]++;
    this.setCurrentValue(e.target.value, {
  data: {
  causedByInputEvent: 1}});
  }
  _$jscoverage['/combobox/control.js'].lineData[723]++;
  function renderData(data) {
    _$jscoverage['/combobox/control.js'].functionData[42]++;
    _$jscoverage['/combobox/control.js'].lineData[724]++;
    var self = this, start, children = [], val, matchVal, i, menu = self.get('menu');
    _$jscoverage['/combobox/control.js'].lineData[732]++;
    data = self.normalizeData(data);
    _$jscoverage['/combobox/control.js'].lineData[734]++;
    menu.removeChildren(true);
    _$jscoverage['/combobox/control.js'].lineData[736]++;
    if (visit74_736_1(data && data.length)) {
      _$jscoverage['/combobox/control.js'].lineData[737]++;
      start = util.now();
      _$jscoverage['/combobox/control.js'].lineData[738]++;
      menu.addChildren(data);
      _$jscoverage['/combobox/control.js'].lineData[739]++;
      logger.info('render menu cost: ' + (util.now() - start) + ' ms');
      _$jscoverage['/combobox/control.js'].lineData[741]++;
      children = menu.get('children');
      _$jscoverage['/combobox/control.js'].lineData[744]++;
      val = self.getCurrentValue();
      _$jscoverage['/combobox/control.js'].lineData[746]++;
      if (visit75_746_1(self.get('highlightMatchItem'))) {
        _$jscoverage['/combobox/control.js'].lineData[747]++;
        for (i = 0; visit76_747_1(i < children.length); i++) {
          _$jscoverage['/combobox/control.js'].lineData[748]++;
          if (visit77_748_1(children[i].get('textContent') === val)) {
            _$jscoverage['/combobox/control.js'].lineData[749]++;
            children[i].set('highlighted', true);
            _$jscoverage['/combobox/control.js'].lineData[750]++;
            matchVal = true;
            _$jscoverage['/combobox/control.js'].lineData[751]++;
            break;
          }
        }
      }
      _$jscoverage['/combobox/control.js'].lineData[757]++;
      if (visit78_757_1(!matchVal && self.get('autoHighlightFirst'))) {
        _$jscoverage['/combobox/control.js'].lineData[758]++;
        for (i = 0; visit79_758_1(i < children.length); i++) {
          _$jscoverage['/combobox/control.js'].lineData[759]++;
          if (visit80_759_1(!children[i].get('disabled'))) {
            _$jscoverage['/combobox/control.js'].lineData[760]++;
            children[i].set('highlighted', true);
            _$jscoverage['/combobox/control.js'].lineData[761]++;
            break;
          }
        }
      }
      _$jscoverage['/combobox/control.js'].lineData[765]++;
      self.set('collapsed', false);
      _$jscoverage['/combobox/control.js'].lineData[767]++;
      self.fire('afterRenderData');
    } else {
      _$jscoverage['/combobox/control.js'].lineData[769]++;
      self.set('collapsed', true);
    }
  }
  _$jscoverage['/combobox/control.js'].lineData[775]++;
  return ComboBox;
});
