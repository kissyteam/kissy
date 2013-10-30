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
if (! _$jscoverage['/lang/object.js']) {
  _$jscoverage['/lang/object.js'] = {};
  _$jscoverage['/lang/object.js'].lineData = [];
  _$jscoverage['/lang/object.js'].lineData[7] = 0;
  _$jscoverage['/lang/object.js'].lineData[9] = 0;
  _$jscoverage['/lang/object.js'].lineData[28] = 0;
  _$jscoverage['/lang/object.js'].lineData[38] = 0;
  _$jscoverage['/lang/object.js'].lineData[39] = 0;
  _$jscoverage['/lang/object.js'].lineData[40] = 0;
  _$jscoverage['/lang/object.js'].lineData[41] = 0;
  _$jscoverage['/lang/object.js'].lineData[42] = 0;
  _$jscoverage['/lang/object.js'].lineData[43] = 0;
  _$jscoverage['/lang/object.js'].lineData[44] = 0;
  _$jscoverage['/lang/object.js'].lineData[47] = 0;
  _$jscoverage['/lang/object.js'].lineData[50] = 0;
  _$jscoverage['/lang/object.js'].lineData[61] = 0;
  _$jscoverage['/lang/object.js'].lineData[63] = 0;
  _$jscoverage['/lang/object.js'].lineData[65] = 0;
  _$jscoverage['/lang/object.js'].lineData[66] = 0;
  _$jscoverage['/lang/object.js'].lineData[70] = 0;
  _$jscoverage['/lang/object.js'].lineData[71] = 0;
  _$jscoverage['/lang/object.js'].lineData[72] = 0;
  _$jscoverage['/lang/object.js'].lineData[73] = 0;
  _$jscoverage['/lang/object.js'].lineData[74] = 0;
  _$jscoverage['/lang/object.js'].lineData[79] = 0;
  _$jscoverage['/lang/object.js'].lineData[105] = 0;
  _$jscoverage['/lang/object.js'].lineData[106] = 0;
  _$jscoverage['/lang/object.js'].lineData[110] = 0;
  _$jscoverage['/lang/object.js'].lineData[111] = 0;
  _$jscoverage['/lang/object.js'].lineData[114] = 0;
  _$jscoverage['/lang/object.js'].lineData[115] = 0;
  _$jscoverage['/lang/object.js'].lineData[116] = 0;
  _$jscoverage['/lang/object.js'].lineData[117] = 0;
  _$jscoverage['/lang/object.js'].lineData[121] = 0;
  _$jscoverage['/lang/object.js'].lineData[122] = 0;
  _$jscoverage['/lang/object.js'].lineData[125] = 0;
  _$jscoverage['/lang/object.js'].lineData[128] = 0;
  _$jscoverage['/lang/object.js'].lineData[129] = 0;
  _$jscoverage['/lang/object.js'].lineData[130] = 0;
  _$jscoverage['/lang/object.js'].lineData[132] = 0;
  _$jscoverage['/lang/object.js'].lineData[145] = 0;
  _$jscoverage['/lang/object.js'].lineData[146] = 0;
  _$jscoverage['/lang/object.js'].lineData[149] = 0;
  _$jscoverage['/lang/object.js'].lineData[150] = 0;
  _$jscoverage['/lang/object.js'].lineData[152] = 0;
  _$jscoverage['/lang/object.js'].lineData[165] = 0;
  _$jscoverage['/lang/object.js'].lineData[173] = 0;
  _$jscoverage['/lang/object.js'].lineData[174] = 0;
  _$jscoverage['/lang/object.js'].lineData[175] = 0;
  _$jscoverage['/lang/object.js'].lineData[176] = 0;
  _$jscoverage['/lang/object.js'].lineData[178] = 0;
  _$jscoverage['/lang/object.js'].lineData[179] = 0;
  _$jscoverage['/lang/object.js'].lineData[180] = 0;
  _$jscoverage['/lang/object.js'].lineData[183] = 0;
  _$jscoverage['/lang/object.js'].lineData[184] = 0;
  _$jscoverage['/lang/object.js'].lineData[185] = 0;
  _$jscoverage['/lang/object.js'].lineData[186] = 0;
  _$jscoverage['/lang/object.js'].lineData[188] = 0;
  _$jscoverage['/lang/object.js'].lineData[191] = 0;
  _$jscoverage['/lang/object.js'].lineData[206] = 0;
  _$jscoverage['/lang/object.js'].lineData[207] = 0;
  _$jscoverage['/lang/object.js'].lineData[210] = 0;
  _$jscoverage['/lang/object.js'].lineData[215] = 0;
  _$jscoverage['/lang/object.js'].lineData[218] = 0;
  _$jscoverage['/lang/object.js'].lineData[219] = 0;
  _$jscoverage['/lang/object.js'].lineData[220] = 0;
  _$jscoverage['/lang/object.js'].lineData[223] = 0;
  _$jscoverage['/lang/object.js'].lineData[224] = 0;
  _$jscoverage['/lang/object.js'].lineData[228] = 0;
  _$jscoverage['/lang/object.js'].lineData[229] = 0;
  _$jscoverage['/lang/object.js'].lineData[232] = 0;
  _$jscoverage['/lang/object.js'].lineData[250] = 0;
  _$jscoverage['/lang/object.js'].lineData[255] = 0;
  _$jscoverage['/lang/object.js'].lineData[256] = 0;
  _$jscoverage['/lang/object.js'].lineData[257] = 0;
  _$jscoverage['/lang/object.js'].lineData[258] = 0;
  _$jscoverage['/lang/object.js'].lineData[259] = 0;
  _$jscoverage['/lang/object.js'].lineData[262] = 0;
  _$jscoverage['/lang/object.js'].lineData[267] = 0;
  _$jscoverage['/lang/object.js'].lineData[270] = 0;
  _$jscoverage['/lang/object.js'].lineData[271] = 0;
  _$jscoverage['/lang/object.js'].lineData[272] = 0;
  _$jscoverage['/lang/object.js'].lineData[273] = 0;
  _$jscoverage['/lang/object.js'].lineData[275] = 0;
  _$jscoverage['/lang/object.js'].lineData[276] = 0;
  _$jscoverage['/lang/object.js'].lineData[278] = 0;
  _$jscoverage['/lang/object.js'].lineData[279] = 0;
  _$jscoverage['/lang/object.js'].lineData[282] = 0;
  _$jscoverage['/lang/object.js'].lineData[283] = 0;
  _$jscoverage['/lang/object.js'].lineData[284] = 0;
  _$jscoverage['/lang/object.js'].lineData[288] = 0;
  _$jscoverage['/lang/object.js'].lineData[289] = 0;
  _$jscoverage['/lang/object.js'].lineData[290] = 0;
  _$jscoverage['/lang/object.js'].lineData[292] = 0;
  _$jscoverage['/lang/object.js'].lineData[295] = 0;
  _$jscoverage['/lang/object.js'].lineData[298] = 0;
  _$jscoverage['/lang/object.js'].lineData[301] = 0;
  _$jscoverage['/lang/object.js'].lineData[302] = 0;
  _$jscoverage['/lang/object.js'].lineData[303] = 0;
  _$jscoverage['/lang/object.js'].lineData[304] = 0;
  _$jscoverage['/lang/object.js'].lineData[305] = 0;
  _$jscoverage['/lang/object.js'].lineData[307] = 0;
  _$jscoverage['/lang/object.js'].lineData[311] = 0;
  _$jscoverage['/lang/object.js'].lineData[314] = 0;
  _$jscoverage['/lang/object.js'].lineData[315] = 0;
  _$jscoverage['/lang/object.js'].lineData[318] = 0;
  _$jscoverage['/lang/object.js'].lineData[322] = 0;
  _$jscoverage['/lang/object.js'].lineData[323] = 0;
  _$jscoverage['/lang/object.js'].lineData[326] = 0;
  _$jscoverage['/lang/object.js'].lineData[328] = 0;
  _$jscoverage['/lang/object.js'].lineData[329] = 0;
  _$jscoverage['/lang/object.js'].lineData[331] = 0;
  _$jscoverage['/lang/object.js'].lineData[333] = 0;
  _$jscoverage['/lang/object.js'].lineData[334] = 0;
  _$jscoverage['/lang/object.js'].lineData[337] = 0;
  _$jscoverage['/lang/object.js'].lineData[338] = 0;
  _$jscoverage['/lang/object.js'].lineData[339] = 0;
  _$jscoverage['/lang/object.js'].lineData[343] = 0;
  _$jscoverage['/lang/object.js'].lineData[346] = 0;
  _$jscoverage['/lang/object.js'].lineData[347] = 0;
  _$jscoverage['/lang/object.js'].lineData[349] = 0;
  _$jscoverage['/lang/object.js'].lineData[350] = 0;
}
if (! _$jscoverage['/lang/object.js'].functionData) {
  _$jscoverage['/lang/object.js'].functionData = [];
  _$jscoverage['/lang/object.js'].functionData[0] = 0;
  _$jscoverage['/lang/object.js'].functionData[1] = 0;
  _$jscoverage['/lang/object.js'].functionData[2] = 0;
  _$jscoverage['/lang/object.js'].functionData[3] = 0;
  _$jscoverage['/lang/object.js'].functionData[4] = 0;
  _$jscoverage['/lang/object.js'].functionData[5] = 0;
  _$jscoverage['/lang/object.js'].functionData[6] = 0;
  _$jscoverage['/lang/object.js'].functionData[7] = 0;
  _$jscoverage['/lang/object.js'].functionData[8] = 0;
  _$jscoverage['/lang/object.js'].functionData[9] = 0;
  _$jscoverage['/lang/object.js'].functionData[10] = 0;
  _$jscoverage['/lang/object.js'].functionData[11] = 0;
  _$jscoverage['/lang/object.js'].functionData[12] = 0;
  _$jscoverage['/lang/object.js'].functionData[13] = 0;
  _$jscoverage['/lang/object.js'].functionData[14] = 0;
}
if (! _$jscoverage['/lang/object.js'].branchData) {
  _$jscoverage['/lang/object.js'].branchData = {};
  _$jscoverage['/lang/object.js'].branchData['38'] = [];
  _$jscoverage['/lang/object.js'].branchData['38'][1] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['40'] = [];
  _$jscoverage['/lang/object.js'].branchData['40'][1] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['42'] = [];
  _$jscoverage['/lang/object.js'].branchData['42'][1] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['60'] = [];
  _$jscoverage['/lang/object.js'].branchData['60'][1] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['65'] = [];
  _$jscoverage['/lang/object.js'].branchData['65'][1] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['70'] = [];
  _$jscoverage['/lang/object.js'].branchData['70'][1] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['71'] = [];
  _$jscoverage['/lang/object.js'].branchData['71'][1] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['73'] = [];
  _$jscoverage['/lang/object.js'].branchData['73'][1] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['105'] = [];
  _$jscoverage['/lang/object.js'].branchData['105'][1] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['114'] = [];
  _$jscoverage['/lang/object.js'].branchData['114'][1] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['114'][2] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['121'] = [];
  _$jscoverage['/lang/object.js'].branchData['121'][1] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['149'] = [];
  _$jscoverage['/lang/object.js'].branchData['149'][1] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['173'] = [];
  _$jscoverage['/lang/object.js'].branchData['173'][1] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['178'] = [];
  _$jscoverage['/lang/object.js'].branchData['178'][1] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['183'] = [];
  _$jscoverage['/lang/object.js'].branchData['183'][1] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['185'] = [];
  _$jscoverage['/lang/object.js'].branchData['185'][1] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['206'] = [];
  _$jscoverage['/lang/object.js'].branchData['206'][1] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['223'] = [];
  _$jscoverage['/lang/object.js'].branchData['223'][1] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['228'] = [];
  _$jscoverage['/lang/object.js'].branchData['228'][1] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['253'] = [];
  _$jscoverage['/lang/object.js'].branchData['253'][1] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['253'][2] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['255'] = [];
  _$jscoverage['/lang/object.js'].branchData['255'][1] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['258'] = [];
  _$jscoverage['/lang/object.js'].branchData['258'][1] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['258'][2] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['259'] = [];
  _$jscoverage['/lang/object.js'].branchData['259'][1] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['272'] = [];
  _$jscoverage['/lang/object.js'].branchData['272'][1] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['289'] = [];
  _$jscoverage['/lang/object.js'].branchData['289'][1] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['303'] = [];
  _$jscoverage['/lang/object.js'].branchData['303'][1] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['305'] = [];
  _$jscoverage['/lang/object.js'].branchData['305'][1] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['315'] = [];
  _$jscoverage['/lang/object.js'].branchData['315'][1] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['322'] = [];
  _$jscoverage['/lang/object.js'].branchData['322'][1] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['322'][2] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['326'] = [];
  _$jscoverage['/lang/object.js'].branchData['326'][1] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['328'] = [];
  _$jscoverage['/lang/object.js'].branchData['328'][1] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['333'] = [];
  _$jscoverage['/lang/object.js'].branchData['333'][1] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['337'] = [];
  _$jscoverage['/lang/object.js'].branchData['337'][1] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['337'][2] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['337'][3] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['338'] = [];
  _$jscoverage['/lang/object.js'].branchData['338'][1] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['343'] = [];
  _$jscoverage['/lang/object.js'].branchData['343'][1] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['343'][2] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['349'] = [];
  _$jscoverage['/lang/object.js'].branchData['349'][1] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['349'][2] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['349'][3] = new BranchData();
}
_$jscoverage['/lang/object.js'].branchData['349'][3].init(1089, 15, 'ov || !(p in r)');
function visit268_349_3(result) {
  _$jscoverage['/lang/object.js'].branchData['349'][3].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['349'][2].init(1067, 17, 'src !== undefined');
function visit267_349_2(result) {
  _$jscoverage['/lang/object.js'].branchData['349'][2].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['349'][1].init(1067, 38, 'src !== undefined && (ov || !(p in r))');
function visit266_349_1(result) {
  _$jscoverage['/lang/object.js'].branchData['349'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['343'][2].init(139, 44, 'S.isArray(target) || S.isPlainObject(target)');
function visit265_343_2(result) {
  _$jscoverage['/lang/object.js'].branchData['343'][2].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['343'][1].init(128, 56, 'target && (S.isArray(target) || S.isPlainObject(target))');
function visit264_343_1(result) {
  _$jscoverage['/lang/object.js'].branchData['343'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['338'][1].init(22, 27, 'src[MIX_CIRCULAR_DETECTION]');
function visit263_338_1(result) {
  _$jscoverage['/lang/object.js'].branchData['338'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['337'][3].init(470, 38, 'S.isArray(src) || S.isPlainObject(src)');
function visit262_337_3(result) {
  _$jscoverage['/lang/object.js'].branchData['337'][3].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['337'][2].init(462, 47, 'src && (S.isArray(src) || S.isPlainObject(src))');
function visit261_337_2(result) {
  _$jscoverage['/lang/object.js'].branchData['337'][2].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['337'][1].init(454, 55, 'deep && src && (S.isArray(src) || S.isPlainObject(src))');
function visit260_337_1(result) {
  _$jscoverage['/lang/object.js'].branchData['337'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['333'][1].init(337, 2, 'wl');
function visit259_333_1(result) {
  _$jscoverage['/lang/object.js'].branchData['333'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['328'][1].init(66, 20, 'target === undefined');
function visit258_328_1(result) {
  _$jscoverage['/lang/object.js'].branchData['328'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['326'][1].init(118, 14, 'target === src');
function visit257_326_1(result) {
  _$jscoverage['/lang/object.js'].branchData['326'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['322'][2].init(77, 17, '!(p in r) || deep');
function visit256_322_2(result) {
  _$jscoverage['/lang/object.js'].branchData['322'][2].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['322'][1].init(71, 23, 'ov || !(p in r) || deep');
function visit255_322_1(result) {
  _$jscoverage['/lang/object.js'].branchData['322'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['315'][1].init(17, 18, 'k == \'constructor\'');
function visit254_315_1(result) {
  _$jscoverage['/lang/object.js'].branchData['315'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['305'][1].init(44, 27, 'p != MIX_CIRCULAR_DETECTION');
function visit253_305_1(result) {
  _$jscoverage['/lang/object.js'].branchData['305'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['303'][1].init(312, 7, 'i < len');
function visit252_303_1(result) {
  _$jscoverage['/lang/object.js'].branchData['303'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['289'][1].init(14, 8, '!s || !r');
function visit251_289_1(result) {
  _$jscoverage['/lang/object.js'].branchData['289'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['272'][1].init(37, 12, 'ObjectCreate');
function visit250_272_1(result) {
  _$jscoverage['/lang/object.js'].branchData['272'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['259'][1].init(36, 14, 'o[p[j]] || {}');
function visit249_259_1(result) {
  _$jscoverage['/lang/object.js'].branchData['259'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['258'][2].init(149, 12, 'j < p.length');
function visit248_258_2(result) {
  _$jscoverage['/lang/object.js'].branchData['258'][2].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['258'][1].init(122, 16, 'host[p[0]] === o');
function visit247_258_1(result) {
  _$jscoverage['/lang/object.js'].branchData['258'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['255'][1].init(203, 5, 'i < l');
function visit246_255_1(result) {
  _$jscoverage['/lang/object.js'].branchData['255'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['253'][2].init(131, 20, 'args[l - 1] === TRUE');
function visit245_253_2(result) {
  _$jscoverage['/lang/object.js'].branchData['253'][2].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['253'][1].init(131, 27, 'args[l - 1] === TRUE && l--');
function visit244_253_1(result) {
  _$jscoverage['/lang/object.js'].branchData['253'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['228'][1].init(590, 2, 'sx');
function visit243_228_1(result) {
  _$jscoverage['/lang/object.js'].branchData['228'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['223'][1].init(481, 2, 'px');
function visit242_223_1(result) {
  _$jscoverage['/lang/object.js'].branchData['223'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['206'][1].init(18, 8, '!s || !r');
function visit241_206_1(result) {
  _$jscoverage['/lang/object.js'].branchData['206'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['185'][1].init(54, 21, 'proto = arg.prototype');
function visit240_185_1(result) {
  _$jscoverage['/lang/object.js'].branchData['185'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['183'][1].init(502, 7, 'i < len');
function visit239_183_1(result) {
  _$jscoverage['/lang/object.js'].branchData['183'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['178'][1].init(381, 23, 'typeof ov !== \'boolean\'');
function visit238_178_1(result) {
  _$jscoverage['/lang/object.js'].branchData['178'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['173'][1].init(248, 14, '!S.isArray(wl)');
function visit237_173_1(result) {
  _$jscoverage['/lang/object.js'].branchData['173'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['149'][1].init(157, 5, 'i < l');
function visit236_149_1(result) {
  _$jscoverage['/lang/object.js'].branchData['149'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['121'][1].init(534, 16, 'ov === undefined');
function visit235_121_1(result) {
  _$jscoverage['/lang/object.js'].branchData['121'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['114'][2].init(293, 24, 'typeof wl !== \'function\'');
function visit234_114_2(result) {
  _$jscoverage['/lang/object.js'].branchData['114'][2].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['114'][1].init(286, 32, 'wl && (typeof wl !== \'function\')');
function visit233_114_1(result) {
  _$jscoverage['/lang/object.js'].branchData['114'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['105'][1].init(18, 22, 'typeof ov === \'object\'');
function visit232_105_1(result) {
  _$jscoverage['/lang/object.js'].branchData['105'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['73'][1].init(70, 19, 'o.hasOwnProperty(p)');
function visit231_73_1(result) {
  _$jscoverage['/lang/object.js'].branchData['73'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['71'][1].init(54, 6, 'i >= 0');
function visit230_71_1(result) {
  _$jscoverage['/lang/object.js'].branchData['71'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['70'][1].init(238, 10, 'hasEnumBug');
function visit229_70_1(result) {
  _$jscoverage['/lang/object.js'].branchData['70'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['65'][1].init(59, 19, 'o.hasOwnProperty(p)');
function visit228_65_1(result) {
  _$jscoverage['/lang/object.js'].branchData['65'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['60'][1].init(1007, 576, 'Obj.keys || function(o) {\n  var result = [], p, i;\n  for (p in o) {\n    if (o.hasOwnProperty(p)) {\n      result.push(p);\n    }\n  }\n  if (hasEnumBug) {\n    for (i = enumProperties.length - 1; i >= 0; i--) {\n      p = enumProperties[i];\n      if (o.hasOwnProperty(p)) {\n        result.push(p);\n      }\n    }\n  }\n  return result;\n}');
function visit227_60_1(result) {
  _$jscoverage['/lang/object.js'].branchData['60'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['42'][1].init(162, 9, '!readOnly');
function visit226_42_1(result) {
  _$jscoverage['/lang/object.js'].branchData['42'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['40'][1].init(99, 4, 'guid');
function visit225_40_1(result) {
  _$jscoverage['/lang/object.js'].branchData['40'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['38'][1].init(23, 22, 'marker || STAMP_MARKER');
function visit224_38_1(result) {
  _$jscoverage['/lang/object.js'].branchData['38'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].lineData[7]++;
(function(S, undefined) {
  _$jscoverage['/lang/object.js'].functionData[0]++;
  _$jscoverage['/lang/object.js'].lineData[9]++;
  var MIX_CIRCULAR_DETECTION = '__MIX_CIRCULAR', STAMP_MARKER = '__~ks_stamped', host = this, TRUE = true, EMPTY = '', Obj = Object, ObjectCreate = Obj.create, hasEnumBug = !({
  toString: 1}['propertyIsEnumerable']('toString')), enumProperties = ['constructor', 'hasOwnProperty', 'isPrototypeOf', 'propertyIsEnumerable', 'toString', 'toLocaleString', 'valueOf'];
  _$jscoverage['/lang/object.js'].lineData[28]++;
  mix(S, {
  stamp: function(o, readOnly, marker) {
  _$jscoverage['/lang/object.js'].functionData[1]++;
  _$jscoverage['/lang/object.js'].lineData[38]++;
  marker = visit224_38_1(marker || STAMP_MARKER);
  _$jscoverage['/lang/object.js'].lineData[39]++;
  var guid = o[marker];
  _$jscoverage['/lang/object.js'].lineData[40]++;
  if (visit225_40_1(guid)) {
    _$jscoverage['/lang/object.js'].lineData[41]++;
    return guid;
  } else {
    _$jscoverage['/lang/object.js'].lineData[42]++;
    if (visit226_42_1(!readOnly)) {
      _$jscoverage['/lang/object.js'].lineData[43]++;
      try {
        _$jscoverage['/lang/object.js'].lineData[44]++;
        guid = o[marker] = S.guid(marker);
      }      catch (e) {
  _$jscoverage['/lang/object.js'].lineData[47]++;
  guid = undefined;
}
    }
  }
  _$jscoverage['/lang/object.js'].lineData[50]++;
  return guid;
}, 
  keys: visit227_60_1(Obj.keys || function(o) {
  _$jscoverage['/lang/object.js'].functionData[2]++;
  _$jscoverage['/lang/object.js'].lineData[61]++;
  var result = [], p, i;
  _$jscoverage['/lang/object.js'].lineData[63]++;
  for (p in o) {
    _$jscoverage['/lang/object.js'].lineData[65]++;
    if (visit228_65_1(o.hasOwnProperty(p))) {
      _$jscoverage['/lang/object.js'].lineData[66]++;
      result.push(p);
    }
  }
  _$jscoverage['/lang/object.js'].lineData[70]++;
  if (visit229_70_1(hasEnumBug)) {
    _$jscoverage['/lang/object.js'].lineData[71]++;
    for (i = enumProperties.length - 1; visit230_71_1(i >= 0); i--) {
      _$jscoverage['/lang/object.js'].lineData[72]++;
      p = enumProperties[i];
      _$jscoverage['/lang/object.js'].lineData[73]++;
      if (visit231_73_1(o.hasOwnProperty(p))) {
        _$jscoverage['/lang/object.js'].lineData[74]++;
        result.push(p);
      }
    }
  }
  _$jscoverage['/lang/object.js'].lineData[79]++;
  return result;
}), 
  mix: function(r, s, ov, wl, deep) {
  _$jscoverage['/lang/object.js'].functionData[3]++;
  _$jscoverage['/lang/object.js'].lineData[105]++;
  if (visit232_105_1(typeof ov === 'object')) {
    _$jscoverage['/lang/object.js'].lineData[106]++;
    wl = ov['whitelist'];
    _$jscoverage['/lang/object.js'].lineData[110]++;
    deep = ov['deep'];
    _$jscoverage['/lang/object.js'].lineData[111]++;
    ov = ov['overwrite'];
  }
  _$jscoverage['/lang/object.js'].lineData[114]++;
  if (visit233_114_1(wl && (visit234_114_2(typeof wl !== 'function')))) {
    _$jscoverage['/lang/object.js'].lineData[115]++;
    var originalWl = wl;
    _$jscoverage['/lang/object.js'].lineData[116]++;
    wl = function(name, val) {
  _$jscoverage['/lang/object.js'].functionData[4]++;
  _$jscoverage['/lang/object.js'].lineData[117]++;
  return S.inArray(name, originalWl) ? val : undefined;
};
  }
  _$jscoverage['/lang/object.js'].lineData[121]++;
  if (visit235_121_1(ov === undefined)) {
    _$jscoverage['/lang/object.js'].lineData[122]++;
    ov = TRUE;
  }
  _$jscoverage['/lang/object.js'].lineData[125]++;
  var cache = [], c, i = 0;
  _$jscoverage['/lang/object.js'].lineData[128]++;
  mixInternal(r, s, ov, wl, deep, cache);
  _$jscoverage['/lang/object.js'].lineData[129]++;
  while (c = cache[i++]) {
    _$jscoverage['/lang/object.js'].lineData[130]++;
    delete c[MIX_CIRCULAR_DETECTION];
  }
  _$jscoverage['/lang/object.js'].lineData[132]++;
  return r;
}, 
  merge: function(var_args) {
  _$jscoverage['/lang/object.js'].functionData[5]++;
  _$jscoverage['/lang/object.js'].lineData[145]++;
  var_args = S.makeArray(arguments);
  _$jscoverage['/lang/object.js'].lineData[146]++;
  var o = {}, i, l = var_args.length;
  _$jscoverage['/lang/object.js'].lineData[149]++;
  for (i = 0; visit236_149_1(i < l); i++) {
    _$jscoverage['/lang/object.js'].lineData[150]++;
    S.mix(o, var_args[i]);
  }
  _$jscoverage['/lang/object.js'].lineData[152]++;
  return o;
}, 
  augment: function(r, var_args) {
  _$jscoverage['/lang/object.js'].functionData[6]++;
  _$jscoverage['/lang/object.js'].lineData[165]++;
  var args = S.makeArray(arguments), len = args.length - 2, i = 1, proto, arg, ov = args[len], wl = args[len + 1];
  _$jscoverage['/lang/object.js'].lineData[173]++;
  if (visit237_173_1(!S.isArray(wl))) {
    _$jscoverage['/lang/object.js'].lineData[174]++;
    ov = wl;
    _$jscoverage['/lang/object.js'].lineData[175]++;
    wl = undefined;
    _$jscoverage['/lang/object.js'].lineData[176]++;
    len++;
  }
  _$jscoverage['/lang/object.js'].lineData[178]++;
  if (visit238_178_1(typeof ov !== 'boolean')) {
    _$jscoverage['/lang/object.js'].lineData[179]++;
    ov = undefined;
    _$jscoverage['/lang/object.js'].lineData[180]++;
    len++;
  }
  _$jscoverage['/lang/object.js'].lineData[183]++;
  for (; visit239_183_1(i < len); i++) {
    _$jscoverage['/lang/object.js'].lineData[184]++;
    arg = args[i];
    _$jscoverage['/lang/object.js'].lineData[185]++;
    if (visit240_185_1(proto = arg.prototype)) {
      _$jscoverage['/lang/object.js'].lineData[186]++;
      arg = S.mix({}, proto, true, removeConstructor);
    }
    _$jscoverage['/lang/object.js'].lineData[188]++;
    S.mix(r.prototype, arg, ov, wl);
  }
  _$jscoverage['/lang/object.js'].lineData[191]++;
  return r;
}, 
  extend: function(r, s, px, sx) {
  _$jscoverage['/lang/object.js'].functionData[7]++;
  _$jscoverage['/lang/object.js'].lineData[206]++;
  if (visit241_206_1(!s || !r)) {
    _$jscoverage['/lang/object.js'].lineData[207]++;
    return r;
  }
  _$jscoverage['/lang/object.js'].lineData[210]++;
  var sp = s.prototype, rp;
  _$jscoverage['/lang/object.js'].lineData[215]++;
  sp.constructor = s;
  _$jscoverage['/lang/object.js'].lineData[218]++;
  rp = createObject(sp, r);
  _$jscoverage['/lang/object.js'].lineData[219]++;
  r.prototype = S.mix(rp, r.prototype);
  _$jscoverage['/lang/object.js'].lineData[220]++;
  r.superclass = sp;
  _$jscoverage['/lang/object.js'].lineData[223]++;
  if (visit242_223_1(px)) {
    _$jscoverage['/lang/object.js'].lineData[224]++;
    S.mix(rp, px);
  }
  _$jscoverage['/lang/object.js'].lineData[228]++;
  if (visit243_228_1(sx)) {
    _$jscoverage['/lang/object.js'].lineData[229]++;
    S.mix(r, sx);
  }
  _$jscoverage['/lang/object.js'].lineData[232]++;
  return r;
}, 
  namespace: function() {
  _$jscoverage['/lang/object.js'].functionData[8]++;
  _$jscoverage['/lang/object.js'].lineData[250]++;
  var args = S.makeArray(arguments), l = args.length, o = null, i, j, p, global = (visit244_253_1(visit245_253_2(args[l - 1] === TRUE) && l--));
  _$jscoverage['/lang/object.js'].lineData[255]++;
  for (i = 0; visit246_255_1(i < l); i++) {
    _$jscoverage['/lang/object.js'].lineData[256]++;
    p = (EMPTY + args[i]).split('.');
    _$jscoverage['/lang/object.js'].lineData[257]++;
    o = global ? host : this;
    _$jscoverage['/lang/object.js'].lineData[258]++;
    for (j = (visit247_258_1(host[p[0]] === o)) ? 1 : 0; visit248_258_2(j < p.length); ++j) {
      _$jscoverage['/lang/object.js'].lineData[259]++;
      o = o[p[j]] = visit249_259_1(o[p[j]] || {});
    }
  }
  _$jscoverage['/lang/object.js'].lineData[262]++;
  return o;
}});
  _$jscoverage['/lang/object.js'].lineData[267]++;
  function Empty() {
    _$jscoverage['/lang/object.js'].functionData[9]++;
  }
  _$jscoverage['/lang/object.js'].lineData[270]++;
  function createObject(proto, constructor) {
    _$jscoverage['/lang/object.js'].functionData[10]++;
    _$jscoverage['/lang/object.js'].lineData[271]++;
    var newProto;
    _$jscoverage['/lang/object.js'].lineData[272]++;
    if (visit250_272_1(ObjectCreate)) {
      _$jscoverage['/lang/object.js'].lineData[273]++;
      newProto = ObjectCreate(proto);
    } else {
      _$jscoverage['/lang/object.js'].lineData[275]++;
      Empty.prototype = proto;
      _$jscoverage['/lang/object.js'].lineData[276]++;
      newProto = new Empty();
    }
    _$jscoverage['/lang/object.js'].lineData[278]++;
    newProto.constructor = constructor;
    _$jscoverage['/lang/object.js'].lineData[279]++;
    return newProto;
  }
  _$jscoverage['/lang/object.js'].lineData[282]++;
  function mix(r, s) {
    _$jscoverage['/lang/object.js'].functionData[11]++;
    _$jscoverage['/lang/object.js'].lineData[283]++;
    for (var i in s) {
      _$jscoverage['/lang/object.js'].lineData[284]++;
      r[i] = s[i];
    }
  }
  _$jscoverage['/lang/object.js'].lineData[288]++;
  function mixInternal(r, s, ov, wl, deep, cache) {
    _$jscoverage['/lang/object.js'].functionData[12]++;
    _$jscoverage['/lang/object.js'].lineData[289]++;
    if (visit251_289_1(!s || !r)) {
      _$jscoverage['/lang/object.js'].lineData[290]++;
      return r;
    }
    _$jscoverage['/lang/object.js'].lineData[292]++;
    var i, p, keys, len;
    _$jscoverage['/lang/object.js'].lineData[295]++;
    s[MIX_CIRCULAR_DETECTION] = r;
    _$jscoverage['/lang/object.js'].lineData[298]++;
    cache.push(s);
    _$jscoverage['/lang/object.js'].lineData[301]++;
    keys = S.keys(s);
    _$jscoverage['/lang/object.js'].lineData[302]++;
    len = keys.length;
    _$jscoverage['/lang/object.js'].lineData[303]++;
    for (i = 0; visit252_303_1(i < len); i++) {
      _$jscoverage['/lang/object.js'].lineData[304]++;
      p = keys[i];
      _$jscoverage['/lang/object.js'].lineData[305]++;
      if (visit253_305_1(p != MIX_CIRCULAR_DETECTION)) {
        _$jscoverage['/lang/object.js'].lineData[307]++;
        _mix(p, r, s, ov, wl, deep, cache);
      }
    }
    _$jscoverage['/lang/object.js'].lineData[311]++;
    return r;
  }
  _$jscoverage['/lang/object.js'].lineData[314]++;
  function removeConstructor(k, v) {
    _$jscoverage['/lang/object.js'].functionData[13]++;
    _$jscoverage['/lang/object.js'].lineData[315]++;
    return visit254_315_1(k == 'constructor') ? undefined : v;
  }
  _$jscoverage['/lang/object.js'].lineData[318]++;
  function _mix(p, r, s, ov, wl, deep, cache) {
    _$jscoverage['/lang/object.js'].functionData[14]++;
    _$jscoverage['/lang/object.js'].lineData[322]++;
    if (visit255_322_1(ov || visit256_322_2(!(p in r) || deep))) {
      _$jscoverage['/lang/object.js'].lineData[323]++;
      var target = r[p], src = s[p];
      _$jscoverage['/lang/object.js'].lineData[326]++;
      if (visit257_326_1(target === src)) {
        _$jscoverage['/lang/object.js'].lineData[328]++;
        if (visit258_328_1(target === undefined)) {
          _$jscoverage['/lang/object.js'].lineData[329]++;
          r[p] = target;
        }
        _$jscoverage['/lang/object.js'].lineData[331]++;
        return;
      }
      _$jscoverage['/lang/object.js'].lineData[333]++;
      if (visit259_333_1(wl)) {
        _$jscoverage['/lang/object.js'].lineData[334]++;
        src = wl.call(s, p, src);
      }
      _$jscoverage['/lang/object.js'].lineData[337]++;
      if (visit260_337_1(deep && visit261_337_2(src && (visit262_337_3(S.isArray(src) || S.isPlainObject(src)))))) {
        _$jscoverage['/lang/object.js'].lineData[338]++;
        if (visit263_338_1(src[MIX_CIRCULAR_DETECTION])) {
          _$jscoverage['/lang/object.js'].lineData[339]++;
          r[p] = src[MIX_CIRCULAR_DETECTION];
        } else {
          _$jscoverage['/lang/object.js'].lineData[343]++;
          var clone = visit264_343_1(target && (visit265_343_2(S.isArray(target) || S.isPlainObject(target)))) ? target : (S.isArray(src) ? [] : {});
          _$jscoverage['/lang/object.js'].lineData[346]++;
          r[p] = clone;
          _$jscoverage['/lang/object.js'].lineData[347]++;
          mixInternal(clone, src, ov, wl, TRUE, cache);
        }
      } else {
        _$jscoverage['/lang/object.js'].lineData[349]++;
        if (visit266_349_1(visit267_349_2(src !== undefined) && (visit268_349_3(ov || !(p in r))))) {
          _$jscoverage['/lang/object.js'].lineData[350]++;
          r[p] = src;
        }
      }
    }
  }
})(KISSY);
