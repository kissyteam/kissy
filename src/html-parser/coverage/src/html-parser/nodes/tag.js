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
if (! _$jscoverage['/html-parser/nodes/tag.js']) {
  _$jscoverage['/html-parser/nodes/tag.js'] = {};
  _$jscoverage['/html-parser/nodes/tag.js'].lineData = [];
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[6] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[8] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[9] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[10] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[11] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[12] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[24] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[25] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[27] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[28] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[29] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[30] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[31] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[33] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[34] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[36] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[38] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[41] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[42] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[44] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[45] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[46] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[49] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[52] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[53] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[57] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[61] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[63] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[64] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[67] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[68] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[69] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[70] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[71] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[72] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[73] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[75] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[76] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[77] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[78] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[79] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[81] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[85] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[88] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[90] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[91] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[92] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[94] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[98] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[100] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[101] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[103] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[116] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[120] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[121] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[122] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[123] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[128] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[129] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[131] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[132] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[134] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[135] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[137] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[138] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[139] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[142] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[146] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[150] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[151] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[155] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[157] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[158] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[162] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[164] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[165] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[166] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[170] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[171] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[175] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[177] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[178] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[183] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[185] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[186] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[188] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[193] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[194] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[198] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[200] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[201] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[205] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[206] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[210] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[211] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[212] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[214] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[219] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[220] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[221] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[222] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[230] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[231] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[232] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[233] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[234] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[236] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[237] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[238] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[240] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[250] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[256] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[257] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[258] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[261] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[262] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[265] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[267] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[268] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[271] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[273] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[275] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[276] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[280] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[281] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[285] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[286] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[287] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[291] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[292] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[293] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[297] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[300] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[301] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[302] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[303] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[304] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[306] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[307] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[309] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[311] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[312] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[315] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[319] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[321] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[322] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[324] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[334] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[337] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[338] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[344] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[345] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[346] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[347] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[348] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[352] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[355] = 0;
}
if (! _$jscoverage['/html-parser/nodes/tag.js'].functionData) {
  _$jscoverage['/html-parser/nodes/tag.js'].functionData = [];
  _$jscoverage['/html-parser/nodes/tag.js'].functionData[0] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].functionData[1] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].functionData[2] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].functionData[3] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].functionData[4] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].functionData[5] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].functionData[6] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].functionData[7] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].functionData[8] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].functionData[9] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].functionData[10] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].functionData[11] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].functionData[12] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].functionData[13] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].functionData[14] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].functionData[15] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].functionData[16] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].functionData[17] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].functionData[18] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].functionData[19] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].functionData[20] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].functionData[21] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].functionData[22] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].functionData[23] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].functionData[24] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].functionData[25] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].functionData[26] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].functionData[27] = 0;
}
if (! _$jscoverage['/html-parser/nodes/tag.js'].branchData) {
  _$jscoverage['/html-parser/nodes/tag.js'].branchData = {};
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['30'] = [];
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['30'][1] = new BranchData();
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['33'] = [];
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['33'][1] = new BranchData();
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['41'] = [];
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['41'][1] = new BranchData();
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['50'] = [];
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['50'][1] = new BranchData();
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['52'] = [];
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['52'][1] = new BranchData();
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['57'] = [];
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['57'][1] = new BranchData();
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['71'] = [];
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['71'][1] = new BranchData();
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['75'] = [];
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['75'][1] = new BranchData();
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['76'] = [];
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['76'][1] = new BranchData();
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['91'] = [];
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['91'][1] = new BranchData();
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['122'] = [];
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['122'][1] = new BranchData();
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['128'] = [];
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['128'][1] = new BranchData();
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['128'][2] = new BranchData();
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['131'] = [];
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['131'][1] = new BranchData();
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['134'] = [];
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['134'][1] = new BranchData();
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['137'] = [];
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['137'][1] = new BranchData();
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['138'] = [];
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['138'][1] = new BranchData();
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['185'] = [];
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['185'][1] = new BranchData();
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['206'] = [];
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['206'][1] = new BranchData();
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['211'] = [];
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['211'][1] = new BranchData();
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['220'] = [];
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['220'][1] = new BranchData();
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['231'] = [];
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['231'][1] = new BranchData();
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['256'] = [];
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['256'][1] = new BranchData();
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['265'] = [];
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['265'][1] = new BranchData();
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['267'] = [];
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['267'][1] = new BranchData();
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['275'] = [];
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['275'][1] = new BranchData();
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['280'] = [];
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['280'][1] = new BranchData();
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['285'] = [];
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['285'][1] = new BranchData();
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['291'] = [];
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['291'][1] = new BranchData();
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['301'] = [];
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['301'][1] = new BranchData();
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['304'] = [];
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['304'][1] = new BranchData();
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['306'] = [];
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['306'][1] = new BranchData();
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['311'] = [];
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['311'][1] = new BranchData();
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['321'] = [];
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['321'][1] = new BranchData();
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['345'] = [];
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['345'][1] = new BranchData();
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['346'] = [];
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['346'][1] = new BranchData();
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['347'] = [];
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['347'][1] = new BranchData();
}
_$jscoverage['/html-parser/nodes/tag.js'].branchData['347'][1].init(22, 26, 'attributes[i].name == name');
function visit229_347_1(result) {
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['347'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/nodes/tag.js'].branchData['346'][1].init(30, 21, 'i < attributes.length');
function visit228_346_1(result) {
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['346'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/nodes/tag.js'].branchData['345'][1].init(14, 31, 'attributes && attributes.length');
function visit227_345_1(result) {
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['345'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/nodes/tag.js'].branchData['321'][1].init(2165, 16, '!el.isSelfClosed');
function visit226_321_1(result) {
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['321'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/nodes/tag.js'].branchData['311'][1].init(307, 38, 'filter.onAttribute(attr, el) === false');
function visit225_311_1(result) {
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['311'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/nodes/tag.js'].branchData['306'][1].init(76, 50, '!(attrName = filter.onAttributeName(attrName, el))');
function visit224_306_1(result) {
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['306'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/nodes/tag.js'].branchData['304'][1].init(104, 6, 'filter');
function visit223_304_1(result) {
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['304'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/nodes/tag.js'].branchData['301'][1].init(1443, 21, 'i < attributes.length');
function visit222_301_1(result) {
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['301'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/nodes/tag.js'].branchData['291'][1].init(724, 11, '!el.tagName');
function visit221_291_1(result) {
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['291'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/nodes/tag.js'].branchData['285'][1].init(525, 17, 'el.nodeType !== 1');
function visit220_285_1(result) {
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['285'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/nodes/tag.js'].branchData['280'][1].init(394, 3, 'tmp');
function visit219_280_1(result) {
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['280'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/nodes/tag.js'].branchData['275'][1].init(277, 13, 'tmp === false');
function visit218_275_1(result) {
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['275'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/nodes/tag.js'].branchData['267'][1].init(80, 38, '!(tagName = filter.onTagName(tagName))');
function visit217_267_1(result) {
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['267'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/nodes/tag.js'].branchData['265'][1].init(430, 6, 'filter');
function visit216_265_1(result) {
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['265'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/nodes/tag.js'].branchData['256'][1].init(178, 21, 'tagName == "!doctype"');
function visit215_256_1(result) {
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['256'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/nodes/tag.js'].branchData['231'][1].init(48, 24, '!self.isChildrenFiltered');
function visit214_231_1(result) {
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['231'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/nodes/tag.js'].branchData['220'][1].init(86, 4, 'attr');
function visit213_220_1(result) {
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['220'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/nodes/tag.js'].branchData['211'][1].init(86, 4, 'attr');
function visit212_211_1(result) {
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['211'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/nodes/tag.js'].branchData['206'][1].init(89, 18, 'attr && attr.value');
function visit211_206_1(result) {
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['206'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/nodes/tag.js'].branchData['185'][1].init(122, 27, 'index == silbing.length - 1');
function visit210_185_1(result) {
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['185'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/nodes/tag.js'].branchData['138'][1].init(22, 45, '!this.attributes[i].equals(tag.attributes[i])');
function visit209_138_1(result) {
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['138'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/nodes/tag.js'].branchData['137'][1].init(332, 26, 'i < this.attributes.length');
function visit208_137_1(result) {
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['137'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/nodes/tag.js'].branchData['134'][1].init(210, 47, 'this.attributes.length != tag.attributes.length');
function visit207_134_1(result) {
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['134'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/nodes/tag.js'].branchData['131'][1].init(118, 29, 'this.nodeType != tag.nodeType');
function visit206_131_1(result) {
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['131'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/nodes/tag.js'].branchData['128'][2].init(26, 29, 'this.nodeName != tag.nodeName');
function visit205_128_2(result) {
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['128'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/nodes/tag.js'].branchData['128'][1].init(18, 37, '!tag || this.nodeName != tag.nodeName');
function visit204_128_1(result) {
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['128'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/nodes/tag.js'].branchData['122'][1].init(95, 1, 'v');
function visit203_122_1(result) {
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['122'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/nodes/tag.js'].branchData['91'][1].init(181, 18, '!self.isSelfClosed');
function visit202_91_1(result) {
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['91'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/nodes/tag.js'].branchData['76'][1].init(30, 16, 'i < c.length - 1');
function visit201_76_1(result) {
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['76'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/nodes/tag.js'].branchData['75'][1].init(259, 12, 'c.length > 1');
function visit200_75_1(result) {
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['75'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/nodes/tag.js'].branchData['71'][1].init(124, 13, 'c.length >= 1');
function visit199_71_1(result) {
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['71'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/nodes/tag.js'].branchData['57'][1].init(838, 30, 'self.isSelfClosed || lastSlash');
function visit198_57_1(result) {
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['57'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/nodes/tag.js'].branchData['52'][1].init(681, 9, 'lastSlash');
function visit197_52_1(result) {
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['52'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/nodes/tag.js'].branchData['50'][1].init(81, 37, 'lastAttr && /\\/$/.test(lastAttr.name)');
function visit196_50_1(result) {
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['50'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/nodes/tag.js'].branchData['41'][1].init(182, 13, 'attributes[0]');
function visit195_41_1(result) {
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['41'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/nodes/tag.js'].branchData['33'][1].init(213, 23, 'typeof page == \'string\'');
function visit194_33_1(result) {
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['33'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/nodes/tag.js'].branchData['30'][1].init(152, 16, 'attributes || []');
function visit193_30_1(result) {
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['30'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/nodes/tag.js'].lineData[6]++;
KISSY.add("html-parser/nodes/tag", function(S, Node, Attribute, Dtd) {
  _$jscoverage['/html-parser/nodes/tag.js'].functionData[0]++;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[8]++;
  function createTag(self, tagName, attrs) {
    _$jscoverage['/html-parser/nodes/tag.js'].functionData[1]++;
    _$jscoverage['/html-parser/nodes/tag.js'].lineData[9]++;
    self.nodeName = self.tagName = tagName.toLowerCase();
    _$jscoverage['/html-parser/nodes/tag.js'].lineData[10]++;
    self._updateSelfClosed();
    _$jscoverage['/html-parser/nodes/tag.js'].lineData[11]++;
    S.each(attrs, function(v, n) {
  _$jscoverage['/html-parser/nodes/tag.js'].functionData[2]++;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[12]++;
  self.setAttribute(n, v);
});
  }
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[24]++;
  function Tag(page, startPosition, endPosition, attributes) {
    _$jscoverage['/html-parser/nodes/tag.js'].functionData[3]++;
    _$jscoverage['/html-parser/nodes/tag.js'].lineData[25]++;
    var self = this;
    _$jscoverage['/html-parser/nodes/tag.js'].lineData[27]++;
    self.childNodes = [];
    _$jscoverage['/html-parser/nodes/tag.js'].lineData[28]++;
    self.firstChild = null;
    _$jscoverage['/html-parser/nodes/tag.js'].lineData[29]++;
    self.lastChild = null;
    _$jscoverage['/html-parser/nodes/tag.js'].lineData[30]++;
    self.attributes = visit193_30_1(attributes || []);
    _$jscoverage['/html-parser/nodes/tag.js'].lineData[31]++;
    self.nodeType = 1;
    _$jscoverage['/html-parser/nodes/tag.js'].lineData[33]++;
    if (visit194_33_1(typeof page == 'string')) {
      _$jscoverage['/html-parser/nodes/tag.js'].lineData[34]++;
      createTag.apply(null, [self].concat(S.makeArray(arguments)));
    } else {
      _$jscoverage['/html-parser/nodes/tag.js'].lineData[36]++;
      Tag.superclass.constructor.apply(self, arguments);
      _$jscoverage['/html-parser/nodes/tag.js'].lineData[38]++;
      attributes = self.attributes;
      _$jscoverage['/html-parser/nodes/tag.js'].lineData[41]++;
      if (visit195_41_1(attributes[0])) {
        _$jscoverage['/html-parser/nodes/tag.js'].lineData[42]++;
        self.nodeName = attributes[0].name.toLowerCase();
        _$jscoverage['/html-parser/nodes/tag.js'].lineData[44]++;
        self.tagName = self.nodeName.replace(/\//, "");
        _$jscoverage['/html-parser/nodes/tag.js'].lineData[45]++;
        self._updateSelfClosed();
        _$jscoverage['/html-parser/nodes/tag.js'].lineData[46]++;
        attributes.splice(0, 1);
      }
      _$jscoverage['/html-parser/nodes/tag.js'].lineData[49]++;
      var lastAttr = attributes[attributes.length - 1], lastSlash = !!(visit196_50_1(lastAttr && /\/$/.test(lastAttr.name)));
      _$jscoverage['/html-parser/nodes/tag.js'].lineData[52]++;
      if (visit197_52_1(lastSlash)) {
        _$jscoverage['/html-parser/nodes/tag.js'].lineData[53]++;
        attributes.length = attributes.length - 1;
      }
      _$jscoverage['/html-parser/nodes/tag.js'].lineData[57]++;
      self.isSelfClosed = visit198_57_1(self.isSelfClosed || lastSlash);
      _$jscoverage['/html-parser/nodes/tag.js'].lineData[61]++;
      self['closed'] = self.isSelfClosed;
    }
    _$jscoverage['/html-parser/nodes/tag.js'].lineData[63]++;
    self['closedStartPosition'] = -1;
    _$jscoverage['/html-parser/nodes/tag.js'].lineData[64]++;
    self['closedEndPosition'] = -1;
  }
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[67]++;
  function refreshChildNodes(self) {
    _$jscoverage['/html-parser/nodes/tag.js'].functionData[4]++;
    _$jscoverage['/html-parser/nodes/tag.js'].lineData[68]++;
    var c = self.childNodes;
    _$jscoverage['/html-parser/nodes/tag.js'].lineData[69]++;
    self.firstChild = c[0];
    _$jscoverage['/html-parser/nodes/tag.js'].lineData[70]++;
    self.lastChild = c[c.length - 1];
    _$jscoverage['/html-parser/nodes/tag.js'].lineData[71]++;
    if (visit199_71_1(c.length >= 1)) {
      _$jscoverage['/html-parser/nodes/tag.js'].lineData[72]++;
      c[0].nextSibling = c[0].nextSibling = null;
      _$jscoverage['/html-parser/nodes/tag.js'].lineData[73]++;
      c[0].parentNode = self;
    }
    _$jscoverage['/html-parser/nodes/tag.js'].lineData[75]++;
    if (visit200_75_1(c.length > 1)) {
      _$jscoverage['/html-parser/nodes/tag.js'].lineData[76]++;
      for (var i = 0; visit201_76_1(i < c.length - 1); i++) {
        _$jscoverage['/html-parser/nodes/tag.js'].lineData[77]++;
        c[i].nextSibling = c[i + 1];
        _$jscoverage['/html-parser/nodes/tag.js'].lineData[78]++;
        c[i + 1].previousSibling = c[i];
        _$jscoverage['/html-parser/nodes/tag.js'].lineData[79]++;
        c[i + 1].parentNode = self;
      }
      _$jscoverage['/html-parser/nodes/tag.js'].lineData[81]++;
      c[c.length - 1].nextSibling = null;
    }
  }
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[85]++;
  S.extend(Tag, Node, {
  _updateSelfClosed: function() {
  _$jscoverage['/html-parser/nodes/tag.js'].functionData[5]++;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[88]++;
  var self = this;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[90]++;
  self.isSelfClosed = !!(Dtd.$empty[self.nodeName]);
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[91]++;
  if (visit202_91_1(!self.isSelfClosed)) {
    _$jscoverage['/html-parser/nodes/tag.js'].lineData[92]++;
    self.isSelfClosed = /\/$/.test(self.nodeName);
  }
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[94]++;
  self['closed'] = self.isSelfClosed;
}, 
  clone: function() {
  _$jscoverage['/html-parser/nodes/tag.js'].functionData[6]++;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[98]++;
  var ret = new Tag(), attrs = [];
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[100]++;
  S.each(this.attributes, function(a) {
  _$jscoverage['/html-parser/nodes/tag.js'].functionData[7]++;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[101]++;
  attrs.push(a.clone());
});
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[103]++;
  S.mix(ret, {
  childNodes: [], 
  firstChild: null, 
  lastChild: null, 
  attributes: attrs, 
  nodeType: this.nodeType, 
  nodeName: this.nodeName, 
  tagName: this.tagName, 
  isSelfClosed: this.isSelfClosed, 
  closed: this.closed, 
  closedStartPosition: this.closedStartPosition, 
  closedEndPosition: this.closedEndPosition});
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[116]++;
  return ret;
}, 
  setTagName: function(v) {
  _$jscoverage['/html-parser/nodes/tag.js'].functionData[8]++;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[120]++;
  var self = this;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[121]++;
  self.nodeName = self.tagName = v;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[122]++;
  if (visit203_122_1(v)) {
    _$jscoverage['/html-parser/nodes/tag.js'].lineData[123]++;
    self._updateSelfClosed();
  }
}, 
  equals: function(tag) {
  _$jscoverage['/html-parser/nodes/tag.js'].functionData[9]++;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[128]++;
  if (visit204_128_1(!tag || visit205_128_2(this.nodeName != tag.nodeName))) {
    _$jscoverage['/html-parser/nodes/tag.js'].lineData[129]++;
    return 0;
  }
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[131]++;
  if (visit206_131_1(this.nodeType != tag.nodeType)) {
    _$jscoverage['/html-parser/nodes/tag.js'].lineData[132]++;
    return 0;
  }
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[134]++;
  if (visit207_134_1(this.attributes.length != tag.attributes.length)) {
    _$jscoverage['/html-parser/nodes/tag.js'].lineData[135]++;
    return 0;
  }
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[137]++;
  for (var i = 0; visit208_137_1(i < this.attributes.length); i++) {
    _$jscoverage['/html-parser/nodes/tag.js'].lineData[138]++;
    if (visit209_138_1(!this.attributes[i].equals(tag.attributes[i]))) {
      _$jscoverage['/html-parser/nodes/tag.js'].lineData[139]++;
      return 0;
    }
  }
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[142]++;
  return 1;
}, 
  isEndTag: function() {
  _$jscoverage['/html-parser/nodes/tag.js'].functionData[10]++;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[146]++;
  return /^\//.test(this.nodeName);
}, 
  appendChild: function(node) {
  _$jscoverage['/html-parser/nodes/tag.js'].functionData[11]++;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[150]++;
  this.childNodes.push(node);
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[151]++;
  refreshChildNodes(this);
}, 
  replace: function(ref) {
  _$jscoverage['/html-parser/nodes/tag.js'].functionData[12]++;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[155]++;
  var silbing = ref.parentNode.childNodes, index = S.indexOf(ref, silbing);
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[157]++;
  silbing[index] = this;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[158]++;
  refreshChildNodes(ref.parentNode);
}, 
  replaceChild: function(newC, refC) {
  _$jscoverage['/html-parser/nodes/tag.js'].functionData[13]++;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[162]++;
  var self = this, childNodes = self.childNodes;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[164]++;
  var index = S.indexOf(refC, childNodes);
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[165]++;
  childNodes[index] = newC;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[166]++;
  refreshChildNodes(self);
}, 
  prepend: function(node) {
  _$jscoverage['/html-parser/nodes/tag.js'].functionData[14]++;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[170]++;
  this.childNodes.unshift(node);
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[171]++;
  refreshChildNodes(this);
}, 
  insertBefore: function(ref) {
  _$jscoverage['/html-parser/nodes/tag.js'].functionData[15]++;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[175]++;
  var silbing = ref.parentNode.childNodes, index = S.indexOf(ref, silbing);
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[177]++;
  silbing.splice(index, 0, this);
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[178]++;
  refreshChildNodes(ref.parentNode);
}, 
  insertAfter: function(ref) {
  _$jscoverage['/html-parser/nodes/tag.js'].functionData[16]++;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[183]++;
  var silbing = ref.parentNode.childNodes, index = S.indexOf(ref, silbing);
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[185]++;
  if (visit210_185_1(index == silbing.length - 1)) {
    _$jscoverage['/html-parser/nodes/tag.js'].lineData[186]++;
    ref.parentNode.appendChild(this);
  } else {
    _$jscoverage['/html-parser/nodes/tag.js'].lineData[188]++;
    this.insertBefore(ref.parentNode.childNodes[[index + 1]]);
  }
}, 
  empty: function() {
  _$jscoverage['/html-parser/nodes/tag.js'].functionData[17]++;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[193]++;
  this.childNodes = [];
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[194]++;
  refreshChildNodes(this);
}, 
  removeChild: function(node) {
  _$jscoverage['/html-parser/nodes/tag.js'].functionData[18]++;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[198]++;
  var silbing = node.parentNode.childNodes, index = S.indexOf(node, silbing);
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[200]++;
  silbing.splice(index, 1);
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[201]++;
  refreshChildNodes(node.parentNode);
}, 
  getAttribute: function(name) {
  _$jscoverage['/html-parser/nodes/tag.js'].functionData[19]++;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[205]++;
  var attr = findAttributeByName(this.attributes, name);
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[206]++;
  return visit211_206_1(attr && attr.value);
}, 
  setAttribute: function(name, value) {
  _$jscoverage['/html-parser/nodes/tag.js'].functionData[20]++;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[210]++;
  var attr = findAttributeByName(this.attributes, name);
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[211]++;
  if (visit212_211_1(attr)) {
    _$jscoverage['/html-parser/nodes/tag.js'].lineData[212]++;
    attr.value = value;
  } else {
    _$jscoverage['/html-parser/nodes/tag.js'].lineData[214]++;
    this.attributes.push(new Attribute(name, '=', value, '"'));
  }
}, 
  removeAttribute: function(name) {
  _$jscoverage['/html-parser/nodes/tag.js'].functionData[21]++;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[219]++;
  var attr = findAttributeByName(this.attributes, name);
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[220]++;
  if (visit213_220_1(attr)) {
    _$jscoverage['/html-parser/nodes/tag.js'].lineData[221]++;
    var index = S.indexOf(attr, this.attributes);
    _$jscoverage['/html-parser/nodes/tag.js'].lineData[222]++;
    this.attributes.splice(index, 1);
  }
}, 
  filterChildren: function() {
  _$jscoverage['/html-parser/nodes/tag.js'].functionData[22]++;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[230]++;
  var self = this;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[231]++;
  if (visit214_231_1(!self.isChildrenFiltered)) {
    _$jscoverage['/html-parser/nodes/tag.js'].lineData[232]++;
    var writer = new (S.require('html-parser/writer/basic'))();
    _$jscoverage['/html-parser/nodes/tag.js'].lineData[233]++;
    self._writeChildrenHTML(writer);
    _$jscoverage['/html-parser/nodes/tag.js'].lineData[234]++;
    var parser = new (S.require('html-parser/parser'))(writer.getHtml()), children = parser.parse().childNodes;
    _$jscoverage['/html-parser/nodes/tag.js'].lineData[236]++;
    self.empty();
    _$jscoverage['/html-parser/nodes/tag.js'].lineData[237]++;
    S.each(children, function(c) {
  _$jscoverage['/html-parser/nodes/tag.js'].functionData[23]++;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[238]++;
  self.appendChild(c);
});
    _$jscoverage['/html-parser/nodes/tag.js'].lineData[240]++;
    self.isChildrenFiltered = 1;
  }
}, 
  writeHtml: function(writer, filter) {
  _$jscoverage['/html-parser/nodes/tag.js'].functionData[24]++;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[250]++;
  var el = this, tmp, attrName, tagName = el.tagName;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[256]++;
  if (visit215_256_1(tagName == "!doctype")) {
    _$jscoverage['/html-parser/nodes/tag.js'].lineData[257]++;
    writer.append(this.toHtml() + "\n");
    _$jscoverage['/html-parser/nodes/tag.js'].lineData[258]++;
    return;
  }
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[261]++;
  el.__filter = filter;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[262]++;
  el.isChildrenFiltered = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[265]++;
  if (visit216_265_1(filter)) {
    _$jscoverage['/html-parser/nodes/tag.js'].lineData[267]++;
    if (visit217_267_1(!(tagName = filter.onTagName(tagName)))) {
      _$jscoverage['/html-parser/nodes/tag.js'].lineData[268]++;
      return;
    }
    _$jscoverage['/html-parser/nodes/tag.js'].lineData[271]++;
    el.tagName = tagName;
    _$jscoverage['/html-parser/nodes/tag.js'].lineData[273]++;
    tmp = filter.onTag(el);
    _$jscoverage['/html-parser/nodes/tag.js'].lineData[275]++;
    if (visit218_275_1(tmp === false)) {
      _$jscoverage['/html-parser/nodes/tag.js'].lineData[276]++;
      return;
    }
    _$jscoverage['/html-parser/nodes/tag.js'].lineData[280]++;
    if (visit219_280_1(tmp)) {
      _$jscoverage['/html-parser/nodes/tag.js'].lineData[281]++;
      el = tmp;
    }
    _$jscoverage['/html-parser/nodes/tag.js'].lineData[285]++;
    if (visit220_285_1(el.nodeType !== 1)) {
      _$jscoverage['/html-parser/nodes/tag.js'].lineData[286]++;
      el.writeHtml(writer, filter);
      _$jscoverage['/html-parser/nodes/tag.js'].lineData[287]++;
      return;
    }
    _$jscoverage['/html-parser/nodes/tag.js'].lineData[291]++;
    if (visit221_291_1(!el.tagName)) {
      _$jscoverage['/html-parser/nodes/tag.js'].lineData[292]++;
      el._writeChildrenHTML(writer);
      _$jscoverage['/html-parser/nodes/tag.js'].lineData[293]++;
      return;
    }
  }
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[297]++;
  writer.openTag(el);
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[300]++;
  var attributes = el.attributes;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[301]++;
  for (var i = 0; visit222_301_1(i < attributes.length); i++) {
    _$jscoverage['/html-parser/nodes/tag.js'].lineData[302]++;
    var attr = attributes[i];
    _$jscoverage['/html-parser/nodes/tag.js'].lineData[303]++;
    attrName = attr.name;
    _$jscoverage['/html-parser/nodes/tag.js'].lineData[304]++;
    if (visit223_304_1(filter)) {
      _$jscoverage['/html-parser/nodes/tag.js'].lineData[306]++;
      if (visit224_306_1(!(attrName = filter.onAttributeName(attrName, el)))) {
        _$jscoverage['/html-parser/nodes/tag.js'].lineData[307]++;
        continue;
      }
      _$jscoverage['/html-parser/nodes/tag.js'].lineData[309]++;
      attr.name = attrName;
      _$jscoverage['/html-parser/nodes/tag.js'].lineData[311]++;
      if (visit225_311_1(filter.onAttribute(attr, el) === false)) {
        _$jscoverage['/html-parser/nodes/tag.js'].lineData[312]++;
        continue;
      }
    }
    _$jscoverage['/html-parser/nodes/tag.js'].lineData[315]++;
    writer.attribute(attr, el);
  }
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[319]++;
  writer.openTagClose(el);
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[321]++;
  if (visit226_321_1(!el.isSelfClosed)) {
    _$jscoverage['/html-parser/nodes/tag.js'].lineData[322]++;
    el._writeChildrenHTML(writer);
    _$jscoverage['/html-parser/nodes/tag.js'].lineData[324]++;
    writer.closeTag(el);
  }
}, 
  _writeChildrenHTML: function(writer) {
  _$jscoverage['/html-parser/nodes/tag.js'].functionData[25]++;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[334]++;
  var self = this, filter = self.isChildrenFiltered ? 0 : self.__filter;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[337]++;
  S.each(self.childNodes, function(child) {
  _$jscoverage['/html-parser/nodes/tag.js'].functionData[26]++;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[338]++;
  child.writeHtml(writer, filter);
});
}});
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[344]++;
  function findAttributeByName(attributes, name) {
    _$jscoverage['/html-parser/nodes/tag.js'].functionData[27]++;
    _$jscoverage['/html-parser/nodes/tag.js'].lineData[345]++;
    if (visit227_345_1(attributes && attributes.length)) {
      _$jscoverage['/html-parser/nodes/tag.js'].lineData[346]++;
      for (var i = 0; visit228_346_1(i < attributes.length); i++) {
        _$jscoverage['/html-parser/nodes/tag.js'].lineData[347]++;
        if (visit229_347_1(attributes[i].name == name)) {
          _$jscoverage['/html-parser/nodes/tag.js'].lineData[348]++;
          return attributes[i];
        }
      }
    }
    _$jscoverage['/html-parser/nodes/tag.js'].lineData[352]++;
    return null;
  }
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[355]++;
  return Tag;
}, {
  requires: ['./node', './attribute', '../dtd']});
