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
if (! _$jscoverage['/touch/handle.js']) {
  _$jscoverage['/touch/handle.js'] = {};
  _$jscoverage['/touch/handle.js'].lineData = [];
  _$jscoverage['/touch/handle.js'].lineData[6] = 0;
  _$jscoverage['/touch/handle.js'].lineData[7] = 0;
  _$jscoverage['/touch/handle.js'].lineData[8] = 0;
  _$jscoverage['/touch/handle.js'].lineData[9] = 0;
  _$jscoverage['/touch/handle.js'].lineData[10] = 0;
  _$jscoverage['/touch/handle.js'].lineData[11] = 0;
  _$jscoverage['/touch/handle.js'].lineData[12] = 0;
  _$jscoverage['/touch/handle.js'].lineData[13] = 0;
  _$jscoverage['/touch/handle.js'].lineData[14] = 0;
  _$jscoverage['/touch/handle.js'].lineData[15] = 0;
  _$jscoverage['/touch/handle.js'].lineData[17] = 0;
  _$jscoverage['/touch/handle.js'].lineData[23] = 0;
  _$jscoverage['/touch/handle.js'].lineData[24] = 0;
  _$jscoverage['/touch/handle.js'].lineData[27] = 0;
  _$jscoverage['/touch/handle.js'].lineData[28] = 0;
  _$jscoverage['/touch/handle.js'].lineData[31] = 0;
  _$jscoverage['/touch/handle.js'].lineData[32] = 0;
  _$jscoverage['/touch/handle.js'].lineData[36] = 0;
  _$jscoverage['/touch/handle.js'].lineData[38] = 0;
  _$jscoverage['/touch/handle.js'].lineData[40] = 0;
  _$jscoverage['/touch/handle.js'].lineData[41] = 0;
  _$jscoverage['/touch/handle.js'].lineData[43] = 0;
  _$jscoverage['/touch/handle.js'].lineData[44] = 0;
  _$jscoverage['/touch/handle.js'].lineData[45] = 0;
  _$jscoverage['/touch/handle.js'].lineData[47] = 0;
  _$jscoverage['/touch/handle.js'].lineData[49] = 0;
  _$jscoverage['/touch/handle.js'].lineData[50] = 0;
  _$jscoverage['/touch/handle.js'].lineData[52] = 0;
  _$jscoverage['/touch/handle.js'].lineData[55] = 0;
  _$jscoverage['/touch/handle.js'].lineData[56] = 0;
  _$jscoverage['/touch/handle.js'].lineData[57] = 0;
  _$jscoverage['/touch/handle.js'].lineData[58] = 0;
  _$jscoverage['/touch/handle.js'].lineData[59] = 0;
  _$jscoverage['/touch/handle.js'].lineData[60] = 0;
  _$jscoverage['/touch/handle.js'].lineData[61] = 0;
  _$jscoverage['/touch/handle.js'].lineData[63] = 0;
  _$jscoverage['/touch/handle.js'].lineData[64] = 0;
  _$jscoverage['/touch/handle.js'].lineData[65] = 0;
  _$jscoverage['/touch/handle.js'].lineData[68] = 0;
  _$jscoverage['/touch/handle.js'].lineData[69] = 0;
  _$jscoverage['/touch/handle.js'].lineData[70] = 0;
  _$jscoverage['/touch/handle.js'].lineData[71] = 0;
  _$jscoverage['/touch/handle.js'].lineData[72] = 0;
  _$jscoverage['/touch/handle.js'].lineData[74] = 0;
  _$jscoverage['/touch/handle.js'].lineData[76] = 0;
  _$jscoverage['/touch/handle.js'].lineData[79] = 0;
  _$jscoverage['/touch/handle.js'].lineData[87] = 0;
  _$jscoverage['/touch/handle.js'].lineData[89] = 0;
  _$jscoverage['/touch/handle.js'].lineData[90] = 0;
  _$jscoverage['/touch/handle.js'].lineData[91] = 0;
  _$jscoverage['/touch/handle.js'].lineData[93] = 0;
  _$jscoverage['/touch/handle.js'].lineData[97] = 0;
  _$jscoverage['/touch/handle.js'].lineData[98] = 0;
  _$jscoverage['/touch/handle.js'].lineData[102] = 0;
  _$jscoverage['/touch/handle.js'].lineData[107] = 0;
  _$jscoverage['/touch/handle.js'].lineData[108] = 0;
  _$jscoverage['/touch/handle.js'].lineData[109] = 0;
  _$jscoverage['/touch/handle.js'].lineData[110] = 0;
  _$jscoverage['/touch/handle.js'].lineData[111] = 0;
  _$jscoverage['/touch/handle.js'].lineData[117] = 0;
  _$jscoverage['/touch/handle.js'].lineData[122] = 0;
  _$jscoverage['/touch/handle.js'].lineData[123] = 0;
  _$jscoverage['/touch/handle.js'].lineData[124] = 0;
  _$jscoverage['/touch/handle.js'].lineData[125] = 0;
  _$jscoverage['/touch/handle.js'].lineData[131] = 0;
  _$jscoverage['/touch/handle.js'].lineData[135] = 0;
  _$jscoverage['/touch/handle.js'].lineData[136] = 0;
  _$jscoverage['/touch/handle.js'].lineData[141] = 0;
  _$jscoverage['/touch/handle.js'].lineData[142] = 0;
  _$jscoverage['/touch/handle.js'].lineData[148] = 0;
  _$jscoverage['/touch/handle.js'].lineData[149] = 0;
  _$jscoverage['/touch/handle.js'].lineData[151] = 0;
  _$jscoverage['/touch/handle.js'].lineData[153] = 0;
  _$jscoverage['/touch/handle.js'].lineData[154] = 0;
  _$jscoverage['/touch/handle.js'].lineData[155] = 0;
  _$jscoverage['/touch/handle.js'].lineData[156] = 0;
  _$jscoverage['/touch/handle.js'].lineData[157] = 0;
  _$jscoverage['/touch/handle.js'].lineData[158] = 0;
  _$jscoverage['/touch/handle.js'].lineData[166] = 0;
  _$jscoverage['/touch/handle.js'].lineData[167] = 0;
  _$jscoverage['/touch/handle.js'].lineData[169] = 0;
  _$jscoverage['/touch/handle.js'].lineData[171] = 0;
  _$jscoverage['/touch/handle.js'].lineData[173] = 0;
  _$jscoverage['/touch/handle.js'].lineData[174] = 0;
  _$jscoverage['/touch/handle.js'].lineData[177] = 0;
  _$jscoverage['/touch/handle.js'].lineData[181] = 0;
  _$jscoverage['/touch/handle.js'].lineData[184] = 0;
  _$jscoverage['/touch/handle.js'].lineData[185] = 0;
  _$jscoverage['/touch/handle.js'].lineData[188] = 0;
  _$jscoverage['/touch/handle.js'].lineData[189] = 0;
  _$jscoverage['/touch/handle.js'].lineData[190] = 0;
  _$jscoverage['/touch/handle.js'].lineData[191] = 0;
  _$jscoverage['/touch/handle.js'].lineData[193] = 0;
  _$jscoverage['/touch/handle.js'].lineData[195] = 0;
  _$jscoverage['/touch/handle.js'].lineData[197] = 0;
  _$jscoverage['/touch/handle.js'].lineData[198] = 0;
  _$jscoverage['/touch/handle.js'].lineData[199] = 0;
  _$jscoverage['/touch/handle.js'].lineData[200] = 0;
  _$jscoverage['/touch/handle.js'].lineData[201] = 0;
  _$jscoverage['/touch/handle.js'].lineData[205] = 0;
  _$jscoverage['/touch/handle.js'].lineData[209] = 0;
  _$jscoverage['/touch/handle.js'].lineData[210] = 0;
  _$jscoverage['/touch/handle.js'].lineData[211] = 0;
  _$jscoverage['/touch/handle.js'].lineData[212] = 0;
  _$jscoverage['/touch/handle.js'].lineData[213] = 0;
  _$jscoverage['/touch/handle.js'].lineData[214] = 0;
  _$jscoverage['/touch/handle.js'].lineData[216] = 0;
  _$jscoverage['/touch/handle.js'].lineData[217] = 0;
  _$jscoverage['/touch/handle.js'].lineData[218] = 0;
  _$jscoverage['/touch/handle.js'].lineData[219] = 0;
  _$jscoverage['/touch/handle.js'].lineData[220] = 0;
  _$jscoverage['/touch/handle.js'].lineData[223] = 0;
  _$jscoverage['/touch/handle.js'].lineData[226] = 0;
  _$jscoverage['/touch/handle.js'].lineData[227] = 0;
  _$jscoverage['/touch/handle.js'].lineData[228] = 0;
  _$jscoverage['/touch/handle.js'].lineData[231] = 0;
  _$jscoverage['/touch/handle.js'].lineData[235] = 0;
  _$jscoverage['/touch/handle.js'].lineData[237] = 0;
  _$jscoverage['/touch/handle.js'].lineData[238] = 0;
  _$jscoverage['/touch/handle.js'].lineData[239] = 0;
  _$jscoverage['/touch/handle.js'].lineData[241] = 0;
  _$jscoverage['/touch/handle.js'].lineData[242] = 0;
  _$jscoverage['/touch/handle.js'].lineData[243] = 0;
  _$jscoverage['/touch/handle.js'].lineData[244] = 0;
  _$jscoverage['/touch/handle.js'].lineData[245] = 0;
  _$jscoverage['/touch/handle.js'].lineData[248] = 0;
  _$jscoverage['/touch/handle.js'].lineData[252] = 0;
  _$jscoverage['/touch/handle.js'].lineData[254] = 0;
  _$jscoverage['/touch/handle.js'].lineData[255] = 0;
  _$jscoverage['/touch/handle.js'].lineData[256] = 0;
  _$jscoverage['/touch/handle.js'].lineData[260] = 0;
  _$jscoverage['/touch/handle.js'].lineData[261] = 0;
  _$jscoverage['/touch/handle.js'].lineData[262] = 0;
  _$jscoverage['/touch/handle.js'].lineData[263] = 0;
  _$jscoverage['/touch/handle.js'].lineData[264] = 0;
  _$jscoverage['/touch/handle.js'].lineData[266] = 0;
  _$jscoverage['/touch/handle.js'].lineData[267] = 0;
  _$jscoverage['/touch/handle.js'].lineData[268] = 0;
  _$jscoverage['/touch/handle.js'].lineData[269] = 0;
  _$jscoverage['/touch/handle.js'].lineData[270] = 0;
  _$jscoverage['/touch/handle.js'].lineData[271] = 0;
  _$jscoverage['/touch/handle.js'].lineData[277] = 0;
  _$jscoverage['/touch/handle.js'].lineData[281] = 0;
  _$jscoverage['/touch/handle.js'].lineData[283] = 0;
  _$jscoverage['/touch/handle.js'].lineData[284] = 0;
  _$jscoverage['/touch/handle.js'].lineData[286] = 0;
  _$jscoverage['/touch/handle.js'].lineData[288] = 0;
  _$jscoverage['/touch/handle.js'].lineData[289] = 0;
  _$jscoverage['/touch/handle.js'].lineData[290] = 0;
  _$jscoverage['/touch/handle.js'].lineData[292] = 0;
  _$jscoverage['/touch/handle.js'].lineData[294] = 0;
  _$jscoverage['/touch/handle.js'].lineData[295] = 0;
  _$jscoverage['/touch/handle.js'].lineData[299] = 0;
  _$jscoverage['/touch/handle.js'].lineData[300] = 0;
  _$jscoverage['/touch/handle.js'].lineData[301] = 0;
  _$jscoverage['/touch/handle.js'].lineData[306] = 0;
  _$jscoverage['/touch/handle.js'].lineData[309] = 0;
  _$jscoverage['/touch/handle.js'].lineData[310] = 0;
  _$jscoverage['/touch/handle.js'].lineData[312] = 0;
  _$jscoverage['/touch/handle.js'].lineData[320] = 0;
  _$jscoverage['/touch/handle.js'].lineData[321] = 0;
  _$jscoverage['/touch/handle.js'].lineData[322] = 0;
  _$jscoverage['/touch/handle.js'].lineData[323] = 0;
  _$jscoverage['/touch/handle.js'].lineData[324] = 0;
  _$jscoverage['/touch/handle.js'].lineData[330] = 0;
  _$jscoverage['/touch/handle.js'].lineData[332] = 0;
  _$jscoverage['/touch/handle.js'].lineData[333] = 0;
  _$jscoverage['/touch/handle.js'].lineData[334] = 0;
  _$jscoverage['/touch/handle.js'].lineData[338] = 0;
  _$jscoverage['/touch/handle.js'].lineData[340] = 0;
  _$jscoverage['/touch/handle.js'].lineData[342] = 0;
  _$jscoverage['/touch/handle.js'].lineData[343] = 0;
  _$jscoverage['/touch/handle.js'].lineData[345] = 0;
  _$jscoverage['/touch/handle.js'].lineData[346] = 0;
  _$jscoverage['/touch/handle.js'].lineData[351] = 0;
  _$jscoverage['/touch/handle.js'].lineData[353] = 0;
  _$jscoverage['/touch/handle.js'].lineData[354] = 0;
  _$jscoverage['/touch/handle.js'].lineData[355] = 0;
  _$jscoverage['/touch/handle.js'].lineData[357] = 0;
  _$jscoverage['/touch/handle.js'].lineData[358] = 0;
  _$jscoverage['/touch/handle.js'].lineData[359] = 0;
}
if (! _$jscoverage['/touch/handle.js'].functionData) {
  _$jscoverage['/touch/handle.js'].functionData = [];
  _$jscoverage['/touch/handle.js'].functionData[0] = 0;
  _$jscoverage['/touch/handle.js'].functionData[1] = 0;
  _$jscoverage['/touch/handle.js'].functionData[2] = 0;
  _$jscoverage['/touch/handle.js'].functionData[3] = 0;
  _$jscoverage['/touch/handle.js'].functionData[4] = 0;
  _$jscoverage['/touch/handle.js'].functionData[5] = 0;
  _$jscoverage['/touch/handle.js'].functionData[6] = 0;
  _$jscoverage['/touch/handle.js'].functionData[7] = 0;
  _$jscoverage['/touch/handle.js'].functionData[8] = 0;
  _$jscoverage['/touch/handle.js'].functionData[9] = 0;
  _$jscoverage['/touch/handle.js'].functionData[10] = 0;
  _$jscoverage['/touch/handle.js'].functionData[11] = 0;
  _$jscoverage['/touch/handle.js'].functionData[12] = 0;
  _$jscoverage['/touch/handle.js'].functionData[13] = 0;
  _$jscoverage['/touch/handle.js'].functionData[14] = 0;
  _$jscoverage['/touch/handle.js'].functionData[15] = 0;
  _$jscoverage['/touch/handle.js'].functionData[16] = 0;
  _$jscoverage['/touch/handle.js'].functionData[17] = 0;
  _$jscoverage['/touch/handle.js'].functionData[18] = 0;
  _$jscoverage['/touch/handle.js'].functionData[19] = 0;
  _$jscoverage['/touch/handle.js'].functionData[20] = 0;
  _$jscoverage['/touch/handle.js'].functionData[21] = 0;
  _$jscoverage['/touch/handle.js'].functionData[22] = 0;
  _$jscoverage['/touch/handle.js'].functionData[23] = 0;
  _$jscoverage['/touch/handle.js'].functionData[24] = 0;
  _$jscoverage['/touch/handle.js'].functionData[25] = 0;
}
if (! _$jscoverage['/touch/handle.js'].branchData) {
  _$jscoverage['/touch/handle.js'].branchData = {};
  _$jscoverage['/touch/handle.js'].branchData['32'] = [];
  _$jscoverage['/touch/handle.js'].branchData['32'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['40'] = [];
  _$jscoverage['/touch/handle.js'].branchData['40'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['41'] = [];
  _$jscoverage['/touch/handle.js'].branchData['41'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['52'] = [];
  _$jscoverage['/touch/handle.js'].branchData['52'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['58'] = [];
  _$jscoverage['/touch/handle.js'].branchData['58'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['90'] = [];
  _$jscoverage['/touch/handle.js'].branchData['90'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['107'] = [];
  _$jscoverage['/touch/handle.js'].branchData['107'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['109'] = [];
  _$jscoverage['/touch/handle.js'].branchData['109'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['122'] = [];
  _$jscoverage['/touch/handle.js'].branchData['122'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['124'] = [];
  _$jscoverage['/touch/handle.js'].branchData['124'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['131'] = [];
  _$jscoverage['/touch/handle.js'].branchData['131'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['135'] = [];
  _$jscoverage['/touch/handle.js'].branchData['135'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['141'] = [];
  _$jscoverage['/touch/handle.js'].branchData['141'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['151'] = [];
  _$jscoverage['/touch/handle.js'].branchData['151'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['157'] = [];
  _$jscoverage['/touch/handle.js'].branchData['157'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['169'] = [];
  _$jscoverage['/touch/handle.js'].branchData['169'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['169'][2] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['173'] = [];
  _$jscoverage['/touch/handle.js'].branchData['173'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['173'][2] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['173'][3] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['184'] = [];
  _$jscoverage['/touch/handle.js'].branchData['184'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['185'] = [];
  _$jscoverage['/touch/handle.js'].branchData['185'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['185'][2] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['185'][3] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['188'] = [];
  _$jscoverage['/touch/handle.js'].branchData['188'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['209'] = [];
  _$jscoverage['/touch/handle.js'].branchData['209'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['212'] = [];
  _$jscoverage['/touch/handle.js'].branchData['212'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['213'] = [];
  _$jscoverage['/touch/handle.js'].branchData['213'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['217'] = [];
  _$jscoverage['/touch/handle.js'].branchData['217'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['219'] = [];
  _$jscoverage['/touch/handle.js'].branchData['219'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['237'] = [];
  _$jscoverage['/touch/handle.js'].branchData['237'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['238'] = [];
  _$jscoverage['/touch/handle.js'].branchData['238'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['242'] = [];
  _$jscoverage['/touch/handle.js'].branchData['242'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['244'] = [];
  _$jscoverage['/touch/handle.js'].branchData['244'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['254'] = [];
  _$jscoverage['/touch/handle.js'].branchData['254'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['255'] = [];
  _$jscoverage['/touch/handle.js'].branchData['255'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['261'] = [];
  _$jscoverage['/touch/handle.js'].branchData['261'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['266'] = [];
  _$jscoverage['/touch/handle.js'].branchData['266'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['268'] = [];
  _$jscoverage['/touch/handle.js'].branchData['268'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['270'] = [];
  _$jscoverage['/touch/handle.js'].branchData['270'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['283'] = [];
  _$jscoverage['/touch/handle.js'].branchData['283'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['289'] = [];
  _$jscoverage['/touch/handle.js'].branchData['289'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['294'] = [];
  _$jscoverage['/touch/handle.js'].branchData['294'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['294'][2] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['294'][3] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['309'] = [];
  _$jscoverage['/touch/handle.js'].branchData['309'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['321'] = [];
  _$jscoverage['/touch/handle.js'].branchData['321'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['323'] = [];
  _$jscoverage['/touch/handle.js'].branchData['323'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['342'] = [];
  _$jscoverage['/touch/handle.js'].branchData['342'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['345'] = [];
  _$jscoverage['/touch/handle.js'].branchData['345'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['353'] = [];
  _$jscoverage['/touch/handle.js'].branchData['353'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['354'] = [];
  _$jscoverage['/touch/handle.js'].branchData['354'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['357'] = [];
  _$jscoverage['/touch/handle.js'].branchData['357'][1] = new BranchData();
}
_$jscoverage['/touch/handle.js'].branchData['357'][1].init(121, 35, 'S.isEmptyObject(handle.eventHandle)');
function visit58_357_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['357'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['354'][1].init(21, 5, 'event');
function visit57_354_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['354'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['353'][1].init(105, 6, 'handle');
function visit56_353_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['353'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['345'][1].init(217, 5, 'event');
function visit55_345_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['345'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['342'][1].init(105, 7, '!handle');
function visit54_342_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['342'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['323'][1].init(65, 25, '!eventHandle[event].count');
function visit53_323_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['323'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['321'][1].init(65, 18, 'eventHandle[event]');
function visit52_321_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['321'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['309'][1].init(149, 18, 'eventHandle[event]');
function visit51_309_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['309'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['294'][3].init(303, 26, 'h[method](event) === false');
function visit50_294_3(result) {
  _$jscoverage['/touch/handle.js'].branchData['294'][3].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['294'][2].init(290, 39, 'h[method] && h[method](event) === false');
function visit49_294_2(result) {
  _$jscoverage['/touch/handle.js'].branchData['294'][2].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['294'][1].init(276, 53, 'h.isActive && h[method] && h[method](event) === false');
function visit48_294_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['294'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['289'][1].init(125, 11, 'h.processed');
function visit47_289_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['289'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['283'][1].init(238, 28, '!event.changedTouches.length');
function visit46_283_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['283'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['270'][1].init(76, 20, '!self.touches.length');
function visit45_270_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['270'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['268'][1].init(610, 20, 'isPointerEvent(type)');
function visit44_268_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['268'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['266'][1].init(529, 18, 'isMouseEvent(type)');
function visit43_266_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['266'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['261'][1].init(296, 18, 'isTouchEvent(type)');
function visit42_261_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['261'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['255'][1].init(21, 37, 'self.isEventSimulatedFromTouch(event)');
function visit41_255_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['255'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['254'][1].init(81, 18, 'isMouseEvent(type)');
function visit40_254_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['254'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['244'][1].init(390, 15, '!isTouchEvent()');
function visit39_244_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['244'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['242'][1].init(287, 20, 'isPointerEvent(type)');
function visit38_242_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['242'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['238'][1].init(21, 36, 'self.isEventSimulatedFromTouch(type)');
function visit37_238_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['238'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['237'][1].init(81, 18, 'isMouseEvent(type)');
function visit36_237_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['237'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['219'][1].init(73, 25, 'self.touches.length === 1');
function visit35_219_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['219'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['217'][1].init(505, 20, 'isPointerEvent(type)');
function visit34_217_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['217'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['213'][1].init(21, 37, 'self.isEventSimulatedFromTouch(event)');
function visit33_213_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['213'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['212'][1].init(298, 18, 'isMouseEvent(type)');
function visit32_212_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['212'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['209'][1].init(151, 18, 'isTouchEvent(type)');
function visit31_209_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['209'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['188'][1].init(169, 22, 'touchList.length === 1');
function visit30_188_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['188'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['185'][3].init(53, 22, 'type === \'touchcancel\'');
function visit29_185_3(result) {
  _$jscoverage['/touch/handle.js'].branchData['185'][3].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['185'][2].init(30, 19, 'type === \'touchend\'');
function visit28_185_2(result) {
  _$jscoverage['/touch/handle.js'].branchData['185'][2].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['185'][1].init(30, 45, 'type === \'touchend\' || type === \'touchcancel\'');
function visit27_185_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['185'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['184'][1].init(98, 18, 'isTouchEvent(type)');
function visit26_184_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['184'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['173'][3].init(211, 14, 'dy <= DUP_DIST');
function visit25_173_3(result) {
  _$jscoverage['/touch/handle.js'].branchData['173'][3].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['173'][2].init(193, 14, 'dx <= DUP_DIST');
function visit24_173_2(result) {
  _$jscoverage['/touch/handle.js'].branchData['173'][2].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['173'][1].init(193, 32, 'dx <= DUP_DIST && dy <= DUP_DIST');
function visit23_173_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['173'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['169'][2].init(162, 5, 'i < l');
function visit22_169_2(result) {
  _$jscoverage['/touch/handle.js'].branchData['169'][2].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['169'][1].init(162, 21, 'i < l && (t = lts[i])');
function visit21_169_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['169'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['157'][1].init(70, 6, 'i > -1');
function visit20_157_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['157'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['151'][1].init(165, 22, 'this.isPrimaryTouch(t)');
function visit19_151_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['151'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['141'][1].init(17, 28, 'this.isPrimaryTouch(inTouch)');
function visit18_141_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['141'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['135'][1].init(17, 24, 'this.firstTouch === null');
function visit17_135_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['135'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['131'][1].init(20, 38, 'this.firstTouch === inTouch.identifier');
function visit16_131_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['131'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['124'][1].init(57, 29, 'touch.pointerId === pointerId');
function visit15_124_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['124'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['122'][1].init(195, 5, 'i < l');
function visit14_122_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['122'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['109'][1].init(57, 29, 'touch.pointerId === pointerId');
function visit13_109_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['109'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['107'][1].init(195, 5, 'i < l');
function visit12_107_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['107'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['90'][1].init(152, 33, '!isPointerEvent(gestureMoveEvent)');
function visit11_90_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['90'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['58'][1].init(1699, 31, 'Features.isMsPointerSupported()');
function visit10_58_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['58'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['52'][1].init(1420, 29, 'Features.isPointerSupported()');
function visit9_52_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['52'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['41'][1].init(13, 8, 'S.UA.ios');
function visit8_41_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['41'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['40'][1].init(920, 32, 'Features.isTouchEventSupported()');
function visit7_40_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['40'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['32'][1].init(16, 64, 'S.startsWith(type, \'MSPointer\') || S.startsWith(type, \'pointer\')');
function visit6_32_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['32'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/touch/handle.js'].functionData[0]++;
  _$jscoverage['/touch/handle.js'].lineData[7]++;
  var Dom = require('dom');
  _$jscoverage['/touch/handle.js'].lineData[8]++;
  var eventHandleMap = require('./handle-map');
  _$jscoverage['/touch/handle.js'].lineData[9]++;
  var DomEvent = require('event/dom/base');
  _$jscoverage['/touch/handle.js'].lineData[10]++;
  require('./tap');
  _$jscoverage['/touch/handle.js'].lineData[11]++;
  require('./swipe');
  _$jscoverage['/touch/handle.js'].lineData[12]++;
  require('./double-tap');
  _$jscoverage['/touch/handle.js'].lineData[13]++;
  require('./pinch');
  _$jscoverage['/touch/handle.js'].lineData[14]++;
  require('./tap-hold');
  _$jscoverage['/touch/handle.js'].lineData[15]++;
  require('./rotate');
  _$jscoverage['/touch/handle.js'].lineData[17]++;
  var key = S.guid('touch-handle'), Features = S.Features, gestureStartEvent, gestureMoveEvent, gestureEndEvent;
  _$jscoverage['/touch/handle.js'].lineData[23]++;
  function isTouchEvent(type) {
    _$jscoverage['/touch/handle.js'].functionData[1]++;
    _$jscoverage['/touch/handle.js'].lineData[24]++;
    return S.startsWith(type, 'touch');
  }
  _$jscoverage['/touch/handle.js'].lineData[27]++;
  function isMouseEvent(type) {
    _$jscoverage['/touch/handle.js'].functionData[2]++;
    _$jscoverage['/touch/handle.js'].lineData[28]++;
    return S.startsWith(type, 'mouse');
  }
  _$jscoverage['/touch/handle.js'].lineData[31]++;
  function isPointerEvent(type) {
    _$jscoverage['/touch/handle.js'].functionData[3]++;
    _$jscoverage['/touch/handle.js'].lineData[32]++;
    return visit6_32_1(S.startsWith(type, 'MSPointer') || S.startsWith(type, 'pointer'));
  }
  _$jscoverage['/touch/handle.js'].lineData[36]++;
  var DUP_TIMEOUT = 2500;
  _$jscoverage['/touch/handle.js'].lineData[38]++;
  var DUP_DIST = 25;
  _$jscoverage['/touch/handle.js'].lineData[40]++;
  if (visit7_40_1(Features.isTouchEventSupported())) {
    _$jscoverage['/touch/handle.js'].lineData[41]++;
    if (visit8_41_1(S.UA.ios)) {
      _$jscoverage['/touch/handle.js'].lineData[43]++;
      gestureEndEvent = 'touchend touchcancel';
      _$jscoverage['/touch/handle.js'].lineData[44]++;
      gestureStartEvent = 'touchstart';
      _$jscoverage['/touch/handle.js'].lineData[45]++;
      gestureMoveEvent = 'touchmove';
    } else {
      _$jscoverage['/touch/handle.js'].lineData[47]++;
      gestureEndEvent = 'touchend touchcancel mouseup';
      _$jscoverage['/touch/handle.js'].lineData[49]++;
      gestureStartEvent = 'touchstart mousedown';
      _$jscoverage['/touch/handle.js'].lineData[50]++;
      gestureMoveEvent = 'touchmove mousemove';
    }
  } else {
    _$jscoverage['/touch/handle.js'].lineData[52]++;
    if (visit9_52_1(Features.isPointerSupported())) {
      _$jscoverage['/touch/handle.js'].lineData[55]++;
      gestureStartEvent = 'pointerdown';
      _$jscoverage['/touch/handle.js'].lineData[56]++;
      gestureMoveEvent = 'pointermove';
      _$jscoverage['/touch/handle.js'].lineData[57]++;
      gestureEndEvent = 'pointerup pointercancel';
    } else {
      _$jscoverage['/touch/handle.js'].lineData[58]++;
      if (visit10_58_1(Features.isMsPointerSupported())) {
        _$jscoverage['/touch/handle.js'].lineData[59]++;
        gestureStartEvent = 'MSPointerDown';
        _$jscoverage['/touch/handle.js'].lineData[60]++;
        gestureMoveEvent = 'MSPointerMove';
        _$jscoverage['/touch/handle.js'].lineData[61]++;
        gestureEndEvent = 'MSPointerUp MSPointerCancel';
      } else {
        _$jscoverage['/touch/handle.js'].lineData[63]++;
        gestureStartEvent = 'mousedown';
        _$jscoverage['/touch/handle.js'].lineData[64]++;
        gestureMoveEvent = 'mousemove';
        _$jscoverage['/touch/handle.js'].lineData[65]++;
        gestureEndEvent = 'mouseup';
      }
    }
  }
  _$jscoverage['/touch/handle.js'].lineData[68]++;
  function DocumentHandler(doc) {
    _$jscoverage['/touch/handle.js'].functionData[4]++;
    _$jscoverage['/touch/handle.js'].lineData[69]++;
    var self = this;
    _$jscoverage['/touch/handle.js'].lineData[70]++;
    self.doc = doc;
    _$jscoverage['/touch/handle.js'].lineData[71]++;
    self.eventHandle = {};
    _$jscoverage['/touch/handle.js'].lineData[72]++;
    self.init();
    _$jscoverage['/touch/handle.js'].lineData[74]++;
    self.touches = [];
    _$jscoverage['/touch/handle.js'].lineData[76]++;
    self.inTouch = 0;
  }
  _$jscoverage['/touch/handle.js'].lineData[79]++;
  DocumentHandler.prototype = {
  constructor: DocumentHandler, 
  lastTouches: [], 
  firstTouch: null, 
  init: function() {
  _$jscoverage['/touch/handle.js'].functionData[5]++;
  _$jscoverage['/touch/handle.js'].lineData[87]++;
  var self = this, doc = self.doc;
  _$jscoverage['/touch/handle.js'].lineData[89]++;
  DomEvent.on(doc, gestureStartEvent, self.onTouchStart, self);
  _$jscoverage['/touch/handle.js'].lineData[90]++;
  if (visit11_90_1(!isPointerEvent(gestureMoveEvent))) {
    _$jscoverage['/touch/handle.js'].lineData[91]++;
    DomEvent.on(doc, gestureMoveEvent, self.onTouchMove, self);
  }
  _$jscoverage['/touch/handle.js'].lineData[93]++;
  DomEvent.on(doc, gestureEndEvent, self.onTouchEnd, self);
}, 
  addTouch: function(originalEvent) {
  _$jscoverage['/touch/handle.js'].functionData[6]++;
  _$jscoverage['/touch/handle.js'].lineData[97]++;
  originalEvent.identifier = originalEvent.pointerId;
  _$jscoverage['/touch/handle.js'].lineData[98]++;
  this.touches.push(originalEvent);
}, 
  removeTouch: function(originalEvent) {
  _$jscoverage['/touch/handle.js'].functionData[7]++;
  _$jscoverage['/touch/handle.js'].lineData[102]++;
  var i = 0, touch, pointerId = originalEvent.pointerId, touches = this.touches, l = touches.length;
  _$jscoverage['/touch/handle.js'].lineData[107]++;
  for (; visit12_107_1(i < l); i++) {
    _$jscoverage['/touch/handle.js'].lineData[108]++;
    touch = touches[i];
    _$jscoverage['/touch/handle.js'].lineData[109]++;
    if (visit13_109_1(touch.pointerId === pointerId)) {
      _$jscoverage['/touch/handle.js'].lineData[110]++;
      touches.splice(i, 1);
      _$jscoverage['/touch/handle.js'].lineData[111]++;
      break;
    }
  }
}, 
  updateTouch: function(originalEvent) {
  _$jscoverage['/touch/handle.js'].functionData[8]++;
  _$jscoverage['/touch/handle.js'].lineData[117]++;
  var i = 0, touch, pointerId = originalEvent.pointerId, touches = this.touches, l = touches.length;
  _$jscoverage['/touch/handle.js'].lineData[122]++;
  for (; visit14_122_1(i < l); i++) {
    _$jscoverage['/touch/handle.js'].lineData[123]++;
    touch = touches[i];
    _$jscoverage['/touch/handle.js'].lineData[124]++;
    if (visit15_124_1(touch.pointerId === pointerId)) {
      _$jscoverage['/touch/handle.js'].lineData[125]++;
      touches[i] = originalEvent;
    }
  }
}, 
  isPrimaryTouch: function(inTouch) {
  _$jscoverage['/touch/handle.js'].functionData[9]++;
  _$jscoverage['/touch/handle.js'].lineData[131]++;
  return visit16_131_1(this.firstTouch === inTouch.identifier);
}, 
  setPrimaryTouch: function(inTouch) {
  _$jscoverage['/touch/handle.js'].functionData[10]++;
  _$jscoverage['/touch/handle.js'].lineData[135]++;
  if (visit17_135_1(this.firstTouch === null)) {
    _$jscoverage['/touch/handle.js'].lineData[136]++;
    this.firstTouch = inTouch.identifier;
  }
}, 
  removePrimaryTouch: function(inTouch) {
  _$jscoverage['/touch/handle.js'].functionData[11]++;
  _$jscoverage['/touch/handle.js'].lineData[141]++;
  if (visit18_141_1(this.isPrimaryTouch(inTouch))) {
    _$jscoverage['/touch/handle.js'].lineData[142]++;
    this.firstTouch = null;
  }
}, 
  dupMouse: function(inEvent) {
  _$jscoverage['/touch/handle.js'].functionData[12]++;
  _$jscoverage['/touch/handle.js'].lineData[148]++;
  var lts = this.lastTouches;
  _$jscoverage['/touch/handle.js'].lineData[149]++;
  var t = inEvent.changedTouches[0];
  _$jscoverage['/touch/handle.js'].lineData[151]++;
  if (visit19_151_1(this.isPrimaryTouch(t))) {
    _$jscoverage['/touch/handle.js'].lineData[153]++;
    var lt = {
  x: t.clientX, 
  y: t.clientY};
    _$jscoverage['/touch/handle.js'].lineData[154]++;
    lts.push(lt);
    _$jscoverage['/touch/handle.js'].lineData[155]++;
    setTimeout(function() {
  _$jscoverage['/touch/handle.js'].functionData[13]++;
  _$jscoverage['/touch/handle.js'].lineData[156]++;
  var i = lts.indexOf(lt);
  _$jscoverage['/touch/handle.js'].lineData[157]++;
  if (visit20_157_1(i > -1)) {
    _$jscoverage['/touch/handle.js'].lineData[158]++;
    lts.splice(i, 1);
  }
}, DUP_TIMEOUT);
  }
}, 
  isEventSimulatedFromTouch: function(inEvent) {
  _$jscoverage['/touch/handle.js'].functionData[14]++;
  _$jscoverage['/touch/handle.js'].lineData[166]++;
  var lts = this.lastTouches;
  _$jscoverage['/touch/handle.js'].lineData[167]++;
  var x = inEvent.clientX, y = inEvent.clientY;
  _$jscoverage['/touch/handle.js'].lineData[169]++;
  for (var i = 0, l = lts.length, t; visit21_169_1(visit22_169_2(i < l) && (t = lts[i])); i++) {
    _$jscoverage['/touch/handle.js'].lineData[171]++;
    var dx = Math.abs(x - t.x), dy = Math.abs(y - t.y);
    _$jscoverage['/touch/handle.js'].lineData[173]++;
    if (visit23_173_1(visit24_173_2(dx <= DUP_DIST) && visit25_173_3(dy <= DUP_DIST))) {
      _$jscoverage['/touch/handle.js'].lineData[174]++;
      return true;
    }
  }
  _$jscoverage['/touch/handle.js'].lineData[177]++;
  return 0;
}, 
  normalize: function(e) {
  _$jscoverage['/touch/handle.js'].functionData[15]++;
  _$jscoverage['/touch/handle.js'].lineData[181]++;
  var type = e.type, notUp, touchList;
  _$jscoverage['/touch/handle.js'].lineData[184]++;
  if (visit26_184_1(isTouchEvent(type))) {
    _$jscoverage['/touch/handle.js'].lineData[185]++;
    touchList = (visit27_185_1(visit28_185_2(type === 'touchend') || visit29_185_3(type === 'touchcancel'))) ? e.changedTouches : e.touches;
    _$jscoverage['/touch/handle.js'].lineData[188]++;
    if (visit30_188_1(touchList.length === 1)) {
      _$jscoverage['/touch/handle.js'].lineData[189]++;
      e.which = 1;
      _$jscoverage['/touch/handle.js'].lineData[190]++;
      e.pageX = touchList[0].pageX;
      _$jscoverage['/touch/handle.js'].lineData[191]++;
      e.pageY = touchList[0].pageY;
    }
    _$jscoverage['/touch/handle.js'].lineData[193]++;
    return e;
  } else {
    _$jscoverage['/touch/handle.js'].lineData[195]++;
    touchList = this.touches;
  }
  _$jscoverage['/touch/handle.js'].lineData[197]++;
  notUp = !type.match(/(up|cancel)$/i);
  _$jscoverage['/touch/handle.js'].lineData[198]++;
  e.touches = notUp ? touchList : [];
  _$jscoverage['/touch/handle.js'].lineData[199]++;
  e.targetTouches = notUp ? touchList : [];
  _$jscoverage['/touch/handle.js'].lineData[200]++;
  e.changedTouches = touchList;
  _$jscoverage['/touch/handle.js'].lineData[201]++;
  return e;
}, 
  onTouchStart: function(event) {
  _$jscoverage['/touch/handle.js'].functionData[16]++;
  _$jscoverage['/touch/handle.js'].lineData[205]++;
  var e, h, self = this, type = event.type, eventHandle = self.eventHandle;
  _$jscoverage['/touch/handle.js'].lineData[209]++;
  if (visit31_209_1(isTouchEvent(type))) {
    _$jscoverage['/touch/handle.js'].lineData[210]++;
    self.setPrimaryTouch(event.changedTouches[0]);
    _$jscoverage['/touch/handle.js'].lineData[211]++;
    self.dupMouse(event);
  } else {
    _$jscoverage['/touch/handle.js'].lineData[212]++;
    if (visit32_212_1(isMouseEvent(type))) {
      _$jscoverage['/touch/handle.js'].lineData[213]++;
      if (visit33_213_1(self.isEventSimulatedFromTouch(event))) {
        _$jscoverage['/touch/handle.js'].lineData[214]++;
        return;
      }
      _$jscoverage['/touch/handle.js'].lineData[216]++;
      self.touches = [event.originalEvent];
    } else {
      _$jscoverage['/touch/handle.js'].lineData[217]++;
      if (visit34_217_1(isPointerEvent(type))) {
        _$jscoverage['/touch/handle.js'].lineData[218]++;
        self.addTouch(event.originalEvent);
        _$jscoverage['/touch/handle.js'].lineData[219]++;
        if (visit35_219_1(self.touches.length === 1)) {
          _$jscoverage['/touch/handle.js'].lineData[220]++;
          DomEvent.on(self.doc, gestureMoveEvent, self.onTouchMove, self);
        }
      } else {
        _$jscoverage['/touch/handle.js'].lineData[223]++;
        throw new Error('unrecognized touch event: ' + event.type);
      }
    }
  }
  _$jscoverage['/touch/handle.js'].lineData[226]++;
  for (e in eventHandle) {
    _$jscoverage['/touch/handle.js'].lineData[227]++;
    h = eventHandle[e].handle;
    _$jscoverage['/touch/handle.js'].lineData[228]++;
    h.isActive = 1;
  }
  _$jscoverage['/touch/handle.js'].lineData[231]++;
  self.callEventHandle('onTouchStart', event);
}, 
  onTouchMove: function(event) {
  _$jscoverage['/touch/handle.js'].functionData[17]++;
  _$jscoverage['/touch/handle.js'].lineData[235]++;
  var self = this, type = event.type;
  _$jscoverage['/touch/handle.js'].lineData[237]++;
  if (visit36_237_1(isMouseEvent(type))) {
    _$jscoverage['/touch/handle.js'].lineData[238]++;
    if (visit37_238_1(self.isEventSimulatedFromTouch(type))) {
      _$jscoverage['/touch/handle.js'].lineData[239]++;
      return;
    }
    _$jscoverage['/touch/handle.js'].lineData[241]++;
    self.touches = [event.originalEvent];
  } else {
    _$jscoverage['/touch/handle.js'].lineData[242]++;
    if (visit38_242_1(isPointerEvent(type))) {
      _$jscoverage['/touch/handle.js'].lineData[243]++;
      self.updateTouch(event.originalEvent);
    } else {
      _$jscoverage['/touch/handle.js'].lineData[244]++;
      if (visit39_244_1(!isTouchEvent())) {
        _$jscoverage['/touch/handle.js'].lineData[245]++;
        throw new Error('unrecognized touch event: ' + event.type);
      }
    }
  }
  _$jscoverage['/touch/handle.js'].lineData[248]++;
  self.callEventHandle('onTouchMove', event);
}, 
  onTouchEnd: function(event) {
  _$jscoverage['/touch/handle.js'].functionData[18]++;
  _$jscoverage['/touch/handle.js'].lineData[252]++;
  var self = this, type = event.type;
  _$jscoverage['/touch/handle.js'].lineData[254]++;
  if (visit40_254_1(isMouseEvent(type))) {
    _$jscoverage['/touch/handle.js'].lineData[255]++;
    if (visit41_255_1(self.isEventSimulatedFromTouch(event))) {
      _$jscoverage['/touch/handle.js'].lineData[256]++;
      return;
    }
  }
  _$jscoverage['/touch/handle.js'].lineData[260]++;
  self.callEventHandle('onTouchEnd', event);
  _$jscoverage['/touch/handle.js'].lineData[261]++;
  if (visit42_261_1(isTouchEvent(type))) {
    _$jscoverage['/touch/handle.js'].lineData[262]++;
    self.dupMouse(event);
    _$jscoverage['/touch/handle.js'].lineData[263]++;
    S.makeArray(event.changedTouches).forEach(function(touch) {
  _$jscoverage['/touch/handle.js'].functionData[19]++;
  _$jscoverage['/touch/handle.js'].lineData[264]++;
  self.removePrimaryTouch(touch);
});
  } else {
    _$jscoverage['/touch/handle.js'].lineData[266]++;
    if (visit43_266_1(isMouseEvent(type))) {
      _$jscoverage['/touch/handle.js'].lineData[267]++;
      self.touches = [];
    } else {
      _$jscoverage['/touch/handle.js'].lineData[268]++;
      if (visit44_268_1(isPointerEvent(type))) {
        _$jscoverage['/touch/handle.js'].lineData[269]++;
        self.removeTouch(event.originalEvent);
        _$jscoverage['/touch/handle.js'].lineData[270]++;
        if (visit45_270_1(!self.touches.length)) {
          _$jscoverage['/touch/handle.js'].lineData[271]++;
          DomEvent.detach(self.doc, gestureMoveEvent, self.onTouchMove, self);
        }
      }
    }
  }
}, 
  callEventHandle: function(method, event) {
  _$jscoverage['/touch/handle.js'].functionData[20]++;
  _$jscoverage['/touch/handle.js'].lineData[277]++;
  var self = this, eventHandle = self.eventHandle, e, h;
  _$jscoverage['/touch/handle.js'].lineData[281]++;
  event = self.normalize(event);
  _$jscoverage['/touch/handle.js'].lineData[283]++;
  if (visit46_283_1(!event.changedTouches.length)) {
    _$jscoverage['/touch/handle.js'].lineData[284]++;
    return;
  }
  _$jscoverage['/touch/handle.js'].lineData[286]++;
  for (e in eventHandle) {
    _$jscoverage['/touch/handle.js'].lineData[288]++;
    h = eventHandle[e].handle;
    _$jscoverage['/touch/handle.js'].lineData[289]++;
    if (visit47_289_1(h.processed)) {
      _$jscoverage['/touch/handle.js'].lineData[290]++;
      continue;
    }
    _$jscoverage['/touch/handle.js'].lineData[292]++;
    h.processed = 1;
    _$jscoverage['/touch/handle.js'].lineData[294]++;
    if (visit48_294_1(h.isActive && visit49_294_2(h[method] && visit50_294_3(h[method](event) === false)))) {
      _$jscoverage['/touch/handle.js'].lineData[295]++;
      h.isActive = 0;
    }
  }
  _$jscoverage['/touch/handle.js'].lineData[299]++;
  for (e in eventHandle) {
    _$jscoverage['/touch/handle.js'].lineData[300]++;
    h = eventHandle[e].handle;
    _$jscoverage['/touch/handle.js'].lineData[301]++;
    h.processed = 0;
  }
}, 
  addEventHandle: function(event) {
  _$jscoverage['/touch/handle.js'].functionData[21]++;
  _$jscoverage['/touch/handle.js'].lineData[306]++;
  var self = this, eventHandle = self.eventHandle, handle = eventHandleMap[event].handle;
  _$jscoverage['/touch/handle.js'].lineData[309]++;
  if (visit51_309_1(eventHandle[event])) {
    _$jscoverage['/touch/handle.js'].lineData[310]++;
    eventHandle[event].count++;
  } else {
    _$jscoverage['/touch/handle.js'].lineData[312]++;
    eventHandle[event] = {
  count: 1, 
  handle: handle};
  }
}, 
  'removeEventHandle': function(event) {
  _$jscoverage['/touch/handle.js'].functionData[22]++;
  _$jscoverage['/touch/handle.js'].lineData[320]++;
  var eventHandle = this.eventHandle;
  _$jscoverage['/touch/handle.js'].lineData[321]++;
  if (visit52_321_1(eventHandle[event])) {
    _$jscoverage['/touch/handle.js'].lineData[322]++;
    eventHandle[event].count--;
    _$jscoverage['/touch/handle.js'].lineData[323]++;
    if (visit53_323_1(!eventHandle[event].count)) {
      _$jscoverage['/touch/handle.js'].lineData[324]++;
      delete eventHandle[event];
    }
  }
}, 
  destroy: function() {
  _$jscoverage['/touch/handle.js'].functionData[23]++;
  _$jscoverage['/touch/handle.js'].lineData[330]++;
  var self = this, doc = self.doc;
  _$jscoverage['/touch/handle.js'].lineData[332]++;
  DomEvent.detach(doc, gestureStartEvent, self.onTouchStart, self);
  _$jscoverage['/touch/handle.js'].lineData[333]++;
  DomEvent.detach(doc, gestureMoveEvent, self.onTouchMove, self);
  _$jscoverage['/touch/handle.js'].lineData[334]++;
  DomEvent.detach(doc, gestureEndEvent, self.onTouchEnd, self);
}};
  _$jscoverage['/touch/handle.js'].lineData[338]++;
  return {
  addDocumentHandle: function(el, event) {
  _$jscoverage['/touch/handle.js'].functionData[24]++;
  _$jscoverage['/touch/handle.js'].lineData[340]++;
  var doc = Dom.getDocument(el), handle = Dom.data(doc, key);
  _$jscoverage['/touch/handle.js'].lineData[342]++;
  if (visit54_342_1(!handle)) {
    _$jscoverage['/touch/handle.js'].lineData[343]++;
    Dom.data(doc, key, handle = new DocumentHandler(doc));
  }
  _$jscoverage['/touch/handle.js'].lineData[345]++;
  if (visit55_345_1(event)) {
    _$jscoverage['/touch/handle.js'].lineData[346]++;
    handle.addEventHandle(event);
  }
}, 
  removeDocumentHandle: function(el, event) {
  _$jscoverage['/touch/handle.js'].functionData[25]++;
  _$jscoverage['/touch/handle.js'].lineData[351]++;
  var doc = Dom.getDocument(el), handle = Dom.data(doc, key);
  _$jscoverage['/touch/handle.js'].lineData[353]++;
  if (visit56_353_1(handle)) {
    _$jscoverage['/touch/handle.js'].lineData[354]++;
    if (visit57_354_1(event)) {
      _$jscoverage['/touch/handle.js'].lineData[355]++;
      handle.removeEventHandle(event);
    }
    _$jscoverage['/touch/handle.js'].lineData[357]++;
    if (visit58_357_1(S.isEmptyObject(handle.eventHandle))) {
      _$jscoverage['/touch/handle.js'].lineData[358]++;
      handle.destroy();
      _$jscoverage['/touch/handle.js'].lineData[359]++;
      Dom.removeData(doc, key);
    }
  }
}};
});
