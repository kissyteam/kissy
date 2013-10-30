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
  _$jscoverage['/combobox/control.js'].lineData[16] = 0;
  _$jscoverage['/combobox/control.js'].lineData[22] = 0;
  _$jscoverage['/combobox/control.js'].lineData[38] = 0;
  _$jscoverage['/combobox/control.js'].lineData[40] = 0;
  _$jscoverage['/combobox/control.js'].lineData[41] = 0;
  _$jscoverage['/combobox/control.js'].lineData[42] = 0;
  _$jscoverage['/combobox/control.js'].lineData[43] = 0;
  _$jscoverage['/combobox/control.js'].lineData[46] = 0;
  _$jscoverage['/combobox/control.js'].lineData[48] = 0;
  _$jscoverage['/combobox/control.js'].lineData[49] = 0;
  _$jscoverage['/combobox/control.js'].lineData[50] = 0;
  _$jscoverage['/combobox/control.js'].lineData[56] = 0;
  _$jscoverage['/combobox/control.js'].lineData[58] = 0;
  _$jscoverage['/combobox/control.js'].lineData[62] = 0;
  _$jscoverage['/combobox/control.js'].lineData[65] = 0;
  _$jscoverage['/combobox/control.js'].lineData[75] = 0;
  _$jscoverage['/combobox/control.js'].lineData[77] = 0;
  _$jscoverage['/combobox/control.js'].lineData[78] = 0;
  _$jscoverage['/combobox/control.js'].lineData[83] = 0;
  _$jscoverage['/combobox/control.js'].lineData[91] = 0;
  _$jscoverage['/combobox/control.js'].lineData[101] = 0;
  _$jscoverage['/combobox/control.js'].lineData[106] = 0;
  _$jscoverage['/combobox/control.js'].lineData[109] = 0;
  _$jscoverage['/combobox/control.js'].lineData[110] = 0;
  _$jscoverage['/combobox/control.js'].lineData[112] = 0;
  _$jscoverage['/combobox/control.js'].lineData[113] = 0;
  _$jscoverage['/combobox/control.js'].lineData[114] = 0;
  _$jscoverage['/combobox/control.js'].lineData[116] = 0;
  _$jscoverage['/combobox/control.js'].lineData[117] = 0;
  _$jscoverage['/combobox/control.js'].lineData[119] = 0;
  _$jscoverage['/combobox/control.js'].lineData[124] = 0;
  _$jscoverage['/combobox/control.js'].lineData[126] = 0;
  _$jscoverage['/combobox/control.js'].lineData[127] = 0;
  _$jscoverage['/combobox/control.js'].lineData[129] = 0;
  _$jscoverage['/combobox/control.js'].lineData[130] = 0;
  _$jscoverage['/combobox/control.js'].lineData[135] = 0;
  _$jscoverage['/combobox/control.js'].lineData[137] = 0;
  _$jscoverage['/combobox/control.js'].lineData[138] = 0;
  _$jscoverage['/combobox/control.js'].lineData[139] = 0;
  _$jscoverage['/combobox/control.js'].lineData[140] = 0;
  _$jscoverage['/combobox/control.js'].lineData[141] = 0;
  _$jscoverage['/combobox/control.js'].lineData[142] = 0;
  _$jscoverage['/combobox/control.js'].lineData[143] = 0;
  _$jscoverage['/combobox/control.js'].lineData[146] = 0;
  _$jscoverage['/combobox/control.js'].lineData[150] = 0;
  _$jscoverage['/combobox/control.js'].lineData[151] = 0;
  _$jscoverage['/combobox/control.js'].lineData[156] = 0;
  _$jscoverage['/combobox/control.js'].lineData[159] = 0;
  _$jscoverage['/combobox/control.js'].lineData[160] = 0;
  _$jscoverage['/combobox/control.js'].lineData[161] = 0;
  _$jscoverage['/combobox/control.js'].lineData[162] = 0;
  _$jscoverage['/combobox/control.js'].lineData[163] = 0;
  _$jscoverage['/combobox/control.js'].lineData[165] = 0;
  _$jscoverage['/combobox/control.js'].lineData[166] = 0;
  _$jscoverage['/combobox/control.js'].lineData[169] = 0;
  _$jscoverage['/combobox/control.js'].lineData[171] = 0;
  _$jscoverage['/combobox/control.js'].lineData[176] = 0;
  _$jscoverage['/combobox/control.js'].lineData[184] = 0;
  _$jscoverage['/combobox/control.js'].lineData[185] = 0;
  _$jscoverage['/combobox/control.js'].lineData[187] = 0;
  _$jscoverage['/combobox/control.js'].lineData[189] = 0;
  _$jscoverage['/combobox/control.js'].lineData[193] = 0;
  _$jscoverage['/combobox/control.js'].lineData[194] = 0;
  _$jscoverage['/combobox/control.js'].lineData[195] = 0;
  _$jscoverage['/combobox/control.js'].lineData[201] = 0;
  _$jscoverage['/combobox/control.js'].lineData[202] = 0;
  _$jscoverage['/combobox/control.js'].lineData[203] = 0;
  _$jscoverage['/combobox/control.js'].lineData[207] = 0;
  _$jscoverage['/combobox/control.js'].lineData[209] = 0;
  _$jscoverage['/combobox/control.js'].lineData[212] = 0;
  _$jscoverage['/combobox/control.js'].lineData[213] = 0;
  _$jscoverage['/combobox/control.js'].lineData[214] = 0;
  _$jscoverage['/combobox/control.js'].lineData[218] = 0;
  _$jscoverage['/combobox/control.js'].lineData[220] = 0;
  _$jscoverage['/combobox/control.js'].lineData[223] = 0;
  _$jscoverage['/combobox/control.js'].lineData[226] = 0;
  _$jscoverage['/combobox/control.js'].lineData[231] = 0;
  _$jscoverage['/combobox/control.js'].lineData[233] = 0;
  _$jscoverage['/combobox/control.js'].lineData[235] = 0;
  _$jscoverage['/combobox/control.js'].lineData[236] = 0;
  _$jscoverage['/combobox/control.js'].lineData[240] = 0;
  _$jscoverage['/combobox/control.js'].lineData[241] = 0;
  _$jscoverage['/combobox/control.js'].lineData[243] = 0;
  _$jscoverage['/combobox/control.js'].lineData[244] = 0;
  _$jscoverage['/combobox/control.js'].lineData[245] = 0;
  _$jscoverage['/combobox/control.js'].lineData[246] = 0;
  _$jscoverage['/combobox/control.js'].lineData[249] = 0;
  _$jscoverage['/combobox/control.js'].lineData[253] = 0;
  _$jscoverage['/combobox/control.js'].lineData[257] = 0;
  _$jscoverage['/combobox/control.js'].lineData[258] = 0;
  _$jscoverage['/combobox/control.js'].lineData[259] = 0;
  _$jscoverage['/combobox/control.js'].lineData[262] = 0;
  _$jscoverage['/combobox/control.js'].lineData[271] = 0;
  _$jscoverage['/combobox/control.js'].lineData[273] = 0;
  _$jscoverage['/combobox/control.js'].lineData[277] = 0;
  _$jscoverage['/combobox/control.js'].lineData[280] = 0;
  _$jscoverage['/combobox/control.js'].lineData[281] = 0;
  _$jscoverage['/combobox/control.js'].lineData[284] = 0;
  _$jscoverage['/combobox/control.js'].lineData[285] = 0;
  _$jscoverage['/combobox/control.js'].lineData[286] = 0;
  _$jscoverage['/combobox/control.js'].lineData[287] = 0;
  _$jscoverage['/combobox/control.js'].lineData[288] = 0;
  _$jscoverage['/combobox/control.js'].lineData[289] = 0;
  _$jscoverage['/combobox/control.js'].lineData[292] = 0;
  _$jscoverage['/combobox/control.js'].lineData[294] = 0;
  _$jscoverage['/combobox/control.js'].lineData[403] = 0;
  _$jscoverage['/combobox/control.js'].lineData[404] = 0;
  _$jscoverage['/combobox/control.js'].lineData[405] = 0;
  _$jscoverage['/combobox/control.js'].lineData[406] = 0;
  _$jscoverage['/combobox/control.js'].lineData[408] = 0;
  _$jscoverage['/combobox/control.js'].lineData[411] = 0;
  _$jscoverage['/combobox/control.js'].lineData[412] = 0;
  _$jscoverage['/combobox/control.js'].lineData[413] = 0;
  _$jscoverage['/combobox/control.js'].lineData[421] = 0;
  _$jscoverage['/combobox/control.js'].lineData[529] = 0;
  _$jscoverage['/combobox/control.js'].lineData[530] = 0;
  _$jscoverage['/combobox/control.js'].lineData[531] = 0;
  _$jscoverage['/combobox/control.js'].lineData[532] = 0;
  _$jscoverage['/combobox/control.js'].lineData[535] = 0;
  _$jscoverage['/combobox/control.js'].lineData[538] = 0;
  _$jscoverage['/combobox/control.js'].lineData[539] = 0;
  _$jscoverage['/combobox/control.js'].lineData[540] = 0;
  _$jscoverage['/combobox/control.js'].lineData[543] = 0;
  _$jscoverage['/combobox/control.js'].lineData[544] = 0;
  _$jscoverage['/combobox/control.js'].lineData[548] = 0;
  _$jscoverage['/combobox/control.js'].lineData[549] = 0;
  _$jscoverage['/combobox/control.js'].lineData[553] = 0;
  _$jscoverage['/combobox/control.js'].lineData[554] = 0;
  _$jscoverage['/combobox/control.js'].lineData[556] = 0;
  _$jscoverage['/combobox/control.js'].lineData[558] = 0;
  _$jscoverage['/combobox/control.js'].lineData[561] = 0;
  _$jscoverage['/combobox/control.js'].lineData[562] = 0;
  _$jscoverage['/combobox/control.js'].lineData[566] = 0;
  _$jscoverage['/combobox/control.js'].lineData[571] = 0;
  _$jscoverage['/combobox/control.js'].lineData[572] = 0;
  _$jscoverage['/combobox/control.js'].lineData[573] = 0;
  _$jscoverage['/combobox/control.js'].lineData[574] = 0;
  _$jscoverage['/combobox/control.js'].lineData[575] = 0;
  _$jscoverage['/combobox/control.js'].lineData[576] = 0;
  _$jscoverage['/combobox/control.js'].lineData[578] = 0;
  _$jscoverage['/combobox/control.js'].lineData[579] = 0;
  _$jscoverage['/combobox/control.js'].lineData[580] = 0;
  _$jscoverage['/combobox/control.js'].lineData[583] = 0;
  _$jscoverage['/combobox/control.js'].lineData[586] = 0;
  _$jscoverage['/combobox/control.js'].lineData[587] = 0;
  _$jscoverage['/combobox/control.js'].lineData[590] = 0;
  _$jscoverage['/combobox/control.js'].lineData[591] = 0;
  _$jscoverage['/combobox/control.js'].lineData[592] = 0;
  _$jscoverage['/combobox/control.js'].lineData[593] = 0;
  _$jscoverage['/combobox/control.js'].lineData[594] = 0;
  _$jscoverage['/combobox/control.js'].lineData[598] = 0;
  _$jscoverage['/combobox/control.js'].lineData[599] = 0;
  _$jscoverage['/combobox/control.js'].lineData[602] = 0;
  _$jscoverage['/combobox/control.js'].lineData[603] = 0;
  _$jscoverage['/combobox/control.js'].lineData[604] = 0;
  _$jscoverage['/combobox/control.js'].lineData[605] = 0;
  _$jscoverage['/combobox/control.js'].lineData[607] = 0;
  _$jscoverage['/combobox/control.js'].lineData[608] = 0;
  _$jscoverage['/combobox/control.js'].lineData[612] = 0;
  _$jscoverage['/combobox/control.js'].lineData[613] = 0;
  _$jscoverage['/combobox/control.js'].lineData[614] = 0;
  _$jscoverage['/combobox/control.js'].lineData[616] = 0;
  _$jscoverage['/combobox/control.js'].lineData[618] = 0;
  _$jscoverage['/combobox/control.js'].lineData[619] = 0;
  _$jscoverage['/combobox/control.js'].lineData[626] = 0;
  _$jscoverage['/combobox/control.js'].lineData[627] = 0;
  _$jscoverage['/combobox/control.js'].lineData[628] = 0;
  _$jscoverage['/combobox/control.js'].lineData[629] = 0;
  _$jscoverage['/combobox/control.js'].lineData[630] = 0;
  _$jscoverage['/combobox/control.js'].lineData[634] = 0;
  _$jscoverage['/combobox/control.js'].lineData[635] = 0;
  _$jscoverage['/combobox/control.js'].lineData[642] = 0;
  _$jscoverage['/combobox/control.js'].lineData[643] = 0;
  _$jscoverage['/combobox/control.js'].lineData[652] = 0;
  _$jscoverage['/combobox/control.js'].lineData[654] = 0;
  _$jscoverage['/combobox/control.js'].lineData[656] = 0;
  _$jscoverage['/combobox/control.js'].lineData[657] = 0;
  _$jscoverage['/combobox/control.js'].lineData[660] = 0;
  _$jscoverage['/combobox/control.js'].lineData[661] = 0;
  _$jscoverage['/combobox/control.js'].lineData[662] = 0;
  _$jscoverage['/combobox/control.js'].lineData[663] = 0;
  _$jscoverage['/combobox/control.js'].lineData[666] = 0;
  _$jscoverage['/combobox/control.js'].lineData[669] = 0;
  _$jscoverage['/combobox/control.js'].lineData[671] = 0;
  _$jscoverage['/combobox/control.js'].lineData[672] = 0;
  _$jscoverage['/combobox/control.js'].lineData[673] = 0;
  _$jscoverage['/combobox/control.js'].lineData[674] = 0;
  _$jscoverage['/combobox/control.js'].lineData[675] = 0;
  _$jscoverage['/combobox/control.js'].lineData[676] = 0;
  _$jscoverage['/combobox/control.js'].lineData[682] = 0;
  _$jscoverage['/combobox/control.js'].lineData[683] = 0;
  _$jscoverage['/combobox/control.js'].lineData[684] = 0;
  _$jscoverage['/combobox/control.js'].lineData[685] = 0;
  _$jscoverage['/combobox/control.js'].lineData[686] = 0;
  _$jscoverage['/combobox/control.js'].lineData[691] = 0;
  _$jscoverage['/combobox/control.js'].lineData[692] = 0;
  _$jscoverage['/combobox/control.js'].lineData[694] = 0;
  _$jscoverage['/combobox/control.js'].lineData[700] = 0;
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
}
if (! _$jscoverage['/combobox/control.js'].branchData) {
  _$jscoverage['/combobox/control.js'].branchData = {};
  _$jscoverage['/combobox/control.js'].branchData['40'] = [];
  _$jscoverage['/combobox/control.js'].branchData['40'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['42'] = [];
  _$jscoverage['/combobox/control.js'].branchData['42'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['48'] = [];
  _$jscoverage['/combobox/control.js'].branchData['48'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['109'] = [];
  _$jscoverage['/combobox/control.js'].branchData['109'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['112'] = [];
  _$jscoverage['/combobox/control.js'].branchData['112'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['126'] = [];
  _$jscoverage['/combobox/control.js'].branchData['126'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['129'] = [];
  _$jscoverage['/combobox/control.js'].branchData['129'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['139'] = [];
  _$jscoverage['/combobox/control.js'].branchData['139'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['141'] = [];
  _$jscoverage['/combobox/control.js'].branchData['141'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['142'] = [];
  _$jscoverage['/combobox/control.js'].branchData['142'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['142'][2] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['150'] = [];
  _$jscoverage['/combobox/control.js'].branchData['150'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['162'] = [];
  _$jscoverage['/combobox/control.js'].branchData['162'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['162'][2] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['162'][3] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['163'] = [];
  _$jscoverage['/combobox/control.js'].branchData['163'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['187'] = [];
  _$jscoverage['/combobox/control.js'].branchData['187'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['193'] = [];
  _$jscoverage['/combobox/control.js'].branchData['193'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['195'] = [];
  _$jscoverage['/combobox/control.js'].branchData['195'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['195'][2] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['195'][3] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['196'] = [];
  _$jscoverage['/combobox/control.js'].branchData['196'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['198'] = [];
  _$jscoverage['/combobox/control.js'].branchData['198'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['198'][2] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['199'] = [];
  _$jscoverage['/combobox/control.js'].branchData['199'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['212'] = [];
  _$jscoverage['/combobox/control.js'].branchData['212'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['214'] = [];
  _$jscoverage['/combobox/control.js'].branchData['214'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['223'] = [];
  _$jscoverage['/combobox/control.js'].branchData['223'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['231'] = [];
  _$jscoverage['/combobox/control.js'].branchData['231'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['231'][2] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['235'] = [];
  _$jscoverage['/combobox/control.js'].branchData['235'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['241'] = [];
  _$jscoverage['/combobox/control.js'].branchData['241'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['241'][2] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['241'][3] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['244'] = [];
  _$jscoverage['/combobox/control.js'].branchData['244'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['257'] = [];
  _$jscoverage['/combobox/control.js'].branchData['257'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['280'] = [];
  _$jscoverage['/combobox/control.js'].branchData['280'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['285'] = [];
  _$jscoverage['/combobox/control.js'].branchData['285'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['286'] = [];
  _$jscoverage['/combobox/control.js'].branchData['286'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['290'] = [];
  _$jscoverage['/combobox/control.js'].branchData['290'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['291'] = [];
  _$jscoverage['/combobox/control.js'].branchData['291'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['403'] = [];
  _$jscoverage['/combobox/control.js'].branchData['403'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['404'] = [];
  _$jscoverage['/combobox/control.js'].branchData['404'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['411'] = [];
  _$jscoverage['/combobox/control.js'].branchData['411'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['530'] = [];
  _$jscoverage['/combobox/control.js'].branchData['530'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['531'] = [];
  _$jscoverage['/combobox/control.js'].branchData['531'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['590'] = [];
  _$jscoverage['/combobox/control.js'].branchData['590'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['602'] = [];
  _$jscoverage['/combobox/control.js'].branchData['602'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['613'] = [];
  _$jscoverage['/combobox/control.js'].branchData['613'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['618'] = [];
  _$jscoverage['/combobox/control.js'].branchData['618'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['628'] = [];
  _$jscoverage['/combobox/control.js'].branchData['628'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['656'] = [];
  _$jscoverage['/combobox/control.js'].branchData['656'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['660'] = [];
  _$jscoverage['/combobox/control.js'].branchData['660'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['661'] = [];
  _$jscoverage['/combobox/control.js'].branchData['661'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['671'] = [];
  _$jscoverage['/combobox/control.js'].branchData['671'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['672'] = [];
  _$jscoverage['/combobox/control.js'].branchData['672'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['673'] = [];
  _$jscoverage['/combobox/control.js'].branchData['673'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['682'] = [];
  _$jscoverage['/combobox/control.js'].branchData['682'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['683'] = [];
  _$jscoverage['/combobox/control.js'].branchData['683'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['684'] = [];
  _$jscoverage['/combobox/control.js'].branchData['684'][1] = new BranchData();
}
_$jscoverage['/combobox/control.js'].branchData['684'][1].init(26, 28, '!children[i].get("disabled")');
function visit60_684_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['684'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['683'][1].init(30, 19, 'i < children.length');
function visit59_683_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['683'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['682'][1].init(777, 43, '!matchVal && self.get("autoHighlightFirst")');
function visit58_682_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['682'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['673'][1].init(26, 37, 'children[i].get("textContent") == val');
function visit57_673_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['673'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['672'][1].init(30, 19, 'i < children.length');
function visit56_672_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['672'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['671'][1].init(328, 30, 'self.get(\'highlightMatchItem\')');
function visit55_671_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['671'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['661'][1].init(26, 15, 'i < data.length');
function visit54_661_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['661'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['660'][1].init(427, 19, 'data && data.length');
function visit53_660_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['660'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['656'][1].init(296, 45, 'highlightedItem = menu.get(\'highlightedItem\')');
function visit52_656_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['656'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['628'][1].init(30, 30, 't = self._focusoutDismissTimer');
function visit51_628_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['628'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['618'][1].init(50, 26, 'self._focusoutDismissTimer');
function visit50_618_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['618'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['613'][1].init(14, 26, 'self._focusoutDismissTimer');
function visit49_613_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['613'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['602'][1].init(150, 5, 'error');
function visit48_602_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['602'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['590'][1].init(96, 15, 'item.isMenuItem');
function visit47_590_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['590'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['531'][1].init(18, 28, '!children[i].get(\'disabled\')');
function visit46_531_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['531'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['530'][1].init(26, 19, 'i < children.length');
function visit45_530_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['530'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['411'][1].init(30, 11, 'm.isControl');
function visit44_411_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['411'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['404'][1].init(41, 23, 'v.xclass || \'popupmenu\'');
function visit43_404_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['404'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['403'][1].init(30, 12, '!v.isControl');
function visit42_403_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['403'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['291'][1].init(85, 45, 'parseInt(menuEl.css(\'borderRightWidth\')) || 0');
function visit41_291_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['291'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['290'][1].init(47, 44, 'parseInt(menuEl.css(\'borderLeftWidth\')) || 0');
function visit40_290_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['290'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['286'][1].init(30, 24, 'self.get("matchElWidth")');
function visit39_286_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['286'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['285'][1].init(119, 20, '!menu.get("visible")');
function visit38_285_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['285'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['280'][1].init(138, 1, 'v');
function visit37_280_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['280'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['257'][1].init(173, 9, 'validator');
function visit36_257_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['257'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['244'][1].init(145, 15, 'v !== undefined');
function visit35_244_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['244'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['241'][3].init(3024, 21, 'keyCode == KeyCode.UP');
function visit34_241_3(result) {
  _$jscoverage['/combobox/control.js'].branchData['241'][3].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['241'][2].init(2997, 23, 'keyCode == KeyCode.DOWN');
function visit33_241_2(result) {
  _$jscoverage['/combobox/control.js'].branchData['241'][2].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['241'][1].init(2997, 48, 'keyCode == KeyCode.DOWN || keyCode == KeyCode.UP');
function visit32_241_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['241'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['235'][1].init(215, 20, 'self.get("multiple")');
function visit31_235_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['235'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['231'][2].init(2118, 22, 'keyCode == KeyCode.TAB');
function visit30_231_2(result) {
  _$jscoverage['/combobox/control.js'].branchData['231'][2].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['231'][1].init(2118, 41, 'keyCode == KeyCode.TAB && highlightedItem');
function visit29_231_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['231'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['223'][1].init(1681, 94, 'updateInputOnDownUp && S.inArray(keyCode, [KeyCode.DOWN, KeyCode.UP])');
function visit28_223_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['223'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['214'][1].init(84, 19, 'updateInputOnDownUp');
function visit27_214_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['214'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['212'][1].init(1156, 22, 'keyCode == KeyCode.ESC');
function visit26_212_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['212'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['199'][1].init(57, 52, 'highlightedItem == getFirstEnabledItem(menuChildren)');
function visit25_199_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['199'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['198'][2].init(287, 21, 'keyCode == KeyCode.UP');
function visit24_198_2(result) {
  _$jscoverage['/combobox/control.js'].branchData['198'][2].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['198'][1].init(188, 110, 'keyCode == KeyCode.UP && highlightedItem == getFirstEnabledItem(menuChildren)');
function visit23_198_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['198'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['196'][1].init(55, 71, 'highlightedItem == getFirstEnabledItem(menuChildren.concat().reverse())');
function visit22_196_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['196'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['195'][3].init(96, 23, 'keyCode == KeyCode.DOWN');
function visit21_195_3(result) {
  _$jscoverage['/combobox/control.js'].branchData['195'][3].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['195'][2].init(96, 127, 'keyCode == KeyCode.DOWN && highlightedItem == getFirstEnabledItem(menuChildren.concat().reverse())');
function visit20_195_2(result) {
  _$jscoverage['/combobox/control.js'].branchData['195'][2].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['195'][1].init(96, 299, 'keyCode == KeyCode.DOWN && highlightedItem == getFirstEnabledItem(menuChildren.concat().reverse()) || keyCode == KeyCode.UP && highlightedItem == getFirstEnabledItem(menuChildren)');
function visit19_195_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['195'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['193'][1].init(249, 38, 'updateInputOnDownUp && highlightedItem');
function visit18_193_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['193'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['187'][1].init(408, 19, 'menu.get("visible")');
function visit17_187_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['187'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['163'][1].init(26, 21, 'self.get(\'collapsed\')');
function visit16_163_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['163'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['162'][3].init(247, 20, 'trigger[0] == target');
function visit15_162_3(result) {
  _$jscoverage['/combobox/control.js'].branchData['162'][3].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['162'][2].init(247, 48, 'trigger[0] == target || trigger.contains(target)');
function visit14_162_2(result) {
  _$jscoverage['/combobox/control.js'].branchData['162'][2].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['162'][1].init(235, 61, 'trigger && (trigger[0] == target || trigger.contains(target))');
function visit13_162_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['162'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['150'][1].init(666, 35, 'placeholderEl && !self.get(\'value\')');
function visit12_150_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['150'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['142'][2].init(58, 24, 'val == self.get(\'value\')');
function visit11_142_2(result) {
  _$jscoverage['/combobox/control.js'].branchData['142'][2].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['142'][1].init(34, 48, '!self.get("focused") && val == self.get(\'value\')');
function visit10_142_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['142'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['141'][1].init(30, 5, 'error');
function visit9_141_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['141'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['139'][1].init(190, 21, 'self.get(\'invalidEl\')');
function visit8_139_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['139'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['129'][1].init(203, 41, 'placeholderEl = self.get("placeholderEl")');
function visit7_129_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['129'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['126'][1].init(92, 21, 'self.get(\'invalidEl\')');
function visit6_126_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['126'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['112'][1].init(150, 19, 'value === undefined');
function visit5_112_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['112'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['109'][1].init(146, 15, 'e.causedByTimer');
function visit4_109_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['109'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['48'][1].init(377, 15, 'i < data.length');
function visit3_48_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['48'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['42'][1].init(95, 18, 'self.get("format")');
function visit2_42_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['42'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['40'][1].init(96, 19, 'data && data.length');
function visit1_40_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['40'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].lineData[6]++;
KISSY.add("combobox/control", function(S, Node, Control, ComboBoxRender, Menu, undefined) {
  _$jscoverage['/combobox/control.js'].functionData[0]++;
  _$jscoverage['/combobox/control.js'].lineData[7]++;
  var ComboBox, KeyCode = Node.KeyCode;
  _$jscoverage['/combobox/control.js'].lineData[16]++;
  ComboBox = Control.extend([], {
  initializer: function() {
  _$jscoverage['/combobox/control.js'].functionData[1]++;
  _$jscoverage['/combobox/control.js'].lineData[22]++;
  this.publish('afterRenderData', {
  bubbles: false});
}, 
  _savedValue: null, 
  'normalizeData': function(data) {
  _$jscoverage['/combobox/control.js'].functionData[2]++;
  _$jscoverage['/combobox/control.js'].lineData[38]++;
  var self = this, contents, v, i, c;
  _$jscoverage['/combobox/control.js'].lineData[40]++;
  if (visit1_40_1(data && data.length)) {
    _$jscoverage['/combobox/control.js'].lineData[41]++;
    data = data.slice(0, self.get("maxItemCount"));
    _$jscoverage['/combobox/control.js'].lineData[42]++;
    if (visit2_42_1(self.get("format"))) {
      _$jscoverage['/combobox/control.js'].lineData[43]++;
      contents = self.get("format").call(self, self.getValueForAutocomplete(), data);
    } else {
      _$jscoverage['/combobox/control.js'].lineData[46]++;
      contents = [];
    }
    _$jscoverage['/combobox/control.js'].lineData[48]++;
    for (i = 0; visit3_48_1(i < data.length); i++) {
      _$jscoverage['/combobox/control.js'].lineData[49]++;
      v = data[i];
      _$jscoverage['/combobox/control.js'].lineData[50]++;
      c = contents[i] = S.mix({
  content: v, 
  textContent: v, 
  value: v}, contents[i]);
    }
    _$jscoverage['/combobox/control.js'].lineData[56]++;
    return contents;
  }
  _$jscoverage['/combobox/control.js'].lineData[58]++;
  return contents;
}, 
  bindUI: function() {
  _$jscoverage['/combobox/control.js'].functionData[3]++;
  _$jscoverage['/combobox/control.js'].lineData[62]++;
  var self = this, input = self.get("input");
  _$jscoverage['/combobox/control.js'].lineData[65]++;
  input.on("valuechange", onValueChange, self);
  _$jscoverage['/combobox/control.js'].lineData[75]++;
  self.on('click', onMenuItemClick, self);
  _$jscoverage['/combobox/control.js'].lineData[77]++;
  self.get('menu').onRendered(function(menu) {
  _$jscoverage['/combobox/control.js'].functionData[4]++;
  _$jscoverage['/combobox/control.js'].lineData[78]++;
  onMenuAfterRenderUI(self, menu);
});
}, 
  destructor: function() {
  _$jscoverage['/combobox/control.js'].functionData[5]++;
  _$jscoverage['/combobox/control.js'].lineData[83]++;
  this.get('menu').destroy();
}, 
  getValueForAutocomplete: function() {
  _$jscoverage['/combobox/control.js'].functionData[6]++;
  _$jscoverage['/combobox/control.js'].lineData[91]++;
  return this.get('value');
}, 
  setValueFromAutocomplete: function(value, setCfg) {
  _$jscoverage['/combobox/control.js'].functionData[7]++;
  _$jscoverage['/combobox/control.js'].lineData[101]++;
  this.set('value', value, setCfg);
}, 
  '_onSetValue': function(v, e) {
  _$jscoverage['/combobox/control.js'].functionData[8]++;
  _$jscoverage['/combobox/control.js'].lineData[106]++;
  var self = this, value;
  _$jscoverage['/combobox/control.js'].lineData[109]++;
  if (visit4_109_1(e.causedByTimer)) {
    _$jscoverage['/combobox/control.js'].lineData[110]++;
    value = self['getValueForAutocomplete']();
    _$jscoverage['/combobox/control.js'].lineData[112]++;
    if (visit5_112_1(value === undefined)) {
      _$jscoverage['/combobox/control.js'].lineData[113]++;
      self.set("collapsed", true);
      _$jscoverage['/combobox/control.js'].lineData[114]++;
      return;
    }
    _$jscoverage['/combobox/control.js'].lineData[116]++;
    self._savedValue = value;
    _$jscoverage['/combobox/control.js'].lineData[117]++;
    self.sendRequest(value);
  } else {
    _$jscoverage['/combobox/control.js'].lineData[119]++;
    self.get('input').val(v);
  }
}, 
  handleFocusInternal: function() {
  _$jscoverage['/combobox/control.js'].functionData[9]++;
  _$jscoverage['/combobox/control.js'].lineData[124]++;
  var self = this, placeholderEl;
  _$jscoverage['/combobox/control.js'].lineData[126]++;
  if (visit6_126_1(self.get('invalidEl'))) {
    _$jscoverage['/combobox/control.js'].lineData[127]++;
    setInvalid(self, false);
  }
  _$jscoverage['/combobox/control.js'].lineData[129]++;
  if (visit7_129_1(placeholderEl = self.get("placeholderEl"))) {
    _$jscoverage['/combobox/control.js'].lineData[130]++;
    placeholderEl.hide();
  }
}, 
  handleBlurInternal: function(e) {
  _$jscoverage['/combobox/control.js'].functionData[10]++;
  _$jscoverage['/combobox/control.js'].lineData[135]++;
  var self = this, placeholderEl = self.get("placeholderEl");
  _$jscoverage['/combobox/control.js'].lineData[137]++;
  self.callSuper(e);
  _$jscoverage['/combobox/control.js'].lineData[138]++;
  delayHide(self);
  _$jscoverage['/combobox/control.js'].lineData[139]++;
  if (visit8_139_1(self.get('invalidEl'))) {
    _$jscoverage['/combobox/control.js'].lineData[140]++;
    self.validate(function(error, val) {
  _$jscoverage['/combobox/control.js'].functionData[11]++;
  _$jscoverage['/combobox/control.js'].lineData[141]++;
  if (visit9_141_1(error)) {
    _$jscoverage['/combobox/control.js'].lineData[142]++;
    if (visit10_142_1(!self.get("focused") && visit11_142_2(val == self.get('value')))) {
      _$jscoverage['/combobox/control.js'].lineData[143]++;
      setInvalid(self, error);
    }
  } else {
    _$jscoverage['/combobox/control.js'].lineData[146]++;
    setInvalid(self, false);
  }
});
  }
  _$jscoverage['/combobox/control.js'].lineData[150]++;
  if (visit12_150_1(placeholderEl && !self.get('value'))) {
    _$jscoverage['/combobox/control.js'].lineData[151]++;
    placeholderEl.show();
  }
}, 
  handleMouseDownInternal: function(e) {
  _$jscoverage['/combobox/control.js'].functionData[12]++;
  _$jscoverage['/combobox/control.js'].lineData[156]++;
  var self = this, target, trigger;
  _$jscoverage['/combobox/control.js'].lineData[159]++;
  self.callSuper(e);
  _$jscoverage['/combobox/control.js'].lineData[160]++;
  target = e.target;
  _$jscoverage['/combobox/control.js'].lineData[161]++;
  trigger = self.get("trigger");
  _$jscoverage['/combobox/control.js'].lineData[162]++;
  if (visit13_162_1(trigger && (visit14_162_2(visit15_162_3(trigger[0] == target) || trigger.contains(target))))) {
    _$jscoverage['/combobox/control.js'].lineData[163]++;
    if (visit16_163_1(self.get('collapsed'))) {
      _$jscoverage['/combobox/control.js'].lineData[165]++;
      self.focus();
      _$jscoverage['/combobox/control.js'].lineData[166]++;
      self.sendRequest('');
    } else {
      _$jscoverage['/combobox/control.js'].lineData[169]++;
      self.set('collapsed', true);
    }
    _$jscoverage['/combobox/control.js'].lineData[171]++;
    e.preventDefault();
  }
}, 
  handleKeyDownInternal: function(e) {
  _$jscoverage['/combobox/control.js'].functionData[13]++;
  _$jscoverage['/combobox/control.js'].lineData[176]++;
  var self = this, updateInputOnDownUp, input, keyCode = e.keyCode, highlightedItem, handledByMenu, menu = self.get("menu");
  _$jscoverage['/combobox/control.js'].lineData[184]++;
  input = self.get("input");
  _$jscoverage['/combobox/control.js'].lineData[185]++;
  updateInputOnDownUp = self.get("updateInputOnDownUp");
  _$jscoverage['/combobox/control.js'].lineData[187]++;
  if (visit17_187_1(menu.get("visible"))) {
    _$jscoverage['/combobox/control.js'].lineData[189]++;
    highlightedItem = menu.get("highlightedItem");
    _$jscoverage['/combobox/control.js'].lineData[193]++;
    if (visit18_193_1(updateInputOnDownUp && highlightedItem)) {
      _$jscoverage['/combobox/control.js'].lineData[194]++;
      var menuChildren = menu.get('children');
      _$jscoverage['/combobox/control.js'].lineData[195]++;
      if (visit19_195_1(visit20_195_2(visit21_195_3(keyCode == KeyCode.DOWN) && visit22_196_1(highlightedItem == getFirstEnabledItem(menuChildren.concat().reverse()))) || visit23_198_1(visit24_198_2(keyCode == KeyCode.UP) && visit25_199_1(highlightedItem == getFirstEnabledItem(menuChildren))))) {
        _$jscoverage['/combobox/control.js'].lineData[201]++;
        self.setValueFromAutocomplete(self._savedValue);
        _$jscoverage['/combobox/control.js'].lineData[202]++;
        highlightedItem.set('highlighted', false);
        _$jscoverage['/combobox/control.js'].lineData[203]++;
        return true;
      }
    }
    _$jscoverage['/combobox/control.js'].lineData[207]++;
    handledByMenu = menu.handleKeyDownInternal(e);
    _$jscoverage['/combobox/control.js'].lineData[209]++;
    highlightedItem = menu.get("highlightedItem");
    _$jscoverage['/combobox/control.js'].lineData[212]++;
    if (visit26_212_1(keyCode == KeyCode.ESC)) {
      _$jscoverage['/combobox/control.js'].lineData[213]++;
      self.set("collapsed", true);
      _$jscoverage['/combobox/control.js'].lineData[214]++;
      if (visit27_214_1(updateInputOnDownUp)) {
        _$jscoverage['/combobox/control.js'].lineData[218]++;
        self.setValueFromAutocomplete(self._savedValue);
      }
      _$jscoverage['/combobox/control.js'].lineData[220]++;
      return true;
    }
    _$jscoverage['/combobox/control.js'].lineData[223]++;
    if (visit28_223_1(updateInputOnDownUp && S.inArray(keyCode, [KeyCode.DOWN, KeyCode.UP]))) {
      _$jscoverage['/combobox/control.js'].lineData[226]++;
      self.setValueFromAutocomplete(highlightedItem.get("textContent"));
    }
    _$jscoverage['/combobox/control.js'].lineData[231]++;
    if (visit29_231_1(visit30_231_2(keyCode == KeyCode.TAB) && highlightedItem)) {
      _$jscoverage['/combobox/control.js'].lineData[233]++;
      highlightedItem.handleClickInternal();
      _$jscoverage['/combobox/control.js'].lineData[235]++;
      if (visit31_235_1(self.get("multiple"))) {
        _$jscoverage['/combobox/control.js'].lineData[236]++;
        return true;
      }
    }
    _$jscoverage['/combobox/control.js'].lineData[240]++;
    return handledByMenu;
  } else {
    _$jscoverage['/combobox/control.js'].lineData[241]++;
    if (visit32_241_1(visit33_241_2(keyCode == KeyCode.DOWN) || visit34_241_3(keyCode == KeyCode.UP))) {
      _$jscoverage['/combobox/control.js'].lineData[243]++;
      var v = self.getValueForAutocomplete();
      _$jscoverage['/combobox/control.js'].lineData[244]++;
      if (visit35_244_1(v !== undefined)) {
        _$jscoverage['/combobox/control.js'].lineData[245]++;
        self.sendRequest(v);
        _$jscoverage['/combobox/control.js'].lineData[246]++;
        return true;
      }
    }
  }
  _$jscoverage['/combobox/control.js'].lineData[249]++;
  return undefined;
}, 
  validate: function(callback) {
  _$jscoverage['/combobox/control.js'].functionData[14]++;
  _$jscoverage['/combobox/control.js'].lineData[253]++;
  var self = this, validator = self.get('validator'), val = self.getValueForAutocomplete();
  _$jscoverage['/combobox/control.js'].lineData[257]++;
  if (visit36_257_1(validator)) {
    _$jscoverage['/combobox/control.js'].lineData[258]++;
    validator(val, function(error) {
  _$jscoverage['/combobox/control.js'].functionData[15]++;
  _$jscoverage['/combobox/control.js'].lineData[259]++;
  callback(error, val);
});
  } else {
    _$jscoverage['/combobox/control.js'].lineData[262]++;
    callback(false, val);
  }
}, 
  sendRequest: function(value) {
  _$jscoverage['/combobox/control.js'].functionData[16]++;
  _$jscoverage['/combobox/control.js'].lineData[271]++;
  var self = this, dataSource = self.get("dataSource");
  _$jscoverage['/combobox/control.js'].lineData[273]++;
  dataSource.fetchData(value, renderData, self);
}, 
  _onSetCollapsed: function(v) {
  _$jscoverage['/combobox/control.js'].functionData[17]++;
  _$jscoverage['/combobox/control.js'].lineData[277]++;
  var self = this, el = self.$el, menu = self.get('menu');
  _$jscoverage['/combobox/control.js'].lineData[280]++;
  if (visit37_280_1(v)) {
    _$jscoverage['/combobox/control.js'].lineData[281]++;
    menu.hide();
  } else {
    _$jscoverage['/combobox/control.js'].lineData[284]++;
    clearDismissTimer(self);
    _$jscoverage['/combobox/control.js'].lineData[285]++;
    if (visit38_285_1(!menu.get("visible"))) {
      _$jscoverage['/combobox/control.js'].lineData[286]++;
      if (visit39_286_1(self.get("matchElWidth"))) {
        _$jscoverage['/combobox/control.js'].lineData[287]++;
        menu.render();
        _$jscoverage['/combobox/control.js'].lineData[288]++;
        var menuEl = menu.get('el');
        _$jscoverage['/combobox/control.js'].lineData[289]++;
        var borderWidth = (visit40_290_1(parseInt(menuEl.css('borderLeftWidth')) || 0)) + (visit41_291_1(parseInt(menuEl.css('borderRightWidth')) || 0));
        _$jscoverage['/combobox/control.js'].lineData[292]++;
        menu.set("width", el[0].offsetWidth - borderWidth);
      }
      _$jscoverage['/combobox/control.js'].lineData[294]++;
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
  _$jscoverage['/combobox/control.js'].functionData[18]++;
  _$jscoverage['/combobox/control.js'].lineData[403]++;
  if (visit42_403_1(!v.isControl)) {
    _$jscoverage['/combobox/control.js'].lineData[404]++;
    v.xclass = visit43_404_1(v.xclass || 'popupmenu');
    _$jscoverage['/combobox/control.js'].lineData[405]++;
    v = this.createComponent(v);
    _$jscoverage['/combobox/control.js'].lineData[406]++;
    this.setInternal('menu', v);
  }
  _$jscoverage['/combobox/control.js'].lineData[408]++;
  return v;
}, 
  setter: function(m) {
  _$jscoverage['/combobox/control.js'].functionData[19]++;
  _$jscoverage['/combobox/control.js'].lineData[411]++;
  if (visit44_411_1(m.isControl)) {
    _$jscoverage['/combobox/control.js'].lineData[412]++;
    m.setInternal('parent', this);
    _$jscoverage['/combobox/control.js'].lineData[413]++;
    var align = {
  node: this.$el, 
  points: ["bl", "tl"], 
  overflow: {
  adjustX: 1, 
  adjustY: 1}};
    _$jscoverage['/combobox/control.js'].lineData[421]++;
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
  _$jscoverage['/combobox/control.js'].lineData[529]++;
  function getFirstEnabledItem(children) {
    _$jscoverage['/combobox/control.js'].functionData[20]++;
    _$jscoverage['/combobox/control.js'].lineData[530]++;
    for (var i = 0; visit45_530_1(i < children.length); i++) {
      _$jscoverage['/combobox/control.js'].lineData[531]++;
      if (visit46_531_1(!children[i].get('disabled'))) {
        _$jscoverage['/combobox/control.js'].lineData[532]++;
        return children[i];
      }
    }
    _$jscoverage['/combobox/control.js'].lineData[535]++;
    return null;
  }
  _$jscoverage['/combobox/control.js'].lineData[538]++;
  function onMenuFocusout() {
    _$jscoverage['/combobox/control.js'].functionData[21]++;
    _$jscoverage['/combobox/control.js'].lineData[539]++;
    var combobox = this;
    _$jscoverage['/combobox/control.js'].lineData[540]++;
    delayHide(combobox);
  }
  _$jscoverage['/combobox/control.js'].lineData[543]++;
  function onMenuFocusin() {
    _$jscoverage['/combobox/control.js'].functionData[22]++;
    _$jscoverage['/combobox/control.js'].lineData[544]++;
    var combobox = this;
    _$jscoverage['/combobox/control.js'].lineData[548]++;
    setTimeout(function() {
  _$jscoverage['/combobox/control.js'].functionData[23]++;
  _$jscoverage['/combobox/control.js'].lineData[549]++;
  clearDismissTimer(combobox);
}, 0);
  }
  _$jscoverage['/combobox/control.js'].lineData[553]++;
  function onMenuMouseOver() {
    _$jscoverage['/combobox/control.js'].functionData[24]++;
    _$jscoverage['/combobox/control.js'].lineData[554]++;
    var combobox = this;
    _$jscoverage['/combobox/control.js'].lineData[556]++;
    self.focus();
    _$jscoverage['/combobox/control.js'].lineData[558]++;
    clearDismissTimer(combobox);
  }
  _$jscoverage['/combobox/control.js'].lineData[561]++;
  function onMenuMouseDown() {
    _$jscoverage['/combobox/control.js'].functionData[25]++;
    _$jscoverage['/combobox/control.js'].lineData[562]++;
    var combobox = this;
    _$jscoverage['/combobox/control.js'].lineData[566]++;
    combobox.setValueFromAutocomplete(combobox.getValueForAutocomplete(), {
  force: 1});
  }
  _$jscoverage['/combobox/control.js'].lineData[571]++;
  function onMenuAfterRenderUI(self, menu) {
    _$jscoverage['/combobox/control.js'].functionData[26]++;
    _$jscoverage['/combobox/control.js'].lineData[572]++;
    var contentEl;
    _$jscoverage['/combobox/control.js'].lineData[573]++;
    var input = self.get('input');
    _$jscoverage['/combobox/control.js'].lineData[574]++;
    var el = menu.get('el');
    _$jscoverage['/combobox/control.js'].lineData[575]++;
    contentEl = menu.get("contentEl");
    _$jscoverage['/combobox/control.js'].lineData[576]++;
    input.attr("aria-owns", el.attr('id'));
    _$jscoverage['/combobox/control.js'].lineData[578]++;
    el.on("focusout", onMenuFocusout, self);
    _$jscoverage['/combobox/control.js'].lineData[579]++;
    el.on("focusin", onMenuFocusin, self);
    _$jscoverage['/combobox/control.js'].lineData[580]++;
    contentEl.on("mouseover", onMenuMouseOver, self);
    _$jscoverage['/combobox/control.js'].lineData[583]++;
    contentEl.on('mousedown', onMenuMouseDown, self);
  }
  _$jscoverage['/combobox/control.js'].lineData[586]++;
  function onMenuItemClick(e) {
    _$jscoverage['/combobox/control.js'].functionData[27]++;
    _$jscoverage['/combobox/control.js'].lineData[587]++;
    var item = e.target, self = this, textContent;
    _$jscoverage['/combobox/control.js'].lineData[590]++;
    if (visit47_590_1(item.isMenuItem)) {
      _$jscoverage['/combobox/control.js'].lineData[591]++;
      textContent = item.get('textContent');
      _$jscoverage['/combobox/control.js'].lineData[592]++;
      self.setValueFromAutocomplete(textContent);
      _$jscoverage['/combobox/control.js'].lineData[593]++;
      self._savedValue = textContent;
      _$jscoverage['/combobox/control.js'].lineData[594]++;
      self.set("collapsed", true);
    }
  }
  _$jscoverage['/combobox/control.js'].lineData[598]++;
  function setInvalid(self, error) {
    _$jscoverage['/combobox/control.js'].functionData[28]++;
    _$jscoverage['/combobox/control.js'].lineData[599]++;
    var $el = self.$el, cls = self.view.getBaseCssClasses('invalid'), invalidEl = self.get("invalidEl");
    _$jscoverage['/combobox/control.js'].lineData[602]++;
    if (visit48_602_1(error)) {
      _$jscoverage['/combobox/control.js'].lineData[603]++;
      $el.addClass(cls);
      _$jscoverage['/combobox/control.js'].lineData[604]++;
      invalidEl.attr("title", error);
      _$jscoverage['/combobox/control.js'].lineData[605]++;
      invalidEl.show();
    } else {
      _$jscoverage['/combobox/control.js'].lineData[607]++;
      $el.removeClass(cls);
      _$jscoverage['/combobox/control.js'].lineData[608]++;
      invalidEl.hide();
    }
  }
  _$jscoverage['/combobox/control.js'].lineData[612]++;
  function delayHide(self) {
    _$jscoverage['/combobox/control.js'].functionData[29]++;
    _$jscoverage['/combobox/control.js'].lineData[613]++;
    if (visit49_613_1(self._focusoutDismissTimer)) {
      _$jscoverage['/combobox/control.js'].lineData[614]++;
      return;
    }
    _$jscoverage['/combobox/control.js'].lineData[616]++;
    self._focusoutDismissTimer = setTimeout(function() {
  _$jscoverage['/combobox/control.js'].functionData[30]++;
  _$jscoverage['/combobox/control.js'].lineData[618]++;
  if (visit50_618_1(self._focusoutDismissTimer)) {
    _$jscoverage['/combobox/control.js'].lineData[619]++;
    self.set("collapsed", true);
  }
}, 50);
  }
  _$jscoverage['/combobox/control.js'].lineData[626]++;
  function clearDismissTimer(self) {
    _$jscoverage['/combobox/control.js'].functionData[31]++;
    _$jscoverage['/combobox/control.js'].lineData[627]++;
    var t;
    _$jscoverage['/combobox/control.js'].lineData[628]++;
    if (visit51_628_1(t = self._focusoutDismissTimer)) {
      _$jscoverage['/combobox/control.js'].lineData[629]++;
      clearTimeout(t);
      _$jscoverage['/combobox/control.js'].lineData[630]++;
      self._focusoutDismissTimer = null;
    }
  }
  _$jscoverage['/combobox/control.js'].lineData[634]++;
  function onValueChange(e) {
    _$jscoverage['/combobox/control.js'].functionData[32]++;
    _$jscoverage['/combobox/control.js'].lineData[635]++;
    this.set('value', e.newVal, {
  data: {
  causedByTimer: 1}});
  }
  _$jscoverage['/combobox/control.js'].lineData[642]++;
  function renderData(data) {
    _$jscoverage['/combobox/control.js'].functionData[33]++;
    _$jscoverage['/combobox/control.js'].lineData[643]++;
    var self = this, v, children = [], val, matchVal, highlightedItem, i, menu = self.get("menu");
    _$jscoverage['/combobox/control.js'].lineData[652]++;
    data = self['normalizeData'](data);
    _$jscoverage['/combobox/control.js'].lineData[654]++;
    menu.removeChildren(true);
    _$jscoverage['/combobox/control.js'].lineData[656]++;
    if (visit52_656_1(highlightedItem = menu.get('highlightedItem'))) {
      _$jscoverage['/combobox/control.js'].lineData[657]++;
      highlightedItem.set('highlighted', false);
    }
    _$jscoverage['/combobox/control.js'].lineData[660]++;
    if (visit53_660_1(data && data.length)) {
      _$jscoverage['/combobox/control.js'].lineData[661]++;
      for (i = 0; visit54_661_1(i < data.length); i++) {
        _$jscoverage['/combobox/control.js'].lineData[662]++;
        v = data[i];
        _$jscoverage['/combobox/control.js'].lineData[663]++;
        menu.addChild(v);
      }
      _$jscoverage['/combobox/control.js'].lineData[666]++;
      children = menu.get('children');
      _$jscoverage['/combobox/control.js'].lineData[669]++;
      val = self['getValueForAutocomplete']();
      _$jscoverage['/combobox/control.js'].lineData[671]++;
      if (visit55_671_1(self.get('highlightMatchItem'))) {
        _$jscoverage['/combobox/control.js'].lineData[672]++;
        for (i = 0; visit56_672_1(i < children.length); i++) {
          _$jscoverage['/combobox/control.js'].lineData[673]++;
          if (visit57_673_1(children[i].get("textContent") == val)) {
            _$jscoverage['/combobox/control.js'].lineData[674]++;
            children[i].set('highlighted', true);
            _$jscoverage['/combobox/control.js'].lineData[675]++;
            matchVal = true;
            _$jscoverage['/combobox/control.js'].lineData[676]++;
            break;
          }
        }
      }
      _$jscoverage['/combobox/control.js'].lineData[682]++;
      if (visit58_682_1(!matchVal && self.get("autoHighlightFirst"))) {
        _$jscoverage['/combobox/control.js'].lineData[683]++;
        for (i = 0; visit59_683_1(i < children.length); i++) {
          _$jscoverage['/combobox/control.js'].lineData[684]++;
          if (visit60_684_1(!children[i].get("disabled"))) {
            _$jscoverage['/combobox/control.js'].lineData[685]++;
            children[i].set('highlighted', true);
            _$jscoverage['/combobox/control.js'].lineData[686]++;
            break;
          }
        }
      }
      _$jscoverage['/combobox/control.js'].lineData[691]++;
      self.fire('afterRenderData');
      _$jscoverage['/combobox/control.js'].lineData[692]++;
      self.set("collapsed", false);
    } else {
      _$jscoverage['/combobox/control.js'].lineData[694]++;
      self.set("collapsed", true);
    }
  }
  _$jscoverage['/combobox/control.js'].lineData[700]++;
  return ComboBox;
}, {
  requires: ['node', 'component/control', './render', 'menu']});
