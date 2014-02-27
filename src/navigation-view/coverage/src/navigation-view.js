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
  _$jscoverage['/navigation-view.js'].lineData[17] = 0;
  _$jscoverage['/navigation-view.js'].lineData[18] = 0;
  _$jscoverage['/navigation-view.js'].lineData[23] = 0;
  _$jscoverage['/navigation-view.js'].lineData[25] = 0;
  _$jscoverage['/navigation-view.js'].lineData[27] = 0;
  _$jscoverage['/navigation-view.js'].lineData[29] = 0;
  _$jscoverage['/navigation-view.js'].lineData[32] = 0;
  _$jscoverage['/navigation-view.js'].lineData[33] = 0;
  _$jscoverage['/navigation-view.js'].lineData[34] = 0;
  _$jscoverage['/navigation-view.js'].lineData[35] = 0;
  _$jscoverage['/navigation-view.js'].lineData[39] = 0;
  _$jscoverage['/navigation-view.js'].lineData[40] = 0;
  _$jscoverage['/navigation-view.js'].lineData[41] = 0;
  _$jscoverage['/navigation-view.js'].lineData[42] = 0;
  _$jscoverage['/navigation-view.js'].lineData[43] = 0;
  _$jscoverage['/navigation-view.js'].lineData[44] = 0;
  _$jscoverage['/navigation-view.js'].lineData[45] = 0;
  _$jscoverage['/navigation-view.js'].lineData[46] = 0;
  _$jscoverage['/navigation-view.js'].lineData[49] = 0;
  _$jscoverage['/navigation-view.js'].lineData[53] = 0;
  _$jscoverage['/navigation-view.js'].lineData[56] = 0;
  _$jscoverage['/navigation-view.js'].lineData[57] = 0;
  _$jscoverage['/navigation-view.js'].lineData[58] = 0;
  _$jscoverage['/navigation-view.js'].lineData[59] = 0;
  _$jscoverage['/navigation-view.js'].lineData[60] = 0;
  _$jscoverage['/navigation-view.js'].lineData[62] = 0;
  _$jscoverage['/navigation-view.js'].lineData[63] = 0;
  _$jscoverage['/navigation-view.js'].lineData[64] = 0;
  _$jscoverage['/navigation-view.js'].lineData[66] = 0;
  _$jscoverage['/navigation-view.js'].lineData[67] = 0;
  _$jscoverage['/navigation-view.js'].lineData[78] = 0;
  _$jscoverage['/navigation-view.js'].lineData[79] = 0;
  _$jscoverage['/navigation-view.js'].lineData[82] = 0;
  _$jscoverage['/navigation-view.js'].lineData[83] = 0;
  _$jscoverage['/navigation-view.js'].lineData[92] = 0;
  _$jscoverage['/navigation-view.js'].lineData[93] = 0;
  _$jscoverage['/navigation-view.js'].lineData[96] = 0;
  _$jscoverage['/navigation-view.js'].lineData[97] = 0;
  _$jscoverage['/navigation-view.js'].lineData[100] = 0;
  _$jscoverage['/navigation-view.js'].lineData[101] = 0;
  _$jscoverage['/navigation-view.js'].lineData[104] = 0;
  _$jscoverage['/navigation-view.js'].lineData[105] = 0;
  _$jscoverage['/navigation-view.js'].lineData[107] = 0;
  _$jscoverage['/navigation-view.js'].lineData[108] = 0;
  _$jscoverage['/navigation-view.js'].lineData[112] = 0;
  _$jscoverage['/navigation-view.js'].lineData[113] = 0;
  _$jscoverage['/navigation-view.js'].lineData[116] = 0;
  _$jscoverage['/navigation-view.js'].lineData[119] = 0;
  _$jscoverage['/navigation-view.js'].lineData[120] = 0;
  _$jscoverage['/navigation-view.js'].lineData[124] = 0;
  _$jscoverage['/navigation-view.js'].lineData[125] = 0;
  _$jscoverage['/navigation-view.js'].lineData[127] = 0;
  _$jscoverage['/navigation-view.js'].lineData[129] = 0;
  _$jscoverage['/navigation-view.js'].lineData[131] = 0;
  _$jscoverage['/navigation-view.js'].lineData[132] = 0;
  _$jscoverage['/navigation-view.js'].lineData[133] = 0;
  _$jscoverage['/navigation-view.js'].lineData[134] = 0;
  _$jscoverage['/navigation-view.js'].lineData[135] = 0;
  _$jscoverage['/navigation-view.js'].lineData[140] = 0;
  _$jscoverage['/navigation-view.js'].lineData[141] = 0;
  _$jscoverage['/navigation-view.js'].lineData[145] = 0;
  _$jscoverage['/navigation-view.js'].lineData[153] = 0;
  _$jscoverage['/navigation-view.js'].lineData[154] = 0;
  _$jscoverage['/navigation-view.js'].lineData[155] = 0;
  _$jscoverage['/navigation-view.js'].lineData[156] = 0;
  _$jscoverage['/navigation-view.js'].lineData[157] = 0;
  _$jscoverage['/navigation-view.js'].lineData[159] = 0;
  _$jscoverage['/navigation-view.js'].lineData[161] = 0;
  _$jscoverage['/navigation-view.js'].lineData[162] = 0;
  _$jscoverage['/navigation-view.js'].lineData[164] = 0;
  _$jscoverage['/navigation-view.js'].lineData[165] = 0;
  _$jscoverage['/navigation-view.js'].lineData[166] = 0;
  _$jscoverage['/navigation-view.js'].lineData[168] = 0;
  _$jscoverage['/navigation-view.js'].lineData[171] = 0;
  _$jscoverage['/navigation-view.js'].lineData[177] = 0;
  _$jscoverage['/navigation-view.js'].lineData[179] = 0;
  _$jscoverage['/navigation-view.js'].lineData[180] = 0;
  _$jscoverage['/navigation-view.js'].lineData[183] = 0;
  _$jscoverage['/navigation-view.js'].lineData[184] = 0;
  _$jscoverage['/navigation-view.js'].lineData[185] = 0;
  _$jscoverage['/navigation-view.js'].lineData[188] = 0;
  _$jscoverage['/navigation-view.js'].lineData[191] = 0;
  _$jscoverage['/navigation-view.js'].lineData[194] = 0;
  _$jscoverage['/navigation-view.js'].lineData[195] = 0;
  _$jscoverage['/navigation-view.js'].lineData[197] = 0;
  _$jscoverage['/navigation-view.js'].lineData[201] = 0;
  _$jscoverage['/navigation-view.js'].lineData[202] = 0;
  _$jscoverage['/navigation-view.js'].lineData[205] = 0;
  _$jscoverage['/navigation-view.js'].lineData[206] = 0;
  _$jscoverage['/navigation-view.js'].lineData[209] = 0;
  _$jscoverage['/navigation-view.js'].lineData[210] = 0;
  _$jscoverage['/navigation-view.js'].lineData[211] = 0;
  _$jscoverage['/navigation-view.js'].lineData[212] = 0;
  _$jscoverage['/navigation-view.js'].lineData[213] = 0;
  _$jscoverage['/navigation-view.js'].lineData[214] = 0;
  _$jscoverage['/navigation-view.js'].lineData[215] = 0;
  _$jscoverage['/navigation-view.js'].lineData[216] = 0;
  _$jscoverage['/navigation-view.js'].lineData[221] = 0;
  _$jscoverage['/navigation-view.js'].lineData[223] = 0;
  _$jscoverage['/navigation-view.js'].lineData[224] = 0;
  _$jscoverage['/navigation-view.js'].lineData[225] = 0;
  _$jscoverage['/navigation-view.js'].lineData[226] = 0;
  _$jscoverage['/navigation-view.js'].lineData[227] = 0;
  _$jscoverage['/navigation-view.js'].lineData[228] = 0;
  _$jscoverage['/navigation-view.js'].lineData[237] = 0;
  _$jscoverage['/navigation-view.js'].lineData[238] = 0;
  _$jscoverage['/navigation-view.js'].lineData[239] = 0;
  _$jscoverage['/navigation-view.js'].lineData[240] = 0;
  _$jscoverage['/navigation-view.js'].lineData[241] = 0;
  _$jscoverage['/navigation-view.js'].lineData[242] = 0;
  _$jscoverage['/navigation-view.js'].lineData[243] = 0;
  _$jscoverage['/navigation-view.js'].lineData[245] = 0;
  _$jscoverage['/navigation-view.js'].lineData[249] = 0;
  _$jscoverage['/navigation-view.js'].lineData[260] = 0;
  _$jscoverage['/navigation-view.js'].lineData[262] = 0;
  _$jscoverage['/navigation-view.js'].lineData[263] = 0;
  _$jscoverage['/navigation-view.js'].lineData[266] = 0;
  _$jscoverage['/navigation-view.js'].lineData[269] = 0;
  _$jscoverage['/navigation-view.js'].lineData[270] = 0;
  _$jscoverage['/navigation-view.js'].lineData[271] = 0;
  _$jscoverage['/navigation-view.js'].lineData[272] = 0;
  _$jscoverage['/navigation-view.js'].lineData[273] = 0;
  _$jscoverage['/navigation-view.js'].lineData[274] = 0;
  _$jscoverage['/navigation-view.js'].lineData[275] = 0;
  _$jscoverage['/navigation-view.js'].lineData[276] = 0;
  _$jscoverage['/navigation-view.js'].lineData[279] = 0;
  _$jscoverage['/navigation-view.js'].lineData[280] = 0;
  _$jscoverage['/navigation-view.js'].lineData[282] = 0;
  _$jscoverage['/navigation-view.js'].lineData[284] = 0;
  _$jscoverage['/navigation-view.js'].lineData[288] = 0;
  _$jscoverage['/navigation-view.js'].lineData[290] = 0;
  _$jscoverage['/navigation-view.js'].lineData[294] = 0;
  _$jscoverage['/navigation-view.js'].lineData[302] = 0;
  _$jscoverage['/navigation-view.js'].lineData[303] = 0;
  _$jscoverage['/navigation-view.js'].lineData[304] = 0;
  _$jscoverage['/navigation-view.js'].lineData[305] = 0;
  _$jscoverage['/navigation-view.js'].lineData[306] = 0;
  _$jscoverage['/navigation-view.js'].lineData[308] = 0;
  _$jscoverage['/navigation-view.js'].lineData[309] = 0;
  _$jscoverage['/navigation-view.js'].lineData[310] = 0;
  _$jscoverage['/navigation-view.js'].lineData[311] = 0;
  _$jscoverage['/navigation-view.js'].lineData[313] = 0;
  _$jscoverage['/navigation-view.js'].lineData[315] = 0;
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
  _$jscoverage['/navigation-view.js'].functionData[15] = 0;
  _$jscoverage['/navigation-view.js'].functionData[16] = 0;
  _$jscoverage['/navigation-view.js'].functionData[17] = 0;
  _$jscoverage['/navigation-view.js'].functionData[18] = 0;
  _$jscoverage['/navigation-view.js'].functionData[19] = 0;
  _$jscoverage['/navigation-view.js'].functionData[20] = 0;
}
if (! _$jscoverage['/navigation-view.js'].branchData) {
  _$jscoverage['/navigation-view.js'].branchData = {};
  _$jscoverage['/navigation-view.js'].branchData['42'] = [];
  _$jscoverage['/navigation-view.js'].branchData['42'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['43'] = [];
  _$jscoverage['/navigation-view.js'].branchData['43'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['44'] = [];
  _$jscoverage['/navigation-view.js'].branchData['44'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['45'] = [];
  _$jscoverage['/navigation-view.js'].branchData['45'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['59'] = [];
  _$jscoverage['/navigation-view.js'].branchData['59'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['66'] = [];
  _$jscoverage['/navigation-view.js'].branchData['66'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['96'] = [];
  _$jscoverage['/navigation-view.js'].branchData['96'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['100'] = [];
  _$jscoverage['/navigation-view.js'].branchData['100'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['104'] = [];
  _$jscoverage['/navigation-view.js'].branchData['104'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['107'] = [];
  _$jscoverage['/navigation-view.js'].branchData['107'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['119'] = [];
  _$jscoverage['/navigation-view.js'].branchData['119'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['131'] = [];
  _$jscoverage['/navigation-view.js'].branchData['131'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['134'] = [];
  _$jscoverage['/navigation-view.js'].branchData['134'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['134'][2] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['155'] = [];
  _$jscoverage['/navigation-view.js'].branchData['155'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['156'] = [];
  _$jscoverage['/navigation-view.js'].branchData['156'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['164'] = [];
  _$jscoverage['/navigation-view.js'].branchData['164'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['165'] = [];
  _$jscoverage['/navigation-view.js'].branchData['165'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['179'] = [];
  _$jscoverage['/navigation-view.js'].branchData['179'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['183'] = [];
  _$jscoverage['/navigation-view.js'].branchData['183'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['184'] = [];
  _$jscoverage['/navigation-view.js'].branchData['184'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['194'] = [];
  _$jscoverage['/navigation-view.js'].branchData['194'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['213'] = [];
  _$jscoverage['/navigation-view.js'].branchData['213'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['215'] = [];
  _$jscoverage['/navigation-view.js'].branchData['215'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['240'] = [];
  _$jscoverage['/navigation-view.js'].branchData['240'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['262'] = [];
  _$jscoverage['/navigation-view.js'].branchData['262'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['263'] = [];
  _$jscoverage['/navigation-view.js'].branchData['263'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['275'] = [];
  _$jscoverage['/navigation-view.js'].branchData['275'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['276'] = [];
  _$jscoverage['/navigation-view.js'].branchData['276'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['279'] = [];
  _$jscoverage['/navigation-view.js'].branchData['279'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['279'][2] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['302'] = [];
  _$jscoverage['/navigation-view.js'].branchData['302'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['310'] = [];
  _$jscoverage['/navigation-view.js'].branchData['310'][1] = new BranchData();
}
_$jscoverage['/navigation-view.js'].branchData['310'][1].init(367, 58, 'config.animation.leave || activeViewConfig.animation.leave');
function visit33_310_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['310'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['302'][1].init(258, 20, 'viewStack.length > 1');
function visit32_302_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['302'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['279'][2].init(1081, 56, 'enterAnimation && getAnimCss(self, enterAnimation, true)');
function visit31_279_2(result) {
  _$jscoverage['/navigation-view.js'].branchData['279'][2].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['279'][1].init(1081, 62, 'enterAnimation && getAnimCss(self, enterAnimation, true) || \'\'');
function visit30_279_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['279'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['276'][1].init(35, 50, 'activeViewConfig.animation.leave || leaveAnimation');
function visit29_276_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['276'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['275'][1].init(931, 10, 'activeView');
function visit28_275_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['275'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['263'][1].init(37, 41, 'config.animation || self.get(\'animation\')');
function visit27_263_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['263'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['262'][1].init(438, 10, 'activeView');
function visit26_262_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['262'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['240'][1].init(136, 9, '!nextView');
function visit25_240_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['240'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['215'][1].init(189, 27, 'isLeaveCss(className, self)');
function visit24_215_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['215'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['213'][1].init(91, 27, 'isEnterCss(className, self)');
function visit23_213_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['213'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['194'][1].init(64, 55, 'self.$loadingEl.hasClass(self.showViewClass) && oldView');
function visit22_194_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['194'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['184'][1].init(18, 7, 'oldView');
function visit21_184_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['184'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['183'][1].init(733, 7, 'promise');
function visit20_183_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['183'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['179'][1].init(631, 7, 'oldView');
function visit19_179_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['179'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['165'][1].init(18, 13, 'newView.enter');
function visit18_165_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['165'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['164'][1].init(278, 7, 'newView');
function visit17_164_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['164'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['156'][1].init(18, 13, 'oldView.leave');
function visit16_156_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['156'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['155'][1].init(55, 7, 'oldView');
function visit15_155_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['155'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['134'][2].init(94, 32, 'activeView.uuid === newView.uuid');
function visit14_134_2(result) {
  _$jscoverage['/navigation-view.js'].branchData['134'][2].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['134'][1].init(80, 46, 'activeView && activeView.uuid === newView.uuid');
function visit13_134_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['134'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['131'][1].init(121, 7, 'promise');
function visit12_131_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['131'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['119'][1].init(216, 31, 'className !== originalClassName');
function visit11_119_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['119'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['107'][1].init(436, 31, 'className !== originalClassName');
function visit10_107_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['107'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['104'][1].init(312, 44, 'className.indexOf(self.showViewClass) === -1');
function visit9_104_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['104'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['100'][1].init(242, 3, 'css');
function visit8_100_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['100'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['96'][1].init(99, 40, 'className.match(self.animateClassRegExp)');
function visit7_96_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['96'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['66'][1].init(387, 15, 'i < removedSize');
function visit6_66_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['66'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['59'][1].init(145, 32, 'children.length <= viewCacheSize');
function visit5_59_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['59'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['45'][1].init(26, 36, 'children[i].get(\'viewId\') === viewId');
function visit4_45_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['45'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['44'][1].init(22, 6, 'viewId');
function visit3_44_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['44'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['43'][1].init(18, 48, 'children[i].constructor.xclass === config.xclass');
function visit2_43_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['43'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['42'][1].init(119, 19, 'i < children.length');
function visit1_42_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['42'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].lineData[5]++;
KISSY.add(function(S, require) {
  _$jscoverage['/navigation-view.js'].functionData[0]++;
  _$jscoverage['/navigation-view.js'].lineData[6]++;
  var $ = require('node').all;
  _$jscoverage['/navigation-view.js'].lineData[7]++;
  var Container = require('component/container');
  _$jscoverage['/navigation-view.js'].lineData[8]++;
  var ContentTpl = require('component/extension/content-xtpl');
  _$jscoverage['/navigation-view.js'].lineData[9]++;
  var ContentRender = require('component/extension/content-render');
  _$jscoverage['/navigation-view.js'].lineData[10]++;
  var LOADING_HTML = '<div class="{prefixCls}navigation-view-loading">' + '<div class="{prefixCls}navigation-view-loading-outer">' + '<div class="{prefixCls}navigation-view-loading-inner"></div>' + '</div>' + '</div>';
  _$jscoverage['/navigation-view.js'].lineData[17]++;
  var vendorPrefix = S.Feature.getVendorCssPropPrefix('animation');
  _$jscoverage['/navigation-view.js'].lineData[18]++;
  var ANIMATION_END_EVENT = vendorPrefix ? (vendorPrefix.toLowerCase() + 'AnimationEnd') : 'animationend webkitAnimationEnd';
  _$jscoverage['/navigation-view.js'].lineData[23]++;
  var uuid = 0;
  _$jscoverage['/navigation-view.js'].lineData[25]++;
  var NavigationViewRender = Container.getDefaultRender().extend([ContentRender], {
  createDom: function() {
  _$jscoverage['/navigation-view.js'].functionData[1]++;
  _$jscoverage['/navigation-view.js'].lineData[27]++;
  var self = this, control = self.control;
  _$jscoverage['/navigation-view.js'].lineData[29]++;
  var $loadingEl = $(S.substitute(LOADING_HTML, {
  prefixCls: self.control.get('prefixCls')}));
  _$jscoverage['/navigation-view.js'].lineData[32]++;
  control.get('contentEl').append($loadingEl);
  _$jscoverage['/navigation-view.js'].lineData[33]++;
  control.$loadingEl = $loadingEl;
  _$jscoverage['/navigation-view.js'].lineData[34]++;
  control.loadingEl = $loadingEl[0];
  _$jscoverage['/navigation-view.js'].lineData[35]++;
  $loadingEl.on(ANIMATION_END_EVENT, onAnimEnd($loadingEl[0]), control);
}});
  _$jscoverage['/navigation-view.js'].lineData[39]++;
  function getViewInstance(navigationView, config) {
    _$jscoverage['/navigation-view.js'].functionData[2]++;
    _$jscoverage['/navigation-view.js'].lineData[40]++;
    var children = navigationView.get('children');
    _$jscoverage['/navigation-view.js'].lineData[41]++;
    var viewId = config.viewId;
    _$jscoverage['/navigation-view.js'].lineData[42]++;
    for (var i = 0; visit1_42_1(i < children.length); i++) {
      _$jscoverage['/navigation-view.js'].lineData[43]++;
      if (visit2_43_1(children[i].constructor.xclass === config.xclass)) {
        _$jscoverage['/navigation-view.js'].lineData[44]++;
        if (visit3_44_1(viewId)) {
          _$jscoverage['/navigation-view.js'].lineData[45]++;
          if (visit4_45_1(children[i].get('viewId') === viewId)) {
            _$jscoverage['/navigation-view.js'].lineData[46]++;
            return children[i];
          }
        } else {
          _$jscoverage['/navigation-view.js'].lineData[49]++;
          return children[i];
        }
      }
    }
    _$jscoverage['/navigation-view.js'].lineData[53]++;
    return null;
  }
  _$jscoverage['/navigation-view.js'].lineData[56]++;
  function gc(navigationView) {
    _$jscoverage['/navigation-view.js'].functionData[3]++;
    _$jscoverage['/navigation-view.js'].lineData[57]++;
    var children = navigationView.get('children').concat();
    _$jscoverage['/navigation-view.js'].lineData[58]++;
    var viewCacheSize = navigationView.get('viewCacheSize');
    _$jscoverage['/navigation-view.js'].lineData[59]++;
    if (visit5_59_1(children.length <= viewCacheSize)) {
      _$jscoverage['/navigation-view.js'].lineData[60]++;
      return;
    }
    _$jscoverage['/navigation-view.js'].lineData[62]++;
    var removedSize = Math.floor(viewCacheSize / 3);
    _$jscoverage['/navigation-view.js'].lineData[63]++;
    children.sort(function(a, b) {
  _$jscoverage['/navigation-view.js'].functionData[4]++;
  _$jscoverage['/navigation-view.js'].lineData[64]++;
  return a.uuid - b.uuid;
});
    _$jscoverage['/navigation-view.js'].lineData[66]++;
    for (var i = 0; visit6_66_1(i < removedSize); i++) {
      _$jscoverage['/navigation-view.js'].lineData[67]++;
      navigationView.removeChild(children[i]);
    }
  }
  _$jscoverage['/navigation-view.js'].lineData[78]++;
  function getAnimCss(self, css, enter) {
    _$jscoverage['/navigation-view.js'].functionData[5]++;
    _$jscoverage['/navigation-view.js'].lineData[79]++;
    return self.view.getBaseCssClass('anim-' + css + '-' + (enter ? 'enter' : 'leave'));
  }
  _$jscoverage['/navigation-view.js'].lineData[82]++;
  function trimClassName(className) {
    _$jscoverage['/navigation-view.js'].functionData[6]++;
    _$jscoverage['/navigation-view.js'].lineData[83]++;
    return S.trim(className).replace(/\s+/, ' ');
  }
  _$jscoverage['/navigation-view.js'].lineData[92]++;
  function showAnimateEl(el, self, css) {
    _$jscoverage['/navigation-view.js'].functionData[7]++;
    _$jscoverage['/navigation-view.js'].lineData[93]++;
    var className = el.className, originalClassName = className;
    _$jscoverage['/navigation-view.js'].lineData[96]++;
    if (visit7_96_1(className.match(self.animateClassRegExp))) {
      _$jscoverage['/navigation-view.js'].lineData[97]++;
      className = className.replace(self.animateClassRegExp, '');
    }
    _$jscoverage['/navigation-view.js'].lineData[100]++;
    if (visit8_100_1(css)) {
      _$jscoverage['/navigation-view.js'].lineData[101]++;
      className += ' ' + css;
    }
    _$jscoverage['/navigation-view.js'].lineData[104]++;
    if (visit9_104_1(className.indexOf(self.showViewClass) === -1)) {
      _$jscoverage['/navigation-view.js'].lineData[105]++;
      className += ' ' + self.showViewClass;
    }
    _$jscoverage['/navigation-view.js'].lineData[107]++;
    if (visit10_107_1(className !== originalClassName)) {
      _$jscoverage['/navigation-view.js'].lineData[108]++;
      el.className = trimClassName(className);
    }
  }
  _$jscoverage['/navigation-view.js'].lineData[112]++;
  function hideAnimateEl(el, self) {
    _$jscoverage['/navigation-view.js'].functionData[8]++;
    _$jscoverage['/navigation-view.js'].lineData[113]++;
    var className = el.className, originalClassName = className;
    _$jscoverage['/navigation-view.js'].lineData[116]++;
    className = className.replace(self.animateClassRegExp, '').replace(self.showViewClass, '');
    _$jscoverage['/navigation-view.js'].lineData[119]++;
    if (visit11_119_1(className !== originalClassName)) {
      _$jscoverage['/navigation-view.js'].lineData[120]++;
      el.className = trimClassName(className);
    }
  }
  _$jscoverage['/navigation-view.js'].lineData[124]++;
  function postProcessSwitchView(self, oldView, newView, backward) {
    _$jscoverage['/navigation-view.js'].functionData[9]++;
    _$jscoverage['/navigation-view.js'].lineData[125]++;
    var promise = newView.promise;
    _$jscoverage['/navigation-view.js'].lineData[127]++;
    self.set('activeView', newView);
    _$jscoverage['/navigation-view.js'].lineData[129]++;
    gc(self);
    _$jscoverage['/navigation-view.js'].lineData[131]++;
    if (visit12_131_1(promise)) {
      _$jscoverage['/navigation-view.js'].lineData[132]++;
      promise.then(function() {
  _$jscoverage['/navigation-view.js'].functionData[10]++;
  _$jscoverage['/navigation-view.js'].lineData[133]++;
  var activeView = self.get('activeView');
  _$jscoverage['/navigation-view.js'].lineData[134]++;
  if (visit13_134_1(activeView && visit14_134_2(activeView.uuid === newView.uuid))) {
    _$jscoverage['/navigation-view.js'].lineData[135]++;
    self.fire('afterInnerViewChange', {
  oldView: oldView, 
  newView: newView, 
  backward: backward});
    _$jscoverage['/navigation-view.js'].lineData[140]++;
    hideAnimateEl(self.loadingEl, self);
    _$jscoverage['/navigation-view.js'].lineData[141]++;
    showAnimateEl(newView.el, self);
  }
});
    } else {
      _$jscoverage['/navigation-view.js'].lineData[145]++;
      self.fire('afterInnerViewChange', {
  oldView: oldView, 
  newView: newView, 
  backward: backward});
    }
  }
  _$jscoverage['/navigation-view.js'].lineData[153]++;
  function processSwitchView(self, config, oldView, newView, enterAnimCssClass, leaveAnimCssClass, backward) {
    _$jscoverage['/navigation-view.js'].functionData[11]++;
    _$jscoverage['/navigation-view.js'].lineData[154]++;
    var loadingEl = self.loadingEl;
    _$jscoverage['/navigation-view.js'].lineData[155]++;
    if (visit15_155_1(oldView)) {
      _$jscoverage['/navigation-view.js'].lineData[156]++;
      if (visit16_156_1(oldView.leave)) {
        _$jscoverage['/navigation-view.js'].lineData[157]++;
        oldView.leave();
      }
      _$jscoverage['/navigation-view.js'].lineData[159]++;
      oldView.fire('leave');
    }
    _$jscoverage['/navigation-view.js'].lineData[161]++;
    var newViewEl = newView.el;
    _$jscoverage['/navigation-view.js'].lineData[162]++;
    newView.set(config);
    _$jscoverage['/navigation-view.js'].lineData[164]++;
    if (visit17_164_1(newView)) {
      _$jscoverage['/navigation-view.js'].lineData[165]++;
      if (visit18_165_1(newView.enter)) {
        _$jscoverage['/navigation-view.js'].lineData[166]++;
        newView.enter();
      }
      _$jscoverage['/navigation-view.js'].lineData[168]++;
      newView.fire('enter');
    }
    _$jscoverage['/navigation-view.js'].lineData[171]++;
    self.fire('beforeInnerViewChange', {
  oldView: oldView, 
  newView: newView, 
  backward: backward});
    _$jscoverage['/navigation-view.js'].lineData[177]++;
    var promise = newView.promise;
    _$jscoverage['/navigation-view.js'].lineData[179]++;
    if (visit19_179_1(oldView)) {
      _$jscoverage['/navigation-view.js'].lineData[180]++;
      showAnimateEl(oldView.el, self, leaveAnimCssClass);
    }
    _$jscoverage['/navigation-view.js'].lineData[183]++;
    if (visit20_183_1(promise)) {
      _$jscoverage['/navigation-view.js'].lineData[184]++;
      if (visit21_184_1(oldView)) {
        _$jscoverage['/navigation-view.js'].lineData[185]++;
        showAnimateEl(loadingEl, self, enterAnimCssClass);
      } else {
        _$jscoverage['/navigation-view.js'].lineData[188]++;
        showAnimateEl(loadingEl, self);
      }
      _$jscoverage['/navigation-view.js'].lineData[191]++;
      hideAnimateEl(newViewEl, self);
    } else {
      _$jscoverage['/navigation-view.js'].lineData[194]++;
      if (visit22_194_1(self.$loadingEl.hasClass(self.showViewClass) && oldView)) {
        _$jscoverage['/navigation-view.js'].lineData[195]++;
        showAnimateEl(loadingEl, self, leaveAnimCssClass);
      }
      _$jscoverage['/navigation-view.js'].lineData[197]++;
      showAnimateEl(newViewEl, self, enterAnimCssClass);
    }
  }
  _$jscoverage['/navigation-view.js'].lineData[201]++;
  function isEnterCss(css, self) {
    _$jscoverage['/navigation-view.js'].functionData[12]++;
    _$jscoverage['/navigation-view.js'].lineData[202]++;
    return css.match(self.animateEnterRegExp);
  }
  _$jscoverage['/navigation-view.js'].lineData[205]++;
  function isLeaveCss(css, self) {
    _$jscoverage['/navigation-view.js'].functionData[13]++;
    _$jscoverage['/navigation-view.js'].lineData[206]++;
    return css.match(self.animateLeaveRegExp);
  }
  _$jscoverage['/navigation-view.js'].lineData[209]++;
  function onAnimEnd(el) {
    _$jscoverage['/navigation-view.js'].functionData[14]++;
    _$jscoverage['/navigation-view.js'].lineData[210]++;
    return function() {
  _$jscoverage['/navigation-view.js'].functionData[15]++;
  _$jscoverage['/navigation-view.js'].lineData[211]++;
  var self = this;
  _$jscoverage['/navigation-view.js'].lineData[212]++;
  var className = el.className;
  _$jscoverage['/navigation-view.js'].lineData[213]++;
  if (visit23_213_1(isEnterCss(className, self))) {
    _$jscoverage['/navigation-view.js'].lineData[214]++;
    showAnimateEl(el, self);
  } else {
    _$jscoverage['/navigation-view.js'].lineData[215]++;
    if (visit24_215_1(isLeaveCss(className, self))) {
      _$jscoverage['/navigation-view.js'].lineData[216]++;
      hideAnimateEl(el, self);
    }
  }
};
  }
  _$jscoverage['/navigation-view.js'].lineData[221]++;
  return Container.extend({
  createDom: function() {
  _$jscoverage['/navigation-view.js'].functionData[16]++;
  _$jscoverage['/navigation-view.js'].lineData[223]++;
  var self = this;
  _$jscoverage['/navigation-view.js'].lineData[224]++;
  self.animateClassRegExp = new RegExp(self.view.getBaseCssClass() + '-anim-[^\\s]+');
  _$jscoverage['/navigation-view.js'].lineData[225]++;
  self.animateEnterRegExp = new RegExp('-enter(?:\\s|$)');
  _$jscoverage['/navigation-view.js'].lineData[226]++;
  self.animateLeaveRegExp = new RegExp('-leave(?:\\s|$)');
  _$jscoverage['/navigation-view.js'].lineData[227]++;
  self.showViewClass = self.view.getBaseCssClass('show-view');
  _$jscoverage['/navigation-view.js'].lineData[228]++;
  self.viewStack = [];
}, 
  createView: function(config) {
  _$jscoverage['/navigation-view.js'].functionData[17]++;
  _$jscoverage['/navigation-view.js'].lineData[237]++;
  var self = this;
  _$jscoverage['/navigation-view.js'].lineData[238]++;
  var nextView = getViewInstance(self, config);
  _$jscoverage['/navigation-view.js'].lineData[239]++;
  var nextViewEl;
  _$jscoverage['/navigation-view.js'].lineData[240]++;
  if (visit25_240_1(!nextView)) {
    _$jscoverage['/navigation-view.js'].lineData[241]++;
    nextView = self.addChild(config);
    _$jscoverage['/navigation-view.js'].lineData[242]++;
    nextViewEl = nextView.get('el');
    _$jscoverage['/navigation-view.js'].lineData[243]++;
    nextViewEl.on(ANIMATION_END_EVENT, onAnimEnd(nextViewEl[0]), self);
  }
  _$jscoverage['/navigation-view.js'].lineData[245]++;
  return nextView;
}, 
  push: function(config) {
  _$jscoverage['/navigation-view.js'].functionData[18]++;
  _$jscoverage['/navigation-view.js'].lineData[249]++;
  var self = this, nextView, animation, enterAnimation, leaveAnimation, enterAnimCssClass, leaveAnimCssClass, activeView, viewStack = self.viewStack, activeViewConfig = viewStack[viewStack.length - 1];
  _$jscoverage['/navigation-view.js'].lineData[260]++;
  activeView = self.get('activeView');
  _$jscoverage['/navigation-view.js'].lineData[262]++;
  if (visit26_262_1(activeView)) {
    _$jscoverage['/navigation-view.js'].lineData[263]++;
    config.animation = visit27_263_1(config.animation || self.get('animation'));
  } else {
    _$jscoverage['/navigation-view.js'].lineData[266]++;
    config.animation = {};
  }
  _$jscoverage['/navigation-view.js'].lineData[269]++;
  animation = config.animation;
  _$jscoverage['/navigation-view.js'].lineData[270]++;
  nextView = self.createView(config);
  _$jscoverage['/navigation-view.js'].lineData[271]++;
  nextView.uuid = uuid++;
  _$jscoverage['/navigation-view.js'].lineData[272]++;
  viewStack.push(config);
  _$jscoverage['/navigation-view.js'].lineData[273]++;
  enterAnimation = animation.enter;
  _$jscoverage['/navigation-view.js'].lineData[274]++;
  leaveAnimation = animation.leave;
  _$jscoverage['/navigation-view.js'].lineData[275]++;
  if (visit28_275_1(activeView)) {
    _$jscoverage['/navigation-view.js'].lineData[276]++;
    leaveAnimation = visit29_276_1(activeViewConfig.animation.leave || leaveAnimation);
  }
  _$jscoverage['/navigation-view.js'].lineData[279]++;
  enterAnimCssClass = visit30_279_1(visit31_279_2(enterAnimation && getAnimCss(self, enterAnimation, true)) || '');
  _$jscoverage['/navigation-view.js'].lineData[280]++;
  leaveAnimCssClass = getAnimCss(self, leaveAnimation);
  _$jscoverage['/navigation-view.js'].lineData[282]++;
  processSwitchView(self, config, activeView, nextView, enterAnimCssClass, leaveAnimCssClass);
  _$jscoverage['/navigation-view.js'].lineData[284]++;
  postProcessSwitchView(self, activeView, nextView);
}, 
  replace: function(config) {
  _$jscoverage['/navigation-view.js'].functionData[19]++;
  _$jscoverage['/navigation-view.js'].lineData[288]++;
  var self = this, viewStack = self.viewStack;
  _$jscoverage['/navigation-view.js'].lineData[290]++;
  S.mix(viewStack[viewStack.length - 1], config);
}, 
  pop: function(config) {
  _$jscoverage['/navigation-view.js'].functionData[20]++;
  _$jscoverage['/navigation-view.js'].lineData[294]++;
  var self = this, activeView, nextView, enterAnimCssClass, leaveAnimCssClass, activeViewConfig, viewStack = self.viewStack;
  _$jscoverage['/navigation-view.js'].lineData[302]++;
  if (visit32_302_1(viewStack.length > 1)) {
    _$jscoverage['/navigation-view.js'].lineData[303]++;
    activeViewConfig = viewStack[viewStack.length - 1];
    _$jscoverage['/navigation-view.js'].lineData[304]++;
    viewStack.pop();
    _$jscoverage['/navigation-view.js'].lineData[305]++;
    activeView = self.get('activeView');
    _$jscoverage['/navigation-view.js'].lineData[306]++;
    config = viewStack[viewStack.length - 1];
    _$jscoverage['/navigation-view.js'].lineData[308]++;
    nextView = self.createView(config);
    _$jscoverage['/navigation-view.js'].lineData[309]++;
    nextView.uuid = uuid++;
    _$jscoverage['/navigation-view.js'].lineData[310]++;
    enterAnimCssClass = getAnimCss(self, visit33_310_1(config.animation.leave || activeViewConfig.animation.leave), true);
    _$jscoverage['/navigation-view.js'].lineData[311]++;
    leaveAnimCssClass = getAnimCss(self, activeViewConfig.animation.enter);
    _$jscoverage['/navigation-view.js'].lineData[313]++;
    processSwitchView(self, config, activeView, nextView, enterAnimCssClass, leaveAnimCssClass, true);
    _$jscoverage['/navigation-view.js'].lineData[315]++;
    postProcessSwitchView(self, activeView, nextView, true);
  }
}}, {
  xclass: 'navigation-view', 
  ATTRS: {
  animation: {
  value: {
  'enter': 'slide-right', 
  'leave': 'slide-left'}}, 
  handleGestureEvents: {
  value: false}, 
  viewCacheSize: {
  value: 20}, 
  focusable: {
  value: false}, 
  allowTextSelection: {
  value: true}, 
  xrender: {
  value: NavigationViewRender}, 
  contentTpl: {
  value: ContentTpl}, 
  defaultChildCfg: {
  value: {
  handleGestureEvents: false, 
  allowTextSelection: true}}}});
});
