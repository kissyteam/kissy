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
  _$jscoverage['/base.js'].lineData[25] = 0;
  _$jscoverage['/base.js'].lineData[26] = 0;
  _$jscoverage['/base.js'].lineData[29] = 0;
  _$jscoverage['/base.js'].lineData[30] = 0;
  _$jscoverage['/base.js'].lineData[36] = 0;
  _$jscoverage['/base.js'].lineData[37] = 0;
  _$jscoverage['/base.js'].lineData[38] = 0;
  _$jscoverage['/base.js'].lineData[39] = 0;
  _$jscoverage['/base.js'].lineData[41] = 0;
  _$jscoverage['/base.js'].lineData[42] = 0;
  _$jscoverage['/base.js'].lineData[43] = 0;
  _$jscoverage['/base.js'].lineData[47] = 0;
  _$jscoverage['/base.js'].lineData[48] = 0;
  _$jscoverage['/base.js'].lineData[50] = 0;
  _$jscoverage['/base.js'].lineData[51] = 0;
  _$jscoverage['/base.js'].lineData[53] = 0;
  _$jscoverage['/base.js'].lineData[54] = 0;
  _$jscoverage['/base.js'].lineData[58] = 0;
  _$jscoverage['/base.js'].lineData[67] = 0;
  _$jscoverage['/base.js'].lineData[78] = 0;
  _$jscoverage['/base.js'].lineData[81] = 0;
  _$jscoverage['/base.js'].lineData[82] = 0;
  _$jscoverage['/base.js'].lineData[83] = 0;
  _$jscoverage['/base.js'].lineData[87] = 0;
  _$jscoverage['/base.js'].lineData[97] = 0;
  _$jscoverage['/base.js'].lineData[100] = 0;
  _$jscoverage['/base.js'].lineData[105] = 0;
  _$jscoverage['/base.js'].lineData[106] = 0;
  _$jscoverage['/base.js'].lineData[111] = 0;
  _$jscoverage['/base.js'].lineData[113] = 0;
  _$jscoverage['/base.js'].lineData[115] = 0;
  _$jscoverage['/base.js'].lineData[116] = 0;
  _$jscoverage['/base.js'].lineData[118] = 0;
  _$jscoverage['/base.js'].lineData[123] = 0;
  _$jscoverage['/base.js'].lineData[124] = 0;
  _$jscoverage['/base.js'].lineData[125] = 0;
  _$jscoverage['/base.js'].lineData[126] = 0;
  _$jscoverage['/base.js'].lineData[128] = 0;
  _$jscoverage['/base.js'].lineData[129] = 0;
  _$jscoverage['/base.js'].lineData[131] = 0;
  _$jscoverage['/base.js'].lineData[132] = 0;
  _$jscoverage['/base.js'].lineData[133] = 0;
  _$jscoverage['/base.js'].lineData[136] = 0;
  _$jscoverage['/base.js'].lineData[137] = 0;
  _$jscoverage['/base.js'].lineData[138] = 0;
  _$jscoverage['/base.js'].lineData[140] = 0;
  _$jscoverage['/base.js'].lineData[141] = 0;
  _$jscoverage['/base.js'].lineData[143] = 0;
  _$jscoverage['/base.js'].lineData[145] = 0;
  _$jscoverage['/base.js'].lineData[147] = 0;
  _$jscoverage['/base.js'].lineData[148] = 0;
  _$jscoverage['/base.js'].lineData[151] = 0;
  _$jscoverage['/base.js'].lineData[154] = 0;
  _$jscoverage['/base.js'].lineData[155] = 0;
  _$jscoverage['/base.js'].lineData[159] = 0;
  _$jscoverage['/base.js'].lineData[160] = 0;
  _$jscoverage['/base.js'].lineData[161] = 0;
  _$jscoverage['/base.js'].lineData[162] = 0;
  _$jscoverage['/base.js'].lineData[163] = 0;
  _$jscoverage['/base.js'].lineData[166] = 0;
  _$jscoverage['/base.js'].lineData[167] = 0;
  _$jscoverage['/base.js'].lineData[176] = 0;
  _$jscoverage['/base.js'].lineData[184] = 0;
  _$jscoverage['/base.js'].lineData[193] = 0;
  _$jscoverage['/base.js'].lineData[194] = 0;
  _$jscoverage['/base.js'].lineData[196] = 0;
  _$jscoverage['/base.js'].lineData[197] = 0;
  _$jscoverage['/base.js'].lineData[198] = 0;
  _$jscoverage['/base.js'].lineData[199] = 0;
  _$jscoverage['/base.js'].lineData[200] = 0;
  _$jscoverage['/base.js'].lineData[201] = 0;
  _$jscoverage['/base.js'].lineData[203] = 0;
  _$jscoverage['/base.js'].lineData[206] = 0;
  _$jscoverage['/base.js'].lineData[228] = 0;
  _$jscoverage['/base.js'].lineData[229] = 0;
  _$jscoverage['/base.js'].lineData[231] = 0;
  _$jscoverage['/base.js'].lineData[232] = 0;
  _$jscoverage['/base.js'].lineData[233] = 0;
  _$jscoverage['/base.js'].lineData[234] = 0;
  _$jscoverage['/base.js'].lineData[235] = 0;
  _$jscoverage['/base.js'].lineData[236] = 0;
  _$jscoverage['/base.js'].lineData[239] = 0;
  _$jscoverage['/base.js'].lineData[240] = 0;
  _$jscoverage['/base.js'].lineData[243] = 0;
  _$jscoverage['/base.js'].lineData[258] = 0;
  _$jscoverage['/base.js'].lineData[262] = 0;
  _$jscoverage['/base.js'].lineData[263] = 0;
  _$jscoverage['/base.js'].lineData[266] = 0;
  _$jscoverage['/base.js'].lineData[267] = 0;
  _$jscoverage['/base.js'].lineData[268] = 0;
  _$jscoverage['/base.js'].lineData[272] = 0;
  _$jscoverage['/base.js'].lineData[281] = 0;
  _$jscoverage['/base.js'].lineData[286] = 0;
  _$jscoverage['/base.js'].lineData[287] = 0;
  _$jscoverage['/base.js'].lineData[290] = 0;
  _$jscoverage['/base.js'].lineData[291] = 0;
  _$jscoverage['/base.js'].lineData[292] = 0;
  _$jscoverage['/base.js'].lineData[295] = 0;
  _$jscoverage['/base.js'].lineData[296] = 0;
  _$jscoverage['/base.js'].lineData[298] = 0;
  _$jscoverage['/base.js'].lineData[300] = 0;
  _$jscoverage['/base.js'].lineData[303] = 0;
  _$jscoverage['/base.js'].lineData[304] = 0;
  _$jscoverage['/base.js'].lineData[305] = 0;
  _$jscoverage['/base.js'].lineData[307] = 0;
  _$jscoverage['/base.js'].lineData[308] = 0;
  _$jscoverage['/base.js'].lineData[309] = 0;
  _$jscoverage['/base.js'].lineData[310] = 0;
  _$jscoverage['/base.js'].lineData[312] = 0;
  _$jscoverage['/base.js'].lineData[315] = 0;
  _$jscoverage['/base.js'].lineData[317] = 0;
  _$jscoverage['/base.js'].lineData[318] = 0;
  _$jscoverage['/base.js'].lineData[319] = 0;
  _$jscoverage['/base.js'].lineData[322] = 0;
  _$jscoverage['/base.js'].lineData[326] = 0;
  _$jscoverage['/base.js'].lineData[327] = 0;
  _$jscoverage['/base.js'].lineData[329] = 0;
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
}
if (! _$jscoverage['/base.js'].branchData) {
  _$jscoverage['/base.js'].branchData = {};
  _$jscoverage['/base.js'].branchData['38'] = [];
  _$jscoverage['/base.js'].branchData['38'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['50'] = [];
  _$jscoverage['/base.js'].branchData['50'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['53'] = [];
  _$jscoverage['/base.js'].branchData['53'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['74'] = [];
  _$jscoverage['/base.js'].branchData['74'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['82'] = [];
  _$jscoverage['/base.js'].branchData['82'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['97'] = [];
  _$jscoverage['/base.js'].branchData['97'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['100'] = [];
  _$jscoverage['/base.js'].branchData['100'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['113'] = [];
  _$jscoverage['/base.js'].branchData['113'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['113'][2] = new BranchData();
  _$jscoverage['/base.js'].branchData['114'] = [];
  _$jscoverage['/base.js'].branchData['114'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['115'] = [];
  _$jscoverage['/base.js'].branchData['115'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['124'] = [];
  _$jscoverage['/base.js'].branchData['124'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['128'] = [];
  _$jscoverage['/base.js'].branchData['128'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['129'] = [];
  _$jscoverage['/base.js'].branchData['129'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['129'][2] = new BranchData();
  _$jscoverage['/base.js'].branchData['129'][3] = new BranchData();
  _$jscoverage['/base.js'].branchData['129'][4] = new BranchData();
  _$jscoverage['/base.js'].branchData['129'][5] = new BranchData();
  _$jscoverage['/base.js'].branchData['137'] = [];
  _$jscoverage['/base.js'].branchData['137'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['140'] = [];
  _$jscoverage['/base.js'].branchData['140'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['154'] = [];
  _$jscoverage['/base.js'].branchData['154'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['160'] = [];
  _$jscoverage['/base.js'].branchData['160'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['194'] = [];
  _$jscoverage['/base.js'].branchData['194'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['200'] = [];
  _$jscoverage['/base.js'].branchData['200'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['229'] = [];
  _$jscoverage['/base.js'].branchData['229'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['234'] = [];
  _$jscoverage['/base.js'].branchData['234'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['262'] = [];
  _$jscoverage['/base.js'].branchData['262'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['267'] = [];
  _$jscoverage['/base.js'].branchData['267'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['286'] = [];
  _$jscoverage['/base.js'].branchData['286'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['290'] = [];
  _$jscoverage['/base.js'].branchData['290'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['295'] = [];
  _$jscoverage['/base.js'].branchData['295'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['296'] = [];
  _$jscoverage['/base.js'].branchData['296'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['308'] = [];
  _$jscoverage['/base.js'].branchData['308'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['315'] = [];
  _$jscoverage['/base.js'].branchData['315'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['318'] = [];
  _$jscoverage['/base.js'].branchData['318'][1] = new BranchData();
}
_$jscoverage['/base.js'].branchData['318'][1].init(129, 9, 'q && q[0]');
function visit67_318_1(result) {
  _$jscoverage['/base.js'].branchData['318'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['315'][1].init(1011, 15, 'queue !== false');
function visit66_315_1(result) {
  _$jscoverage['/base.js'].branchData['315'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['308'][1].init(829, 6, 'finish');
function visit65_308_1(result) {
  _$jscoverage['/base.js'].branchData['308'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['296'][1].init(22, 15, 'queue !== false');
function visit64_296_1(result) {
  _$jscoverage['/base.js'].branchData['296'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['295'][1].init(403, 37, '!self.isRunning() && !self.isPaused()');
function visit63_295_1(result) {
  _$jscoverage['/base.js'].branchData['295'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['290'][1].init(255, 18, 'self.__waitTimeout');
function visit62_290_1(result) {
  _$jscoverage['/base.js'].branchData['290'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['286'][1].init(149, 38, 'self.isResolved() || self.isRejected()');
function visit61_286_1(result) {
  _$jscoverage['/base.js'].branchData['286'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['267'][1].init(107, 14, 'q.length === 1');
function visit60_267_1(result) {
  _$jscoverage['/base.js'].branchData['267'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['262'][1].init(114, 15, 'queue === false');
function visit59_262_1(result) {
  _$jscoverage['/base.js'].branchData['262'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['234'][1].init(234, 18, 'self.__waitTimeout');
function visit58_234_1(result) {
  _$jscoverage['/base.js'].branchData['234'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['229'][1].init(48, 15, 'self.isPaused()');
function visit57_229_1(result) {
  _$jscoverage['/base.js'].branchData['229'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['200'][1].init(263, 18, 'self.__waitTimeout');
function visit56_200_1(result) {
  _$jscoverage['/base.js'].branchData['200'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['194'][1].init(48, 16, 'self.isRunning()');
function visit55_194_1(result) {
  _$jscoverage['/base.js'].branchData['194'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['160'][1].init(3920, 27, 'S.isEmptyObject(_propsData)');
function visit54_160_1(result) {
  _$jscoverage['/base.js'].branchData['160'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['154'][1].init(2701, 14, 'exit === false');
function visit53_154_1(result) {
  _$jscoverage['/base.js'].branchData['154'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['140'][1].init(597, 14, 'val === \'hide\'');
function visit52_140_1(result) {
  _$jscoverage['/base.js'].branchData['140'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['137'][1].init(460, 16, 'val === \'toggle\'');
function visit51_137_1(result) {
  _$jscoverage['/base.js'].branchData['137'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['129'][5].init(58, 14, 'val === \'show\'');
function visit50_129_5(result) {
  _$jscoverage['/base.js'].branchData['129'][5].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['129'][4].init(58, 25, 'val === \'show\' && !hidden');
function visit49_129_4(result) {
  _$jscoverage['/base.js'].branchData['129'][4].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['129'][3].init(30, 14, 'val === \'hide\'');
function visit48_129_3(result) {
  _$jscoverage['/base.js'].branchData['129'][3].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['129'][2].init(30, 24, 'val === \'hide\' && hidden');
function visit47_129_2(result) {
  _$jscoverage['/base.js'].branchData['129'][2].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['129'][1].init(30, 53, 'val === \'hide\' && hidden || val === \'show\' && !hidden');
function visit46_129_1(result) {
  _$jscoverage['/base.js'].branchData['129'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['128'][1].init(99, 16, 'specialVals[val]');
function visit45_128_1(result) {
  _$jscoverage['/base.js'].branchData['128'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['124'][1].init(1327, 35, 'Dom.css(node, \'display\') === \'none\'');
function visit44_124_1(result) {
  _$jscoverage['/base.js'].branchData['124'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['115'][1].init(30, 16, 'S.UA.ieMode < 10');
function visit43_115_1(result) {
  _$jscoverage['/base.js'].branchData['115'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['114'][1].init(65, 33, 'Dom.css(node, \'float\') === \'none\'');
function visit42_114_1(result) {
  _$jscoverage['/base.js'].branchData['114'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['113'][2].init(697, 37, 'Dom.css(node, \'display\') === \'inline\'');
function visit41_113_2(result) {
  _$jscoverage['/base.js'].branchData['113'][2].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['113'][1].init(697, 99, 'Dom.css(node, \'display\') === \'inline\' && Dom.css(node, \'float\') === \'none\'');
function visit40_113_1(result) {
  _$jscoverage['/base.js'].branchData['113'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['100'][1].init(177, 21, 'to.width || to.height');
function visit39_100_1(result) {
  _$jscoverage['/base.js'].branchData['100'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['97'][1].init(1038, 39, 'node.nodeType === NodeType.ELEMENT_NODE');
function visit38_97_1(result) {
  _$jscoverage['/base.js'].branchData['97'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['82'][1].init(22, 21, '!S.isPlainObject(val)');
function visit37_82_1(result) {
  _$jscoverage['/base.js'].branchData['82'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['74'][1].init(276, 17, 'config.delay || 0');
function visit36_74_1(result) {
  _$jscoverage['/base.js'].branchData['74'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['53'][1].init(244, 8, 'complete');
function visit35_53_1(result) {
  _$jscoverage['/base.js'].branchData['53'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['50'][1].init(119, 50, '!S.isEmptyObject(_backupProps = self._backupProps)');
function visit34_50_1(result) {
  _$jscoverage['/base.js'].branchData['50'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['38'][1].init(327, 22, '!S.isPlainObject(node)');
function visit33_38_1(result) {
  _$jscoverage['/base.js'].branchData['38'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/base.js'].functionData[0]++;
  _$jscoverage['/base.js'].lineData[7]++;
  var Dom = require('dom'), Utils = require('./base/utils'), Q = require('./base/queue'), Promise = require('promise');
  _$jscoverage['/base.js'].lineData[11]++;
  var NodeType = Dom.NodeType, noop = S.noop, specialVals = {
  toggle: 1, 
  hide: 1, 
  show: 1};
  _$jscoverage['/base.js'].lineData[25]++;
  function AnimBase(config) {
    _$jscoverage['/base.js'].functionData[1]++;
    _$jscoverage['/base.js'].lineData[26]++;
    var self = this;
    _$jscoverage['/base.js'].lineData[29]++;
    AnimBase.superclass.constructor.call(self);
    _$jscoverage['/base.js'].lineData[30]++;
    Promise.Defer(self);
    _$jscoverage['/base.js'].lineData[36]++;
    self.config = config;
    _$jscoverage['/base.js'].lineData[37]++;
    var node = config.node;
    _$jscoverage['/base.js'].lineData[38]++;
    if (visit33_38_1(!S.isPlainObject(node))) {
      _$jscoverage['/base.js'].lineData[39]++;
      node = Dom.get(config.node);
    }
    _$jscoverage['/base.js'].lineData[41]++;
    self.node = self.el = node;
    _$jscoverage['/base.js'].lineData[42]++;
    self._backupProps = {};
    _$jscoverage['/base.js'].lineData[43]++;
    self._propsData = {};
  }
  _$jscoverage['/base.js'].lineData[47]++;
  function syncComplete(self) {
    _$jscoverage['/base.js'].functionData[2]++;
    _$jscoverage['/base.js'].lineData[48]++;
    var _backupProps, complete = self.config.complete;
    _$jscoverage['/base.js'].lineData[50]++;
    if (visit34_50_1(!S.isEmptyObject(_backupProps = self._backupProps))) {
      _$jscoverage['/base.js'].lineData[51]++;
      Dom.css(self.node, _backupProps);
    }
    _$jscoverage['/base.js'].lineData[53]++;
    if (visit35_53_1(complete)) {
      _$jscoverage['/base.js'].lineData[54]++;
      complete.call(self);
    }
  }
  _$jscoverage['/base.js'].lineData[58]++;
  S.extend(AnimBase, Promise, {
  prepareFx: noop, 
  runInternal: function() {
  _$jscoverage['/base.js'].functionData[3]++;
  _$jscoverage['/base.js'].lineData[67]++;
  var self = this, config = self.config, node = self.node, val, _backupProps = self._backupProps, _propsData = self._propsData, to = config.to, defaultDelay = (visit36_74_1(config.delay || 0)), defaultDuration = config.duration;
  _$jscoverage['/base.js'].lineData[78]++;
  Utils.saveRunningAnim(self);
  _$jscoverage['/base.js'].lineData[81]++;
  S.each(to, function(val, prop) {
  _$jscoverage['/base.js'].functionData[4]++;
  _$jscoverage['/base.js'].lineData[82]++;
  if (visit37_82_1(!S.isPlainObject(val))) {
    _$jscoverage['/base.js'].lineData[83]++;
    val = {
  value: val};
  }
  _$jscoverage['/base.js'].lineData[87]++;
  _propsData[prop] = S.mix({
  delay: defaultDelay, 
  easing: config.easing, 
  frame: config.frame, 
  duration: defaultDuration}, val);
});
  _$jscoverage['/base.js'].lineData[97]++;
  if (visit38_97_1(node.nodeType === NodeType.ELEMENT_NODE)) {
    _$jscoverage['/base.js'].lineData[100]++;
    if (visit39_100_1(to.width || to.height)) {
      _$jscoverage['/base.js'].lineData[105]++;
      var elStyle = node.style;
      _$jscoverage['/base.js'].lineData[106]++;
      S.mix(_backupProps, {
  overflow: elStyle.overflow, 
  'overflow-x': elStyle.overflowX, 
  'overflow-y': elStyle.overflowY});
      _$jscoverage['/base.js'].lineData[111]++;
      elStyle.overflow = 'hidden';
      _$jscoverage['/base.js'].lineData[113]++;
      if (visit40_113_1(visit41_113_2(Dom.css(node, 'display') === 'inline') && visit42_114_1(Dom.css(node, 'float') === 'none'))) {
        _$jscoverage['/base.js'].lineData[115]++;
        if (visit43_115_1(S.UA.ieMode < 10)) {
          _$jscoverage['/base.js'].lineData[116]++;
          elStyle.zoom = 1;
        } else {
          _$jscoverage['/base.js'].lineData[118]++;
          elStyle.display = 'inline-block';
        }
      }
    }
    _$jscoverage['/base.js'].lineData[123]++;
    var exit, hidden;
    _$jscoverage['/base.js'].lineData[124]++;
    hidden = (visit44_124_1(Dom.css(node, 'display') === 'none'));
    _$jscoverage['/base.js'].lineData[125]++;
    S.each(_propsData, function(_propData, prop) {
  _$jscoverage['/base.js'].functionData[5]++;
  _$jscoverage['/base.js'].lineData[126]++;
  val = _propData.value;
  _$jscoverage['/base.js'].lineData[128]++;
  if (visit45_128_1(specialVals[val])) {
    _$jscoverage['/base.js'].lineData[129]++;
    if (visit46_129_1(visit47_129_2(visit48_129_3(val === 'hide') && hidden) || visit49_129_4(visit50_129_5(val === 'show') && !hidden))) {
      _$jscoverage['/base.js'].lineData[131]++;
      self.stop(true);
      _$jscoverage['/base.js'].lineData[132]++;
      exit = false;
      _$jscoverage['/base.js'].lineData[133]++;
      return exit;
    }
    _$jscoverage['/base.js'].lineData[136]++;
    _backupProps[prop] = Dom.style(node, prop);
    _$jscoverage['/base.js'].lineData[137]++;
    if (visit51_137_1(val === 'toggle')) {
      _$jscoverage['/base.js'].lineData[138]++;
      val = hidden ? 'show' : 'hide';
    }
    _$jscoverage['/base.js'].lineData[140]++;
    if (visit52_140_1(val === 'hide')) {
      _$jscoverage['/base.js'].lineData[141]++;
      _propData.value = 0;
      _$jscoverage['/base.js'].lineData[143]++;
      _backupProps.display = 'none';
    } else {
      _$jscoverage['/base.js'].lineData[145]++;
      _propData.value = Dom.css(node, prop);
      _$jscoverage['/base.js'].lineData[147]++;
      Dom.css(node, prop, 0);
      _$jscoverage['/base.js'].lineData[148]++;
      Dom.show(node);
    }
  }
  _$jscoverage['/base.js'].lineData[151]++;
  return undefined;
});
    _$jscoverage['/base.js'].lineData[154]++;
    if (visit53_154_1(exit === false)) {
      _$jscoverage['/base.js'].lineData[155]++;
      return;
    }
  }
  _$jscoverage['/base.js'].lineData[159]++;
  self.startTime = S.now();
  _$jscoverage['/base.js'].lineData[160]++;
  if (visit54_160_1(S.isEmptyObject(_propsData))) {
    _$jscoverage['/base.js'].lineData[161]++;
    self.__totalTime = defaultDuration * 1000;
    _$jscoverage['/base.js'].lineData[162]++;
    self.__waitTimeout = setTimeout(function() {
  _$jscoverage['/base.js'].functionData[6]++;
  _$jscoverage['/base.js'].lineData[163]++;
  self.stop(true);
}, self.__totalTime);
  } else {
    _$jscoverage['/base.js'].lineData[166]++;
    self.prepareFx();
    _$jscoverage['/base.js'].lineData[167]++;
    self.doStart();
  }
}, 
  isRunning: function() {
  _$jscoverage['/base.js'].functionData[7]++;
  _$jscoverage['/base.js'].lineData[176]++;
  return Utils.isAnimRunning(this);
}, 
  isPaused: function() {
  _$jscoverage['/base.js'].functionData[8]++;
  _$jscoverage['/base.js'].lineData[184]++;
  return Utils.isAnimPaused(this);
}, 
  pause: function() {
  _$jscoverage['/base.js'].functionData[9]++;
  _$jscoverage['/base.js'].lineData[193]++;
  var self = this;
  _$jscoverage['/base.js'].lineData[194]++;
  if (visit55_194_1(self.isRunning())) {
    _$jscoverage['/base.js'].lineData[196]++;
    self._runTime = S.now() - self.startTime;
    _$jscoverage['/base.js'].lineData[197]++;
    self.__totalTime -= self._runTime;
    _$jscoverage['/base.js'].lineData[198]++;
    Utils.removeRunningAnim(self);
    _$jscoverage['/base.js'].lineData[199]++;
    Utils.savePausedAnim(self);
    _$jscoverage['/base.js'].lineData[200]++;
    if (visit56_200_1(self.__waitTimeout)) {
      _$jscoverage['/base.js'].lineData[201]++;
      clearTimeout(self.__waitTimeout);
    } else {
      _$jscoverage['/base.js'].lineData[203]++;
      self.doStop();
    }
  }
  _$jscoverage['/base.js'].lineData[206]++;
  return self;
}, 
  doStop: noop, 
  doStart: noop, 
  resume: function() {
  _$jscoverage['/base.js'].functionData[10]++;
  _$jscoverage['/base.js'].lineData[228]++;
  var self = this;
  _$jscoverage['/base.js'].lineData[229]++;
  if (visit57_229_1(self.isPaused())) {
    _$jscoverage['/base.js'].lineData[231]++;
    self.startTime = S.now() - self._runTime;
    _$jscoverage['/base.js'].lineData[232]++;
    Utils.removePausedAnim(self);
    _$jscoverage['/base.js'].lineData[233]++;
    Utils.saveRunningAnim(self);
    _$jscoverage['/base.js'].lineData[234]++;
    if (visit58_234_1(self.__waitTimeout)) {
      _$jscoverage['/base.js'].lineData[235]++;
      self.__waitTimeout = setTimeout(function() {
  _$jscoverage['/base.js'].functionData[11]++;
  _$jscoverage['/base.js'].lineData[236]++;
  self.stop(true);
}, self.__totalTime);
    } else {
      _$jscoverage['/base.js'].lineData[239]++;
      self.beforeResume();
      _$jscoverage['/base.js'].lineData[240]++;
      self.doStart();
    }
  }
  _$jscoverage['/base.js'].lineData[243]++;
  return self;
}, 
  'beforeResume': noop, 
  run: function() {
  _$jscoverage['/base.js'].functionData[12]++;
  _$jscoverage['/base.js'].lineData[258]++;
  var self = this, q, queue = self.config.queue;
  _$jscoverage['/base.js'].lineData[262]++;
  if (visit59_262_1(queue === false)) {
    _$jscoverage['/base.js'].lineData[263]++;
    self.runInternal();
  } else {
    _$jscoverage['/base.js'].lineData[266]++;
    q = Q.queue(self.node, queue, self);
    _$jscoverage['/base.js'].lineData[267]++;
    if (visit60_267_1(q.length === 1)) {
      _$jscoverage['/base.js'].lineData[268]++;
      self.runInternal();
    }
  }
  _$jscoverage['/base.js'].lineData[272]++;
  return self;
}, 
  stop: function(finish) {
  _$jscoverage['/base.js'].functionData[13]++;
  _$jscoverage['/base.js'].lineData[281]++;
  var self = this, node = self.node, q, queue = self.config.queue;
  _$jscoverage['/base.js'].lineData[286]++;
  if (visit61_286_1(self.isResolved() || self.isRejected())) {
    _$jscoverage['/base.js'].lineData[287]++;
    return self;
  }
  _$jscoverage['/base.js'].lineData[290]++;
  if (visit62_290_1(self.__waitTimeout)) {
    _$jscoverage['/base.js'].lineData[291]++;
    clearTimeout(self.__waitTimeout);
    _$jscoverage['/base.js'].lineData[292]++;
    self.__waitTimeout = 0;
  }
  _$jscoverage['/base.js'].lineData[295]++;
  if (visit63_295_1(!self.isRunning() && !self.isPaused())) {
    _$jscoverage['/base.js'].lineData[296]++;
    if (visit64_296_1(queue !== false)) {
      _$jscoverage['/base.js'].lineData[298]++;
      Q.remove(node, queue, self);
    }
    _$jscoverage['/base.js'].lineData[300]++;
    return self;
  }
  _$jscoverage['/base.js'].lineData[303]++;
  self.doStop(finish);
  _$jscoverage['/base.js'].lineData[304]++;
  Utils.removeRunningAnim(self);
  _$jscoverage['/base.js'].lineData[305]++;
  Utils.removePausedAnim(self);
  _$jscoverage['/base.js'].lineData[307]++;
  var defer = self.defer;
  _$jscoverage['/base.js'].lineData[308]++;
  if (visit65_308_1(finish)) {
    _$jscoverage['/base.js'].lineData[309]++;
    syncComplete(self);
    _$jscoverage['/base.js'].lineData[310]++;
    defer.resolve([self]);
  } else {
    _$jscoverage['/base.js'].lineData[312]++;
    defer.reject([self]);
  }
  _$jscoverage['/base.js'].lineData[315]++;
  if (visit66_315_1(queue !== false)) {
    _$jscoverage['/base.js'].lineData[317]++;
    q = Q.dequeue(node, queue);
    _$jscoverage['/base.js'].lineData[318]++;
    if (visit67_318_1(q && q[0])) {
      _$jscoverage['/base.js'].lineData[319]++;
      q[0].runInternal();
    }
  }
  _$jscoverage['/base.js'].lineData[322]++;
  return self;
}});
  _$jscoverage['/base.js'].lineData[326]++;
  AnimBase.Utils = Utils;
  _$jscoverage['/base.js'].lineData[327]++;
  AnimBase.Q = Q;
  _$jscoverage['/base.js'].lineData[329]++;
  return AnimBase;
});
