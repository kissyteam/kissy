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
  _$jscoverage['/combobox/control.js'].lineData[121] = 0;
  _$jscoverage['/combobox/control.js'].lineData[122] = 0;
  _$jscoverage['/combobox/control.js'].lineData[124] = 0;
  _$jscoverage['/combobox/control.js'].lineData[125] = 0;
  _$jscoverage['/combobox/control.js'].lineData[126] = 0;
  _$jscoverage['/combobox/control.js'].lineData[128] = 0;
  _$jscoverage['/combobox/control.js'].lineData[129] = 0;
  _$jscoverage['/combobox/control.js'].lineData[131] = 0;
  _$jscoverage['/combobox/control.js'].lineData[136] = 0;
  _$jscoverage['/combobox/control.js'].lineData[138] = 0;
  _$jscoverage['/combobox/control.js'].lineData[139] = 0;
  _$jscoverage['/combobox/control.js'].lineData[140] = 0;
  _$jscoverage['/combobox/control.js'].lineData[142] = 0;
  _$jscoverage['/combobox/control.js'].lineData[143] = 0;
  _$jscoverage['/combobox/control.js'].lineData[148] = 0;
  _$jscoverage['/combobox/control.js'].lineData[150] = 0;
  _$jscoverage['/combobox/control.js'].lineData[151] = 0;
  _$jscoverage['/combobox/control.js'].lineData[152] = 0;
  _$jscoverage['/combobox/control.js'].lineData[153] = 0;
  _$jscoverage['/combobox/control.js'].lineData[154] = 0;
  _$jscoverage['/combobox/control.js'].lineData[155] = 0;
  _$jscoverage['/combobox/control.js'].lineData[156] = 0;
  _$jscoverage['/combobox/control.js'].lineData[159] = 0;
  _$jscoverage['/combobox/control.js'].lineData[163] = 0;
  _$jscoverage['/combobox/control.js'].lineData[164] = 0;
  _$jscoverage['/combobox/control.js'].lineData[169] = 0;
  _$jscoverage['/combobox/control.js'].lineData[172] = 0;
  _$jscoverage['/combobox/control.js'].lineData[173] = 0;
  _$jscoverage['/combobox/control.js'].lineData[174] = 0;
  _$jscoverage['/combobox/control.js'].lineData[175] = 0;
  _$jscoverage['/combobox/control.js'].lineData[176] = 0;
  _$jscoverage['/combobox/control.js'].lineData[178] = 0;
  _$jscoverage['/combobox/control.js'].lineData[179] = 0;
  _$jscoverage['/combobox/control.js'].lineData[182] = 0;
  _$jscoverage['/combobox/control.js'].lineData[184] = 0;
  _$jscoverage['/combobox/control.js'].lineData[189] = 0;
  _$jscoverage['/combobox/control.js'].lineData[197] = 0;
  _$jscoverage['/combobox/control.js'].lineData[198] = 0;
  _$jscoverage['/combobox/control.js'].lineData[200] = 0;
  _$jscoverage['/combobox/control.js'].lineData[202] = 0;
  _$jscoverage['/combobox/control.js'].lineData[206] = 0;
  _$jscoverage['/combobox/control.js'].lineData[207] = 0;
  _$jscoverage['/combobox/control.js'].lineData[208] = 0;
  _$jscoverage['/combobox/control.js'].lineData[213] = 0;
  _$jscoverage['/combobox/control.js'].lineData[214] = 0;
  _$jscoverage['/combobox/control.js'].lineData[215] = 0;
  _$jscoverage['/combobox/control.js'].lineData[219] = 0;
  _$jscoverage['/combobox/control.js'].lineData[221] = 0;
  _$jscoverage['/combobox/control.js'].lineData[224] = 0;
  _$jscoverage['/combobox/control.js'].lineData[225] = 0;
  _$jscoverage['/combobox/control.js'].lineData[226] = 0;
  _$jscoverage['/combobox/control.js'].lineData[230] = 0;
  _$jscoverage['/combobox/control.js'].lineData[232] = 0;
  _$jscoverage['/combobox/control.js'].lineData[235] = 0;
  _$jscoverage['/combobox/control.js'].lineData[238] = 0;
  _$jscoverage['/combobox/control.js'].lineData[243] = 0;
  _$jscoverage['/combobox/control.js'].lineData[245] = 0;
  _$jscoverage['/combobox/control.js'].lineData[247] = 0;
  _$jscoverage['/combobox/control.js'].lineData[248] = 0;
  _$jscoverage['/combobox/control.js'].lineData[252] = 0;
  _$jscoverage['/combobox/control.js'].lineData[253] = 0;
  _$jscoverage['/combobox/control.js'].lineData[255] = 0;
  _$jscoverage['/combobox/control.js'].lineData[256] = 0;
  _$jscoverage['/combobox/control.js'].lineData[257] = 0;
  _$jscoverage['/combobox/control.js'].lineData[258] = 0;
  _$jscoverage['/combobox/control.js'].lineData[261] = 0;
  _$jscoverage['/combobox/control.js'].lineData[265] = 0;
  _$jscoverage['/combobox/control.js'].lineData[269] = 0;
  _$jscoverage['/combobox/control.js'].lineData[270] = 0;
  _$jscoverage['/combobox/control.js'].lineData[271] = 0;
  _$jscoverage['/combobox/control.js'].lineData[274] = 0;
  _$jscoverage['/combobox/control.js'].lineData[283] = 0;
  _$jscoverage['/combobox/control.js'].lineData[285] = 0;
  _$jscoverage['/combobox/control.js'].lineData[289] = 0;
  _$jscoverage['/combobox/control.js'].lineData[293] = 0;
  _$jscoverage['/combobox/control.js'].lineData[296] = 0;
  _$jscoverage['/combobox/control.js'].lineData[297] = 0;
  _$jscoverage['/combobox/control.js'].lineData[300] = 0;
  _$jscoverage['/combobox/control.js'].lineData[301] = 0;
  _$jscoverage['/combobox/control.js'].lineData[302] = 0;
  _$jscoverage['/combobox/control.js'].lineData[303] = 0;
  _$jscoverage['/combobox/control.js'].lineData[304] = 0;
  _$jscoverage['/combobox/control.js'].lineData[305] = 0;
  _$jscoverage['/combobox/control.js'].lineData[308] = 0;
  _$jscoverage['/combobox/control.js'].lineData[310] = 0;
  _$jscoverage['/combobox/control.js'].lineData[313] = 0;
  _$jscoverage['/combobox/control.js'].lineData[317] = 0;
  _$jscoverage['/combobox/control.js'].lineData[318] = 0;
  _$jscoverage['/combobox/control.js'].lineData[336] = 0;
  _$jscoverage['/combobox/control.js'].lineData[352] = 0;
  _$jscoverage['/combobox/control.js'].lineData[362] = 0;
  _$jscoverage['/combobox/control.js'].lineData[377] = 0;
  _$jscoverage['/combobox/control.js'].lineData[378] = 0;
  _$jscoverage['/combobox/control.js'].lineData[388] = 0;
  _$jscoverage['/combobox/control.js'].lineData[409] = 0;
  _$jscoverage['/combobox/control.js'].lineData[447] = 0;
  _$jscoverage['/combobox/control.js'].lineData[448] = 0;
  _$jscoverage['/combobox/control.js'].lineData[449] = 0;
  _$jscoverage['/combobox/control.js'].lineData[450] = 0;
  _$jscoverage['/combobox/control.js'].lineData[452] = 0;
  _$jscoverage['/combobox/control.js'].lineData[455] = 0;
  _$jscoverage['/combobox/control.js'].lineData[456] = 0;
  _$jscoverage['/combobox/control.js'].lineData[457] = 0;
  _$jscoverage['/combobox/control.js'].lineData[465] = 0;
  _$jscoverage['/combobox/control.js'].lineData[569] = 0;
  _$jscoverage['/combobox/control.js'].lineData[570] = 0;
  _$jscoverage['/combobox/control.js'].lineData[571] = 0;
  _$jscoverage['/combobox/control.js'].lineData[572] = 0;
  _$jscoverage['/combobox/control.js'].lineData[575] = 0;
  _$jscoverage['/combobox/control.js'].lineData[578] = 0;
  _$jscoverage['/combobox/control.js'].lineData[579] = 0;
  _$jscoverage['/combobox/control.js'].lineData[582] = 0;
  _$jscoverage['/combobox/control.js'].lineData[583] = 0;
  _$jscoverage['/combobox/control.js'].lineData[587] = 0;
  _$jscoverage['/combobox/control.js'].lineData[588] = 0;
  _$jscoverage['/combobox/control.js'].lineData[592] = 0;
  _$jscoverage['/combobox/control.js'].lineData[593] = 0;
  _$jscoverage['/combobox/control.js'].lineData[595] = 0;
  _$jscoverage['/combobox/control.js'].lineData[597] = 0;
  _$jscoverage['/combobox/control.js'].lineData[600] = 0;
  _$jscoverage['/combobox/control.js'].lineData[601] = 0;
  _$jscoverage['/combobox/control.js'].lineData[605] = 0;
  _$jscoverage['/combobox/control.js'].lineData[610] = 0;
  _$jscoverage['/combobox/control.js'].lineData[611] = 0;
  _$jscoverage['/combobox/control.js'].lineData[613] = 0;
  _$jscoverage['/combobox/control.js'].lineData[614] = 0;
  _$jscoverage['/combobox/control.js'].lineData[615] = 0;
  _$jscoverage['/combobox/control.js'].lineData[616] = 0;
  _$jscoverage['/combobox/control.js'].lineData[617] = 0;
  _$jscoverage['/combobox/control.js'].lineData[618] = 0;
  _$jscoverage['/combobox/control.js'].lineData[620] = 0;
  _$jscoverage['/combobox/control.js'].lineData[621] = 0;
  _$jscoverage['/combobox/control.js'].lineData[622] = 0;
  _$jscoverage['/combobox/control.js'].lineData[625] = 0;
  _$jscoverage['/combobox/control.js'].lineData[626] = 0;
  _$jscoverage['/combobox/control.js'].lineData[627] = 0;
  _$jscoverage['/combobox/control.js'].lineData[632] = 0;
  _$jscoverage['/combobox/control.js'].lineData[633] = 0;
  _$jscoverage['/combobox/control.js'].lineData[634] = 0;
  _$jscoverage['/combobox/control.js'].lineData[635] = 0;
  _$jscoverage['/combobox/control.js'].lineData[636] = 0;
  _$jscoverage['/combobox/control.js'].lineData[637] = 0;
  _$jscoverage['/combobox/control.js'].lineData[638] = 0;
  _$jscoverage['/combobox/control.js'].lineData[640] = 0;
  _$jscoverage['/combobox/control.js'].lineData[644] = 0;
  _$jscoverage['/combobox/control.js'].lineData[645] = 0;
  _$jscoverage['/combobox/control.js'].lineData[648] = 0;
  _$jscoverage['/combobox/control.js'].lineData[649] = 0;
  _$jscoverage['/combobox/control.js'].lineData[650] = 0;
  _$jscoverage['/combobox/control.js'].lineData[651] = 0;
  _$jscoverage['/combobox/control.js'].lineData[652] = 0;
  _$jscoverage['/combobox/control.js'].lineData[656] = 0;
  _$jscoverage['/combobox/control.js'].lineData[657] = 0;
  _$jscoverage['/combobox/control.js'].lineData[660] = 0;
  _$jscoverage['/combobox/control.js'].lineData[661] = 0;
  _$jscoverage['/combobox/control.js'].lineData[662] = 0;
  _$jscoverage['/combobox/control.js'].lineData[663] = 0;
  _$jscoverage['/combobox/control.js'].lineData[665] = 0;
  _$jscoverage['/combobox/control.js'].lineData[666] = 0;
  _$jscoverage['/combobox/control.js'].lineData[670] = 0;
  _$jscoverage['/combobox/control.js'].lineData[671] = 0;
  _$jscoverage['/combobox/control.js'].lineData[672] = 0;
  _$jscoverage['/combobox/control.js'].lineData[674] = 0;
  _$jscoverage['/combobox/control.js'].lineData[676] = 0;
  _$jscoverage['/combobox/control.js'].lineData[677] = 0;
  _$jscoverage['/combobox/control.js'].lineData[684] = 0;
  _$jscoverage['/combobox/control.js'].lineData[685] = 0;
  _$jscoverage['/combobox/control.js'].lineData[686] = 0;
  _$jscoverage['/combobox/control.js'].lineData[687] = 0;
  _$jscoverage['/combobox/control.js'].lineData[688] = 0;
  _$jscoverage['/combobox/control.js'].lineData[692] = 0;
  _$jscoverage['/combobox/control.js'].lineData[693] = 0;
  _$jscoverage['/combobox/control.js'].lineData[700] = 0;
  _$jscoverage['/combobox/control.js'].lineData[701] = 0;
  _$jscoverage['/combobox/control.js'].lineData[710] = 0;
  _$jscoverage['/combobox/control.js'].lineData[712] = 0;
  _$jscoverage['/combobox/control.js'].lineData[714] = 0;
  _$jscoverage['/combobox/control.js'].lineData[715] = 0;
  _$jscoverage['/combobox/control.js'].lineData[718] = 0;
  _$jscoverage['/combobox/control.js'].lineData[719] = 0;
  _$jscoverage['/combobox/control.js'].lineData[720] = 0;
  _$jscoverage['/combobox/control.js'].lineData[721] = 0;
  _$jscoverage['/combobox/control.js'].lineData[724] = 0;
  _$jscoverage['/combobox/control.js'].lineData[727] = 0;
  _$jscoverage['/combobox/control.js'].lineData[729] = 0;
  _$jscoverage['/combobox/control.js'].lineData[730] = 0;
  _$jscoverage['/combobox/control.js'].lineData[731] = 0;
  _$jscoverage['/combobox/control.js'].lineData[732] = 0;
  _$jscoverage['/combobox/control.js'].lineData[733] = 0;
  _$jscoverage['/combobox/control.js'].lineData[734] = 0;
  _$jscoverage['/combobox/control.js'].lineData[740] = 0;
  _$jscoverage['/combobox/control.js'].lineData[741] = 0;
  _$jscoverage['/combobox/control.js'].lineData[742] = 0;
  _$jscoverage['/combobox/control.js'].lineData[743] = 0;
  _$jscoverage['/combobox/control.js'].lineData[744] = 0;
  _$jscoverage['/combobox/control.js'].lineData[748] = 0;
  _$jscoverage['/combobox/control.js'].lineData[750] = 0;
  _$jscoverage['/combobox/control.js'].lineData[752] = 0;
  _$jscoverage['/combobox/control.js'].lineData[758] = 0;
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
  _$jscoverage['/combobox/control.js'].branchData['121'] = [];
  _$jscoverage['/combobox/control.js'].branchData['121'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['124'] = [];
  _$jscoverage['/combobox/control.js'].branchData['124'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['139'] = [];
  _$jscoverage['/combobox/control.js'].branchData['139'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['152'] = [];
  _$jscoverage['/combobox/control.js'].branchData['152'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['154'] = [];
  _$jscoverage['/combobox/control.js'].branchData['154'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['155'] = [];
  _$jscoverage['/combobox/control.js'].branchData['155'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['155'][2] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['163'] = [];
  _$jscoverage['/combobox/control.js'].branchData['163'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['175'] = [];
  _$jscoverage['/combobox/control.js'].branchData['175'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['175'][2] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['175'][3] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['176'] = [];
  _$jscoverage['/combobox/control.js'].branchData['176'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['200'] = [];
  _$jscoverage['/combobox/control.js'].branchData['200'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['206'] = [];
  _$jscoverage['/combobox/control.js'].branchData['206'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['208'] = [];
  _$jscoverage['/combobox/control.js'].branchData['208'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['208'][2] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['208'][3] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['209'] = [];
  _$jscoverage['/combobox/control.js'].branchData['209'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['210'] = [];
  _$jscoverage['/combobox/control.js'].branchData['210'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['210'][2] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['211'] = [];
  _$jscoverage['/combobox/control.js'].branchData['211'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['224'] = [];
  _$jscoverage['/combobox/control.js'].branchData['224'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['226'] = [];
  _$jscoverage['/combobox/control.js'].branchData['226'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['235'] = [];
  _$jscoverage['/combobox/control.js'].branchData['235'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['243'] = [];
  _$jscoverage['/combobox/control.js'].branchData['243'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['243'][2] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['247'] = [];
  _$jscoverage['/combobox/control.js'].branchData['247'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['253'] = [];
  _$jscoverage['/combobox/control.js'].branchData['253'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['253'][2] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['253'][3] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['256'] = [];
  _$jscoverage['/combobox/control.js'].branchData['256'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['269'] = [];
  _$jscoverage['/combobox/control.js'].branchData['269'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['296'] = [];
  _$jscoverage['/combobox/control.js'].branchData['296'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['301'] = [];
  _$jscoverage['/combobox/control.js'].branchData['301'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['302'] = [];
  _$jscoverage['/combobox/control.js'].branchData['302'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['306'] = [];
  _$jscoverage['/combobox/control.js'].branchData['306'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['307'] = [];
  _$jscoverage['/combobox/control.js'].branchData['307'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['378'] = [];
  _$jscoverage['/combobox/control.js'].branchData['378'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['447'] = [];
  _$jscoverage['/combobox/control.js'].branchData['447'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['448'] = [];
  _$jscoverage['/combobox/control.js'].branchData['448'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['455'] = [];
  _$jscoverage['/combobox/control.js'].branchData['455'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['570'] = [];
  _$jscoverage['/combobox/control.js'].branchData['570'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['571'] = [];
  _$jscoverage['/combobox/control.js'].branchData['571'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['614'] = [];
  _$jscoverage['/combobox/control.js'].branchData['614'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['614'][2] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['626'] = [];
  _$jscoverage['/combobox/control.js'].branchData['626'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['635'] = [];
  _$jscoverage['/combobox/control.js'].branchData['635'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['638'] = [];
  _$jscoverage['/combobox/control.js'].branchData['638'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['639'] = [];
  _$jscoverage['/combobox/control.js'].branchData['639'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['648'] = [];
  _$jscoverage['/combobox/control.js'].branchData['648'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['660'] = [];
  _$jscoverage['/combobox/control.js'].branchData['660'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['671'] = [];
  _$jscoverage['/combobox/control.js'].branchData['671'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['676'] = [];
  _$jscoverage['/combobox/control.js'].branchData['676'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['686'] = [];
  _$jscoverage['/combobox/control.js'].branchData['686'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['718'] = [];
  _$jscoverage['/combobox/control.js'].branchData['718'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['719'] = [];
  _$jscoverage['/combobox/control.js'].branchData['719'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['729'] = [];
  _$jscoverage['/combobox/control.js'].branchData['729'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['730'] = [];
  _$jscoverage['/combobox/control.js'].branchData['730'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['731'] = [];
  _$jscoverage['/combobox/control.js'].branchData['731'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['740'] = [];
  _$jscoverage['/combobox/control.js'].branchData['740'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['741'] = [];
  _$jscoverage['/combobox/control.js'].branchData['741'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['742'] = [];
  _$jscoverage['/combobox/control.js'].branchData['742'][1] = new BranchData();
}
_$jscoverage['/combobox/control.js'].branchData['742'][1].init(26, 28, '!children[i].get(\'disabled\')');
function visit74_742_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['742'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['741'][1].init(30, 19, 'i < children.length');
function visit73_741_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['741'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['740'][1].init(767, 43, '!matchVal && self.get(\'autoHighlightFirst\')');
function visit72_740_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['740'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['731'][1].init(26, 38, 'children[i].get(\'textContent\') === val');
function visit71_731_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['731'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['730'][1].init(30, 19, 'i < children.length');
function visit70_730_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['730'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['729'][1].init(317, 30, 'self.get(\'highlightMatchItem\')');
function visit69_729_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['729'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['719'][1].init(26, 15, 'i < data.length');
function visit68_719_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['719'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['718'][1].init(426, 19, 'data && data.length');
function visit67_718_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['718'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['686'][1].init(59, 1, 't');
function visit66_686_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['686'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['676'][1].init(50, 26, 'self._focusoutDismissTimer');
function visit65_676_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['676'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['671'][1].init(14, 26, 'self._focusoutDismissTimer');
function visit64_671_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['671'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['660'][1].init(145, 5, 'error');
function visit63_660_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['660'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['648'][1].init(96, 15, 'item.isMenuItem');
function visit62_648_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['648'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['639'][1].init(69, 49, 'parseInt(menuEl.css(\'borderRightWidth\'), 10) || 0');
function visit61_639_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['639'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['638'][1].init(113, 48, 'parseInt(menuEl.css(\'borderLeftWidth\'), 10) || 0');
function visit60_638_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['638'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['635'][1].init(78, 19, 'menu.get(\'visible\')');
function visit59_635_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['635'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['626'][1].init(571, 24, 'self.get(\'matchElWidth\')');
function visit58_626_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['626'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['614'][2].init(108, 17, 'menu === e.target');
function visit57_614_2(result) {
  _$jscoverage['/combobox/control.js'].branchData['614'][2].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['614'][1].init(102, 23, '!e || menu === e.target');
function visit56_614_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['614'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['571'][1].init(18, 28, '!children[i].get(\'disabled\')');
function visit55_571_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['571'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['570'][1].init(26, 19, 'i < children.length');
function visit54_570_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['570'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['455'][1].init(26, 11, 'm.isControl');
function visit53_455_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['455'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['448'][1].init(37, 23, 'v.xclass || \'popupmenu\'');
function visit52_448_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['448'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['447'][1].init(26, 12, '!v.isControl');
function visit51_447_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['447'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['378'][1].init(95, 33, 'placeHolder && placeHolder.html()');
function visit50_378_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['378'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['307'][1].init(81, 49, 'parseInt(menuEl.css(\'borderRightWidth\'), 10) || 0');
function visit49_307_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['307'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['306'][1].init(43, 48, 'parseInt(menuEl.css(\'borderLeftWidth\'), 10) || 0');
function visit48_306_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['306'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['302'][1].init(26, 24, 'self.get(\'matchElWidth\')');
function visit47_302_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['302'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['301'][1].init(107, 20, '!menu.get(\'visible\')');
function visit46_301_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['301'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['296'][1].init(122, 1, 'v');
function visit45_296_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['296'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['269'][1].init(149, 9, 'validator');
function visit44_269_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['269'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['256'][1].init(125, 15, 'v !== undefined');
function visit43_256_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['256'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['253'][3].init(2752, 22, 'keyCode === KeyCode.UP');
function visit42_253_3(result) {
  _$jscoverage['/combobox/control.js'].branchData['253'][3].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['253'][2].init(2724, 24, 'keyCode === KeyCode.DOWN');
function visit41_253_2(result) {
  _$jscoverage['/combobox/control.js'].branchData['253'][2].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['253'][1].init(2724, 50, 'keyCode === KeyCode.DOWN || keyCode === KeyCode.UP');
function visit40_253_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['253'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['247'][1].init(200, 20, 'self.get(\'multiple\')');
function visit39_247_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['247'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['243'][2].init(1919, 23, 'keyCode === KeyCode.TAB');
function visit38_243_2(result) {
  _$jscoverage['/combobox/control.js'].branchData['243'][2].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['243'][1].init(1919, 42, 'keyCode === KeyCode.TAB && highlightedItem');
function visit37_243_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['243'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['235'][1].init(1519, 90, 'updateInputOnDownUp && S.inArray(keyCode, [KeyCode.DOWN, KeyCode.UP])');
function visit36_235_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['235'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['226'][1].init(76, 19, 'updateInputOnDownUp');
function visit35_226_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['226'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['224'][1].init(1042, 23, 'keyCode === KeyCode.ESC');
function visit34_224_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['224'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['211'][1].init(50, 53, 'highlightedItem === getFirstEnabledItem(menuChildren)');
function visit33_211_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['211'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['210'][2].init(244, 22, 'keyCode === KeyCode.UP');
function visit32_210_2(result) {
  _$jscoverage['/combobox/control.js'].branchData['210'][2].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['210'][1].init(153, 104, 'keyCode === KeyCode.UP && highlightedItem === getFirstEnabledItem(menuChildren)');
function visit31_210_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['210'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['209'][1].init(52, 72, 'highlightedItem === getFirstEnabledItem(menuChildren.concat().reverse())');
function visit30_209_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['209'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['208'][3].init(88, 24, 'keyCode === KeyCode.DOWN');
function visit29_208_3(result) {
  _$jscoverage['/combobox/control.js'].branchData['208'][3].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['208'][2].init(88, 125, 'keyCode === KeyCode.DOWN && highlightedItem === getFirstEnabledItem(menuChildren.concat().reverse())');
function visit28_208_2(result) {
  _$jscoverage['/combobox/control.js'].branchData['208'][2].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['208'][1].init(88, 258, 'keyCode === KeyCode.DOWN && highlightedItem === getFirstEnabledItem(menuChildren.concat().reverse()) || keyCode === KeyCode.UP && highlightedItem === getFirstEnabledItem(menuChildren)');
function visit27_208_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['208'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['206'][1].init(233, 38, 'updateInputOnDownUp && highlightedItem');
function visit26_206_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['206'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['200'][1].init(368, 19, 'menu.get(\'visible\')');
function visit25_200_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['200'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['176'][1].init(22, 21, 'self.get(\'collapsed\')');
function visit24_176_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['176'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['175'][3].init(219, 21, 'trigger[0] === target');
function visit23_175_3(result) {
  _$jscoverage['/combobox/control.js'].branchData['175'][3].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['175'][2].init(219, 49, 'trigger[0] === target || trigger.contains(target)');
function visit22_175_2(result) {
  _$jscoverage['/combobox/control.js'].branchData['175'][2].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['175'][1].init(207, 62, 'trigger && (trigger[0] === target || trigger.contains(target))');
function visit21_175_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['175'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['163'][1].init(605, 35, 'placeholderEl && !self.get(\'value\')');
function visit20_163_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['163'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['155'][2].init(55, 25, 'val === self.get(\'value\')');
function visit19_155_2(result) {
  _$jscoverage['/combobox/control.js'].branchData['155'][2].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['155'][1].init(30, 51, '!self.get(\'focused\') && (val === self.get(\'value\'))');
function visit18_155_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['155'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['154'][1].init(26, 5, 'error');
function visit17_154_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['154'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['152'][1].init(170, 21, 'self.get(\'invalidEl\')');
function visit16_152_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['152'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['139'][1].init(118, 21, 'self.get(\'invalidEl\')');
function visit15_139_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['139'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['124'][1].init(127, 19, 'value === undefined');
function visit14_124_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['124'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['121'][1].init(130, 20, 'e.causedByInputEvent');
function visit13_121_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['121'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['85'][1].init(337, 15, 'i < data.length');
function visit12_85_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['85'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['79'][1].init(87, 18, 'self.get(\'format\')');
function visit11_79_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['79'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['77'][1].init(84, 19, 'data && data.length');
function visit10_77_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['77'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['56'][1].init(520, 20, 'menu.get(\'rendered\')');
function visit9_56_1(result) {
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
  if (visit9_56_1(menu.get('rendered'))) {
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
  if (visit10_77_1(data && data.length)) {
    _$jscoverage['/combobox/control.js'].lineData[78]++;
    data = data.slice(0, self.get('maxItemCount'));
    _$jscoverage['/combobox/control.js'].lineData[79]++;
    if (visit11_79_1(self.get('format'))) {
      _$jscoverage['/combobox/control.js'].lineData[80]++;
      contents = self.get('format').call(self, self.getCurrentValue(), data);
    } else {
      _$jscoverage['/combobox/control.js'].lineData[83]++;
      contents = [];
    }
    _$jscoverage['/combobox/control.js'].lineData[85]++;
    for (i = 0; visit12_85_1(i < data.length); i++) {
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
  var self = this, value;
  _$jscoverage['/combobox/control.js'].lineData[121]++;
  if (visit13_121_1(e.causedByInputEvent)) {
    _$jscoverage['/combobox/control.js'].lineData[122]++;
    value = self.getCurrentValue();
    _$jscoverage['/combobox/control.js'].lineData[124]++;
    if (visit14_124_1(value === undefined)) {
      _$jscoverage['/combobox/control.js'].lineData[125]++;
      self.set('collapsed', true);
      _$jscoverage['/combobox/control.js'].lineData[126]++;
      return;
    }
    _$jscoverage['/combobox/control.js'].lineData[128]++;
    self._savedValue = value;
    _$jscoverage['/combobox/control.js'].lineData[129]++;
    self.sendRequest(value);
  } else {
    _$jscoverage['/combobox/control.js'].lineData[131]++;
    self.get('input').val(v);
  }
}, 
  handleFocusInternal: function() {
  _$jscoverage['/combobox/control.js'].functionData[8]++;
  _$jscoverage['/combobox/control.js'].lineData[136]++;
  var self = this, placeholderEl;
  _$jscoverage['/combobox/control.js'].lineData[138]++;
  clearDismissTimer(self);
  _$jscoverage['/combobox/control.js'].lineData[139]++;
  if (visit15_139_1(self.get('invalidEl'))) {
    _$jscoverage['/combobox/control.js'].lineData[140]++;
    setInvalid(self, false);
  }
  _$jscoverage['/combobox/control.js'].lineData[142]++;
  if ((placeholderEl = self.get('placeholderEl'))) {
    _$jscoverage['/combobox/control.js'].lineData[143]++;
    placeholderEl.hide();
  }
}, 
  handleBlurInternal: function(e) {
  _$jscoverage['/combobox/control.js'].functionData[9]++;
  _$jscoverage['/combobox/control.js'].lineData[148]++;
  var self = this, placeholderEl = self.get('placeholderEl');
  _$jscoverage['/combobox/control.js'].lineData[150]++;
  self.callSuper(e);
  _$jscoverage['/combobox/control.js'].lineData[151]++;
  delayHide(self);
  _$jscoverage['/combobox/control.js'].lineData[152]++;
  if (visit16_152_1(self.get('invalidEl'))) {
    _$jscoverage['/combobox/control.js'].lineData[153]++;
    self.validate(function(error, val) {
  _$jscoverage['/combobox/control.js'].functionData[10]++;
  _$jscoverage['/combobox/control.js'].lineData[154]++;
  if (visit17_154_1(error)) {
    _$jscoverage['/combobox/control.js'].lineData[155]++;
    if (visit18_155_1(!self.get('focused') && (visit19_155_2(val === self.get('value'))))) {
      _$jscoverage['/combobox/control.js'].lineData[156]++;
      setInvalid(self, error);
    }
  } else {
    _$jscoverage['/combobox/control.js'].lineData[159]++;
    setInvalid(self, false);
  }
});
  }
  _$jscoverage['/combobox/control.js'].lineData[163]++;
  if (visit20_163_1(placeholderEl && !self.get('value'))) {
    _$jscoverage['/combobox/control.js'].lineData[164]++;
    placeholderEl.show();
  }
}, 
  handleMouseDownInternal: function(e) {
  _$jscoverage['/combobox/control.js'].functionData[11]++;
  _$jscoverage['/combobox/control.js'].lineData[169]++;
  var self = this, target, trigger;
  _$jscoverage['/combobox/control.js'].lineData[172]++;
  self.callSuper(e);
  _$jscoverage['/combobox/control.js'].lineData[173]++;
  target = e.target;
  _$jscoverage['/combobox/control.js'].lineData[174]++;
  trigger = self.get('trigger');
  _$jscoverage['/combobox/control.js'].lineData[175]++;
  if (visit21_175_1(trigger && (visit22_175_2(visit23_175_3(trigger[0] === target) || trigger.contains(target))))) {
    _$jscoverage['/combobox/control.js'].lineData[176]++;
    if (visit24_176_1(self.get('collapsed'))) {
      _$jscoverage['/combobox/control.js'].lineData[178]++;
      self.focus();
      _$jscoverage['/combobox/control.js'].lineData[179]++;
      self.sendRequest('');
    } else {
      _$jscoverage['/combobox/control.js'].lineData[182]++;
      self.set('collapsed', true);
    }
    _$jscoverage['/combobox/control.js'].lineData[184]++;
    e.preventDefault();
  }
}, 
  handleKeyDownInternal: function(e) {
  _$jscoverage['/combobox/control.js'].functionData[12]++;
  _$jscoverage['/combobox/control.js'].lineData[189]++;
  var self = this, updateInputOnDownUp, input, keyCode = e.keyCode, highlightedItem, handledByMenu, menu = self.get('menu');
  _$jscoverage['/combobox/control.js'].lineData[197]++;
  input = self.get('input');
  _$jscoverage['/combobox/control.js'].lineData[198]++;
  updateInputOnDownUp = self.get('updateInputOnDownUp');
  _$jscoverage['/combobox/control.js'].lineData[200]++;
  if (visit25_200_1(menu.get('visible'))) {
    _$jscoverage['/combobox/control.js'].lineData[202]++;
    highlightedItem = menu.get('highlightedItem');
    _$jscoverage['/combobox/control.js'].lineData[206]++;
    if (visit26_206_1(updateInputOnDownUp && highlightedItem)) {
      _$jscoverage['/combobox/control.js'].lineData[207]++;
      var menuChildren = menu.get('children');
      _$jscoverage['/combobox/control.js'].lineData[208]++;
      if (visit27_208_1(visit28_208_2(visit29_208_3(keyCode === KeyCode.DOWN) && visit30_209_1(highlightedItem === getFirstEnabledItem(menuChildren.concat().reverse()))) || visit31_210_1(visit32_210_2(keyCode === KeyCode.UP) && visit33_211_1(highlightedItem === getFirstEnabledItem(menuChildren))))) {
        _$jscoverage['/combobox/control.js'].lineData[213]++;
        self.setCurrentValue(self._savedValue);
        _$jscoverage['/combobox/control.js'].lineData[214]++;
        highlightedItem.set('highlighted', false);
        _$jscoverage['/combobox/control.js'].lineData[215]++;
        return true;
      }
    }
    _$jscoverage['/combobox/control.js'].lineData[219]++;
    handledByMenu = menu.handleKeyDownInternal(e);
    _$jscoverage['/combobox/control.js'].lineData[221]++;
    highlightedItem = menu.get('highlightedItem');
    _$jscoverage['/combobox/control.js'].lineData[224]++;
    if (visit34_224_1(keyCode === KeyCode.ESC)) {
      _$jscoverage['/combobox/control.js'].lineData[225]++;
      self.set('collapsed', true);
      _$jscoverage['/combobox/control.js'].lineData[226]++;
      if (visit35_226_1(updateInputOnDownUp)) {
        _$jscoverage['/combobox/control.js'].lineData[230]++;
        self.setCurrentValue(self._savedValue);
      }
      _$jscoverage['/combobox/control.js'].lineData[232]++;
      return true;
    }
    _$jscoverage['/combobox/control.js'].lineData[235]++;
    if (visit36_235_1(updateInputOnDownUp && S.inArray(keyCode, [KeyCode.DOWN, KeyCode.UP]))) {
      _$jscoverage['/combobox/control.js'].lineData[238]++;
      self.setCurrentValue(highlightedItem.get('textContent'));
    }
    _$jscoverage['/combobox/control.js'].lineData[243]++;
    if (visit37_243_1(visit38_243_2(keyCode === KeyCode.TAB) && highlightedItem)) {
      _$jscoverage['/combobox/control.js'].lineData[245]++;
      highlightedItem.handleClickInternal(e);
      _$jscoverage['/combobox/control.js'].lineData[247]++;
      if (visit39_247_1(self.get('multiple'))) {
        _$jscoverage['/combobox/control.js'].lineData[248]++;
        return true;
      }
    }
    _$jscoverage['/combobox/control.js'].lineData[252]++;
    return handledByMenu;
  } else {
    _$jscoverage['/combobox/control.js'].lineData[253]++;
    if (visit40_253_1(visit41_253_2(keyCode === KeyCode.DOWN) || visit42_253_3(keyCode === KeyCode.UP))) {
      _$jscoverage['/combobox/control.js'].lineData[255]++;
      var v = self.getCurrentValue();
      _$jscoverage['/combobox/control.js'].lineData[256]++;
      if (visit43_256_1(v !== undefined)) {
        _$jscoverage['/combobox/control.js'].lineData[257]++;
        self.sendRequest(v);
        _$jscoverage['/combobox/control.js'].lineData[258]++;
        return true;
      }
    }
  }
  _$jscoverage['/combobox/control.js'].lineData[261]++;
  return undefined;
}, 
  validate: function(callback) {
  _$jscoverage['/combobox/control.js'].functionData[13]++;
  _$jscoverage['/combobox/control.js'].lineData[265]++;
  var self = this, validator = self.get('validator'), val = self.getCurrentValue();
  _$jscoverage['/combobox/control.js'].lineData[269]++;
  if (visit44_269_1(validator)) {
    _$jscoverage['/combobox/control.js'].lineData[270]++;
    validator(val, function(error) {
  _$jscoverage['/combobox/control.js'].functionData[14]++;
  _$jscoverage['/combobox/control.js'].lineData[271]++;
  callback(error, val);
});
  } else {
    _$jscoverage['/combobox/control.js'].lineData[274]++;
    callback(false, val);
  }
}, 
  sendRequest: function(value) {
  _$jscoverage['/combobox/control.js'].functionData[15]++;
  _$jscoverage['/combobox/control.js'].lineData[283]++;
  var self = this, dataSource = self.get('dataSource');
  _$jscoverage['/combobox/control.js'].lineData[285]++;
  dataSource.fetchData(value, renderData, self);
}, 
  getKeyEventTarget: function() {
  _$jscoverage['/combobox/control.js'].functionData[16]++;
  _$jscoverage['/combobox/control.js'].lineData[289]++;
  return this.get('input');
}, 
  _onSetCollapsed: function(v) {
  _$jscoverage['/combobox/control.js'].functionData[17]++;
  _$jscoverage['/combobox/control.js'].lineData[293]++;
  var self = this, el = self.$el, menu = self.get('menu');
  _$jscoverage['/combobox/control.js'].lineData[296]++;
  if (visit45_296_1(v)) {
    _$jscoverage['/combobox/control.js'].lineData[297]++;
    menu.hide();
  } else {
    _$jscoverage['/combobox/control.js'].lineData[300]++;
    clearDismissTimer(self);
    _$jscoverage['/combobox/control.js'].lineData[301]++;
    if (visit46_301_1(!menu.get('visible'))) {
      _$jscoverage['/combobox/control.js'].lineData[302]++;
      if (visit47_302_1(self.get('matchElWidth'))) {
        _$jscoverage['/combobox/control.js'].lineData[303]++;
        menu.render();
        _$jscoverage['/combobox/control.js'].lineData[304]++;
        var menuEl = menu.get('el');
        _$jscoverage['/combobox/control.js'].lineData[305]++;
        var borderWidth = (visit48_306_1(parseInt(menuEl.css('borderLeftWidth'), 10) || 0)) + (visit49_307_1(parseInt(menuEl.css('borderRightWidth'), 10) || 0));
        _$jscoverage['/combobox/control.js'].lineData[308]++;
        menu.set('width', el[0].offsetWidth - borderWidth);
      }
      _$jscoverage['/combobox/control.js'].lineData[310]++;
      menu.show();
    }
  }
  _$jscoverage['/combobox/control.js'].lineData[313]++;
  this.get('input').attr('aria-expanded', !v);
}, 
  _onSetDisabled: function(v, e) {
  _$jscoverage['/combobox/control.js'].functionData[18]++;
  _$jscoverage['/combobox/control.js'].lineData[317]++;
  this.callSuper(v, e);
  _$jscoverage['/combobox/control.js'].lineData[318]++;
  this.get('input').attr('disabled', v);
}}, {
  ATTRS: {
  contentTpl: {
  value: ComboboxTpl}, 
  input: {
  selector: function() {
  _$jscoverage['/combobox/control.js'].functionData[19]++;
  _$jscoverage['/combobox/control.js'].lineData[336]++;
  return ('.' + this.getBaseCssClass('input'));
}}, 
  value: {
  value: '', 
  sync: 0, 
  render: 1, 
  parse: function() {
  _$jscoverage['/combobox/control.js'].functionData[20]++;
  _$jscoverage['/combobox/control.js'].lineData[352]++;
  return this.get('input').val();
}}, 
  trigger: {
  selector: function() {
  _$jscoverage['/combobox/control.js'].functionData[21]++;
  _$jscoverage['/combobox/control.js'].lineData[362]++;
  return '.' + this.getBaseCssClass('trigger');
}}, 
  placeholder: {
  render: 1, 
  sync: 0, 
  parse: function() {
  _$jscoverage['/combobox/control.js'].functionData[22]++;
  _$jscoverage['/combobox/control.js'].lineData[377]++;
  var placeHolder = this.get('placeholderEl');
  _$jscoverage['/combobox/control.js'].lineData[378]++;
  return visit50_378_1(placeHolder && placeHolder.html());
}}, 
  placeholderEl: {
  selector: function() {
  _$jscoverage['/combobox/control.js'].functionData[23]++;
  _$jscoverage['/combobox/control.js'].lineData[388]++;
  return ('.' + this.getBaseCssClass('placeholder'));
}}, 
  validator: {}, 
  invalidEl: {
  selector: function() {
  _$jscoverage['/combobox/control.js'].functionData[24]++;
  _$jscoverage['/combobox/control.js'].lineData[409]++;
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
  _$jscoverage['/combobox/control.js'].functionData[25]++;
  _$jscoverage['/combobox/control.js'].lineData[447]++;
  if (visit51_447_1(!v.isControl)) {
    _$jscoverage['/combobox/control.js'].lineData[448]++;
    v.xclass = visit52_448_1(v.xclass || 'popupmenu');
    _$jscoverage['/combobox/control.js'].lineData[449]++;
    v = this.createComponent(v);
    _$jscoverage['/combobox/control.js'].lineData[450]++;
    this.setInternal('menu', v);
  }
  _$jscoverage['/combobox/control.js'].lineData[452]++;
  return v;
}, 
  setter: function(m) {
  _$jscoverage['/combobox/control.js'].functionData[26]++;
  _$jscoverage['/combobox/control.js'].lineData[455]++;
  if (visit53_455_1(m.isControl)) {
    _$jscoverage['/combobox/control.js'].lineData[456]++;
    m.setInternal('parent', this);
    _$jscoverage['/combobox/control.js'].lineData[457]++;
    var align = {
  node: this.$el, 
  points: ['bl', 'tl'], 
  overflow: {
  adjustX: 1, 
  adjustY: 1}};
    _$jscoverage['/combobox/control.js'].lineData[465]++;
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
  _$jscoverage['/combobox/control.js'].lineData[569]++;
  function getFirstEnabledItem(children) {
    _$jscoverage['/combobox/control.js'].functionData[27]++;
    _$jscoverage['/combobox/control.js'].lineData[570]++;
    for (var i = 0; visit54_570_1(i < children.length); i++) {
      _$jscoverage['/combobox/control.js'].lineData[571]++;
      if (visit55_571_1(!children[i].get('disabled'))) {
        _$jscoverage['/combobox/control.js'].lineData[572]++;
        return children[i];
      }
    }
    _$jscoverage['/combobox/control.js'].lineData[575]++;
    return null;
  }
  _$jscoverage['/combobox/control.js'].lineData[578]++;
  function onMenuFocusout() {
    _$jscoverage['/combobox/control.js'].functionData[28]++;
    _$jscoverage['/combobox/control.js'].lineData[579]++;
    delayHide(this);
  }
  _$jscoverage['/combobox/control.js'].lineData[582]++;
  function onMenuFocusin() {
    _$jscoverage['/combobox/control.js'].functionData[29]++;
    _$jscoverage['/combobox/control.js'].lineData[583]++;
    var self = this;
    _$jscoverage['/combobox/control.js'].lineData[587]++;
    setTimeout(function() {
  _$jscoverage['/combobox/control.js'].functionData[30]++;
  _$jscoverage['/combobox/control.js'].lineData[588]++;
  clearDismissTimer(self);
}, 0);
  }
  _$jscoverage['/combobox/control.js'].lineData[592]++;
  function onMenuMouseOver() {
    _$jscoverage['/combobox/control.js'].functionData[31]++;
    _$jscoverage['/combobox/control.js'].lineData[593]++;
    var self = this;
    _$jscoverage['/combobox/control.js'].lineData[595]++;
    self.focus();
    _$jscoverage['/combobox/control.js'].lineData[597]++;
    clearDismissTimer(self);
  }
  _$jscoverage['/combobox/control.js'].lineData[600]++;
  function onMenuMouseDown() {
    _$jscoverage['/combobox/control.js'].functionData[32]++;
    _$jscoverage['/combobox/control.js'].lineData[601]++;
    var self = this;
    _$jscoverage['/combobox/control.js'].lineData[605]++;
    self.setCurrentValue(self.getCurrentValue(), {
  force: 1});
  }
  _$jscoverage['/combobox/control.js'].lineData[610]++;
  function onMenuAfterRenderUI(e) {
    _$jscoverage['/combobox/control.js'].functionData[33]++;
    _$jscoverage['/combobox/control.js'].lineData[611]++;
    var self = this, contentEl;
    _$jscoverage['/combobox/control.js'].lineData[613]++;
    var menu = self.get('menu');
    _$jscoverage['/combobox/control.js'].lineData[614]++;
    if (visit56_614_1(!e || visit57_614_2(menu === e.target))) {
      _$jscoverage['/combobox/control.js'].lineData[615]++;
      var input = self.get('input');
      _$jscoverage['/combobox/control.js'].lineData[616]++;
      var el = menu.get('el');
      _$jscoverage['/combobox/control.js'].lineData[617]++;
      contentEl = menu.get('contentEl');
      _$jscoverage['/combobox/control.js'].lineData[618]++;
      input.attr('aria-owns', el.attr('id'));
      _$jscoverage['/combobox/control.js'].lineData[620]++;
      el.on('focusout', onMenuFocusout, self);
      _$jscoverage['/combobox/control.js'].lineData[621]++;
      el.on('focusin', onMenuFocusin, self);
      _$jscoverage['/combobox/control.js'].lineData[622]++;
      contentEl.on('mouseover', onMenuMouseOver, self);
      _$jscoverage['/combobox/control.js'].lineData[625]++;
      contentEl.on('mousedown', onMenuMouseDown, self);
      _$jscoverage['/combobox/control.js'].lineData[626]++;
      if (visit58_626_1(self.get('matchElWidth'))) {
        _$jscoverage['/combobox/control.js'].lineData[627]++;
        el.getWindow().on('resize', onWindowResize, self);
      }
    }
  }
  _$jscoverage['/combobox/control.js'].lineData[632]++;
  function onWindowResize() {
    _$jscoverage['/combobox/control.js'].functionData[34]++;
    _$jscoverage['/combobox/control.js'].lineData[633]++;
    var self = this;
    _$jscoverage['/combobox/control.js'].lineData[634]++;
    var menu = self.get('menu');
    _$jscoverage['/combobox/control.js'].lineData[635]++;
    if (visit59_635_1(menu.get('visible'))) {
      _$jscoverage['/combobox/control.js'].lineData[636]++;
      var el = self.get('el');
      _$jscoverage['/combobox/control.js'].lineData[637]++;
      var menuEl = menu.get('el');
      _$jscoverage['/combobox/control.js'].lineData[638]++;
      var borderWidth = (visit60_638_1(parseInt(menuEl.css('borderLeftWidth'), 10) || 0)) + (visit61_639_1(parseInt(menuEl.css('borderRightWidth'), 10) || 0));
      _$jscoverage['/combobox/control.js'].lineData[640]++;
      menu.set('width', el[0].offsetWidth - borderWidth);
    }
  }
  _$jscoverage['/combobox/control.js'].lineData[644]++;
  function onMenuItemClick(e) {
    _$jscoverage['/combobox/control.js'].functionData[35]++;
    _$jscoverage['/combobox/control.js'].lineData[645]++;
    var item = e.target, self = this, textContent;
    _$jscoverage['/combobox/control.js'].lineData[648]++;
    if (visit62_648_1(item.isMenuItem)) {
      _$jscoverage['/combobox/control.js'].lineData[649]++;
      textContent = item.get('textContent');
      _$jscoverage['/combobox/control.js'].lineData[650]++;
      self.setCurrentValue(textContent);
      _$jscoverage['/combobox/control.js'].lineData[651]++;
      self._savedValue = textContent;
      _$jscoverage['/combobox/control.js'].lineData[652]++;
      self.set('collapsed', true);
    }
  }
  _$jscoverage['/combobox/control.js'].lineData[656]++;
  function setInvalid(self, error) {
    _$jscoverage['/combobox/control.js'].functionData[36]++;
    _$jscoverage['/combobox/control.js'].lineData[657]++;
    var $el = self.$el, cls = self.getBaseCssClasses('invalid'), invalidEl = self.get('invalidEl');
    _$jscoverage['/combobox/control.js'].lineData[660]++;
    if (visit63_660_1(error)) {
      _$jscoverage['/combobox/control.js'].lineData[661]++;
      $el.addClass(cls);
      _$jscoverage['/combobox/control.js'].lineData[662]++;
      invalidEl.attr('title', error);
      _$jscoverage['/combobox/control.js'].lineData[663]++;
      invalidEl.show();
    } else {
      _$jscoverage['/combobox/control.js'].lineData[665]++;
      $el.removeClass(cls);
      _$jscoverage['/combobox/control.js'].lineData[666]++;
      invalidEl.hide();
    }
  }
  _$jscoverage['/combobox/control.js'].lineData[670]++;
  function delayHide(self) {
    _$jscoverage['/combobox/control.js'].functionData[37]++;
    _$jscoverage['/combobox/control.js'].lineData[671]++;
    if (visit64_671_1(self._focusoutDismissTimer)) {
      _$jscoverage['/combobox/control.js'].lineData[672]++;
      return;
    }
    _$jscoverage['/combobox/control.js'].lineData[674]++;
    self._focusoutDismissTimer = setTimeout(function() {
  _$jscoverage['/combobox/control.js'].functionData[38]++;
  _$jscoverage['/combobox/control.js'].lineData[676]++;
  if (visit65_676_1(self._focusoutDismissTimer)) {
    _$jscoverage['/combobox/control.js'].lineData[677]++;
    self.set('collapsed', true);
  }
}, 50);
  }
  _$jscoverage['/combobox/control.js'].lineData[684]++;
  function clearDismissTimer(self) {
    _$jscoverage['/combobox/control.js'].functionData[39]++;
    _$jscoverage['/combobox/control.js'].lineData[685]++;
    var t = self._focusoutDismissTimer;
    _$jscoverage['/combobox/control.js'].lineData[686]++;
    if (visit66_686_1(t)) {
      _$jscoverage['/combobox/control.js'].lineData[687]++;
      clearTimeout(t);
      _$jscoverage['/combobox/control.js'].lineData[688]++;
      self._focusoutDismissTimer = null;
    }
  }
  _$jscoverage['/combobox/control.js'].lineData[692]++;
  function onValueChange(e) {
    _$jscoverage['/combobox/control.js'].functionData[40]++;
    _$jscoverage['/combobox/control.js'].lineData[693]++;
    this.set('value', e.target.value, {
  data: {
  causedByInputEvent: 1}});
  }
  _$jscoverage['/combobox/control.js'].lineData[700]++;
  function renderData(data) {
    _$jscoverage['/combobox/control.js'].functionData[41]++;
    _$jscoverage['/combobox/control.js'].lineData[701]++;
    var self = this, v, children = [], val, matchVal, highlightedItem, i, menu = self.get('menu');
    _$jscoverage['/combobox/control.js'].lineData[710]++;
    data = self.normalizeData(data);
    _$jscoverage['/combobox/control.js'].lineData[712]++;
    menu.removeChildren(true);
    _$jscoverage['/combobox/control.js'].lineData[714]++;
    if ((highlightedItem = menu.get('highlightedItem'))) {
      _$jscoverage['/combobox/control.js'].lineData[715]++;
      highlightedItem.set('highlighted', false);
    }
    _$jscoverage['/combobox/control.js'].lineData[718]++;
    if (visit67_718_1(data && data.length)) {
      _$jscoverage['/combobox/control.js'].lineData[719]++;
      for (i = 0; visit68_719_1(i < data.length); i++) {
        _$jscoverage['/combobox/control.js'].lineData[720]++;
        v = data[i];
        _$jscoverage['/combobox/control.js'].lineData[721]++;
        menu.addChild(v);
      }
      _$jscoverage['/combobox/control.js'].lineData[724]++;
      children = menu.get('children');
      _$jscoverage['/combobox/control.js'].lineData[727]++;
      val = self.getCurrentValue();
      _$jscoverage['/combobox/control.js'].lineData[729]++;
      if (visit69_729_1(self.get('highlightMatchItem'))) {
        _$jscoverage['/combobox/control.js'].lineData[730]++;
        for (i = 0; visit70_730_1(i < children.length); i++) {
          _$jscoverage['/combobox/control.js'].lineData[731]++;
          if (visit71_731_1(children[i].get('textContent') === val)) {
            _$jscoverage['/combobox/control.js'].lineData[732]++;
            children[i].set('highlighted', true);
            _$jscoverage['/combobox/control.js'].lineData[733]++;
            matchVal = true;
            _$jscoverage['/combobox/control.js'].lineData[734]++;
            break;
          }
        }
      }
      _$jscoverage['/combobox/control.js'].lineData[740]++;
      if (visit72_740_1(!matchVal && self.get('autoHighlightFirst'))) {
        _$jscoverage['/combobox/control.js'].lineData[741]++;
        for (i = 0; visit73_741_1(i < children.length); i++) {
          _$jscoverage['/combobox/control.js'].lineData[742]++;
          if (visit74_742_1(!children[i].get('disabled'))) {
            _$jscoverage['/combobox/control.js'].lineData[743]++;
            children[i].set('highlighted', true);
            _$jscoverage['/combobox/control.js'].lineData[744]++;
            break;
          }
        }
      }
      _$jscoverage['/combobox/control.js'].lineData[748]++;
      self.set('collapsed', false);
      _$jscoverage['/combobox/control.js'].lineData[750]++;
      self.fire('afterRenderData');
    } else {
      _$jscoverage['/combobox/control.js'].lineData[752]++;
      self.set('collapsed', true);
    }
  }
  _$jscoverage['/combobox/control.js'].lineData[758]++;
  return ComboBox;
});
