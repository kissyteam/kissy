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
  _$jscoverage['/io/methods.js'].lineData[14] = 0;
  _$jscoverage['/io/methods.js'].lineData[17] = 0;
  _$jscoverage['/io/methods.js'].lineData[29] = 0;
  _$jscoverage['/io/methods.js'].lineData[31] = 0;
  _$jscoverage['/io/methods.js'].lineData[34] = 0;
  _$jscoverage['/io/methods.js'].lineData[35] = 0;
  _$jscoverage['/io/methods.js'].lineData[38] = 0;
  _$jscoverage['/io/methods.js'].lineData[40] = 0;
  _$jscoverage['/io/methods.js'].lineData[41] = 0;
  _$jscoverage['/io/methods.js'].lineData[42] = 0;
  _$jscoverage['/io/methods.js'].lineData[43] = 0;
  _$jscoverage['/io/methods.js'].lineData[45] = 0;
  _$jscoverage['/io/methods.js'].lineData[50] = 0;
  _$jscoverage['/io/methods.js'].lineData[53] = 0;
  _$jscoverage['/io/methods.js'].lineData[54] = 0;
  _$jscoverage['/io/methods.js'].lineData[55] = 0;
  _$jscoverage['/io/methods.js'].lineData[56] = 0;
  _$jscoverage['/io/methods.js'].lineData[59] = 0;
  _$jscoverage['/io/methods.js'].lineData[60] = 0;
  _$jscoverage['/io/methods.js'].lineData[61] = 0;
  _$jscoverage['/io/methods.js'].lineData[65] = 0;
  _$jscoverage['/io/methods.js'].lineData[66] = 0;
  _$jscoverage['/io/methods.js'].lineData[68] = 0;
  _$jscoverage['/io/methods.js'].lineData[69] = 0;
  _$jscoverage['/io/methods.js'].lineData[71] = 0;
  _$jscoverage['/io/methods.js'].lineData[72] = 0;
  _$jscoverage['/io/methods.js'].lineData[73] = 0;
  _$jscoverage['/io/methods.js'].lineData[74] = 0;
  _$jscoverage['/io/methods.js'].lineData[76] = 0;
  _$jscoverage['/io/methods.js'].lineData[80] = 0;
  _$jscoverage['/io/methods.js'].lineData[83] = 0;
  _$jscoverage['/io/methods.js'].lineData[84] = 0;
  _$jscoverage['/io/methods.js'].lineData[86] = 0;
  _$jscoverage['/io/methods.js'].lineData[88] = 0;
  _$jscoverage['/io/methods.js'].lineData[89] = 0;
  _$jscoverage['/io/methods.js'].lineData[91] = 0;
  _$jscoverage['/io/methods.js'].lineData[93] = 0;
  _$jscoverage['/io/methods.js'].lineData[96] = 0;
  _$jscoverage['/io/methods.js'].lineData[99] = 0;
  _$jscoverage['/io/methods.js'].lineData[103] = 0;
  _$jscoverage['/io/methods.js'].lineData[104] = 0;
  _$jscoverage['/io/methods.js'].lineData[105] = 0;
  _$jscoverage['/io/methods.js'].lineData[114] = 0;
  _$jscoverage['/io/methods.js'].lineData[115] = 0;
  _$jscoverage['/io/methods.js'].lineData[125] = 0;
  _$jscoverage['/io/methods.js'].lineData[126] = 0;
  _$jscoverage['/io/methods.js'].lineData[127] = 0;
  _$jscoverage['/io/methods.js'].lineData[128] = 0;
  _$jscoverage['/io/methods.js'].lineData[129] = 0;
  _$jscoverage['/io/methods.js'].lineData[130] = 0;
  _$jscoverage['/io/methods.js'].lineData[133] = 0;
  _$jscoverage['/io/methods.js'].lineData[135] = 0;
  _$jscoverage['/io/methods.js'].lineData[140] = 0;
  _$jscoverage['/io/methods.js'].lineData[141] = 0;
  _$jscoverage['/io/methods.js'].lineData[142] = 0;
  _$jscoverage['/io/methods.js'].lineData[144] = 0;
  _$jscoverage['/io/methods.js'].lineData[154] = 0;
  _$jscoverage['/io/methods.js'].lineData[155] = 0;
  _$jscoverage['/io/methods.js'].lineData[156] = 0;
  _$jscoverage['/io/methods.js'].lineData[157] = 0;
  _$jscoverage['/io/methods.js'].lineData[159] = 0;
  _$jscoverage['/io/methods.js'].lineData[160] = 0;
  _$jscoverage['/io/methods.js'].lineData[169] = 0;
  _$jscoverage['/io/methods.js'].lineData[170] = 0;
  _$jscoverage['/io/methods.js'].lineData[171] = 0;
  _$jscoverage['/io/methods.js'].lineData[173] = 0;
  _$jscoverage['/io/methods.js'].lineData[177] = 0;
  _$jscoverage['/io/methods.js'].lineData[184] = 0;
  _$jscoverage['/io/methods.js'].lineData[185] = 0;
  _$jscoverage['/io/methods.js'].lineData[187] = 0;
  _$jscoverage['/io/methods.js'].lineData[188] = 0;
  _$jscoverage['/io/methods.js'].lineData[189] = 0;
  _$jscoverage['/io/methods.js'].lineData[190] = 0;
  _$jscoverage['/io/methods.js'].lineData[193] = 0;
  _$jscoverage['/io/methods.js'].lineData[194] = 0;
  _$jscoverage['/io/methods.js'].lineData[195] = 0;
  _$jscoverage['/io/methods.js'].lineData[197] = 0;
  _$jscoverage['/io/methods.js'].lineData[198] = 0;
  _$jscoverage['/io/methods.js'].lineData[199] = 0;
  _$jscoverage['/io/methods.js'].lineData[200] = 0;
  _$jscoverage['/io/methods.js'].lineData[202] = 0;
  _$jscoverage['/io/methods.js'].lineData[203] = 0;
  _$jscoverage['/io/methods.js'].lineData[208] = 0;
  _$jscoverage['/io/methods.js'].lineData[209] = 0;
  _$jscoverage['/io/methods.js'].lineData[213] = 0;
  _$jscoverage['/io/methods.js'].lineData[214] = 0;
  _$jscoverage['/io/methods.js'].lineData[216] = 0;
  _$jscoverage['/io/methods.js'].lineData[219] = 0;
  _$jscoverage['/io/methods.js'].lineData[220] = 0;
  _$jscoverage['/io/methods.js'].lineData[221] = 0;
  _$jscoverage['/io/methods.js'].lineData[249] = 0;
  _$jscoverage['/io/methods.js'].lineData[258] = 0;
  _$jscoverage['/io/methods.js'].lineData[259] = 0;
  _$jscoverage['/io/methods.js'].lineData[261] = 0;
  _$jscoverage['/io/methods.js'].lineData[262] = 0;
  _$jscoverage['/io/methods.js'].lineData[264] = 0;
  _$jscoverage['/io/methods.js'].lineData[265] = 0;
  _$jscoverage['/io/methods.js'].lineData[266] = 0;
  _$jscoverage['/io/methods.js'].lineData[277] = 0;
  _$jscoverage['/io/methods.js'].lineData[282] = 0;
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
  _$jscoverage['/io/methods.js'].branchData['29'] = [];
  _$jscoverage['/io/methods.js'].branchData['29'][1] = new BranchData();
  _$jscoverage['/io/methods.js'].branchData['31'] = [];
  _$jscoverage['/io/methods.js'].branchData['31'][1] = new BranchData();
  _$jscoverage['/io/methods.js'].branchData['34'] = [];
  _$jscoverage['/io/methods.js'].branchData['34'][1] = new BranchData();
  _$jscoverage['/io/methods.js'].branchData['38'] = [];
  _$jscoverage['/io/methods.js'].branchData['38'][1] = new BranchData();
  _$jscoverage['/io/methods.js'].branchData['41'] = [];
  _$jscoverage['/io/methods.js'].branchData['41'][1] = new BranchData();
  _$jscoverage['/io/methods.js'].branchData['42'] = [];
  _$jscoverage['/io/methods.js'].branchData['42'][1] = new BranchData();
  _$jscoverage['/io/methods.js'].branchData['50'] = [];
  _$jscoverage['/io/methods.js'].branchData['50'][1] = new BranchData();
  _$jscoverage['/io/methods.js'].branchData['53'] = [];
  _$jscoverage['/io/methods.js'].branchData['53'][1] = new BranchData();
  _$jscoverage['/io/methods.js'].branchData['54'] = [];
  _$jscoverage['/io/methods.js'].branchData['54'][1] = new BranchData();
  _$jscoverage['/io/methods.js'].branchData['54'][2] = new BranchData();
  _$jscoverage['/io/methods.js'].branchData['54'][3] = new BranchData();
  _$jscoverage['/io/methods.js'].branchData['59'] = [];
  _$jscoverage['/io/methods.js'].branchData['59'][1] = new BranchData();
  _$jscoverage['/io/methods.js'].branchData['59'][2] = new BranchData();
  _$jscoverage['/io/methods.js'].branchData['59'][3] = new BranchData();
  _$jscoverage['/io/methods.js'].branchData['65'] = [];
  _$jscoverage['/io/methods.js'].branchData['65'][1] = new BranchData();
  _$jscoverage['/io/methods.js'].branchData['70'] = [];
  _$jscoverage['/io/methods.js'].branchData['70'][1] = new BranchData();
  _$jscoverage['/io/methods.js'].branchData['71'] = [];
  _$jscoverage['/io/methods.js'].branchData['71'][1] = new BranchData();
  _$jscoverage['/io/methods.js'].branchData['73'] = [];
  _$jscoverage['/io/methods.js'].branchData['73'][1] = new BranchData();
  _$jscoverage['/io/methods.js'].branchData['83'] = [];
  _$jscoverage['/io/methods.js'].branchData['83'][1] = new BranchData();
  _$jscoverage['/io/methods.js'].branchData['86'] = [];
  _$jscoverage['/io/methods.js'].branchData['86'][1] = new BranchData();
  _$jscoverage['/io/methods.js'].branchData['88'] = [];
  _$jscoverage['/io/methods.js'].branchData['88'][1] = new BranchData();
  _$jscoverage['/io/methods.js'].branchData['115'] = [];
  _$jscoverage['/io/methods.js'].branchData['115'][1] = new BranchData();
  _$jscoverage['/io/methods.js'].branchData['126'] = [];
  _$jscoverage['/io/methods.js'].branchData['126'][1] = new BranchData();
  _$jscoverage['/io/methods.js'].branchData['127'] = [];
  _$jscoverage['/io/methods.js'].branchData['127'][1] = new BranchData();
  _$jscoverage['/io/methods.js'].branchData['135'] = [];
  _$jscoverage['/io/methods.js'].branchData['135'][1] = new BranchData();
  _$jscoverage['/io/methods.js'].branchData['141'] = [];
  _$jscoverage['/io/methods.js'].branchData['141'][1] = new BranchData();
  _$jscoverage['/io/methods.js'].branchData['155'] = [];
  _$jscoverage['/io/methods.js'].branchData['155'][1] = new BranchData();
  _$jscoverage['/io/methods.js'].branchData['156'] = [];
  _$jscoverage['/io/methods.js'].branchData['156'][1] = new BranchData();
  _$jscoverage['/io/methods.js'].branchData['170'] = [];
  _$jscoverage['/io/methods.js'].branchData['170'][1] = new BranchData();
  _$jscoverage['/io/methods.js'].branchData['184'] = [];
  _$jscoverage['/io/methods.js'].branchData['184'][1] = new BranchData();
  _$jscoverage['/io/methods.js'].branchData['190'] = [];
  _$jscoverage['/io/methods.js'].branchData['190'][1] = new BranchData();
  _$jscoverage['/io/methods.js'].branchData['190'][2] = new BranchData();
  _$jscoverage['/io/methods.js'].branchData['190'][3] = new BranchData();
  _$jscoverage['/io/methods.js'].branchData['190'][4] = new BranchData();
  _$jscoverage['/io/methods.js'].branchData['190'][5] = new BranchData();
  _$jscoverage['/io/methods.js'].branchData['193'] = [];
  _$jscoverage['/io/methods.js'].branchData['193'][1] = new BranchData();
  _$jscoverage['/io/methods.js'].branchData['202'] = [];
  _$jscoverage['/io/methods.js'].branchData['202'][1] = new BranchData();
  _$jscoverage['/io/methods.js'].branchData['208'] = [];
  _$jscoverage['/io/methods.js'].branchData['208'][1] = new BranchData();
  _$jscoverage['/io/methods.js'].branchData['219'] = [];
  _$jscoverage['/io/methods.js'].branchData['219'][1] = new BranchData();
  _$jscoverage['/io/methods.js'].branchData['258'] = [];
  _$jscoverage['/io/methods.js'].branchData['258'][1] = new BranchData();
  _$jscoverage['/io/methods.js'].branchData['261'] = [];
  _$jscoverage['/io/methods.js'].branchData['261'][1] = new BranchData();
  _$jscoverage['/io/methods.js'].branchData['279'] = [];
  _$jscoverage['/io/methods.js'].branchData['279'][1] = new BranchData();
}
_$jscoverage['/io/methods.js'].branchData['279'][1].init(89, 38, 'S.Uri.getComponents(c.url).query || ""');
function visit112_279_1(result) {
  _$jscoverage['/io/methods.js'].branchData['279'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/methods.js'].branchData['261'][1].init(3091, 19, 'h = config.complete');
function visit111_261_1(result) {
  _$jscoverage['/io/methods.js'].branchData['261'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/methods.js'].branchData['258'][1].init(2989, 19, 'h = config[handler]');
function visit110_258_1(result) {
  _$jscoverage['/io/methods.js'].branchData['258'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/methods.js'].branchData['219'][1].init(1541, 32, 'timeoutTimer = self.timeoutTimer');
function visit109_219_1(result) {
  _$jscoverage['/io/methods.js'].branchData['219'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/methods.js'].branchData['208'][1].init(25, 10, 'status < 0');
function visit108_208_1(result) {
  _$jscoverage['/io/methods.js'].branchData['208'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/methods.js'].branchData['202'][1].init(42, 12, 'e.stack || e');
function visit107_202_1(result) {
  _$jscoverage['/io/methods.js'].branchData['202'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/methods.js'].branchData['193'][1].init(162, 22, 'status == NOT_MODIFIED');
function visit106_193_1(result) {
  _$jscoverage['/io/methods.js'].branchData['193'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/methods.js'].branchData['190'][5].init(461, 22, 'status == NOT_MODIFIED');
function visit105_190_5(result) {
  _$jscoverage['/io/methods.js'].branchData['190'][5].ranCondition(result);
  return result;
}_$jscoverage['/io/methods.js'].branchData['190'][4].init(432, 25, 'status < MULTIPLE_CHOICES');
function visit104_190_4(result) {
  _$jscoverage['/io/methods.js'].branchData['190'][4].ranCondition(result);
  return result;
}_$jscoverage['/io/methods.js'].branchData['190'][3].init(411, 17, 'status >= OK_CODE');
function visit103_190_3(result) {
  _$jscoverage['/io/methods.js'].branchData['190'][3].ranCondition(result);
  return result;
}_$jscoverage['/io/methods.js'].branchData['190'][2].init(411, 46, 'status >= OK_CODE && status < MULTIPLE_CHOICES');
function visit102_190_2(result) {
  _$jscoverage['/io/methods.js'].branchData['190'][2].ranCondition(result);
  return result;
}_$jscoverage['/io/methods.js'].branchData['190'][1].init(411, 72, 'status >= OK_CODE && status < MULTIPLE_CHOICES || status == NOT_MODIFIED');
function visit101_190_1(result) {
  _$jscoverage['/io/methods.js'].branchData['190'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/methods.js'].branchData['184'][1].init(226, 15, 'self.state == 2');
function visit100_184_1(result) {
  _$jscoverage['/io/methods.js'].branchData['184'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/methods.js'].branchData['170'][1].init(52, 26, 'transport = this.transport');
function visit99_170_1(result) {
  _$jscoverage['/io/methods.js'].branchData['170'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/methods.js'].branchData['156'][1].init(106, 14, 'self.transport');
function visit98_156_1(result) {
  _$jscoverage['/io/methods.js'].branchData['156'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/methods.js'].branchData['155'][1].init(63, 21, 'statusText || \'abort\'');
function visit97_155_1(result) {
  _$jscoverage['/io/methods.js'].branchData['155'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/methods.js'].branchData['141'][1].init(54, 11, '!self.state');
function visit96_141_1(result) {
  _$jscoverage['/io/methods.js'].branchData['141'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/methods.js'].branchData['135'][1].init(536, 19, 'match === undefined');
function visit95_135_1(result) {
  _$jscoverage['/io/methods.js'].branchData['135'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/methods.js'].branchData['127'][1].init(25, 41, '!(responseHeaders = self.responseHeaders)');
function visit94_127_1(result) {
  _$jscoverage['/io/methods.js'].branchData['127'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/methods.js'].branchData['126'][1].init(78, 16, 'self.state === 2');
function visit93_126_1(result) {
  _$jscoverage['/io/methods.js'].branchData['126'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/methods.js'].branchData['115'][1].init(57, 16, 'self.state === 2');
function visit92_115_1(result) {
  _$jscoverage['/io/methods.js'].branchData['115'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/methods.js'].branchData['88'][1].init(127, 10, '!converter');
function visit91_88_1(result) {
  _$jscoverage['/io/methods.js'].branchData['88'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/methods.js'].branchData['86'][1].init(62, 46, 'converts[prevType] && converts[prevType][type]');
function visit90_86_1(result) {
  _$jscoverage['/io/methods.js'].branchData['86'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/methods.js'].branchData['83'][1].init(2376, 19, 'i < dataType.length');
function visit89_83_1(result) {
  _$jscoverage['/io/methods.js'].branchData['83'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/methods.js'].branchData['73'][1].init(92, 18, 'prevType == \'text\'');
function visit88_73_1(result) {
  _$jscoverage['/io/methods.js'].branchData['73'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/methods.js'].branchData['71'][1].init(153, 30, 'converter && rawData[prevType]');
function visit87_71_1(result) {
  _$jscoverage['/io/methods.js'].branchData['71'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/methods.js'].branchData['70'][1].init(59, 46, 'converts[prevType] && converts[prevType][type]');
function visit86_70_1(result) {
  _$jscoverage['/io/methods.js'].branchData['70'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/methods.js'].branchData['65'][1].init(1209, 13, '!responseData');
function visit85_65_1(result) {
  _$jscoverage['/io/methods.js'].branchData['65'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/methods.js'].branchData['59'][3].init(273, 17, 'xml !== undefined');
function visit84_59_3(result) {
  _$jscoverage['/io/methods.js'].branchData['59'][3].ranCondition(result);
  return result;
}_$jscoverage['/io/methods.js'].branchData['59'][2].init(237, 32, 'dataType[dataTypeIndex] == \'xml\'');
function visit83_59_2(result) {
  _$jscoverage['/io/methods.js'].branchData['59'][2].ranCondition(result);
  return result;
}_$jscoverage['/io/methods.js'].branchData['59'][1].init(237, 53, 'dataType[dataTypeIndex] == \'xml\' && xml !== undefined');
function visit82_59_1(result) {
  _$jscoverage['/io/methods.js'].branchData['59'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/methods.js'].branchData['54'][3].init(58, 18, 'text !== undefined');
function visit81_54_3(result) {
  _$jscoverage['/io/methods.js'].branchData['54'][3].ranCondition(result);
  return result;
}_$jscoverage['/io/methods.js'].branchData['54'][2].init(21, 33, 'dataType[dataTypeIndex] == \'text\'');
function visit80_54_2(result) {
  _$jscoverage['/io/methods.js'].branchData['54'][2].ranCondition(result);
  return result;
}_$jscoverage['/io/methods.js'].branchData['54'][1].init(21, 55, 'dataType[dataTypeIndex] == \'text\' && text !== undefined');
function visit79_54_1(result) {
  _$jscoverage['/io/methods.js'].branchData['54'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/methods.js'].branchData['53'][1].init(749, 31, 'dataTypeIndex < dataType.length');
function visit78_53_1(result) {
  _$jscoverage['/io/methods.js'].branchData['53'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/methods.js'].branchData['50'][1].init(660, 21, 'dataType[0] || \'text\'');
function visit77_50_1(result) {
  _$jscoverage['/io/methods.js'].branchData['50'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/methods.js'].branchData['42'][1].init(29, 19, 'dataType[0] != type');
function visit76_42_1(result) {
  _$jscoverage['/io/methods.js'].branchData['42'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/methods.js'].branchData['41'][1].init(25, 32, 'contents[type].test(contentType)');
function visit75_41_1(result) {
  _$jscoverage['/io/methods.js'].branchData['41'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/methods.js'].branchData['38'][1].init(213, 16, '!dataType.length');
function visit74_38_1(result) {
  _$jscoverage['/io/methods.js'].branchData['38'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/methods.js'].branchData['34'][1].init(126, 18, 'dataType[0] == \'*\'');
function visit73_34_1(result) {
  _$jscoverage['/io/methods.js'].branchData['34'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/methods.js'].branchData['31'][1].init(28, 51, 'io.mimeType || io.getResponseHeader(\'Content-Type\')');
function visit72_31_1(result) {
  _$jscoverage['/io/methods.js'].branchData['31'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/methods.js'].branchData['29'][1].init(414, 11, 'text || xml');
function visit71_29_1(result) {
  _$jscoverage['/io/methods.js'].branchData['29'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/methods.js'].lineData[6]++;
KISSY.add('io/methods', function(S, IO, Promise, undefined) {
  _$jscoverage['/io/methods.js'].functionData[0]++;
  _$jscoverage['/io/methods.js'].lineData[7]++;
  var OK_CODE = 200, logger = S.getLogger('s/logger'), MULTIPLE_CHOICES = 300, NOT_MODIFIED = 304, rheaders = /^(.*?):[ \t]*([^\r\n]*)\r?$/mg;
  _$jscoverage['/io/methods.js'].lineData[14]++;
  function handleResponseData(io) {
    _$jscoverage['/io/methods.js'].functionData[1]++;
    _$jscoverage['/io/methods.js'].lineData[17]++;
    var text = io.responseText, xml = io.responseXML, c = io.config, converts = c.converters, type, contentType, responseData, contents = c.contents, dataType = c.dataType;
    _$jscoverage['/io/methods.js'].lineData[29]++;
    if (visit71_29_1(text || xml)) {
      _$jscoverage['/io/methods.js'].lineData[31]++;
      contentType = visit72_31_1(io.mimeType || io.getResponseHeader('Content-Type'));
      _$jscoverage['/io/methods.js'].lineData[34]++;
      while (visit73_34_1(dataType[0] == '*')) {
        _$jscoverage['/io/methods.js'].lineData[35]++;
        dataType.shift();
      }
      _$jscoverage['/io/methods.js'].lineData[38]++;
      if (visit74_38_1(!dataType.length)) {
        _$jscoverage['/io/methods.js'].lineData[40]++;
        for (type in contents) {
          _$jscoverage['/io/methods.js'].lineData[41]++;
          if (visit75_41_1(contents[type].test(contentType))) {
            _$jscoverage['/io/methods.js'].lineData[42]++;
            if (visit76_42_1(dataType[0] != type)) {
              _$jscoverage['/io/methods.js'].lineData[43]++;
              dataType.unshift(type);
            }
            _$jscoverage['/io/methods.js'].lineData[45]++;
            break;
          }
        }
      }
      _$jscoverage['/io/methods.js'].lineData[50]++;
      dataType[0] = visit77_50_1(dataType[0] || 'text');
      _$jscoverage['/io/methods.js'].lineData[53]++;
      for (var dataTypeIndex = 0; visit78_53_1(dataTypeIndex < dataType.length); dataTypeIndex++) {
        _$jscoverage['/io/methods.js'].lineData[54]++;
        if (visit79_54_1(visit80_54_2(dataType[dataTypeIndex] == 'text') && visit81_54_3(text !== undefined))) {
          _$jscoverage['/io/methods.js'].lineData[55]++;
          responseData = text;
          _$jscoverage['/io/methods.js'].lineData[56]++;
          break;
        } else {
          _$jscoverage['/io/methods.js'].lineData[59]++;
          if (visit82_59_1(visit83_59_2(dataType[dataTypeIndex] == 'xml') && visit84_59_3(xml !== undefined))) {
            _$jscoverage['/io/methods.js'].lineData[60]++;
            responseData = xml;
            _$jscoverage['/io/methods.js'].lineData[61]++;
            break;
          }
        }
      }
      _$jscoverage['/io/methods.js'].lineData[65]++;
      if (visit85_65_1(!responseData)) {
        _$jscoverage['/io/methods.js'].lineData[66]++;
        var rawData = {
  text: text, 
  xml: xml};
        _$jscoverage['/io/methods.js'].lineData[68]++;
        S.each(['text', 'xml'], function(prevType) {
  _$jscoverage['/io/methods.js'].functionData[2]++;
  _$jscoverage['/io/methods.js'].lineData[69]++;
  var type = dataType[0], converter = visit86_70_1(converts[prevType] && converts[prevType][type]);
  _$jscoverage['/io/methods.js'].lineData[71]++;
  if (visit87_71_1(converter && rawData[prevType])) {
    _$jscoverage['/io/methods.js'].lineData[72]++;
    dataType.unshift(prevType);
    _$jscoverage['/io/methods.js'].lineData[73]++;
    responseData = visit88_73_1(prevType == 'text') ? text : xml;
    _$jscoverage['/io/methods.js'].lineData[74]++;
    return false;
  }
  _$jscoverage['/io/methods.js'].lineData[76]++;
  return undefined;
});
      }
    }
    _$jscoverage['/io/methods.js'].lineData[80]++;
    var prevType = dataType[0];
    _$jscoverage['/io/methods.js'].lineData[83]++;
    for (var i = 1; visit89_83_1(i < dataType.length); i++) {
      _$jscoverage['/io/methods.js'].lineData[84]++;
      type = dataType[i];
      _$jscoverage['/io/methods.js'].lineData[86]++;
      var converter = visit90_86_1(converts[prevType] && converts[prevType][type]);
      _$jscoverage['/io/methods.js'].lineData[88]++;
      if (visit91_88_1(!converter)) {
        _$jscoverage['/io/methods.js'].lineData[89]++;
        throw 'no covert for ' + prevType + ' => ' + type;
      }
      _$jscoverage['/io/methods.js'].lineData[91]++;
      responseData = converter(responseData);
      _$jscoverage['/io/methods.js'].lineData[93]++;
      prevType = type;
    }
    _$jscoverage['/io/methods.js'].lineData[96]++;
    io.responseData = responseData;
  }
  _$jscoverage['/io/methods.js'].lineData[99]++;
  S.extend(IO, Promise, {
  setRequestHeader: function(name, value) {
  _$jscoverage['/io/methods.js'].functionData[3]++;
  _$jscoverage['/io/methods.js'].lineData[103]++;
  var self = this;
  _$jscoverage['/io/methods.js'].lineData[104]++;
  self.requestHeaders[name] = value;
  _$jscoverage['/io/methods.js'].lineData[105]++;
  return self;
}, 
  getAllResponseHeaders: function() {
  _$jscoverage['/io/methods.js'].functionData[4]++;
  _$jscoverage['/io/methods.js'].lineData[114]++;
  var self = this;
  _$jscoverage['/io/methods.js'].lineData[115]++;
  return visit92_115_1(self.state === 2) ? self.responseHeadersString : null;
}, 
  getResponseHeader: function(name) {
  _$jscoverage['/io/methods.js'].functionData[5]++;
  _$jscoverage['/io/methods.js'].lineData[125]++;
  var match, self = this, responseHeaders;
  _$jscoverage['/io/methods.js'].lineData[126]++;
  if (visit93_126_1(self.state === 2)) {
    _$jscoverage['/io/methods.js'].lineData[127]++;
    if (visit94_127_1(!(responseHeaders = self.responseHeaders))) {
      _$jscoverage['/io/methods.js'].lineData[128]++;
      responseHeaders = self.responseHeaders = {};
      _$jscoverage['/io/methods.js'].lineData[129]++;
      while ((match = rheaders.exec(self.responseHeadersString))) {
        _$jscoverage['/io/methods.js'].lineData[130]++;
        responseHeaders[match[1]] = match[2];
      }
    }
    _$jscoverage['/io/methods.js'].lineData[133]++;
    match = responseHeaders[name];
  }
  _$jscoverage['/io/methods.js'].lineData[135]++;
  return visit95_135_1(match === undefined) ? null : match;
}, 
  overrideMimeType: function(type) {
  _$jscoverage['/io/methods.js'].functionData[6]++;
  _$jscoverage['/io/methods.js'].lineData[140]++;
  var self = this;
  _$jscoverage['/io/methods.js'].lineData[141]++;
  if (visit96_141_1(!self.state)) {
    _$jscoverage['/io/methods.js'].lineData[142]++;
    self.mimeType = type;
  }
  _$jscoverage['/io/methods.js'].lineData[144]++;
  return self;
}, 
  abort: function(statusText) {
  _$jscoverage['/io/methods.js'].functionData[7]++;
  _$jscoverage['/io/methods.js'].lineData[154]++;
  var self = this;
  _$jscoverage['/io/methods.js'].lineData[155]++;
  statusText = visit97_155_1(statusText || 'abort');
  _$jscoverage['/io/methods.js'].lineData[156]++;
  if (visit98_156_1(self.transport)) {
    _$jscoverage['/io/methods.js'].lineData[157]++;
    self.transport.abort(statusText);
  }
  _$jscoverage['/io/methods.js'].lineData[159]++;
  self._ioReady(0, statusText);
  _$jscoverage['/io/methods.js'].lineData[160]++;
  return self;
}, 
  getNativeXhr: function() {
  _$jscoverage['/io/methods.js'].functionData[8]++;
  _$jscoverage['/io/methods.js'].lineData[169]++;
  var transport;
  _$jscoverage['/io/methods.js'].lineData[170]++;
  if (visit99_170_1(transport = this.transport)) {
    _$jscoverage['/io/methods.js'].lineData[171]++;
    return transport.nativeXhr;
  }
  _$jscoverage['/io/methods.js'].lineData[173]++;
  return null;
}, 
  _ioReady: function(status, statusText) {
  _$jscoverage['/io/methods.js'].functionData[9]++;
  _$jscoverage['/io/methods.js'].lineData[177]++;
  var self = this;
  _$jscoverage['/io/methods.js'].lineData[184]++;
  if (visit100_184_1(self.state == 2)) {
    _$jscoverage['/io/methods.js'].lineData[185]++;
    return;
  }
  _$jscoverage['/io/methods.js'].lineData[187]++;
  self.state = 2;
  _$jscoverage['/io/methods.js'].lineData[188]++;
  self.readyState = 4;
  _$jscoverage['/io/methods.js'].lineData[189]++;
  var isSuccess;
  _$jscoverage['/io/methods.js'].lineData[190]++;
  if (visit101_190_1(visit102_190_2(visit103_190_3(status >= OK_CODE) && visit104_190_4(status < MULTIPLE_CHOICES)) || visit105_190_5(status == NOT_MODIFIED))) {
    _$jscoverage['/io/methods.js'].lineData[193]++;
    if (visit106_193_1(status == NOT_MODIFIED)) {
      _$jscoverage['/io/methods.js'].lineData[194]++;
      statusText = 'not modified';
      _$jscoverage['/io/methods.js'].lineData[195]++;
      isSuccess = true;
    } else {
      _$jscoverage['/io/methods.js'].lineData[197]++;
      try {
        _$jscoverage['/io/methods.js'].lineData[198]++;
        handleResponseData(self);
        _$jscoverage['/io/methods.js'].lineData[199]++;
        statusText = 'success';
        _$jscoverage['/io/methods.js'].lineData[200]++;
        isSuccess = true;
      }      catch (e) {
  _$jscoverage['/io/methods.js'].lineData[202]++;
  logger.error(visit107_202_1(e.stack || e));
  _$jscoverage['/io/methods.js'].lineData[203]++;
  statusText = 'parser error';
}
    }
  } else {
    _$jscoverage['/io/methods.js'].lineData[208]++;
    if (visit108_208_1(status < 0)) {
      _$jscoverage['/io/methods.js'].lineData[209]++;
      status = 0;
    }
  }
  _$jscoverage['/io/methods.js'].lineData[213]++;
  self.status = status;
  _$jscoverage['/io/methods.js'].lineData[214]++;
  self.statusText = statusText;
  _$jscoverage['/io/methods.js'].lineData[216]++;
  var defer = self.defer, config = self.config, timeoutTimer;
  _$jscoverage['/io/methods.js'].lineData[219]++;
  if (visit109_219_1(timeoutTimer = self.timeoutTimer)) {
    _$jscoverage['/io/methods.js'].lineData[220]++;
    clearTimeout(timeoutTimer);
    _$jscoverage['/io/methods.js'].lineData[221]++;
    self.timeoutTimer = 0;
  }
  _$jscoverage['/io/methods.js'].lineData[249]++;
  var handler = isSuccess ? 'success' : 'error', h, v = [self.responseData, statusText, self], context = config.context, eventObject = {
  ajaxConfig: config, 
  io: self};
  _$jscoverage['/io/methods.js'].lineData[258]++;
  if (visit110_258_1(h = config[handler])) {
    _$jscoverage['/io/methods.js'].lineData[259]++;
    h.apply(context, v);
  }
  _$jscoverage['/io/methods.js'].lineData[261]++;
  if (visit111_261_1(h = config.complete)) {
    _$jscoverage['/io/methods.js'].lineData[262]++;
    h.apply(context, v);
  }
  _$jscoverage['/io/methods.js'].lineData[264]++;
  IO.fire(handler, eventObject);
  _$jscoverage['/io/methods.js'].lineData[265]++;
  IO.fire('complete', eventObject);
  _$jscoverage['/io/methods.js'].lineData[266]++;
  defer[isSuccess ? 'resolve' : 'reject'](v);
}, 
  _getUrlForSend: function() {
  _$jscoverage['/io/methods.js'].functionData[10]++;
  _$jscoverage['/io/methods.js'].lineData[277]++;
  var c = this.config, uri = c.uri, originalQuery = visit112_279_1(S.Uri.getComponents(c.url).query || ""), url = uri.toString.call(uri, c.serializeArray);
  _$jscoverage['/io/methods.js'].lineData[282]++;
  return url + (originalQuery ? ((uri.query.has() ? '&' : '?') + originalQuery) : originalQuery);
}});
}, {
  requires: ['./base', 'promise']});
