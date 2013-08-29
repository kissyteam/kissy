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
if (! _$jscoverage['/base/observable.js']) {
  _$jscoverage['/base/observable.js'] = {};
  _$jscoverage['/base/observable.js'].lineData = [];
  _$jscoverage['/base/observable.js'].lineData[6] = 0;
  _$jscoverage['/base/observable.js'].lineData[11] = 0;
  _$jscoverage['/base/observable.js'].lineData[20] = 0;
  _$jscoverage['/base/observable.js'].lineData[21] = 0;
  _$jscoverage['/base/observable.js'].lineData[22] = 0;
  _$jscoverage['/base/observable.js'].lineData[23] = 0;
  _$jscoverage['/base/observable.js'].lineData[30] = 0;
  _$jscoverage['/base/observable.js'].lineData[33] = 0;
  _$jscoverage['/base/observable.js'].lineData[40] = 0;
  _$jscoverage['/base/observable.js'].lineData[41] = 0;
  _$jscoverage['/base/observable.js'].lineData[48] = 0;
  _$jscoverage['/base/observable.js'].lineData[49] = 0;
  _$jscoverage['/base/observable.js'].lineData[50] = 0;
  _$jscoverage['/base/observable.js'].lineData[51] = 0;
  _$jscoverage['/base/observable.js'].lineData[70] = 0;
  _$jscoverage['/base/observable.js'].lineData[89] = 0;
  _$jscoverage['/base/observable.js'].lineData[90] = 0;
  _$jscoverage['/base/observable.js'].lineData[91] = 0;
  _$jscoverage['/base/observable.js'].lineData[92] = 0;
  _$jscoverage['/base/observable.js'].lineData[94] = 0;
  _$jscoverage['/base/observable.js'].lineData[95] = 0;
  _$jscoverage['/base/observable.js'].lineData[96] = 0;
  _$jscoverage['/base/observable.js'].lineData[97] = 0;
  _$jscoverage['/base/observable.js'].lineData[98] = 0;
  _$jscoverage['/base/observable.js'].lineData[99] = 0;
  _$jscoverage['/base/observable.js'].lineData[100] = 0;
  _$jscoverage['/base/observable.js'].lineData[101] = 0;
  _$jscoverage['/base/observable.js'].lineData[103] = 0;
  _$jscoverage['/base/observable.js'].lineData[104] = 0;
  _$jscoverage['/base/observable.js'].lineData[107] = 0;
  _$jscoverage['/base/observable.js'].lineData[108] = 0;
  _$jscoverage['/base/observable.js'].lineData[114] = 0;
  _$jscoverage['/base/observable.js'].lineData[120] = 0;
  _$jscoverage['/base/observable.js'].lineData[121] = 0;
  _$jscoverage['/base/observable.js'].lineData[131] = 0;
  _$jscoverage['/base/observable.js'].lineData[133] = 0;
  _$jscoverage['/base/observable.js'].lineData[134] = 0;
  _$jscoverage['/base/observable.js'].lineData[135] = 0;
  _$jscoverage['/base/observable.js'].lineData[136] = 0;
  _$jscoverage['/base/observable.js'].lineData[139] = 0;
  _$jscoverage['/base/observable.js'].lineData[141] = 0;
  _$jscoverage['/base/observable.js'].lineData[143] = 0;
  _$jscoverage['/base/observable.js'].lineData[148] = 0;
  _$jscoverage['/base/observable.js'].lineData[149] = 0;
  _$jscoverage['/base/observable.js'].lineData[156] = 0;
  _$jscoverage['/base/observable.js'].lineData[165] = 0;
  _$jscoverage['/base/observable.js'].lineData[167] = 0;
  _$jscoverage['/base/observable.js'].lineData[176] = 0;
  _$jscoverage['/base/observable.js'].lineData[177] = 0;
  _$jscoverage['/base/observable.js'].lineData[180] = 0;
  _$jscoverage['/base/observable.js'].lineData[181] = 0;
  _$jscoverage['/base/observable.js'].lineData[182] = 0;
  _$jscoverage['/base/observable.js'].lineData[187] = 0;
  _$jscoverage['/base/observable.js'].lineData[190] = 0;
  _$jscoverage['/base/observable.js'].lineData[191] = 0;
  _$jscoverage['/base/observable.js'].lineData[197] = 0;
  _$jscoverage['/base/observable.js'].lineData[209] = 0;
  _$jscoverage['/base/observable.js'].lineData[210] = 0;
  _$jscoverage['/base/observable.js'].lineData[212] = 0;
  _$jscoverage['/base/observable.js'].lineData[215] = 0;
  _$jscoverage['/base/observable.js'].lineData[218] = 0;
  _$jscoverage['/base/observable.js'].lineData[219] = 0;
  _$jscoverage['/base/observable.js'].lineData[220] = 0;
  _$jscoverage['/base/observable.js'].lineData[222] = 0;
  _$jscoverage['/base/observable.js'].lineData[223] = 0;
  _$jscoverage['/base/observable.js'].lineData[224] = 0;
  _$jscoverage['/base/observable.js'].lineData[225] = 0;
  _$jscoverage['/base/observable.js'].lineData[229] = 0;
  _$jscoverage['/base/observable.js'].lineData[230] = 0;
  _$jscoverage['/base/observable.js'].lineData[232] = 0;
  _$jscoverage['/base/observable.js'].lineData[235] = 0;
  _$jscoverage['/base/observable.js'].lineData[238] = 0;
  _$jscoverage['/base/observable.js'].lineData[241] = 0;
  _$jscoverage['/base/observable.js'].lineData[243] = 0;
  _$jscoverage['/base/observable.js'].lineData[247] = 0;
  _$jscoverage['/base/observable.js'].lineData[250] = 0;
  _$jscoverage['/base/observable.js'].lineData[251] = 0;
  _$jscoverage['/base/observable.js'].lineData[254] = 0;
  _$jscoverage['/base/observable.js'].lineData[257] = 0;
  _$jscoverage['/base/observable.js'].lineData[265] = 0;
  _$jscoverage['/base/observable.js'].lineData[271] = 0;
  _$jscoverage['/base/observable.js'].lineData[272] = 0;
  _$jscoverage['/base/observable.js'].lineData[273] = 0;
  _$jscoverage['/base/observable.js'].lineData[277] = 0;
  _$jscoverage['/base/observable.js'].lineData[279] = 0;
  _$jscoverage['/base/observable.js'].lineData[280] = 0;
  _$jscoverage['/base/observable.js'].lineData[281] = 0;
  _$jscoverage['/base/observable.js'].lineData[283] = 0;
  _$jscoverage['/base/observable.js'].lineData[284] = 0;
  _$jscoverage['/base/observable.js'].lineData[285] = 0;
  _$jscoverage['/base/observable.js'].lineData[287] = 0;
  _$jscoverage['/base/observable.js'].lineData[291] = 0;
  _$jscoverage['/base/observable.js'].lineData[292] = 0;
  _$jscoverage['/base/observable.js'].lineData[302] = 0;
  _$jscoverage['/base/observable.js'].lineData[313] = 0;
  _$jscoverage['/base/observable.js'].lineData[314] = 0;
  _$jscoverage['/base/observable.js'].lineData[317] = 0;
  _$jscoverage['/base/observable.js'].lineData[318] = 0;
  _$jscoverage['/base/observable.js'].lineData[321] = 0;
  _$jscoverage['/base/observable.js'].lineData[324] = 0;
  _$jscoverage['/base/observable.js'].lineData[325] = 0;
  _$jscoverage['/base/observable.js'].lineData[327] = 0;
  _$jscoverage['/base/observable.js'].lineData[328] = 0;
  _$jscoverage['/base/observable.js'].lineData[329] = 0;
  _$jscoverage['/base/observable.js'].lineData[330] = 0;
  _$jscoverage['/base/observable.js'].lineData[359] = 0;
  _$jscoverage['/base/observable.js'].lineData[361] = 0;
  _$jscoverage['/base/observable.js'].lineData[362] = 0;
  _$jscoverage['/base/observable.js'].lineData[364] = 0;
  _$jscoverage['/base/observable.js'].lineData[365] = 0;
  _$jscoverage['/base/observable.js'].lineData[367] = 0;
  _$jscoverage['/base/observable.js'].lineData[368] = 0;
  _$jscoverage['/base/observable.js'].lineData[373] = 0;
  _$jscoverage['/base/observable.js'].lineData[376] = 0;
  _$jscoverage['/base/observable.js'].lineData[379] = 0;
  _$jscoverage['/base/observable.js'].lineData[383] = 0;
  _$jscoverage['/base/observable.js'].lineData[390] = 0;
  _$jscoverage['/base/observable.js'].lineData[391] = 0;
  _$jscoverage['/base/observable.js'].lineData[392] = 0;
  _$jscoverage['/base/observable.js'].lineData[393] = 0;
  _$jscoverage['/base/observable.js'].lineData[396] = 0;
  _$jscoverage['/base/observable.js'].lineData[397] = 0;
  _$jscoverage['/base/observable.js'].lineData[400] = 0;
  _$jscoverage['/base/observable.js'].lineData[404] = 0;
  _$jscoverage['/base/observable.js'].lineData[405] = 0;
  _$jscoverage['/base/observable.js'].lineData[406] = 0;
  _$jscoverage['/base/observable.js'].lineData[412] = 0;
  _$jscoverage['/base/observable.js'].lineData[420] = 0;
  _$jscoverage['/base/observable.js'].lineData[422] = 0;
  _$jscoverage['/base/observable.js'].lineData[424] = 0;
  _$jscoverage['/base/observable.js'].lineData[425] = 0;
  _$jscoverage['/base/observable.js'].lineData[427] = 0;
  _$jscoverage['/base/observable.js'].lineData[428] = 0;
  _$jscoverage['/base/observable.js'].lineData[431] = 0;
  _$jscoverage['/base/observable.js'].lineData[435] = 0;
  _$jscoverage['/base/observable.js'].lineData[436] = 0;
  _$jscoverage['/base/observable.js'].lineData[437] = 0;
  _$jscoverage['/base/observable.js'].lineData[438] = 0;
  _$jscoverage['/base/observable.js'].lineData[440] = 0;
  _$jscoverage['/base/observable.js'].lineData[443] = 0;
}
if (! _$jscoverage['/base/observable.js'].functionData) {
  _$jscoverage['/base/observable.js'].functionData = [];
  _$jscoverage['/base/observable.js'].functionData[0] = 0;
  _$jscoverage['/base/observable.js'].functionData[1] = 0;
  _$jscoverage['/base/observable.js'].functionData[2] = 0;
  _$jscoverage['/base/observable.js'].functionData[3] = 0;
  _$jscoverage['/base/observable.js'].functionData[4] = 0;
  _$jscoverage['/base/observable.js'].functionData[5] = 0;
  _$jscoverage['/base/observable.js'].functionData[6] = 0;
  _$jscoverage['/base/observable.js'].functionData[7] = 0;
  _$jscoverage['/base/observable.js'].functionData[8] = 0;
  _$jscoverage['/base/observable.js'].functionData[9] = 0;
  _$jscoverage['/base/observable.js'].functionData[10] = 0;
}
if (! _$jscoverage['/base/observable.js'].branchData) {
  _$jscoverage['/base/observable.js'].branchData = {};
  _$jscoverage['/base/observable.js'].branchData['35'] = [];
  _$jscoverage['/base/observable.js'].branchData['35'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['40'] = [];
  _$jscoverage['/base/observable.js'].branchData['40'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['40'][2] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['82'] = [];
  _$jscoverage['/base/observable.js'].branchData['82'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['89'] = [];
  _$jscoverage['/base/observable.js'].branchData['89'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['90'] = [];
  _$jscoverage['/base/observable.js'].branchData['90'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['91'] = [];
  _$jscoverage['/base/observable.js'].branchData['91'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['91'][2] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['91'][3] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['95'] = [];
  _$jscoverage['/base/observable.js'].branchData['95'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['100'] = [];
  _$jscoverage['/base/observable.js'].branchData['100'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['103'] = [];
  _$jscoverage['/base/observable.js'].branchData['103'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['107'] = [];
  _$jscoverage['/base/observable.js'].branchData['107'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['114'] = [];
  _$jscoverage['/base/observable.js'].branchData['114'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['120'] = [];
  _$jscoverage['/base/observable.js'].branchData['120'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['131'] = [];
  _$jscoverage['/base/observable.js'].branchData['131'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['131'][2] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['139'] = [];
  _$jscoverage['/base/observable.js'].branchData['139'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['139'][2] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['148'] = [];
  _$jscoverage['/base/observable.js'].branchData['148'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['148'][2] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['148'][3] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['165'] = [];
  _$jscoverage['/base/observable.js'].branchData['165'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['171'] = [];
  _$jscoverage['/base/observable.js'].branchData['171'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['172'] = [];
  _$jscoverage['/base/observable.js'].branchData['172'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['176'] = [];
  _$jscoverage['/base/observable.js'].branchData['176'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['176'][2] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['180'] = [];
  _$jscoverage['/base/observable.js'].branchData['180'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['190'] = [];
  _$jscoverage['/base/observable.js'].branchData['190'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['190'][2] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['212'] = [];
  _$jscoverage['/base/observable.js'].branchData['212'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['212'][2] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['212'][3] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['212'][4] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['213'] = [];
  _$jscoverage['/base/observable.js'].branchData['213'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['213'][2] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['222'] = [];
  _$jscoverage['/base/observable.js'].branchData['222'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['224'] = [];
  _$jscoverage['/base/observable.js'].branchData['224'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['224'][2] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['224'][3] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['229'] = [];
  _$jscoverage['/base/observable.js'].branchData['229'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['229'][2] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['233'] = [];
  _$jscoverage['/base/observable.js'].branchData['233'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['233'][2] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['235'] = [];
  _$jscoverage['/base/observable.js'].branchData['235'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['241'] = [];
  _$jscoverage['/base/observable.js'].branchData['241'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['267'] = [];
  _$jscoverage['/base/observable.js'].branchData['267'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['271'] = [];
  _$jscoverage['/base/observable.js'].branchData['271'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['272'] = [];
  _$jscoverage['/base/observable.js'].branchData['272'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['277'] = [];
  _$jscoverage['/base/observable.js'].branchData['277'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['279'] = [];
  _$jscoverage['/base/observable.js'].branchData['279'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['283'] = [];
  _$jscoverage['/base/observable.js'].branchData['283'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['291'] = [];
  _$jscoverage['/base/observable.js'].branchData['291'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['304'] = [];
  _$jscoverage['/base/observable.js'].branchData['304'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['313'] = [];
  _$jscoverage['/base/observable.js'].branchData['313'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['317'] = [];
  _$jscoverage['/base/observable.js'].branchData['317'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['324'] = [];
  _$jscoverage['/base/observable.js'].branchData['324'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['324'][2] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['325'] = [];
  _$jscoverage['/base/observable.js'].branchData['325'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['327'] = [];
  _$jscoverage['/base/observable.js'].branchData['327'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['329'] = [];
  _$jscoverage['/base/observable.js'].branchData['329'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['331'] = [];
  _$jscoverage['/base/observable.js'].branchData['331'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['331'][2] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['333'] = [];
  _$jscoverage['/base/observable.js'].branchData['333'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['333'][2] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['333'][3] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['348'] = [];
  _$jscoverage['/base/observable.js'].branchData['348'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['349'] = [];
  _$jscoverage['/base/observable.js'].branchData['349'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['351'] = [];
  _$jscoverage['/base/observable.js'].branchData['351'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['351'][2] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['351'][3] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['352'] = [];
  _$jscoverage['/base/observable.js'].branchData['352'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['357'] = [];
  _$jscoverage['/base/observable.js'].branchData['357'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['361'] = [];
  _$jscoverage['/base/observable.js'].branchData['361'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['364'] = [];
  _$jscoverage['/base/observable.js'].branchData['364'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['367'] = [];
  _$jscoverage['/base/observable.js'].branchData['367'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['387'] = [];
  _$jscoverage['/base/observable.js'].branchData['387'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['390'] = [];
  _$jscoverage['/base/observable.js'].branchData['390'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['392'] = [];
  _$jscoverage['/base/observable.js'].branchData['392'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['396'] = [];
  _$jscoverage['/base/observable.js'].branchData['396'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['396'][2] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['404'] = [];
  _$jscoverage['/base/observable.js'].branchData['404'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['424'] = [];
  _$jscoverage['/base/observable.js'].branchData['424'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['427'] = [];
  _$jscoverage['/base/observable.js'].branchData['427'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['437'] = [];
  _$jscoverage['/base/observable.js'].branchData['437'][1] = new BranchData();
}
_$jscoverage['/base/observable.js'].branchData['437'][1].init(75, 30, '!domEventObservables && create');
function visit183_437_1(result) {
  _$jscoverage['/base/observable.js'].branchData['437'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['427'][1].init(244, 19, 'domEventObservables');
function visit182_427_1(result) {
  _$jscoverage['/base/observable.js'].branchData['427'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['424'][1].init(117, 25, 'domEventObservablesHolder');
function visit181_424_1(result) {
  _$jscoverage['/base/observable.js'].branchData['424'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['404'][1].init(729, 36, 'S.isEmptyObject(domEventObservables)');
function visit180_404_1(result) {
  _$jscoverage['/base/observable.js'].branchData['404'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['396'][2].init(215, 49, 's[\'tearDown\'].call(currentTarget, type) === false');
function visit179_396_2(result) {
  _$jscoverage['/base/observable.js'].branchData['396'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['396'][1].init(197, 67, '!s[\'tearDown\'] || s[\'tearDown\'].call(currentTarget, type) === false');
function visit178_396_1(result) {
  _$jscoverage['/base/observable.js'].branchData['396'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['392'][1].init(84, 19, '!self.hasObserver()');
function visit177_392_1(result) {
  _$jscoverage['/base/observable.js'].branchData['392'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['390'][1].init(305, 9, 'eventDesc');
function visit176_390_1(result) {
  _$jscoverage['/base/observable.js'].branchData['390'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['387'][1].init(135, 19, 'Special[type] || {}');
function visit175_387_1(result) {
  _$jscoverage['/base/observable.js'].branchData['387'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['367'][1].init(316, 8, 's.remove');
function visit174_367_1(result) {
  _$jscoverage['/base/observable.js'].branchData['367'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['364'][1].init(178, 31, 'observer.last && self.lastCount');
function visit173_364_1(result) {
  _$jscoverage['/base/observable.js'].branchData['364'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['361'][1].init(30, 37, 'observer.filter && self.delegateCount');
function visit172_361_1(result) {
  _$jscoverage['/base/observable.js'].branchData['361'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['357'][1].init(390, 44, 'groupsRe && !observer.groups.match(groupsRe)');
function visit171_357_1(result) {
  _$jscoverage['/base/observable.js'].branchData['357'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['352'][1].init(85, 27, '!filter && !observer.filter');
function visit170_352_1(result) {
  _$jscoverage['/base/observable.js'].branchData['352'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['351'][3].init(104, 25, 'filter != observer.filter');
function visit169_351_3(result) {
  _$jscoverage['/base/observable.js'].branchData['351'][3].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['351'][2].init(94, 35, 'filter && filter != observer.filter');
function visit168_351_2(result) {
  _$jscoverage['/base/observable.js'].branchData['351'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['351'][1].init(-1, 114, '(filter && filter != observer.filter) || (!filter && !observer.filter)');
function visit167_351_1(result) {
  _$jscoverage['/base/observable.js'].branchData['351'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['349'][1].init(-1, 251, 'hasFilter && ((filter && filter != observer.filter) || (!filter && !observer.filter))');
function visit166_349_1(result) {
  _$jscoverage['/base/observable.js'].branchData['349'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['348'][1].init(918, 436, '(hasFilter && ((filter && filter != observer.filter) || (!filter && !observer.filter))) || (groupsRe && !observer.groups.match(groupsRe))');
function visit165_348_1(result) {
  _$jscoverage['/base/observable.js'].branchData['348'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['333'][3].init(289, 17, 'fn != observer.fn');
function visit164_333_3(result) {
  _$jscoverage['/base/observable.js'].branchData['333'][3].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['333'][2].init(283, 23, 'fn && fn != observer.fn');
function visit163_333_2(result) {
  _$jscoverage['/base/observable.js'].branchData['333'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['333'][1].init(107, 1355, '(fn && fn != observer.fn) || (hasFilter && ((filter && filter != observer.filter) || (!filter && !observer.filter))) || (groupsRe && !observer.groups.match(groupsRe))');
function visit162_333_1(result) {
  _$jscoverage['/base/observable.js'].branchData['333'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['331'][2].init(174, 26, 'context != observerContext');
function visit161_331_2(result) {
  _$jscoverage['/base/observable.js'].branchData['331'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['331'][1].init(30, 1463, '(context != observerContext) || (fn && fn != observer.fn) || (hasFilter && ((filter && filter != observer.filter) || (!filter && !observer.filter))) || (groupsRe && !observer.groups.match(groupsRe))');
function visit160_331_1(result) {
  _$jscoverage['/base/observable.js'].branchData['331'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['329'][1].init(86, 33, 'observer.context || currentTarget');
function visit159_329_1(result) {
  _$jscoverage['/base/observable.js'].branchData['329'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['327'][1].init(100, 7, 'i < len');
function visit158_327_1(result) {
  _$jscoverage['/base/observable.js'].branchData['327'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['325'][1].init(28, 24, 'context || currentTarget');
function visit157_325_1(result) {
  _$jscoverage['/base/observable.js'].branchData['325'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['324'][2].init(704, 21, 'hasFilter || groupsRe');
function visit156_324_2(result) {
  _$jscoverage['/base/observable.js'].branchData['324'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['324'][1].init(698, 27, 'fn || hasFilter || groupsRe');
function visit155_324_1(result) {
  _$jscoverage['/base/observable.js'].branchData['324'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['317'][1].init(494, 6, 'groups');
function visit154_317_1(result) {
  _$jscoverage['/base/observable.js'].branchData['317'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['313'][1].init(414, 17, '!observers.length');
function visit153_313_1(result) {
  _$jscoverage['/base/observable.js'].branchData['313'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['304'][1].init(64, 24, 'Special[self.type] || {}');
function visit152_304_1(result) {
  _$jscoverage['/base/observable.js'].branchData['304'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['291'][1].init(536, 5, 's.add');
function visit151_291_1(result) {
  _$jscoverage['/base/observable.js'].branchData['291'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['283'][1].init(26, 13, 'observer.last');
function visit150_283_1(result) {
  _$jscoverage['/base/observable.js'].branchData['283'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['279'][1].init(54, 15, 'observer.filter');
function visit149_279_1(result) {
  _$jscoverage['/base/observable.js'].branchData['279'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['277'][1].init(442, 72, 'self.findObserver(observer) == -1');
function visit148_277_1(result) {
  _$jscoverage['/base/observable.js'].branchData['277'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['272'][1].init(22, 12, '!observer.fn');
function visit147_272_1(result) {
  _$jscoverage['/base/observable.js'].branchData['272'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['271'][1].init(265, 14, 'S.Config.debug');
function visit146_271_1(result) {
  _$jscoverage['/base/observable.js'].branchData['271'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['267'][1].init(82, 24, 'Special[self.type] || {}');
function visit145_267_1(result) {
  _$jscoverage['/base/observable.js'].branchData['267'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['241'][1].init(124, 56, 'currentTarget[eventType] && !S.isWindow(currentTarget)');
function visit144_241_1(result) {
  _$jscoverage['/base/observable.js'].branchData['241'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['235'][1].init(2872, 44, '!onlyHandlers && !event.isDefaultPrevented()');
function visit143_235_1(result) {
  _$jscoverage['/base/observable.js'].branchData['235'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['233'][2].init(2815, 36, 'cur && !event.isPropagationStopped()');
function visit142_233_2(result) {
  _$jscoverage['/base/observable.js'].branchData['233'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['233'][1].init(707, 53, '!onlyHandlers && cur && !event.isPropagationStopped()');
function visit141_233_1(result) {
  _$jscoverage['/base/observable.js'].branchData['233'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['229'][2].init(529, 33, 'cur[ontype].call(cur) === false');
function visit140_229_2(result) {
  _$jscoverage['/base/observable.js'].branchData['229'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['229'][1].init(512, 50, 'cur[ontype] && cur[ontype].call(cur) === false');
function visit139_229_1(result) {
  _$jscoverage['/base/observable.js'].branchData['229'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['224'][3].init(108, 14, 'gret !== false');
function visit138_224_3(result) {
  _$jscoverage['/base/observable.js'].branchData['224'][3].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['224'][2].init(87, 17, 'ret !== undefined');
function visit137_224_2(result) {
  _$jscoverage['/base/observable.js'].branchData['224'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['224'][1].init(87, 35, 'ret !== undefined && gret !== false');
function visit136_224_1(result) {
  _$jscoverage['/base/observable.js'].branchData['224'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['222'][1].init(214, 18, 'domEventObservable');
function visit135_222_1(result) {
  _$jscoverage['/base/observable.js'].branchData['222'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['213'][2].init(1975, 14, 'cur && bubbles');
function visit134_213_2(result) {
  _$jscoverage['/base/observable.js'].branchData['213'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['213'][1].init(214, 31, '!onlyHandlers && cur && bubbles');
function visit133_213_1(result) {
  _$jscoverage['/base/observable.js'].branchData['213'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['212'][4].init(160, 19, 'cur === curDocument');
function visit132_212_4(result) {
  _$jscoverage['/base/observable.js'].branchData['212'][4].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['212'][3].init(160, 27, '(cur === curDocument) && win');
function visit131_212_3(result) {
  _$jscoverage['/base/observable.js'].branchData['212'][3].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['212'][2].init(138, 49, 'cur.ownerDocument || (cur === curDocument) && win');
function visit130_212_2(result) {
  _$jscoverage['/base/observable.js'].branchData['212'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['212'][1].init(120, 67, 'cur.parentNode || cur.ownerDocument || (cur === curDocument) && win');
function visit129_212_1(result) {
  _$jscoverage['/base/observable.js'].branchData['212'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['190'][2].init(937, 71, 'specialEvent.preFire.call(currentTarget, event, onlyHandlers) === false');
function visit128_190_2(result) {
  _$jscoverage['/base/observable.js'].branchData['190'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['190'][1].init(913, 95, 'specialEvent.preFire && specialEvent.preFire.call(currentTarget, event, onlyHandlers) === false');
function visit127_190_1(result) {
  _$jscoverage['/base/observable.js'].branchData['190'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['180'][1].init(564, 34, '!(event instanceof DomEventObject)');
function visit126_180_1(result) {
  _$jscoverage['/base/observable.js'].branchData['180'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['176'][2].init(440, 61, 'specialEvent.fire.call(currentTarget, onlyHandlers) === false');
function visit125_176_2(result) {
  _$jscoverage['/base/observable.js'].branchData['176'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['176'][1].init(419, 82, 'specialEvent.fire && specialEvent.fire.call(currentTarget, onlyHandlers) === false');
function visit124_176_1(result) {
  _$jscoverage['/base/observable.js'].branchData['176'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['172'][1].init(214, 30, 'specialEvent.bubbles !== false');
function visit123_172_1(result) {
  _$jscoverage['/base/observable.js'].branchData['172'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['171'][1].init(161, 24, 'Special[eventType] || {}');
function visit122_171_1(result) {
  _$jscoverage['/base/observable.js'].branchData['171'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['165'][1].init(22, 11, 'event || {}');
function visit121_165_1(result) {
  _$jscoverage['/base/observable.js'].branchData['165'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['148'][3].init(315, 17, 'ret !== undefined');
function visit120_148_3(result) {
  _$jscoverage['/base/observable.js'].branchData['148'][3].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['148'][2].init(297, 14, 'gRet !== false');
function visit119_148_2(result) {
  _$jscoverage['/base/observable.js'].branchData['148'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['148'][1].init(297, 35, 'gRet !== false && ret !== undefined');
function visit118_148_1(result) {
  _$jscoverage['/base/observable.js'].branchData['148'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['139'][2].init(371, 33, 'j < currentTargetObservers.length');
function visit117_139_2(result) {
  _$jscoverage['/base/observable.js'].branchData['139'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['139'][1].init(329, 75, '!event.isImmediatePropagationStopped() && j < currentTargetObservers.length');
function visit116_139_1(result) {
  _$jscoverage['/base/observable.js'].branchData['139'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['131'][2].init(3200, 7, 'i < len');
function visit115_131_2(result) {
  _$jscoverage['/base/observable.js'].branchData['131'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['131'][1].init(3167, 40, '!event.isPropagationStopped() && i < len');
function visit114_131_1(result) {
  _$jscoverage['/base/observable.js'].branchData['131'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['120'][1].init(2599, 32, 'delegateCount < observers.length');
function visit113_120_1(result) {
  _$jscoverage['/base/observable.js'].branchData['120'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['114'][1].init(1221, 34, 'target.parentNode || currentTarget');
function visit112_114_1(result) {
  _$jscoverage['/base/observable.js'].branchData['114'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['107'][1].init(810, 29, 'currentTargetObservers.length');
function visit111_107_1(result) {
  _$jscoverage['/base/observable.js'].branchData['107'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['103'][1].init(425, 7, 'matched');
function visit110_103_1(result) {
  _$jscoverage['/base/observable.js'].branchData['103'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['100'][1].init(248, 21, 'matched === undefined');
function visit109_100_1(result) {
  _$jscoverage['/base/observable.js'].branchData['100'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['95'][1].init(190, 17, 'i < delegateCount');
function visit108_95_1(result) {
  _$jscoverage['/base/observable.js'].branchData['95'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['91'][3].init(54, 21, 'eventType !== \'click\'');
function visit107_91_3(result) {
  _$jscoverage['/base/observable.js'].branchData['91'][3].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['91'][2].init(26, 24, 'target.disabled !== true');
function visit106_91_2(result) {
  _$jscoverage['/base/observable.js'].branchData['91'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['91'][1].init(26, 49, 'target.disabled !== true || eventType !== \'click\'');
function visit105_91_1(result) {
  _$jscoverage['/base/observable.js'].branchData['91'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['90'][1].init(25, 23, 'target != currentTarget');
function visit104_90_1(result) {
  _$jscoverage['/base/observable.js'].branchData['90'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['89'][1].init(1046, 32, 'delegateCount && target.nodeType');
function visit103_89_1(result) {
  _$jscoverage['/base/observable.js'].branchData['89'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['82'][1].init(415, 23, 'self.delegateCount || 0');
function visit102_82_1(result) {
  _$jscoverage['/base/observable.js'].branchData['82'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['40'][2].init(342, 43, 's.setup.call(currentTarget, type) === false');
function visit101_40_2(result) {
  _$jscoverage['/base/observable.js'].branchData['40'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['40'][1].init(330, 55, '!s.setup || s.setup.call(currentTarget, type) === false');
function visit100_40_1(result) {
  _$jscoverage['/base/observable.js'].branchData['40'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['35'][1].init(72, 19, 'Special[type] || {}');
function visit99_35_1(result) {
  _$jscoverage['/base/observable.js'].branchData['35'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].lineData[6]++;
KISSY.add('event/dom/base/observable', function(S, Dom, Special, DomEventUtils, DomEventObserver, DomEventObject, BaseEvent) {
  _$jscoverage['/base/observable.js'].functionData[0]++;
  _$jscoverage['/base/observable.js'].lineData[11]++;
  var BaseUtils = BaseEvent.Utils;
  _$jscoverage['/base/observable.js'].lineData[20]++;
  function DomEventObservable(cfg) {
    _$jscoverage['/base/observable.js'].functionData[1]++;
    _$jscoverage['/base/observable.js'].lineData[21]++;
    var self = this;
    _$jscoverage['/base/observable.js'].lineData[22]++;
    S.mix(self, cfg);
    _$jscoverage['/base/observable.js'].lineData[23]++;
    self.reset();
  }
  _$jscoverage['/base/observable.js'].lineData[30]++;
  S.extend(DomEventObservable, BaseEvent.Observable, {
  setup: function() {
  _$jscoverage['/base/observable.js'].functionData[2]++;
  _$jscoverage['/base/observable.js'].lineData[33]++;
  var self = this, type = self.type, s = visit99_35_1(Special[type] || {}), currentTarget = self.currentTarget, eventDesc = DomEventUtils.data(currentTarget), handle = eventDesc.handle;
  _$jscoverage['/base/observable.js'].lineData[40]++;
  if (visit100_40_1(!s.setup || visit101_40_2(s.setup.call(currentTarget, type) === false))) {
    _$jscoverage['/base/observable.js'].lineData[41]++;
    DomEventUtils.simpleAdd(currentTarget, type, handle);
  }
}, 
  constructor: DomEventObservable, 
  reset: function() {
  _$jscoverage['/base/observable.js'].functionData[3]++;
  _$jscoverage['/base/observable.js'].lineData[48]++;
  var self = this;
  _$jscoverage['/base/observable.js'].lineData[49]++;
  DomEventObservable.superclass.reset.call(self);
  _$jscoverage['/base/observable.js'].lineData[50]++;
  self.delegateCount = 0;
  _$jscoverage['/base/observable.js'].lineData[51]++;
  self.lastCount = 0;
}, 
  notify: function(event) {
  _$jscoverage['/base/observable.js'].functionData[4]++;
  _$jscoverage['/base/observable.js'].lineData[70]++;
  var target = event.target, eventType = event['type'], self = this, currentTarget = self.currentTarget, observers = self.observers, currentTarget0, allObservers = [], ret, gRet, observerObj, i, j, delegateCount = visit102_82_1(self.delegateCount || 0), len, currentTargetObservers, currentTargetObserver, observer;
  _$jscoverage['/base/observable.js'].lineData[89]++;
  if (visit103_89_1(delegateCount && target.nodeType)) {
    _$jscoverage['/base/observable.js'].lineData[90]++;
    while (visit104_90_1(target != currentTarget)) {
      _$jscoverage['/base/observable.js'].lineData[91]++;
      if (visit105_91_1(visit106_91_2(target.disabled !== true) || visit107_91_3(eventType !== 'click'))) {
        _$jscoverage['/base/observable.js'].lineData[92]++;
        var cachedMatch = {}, matched, key, filter;
        _$jscoverage['/base/observable.js'].lineData[94]++;
        currentTargetObservers = [];
        _$jscoverage['/base/observable.js'].lineData[95]++;
        for (i = 0; visit108_95_1(i < delegateCount); i++) {
          _$jscoverage['/base/observable.js'].lineData[96]++;
          observer = observers[i];
          _$jscoverage['/base/observable.js'].lineData[97]++;
          filter = observer.filter;
          _$jscoverage['/base/observable.js'].lineData[98]++;
          key = filter + '';
          _$jscoverage['/base/observable.js'].lineData[99]++;
          matched = cachedMatch[key];
          _$jscoverage['/base/observable.js'].lineData[100]++;
          if (visit109_100_1(matched === undefined)) {
            _$jscoverage['/base/observable.js'].lineData[101]++;
            matched = cachedMatch[key] = Dom.test(target, filter);
          }
          _$jscoverage['/base/observable.js'].lineData[103]++;
          if (visit110_103_1(matched)) {
            _$jscoverage['/base/observable.js'].lineData[104]++;
            currentTargetObservers.push(observer);
          }
        }
        _$jscoverage['/base/observable.js'].lineData[107]++;
        if (visit111_107_1(currentTargetObservers.length)) {
          _$jscoverage['/base/observable.js'].lineData[108]++;
          allObservers.push({
  currentTarget: target, 
  'currentTargetObservers': currentTargetObservers});
        }
      }
      _$jscoverage['/base/observable.js'].lineData[114]++;
      target = visit112_114_1(target.parentNode || currentTarget);
    }
  }
  _$jscoverage['/base/observable.js'].lineData[120]++;
  if (visit113_120_1(delegateCount < observers.length)) {
    _$jscoverage['/base/observable.js'].lineData[121]++;
    allObservers.push({
  currentTarget: currentTarget, 
  currentTargetObservers: observers.slice(delegateCount)});
  }
  _$jscoverage['/base/observable.js'].lineData[131]++;
  for (i = 0 , len = allObservers.length; visit114_131_1(!event.isPropagationStopped() && visit115_131_2(i < len)); ++i) {
    _$jscoverage['/base/observable.js'].lineData[133]++;
    observerObj = allObservers[i];
    _$jscoverage['/base/observable.js'].lineData[134]++;
    currentTargetObservers = observerObj.currentTargetObservers;
    _$jscoverage['/base/observable.js'].lineData[135]++;
    currentTarget0 = observerObj.currentTarget;
    _$jscoverage['/base/observable.js'].lineData[136]++;
    event.currentTarget = currentTarget0;
    _$jscoverage['/base/observable.js'].lineData[139]++;
    for (j = 0; visit116_139_1(!event.isImmediatePropagationStopped() && visit117_139_2(j < currentTargetObservers.length)); j++) {
      _$jscoverage['/base/observable.js'].lineData[141]++;
      currentTargetObserver = currentTargetObservers[j];
      _$jscoverage['/base/observable.js'].lineData[143]++;
      ret = currentTargetObserver.notify(event, self);
      _$jscoverage['/base/observable.js'].lineData[148]++;
      if (visit118_148_1(visit119_148_2(gRet !== false) && visit120_148_3(ret !== undefined))) {
        _$jscoverage['/base/observable.js'].lineData[149]++;
        gRet = ret;
      }
    }
  }
  _$jscoverage['/base/observable.js'].lineData[156]++;
  return gRet;
}, 
  fire: function(event, onlyHandlers) {
  _$jscoverage['/base/observable.js'].functionData[5]++;
  _$jscoverage['/base/observable.js'].lineData[165]++;
  event = visit121_165_1(event || {});
  _$jscoverage['/base/observable.js'].lineData[167]++;
  var self = this, eventType = String(self.type), domEventObservable, eventData, specialEvent = visit122_171_1(Special[eventType] || {}), bubbles = visit123_172_1(specialEvent.bubbles !== false), currentTarget = self.currentTarget;
  _$jscoverage['/base/observable.js'].lineData[176]++;
  if (visit124_176_1(specialEvent.fire && visit125_176_2(specialEvent.fire.call(currentTarget, onlyHandlers) === false))) {
    _$jscoverage['/base/observable.js'].lineData[177]++;
    return;
  }
  _$jscoverage['/base/observable.js'].lineData[180]++;
  if (visit126_180_1(!(event instanceof DomEventObject))) {
    _$jscoverage['/base/observable.js'].lineData[181]++;
    eventData = event;
    _$jscoverage['/base/observable.js'].lineData[182]++;
    event = new DomEventObject({
  currentTarget: currentTarget, 
  type: eventType, 
  target: currentTarget});
    _$jscoverage['/base/observable.js'].lineData[187]++;
    S.mix(event, eventData);
  }
  _$jscoverage['/base/observable.js'].lineData[190]++;
  if (visit127_190_1(specialEvent.preFire && visit128_190_2(specialEvent.preFire.call(currentTarget, event, onlyHandlers) === false))) {
    _$jscoverage['/base/observable.js'].lineData[191]++;
    return;
  }
  _$jscoverage['/base/observable.js'].lineData[197]++;
  var cur = currentTarget, win = Dom.getWindow(cur), curDocument = win.document, eventPath = [], gret, ret, ontype = 'on' + eventType, eventPathIndex = 0;
  _$jscoverage['/base/observable.js'].lineData[209]++;
  do {
    _$jscoverage['/base/observable.js'].lineData[210]++;
    eventPath.push(cur);
    _$jscoverage['/base/observable.js'].lineData[212]++;
    cur = visit129_212_1(cur.parentNode || visit130_212_2(cur.ownerDocument || visit131_212_3((visit132_212_4(cur === curDocument)) && win)));
  } while (visit133_213_1(!onlyHandlers && visit134_213_2(cur && bubbles)));
  _$jscoverage['/base/observable.js'].lineData[215]++;
  cur = eventPath[eventPathIndex];
  _$jscoverage['/base/observable.js'].lineData[218]++;
  do {
    _$jscoverage['/base/observable.js'].lineData[219]++;
    event['currentTarget'] = cur;
    _$jscoverage['/base/observable.js'].lineData[220]++;
    domEventObservable = DomEventObservable.getDomEventObservable(cur, eventType);
    _$jscoverage['/base/observable.js'].lineData[222]++;
    if (visit135_222_1(domEventObservable)) {
      _$jscoverage['/base/observable.js'].lineData[223]++;
      ret = domEventObservable.notify(event);
      _$jscoverage['/base/observable.js'].lineData[224]++;
      if (visit136_224_1(visit137_224_2(ret !== undefined) && visit138_224_3(gret !== false))) {
        _$jscoverage['/base/observable.js'].lineData[225]++;
        gret = ret;
      }
    }
    _$jscoverage['/base/observable.js'].lineData[229]++;
    if (visit139_229_1(cur[ontype] && visit140_229_2(cur[ontype].call(cur) === false))) {
      _$jscoverage['/base/observable.js'].lineData[230]++;
      event.preventDefault();
    }
    _$jscoverage['/base/observable.js'].lineData[232]++;
    cur = eventPath[++eventPathIndex];
  } while (visit141_233_1(!onlyHandlers && visit142_233_2(cur && !event.isPropagationStopped())));
  _$jscoverage['/base/observable.js'].lineData[235]++;
  if (visit143_235_1(!onlyHandlers && !event.isDefaultPrevented())) {
    _$jscoverage['/base/observable.js'].lineData[238]++;
    try {
      _$jscoverage['/base/observable.js'].lineData[241]++;
      if (visit144_241_1(currentTarget[eventType] && !S.isWindow(currentTarget))) {
        _$jscoverage['/base/observable.js'].lineData[243]++;
        DomEventObservable.triggeredEvent = eventType;
        _$jscoverage['/base/observable.js'].lineData[247]++;
        currentTarget[eventType]();
      }
    }    catch (eError) {
  _$jscoverage['/base/observable.js'].lineData[250]++;
  S.log('trigger action error: ');
  _$jscoverage['/base/observable.js'].lineData[251]++;
  S.log(eError);
}
    _$jscoverage['/base/observable.js'].lineData[254]++;
    DomEventObservable.triggeredEvent = '';
  }
  _$jscoverage['/base/observable.js'].lineData[257]++;
  return gret;
}, 
  on: function(cfg) {
  _$jscoverage['/base/observable.js'].functionData[6]++;
  _$jscoverage['/base/observable.js'].lineData[265]++;
  var self = this, observers = self.observers, s = visit145_267_1(Special[self.type] || {}), observer = cfg instanceof DomEventObserver ? cfg : new DomEventObserver(cfg);
  _$jscoverage['/base/observable.js'].lineData[271]++;
  if (visit146_271_1(S.Config.debug)) {
    _$jscoverage['/base/observable.js'].lineData[272]++;
    if (visit147_272_1(!observer.fn)) {
      _$jscoverage['/base/observable.js'].lineData[273]++;
      S.error('lack event handler for ' + self.type);
    }
  }
  _$jscoverage['/base/observable.js'].lineData[277]++;
  if (visit148_277_1(self.findObserver(observer) == -1)) {
    _$jscoverage['/base/observable.js'].lineData[279]++;
    if (visit149_279_1(observer.filter)) {
      _$jscoverage['/base/observable.js'].lineData[280]++;
      observers.splice(self.delegateCount, 0, observer);
      _$jscoverage['/base/observable.js'].lineData[281]++;
      self.delegateCount++;
    } else {
      _$jscoverage['/base/observable.js'].lineData[283]++;
      if (visit150_283_1(observer.last)) {
        _$jscoverage['/base/observable.js'].lineData[284]++;
        observers.push(observer);
        _$jscoverage['/base/observable.js'].lineData[285]++;
        self.lastCount++;
      } else {
        _$jscoverage['/base/observable.js'].lineData[287]++;
        observers.splice(observers.length - self.lastCount, 0, observer);
      }
    }
    _$jscoverage['/base/observable.js'].lineData[291]++;
    if (visit151_291_1(s.add)) {
      _$jscoverage['/base/observable.js'].lineData[292]++;
      s.add.call(self.currentTarget, observer);
    }
  }
}, 
  detach: function(cfg) {
  _$jscoverage['/base/observable.js'].functionData[7]++;
  _$jscoverage['/base/observable.js'].lineData[302]++;
  var groupsRe, self = this, s = visit152_304_1(Special[self.type] || {}), hasFilter = 'filter' in cfg, filter = cfg.filter, context = cfg.context, fn = cfg.fn, currentTarget = self.currentTarget, observers = self.observers, groups = cfg.groups;
  _$jscoverage['/base/observable.js'].lineData[313]++;
  if (visit153_313_1(!observers.length)) {
    _$jscoverage['/base/observable.js'].lineData[314]++;
    return;
  }
  _$jscoverage['/base/observable.js'].lineData[317]++;
  if (visit154_317_1(groups)) {
    _$jscoverage['/base/observable.js'].lineData[318]++;
    groupsRe = BaseUtils.getGroupsRe(groups);
  }
  _$jscoverage['/base/observable.js'].lineData[321]++;
  var i, j, t, observer, observerContext, len = observers.length;
  _$jscoverage['/base/observable.js'].lineData[324]++;
  if (visit155_324_1(fn || visit156_324_2(hasFilter || groupsRe))) {
    _$jscoverage['/base/observable.js'].lineData[325]++;
    context = visit157_325_1(context || currentTarget);
    _$jscoverage['/base/observable.js'].lineData[327]++;
    for (i = 0 , j = 0 , t = []; visit158_327_1(i < len); ++i) {
      _$jscoverage['/base/observable.js'].lineData[328]++;
      observer = observers[i];
      _$jscoverage['/base/observable.js'].lineData[329]++;
      observerContext = visit159_329_1(observer.context || currentTarget);
      _$jscoverage['/base/observable.js'].lineData[330]++;
      if (visit160_331_1((visit161_331_2(context != observerContext)) || visit162_333_1((visit163_333_2(fn && visit164_333_3(fn != observer.fn))) || visit165_348_1((visit166_349_1(hasFilter && (visit167_351_1((visit168_351_2(filter && visit169_351_3(filter != observer.filter))) || (visit170_352_1(!filter && !observer.filter)))))) || (visit171_357_1(groupsRe && !observer.groups.match(groupsRe))))))) {
        _$jscoverage['/base/observable.js'].lineData[359]++;
        t[j++] = observer;
      } else {
        _$jscoverage['/base/observable.js'].lineData[361]++;
        if (visit172_361_1(observer.filter && self.delegateCount)) {
          _$jscoverage['/base/observable.js'].lineData[362]++;
          self.delegateCount--;
        }
        _$jscoverage['/base/observable.js'].lineData[364]++;
        if (visit173_364_1(observer.last && self.lastCount)) {
          _$jscoverage['/base/observable.js'].lineData[365]++;
          self.lastCount--;
        }
        _$jscoverage['/base/observable.js'].lineData[367]++;
        if (visit174_367_1(s.remove)) {
          _$jscoverage['/base/observable.js'].lineData[368]++;
          s.remove.call(currentTarget, observer);
        }
      }
    }
    _$jscoverage['/base/observable.js'].lineData[373]++;
    self.observers = t;
  } else {
    _$jscoverage['/base/observable.js'].lineData[376]++;
    self.reset();
  }
  _$jscoverage['/base/observable.js'].lineData[379]++;
  self.checkMemory();
}, 
  checkMemory: function() {
  _$jscoverage['/base/observable.js'].functionData[8]++;
  _$jscoverage['/base/observable.js'].lineData[383]++;
  var self = this, type = self.type, domEventObservables, handle, s = visit175_387_1(Special[type] || {}), currentTarget = self.currentTarget, eventDesc = DomEventUtils.data(currentTarget);
  _$jscoverage['/base/observable.js'].lineData[390]++;
  if (visit176_390_1(eventDesc)) {
    _$jscoverage['/base/observable.js'].lineData[391]++;
    domEventObservables = eventDesc.observables;
    _$jscoverage['/base/observable.js'].lineData[392]++;
    if (visit177_392_1(!self.hasObserver())) {
      _$jscoverage['/base/observable.js'].lineData[393]++;
      handle = eventDesc.handle;
      _$jscoverage['/base/observable.js'].lineData[396]++;
      if ((visit178_396_1(!s['tearDown'] || visit179_396_2(s['tearDown'].call(currentTarget, type) === false)))) {
        _$jscoverage['/base/observable.js'].lineData[397]++;
        DomEventUtils.simpleRemove(currentTarget, type, handle);
      }
      _$jscoverage['/base/observable.js'].lineData[400]++;
      delete domEventObservables[type];
    }
    _$jscoverage['/base/observable.js'].lineData[404]++;
    if (visit180_404_1(S.isEmptyObject(domEventObservables))) {
      _$jscoverage['/base/observable.js'].lineData[405]++;
      eventDesc.handle = null;
      _$jscoverage['/base/observable.js'].lineData[406]++;
      DomEventUtils.removeData(currentTarget);
    }
  }
}});
  _$jscoverage['/base/observable.js'].lineData[412]++;
  DomEventObservable.triggeredEvent = '';
  _$jscoverage['/base/observable.js'].lineData[420]++;
  DomEventObservable.getDomEventObservable = function(node, type) {
  _$jscoverage['/base/observable.js'].functionData[9]++;
  _$jscoverage['/base/observable.js'].lineData[422]++;
  var domEventObservablesHolder = DomEventUtils.data(node), domEventObservables;
  _$jscoverage['/base/observable.js'].lineData[424]++;
  if (visit181_424_1(domEventObservablesHolder)) {
    _$jscoverage['/base/observable.js'].lineData[425]++;
    domEventObservables = domEventObservablesHolder.observables;
  }
  _$jscoverage['/base/observable.js'].lineData[427]++;
  if (visit182_427_1(domEventObservables)) {
    _$jscoverage['/base/observable.js'].lineData[428]++;
    return domEventObservables[type];
  }
  _$jscoverage['/base/observable.js'].lineData[431]++;
  return null;
};
  _$jscoverage['/base/observable.js'].lineData[435]++;
  DomEventObservable.getDomEventObservablesHolder = function(node, create) {
  _$jscoverage['/base/observable.js'].functionData[10]++;
  _$jscoverage['/base/observable.js'].lineData[436]++;
  var domEventObservables = DomEventUtils.data(node);
  _$jscoverage['/base/observable.js'].lineData[437]++;
  if (visit183_437_1(!domEventObservables && create)) {
    _$jscoverage['/base/observable.js'].lineData[438]++;
    DomEventUtils.data(node, domEventObservables = {});
  }
  _$jscoverage['/base/observable.js'].lineData[440]++;
  return domEventObservables;
};
  _$jscoverage['/base/observable.js'].lineData[443]++;
  return DomEventObservable;
}, {
  requires: ['dom', './special', './utils', './observer', './object', 'event/base']});
