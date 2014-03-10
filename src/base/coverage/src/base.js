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
  _$jscoverage['/base.js'].lineData[9] = 0;
  _$jscoverage['/base.js'].lineData[13] = 0;
  _$jscoverage['/base.js'].lineData[14] = 0;
  _$jscoverage['/base.js'].lineData[15] = 0;
  _$jscoverage['/base.js'].lineData[16] = 0;
  _$jscoverage['/base.js'].lineData[17] = 0;
  _$jscoverage['/base.js'].lineData[18] = 0;
  _$jscoverage['/base.js'].lineData[20] = 0;
  _$jscoverage['/base.js'].lineData[24] = 0;
  _$jscoverage['/base.js'].lineData[25] = 0;
  _$jscoverage['/base.js'].lineData[26] = 0;
  _$jscoverage['/base.js'].lineData[28] = 0;
  _$jscoverage['/base.js'].lineData[29] = 0;
  _$jscoverage['/base.js'].lineData[30] = 0;
  _$jscoverage['/base.js'].lineData[32] = 0;
  _$jscoverage['/base.js'].lineData[49] = 0;
  _$jscoverage['/base.js'].lineData[51] = 0;
  _$jscoverage['/base.js'].lineData[52] = 0;
  _$jscoverage['/base.js'].lineData[54] = 0;
  _$jscoverage['/base.js'].lineData[55] = 0;
  _$jscoverage['/base.js'].lineData[56] = 0;
  _$jscoverage['/base.js'].lineData[59] = 0;
  _$jscoverage['/base.js'].lineData[61] = 0;
  _$jscoverage['/base.js'].lineData[62] = 0;
  _$jscoverage['/base.js'].lineData[64] = 0;
  _$jscoverage['/base.js'].lineData[66] = 0;
  _$jscoverage['/base.js'].lineData[81] = 0;
  _$jscoverage['/base.js'].lineData[85] = 0;
  _$jscoverage['/base.js'].lineData[86] = 0;
  _$jscoverage['/base.js'].lineData[87] = 0;
  _$jscoverage['/base.js'].lineData[89] = 0;
  _$jscoverage['/base.js'].lineData[99] = 0;
  _$jscoverage['/base.js'].lineData[105] = 0;
  _$jscoverage['/base.js'].lineData[106] = 0;
  _$jscoverage['/base.js'].lineData[107] = 0;
  _$jscoverage['/base.js'].lineData[110] = 0;
  _$jscoverage['/base.js'].lineData[113] = 0;
  _$jscoverage['/base.js'].lineData[114] = 0;
  _$jscoverage['/base.js'].lineData[115] = 0;
  _$jscoverage['/base.js'].lineData[116] = 0;
  _$jscoverage['/base.js'].lineData[117] = 0;
  _$jscoverage['/base.js'].lineData[119] = 0;
  _$jscoverage['/base.js'].lineData[121] = 0;
  _$jscoverage['/base.js'].lineData[126] = 0;
  _$jscoverage['/base.js'].lineData[139] = 0;
  _$jscoverage['/base.js'].lineData[140] = 0;
  _$jscoverage['/base.js'].lineData[141] = 0;
  _$jscoverage['/base.js'].lineData[142] = 0;
  _$jscoverage['/base.js'].lineData[146] = 0;
  _$jscoverage['/base.js'].lineData[148] = 0;
  _$jscoverage['/base.js'].lineData[150] = 0;
  _$jscoverage['/base.js'].lineData[151] = 0;
  _$jscoverage['/base.js'].lineData[161] = 0;
  _$jscoverage['/base.js'].lineData[165] = 0;
  _$jscoverage['/base.js'].lineData[166] = 0;
  _$jscoverage['/base.js'].lineData[167] = 0;
  _$jscoverage['/base.js'].lineData[168] = 0;
  _$jscoverage['/base.js'].lineData[170] = 0;
  _$jscoverage['/base.js'].lineData[171] = 0;
  _$jscoverage['/base.js'].lineData[172] = 0;
  _$jscoverage['/base.js'].lineData[173] = 0;
  _$jscoverage['/base.js'].lineData[176] = 0;
  _$jscoverage['/base.js'].lineData[177] = 0;
  _$jscoverage['/base.js'].lineData[178] = 0;
  _$jscoverage['/base.js'].lineData[183] = 0;
  _$jscoverage['/base.js'].lineData[184] = 0;
  _$jscoverage['/base.js'].lineData[188] = 0;
  _$jscoverage['/base.js'].lineData[189] = 0;
  _$jscoverage['/base.js'].lineData[198] = 0;
  _$jscoverage['/base.js'].lineData[199] = 0;
  _$jscoverage['/base.js'].lineData[201] = 0;
  _$jscoverage['/base.js'].lineData[202] = 0;
  _$jscoverage['/base.js'].lineData[203] = 0;
  _$jscoverage['/base.js'].lineData[204] = 0;
  _$jscoverage['/base.js'].lineData[206] = 0;
  _$jscoverage['/base.js'].lineData[208] = 0;
  _$jscoverage['/base.js'].lineData[214] = 0;
  _$jscoverage['/base.js'].lineData[215] = 0;
  _$jscoverage['/base.js'].lineData[216] = 0;
  _$jscoverage['/base.js'].lineData[217] = 0;
  _$jscoverage['/base.js'].lineData[218] = 0;
  _$jscoverage['/base.js'].lineData[219] = 0;
  _$jscoverage['/base.js'].lineData[220] = 0;
  _$jscoverage['/base.js'].lineData[225] = 0;
  _$jscoverage['/base.js'].lineData[297] = 0;
  _$jscoverage['/base.js'].lineData[298] = 0;
  _$jscoverage['/base.js'].lineData[299] = 0;
  _$jscoverage['/base.js'].lineData[300] = 0;
  _$jscoverage['/base.js'].lineData[302] = 0;
  _$jscoverage['/base.js'].lineData[303] = 0;
  _$jscoverage['/base.js'].lineData[305] = 0;
  _$jscoverage['/base.js'].lineData[307] = 0;
  _$jscoverage['/base.js'].lineData[308] = 0;
  _$jscoverage['/base.js'].lineData[312] = 0;
  _$jscoverage['/base.js'].lineData[313] = 0;
  _$jscoverage['/base.js'].lineData[323] = 0;
  _$jscoverage['/base.js'].lineData[324] = 0;
  _$jscoverage['/base.js'].lineData[325] = 0;
  _$jscoverage['/base.js'].lineData[328] = 0;
  _$jscoverage['/base.js'].lineData[330] = 0;
  _$jscoverage['/base.js'].lineData[332] = 0;
  _$jscoverage['/base.js'].lineData[333] = 0;
  _$jscoverage['/base.js'].lineData[338] = 0;
  _$jscoverage['/base.js'].lineData[339] = 0;
  _$jscoverage['/base.js'].lineData[340] = 0;
  _$jscoverage['/base.js'].lineData[342] = 0;
  _$jscoverage['/base.js'].lineData[343] = 0;
  _$jscoverage['/base.js'].lineData[344] = 0;
  _$jscoverage['/base.js'].lineData[348] = 0;
  _$jscoverage['/base.js'].lineData[350] = 0;
  _$jscoverage['/base.js'].lineData[351] = 0;
  _$jscoverage['/base.js'].lineData[352] = 0;
  _$jscoverage['/base.js'].lineData[355] = 0;
  _$jscoverage['/base.js'].lineData[357] = 0;
  _$jscoverage['/base.js'].lineData[359] = 0;
  _$jscoverage['/base.js'].lineData[360] = 0;
  _$jscoverage['/base.js'].lineData[362] = 0;
  _$jscoverage['/base.js'].lineData[365] = 0;
  _$jscoverage['/base.js'].lineData[392] = 0;
  _$jscoverage['/base.js'].lineData[393] = 0;
  _$jscoverage['/base.js'].lineData[396] = 0;
  _$jscoverage['/base.js'].lineData[397] = 0;
  _$jscoverage['/base.js'].lineData[398] = 0;
  _$jscoverage['/base.js'].lineData[402] = 0;
  _$jscoverage['/base.js'].lineData[403] = 0;
  _$jscoverage['/base.js'].lineData[404] = 0;
  _$jscoverage['/base.js'].lineData[405] = 0;
  _$jscoverage['/base.js'].lineData[406] = 0;
  _$jscoverage['/base.js'].lineData[407] = 0;
  _$jscoverage['/base.js'].lineData[412] = 0;
  _$jscoverage['/base.js'].lineData[413] = 0;
  _$jscoverage['/base.js'].lineData[416] = 0;
  _$jscoverage['/base.js'].lineData[417] = 0;
  _$jscoverage['/base.js'].lineData[418] = 0;
  _$jscoverage['/base.js'].lineData[419] = 0;
  _$jscoverage['/base.js'].lineData[425] = 0;
  _$jscoverage['/base.js'].lineData[426] = 0;
  _$jscoverage['/base.js'].lineData[427] = 0;
  _$jscoverage['/base.js'].lineData[428] = 0;
  _$jscoverage['/base.js'].lineData[429] = 0;
  _$jscoverage['/base.js'].lineData[434] = 0;
  _$jscoverage['/base.js'].lineData[435] = 0;
  _$jscoverage['/base.js'].lineData[441] = 0;
  _$jscoverage['/base.js'].lineData[443] = 0;
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
  _$jscoverage['/base.js'].functionData[20] = 0;
  _$jscoverage['/base.js'].functionData[21] = 0;
}
if (! _$jscoverage['/base.js'].branchData) {
  _$jscoverage['/base.js'].branchData = {};
  _$jscoverage['/base.js'].branchData['17'] = [];
  _$jscoverage['/base.js'].branchData['17'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['24'] = [];
  _$jscoverage['/base.js'].branchData['24'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['25'] = [];
  _$jscoverage['/base.js'].branchData['25'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['29'] = [];
  _$jscoverage['/base.js'].branchData['29'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['87'] = [];
  _$jscoverage['/base.js'].branchData['87'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['107'] = [];
  _$jscoverage['/base.js'].branchData['107'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['113'] = [];
  _$jscoverage['/base.js'].branchData['113'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['114'] = [];
  _$jscoverage['/base.js'].branchData['114'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['116'] = [];
  _$jscoverage['/base.js'].branchData['116'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['121'] = [];
  _$jscoverage['/base.js'].branchData['121'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['124'] = [];
  _$jscoverage['/base.js'].branchData['124'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['124'][2] = new BranchData();
  _$jscoverage['/base.js'].branchData['125'] = [];
  _$jscoverage['/base.js'].branchData['125'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['140'] = [];
  _$jscoverage['/base.js'].branchData['140'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['146'] = [];
  _$jscoverage['/base.js'].branchData['146'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['163'] = [];
  _$jscoverage['/base.js'].branchData['163'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['167'] = [];
  _$jscoverage['/base.js'].branchData['167'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['168'] = [];
  _$jscoverage['/base.js'].branchData['168'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['170'] = [];
  _$jscoverage['/base.js'].branchData['170'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['170'][2] = new BranchData();
  _$jscoverage['/base.js'].branchData['171'] = [];
  _$jscoverage['/base.js'].branchData['171'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['176'] = [];
  _$jscoverage['/base.js'].branchData['176'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['183'] = [];
  _$jscoverage['/base.js'].branchData['183'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['201'] = [];
  _$jscoverage['/base.js'].branchData['201'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['201'][2] = new BranchData();
  _$jscoverage['/base.js'].branchData['202'] = [];
  _$jscoverage['/base.js'].branchData['202'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['215'] = [];
  _$jscoverage['/base.js'].branchData['215'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['297'] = [];
  _$jscoverage['/base.js'].branchData['297'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['307'] = [];
  _$jscoverage['/base.js'].branchData['307'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['313'] = [];
  _$jscoverage['/base.js'].branchData['313'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['324'] = [];
  _$jscoverage['/base.js'].branchData['324'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['332'] = [];
  _$jscoverage['/base.js'].branchData['332'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['342'] = [];
  _$jscoverage['/base.js'].branchData['342'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['342'][2] = new BranchData();
  _$jscoverage['/base.js'].branchData['355'] = [];
  _$jscoverage['/base.js'].branchData['355'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['359'] = [];
  _$jscoverage['/base.js'].branchData['359'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['362'] = [];
  _$jscoverage['/base.js'].branchData['362'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['396'] = [];
  _$jscoverage['/base.js'].branchData['396'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['405'] = [];
  _$jscoverage['/base.js'].branchData['405'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['417'] = [];
  _$jscoverage['/base.js'].branchData['417'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['418'] = [];
  _$jscoverage['/base.js'].branchData['418'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['427'] = [];
  _$jscoverage['/base.js'].branchData['427'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['428'] = [];
  _$jscoverage['/base.js'].branchData['428'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['429'] = [];
  _$jscoverage['/base.js'].branchData['429'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['434'] = [];
  _$jscoverage['/base.js'].branchData['434'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['435'] = [];
  _$jscoverage['/base.js'].branchData['435'][1] = new BranchData();
}
_$jscoverage['/base.js'].branchData['435'][1].init(36, 10, 'args || []');
function visit46_435_1(result) {
  _$jscoverage['/base.js'].branchData['435'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['434'][1].init(214, 2, 'fn');
function visit45_434_1(result) {
  _$jscoverage['/base.js'].branchData['434'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['429'][1].init(26, 166, 'extensions[i] && (!method ? extensions[i] : extensions[i].prototype[method])');
function visit44_429_1(result) {
  _$jscoverage['/base.js'].branchData['429'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['428'][1].init(29, 7, 'i < len');
function visit43_428_1(result) {
  _$jscoverage['/base.js'].branchData['428'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['427'][1].init(37, 31, 'extensions && extensions.length');
function visit42_427_1(result) {
  _$jscoverage['/base.js'].branchData['427'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['418'][1].init(21, 18, 'plugins[i][method]');
function visit41_418_1(result) {
  _$jscoverage['/base.js'].branchData['418'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['417'][1].init(29, 7, 'i < len');
function visit40_417_1(result) {
  _$jscoverage['/base.js'].branchData['417'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['405'][1].init(17, 28, 'typeof plugin === \'function\'');
function visit39_405_1(result) {
  _$jscoverage['/base.js'].branchData['405'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['396'][1].init(85, 17, 'e.target === self');
function visit38_396_1(result) {
  _$jscoverage['/base.js'].branchData['396'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['362'][1].init(207, 13, 'px[h] || noop');
function visit37_362_1(result) {
  _$jscoverage['/base.js'].branchData['362'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['359'][1].init(83, 48, 'proto.hasOwnProperty(h) && !px.hasOwnProperty(h)');
function visit36_359_1(result) {
  _$jscoverage['/base.js'].branchData['359'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['355'][1].init(172, 26, 'extensions.length && hooks');
function visit35_355_1(result) {
  _$jscoverage['/base.js'].branchData['355'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['342'][2].init(1965, 15, 'sx && sx.extend');
function visit34_342_2(result) {
  _$jscoverage['/base.js'].branchData['342'][2].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['342'][1].init(1965, 25, 'sx && sx.extend || extend');
function visit33_342_1(result) {
  _$jscoverage['/base.js'].branchData['342'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['332'][1].init(94, 21, 'exp.hasOwnProperty(p)');
function visit32_332_1(result) {
  _$jscoverage['/base.js'].branchData['332'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['324'][1].init(52, 17, 'attrs[name] || {}');
function visit31_324_1(result) {
  _$jscoverage['/base.js'].branchData['324'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['313'][1].init(25, 3, 'ext');
function visit30_313_1(result) {
  _$jscoverage['/base.js'].branchData['313'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['307'][1].init(425, 17, 'extensions.length');
function visit29_307_1(result) {
  _$jscoverage['/base.js'].branchData['307'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['297'][1].init(17, 22, '!S.isArray(extensions)');
function visit28_297_1(result) {
  _$jscoverage['/base.js'].branchData['297'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['215'][1].init(46, 22, '!self.get(\'destroyed\')');
function visit27_215_1(result) {
  _$jscoverage['/base.js'].branchData['215'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['202'][1].init(141, 15, 'pluginId === id');
function visit26_202_1(result) {
  _$jscoverage['/base.js'].branchData['202'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['201'][2].init(79, 26, 'p.get && p.get(\'pluginId\')');
function visit25_201_2(result) {
  _$jscoverage['/base.js'].branchData['201'][2].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['201'][1].init(79, 40, 'p.get && p.get(\'pluginId\') || p.pluginId');
function visit24_201_1(result) {
  _$jscoverage['/base.js'].branchData['201'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['183'][1].init(642, 5, '!keep');
function visit23_183_1(result) {
  _$jscoverage['/base.js'].branchData['183'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['176'][1].init(29, 12, 'p !== plugin');
function visit22_176_1(result) {
  _$jscoverage['/base.js'].branchData['176'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['171'][1].init(161, 19, 'pluginId !== plugin');
function visit21_171_1(result) {
  _$jscoverage['/base.js'].branchData['171'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['170'][2].init(91, 26, 'p.get && p.get(\'pluginId\')');
function visit20_170_2(result) {
  _$jscoverage['/base.js'].branchData['170'][2].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['170'][1].init(91, 40, 'p.get && p.get(\'pluginId\') || p.pluginId');
function visit19_170_1(result) {
  _$jscoverage['/base.js'].branchData['170'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['168'][1].init(25, 8, 'isString');
function visit18_168_1(result) {
  _$jscoverage['/base.js'].branchData['168'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['167'][1].init(61, 6, 'plugin');
function visit17_167_1(result) {
  _$jscoverage['/base.js'].branchData['167'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['163'][1].init(73, 26, 'typeof plugin === \'string\'');
function visit16_163_1(result) {
  _$jscoverage['/base.js'].branchData['163'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['146'][1].init(265, 24, 'plugin.pluginInitializer');
function visit15_146_1(result) {
  _$jscoverage['/base.js'].branchData['146'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['140'][1].init(46, 28, 'typeof plugin === \'function\'');
function visit14_140_1(result) {
  _$jscoverage['/base.js'].branchData['140'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['125'][1].init(63, 55, '(attributeValue = self.get(attributeName)) !== undefined');
function visit13_125_1(result) {
  _$jscoverage['/base.js'].branchData['125'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['124'][2].init(427, 31, 'attrs[attributeName].sync !== 0');
function visit12_124_2(result) {
  _$jscoverage['/base.js'].branchData['124'][2].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['124'][1].init(174, 119, 'attrs[attributeName].sync !== 0 && (attributeValue = self.get(attributeName)) !== undefined');
function visit11_124_1(result) {
  _$jscoverage['/base.js'].branchData['124'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['121'][1].init(250, 294, '(onSetMethod = self[onSetMethodName]) && attrs[attributeName].sync !== 0 && (attributeValue = self.get(attributeName)) !== undefined');
function visit10_121_1(result) {
  _$jscoverage['/base.js'].branchData['121'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['116'][1].init(25, 22, 'attributeName in attrs');
function visit9_116_1(result) {
  _$jscoverage['/base.js'].branchData['116'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['114'][1].init(29, 17, 'cs[i].ATTRS || {}');
function visit8_114_1(result) {
  _$jscoverage['/base.js'].branchData['114'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['113'][1].init(379, 13, 'i < cs.length');
function visit7_113_1(result) {
  _$jscoverage['/base.js'].branchData['113'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['107'][1].init(49, 40, 'c.superclass && c.superclass.constructor');
function visit6_107_1(result) {
  _$jscoverage['/base.js'].branchData['107'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['87'][1].init(65, 7, 'self[m]');
function visit5_87_1(result) {
  _$jscoverage['/base.js'].branchData['87'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['29'][1].init(572, 7, 'reverse');
function visit4_29_1(result) {
  _$jscoverage['/base.js'].branchData['29'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['25'][1].init(406, 7, 'reverse');
function visit3_25_1(result) {
  _$jscoverage['/base.js'].branchData['25'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['24'][1].init(337, 47, 'arguments.callee.__owner__.__extensions__ || []');
function visit2_24_1(result) {
  _$jscoverage['/base.js'].branchData['24'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['17'][1].init(54, 7, 'reverse');
function visit1_17_1(result) {
  _$jscoverage['/base.js'].branchData['17'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/base.js'].functionData[0]++;
  _$jscoverage['/base.js'].lineData[7]++;
  var Attribute = require('attribute');
  _$jscoverage['/base.js'].lineData[9]++;
  var ucfirst = S.ucfirst, ON_SET = '_onSet', noop = S.noop;
  _$jscoverage['/base.js'].lineData[13]++;
  function __getHook(method, reverse) {
    _$jscoverage['/base.js'].functionData[1]++;
    _$jscoverage['/base.js'].lineData[14]++;
    return function(origFn) {
  _$jscoverage['/base.js'].functionData[2]++;
  _$jscoverage['/base.js'].lineData[15]++;
  return function wrap() {
  _$jscoverage['/base.js'].functionData[3]++;
  _$jscoverage['/base.js'].lineData[16]++;
  var self = this;
  _$jscoverage['/base.js'].lineData[17]++;
  if (visit1_17_1(reverse)) {
    _$jscoverage['/base.js'].lineData[18]++;
    origFn.apply(self, arguments);
  } else {
    _$jscoverage['/base.js'].lineData[20]++;
    self.callSuper.apply(self, arguments);
  }
  _$jscoverage['/base.js'].lineData[24]++;
  var extensions = visit2_24_1(arguments.callee.__owner__.__extensions__ || []);
  _$jscoverage['/base.js'].lineData[25]++;
  if (visit3_25_1(reverse)) {
    _$jscoverage['/base.js'].lineData[26]++;
    extensions.reverse();
  }
  _$jscoverage['/base.js'].lineData[28]++;
  callExtensionsMethod(self, extensions, method, arguments);
  _$jscoverage['/base.js'].lineData[29]++;
  if (visit4_29_1(reverse)) {
    _$jscoverage['/base.js'].lineData[30]++;
    self.callSuper.apply(self, arguments);
  } else {
    _$jscoverage['/base.js'].lineData[32]++;
    origFn.apply(self, arguments);
  }
};
};
  }
  _$jscoverage['/base.js'].lineData[49]++;
  var Base = Attribute.extend({
  constructor: function() {
  _$jscoverage['/base.js'].functionData[4]++;
  _$jscoverage['/base.js'].lineData[51]++;
  var self = this;
  _$jscoverage['/base.js'].lineData[52]++;
  self.callSuper.apply(self, arguments);
  _$jscoverage['/base.js'].lineData[54]++;
  var listeners = self.get('listeners');
  _$jscoverage['/base.js'].lineData[55]++;
  for (var n in listeners) {
    _$jscoverage['/base.js'].lineData[56]++;
    self.on(n, listeners[n]);
  }
  _$jscoverage['/base.js'].lineData[59]++;
  self.initializer();
  _$jscoverage['/base.js'].lineData[61]++;
  constructPlugins(self);
  _$jscoverage['/base.js'].lineData[62]++;
  callPluginsMethod.call(self, 'pluginInitializer');
  _$jscoverage['/base.js'].lineData[64]++;
  self.bindInternal();
  _$jscoverage['/base.js'].lineData[66]++;
  self.syncInternal();
}, 
  initializer: noop, 
  '__getHook': __getHook, 
  __callPluginsMethod: callPluginsMethod, 
  bindInternal: function() {
  _$jscoverage['/base.js'].functionData[5]++;
  _$jscoverage['/base.js'].lineData[81]++;
  var self = this, attrs = self.getAttrs(), attr, m;
  _$jscoverage['/base.js'].lineData[85]++;
  for (attr in attrs) {
    _$jscoverage['/base.js'].lineData[86]++;
    m = ON_SET + ucfirst(attr);
    _$jscoverage['/base.js'].lineData[87]++;
    if (visit5_87_1(self[m])) {
      _$jscoverage['/base.js'].lineData[89]++;
      self.on('after' + ucfirst(attr) + 'Change', onSetAttrChange);
    }
  }
}, 
  syncInternal: function() {
  _$jscoverage['/base.js'].functionData[6]++;
  _$jscoverage['/base.js'].lineData[99]++;
  var self = this, cs = [], i, c = self.constructor, attrs = self.getAttrs();
  _$jscoverage['/base.js'].lineData[105]++;
  while (c) {
    _$jscoverage['/base.js'].lineData[106]++;
    cs.push(c);
    _$jscoverage['/base.js'].lineData[107]++;
    c = visit6_107_1(c.superclass && c.superclass.constructor);
  }
  _$jscoverage['/base.js'].lineData[110]++;
  cs.reverse();
  _$jscoverage['/base.js'].lineData[113]++;
  for (i = 0; visit7_113_1(i < cs.length); i++) {
    _$jscoverage['/base.js'].lineData[114]++;
    var ATTRS = visit8_114_1(cs[i].ATTRS || {});
    _$jscoverage['/base.js'].lineData[115]++;
    for (var attributeName in ATTRS) {
      _$jscoverage['/base.js'].lineData[116]++;
      if (visit9_116_1(attributeName in attrs)) {
        _$jscoverage['/base.js'].lineData[117]++;
        var attributeValue, onSetMethod;
        _$jscoverage['/base.js'].lineData[119]++;
        var onSetMethodName = ON_SET + ucfirst(attributeName);
        _$jscoverage['/base.js'].lineData[121]++;
        if (visit10_121_1((onSetMethod = self[onSetMethodName]) && visit11_124_1(visit12_124_2(attrs[attributeName].sync !== 0) && visit13_125_1((attributeValue = self.get(attributeName)) !== undefined)))) {
          _$jscoverage['/base.js'].lineData[126]++;
          onSetMethod.call(self, attributeValue);
        }
      }
    }
  }
}, 
  'plug': function(plugin) {
  _$jscoverage['/base.js'].functionData[7]++;
  _$jscoverage['/base.js'].lineData[139]++;
  var self = this;
  _$jscoverage['/base.js'].lineData[140]++;
  if (visit14_140_1(typeof plugin === 'function')) {
    _$jscoverage['/base.js'].lineData[141]++;
    var Plugin = plugin;
    _$jscoverage['/base.js'].lineData[142]++;
    plugin = new Plugin();
  }
  _$jscoverage['/base.js'].lineData[146]++;
  if (visit15_146_1(plugin.pluginInitializer)) {
    _$jscoverage['/base.js'].lineData[148]++;
    plugin.pluginInitializer(self);
  }
  _$jscoverage['/base.js'].lineData[150]++;
  self.get('plugins').push(plugin);
  _$jscoverage['/base.js'].lineData[151]++;
  return self;
}, 
  'unplug': function(plugin) {
  _$jscoverage['/base.js'].functionData[8]++;
  _$jscoverage['/base.js'].lineData[161]++;
  var plugins = [], self = this, isString = visit16_163_1(typeof plugin === 'string');
  _$jscoverage['/base.js'].lineData[165]++;
  S.each(self.get('plugins'), function(p) {
  _$jscoverage['/base.js'].functionData[9]++;
  _$jscoverage['/base.js'].lineData[166]++;
  var keep = 0, pluginId;
  _$jscoverage['/base.js'].lineData[167]++;
  if (visit17_167_1(plugin)) {
    _$jscoverage['/base.js'].lineData[168]++;
    if (visit18_168_1(isString)) {
      _$jscoverage['/base.js'].lineData[170]++;
      pluginId = visit19_170_1(visit20_170_2(p.get && p.get('pluginId')) || p.pluginId);
      _$jscoverage['/base.js'].lineData[171]++;
      if (visit21_171_1(pluginId !== plugin)) {
        _$jscoverage['/base.js'].lineData[172]++;
        plugins.push(p);
        _$jscoverage['/base.js'].lineData[173]++;
        keep = 1;
      }
    } else {
      _$jscoverage['/base.js'].lineData[176]++;
      if (visit22_176_1(p !== plugin)) {
        _$jscoverage['/base.js'].lineData[177]++;
        plugins.push(p);
        _$jscoverage['/base.js'].lineData[178]++;
        keep = 1;
      }
    }
  }
  _$jscoverage['/base.js'].lineData[183]++;
  if (visit23_183_1(!keep)) {
    _$jscoverage['/base.js'].lineData[184]++;
    p.pluginDestructor(self);
  }
});
  _$jscoverage['/base.js'].lineData[188]++;
  self.setInternal('plugins', plugins);
  _$jscoverage['/base.js'].lineData[189]++;
  return self;
}, 
  'getPlugin': function(id) {
  _$jscoverage['/base.js'].functionData[10]++;
  _$jscoverage['/base.js'].lineData[198]++;
  var plugin = null;
  _$jscoverage['/base.js'].lineData[199]++;
  S.each(this.get('plugins'), function(p) {
  _$jscoverage['/base.js'].functionData[11]++;
  _$jscoverage['/base.js'].lineData[201]++;
  var pluginId = visit24_201_1(visit25_201_2(p.get && p.get('pluginId')) || p.pluginId);
  _$jscoverage['/base.js'].lineData[202]++;
  if (visit26_202_1(pluginId === id)) {
    _$jscoverage['/base.js'].lineData[203]++;
    plugin = p;
    _$jscoverage['/base.js'].lineData[204]++;
    return false;
  }
  _$jscoverage['/base.js'].lineData[206]++;
  return undefined;
});
  _$jscoverage['/base.js'].lineData[208]++;
  return plugin;
}, 
  destructor: S.noop, 
  destroy: function() {
  _$jscoverage['/base.js'].functionData[12]++;
  _$jscoverage['/base.js'].lineData[214]++;
  var self = this;
  _$jscoverage['/base.js'].lineData[215]++;
  if (visit27_215_1(!self.get('destroyed'))) {
    _$jscoverage['/base.js'].lineData[216]++;
    callPluginsMethod.call(self, 'pluginDestructor');
    _$jscoverage['/base.js'].lineData[217]++;
    self.destructor();
    _$jscoverage['/base.js'].lineData[218]++;
    self.set('destroyed', true);
    _$jscoverage['/base.js'].lineData[219]++;
    self.fire('destroy');
    _$jscoverage['/base.js'].lineData[220]++;
    self.detach();
  }
}});
  _$jscoverage['/base.js'].lineData[225]++;
  S.mix(Base, {
  __hooks__: {
  initializer: __getHook(), 
  destructor: __getHook('__destructor', true)}, 
  ATTRS: {
  plugins: {
  value: []}, 
  destroyed: {
  value: false}, 
  listeners: {
  value: []}}, 
  extend: function extend(extensions, px, sx) {
  _$jscoverage['/base.js'].functionData[13]++;
  _$jscoverage['/base.js'].lineData[297]++;
  if (visit28_297_1(!S.isArray(extensions))) {
    _$jscoverage['/base.js'].lineData[298]++;
    sx = px;
    _$jscoverage['/base.js'].lineData[299]++;
    px = extensions;
    _$jscoverage['/base.js'].lineData[300]++;
    extensions = [];
  }
  _$jscoverage['/base.js'].lineData[302]++;
  var SubClass = Attribute.extend.call(this, px, sx);
  _$jscoverage['/base.js'].lineData[303]++;
  SubClass.__extensions__ = extensions;
  _$jscoverage['/base.js'].lineData[305]++;
  baseAddMembers.call(SubClass, {});
  _$jscoverage['/base.js'].lineData[307]++;
  if (visit29_307_1(extensions.length)) {
    _$jscoverage['/base.js'].lineData[308]++;
    var attrs = {}, prototype = {};
    _$jscoverage['/base.js'].lineData[312]++;
    S.each(extensions.concat(SubClass), function(ext) {
  _$jscoverage['/base.js'].functionData[14]++;
  _$jscoverage['/base.js'].lineData[313]++;
  if (visit30_313_1(ext)) {
    _$jscoverage['/base.js'].lineData[323]++;
    S.each(ext.ATTRS, function(v, name) {
  _$jscoverage['/base.js'].functionData[15]++;
  _$jscoverage['/base.js'].lineData[324]++;
  var av = attrs[name] = visit31_324_1(attrs[name] || {});
  _$jscoverage['/base.js'].lineData[325]++;
  S.mix(av, v);
});
    _$jscoverage['/base.js'].lineData[328]++;
    var exp = ext.prototype, p;
    _$jscoverage['/base.js'].lineData[330]++;
    for (p in exp) {
      _$jscoverage['/base.js'].lineData[332]++;
      if (visit32_332_1(exp.hasOwnProperty(p))) {
        _$jscoverage['/base.js'].lineData[333]++;
        prototype[p] = exp[p];
      }
    }
  }
});
    _$jscoverage['/base.js'].lineData[338]++;
    SubClass.ATTRS = attrs;
    _$jscoverage['/base.js'].lineData[339]++;
    prototype.constructor = SubClass;
    _$jscoverage['/base.js'].lineData[340]++;
    S.augment(SubClass, prototype);
  }
  _$jscoverage['/base.js'].lineData[342]++;
  SubClass.extend = visit33_342_1(visit34_342_2(sx && sx.extend) || extend);
  _$jscoverage['/base.js'].lineData[343]++;
  SubClass.addMembers = baseAddMembers;
  _$jscoverage['/base.js'].lineData[344]++;
  return SubClass;
}});
  _$jscoverage['/base.js'].lineData[348]++;
  var addMembers = Base.addMembers;
  _$jscoverage['/base.js'].lineData[350]++;
  function baseAddMembers(px) {
    _$jscoverage['/base.js'].functionData[16]++;
    _$jscoverage['/base.js'].lineData[351]++;
    var SubClass = this;
    _$jscoverage['/base.js'].lineData[352]++;
    var extensions = SubClass.__extensions__, hooks = SubClass.__hooks__, proto = SubClass.prototype;
    _$jscoverage['/base.js'].lineData[355]++;
    if (visit35_355_1(extensions.length && hooks)) {
      _$jscoverage['/base.js'].lineData[357]++;
      for (var h in hooks) {
        _$jscoverage['/base.js'].lineData[359]++;
        if (visit36_359_1(proto.hasOwnProperty(h) && !px.hasOwnProperty(h))) {
          _$jscoverage['/base.js'].lineData[360]++;
          continue;
        }
        _$jscoverage['/base.js'].lineData[362]++;
        px[h] = visit37_362_1(px[h] || noop);
      }
    }
    _$jscoverage['/base.js'].lineData[365]++;
    return addMembers.call(SubClass, px);
  }
  _$jscoverage['/base.js'].lineData[392]++;
  function onSetAttrChange(e) {
    _$jscoverage['/base.js'].functionData[17]++;
    _$jscoverage['/base.js'].lineData[393]++;
    var self = this, method;
    _$jscoverage['/base.js'].lineData[396]++;
    if (visit38_396_1(e.target === self)) {
      _$jscoverage['/base.js'].lineData[397]++;
      method = self[ON_SET + e.type.slice(5).slice(0, -6)];
      _$jscoverage['/base.js'].lineData[398]++;
      method.call(self, e.newVal, e);
    }
  }
  _$jscoverage['/base.js'].lineData[402]++;
  function constructPlugins(self) {
    _$jscoverage['/base.js'].functionData[18]++;
    _$jscoverage['/base.js'].lineData[403]++;
    var plugins = self.get('plugins'), Plugin;
    _$jscoverage['/base.js'].lineData[404]++;
    S.each(plugins, function(plugin, i) {
  _$jscoverage['/base.js'].functionData[19]++;
  _$jscoverage['/base.js'].lineData[405]++;
  if (visit39_405_1(typeof plugin === 'function')) {
    _$jscoverage['/base.js'].lineData[406]++;
    Plugin = plugin;
    _$jscoverage['/base.js'].lineData[407]++;
    plugins[i] = new Plugin();
  }
});
  }
  _$jscoverage['/base.js'].lineData[412]++;
  function callPluginsMethod(method) {
    _$jscoverage['/base.js'].functionData[20]++;
    _$jscoverage['/base.js'].lineData[413]++;
    var len, self = this, plugins = self.get('plugins');
    _$jscoverage['/base.js'].lineData[416]++;
    if ((len = plugins.length)) {
      _$jscoverage['/base.js'].lineData[417]++;
      for (var i = 0; visit40_417_1(i < len); i++) {
        _$jscoverage['/base.js'].lineData[418]++;
        if (visit41_418_1(plugins[i][method])) {
          _$jscoverage['/base.js'].lineData[419]++;
          plugins[i][method](self);
        }
      }
    }
  }
  _$jscoverage['/base.js'].lineData[425]++;
  function callExtensionsMethod(self, extensions, method, args) {
    _$jscoverage['/base.js'].functionData[21]++;
    _$jscoverage['/base.js'].lineData[426]++;
    var len;
    _$jscoverage['/base.js'].lineData[427]++;
    if ((len = visit42_427_1(extensions && extensions.length))) {
      _$jscoverage['/base.js'].lineData[428]++;
      for (var i = 0; visit43_428_1(i < len); i++) {
        _$jscoverage['/base.js'].lineData[429]++;
        var fn = visit44_429_1(extensions[i] && (!method ? extensions[i] : extensions[i].prototype[method]));
        _$jscoverage['/base.js'].lineData[434]++;
        if (visit45_434_1(fn)) {
          _$jscoverage['/base.js'].lineData[435]++;
          fn.apply(self, visit46_435_1(args || []));
        }
      }
    }
  }
  _$jscoverage['/base.js'].lineData[441]++;
  S.Base = Base;
  _$jscoverage['/base.js'].lineData[443]++;
  return Base;
});
