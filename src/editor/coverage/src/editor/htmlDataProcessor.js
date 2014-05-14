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
if (! _$jscoverage['/editor/htmlDataProcessor.js']) {
  _$jscoverage['/editor/htmlDataProcessor.js'] = {};
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData = [];
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[10] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[11] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[12] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[13] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[14] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[15] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[16] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[17] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[20] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[21] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[22] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[24] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[27] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[28] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[29] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[30] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[31] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[32] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[34] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[35] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[38] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[40] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[44] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[46] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[50] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[51] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[54] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[55] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[56] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[57] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[62] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[81] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[90] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[92] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[95] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[97] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[98] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[99] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[100] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[105] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[108] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[111] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[112] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[114] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[115] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[117] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[118] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[125] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[126] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[128] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[139] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[140] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[142] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[158] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[159] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[160] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[162] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[165] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[170] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[171] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[172] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[177] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[178] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[186] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[191] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[194] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[195] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[198] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[201] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[203] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[206] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[207] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[208] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[209] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[210] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[211] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[212] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[217] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[218] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[220] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[228] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[229] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[230] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[233] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[234] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[240] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[241] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[242] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[245] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[250] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[254] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[255] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[256] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[262] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[263] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[264] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[266] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[267] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[268] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[271] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[272] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[278] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[280] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[286] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[291] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[292] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[293] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[296] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[297] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[299] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[304] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[306] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[309] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[312] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[314] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[315] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[318] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[319] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[320] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[324] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[325] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[326] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[330] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[331] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[334] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[335] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[338] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[344] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[346] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[352] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[354] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[355] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[356] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[361] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[368] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[370] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[374] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[378] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[383] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[385] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[386] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[389] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[391] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[396] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[399] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[401] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[403] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[409] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[411] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[412] = 0;
}
if (! _$jscoverage['/editor/htmlDataProcessor.js'].functionData) {
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData = [];
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[0] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[1] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[2] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[3] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[4] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[5] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[6] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[7] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[8] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[9] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[10] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[11] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[12] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[13] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[14] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[15] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[16] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[17] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[18] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[19] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[20] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[21] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[22] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[23] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[24] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[25] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[26] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[27] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[28] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[29] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[30] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[31] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[32] = 0;
}
if (! _$jscoverage['/editor/htmlDataProcessor.js'].branchData) {
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData = {};
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['13'] = [];
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['13'][1] = new BranchData();
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['21'] = [];
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['21'][1] = new BranchData();
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['27'] = [];
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['27'][1] = new BranchData();
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['28'] = [];
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['28'][1] = new BranchData();
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['31'] = [];
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['31'][1] = new BranchData();
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['31'][2] = new BranchData();
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['31'][3] = new BranchData();
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['34'] = [];
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['34'][1] = new BranchData();
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['92'] = [];
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['92'][1] = new BranchData();
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['97'] = [];
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['97'][1] = new BranchData();
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['99'] = [];
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['99'][1] = new BranchData();
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['111'] = [];
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['111'][1] = new BranchData();
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['111'][2] = new BranchData();
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['114'] = [];
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['114'][1] = new BranchData();
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['117'] = [];
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['117'][1] = new BranchData();
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['125'] = [];
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['125'][1] = new BranchData();
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['139'] = [];
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['139'][1] = new BranchData();
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['158'] = [];
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['158'][1] = new BranchData();
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['165'] = [];
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['165'][1] = new BranchData();
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['198'] = [];
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['198'][1] = new BranchData();
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['199'] = [];
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['199'][1] = new BranchData();
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['199'][2] = new BranchData();
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['199'][3] = new BranchData();
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['200'] = [];
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['200'][1] = new BranchData();
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['200'][2] = new BranchData();
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['208'] = [];
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['208'][1] = new BranchData();
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['209'] = [];
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['209'][1] = new BranchData();
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['209'][2] = new BranchData();
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['209'][3] = new BranchData();
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['211'] = [];
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['211'][1] = new BranchData();
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['211'][2] = new BranchData();
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['220'] = [];
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['220'][1] = new BranchData();
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['223'] = [];
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['223'][1] = new BranchData();
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['223'][2] = new BranchData();
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['224'] = [];
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['224'][1] = new BranchData();
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['230'] = [];
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['230'][1] = new BranchData();
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['233'] = [];
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['233'][1] = new BranchData();
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['242'] = [];
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['242'][1] = new BranchData();
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['255'] = [];
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['255'][1] = new BranchData();
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['296'] = [];
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['296'][1] = new BranchData();
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['344'] = [];
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['344'][1] = new BranchData();
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['361'] = [];
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['361'][1] = new BranchData();
}
_$jscoverage['/editor/htmlDataProcessor.js'].branchData['361'][1].init(85, 25, '_dataFilter || dataFilter');
function visit385_361_1(result) {
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['361'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/htmlDataProcessor.js'].branchData['344'][1].init(25, 9, 'UA.webkit');
function visit384_344_1(result) {
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['344'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/htmlDataProcessor.js'].branchData['296'][1].init(183, 49, 'attributes.indexOf(\'_keSaved_\' + attrName) === -1');
function visit383_296_1(result) {
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['296'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/htmlDataProcessor.js'].branchData['255'][1].init(25, 17, '!(\'br\' in dtd[i])');
function visit382_255_1(result) {
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['255'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/htmlDataProcessor.js'].branchData['242'][1].init(65, 26, 'blockNeedsExtension(block)');
function visit381_242_1(result) {
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['242'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/htmlDataProcessor.js'].branchData['233'][1].init(138, 7, '!OLD_IE');
function visit380_233_1(result) {
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['233'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/htmlDataProcessor.js'].branchData['230'][1].init(65, 26, 'blockNeedsExtension(block)');
function visit379_230_1(result) {
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['230'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/htmlDataProcessor.js'].branchData['224'][1].init(52, 30, 'lastChild.nodeName === \'input\'');
function visit378_224_1(result) {
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['224'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/htmlDataProcessor.js'].branchData['223'][2].init(335, 25, 'block.nodeName === \'form\'');
function visit377_223_2(result) {
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['223'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/htmlDataProcessor.js'].branchData['223'][1].init(188, 83, 'block.nodeName === \'form\' && lastChild.nodeName === \'input\'');
function visit376_223_1(result) {
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['223'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/htmlDataProcessor.js'].branchData['220'][1].init(144, 272, '!lastChild || block.nodeName === \'form\' && lastChild.nodeName === \'input\'');
function visit375_220_1(result) {
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['220'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/htmlDataProcessor.js'].branchData['211'][2].init(182, 24, 'lastChild.nodeType === 3');
function visit374_211_2(result) {
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['211'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/htmlDataProcessor.js'].branchData['211'][1].init(182, 67, 'lastChild.nodeType === 3 && tailNbspRegex.test(lastChild.nodeValue)');
function visit373_211_1(result) {
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['211'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/htmlDataProcessor.js'].branchData['209'][3].init(57, 27, 'lastChild.nodeName === \'br\'');
function visit372_209_3(result) {
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['209'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/htmlDataProcessor.js'].branchData['209'][2].init(29, 24, 'lastChild.nodeType === 1');
function visit371_209_2(result) {
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['209'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/htmlDataProcessor.js'].branchData['209'][1].init(29, 55, 'lastChild.nodeType === 1 && lastChild.nodeName === \'br\'');
function visit370_209_1(result) {
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['209'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/htmlDataProcessor.js'].branchData['208'][1].init(88, 9, 'lastChild');
function visit369_208_1(result) {
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['208'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/htmlDataProcessor.js'].branchData['200'][2].init(115, 19, 'last.nodeType === 1');
function visit368_200_2(result) {
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['200'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/htmlDataProcessor.js'].branchData['200'][1].init(80, 43, 'last.nodeType === 1 && isEmptyElement(last)');
function visit367_200_1(result) {
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['200'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/htmlDataProcessor.js'].branchData['199'][3].init(32, 19, 'last.nodeType === 3');
function visit366_199_3(result) {
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['199'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/htmlDataProcessor.js'].branchData['199'][2].init(32, 49, 'last.nodeType === 3 && !util.trim(last.nodeValue)');
function visit365_199_2(result) {
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['199'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/htmlDataProcessor.js'].branchData['199'][1].init(32, 124, 'last.nodeType === 3 && !util.trim(last.nodeValue) || last.nodeType === 1 && isEmptyElement(last)');
function visit364_199_1(result) {
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['199'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/htmlDataProcessor.js'].branchData['198'][1].init(196, 158, 'last && (last.nodeType === 3 && !util.trim(last.nodeValue) || last.nodeType === 1 && isEmptyElement(last))');
function visit363_198_1(result) {
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['198'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/htmlDataProcessor.js'].branchData['165'][1].init(5182, 6, 'OLD_IE');
function visit362_165_1(result) {
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['165'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/htmlDataProcessor.js'].branchData['158'][1].init(99, 74, 'contents.substr(0, protectedSourceMarker.length) === protectedSourceMarker');
function visit361_158_1(result) {
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['158'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/htmlDataProcessor.js'].branchData['139'][1].init(33, 13, '!util.trim(v)');
function visit360_139_1(result) {
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['139'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/htmlDataProcessor.js'].branchData['125'][1].init(33, 60, '!(element.childNodes.length) && !(element.attributes.length)');
function visit359_125_1(result) {
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['125'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/htmlDataProcessor.js'].branchData['117'][1].init(364, 12, 'parentHeight');
function visit358_117_1(result) {
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['117'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/htmlDataProcessor.js'].branchData['114'][1].init(199, 11, 'parentWidth');
function visit357_114_1(result) {
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['114'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/htmlDataProcessor.js'].branchData['111'][2].init(251, 28, 'parent.nodeName === \'object\'');
function visit356_111_2(result) {
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['111'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/htmlDataProcessor.js'].branchData['111'][1].init(241, 38, 'parent && parent.nodeName === \'object\'');
function visit355_111_1(result) {
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['111'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/htmlDataProcessor.js'].branchData['99'][1].init(131, 40, 'element.getAttribute(savedAttributeName)');
function visit354_99_1(result) {
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['99'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/htmlDataProcessor.js'].branchData['97'][1].init(322, 25, 'i < attributeNames.length');
function visit353_97_1(result) {
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['97'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/htmlDataProcessor.js'].branchData['92'][1].init(99, 17, 'attributes.length');
function visit352_92_1(result) {
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['92'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/htmlDataProcessor.js'].branchData['34'][1].init(237, 22, '!isEmptyElement(child)');
function visit351_34_1(result) {
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['34'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/htmlDataProcessor.js'].branchData['31'][3].init(109, 31, 'nodeType === NodeType.TEXT_NODE');
function visit350_31_3(result) {
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['31'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/htmlDataProcessor.js'].branchData['31'][2].init(109, 51, 'nodeType === NodeType.TEXT_NODE && !child.nodeValue');
function visit349_31_2(result) {
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['31'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/htmlDataProcessor.js'].branchData['31'][1].init(107, 54, '!(nodeType === NodeType.TEXT_NODE && !child.nodeValue)');
function visit348_31_1(result) {
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['31'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/htmlDataProcessor.js'].branchData['28'][1].init(25, 5, 'i < l');
function visit347_28_1(result) {
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['28'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/htmlDataProcessor.js'].branchData['27'][1].init(192, 1, 'l');
function visit346_27_1(result) {
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['27'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/htmlDataProcessor.js'].branchData['21'][1].init(13, 30, '!dtd.$removeEmpty[el.nodeName]');
function visit345_21_1(result) {
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['21'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/htmlDataProcessor.js'].branchData['13'][1].init(91, 14, 'UA.ieMode < 11');
function visit344_13_1(result) {
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['13'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/htmlDataProcessor.js'].lineData[10]++;
KISSY.add(function(S, require) {
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[0]++;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[11]++;
  var HtmlParser = require('html-parser');
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[12]++;
  var UA = require('ua');
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[13]++;
  var OLD_IE = visit344_13_1(UA.ieMode < 11);
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[14]++;
  var Node = require('node');
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[15]++;
  var dtd = HtmlParser.DTD;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[16]++;
  var NodeType = Node.NodeType;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[17]++;
  var util = S;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[20]++;
  function isEmptyElement(el) {
    _$jscoverage['/editor/htmlDataProcessor.js'].functionData[1]++;
    _$jscoverage['/editor/htmlDataProcessor.js'].lineData[21]++;
    if (visit345_21_1(!dtd.$removeEmpty[el.nodeName])) {
      _$jscoverage['/editor/htmlDataProcessor.js'].lineData[22]++;
      return false;
    }
    _$jscoverage['/editor/htmlDataProcessor.js'].lineData[24]++;
    var childNodes = el.childNodes, i, child, l = childNodes.length;
    _$jscoverage['/editor/htmlDataProcessor.js'].lineData[27]++;
    if (visit346_27_1(l)) {
      _$jscoverage['/editor/htmlDataProcessor.js'].lineData[28]++;
      for (i = 0; visit347_28_1(i < l); i++) {
        _$jscoverage['/editor/htmlDataProcessor.js'].lineData[29]++;
        child = childNodes[i];
        _$jscoverage['/editor/htmlDataProcessor.js'].lineData[30]++;
        var nodeType = child.nodeType;
        _$jscoverage['/editor/htmlDataProcessor.js'].lineData[31]++;
        if (visit348_31_1(!(visit349_31_2(visit350_31_3(nodeType === NodeType.TEXT_NODE) && !child.nodeValue)))) {
          _$jscoverage['/editor/htmlDataProcessor.js'].lineData[32]++;
          return false;
        }
        _$jscoverage['/editor/htmlDataProcessor.js'].lineData[34]++;
        if (visit351_34_1(!isEmptyElement(child))) {
          _$jscoverage['/editor/htmlDataProcessor.js'].lineData[35]++;
          return false;
        }
      }
      _$jscoverage['/editor/htmlDataProcessor.js'].lineData[38]++;
      return true;
    } else {
      _$jscoverage['/editor/htmlDataProcessor.js'].lineData[40]++;
      return true;
    }
  }
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[44]++;
  return {
  init: function(editor) {
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[2]++;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[46]++;
  var htmlFilter = new HtmlParser.Filter(), dataFilter = new HtmlParser.Filter();
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[50]++;
  function filterInline(element) {
    _$jscoverage['/editor/htmlDataProcessor.js'].functionData[3]++;
    _$jscoverage['/editor/htmlDataProcessor.js'].lineData[51]++;
    return !isEmptyElement(element);
  }
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[54]++;
  (function() {
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[4]++;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[55]++;
  function wrapAsComment(element) {
    _$jscoverage['/editor/htmlDataProcessor.js'].functionData[5]++;
    _$jscoverage['/editor/htmlDataProcessor.js'].lineData[56]++;
    var html = HtmlParser.serialize(element);
    _$jscoverage['/editor/htmlDataProcessor.js'].lineData[57]++;
    return new HtmlParser.Comment(protectedSourceMarker + encodeURIComponent(html).replace(/--/g, '%2D%2D'));
  }
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[62]++;
  var defaultDataFilterRules = {
  tagNames: [[/^\?xml.*$/i, ''], [/^.*namespace.*$/i, '']], 
  attributeNames: [[/^on/, 'ke_on'], [/^lang$/, '']], 
  tags: {
  script: wrapAsComment, 
  noscript: wrapAsComment, 
  span: filterInline}};
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[81]++;
  var defaultHTMLFilterRules = {
  tagNames: [[(/^ke:/), ''], [(/^\?xml:namespace$/), '']], 
  tags: {
  $: function(element) {
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[6]++;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[90]++;
  var attributes = element.attributes;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[92]++;
  if (visit352_92_1(attributes.length)) {
    _$jscoverage['/editor/htmlDataProcessor.js'].lineData[95]++;
    var attributeNames = ['name', 'href', 'src'], savedAttributeName;
    _$jscoverage['/editor/htmlDataProcessor.js'].lineData[97]++;
    for (var i = 0; visit353_97_1(i < attributeNames.length); i++) {
      _$jscoverage['/editor/htmlDataProcessor.js'].lineData[98]++;
      savedAttributeName = '_keSaved_' + attributeNames[i];
      _$jscoverage['/editor/htmlDataProcessor.js'].lineData[99]++;
      if (visit354_99_1(element.getAttribute(savedAttributeName))) {
        _$jscoverage['/editor/htmlDataProcessor.js'].lineData[100]++;
        element.removeAttribute(attributeNames[i]);
      }
    }
  }
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[105]++;
  return element;
}, 
  embed: function(element) {
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[7]++;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[108]++;
  var parent = element.parentNode;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[111]++;
  if (visit355_111_1(parent && visit356_111_2(parent.nodeName === 'object'))) {
    _$jscoverage['/editor/htmlDataProcessor.js'].lineData[112]++;
    var parentWidth = parent.getAttribute('width'), parentHeight = parent.getAttribute('height');
    _$jscoverage['/editor/htmlDataProcessor.js'].lineData[114]++;
    if (visit357_114_1(parentWidth)) {
      _$jscoverage['/editor/htmlDataProcessor.js'].lineData[115]++;
      element.setAttribute('width', parentWidth);
    }
    _$jscoverage['/editor/htmlDataProcessor.js'].lineData[117]++;
    if (visit358_117_1(parentHeight)) {
      _$jscoverage['/editor/htmlDataProcessor.js'].lineData[118]++;
      element.setAttribute('width', parentHeight);
    }
  }
}, 
  a: function(element) {
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[8]++;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[125]++;
  if (visit359_125_1(!(element.childNodes.length) && !(element.attributes.length))) {
    _$jscoverage['/editor/htmlDataProcessor.js'].lineData[126]++;
    return false;
  }
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[128]++;
  return undefined;
}, 
  span: filterInline, 
  strong: filterInline, 
  em: filterInline, 
  del: filterInline, 
  u: filterInline}, 
  attributes: {
  style: function(v) {
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[9]++;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[139]++;
  if (visit360_139_1(!util.trim(v))) {
    _$jscoverage['/editor/htmlDataProcessor.js'].lineData[140]++;
    return false;
  }
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[142]++;
  return undefined;
}}, 
  attributeNames: [[(/^_keSaved_/), ''], [(/^ke_on/), 'on'], [(/^_ke.*/), ''], [(/^ke:.*$/), ''], [(/^_ks.*/), '']], 
  comment: function(contents) {
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[10]++;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[158]++;
  if (visit361_158_1(contents.substr(0, protectedSourceMarker.length) === protectedSourceMarker)) {
    _$jscoverage['/editor/htmlDataProcessor.js'].lineData[159]++;
    contents = util.trim(util.urlDecode(contents.substr(protectedSourceMarker.length)));
    _$jscoverage['/editor/htmlDataProcessor.js'].lineData[160]++;
    return HtmlParser.parse(contents).childNodes[0];
  }
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[162]++;
  return undefined;
}};
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[165]++;
  if (visit362_165_1(OLD_IE)) {
    _$jscoverage['/editor/htmlDataProcessor.js'].lineData[170]++;
    defaultHTMLFilterRules.attributes.style = function(value) {
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[11]++;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[171]++;
  return value.replace(/(^|;)([^:]+)/g, function(match) {
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[12]++;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[172]++;
  return match.toLowerCase();
});
};
  }
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[177]++;
  htmlFilter.addRules(defaultHTMLFilterRules);
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[178]++;
  dataFilter.addRules(defaultDataFilterRules);
})();
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[186]++;
  (function() {
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[13]++;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[191]++;
  var tailNbspRegex = /^[\t\r\n ]*(?:&nbsp;|\xa0)[\t\r\n ]*$/;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[194]++;
  function lastNoneSpaceChild(block) {
    _$jscoverage['/editor/htmlDataProcessor.js'].functionData[14]++;
    _$jscoverage['/editor/htmlDataProcessor.js'].lineData[195]++;
    var childNodes = block.childNodes, lastIndex = childNodes.length, last = childNodes[lastIndex - 1];
    _$jscoverage['/editor/htmlDataProcessor.js'].lineData[198]++;
    while (visit363_198_1(last && (visit364_199_1(visit365_199_2(visit366_199_3(last.nodeType === 3) && !util.trim(last.nodeValue)) || visit367_200_1(visit368_200_2(last.nodeType === 1) && isEmptyElement(last)))))) {
      _$jscoverage['/editor/htmlDataProcessor.js'].lineData[201]++;
      last = childNodes[--lastIndex];
    }
    _$jscoverage['/editor/htmlDataProcessor.js'].lineData[203]++;
    return last;
  }
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[206]++;
  function trimFillers(block) {
    _$jscoverage['/editor/htmlDataProcessor.js'].functionData[15]++;
    _$jscoverage['/editor/htmlDataProcessor.js'].lineData[207]++;
    var lastChild = lastNoneSpaceChild(block);
    _$jscoverage['/editor/htmlDataProcessor.js'].lineData[208]++;
    if (visit369_208_1(lastChild)) {
      _$jscoverage['/editor/htmlDataProcessor.js'].lineData[209]++;
      if (visit370_209_1(visit371_209_2(lastChild.nodeType === 1) && visit372_209_3(lastChild.nodeName === 'br'))) {
        _$jscoverage['/editor/htmlDataProcessor.js'].lineData[210]++;
        block.removeChild(lastChild);
      } else {
        _$jscoverage['/editor/htmlDataProcessor.js'].lineData[211]++;
        if (visit373_211_1(visit374_211_2(lastChild.nodeType === 3) && tailNbspRegex.test(lastChild.nodeValue))) {
          _$jscoverage['/editor/htmlDataProcessor.js'].lineData[212]++;
          block.removeChild(lastChild);
        }
      }
    }
  }
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[217]++;
  function blockNeedsExtension(block) {
    _$jscoverage['/editor/htmlDataProcessor.js'].functionData[16]++;
    _$jscoverage['/editor/htmlDataProcessor.js'].lineData[218]++;
    var lastChild = lastNoneSpaceChild(block);
    _$jscoverage['/editor/htmlDataProcessor.js'].lineData[220]++;
    return visit375_220_1(!lastChild || visit376_223_1(visit377_223_2(block.nodeName === 'form') && visit378_224_1(lastChild.nodeName === 'input')));
  }
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[228]++;
  function extendBlockForDisplay(block) {
    _$jscoverage['/editor/htmlDataProcessor.js'].functionData[17]++;
    _$jscoverage['/editor/htmlDataProcessor.js'].lineData[229]++;
    trimFillers(block);
    _$jscoverage['/editor/htmlDataProcessor.js'].lineData[230]++;
    if (visit379_230_1(blockNeedsExtension(block))) {
      _$jscoverage['/editor/htmlDataProcessor.js'].lineData[233]++;
      if (visit380_233_1(!OLD_IE)) {
        _$jscoverage['/editor/htmlDataProcessor.js'].lineData[234]++;
        block.appendChild(new HtmlParser.Tag('br'));
      }
    }
  }
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[240]++;
  function extendBlockForOutput(block) {
    _$jscoverage['/editor/htmlDataProcessor.js'].functionData[18]++;
    _$jscoverage['/editor/htmlDataProcessor.js'].lineData[241]++;
    trimFillers(block);
    _$jscoverage['/editor/htmlDataProcessor.js'].lineData[242]++;
    if (visit381_242_1(blockNeedsExtension(block))) {
      _$jscoverage['/editor/htmlDataProcessor.js'].lineData[245]++;
      block.appendChild(new HtmlParser.Text('\xa0'));
    }
  }
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[250]++;
  var blockLikeTags = util.merge(dtd.$block, dtd.$listItem, dtd.$tableContent), i;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[254]++;
  for (i in blockLikeTags) {
    _$jscoverage['/editor/htmlDataProcessor.js'].lineData[255]++;
    if (visit382_255_1(!('br' in dtd[i]))) {
      _$jscoverage['/editor/htmlDataProcessor.js'].lineData[256]++;
      delete blockLikeTags[i];
    }
  }
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[262]++;
  delete blockLikeTags.pre;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[263]++;
  var defaultDataBlockFilterRules = {
  tags: {}};
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[264]++;
  var defaultHTMLBlockFilterRules = {
  tags: {}};
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[266]++;
  for (i in blockLikeTags) {
    _$jscoverage['/editor/htmlDataProcessor.js'].lineData[267]++;
    defaultDataBlockFilterRules.tags[i] = extendBlockForDisplay;
    _$jscoverage['/editor/htmlDataProcessor.js'].lineData[268]++;
    defaultHTMLBlockFilterRules.tags[i] = extendBlockForOutput;
  }
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[271]++;
  dataFilter.addRules(defaultDataBlockFilterRules);
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[272]++;
  htmlFilter.addRules(defaultHTMLBlockFilterRules);
})();
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[278]++;
  htmlFilter.addRules({
  text: function(text) {
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[19]++;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[280]++;
  return text.replace(/\xa0/g, '&nbsp;');
}});
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[286]++;
  var protectElementRegex = /<(a|area|img|input)\b([^>]*)>/gi, protectAttributeRegex = /\b(href|src|name)\s*=\s*(?:(?:"[^"]*")|(?:'[^']*')|(?:[^ "'>]+))/gi;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[291]++;
  function protectAttributes(html) {
    _$jscoverage['/editor/htmlDataProcessor.js'].functionData[20]++;
    _$jscoverage['/editor/htmlDataProcessor.js'].lineData[292]++;
    return html.replace(protectElementRegex, function(element, tag, attributes) {
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[21]++;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[293]++;
  return '<' + tag + attributes.replace(protectAttributeRegex, function(fullAttr, attrName) {
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[22]++;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[296]++;
  if (visit383_296_1(attributes.indexOf('_keSaved_' + attrName) === -1)) {
    _$jscoverage['/editor/htmlDataProcessor.js'].lineData[297]++;
    return ' _keSaved_' + fullAttr + ' ' + fullAttr;
  }
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[299]++;
  return fullAttr;
}) + '>';
});
  }
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[304]++;
  var protectedSourceMarker = '{ke_protected}';
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[306]++;
  var protectElementsRegex = /(?:<textarea[^>]*>[\s\S]*<\/textarea>)|(?:<style[^>]*>[\s\S]*<\/style>)|(?:<script[^>]*>[\s\S]*<\/script>)|(?:<(:?link|meta|base)[^>]*>)/gi, encodedElementsRegex = /<ke:encoded>([^<]*)<\/ke:encoded>/gi;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[309]++;
  var protectElementNamesRegex = /(<\/?)((?:object|embed|param|html|body|head|title|noscript)[^>]*>)/gi, unprotectElementNamesRegex = /(<\/?)ke:((?:object|embed|param|html|body|head|title|noscript)[^>]*>)/gi;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[312]++;
  var protectSelfClosingRegex = /<ke:(param|embed)([^>]*?)\/?>(?!\s*<\/ke:\1)/gi;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[314]++;
  function protectSelfClosingElements(html) {
    _$jscoverage['/editor/htmlDataProcessor.js'].functionData[23]++;
    _$jscoverage['/editor/htmlDataProcessor.js'].lineData[315]++;
    return html.replace(protectSelfClosingRegex, '<ke:$1$2></ke:$1>');
  }
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[318]++;
  function protectElements(html) {
    _$jscoverage['/editor/htmlDataProcessor.js'].functionData[24]++;
    _$jscoverage['/editor/htmlDataProcessor.js'].lineData[319]++;
    return html.replace(protectElementsRegex, function(match) {
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[25]++;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[320]++;
  return '<ke:encoded>' + encodeURIComponent(match) + '</ke:encoded>';
});
  }
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[324]++;
  function unprotectElements(html) {
    _$jscoverage['/editor/htmlDataProcessor.js'].functionData[26]++;
    _$jscoverage['/editor/htmlDataProcessor.js'].lineData[325]++;
    return html.replace(encodedElementsRegex, function(match, encoded) {
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[27]++;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[326]++;
  return util.urlDecode(encoded);
});
  }
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[330]++;
  function protectElementsNames(html) {
    _$jscoverage['/editor/htmlDataProcessor.js'].functionData[28]++;
    _$jscoverage['/editor/htmlDataProcessor.js'].lineData[331]++;
    return html.replace(protectElementNamesRegex, '$1ke:$2');
  }
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[334]++;
  function unprotectElementNames(html) {
    _$jscoverage['/editor/htmlDataProcessor.js'].functionData[29]++;
    _$jscoverage['/editor/htmlDataProcessor.js'].lineData[335]++;
    return html.replace(unprotectElementNamesRegex, '$1$2');
  }
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[338]++;
  editor.htmlDataProcessor = {
  dataFilter: dataFilter, 
  htmlFilter: htmlFilter, 
  toHtml: function(html) {
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[30]++;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[344]++;
  if (visit384_344_1(UA.webkit)) {
    _$jscoverage['/editor/htmlDataProcessor.js'].lineData[346]++;
    html = html.replace(/\u200b/g, '');
  }
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[352]++;
  var writer = new HtmlParser.BeautifyWriter(), n = new HtmlParser.Parser(html).parse();
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[354]++;
  n.writeHtml(writer, htmlFilter);
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[355]++;
  html = writer.getHtml();
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[356]++;
  return html;
}, 
  toDataFormat: function(html, _dataFilter) {
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[31]++;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[361]++;
  _dataFilter = visit385_361_1(_dataFilter || dataFilter);
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[368]++;
  html = protectElements(html);
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[370]++;
  html = protectAttributes(html);
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[374]++;
  html = protectElementsNames(html);
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[378]++;
  html = protectSelfClosingElements(html);
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[383]++;
  var div = new Node('<div>');
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[385]++;
  div.html('a' + html);
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[386]++;
  html = div.html().substr(1);
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[389]++;
  html = unprotectElementNames(html);
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[391]++;
  html = unprotectElements(html);
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[396]++;
  var writer = new HtmlParser.BasicWriter(), n = new HtmlParser.Parser(html).parse();
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[399]++;
  n.writeHtml(writer, _dataFilter);
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[401]++;
  html = writer.getHtml();
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[403]++;
  return html;
}, 
  toServer: function(html) {
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[32]++;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[409]++;
  var writer = new HtmlParser.MinifyWriter(), n = new HtmlParser.Parser(html).parse();
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[411]++;
  n.writeHtml(writer, htmlFilter);
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[412]++;
  return writer.getHtml();
}};
}};
});
