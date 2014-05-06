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
  _$jscoverage['/combobox/control.js'].lineData[11] = 0;
  _$jscoverage['/combobox/control.js'].lineData[13] = 0;
  _$jscoverage['/combobox/control.js'].lineData[22] = 0;
  _$jscoverage['/combobox/control.js'].lineData[28] = 0;
  _$jscoverage['/combobox/control.js'].lineData[39] = 0;
  _$jscoverage['/combobox/control.js'].lineData[42] = 0;
  _$jscoverage['/combobox/control.js'].lineData[52] = 0;
  _$jscoverage['/combobox/control.js'].lineData[54] = 0;
  _$jscoverage['/combobox/control.js'].lineData[56] = 0;
  _$jscoverage['/combobox/control.js'].lineData[57] = 0;
  _$jscoverage['/combobox/control.js'].lineData[59] = 0;
  _$jscoverage['/combobox/control.js'].lineData[64] = 0;
  _$jscoverage['/combobox/control.js'].lineData[65] = 0;
  _$jscoverage['/combobox/control.js'].lineData[66] = 0;
  _$jscoverage['/combobox/control.js'].lineData[75] = 0;
  _$jscoverage['/combobox/control.js'].lineData[77] = 0;
  _$jscoverage['/combobox/control.js'].lineData[78] = 0;
  _$jscoverage['/combobox/control.js'].lineData[79] = 0;
  _$jscoverage['/combobox/control.js'].lineData[80] = 0;
  _$jscoverage['/combobox/control.js'].lineData[83] = 0;
  _$jscoverage['/combobox/control.js'].lineData[85] = 0;
  _$jscoverage['/combobox/control.js'].lineData[86] = 0;
  _$jscoverage['/combobox/control.js'].lineData[87] = 0;
  _$jscoverage['/combobox/control.js'].lineData[93] = 0;
  _$jscoverage['/combobox/control.js'].lineData[95] = 0;
  _$jscoverage['/combobox/control.js'].lineData[103] = 0;
  _$jscoverage['/combobox/control.js'].lineData[113] = 0;
  _$jscoverage['/combobox/control.js'].lineData[118] = 0;
  _$jscoverage['/combobox/control.js'].lineData[122] = 0;
  _$jscoverage['/combobox/control.js'].lineData[123] = 0;
  _$jscoverage['/combobox/control.js'].lineData[125] = 0;
  _$jscoverage['/combobox/control.js'].lineData[126] = 0;
  _$jscoverage['/combobox/control.js'].lineData[127] = 0;
  _$jscoverage['/combobox/control.js'].lineData[129] = 0;
  _$jscoverage['/combobox/control.js'].lineData[130] = 0;
  _$jscoverage['/combobox/control.js'].lineData[132] = 0;
  _$jscoverage['/combobox/control.js'].lineData[135] = 0;
  _$jscoverage['/combobox/control.js'].lineData[136] = 0;
  _$jscoverage['/combobox/control.js'].lineData[137] = 0;
  _$jscoverage['/combobox/control.js'].lineData[138] = 0;
  _$jscoverage['/combobox/control.js'].lineData[143] = 0;
  _$jscoverage['/combobox/control.js'].lineData[145] = 0;
  _$jscoverage['/combobox/control.js'].lineData[146] = 0;
  _$jscoverage['/combobox/control.js'].lineData[147] = 0;
  _$jscoverage['/combobox/control.js'].lineData[149] = 0;
  _$jscoverage['/combobox/control.js'].lineData[150] = 0;
  _$jscoverage['/combobox/control.js'].lineData[155] = 0;
  _$jscoverage['/combobox/control.js'].lineData[157] = 0;
  _$jscoverage['/combobox/control.js'].lineData[158] = 0;
  _$jscoverage['/combobox/control.js'].lineData[159] = 0;
  _$jscoverage['/combobox/control.js'].lineData[160] = 0;
  _$jscoverage['/combobox/control.js'].lineData[161] = 0;
  _$jscoverage['/combobox/control.js'].lineData[162] = 0;
  _$jscoverage['/combobox/control.js'].lineData[163] = 0;
  _$jscoverage['/combobox/control.js'].lineData[166] = 0;
  _$jscoverage['/combobox/control.js'].lineData[170] = 0;
  _$jscoverage['/combobox/control.js'].lineData[171] = 0;
  _$jscoverage['/combobox/control.js'].lineData[176] = 0;
  _$jscoverage['/combobox/control.js'].lineData[178] = 0;
  _$jscoverage['/combobox/control.js'].lineData[179] = 0;
  _$jscoverage['/combobox/control.js'].lineData[180] = 0;
  _$jscoverage['/combobox/control.js'].lineData[181] = 0;
  _$jscoverage['/combobox/control.js'].lineData[182] = 0;
  _$jscoverage['/combobox/control.js'].lineData[183] = 0;
  _$jscoverage['/combobox/control.js'].lineData[185] = 0;
  _$jscoverage['/combobox/control.js'].lineData[186] = 0;
  _$jscoverage['/combobox/control.js'].lineData[189] = 0;
  _$jscoverage['/combobox/control.js'].lineData[191] = 0;
  _$jscoverage['/combobox/control.js'].lineData[192] = 0;
  _$jscoverage['/combobox/control.js'].lineData[193] = 0;
  _$jscoverage['/combobox/control.js'].lineData[195] = 0;
  _$jscoverage['/combobox/control.js'].lineData[200] = 0;
  _$jscoverage['/combobox/control.js'].lineData[205] = 0;
  _$jscoverage['/combobox/control.js'].lineData[213] = 0;
  _$jscoverage['/combobox/control.js'].lineData[214] = 0;
  _$jscoverage['/combobox/control.js'].lineData[216] = 0;
  _$jscoverage['/combobox/control.js'].lineData[218] = 0;
  _$jscoverage['/combobox/control.js'].lineData[222] = 0;
  _$jscoverage['/combobox/control.js'].lineData[223] = 0;
  _$jscoverage['/combobox/control.js'].lineData[224] = 0;
  _$jscoverage['/combobox/control.js'].lineData[229] = 0;
  _$jscoverage['/combobox/control.js'].lineData[230] = 0;
  _$jscoverage['/combobox/control.js'].lineData[231] = 0;
  _$jscoverage['/combobox/control.js'].lineData[235] = 0;
  _$jscoverage['/combobox/control.js'].lineData[237] = 0;
  _$jscoverage['/combobox/control.js'].lineData[240] = 0;
  _$jscoverage['/combobox/control.js'].lineData[241] = 0;
  _$jscoverage['/combobox/control.js'].lineData[242] = 0;
  _$jscoverage['/combobox/control.js'].lineData[246] = 0;
  _$jscoverage['/combobox/control.js'].lineData[248] = 0;
  _$jscoverage['/combobox/control.js'].lineData[251] = 0;
  _$jscoverage['/combobox/control.js'].lineData[254] = 0;
  _$jscoverage['/combobox/control.js'].lineData[259] = 0;
  _$jscoverage['/combobox/control.js'].lineData[261] = 0;
  _$jscoverage['/combobox/control.js'].lineData[263] = 0;
  _$jscoverage['/combobox/control.js'].lineData[264] = 0;
  _$jscoverage['/combobox/control.js'].lineData[268] = 0;
  _$jscoverage['/combobox/control.js'].lineData[269] = 0;
  _$jscoverage['/combobox/control.js'].lineData[271] = 0;
  _$jscoverage['/combobox/control.js'].lineData[272] = 0;
  _$jscoverage['/combobox/control.js'].lineData[273] = 0;
  _$jscoverage['/combobox/control.js'].lineData[274] = 0;
  _$jscoverage['/combobox/control.js'].lineData[277] = 0;
  _$jscoverage['/combobox/control.js'].lineData[281] = 0;
  _$jscoverage['/combobox/control.js'].lineData[285] = 0;
  _$jscoverage['/combobox/control.js'].lineData[286] = 0;
  _$jscoverage['/combobox/control.js'].lineData[287] = 0;
  _$jscoverage['/combobox/control.js'].lineData[290] = 0;
  _$jscoverage['/combobox/control.js'].lineData[299] = 0;
  _$jscoverage['/combobox/control.js'].lineData[301] = 0;
  _$jscoverage['/combobox/control.js'].lineData[305] = 0;
  _$jscoverage['/combobox/control.js'].lineData[309] = 0;
  _$jscoverage['/combobox/control.js'].lineData[312] = 0;
  _$jscoverage['/combobox/control.js'].lineData[313] = 0;
  _$jscoverage['/combobox/control.js'].lineData[316] = 0;
  _$jscoverage['/combobox/control.js'].lineData[317] = 0;
  _$jscoverage['/combobox/control.js'].lineData[318] = 0;
  _$jscoverage['/combobox/control.js'].lineData[319] = 0;
  _$jscoverage['/combobox/control.js'].lineData[320] = 0;
  _$jscoverage['/combobox/control.js'].lineData[321] = 0;
  _$jscoverage['/combobox/control.js'].lineData[324] = 0;
  _$jscoverage['/combobox/control.js'].lineData[326] = 0;
  _$jscoverage['/combobox/control.js'].lineData[329] = 0;
  _$jscoverage['/combobox/control.js'].lineData[333] = 0;
  _$jscoverage['/combobox/control.js'].lineData[334] = 0;
  _$jscoverage['/combobox/control.js'].lineData[352] = 0;
  _$jscoverage['/combobox/control.js'].lineData[368] = 0;
  _$jscoverage['/combobox/control.js'].lineData[378] = 0;
  _$jscoverage['/combobox/control.js'].lineData[393] = 0;
  _$jscoverage['/combobox/control.js'].lineData[394] = 0;
  _$jscoverage['/combobox/control.js'].lineData[404] = 0;
  _$jscoverage['/combobox/control.js'].lineData[410] = 0;
  _$jscoverage['/combobox/control.js'].lineData[431] = 0;
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
  _$jscoverage['/combobox/control.js'].lineData[732] = 0;
  _$jscoverage['/combobox/control.js'].lineData[734] = 0;
  _$jscoverage['/combobox/control.js'].lineData[736] = 0;
  _$jscoverage['/combobox/control.js'].lineData[737] = 0;
  _$jscoverage['/combobox/control.js'].lineData[740] = 0;
  _$jscoverage['/combobox/control.js'].lineData[741] = 0;
  _$jscoverage['/combobox/control.js'].lineData[742] = 0;
  _$jscoverage['/combobox/control.js'].lineData[743] = 0;
  _$jscoverage['/combobox/control.js'].lineData[746] = 0;
  _$jscoverage['/combobox/control.js'].lineData[749] = 0;
  _$jscoverage['/combobox/control.js'].lineData[751] = 0;
  _$jscoverage['/combobox/control.js'].lineData[752] = 0;
  _$jscoverage['/combobox/control.js'].lineData[753] = 0;
  _$jscoverage['/combobox/control.js'].lineData[754] = 0;
  _$jscoverage['/combobox/control.js'].lineData[755] = 0;
  _$jscoverage['/combobox/control.js'].lineData[756] = 0;
  _$jscoverage['/combobox/control.js'].lineData[762] = 0;
  _$jscoverage['/combobox/control.js'].lineData[763] = 0;
  _$jscoverage['/combobox/control.js'].lineData[764] = 0;
  _$jscoverage['/combobox/control.js'].lineData[765] = 0;
  _$jscoverage['/combobox/control.js'].lineData[766] = 0;
  _$jscoverage['/combobox/control.js'].lineData[770] = 0;
  _$jscoverage['/combobox/control.js'].lineData[772] = 0;
  _$jscoverage['/combobox/control.js'].lineData[774] = 0;
  _$jscoverage['/combobox/control.js'].lineData[780] = 0;
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
  _$jscoverage['/combobox/control.js'].branchData['56'] = [];
  _$jscoverage['/combobox/control.js'].branchData['56'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['77'] = [];
  _$jscoverage['/combobox/control.js'].branchData['77'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['79'] = [];
  _$jscoverage['/combobox/control.js'].branchData['79'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['85'] = [];
  _$jscoverage['/combobox/control.js'].branchData['85'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['122'] = [];
  _$jscoverage['/combobox/control.js'].branchData['122'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['125'] = [];
  _$jscoverage['/combobox/control.js'].branchData['125'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['135'] = [];
  _$jscoverage['/combobox/control.js'].branchData['135'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['137'] = [];
  _$jscoverage['/combobox/control.js'].branchData['137'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['146'] = [];
  _$jscoverage['/combobox/control.js'].branchData['146'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['159'] = [];
  _$jscoverage['/combobox/control.js'].branchData['159'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['161'] = [];
  _$jscoverage['/combobox/control.js'].branchData['161'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['162'] = [];
  _$jscoverage['/combobox/control.js'].branchData['162'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['162'][2] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['170'] = [];
  _$jscoverage['/combobox/control.js'].branchData['170'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['182'] = [];
  _$jscoverage['/combobox/control.js'].branchData['182'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['182'][2] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['182'][3] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['183'] = [];
  _$jscoverage['/combobox/control.js'].branchData['183'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['192'] = [];
  _$jscoverage['/combobox/control.js'].branchData['192'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['192'][2] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['192'][3] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['216'] = [];
  _$jscoverage['/combobox/control.js'].branchData['216'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['222'] = [];
  _$jscoverage['/combobox/control.js'].branchData['222'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['224'] = [];
  _$jscoverage['/combobox/control.js'].branchData['224'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['224'][2] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['224'][3] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['225'] = [];
  _$jscoverage['/combobox/control.js'].branchData['225'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['226'] = [];
  _$jscoverage['/combobox/control.js'].branchData['226'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['226'][2] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['227'] = [];
  _$jscoverage['/combobox/control.js'].branchData['227'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['240'] = [];
  _$jscoverage['/combobox/control.js'].branchData['240'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['242'] = [];
  _$jscoverage['/combobox/control.js'].branchData['242'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['251'] = [];
  _$jscoverage['/combobox/control.js'].branchData['251'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['259'] = [];
  _$jscoverage['/combobox/control.js'].branchData['259'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['259'][2] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['263'] = [];
  _$jscoverage['/combobox/control.js'].branchData['263'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['269'] = [];
  _$jscoverage['/combobox/control.js'].branchData['269'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['269'][2] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['269'][3] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['272'] = [];
  _$jscoverage['/combobox/control.js'].branchData['272'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['285'] = [];
  _$jscoverage['/combobox/control.js'].branchData['285'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['312'] = [];
  _$jscoverage['/combobox/control.js'].branchData['312'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['317'] = [];
  _$jscoverage['/combobox/control.js'].branchData['317'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['318'] = [];
  _$jscoverage['/combobox/control.js'].branchData['318'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['322'] = [];
  _$jscoverage['/combobox/control.js'].branchData['322'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['323'] = [];
  _$jscoverage['/combobox/control.js'].branchData['323'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['394'] = [];
  _$jscoverage['/combobox/control.js'].branchData['394'][1] = new BranchData();
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
  _$jscoverage['/combobox/control.js'].branchData['740'] = [];
  _$jscoverage['/combobox/control.js'].branchData['740'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['741'] = [];
  _$jscoverage['/combobox/control.js'].branchData['741'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['751'] = [];
  _$jscoverage['/combobox/control.js'].branchData['751'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['752'] = [];
  _$jscoverage['/combobox/control.js'].branchData['752'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['753'] = [];
  _$jscoverage['/combobox/control.js'].branchData['753'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['762'] = [];
  _$jscoverage['/combobox/control.js'].branchData['762'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['763'] = [];
  _$jscoverage['/combobox/control.js'].branchData['763'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['764'] = [];
  _$jscoverage['/combobox/control.js'].branchData['764'][1] = new BranchData();
}
_$jscoverage['/combobox/control.js'].branchData['764'][1].init(26, 28, '!children[i].get(\'disabled\')');
function visit81_764_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['764'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['763'][1].init(30, 19, 'i < children.length');
function visit80_763_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['763'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['762'][1].init(767, 43, '!matchVal && self.get(\'autoHighlightFirst\')');
function visit79_762_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['762'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['753'][1].init(26, 38, 'children[i].get(\'textContent\') === val');
function visit78_753_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['753'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['752'][1].init(30, 19, 'i < children.length');
function visit77_752_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['752'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['751'][1].init(317, 30, 'self.get(\'highlightMatchItem\')');
function visit76_751_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['751'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['741'][1].init(26, 15, 'i < data.length');
function visit75_741_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['741'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['740'][1].init(426, 19, 'data && data.length');
function visit74_740_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['740'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['708'][1].init(59, 1, 't');
function visit73_708_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['708'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['698'][1].init(50, 26, 'self._focusoutDismissTimer');
function visit72_698_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['698'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['693'][1].init(14, 26, 'self._focusoutDismissTimer');
function visit71_693_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['693'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['682'][1].init(145, 5, 'error');
function visit70_682_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['682'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['670'][1].init(96, 15, 'item.isMenuItem');
function visit69_670_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['670'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['661'][1].init(69, 49, 'parseInt(menuEl.css(\'borderRightWidth\'), 10) || 0');
function visit68_661_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['661'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['660'][1].init(113, 48, 'parseInt(menuEl.css(\'borderLeftWidth\'), 10) || 0');
function visit67_660_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['660'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['657'][1].init(78, 19, 'menu.get(\'visible\')');
function visit66_657_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['657'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['648'][1].init(571, 24, 'self.get(\'matchElWidth\')');
function visit65_648_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['648'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['636'][2].init(108, 17, 'menu === e.target');
function visit64_636_2(result) {
  _$jscoverage['/combobox/control.js'].branchData['636'][2].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['636'][1].init(102, 23, '!e || menu === e.target');
function visit63_636_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['636'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['593'][1].init(18, 28, '!children[i].get(\'disabled\')');
function visit62_593_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['593'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['592'][1].init(26, 19, 'i < children.length');
function visit61_592_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['592'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['477'][1].init(26, 11, 'm.isControl');
function visit60_477_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['477'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['470'][1].init(37, 23, 'v.xclass || \'popupmenu\'');
function visit59_470_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['470'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['469'][1].init(26, 12, '!v.isControl');
function visit58_469_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['469'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['394'][1].init(95, 33, 'placeHolder && placeHolder.html()');
function visit57_394_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['394'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['323'][1].init(81, 49, 'parseInt(menuEl.css(\'borderRightWidth\'), 10) || 0');
function visit56_323_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['323'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['322'][1].init(43, 48, 'parseInt(menuEl.css(\'borderLeftWidth\'), 10) || 0');
function visit55_322_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['322'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['318'][1].init(26, 24, 'self.get(\'matchElWidth\')');
function visit54_318_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['318'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['317'][1].init(107, 20, '!menu.get(\'visible\')');
function visit53_317_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['317'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['312'][1].init(122, 1, 'v');
function visit52_312_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['312'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['285'][1].init(149, 9, 'validator');
function visit51_285_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['285'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['272'][1].init(125, 15, 'v !== undefined');
function visit50_272_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['272'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['269'][3].init(2752, 22, 'keyCode === KeyCode.UP');
function visit49_269_3(result) {
  _$jscoverage['/combobox/control.js'].branchData['269'][3].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['269'][2].init(2724, 24, 'keyCode === KeyCode.DOWN');
function visit48_269_2(result) {
  _$jscoverage['/combobox/control.js'].branchData['269'][2].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['269'][1].init(2724, 50, 'keyCode === KeyCode.DOWN || keyCode === KeyCode.UP');
function visit47_269_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['269'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['263'][1].init(200, 20, 'self.get(\'multiple\')');
function visit46_263_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['263'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['259'][2].init(1919, 23, 'keyCode === KeyCode.TAB');
function visit45_259_2(result) {
  _$jscoverage['/combobox/control.js'].branchData['259'][2].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['259'][1].init(1919, 42, 'keyCode === KeyCode.TAB && highlightedItem');
function visit44_259_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['259'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['251'][1].init(1519, 90, 'updateInputOnDownUp && S.inArray(keyCode, [KeyCode.DOWN, KeyCode.UP])');
function visit43_251_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['251'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['242'][1].init(76, 19, 'updateInputOnDownUp');
function visit42_242_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['242'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['240'][1].init(1042, 23, 'keyCode === KeyCode.ESC');
function visit41_240_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['240'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['227'][1].init(50, 53, 'highlightedItem === getFirstEnabledItem(menuChildren)');
function visit40_227_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['227'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['226'][2].init(244, 22, 'keyCode === KeyCode.UP');
function visit39_226_2(result) {
  _$jscoverage['/combobox/control.js'].branchData['226'][2].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['226'][1].init(153, 104, 'keyCode === KeyCode.UP && highlightedItem === getFirstEnabledItem(menuChildren)');
function visit38_226_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['226'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['225'][1].init(52, 72, 'highlightedItem === getFirstEnabledItem(menuChildren.concat().reverse())');
function visit37_225_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['225'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['224'][3].init(88, 24, 'keyCode === KeyCode.DOWN');
function visit36_224_3(result) {
  _$jscoverage['/combobox/control.js'].branchData['224'][3].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['224'][2].init(88, 125, 'keyCode === KeyCode.DOWN && highlightedItem === getFirstEnabledItem(menuChildren.concat().reverse())');
function visit35_224_2(result) {
  _$jscoverage['/combobox/control.js'].branchData['224'][2].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['224'][1].init(88, 258, 'keyCode === KeyCode.DOWN && highlightedItem === getFirstEnabledItem(menuChildren.concat().reverse()) || keyCode === KeyCode.UP && highlightedItem === getFirstEnabledItem(menuChildren)');
function visit34_224_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['224'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['222'][1].init(233, 38, 'updateInputOnDownUp && highlightedItem');
function visit33_222_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['222'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['216'][1].init(368, 19, 'menu.get(\'visible\')');
function visit32_216_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['216'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['192'][3].init(690, 21, 'clearEl[0] === target');
function visit31_192_3(result) {
  _$jscoverage['/combobox/control.js'].branchData['192'][3].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['192'][2].init(690, 49, 'clearEl[0] === target || clearEl.contains(target)');
function visit30_192_2(result) {
  _$jscoverage['/combobox/control.js'].branchData['192'][2].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['192'][1].init(678, 62, 'clearEl && (clearEl[0] === target || clearEl.contains(target))');
function visit29_192_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['192'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['183'][1].init(22, 21, 'self.get(\'collapsed\')');
function visit28_183_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['183'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['182'][3].init(255, 21, 'trigger[0] === target');
function visit27_182_3(result) {
  _$jscoverage['/combobox/control.js'].branchData['182'][3].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['182'][2].init(255, 49, 'trigger[0] === target || trigger.contains(target)');
function visit26_182_2(result) {
  _$jscoverage['/combobox/control.js'].branchData['182'][2].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['182'][1].init(243, 62, 'trigger && (trigger[0] === target || trigger.contains(target))');
function visit25_182_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['182'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['170'][1].init(605, 35, 'placeholderEl && !self.get(\'value\')');
function visit24_170_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['170'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['162'][2].init(55, 25, 'val === self.get(\'value\')');
function visit23_162_2(result) {
  _$jscoverage['/combobox/control.js'].branchData['162'][2].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['162'][1].init(30, 51, '!self.get(\'focused\') && (val === self.get(\'value\'))');
function visit22_162_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['162'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['161'][1].init(26, 5, 'error');
function visit21_161_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['161'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['159'][1].init(170, 21, 'self.get(\'invalidEl\')');
function visit20_159_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['159'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['146'][1].init(118, 21, 'self.get(\'invalidEl\')');
function visit19_146_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['146'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['137'][1].init(707, 13, '!v && clearEl');
function visit18_137_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['137'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['135'][1].init(633, 12, 'v && clearEl');
function visit17_135_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['135'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['125'][1].init(127, 19, 'value === undefined');
function visit16_125_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['125'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['122'][1].init(178, 20, 'e.causedByInputEvent');
function visit15_122_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['122'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['85'][1].init(337, 15, 'i < data.length');
function visit14_85_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['85'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['79'][1].init(87, 18, 'self.get(\'format\')');
function visit13_79_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['79'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['77'][1].init(84, 19, 'data && data.length');
function visit12_77_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['77'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['56'][1].init(520, 20, 'menu.get(\'rendered\')');
function visit11_56_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['56'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/combobox/control.js'].functionData[0]++;
  _$jscoverage['/combobox/control.js'].lineData[7]++;
  var Node = require('node');
  _$jscoverage['/combobox/control.js'].lineData[8]++;
  var Control = require('component/control');
  _$jscoverage['/combobox/control.js'].lineData[9]++;
  var ComboboxTpl = require('./combobox-xtpl');
  _$jscoverage['/combobox/control.js'].lineData[11]++;
  require('menu');
  _$jscoverage['/combobox/control.js'].lineData[13]++;
  var ComboBox, KeyCode = Node.KeyCode;
  _$jscoverage['/combobox/control.js'].lineData[22]++;
  ComboBox = Control.extend({
  initializer: function() {
  _$jscoverage['/combobox/control.js'].functionData[1]++;
  _$jscoverage['/combobox/control.js'].lineData[28]++;
  this.publish('afterRenderData', {
  bubbles: false});
}, 
  _savedValue: null, 
  bindUI: function() {
  _$jscoverage['/combobox/control.js'].functionData[2]++;
  _$jscoverage['/combobox/control.js'].lineData[39]++;
  var self = this, input = self.get('input');
  _$jscoverage['/combobox/control.js'].lineData[42]++;
  input.on('input', onValueChange, self);
  _$jscoverage['/combobox/control.js'].lineData[52]++;
  self.on('click', onMenuItemClick, self);
  _$jscoverage['/combobox/control.js'].lineData[54]++;
  var menu = self.get('menu');
  _$jscoverage['/combobox/control.js'].lineData[56]++;
  if (visit11_56_1(menu.get('rendered'))) {
    _$jscoverage['/combobox/control.js'].lineData[57]++;
    onMenuAfterRenderUI.call(self);
  } else {
    _$jscoverage['/combobox/control.js'].lineData[59]++;
    menu.on('afterRenderUI', onMenuAfterRenderUI, self);
  }
}, 
  destructor: function() {
  _$jscoverage['/combobox/control.js'].functionData[3]++;
  _$jscoverage['/combobox/control.js'].lineData[64]++;
  var self = this;
  _$jscoverage['/combobox/control.js'].lineData[65]++;
  self.get('menu').destroy();
  _$jscoverage['/combobox/control.js'].lineData[66]++;
  self.$el.getWindow().detach('resize', onWindowResize, self);
}, 
  normalizeData: function(data) {
  _$jscoverage['/combobox/control.js'].functionData[4]++;
  _$jscoverage['/combobox/control.js'].lineData[75]++;
  var self = this, contents, v, i, c;
  _$jscoverage['/combobox/control.js'].lineData[77]++;
  if (visit12_77_1(data && data.length)) {
    _$jscoverage['/combobox/control.js'].lineData[78]++;
    data = data.slice(0, self.get('maxItemCount'));
    _$jscoverage['/combobox/control.js'].lineData[79]++;
    if (visit13_79_1(self.get('format'))) {
      _$jscoverage['/combobox/control.js'].lineData[80]++;
      contents = self.get('format').call(self, self.getCurrentValue(), data);
    } else {
      _$jscoverage['/combobox/control.js'].lineData[83]++;
      contents = [];
    }
    _$jscoverage['/combobox/control.js'].lineData[85]++;
    for (i = 0; visit14_85_1(i < data.length); i++) {
      _$jscoverage['/combobox/control.js'].lineData[86]++;
      v = data[i];
      _$jscoverage['/combobox/control.js'].lineData[87]++;
      c = contents[i] = S.mix({
  content: v, 
  textContent: v, 
  value: v}, contents[i]);
    }
    _$jscoverage['/combobox/control.js'].lineData[93]++;
    return contents;
  }
  _$jscoverage['/combobox/control.js'].lineData[95]++;
  return contents;
}, 
  getCurrentValue: function() {
  _$jscoverage['/combobox/control.js'].functionData[5]++;
  _$jscoverage['/combobox/control.js'].lineData[103]++;
  return this.get('value');
}, 
  setCurrentValue: function(value, setCfg) {
  _$jscoverage['/combobox/control.js'].functionData[6]++;
  _$jscoverage['/combobox/control.js'].lineData[113]++;
  this.set('value', value, setCfg);
}, 
  _onSetValue: function(v, e) {
  _$jscoverage['/combobox/control.js'].functionData[7]++;
  _$jscoverage['/combobox/control.js'].lineData[118]++;
  var self = this, clearEl = self.get('clearEl'), value;
  _$jscoverage['/combobox/control.js'].lineData[122]++;
  if (visit15_122_1(e.causedByInputEvent)) {
    _$jscoverage['/combobox/control.js'].lineData[123]++;
    value = self.getCurrentValue();
    _$jscoverage['/combobox/control.js'].lineData[125]++;
    if (visit16_125_1(value === undefined)) {
      _$jscoverage['/combobox/control.js'].lineData[126]++;
      self.set('collapsed', true);
      _$jscoverage['/combobox/control.js'].lineData[127]++;
      return;
    }
    _$jscoverage['/combobox/control.js'].lineData[129]++;
    self._savedValue = value;
    _$jscoverage['/combobox/control.js'].lineData[130]++;
    self.sendRequest(value);
  } else {
    _$jscoverage['/combobox/control.js'].lineData[132]++;
    self.get('input').val(v);
  }
  _$jscoverage['/combobox/control.js'].lineData[135]++;
  if (visit17_135_1(v && clearEl)) {
    _$jscoverage['/combobox/control.js'].lineData[136]++;
    clearEl.show();
  } else {
    _$jscoverage['/combobox/control.js'].lineData[137]++;
    if (visit18_137_1(!v && clearEl)) {
      _$jscoverage['/combobox/control.js'].lineData[138]++;
      clearEl.hide();
    }
  }
}, 
  handleFocusInternal: function() {
  _$jscoverage['/combobox/control.js'].functionData[8]++;
  _$jscoverage['/combobox/control.js'].lineData[143]++;
  var self = this, placeholderEl;
  _$jscoverage['/combobox/control.js'].lineData[145]++;
  clearDismissTimer(self);
  _$jscoverage['/combobox/control.js'].lineData[146]++;
  if (visit19_146_1(self.get('invalidEl'))) {
    _$jscoverage['/combobox/control.js'].lineData[147]++;
    setInvalid(self, false);
  }
  _$jscoverage['/combobox/control.js'].lineData[149]++;
  if ((placeholderEl = self.get('placeholderEl'))) {
    _$jscoverage['/combobox/control.js'].lineData[150]++;
    placeholderEl.hide();
  }
}, 
  handleBlurInternal: function(e) {
  _$jscoverage['/combobox/control.js'].functionData[9]++;
  _$jscoverage['/combobox/control.js'].lineData[155]++;
  var self = this, placeholderEl = self.get('placeholderEl');
  _$jscoverage['/combobox/control.js'].lineData[157]++;
  self.callSuper(e);
  _$jscoverage['/combobox/control.js'].lineData[158]++;
  delayHide(self);
  _$jscoverage['/combobox/control.js'].lineData[159]++;
  if (visit20_159_1(self.get('invalidEl'))) {
    _$jscoverage['/combobox/control.js'].lineData[160]++;
    self.validate(function(error, val) {
  _$jscoverage['/combobox/control.js'].functionData[10]++;
  _$jscoverage['/combobox/control.js'].lineData[161]++;
  if (visit21_161_1(error)) {
    _$jscoverage['/combobox/control.js'].lineData[162]++;
    if (visit22_162_1(!self.get('focused') && (visit23_162_2(val === self.get('value'))))) {
      _$jscoverage['/combobox/control.js'].lineData[163]++;
      setInvalid(self, error);
    }
  } else {
    _$jscoverage['/combobox/control.js'].lineData[166]++;
    setInvalid(self, false);
  }
});
  }
  _$jscoverage['/combobox/control.js'].lineData[170]++;
  if (visit24_170_1(placeholderEl && !self.get('value'))) {
    _$jscoverage['/combobox/control.js'].lineData[171]++;
    placeholderEl.show();
  }
}, 
  handleMouseDownInternal: function(e) {
  _$jscoverage['/combobox/control.js'].functionData[11]++;
  _$jscoverage['/combobox/control.js'].lineData[176]++;
  var self = this, target, clearEl, trigger;
  _$jscoverage['/combobox/control.js'].lineData[178]++;
  self.callSuper(e);
  _$jscoverage['/combobox/control.js'].lineData[179]++;
  target = e.target;
  _$jscoverage['/combobox/control.js'].lineData[180]++;
  trigger = self.get('trigger');
  _$jscoverage['/combobox/control.js'].lineData[181]++;
  clearEl = self.get('clearEl');
  _$jscoverage['/combobox/control.js'].lineData[182]++;
  if (visit25_182_1(trigger && (visit26_182_2(visit27_182_3(trigger[0] === target) || trigger.contains(target))))) {
    _$jscoverage['/combobox/control.js'].lineData[183]++;
    if (visit28_183_1(self.get('collapsed'))) {
      _$jscoverage['/combobox/control.js'].lineData[185]++;
      self.focus();
      _$jscoverage['/combobox/control.js'].lineData[186]++;
      self.sendRequest('');
    } else {
      _$jscoverage['/combobox/control.js'].lineData[189]++;
      self.set('collapsed', true);
    }
    _$jscoverage['/combobox/control.js'].lineData[191]++;
    e.preventDefault();
  } else {
    _$jscoverage['/combobox/control.js'].lineData[192]++;
    if (visit29_192_1(clearEl && (visit30_192_2(visit31_192_3(clearEl[0] === target) || clearEl.contains(target))))) {
      _$jscoverage['/combobox/control.js'].lineData[193]++;
      self.get('input').val('');
      _$jscoverage['/combobox/control.js'].lineData[195]++;
      self.setCurrentValue('', {
  data: {
  causedByInputEvent: 1}});
      _$jscoverage['/combobox/control.js'].lineData[200]++;
      clearEl.hide();
    }
  }
}, 
  handleKeyDownInternal: function(e) {
  _$jscoverage['/combobox/control.js'].functionData[12]++;
  _$jscoverage['/combobox/control.js'].lineData[205]++;
  var self = this, updateInputOnDownUp, input, keyCode = e.keyCode, highlightedItem, handledByMenu, menu = self.get('menu');
  _$jscoverage['/combobox/control.js'].lineData[213]++;
  input = self.get('input');
  _$jscoverage['/combobox/control.js'].lineData[214]++;
  updateInputOnDownUp = self.get('updateInputOnDownUp');
  _$jscoverage['/combobox/control.js'].lineData[216]++;
  if (visit32_216_1(menu.get('visible'))) {
    _$jscoverage['/combobox/control.js'].lineData[218]++;
    highlightedItem = menu.get('highlightedItem');
    _$jscoverage['/combobox/control.js'].lineData[222]++;
    if (visit33_222_1(updateInputOnDownUp && highlightedItem)) {
      _$jscoverage['/combobox/control.js'].lineData[223]++;
      var menuChildren = menu.get('children');
      _$jscoverage['/combobox/control.js'].lineData[224]++;
      if (visit34_224_1(visit35_224_2(visit36_224_3(keyCode === KeyCode.DOWN) && visit37_225_1(highlightedItem === getFirstEnabledItem(menuChildren.concat().reverse()))) || visit38_226_1(visit39_226_2(keyCode === KeyCode.UP) && visit40_227_1(highlightedItem === getFirstEnabledItem(menuChildren))))) {
        _$jscoverage['/combobox/control.js'].lineData[229]++;
        self.setCurrentValue(self._savedValue);
        _$jscoverage['/combobox/control.js'].lineData[230]++;
        highlightedItem.set('highlighted', false);
        _$jscoverage['/combobox/control.js'].lineData[231]++;
        return true;
      }
    }
    _$jscoverage['/combobox/control.js'].lineData[235]++;
    handledByMenu = menu.handleKeyDownInternal(e);
    _$jscoverage['/combobox/control.js'].lineData[237]++;
    highlightedItem = menu.get('highlightedItem');
    _$jscoverage['/combobox/control.js'].lineData[240]++;
    if (visit41_240_1(keyCode === KeyCode.ESC)) {
      _$jscoverage['/combobox/control.js'].lineData[241]++;
      self.set('collapsed', true);
      _$jscoverage['/combobox/control.js'].lineData[242]++;
      if (visit42_242_1(updateInputOnDownUp)) {
        _$jscoverage['/combobox/control.js'].lineData[246]++;
        self.setCurrentValue(self._savedValue);
      }
      _$jscoverage['/combobox/control.js'].lineData[248]++;
      return true;
    }
    _$jscoverage['/combobox/control.js'].lineData[251]++;
    if (visit43_251_1(updateInputOnDownUp && S.inArray(keyCode, [KeyCode.DOWN, KeyCode.UP]))) {
      _$jscoverage['/combobox/control.js'].lineData[254]++;
      self.setCurrentValue(highlightedItem.get('textContent'));
    }
    _$jscoverage['/combobox/control.js'].lineData[259]++;
    if (visit44_259_1(visit45_259_2(keyCode === KeyCode.TAB) && highlightedItem)) {
      _$jscoverage['/combobox/control.js'].lineData[261]++;
      highlightedItem.handleClickInternal(e);
      _$jscoverage['/combobox/control.js'].lineData[263]++;
      if (visit46_263_1(self.get('multiple'))) {
        _$jscoverage['/combobox/control.js'].lineData[264]++;
        return true;
      }
    }
    _$jscoverage['/combobox/control.js'].lineData[268]++;
    return handledByMenu;
  } else {
    _$jscoverage['/combobox/control.js'].lineData[269]++;
    if (visit47_269_1(visit48_269_2(keyCode === KeyCode.DOWN) || visit49_269_3(keyCode === KeyCode.UP))) {
      _$jscoverage['/combobox/control.js'].lineData[271]++;
      var v = self.getCurrentValue();
      _$jscoverage['/combobox/control.js'].lineData[272]++;
      if (visit50_272_1(v !== undefined)) {
        _$jscoverage['/combobox/control.js'].lineData[273]++;
        self.sendRequest(v);
        _$jscoverage['/combobox/control.js'].lineData[274]++;
        return true;
      }
    }
  }
  _$jscoverage['/combobox/control.js'].lineData[277]++;
  return undefined;
}, 
  validate: function(callback) {
  _$jscoverage['/combobox/control.js'].functionData[13]++;
  _$jscoverage['/combobox/control.js'].lineData[281]++;
  var self = this, validator = self.get('validator'), val = self.getCurrentValue();
  _$jscoverage['/combobox/control.js'].lineData[285]++;
  if (visit51_285_1(validator)) {
    _$jscoverage['/combobox/control.js'].lineData[286]++;
    validator(val, function(error) {
  _$jscoverage['/combobox/control.js'].functionData[14]++;
  _$jscoverage['/combobox/control.js'].lineData[287]++;
  callback(error, val);
});
  } else {
    _$jscoverage['/combobox/control.js'].lineData[290]++;
    callback(false, val);
  }
}, 
  sendRequest: function(value) {
  _$jscoverage['/combobox/control.js'].functionData[15]++;
  _$jscoverage['/combobox/control.js'].lineData[299]++;
  var self = this, dataSource = self.get('dataSource');
  _$jscoverage['/combobox/control.js'].lineData[301]++;
  dataSource.fetchData(value, renderData, self);
}, 
  getKeyEventTarget: function() {
  _$jscoverage['/combobox/control.js'].functionData[16]++;
  _$jscoverage['/combobox/control.js'].lineData[305]++;
  return this.get('input');
}, 
  _onSetCollapsed: function(v) {
  _$jscoverage['/combobox/control.js'].functionData[17]++;
  _$jscoverage['/combobox/control.js'].lineData[309]++;
  var self = this, el = self.$el, menu = self.get('menu');
  _$jscoverage['/combobox/control.js'].lineData[312]++;
  if (visit52_312_1(v)) {
    _$jscoverage['/combobox/control.js'].lineData[313]++;
    menu.hide();
  } else {
    _$jscoverage['/combobox/control.js'].lineData[316]++;
    clearDismissTimer(self);
    _$jscoverage['/combobox/control.js'].lineData[317]++;
    if (visit53_317_1(!menu.get('visible'))) {
      _$jscoverage['/combobox/control.js'].lineData[318]++;
      if (visit54_318_1(self.get('matchElWidth'))) {
        _$jscoverage['/combobox/control.js'].lineData[319]++;
        menu.render();
        _$jscoverage['/combobox/control.js'].lineData[320]++;
        var menuEl = menu.get('el');
        _$jscoverage['/combobox/control.js'].lineData[321]++;
        var borderWidth = (visit55_322_1(parseInt(menuEl.css('borderLeftWidth'), 10) || 0)) + (visit56_323_1(parseInt(menuEl.css('borderRightWidth'), 10) || 0));
        _$jscoverage['/combobox/control.js'].lineData[324]++;
        menu.set('width', el[0].offsetWidth - borderWidth);
      }
      _$jscoverage['/combobox/control.js'].lineData[326]++;
      menu.show();
    }
  }
  _$jscoverage['/combobox/control.js'].lineData[329]++;
  this.get('input').attr('aria-expanded', !v);
}, 
  _onSetDisabled: function(v, e) {
  _$jscoverage['/combobox/control.js'].functionData[18]++;
  _$jscoverage['/combobox/control.js'].lineData[333]++;
  this.callSuper(v, e);
  _$jscoverage['/combobox/control.js'].lineData[334]++;
  this.get('input').attr('disabled', v);
}}, {
  ATTRS: {
  contentTpl: {
  value: ComboboxTpl}, 
  input: {
  selector: function() {
  _$jscoverage['/combobox/control.js'].functionData[19]++;
  _$jscoverage['/combobox/control.js'].lineData[352]++;
  return ('.' + this.getBaseCssClass('input'));
}}, 
  value: {
  value: '', 
  sync: 0, 
  render: 1, 
  parse: function() {
  _$jscoverage['/combobox/control.js'].functionData[20]++;
  _$jscoverage['/combobox/control.js'].lineData[368]++;
  return this.get('input').val();
}}, 
  trigger: {
  selector: function() {
  _$jscoverage['/combobox/control.js'].functionData[21]++;
  _$jscoverage['/combobox/control.js'].lineData[378]++;
  return '.' + this.getBaseCssClass('trigger');
}}, 
  placeholder: {
  render: 1, 
  sync: 0, 
  parse: function() {
  _$jscoverage['/combobox/control.js'].functionData[22]++;
  _$jscoverage['/combobox/control.js'].lineData[393]++;
  var placeHolder = this.get('placeholderEl');
  _$jscoverage['/combobox/control.js'].lineData[394]++;
  return visit57_394_1(placeHolder && placeHolder.html());
}}, 
  placeholderEl: {
  selector: function() {
  _$jscoverage['/combobox/control.js'].functionData[23]++;
  _$jscoverage['/combobox/control.js'].lineData[404]++;
  return ('.' + this.getBaseCssClass('placeholder'));
}}, 
  clearEl: {
  selector: function() {
  _$jscoverage['/combobox/control.js'].functionData[24]++;
  _$jscoverage['/combobox/control.js'].lineData[410]++;
  return ('.' + this.getBaseCssClass('clear'));
}}, 
  validator: {}, 
  invalidEl: {
  selector: function() {
  _$jscoverage['/combobox/control.js'].functionData[25]++;
  _$jscoverage['/combobox/control.js'].lineData[431]++;
  return '.' + this.getBaseCssClass('invalid-el');
}}, 
  allowTextSelection: {
  value: true}, 
  hasTrigger: {
  value: true, 
  sync: 0, 
  render: 1}, 
  menu: {
  value: {}, 
  getter: function(v) {
  _$jscoverage['/combobox/control.js'].functionData[26]++;
  _$jscoverage['/combobox/control.js'].lineData[469]++;
  if (visit58_469_1(!v.isControl)) {
    _$jscoverage['/combobox/control.js'].lineData[470]++;
    v.xclass = visit59_470_1(v.xclass || 'popupmenu');
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
  if (visit60_477_1(m.isControl)) {
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
    for (var i = 0; visit61_592_1(i < children.length); i++) {
      _$jscoverage['/combobox/control.js'].lineData[593]++;
      if (visit62_593_1(!children[i].get('disabled'))) {
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
    if (visit63_636_1(!e || visit64_636_2(menu === e.target))) {
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
      if (visit65_648_1(self.get('matchElWidth'))) {
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
    if (visit66_657_1(menu.get('visible'))) {
      _$jscoverage['/combobox/control.js'].lineData[658]++;
      var el = self.get('el');
      _$jscoverage['/combobox/control.js'].lineData[659]++;
      var menuEl = menu.get('el');
      _$jscoverage['/combobox/control.js'].lineData[660]++;
      var borderWidth = (visit67_660_1(parseInt(menuEl.css('borderLeftWidth'), 10) || 0)) + (visit68_661_1(parseInt(menuEl.css('borderRightWidth'), 10) || 0));
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
    if (visit69_670_1(item.isMenuItem)) {
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
    if (visit70_682_1(error)) {
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
    if (visit71_693_1(self._focusoutDismissTimer)) {
      _$jscoverage['/combobox/control.js'].lineData[694]++;
      return;
    }
    _$jscoverage['/combobox/control.js'].lineData[696]++;
    self._focusoutDismissTimer = setTimeout(function() {
  _$jscoverage['/combobox/control.js'].functionData[39]++;
  _$jscoverage['/combobox/control.js'].lineData[698]++;
  if (visit72_698_1(self._focusoutDismissTimer)) {
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
    if (visit73_708_1(t)) {
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
    var self = this, v, children = [], val, matchVal, highlightedItem, i, menu = self.get('menu');
    _$jscoverage['/combobox/control.js'].lineData[732]++;
    data = self.normalizeData(data);
    _$jscoverage['/combobox/control.js'].lineData[734]++;
    menu.removeChildren(true);
    _$jscoverage['/combobox/control.js'].lineData[736]++;
    if ((highlightedItem = menu.get('highlightedItem'))) {
      _$jscoverage['/combobox/control.js'].lineData[737]++;
      highlightedItem.set('highlighted', false);
    }
    _$jscoverage['/combobox/control.js'].lineData[740]++;
    if (visit74_740_1(data && data.length)) {
      _$jscoverage['/combobox/control.js'].lineData[741]++;
      for (i = 0; visit75_741_1(i < data.length); i++) {
        _$jscoverage['/combobox/control.js'].lineData[742]++;
        v = data[i];
        _$jscoverage['/combobox/control.js'].lineData[743]++;
        menu.addChild(v);
      }
      _$jscoverage['/combobox/control.js'].lineData[746]++;
      children = menu.get('children');
      _$jscoverage['/combobox/control.js'].lineData[749]++;
      val = self.getCurrentValue();
      _$jscoverage['/combobox/control.js'].lineData[751]++;
      if (visit76_751_1(self.get('highlightMatchItem'))) {
        _$jscoverage['/combobox/control.js'].lineData[752]++;
        for (i = 0; visit77_752_1(i < children.length); i++) {
          _$jscoverage['/combobox/control.js'].lineData[753]++;
          if (visit78_753_1(children[i].get('textContent') === val)) {
            _$jscoverage['/combobox/control.js'].lineData[754]++;
            children[i].set('highlighted', true);
            _$jscoverage['/combobox/control.js'].lineData[755]++;
            matchVal = true;
            _$jscoverage['/combobox/control.js'].lineData[756]++;
            break;
          }
        }
      }
      _$jscoverage['/combobox/control.js'].lineData[762]++;
      if (visit79_762_1(!matchVal && self.get('autoHighlightFirst'))) {
        _$jscoverage['/combobox/control.js'].lineData[763]++;
        for (i = 0; visit80_763_1(i < children.length); i++) {
          _$jscoverage['/combobox/control.js'].lineData[764]++;
          if (visit81_764_1(!children[i].get('disabled'))) {
            _$jscoverage['/combobox/control.js'].lineData[765]++;
            children[i].set('highlighted', true);
            _$jscoverage['/combobox/control.js'].lineData[766]++;
            break;
          }
        }
      }
      _$jscoverage['/combobox/control.js'].lineData[770]++;
      self.set('collapsed', false);
      _$jscoverage['/combobox/control.js'].lineData[772]++;
      self.fire('afterRenderData');
    } else {
      _$jscoverage['/combobox/control.js'].lineData[774]++;
      self.set('collapsed', true);
    }
  }
  _$jscoverage['/combobox/control.js'].lineData[780]++;
  return ComboBox;
});
