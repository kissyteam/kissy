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
  _$jscoverage['/base.js'].lineData[20] = 0;
  _$jscoverage['/base.js'].lineData[22] = 0;
  _$jscoverage['/base.js'].lineData[28] = 0;
  _$jscoverage['/base.js'].lineData[29] = 0;
  _$jscoverage['/base.js'].lineData[31] = 0;
  _$jscoverage['/base.js'].lineData[32] = 0;
  _$jscoverage['/base.js'].lineData[34] = 0;
  _$jscoverage['/base.js'].lineData[35] = 0;
  _$jscoverage['/base.js'].lineData[64] = 0;
  _$jscoverage['/base.js'].lineData[65] = 0;
  _$jscoverage['/base.js'].lineData[66] = 0;
  _$jscoverage['/base.js'].lineData[68] = 0;
  _$jscoverage['/base.js'].lineData[69] = 0;
  _$jscoverage['/base.js'].lineData[72] = 0;
  _$jscoverage['/base.js'].lineData[73] = 0;
  _$jscoverage['/base.js'].lineData[74] = 0;
  _$jscoverage['/base.js'].lineData[75] = 0;
  _$jscoverage['/base.js'].lineData[76] = 0;
  _$jscoverage['/base.js'].lineData[77] = 0;
  _$jscoverage['/base.js'].lineData[79] = 0;
  _$jscoverage['/base.js'].lineData[80] = 0;
  _$jscoverage['/base.js'].lineData[85] = 0;
  _$jscoverage['/base.js'].lineData[86] = 0;
  _$jscoverage['/base.js'].lineData[88] = 0;
  _$jscoverage['/base.js'].lineData[91] = 0;
  _$jscoverage['/base.js'].lineData[92] = 0;
  _$jscoverage['/base.js'].lineData[94] = 0;
  _$jscoverage['/base.js'].lineData[95] = 0;
  _$jscoverage['/base.js'].lineData[98] = 0;
  _$jscoverage['/base.js'].lineData[99] = 0;
  _$jscoverage['/base.js'].lineData[102] = 0;
  _$jscoverage['/base.js'].lineData[105] = 0;
  _$jscoverage['/base.js'].lineData[106] = 0;
  _$jscoverage['/base.js'].lineData[112] = 0;
  _$jscoverage['/base.js'].lineData[114] = 0;
  _$jscoverage['/base.js'].lineData[116] = 0;
  _$jscoverage['/base.js'].lineData[117] = 0;
  _$jscoverage['/base.js'].lineData[119] = 0;
  _$jscoverage['/base.js'].lineData[120] = 0;
  _$jscoverage['/base.js'].lineData[121] = 0;
  _$jscoverage['/base.js'].lineData[124] = 0;
  _$jscoverage['/base.js'].lineData[125] = 0;
  _$jscoverage['/base.js'].lineData[126] = 0;
  _$jscoverage['/base.js'].lineData[127] = 0;
  _$jscoverage['/base.js'].lineData[129] = 0;
  _$jscoverage['/base.js'].lineData[132] = 0;
  _$jscoverage['/base.js'].lineData[141] = 0;
  _$jscoverage['/base.js'].lineData[152] = 0;
  _$jscoverage['/base.js'].lineData[155] = 0;
  _$jscoverage['/base.js'].lineData[156] = 0;
  _$jscoverage['/base.js'].lineData[157] = 0;
  _$jscoverage['/base.js'].lineData[161] = 0;
  _$jscoverage['/base.js'].lineData[172] = 0;
  _$jscoverage['/base.js'].lineData[173] = 0;
  _$jscoverage['/base.js'].lineData[176] = 0;
  _$jscoverage['/base.js'].lineData[177] = 0;
  _$jscoverage['/base.js'].lineData[178] = 0;
  _$jscoverage['/base.js'].lineData[179] = 0;
  _$jscoverage['/base.js'].lineData[181] = 0;
  _$jscoverage['/base.js'].lineData[183] = 0;
  _$jscoverage['/base.js'].lineData[184] = 0;
  _$jscoverage['/base.js'].lineData[186] = 0;
  _$jscoverage['/base.js'].lineData[187] = 0;
  _$jscoverage['/base.js'].lineData[192] = 0;
  _$jscoverage['/base.js'].lineData[195] = 0;
  _$jscoverage['/base.js'].lineData[199] = 0;
  _$jscoverage['/base.js'].lineData[202] = 0;
  _$jscoverage['/base.js'].lineData[207] = 0;
  _$jscoverage['/base.js'].lineData[208] = 0;
  _$jscoverage['/base.js'].lineData[213] = 0;
  _$jscoverage['/base.js'].lineData[215] = 0;
  _$jscoverage['/base.js'].lineData[217] = 0;
  _$jscoverage['/base.js'].lineData[218] = 0;
  _$jscoverage['/base.js'].lineData[220] = 0;
  _$jscoverage['/base.js'].lineData[225] = 0;
  _$jscoverage['/base.js'].lineData[226] = 0;
  _$jscoverage['/base.js'].lineData[227] = 0;
  _$jscoverage['/base.js'].lineData[228] = 0;
  _$jscoverage['/base.js'].lineData[230] = 0;
  _$jscoverage['/base.js'].lineData[231] = 0;
  _$jscoverage['/base.js'].lineData[233] = 0;
  _$jscoverage['/base.js'].lineData[234] = 0;
  _$jscoverage['/base.js'].lineData[235] = 0;
  _$jscoverage['/base.js'].lineData[238] = 0;
  _$jscoverage['/base.js'].lineData[239] = 0;
  _$jscoverage['/base.js'].lineData[240] = 0;
  _$jscoverage['/base.js'].lineData[242] = 0;
  _$jscoverage['/base.js'].lineData[243] = 0;
  _$jscoverage['/base.js'].lineData[245] = 0;
  _$jscoverage['/base.js'].lineData[247] = 0;
  _$jscoverage['/base.js'].lineData[249] = 0;
  _$jscoverage['/base.js'].lineData[250] = 0;
  _$jscoverage['/base.js'].lineData[253] = 0;
  _$jscoverage['/base.js'].lineData[256] = 0;
  _$jscoverage['/base.js'].lineData[257] = 0;
  _$jscoverage['/base.js'].lineData[261] = 0;
  _$jscoverage['/base.js'].lineData[262] = 0;
  _$jscoverage['/base.js'].lineData[263] = 0;
  _$jscoverage['/base.js'].lineData[264] = 0;
  _$jscoverage['/base.js'].lineData[265] = 0;
  _$jscoverage['/base.js'].lineData[268] = 0;
  _$jscoverage['/base.js'].lineData[269] = 0;
  _$jscoverage['/base.js'].lineData[278] = 0;
  _$jscoverage['/base.js'].lineData[286] = 0;
  _$jscoverage['/base.js'].lineData[295] = 0;
  _$jscoverage['/base.js'].lineData[296] = 0;
  _$jscoverage['/base.js'].lineData[298] = 0;
  _$jscoverage['/base.js'].lineData[299] = 0;
  _$jscoverage['/base.js'].lineData[300] = 0;
  _$jscoverage['/base.js'].lineData[301] = 0;
  _$jscoverage['/base.js'].lineData[302] = 0;
  _$jscoverage['/base.js'].lineData[303] = 0;
  _$jscoverage['/base.js'].lineData[305] = 0;
  _$jscoverage['/base.js'].lineData[308] = 0;
  _$jscoverage['/base.js'].lineData[330] = 0;
  _$jscoverage['/base.js'].lineData[331] = 0;
  _$jscoverage['/base.js'].lineData[333] = 0;
  _$jscoverage['/base.js'].lineData[334] = 0;
  _$jscoverage['/base.js'].lineData[335] = 0;
  _$jscoverage['/base.js'].lineData[336] = 0;
  _$jscoverage['/base.js'].lineData[337] = 0;
  _$jscoverage['/base.js'].lineData[338] = 0;
  _$jscoverage['/base.js'].lineData[341] = 0;
  _$jscoverage['/base.js'].lineData[342] = 0;
  _$jscoverage['/base.js'].lineData[345] = 0;
  _$jscoverage['/base.js'].lineData[360] = 0;
  _$jscoverage['/base.js'].lineData[364] = 0;
  _$jscoverage['/base.js'].lineData[365] = 0;
  _$jscoverage['/base.js'].lineData[368] = 0;
  _$jscoverage['/base.js'].lineData[369] = 0;
  _$jscoverage['/base.js'].lineData[370] = 0;
  _$jscoverage['/base.js'].lineData[374] = 0;
  _$jscoverage['/base.js'].lineData[383] = 0;
  _$jscoverage['/base.js'].lineData[388] = 0;
  _$jscoverage['/base.js'].lineData[389] = 0;
  _$jscoverage['/base.js'].lineData[392] = 0;
  _$jscoverage['/base.js'].lineData[393] = 0;
  _$jscoverage['/base.js'].lineData[394] = 0;
  _$jscoverage['/base.js'].lineData[397] = 0;
  _$jscoverage['/base.js'].lineData[398] = 0;
  _$jscoverage['/base.js'].lineData[400] = 0;
  _$jscoverage['/base.js'].lineData[402] = 0;
  _$jscoverage['/base.js'].lineData[405] = 0;
  _$jscoverage['/base.js'].lineData[406] = 0;
  _$jscoverage['/base.js'].lineData[407] = 0;
  _$jscoverage['/base.js'].lineData[409] = 0;
  _$jscoverage['/base.js'].lineData[410] = 0;
  _$jscoverage['/base.js'].lineData[411] = 0;
  _$jscoverage['/base.js'].lineData[412] = 0;
  _$jscoverage['/base.js'].lineData[414] = 0;
  _$jscoverage['/base.js'].lineData[417] = 0;
  _$jscoverage['/base.js'].lineData[419] = 0;
  _$jscoverage['/base.js'].lineData[420] = 0;
  _$jscoverage['/base.js'].lineData[421] = 0;
  _$jscoverage['/base.js'].lineData[424] = 0;
  _$jscoverage['/base.js'].lineData[428] = 0;
  _$jscoverage['/base.js'].lineData[435] = 0;
  _$jscoverage['/base.js'].lineData[436] = 0;
  _$jscoverage['/base.js'].lineData[437] = 0;
  _$jscoverage['/base.js'].lineData[445] = 0;
  _$jscoverage['/base.js'].lineData[447] = 0;
  _$jscoverage['/base.js'].lineData[451] = 0;
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
  _$jscoverage['/base.js'].functionData[18] = 0;
  _$jscoverage['/base.js'].functionData[19] = 0;
}
if (! _$jscoverage['/base.js'].branchData) {
  _$jscoverage['/base.js'].branchData = {};
  _$jscoverage['/base.js'].branchData['31'] = [];
  _$jscoverage['/base.js'].branchData['31'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['34'] = [];
  _$jscoverage['/base.js'].branchData['34'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['68'] = [];
  _$jscoverage['/base.js'].branchData['68'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['72'] = [];
  _$jscoverage['/base.js'].branchData['72'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['76'] = [];
  _$jscoverage['/base.js'].branchData['76'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['79'] = [];
  _$jscoverage['/base.js'].branchData['79'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['79'][2] = new BranchData();
  _$jscoverage['/base.js'].branchData['85'] = [];
  _$jscoverage['/base.js'].branchData['85'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['91'] = [];
  _$jscoverage['/base.js'].branchData['91'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['94'] = [];
  _$jscoverage['/base.js'].branchData['94'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['116'] = [];
  _$jscoverage['/base.js'].branchData['116'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['148'] = [];
  _$jscoverage['/base.js'].branchData['148'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['156'] = [];
  _$jscoverage['/base.js'].branchData['156'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['176'] = [];
  _$jscoverage['/base.js'].branchData['176'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['186'] = [];
  _$jscoverage['/base.js'].branchData['186'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['199'] = [];
  _$jscoverage['/base.js'].branchData['199'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['202'] = [];
  _$jscoverage['/base.js'].branchData['202'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['215'] = [];
  _$jscoverage['/base.js'].branchData['215'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['215'][2] = new BranchData();
  _$jscoverage['/base.js'].branchData['216'] = [];
  _$jscoverage['/base.js'].branchData['216'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['217'] = [];
  _$jscoverage['/base.js'].branchData['217'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['226'] = [];
  _$jscoverage['/base.js'].branchData['226'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['230'] = [];
  _$jscoverage['/base.js'].branchData['230'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['231'] = [];
  _$jscoverage['/base.js'].branchData['231'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['231'][2] = new BranchData();
  _$jscoverage['/base.js'].branchData['231'][3] = new BranchData();
  _$jscoverage['/base.js'].branchData['231'][4] = new BranchData();
  _$jscoverage['/base.js'].branchData['231'][5] = new BranchData();
  _$jscoverage['/base.js'].branchData['239'] = [];
  _$jscoverage['/base.js'].branchData['239'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['242'] = [];
  _$jscoverage['/base.js'].branchData['242'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['256'] = [];
  _$jscoverage['/base.js'].branchData['256'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['262'] = [];
  _$jscoverage['/base.js'].branchData['262'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['296'] = [];
  _$jscoverage['/base.js'].branchData['296'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['302'] = [];
  _$jscoverage['/base.js'].branchData['302'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['331'] = [];
  _$jscoverage['/base.js'].branchData['331'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['336'] = [];
  _$jscoverage['/base.js'].branchData['336'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['364'] = [];
  _$jscoverage['/base.js'].branchData['364'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['369'] = [];
  _$jscoverage['/base.js'].branchData['369'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['388'] = [];
  _$jscoverage['/base.js'].branchData['388'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['392'] = [];
  _$jscoverage['/base.js'].branchData['392'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['397'] = [];
  _$jscoverage['/base.js'].branchData['397'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['398'] = [];
  _$jscoverage['/base.js'].branchData['398'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['410'] = [];
  _$jscoverage['/base.js'].branchData['410'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['417'] = [];
  _$jscoverage['/base.js'].branchData['417'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['420'] = [];
  _$jscoverage['/base.js'].branchData['420'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['439'] = [];
  _$jscoverage['/base.js'].branchData['439'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['439'][2] = new BranchData();
  _$jscoverage['/base.js'].branchData['441'] = [];
  _$jscoverage['/base.js'].branchData['441'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['441'][2] = new BranchData();
  _$jscoverage['/base.js'].branchData['443'] = [];
  _$jscoverage['/base.js'].branchData['443'][1] = new BranchData();
}
_$jscoverage['/base.js'].branchData['443'][1].init(103, 15, 'queue === false');
function visit82_443_1(result) {
  _$jscoverage['/base.js'].branchData['443'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['441'][2].init(155, 25, 'typeof queue === \'string\'');
function visit81_441_2(result) {
  _$jscoverage['/base.js'].branchData['441'][2].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['441'][1].init(86, 119, 'typeof queue === \'string\' || queue === false');
function visit80_441_1(result) {
  _$jscoverage['/base.js'].branchData['441'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['439'][2].init(67, 14, 'queue === null');
function visit79_439_2(result) {
  _$jscoverage['/base.js'].branchData['439'][2].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['439'][1].init(51, 206, 'queue === null || typeof queue === \'string\' || queue === false');
function visit78_439_1(result) {
  _$jscoverage['/base.js'].branchData['439'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['420'][1].init(129, 9, 'q && q[0]');
function visit77_420_1(result) {
  _$jscoverage['/base.js'].branchData['420'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['417'][1].init(1011, 15, 'queue !== false');
function visit76_417_1(result) {
  _$jscoverage['/base.js'].branchData['417'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['410'][1].init(829, 6, 'finish');
function visit75_410_1(result) {
  _$jscoverage['/base.js'].branchData['410'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['398'][1].init(22, 15, 'queue !== false');
function visit74_398_1(result) {
  _$jscoverage['/base.js'].branchData['398'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['397'][1].init(403, 37, '!self.isRunning() && !self.isPaused()');
function visit73_397_1(result) {
  _$jscoverage['/base.js'].branchData['397'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['392'][1].init(255, 18, 'self.__waitTimeout');
function visit72_392_1(result) {
  _$jscoverage['/base.js'].branchData['392'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['388'][1].init(149, 38, 'self.isResolved() || self.isRejected()');
function visit71_388_1(result) {
  _$jscoverage['/base.js'].branchData['388'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['369'][1].init(107, 14, 'q.length === 1');
function visit70_369_1(result) {
  _$jscoverage['/base.js'].branchData['369'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['364'][1].init(114, 15, 'queue === false');
function visit69_364_1(result) {
  _$jscoverage['/base.js'].branchData['364'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['336'][1].init(234, 18, 'self.__waitTimeout');
function visit68_336_1(result) {
  _$jscoverage['/base.js'].branchData['336'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['331'][1].init(48, 15, 'self.isPaused()');
function visit67_331_1(result) {
  _$jscoverage['/base.js'].branchData['331'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['302'][1].init(263, 18, 'self.__waitTimeout');
function visit66_302_1(result) {
  _$jscoverage['/base.js'].branchData['302'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['296'][1].init(48, 16, 'self.isRunning()');
function visit65_296_1(result) {
  _$jscoverage['/base.js'].branchData['296'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['262'][1].init(5002, 27, 'S.isEmptyObject(_propsData)');
function visit64_262_1(result) {
  _$jscoverage['/base.js'].branchData['262'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['256'][1].init(2701, 14, 'exit === false');
function visit63_256_1(result) {
  _$jscoverage['/base.js'].branchData['256'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['242'][1].init(597, 14, 'val === \'hide\'');
function visit62_242_1(result) {
  _$jscoverage['/base.js'].branchData['242'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['239'][1].init(460, 16, 'val === \'toggle\'');
function visit61_239_1(result) {
  _$jscoverage['/base.js'].branchData['239'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['231'][5].init(58, 14, 'val === \'show\'');
function visit60_231_5(result) {
  _$jscoverage['/base.js'].branchData['231'][5].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['231'][4].init(58, 25, 'val === \'show\' && !hidden');
function visit59_231_4(result) {
  _$jscoverage['/base.js'].branchData['231'][4].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['231'][3].init(30, 14, 'val === \'hide\'');
function visit58_231_3(result) {
  _$jscoverage['/base.js'].branchData['231'][3].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['231'][2].init(30, 24, 'val === \'hide\' && hidden');
function visit57_231_2(result) {
  _$jscoverage['/base.js'].branchData['231'][2].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['231'][1].init(30, 53, 'val === \'hide\' && hidden || val === \'show\' && !hidden');
function visit56_231_1(result) {
  _$jscoverage['/base.js'].branchData['231'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['230'][1].init(99, 16, 'specialVals[val]');
function visit55_230_1(result) {
  _$jscoverage['/base.js'].branchData['230'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['226'][1].init(1327, 35, 'Dom.css(node, \'display\') === \'none\'');
function visit54_226_1(result) {
  _$jscoverage['/base.js'].branchData['226'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['217'][1].init(30, 16, 'S.UA.ieMode < 10');
function visit53_217_1(result) {
  _$jscoverage['/base.js'].branchData['217'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['216'][1].init(65, 33, 'Dom.css(node, \'float\') === \'none\'');
function visit52_216_1(result) {
  _$jscoverage['/base.js'].branchData['216'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['215'][2].init(697, 37, 'Dom.css(node, \'display\') === \'inline\'');
function visit51_215_2(result) {
  _$jscoverage['/base.js'].branchData['215'][2].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['215'][1].init(697, 99, 'Dom.css(node, \'display\') === \'inline\' && Dom.css(node, \'float\') === \'none\'');
function visit50_215_1(result) {
  _$jscoverage['/base.js'].branchData['215'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['202'][1].init(177, 21, 'to.width || to.height');
function visit49_202_1(result) {
  _$jscoverage['/base.js'].branchData['202'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['199'][1].init(2120, 39, 'node.nodeType === NodeType.ELEMENT_NODE');
function visit48_199_1(result) {
  _$jscoverage['/base.js'].branchData['199'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['186'][1].init(83, 19, '!(sh in _propsData)');
function visit47_186_1(result) {
  _$jscoverage['/base.js'].branchData['186'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['176'][1].init(125, 9, '_propData');
function visit46_176_1(result) {
  _$jscoverage['/base.js'].branchData['176'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['156'][1].init(22, 21, '!S.isPlainObject(val)');
function visit45_156_1(result) {
  _$jscoverage['/base.js'].branchData['156'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['148'][1].init(276, 17, 'config.delay || 0');
function visit44_148_1(result) {
  _$jscoverage['/base.js'].branchData['148'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['116'][1].init(1510, 22, '!S.isPlainObject(node)');
function visit43_116_1(result) {
  _$jscoverage['/base.js'].branchData['116'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['94'][1].init(211, 6, 'easing');
function visit42_94_1(result) {
  _$jscoverage['/base.js'].branchData['94'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['91'][1].init(110, 8, 'duration');
function visit41_91_1(result) {
  _$jscoverage['/base.js'].branchData['91'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['85'][1].init(569, 25, 'S.isPlainObject(duration)');
function visit40_85_1(result) {
  _$jscoverage['/base.js'].branchData['85'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['79'][2].init(204, 17, 'trimProp !== prop');
function visit39_79_2(result) {
  _$jscoverage['/base.js'].branchData['79'][2].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['79'][1].init(191, 30, '!trimProp || trimProp !== prop');
function visit38_79_1(result) {
  _$jscoverage['/base.js'].branchData['79'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['76'][1].init(76, 8, 'trimProp');
function visit37_76_1(result) {
  _$jscoverage['/base.js'].branchData['76'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['72'][1].init(60, 22, 'typeof to === \'string\'');
function visit36_72_1(result) {
  _$jscoverage['/base.js'].branchData['72'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['68'][1].init(63, 9, 'node.node');
function visit35_68_1(result) {
  _$jscoverage['/base.js'].branchData['68'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['34'][1].init(244, 8, 'complete');
function visit34_34_1(result) {
  _$jscoverage['/base.js'].branchData['34'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['31'][1].init(119, 50, '!S.isEmptyObject(_backupProps = self._backupProps)');
function visit33_31_1(result) {
  _$jscoverage['/base.js'].branchData['31'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/base.js'].functionData[0]++;
  _$jscoverage['/base.js'].lineData[7]++;
  var Dom = require('dom'), Utils = require('./base/utils'), Q = require('./base/queue'), Promise = require('promise'), NodeType = Dom.NodeType, camelCase = S.camelCase, noop = S.noop, specialVals = {
  toggle: 1, 
  hide: 1, 
  show: 1};
  _$jscoverage['/base.js'].lineData[20]++;
  var SHORT_HANDS = require('./base/short-hand');
  _$jscoverage['/base.js'].lineData[22]++;
  var defaultConfig = {
  duration: 1, 
  easing: 'linear'};
  _$jscoverage['/base.js'].lineData[28]++;
  function syncComplete(self) {
    _$jscoverage['/base.js'].functionData[1]++;
    _$jscoverage['/base.js'].lineData[29]++;
    var _backupProps, complete = self.config.complete;
    _$jscoverage['/base.js'].lineData[31]++;
    if (visit33_31_1(!S.isEmptyObject(_backupProps = self._backupProps))) {
      _$jscoverage['/base.js'].lineData[32]++;
      Dom.css(self.node, _backupProps);
    }
    _$jscoverage['/base.js'].lineData[34]++;
    if (visit34_34_1(complete)) {
      _$jscoverage['/base.js'].lineData[35]++;
      complete.call(self);
    }
  }
  _$jscoverage['/base.js'].lineData[64]++;
  function AnimBase(node, to, duration, easing, complete) {
    _$jscoverage['/base.js'].functionData[2]++;
    _$jscoverage['/base.js'].lineData[65]++;
    var self = this;
    _$jscoverage['/base.js'].lineData[66]++;
    var config;
    _$jscoverage['/base.js'].lineData[68]++;
    if (visit35_68_1(node.node)) {
      _$jscoverage['/base.js'].lineData[69]++;
      config = node;
    } else {
      _$jscoverage['/base.js'].lineData[72]++;
      if (visit36_72_1(typeof to === 'string')) {
        _$jscoverage['/base.js'].lineData[73]++;
        to = S.unparam(String(to), ';', ':');
        _$jscoverage['/base.js'].lineData[74]++;
        S.each(to, function(value, prop) {
  _$jscoverage['/base.js'].functionData[3]++;
  _$jscoverage['/base.js'].lineData[75]++;
  var trimProp = S.trim(prop);
  _$jscoverage['/base.js'].lineData[76]++;
  if (visit37_76_1(trimProp)) {
    _$jscoverage['/base.js'].lineData[77]++;
    to[trimProp] = S.trim(value);
  }
  _$jscoverage['/base.js'].lineData[79]++;
  if (visit38_79_1(!trimProp || visit39_79_2(trimProp !== prop))) {
    _$jscoverage['/base.js'].lineData[80]++;
    delete to[prop];
  }
});
      }
      _$jscoverage['/base.js'].lineData[85]++;
      if (visit40_85_1(S.isPlainObject(duration))) {
        _$jscoverage['/base.js'].lineData[86]++;
        config = S.clone(duration);
      } else {
        _$jscoverage['/base.js'].lineData[88]++;
        config = {
  complete: complete};
        _$jscoverage['/base.js'].lineData[91]++;
        if (visit41_91_1(duration)) {
          _$jscoverage['/base.js'].lineData[92]++;
          config.duration = duration;
        }
        _$jscoverage['/base.js'].lineData[94]++;
        if (visit42_94_1(easing)) {
          _$jscoverage['/base.js'].lineData[95]++;
          config.easing = easing;
        }
      }
      _$jscoverage['/base.js'].lineData[98]++;
      config.node = node;
      _$jscoverage['/base.js'].lineData[99]++;
      config.to = to;
    }
    _$jscoverage['/base.js'].lineData[102]++;
    config = S.merge(defaultConfig, config);
    _$jscoverage['/base.js'].lineData[105]++;
    AnimBase.superclass.constructor.call(self);
    _$jscoverage['/base.js'].lineData[106]++;
    Promise.Defer(self);
    _$jscoverage['/base.js'].lineData[112]++;
    self.config = config;
    _$jscoverage['/base.js'].lineData[114]++;
    node = config.node;
    _$jscoverage['/base.js'].lineData[116]++;
    if (visit43_116_1(!S.isPlainObject(node))) {
      _$jscoverage['/base.js'].lineData[117]++;
      node = Dom.get(config.node);
    }
    _$jscoverage['/base.js'].lineData[119]++;
    self.node = self.el = node;
    _$jscoverage['/base.js'].lineData[120]++;
    self._backupProps = {};
    _$jscoverage['/base.js'].lineData[121]++;
    self._propsData = {};
    _$jscoverage['/base.js'].lineData[124]++;
    var newTo = {};
    _$jscoverage['/base.js'].lineData[125]++;
    to = config.to;
    _$jscoverage['/base.js'].lineData[126]++;
    for (var prop in to) {
      _$jscoverage['/base.js'].lineData[127]++;
      newTo[camelCase(prop)] = to[prop];
    }
    _$jscoverage['/base.js'].lineData[129]++;
    config.to = newTo;
  }
  _$jscoverage['/base.js'].lineData[132]++;
  S.extend(AnimBase, Promise, {
  prepareFx: noop, 
  runInternal: function() {
  _$jscoverage['/base.js'].functionData[4]++;
  _$jscoverage['/base.js'].lineData[141]++;
  var self = this, config = self.config, node = self.node, val, _backupProps = self._backupProps, _propsData = self._propsData, to = config.to, defaultDelay = (visit44_148_1(config.delay || 0)), defaultDuration = config.duration;
  _$jscoverage['/base.js'].lineData[152]++;
  Utils.saveRunningAnim(self);
  _$jscoverage['/base.js'].lineData[155]++;
  S.each(to, function(val, prop) {
  _$jscoverage['/base.js'].functionData[5]++;
  _$jscoverage['/base.js'].lineData[156]++;
  if (visit45_156_1(!S.isPlainObject(val))) {
    _$jscoverage['/base.js'].lineData[157]++;
    val = {
  value: val};
  }
  _$jscoverage['/base.js'].lineData[161]++;
  _propsData[prop] = S.mix({
  delay: defaultDelay, 
  easing: config.easing, 
  frame: config.frame, 
  duration: defaultDuration}, val);
});
  _$jscoverage['/base.js'].lineData[172]++;
  S.each(SHORT_HANDS, function(shortHands, p) {
  _$jscoverage['/base.js'].functionData[6]++;
  _$jscoverage['/base.js'].lineData[173]++;
  var origin, _propData = _propsData[p], val;
  _$jscoverage['/base.js'].lineData[176]++;
  if (visit46_176_1(_propData)) {
    _$jscoverage['/base.js'].lineData[177]++;
    val = _propData.value;
    _$jscoverage['/base.js'].lineData[178]++;
    origin = {};
    _$jscoverage['/base.js'].lineData[179]++;
    S.each(shortHands, function(sh) {
  _$jscoverage['/base.js'].functionData[7]++;
  _$jscoverage['/base.js'].lineData[181]++;
  origin[sh] = Dom.css(node, sh);
});
    _$jscoverage['/base.js'].lineData[183]++;
    Dom.css(node, p, val);
    _$jscoverage['/base.js'].lineData[184]++;
    S.each(origin, function(val, sh) {
  _$jscoverage['/base.js'].functionData[8]++;
  _$jscoverage['/base.js'].lineData[186]++;
  if (visit47_186_1(!(sh in _propsData))) {
    _$jscoverage['/base.js'].lineData[187]++;
    _propsData[sh] = S.merge(_propData, {
  value: Dom.css(node, sh)});
  }
  _$jscoverage['/base.js'].lineData[192]++;
  Dom.css(node, sh, val);
});
    _$jscoverage['/base.js'].lineData[195]++;
    delete _propsData[p];
  }
});
  _$jscoverage['/base.js'].lineData[199]++;
  if (visit48_199_1(node.nodeType === NodeType.ELEMENT_NODE)) {
    _$jscoverage['/base.js'].lineData[202]++;
    if (visit49_202_1(to.width || to.height)) {
      _$jscoverage['/base.js'].lineData[207]++;
      var elStyle = node.style;
      _$jscoverage['/base.js'].lineData[208]++;
      S.mix(_backupProps, {
  overflow: elStyle.overflow, 
  'overflow-x': elStyle.overflowX, 
  'overflow-y': elStyle.overflowY});
      _$jscoverage['/base.js'].lineData[213]++;
      elStyle.overflow = 'hidden';
      _$jscoverage['/base.js'].lineData[215]++;
      if (visit50_215_1(visit51_215_2(Dom.css(node, 'display') === 'inline') && visit52_216_1(Dom.css(node, 'float') === 'none'))) {
        _$jscoverage['/base.js'].lineData[217]++;
        if (visit53_217_1(S.UA.ieMode < 10)) {
          _$jscoverage['/base.js'].lineData[218]++;
          elStyle.zoom = 1;
        } else {
          _$jscoverage['/base.js'].lineData[220]++;
          elStyle.display = 'inline-block';
        }
      }
    }
    _$jscoverage['/base.js'].lineData[225]++;
    var exit, hidden;
    _$jscoverage['/base.js'].lineData[226]++;
    hidden = (visit54_226_1(Dom.css(node, 'display') === 'none'));
    _$jscoverage['/base.js'].lineData[227]++;
    S.each(_propsData, function(_propData, prop) {
  _$jscoverage['/base.js'].functionData[9]++;
  _$jscoverage['/base.js'].lineData[228]++;
  val = _propData.value;
  _$jscoverage['/base.js'].lineData[230]++;
  if (visit55_230_1(specialVals[val])) {
    _$jscoverage['/base.js'].lineData[231]++;
    if (visit56_231_1(visit57_231_2(visit58_231_3(val === 'hide') && hidden) || visit59_231_4(visit60_231_5(val === 'show') && !hidden))) {
      _$jscoverage['/base.js'].lineData[233]++;
      self.stop(true);
      _$jscoverage['/base.js'].lineData[234]++;
      exit = false;
      _$jscoverage['/base.js'].lineData[235]++;
      return exit;
    }
    _$jscoverage['/base.js'].lineData[238]++;
    _backupProps[prop] = Dom.style(node, prop);
    _$jscoverage['/base.js'].lineData[239]++;
    if (visit61_239_1(val === 'toggle')) {
      _$jscoverage['/base.js'].lineData[240]++;
      val = hidden ? 'show' : 'hide';
    }
    _$jscoverage['/base.js'].lineData[242]++;
    if (visit62_242_1(val === 'hide')) {
      _$jscoverage['/base.js'].lineData[243]++;
      _propData.value = 0;
      _$jscoverage['/base.js'].lineData[245]++;
      _backupProps.display = 'none';
    } else {
      _$jscoverage['/base.js'].lineData[247]++;
      _propData.value = Dom.css(node, prop);
      _$jscoverage['/base.js'].lineData[249]++;
      Dom.css(node, prop, 0);
      _$jscoverage['/base.js'].lineData[250]++;
      Dom.show(node);
    }
  }
  _$jscoverage['/base.js'].lineData[253]++;
  return undefined;
});
    _$jscoverage['/base.js'].lineData[256]++;
    if (visit63_256_1(exit === false)) {
      _$jscoverage['/base.js'].lineData[257]++;
      return;
    }
  }
  _$jscoverage['/base.js'].lineData[261]++;
  self.startTime = S.now();
  _$jscoverage['/base.js'].lineData[262]++;
  if (visit64_262_1(S.isEmptyObject(_propsData))) {
    _$jscoverage['/base.js'].lineData[263]++;
    self.__totalTime = defaultDuration * 1000;
    _$jscoverage['/base.js'].lineData[264]++;
    self.__waitTimeout = setTimeout(function() {
  _$jscoverage['/base.js'].functionData[10]++;
  _$jscoverage['/base.js'].lineData[265]++;
  self.stop(true);
}, self.__totalTime);
  } else {
    _$jscoverage['/base.js'].lineData[268]++;
    self.prepareFx();
    _$jscoverage['/base.js'].lineData[269]++;
    self.doStart();
  }
}, 
  isRunning: function() {
  _$jscoverage['/base.js'].functionData[11]++;
  _$jscoverage['/base.js'].lineData[278]++;
  return Utils.isAnimRunning(this);
}, 
  isPaused: function() {
  _$jscoverage['/base.js'].functionData[12]++;
  _$jscoverage['/base.js'].lineData[286]++;
  return Utils.isAnimPaused(this);
}, 
  pause: function() {
  _$jscoverage['/base.js'].functionData[13]++;
  _$jscoverage['/base.js'].lineData[295]++;
  var self = this;
  _$jscoverage['/base.js'].lineData[296]++;
  if (visit65_296_1(self.isRunning())) {
    _$jscoverage['/base.js'].lineData[298]++;
    self._runTime = S.now() - self.startTime;
    _$jscoverage['/base.js'].lineData[299]++;
    self.__totalTime -= self._runTime;
    _$jscoverage['/base.js'].lineData[300]++;
    Utils.removeRunningAnim(self);
    _$jscoverage['/base.js'].lineData[301]++;
    Utils.savePausedAnim(self);
    _$jscoverage['/base.js'].lineData[302]++;
    if (visit66_302_1(self.__waitTimeout)) {
      _$jscoverage['/base.js'].lineData[303]++;
      clearTimeout(self.__waitTimeout);
    } else {
      _$jscoverage['/base.js'].lineData[305]++;
      self.doStop();
    }
  }
  _$jscoverage['/base.js'].lineData[308]++;
  return self;
}, 
  doStop: noop, 
  doStart: noop, 
  resume: function() {
  _$jscoverage['/base.js'].functionData[14]++;
  _$jscoverage['/base.js'].lineData[330]++;
  var self = this;
  _$jscoverage['/base.js'].lineData[331]++;
  if (visit67_331_1(self.isPaused())) {
    _$jscoverage['/base.js'].lineData[333]++;
    self.startTime = S.now() - self._runTime;
    _$jscoverage['/base.js'].lineData[334]++;
    Utils.removePausedAnim(self);
    _$jscoverage['/base.js'].lineData[335]++;
    Utils.saveRunningAnim(self);
    _$jscoverage['/base.js'].lineData[336]++;
    if (visit68_336_1(self.__waitTimeout)) {
      _$jscoverage['/base.js'].lineData[337]++;
      self.__waitTimeout = setTimeout(function() {
  _$jscoverage['/base.js'].functionData[15]++;
  _$jscoverage['/base.js'].lineData[338]++;
  self.stop(true);
}, self.__totalTime);
    } else {
      _$jscoverage['/base.js'].lineData[341]++;
      self.beforeResume();
      _$jscoverage['/base.js'].lineData[342]++;
      self.doStart();
    }
  }
  _$jscoverage['/base.js'].lineData[345]++;
  return self;
}, 
  'beforeResume': noop, 
  run: function() {
  _$jscoverage['/base.js'].functionData[16]++;
  _$jscoverage['/base.js'].lineData[360]++;
  var self = this, q, queue = self.config.queue;
  _$jscoverage['/base.js'].lineData[364]++;
  if (visit69_364_1(queue === false)) {
    _$jscoverage['/base.js'].lineData[365]++;
    self.runInternal();
  } else {
    _$jscoverage['/base.js'].lineData[368]++;
    q = Q.queue(self.node, queue, self);
    _$jscoverage['/base.js'].lineData[369]++;
    if (visit70_369_1(q.length === 1)) {
      _$jscoverage['/base.js'].lineData[370]++;
      self.runInternal();
    }
  }
  _$jscoverage['/base.js'].lineData[374]++;
  return self;
}, 
  stop: function(finish) {
  _$jscoverage['/base.js'].functionData[17]++;
  _$jscoverage['/base.js'].lineData[383]++;
  var self = this, node = self.node, q, queue = self.config.queue;
  _$jscoverage['/base.js'].lineData[388]++;
  if (visit71_388_1(self.isResolved() || self.isRejected())) {
    _$jscoverage['/base.js'].lineData[389]++;
    return self;
  }
  _$jscoverage['/base.js'].lineData[392]++;
  if (visit72_392_1(self.__waitTimeout)) {
    _$jscoverage['/base.js'].lineData[393]++;
    clearTimeout(self.__waitTimeout);
    _$jscoverage['/base.js'].lineData[394]++;
    self.__waitTimeout = 0;
  }
  _$jscoverage['/base.js'].lineData[397]++;
  if (visit73_397_1(!self.isRunning() && !self.isPaused())) {
    _$jscoverage['/base.js'].lineData[398]++;
    if (visit74_398_1(queue !== false)) {
      _$jscoverage['/base.js'].lineData[400]++;
      Q.remove(node, queue, self);
    }
    _$jscoverage['/base.js'].lineData[402]++;
    return self;
  }
  _$jscoverage['/base.js'].lineData[405]++;
  self.doStop(finish);
  _$jscoverage['/base.js'].lineData[406]++;
  Utils.removeRunningAnim(self);
  _$jscoverage['/base.js'].lineData[407]++;
  Utils.removePausedAnim(self);
  _$jscoverage['/base.js'].lineData[409]++;
  var defer = self.defer;
  _$jscoverage['/base.js'].lineData[410]++;
  if (visit75_410_1(finish)) {
    _$jscoverage['/base.js'].lineData[411]++;
    syncComplete(self);
    _$jscoverage['/base.js'].lineData[412]++;
    defer.resolve([self]);
  } else {
    _$jscoverage['/base.js'].lineData[414]++;
    defer.reject([self]);
  }
  _$jscoverage['/base.js'].lineData[417]++;
  if (visit76_417_1(queue !== false)) {
    _$jscoverage['/base.js'].lineData[419]++;
    q = Q.dequeue(node, queue);
    _$jscoverage['/base.js'].lineData[420]++;
    if (visit77_420_1(q && q[0])) {
      _$jscoverage['/base.js'].lineData[421]++;
      q[0].runInternal();
    }
  }
  _$jscoverage['/base.js'].lineData[424]++;
  return self;
}});
  _$jscoverage['/base.js'].lineData[428]++;
  var Statics = AnimBase.Statics = {
  isRunning: Utils.isElRunning, 
  isPaused: Utils.isElPaused, 
  stop: Utils.stopEl, 
  Q: Q};
  _$jscoverage['/base.js'].lineData[435]++;
  S.each(['pause', 'resume'], function(action) {
  _$jscoverage['/base.js'].functionData[18]++;
  _$jscoverage['/base.js'].lineData[436]++;
  Statics[action] = function(node, queue) {
  _$jscoverage['/base.js'].functionData[19]++;
  _$jscoverage['/base.js'].lineData[437]++;
  if (visit78_439_1(visit79_439_2(queue === null) || visit80_441_1(visit81_441_2(typeof queue === 'string') || visit82_443_1(queue === false)))) {
    _$jscoverage['/base.js'].lineData[445]++;
    return Utils.pauseOrResumeQueue(node, queue, action);
  }
  _$jscoverage['/base.js'].lineData[447]++;
  return Utils.pauseOrResumeQueue(node, undefined, action);
};
});
  _$jscoverage['/base.js'].lineData[451]++;
  return AnimBase;
});
