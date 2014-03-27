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
if (! _$jscoverage['/control/render.js']) {
  _$jscoverage['/control/render.js'] = {};
  _$jscoverage['/control/render.js'].lineData = [];
  _$jscoverage['/control/render.js'].lineData[7] = 0;
  _$jscoverage['/control/render.js'].lineData[8] = 0;
  _$jscoverage['/control/render.js'].lineData[9] = 0;
  _$jscoverage['/control/render.js'].lineData[10] = 0;
  _$jscoverage['/control/render.js'].lineData[11] = 0;
  _$jscoverage['/control/render.js'].lineData[12] = 0;
  _$jscoverage['/control/render.js'].lineData[13] = 0;
  _$jscoverage['/control/render.js'].lineData[14] = 0;
  _$jscoverage['/control/render.js'].lineData[16] = 0;
  _$jscoverage['/control/render.js'].lineData[25] = 0;
  _$jscoverage['/control/render.js'].lineData[26] = 0;
  _$jscoverage['/control/render.js'].lineData[27] = 0;
  _$jscoverage['/control/render.js'].lineData[29] = 0;
  _$jscoverage['/control/render.js'].lineData[32] = 0;
  _$jscoverage['/control/render.js'].lineData[33] = 0;
  _$jscoverage['/control/render.js'].lineData[38] = 0;
  _$jscoverage['/control/render.js'].lineData[39] = 0;
  _$jscoverage['/control/render.js'].lineData[41] = 0;
  _$jscoverage['/control/render.js'].lineData[43] = 0;
  _$jscoverage['/control/render.js'].lineData[44] = 0;
  _$jscoverage['/control/render.js'].lineData[45] = 0;
  _$jscoverage['/control/render.js'].lineData[47] = 0;
  _$jscoverage['/control/render.js'].lineData[49] = 0;
  _$jscoverage['/control/render.js'].lineData[50] = 0;
  _$jscoverage['/control/render.js'].lineData[52] = 0;
  _$jscoverage['/control/render.js'].lineData[57] = 0;
  _$jscoverage['/control/render.js'].lineData[58] = 0;
  _$jscoverage['/control/render.js'].lineData[59] = 0;
  _$jscoverage['/control/render.js'].lineData[61] = 0;
  _$jscoverage['/control/render.js'].lineData[62] = 0;
  _$jscoverage['/control/render.js'].lineData[64] = 0;
  _$jscoverage['/control/render.js'].lineData[67] = 0;
  _$jscoverage['/control/render.js'].lineData[68] = 0;
  _$jscoverage['/control/render.js'].lineData[73] = 0;
  _$jscoverage['/control/render.js'].lineData[74] = 0;
  _$jscoverage['/control/render.js'].lineData[75] = 0;
  _$jscoverage['/control/render.js'].lineData[76] = 0;
  _$jscoverage['/control/render.js'].lineData[78] = 0;
  _$jscoverage['/control/render.js'].lineData[81] = 0;
  _$jscoverage['/control/render.js'].lineData[82] = 0;
  _$jscoverage['/control/render.js'].lineData[85] = 0;
  _$jscoverage['/control/render.js'].lineData[86] = 0;
  _$jscoverage['/control/render.js'].lineData[87] = 0;
  _$jscoverage['/control/render.js'].lineData[92] = 0;
  _$jscoverage['/control/render.js'].lineData[93] = 0;
  _$jscoverage['/control/render.js'].lineData[96] = 0;
  _$jscoverage['/control/render.js'].lineData[97] = 0;
  _$jscoverage['/control/render.js'].lineData[105] = 0;
  _$jscoverage['/control/render.js'].lineData[113] = 0;
  _$jscoverage['/control/render.js'].lineData[116] = 0;
  _$jscoverage['/control/render.js'].lineData[118] = 0;
  _$jscoverage['/control/render.js'].lineData[120] = 0;
  _$jscoverage['/control/render.js'].lineData[125] = 0;
  _$jscoverage['/control/render.js'].lineData[140] = 0;
  _$jscoverage['/control/render.js'].lineData[141] = 0;
  _$jscoverage['/control/render.js'].lineData[142] = 0;
  _$jscoverage['/control/render.js'].lineData[143] = 0;
  _$jscoverage['/control/render.js'].lineData[147] = 0;
  _$jscoverage['/control/render.js'].lineData[148] = 0;
  _$jscoverage['/control/render.js'].lineData[149] = 0;
  _$jscoverage['/control/render.js'].lineData[150] = 0;
  _$jscoverage['/control/render.js'].lineData[152] = 0;
  _$jscoverage['/control/render.js'].lineData[153] = 0;
  _$jscoverage['/control/render.js'].lineData[155] = 0;
  _$jscoverage['/control/render.js'].lineData[156] = 0;
  _$jscoverage['/control/render.js'].lineData[158] = 0;
  _$jscoverage['/control/render.js'].lineData[159] = 0;
  _$jscoverage['/control/render.js'].lineData[162] = 0;
  _$jscoverage['/control/render.js'].lineData[163] = 0;
  _$jscoverage['/control/render.js'].lineData[166] = 0;
  _$jscoverage['/control/render.js'].lineData[167] = 0;
  _$jscoverage['/control/render.js'].lineData[168] = 0;
  _$jscoverage['/control/render.js'].lineData[170] = 0;
  _$jscoverage['/control/render.js'].lineData[171] = 0;
  _$jscoverage['/control/render.js'].lineData[173] = 0;
  _$jscoverage['/control/render.js'].lineData[175] = 0;
  _$jscoverage['/control/render.js'].lineData[176] = 0;
  _$jscoverage['/control/render.js'].lineData[178] = 0;
  _$jscoverage['/control/render.js'].lineData[183] = 0;
  _$jscoverage['/control/render.js'].lineData[184] = 0;
  _$jscoverage['/control/render.js'].lineData[193] = 0;
  _$jscoverage['/control/render.js'].lineData[195] = 0;
  _$jscoverage['/control/render.js'].lineData[196] = 0;
  _$jscoverage['/control/render.js'].lineData[197] = 0;
  _$jscoverage['/control/render.js'].lineData[198] = 0;
  _$jscoverage['/control/render.js'].lineData[202] = 0;
  _$jscoverage['/control/render.js'].lineData[204] = 0;
  _$jscoverage['/control/render.js'].lineData[205] = 0;
  _$jscoverage['/control/render.js'].lineData[207] = 0;
  _$jscoverage['/control/render.js'].lineData[208] = 0;
  _$jscoverage['/control/render.js'].lineData[209] = 0;
  _$jscoverage['/control/render.js'].lineData[213] = 0;
  _$jscoverage['/control/render.js'].lineData[218] = 0;
  _$jscoverage['/control/render.js'].lineData[219] = 0;
  _$jscoverage['/control/render.js'].lineData[221] = 0;
  _$jscoverage['/control/render.js'].lineData[222] = 0;
  _$jscoverage['/control/render.js'].lineData[223] = 0;
  _$jscoverage['/control/render.js'].lineData[224] = 0;
  _$jscoverage['/control/render.js'].lineData[226] = 0;
  _$jscoverage['/control/render.js'].lineData[232] = 0;
  _$jscoverage['/control/render.js'].lineData[233] = 0;
  _$jscoverage['/control/render.js'].lineData[234] = 0;
  _$jscoverage['/control/render.js'].lineData[235] = 0;
  _$jscoverage['/control/render.js'].lineData[236] = 0;
  _$jscoverage['/control/render.js'].lineData[237] = 0;
  _$jscoverage['/control/render.js'].lineData[238] = 0;
  _$jscoverage['/control/render.js'].lineData[239] = 0;
  _$jscoverage['/control/render.js'].lineData[240] = 0;
  _$jscoverage['/control/render.js'].lineData[242] = 0;
  _$jscoverage['/control/render.js'].lineData[250] = 0;
  _$jscoverage['/control/render.js'].lineData[251] = 0;
  _$jscoverage['/control/render.js'].lineData[256] = 0;
  _$jscoverage['/control/render.js'].lineData[260] = 0;
  _$jscoverage['/control/render.js'].lineData[266] = 0;
  _$jscoverage['/control/render.js'].lineData[268] = 0;
  _$jscoverage['/control/render.js'].lineData[269] = 0;
  _$jscoverage['/control/render.js'].lineData[270] = 0;
  _$jscoverage['/control/render.js'].lineData[271] = 0;
  _$jscoverage['/control/render.js'].lineData[273] = 0;
  _$jscoverage['/control/render.js'].lineData[276] = 0;
  _$jscoverage['/control/render.js'].lineData[281] = 0;
  _$jscoverage['/control/render.js'].lineData[282] = 0;
  _$jscoverage['/control/render.js'].lineData[283] = 0;
  _$jscoverage['/control/render.js'].lineData[284] = 0;
  _$jscoverage['/control/render.js'].lineData[285] = 0;
  _$jscoverage['/control/render.js'].lineData[298] = 0;
  _$jscoverage['/control/render.js'].lineData[300] = 0;
  _$jscoverage['/control/render.js'].lineData[301] = 0;
  _$jscoverage['/control/render.js'].lineData[302] = 0;
  _$jscoverage['/control/render.js'].lineData[304] = 0;
  _$jscoverage['/control/render.js'].lineData[308] = 0;
  _$jscoverage['/control/render.js'].lineData[309] = 0;
  _$jscoverage['/control/render.js'].lineData[310] = 0;
  _$jscoverage['/control/render.js'].lineData[312] = 0;
  _$jscoverage['/control/render.js'].lineData[316] = 0;
  _$jscoverage['/control/render.js'].lineData[317] = 0;
  _$jscoverage['/control/render.js'].lineData[318] = 0;
  _$jscoverage['/control/render.js'].lineData[319] = 0;
  _$jscoverage['/control/render.js'].lineData[321] = 0;
  _$jscoverage['/control/render.js'].lineData[324] = 0;
  _$jscoverage['/control/render.js'].lineData[325] = 0;
  _$jscoverage['/control/render.js'].lineData[334] = 0;
  _$jscoverage['/control/render.js'].lineData[335] = 0;
  _$jscoverage['/control/render.js'].lineData[341] = 0;
  _$jscoverage['/control/render.js'].lineData[342] = 0;
  _$jscoverage['/control/render.js'].lineData[344] = 0;
  _$jscoverage['/control/render.js'].lineData[354] = 0;
  _$jscoverage['/control/render.js'].lineData[367] = 0;
  _$jscoverage['/control/render.js'].lineData[371] = 0;
  _$jscoverage['/control/render.js'].lineData[375] = 0;
  _$jscoverage['/control/render.js'].lineData[379] = 0;
  _$jscoverage['/control/render.js'].lineData[380] = 0;
  _$jscoverage['/control/render.js'].lineData[382] = 0;
  _$jscoverage['/control/render.js'].lineData[383] = 0;
  _$jscoverage['/control/render.js'].lineData[388] = 0;
  _$jscoverage['/control/render.js'].lineData[391] = 0;
  _$jscoverage['/control/render.js'].lineData[392] = 0;
  _$jscoverage['/control/render.js'].lineData[394] = 0;
  _$jscoverage['/control/render.js'].lineData[402] = 0;
  _$jscoverage['/control/render.js'].lineData[405] = 0;
  _$jscoverage['/control/render.js'].lineData[412] = 0;
  _$jscoverage['/control/render.js'].lineData[417] = 0;
  _$jscoverage['/control/render.js'].lineData[418] = 0;
  _$jscoverage['/control/render.js'].lineData[420] = 0;
  _$jscoverage['/control/render.js'].lineData[427] = 0;
  _$jscoverage['/control/render.js'].lineData[430] = 0;
  _$jscoverage['/control/render.js'].lineData[436] = 0;
  _$jscoverage['/control/render.js'].lineData[439] = 0;
  _$jscoverage['/control/render.js'].lineData[443] = 0;
  _$jscoverage['/control/render.js'].lineData[465] = 0;
  _$jscoverage['/control/render.js'].lineData[468] = 0;
  _$jscoverage['/control/render.js'].lineData[469] = 0;
  _$jscoverage['/control/render.js'].lineData[470] = 0;
  _$jscoverage['/control/render.js'].lineData[473] = 0;
  _$jscoverage['/control/render.js'].lineData[474] = 0;
  _$jscoverage['/control/render.js'].lineData[476] = 0;
  _$jscoverage['/control/render.js'].lineData[477] = 0;
  _$jscoverage['/control/render.js'].lineData[481] = 0;
  _$jscoverage['/control/render.js'].lineData[483] = 0;
  _$jscoverage['/control/render.js'].lineData[484] = 0;
  _$jscoverage['/control/render.js'].lineData[485] = 0;
  _$jscoverage['/control/render.js'].lineData[492] = 0;
  _$jscoverage['/control/render.js'].lineData[500] = 0;
  _$jscoverage['/control/render.js'].lineData[507] = 0;
  _$jscoverage['/control/render.js'].lineData[508] = 0;
  _$jscoverage['/control/render.js'].lineData[511] = 0;
  _$jscoverage['/control/render.js'].lineData[514] = 0;
}
if (! _$jscoverage['/control/render.js'].functionData) {
  _$jscoverage['/control/render.js'].functionData = [];
  _$jscoverage['/control/render.js'].functionData[0] = 0;
  _$jscoverage['/control/render.js'].functionData[1] = 0;
  _$jscoverage['/control/render.js'].functionData[2] = 0;
  _$jscoverage['/control/render.js'].functionData[3] = 0;
  _$jscoverage['/control/render.js'].functionData[4] = 0;
  _$jscoverage['/control/render.js'].functionData[5] = 0;
  _$jscoverage['/control/render.js'].functionData[6] = 0;
  _$jscoverage['/control/render.js'].functionData[7] = 0;
  _$jscoverage['/control/render.js'].functionData[8] = 0;
  _$jscoverage['/control/render.js'].functionData[9] = 0;
  _$jscoverage['/control/render.js'].functionData[10] = 0;
  _$jscoverage['/control/render.js'].functionData[11] = 0;
  _$jscoverage['/control/render.js'].functionData[12] = 0;
  _$jscoverage['/control/render.js'].functionData[13] = 0;
  _$jscoverage['/control/render.js'].functionData[14] = 0;
  _$jscoverage['/control/render.js'].functionData[15] = 0;
  _$jscoverage['/control/render.js'].functionData[16] = 0;
  _$jscoverage['/control/render.js'].functionData[17] = 0;
  _$jscoverage['/control/render.js'].functionData[18] = 0;
  _$jscoverage['/control/render.js'].functionData[19] = 0;
  _$jscoverage['/control/render.js'].functionData[20] = 0;
  _$jscoverage['/control/render.js'].functionData[21] = 0;
  _$jscoverage['/control/render.js'].functionData[22] = 0;
  _$jscoverage['/control/render.js'].functionData[23] = 0;
  _$jscoverage['/control/render.js'].functionData[24] = 0;
  _$jscoverage['/control/render.js'].functionData[25] = 0;
  _$jscoverage['/control/render.js'].functionData[26] = 0;
  _$jscoverage['/control/render.js'].functionData[27] = 0;
  _$jscoverage['/control/render.js'].functionData[28] = 0;
  _$jscoverage['/control/render.js'].functionData[29] = 0;
  _$jscoverage['/control/render.js'].functionData[30] = 0;
  _$jscoverage['/control/render.js'].functionData[31] = 0;
  _$jscoverage['/control/render.js'].functionData[32] = 0;
  _$jscoverage['/control/render.js'].functionData[33] = 0;
  _$jscoverage['/control/render.js'].functionData[34] = 0;
  _$jscoverage['/control/render.js'].functionData[35] = 0;
  _$jscoverage['/control/render.js'].functionData[36] = 0;
  _$jscoverage['/control/render.js'].functionData[37] = 0;
  _$jscoverage['/control/render.js'].functionData[38] = 0;
  _$jscoverage['/control/render.js'].functionData[39] = 0;
}
if (! _$jscoverage['/control/render.js'].branchData) {
  _$jscoverage['/control/render.js'].branchData = {};
  _$jscoverage['/control/render.js'].branchData['26'] = [];
  _$jscoverage['/control/render.js'].branchData['26'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['41'] = [];
  _$jscoverage['/control/render.js'].branchData['41'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['44'] = [];
  _$jscoverage['/control/render.js'].branchData['44'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['47'] = [];
  _$jscoverage['/control/render.js'].branchData['47'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['50'] = [];
  _$jscoverage['/control/render.js'].branchData['50'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['58'] = [];
  _$jscoverage['/control/render.js'].branchData['58'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['61'] = [];
  _$jscoverage['/control/render.js'].branchData['61'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['73'] = [];
  _$jscoverage['/control/render.js'].branchData['73'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['85'] = [];
  _$jscoverage['/control/render.js'].branchData['85'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['93'] = [];
  _$jscoverage['/control/render.js'].branchData['93'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['93'][2] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['116'] = [];
  _$jscoverage['/control/render.js'].branchData['116'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['142'] = [];
  _$jscoverage['/control/render.js'].branchData['142'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['152'] = [];
  _$jscoverage['/control/render.js'].branchData['152'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['155'] = [];
  _$jscoverage['/control/render.js'].branchData['155'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['158'] = [];
  _$jscoverage['/control/render.js'].branchData['158'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['162'] = [];
  _$jscoverage['/control/render.js'].branchData['162'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['170'] = [];
  _$jscoverage['/control/render.js'].branchData['170'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['173'] = [];
  _$jscoverage['/control/render.js'].branchData['173'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['175'] = [];
  _$jscoverage['/control/render.js'].branchData['175'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['204'] = [];
  _$jscoverage['/control/render.js'].branchData['204'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['218'] = [];
  _$jscoverage['/control/render.js'].branchData['218'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['221'] = [];
  _$jscoverage['/control/render.js'].branchData['221'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['223'] = [];
  _$jscoverage['/control/render.js'].branchData['223'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['240'] = [];
  _$jscoverage['/control/render.js'].branchData['240'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['250'] = [];
  _$jscoverage['/control/render.js'].branchData['250'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['266'] = [];
  _$jscoverage['/control/render.js'].branchData['266'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['270'] = [];
  _$jscoverage['/control/render.js'].branchData['270'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['282'] = [];
  _$jscoverage['/control/render.js'].branchData['282'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['283'] = [];
  _$jscoverage['/control/render.js'].branchData['283'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['300'] = [];
  _$jscoverage['/control/render.js'].branchData['300'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['309'] = [];
  _$jscoverage['/control/render.js'].branchData['309'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['316'] = [];
  _$jscoverage['/control/render.js'].branchData['316'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['318'] = [];
  _$jscoverage['/control/render.js'].branchData['318'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['321'] = [];
  _$jscoverage['/control/render.js'].branchData['321'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['341'] = [];
  _$jscoverage['/control/render.js'].branchData['341'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['382'] = [];
  _$jscoverage['/control/render.js'].branchData['382'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['391'] = [];
  _$jscoverage['/control/render.js'].branchData['391'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['418'] = [];
  _$jscoverage['/control/render.js'].branchData['418'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['469'] = [];
  _$jscoverage['/control/render.js'].branchData['469'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['470'] = [];
  _$jscoverage['/control/render.js'].branchData['470'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['474'] = [];
  _$jscoverage['/control/render.js'].branchData['474'][1] = new BranchData();
}
_$jscoverage['/control/render.js'].branchData['474'][1].init(26, 3, 'ext');
function visit55_474_1(result) {
  _$jscoverage['/control/render.js'].branchData['474'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['470'][1].init(270, 21, 'S.isArray(extensions)');
function visit54_470_1(result) {
  _$jscoverage['/control/render.js'].branchData['470'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['469'][1].init(224, 27, 'NewClass[HTML_PARSER] || {}');
function visit53_469_1(result) {
  _$jscoverage['/control/render.js'].branchData['469'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['418'][1].init(295, 24, 'control.get(\'focusable\')');
function visit52_418_1(result) {
  _$jscoverage['/control/render.js'].branchData['418'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['391'][1].init(143, 7, 'visible');
function visit51_391_1(result) {
  _$jscoverage['/control/render.js'].branchData['391'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['382'][1].init(142, 31, '!this.get(\'allowTextSelection\')');
function visit50_382_1(result) {
  _$jscoverage['/control/render.js'].branchData['382'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['341'][1].init(338, 5, 'i < l');
function visit49_341_1(result) {
  _$jscoverage['/control/render.js'].branchData['341'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['321'][1].init(166, 81, 'constructor.superclass && constructor.superclass.constructor');
function visit48_321_1(result) {
  _$jscoverage['/control/render.js'].branchData['321'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['318'][1].init(68, 6, 'xclass');
function visit47_318_1(result) {
  _$jscoverage['/control/render.js'].branchData['318'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['316'][1].init(305, 65, 'constructor && !constructor.prototype.hasOwnProperty(\'isControl\')');
function visit46_316_1(result) {
  _$jscoverage['/control/render.js'].branchData['316'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['309'][1].init(48, 24, 'self.componentCssClasses');
function visit45_309_1(result) {
  _$jscoverage['/control/render.js'].branchData['309'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['300'][1].init(89, 3, 'cls');
function visit44_300_1(result) {
  _$jscoverage['/control/render.js'].branchData['300'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['283'][1].init(118, 37, 'renderCommands || self.renderCommands');
function visit43_283_1(result) {
  _$jscoverage['/control/render.js'].branchData['283'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['282'][1].init(57, 29, 'renderData || self.renderData');
function visit42_282_1(result) {
  _$jscoverage['/control/render.js'].branchData['282'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['270'][1].init(82, 30, 'typeof selector === \'function\'');
function visit41_270_1(result) {
  _$jscoverage['/control/render.js'].branchData['270'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['266'][1].init(196, 47, 'childrenElSelectors || self.childrenElSelectors');
function visit40_266_1(result) {
  _$jscoverage['/control/render.js'].branchData['266'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['250'][1].init(18, 8, 'this.$el');
function visit39_250_1(result) {
  _$jscoverage['/control/render.js'].branchData['250'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['240'][1].init(176, 28, 'attrCfg.view && attrChangeFn');
function visit38_240_1(result) {
  _$jscoverage['/control/render.js'].branchData['240'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['223'][1].init(244, 6, 'render');
function visit37_223_1(result) {
  _$jscoverage['/control/render.js'].branchData['223'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['221'][1].init(136, 12, 'renderBefore');
function visit36_221_1(result) {
  _$jscoverage['/control/render.js'].branchData['221'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['218'][1].init(176, 23, '!control.get(\'srcNode\')');
function visit35_218_1(result) {
  _$jscoverage['/control/render.js'].branchData['218'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['204'][1].init(89, 19, '!srcNode.attr(\'id\')');
function visit34_204_1(result) {
  _$jscoverage['/control/render.js'].branchData['204'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['175'][1].init(62, 13, 'UA.ieMode < 9');
function visit33_175_1(result) {
  _$jscoverage['/control/render.js'].branchData['175'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['173'][1].init(1548, 24, 'control.get(\'focusable\')');
function visit32_173_1(result) {
  _$jscoverage['/control/render.js'].branchData['173'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['170'][1].init(1426, 26, 'control.get(\'highlighted\')');
function visit31_170_1(result) {
  _$jscoverage['/control/render.js'].branchData['170'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['162'][1].init(1130, 8, '!visible');
function visit30_162_1(result) {
  _$jscoverage['/control/render.js'].branchData['162'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['158'][1].init(1040, 6, 'zIndex');
function visit29_158_1(result) {
  _$jscoverage['/control/render.js'].branchData['158'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['155'][1].init(946, 6, 'height');
function visit28_155_1(result) {
  _$jscoverage['/control/render.js'].branchData['155'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['152'][1].init(855, 5, 'width');
function visit27_152_1(result) {
  _$jscoverage['/control/render.js'].branchData['152'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['142'][1].init(56, 9, 'attr.view');
function visit26_142_1(result) {
  _$jscoverage['/control/render.js'].branchData['142'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['116'][1].init(106, 7, 'srcNode');
function visit25_116_1(result) {
  _$jscoverage['/control/render.js'].branchData['116'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['93'][2].init(53, 35, 'options.params && options.params[0]');
function visit24_93_2(result) {
  _$jscoverage['/control/render.js'].branchData['93'][2].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['93'][1].init(52, 46, 'options && options.params && options.params[0]');
function visit23_93_1(result) {
  _$jscoverage['/control/render.js'].branchData['93'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['85'][1].init(89, 25, 'e.target === self.control');
function visit22_85_1(result) {
  _$jscoverage['/control/render.js'].branchData['85'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['73'][1].init(156, 5, 'i < l');
function visit21_73_1(result) {
  _$jscoverage['/control/render.js'].branchData['73'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['61'][1].init(77, 26, 'typeof extras === \'string\'');
function visit20_61_1(result) {
  _$jscoverage['/control/render.js'].branchData['61'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['58'][1].init(14, 7, '!extras');
function visit19_58_1(result) {
  _$jscoverage['/control/render.js'].branchData['58'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['50'][1].init(442, 20, 'S.isArray(v) && v[0]');
function visit18_50_1(result) {
  _$jscoverage['/control/render.js'].branchData['50'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['47'][1].init(309, 21, 'typeof v === \'string\'');
function visit17_47_1(result) {
  _$jscoverage['/control/render.js'].branchData['47'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['44'][1].init(103, 17, 'ret !== undefined');
function visit16_44_1(result) {
  _$jscoverage['/control/render.js'].branchData['44'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['41'][1].init(65, 23, 'typeof v === \'function\'');
function visit15_41_1(result) {
  _$jscoverage['/control/render.js'].branchData['41'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['26'][1].init(14, 21, 'typeof v === \'number\'');
function visit14_26_1(result) {
  _$jscoverage['/control/render.js'].branchData['26'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].lineData[7]++;
KISSY.add(function(S, require) {
  _$jscoverage['/control/render.js'].functionData[0]++;
  _$jscoverage['/control/render.js'].lineData[8]++;
  var Base = require('base');
  _$jscoverage['/control/render.js'].lineData[9]++;
  var __getHook = Base.prototype.__getHook;
  _$jscoverage['/control/render.js'].lineData[10]++;
  var noop = S.noop;
  _$jscoverage['/control/render.js'].lineData[11]++;
  var Node = require('node');
  _$jscoverage['/control/render.js'].lineData[12]++;
  var XTemplateRuntime = require('xtemplate/runtime');
  _$jscoverage['/control/render.js'].lineData[13]++;
  var RenderTpl = require('./render-xtpl');
  _$jscoverage['/control/render.js'].lineData[14]++;
  var Manager = require('component/manager');
  _$jscoverage['/control/render.js'].lineData[16]++;
  var ON_SET = '_onSet', trim = S.trim, $ = Node.all, UA = require('ua'), startTpl = RenderTpl, endTpl = '</div>', doc = S.Env.host.document, HTML_PARSER = 'HTML_PARSER';
  _$jscoverage['/control/render.js'].lineData[25]++;
  function pxSetter(v) {
    _$jscoverage['/control/render.js'].functionData[1]++;
    _$jscoverage['/control/render.js'].lineData[26]++;
    if (visit14_26_1(typeof v === 'number')) {
      _$jscoverage['/control/render.js'].lineData[27]++;
      v += 'px';
    }
    _$jscoverage['/control/render.js'].lineData[29]++;
    return v;
  }
  _$jscoverage['/control/render.js'].lineData[32]++;
  function applyParser(srcNode, parser, control) {
    _$jscoverage['/control/render.js'].functionData[2]++;
    _$jscoverage['/control/render.js'].lineData[33]++;
    var self = this, p, v, ret;
    _$jscoverage['/control/render.js'].lineData[38]++;
    for (p in parser) {
      _$jscoverage['/control/render.js'].lineData[39]++;
      v = parser[p];
      _$jscoverage['/control/render.js'].lineData[41]++;
      if (visit15_41_1(typeof v === 'function')) {
        _$jscoverage['/control/render.js'].lineData[43]++;
        ret = v.call(self, srcNode);
        _$jscoverage['/control/render.js'].lineData[44]++;
        if (visit16_44_1(ret !== undefined)) {
          _$jscoverage['/control/render.js'].lineData[45]++;
          control.setInternal(p, ret);
        }
      } else {
        _$jscoverage['/control/render.js'].lineData[47]++;
        if (visit17_47_1(typeof v === 'string')) {
          _$jscoverage['/control/render.js'].lineData[49]++;
          control.setInternal(p, srcNode.one(v));
        } else {
          _$jscoverage['/control/render.js'].lineData[50]++;
          if (visit18_50_1(S.isArray(v) && v[0])) {
            _$jscoverage['/control/render.js'].lineData[52]++;
            control.setInternal(p, srcNode.all(v[0]));
          }
        }
      }
    }
  }
  _$jscoverage['/control/render.js'].lineData[57]++;
  function normalExtras(extras) {
    _$jscoverage['/control/render.js'].functionData[3]++;
    _$jscoverage['/control/render.js'].lineData[58]++;
    if (visit19_58_1(!extras)) {
      _$jscoverage['/control/render.js'].lineData[59]++;
      extras = [''];
    }
    _$jscoverage['/control/render.js'].lineData[61]++;
    if (visit20_61_1(typeof extras === 'string')) {
      _$jscoverage['/control/render.js'].lineData[62]++;
      extras = extras.split(/\s+/);
    }
    _$jscoverage['/control/render.js'].lineData[64]++;
    return extras;
  }
  _$jscoverage['/control/render.js'].lineData[67]++;
  function prefixExtra(prefixCls, componentCls, extras) {
    _$jscoverage['/control/render.js'].functionData[4]++;
    _$jscoverage['/control/render.js'].lineData[68]++;
    var cls = '', i = 0, l = extras.length, e, prefix = prefixCls + componentCls;
    _$jscoverage['/control/render.js'].lineData[73]++;
    for (; visit21_73_1(i < l); i++) {
      _$jscoverage['/control/render.js'].lineData[74]++;
      e = extras[i];
      _$jscoverage['/control/render.js'].lineData[75]++;
      e = e ? ('-' + e) : e;
      _$jscoverage['/control/render.js'].lineData[76]++;
      cls += ' ' + prefix + e;
    }
    _$jscoverage['/control/render.js'].lineData[78]++;
    return cls;
  }
  _$jscoverage['/control/render.js'].lineData[81]++;
  function onSetAttrChange(e) {
    _$jscoverage['/control/render.js'].functionData[5]++;
    _$jscoverage['/control/render.js'].lineData[82]++;
    var self = this, method;
    _$jscoverage['/control/render.js'].lineData[85]++;
    if (visit22_85_1(e.target === self.control)) {
      _$jscoverage['/control/render.js'].lineData[86]++;
      method = self[ON_SET + e.type.slice(5).slice(0, -6)];
      _$jscoverage['/control/render.js'].lineData[87]++;
      method.call(self, e.newVal, e);
    }
  }
  _$jscoverage['/control/render.js'].lineData[92]++;
  function getBaseCssClassesCmd(_, options) {
    _$jscoverage['/control/render.js'].functionData[6]++;
    _$jscoverage['/control/render.js'].lineData[93]++;
    return this.config.view.getBaseCssClasses(visit23_93_1(options && visit24_93_2(options.params && options.params[0])));
  }
  _$jscoverage['/control/render.js'].lineData[96]++;
  function getBaseCssClassCmd() {
    _$jscoverage['/control/render.js'].functionData[7]++;
    _$jscoverage['/control/render.js'].lineData[97]++;
    return this.config.view.getBaseCssClass(arguments[1].params[0]);
  }
  _$jscoverage['/control/render.js'].lineData[105]++;
  return Base.extend({
  bindInternal: noop, 
  syncInternal: noop, 
  isRender: true, 
  create: function() {
  _$jscoverage['/control/render.js'].functionData[8]++;
  _$jscoverage['/control/render.js'].lineData[113]++;
  var self = this, srcNode = self.control.get('srcNode');
  _$jscoverage['/control/render.js'].lineData[116]++;
  if (visit25_116_1(srcNode)) {
    _$jscoverage['/control/render.js'].lineData[118]++;
    self.decorateDom(srcNode);
  } else {
    _$jscoverage['/control/render.js'].lineData[120]++;
    self.createDom();
  }
}, 
  beforeCreateDom: function(renderData) {
  _$jscoverage['/control/render.js'].functionData[9]++;
  _$jscoverage['/control/render.js'].lineData[125]++;
  var self = this, control = self.control, width, height, visible, elAttrs = control.get('elAttrs'), cls = control.get('elCls'), disabled, attrs = control.getAttrs(), a, attr, elStyle = control.get('elStyle'), zIndex, elCls = control.get('elCls');
  _$jscoverage['/control/render.js'].lineData[140]++;
  for (a in attrs) {
    _$jscoverage['/control/render.js'].lineData[141]++;
    attr = attrs[a];
    _$jscoverage['/control/render.js'].lineData[142]++;
    if (visit26_142_1(attr.view)) {
      _$jscoverage['/control/render.js'].lineData[143]++;
      renderData[a] = control.get(a);
    }
  }
  _$jscoverage['/control/render.js'].lineData[147]++;
  width = renderData.width;
  _$jscoverage['/control/render.js'].lineData[148]++;
  height = renderData.height;
  _$jscoverage['/control/render.js'].lineData[149]++;
  visible = renderData.visible;
  _$jscoverage['/control/render.js'].lineData[150]++;
  zIndex = renderData.zIndex;
  _$jscoverage['/control/render.js'].lineData[152]++;
  if (visit27_152_1(width)) {
    _$jscoverage['/control/render.js'].lineData[153]++;
    elStyle.width = pxSetter(width);
  }
  _$jscoverage['/control/render.js'].lineData[155]++;
  if (visit28_155_1(height)) {
    _$jscoverage['/control/render.js'].lineData[156]++;
    elStyle.height = pxSetter(height);
  }
  _$jscoverage['/control/render.js'].lineData[158]++;
  if (visit29_158_1(zIndex)) {
    _$jscoverage['/control/render.js'].lineData[159]++;
    elStyle['z-index'] = zIndex;
  }
  _$jscoverage['/control/render.js'].lineData[162]++;
  if (visit30_162_1(!visible)) {
    _$jscoverage['/control/render.js'].lineData[163]++;
    elCls.push(self.getBaseCssClasses('hidden'));
  }
  _$jscoverage['/control/render.js'].lineData[166]++;
  if ((disabled = control.get('disabled'))) {
    _$jscoverage['/control/render.js'].lineData[167]++;
    cls.push(self.getBaseCssClasses('disabled'));
    _$jscoverage['/control/render.js'].lineData[168]++;
    elAttrs['aria-disabled'] = 'true';
  }
  _$jscoverage['/control/render.js'].lineData[170]++;
  if (visit31_170_1(control.get('highlighted'))) {
    _$jscoverage['/control/render.js'].lineData[171]++;
    cls.push(self.getBaseCssClasses('hover'));
  }
  _$jscoverage['/control/render.js'].lineData[173]++;
  if (visit32_173_1(control.get('focusable'))) {
    _$jscoverage['/control/render.js'].lineData[175]++;
    if (visit33_175_1(UA.ieMode < 9)) {
      _$jscoverage['/control/render.js'].lineData[176]++;
      elAttrs.hideFocus = 'true';
    }
    _$jscoverage['/control/render.js'].lineData[178]++;
    elAttrs.tabindex = disabled ? '-1' : '0';
  }
}, 
  createDom: function() {
  _$jscoverage['/control/render.js'].functionData[10]++;
  _$jscoverage['/control/render.js'].lineData[183]++;
  var self = this;
  _$jscoverage['/control/render.js'].lineData[184]++;
  self.beforeCreateDom(self.renderData = {}, self.childrenElSelectors = {}, self.renderCommands = {
  getBaseCssClasses: getBaseCssClassesCmd, 
  getBaseCssClass: getBaseCssClassCmd});
  _$jscoverage['/control/render.js'].lineData[193]++;
  var control = self.control, html;
  _$jscoverage['/control/render.js'].lineData[195]++;
  html = self.renderTpl(startTpl) + self.renderTpl(self.get('contentTpl')) + endTpl;
  _$jscoverage['/control/render.js'].lineData[196]++;
  control.setInternal('el', self.$el = $(html));
  _$jscoverage['/control/render.js'].lineData[197]++;
  self.el = self.$el[0];
  _$jscoverage['/control/render.js'].lineData[198]++;
  self.fillChildrenElsBySelectors();
}, 
  decorateDom: function(srcNode) {
  _$jscoverage['/control/render.js'].functionData[11]++;
  _$jscoverage['/control/render.js'].lineData[202]++;
  var self = this, control = self.control;
  _$jscoverage['/control/render.js'].lineData[204]++;
  if (visit34_204_1(!srcNode.attr('id'))) {
    _$jscoverage['/control/render.js'].lineData[205]++;
    srcNode.attr('id', control.get('id'));
  }
  _$jscoverage['/control/render.js'].lineData[207]++;
  applyParser.call(self, srcNode, self.constructor.HTML_PARSER, control);
  _$jscoverage['/control/render.js'].lineData[208]++;
  control.setInternal('el', self.$el = srcNode);
  _$jscoverage['/control/render.js'].lineData[209]++;
  self.el = srcNode[0];
}, 
  renderUI: function() {
  _$jscoverage['/control/render.js'].functionData[12]++;
  _$jscoverage['/control/render.js'].lineData[213]++;
  var self = this, control = self.control, el = self.$el;
  _$jscoverage['/control/render.js'].lineData[218]++;
  if (visit35_218_1(!control.get('srcNode'))) {
    _$jscoverage['/control/render.js'].lineData[219]++;
    var render = control.get('render'), renderBefore = control.get('elBefore');
    _$jscoverage['/control/render.js'].lineData[221]++;
    if (visit36_221_1(renderBefore)) {
      _$jscoverage['/control/render.js'].lineData[222]++;
      el.insertBefore(renderBefore, undefined);
    } else {
      _$jscoverage['/control/render.js'].lineData[223]++;
      if (visit37_223_1(render)) {
        _$jscoverage['/control/render.js'].lineData[224]++;
        el.appendTo(render, undefined);
      } else {
        _$jscoverage['/control/render.js'].lineData[226]++;
        el.appendTo(doc.body, undefined);
      }
    }
  }
}, 
  bindUI: function() {
  _$jscoverage['/control/render.js'].functionData[13]++;
  _$jscoverage['/control/render.js'].lineData[232]++;
  var self = this;
  _$jscoverage['/control/render.js'].lineData[233]++;
  var control = self.control;
  _$jscoverage['/control/render.js'].lineData[234]++;
  var attrs = control.getAttrs();
  _$jscoverage['/control/render.js'].lineData[235]++;
  var attrName, attrCfg;
  _$jscoverage['/control/render.js'].lineData[236]++;
  for (attrName in attrs) {
    _$jscoverage['/control/render.js'].lineData[237]++;
    attrCfg = attrs[attrName];
    _$jscoverage['/control/render.js'].lineData[238]++;
    var ucName = S.ucfirst(attrName);
    _$jscoverage['/control/render.js'].lineData[239]++;
    var attrChangeFn = self[ON_SET + ucName];
    _$jscoverage['/control/render.js'].lineData[240]++;
    if (visit38_240_1(attrCfg.view && attrChangeFn)) {
      _$jscoverage['/control/render.js'].lineData[242]++;
      control.on('after' + ucName + 'Change', onSetAttrChange, self);
    }
  }
}, 
  syncUI: noop, 
  destructor: function() {
  _$jscoverage['/control/render.js'].functionData[14]++;
  _$jscoverage['/control/render.js'].lineData[250]++;
  if (visit39_250_1(this.$el)) {
    _$jscoverage['/control/render.js'].lineData[251]++;
    this.$el.remove();
  }
}, 
  $: function(selector) {
  _$jscoverage['/control/render.js'].functionData[15]++;
  _$jscoverage['/control/render.js'].lineData[256]++;
  return this.$el.all(selector);
}, 
  fillChildrenElsBySelectors: function(childrenElSelectors) {
  _$jscoverage['/control/render.js'].functionData[16]++;
  _$jscoverage['/control/render.js'].lineData[260]++;
  var self = this, el = self.$el, control = self.control, childName, selector;
  _$jscoverage['/control/render.js'].lineData[266]++;
  childrenElSelectors = visit40_266_1(childrenElSelectors || self.childrenElSelectors);
  _$jscoverage['/control/render.js'].lineData[268]++;
  for (childName in childrenElSelectors) {
    _$jscoverage['/control/render.js'].lineData[269]++;
    selector = childrenElSelectors[childName];
    _$jscoverage['/control/render.js'].lineData[270]++;
    if (visit41_270_1(typeof selector === 'function')) {
      _$jscoverage['/control/render.js'].lineData[271]++;
      control.setInternal(childName, selector(el));
    } else {
      _$jscoverage['/control/render.js'].lineData[273]++;
      control.setInternal(childName, self.$(S.substitute(selector, self.renderData)));
    }
    _$jscoverage['/control/render.js'].lineData[276]++;
    delete childrenElSelectors[childName];
  }
}, 
  renderTpl: function(tpl, renderData, renderCommands) {
  _$jscoverage['/control/render.js'].functionData[17]++;
  _$jscoverage['/control/render.js'].lineData[281]++;
  var self = this;
  _$jscoverage['/control/render.js'].lineData[282]++;
  renderData = visit42_282_1(renderData || self.renderData);
  _$jscoverage['/control/render.js'].lineData[283]++;
  renderCommands = visit43_283_1(renderCommands || self.renderCommands);
  _$jscoverage['/control/render.js'].lineData[284]++;
  var XTemplate = self.get('xtemplate');
  _$jscoverage['/control/render.js'].lineData[285]++;
  return new XTemplate(tpl, {
  control: self.control, 
  view: self, 
  commands: renderCommands}).render(renderData);
}, 
  getComponentConstructorByNode: function(prefixCls, childNode) {
  _$jscoverage['/control/render.js'].functionData[18]++;
  _$jscoverage['/control/render.js'].lineData[298]++;
  var cls = childNode[0].className;
  _$jscoverage['/control/render.js'].lineData[300]++;
  if (visit44_300_1(cls)) {
    _$jscoverage['/control/render.js'].lineData[301]++;
    cls = cls.replace(new RegExp('\\b' + prefixCls, 'ig'), '');
    _$jscoverage['/control/render.js'].lineData[302]++;
    return Manager.getConstructorByXClass(cls);
  }
  _$jscoverage['/control/render.js'].lineData[304]++;
  return null;
}, 
  getComponentCssClasses: function() {
  _$jscoverage['/control/render.js'].functionData[19]++;
  _$jscoverage['/control/render.js'].lineData[308]++;
  var self = this;
  _$jscoverage['/control/render.js'].lineData[309]++;
  if (visit45_309_1(self.componentCssClasses)) {
    _$jscoverage['/control/render.js'].lineData[310]++;
    return self.componentCssClasses;
  }
  _$jscoverage['/control/render.js'].lineData[312]++;
  var control = self.control, constructor = control.constructor, xclass, re = [];
  _$jscoverage['/control/render.js'].lineData[316]++;
  while (visit46_316_1(constructor && !constructor.prototype.hasOwnProperty('isControl'))) {
    _$jscoverage['/control/render.js'].lineData[317]++;
    xclass = constructor.xclass;
    _$jscoverage['/control/render.js'].lineData[318]++;
    if (visit47_318_1(xclass)) {
      _$jscoverage['/control/render.js'].lineData[319]++;
      re.push(xclass);
    }
    _$jscoverage['/control/render.js'].lineData[321]++;
    constructor = visit48_321_1(constructor.superclass && constructor.superclass.constructor);
  }
  _$jscoverage['/control/render.js'].lineData[324]++;
  self.componentCssClasses = re;
  _$jscoverage['/control/render.js'].lineData[325]++;
  return re;
}, 
  getBaseCssClasses: function(extras) {
  _$jscoverage['/control/render.js'].functionData[20]++;
  _$jscoverage['/control/render.js'].lineData[334]++;
  extras = normalExtras(extras);
  _$jscoverage['/control/render.js'].lineData[335]++;
  var componentCssClasses = this.getComponentCssClasses(), i = 0, control = this.get('control'), cls = '', l = componentCssClasses.length, prefixCls = control.get('prefixCls');
  _$jscoverage['/control/render.js'].lineData[341]++;
  for (; visit49_341_1(i < l); i++) {
    _$jscoverage['/control/render.js'].lineData[342]++;
    cls += prefixExtra(prefixCls, componentCssClasses[i], extras);
  }
  _$jscoverage['/control/render.js'].lineData[344]++;
  return trim(cls);
}, 
  getBaseCssClass: function(extras) {
  _$jscoverage['/control/render.js'].functionData[21]++;
  _$jscoverage['/control/render.js'].lineData[354]++;
  return trim(prefixExtra(this.control.get('prefixCls'), this.getComponentCssClasses()[0], normalExtras(extras)));
}, 
  getKeyEventTarget: function() {
  _$jscoverage['/control/render.js'].functionData[22]++;
  _$jscoverage['/control/render.js'].lineData[367]++;
  return this.$el;
}, 
  _onSetWidth: function(w) {
  _$jscoverage['/control/render.js'].functionData[23]++;
  _$jscoverage['/control/render.js'].lineData[371]++;
  this.$el.width(w);
}, 
  _onSetHeight: function(h) {
  _$jscoverage['/control/render.js'].functionData[24]++;
  _$jscoverage['/control/render.js'].lineData[375]++;
  this.$el.height(h);
}, 
  _onSetContent: function(c) {
  _$jscoverage['/control/render.js'].functionData[25]++;
  _$jscoverage['/control/render.js'].lineData[379]++;
  var el = this.$el;
  _$jscoverage['/control/render.js'].lineData[380]++;
  el.html(c);
  _$jscoverage['/control/render.js'].lineData[382]++;
  if (visit50_382_1(!this.get('allowTextSelection'))) {
    _$jscoverage['/control/render.js'].lineData[383]++;
    el.unselectable();
  }
}, 
  _onSetVisible: function(visible) {
  _$jscoverage['/control/render.js'].functionData[26]++;
  _$jscoverage['/control/render.js'].lineData[388]++;
  var self = this, el = self.$el, hiddenCls = self.getBaseCssClasses('hidden');
  _$jscoverage['/control/render.js'].lineData[391]++;
  if (visit51_391_1(visible)) {
    _$jscoverage['/control/render.js'].lineData[392]++;
    el.removeClass(hiddenCls);
  } else {
    _$jscoverage['/control/render.js'].lineData[394]++;
    el.addClass(hiddenCls);
  }
}, 
  _onSetHighlighted: function(v) {
  _$jscoverage['/control/render.js'].functionData[27]++;
  _$jscoverage['/control/render.js'].lineData[402]++;
  var self = this, componentCls = self.getBaseCssClasses('hover'), el = self.$el;
  _$jscoverage['/control/render.js'].lineData[405]++;
  el[v ? 'addClass' : 'removeClass'](componentCls);
}, 
  _onSetDisabled: function(v) {
  _$jscoverage['/control/render.js'].functionData[28]++;
  _$jscoverage['/control/render.js'].lineData[412]++;
  var self = this, control = self.control, componentCls = self.getBaseCssClasses('disabled'), el = self.$el;
  _$jscoverage['/control/render.js'].lineData[417]++;
  el[v ? 'addClass' : 'removeClass'](componentCls).attr('aria-disabled', v);
  _$jscoverage['/control/render.js'].lineData[418]++;
  if (visit52_418_1(control.get('focusable'))) {
    _$jscoverage['/control/render.js'].lineData[420]++;
    self.getKeyEventTarget().attr('tabindex', v ? -1 : 0);
  }
}, 
  _onSetActive: function(v) {
  _$jscoverage['/control/render.js'].functionData[29]++;
  _$jscoverage['/control/render.js'].lineData[427]++;
  var self = this, componentCls = self.getBaseCssClasses('active');
  _$jscoverage['/control/render.js'].lineData[430]++;
  self.$el[v ? 'addClass' : 'removeClass'](componentCls).attr('aria-pressed', !!v);
}, 
  _onSetFocused: function(v) {
  _$jscoverage['/control/render.js'].functionData[30]++;
  _$jscoverage['/control/render.js'].lineData[436]++;
  var self = this, el = self.$el, componentCls = self.getBaseCssClasses('focused');
  _$jscoverage['/control/render.js'].lineData[439]++;
  el[v ? 'addClass' : 'removeClass'](componentCls);
}, 
  _onSetZIndex: function(x) {
  _$jscoverage['/control/render.js'].functionData[31]++;
  _$jscoverage['/control/render.js'].lineData[443]++;
  this.$el.css('z-index', x);
}}, {
  __hooks__: {
  createDom: __getHook('__createDom'), 
  renderUI: __getHook('__renderUI'), 
  bindUI: __getHook('__bindUI'), 
  syncUI: __getHook('__syncUI'), 
  decorateDom: __getHook('__decorateDom'), 
  beforeCreateDom: __getHook('__beforeCreateDom')}, 
  extend: function extend(extensions, px, sx) {
  _$jscoverage['/control/render.js'].functionData[32]++;
  _$jscoverage['/control/render.js'].lineData[465]++;
  var self = this, NewClass, parsers = {};
  _$jscoverage['/control/render.js'].lineData[468]++;
  NewClass = Base.extend.apply(self, arguments);
  _$jscoverage['/control/render.js'].lineData[469]++;
  NewClass[HTML_PARSER] = visit53_469_1(NewClass[HTML_PARSER] || {});
  _$jscoverage['/control/render.js'].lineData[470]++;
  if (visit54_470_1(S.isArray(extensions))) {
    _$jscoverage['/control/render.js'].lineData[473]++;
    S.each(extensions.concat(NewClass), function(ext) {
  _$jscoverage['/control/render.js'].functionData[33]++;
  _$jscoverage['/control/render.js'].lineData[474]++;
  if (visit55_474_1(ext)) {
    _$jscoverage['/control/render.js'].lineData[476]++;
    S.each(ext.HTML_PARSER, function(v, name) {
  _$jscoverage['/control/render.js'].functionData[34]++;
  _$jscoverage['/control/render.js'].lineData[477]++;
  parsers[name] = v;
});
  }
});
    _$jscoverage['/control/render.js'].lineData[481]++;
    NewClass[HTML_PARSER] = parsers;
  }
  _$jscoverage['/control/render.js'].lineData[483]++;
  S.mix(NewClass[HTML_PARSER], self[HTML_PARSER], false);
  _$jscoverage['/control/render.js'].lineData[484]++;
  NewClass.extend = extend;
  _$jscoverage['/control/render.js'].lineData[485]++;
  return NewClass;
}, 
  ATTRS: {
  control: {
  setter: function(v) {
  _$jscoverage['/control/render.js'].functionData[35]++;
  _$jscoverage['/control/render.js'].lineData[492]++;
  this.control = v;
}}, 
  xtemplate: {
  value: XTemplateRuntime}, 
  contentTpl: {
  value: function(scope, S, buffer) {
  _$jscoverage['/control/render.js'].functionData[36]++;
  _$jscoverage['/control/render.js'].lineData[500]++;
  return buffer.write(scope.get('content'));
}}}, 
  HTML_PARSER: {
  id: function(el) {
  _$jscoverage['/control/render.js'].functionData[37]++;
  _$jscoverage['/control/render.js'].lineData[507]++;
  var id = el[0].id;
  _$jscoverage['/control/render.js'].lineData[508]++;
  return id ? id : undefined;
}, 
  content: function(el) {
  _$jscoverage['/control/render.js'].functionData[38]++;
  _$jscoverage['/control/render.js'].lineData[511]++;
  return el.html();
}, 
  disabled: function(el) {
  _$jscoverage['/control/render.js'].functionData[39]++;
  _$jscoverage['/control/render.js'].lineData[514]++;
  return el.hasClass(this.getBaseCssClass('disabled'));
}}, 
  name: 'render'});
});
