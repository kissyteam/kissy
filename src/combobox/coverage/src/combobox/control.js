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
  _$jscoverage['/combobox/control.js'].lineData[411] = 0;
  _$jscoverage['/combobox/control.js'].lineData[412] = 0;
  _$jscoverage['/combobox/control.js'].lineData[413] = 0;
  _$jscoverage['/combobox/control.js'].lineData[414] = 0;
  _$jscoverage['/combobox/control.js'].lineData[416] = 0;
  _$jscoverage['/combobox/control.js'].lineData[419] = 0;
  _$jscoverage['/combobox/control.js'].lineData[420] = 0;
  _$jscoverage['/combobox/control.js'].lineData[421] = 0;
  _$jscoverage['/combobox/control.js'].lineData[429] = 0;
  _$jscoverage['/combobox/control.js'].lineData[536] = 0;
  _$jscoverage['/combobox/control.js'].lineData[537] = 0;
  _$jscoverage['/combobox/control.js'].lineData[538] = 0;
  _$jscoverage['/combobox/control.js'].lineData[539] = 0;
  _$jscoverage['/combobox/control.js'].lineData[542] = 0;
  _$jscoverage['/combobox/control.js'].lineData[545] = 0;
  _$jscoverage['/combobox/control.js'].lineData[546] = 0;
  _$jscoverage['/combobox/control.js'].lineData[549] = 0;
  _$jscoverage['/combobox/control.js'].lineData[550] = 0;
  _$jscoverage['/combobox/control.js'].lineData[554] = 0;
  _$jscoverage['/combobox/control.js'].lineData[555] = 0;
  _$jscoverage['/combobox/control.js'].lineData[559] = 0;
  _$jscoverage['/combobox/control.js'].lineData[560] = 0;
  _$jscoverage['/combobox/control.js'].lineData[562] = 0;
  _$jscoverage['/combobox/control.js'].lineData[564] = 0;
  _$jscoverage['/combobox/control.js'].lineData[567] = 0;
  _$jscoverage['/combobox/control.js'].lineData[568] = 0;
  _$jscoverage['/combobox/control.js'].lineData[572] = 0;
  _$jscoverage['/combobox/control.js'].lineData[577] = 0;
  _$jscoverage['/combobox/control.js'].lineData[578] = 0;
  _$jscoverage['/combobox/control.js'].lineData[580] = 0;
  _$jscoverage['/combobox/control.js'].lineData[581] = 0;
  _$jscoverage['/combobox/control.js'].lineData[582] = 0;
  _$jscoverage['/combobox/control.js'].lineData[583] = 0;
  _$jscoverage['/combobox/control.js'].lineData[584] = 0;
  _$jscoverage['/combobox/control.js'].lineData[585] = 0;
  _$jscoverage['/combobox/control.js'].lineData[587] = 0;
  _$jscoverage['/combobox/control.js'].lineData[588] = 0;
  _$jscoverage['/combobox/control.js'].lineData[589] = 0;
  _$jscoverage['/combobox/control.js'].lineData[592] = 0;
  _$jscoverage['/combobox/control.js'].lineData[596] = 0;
  _$jscoverage['/combobox/control.js'].lineData[597] = 0;
  _$jscoverage['/combobox/control.js'].lineData[600] = 0;
  _$jscoverage['/combobox/control.js'].lineData[601] = 0;
  _$jscoverage['/combobox/control.js'].lineData[602] = 0;
  _$jscoverage['/combobox/control.js'].lineData[603] = 0;
  _$jscoverage['/combobox/control.js'].lineData[604] = 0;
  _$jscoverage['/combobox/control.js'].lineData[608] = 0;
  _$jscoverage['/combobox/control.js'].lineData[609] = 0;
  _$jscoverage['/combobox/control.js'].lineData[612] = 0;
  _$jscoverage['/combobox/control.js'].lineData[613] = 0;
  _$jscoverage['/combobox/control.js'].lineData[614] = 0;
  _$jscoverage['/combobox/control.js'].lineData[615] = 0;
  _$jscoverage['/combobox/control.js'].lineData[617] = 0;
  _$jscoverage['/combobox/control.js'].lineData[618] = 0;
  _$jscoverage['/combobox/control.js'].lineData[622] = 0;
  _$jscoverage['/combobox/control.js'].lineData[623] = 0;
  _$jscoverage['/combobox/control.js'].lineData[624] = 0;
  _$jscoverage['/combobox/control.js'].lineData[626] = 0;
  _$jscoverage['/combobox/control.js'].lineData[628] = 0;
  _$jscoverage['/combobox/control.js'].lineData[629] = 0;
  _$jscoverage['/combobox/control.js'].lineData[636] = 0;
  _$jscoverage['/combobox/control.js'].lineData[637] = 0;
  _$jscoverage['/combobox/control.js'].lineData[638] = 0;
  _$jscoverage['/combobox/control.js'].lineData[639] = 0;
  _$jscoverage['/combobox/control.js'].lineData[640] = 0;
  _$jscoverage['/combobox/control.js'].lineData[644] = 0;
  _$jscoverage['/combobox/control.js'].lineData[645] = 0;
  _$jscoverage['/combobox/control.js'].lineData[652] = 0;
  _$jscoverage['/combobox/control.js'].lineData[653] = 0;
  _$jscoverage['/combobox/control.js'].lineData[662] = 0;
  _$jscoverage['/combobox/control.js'].lineData[664] = 0;
  _$jscoverage['/combobox/control.js'].lineData[666] = 0;
  _$jscoverage['/combobox/control.js'].lineData[667] = 0;
  _$jscoverage['/combobox/control.js'].lineData[670] = 0;
  _$jscoverage['/combobox/control.js'].lineData[671] = 0;
  _$jscoverage['/combobox/control.js'].lineData[672] = 0;
  _$jscoverage['/combobox/control.js'].lineData[673] = 0;
  _$jscoverage['/combobox/control.js'].lineData[676] = 0;
  _$jscoverage['/combobox/control.js'].lineData[679] = 0;
  _$jscoverage['/combobox/control.js'].lineData[681] = 0;
  _$jscoverage['/combobox/control.js'].lineData[682] = 0;
  _$jscoverage['/combobox/control.js'].lineData[683] = 0;
  _$jscoverage['/combobox/control.js'].lineData[684] = 0;
  _$jscoverage['/combobox/control.js'].lineData[685] = 0;
  _$jscoverage['/combobox/control.js'].lineData[686] = 0;
  _$jscoverage['/combobox/control.js'].lineData[692] = 0;
  _$jscoverage['/combobox/control.js'].lineData[693] = 0;
  _$jscoverage['/combobox/control.js'].lineData[694] = 0;
  _$jscoverage['/combobox/control.js'].lineData[695] = 0;
  _$jscoverage['/combobox/control.js'].lineData[696] = 0;
  _$jscoverage['/combobox/control.js'].lineData[700] = 0;
  _$jscoverage['/combobox/control.js'].lineData[702] = 0;
  _$jscoverage['/combobox/control.js'].lineData[704] = 0;
  _$jscoverage['/combobox/control.js'].lineData[710] = 0;
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
  _$jscoverage['/combobox/control.js'].branchData['411'] = [];
  _$jscoverage['/combobox/control.js'].branchData['411'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['412'] = [];
  _$jscoverage['/combobox/control.js'].branchData['412'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['419'] = [];
  _$jscoverage['/combobox/control.js'].branchData['419'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['537'] = [];
  _$jscoverage['/combobox/control.js'].branchData['537'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['538'] = [];
  _$jscoverage['/combobox/control.js'].branchData['538'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['581'] = [];
  _$jscoverage['/combobox/control.js'].branchData['581'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['581'][2] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['600'] = [];
  _$jscoverage['/combobox/control.js'].branchData['600'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['612'] = [];
  _$jscoverage['/combobox/control.js'].branchData['612'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['623'] = [];
  _$jscoverage['/combobox/control.js'].branchData['623'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['628'] = [];
  _$jscoverage['/combobox/control.js'].branchData['628'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['638'] = [];
  _$jscoverage['/combobox/control.js'].branchData['638'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['670'] = [];
  _$jscoverage['/combobox/control.js'].branchData['670'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['671'] = [];
  _$jscoverage['/combobox/control.js'].branchData['671'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['681'] = [];
  _$jscoverage['/combobox/control.js'].branchData['681'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['682'] = [];
  _$jscoverage['/combobox/control.js'].branchData['682'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['683'] = [];
  _$jscoverage['/combobox/control.js'].branchData['683'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['692'] = [];
  _$jscoverage['/combobox/control.js'].branchData['692'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['693'] = [];
  _$jscoverage['/combobox/control.js'].branchData['693'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['694'] = [];
  _$jscoverage['/combobox/control.js'].branchData['694'][1] = new BranchData();
}
_$jscoverage['/combobox/control.js'].branchData['694'][1].init(25, 28, '!children[i].get(\'disabled\')');
function visit71_694_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['694'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['693'][1].init(29, 19, 'i < children.length');
function visit70_693_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['693'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['692'][1].init(745, 43, '!matchVal && self.get(\'autoHighlightFirst\')');
function visit69_692_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['692'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['683'][1].init(25, 38, 'children[i].get(\'textContent\') === val');
function visit68_683_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['683'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['682'][1].init(29, 19, 'i < children.length');
function visit67_682_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['682'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['681'][1].init(306, 30, 'self.get(\'highlightMatchItem\')');
function visit66_681_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['681'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['671'][1].init(25, 15, 'i < data.length');
function visit65_671_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['671'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['670'][1].init(408, 19, 'data && data.length');
function visit64_670_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['670'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['638'][1].init(57, 1, 't');
function visit63_638_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['638'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['628'][1].init(48, 26, 'self._focusoutDismissTimer');
function visit62_628_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['628'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['623'][1].init(13, 26, 'self._focusoutDismissTimer');
function visit61_623_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['623'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['612'][1].init(146, 5, 'error');
function visit60_612_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['612'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['600'][1].init(92, 15, 'item.isMenuItem');
function visit59_600_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['600'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['581'][2].init(104, 17, 'menu === e.target');
function visit58_581_2(result) {
  _$jscoverage['/combobox/control.js'].branchData['581'][2].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['581'][1].init(98, 23, '!e || menu === e.target');
function visit57_581_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['581'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['538'][1].init(17, 28, '!children[i].get(\'disabled\')');
function visit56_538_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['538'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['537'][1].init(25, 19, 'i < children.length');
function visit55_537_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['537'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['419'][1].init(29, 11, 'm.isControl');
function visit54_419_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['419'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['412'][1].init(40, 23, 'v.xclass || \'popupmenu\'');
function visit53_412_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['412'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['411'][1].init(29, 12, '!v.isControl');
function visit52_411_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['411'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['300'][1].init(88, 49, 'parseInt(menuEl.css(\'borderRightWidth\'), 10) || 0');
function visit51_300_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['300'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['299'][1].init(46, 48, 'parseInt(menuEl.css(\'borderLeftWidth\'), 10) || 0');
function visit50_299_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['299'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['295'][1].init(29, 24, 'self.get(\'matchElWidth\')');
function visit49_295_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['295'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['294'][1].init(116, 20, '!menu.get(\'visible\')');
function visit48_294_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['294'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['289'][1].init(134, 1, 'v');
function visit47_289_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['289'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['266'][1].init(160, 9, 'validator');
function visit46_266_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['266'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['253'][1].init(134, 15, 'v !== undefined');
function visit45_253_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['253'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['250'][3].init(2911, 22, 'keyCode === KeyCode.UP');
function visit44_250_3(result) {
  _$jscoverage['/combobox/control.js'].branchData['250'][3].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['250'][2].init(2883, 24, 'keyCode === KeyCode.DOWN');
function visit43_250_2(result) {
  _$jscoverage['/combobox/control.js'].branchData['250'][2].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['250'][1].init(2883, 50, 'keyCode === KeyCode.DOWN || keyCode === KeyCode.UP');
function visit42_250_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['250'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['244'][1].init(212, 20, 'self.get(\'multiple\')');
function visit41_244_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['244'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['240'][2].init(2024, 23, 'keyCode === KeyCode.TAB');
function visit40_240_2(result) {
  _$jscoverage['/combobox/control.js'].branchData['240'][2].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['240'][1].init(2024, 42, 'keyCode === KeyCode.TAB && highlightedItem');
function visit39_240_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['240'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['232'][1].init(1604, 93, 'updateInputOnDownUp && S.inArray(keyCode, [KeyCode.DOWN, KeyCode.UP])');
function visit38_232_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['232'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['223'][1].init(82, 19, 'updateInputOnDownUp');
function visit37_223_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['223'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['221'][1].init(1098, 23, 'keyCode === KeyCode.ESC');
function visit36_221_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['221'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['208'][1].init(57, 53, 'highlightedItem === getFirstEnabledItem(menuChildren)');
function visit35_208_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['208'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['207'][2].init(256, 22, 'keyCode === KeyCode.UP');
function visit34_207_2(result) {
  _$jscoverage['/combobox/control.js'].branchData['207'][2].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['207'][1].init(159, 111, 'keyCode === KeyCode.UP && highlightedItem === getFirstEnabledItem(menuChildren)');
function visit33_207_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['207'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['206'][1].init(55, 72, 'highlightedItem === getFirstEnabledItem(menuChildren.concat().reverse())');
function visit32_206_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['206'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['205'][3].init(94, 24, 'keyCode === KeyCode.DOWN');
function visit31_205_3(result) {
  _$jscoverage['/combobox/control.js'].branchData['205'][3].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['205'][2].init(94, 128, 'keyCode === KeyCode.DOWN && highlightedItem === getFirstEnabledItem(menuChildren.concat().reverse())');
function visit30_205_2(result) {
  _$jscoverage['/combobox/control.js'].branchData['205'][2].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['205'][1].init(94, 271, 'keyCode === KeyCode.DOWN && highlightedItem === getFirstEnabledItem(menuChildren.concat().reverse()) || keyCode === KeyCode.UP && highlightedItem === getFirstEnabledItem(menuChildren)');
function visit29_205_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['205'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['203'][1].init(243, 38, 'updateInputOnDownUp && highlightedItem');
function visit28_203_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['203'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['197'][1].init(396, 19, 'menu.get(\'visible\')');
function visit27_197_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['197'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['173'][1].init(25, 21, 'self.get(\'collapsed\')');
function visit26_173_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['173'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['172'][3].init(240, 21, 'trigger[0] === target');
function visit25_172_3(result) {
  _$jscoverage['/combobox/control.js'].branchData['172'][3].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['172'][2].init(240, 49, 'trigger[0] === target || trigger.contains(target)');
function visit24_172_2(result) {
  _$jscoverage['/combobox/control.js'].branchData['172'][2].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['172'][1].init(228, 62, 'trigger && (trigger[0] === target || trigger.contains(target))');
function visit23_172_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['172'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['160'][1].init(653, 35, 'placeholderEl && !self.get(\'value\')');
function visit22_160_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['160'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['152'][2].init(58, 25, 'val === self.get(\'value\')');
function visit21_152_2(result) {
  _$jscoverage['/combobox/control.js'].branchData['152'][2].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['152'][1].init(33, 51, '!self.get(\'focused\') && (val === self.get(\'value\'))');
function visit20_152_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['152'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['151'][1].init(29, 5, 'error');
function visit19_151_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['151'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['149'][1].init(185, 21, 'self.get(\'invalidEl\')');
function visit18_149_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['149'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['136'][1].init(89, 21, 'self.get(\'invalidEl\')');
function visit17_136_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['136'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['122'][1].init(136, 19, 'value === undefined');
function visit16_122_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['122'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['119'][1].init(142, 20, 'e.causedByInputEvent');
function visit15_119_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['119'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['85'][1].init(554, 20, 'menu.get(\'rendered\')');
function visit14_85_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['85'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['54'][1].init(361, 15, 'i < data.length');
function visit13_54_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['54'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['48'][1].init(93, 18, 'self.get(\'format\')');
function visit12_48_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['48'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['46'][1].init(93, 19, 'data && data.length');
function visit11_46_1(result) {
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
  normalizeData: function(data) {
  _$jscoverage['/combobox/control.js'].functionData[2]++;
  _$jscoverage['/combobox/control.js'].lineData[44]++;
  var self = this, contents, v, i, c;
  _$jscoverage['/combobox/control.js'].lineData[46]++;
  if (visit11_46_1(data && data.length)) {
    _$jscoverage['/combobox/control.js'].lineData[47]++;
    data = data.slice(0, self.get('maxItemCount'));
    _$jscoverage['/combobox/control.js'].lineData[48]++;
    if (visit12_48_1(self.get('format'))) {
      _$jscoverage['/combobox/control.js'].lineData[49]++;
      contents = self.get('format').call(self, self.getCurrentValue(), data);
    } else {
      _$jscoverage['/combobox/control.js'].lineData[52]++;
      contents = [];
    }
    _$jscoverage['/combobox/control.js'].lineData[54]++;
    for (i = 0; visit13_54_1(i < data.length); i++) {
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
  if (visit14_85_1(menu.get('rendered'))) {
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
  getCurrentValue: function() {
  _$jscoverage['/combobox/control.js'].functionData[5]++;
  _$jscoverage['/combobox/control.js'].lineData[101]++;
  return this.get('value');
}, 
  setCurrentValue: function(value, setCfg) {
  _$jscoverage['/combobox/control.js'].functionData[6]++;
  _$jscoverage['/combobox/control.js'].lineData[111]++;
  this.set('value', value, setCfg);
}, 
  _onSetValue: function(v, e) {
  _$jscoverage['/combobox/control.js'].functionData[7]++;
  _$jscoverage['/combobox/control.js'].lineData[116]++;
  var self = this, value;
  _$jscoverage['/combobox/control.js'].lineData[119]++;
  if (visit15_119_1(e.causedByInputEvent)) {
    _$jscoverage['/combobox/control.js'].lineData[120]++;
    value = self.getCurrentValue();
    _$jscoverage['/combobox/control.js'].lineData[122]++;
    if (visit16_122_1(value === undefined)) {
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
  if (visit17_136_1(self.get('invalidEl'))) {
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
  if (visit18_149_1(self.get('invalidEl'))) {
    _$jscoverage['/combobox/control.js'].lineData[150]++;
    self.validate(function(error, val) {
  _$jscoverage['/combobox/control.js'].functionData[10]++;
  _$jscoverage['/combobox/control.js'].lineData[151]++;
  if (visit19_151_1(error)) {
    _$jscoverage['/combobox/control.js'].lineData[152]++;
    if (visit20_152_1(!self.get('focused') && (visit21_152_2(val === self.get('value'))))) {
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
  if (visit22_160_1(placeholderEl && !self.get('value'))) {
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
  if (visit23_172_1(trigger && (visit24_172_2(visit25_172_3(trigger[0] === target) || trigger.contains(target))))) {
    _$jscoverage['/combobox/control.js'].lineData[173]++;
    if (visit26_173_1(self.get('collapsed'))) {
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
  if (visit27_197_1(menu.get('visible'))) {
    _$jscoverage['/combobox/control.js'].lineData[199]++;
    highlightedItem = menu.get('highlightedItem');
    _$jscoverage['/combobox/control.js'].lineData[203]++;
    if (visit28_203_1(updateInputOnDownUp && highlightedItem)) {
      _$jscoverage['/combobox/control.js'].lineData[204]++;
      var menuChildren = menu.get('children');
      _$jscoverage['/combobox/control.js'].lineData[205]++;
      if (visit29_205_1(visit30_205_2(visit31_205_3(keyCode === KeyCode.DOWN) && visit32_206_1(highlightedItem === getFirstEnabledItem(menuChildren.concat().reverse()))) || visit33_207_1(visit34_207_2(keyCode === KeyCode.UP) && visit35_208_1(highlightedItem === getFirstEnabledItem(menuChildren))))) {
        _$jscoverage['/combobox/control.js'].lineData[210]++;
        self.setCurrentValue(self._savedValue);
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
    if (visit36_221_1(keyCode === KeyCode.ESC)) {
      _$jscoverage['/combobox/control.js'].lineData[222]++;
      self.set('collapsed', true);
      _$jscoverage['/combobox/control.js'].lineData[223]++;
      if (visit37_223_1(updateInputOnDownUp)) {
        _$jscoverage['/combobox/control.js'].lineData[227]++;
        self.setCurrentValue(self._savedValue);
      }
      _$jscoverage['/combobox/control.js'].lineData[229]++;
      return true;
    }
    _$jscoverage['/combobox/control.js'].lineData[232]++;
    if (visit38_232_1(updateInputOnDownUp && S.inArray(keyCode, [KeyCode.DOWN, KeyCode.UP]))) {
      _$jscoverage['/combobox/control.js'].lineData[235]++;
      self.setCurrentValue(highlightedItem.get('textContent'));
    }
    _$jscoverage['/combobox/control.js'].lineData[240]++;
    if (visit39_240_1(visit40_240_2(keyCode === KeyCode.TAB) && highlightedItem)) {
      _$jscoverage['/combobox/control.js'].lineData[242]++;
      highlightedItem.handleClickInternal(e);
      _$jscoverage['/combobox/control.js'].lineData[244]++;
      if (visit41_244_1(self.get('multiple'))) {
        _$jscoverage['/combobox/control.js'].lineData[245]++;
        return true;
      }
    }
    _$jscoverage['/combobox/control.js'].lineData[249]++;
    return handledByMenu;
  } else {
    _$jscoverage['/combobox/control.js'].lineData[250]++;
    if (visit42_250_1(visit43_250_2(keyCode === KeyCode.DOWN) || visit44_250_3(keyCode === KeyCode.UP))) {
      _$jscoverage['/combobox/control.js'].lineData[252]++;
      var v = self.getCurrentValue();
      _$jscoverage['/combobox/control.js'].lineData[253]++;
      if (visit45_253_1(v !== undefined)) {
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
  var self = this, validator = self.get('validator'), val = self.getCurrentValue();
  _$jscoverage['/combobox/control.js'].lineData[266]++;
  if (visit46_266_1(validator)) {
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
  if (visit47_289_1(v)) {
    _$jscoverage['/combobox/control.js'].lineData[290]++;
    menu.hide();
  } else {
    _$jscoverage['/combobox/control.js'].lineData[293]++;
    clearDismissTimer(self);
    _$jscoverage['/combobox/control.js'].lineData[294]++;
    if (visit48_294_1(!menu.get('visible'))) {
      _$jscoverage['/combobox/control.js'].lineData[295]++;
      if (visit49_295_1(self.get('matchElWidth'))) {
        _$jscoverage['/combobox/control.js'].lineData[296]++;
        menu.render();
        _$jscoverage['/combobox/control.js'].lineData[297]++;
        var menuEl = menu.get('el');
        _$jscoverage['/combobox/control.js'].lineData[298]++;
        var borderWidth = (visit50_299_1(parseInt(menuEl.css('borderLeftWidth'), 10) || 0)) + (visit51_300_1(parseInt(menuEl.css('borderRightWidth'), 10) || 0));
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
  _$jscoverage['/combobox/control.js'].lineData[411]++;
  if (visit52_411_1(!v.isControl)) {
    _$jscoverage['/combobox/control.js'].lineData[412]++;
    v.xclass = visit53_412_1(v.xclass || 'popupmenu');
    _$jscoverage['/combobox/control.js'].lineData[413]++;
    v = this.createComponent(v);
    _$jscoverage['/combobox/control.js'].lineData[414]++;
    this.setInternal('menu', v);
  }
  _$jscoverage['/combobox/control.js'].lineData[416]++;
  return v;
}, 
  setter: function(m) {
  _$jscoverage['/combobox/control.js'].functionData[18]++;
  _$jscoverage['/combobox/control.js'].lineData[419]++;
  if (visit54_419_1(m.isControl)) {
    _$jscoverage['/combobox/control.js'].lineData[420]++;
    m.setInternal('parent', this);
    _$jscoverage['/combobox/control.js'].lineData[421]++;
    var align = {
  node: this.$el, 
  points: ['bl', 'tl'], 
  overflow: {
  adjustX: 1, 
  adjustY: 1}};
    _$jscoverage['/combobox/control.js'].lineData[429]++;
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
  _$jscoverage['/combobox/control.js'].lineData[536]++;
  function getFirstEnabledItem(children) {
    _$jscoverage['/combobox/control.js'].functionData[19]++;
    _$jscoverage['/combobox/control.js'].lineData[537]++;
    for (var i = 0; visit55_537_1(i < children.length); i++) {
      _$jscoverage['/combobox/control.js'].lineData[538]++;
      if (visit56_538_1(!children[i].get('disabled'))) {
        _$jscoverage['/combobox/control.js'].lineData[539]++;
        return children[i];
      }
    }
    _$jscoverage['/combobox/control.js'].lineData[542]++;
    return null;
  }
  _$jscoverage['/combobox/control.js'].lineData[545]++;
  function onMenuFocusout() {
    _$jscoverage['/combobox/control.js'].functionData[20]++;
    _$jscoverage['/combobox/control.js'].lineData[546]++;
    delayHide(this);
  }
  _$jscoverage['/combobox/control.js'].lineData[549]++;
  function onMenuFocusin() {
    _$jscoverage['/combobox/control.js'].functionData[21]++;
    _$jscoverage['/combobox/control.js'].lineData[550]++;
    var self = this;
    _$jscoverage['/combobox/control.js'].lineData[554]++;
    setTimeout(function() {
  _$jscoverage['/combobox/control.js'].functionData[22]++;
  _$jscoverage['/combobox/control.js'].lineData[555]++;
  clearDismissTimer(self);
}, 0);
  }
  _$jscoverage['/combobox/control.js'].lineData[559]++;
  function onMenuMouseOver() {
    _$jscoverage['/combobox/control.js'].functionData[23]++;
    _$jscoverage['/combobox/control.js'].lineData[560]++;
    var self = this;
    _$jscoverage['/combobox/control.js'].lineData[562]++;
    self.focus();
    _$jscoverage['/combobox/control.js'].lineData[564]++;
    clearDismissTimer(self);
  }
  _$jscoverage['/combobox/control.js'].lineData[567]++;
  function onMenuMouseDown() {
    _$jscoverage['/combobox/control.js'].functionData[24]++;
    _$jscoverage['/combobox/control.js'].lineData[568]++;
    var self = this;
    _$jscoverage['/combobox/control.js'].lineData[572]++;
    self.setCurrentValue(self.getCurrentValue(), {
  force: 1});
  }
  _$jscoverage['/combobox/control.js'].lineData[577]++;
  function onMenuAfterRenderUI(e) {
    _$jscoverage['/combobox/control.js'].functionData[25]++;
    _$jscoverage['/combobox/control.js'].lineData[578]++;
    var self = this, contentEl;
    _$jscoverage['/combobox/control.js'].lineData[580]++;
    var menu = self.get('menu');
    _$jscoverage['/combobox/control.js'].lineData[581]++;
    if (visit57_581_1(!e || visit58_581_2(menu === e.target))) {
      _$jscoverage['/combobox/control.js'].lineData[582]++;
      var input = self.get('input');
      _$jscoverage['/combobox/control.js'].lineData[583]++;
      var el = menu.get('el');
      _$jscoverage['/combobox/control.js'].lineData[584]++;
      contentEl = menu.get('contentEl');
      _$jscoverage['/combobox/control.js'].lineData[585]++;
      input.attr('aria-owns', el.attr('id'));
      _$jscoverage['/combobox/control.js'].lineData[587]++;
      el.on('focusout', onMenuFocusout, self);
      _$jscoverage['/combobox/control.js'].lineData[588]++;
      el.on('focusin', onMenuFocusin, self);
      _$jscoverage['/combobox/control.js'].lineData[589]++;
      contentEl.on('mouseover', onMenuMouseOver, self);
      _$jscoverage['/combobox/control.js'].lineData[592]++;
      contentEl.on('mousedown', onMenuMouseDown, self);
    }
  }
  _$jscoverage['/combobox/control.js'].lineData[596]++;
  function onMenuItemClick(e) {
    _$jscoverage['/combobox/control.js'].functionData[26]++;
    _$jscoverage['/combobox/control.js'].lineData[597]++;
    var item = e.target, self = this, textContent;
    _$jscoverage['/combobox/control.js'].lineData[600]++;
    if (visit59_600_1(item.isMenuItem)) {
      _$jscoverage['/combobox/control.js'].lineData[601]++;
      textContent = item.get('textContent');
      _$jscoverage['/combobox/control.js'].lineData[602]++;
      self.setCurrentValue(textContent);
      _$jscoverage['/combobox/control.js'].lineData[603]++;
      self._savedValue = textContent;
      _$jscoverage['/combobox/control.js'].lineData[604]++;
      self.set('collapsed', true);
    }
  }
  _$jscoverage['/combobox/control.js'].lineData[608]++;
  function setInvalid(self, error) {
    _$jscoverage['/combobox/control.js'].functionData[27]++;
    _$jscoverage['/combobox/control.js'].lineData[609]++;
    var $el = self.$el, cls = self.view.getBaseCssClasses('invalid'), invalidEl = self.get('invalidEl');
    _$jscoverage['/combobox/control.js'].lineData[612]++;
    if (visit60_612_1(error)) {
      _$jscoverage['/combobox/control.js'].lineData[613]++;
      $el.addClass(cls);
      _$jscoverage['/combobox/control.js'].lineData[614]++;
      invalidEl.attr('title', error);
      _$jscoverage['/combobox/control.js'].lineData[615]++;
      invalidEl.show();
    } else {
      _$jscoverage['/combobox/control.js'].lineData[617]++;
      $el.removeClass(cls);
      _$jscoverage['/combobox/control.js'].lineData[618]++;
      invalidEl.hide();
    }
  }
  _$jscoverage['/combobox/control.js'].lineData[622]++;
  function delayHide(self) {
    _$jscoverage['/combobox/control.js'].functionData[28]++;
    _$jscoverage['/combobox/control.js'].lineData[623]++;
    if (visit61_623_1(self._focusoutDismissTimer)) {
      _$jscoverage['/combobox/control.js'].lineData[624]++;
      return;
    }
    _$jscoverage['/combobox/control.js'].lineData[626]++;
    self._focusoutDismissTimer = setTimeout(function() {
  _$jscoverage['/combobox/control.js'].functionData[29]++;
  _$jscoverage['/combobox/control.js'].lineData[628]++;
  if (visit62_628_1(self._focusoutDismissTimer)) {
    _$jscoverage['/combobox/control.js'].lineData[629]++;
    self.set('collapsed', true);
  }
}, 50);
  }
  _$jscoverage['/combobox/control.js'].lineData[636]++;
  function clearDismissTimer(self) {
    _$jscoverage['/combobox/control.js'].functionData[30]++;
    _$jscoverage['/combobox/control.js'].lineData[637]++;
    var t = self._focusoutDismissTimer;
    _$jscoverage['/combobox/control.js'].lineData[638]++;
    if (visit63_638_1(t)) {
      _$jscoverage['/combobox/control.js'].lineData[639]++;
      clearTimeout(t);
      _$jscoverage['/combobox/control.js'].lineData[640]++;
      self._focusoutDismissTimer = null;
    }
  }
  _$jscoverage['/combobox/control.js'].lineData[644]++;
  function onValueChange(e) {
    _$jscoverage['/combobox/control.js'].functionData[31]++;
    _$jscoverage['/combobox/control.js'].lineData[645]++;
    this.set('value', e.target.value, {
  data: {
  causedByInputEvent: 1}});
  }
  _$jscoverage['/combobox/control.js'].lineData[652]++;
  function renderData(data) {
    _$jscoverage['/combobox/control.js'].functionData[32]++;
    _$jscoverage['/combobox/control.js'].lineData[653]++;
    var self = this, v, children = [], val, matchVal, highlightedItem, i, menu = self.get('menu');
    _$jscoverage['/combobox/control.js'].lineData[662]++;
    data = self.normalizeData(data);
    _$jscoverage['/combobox/control.js'].lineData[664]++;
    menu.removeChildren(true);
    _$jscoverage['/combobox/control.js'].lineData[666]++;
    if ((highlightedItem = menu.get('highlightedItem'))) {
      _$jscoverage['/combobox/control.js'].lineData[667]++;
      highlightedItem.set('highlighted', false);
    }
    _$jscoverage['/combobox/control.js'].lineData[670]++;
    if (visit64_670_1(data && data.length)) {
      _$jscoverage['/combobox/control.js'].lineData[671]++;
      for (i = 0; visit65_671_1(i < data.length); i++) {
        _$jscoverage['/combobox/control.js'].lineData[672]++;
        v = data[i];
        _$jscoverage['/combobox/control.js'].lineData[673]++;
        menu.addChild(v);
      }
      _$jscoverage['/combobox/control.js'].lineData[676]++;
      children = menu.get('children');
      _$jscoverage['/combobox/control.js'].lineData[679]++;
      val = self.getCurrentValue();
      _$jscoverage['/combobox/control.js'].lineData[681]++;
      if (visit66_681_1(self.get('highlightMatchItem'))) {
        _$jscoverage['/combobox/control.js'].lineData[682]++;
        for (i = 0; visit67_682_1(i < children.length); i++) {
          _$jscoverage['/combobox/control.js'].lineData[683]++;
          if (visit68_683_1(children[i].get('textContent') === val)) {
            _$jscoverage['/combobox/control.js'].lineData[684]++;
            children[i].set('highlighted', true);
            _$jscoverage['/combobox/control.js'].lineData[685]++;
            matchVal = true;
            _$jscoverage['/combobox/control.js'].lineData[686]++;
            break;
          }
        }
      }
      _$jscoverage['/combobox/control.js'].lineData[692]++;
      if (visit69_692_1(!matchVal && self.get('autoHighlightFirst'))) {
        _$jscoverage['/combobox/control.js'].lineData[693]++;
        for (i = 0; visit70_693_1(i < children.length); i++) {
          _$jscoverage['/combobox/control.js'].lineData[694]++;
          if (visit71_694_1(!children[i].get('disabled'))) {
            _$jscoverage['/combobox/control.js'].lineData[695]++;
            children[i].set('highlighted', true);
            _$jscoverage['/combobox/control.js'].lineData[696]++;
            break;
          }
        }
      }
      _$jscoverage['/combobox/control.js'].lineData[700]++;
      self.set('collapsed', false);
      _$jscoverage['/combobox/control.js'].lineData[702]++;
      self.fire('afterRenderData');
    } else {
      _$jscoverage['/combobox/control.js'].lineData[704]++;
      self.set('collapsed', true);
    }
  }
  _$jscoverage['/combobox/control.js'].lineData[710]++;
  return ComboBox;
});
