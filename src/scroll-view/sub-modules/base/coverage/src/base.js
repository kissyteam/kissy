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
if (! _$jscoverage['/base.js']) {
  _$jscoverage['/base.js'] = {};
  _$jscoverage['/base.js'].lineData = [];
  _$jscoverage['/base.js'].lineData[6] = 0;
  _$jscoverage['/base.js'].lineData[7] = 0;
  _$jscoverage['/base.js'].lineData[8] = 0;
  _$jscoverage['/base.js'].lineData[9] = 0;
  _$jscoverage['/base.js'].lineData[10] = 0;
  _$jscoverage['/base.js'].lineData[12] = 0;
  _$jscoverage['/base.js'].lineData[15] = 0;
  _$jscoverage['/base.js'].lineData[16] = 0;
  _$jscoverage['/base.js'].lineData[20] = 0;
  _$jscoverage['/base.js'].lineData[21] = 0;
  _$jscoverage['/base.js'].lineData[23] = 0;
  _$jscoverage['/base.js'].lineData[24] = 0;
  _$jscoverage['/base.js'].lineData[26] = 0;
  _$jscoverage['/base.js'].lineData[29] = 0;
  _$jscoverage['/base.js'].lineData[30] = 0;
  _$jscoverage['/base.js'].lineData[33] = 0;
  _$jscoverage['/base.js'].lineData[34] = 0;
  _$jscoverage['/base.js'].lineData[42] = 0;
  _$jscoverage['/base.js'].lineData[45] = 0;
  _$jscoverage['/base.js'].lineData[49] = 0;
  _$jscoverage['/base.js'].lineData[50] = 0;
  _$jscoverage['/base.js'].lineData[51] = 0;
  _$jscoverage['/base.js'].lineData[52] = 0;
  _$jscoverage['/base.js'].lineData[54] = 0;
  _$jscoverage['/base.js'].lineData[56] = 0;
  _$jscoverage['/base.js'].lineData[57] = 0;
  _$jscoverage['/base.js'].lineData[59] = 0;
  _$jscoverage['/base.js'].lineData[60] = 0;
  _$jscoverage['/base.js'].lineData[63] = 0;
  _$jscoverage['/base.js'].lineData[68] = 0;
  _$jscoverage['/base.js'].lineData[71] = 0;
  _$jscoverage['/base.js'].lineData[76] = 0;
  _$jscoverage['/base.js'].lineData[78] = 0;
  _$jscoverage['/base.js'].lineData[82] = 0;
  _$jscoverage['/base.js'].lineData[83] = 0;
  _$jscoverage['/base.js'].lineData[84] = 0;
  _$jscoverage['/base.js'].lineData[89] = 0;
  _$jscoverage['/base.js'].lineData[90] = 0;
  _$jscoverage['/base.js'].lineData[93] = 0;
  _$jscoverage['/base.js'].lineData[94] = 0;
  _$jscoverage['/base.js'].lineData[101] = 0;
  _$jscoverage['/base.js'].lineData[102] = 0;
  _$jscoverage['/base.js'].lineData[103] = 0;
  _$jscoverage['/base.js'].lineData[108] = 0;
  _$jscoverage['/base.js'].lineData[113] = 0;
  _$jscoverage['/base.js'].lineData[122] = 0;
  _$jscoverage['/base.js'].lineData[124] = 0;
  _$jscoverage['/base.js'].lineData[128] = 0;
  _$jscoverage['/base.js'].lineData[133] = 0;
  _$jscoverage['/base.js'].lineData[140] = 0;
  _$jscoverage['/base.js'].lineData[144] = 0;
  _$jscoverage['/base.js'].lineData[148] = 0;
  _$jscoverage['/base.js'].lineData[150] = 0;
  _$jscoverage['/base.js'].lineData[154] = 0;
  _$jscoverage['/base.js'].lineData[155] = 0;
  _$jscoverage['/base.js'].lineData[156] = 0;
  _$jscoverage['/base.js'].lineData[157] = 0;
  _$jscoverage['/base.js'].lineData[160] = 0;
  _$jscoverage['/base.js'].lineData[161] = 0;
  _$jscoverage['/base.js'].lineData[164] = 0;
  _$jscoverage['/base.js'].lineData[165] = 0;
  _$jscoverage['/base.js'].lineData[166] = 0;
  _$jscoverage['/base.js'].lineData[167] = 0;
  _$jscoverage['/base.js'].lineData[168] = 0;
  _$jscoverage['/base.js'].lineData[169] = 0;
  _$jscoverage['/base.js'].lineData[170] = 0;
  _$jscoverage['/base.js'].lineData[171] = 0;
  _$jscoverage['/base.js'].lineData[172] = 0;
  _$jscoverage['/base.js'].lineData[173] = 0;
  _$jscoverage['/base.js'].lineData[176] = 0;
  _$jscoverage['/base.js'].lineData[177] = 0;
  _$jscoverage['/base.js'].lineData[178] = 0;
  _$jscoverage['/base.js'].lineData[179] = 0;
  _$jscoverage['/base.js'].lineData[180] = 0;
  _$jscoverage['/base.js'].lineData[181] = 0;
  _$jscoverage['/base.js'].lineData[182] = 0;
  _$jscoverage['/base.js'].lineData[183] = 0;
  _$jscoverage['/base.js'].lineData[184] = 0;
  _$jscoverage['/base.js'].lineData[187] = 0;
  _$jscoverage['/base.js'].lineData[191] = 0;
  _$jscoverage['/base.js'].lineData[192] = 0;
  _$jscoverage['/base.js'].lineData[193] = 0;
  _$jscoverage['/base.js'].lineData[195] = 0;
  _$jscoverage['/base.js'].lineData[196] = 0;
  _$jscoverage['/base.js'].lineData[197] = 0;
  _$jscoverage['/base.js'].lineData[198] = 0;
  _$jscoverage['/base.js'].lineData[202] = 0;
  _$jscoverage['/base.js'].lineData[206] = 0;
  _$jscoverage['/base.js'].lineData[207] = 0;
  _$jscoverage['/base.js'].lineData[209] = 0;
  _$jscoverage['/base.js'].lineData[218] = 0;
  _$jscoverage['/base.js'].lineData[219] = 0;
  _$jscoverage['/base.js'].lineData[220] = 0;
  _$jscoverage['/base.js'].lineData[221] = 0;
  _$jscoverage['/base.js'].lineData[222] = 0;
  _$jscoverage['/base.js'].lineData[223] = 0;
  _$jscoverage['/base.js'].lineData[224] = 0;
  _$jscoverage['/base.js'].lineData[228] = 0;
  _$jscoverage['/base.js'].lineData[229] = 0;
  _$jscoverage['/base.js'].lineData[230] = 0;
  _$jscoverage['/base.js'].lineData[231] = 0;
  _$jscoverage['/base.js'].lineData[232] = 0;
  _$jscoverage['/base.js'].lineData[233] = 0;
  _$jscoverage['/base.js'].lineData[234] = 0;
  _$jscoverage['/base.js'].lineData[240] = 0;
  _$jscoverage['/base.js'].lineData[241] = 0;
  _$jscoverage['/base.js'].lineData[242] = 0;
  _$jscoverage['/base.js'].lineData[243] = 0;
  _$jscoverage['/base.js'].lineData[245] = 0;
  _$jscoverage['/base.js'].lineData[247] = 0;
  _$jscoverage['/base.js'].lineData[254] = 0;
  _$jscoverage['/base.js'].lineData[258] = 0;
  _$jscoverage['/base.js'].lineData[259] = 0;
  _$jscoverage['/base.js'].lineData[260] = 0;
  _$jscoverage['/base.js'].lineData[261] = 0;
  _$jscoverage['/base.js'].lineData[262] = 0;
  _$jscoverage['/base.js'].lineData[264] = 0;
  _$jscoverage['/base.js'].lineData[265] = 0;
  _$jscoverage['/base.js'].lineData[266] = 0;
  _$jscoverage['/base.js'].lineData[267] = 0;
  _$jscoverage['/base.js'].lineData[268] = 0;
  _$jscoverage['/base.js'].lineData[272] = 0;
  _$jscoverage['/base.js'].lineData[273] = 0;
  _$jscoverage['/base.js'].lineData[274] = 0;
  _$jscoverage['/base.js'].lineData[275] = 0;
  _$jscoverage['/base.js'].lineData[279] = 0;
  _$jscoverage['/base.js'].lineData[283] = 0;
  _$jscoverage['/base.js'].lineData[285] = 0;
  _$jscoverage['/base.js'].lineData[286] = 0;
  _$jscoverage['/base.js'].lineData[287] = 0;
  _$jscoverage['/base.js'].lineData[292] = 0;
  _$jscoverage['/base.js'].lineData[293] = 0;
  _$jscoverage['/base.js'].lineData[294] = 0;
  _$jscoverage['/base.js'].lineData[295] = 0;
  _$jscoverage['/base.js'].lineData[296] = 0;
  _$jscoverage['/base.js'].lineData[298] = 0;
  _$jscoverage['/base.js'].lineData[299] = 0;
  _$jscoverage['/base.js'].lineData[301] = 0;
  _$jscoverage['/base.js'].lineData[305] = 0;
  _$jscoverage['/base.js'].lineData[308] = 0;
  _$jscoverage['/base.js'].lineData[309] = 0;
  _$jscoverage['/base.js'].lineData[311] = 0;
  _$jscoverage['/base.js'].lineData[312] = 0;
  _$jscoverage['/base.js'].lineData[313] = 0;
  _$jscoverage['/base.js'].lineData[315] = 0;
  _$jscoverage['/base.js'].lineData[316] = 0;
  _$jscoverage['/base.js'].lineData[317] = 0;
  _$jscoverage['/base.js'].lineData[319] = 0;
  _$jscoverage['/base.js'].lineData[320] = 0;
  _$jscoverage['/base.js'].lineData[321] = 0;
  _$jscoverage['/base.js'].lineData[322] = 0;
  _$jscoverage['/base.js'].lineData[323] = 0;
  _$jscoverage['/base.js'].lineData[324] = 0;
  _$jscoverage['/base.js'].lineData[325] = 0;
  _$jscoverage['/base.js'].lineData[327] = 0;
  _$jscoverage['/base.js'].lineData[328] = 0;
  _$jscoverage['/base.js'].lineData[330] = 0;
  _$jscoverage['/base.js'].lineData[331] = 0;
}
if (! _$jscoverage['/base.js'].functionData) {
  _$jscoverage['/base.js'].functionData = [];
  _$jscoverage['/base.js'].functionData[0] = 0;
  _$jscoverage['/base.js'].functionData[1] = 0;
  _$jscoverage['/base.js'].functionData[2] = 0;
  _$jscoverage['/base.js'].functionData[3] = 0;
  _$jscoverage['/base.js'].functionData[4] = 0;
  _$jscoverage['/base.js'].functionData[5] = 0;
  _$jscoverage['/base.js'].functionData[6] = 0;
  _$jscoverage['/base.js'].functionData[7] = 0;
  _$jscoverage['/base.js'].functionData[8] = 0;
  _$jscoverage['/base.js'].functionData[9] = 0;
  _$jscoverage['/base.js'].functionData[10] = 0;
  _$jscoverage['/base.js'].functionData[11] = 0;
  _$jscoverage['/base.js'].functionData[12] = 0;
  _$jscoverage['/base.js'].functionData[13] = 0;
  _$jscoverage['/base.js'].functionData[14] = 0;
  _$jscoverage['/base.js'].functionData[15] = 0;
  _$jscoverage['/base.js'].functionData[16] = 0;
  _$jscoverage['/base.js'].functionData[17] = 0;
}
if (! _$jscoverage['/base.js'].branchData) {
  _$jscoverage['/base.js'].branchData = {};
  _$jscoverage['/base.js'].branchData['20'] = [];
  _$jscoverage['/base.js'].branchData['20'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['23'] = [];
  _$jscoverage['/base.js'].branchData['23'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['56'] = [];
  _$jscoverage['/base.js'].branchData['56'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['59'] = [];
  _$jscoverage['/base.js'].branchData['59'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['82'] = [];
  _$jscoverage['/base.js'].branchData['82'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['84'] = [];
  _$jscoverage['/base.js'].branchData['84'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['93'] = [];
  _$jscoverage['/base.js'].branchData['93'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['93'][2] = new BranchData();
  _$jscoverage['/base.js'].branchData['93'][3] = new BranchData();
  _$jscoverage['/base.js'].branchData['101'] = [];
  _$jscoverage['/base.js'].branchData['101'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['144'] = [];
  _$jscoverage['/base.js'].branchData['144'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['144'][2] = new BranchData();
  _$jscoverage['/base.js'].branchData['145'] = [];
  _$jscoverage['/base.js'].branchData['145'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['145'][2] = new BranchData();
  _$jscoverage['/base.js'].branchData['146'] = [];
  _$jscoverage['/base.js'].branchData['146'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['146'][2] = new BranchData();
  _$jscoverage['/base.js'].branchData['156'] = [];
  _$jscoverage['/base.js'].branchData['156'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['160'] = [];
  _$jscoverage['/base.js'].branchData['160'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['165'] = [];
  _$jscoverage['/base.js'].branchData['165'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['168'] = [];
  _$jscoverage['/base.js'].branchData['168'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['171'] = [];
  _$jscoverage['/base.js'].branchData['171'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['176'] = [];
  _$jscoverage['/base.js'].branchData['176'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['179'] = [];
  _$jscoverage['/base.js'].branchData['179'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['182'] = [];
  _$jscoverage['/base.js'].branchData['182'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['192'] = [];
  _$jscoverage['/base.js'].branchData['192'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['206'] = [];
  _$jscoverage['/base.js'].branchData['206'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['218'] = [];
  _$jscoverage['/base.js'].branchData['218'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['222'] = [];
  _$jscoverage['/base.js'].branchData['222'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['222'][2] = new BranchData();
  _$jscoverage['/base.js'].branchData['222'][3] = new BranchData();
  _$jscoverage['/base.js'].branchData['222'][4] = new BranchData();
  _$jscoverage['/base.js'].branchData['222'][5] = new BranchData();
  _$jscoverage['/base.js'].branchData['222'][6] = new BranchData();
  _$jscoverage['/base.js'].branchData['222'][7] = new BranchData();
  _$jscoverage['/base.js'].branchData['222'][8] = new BranchData();
  _$jscoverage['/base.js'].branchData['228'] = [];
  _$jscoverage['/base.js'].branchData['228'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['232'] = [];
  _$jscoverage['/base.js'].branchData['232'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['232'][2] = new BranchData();
  _$jscoverage['/base.js'].branchData['232'][3] = new BranchData();
  _$jscoverage['/base.js'].branchData['232'][4] = new BranchData();
  _$jscoverage['/base.js'].branchData['232'][5] = new BranchData();
  _$jscoverage['/base.js'].branchData['232'][6] = new BranchData();
  _$jscoverage['/base.js'].branchData['232'][7] = new BranchData();
  _$jscoverage['/base.js'].branchData['232'][8] = new BranchData();
  _$jscoverage['/base.js'].branchData['241'] = [];
  _$jscoverage['/base.js'].branchData['241'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['264'] = [];
  _$jscoverage['/base.js'].branchData['264'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['265'] = [];
  _$jscoverage['/base.js'].branchData['265'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['267'] = [];
  _$jscoverage['/base.js'].branchData['267'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['272'] = [];
  _$jscoverage['/base.js'].branchData['272'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['274'] = [];
  _$jscoverage['/base.js'].branchData['274'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['285'] = [];
  _$jscoverage['/base.js'].branchData['285'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['295'] = [];
  _$jscoverage['/base.js'].branchData['295'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['298'] = [];
  _$jscoverage['/base.js'].branchData['298'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['308'] = [];
  _$jscoverage['/base.js'].branchData['308'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['311'] = [];
  _$jscoverage['/base.js'].branchData['311'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['315'] = [];
  _$jscoverage['/base.js'].branchData['315'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['327'] = [];
  _$jscoverage['/base.js'].branchData['327'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['330'] = [];
  _$jscoverage['/base.js'].branchData['330'][1] = new BranchData();
}
_$jscoverage['/base.js'].branchData['330'][1].init(131, 17, 'top !== undefined');
function visit60_330_1(result) {
  _$jscoverage['/base.js'].branchData['330'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['327'][1].init(21, 18, 'left !== undefined');
function visit59_327_1(result) {
  _$jscoverage['/base.js'].branchData['327'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['315'][1].init(245, 17, 'top !== undefined');
function visit58_315_1(result) {
  _$jscoverage['/base.js'].branchData['315'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['311'][1].init(81, 18, 'left !== undefined');
function visit57_311_1(result) {
  _$jscoverage['/base.js'].branchData['311'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['308'][1].init(110, 7, 'animCfg');
function visit56_308_1(result) {
  _$jscoverage['/base.js'].branchData['308'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['298'][1].init(265, 7, 'cfg.top');
function visit55_298_1(result) {
  _$jscoverage['/base.js'].branchData['298'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['295'][1].init(134, 8, 'cfg.left');
function visit54_295_1(result) {
  _$jscoverage['/base.js'].branchData['295'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['285'][1].init(75, 51, '(pageOffset = self.pagesOffset) && pageOffset[index]');
function visit53_285_1(result) {
  _$jscoverage['/base.js'].branchData['285'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['274'][1].init(70, 15, 'offset[p2] <= v');
function visit52_274_1(result) {
  _$jscoverage['/base.js'].branchData['274'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['272'][1].init(50, 6, 'i >= 0');
function visit51_272_1(result) {
  _$jscoverage['/base.js'].branchData['272'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['267'][1].init(70, 15, 'offset[p2] >= v');
function visit50_267_1(result) {
  _$jscoverage['/base.js'].branchData['267'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['265'][1].init(29, 22, 'i < pagesOffset.length');
function visit49_265_1(result) {
  _$jscoverage['/base.js'].branchData['265'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['264'][1].init(254, 13, 'direction > 0');
function visit48_264_1(result) {
  _$jscoverage['/base.js'].branchData['264'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['241'][1].init(46, 23, 'self.scrollAnims.length');
function visit47_241_1(result) {
  _$jscoverage['/base.js'].branchData['241'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['232'][8].init(212, 10, 'deltaX < 0');
function visit46_232_8(result) {
  _$jscoverage['/base.js'].branchData['232'][8].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['232'][7].init(191, 17, 'scrollLeft >= max');
function visit45_232_7(result) {
  _$jscoverage['/base.js'].branchData['232'][7].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['232'][6].init(191, 31, 'scrollLeft >= max && deltaX < 0');
function visit44_232_6(result) {
  _$jscoverage['/base.js'].branchData['232'][6].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['232'][5].init(177, 10, 'deltaX > 0');
function visit43_232_5(result) {
  _$jscoverage['/base.js'].branchData['232'][5].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['232'][4].init(156, 17, 'scrollLeft <= min');
function visit42_232_4(result) {
  _$jscoverage['/base.js'].branchData['232'][4].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['232'][3].init(156, 31, 'scrollLeft <= min && deltaX > 0');
function visit41_232_3(result) {
  _$jscoverage['/base.js'].branchData['232'][3].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['232'][2].init(156, 66, 'scrollLeft <= min && deltaX > 0 || scrollLeft >= max && deltaX < 0');
function visit40_232_2(result) {
  _$jscoverage['/base.js'].branchData['232'][2].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['232'][1].init(154, 69, '!(scrollLeft <= min && deltaX > 0 || scrollLeft >= max && deltaX < 0)');
function visit39_232_1(result) {
  _$jscoverage['/base.js'].branchData['232'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['228'][1].init(802, 43, '(deltaX = e.deltaX) && self.allowScroll.left');
function visit38_228_1(result) {
  _$jscoverage['/base.js'].branchData['228'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['222'][8].init(206, 10, 'deltaY < 0');
function visit37_222_8(result) {
  _$jscoverage['/base.js'].branchData['222'][8].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['222'][7].init(186, 16, 'scrollTop >= max');
function visit36_222_7(result) {
  _$jscoverage['/base.js'].branchData['222'][7].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['222'][6].init(186, 30, 'scrollTop >= max && deltaY < 0');
function visit35_222_6(result) {
  _$jscoverage['/base.js'].branchData['222'][6].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['222'][5].init(172, 10, 'deltaY > 0');
function visit34_222_5(result) {
  _$jscoverage['/base.js'].branchData['222'][5].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['222'][4].init(152, 16, 'scrollTop <= min');
function visit33_222_4(result) {
  _$jscoverage['/base.js'].branchData['222'][4].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['222'][3].init(152, 30, 'scrollTop <= min && deltaY > 0');
function visit32_222_3(result) {
  _$jscoverage['/base.js'].branchData['222'][3].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['222'][2].init(152, 64, 'scrollTop <= min && deltaY > 0 || scrollTop >= max && deltaY < 0');
function visit31_222_2(result) {
  _$jscoverage['/base.js'].branchData['222'][2].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['222'][1].init(150, 67, '!(scrollTop <= min && deltaY > 0 || scrollTop >= max && deltaY < 0)');
function visit30_222_1(result) {
  _$jscoverage['/base.js'].branchData['222'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['218'][1].init(355, 42, '(deltaY = e.deltaY) && self.allowScroll.top');
function visit29_218_1(result) {
  _$jscoverage['/base.js'].branchData['218'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['206'][1].init(17, 20, 'this.get(\'disabled\')');
function visit28_206_1(result) {
  _$jscoverage['/base.js'].branchData['206'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['192'][1].init(49, 18, 'control.scrollStep');
function visit27_192_1(result) {
  _$jscoverage['/base.js'].branchData['192'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['182'][1].init(296, 24, 'keyCode === KeyCode.LEFT');
function visit26_182_1(result) {
  _$jscoverage['/base.js'].branchData['182'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['179'][1].init(129, 25, 'keyCode === KeyCode.RIGHT');
function visit25_179_1(result) {
  _$jscoverage['/base.js'].branchData['179'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['176'][1].init(1618, 6, 'allowX');
function visit24_176_1(result) {
  _$jscoverage['/base.js'].branchData['176'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['171'][1].init(722, 27, 'keyCode === KeyCode.PAGE_UP');
function visit23_171_1(result) {
  _$jscoverage['/base.js'].branchData['171'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['168'][1].init(552, 29, 'keyCode === KeyCode.PAGE_DOWN');
function visit22_168_1(result) {
  _$jscoverage['/base.js'].branchData['168'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['165'][1].init(390, 22, 'keyCode === KeyCode.UP');
function visit21_165_1(result) {
  _$jscoverage['/base.js'].branchData['165'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['160'][1].init(180, 24, 'keyCode === KeyCode.DOWN');
function visit20_160_1(result) {
  _$jscoverage['/base.js'].branchData['160'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['156'][1].init(702, 6, 'allowY');
function visit19_156_1(result) {
  _$jscoverage['/base.js'].branchData['156'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['146'][2].init(330, 21, 'nodeName === \'select\'');
function visit18_146_2(result) {
  _$jscoverage['/base.js'].branchData['146'][2].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['146'][1].init(42, 75, 'nodeName === \'select\' || $target.hasAttr(\'contenteditable\')');
function visit17_146_1(result) {
  _$jscoverage['/base.js'].branchData['146'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['145'][2].init(286, 23, 'nodeName === \'textarea\'');
function visit16_145_2(result) {
  _$jscoverage['/base.js'].branchData['145'][2].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['145'][1].init(39, 118, 'nodeName === \'textarea\' || nodeName === \'select\' || $target.hasAttr(\'contenteditable\')');
function visit15_145_1(result) {
  _$jscoverage['/base.js'].branchData['145'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['144'][2].init(244, 20, 'nodeName === \'input\'');
function visit14_144_2(result) {
  _$jscoverage['/base.js'].branchData['144'][2].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['144'][1].init(244, 158, 'nodeName === \'input\' || nodeName === \'textarea\' || nodeName === \'select\' || $target.hasAttr(\'contenteditable\')');
function visit13_144_1(result) {
  _$jscoverage['/base.js'].branchData['144'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['101'][1].init(786, 9, 'pageIndex');
function visit12_101_1(result) {
  _$jscoverage['/base.js'].branchData['101'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['93'][3].init(196, 19, 'top <= maxScrollTop');
function visit11_93_3(result) {
  _$jscoverage['/base.js'].branchData['93'][3].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['93'][2].init(171, 21, 'left <= maxScrollLeft');
function visit10_93_2(result) {
  _$jscoverage['/base.js'].branchData['93'][2].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['93'][1].init(171, 44, 'left <= maxScrollLeft && top <= maxScrollTop');
function visit9_93_1(result) {
  _$jscoverage['/base.js'].branchData['93'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['84'][1].init(89, 24, 'typeof snap === \'string\'');
function visit8_84_1(result) {
  _$jscoverage['/base.js'].branchData['84'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['82'][1].init(1424, 4, 'snap');
function visit7_82_1(result) {
  _$jscoverage['/base.js'].branchData['82'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['59'][1].init(860, 25, 'scrollWidth > clientWidth');
function visit6_59_1(result) {
  _$jscoverage['/base.js'].branchData['59'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['56'][1].init(774, 27, 'scrollHeight > clientHeight');
function visit5_56_1(result) {
  _$jscoverage['/base.js'].branchData['56'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['23'][1].init(247, 10, 'scrollLeft');
function visit4_23_1(result) {
  _$jscoverage['/base.js'].branchData['23'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['20'][1].init(142, 9, 'scrollTop');
function visit3_20_1(result) {
  _$jscoverage['/base.js'].branchData['20'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/base.js'].functionData[0]++;
  _$jscoverage['/base.js'].lineData[7]++;
  var Node = require('node');
  _$jscoverage['/base.js'].lineData[8]++;
  var Anim = require('anim');
  _$jscoverage['/base.js'].lineData[9]++;
  var Container = require('component/container');
  _$jscoverage['/base.js'].lineData[10]++;
  var Render = require('./base/render');
  _$jscoverage['/base.js'].lineData[12]++;
  var $ = S.all, KeyCode = Node.KeyCode;
  _$jscoverage['/base.js'].lineData[15]++;
  function onElScroll() {
    _$jscoverage['/base.js'].functionData[1]++;
    _$jscoverage['/base.js'].lineData[16]++;
    var self = this, el = self.el, scrollTop = el.scrollTop, scrollLeft = el.scrollLeft;
    _$jscoverage['/base.js'].lineData[20]++;
    if (visit3_20_1(scrollTop)) {
      _$jscoverage['/base.js'].lineData[21]++;
      self.set('scrollTop', scrollTop + self.get('scrollTop'));
    }
    _$jscoverage['/base.js'].lineData[23]++;
    if (visit4_23_1(scrollLeft)) {
      _$jscoverage['/base.js'].lineData[24]++;
      self.set('scrollLeft', scrollLeft + self.get('scrollLeft'));
    }
    _$jscoverage['/base.js'].lineData[26]++;
    el.scrollTop = el.scrollLeft = 0;
  }
  _$jscoverage['/base.js'].lineData[29]++;
  function frame(anim, fx) {
    _$jscoverage['/base.js'].functionData[2]++;
    _$jscoverage['/base.js'].lineData[30]++;
    anim.scrollView.set(fx.prop, fx.val);
  }
  _$jscoverage['/base.js'].lineData[33]++;
  function reflow(v) {
    _$jscoverage['/base.js'].functionData[3]++;
    _$jscoverage['/base.js'].lineData[34]++;
    var control = this, $contentEl = control.$contentEl;
    _$jscoverage['/base.js'].lineData[42]++;
    var scrollHeight = v.scrollHeight, scrollWidth = v.scrollWidth;
    _$jscoverage['/base.js'].lineData[45]++;
    var clientHeight = v.clientHeight, allowScroll, clientWidth = v.clientWidth;
    _$jscoverage['/base.js'].lineData[49]++;
    control.scrollHeight = scrollHeight;
    _$jscoverage['/base.js'].lineData[50]++;
    control.scrollWidth = scrollWidth;
    _$jscoverage['/base.js'].lineData[51]++;
    control.clientHeight = clientHeight;
    _$jscoverage['/base.js'].lineData[52]++;
    control.clientWidth = clientWidth;
    _$jscoverage['/base.js'].lineData[54]++;
    allowScroll = control.allowScroll = {};
    _$jscoverage['/base.js'].lineData[56]++;
    if (visit5_56_1(scrollHeight > clientHeight)) {
      _$jscoverage['/base.js'].lineData[57]++;
      allowScroll.top = 1;
    }
    _$jscoverage['/base.js'].lineData[59]++;
    if (visit6_59_1(scrollWidth > clientWidth)) {
      _$jscoverage['/base.js'].lineData[60]++;
      allowScroll.left = 1;
    }
    _$jscoverage['/base.js'].lineData[63]++;
    control.minScroll = {
  left: 0, 
  top: 0};
    _$jscoverage['/base.js'].lineData[68]++;
    var maxScrollLeft, maxScrollTop;
    _$jscoverage['/base.js'].lineData[71]++;
    control.maxScroll = {
  left: maxScrollLeft = scrollWidth - clientWidth, 
  top: maxScrollTop = scrollHeight - clientHeight};
    _$jscoverage['/base.js'].lineData[76]++;
    delete control.scrollStep;
    _$jscoverage['/base.js'].lineData[78]++;
    var snap = control.get('snap'), scrollLeft = control.get('scrollLeft'), scrollTop = control.get('scrollTop');
    _$jscoverage['/base.js'].lineData[82]++;
    if (visit7_82_1(snap)) {
      _$jscoverage['/base.js'].lineData[83]++;
      var elOffset = $contentEl.offset();
      _$jscoverage['/base.js'].lineData[84]++;
      var pages = control.pages = visit8_84_1(typeof snap === 'string') ? $contentEl.all(snap) : $contentEl.children(), pageIndex = control.get('pageIndex'), pagesOffset = control.pagesOffset = [];
      _$jscoverage['/base.js'].lineData[89]++;
      pages.each(function(p, i) {
  _$jscoverage['/base.js'].functionData[4]++;
  _$jscoverage['/base.js'].lineData[90]++;
  var offset = p.offset(), left = offset.left - elOffset.left, top = offset.top - elOffset.top;
  _$jscoverage['/base.js'].lineData[93]++;
  if (visit9_93_1(visit10_93_2(left <= maxScrollLeft) && visit11_93_3(top <= maxScrollTop))) {
    _$jscoverage['/base.js'].lineData[94]++;
    pagesOffset[i] = {
  left: left, 
  top: top, 
  index: i};
  }
});
      _$jscoverage['/base.js'].lineData[101]++;
      if (visit12_101_1(pageIndex)) {
        _$jscoverage['/base.js'].lineData[102]++;
        control.scrollToPage(pageIndex);
        _$jscoverage['/base.js'].lineData[103]++;
        return;
      }
    }
    _$jscoverage['/base.js'].lineData[108]++;
    control.scrollToWithBounds({
  left: scrollLeft, 
  top: scrollTop});
    _$jscoverage['/base.js'].lineData[113]++;
    control.fire('reflow', v);
  }
  _$jscoverage['/base.js'].lineData[122]++;
  return Container.extend({
  initializer: function() {
  _$jscoverage['/base.js'].functionData[5]++;
  _$jscoverage['/base.js'].lineData[124]++;
  this.scrollAnims = [];
}, 
  bindUI: function() {
  _$jscoverage['/base.js'].functionData[6]++;
  _$jscoverage['/base.js'].lineData[128]++;
  var self = this, $el = self.$el;
  _$jscoverage['/base.js'].lineData[133]++;
  $el.on('mousewheel', self.handleMouseWheel, self).on('scroll', onElScroll, self);
}, 
  _onSetDimension: reflow, 
  handleKeyDownInternal: function(e) {
  _$jscoverage['/base.js'].functionData[7]++;
  _$jscoverage['/base.js'].lineData[140]++;
  var target = e.target, $target = $(target), nodeName = $target.nodeName();
  _$jscoverage['/base.js'].lineData[144]++;
  if (visit13_144_1(visit14_144_2(nodeName === 'input') || visit15_145_1(visit16_145_2(nodeName === 'textarea') || visit17_146_1(visit18_146_2(nodeName === 'select') || $target.hasAttr('contenteditable'))))) {
    _$jscoverage['/base.js'].lineData[148]++;
    return undefined;
  }
  _$jscoverage['/base.js'].lineData[150]++;
  var self = this, keyCode = e.keyCode, scrollStep = self.getScrollStep(), ok;
  _$jscoverage['/base.js'].lineData[154]++;
  var allowX = self.allowScroll.left;
  _$jscoverage['/base.js'].lineData[155]++;
  var allowY = self.allowScroll.top;
  _$jscoverage['/base.js'].lineData[156]++;
  if (visit19_156_1(allowY)) {
    _$jscoverage['/base.js'].lineData[157]++;
    var scrollStepY = scrollStep.top, clientHeight = self.clientHeight, scrollTop = self.get('scrollTop');
    _$jscoverage['/base.js'].lineData[160]++;
    if (visit20_160_1(keyCode === KeyCode.DOWN)) {
      _$jscoverage['/base.js'].lineData[161]++;
      self.scrollToWithBounds({
  top: scrollTop + scrollStepY});
      _$jscoverage['/base.js'].lineData[164]++;
      ok = true;
    } else {
      _$jscoverage['/base.js'].lineData[165]++;
      if (visit21_165_1(keyCode === KeyCode.UP)) {
        _$jscoverage['/base.js'].lineData[166]++;
        self.scrollToWithBounds({
  top: scrollTop - scrollStepY});
        _$jscoverage['/base.js'].lineData[167]++;
        ok = true;
      } else {
        _$jscoverage['/base.js'].lineData[168]++;
        if (visit22_168_1(keyCode === KeyCode.PAGE_DOWN)) {
          _$jscoverage['/base.js'].lineData[169]++;
          self.scrollToWithBounds({
  top: scrollTop + clientHeight});
          _$jscoverage['/base.js'].lineData[170]++;
          ok = true;
        } else {
          _$jscoverage['/base.js'].lineData[171]++;
          if (visit23_171_1(keyCode === KeyCode.PAGE_UP)) {
            _$jscoverage['/base.js'].lineData[172]++;
            self.scrollToWithBounds({
  top: scrollTop - clientHeight});
            _$jscoverage['/base.js'].lineData[173]++;
            ok = true;
          }
        }
      }
    }
  }
  _$jscoverage['/base.js'].lineData[176]++;
  if (visit24_176_1(allowX)) {
    _$jscoverage['/base.js'].lineData[177]++;
    var scrollStepX = scrollStep.left;
    _$jscoverage['/base.js'].lineData[178]++;
    var scrollLeft = self.get('scrollLeft');
    _$jscoverage['/base.js'].lineData[179]++;
    if (visit25_179_1(keyCode === KeyCode.RIGHT)) {
      _$jscoverage['/base.js'].lineData[180]++;
      self.scrollToWithBounds({
  left: scrollLeft + scrollStepX});
      _$jscoverage['/base.js'].lineData[181]++;
      ok = true;
    } else {
      _$jscoverage['/base.js'].lineData[182]++;
      if (visit26_182_1(keyCode === KeyCode.LEFT)) {
        _$jscoverage['/base.js'].lineData[183]++;
        self.scrollToWithBounds({
  left: scrollLeft - scrollStepX});
        _$jscoverage['/base.js'].lineData[184]++;
        ok = true;
      }
    }
  }
  _$jscoverage['/base.js'].lineData[187]++;
  return ok;
}, 
  getScrollStep: function() {
  _$jscoverage['/base.js'].functionData[8]++;
  _$jscoverage['/base.js'].lineData[191]++;
  var control = this;
  _$jscoverage['/base.js'].lineData[192]++;
  if (visit27_192_1(control.scrollStep)) {
    _$jscoverage['/base.js'].lineData[193]++;
    return control.scrollStep;
  }
  _$jscoverage['/base.js'].lineData[195]++;
  var elDoc = $(this.get('el')[0].ownerDocument);
  _$jscoverage['/base.js'].lineData[196]++;
  var clientHeight = control.clientHeight;
  _$jscoverage['/base.js'].lineData[197]++;
  var clientWidth = control.clientWidth;
  _$jscoverage['/base.js'].lineData[198]++;
  control.scrollStep = {
  top: Math.max(clientHeight * clientHeight * 0.7 / elDoc.height(), 20), 
  left: Math.max(clientWidth * clientWidth * 0.7 / elDoc.width(), 20)};
  _$jscoverage['/base.js'].lineData[202]++;
  return control.scrollStep;
}, 
  handleMouseWheel: function(e) {
  _$jscoverage['/base.js'].functionData[9]++;
  _$jscoverage['/base.js'].lineData[206]++;
  if (visit28_206_1(this.get('disabled'))) {
    _$jscoverage['/base.js'].lineData[207]++;
    return;
  }
  _$jscoverage['/base.js'].lineData[209]++;
  var max, min, self = this, scrollStep = self.getScrollStep(), deltaY, deltaX, maxScroll = self.maxScroll, minScroll = self.minScroll;
  _$jscoverage['/base.js'].lineData[218]++;
  if (visit29_218_1((deltaY = e.deltaY) && self.allowScroll.top)) {
    _$jscoverage['/base.js'].lineData[219]++;
    var scrollTop = self.get('scrollTop');
    _$jscoverage['/base.js'].lineData[220]++;
    max = maxScroll.top;
    _$jscoverage['/base.js'].lineData[221]++;
    min = minScroll.top;
    _$jscoverage['/base.js'].lineData[222]++;
    if (visit30_222_1(!(visit31_222_2(visit32_222_3(visit33_222_4(scrollTop <= min) && visit34_222_5(deltaY > 0)) || visit35_222_6(visit36_222_7(scrollTop >= max) && visit37_222_8(deltaY < 0)))))) {
      _$jscoverage['/base.js'].lineData[223]++;
      self.scrollToWithBounds({
  top: scrollTop - e.deltaY * scrollStep.top});
      _$jscoverage['/base.js'].lineData[224]++;
      e.preventDefault();
    }
  }
  _$jscoverage['/base.js'].lineData[228]++;
  if (visit38_228_1((deltaX = e.deltaX) && self.allowScroll.left)) {
    _$jscoverage['/base.js'].lineData[229]++;
    var scrollLeft = self.get('scrollLeft');
    _$jscoverage['/base.js'].lineData[230]++;
    max = maxScroll.left;
    _$jscoverage['/base.js'].lineData[231]++;
    min = minScroll.left;
    _$jscoverage['/base.js'].lineData[232]++;
    if (visit39_232_1(!(visit40_232_2(visit41_232_3(visit42_232_4(scrollLeft <= min) && visit43_232_5(deltaX > 0)) || visit44_232_6(visit45_232_7(scrollLeft >= max) && visit46_232_8(deltaX < 0)))))) {
      _$jscoverage['/base.js'].lineData[233]++;
      self.scrollToWithBounds({
  left: scrollLeft - e.deltaX * scrollStep.left});
      _$jscoverage['/base.js'].lineData[234]++;
      e.preventDefault();
    }
  }
}, 
  stopAnimation: function() {
  _$jscoverage['/base.js'].functionData[10]++;
  _$jscoverage['/base.js'].lineData[240]++;
  var self = this;
  _$jscoverage['/base.js'].lineData[241]++;
  if (visit47_241_1(self.scrollAnims.length)) {
    _$jscoverage['/base.js'].lineData[242]++;
    S.each(self.scrollAnims, function(scrollAnim) {
  _$jscoverage['/base.js'].functionData[11]++;
  _$jscoverage['/base.js'].lineData[243]++;
  scrollAnim.stop();
});
    _$jscoverage['/base.js'].lineData[245]++;
    self.scrollAnims = [];
  }
  _$jscoverage['/base.js'].lineData[247]++;
  self.scrollToWithBounds({
  left: self.get('scrollLeft'), 
  top: self.get('scrollTop')});
}, 
  '_uiSetPageIndex': function(v) {
  _$jscoverage['/base.js'].functionData[12]++;
  _$jscoverage['/base.js'].lineData[254]++;
  this.scrollToPage(v);
}, 
  getPageIndexFromXY: function(v, allowX, direction) {
  _$jscoverage['/base.js'].functionData[13]++;
  _$jscoverage['/base.js'].lineData[258]++;
  var pagesOffset = this.pagesOffset.concat([]);
  _$jscoverage['/base.js'].lineData[259]++;
  var p2 = allowX ? 'left' : 'top';
  _$jscoverage['/base.js'].lineData[260]++;
  var i, offset;
  _$jscoverage['/base.js'].lineData[261]++;
  pagesOffset.sort(function(e1, e2) {
  _$jscoverage['/base.js'].functionData[14]++;
  _$jscoverage['/base.js'].lineData[262]++;
  return e1[p2] - e2[p2];
});
  _$jscoverage['/base.js'].lineData[264]++;
  if (visit48_264_1(direction > 0)) {
    _$jscoverage['/base.js'].lineData[265]++;
    for (i = 0; visit49_265_1(i < pagesOffset.length); i++) {
      _$jscoverage['/base.js'].lineData[266]++;
      offset = pagesOffset[i];
      _$jscoverage['/base.js'].lineData[267]++;
      if (visit50_267_1(offset[p2] >= v)) {
        _$jscoverage['/base.js'].lineData[268]++;
        return offset.index;
      }
    }
  } else {
    _$jscoverage['/base.js'].lineData[272]++;
    for (i = pagesOffset.length - 1; visit51_272_1(i >= 0); i--) {
      _$jscoverage['/base.js'].lineData[273]++;
      offset = pagesOffset[i];
      _$jscoverage['/base.js'].lineData[274]++;
      if (visit52_274_1(offset[p2] <= v)) {
        _$jscoverage['/base.js'].lineData[275]++;
        return offset.index;
      }
    }
  }
  _$jscoverage['/base.js'].lineData[279]++;
  return undefined;
}, 
  scrollToPage: function(index, animCfg) {
  _$jscoverage['/base.js'].functionData[15]++;
  _$jscoverage['/base.js'].lineData[283]++;
  var self = this, pageOffset;
  _$jscoverage['/base.js'].lineData[285]++;
  if (visit53_285_1((pageOffset = self.pagesOffset) && pageOffset[index])) {
    _$jscoverage['/base.js'].lineData[286]++;
    self.set('pageIndex', index);
    _$jscoverage['/base.js'].lineData[287]++;
    self.scrollTo(pageOffset[index], animCfg);
  }
}, 
  scrollToWithBounds: function(cfg, anim) {
  _$jscoverage['/base.js'].functionData[16]++;
  _$jscoverage['/base.js'].lineData[292]++;
  var self = this;
  _$jscoverage['/base.js'].lineData[293]++;
  var maxScroll = self.maxScroll;
  _$jscoverage['/base.js'].lineData[294]++;
  var minScroll = self.minScroll;
  _$jscoverage['/base.js'].lineData[295]++;
  if (visit54_295_1(cfg.left)) {
    _$jscoverage['/base.js'].lineData[296]++;
    cfg.left = Math.min(Math.max(cfg.left, minScroll.left), maxScroll.left);
  }
  _$jscoverage['/base.js'].lineData[298]++;
  if (visit55_298_1(cfg.top)) {
    _$jscoverage['/base.js'].lineData[299]++;
    cfg.top = Math.min(Math.max(cfg.top, minScroll.top), maxScroll.top);
  }
  _$jscoverage['/base.js'].lineData[301]++;
  self.scrollTo(cfg, anim);
}, 
  scrollTo: function(cfg, animCfg) {
  _$jscoverage['/base.js'].functionData[17]++;
  _$jscoverage['/base.js'].lineData[305]++;
  var self = this, left = cfg.left, top = cfg.top;
  _$jscoverage['/base.js'].lineData[308]++;
  if (visit56_308_1(animCfg)) {
    _$jscoverage['/base.js'].lineData[309]++;
    var node = {}, to = {};
    _$jscoverage['/base.js'].lineData[311]++;
    if (visit57_311_1(left !== undefined)) {
      _$jscoverage['/base.js'].lineData[312]++;
      to.scrollLeft = left;
      _$jscoverage['/base.js'].lineData[313]++;
      node.scrollLeft = self.get('scrollLeft');
    }
    _$jscoverage['/base.js'].lineData[315]++;
    if (visit58_315_1(top !== undefined)) {
      _$jscoverage['/base.js'].lineData[316]++;
      to.scrollTop = top;
      _$jscoverage['/base.js'].lineData[317]++;
      node.scrollTop = self.get('scrollTop');
    }
    _$jscoverage['/base.js'].lineData[319]++;
    animCfg.frame = frame;
    _$jscoverage['/base.js'].lineData[320]++;
    animCfg.node = node;
    _$jscoverage['/base.js'].lineData[321]++;
    animCfg.to = to;
    _$jscoverage['/base.js'].lineData[322]++;
    var anim;
    _$jscoverage['/base.js'].lineData[323]++;
    self.scrollAnims.push(anim = new Anim(animCfg));
    _$jscoverage['/base.js'].lineData[324]++;
    anim.scrollView = self;
    _$jscoverage['/base.js'].lineData[325]++;
    anim.run();
  } else {
    _$jscoverage['/base.js'].lineData[327]++;
    if (visit59_327_1(left !== undefined)) {
      _$jscoverage['/base.js'].lineData[328]++;
      self.set('scrollLeft', left);
    }
    _$jscoverage['/base.js'].lineData[330]++;
    if (visit60_330_1(top !== undefined)) {
      _$jscoverage['/base.js'].lineData[331]++;
      self.set('scrollTop', top);
    }
  }
}}, {
  ATTRS: {
  contentEl: {}, 
  scrollLeft: {
  view: 1, 
  value: 0}, 
  scrollTop: {
  view: 1, 
  value: 0}, 
  dimension: {}, 
  focusable: {
  value: true}, 
  allowTextSelection: {
  value: true}, 
  handleMouseEvents: {
  value: false}, 
  snap: {
  value: false}, 
  pageIndex: {
  value: 0}, 
  xrender: {
  value: Render}}, 
  xclass: 'scroll-view'});
});
