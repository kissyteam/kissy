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
  _$jscoverage['/combobox/control.js'].lineData[12] = 0;
  _$jscoverage['/combobox/control.js'].lineData[14] = 0;
  _$jscoverage['/combobox/control.js'].lineData[23] = 0;
  _$jscoverage['/combobox/control.js'].lineData[29] = 0;
  _$jscoverage['/combobox/control.js'].lineData[40] = 0;
  _$jscoverage['/combobox/control.js'].lineData[43] = 0;
  _$jscoverage['/combobox/control.js'].lineData[53] = 0;
  _$jscoverage['/combobox/control.js'].lineData[55] = 0;
  _$jscoverage['/combobox/control.js'].lineData[57] = 0;
  _$jscoverage['/combobox/control.js'].lineData[58] = 0;
  _$jscoverage['/combobox/control.js'].lineData[60] = 0;
  _$jscoverage['/combobox/control.js'].lineData[65] = 0;
  _$jscoverage['/combobox/control.js'].lineData[66] = 0;
  _$jscoverage['/combobox/control.js'].lineData[67] = 0;
  _$jscoverage['/combobox/control.js'].lineData[76] = 0;
  _$jscoverage['/combobox/control.js'].lineData[78] = 0;
  _$jscoverage['/combobox/control.js'].lineData[79] = 0;
  _$jscoverage['/combobox/control.js'].lineData[80] = 0;
  _$jscoverage['/combobox/control.js'].lineData[81] = 0;
  _$jscoverage['/combobox/control.js'].lineData[84] = 0;
  _$jscoverage['/combobox/control.js'].lineData[86] = 0;
  _$jscoverage['/combobox/control.js'].lineData[87] = 0;
  _$jscoverage['/combobox/control.js'].lineData[88] = 0;
  _$jscoverage['/combobox/control.js'].lineData[94] = 0;
  _$jscoverage['/combobox/control.js'].lineData[96] = 0;
  _$jscoverage['/combobox/control.js'].lineData[104] = 0;
  _$jscoverage['/combobox/control.js'].lineData[114] = 0;
  _$jscoverage['/combobox/control.js'].lineData[119] = 0;
  _$jscoverage['/combobox/control.js'].lineData[123] = 0;
  _$jscoverage['/combobox/control.js'].lineData[124] = 0;
  _$jscoverage['/combobox/control.js'].lineData[126] = 0;
  _$jscoverage['/combobox/control.js'].lineData[127] = 0;
  _$jscoverage['/combobox/control.js'].lineData[128] = 0;
  _$jscoverage['/combobox/control.js'].lineData[130] = 0;
  _$jscoverage['/combobox/control.js'].lineData[131] = 0;
  _$jscoverage['/combobox/control.js'].lineData[133] = 0;
  _$jscoverage['/combobox/control.js'].lineData[136] = 0;
  _$jscoverage['/combobox/control.js'].lineData[137] = 0;
  _$jscoverage['/combobox/control.js'].lineData[138] = 0;
  _$jscoverage['/combobox/control.js'].lineData[139] = 0;
  _$jscoverage['/combobox/control.js'].lineData[144] = 0;
  _$jscoverage['/combobox/control.js'].lineData[146] = 0;
  _$jscoverage['/combobox/control.js'].lineData[147] = 0;
  _$jscoverage['/combobox/control.js'].lineData[148] = 0;
  _$jscoverage['/combobox/control.js'].lineData[150] = 0;
  _$jscoverage['/combobox/control.js'].lineData[151] = 0;
  _$jscoverage['/combobox/control.js'].lineData[156] = 0;
  _$jscoverage['/combobox/control.js'].lineData[158] = 0;
  _$jscoverage['/combobox/control.js'].lineData[159] = 0;
  _$jscoverage['/combobox/control.js'].lineData[160] = 0;
  _$jscoverage['/combobox/control.js'].lineData[161] = 0;
  _$jscoverage['/combobox/control.js'].lineData[162] = 0;
  _$jscoverage['/combobox/control.js'].lineData[163] = 0;
  _$jscoverage['/combobox/control.js'].lineData[164] = 0;
  _$jscoverage['/combobox/control.js'].lineData[167] = 0;
  _$jscoverage['/combobox/control.js'].lineData[171] = 0;
  _$jscoverage['/combobox/control.js'].lineData[172] = 0;
  _$jscoverage['/combobox/control.js'].lineData[177] = 0;
  _$jscoverage['/combobox/control.js'].lineData[179] = 0;
  _$jscoverage['/combobox/control.js'].lineData[180] = 0;
  _$jscoverage['/combobox/control.js'].lineData[181] = 0;
  _$jscoverage['/combobox/control.js'].lineData[182] = 0;
  _$jscoverage['/combobox/control.js'].lineData[183] = 0;
  _$jscoverage['/combobox/control.js'].lineData[184] = 0;
  _$jscoverage['/combobox/control.js'].lineData[186] = 0;
  _$jscoverage['/combobox/control.js'].lineData[187] = 0;
  _$jscoverage['/combobox/control.js'].lineData[190] = 0;
  _$jscoverage['/combobox/control.js'].lineData[192] = 0;
  _$jscoverage['/combobox/control.js'].lineData[193] = 0;
  _$jscoverage['/combobox/control.js'].lineData[194] = 0;
  _$jscoverage['/combobox/control.js'].lineData[196] = 0;
  _$jscoverage['/combobox/control.js'].lineData[201] = 0;
  _$jscoverage['/combobox/control.js'].lineData[206] = 0;
  _$jscoverage['/combobox/control.js'].lineData[214] = 0;
  _$jscoverage['/combobox/control.js'].lineData[215] = 0;
  _$jscoverage['/combobox/control.js'].lineData[217] = 0;
  _$jscoverage['/combobox/control.js'].lineData[219] = 0;
  _$jscoverage['/combobox/control.js'].lineData[223] = 0;
  _$jscoverage['/combobox/control.js'].lineData[224] = 0;
  _$jscoverage['/combobox/control.js'].lineData[225] = 0;
  _$jscoverage['/combobox/control.js'].lineData[230] = 0;
  _$jscoverage['/combobox/control.js'].lineData[231] = 0;
  _$jscoverage['/combobox/control.js'].lineData[232] = 0;
  _$jscoverage['/combobox/control.js'].lineData[236] = 0;
  _$jscoverage['/combobox/control.js'].lineData[238] = 0;
  _$jscoverage['/combobox/control.js'].lineData[241] = 0;
  _$jscoverage['/combobox/control.js'].lineData[242] = 0;
  _$jscoverage['/combobox/control.js'].lineData[243] = 0;
  _$jscoverage['/combobox/control.js'].lineData[247] = 0;
  _$jscoverage['/combobox/control.js'].lineData[249] = 0;
  _$jscoverage['/combobox/control.js'].lineData[252] = 0;
  _$jscoverage['/combobox/control.js'].lineData[255] = 0;
  _$jscoverage['/combobox/control.js'].lineData[260] = 0;
  _$jscoverage['/combobox/control.js'].lineData[262] = 0;
  _$jscoverage['/combobox/control.js'].lineData[264] = 0;
  _$jscoverage['/combobox/control.js'].lineData[265] = 0;
  _$jscoverage['/combobox/control.js'].lineData[269] = 0;
  _$jscoverage['/combobox/control.js'].lineData[270] = 0;
  _$jscoverage['/combobox/control.js'].lineData[272] = 0;
  _$jscoverage['/combobox/control.js'].lineData[273] = 0;
  _$jscoverage['/combobox/control.js'].lineData[274] = 0;
  _$jscoverage['/combobox/control.js'].lineData[275] = 0;
  _$jscoverage['/combobox/control.js'].lineData[278] = 0;
  _$jscoverage['/combobox/control.js'].lineData[282] = 0;
  _$jscoverage['/combobox/control.js'].lineData[286] = 0;
  _$jscoverage['/combobox/control.js'].lineData[287] = 0;
  _$jscoverage['/combobox/control.js'].lineData[288] = 0;
  _$jscoverage['/combobox/control.js'].lineData[291] = 0;
  _$jscoverage['/combobox/control.js'].lineData[300] = 0;
  _$jscoverage['/combobox/control.js'].lineData[302] = 0;
  _$jscoverage['/combobox/control.js'].lineData[306] = 0;
  _$jscoverage['/combobox/control.js'].lineData[310] = 0;
  _$jscoverage['/combobox/control.js'].lineData[313] = 0;
  _$jscoverage['/combobox/control.js'].lineData[314] = 0;
  _$jscoverage['/combobox/control.js'].lineData[317] = 0;
  _$jscoverage['/combobox/control.js'].lineData[318] = 0;
  _$jscoverage['/combobox/control.js'].lineData[319] = 0;
  _$jscoverage['/combobox/control.js'].lineData[320] = 0;
  _$jscoverage['/combobox/control.js'].lineData[321] = 0;
  _$jscoverage['/combobox/control.js'].lineData[322] = 0;
  _$jscoverage['/combobox/control.js'].lineData[325] = 0;
  _$jscoverage['/combobox/control.js'].lineData[327] = 0;
  _$jscoverage['/combobox/control.js'].lineData[330] = 0;
  _$jscoverage['/combobox/control.js'].lineData[334] = 0;
  _$jscoverage['/combobox/control.js'].lineData[335] = 0;
  _$jscoverage['/combobox/control.js'].lineData[353] = 0;
  _$jscoverage['/combobox/control.js'].lineData[369] = 0;
  _$jscoverage['/combobox/control.js'].lineData[379] = 0;
  _$jscoverage['/combobox/control.js'].lineData[394] = 0;
  _$jscoverage['/combobox/control.js'].lineData[395] = 0;
  _$jscoverage['/combobox/control.js'].lineData[405] = 0;
  _$jscoverage['/combobox/control.js'].lineData[411] = 0;
  _$jscoverage['/combobox/control.js'].lineData[432] = 0;
  _$jscoverage['/combobox/control.js'].lineData[468] = 0;
  _$jscoverage['/combobox/control.js'].lineData[469] = 0;
  _$jscoverage['/combobox/control.js'].lineData[470] = 0;
  _$jscoverage['/combobox/control.js'].lineData[471] = 0;
  _$jscoverage['/combobox/control.js'].lineData[472] = 0;
  _$jscoverage['/combobox/control.js'].lineData[474] = 0;
  _$jscoverage['/combobox/control.js'].lineData[477] = 0;
  _$jscoverage['/combobox/control.js'].lineData[478] = 0;
  _$jscoverage['/combobox/control.js'].lineData[479] = 0;
  _$jscoverage['/combobox/control.js'].lineData[487] = 0;
  _$jscoverage['/combobox/control.js'].lineData[591] = 0;
  _$jscoverage['/combobox/control.js'].lineData[592] = 0;
  _$jscoverage['/combobox/control.js'].lineData[593] = 0;
  _$jscoverage['/combobox/control.js'].lineData[594] = 0;
  _$jscoverage['/combobox/control.js'].lineData[597] = 0;
  _$jscoverage['/combobox/control.js'].lineData[600] = 0;
  _$jscoverage['/combobox/control.js'].lineData[601] = 0;
  _$jscoverage['/combobox/control.js'].lineData[604] = 0;
  _$jscoverage['/combobox/control.js'].lineData[605] = 0;
  _$jscoverage['/combobox/control.js'].lineData[609] = 0;
  _$jscoverage['/combobox/control.js'].lineData[610] = 0;
  _$jscoverage['/combobox/control.js'].lineData[614] = 0;
  _$jscoverage['/combobox/control.js'].lineData[615] = 0;
  _$jscoverage['/combobox/control.js'].lineData[617] = 0;
  _$jscoverage['/combobox/control.js'].lineData[619] = 0;
  _$jscoverage['/combobox/control.js'].lineData[622] = 0;
  _$jscoverage['/combobox/control.js'].lineData[623] = 0;
  _$jscoverage['/combobox/control.js'].lineData[627] = 0;
  _$jscoverage['/combobox/control.js'].lineData[632] = 0;
  _$jscoverage['/combobox/control.js'].lineData[633] = 0;
  _$jscoverage['/combobox/control.js'].lineData[635] = 0;
  _$jscoverage['/combobox/control.js'].lineData[636] = 0;
  _$jscoverage['/combobox/control.js'].lineData[637] = 0;
  _$jscoverage['/combobox/control.js'].lineData[638] = 0;
  _$jscoverage['/combobox/control.js'].lineData[639] = 0;
  _$jscoverage['/combobox/control.js'].lineData[640] = 0;
  _$jscoverage['/combobox/control.js'].lineData[642] = 0;
  _$jscoverage['/combobox/control.js'].lineData[643] = 0;
  _$jscoverage['/combobox/control.js'].lineData[644] = 0;
  _$jscoverage['/combobox/control.js'].lineData[647] = 0;
  _$jscoverage['/combobox/control.js'].lineData[648] = 0;
  _$jscoverage['/combobox/control.js'].lineData[649] = 0;
  _$jscoverage['/combobox/control.js'].lineData[654] = 0;
  _$jscoverage['/combobox/control.js'].lineData[655] = 0;
  _$jscoverage['/combobox/control.js'].lineData[656] = 0;
  _$jscoverage['/combobox/control.js'].lineData[657] = 0;
  _$jscoverage['/combobox/control.js'].lineData[658] = 0;
  _$jscoverage['/combobox/control.js'].lineData[659] = 0;
  _$jscoverage['/combobox/control.js'].lineData[660] = 0;
  _$jscoverage['/combobox/control.js'].lineData[662] = 0;
  _$jscoverage['/combobox/control.js'].lineData[666] = 0;
  _$jscoverage['/combobox/control.js'].lineData[667] = 0;
  _$jscoverage['/combobox/control.js'].lineData[670] = 0;
  _$jscoverage['/combobox/control.js'].lineData[671] = 0;
  _$jscoverage['/combobox/control.js'].lineData[672] = 0;
  _$jscoverage['/combobox/control.js'].lineData[673] = 0;
  _$jscoverage['/combobox/control.js'].lineData[674] = 0;
  _$jscoverage['/combobox/control.js'].lineData[678] = 0;
  _$jscoverage['/combobox/control.js'].lineData[679] = 0;
  _$jscoverage['/combobox/control.js'].lineData[682] = 0;
  _$jscoverage['/combobox/control.js'].lineData[683] = 0;
  _$jscoverage['/combobox/control.js'].lineData[684] = 0;
  _$jscoverage['/combobox/control.js'].lineData[685] = 0;
  _$jscoverage['/combobox/control.js'].lineData[687] = 0;
  _$jscoverage['/combobox/control.js'].lineData[688] = 0;
  _$jscoverage['/combobox/control.js'].lineData[692] = 0;
  _$jscoverage['/combobox/control.js'].lineData[693] = 0;
  _$jscoverage['/combobox/control.js'].lineData[694] = 0;
  _$jscoverage['/combobox/control.js'].lineData[696] = 0;
  _$jscoverage['/combobox/control.js'].lineData[698] = 0;
  _$jscoverage['/combobox/control.js'].lineData[699] = 0;
  _$jscoverage['/combobox/control.js'].lineData[706] = 0;
  _$jscoverage['/combobox/control.js'].lineData[707] = 0;
  _$jscoverage['/combobox/control.js'].lineData[708] = 0;
  _$jscoverage['/combobox/control.js'].lineData[709] = 0;
  _$jscoverage['/combobox/control.js'].lineData[710] = 0;
  _$jscoverage['/combobox/control.js'].lineData[714] = 0;
  _$jscoverage['/combobox/control.js'].lineData[715] = 0;
  _$jscoverage['/combobox/control.js'].lineData[722] = 0;
  _$jscoverage['/combobox/control.js'].lineData[723] = 0;
  _$jscoverage['/combobox/control.js'].lineData[731] = 0;
  _$jscoverage['/combobox/control.js'].lineData[733] = 0;
  _$jscoverage['/combobox/control.js'].lineData[735] = 0;
  _$jscoverage['/combobox/control.js'].lineData[736] = 0;
  _$jscoverage['/combobox/control.js'].lineData[737] = 0;
  _$jscoverage['/combobox/control.js'].lineData[738] = 0;
  _$jscoverage['/combobox/control.js'].lineData[740] = 0;
  _$jscoverage['/combobox/control.js'].lineData[743] = 0;
  _$jscoverage['/combobox/control.js'].lineData[745] = 0;
  _$jscoverage['/combobox/control.js'].lineData[746] = 0;
  _$jscoverage['/combobox/control.js'].lineData[747] = 0;
  _$jscoverage['/combobox/control.js'].lineData[748] = 0;
  _$jscoverage['/combobox/control.js'].lineData[749] = 0;
  _$jscoverage['/combobox/control.js'].lineData[750] = 0;
  _$jscoverage['/combobox/control.js'].lineData[756] = 0;
  _$jscoverage['/combobox/control.js'].lineData[757] = 0;
  _$jscoverage['/combobox/control.js'].lineData[758] = 0;
  _$jscoverage['/combobox/control.js'].lineData[759] = 0;
  _$jscoverage['/combobox/control.js'].lineData[760] = 0;
  _$jscoverage['/combobox/control.js'].lineData[764] = 0;
  _$jscoverage['/combobox/control.js'].lineData[766] = 0;
  _$jscoverage['/combobox/control.js'].lineData[768] = 0;
  _$jscoverage['/combobox/control.js'].lineData[774] = 0;
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
  _$jscoverage['/combobox/control.js'].branchData['57'] = [];
  _$jscoverage['/combobox/control.js'].branchData['57'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['78'] = [];
  _$jscoverage['/combobox/control.js'].branchData['78'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['80'] = [];
  _$jscoverage['/combobox/control.js'].branchData['80'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['86'] = [];
  _$jscoverage['/combobox/control.js'].branchData['86'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['123'] = [];
  _$jscoverage['/combobox/control.js'].branchData['123'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['126'] = [];
  _$jscoverage['/combobox/control.js'].branchData['126'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['136'] = [];
  _$jscoverage['/combobox/control.js'].branchData['136'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['138'] = [];
  _$jscoverage['/combobox/control.js'].branchData['138'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['147'] = [];
  _$jscoverage['/combobox/control.js'].branchData['147'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['160'] = [];
  _$jscoverage['/combobox/control.js'].branchData['160'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['162'] = [];
  _$jscoverage['/combobox/control.js'].branchData['162'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['163'] = [];
  _$jscoverage['/combobox/control.js'].branchData['163'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['163'][2] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['171'] = [];
  _$jscoverage['/combobox/control.js'].branchData['171'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['183'] = [];
  _$jscoverage['/combobox/control.js'].branchData['183'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['183'][2] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['183'][3] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['184'] = [];
  _$jscoverage['/combobox/control.js'].branchData['184'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['193'] = [];
  _$jscoverage['/combobox/control.js'].branchData['193'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['193'][2] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['193'][3] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['217'] = [];
  _$jscoverage['/combobox/control.js'].branchData['217'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['223'] = [];
  _$jscoverage['/combobox/control.js'].branchData['223'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['225'] = [];
  _$jscoverage['/combobox/control.js'].branchData['225'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['225'][2] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['225'][3] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['226'] = [];
  _$jscoverage['/combobox/control.js'].branchData['226'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['227'] = [];
  _$jscoverage['/combobox/control.js'].branchData['227'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['227'][2] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['228'] = [];
  _$jscoverage['/combobox/control.js'].branchData['228'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['241'] = [];
  _$jscoverage['/combobox/control.js'].branchData['241'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['243'] = [];
  _$jscoverage['/combobox/control.js'].branchData['243'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['252'] = [];
  _$jscoverage['/combobox/control.js'].branchData['252'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['260'] = [];
  _$jscoverage['/combobox/control.js'].branchData['260'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['260'][2] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['264'] = [];
  _$jscoverage['/combobox/control.js'].branchData['264'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['270'] = [];
  _$jscoverage['/combobox/control.js'].branchData['270'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['270'][2] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['270'][3] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['273'] = [];
  _$jscoverage['/combobox/control.js'].branchData['273'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['286'] = [];
  _$jscoverage['/combobox/control.js'].branchData['286'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['313'] = [];
  _$jscoverage['/combobox/control.js'].branchData['313'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['318'] = [];
  _$jscoverage['/combobox/control.js'].branchData['318'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['319'] = [];
  _$jscoverage['/combobox/control.js'].branchData['319'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['323'] = [];
  _$jscoverage['/combobox/control.js'].branchData['323'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['324'] = [];
  _$jscoverage['/combobox/control.js'].branchData['324'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['395'] = [];
  _$jscoverage['/combobox/control.js'].branchData['395'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['468'] = [];
  _$jscoverage['/combobox/control.js'].branchData['468'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['469'] = [];
  _$jscoverage['/combobox/control.js'].branchData['469'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['470'] = [];
  _$jscoverage['/combobox/control.js'].branchData['470'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['477'] = [];
  _$jscoverage['/combobox/control.js'].branchData['477'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['592'] = [];
  _$jscoverage['/combobox/control.js'].branchData['592'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['593'] = [];
  _$jscoverage['/combobox/control.js'].branchData['593'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['636'] = [];
  _$jscoverage['/combobox/control.js'].branchData['636'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['636'][2] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['648'] = [];
  _$jscoverage['/combobox/control.js'].branchData['648'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['657'] = [];
  _$jscoverage['/combobox/control.js'].branchData['657'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['660'] = [];
  _$jscoverage['/combobox/control.js'].branchData['660'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['661'] = [];
  _$jscoverage['/combobox/control.js'].branchData['661'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['670'] = [];
  _$jscoverage['/combobox/control.js'].branchData['670'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['682'] = [];
  _$jscoverage['/combobox/control.js'].branchData['682'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['693'] = [];
  _$jscoverage['/combobox/control.js'].branchData['693'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['698'] = [];
  _$jscoverage['/combobox/control.js'].branchData['698'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['708'] = [];
  _$jscoverage['/combobox/control.js'].branchData['708'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['735'] = [];
  _$jscoverage['/combobox/control.js'].branchData['735'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['745'] = [];
  _$jscoverage['/combobox/control.js'].branchData['745'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['746'] = [];
  _$jscoverage['/combobox/control.js'].branchData['746'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['747'] = [];
  _$jscoverage['/combobox/control.js'].branchData['747'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['756'] = [];
  _$jscoverage['/combobox/control.js'].branchData['756'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['757'] = [];
  _$jscoverage['/combobox/control.js'].branchData['757'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['758'] = [];
  _$jscoverage['/combobox/control.js'].branchData['758'][1] = new BranchData();
}
_$jscoverage['/combobox/control.js'].branchData['758'][1].init(26, 28, '!children[i].get(\'disabled\')');
function visit81_758_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['758'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['757'][1].init(30, 19, 'i < children.length');
function visit80_757_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['757'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['756'][1].init(781, 43, '!matchVal && self.get(\'autoHighlightFirst\')');
function visit79_756_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['756'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['747'][1].init(26, 38, 'children[i].get(\'textContent\') === val');
function visit78_747_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['747'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['746'][1].init(30, 19, 'i < children.length');
function visit77_746_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['746'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['745'][1].init(331, 30, 'self.get(\'highlightMatchItem\')');
function visit76_745_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['745'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['735'][1].init(267, 19, 'data && data.length');
function visit75_735_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['735'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['708'][1].init(59, 1, 't');
function visit74_708_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['708'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['698'][1].init(50, 26, 'self._focusoutDismissTimer');
function visit73_698_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['698'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['693'][1].init(14, 26, 'self._focusoutDismissTimer');
function visit72_693_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['693'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['682'][1].init(145, 5, 'error');
function visit71_682_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['682'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['670'][1].init(96, 15, 'item.isMenuItem');
function visit70_670_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['670'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['661'][1].init(69, 49, 'parseInt(menuEl.css(\'borderRightWidth\'), 10) || 0');
function visit69_661_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['661'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['660'][1].init(113, 48, 'parseInt(menuEl.css(\'borderLeftWidth\'), 10) || 0');
function visit68_660_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['660'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['657'][1].init(78, 19, 'menu.get(\'visible\')');
function visit67_657_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['657'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['648'][1].init(571, 24, 'self.get(\'matchElWidth\')');
function visit66_648_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['648'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['636'][2].init(108, 17, 'menu === e.target');
function visit65_636_2(result) {
  _$jscoverage['/combobox/control.js'].branchData['636'][2].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['636'][1].init(102, 23, '!e || menu === e.target');
function visit64_636_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['636'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['593'][1].init(18, 28, '!children[i].get(\'disabled\')');
function visit63_593_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['593'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['592'][1].init(26, 19, 'i < children.length');
function visit62_592_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['592'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['477'][1].init(26, 11, 'm.isControl');
function visit61_477_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['477'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['470'][1].init(37, 23, 'v.xclass || \'popupmenu\'');
function visit60_470_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['470'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['469'][1].init(60, 12, '!v.isControl');
function visit59_469_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['469'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['468'][1].init(26, 7, 'v || {}');
function visit58_468_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['468'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['395'][1].init(95, 33, 'placeHolder && placeHolder.html()');
function visit57_395_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['395'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['324'][1].init(81, 49, 'parseInt(menuEl.css(\'borderRightWidth\'), 10) || 0');
function visit56_324_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['324'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['323'][1].init(43, 48, 'parseInt(menuEl.css(\'borderLeftWidth\'), 10) || 0');
function visit55_323_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['323'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['319'][1].init(26, 24, 'self.get(\'matchElWidth\')');
function visit54_319_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['319'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['318'][1].init(107, 20, '!menu.get(\'visible\')');
function visit53_318_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['318'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['313'][1].init(122, 1, 'v');
function visit52_313_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['313'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['286'][1].init(149, 9, 'validator');
function visit51_286_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['286'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['273'][1].init(125, 15, 'v !== undefined');
function visit50_273_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['273'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['270'][3].init(2752, 22, 'keyCode === KeyCode.UP');
function visit49_270_3(result) {
  _$jscoverage['/combobox/control.js'].branchData['270'][3].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['270'][2].init(2724, 24, 'keyCode === KeyCode.DOWN');
function visit48_270_2(result) {
  _$jscoverage['/combobox/control.js'].branchData['270'][2].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['270'][1].init(2724, 50, 'keyCode === KeyCode.DOWN || keyCode === KeyCode.UP');
function visit47_270_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['270'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['264'][1].init(200, 20, 'self.get(\'multiple\')');
function visit46_264_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['264'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['260'][2].init(1919, 23, 'keyCode === KeyCode.TAB');
function visit45_260_2(result) {
  _$jscoverage['/combobox/control.js'].branchData['260'][2].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['260'][1].init(1919, 42, 'keyCode === KeyCode.TAB && highlightedItem');
function visit44_260_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['260'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['252'][1].init(1519, 90, 'updateInputOnDownUp && S.inArray(keyCode, [KeyCode.DOWN, KeyCode.UP])');
function visit43_252_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['252'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['243'][1].init(76, 19, 'updateInputOnDownUp');
function visit42_243_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['243'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['241'][1].init(1042, 23, 'keyCode === KeyCode.ESC');
function visit41_241_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['241'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['228'][1].init(50, 53, 'highlightedItem === getFirstEnabledItem(menuChildren)');
function visit40_228_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['228'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['227'][2].init(244, 22, 'keyCode === KeyCode.UP');
function visit39_227_2(result) {
  _$jscoverage['/combobox/control.js'].branchData['227'][2].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['227'][1].init(153, 104, 'keyCode === KeyCode.UP && highlightedItem === getFirstEnabledItem(menuChildren)');
function visit38_227_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['227'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['226'][1].init(52, 72, 'highlightedItem === getFirstEnabledItem(menuChildren.concat().reverse())');
function visit37_226_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['226'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['225'][3].init(88, 24, 'keyCode === KeyCode.DOWN');
function visit36_225_3(result) {
  _$jscoverage['/combobox/control.js'].branchData['225'][3].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['225'][2].init(88, 125, 'keyCode === KeyCode.DOWN && highlightedItem === getFirstEnabledItem(menuChildren.concat().reverse())');
function visit35_225_2(result) {
  _$jscoverage['/combobox/control.js'].branchData['225'][2].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['225'][1].init(88, 258, 'keyCode === KeyCode.DOWN && highlightedItem === getFirstEnabledItem(menuChildren.concat().reverse()) || keyCode === KeyCode.UP && highlightedItem === getFirstEnabledItem(menuChildren)');
function visit34_225_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['225'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['223'][1].init(233, 38, 'updateInputOnDownUp && highlightedItem');
function visit33_223_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['223'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['217'][1].init(368, 19, 'menu.get(\'visible\')');
function visit32_217_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['217'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['193'][3].init(690, 21, 'clearEl[0] === target');
function visit31_193_3(result) {
  _$jscoverage['/combobox/control.js'].branchData['193'][3].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['193'][2].init(690, 49, 'clearEl[0] === target || clearEl.contains(target)');
function visit30_193_2(result) {
  _$jscoverage['/combobox/control.js'].branchData['193'][2].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['193'][1].init(678, 62, 'clearEl && (clearEl[0] === target || clearEl.contains(target))');
function visit29_193_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['193'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['184'][1].init(22, 21, 'self.get(\'collapsed\')');
function visit28_184_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['184'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['183'][3].init(255, 21, 'trigger[0] === target');
function visit27_183_3(result) {
  _$jscoverage['/combobox/control.js'].branchData['183'][3].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['183'][2].init(255, 49, 'trigger[0] === target || trigger.contains(target)');
function visit26_183_2(result) {
  _$jscoverage['/combobox/control.js'].branchData['183'][2].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['183'][1].init(243, 62, 'trigger && (trigger[0] === target || trigger.contains(target))');
function visit25_183_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['183'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['171'][1].init(605, 35, 'placeholderEl && !self.get(\'value\')');
function visit24_171_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['171'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['163'][2].init(55, 25, 'val === self.get(\'value\')');
function visit23_163_2(result) {
  _$jscoverage['/combobox/control.js'].branchData['163'][2].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['163'][1].init(30, 51, '!self.get(\'focused\') && (val === self.get(\'value\'))');
function visit22_163_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['163'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['162'][1].init(26, 5, 'error');
function visit21_162_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['162'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['160'][1].init(170, 21, 'self.get(\'invalidEl\')');
function visit20_160_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['160'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['147'][1].init(118, 21, 'self.get(\'invalidEl\')');
function visit19_147_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['147'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['138'][1].init(707, 13, '!v && clearEl');
function visit18_138_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['138'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['136'][1].init(633, 12, 'v && clearEl');
function visit17_136_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['136'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['126'][1].init(127, 19, 'value === undefined');
function visit16_126_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['126'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['123'][1].init(178, 20, 'e.causedByInputEvent');
function visit15_123_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['123'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['86'][1].init(337, 15, 'i < data.length');
function visit14_86_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['86'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['80'][1].init(87, 18, 'self.get(\'format\')');
function visit13_80_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['80'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['78'][1].init(84, 19, 'data && data.length');
function visit12_78_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['78'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['57'][1].init(520, 20, 'menu.get(\'rendered\')');
function visit11_57_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['57'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/combobox/control.js'].functionData[0]++;
  _$jscoverage['/combobox/control.js'].lineData[7]++;
  var logger = S.getLogger('combobox');
  _$jscoverage['/combobox/control.js'].lineData[8]++;
  var Node = require('node');
  _$jscoverage['/combobox/control.js'].lineData[9]++;
  var Control = require('component/control');
  _$jscoverage['/combobox/control.js'].lineData[10]++;
  var ComboboxTpl = require('./combobox-xtpl');
  _$jscoverage['/combobox/control.js'].lineData[12]++;
  require('menu');
  _$jscoverage['/combobox/control.js'].lineData[14]++;
  var ComboBox, KeyCode = Node.KeyCode;
  _$jscoverage['/combobox/control.js'].lineData[23]++;
  ComboBox = Control.extend({
  initializer: function() {
  _$jscoverage['/combobox/control.js'].functionData[1]++;
  _$jscoverage['/combobox/control.js'].lineData[29]++;
  this.publish('afterRenderData', {
  bubbles: false});
}, 
  _savedValue: null, 
  bindUI: function() {
  _$jscoverage['/combobox/control.js'].functionData[2]++;
  _$jscoverage['/combobox/control.js'].lineData[40]++;
  var self = this, input = self.get('input');
  _$jscoverage['/combobox/control.js'].lineData[43]++;
  input.on('input', onValueChange, self);
  _$jscoverage['/combobox/control.js'].lineData[53]++;
  self.on('click', onMenuItemClick, self);
  _$jscoverage['/combobox/control.js'].lineData[55]++;
  var menu = self.get('menu');
  _$jscoverage['/combobox/control.js'].lineData[57]++;
  if (visit11_57_1(menu.get('rendered'))) {
    _$jscoverage['/combobox/control.js'].lineData[58]++;
    onMenuAfterRenderUI.call(self);
  } else {
    _$jscoverage['/combobox/control.js'].lineData[60]++;
    menu.on('afterRenderUI', onMenuAfterRenderUI, self);
  }
}, 
  destructor: function() {
  _$jscoverage['/combobox/control.js'].functionData[3]++;
  _$jscoverage['/combobox/control.js'].lineData[65]++;
  var self = this;
  _$jscoverage['/combobox/control.js'].lineData[66]++;
  self.get('menu').destroy();
  _$jscoverage['/combobox/control.js'].lineData[67]++;
  self.$el.getWindow().detach('resize', onWindowResize, self);
}, 
  normalizeData: function(data) {
  _$jscoverage['/combobox/control.js'].functionData[4]++;
  _$jscoverage['/combobox/control.js'].lineData[76]++;
  var self = this, contents, v, i, c;
  _$jscoverage['/combobox/control.js'].lineData[78]++;
  if (visit12_78_1(data && data.length)) {
    _$jscoverage['/combobox/control.js'].lineData[79]++;
    data = data.slice(0, self.get('maxItemCount'));
    _$jscoverage['/combobox/control.js'].lineData[80]++;
    if (visit13_80_1(self.get('format'))) {
      _$jscoverage['/combobox/control.js'].lineData[81]++;
      contents = self.get('format').call(self, self.getCurrentValue(), data);
    } else {
      _$jscoverage['/combobox/control.js'].lineData[84]++;
      contents = [];
    }
    _$jscoverage['/combobox/control.js'].lineData[86]++;
    for (i = 0; visit14_86_1(i < data.length); i++) {
      _$jscoverage['/combobox/control.js'].lineData[87]++;
      v = data[i];
      _$jscoverage['/combobox/control.js'].lineData[88]++;
      c = contents[i] = S.mix({
  content: v, 
  textContent: v, 
  value: v}, contents[i]);
    }
    _$jscoverage['/combobox/control.js'].lineData[94]++;
    return contents;
  }
  _$jscoverage['/combobox/control.js'].lineData[96]++;
  return contents;
}, 
  getCurrentValue: function() {
  _$jscoverage['/combobox/control.js'].functionData[5]++;
  _$jscoverage['/combobox/control.js'].lineData[104]++;
  return this.get('value');
}, 
  setCurrentValue: function(value, setCfg) {
  _$jscoverage['/combobox/control.js'].functionData[6]++;
  _$jscoverage['/combobox/control.js'].lineData[114]++;
  this.set('value', value, setCfg);
}, 
  _onSetValue: function(v, e) {
  _$jscoverage['/combobox/control.js'].functionData[7]++;
  _$jscoverage['/combobox/control.js'].lineData[119]++;
  var self = this, clearEl = self.get('clearEl'), value;
  _$jscoverage['/combobox/control.js'].lineData[123]++;
  if (visit15_123_1(e.causedByInputEvent)) {
    _$jscoverage['/combobox/control.js'].lineData[124]++;
    value = self.getCurrentValue();
    _$jscoverage['/combobox/control.js'].lineData[126]++;
    if (visit16_126_1(value === undefined)) {
      _$jscoverage['/combobox/control.js'].lineData[127]++;
      self.set('collapsed', true);
      _$jscoverage['/combobox/control.js'].lineData[128]++;
      return;
    }
    _$jscoverage['/combobox/control.js'].lineData[130]++;
    self._savedValue = value;
    _$jscoverage['/combobox/control.js'].lineData[131]++;
    self.sendRequest(value);
  } else {
    _$jscoverage['/combobox/control.js'].lineData[133]++;
    self.get('input').val(v);
  }
  _$jscoverage['/combobox/control.js'].lineData[136]++;
  if (visit17_136_1(v && clearEl)) {
    _$jscoverage['/combobox/control.js'].lineData[137]++;
    clearEl.show();
  } else {
    _$jscoverage['/combobox/control.js'].lineData[138]++;
    if (visit18_138_1(!v && clearEl)) {
      _$jscoverage['/combobox/control.js'].lineData[139]++;
      clearEl.hide();
    }
  }
}, 
  handleFocusInternal: function() {
  _$jscoverage['/combobox/control.js'].functionData[8]++;
  _$jscoverage['/combobox/control.js'].lineData[144]++;
  var self = this, placeholderEl;
  _$jscoverage['/combobox/control.js'].lineData[146]++;
  clearDismissTimer(self);
  _$jscoverage['/combobox/control.js'].lineData[147]++;
  if (visit19_147_1(self.get('invalidEl'))) {
    _$jscoverage['/combobox/control.js'].lineData[148]++;
    setInvalid(self, false);
  }
  _$jscoverage['/combobox/control.js'].lineData[150]++;
  if ((placeholderEl = self.get('placeholderEl'))) {
    _$jscoverage['/combobox/control.js'].lineData[151]++;
    placeholderEl.hide();
  }
}, 
  handleBlurInternal: function(e) {
  _$jscoverage['/combobox/control.js'].functionData[9]++;
  _$jscoverage['/combobox/control.js'].lineData[156]++;
  var self = this, placeholderEl = self.get('placeholderEl');
  _$jscoverage['/combobox/control.js'].lineData[158]++;
  self.callSuper(e);
  _$jscoverage['/combobox/control.js'].lineData[159]++;
  delayHide(self);
  _$jscoverage['/combobox/control.js'].lineData[160]++;
  if (visit20_160_1(self.get('invalidEl'))) {
    _$jscoverage['/combobox/control.js'].lineData[161]++;
    self.validate(function(error, val) {
  _$jscoverage['/combobox/control.js'].functionData[10]++;
  _$jscoverage['/combobox/control.js'].lineData[162]++;
  if (visit21_162_1(error)) {
    _$jscoverage['/combobox/control.js'].lineData[163]++;
    if (visit22_163_1(!self.get('focused') && (visit23_163_2(val === self.get('value'))))) {
      _$jscoverage['/combobox/control.js'].lineData[164]++;
      setInvalid(self, error);
    }
  } else {
    _$jscoverage['/combobox/control.js'].lineData[167]++;
    setInvalid(self, false);
  }
});
  }
  _$jscoverage['/combobox/control.js'].lineData[171]++;
  if (visit24_171_1(placeholderEl && !self.get('value'))) {
    _$jscoverage['/combobox/control.js'].lineData[172]++;
    placeholderEl.show();
  }
}, 
  handleMouseDownInternal: function(e) {
  _$jscoverage['/combobox/control.js'].functionData[11]++;
  _$jscoverage['/combobox/control.js'].lineData[177]++;
  var self = this, target, clearEl, trigger;
  _$jscoverage['/combobox/control.js'].lineData[179]++;
  self.callSuper(e);
  _$jscoverage['/combobox/control.js'].lineData[180]++;
  target = e.target;
  _$jscoverage['/combobox/control.js'].lineData[181]++;
  trigger = self.get('trigger');
  _$jscoverage['/combobox/control.js'].lineData[182]++;
  clearEl = self.get('clearEl');
  _$jscoverage['/combobox/control.js'].lineData[183]++;
  if (visit25_183_1(trigger && (visit26_183_2(visit27_183_3(trigger[0] === target) || trigger.contains(target))))) {
    _$jscoverage['/combobox/control.js'].lineData[184]++;
    if (visit28_184_1(self.get('collapsed'))) {
      _$jscoverage['/combobox/control.js'].lineData[186]++;
      self.focus();
      _$jscoverage['/combobox/control.js'].lineData[187]++;
      self.sendRequest('');
    } else {
      _$jscoverage['/combobox/control.js'].lineData[190]++;
      self.set('collapsed', true);
    }
    _$jscoverage['/combobox/control.js'].lineData[192]++;
    e.preventDefault();
  } else {
    _$jscoverage['/combobox/control.js'].lineData[193]++;
    if (visit29_193_1(clearEl && (visit30_193_2(visit31_193_3(clearEl[0] === target) || clearEl.contains(target))))) {
      _$jscoverage['/combobox/control.js'].lineData[194]++;
      self.get('input').val('');
      _$jscoverage['/combobox/control.js'].lineData[196]++;
      self.setCurrentValue('', {
  data: {
  causedByInputEvent: 1}});
      _$jscoverage['/combobox/control.js'].lineData[201]++;
      clearEl.hide();
    }
  }
}, 
  handleKeyDownInternal: function(e) {
  _$jscoverage['/combobox/control.js'].functionData[12]++;
  _$jscoverage['/combobox/control.js'].lineData[206]++;
  var self = this, updateInputOnDownUp, input, keyCode = e.keyCode, highlightedItem, handledByMenu, menu = self.get('menu');
  _$jscoverage['/combobox/control.js'].lineData[214]++;
  input = self.get('input');
  _$jscoverage['/combobox/control.js'].lineData[215]++;
  updateInputOnDownUp = self.get('updateInputOnDownUp');
  _$jscoverage['/combobox/control.js'].lineData[217]++;
  if (visit32_217_1(menu.get('visible'))) {
    _$jscoverage['/combobox/control.js'].lineData[219]++;
    highlightedItem = menu.get('highlightedItem');
    _$jscoverage['/combobox/control.js'].lineData[223]++;
    if (visit33_223_1(updateInputOnDownUp && highlightedItem)) {
      _$jscoverage['/combobox/control.js'].lineData[224]++;
      var menuChildren = menu.get('children');
      _$jscoverage['/combobox/control.js'].lineData[225]++;
      if (visit34_225_1(visit35_225_2(visit36_225_3(keyCode === KeyCode.DOWN) && visit37_226_1(highlightedItem === getFirstEnabledItem(menuChildren.concat().reverse()))) || visit38_227_1(visit39_227_2(keyCode === KeyCode.UP) && visit40_228_1(highlightedItem === getFirstEnabledItem(menuChildren))))) {
        _$jscoverage['/combobox/control.js'].lineData[230]++;
        self.setCurrentValue(self._savedValue);
        _$jscoverage['/combobox/control.js'].lineData[231]++;
        highlightedItem.set('highlighted', false);
        _$jscoverage['/combobox/control.js'].lineData[232]++;
        return true;
      }
    }
    _$jscoverage['/combobox/control.js'].lineData[236]++;
    handledByMenu = menu.handleKeyDownInternal(e);
    _$jscoverage['/combobox/control.js'].lineData[238]++;
    highlightedItem = menu.get('highlightedItem');
    _$jscoverage['/combobox/control.js'].lineData[241]++;
    if (visit41_241_1(keyCode === KeyCode.ESC)) {
      _$jscoverage['/combobox/control.js'].lineData[242]++;
      self.set('collapsed', true);
      _$jscoverage['/combobox/control.js'].lineData[243]++;
      if (visit42_243_1(updateInputOnDownUp)) {
        _$jscoverage['/combobox/control.js'].lineData[247]++;
        self.setCurrentValue(self._savedValue);
      }
      _$jscoverage['/combobox/control.js'].lineData[249]++;
      return true;
    }
    _$jscoverage['/combobox/control.js'].lineData[252]++;
    if (visit43_252_1(updateInputOnDownUp && S.inArray(keyCode, [KeyCode.DOWN, KeyCode.UP]))) {
      _$jscoverage['/combobox/control.js'].lineData[255]++;
      self.setCurrentValue(highlightedItem.get('textContent'));
    }
    _$jscoverage['/combobox/control.js'].lineData[260]++;
    if (visit44_260_1(visit45_260_2(keyCode === KeyCode.TAB) && highlightedItem)) {
      _$jscoverage['/combobox/control.js'].lineData[262]++;
      highlightedItem.handleClickInternal(e);
      _$jscoverage['/combobox/control.js'].lineData[264]++;
      if (visit46_264_1(self.get('multiple'))) {
        _$jscoverage['/combobox/control.js'].lineData[265]++;
        return true;
      }
    }
    _$jscoverage['/combobox/control.js'].lineData[269]++;
    return handledByMenu;
  } else {
    _$jscoverage['/combobox/control.js'].lineData[270]++;
    if (visit47_270_1(visit48_270_2(keyCode === KeyCode.DOWN) || visit49_270_3(keyCode === KeyCode.UP))) {
      _$jscoverage['/combobox/control.js'].lineData[272]++;
      var v = self.getCurrentValue();
      _$jscoverage['/combobox/control.js'].lineData[273]++;
      if (visit50_273_1(v !== undefined)) {
        _$jscoverage['/combobox/control.js'].lineData[274]++;
        self.sendRequest(v);
        _$jscoverage['/combobox/control.js'].lineData[275]++;
        return true;
      }
    }
  }
  _$jscoverage['/combobox/control.js'].lineData[278]++;
  return undefined;
}, 
  validate: function(callback) {
  _$jscoverage['/combobox/control.js'].functionData[13]++;
  _$jscoverage['/combobox/control.js'].lineData[282]++;
  var self = this, validator = self.get('validator'), val = self.getCurrentValue();
  _$jscoverage['/combobox/control.js'].lineData[286]++;
  if (visit51_286_1(validator)) {
    _$jscoverage['/combobox/control.js'].lineData[287]++;
    validator(val, function(error) {
  _$jscoverage['/combobox/control.js'].functionData[14]++;
  _$jscoverage['/combobox/control.js'].lineData[288]++;
  callback(error, val);
});
  } else {
    _$jscoverage['/combobox/control.js'].lineData[291]++;
    callback(false, val);
  }
}, 
  sendRequest: function(value) {
  _$jscoverage['/combobox/control.js'].functionData[15]++;
  _$jscoverage['/combobox/control.js'].lineData[300]++;
  var self = this, dataSource = self.get('dataSource');
  _$jscoverage['/combobox/control.js'].lineData[302]++;
  dataSource.fetchData(value, renderData, self);
}, 
  getKeyEventTarget: function() {
  _$jscoverage['/combobox/control.js'].functionData[16]++;
  _$jscoverage['/combobox/control.js'].lineData[306]++;
  return this.get('input');
}, 
  _onSetCollapsed: function(v) {
  _$jscoverage['/combobox/control.js'].functionData[17]++;
  _$jscoverage['/combobox/control.js'].lineData[310]++;
  var self = this, el = self.$el, menu = self.get('menu');
  _$jscoverage['/combobox/control.js'].lineData[313]++;
  if (visit52_313_1(v)) {
    _$jscoverage['/combobox/control.js'].lineData[314]++;
    menu.hide();
  } else {
    _$jscoverage['/combobox/control.js'].lineData[317]++;
    clearDismissTimer(self);
    _$jscoverage['/combobox/control.js'].lineData[318]++;
    if (visit53_318_1(!menu.get('visible'))) {
      _$jscoverage['/combobox/control.js'].lineData[319]++;
      if (visit54_319_1(self.get('matchElWidth'))) {
        _$jscoverage['/combobox/control.js'].lineData[320]++;
        menu.render();
        _$jscoverage['/combobox/control.js'].lineData[321]++;
        var menuEl = menu.get('el');
        _$jscoverage['/combobox/control.js'].lineData[322]++;
        var borderWidth = (visit55_323_1(parseInt(menuEl.css('borderLeftWidth'), 10) || 0)) + (visit56_324_1(parseInt(menuEl.css('borderRightWidth'), 10) || 0));
        _$jscoverage['/combobox/control.js'].lineData[325]++;
        menu.set('width', el[0].offsetWidth - borderWidth);
      }
      _$jscoverage['/combobox/control.js'].lineData[327]++;
      menu.show();
    }
  }
  _$jscoverage['/combobox/control.js'].lineData[330]++;
  this.get('input').attr('aria-expanded', !v);
}, 
  _onSetDisabled: function(v, e) {
  _$jscoverage['/combobox/control.js'].functionData[18]++;
  _$jscoverage['/combobox/control.js'].lineData[334]++;
  this.callSuper(v, e);
  _$jscoverage['/combobox/control.js'].lineData[335]++;
  this.get('input').attr('disabled', v);
}}, {
  ATTRS: {
  contentTpl: {
  value: ComboboxTpl}, 
  input: {
  selector: function() {
  _$jscoverage['/combobox/control.js'].functionData[19]++;
  _$jscoverage['/combobox/control.js'].lineData[353]++;
  return ('.' + this.getBaseCssClass('input'));
}}, 
  value: {
  value: '', 
  sync: 0, 
  render: 1, 
  parse: function() {
  _$jscoverage['/combobox/control.js'].functionData[20]++;
  _$jscoverage['/combobox/control.js'].lineData[369]++;
  return this.get('input').val();
}}, 
  trigger: {
  selector: function() {
  _$jscoverage['/combobox/control.js'].functionData[21]++;
  _$jscoverage['/combobox/control.js'].lineData[379]++;
  return '.' + this.getBaseCssClass('trigger');
}}, 
  placeholder: {
  render: 1, 
  sync: 0, 
  parse: function() {
  _$jscoverage['/combobox/control.js'].functionData[22]++;
  _$jscoverage['/combobox/control.js'].lineData[394]++;
  var placeHolder = this.get('placeholderEl');
  _$jscoverage['/combobox/control.js'].lineData[395]++;
  return visit57_395_1(placeHolder && placeHolder.html());
}}, 
  placeholderEl: {
  selector: function() {
  _$jscoverage['/combobox/control.js'].functionData[23]++;
  _$jscoverage['/combobox/control.js'].lineData[405]++;
  return ('.' + this.getBaseCssClass('placeholder'));
}}, 
  clearEl: {
  selector: function() {
  _$jscoverage['/combobox/control.js'].functionData[24]++;
  _$jscoverage['/combobox/control.js'].lineData[411]++;
  return ('.' + this.getBaseCssClass('clear'));
}}, 
  validator: {}, 
  invalidEl: {
  selector: function() {
  _$jscoverage['/combobox/control.js'].functionData[25]++;
  _$jscoverage['/combobox/control.js'].lineData[432]++;
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
  _$jscoverage['/combobox/control.js'].lineData[468]++;
  v = visit58_468_1(v || {});
  _$jscoverage['/combobox/control.js'].lineData[469]++;
  if (visit59_469_1(!v.isControl)) {
    _$jscoverage['/combobox/control.js'].lineData[470]++;
    v.xclass = visit60_470_1(v.xclass || 'popupmenu');
    _$jscoverage['/combobox/control.js'].lineData[471]++;
    v = this.createComponent(v);
    _$jscoverage['/combobox/control.js'].lineData[472]++;
    this.setInternal('menu', v);
  }
  _$jscoverage['/combobox/control.js'].lineData[474]++;
  return v;
}, 
  setter: function(m) {
  _$jscoverage['/combobox/control.js'].functionData[27]++;
  _$jscoverage['/combobox/control.js'].lineData[477]++;
  if (visit61_477_1(m.isControl)) {
    _$jscoverage['/combobox/control.js'].lineData[478]++;
    m.setInternal('parent', this);
    _$jscoverage['/combobox/control.js'].lineData[479]++;
    var align = {
  node: this.$el, 
  points: ['bl', 'tl'], 
  overflow: {
  adjustX: 1, 
  adjustY: 1}};
    _$jscoverage['/combobox/control.js'].lineData[487]++;
    S.mix(m.get('align'), align, false);
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
  _$jscoverage['/combobox/control.js'].lineData[591]++;
  function getFirstEnabledItem(children) {
    _$jscoverage['/combobox/control.js'].functionData[28]++;
    _$jscoverage['/combobox/control.js'].lineData[592]++;
    for (var i = 0; visit62_592_1(i < children.length); i++) {
      _$jscoverage['/combobox/control.js'].lineData[593]++;
      if (visit63_593_1(!children[i].get('disabled'))) {
        _$jscoverage['/combobox/control.js'].lineData[594]++;
        return children[i];
      }
    }
    _$jscoverage['/combobox/control.js'].lineData[597]++;
    return null;
  }
  _$jscoverage['/combobox/control.js'].lineData[600]++;
  function onMenuFocusout() {
    _$jscoverage['/combobox/control.js'].functionData[29]++;
    _$jscoverage['/combobox/control.js'].lineData[601]++;
    delayHide(this);
  }
  _$jscoverage['/combobox/control.js'].lineData[604]++;
  function onMenuFocusin() {
    _$jscoverage['/combobox/control.js'].functionData[30]++;
    _$jscoverage['/combobox/control.js'].lineData[605]++;
    var self = this;
    _$jscoverage['/combobox/control.js'].lineData[609]++;
    setTimeout(function() {
  _$jscoverage['/combobox/control.js'].functionData[31]++;
  _$jscoverage['/combobox/control.js'].lineData[610]++;
  clearDismissTimer(self);
}, 0);
  }
  _$jscoverage['/combobox/control.js'].lineData[614]++;
  function onMenuMouseOver() {
    _$jscoverage['/combobox/control.js'].functionData[32]++;
    _$jscoverage['/combobox/control.js'].lineData[615]++;
    var self = this;
    _$jscoverage['/combobox/control.js'].lineData[617]++;
    self.focus();
    _$jscoverage['/combobox/control.js'].lineData[619]++;
    clearDismissTimer(self);
  }
  _$jscoverage['/combobox/control.js'].lineData[622]++;
  function onMenuMouseDown() {
    _$jscoverage['/combobox/control.js'].functionData[33]++;
    _$jscoverage['/combobox/control.js'].lineData[623]++;
    var self = this;
    _$jscoverage['/combobox/control.js'].lineData[627]++;
    self.setCurrentValue(self.getCurrentValue(), {
  force: 1});
  }
  _$jscoverage['/combobox/control.js'].lineData[632]++;
  function onMenuAfterRenderUI(e) {
    _$jscoverage['/combobox/control.js'].functionData[34]++;
    _$jscoverage['/combobox/control.js'].lineData[633]++;
    var self = this, contentEl;
    _$jscoverage['/combobox/control.js'].lineData[635]++;
    var menu = self.get('menu');
    _$jscoverage['/combobox/control.js'].lineData[636]++;
    if (visit64_636_1(!e || visit65_636_2(menu === e.target))) {
      _$jscoverage['/combobox/control.js'].lineData[637]++;
      var input = self.get('input');
      _$jscoverage['/combobox/control.js'].lineData[638]++;
      var el = menu.get('el');
      _$jscoverage['/combobox/control.js'].lineData[639]++;
      contentEl = menu.get('contentEl');
      _$jscoverage['/combobox/control.js'].lineData[640]++;
      input.attr('aria-owns', el.attr('id'));
      _$jscoverage['/combobox/control.js'].lineData[642]++;
      el.on('focusout', onMenuFocusout, self);
      _$jscoverage['/combobox/control.js'].lineData[643]++;
      el.on('focusin', onMenuFocusin, self);
      _$jscoverage['/combobox/control.js'].lineData[644]++;
      contentEl.on('mouseover', onMenuMouseOver, self);
      _$jscoverage['/combobox/control.js'].lineData[647]++;
      contentEl.on('mousedown', onMenuMouseDown, self);
      _$jscoverage['/combobox/control.js'].lineData[648]++;
      if (visit66_648_1(self.get('matchElWidth'))) {
        _$jscoverage['/combobox/control.js'].lineData[649]++;
        el.getWindow().on('resize', onWindowResize, self);
      }
    }
  }
  _$jscoverage['/combobox/control.js'].lineData[654]++;
  function onWindowResize() {
    _$jscoverage['/combobox/control.js'].functionData[35]++;
    _$jscoverage['/combobox/control.js'].lineData[655]++;
    var self = this;
    _$jscoverage['/combobox/control.js'].lineData[656]++;
    var menu = self.get('menu');
    _$jscoverage['/combobox/control.js'].lineData[657]++;
    if (visit67_657_1(menu.get('visible'))) {
      _$jscoverage['/combobox/control.js'].lineData[658]++;
      var el = self.get('el');
      _$jscoverage['/combobox/control.js'].lineData[659]++;
      var menuEl = menu.get('el');
      _$jscoverage['/combobox/control.js'].lineData[660]++;
      var borderWidth = (visit68_660_1(parseInt(menuEl.css('borderLeftWidth'), 10) || 0)) + (visit69_661_1(parseInt(menuEl.css('borderRightWidth'), 10) || 0));
      _$jscoverage['/combobox/control.js'].lineData[662]++;
      menu.set('width', el[0].offsetWidth - borderWidth);
    }
  }
  _$jscoverage['/combobox/control.js'].lineData[666]++;
  function onMenuItemClick(e) {
    _$jscoverage['/combobox/control.js'].functionData[36]++;
    _$jscoverage['/combobox/control.js'].lineData[667]++;
    var item = e.target, self = this, textContent;
    _$jscoverage['/combobox/control.js'].lineData[670]++;
    if (visit70_670_1(item.isMenuItem)) {
      _$jscoverage['/combobox/control.js'].lineData[671]++;
      textContent = item.get('textContent');
      _$jscoverage['/combobox/control.js'].lineData[672]++;
      self.setCurrentValue(textContent);
      _$jscoverage['/combobox/control.js'].lineData[673]++;
      self._savedValue = textContent;
      _$jscoverage['/combobox/control.js'].lineData[674]++;
      self.set('collapsed', true);
    }
  }
  _$jscoverage['/combobox/control.js'].lineData[678]++;
  function setInvalid(self, error) {
    _$jscoverage['/combobox/control.js'].functionData[37]++;
    _$jscoverage['/combobox/control.js'].lineData[679]++;
    var $el = self.$el, cls = self.getBaseCssClasses('invalid'), invalidEl = self.get('invalidEl');
    _$jscoverage['/combobox/control.js'].lineData[682]++;
    if (visit71_682_1(error)) {
      _$jscoverage['/combobox/control.js'].lineData[683]++;
      $el.addClass(cls);
      _$jscoverage['/combobox/control.js'].lineData[684]++;
      invalidEl.attr('title', error);
      _$jscoverage['/combobox/control.js'].lineData[685]++;
      invalidEl.show();
    } else {
      _$jscoverage['/combobox/control.js'].lineData[687]++;
      $el.removeClass(cls);
      _$jscoverage['/combobox/control.js'].lineData[688]++;
      invalidEl.hide();
    }
  }
  _$jscoverage['/combobox/control.js'].lineData[692]++;
  function delayHide(self) {
    _$jscoverage['/combobox/control.js'].functionData[38]++;
    _$jscoverage['/combobox/control.js'].lineData[693]++;
    if (visit72_693_1(self._focusoutDismissTimer)) {
      _$jscoverage['/combobox/control.js'].lineData[694]++;
      return;
    }
    _$jscoverage['/combobox/control.js'].lineData[696]++;
    self._focusoutDismissTimer = setTimeout(function() {
  _$jscoverage['/combobox/control.js'].functionData[39]++;
  _$jscoverage['/combobox/control.js'].lineData[698]++;
  if (visit73_698_1(self._focusoutDismissTimer)) {
    _$jscoverage['/combobox/control.js'].lineData[699]++;
    self.set('collapsed', true);
  }
}, 50);
  }
  _$jscoverage['/combobox/control.js'].lineData[706]++;
  function clearDismissTimer(self) {
    _$jscoverage['/combobox/control.js'].functionData[40]++;
    _$jscoverage['/combobox/control.js'].lineData[707]++;
    var t = self._focusoutDismissTimer;
    _$jscoverage['/combobox/control.js'].lineData[708]++;
    if (visit74_708_1(t)) {
      _$jscoverage['/combobox/control.js'].lineData[709]++;
      clearTimeout(t);
      _$jscoverage['/combobox/control.js'].lineData[710]++;
      self._focusoutDismissTimer = null;
    }
  }
  _$jscoverage['/combobox/control.js'].lineData[714]++;
  function onValueChange(e) {
    _$jscoverage['/combobox/control.js'].functionData[41]++;
    _$jscoverage['/combobox/control.js'].lineData[715]++;
    this.setCurrentValue(e.target.value, {
  data: {
  causedByInputEvent: 1}});
  }
  _$jscoverage['/combobox/control.js'].lineData[722]++;
  function renderData(data) {
    _$jscoverage['/combobox/control.js'].functionData[42]++;
    _$jscoverage['/combobox/control.js'].lineData[723]++;
    var self = this, start, children = [], val, matchVal, i, menu = self.get('menu');
    _$jscoverage['/combobox/control.js'].lineData[731]++;
    data = self.normalizeData(data);
    _$jscoverage['/combobox/control.js'].lineData[733]++;
    menu.removeChildren(true);
    _$jscoverage['/combobox/control.js'].lineData[735]++;
    if (visit75_735_1(data && data.length)) {
      _$jscoverage['/combobox/control.js'].lineData[736]++;
      start = S.now();
      _$jscoverage['/combobox/control.js'].lineData[737]++;
      menu.addChildren(data);
      _$jscoverage['/combobox/control.js'].lineData[738]++;
      logger.info('render menu cost: ' + (S.now() - start) + ' ms');
      _$jscoverage['/combobox/control.js'].lineData[740]++;
      children = menu.get('children');
      _$jscoverage['/combobox/control.js'].lineData[743]++;
      val = self.getCurrentValue();
      _$jscoverage['/combobox/control.js'].lineData[745]++;
      if (visit76_745_1(self.get('highlightMatchItem'))) {
        _$jscoverage['/combobox/control.js'].lineData[746]++;
        for (i = 0; visit77_746_1(i < children.length); i++) {
          _$jscoverage['/combobox/control.js'].lineData[747]++;
          if (visit78_747_1(children[i].get('textContent') === val)) {
            _$jscoverage['/combobox/control.js'].lineData[748]++;
            children[i].set('highlighted', true);
            _$jscoverage['/combobox/control.js'].lineData[749]++;
            matchVal = true;
            _$jscoverage['/combobox/control.js'].lineData[750]++;
            break;
          }
        }
      }
      _$jscoverage['/combobox/control.js'].lineData[756]++;
      if (visit79_756_1(!matchVal && self.get('autoHighlightFirst'))) {
        _$jscoverage['/combobox/control.js'].lineData[757]++;
        for (i = 0; visit80_757_1(i < children.length); i++) {
          _$jscoverage['/combobox/control.js'].lineData[758]++;
          if (visit81_758_1(!children[i].get('disabled'))) {
            _$jscoverage['/combobox/control.js'].lineData[759]++;
            children[i].set('highlighted', true);
            _$jscoverage['/combobox/control.js'].lineData[760]++;
            break;
          }
        }
      }
      _$jscoverage['/combobox/control.js'].lineData[764]++;
      self.set('collapsed', false);
      _$jscoverage['/combobox/control.js'].lineData[766]++;
      self.fire('afterRenderData');
    } else {
      _$jscoverage['/combobox/control.js'].lineData[768]++;
      self.set('collapsed', true);
    }
  }
  _$jscoverage['/combobox/control.js'].lineData[774]++;
  return ComboBox;
});
