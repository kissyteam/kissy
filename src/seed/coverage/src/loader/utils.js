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
if (! _$jscoverage['/loader/utils.js']) {
  _$jscoverage['/loader/utils.js'] = {};
  _$jscoverage['/loader/utils.js'].lineData = [];
  _$jscoverage['/loader/utils.js'].lineData[6] = 0;
  _$jscoverage['/loader/utils.js'].lineData[7] = 0;
  _$jscoverage['/loader/utils.js'].lineData[29] = 0;
  _$jscoverage['/loader/utils.js'].lineData[30] = 0;
  _$jscoverage['/loader/utils.js'].lineData[31] = 0;
  _$jscoverage['/loader/utils.js'].lineData[33] = 0;
  _$jscoverage['/loader/utils.js'].lineData[36] = 0;
  _$jscoverage['/loader/utils.js'].lineData[37] = 0;
  _$jscoverage['/loader/utils.js'].lineData[39] = 0;
  _$jscoverage['/loader/utils.js'].lineData[43] = 0;
  _$jscoverage['/loader/utils.js'].lineData[45] = 0;
  _$jscoverage['/loader/utils.js'].lineData[46] = 0;
  _$jscoverage['/loader/utils.js'].lineData[48] = 0;
  _$jscoverage['/loader/utils.js'].lineData[51] = 0;
  _$jscoverage['/loader/utils.js'].lineData[52] = 0;
  _$jscoverage['/loader/utils.js'].lineData[53] = 0;
  _$jscoverage['/loader/utils.js'].lineData[54] = 0;
  _$jscoverage['/loader/utils.js'].lineData[55] = 0;
  _$jscoverage['/loader/utils.js'].lineData[56] = 0;
  _$jscoverage['/loader/utils.js'].lineData[59] = 0;
  _$jscoverage['/loader/utils.js'].lineData[61] = 0;
  _$jscoverage['/loader/utils.js'].lineData[66] = 0;
  _$jscoverage['/loader/utils.js'].lineData[69] = 0;
  _$jscoverage['/loader/utils.js'].lineData[75] = 0;
  _$jscoverage['/loader/utils.js'].lineData[85] = 0;
  _$jscoverage['/loader/utils.js'].lineData[87] = 0;
  _$jscoverage['/loader/utils.js'].lineData[88] = 0;
  _$jscoverage['/loader/utils.js'].lineData[91] = 0;
  _$jscoverage['/loader/utils.js'].lineData[92] = 0;
  _$jscoverage['/loader/utils.js'].lineData[94] = 0;
  _$jscoverage['/loader/utils.js'].lineData[97] = 0;
  _$jscoverage['/loader/utils.js'].lineData[100] = 0;
  _$jscoverage['/loader/utils.js'].lineData[101] = 0;
  _$jscoverage['/loader/utils.js'].lineData[103] = 0;
  _$jscoverage['/loader/utils.js'].lineData[112] = 0;
  _$jscoverage['/loader/utils.js'].lineData[113] = 0;
  _$jscoverage['/loader/utils.js'].lineData[125] = 0;
  _$jscoverage['/loader/utils.js'].lineData[127] = 0;
  _$jscoverage['/loader/utils.js'].lineData[130] = 0;
  _$jscoverage['/loader/utils.js'].lineData[131] = 0;
  _$jscoverage['/loader/utils.js'].lineData[135] = 0;
  _$jscoverage['/loader/utils.js'].lineData[140] = 0;
  _$jscoverage['/loader/utils.js'].lineData[150] = 0;
  _$jscoverage['/loader/utils.js'].lineData[160] = 0;
  _$jscoverage['/loader/utils.js'].lineData[166] = 0;
  _$jscoverage['/loader/utils.js'].lineData[167] = 0;
  _$jscoverage['/loader/utils.js'].lineData[168] = 0;
  _$jscoverage['/loader/utils.js'].lineData[169] = 0;
  _$jscoverage['/loader/utils.js'].lineData[170] = 0;
  _$jscoverage['/loader/utils.js'].lineData[171] = 0;
  _$jscoverage['/loader/utils.js'].lineData[172] = 0;
  _$jscoverage['/loader/utils.js'].lineData[174] = 0;
  _$jscoverage['/loader/utils.js'].lineData[175] = 0;
  _$jscoverage['/loader/utils.js'].lineData[177] = 0;
  _$jscoverage['/loader/utils.js'].lineData[180] = 0;
  _$jscoverage['/loader/utils.js'].lineData[184] = 0;
  _$jscoverage['/loader/utils.js'].lineData[193] = 0;
  _$jscoverage['/loader/utils.js'].lineData[195] = 0;
  _$jscoverage['/loader/utils.js'].lineData[196] = 0;
  _$jscoverage['/loader/utils.js'].lineData[202] = 0;
  _$jscoverage['/loader/utils.js'].lineData[204] = 0;
  _$jscoverage['/loader/utils.js'].lineData[205] = 0;
  _$jscoverage['/loader/utils.js'].lineData[209] = 0;
  _$jscoverage['/loader/utils.js'].lineData[210] = 0;
  _$jscoverage['/loader/utils.js'].lineData[211] = 0;
  _$jscoverage['/loader/utils.js'].lineData[213] = 0;
  _$jscoverage['/loader/utils.js'].lineData[217] = 0;
  _$jscoverage['/loader/utils.js'].lineData[220] = 0;
  _$jscoverage['/loader/utils.js'].lineData[221] = 0;
  _$jscoverage['/loader/utils.js'].lineData[223] = 0;
  _$jscoverage['/loader/utils.js'].lineData[224] = 0;
  _$jscoverage['/loader/utils.js'].lineData[226] = 0;
  _$jscoverage['/loader/utils.js'].lineData[227] = 0;
  _$jscoverage['/loader/utils.js'].lineData[228] = 0;
  _$jscoverage['/loader/utils.js'].lineData[229] = 0;
  _$jscoverage['/loader/utils.js'].lineData[231] = 0;
  _$jscoverage['/loader/utils.js'].lineData[232] = 0;
  _$jscoverage['/loader/utils.js'].lineData[234] = 0;
  _$jscoverage['/loader/utils.js'].lineData[235] = 0;
  _$jscoverage['/loader/utils.js'].lineData[237] = 0;
  _$jscoverage['/loader/utils.js'].lineData[238] = 0;
  _$jscoverage['/loader/utils.js'].lineData[239] = 0;
  _$jscoverage['/loader/utils.js'].lineData[240] = 0;
  _$jscoverage['/loader/utils.js'].lineData[241] = 0;
  _$jscoverage['/loader/utils.js'].lineData[243] = 0;
  _$jscoverage['/loader/utils.js'].lineData[246] = 0;
  _$jscoverage['/loader/utils.js'].lineData[248] = 0;
  _$jscoverage['/loader/utils.js'].lineData[249] = 0;
  _$jscoverage['/loader/utils.js'].lineData[252] = 0;
  _$jscoverage['/loader/utils.js'].lineData[261] = 0;
  _$jscoverage['/loader/utils.js'].lineData[264] = 0;
  _$jscoverage['/loader/utils.js'].lineData[265] = 0;
  _$jscoverage['/loader/utils.js'].lineData[266] = 0;
  _$jscoverage['/loader/utils.js'].lineData[268] = 0;
  _$jscoverage['/loader/utils.js'].lineData[270] = 0;
  _$jscoverage['/loader/utils.js'].lineData[272] = 0;
  _$jscoverage['/loader/utils.js'].lineData[273] = 0;
  _$jscoverage['/loader/utils.js'].lineData[283] = 0;
  _$jscoverage['/loader/utils.js'].lineData[286] = 0;
  _$jscoverage['/loader/utils.js'].lineData[290] = 0;
  _$jscoverage['/loader/utils.js'].lineData[293] = 0;
  _$jscoverage['/loader/utils.js'].lineData[295] = 0;
  _$jscoverage['/loader/utils.js'].lineData[299] = 0;
  _$jscoverage['/loader/utils.js'].lineData[302] = 0;
  _$jscoverage['/loader/utils.js'].lineData[311] = 0;
  _$jscoverage['/loader/utils.js'].lineData[312] = 0;
  _$jscoverage['/loader/utils.js'].lineData[314] = 0;
  _$jscoverage['/loader/utils.js'].lineData[329] = 0;
  _$jscoverage['/loader/utils.js'].lineData[340] = 0;
  _$jscoverage['/loader/utils.js'].lineData[347] = 0;
  _$jscoverage['/loader/utils.js'].lineData[348] = 0;
  _$jscoverage['/loader/utils.js'].lineData[349] = 0;
  _$jscoverage['/loader/utils.js'].lineData[350] = 0;
  _$jscoverage['/loader/utils.js'].lineData[351] = 0;
  _$jscoverage['/loader/utils.js'].lineData[352] = 0;
  _$jscoverage['/loader/utils.js'].lineData[353] = 0;
  _$jscoverage['/loader/utils.js'].lineData[354] = 0;
  _$jscoverage['/loader/utils.js'].lineData[357] = 0;
  _$jscoverage['/loader/utils.js'].lineData[361] = 0;
  _$jscoverage['/loader/utils.js'].lineData[372] = 0;
  _$jscoverage['/loader/utils.js'].lineData[373] = 0;
  _$jscoverage['/loader/utils.js'].lineData[375] = 0;
  _$jscoverage['/loader/utils.js'].lineData[378] = 0;
  _$jscoverage['/loader/utils.js'].lineData[379] = 0;
  _$jscoverage['/loader/utils.js'].lineData[384] = 0;
  _$jscoverage['/loader/utils.js'].lineData[385] = 0;
  _$jscoverage['/loader/utils.js'].lineData[387] = 0;
  _$jscoverage['/loader/utils.js'].lineData[398] = 0;
  _$jscoverage['/loader/utils.js'].lineData[400] = 0;
  _$jscoverage['/loader/utils.js'].lineData[403] = 0;
  _$jscoverage['/loader/utils.js'].lineData[404] = 0;
  _$jscoverage['/loader/utils.js'].lineData[405] = 0;
  _$jscoverage['/loader/utils.js'].lineData[409] = 0;
  _$jscoverage['/loader/utils.js'].lineData[411] = 0;
  _$jscoverage['/loader/utils.js'].lineData[415] = 0;
  _$jscoverage['/loader/utils.js'].lineData[421] = 0;
  _$jscoverage['/loader/utils.js'].lineData[430] = 0;
  _$jscoverage['/loader/utils.js'].lineData[432] = 0;
  _$jscoverage['/loader/utils.js'].lineData[433] = 0;
  _$jscoverage['/loader/utils.js'].lineData[436] = 0;
  _$jscoverage['/loader/utils.js'].lineData[440] = 0;
  _$jscoverage['/loader/utils.js'].lineData[441] = 0;
  _$jscoverage['/loader/utils.js'].lineData[447] = 0;
  _$jscoverage['/loader/utils.js'].lineData[448] = 0;
  _$jscoverage['/loader/utils.js'].lineData[450] = 0;
  _$jscoverage['/loader/utils.js'].lineData[454] = 0;
  _$jscoverage['/loader/utils.js'].lineData[459] = 0;
  _$jscoverage['/loader/utils.js'].lineData[460] = 0;
  _$jscoverage['/loader/utils.js'].lineData[462] = 0;
  _$jscoverage['/loader/utils.js'].lineData[463] = 0;
  _$jscoverage['/loader/utils.js'].lineData[466] = 0;
  _$jscoverage['/loader/utils.js'].lineData[470] = 0;
  _$jscoverage['/loader/utils.js'].lineData[471] = 0;
  _$jscoverage['/loader/utils.js'].lineData[474] = 0;
  _$jscoverage['/loader/utils.js'].lineData[475] = 0;
  _$jscoverage['/loader/utils.js'].lineData[476] = 0;
  _$jscoverage['/loader/utils.js'].lineData[477] = 0;
  _$jscoverage['/loader/utils.js'].lineData[478] = 0;
  _$jscoverage['/loader/utils.js'].lineData[481] = 0;
}
if (! _$jscoverage['/loader/utils.js'].functionData) {
  _$jscoverage['/loader/utils.js'].functionData = [];
  _$jscoverage['/loader/utils.js'].functionData[0] = 0;
  _$jscoverage['/loader/utils.js'].functionData[1] = 0;
  _$jscoverage['/loader/utils.js'].functionData[2] = 0;
  _$jscoverage['/loader/utils.js'].functionData[3] = 0;
  _$jscoverage['/loader/utils.js'].functionData[4] = 0;
  _$jscoverage['/loader/utils.js'].functionData[5] = 0;
  _$jscoverage['/loader/utils.js'].functionData[6] = 0;
  _$jscoverage['/loader/utils.js'].functionData[7] = 0;
  _$jscoverage['/loader/utils.js'].functionData[8] = 0;
  _$jscoverage['/loader/utils.js'].functionData[9] = 0;
  _$jscoverage['/loader/utils.js'].functionData[10] = 0;
  _$jscoverage['/loader/utils.js'].functionData[11] = 0;
  _$jscoverage['/loader/utils.js'].functionData[12] = 0;
  _$jscoverage['/loader/utils.js'].functionData[13] = 0;
  _$jscoverage['/loader/utils.js'].functionData[14] = 0;
  _$jscoverage['/loader/utils.js'].functionData[15] = 0;
  _$jscoverage['/loader/utils.js'].functionData[16] = 0;
  _$jscoverage['/loader/utils.js'].functionData[17] = 0;
  _$jscoverage['/loader/utils.js'].functionData[18] = 0;
  _$jscoverage['/loader/utils.js'].functionData[19] = 0;
  _$jscoverage['/loader/utils.js'].functionData[20] = 0;
  _$jscoverage['/loader/utils.js'].functionData[21] = 0;
  _$jscoverage['/loader/utils.js'].functionData[22] = 0;
  _$jscoverage['/loader/utils.js'].functionData[23] = 0;
  _$jscoverage['/loader/utils.js'].functionData[24] = 0;
  _$jscoverage['/loader/utils.js'].functionData[25] = 0;
  _$jscoverage['/loader/utils.js'].functionData[26] = 0;
  _$jscoverage['/loader/utils.js'].functionData[27] = 0;
  _$jscoverage['/loader/utils.js'].functionData[28] = 0;
}
if (! _$jscoverage['/loader/utils.js'].branchData) {
  _$jscoverage['/loader/utils.js'].branchData = {};
  _$jscoverage['/loader/utils.js'].branchData['30'] = [];
  _$jscoverage['/loader/utils.js'].branchData['30'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['36'] = [];
  _$jscoverage['/loader/utils.js'].branchData['36'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['45'] = [];
  _$jscoverage['/loader/utils.js'].branchData['45'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['53'] = [];
  _$jscoverage['/loader/utils.js'].branchData['53'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['59'] = [];
  _$jscoverage['/loader/utils.js'].branchData['59'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['75'] = [];
  _$jscoverage['/loader/utils.js'].branchData['75'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['87'] = [];
  _$jscoverage['/loader/utils.js'].branchData['87'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['91'] = [];
  _$jscoverage['/loader/utils.js'].branchData['91'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['92'] = [];
  _$jscoverage['/loader/utils.js'].branchData['92'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['100'] = [];
  _$jscoverage['/loader/utils.js'].branchData['100'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['130'] = [];
  _$jscoverage['/loader/utils.js'].branchData['130'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['168'] = [];
  _$jscoverage['/loader/utils.js'].branchData['168'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['168'][2] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['172'] = [];
  _$jscoverage['/loader/utils.js'].branchData['172'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['172'][2] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['172'][3] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['174'] = [];
  _$jscoverage['/loader/utils.js'].branchData['174'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['195'] = [];
  _$jscoverage['/loader/utils.js'].branchData['195'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['202'] = [];
  _$jscoverage['/loader/utils.js'].branchData['202'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['204'] = [];
  _$jscoverage['/loader/utils.js'].branchData['204'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['209'] = [];
  _$jscoverage['/loader/utils.js'].branchData['209'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['210'] = [];
  _$jscoverage['/loader/utils.js'].branchData['210'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['220'] = [];
  _$jscoverage['/loader/utils.js'].branchData['220'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['223'] = [];
  _$jscoverage['/loader/utils.js'].branchData['223'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['227'] = [];
  _$jscoverage['/loader/utils.js'].branchData['227'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['231'] = [];
  _$jscoverage['/loader/utils.js'].branchData['231'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['234'] = [];
  _$jscoverage['/loader/utils.js'].branchData['234'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['237'] = [];
  _$jscoverage['/loader/utils.js'].branchData['237'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['238'] = [];
  _$jscoverage['/loader/utils.js'].branchData['238'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['246'] = [];
  _$jscoverage['/loader/utils.js'].branchData['246'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['265'] = [];
  _$jscoverage['/loader/utils.js'].branchData['265'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['268'] = [];
  _$jscoverage['/loader/utils.js'].branchData['268'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['286'] = [];
  _$jscoverage['/loader/utils.js'].branchData['286'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['293'] = [];
  _$jscoverage['/loader/utils.js'].branchData['293'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['311'] = [];
  _$jscoverage['/loader/utils.js'].branchData['311'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['349'] = [];
  _$jscoverage['/loader/utils.js'].branchData['349'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['350'] = [];
  _$jscoverage['/loader/utils.js'].branchData['350'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['352'] = [];
  _$jscoverage['/loader/utils.js'].branchData['352'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['353'] = [];
  _$jscoverage['/loader/utils.js'].branchData['353'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['373'] = [];
  _$jscoverage['/loader/utils.js'].branchData['373'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['375'] = [];
  _$jscoverage['/loader/utils.js'].branchData['375'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['378'] = [];
  _$jscoverage['/loader/utils.js'].branchData['378'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['384'] = [];
  _$jscoverage['/loader/utils.js'].branchData['384'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['403'] = [];
  _$jscoverage['/loader/utils.js'].branchData['403'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['403'][2] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['432'] = [];
  _$jscoverage['/loader/utils.js'].branchData['432'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['440'] = [];
  _$jscoverage['/loader/utils.js'].branchData['440'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['462'] = [];
  _$jscoverage['/loader/utils.js'].branchData['462'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['475'] = [];
  _$jscoverage['/loader/utils.js'].branchData['475'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['477'] = [];
  _$jscoverage['/loader/utils.js'].branchData['477'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['477'][2] = new BranchData();
}
_$jscoverage['/loader/utils.js'].branchData['477'][2].init(70, 24, 'module.status !== status');
function visit517_477_2(result) {
  _$jscoverage['/loader/utils.js'].branchData['477'][2].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['477'][1].init(59, 35, '!module || module.status !== status');
function visit516_477_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['477'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['475'][1].init(140, 19, 'i < modNames.length');
function visit515_475_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['475'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['462'][1].init(56, 43, 'm = str.match(/^\\s*["\']([^\'"\\s]+)["\']\\s*$/)');
function visit514_462_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['462'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['440'][1].init(21, 9, 'mode || 0');
function visit513_440_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['440'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['432'][1].init(85, 8, '--i > -1');
function visit512_432_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['432'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['403'][2].init(151, 28, 'module.factory !== undefined');
function visit511_403_2(result) {
  _$jscoverage['/loader/utils.js'].branchData['403'][2].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['403'][1].init(141, 38, 'module && module.factory !== undefined');
function visit510_403_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['403'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['384'][1].init(522, 10, 'refModName');
function visit509_384_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['384'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['378'][1].init(143, 11, 'modNames[i]');
function visit508_378_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['378'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['375'][1].init(84, 5, 'i < l');
function visit507_375_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['375'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['373'][1].init(51, 8, 'modNames');
function visit506_373_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['373'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['353'][1].init(34, 9, '!alias[j]');
function visit505_353_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['353'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['352'][1].init(86, 6, 'j >= 0');
function visit504_352_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['352'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['350'][1].init(27, 38, '(m = mods[ret[i]]) && (alias = m.alias)');
function visit503_350_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['350'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['349'][1].init(68, 6, 'i >= 0');
function visit502_349_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['349'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['311'][1].init(18, 27, 'typeof modNames == \'string\'');
function visit501_311_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['311'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['293'][1].init(386, 21, 'exports !== undefined');
function visit500_293_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['293'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['286'][1].init(101, 29, 'typeof factory === \'function\'');
function visit499_286_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['286'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['268'][1].init(232, 5, 'm.cjs');
function visit498_268_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['268'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['265'][1].init(153, 18, 'status == ATTACHED');
function visit497_265_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['265'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['246'][1].init(1001, 108, 'Utils.checkModsLoadRecursively(m.getNormalizedRequires(), runtime, stack, errorList, cache)');
function visit496_246_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['246'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['238'][1].init(22, 25, 'S.inArray(modName, stack)');
function visit495_238_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['238'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['237'][1].init(674, 9, '\'@DEBUG@\'');
function visit494_237_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['237'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['234'][1].init(574, 16, 'status != LOADED');
function visit493_234_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['234'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['231'][1].init(466, 25, 'status >= READY_TO_ATTACH');
function visit492_231_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['231'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['227'][1].init(331, 15, 'status == ERROR');
function visit491_227_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['227'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['223'][1].init(213, 2, '!m');
function visit490_223_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['223'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['220'][1].init(121, 16, 'modName in cache');
function visit489_220_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['220'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['210'][1].init(22, 81, 's && Utils.checkModLoadRecursively(modNames[i], runtime, stack, errorList, cache)');
function visit488_210_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['210'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['209'][1].init(340, 5, 'i < l');
function visit487_209_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['209'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['204'][1].init(176, 11, 'cache || {}');
function visit486_204_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['204'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['202'][1].init(77, 11, 'stack || []');
function visit485_202_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['202'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['195'][1].init(84, 5, 'i < l');
function visit484_195_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['195'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['174'][1].init(295, 5, 'allOk');
function visit483_174_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['174'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['172'][3].init(88, 20, 'm.status == ATTACHED');
function visit482_172_3(result) {
  _$jscoverage['/loader/utils.js'].branchData['172'][3].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['172'][2].init(83, 25, 'm && m.status == ATTACHED');
function visit481_172_2(result) {
  _$jscoverage['/loader/utils.js'].branchData['172'][2].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['172'][1].init(78, 30, 'a && m && m.status == ATTACHED');
function visit480_172_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['172'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['168'][2].init(81, 25, 'module.getType() != \'css\'');
function visit479_168_2(result) {
  _$jscoverage['/loader/utils.js'].branchData['168'][2].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['168'][1].init(70, 36, '!module || module.getType() != \'css\'');
function visit478_168_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['168'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['130'][1].init(150, 6, 'module');
function visit477_130_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['130'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['100'][1].init(476, 5, 'i < l');
function visit476_100_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['100'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['92'][1].init(22, 55, 'startsWith(depName, \'../\') || startsWith(depName, \'./\')');
function visit475_92_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['92'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['91'][1].init(126, 26, 'typeof depName == \'string\'');
function visit474_91_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['91'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['87'][1].init(47, 8, '!depName');
function visit473_87_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['87'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['75'][1].init(21, 58, 'doc.getElementsByTagName(\'head\')[0] || doc.documentElement');
function visit472_75_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['75'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['59'][1].init(26, 12, 'Plugin.alias');
function visit471_59_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['59'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['53'][1].init(54, 11, 'index != -1');
function visit470_53_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['53'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['45'][1].init(40, 29, 's.charAt(s.length - 1) == \'/\'');
function visit469_45_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['45'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['36'][1].init(103, 5, 'i < l');
function visit468_36_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['36'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['30'][1].init(14, 20, 'typeof s == \'string\'');
function visit467_30_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['30'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].lineData[6]++;
(function(S) {
  _$jscoverage['/loader/utils.js'].functionData[0]++;
  _$jscoverage['/loader/utils.js'].lineData[7]++;
  var Loader = S.Loader, Path = S.Path, host = S.Env.host, TRUE = !0, FALSE = !1, startsWith = S.startsWith, data = Loader.Status, ATTACHED = data.ATTACHED, READY_TO_ATTACH = data.READY_TO_ATTACH, LOADED = data.LOADED, ERROR = data.ERROR, Utils = Loader.Utils = {}, doc = host.document;
  _$jscoverage['/loader/utils.js'].lineData[29]++;
  function indexMap(s) {
    _$jscoverage['/loader/utils.js'].functionData[1]++;
    _$jscoverage['/loader/utils.js'].lineData[30]++;
    if (visit467_30_1(typeof s == 'string')) {
      _$jscoverage['/loader/utils.js'].lineData[31]++;
      return indexMapStr(s);
    } else {
      _$jscoverage['/loader/utils.js'].lineData[33]++;
      var ret = [], i = 0, l = s.length;
      _$jscoverage['/loader/utils.js'].lineData[36]++;
      for (; visit468_36_1(i < l); i++) {
        _$jscoverage['/loader/utils.js'].lineData[37]++;
        ret[i] = indexMapStr(s[i]);
      }
      _$jscoverage['/loader/utils.js'].lineData[39]++;
      return ret;
    }
  }
  _$jscoverage['/loader/utils.js'].lineData[43]++;
  function indexMapStr(s) {
    _$jscoverage['/loader/utils.js'].functionData[2]++;
    _$jscoverage['/loader/utils.js'].lineData[45]++;
    if (visit469_45_1(s.charAt(s.length - 1) == '/')) {
      _$jscoverage['/loader/utils.js'].lineData[46]++;
      s += 'index';
    }
    _$jscoverage['/loader/utils.js'].lineData[48]++;
    return s;
  }
  _$jscoverage['/loader/utils.js'].lineData[51]++;
  function pluginAlias(runtime, name) {
    _$jscoverage['/loader/utils.js'].functionData[3]++;
    _$jscoverage['/loader/utils.js'].lineData[52]++;
    var index = name.indexOf('!');
    _$jscoverage['/loader/utils.js'].lineData[53]++;
    if (visit470_53_1(index != -1)) {
      _$jscoverage['/loader/utils.js'].lineData[54]++;
      var pluginName = name.substring(0, index);
      _$jscoverage['/loader/utils.js'].lineData[55]++;
      name = name.substring(index + 1);
      _$jscoverage['/loader/utils.js'].lineData[56]++;
      S.use(pluginName, {
  sync: true, 
  success: function(S, Plugin) {
  _$jscoverage['/loader/utils.js'].functionData[4]++;
  _$jscoverage['/loader/utils.js'].lineData[59]++;
  if (visit471_59_1(Plugin.alias)) {
    _$jscoverage['/loader/utils.js'].lineData[61]++;
    name = Plugin.alias(runtime, name, pluginName);
  }
}});
    }
    _$jscoverage['/loader/utils.js'].lineData[66]++;
    return name;
  }
  _$jscoverage['/loader/utils.js'].lineData[69]++;
  S.mix(Utils, {
  docHead: function() {
  _$jscoverage['/loader/utils.js'].functionData[5]++;
  _$jscoverage['/loader/utils.js'].lineData[75]++;
  return visit472_75_1(doc.getElementsByTagName('head')[0] || doc.documentElement);
}, 
  normalDepModuleName: function(moduleName, depName) {
  _$jscoverage['/loader/utils.js'].functionData[6]++;
  _$jscoverage['/loader/utils.js'].lineData[85]++;
  var i = 0, l;
  _$jscoverage['/loader/utils.js'].lineData[87]++;
  if (visit473_87_1(!depName)) {
    _$jscoverage['/loader/utils.js'].lineData[88]++;
    return depName;
  }
  _$jscoverage['/loader/utils.js'].lineData[91]++;
  if (visit474_91_1(typeof depName == 'string')) {
    _$jscoverage['/loader/utils.js'].lineData[92]++;
    if (visit475_92_1(startsWith(depName, '../') || startsWith(depName, './'))) {
      _$jscoverage['/loader/utils.js'].lineData[94]++;
      return Path.resolve(Path.dirname(moduleName), depName);
    }
    _$jscoverage['/loader/utils.js'].lineData[97]++;
    return Path.normalize(depName);
  }
  _$jscoverage['/loader/utils.js'].lineData[100]++;
  for (l = depName.length; visit476_100_1(i < l); i++) {
    _$jscoverage['/loader/utils.js'].lineData[101]++;
    depName[i] = Utils.normalDepModuleName(moduleName, depName[i]);
  }
  _$jscoverage['/loader/utils.js'].lineData[103]++;
  return depName;
}, 
  createModulesInfo: function(runtime, modNames) {
  _$jscoverage['/loader/utils.js'].functionData[7]++;
  _$jscoverage['/loader/utils.js'].lineData[112]++;
  S.each(modNames, function(m) {
  _$jscoverage['/loader/utils.js'].functionData[8]++;
  _$jscoverage['/loader/utils.js'].lineData[113]++;
  Utils.createModuleInfo(runtime, m);
});
}, 
  createModuleInfo: function(runtime, modName, cfg) {
  _$jscoverage['/loader/utils.js'].functionData[9]++;
  _$jscoverage['/loader/utils.js'].lineData[125]++;
  modName = indexMapStr(modName);
  _$jscoverage['/loader/utils.js'].lineData[127]++;
  var mods = runtime.Env.mods, module = mods[modName];
  _$jscoverage['/loader/utils.js'].lineData[130]++;
  if (visit477_130_1(module)) {
    _$jscoverage['/loader/utils.js'].lineData[131]++;
    return module;
  }
  _$jscoverage['/loader/utils.js'].lineData[135]++;
  mods[modName] = module = new Loader.Module(S.mix({
  name: modName, 
  runtime: runtime}, cfg));
  _$jscoverage['/loader/utils.js'].lineData[140]++;
  return module;
}, 
  'isAttached': function(runtime, modNames) {
  _$jscoverage['/loader/utils.js'].functionData[10]++;
  _$jscoverage['/loader/utils.js'].lineData[150]++;
  return isStatus(runtime, modNames, ATTACHED);
}, 
  getModules: function(runtime, modNames) {
  _$jscoverage['/loader/utils.js'].functionData[11]++;
  _$jscoverage['/loader/utils.js'].lineData[160]++;
  var mods = [runtime], module, unalias, allOk, m, runtimeMods = runtime.Env.mods;
  _$jscoverage['/loader/utils.js'].lineData[166]++;
  S.each(modNames, function(modName) {
  _$jscoverage['/loader/utils.js'].functionData[12]++;
  _$jscoverage['/loader/utils.js'].lineData[167]++;
  module = runtimeMods[modName];
  _$jscoverage['/loader/utils.js'].lineData[168]++;
  if (visit478_168_1(!module || visit479_168_2(module.getType() != 'css'))) {
    _$jscoverage['/loader/utils.js'].lineData[169]++;
    unalias = Utils.unalias(runtime, modName);
    _$jscoverage['/loader/utils.js'].lineData[170]++;
    allOk = S.reduce(unalias, function(a, n) {
  _$jscoverage['/loader/utils.js'].functionData[13]++;
  _$jscoverage['/loader/utils.js'].lineData[171]++;
  m = runtimeMods[n];
  _$jscoverage['/loader/utils.js'].lineData[172]++;
  return visit480_172_1(a && visit481_172_2(m && visit482_172_3(m.status == ATTACHED)));
}, true);
    _$jscoverage['/loader/utils.js'].lineData[174]++;
    if (visit483_174_1(allOk)) {
      _$jscoverage['/loader/utils.js'].lineData[175]++;
      mods.push(runtimeMods[unalias[0]].exports);
    } else {
      _$jscoverage['/loader/utils.js'].lineData[177]++;
      mods.push(null);
    }
  } else {
    _$jscoverage['/loader/utils.js'].lineData[180]++;
    mods.push(undefined);
  }
});
  _$jscoverage['/loader/utils.js'].lineData[184]++;
  return mods;
}, 
  attachModsRecursively: function(modNames, runtime) {
  _$jscoverage['/loader/utils.js'].functionData[14]++;
  _$jscoverage['/loader/utils.js'].lineData[193]++;
  var i, l = modNames.length;
  _$jscoverage['/loader/utils.js'].lineData[195]++;
  for (i = 0; visit484_195_1(i < l); i++) {
    _$jscoverage['/loader/utils.js'].lineData[196]++;
    Utils.attachModRecursively(modNames[i], runtime);
  }
}, 
  checkModsLoadRecursively: function(modNames, runtime, stack, errorList, cache) {
  _$jscoverage['/loader/utils.js'].functionData[15]++;
  _$jscoverage['/loader/utils.js'].lineData[202]++;
  stack = visit485_202_1(stack || []);
  _$jscoverage['/loader/utils.js'].lineData[204]++;
  cache = visit486_204_1(cache || {});
  _$jscoverage['/loader/utils.js'].lineData[205]++;
  var i, s = 1, l = modNames.length, stackDepth = stack.length;
  _$jscoverage['/loader/utils.js'].lineData[209]++;
  for (i = 0; visit487_209_1(i < l); i++) {
    _$jscoverage['/loader/utils.js'].lineData[210]++;
    s = visit488_210_1(s && Utils.checkModLoadRecursively(modNames[i], runtime, stack, errorList, cache));
    _$jscoverage['/loader/utils.js'].lineData[211]++;
    stack.length = stackDepth;
  }
  _$jscoverage['/loader/utils.js'].lineData[213]++;
  return !!s;
}, 
  checkModLoadRecursively: function(modName, runtime, stack, errorList, cache) {
  _$jscoverage['/loader/utils.js'].functionData[16]++;
  _$jscoverage['/loader/utils.js'].lineData[217]++;
  var mods = runtime.Env.mods, status, m = mods[modName];
  _$jscoverage['/loader/utils.js'].lineData[220]++;
  if (visit489_220_1(modName in cache)) {
    _$jscoverage['/loader/utils.js'].lineData[221]++;
    return cache[modName];
  }
  _$jscoverage['/loader/utils.js'].lineData[223]++;
  if (visit490_223_1(!m)) {
    _$jscoverage['/loader/utils.js'].lineData[224]++;
    return cache[modName] = FALSE;
  }
  _$jscoverage['/loader/utils.js'].lineData[226]++;
  status = m.status;
  _$jscoverage['/loader/utils.js'].lineData[227]++;
  if (visit491_227_1(status == ERROR)) {
    _$jscoverage['/loader/utils.js'].lineData[228]++;
    errorList.push(m);
    _$jscoverage['/loader/utils.js'].lineData[229]++;
    return cache[modName] = FALSE;
  }
  _$jscoverage['/loader/utils.js'].lineData[231]++;
  if (visit492_231_1(status >= READY_TO_ATTACH)) {
    _$jscoverage['/loader/utils.js'].lineData[232]++;
    return cache[modName] = TRUE;
  }
  _$jscoverage['/loader/utils.js'].lineData[234]++;
  if (visit493_234_1(status != LOADED)) {
    _$jscoverage['/loader/utils.js'].lineData[235]++;
    return cache[modName] = FALSE;
  }
  _$jscoverage['/loader/utils.js'].lineData[237]++;
  if (visit494_237_1('@DEBUG@')) {
    _$jscoverage['/loader/utils.js'].lineData[238]++;
    if (visit495_238_1(S.inArray(modName, stack))) {
      _$jscoverage['/loader/utils.js'].lineData[239]++;
      stack.push(modName);
      _$jscoverage['/loader/utils.js'].lineData[240]++;
      S.error('find cyclic dependency between mods: ' + stack);
      _$jscoverage['/loader/utils.js'].lineData[241]++;
      return cache[modName] = FALSE;
    }
    _$jscoverage['/loader/utils.js'].lineData[243]++;
    stack.push(modName);
  }
  _$jscoverage['/loader/utils.js'].lineData[246]++;
  if (visit496_246_1(Utils.checkModsLoadRecursively(m.getNormalizedRequires(), runtime, stack, errorList, cache))) {
    _$jscoverage['/loader/utils.js'].lineData[248]++;
    m.status = READY_TO_ATTACH;
    _$jscoverage['/loader/utils.js'].lineData[249]++;
    return cache[modName] = TRUE;
  }
  _$jscoverage['/loader/utils.js'].lineData[252]++;
  return cache[modName] = FALSE;
}, 
  attachModRecursively: function(modName, runtime) {
  _$jscoverage['/loader/utils.js'].functionData[17]++;
  _$jscoverage['/loader/utils.js'].lineData[261]++;
  var mods = runtime.Env.mods, status, m = mods[modName];
  _$jscoverage['/loader/utils.js'].lineData[264]++;
  status = m.status;
  _$jscoverage['/loader/utils.js'].lineData[265]++;
  if (visit497_265_1(status == ATTACHED)) {
    _$jscoverage['/loader/utils.js'].lineData[266]++;
    return;
  }
  _$jscoverage['/loader/utils.js'].lineData[268]++;
  if (visit498_268_1(m.cjs)) {
    _$jscoverage['/loader/utils.js'].lineData[270]++;
    Utils.attachMod(runtime, m);
  } else {
    _$jscoverage['/loader/utils.js'].lineData[272]++;
    Utils.attachModsRecursively(m.getNormalizedRequires(), runtime);
    _$jscoverage['/loader/utils.js'].lineData[273]++;
    Utils.attachMod(runtime, m);
  }
}, 
  attachMod: function(runtime, module) {
  _$jscoverage['/loader/utils.js'].functionData[18]++;
  _$jscoverage['/loader/utils.js'].lineData[283]++;
  var factory = module.factory, exports = undefined;
  _$jscoverage['/loader/utils.js'].lineData[286]++;
  if (visit499_286_1(typeof factory === 'function')) {
    _$jscoverage['/loader/utils.js'].lineData[290]++;
    exports = factory.apply(module, (module.cjs ? [runtime] : Utils.getModules(runtime, module.getRequiresWithAlias())));
    _$jscoverage['/loader/utils.js'].lineData[293]++;
    if (visit500_293_1(exports !== undefined)) {
      _$jscoverage['/loader/utils.js'].lineData[295]++;
      module.exports = exports;
    }
  } else {
    _$jscoverage['/loader/utils.js'].lineData[299]++;
    module.exports = factory;
  }
  _$jscoverage['/loader/utils.js'].lineData[302]++;
  module.status = ATTACHED;
}, 
  getModNamesAsArray: function(modNames) {
  _$jscoverage['/loader/utils.js'].functionData[19]++;
  _$jscoverage['/loader/utils.js'].lineData[311]++;
  if (visit501_311_1(typeof modNames == 'string')) {
    _$jscoverage['/loader/utils.js'].lineData[312]++;
    modNames = modNames.replace(/\s+/g, '').split(',');
  }
  _$jscoverage['/loader/utils.js'].lineData[314]++;
  return modNames;
}, 
  normalizeModNames: function(runtime, modNames, refModName) {
  _$jscoverage['/loader/utils.js'].functionData[20]++;
  _$jscoverage['/loader/utils.js'].lineData[329]++;
  return Utils.unalias(runtime, Utils.normalizeModNamesWithAlias(runtime, modNames, refModName));
}, 
  unalias: function(runtime, names) {
  _$jscoverage['/loader/utils.js'].functionData[21]++;
  _$jscoverage['/loader/utils.js'].lineData[340]++;
  var ret = [].concat(names), i, m, alias, ok = 0, j, mods = runtime['Env'].mods;
  _$jscoverage['/loader/utils.js'].lineData[347]++;
  while (!ok) {
    _$jscoverage['/loader/utils.js'].lineData[348]++;
    ok = 1;
    _$jscoverage['/loader/utils.js'].lineData[349]++;
    for (i = ret.length - 1; visit502_349_1(i >= 0); i--) {
      _$jscoverage['/loader/utils.js'].lineData[350]++;
      if (visit503_350_1((m = mods[ret[i]]) && (alias = m.alias))) {
        _$jscoverage['/loader/utils.js'].lineData[351]++;
        ok = 0;
        _$jscoverage['/loader/utils.js'].lineData[352]++;
        for (j = alias.length - 1; visit504_352_1(j >= 0); j--) {
          _$jscoverage['/loader/utils.js'].lineData[353]++;
          if (visit505_353_1(!alias[j])) {
            _$jscoverage['/loader/utils.js'].lineData[354]++;
            alias.splice(j, 1);
          }
        }
        _$jscoverage['/loader/utils.js'].lineData[357]++;
        ret.splice.apply(ret, [i, 1].concat(indexMap(alias)));
      }
    }
  }
  _$jscoverage['/loader/utils.js'].lineData[361]++;
  return ret;
}, 
  normalizeModNamesWithAlias: function(runtime, modNames, refModName) {
  _$jscoverage['/loader/utils.js'].functionData[22]++;
  _$jscoverage['/loader/utils.js'].lineData[372]++;
  var ret = [], i, l;
  _$jscoverage['/loader/utils.js'].lineData[373]++;
  if (visit506_373_1(modNames)) {
    _$jscoverage['/loader/utils.js'].lineData[375]++;
    for (i = 0 , l = modNames.length; visit507_375_1(i < l); i++) {
      _$jscoverage['/loader/utils.js'].lineData[378]++;
      if (visit508_378_1(modNames[i])) {
        _$jscoverage['/loader/utils.js'].lineData[379]++;
        ret.push(pluginAlias(runtime, indexMap(modNames[i])));
      }
    }
  }
  _$jscoverage['/loader/utils.js'].lineData[384]++;
  if (visit509_384_1(refModName)) {
    _$jscoverage['/loader/utils.js'].lineData[385]++;
    ret = Utils.normalDepModuleName(refModName, ret);
  }
  _$jscoverage['/loader/utils.js'].lineData[387]++;
  return ret;
}, 
  registerModule: function(runtime, name, factory, config) {
  _$jscoverage['/loader/utils.js'].functionData[23]++;
  _$jscoverage['/loader/utils.js'].lineData[398]++;
  name = indexMapStr(name);
  _$jscoverage['/loader/utils.js'].lineData[400]++;
  var mods = runtime.Env.mods, module = mods[name];
  _$jscoverage['/loader/utils.js'].lineData[403]++;
  if (visit510_403_1(module && visit511_403_2(module.factory !== undefined))) {
    _$jscoverage['/loader/utils.js'].lineData[404]++;
    S.log(name + ' is defined more than once', 'warn');
    _$jscoverage['/loader/utils.js'].lineData[405]++;
    return;
  }
  _$jscoverage['/loader/utils.js'].lineData[409]++;
  Utils.createModuleInfo(runtime, name);
  _$jscoverage['/loader/utils.js'].lineData[411]++;
  module = mods[name];
  _$jscoverage['/loader/utils.js'].lineData[415]++;
  S.mix(module, {
  name: name, 
  status: LOADED, 
  factory: factory});
  _$jscoverage['/loader/utils.js'].lineData[421]++;
  S.mix(module, config);
}, 
  getHash: function(str) {
  _$jscoverage['/loader/utils.js'].functionData[24]++;
  _$jscoverage['/loader/utils.js'].lineData[430]++;
  var hash = 5381, i;
  _$jscoverage['/loader/utils.js'].lineData[432]++;
  for (i = str.length; visit512_432_1(--i > -1); ) {
    _$jscoverage['/loader/utils.js'].lineData[433]++;
    hash = ((hash << 5) + hash) + str.charCodeAt(i);
  }
  _$jscoverage['/loader/utils.js'].lineData[436]++;
  return hash + '';
}, 
  getRequiresFromFn: function(fn, mode) {
  _$jscoverage['/loader/utils.js'].functionData[25]++;
  _$jscoverage['/loader/utils.js'].lineData[440]++;
  mode = visit513_440_1(mode || 0);
  _$jscoverage['/loader/utils.js'].lineData[441]++;
  var requires = [];
  _$jscoverage['/loader/utils.js'].lineData[447]++;
  fn.toString().replace(commentRegExp, '').replace(requireRegExp[mode], function(match, dep) {
  _$jscoverage['/loader/utils.js'].functionData[26]++;
  _$jscoverage['/loader/utils.js'].lineData[448]++;
  requires.push(getRequireVal(dep));
});
  _$jscoverage['/loader/utils.js'].lineData[450]++;
  return requires;
}});
  _$jscoverage['/loader/utils.js'].lineData[454]++;
  var commentRegExp = /(\/\*([\s\S]*?)\*\/|([^:]|^)\/\/(.*)$)/mg, requireRegExp = [/[^.'"]\s*module.require\s*\((.+?)\)\s*[;,]/g, /[^.'"]\s*KISSY.require\s*\((.+?)\)\s*[;,]/g];
  _$jscoverage['/loader/utils.js'].lineData[459]++;
  function getRequireVal(str) {
    _$jscoverage['/loader/utils.js'].functionData[27]++;
    _$jscoverage['/loader/utils.js'].lineData[460]++;
    var m;
    _$jscoverage['/loader/utils.js'].lineData[462]++;
    if (visit514_462_1(m = str.match(/^\s*["']([^'"\s]+)["']\s*$/))) {
      _$jscoverage['/loader/utils.js'].lineData[463]++;
      return m[1];
    } else {
      _$jscoverage['/loader/utils.js'].lineData[466]++;
      return new Function('return (' + str + ')')();
    }
  }
  _$jscoverage['/loader/utils.js'].lineData[470]++;
  function isStatus(runtime, modNames, status) {
    _$jscoverage['/loader/utils.js'].functionData[28]++;
    _$jscoverage['/loader/utils.js'].lineData[471]++;
    var mods = runtime.Env.mods, module, i;
    _$jscoverage['/loader/utils.js'].lineData[474]++;
    modNames = S.makeArray(modNames);
    _$jscoverage['/loader/utils.js'].lineData[475]++;
    for (i = 0; visit515_475_1(i < modNames.length); i++) {
      _$jscoverage['/loader/utils.js'].lineData[476]++;
      module = mods[modNames[i]];
      _$jscoverage['/loader/utils.js'].lineData[477]++;
      if (visit516_477_1(!module || visit517_477_2(module.status !== status))) {
        _$jscoverage['/loader/utils.js'].lineData[478]++;
        return 0;
      }
    }
    _$jscoverage['/loader/utils.js'].lineData[481]++;
    return 1;
  }
})(KISSY);
