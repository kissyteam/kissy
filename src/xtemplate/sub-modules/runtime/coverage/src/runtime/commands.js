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
if (! _$jscoverage['/runtime/commands.js']) {
  _$jscoverage['/runtime/commands.js'] = {};
  _$jscoverage['/runtime/commands.js'].lineData = [];
  _$jscoverage['/runtime/commands.js'].lineData[6] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[7] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[8] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[10] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[11] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[12] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[13] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[14] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[15] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[16] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[17] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[18] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[20] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[23] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[26] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[28] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[29] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[30] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[31] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[32] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[33] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[34] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[36] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[37] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[38] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[39] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[40] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[43] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[45] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[46] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[47] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[48] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[50] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[51] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[54] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[55] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[56] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[57] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[58] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[59] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[60] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[62] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[63] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[66] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[67] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[69] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[73] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[74] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[75] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[77] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[78] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[79] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[80] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[81] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[83] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[87] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[88] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[89] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[90] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[91] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[93] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[94] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[96] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[100] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[101] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[105] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[106] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[108] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[109] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[110] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[111] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[114] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[115] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[117] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[118] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[119] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[120] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[121] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[123] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[126] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[131] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[135] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[136] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[140] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[141] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[142] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[143] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[144] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[145] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[146] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[148] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[149] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[151] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[155] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[156] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[157] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[158] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[159] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[160] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[161] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[162] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[163] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[164] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[165] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[166] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[168] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[169] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[173] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[174] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[175] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[176] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[177] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[179] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[183] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[187] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[188] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[189] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[190] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[191] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[193] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[194] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[199] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[200] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[201] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[202] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[203] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[204] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[205] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[207] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[209] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[211] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[212] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[215] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[219] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[220] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[221] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[222] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[226] = 0;
}
if (! _$jscoverage['/runtime/commands.js'].functionData) {
  _$jscoverage['/runtime/commands.js'].functionData = [];
  _$jscoverage['/runtime/commands.js'].functionData[0] = 0;
  _$jscoverage['/runtime/commands.js'].functionData[1] = 0;
  _$jscoverage['/runtime/commands.js'].functionData[2] = 0;
  _$jscoverage['/runtime/commands.js'].functionData[3] = 0;
  _$jscoverage['/runtime/commands.js'].functionData[4] = 0;
  _$jscoverage['/runtime/commands.js'].functionData[5] = 0;
  _$jscoverage['/runtime/commands.js'].functionData[6] = 0;
  _$jscoverage['/runtime/commands.js'].functionData[7] = 0;
  _$jscoverage['/runtime/commands.js'].functionData[8] = 0;
  _$jscoverage['/runtime/commands.js'].functionData[9] = 0;
  _$jscoverage['/runtime/commands.js'].functionData[10] = 0;
  _$jscoverage['/runtime/commands.js'].functionData[11] = 0;
}
if (! _$jscoverage['/runtime/commands.js'].branchData) {
  _$jscoverage['/runtime/commands.js'].branchData = {};
  _$jscoverage['/runtime/commands.js'].branchData['14'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['14'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['16'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['16'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['17'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['17'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['30'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['30'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['36'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['36'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['37'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['37'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['43'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['43'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['47'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['47'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['59'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['59'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['66'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['66'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['75'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['75'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['80'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['80'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['89'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['89'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['90'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['90'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['93'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['93'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['108'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['108'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['117'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['117'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['118'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['118'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['144'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['144'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['148'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['148'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['155'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['155'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['157'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['157'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['158'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['158'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['161'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['161'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['164'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['164'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['164'][2] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['173'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['173'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['176'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['176'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['191'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['191'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['193'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['193'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['202'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['202'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['203'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['203'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['219'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['219'][1] = new BranchData();
}
_$jscoverage['/runtime/commands.js'].branchData['219'][1].init(7439, 9, '\'@DEBUG@\'');
function visit33_219_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['219'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['203'][1].init(62, 7, 'i < len');
function visit32_203_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['203'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['202'][1].init(138, 40, 'macro && (paramNames = macro.paramNames)');
function visit31_202_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['202'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['193'][1].init(258, 9, 'option.fn');
function visit30_193_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['193'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['191'][1].init(194, 20, 'payload.macros || {}');
function visit29_191_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['191'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['176'][1].init(25, 9, 'cursor.fn');
function visit28_176_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['176'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['173'][1].init(1155, 22, '!payload.extendTplName');
function visit27_173_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['173'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['164'][2].init(103, 25, 'cursor.type === \'prepend\'');
function visit26_164_2(result) {
  _$jscoverage['/runtime/commands.js'].branchData['164'][2].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['164'][1].init(93, 35, 'cursor && cursor.type === \'prepend\'');
function visit25_164_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['164'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['161'][1].init(165, 23, 'head.type === \'prepend\'');
function visit24_161_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['161'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['158'][1].init(21, 22, 'head.type === \'append\'');
function visit23_158_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['158'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['157'][1].init(582, 9, 'head.type');
function visit22_157_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['157'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['155'][1].init(504, 5, '!head');
function visit21_155_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['155'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['148'][1].init(299, 20, 'payload.blocks || {}');
function visit20_148_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['148'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['144'][1].init(147, 19, 'params.length === 2');
function visit19_144_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['144'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['118'][1].init(21, 7, '!myName');
function visit18_118_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['118'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['117'][1].init(375, 28, 'subTplName.charAt(0) === \'.\'');
function visit17_117_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['117'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['108'][1].init(120, 11, 'option.hash');
function visit16_108_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['108'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['93'][1].init(233, 14, 'option.inverse');
function visit15_93_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['93'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['90'][1].init(21, 9, 'option.fn');
function visit14_90_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['90'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['89'][1].init(93, 6, 'param0');
function visit13_89_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['89'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['80'][1].init(324, 14, 'option.inverse');
function visit12_80_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['80'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['75'][1].init(93, 6, 'param0');
function visit11_75_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['75'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['66'][1].init(1639, 14, 'option.inverse');
function visit10_66_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['66'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['59'][1].init(132, 9, 'valueName');
function visit9_59_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['59'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['47'][1].init(205, 9, 'valueName');
function visit8_47_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['47'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['43'][1].init(237, 15, 'xindex < xcount');
function visit7_43_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['43'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['37'][1].init(21, 17, 'S.isArray(param0)');
function visit6_37_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['37'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['36'][1].init(315, 6, 'param0');
function visit5_36_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['36'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['30'][1].init(106, 21, 'params[2] || \'xindex\'');
function visit4_30_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['30'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['17'][1].init(99, 16, 'subPart === \'..\'');
function visit3_17_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['17'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['16'][1].init(56, 15, 'subPart === \'.\'');
function visit2_16_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['16'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['14'][1].init(153, 5, 'i < l');
function visit1_14_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['14'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/runtime/commands.js'].functionData[0]++;
  _$jscoverage['/runtime/commands.js'].lineData[7]++;
  var commands;
  _$jscoverage['/runtime/commands.js'].lineData[8]++;
  var Scope = require('./scope');
  _$jscoverage['/runtime/commands.js'].lineData[10]++;
  function getSubNameFromParentName(parentName, subName) {
    _$jscoverage['/runtime/commands.js'].functionData[1]++;
    _$jscoverage['/runtime/commands.js'].lineData[11]++;
    var parts = parentName.split('/');
    _$jscoverage['/runtime/commands.js'].lineData[12]++;
    var subParts = subName.split('/');
    _$jscoverage['/runtime/commands.js'].lineData[13]++;
    parts.pop();
    _$jscoverage['/runtime/commands.js'].lineData[14]++;
    for (var i = 0, l = subParts.length; visit1_14_1(i < l); i++) {
      _$jscoverage['/runtime/commands.js'].lineData[15]++;
      var subPart = subParts[i];
      _$jscoverage['/runtime/commands.js'].lineData[16]++;
      if (visit2_16_1(subPart === '.')) {
      } else {
        _$jscoverage['/runtime/commands.js'].lineData[17]++;
        if (visit3_17_1(subPart === '..')) {
          _$jscoverage['/runtime/commands.js'].lineData[18]++;
          parts.pop();
        } else {
          _$jscoverage['/runtime/commands.js'].lineData[20]++;
          parts.push(subPart);
        }
      }
    }
    _$jscoverage['/runtime/commands.js'].lineData[23]++;
    return parts.join('/');
  }
  _$jscoverage['/runtime/commands.js'].lineData[26]++;
  commands = {
  'each': function(scope, option, buffer) {
  _$jscoverage['/runtime/commands.js'].functionData[2]++;
  _$jscoverage['/runtime/commands.js'].lineData[28]++;
  var params = option.params;
  _$jscoverage['/runtime/commands.js'].lineData[29]++;
  var param0 = params[0];
  _$jscoverage['/runtime/commands.js'].lineData[30]++;
  var xindexName = visit4_30_1(params[2] || 'xindex');
  _$jscoverage['/runtime/commands.js'].lineData[31]++;
  var valueName = params[1];
  _$jscoverage['/runtime/commands.js'].lineData[32]++;
  var xcount;
  _$jscoverage['/runtime/commands.js'].lineData[33]++;
  var opScope;
  _$jscoverage['/runtime/commands.js'].lineData[34]++;
  var affix;
  _$jscoverage['/runtime/commands.js'].lineData[36]++;
  if (visit5_36_1(param0)) {
    _$jscoverage['/runtime/commands.js'].lineData[37]++;
    if (visit6_37_1(S.isArray(param0))) {
      _$jscoverage['/runtime/commands.js'].lineData[38]++;
      xcount = param0.length;
      _$jscoverage['/runtime/commands.js'].lineData[39]++;
      opScope = new Scope();
      _$jscoverage['/runtime/commands.js'].lineData[40]++;
      affix = opScope.affix = {
  xcount: xcount};
      _$jscoverage['/runtime/commands.js'].lineData[43]++;
      for (var xindex = 0; visit7_43_1(xindex < xcount); xindex++) {
        _$jscoverage['/runtime/commands.js'].lineData[45]++;
        opScope.data = param0[xindex];
        _$jscoverage['/runtime/commands.js'].lineData[46]++;
        affix[xindexName] = xindex;
        _$jscoverage['/runtime/commands.js'].lineData[47]++;
        if (visit8_47_1(valueName)) {
          _$jscoverage['/runtime/commands.js'].lineData[48]++;
          affix[valueName] = param0[xindex];
        }
        _$jscoverage['/runtime/commands.js'].lineData[50]++;
        opScope.setParent(scope);
        _$jscoverage['/runtime/commands.js'].lineData[51]++;
        buffer = option.fn(opScope, buffer);
      }
    } else {
      _$jscoverage['/runtime/commands.js'].lineData[54]++;
      opScope = new Scope();
      _$jscoverage['/runtime/commands.js'].lineData[55]++;
      affix = opScope.affix = {};
      _$jscoverage['/runtime/commands.js'].lineData[56]++;
      for (var name in param0) {
        _$jscoverage['/runtime/commands.js'].lineData[57]++;
        opScope.data = param0[name];
        _$jscoverage['/runtime/commands.js'].lineData[58]++;
        affix[xindexName] = name;
        _$jscoverage['/runtime/commands.js'].lineData[59]++;
        if (visit9_59_1(valueName)) {
          _$jscoverage['/runtime/commands.js'].lineData[60]++;
          affix[valueName] = param0[name];
        }
        _$jscoverage['/runtime/commands.js'].lineData[62]++;
        opScope.setParent(scope);
        _$jscoverage['/runtime/commands.js'].lineData[63]++;
        buffer = option.fn(opScope, buffer);
      }
    }
  } else {
    _$jscoverage['/runtime/commands.js'].lineData[66]++;
    if (visit10_66_1(option.inverse)) {
      _$jscoverage['/runtime/commands.js'].lineData[67]++;
      buffer = option.inverse(scope, buffer);
    }
  }
  _$jscoverage['/runtime/commands.js'].lineData[69]++;
  return buffer;
}, 
  'with': function(scope, option, buffer) {
  _$jscoverage['/runtime/commands.js'].functionData[3]++;
  _$jscoverage['/runtime/commands.js'].lineData[73]++;
  var params = option.params;
  _$jscoverage['/runtime/commands.js'].lineData[74]++;
  var param0 = params[0];
  _$jscoverage['/runtime/commands.js'].lineData[75]++;
  if (visit11_75_1(param0)) {
    _$jscoverage['/runtime/commands.js'].lineData[77]++;
    var opScope = new Scope(param0);
    _$jscoverage['/runtime/commands.js'].lineData[78]++;
    opScope.setParent(scope);
    _$jscoverage['/runtime/commands.js'].lineData[79]++;
    buffer = option.fn(opScope, buffer);
  } else {
    _$jscoverage['/runtime/commands.js'].lineData[80]++;
    if (visit12_80_1(option.inverse)) {
      _$jscoverage['/runtime/commands.js'].lineData[81]++;
      buffer = option.inverse(scope, buffer);
    }
  }
  _$jscoverage['/runtime/commands.js'].lineData[83]++;
  return buffer;
}, 
  'if': function(scope, option, buffer) {
  _$jscoverage['/runtime/commands.js'].functionData[4]++;
  _$jscoverage['/runtime/commands.js'].lineData[87]++;
  var params = option.params;
  _$jscoverage['/runtime/commands.js'].lineData[88]++;
  var param0 = params[0];
  _$jscoverage['/runtime/commands.js'].lineData[89]++;
  if (visit13_89_1(param0)) {
    _$jscoverage['/runtime/commands.js'].lineData[90]++;
    if (visit14_90_1(option.fn)) {
      _$jscoverage['/runtime/commands.js'].lineData[91]++;
      buffer = option.fn(scope, buffer);
    }
  } else {
    _$jscoverage['/runtime/commands.js'].lineData[93]++;
    if (visit15_93_1(option.inverse)) {
      _$jscoverage['/runtime/commands.js'].lineData[94]++;
      buffer = option.inverse(scope, buffer);
    }
  }
  _$jscoverage['/runtime/commands.js'].lineData[96]++;
  return buffer;
}, 
  'set': function(scope, option, buffer) {
  _$jscoverage['/runtime/commands.js'].functionData[5]++;
  _$jscoverage['/runtime/commands.js'].lineData[100]++;
  scope.mix(option.hash);
  _$jscoverage['/runtime/commands.js'].lineData[101]++;
  return buffer;
}, 
  include: function(scope, option, buffer, payload) {
  _$jscoverage['/runtime/commands.js'].functionData[6]++;
  _$jscoverage['/runtime/commands.js'].lineData[105]++;
  var params = option.params;
  _$jscoverage['/runtime/commands.js'].lineData[106]++;
  var self = this;
  _$jscoverage['/runtime/commands.js'].lineData[108]++;
  if (visit16_108_1(option.hash)) {
    _$jscoverage['/runtime/commands.js'].lineData[109]++;
    var newScope = new Scope(option.hash);
    _$jscoverage['/runtime/commands.js'].lineData[110]++;
    newScope.setParent(scope);
    _$jscoverage['/runtime/commands.js'].lineData[111]++;
    scope = newScope;
  }
  _$jscoverage['/runtime/commands.js'].lineData[114]++;
  var myName = self.name;
  _$jscoverage['/runtime/commands.js'].lineData[115]++;
  var subTplName = params[0];
  _$jscoverage['/runtime/commands.js'].lineData[117]++;
  if (visit17_117_1(subTplName.charAt(0) === '.')) {
    _$jscoverage['/runtime/commands.js'].lineData[118]++;
    if (visit18_118_1(!myName)) {
      _$jscoverage['/runtime/commands.js'].lineData[119]++;
      var error = 'parent template does not have name' + ' for relative sub tpl name: ' + subTplName;
      _$jscoverage['/runtime/commands.js'].lineData[120]++;
      S.error(error);
      _$jscoverage['/runtime/commands.js'].lineData[121]++;
      return buffer;
    }
    _$jscoverage['/runtime/commands.js'].lineData[123]++;
    subTplName = getSubNameFromParentName(myName, subTplName);
  }
  _$jscoverage['/runtime/commands.js'].lineData[126]++;
  return self.load(subTplName).render(scope, undefined, buffer, payload);
}, 
  parse: function(scope, option, buffer, payload) {
  _$jscoverage['/runtime/commands.js'].functionData[7]++;
  _$jscoverage['/runtime/commands.js'].lineData[131]++;
  return commands.include.call(this, new Scope(), option, buffer, payload);
}, 
  extend: function(scope, option, buffer, payload) {
  _$jscoverage['/runtime/commands.js'].functionData[8]++;
  _$jscoverage['/runtime/commands.js'].lineData[135]++;
  payload.extendTplName = option.params[0];
  _$jscoverage['/runtime/commands.js'].lineData[136]++;
  return buffer;
}, 
  block: function(scope, option, buffer, payload) {
  _$jscoverage['/runtime/commands.js'].functionData[9]++;
  _$jscoverage['/runtime/commands.js'].lineData[140]++;
  var self = this;
  _$jscoverage['/runtime/commands.js'].lineData[141]++;
  var params = option.params;
  _$jscoverage['/runtime/commands.js'].lineData[142]++;
  var blockName = params[0];
  _$jscoverage['/runtime/commands.js'].lineData[143]++;
  var type;
  _$jscoverage['/runtime/commands.js'].lineData[144]++;
  if (visit19_144_1(params.length === 2)) {
    _$jscoverage['/runtime/commands.js'].lineData[145]++;
    type = params[0];
    _$jscoverage['/runtime/commands.js'].lineData[146]++;
    blockName = params[1];
  }
  _$jscoverage['/runtime/commands.js'].lineData[148]++;
  var blocks = payload.blocks = visit20_148_1(payload.blocks || {});
  _$jscoverage['/runtime/commands.js'].lineData[149]++;
  var head = blocks[blockName], cursor;
  _$jscoverage['/runtime/commands.js'].lineData[151]++;
  var current = {
  fn: option.fn, 
  type: type};
  _$jscoverage['/runtime/commands.js'].lineData[155]++;
  if (visit21_155_1(!head)) {
    _$jscoverage['/runtime/commands.js'].lineData[156]++;
    blocks[blockName] = current;
  } else {
    _$jscoverage['/runtime/commands.js'].lineData[157]++;
    if (visit22_157_1(head.type)) {
      _$jscoverage['/runtime/commands.js'].lineData[158]++;
      if (visit23_158_1(head.type === 'append')) {
        _$jscoverage['/runtime/commands.js'].lineData[159]++;
        current.next = head;
        _$jscoverage['/runtime/commands.js'].lineData[160]++;
        blocks[blockName] = current;
      } else {
        _$jscoverage['/runtime/commands.js'].lineData[161]++;
        if (visit24_161_1(head.type === 'prepend')) {
          _$jscoverage['/runtime/commands.js'].lineData[162]++;
          var prev;
          _$jscoverage['/runtime/commands.js'].lineData[163]++;
          cursor = head;
          _$jscoverage['/runtime/commands.js'].lineData[164]++;
          while (visit25_164_1(cursor && visit26_164_2(cursor.type === 'prepend'))) {
            _$jscoverage['/runtime/commands.js'].lineData[165]++;
            prev = cursor;
            _$jscoverage['/runtime/commands.js'].lineData[166]++;
            cursor = cursor.next;
          }
          _$jscoverage['/runtime/commands.js'].lineData[168]++;
          current.next = cursor;
          _$jscoverage['/runtime/commands.js'].lineData[169]++;
          prev.next = current;
        }
      }
    }
  }
  _$jscoverage['/runtime/commands.js'].lineData[173]++;
  if (visit27_173_1(!payload.extendTplName)) {
    _$jscoverage['/runtime/commands.js'].lineData[174]++;
    cursor = blocks[blockName];
    _$jscoverage['/runtime/commands.js'].lineData[175]++;
    while (cursor) {
      _$jscoverage['/runtime/commands.js'].lineData[176]++;
      if (visit28_176_1(cursor.fn)) {
        _$jscoverage['/runtime/commands.js'].lineData[177]++;
        buffer = cursor.fn.call(self, scope, buffer);
      }
      _$jscoverage['/runtime/commands.js'].lineData[179]++;
      cursor = cursor.next;
    }
  }
  _$jscoverage['/runtime/commands.js'].lineData[183]++;
  return buffer;
}, 
  'macro': function(scope, option, buffer, payload) {
  _$jscoverage['/runtime/commands.js'].functionData[10]++;
  _$jscoverage['/runtime/commands.js'].lineData[187]++;
  var params = option.params;
  _$jscoverage['/runtime/commands.js'].lineData[188]++;
  var macroName = params[0];
  _$jscoverage['/runtime/commands.js'].lineData[189]++;
  var params1 = params.slice(1);
  _$jscoverage['/runtime/commands.js'].lineData[190]++;
  var self = this;
  _$jscoverage['/runtime/commands.js'].lineData[191]++;
  var macros = payload.macros = visit29_191_1(payload.macros || {});
  _$jscoverage['/runtime/commands.js'].lineData[193]++;
  if (visit30_193_1(option.fn)) {
    _$jscoverage['/runtime/commands.js'].lineData[194]++;
    macros[macroName] = {
  paramNames: params1, 
  fn: option.fn};
  } else {
    _$jscoverage['/runtime/commands.js'].lineData[199]++;
    var paramValues = {};
    _$jscoverage['/runtime/commands.js'].lineData[200]++;
    var macro = macros[macroName];
    _$jscoverage['/runtime/commands.js'].lineData[201]++;
    var paramNames;
    _$jscoverage['/runtime/commands.js'].lineData[202]++;
    if (visit31_202_1(macro && (paramNames = macro.paramNames))) {
      _$jscoverage['/runtime/commands.js'].lineData[203]++;
      for (var i = 0, len = paramNames.length; visit32_203_1(i < len); i++) {
        _$jscoverage['/runtime/commands.js'].lineData[204]++;
        var p = paramNames[i];
        _$jscoverage['/runtime/commands.js'].lineData[205]++;
        paramValues[p] = params1[i];
      }
      _$jscoverage['/runtime/commands.js'].lineData[207]++;
      var newScope = new Scope(paramValues);
      _$jscoverage['/runtime/commands.js'].lineData[209]++;
      buffer = macro.fn.call(self, newScope, buffer);
    } else {
      _$jscoverage['/runtime/commands.js'].lineData[211]++;
      var error = 'can not find macro:' + name;
      _$jscoverage['/runtime/commands.js'].lineData[212]++;
      S.error(error);
    }
  }
  _$jscoverage['/runtime/commands.js'].lineData[215]++;
  return buffer;
}};
  _$jscoverage['/runtime/commands.js'].lineData[219]++;
  if (visit33_219_1('@DEBUG@')) {
    _$jscoverage['/runtime/commands.js'].lineData[220]++;
    commands['debugger'] = function(scope, option, buffer) {
  _$jscoverage['/runtime/commands.js'].functionData[11]++;
  _$jscoverage['/runtime/commands.js'].lineData[221]++;
  S.globalEval('debugger');
  _$jscoverage['/runtime/commands.js'].lineData[222]++;
  return buffer;
};
  }
  _$jscoverage['/runtime/commands.js'].lineData[226]++;
  return commands;
});
