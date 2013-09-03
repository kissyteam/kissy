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
if (! _$jscoverage['/base/selector.js']) {
  _$jscoverage['/base/selector.js'] = {};
  _$jscoverage['/base/selector.js'].lineData = [];
  _$jscoverage['/base/selector.js'].lineData[6] = 0;
  _$jscoverage['/base/selector.js'].lineData[7] = 0;
  _$jscoverage['/base/selector.js'].lineData[27] = 0;
  _$jscoverage['/base/selector.js'].lineData[28] = 0;
  _$jscoverage['/base/selector.js'].lineData[31] = 0;
  _$jscoverage['/base/selector.js'].lineData[32] = 0;
  _$jscoverage['/base/selector.js'].lineData[33] = 0;
  _$jscoverage['/base/selector.js'].lineData[38] = 0;
  _$jscoverage['/base/selector.js'].lineData[39] = 0;
  _$jscoverage['/base/selector.js'].lineData[40] = 0;
  _$jscoverage['/base/selector.js'].lineData[41] = 0;
  _$jscoverage['/base/selector.js'].lineData[42] = 0;
  _$jscoverage['/base/selector.js'].lineData[43] = 0;
  _$jscoverage['/base/selector.js'].lineData[45] = 0;
  _$jscoverage['/base/selector.js'].lineData[49] = 0;
  _$jscoverage['/base/selector.js'].lineData[50] = 0;
  _$jscoverage['/base/selector.js'].lineData[51] = 0;
  _$jscoverage['/base/selector.js'].lineData[52] = 0;
  _$jscoverage['/base/selector.js'].lineData[56] = 0;
  _$jscoverage['/base/selector.js'].lineData[57] = 0;
  _$jscoverage['/base/selector.js'].lineData[58] = 0;
  _$jscoverage['/base/selector.js'].lineData[62] = 0;
  _$jscoverage['/base/selector.js'].lineData[63] = 0;
  _$jscoverage['/base/selector.js'].lineData[64] = 0;
  _$jscoverage['/base/selector.js'].lineData[69] = 0;
  _$jscoverage['/base/selector.js'].lineData[70] = 0;
  _$jscoverage['/base/selector.js'].lineData[71] = 0;
  _$jscoverage['/base/selector.js'].lineData[74] = 0;
  _$jscoverage['/base/selector.js'].lineData[75] = 0;
  _$jscoverage['/base/selector.js'].lineData[84] = 0;
  _$jscoverage['/base/selector.js'].lineData[85] = 0;
  _$jscoverage['/base/selector.js'].lineData[86] = 0;
  _$jscoverage['/base/selector.js'].lineData[87] = 0;
  _$jscoverage['/base/selector.js'].lineData[89] = 0;
  _$jscoverage['/base/selector.js'].lineData[91] = 0;
  _$jscoverage['/base/selector.js'].lineData[92] = 0;
  _$jscoverage['/base/selector.js'].lineData[95] = 0;
  _$jscoverage['/base/selector.js'].lineData[96] = 0;
  _$jscoverage['/base/selector.js'].lineData[99] = 0;
  _$jscoverage['/base/selector.js'].lineData[100] = 0;
  _$jscoverage['/base/selector.js'].lineData[101] = 0;
  _$jscoverage['/base/selector.js'].lineData[104] = 0;
  _$jscoverage['/base/selector.js'].lineData[105] = 0;
  _$jscoverage['/base/selector.js'].lineData[106] = 0;
  _$jscoverage['/base/selector.js'].lineData[109] = 0;
  _$jscoverage['/base/selector.js'].lineData[110] = 0;
  _$jscoverage['/base/selector.js'].lineData[113] = 0;
  _$jscoverage['/base/selector.js'].lineData[114] = 0;
  _$jscoverage['/base/selector.js'].lineData[120] = 0;
  _$jscoverage['/base/selector.js'].lineData[121] = 0;
  _$jscoverage['/base/selector.js'].lineData[124] = 0;
  _$jscoverage['/base/selector.js'].lineData[125] = 0;
  _$jscoverage['/base/selector.js'].lineData[129] = 0;
  _$jscoverage['/base/selector.js'].lineData[132] = 0;
  _$jscoverage['/base/selector.js'].lineData[133] = 0;
  _$jscoverage['/base/selector.js'].lineData[136] = 0;
  _$jscoverage['/base/selector.js'].lineData[137] = 0;
  _$jscoverage['/base/selector.js'].lineData[138] = 0;
  _$jscoverage['/base/selector.js'].lineData[141] = 0;
  _$jscoverage['/base/selector.js'].lineData[145] = 0;
  _$jscoverage['/base/selector.js'].lineData[146] = 0;
  _$jscoverage['/base/selector.js'].lineData[147] = 0;
  _$jscoverage['/base/selector.js'].lineData[148] = 0;
  _$jscoverage['/base/selector.js'].lineData[151] = 0;
  _$jscoverage['/base/selector.js'].lineData[152] = 0;
  _$jscoverage['/base/selector.js'].lineData[160] = 0;
  _$jscoverage['/base/selector.js'].lineData[161] = 0;
  _$jscoverage['/base/selector.js'].lineData[164] = 0;
  _$jscoverage['/base/selector.js'].lineData[165] = 0;
  _$jscoverage['/base/selector.js'].lineData[170] = 0;
  _$jscoverage['/base/selector.js'].lineData[171] = 0;
  _$jscoverage['/base/selector.js'].lineData[178] = 0;
  _$jscoverage['/base/selector.js'].lineData[179] = 0;
  _$jscoverage['/base/selector.js'].lineData[181] = 0;
  _$jscoverage['/base/selector.js'].lineData[184] = 0;
  _$jscoverage['/base/selector.js'].lineData[185] = 0;
  _$jscoverage['/base/selector.js'].lineData[188] = 0;
  _$jscoverage['/base/selector.js'].lineData[189] = 0;
  _$jscoverage['/base/selector.js'].lineData[190] = 0;
  _$jscoverage['/base/selector.js'].lineData[191] = 0;
  _$jscoverage['/base/selector.js'].lineData[192] = 0;
  _$jscoverage['/base/selector.js'].lineData[193] = 0;
  _$jscoverage['/base/selector.js'].lineData[201] = 0;
  _$jscoverage['/base/selector.js'].lineData[203] = 0;
  _$jscoverage['/base/selector.js'].lineData[206] = 0;
  _$jscoverage['/base/selector.js'].lineData[208] = 0;
  _$jscoverage['/base/selector.js'].lineData[209] = 0;
  _$jscoverage['/base/selector.js'].lineData[214] = 0;
  _$jscoverage['/base/selector.js'].lineData[215] = 0;
  _$jscoverage['/base/selector.js'].lineData[216] = 0;
  _$jscoverage['/base/selector.js'].lineData[217] = 0;
  _$jscoverage['/base/selector.js'].lineData[219] = 0;
  _$jscoverage['/base/selector.js'].lineData[222] = 0;
  _$jscoverage['/base/selector.js'].lineData[223] = 0;
  _$jscoverage['/base/selector.js'].lineData[226] = 0;
  _$jscoverage['/base/selector.js'].lineData[234] = 0;
  _$jscoverage['/base/selector.js'].lineData[235] = 0;
  _$jscoverage['/base/selector.js'].lineData[237] = 0;
  _$jscoverage['/base/selector.js'].lineData[238] = 0;
  _$jscoverage['/base/selector.js'].lineData[243] = 0;
  _$jscoverage['/base/selector.js'].lineData[247] = 0;
  _$jscoverage['/base/selector.js'].lineData[257] = 0;
  _$jscoverage['/base/selector.js'].lineData[261] = 0;
  _$jscoverage['/base/selector.js'].lineData[262] = 0;
  _$jscoverage['/base/selector.js'].lineData[263] = 0;
  _$jscoverage['/base/selector.js'].lineData[264] = 0;
  _$jscoverage['/base/selector.js'].lineData[267] = 0;
  _$jscoverage['/base/selector.js'].lineData[271] = 0;
  _$jscoverage['/base/selector.js'].lineData[296] = 0;
  _$jscoverage['/base/selector.js'].lineData[308] = 0;
  _$jscoverage['/base/selector.js'].lineData[315] = 0;
  _$jscoverage['/base/selector.js'].lineData[316] = 0;
  _$jscoverage['/base/selector.js'].lineData[317] = 0;
  _$jscoverage['/base/selector.js'].lineData[320] = 0;
  _$jscoverage['/base/selector.js'].lineData[321] = 0;
  _$jscoverage['/base/selector.js'].lineData[322] = 0;
  _$jscoverage['/base/selector.js'].lineData[323] = 0;
  _$jscoverage['/base/selector.js'].lineData[326] = 0;
  _$jscoverage['/base/selector.js'].lineData[330] = 0;
  _$jscoverage['/base/selector.js'].lineData[332] = 0;
  _$jscoverage['/base/selector.js'].lineData[333] = 0;
  _$jscoverage['/base/selector.js'].lineData[335] = 0;
  _$jscoverage['/base/selector.js'].lineData[336] = 0;
  _$jscoverage['/base/selector.js'].lineData[337] = 0;
  _$jscoverage['/base/selector.js'].lineData[338] = 0;
  _$jscoverage['/base/selector.js'].lineData[339] = 0;
  _$jscoverage['/base/selector.js'].lineData[340] = 0;
  _$jscoverage['/base/selector.js'].lineData[342] = 0;
  _$jscoverage['/base/selector.js'].lineData[347] = 0;
  _$jscoverage['/base/selector.js'].lineData[360] = 0;
  _$jscoverage['/base/selector.js'].lineData[367] = 0;
  _$jscoverage['/base/selector.js'].lineData[370] = 0;
  _$jscoverage['/base/selector.js'].lineData[371] = 0;
  _$jscoverage['/base/selector.js'].lineData[372] = 0;
  _$jscoverage['/base/selector.js'].lineData[373] = 0;
  _$jscoverage['/base/selector.js'].lineData[374] = 0;
  _$jscoverage['/base/selector.js'].lineData[375] = 0;
  _$jscoverage['/base/selector.js'].lineData[379] = 0;
  _$jscoverage['/base/selector.js'].lineData[380] = 0;
  _$jscoverage['/base/selector.js'].lineData[384] = 0;
  _$jscoverage['/base/selector.js'].lineData[385] = 0;
  _$jscoverage['/base/selector.js'].lineData[388] = 0;
  _$jscoverage['/base/selector.js'].lineData[390] = 0;
  _$jscoverage['/base/selector.js'].lineData[391] = 0;
  _$jscoverage['/base/selector.js'].lineData[392] = 0;
  _$jscoverage['/base/selector.js'].lineData[397] = 0;
  _$jscoverage['/base/selector.js'].lineData[398] = 0;
  _$jscoverage['/base/selector.js'].lineData[400] = 0;
  _$jscoverage['/base/selector.js'].lineData[403] = 0;
  _$jscoverage['/base/selector.js'].lineData[415] = 0;
  _$jscoverage['/base/selector.js'].lineData[416] = 0;
  _$jscoverage['/base/selector.js'].lineData[420] = 0;
}
if (! _$jscoverage['/base/selector.js'].functionData) {
  _$jscoverage['/base/selector.js'].functionData = [];
  _$jscoverage['/base/selector.js'].functionData[0] = 0;
  _$jscoverage['/base/selector.js'].functionData[1] = 0;
  _$jscoverage['/base/selector.js'].functionData[2] = 0;
  _$jscoverage['/base/selector.js'].functionData[3] = 0;
  _$jscoverage['/base/selector.js'].functionData[4] = 0;
  _$jscoverage['/base/selector.js'].functionData[5] = 0;
  _$jscoverage['/base/selector.js'].functionData[6] = 0;
  _$jscoverage['/base/selector.js'].functionData[7] = 0;
  _$jscoverage['/base/selector.js'].functionData[8] = 0;
  _$jscoverage['/base/selector.js'].functionData[9] = 0;
  _$jscoverage['/base/selector.js'].functionData[10] = 0;
  _$jscoverage['/base/selector.js'].functionData[11] = 0;
  _$jscoverage['/base/selector.js'].functionData[12] = 0;
  _$jscoverage['/base/selector.js'].functionData[13] = 0;
  _$jscoverage['/base/selector.js'].functionData[14] = 0;
  _$jscoverage['/base/selector.js'].functionData[15] = 0;
  _$jscoverage['/base/selector.js'].functionData[16] = 0;
  _$jscoverage['/base/selector.js'].functionData[17] = 0;
  _$jscoverage['/base/selector.js'].functionData[18] = 0;
  _$jscoverage['/base/selector.js'].functionData[19] = 0;
  _$jscoverage['/base/selector.js'].functionData[20] = 0;
  _$jscoverage['/base/selector.js'].functionData[21] = 0;
  _$jscoverage['/base/selector.js'].functionData[22] = 0;
  _$jscoverage['/base/selector.js'].functionData[23] = 0;
  _$jscoverage['/base/selector.js'].functionData[24] = 0;
  _$jscoverage['/base/selector.js'].functionData[25] = 0;
  _$jscoverage['/base/selector.js'].functionData[26] = 0;
  _$jscoverage['/base/selector.js'].functionData[27] = 0;
}
if (! _$jscoverage['/base/selector.js'].branchData) {
  _$jscoverage['/base/selector.js'].branchData = {};
  _$jscoverage['/base/selector.js'].branchData['9'] = [];
  _$jscoverage['/base/selector.js'].branchData['9'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['10'] = [];
  _$jscoverage['/base/selector.js'].branchData['10'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['11'] = [];
  _$jscoverage['/base/selector.js'].branchData['11'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['12'] = [];
  _$jscoverage['/base/selector.js'].branchData['12'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['31'] = [];
  _$jscoverage['/base/selector.js'].branchData['31'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['32'] = [];
  _$jscoverage['/base/selector.js'].branchData['32'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['40'] = [];
  _$jscoverage['/base/selector.js'].branchData['40'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['42'] = [];
  _$jscoverage['/base/selector.js'].branchData['42'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['52'] = [];
  _$jscoverage['/base/selector.js'].branchData['52'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['79'] = [];
  _$jscoverage['/base/selector.js'].branchData['79'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['80'] = [];
  _$jscoverage['/base/selector.js'].branchData['80'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['80'][2] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['84'] = [];
  _$jscoverage['/base/selector.js'].branchData['84'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['86'] = [];
  _$jscoverage['/base/selector.js'].branchData['86'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['89'] = [];
  _$jscoverage['/base/selector.js'].branchData['89'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['91'] = [];
  _$jscoverage['/base/selector.js'].branchData['91'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['95'] = [];
  _$jscoverage['/base/selector.js'].branchData['95'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['99'] = [];
  _$jscoverage['/base/selector.js'].branchData['99'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['101'] = [];
  _$jscoverage['/base/selector.js'].branchData['101'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['101'][2] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['104'] = [];
  _$jscoverage['/base/selector.js'].branchData['104'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['109'] = [];
  _$jscoverage['/base/selector.js'].branchData['109'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['113'] = [];
  _$jscoverage['/base/selector.js'].branchData['113'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['120'] = [];
  _$jscoverage['/base/selector.js'].branchData['120'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['124'] = [];
  _$jscoverage['/base/selector.js'].branchData['124'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['130'] = [];
  _$jscoverage['/base/selector.js'].branchData['130'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['137'] = [];
  _$jscoverage['/base/selector.js'].branchData['137'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['141'] = [];
  _$jscoverage['/base/selector.js'].branchData['141'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['141'][2] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['145'] = [];
  _$jscoverage['/base/selector.js'].branchData['145'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['147'] = [];
  _$jscoverage['/base/selector.js'].branchData['147'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['151'] = [];
  _$jscoverage['/base/selector.js'].branchData['151'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['151'][2] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['151'][3] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['160'] = [];
  _$jscoverage['/base/selector.js'].branchData['160'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['164'] = [];
  _$jscoverage['/base/selector.js'].branchData['164'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['170'] = [];
  _$jscoverage['/base/selector.js'].branchData['170'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['178'] = [];
  _$jscoverage['/base/selector.js'].branchData['178'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['184'] = [];
  _$jscoverage['/base/selector.js'].branchData['184'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['189'] = [];
  _$jscoverage['/base/selector.js'].branchData['189'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['190'] = [];
  _$jscoverage['/base/selector.js'].branchData['190'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['191'] = [];
  _$jscoverage['/base/selector.js'].branchData['191'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['208'] = [];
  _$jscoverage['/base/selector.js'].branchData['208'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['208'][2] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['209'] = [];
  _$jscoverage['/base/selector.js'].branchData['209'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['210'] = [];
  _$jscoverage['/base/selector.js'].branchData['210'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['211'] = [];
  _$jscoverage['/base/selector.js'].branchData['211'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['215'] = [];
  _$jscoverage['/base/selector.js'].branchData['215'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['216'] = [];
  _$jscoverage['/base/selector.js'].branchData['216'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['223'] = [];
  _$jscoverage['/base/selector.js'].branchData['223'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['223'][2] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['223'][3] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['234'] = [];
  _$jscoverage['/base/selector.js'].branchData['234'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['261'] = [];
  _$jscoverage['/base/selector.js'].branchData['261'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['263'] = [];
  _$jscoverage['/base/selector.js'].branchData['263'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['296'] = [];
  _$jscoverage['/base/selector.js'].branchData['296'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['321'] = [];
  _$jscoverage['/base/selector.js'].branchData['321'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['335'] = [];
  _$jscoverage['/base/selector.js'].branchData['335'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['337'] = [];
  _$jscoverage['/base/selector.js'].branchData['337'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['338'] = [];
  _$jscoverage['/base/selector.js'].branchData['338'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['367'] = [];
  _$jscoverage['/base/selector.js'].branchData['367'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['367'][2] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['368'] = [];
  _$jscoverage['/base/selector.js'].branchData['368'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['373'] = [];
  _$jscoverage['/base/selector.js'].branchData['373'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['379'] = [];
  _$jscoverage['/base/selector.js'].branchData['379'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['384'] = [];
  _$jscoverage['/base/selector.js'].branchData['384'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['388'] = [];
  _$jscoverage['/base/selector.js'].branchData['388'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['390'] = [];
  _$jscoverage['/base/selector.js'].branchData['390'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['390'][2] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['392'] = [];
  _$jscoverage['/base/selector.js'].branchData['392'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['397'] = [];
  _$jscoverage['/base/selector.js'].branchData['397'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['416'] = [];
  _$jscoverage['/base/selector.js'].branchData['416'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['416'][2] = new BranchData();
}
_$jscoverage['/base/selector.js'].branchData['416'][2].init(103, 64, 'Dom.filter(elements, filter, context).length === elements.length');
function visit390_416_2(result) {
  _$jscoverage['/base/selector.js'].branchData['416'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['416'][1].init(83, 85, 'elements.length && (Dom.filter(elements, filter, context).length === elements.length)');
function visit389_416_1(result) {
  _$jscoverage['/base/selector.js'].branchData['416'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['397'][1].init(1349, 28, 'typeof filter === \'function\'');
function visit388_397_1(result) {
  _$jscoverage['/base/selector.js'].branchData['397'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['392'][1].init(37, 25, 'getAttr(elem, \'id\') == id');
function visit387_392_1(result) {
  _$jscoverage['/base/selector.js'].branchData['392'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['390'][2].init(772, 12, '!tag && !cls');
function visit386_390_2(result) {
  _$jscoverage['/base/selector.js'].branchData['390'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['390'][1].init(766, 18, 'id && !tag && !cls');
function visit385_390_1(result) {
  _$jscoverage['/base/selector.js'].branchData['390'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['388'][1].init(496, 14, 'clsRe && tagRe');
function visit384_388_1(result) {
  _$jscoverage['/base/selector.js'].branchData['388'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['384'][1].init(352, 3, 'cls');
function visit383_384_1(result) {
  _$jscoverage['/base/selector.js'].branchData['384'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['379'][1].init(175, 3, 'tag');
function visit382_379_1(result) {
  _$jscoverage['/base/selector.js'].branchData['379'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['373'][1].init(136, 3, '!id');
function visit381_373_1(result) {
  _$jscoverage['/base/selector.js'].branchData['373'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['368'][1].init(50, 85, '(filter = trim(filter)) && (match = rSimpleSelector.exec(filter))');
function visit380_368_1(result) {
  _$jscoverage['/base/selector.js'].branchData['368'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['367'][2].init(215, 25, 'typeof filter == \'string\'');
function visit379_367_2(result) {
  _$jscoverage['/base/selector.js'].branchData['367'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['367'][1].init(215, 136, 'typeof filter == \'string\' && (filter = trim(filter)) && (match = rSimpleSelector.exec(filter))');
function visit378_367_1(result) {
  _$jscoverage['/base/selector.js'].branchData['367'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['338'][1].init(34, 33, 'elements[i] === elements[i - 1]');
function visit377_338_1(result) {
  _$jscoverage['/base/selector.js'].branchData['338'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['337'][1].init(92, 7, 'i < len');
function visit376_337_1(result) {
  _$jscoverage['/base/selector.js'].branchData['337'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['335'][1].init(131, 12, 'hasDuplicate');
function visit375_335_1(result) {
  _$jscoverage['/base/selector.js'].branchData['335'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['321'][1].init(26, 6, 'a == b');
function visit374_321_1(result) {
  _$jscoverage['/base/selector.js'].branchData['321'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['296'][1].init(25, 35, 'query(selector, context)[0] || null');
function visit373_296_1(result) {
  _$jscoverage['/base/selector.js'].branchData['296'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['263'][1].init(61, 20, 'matches.call(n, str)');
function visit372_263_1(result) {
  _$jscoverage['/base/selector.js'].branchData['263'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['261'][1].init(149, 7, 'i < len');
function visit371_261_1(result) {
  _$jscoverage['/base/selector.js'].branchData['261'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['234'][1].init(22, 56, '!a.compareDocumentPosition || !b.compareDocumentPosition');
function visit370_234_1(result) {
  _$jscoverage['/base/selector.js'].branchData['234'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['223'][3].init(33, 49, 'el.nodeName.toLowerCase() === value.toLowerCase()');
function visit369_223_3(result) {
  _$jscoverage['/base/selector.js'].branchData['223'][3].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['223'][2].init(17, 12, 'value == \'*\'');
function visit368_223_2(result) {
  _$jscoverage['/base/selector.js'].branchData['223'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['223'][1].init(17, 65, 'value == \'*\' || el.nodeName.toLowerCase() === value.toLowerCase()');
function visit367_223_1(result) {
  _$jscoverage['/base/selector.js'].branchData['223'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['216'][1].init(66, 20, 'ret && ret.specified');
function visit366_216_1(result) {
  _$jscoverage['/base/selector.js'].branchData['216'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['215'][1].init(20, 31, 'el && el.getAttributeNode(name)');
function visit365_215_1(result) {
  _$jscoverage['/base/selector.js'].branchData['215'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['211'][1].init(67, 60, '(SPACE + className + SPACE).indexOf(SPACE + cls + SPACE) > -1');
function visit364_211_1(result) {
  _$jscoverage['/base/selector.js'].branchData['211'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['210'][1].init(26, 128, '(className = className.replace(/[\\r\\t\\n]/g, SPACE)) && (SPACE + className + SPACE).indexOf(SPACE + cls + SPACE) > -1');
function visit363_210_1(result) {
  _$jscoverage['/base/selector.js'].branchData['210'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['209'][1].init(113, 155, 'className && (className = className.replace(/[\\r\\t\\n]/g, SPACE)) && (SPACE + className + SPACE).indexOf(SPACE + cls + SPACE) > -1');
function visit362_209_1(result) {
  _$jscoverage['/base/selector.js'].branchData['209'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['208'][2].init(58, 36, 'el.className || getAttr(el, \'class\')');
function visit361_208_2(result) {
  _$jscoverage['/base/selector.js'].branchData['208'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['208'][1].init(51, 44, 'el && (el.className || getAttr(el, \'class\'))');
function visit360_208_1(result) {
  _$jscoverage['/base/selector.js'].branchData['208'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['191'][1].init(30, 35, 'Dom._contains(contexts[ci], tmp[i])');
function visit359_191_1(result) {
  _$jscoverage['/base/selector.js'].branchData['191'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['190'][1].init(35, 16, 'ci < contextsLen');
function visit358_190_1(result) {
  _$jscoverage['/base/selector.js'].branchData['190'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['189'][1].init(153, 7, 'i < len');
function visit357_189_1(result) {
  _$jscoverage['/base/selector.js'].branchData['189'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['184'][1].init(962, 14, '!simpleContext');
function visit356_184_1(result) {
  _$jscoverage['/base/selector.js'].branchData['184'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['178'][1].init(801, 23, 'isDomNodeList(selector)');
function visit355_178_1(result) {
  _$jscoverage['/base/selector.js'].branchData['178'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['170'][1].init(490, 17, 'isArray(selector)');
function visit354_170_1(result) {
  _$jscoverage['/base/selector.js'].branchData['170'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['164'][1].init(270, 23, 'selector[\'getDOMNodes\']');
function visit353_164_1(result) {
  _$jscoverage['/base/selector.js'].branchData['164'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['160'][1].init(101, 46, 'selector[\'nodeType\'] || selector[\'setTimeout\']');
function visit352_160_1(result) {
  _$jscoverage['/base/selector.js'].branchData['160'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['151'][3].init(266, 15, 'contextsLen > 1');
function visit351_151_3(result) {
  _$jscoverage['/base/selector.js'].branchData['151'][3].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['151'][2].init(248, 14, 'ret.length > 1');
function visit350_151_2(result) {
  _$jscoverage['/base/selector.js'].branchData['151'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['151'][1].init(248, 33, 'ret.length > 1 && contextsLen > 1');
function visit349_151_1(result) {
  _$jscoverage['/base/selector.js'].branchData['151'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['147'][1].init(57, 15, 'i < contextsLen');
function visit348_147_1(result) {
  _$jscoverage['/base/selector.js'].branchData['147'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['145'][1].init(2442, 4, '!ret');
function visit347_145_1(result) {
  _$jscoverage['/base/selector.js'].branchData['145'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['141'][2].init(1167, 18, 'parents.length > 1');
function visit346_141_2(result) {
  _$jscoverage['/base/selector.js'].branchData['141'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['141'][1].init(1156, 29, 'parents && parents.length > 1');
function visit345_141_1(result) {
  _$jscoverage['/base/selector.js'].branchData['141'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['137'][1].init(571, 15, '!parents.length');
function visit344_137_1(result) {
  _$jscoverage['/base/selector.js'].branchData['137'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['130'][1].init(80, 24, 'parentIndex < parentsLen');
function visit343_130_1(result) {
  _$jscoverage['/base/selector.js'].branchData['130'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['124'][1].init(433, 12, 'i < partsLen');
function visit342_124_1(result) {
  _$jscoverage['/base/selector.js'].branchData['124'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['120'][1].init(272, 12, 'i < partsLen');
function visit341_120_1(result) {
  _$jscoverage['/base/selector.js'].branchData['120'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['113'][1].init(1037, 59, 'isSimpleSelector(selector) && supportGetElementsByClassName');
function visit340_113_1(result) {
  _$jscoverage['/base/selector.js'].branchData['113'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['109'][1].init(856, 27, 'rTagSelector.test(selector)');
function visit339_109_1(result) {
  _$jscoverage['/base/selector.js'].branchData['109'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['104'][1].init(641, 26, 'rIdSelector.test(selector)');
function visit338_104_1(result) {
  _$jscoverage['/base/selector.js'].branchData['104'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['101'][2].init(97, 38, 'el.nodeName.toLowerCase() == RegExp.$1');
function visit337_101_2(result) {
  _$jscoverage['/base/selector.js'].branchData['101'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['101'][1].init(91, 44, 'el && el.nodeName.toLowerCase() == RegExp.$1');
function visit336_101_1(result) {
  _$jscoverage['/base/selector.js'].branchData['101'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['99'][1].init(390, 29, 'rTagIdSelector.test(selector)');
function visit335_99_1(result) {
  _$jscoverage['/base/selector.js'].branchData['99'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['95'][1].init(185, 62, 'rClassSelector.test(selector) && supportGetElementsByClassName');
function visit334_95_1(result) {
  _$jscoverage['/base/selector.js'].branchData['95'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['91'][1].init(51, 18, 'selector == \'body\'');
function visit333_91_1(result) {
  _$jscoverage['/base/selector.js'].branchData['91'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['89'][1].init(60, 13, 'simpleContext');
function visit332_89_1(result) {
  _$jscoverage['/base/selector.js'].branchData['89'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['86'][1].init(369, 16, 'isSelectorString');
function visit331_86_1(result) {
  _$jscoverage['/base/selector.js'].branchData['86'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['84'][1].init(312, 9, '!selector');
function visit330_84_1(result) {
  _$jscoverage['/base/selector.js'].branchData['84'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['80'][2].init(196, 27, '(simpleContext = 1) && [doc]');
function visit329_80_2(result) {
  _$jscoverage['/base/selector.js'].branchData['80'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['80'][1].init(154, 21, 'context !== undefined');
function visit328_80_1(result) {
  _$jscoverage['/base/selector.js'].branchData['80'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['79'][1].init(101, 27, 'typeof selector == \'string\'');
function visit327_79_1(result) {
  _$jscoverage['/base/selector.js'].branchData['79'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['52'][1].init(76, 35, 'match && Dom._contains(elem, match)');
function visit326_52_1(result) {
  _$jscoverage['/base/selector.js'].branchData['52'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['42'][1].init(137, 8, 's == \'.\'');
function visit325_42_1(result) {
  _$jscoverage['/base/selector.js'].branchData['42'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['40'][1].init(51, 8, 's == \'#\'');
function visit324_40_1(result) {
  _$jscoverage['/base/selector.js'].branchData['40'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['32'][1].init(18, 22, 'f(els[i], i) === false');
function visit323_32_1(result) {
  _$jscoverage['/base/selector.js'].branchData['32'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['31'][1].init(92, 5, 'i < l');
function visit322_31_1(result) {
  _$jscoverage['/base/selector.js'].branchData['31'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['12'][1].init(45, 72, 'docElem[\'oMatchesSelector\'] || docElem[\'msMatchesSelector\']');
function visit321_12_1(result) {
  _$jscoverage['/base/selector.js'].branchData['12'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['11'][1].init(48, 118, 'docElem[\'mozMatchesSelector\'] || docElem[\'oMatchesSelector\'] || docElem[\'msMatchesSelector\']');
function visit320_11_1(result) {
  _$jscoverage['/base/selector.js'].branchData['11'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['10'][1].init(31, 167, 'docElem[\'webkitMatchesSelector\'] || docElem[\'mozMatchesSelector\'] || docElem[\'oMatchesSelector\'] || docElem[\'msMatchesSelector\']');
function visit319_10_1(result) {
  _$jscoverage['/base/selector.js'].branchData['10'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['9'][1].init(89, 199, 'docElem.matches || docElem[\'webkitMatchesSelector\'] || docElem[\'mozMatchesSelector\'] || docElem[\'oMatchesSelector\'] || docElem[\'msMatchesSelector\']');
function visit318_9_1(result) {
  _$jscoverage['/base/selector.js'].branchData['9'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].lineData[6]++;
KISSY.add('dom/base/selector', function(S, Dom, undefined) {
  _$jscoverage['/base/selector.js'].functionData[0]++;
  _$jscoverage['/base/selector.js'].lineData[7]++;
  var doc = S.Env.host.document, docElem = doc.documentElement, matches = visit318_9_1(docElem.matches || visit319_10_1(docElem['webkitMatchesSelector'] || visit320_11_1(docElem['mozMatchesSelector'] || visit321_12_1(docElem['oMatchesSelector'] || docElem['msMatchesSelector'])))), supportGetElementsByClassName = 'getElementsByClassName' in doc, isArray = S.isArray, makeArray = S.makeArray, isDomNodeList = Dom.isDomNodeList, SPACE = ' ', push = Array.prototype.push, rClassSelector = /^\.([\w-]+)$/, rIdSelector = /^#([\w-]+)$/, rTagSelector = /^([\w-])+$/, rTagIdSelector = /^([\w-]+)#([\w-]+)$/, rSimpleSelector = /^(?:#([\w-]+))?\s*([\w-]+|\*)?\.?([\w-]+)?$/, trim = S.trim;
  _$jscoverage['/base/selector.js'].lineData[27]++;
  function query_each(f) {
    _$jscoverage['/base/selector.js'].functionData[1]++;
    _$jscoverage['/base/selector.js'].lineData[28]++;
    var els = this, l = els.length, i;
    _$jscoverage['/base/selector.js'].lineData[31]++;
    for (i = 0; visit322_31_1(i < l); i++) {
      _$jscoverage['/base/selector.js'].lineData[32]++;
      if (visit323_32_1(f(els[i], i) === false)) {
        _$jscoverage['/base/selector.js'].lineData[33]++;
        break;
      }
    }
  }
  _$jscoverage['/base/selector.js'].lineData[38]++;
  function makeMatch(selector) {
    _$jscoverage['/base/selector.js'].functionData[2]++;
    _$jscoverage['/base/selector.js'].lineData[39]++;
    var s = selector.charAt(0);
    _$jscoverage['/base/selector.js'].lineData[40]++;
    if (visit324_40_1(s == '#')) {
      _$jscoverage['/base/selector.js'].lineData[41]++;
      return makeIdMatch(selector.substr(1));
    } else {
      _$jscoverage['/base/selector.js'].lineData[42]++;
      if (visit325_42_1(s == '.')) {
        _$jscoverage['/base/selector.js'].lineData[43]++;
        return makeClassMatch(selector.substr(1));
      } else {
        _$jscoverage['/base/selector.js'].lineData[45]++;
        return makeTagMatch(selector);
      }
    }
  }
  _$jscoverage['/base/selector.js'].lineData[49]++;
  function makeIdMatch(id) {
    _$jscoverage['/base/selector.js'].functionData[3]++;
    _$jscoverage['/base/selector.js'].lineData[50]++;
    return function(elem) {
  _$jscoverage['/base/selector.js'].functionData[4]++;
  _$jscoverage['/base/selector.js'].lineData[51]++;
  var match = Dom._getElementById(id, doc);
  _$jscoverage['/base/selector.js'].lineData[52]++;
  return visit326_52_1(match && Dom._contains(elem, match)) ? [match] : [];
};
  }
  _$jscoverage['/base/selector.js'].lineData[56]++;
  function makeClassMatch(className) {
    _$jscoverage['/base/selector.js'].functionData[5]++;
    _$jscoverage['/base/selector.js'].lineData[57]++;
    return function(elem) {
  _$jscoverage['/base/selector.js'].functionData[6]++;
  _$jscoverage['/base/selector.js'].lineData[58]++;
  return elem.getElementsByClassName(className);
};
  }
  _$jscoverage['/base/selector.js'].lineData[62]++;
  function makeTagMatch(tagName) {
    _$jscoverage['/base/selector.js'].functionData[7]++;
    _$jscoverage['/base/selector.js'].lineData[63]++;
    return function(elem) {
  _$jscoverage['/base/selector.js'].functionData[8]++;
  _$jscoverage['/base/selector.js'].lineData[64]++;
  return elem.getElementsByTagName(tagName);
};
  }
  _$jscoverage['/base/selector.js'].lineData[69]++;
  function isSimpleSelector(selector) {
    _$jscoverage['/base/selector.js'].functionData[9]++;
    _$jscoverage['/base/selector.js'].lineData[70]++;
    var complexReg = /,|\+|=|~|\[|\]|:|>|\||\$|\^|\*|\(|\)|[\w-]+\.[\w-]+|[\w-]+#[\w-]+/;
    _$jscoverage['/base/selector.js'].lineData[71]++;
    return !selector.match(complexReg);
  }
  _$jscoverage['/base/selector.js'].lineData[74]++;
  function query(selector, context) {
    _$jscoverage['/base/selector.js'].functionData[10]++;
    _$jscoverage['/base/selector.js'].lineData[75]++;
    var ret, i, el, simpleContext, isSelectorString = visit327_79_1(typeof selector == 'string'), contexts = visit328_80_1(context !== undefined) ? query(context) : visit329_80_2((simpleContext = 1) && [doc]), contextsLen = contexts.length;
    _$jscoverage['/base/selector.js'].lineData[84]++;
    if (visit330_84_1(!selector)) {
      _$jscoverage['/base/selector.js'].lineData[85]++;
      ret = [];
    } else {
      _$jscoverage['/base/selector.js'].lineData[86]++;
      if (visit331_86_1(isSelectorString)) {
        _$jscoverage['/base/selector.js'].lineData[87]++;
        selector = trim(selector);
        _$jscoverage['/base/selector.js'].lineData[89]++;
        if (visit332_89_1(simpleContext)) {
          _$jscoverage['/base/selector.js'].lineData[91]++;
          if (visit333_91_1(selector == 'body')) {
            _$jscoverage['/base/selector.js'].lineData[92]++;
            ret = [doc.body];
          } else {
            _$jscoverage['/base/selector.js'].lineData[95]++;
            if (visit334_95_1(rClassSelector.test(selector) && supportGetElementsByClassName)) {
              _$jscoverage['/base/selector.js'].lineData[96]++;
              ret = doc.getElementsByClassName(RegExp.$1);
            } else {
              _$jscoverage['/base/selector.js'].lineData[99]++;
              if (visit335_99_1(rTagIdSelector.test(selector))) {
                _$jscoverage['/base/selector.js'].lineData[100]++;
                el = Dom._getElementById(RegExp.$2, doc);
                _$jscoverage['/base/selector.js'].lineData[101]++;
                ret = visit336_101_1(el && visit337_101_2(el.nodeName.toLowerCase() == RegExp.$1)) ? [el] : [];
              } else {
                _$jscoverage['/base/selector.js'].lineData[104]++;
                if (visit338_104_1(rIdSelector.test(selector))) {
                  _$jscoverage['/base/selector.js'].lineData[105]++;
                  el = Dom._getElementById(selector.substr(1), doc);
                  _$jscoverage['/base/selector.js'].lineData[106]++;
                  ret = el ? [el] : [];
                } else {
                  _$jscoverage['/base/selector.js'].lineData[109]++;
                  if (visit339_109_1(rTagSelector.test(selector))) {
                    _$jscoverage['/base/selector.js'].lineData[110]++;
                    ret = doc.getElementsByTagName(selector);
                  } else {
                    _$jscoverage['/base/selector.js'].lineData[113]++;
                    if (visit340_113_1(isSimpleSelector(selector) && supportGetElementsByClassName)) {
                      _$jscoverage['/base/selector.js'].lineData[114]++;
                      var parts = selector.split(/\s+/), partsLen, parents = contexts, parentIndex, parentsLen;
                      _$jscoverage['/base/selector.js'].lineData[120]++;
                      for (i = 0 , partsLen = parts.length; visit341_120_1(i < partsLen); i++) {
                        _$jscoverage['/base/selector.js'].lineData[121]++;
                        parts[i] = makeMatch(parts[i]);
                      }
                      _$jscoverage['/base/selector.js'].lineData[124]++;
                      for (i = 0 , partsLen = parts.length; visit342_124_1(i < partsLen); i++) {
                        _$jscoverage['/base/selector.js'].lineData[125]++;
                        var part = parts[i], newParents = [], matches;
                        _$jscoverage['/base/selector.js'].lineData[129]++;
                        for (parentIndex = 0 , parentsLen = parents.length; visit343_130_1(parentIndex < parentsLen); parentIndex++) {
                          _$jscoverage['/base/selector.js'].lineData[132]++;
                          matches = part(parents[parentIndex]);
                          _$jscoverage['/base/selector.js'].lineData[133]++;
                          newParents.push.apply(newParents, S.makeArray(matches));
                        }
                        _$jscoverage['/base/selector.js'].lineData[136]++;
                        parents = newParents;
                        _$jscoverage['/base/selector.js'].lineData[137]++;
                        if (visit344_137_1(!parents.length)) {
                          _$jscoverage['/base/selector.js'].lineData[138]++;
                          break;
                        }
                      }
                      _$jscoverage['/base/selector.js'].lineData[141]++;
                      ret = visit345_141_1(parents && visit346_141_2(parents.length > 1)) ? Dom.unique(parents) : parents;
                    }
                  }
                }
              }
            }
          }
        }
        _$jscoverage['/base/selector.js'].lineData[145]++;
        if (visit347_145_1(!ret)) {
          _$jscoverage['/base/selector.js'].lineData[146]++;
          ret = [];
          _$jscoverage['/base/selector.js'].lineData[147]++;
          for (i = 0; visit348_147_1(i < contextsLen); i++) {
            _$jscoverage['/base/selector.js'].lineData[148]++;
            push.apply(ret, Dom._selectInternal(selector, contexts[i]));
          }
          _$jscoverage['/base/selector.js'].lineData[151]++;
          if (visit349_151_1(visit350_151_2(ret.length > 1) && visit351_151_3(contextsLen > 1))) {
            _$jscoverage['/base/selector.js'].lineData[152]++;
            Dom.unique(ret);
          }
        }
      } else {
        _$jscoverage['/base/selector.js'].lineData[160]++;
        if (visit352_160_1(selector['nodeType'] || selector['setTimeout'])) {
          _$jscoverage['/base/selector.js'].lineData[161]++;
          ret = [selector];
        } else {
          _$jscoverage['/base/selector.js'].lineData[164]++;
          if (visit353_164_1(selector['getDOMNodes'])) {
            _$jscoverage['/base/selector.js'].lineData[165]++;
            ret = selector['getDOMNodes']();
          } else {
            _$jscoverage['/base/selector.js'].lineData[170]++;
            if (visit354_170_1(isArray(selector))) {
              _$jscoverage['/base/selector.js'].lineData[171]++;
              ret = selector;
            } else {
              _$jscoverage['/base/selector.js'].lineData[178]++;
              if (visit355_178_1(isDomNodeList(selector))) {
                _$jscoverage['/base/selector.js'].lineData[179]++;
                ret = makeArray(selector);
              } else {
                _$jscoverage['/base/selector.js'].lineData[181]++;
                ret = [selector];
              }
            }
          }
        }
        _$jscoverage['/base/selector.js'].lineData[184]++;
        if (visit356_184_1(!simpleContext)) {
          _$jscoverage['/base/selector.js'].lineData[185]++;
          var tmp = ret, ci, len = tmp.length;
          _$jscoverage['/base/selector.js'].lineData[188]++;
          ret = [];
          _$jscoverage['/base/selector.js'].lineData[189]++;
          for (i = 0; visit357_189_1(i < len); i++) {
            _$jscoverage['/base/selector.js'].lineData[190]++;
            for (ci = 0; visit358_190_1(ci < contextsLen); ci++) {
              _$jscoverage['/base/selector.js'].lineData[191]++;
              if (visit359_191_1(Dom._contains(contexts[ci], tmp[i]))) {
                _$jscoverage['/base/selector.js'].lineData[192]++;
                ret.push(tmp[i]);
                _$jscoverage['/base/selector.js'].lineData[193]++;
                break;
              }
            }
          }
        }
      }
    }
    _$jscoverage['/base/selector.js'].lineData[201]++;
    ret.each = query_each;
    _$jscoverage['/base/selector.js'].lineData[203]++;
    return ret;
  }
  _$jscoverage['/base/selector.js'].lineData[206]++;
  function hasSingleClass(el, cls) {
    _$jscoverage['/base/selector.js'].functionData[11]++;
    _$jscoverage['/base/selector.js'].lineData[208]++;
    var className = visit360_208_1(el && (visit361_208_2(el.className || getAttr(el, 'class'))));
    _$jscoverage['/base/selector.js'].lineData[209]++;
    return visit362_209_1(className && visit363_210_1((className = className.replace(/[\r\t\n]/g, SPACE)) && visit364_211_1((SPACE + className + SPACE).indexOf(SPACE + cls + SPACE) > -1)));
  }
  _$jscoverage['/base/selector.js'].lineData[214]++;
  function getAttr(el, name) {
    _$jscoverage['/base/selector.js'].functionData[12]++;
    _$jscoverage['/base/selector.js'].lineData[215]++;
    var ret = visit365_215_1(el && el.getAttributeNode(name));
    _$jscoverage['/base/selector.js'].lineData[216]++;
    if (visit366_216_1(ret && ret.specified)) {
      _$jscoverage['/base/selector.js'].lineData[217]++;
      return ret.nodeValue;
    }
    _$jscoverage['/base/selector.js'].lineData[219]++;
    return undefined;
  }
  _$jscoverage['/base/selector.js'].lineData[222]++;
  function isTag(el, value) {
    _$jscoverage['/base/selector.js'].functionData[13]++;
    _$jscoverage['/base/selector.js'].lineData[223]++;
    return visit367_223_1(visit368_223_2(value == '*') || visit369_223_3(el.nodeName.toLowerCase() === value.toLowerCase()));
  }
  _$jscoverage['/base/selector.js'].lineData[226]++;
  S.mix(Dom, {
  _compareNodeOrder: function(a, b) {
  _$jscoverage['/base/selector.js'].functionData[14]++;
  _$jscoverage['/base/selector.js'].lineData[234]++;
  if (visit370_234_1(!a.compareDocumentPosition || !b.compareDocumentPosition)) {
    _$jscoverage['/base/selector.js'].lineData[235]++;
    return a.compareDocumentPosition ? -1 : 1;
  }
  _$jscoverage['/base/selector.js'].lineData[237]++;
  var bit = a.compareDocumentPosition(b) & 4;
  _$jscoverage['/base/selector.js'].lineData[238]++;
  return bit ? -1 : 1;
}, 
  _getElementsByTagName: function(name, context) {
  _$jscoverage['/base/selector.js'].functionData[15]++;
  _$jscoverage['/base/selector.js'].lineData[243]++;
  return S.makeArray(context.querySelectorAll(name));
}, 
  _getElementById: function(id, doc) {
  _$jscoverage['/base/selector.js'].functionData[16]++;
  _$jscoverage['/base/selector.js'].lineData[247]++;
  return doc.getElementById(id);
}, 
  _getSimpleAttr: getAttr, 
  _isTag: isTag, 
  _hasSingleClass: hasSingleClass, 
  _matchesInternal: function(str, seeds) {
  _$jscoverage['/base/selector.js'].functionData[17]++;
  _$jscoverage['/base/selector.js'].lineData[257]++;
  var ret = [], i = 0, n, len = seeds.length;
  _$jscoverage['/base/selector.js'].lineData[261]++;
  for (; visit371_261_1(i < len); i++) {
    _$jscoverage['/base/selector.js'].lineData[262]++;
    n = seeds[i];
    _$jscoverage['/base/selector.js'].lineData[263]++;
    if (visit372_263_1(matches.call(n, str))) {
      _$jscoverage['/base/selector.js'].lineData[264]++;
      ret.push(n);
    }
  }
  _$jscoverage['/base/selector.js'].lineData[267]++;
  return ret;
}, 
  _selectInternal: function(str, context) {
  _$jscoverage['/base/selector.js'].functionData[18]++;
  _$jscoverage['/base/selector.js'].lineData[271]++;
  return makeArray(context.querySelectorAll(str));
}, 
  query: query, 
  get: function(selector, context) {
  _$jscoverage['/base/selector.js'].functionData[19]++;
  _$jscoverage['/base/selector.js'].lineData[296]++;
  return visit373_296_1(query(selector, context)[0] || null);
}, 
  unique: (function() {
  _$jscoverage['/base/selector.js'].functionData[20]++;
  _$jscoverage['/base/selector.js'].lineData[308]++;
  var hasDuplicate, baseHasDuplicate = true;
  _$jscoverage['/base/selector.js'].lineData[315]++;
  [0, 0].sort(function() {
  _$jscoverage['/base/selector.js'].functionData[21]++;
  _$jscoverage['/base/selector.js'].lineData[316]++;
  baseHasDuplicate = false;
  _$jscoverage['/base/selector.js'].lineData[317]++;
  return 0;
});
  _$jscoverage['/base/selector.js'].lineData[320]++;
  function sortOrder(a, b) {
    _$jscoverage['/base/selector.js'].functionData[22]++;
    _$jscoverage['/base/selector.js'].lineData[321]++;
    if (visit374_321_1(a == b)) {
      _$jscoverage['/base/selector.js'].lineData[322]++;
      hasDuplicate = true;
      _$jscoverage['/base/selector.js'].lineData[323]++;
      return 0;
    }
    _$jscoverage['/base/selector.js'].lineData[326]++;
    return Dom._compareNodeOrder(a, b);
  }
  _$jscoverage['/base/selector.js'].lineData[330]++;
  return function(elements) {
  _$jscoverage['/base/selector.js'].functionData[23]++;
  _$jscoverage['/base/selector.js'].lineData[332]++;
  hasDuplicate = baseHasDuplicate;
  _$jscoverage['/base/selector.js'].lineData[333]++;
  elements.sort(sortOrder);
  _$jscoverage['/base/selector.js'].lineData[335]++;
  if (visit375_335_1(hasDuplicate)) {
    _$jscoverage['/base/selector.js'].lineData[336]++;
    var i = 1, len = elements.length;
    _$jscoverage['/base/selector.js'].lineData[337]++;
    while (visit376_337_1(i < len)) {
      _$jscoverage['/base/selector.js'].lineData[338]++;
      if (visit377_338_1(elements[i] === elements[i - 1])) {
        _$jscoverage['/base/selector.js'].lineData[339]++;
        elements.splice(i, 1);
        _$jscoverage['/base/selector.js'].lineData[340]++;
        --len;
      } else {
        _$jscoverage['/base/selector.js'].lineData[342]++;
        i++;
      }
    }
  }
  _$jscoverage['/base/selector.js'].lineData[347]++;
  return elements;
};
})(), 
  filter: function(selector, filter, context) {
  _$jscoverage['/base/selector.js'].functionData[24]++;
  _$jscoverage['/base/selector.js'].lineData[360]++;
  var elems = query(selector, context), id, tag, match, cls, ret = [];
  _$jscoverage['/base/selector.js'].lineData[367]++;
  if (visit378_367_1(visit379_367_2(typeof filter == 'string') && visit380_368_1((filter = trim(filter)) && (match = rSimpleSelector.exec(filter))))) {
    _$jscoverage['/base/selector.js'].lineData[370]++;
    id = match[1];
    _$jscoverage['/base/selector.js'].lineData[371]++;
    tag = match[2];
    _$jscoverage['/base/selector.js'].lineData[372]++;
    cls = match[3];
    _$jscoverage['/base/selector.js'].lineData[373]++;
    if (visit381_373_1(!id)) {
      _$jscoverage['/base/selector.js'].lineData[374]++;
      filter = function(elem) {
  _$jscoverage['/base/selector.js'].functionData[25]++;
  _$jscoverage['/base/selector.js'].lineData[375]++;
  var tagRe = true, clsRe = true;
  _$jscoverage['/base/selector.js'].lineData[379]++;
  if (visit382_379_1(tag)) {
    _$jscoverage['/base/selector.js'].lineData[380]++;
    tagRe = isTag(elem, tag);
  }
  _$jscoverage['/base/selector.js'].lineData[384]++;
  if (visit383_384_1(cls)) {
    _$jscoverage['/base/selector.js'].lineData[385]++;
    clsRe = hasSingleClass(elem, cls);
  }
  _$jscoverage['/base/selector.js'].lineData[388]++;
  return visit384_388_1(clsRe && tagRe);
};
    } else {
      _$jscoverage['/base/selector.js'].lineData[390]++;
      if (visit385_390_1(id && visit386_390_2(!tag && !cls))) {
        _$jscoverage['/base/selector.js'].lineData[391]++;
        filter = function(elem) {
  _$jscoverage['/base/selector.js'].functionData[26]++;
  _$jscoverage['/base/selector.js'].lineData[392]++;
  return visit387_392_1(getAttr(elem, 'id') == id);
};
      }
    }
  }
  _$jscoverage['/base/selector.js'].lineData[397]++;
  if (visit388_397_1(typeof filter === 'function')) {
    _$jscoverage['/base/selector.js'].lineData[398]++;
    ret = S.filter(elems, filter);
  } else {
    _$jscoverage['/base/selector.js'].lineData[400]++;
    ret = Dom._matchesInternal(filter, elems);
  }
  _$jscoverage['/base/selector.js'].lineData[403]++;
  return ret;
}, 
  test: function(selector, filter, context) {
  _$jscoverage['/base/selector.js'].functionData[27]++;
  _$jscoverage['/base/selector.js'].lineData[415]++;
  var elements = query(selector, context);
  _$jscoverage['/base/selector.js'].lineData[416]++;
  return visit389_416_1(elements.length && (visit390_416_2(Dom.filter(elements, filter, context).length === elements.length)));
}});
  _$jscoverage['/base/selector.js'].lineData[420]++;
  return Dom;
}, {
  requires: ['./api']});
