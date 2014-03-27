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
  _$jscoverage['/io/methods.js'].lineData[9] = 0;
  _$jscoverage['/io/methods.js'].lineData[10] = 0;
  _$jscoverage['/io/methods.js'].lineData[16] = 0;
  _$jscoverage['/io/methods.js'].lineData[18] = 0;
  _$jscoverage['/io/methods.js'].lineData[30] = 0;
  _$jscoverage['/io/methods.js'].lineData[31] = 0;
  _$jscoverage['/io/methods.js'].lineData[34] = 0;
  _$jscoverage['/io/methods.js'].lineData[35] = 0;
  _$jscoverage['/io/methods.js'].lineData[38] = 0;
  _$jscoverage['/io/methods.js'].lineData[40] = 0;
  _$jscoverage['/io/methods.js'].lineData[41] = 0;
  _$jscoverage['/io/methods.js'].lineData[42] = 0;
  _$jscoverage['/io/methods.js'].lineData[43] = 0;
  _$jscoverage['/io/methods.js'].lineData[45] = 0;
  _$jscoverage['/io/methods.js'].lineData[51] = 0;
  _$jscoverage['/io/methods.js'].lineData[54] = 0;
  _$jscoverage['/io/methods.js'].lineData[55] = 0;
  _$jscoverage['/io/methods.js'].lineData[56] = 0;
  _$jscoverage['/io/methods.js'].lineData[57] = 0;
  _$jscoverage['/io/methods.js'].lineData[58] = 0;
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
  _$jscoverage['/io/methods.js'].lineData[102] = 0;
  _$jscoverage['/io/methods.js'].lineData[103] = 0;
  _$jscoverage['/io/methods.js'].lineData[104] = 0;
  _$jscoverage['/io/methods.js'].lineData[113] = 0;
  _$jscoverage['/io/methods.js'].lineData[114] = 0;
  _$jscoverage['/io/methods.js'].lineData[124] = 0;
  _$jscoverage['/io/methods.js'].lineData[127] = 0;
  _$jscoverage['/io/methods.js'].lineData[128] = 0;
  _$jscoverage['/io/methods.js'].lineData[129] = 0;
  _$jscoverage['/io/methods.js'].lineData[130] = 0;
  _$jscoverage['/io/methods.js'].lineData[131] = 0;
  _$jscoverage['/io/methods.js'].lineData[132] = 0;
  _$jscoverage['/io/methods.js'].lineData[135] = 0;
  _$jscoverage['/io/methods.js'].lineData[137] = 0;
  _$jscoverage['/io/methods.js'].lineData[142] = 0;
  _$jscoverage['/io/methods.js'].lineData[143] = 0;
  _$jscoverage['/io/methods.js'].lineData[144] = 0;
  _$jscoverage['/io/methods.js'].lineData[146] = 0;
  _$jscoverage['/io/methods.js'].lineData[156] = 0;
  _$jscoverage['/io/methods.js'].lineData[157] = 0;
  _$jscoverage['/io/methods.js'].lineData[158] = 0;
  _$jscoverage['/io/methods.js'].lineData[159] = 0;
  _$jscoverage['/io/methods.js'].lineData[161] = 0;
  _$jscoverage['/io/methods.js'].lineData[162] = 0;
  _$jscoverage['/io/methods.js'].lineData[171] = 0;
  _$jscoverage['/io/methods.js'].lineData[172] = 0;
  _$jscoverage['/io/methods.js'].lineData[173] = 0;
  _$jscoverage['/io/methods.js'].lineData[175] = 0;
  _$jscoverage['/io/methods.js'].lineData[179] = 0;
  _$jscoverage['/io/methods.js'].lineData[186] = 0;
  _$jscoverage['/io/methods.js'].lineData[187] = 0;
  _$jscoverage['/io/methods.js'].lineData[189] = 0;
  _$jscoverage['/io/methods.js'].lineData[190] = 0;
  _$jscoverage['/io/methods.js'].lineData[191] = 0;
  _$jscoverage['/io/methods.js'].lineData[192] = 0;
  _$jscoverage['/io/methods.js'].lineData[195] = 0;
  _$jscoverage['/io/methods.js'].lineData[196] = 0;
  _$jscoverage['/io/methods.js'].lineData[197] = 0;
  _$jscoverage['/io/methods.js'].lineData[199] = 0;
  _$jscoverage['/io/methods.js'].lineData[200] = 0;
  _$jscoverage['/io/methods.js'].lineData[201] = 0;
  _$jscoverage['/io/methods.js'].lineData[202] = 0;
  _$jscoverage['/io/methods.js'].lineData[204] = 0;
  _$jscoverage['/io/methods.js'].lineData[205] = 0;
  _$jscoverage['/io/methods.js'].lineData[206] = 0;
  _$jscoverage['/io/methods.js'].lineData[208] = 0;
  _$jscoverage['/io/methods.js'].lineData[212] = 0;
  _$jscoverage['/io/methods.js'].lineData[213] = 0;
  _$jscoverage['/io/methods.js'].lineData[217] = 0;
  _$jscoverage['/io/methods.js'].lineData[218] = 0;
  _$jscoverage['/io/methods.js'].lineData[220] = 0;
  _$jscoverage['/io/methods.js'].lineData[223] = 0;
  _$jscoverage['/io/methods.js'].lineData[224] = 0;
  _$jscoverage['/io/methods.js'].lineData[225] = 0;
  _$jscoverage['/io/methods.js'].lineData[253] = 0;
  _$jscoverage['/io/methods.js'].lineData[262] = 0;
  _$jscoverage['/io/methods.js'].lineData[263] = 0;
  _$jscoverage['/io/methods.js'].lineData[265] = 0;
  _$jscoverage['/io/methods.js'].lineData[266] = 0;
  _$jscoverage['/io/methods.js'].lineData[268] = 0;
  _$jscoverage['/io/methods.js'].lineData[269] = 0;
  _$jscoverage['/io/methods.js'].lineData[270] = 0;
  _$jscoverage['/io/methods.js'].lineData[281] = 0;
  _$jscoverage['/io/methods.js'].lineData[286] = 0;
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
  _$jscoverage['/io/methods.js'].functionData[11] = 0;
}
if (! _$jscoverage['/io/methods.js'].branchData) {
  _$jscoverage['/io/methods.js'].branchData = {};
  _$jscoverage['/io/methods.js'].branchData['30'] = [];
  _$jscoverage['/io/methods.js'].branchData['30'][1] = new BranchData();
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
  _$jscoverage['/io/methods.js'].branchData['51'] = [];
  _$jscoverage['/io/methods.js'].branchData['51'][1] = new BranchData();
  _$jscoverage['/io/methods.js'].branchData['54'] = [];
  _$jscoverage['/io/methods.js'].branchData['54'][1] = new BranchData();
  _$jscoverage['/io/methods.js'].branchData['55'] = [];
  _$jscoverage['/io/methods.js'].branchData['55'][1] = new BranchData();
  _$jscoverage['/io/methods.js'].branchData['55'][2] = new BranchData();
  _$jscoverage['/io/methods.js'].branchData['55'][3] = new BranchData();
  _$jscoverage['/io/methods.js'].branchData['58'] = [];
  _$jscoverage['/io/methods.js'].branchData['58'][1] = new BranchData();
  _$jscoverage['/io/methods.js'].branchData['58'][2] = new BranchData();
  _$jscoverage['/io/methods.js'].branchData['58'][3] = new BranchData();
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
  _$jscoverage['/io/methods.js'].branchData['114'] = [];
  _$jscoverage['/io/methods.js'].branchData['114'][1] = new BranchData();
  _$jscoverage['/io/methods.js'].branchData['128'] = [];
  _$jscoverage['/io/methods.js'].branchData['128'][1] = new BranchData();
  _$jscoverage['/io/methods.js'].branchData['129'] = [];
  _$jscoverage['/io/methods.js'].branchData['129'][1] = new BranchData();
  _$jscoverage['/io/methods.js'].branchData['137'] = [];
  _$jscoverage['/io/methods.js'].branchData['137'][1] = new BranchData();
  _$jscoverage['/io/methods.js'].branchData['143'] = [];
  _$jscoverage['/io/methods.js'].branchData['143'][1] = new BranchData();
  _$jscoverage['/io/methods.js'].branchData['157'] = [];
  _$jscoverage['/io/methods.js'].branchData['157'][1] = new BranchData();
  _$jscoverage['/io/methods.js'].branchData['158'] = [];
  _$jscoverage['/io/methods.js'].branchData['158'][1] = new BranchData();
  _$jscoverage['/io/methods.js'].branchData['172'] = [];
  _$jscoverage['/io/methods.js'].branchData['172'][1] = new BranchData();
  _$jscoverage['/io/methods.js'].branchData['186'] = [];
  _$jscoverage['/io/methods.js'].branchData['186'][1] = new BranchData();
  _$jscoverage['/io/methods.js'].branchData['192'] = [];
  _$jscoverage['/io/methods.js'].branchData['192'][1] = new BranchData();
  _$jscoverage['/io/methods.js'].branchData['192'][2] = new BranchData();
  _$jscoverage['/io/methods.js'].branchData['192'][3] = new BranchData();
  _$jscoverage['/io/methods.js'].branchData['192'][4] = new BranchData();
  _$jscoverage['/io/methods.js'].branchData['192'][5] = new BranchData();
  _$jscoverage['/io/methods.js'].branchData['195'] = [];
  _$jscoverage['/io/methods.js'].branchData['195'][1] = new BranchData();
  _$jscoverage['/io/methods.js'].branchData['204'] = [];
  _$jscoverage['/io/methods.js'].branchData['204'][1] = new BranchData();
  _$jscoverage['/io/methods.js'].branchData['212'] = [];
  _$jscoverage['/io/methods.js'].branchData['212'][1] = new BranchData();
  _$jscoverage['/io/methods.js'].branchData['283'] = [];
  _$jscoverage['/io/methods.js'].branchData['283'][1] = new BranchData();
}
_$jscoverage['/io/methods.js'].branchData['283'][1].init(91, 36, 'Uri.getComponents(c.url).query || \'\'');
function visit110_283_1(result) {
  _$jscoverage['/io/methods.js'].branchData['283'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/methods.js'].branchData['212'][1].init(26, 10, 'status < 0');
function visit109_212_1(result) {
  _$jscoverage['/io/methods.js'].branchData['212'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/methods.js'].branchData['204'][1].init(36, 12, 'e.stack || e');
function visit108_204_1(result) {
  _$jscoverage['/io/methods.js'].branchData['204'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/methods.js'].branchData['195'][1].init(165, 23, 'status === NOT_MODIFIED');
function visit107_195_1(result) {
  _$jscoverage['/io/methods.js'].branchData['195'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/methods.js'].branchData['192'][5].init(476, 23, 'status === NOT_MODIFIED');
function visit106_192_5(result) {
  _$jscoverage['/io/methods.js'].branchData['192'][5].ranCondition(result);
  return result;
}_$jscoverage['/io/methods.js'].branchData['192'][4].init(447, 25, 'status < MULTIPLE_CHOICES');
function visit105_192_4(result) {
  _$jscoverage['/io/methods.js'].branchData['192'][4].ranCondition(result);
  return result;
}_$jscoverage['/io/methods.js'].branchData['192'][3].init(426, 17, 'status >= OK_CODE');
function visit104_192_3(result) {
  _$jscoverage['/io/methods.js'].branchData['192'][3].ranCondition(result);
  return result;
}_$jscoverage['/io/methods.js'].branchData['192'][2].init(426, 46, 'status >= OK_CODE && status < MULTIPLE_CHOICES');
function visit103_192_2(result) {
  _$jscoverage['/io/methods.js'].branchData['192'][2].ranCondition(result);
  return result;
}_$jscoverage['/io/methods.js'].branchData['192'][1].init(426, 73, 'status >= OK_CODE && status < MULTIPLE_CHOICES || status === NOT_MODIFIED');
function visit102_192_1(result) {
  _$jscoverage['/io/methods.js'].branchData['192'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/methods.js'].branchData['186'][1].init(234, 16, 'self.state === 2');
function visit101_186_1(result) {
  _$jscoverage['/io/methods.js'].branchData['186'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/methods.js'].branchData['172'][1].init(71, 9, 'transport');
function visit100_172_1(result) {
  _$jscoverage['/io/methods.js'].branchData['172'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/methods.js'].branchData['158'][1].init(109, 14, 'self.transport');
function visit99_158_1(result) {
  _$jscoverage['/io/methods.js'].branchData['158'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/methods.js'].branchData['157'][1].init(65, 21, 'statusText || \'abort\'');
function visit98_157_1(result) {
  _$jscoverage['/io/methods.js'].branchData['157'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/methods.js'].branchData['143'][1].init(56, 11, '!self.state');
function visit97_143_1(result) {
  _$jscoverage['/io/methods.js'].branchData['143'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/methods.js'].branchData['137'][1].init(679, 19, 'match === undefined');
function visit96_137_1(result) {
  _$jscoverage['/io/methods.js'].branchData['137'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/methods.js'].branchData['129'][1].init(26, 41, '!(responseHeaders = self.responseHeaders)');
function visit95_129_1(result) {
  _$jscoverage['/io/methods.js'].branchData['129'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/methods.js'].branchData['128'][1].init(204, 16, 'self.state === 2');
function visit94_128_1(result) {
  _$jscoverage['/io/methods.js'].branchData['128'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/methods.js'].branchData['114'][1].init(59, 16, 'self.state === 2');
function visit93_114_1(result) {
  _$jscoverage['/io/methods.js'].branchData['114'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/methods.js'].branchData['88'][1].init(132, 10, '!converter');
function visit92_88_1(result) {
  _$jscoverage['/io/methods.js'].branchData['88'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/methods.js'].branchData['86'][1].init(65, 46, 'converts[prevType] && converts[prevType][type]');
function visit91_86_1(result) {
  _$jscoverage['/io/methods.js'].branchData['86'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/methods.js'].branchData['83'][1].init(2435, 19, 'i < dataType.length');
function visit90_83_1(result) {
  _$jscoverage['/io/methods.js'].branchData['83'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/methods.js'].branchData['73'][1].init(94, 19, 'prevType === \'text\'');
function visit89_73_1(result) {
  _$jscoverage['/io/methods.js'].branchData['73'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/methods.js'].branchData['71'][1].init(156, 30, 'converter && rawData[prevType]');
function visit88_71_1(result) {
  _$jscoverage['/io/methods.js'].branchData['71'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/methods.js'].branchData['70'][1].init(60, 46, 'converts[prevType] && converts[prevType][type]');
function visit87_70_1(result) {
  _$jscoverage['/io/methods.js'].branchData['70'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/methods.js'].branchData['65'][1].init(1236, 13, '!responseData');
function visit86_65_1(result) {
  _$jscoverage['/io/methods.js'].branchData['65'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/methods.js'].branchData['58'][3].init(218, 17, 'xml !== undefined');
function visit85_58_3(result) {
  _$jscoverage['/io/methods.js'].branchData['58'][3].ranCondition(result);
  return result;
}_$jscoverage['/io/methods.js'].branchData['58'][2].init(181, 33, 'dataType[dataTypeIndex] === \'xml\'');
function visit84_58_2(result) {
  _$jscoverage['/io/methods.js'].branchData['58'][2].ranCondition(result);
  return result;
}_$jscoverage['/io/methods.js'].branchData['58'][1].init(181, 54, 'dataType[dataTypeIndex] === \'xml\' && xml !== undefined');
function visit83_58_1(result) {
  _$jscoverage['/io/methods.js'].branchData['58'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/methods.js'].branchData['55'][3].init(60, 18, 'text !== undefined');
function visit82_55_3(result) {
  _$jscoverage['/io/methods.js'].branchData['55'][3].ranCondition(result);
  return result;
}_$jscoverage['/io/methods.js'].branchData['55'][2].init(22, 34, 'dataType[dataTypeIndex] === \'text\'');
function visit81_55_2(result) {
  _$jscoverage['/io/methods.js'].branchData['55'][2].ranCondition(result);
  return result;
}_$jscoverage['/io/methods.js'].branchData['55'][1].init(22, 56, 'dataType[dataTypeIndex] === \'text\' && text !== undefined');
function visit80_55_1(result) {
  _$jscoverage['/io/methods.js'].branchData['55'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/methods.js'].branchData['54'][1].init(775, 31, 'dataTypeIndex < dataType.length');
function visit79_54_1(result) {
  _$jscoverage['/io/methods.js'].branchData['54'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/methods.js'].branchData['51'][1].init(683, 21, 'dataType[0] || \'text\'');
function visit78_51_1(result) {
  _$jscoverage['/io/methods.js'].branchData['51'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/methods.js'].branchData['42'][1].init(30, 20, 'dataType[0] !== type');
function visit77_42_1(result) {
  _$jscoverage['/io/methods.js'].branchData['42'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/methods.js'].branchData['41'][1].init(26, 32, 'contents[type].test(contentType)');
function visit76_41_1(result) {
  _$jscoverage['/io/methods.js'].branchData['41'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/methods.js'].branchData['38'][1].init(221, 16, '!dataType.length');
function visit75_38_1(result) {
  _$jscoverage['/io/methods.js'].branchData['38'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/methods.js'].branchData['34'][1].init(129, 19, 'dataType[0] === \'*\'');
function visit74_34_1(result) {
  _$jscoverage['/io/methods.js'].branchData['34'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/methods.js'].branchData['31'][1].init(28, 51, 'io.mimeType || io.getResponseHeader(\'Content-Type\')');
function visit73_31_1(result) {
  _$jscoverage['/io/methods.js'].branchData['31'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/methods.js'].branchData['30'][1].init(427, 11, 'text || xml');
function visit72_30_1(result) {
  _$jscoverage['/io/methods.js'].branchData['30'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/methods.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/io/methods.js'].functionData[0]++;
  _$jscoverage['/io/methods.js'].lineData[7]++;
  var Promise = require('promise'), IO = require('./base');
  _$jscoverage['/io/methods.js'].lineData[9]++;
  var Uri = require('uri');
  _$jscoverage['/io/methods.js'].lineData[10]++;
  var OK_CODE = 200, MULTIPLE_CHOICES = 300, NOT_MODIFIED = 304, HEADER_REG = /^(.*?):[ \t]*([^\r\n]*)\r?$/mg;
  _$jscoverage['/io/methods.js'].lineData[16]++;
  function handleResponseData(io) {
    _$jscoverage['/io/methods.js'].functionData[1]++;
    _$jscoverage['/io/methods.js'].lineData[18]++;
    var text = io.responseText, xml = io.responseXML, c = io.config, converts = c.converters, type, contentType, responseData, contents = c.contents, dataType = c.dataType;
    _$jscoverage['/io/methods.js'].lineData[30]++;
    if (visit72_30_1(text || xml)) {
      _$jscoverage['/io/methods.js'].lineData[31]++;
      contentType = visit73_31_1(io.mimeType || io.getResponseHeader('Content-Type'));
      _$jscoverage['/io/methods.js'].lineData[34]++;
      while (visit74_34_1(dataType[0] === '*')) {
        _$jscoverage['/io/methods.js'].lineData[35]++;
        dataType.shift();
      }
      _$jscoverage['/io/methods.js'].lineData[38]++;
      if (visit75_38_1(!dataType.length)) {
        _$jscoverage['/io/methods.js'].lineData[40]++;
        for (type in contents) {
          _$jscoverage['/io/methods.js'].lineData[41]++;
          if (visit76_41_1(contents[type].test(contentType))) {
            _$jscoverage['/io/methods.js'].lineData[42]++;
            if (visit77_42_1(dataType[0] !== type)) {
              _$jscoverage['/io/methods.js'].lineData[43]++;
              dataType.unshift(type);
            }
            _$jscoverage['/io/methods.js'].lineData[45]++;
            break;
          }
        }
      }
      _$jscoverage['/io/methods.js'].lineData[51]++;
      dataType[0] = visit78_51_1(dataType[0] || 'text');
      _$jscoverage['/io/methods.js'].lineData[54]++;
      for (var dataTypeIndex = 0; visit79_54_1(dataTypeIndex < dataType.length); dataTypeIndex++) {
        _$jscoverage['/io/methods.js'].lineData[55]++;
        if (visit80_55_1(visit81_55_2(dataType[dataTypeIndex] === 'text') && visit82_55_3(text !== undefined))) {
          _$jscoverage['/io/methods.js'].lineData[56]++;
          responseData = text;
          _$jscoverage['/io/methods.js'].lineData[57]++;
          break;
        } else {
          _$jscoverage['/io/methods.js'].lineData[58]++;
          if (visit83_58_1(visit84_58_2(dataType[dataTypeIndex] === 'xml') && visit85_58_3(xml !== undefined))) {
            _$jscoverage['/io/methods.js'].lineData[60]++;
            responseData = xml;
            _$jscoverage['/io/methods.js'].lineData[61]++;
            break;
          }
        }
      }
      _$jscoverage['/io/methods.js'].lineData[65]++;
      if (visit86_65_1(!responseData)) {
        _$jscoverage['/io/methods.js'].lineData[66]++;
        var rawData = {
  text: text, 
  xml: xml};
        _$jscoverage['/io/methods.js'].lineData[68]++;
        S.each(['text', 'xml'], function(prevType) {
  _$jscoverage['/io/methods.js'].functionData[2]++;
  _$jscoverage['/io/methods.js'].lineData[69]++;
  var type = dataType[0], converter = visit87_70_1(converts[prevType] && converts[prevType][type]);
  _$jscoverage['/io/methods.js'].lineData[71]++;
  if (visit88_71_1(converter && rawData[prevType])) {
    _$jscoverage['/io/methods.js'].lineData[72]++;
    dataType.unshift(prevType);
    _$jscoverage['/io/methods.js'].lineData[73]++;
    responseData = visit89_73_1(prevType === 'text') ? text : xml;
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
    for (var i = 1; visit90_83_1(i < dataType.length); i++) {
      _$jscoverage['/io/methods.js'].lineData[84]++;
      type = dataType[i];
      _$jscoverage['/io/methods.js'].lineData[86]++;
      var converter = visit91_86_1(converts[prevType] && converts[prevType][type]);
      _$jscoverage['/io/methods.js'].lineData[88]++;
      if (visit92_88_1(!converter)) {
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
  _$jscoverage['/io/methods.js'].lineData[102]++;
  var self = this;
  _$jscoverage['/io/methods.js'].lineData[103]++;
  self.requestHeaders[name] = value;
  _$jscoverage['/io/methods.js'].lineData[104]++;
  return self;
}, 
  getAllResponseHeaders: function() {
  _$jscoverage['/io/methods.js'].functionData[4]++;
  _$jscoverage['/io/methods.js'].lineData[113]++;
  var self = this;
  _$jscoverage['/io/methods.js'].lineData[114]++;
  return visit93_114_1(self.state === 2) ? self.responseHeadersString : null;
}, 
  getResponseHeader: function(name) {
  _$jscoverage['/io/methods.js'].functionData[5]++;
  _$jscoverage['/io/methods.js'].lineData[124]++;
  var match, responseHeaders, self = this;
  _$jscoverage['/io/methods.js'].lineData[127]++;
  name = name.toLowerCase();
  _$jscoverage['/io/methods.js'].lineData[128]++;
  if (visit94_128_1(self.state === 2)) {
    _$jscoverage['/io/methods.js'].lineData[129]++;
    if (visit95_129_1(!(responseHeaders = self.responseHeaders))) {
      _$jscoverage['/io/methods.js'].lineData[130]++;
      responseHeaders = self.responseHeaders = {};
      _$jscoverage['/io/methods.js'].lineData[131]++;
      while ((match = HEADER_REG.exec(self.responseHeadersString))) {
        _$jscoverage['/io/methods.js'].lineData[132]++;
        responseHeaders[match[1].toLowerCase()] = match[2];
      }
    }
    _$jscoverage['/io/methods.js'].lineData[135]++;
    match = responseHeaders[name];
  }
  _$jscoverage['/io/methods.js'].lineData[137]++;
  return visit96_137_1(match === undefined) ? null : match;
}, 
  overrideMimeType: function(type) {
  _$jscoverage['/io/methods.js'].functionData[6]++;
  _$jscoverage['/io/methods.js'].lineData[142]++;
  var self = this;
  _$jscoverage['/io/methods.js'].lineData[143]++;
  if (visit97_143_1(!self.state)) {
    _$jscoverage['/io/methods.js'].lineData[144]++;
    self.mimeType = type;
  }
  _$jscoverage['/io/methods.js'].lineData[146]++;
  return self;
}, 
  abort: function(statusText) {
  _$jscoverage['/io/methods.js'].functionData[7]++;
  _$jscoverage['/io/methods.js'].lineData[156]++;
  var self = this;
  _$jscoverage['/io/methods.js'].lineData[157]++;
  statusText = visit98_157_1(statusText || 'abort');
  _$jscoverage['/io/methods.js'].lineData[158]++;
  if (visit99_158_1(self.transport)) {
    _$jscoverage['/io/methods.js'].lineData[159]++;
    self.transport.abort(statusText);
  }
  _$jscoverage['/io/methods.js'].lineData[161]++;
  self._ioReady(0, statusText);
  _$jscoverage['/io/methods.js'].lineData[162]++;
  return self;
}, 
  getNativeXhr: function() {
  _$jscoverage['/io/methods.js'].functionData[8]++;
  _$jscoverage['/io/methods.js'].lineData[171]++;
  var transport = this.transport;
  _$jscoverage['/io/methods.js'].lineData[172]++;
  if (visit100_172_1(transport)) {
    _$jscoverage['/io/methods.js'].lineData[173]++;
    return transport.nativeXhr;
  }
  _$jscoverage['/io/methods.js'].lineData[175]++;
  return null;
}, 
  _ioReady: function(status, statusText) {
  _$jscoverage['/io/methods.js'].functionData[9]++;
  _$jscoverage['/io/methods.js'].lineData[179]++;
  var self = this;
  _$jscoverage['/io/methods.js'].lineData[186]++;
  if (visit101_186_1(self.state === 2)) {
    _$jscoverage['/io/methods.js'].lineData[187]++;
    return;
  }
  _$jscoverage['/io/methods.js'].lineData[189]++;
  self.state = 2;
  _$jscoverage['/io/methods.js'].lineData[190]++;
  self.readyState = 4;
  _$jscoverage['/io/methods.js'].lineData[191]++;
  var isSuccess;
  _$jscoverage['/io/methods.js'].lineData[192]++;
  if (visit102_192_1(visit103_192_2(visit104_192_3(status >= OK_CODE) && visit105_192_4(status < MULTIPLE_CHOICES)) || visit106_192_5(status === NOT_MODIFIED))) {
    _$jscoverage['/io/methods.js'].lineData[195]++;
    if (visit107_195_1(status === NOT_MODIFIED)) {
      _$jscoverage['/io/methods.js'].lineData[196]++;
      statusText = 'not modified';
      _$jscoverage['/io/methods.js'].lineData[197]++;
      isSuccess = true;
    } else {
      _$jscoverage['/io/methods.js'].lineData[199]++;
      try {
        _$jscoverage['/io/methods.js'].lineData[200]++;
        handleResponseData(self);
        _$jscoverage['/io/methods.js'].lineData[201]++;
        statusText = 'success';
        _$jscoverage['/io/methods.js'].lineData[202]++;
        isSuccess = true;
      }      catch (e) {
  _$jscoverage['/io/methods.js'].lineData[204]++;
  S.log(visit108_204_1(e.stack || e), 'error');
  _$jscoverage['/io/methods.js'].lineData[205]++;
  setTimeout(function() {
  _$jscoverage['/io/methods.js'].functionData[10]++;
  _$jscoverage['/io/methods.js'].lineData[206]++;
  throw e;
}, 0);
  _$jscoverage['/io/methods.js'].lineData[208]++;
  statusText = 'parser error';
}
    }
  } else {
    _$jscoverage['/io/methods.js'].lineData[212]++;
    if (visit109_212_1(status < 0)) {
      _$jscoverage['/io/methods.js'].lineData[213]++;
      status = 0;
    }
  }
  _$jscoverage['/io/methods.js'].lineData[217]++;
  self.status = status;
  _$jscoverage['/io/methods.js'].lineData[218]++;
  self.statusText = statusText;
  _$jscoverage['/io/methods.js'].lineData[220]++;
  var defer = self.defer, config = self.config, timeoutTimer;
  _$jscoverage['/io/methods.js'].lineData[223]++;
  if ((timeoutTimer = self.timeoutTimer)) {
    _$jscoverage['/io/methods.js'].lineData[224]++;
    clearTimeout(timeoutTimer);
    _$jscoverage['/io/methods.js'].lineData[225]++;
    self.timeoutTimer = 0;
  }
  _$jscoverage['/io/methods.js'].lineData[253]++;
  var handler = isSuccess ? 'success' : 'error', h, v = [self.responseData, statusText, self], context = config.context, eventObject = {
  ajaxConfig: config, 
  io: self};
  _$jscoverage['/io/methods.js'].lineData[262]++;
  if ((h = config[handler])) {
    _$jscoverage['/io/methods.js'].lineData[263]++;
    h.apply(context, v);
  }
  _$jscoverage['/io/methods.js'].lineData[265]++;
  if ((h = config.complete)) {
    _$jscoverage['/io/methods.js'].lineData[266]++;
    h.apply(context, v);
  }
  _$jscoverage['/io/methods.js'].lineData[268]++;
  IO.fire(handler, eventObject);
  _$jscoverage['/io/methods.js'].lineData[269]++;
  IO.fire('complete', eventObject);
  _$jscoverage['/io/methods.js'].lineData[270]++;
  defer[isSuccess ? 'resolve' : 'reject'](v);
}, 
  _getUrlForSend: function() {
  _$jscoverage['/io/methods.js'].functionData[11]++;
  _$jscoverage['/io/methods.js'].lineData[281]++;
  var c = this.config, uri = c.uri, originalQuery = visit110_283_1(Uri.getComponents(c.url).query || ''), url = uri.toString.call(uri, c.serializeArray);
  _$jscoverage['/io/methods.js'].lineData[286]++;
  return url + (originalQuery ? ((uri.query.has() ? '&' : '?') + originalQuery) : originalQuery);
}});
});
