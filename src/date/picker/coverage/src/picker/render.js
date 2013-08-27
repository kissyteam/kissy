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
if (! _$jscoverage['/picker/render.js']) {
  _$jscoverage['/picker/render.js'] = {};
  _$jscoverage['/picker/render.js'].lineData = [];
  _$jscoverage['/picker/render.js'].lineData[5] = 0;
  _$jscoverage['/picker/render.js'].lineData[6] = 0;
  _$jscoverage['/picker/render.js'].lineData[7] = 0;
  _$jscoverage['/picker/render.js'].lineData[8] = 0;
  _$jscoverage['/picker/render.js'].lineData[9] = 0;
  _$jscoverage['/picker/render.js'].lineData[10] = 0;
  _$jscoverage['/picker/render.js'].lineData[19] = 0;
  _$jscoverage['/picker/render.js'].lineData[20] = 0;
  _$jscoverage['/picker/render.js'].lineData[22] = 0;
  _$jscoverage['/picker/render.js'].lineData[23] = 0;
  _$jscoverage['/picker/render.js'].lineData[28] = 0;
  _$jscoverage['/picker/render.js'].lineData[29] = 0;
  _$jscoverage['/picker/render.js'].lineData[34] = 0;
  _$jscoverage['/picker/render.js'].lineData[35] = 0;
  _$jscoverage['/picker/render.js'].lineData[39] = 0;
  _$jscoverage['/picker/render.js'].lineData[40] = 0;
  _$jscoverage['/picker/render.js'].lineData[41] = 0;
  _$jscoverage['/picker/render.js'].lineData[43] = 0;
  _$jscoverage['/picker/render.js'].lineData[47] = 0;
  _$jscoverage['/picker/render.js'].lineData[48] = 0;
  _$jscoverage['/picker/render.js'].lineData[49] = 0;
  _$jscoverage['/picker/render.js'].lineData[51] = 0;
  _$jscoverage['/picker/render.js'].lineData[55] = 0;
  _$jscoverage['/picker/render.js'].lineData[56] = 0;
  _$jscoverage['/picker/render.js'].lineData[59] = 0;
  _$jscoverage['/picker/render.js'].lineData[61] = 0;
  _$jscoverage['/picker/render.js'].lineData[62] = 0;
  _$jscoverage['/picker/render.js'].lineData[63] = 0;
  _$jscoverage['/picker/render.js'].lineData[64] = 0;
  _$jscoverage['/picker/render.js'].lineData[65] = 0;
  _$jscoverage['/picker/render.js'].lineData[66] = 0;
  _$jscoverage['/picker/render.js'].lineData[70] = 0;
  _$jscoverage['/picker/render.js'].lineData[71] = 0;
  _$jscoverage['/picker/render.js'].lineData[72] = 0;
  _$jscoverage['/picker/render.js'].lineData[73] = 0;
  _$jscoverage['/picker/render.js'].lineData[74] = 0;
  _$jscoverage['/picker/render.js'].lineData[75] = 0;
  _$jscoverage['/picker/render.js'].lineData[76] = 0;
  _$jscoverage['/picker/render.js'].lineData[77] = 0;
  _$jscoverage['/picker/render.js'].lineData[81] = 0;
  _$jscoverage['/picker/render.js'].lineData[82] = 0;
  _$jscoverage['/picker/render.js'].lineData[83] = 0;
  _$jscoverage['/picker/render.js'].lineData[84] = 0;
  _$jscoverage['/picker/render.js'].lineData[85] = 0;
  _$jscoverage['/picker/render.js'].lineData[86] = 0;
  _$jscoverage['/picker/render.js'].lineData[97] = 0;
  _$jscoverage['/picker/render.js'].lineData[98] = 0;
  _$jscoverage['/picker/render.js'].lineData[99] = 0;
  _$jscoverage['/picker/render.js'].lineData[100] = 0;
  _$jscoverage['/picker/render.js'].lineData[101] = 0;
  _$jscoverage['/picker/render.js'].lineData[102] = 0;
  _$jscoverage['/picker/render.js'].lineData[103] = 0;
  _$jscoverage['/picker/render.js'].lineData[105] = 0;
  _$jscoverage['/picker/render.js'].lineData[118] = 0;
  _$jscoverage['/picker/render.js'].lineData[122] = 0;
  _$jscoverage['/picker/render.js'].lineData[145] = 0;
  _$jscoverage['/picker/render.js'].lineData[146] = 0;
  _$jscoverage['/picker/render.js'].lineData[147] = 0;
  _$jscoverage['/picker/render.js'].lineData[148] = 0;
  _$jscoverage['/picker/render.js'].lineData[149] = 0;
  _$jscoverage['/picker/render.js'].lineData[151] = 0;
  _$jscoverage['/picker/render.js'].lineData[152] = 0;
  _$jscoverage['/picker/render.js'].lineData[153] = 0;
  _$jscoverage['/picker/render.js'].lineData[154] = 0;
  _$jscoverage['/picker/render.js'].lineData[155] = 0;
  _$jscoverage['/picker/render.js'].lineData[156] = 0;
  _$jscoverage['/picker/render.js'].lineData[157] = 0;
  _$jscoverage['/picker/render.js'].lineData[158] = 0;
  _$jscoverage['/picker/render.js'].lineData[159] = 0;
  _$jscoverage['/picker/render.js'].lineData[161] = 0;
  _$jscoverage['/picker/render.js'].lineData[162] = 0;
  _$jscoverage['/picker/render.js'].lineData[165] = 0;
  _$jscoverage['/picker/render.js'].lineData[166] = 0;
  _$jscoverage['/picker/render.js'].lineData[167] = 0;
  _$jscoverage['/picker/render.js'].lineData[168] = 0;
  _$jscoverage['/picker/render.js'].lineData[169] = 0;
  _$jscoverage['/picker/render.js'].lineData[170] = 0;
  _$jscoverage['/picker/render.js'].lineData[175] = 0;
  _$jscoverage['/picker/render.js'].lineData[176] = 0;
  _$jscoverage['/picker/render.js'].lineData[177] = 0;
  _$jscoverage['/picker/render.js'].lineData[178] = 0;
  _$jscoverage['/picker/render.js'].lineData[179] = 0;
  _$jscoverage['/picker/render.js'].lineData[181] = 0;
  _$jscoverage['/picker/render.js'].lineData[182] = 0;
  _$jscoverage['/picker/render.js'].lineData[184] = 0;
  _$jscoverage['/picker/render.js'].lineData[185] = 0;
  _$jscoverage['/picker/render.js'].lineData[186] = 0;
  _$jscoverage['/picker/render.js'].lineData[188] = 0;
  _$jscoverage['/picker/render.js'].lineData[189] = 0;
  _$jscoverage['/picker/render.js'].lineData[191] = 0;
  _$jscoverage['/picker/render.js'].lineData[192] = 0;
  _$jscoverage['/picker/render.js'].lineData[194] = 0;
  _$jscoverage['/picker/render.js'].lineData[195] = 0;
  _$jscoverage['/picker/render.js'].lineData[196] = 0;
  _$jscoverage['/picker/render.js'].lineData[199] = 0;
  _$jscoverage['/picker/render.js'].lineData[200] = 0;
  _$jscoverage['/picker/render.js'].lineData[202] = 0;
  _$jscoverage['/picker/render.js'].lineData[210] = 0;
  _$jscoverage['/picker/render.js'].lineData[216] = 0;
  _$jscoverage['/picker/render.js'].lineData[218] = 0;
  _$jscoverage['/picker/render.js'].lineData[220] = 0;
  _$jscoverage['/picker/render.js'].lineData[221] = 0;
  _$jscoverage['/picker/render.js'].lineData[225] = 0;
  _$jscoverage['/picker/render.js'].lineData[229] = 0;
  _$jscoverage['/picker/render.js'].lineData[230] = 0;
  _$jscoverage['/picker/render.js'].lineData[231] = 0;
  _$jscoverage['/picker/render.js'].lineData[232] = 0;
  _$jscoverage['/picker/render.js'].lineData[233] = 0;
  _$jscoverage['/picker/render.js'].lineData[234] = 0;
  _$jscoverage['/picker/render.js'].lineData[235] = 0;
  _$jscoverage['/picker/render.js'].lineData[236] = 0;
  _$jscoverage['/picker/render.js'].lineData[237] = 0;
  _$jscoverage['/picker/render.js'].lineData[239] = 0;
  _$jscoverage['/picker/render.js'].lineData[240] = 0;
  _$jscoverage['/picker/render.js'].lineData[241] = 0;
  _$jscoverage['/picker/render.js'].lineData[247] = 0;
  _$jscoverage['/picker/render.js'].lineData[248] = 0;
  _$jscoverage['/picker/render.js'].lineData[249] = 0;
  _$jscoverage['/picker/render.js'].lineData[250] = 0;
  _$jscoverage['/picker/render.js'].lineData[251] = 0;
  _$jscoverage['/picker/render.js'].lineData[252] = 0;
  _$jscoverage['/picker/render.js'].lineData[253] = 0;
  _$jscoverage['/picker/render.js'].lineData[254] = 0;
  _$jscoverage['/picker/render.js'].lineData[255] = 0;
  _$jscoverage['/picker/render.js'].lineData[257] = 0;
  _$jscoverage['/picker/render.js'].lineData[258] = 0;
  _$jscoverage['/picker/render.js'].lineData[259] = 0;
  _$jscoverage['/picker/render.js'].lineData[262] = 0;
  _$jscoverage['/picker/render.js'].lineData[263] = 0;
  _$jscoverage['/picker/render.js'].lineData[264] = 0;
  _$jscoverage['/picker/render.js'].lineData[265] = 0;
  _$jscoverage['/picker/render.js'].lineData[266] = 0;
  _$jscoverage['/picker/render.js'].lineData[267] = 0;
  _$jscoverage['/picker/render.js'].lineData[269] = 0;
}
if (! _$jscoverage['/picker/render.js'].functionData) {
  _$jscoverage['/picker/render.js'].functionData = [];
  _$jscoverage['/picker/render.js'].functionData[0] = 0;
  _$jscoverage['/picker/render.js'].functionData[1] = 0;
  _$jscoverage['/picker/render.js'].functionData[2] = 0;
  _$jscoverage['/picker/render.js'].functionData[3] = 0;
  _$jscoverage['/picker/render.js'].functionData[4] = 0;
  _$jscoverage['/picker/render.js'].functionData[5] = 0;
  _$jscoverage['/picker/render.js'].functionData[6] = 0;
  _$jscoverage['/picker/render.js'].functionData[7] = 0;
  _$jscoverage['/picker/render.js'].functionData[8] = 0;
  _$jscoverage['/picker/render.js'].functionData[9] = 0;
  _$jscoverage['/picker/render.js'].functionData[10] = 0;
  _$jscoverage['/picker/render.js'].functionData[11] = 0;
  _$jscoverage['/picker/render.js'].functionData[12] = 0;
  _$jscoverage['/picker/render.js'].functionData[13] = 0;
}
if (! _$jscoverage['/picker/render.js'].branchData) {
  _$jscoverage['/picker/render.js'].branchData = {};
  _$jscoverage['/picker/render.js'].branchData['29'] = [];
  _$jscoverage['/picker/render.js'].branchData['29'][1] = new BranchData();
  _$jscoverage['/picker/render.js'].branchData['29'][2] = new BranchData();
  _$jscoverage['/picker/render.js'].branchData['30'] = [];
  _$jscoverage['/picker/render.js'].branchData['30'][1] = new BranchData();
  _$jscoverage['/picker/render.js'].branchData['30'][2] = new BranchData();
  _$jscoverage['/picker/render.js'].branchData['31'] = [];
  _$jscoverage['/picker/render.js'].branchData['31'][1] = new BranchData();
  _$jscoverage['/picker/render.js'].branchData['35'] = [];
  _$jscoverage['/picker/render.js'].branchData['35'][1] = new BranchData();
  _$jscoverage['/picker/render.js'].branchData['35'][2] = new BranchData();
  _$jscoverage['/picker/render.js'].branchData['36'] = [];
  _$jscoverage['/picker/render.js'].branchData['36'][1] = new BranchData();
  _$jscoverage['/picker/render.js'].branchData['40'] = [];
  _$jscoverage['/picker/render.js'].branchData['40'][1] = new BranchData();
  _$jscoverage['/picker/render.js'].branchData['43'] = [];
  _$jscoverage['/picker/render.js'].branchData['43'][1] = new BranchData();
  _$jscoverage['/picker/render.js'].branchData['43'][2] = new BranchData();
  _$jscoverage['/picker/render.js'].branchData['44'] = [];
  _$jscoverage['/picker/render.js'].branchData['44'][1] = new BranchData();
  _$jscoverage['/picker/render.js'].branchData['48'] = [];
  _$jscoverage['/picker/render.js'].branchData['48'][1] = new BranchData();
  _$jscoverage['/picker/render.js'].branchData['51'] = [];
  _$jscoverage['/picker/render.js'].branchData['51'][1] = new BranchData();
  _$jscoverage['/picker/render.js'].branchData['51'][2] = new BranchData();
  _$jscoverage['/picker/render.js'].branchData['52'] = [];
  _$jscoverage['/picker/render.js'].branchData['52'][1] = new BranchData();
  _$jscoverage['/picker/render.js'].branchData['100'] = [];
  _$jscoverage['/picker/render.js'].branchData['100'][1] = new BranchData();
  _$jscoverage['/picker/render.js'].branchData['154'] = [];
  _$jscoverage['/picker/render.js'].branchData['154'][1] = new BranchData();
  _$jscoverage['/picker/render.js'].branchData['155'] = [];
  _$jscoverage['/picker/render.js'].branchData['155'][1] = new BranchData();
  _$jscoverage['/picker/render.js'].branchData['157'] = [];
  _$jscoverage['/picker/render.js'].branchData['157'][1] = new BranchData();
  _$jscoverage['/picker/render.js'].branchData['167'] = [];
  _$jscoverage['/picker/render.js'].branchData['167'][1] = new BranchData();
  _$jscoverage['/picker/render.js'].branchData['169'] = [];
  _$jscoverage['/picker/render.js'].branchData['169'][1] = new BranchData();
  _$jscoverage['/picker/render.js'].branchData['175'] = [];
  _$jscoverage['/picker/render.js'].branchData['175'][1] = new BranchData();
  _$jscoverage['/picker/render.js'].branchData['181'] = [];
  _$jscoverage['/picker/render.js'].branchData['181'][1] = new BranchData();
  _$jscoverage['/picker/render.js'].branchData['184'] = [];
  _$jscoverage['/picker/render.js'].branchData['184'][1] = new BranchData();
  _$jscoverage['/picker/render.js'].branchData['188'] = [];
  _$jscoverage['/picker/render.js'].branchData['188'][1] = new BranchData();
  _$jscoverage['/picker/render.js'].branchData['191'] = [];
  _$jscoverage['/picker/render.js'].branchData['191'][1] = new BranchData();
  _$jscoverage['/picker/render.js'].branchData['194'] = [];
  _$jscoverage['/picker/render.js'].branchData['194'][1] = new BranchData();
  _$jscoverage['/picker/render.js'].branchData['200'] = [];
  _$jscoverage['/picker/render.js'].branchData['200'][1] = new BranchData();
  _$jscoverage['/picker/render.js'].branchData['234'] = [];
  _$jscoverage['/picker/render.js'].branchData['234'][1] = new BranchData();
  _$jscoverage['/picker/render.js'].branchData['249'] = [];
  _$jscoverage['/picker/render.js'].branchData['249'][1] = new BranchData();
  _$jscoverage['/picker/render.js'].branchData['255'] = [];
  _$jscoverage['/picker/render.js'].branchData['255'][1] = new BranchData();
}
_$jscoverage['/picker/render.js'].branchData['255'][1].init(341, 42, 'disabledDate && disabledDate(value, value)');
function visit43_255_1(result) {
  _$jscoverage['/picker/render.js'].branchData['255'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/render.js'].branchData['249'][1].init(98, 28, 'isSameMonth(preValue, value)');
function visit42_249_1(result) {
  _$jscoverage['/picker/render.js'].branchData['249'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/render.js'].branchData['234'][1].init(267, 1, 'v');
function visit41_234_1(result) {
  _$jscoverage['/picker/render.js'].branchData['234'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/render.js'].branchData['200'][1].init(1043, 53, 'dateRender && (dateHtml = dateRender(current, value))');
function visit40_200_1(result) {
  _$jscoverage['/picker/render.js'].branchData['200'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/render.js'].branchData['194'][1].init(810, 44, 'disabledDate && disabledDate(current, value)');
function visit39_194_1(result) {
  _$jscoverage['/picker/render.js'].branchData['194'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/render.js'].branchData['191'][1].init(664, 37, 'afterCurrentMonthYear(current, value)');
function visit38_191_1(result) {
  _$jscoverage['/picker/render.js'].branchData['191'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/render.js'].branchData['188'][1].init(517, 38, 'beforeCurrentMonthYear(current, value)');
function visit37_188_1(result) {
  _$jscoverage['/picker/render.js'].branchData['188'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/render.js'].branchData['184'][1].init(333, 37, '!isClear && isSameDay(current, value)');
function visit36_184_1(result) {
  _$jscoverage['/picker/render.js'].branchData['184'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/render.js'].branchData['181'][1].init(206, 25, 'isSameDay(current, today)');
function visit35_181_1(result) {
  _$jscoverage['/picker/render.js'].branchData['181'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/render.js'].branchData['175'][1].init(346, 18, 'j < DATE_COL_COUNT');
function visit34_175_1(result) {
  _$jscoverage['/picker/render.js'].branchData['175'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/render.js'].branchData['169'][1].init(70, 14, 'showWeekNumber');
function visit33_169_1(result) {
  _$jscoverage['/picker/render.js'].branchData['169'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/render.js'].branchData['167'][1].init(2183, 18, 'i < DATE_ROW_COUNT');
function visit32_167_1(result) {
  _$jscoverage['/picker/render.js'].branchData['167'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/render.js'].branchData['157'][1].init(69, 6, 'passed');
function visit31_157_1(result) {
  _$jscoverage['/picker/render.js'].branchData['157'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/render.js'].branchData['155'][1].init(30, 18, 'j < DATE_COL_COUNT');
function visit30_155_1(result) {
  _$jscoverage['/picker/render.js'].branchData['155'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/render.js'].branchData['154'][1].init(1697, 18, 'i < DATE_ROW_COUNT');
function visit29_154_1(result) {
  _$jscoverage['/picker/render.js'].branchData['154'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/render.js'].branchData['100'][1].init(1063, 18, 'i < DATE_COL_COUNT');
function visit28_100_1(result) {
  _$jscoverage['/picker/render.js'].branchData['100'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/render.js'].branchData['52'][1].init(52, 37, 'current.getMonth() > today.getMonth()');
function visit27_52_1(result) {
  _$jscoverage['/picker/render.js'].branchData['52'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/render.js'].branchData['51'][2].init(103, 36, 'current.getYear() == today.getYear()');
function visit26_51_2(result) {
  _$jscoverage['/picker/render.js'].branchData['51'][2].ranCondition(result);
  return result;
}_$jscoverage['/picker/render.js'].branchData['51'][1].init(103, 90, 'current.getYear() == today.getYear() && current.getMonth() > today.getMonth()');
function visit25_51_1(result) {
  _$jscoverage['/picker/render.js'].branchData['51'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/render.js'].branchData['48'][1].init(14, 35, 'current.getYear() > today.getYear()');
function visit24_48_1(result) {
  _$jscoverage['/picker/render.js'].branchData['48'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/render.js'].branchData['44'][1].init(52, 37, 'current.getMonth() < today.getMonth()');
function visit23_44_1(result) {
  _$jscoverage['/picker/render.js'].branchData['44'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/render.js'].branchData['43'][2].init(103, 36, 'current.getYear() == today.getYear()');
function visit22_43_2(result) {
  _$jscoverage['/picker/render.js'].branchData['43'][2].ranCondition(result);
  return result;
}_$jscoverage['/picker/render.js'].branchData['43'][1].init(103, 90, 'current.getYear() == today.getYear() && current.getMonth() < today.getMonth()');
function visit21_43_1(result) {
  _$jscoverage['/picker/render.js'].branchData['43'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/render.js'].branchData['40'][1].init(14, 35, 'current.getYear() < today.getYear()');
function visit20_40_1(result) {
  _$jscoverage['/picker/render.js'].branchData['40'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/render.js'].branchData['36'][1].init(46, 32, 'one.getMonth() == two.getMonth()');
function visit19_36_1(result) {
  _$jscoverage['/picker/render.js'].branchData['36'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/render.js'].branchData['35'][2].init(17, 30, 'one.getYear() == two.getYear()');
function visit18_35_2(result) {
  _$jscoverage['/picker/render.js'].branchData['35'][2].ranCondition(result);
  return result;
}_$jscoverage['/picker/render.js'].branchData['35'][1].init(17, 79, 'one.getYear() == two.getYear() && one.getMonth() == two.getMonth()');
function visit17_35_1(result) {
  _$jscoverage['/picker/render.js'].branchData['35'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/render.js'].branchData['31'][1].init(48, 42, 'one.getDayOfMonth() == two.getDayOfMonth()');
function visit16_31_1(result) {
  _$jscoverage['/picker/render.js'].branchData['31'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/render.js'].branchData['30'][2].init(66, 32, 'one.getMonth() == two.getMonth()');
function visit15_30_2(result) {
  _$jscoverage['/picker/render.js'].branchData['30'][2].ranCondition(result);
  return result;
}_$jscoverage['/picker/render.js'].branchData['30'][1].init(46, 91, 'one.getMonth() == two.getMonth() && one.getDayOfMonth() == two.getDayOfMonth()');
function visit14_30_1(result) {
  _$jscoverage['/picker/render.js'].branchData['30'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/render.js'].branchData['29'][2].init(17, 30, 'one.getYear() == two.getYear()');
function visit13_29_2(result) {
  _$jscoverage['/picker/render.js'].branchData['29'][2].ranCondition(result);
  return result;
}_$jscoverage['/picker/render.js'].branchData['29'][1].init(17, 138, 'one.getYear() == two.getYear() && one.getMonth() == two.getMonth() && one.getDayOfMonth() == two.getDayOfMonth()');
function visit12_29_1(result) {
  _$jscoverage['/picker/render.js'].branchData['29'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/render.js'].lineData[5]++;
KISSY.add('date/picker/render', function(S, Node, Control, DateTimeFormat, PickerTpl) {
  _$jscoverage['/picker/render.js'].functionData[0]++;
  _$jscoverage['/picker/render.js'].lineData[6]++;
  var dateRowTplStart = '<tr role="row">';
  _$jscoverage['/picker/render.js'].lineData[7]++;
  var dateRowTplEnd = '</tr>';
  _$jscoverage['/picker/render.js'].lineData[8]++;
  var dateCellTpl = '<td role="gridcell" data-index="{index}" title="{title}" class="{cls}">{content}</td>';
  _$jscoverage['/picker/render.js'].lineData[9]++;
  var weekNumberCellTpl = '<td role="gridcell" class="{cls}">{content}</td>';
  _$jscoverage['/picker/render.js'].lineData[10]++;
  var dateTpl = '<a ' + ' id="{id}" ' + ' hidefocus="on" ' + ' unselectable="on" ' + ' tabindex="-1" ' + ' class="{cls}" ' + ' href="#" ' + ' aria-selected="{selected}" ' + ' aria-disabled="{disabled}">{content}</a>';
  _$jscoverage['/picker/render.js'].lineData[19]++;
  var DATE_ROW_COUNT = 6;
  _$jscoverage['/picker/render.js'].lineData[20]++;
  var DATE_COL_COUNT = 7;
  _$jscoverage['/picker/render.js'].lineData[22]++;
  function getIdFromDate(d) {
    _$jscoverage['/picker/render.js'].functionData[1]++;
    _$jscoverage['/picker/render.js'].lineData[23]++;
    return 'ks-date-picker-date-' + d.getYear() + '-' + d.getMonth() + '-' + d.getDayOfMonth();
  }
  _$jscoverage['/picker/render.js'].lineData[28]++;
  function isSameDay(one, two) {
    _$jscoverage['/picker/render.js'].functionData[2]++;
    _$jscoverage['/picker/render.js'].lineData[29]++;
    return visit12_29_1(visit13_29_2(one.getYear() == two.getYear()) && visit14_30_1(visit15_30_2(one.getMonth() == two.getMonth()) && visit16_31_1(one.getDayOfMonth() == two.getDayOfMonth())));
  }
  _$jscoverage['/picker/render.js'].lineData[34]++;
  function isSameMonth(one, two) {
    _$jscoverage['/picker/render.js'].functionData[3]++;
    _$jscoverage['/picker/render.js'].lineData[35]++;
    return visit17_35_1(visit18_35_2(one.getYear() == two.getYear()) && visit19_36_1(one.getMonth() == two.getMonth()));
  }
  _$jscoverage['/picker/render.js'].lineData[39]++;
  function beforeCurrentMonthYear(current, today) {
    _$jscoverage['/picker/render.js'].functionData[4]++;
    _$jscoverage['/picker/render.js'].lineData[40]++;
    if (visit20_40_1(current.getYear() < today.getYear())) {
      _$jscoverage['/picker/render.js'].lineData[41]++;
      return 1;
    }
    _$jscoverage['/picker/render.js'].lineData[43]++;
    return visit21_43_1(visit22_43_2(current.getYear() == today.getYear()) && visit23_44_1(current.getMonth() < today.getMonth()));
  }
  _$jscoverage['/picker/render.js'].lineData[47]++;
  function afterCurrentMonthYear(current, today) {
    _$jscoverage['/picker/render.js'].functionData[5]++;
    _$jscoverage['/picker/render.js'].lineData[48]++;
    if (visit24_48_1(current.getYear() > today.getYear())) {
      _$jscoverage['/picker/render.js'].lineData[49]++;
      return 1;
    }
    _$jscoverage['/picker/render.js'].lineData[51]++;
    return visit25_51_1(visit26_51_2(current.getYear() == today.getYear()) && visit27_52_1(current.getMonth() > today.getMonth()));
  }
  _$jscoverage['/picker/render.js'].lineData[55]++;
  function renderDatesCmd() {
    _$jscoverage['/picker/render.js'].functionData[6]++;
    _$jscoverage['/picker/render.js'].lineData[56]++;
    return this.config.view.renderDates();
  }
  _$jscoverage['/picker/render.js'].lineData[59]++;
  return Control.getDefaultRender().extend({
  getMonthYearLabel: function() {
  _$jscoverage['/picker/render.js'].functionData[7]++;
  _$jscoverage['/picker/render.js'].lineData[61]++;
  var self = this;
  _$jscoverage['/picker/render.js'].lineData[62]++;
  var control = self.control;
  _$jscoverage['/picker/render.js'].lineData[63]++;
  var locale = control.get('locale');
  _$jscoverage['/picker/render.js'].lineData[64]++;
  var value = control.get('value');
  _$jscoverage['/picker/render.js'].lineData[65]++;
  var dateLocale = value.getLocale();
  _$jscoverage['/picker/render.js'].lineData[66]++;
  return new DateTimeFormat(locale.monthYearFormat, dateLocale).format(value);
}, 
  getTodayTimeLabel: function() {
  _$jscoverage['/picker/render.js'].functionData[8]++;
  _$jscoverage['/picker/render.js'].lineData[70]++;
  var self = this;
  _$jscoverage['/picker/render.js'].lineData[71]++;
  var control = self.control;
  _$jscoverage['/picker/render.js'].lineData[72]++;
  var locale = control.get('locale');
  _$jscoverage['/picker/render.js'].lineData[73]++;
  var value = control.get('value');
  _$jscoverage['/picker/render.js'].lineData[74]++;
  var dateLocale = value.getLocale();
  _$jscoverage['/picker/render.js'].lineData[75]++;
  var today = value.clone();
  _$jscoverage['/picker/render.js'].lineData[76]++;
  today.setTime(S.now());
  _$jscoverage['/picker/render.js'].lineData[77]++;
  return new DateTimeFormat(locale.dateFormat, dateLocale).format(today);
}, 
  beforeCreateDom: function(renderData, childrenSelectors, renderCommands) {
  _$jscoverage['/picker/render.js'].functionData[9]++;
  _$jscoverage['/picker/render.js'].lineData[81]++;
  var self = this;
  _$jscoverage['/picker/render.js'].lineData[82]++;
  var control = self.control;
  _$jscoverage['/picker/render.js'].lineData[83]++;
  var locale = control.get('locale');
  _$jscoverage['/picker/render.js'].lineData[84]++;
  var value = control.get('value');
  _$jscoverage['/picker/render.js'].lineData[85]++;
  var dateLocale = value.getLocale();
  _$jscoverage['/picker/render.js'].lineData[86]++;
  S.mix(childrenSelectors, {
  monthSelectEl: '#ks-date-picker-month-select-{id}', 
  monthSelectContentEl: '#ks-date-picker-month-select-content-{id}', 
  previousMonthBtn: '#ks-date-picker-previous-month-btn-{id}', 
  nextMonthBtn: '#ks-date-picker-next-month-btn-{id}', 
  previousYearBtn: '#ks-date-picker-previous-year-btn-{id}', 
  nextYearBtn: '#ks-date-picker-next-year-btn-{id}', 
  todayBtnEl: '#ks-date-picker-today-btn-{id}', 
  clearBtnEl: '#ks-date-picker-clear-btn-{id}', 
  tbodyEl: '#ks-date-picker-tbody-{id}'});
  _$jscoverage['/picker/render.js'].lineData[97]++;
  var veryShortWeekdays = [];
  _$jscoverage['/picker/render.js'].lineData[98]++;
  var weekDays = [];
  _$jscoverage['/picker/render.js'].lineData[99]++;
  var firstDayOfWeek = value.getFirstDayOfWeek();
  _$jscoverage['/picker/render.js'].lineData[100]++;
  for (var i = 0; visit28_100_1(i < DATE_COL_COUNT); i++) {
    _$jscoverage['/picker/render.js'].lineData[101]++;
    var index = (firstDayOfWeek + i) % DATE_COL_COUNT;
    _$jscoverage['/picker/render.js'].lineData[102]++;
    veryShortWeekdays[i] = locale.veryShortWeekdays[index];
    _$jscoverage['/picker/render.js'].lineData[103]++;
    weekDays[i] = dateLocale.weekdays[index];
  }
  _$jscoverage['/picker/render.js'].lineData[105]++;
  S.mix(renderData, {
  monthSelectLabel: locale.monthSelect, 
  monthYearLabel: self.getMonthYearLabel(), 
  previousMonthLabel: locale.previousMonth, 
  nextMonthLabel: locale.nextMonth, 
  previousYearLabel: locale.previousYear, 
  nextYearLabel: locale.nextYear, 
  weekdays: weekDays, 
  veryShortWeekdays: veryShortWeekdays, 
  todayLabel: locale.today, 
  clearLabel: locale.clear, 
  todayTimeLabel: self.getTodayTimeLabel()});
  _$jscoverage['/picker/render.js'].lineData[118]++;
  renderCommands.renderDates = renderDatesCmd;
}, 
  renderDates: function() {
  _$jscoverage['/picker/render.js'].functionData[10]++;
  _$jscoverage['/picker/render.js'].lineData[122]++;
  var self = this, i, j, dateTable = [], current, control = self.control, isClear = control.get('clear'), showWeekNumber = control.get('showWeekNumber'), locale = control.get('locale'), value = control.get('value'), today = value.clone(), cellClass = self.getBaseCssClasses('cell'), weekNumberCellClass = self.getBaseCssClasses('week-number-cell'), dateClass = self.getBaseCssClasses('date'), dateRender = control.get('dateRender'), disabledDate = control.get('disabledDate'), dateLocale = value.getLocale(), dateFormatter = new DateTimeFormat(locale.dateFormat, dateLocale), todayClass = self.getBaseCssClasses('today'), selectedClass = self.getBaseCssClasses('selected-day'), lastMonthDayClass = self.getBaseCssClasses('last-month-cell'), nextMonthDayClass = self.getBaseCssClasses('next-month-btn-day'), disabledClass = self.getBaseCssClasses('disabled-cell');
  _$jscoverage['/picker/render.js'].lineData[145]++;
  today.setTime(S.now());
  _$jscoverage['/picker/render.js'].lineData[146]++;
  var month1 = value.clone();
  _$jscoverage['/picker/render.js'].lineData[147]++;
  month1.set(value.getYear(), value.getMonth(), 1);
  _$jscoverage['/picker/render.js'].lineData[148]++;
  var day = month1.getDayOfWeek();
  _$jscoverage['/picker/render.js'].lineData[149]++;
  var lastMonthDiffDay = (day + 7 - value.getFirstDayOfWeek()) % 7;
  _$jscoverage['/picker/render.js'].lineData[151]++;
  var lastMonth1 = month1.clone();
  _$jscoverage['/picker/render.js'].lineData[152]++;
  lastMonth1.addDayOfMonth(-lastMonthDiffDay);
  _$jscoverage['/picker/render.js'].lineData[153]++;
  var passed = 0;
  _$jscoverage['/picker/render.js'].lineData[154]++;
  for (i = 0; visit29_154_1(i < DATE_ROW_COUNT); i++) {
    _$jscoverage['/picker/render.js'].lineData[155]++;
    for (j = 0; visit30_155_1(j < DATE_COL_COUNT); j++) {
      _$jscoverage['/picker/render.js'].lineData[156]++;
      current = lastMonth1;
      _$jscoverage['/picker/render.js'].lineData[157]++;
      if (visit31_157_1(passed)) {
        _$jscoverage['/picker/render.js'].lineData[158]++;
        current = current.clone();
        _$jscoverage['/picker/render.js'].lineData[159]++;
        current.addDayOfMonth(passed);
      }
      _$jscoverage['/picker/render.js'].lineData[161]++;
      dateTable.push(current);
      _$jscoverage['/picker/render.js'].lineData[162]++;
      passed++;
    }
  }
  _$jscoverage['/picker/render.js'].lineData[165]++;
  var tableHtml = '';
  _$jscoverage['/picker/render.js'].lineData[166]++;
  passed = 0;
  _$jscoverage['/picker/render.js'].lineData[167]++;
  for (i = 0; visit32_167_1(i < DATE_ROW_COUNT); i++) {
    _$jscoverage['/picker/render.js'].lineData[168]++;
    var rowHtml = dateRowTplStart;
    _$jscoverage['/picker/render.js'].lineData[169]++;
    if (visit33_169_1(showWeekNumber)) {
      _$jscoverage['/picker/render.js'].lineData[170]++;
      rowHtml += S.substitute(weekNumberCellTpl, {
  cls: weekNumberCellClass, 
  content: dateTable[passed].getWeekOfYear()});
    }
    _$jscoverage['/picker/render.js'].lineData[175]++;
    for (j = 0; visit34_175_1(j < DATE_COL_COUNT); j++) {
      _$jscoverage['/picker/render.js'].lineData[176]++;
      current = dateTable[passed];
      _$jscoverage['/picker/render.js'].lineData[177]++;
      var cls = cellClass;
      _$jscoverage['/picker/render.js'].lineData[178]++;
      var disabled = false;
      _$jscoverage['/picker/render.js'].lineData[179]++;
      var selected = false;
      _$jscoverage['/picker/render.js'].lineData[181]++;
      if (visit35_181_1(isSameDay(current, today))) {
        _$jscoverage['/picker/render.js'].lineData[182]++;
        cls += ' ' + todayClass;
      }
      _$jscoverage['/picker/render.js'].lineData[184]++;
      if (visit36_184_1(!isClear && isSameDay(current, value))) {
        _$jscoverage['/picker/render.js'].lineData[185]++;
        cls += ' ' + selectedClass;
        _$jscoverage['/picker/render.js'].lineData[186]++;
        selected = true;
      }
      _$jscoverage['/picker/render.js'].lineData[188]++;
      if (visit37_188_1(beforeCurrentMonthYear(current, value))) {
        _$jscoverage['/picker/render.js'].lineData[189]++;
        cls += ' ' + lastMonthDayClass;
      }
      _$jscoverage['/picker/render.js'].lineData[191]++;
      if (visit38_191_1(afterCurrentMonthYear(current, value))) {
        _$jscoverage['/picker/render.js'].lineData[192]++;
        cls += ' ' + nextMonthDayClass;
      }
      _$jscoverage['/picker/render.js'].lineData[194]++;
      if (visit39_194_1(disabledDate && disabledDate(current, value))) {
        _$jscoverage['/picker/render.js'].lineData[195]++;
        cls += ' ' + disabledClass;
        _$jscoverage['/picker/render.js'].lineData[196]++;
        disabled = true;
      }
      _$jscoverage['/picker/render.js'].lineData[199]++;
      var dateHtml = '';
      _$jscoverage['/picker/render.js'].lineData[200]++;
      if (visit40_200_1(dateRender && (dateHtml = dateRender(current, value)))) {
      } else {
        _$jscoverage['/picker/render.js'].lineData[202]++;
        dateHtml = S.substitute(dateTpl, {
  cls: dateClass, 
  id: getIdFromDate(current), 
  selected: selected, 
  disabled: disabled, 
  content: current.getDayOfMonth()});
      }
      _$jscoverage['/picker/render.js'].lineData[210]++;
      rowHtml += S.substitute(dateCellTpl, {
  cls: cls, 
  index: passed, 
  title: dateFormatter.format(current), 
  content: dateHtml});
      _$jscoverage['/picker/render.js'].lineData[216]++;
      passed++;
    }
    _$jscoverage['/picker/render.js'].lineData[218]++;
    tableHtml += rowHtml + dateRowTplEnd;
  }
  _$jscoverage['/picker/render.js'].lineData[220]++;
  control.dateTable = dateTable;
  _$jscoverage['/picker/render.js'].lineData[221]++;
  return tableHtml;
}, 
  createDom: function() {
  _$jscoverage['/picker/render.js'].functionData[11]++;
  _$jscoverage['/picker/render.js'].lineData[225]++;
  this.$el.attr('aria-activedescendant', getIdFromDate(this.control.get('value')));
}, 
  '_onSetClear': function(v) {
  _$jscoverage['/picker/render.js'].functionData[12]++;
  _$jscoverage['/picker/render.js'].lineData[229]++;
  var control = this.control;
  _$jscoverage['/picker/render.js'].lineData[230]++;
  var value = control.get('value');
  _$jscoverage['/picker/render.js'].lineData[231]++;
  var selectedCls = this.getBaseCssClasses('selected-day');
  _$jscoverage['/picker/render.js'].lineData[232]++;
  var id = getIdFromDate(value);
  _$jscoverage['/picker/render.js'].lineData[233]++;
  var currentA = this.$('#' + id);
  _$jscoverage['/picker/render.js'].lineData[234]++;
  if (visit41_234_1(v)) {
    _$jscoverage['/picker/render.js'].lineData[235]++;
    currentA.parent().removeClass(selectedCls);
    _$jscoverage['/picker/render.js'].lineData[236]++;
    currentA.attr('aria-selected', false);
    _$jscoverage['/picker/render.js'].lineData[237]++;
    this.$el.attr('aria-activedescendant', '');
  } else {
    _$jscoverage['/picker/render.js'].lineData[239]++;
    currentA.parent().addClass(selectedCls);
    _$jscoverage['/picker/render.js'].lineData[240]++;
    currentA.attr('aria-selected', true);
    _$jscoverage['/picker/render.js'].lineData[241]++;
    this.$el.attr('aria-activedescendant', id);
  }
}, 
  _onSetValue: function(value, e) {
  _$jscoverage['/picker/render.js'].functionData[13]++;
  _$jscoverage['/picker/render.js'].lineData[247]++;
  var control = this.control;
  _$jscoverage['/picker/render.js'].lineData[248]++;
  var preValue = e.prevVal;
  _$jscoverage['/picker/render.js'].lineData[249]++;
  if (visit42_249_1(isSameMonth(preValue, value))) {
    _$jscoverage['/picker/render.js'].lineData[250]++;
    var disabledDate = control.get('disabledDate');
    _$jscoverage['/picker/render.js'].lineData[251]++;
    var selectedCls = this.getBaseCssClasses('selected-day');
    _$jscoverage['/picker/render.js'].lineData[252]++;
    var prevA = this.$('#' + getIdFromDate(preValue));
    _$jscoverage['/picker/render.js'].lineData[253]++;
    prevA.parent().removeClass(selectedCls);
    _$jscoverage['/picker/render.js'].lineData[254]++;
    prevA.attr('aria-selected', false);
    _$jscoverage['/picker/render.js'].lineData[255]++;
    if (visit43_255_1(disabledDate && disabledDate(value, value))) {
    } else {
      _$jscoverage['/picker/render.js'].lineData[257]++;
      var currentA = this.$('#' + getIdFromDate(value));
      _$jscoverage['/picker/render.js'].lineData[258]++;
      currentA.parent().addClass(selectedCls);
      _$jscoverage['/picker/render.js'].lineData[259]++;
      currentA.attr('aria-selected', true);
    }
  } else {
    _$jscoverage['/picker/render.js'].lineData[262]++;
    var tbodyEl = control.get('tbodyEl');
    _$jscoverage['/picker/render.js'].lineData[263]++;
    var monthSelectContentEl = control.get('monthSelectContentEl');
    _$jscoverage['/picker/render.js'].lineData[264]++;
    var todayBtnEl = control.get('todayBtnEl');
    _$jscoverage['/picker/render.js'].lineData[265]++;
    monthSelectContentEl.html(this.getMonthYearLabel());
    _$jscoverage['/picker/render.js'].lineData[266]++;
    todayBtnEl.attr('title', this.getTodayTimeLabel());
    _$jscoverage['/picker/render.js'].lineData[267]++;
    tbodyEl.html(this.renderDates());
  }
  _$jscoverage['/picker/render.js'].lineData[269]++;
  this.$el.attr('aria-activedescendant', getIdFromDate(value));
}}, {
  name: 'date-picker-render', 
  ATTRS: {
  contentTpl: {
  value: PickerTpl}}});
}, {
  requires: ['node', 'component/control', 'date/format', './picker-tpl']});
