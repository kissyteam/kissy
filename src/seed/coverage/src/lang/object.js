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
  _$jscoverage['/lang/object.js'].lineData[8] = 0;
  _$jscoverage['/lang/object.js'].lineData[9] = 0;
  _$jscoverage['/lang/object.js'].lineData[18] = 0;
  _$jscoverage['/lang/object.js'].lineData[28] = 0;
  _$jscoverage['/lang/object.js'].lineData[29] = 0;
  _$jscoverage['/lang/object.js'].lineData[30] = 0;
  _$jscoverage['/lang/object.js'].lineData[31] = 0;
  _$jscoverage['/lang/object.js'].lineData[32] = 0;
  _$jscoverage['/lang/object.js'].lineData[33] = 0;
  _$jscoverage['/lang/object.js'].lineData[34] = 0;
  _$jscoverage['/lang/object.js'].lineData[37] = 0;
  _$jscoverage['/lang/object.js'].lineData[40] = 0;
  _$jscoverage['/lang/object.js'].lineData[67] = 0;
  _$jscoverage['/lang/object.js'].lineData[68] = 0;
  _$jscoverage['/lang/object.js'].lineData[72] = 0;
  _$jscoverage['/lang/object.js'].lineData[73] = 0;
  _$jscoverage['/lang/object.js'].lineData[76] = 0;
  _$jscoverage['/lang/object.js'].lineData[77] = 0;
  _$jscoverage['/lang/object.js'].lineData[78] = 0;
  _$jscoverage['/lang/object.js'].lineData[79] = 0;
  _$jscoverage['/lang/object.js'].lineData[83] = 0;
  _$jscoverage['/lang/object.js'].lineData[84] = 0;
  _$jscoverage['/lang/object.js'].lineData[87] = 0;
  _$jscoverage['/lang/object.js'].lineData[90] = 0;
  _$jscoverage['/lang/object.js'].lineData[91] = 0;
  _$jscoverage['/lang/object.js'].lineData[92] = 0;
  _$jscoverage['/lang/object.js'].lineData[94] = 0;
  _$jscoverage['/lang/object.js'].lineData[107] = 0;
  _$jscoverage['/lang/object.js'].lineData[108] = 0;
  _$jscoverage['/lang/object.js'].lineData[111] = 0;
  _$jscoverage['/lang/object.js'].lineData[112] = 0;
  _$jscoverage['/lang/object.js'].lineData[114] = 0;
  _$jscoverage['/lang/object.js'].lineData[127] = 0;
  _$jscoverage['/lang/object.js'].lineData[135] = 0;
  _$jscoverage['/lang/object.js'].lineData[137] = 0;
  _$jscoverage['/lang/object.js'].lineData[138] = 0;
  _$jscoverage['/lang/object.js'].lineData[139] = 0;
  _$jscoverage['/lang/object.js'].lineData[140] = 0;
  _$jscoverage['/lang/object.js'].lineData[142] = 0;
  _$jscoverage['/lang/object.js'].lineData[143] = 0;
  _$jscoverage['/lang/object.js'].lineData[144] = 0;
  _$jscoverage['/lang/object.js'].lineData[147] = 0;
  _$jscoverage['/lang/object.js'].lineData[148] = 0;
  _$jscoverage['/lang/object.js'].lineData[149] = 0;
  _$jscoverage['/lang/object.js'].lineData[150] = 0;
  _$jscoverage['/lang/object.js'].lineData[152] = 0;
  _$jscoverage['/lang/object.js'].lineData[155] = 0;
  _$jscoverage['/lang/object.js'].lineData[170] = 0;
  _$jscoverage['/lang/object.js'].lineData[171] = 0;
  _$jscoverage['/lang/object.js'].lineData[172] = 0;
  _$jscoverage['/lang/object.js'].lineData[174] = 0;
  _$jscoverage['/lang/object.js'].lineData[175] = 0;
  _$jscoverage['/lang/object.js'].lineData[177] = 0;
  _$jscoverage['/lang/object.js'].lineData[178] = 0;
  _$jscoverage['/lang/object.js'].lineData[182] = 0;
  _$jscoverage['/lang/object.js'].lineData[187] = 0;
  _$jscoverage['/lang/object.js'].lineData[190] = 0;
  _$jscoverage['/lang/object.js'].lineData[191] = 0;
  _$jscoverage['/lang/object.js'].lineData[192] = 0;
  _$jscoverage['/lang/object.js'].lineData[195] = 0;
  _$jscoverage['/lang/object.js'].lineData[196] = 0;
  _$jscoverage['/lang/object.js'].lineData[200] = 0;
  _$jscoverage['/lang/object.js'].lineData[201] = 0;
  _$jscoverage['/lang/object.js'].lineData[204] = 0;
  _$jscoverage['/lang/object.js'].lineData[221] = 0;
  _$jscoverage['/lang/object.js'].lineData[226] = 0;
  _$jscoverage['/lang/object.js'].lineData[227] = 0;
  _$jscoverage['/lang/object.js'].lineData[228] = 0;
  _$jscoverage['/lang/object.js'].lineData[229] = 0;
  _$jscoverage['/lang/object.js'].lineData[230] = 0;
  _$jscoverage['/lang/object.js'].lineData[233] = 0;
  _$jscoverage['/lang/object.js'].lineData[237] = 0;
  _$jscoverage['/lang/object.js'].lineData[240] = 0;
  _$jscoverage['/lang/object.js'].lineData[241] = 0;
  _$jscoverage['/lang/object.js'].lineData[242] = 0;
  _$jscoverage['/lang/object.js'].lineData[243] = 0;
  _$jscoverage['/lang/object.js'].lineData[245] = 0;
  _$jscoverage['/lang/object.js'].lineData[246] = 0;
  _$jscoverage['/lang/object.js'].lineData[248] = 0;
  _$jscoverage['/lang/object.js'].lineData[249] = 0;
  _$jscoverage['/lang/object.js'].lineData[252] = 0;
  _$jscoverage['/lang/object.js'].lineData[253] = 0;
  _$jscoverage['/lang/object.js'].lineData[254] = 0;
  _$jscoverage['/lang/object.js'].lineData[258] = 0;
  _$jscoverage['/lang/object.js'].lineData[259] = 0;
  _$jscoverage['/lang/object.js'].lineData[260] = 0;
  _$jscoverage['/lang/object.js'].lineData[262] = 0;
  _$jscoverage['/lang/object.js'].lineData[265] = 0;
  _$jscoverage['/lang/object.js'].lineData[268] = 0;
  _$jscoverage['/lang/object.js'].lineData[271] = 0;
  _$jscoverage['/lang/object.js'].lineData[272] = 0;
  _$jscoverage['/lang/object.js'].lineData[273] = 0;
  _$jscoverage['/lang/object.js'].lineData[274] = 0;
  _$jscoverage['/lang/object.js'].lineData[275] = 0;
  _$jscoverage['/lang/object.js'].lineData[277] = 0;
  _$jscoverage['/lang/object.js'].lineData[281] = 0;
  _$jscoverage['/lang/object.js'].lineData[284] = 0;
  _$jscoverage['/lang/object.js'].lineData[285] = 0;
  _$jscoverage['/lang/object.js'].lineData[288] = 0;
  _$jscoverage['/lang/object.js'].lineData[292] = 0;
  _$jscoverage['/lang/object.js'].lineData[293] = 0;
  _$jscoverage['/lang/object.js'].lineData[296] = 0;
  _$jscoverage['/lang/object.js'].lineData[298] = 0;
  _$jscoverage['/lang/object.js'].lineData[299] = 0;
  _$jscoverage['/lang/object.js'].lineData[301] = 0;
  _$jscoverage['/lang/object.js'].lineData[303] = 0;
  _$jscoverage['/lang/object.js'].lineData[304] = 0;
  _$jscoverage['/lang/object.js'].lineData[307] = 0;
  _$jscoverage['/lang/object.js'].lineData[308] = 0;
  _$jscoverage['/lang/object.js'].lineData[309] = 0;
  _$jscoverage['/lang/object.js'].lineData[313] = 0;
  _$jscoverage['/lang/object.js'].lineData[316] = 0;
  _$jscoverage['/lang/object.js'].lineData[317] = 0;
  _$jscoverage['/lang/object.js'].lineData[319] = 0;
  _$jscoverage['/lang/object.js'].lineData[320] = 0;
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
}
if (! _$jscoverage['/lang/object.js'].branchData) {
  _$jscoverage['/lang/object.js'].branchData = {};
  _$jscoverage['/lang/object.js'].branchData['28'] = [];
  _$jscoverage['/lang/object.js'].branchData['28'][1] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['30'] = [];
  _$jscoverage['/lang/object.js'].branchData['30'][1] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['32'] = [];
  _$jscoverage['/lang/object.js'].branchData['32'][1] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['67'] = [];
  _$jscoverage['/lang/object.js'].branchData['67'][1] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['76'] = [];
  _$jscoverage['/lang/object.js'].branchData['76'][1] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['76'][2] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['83'] = [];
  _$jscoverage['/lang/object.js'].branchData['83'][1] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['111'] = [];
  _$jscoverage['/lang/object.js'].branchData['111'][1] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['137'] = [];
  _$jscoverage['/lang/object.js'].branchData['137'][1] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['142'] = [];
  _$jscoverage['/lang/object.js'].branchData['142'][1] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['147'] = [];
  _$jscoverage['/lang/object.js'].branchData['147'][1] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['170'] = [];
  _$jscoverage['/lang/object.js'].branchData['170'][1] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['171'] = [];
  _$jscoverage['/lang/object.js'].branchData['171'][1] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['174'] = [];
  _$jscoverage['/lang/object.js'].branchData['174'][1] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['177'] = [];
  _$jscoverage['/lang/object.js'].branchData['177'][1] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['195'] = [];
  _$jscoverage['/lang/object.js'].branchData['195'][1] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['200'] = [];
  _$jscoverage['/lang/object.js'].branchData['200'][1] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['224'] = [];
  _$jscoverage['/lang/object.js'].branchData['224'][1] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['224'][2] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['226'] = [];
  _$jscoverage['/lang/object.js'].branchData['226'][1] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['229'] = [];
  _$jscoverage['/lang/object.js'].branchData['229'][1] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['229'][2] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['230'] = [];
  _$jscoverage['/lang/object.js'].branchData['230'][1] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['242'] = [];
  _$jscoverage['/lang/object.js'].branchData['242'][1] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['259'] = [];
  _$jscoverage['/lang/object.js'].branchData['259'][1] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['273'] = [];
  _$jscoverage['/lang/object.js'].branchData['273'][1] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['275'] = [];
  _$jscoverage['/lang/object.js'].branchData['275'][1] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['285'] = [];
  _$jscoverage['/lang/object.js'].branchData['285'][1] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['292'] = [];
  _$jscoverage['/lang/object.js'].branchData['292'][1] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['292'][2] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['296'] = [];
  _$jscoverage['/lang/object.js'].branchData['296'][1] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['298'] = [];
  _$jscoverage['/lang/object.js'].branchData['298'][1] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['303'] = [];
  _$jscoverage['/lang/object.js'].branchData['303'][1] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['307'] = [];
  _$jscoverage['/lang/object.js'].branchData['307'][1] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['307'][2] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['307'][3] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['308'] = [];
  _$jscoverage['/lang/object.js'].branchData['308'][1] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['313'] = [];
  _$jscoverage['/lang/object.js'].branchData['313'][1] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['313'][2] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['319'] = [];
  _$jscoverage['/lang/object.js'].branchData['319'][1] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['319'][2] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['319'][3] = new BranchData();
}
_$jscoverage['/lang/object.js'].branchData['319'][3].init(1062, 15, 'ov || !(p in r)');
function visit219_319_3(result) {
  _$jscoverage['/lang/object.js'].branchData['319'][3].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['319'][2].init(1040, 17, 'src !== undefined');
function visit218_319_2(result) {
  _$jscoverage['/lang/object.js'].branchData['319'][2].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['319'][1].init(1040, 38, 'src !== undefined && (ov || !(p in r))');
function visit217_319_1(result) {
  _$jscoverage['/lang/object.js'].branchData['319'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['313'][2].init(136, 44, 'S.isArray(target) || S.isPlainObject(target)');
function visit216_313_2(result) {
  _$jscoverage['/lang/object.js'].branchData['313'][2].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['313'][1].init(125, 56, 'target && (S.isArray(target) || S.isPlainObject(target))');
function visit215_313_1(result) {
  _$jscoverage['/lang/object.js'].branchData['313'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['308'][1].init(21, 27, 'src[MIX_CIRCULAR_DETECTION]');
function visit214_308_1(result) {
  _$jscoverage['/lang/object.js'].branchData['308'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['307'][3].init(455, 38, 'S.isArray(src) || S.isPlainObject(src)');
function visit213_307_3(result) {
  _$jscoverage['/lang/object.js'].branchData['307'][3].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['307'][2].init(447, 47, 'src && (S.isArray(src) || S.isPlainObject(src))');
function visit212_307_2(result) {
  _$jscoverage['/lang/object.js'].branchData['307'][2].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['307'][1].init(439, 55, 'deep && src && (S.isArray(src) || S.isPlainObject(src))');
function visit211_307_1(result) {
  _$jscoverage['/lang/object.js'].branchData['307'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['303'][1].init(326, 2, 'wl');
function visit210_303_1(result) {
  _$jscoverage['/lang/object.js'].branchData['303'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['298'][1].init(64, 20, 'target === undefined');
function visit209_298_1(result) {
  _$jscoverage['/lang/object.js'].branchData['298'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['296'][1].init(114, 14, 'target === src');
function visit208_296_1(result) {
  _$jscoverage['/lang/object.js'].branchData['296'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['292'][2].init(73, 17, '!(p in r) || deep');
function visit207_292_2(result) {
  _$jscoverage['/lang/object.js'].branchData['292'][2].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['292'][1].init(67, 23, 'ov || !(p in r) || deep');
function visit206_292_1(result) {
  _$jscoverage['/lang/object.js'].branchData['292'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['285'][1].init(16, 19, 'k === \'constructor\'');
function visit205_285_1(result) {
  _$jscoverage['/lang/object.js'].branchData['285'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['275'][1].init(42, 28, 'p !== MIX_CIRCULAR_DETECTION');
function visit204_275_1(result) {
  _$jscoverage['/lang/object.js'].branchData['275'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['273'][1].init(297, 7, 'i < len');
function visit203_273_1(result) {
  _$jscoverage['/lang/object.js'].branchData['273'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['259'][1].init(13, 8, '!s || !r');
function visit202_259_1(result) {
  _$jscoverage['/lang/object.js'].branchData['259'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['242'][1].init(35, 12, 'objectCreate');
function visit201_242_1(result) {
  _$jscoverage['/lang/object.js'].branchData['242'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['230'][1].init(35, 13, 'o[p[j]] || {}');
function visit200_230_1(result) {
  _$jscoverage['/lang/object.js'].branchData['230'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['229'][2].init(146, 12, 'j < p.length');
function visit199_229_2(result) {
  _$jscoverage['/lang/object.js'].branchData['229'][2].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['229'][1].init(119, 16, 'self[p[0]] === o');
function visit198_229_1(result) {
  _$jscoverage['/lang/object.js'].branchData['229'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['226'][1].init(197, 5, 'i < l');
function visit197_226_1(result) {
  _$jscoverage['/lang/object.js'].branchData['226'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['224'][2].init(128, 20, 'args[l - 1] === TRUE');
function visit196_224_2(result) {
  _$jscoverage['/lang/object.js'].branchData['224'][2].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['224'][1].init(128, 27, 'args[l - 1] === TRUE && l--');
function visit195_224_1(result) {
  _$jscoverage['/lang/object.js'].branchData['224'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['200'][1].init(818, 2, 'sx');
function visit194_200_1(result) {
  _$jscoverage['/lang/object.js'].branchData['200'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['195'][1].init(714, 2, 'px');
function visit193_195_1(result) {
  _$jscoverage['/lang/object.js'].branchData['195'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['177'][1].init(217, 8, '!s || !r');
function visit192_177_1(result) {
  _$jscoverage['/lang/object.js'].branchData['177'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['174'][1].init(119, 2, '!s');
function visit191_174_1(result) {
  _$jscoverage['/lang/object.js'].branchData['174'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['171'][1].init(21, 2, '!r');
function visit190_171_1(result) {
  _$jscoverage['/lang/object.js'].branchData['171'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['170'][1].init(17, 9, '\'@DEBUG@\'');
function visit189_170_1(result) {
  _$jscoverage['/lang/object.js'].branchData['170'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['147'][1].init(515, 7, 'i < len');
function visit188_147_1(result) {
  _$jscoverage['/lang/object.js'].branchData['147'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['142'][1].init(399, 23, 'typeof ov !== \'boolean\'');
function visit187_142_1(result) {
  _$jscoverage['/lang/object.js'].branchData['142'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['137'][1].init(271, 14, '!S.isArray(wl)');
function visit186_137_1(result) {
  _$jscoverage['/lang/object.js'].branchData['137'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['111'][1].init(150, 5, 'i < l');
function visit185_111_1(result) {
  _$jscoverage['/lang/object.js'].branchData['111'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['83'][1].init(508, 16, 'ov === undefined');
function visit184_83_1(result) {
  _$jscoverage['/lang/object.js'].branchData['83'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['76'][2].init(274, 24, 'typeof wl !== \'function\'');
function visit183_76_2(result) {
  _$jscoverage['/lang/object.js'].branchData['76'][2].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['76'][1].init(267, 32, 'wl && (typeof wl !== \'function\')');
function visit182_76_1(result) {
  _$jscoverage['/lang/object.js'].branchData['76'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['67'][1].init(17, 22, 'typeof ov === \'object\'');
function visit181_67_1(result) {
  _$jscoverage['/lang/object.js'].branchData['67'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['32'][1].init(157, 9, '!readOnly');
function visit180_32_1(result) {
  _$jscoverage['/lang/object.js'].branchData['32'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['30'][1].init(96, 4, 'guid');
function visit179_30_1(result) {
  _$jscoverage['/lang/object.js'].branchData['30'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['28'][1].init(22, 22, 'marker || STAMP_MARKER');
function visit178_28_1(result) {
  _$jscoverage['/lang/object.js'].branchData['28'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].lineData[7]++;
(function(S, undefined) {
  _$jscoverage['/lang/object.js'].functionData[0]++;
  _$jscoverage['/lang/object.js'].lineData[8]++;
  var logger = S.getLogger('s/lang');
  _$jscoverage['/lang/object.js'].lineData[9]++;
  var MIX_CIRCULAR_DETECTION = '__MIX_CIRCULAR', STAMP_MARKER = '__~ks_stamped', self = this, TRUE = true, EMPTY = '', Obj = Object, objectCreate = Obj.create;
  _$jscoverage['/lang/object.js'].lineData[18]++;
  mix(S, {
  stamp: function(o, readOnly, marker) {
  _$jscoverage['/lang/object.js'].functionData[1]++;
  _$jscoverage['/lang/object.js'].lineData[28]++;
  marker = visit178_28_1(marker || STAMP_MARKER);
  _$jscoverage['/lang/object.js'].lineData[29]++;
  var guid = o[marker];
  _$jscoverage['/lang/object.js'].lineData[30]++;
  if (visit179_30_1(guid)) {
    _$jscoverage['/lang/object.js'].lineData[31]++;
    return guid;
  } else {
    _$jscoverage['/lang/object.js'].lineData[32]++;
    if (visit180_32_1(!readOnly)) {
      _$jscoverage['/lang/object.js'].lineData[33]++;
      try {
        _$jscoverage['/lang/object.js'].lineData[34]++;
        guid = o[marker] = S.guid(marker);
      }      catch (e) {
  _$jscoverage['/lang/object.js'].lineData[37]++;
  guid = undefined;
}
    }
  }
  _$jscoverage['/lang/object.js'].lineData[40]++;
  return guid;
}, 
  mix: function(r, s, ov, wl, deep) {
  _$jscoverage['/lang/object.js'].functionData[2]++;
  _$jscoverage['/lang/object.js'].lineData[67]++;
  if (visit181_67_1(typeof ov === 'object')) {
    _$jscoverage['/lang/object.js'].lineData[68]++;
    wl = ov.whitelist;
    _$jscoverage['/lang/object.js'].lineData[72]++;
    deep = ov.deep;
    _$jscoverage['/lang/object.js'].lineData[73]++;
    ov = ov.overwrite;
  }
  _$jscoverage['/lang/object.js'].lineData[76]++;
  if (visit182_76_1(wl && (visit183_76_2(typeof wl !== 'function')))) {
    _$jscoverage['/lang/object.js'].lineData[77]++;
    var originalWl = wl;
    _$jscoverage['/lang/object.js'].lineData[78]++;
    wl = function(name, val) {
  _$jscoverage['/lang/object.js'].functionData[3]++;
  _$jscoverage['/lang/object.js'].lineData[79]++;
  return S.inArray(name, originalWl) ? val : undefined;
};
  }
  _$jscoverage['/lang/object.js'].lineData[83]++;
  if (visit184_83_1(ov === undefined)) {
    _$jscoverage['/lang/object.js'].lineData[84]++;
    ov = TRUE;
  }
  _$jscoverage['/lang/object.js'].lineData[87]++;
  var cache = [], c, i = 0;
  _$jscoverage['/lang/object.js'].lineData[90]++;
  mixInternal(r, s, ov, wl, deep, cache);
  _$jscoverage['/lang/object.js'].lineData[91]++;
  while ((c = cache[i++])) {
    _$jscoverage['/lang/object.js'].lineData[92]++;
    delete c[MIX_CIRCULAR_DETECTION];
  }
  _$jscoverage['/lang/object.js'].lineData[94]++;
  return r;
}, 
  merge: function(varArgs) {
  _$jscoverage['/lang/object.js'].functionData[4]++;
  _$jscoverage['/lang/object.js'].lineData[107]++;
  varArgs = S.makeArray(arguments);
  _$jscoverage['/lang/object.js'].lineData[108]++;
  var o = {}, i, l = varArgs.length;
  _$jscoverage['/lang/object.js'].lineData[111]++;
  for (i = 0; visit185_111_1(i < l); i++) {
    _$jscoverage['/lang/object.js'].lineData[112]++;
    S.mix(o, varArgs[i]);
  }
  _$jscoverage['/lang/object.js'].lineData[114]++;
  return o;
}, 
  augment: function(r, varArgs) {
  _$jscoverage['/lang/object.js'].functionData[5]++;
  _$jscoverage['/lang/object.js'].lineData[127]++;
  var args = S.makeArray(arguments), len = args.length - 2, i = 1, proto, arg, ov = args[len], wl = args[len + 1];
  _$jscoverage['/lang/object.js'].lineData[135]++;
  args[1] = varArgs;
  _$jscoverage['/lang/object.js'].lineData[137]++;
  if (visit186_137_1(!S.isArray(wl))) {
    _$jscoverage['/lang/object.js'].lineData[138]++;
    ov = wl;
    _$jscoverage['/lang/object.js'].lineData[139]++;
    wl = undefined;
    _$jscoverage['/lang/object.js'].lineData[140]++;
    len++;
  }
  _$jscoverage['/lang/object.js'].lineData[142]++;
  if (visit187_142_1(typeof ov !== 'boolean')) {
    _$jscoverage['/lang/object.js'].lineData[143]++;
    ov = undefined;
    _$jscoverage['/lang/object.js'].lineData[144]++;
    len++;
  }
  _$jscoverage['/lang/object.js'].lineData[147]++;
  for (; visit188_147_1(i < len); i++) {
    _$jscoverage['/lang/object.js'].lineData[148]++;
    arg = args[i];
    _$jscoverage['/lang/object.js'].lineData[149]++;
    if ((proto = arg.prototype)) {
      _$jscoverage['/lang/object.js'].lineData[150]++;
      arg = S.mix({}, proto, true, removeConstructor);
    }
    _$jscoverage['/lang/object.js'].lineData[152]++;
    S.mix(r.prototype, arg, ov, wl);
  }
  _$jscoverage['/lang/object.js'].lineData[155]++;
  return r;
}, 
  extend: function(r, s, px, sx) {
  _$jscoverage['/lang/object.js'].functionData[6]++;
  _$jscoverage['/lang/object.js'].lineData[170]++;
  if (visit189_170_1('@DEBUG@')) {
    _$jscoverage['/lang/object.js'].lineData[171]++;
    if (visit190_171_1(!r)) {
      _$jscoverage['/lang/object.js'].lineData[172]++;
      logger.error('extend r is null');
    }
    _$jscoverage['/lang/object.js'].lineData[174]++;
    if (visit191_174_1(!s)) {
      _$jscoverage['/lang/object.js'].lineData[175]++;
      logger.error('extend s is null');
    }
    _$jscoverage['/lang/object.js'].lineData[177]++;
    if (visit192_177_1(!s || !r)) {
      _$jscoverage['/lang/object.js'].lineData[178]++;
      return r;
    }
  }
  _$jscoverage['/lang/object.js'].lineData[182]++;
  var sp = s.prototype, rp;
  _$jscoverage['/lang/object.js'].lineData[187]++;
  sp.constructor = s;
  _$jscoverage['/lang/object.js'].lineData[190]++;
  rp = createObject(sp, r);
  _$jscoverage['/lang/object.js'].lineData[191]++;
  r.prototype = S.mix(rp, r.prototype);
  _$jscoverage['/lang/object.js'].lineData[192]++;
  r.superclass = sp;
  _$jscoverage['/lang/object.js'].lineData[195]++;
  if (visit193_195_1(px)) {
    _$jscoverage['/lang/object.js'].lineData[196]++;
    S.mix(rp, px);
  }
  _$jscoverage['/lang/object.js'].lineData[200]++;
  if (visit194_200_1(sx)) {
    _$jscoverage['/lang/object.js'].lineData[201]++;
    S.mix(r, sx);
  }
  _$jscoverage['/lang/object.js'].lineData[204]++;
  return r;
}, 
  namespace: function() {
  _$jscoverage['/lang/object.js'].functionData[7]++;
  _$jscoverage['/lang/object.js'].lineData[221]++;
  var args = S.makeArray(arguments), l = args.length, o = null, i, j, p, global = (visit195_224_1(visit196_224_2(args[l - 1] === TRUE) && l--));
  _$jscoverage['/lang/object.js'].lineData[226]++;
  for (i = 0; visit197_226_1(i < l); i++) {
    _$jscoverage['/lang/object.js'].lineData[227]++;
    p = (EMPTY + args[i]).split('.');
    _$jscoverage['/lang/object.js'].lineData[228]++;
    o = global ? self : this;
    _$jscoverage['/lang/object.js'].lineData[229]++;
    for (j = (visit198_229_1(self[p[0]] === o)) ? 1 : 0; visit199_229_2(j < p.length); ++j) {
      _$jscoverage['/lang/object.js'].lineData[230]++;
      o = o[p[j]] = visit200_230_1(o[p[j]] || {});
    }
  }
  _$jscoverage['/lang/object.js'].lineData[233]++;
  return o;
}});
  _$jscoverage['/lang/object.js'].lineData[237]++;
  function Empty() {
    _$jscoverage['/lang/object.js'].functionData[8]++;
  }
  _$jscoverage['/lang/object.js'].lineData[240]++;
  function createObject(proto, constructor) {
    _$jscoverage['/lang/object.js'].functionData[9]++;
    _$jscoverage['/lang/object.js'].lineData[241]++;
    var newProto;
    _$jscoverage['/lang/object.js'].lineData[242]++;
    if (visit201_242_1(objectCreate)) {
      _$jscoverage['/lang/object.js'].lineData[243]++;
      newProto = objectCreate(proto);
    } else {
      _$jscoverage['/lang/object.js'].lineData[245]++;
      Empty.prototype = proto;
      _$jscoverage['/lang/object.js'].lineData[246]++;
      newProto = new Empty();
    }
    _$jscoverage['/lang/object.js'].lineData[248]++;
    newProto.constructor = constructor;
    _$jscoverage['/lang/object.js'].lineData[249]++;
    return newProto;
  }
  _$jscoverage['/lang/object.js'].lineData[252]++;
  function mix(r, s) {
    _$jscoverage['/lang/object.js'].functionData[10]++;
    _$jscoverage['/lang/object.js'].lineData[253]++;
    for (var i in s) {
      _$jscoverage['/lang/object.js'].lineData[254]++;
      r[i] = s[i];
    }
  }
  _$jscoverage['/lang/object.js'].lineData[258]++;
  function mixInternal(r, s, ov, wl, deep, cache) {
    _$jscoverage['/lang/object.js'].functionData[11]++;
    _$jscoverage['/lang/object.js'].lineData[259]++;
    if (visit202_259_1(!s || !r)) {
      _$jscoverage['/lang/object.js'].lineData[260]++;
      return r;
    }
    _$jscoverage['/lang/object.js'].lineData[262]++;
    var i, p, keys, len;
    _$jscoverage['/lang/object.js'].lineData[265]++;
    s[MIX_CIRCULAR_DETECTION] = r;
    _$jscoverage['/lang/object.js'].lineData[268]++;
    cache.push(s);
    _$jscoverage['/lang/object.js'].lineData[271]++;
    keys = S.keys(s);
    _$jscoverage['/lang/object.js'].lineData[272]++;
    len = keys.length;
    _$jscoverage['/lang/object.js'].lineData[273]++;
    for (i = 0; visit203_273_1(i < len); i++) {
      _$jscoverage['/lang/object.js'].lineData[274]++;
      p = keys[i];
      _$jscoverage['/lang/object.js'].lineData[275]++;
      if (visit204_275_1(p !== MIX_CIRCULAR_DETECTION)) {
        _$jscoverage['/lang/object.js'].lineData[277]++;
        _mix(p, r, s, ov, wl, deep, cache);
      }
    }
    _$jscoverage['/lang/object.js'].lineData[281]++;
    return r;
  }
  _$jscoverage['/lang/object.js'].lineData[284]++;
  function removeConstructor(k, v) {
    _$jscoverage['/lang/object.js'].functionData[12]++;
    _$jscoverage['/lang/object.js'].lineData[285]++;
    return visit205_285_1(k === 'constructor') ? undefined : v;
  }
  _$jscoverage['/lang/object.js'].lineData[288]++;
  function _mix(p, r, s, ov, wl, deep, cache) {
    _$jscoverage['/lang/object.js'].functionData[13]++;
    _$jscoverage['/lang/object.js'].lineData[292]++;
    if (visit206_292_1(ov || visit207_292_2(!(p in r) || deep))) {
      _$jscoverage['/lang/object.js'].lineData[293]++;
      var target = r[p], src = s[p];
      _$jscoverage['/lang/object.js'].lineData[296]++;
      if (visit208_296_1(target === src)) {
        _$jscoverage['/lang/object.js'].lineData[298]++;
        if (visit209_298_1(target === undefined)) {
          _$jscoverage['/lang/object.js'].lineData[299]++;
          r[p] = target;
        }
        _$jscoverage['/lang/object.js'].lineData[301]++;
        return;
      }
      _$jscoverage['/lang/object.js'].lineData[303]++;
      if (visit210_303_1(wl)) {
        _$jscoverage['/lang/object.js'].lineData[304]++;
        src = wl.call(s, p, src);
      }
      _$jscoverage['/lang/object.js'].lineData[307]++;
      if (visit211_307_1(deep && visit212_307_2(src && (visit213_307_3(S.isArray(src) || S.isPlainObject(src)))))) {
        _$jscoverage['/lang/object.js'].lineData[308]++;
        if (visit214_308_1(src[MIX_CIRCULAR_DETECTION])) {
          _$jscoverage['/lang/object.js'].lineData[309]++;
          r[p] = src[MIX_CIRCULAR_DETECTION];
        } else {
          _$jscoverage['/lang/object.js'].lineData[313]++;
          var clone = visit215_313_1(target && (visit216_313_2(S.isArray(target) || S.isPlainObject(target)))) ? target : (S.isArray(src) ? [] : {});
          _$jscoverage['/lang/object.js'].lineData[316]++;
          r[p] = clone;
          _$jscoverage['/lang/object.js'].lineData[317]++;
          mixInternal(clone, src, ov, wl, TRUE, cache);
        }
      } else {
        _$jscoverage['/lang/object.js'].lineData[319]++;
        if (visit217_319_1(visit218_319_2(src !== undefined) && (visit219_319_3(ov || !(p in r))))) {
          _$jscoverage['/lang/object.js'].lineData[320]++;
          r[p] = src;
        }
      }
    }
  }
})(KISSY);
