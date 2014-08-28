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
if (! _$jscoverage['/loader/data-structure.js']) {
  _$jscoverage['/loader/data-structure.js'] = {};
  _$jscoverage['/loader/data-structure.js'].lineData = [];
  _$jscoverage['/loader/data-structure.js'].lineData[6] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[7] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[12] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[13] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[23] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[24] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[27] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[31] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[40] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[48] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[56] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[60] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[62] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[73] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[74] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[75] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[77] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[85] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[93] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[101] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[109] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[117] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[125] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[129] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[136] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[137] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[141] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[146] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[151] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[155] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[157] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[158] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[159] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[162] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[163] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[164] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[165] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[167] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[170] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[171] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[172] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[176] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[177] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[178] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[179] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[181] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[182] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[186] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[198] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[199] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[208] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[213] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[222] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[223] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[224] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[226] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[227] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[228] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[230] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[231] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[232] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[233] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[239] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[243] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[244] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[246] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[247] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[248] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[249] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[251] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[253] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[254] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[258] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[266] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[268] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[269] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[270] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[272] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[274] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[276] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[284] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[291] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[293] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[294] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[296] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[297] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[298] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[300] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[303] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[305] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[306] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[307] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[308] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[311] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[313] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[321] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[323] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[324] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[325] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[327] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[335] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[336] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[344] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[352] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[353] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[363] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[364] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[372] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[373] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[381] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[384] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[385] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[386] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[387] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[390] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[398] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[400] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[401] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[410] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[415] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[416] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[417] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[420] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[422] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[423] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[424] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[429] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[431] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[432] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[436] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[438] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[439] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[442] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[445] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[450] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[451] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[455] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[456] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[457] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[460] = 0;
}
if (! _$jscoverage['/loader/data-structure.js'].functionData) {
  _$jscoverage['/loader/data-structure.js'].functionData = [];
  _$jscoverage['/loader/data-structure.js'].functionData[0] = 0;
  _$jscoverage['/loader/data-structure.js'].functionData[1] = 0;
  _$jscoverage['/loader/data-structure.js'].functionData[2] = 0;
  _$jscoverage['/loader/data-structure.js'].functionData[3] = 0;
  _$jscoverage['/loader/data-structure.js'].functionData[4] = 0;
  _$jscoverage['/loader/data-structure.js'].functionData[5] = 0;
  _$jscoverage['/loader/data-structure.js'].functionData[6] = 0;
  _$jscoverage['/loader/data-structure.js'].functionData[7] = 0;
  _$jscoverage['/loader/data-structure.js'].functionData[8] = 0;
  _$jscoverage['/loader/data-structure.js'].functionData[9] = 0;
  _$jscoverage['/loader/data-structure.js'].functionData[10] = 0;
  _$jscoverage['/loader/data-structure.js'].functionData[11] = 0;
  _$jscoverage['/loader/data-structure.js'].functionData[12] = 0;
  _$jscoverage['/loader/data-structure.js'].functionData[13] = 0;
  _$jscoverage['/loader/data-structure.js'].functionData[14] = 0;
  _$jscoverage['/loader/data-structure.js'].functionData[15] = 0;
  _$jscoverage['/loader/data-structure.js'].functionData[16] = 0;
  _$jscoverage['/loader/data-structure.js'].functionData[17] = 0;
  _$jscoverage['/loader/data-structure.js'].functionData[18] = 0;
  _$jscoverage['/loader/data-structure.js'].functionData[19] = 0;
  _$jscoverage['/loader/data-structure.js'].functionData[20] = 0;
  _$jscoverage['/loader/data-structure.js'].functionData[21] = 0;
  _$jscoverage['/loader/data-structure.js'].functionData[22] = 0;
  _$jscoverage['/loader/data-structure.js'].functionData[23] = 0;
  _$jscoverage['/loader/data-structure.js'].functionData[24] = 0;
  _$jscoverage['/loader/data-structure.js'].functionData[25] = 0;
  _$jscoverage['/loader/data-structure.js'].functionData[26] = 0;
  _$jscoverage['/loader/data-structure.js'].functionData[27] = 0;
  _$jscoverage['/loader/data-structure.js'].functionData[28] = 0;
  _$jscoverage['/loader/data-structure.js'].functionData[29] = 0;
  _$jscoverage['/loader/data-structure.js'].functionData[30] = 0;
  _$jscoverage['/loader/data-structure.js'].functionData[31] = 0;
  _$jscoverage['/loader/data-structure.js'].functionData[32] = 0;
  _$jscoverage['/loader/data-structure.js'].functionData[33] = 0;
  _$jscoverage['/loader/data-structure.js'].functionData[34] = 0;
  _$jscoverage['/loader/data-structure.js'].functionData[35] = 0;
  _$jscoverage['/loader/data-structure.js'].functionData[36] = 0;
  _$jscoverage['/loader/data-structure.js'].functionData[37] = 0;
  _$jscoverage['/loader/data-structure.js'].functionData[38] = 0;
  _$jscoverage['/loader/data-structure.js'].functionData[39] = 0;
}
if (! _$jscoverage['/loader/data-structure.js'].branchData) {
  _$jscoverage['/loader/data-structure.js'].branchData = {};
  _$jscoverage['/loader/data-structure.js'].branchData['63'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['63'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['74'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['74'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['164'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['164'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['171'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['171'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['176'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['176'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['223'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['223'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['227'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['227'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['246'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['246'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['251'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['251'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['268'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['268'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['269'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['269'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['291'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['291'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['293'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['293'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['300'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['300'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['323'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['323'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['336'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['336'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['353'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['353'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['364'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['364'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['373'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['373'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['384'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['384'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['384'][2] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['385'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['385'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['386'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['386'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['415'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['415'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['415'][2] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['416'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['416'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['417'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['417'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['419'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['419'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['438'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['438'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['456'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['456'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['456'][2] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['460'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['460'][1] = new BranchData();
}
_$jscoverage['/loader/data-structure.js'].branchData['460'][1].init(318, 32, 'packages[pName] || systemPackage');
function visit425_460_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['460'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['456'][2].init(57, 23, 'p.length > pName.length');
function visit424_456_2(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['456'][2].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['456'][1].init(18, 62, 'S.startsWith(modNameSlash, p + \'/\') && p.length > pName.length');
function visit423_456_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['456'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['438'][1].init(192, 24, 'm.getPackage().isDebug()');
function visit422_438_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['438'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['419'][1].init(114, 35, 'normalizedRequiresStatus === status');
function visit421_419_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['419'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['417'][1].init(346, 151, '(normalizedRequires = self.normalizedRequires) && (normalizedRequiresStatus === status)');
function visit420_417_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['417'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['416'][1].init(25, 14, 'requires || []');
function visit419_416_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['416'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['415'][2].init(255, 21, 'requires.length === 0');
function visit418_415_2(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['415'][2].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['415'][1].init(242, 34, '!requires || requires.length === 0');
function visit417_415_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['415'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['386'][1].init(255, 18, '!requiresWithAlias');
function visit416_386_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['386'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['385'][1].init(25, 14, 'requires || []');
function visit415_385_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['385'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['384'][2].init(165, 21, 'requires.length === 0');
function visit414_384_2(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['384'][2].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['384'][1].init(152, 34, '!requires || requires.length === 0');
function visit413_384_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['384'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['373'][1].init(51, 46, 'self.charset || self.getPackage().getCharset()');
function visit412_373_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['373'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['364'][1].init(51, 38, 'self.tag || self.getPackage().getTag()');
function visit411_364_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['364'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['353'][1].init(51, 93, 'self.packageInfo || (self.packageInfo = getPackage(self.runtime, self.name))');
function visit410_353_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['353'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['336'][1].init(51, 55, 'self.path || (self.path = defaultComponentJsName(self))');
function visit409_336_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['336'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['323'][1].init(78, 14, '!self.fullpath');
function visit408_323_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['323'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['300'][1].init(217, 173, 'packageInfo.isIgnorePackageNameInUri() && (packageName = packageInfo.name)');
function visit407_300_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['300'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['293'][1].init(68, 13, 'self.fullpath');
function visit406_293_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['293'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['291'][1].init(214, 17, '!self.fullPathUri');
function visit405_291_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['291'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['269'][1].init(22, 48, 'Path.extname(self.name).toLowerCase() === \'.css\'');
function visit404_269_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['269'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['268'][1].init(80, 2, '!v');
function visit403_268_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['268'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['251'][1].init(28, 12, 'e.stack || e');
function visit402_251_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['251'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['246'][1].init(124, 7, 'i < len');
function visit401_246_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['246'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['227'][1].init(74, 15, 'i < mods.length');
function visit400_227_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['227'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['223'][1].init(48, 30, 'typeof moduleName === \'string\'');
function visit399_223_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['223'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['176'][1].init(131, 16, 'fn && fn.success');
function visit398_176_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['176'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['171'][1].init(14, 24, 'typeof fn === \'function\'');
function visit397_171_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['171'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['164'][1].init(49, 14, 'i < arr.length');
function visit396_164_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['164'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['74'][1].init(48, 16, '!self.packageUri');
function visit395_74_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['74'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['63'][1].init(-1, 47, 'packageName && !self.isIgnorePackageNameInUri()');
function visit394_63_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['63'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].lineData[6]++;
(function(S) {
  _$jscoverage['/loader/data-structure.js'].functionData[0]++;
  _$jscoverage['/loader/data-structure.js'].lineData[7]++;
  var Loader = S.Loader, Path = S.Path, IGNORE_PACKAGE_NAME_IN_URI = 'ignorePackageNameInUri', Utils = Loader.Utils;
  _$jscoverage['/loader/data-structure.js'].lineData[12]++;
  function forwardSystemPackage(self, property) {
    _$jscoverage['/loader/data-structure.js'].functionData[1]++;
    _$jscoverage['/loader/data-structure.js'].lineData[13]++;
    return property in self ? self[property] : self.runtime.Config[property];
  }
  _$jscoverage['/loader/data-structure.js'].lineData[23]++;
  function Package(cfg) {
    _$jscoverage['/loader/data-structure.js'].functionData[2]++;
    _$jscoverage['/loader/data-structure.js'].lineData[24]++;
    S.mix(this, cfg);
  }
  _$jscoverage['/loader/data-structure.js'].lineData[27]++;
  Package.prototype = {
  constructor: Package, 
  reset: function(cfg) {
  _$jscoverage['/loader/data-structure.js'].functionData[3]++;
  _$jscoverage['/loader/data-structure.js'].lineData[31]++;
  S.mix(this, cfg);
}, 
  getTag: function() {
  _$jscoverage['/loader/data-structure.js'].functionData[4]++;
  _$jscoverage['/loader/data-structure.js'].lineData[40]++;
  return forwardSystemPackage(this, 'tag');
}, 
  getName: function() {
  _$jscoverage['/loader/data-structure.js'].functionData[5]++;
  _$jscoverage['/loader/data-structure.js'].lineData[48]++;
  return this.name;
}, 
  'getBase': function() {
  _$jscoverage['/loader/data-structure.js'].functionData[6]++;
  _$jscoverage['/loader/data-structure.js'].lineData[56]++;
  return forwardSystemPackage(this, 'base');
}, 
  getPrefixUriForCombo: function() {
  _$jscoverage['/loader/data-structure.js'].functionData[7]++;
  _$jscoverage['/loader/data-structure.js'].lineData[60]++;
  var self = this, packageName = self.name;
  _$jscoverage['/loader/data-structure.js'].lineData[62]++;
  return self.getBase() + (visit394_63_1(packageName && !self.isIgnorePackageNameInUri()) ? (packageName + '/') : '');
}, 
  getPackageUri: function() {
  _$jscoverage['/loader/data-structure.js'].functionData[8]++;
  _$jscoverage['/loader/data-structure.js'].lineData[73]++;
  var self = this;
  _$jscoverage['/loader/data-structure.js'].lineData[74]++;
  if (visit395_74_1(!self.packageUri)) {
    _$jscoverage['/loader/data-structure.js'].lineData[75]++;
    self.packageUri = new S.Uri(this.getPrefixUriForCombo());
  }
  _$jscoverage['/loader/data-structure.js'].lineData[77]++;
  return self.packageUri;
}, 
  getBaseUri: function() {
  _$jscoverage['/loader/data-structure.js'].functionData[9]++;
  _$jscoverage['/loader/data-structure.js'].lineData[85]++;
  return forwardSystemPackage(this, 'baseUri');
}, 
  isDebug: function() {
  _$jscoverage['/loader/data-structure.js'].functionData[10]++;
  _$jscoverage['/loader/data-structure.js'].lineData[93]++;
  return forwardSystemPackage(this, 'debug');
}, 
  isIgnorePackageNameInUri: function() {
  _$jscoverage['/loader/data-structure.js'].functionData[11]++;
  _$jscoverage['/loader/data-structure.js'].lineData[101]++;
  return forwardSystemPackage(this, IGNORE_PACKAGE_NAME_IN_URI);
}, 
  getCharset: function() {
  _$jscoverage['/loader/data-structure.js'].functionData[12]++;
  _$jscoverage['/loader/data-structure.js'].lineData[109]++;
  return forwardSystemPackage(this, 'charset');
}, 
  isCombine: function() {
  _$jscoverage['/loader/data-structure.js'].functionData[13]++;
  _$jscoverage['/loader/data-structure.js'].lineData[117]++;
  return forwardSystemPackage(this, 'combine');
}, 
  getGroup: function() {
  _$jscoverage['/loader/data-structure.js'].functionData[14]++;
  _$jscoverage['/loader/data-structure.js'].lineData[125]++;
  return forwardSystemPackage(this, 'group');
}};
  _$jscoverage['/loader/data-structure.js'].lineData[129]++;
  Loader.Package = Package;
  _$jscoverage['/loader/data-structure.js'].lineData[136]++;
  function Module(cfg) {
    _$jscoverage['/loader/data-structure.js'].functionData[15]++;
    _$jscoverage['/loader/data-structure.js'].lineData[137]++;
    var module = this;
    _$jscoverage['/loader/data-structure.js'].lineData[141]++;
    module.exports = {};
    _$jscoverage['/loader/data-structure.js'].lineData[146]++;
    module.status = Loader.Status.INIT;
    _$jscoverage['/loader/data-structure.js'].lineData[151]++;
    module.name = undefined;
    _$jscoverage['/loader/data-structure.js'].lineData[155]++;
    module.factory = undefined;
    _$jscoverage['/loader/data-structure.js'].lineData[157]++;
    module.cjs = 1;
    _$jscoverage['/loader/data-structure.js'].lineData[158]++;
    S.mix(module, cfg);
    _$jscoverage['/loader/data-structure.js'].lineData[159]++;
    module.waitedCallbacks = [];
  }
  _$jscoverage['/loader/data-structure.js'].lineData[162]++;
  function makeArray(arr) {
    _$jscoverage['/loader/data-structure.js'].functionData[16]++;
    _$jscoverage['/loader/data-structure.js'].lineData[163]++;
    var ret = [];
    _$jscoverage['/loader/data-structure.js'].lineData[164]++;
    for (var i = 0; visit396_164_1(i < arr.length); i++) {
      _$jscoverage['/loader/data-structure.js'].lineData[165]++;
      ret[i] = arr[i];
    }
    _$jscoverage['/loader/data-structure.js'].lineData[167]++;
    return ret;
  }
  _$jscoverage['/loader/data-structure.js'].lineData[170]++;
  function wrapUse(fn) {
    _$jscoverage['/loader/data-structure.js'].functionData[17]++;
    _$jscoverage['/loader/data-structure.js'].lineData[171]++;
    if (visit397_171_1(typeof fn === 'function')) {
      _$jscoverage['/loader/data-structure.js'].lineData[172]++;
      fn = {
  success: fn};
    }
    _$jscoverage['/loader/data-structure.js'].lineData[176]++;
    if (visit398_176_1(fn && fn.success)) {
      _$jscoverage['/loader/data-structure.js'].lineData[177]++;
      var original = fn.success;
      _$jscoverage['/loader/data-structure.js'].lineData[178]++;
      fn.success = function() {
  _$jscoverage['/loader/data-structure.js'].functionData[18]++;
  _$jscoverage['/loader/data-structure.js'].lineData[179]++;
  original.apply(this, makeArray(arguments).slice(1));
};
      _$jscoverage['/loader/data-structure.js'].lineData[181]++;
      fn.sync = 1;
      _$jscoverage['/loader/data-structure.js'].lineData[182]++;
      return fn;
    }
  }
  _$jscoverage['/loader/data-structure.js'].lineData[186]++;
  Module.prototype = {
  kissy: 1, 
  constructor: Module, 
  'use': function(relativeName, fn) {
  _$jscoverage['/loader/data-structure.js'].functionData[19]++;
  _$jscoverage['/loader/data-structure.js'].lineData[198]++;
  relativeName = Utils.getModNamesAsArray(relativeName);
  _$jscoverage['/loader/data-structure.js'].lineData[199]++;
  return KISSY.use(Utils.normalDepModuleName(this.name, relativeName), fn);
}, 
  'resolve': function(relativePath) {
  _$jscoverage['/loader/data-structure.js'].functionData[20]++;
  _$jscoverage['/loader/data-structure.js'].lineData[208]++;
  return this.getFullPathUri().resolve(relativePath);
}, 
  'resolveByName': function(relativeName) {
  _$jscoverage['/loader/data-structure.js'].functionData[21]++;
  _$jscoverage['/loader/data-structure.js'].lineData[213]++;
  return Utils.normalDepModuleName(this.name, relativeName);
}, 
  require: function(moduleName) {
  _$jscoverage['/loader/data-structure.js'].functionData[22]++;
  _$jscoverage['/loader/data-structure.js'].lineData[222]++;
  var self = this;
  _$jscoverage['/loader/data-structure.js'].lineData[223]++;
  if (visit399_223_1(typeof moduleName === 'string')) {
    _$jscoverage['/loader/data-structure.js'].lineData[224]++;
    return S.require(moduleName, this.name);
  } else {
    _$jscoverage['/loader/data-structure.js'].lineData[226]++;
    var mods = moduleName;
    _$jscoverage['/loader/data-structure.js'].lineData[227]++;
    for (var i = 0; visit400_227_1(i < mods.length); i++) {
      _$jscoverage['/loader/data-structure.js'].lineData[228]++;
      mods[i] = self.resolveByName(mods[i]);
    }
    _$jscoverage['/loader/data-structure.js'].lineData[230]++;
    var args = makeArray(arguments);
    _$jscoverage['/loader/data-structure.js'].lineData[231]++;
    args[0] = mods;
    _$jscoverage['/loader/data-structure.js'].lineData[232]++;
    args[1] = wrapUse(args[1]);
    _$jscoverage['/loader/data-structure.js'].lineData[233]++;
    S.use.apply(S, args);
  }
}, 
  wait: function(callback) {
  _$jscoverage['/loader/data-structure.js'].functionData[23]++;
  _$jscoverage['/loader/data-structure.js'].lineData[239]++;
  this.waitedCallbacks.push(callback);
}, 
  notifyAll: function() {
  _$jscoverage['/loader/data-structure.js'].functionData[24]++;
  _$jscoverage['/loader/data-structure.js'].lineData[243]++;
  var callback;
  _$jscoverage['/loader/data-structure.js'].lineData[244]++;
  var len = this.waitedCallbacks.length, i = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[246]++;
  for (; visit401_246_1(i < len); i++) {
    _$jscoverage['/loader/data-structure.js'].lineData[247]++;
    callback = this.waitedCallbacks[i];
    _$jscoverage['/loader/data-structure.js'].lineData[248]++;
    try {
      _$jscoverage['/loader/data-structure.js'].lineData[249]++;
      callback(this);
    }    catch (e) {
  _$jscoverage['/loader/data-structure.js'].lineData[251]++;
  S.log(visit402_251_1(e.stack || e), 'error');
  _$jscoverage['/loader/data-structure.js'].lineData[253]++;
  setTimeout(function() {
  _$jscoverage['/loader/data-structure.js'].functionData[25]++;
  _$jscoverage['/loader/data-structure.js'].lineData[254]++;
  throw e;
}, 0);
}
  }
  _$jscoverage['/loader/data-structure.js'].lineData[258]++;
  this.waitedCallbacks = [];
}, 
  getType: function() {
  _$jscoverage['/loader/data-structure.js'].functionData[26]++;
  _$jscoverage['/loader/data-structure.js'].lineData[266]++;
  var self = this, v = self.type;
  _$jscoverage['/loader/data-structure.js'].lineData[268]++;
  if (visit403_268_1(!v)) {
    _$jscoverage['/loader/data-structure.js'].lineData[269]++;
    if (visit404_269_1(Path.extname(self.name).toLowerCase() === '.css')) {
      _$jscoverage['/loader/data-structure.js'].lineData[270]++;
      v = 'css';
    } else {
      _$jscoverage['/loader/data-structure.js'].lineData[272]++;
      v = 'js';
    }
    _$jscoverage['/loader/data-structure.js'].lineData[274]++;
    self.type = v;
  }
  _$jscoverage['/loader/data-structure.js'].lineData[276]++;
  return v;
}, 
  getFullPathUri: function() {
  _$jscoverage['/loader/data-structure.js'].functionData[27]++;
  _$jscoverage['/loader/data-structure.js'].lineData[284]++;
  var self = this, t, fullPathUri, packageBaseUri, packageInfo, packageName, path;
  _$jscoverage['/loader/data-structure.js'].lineData[291]++;
  if (visit405_291_1(!self.fullPathUri)) {
    _$jscoverage['/loader/data-structure.js'].lineData[293]++;
    if (visit406_293_1(self.fullpath)) {
      _$jscoverage['/loader/data-structure.js'].lineData[294]++;
      fullPathUri = new S.Uri(self.fullpath);
    } else {
      _$jscoverage['/loader/data-structure.js'].lineData[296]++;
      packageInfo = self.getPackage();
      _$jscoverage['/loader/data-structure.js'].lineData[297]++;
      packageBaseUri = packageInfo.getBaseUri();
      _$jscoverage['/loader/data-structure.js'].lineData[298]++;
      path = self.getPath();
      _$jscoverage['/loader/data-structure.js'].lineData[300]++;
      if (visit407_300_1(packageInfo.isIgnorePackageNameInUri() && (packageName = packageInfo.name))) {
        _$jscoverage['/loader/data-structure.js'].lineData[303]++;
        path = Path.relative(packageName, path);
      }
      _$jscoverage['/loader/data-structure.js'].lineData[305]++;
      fullPathUri = packageBaseUri.resolve(path);
      _$jscoverage['/loader/data-structure.js'].lineData[306]++;
      if ((t = self.getTag())) {
        _$jscoverage['/loader/data-structure.js'].lineData[307]++;
        t += '.' + self.getType();
        _$jscoverage['/loader/data-structure.js'].lineData[308]++;
        fullPathUri.query.set('t', t);
      }
    }
    _$jscoverage['/loader/data-structure.js'].lineData[311]++;
    self.fullPathUri = fullPathUri;
  }
  _$jscoverage['/loader/data-structure.js'].lineData[313]++;
  return self.fullPathUri;
}, 
  getFullPath: function() {
  _$jscoverage['/loader/data-structure.js'].functionData[28]++;
  _$jscoverage['/loader/data-structure.js'].lineData[321]++;
  var self = this, fullPathUri;
  _$jscoverage['/loader/data-structure.js'].lineData[323]++;
  if (visit408_323_1(!self.fullpath)) {
    _$jscoverage['/loader/data-structure.js'].lineData[324]++;
    fullPathUri = self.getFullPathUri();
    _$jscoverage['/loader/data-structure.js'].lineData[325]++;
    self.fullpath = fullPathUri.toString();
  }
  _$jscoverage['/loader/data-structure.js'].lineData[327]++;
  return self.fullpath;
}, 
  getPath: function() {
  _$jscoverage['/loader/data-structure.js'].functionData[29]++;
  _$jscoverage['/loader/data-structure.js'].lineData[335]++;
  var self = this;
  _$jscoverage['/loader/data-structure.js'].lineData[336]++;
  return visit409_336_1(self.path || (self.path = defaultComponentJsName(self)));
}, 
  getName: function() {
  _$jscoverage['/loader/data-structure.js'].functionData[30]++;
  _$jscoverage['/loader/data-structure.js'].lineData[344]++;
  return this.name;
}, 
  getPackage: function() {
  _$jscoverage['/loader/data-structure.js'].functionData[31]++;
  _$jscoverage['/loader/data-structure.js'].lineData[352]++;
  var self = this;
  _$jscoverage['/loader/data-structure.js'].lineData[353]++;
  return visit410_353_1(self.packageInfo || (self.packageInfo = getPackage(self.runtime, self.name)));
}, 
  getTag: function() {
  _$jscoverage['/loader/data-structure.js'].functionData[32]++;
  _$jscoverage['/loader/data-structure.js'].lineData[363]++;
  var self = this;
  _$jscoverage['/loader/data-structure.js'].lineData[364]++;
  return visit411_364_1(self.tag || self.getPackage().getTag());
}, 
  getCharset: function() {
  _$jscoverage['/loader/data-structure.js'].functionData[33]++;
  _$jscoverage['/loader/data-structure.js'].lineData[372]++;
  var self = this;
  _$jscoverage['/loader/data-structure.js'].lineData[373]++;
  return visit412_373_1(self.charset || self.getPackage().getCharset());
}, 
  getRequiresWithAlias: function() {
  _$jscoverage['/loader/data-structure.js'].functionData[34]++;
  _$jscoverage['/loader/data-structure.js'].lineData[381]++;
  var self = this, requiresWithAlias = self.requiresWithAlias, requires = self.requires;
  _$jscoverage['/loader/data-structure.js'].lineData[384]++;
  if (visit413_384_1(!requires || visit414_384_2(requires.length === 0))) {
    _$jscoverage['/loader/data-structure.js'].lineData[385]++;
    return visit415_385_1(requires || []);
  } else {
    _$jscoverage['/loader/data-structure.js'].lineData[386]++;
    if (visit416_386_1(!requiresWithAlias)) {
      _$jscoverage['/loader/data-structure.js'].lineData[387]++;
      self.requiresWithAlias = requiresWithAlias = Utils.normalizeModNamesWithAlias(self.runtime, requires, self.name);
    }
  }
  _$jscoverage['/loader/data-structure.js'].lineData[390]++;
  return requiresWithAlias;
}, 
  getRequiredMods: function() {
  _$jscoverage['/loader/data-structure.js'].functionData[35]++;
  _$jscoverage['/loader/data-structure.js'].lineData[398]++;
  var self = this, runtime = self.runtime;
  _$jscoverage['/loader/data-structure.js'].lineData[400]++;
  return S.map(self.getNormalizedRequires(), function(r) {
  _$jscoverage['/loader/data-structure.js'].functionData[36]++;
  _$jscoverage['/loader/data-structure.js'].lineData[401]++;
  return Utils.createModuleInfo(runtime, r);
});
}, 
  getNormalizedRequires: function() {
  _$jscoverage['/loader/data-structure.js'].functionData[37]++;
  _$jscoverage['/loader/data-structure.js'].lineData[410]++;
  var self = this, normalizedRequires, normalizedRequiresStatus = self.normalizedRequiresStatus, status = self.status, requires = self.requires;
  _$jscoverage['/loader/data-structure.js'].lineData[415]++;
  if (visit417_415_1(!requires || visit418_415_2(requires.length === 0))) {
    _$jscoverage['/loader/data-structure.js'].lineData[416]++;
    return visit419_416_1(requires || []);
  } else {
    _$jscoverage['/loader/data-structure.js'].lineData[417]++;
    if (visit420_417_1((normalizedRequires = self.normalizedRequires) && (visit421_419_1(normalizedRequiresStatus === status)))) {
      _$jscoverage['/loader/data-structure.js'].lineData[420]++;
      return normalizedRequires;
    } else {
      _$jscoverage['/loader/data-structure.js'].lineData[422]++;
      self.normalizedRequiresStatus = status;
      _$jscoverage['/loader/data-structure.js'].lineData[423]++;
      self.normalizedRequires = Utils.normalizeModNames(self.runtime, requires, self.name);
      _$jscoverage['/loader/data-structure.js'].lineData[424]++;
      return self.normalizedRequires;
    }
  }
}};
  _$jscoverage['/loader/data-structure.js'].lineData[429]++;
  Loader.Module = Module;
  _$jscoverage['/loader/data-structure.js'].lineData[431]++;
  function defaultComponentJsName(m) {
    _$jscoverage['/loader/data-structure.js'].functionData[38]++;
    _$jscoverage['/loader/data-structure.js'].lineData[432]++;
    var name = m.name, extname = '.' + m.getType(), min = '-min';
    _$jscoverage['/loader/data-structure.js'].lineData[436]++;
    name = Path.join(Path.dirname(name), Path.basename(name, extname));
    _$jscoverage['/loader/data-structure.js'].lineData[438]++;
    if (visit422_438_1(m.getPackage().isDebug())) {
      _$jscoverage['/loader/data-structure.js'].lineData[439]++;
      min = '';
    }
    _$jscoverage['/loader/data-structure.js'].lineData[442]++;
    return name + min + extname;
  }
  _$jscoverage['/loader/data-structure.js'].lineData[445]++;
  var systemPackage = new Package({
  name: '', 
  runtime: S});
  _$jscoverage['/loader/data-structure.js'].lineData[450]++;
  function getPackage(self, modName) {
    _$jscoverage['/loader/data-structure.js'].functionData[39]++;
    _$jscoverage['/loader/data-structure.js'].lineData[451]++;
    var packages = self.config('packages'), modNameSlash = modName + '/', pName = '', p;
    _$jscoverage['/loader/data-structure.js'].lineData[455]++;
    for (p in packages) {
      _$jscoverage['/loader/data-structure.js'].lineData[456]++;
      if (visit423_456_1(S.startsWith(modNameSlash, p + '/') && visit424_456_2(p.length > pName.length))) {
        _$jscoverage['/loader/data-structure.js'].lineData[457]++;
        pName = p;
      }
    }
    _$jscoverage['/loader/data-structure.js'].lineData[460]++;
    return visit425_460_1(packages[pName] || systemPackage);
  }
})(KISSY);
