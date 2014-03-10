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
  _$jscoverage['/combobox/control.js'].lineData[44] = 0;
  _$jscoverage['/combobox/control.js'].lineData[46] = 0;
  _$jscoverage['/combobox/control.js'].lineData[47] = 0;
  _$jscoverage['/combobox/control.js'].lineData[48] = 0;
  _$jscoverage['/combobox/control.js'].lineData[49] = 0;
  _$jscoverage['/combobox/control.js'].lineData[52] = 0;
  _$jscoverage['/combobox/control.js'].lineData[54] = 0;
  _$jscoverage['/combobox/control.js'].lineData[55] = 0;
  _$jscoverage['/combobox/control.js'].lineData[56] = 0;
  _$jscoverage['/combobox/control.js'].lineData[62] = 0;
  _$jscoverage['/combobox/control.js'].lineData[64] = 0;
  _$jscoverage['/combobox/control.js'].lineData[68] = 0;
  _$jscoverage['/combobox/control.js'].lineData[71] = 0;
  _$jscoverage['/combobox/control.js'].lineData[81] = 0;
  _$jscoverage['/combobox/control.js'].lineData[83] = 0;
  _$jscoverage['/combobox/control.js'].lineData[85] = 0;
  _$jscoverage['/combobox/control.js'].lineData[86] = 0;
  _$jscoverage['/combobox/control.js'].lineData[88] = 0;
  _$jscoverage['/combobox/control.js'].lineData[93] = 0;
  _$jscoverage['/combobox/control.js'].lineData[101] = 0;
  _$jscoverage['/combobox/control.js'].lineData[111] = 0;
  _$jscoverage['/combobox/control.js'].lineData[116] = 0;
  _$jscoverage['/combobox/control.js'].lineData[119] = 0;
  _$jscoverage['/combobox/control.js'].lineData[120] = 0;
  _$jscoverage['/combobox/control.js'].lineData[122] = 0;
  _$jscoverage['/combobox/control.js'].lineData[123] = 0;
  _$jscoverage['/combobox/control.js'].lineData[124] = 0;
  _$jscoverage['/combobox/control.js'].lineData[126] = 0;
  _$jscoverage['/combobox/control.js'].lineData[127] = 0;
  _$jscoverage['/combobox/control.js'].lineData[129] = 0;
  _$jscoverage['/combobox/control.js'].lineData[134] = 0;
  _$jscoverage['/combobox/control.js'].lineData[136] = 0;
  _$jscoverage['/combobox/control.js'].lineData[137] = 0;
  _$jscoverage['/combobox/control.js'].lineData[139] = 0;
  _$jscoverage['/combobox/control.js'].lineData[140] = 0;
  _$jscoverage['/combobox/control.js'].lineData[145] = 0;
  _$jscoverage['/combobox/control.js'].lineData[147] = 0;
  _$jscoverage['/combobox/control.js'].lineData[148] = 0;
  _$jscoverage['/combobox/control.js'].lineData[149] = 0;
  _$jscoverage['/combobox/control.js'].lineData[150] = 0;
  _$jscoverage['/combobox/control.js'].lineData[151] = 0;
  _$jscoverage['/combobox/control.js'].lineData[152] = 0;
  _$jscoverage['/combobox/control.js'].lineData[153] = 0;
  _$jscoverage['/combobox/control.js'].lineData[156] = 0;
  _$jscoverage['/combobox/control.js'].lineData[160] = 0;
  _$jscoverage['/combobox/control.js'].lineData[161] = 0;
  _$jscoverage['/combobox/control.js'].lineData[166] = 0;
  _$jscoverage['/combobox/control.js'].lineData[169] = 0;
  _$jscoverage['/combobox/control.js'].lineData[170] = 0;
  _$jscoverage['/combobox/control.js'].lineData[171] = 0;
  _$jscoverage['/combobox/control.js'].lineData[172] = 0;
  _$jscoverage['/combobox/control.js'].lineData[173] = 0;
  _$jscoverage['/combobox/control.js'].lineData[175] = 0;
  _$jscoverage['/combobox/control.js'].lineData[176] = 0;
  _$jscoverage['/combobox/control.js'].lineData[179] = 0;
  _$jscoverage['/combobox/control.js'].lineData[181] = 0;
  _$jscoverage['/combobox/control.js'].lineData[186] = 0;
  _$jscoverage['/combobox/control.js'].lineData[194] = 0;
  _$jscoverage['/combobox/control.js'].lineData[195] = 0;
  _$jscoverage['/combobox/control.js'].lineData[197] = 0;
  _$jscoverage['/combobox/control.js'].lineData[199] = 0;
  _$jscoverage['/combobox/control.js'].lineData[203] = 0;
  _$jscoverage['/combobox/control.js'].lineData[204] = 0;
  _$jscoverage['/combobox/control.js'].lineData[205] = 0;
  _$jscoverage['/combobox/control.js'].lineData[210] = 0;
  _$jscoverage['/combobox/control.js'].lineData[211] = 0;
  _$jscoverage['/combobox/control.js'].lineData[212] = 0;
  _$jscoverage['/combobox/control.js'].lineData[216] = 0;
  _$jscoverage['/combobox/control.js'].lineData[218] = 0;
  _$jscoverage['/combobox/control.js'].lineData[221] = 0;
  _$jscoverage['/combobox/control.js'].lineData[222] = 0;
  _$jscoverage['/combobox/control.js'].lineData[223] = 0;
  _$jscoverage['/combobox/control.js'].lineData[227] = 0;
  _$jscoverage['/combobox/control.js'].lineData[229] = 0;
  _$jscoverage['/combobox/control.js'].lineData[232] = 0;
  _$jscoverage['/combobox/control.js'].lineData[235] = 0;
  _$jscoverage['/combobox/control.js'].lineData[240] = 0;
  _$jscoverage['/combobox/control.js'].lineData[242] = 0;
  _$jscoverage['/combobox/control.js'].lineData[244] = 0;
  _$jscoverage['/combobox/control.js'].lineData[245] = 0;
  _$jscoverage['/combobox/control.js'].lineData[249] = 0;
  _$jscoverage['/combobox/control.js'].lineData[250] = 0;
  _$jscoverage['/combobox/control.js'].lineData[252] = 0;
  _$jscoverage['/combobox/control.js'].lineData[253] = 0;
  _$jscoverage['/combobox/control.js'].lineData[254] = 0;
  _$jscoverage['/combobox/control.js'].lineData[255] = 0;
  _$jscoverage['/combobox/control.js'].lineData[258] = 0;
  _$jscoverage['/combobox/control.js'].lineData[262] = 0;
  _$jscoverage['/combobox/control.js'].lineData[266] = 0;
  _$jscoverage['/combobox/control.js'].lineData[267] = 0;
  _$jscoverage['/combobox/control.js'].lineData[268] = 0;
  _$jscoverage['/combobox/control.js'].lineData[271] = 0;
  _$jscoverage['/combobox/control.js'].lineData[280] = 0;
  _$jscoverage['/combobox/control.js'].lineData[282] = 0;
  _$jscoverage['/combobox/control.js'].lineData[286] = 0;
  _$jscoverage['/combobox/control.js'].lineData[289] = 0;
  _$jscoverage['/combobox/control.js'].lineData[290] = 0;
  _$jscoverage['/combobox/control.js'].lineData[293] = 0;
  _$jscoverage['/combobox/control.js'].lineData[294] = 0;
  _$jscoverage['/combobox/control.js'].lineData[295] = 0;
  _$jscoverage['/combobox/control.js'].lineData[296] = 0;
  _$jscoverage['/combobox/control.js'].lineData[297] = 0;
  _$jscoverage['/combobox/control.js'].lineData[298] = 0;
  _$jscoverage['/combobox/control.js'].lineData[301] = 0;
  _$jscoverage['/combobox/control.js'].lineData[303] = 0;
  _$jscoverage['/combobox/control.js'].lineData[412] = 0;
  _$jscoverage['/combobox/control.js'].lineData[413] = 0;
  _$jscoverage['/combobox/control.js'].lineData[414] = 0;
  _$jscoverage['/combobox/control.js'].lineData[415] = 0;
  _$jscoverage['/combobox/control.js'].lineData[417] = 0;
  _$jscoverage['/combobox/control.js'].lineData[420] = 0;
  _$jscoverage['/combobox/control.js'].lineData[421] = 0;
  _$jscoverage['/combobox/control.js'].lineData[422] = 0;
  _$jscoverage['/combobox/control.js'].lineData[430] = 0;
  _$jscoverage['/combobox/control.js'].lineData[538] = 0;
  _$jscoverage['/combobox/control.js'].lineData[539] = 0;
  _$jscoverage['/combobox/control.js'].lineData[540] = 0;
  _$jscoverage['/combobox/control.js'].lineData[541] = 0;
  _$jscoverage['/combobox/control.js'].lineData[544] = 0;
  _$jscoverage['/combobox/control.js'].lineData[547] = 0;
  _$jscoverage['/combobox/control.js'].lineData[548] = 0;
  _$jscoverage['/combobox/control.js'].lineData[549] = 0;
  _$jscoverage['/combobox/control.js'].lineData[552] = 0;
  _$jscoverage['/combobox/control.js'].lineData[553] = 0;
  _$jscoverage['/combobox/control.js'].lineData[557] = 0;
  _$jscoverage['/combobox/control.js'].lineData[558] = 0;
  _$jscoverage['/combobox/control.js'].lineData[562] = 0;
  _$jscoverage['/combobox/control.js'].lineData[563] = 0;
  _$jscoverage['/combobox/control.js'].lineData[565] = 0;
  _$jscoverage['/combobox/control.js'].lineData[567] = 0;
  _$jscoverage['/combobox/control.js'].lineData[570] = 0;
  _$jscoverage['/combobox/control.js'].lineData[571] = 0;
  _$jscoverage['/combobox/control.js'].lineData[575] = 0;
  _$jscoverage['/combobox/control.js'].lineData[580] = 0;
  _$jscoverage['/combobox/control.js'].lineData[581] = 0;
  _$jscoverage['/combobox/control.js'].lineData[583] = 0;
  _$jscoverage['/combobox/control.js'].lineData[584] = 0;
  _$jscoverage['/combobox/control.js'].lineData[585] = 0;
  _$jscoverage['/combobox/control.js'].lineData[586] = 0;
  _$jscoverage['/combobox/control.js'].lineData[587] = 0;
  _$jscoverage['/combobox/control.js'].lineData[588] = 0;
  _$jscoverage['/combobox/control.js'].lineData[590] = 0;
  _$jscoverage['/combobox/control.js'].lineData[591] = 0;
  _$jscoverage['/combobox/control.js'].lineData[592] = 0;
  _$jscoverage['/combobox/control.js'].lineData[595] = 0;
  _$jscoverage['/combobox/control.js'].lineData[599] = 0;
  _$jscoverage['/combobox/control.js'].lineData[600] = 0;
  _$jscoverage['/combobox/control.js'].lineData[603] = 0;
  _$jscoverage['/combobox/control.js'].lineData[604] = 0;
  _$jscoverage['/combobox/control.js'].lineData[605] = 0;
  _$jscoverage['/combobox/control.js'].lineData[606] = 0;
  _$jscoverage['/combobox/control.js'].lineData[607] = 0;
  _$jscoverage['/combobox/control.js'].lineData[611] = 0;
  _$jscoverage['/combobox/control.js'].lineData[612] = 0;
  _$jscoverage['/combobox/control.js'].lineData[615] = 0;
  _$jscoverage['/combobox/control.js'].lineData[616] = 0;
  _$jscoverage['/combobox/control.js'].lineData[617] = 0;
  _$jscoverage['/combobox/control.js'].lineData[618] = 0;
  _$jscoverage['/combobox/control.js'].lineData[620] = 0;
  _$jscoverage['/combobox/control.js'].lineData[621] = 0;
  _$jscoverage['/combobox/control.js'].lineData[625] = 0;
  _$jscoverage['/combobox/control.js'].lineData[626] = 0;
  _$jscoverage['/combobox/control.js'].lineData[627] = 0;
  _$jscoverage['/combobox/control.js'].lineData[629] = 0;
  _$jscoverage['/combobox/control.js'].lineData[631] = 0;
  _$jscoverage['/combobox/control.js'].lineData[632] = 0;
  _$jscoverage['/combobox/control.js'].lineData[639] = 0;
  _$jscoverage['/combobox/control.js'].lineData[640] = 0;
  _$jscoverage['/combobox/control.js'].lineData[641] = 0;
  _$jscoverage['/combobox/control.js'].lineData[642] = 0;
  _$jscoverage['/combobox/control.js'].lineData[643] = 0;
  _$jscoverage['/combobox/control.js'].lineData[647] = 0;
  _$jscoverage['/combobox/control.js'].lineData[648] = 0;
  _$jscoverage['/combobox/control.js'].lineData[655] = 0;
  _$jscoverage['/combobox/control.js'].lineData[656] = 0;
  _$jscoverage['/combobox/control.js'].lineData[665] = 0;
  _$jscoverage['/combobox/control.js'].lineData[667] = 0;
  _$jscoverage['/combobox/control.js'].lineData[669] = 0;
  _$jscoverage['/combobox/control.js'].lineData[670] = 0;
  _$jscoverage['/combobox/control.js'].lineData[673] = 0;
  _$jscoverage['/combobox/control.js'].lineData[674] = 0;
  _$jscoverage['/combobox/control.js'].lineData[675] = 0;
  _$jscoverage['/combobox/control.js'].lineData[676] = 0;
  _$jscoverage['/combobox/control.js'].lineData[679] = 0;
  _$jscoverage['/combobox/control.js'].lineData[682] = 0;
  _$jscoverage['/combobox/control.js'].lineData[684] = 0;
  _$jscoverage['/combobox/control.js'].lineData[685] = 0;
  _$jscoverage['/combobox/control.js'].lineData[686] = 0;
  _$jscoverage['/combobox/control.js'].lineData[687] = 0;
  _$jscoverage['/combobox/control.js'].lineData[688] = 0;
  _$jscoverage['/combobox/control.js'].lineData[689] = 0;
  _$jscoverage['/combobox/control.js'].lineData[695] = 0;
  _$jscoverage['/combobox/control.js'].lineData[696] = 0;
  _$jscoverage['/combobox/control.js'].lineData[697] = 0;
  _$jscoverage['/combobox/control.js'].lineData[698] = 0;
  _$jscoverage['/combobox/control.js'].lineData[699] = 0;
  _$jscoverage['/combobox/control.js'].lineData[703] = 0;
  _$jscoverage['/combobox/control.js'].lineData[705] = 0;
  _$jscoverage['/combobox/control.js'].lineData[707] = 0;
  _$jscoverage['/combobox/control.js'].lineData[713] = 0;
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
}
if (! _$jscoverage['/combobox/control.js'].branchData) {
  _$jscoverage['/combobox/control.js'].branchData = {};
  _$jscoverage['/combobox/control.js'].branchData['46'] = [];
  _$jscoverage['/combobox/control.js'].branchData['46'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['48'] = [];
  _$jscoverage['/combobox/control.js'].branchData['48'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['54'] = [];
  _$jscoverage['/combobox/control.js'].branchData['54'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['85'] = [];
  _$jscoverage['/combobox/control.js'].branchData['85'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['119'] = [];
  _$jscoverage['/combobox/control.js'].branchData['119'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['122'] = [];
  _$jscoverage['/combobox/control.js'].branchData['122'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['136'] = [];
  _$jscoverage['/combobox/control.js'].branchData['136'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['149'] = [];
  _$jscoverage['/combobox/control.js'].branchData['149'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['151'] = [];
  _$jscoverage['/combobox/control.js'].branchData['151'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['152'] = [];
  _$jscoverage['/combobox/control.js'].branchData['152'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['152'][2] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['160'] = [];
  _$jscoverage['/combobox/control.js'].branchData['160'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['172'] = [];
  _$jscoverage['/combobox/control.js'].branchData['172'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['172'][2] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['172'][3] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['173'] = [];
  _$jscoverage['/combobox/control.js'].branchData['173'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['197'] = [];
  _$jscoverage['/combobox/control.js'].branchData['197'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['203'] = [];
  _$jscoverage['/combobox/control.js'].branchData['203'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['205'] = [];
  _$jscoverage['/combobox/control.js'].branchData['205'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['205'][2] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['205'][3] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['206'] = [];
  _$jscoverage['/combobox/control.js'].branchData['206'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['207'] = [];
  _$jscoverage['/combobox/control.js'].branchData['207'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['207'][2] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['208'] = [];
  _$jscoverage['/combobox/control.js'].branchData['208'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['221'] = [];
  _$jscoverage['/combobox/control.js'].branchData['221'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['223'] = [];
  _$jscoverage['/combobox/control.js'].branchData['223'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['232'] = [];
  _$jscoverage['/combobox/control.js'].branchData['232'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['240'] = [];
  _$jscoverage['/combobox/control.js'].branchData['240'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['240'][2] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['244'] = [];
  _$jscoverage['/combobox/control.js'].branchData['244'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['250'] = [];
  _$jscoverage['/combobox/control.js'].branchData['250'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['250'][2] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['250'][3] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['253'] = [];
  _$jscoverage['/combobox/control.js'].branchData['253'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['266'] = [];
  _$jscoverage['/combobox/control.js'].branchData['266'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['289'] = [];
  _$jscoverage['/combobox/control.js'].branchData['289'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['294'] = [];
  _$jscoverage['/combobox/control.js'].branchData['294'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['295'] = [];
  _$jscoverage['/combobox/control.js'].branchData['295'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['299'] = [];
  _$jscoverage['/combobox/control.js'].branchData['299'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['300'] = [];
  _$jscoverage['/combobox/control.js'].branchData['300'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['412'] = [];
  _$jscoverage['/combobox/control.js'].branchData['412'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['413'] = [];
  _$jscoverage['/combobox/control.js'].branchData['413'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['420'] = [];
  _$jscoverage['/combobox/control.js'].branchData['420'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['539'] = [];
  _$jscoverage['/combobox/control.js'].branchData['539'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['540'] = [];
  _$jscoverage['/combobox/control.js'].branchData['540'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['584'] = [];
  _$jscoverage['/combobox/control.js'].branchData['584'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['584'][2] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['603'] = [];
  _$jscoverage['/combobox/control.js'].branchData['603'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['615'] = [];
  _$jscoverage['/combobox/control.js'].branchData['615'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['626'] = [];
  _$jscoverage['/combobox/control.js'].branchData['626'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['631'] = [];
  _$jscoverage['/combobox/control.js'].branchData['631'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['641'] = [];
  _$jscoverage['/combobox/control.js'].branchData['641'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['673'] = [];
  _$jscoverage['/combobox/control.js'].branchData['673'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['674'] = [];
  _$jscoverage['/combobox/control.js'].branchData['674'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['684'] = [];
  _$jscoverage['/combobox/control.js'].branchData['684'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['685'] = [];
  _$jscoverage['/combobox/control.js'].branchData['685'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['686'] = [];
  _$jscoverage['/combobox/control.js'].branchData['686'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['695'] = [];
  _$jscoverage['/combobox/control.js'].branchData['695'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['696'] = [];
  _$jscoverage['/combobox/control.js'].branchData['696'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['697'] = [];
  _$jscoverage['/combobox/control.js'].branchData['697'][1] = new BranchData();
}
_$jscoverage['/combobox/control.js'].branchData['697'][1].init(25, 28, '!children[i].get(\'disabled\')');
function visit63_697_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['697'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['696'][1].init(29, 19, 'i < children.length');
function visit62_696_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['696'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['695'][1].init(753, 46, '!matchVal && (self.get(\'autoHighlightFirst\'))');
function visit61_695_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['695'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['686'][1].init(25, 38, 'children[i].get(\'textContent\') === val');
function visit60_686_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['686'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['685'][1].init(29, 19, 'i < children.length');
function visit59_685_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['685'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['684'][1].init(314, 30, 'self.get(\'highlightMatchItem\')');
function visit58_684_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['684'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['674'][1].init(25, 15, 'i < data.length');
function visit57_674_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['674'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['673'][1].init(408, 19, 'data && data.length');
function visit56_673_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['673'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['641'][1].init(57, 1, 't');
function visit55_641_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['641'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['631'][1].init(48, 26, 'self._focusoutDismissTimer');
function visit54_631_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['631'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['626'][1].init(13, 26, 'self._focusoutDismissTimer');
function visit53_626_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['626'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['615'][1].init(146, 5, 'error');
function visit52_615_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['615'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['603'][1].init(92, 15, 'item.isMenuItem');
function visit51_603_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['603'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['584'][2].init(104, 17, 'menu === e.target');
function visit50_584_2(result) {
  _$jscoverage['/combobox/control.js'].branchData['584'][2].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['584'][1].init(98, 23, '!e || menu === e.target');
function visit49_584_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['584'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['540'][1].init(17, 28, '!children[i].get(\'disabled\')');
function visit48_540_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['540'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['539'][1].init(25, 19, 'i < children.length');
function visit47_539_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['539'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['420'][1].init(29, 11, 'm.isControl');
function visit46_420_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['420'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['413'][1].init(40, 23, 'v.xclass || \'popupmenu\'');
function visit45_413_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['413'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['412'][1].init(29, 12, '!v.isControl');
function visit44_412_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['412'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['300'][1].init(88, 49, 'parseInt(menuEl.css(\'borderRightWidth\'), 10) || 0');
function visit43_300_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['300'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['299'][1].init(46, 48, 'parseInt(menuEl.css(\'borderLeftWidth\'), 10) || 0');
function visit42_299_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['299'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['295'][1].init(29, 24, 'self.get(\'matchElWidth\')');
function visit41_295_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['295'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['294'][1].init(116, 20, '!menu.get(\'visible\')');
function visit40_294_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['294'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['289'][1].init(134, 1, 'v');
function visit39_289_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['289'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['266'][1].init(168, 9, 'validator');
function visit38_266_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['266'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['253'][1].init(142, 15, 'v !== undefined');
function visit37_253_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['253'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['250'][3].init(2938, 22, 'keyCode === KeyCode.UP');
function visit36_250_3(result) {
  _$jscoverage['/combobox/control.js'].branchData['250'][3].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['250'][2].init(2910, 24, 'keyCode === KeyCode.DOWN');
function visit35_250_2(result) {
  _$jscoverage['/combobox/control.js'].branchData['250'][2].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['250'][1].init(2910, 50, 'keyCode === KeyCode.DOWN || keyCode === KeyCode.UP');
function visit34_250_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['250'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['244'][1].init(212, 20, 'self.get(\'multiple\')');
function visit33_244_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['244'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['240'][2].init(2051, 23, 'keyCode === KeyCode.TAB');
function visit32_240_2(result) {
  _$jscoverage['/combobox/control.js'].branchData['240'][2].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['240'][1].init(2051, 42, 'keyCode === KeyCode.TAB && highlightedItem');
function visit31_240_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['240'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['232'][1].init(1622, 93, 'updateInputOnDownUp && S.inArray(keyCode, [KeyCode.DOWN, KeyCode.UP])');
function visit30_232_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['232'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['223'][1].init(82, 19, 'updateInputOnDownUp');
function visit29_223_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['223'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['221'][1].init(1107, 23, 'keyCode === KeyCode.ESC');
function visit28_221_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['221'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['208'][1].init(57, 53, 'highlightedItem === getFirstEnabledItem(menuChildren)');
function visit27_208_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['208'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['207'][2].init(256, 22, 'keyCode === KeyCode.UP');
function visit26_207_2(result) {
  _$jscoverage['/combobox/control.js'].branchData['207'][2].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['207'][1].init(159, 111, 'keyCode === KeyCode.UP && highlightedItem === getFirstEnabledItem(menuChildren)');
function visit25_207_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['207'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['206'][1].init(55, 72, 'highlightedItem === getFirstEnabledItem(menuChildren.concat().reverse())');
function visit24_206_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['206'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['205'][3].init(94, 24, 'keyCode === KeyCode.DOWN');
function visit23_205_3(result) {
  _$jscoverage['/combobox/control.js'].branchData['205'][3].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['205'][2].init(94, 128, 'keyCode === KeyCode.DOWN && highlightedItem === getFirstEnabledItem(menuChildren.concat().reverse())');
function visit22_205_2(result) {
  _$jscoverage['/combobox/control.js'].branchData['205'][2].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['205'][1].init(94, 271, 'keyCode === KeyCode.DOWN && highlightedItem === getFirstEnabledItem(menuChildren.concat().reverse()) || keyCode === KeyCode.UP && highlightedItem === getFirstEnabledItem(menuChildren)');
function visit21_205_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['205'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['203'][1].init(243, 38, 'updateInputOnDownUp && highlightedItem');
function visit20_203_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['203'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['197'][1].init(396, 19, 'menu.get(\'visible\')');
function visit19_197_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['197'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['173'][1].init(25, 21, 'self.get(\'collapsed\')');
function visit18_173_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['173'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['172'][3].init(240, 21, 'trigger[0] === target');
function visit17_172_3(result) {
  _$jscoverage['/combobox/control.js'].branchData['172'][3].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['172'][2].init(240, 49, 'trigger[0] === target || trigger.contains(target)');
function visit16_172_2(result) {
  _$jscoverage['/combobox/control.js'].branchData['172'][2].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['172'][1].init(228, 62, 'trigger && (trigger[0] === target || trigger.contains(target))');
function visit15_172_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['172'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['160'][1].init(653, 35, 'placeholderEl && !self.get(\'value\')');
function visit14_160_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['160'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['152'][2].init(58, 25, 'val === self.get(\'value\')');
function visit13_152_2(result) {
  _$jscoverage['/combobox/control.js'].branchData['152'][2].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['152'][1].init(33, 51, '!self.get(\'focused\') && (val === self.get(\'value\'))');
function visit12_152_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['152'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['151'][1].init(29, 5, 'error');
function visit11_151_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['151'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['149'][1].init(185, 21, 'self.get(\'invalidEl\')');
function visit10_149_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['149'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['136'][1].init(89, 21, 'self.get(\'invalidEl\')');
function visit9_136_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['136'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['122'][1].init(144, 19, 'value === undefined');
function visit8_122_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['122'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['119'][1].init(142, 20, 'e.causedByInputEvent');
function visit7_119_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['119'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['85'][1].init(554, 20, 'menu.get(\'rendered\')');
function visit6_85_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['85'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['54'][1].init(369, 15, 'i < data.length');
function visit5_54_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['54'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['48'][1].init(93, 18, 'self.get(\'format\')');
function visit4_48_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['48'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['46'][1].init(93, 19, 'data && data.length');
function visit3_46_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['46'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/combobox/control.js'].functionData[0]++;
  _$jscoverage['/combobox/control.js'].lineData[7]++;
  var Node = require('node');
  _$jscoverage['/combobox/control.js'].lineData[8]++;
  var Control = require('component/control');
  _$jscoverage['/combobox/control.js'].lineData[9]++;
  var ComboBoxRender = require('./render');
  _$jscoverage['/combobox/control.js'].lineData[11]++;
  require('menu');
  _$jscoverage['/combobox/control.js'].lineData[13]++;
  var ComboBox, KeyCode = Node.KeyCode;
  _$jscoverage['/combobox/control.js'].lineData[22]++;
  ComboBox = Control.extend([], {
  initializer: function() {
  _$jscoverage['/combobox/control.js'].functionData[1]++;
  _$jscoverage['/combobox/control.js'].lineData[28]++;
  this.publish('afterRenderData', {
  bubbles: false});
}, 
  _savedValue: null, 
  'normalizeData': function(data) {
  _$jscoverage['/combobox/control.js'].functionData[2]++;
  _$jscoverage['/combobox/control.js'].lineData[44]++;
  var self = this, contents, v, i, c;
  _$jscoverage['/combobox/control.js'].lineData[46]++;
  if (visit3_46_1(data && data.length)) {
    _$jscoverage['/combobox/control.js'].lineData[47]++;
    data = data.slice(0, self.get('maxItemCount'));
    _$jscoverage['/combobox/control.js'].lineData[48]++;
    if (visit4_48_1(self.get('format'))) {
      _$jscoverage['/combobox/control.js'].lineData[49]++;
      contents = self.get('format').call(self, self.getValueForAutocomplete(), data);
    } else {
      _$jscoverage['/combobox/control.js'].lineData[52]++;
      contents = [];
    }
    _$jscoverage['/combobox/control.js'].lineData[54]++;
    for (i = 0; visit5_54_1(i < data.length); i++) {
      _$jscoverage['/combobox/control.js'].lineData[55]++;
      v = data[i];
      _$jscoverage['/combobox/control.js'].lineData[56]++;
      c = contents[i] = S.mix({
  content: v, 
  textContent: v, 
  value: v}, contents[i]);
    }
    _$jscoverage['/combobox/control.js'].lineData[62]++;
    return contents;
  }
  _$jscoverage['/combobox/control.js'].lineData[64]++;
  return contents;
}, 
  bindUI: function() {
  _$jscoverage['/combobox/control.js'].functionData[3]++;
  _$jscoverage['/combobox/control.js'].lineData[68]++;
  var self = this, input = self.get('input');
  _$jscoverage['/combobox/control.js'].lineData[71]++;
  input.on('input', onValueChange, self);
  _$jscoverage['/combobox/control.js'].lineData[81]++;
  self.on('click', onMenuItemClick, self);
  _$jscoverage['/combobox/control.js'].lineData[83]++;
  var menu = self.get('menu');
  _$jscoverage['/combobox/control.js'].lineData[85]++;
  if (visit6_85_1(menu.get('rendered'))) {
    _$jscoverage['/combobox/control.js'].lineData[86]++;
    onMenuAfterRenderUI.call(self);
  } else {
    _$jscoverage['/combobox/control.js'].lineData[88]++;
    menu.on('afterRenderUI', onMenuAfterRenderUI, self);
  }
}, 
  destructor: function() {
  _$jscoverage['/combobox/control.js'].functionData[4]++;
  _$jscoverage['/combobox/control.js'].lineData[93]++;
  this.get('menu').destroy();
}, 
  getValueForAutocomplete: function() {
  _$jscoverage['/combobox/control.js'].functionData[5]++;
  _$jscoverage['/combobox/control.js'].lineData[101]++;
  return this.get('value');
}, 
  setValueFromAutocomplete: function(value, setCfg) {
  _$jscoverage['/combobox/control.js'].functionData[6]++;
  _$jscoverage['/combobox/control.js'].lineData[111]++;
  this.set('value', value, setCfg);
}, 
  '_onSetValue': function(v, e) {
  _$jscoverage['/combobox/control.js'].functionData[7]++;
  _$jscoverage['/combobox/control.js'].lineData[116]++;
  var self = this, value;
  _$jscoverage['/combobox/control.js'].lineData[119]++;
  if (visit7_119_1(e.causedByInputEvent)) {
    _$jscoverage['/combobox/control.js'].lineData[120]++;
    value = self.getValueForAutocomplete();
    _$jscoverage['/combobox/control.js'].lineData[122]++;
    if (visit8_122_1(value === undefined)) {
      _$jscoverage['/combobox/control.js'].lineData[123]++;
      self.set('collapsed', true);
      _$jscoverage['/combobox/control.js'].lineData[124]++;
      return;
    }
    _$jscoverage['/combobox/control.js'].lineData[126]++;
    self._savedValue = value;
    _$jscoverage['/combobox/control.js'].lineData[127]++;
    self.sendRequest(value);
  } else {
    _$jscoverage['/combobox/control.js'].lineData[129]++;
    self.get('input').val(v);
  }
}, 
  handleFocusInternal: function() {
  _$jscoverage['/combobox/control.js'].functionData[8]++;
  _$jscoverage['/combobox/control.js'].lineData[134]++;
  var self = this, placeholderEl;
  _$jscoverage['/combobox/control.js'].lineData[136]++;
  if (visit9_136_1(self.get('invalidEl'))) {
    _$jscoverage['/combobox/control.js'].lineData[137]++;
    setInvalid(self, false);
  }
  _$jscoverage['/combobox/control.js'].lineData[139]++;
  if ((placeholderEl = self.get('placeholderEl'))) {
    _$jscoverage['/combobox/control.js'].lineData[140]++;
    placeholderEl.hide();
  }
}, 
  handleBlurInternal: function(e) {
  _$jscoverage['/combobox/control.js'].functionData[9]++;
  _$jscoverage['/combobox/control.js'].lineData[145]++;
  var self = this, placeholderEl = self.get('placeholderEl');
  _$jscoverage['/combobox/control.js'].lineData[147]++;
  self.callSuper(e);
  _$jscoverage['/combobox/control.js'].lineData[148]++;
  delayHide(self);
  _$jscoverage['/combobox/control.js'].lineData[149]++;
  if (visit10_149_1(self.get('invalidEl'))) {
    _$jscoverage['/combobox/control.js'].lineData[150]++;
    self.validate(function(error, val) {
  _$jscoverage['/combobox/control.js'].functionData[10]++;
  _$jscoverage['/combobox/control.js'].lineData[151]++;
  if (visit11_151_1(error)) {
    _$jscoverage['/combobox/control.js'].lineData[152]++;
    if (visit12_152_1(!self.get('focused') && (visit13_152_2(val === self.get('value'))))) {
      _$jscoverage['/combobox/control.js'].lineData[153]++;
      setInvalid(self, error);
    }
  } else {
    _$jscoverage['/combobox/control.js'].lineData[156]++;
    setInvalid(self, false);
  }
});
  }
  _$jscoverage['/combobox/control.js'].lineData[160]++;
  if (visit14_160_1(placeholderEl && !self.get('value'))) {
    _$jscoverage['/combobox/control.js'].lineData[161]++;
    placeholderEl.show();
  }
}, 
  handleMouseDownInternal: function(e) {
  _$jscoverage['/combobox/control.js'].functionData[11]++;
  _$jscoverage['/combobox/control.js'].lineData[166]++;
  var self = this, target, trigger;
  _$jscoverage['/combobox/control.js'].lineData[169]++;
  self.callSuper(e);
  _$jscoverage['/combobox/control.js'].lineData[170]++;
  target = e.target;
  _$jscoverage['/combobox/control.js'].lineData[171]++;
  trigger = self.get('trigger');
  _$jscoverage['/combobox/control.js'].lineData[172]++;
  if (visit15_172_1(trigger && (visit16_172_2(visit17_172_3(trigger[0] === target) || trigger.contains(target))))) {
    _$jscoverage['/combobox/control.js'].lineData[173]++;
    if (visit18_173_1(self.get('collapsed'))) {
      _$jscoverage['/combobox/control.js'].lineData[175]++;
      self.focus();
      _$jscoverage['/combobox/control.js'].lineData[176]++;
      self.sendRequest('');
    } else {
      _$jscoverage['/combobox/control.js'].lineData[179]++;
      self.set('collapsed', true);
    }
    _$jscoverage['/combobox/control.js'].lineData[181]++;
    e.preventDefault();
  }
}, 
  handleKeyDownInternal: function(e) {
  _$jscoverage['/combobox/control.js'].functionData[12]++;
  _$jscoverage['/combobox/control.js'].lineData[186]++;
  var self = this, updateInputOnDownUp, input, keyCode = e.keyCode, highlightedItem, handledByMenu, menu = self.get('menu');
  _$jscoverage['/combobox/control.js'].lineData[194]++;
  input = self.get('input');
  _$jscoverage['/combobox/control.js'].lineData[195]++;
  updateInputOnDownUp = self.get('updateInputOnDownUp');
  _$jscoverage['/combobox/control.js'].lineData[197]++;
  if (visit19_197_1(menu.get('visible'))) {
    _$jscoverage['/combobox/control.js'].lineData[199]++;
    highlightedItem = menu.get('highlightedItem');
    _$jscoverage['/combobox/control.js'].lineData[203]++;
    if (visit20_203_1(updateInputOnDownUp && highlightedItem)) {
      _$jscoverage['/combobox/control.js'].lineData[204]++;
      var menuChildren = menu.get('children');
      _$jscoverage['/combobox/control.js'].lineData[205]++;
      if (visit21_205_1(visit22_205_2(visit23_205_3(keyCode === KeyCode.DOWN) && visit24_206_1(highlightedItem === getFirstEnabledItem(menuChildren.concat().reverse()))) || visit25_207_1(visit26_207_2(keyCode === KeyCode.UP) && visit27_208_1(highlightedItem === getFirstEnabledItem(menuChildren))))) {
        _$jscoverage['/combobox/control.js'].lineData[210]++;
        self.setValueFromAutocomplete(self._savedValue);
        _$jscoverage['/combobox/control.js'].lineData[211]++;
        highlightedItem.set('highlighted', false);
        _$jscoverage['/combobox/control.js'].lineData[212]++;
        return true;
      }
    }
    _$jscoverage['/combobox/control.js'].lineData[216]++;
    handledByMenu = menu.handleKeyDownInternal(e);
    _$jscoverage['/combobox/control.js'].lineData[218]++;
    highlightedItem = menu.get('highlightedItem');
    _$jscoverage['/combobox/control.js'].lineData[221]++;
    if (visit28_221_1(keyCode === KeyCode.ESC)) {
      _$jscoverage['/combobox/control.js'].lineData[222]++;
      self.set('collapsed', true);
      _$jscoverage['/combobox/control.js'].lineData[223]++;
      if (visit29_223_1(updateInputOnDownUp)) {
        _$jscoverage['/combobox/control.js'].lineData[227]++;
        self.setValueFromAutocomplete(self._savedValue);
      }
      _$jscoverage['/combobox/control.js'].lineData[229]++;
      return true;
    }
    _$jscoverage['/combobox/control.js'].lineData[232]++;
    if (visit30_232_1(updateInputOnDownUp && S.inArray(keyCode, [KeyCode.DOWN, KeyCode.UP]))) {
      _$jscoverage['/combobox/control.js'].lineData[235]++;
      self.setValueFromAutocomplete(highlightedItem.get('textContent'));
    }
    _$jscoverage['/combobox/control.js'].lineData[240]++;
    if (visit31_240_1(visit32_240_2(keyCode === KeyCode.TAB) && highlightedItem)) {
      _$jscoverage['/combobox/control.js'].lineData[242]++;
      highlightedItem.handleClickInternal(e);
      _$jscoverage['/combobox/control.js'].lineData[244]++;
      if (visit33_244_1(self.get('multiple'))) {
        _$jscoverage['/combobox/control.js'].lineData[245]++;
        return true;
      }
    }
    _$jscoverage['/combobox/control.js'].lineData[249]++;
    return handledByMenu;
  } else {
    _$jscoverage['/combobox/control.js'].lineData[250]++;
    if (visit34_250_1(visit35_250_2(keyCode === KeyCode.DOWN) || visit36_250_3(keyCode === KeyCode.UP))) {
      _$jscoverage['/combobox/control.js'].lineData[252]++;
      var v = self.getValueForAutocomplete();
      _$jscoverage['/combobox/control.js'].lineData[253]++;
      if (visit37_253_1(v !== undefined)) {
        _$jscoverage['/combobox/control.js'].lineData[254]++;
        self.sendRequest(v);
        _$jscoverage['/combobox/control.js'].lineData[255]++;
        return true;
      }
    }
  }
  _$jscoverage['/combobox/control.js'].lineData[258]++;
  return undefined;
}, 
  validate: function(callback) {
  _$jscoverage['/combobox/control.js'].functionData[13]++;
  _$jscoverage['/combobox/control.js'].lineData[262]++;
  var self = this, validator = self.get('validator'), val = self.getValueForAutocomplete();
  _$jscoverage['/combobox/control.js'].lineData[266]++;
  if (visit38_266_1(validator)) {
    _$jscoverage['/combobox/control.js'].lineData[267]++;
    validator(val, function(error) {
  _$jscoverage['/combobox/control.js'].functionData[14]++;
  _$jscoverage['/combobox/control.js'].lineData[268]++;
  callback(error, val);
});
  } else {
    _$jscoverage['/combobox/control.js'].lineData[271]++;
    callback(false, val);
  }
}, 
  sendRequest: function(value) {
  _$jscoverage['/combobox/control.js'].functionData[15]++;
  _$jscoverage['/combobox/control.js'].lineData[280]++;
  var self = this, dataSource = self.get('dataSource');
  _$jscoverage['/combobox/control.js'].lineData[282]++;
  dataSource.fetchData(value, renderData, self);
}, 
  _onSetCollapsed: function(v) {
  _$jscoverage['/combobox/control.js'].functionData[16]++;
  _$jscoverage['/combobox/control.js'].lineData[286]++;
  var self = this, el = self.$el, menu = self.get('menu');
  _$jscoverage['/combobox/control.js'].lineData[289]++;
  if (visit39_289_1(v)) {
    _$jscoverage['/combobox/control.js'].lineData[290]++;
    menu.hide();
  } else {
    _$jscoverage['/combobox/control.js'].lineData[293]++;
    clearDismissTimer(self);
    _$jscoverage['/combobox/control.js'].lineData[294]++;
    if (visit40_294_1(!menu.get('visible'))) {
      _$jscoverage['/combobox/control.js'].lineData[295]++;
      if (visit41_295_1(self.get('matchElWidth'))) {
        _$jscoverage['/combobox/control.js'].lineData[296]++;
        menu.render();
        _$jscoverage['/combobox/control.js'].lineData[297]++;
        var menuEl = menu.get('el');
        _$jscoverage['/combobox/control.js'].lineData[298]++;
        var borderWidth = (visit42_299_1(parseInt(menuEl.css('borderLeftWidth'), 10) || 0)) + (visit43_300_1(parseInt(menuEl.css('borderRightWidth'), 10) || 0));
        _$jscoverage['/combobox/control.js'].lineData[301]++;
        menu.set('width', el[0].offsetWidth - borderWidth);
      }
      _$jscoverage['/combobox/control.js'].lineData[303]++;
      menu.show();
    }
  }
}}, {
  ATTRS: {
  input: {}, 
  value: {
  value: '', 
  sync: 0, 
  view: 1}, 
  trigger: {}, 
  placeholder: {
  view: 1}, 
  placeholderEl: {}, 
  validator: {}, 
  invalidEl: {}, 
  allowTextSelection: {
  value: true}, 
  hasTrigger: {
  value: true, 
  view: 1}, 
  menu: {
  value: {}, 
  getter: function(v) {
  _$jscoverage['/combobox/control.js'].functionData[17]++;
  _$jscoverage['/combobox/control.js'].lineData[412]++;
  if (visit44_412_1(!v.isControl)) {
    _$jscoverage['/combobox/control.js'].lineData[413]++;
    v.xclass = visit45_413_1(v.xclass || 'popupmenu');
    _$jscoverage['/combobox/control.js'].lineData[414]++;
    v = this.createComponent(v);
    _$jscoverage['/combobox/control.js'].lineData[415]++;
    this.setInternal('menu', v);
  }
  _$jscoverage['/combobox/control.js'].lineData[417]++;
  return v;
}, 
  setter: function(m) {
  _$jscoverage['/combobox/control.js'].functionData[18]++;
  _$jscoverage['/combobox/control.js'].lineData[420]++;
  if (visit46_420_1(m.isControl)) {
    _$jscoverage['/combobox/control.js'].lineData[421]++;
    m.setInternal('parent', this);
    _$jscoverage['/combobox/control.js'].lineData[422]++;
    var align = {
  node: this.$el, 
  points: ['bl', 'tl'], 
  overflow: {
  adjustX: 1, 
  adjustY: 1}};
    _$jscoverage['/combobox/control.js'].lineData[430]++;
    S.mix(m.get('align'), align, false);
  }
}}, 
  collapsed: {
  view: 1, 
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
  value: true}, 
  xrender: {
  value: ComboBoxRender}}, 
  xclass: 'combobox'});
  _$jscoverage['/combobox/control.js'].lineData[538]++;
  function getFirstEnabledItem(children) {
    _$jscoverage['/combobox/control.js'].functionData[19]++;
    _$jscoverage['/combobox/control.js'].lineData[539]++;
    for (var i = 0; visit47_539_1(i < children.length); i++) {
      _$jscoverage['/combobox/control.js'].lineData[540]++;
      if (visit48_540_1(!children[i].get('disabled'))) {
        _$jscoverage['/combobox/control.js'].lineData[541]++;
        return children[i];
      }
    }
    _$jscoverage['/combobox/control.js'].lineData[544]++;
    return null;
  }
  _$jscoverage['/combobox/control.js'].lineData[547]++;
  function onMenuFocusout() {
    _$jscoverage['/combobox/control.js'].functionData[20]++;
    _$jscoverage['/combobox/control.js'].lineData[548]++;
    var combobox = this;
    _$jscoverage['/combobox/control.js'].lineData[549]++;
    delayHide(combobox);
  }
  _$jscoverage['/combobox/control.js'].lineData[552]++;
  function onMenuFocusin() {
    _$jscoverage['/combobox/control.js'].functionData[21]++;
    _$jscoverage['/combobox/control.js'].lineData[553]++;
    var combobox = this;
    _$jscoverage['/combobox/control.js'].lineData[557]++;
    setTimeout(function() {
  _$jscoverage['/combobox/control.js'].functionData[22]++;
  _$jscoverage['/combobox/control.js'].lineData[558]++;
  clearDismissTimer(combobox);
}, 0);
  }
  _$jscoverage['/combobox/control.js'].lineData[562]++;
  function onMenuMouseOver() {
    _$jscoverage['/combobox/control.js'].functionData[23]++;
    _$jscoverage['/combobox/control.js'].lineData[563]++;
    var combobox = this;
    _$jscoverage['/combobox/control.js'].lineData[565]++;
    combobox.focus();
    _$jscoverage['/combobox/control.js'].lineData[567]++;
    clearDismissTimer(combobox);
  }
  _$jscoverage['/combobox/control.js'].lineData[570]++;
  function onMenuMouseDown() {
    _$jscoverage['/combobox/control.js'].functionData[24]++;
    _$jscoverage['/combobox/control.js'].lineData[571]++;
    var combobox = this;
    _$jscoverage['/combobox/control.js'].lineData[575]++;
    combobox.setValueFromAutocomplete(combobox.getValueForAutocomplete(), {
  force: 1});
  }
  _$jscoverage['/combobox/control.js'].lineData[580]++;
  function onMenuAfterRenderUI(e) {
    _$jscoverage['/combobox/control.js'].functionData[25]++;
    _$jscoverage['/combobox/control.js'].lineData[581]++;
    var self = this, contentEl;
    _$jscoverage['/combobox/control.js'].lineData[583]++;
    var menu = self.get('menu');
    _$jscoverage['/combobox/control.js'].lineData[584]++;
    if (visit49_584_1(!e || visit50_584_2(menu === e.target))) {
      _$jscoverage['/combobox/control.js'].lineData[585]++;
      var input = self.get('input');
      _$jscoverage['/combobox/control.js'].lineData[586]++;
      var el = menu.get('el');
      _$jscoverage['/combobox/control.js'].lineData[587]++;
      contentEl = menu.get('contentEl');
      _$jscoverage['/combobox/control.js'].lineData[588]++;
      input.attr('aria-owns', el.attr('id'));
      _$jscoverage['/combobox/control.js'].lineData[590]++;
      el.on('focusout', onMenuFocusout, self);
      _$jscoverage['/combobox/control.js'].lineData[591]++;
      el.on('focusin', onMenuFocusin, self);
      _$jscoverage['/combobox/control.js'].lineData[592]++;
      contentEl.on('mouseover', onMenuMouseOver, self);
      _$jscoverage['/combobox/control.js'].lineData[595]++;
      contentEl.on('mousedown', onMenuMouseDown, self);
    }
  }
  _$jscoverage['/combobox/control.js'].lineData[599]++;
  function onMenuItemClick(e) {
    _$jscoverage['/combobox/control.js'].functionData[26]++;
    _$jscoverage['/combobox/control.js'].lineData[600]++;
    var item = e.target, self = this, textContent;
    _$jscoverage['/combobox/control.js'].lineData[603]++;
    if (visit51_603_1(item.isMenuItem)) {
      _$jscoverage['/combobox/control.js'].lineData[604]++;
      textContent = item.get('textContent');
      _$jscoverage['/combobox/control.js'].lineData[605]++;
      self.setValueFromAutocomplete(textContent);
      _$jscoverage['/combobox/control.js'].lineData[606]++;
      self._savedValue = textContent;
      _$jscoverage['/combobox/control.js'].lineData[607]++;
      self.set('collapsed', true);
    }
  }
  _$jscoverage['/combobox/control.js'].lineData[611]++;
  function setInvalid(self, error) {
    _$jscoverage['/combobox/control.js'].functionData[27]++;
    _$jscoverage['/combobox/control.js'].lineData[612]++;
    var $el = self.$el, cls = self.view.getBaseCssClasses('invalid'), invalidEl = self.get('invalidEl');
    _$jscoverage['/combobox/control.js'].lineData[615]++;
    if (visit52_615_1(error)) {
      _$jscoverage['/combobox/control.js'].lineData[616]++;
      $el.addClass(cls);
      _$jscoverage['/combobox/control.js'].lineData[617]++;
      invalidEl.attr('title', error);
      _$jscoverage['/combobox/control.js'].lineData[618]++;
      invalidEl.show();
    } else {
      _$jscoverage['/combobox/control.js'].lineData[620]++;
      $el.removeClass(cls);
      _$jscoverage['/combobox/control.js'].lineData[621]++;
      invalidEl.hide();
    }
  }
  _$jscoverage['/combobox/control.js'].lineData[625]++;
  function delayHide(self) {
    _$jscoverage['/combobox/control.js'].functionData[28]++;
    _$jscoverage['/combobox/control.js'].lineData[626]++;
    if (visit53_626_1(self._focusoutDismissTimer)) {
      _$jscoverage['/combobox/control.js'].lineData[627]++;
      return;
    }
    _$jscoverage['/combobox/control.js'].lineData[629]++;
    self._focusoutDismissTimer = setTimeout(function() {
  _$jscoverage['/combobox/control.js'].functionData[29]++;
  _$jscoverage['/combobox/control.js'].lineData[631]++;
  if (visit54_631_1(self._focusoutDismissTimer)) {
    _$jscoverage['/combobox/control.js'].lineData[632]++;
    self.set('collapsed', true);
  }
}, 50);
  }
  _$jscoverage['/combobox/control.js'].lineData[639]++;
  function clearDismissTimer(self) {
    _$jscoverage['/combobox/control.js'].functionData[30]++;
    _$jscoverage['/combobox/control.js'].lineData[640]++;
    var t = self._focusoutDismissTimer;
    _$jscoverage['/combobox/control.js'].lineData[641]++;
    if (visit55_641_1(t)) {
      _$jscoverage['/combobox/control.js'].lineData[642]++;
      clearTimeout(t);
      _$jscoverage['/combobox/control.js'].lineData[643]++;
      self._focusoutDismissTimer = null;
    }
  }
  _$jscoverage['/combobox/control.js'].lineData[647]++;
  function onValueChange(e) {
    _$jscoverage['/combobox/control.js'].functionData[31]++;
    _$jscoverage['/combobox/control.js'].lineData[648]++;
    this.set('value', e.target.value, {
  data: {
  causedByInputEvent: 1}});
  }
  _$jscoverage['/combobox/control.js'].lineData[655]++;
  function renderData(data) {
    _$jscoverage['/combobox/control.js'].functionData[32]++;
    _$jscoverage['/combobox/control.js'].lineData[656]++;
    var self = this, v, children = [], val, matchVal, highlightedItem, i, menu = self.get('menu');
    _$jscoverage['/combobox/control.js'].lineData[665]++;
    data = self.normalizeData(data);
    _$jscoverage['/combobox/control.js'].lineData[667]++;
    menu.removeChildren(true);
    _$jscoverage['/combobox/control.js'].lineData[669]++;
    if ((highlightedItem = menu.get('highlightedItem'))) {
      _$jscoverage['/combobox/control.js'].lineData[670]++;
      highlightedItem.set('highlighted', false);
    }
    _$jscoverage['/combobox/control.js'].lineData[673]++;
    if (visit56_673_1(data && data.length)) {
      _$jscoverage['/combobox/control.js'].lineData[674]++;
      for (i = 0; visit57_674_1(i < data.length); i++) {
        _$jscoverage['/combobox/control.js'].lineData[675]++;
        v = data[i];
        _$jscoverage['/combobox/control.js'].lineData[676]++;
        menu.addChild(v);
      }
      _$jscoverage['/combobox/control.js'].lineData[679]++;
      children = menu.get('children');
      _$jscoverage['/combobox/control.js'].lineData[682]++;
      val = self.getValueForAutocomplete();
      _$jscoverage['/combobox/control.js'].lineData[684]++;
      if (visit58_684_1(self.get('highlightMatchItem'))) {
        _$jscoverage['/combobox/control.js'].lineData[685]++;
        for (i = 0; visit59_685_1(i < children.length); i++) {
          _$jscoverage['/combobox/control.js'].lineData[686]++;
          if (visit60_686_1(children[i].get('textContent') === val)) {
            _$jscoverage['/combobox/control.js'].lineData[687]++;
            children[i].set('highlighted', true);
            _$jscoverage['/combobox/control.js'].lineData[688]++;
            matchVal = true;
            _$jscoverage['/combobox/control.js'].lineData[689]++;
            break;
          }
        }
      }
      _$jscoverage['/combobox/control.js'].lineData[695]++;
      if (visit61_695_1(!matchVal && (self.get('autoHighlightFirst')))) {
        _$jscoverage['/combobox/control.js'].lineData[696]++;
        for (i = 0; visit62_696_1(i < children.length); i++) {
          _$jscoverage['/combobox/control.js'].lineData[697]++;
          if (visit63_697_1(!children[i].get('disabled'))) {
            _$jscoverage['/combobox/control.js'].lineData[698]++;
            children[i].set('highlighted', true);
            _$jscoverage['/combobox/control.js'].lineData[699]++;
            break;
          }
        }
      }
      _$jscoverage['/combobox/control.js'].lineData[703]++;
      self.set('collapsed', false);
      _$jscoverage['/combobox/control.js'].lineData[705]++;
      self.fire('afterRenderData');
    } else {
      _$jscoverage['/combobox/control.js'].lineData[707]++;
      self.set('collapsed', true);
    }
  }
  _$jscoverage['/combobox/control.js'].lineData[713]++;
  return ComboBox;
});
