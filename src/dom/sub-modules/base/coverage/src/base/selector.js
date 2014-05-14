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
  _$jscoverage['/base/selector.js'].lineData[8] = 0;
  _$jscoverage['/base/selector.js'].lineData[28] = 0;
  _$jscoverage['/base/selector.js'].lineData[29] = 0;
  _$jscoverage['/base/selector.js'].lineData[32] = 0;
  _$jscoverage['/base/selector.js'].lineData[33] = 0;
  _$jscoverage['/base/selector.js'].lineData[34] = 0;
  _$jscoverage['/base/selector.js'].lineData[39] = 0;
  _$jscoverage['/base/selector.js'].lineData[40] = 0;
  _$jscoverage['/base/selector.js'].lineData[41] = 0;
  _$jscoverage['/base/selector.js'].lineData[42] = 0;
  _$jscoverage['/base/selector.js'].lineData[44] = 0;
  _$jscoverage['/base/selector.js'].lineData[47] = 0;
  _$jscoverage['/base/selector.js'].lineData[48] = 0;
  _$jscoverage['/base/selector.js'].lineData[49] = 0;
  _$jscoverage['/base/selector.js'].lineData[50] = 0;
  _$jscoverage['/base/selector.js'].lineData[51] = 0;
  _$jscoverage['/base/selector.js'].lineData[52] = 0;
  _$jscoverage['/base/selector.js'].lineData[54] = 0;
  _$jscoverage['/base/selector.js'].lineData[58] = 0;
  _$jscoverage['/base/selector.js'].lineData[59] = 0;
  _$jscoverage['/base/selector.js'].lineData[60] = 0;
  _$jscoverage['/base/selector.js'].lineData[61] = 0;
  _$jscoverage['/base/selector.js'].lineData[65] = 0;
  _$jscoverage['/base/selector.js'].lineData[66] = 0;
  _$jscoverage['/base/selector.js'].lineData[67] = 0;
  _$jscoverage['/base/selector.js'].lineData[71] = 0;
  _$jscoverage['/base/selector.js'].lineData[72] = 0;
  _$jscoverage['/base/selector.js'].lineData[73] = 0;
  _$jscoverage['/base/selector.js'].lineData[78] = 0;
  _$jscoverage['/base/selector.js'].lineData[79] = 0;
  _$jscoverage['/base/selector.js'].lineData[80] = 0;
  _$jscoverage['/base/selector.js'].lineData[83] = 0;
  _$jscoverage['/base/selector.js'].lineData[84] = 0;
  _$jscoverage['/base/selector.js'].lineData[93] = 0;
  _$jscoverage['/base/selector.js'].lineData[94] = 0;
  _$jscoverage['/base/selector.js'].lineData[95] = 0;
  _$jscoverage['/base/selector.js'].lineData[96] = 0;
  _$jscoverage['/base/selector.js'].lineData[98] = 0;
  _$jscoverage['/base/selector.js'].lineData[100] = 0;
  _$jscoverage['/base/selector.js'].lineData[101] = 0;
  _$jscoverage['/base/selector.js'].lineData[102] = 0;
  _$jscoverage['/base/selector.js'].lineData[104] = 0;
  _$jscoverage['/base/selector.js'].lineData[105] = 0;
  _$jscoverage['/base/selector.js'].lineData[107] = 0;
  _$jscoverage['/base/selector.js'].lineData[108] = 0;
  _$jscoverage['/base/selector.js'].lineData[109] = 0;
  _$jscoverage['/base/selector.js'].lineData[111] = 0;
  _$jscoverage['/base/selector.js'].lineData[112] = 0;
  _$jscoverage['/base/selector.js'].lineData[113] = 0;
  _$jscoverage['/base/selector.js'].lineData[115] = 0;
  _$jscoverage['/base/selector.js'].lineData[116] = 0;
  _$jscoverage['/base/selector.js'].lineData[118] = 0;
  _$jscoverage['/base/selector.js'].lineData[124] = 0;
  _$jscoverage['/base/selector.js'].lineData[125] = 0;
  _$jscoverage['/base/selector.js'].lineData[128] = 0;
  _$jscoverage['/base/selector.js'].lineData[129] = 0;
  _$jscoverage['/base/selector.js'].lineData[133] = 0;
  _$jscoverage['/base/selector.js'].lineData[136] = 0;
  _$jscoverage['/base/selector.js'].lineData[137] = 0;
  _$jscoverage['/base/selector.js'].lineData[140] = 0;
  _$jscoverage['/base/selector.js'].lineData[141] = 0;
  _$jscoverage['/base/selector.js'].lineData[142] = 0;
  _$jscoverage['/base/selector.js'].lineData[145] = 0;
  _$jscoverage['/base/selector.js'].lineData[149] = 0;
  _$jscoverage['/base/selector.js'].lineData[150] = 0;
  _$jscoverage['/base/selector.js'].lineData[151] = 0;
  _$jscoverage['/base/selector.js'].lineData[152] = 0;
  _$jscoverage['/base/selector.js'].lineData[155] = 0;
  _$jscoverage['/base/selector.js'].lineData[156] = 0;
  _$jscoverage['/base/selector.js'].lineData[164] = 0;
  _$jscoverage['/base/selector.js'].lineData[165] = 0;
  _$jscoverage['/base/selector.js'].lineData[166] = 0;
  _$jscoverage['/base/selector.js'].lineData[168] = 0;
  _$jscoverage['/base/selector.js'].lineData[169] = 0;
  _$jscoverage['/base/selector.js'].lineData[173] = 0;
  _$jscoverage['/base/selector.js'].lineData[174] = 0;
  _$jscoverage['/base/selector.js'].lineData[180] = 0;
  _$jscoverage['/base/selector.js'].lineData[182] = 0;
  _$jscoverage['/base/selector.js'].lineData[185] = 0;
  _$jscoverage['/base/selector.js'].lineData[186] = 0;
  _$jscoverage['/base/selector.js'].lineData[189] = 0;
  _$jscoverage['/base/selector.js'].lineData[190] = 0;
  _$jscoverage['/base/selector.js'].lineData[191] = 0;
  _$jscoverage['/base/selector.js'].lineData[192] = 0;
  _$jscoverage['/base/selector.js'].lineData[193] = 0;
  _$jscoverage['/base/selector.js'].lineData[194] = 0;
  _$jscoverage['/base/selector.js'].lineData[202] = 0;
  _$jscoverage['/base/selector.js'].lineData[204] = 0;
  _$jscoverage['/base/selector.js'].lineData[207] = 0;
  _$jscoverage['/base/selector.js'].lineData[210] = 0;
  _$jscoverage['/base/selector.js'].lineData[211] = 0;
  _$jscoverage['/base/selector.js'].lineData[215] = 0;
  _$jscoverage['/base/selector.js'].lineData[216] = 0;
  _$jscoverage['/base/selector.js'].lineData[217] = 0;
  _$jscoverage['/base/selector.js'].lineData[218] = 0;
  _$jscoverage['/base/selector.js'].lineData[220] = 0;
  _$jscoverage['/base/selector.js'].lineData[223] = 0;
  _$jscoverage['/base/selector.js'].lineData[224] = 0;
  _$jscoverage['/base/selector.js'].lineData[227] = 0;
  _$jscoverage['/base/selector.js'].lineData[235] = 0;
  _$jscoverage['/base/selector.js'].lineData[236] = 0;
  _$jscoverage['/base/selector.js'].lineData[238] = 0;
  _$jscoverage['/base/selector.js'].lineData[239] = 0;
  _$jscoverage['/base/selector.js'].lineData[244] = 0;
  _$jscoverage['/base/selector.js'].lineData[248] = 0;
  _$jscoverage['/base/selector.js'].lineData[258] = 0;
  _$jscoverage['/base/selector.js'].lineData[262] = 0;
  _$jscoverage['/base/selector.js'].lineData[263] = 0;
  _$jscoverage['/base/selector.js'].lineData[264] = 0;
  _$jscoverage['/base/selector.js'].lineData[265] = 0;
  _$jscoverage['/base/selector.js'].lineData[268] = 0;
  _$jscoverage['/base/selector.js'].lineData[272] = 0;
  _$jscoverage['/base/selector.js'].lineData[298] = 0;
  _$jscoverage['/base/selector.js'].lineData[310] = 0;
  _$jscoverage['/base/selector.js'].lineData[317] = 0;
  _$jscoverage['/base/selector.js'].lineData[318] = 0;
  _$jscoverage['/base/selector.js'].lineData[319] = 0;
  _$jscoverage['/base/selector.js'].lineData[322] = 0;
  _$jscoverage['/base/selector.js'].lineData[323] = 0;
  _$jscoverage['/base/selector.js'].lineData[324] = 0;
  _$jscoverage['/base/selector.js'].lineData[325] = 0;
  _$jscoverage['/base/selector.js'].lineData[328] = 0;
  _$jscoverage['/base/selector.js'].lineData[332] = 0;
  _$jscoverage['/base/selector.js'].lineData[334] = 0;
  _$jscoverage['/base/selector.js'].lineData[335] = 0;
  _$jscoverage['/base/selector.js'].lineData[337] = 0;
  _$jscoverage['/base/selector.js'].lineData[338] = 0;
  _$jscoverage['/base/selector.js'].lineData[339] = 0;
  _$jscoverage['/base/selector.js'].lineData[340] = 0;
  _$jscoverage['/base/selector.js'].lineData[341] = 0;
  _$jscoverage['/base/selector.js'].lineData[342] = 0;
  _$jscoverage['/base/selector.js'].lineData[344] = 0;
  _$jscoverage['/base/selector.js'].lineData[349] = 0;
  _$jscoverage['/base/selector.js'].lineData[362] = 0;
  _$jscoverage['/base/selector.js'].lineData[369] = 0;
  _$jscoverage['/base/selector.js'].lineData[372] = 0;
  _$jscoverage['/base/selector.js'].lineData[373] = 0;
  _$jscoverage['/base/selector.js'].lineData[374] = 0;
  _$jscoverage['/base/selector.js'].lineData[375] = 0;
  _$jscoverage['/base/selector.js'].lineData[376] = 0;
  _$jscoverage['/base/selector.js'].lineData[377] = 0;
  _$jscoverage['/base/selector.js'].lineData[381] = 0;
  _$jscoverage['/base/selector.js'].lineData[382] = 0;
  _$jscoverage['/base/selector.js'].lineData[386] = 0;
  _$jscoverage['/base/selector.js'].lineData[387] = 0;
  _$jscoverage['/base/selector.js'].lineData[390] = 0;
  _$jscoverage['/base/selector.js'].lineData[392] = 0;
  _$jscoverage['/base/selector.js'].lineData[393] = 0;
  _$jscoverage['/base/selector.js'].lineData[394] = 0;
  _$jscoverage['/base/selector.js'].lineData[399] = 0;
  _$jscoverage['/base/selector.js'].lineData[400] = 0;
  _$jscoverage['/base/selector.js'].lineData[402] = 0;
  _$jscoverage['/base/selector.js'].lineData[405] = 0;
  _$jscoverage['/base/selector.js'].lineData[417] = 0;
  _$jscoverage['/base/selector.js'].lineData[418] = 0;
  _$jscoverage['/base/selector.js'].lineData[422] = 0;
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
  _$jscoverage['/base/selector.js'].functionData[28] = 0;
}
if (! _$jscoverage['/base/selector.js'].branchData) {
  _$jscoverage['/base/selector.js'].branchData = {};
  _$jscoverage['/base/selector.js'].branchData['10'] = [];
  _$jscoverage['/base/selector.js'].branchData['10'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['11'] = [];
  _$jscoverage['/base/selector.js'].branchData['11'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['12'] = [];
  _$jscoverage['/base/selector.js'].branchData['12'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['13'] = [];
  _$jscoverage['/base/selector.js'].branchData['13'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['32'] = [];
  _$jscoverage['/base/selector.js'].branchData['32'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['33'] = [];
  _$jscoverage['/base/selector.js'].branchData['33'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['41'] = [];
  _$jscoverage['/base/selector.js'].branchData['41'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['49'] = [];
  _$jscoverage['/base/selector.js'].branchData['49'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['51'] = [];
  _$jscoverage['/base/selector.js'].branchData['51'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['61'] = [];
  _$jscoverage['/base/selector.js'].branchData['61'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['88'] = [];
  _$jscoverage['/base/selector.js'].branchData['88'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['89'] = [];
  _$jscoverage['/base/selector.js'].branchData['89'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['89'][2] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['93'] = [];
  _$jscoverage['/base/selector.js'].branchData['93'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['95'] = [];
  _$jscoverage['/base/selector.js'].branchData['95'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['98'] = [];
  _$jscoverage['/base/selector.js'].branchData['98'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['100'] = [];
  _$jscoverage['/base/selector.js'].branchData['100'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['102'] = [];
  _$jscoverage['/base/selector.js'].branchData['102'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['105'] = [];
  _$jscoverage['/base/selector.js'].branchData['105'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['108'] = [];
  _$jscoverage['/base/selector.js'].branchData['108'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['108'][2] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['109'] = [];
  _$jscoverage['/base/selector.js'].branchData['109'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['113'] = [];
  _$jscoverage['/base/selector.js'].branchData['113'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['116'] = [];
  _$jscoverage['/base/selector.js'].branchData['116'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['124'] = [];
  _$jscoverage['/base/selector.js'].branchData['124'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['128'] = [];
  _$jscoverage['/base/selector.js'].branchData['128'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['134'] = [];
  _$jscoverage['/base/selector.js'].branchData['134'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['141'] = [];
  _$jscoverage['/base/selector.js'].branchData['141'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['145'] = [];
  _$jscoverage['/base/selector.js'].branchData['145'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['145'][2] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['149'] = [];
  _$jscoverage['/base/selector.js'].branchData['149'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['151'] = [];
  _$jscoverage['/base/selector.js'].branchData['151'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['155'] = [];
  _$jscoverage['/base/selector.js'].branchData['155'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['155'][2] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['155'][3] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['164'] = [];
  _$jscoverage['/base/selector.js'].branchData['164'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['166'] = [];
  _$jscoverage['/base/selector.js'].branchData['166'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['169'] = [];
  _$jscoverage['/base/selector.js'].branchData['169'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['174'] = [];
  _$jscoverage['/base/selector.js'].branchData['174'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['185'] = [];
  _$jscoverage['/base/selector.js'].branchData['185'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['190'] = [];
  _$jscoverage['/base/selector.js'].branchData['190'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['191'] = [];
  _$jscoverage['/base/selector.js'].branchData['191'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['192'] = [];
  _$jscoverage['/base/selector.js'].branchData['192'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['210'] = [];
  _$jscoverage['/base/selector.js'].branchData['210'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['211'] = [];
  _$jscoverage['/base/selector.js'].branchData['211'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['211'][2] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['212'] = [];
  _$jscoverage['/base/selector.js'].branchData['212'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['216'] = [];
  _$jscoverage['/base/selector.js'].branchData['216'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['217'] = [];
  _$jscoverage['/base/selector.js'].branchData['217'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['224'] = [];
  _$jscoverage['/base/selector.js'].branchData['224'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['224'][2] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['224'][3] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['235'] = [];
  _$jscoverage['/base/selector.js'].branchData['235'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['262'] = [];
  _$jscoverage['/base/selector.js'].branchData['262'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['264'] = [];
  _$jscoverage['/base/selector.js'].branchData['264'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['298'] = [];
  _$jscoverage['/base/selector.js'].branchData['298'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['323'] = [];
  _$jscoverage['/base/selector.js'].branchData['323'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['337'] = [];
  _$jscoverage['/base/selector.js'].branchData['337'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['339'] = [];
  _$jscoverage['/base/selector.js'].branchData['339'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['340'] = [];
  _$jscoverage['/base/selector.js'].branchData['340'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['369'] = [];
  _$jscoverage['/base/selector.js'].branchData['369'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['369'][2] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['370'] = [];
  _$jscoverage['/base/selector.js'].branchData['370'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['375'] = [];
  _$jscoverage['/base/selector.js'].branchData['375'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['381'] = [];
  _$jscoverage['/base/selector.js'].branchData['381'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['386'] = [];
  _$jscoverage['/base/selector.js'].branchData['386'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['390'] = [];
  _$jscoverage['/base/selector.js'].branchData['390'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['392'] = [];
  _$jscoverage['/base/selector.js'].branchData['392'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['392'][2] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['394'] = [];
  _$jscoverage['/base/selector.js'].branchData['394'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['399'] = [];
  _$jscoverage['/base/selector.js'].branchData['399'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['418'] = [];
  _$jscoverage['/base/selector.js'].branchData['418'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['418'][2] = new BranchData();
}
_$jscoverage['/base/selector.js'].branchData['418'][2].init(103, 64, 'Dom.filter(elements, filter, context).length === elements.length');
function visit397_418_2(result) {
  _$jscoverage['/base/selector.js'].branchData['418'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['418'][1].init(83, 85, 'elements.length && (Dom.filter(elements, filter, context).length === elements.length)');
function visit396_418_1(result) {
  _$jscoverage['/base/selector.js'].branchData['418'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['399'][1].init(1352, 28, 'typeof filter === \'function\'');
function visit395_399_1(result) {
  _$jscoverage['/base/selector.js'].branchData['399'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['394'][1].init(37, 26, 'getAttr(elem, \'id\') === id');
function visit394_394_1(result) {
  _$jscoverage['/base/selector.js'].branchData['394'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['392'][2].init(773, 12, '!tag && !cls');
function visit393_392_2(result) {
  _$jscoverage['/base/selector.js'].branchData['392'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['392'][1].init(767, 18, 'id && !tag && !cls');
function visit392_392_1(result) {
  _$jscoverage['/base/selector.js'].branchData['392'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['390'][1].init(496, 14, 'clsRe && tagRe');
function visit391_390_1(result) {
  _$jscoverage['/base/selector.js'].branchData['390'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['386'][1].init(352, 3, 'cls');
function visit390_386_1(result) {
  _$jscoverage['/base/selector.js'].branchData['386'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['381'][1].init(175, 3, 'tag');
function visit389_381_1(result) {
  _$jscoverage['/base/selector.js'].branchData['381'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['375'][1].init(136, 3, '!id');
function visit388_375_1(result) {
  _$jscoverage['/base/selector.js'].branchData['375'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['370'][1].init(51, 85, '(filter = trim(filter)) && (match = rSimpleSelector.exec(filter))');
function visit387_370_1(result) {
  _$jscoverage['/base/selector.js'].branchData['370'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['369'][2].init(215, 26, 'typeof filter === \'string\'');
function visit386_369_2(result) {
  _$jscoverage['/base/selector.js'].branchData['369'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['369'][1].init(215, 137, 'typeof filter === \'string\' && (filter = trim(filter)) && (match = rSimpleSelector.exec(filter))');
function visit385_369_1(result) {
  _$jscoverage['/base/selector.js'].branchData['369'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['340'][1].init(34, 33, 'elements[i] === elements[i - 1]');
function visit384_340_1(result) {
  _$jscoverage['/base/selector.js'].branchData['340'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['339'][1].init(92, 7, 'i < len');
function visit383_339_1(result) {
  _$jscoverage['/base/selector.js'].branchData['339'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['337'][1].init(131, 12, 'hasDuplicate');
function visit382_337_1(result) {
  _$jscoverage['/base/selector.js'].branchData['337'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['323'][1].init(26, 7, 'a === b');
function visit381_323_1(result) {
  _$jscoverage['/base/selector.js'].branchData['323'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['298'][1].init(25, 35, 'query(selector, context)[0] || null');
function visit380_298_1(result) {
  _$jscoverage['/base/selector.js'].branchData['298'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['264'][1].init(61, 20, 'matches.call(n, str)');
function visit379_264_1(result) {
  _$jscoverage['/base/selector.js'].branchData['264'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['262'][1].init(149, 7, 'i < len');
function visit378_262_1(result) {
  _$jscoverage['/base/selector.js'].branchData['262'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['235'][1].init(22, 56, '!a.compareDocumentPosition || !b.compareDocumentPosition');
function visit377_235_1(result) {
  _$jscoverage['/base/selector.js'].branchData['235'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['224'][3].init(34, 49, 'el.nodeName.toLowerCase() === value.toLowerCase()');
function visit376_224_3(result) {
  _$jscoverage['/base/selector.js'].branchData['224'][3].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['224'][2].init(17, 13, 'value === \'*\'');
function visit375_224_2(result) {
  _$jscoverage['/base/selector.js'].branchData['224'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['224'][1].init(17, 66, 'value === \'*\' || el.nodeName.toLowerCase() === value.toLowerCase()');
function visit374_224_1(result) {
  _$jscoverage['/base/selector.js'].branchData['224'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['217'][1].init(66, 20, 'ret && ret.specified');
function visit373_217_1(result) {
  _$jscoverage['/base/selector.js'].branchData['217'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['216'][1].init(20, 31, 'el && el.getAttributeNode(name)');
function visit372_216_1(result) {
  _$jscoverage['/base/selector.js'].branchData['216'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['212'][1].init(67, 60, '(SPACE + className + SPACE).indexOf(SPACE + cls + SPACE) > -1');
function visit371_212_1(result) {
  _$jscoverage['/base/selector.js'].branchData['212'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['211'][2].init(167, 128, '(className = className.replace(/[\\r\\t\\n]/g, SPACE)) && (SPACE + className + SPACE).indexOf(SPACE + cls + SPACE) > -1');
function visit370_211_2(result) {
  _$jscoverage['/base/selector.js'].branchData['211'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['211'][1].init(153, 142, 'className && (className = className.replace(/[\\r\\t\\n]/g, SPACE)) && (SPACE + className + SPACE).indexOf(SPACE + cls + SPACE) > -1');
function visit369_211_1(result) {
  _$jscoverage['/base/selector.js'].branchData['211'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['210'][1].init(109, 26, 'el && getAttr(el, \'class\')');
function visit368_210_1(result) {
  _$jscoverage['/base/selector.js'].branchData['210'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['192'][1].init(30, 35, 'Dom._contains(contexts[ci], tmp[i])');
function visit367_192_1(result) {
  _$jscoverage['/base/selector.js'].branchData['192'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['191'][1].init(35, 16, 'ci < contextsLen');
function visit366_191_1(result) {
  _$jscoverage['/base/selector.js'].branchData['191'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['190'][1].init(153, 7, 'i < len');
function visit365_190_1(result) {
  _$jscoverage['/base/selector.js'].branchData['190'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['185'][1].init(1049, 14, '!simpleContext');
function visit364_185_1(result) {
  _$jscoverage['/base/selector.js'].branchData['185'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['174'][1].init(651, 23, 'isDomNodeList(selector)');
function visit363_174_1(result) {
  _$jscoverage['/base/selector.js'].branchData['174'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['169'][1].init(455, 17, 'isArray(selector)');
function visit362_169_1(result) {
  _$jscoverage['/base/selector.js'].branchData['169'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['166'][1].init(309, 20, 'selector.getDOMNodes');
function visit361_166_1(result) {
  _$jscoverage['/base/selector.js'].branchData['166'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['164'][1].init(204, 41, 'selector.nodeType || S.isWindow(selector)');
function visit360_164_1(result) {
  _$jscoverage['/base/selector.js'].branchData['164'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['155'][3].init(266, 15, 'contextsLen > 1');
function visit359_155_3(result) {
  _$jscoverage['/base/selector.js'].branchData['155'][3].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['155'][2].init(248, 14, 'ret.length > 1');
function visit358_155_2(result) {
  _$jscoverage['/base/selector.js'].branchData['155'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['155'][1].init(248, 33, 'ret.length > 1 && contextsLen > 1');
function visit357_155_1(result) {
  _$jscoverage['/base/selector.js'].branchData['155'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['151'][1].init(57, 15, 'i < contextsLen');
function visit356_151_1(result) {
  _$jscoverage['/base/selector.js'].branchData['151'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['149'][1].init(2396, 4, '!ret');
function visit355_149_1(result) {
  _$jscoverage['/base/selector.js'].branchData['149'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['145'][2].init(1209, 18, 'parents.length > 1');
function visit354_145_2(result) {
  _$jscoverage['/base/selector.js'].branchData['145'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['145'][1].init(1198, 29, 'parents && parents.length > 1');
function visit353_145_1(result) {
  _$jscoverage['/base/selector.js'].branchData['145'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['141'][1].init(568, 15, '!parents.length');
function visit352_141_1(result) {
  _$jscoverage['/base/selector.js'].branchData['141'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['134'][1].init(80, 24, 'parentIndex < parentsLen');
function visit351_134_1(result) {
  _$jscoverage['/base/selector.js'].branchData['134'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['128'][1].init(478, 12, 'i < partsLen');
function visit350_128_1(result) {
  _$jscoverage['/base/selector.js'].branchData['128'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['124'][1].init(317, 12, 'i < partsLen');
function visit349_124_1(result) {
  _$jscoverage['/base/selector.js'].branchData['124'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['116'][1].init(949, 59, 'isSimpleSelector(selector) && supportGetElementsByClassName');
function visit348_116_1(result) {
  _$jscoverage['/base/selector.js'].branchData['116'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['113'][1].init(787, 27, 'rTagSelector.test(selector)');
function visit347_113_1(result) {
  _$jscoverage['/base/selector.js'].branchData['113'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['109'][1].init(585, 26, 'rIdSelector.test(selector)');
function visit346_109_1(result) {
  _$jscoverage['/base/selector.js'].branchData['109'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['108'][2].init(128, 39, 'el.nodeName.toLowerCase() === RegExp.$1');
function visit345_108_2(result) {
  _$jscoverage['/base/selector.js'].branchData['108'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['108'][1].init(122, 45, 'el && el.nodeName.toLowerCase() === RegExp.$1');
function visit344_108_1(result) {
  _$jscoverage['/base/selector.js'].branchData['108'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['105'][1].init(343, 29, 'rTagIdSelector.test(selector)');
function visit343_105_1(result) {
  _$jscoverage['/base/selector.js'].branchData['105'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['102'][1].init(142, 62, 'rClassSelector.test(selector) && supportGetElementsByClassName');
function visit342_102_1(result) {
  _$jscoverage['/base/selector.js'].branchData['102'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['100'][1].init(51, 19, 'selector === \'body\'');
function visit341_100_1(result) {
  _$jscoverage['/base/selector.js'].branchData['100'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['98'][1].init(60, 13, 'simpleContext');
function visit340_98_1(result) {
  _$jscoverage['/base/selector.js'].branchData['98'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['95'][1].init(370, 16, 'isSelectorString');
function visit339_95_1(result) {
  _$jscoverage['/base/selector.js'].branchData['95'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['93'][1].init(313, 9, '!selector');
function visit338_93_1(result) {
  _$jscoverage['/base/selector.js'].branchData['93'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['89'][2].init(197, 27, '(simpleContext = 1) && [doc]');
function visit337_89_2(result) {
  _$jscoverage['/base/selector.js'].branchData['89'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['89'][1].init(155, 21, 'context !== undefined');
function visit336_89_1(result) {
  _$jscoverage['/base/selector.js'].branchData['89'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['88'][1].init(101, 28, 'typeof selector === \'string\'');
function visit335_88_1(result) {
  _$jscoverage['/base/selector.js'].branchData['88'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['61'][1].init(76, 35, 'match && Dom._contains(elem, match)');
function visit334_61_1(result) {
  _$jscoverage['/base/selector.js'].branchData['61'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['51'][1].init(152, 9, 's === \'.\'');
function visit333_51_1(result) {
  _$jscoverage['/base/selector.js'].branchData['51'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['49'][1].init(51, 9, 's === \'#\'');
function visit332_49_1(result) {
  _$jscoverage['/base/selector.js'].branchData['49'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['41'][1].init(54, 5, '!name');
function visit331_41_1(result) {
  _$jscoverage['/base/selector.js'].branchData['41'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['33'][1].init(18, 23, 'f(self[i], i) === false');
function visit330_33_1(result) {
  _$jscoverage['/base/selector.js'].branchData['33'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['32'][1].init(94, 5, 'i < l');
function visit329_32_1(result) {
  _$jscoverage['/base/selector.js'].branchData['32'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['13'][1].init(42, 66, 'docElem.oMatchesSelector || docElem.msMatchesSelector');
function visit328_13_1(result) {
  _$jscoverage['/base/selector.js'].branchData['13'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['12'][1].init(45, 109, 'docElem.mozMatchesSelector || docElem.oMatchesSelector || docElem.msMatchesSelector');
function visit327_12_1(result) {
  _$jscoverage['/base/selector.js'].branchData['12'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['11'][1].init(31, 155, 'docElem.webkitMatchesSelector || docElem.mozMatchesSelector || docElem.oMatchesSelector || docElem.msMatchesSelector');
function visit326_11_1(result) {
  _$jscoverage['/base/selector.js'].branchData['11'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['10'][1].init(89, 187, 'docElem.matches || docElem.webkitMatchesSelector || docElem.mozMatchesSelector || docElem.oMatchesSelector || docElem.msMatchesSelector');
function visit325_10_1(result) {
  _$jscoverage['/base/selector.js'].branchData['10'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/base/selector.js'].functionData[0]++;
  _$jscoverage['/base/selector.js'].lineData[7]++;
  var Dom = require('./api');
  _$jscoverage['/base/selector.js'].lineData[8]++;
  var doc = S.Env.host.document, docElem = doc.documentElement, matches = visit325_10_1(docElem.matches || visit326_11_1(docElem.webkitMatchesSelector || visit327_12_1(docElem.mozMatchesSelector || visit328_13_1(docElem.oMatchesSelector || docElem.msMatchesSelector)))), supportGetElementsByClassName = 'getElementsByClassName' in doc, isArray = S.isArray, makeArray = S.makeArray, isDomNodeList = Dom.isDomNodeList, SPACE = ' ', push = Array.prototype.push, rClassSelector = /^\.([\w-]+)$/, rIdSelector = /^#([\w-]+)$/, rTagSelector = /^([\w-])+$/, rTagIdSelector = /^([\w-]+)#([\w-]+)$/, rSimpleSelector = /^(?:#([\w-]+))?\s*([\w-]+|\*)?\.?([\w-]+)?$/, trim = S.trim;
  _$jscoverage['/base/selector.js'].lineData[28]++;
  function queryEach(f) {
    _$jscoverage['/base/selector.js'].functionData[1]++;
    _$jscoverage['/base/selector.js'].lineData[29]++;
    var self = this, l = self.length, i;
    _$jscoverage['/base/selector.js'].lineData[32]++;
    for (i = 0; visit329_32_1(i < l); i++) {
      _$jscoverage['/base/selector.js'].lineData[33]++;
      if (visit330_33_1(f(self[i], i) === false)) {
        _$jscoverage['/base/selector.js'].lineData[34]++;
        break;
      }
    }
  }
  _$jscoverage['/base/selector.js'].lineData[39]++;
  function checkSelectorAndReturn(selector) {
    _$jscoverage['/base/selector.js'].functionData[2]++;
    _$jscoverage['/base/selector.js'].lineData[40]++;
    var name = selector.substr(1);
    _$jscoverage['/base/selector.js'].lineData[41]++;
    if (visit331_41_1(!name)) {
      _$jscoverage['/base/selector.js'].lineData[42]++;
      throw new Error('An invalid or illegal string was specified for selector.');
    }
    _$jscoverage['/base/selector.js'].lineData[44]++;
    return name;
  }
  _$jscoverage['/base/selector.js'].lineData[47]++;
  function makeMatch(selector) {
    _$jscoverage['/base/selector.js'].functionData[3]++;
    _$jscoverage['/base/selector.js'].lineData[48]++;
    var s = selector.charAt(0);
    _$jscoverage['/base/selector.js'].lineData[49]++;
    if (visit332_49_1(s === '#')) {
      _$jscoverage['/base/selector.js'].lineData[50]++;
      return makeIdMatch(checkSelectorAndReturn(selector));
    } else {
      _$jscoverage['/base/selector.js'].lineData[51]++;
      if (visit333_51_1(s === '.')) {
        _$jscoverage['/base/selector.js'].lineData[52]++;
        return makeClassMatch(checkSelectorAndReturn(selector));
      } else {
        _$jscoverage['/base/selector.js'].lineData[54]++;
        return makeTagMatch(selector);
      }
    }
  }
  _$jscoverage['/base/selector.js'].lineData[58]++;
  function makeIdMatch(id) {
    _$jscoverage['/base/selector.js'].functionData[4]++;
    _$jscoverage['/base/selector.js'].lineData[59]++;
    return function(elem) {
  _$jscoverage['/base/selector.js'].functionData[5]++;
  _$jscoverage['/base/selector.js'].lineData[60]++;
  var match = Dom._getElementById(id, doc);
  _$jscoverage['/base/selector.js'].lineData[61]++;
  return visit334_61_1(match && Dom._contains(elem, match)) ? [match] : [];
};
  }
  _$jscoverage['/base/selector.js'].lineData[65]++;
  function makeClassMatch(className) {
    _$jscoverage['/base/selector.js'].functionData[6]++;
    _$jscoverage['/base/selector.js'].lineData[66]++;
    return function(elem) {
  _$jscoverage['/base/selector.js'].functionData[7]++;
  _$jscoverage['/base/selector.js'].lineData[67]++;
  return elem.getElementsByClassName(className);
};
  }
  _$jscoverage['/base/selector.js'].lineData[71]++;
  function makeTagMatch(tagName) {
    _$jscoverage['/base/selector.js'].functionData[8]++;
    _$jscoverage['/base/selector.js'].lineData[72]++;
    return function(elem) {
  _$jscoverage['/base/selector.js'].functionData[9]++;
  _$jscoverage['/base/selector.js'].lineData[73]++;
  return elem.getElementsByTagName(tagName);
};
  }
  _$jscoverage['/base/selector.js'].lineData[78]++;
  function isSimpleSelector(selector) {
    _$jscoverage['/base/selector.js'].functionData[10]++;
    _$jscoverage['/base/selector.js'].lineData[79]++;
    var complexReg = /,|\+|=|~|\[|\]|:|>|\||\$|\^|\*|\(|\)|[\w-]+\.[\w-]+|[\w-]+#[\w-]+/;
    _$jscoverage['/base/selector.js'].lineData[80]++;
    return !selector.match(complexReg);
  }
  _$jscoverage['/base/selector.js'].lineData[83]++;
  function query(selector, context) {
    _$jscoverage['/base/selector.js'].functionData[11]++;
    _$jscoverage['/base/selector.js'].lineData[84]++;
    var ret, i, el, simpleContext, isSelectorString = visit335_88_1(typeof selector === 'string'), contexts = visit336_89_1(context !== undefined) ? query(context) : visit337_89_2((simpleContext = 1) && [doc]), contextsLen = contexts.length;
    _$jscoverage['/base/selector.js'].lineData[93]++;
    if (visit338_93_1(!selector)) {
      _$jscoverage['/base/selector.js'].lineData[94]++;
      ret = [];
    } else {
      _$jscoverage['/base/selector.js'].lineData[95]++;
      if (visit339_95_1(isSelectorString)) {
        _$jscoverage['/base/selector.js'].lineData[96]++;
        selector = trim(selector);
        _$jscoverage['/base/selector.js'].lineData[98]++;
        if (visit340_98_1(simpleContext)) {
          _$jscoverage['/base/selector.js'].lineData[100]++;
          if (visit341_100_1(selector === 'body')) {
            _$jscoverage['/base/selector.js'].lineData[101]++;
            ret = [doc.body];
          } else {
            _$jscoverage['/base/selector.js'].lineData[102]++;
            if (visit342_102_1(rClassSelector.test(selector) && supportGetElementsByClassName)) {
              _$jscoverage['/base/selector.js'].lineData[104]++;
              ret = makeArray(doc.getElementsByClassName(RegExp.$1));
            } else {
              _$jscoverage['/base/selector.js'].lineData[105]++;
              if (visit343_105_1(rTagIdSelector.test(selector))) {
                _$jscoverage['/base/selector.js'].lineData[107]++;
                el = Dom._getElementById(RegExp.$2, doc);
                _$jscoverage['/base/selector.js'].lineData[108]++;
                ret = visit344_108_1(el && visit345_108_2(el.nodeName.toLowerCase() === RegExp.$1)) ? [el] : [];
              } else {
                _$jscoverage['/base/selector.js'].lineData[109]++;
                if (visit346_109_1(rIdSelector.test(selector))) {
                  _$jscoverage['/base/selector.js'].lineData[111]++;
                  el = Dom._getElementById(selector.substr(1), doc);
                  _$jscoverage['/base/selector.js'].lineData[112]++;
                  ret = el ? [el] : [];
                } else {
                  _$jscoverage['/base/selector.js'].lineData[113]++;
                  if (visit347_113_1(rTagSelector.test(selector))) {
                    _$jscoverage['/base/selector.js'].lineData[115]++;
                    ret = makeArray(doc.getElementsByTagName(selector));
                  } else {
                    _$jscoverage['/base/selector.js'].lineData[116]++;
                    if (visit348_116_1(isSimpleSelector(selector) && supportGetElementsByClassName)) {
                      _$jscoverage['/base/selector.js'].lineData[118]++;
                      var parts = selector.split(/\s+/), partsLen, parents = contexts, parentIndex, parentsLen;
                      _$jscoverage['/base/selector.js'].lineData[124]++;
                      for (i = 0 , partsLen = parts.length; visit349_124_1(i < partsLen); i++) {
                        _$jscoverage['/base/selector.js'].lineData[125]++;
                        parts[i] = makeMatch(parts[i]);
                      }
                      _$jscoverage['/base/selector.js'].lineData[128]++;
                      for (i = 0 , partsLen = parts.length; visit350_128_1(i < partsLen); i++) {
                        _$jscoverage['/base/selector.js'].lineData[129]++;
                        var part = parts[i], newParents = [], matches;
                        _$jscoverage['/base/selector.js'].lineData[133]++;
                        for (parentIndex = 0 , parentsLen = parents.length; visit351_134_1(parentIndex < parentsLen); parentIndex++) {
                          _$jscoverage['/base/selector.js'].lineData[136]++;
                          matches = part(parents[parentIndex]);
                          _$jscoverage['/base/selector.js'].lineData[137]++;
                          newParents.push.apply(newParents, makeArray(matches));
                        }
                        _$jscoverage['/base/selector.js'].lineData[140]++;
                        parents = newParents;
                        _$jscoverage['/base/selector.js'].lineData[141]++;
                        if (visit352_141_1(!parents.length)) {
                          _$jscoverage['/base/selector.js'].lineData[142]++;
                          break;
                        }
                      }
                      _$jscoverage['/base/selector.js'].lineData[145]++;
                      ret = visit353_145_1(parents && visit354_145_2(parents.length > 1)) ? Dom.unique(parents) : parents;
                    }
                  }
                }
              }
            }
          }
        }
        _$jscoverage['/base/selector.js'].lineData[149]++;
        if (visit355_149_1(!ret)) {
          _$jscoverage['/base/selector.js'].lineData[150]++;
          ret = [];
          _$jscoverage['/base/selector.js'].lineData[151]++;
          for (i = 0; visit356_151_1(i < contextsLen); i++) {
            _$jscoverage['/base/selector.js'].lineData[152]++;
            push.apply(ret, Dom._selectInternal(selector, contexts[i]));
          }
          _$jscoverage['/base/selector.js'].lineData[155]++;
          if (visit357_155_1(visit358_155_2(ret.length > 1) && visit359_155_3(contextsLen > 1))) {
            _$jscoverage['/base/selector.js'].lineData[156]++;
            Dom.unique(ret);
          }
        }
      } else {
        _$jscoverage['/base/selector.js'].lineData[164]++;
        if (visit360_164_1(selector.nodeType || S.isWindow(selector))) {
          _$jscoverage['/base/selector.js'].lineData[165]++;
          ret = [selector];
        } else {
          _$jscoverage['/base/selector.js'].lineData[166]++;
          if (visit361_166_1(selector.getDOMNodes)) {
            _$jscoverage['/base/selector.js'].lineData[168]++;
            ret = selector.getDOMNodes();
          } else {
            _$jscoverage['/base/selector.js'].lineData[169]++;
            if (visit362_169_1(isArray(selector))) {
              _$jscoverage['/base/selector.js'].lineData[173]++;
              ret = selector;
            } else {
              _$jscoverage['/base/selector.js'].lineData[174]++;
              if (visit363_174_1(isDomNodeList(selector))) {
                _$jscoverage['/base/selector.js'].lineData[180]++;
                ret = makeArray(selector);
              } else {
                _$jscoverage['/base/selector.js'].lineData[182]++;
                ret = [selector];
              }
            }
          }
        }
        _$jscoverage['/base/selector.js'].lineData[185]++;
        if (visit364_185_1(!simpleContext)) {
          _$jscoverage['/base/selector.js'].lineData[186]++;
          var tmp = ret, ci, len = tmp.length;
          _$jscoverage['/base/selector.js'].lineData[189]++;
          ret = [];
          _$jscoverage['/base/selector.js'].lineData[190]++;
          for (i = 0; visit365_190_1(i < len); i++) {
            _$jscoverage['/base/selector.js'].lineData[191]++;
            for (ci = 0; visit366_191_1(ci < contextsLen); ci++) {
              _$jscoverage['/base/selector.js'].lineData[192]++;
              if (visit367_192_1(Dom._contains(contexts[ci], tmp[i]))) {
                _$jscoverage['/base/selector.js'].lineData[193]++;
                ret.push(tmp[i]);
                _$jscoverage['/base/selector.js'].lineData[194]++;
                break;
              }
            }
          }
        }
      }
    }
    _$jscoverage['/base/selector.js'].lineData[202]++;
    ret.each = queryEach;
    _$jscoverage['/base/selector.js'].lineData[204]++;
    return ret;
  }
  _$jscoverage['/base/selector.js'].lineData[207]++;
  function hasSingleClass(el, cls) {
    _$jscoverage['/base/selector.js'].functionData[12]++;
    _$jscoverage['/base/selector.js'].lineData[210]++;
    var className = visit368_210_1(el && getAttr(el, 'class'));
    _$jscoverage['/base/selector.js'].lineData[211]++;
    return visit369_211_1(className && visit370_211_2((className = className.replace(/[\r\t\n]/g, SPACE)) && visit371_212_1((SPACE + className + SPACE).indexOf(SPACE + cls + SPACE) > -1)));
  }
  _$jscoverage['/base/selector.js'].lineData[215]++;
  function getAttr(el, name) {
    _$jscoverage['/base/selector.js'].functionData[13]++;
    _$jscoverage['/base/selector.js'].lineData[216]++;
    var ret = visit372_216_1(el && el.getAttributeNode(name));
    _$jscoverage['/base/selector.js'].lineData[217]++;
    if (visit373_217_1(ret && ret.specified)) {
      _$jscoverage['/base/selector.js'].lineData[218]++;
      return ret.nodeValue;
    }
    _$jscoverage['/base/selector.js'].lineData[220]++;
    return undefined;
  }
  _$jscoverage['/base/selector.js'].lineData[223]++;
  function isTag(el, value) {
    _$jscoverage['/base/selector.js'].functionData[14]++;
    _$jscoverage['/base/selector.js'].lineData[224]++;
    return visit374_224_1(visit375_224_2(value === '*') || visit376_224_3(el.nodeName.toLowerCase() === value.toLowerCase()));
  }
  _$jscoverage['/base/selector.js'].lineData[227]++;
  S.mix(Dom, {
  _compareNodeOrder: function(a, b) {
  _$jscoverage['/base/selector.js'].functionData[15]++;
  _$jscoverage['/base/selector.js'].lineData[235]++;
  if (visit377_235_1(!a.compareDocumentPosition || !b.compareDocumentPosition)) {
    _$jscoverage['/base/selector.js'].lineData[236]++;
    return a.compareDocumentPosition ? -1 : 1;
  }
  _$jscoverage['/base/selector.js'].lineData[238]++;
  var bit = a.compareDocumentPosition(b) & 4;
  _$jscoverage['/base/selector.js'].lineData[239]++;
  return bit ? -1 : 1;
}, 
  _getElementsByTagName: function(name, context) {
  _$jscoverage['/base/selector.js'].functionData[16]++;
  _$jscoverage['/base/selector.js'].lineData[244]++;
  return makeArray(context.querySelectorAll(name));
}, 
  _getElementById: function(id, doc) {
  _$jscoverage['/base/selector.js'].functionData[17]++;
  _$jscoverage['/base/selector.js'].lineData[248]++;
  return doc.getElementById(id);
}, 
  _getSimpleAttr: getAttr, 
  _isTag: isTag, 
  _hasSingleClass: hasSingleClass, 
  _matchesInternal: function(str, seeds) {
  _$jscoverage['/base/selector.js'].functionData[18]++;
  _$jscoverage['/base/selector.js'].lineData[258]++;
  var ret = [], i = 0, n, len = seeds.length;
  _$jscoverage['/base/selector.js'].lineData[262]++;
  for (; visit378_262_1(i < len); i++) {
    _$jscoverage['/base/selector.js'].lineData[263]++;
    n = seeds[i];
    _$jscoverage['/base/selector.js'].lineData[264]++;
    if (visit379_264_1(matches.call(n, str))) {
      _$jscoverage['/base/selector.js'].lineData[265]++;
      ret.push(n);
    }
  }
  _$jscoverage['/base/selector.js'].lineData[268]++;
  return ret;
}, 
  _selectInternal: function(str, context) {
  _$jscoverage['/base/selector.js'].functionData[19]++;
  _$jscoverage['/base/selector.js'].lineData[272]++;
  return makeArray(context.querySelectorAll(str));
}, 
  query: query, 
  get: function(selector, context) {
  _$jscoverage['/base/selector.js'].functionData[20]++;
  _$jscoverage['/base/selector.js'].lineData[298]++;
  return visit380_298_1(query(selector, context)[0] || null);
}, 
  unique: (function() {
  _$jscoverage['/base/selector.js'].functionData[21]++;
  _$jscoverage['/base/selector.js'].lineData[310]++;
  var hasDuplicate, baseHasDuplicate = true;
  _$jscoverage['/base/selector.js'].lineData[317]++;
  [0, 0].sort(function() {
  _$jscoverage['/base/selector.js'].functionData[22]++;
  _$jscoverage['/base/selector.js'].lineData[318]++;
  baseHasDuplicate = false;
  _$jscoverage['/base/selector.js'].lineData[319]++;
  return 0;
});
  _$jscoverage['/base/selector.js'].lineData[322]++;
  function sortOrder(a, b) {
    _$jscoverage['/base/selector.js'].functionData[23]++;
    _$jscoverage['/base/selector.js'].lineData[323]++;
    if (visit381_323_1(a === b)) {
      _$jscoverage['/base/selector.js'].lineData[324]++;
      hasDuplicate = true;
      _$jscoverage['/base/selector.js'].lineData[325]++;
      return 0;
    }
    _$jscoverage['/base/selector.js'].lineData[328]++;
    return Dom._compareNodeOrder(a, b);
  }
  _$jscoverage['/base/selector.js'].lineData[332]++;
  return function(elements) {
  _$jscoverage['/base/selector.js'].functionData[24]++;
  _$jscoverage['/base/selector.js'].lineData[334]++;
  hasDuplicate = baseHasDuplicate;
  _$jscoverage['/base/selector.js'].lineData[335]++;
  elements.sort(sortOrder);
  _$jscoverage['/base/selector.js'].lineData[337]++;
  if (visit382_337_1(hasDuplicate)) {
    _$jscoverage['/base/selector.js'].lineData[338]++;
    var i = 1, len = elements.length;
    _$jscoverage['/base/selector.js'].lineData[339]++;
    while (visit383_339_1(i < len)) {
      _$jscoverage['/base/selector.js'].lineData[340]++;
      if (visit384_340_1(elements[i] === elements[i - 1])) {
        _$jscoverage['/base/selector.js'].lineData[341]++;
        elements.splice(i, 1);
        _$jscoverage['/base/selector.js'].lineData[342]++;
        --len;
      } else {
        _$jscoverage['/base/selector.js'].lineData[344]++;
        i++;
      }
    }
  }
  _$jscoverage['/base/selector.js'].lineData[349]++;
  return elements;
};
})(), 
  filter: function(selector, filter, context) {
  _$jscoverage['/base/selector.js'].functionData[25]++;
  _$jscoverage['/base/selector.js'].lineData[362]++;
  var elems = query(selector, context), id, tag, match, cls, ret = [];
  _$jscoverage['/base/selector.js'].lineData[369]++;
  if (visit385_369_1(visit386_369_2(typeof filter === 'string') && visit387_370_1((filter = trim(filter)) && (match = rSimpleSelector.exec(filter))))) {
    _$jscoverage['/base/selector.js'].lineData[372]++;
    id = match[1];
    _$jscoverage['/base/selector.js'].lineData[373]++;
    tag = match[2];
    _$jscoverage['/base/selector.js'].lineData[374]++;
    cls = match[3];
    _$jscoverage['/base/selector.js'].lineData[375]++;
    if (visit388_375_1(!id)) {
      _$jscoverage['/base/selector.js'].lineData[376]++;
      filter = function(elem) {
  _$jscoverage['/base/selector.js'].functionData[26]++;
  _$jscoverage['/base/selector.js'].lineData[377]++;
  var tagRe = true, clsRe = true;
  _$jscoverage['/base/selector.js'].lineData[381]++;
  if (visit389_381_1(tag)) {
    _$jscoverage['/base/selector.js'].lineData[382]++;
    tagRe = isTag(elem, tag);
  }
  _$jscoverage['/base/selector.js'].lineData[386]++;
  if (visit390_386_1(cls)) {
    _$jscoverage['/base/selector.js'].lineData[387]++;
    clsRe = hasSingleClass(elem, cls);
  }
  _$jscoverage['/base/selector.js'].lineData[390]++;
  return visit391_390_1(clsRe && tagRe);
};
    } else {
      _$jscoverage['/base/selector.js'].lineData[392]++;
      if (visit392_392_1(id && visit393_392_2(!tag && !cls))) {
        _$jscoverage['/base/selector.js'].lineData[393]++;
        filter = function(elem) {
  _$jscoverage['/base/selector.js'].functionData[27]++;
  _$jscoverage['/base/selector.js'].lineData[394]++;
  return visit394_394_1(getAttr(elem, 'id') === id);
};
      }
    }
  }
  _$jscoverage['/base/selector.js'].lineData[399]++;
  if (visit395_399_1(typeof filter === 'function')) {
    _$jscoverage['/base/selector.js'].lineData[400]++;
    ret = S.filter(elems, filter);
  } else {
    _$jscoverage['/base/selector.js'].lineData[402]++;
    ret = Dom._matchesInternal(filter, elems);
  }
  _$jscoverage['/base/selector.js'].lineData[405]++;
  return ret;
}, 
  test: function(selector, filter, context) {
  _$jscoverage['/base/selector.js'].functionData[28]++;
  _$jscoverage['/base/selector.js'].lineData[417]++;
  var elements = query(selector, context);
  _$jscoverage['/base/selector.js'].lineData[418]++;
  return visit396_418_1(elements.length && (visit397_418_2(Dom.filter(elements, filter, context).length === elements.length)));
}});
  _$jscoverage['/base/selector.js'].lineData[422]++;
  return Dom;
});
