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
  _$jscoverage['/loader/utils.js'].lineData[27] = 0;
  _$jscoverage['/loader/utils.js'].lineData[28] = 0;
  _$jscoverage['/loader/utils.js'].lineData[29] = 0;
  _$jscoverage['/loader/utils.js'].lineData[31] = 0;
  _$jscoverage['/loader/utils.js'].lineData[34] = 0;
  _$jscoverage['/loader/utils.js'].lineData[35] = 0;
  _$jscoverage['/loader/utils.js'].lineData[37] = 0;
  _$jscoverage['/loader/utils.js'].lineData[41] = 0;
  _$jscoverage['/loader/utils.js'].lineData[43] = 0;
  _$jscoverage['/loader/utils.js'].lineData[44] = 0;
  _$jscoverage['/loader/utils.js'].lineData[46] = 0;
  _$jscoverage['/loader/utils.js'].lineData[49] = 0;
  _$jscoverage['/loader/utils.js'].lineData[50] = 0;
  _$jscoverage['/loader/utils.js'].lineData[51] = 0;
  _$jscoverage['/loader/utils.js'].lineData[52] = 0;
  _$jscoverage['/loader/utils.js'].lineData[53] = 0;
  _$jscoverage['/loader/utils.js'].lineData[54] = 0;
  _$jscoverage['/loader/utils.js'].lineData[57] = 0;
  _$jscoverage['/loader/utils.js'].lineData[59] = 0;
  _$jscoverage['/loader/utils.js'].lineData[64] = 0;
  _$jscoverage['/loader/utils.js'].lineData[67] = 0;
  _$jscoverage['/loader/utils.js'].lineData[73] = 0;
  _$jscoverage['/loader/utils.js'].lineData[83] = 0;
  _$jscoverage['/loader/utils.js'].lineData[85] = 0;
  _$jscoverage['/loader/utils.js'].lineData[86] = 0;
  _$jscoverage['/loader/utils.js'].lineData[89] = 0;
  _$jscoverage['/loader/utils.js'].lineData[90] = 0;
  _$jscoverage['/loader/utils.js'].lineData[92] = 0;
  _$jscoverage['/loader/utils.js'].lineData[95] = 0;
  _$jscoverage['/loader/utils.js'].lineData[98] = 0;
  _$jscoverage['/loader/utils.js'].lineData[99] = 0;
  _$jscoverage['/loader/utils.js'].lineData[101] = 0;
  _$jscoverage['/loader/utils.js'].lineData[110] = 0;
  _$jscoverage['/loader/utils.js'].lineData[111] = 0;
  _$jscoverage['/loader/utils.js'].lineData[123] = 0;
  _$jscoverage['/loader/utils.js'].lineData[125] = 0;
  _$jscoverage['/loader/utils.js'].lineData[128] = 0;
  _$jscoverage['/loader/utils.js'].lineData[129] = 0;
  _$jscoverage['/loader/utils.js'].lineData[133] = 0;
  _$jscoverage['/loader/utils.js'].lineData[138] = 0;
  _$jscoverage['/loader/utils.js'].lineData[148] = 0;
  _$jscoverage['/loader/utils.js'].lineData[158] = 0;
  _$jscoverage['/loader/utils.js'].lineData[164] = 0;
  _$jscoverage['/loader/utils.js'].lineData[165] = 0;
  _$jscoverage['/loader/utils.js'].lineData[166] = 0;
  _$jscoverage['/loader/utils.js'].lineData[167] = 0;
  _$jscoverage['/loader/utils.js'].lineData[168] = 0;
  _$jscoverage['/loader/utils.js'].lineData[169] = 0;
  _$jscoverage['/loader/utils.js'].lineData[170] = 0;
  _$jscoverage['/loader/utils.js'].lineData[172] = 0;
  _$jscoverage['/loader/utils.js'].lineData[173] = 0;
  _$jscoverage['/loader/utils.js'].lineData[175] = 0;
  _$jscoverage['/loader/utils.js'].lineData[178] = 0;
  _$jscoverage['/loader/utils.js'].lineData[182] = 0;
  _$jscoverage['/loader/utils.js'].lineData[196] = 0;
  _$jscoverage['/loader/utils.js'].lineData[198] = 0;
  _$jscoverage['/loader/utils.js'].lineData[199] = 0;
  _$jscoverage['/loader/utils.js'].lineData[203] = 0;
  _$jscoverage['/loader/utils.js'].lineData[204] = 0;
  _$jscoverage['/loader/utils.js'].lineData[205] = 0;
  _$jscoverage['/loader/utils.js'].lineData[207] = 0;
  _$jscoverage['/loader/utils.js'].lineData[220] = 0;
  _$jscoverage['/loader/utils.js'].lineData[223] = 0;
  _$jscoverage['/loader/utils.js'].lineData[224] = 0;
  _$jscoverage['/loader/utils.js'].lineData[226] = 0;
  _$jscoverage['/loader/utils.js'].lineData[227] = 0;
  _$jscoverage['/loader/utils.js'].lineData[229] = 0;
  _$jscoverage['/loader/utils.js'].lineData[230] = 0;
  _$jscoverage['/loader/utils.js'].lineData[231] = 0;
  _$jscoverage['/loader/utils.js'].lineData[233] = 0;
  _$jscoverage['/loader/utils.js'].lineData[234] = 0;
  _$jscoverage['/loader/utils.js'].lineData[236] = 0;
  _$jscoverage['/loader/utils.js'].lineData[237] = 0;
  _$jscoverage['/loader/utils.js'].lineData[239] = 0;
  _$jscoverage['/loader/utils.js'].lineData[240] = 0;
  _$jscoverage['/loader/utils.js'].lineData[241] = 0;
  _$jscoverage['/loader/utils.js'].lineData[242] = 0;
  _$jscoverage['/loader/utils.js'].lineData[243] = 0;
  _$jscoverage['/loader/utils.js'].lineData[245] = 0;
  _$jscoverage['/loader/utils.js'].lineData[247] = 0;
  _$jscoverage['/loader/utils.js'].lineData[249] = 0;
  _$jscoverage['/loader/utils.js'].lineData[250] = 0;
  _$jscoverage['/loader/utils.js'].lineData[252] = 0;
  _$jscoverage['/loader/utils.js'].lineData[261] = 0;
  _$jscoverage['/loader/utils.js'].lineData[262] = 0;
  _$jscoverage['/loader/utils.js'].lineData[265] = 0;
  _$jscoverage['/loader/utils.js'].lineData[267] = 0;
  _$jscoverage['/loader/utils.js'].lineData[271] = 0;
  _$jscoverage['/loader/utils.js'].lineData[272] = 0;
  _$jscoverage['/loader/utils.js'].lineData[273] = 0;
  _$jscoverage['/loader/utils.js'].lineData[275] = 0;
  _$jscoverage['/loader/utils.js'].lineData[278] = 0;
  _$jscoverage['/loader/utils.js'].lineData[287] = 0;
  _$jscoverage['/loader/utils.js'].lineData[288] = 0;
  _$jscoverage['/loader/utils.js'].lineData[290] = 0;
  _$jscoverage['/loader/utils.js'].lineData[305] = 0;
  _$jscoverage['/loader/utils.js'].lineData[316] = 0;
  _$jscoverage['/loader/utils.js'].lineData[323] = 0;
  _$jscoverage['/loader/utils.js'].lineData[324] = 0;
  _$jscoverage['/loader/utils.js'].lineData[325] = 0;
  _$jscoverage['/loader/utils.js'].lineData[326] = 0;
  _$jscoverage['/loader/utils.js'].lineData[327] = 0;
  _$jscoverage['/loader/utils.js'].lineData[328] = 0;
  _$jscoverage['/loader/utils.js'].lineData[329] = 0;
  _$jscoverage['/loader/utils.js'].lineData[330] = 0;
  _$jscoverage['/loader/utils.js'].lineData[333] = 0;
  _$jscoverage['/loader/utils.js'].lineData[337] = 0;
  _$jscoverage['/loader/utils.js'].lineData[348] = 0;
  _$jscoverage['/loader/utils.js'].lineData[349] = 0;
  _$jscoverage['/loader/utils.js'].lineData[351] = 0;
  _$jscoverage['/loader/utils.js'].lineData[354] = 0;
  _$jscoverage['/loader/utils.js'].lineData[355] = 0;
  _$jscoverage['/loader/utils.js'].lineData[360] = 0;
  _$jscoverage['/loader/utils.js'].lineData[361] = 0;
  _$jscoverage['/loader/utils.js'].lineData[363] = 0;
  _$jscoverage['/loader/utils.js'].lineData[374] = 0;
  _$jscoverage['/loader/utils.js'].lineData[376] = 0;
  _$jscoverage['/loader/utils.js'].lineData[379] = 0;
  _$jscoverage['/loader/utils.js'].lineData[380] = 0;
  _$jscoverage['/loader/utils.js'].lineData[381] = 0;
  _$jscoverage['/loader/utils.js'].lineData[385] = 0;
  _$jscoverage['/loader/utils.js'].lineData[387] = 0;
  _$jscoverage['/loader/utils.js'].lineData[391] = 0;
  _$jscoverage['/loader/utils.js'].lineData[397] = 0;
  _$jscoverage['/loader/utils.js'].lineData[408] = 0;
  _$jscoverage['/loader/utils.js'].lineData[414] = 0;
  _$jscoverage['/loader/utils.js'].lineData[415] = 0;
  _$jscoverage['/loader/utils.js'].lineData[416] = 0;
  _$jscoverage['/loader/utils.js'].lineData[417] = 0;
  _$jscoverage['/loader/utils.js'].lineData[420] = 0;
  _$jscoverage['/loader/utils.js'].lineData[429] = 0;
  _$jscoverage['/loader/utils.js'].lineData[431] = 0;
  _$jscoverage['/loader/utils.js'].lineData[432] = 0;
  _$jscoverage['/loader/utils.js'].lineData[435] = 0;
  _$jscoverage['/loader/utils.js'].lineData[439] = 0;
  _$jscoverage['/loader/utils.js'].lineData[440] = 0;
  _$jscoverage['/loader/utils.js'].lineData[443] = 0;
  _$jscoverage['/loader/utils.js'].lineData[444] = 0;
  _$jscoverage['/loader/utils.js'].lineData[445] = 0;
  _$jscoverage['/loader/utils.js'].lineData[446] = 0;
  _$jscoverage['/loader/utils.js'].lineData[447] = 0;
  _$jscoverage['/loader/utils.js'].lineData[450] = 0;
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
}
if (! _$jscoverage['/loader/utils.js'].branchData) {
  _$jscoverage['/loader/utils.js'].branchData = {};
  _$jscoverage['/loader/utils.js'].branchData['28'] = [];
  _$jscoverage['/loader/utils.js'].branchData['28'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['34'] = [];
  _$jscoverage['/loader/utils.js'].branchData['34'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['43'] = [];
  _$jscoverage['/loader/utils.js'].branchData['43'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['51'] = [];
  _$jscoverage['/loader/utils.js'].branchData['51'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['57'] = [];
  _$jscoverage['/loader/utils.js'].branchData['57'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['73'] = [];
  _$jscoverage['/loader/utils.js'].branchData['73'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['85'] = [];
  _$jscoverage['/loader/utils.js'].branchData['85'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['89'] = [];
  _$jscoverage['/loader/utils.js'].branchData['89'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['90'] = [];
  _$jscoverage['/loader/utils.js'].branchData['90'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['98'] = [];
  _$jscoverage['/loader/utils.js'].branchData['98'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['128'] = [];
  _$jscoverage['/loader/utils.js'].branchData['128'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['166'] = [];
  _$jscoverage['/loader/utils.js'].branchData['166'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['166'][2] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['170'] = [];
  _$jscoverage['/loader/utils.js'].branchData['170'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['170'][2] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['170'][3] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['172'] = [];
  _$jscoverage['/loader/utils.js'].branchData['172'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['196'] = [];
  _$jscoverage['/loader/utils.js'].branchData['196'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['198'] = [];
  _$jscoverage['/loader/utils.js'].branchData['198'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['203'] = [];
  _$jscoverage['/loader/utils.js'].branchData['203'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['204'] = [];
  _$jscoverage['/loader/utils.js'].branchData['204'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['223'] = [];
  _$jscoverage['/loader/utils.js'].branchData['223'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['226'] = [];
  _$jscoverage['/loader/utils.js'].branchData['226'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['230'] = [];
  _$jscoverage['/loader/utils.js'].branchData['230'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['233'] = [];
  _$jscoverage['/loader/utils.js'].branchData['233'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['236'] = [];
  _$jscoverage['/loader/utils.js'].branchData['236'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['239'] = [];
  _$jscoverage['/loader/utils.js'].branchData['239'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['240'] = [];
  _$jscoverage['/loader/utils.js'].branchData['240'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['247'] = [];
  _$jscoverage['/loader/utils.js'].branchData['247'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['261'] = [];
  _$jscoverage['/loader/utils.js'].branchData['261'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['267'] = [];
  _$jscoverage['/loader/utils.js'].branchData['267'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['287'] = [];
  _$jscoverage['/loader/utils.js'].branchData['287'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['325'] = [];
  _$jscoverage['/loader/utils.js'].branchData['325'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['326'] = [];
  _$jscoverage['/loader/utils.js'].branchData['326'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['328'] = [];
  _$jscoverage['/loader/utils.js'].branchData['328'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['329'] = [];
  _$jscoverage['/loader/utils.js'].branchData['329'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['349'] = [];
  _$jscoverage['/loader/utils.js'].branchData['349'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['351'] = [];
  _$jscoverage['/loader/utils.js'].branchData['351'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['354'] = [];
  _$jscoverage['/loader/utils.js'].branchData['354'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['360'] = [];
  _$jscoverage['/loader/utils.js'].branchData['360'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['379'] = [];
  _$jscoverage['/loader/utils.js'].branchData['379'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['408'] = [];
  _$jscoverage['/loader/utils.js'].branchData['408'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['409'] = [];
  _$jscoverage['/loader/utils.js'].branchData['409'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['414'] = [];
  _$jscoverage['/loader/utils.js'].branchData['414'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['416'] = [];
  _$jscoverage['/loader/utils.js'].branchData['416'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['431'] = [];
  _$jscoverage['/loader/utils.js'].branchData['431'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['444'] = [];
  _$jscoverage['/loader/utils.js'].branchData['444'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['446'] = [];
  _$jscoverage['/loader/utils.js'].branchData['446'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['446'][2] = new BranchData();
}
_$jscoverage['/loader/utils.js'].branchData['446'][2].init(64, 21, 'mod.status !== status');
function visit515_446_2(result) {
  _$jscoverage['/loader/utils.js'].branchData['446'][2].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['446'][1].init(56, 29, '!mod || mod.status !== status');
function visit514_446_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['446'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['444'][1].init(137, 19, 'i < modNames.length');
function visit513_444_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['444'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['431'][1].init(85, 8, '--i > -1');
function visit512_431_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['431'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['416'][1].init(62, 23, 'm = path.match(rule[0])');
function visit511_416_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['416'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['414'][1].init(205, 22, 'i < mappedRules.length');
function visit510_414_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['414'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['409'][1].init(29, 53, 'runtime.Config.mappedRules || []');
function visit509_409_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['409'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['408'][1].init(32, 83, 'rules || runtime.Config.mappedRules || []');
function visit508_408_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['408'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['379'][1].init(138, 13, 'mod && mod.fn');
function visit507_379_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['379'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['360'][1].init(522, 10, 'refModName');
function visit506_360_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['360'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['354'][1].init(143, 11, 'modNames[i]');
function visit505_354_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['354'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['351'][1].init(84, 5, 'i < l');
function visit504_351_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['351'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['349'][1].init(51, 8, 'modNames');
function visit503_349_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['349'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['329'][1].init(34, 9, '!alias[j]');
function visit502_329_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['329'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['328'][1].init(86, 6, 'j >= 0');
function visit501_328_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['328'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['326'][1].init(27, 38, '(m = mods[ret[i]]) && (alias = m.alias)');
function visit500_326_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['326'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['325'][1].init(68, 6, 'i >= 0');
function visit499_325_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['325'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['287'][1].init(18, 27, 'typeof modNames == \'string\'');
function visit498_287_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['287'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['267'][1].init(133, 24, 'typeof fn === \'function\'');
function visit497_267_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['267'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['261'][1].init(18, 20, 'mod.status != LOADED');
function visit496_261_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['261'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['247'][1].init(929, 105, 'Utils.attachModsRecursively(m.getNormalizedRequires(), runtime, stack, errorList, cache)');
function visit495_247_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['247'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['240'][1].init(22, 25, 'S.inArray(modName, stack)');
function visit494_240_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['240'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['239'][1].init(608, 9, '\'@DEBUG@\'');
function visit493_239_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['239'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['236'][1].init(512, 16, 'status != LOADED');
function visit492_236_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['236'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['233'][1].init(425, 15, 'status == ERROR');
function visit491_233_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['233'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['230'][1].init(327, 18, 'status == ATTACHED');
function visit490_230_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['230'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['226'][1].init(213, 2, '!m');
function visit489_226_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['226'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['223'][1].init(121, 16, 'modName in cache');
function visit488_223_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['223'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['204'][1].init(22, 78, 's && Utils.attachModRecursively(modNames[i], runtime, stack, errorList, cache)');
function visit487_204_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['204'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['203'][1].init(340, 5, 'i < l');
function visit486_203_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['203'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['198'][1].init(176, 11, 'cache || {}');
function visit485_198_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['198'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['196'][1].init(77, 11, 'stack || []');
function visit484_196_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['196'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['172'][1].init(295, 5, 'allOk');
function visit483_172_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['172'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['170'][3].init(88, 20, 'm.status == ATTACHED');
function visit482_170_3(result) {
  _$jscoverage['/loader/utils.js'].branchData['170'][3].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['170'][2].init(83, 25, 'm && m.status == ATTACHED');
function visit481_170_2(result) {
  _$jscoverage['/loader/utils.js'].branchData['170'][2].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['170'][1].init(78, 30, 'a && m && m.status == ATTACHED');
function visit480_170_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['170'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['166'][2].init(75, 22, 'mod.getType() != \'css\'');
function visit479_166_2(result) {
  _$jscoverage['/loader/utils.js'].branchData['166'][2].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['166'][1].init(67, 30, '!mod || mod.getType() != \'css\'');
function visit478_166_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['166'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['128'][1].init(147, 3, 'mod');
function visit477_128_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['128'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['98'][1].init(476, 5, 'i < l');
function visit476_98_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['98'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['90'][1].init(22, 55, 'startsWith(depName, \'../\') || startsWith(depName, \'./\')');
function visit475_90_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['90'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['89'][1].init(126, 26, 'typeof depName == \'string\'');
function visit474_89_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['89'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['85'][1].init(47, 8, '!depName');
function visit473_85_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['85'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['73'][1].init(21, 58, 'doc.getElementsByTagName(\'head\')[0] || doc.documentElement');
function visit472_73_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['73'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['57'][1].init(26, 12, 'Plugin.alias');
function visit471_57_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['57'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['51'][1].init(54, 11, 'index != -1');
function visit470_51_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['51'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['43'][1].init(40, 29, 's.charAt(s.length - 1) == \'/\'');
function visit469_43_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['43'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['34'][1].init(103, 5, 'i < l');
function visit468_34_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['34'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['28'][1].init(14, 20, 'typeof s == \'string\'');
function visit467_28_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['28'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].lineData[6]++;
(function(S) {
  _$jscoverage['/loader/utils.js'].functionData[0]++;
  _$jscoverage['/loader/utils.js'].lineData[7]++;
  var Loader = S.Loader, Path = S.Path, logger = S.getLogger('s/loader'), host = S.Env.host, startsWith = S.startsWith, data = Loader.Status, ATTACHED = data.ATTACHED, LOADED = data.LOADED, ERROR = data.ERROR, Utils = Loader.Utils = {}, doc = host.document;
  _$jscoverage['/loader/utils.js'].lineData[27]++;
  function indexMap(s) {
    _$jscoverage['/loader/utils.js'].functionData[1]++;
    _$jscoverage['/loader/utils.js'].lineData[28]++;
    if (visit467_28_1(typeof s == 'string')) {
      _$jscoverage['/loader/utils.js'].lineData[29]++;
      return indexMapStr(s);
    } else {
      _$jscoverage['/loader/utils.js'].lineData[31]++;
      var ret = [], i = 0, l = s.length;
      _$jscoverage['/loader/utils.js'].lineData[34]++;
      for (; visit468_34_1(i < l); i++) {
        _$jscoverage['/loader/utils.js'].lineData[35]++;
        ret[i] = indexMapStr(s[i]);
      }
      _$jscoverage['/loader/utils.js'].lineData[37]++;
      return ret;
    }
  }
  _$jscoverage['/loader/utils.js'].lineData[41]++;
  function indexMapStr(s) {
    _$jscoverage['/loader/utils.js'].functionData[2]++;
    _$jscoverage['/loader/utils.js'].lineData[43]++;
    if (visit469_43_1(s.charAt(s.length - 1) == '/')) {
      _$jscoverage['/loader/utils.js'].lineData[44]++;
      s += 'index';
    }
    _$jscoverage['/loader/utils.js'].lineData[46]++;
    return s;
  }
  _$jscoverage['/loader/utils.js'].lineData[49]++;
  function pluginAlias(runtime, name) {
    _$jscoverage['/loader/utils.js'].functionData[3]++;
    _$jscoverage['/loader/utils.js'].lineData[50]++;
    var index = name.indexOf('!');
    _$jscoverage['/loader/utils.js'].lineData[51]++;
    if (visit470_51_1(index != -1)) {
      _$jscoverage['/loader/utils.js'].lineData[52]++;
      var pluginName = name.substring(0, index);
      _$jscoverage['/loader/utils.js'].lineData[53]++;
      name = name.substring(index + 1);
      _$jscoverage['/loader/utils.js'].lineData[54]++;
      S.use(pluginName, {
  sync: true, 
  success: function(S, Plugin) {
  _$jscoverage['/loader/utils.js'].functionData[4]++;
  _$jscoverage['/loader/utils.js'].lineData[57]++;
  if (visit471_57_1(Plugin.alias)) {
    _$jscoverage['/loader/utils.js'].lineData[59]++;
    name = Plugin.alias(runtime, name, pluginName);
  }
}});
    }
    _$jscoverage['/loader/utils.js'].lineData[64]++;
    return name;
  }
  _$jscoverage['/loader/utils.js'].lineData[67]++;
  S.mix(Utils, {
  docHead: function() {
  _$jscoverage['/loader/utils.js'].functionData[5]++;
  _$jscoverage['/loader/utils.js'].lineData[73]++;
  return visit472_73_1(doc.getElementsByTagName('head')[0] || doc.documentElement);
}, 
  normalDepModuleName: function(moduleName, depName) {
  _$jscoverage['/loader/utils.js'].functionData[6]++;
  _$jscoverage['/loader/utils.js'].lineData[83]++;
  var i = 0, l;
  _$jscoverage['/loader/utils.js'].lineData[85]++;
  if (visit473_85_1(!depName)) {
    _$jscoverage['/loader/utils.js'].lineData[86]++;
    return depName;
  }
  _$jscoverage['/loader/utils.js'].lineData[89]++;
  if (visit474_89_1(typeof depName == 'string')) {
    _$jscoverage['/loader/utils.js'].lineData[90]++;
    if (visit475_90_1(startsWith(depName, '../') || startsWith(depName, './'))) {
      _$jscoverage['/loader/utils.js'].lineData[92]++;
      return Path.resolve(Path.dirname(moduleName), depName);
    }
    _$jscoverage['/loader/utils.js'].lineData[95]++;
    return Path.normalize(depName);
  }
  _$jscoverage['/loader/utils.js'].lineData[98]++;
  for (l = depName.length; visit476_98_1(i < l); i++) {
    _$jscoverage['/loader/utils.js'].lineData[99]++;
    depName[i] = Utils.normalDepModuleName(moduleName, depName[i]);
  }
  _$jscoverage['/loader/utils.js'].lineData[101]++;
  return depName;
}, 
  createModulesInfo: function(runtime, modNames) {
  _$jscoverage['/loader/utils.js'].functionData[7]++;
  _$jscoverage['/loader/utils.js'].lineData[110]++;
  S.each(modNames, function(m) {
  _$jscoverage['/loader/utils.js'].functionData[8]++;
  _$jscoverage['/loader/utils.js'].lineData[111]++;
  Utils.createModuleInfo(runtime, m);
});
}, 
  createModuleInfo: function(runtime, modName, cfg) {
  _$jscoverage['/loader/utils.js'].functionData[9]++;
  _$jscoverage['/loader/utils.js'].lineData[123]++;
  modName = indexMapStr(modName);
  _$jscoverage['/loader/utils.js'].lineData[125]++;
  var mods = runtime.Env.mods, mod = mods[modName];
  _$jscoverage['/loader/utils.js'].lineData[128]++;
  if (visit477_128_1(mod)) {
    _$jscoverage['/loader/utils.js'].lineData[129]++;
    return mod;
  }
  _$jscoverage['/loader/utils.js'].lineData[133]++;
  mods[modName] = mod = new Loader.Module(S.mix({
  name: modName, 
  runtime: runtime}, cfg));
  _$jscoverage['/loader/utils.js'].lineData[138]++;
  return mod;
}, 
  'isAttached': function(runtime, modNames) {
  _$jscoverage['/loader/utils.js'].functionData[10]++;
  _$jscoverage['/loader/utils.js'].lineData[148]++;
  return isStatus(runtime, modNames, ATTACHED);
}, 
  getModules: function(runtime, modNames) {
  _$jscoverage['/loader/utils.js'].functionData[11]++;
  _$jscoverage['/loader/utils.js'].lineData[158]++;
  var mods = [runtime], mod, unalias, allOk, m, runtimeMods = runtime.Env.mods;
  _$jscoverage['/loader/utils.js'].lineData[164]++;
  S.each(modNames, function(modName) {
  _$jscoverage['/loader/utils.js'].functionData[12]++;
  _$jscoverage['/loader/utils.js'].lineData[165]++;
  mod = runtimeMods[modName];
  _$jscoverage['/loader/utils.js'].lineData[166]++;
  if (visit478_166_1(!mod || visit479_166_2(mod.getType() != 'css'))) {
    _$jscoverage['/loader/utils.js'].lineData[167]++;
    unalias = Utils.unalias(runtime, modName);
    _$jscoverage['/loader/utils.js'].lineData[168]++;
    allOk = S.reduce(unalias, function(a, n) {
  _$jscoverage['/loader/utils.js'].functionData[13]++;
  _$jscoverage['/loader/utils.js'].lineData[169]++;
  m = runtimeMods[n];
  _$jscoverage['/loader/utils.js'].lineData[170]++;
  return visit480_170_1(a && visit481_170_2(m && visit482_170_3(m.status == ATTACHED)));
}, true);
    _$jscoverage['/loader/utils.js'].lineData[172]++;
    if (visit483_172_1(allOk)) {
      _$jscoverage['/loader/utils.js'].lineData[173]++;
      mods.push(runtimeMods[unalias[0]].value);
    } else {
      _$jscoverage['/loader/utils.js'].lineData[175]++;
      mods.push(null);
    }
  } else {
    _$jscoverage['/loader/utils.js'].lineData[178]++;
    mods.push(undefined);
  }
});
  _$jscoverage['/loader/utils.js'].lineData[182]++;
  return mods;
}, 
  attachModsRecursively: function(modNames, runtime, stack, errorList, cache) {
  _$jscoverage['/loader/utils.js'].functionData[14]++;
  _$jscoverage['/loader/utils.js'].lineData[196]++;
  stack = visit484_196_1(stack || []);
  _$jscoverage['/loader/utils.js'].lineData[198]++;
  cache = visit485_198_1(cache || {});
  _$jscoverage['/loader/utils.js'].lineData[199]++;
  var i, s = 1, l = modNames.length, stackDepth = stack.length;
  _$jscoverage['/loader/utils.js'].lineData[203]++;
  for (i = 0; visit486_203_1(i < l); i++) {
    _$jscoverage['/loader/utils.js'].lineData[204]++;
    s = visit487_204_1(s && Utils.attachModRecursively(modNames[i], runtime, stack, errorList, cache));
    _$jscoverage['/loader/utils.js'].lineData[205]++;
    stack.length = stackDepth;
  }
  _$jscoverage['/loader/utils.js'].lineData[207]++;
  return s;
}, 
  attachModRecursively: function(modName, runtime, stack, errorList, cache) {
  _$jscoverage['/loader/utils.js'].functionData[15]++;
  _$jscoverage['/loader/utils.js'].lineData[220]++;
  var mods = runtime.Env.mods, status, m = mods[modName];
  _$jscoverage['/loader/utils.js'].lineData[223]++;
  if (visit488_223_1(modName in cache)) {
    _$jscoverage['/loader/utils.js'].lineData[224]++;
    return cache[modName];
  }
  _$jscoverage['/loader/utils.js'].lineData[226]++;
  if (visit489_226_1(!m)) {
    _$jscoverage['/loader/utils.js'].lineData[227]++;
    return cache[modName] = 0;
  }
  _$jscoverage['/loader/utils.js'].lineData[229]++;
  status = m.status;
  _$jscoverage['/loader/utils.js'].lineData[230]++;
  if (visit490_230_1(status == ATTACHED)) {
    _$jscoverage['/loader/utils.js'].lineData[231]++;
    return cache[modName] = 1;
  }
  _$jscoverage['/loader/utils.js'].lineData[233]++;
  if (visit491_233_1(status == ERROR)) {
    _$jscoverage['/loader/utils.js'].lineData[234]++;
    errorList.push(m);
  }
  _$jscoverage['/loader/utils.js'].lineData[236]++;
  if (visit492_236_1(status != LOADED)) {
    _$jscoverage['/loader/utils.js'].lineData[237]++;
    return cache[modName] = 0;
  }
  _$jscoverage['/loader/utils.js'].lineData[239]++;
  if (visit493_239_1('@DEBUG@')) {
    _$jscoverage['/loader/utils.js'].lineData[240]++;
    if (visit494_240_1(S.inArray(modName, stack))) {
      _$jscoverage['/loader/utils.js'].lineData[241]++;
      stack.push(modName);
      _$jscoverage['/loader/utils.js'].lineData[242]++;
      S.error('find cyclic dependency between mods: ' + stack);
      _$jscoverage['/loader/utils.js'].lineData[243]++;
      return cache[modName] = 0;
    }
    _$jscoverage['/loader/utils.js'].lineData[245]++;
    stack.push(modName);
  }
  _$jscoverage['/loader/utils.js'].lineData[247]++;
  if (visit495_247_1(Utils.attachModsRecursively(m.getNormalizedRequires(), runtime, stack, errorList, cache))) {
    _$jscoverage['/loader/utils.js'].lineData[249]++;
    Utils.attachMod(runtime, m);
    _$jscoverage['/loader/utils.js'].lineData[250]++;
    return cache[modName] = 1;
  }
  _$jscoverage['/loader/utils.js'].lineData[252]++;
  return cache[modName] = 0;
}, 
  attachMod: function(runtime, mod) {
  _$jscoverage['/loader/utils.js'].functionData[16]++;
  _$jscoverage['/loader/utils.js'].lineData[261]++;
  if (visit496_261_1(mod.status != LOADED)) {
    _$jscoverage['/loader/utils.js'].lineData[262]++;
    return;
  }
  _$jscoverage['/loader/utils.js'].lineData[265]++;
  var fn = mod.fn;
  _$jscoverage['/loader/utils.js'].lineData[267]++;
  if (visit497_267_1(typeof fn === 'function')) {
    _$jscoverage['/loader/utils.js'].lineData[271]++;
    Loader.attachingModName = mod.name;
    _$jscoverage['/loader/utils.js'].lineData[272]++;
    mod.value = fn.apply(mod, Utils.getModules(runtime, mod.getRequiresWithAlias()));
    _$jscoverage['/loader/utils.js'].lineData[273]++;
    Loader.attachingModName = undefined;
  } else {
    _$jscoverage['/loader/utils.js'].lineData[275]++;
    mod.value = fn;
  }
  _$jscoverage['/loader/utils.js'].lineData[278]++;
  mod.status = ATTACHED;
}, 
  getModNamesAsArray: function(modNames) {
  _$jscoverage['/loader/utils.js'].functionData[17]++;
  _$jscoverage['/loader/utils.js'].lineData[287]++;
  if (visit498_287_1(typeof modNames == 'string')) {
    _$jscoverage['/loader/utils.js'].lineData[288]++;
    modNames = modNames.replace(/\s+/g, '').split(',');
  }
  _$jscoverage['/loader/utils.js'].lineData[290]++;
  return modNames;
}, 
  normalizeModNames: function(runtime, modNames, refModName) {
  _$jscoverage['/loader/utils.js'].functionData[18]++;
  _$jscoverage['/loader/utils.js'].lineData[305]++;
  return Utils.unalias(runtime, Utils.normalizeModNamesWithAlias(runtime, modNames, refModName));
}, 
  unalias: function(runtime, names) {
  _$jscoverage['/loader/utils.js'].functionData[19]++;
  _$jscoverage['/loader/utils.js'].lineData[316]++;
  var ret = [].concat(names), i, m, alias, ok = 0, j, mods = runtime['Env'].mods;
  _$jscoverage['/loader/utils.js'].lineData[323]++;
  while (!ok) {
    _$jscoverage['/loader/utils.js'].lineData[324]++;
    ok = 1;
    _$jscoverage['/loader/utils.js'].lineData[325]++;
    for (i = ret.length - 1; visit499_325_1(i >= 0); i--) {
      _$jscoverage['/loader/utils.js'].lineData[326]++;
      if (visit500_326_1((m = mods[ret[i]]) && (alias = m.alias))) {
        _$jscoverage['/loader/utils.js'].lineData[327]++;
        ok = 0;
        _$jscoverage['/loader/utils.js'].lineData[328]++;
        for (j = alias.length - 1; visit501_328_1(j >= 0); j--) {
          _$jscoverage['/loader/utils.js'].lineData[329]++;
          if (visit502_329_1(!alias[j])) {
            _$jscoverage['/loader/utils.js'].lineData[330]++;
            alias.splice(j, 1);
          }
        }
        _$jscoverage['/loader/utils.js'].lineData[333]++;
        ret.splice.apply(ret, [i, 1].concat(indexMap(alias)));
      }
    }
  }
  _$jscoverage['/loader/utils.js'].lineData[337]++;
  return ret;
}, 
  normalizeModNamesWithAlias: function(runtime, modNames, refModName) {
  _$jscoverage['/loader/utils.js'].functionData[20]++;
  _$jscoverage['/loader/utils.js'].lineData[348]++;
  var ret = [], i, l;
  _$jscoverage['/loader/utils.js'].lineData[349]++;
  if (visit503_349_1(modNames)) {
    _$jscoverage['/loader/utils.js'].lineData[351]++;
    for (i = 0 , l = modNames.length; visit504_351_1(i < l); i++) {
      _$jscoverage['/loader/utils.js'].lineData[354]++;
      if (visit505_354_1(modNames[i])) {
        _$jscoverage['/loader/utils.js'].lineData[355]++;
        ret.push(pluginAlias(runtime, indexMap(modNames[i])));
      }
    }
  }
  _$jscoverage['/loader/utils.js'].lineData[360]++;
  if (visit506_360_1(refModName)) {
    _$jscoverage['/loader/utils.js'].lineData[361]++;
    ret = Utils.normalDepModuleName(refModName, ret);
  }
  _$jscoverage['/loader/utils.js'].lineData[363]++;
  return ret;
}, 
  registerModule: function(runtime, name, fn, config) {
  _$jscoverage['/loader/utils.js'].functionData[21]++;
  _$jscoverage['/loader/utils.js'].lineData[374]++;
  name = indexMapStr(name);
  _$jscoverage['/loader/utils.js'].lineData[376]++;
  var mods = runtime.Env.mods, mod = mods[name];
  _$jscoverage['/loader/utils.js'].lineData[379]++;
  if (visit507_379_1(mod && mod.fn)) {
    _$jscoverage['/loader/utils.js'].lineData[380]++;
    S.log(name + ' is defined more than once', 'warn');
    _$jscoverage['/loader/utils.js'].lineData[381]++;
    return;
  }
  _$jscoverage['/loader/utils.js'].lineData[385]++;
  Utils.createModuleInfo(runtime, name);
  _$jscoverage['/loader/utils.js'].lineData[387]++;
  mod = mods[name];
  _$jscoverage['/loader/utils.js'].lineData[391]++;
  S.mix(mod, {
  name: name, 
  status: LOADED, 
  fn: fn});
  _$jscoverage['/loader/utils.js'].lineData[397]++;
  S.mix(mod, config);
}, 
  getMappedPath: function(runtime, path, rules) {
  _$jscoverage['/loader/utils.js'].functionData[22]++;
  _$jscoverage['/loader/utils.js'].lineData[408]++;
  var mappedRules = visit508_408_1(rules || visit509_409_1(runtime.Config.mappedRules || [])), i, m, rule;
  _$jscoverage['/loader/utils.js'].lineData[414]++;
  for (i = 0; visit510_414_1(i < mappedRules.length); i++) {
    _$jscoverage['/loader/utils.js'].lineData[415]++;
    rule = mappedRules[i];
    _$jscoverage['/loader/utils.js'].lineData[416]++;
    if (visit511_416_1(m = path.match(rule[0]))) {
      _$jscoverage['/loader/utils.js'].lineData[417]++;
      return path.replace(rule[0], rule[1]);
    }
  }
  _$jscoverage['/loader/utils.js'].lineData[420]++;
  return path;
}, 
  getHash: function(str) {
  _$jscoverage['/loader/utils.js'].functionData[23]++;
  _$jscoverage['/loader/utils.js'].lineData[429]++;
  var hash = 5381, i;
  _$jscoverage['/loader/utils.js'].lineData[431]++;
  for (i = str.length; visit512_431_1(--i > -1); ) {
    _$jscoverage['/loader/utils.js'].lineData[432]++;
    hash = ((hash << 5) + hash) + str.charCodeAt(i);
  }
  _$jscoverage['/loader/utils.js'].lineData[435]++;
  return hash + '';
}});
  _$jscoverage['/loader/utils.js'].lineData[439]++;
  function isStatus(runtime, modNames, status) {
    _$jscoverage['/loader/utils.js'].functionData[24]++;
    _$jscoverage['/loader/utils.js'].lineData[440]++;
    var mods = runtime.Env.mods, mod, i;
    _$jscoverage['/loader/utils.js'].lineData[443]++;
    modNames = S.makeArray(modNames);
    _$jscoverage['/loader/utils.js'].lineData[444]++;
    for (i = 0; visit513_444_1(i < modNames.length); i++) {
      _$jscoverage['/loader/utils.js'].lineData[445]++;
      mod = mods[modNames[i]];
      _$jscoverage['/loader/utils.js'].lineData[446]++;
      if (visit514_446_1(!mod || visit515_446_2(mod.status !== status))) {
        _$jscoverage['/loader/utils.js'].lineData[447]++;
        return 0;
      }
    }
    _$jscoverage['/loader/utils.js'].lineData[450]++;
    return 1;
  }
})(KISSY);
