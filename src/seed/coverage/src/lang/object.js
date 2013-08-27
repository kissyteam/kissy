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
  _$jscoverage['/lang/object.js'].lineData[64] = 0;
  _$jscoverage['/lang/object.js'].lineData[67] = 0;
  _$jscoverage['/lang/object.js'].lineData[68] = 0;
  _$jscoverage['/lang/object.js'].lineData[69] = 0;
  _$jscoverage['/lang/object.js'].lineData[70] = 0;
  _$jscoverage['/lang/object.js'].lineData[71] = 0;
  _$jscoverage['/lang/object.js'].lineData[76] = 0;
  _$jscoverage['/lang/object.js'].lineData[102] = 0;
  _$jscoverage['/lang/object.js'].lineData[103] = 0;
  _$jscoverage['/lang/object.js'].lineData[107] = 0;
  _$jscoverage['/lang/object.js'].lineData[108] = 0;
  _$jscoverage['/lang/object.js'].lineData[111] = 0;
  _$jscoverage['/lang/object.js'].lineData[112] = 0;
  _$jscoverage['/lang/object.js'].lineData[113] = 0;
  _$jscoverage['/lang/object.js'].lineData[114] = 0;
  _$jscoverage['/lang/object.js'].lineData[118] = 0;
  _$jscoverage['/lang/object.js'].lineData[119] = 0;
  _$jscoverage['/lang/object.js'].lineData[122] = 0;
  _$jscoverage['/lang/object.js'].lineData[125] = 0;
  _$jscoverage['/lang/object.js'].lineData[126] = 0;
  _$jscoverage['/lang/object.js'].lineData[127] = 0;
  _$jscoverage['/lang/object.js'].lineData[129] = 0;
  _$jscoverage['/lang/object.js'].lineData[142] = 0;
  _$jscoverage['/lang/object.js'].lineData[143] = 0;
  _$jscoverage['/lang/object.js'].lineData[146] = 0;
  _$jscoverage['/lang/object.js'].lineData[147] = 0;
  _$jscoverage['/lang/object.js'].lineData[149] = 0;
  _$jscoverage['/lang/object.js'].lineData[162] = 0;
  _$jscoverage['/lang/object.js'].lineData[171] = 0;
  _$jscoverage['/lang/object.js'].lineData[172] = 0;
  _$jscoverage['/lang/object.js'].lineData[173] = 0;
  _$jscoverage['/lang/object.js'].lineData[174] = 0;
  _$jscoverage['/lang/object.js'].lineData[176] = 0;
  _$jscoverage['/lang/object.js'].lineData[177] = 0;
  _$jscoverage['/lang/object.js'].lineData[178] = 0;
  _$jscoverage['/lang/object.js'].lineData[181] = 0;
  _$jscoverage['/lang/object.js'].lineData[182] = 0;
  _$jscoverage['/lang/object.js'].lineData[183] = 0;
  _$jscoverage['/lang/object.js'].lineData[184] = 0;
  _$jscoverage['/lang/object.js'].lineData[185] = 0;
  _$jscoverage['/lang/object.js'].lineData[186] = 0;
  _$jscoverage['/lang/object.js'].lineData[187] = 0;
  _$jscoverage['/lang/object.js'].lineData[188] = 0;
  _$jscoverage['/lang/object.js'].lineData[189] = 0;
  _$jscoverage['/lang/object.js'].lineData[190] = 0;
  _$jscoverage['/lang/object.js'].lineData[194] = 0;
  _$jscoverage['/lang/object.js'].lineData[197] = 0;
  _$jscoverage['/lang/object.js'].lineData[212] = 0;
  _$jscoverage['/lang/object.js'].lineData[213] = 0;
  _$jscoverage['/lang/object.js'].lineData[216] = 0;
  _$jscoverage['/lang/object.js'].lineData[221] = 0;
  _$jscoverage['/lang/object.js'].lineData[224] = 0;
  _$jscoverage['/lang/object.js'].lineData[225] = 0;
  _$jscoverage['/lang/object.js'].lineData[226] = 0;
  _$jscoverage['/lang/object.js'].lineData[229] = 0;
  _$jscoverage['/lang/object.js'].lineData[230] = 0;
  _$jscoverage['/lang/object.js'].lineData[234] = 0;
  _$jscoverage['/lang/object.js'].lineData[235] = 0;
  _$jscoverage['/lang/object.js'].lineData[238] = 0;
  _$jscoverage['/lang/object.js'].lineData[256] = 0;
  _$jscoverage['/lang/object.js'].lineData[261] = 0;
  _$jscoverage['/lang/object.js'].lineData[262] = 0;
  _$jscoverage['/lang/object.js'].lineData[263] = 0;
  _$jscoverage['/lang/object.js'].lineData[264] = 0;
  _$jscoverage['/lang/object.js'].lineData[265] = 0;
  _$jscoverage['/lang/object.js'].lineData[268] = 0;
  _$jscoverage['/lang/object.js'].lineData[273] = 0;
  _$jscoverage['/lang/object.js'].lineData[276] = 0;
  _$jscoverage['/lang/object.js'].lineData[277] = 0;
  _$jscoverage['/lang/object.js'].lineData[278] = 0;
  _$jscoverage['/lang/object.js'].lineData[279] = 0;
  _$jscoverage['/lang/object.js'].lineData[281] = 0;
  _$jscoverage['/lang/object.js'].lineData[282] = 0;
  _$jscoverage['/lang/object.js'].lineData[284] = 0;
  _$jscoverage['/lang/object.js'].lineData[285] = 0;
  _$jscoverage['/lang/object.js'].lineData[288] = 0;
  _$jscoverage['/lang/object.js'].lineData[289] = 0;
  _$jscoverage['/lang/object.js'].lineData[290] = 0;
  _$jscoverage['/lang/object.js'].lineData[294] = 0;
  _$jscoverage['/lang/object.js'].lineData[295] = 0;
  _$jscoverage['/lang/object.js'].lineData[296] = 0;
  _$jscoverage['/lang/object.js'].lineData[298] = 0;
  _$jscoverage['/lang/object.js'].lineData[301] = 0;
  _$jscoverage['/lang/object.js'].lineData[304] = 0;
  _$jscoverage['/lang/object.js'].lineData[307] = 0;
  _$jscoverage['/lang/object.js'].lineData[308] = 0;
  _$jscoverage['/lang/object.js'].lineData[309] = 0;
  _$jscoverage['/lang/object.js'].lineData[310] = 0;
  _$jscoverage['/lang/object.js'].lineData[311] = 0;
  _$jscoverage['/lang/object.js'].lineData[313] = 0;
  _$jscoverage['/lang/object.js'].lineData[317] = 0;
  _$jscoverage['/lang/object.js'].lineData[320] = 0;
  _$jscoverage['/lang/object.js'].lineData[324] = 0;
  _$jscoverage['/lang/object.js'].lineData[325] = 0;
  _$jscoverage['/lang/object.js'].lineData[328] = 0;
  _$jscoverage['/lang/object.js'].lineData[330] = 0;
  _$jscoverage['/lang/object.js'].lineData[331] = 0;
  _$jscoverage['/lang/object.js'].lineData[333] = 0;
  _$jscoverage['/lang/object.js'].lineData[335] = 0;
  _$jscoverage['/lang/object.js'].lineData[336] = 0;
  _$jscoverage['/lang/object.js'].lineData[339] = 0;
  _$jscoverage['/lang/object.js'].lineData[340] = 0;
  _$jscoverage['/lang/object.js'].lineData[341] = 0;
  _$jscoverage['/lang/object.js'].lineData[345] = 0;
  _$jscoverage['/lang/object.js'].lineData[348] = 0;
  _$jscoverage['/lang/object.js'].lineData[349] = 0;
  _$jscoverage['/lang/object.js'].lineData[351] = 0;
  _$jscoverage['/lang/object.js'].lineData[352] = 0;
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
  _$jscoverage['/lang/object.js'].branchData['38'] = [];
  _$jscoverage['/lang/object.js'].branchData['38'][1] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['40'] = [];
  _$jscoverage['/lang/object.js'].branchData['40'][1] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['42'] = [];
  _$jscoverage['/lang/object.js'].branchData['42'][1] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['60'] = [];
  _$jscoverage['/lang/object.js'].branchData['60'][1] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['67'] = [];
  _$jscoverage['/lang/object.js'].branchData['67'][1] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['68'] = [];
  _$jscoverage['/lang/object.js'].branchData['68'][1] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['70'] = [];
  _$jscoverage['/lang/object.js'].branchData['70'][1] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['102'] = [];
  _$jscoverage['/lang/object.js'].branchData['102'][1] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['111'] = [];
  _$jscoverage['/lang/object.js'].branchData['111'][1] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['111'][2] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['118'] = [];
  _$jscoverage['/lang/object.js'].branchData['118'][1] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['146'] = [];
  _$jscoverage['/lang/object.js'].branchData['146'][1] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['171'] = [];
  _$jscoverage['/lang/object.js'].branchData['171'][1] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['176'] = [];
  _$jscoverage['/lang/object.js'].branchData['176'][1] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['181'] = [];
  _$jscoverage['/lang/object.js'].branchData['181'][1] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['183'] = [];
  _$jscoverage['/lang/object.js'].branchData['183'][1] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['187'] = [];
  _$jscoverage['/lang/object.js'].branchData['187'][1] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['189'] = [];
  _$jscoverage['/lang/object.js'].branchData['189'][1] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['212'] = [];
  _$jscoverage['/lang/object.js'].branchData['212'][1] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['229'] = [];
  _$jscoverage['/lang/object.js'].branchData['229'][1] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['234'] = [];
  _$jscoverage['/lang/object.js'].branchData['234'][1] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['259'] = [];
  _$jscoverage['/lang/object.js'].branchData['259'][1] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['259'][2] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['261'] = [];
  _$jscoverage['/lang/object.js'].branchData['261'][1] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['264'] = [];
  _$jscoverage['/lang/object.js'].branchData['264'][1] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['264'][2] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['265'] = [];
  _$jscoverage['/lang/object.js'].branchData['265'][1] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['278'] = [];
  _$jscoverage['/lang/object.js'].branchData['278'][1] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['295'] = [];
  _$jscoverage['/lang/object.js'].branchData['295'][1] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['309'] = [];
  _$jscoverage['/lang/object.js'].branchData['309'][1] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['311'] = [];
  _$jscoverage['/lang/object.js'].branchData['311'][1] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['324'] = [];
  _$jscoverage['/lang/object.js'].branchData['324'][1] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['324'][2] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['328'] = [];
  _$jscoverage['/lang/object.js'].branchData['328'][1] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['330'] = [];
  _$jscoverage['/lang/object.js'].branchData['330'][1] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['335'] = [];
  _$jscoverage['/lang/object.js'].branchData['335'][1] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['339'] = [];
  _$jscoverage['/lang/object.js'].branchData['339'][1] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['339'][2] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['339'][3] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['340'] = [];
  _$jscoverage['/lang/object.js'].branchData['340'][1] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['345'] = [];
  _$jscoverage['/lang/object.js'].branchData['345'][1] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['345'][2] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['351'] = [];
  _$jscoverage['/lang/object.js'].branchData['351'][1] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['351'][2] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['351'][3] = new BranchData();
}
_$jscoverage['/lang/object.js'].branchData['351'][3].init(1089, 15, 'ov || !(p in r)');
function visit246_351_3(result) {
  _$jscoverage['/lang/object.js'].branchData['351'][3].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['351'][2].init(1067, 17, 'src !== undefined');
function visit245_351_2(result) {
  _$jscoverage['/lang/object.js'].branchData['351'][2].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['351'][1].init(1067, 38, 'src !== undefined && (ov || !(p in r))');
function visit244_351_1(result) {
  _$jscoverage['/lang/object.js'].branchData['351'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['345'][2].init(139, 44, 'S.isArray(target) || S.isPlainObject(target)');
function visit243_345_2(result) {
  _$jscoverage['/lang/object.js'].branchData['345'][2].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['345'][1].init(128, 56, 'target && (S.isArray(target) || S.isPlainObject(target))');
function visit242_345_1(result) {
  _$jscoverage['/lang/object.js'].branchData['345'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['340'][1].init(22, 27, 'src[MIX_CIRCULAR_DETECTION]');
function visit241_340_1(result) {
  _$jscoverage['/lang/object.js'].branchData['340'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['339'][3].init(470, 38, 'S.isArray(src) || S.isPlainObject(src)');
function visit240_339_3(result) {
  _$jscoverage['/lang/object.js'].branchData['339'][3].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['339'][2].init(462, 47, 'src && (S.isArray(src) || S.isPlainObject(src))');
function visit239_339_2(result) {
  _$jscoverage['/lang/object.js'].branchData['339'][2].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['339'][1].init(454, 55, 'deep && src && (S.isArray(src) || S.isPlainObject(src))');
function visit238_339_1(result) {
  _$jscoverage['/lang/object.js'].branchData['339'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['335'][1].init(337, 2, 'wl');
function visit237_335_1(result) {
  _$jscoverage['/lang/object.js'].branchData['335'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['330'][1].init(66, 20, 'target === undefined');
function visit236_330_1(result) {
  _$jscoverage['/lang/object.js'].branchData['330'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['328'][1].init(118, 14, 'target === src');
function visit235_328_1(result) {
  _$jscoverage['/lang/object.js'].branchData['328'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['324'][2].init(77, 17, '!(p in r) || deep');
function visit234_324_2(result) {
  _$jscoverage['/lang/object.js'].branchData['324'][2].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['324'][1].init(71, 23, 'ov || !(p in r) || deep');
function visit233_324_1(result) {
  _$jscoverage['/lang/object.js'].branchData['324'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['311'][1].init(44, 27, 'p != MIX_CIRCULAR_DETECTION');
function visit232_311_1(result) {
  _$jscoverage['/lang/object.js'].branchData['311'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['309'][1].init(312, 7, 'i < len');
function visit231_309_1(result) {
  _$jscoverage['/lang/object.js'].branchData['309'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['295'][1].init(14, 8, '!s || !r');
function visit230_295_1(result) {
  _$jscoverage['/lang/object.js'].branchData['295'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['278'][1].init(37, 12, 'ObjectCreate');
function visit229_278_1(result) {
  _$jscoverage['/lang/object.js'].branchData['278'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['265'][1].init(36, 14, 'o[p[j]] || {}');
function visit228_265_1(result) {
  _$jscoverage['/lang/object.js'].branchData['265'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['264'][2].init(149, 12, 'j < p.length');
function visit227_264_2(result) {
  _$jscoverage['/lang/object.js'].branchData['264'][2].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['264'][1].init(122, 16, 'host[p[0]] === o');
function visit226_264_1(result) {
  _$jscoverage['/lang/object.js'].branchData['264'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['261'][1].init(203, 5, 'i < l');
function visit225_261_1(result) {
  _$jscoverage['/lang/object.js'].branchData['261'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['259'][2].init(131, 20, 'args[l - 1] === TRUE');
function visit224_259_2(result) {
  _$jscoverage['/lang/object.js'].branchData['259'][2].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['259'][1].init(131, 27, 'args[l - 1] === TRUE && l--');
function visit223_259_1(result) {
  _$jscoverage['/lang/object.js'].branchData['259'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['234'][1].init(590, 2, 'sx');
function visit222_234_1(result) {
  _$jscoverage['/lang/object.js'].branchData['234'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['229'][1].init(481, 2, 'px');
function visit221_229_1(result) {
  _$jscoverage['/lang/object.js'].branchData['229'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['212'][1].init(18, 8, '!s || !r');
function visit220_212_1(result) {
  _$jscoverage['/lang/object.js'].branchData['212'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['189'][1].init(74, 18, 'p != \'constructor\'');
function visit219_189_1(result) {
  _$jscoverage['/lang/object.js'].branchData['189'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['187'][1].init(177, 12, 'j < protoLen');
function visit218_187_1(result) {
  _$jscoverage['/lang/object.js'].branchData['187'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['183'][1].init(54, 21, 'proto = arg.prototype');
function visit217_183_1(result) {
  _$jscoverage['/lang/object.js'].branchData['183'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['181'][1].init(522, 7, 'i < len');
function visit216_181_1(result) {
  _$jscoverage['/lang/object.js'].branchData['181'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['176'][1].init(401, 23, 'typeof ov !== \'boolean\'');
function visit215_176_1(result) {
  _$jscoverage['/lang/object.js'].branchData['176'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['171'][1].init(268, 14, '!S.isArray(wl)');
function visit214_171_1(result) {
  _$jscoverage['/lang/object.js'].branchData['171'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['146'][1].init(157, 5, 'i < l');
function visit213_146_1(result) {
  _$jscoverage['/lang/object.js'].branchData['146'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['118'][1].init(534, 16, 'ov === undefined');
function visit212_118_1(result) {
  _$jscoverage['/lang/object.js'].branchData['118'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['111'][2].init(293, 24, 'typeof wl !== \'function\'');
function visit211_111_2(result) {
  _$jscoverage['/lang/object.js'].branchData['111'][2].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['111'][1].init(286, 32, 'wl && (typeof wl !== \'function\')');
function visit210_111_1(result) {
  _$jscoverage['/lang/object.js'].branchData['111'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['102'][1].init(18, 22, 'typeof ov === \'object\'');
function visit209_102_1(result) {
  _$jscoverage['/lang/object.js'].branchData['102'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['70'][1].init(70, 19, 'o.hasOwnProperty(p)');
function visit208_70_1(result) {
  _$jscoverage['/lang/object.js'].branchData['70'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['68'][1].init(54, 6, 'i >= 0');
function visit207_68_1(result) {
  _$jscoverage['/lang/object.js'].branchData['68'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['67'][1].init(134, 10, 'hasEnumBug');
function visit206_67_1(result) {
  _$jscoverage['/lang/object.js'].branchData['67'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['60'][1].init(1007, 472, 'Obj.keys || function(o) {\n  var result = [], p, i;\n  for (p in o) {\n    result.push(p);\n  }\n  if (hasEnumBug) {\n    for (i = enumProperties.length - 1; i >= 0; i--) {\n      p = enumProperties[i];\n      if (o.hasOwnProperty(p)) {\n        result.push(p);\n      }\n    }\n  }\n  return result;\n}');
function visit205_60_1(result) {
  _$jscoverage['/lang/object.js'].branchData['60'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['42'][1].init(162, 9, '!readOnly');
function visit204_42_1(result) {
  _$jscoverage['/lang/object.js'].branchData['42'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['40'][1].init(99, 4, 'guid');
function visit203_40_1(result) {
  _$jscoverage['/lang/object.js'].branchData['40'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['38'][1].init(23, 22, 'marker || STAMP_MARKER');
function visit202_38_1(result) {
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
  marker = visit202_38_1(marker || STAMP_MARKER);
  _$jscoverage['/lang/object.js'].lineData[39]++;
  var guid = o[marker];
  _$jscoverage['/lang/object.js'].lineData[40]++;
  if (visit203_40_1(guid)) {
    _$jscoverage['/lang/object.js'].lineData[41]++;
    return guid;
  } else {
    _$jscoverage['/lang/object.js'].lineData[42]++;
    if (visit204_42_1(!readOnly)) {
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
  keys: visit205_60_1(Obj.keys || function(o) {
  _$jscoverage['/lang/object.js'].functionData[2]++;
  _$jscoverage['/lang/object.js'].lineData[61]++;
  var result = [], p, i;
  _$jscoverage['/lang/object.js'].lineData[63]++;
  for (p in o) {
    _$jscoverage['/lang/object.js'].lineData[64]++;
    result.push(p);
  }
  _$jscoverage['/lang/object.js'].lineData[67]++;
  if (visit206_67_1(hasEnumBug)) {
    _$jscoverage['/lang/object.js'].lineData[68]++;
    for (i = enumProperties.length - 1; visit207_68_1(i >= 0); i--) {
      _$jscoverage['/lang/object.js'].lineData[69]++;
      p = enumProperties[i];
      _$jscoverage['/lang/object.js'].lineData[70]++;
      if (visit208_70_1(o.hasOwnProperty(p))) {
        _$jscoverage['/lang/object.js'].lineData[71]++;
        result.push(p);
      }
    }
  }
  _$jscoverage['/lang/object.js'].lineData[76]++;
  return result;
}), 
  mix: function(r, s, ov, wl, deep) {
  _$jscoverage['/lang/object.js'].functionData[3]++;
  _$jscoverage['/lang/object.js'].lineData[102]++;
  if (visit209_102_1(typeof ov === 'object')) {
    _$jscoverage['/lang/object.js'].lineData[103]++;
    wl = ov['whitelist'];
    _$jscoverage['/lang/object.js'].lineData[107]++;
    deep = ov['deep'];
    _$jscoverage['/lang/object.js'].lineData[108]++;
    ov = ov['overwrite'];
  }
  _$jscoverage['/lang/object.js'].lineData[111]++;
  if (visit210_111_1(wl && (visit211_111_2(typeof wl !== 'function')))) {
    _$jscoverage['/lang/object.js'].lineData[112]++;
    var originalWl = wl;
    _$jscoverage['/lang/object.js'].lineData[113]++;
    wl = function(name, val) {
  _$jscoverage['/lang/object.js'].functionData[4]++;
  _$jscoverage['/lang/object.js'].lineData[114]++;
  return S.inArray(name, originalWl) ? val : undefined;
};
  }
  _$jscoverage['/lang/object.js'].lineData[118]++;
  if (visit212_118_1(ov === undefined)) {
    _$jscoverage['/lang/object.js'].lineData[119]++;
    ov = TRUE;
  }
  _$jscoverage['/lang/object.js'].lineData[122]++;
  var cache = [], c, i = 0;
  _$jscoverage['/lang/object.js'].lineData[125]++;
  mixInternal(r, s, ov, wl, deep, cache);
  _$jscoverage['/lang/object.js'].lineData[126]++;
  while (c = cache[i++]) {
    _$jscoverage['/lang/object.js'].lineData[127]++;
    delete c[MIX_CIRCULAR_DETECTION];
  }
  _$jscoverage['/lang/object.js'].lineData[129]++;
  return r;
}, 
  merge: function(var_args) {
  _$jscoverage['/lang/object.js'].functionData[5]++;
  _$jscoverage['/lang/object.js'].lineData[142]++;
  var_args = S.makeArray(arguments);
  _$jscoverage['/lang/object.js'].lineData[143]++;
  var o = {}, i, l = var_args.length;
  _$jscoverage['/lang/object.js'].lineData[146]++;
  for (i = 0; visit213_146_1(i < l); i++) {
    _$jscoverage['/lang/object.js'].lineData[147]++;
    S.mix(o, var_args[i]);
  }
  _$jscoverage['/lang/object.js'].lineData[149]++;
  return o;
}, 
  augment: function(r, var_args) {
  _$jscoverage['/lang/object.js'].functionData[6]++;
  _$jscoverage['/lang/object.js'].lineData[162]++;
  var args = S.makeArray(arguments), len = args.length - 2, i = 1, p, proto, arg, ov = args[len], wl = args[len + 1];
  _$jscoverage['/lang/object.js'].lineData[171]++;
  if (visit214_171_1(!S.isArray(wl))) {
    _$jscoverage['/lang/object.js'].lineData[172]++;
    ov = wl;
    _$jscoverage['/lang/object.js'].lineData[173]++;
    wl = undefined;
    _$jscoverage['/lang/object.js'].lineData[174]++;
    len++;
  }
  _$jscoverage['/lang/object.js'].lineData[176]++;
  if (visit215_176_1(typeof ov !== 'boolean')) {
    _$jscoverage['/lang/object.js'].lineData[177]++;
    ov = undefined;
    _$jscoverage['/lang/object.js'].lineData[178]++;
    len++;
  }
  _$jscoverage['/lang/object.js'].lineData[181]++;
  for (; visit216_181_1(i < len); i++) {
    _$jscoverage['/lang/object.js'].lineData[182]++;
    arg = args[i];
    _$jscoverage['/lang/object.js'].lineData[183]++;
    if (visit217_183_1(proto = arg.prototype)) {
      _$jscoverage['/lang/object.js'].lineData[184]++;
      arg = {};
      _$jscoverage['/lang/object.js'].lineData[185]++;
      var protoArray = S.keys(proto);
      _$jscoverage['/lang/object.js'].lineData[186]++;
      var protoLen = protoArray.length;
      _$jscoverage['/lang/object.js'].lineData[187]++;
      for (var j = 0; visit218_187_1(j < protoLen); j++) {
        _$jscoverage['/lang/object.js'].lineData[188]++;
        p = protoArray[j];
        _$jscoverage['/lang/object.js'].lineData[189]++;
        if (visit219_189_1(p != 'constructor')) {
          _$jscoverage['/lang/object.js'].lineData[190]++;
          arg[p] = proto[p];
        }
      }
    }
    _$jscoverage['/lang/object.js'].lineData[194]++;
    S.mix(r.prototype, arg, ov, wl);
  }
  _$jscoverage['/lang/object.js'].lineData[197]++;
  return r;
}, 
  extend: function(r, s, px, sx) {
  _$jscoverage['/lang/object.js'].functionData[7]++;
  _$jscoverage['/lang/object.js'].lineData[212]++;
  if (visit220_212_1(!s || !r)) {
    _$jscoverage['/lang/object.js'].lineData[213]++;
    return r;
  }
  _$jscoverage['/lang/object.js'].lineData[216]++;
  var sp = s.prototype, rp;
  _$jscoverage['/lang/object.js'].lineData[221]++;
  sp.constructor = s;
  _$jscoverage['/lang/object.js'].lineData[224]++;
  rp = createObject(sp, r);
  _$jscoverage['/lang/object.js'].lineData[225]++;
  r.prototype = S.mix(rp, r.prototype);
  _$jscoverage['/lang/object.js'].lineData[226]++;
  r.superclass = sp;
  _$jscoverage['/lang/object.js'].lineData[229]++;
  if (visit221_229_1(px)) {
    _$jscoverage['/lang/object.js'].lineData[230]++;
    S.mix(rp, px);
  }
  _$jscoverage['/lang/object.js'].lineData[234]++;
  if (visit222_234_1(sx)) {
    _$jscoverage['/lang/object.js'].lineData[235]++;
    S.mix(r, sx);
  }
  _$jscoverage['/lang/object.js'].lineData[238]++;
  return r;
}, 
  namespace: function() {
  _$jscoverage['/lang/object.js'].functionData[8]++;
  _$jscoverage['/lang/object.js'].lineData[256]++;
  var args = S.makeArray(arguments), l = args.length, o = null, i, j, p, global = (visit223_259_1(visit224_259_2(args[l - 1] === TRUE) && l--));
  _$jscoverage['/lang/object.js'].lineData[261]++;
  for (i = 0; visit225_261_1(i < l); i++) {
    _$jscoverage['/lang/object.js'].lineData[262]++;
    p = (EMPTY + args[i]).split('.');
    _$jscoverage['/lang/object.js'].lineData[263]++;
    o = global ? host : this;
    _$jscoverage['/lang/object.js'].lineData[264]++;
    for (j = (visit226_264_1(host[p[0]] === o)) ? 1 : 0; visit227_264_2(j < p.length); ++j) {
      _$jscoverage['/lang/object.js'].lineData[265]++;
      o = o[p[j]] = visit228_265_1(o[p[j]] || {});
    }
  }
  _$jscoverage['/lang/object.js'].lineData[268]++;
  return o;
}});
  _$jscoverage['/lang/object.js'].lineData[273]++;
  function Empty() {
    _$jscoverage['/lang/object.js'].functionData[9]++;
  }
  _$jscoverage['/lang/object.js'].lineData[276]++;
  function createObject(proto, constructor) {
    _$jscoverage['/lang/object.js'].functionData[10]++;
    _$jscoverage['/lang/object.js'].lineData[277]++;
    var newProto;
    _$jscoverage['/lang/object.js'].lineData[278]++;
    if (visit229_278_1(ObjectCreate)) {
      _$jscoverage['/lang/object.js'].lineData[279]++;
      newProto = ObjectCreate(proto);
    } else {
      _$jscoverage['/lang/object.js'].lineData[281]++;
      Empty.prototype = proto;
      _$jscoverage['/lang/object.js'].lineData[282]++;
      newProto = new Empty();
    }
    _$jscoverage['/lang/object.js'].lineData[284]++;
    newProto.constructor = constructor;
    _$jscoverage['/lang/object.js'].lineData[285]++;
    return newProto;
  }
  _$jscoverage['/lang/object.js'].lineData[288]++;
  function mix(r, s) {
    _$jscoverage['/lang/object.js'].functionData[11]++;
    _$jscoverage['/lang/object.js'].lineData[289]++;
    for (var i in s) {
      _$jscoverage['/lang/object.js'].lineData[290]++;
      r[i] = s[i];
    }
  }
  _$jscoverage['/lang/object.js'].lineData[294]++;
  function mixInternal(r, s, ov, wl, deep, cache) {
    _$jscoverage['/lang/object.js'].functionData[12]++;
    _$jscoverage['/lang/object.js'].lineData[295]++;
    if (visit230_295_1(!s || !r)) {
      _$jscoverage['/lang/object.js'].lineData[296]++;
      return r;
    }
    _$jscoverage['/lang/object.js'].lineData[298]++;
    var i, p, keys, len;
    _$jscoverage['/lang/object.js'].lineData[301]++;
    s[MIX_CIRCULAR_DETECTION] = r;
    _$jscoverage['/lang/object.js'].lineData[304]++;
    cache.push(s);
    _$jscoverage['/lang/object.js'].lineData[307]++;
    keys = S.keys(s);
    _$jscoverage['/lang/object.js'].lineData[308]++;
    len = keys.length;
    _$jscoverage['/lang/object.js'].lineData[309]++;
    for (i = 0; visit231_309_1(i < len); i++) {
      _$jscoverage['/lang/object.js'].lineData[310]++;
      p = keys[i];
      _$jscoverage['/lang/object.js'].lineData[311]++;
      if (visit232_311_1(p != MIX_CIRCULAR_DETECTION)) {
        _$jscoverage['/lang/object.js'].lineData[313]++;
        _mix(p, r, s, ov, wl, deep, cache);
      }
    }
    _$jscoverage['/lang/object.js'].lineData[317]++;
    return r;
  }
  _$jscoverage['/lang/object.js'].lineData[320]++;
  function _mix(p, r, s, ov, wl, deep, cache) {
    _$jscoverage['/lang/object.js'].functionData[13]++;
    _$jscoverage['/lang/object.js'].lineData[324]++;
    if (visit233_324_1(ov || visit234_324_2(!(p in r) || deep))) {
      _$jscoverage['/lang/object.js'].lineData[325]++;
      var target = r[p], src = s[p];
      _$jscoverage['/lang/object.js'].lineData[328]++;
      if (visit235_328_1(target === src)) {
        _$jscoverage['/lang/object.js'].lineData[330]++;
        if (visit236_330_1(target === undefined)) {
          _$jscoverage['/lang/object.js'].lineData[331]++;
          r[p] = target;
        }
        _$jscoverage['/lang/object.js'].lineData[333]++;
        return;
      }
      _$jscoverage['/lang/object.js'].lineData[335]++;
      if (visit237_335_1(wl)) {
        _$jscoverage['/lang/object.js'].lineData[336]++;
        src = wl.call(s, p, src);
      }
      _$jscoverage['/lang/object.js'].lineData[339]++;
      if (visit238_339_1(deep && visit239_339_2(src && (visit240_339_3(S.isArray(src) || S.isPlainObject(src)))))) {
        _$jscoverage['/lang/object.js'].lineData[340]++;
        if (visit241_340_1(src[MIX_CIRCULAR_DETECTION])) {
          _$jscoverage['/lang/object.js'].lineData[341]++;
          r[p] = src[MIX_CIRCULAR_DETECTION];
        } else {
          _$jscoverage['/lang/object.js'].lineData[345]++;
          var clone = visit242_345_1(target && (visit243_345_2(S.isArray(target) || S.isPlainObject(target)))) ? target : (S.isArray(src) ? [] : {});
          _$jscoverage['/lang/object.js'].lineData[348]++;
          r[p] = clone;
          _$jscoverage['/lang/object.js'].lineData[349]++;
          mixInternal(clone, src, ov, wl, TRUE, cache);
        }
      } else {
        _$jscoverage['/lang/object.js'].lineData[351]++;
        if (visit244_351_1(visit245_351_2(src !== undefined) && (visit246_351_3(ov || !(p in r))))) {
          _$jscoverage['/lang/object.js'].lineData[352]++;
          r[p] = src;
        }
      }
    }
  }
})(KISSY);
