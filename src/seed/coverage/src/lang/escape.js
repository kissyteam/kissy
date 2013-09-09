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
if (! _$jscoverage['/lang/escape.js']) {
  _$jscoverage['/lang/escape.js'] = {};
  _$jscoverage['/lang/escape.js'].lineData = [];
  _$jscoverage['/lang/escape.js'].lineData[7] = 0;
  _$jscoverage['/lang/escape.js'].lineData[11] = 0;
  _$jscoverage['/lang/escape.js'].lineData[34] = 0;
  _$jscoverage['/lang/escape.js'].lineData[35] = 0;
  _$jscoverage['/lang/escape.js'].lineData[36] = 0;
  _$jscoverage['/lang/escape.js'].lineData[40] = 0;
  _$jscoverage['/lang/escape.js'].lineData[41] = 0;
  _$jscoverage['/lang/escape.js'].lineData[43] = 0;
  _$jscoverage['/lang/escape.js'].lineData[46] = 0;
  _$jscoverage['/lang/escape.js'].lineData[47] = 0;
  _$jscoverage['/lang/escape.js'].lineData[48] = 0;
  _$jscoverage['/lang/escape.js'].lineData[50] = 0;
  _$jscoverage['/lang/escape.js'].lineData[51] = 0;
  _$jscoverage['/lang/escape.js'].lineData[52] = 0;
  _$jscoverage['/lang/escape.js'].lineData[54] = 0;
  _$jscoverage['/lang/escape.js'].lineData[55] = 0;
  _$jscoverage['/lang/escape.js'].lineData[58] = 0;
  _$jscoverage['/lang/escape.js'].lineData[59] = 0;
  _$jscoverage['/lang/escape.js'].lineData[60] = 0;
  _$jscoverage['/lang/escape.js'].lineData[62] = 0;
  _$jscoverage['/lang/escape.js'].lineData[63] = 0;
  _$jscoverage['/lang/escape.js'].lineData[64] = 0;
  _$jscoverage['/lang/escape.js'].lineData[66] = 0;
  _$jscoverage['/lang/escape.js'].lineData[67] = 0;
  _$jscoverage['/lang/escape.js'].lineData[70] = 0;
  _$jscoverage['/lang/escape.js'].lineData[79] = 0;
  _$jscoverage['/lang/escape.js'].lineData[90] = 0;
  _$jscoverage['/lang/escape.js'].lineData[99] = 0;
  _$jscoverage['/lang/escape.js'].lineData[100] = 0;
  _$jscoverage['/lang/escape.js'].lineData[117] = 0;
  _$jscoverage['/lang/escape.js'].lineData[118] = 0;
  _$jscoverage['/lang/escape.js'].lineData[129] = 0;
  _$jscoverage['/lang/escape.js'].lineData[141] = 0;
  _$jscoverage['/lang/escape.js'].lineData[142] = 0;
  _$jscoverage['/lang/escape.js'].lineData[164] = 0;
  _$jscoverage['/lang/escape.js'].lineData[165] = 0;
  _$jscoverage['/lang/escape.js'].lineData[166] = 0;
  _$jscoverage['/lang/escape.js'].lineData[167] = 0;
  _$jscoverage['/lang/escape.js'].lineData[169] = 0;
  _$jscoverage['/lang/escape.js'].lineData[171] = 0;
  _$jscoverage['/lang/escape.js'].lineData[173] = 0;
  _$jscoverage['/lang/escape.js'].lineData[174] = 0;
  _$jscoverage['/lang/escape.js'].lineData[177] = 0;
  _$jscoverage['/lang/escape.js'].lineData[178] = 0;
  _$jscoverage['/lang/escape.js'].lineData[179] = 0;
  _$jscoverage['/lang/escape.js'].lineData[180] = 0;
  _$jscoverage['/lang/escape.js'].lineData[182] = 0;
  _$jscoverage['/lang/escape.js'].lineData[185] = 0;
  _$jscoverage['/lang/escape.js'].lineData[186] = 0;
  _$jscoverage['/lang/escape.js'].lineData[187] = 0;
  _$jscoverage['/lang/escape.js'].lineData[188] = 0;
  _$jscoverage['/lang/escape.js'].lineData[189] = 0;
  _$jscoverage['/lang/escape.js'].lineData[190] = 0;
  _$jscoverage['/lang/escape.js'].lineData[191] = 0;
  _$jscoverage['/lang/escape.js'].lineData[193] = 0;
  _$jscoverage['/lang/escape.js'].lineData[200] = 0;
  _$jscoverage['/lang/escape.js'].lineData[201] = 0;
  _$jscoverage['/lang/escape.js'].lineData[220] = 0;
  _$jscoverage['/lang/escape.js'].lineData[221] = 0;
  _$jscoverage['/lang/escape.js'].lineData[223] = 0;
  _$jscoverage['/lang/escape.js'].lineData[224] = 0;
  _$jscoverage['/lang/escape.js'].lineData[225] = 0;
  _$jscoverage['/lang/escape.js'].lineData[232] = 0;
  _$jscoverage['/lang/escape.js'].lineData[233] = 0;
  _$jscoverage['/lang/escape.js'].lineData[234] = 0;
  _$jscoverage['/lang/escape.js'].lineData[235] = 0;
  _$jscoverage['/lang/escape.js'].lineData[236] = 0;
  _$jscoverage['/lang/escape.js'].lineData[239] = 0;
  _$jscoverage['/lang/escape.js'].lineData[240] = 0;
  _$jscoverage['/lang/escape.js'].lineData[241] = 0;
  _$jscoverage['/lang/escape.js'].lineData[242] = 0;
  _$jscoverage['/lang/escape.js'].lineData[244] = 0;
  _$jscoverage['/lang/escape.js'].lineData[245] = 0;
  _$jscoverage['/lang/escape.js'].lineData[247] = 0;
  _$jscoverage['/lang/escape.js'].lineData[248] = 0;
  _$jscoverage['/lang/escape.js'].lineData[251] = 0;
  _$jscoverage['/lang/escape.js'].lineData[252] = 0;
  _$jscoverage['/lang/escape.js'].lineData[253] = 0;
  _$jscoverage['/lang/escape.js'].lineData[255] = 0;
  _$jscoverage['/lang/escape.js'].lineData[258] = 0;
  _$jscoverage['/lang/escape.js'].lineData[261] = 0;
  _$jscoverage['/lang/escape.js'].lineData[265] = 0;
  _$jscoverage['/lang/escape.js'].lineData[266] = 0;
}
if (! _$jscoverage['/lang/escape.js'].functionData) {
  _$jscoverage['/lang/escape.js'].functionData = [];
  _$jscoverage['/lang/escape.js'].functionData[0] = 0;
  _$jscoverage['/lang/escape.js'].functionData[1] = 0;
  _$jscoverage['/lang/escape.js'].functionData[2] = 0;
  _$jscoverage['/lang/escape.js'].functionData[3] = 0;
  _$jscoverage['/lang/escape.js'].functionData[4] = 0;
  _$jscoverage['/lang/escape.js'].functionData[5] = 0;
  _$jscoverage['/lang/escape.js'].functionData[6] = 0;
  _$jscoverage['/lang/escape.js'].functionData[7] = 0;
  _$jscoverage['/lang/escape.js'].functionData[8] = 0;
  _$jscoverage['/lang/escape.js'].functionData[9] = 0;
  _$jscoverage['/lang/escape.js'].functionData[10] = 0;
  _$jscoverage['/lang/escape.js'].functionData[11] = 0;
  _$jscoverage['/lang/escape.js'].functionData[12] = 0;
  _$jscoverage['/lang/escape.js'].functionData[13] = 0;
  _$jscoverage['/lang/escape.js'].functionData[14] = 0;
  _$jscoverage['/lang/escape.js'].functionData[15] = 0;
  _$jscoverage['/lang/escape.js'].functionData[16] = 0;
  _$jscoverage['/lang/escape.js'].functionData[17] = 0;
}
if (! _$jscoverage['/lang/escape.js'].branchData) {
  _$jscoverage['/lang/escape.js'].branchData = {};
  _$jscoverage['/lang/escape.js'].branchData['43'] = [];
  _$jscoverage['/lang/escape.js'].branchData['43'][1] = new BranchData();
  _$jscoverage['/lang/escape.js'].branchData['43'][2] = new BranchData();
  _$jscoverage['/lang/escape.js'].branchData['43'][3] = new BranchData();
  _$jscoverage['/lang/escape.js'].branchData['43'][4] = new BranchData();
  _$jscoverage['/lang/escape.js'].branchData['43'][5] = new BranchData();
  _$jscoverage['/lang/escape.js'].branchData['47'] = [];
  _$jscoverage['/lang/escape.js'].branchData['47'][1] = new BranchData();
  _$jscoverage['/lang/escape.js'].branchData['59'] = [];
  _$jscoverage['/lang/escape.js'].branchData['59'][1] = new BranchData();
  _$jscoverage['/lang/escape.js'].branchData['142'] = [];
  _$jscoverage['/lang/escape.js'].branchData['142'][1] = new BranchData();
  _$jscoverage['/lang/escape.js'].branchData['164'] = [];
  _$jscoverage['/lang/escape.js'].branchData['164'][1] = new BranchData();
  _$jscoverage['/lang/escape.js'].branchData['165'] = [];
  _$jscoverage['/lang/escape.js'].branchData['165'][1] = new BranchData();
  _$jscoverage['/lang/escape.js'].branchData['166'] = [];
  _$jscoverage['/lang/escape.js'].branchData['166'][1] = new BranchData();
  _$jscoverage['/lang/escape.js'].branchData['177'] = [];
  _$jscoverage['/lang/escape.js'].branchData['177'][1] = new BranchData();
  _$jscoverage['/lang/escape.js'].branchData['179'] = [];
  _$jscoverage['/lang/escape.js'].branchData['179'][1] = new BranchData();
  _$jscoverage['/lang/escape.js'].branchData['185'] = [];
  _$jscoverage['/lang/escape.js'].branchData['185'][1] = new BranchData();
  _$jscoverage['/lang/escape.js'].branchData['186'] = [];
  _$jscoverage['/lang/escape.js'].branchData['186'][1] = new BranchData();
  _$jscoverage['/lang/escape.js'].branchData['188'] = [];
  _$jscoverage['/lang/escape.js'].branchData['188'][1] = new BranchData();
  _$jscoverage['/lang/escape.js'].branchData['190'] = [];
  _$jscoverage['/lang/escape.js'].branchData['190'][1] = new BranchData();
  _$jscoverage['/lang/escape.js'].branchData['220'] = [];
  _$jscoverage['/lang/escape.js'].branchData['220'][1] = new BranchData();
  _$jscoverage['/lang/escape.js'].branchData['220'][2] = new BranchData();
  _$jscoverage['/lang/escape.js'].branchData['223'] = [];
  _$jscoverage['/lang/escape.js'].branchData['223'][1] = new BranchData();
  _$jscoverage['/lang/escape.js'].branchData['224'] = [];
  _$jscoverage['/lang/escape.js'].branchData['224'][1] = new BranchData();
  _$jscoverage['/lang/escape.js'].branchData['232'] = [];
  _$jscoverage['/lang/escape.js'].branchData['232'][1] = new BranchData();
  _$jscoverage['/lang/escape.js'].branchData['234'] = [];
  _$jscoverage['/lang/escape.js'].branchData['234'][1] = new BranchData();
  _$jscoverage['/lang/escape.js'].branchData['247'] = [];
  _$jscoverage['/lang/escape.js'].branchData['247'][1] = new BranchData();
  _$jscoverage['/lang/escape.js'].branchData['251'] = [];
  _$jscoverage['/lang/escape.js'].branchData['251'][1] = new BranchData();
  _$jscoverage['/lang/escape.js'].branchData['252'] = [];
  _$jscoverage['/lang/escape.js'].branchData['252'][1] = new BranchData();
}
_$jscoverage['/lang/escape.js'].branchData['252'][1].init(26, 19, 'S.isArray(ret[key])');
function visit149_252_1(result) {
  _$jscoverage['/lang/escape.js'].branchData['252'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/escape.js'].branchData['251'][1].init(797, 10, 'key in ret');
function visit148_251_1(result) {
  _$jscoverage['/lang/escape.js'].branchData['251'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/escape.js'].branchData['247'][1].init(448, 21, 'S.endsWith(key, \'[]\')');
function visit147_247_1(result) {
  _$jscoverage['/lang/escape.js'].branchData['247'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/escape.js'].branchData['234'][1].init(71, 13, 'eqIndex == -1');
function visit146_234_1(result) {
  _$jscoverage['/lang/escape.js'].branchData['234'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/escape.js'].branchData['232'][1].init(396, 7, 'i < len');
function visit145_232_1(result) {
  _$jscoverage['/lang/escape.js'].branchData['232'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/escape.js'].branchData['224'][1].init(160, 8, 'eq || EQ');
function visit144_224_1(result) {
  _$jscoverage['/lang/escape.js'].branchData['224'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/escape.js'].branchData['223'][1].init(130, 10, 'sep || SEP');
function visit143_223_1(result) {
  _$jscoverage['/lang/escape.js'].branchData['223'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/escape.js'].branchData['220'][2].init(18, 22, 'typeof str != \'string\'');
function visit142_220_2(result) {
  _$jscoverage['/lang/escape.js'].branchData['220'][2].ranCondition(result);
  return result;
}_$jscoverage['/lang/escape.js'].branchData['220'][1].init(18, 46, 'typeof str != \'string\' || !(str = S.trim(str))');
function visit141_220_1(result) {
  _$jscoverage['/lang/escape.js'].branchData['220'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/escape.js'].branchData['190'][1].init(119, 15, 'v !== undefined');
function visit140_190_1(result) {
  _$jscoverage['/lang/escape.js'].branchData['190'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/escape.js'].branchData['188'][1].init(67, 20, 'isValidParamValue(v)');
function visit139_188_1(result) {
  _$jscoverage['/lang/escape.js'].branchData['188'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/escape.js'].branchData['186'][1].init(52, 7, 'i < len');
function visit138_186_1(result) {
  _$jscoverage['/lang/escape.js'].branchData['186'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/escape.js'].branchData['185'][1].init(458, 28, 'S.isArray(val) && val.length');
function visit137_185_1(result) {
  _$jscoverage['/lang/escape.js'].branchData['185'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/escape.js'].branchData['179'][1].init(62, 17, 'val !== undefined');
function visit136_179_1(result) {
  _$jscoverage['/lang/escape.js'].branchData['179'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/escape.js'].branchData['177'][1].init(142, 22, 'isValidParamValue(val)');
function visit135_177_1(result) {
  _$jscoverage['/lang/escape.js'].branchData['177'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/escape.js'].branchData['166'][1].init(77, 28, 'serializeArray === undefined');
function visit134_166_1(result) {
  _$jscoverage['/lang/escape.js'].branchData['166'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/escape.js'].branchData['165'][1].init(50, 8, 'eq || EQ');
function visit133_165_1(result) {
  _$jscoverage['/lang/escape.js'].branchData['165'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/escape.js'].branchData['164'][1].init(20, 10, 'sep || SEP');
function visit132_164_1(result) {
  _$jscoverage['/lang/escape.js'].branchData['164'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/escape.js'].branchData['142'][1].init(25, 42, 'htmlEntities[m] || String.fromCharCode(+n)');
function visit131_142_1(result) {
  _$jscoverage['/lang/escape.js'].branchData['142'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/escape.js'].branchData['59'][1].init(14, 11, 'unEscapeReg');
function visit130_59_1(result) {
  _$jscoverage['/lang/escape.js'].branchData['59'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/escape.js'].branchData['47'][1].init(14, 9, 'escapeReg');
function visit129_47_1(result) {
  _$jscoverage['/lang/escape.js'].branchData['47'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/escape.js'].branchData['43'][5].init(169, 16, 't !== \'function\'');
function visit128_43_5(result) {
  _$jscoverage['/lang/escape.js'].branchData['43'][5].ranCondition(result);
  return result;
}_$jscoverage['/lang/escape.js'].branchData['43'][4].init(151, 14, 't !== \'object\'');
function visit127_43_4(result) {
  _$jscoverage['/lang/escape.js'].branchData['43'][4].ranCondition(result);
  return result;
}_$jscoverage['/lang/escape.js'].branchData['43'][3].init(151, 34, 't !== \'object\' && t !== \'function\'');
function visit126_43_3(result) {
  _$jscoverage['/lang/escape.js'].branchData['43'][3].ranCondition(result);
  return result;
}_$jscoverage['/lang/escape.js'].branchData['43'][2].init(135, 11, 'val == null');
function visit125_43_2(result) {
  _$jscoverage['/lang/escape.js'].branchData['43'][2].ranCondition(result);
  return result;
}_$jscoverage['/lang/escape.js'].branchData['43'][1].init(135, 51, 'val == null || (t !== \'object\' && t !== \'function\')');
function visit124_43_1(result) {
  _$jscoverage['/lang/escape.js'].branchData['43'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/escape.js'].lineData[7]++;
(function(S, undefined) {
  _$jscoverage['/lang/escape.js'].functionData[0]++;
  _$jscoverage['/lang/escape.js'].lineData[11]++;
  var SEP = '&', EMPTY = '', EQ = '=', logger = S.getLogger('s/lang'), TRUE = true, HEX_BASE = 16, htmlEntities = {
  '&amp;': '&', 
  '&gt;': '>', 
  '&lt;': '<', 
  '&#x60;': '`', 
  '&#x2F;': '/', 
  '&quot;': '"', 
  '&#x27;': "'"}, reverseEntities = {}, escapeReg, unEscapeReg, escapeRegExp = /[\-#$\^*()+\[\]{}|\\,.?\s]/g;
  _$jscoverage['/lang/escape.js'].lineData[34]++;
  (function() {
  _$jscoverage['/lang/escape.js'].functionData[1]++;
  _$jscoverage['/lang/escape.js'].lineData[35]++;
  for (var k in htmlEntities) {
    _$jscoverage['/lang/escape.js'].lineData[36]++;
    reverseEntities[htmlEntities[k]] = k;
  }
})();
  _$jscoverage['/lang/escape.js'].lineData[40]++;
  function isValidParamValue(val) {
    _$jscoverage['/lang/escape.js'].functionData[2]++;
    _$jscoverage['/lang/escape.js'].lineData[41]++;
    var t = typeof val;
    _$jscoverage['/lang/escape.js'].lineData[43]++;
    return visit124_43_1(visit125_43_2(val == null) || (visit126_43_3(visit127_43_4(t !== 'object') && visit128_43_5(t !== 'function'))));
  }
  _$jscoverage['/lang/escape.js'].lineData[46]++;
  function getEscapeReg() {
    _$jscoverage['/lang/escape.js'].functionData[3]++;
    _$jscoverage['/lang/escape.js'].lineData[47]++;
    if (visit129_47_1(escapeReg)) {
      _$jscoverage['/lang/escape.js'].lineData[48]++;
      return escapeReg;
    }
    _$jscoverage['/lang/escape.js'].lineData[50]++;
    var str = EMPTY;
    _$jscoverage['/lang/escape.js'].lineData[51]++;
    S.each(htmlEntities, function(entity) {
  _$jscoverage['/lang/escape.js'].functionData[4]++;
  _$jscoverage['/lang/escape.js'].lineData[52]++;
  str += entity + '|';
});
    _$jscoverage['/lang/escape.js'].lineData[54]++;
    str = str.slice(0, -1);
    _$jscoverage['/lang/escape.js'].lineData[55]++;
    return escapeReg = new RegExp(str, 'g');
  }
  _$jscoverage['/lang/escape.js'].lineData[58]++;
  function getUnEscapeReg() {
    _$jscoverage['/lang/escape.js'].functionData[5]++;
    _$jscoverage['/lang/escape.js'].lineData[59]++;
    if (visit130_59_1(unEscapeReg)) {
      _$jscoverage['/lang/escape.js'].lineData[60]++;
      return unEscapeReg;
    }
    _$jscoverage['/lang/escape.js'].lineData[62]++;
    var str = EMPTY;
    _$jscoverage['/lang/escape.js'].lineData[63]++;
    S.each(reverseEntities, function(entity) {
  _$jscoverage['/lang/escape.js'].functionData[6]++;
  _$jscoverage['/lang/escape.js'].lineData[64]++;
  str += entity + '|';
});
    _$jscoverage['/lang/escape.js'].lineData[66]++;
    str += '&#(\\d{1,5});';
    _$jscoverage['/lang/escape.js'].lineData[67]++;
    return unEscapeReg = new RegExp(str, 'g');
  }
  _$jscoverage['/lang/escape.js'].lineData[70]++;
  S.mix(S, {
  urlEncode: function(s) {
  _$jscoverage['/lang/escape.js'].functionData[7]++;
  _$jscoverage['/lang/escape.js'].lineData[79]++;
  return encodeURIComponent(String(s));
}, 
  urlDecode: function(s) {
  _$jscoverage['/lang/escape.js'].functionData[8]++;
  _$jscoverage['/lang/escape.js'].lineData[90]++;
  return decodeURIComponent(s.replace(/\+/g, ' '));
}, 
  fromUnicode: function(str) {
  _$jscoverage['/lang/escape.js'].functionData[9]++;
  _$jscoverage['/lang/escape.js'].lineData[99]++;
  return str.replace(/\\u([a-f\d]{4})/ig, function(m, u) {
  _$jscoverage['/lang/escape.js'].functionData[10]++;
  _$jscoverage['/lang/escape.js'].lineData[100]++;
  return String.fromCharCode(parseInt(u, HEX_BASE));
});
}, 
  escapeHtml: function(str) {
  _$jscoverage['/lang/escape.js'].functionData[11]++;
  _$jscoverage['/lang/escape.js'].lineData[117]++;
  return (str + '').replace(getEscapeReg(), function(m) {
  _$jscoverage['/lang/escape.js'].functionData[12]++;
  _$jscoverage['/lang/escape.js'].lineData[118]++;
  return reverseEntities[m];
});
}, 
  escapeRegExp: function(str) {
  _$jscoverage['/lang/escape.js'].functionData[13]++;
  _$jscoverage['/lang/escape.js'].lineData[129]++;
  return str.replace(escapeRegExp, '\\$&');
}, 
  unEscapeHtml: function(str) {
  _$jscoverage['/lang/escape.js'].functionData[14]++;
  _$jscoverage['/lang/escape.js'].lineData[141]++;
  return str.replace(getUnEscapeReg(), function(m, n) {
  _$jscoverage['/lang/escape.js'].functionData[15]++;
  _$jscoverage['/lang/escape.js'].lineData[142]++;
  return visit131_142_1(htmlEntities[m] || String.fromCharCode(+n));
});
}, 
  param: function(o, sep, eq, serializeArray) {
  _$jscoverage['/lang/escape.js'].functionData[16]++;
  _$jscoverage['/lang/escape.js'].lineData[164]++;
  sep = visit132_164_1(sep || SEP);
  _$jscoverage['/lang/escape.js'].lineData[165]++;
  eq = visit133_165_1(eq || EQ);
  _$jscoverage['/lang/escape.js'].lineData[166]++;
  if (visit134_166_1(serializeArray === undefined)) {
    _$jscoverage['/lang/escape.js'].lineData[167]++;
    serializeArray = TRUE;
  }
  _$jscoverage['/lang/escape.js'].lineData[169]++;
  var buf = [], key, i, v, len, val, encode = S.urlEncode;
  _$jscoverage['/lang/escape.js'].lineData[171]++;
  for (key in o) {
    _$jscoverage['/lang/escape.js'].lineData[173]++;
    val = o[key];
    _$jscoverage['/lang/escape.js'].lineData[174]++;
    key = encode(key);
    _$jscoverage['/lang/escape.js'].lineData[177]++;
    if (visit135_177_1(isValidParamValue(val))) {
      _$jscoverage['/lang/escape.js'].lineData[178]++;
      buf.push(key);
      _$jscoverage['/lang/escape.js'].lineData[179]++;
      if (visit136_179_1(val !== undefined)) {
        _$jscoverage['/lang/escape.js'].lineData[180]++;
        buf.push(eq, encode(val + EMPTY));
      }
      _$jscoverage['/lang/escape.js'].lineData[182]++;
      buf.push(sep);
    } else {
      _$jscoverage['/lang/escape.js'].lineData[185]++;
      if (visit137_185_1(S.isArray(val) && val.length)) {
        _$jscoverage['/lang/escape.js'].lineData[186]++;
        for (i = 0 , len = val.length; visit138_186_1(i < len); ++i) {
          _$jscoverage['/lang/escape.js'].lineData[187]++;
          v = val[i];
          _$jscoverage['/lang/escape.js'].lineData[188]++;
          if (visit139_188_1(isValidParamValue(v))) {
            _$jscoverage['/lang/escape.js'].lineData[189]++;
            buf.push(key, (serializeArray ? encode('[]') : EMPTY));
            _$jscoverage['/lang/escape.js'].lineData[190]++;
            if (visit140_190_1(v !== undefined)) {
              _$jscoverage['/lang/escape.js'].lineData[191]++;
              buf.push(eq, encode(v + EMPTY));
            }
            _$jscoverage['/lang/escape.js'].lineData[193]++;
            buf.push(sep);
          }
        }
      }
    }
  }
  _$jscoverage['/lang/escape.js'].lineData[200]++;
  buf.pop();
  _$jscoverage['/lang/escape.js'].lineData[201]++;
  return buf.join(EMPTY);
}, 
  unparam: function(str, sep, eq) {
  _$jscoverage['/lang/escape.js'].functionData[17]++;
  _$jscoverage['/lang/escape.js'].lineData[220]++;
  if (visit141_220_1(visit142_220_2(typeof str != 'string') || !(str = S.trim(str)))) {
    _$jscoverage['/lang/escape.js'].lineData[221]++;
    return {};
  }
  _$jscoverage['/lang/escape.js'].lineData[223]++;
  sep = visit143_223_1(sep || SEP);
  _$jscoverage['/lang/escape.js'].lineData[224]++;
  eq = visit144_224_1(eq || EQ);
  _$jscoverage['/lang/escape.js'].lineData[225]++;
  var ret = {}, eqIndex, decode = S.urlDecode, pairs = str.split(sep), key, val, i = 0, len = pairs.length;
  _$jscoverage['/lang/escape.js'].lineData[232]++;
  for (; visit145_232_1(i < len); ++i) {
    _$jscoverage['/lang/escape.js'].lineData[233]++;
    eqIndex = pairs[i].indexOf(eq);
    _$jscoverage['/lang/escape.js'].lineData[234]++;
    if (visit146_234_1(eqIndex == -1)) {
      _$jscoverage['/lang/escape.js'].lineData[235]++;
      key = decode(pairs[i]);
      _$jscoverage['/lang/escape.js'].lineData[236]++;
      val = undefined;
    } else {
      _$jscoverage['/lang/escape.js'].lineData[239]++;
      key = decode(pairs[i].substring(0, eqIndex));
      _$jscoverage['/lang/escape.js'].lineData[240]++;
      val = pairs[i].substring(eqIndex + 1);
      _$jscoverage['/lang/escape.js'].lineData[241]++;
      try {
        _$jscoverage['/lang/escape.js'].lineData[242]++;
        val = decode(val);
      }      catch (e) {
  _$jscoverage['/lang/escape.js'].lineData[244]++;
  logger.error('decodeURIComponent error : ' + val);
  _$jscoverage['/lang/escape.js'].lineData[245]++;
  logger.error(e);
}
      _$jscoverage['/lang/escape.js'].lineData[247]++;
      if (visit147_247_1(S.endsWith(key, '[]'))) {
        _$jscoverage['/lang/escape.js'].lineData[248]++;
        key = key.substring(0, key.length - 2);
      }
    }
    _$jscoverage['/lang/escape.js'].lineData[251]++;
    if (visit148_251_1(key in ret)) {
      _$jscoverage['/lang/escape.js'].lineData[252]++;
      if (visit149_252_1(S.isArray(ret[key]))) {
        _$jscoverage['/lang/escape.js'].lineData[253]++;
        ret[key].push(val);
      } else {
        _$jscoverage['/lang/escape.js'].lineData[255]++;
        ret[key] = [ret[key], val];
      }
    } else {
      _$jscoverage['/lang/escape.js'].lineData[258]++;
      ret[key] = val;
    }
  }
  _$jscoverage['/lang/escape.js'].lineData[261]++;
  return ret;
}});
  _$jscoverage['/lang/escape.js'].lineData[265]++;
  S.escapeHTML = S.escapeHtml;
  _$jscoverage['/lang/escape.js'].lineData[266]++;
  S.unEscapeHTML = S.unEscapeHtml;
})(KISSY);
