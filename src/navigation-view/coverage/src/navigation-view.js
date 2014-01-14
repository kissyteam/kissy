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
if (! _$jscoverage['/navigation-view.js']) {
  _$jscoverage['/navigation-view.js'] = {};
  _$jscoverage['/navigation-view.js'].lineData = [];
  _$jscoverage['/navigation-view.js'].lineData[5] = 0;
  _$jscoverage['/navigation-view.js'].lineData[6] = 0;
  _$jscoverage['/navigation-view.js'].lineData[7] = 0;
  _$jscoverage['/navigation-view.js'].lineData[8] = 0;
  _$jscoverage['/navigation-view.js'].lineData[9] = 0;
  _$jscoverage['/navigation-view.js'].lineData[10] = 0;
  _$jscoverage['/navigation-view.js'].lineData[11] = 0;
  _$jscoverage['/navigation-view.js'].lineData[17] = 0;
  _$jscoverage['/navigation-view.js'].lineData[19] = 0;
  _$jscoverage['/navigation-view.js'].lineData[21] = 0;
  _$jscoverage['/navigation-view.js'].lineData[24] = 0;
  _$jscoverage['/navigation-view.js'].lineData[25] = 0;
  _$jscoverage['/navigation-view.js'].lineData[29] = 0;
  _$jscoverage['/navigation-view.js'].lineData[30] = 0;
  _$jscoverage['/navigation-view.js'].lineData[31] = 0;
  _$jscoverage['/navigation-view.js'].lineData[35] = 0;
  _$jscoverage['/navigation-view.js'].lineData[36] = 0;
  _$jscoverage['/navigation-view.js'].lineData[37] = 0;
  _$jscoverage['/navigation-view.js'].lineData[38] = 0;
  _$jscoverage['/navigation-view.js'].lineData[39] = 0;
  _$jscoverage['/navigation-view.js'].lineData[40] = 0;
  _$jscoverage['/navigation-view.js'].lineData[41] = 0;
  _$jscoverage['/navigation-view.js'].lineData[42] = 0;
  _$jscoverage['/navigation-view.js'].lineData[45] = 0;
  _$jscoverage['/navigation-view.js'].lineData[49] = 0;
  _$jscoverage['/navigation-view.js'].lineData[52] = 0;
  _$jscoverage['/navigation-view.js'].lineData[53] = 0;
  _$jscoverage['/navigation-view.js'].lineData[54] = 0;
  _$jscoverage['/navigation-view.js'].lineData[55] = 0;
  _$jscoverage['/navigation-view.js'].lineData[56] = 0;
  _$jscoverage['/navigation-view.js'].lineData[58] = 0;
  _$jscoverage['/navigation-view.js'].lineData[59] = 0;
  _$jscoverage['/navigation-view.js'].lineData[60] = 0;
  _$jscoverage['/navigation-view.js'].lineData[62] = 0;
  _$jscoverage['/navigation-view.js'].lineData[63] = 0;
  _$jscoverage['/navigation-view.js'].lineData[67] = 0;
  _$jscoverage['/navigation-view.js'].lineData[69] = 0;
  _$jscoverage['/navigation-view.js'].lineData[76] = 0;
  _$jscoverage['/navigation-view.js'].lineData[80] = 0;
  _$jscoverage['/navigation-view.js'].lineData[81] = 0;
  _$jscoverage['/navigation-view.js'].lineData[82] = 0;
  _$jscoverage['/navigation-view.js'].lineData[83] = 0;
  _$jscoverage['/navigation-view.js'].lineData[84] = 0;
  _$jscoverage['/navigation-view.js'].lineData[85] = 0;
  _$jscoverage['/navigation-view.js'].lineData[95] = 0;
  _$jscoverage['/navigation-view.js'].lineData[96] = 0;
  _$jscoverage['/navigation-view.js'].lineData[97] = 0;
  _$jscoverage['/navigation-view.js'].lineData[98] = 0;
  _$jscoverage['/navigation-view.js'].lineData[101] = 0;
  _$jscoverage['/navigation-view.js'].lineData[103] = 0;
  _$jscoverage['/navigation-view.js'].lineData[107] = 0;
  _$jscoverage['/navigation-view.js'].lineData[110] = 0;
  _$jscoverage['/navigation-view.js'].lineData[111] = 0;
  _$jscoverage['/navigation-view.js'].lineData[112] = 0;
  _$jscoverage['/navigation-view.js'].lineData[113] = 0;
  _$jscoverage['/navigation-view.js'].lineData[114] = 0;
  _$jscoverage['/navigation-view.js'].lineData[115] = 0;
  _$jscoverage['/navigation-view.js'].lineData[116] = 0;
  _$jscoverage['/navigation-view.js'].lineData[117] = 0;
  _$jscoverage['/navigation-view.js'].lineData[118] = 0;
  _$jscoverage['/navigation-view.js'].lineData[120] = 0;
  _$jscoverage['/navigation-view.js'].lineData[121] = 0;
  _$jscoverage['/navigation-view.js'].lineData[123] = 0;
  _$jscoverage['/navigation-view.js'].lineData[124] = 0;
  _$jscoverage['/navigation-view.js'].lineData[126] = 0;
  _$jscoverage['/navigation-view.js'].lineData[127] = 0;
  _$jscoverage['/navigation-view.js'].lineData[128] = 0;
  _$jscoverage['/navigation-view.js'].lineData[129] = 0;
  _$jscoverage['/navigation-view.js'].lineData[130] = 0;
  _$jscoverage['/navigation-view.js'].lineData[137] = 0;
  _$jscoverage['/navigation-view.js'].lineData[138] = 0;
  _$jscoverage['/navigation-view.js'].lineData[139] = 0;
  _$jscoverage['/navigation-view.js'].lineData[140] = 0;
  _$jscoverage['/navigation-view.js'].lineData[141] = 0;
  _$jscoverage['/navigation-view.js'].lineData[148] = 0;
  _$jscoverage['/navigation-view.js'].lineData[150] = 0;
  _$jscoverage['/navigation-view.js'].lineData[151] = 0;
  _$jscoverage['/navigation-view.js'].lineData[152] = 0;
  _$jscoverage['/navigation-view.js'].lineData[153] = 0;
  _$jscoverage['/navigation-view.js'].lineData[160] = 0;
  _$jscoverage['/navigation-view.js'].lineData[162] = 0;
  _$jscoverage['/navigation-view.js'].lineData[164] = 0;
  _$jscoverage['/navigation-view.js'].lineData[165] = 0;
  _$jscoverage['/navigation-view.js'].lineData[166] = 0;
  _$jscoverage['/navigation-view.js'].lineData[167] = 0;
  _$jscoverage['/navigation-view.js'].lineData[168] = 0;
  _$jscoverage['/navigation-view.js'].lineData[171] = 0;
  _$jscoverage['/navigation-view.js'].lineData[172] = 0;
  _$jscoverage['/navigation-view.js'].lineData[173] = 0;
  _$jscoverage['/navigation-view.js'].lineData[174] = 0;
  _$jscoverage['/navigation-view.js'].lineData[175] = 0;
  _$jscoverage['/navigation-view.js'].lineData[176] = 0;
  _$jscoverage['/navigation-view.js'].lineData[177] = 0;
  _$jscoverage['/navigation-view.js'].lineData[178] = 0;
  _$jscoverage['/navigation-view.js'].lineData[179] = 0;
  _$jscoverage['/navigation-view.js'].lineData[186] = 0;
  _$jscoverage['/navigation-view.js'].lineData[188] = 0;
  _$jscoverage['/navigation-view.js'].lineData[192] = 0;
  _$jscoverage['/navigation-view.js'].lineData[194] = 0;
  _$jscoverage['/navigation-view.js'].lineData[195] = 0;
  _$jscoverage['/navigation-view.js'].lineData[196] = 0;
  _$jscoverage['/navigation-view.js'].lineData[197] = 0;
  _$jscoverage['/navigation-view.js'].lineData[198] = 0;
  _$jscoverage['/navigation-view.js'].lineData[199] = 0;
  _$jscoverage['/navigation-view.js'].lineData[200] = 0;
  _$jscoverage['/navigation-view.js'].lineData[201] = 0;
  _$jscoverage['/navigation-view.js'].lineData[202] = 0;
  _$jscoverage['/navigation-view.js'].lineData[203] = 0;
  _$jscoverage['/navigation-view.js'].lineData[205] = 0;
  _$jscoverage['/navigation-view.js'].lineData[206] = 0;
  _$jscoverage['/navigation-view.js'].lineData[208] = 0;
  _$jscoverage['/navigation-view.js'].lineData[209] = 0;
  _$jscoverage['/navigation-view.js'].lineData[211] = 0;
  _$jscoverage['/navigation-view.js'].lineData[212] = 0;
  _$jscoverage['/navigation-view.js'].lineData[213] = 0;
  _$jscoverage['/navigation-view.js'].lineData[214] = 0;
  _$jscoverage['/navigation-view.js'].lineData[215] = 0;
  _$jscoverage['/navigation-view.js'].lineData[222] = 0;
  _$jscoverage['/navigation-view.js'].lineData[223] = 0;
  _$jscoverage['/navigation-view.js'].lineData[224] = 0;
  _$jscoverage['/navigation-view.js'].lineData[225] = 0;
  _$jscoverage['/navigation-view.js'].lineData[226] = 0;
  _$jscoverage['/navigation-view.js'].lineData[227] = 0;
  _$jscoverage['/navigation-view.js'].lineData[235] = 0;
  _$jscoverage['/navigation-view.js'].lineData[236] = 0;
  _$jscoverage['/navigation-view.js'].lineData[237] = 0;
  _$jscoverage['/navigation-view.js'].lineData[238] = 0;
  _$jscoverage['/navigation-view.js'].lineData[239] = 0;
  _$jscoverage['/navigation-view.js'].lineData[246] = 0;
  _$jscoverage['/navigation-view.js'].lineData[249] = 0;
  _$jscoverage['/navigation-view.js'].lineData[250] = 0;
  _$jscoverage['/navigation-view.js'].lineData[251] = 0;
  _$jscoverage['/navigation-view.js'].lineData[252] = 0;
  _$jscoverage['/navigation-view.js'].lineData[255] = 0;
  _$jscoverage['/navigation-view.js'].lineData[256] = 0;
  _$jscoverage['/navigation-view.js'].lineData[258] = 0;
  _$jscoverage['/navigation-view.js'].lineData[259] = 0;
  _$jscoverage['/navigation-view.js'].lineData[260] = 0;
  _$jscoverage['/navigation-view.js'].lineData[261] = 0;
  _$jscoverage['/navigation-view.js'].lineData[262] = 0;
  _$jscoverage['/navigation-view.js'].lineData[263] = 0;
  _$jscoverage['/navigation-view.js'].lineData[264] = 0;
  _$jscoverage['/navigation-view.js'].lineData[265] = 0;
}
if (! _$jscoverage['/navigation-view.js'].functionData) {
  _$jscoverage['/navigation-view.js'].functionData = [];
  _$jscoverage['/navigation-view.js'].functionData[0] = 0;
  _$jscoverage['/navigation-view.js'].functionData[1] = 0;
  _$jscoverage['/navigation-view.js'].functionData[2] = 0;
  _$jscoverage['/navigation-view.js'].functionData[3] = 0;
  _$jscoverage['/navigation-view.js'].functionData[4] = 0;
  _$jscoverage['/navigation-view.js'].functionData[5] = 0;
  _$jscoverage['/navigation-view.js'].functionData[6] = 0;
  _$jscoverage['/navigation-view.js'].functionData[7] = 0;
  _$jscoverage['/navigation-view.js'].functionData[8] = 0;
  _$jscoverage['/navigation-view.js'].functionData[9] = 0;
  _$jscoverage['/navigation-view.js'].functionData[10] = 0;
  _$jscoverage['/navigation-view.js'].functionData[11] = 0;
  _$jscoverage['/navigation-view.js'].functionData[12] = 0;
  _$jscoverage['/navigation-view.js'].functionData[13] = 0;
  _$jscoverage['/navigation-view.js'].functionData[14] = 0;
}
if (! _$jscoverage['/navigation-view.js'].branchData) {
  _$jscoverage['/navigation-view.js'].branchData = {};
  _$jscoverage['/navigation-view.js'].branchData['30'] = [];
  _$jscoverage['/navigation-view.js'].branchData['30'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['37'] = [];
  _$jscoverage['/navigation-view.js'].branchData['37'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['38'] = [];
  _$jscoverage['/navigation-view.js'].branchData['38'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['39'] = [];
  _$jscoverage['/navigation-view.js'].branchData['39'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['40'] = [];
  _$jscoverage['/navigation-view.js'].branchData['40'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['41'] = [];
  _$jscoverage['/navigation-view.js'].branchData['41'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['55'] = [];
  _$jscoverage['/navigation-view.js'].branchData['55'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['62'] = [];
  _$jscoverage['/navigation-view.js'].branchData['62'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['76'] = [];
  _$jscoverage['/navigation-view.js'].branchData['76'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['97'] = [];
  _$jscoverage['/navigation-view.js'].branchData['97'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['117'] = [];
  _$jscoverage['/navigation-view.js'].branchData['117'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['120'] = [];
  _$jscoverage['/navigation-view.js'].branchData['120'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['123'] = [];
  _$jscoverage['/navigation-view.js'].branchData['123'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['127'] = [];
  _$jscoverage['/navigation-view.js'].branchData['127'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['137'] = [];
  _$jscoverage['/navigation-view.js'].branchData['137'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['162'] = [];
  _$jscoverage['/navigation-view.js'].branchData['162'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['165'] = [];
  _$jscoverage['/navigation-view.js'].branchData['165'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['172'] = [];
  _$jscoverage['/navigation-view.js'].branchData['172'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['175'] = [];
  _$jscoverage['/navigation-view.js'].branchData['175'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['175'][2] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['178'] = [];
  _$jscoverage['/navigation-view.js'].branchData['178'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['194'] = [];
  _$jscoverage['/navigation-view.js'].branchData['194'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['202'] = [];
  _$jscoverage['/navigation-view.js'].branchData['202'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['205'] = [];
  _$jscoverage['/navigation-view.js'].branchData['205'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['208'] = [];
  _$jscoverage['/navigation-view.js'].branchData['208'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['212'] = [];
  _$jscoverage['/navigation-view.js'].branchData['212'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['222'] = [];
  _$jscoverage['/navigation-view.js'].branchData['222'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['249'] = [];
  _$jscoverage['/navigation-view.js'].branchData['249'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['256'] = [];
  _$jscoverage['/navigation-view.js'].branchData['256'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['256'][2] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['258'] = [];
  _$jscoverage['/navigation-view.js'].branchData['258'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['261'] = [];
  _$jscoverage['/navigation-view.js'].branchData['261'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['261'][2] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['264'] = [];
  _$jscoverage['/navigation-view.js'].branchData['264'][1] = new BranchData();
}
_$jscoverage['/navigation-view.js'].branchData['264'][1].init(156, 27, 'nextView.get(\'title\') || \'\'');
function visit58_264_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['264'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['261'][2].init(110, 33, 'activeView.uuid === nextView.uuid');
function visit57_261_2(result) {
  _$jscoverage['/navigation-view.js'].branchData['261'][2].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['261'][1].init(96, 47, 'activeView && activeView.uuid === nextView.uuid');
function visit56_261_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['261'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['258'][1].init(2832, 7, 'promise');
function visit55_258_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['258'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['256'][2].init(2786, 20, 'viewStack.length > 1');
function visit54_256_2(result) {
  _$jscoverage['/navigation-view.js'].branchData['256'][2].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['256'][1].init(2757, 27, 'nextView.get(\'title\') || \'\'');
function visit53_256_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['256'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['249'][1].init(26, 8, '!promise');
function visit52_249_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['249'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['222'][1].init(461, 7, 'promise');
function visit51_222_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['222'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['212'][1].init(779, 17, '!self.isLoading()');
function visit50_212_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['212'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['208'][1].init(633, 14, 'nextView.enter');
function visit49_208_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['208'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['205'][1].init(520, 16, 'ViewClassInfo[1]');
function visit48_205_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['205'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['202'][1].init(379, 56, '(activeView = self.get(\'activeView\')) && activeView.leave');
function visit47_202_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['202'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['194'][1].init(93, 20, 'viewStack.length > 1');
function visit46_194_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['194'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['178'][1].init(144, 27, 'nextView.get(\'title\') || \'\'');
function visit45_178_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['178'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['175'][2].init(102, 33, 'activeView.uuid === nextView.uuid');
function visit44_175_2(result) {
  _$jscoverage['/navigation-view.js'].branchData['175'][2].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['175'][1].init(88, 47, 'activeView && activeView.uuid === nextView.uuid');
function visit43_175_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['175'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['172'][1].init(2615, 7, 'promise');
function visit42_172_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['172'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['165'][1].init(80, 8, '!promise');
function visit41_165_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['165'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['162'][1].init(1450, 27, 'nextView.get(\'title\') || \'\'');
function visit40_162_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['162'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['137'][1].init(410, 7, 'promise');
function visit39_137_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['137'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['127'][1].init(772, 17, '!self.isLoading()');
function visit38_127_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['127'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['123'][1].init(642, 14, 'nextView.enter');
function visit37_123_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['123'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['120'][1].init(561, 6, 'config');
function visit36_120_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['120'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['117'][1].init(432, 56, '(activeView = self.get(\'activeView\')) && activeView.leave');
function visit35_117_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['117'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['97'][1].init(118, 9, '!nextView');
function visit34_97_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['97'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['76'][1].init(21, 40, 'this.loadingEl.css(\'display\') !== \'none\'');
function visit33_76_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['76'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['62'][1].init(387, 15, 'i < removedSize');
function visit32_62_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['62'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['55'][1].init(145, 32, 'children.length <= viewCacheSize');
function visit31_55_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['55'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['41'][1].init(26, 36, 'children[i].get(\'viewId\') === viewId');
function visit30_41_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['41'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['40'][1].init(22, 6, 'viewId');
function visit29_40_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['40'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['39'][1].init(18, 37, 'children[i].constructor === ViewClass');
function visit28_39_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['39'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['38'][1].init(129, 19, 'i < children.length');
function visit27_38_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['38'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['37'][1].init(79, 23, 'config && config.viewId');
function visit26_37_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['37'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['30'][1].init(14, 28, 'e.target === this.get(\'bar\')');
function visit25_30_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['30'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].lineData[5]++;
KISSY.add(function(S, require) {
  _$jscoverage['/navigation-view.js'].functionData[0]++;
  _$jscoverage['/navigation-view.js'].lineData[6]++;
  var $ = require('node').all;
  _$jscoverage['/navigation-view.js'].lineData[7]++;
  var Container = require('component/container');
  _$jscoverage['/navigation-view.js'].lineData[8]++;
  var Bar = require('navigation-view/bar');
  _$jscoverage['/navigation-view.js'].lineData[9]++;
  var ContentTpl = require('component/extension/content-xtpl');
  _$jscoverage['/navigation-view.js'].lineData[10]++;
  var ContentRender = require('component/extension/content-render');
  _$jscoverage['/navigation-view.js'].lineData[11]++;
  var LOADING_HTML = '<div class="{prefixCls}navigation-view-loading">' + '<div class="{prefixCls}navigation-view-loading-outer">' + '<div class="{prefixCls}navigation-view-loading-inner"></div>' + '</div>' + '</div>';
  _$jscoverage['/navigation-view.js'].lineData[17]++;
  var uuid = 0;
  _$jscoverage['/navigation-view.js'].lineData[19]++;
  var NavigationViewRender = Container.getDefaultRender().extend([ContentRender], {
  renderUI: function() {
  _$jscoverage['/navigation-view.js'].functionData[1]++;
  _$jscoverage['/navigation-view.js'].lineData[21]++;
  var loadingEl = $(S.substitute(LOADING_HTML, {
  prefixCls: this.control.get('prefixCls')}));
  _$jscoverage['/navigation-view.js'].lineData[24]++;
  this.control.get('contentEl').append(loadingEl);
  _$jscoverage['/navigation-view.js'].lineData[25]++;
  this.control.loadingEl = loadingEl;
}});
  _$jscoverage['/navigation-view.js'].lineData[29]++;
  function onBack(e) {
    _$jscoverage['/navigation-view.js'].functionData[2]++;
    _$jscoverage['/navigation-view.js'].lineData[30]++;
    if (visit25_30_1(e.target === this.get('bar'))) {
      _$jscoverage['/navigation-view.js'].lineData[31]++;
      this.pop();
    }
  }
  _$jscoverage['/navigation-view.js'].lineData[35]++;
  function getViewInstance(navigationView, ViewClass, config) {
    _$jscoverage['/navigation-view.js'].functionData[3]++;
    _$jscoverage['/navigation-view.js'].lineData[36]++;
    var children = navigationView.get('children');
    _$jscoverage['/navigation-view.js'].lineData[37]++;
    var viewId = visit26_37_1(config && config.viewId);
    _$jscoverage['/navigation-view.js'].lineData[38]++;
    for (var i = 0; visit27_38_1(i < children.length); i++) {
      _$jscoverage['/navigation-view.js'].lineData[39]++;
      if (visit28_39_1(children[i].constructor === ViewClass)) {
        _$jscoverage['/navigation-view.js'].lineData[40]++;
        if (visit29_40_1(viewId)) {
          _$jscoverage['/navigation-view.js'].lineData[41]++;
          if (visit30_41_1(children[i].get('viewId') === viewId)) {
            _$jscoverage['/navigation-view.js'].lineData[42]++;
            return children[i];
          }
        } else {
          _$jscoverage['/navigation-view.js'].lineData[45]++;
          return children[i];
        }
      }
    }
    _$jscoverage['/navigation-view.js'].lineData[49]++;
    return null;
  }
  _$jscoverage['/navigation-view.js'].lineData[52]++;
  function gc(navigationView) {
    _$jscoverage['/navigation-view.js'].functionData[4]++;
    _$jscoverage['/navigation-view.js'].lineData[53]++;
    var children = navigationView.get('children').concat();
    _$jscoverage['/navigation-view.js'].lineData[54]++;
    var viewCacheSize = navigationView.get('viewCacheSize');
    _$jscoverage['/navigation-view.js'].lineData[55]++;
    if (visit31_55_1(children.length <= viewCacheSize)) {
      _$jscoverage['/navigation-view.js'].lineData[56]++;
      return;
    }
    _$jscoverage['/navigation-view.js'].lineData[58]++;
    var removedSize = Math.floor(viewCacheSize / 3);
    _$jscoverage['/navigation-view.js'].lineData[59]++;
    children.sort(function(a, b) {
  _$jscoverage['/navigation-view.js'].functionData[5]++;
  _$jscoverage['/navigation-view.js'].lineData[60]++;
  return a.uuid - b.uuid;
});
    _$jscoverage['/navigation-view.js'].lineData[62]++;
    for (var i = 0; visit32_62_1(i < removedSize); i++) {
      _$jscoverage['/navigation-view.js'].lineData[63]++;
      navigationView.removeChild(children[i]);
    }
  }
  _$jscoverage['/navigation-view.js'].lineData[67]++;
  return Container.extend({
  initializer: function() {
  _$jscoverage['/navigation-view.js'].functionData[6]++;
  _$jscoverage['/navigation-view.js'].lineData[69]++;
  this.publish('back', {
  defaultFn: onBack, 
  defaultTargetOnly: false});
}, 
  isLoading: function() {
  _$jscoverage['/navigation-view.js'].functionData[7]++;
  _$jscoverage['/navigation-view.js'].lineData[76]++;
  return visit33_76_1(this.loadingEl.css('display') !== 'none');
}, 
  renderUI: function() {
  _$jscoverage['/navigation-view.js'].functionData[8]++;
  _$jscoverage['/navigation-view.js'].lineData[80]++;
  this.viewStack = [];
  _$jscoverage['/navigation-view.js'].lineData[81]++;
  var bar;
  _$jscoverage['/navigation-view.js'].lineData[82]++;
  var barCfg = this.get('barCfg');
  _$jscoverage['/navigation-view.js'].lineData[83]++;
  barCfg.elBefore = this.get('el')[0].firstChild;
  _$jscoverage['/navigation-view.js'].lineData[84]++;
  this.setInternal('bar', bar = new Bar(barCfg).render());
  _$jscoverage['/navigation-view.js'].lineData[85]++;
  bar.addTarget(this);
}, 
  createView: function(ViewClass, config) {
  _$jscoverage['/navigation-view.js'].functionData[9]++;
  _$jscoverage['/navigation-view.js'].lineData[95]++;
  var self = this;
  _$jscoverage['/navigation-view.js'].lineData[96]++;
  var nextView = getViewInstance(self, ViewClass, config);
  _$jscoverage['/navigation-view.js'].lineData[97]++;
  if (visit34_97_1(!nextView)) {
    _$jscoverage['/navigation-view.js'].lineData[98]++;
    self.addChild(nextView = new ViewClass(S.merge(config, {
  prefixCls: self.get('prefixCls')})));
    _$jscoverage['/navigation-view.js'].lineData[101]++;
    nextView.get('el').css('transform', 'translateX(-9999px) translateZ(0)');
  }
  _$jscoverage['/navigation-view.js'].lineData[103]++;
  return nextView;
}, 
  push: function(ViewClass, config) {
  _$jscoverage['/navigation-view.js'].functionData[10]++;
  _$jscoverage['/navigation-view.js'].lineData[107]++;
  var self = this, nextView, viewStack = self.viewStack;
  _$jscoverage['/navigation-view.js'].lineData[110]++;
  var bar = self.get('bar');
  _$jscoverage['/navigation-view.js'].lineData[111]++;
  nextView = self.createView(ViewClass, config);
  _$jscoverage['/navigation-view.js'].lineData[112]++;
  var nextViewEl = nextView.get('el');
  _$jscoverage['/navigation-view.js'].lineData[113]++;
  nextView.uuid = uuid++;
  _$jscoverage['/navigation-view.js'].lineData[114]++;
  var activeView;
  _$jscoverage['/navigation-view.js'].lineData[115]++;
  var loadingEl = this.loadingEl;
  _$jscoverage['/navigation-view.js'].lineData[116]++;
  viewStack.push([ViewClass, config]);
  _$jscoverage['/navigation-view.js'].lineData[117]++;
  if (visit35_117_1((activeView = self.get('activeView')) && activeView.leave)) {
    _$jscoverage['/navigation-view.js'].lineData[118]++;
    activeView.leave();
  }
  _$jscoverage['/navigation-view.js'].lineData[120]++;
  if (visit36_120_1(config)) {
    _$jscoverage['/navigation-view.js'].lineData[121]++;
    nextView.set(config);
  }
  _$jscoverage['/navigation-view.js'].lineData[123]++;
  if (visit37_123_1(nextView.enter)) {
    _$jscoverage['/navigation-view.js'].lineData[124]++;
    nextView.enter();
  }
  _$jscoverage['/navigation-view.js'].lineData[126]++;
  var promise = nextView.promise;
  _$jscoverage['/navigation-view.js'].lineData[127]++;
  if (visit38_127_1(!self.isLoading())) {
    _$jscoverage['/navigation-view.js'].lineData[128]++;
    var activeEl = activeView.get('el');
    _$jscoverage['/navigation-view.js'].lineData[129]++;
    activeEl.stop(true);
    _$jscoverage['/navigation-view.js'].lineData[130]++;
    activeEl.animate({
  transform: 'translateX(-' + activeEl[0].offsetWidth + 'px) translateZ(0)'}, {
  useTransition: true, 
  easing: 'ease-in-out', 
  duration: 0.25});
    _$jscoverage['/navigation-view.js'].lineData[137]++;
    if (visit39_137_1(promise)) {
      _$jscoverage['/navigation-view.js'].lineData[138]++;
      loadingEl.stop(true);
      _$jscoverage['/navigation-view.js'].lineData[139]++;
      loadingEl.css('left', '100%');
      _$jscoverage['/navigation-view.js'].lineData[140]++;
      loadingEl.show();
      _$jscoverage['/navigation-view.js'].lineData[141]++;
      loadingEl.animate({
  left: '0'}, {
  useTransition: true, 
  easing: 'ease-in-out', 
  duration: 0.25});
      _$jscoverage['/navigation-view.js'].lineData[148]++;
      self.set('activeView', null);
    } else {
      _$jscoverage['/navigation-view.js'].lineData[150]++;
      gc(self);
      _$jscoverage['/navigation-view.js'].lineData[151]++;
      nextViewEl.stop(true);
      _$jscoverage['/navigation-view.js'].lineData[152]++;
      nextViewEl.css('transform', 'translateX(' + activeEl[0].offsetWidth + 'px) translateZ(0)');
      _$jscoverage['/navigation-view.js'].lineData[153]++;
      nextViewEl.animate({
  transform: ''}, {
  useTransition: true, 
  easing: 'ease-in-out', 
  duration: 0.25});
      _$jscoverage['/navigation-view.js'].lineData[160]++;
      self.set('activeView', nextView);
    }
    _$jscoverage['/navigation-view.js'].lineData[162]++;
    bar.forward(visit40_162_1(nextView.get('title') || ''));
  } else {
    _$jscoverage['/navigation-view.js'].lineData[164]++;
    bar.set('title', nextView.get('title'));
    _$jscoverage['/navigation-view.js'].lineData[165]++;
    if (visit41_165_1(!promise)) {
      _$jscoverage['/navigation-view.js'].lineData[166]++;
      gc(self);
      _$jscoverage['/navigation-view.js'].lineData[167]++;
      nextView.get('el').css('transform', '');
      _$jscoverage['/navigation-view.js'].lineData[168]++;
      loadingEl.hide();
    }
  }
  _$jscoverage['/navigation-view.js'].lineData[171]++;
  self.set('activeView', nextView);
  _$jscoverage['/navigation-view.js'].lineData[172]++;
  if (visit42_172_1(promise)) {
    _$jscoverage['/navigation-view.js'].lineData[173]++;
    promise.then(function() {
  _$jscoverage['/navigation-view.js'].functionData[11]++;
  _$jscoverage['/navigation-view.js'].lineData[174]++;
  var activeView = self.get('activeView');
  _$jscoverage['/navigation-view.js'].lineData[175]++;
  if (visit43_175_1(activeView && visit44_175_2(activeView.uuid === nextView.uuid))) {
    _$jscoverage['/navigation-view.js'].lineData[176]++;
    gc(self);
    _$jscoverage['/navigation-view.js'].lineData[177]++;
    nextView.get('el').css('transform', '');
    _$jscoverage['/navigation-view.js'].lineData[178]++;
    bar.set('title', visit45_178_1(nextView.get('title') || ''));
    _$jscoverage['/navigation-view.js'].lineData[179]++;
    loadingEl.hide();
  }
});
  }
}, 
  replace: function(config) {
  _$jscoverage['/navigation-view.js'].functionData[12]++;
  _$jscoverage['/navigation-view.js'].lineData[186]++;
  var self = this, viewStack = self.viewStack;
  _$jscoverage['/navigation-view.js'].lineData[188]++;
  viewStack[viewStack.length - 1][1] = config;
}, 
  pop: function() {
  _$jscoverage['/navigation-view.js'].functionData[13]++;
  _$jscoverage['/navigation-view.js'].lineData[192]++;
  var self = this, viewStack = self.viewStack;
  _$jscoverage['/navigation-view.js'].lineData[194]++;
  if (visit46_194_1(viewStack.length > 1)) {
    _$jscoverage['/navigation-view.js'].lineData[195]++;
    viewStack.pop();
    _$jscoverage['/navigation-view.js'].lineData[196]++;
    var ViewClassInfo = viewStack[viewStack.length - 1];
    _$jscoverage['/navigation-view.js'].lineData[197]++;
    var nextView = self.createView(ViewClassInfo[0], ViewClassInfo[1]);
    _$jscoverage['/navigation-view.js'].lineData[198]++;
    nextView.uuid = uuid++;
    _$jscoverage['/navigation-view.js'].lineData[199]++;
    var activeView;
    _$jscoverage['/navigation-view.js'].lineData[200]++;
    var loadingEl = self.loadingEl;
    _$jscoverage['/navigation-view.js'].lineData[201]++;
    var bar = self.get('bar');
    _$jscoverage['/navigation-view.js'].lineData[202]++;
    if (visit47_202_1((activeView = self.get('activeView')) && activeView.leave)) {
      _$jscoverage['/navigation-view.js'].lineData[203]++;
      activeView.leave();
    }
    _$jscoverage['/navigation-view.js'].lineData[205]++;
    if (visit48_205_1(ViewClassInfo[1])) {
      _$jscoverage['/navigation-view.js'].lineData[206]++;
      nextView.set(ViewClassInfo[1]);
    }
    _$jscoverage['/navigation-view.js'].lineData[208]++;
    if (visit49_208_1(nextView.enter)) {
      _$jscoverage['/navigation-view.js'].lineData[209]++;
      nextView.enter();
    }
    _$jscoverage['/navigation-view.js'].lineData[211]++;
    var promise = nextView.promise;
    _$jscoverage['/navigation-view.js'].lineData[212]++;
    if (visit50_212_1(!self.isLoading())) {
      _$jscoverage['/navigation-view.js'].lineData[213]++;
      var activeEl = activeView.get('el');
      _$jscoverage['/navigation-view.js'].lineData[214]++;
      activeEl.stop(true);
      _$jscoverage['/navigation-view.js'].lineData[215]++;
      activeEl.animate({
  transform: 'translateX(' + activeView.get('el')[0].offsetWidth + 'px) translateZ(0)'}, {
  useTransition: true, 
  easing: 'ease-in-out', 
  duration: 0.25});
      _$jscoverage['/navigation-view.js'].lineData[222]++;
      if (visit51_222_1(promise)) {
        _$jscoverage['/navigation-view.js'].lineData[223]++;
        self.set('activeView', null);
        _$jscoverage['/navigation-view.js'].lineData[224]++;
        loadingEl.stop(true);
        _$jscoverage['/navigation-view.js'].lineData[225]++;
        loadingEl.css('left', '-100%');
        _$jscoverage['/navigation-view.js'].lineData[226]++;
        loadingEl.show();
        _$jscoverage['/navigation-view.js'].lineData[227]++;
        loadingEl.animate({
  left: '0'}, {
  useTransition: true, 
  easing: 'ease-in-out', 
  duration: 0.25});
      } else {
        _$jscoverage['/navigation-view.js'].lineData[235]++;
        gc(self);
        _$jscoverage['/navigation-view.js'].lineData[236]++;
        var nextViewEl = nextView.get('el');
        _$jscoverage['/navigation-view.js'].lineData[237]++;
        nextViewEl.stop(true);
        _$jscoverage['/navigation-view.js'].lineData[238]++;
        nextViewEl.css('transform', 'translateX(-' + activeEl[0].offsetWidth + 'px) translateZ(0)');
        _$jscoverage['/navigation-view.js'].lineData[239]++;
        nextViewEl.animate({
  transform: ''}, {
  useTransition: true, 
  easing: 'ease-in-out', 
  duration: 0.25});
        _$jscoverage['/navigation-view.js'].lineData[246]++;
        self.set('activeView', nextView);
      }
    } else {
      _$jscoverage['/navigation-view.js'].lineData[249]++;
      if (visit52_249_1(!promise)) {
        _$jscoverage['/navigation-view.js'].lineData[250]++;
        gc(self);
        _$jscoverage['/navigation-view.js'].lineData[251]++;
        nextView.get('el').css('transform', '');
        _$jscoverage['/navigation-view.js'].lineData[252]++;
        loadingEl.hide();
      }
    }
    _$jscoverage['/navigation-view.js'].lineData[255]++;
    self.set('activeView', nextView);
    _$jscoverage['/navigation-view.js'].lineData[256]++;
    bar.back(visit53_256_1(nextView.get('title') || ''), visit54_256_2(viewStack.length > 1));
    _$jscoverage['/navigation-view.js'].lineData[258]++;
    if (visit55_258_1(promise)) {
      _$jscoverage['/navigation-view.js'].lineData[259]++;
      promise.then(function() {
  _$jscoverage['/navigation-view.js'].functionData[14]++;
  _$jscoverage['/navigation-view.js'].lineData[260]++;
  var activeView = self.get('activeView');
  _$jscoverage['/navigation-view.js'].lineData[261]++;
  if (visit56_261_1(activeView && visit57_261_2(activeView.uuid === nextView.uuid))) {
    _$jscoverage['/navigation-view.js'].lineData[262]++;
    gc(self);
    _$jscoverage['/navigation-view.js'].lineData[263]++;
    nextView.get('el').css('transform', '');
    _$jscoverage['/navigation-view.js'].lineData[264]++;
    bar.set('title', visit58_264_1(nextView.get('title') || ''));
    _$jscoverage['/navigation-view.js'].lineData[265]++;
    loadingEl.hide();
  }
});
    }
  }
}}, {
  xclass: 'navigation-view', 
  ATTRS: {
  barCfg: {
  value: {}}, 
  handleMouseEvents: {
  value: false}, 
  viewCacheSize: {
  value: 20}, 
  focusable: {
  value: false}, 
  xrender: {
  value: NavigationViewRender}, 
  contentTpl: {
  value: ContentTpl}}});
});
