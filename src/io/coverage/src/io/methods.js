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
if (! _$jscoverage['/io/methods.js']) {
  _$jscoverage['/io/methods.js'] = {};
  _$jscoverage['/io/methods.js'].lineData = [];
  _$jscoverage['/io/methods.js'].lineData[6] = 0;
  _$jscoverage['/io/methods.js'].lineData[7] = 0;
  _$jscoverage['/io/methods.js'].lineData[9] = 0;
  _$jscoverage['/io/methods.js'].lineData[10] = 0;
  _$jscoverage['/io/methods.js'].lineData[17] = 0;
  _$jscoverage['/io/methods.js'].lineData[19] = 0;
  _$jscoverage['/io/methods.js'].lineData[31] = 0;
  _$jscoverage['/io/methods.js'].lineData[33] = 0;
  _$jscoverage['/io/methods.js'].lineData[36] = 0;
  _$jscoverage['/io/methods.js'].lineData[37] = 0;
  _$jscoverage['/io/methods.js'].lineData[40] = 0;
  _$jscoverage['/io/methods.js'].lineData[42] = 0;
  _$jscoverage['/io/methods.js'].lineData[43] = 0;
  _$jscoverage['/io/methods.js'].lineData[44] = 0;
  _$jscoverage['/io/methods.js'].lineData[45] = 0;
  _$jscoverage['/io/methods.js'].lineData[47] = 0;
  _$jscoverage['/io/methods.js'].lineData[52] = 0;
  _$jscoverage['/io/methods.js'].lineData[55] = 0;
  _$jscoverage['/io/methods.js'].lineData[56] = 0;
  _$jscoverage['/io/methods.js'].lineData[57] = 0;
  _$jscoverage['/io/methods.js'].lineData[58] = 0;
  _$jscoverage['/io/methods.js'].lineData[61] = 0;
  _$jscoverage['/io/methods.js'].lineData[62] = 0;
  _$jscoverage['/io/methods.js'].lineData[63] = 0;
  _$jscoverage['/io/methods.js'].lineData[67] = 0;
  _$jscoverage['/io/methods.js'].lineData[68] = 0;
  _$jscoverage['/io/methods.js'].lineData[70] = 0;
  _$jscoverage['/io/methods.js'].lineData[71] = 0;
  _$jscoverage['/io/methods.js'].lineData[73] = 0;
  _$jscoverage['/io/methods.js'].lineData[74] = 0;
  _$jscoverage['/io/methods.js'].lineData[75] = 0;
  _$jscoverage['/io/methods.js'].lineData[76] = 0;
  _$jscoverage['/io/methods.js'].lineData[78] = 0;
  _$jscoverage['/io/methods.js'].lineData[82] = 0;
  _$jscoverage['/io/methods.js'].lineData[85] = 0;
  _$jscoverage['/io/methods.js'].lineData[86] = 0;
  _$jscoverage['/io/methods.js'].lineData[88] = 0;
  _$jscoverage['/io/methods.js'].lineData[90] = 0;
  _$jscoverage['/io/methods.js'].lineData[91] = 0;
  _$jscoverage['/io/methods.js'].lineData[93] = 0;
  _$jscoverage['/io/methods.js'].lineData[95] = 0;
  _$jscoverage['/io/methods.js'].lineData[98] = 0;
  _$jscoverage['/io/methods.js'].lineData[101] = 0;
  _$jscoverage['/io/methods.js'].lineData[105] = 0;
  _$jscoverage['/io/methods.js'].lineData[106] = 0;
  _$jscoverage['/io/methods.js'].lineData[107] = 0;
  _$jscoverage['/io/methods.js'].lineData[116] = 0;
  _$jscoverage['/io/methods.js'].lineData[117] = 0;
  _$jscoverage['/io/methods.js'].lineData[127] = 0;
  _$jscoverage['/io/methods.js'].lineData[129] = 0;
  _$jscoverage['/io/methods.js'].lineData[130] = 0;
  _$jscoverage['/io/methods.js'].lineData[131] = 0;
  _$jscoverage['/io/methods.js'].lineData[132] = 0;
  _$jscoverage['/io/methods.js'].lineData[133] = 0;
  _$jscoverage['/io/methods.js'].lineData[134] = 0;
  _$jscoverage['/io/methods.js'].lineData[137] = 0;
  _$jscoverage['/io/methods.js'].lineData[139] = 0;
  _$jscoverage['/io/methods.js'].lineData[144] = 0;
  _$jscoverage['/io/methods.js'].lineData[145] = 0;
  _$jscoverage['/io/methods.js'].lineData[146] = 0;
  _$jscoverage['/io/methods.js'].lineData[148] = 0;
  _$jscoverage['/io/methods.js'].lineData[158] = 0;
  _$jscoverage['/io/methods.js'].lineData[159] = 0;
  _$jscoverage['/io/methods.js'].lineData[160] = 0;
  _$jscoverage['/io/methods.js'].lineData[161] = 0;
  _$jscoverage['/io/methods.js'].lineData[163] = 0;
  _$jscoverage['/io/methods.js'].lineData[164] = 0;
  _$jscoverage['/io/methods.js'].lineData[173] = 0;
  _$jscoverage['/io/methods.js'].lineData[174] = 0;
  _$jscoverage['/io/methods.js'].lineData[175] = 0;
  _$jscoverage['/io/methods.js'].lineData[177] = 0;
  _$jscoverage['/io/methods.js'].lineData[181] = 0;
  _$jscoverage['/io/methods.js'].lineData[188] = 0;
  _$jscoverage['/io/methods.js'].lineData[189] = 0;
  _$jscoverage['/io/methods.js'].lineData[191] = 0;
  _$jscoverage['/io/methods.js'].lineData[192] = 0;
  _$jscoverage['/io/methods.js'].lineData[193] = 0;
  _$jscoverage['/io/methods.js'].lineData[194] = 0;
  _$jscoverage['/io/methods.js'].lineData[197] = 0;
  _$jscoverage['/io/methods.js'].lineData[198] = 0;
  _$jscoverage['/io/methods.js'].lineData[199] = 0;
  _$jscoverage['/io/methods.js'].lineData[201] = 0;
  _$jscoverage['/io/methods.js'].lineData[202] = 0;
  _$jscoverage['/io/methods.js'].lineData[203] = 0;
  _$jscoverage['/io/methods.js'].lineData[204] = 0;
  _$jscoverage['/io/methods.js'].lineData[206] = 0;
  _$jscoverage['/io/methods.js'].lineData[207] = 0;
  _$jscoverage['/io/methods.js'].lineData[208] = 0;
  _$jscoverage['/io/methods.js'].lineData[210] = 0;
  _$jscoverage['/io/methods.js'].lineData[214] = 0;
  _$jscoverage['/io/methods.js'].lineData[215] = 0;
  _$jscoverage['/io/methods.js'].lineData[219] = 0;
  _$jscoverage['/io/methods.js'].lineData[220] = 0;
  _$jscoverage['/io/methods.js'].lineData[222] = 0;
  _$jscoverage['/io/methods.js'].lineData[225] = 0;
  _$jscoverage['/io/methods.js'].lineData[226] = 0;
  _$jscoverage['/io/methods.js'].lineData[227] = 0;
  _$jscoverage['/io/methods.js'].lineData[255] = 0;
  _$jscoverage['/io/methods.js'].lineData[264] = 0;
  _$jscoverage['/io/methods.js'].lineData[265] = 0;
  _$jscoverage['/io/methods.js'].lineData[267] = 0;
  _$jscoverage['/io/methods.js'].lineData[268] = 0;
  _$jscoverage['/io/methods.js'].lineData[270] = 0;
  _$jscoverage['/io/methods.js'].lineData[271] = 0;
  _$jscoverage['/io/methods.js'].lineData[272] = 0;
  _$jscoverage['/io/methods.js'].lineData[283] = 0;
  _$jscoverage['/io/methods.js'].lineData[288] = 0;
}
if (! _$jscoverage['/io/methods.js'].functionData) {
  _$jscoverage['/io/methods.js'].functionData = [];
  _$jscoverage['/io/methods.js'].functionData[0] = 0;
  _$jscoverage['/io/methods.js'].functionData[1] = 0;
  _$jscoverage['/io/methods.js'].functionData[2] = 0;
  _$jscoverage['/io/methods.js'].functionData[3] = 0;
  _$jscoverage['/io/methods.js'].functionData[4] = 0;
  _$jscoverage['/io/methods.js'].functionData[5] = 0;
  _$jscoverage['/io/methods.js'].functionData[6] = 0;
  _$jscoverage['/io/methods.js'].functionData[7] = 0;
  _$jscoverage['/io/methods.js'].functionData[8] = 0;
  _$jscoverage['/io/methods.js'].functionData[9] = 0;
  _$jscoverage['/io/methods.js'].functionData[10] = 0;
  _$jscoverage['/io/methods.js'].functionData[11] = 0;
}
if (! _$jscoverage['/io/methods.js'].branchData) {
  _$jscoverage['/io/methods.js'].branchData = {};
  _$jscoverage['/io/methods.js'].branchData['31'] = [];
  _$jscoverage['/io/methods.js'].branchData['31'][1] = new BranchData();
  _$jscoverage['/io/methods.js'].branchData['33'] = [];
  _$jscoverage['/io/methods.js'].branchData['33'][1] = new BranchData();
  _$jscoverage['/io/methods.js'].branchData['36'] = [];
  _$jscoverage['/io/methods.js'].branchData['36'][1] = new BranchData();
  _$jscoverage['/io/methods.js'].branchData['40'] = [];
  _$jscoverage['/io/methods.js'].branchData['40'][1] = new BranchData();
  _$jscoverage['/io/methods.js'].branchData['43'] = [];
  _$jscoverage['/io/methods.js'].branchData['43'][1] = new BranchData();
  _$jscoverage['/io/methods.js'].branchData['44'] = [];
  _$jscoverage['/io/methods.js'].branchData['44'][1] = new BranchData();
  _$jscoverage['/io/methods.js'].branchData['52'] = [];
  _$jscoverage['/io/methods.js'].branchData['52'][1] = new BranchData();
  _$jscoverage['/io/methods.js'].branchData['55'] = [];
  _$jscoverage['/io/methods.js'].branchData['55'][1] = new BranchData();
  _$jscoverage['/io/methods.js'].branchData['56'] = [];
  _$jscoverage['/io/methods.js'].branchData['56'][1] = new BranchData();
  _$jscoverage['/io/methods.js'].branchData['56'][2] = new BranchData();
  _$jscoverage['/io/methods.js'].branchData['56'][3] = new BranchData();
  _$jscoverage['/io/methods.js'].branchData['61'] = [];
  _$jscoverage['/io/methods.js'].branchData['61'][1] = new BranchData();
  _$jscoverage['/io/methods.js'].branchData['61'][2] = new BranchData();
  _$jscoverage['/io/methods.js'].branchData['61'][3] = new BranchData();
  _$jscoverage['/io/methods.js'].branchData['67'] = [];
  _$jscoverage['/io/methods.js'].branchData['67'][1] = new BranchData();
  _$jscoverage['/io/methods.js'].branchData['72'] = [];
  _$jscoverage['/io/methods.js'].branchData['72'][1] = new BranchData();
  _$jscoverage['/io/methods.js'].branchData['73'] = [];
  _$jscoverage['/io/methods.js'].branchData['73'][1] = new BranchData();
  _$jscoverage['/io/methods.js'].branchData['75'] = [];
  _$jscoverage['/io/methods.js'].branchData['75'][1] = new BranchData();
  _$jscoverage['/io/methods.js'].branchData['85'] = [];
  _$jscoverage['/io/methods.js'].branchData['85'][1] = new BranchData();
  _$jscoverage['/io/methods.js'].branchData['88'] = [];
  _$jscoverage['/io/methods.js'].branchData['88'][1] = new BranchData();
  _$jscoverage['/io/methods.js'].branchData['90'] = [];
  _$jscoverage['/io/methods.js'].branchData['90'][1] = new BranchData();
  _$jscoverage['/io/methods.js'].branchData['117'] = [];
  _$jscoverage['/io/methods.js'].branchData['117'][1] = new BranchData();
  _$jscoverage['/io/methods.js'].branchData['130'] = [];
  _$jscoverage['/io/methods.js'].branchData['130'][1] = new BranchData();
  _$jscoverage['/io/methods.js'].branchData['131'] = [];
  _$jscoverage['/io/methods.js'].branchData['131'][1] = new BranchData();
  _$jscoverage['/io/methods.js'].branchData['139'] = [];
  _$jscoverage['/io/methods.js'].branchData['139'][1] = new BranchData();
  _$jscoverage['/io/methods.js'].branchData['145'] = [];
  _$jscoverage['/io/methods.js'].branchData['145'][1] = new BranchData();
  _$jscoverage['/io/methods.js'].branchData['159'] = [];
  _$jscoverage['/io/methods.js'].branchData['159'][1] = new BranchData();
  _$jscoverage['/io/methods.js'].branchData['160'] = [];
  _$jscoverage['/io/methods.js'].branchData['160'][1] = new BranchData();
  _$jscoverage['/io/methods.js'].branchData['174'] = [];
  _$jscoverage['/io/methods.js'].branchData['174'][1] = new BranchData();
  _$jscoverage['/io/methods.js'].branchData['188'] = [];
  _$jscoverage['/io/methods.js'].branchData['188'][1] = new BranchData();
  _$jscoverage['/io/methods.js'].branchData['194'] = [];
  _$jscoverage['/io/methods.js'].branchData['194'][1] = new BranchData();
  _$jscoverage['/io/methods.js'].branchData['194'][2] = new BranchData();
  _$jscoverage['/io/methods.js'].branchData['194'][3] = new BranchData();
  _$jscoverage['/io/methods.js'].branchData['194'][4] = new BranchData();
  _$jscoverage['/io/methods.js'].branchData['194'][5] = new BranchData();
  _$jscoverage['/io/methods.js'].branchData['197'] = [];
  _$jscoverage['/io/methods.js'].branchData['197'][1] = new BranchData();
  _$jscoverage['/io/methods.js'].branchData['206'] = [];
  _$jscoverage['/io/methods.js'].branchData['206'][1] = new BranchData();
  _$jscoverage['/io/methods.js'].branchData['214'] = [];
  _$jscoverage['/io/methods.js'].branchData['214'][1] = new BranchData();
  _$jscoverage['/io/methods.js'].branchData['225'] = [];
  _$jscoverage['/io/methods.js'].branchData['225'][1] = new BranchData();
  _$jscoverage['/io/methods.js'].branchData['264'] = [];
  _$jscoverage['/io/methods.js'].branchData['264'][1] = new BranchData();
  _$jscoverage['/io/methods.js'].branchData['267'] = [];
  _$jscoverage['/io/methods.js'].branchData['267'][1] = new BranchData();
  _$jscoverage['/io/methods.js'].branchData['285'] = [];
  _$jscoverage['/io/methods.js'].branchData['285'][1] = new BranchData();
}
_$jscoverage['/io/methods.js'].branchData['285'][1].init(89, 38, 'S.Uri.getComponents(c.url).query || ""');
function visit112_285_1(result) {
  _$jscoverage['/io/methods.js'].branchData['285'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/methods.js'].branchData['267'][1].init(3221, 19, 'h = config.complete');
function visit111_267_1(result) {
  _$jscoverage['/io/methods.js'].branchData['267'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/methods.js'].branchData['264'][1].init(3119, 19, 'h = config[handler]');
function visit110_264_1(result) {
  _$jscoverage['/io/methods.js'].branchData['264'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/methods.js'].branchData['225'][1].init(1671, 32, 'timeoutTimer = self.timeoutTimer');
function visit109_225_1(result) {
  _$jscoverage['/io/methods.js'].branchData['225'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/methods.js'].branchData['214'][1].init(25, 10, 'status < 0');
function visit108_214_1(result) {
  _$jscoverage['/io/methods.js'].branchData['214'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/methods.js'].branchData['206'][1].init(35, 12, 'e.stack || e');
function visit107_206_1(result) {
  _$jscoverage['/io/methods.js'].branchData['206'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/methods.js'].branchData['197'][1].init(162, 22, 'status == NOT_MODIFIED');
function visit106_197_1(result) {
  _$jscoverage['/io/methods.js'].branchData['197'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/methods.js'].branchData['194'][5].init(461, 22, 'status == NOT_MODIFIED');
function visit105_194_5(result) {
  _$jscoverage['/io/methods.js'].branchData['194'][5].ranCondition(result);
  return result;
}_$jscoverage['/io/methods.js'].branchData['194'][4].init(432, 25, 'status < MULTIPLE_CHOICES');
function visit104_194_4(result) {
  _$jscoverage['/io/methods.js'].branchData['194'][4].ranCondition(result);
  return result;
}_$jscoverage['/io/methods.js'].branchData['194'][3].init(411, 17, 'status >= OK_CODE');
function visit103_194_3(result) {
  _$jscoverage['/io/methods.js'].branchData['194'][3].ranCondition(result);
  return result;
}_$jscoverage['/io/methods.js'].branchData['194'][2].init(411, 46, 'status >= OK_CODE && status < MULTIPLE_CHOICES');
function visit102_194_2(result) {
  _$jscoverage['/io/methods.js'].branchData['194'][2].ranCondition(result);
  return result;
}_$jscoverage['/io/methods.js'].branchData['194'][1].init(411, 72, 'status >= OK_CODE && status < MULTIPLE_CHOICES || status == NOT_MODIFIED');
function visit101_194_1(result) {
  _$jscoverage['/io/methods.js'].branchData['194'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/methods.js'].branchData['188'][1].init(226, 15, 'self.state == 2');
function visit100_188_1(result) {
  _$jscoverage['/io/methods.js'].branchData['188'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/methods.js'].branchData['174'][1].init(52, 26, 'transport = this.transport');
function visit99_174_1(result) {
  _$jscoverage['/io/methods.js'].branchData['174'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/methods.js'].branchData['160'][1].init(106, 14, 'self.transport');
function visit98_160_1(result) {
  _$jscoverage['/io/methods.js'].branchData['160'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/methods.js'].branchData['159'][1].init(63, 21, 'statusText || \'abort\'');
function visit97_159_1(result) {
  _$jscoverage['/io/methods.js'].branchData['159'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/methods.js'].branchData['145'][1].init(54, 11, '!self.state');
function visit96_145_1(result) {
  _$jscoverage['/io/methods.js'].branchData['145'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/methods.js'].branchData['139'][1].init(651, 19, 'match === undefined');
function visit95_139_1(result) {
  _$jscoverage['/io/methods.js'].branchData['139'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/methods.js'].branchData['131'][1].init(25, 41, '!(responseHeaders = self.responseHeaders)');
function visit94_131_1(result) {
  _$jscoverage['/io/methods.js'].branchData['131'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/methods.js'].branchData['130'][1].init(179, 16, 'self.state === 2');
function visit93_130_1(result) {
  _$jscoverage['/io/methods.js'].branchData['130'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/methods.js'].branchData['117'][1].init(57, 16, 'self.state === 2');
function visit92_117_1(result) {
  _$jscoverage['/io/methods.js'].branchData['117'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/methods.js'].branchData['90'][1].init(127, 10, '!converter');
function visit91_90_1(result) {
  _$jscoverage['/io/methods.js'].branchData['90'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/methods.js'].branchData['88'][1].init(62, 46, 'converts[prevType] && converts[prevType][type]');
function visit90_88_1(result) {
  _$jscoverage['/io/methods.js'].branchData['88'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/methods.js'].branchData['85'][1].init(2375, 19, 'i < dataType.length');
function visit89_85_1(result) {
  _$jscoverage['/io/methods.js'].branchData['85'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/methods.js'].branchData['75'][1].init(92, 18, 'prevType == \'text\'');
function visit88_75_1(result) {
  _$jscoverage['/io/methods.js'].branchData['75'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/methods.js'].branchData['73'][1].init(153, 30, 'converter && rawData[prevType]');
function visit87_73_1(result) {
  _$jscoverage['/io/methods.js'].branchData['73'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/methods.js'].branchData['72'][1].init(59, 46, 'converts[prevType] && converts[prevType][type]');
function visit86_72_1(result) {
  _$jscoverage['/io/methods.js'].branchData['72'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/methods.js'].branchData['67'][1].init(1209, 13, '!responseData');
function visit85_67_1(result) {
  _$jscoverage['/io/methods.js'].branchData['67'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/methods.js'].branchData['61'][3].init(273, 17, 'xml !== undefined');
function visit84_61_3(result) {
  _$jscoverage['/io/methods.js'].branchData['61'][3].ranCondition(result);
  return result;
}_$jscoverage['/io/methods.js'].branchData['61'][2].init(237, 32, 'dataType[dataTypeIndex] == \'xml\'');
function visit83_61_2(result) {
  _$jscoverage['/io/methods.js'].branchData['61'][2].ranCondition(result);
  return result;
}_$jscoverage['/io/methods.js'].branchData['61'][1].init(237, 53, 'dataType[dataTypeIndex] == \'xml\' && xml !== undefined');
function visit82_61_1(result) {
  _$jscoverage['/io/methods.js'].branchData['61'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/methods.js'].branchData['56'][3].init(58, 18, 'text !== undefined');
function visit81_56_3(result) {
  _$jscoverage['/io/methods.js'].branchData['56'][3].ranCondition(result);
  return result;
}_$jscoverage['/io/methods.js'].branchData['56'][2].init(21, 33, 'dataType[dataTypeIndex] == \'text\'');
function visit80_56_2(result) {
  _$jscoverage['/io/methods.js'].branchData['56'][2].ranCondition(result);
  return result;
}_$jscoverage['/io/methods.js'].branchData['56'][1].init(21, 55, 'dataType[dataTypeIndex] == \'text\' && text !== undefined');
function visit79_56_1(result) {
  _$jscoverage['/io/methods.js'].branchData['56'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/methods.js'].branchData['55'][1].init(749, 31, 'dataTypeIndex < dataType.length');
function visit78_55_1(result) {
  _$jscoverage['/io/methods.js'].branchData['55'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/methods.js'].branchData['52'][1].init(660, 21, 'dataType[0] || \'text\'');
function visit77_52_1(result) {
  _$jscoverage['/io/methods.js'].branchData['52'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/methods.js'].branchData['44'][1].init(29, 19, 'dataType[0] != type');
function visit76_44_1(result) {
  _$jscoverage['/io/methods.js'].branchData['44'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/methods.js'].branchData['43'][1].init(25, 32, 'contents[type].test(contentType)');
function visit75_43_1(result) {
  _$jscoverage['/io/methods.js'].branchData['43'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/methods.js'].branchData['40'][1].init(213, 16, '!dataType.length');
function visit74_40_1(result) {
  _$jscoverage['/io/methods.js'].branchData['40'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/methods.js'].branchData['36'][1].init(126, 18, 'dataType[0] == \'*\'');
function visit73_36_1(result) {
  _$jscoverage['/io/methods.js'].branchData['36'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/methods.js'].branchData['33'][1].init(28, 51, 'io.mimeType || io.getResponseHeader(\'Content-Type\')');
function visit72_33_1(result) {
  _$jscoverage['/io/methods.js'].branchData['33'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/methods.js'].branchData['31'][1].init(413, 11, 'text || xml');
function visit71_31_1(result) {
  _$jscoverage['/io/methods.js'].branchData['31'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/methods.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/io/methods.js'].functionData[0]++;
  _$jscoverage['/io/methods.js'].lineData[7]++;
  var Promise = require('promise'), IO = require('./base');
  _$jscoverage['/io/methods.js'].lineData[9]++;
  var logger = S.getLogger('s/logger');
  _$jscoverage['/io/methods.js'].lineData[10]++;
  var OK_CODE = 200, MULTIPLE_CHOICES = 300, NOT_MODIFIED = 304, rheaders = /^(.*?):[ \t]*([^\r\n]*)\r?$/mg;
  _$jscoverage['/io/methods.js'].lineData[17]++;
  function handleResponseData(io) {
    _$jscoverage['/io/methods.js'].functionData[1]++;
    _$jscoverage['/io/methods.js'].lineData[19]++;
    var text = io.responseText, xml = io.responseXML, c = io.config, converts = c.converters, type, contentType, responseData, contents = c.contents, dataType = c.dataType;
    _$jscoverage['/io/methods.js'].lineData[31]++;
    if (visit71_31_1(text || xml)) {
      _$jscoverage['/io/methods.js'].lineData[33]++;
      contentType = visit72_33_1(io.mimeType || io.getResponseHeader('Content-Type'));
      _$jscoverage['/io/methods.js'].lineData[36]++;
      while (visit73_36_1(dataType[0] == '*')) {
        _$jscoverage['/io/methods.js'].lineData[37]++;
        dataType.shift();
      }
      _$jscoverage['/io/methods.js'].lineData[40]++;
      if (visit74_40_1(!dataType.length)) {
        _$jscoverage['/io/methods.js'].lineData[42]++;
        for (type in contents) {
          _$jscoverage['/io/methods.js'].lineData[43]++;
          if (visit75_43_1(contents[type].test(contentType))) {
            _$jscoverage['/io/methods.js'].lineData[44]++;
            if (visit76_44_1(dataType[0] != type)) {
              _$jscoverage['/io/methods.js'].lineData[45]++;
              dataType.unshift(type);
            }
            _$jscoverage['/io/methods.js'].lineData[47]++;
            break;
          }
        }
      }
      _$jscoverage['/io/methods.js'].lineData[52]++;
      dataType[0] = visit77_52_1(dataType[0] || 'text');
      _$jscoverage['/io/methods.js'].lineData[55]++;
      for (var dataTypeIndex = 0; visit78_55_1(dataTypeIndex < dataType.length); dataTypeIndex++) {
        _$jscoverage['/io/methods.js'].lineData[56]++;
        if (visit79_56_1(visit80_56_2(dataType[dataTypeIndex] == 'text') && visit81_56_3(text !== undefined))) {
          _$jscoverage['/io/methods.js'].lineData[57]++;
          responseData = text;
          _$jscoverage['/io/methods.js'].lineData[58]++;
          break;
        } else {
          _$jscoverage['/io/methods.js'].lineData[61]++;
          if (visit82_61_1(visit83_61_2(dataType[dataTypeIndex] == 'xml') && visit84_61_3(xml !== undefined))) {
            _$jscoverage['/io/methods.js'].lineData[62]++;
            responseData = xml;
            _$jscoverage['/io/methods.js'].lineData[63]++;
            break;
          }
        }
      }
      _$jscoverage['/io/methods.js'].lineData[67]++;
      if (visit85_67_1(!responseData)) {
        _$jscoverage['/io/methods.js'].lineData[68]++;
        var rawData = {
  text: text, 
  xml: xml};
        _$jscoverage['/io/methods.js'].lineData[70]++;
        S.each(['text', 'xml'], function(prevType) {
  _$jscoverage['/io/methods.js'].functionData[2]++;
  _$jscoverage['/io/methods.js'].lineData[71]++;
  var type = dataType[0], converter = visit86_72_1(converts[prevType] && converts[prevType][type]);
  _$jscoverage['/io/methods.js'].lineData[73]++;
  if (visit87_73_1(converter && rawData[prevType])) {
    _$jscoverage['/io/methods.js'].lineData[74]++;
    dataType.unshift(prevType);
    _$jscoverage['/io/methods.js'].lineData[75]++;
    responseData = visit88_75_1(prevType == 'text') ? text : xml;
    _$jscoverage['/io/methods.js'].lineData[76]++;
    return false;
  }
  _$jscoverage['/io/methods.js'].lineData[78]++;
  return undefined;
});
      }
    }
    _$jscoverage['/io/methods.js'].lineData[82]++;
    var prevType = dataType[0];
    _$jscoverage['/io/methods.js'].lineData[85]++;
    for (var i = 1; visit89_85_1(i < dataType.length); i++) {
      _$jscoverage['/io/methods.js'].lineData[86]++;
      type = dataType[i];
      _$jscoverage['/io/methods.js'].lineData[88]++;
      var converter = visit90_88_1(converts[prevType] && converts[prevType][type]);
      _$jscoverage['/io/methods.js'].lineData[90]++;
      if (visit91_90_1(!converter)) {
        _$jscoverage['/io/methods.js'].lineData[91]++;
        throw 'no covert for ' + prevType + ' => ' + type;
      }
      _$jscoverage['/io/methods.js'].lineData[93]++;
      responseData = converter(responseData);
      _$jscoverage['/io/methods.js'].lineData[95]++;
      prevType = type;
    }
    _$jscoverage['/io/methods.js'].lineData[98]++;
    io.responseData = responseData;
  }
  _$jscoverage['/io/methods.js'].lineData[101]++;
  S.extend(IO, Promise, {
  setRequestHeader: function(name, value) {
  _$jscoverage['/io/methods.js'].functionData[3]++;
  _$jscoverage['/io/methods.js'].lineData[105]++;
  var self = this;
  _$jscoverage['/io/methods.js'].lineData[106]++;
  self.requestHeaders[name] = value;
  _$jscoverage['/io/methods.js'].lineData[107]++;
  return self;
}, 
  getAllResponseHeaders: function() {
  _$jscoverage['/io/methods.js'].functionData[4]++;
  _$jscoverage['/io/methods.js'].lineData[116]++;
  var self = this;
  _$jscoverage['/io/methods.js'].lineData[117]++;
  return visit92_117_1(self.state === 2) ? self.responseHeadersString : null;
}, 
  getResponseHeader: function(name) {
  _$jscoverage['/io/methods.js'].functionData[5]++;
  _$jscoverage['/io/methods.js'].lineData[127]++;
  var match, self = this, responseHeaders;
  _$jscoverage['/io/methods.js'].lineData[129]++;
  name = name.toLowerCase();
  _$jscoverage['/io/methods.js'].lineData[130]++;
  if (visit93_130_1(self.state === 2)) {
    _$jscoverage['/io/methods.js'].lineData[131]++;
    if (visit94_131_1(!(responseHeaders = self.responseHeaders))) {
      _$jscoverage['/io/methods.js'].lineData[132]++;
      responseHeaders = self.responseHeaders = {};
      _$jscoverage['/io/methods.js'].lineData[133]++;
      while ((match = rheaders.exec(self.responseHeadersString))) {
        _$jscoverage['/io/methods.js'].lineData[134]++;
        responseHeaders[match[1].toLowerCase()] = match[2];
      }
    }
    _$jscoverage['/io/methods.js'].lineData[137]++;
    match = responseHeaders[name];
  }
  _$jscoverage['/io/methods.js'].lineData[139]++;
  return visit95_139_1(match === undefined) ? null : match;
}, 
  overrideMimeType: function(type) {
  _$jscoverage['/io/methods.js'].functionData[6]++;
  _$jscoverage['/io/methods.js'].lineData[144]++;
  var self = this;
  _$jscoverage['/io/methods.js'].lineData[145]++;
  if (visit96_145_1(!self.state)) {
    _$jscoverage['/io/methods.js'].lineData[146]++;
    self.mimeType = type;
  }
  _$jscoverage['/io/methods.js'].lineData[148]++;
  return self;
}, 
  abort: function(statusText) {
  _$jscoverage['/io/methods.js'].functionData[7]++;
  _$jscoverage['/io/methods.js'].lineData[158]++;
  var self = this;
  _$jscoverage['/io/methods.js'].lineData[159]++;
  statusText = visit97_159_1(statusText || 'abort');
  _$jscoverage['/io/methods.js'].lineData[160]++;
  if (visit98_160_1(self.transport)) {
    _$jscoverage['/io/methods.js'].lineData[161]++;
    self.transport.abort(statusText);
  }
  _$jscoverage['/io/methods.js'].lineData[163]++;
  self._ioReady(0, statusText);
  _$jscoverage['/io/methods.js'].lineData[164]++;
  return self;
}, 
  getNativeXhr: function() {
  _$jscoverage['/io/methods.js'].functionData[8]++;
  _$jscoverage['/io/methods.js'].lineData[173]++;
  var transport;
  _$jscoverage['/io/methods.js'].lineData[174]++;
  if (visit99_174_1(transport = this.transport)) {
    _$jscoverage['/io/methods.js'].lineData[175]++;
    return transport.nativeXhr;
  }
  _$jscoverage['/io/methods.js'].lineData[177]++;
  return null;
}, 
  _ioReady: function(status, statusText) {
  _$jscoverage['/io/methods.js'].functionData[9]++;
  _$jscoverage['/io/methods.js'].lineData[181]++;
  var self = this;
  _$jscoverage['/io/methods.js'].lineData[188]++;
  if (visit100_188_1(self.state == 2)) {
    _$jscoverage['/io/methods.js'].lineData[189]++;
    return;
  }
  _$jscoverage['/io/methods.js'].lineData[191]++;
  self.state = 2;
  _$jscoverage['/io/methods.js'].lineData[192]++;
  self.readyState = 4;
  _$jscoverage['/io/methods.js'].lineData[193]++;
  var isSuccess;
  _$jscoverage['/io/methods.js'].lineData[194]++;
  if (visit101_194_1(visit102_194_2(visit103_194_3(status >= OK_CODE) && visit104_194_4(status < MULTIPLE_CHOICES)) || visit105_194_5(status == NOT_MODIFIED))) {
    _$jscoverage['/io/methods.js'].lineData[197]++;
    if (visit106_197_1(status == NOT_MODIFIED)) {
      _$jscoverage['/io/methods.js'].lineData[198]++;
      statusText = 'not modified';
      _$jscoverage['/io/methods.js'].lineData[199]++;
      isSuccess = true;
    } else {
      _$jscoverage['/io/methods.js'].lineData[201]++;
      try {
        _$jscoverage['/io/methods.js'].lineData[202]++;
        handleResponseData(self);
        _$jscoverage['/io/methods.js'].lineData[203]++;
        statusText = 'success';
        _$jscoverage['/io/methods.js'].lineData[204]++;
        isSuccess = true;
      }      catch (e) {
  _$jscoverage['/io/methods.js'].lineData[206]++;
  S.log(visit107_206_1(e.stack || e), 'error');
  _$jscoverage['/io/methods.js'].lineData[207]++;
  setTimeout(function() {
  _$jscoverage['/io/methods.js'].functionData[10]++;
  _$jscoverage['/io/methods.js'].lineData[208]++;
  throw e;
}, 0);
  _$jscoverage['/io/methods.js'].lineData[210]++;
  statusText = 'parser error';
}
    }
  } else {
    _$jscoverage['/io/methods.js'].lineData[214]++;
    if (visit108_214_1(status < 0)) {
      _$jscoverage['/io/methods.js'].lineData[215]++;
      status = 0;
    }
  }
  _$jscoverage['/io/methods.js'].lineData[219]++;
  self.status = status;
  _$jscoverage['/io/methods.js'].lineData[220]++;
  self.statusText = statusText;
  _$jscoverage['/io/methods.js'].lineData[222]++;
  var defer = self.defer, config = self.config, timeoutTimer;
  _$jscoverage['/io/methods.js'].lineData[225]++;
  if (visit109_225_1(timeoutTimer = self.timeoutTimer)) {
    _$jscoverage['/io/methods.js'].lineData[226]++;
    clearTimeout(timeoutTimer);
    _$jscoverage['/io/methods.js'].lineData[227]++;
    self.timeoutTimer = 0;
  }
  _$jscoverage['/io/methods.js'].lineData[255]++;
  var handler = isSuccess ? 'success' : 'error', h, v = [self.responseData, statusText, self], context = config.context, eventObject = {
  ajaxConfig: config, 
  io: self};
  _$jscoverage['/io/methods.js'].lineData[264]++;
  if (visit110_264_1(h = config[handler])) {
    _$jscoverage['/io/methods.js'].lineData[265]++;
    h.apply(context, v);
  }
  _$jscoverage['/io/methods.js'].lineData[267]++;
  if (visit111_267_1(h = config.complete)) {
    _$jscoverage['/io/methods.js'].lineData[268]++;
    h.apply(context, v);
  }
  _$jscoverage['/io/methods.js'].lineData[270]++;
  IO.fire(handler, eventObject);
  _$jscoverage['/io/methods.js'].lineData[271]++;
  IO.fire('complete', eventObject);
  _$jscoverage['/io/methods.js'].lineData[272]++;
  defer[isSuccess ? 'resolve' : 'reject'](v);
}, 
  _getUrlForSend: function() {
  _$jscoverage['/io/methods.js'].functionData[11]++;
  _$jscoverage['/io/methods.js'].lineData[283]++;
  var c = this.config, uri = c.uri, originalQuery = visit112_285_1(S.Uri.getComponents(c.url).query || ""), url = uri.toString.call(uri, c.serializeArray);
  _$jscoverage['/io/methods.js'].lineData[288]++;
  return url + (originalQuery ? ((uri.query.has() ? '&' : '?') + originalQuery) : originalQuery);
}});
});
