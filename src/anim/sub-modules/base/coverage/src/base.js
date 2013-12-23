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
if (! _$jscoverage['/base.js']) {
  _$jscoverage['/base.js'] = {};
  _$jscoverage['/base.js'].lineData = [];
  _$jscoverage['/base.js'].lineData[6] = 0;
  _$jscoverage['/base.js'].lineData[7] = 0;
  _$jscoverage['/base.js'].lineData[11] = 0;
  _$jscoverage['/base.js'].lineData[12] = 0;
  _$jscoverage['/base.js'].lineData[27] = 0;
  _$jscoverage['/base.js'].lineData[28] = 0;
  _$jscoverage['/base.js'].lineData[29] = 0;
  _$jscoverage['/base.js'].lineData[30] = 0;
  _$jscoverage['/base.js'].lineData[35] = 0;
  _$jscoverage['/base.js'].lineData[36] = 0;
  _$jscoverage['/base.js'].lineData[37] = 0;
  _$jscoverage['/base.js'].lineData[38] = 0;
  _$jscoverage['/base.js'].lineData[40] = 0;
  _$jscoverage['/base.js'].lineData[41] = 0;
  _$jscoverage['/base.js'].lineData[42] = 0;
  _$jscoverage['/base.js'].lineData[46] = 0;
  _$jscoverage['/base.js'].lineData[47] = 0;
  _$jscoverage['/base.js'].lineData[49] = 0;
  _$jscoverage['/base.js'].lineData[50] = 0;
  _$jscoverage['/base.js'].lineData[52] = 0;
  _$jscoverage['/base.js'].lineData[53] = 0;
  _$jscoverage['/base.js'].lineData[57] = 0;
  _$jscoverage['/base.js'].lineData[63] = 0;
  _$jscoverage['/base.js'].lineData[64] = 0;
  _$jscoverage['/base.js'].lineData[65] = 0;
  _$jscoverage['/base.js'].lineData[66] = 0;
  _$jscoverage['/base.js'].lineData[67] = 0;
  _$jscoverage['/base.js'].lineData[68] = 0;
  _$jscoverage['/base.js'].lineData[69] = 0;
  _$jscoverage['/base.js'].lineData[70] = 0;
  _$jscoverage['/base.js'].lineData[72] = 0;
  _$jscoverage['/base.js'].lineData[74] = 0;
  _$jscoverage['/base.js'].lineData[85] = 0;
  _$jscoverage['/base.js'].lineData[96] = 0;
  _$jscoverage['/base.js'].lineData[99] = 0;
  _$jscoverage['/base.js'].lineData[100] = 0;
  _$jscoverage['/base.js'].lineData[101] = 0;
  _$jscoverage['/base.js'].lineData[105] = 0;
  _$jscoverage['/base.js'].lineData[115] = 0;
  _$jscoverage['/base.js'].lineData[118] = 0;
  _$jscoverage['/base.js'].lineData[123] = 0;
  _$jscoverage['/base.js'].lineData[124] = 0;
  _$jscoverage['/base.js'].lineData[129] = 0;
  _$jscoverage['/base.js'].lineData[131] = 0;
  _$jscoverage['/base.js'].lineData[133] = 0;
  _$jscoverage['/base.js'].lineData[134] = 0;
  _$jscoverage['/base.js'].lineData[136] = 0;
  _$jscoverage['/base.js'].lineData[141] = 0;
  _$jscoverage['/base.js'].lineData[142] = 0;
  _$jscoverage['/base.js'].lineData[143] = 0;
  _$jscoverage['/base.js'].lineData[144] = 0;
  _$jscoverage['/base.js'].lineData[146] = 0;
  _$jscoverage['/base.js'].lineData[147] = 0;
  _$jscoverage['/base.js'].lineData[149] = 0;
  _$jscoverage['/base.js'].lineData[150] = 0;
  _$jscoverage['/base.js'].lineData[151] = 0;
  _$jscoverage['/base.js'].lineData[154] = 0;
  _$jscoverage['/base.js'].lineData[155] = 0;
  _$jscoverage['/base.js'].lineData[156] = 0;
  _$jscoverage['/base.js'].lineData[158] = 0;
  _$jscoverage['/base.js'].lineData[159] = 0;
  _$jscoverage['/base.js'].lineData[161] = 0;
  _$jscoverage['/base.js'].lineData[163] = 0;
  _$jscoverage['/base.js'].lineData[165] = 0;
  _$jscoverage['/base.js'].lineData[166] = 0;
  _$jscoverage['/base.js'].lineData[169] = 0;
  _$jscoverage['/base.js'].lineData[172] = 0;
  _$jscoverage['/base.js'].lineData[173] = 0;
  _$jscoverage['/base.js'].lineData[177] = 0;
  _$jscoverage['/base.js'].lineData[178] = 0;
  _$jscoverage['/base.js'].lineData[179] = 0;
  _$jscoverage['/base.js'].lineData[180] = 0;
  _$jscoverage['/base.js'].lineData[181] = 0;
  _$jscoverage['/base.js'].lineData[184] = 0;
  _$jscoverage['/base.js'].lineData[185] = 0;
  _$jscoverage['/base.js'].lineData[194] = 0;
  _$jscoverage['/base.js'].lineData[202] = 0;
  _$jscoverage['/base.js'].lineData[211] = 0;
  _$jscoverage['/base.js'].lineData[212] = 0;
  _$jscoverage['/base.js'].lineData[214] = 0;
  _$jscoverage['/base.js'].lineData[215] = 0;
  _$jscoverage['/base.js'].lineData[216] = 0;
  _$jscoverage['/base.js'].lineData[217] = 0;
  _$jscoverage['/base.js'].lineData[218] = 0;
  _$jscoverage['/base.js'].lineData[219] = 0;
  _$jscoverage['/base.js'].lineData[221] = 0;
  _$jscoverage['/base.js'].lineData[224] = 0;
  _$jscoverage['/base.js'].lineData[246] = 0;
  _$jscoverage['/base.js'].lineData[247] = 0;
  _$jscoverage['/base.js'].lineData[249] = 0;
  _$jscoverage['/base.js'].lineData[250] = 0;
  _$jscoverage['/base.js'].lineData[251] = 0;
  _$jscoverage['/base.js'].lineData[252] = 0;
  _$jscoverage['/base.js'].lineData[253] = 0;
  _$jscoverage['/base.js'].lineData[254] = 0;
  _$jscoverage['/base.js'].lineData[257] = 0;
  _$jscoverage['/base.js'].lineData[258] = 0;
  _$jscoverage['/base.js'].lineData[261] = 0;
  _$jscoverage['/base.js'].lineData[276] = 0;
  _$jscoverage['/base.js'].lineData[280] = 0;
  _$jscoverage['/base.js'].lineData[281] = 0;
  _$jscoverage['/base.js'].lineData[284] = 0;
  _$jscoverage['/base.js'].lineData[285] = 0;
  _$jscoverage['/base.js'].lineData[286] = 0;
  _$jscoverage['/base.js'].lineData[290] = 0;
  _$jscoverage['/base.js'].lineData[299] = 0;
  _$jscoverage['/base.js'].lineData[304] = 0;
  _$jscoverage['/base.js'].lineData[305] = 0;
  _$jscoverage['/base.js'].lineData[308] = 0;
  _$jscoverage['/base.js'].lineData[309] = 0;
  _$jscoverage['/base.js'].lineData[310] = 0;
  _$jscoverage['/base.js'].lineData[313] = 0;
  _$jscoverage['/base.js'].lineData[314] = 0;
  _$jscoverage['/base.js'].lineData[316] = 0;
  _$jscoverage['/base.js'].lineData[318] = 0;
  _$jscoverage['/base.js'].lineData[321] = 0;
  _$jscoverage['/base.js'].lineData[322] = 0;
  _$jscoverage['/base.js'].lineData[323] = 0;
  _$jscoverage['/base.js'].lineData[325] = 0;
  _$jscoverage['/base.js'].lineData[326] = 0;
  _$jscoverage['/base.js'].lineData[327] = 0;
  _$jscoverage['/base.js'].lineData[328] = 0;
  _$jscoverage['/base.js'].lineData[330] = 0;
  _$jscoverage['/base.js'].lineData[333] = 0;
  _$jscoverage['/base.js'].lineData[335] = 0;
  _$jscoverage['/base.js'].lineData[336] = 0;
  _$jscoverage['/base.js'].lineData[337] = 0;
  _$jscoverage['/base.js'].lineData[340] = 0;
  _$jscoverage['/base.js'].lineData[344] = 0;
  _$jscoverage['/base.js'].lineData[345] = 0;
  _$jscoverage['/base.js'].lineData[347] = 0;
}
if (! _$jscoverage['/base.js'].functionData) {
  _$jscoverage['/base.js'].functionData = [];
  _$jscoverage['/base.js'].functionData[0] = 0;
  _$jscoverage['/base.js'].functionData[1] = 0;
  _$jscoverage['/base.js'].functionData[2] = 0;
  _$jscoverage['/base.js'].functionData[3] = 0;
  _$jscoverage['/base.js'].functionData[4] = 0;
  _$jscoverage['/base.js'].functionData[5] = 0;
  _$jscoverage['/base.js'].functionData[6] = 0;
  _$jscoverage['/base.js'].functionData[7] = 0;
  _$jscoverage['/base.js'].functionData[8] = 0;
  _$jscoverage['/base.js'].functionData[9] = 0;
  _$jscoverage['/base.js'].functionData[10] = 0;
  _$jscoverage['/base.js'].functionData[11] = 0;
  _$jscoverage['/base.js'].functionData[12] = 0;
  _$jscoverage['/base.js'].functionData[13] = 0;
  _$jscoverage['/base.js'].functionData[14] = 0;
}
if (! _$jscoverage['/base.js'].branchData) {
  _$jscoverage['/base.js'].branchData = {};
  _$jscoverage['/base.js'].branchData['37'] = [];
  _$jscoverage['/base.js'].branchData['37'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['49'] = [];
  _$jscoverage['/base.js'].branchData['49'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['52'] = [];
  _$jscoverage['/base.js'].branchData['52'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['65'] = [];
  _$jscoverage['/base.js'].branchData['65'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['67'] = [];
  _$jscoverage['/base.js'].branchData['67'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['69'] = [];
  _$jscoverage['/base.js'].branchData['69'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['92'] = [];
  _$jscoverage['/base.js'].branchData['92'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['100'] = [];
  _$jscoverage['/base.js'].branchData['100'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['115'] = [];
  _$jscoverage['/base.js'].branchData['115'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['118'] = [];
  _$jscoverage['/base.js'].branchData['118'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['131'] = [];
  _$jscoverage['/base.js'].branchData['131'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['131'][2] = new BranchData();
  _$jscoverage['/base.js'].branchData['132'] = [];
  _$jscoverage['/base.js'].branchData['132'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['133'] = [];
  _$jscoverage['/base.js'].branchData['133'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['142'] = [];
  _$jscoverage['/base.js'].branchData['142'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['146'] = [];
  _$jscoverage['/base.js'].branchData['146'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['147'] = [];
  _$jscoverage['/base.js'].branchData['147'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['147'][2] = new BranchData();
  _$jscoverage['/base.js'].branchData['147'][3] = new BranchData();
  _$jscoverage['/base.js'].branchData['147'][4] = new BranchData();
  _$jscoverage['/base.js'].branchData['147'][5] = new BranchData();
  _$jscoverage['/base.js'].branchData['155'] = [];
  _$jscoverage['/base.js'].branchData['155'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['158'] = [];
  _$jscoverage['/base.js'].branchData['158'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['172'] = [];
  _$jscoverage['/base.js'].branchData['172'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['178'] = [];
  _$jscoverage['/base.js'].branchData['178'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['212'] = [];
  _$jscoverage['/base.js'].branchData['212'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['218'] = [];
  _$jscoverage['/base.js'].branchData['218'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['247'] = [];
  _$jscoverage['/base.js'].branchData['247'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['252'] = [];
  _$jscoverage['/base.js'].branchData['252'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['280'] = [];
  _$jscoverage['/base.js'].branchData['280'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['285'] = [];
  _$jscoverage['/base.js'].branchData['285'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['304'] = [];
  _$jscoverage['/base.js'].branchData['304'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['308'] = [];
  _$jscoverage['/base.js'].branchData['308'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['313'] = [];
  _$jscoverage['/base.js'].branchData['313'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['314'] = [];
  _$jscoverage['/base.js'].branchData['314'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['326'] = [];
  _$jscoverage['/base.js'].branchData['326'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['333'] = [];
  _$jscoverage['/base.js'].branchData['333'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['336'] = [];
  _$jscoverage['/base.js'].branchData['336'][1] = new BranchData();
}
_$jscoverage['/base.js'].branchData['336'][1].init(126, 9, 'q && q[0]');
function visit70_336_1(result) {
  _$jscoverage['/base.js'].branchData['336'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['333'][1].init(976, 15, 'queue !== false');
function visit69_333_1(result) {
  _$jscoverage['/base.js'].branchData['333'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['326'][1].init(801, 6, 'finish');
function visit68_326_1(result) {
  _$jscoverage['/base.js'].branchData['326'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['314'][1].init(21, 15, 'queue !== false');
function visit67_314_1(result) {
  _$jscoverage['/base.js'].branchData['314'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['313'][1].init(388, 37, '!self.isRunning() && !self.isPaused()');
function visit66_313_1(result) {
  _$jscoverage['/base.js'].branchData['313'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['308'][1].init(245, 18, 'self.__waitTimeout');
function visit65_308_1(result) {
  _$jscoverage['/base.js'].branchData['308'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['304'][1].init(143, 38, 'self.isResolved() || self.isRejected()');
function visit64_304_1(result) {
  _$jscoverage['/base.js'].branchData['304'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['285'][1].init(104, 14, 'q.length === 1');
function visit63_285_1(result) {
  _$jscoverage['/base.js'].branchData['285'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['280'][1].init(109, 15, 'queue === false');
function visit62_280_1(result) {
  _$jscoverage['/base.js'].branchData['280'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['252'][1].init(229, 18, 'self.__waitTimeout');
function visit61_252_1(result) {
  _$jscoverage['/base.js'].branchData['252'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['247'][1].init(46, 15, 'self.isPaused()');
function visit60_247_1(result) {
  _$jscoverage['/base.js'].branchData['247'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['218'][1].init(257, 18, 'self.__waitTimeout');
function visit59_218_1(result) {
  _$jscoverage['/base.js'].branchData['218'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['212'][1].init(46, 16, 'self.isRunning()');
function visit58_212_1(result) {
  _$jscoverage['/base.js'].branchData['212'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['178'][1].init(3826, 27, 'S.isEmptyObject(_propsData)');
function visit57_178_1(result) {
  _$jscoverage['/base.js'].branchData['178'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['172'][1].init(2644, 14, 'exit === false');
function visit56_172_1(result) {
  _$jscoverage['/base.js'].branchData['172'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['158'][1].init(585, 14, 'val === \'hide\'');
function visit55_158_1(result) {
  _$jscoverage['/base.js'].branchData['158'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['155'][1].init(451, 16, 'val === \'toggle\'');
function visit54_155_1(result) {
  _$jscoverage['/base.js'].branchData['155'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['147'][5].init(57, 14, 'val === \'show\'');
function visit53_147_5(result) {
  _$jscoverage['/base.js'].branchData['147'][5].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['147'][4].init(57, 25, 'val === \'show\' && !hidden');
function visit52_147_4(result) {
  _$jscoverage['/base.js'].branchData['147'][4].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['147'][3].init(29, 14, 'val === \'hide\'');
function visit51_147_3(result) {
  _$jscoverage['/base.js'].branchData['147'][3].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['147'][2].init(29, 24, 'val === \'hide\' && hidden');
function visit50_147_2(result) {
  _$jscoverage['/base.js'].branchData['147'][2].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['147'][1].init(29, 53, 'val === \'hide\' && hidden || val === \'show\' && !hidden');
function visit49_147_1(result) {
  _$jscoverage['/base.js'].branchData['147'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['146'][1].init(96, 16, 'specialVals[val]');
function visit48_146_1(result) {
  _$jscoverage['/base.js'].branchData['146'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['142'][1].init(1300, 35, 'Dom.css(node, \'display\') === \'none\'');
function visit47_142_1(result) {
  _$jscoverage['/base.js'].branchData['142'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['133'][1].init(29, 16, 'S.UA.ieMode < 10');
function visit46_133_1(result) {
  _$jscoverage['/base.js'].branchData['133'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['132'][1].init(64, 33, 'Dom.css(node, \'float\') === \'none\'');
function visit45_132_1(result) {
  _$jscoverage['/base.js'].branchData['132'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['131'][2].init(684, 37, 'Dom.css(node, \'display\') === \'inline\'');
function visit44_131_2(result) {
  _$jscoverage['/base.js'].branchData['131'][2].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['131'][1].init(684, 98, 'Dom.css(node, \'display\') === \'inline\' && Dom.css(node, \'float\') === \'none\'');
function visit43_131_1(result) {
  _$jscoverage['/base.js'].branchData['131'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['118'][1].init(174, 21, 'to.width || to.height');
function visit42_118_1(result) {
  _$jscoverage['/base.js'].branchData['118'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['115'][1].init(1007, 39, 'node.nodeType === NodeType.ELEMENT_NODE');
function visit41_115_1(result) {
  _$jscoverage['/base.js'].branchData['115'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['100'][1].init(21, 21, '!S.isPlainObject(val)');
function visit40_100_1(result) {
  _$jscoverage['/base.js'].branchData['100'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['92'][1].init(269, 17, 'config.delay || 0');
function visit39_92_1(result) {
  _$jscoverage['/base.js'].branchData['92'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['69'][1].init(263, 15, 'name === \'step\'');
function visit38_69_1(result) {
  _$jscoverage['/base.js'].branchData['69'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['67'][1].init(191, 14, 'name === \'end\'');
function visit37_67_1(result) {
  _$jscoverage['/base.js'].branchData['67'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['65'][1].init(113, 19, 'name === \'complete\'');
function visit36_65_1(result) {
  _$jscoverage['/base.js'].branchData['65'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['52'][1].init(238, 8, 'complete');
function visit35_52_1(result) {
  _$jscoverage['/base.js'].branchData['52'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['49'][1].init(116, 50, '!S.isEmptyObject(_backupProps = self._backupProps)');
function visit34_49_1(result) {
  _$jscoverage['/base.js'].branchData['49'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['37'][1].init(281, 22, '!S.isPlainObject(node)');
function visit33_37_1(result) {
  _$jscoverage['/base.js'].branchData['37'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/base.js'].functionData[0]++;
  _$jscoverage['/base.js'].lineData[7]++;
  var Dom = require('dom'), Utils = require('./base/utils'), Q = require('./base/queue'), Promise = require('promise');
  _$jscoverage['/base.js'].lineData[11]++;
  var logger = S.getLogger('s/anim');
  _$jscoverage['/base.js'].lineData[12]++;
  var NodeType = Dom.NodeType, noop = S.noop, specialVals = {
  toggle: 1, 
  hide: 1, 
  show: 1};
  _$jscoverage['/base.js'].lineData[27]++;
  function AnimBase(config) {
    _$jscoverage['/base.js'].functionData[1]++;
    _$jscoverage['/base.js'].lineData[28]++;
    var self = this;
    _$jscoverage['/base.js'].lineData[29]++;
    AnimBase.superclass.constructor.call(self);
    _$jscoverage['/base.js'].lineData[30]++;
    Promise.Defer(self);
    _$jscoverage['/base.js'].lineData[35]++;
    self.config = config;
    _$jscoverage['/base.js'].lineData[36]++;
    var node = config.node;
    _$jscoverage['/base.js'].lineData[37]++;
    if (visit33_37_1(!S.isPlainObject(node))) {
      _$jscoverage['/base.js'].lineData[38]++;
      node = Dom.get(config.node);
    }
    _$jscoverage['/base.js'].lineData[40]++;
    self.node = self.el = node;
    _$jscoverage['/base.js'].lineData[41]++;
    self._backupProps = {};
    _$jscoverage['/base.js'].lineData[42]++;
    self._propsData = {};
  }
  _$jscoverage['/base.js'].lineData[46]++;
  function syncComplete(self) {
    _$jscoverage['/base.js'].functionData[2]++;
    _$jscoverage['/base.js'].lineData[47]++;
    var _backupProps, complete = self.config.complete;
    _$jscoverage['/base.js'].lineData[49]++;
    if (visit34_49_1(!S.isEmptyObject(_backupProps = self._backupProps))) {
      _$jscoverage['/base.js'].lineData[50]++;
      Dom.css(self.node, _backupProps);
    }
    _$jscoverage['/base.js'].lineData[52]++;
    if (visit35_52_1(complete)) {
      _$jscoverage['/base.js'].lineData[53]++;
      complete.call(self);
    }
  }
  _$jscoverage['/base.js'].lineData[57]++;
  S.extend(AnimBase, Promise, {
  on: function(name, fn) {
  _$jscoverage['/base.js'].functionData[3]++;
  _$jscoverage['/base.js'].lineData[63]++;
  var self = this;
  _$jscoverage['/base.js'].lineData[64]++;
  logger.warn('please use promise api of anim instead');
  _$jscoverage['/base.js'].lineData[65]++;
  if (visit36_65_1(name === 'complete')) {
    _$jscoverage['/base.js'].lineData[66]++;
    self.then(fn);
  } else {
    _$jscoverage['/base.js'].lineData[67]++;
    if (visit37_67_1(name === 'end')) {
      _$jscoverage['/base.js'].lineData[68]++;
      self.fin(fn);
    } else {
      _$jscoverage['/base.js'].lineData[69]++;
      if (visit38_69_1(name === 'step')) {
        _$jscoverage['/base.js'].lineData[70]++;
        self.progress(fn);
      } else {
        _$jscoverage['/base.js'].lineData[72]++;
        logger.error('not supported event for anim: ' + name);
      }
    }
  }
  _$jscoverage['/base.js'].lineData[74]++;
  return self;
}, 
  prepareFx: noop, 
  runInternal: function() {
  _$jscoverage['/base.js'].functionData[4]++;
  _$jscoverage['/base.js'].lineData[85]++;
  var self = this, config = self.config, node = self.node, val, _backupProps = self._backupProps, _propsData = self._propsData, to = config.to, defaultDelay = (visit39_92_1(config.delay || 0)), defaultDuration = config.duration;
  _$jscoverage['/base.js'].lineData[96]++;
  Utils.saveRunningAnim(self);
  _$jscoverage['/base.js'].lineData[99]++;
  S.each(to, function(val, prop) {
  _$jscoverage['/base.js'].functionData[5]++;
  _$jscoverage['/base.js'].lineData[100]++;
  if (visit40_100_1(!S.isPlainObject(val))) {
    _$jscoverage['/base.js'].lineData[101]++;
    val = {
  value: val};
  }
  _$jscoverage['/base.js'].lineData[105]++;
  _propsData[prop] = S.mix({
  delay: defaultDelay, 
  easing: config.easing, 
  frame: config.frame, 
  duration: defaultDuration}, val);
});
  _$jscoverage['/base.js'].lineData[115]++;
  if (visit41_115_1(node.nodeType === NodeType.ELEMENT_NODE)) {
    _$jscoverage['/base.js'].lineData[118]++;
    if (visit42_118_1(to.width || to.height)) {
      _$jscoverage['/base.js'].lineData[123]++;
      var elStyle = node.style;
      _$jscoverage['/base.js'].lineData[124]++;
      S.mix(_backupProps, {
  overflow: elStyle.overflow, 
  'overflow-x': elStyle.overflowX, 
  'overflow-y': elStyle.overflowY});
      _$jscoverage['/base.js'].lineData[129]++;
      elStyle.overflow = 'hidden';
      _$jscoverage['/base.js'].lineData[131]++;
      if (visit43_131_1(visit44_131_2(Dom.css(node, 'display') === 'inline') && visit45_132_1(Dom.css(node, 'float') === 'none'))) {
        _$jscoverage['/base.js'].lineData[133]++;
        if (visit46_133_1(S.UA.ieMode < 10)) {
          _$jscoverage['/base.js'].lineData[134]++;
          elStyle.zoom = 1;
        } else {
          _$jscoverage['/base.js'].lineData[136]++;
          elStyle.display = 'inline-block';
        }
      }
    }
    _$jscoverage['/base.js'].lineData[141]++;
    var exit, hidden;
    _$jscoverage['/base.js'].lineData[142]++;
    hidden = (visit47_142_1(Dom.css(node, 'display') === 'none'));
    _$jscoverage['/base.js'].lineData[143]++;
    S.each(_propsData, function(_propData, prop) {
  _$jscoverage['/base.js'].functionData[6]++;
  _$jscoverage['/base.js'].lineData[144]++;
  val = _propData.value;
  _$jscoverage['/base.js'].lineData[146]++;
  if (visit48_146_1(specialVals[val])) {
    _$jscoverage['/base.js'].lineData[147]++;
    if (visit49_147_1(visit50_147_2(visit51_147_3(val === 'hide') && hidden) || visit52_147_4(visit53_147_5(val === 'show') && !hidden))) {
      _$jscoverage['/base.js'].lineData[149]++;
      self.stop(true);
      _$jscoverage['/base.js'].lineData[150]++;
      exit = false;
      _$jscoverage['/base.js'].lineData[151]++;
      return exit;
    }
    _$jscoverage['/base.js'].lineData[154]++;
    _backupProps[prop] = Dom.style(node, prop);
    _$jscoverage['/base.js'].lineData[155]++;
    if (visit54_155_1(val === 'toggle')) {
      _$jscoverage['/base.js'].lineData[156]++;
      val = hidden ? 'show' : 'hide';
    }
    _$jscoverage['/base.js'].lineData[158]++;
    if (visit55_158_1(val === 'hide')) {
      _$jscoverage['/base.js'].lineData[159]++;
      _propData.value = 0;
      _$jscoverage['/base.js'].lineData[161]++;
      _backupProps.display = 'none';
    } else {
      _$jscoverage['/base.js'].lineData[163]++;
      _propData.value = Dom.css(node, prop);
      _$jscoverage['/base.js'].lineData[165]++;
      Dom.css(node, prop, 0);
      _$jscoverage['/base.js'].lineData[166]++;
      Dom.show(node);
    }
  }
  _$jscoverage['/base.js'].lineData[169]++;
  return undefined;
});
    _$jscoverage['/base.js'].lineData[172]++;
    if (visit56_172_1(exit === false)) {
      _$jscoverage['/base.js'].lineData[173]++;
      return;
    }
  }
  _$jscoverage['/base.js'].lineData[177]++;
  self.startTime = S.now();
  _$jscoverage['/base.js'].lineData[178]++;
  if (visit57_178_1(S.isEmptyObject(_propsData))) {
    _$jscoverage['/base.js'].lineData[179]++;
    self.__totalTime = defaultDuration * 1000;
    _$jscoverage['/base.js'].lineData[180]++;
    self.__waitTimeout = setTimeout(function() {
  _$jscoverage['/base.js'].functionData[7]++;
  _$jscoverage['/base.js'].lineData[181]++;
  self.stop(true);
}, self.__totalTime);
  } else {
    _$jscoverage['/base.js'].lineData[184]++;
    self.prepareFx();
    _$jscoverage['/base.js'].lineData[185]++;
    self.doStart();
  }
}, 
  isRunning: function() {
  _$jscoverage['/base.js'].functionData[8]++;
  _$jscoverage['/base.js'].lineData[194]++;
  return Utils.isAnimRunning(this);
}, 
  isPaused: function() {
  _$jscoverage['/base.js'].functionData[9]++;
  _$jscoverage['/base.js'].lineData[202]++;
  return Utils.isAnimPaused(this);
}, 
  pause: function() {
  _$jscoverage['/base.js'].functionData[10]++;
  _$jscoverage['/base.js'].lineData[211]++;
  var self = this;
  _$jscoverage['/base.js'].lineData[212]++;
  if (visit58_212_1(self.isRunning())) {
    _$jscoverage['/base.js'].lineData[214]++;
    self._runTime = S.now() - self.startTime;
    _$jscoverage['/base.js'].lineData[215]++;
    self.__totalTime -= self._runTime;
    _$jscoverage['/base.js'].lineData[216]++;
    Utils.removeRunningAnim(self);
    _$jscoverage['/base.js'].lineData[217]++;
    Utils.savePausedAnim(self);
    _$jscoverage['/base.js'].lineData[218]++;
    if (visit59_218_1(self.__waitTimeout)) {
      _$jscoverage['/base.js'].lineData[219]++;
      clearTimeout(self.__waitTimeout);
    } else {
      _$jscoverage['/base.js'].lineData[221]++;
      self.doStop();
    }
  }
  _$jscoverage['/base.js'].lineData[224]++;
  return self;
}, 
  doStop: noop, 
  doStart: noop, 
  resume: function() {
  _$jscoverage['/base.js'].functionData[11]++;
  _$jscoverage['/base.js'].lineData[246]++;
  var self = this;
  _$jscoverage['/base.js'].lineData[247]++;
  if (visit60_247_1(self.isPaused())) {
    _$jscoverage['/base.js'].lineData[249]++;
    self.startTime = S.now() - self._runTime;
    _$jscoverage['/base.js'].lineData[250]++;
    Utils.removePausedAnim(self);
    _$jscoverage['/base.js'].lineData[251]++;
    Utils.saveRunningAnim(self);
    _$jscoverage['/base.js'].lineData[252]++;
    if (visit61_252_1(self.__waitTimeout)) {
      _$jscoverage['/base.js'].lineData[253]++;
      self.__waitTimeout = setTimeout(function() {
  _$jscoverage['/base.js'].functionData[12]++;
  _$jscoverage['/base.js'].lineData[254]++;
  self.stop(true);
}, self.__totalTime);
    } else {
      _$jscoverage['/base.js'].lineData[257]++;
      self.beforeResume();
      _$jscoverage['/base.js'].lineData[258]++;
      self.doStart();
    }
  }
  _$jscoverage['/base.js'].lineData[261]++;
  return self;
}, 
  'beforeResume': noop, 
  run: function() {
  _$jscoverage['/base.js'].functionData[13]++;
  _$jscoverage['/base.js'].lineData[276]++;
  var self = this, q, queue = self.config.queue;
  _$jscoverage['/base.js'].lineData[280]++;
  if (visit62_280_1(queue === false)) {
    _$jscoverage['/base.js'].lineData[281]++;
    self.runInternal();
  } else {
    _$jscoverage['/base.js'].lineData[284]++;
    q = Q.queue(self.node, queue, self);
    _$jscoverage['/base.js'].lineData[285]++;
    if (visit63_285_1(q.length === 1)) {
      _$jscoverage['/base.js'].lineData[286]++;
      self.runInternal();
    }
  }
  _$jscoverage['/base.js'].lineData[290]++;
  return self;
}, 
  stop: function(finish) {
  _$jscoverage['/base.js'].functionData[14]++;
  _$jscoverage['/base.js'].lineData[299]++;
  var self = this, node = self.node, q, queue = self.config.queue;
  _$jscoverage['/base.js'].lineData[304]++;
  if (visit64_304_1(self.isResolved() || self.isRejected())) {
    _$jscoverage['/base.js'].lineData[305]++;
    return self;
  }
  _$jscoverage['/base.js'].lineData[308]++;
  if (visit65_308_1(self.__waitTimeout)) {
    _$jscoverage['/base.js'].lineData[309]++;
    clearTimeout(self.__waitTimeout);
    _$jscoverage['/base.js'].lineData[310]++;
    self.__waitTimeout = 0;
  }
  _$jscoverage['/base.js'].lineData[313]++;
  if (visit66_313_1(!self.isRunning() && !self.isPaused())) {
    _$jscoverage['/base.js'].lineData[314]++;
    if (visit67_314_1(queue !== false)) {
      _$jscoverage['/base.js'].lineData[316]++;
      Q.remove(node, queue, self);
    }
    _$jscoverage['/base.js'].lineData[318]++;
    return self;
  }
  _$jscoverage['/base.js'].lineData[321]++;
  self.doStop(finish);
  _$jscoverage['/base.js'].lineData[322]++;
  Utils.removeRunningAnim(self);
  _$jscoverage['/base.js'].lineData[323]++;
  Utils.removePausedAnim(self);
  _$jscoverage['/base.js'].lineData[325]++;
  var defer = self.defer;
  _$jscoverage['/base.js'].lineData[326]++;
  if (visit68_326_1(finish)) {
    _$jscoverage['/base.js'].lineData[327]++;
    syncComplete(self);
    _$jscoverage['/base.js'].lineData[328]++;
    defer.resolve([self]);
  } else {
    _$jscoverage['/base.js'].lineData[330]++;
    defer.reject([self]);
  }
  _$jscoverage['/base.js'].lineData[333]++;
  if (visit69_333_1(queue !== false)) {
    _$jscoverage['/base.js'].lineData[335]++;
    q = Q.dequeue(node, queue);
    _$jscoverage['/base.js'].lineData[336]++;
    if (visit70_336_1(q && q[0])) {
      _$jscoverage['/base.js'].lineData[337]++;
      q[0].runInternal();
    }
  }
  _$jscoverage['/base.js'].lineData[340]++;
  return self;
}});
  _$jscoverage['/base.js'].lineData[344]++;
  AnimBase.Utils = Utils;
  _$jscoverage['/base.js'].lineData[345]++;
  AnimBase.Q = Q;
  _$jscoverage['/base.js'].lineData[347]++;
  return AnimBase;
});
