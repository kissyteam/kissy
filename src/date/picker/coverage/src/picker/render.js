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
  _$jscoverage['/picker/render.js'].lineData[6] = 0;
  _$jscoverage['/picker/render.js'].lineData[7] = 0;
  _$jscoverage['/picker/render.js'].lineData[8] = 0;
  _$jscoverage['/picker/render.js'].lineData[9] = 0;
  _$jscoverage['/picker/render.js'].lineData[10] = 0;
  _$jscoverage['/picker/render.js'].lineData[11] = 0;
  _$jscoverage['/picker/render.js'].lineData[20] = 0;
  _$jscoverage['/picker/render.js'].lineData[21] = 0;
  _$jscoverage['/picker/render.js'].lineData[23] = 0;
  _$jscoverage['/picker/render.js'].lineData[24] = 0;
  _$jscoverage['/picker/render.js'].lineData[29] = 0;
  _$jscoverage['/picker/render.js'].lineData[30] = 0;
  _$jscoverage['/picker/render.js'].lineData[35] = 0;
  _$jscoverage['/picker/render.js'].lineData[36] = 0;
  _$jscoverage['/picker/render.js'].lineData[40] = 0;
  _$jscoverage['/picker/render.js'].lineData[41] = 0;
  _$jscoverage['/picker/render.js'].lineData[42] = 0;
  _$jscoverage['/picker/render.js'].lineData[44] = 0;
  _$jscoverage['/picker/render.js'].lineData[48] = 0;
  _$jscoverage['/picker/render.js'].lineData[49] = 0;
  _$jscoverage['/picker/render.js'].lineData[50] = 0;
  _$jscoverage['/picker/render.js'].lineData[52] = 0;
  _$jscoverage['/picker/render.js'].lineData[56] = 0;
  _$jscoverage['/picker/render.js'].lineData[57] = 0;
  _$jscoverage['/picker/render.js'].lineData[60] = 0;
  _$jscoverage['/picker/render.js'].lineData[62] = 0;
  _$jscoverage['/picker/render.js'].lineData[63] = 0;
  _$jscoverage['/picker/render.js'].lineData[64] = 0;
  _$jscoverage['/picker/render.js'].lineData[65] = 0;
  _$jscoverage['/picker/render.js'].lineData[66] = 0;
  _$jscoverage['/picker/render.js'].lineData[67] = 0;
  _$jscoverage['/picker/render.js'].lineData[71] = 0;
  _$jscoverage['/picker/render.js'].lineData[72] = 0;
  _$jscoverage['/picker/render.js'].lineData[73] = 0;
  _$jscoverage['/picker/render.js'].lineData[74] = 0;
  _$jscoverage['/picker/render.js'].lineData[75] = 0;
  _$jscoverage['/picker/render.js'].lineData[76] = 0;
  _$jscoverage['/picker/render.js'].lineData[77] = 0;
  _$jscoverage['/picker/render.js'].lineData[78] = 0;
  _$jscoverage['/picker/render.js'].lineData[82] = 0;
  _$jscoverage['/picker/render.js'].lineData[83] = 0;
  _$jscoverage['/picker/render.js'].lineData[84] = 0;
  _$jscoverage['/picker/render.js'].lineData[85] = 0;
  _$jscoverage['/picker/render.js'].lineData[86] = 0;
  _$jscoverage['/picker/render.js'].lineData[87] = 0;
  _$jscoverage['/picker/render.js'].lineData[98] = 0;
  _$jscoverage['/picker/render.js'].lineData[99] = 0;
  _$jscoverage['/picker/render.js'].lineData[100] = 0;
  _$jscoverage['/picker/render.js'].lineData[101] = 0;
  _$jscoverage['/picker/render.js'].lineData[102] = 0;
  _$jscoverage['/picker/render.js'].lineData[103] = 0;
  _$jscoverage['/picker/render.js'].lineData[104] = 0;
  _$jscoverage['/picker/render.js'].lineData[106] = 0;
  _$jscoverage['/picker/render.js'].lineData[119] = 0;
  _$jscoverage['/picker/render.js'].lineData[123] = 0;
  _$jscoverage['/picker/render.js'].lineData[146] = 0;
  _$jscoverage['/picker/render.js'].lineData[147] = 0;
  _$jscoverage['/picker/render.js'].lineData[148] = 0;
  _$jscoverage['/picker/render.js'].lineData[149] = 0;
  _$jscoverage['/picker/render.js'].lineData[150] = 0;
  _$jscoverage['/picker/render.js'].lineData[152] = 0;
  _$jscoverage['/picker/render.js'].lineData[153] = 0;
  _$jscoverage['/picker/render.js'].lineData[154] = 0;
  _$jscoverage['/picker/render.js'].lineData[155] = 0;
  _$jscoverage['/picker/render.js'].lineData[156] = 0;
  _$jscoverage['/picker/render.js'].lineData[157] = 0;
  _$jscoverage['/picker/render.js'].lineData[158] = 0;
  _$jscoverage['/picker/render.js'].lineData[159] = 0;
  _$jscoverage['/picker/render.js'].lineData[160] = 0;
  _$jscoverage['/picker/render.js'].lineData[162] = 0;
  _$jscoverage['/picker/render.js'].lineData[163] = 0;
  _$jscoverage['/picker/render.js'].lineData[166] = 0;
  _$jscoverage['/picker/render.js'].lineData[167] = 0;
  _$jscoverage['/picker/render.js'].lineData[168] = 0;
  _$jscoverage['/picker/render.js'].lineData[169] = 0;
  _$jscoverage['/picker/render.js'].lineData[170] = 0;
  _$jscoverage['/picker/render.js'].lineData[171] = 0;
  _$jscoverage['/picker/render.js'].lineData[176] = 0;
  _$jscoverage['/picker/render.js'].lineData[177] = 0;
  _$jscoverage['/picker/render.js'].lineData[178] = 0;
  _$jscoverage['/picker/render.js'].lineData[179] = 0;
  _$jscoverage['/picker/render.js'].lineData[180] = 0;
  _$jscoverage['/picker/render.js'].lineData[182] = 0;
  _$jscoverage['/picker/render.js'].lineData[183] = 0;
  _$jscoverage['/picker/render.js'].lineData[185] = 0;
  _$jscoverage['/picker/render.js'].lineData[186] = 0;
  _$jscoverage['/picker/render.js'].lineData[187] = 0;
  _$jscoverage['/picker/render.js'].lineData[189] = 0;
  _$jscoverage['/picker/render.js'].lineData[190] = 0;
  _$jscoverage['/picker/render.js'].lineData[192] = 0;
  _$jscoverage['/picker/render.js'].lineData[193] = 0;
  _$jscoverage['/picker/render.js'].lineData[195] = 0;
  _$jscoverage['/picker/render.js'].lineData[196] = 0;
  _$jscoverage['/picker/render.js'].lineData[197] = 0;
  _$jscoverage['/picker/render.js'].lineData[200] = 0;
  _$jscoverage['/picker/render.js'].lineData[201] = 0;
  _$jscoverage['/picker/render.js'].lineData[203] = 0;
  _$jscoverage['/picker/render.js'].lineData[211] = 0;
  _$jscoverage['/picker/render.js'].lineData[217] = 0;
  _$jscoverage['/picker/render.js'].lineData[219] = 0;
  _$jscoverage['/picker/render.js'].lineData[221] = 0;
  _$jscoverage['/picker/render.js'].lineData[222] = 0;
  _$jscoverage['/picker/render.js'].lineData[226] = 0;
  _$jscoverage['/picker/render.js'].lineData[230] = 0;
  _$jscoverage['/picker/render.js'].lineData[231] = 0;
  _$jscoverage['/picker/render.js'].lineData[232] = 0;
  _$jscoverage['/picker/render.js'].lineData[233] = 0;
  _$jscoverage['/picker/render.js'].lineData[234] = 0;
  _$jscoverage['/picker/render.js'].lineData[235] = 0;
  _$jscoverage['/picker/render.js'].lineData[236] = 0;
  _$jscoverage['/picker/render.js'].lineData[237] = 0;
  _$jscoverage['/picker/render.js'].lineData[238] = 0;
  _$jscoverage['/picker/render.js'].lineData[240] = 0;
  _$jscoverage['/picker/render.js'].lineData[241] = 0;
  _$jscoverage['/picker/render.js'].lineData[242] = 0;
  _$jscoverage['/picker/render.js'].lineData[248] = 0;
  _$jscoverage['/picker/render.js'].lineData[249] = 0;
  _$jscoverage['/picker/render.js'].lineData[250] = 0;
  _$jscoverage['/picker/render.js'].lineData[251] = 0;
  _$jscoverage['/picker/render.js'].lineData[252] = 0;
  _$jscoverage['/picker/render.js'].lineData[253] = 0;
  _$jscoverage['/picker/render.js'].lineData[254] = 0;
  _$jscoverage['/picker/render.js'].lineData[255] = 0;
  _$jscoverage['/picker/render.js'].lineData[256] = 0;
  _$jscoverage['/picker/render.js'].lineData[258] = 0;
  _$jscoverage['/picker/render.js'].lineData[259] = 0;
  _$jscoverage['/picker/render.js'].lineData[260] = 0;
  _$jscoverage['/picker/render.js'].lineData[263] = 0;
  _$jscoverage['/picker/render.js'].lineData[264] = 0;
  _$jscoverage['/picker/render.js'].lineData[265] = 0;
  _$jscoverage['/picker/render.js'].lineData[266] = 0;
  _$jscoverage['/picker/render.js'].lineData[267] = 0;
  _$jscoverage['/picker/render.js'].lineData[268] = 0;
  _$jscoverage['/picker/render.js'].lineData[270] = 0;
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
  _$jscoverage['/picker/render.js'].branchData['30'] = [];
  _$jscoverage['/picker/render.js'].branchData['30'][1] = new BranchData();
  _$jscoverage['/picker/render.js'].branchData['30'][2] = new BranchData();
  _$jscoverage['/picker/render.js'].branchData['31'] = [];
  _$jscoverage['/picker/render.js'].branchData['31'][1] = new BranchData();
  _$jscoverage['/picker/render.js'].branchData['31'][2] = new BranchData();
  _$jscoverage['/picker/render.js'].branchData['32'] = [];
  _$jscoverage['/picker/render.js'].branchData['32'][1] = new BranchData();
  _$jscoverage['/picker/render.js'].branchData['36'] = [];
  _$jscoverage['/picker/render.js'].branchData['36'][1] = new BranchData();
  _$jscoverage['/picker/render.js'].branchData['36'][2] = new BranchData();
  _$jscoverage['/picker/render.js'].branchData['37'] = [];
  _$jscoverage['/picker/render.js'].branchData['37'][1] = new BranchData();
  _$jscoverage['/picker/render.js'].branchData['41'] = [];
  _$jscoverage['/picker/render.js'].branchData['41'][1] = new BranchData();
  _$jscoverage['/picker/render.js'].branchData['44'] = [];
  _$jscoverage['/picker/render.js'].branchData['44'][1] = new BranchData();
  _$jscoverage['/picker/render.js'].branchData['44'][2] = new BranchData();
  _$jscoverage['/picker/render.js'].branchData['45'] = [];
  _$jscoverage['/picker/render.js'].branchData['45'][1] = new BranchData();
  _$jscoverage['/picker/render.js'].branchData['49'] = [];
  _$jscoverage['/picker/render.js'].branchData['49'][1] = new BranchData();
  _$jscoverage['/picker/render.js'].branchData['52'] = [];
  _$jscoverage['/picker/render.js'].branchData['52'][1] = new BranchData();
  _$jscoverage['/picker/render.js'].branchData['52'][2] = new BranchData();
  _$jscoverage['/picker/render.js'].branchData['53'] = [];
  _$jscoverage['/picker/render.js'].branchData['53'][1] = new BranchData();
  _$jscoverage['/picker/render.js'].branchData['101'] = [];
  _$jscoverage['/picker/render.js'].branchData['101'][1] = new BranchData();
  _$jscoverage['/picker/render.js'].branchData['155'] = [];
  _$jscoverage['/picker/render.js'].branchData['155'][1] = new BranchData();
  _$jscoverage['/picker/render.js'].branchData['156'] = [];
  _$jscoverage['/picker/render.js'].branchData['156'][1] = new BranchData();
  _$jscoverage['/picker/render.js'].branchData['158'] = [];
  _$jscoverage['/picker/render.js'].branchData['158'][1] = new BranchData();
  _$jscoverage['/picker/render.js'].branchData['168'] = [];
  _$jscoverage['/picker/render.js'].branchData['168'][1] = new BranchData();
  _$jscoverage['/picker/render.js'].branchData['170'] = [];
  _$jscoverage['/picker/render.js'].branchData['170'][1] = new BranchData();
  _$jscoverage['/picker/render.js'].branchData['176'] = [];
  _$jscoverage['/picker/render.js'].branchData['176'][1] = new BranchData();
  _$jscoverage['/picker/render.js'].branchData['182'] = [];
  _$jscoverage['/picker/render.js'].branchData['182'][1] = new BranchData();
  _$jscoverage['/picker/render.js'].branchData['185'] = [];
  _$jscoverage['/picker/render.js'].branchData['185'][1] = new BranchData();
  _$jscoverage['/picker/render.js'].branchData['189'] = [];
  _$jscoverage['/picker/render.js'].branchData['189'][1] = new BranchData();
  _$jscoverage['/picker/render.js'].branchData['192'] = [];
  _$jscoverage['/picker/render.js'].branchData['192'][1] = new BranchData();
  _$jscoverage['/picker/render.js'].branchData['195'] = [];
  _$jscoverage['/picker/render.js'].branchData['195'][1] = new BranchData();
  _$jscoverage['/picker/render.js'].branchData['201'] = [];
  _$jscoverage['/picker/render.js'].branchData['201'][1] = new BranchData();
  _$jscoverage['/picker/render.js'].branchData['235'] = [];
  _$jscoverage['/picker/render.js'].branchData['235'][1] = new BranchData();
  _$jscoverage['/picker/render.js'].branchData['250'] = [];
  _$jscoverage['/picker/render.js'].branchData['250'][1] = new BranchData();
  _$jscoverage['/picker/render.js'].branchData['256'] = [];
  _$jscoverage['/picker/render.js'].branchData['256'][1] = new BranchData();
}
_$jscoverage['/picker/render.js'].branchData['256'][1].init(341, 42, 'disabledDate && disabledDate(value, value)');
function visit50_256_1(result) {
  _$jscoverage['/picker/render.js'].branchData['256'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/render.js'].branchData['250'][1].init(98, 28, 'isSameMonth(preValue, value)');
function visit49_250_1(result) {
  _$jscoverage['/picker/render.js'].branchData['250'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/render.js'].branchData['235'][1].init(267, 1, 'v');
function visit48_235_1(result) {
  _$jscoverage['/picker/render.js'].branchData['235'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/render.js'].branchData['201'][1].init(1043, 53, 'dateRender && (dateHtml = dateRender(current, value))');
function visit47_201_1(result) {
  _$jscoverage['/picker/render.js'].branchData['201'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/render.js'].branchData['195'][1].init(810, 44, 'disabledDate && disabledDate(current, value)');
function visit46_195_1(result) {
  _$jscoverage['/picker/render.js'].branchData['195'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/render.js'].branchData['192'][1].init(664, 37, 'afterCurrentMonthYear(current, value)');
function visit45_192_1(result) {
  _$jscoverage['/picker/render.js'].branchData['192'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/render.js'].branchData['189'][1].init(517, 38, 'beforeCurrentMonthYear(current, value)');
function visit44_189_1(result) {
  _$jscoverage['/picker/render.js'].branchData['189'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/render.js'].branchData['185'][1].init(333, 37, '!isClear && isSameDay(current, value)');
function visit43_185_1(result) {
  _$jscoverage['/picker/render.js'].branchData['185'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/render.js'].branchData['182'][1].init(206, 25, 'isSameDay(current, today)');
function visit42_182_1(result) {
  _$jscoverage['/picker/render.js'].branchData['182'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/render.js'].branchData['176'][1].init(346, 18, 'j < DATE_COL_COUNT');
function visit41_176_1(result) {
  _$jscoverage['/picker/render.js'].branchData['176'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/render.js'].branchData['170'][1].init(70, 14, 'showWeekNumber');
function visit40_170_1(result) {
  _$jscoverage['/picker/render.js'].branchData['170'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/render.js'].branchData['168'][1].init(2183, 18, 'i < DATE_ROW_COUNT');
function visit39_168_1(result) {
  _$jscoverage['/picker/render.js'].branchData['168'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/render.js'].branchData['158'][1].init(69, 6, 'passed');
function visit38_158_1(result) {
  _$jscoverage['/picker/render.js'].branchData['158'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/render.js'].branchData['156'][1].init(30, 18, 'j < DATE_COL_COUNT');
function visit37_156_1(result) {
  _$jscoverage['/picker/render.js'].branchData['156'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/render.js'].branchData['155'][1].init(1697, 18, 'i < DATE_ROW_COUNT');
function visit36_155_1(result) {
  _$jscoverage['/picker/render.js'].branchData['155'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/render.js'].branchData['101'][1].init(1063, 18, 'i < DATE_COL_COUNT');
function visit35_101_1(result) {
  _$jscoverage['/picker/render.js'].branchData['101'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/render.js'].branchData['53'][1].init(52, 37, 'current.getMonth() > today.getMonth()');
function visit34_53_1(result) {
  _$jscoverage['/picker/render.js'].branchData['53'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/render.js'].branchData['52'][2].init(103, 36, 'current.getYear() == today.getYear()');
function visit33_52_2(result) {
  _$jscoverage['/picker/render.js'].branchData['52'][2].ranCondition(result);
  return result;
}_$jscoverage['/picker/render.js'].branchData['52'][1].init(103, 90, 'current.getYear() == today.getYear() && current.getMonth() > today.getMonth()');
function visit32_52_1(result) {
  _$jscoverage['/picker/render.js'].branchData['52'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/render.js'].branchData['49'][1].init(14, 35, 'current.getYear() > today.getYear()');
function visit31_49_1(result) {
  _$jscoverage['/picker/render.js'].branchData['49'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/render.js'].branchData['45'][1].init(52, 37, 'current.getMonth() < today.getMonth()');
function visit30_45_1(result) {
  _$jscoverage['/picker/render.js'].branchData['45'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/render.js'].branchData['44'][2].init(103, 36, 'current.getYear() == today.getYear()');
function visit29_44_2(result) {
  _$jscoverage['/picker/render.js'].branchData['44'][2].ranCondition(result);
  return result;
}_$jscoverage['/picker/render.js'].branchData['44'][1].init(103, 90, 'current.getYear() == today.getYear() && current.getMonth() < today.getMonth()');
function visit28_44_1(result) {
  _$jscoverage['/picker/render.js'].branchData['44'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/render.js'].branchData['41'][1].init(14, 35, 'current.getYear() < today.getYear()');
function visit27_41_1(result) {
  _$jscoverage['/picker/render.js'].branchData['41'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/render.js'].branchData['37'][1].init(46, 32, 'one.getMonth() == two.getMonth()');
function visit26_37_1(result) {
  _$jscoverage['/picker/render.js'].branchData['37'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/render.js'].branchData['36'][2].init(17, 30, 'one.getYear() == two.getYear()');
function visit25_36_2(result) {
  _$jscoverage['/picker/render.js'].branchData['36'][2].ranCondition(result);
  return result;
}_$jscoverage['/picker/render.js'].branchData['36'][1].init(17, 79, 'one.getYear() == two.getYear() && one.getMonth() == two.getMonth()');
function visit24_36_1(result) {
  _$jscoverage['/picker/render.js'].branchData['36'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/render.js'].branchData['32'][1].init(48, 42, 'one.getDayOfMonth() == two.getDayOfMonth()');
function visit23_32_1(result) {
  _$jscoverage['/picker/render.js'].branchData['32'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/render.js'].branchData['31'][2].init(66, 32, 'one.getMonth() == two.getMonth()');
function visit22_31_2(result) {
  _$jscoverage['/picker/render.js'].branchData['31'][2].ranCondition(result);
  return result;
}_$jscoverage['/picker/render.js'].branchData['31'][1].init(46, 91, 'one.getMonth() == two.getMonth() && one.getDayOfMonth() == two.getDayOfMonth()');
function visit21_31_1(result) {
  _$jscoverage['/picker/render.js'].branchData['31'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/render.js'].branchData['30'][2].init(17, 30, 'one.getYear() == two.getYear()');
function visit20_30_2(result) {
  _$jscoverage['/picker/render.js'].branchData['30'][2].ranCondition(result);
  return result;
}_$jscoverage['/picker/render.js'].branchData['30'][1].init(17, 138, 'one.getYear() == two.getYear() && one.getMonth() == two.getMonth() && one.getDayOfMonth() == two.getDayOfMonth()');
function visit19_30_1(result) {
  _$jscoverage['/picker/render.js'].branchData['30'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/render.js'].lineData[6]++;
KISSY.add('date/picker/render', function(S, Node, Control, DateTimeFormat, PickerTpl) {
  _$jscoverage['/picker/render.js'].functionData[0]++;
  _$jscoverage['/picker/render.js'].lineData[7]++;
  var dateRowTplStart = '<tr role="row">';
  _$jscoverage['/picker/render.js'].lineData[8]++;
  var dateRowTplEnd = '</tr>';
  _$jscoverage['/picker/render.js'].lineData[9]++;
  var dateCellTpl = '<td role="gridcell" data-index="{index}" title="{title}" class="{cls}">{content}</td>';
  _$jscoverage['/picker/render.js'].lineData[10]++;
  var weekNumberCellTpl = '<td role="gridcell" class="{cls}">{content}</td>';
  _$jscoverage['/picker/render.js'].lineData[11]++;
  var dateTpl = '<a ' + ' id="{id}" ' + ' hidefocus="on" ' + ' unselectable="on" ' + ' tabindex="-1" ' + ' class="{cls}" ' + ' href="#" ' + ' aria-selected="{selected}" ' + ' aria-disabled="{disabled}">{content}</a>';
  _$jscoverage['/picker/render.js'].lineData[20]++;
  var DATE_ROW_COUNT = 6;
  _$jscoverage['/picker/render.js'].lineData[21]++;
  var DATE_COL_COUNT = 7;
  _$jscoverage['/picker/render.js'].lineData[23]++;
  function getIdFromDate(d) {
    _$jscoverage['/picker/render.js'].functionData[1]++;
    _$jscoverage['/picker/render.js'].lineData[24]++;
    return 'ks-date-picker-date-' + d.getYear() + '-' + d.getMonth() + '-' + d.getDayOfMonth();
  }
  _$jscoverage['/picker/render.js'].lineData[29]++;
  function isSameDay(one, two) {
    _$jscoverage['/picker/render.js'].functionData[2]++;
    _$jscoverage['/picker/render.js'].lineData[30]++;
    return visit19_30_1(visit20_30_2(one.getYear() == two.getYear()) && visit21_31_1(visit22_31_2(one.getMonth() == two.getMonth()) && visit23_32_1(one.getDayOfMonth() == two.getDayOfMonth())));
  }
  _$jscoverage['/picker/render.js'].lineData[35]++;
  function isSameMonth(one, two) {
    _$jscoverage['/picker/render.js'].functionData[3]++;
    _$jscoverage['/picker/render.js'].lineData[36]++;
    return visit24_36_1(visit25_36_2(one.getYear() == two.getYear()) && visit26_37_1(one.getMonth() == two.getMonth()));
  }
  _$jscoverage['/picker/render.js'].lineData[40]++;
  function beforeCurrentMonthYear(current, today) {
    _$jscoverage['/picker/render.js'].functionData[4]++;
    _$jscoverage['/picker/render.js'].lineData[41]++;
    if (visit27_41_1(current.getYear() < today.getYear())) {
      _$jscoverage['/picker/render.js'].lineData[42]++;
      return 1;
    }
    _$jscoverage['/picker/render.js'].lineData[44]++;
    return visit28_44_1(visit29_44_2(current.getYear() == today.getYear()) && visit30_45_1(current.getMonth() < today.getMonth()));
  }
  _$jscoverage['/picker/render.js'].lineData[48]++;
  function afterCurrentMonthYear(current, today) {
    _$jscoverage['/picker/render.js'].functionData[5]++;
    _$jscoverage['/picker/render.js'].lineData[49]++;
    if (visit31_49_1(current.getYear() > today.getYear())) {
      _$jscoverage['/picker/render.js'].lineData[50]++;
      return 1;
    }
    _$jscoverage['/picker/render.js'].lineData[52]++;
    return visit32_52_1(visit33_52_2(current.getYear() == today.getYear()) && visit34_53_1(current.getMonth() > today.getMonth()));
  }
  _$jscoverage['/picker/render.js'].lineData[56]++;
  function renderDatesCmd() {
    _$jscoverage['/picker/render.js'].functionData[6]++;
    _$jscoverage['/picker/render.js'].lineData[57]++;
    return this.config.view.renderDates();
  }
  _$jscoverage['/picker/render.js'].lineData[60]++;
  return Control.getDefaultRender().extend({
  getMonthYearLabel: function() {
  _$jscoverage['/picker/render.js'].functionData[7]++;
  _$jscoverage['/picker/render.js'].lineData[62]++;
  var self = this;
  _$jscoverage['/picker/render.js'].lineData[63]++;
  var control = self.control;
  _$jscoverage['/picker/render.js'].lineData[64]++;
  var locale = control.get('locale');
  _$jscoverage['/picker/render.js'].lineData[65]++;
  var value = control.get('value');
  _$jscoverage['/picker/render.js'].lineData[66]++;
  var dateLocale = value.getLocale();
  _$jscoverage['/picker/render.js'].lineData[67]++;
  return new DateTimeFormat(locale.monthYearFormat, dateLocale).format(value);
}, 
  getTodayTimeLabel: function() {
  _$jscoverage['/picker/render.js'].functionData[8]++;
  _$jscoverage['/picker/render.js'].lineData[71]++;
  var self = this;
  _$jscoverage['/picker/render.js'].lineData[72]++;
  var control = self.control;
  _$jscoverage['/picker/render.js'].lineData[73]++;
  var locale = control.get('locale');
  _$jscoverage['/picker/render.js'].lineData[74]++;
  var value = control.get('value');
  _$jscoverage['/picker/render.js'].lineData[75]++;
  var dateLocale = value.getLocale();
  _$jscoverage['/picker/render.js'].lineData[76]++;
  var today = value.clone();
  _$jscoverage['/picker/render.js'].lineData[77]++;
  today.setTime(S.now());
  _$jscoverage['/picker/render.js'].lineData[78]++;
  return new DateTimeFormat(locale.dateFormat, dateLocale).format(today);
}, 
  beforeCreateDom: function(renderData, childrenSelectors, renderCommands) {
  _$jscoverage['/picker/render.js'].functionData[9]++;
  _$jscoverage['/picker/render.js'].lineData[82]++;
  var self = this;
  _$jscoverage['/picker/render.js'].lineData[83]++;
  var control = self.control;
  _$jscoverage['/picker/render.js'].lineData[84]++;
  var locale = control.get('locale');
  _$jscoverage['/picker/render.js'].lineData[85]++;
  var value = control.get('value');
  _$jscoverage['/picker/render.js'].lineData[86]++;
  var dateLocale = value.getLocale();
  _$jscoverage['/picker/render.js'].lineData[87]++;
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
  _$jscoverage['/picker/render.js'].lineData[98]++;
  var veryShortWeekdays = [];
  _$jscoverage['/picker/render.js'].lineData[99]++;
  var weekDays = [];
  _$jscoverage['/picker/render.js'].lineData[100]++;
  var firstDayOfWeek = value.getFirstDayOfWeek();
  _$jscoverage['/picker/render.js'].lineData[101]++;
  for (var i = 0; visit35_101_1(i < DATE_COL_COUNT); i++) {
    _$jscoverage['/picker/render.js'].lineData[102]++;
    var index = (firstDayOfWeek + i) % DATE_COL_COUNT;
    _$jscoverage['/picker/render.js'].lineData[103]++;
    veryShortWeekdays[i] = locale.veryShortWeekdays[index];
    _$jscoverage['/picker/render.js'].lineData[104]++;
    weekDays[i] = dateLocale.weekdays[index];
  }
  _$jscoverage['/picker/render.js'].lineData[106]++;
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
  _$jscoverage['/picker/render.js'].lineData[119]++;
  renderCommands.renderDates = renderDatesCmd;
}, 
  renderDates: function() {
  _$jscoverage['/picker/render.js'].functionData[10]++;
  _$jscoverage['/picker/render.js'].lineData[123]++;
  var self = this, i, j, dateTable = [], current, control = self.control, isClear = control.get('clear'), showWeekNumber = control.get('showWeekNumber'), locale = control.get('locale'), value = control.get('value'), today = value.clone(), cellClass = self.getBaseCssClasses('cell'), weekNumberCellClass = self.getBaseCssClasses('week-number-cell'), dateClass = self.getBaseCssClasses('date'), dateRender = control.get('dateRender'), disabledDate = control.get('disabledDate'), dateLocale = value.getLocale(), dateFormatter = new DateTimeFormat(locale.dateFormat, dateLocale), todayClass = self.getBaseCssClasses('today'), selectedClass = self.getBaseCssClasses('selected-day'), lastMonthDayClass = self.getBaseCssClasses('last-month-cell'), nextMonthDayClass = self.getBaseCssClasses('next-month-btn-day'), disabledClass = self.getBaseCssClasses('disabled-cell');
  _$jscoverage['/picker/render.js'].lineData[146]++;
  today.setTime(S.now());
  _$jscoverage['/picker/render.js'].lineData[147]++;
  var month1 = value.clone();
  _$jscoverage['/picker/render.js'].lineData[148]++;
  month1.set(value.getYear(), value.getMonth(), 1);
  _$jscoverage['/picker/render.js'].lineData[149]++;
  var day = month1.getDayOfWeek();
  _$jscoverage['/picker/render.js'].lineData[150]++;
  var lastMonthDiffDay = (day + 7 - value.getFirstDayOfWeek()) % 7;
  _$jscoverage['/picker/render.js'].lineData[152]++;
  var lastMonth1 = month1.clone();
  _$jscoverage['/picker/render.js'].lineData[153]++;
  lastMonth1.addDayOfMonth(-lastMonthDiffDay);
  _$jscoverage['/picker/render.js'].lineData[154]++;
  var passed = 0;
  _$jscoverage['/picker/render.js'].lineData[155]++;
  for (i = 0; visit36_155_1(i < DATE_ROW_COUNT); i++) {
    _$jscoverage['/picker/render.js'].lineData[156]++;
    for (j = 0; visit37_156_1(j < DATE_COL_COUNT); j++) {
      _$jscoverage['/picker/render.js'].lineData[157]++;
      current = lastMonth1;
      _$jscoverage['/picker/render.js'].lineData[158]++;
      if (visit38_158_1(passed)) {
        _$jscoverage['/picker/render.js'].lineData[159]++;
        current = current.clone();
        _$jscoverage['/picker/render.js'].lineData[160]++;
        current.addDayOfMonth(passed);
      }
      _$jscoverage['/picker/render.js'].lineData[162]++;
      dateTable.push(current);
      _$jscoverage['/picker/render.js'].lineData[163]++;
      passed++;
    }
  }
  _$jscoverage['/picker/render.js'].lineData[166]++;
  var tableHtml = '';
  _$jscoverage['/picker/render.js'].lineData[167]++;
  passed = 0;
  _$jscoverage['/picker/render.js'].lineData[168]++;
  for (i = 0; visit39_168_1(i < DATE_ROW_COUNT); i++) {
    _$jscoverage['/picker/render.js'].lineData[169]++;
    var rowHtml = dateRowTplStart;
    _$jscoverage['/picker/render.js'].lineData[170]++;
    if (visit40_170_1(showWeekNumber)) {
      _$jscoverage['/picker/render.js'].lineData[171]++;
      rowHtml += S.substitute(weekNumberCellTpl, {
  cls: weekNumberCellClass, 
  content: dateTable[passed].getWeekOfYear()});
    }
    _$jscoverage['/picker/render.js'].lineData[176]++;
    for (j = 0; visit41_176_1(j < DATE_COL_COUNT); j++) {
      _$jscoverage['/picker/render.js'].lineData[177]++;
      current = dateTable[passed];
      _$jscoverage['/picker/render.js'].lineData[178]++;
      var cls = cellClass;
      _$jscoverage['/picker/render.js'].lineData[179]++;
      var disabled = false;
      _$jscoverage['/picker/render.js'].lineData[180]++;
      var selected = false;
      _$jscoverage['/picker/render.js'].lineData[182]++;
      if (visit42_182_1(isSameDay(current, today))) {
        _$jscoverage['/picker/render.js'].lineData[183]++;
        cls += ' ' + todayClass;
      }
      _$jscoverage['/picker/render.js'].lineData[185]++;
      if (visit43_185_1(!isClear && isSameDay(current, value))) {
        _$jscoverage['/picker/render.js'].lineData[186]++;
        cls += ' ' + selectedClass;
        _$jscoverage['/picker/render.js'].lineData[187]++;
        selected = true;
      }
      _$jscoverage['/picker/render.js'].lineData[189]++;
      if (visit44_189_1(beforeCurrentMonthYear(current, value))) {
        _$jscoverage['/picker/render.js'].lineData[190]++;
        cls += ' ' + lastMonthDayClass;
      }
      _$jscoverage['/picker/render.js'].lineData[192]++;
      if (visit45_192_1(afterCurrentMonthYear(current, value))) {
        _$jscoverage['/picker/render.js'].lineData[193]++;
        cls += ' ' + nextMonthDayClass;
      }
      _$jscoverage['/picker/render.js'].lineData[195]++;
      if (visit46_195_1(disabledDate && disabledDate(current, value))) {
        _$jscoverage['/picker/render.js'].lineData[196]++;
        cls += ' ' + disabledClass;
        _$jscoverage['/picker/render.js'].lineData[197]++;
        disabled = true;
      }
      _$jscoverage['/picker/render.js'].lineData[200]++;
      var dateHtml = '';
      _$jscoverage['/picker/render.js'].lineData[201]++;
      if (visit47_201_1(dateRender && (dateHtml = dateRender(current, value)))) {
      } else {
        _$jscoverage['/picker/render.js'].lineData[203]++;
        dateHtml = S.substitute(dateTpl, {
  cls: dateClass, 
  id: getIdFromDate(current), 
  selected: selected, 
  disabled: disabled, 
  content: current.getDayOfMonth()});
      }
      _$jscoverage['/picker/render.js'].lineData[211]++;
      rowHtml += S.substitute(dateCellTpl, {
  cls: cls, 
  index: passed, 
  title: dateFormatter.format(current), 
  content: dateHtml});
      _$jscoverage['/picker/render.js'].lineData[217]++;
      passed++;
    }
    _$jscoverage['/picker/render.js'].lineData[219]++;
    tableHtml += rowHtml + dateRowTplEnd;
  }
  _$jscoverage['/picker/render.js'].lineData[221]++;
  control.dateTable = dateTable;
  _$jscoverage['/picker/render.js'].lineData[222]++;
  return tableHtml;
}, 
  createDom: function() {
  _$jscoverage['/picker/render.js'].functionData[11]++;
  _$jscoverage['/picker/render.js'].lineData[226]++;
  this.$el.attr('aria-activedescendant', getIdFromDate(this.control.get('value')));
}, 
  '_onSetClear': function(v) {
  _$jscoverage['/picker/render.js'].functionData[12]++;
  _$jscoverage['/picker/render.js'].lineData[230]++;
  var control = this.control;
  _$jscoverage['/picker/render.js'].lineData[231]++;
  var value = control.get('value');
  _$jscoverage['/picker/render.js'].lineData[232]++;
  var selectedCls = this.getBaseCssClasses('selected-day');
  _$jscoverage['/picker/render.js'].lineData[233]++;
  var id = getIdFromDate(value);
  _$jscoverage['/picker/render.js'].lineData[234]++;
  var currentA = this.$('#' + id);
  _$jscoverage['/picker/render.js'].lineData[235]++;
  if (visit48_235_1(v)) {
    _$jscoverage['/picker/render.js'].lineData[236]++;
    currentA.parent().removeClass(selectedCls);
    _$jscoverage['/picker/render.js'].lineData[237]++;
    currentA.attr('aria-selected', false);
    _$jscoverage['/picker/render.js'].lineData[238]++;
    this.$el.attr('aria-activedescendant', '');
  } else {
    _$jscoverage['/picker/render.js'].lineData[240]++;
    currentA.parent().addClass(selectedCls);
    _$jscoverage['/picker/render.js'].lineData[241]++;
    currentA.attr('aria-selected', true);
    _$jscoverage['/picker/render.js'].lineData[242]++;
    this.$el.attr('aria-activedescendant', id);
  }
}, 
  _onSetValue: function(value, e) {
  _$jscoverage['/picker/render.js'].functionData[13]++;
  _$jscoverage['/picker/render.js'].lineData[248]++;
  var control = this.control;
  _$jscoverage['/picker/render.js'].lineData[249]++;
  var preValue = e.prevVal;
  _$jscoverage['/picker/render.js'].lineData[250]++;
  if (visit49_250_1(isSameMonth(preValue, value))) {
    _$jscoverage['/picker/render.js'].lineData[251]++;
    var disabledDate = control.get('disabledDate');
    _$jscoverage['/picker/render.js'].lineData[252]++;
    var selectedCls = this.getBaseCssClasses('selected-day');
    _$jscoverage['/picker/render.js'].lineData[253]++;
    var prevA = this.$('#' + getIdFromDate(preValue));
    _$jscoverage['/picker/render.js'].lineData[254]++;
    prevA.parent().removeClass(selectedCls);
    _$jscoverage['/picker/render.js'].lineData[255]++;
    prevA.attr('aria-selected', false);
    _$jscoverage['/picker/render.js'].lineData[256]++;
    if (visit50_256_1(disabledDate && disabledDate(value, value))) {
    } else {
      _$jscoverage['/picker/render.js'].lineData[258]++;
      var currentA = this.$('#' + getIdFromDate(value));
      _$jscoverage['/picker/render.js'].lineData[259]++;
      currentA.parent().addClass(selectedCls);
      _$jscoverage['/picker/render.js'].lineData[260]++;
      currentA.attr('aria-selected', true);
    }
  } else {
    _$jscoverage['/picker/render.js'].lineData[263]++;
    var tbodyEl = control.get('tbodyEl');
    _$jscoverage['/picker/render.js'].lineData[264]++;
    var monthSelectContentEl = control.get('monthSelectContentEl');
    _$jscoverage['/picker/render.js'].lineData[265]++;
    var todayBtnEl = control.get('todayBtnEl');
    _$jscoverage['/picker/render.js'].lineData[266]++;
    monthSelectContentEl.html(this.getMonthYearLabel());
    _$jscoverage['/picker/render.js'].lineData[267]++;
    todayBtnEl.attr('title', this.getTodayTimeLabel());
    _$jscoverage['/picker/render.js'].lineData[268]++;
    tbodyEl.html(this.renderDates());
  }
  _$jscoverage['/picker/render.js'].lineData[270]++;
  this.$el.attr('aria-activedescendant', getIdFromDate(value));
}}, {
  name: 'date-picker-render', 
  ATTRS: {
  contentTpl: {
  value: PickerTpl}}});
}, {
  requires: ['node', 'component/control', 'date/format', './picker-xtpl']});
