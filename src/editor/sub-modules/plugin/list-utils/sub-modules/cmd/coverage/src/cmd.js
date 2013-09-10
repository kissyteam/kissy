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
if (! _$jscoverage['/cmd.js']) {
  _$jscoverage['/cmd.js'] = {};
  _$jscoverage['/cmd.js'].lineData = [];
  _$jscoverage['/cmd.js'].lineData[5] = 0;
  _$jscoverage['/cmd.js'].lineData[7] = 0;
  _$jscoverage['/cmd.js'].lineData[18] = 0;
  _$jscoverage['/cmd.js'].lineData[19] = 0;
  _$jscoverage['/cmd.js'].lineData[22] = 0;
  _$jscoverage['/cmd.js'].lineData[32] = 0;
  _$jscoverage['/cmd.js'].lineData[36] = 0;
  _$jscoverage['/cmd.js'].lineData[37] = 0;
  _$jscoverage['/cmd.js'].lineData[38] = 0;
  _$jscoverage['/cmd.js'].lineData[39] = 0;
  _$jscoverage['/cmd.js'].lineData[41] = 0;
  _$jscoverage['/cmd.js'].lineData[42] = 0;
  _$jscoverage['/cmd.js'].lineData[43] = 0;
  _$jscoverage['/cmd.js'].lineData[46] = 0;
  _$jscoverage['/cmd.js'].lineData[47] = 0;
  _$jscoverage['/cmd.js'].lineData[48] = 0;
  _$jscoverage['/cmd.js'].lineData[49] = 0;
  _$jscoverage['/cmd.js'].lineData[50] = 0;
  _$jscoverage['/cmd.js'].lineData[52] = 0;
  _$jscoverage['/cmd.js'].lineData[53] = 0;
  _$jscoverage['/cmd.js'].lineData[54] = 0;
  _$jscoverage['/cmd.js'].lineData[56] = 0;
  _$jscoverage['/cmd.js'].lineData[57] = 0;
  _$jscoverage['/cmd.js'].lineData[59] = 0;
  _$jscoverage['/cmd.js'].lineData[60] = 0;
  _$jscoverage['/cmd.js'].lineData[64] = 0;
  _$jscoverage['/cmd.js'].lineData[71] = 0;
  _$jscoverage['/cmd.js'].lineData[73] = 0;
  _$jscoverage['/cmd.js'].lineData[74] = 0;
  _$jscoverage['/cmd.js'].lineData[76] = 0;
  _$jscoverage['/cmd.js'].lineData[77] = 0;
  _$jscoverage['/cmd.js'].lineData[81] = 0;
  _$jscoverage['/cmd.js'].lineData[83] = 0;
  _$jscoverage['/cmd.js'].lineData[84] = 0;
  _$jscoverage['/cmd.js'].lineData[90] = 0;
  _$jscoverage['/cmd.js'].lineData[91] = 0;
  _$jscoverage['/cmd.js'].lineData[93] = 0;
  _$jscoverage['/cmd.js'].lineData[94] = 0;
  _$jscoverage['/cmd.js'].lineData[95] = 0;
  _$jscoverage['/cmd.js'].lineData[96] = 0;
  _$jscoverage['/cmd.js'].lineData[98] = 0;
  _$jscoverage['/cmd.js'].lineData[102] = 0;
  _$jscoverage['/cmd.js'].lineData[103] = 0;
  _$jscoverage['/cmd.js'].lineData[106] = 0;
  _$jscoverage['/cmd.js'].lineData[109] = 0;
  _$jscoverage['/cmd.js'].lineData[111] = 0;
  _$jscoverage['/cmd.js'].lineData[112] = 0;
  _$jscoverage['/cmd.js'].lineData[113] = 0;
  _$jscoverage['/cmd.js'].lineData[117] = 0;
  _$jscoverage['/cmd.js'].lineData[118] = 0;
  _$jscoverage['/cmd.js'].lineData[120] = 0;
  _$jscoverage['/cmd.js'].lineData[121] = 0;
  _$jscoverage['/cmd.js'].lineData[122] = 0;
  _$jscoverage['/cmd.js'].lineData[124] = 0;
  _$jscoverage['/cmd.js'].lineData[127] = 0;
  _$jscoverage['/cmd.js'].lineData[128] = 0;
  _$jscoverage['/cmd.js'].lineData[130] = 0;
  _$jscoverage['/cmd.js'].lineData[131] = 0;
  _$jscoverage['/cmd.js'].lineData[133] = 0;
  _$jscoverage['/cmd.js'].lineData[140] = 0;
  _$jscoverage['/cmd.js'].lineData[144] = 0;
  _$jscoverage['/cmd.js'].lineData[145] = 0;
  _$jscoverage['/cmd.js'].lineData[146] = 0;
  _$jscoverage['/cmd.js'].lineData[147] = 0;
  _$jscoverage['/cmd.js'].lineData[148] = 0;
  _$jscoverage['/cmd.js'].lineData[149] = 0;
  _$jscoverage['/cmd.js'].lineData[150] = 0;
  _$jscoverage['/cmd.js'].lineData[153] = 0;
  _$jscoverage['/cmd.js'].lineData[155] = 0;
  _$jscoverage['/cmd.js'].lineData[156] = 0;
  _$jscoverage['/cmd.js'].lineData[157] = 0;
  _$jscoverage['/cmd.js'].lineData[158] = 0;
  _$jscoverage['/cmd.js'].lineData[164] = 0;
  _$jscoverage['/cmd.js'].lineData[167] = 0;
  _$jscoverage['/cmd.js'].lineData[168] = 0;
  _$jscoverage['/cmd.js'].lineData[170] = 0;
  _$jscoverage['/cmd.js'].lineData[171] = 0;
  _$jscoverage['/cmd.js'].lineData[173] = 0;
  _$jscoverage['/cmd.js'].lineData[174] = 0;
  _$jscoverage['/cmd.js'].lineData[176] = 0;
  _$jscoverage['/cmd.js'].lineData[180] = 0;
  _$jscoverage['/cmd.js'].lineData[183] = 0;
  _$jscoverage['/cmd.js'].lineData[185] = 0;
  _$jscoverage['/cmd.js'].lineData[186] = 0;
  _$jscoverage['/cmd.js'].lineData[193] = 0;
  _$jscoverage['/cmd.js'].lineData[197] = 0;
  _$jscoverage['/cmd.js'].lineData[198] = 0;
  _$jscoverage['/cmd.js'].lineData[199] = 0;
  _$jscoverage['/cmd.js'].lineData[200] = 0;
  _$jscoverage['/cmd.js'].lineData[204] = 0;
  _$jscoverage['/cmd.js'].lineData[208] = 0;
  _$jscoverage['/cmd.js'].lineData[209] = 0;
  _$jscoverage['/cmd.js'].lineData[212] = 0;
  _$jscoverage['/cmd.js'].lineData[215] = 0;
  _$jscoverage['/cmd.js'].lineData[217] = 0;
  _$jscoverage['/cmd.js'].lineData[221] = 0;
  _$jscoverage['/cmd.js'].lineData[223] = 0;
  _$jscoverage['/cmd.js'].lineData[224] = 0;
  _$jscoverage['/cmd.js'].lineData[226] = 0;
  _$jscoverage['/cmd.js'].lineData[230] = 0;
  _$jscoverage['/cmd.js'].lineData[231] = 0;
  _$jscoverage['/cmd.js'].lineData[233] = 0;
  _$jscoverage['/cmd.js'].lineData[234] = 0;
  _$jscoverage['/cmd.js'].lineData[236] = 0;
  _$jscoverage['/cmd.js'].lineData[239] = 0;
  _$jscoverage['/cmd.js'].lineData[241] = 0;
  _$jscoverage['/cmd.js'].lineData[244] = 0;
  _$jscoverage['/cmd.js'].lineData[245] = 0;
  _$jscoverage['/cmd.js'].lineData[247] = 0;
  _$jscoverage['/cmd.js'].lineData[250] = 0;
  _$jscoverage['/cmd.js'].lineData[261] = 0;
  _$jscoverage['/cmd.js'].lineData[263] = 0;
  _$jscoverage['/cmd.js'].lineData[271] = 0;
  _$jscoverage['/cmd.js'].lineData[273] = 0;
  _$jscoverage['/cmd.js'].lineData[274] = 0;
  _$jscoverage['/cmd.js'].lineData[275] = 0;
  _$jscoverage['/cmd.js'].lineData[277] = 0;
  _$jscoverage['/cmd.js'].lineData[278] = 0;
  _$jscoverage['/cmd.js'].lineData[279] = 0;
  _$jscoverage['/cmd.js'].lineData[281] = 0;
  _$jscoverage['/cmd.js'].lineData[282] = 0;
  _$jscoverage['/cmd.js'].lineData[286] = 0;
  _$jscoverage['/cmd.js'].lineData[287] = 0;
  _$jscoverage['/cmd.js'].lineData[291] = 0;
  _$jscoverage['/cmd.js'].lineData[292] = 0;
  _$jscoverage['/cmd.js'].lineData[293] = 0;
  _$jscoverage['/cmd.js'].lineData[295] = 0;
  _$jscoverage['/cmd.js'].lineData[296] = 0;
  _$jscoverage['/cmd.js'].lineData[297] = 0;
  _$jscoverage['/cmd.js'].lineData[305] = 0;
  _$jscoverage['/cmd.js'].lineData[306] = 0;
  _$jscoverage['/cmd.js'].lineData[307] = 0;
  _$jscoverage['/cmd.js'].lineData[308] = 0;
  _$jscoverage['/cmd.js'].lineData[309] = 0;
  _$jscoverage['/cmd.js'].lineData[310] = 0;
  _$jscoverage['/cmd.js'].lineData[315] = 0;
  _$jscoverage['/cmd.js'].lineData[316] = 0;
  _$jscoverage['/cmd.js'].lineData[318] = 0;
  _$jscoverage['/cmd.js'].lineData[319] = 0;
  _$jscoverage['/cmd.js'].lineData[320] = 0;
  _$jscoverage['/cmd.js'].lineData[322] = 0;
  _$jscoverage['/cmd.js'].lineData[327] = 0;
  _$jscoverage['/cmd.js'].lineData[330] = 0;
  _$jscoverage['/cmd.js'].lineData[331] = 0;
  _$jscoverage['/cmd.js'].lineData[335] = 0;
  _$jscoverage['/cmd.js'].lineData[336] = 0;
  _$jscoverage['/cmd.js'].lineData[338] = 0;
  _$jscoverage['/cmd.js'].lineData[343] = 0;
  _$jscoverage['/cmd.js'].lineData[345] = 0;
  _$jscoverage['/cmd.js'].lineData[349] = 0;
  _$jscoverage['/cmd.js'].lineData[350] = 0;
  _$jscoverage['/cmd.js'].lineData[354] = 0;
  _$jscoverage['/cmd.js'].lineData[355] = 0;
  _$jscoverage['/cmd.js'].lineData[359] = 0;
  _$jscoverage['/cmd.js'].lineData[360] = 0;
  _$jscoverage['/cmd.js'].lineData[365] = 0;
  _$jscoverage['/cmd.js'].lineData[366] = 0;
  _$jscoverage['/cmd.js'].lineData[369] = 0;
  _$jscoverage['/cmd.js'].lineData[370] = 0;
  _$jscoverage['/cmd.js'].lineData[374] = 0;
  _$jscoverage['/cmd.js'].lineData[375] = 0;
  _$jscoverage['/cmd.js'].lineData[376] = 0;
  _$jscoverage['/cmd.js'].lineData[381] = 0;
  _$jscoverage['/cmd.js'].lineData[385] = 0;
}
if (! _$jscoverage['/cmd.js'].functionData) {
  _$jscoverage['/cmd.js'].functionData = [];
  _$jscoverage['/cmd.js'].functionData[0] = 0;
  _$jscoverage['/cmd.js'].functionData[1] = 0;
  _$jscoverage['/cmd.js'].functionData[2] = 0;
  _$jscoverage['/cmd.js'].functionData[3] = 0;
  _$jscoverage['/cmd.js'].functionData[4] = 0;
  _$jscoverage['/cmd.js'].functionData[5] = 0;
  _$jscoverage['/cmd.js'].functionData[6] = 0;
  _$jscoverage['/cmd.js'].functionData[7] = 0;
  _$jscoverage['/cmd.js'].functionData[8] = 0;
}
if (! _$jscoverage['/cmd.js'].branchData) {
  _$jscoverage['/cmd.js'].branchData = {};
  _$jscoverage['/cmd.js'].branchData['36'] = [];
  _$jscoverage['/cmd.js'].branchData['36'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['39'] = [];
  _$jscoverage['/cmd.js'].branchData['39'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['39'][2] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['48'] = [];
  _$jscoverage['/cmd.js'].branchData['48'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['54'] = [];
  _$jscoverage['/cmd.js'].branchData['54'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['54'][2] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['56'] = [];
  _$jscoverage['/cmd.js'].branchData['56'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['71'] = [];
  _$jscoverage['/cmd.js'].branchData['71'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['71'][2] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['72'] = [];
  _$jscoverage['/cmd.js'].branchData['72'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['74'] = [];
  _$jscoverage['/cmd.js'].branchData['74'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['74'][2] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['83'] = [];
  _$jscoverage['/cmd.js'].branchData['83'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['90'] = [];
  _$jscoverage['/cmd.js'].branchData['90'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['94'] = [];
  _$jscoverage['/cmd.js'].branchData['94'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['102'] = [];
  _$jscoverage['/cmd.js'].branchData['102'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['117'] = [];
  _$jscoverage['/cmd.js'].branchData['117'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['127'] = [];
  _$jscoverage['/cmd.js'].branchData['127'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['130'] = [];
  _$jscoverage['/cmd.js'].branchData['130'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['144'] = [];
  _$jscoverage['/cmd.js'].branchData['144'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['147'] = [];
  _$jscoverage['/cmd.js'].branchData['147'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['155'] = [];
  _$jscoverage['/cmd.js'].branchData['155'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['164'] = [];
  _$jscoverage['/cmd.js'].branchData['164'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['167'] = [];
  _$jscoverage['/cmd.js'].branchData['167'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['171'] = [];
  _$jscoverage['/cmd.js'].branchData['171'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['172'] = [];
  _$jscoverage['/cmd.js'].branchData['172'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['186'] = [];
  _$jscoverage['/cmd.js'].branchData['186'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['187'] = [];
  _$jscoverage['/cmd.js'].branchData['187'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['187'][2] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['187'][3] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['189'] = [];
  _$jscoverage['/cmd.js'].branchData['189'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['191'] = [];
  _$jscoverage['/cmd.js'].branchData['191'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['191'][2] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['205'] = [];
  _$jscoverage['/cmd.js'].branchData['205'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['208'] = [];
  _$jscoverage['/cmd.js'].branchData['208'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['208'][2] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['223'] = [];
  _$jscoverage['/cmd.js'].branchData['223'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['230'] = [];
  _$jscoverage['/cmd.js'].branchData['230'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['230'][2] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['230'][3] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['233'] = [];
  _$jscoverage['/cmd.js'].branchData['233'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['233'][2] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['233'][3] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['244'] = [];
  _$jscoverage['/cmd.js'].branchData['244'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['261'] = [];
  _$jscoverage['/cmd.js'].branchData['261'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['261'][2] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['263'] = [];
  _$jscoverage['/cmd.js'].branchData['263'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['274'] = [];
  _$jscoverage['/cmd.js'].branchData['274'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['286'] = [];
  _$jscoverage['/cmd.js'].branchData['286'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['291'] = [];
  _$jscoverage['/cmd.js'].branchData['291'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['292'] = [];
  _$jscoverage['/cmd.js'].branchData['292'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['306'] = [];
  _$jscoverage['/cmd.js'].branchData['306'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['308'] = [];
  _$jscoverage['/cmd.js'].branchData['308'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['309'] = [];
  _$jscoverage['/cmd.js'].branchData['309'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['318'] = [];
  _$jscoverage['/cmd.js'].branchData['318'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['319'] = [];
  _$jscoverage['/cmd.js'].branchData['319'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['330'] = [];
  _$jscoverage['/cmd.js'].branchData['330'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['338'] = [];
  _$jscoverage['/cmd.js'].branchData['338'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['339'] = [];
  _$jscoverage['/cmd.js'].branchData['339'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['340'] = [];
  _$jscoverage['/cmd.js'].branchData['340'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['340'][2] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['342'] = [];
  _$jscoverage['/cmd.js'].branchData['342'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['365'] = [];
  _$jscoverage['/cmd.js'].branchData['365'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['369'] = [];
  _$jscoverage['/cmd.js'].branchData['369'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['370'] = [];
  _$jscoverage['/cmd.js'].branchData['370'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['370'][2] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['371'] = [];
  _$jscoverage['/cmd.js'].branchData['371'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['372'] = [];
  _$jscoverage['/cmd.js'].branchData['372'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['374'] = [];
  _$jscoverage['/cmd.js'].branchData['374'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['375'] = [];
  _$jscoverage['/cmd.js'].branchData['375'][1] = new BranchData();
}
_$jscoverage['/cmd.js'].branchData['375'][1].init(26, 12, 'name == type');
function visit70_375_1(result) {
  _$jscoverage['/cmd.js'].branchData['375'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['374'][1].init(22, 40, 'listNodeNames[name = element.nodeName()]');
function visit69_374_1(result) {
  _$jscoverage['/cmd.js'].branchData['374'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['372'][1].init(45, 28, 'element[0] !== blockLimit[0]');
function visit68_372_1(result) {
  _$jscoverage['/cmd.js'].branchData['372'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['371'][1].init(41, 74, '(element = elements[i]) && element[0] !== blockLimit[0]');
function visit67_371_1(result) {
  _$jscoverage['/cmd.js'].branchData['371'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['370'][2].init(26, 19, 'i < elements.length');
function visit66_370_2(result) {
  _$jscoverage['/cmd.js'].branchData['370'][2].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['370'][1].init(26, 116, 'i < elements.length && (element = elements[i]) && element[0] !== blockLimit[0]');
function visit65_370_1(result) {
  _$jscoverage['/cmd.js'].branchData['370'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['369'][1].init(299, 8, 'elements');
function visit64_369_1(result) {
  _$jscoverage['/cmd.js'].branchData['369'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['365'][1].init(167, 11, '!blockLimit');
function visit63_365_1(result) {
  _$jscoverage['/cmd.js'].branchData['365'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['342'][1].init(125, 47, 'sibling.css(\'list-style-type\') == listStyleType');
function visit62_342_1(result) {
  _$jscoverage['/cmd.js'].branchData['342'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['340'][2].init(228, 31, 'sibling.nodeName() == self.type');
function visit61_340_2(result) {
  _$jscoverage['/cmd.js'].branchData['340'][2].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['340'][1].init(38, 173, 'sibling.nodeName() == self.type && sibling.css(\'list-style-type\') == listStyleType');
function visit60_340_1(result) {
  _$jscoverage['/cmd.js'].branchData['340'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['339'][1].init(35, 212, 'sibling[0] && sibling.nodeName() == self.type && sibling.css(\'list-style-type\') == listStyleType');
function visit59_339_1(result) {
  _$jscoverage['/cmd.js'].branchData['339'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['338'][1].init(150, 248, 'sibling && sibling[0] && sibling.nodeName() == self.type && sibling.css(\'list-style-type\') == listStyleType');
function visit58_338_1(result) {
  _$jscoverage['/cmd.js'].branchData['338'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['330'][1].init(6053, 23, 'i < listsCreated.length');
function visit57_330_1(result) {
  _$jscoverage['/cmd.js'].branchData['330'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['319'][1].init(26, 53, 'groupObj.root.css(\'list-style-type\') == listStyleType');
function visit56_319_1(result) {
  _$jscoverage['/cmd.js'].branchData['319'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['318'][1].init(630, 41, 'listNodeNames[groupObj.root.nodeName()]');
function visit55_318_1(result) {
  _$jscoverage['/cmd.js'].branchData['318'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['309'][1].init(26, 41, 'listNodeNames[groupObj.root.nodeName()]');
function visit54_309_1(result) {
  _$jscoverage['/cmd.js'].branchData['309'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['308'][1].init(70, 6, '!state');
function visit53_308_1(result) {
  _$jscoverage['/cmd.js'].branchData['308'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['306'][1].init(4904, 21, 'listGroups.length > 0');
function visit52_306_1(result) {
  _$jscoverage['/cmd.js'].branchData['306'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['292'][1].init(2493, 30, 'root.data(\'list_group_object\')');
function visit51_292_1(result) {
  _$jscoverage['/cmd.js'].branchData['292'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['291'][1].init(2442, 24, 'blockLimit || path.block');
function visit50_291_1(result) {
  _$jscoverage['/cmd.js'].branchData['291'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['286'][1].init(2269, 13, 'processedFlag');
function visit49_286_1(result) {
  _$jscoverage['/cmd.js'].branchData['286'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['274'][1].init(583, 8, 'groupObj');
function visit48_274_1(result) {
  _$jscoverage['/cmd.js'].branchData['274'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['263'][1].init(30, 96, 'listNodeNames[element.nodeName()] && blockLimit.contains(element)');
function visit47_263_1(result) {
  _$jscoverage['/cmd.js'].branchData['263'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['261'][2].init(854, 6, 'i >= 0');
function visit46_261_2(result) {
  _$jscoverage['/cmd.js'].branchData['261'][2].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['261'][1].init(854, 66, 'i >= 0 && (element = pathElements[i])');
function visit45_261_1(result) {
  _$jscoverage['/cmd.js'].branchData['261'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['244'][1].init(104, 24, 'block.data(\'list_block\')');
function visit44_244_1(result) {
  _$jscoverage['/cmd.js'].branchData['244'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['233'][3].init(495, 26, 'endNode.nodeName() == \'td\'');
function visit43_233_3(result) {
  _$jscoverage['/cmd.js'].branchData['233'][3].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['233'][2].init(443, 48, 'endNode[0].nodeType == Dom.NodeType.ELEMENT_NODE');
function visit42_233_2(result) {
  _$jscoverage['/cmd.js'].branchData['233'][2].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['233'][1].init(443, 78, 'endNode[0].nodeType == Dom.NodeType.ELEMENT_NODE && endNode.nodeName() == \'td\'');
function visit41_233_1(result) {
  _$jscoverage['/cmd.js'].branchData['233'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['230'][3].init(300, 28, 'startNode.nodeName() == \'td\'');
function visit40_230_3(result) {
  _$jscoverage['/cmd.js'].branchData['230'][3].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['230'][2].init(246, 50, 'startNode[0].nodeType == Dom.NodeType.ELEMENT_NODE');
function visit39_230_2(result) {
  _$jscoverage['/cmd.js'].branchData['230'][2].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['230'][1].init(246, 82, 'startNode[0].nodeType == Dom.NodeType.ELEMENT_NODE && startNode.nodeName() == \'td\'');
function visit38_230_1(result) {
  _$jscoverage['/cmd.js'].branchData['230'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['223'][1].init(762, 17, 'ranges.length > 0');
function visit37_223_1(result) {
  _$jscoverage['/cmd.js'].branchData['223'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['208'][2].init(206, 17, 'ranges.length < 1');
function visit36_208_2(result) {
  _$jscoverage['/cmd.js'].branchData['208'][2].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['208'][1].init(195, 28, '!ranges || ranges.length < 1');
function visit35_208_1(result) {
  _$jscoverage['/cmd.js'].branchData['208'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['205'][1].init(64, 34, 'selection && selection.getRanges()');
function visit34_205_1(result) {
  _$jscoverage['/cmd.js'].branchData['205'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['191'][2].init(136, 53, 'boundaryNode[0].nodeType == Dom.NodeType.ELEMENT_NODE');
function visit33_191_2(result) {
  _$jscoverage['/cmd.js'].branchData['191'][2].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['191'][1].init(136, 131, 'boundaryNode[0].nodeType == Dom.NodeType.ELEMENT_NODE && siblingNode._4e_isBlockBoundary({\n  br: 1}, undefined)');
function visit32_191_1(result) {
  _$jscoverage['/cmd.js'].branchData['191'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['189'][1].init(163, 270, '(siblingNode = groupObj.root[isStart ? \'prev\' : \'next\'](Walker.whitespaces(true), 1)) && !(boundaryNode[0].nodeType == Dom.NodeType.ELEMENT_NODE && siblingNode._4e_isBlockBoundary({\n  br: 1}, undefined))');
function visit31_189_1(result) {
  _$jscoverage['/cmd.js'].branchData['189'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['187'][3].init(132, 53, 'boundaryNode[0].nodeType == Dom.NodeType.ELEMENT_NODE');
function visit30_187_3(result) {
  _$jscoverage['/cmd.js'].branchData['187'][3].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['187'][2].init(132, 132, 'boundaryNode[0].nodeType == Dom.NodeType.ELEMENT_NODE && boundaryNode._4e_isBlockBoundary(undefined, undefined)');
function visit29_187_2(result) {
  _$jscoverage['/cmd.js'].branchData['187'][2].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['187'][1].init(102, 434, '!(boundaryNode[0].nodeType == Dom.NodeType.ELEMENT_NODE && boundaryNode._4e_isBlockBoundary(undefined, undefined)) && (siblingNode = groupObj.root[isStart ? \'prev\' : \'next\'](Walker.whitespaces(true), 1)) && !(boundaryNode[0].nodeType == Dom.NodeType.ELEMENT_NODE && siblingNode._4e_isBlockBoundary({\n  br: 1}, undefined))');
function visit28_187_1(result) {
  _$jscoverage['/cmd.js'].branchData['187'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['186'][1].init(24, 537, '(boundaryNode = new Node(docFragment[isStart ? \'firstChild\' : \'lastChild\'])) && !(boundaryNode[0].nodeType == Dom.NodeType.ELEMENT_NODE && boundaryNode._4e_isBlockBoundary(undefined, undefined)) && (siblingNode = groupObj.root[isStart ? \'prev\' : \'next\'](Walker.whitespaces(true), 1)) && !(boundaryNode[0].nodeType == Dom.NodeType.ELEMENT_NODE && siblingNode._4e_isBlockBoundary({\n  br: 1}, undefined))');
function visit27_186_1(result) {
  _$jscoverage['/cmd.js'].branchData['186'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['172'][1].init(40, 32, 'listArray[i].indent >= oldIndent');
function visit26_172_1(result) {
  _$jscoverage['/cmd.js'].branchData['172'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['171'][1].init(203, 73, 'listArray[i] && listArray[i].indent >= oldIndent');
function visit25_171_1(result) {
  _$jscoverage['/cmd.js'].branchData['171'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['167'][1].init(138, 58, 'listArray[i].indent > Math.max(listArray[i - 1].indent, 0)');
function visit24_167_1(result) {
  _$jscoverage['/cmd.js'].branchData['167'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['164'][1].init(1406, 20, 'i < listArray.length');
function visit23_164_1(result) {
  _$jscoverage['/cmd.js'].branchData['164'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['155'][1].init(852, 28, 'i < selectedListItems.length');
function visit22_155_1(result) {
  _$jscoverage['/cmd.js'].branchData['155'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['147'][1].init(139, 49, '!itemNode || itemNode.data(\'list_item_processed\')');
function visit21_147_1(result) {
  _$jscoverage['/cmd.js'].branchData['147'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['144'][1].init(370, 28, 'i < groupObj.contents.length');
function visit20_144_1(result) {
  _$jscoverage['/cmd.js'].branchData['144'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['130'][1].init(3082, 15, 'insertAnchor[0]');
function visit19_130_1(result) {
  _$jscoverage['/cmd.js'].branchData['130'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['127'][1].init(761, 9, '!UA[\'ie\']');
function visit18_127_1(result) {
  _$jscoverage['/cmd.js'].branchData['127'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['117'][1].init(234, 44, 'headerTagRegex.test(contentBlock.nodeName())');
function visit17_117_1(result) {
  _$jscoverage['/cmd.js'].branchData['117'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['102'][1].init(1804, 23, 'listContents.length < 1');
function visit16_102_1(result) {
  _$jscoverage['/cmd.js'].branchData['102'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['94'][1].init(26, 33, 'parentNode[0] === commonParent[0]');
function visit15_94_1(result) {
  _$jscoverage['/cmd.js'].branchData['94'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['90'][1].init(1356, 19, 'i < contents.length');
function visit14_90_1(result) {
  _$jscoverage['/cmd.js'].branchData['90'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['83'][1].init(988, 19, 'i < contents.length');
function visit13_83_1(result) {
  _$jscoverage['/cmd.js'].branchData['83'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['74'][2].init(86, 49, 'contents[0][0].nodeType != Dom.NodeType.TEXT_NODE');
function visit12_74_2(result) {
  _$jscoverage['/cmd.js'].branchData['74'][2].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['74'][1].init(86, 130, 'contents[0][0].nodeType != Dom.NodeType.TEXT_NODE && contents[0]._4e_moveChildren(divBlock, undefined, undefined)');
function visit11_74_1(result) {
  _$jscoverage['/cmd.js'].branchData['74'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['72'][1].init(40, 35, 'contents[0][0] === groupObj.root[0]');
function visit10_72_1(result) {
  _$jscoverage['/cmd.js'].branchData['72'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['71'][2].init(409, 20, 'contents.length == 1');
function visit9_71_2(result) {
  _$jscoverage['/cmd.js'].branchData['71'][2].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['71'][1].init(409, 76, 'contents.length == 1 && contents[0][0] === groupObj.root[0]');
function visit8_71_1(result) {
  _$jscoverage['/cmd.js'].branchData['71'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['56'][1].init(22, 29, 'child.nodeName() == this.type');
function visit7_56_1(result) {
  _$jscoverage['/cmd.js'].branchData['56'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['54'][2].init(1531, 10, 'i < length');
function visit6_54_2(result) {
  _$jscoverage['/cmd.js'].branchData['54'][2].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['54'][1].init(1531, 83, 'i < length && (child = new Node(newList.listNode.childNodes[i]))');
function visit5_54_1(result) {
  _$jscoverage['/cmd.js'].branchData['54'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['48'][1].init(1165, 28, 'i < selectedListItems.length');
function visit4_48_1(result) {
  _$jscoverage['/cmd.js'].branchData['48'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['39'][2].init(140, 25, '!itemNode || !itemNode[0]');
function visit3_39_2(result) {
  _$jscoverage['/cmd.js'].branchData['39'][2].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['39'][1].init(140, 87, '(!itemNode || !itemNode[0]) || itemNode.data(\'list_item_processed\')');
function visit2_39_1(result) {
  _$jscoverage['/cmd.js'].branchData['39'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['36'][1].init(525, 28, 'i < groupObj.contents.length');
function visit1_36_1(result) {
  _$jscoverage['/cmd.js'].branchData['36'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].lineData[5]++;
KISSY.add("editor/plugin/list-utils/cmd", function(S, Editor, ListUtils, undefined) {
  _$jscoverage['/cmd.js'].functionData[0]++;
  _$jscoverage['/cmd.js'].lineData[7]++;
  var insertUnorderedList = "insertUnorderedList", insertOrderedList = "insertOrderedList", listNodeNames = {
  "ol": insertOrderedList, 
  "ul": insertUnorderedList}, KER = Editor.RangeType, ElementPath = Editor.ElementPath, Walker = Editor.Walker, UA = S.UA, Node = S.Node, Dom = S.DOM, headerTagRegex = /^h[1-6]$/;
  _$jscoverage['/cmd.js'].lineData[18]++;
  function ListCommand(type) {
    _$jscoverage['/cmd.js'].functionData[1]++;
    _$jscoverage['/cmd.js'].lineData[19]++;
    this.type = type;
  }
  _$jscoverage['/cmd.js'].lineData[22]++;
  ListCommand.prototype = {
  constructor: ListCommand, 
  changeListType: function(editor, groupObj, database, listsCreated, listStyleType) {
  _$jscoverage['/cmd.js'].functionData[2]++;
  _$jscoverage['/cmd.js'].lineData[32]++;
  var listArray = ListUtils.listToArray(groupObj.root, database, undefined, undefined, undefined), selectedListItems = [];
  _$jscoverage['/cmd.js'].lineData[36]++;
  for (var i = 0; visit1_36_1(i < groupObj.contents.length); i++) {
    _$jscoverage['/cmd.js'].lineData[37]++;
    var itemNode = groupObj.contents[i];
    _$jscoverage['/cmd.js'].lineData[38]++;
    itemNode = itemNode.closest('li', undefined);
    _$jscoverage['/cmd.js'].lineData[39]++;
    if (visit2_39_1((visit3_39_2(!itemNode || !itemNode[0])) || itemNode.data('list_item_processed'))) {
      _$jscoverage['/cmd.js'].lineData[41]++;
      continue;
    }
    _$jscoverage['/cmd.js'].lineData[42]++;
    selectedListItems.push(itemNode);
    _$jscoverage['/cmd.js'].lineData[43]++;
    itemNode._4e_setMarker(database, 'list_item_processed', true, undefined);
  }
  _$jscoverage['/cmd.js'].lineData[46]++;
  var fakeParent = new Node(groupObj.root[0].ownerDocument.createElement(this.type));
  _$jscoverage['/cmd.js'].lineData[47]++;
  fakeParent.css('list-style-type', listStyleType);
  _$jscoverage['/cmd.js'].lineData[48]++;
  for (i = 0; visit4_48_1(i < selectedListItems.length); i++) {
    _$jscoverage['/cmd.js'].lineData[49]++;
    var listIndex = selectedListItems[i].data('listarray_index');
    _$jscoverage['/cmd.js'].lineData[50]++;
    listArray[listIndex].parent = fakeParent;
  }
  _$jscoverage['/cmd.js'].lineData[52]++;
  var newList = ListUtils.arrayToList(listArray, database, null, "p");
  _$jscoverage['/cmd.js'].lineData[53]++;
  var child, length = newList.listNode.childNodes.length;
  _$jscoverage['/cmd.js'].lineData[54]++;
  for (i = 0; visit5_54_1(visit6_54_2(i < length) && (child = new Node(newList.listNode.childNodes[i]))); i++) {
    _$jscoverage['/cmd.js'].lineData[56]++;
    if (visit7_56_1(child.nodeName() == this.type)) {
      _$jscoverage['/cmd.js'].lineData[57]++;
      listsCreated.push(child);
    }
  }
  _$jscoverage['/cmd.js'].lineData[59]++;
  groupObj.root.before(newList.listNode);
  _$jscoverage['/cmd.js'].lineData[60]++;
  groupObj.root.remove();
}, 
  createList: function(editor, groupObj, listsCreated, listStyleType) {
  _$jscoverage['/cmd.js'].functionData[3]++;
  _$jscoverage['/cmd.js'].lineData[64]++;
  var contents = groupObj.contents, doc = groupObj.root[0].ownerDocument, listContents = [];
  _$jscoverage['/cmd.js'].lineData[71]++;
  if (visit8_71_1(visit9_71_2(contents.length == 1) && visit10_72_1(contents[0][0] === groupObj.root[0]))) {
    _$jscoverage['/cmd.js'].lineData[73]++;
    var divBlock = new Node(doc.createElement('div'));
    _$jscoverage['/cmd.js'].lineData[74]++;
    visit11_74_1(visit12_74_2(contents[0][0].nodeType != Dom.NodeType.TEXT_NODE) && contents[0]._4e_moveChildren(divBlock, undefined, undefined));
    _$jscoverage['/cmd.js'].lineData[76]++;
    contents[0][0].appendChild(divBlock[0]);
    _$jscoverage['/cmd.js'].lineData[77]++;
    contents[0] = divBlock;
  }
  _$jscoverage['/cmd.js'].lineData[81]++;
  var commonParent = groupObj.contents[0].parent();
  _$jscoverage['/cmd.js'].lineData[83]++;
  for (var i = 0; visit13_83_1(i < contents.length); i++) {
    _$jscoverage['/cmd.js'].lineData[84]++;
    commonParent = commonParent._4e_commonAncestor(contents[i].parent(), undefined);
  }
  _$jscoverage['/cmd.js'].lineData[90]++;
  for (i = 0; visit14_90_1(i < contents.length); i++) {
    _$jscoverage['/cmd.js'].lineData[91]++;
    var contentNode = contents[i], parentNode;
    _$jscoverage['/cmd.js'].lineData[93]++;
    while ((parentNode = contentNode.parent())) {
      _$jscoverage['/cmd.js'].lineData[94]++;
      if (visit15_94_1(parentNode[0] === commonParent[0])) {
        _$jscoverage['/cmd.js'].lineData[95]++;
        listContents.push(contentNode);
        _$jscoverage['/cmd.js'].lineData[96]++;
        break;
      }
      _$jscoverage['/cmd.js'].lineData[98]++;
      contentNode = parentNode;
    }
  }
  _$jscoverage['/cmd.js'].lineData[102]++;
  if (visit16_102_1(listContents.length < 1)) {
    _$jscoverage['/cmd.js'].lineData[103]++;
    return;
  }
  _$jscoverage['/cmd.js'].lineData[106]++;
  var insertAnchor = new Node(listContents[listContents.length - 1][0].nextSibling), listNode = new Node(doc.createElement(this.type));
  _$jscoverage['/cmd.js'].lineData[109]++;
  listNode.css('list-style-type', listStyleType);
  _$jscoverage['/cmd.js'].lineData[111]++;
  listsCreated.push(listNode);
  _$jscoverage['/cmd.js'].lineData[112]++;
  while (listContents.length) {
    _$jscoverage['/cmd.js'].lineData[113]++;
    var contentBlock = listContents.shift(), listItem = new Node(doc.createElement('li'));
    _$jscoverage['/cmd.js'].lineData[117]++;
    if (visit17_117_1(headerTagRegex.test(contentBlock.nodeName()))) {
      _$jscoverage['/cmd.js'].lineData[118]++;
      listItem[0].appendChild(contentBlock[0]);
    } else {
      _$jscoverage['/cmd.js'].lineData[120]++;
      contentBlock._4e_copyAttributes(listItem, undefined, undefined);
      _$jscoverage['/cmd.js'].lineData[121]++;
      contentBlock._4e_moveChildren(listItem, undefined, undefined);
      _$jscoverage['/cmd.js'].lineData[122]++;
      contentBlock.remove();
    }
    _$jscoverage['/cmd.js'].lineData[124]++;
    listNode[0].appendChild(listItem[0]);
    _$jscoverage['/cmd.js'].lineData[127]++;
    if (visit18_127_1(!UA['ie'])) {
      _$jscoverage['/cmd.js'].lineData[128]++;
      listItem._4e_appendBogus(undefined);
    }
  }
  _$jscoverage['/cmd.js'].lineData[130]++;
  if (visit19_130_1(insertAnchor[0])) {
    _$jscoverage['/cmd.js'].lineData[131]++;
    listNode.insertBefore(insertAnchor, undefined);
  } else {
    _$jscoverage['/cmd.js'].lineData[133]++;
    commonParent.append(listNode);
  }
}, 
  removeList: function(editor, groupObj, database) {
  _$jscoverage['/cmd.js'].functionData[4]++;
  _$jscoverage['/cmd.js'].lineData[140]++;
  var listArray = ListUtils.listToArray(groupObj.root, database, undefined, undefined, undefined), selectedListItems = [];
  _$jscoverage['/cmd.js'].lineData[144]++;
  for (var i = 0; visit20_144_1(i < groupObj.contents.length); i++) {
    _$jscoverage['/cmd.js'].lineData[145]++;
    var itemNode = groupObj.contents[i];
    _$jscoverage['/cmd.js'].lineData[146]++;
    itemNode = itemNode.closest('li', undefined);
    _$jscoverage['/cmd.js'].lineData[147]++;
    if (visit21_147_1(!itemNode || itemNode.data('list_item_processed'))) {
      _$jscoverage['/cmd.js'].lineData[148]++;
      continue;
    }
    _$jscoverage['/cmd.js'].lineData[149]++;
    selectedListItems.push(itemNode);
    _$jscoverage['/cmd.js'].lineData[150]++;
    itemNode._4e_setMarker(database, 'list_item_processed', true, undefined);
  }
  _$jscoverage['/cmd.js'].lineData[153]++;
  var lastListIndex = null;
  _$jscoverage['/cmd.js'].lineData[155]++;
  for (i = 0; visit22_155_1(i < selectedListItems.length); i++) {
    _$jscoverage['/cmd.js'].lineData[156]++;
    var listIndex = selectedListItems[i].data('listarray_index');
    _$jscoverage['/cmd.js'].lineData[157]++;
    listArray[listIndex].indent = -1;
    _$jscoverage['/cmd.js'].lineData[158]++;
    lastListIndex = listIndex;
  }
  _$jscoverage['/cmd.js'].lineData[164]++;
  for (i = lastListIndex + 1; visit23_164_1(i < listArray.length); i++) {
    _$jscoverage['/cmd.js'].lineData[167]++;
    if (visit24_167_1(listArray[i].indent > Math.max(listArray[i - 1].indent, 0))) {
      _$jscoverage['/cmd.js'].lineData[168]++;
      var indentOffset = listArray[i - 1].indent + 1 - listArray[i].indent;
      _$jscoverage['/cmd.js'].lineData[170]++;
      var oldIndent = listArray[i].indent;
      _$jscoverage['/cmd.js'].lineData[171]++;
      while (visit25_171_1(listArray[i] && visit26_172_1(listArray[i].indent >= oldIndent))) {
        _$jscoverage['/cmd.js'].lineData[173]++;
        listArray[i].indent += indentOffset;
        _$jscoverage['/cmd.js'].lineData[174]++;
        i++;
      }
      _$jscoverage['/cmd.js'].lineData[176]++;
      i--;
    }
  }
  _$jscoverage['/cmd.js'].lineData[180]++;
  var newList = ListUtils.arrayToList(listArray, database, null, "p");
  _$jscoverage['/cmd.js'].lineData[183]++;
  var docFragment = newList.listNode, boundaryNode, siblingNode;
  _$jscoverage['/cmd.js'].lineData[185]++;
  function compensateBrs(isStart) {
    _$jscoverage['/cmd.js'].functionData[5]++;
    _$jscoverage['/cmd.js'].lineData[186]++;
    if (visit27_186_1((boundaryNode = new Node(docFragment[isStart ? 'firstChild' : 'lastChild'])) && visit28_187_1(!(visit29_187_2(visit30_187_3(boundaryNode[0].nodeType == Dom.NodeType.ELEMENT_NODE) && boundaryNode._4e_isBlockBoundary(undefined, undefined))) && visit31_189_1((siblingNode = groupObj.root[isStart ? 'prev' : 'next'](Walker.whitespaces(true), 1)) && !(visit32_191_1(visit33_191_2(boundaryNode[0].nodeType == Dom.NodeType.ELEMENT_NODE) && siblingNode._4e_isBlockBoundary({
  br: 1}, undefined))))))) {
      _$jscoverage['/cmd.js'].lineData[193]++;
      boundaryNode[isStart ? 'before' : 'after'](editor.get("document")[0].createElement('br'));
    }
  }
  _$jscoverage['/cmd.js'].lineData[197]++;
  compensateBrs(true);
  _$jscoverage['/cmd.js'].lineData[198]++;
  compensateBrs(undefined);
  _$jscoverage['/cmd.js'].lineData[199]++;
  groupObj.root.before(docFragment);
  _$jscoverage['/cmd.js'].lineData[200]++;
  groupObj.root.remove();
}, 
  exec: function(editor, listStyleType) {
  _$jscoverage['/cmd.js'].functionData[6]++;
  _$jscoverage['/cmd.js'].lineData[204]++;
  var selection = editor.getSelection(), ranges = visit34_205_1(selection && selection.getRanges());
  _$jscoverage['/cmd.js'].lineData[208]++;
  if (visit35_208_1(!ranges || visit36_208_2(ranges.length < 1))) {
    _$jscoverage['/cmd.js'].lineData[209]++;
    return;
  }
  _$jscoverage['/cmd.js'].lineData[212]++;
  var startElement = selection.getStartElement(), currentPath = new Editor.ElementPath(startElement);
  _$jscoverage['/cmd.js'].lineData[215]++;
  var state = queryActive(this.type, currentPath);
  _$jscoverage['/cmd.js'].lineData[217]++;
  var bookmarks = selection.createBookmarks(true);
  _$jscoverage['/cmd.js'].lineData[221]++;
  var listGroups = [], database = {};
  _$jscoverage['/cmd.js'].lineData[223]++;
  while (visit37_223_1(ranges.length > 0)) {
    _$jscoverage['/cmd.js'].lineData[224]++;
    var range = ranges.shift();
    _$jscoverage['/cmd.js'].lineData[226]++;
    var boundaryNodes = range.getBoundaryNodes(), startNode = boundaryNodes.startNode, endNode = boundaryNodes.endNode;
    _$jscoverage['/cmd.js'].lineData[230]++;
    if (visit38_230_1(visit39_230_2(startNode[0].nodeType == Dom.NodeType.ELEMENT_NODE) && visit40_230_3(startNode.nodeName() == 'td'))) {
      _$jscoverage['/cmd.js'].lineData[231]++;
      range.setStartAt(boundaryNodes.startNode, KER.POSITION_AFTER_START);
    }
    _$jscoverage['/cmd.js'].lineData[233]++;
    if (visit41_233_1(visit42_233_2(endNode[0].nodeType == Dom.NodeType.ELEMENT_NODE) && visit43_233_3(endNode.nodeName() == 'td'))) {
      _$jscoverage['/cmd.js'].lineData[234]++;
      range.setEndAt(boundaryNodes.endNode, KER.POSITION_BEFORE_END);
    }
    _$jscoverage['/cmd.js'].lineData[236]++;
    var iterator = range.createIterator(), block;
    _$jscoverage['/cmd.js'].lineData[239]++;
    iterator.forceBrBreak = false;
    _$jscoverage['/cmd.js'].lineData[241]++;
    while ((block = iterator.getNextParagraph())) {
      _$jscoverage['/cmd.js'].lineData[244]++;
      if (visit44_244_1(block.data('list_block'))) {
        _$jscoverage['/cmd.js'].lineData[245]++;
        continue;
      } else {
        _$jscoverage['/cmd.js'].lineData[247]++;
        block._4e_setMarker(database, 'list_block', 1, undefined);
      }
      _$jscoverage['/cmd.js'].lineData[250]++;
      var path = new ElementPath(block), pathElements = path.elements, pathElementsCount = pathElements.length, listNode = null, processedFlag = false, blockLimit = path.blockLimit, element;
      _$jscoverage['/cmd.js'].lineData[261]++;
      for (var i = pathElementsCount - 1; visit45_261_1(visit46_261_2(i >= 0) && (element = pathElements[i])); i--) {
        _$jscoverage['/cmd.js'].lineData[263]++;
        if (visit47_263_1(listNodeNames[element.nodeName()] && blockLimit.contains(element))) {
          _$jscoverage['/cmd.js'].lineData[271]++;
          blockLimit.removeData('list_group_object');
          _$jscoverage['/cmd.js'].lineData[273]++;
          var groupObj = element.data('list_group_object');
          _$jscoverage['/cmd.js'].lineData[274]++;
          if (visit48_274_1(groupObj)) {
            _$jscoverage['/cmd.js'].lineData[275]++;
            groupObj.contents.push(block);
          } else {
            _$jscoverage['/cmd.js'].lineData[277]++;
            groupObj = {
  root: element, 
  contents: [block]};
            _$jscoverage['/cmd.js'].lineData[278]++;
            listGroups.push(groupObj);
            _$jscoverage['/cmd.js'].lineData[279]++;
            element._4e_setMarker(database, 'list_group_object', groupObj, undefined);
          }
          _$jscoverage['/cmd.js'].lineData[281]++;
          processedFlag = true;
          _$jscoverage['/cmd.js'].lineData[282]++;
          break;
        }
      }
      _$jscoverage['/cmd.js'].lineData[286]++;
      if (visit49_286_1(processedFlag)) {
        _$jscoverage['/cmd.js'].lineData[287]++;
        continue;
      }
      _$jscoverage['/cmd.js'].lineData[291]++;
      var root = visit50_291_1(blockLimit || path.block);
      _$jscoverage['/cmd.js'].lineData[292]++;
      if (visit51_292_1(root.data('list_group_object'))) {
        _$jscoverage['/cmd.js'].lineData[293]++;
        root.data('list_group_object').contents.push(block);
      } else {
        _$jscoverage['/cmd.js'].lineData[295]++;
        groupObj = {
  root: root, 
  contents: [block]};
        _$jscoverage['/cmd.js'].lineData[296]++;
        root._4e_setMarker(database, 'list_group_object', groupObj, undefined);
        _$jscoverage['/cmd.js'].lineData[297]++;
        listGroups.push(groupObj);
      }
    }
  }
  _$jscoverage['/cmd.js'].lineData[305]++;
  var listsCreated = [];
  _$jscoverage['/cmd.js'].lineData[306]++;
  while (visit52_306_1(listGroups.length > 0)) {
    _$jscoverage['/cmd.js'].lineData[307]++;
    groupObj = listGroups.shift();
    _$jscoverage['/cmd.js'].lineData[308]++;
    if (visit53_308_1(!state)) {
      _$jscoverage['/cmd.js'].lineData[309]++;
      if (visit54_309_1(listNodeNames[groupObj.root.nodeName()])) {
        _$jscoverage['/cmd.js'].lineData[310]++;
        this.changeListType(editor, groupObj, database, listsCreated, listStyleType);
      } else {
        _$jscoverage['/cmd.js'].lineData[315]++;
        Editor.Utils.clearAllMarkers(database);
        _$jscoverage['/cmd.js'].lineData[316]++;
        this.createList(editor, groupObj, listsCreated, listStyleType);
      }
    } else {
      _$jscoverage['/cmd.js'].lineData[318]++;
      if (visit55_318_1(listNodeNames[groupObj.root.nodeName()])) {
        _$jscoverage['/cmd.js'].lineData[319]++;
        if (visit56_319_1(groupObj.root.css('list-style-type') == listStyleType)) {
          _$jscoverage['/cmd.js'].lineData[320]++;
          this.removeList(editor, groupObj, database);
        } else {
          _$jscoverage['/cmd.js'].lineData[322]++;
          groupObj.root.css('list-style-type', listStyleType);
        }
      }
    }
  }
  _$jscoverage['/cmd.js'].lineData[327]++;
  var self = this;
  _$jscoverage['/cmd.js'].lineData[330]++;
  for (i = 0; visit57_330_1(i < listsCreated.length); i++) {
    _$jscoverage['/cmd.js'].lineData[331]++;
    listNode = listsCreated[i];
    _$jscoverage['/cmd.js'].lineData[335]++;
    function mergeSibling(rtl, listNode) {
      _$jscoverage['/cmd.js'].functionData[7]++;
      _$jscoverage['/cmd.js'].lineData[336]++;
      var sibling = listNode[rtl ? 'prev' : 'next'](Walker.whitespaces(true), 1);
      _$jscoverage['/cmd.js'].lineData[338]++;
      if (visit58_338_1(sibling && visit59_339_1(sibling[0] && visit60_340_1(visit61_340_2(sibling.nodeName() == self.type) && visit62_342_1(sibling.css('list-style-type') == listStyleType))))) {
        _$jscoverage['/cmd.js'].lineData[343]++;
        sibling.remove();
        _$jscoverage['/cmd.js'].lineData[345]++;
        sibling._4e_moveChildren(listNode, rtl ? true : false, undefined);
      }
    }    _$jscoverage['/cmd.js'].lineData[349]++;
    mergeSibling(undefined, listNode);
    _$jscoverage['/cmd.js'].lineData[350]++;
    mergeSibling(true, listNode);
  }
  _$jscoverage['/cmd.js'].lineData[354]++;
  Editor.Utils.clearAllMarkers(database);
  _$jscoverage['/cmd.js'].lineData[355]++;
  selection.selectBookmarks(bookmarks);
}};
  _$jscoverage['/cmd.js'].lineData[359]++;
  function queryActive(type, elementPath) {
    _$jscoverage['/cmd.js'].functionData[8]++;
    _$jscoverage['/cmd.js'].lineData[360]++;
    var element, name, i, blockLimit = elementPath.blockLimit, elements = elementPath.elements;
    _$jscoverage['/cmd.js'].lineData[365]++;
    if (visit63_365_1(!blockLimit)) {
      _$jscoverage['/cmd.js'].lineData[366]++;
      return false;
    }
    _$jscoverage['/cmd.js'].lineData[369]++;
    if (visit64_369_1(elements)) {
      _$jscoverage['/cmd.js'].lineData[370]++;
      for (i = 0; visit65_370_1(visit66_370_2(i < elements.length) && visit67_371_1((element = elements[i]) && visit68_372_1(element[0] !== blockLimit[0]))); i++) {
        _$jscoverage['/cmd.js'].lineData[374]++;
        if (visit69_374_1(listNodeNames[name = element.nodeName()])) {
          _$jscoverage['/cmd.js'].lineData[375]++;
          if (visit70_375_1(name == type)) {
            _$jscoverage['/cmd.js'].lineData[376]++;
            return element.css('list-style-type');
          }
        }
      }
    }
    _$jscoverage['/cmd.js'].lineData[381]++;
    return false;
  }
  _$jscoverage['/cmd.js'].lineData[385]++;
  return {
  ListCommand: ListCommand, 
  queryActive: queryActive};
}, {
  requires: ['editor', '../list-utils']});
