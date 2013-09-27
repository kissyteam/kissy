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
  _$jscoverage['/io/methods.js'].lineData[15] = 0;
  _$jscoverage['/io/methods.js'].lineData[18] = 0;
  _$jscoverage['/io/methods.js'].lineData[30] = 0;
  _$jscoverage['/io/methods.js'].lineData[32] = 0;
  _$jscoverage['/io/methods.js'].lineData[35] = 0;
  _$jscoverage['/io/methods.js'].lineData[36] = 0;
  _$jscoverage['/io/methods.js'].lineData[39] = 0;
  _$jscoverage['/io/methods.js'].lineData[41] = 0;
  _$jscoverage['/io/methods.js'].lineData[42] = 0;
  _$jscoverage['/io/methods.js'].lineData[43] = 0;
  _$jscoverage['/io/methods.js'].lineData[44] = 0;
  _$jscoverage['/io/methods.js'].lineData[46] = 0;
  _$jscoverage['/io/methods.js'].lineData[51] = 0;
  _$jscoverage['/io/methods.js'].lineData[54] = 0;
  _$jscoverage['/io/methods.js'].lineData[55] = 0;
  _$jscoverage['/io/methods.js'].lineData[56] = 0;
  _$jscoverage['/io/methods.js'].lineData[57] = 0;
  _$jscoverage['/io/methods.js'].lineData[60] = 0;
  _$jscoverage['/io/methods.js'].lineData[61] = 0;
  _$jscoverage['/io/methods.js'].lineData[62] = 0;
  _$jscoverage['/io/methods.js'].lineData[66] = 0;
  _$jscoverage['/io/methods.js'].lineData[67] = 0;
  _$jscoverage['/io/methods.js'].lineData[69] = 0;
  _$jscoverage['/io/methods.js'].lineData[70] = 0;
  _$jscoverage['/io/methods.js'].lineData[72] = 0;
  _$jscoverage['/io/methods.js'].lineData[73] = 0;
  _$jscoverage['/io/methods.js'].lineData[74] = 0;
  _$jscoverage['/io/methods.js'].lineData[75] = 0;
  _$jscoverage['/io/methods.js'].lineData[77] = 0;
  _$jscoverage['/io/methods.js'].lineData[81] = 0;
  _$jscoverage['/io/methods.js'].lineData[84] = 0;
  _$jscoverage['/io/methods.js'].lineData[85] = 0;
  _$jscoverage['/io/methods.js'].lineData[87] = 0;
  _$jscoverage['/io/methods.js'].lineData[89] = 0;
  _$jscoverage['/io/methods.js'].lineData[90] = 0;
  _$jscoverage['/io/methods.js'].lineData[92] = 0;
  _$jscoverage['/io/methods.js'].lineData[94] = 0;
  _$jscoverage['/io/methods.js'].lineData[97] = 0;
  _$jscoverage['/io/methods.js'].lineData[100] = 0;
  _$jscoverage['/io/methods.js'].lineData[104] = 0;
  _$jscoverage['/io/methods.js'].lineData[105] = 0;
  _$jscoverage['/io/methods.js'].lineData[106] = 0;
  _$jscoverage['/io/methods.js'].lineData[115] = 0;
  _$jscoverage['/io/methods.js'].lineData[116] = 0;
  _$jscoverage['/io/methods.js'].lineData[126] = 0;
  _$jscoverage['/io/methods.js'].lineData[127] = 0;
  _$jscoverage['/io/methods.js'].lineData[128] = 0;
  _$jscoverage['/io/methods.js'].lineData[129] = 0;
  _$jscoverage['/io/methods.js'].lineData[130] = 0;
  _$jscoverage['/io/methods.js'].lineData[131] = 0;
  _$jscoverage['/io/methods.js'].lineData[134] = 0;
  _$jscoverage['/io/methods.js'].lineData[136] = 0;
  _$jscoverage['/io/methods.js'].lineData[141] = 0;
  _$jscoverage['/io/methods.js'].lineData[142] = 0;
  _$jscoverage['/io/methods.js'].lineData[143] = 0;
  _$jscoverage['/io/methods.js'].lineData[145] = 0;
  _$jscoverage['/io/methods.js'].lineData[155] = 0;
  _$jscoverage['/io/methods.js'].lineData[156] = 0;
  _$jscoverage['/io/methods.js'].lineData[157] = 0;
  _$jscoverage['/io/methods.js'].lineData[158] = 0;
  _$jscoverage['/io/methods.js'].lineData[160] = 0;
  _$jscoverage['/io/methods.js'].lineData[161] = 0;
  _$jscoverage['/io/methods.js'].lineData[170] = 0;
  _$jscoverage['/io/methods.js'].lineData[171] = 0;
  _$jscoverage['/io/methods.js'].lineData[172] = 0;
  _$jscoverage['/io/methods.js'].lineData[174] = 0;
  _$jscoverage['/io/methods.js'].lineData[178] = 0;
  _$jscoverage['/io/methods.js'].lineData[185] = 0;
  _$jscoverage['/io/methods.js'].lineData[186] = 0;
  _$jscoverage['/io/methods.js'].lineData[188] = 0;
  _$jscoverage['/io/methods.js'].lineData[189] = 0;
  _$jscoverage['/io/methods.js'].lineData[190] = 0;
  _$jscoverage['/io/methods.js'].lineData[191] = 0;
  _$jscoverage['/io/methods.js'].lineData[194] = 0;
  _$jscoverage['/io/methods.js'].lineData[195] = 0;
  _$jscoverage['/io/methods.js'].lineData[196] = 0;
  _$jscoverage['/io/methods.js'].lineData[198] = 0;
  _$jscoverage['/io/methods.js'].lineData[199] = 0;
  _$jscoverage['/io/methods.js'].lineData[200] = 0;
  _$jscoverage['/io/methods.js'].lineData[201] = 0;
  _$jscoverage['/io/methods.js'].lineData[203] = 0;
  _$jscoverage['/io/methods.js'].lineData[204] = 0;
  _$jscoverage['/io/methods.js'].lineData[209] = 0;
  _$jscoverage['/io/methods.js'].lineData[210] = 0;
  _$jscoverage['/io/methods.js'].lineData[214] = 0;
  _$jscoverage['/io/methods.js'].lineData[215] = 0;
  _$jscoverage['/io/methods.js'].lineData[217] = 0;
  _$jscoverage['/io/methods.js'].lineData[220] = 0;
  _$jscoverage['/io/methods.js'].lineData[221] = 0;
  _$jscoverage['/io/methods.js'].lineData[222] = 0;
  _$jscoverage['/io/methods.js'].lineData[250] = 0;
  _$jscoverage['/io/methods.js'].lineData[259] = 0;
  _$jscoverage['/io/methods.js'].lineData[260] = 0;
  _$jscoverage['/io/methods.js'].lineData[262] = 0;
  _$jscoverage['/io/methods.js'].lineData[263] = 0;
  _$jscoverage['/io/methods.js'].lineData[265] = 0;
  _$jscoverage['/io/methods.js'].lineData[266] = 0;
  _$jscoverage['/io/methods.js'].lineData[267] = 0;
  _$jscoverage['/io/methods.js'].lineData[278] = 0;
  _$jscoverage['/io/methods.js'].lineData[283] = 0;
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
}
if (! _$jscoverage['/io/methods.js'].branchData) {
  _$jscoverage['/io/methods.js'].branchData = {};
  _$jscoverage['/io/methods.js'].branchData['30'] = [];
  _$jscoverage['/io/methods.js'].branchData['30'][1] = new BranchData();
  _$jscoverage['/io/methods.js'].branchData['32'] = [];
  _$jscoverage['/io/methods.js'].branchData['32'][1] = new BranchData();
  _$jscoverage['/io/methods.js'].branchData['35'] = [];
  _$jscoverage['/io/methods.js'].branchData['35'][1] = new BranchData();
  _$jscoverage['/io/methods.js'].branchData['39'] = [];
  _$jscoverage['/io/methods.js'].branchData['39'][1] = new BranchData();
  _$jscoverage['/io/methods.js'].branchData['42'] = [];
  _$jscoverage['/io/methods.js'].branchData['42'][1] = new BranchData();
  _$jscoverage['/io/methods.js'].branchData['43'] = [];
  _$jscoverage['/io/methods.js'].branchData['43'][1] = new BranchData();
  _$jscoverage['/io/methods.js'].branchData['51'] = [];
  _$jscoverage['/io/methods.js'].branchData['51'][1] = new BranchData();
  _$jscoverage['/io/methods.js'].branchData['54'] = [];
  _$jscoverage['/io/methods.js'].branchData['54'][1] = new BranchData();
  _$jscoverage['/io/methods.js'].branchData['55'] = [];
  _$jscoverage['/io/methods.js'].branchData['55'][1] = new BranchData();
  _$jscoverage['/io/methods.js'].branchData['55'][2] = new BranchData();
  _$jscoverage['/io/methods.js'].branchData['55'][3] = new BranchData();
  _$jscoverage['/io/methods.js'].branchData['60'] = [];
  _$jscoverage['/io/methods.js'].branchData['60'][1] = new BranchData();
  _$jscoverage['/io/methods.js'].branchData['60'][2] = new BranchData();
  _$jscoverage['/io/methods.js'].branchData['60'][3] = new BranchData();
  _$jscoverage['/io/methods.js'].branchData['66'] = [];
  _$jscoverage['/io/methods.js'].branchData['66'][1] = new BranchData();
  _$jscoverage['/io/methods.js'].branchData['71'] = [];
  _$jscoverage['/io/methods.js'].branchData['71'][1] = new BranchData();
  _$jscoverage['/io/methods.js'].branchData['72'] = [];
  _$jscoverage['/io/methods.js'].branchData['72'][1] = new BranchData();
  _$jscoverage['/io/methods.js'].branchData['74'] = [];
  _$jscoverage['/io/methods.js'].branchData['74'][1] = new BranchData();
  _$jscoverage['/io/methods.js'].branchData['84'] = [];
  _$jscoverage['/io/methods.js'].branchData['84'][1] = new BranchData();
  _$jscoverage['/io/methods.js'].branchData['87'] = [];
  _$jscoverage['/io/methods.js'].branchData['87'][1] = new BranchData();
  _$jscoverage['/io/methods.js'].branchData['89'] = [];
  _$jscoverage['/io/methods.js'].branchData['89'][1] = new BranchData();
  _$jscoverage['/io/methods.js'].branchData['116'] = [];
  _$jscoverage['/io/methods.js'].branchData['116'][1] = new BranchData();
  _$jscoverage['/io/methods.js'].branchData['127'] = [];
  _$jscoverage['/io/methods.js'].branchData['127'][1] = new BranchData();
  _$jscoverage['/io/methods.js'].branchData['128'] = [];
  _$jscoverage['/io/methods.js'].branchData['128'][1] = new BranchData();
  _$jscoverage['/io/methods.js'].branchData['136'] = [];
  _$jscoverage['/io/methods.js'].branchData['136'][1] = new BranchData();
  _$jscoverage['/io/methods.js'].branchData['142'] = [];
  _$jscoverage['/io/methods.js'].branchData['142'][1] = new BranchData();
  _$jscoverage['/io/methods.js'].branchData['156'] = [];
  _$jscoverage['/io/methods.js'].branchData['156'][1] = new BranchData();
  _$jscoverage['/io/methods.js'].branchData['157'] = [];
  _$jscoverage['/io/methods.js'].branchData['157'][1] = new BranchData();
  _$jscoverage['/io/methods.js'].branchData['171'] = [];
  _$jscoverage['/io/methods.js'].branchData['171'][1] = new BranchData();
  _$jscoverage['/io/methods.js'].branchData['185'] = [];
  _$jscoverage['/io/methods.js'].branchData['185'][1] = new BranchData();
  _$jscoverage['/io/methods.js'].branchData['191'] = [];
  _$jscoverage['/io/methods.js'].branchData['191'][1] = new BranchData();
  _$jscoverage['/io/methods.js'].branchData['191'][2] = new BranchData();
  _$jscoverage['/io/methods.js'].branchData['191'][3] = new BranchData();
  _$jscoverage['/io/methods.js'].branchData['191'][4] = new BranchData();
  _$jscoverage['/io/methods.js'].branchData['191'][5] = new BranchData();
  _$jscoverage['/io/methods.js'].branchData['194'] = [];
  _$jscoverage['/io/methods.js'].branchData['194'][1] = new BranchData();
  _$jscoverage['/io/methods.js'].branchData['203'] = [];
  _$jscoverage['/io/methods.js'].branchData['203'][1] = new BranchData();
  _$jscoverage['/io/methods.js'].branchData['209'] = [];
  _$jscoverage['/io/methods.js'].branchData['209'][1] = new BranchData();
  _$jscoverage['/io/methods.js'].branchData['220'] = [];
  _$jscoverage['/io/methods.js'].branchData['220'][1] = new BranchData();
  _$jscoverage['/io/methods.js'].branchData['259'] = [];
  _$jscoverage['/io/methods.js'].branchData['259'][1] = new BranchData();
  _$jscoverage['/io/methods.js'].branchData['262'] = [];
  _$jscoverage['/io/methods.js'].branchData['262'][1] = new BranchData();
  _$jscoverage['/io/methods.js'].branchData['280'] = [];
  _$jscoverage['/io/methods.js'].branchData['280'][1] = new BranchData();
}
_$jscoverage['/io/methods.js'].branchData['280'][1].init(91, 38, 'S.Uri.getComponents(c.url).query || ""');
function visit112_280_1(result) {
  _$jscoverage['/io/methods.js'].branchData['280'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/methods.js'].branchData['262'][1].init(3177, 19, 'h = config.complete');
function visit111_262_1(result) {
  _$jscoverage['/io/methods.js'].branchData['262'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/methods.js'].branchData['259'][1].init(3072, 19, 'h = config[handler]');
function visit110_259_1(result) {
  _$jscoverage['/io/methods.js'].branchData['259'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/methods.js'].branchData['220'][1].init(1585, 32, 'timeoutTimer = self.timeoutTimer');
function visit109_220_1(result) {
  _$jscoverage['/io/methods.js'].branchData['220'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/methods.js'].branchData['209'][1].init(26, 10, 'status < 0');
function visit108_209_1(result) {
  _$jscoverage['/io/methods.js'].branchData['209'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/methods.js'].branchData['203'][1].init(43, 12, 'e.stack || e');
function visit107_203_1(result) {
  _$jscoverage['/io/methods.js'].branchData['203'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/methods.js'].branchData['194'][1].init(165, 22, 'status == NOT_MODIFIED');
function visit106_194_1(result) {
  _$jscoverage['/io/methods.js'].branchData['194'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/methods.js'].branchData['191'][5].init(475, 22, 'status == NOT_MODIFIED');
function visit105_191_5(result) {
  _$jscoverage['/io/methods.js'].branchData['191'][5].ranCondition(result);
  return result;
}_$jscoverage['/io/methods.js'].branchData['191'][4].init(446, 25, 'status < MULTIPLE_CHOICES');
function visit104_191_4(result) {
  _$jscoverage['/io/methods.js'].branchData['191'][4].ranCondition(result);
  return result;
}_$jscoverage['/io/methods.js'].branchData['191'][3].init(425, 17, 'status >= OK_CODE');
function visit103_191_3(result) {
  _$jscoverage['/io/methods.js'].branchData['191'][3].ranCondition(result);
  return result;
}_$jscoverage['/io/methods.js'].branchData['191'][2].init(425, 46, 'status >= OK_CODE && status < MULTIPLE_CHOICES');
function visit102_191_2(result) {
  _$jscoverage['/io/methods.js'].branchData['191'][2].ranCondition(result);
  return result;
}_$jscoverage['/io/methods.js'].branchData['191'][1].init(425, 72, 'status >= OK_CODE && status < MULTIPLE_CHOICES || status == NOT_MODIFIED');
function visit101_191_1(result) {
  _$jscoverage['/io/methods.js'].branchData['191'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/methods.js'].branchData['185'][1].init(234, 15, 'self.state == 2');
function visit100_185_1(result) {
  _$jscoverage['/io/methods.js'].branchData['185'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/methods.js'].branchData['171'][1].init(54, 26, 'transport = this.transport');
function visit99_171_1(result) {
  _$jscoverage['/io/methods.js'].branchData['171'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/methods.js'].branchData['157'][1].init(109, 14, 'self.transport');
function visit98_157_1(result) {
  _$jscoverage['/io/methods.js'].branchData['157'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/methods.js'].branchData['156'][1].init(65, 21, 'statusText || \'abort\'');
function visit97_156_1(result) {
  _$jscoverage['/io/methods.js'].branchData['156'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/methods.js'].branchData['142'][1].init(56, 11, '!self.state');
function visit96_142_1(result) {
  _$jscoverage['/io/methods.js'].branchData['142'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/methods.js'].branchData['136'][1].init(547, 19, 'match === undefined');
function visit95_136_1(result) {
  _$jscoverage['/io/methods.js'].branchData['136'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/methods.js'].branchData['128'][1].init(26, 41, '!(responseHeaders = self.responseHeaders)');
function visit94_128_1(result) {
  _$jscoverage['/io/methods.js'].branchData['128'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/methods.js'].branchData['127'][1].init(80, 16, 'self.state === 2');
function visit93_127_1(result) {
  _$jscoverage['/io/methods.js'].branchData['127'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/methods.js'].branchData['116'][1].init(59, 16, 'self.state === 2');
function visit92_116_1(result) {
  _$jscoverage['/io/methods.js'].branchData['116'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/methods.js'].branchData['89'][1].init(132, 10, '!converter');
function visit91_89_1(result) {
  _$jscoverage['/io/methods.js'].branchData['89'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/methods.js'].branchData['87'][1].init(65, 46, 'converts[prevType] && converts[prevType][type]');
function visit90_87_1(result) {
  _$jscoverage['/io/methods.js'].branchData['87'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/methods.js'].branchData['84'][1].init(2445, 19, 'i < dataType.length');
function visit89_84_1(result) {
  _$jscoverage['/io/methods.js'].branchData['84'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/methods.js'].branchData['74'][1].init(94, 18, 'prevType == \'text\'');
function visit88_74_1(result) {
  _$jscoverage['/io/methods.js'].branchData['74'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/methods.js'].branchData['72'][1].init(156, 30, 'converter && rawData[prevType]');
function visit87_72_1(result) {
  _$jscoverage['/io/methods.js'].branchData['72'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/methods.js'].branchData['71'][1].init(60, 46, 'converts[prevType] && converts[prevType][type]');
function visit86_71_1(result) {
  _$jscoverage['/io/methods.js'].branchData['71'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/methods.js'].branchData['66'][1].init(1245, 13, '!responseData');
function visit85_66_1(result) {
  _$jscoverage['/io/methods.js'].branchData['66'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/methods.js'].branchData['60'][3].init(279, 17, 'xml !== undefined');
function visit84_60_3(result) {
  _$jscoverage['/io/methods.js'].branchData['60'][3].ranCondition(result);
  return result;
}_$jscoverage['/io/methods.js'].branchData['60'][2].init(243, 32, 'dataType[dataTypeIndex] == \'xml\'');
function visit83_60_2(result) {
  _$jscoverage['/io/methods.js'].branchData['60'][2].ranCondition(result);
  return result;
}_$jscoverage['/io/methods.js'].branchData['60'][1].init(243, 53, 'dataType[dataTypeIndex] == \'xml\' && xml !== undefined');
function visit82_60_1(result) {
  _$jscoverage['/io/methods.js'].branchData['60'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/methods.js'].branchData['55'][3].init(59, 18, 'text !== undefined');
function visit81_55_3(result) {
  _$jscoverage['/io/methods.js'].branchData['55'][3].ranCondition(result);
  return result;
}_$jscoverage['/io/methods.js'].branchData['55'][2].init(22, 33, 'dataType[dataTypeIndex] == \'text\'');
function visit80_55_2(result) {
  _$jscoverage['/io/methods.js'].branchData['55'][2].ranCondition(result);
  return result;
}_$jscoverage['/io/methods.js'].branchData['55'][1].init(22, 55, 'dataType[dataTypeIndex] == \'text\' && text !== undefined');
function visit79_55_1(result) {
  _$jscoverage['/io/methods.js'].branchData['55'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/methods.js'].branchData['54'][1].init(773, 31, 'dataTypeIndex < dataType.length');
function visit78_54_1(result) {
  _$jscoverage['/io/methods.js'].branchData['54'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/methods.js'].branchData['51'][1].init(681, 21, 'dataType[0] || \'text\'');
function visit77_51_1(result) {
  _$jscoverage['/io/methods.js'].branchData['51'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/methods.js'].branchData['43'][1].init(30, 19, 'dataType[0] != type');
function visit76_43_1(result) {
  _$jscoverage['/io/methods.js'].branchData['43'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/methods.js'].branchData['42'][1].init(26, 32, 'contents[type].test(contentType)');
function visit75_42_1(result) {
  _$jscoverage['/io/methods.js'].branchData['42'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/methods.js'].branchData['39'][1].init(222, 16, '!dataType.length');
function visit74_39_1(result) {
  _$jscoverage['/io/methods.js'].branchData['39'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/methods.js'].branchData['35'][1].init(131, 18, 'dataType[0] == \'*\'');
function visit73_35_1(result) {
  _$jscoverage['/io/methods.js'].branchData['35'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/methods.js'].branchData['32'][1].init(30, 51, 'io.mimeType || io.getResponseHeader(\'Content-Type\')');
function visit72_32_1(result) {
  _$jscoverage['/io/methods.js'].branchData['32'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/methods.js'].branchData['30'][1].init(429, 11, 'text || xml');
function visit71_30_1(result) {
  _$jscoverage['/io/methods.js'].branchData['30'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/methods.js'].lineData[6]++;
KISSY.add('io/methods', function(S, IO, undefined) {
  _$jscoverage['/io/methods.js'].functionData[0]++;
  _$jscoverage['/io/methods.js'].lineData[7]++;
  var OK_CODE = 200, logger = S.getLogger('s/logger'), Promise = S.Promise, MULTIPLE_CHOICES = 300, NOT_MODIFIED = 304, rheaders = /^(.*?):[ \t]*([^\r\n]*)\r?$/mg;
  _$jscoverage['/io/methods.js'].lineData[15]++;
  function handleResponseData(io) {
    _$jscoverage['/io/methods.js'].functionData[1]++;
    _$jscoverage['/io/methods.js'].lineData[18]++;
    var text = io.responseText, xml = io.responseXML, c = io.config, converts = c.converters, type, contentType, responseData, contents = c.contents, dataType = c.dataType;
    _$jscoverage['/io/methods.js'].lineData[30]++;
    if (visit71_30_1(text || xml)) {
      _$jscoverage['/io/methods.js'].lineData[32]++;
      contentType = visit72_32_1(io.mimeType || io.getResponseHeader('Content-Type'));
      _$jscoverage['/io/methods.js'].lineData[35]++;
      while (visit73_35_1(dataType[0] == '*')) {
        _$jscoverage['/io/methods.js'].lineData[36]++;
        dataType.shift();
      }
      _$jscoverage['/io/methods.js'].lineData[39]++;
      if (visit74_39_1(!dataType.length)) {
        _$jscoverage['/io/methods.js'].lineData[41]++;
        for (type in contents) {
          _$jscoverage['/io/methods.js'].lineData[42]++;
          if (visit75_42_1(contents[type].test(contentType))) {
            _$jscoverage['/io/methods.js'].lineData[43]++;
            if (visit76_43_1(dataType[0] != type)) {
              _$jscoverage['/io/methods.js'].lineData[44]++;
              dataType.unshift(type);
            }
            _$jscoverage['/io/methods.js'].lineData[46]++;
            break;
          }
        }
      }
      _$jscoverage['/io/methods.js'].lineData[51]++;
      dataType[0] = visit77_51_1(dataType[0] || 'text');
      _$jscoverage['/io/methods.js'].lineData[54]++;
      for (var dataTypeIndex = 0; visit78_54_1(dataTypeIndex < dataType.length); dataTypeIndex++) {
        _$jscoverage['/io/methods.js'].lineData[55]++;
        if (visit79_55_1(visit80_55_2(dataType[dataTypeIndex] == 'text') && visit81_55_3(text !== undefined))) {
          _$jscoverage['/io/methods.js'].lineData[56]++;
          responseData = text;
          _$jscoverage['/io/methods.js'].lineData[57]++;
          break;
        } else {
          _$jscoverage['/io/methods.js'].lineData[60]++;
          if (visit82_60_1(visit83_60_2(dataType[dataTypeIndex] == 'xml') && visit84_60_3(xml !== undefined))) {
            _$jscoverage['/io/methods.js'].lineData[61]++;
            responseData = xml;
            _$jscoverage['/io/methods.js'].lineData[62]++;
            break;
          }
        }
      }
      _$jscoverage['/io/methods.js'].lineData[66]++;
      if (visit85_66_1(!responseData)) {
        _$jscoverage['/io/methods.js'].lineData[67]++;
        var rawData = {
  text: text, 
  xml: xml};
        _$jscoverage['/io/methods.js'].lineData[69]++;
        S.each(['text', 'xml'], function(prevType) {
  _$jscoverage['/io/methods.js'].functionData[2]++;
  _$jscoverage['/io/methods.js'].lineData[70]++;
  var type = dataType[0], converter = visit86_71_1(converts[prevType] && converts[prevType][type]);
  _$jscoverage['/io/methods.js'].lineData[72]++;
  if (visit87_72_1(converter && rawData[prevType])) {
    _$jscoverage['/io/methods.js'].lineData[73]++;
    dataType.unshift(prevType);
    _$jscoverage['/io/methods.js'].lineData[74]++;
    responseData = visit88_74_1(prevType == 'text') ? text : xml;
    _$jscoverage['/io/methods.js'].lineData[75]++;
    return false;
  }
  _$jscoverage['/io/methods.js'].lineData[77]++;
  return undefined;
});
      }
    }
    _$jscoverage['/io/methods.js'].lineData[81]++;
    var prevType = dataType[0];
    _$jscoverage['/io/methods.js'].lineData[84]++;
    for (var i = 1; visit89_84_1(i < dataType.length); i++) {
      _$jscoverage['/io/methods.js'].lineData[85]++;
      type = dataType[i];
      _$jscoverage['/io/methods.js'].lineData[87]++;
      var converter = visit90_87_1(converts[prevType] && converts[prevType][type]);
      _$jscoverage['/io/methods.js'].lineData[89]++;
      if (visit91_89_1(!converter)) {
        _$jscoverage['/io/methods.js'].lineData[90]++;
        throw 'no covert for ' + prevType + ' => ' + type;
      }
      _$jscoverage['/io/methods.js'].lineData[92]++;
      responseData = converter(responseData);
      _$jscoverage['/io/methods.js'].lineData[94]++;
      prevType = type;
    }
    _$jscoverage['/io/methods.js'].lineData[97]++;
    io.responseData = responseData;
  }
  _$jscoverage['/io/methods.js'].lineData[100]++;
  S.extend(IO, Promise, {
  setRequestHeader: function(name, value) {
  _$jscoverage['/io/methods.js'].functionData[3]++;
  _$jscoverage['/io/methods.js'].lineData[104]++;
  var self = this;
  _$jscoverage['/io/methods.js'].lineData[105]++;
  self.requestHeaders[name] = value;
  _$jscoverage['/io/methods.js'].lineData[106]++;
  return self;
}, 
  getAllResponseHeaders: function() {
  _$jscoverage['/io/methods.js'].functionData[4]++;
  _$jscoverage['/io/methods.js'].lineData[115]++;
  var self = this;
  _$jscoverage['/io/methods.js'].lineData[116]++;
  return visit92_116_1(self.state === 2) ? self.responseHeadersString : null;
}, 
  getResponseHeader: function(name) {
  _$jscoverage['/io/methods.js'].functionData[5]++;
  _$jscoverage['/io/methods.js'].lineData[126]++;
  var match, self = this, responseHeaders;
  _$jscoverage['/io/methods.js'].lineData[127]++;
  if (visit93_127_1(self.state === 2)) {
    _$jscoverage['/io/methods.js'].lineData[128]++;
    if (visit94_128_1(!(responseHeaders = self.responseHeaders))) {
      _$jscoverage['/io/methods.js'].lineData[129]++;
      responseHeaders = self.responseHeaders = {};
      _$jscoverage['/io/methods.js'].lineData[130]++;
      while ((match = rheaders.exec(self.responseHeadersString))) {
        _$jscoverage['/io/methods.js'].lineData[131]++;
        responseHeaders[match[1]] = match[2];
      }
    }
    _$jscoverage['/io/methods.js'].lineData[134]++;
    match = responseHeaders[name];
  }
  _$jscoverage['/io/methods.js'].lineData[136]++;
  return visit95_136_1(match === undefined) ? null : match;
}, 
  overrideMimeType: function(type) {
  _$jscoverage['/io/methods.js'].functionData[6]++;
  _$jscoverage['/io/methods.js'].lineData[141]++;
  var self = this;
  _$jscoverage['/io/methods.js'].lineData[142]++;
  if (visit96_142_1(!self.state)) {
    _$jscoverage['/io/methods.js'].lineData[143]++;
    self.mimeType = type;
  }
  _$jscoverage['/io/methods.js'].lineData[145]++;
  return self;
}, 
  abort: function(statusText) {
  _$jscoverage['/io/methods.js'].functionData[7]++;
  _$jscoverage['/io/methods.js'].lineData[155]++;
  var self = this;
  _$jscoverage['/io/methods.js'].lineData[156]++;
  statusText = visit97_156_1(statusText || 'abort');
  _$jscoverage['/io/methods.js'].lineData[157]++;
  if (visit98_157_1(self.transport)) {
    _$jscoverage['/io/methods.js'].lineData[158]++;
    self.transport.abort(statusText);
  }
  _$jscoverage['/io/methods.js'].lineData[160]++;
  self._ioReady(0, statusText);
  _$jscoverage['/io/methods.js'].lineData[161]++;
  return self;
}, 
  getNativeXhr: function() {
  _$jscoverage['/io/methods.js'].functionData[8]++;
  _$jscoverage['/io/methods.js'].lineData[170]++;
  var transport;
  _$jscoverage['/io/methods.js'].lineData[171]++;
  if (visit99_171_1(transport = this.transport)) {
    _$jscoverage['/io/methods.js'].lineData[172]++;
    return transport.nativeXhr;
  }
  _$jscoverage['/io/methods.js'].lineData[174]++;
  return null;
}, 
  _ioReady: function(status, statusText) {
  _$jscoverage['/io/methods.js'].functionData[9]++;
  _$jscoverage['/io/methods.js'].lineData[178]++;
  var self = this;
  _$jscoverage['/io/methods.js'].lineData[185]++;
  if (visit100_185_1(self.state == 2)) {
    _$jscoverage['/io/methods.js'].lineData[186]++;
    return;
  }
  _$jscoverage['/io/methods.js'].lineData[188]++;
  self.state = 2;
  _$jscoverage['/io/methods.js'].lineData[189]++;
  self.readyState = 4;
  _$jscoverage['/io/methods.js'].lineData[190]++;
  var isSuccess;
  _$jscoverage['/io/methods.js'].lineData[191]++;
  if (visit101_191_1(visit102_191_2(visit103_191_3(status >= OK_CODE) && visit104_191_4(status < MULTIPLE_CHOICES)) || visit105_191_5(status == NOT_MODIFIED))) {
    _$jscoverage['/io/methods.js'].lineData[194]++;
    if (visit106_194_1(status == NOT_MODIFIED)) {
      _$jscoverage['/io/methods.js'].lineData[195]++;
      statusText = 'not modified';
      _$jscoverage['/io/methods.js'].lineData[196]++;
      isSuccess = true;
    } else {
      _$jscoverage['/io/methods.js'].lineData[198]++;
      try {
        _$jscoverage['/io/methods.js'].lineData[199]++;
        handleResponseData(self);
        _$jscoverage['/io/methods.js'].lineData[200]++;
        statusText = 'success';
        _$jscoverage['/io/methods.js'].lineData[201]++;
        isSuccess = true;
      }      catch (e) {
  _$jscoverage['/io/methods.js'].lineData[203]++;
  logger.error(visit107_203_1(e.stack || e));
  _$jscoverage['/io/methods.js'].lineData[204]++;
  statusText = 'parser error';
}
    }
  } else {
    _$jscoverage['/io/methods.js'].lineData[209]++;
    if (visit108_209_1(status < 0)) {
      _$jscoverage['/io/methods.js'].lineData[210]++;
      status = 0;
    }
  }
  _$jscoverage['/io/methods.js'].lineData[214]++;
  self.status = status;
  _$jscoverage['/io/methods.js'].lineData[215]++;
  self.statusText = statusText;
  _$jscoverage['/io/methods.js'].lineData[217]++;
  var defer = self._defer, config = self.config, timeoutTimer;
  _$jscoverage['/io/methods.js'].lineData[220]++;
  if (visit109_220_1(timeoutTimer = self.timeoutTimer)) {
    _$jscoverage['/io/methods.js'].lineData[221]++;
    clearTimeout(timeoutTimer);
    _$jscoverage['/io/methods.js'].lineData[222]++;
    self.timeoutTimer = 0;
  }
  _$jscoverage['/io/methods.js'].lineData[250]++;
  var handler = isSuccess ? 'success' : 'error', h, v = [self.responseData, statusText, self], context = config.context, eventObject = {
  ajaxConfig: config, 
  io: self};
  _$jscoverage['/io/methods.js'].lineData[259]++;
  if (visit110_259_1(h = config[handler])) {
    _$jscoverage['/io/methods.js'].lineData[260]++;
    h.apply(context, v);
  }
  _$jscoverage['/io/methods.js'].lineData[262]++;
  if (visit111_262_1(h = config.complete)) {
    _$jscoverage['/io/methods.js'].lineData[263]++;
    h.apply(context, v);
  }
  _$jscoverage['/io/methods.js'].lineData[265]++;
  IO.fire(handler, eventObject);
  _$jscoverage['/io/methods.js'].lineData[266]++;
  IO.fire('complete', eventObject);
  _$jscoverage['/io/methods.js'].lineData[267]++;
  defer[isSuccess ? 'resolve' : 'reject'](v);
}, 
  _getUrlForSend: function() {
  _$jscoverage['/io/methods.js'].functionData[10]++;
  _$jscoverage['/io/methods.js'].lineData[278]++;
  var c = this.config, uri = c.uri, originalQuery = visit112_280_1(S.Uri.getComponents(c.url).query || ""), url = uri.toString.call(uri, c.serializeArray);
  _$jscoverage['/io/methods.js'].lineData[283]++;
  return url + (originalQuery ? ((uri.query.has() ? '&' : '?') + originalQuery) : originalQuery);
}});
}, {
  requires: ['./base']});
