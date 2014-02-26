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
  _$jscoverage['/base.js'].lineData[8] = 0;
  _$jscoverage['/base.js'].lineData[9] = 0;
  _$jscoverage['/base.js'].lineData[10] = 0;
  _$jscoverage['/base.js'].lineData[12] = 0;
  _$jscoverage['/base.js'].lineData[15] = 0;
  _$jscoverage['/base.js'].lineData[16] = 0;
  _$jscoverage['/base.js'].lineData[20] = 0;
  _$jscoverage['/base.js'].lineData[21] = 0;
  _$jscoverage['/base.js'].lineData[23] = 0;
  _$jscoverage['/base.js'].lineData[24] = 0;
  _$jscoverage['/base.js'].lineData[26] = 0;
  _$jscoverage['/base.js'].lineData[29] = 0;
  _$jscoverage['/base.js'].lineData[30] = 0;
  _$jscoverage['/base.js'].lineData[33] = 0;
  _$jscoverage['/base.js'].lineData[34] = 0;
  _$jscoverage['/base.js'].lineData[42] = 0;
  _$jscoverage['/base.js'].lineData[45] = 0;
  _$jscoverage['/base.js'].lineData[49] = 0;
  _$jscoverage['/base.js'].lineData[50] = 0;
  _$jscoverage['/base.js'].lineData[51] = 0;
  _$jscoverage['/base.js'].lineData[52] = 0;
  _$jscoverage['/base.js'].lineData[54] = 0;
  _$jscoverage['/base.js'].lineData[56] = 0;
  _$jscoverage['/base.js'].lineData[57] = 0;
  _$jscoverage['/base.js'].lineData[59] = 0;
  _$jscoverage['/base.js'].lineData[60] = 0;
  _$jscoverage['/base.js'].lineData[63] = 0;
  _$jscoverage['/base.js'].lineData[68] = 0;
  _$jscoverage['/base.js'].lineData[71] = 0;
  _$jscoverage['/base.js'].lineData[76] = 0;
  _$jscoverage['/base.js'].lineData[78] = 0;
  _$jscoverage['/base.js'].lineData[82] = 0;
  _$jscoverage['/base.js'].lineData[83] = 0;
  _$jscoverage['/base.js'].lineData[84] = 0;
  _$jscoverage['/base.js'].lineData[89] = 0;
  _$jscoverage['/base.js'].lineData[90] = 0;
  _$jscoverage['/base.js'].lineData[93] = 0;
  _$jscoverage['/base.js'].lineData[94] = 0;
  _$jscoverage['/base.js'].lineData[101] = 0;
  _$jscoverage['/base.js'].lineData[102] = 0;
  _$jscoverage['/base.js'].lineData[103] = 0;
  _$jscoverage['/base.js'].lineData[108] = 0;
  _$jscoverage['/base.js'].lineData[113] = 0;
  _$jscoverage['/base.js'].lineData[122] = 0;
  _$jscoverage['/base.js'].lineData[124] = 0;
  _$jscoverage['/base.js'].lineData[128] = 0;
  _$jscoverage['/base.js'].lineData[133] = 0;
  _$jscoverage['/base.js'].lineData[146] = 0;
  _$jscoverage['/base.js'].lineData[150] = 0;
  _$jscoverage['/base.js'].lineData[154] = 0;
  _$jscoverage['/base.js'].lineData[156] = 0;
  _$jscoverage['/base.js'].lineData[160] = 0;
  _$jscoverage['/base.js'].lineData[161] = 0;
  _$jscoverage['/base.js'].lineData[162] = 0;
  _$jscoverage['/base.js'].lineData[163] = 0;
  _$jscoverage['/base.js'].lineData[166] = 0;
  _$jscoverage['/base.js'].lineData[167] = 0;
  _$jscoverage['/base.js'].lineData[170] = 0;
  _$jscoverage['/base.js'].lineData[171] = 0;
  _$jscoverage['/base.js'].lineData[172] = 0;
  _$jscoverage['/base.js'].lineData[173] = 0;
  _$jscoverage['/base.js'].lineData[174] = 0;
  _$jscoverage['/base.js'].lineData[175] = 0;
  _$jscoverage['/base.js'].lineData[176] = 0;
  _$jscoverage['/base.js'].lineData[177] = 0;
  _$jscoverage['/base.js'].lineData[178] = 0;
  _$jscoverage['/base.js'].lineData[179] = 0;
  _$jscoverage['/base.js'].lineData[182] = 0;
  _$jscoverage['/base.js'].lineData[183] = 0;
  _$jscoverage['/base.js'].lineData[184] = 0;
  _$jscoverage['/base.js'].lineData[185] = 0;
  _$jscoverage['/base.js'].lineData[186] = 0;
  _$jscoverage['/base.js'].lineData[187] = 0;
  _$jscoverage['/base.js'].lineData[188] = 0;
  _$jscoverage['/base.js'].lineData[189] = 0;
  _$jscoverage['/base.js'].lineData[190] = 0;
  _$jscoverage['/base.js'].lineData[193] = 0;
  _$jscoverage['/base.js'].lineData[197] = 0;
  _$jscoverage['/base.js'].lineData[198] = 0;
  _$jscoverage['/base.js'].lineData[199] = 0;
  _$jscoverage['/base.js'].lineData[201] = 0;
  _$jscoverage['/base.js'].lineData[202] = 0;
  _$jscoverage['/base.js'].lineData[203] = 0;
  _$jscoverage['/base.js'].lineData[204] = 0;
  _$jscoverage['/base.js'].lineData[208] = 0;
  _$jscoverage['/base.js'].lineData[212] = 0;
  _$jscoverage['/base.js'].lineData[213] = 0;
  _$jscoverage['/base.js'].lineData[215] = 0;
  _$jscoverage['/base.js'].lineData[224] = 0;
  _$jscoverage['/base.js'].lineData[225] = 0;
  _$jscoverage['/base.js'].lineData[226] = 0;
  _$jscoverage['/base.js'].lineData[227] = 0;
  _$jscoverage['/base.js'].lineData[228] = 0;
  _$jscoverage['/base.js'].lineData[229] = 0;
  _$jscoverage['/base.js'].lineData[230] = 0;
  _$jscoverage['/base.js'].lineData[234] = 0;
  _$jscoverage['/base.js'].lineData[235] = 0;
  _$jscoverage['/base.js'].lineData[236] = 0;
  _$jscoverage['/base.js'].lineData[237] = 0;
  _$jscoverage['/base.js'].lineData[238] = 0;
  _$jscoverage['/base.js'].lineData[239] = 0;
  _$jscoverage['/base.js'].lineData[240] = 0;
  _$jscoverage['/base.js'].lineData[246] = 0;
  _$jscoverage['/base.js'].lineData[247] = 0;
  _$jscoverage['/base.js'].lineData[248] = 0;
  _$jscoverage['/base.js'].lineData[249] = 0;
  _$jscoverage['/base.js'].lineData[251] = 0;
  _$jscoverage['/base.js'].lineData[253] = 0;
  _$jscoverage['/base.js'].lineData[260] = 0;
  _$jscoverage['/base.js'].lineData[264] = 0;
  _$jscoverage['/base.js'].lineData[265] = 0;
  _$jscoverage['/base.js'].lineData[266] = 0;
  _$jscoverage['/base.js'].lineData[267] = 0;
  _$jscoverage['/base.js'].lineData[268] = 0;
  _$jscoverage['/base.js'].lineData[270] = 0;
  _$jscoverage['/base.js'].lineData[271] = 0;
  _$jscoverage['/base.js'].lineData[272] = 0;
  _$jscoverage['/base.js'].lineData[273] = 0;
  _$jscoverage['/base.js'].lineData[274] = 0;
  _$jscoverage['/base.js'].lineData[278] = 0;
  _$jscoverage['/base.js'].lineData[279] = 0;
  _$jscoverage['/base.js'].lineData[280] = 0;
  _$jscoverage['/base.js'].lineData[281] = 0;
  _$jscoverage['/base.js'].lineData[285] = 0;
  _$jscoverage['/base.js'].lineData[289] = 0;
  _$jscoverage['/base.js'].lineData[291] = 0;
  _$jscoverage['/base.js'].lineData[292] = 0;
  _$jscoverage['/base.js'].lineData[293] = 0;
  _$jscoverage['/base.js'].lineData[298] = 0;
  _$jscoverage['/base.js'].lineData[299] = 0;
  _$jscoverage['/base.js'].lineData[300] = 0;
  _$jscoverage['/base.js'].lineData[301] = 0;
  _$jscoverage['/base.js'].lineData[302] = 0;
  _$jscoverage['/base.js'].lineData[304] = 0;
  _$jscoverage['/base.js'].lineData[305] = 0;
  _$jscoverage['/base.js'].lineData[307] = 0;
  _$jscoverage['/base.js'].lineData[311] = 0;
  _$jscoverage['/base.js'].lineData[314] = 0;
  _$jscoverage['/base.js'].lineData[315] = 0;
  _$jscoverage['/base.js'].lineData[317] = 0;
  _$jscoverage['/base.js'].lineData[318] = 0;
  _$jscoverage['/base.js'].lineData[319] = 0;
  _$jscoverage['/base.js'].lineData[321] = 0;
  _$jscoverage['/base.js'].lineData[322] = 0;
  _$jscoverage['/base.js'].lineData[323] = 0;
  _$jscoverage['/base.js'].lineData[325] = 0;
  _$jscoverage['/base.js'].lineData[326] = 0;
  _$jscoverage['/base.js'].lineData[327] = 0;
  _$jscoverage['/base.js'].lineData[328] = 0;
  _$jscoverage['/base.js'].lineData[329] = 0;
  _$jscoverage['/base.js'].lineData[330] = 0;
  _$jscoverage['/base.js'].lineData[331] = 0;
  _$jscoverage['/base.js'].lineData[333] = 0;
  _$jscoverage['/base.js'].lineData[334] = 0;
  _$jscoverage['/base.js'].lineData[336] = 0;
  _$jscoverage['/base.js'].lineData[337] = 0;
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
  _$jscoverage['/base.js'].functionData[15] = 0;
  _$jscoverage['/base.js'].functionData[16] = 0;
  _$jscoverage['/base.js'].functionData[17] = 0;
}
if (! _$jscoverage['/base.js'].branchData) {
  _$jscoverage['/base.js'].branchData = {};
  _$jscoverage['/base.js'].branchData['20'] = [];
  _$jscoverage['/base.js'].branchData['20'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['23'] = [];
  _$jscoverage['/base.js'].branchData['23'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['56'] = [];
  _$jscoverage['/base.js'].branchData['56'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['59'] = [];
  _$jscoverage['/base.js'].branchData['59'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['82'] = [];
  _$jscoverage['/base.js'].branchData['82'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['84'] = [];
  _$jscoverage['/base.js'].branchData['84'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['93'] = [];
  _$jscoverage['/base.js'].branchData['93'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['93'][2] = new BranchData();
  _$jscoverage['/base.js'].branchData['93'][3] = new BranchData();
  _$jscoverage['/base.js'].branchData['101'] = [];
  _$jscoverage['/base.js'].branchData['101'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['150'] = [];
  _$jscoverage['/base.js'].branchData['150'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['150'][2] = new BranchData();
  _$jscoverage['/base.js'].branchData['151'] = [];
  _$jscoverage['/base.js'].branchData['151'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['151'][2] = new BranchData();
  _$jscoverage['/base.js'].branchData['152'] = [];
  _$jscoverage['/base.js'].branchData['152'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['152'][2] = new BranchData();
  _$jscoverage['/base.js'].branchData['162'] = [];
  _$jscoverage['/base.js'].branchData['162'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['166'] = [];
  _$jscoverage['/base.js'].branchData['166'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['171'] = [];
  _$jscoverage['/base.js'].branchData['171'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['174'] = [];
  _$jscoverage['/base.js'].branchData['174'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['177'] = [];
  _$jscoverage['/base.js'].branchData['177'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['182'] = [];
  _$jscoverage['/base.js'].branchData['182'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['185'] = [];
  _$jscoverage['/base.js'].branchData['185'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['188'] = [];
  _$jscoverage['/base.js'].branchData['188'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['198'] = [];
  _$jscoverage['/base.js'].branchData['198'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['212'] = [];
  _$jscoverage['/base.js'].branchData['212'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['224'] = [];
  _$jscoverage['/base.js'].branchData['224'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['228'] = [];
  _$jscoverage['/base.js'].branchData['228'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['228'][2] = new BranchData();
  _$jscoverage['/base.js'].branchData['228'][3] = new BranchData();
  _$jscoverage['/base.js'].branchData['228'][4] = new BranchData();
  _$jscoverage['/base.js'].branchData['228'][5] = new BranchData();
  _$jscoverage['/base.js'].branchData['228'][6] = new BranchData();
  _$jscoverage['/base.js'].branchData['228'][7] = new BranchData();
  _$jscoverage['/base.js'].branchData['228'][8] = new BranchData();
  _$jscoverage['/base.js'].branchData['234'] = [];
  _$jscoverage['/base.js'].branchData['234'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['238'] = [];
  _$jscoverage['/base.js'].branchData['238'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['238'][2] = new BranchData();
  _$jscoverage['/base.js'].branchData['238'][3] = new BranchData();
  _$jscoverage['/base.js'].branchData['238'][4] = new BranchData();
  _$jscoverage['/base.js'].branchData['238'][5] = new BranchData();
  _$jscoverage['/base.js'].branchData['238'][6] = new BranchData();
  _$jscoverage['/base.js'].branchData['238'][7] = new BranchData();
  _$jscoverage['/base.js'].branchData['238'][8] = new BranchData();
  _$jscoverage['/base.js'].branchData['247'] = [];
  _$jscoverage['/base.js'].branchData['247'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['270'] = [];
  _$jscoverage['/base.js'].branchData['270'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['271'] = [];
  _$jscoverage['/base.js'].branchData['271'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['273'] = [];
  _$jscoverage['/base.js'].branchData['273'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['278'] = [];
  _$jscoverage['/base.js'].branchData['278'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['280'] = [];
  _$jscoverage['/base.js'].branchData['280'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['291'] = [];
  _$jscoverage['/base.js'].branchData['291'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['301'] = [];
  _$jscoverage['/base.js'].branchData['301'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['304'] = [];
  _$jscoverage['/base.js'].branchData['304'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['314'] = [];
  _$jscoverage['/base.js'].branchData['314'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['317'] = [];
  _$jscoverage['/base.js'].branchData['317'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['321'] = [];
  _$jscoverage['/base.js'].branchData['321'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['333'] = [];
  _$jscoverage['/base.js'].branchData['333'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['336'] = [];
  _$jscoverage['/base.js'].branchData['336'][1] = new BranchData();
}
_$jscoverage['/base.js'].branchData['336'][1].init(131, 17, 'top !== undefined');
function visit60_336_1(result) {
  _$jscoverage['/base.js'].branchData['336'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['333'][1].init(21, 18, 'left !== undefined');
function visit59_333_1(result) {
  _$jscoverage['/base.js'].branchData['333'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['321'][1].init(245, 17, 'top !== undefined');
function visit58_321_1(result) {
  _$jscoverage['/base.js'].branchData['321'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['317'][1].init(81, 18, 'left !== undefined');
function visit57_317_1(result) {
  _$jscoverage['/base.js'].branchData['317'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['314'][1].init(110, 7, 'animCfg');
function visit56_314_1(result) {
  _$jscoverage['/base.js'].branchData['314'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['304'][1].init(265, 7, 'cfg.top');
function visit55_304_1(result) {
  _$jscoverage['/base.js'].branchData['304'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['301'][1].init(134, 8, 'cfg.left');
function visit54_301_1(result) {
  _$jscoverage['/base.js'].branchData['301'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['291'][1].init(75, 51, '(pageOffset = self.pagesOffset) && pageOffset[index]');
function visit53_291_1(result) {
  _$jscoverage['/base.js'].branchData['291'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['280'][1].init(70, 15, 'offset[p2] <= v');
function visit52_280_1(result) {
  _$jscoverage['/base.js'].branchData['280'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['278'][1].init(50, 6, 'i >= 0');
function visit51_278_1(result) {
  _$jscoverage['/base.js'].branchData['278'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['273'][1].init(70, 15, 'offset[p2] >= v');
function visit50_273_1(result) {
  _$jscoverage['/base.js'].branchData['273'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['271'][1].init(29, 22, 'i < pagesOffset.length');
function visit49_271_1(result) {
  _$jscoverage['/base.js'].branchData['271'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['270'][1].init(254, 13, 'direction > 0');
function visit48_270_1(result) {
  _$jscoverage['/base.js'].branchData['270'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['247'][1].init(46, 23, 'self.scrollAnims.length');
function visit47_247_1(result) {
  _$jscoverage['/base.js'].branchData['247'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['238'][8].init(212, 10, 'deltaX < 0');
function visit46_238_8(result) {
  _$jscoverage['/base.js'].branchData['238'][8].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['238'][7].init(191, 17, 'scrollLeft >= max');
function visit45_238_7(result) {
  _$jscoverage['/base.js'].branchData['238'][7].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['238'][6].init(191, 31, 'scrollLeft >= max && deltaX < 0');
function visit44_238_6(result) {
  _$jscoverage['/base.js'].branchData['238'][6].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['238'][5].init(177, 10, 'deltaX > 0');
function visit43_238_5(result) {
  _$jscoverage['/base.js'].branchData['238'][5].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['238'][4].init(156, 17, 'scrollLeft <= min');
function visit42_238_4(result) {
  _$jscoverage['/base.js'].branchData['238'][4].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['238'][3].init(156, 31, 'scrollLeft <= min && deltaX > 0');
function visit41_238_3(result) {
  _$jscoverage['/base.js'].branchData['238'][3].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['238'][2].init(156, 66, 'scrollLeft <= min && deltaX > 0 || scrollLeft >= max && deltaX < 0');
function visit40_238_2(result) {
  _$jscoverage['/base.js'].branchData['238'][2].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['238'][1].init(154, 69, '!(scrollLeft <= min && deltaX > 0 || scrollLeft >= max && deltaX < 0)');
function visit39_238_1(result) {
  _$jscoverage['/base.js'].branchData['238'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['234'][1].init(802, 43, '(deltaX = e.deltaX) && self.allowScroll.left');
function visit38_234_1(result) {
  _$jscoverage['/base.js'].branchData['234'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['228'][8].init(206, 10, 'deltaY < 0');
function visit37_228_8(result) {
  _$jscoverage['/base.js'].branchData['228'][8].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['228'][7].init(186, 16, 'scrollTop >= max');
function visit36_228_7(result) {
  _$jscoverage['/base.js'].branchData['228'][7].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['228'][6].init(186, 30, 'scrollTop >= max && deltaY < 0');
function visit35_228_6(result) {
  _$jscoverage['/base.js'].branchData['228'][6].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['228'][5].init(172, 10, 'deltaY > 0');
function visit34_228_5(result) {
  _$jscoverage['/base.js'].branchData['228'][5].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['228'][4].init(152, 16, 'scrollTop <= min');
function visit33_228_4(result) {
  _$jscoverage['/base.js'].branchData['228'][4].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['228'][3].init(152, 30, 'scrollTop <= min && deltaY > 0');
function visit32_228_3(result) {
  _$jscoverage['/base.js'].branchData['228'][3].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['228'][2].init(152, 64, 'scrollTop <= min && deltaY > 0 || scrollTop >= max && deltaY < 0');
function visit31_228_2(result) {
  _$jscoverage['/base.js'].branchData['228'][2].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['228'][1].init(150, 67, '!(scrollTop <= min && deltaY > 0 || scrollTop >= max && deltaY < 0)');
function visit30_228_1(result) {
  _$jscoverage['/base.js'].branchData['228'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['224'][1].init(355, 42, '(deltaY = e.deltaY) && self.allowScroll.top');
function visit29_224_1(result) {
  _$jscoverage['/base.js'].branchData['224'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['212'][1].init(17, 20, 'this.get(\'disabled\')');
function visit28_212_1(result) {
  _$jscoverage['/base.js'].branchData['212'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['198'][1].init(49, 18, 'control.scrollStep');
function visit27_198_1(result) {
  _$jscoverage['/base.js'].branchData['198'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['188'][1].init(296, 24, 'keyCode === KeyCode.LEFT');
function visit26_188_1(result) {
  _$jscoverage['/base.js'].branchData['188'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['185'][1].init(129, 25, 'keyCode === KeyCode.RIGHT');
function visit25_185_1(result) {
  _$jscoverage['/base.js'].branchData['185'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['182'][1].init(1618, 6, 'allowX');
function visit24_182_1(result) {
  _$jscoverage['/base.js'].branchData['182'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['177'][1].init(722, 27, 'keyCode === KeyCode.PAGE_UP');
function visit23_177_1(result) {
  _$jscoverage['/base.js'].branchData['177'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['174'][1].init(552, 29, 'keyCode === KeyCode.PAGE_DOWN');
function visit22_174_1(result) {
  _$jscoverage['/base.js'].branchData['174'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['171'][1].init(390, 22, 'keyCode === KeyCode.UP');
function visit21_171_1(result) {
  _$jscoverage['/base.js'].branchData['171'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['166'][1].init(180, 24, 'keyCode === KeyCode.DOWN');
function visit20_166_1(result) {
  _$jscoverage['/base.js'].branchData['166'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['162'][1].init(702, 6, 'allowY');
function visit19_162_1(result) {
  _$jscoverage['/base.js'].branchData['162'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['152'][2].init(330, 21, 'nodeName === \'select\'');
function visit18_152_2(result) {
  _$jscoverage['/base.js'].branchData['152'][2].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['152'][1].init(42, 75, 'nodeName === \'select\' || $target.hasAttr(\'contenteditable\')');
function visit17_152_1(result) {
  _$jscoverage['/base.js'].branchData['152'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['151'][2].init(286, 23, 'nodeName === \'textarea\'');
function visit16_151_2(result) {
  _$jscoverage['/base.js'].branchData['151'][2].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['151'][1].init(39, 118, 'nodeName === \'textarea\' || nodeName === \'select\' || $target.hasAttr(\'contenteditable\')');
function visit15_151_1(result) {
  _$jscoverage['/base.js'].branchData['151'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['150'][2].init(244, 20, 'nodeName === \'input\'');
function visit14_150_2(result) {
  _$jscoverage['/base.js'].branchData['150'][2].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['150'][1].init(244, 158, 'nodeName === \'input\' || nodeName === \'textarea\' || nodeName === \'select\' || $target.hasAttr(\'contenteditable\')');
function visit13_150_1(result) {
  _$jscoverage['/base.js'].branchData['150'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['101'][1].init(786, 9, 'pageIndex');
function visit12_101_1(result) {
  _$jscoverage['/base.js'].branchData['101'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['93'][3].init(196, 19, 'top <= maxScrollTop');
function visit11_93_3(result) {
  _$jscoverage['/base.js'].branchData['93'][3].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['93'][2].init(171, 21, 'left <= maxScrollLeft');
function visit10_93_2(result) {
  _$jscoverage['/base.js'].branchData['93'][2].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['93'][1].init(171, 44, 'left <= maxScrollLeft && top <= maxScrollTop');
function visit9_93_1(result) {
  _$jscoverage['/base.js'].branchData['93'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['84'][1].init(89, 24, 'typeof snap === \'string\'');
function visit8_84_1(result) {
  _$jscoverage['/base.js'].branchData['84'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['82'][1].init(1476, 4, 'snap');
function visit7_82_1(result) {
  _$jscoverage['/base.js'].branchData['82'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['59'][1].init(912, 25, 'scrollWidth > clientWidth');
function visit6_59_1(result) {
  _$jscoverage['/base.js'].branchData['59'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['56'][1].init(826, 27, 'scrollHeight > clientHeight');
function visit5_56_1(result) {
  _$jscoverage['/base.js'].branchData['56'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['23'][1].init(247, 10, 'scrollLeft');
function visit4_23_1(result) {
  _$jscoverage['/base.js'].branchData['23'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['20'][1].init(142, 9, 'scrollTop');
function visit3_20_1(result) {
  _$jscoverage['/base.js'].branchData['20'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/base.js'].functionData[0]++;
  _$jscoverage['/base.js'].lineData[7]++;
  var Node = require('node');
  _$jscoverage['/base.js'].lineData[8]++;
  var Anim = require('anim');
  _$jscoverage['/base.js'].lineData[9]++;
  var Container = require('component/container');
  _$jscoverage['/base.js'].lineData[10]++;
  var Render = require('./base/render');
  _$jscoverage['/base.js'].lineData[12]++;
  var $ = S.all, KeyCode = Node.KeyCode;
  _$jscoverage['/base.js'].lineData[15]++;
  function onElScroll() {
    _$jscoverage['/base.js'].functionData[1]++;
    _$jscoverage['/base.js'].lineData[16]++;
    var self = this, el = self.el, scrollTop = el.scrollTop, scrollLeft = el.scrollLeft;
    _$jscoverage['/base.js'].lineData[20]++;
    if (visit3_20_1(scrollTop)) {
      _$jscoverage['/base.js'].lineData[21]++;
      self.set('scrollTop', scrollTop + self.get('scrollTop'));
    }
    _$jscoverage['/base.js'].lineData[23]++;
    if (visit4_23_1(scrollLeft)) {
      _$jscoverage['/base.js'].lineData[24]++;
      self.set('scrollLeft', scrollLeft + self.get('scrollLeft'));
    }
    _$jscoverage['/base.js'].lineData[26]++;
    el.scrollTop = el.scrollLeft = 0;
  }
  _$jscoverage['/base.js'].lineData[29]++;
  function frame(anim, fx) {
    _$jscoverage['/base.js'].functionData[2]++;
    _$jscoverage['/base.js'].lineData[30]++;
    anim.scrollView.set(fx.prop, fx.val);
  }
  _$jscoverage['/base.js'].lineData[33]++;
  var reflow = S.buffer(function() {
  _$jscoverage['/base.js'].functionData[3]++;
  _$jscoverage['/base.js'].lineData[34]++;
  var control = this, $contentEl = control.$contentEl;
  _$jscoverage['/base.js'].lineData[42]++;
  var scrollHeight = control.get('scrollHeight'), scrollWidth = control.get('scrollWidth');
  _$jscoverage['/base.js'].lineData[45]++;
  var clientHeight = control.get('clientHeight'), allowScroll, clientWidth = control.get('clientWidth');
  _$jscoverage['/base.js'].lineData[49]++;
  control.scrollHeight = scrollHeight;
  _$jscoverage['/base.js'].lineData[50]++;
  control.scrollWidth = scrollWidth;
  _$jscoverage['/base.js'].lineData[51]++;
  control.clientHeight = clientHeight;
  _$jscoverage['/base.js'].lineData[52]++;
  control.clientWidth = clientWidth;
  _$jscoverage['/base.js'].lineData[54]++;
  allowScroll = control.allowScroll = {};
  _$jscoverage['/base.js'].lineData[56]++;
  if (visit5_56_1(scrollHeight > clientHeight)) {
    _$jscoverage['/base.js'].lineData[57]++;
    allowScroll.top = 1;
  }
  _$jscoverage['/base.js'].lineData[59]++;
  if (visit6_59_1(scrollWidth > clientWidth)) {
    _$jscoverage['/base.js'].lineData[60]++;
    allowScroll.left = 1;
  }
  _$jscoverage['/base.js'].lineData[63]++;
  control.minScroll = {
  left: 0, 
  top: 0};
  _$jscoverage['/base.js'].lineData[68]++;
  var maxScrollLeft, maxScrollTop;
  _$jscoverage['/base.js'].lineData[71]++;
  control.maxScroll = {
  left: maxScrollLeft = scrollWidth - clientWidth, 
  top: maxScrollTop = scrollHeight - clientHeight};
  _$jscoverage['/base.js'].lineData[76]++;
  delete control.scrollStep;
  _$jscoverage['/base.js'].lineData[78]++;
  var snap = control.get('snap'), scrollLeft = control.get('scrollLeft'), scrollTop = control.get('scrollTop');
  _$jscoverage['/base.js'].lineData[82]++;
  if (visit7_82_1(snap)) {
    _$jscoverage['/base.js'].lineData[83]++;
    var elOffset = $contentEl.offset();
    _$jscoverage['/base.js'].lineData[84]++;
    var pages = control.pages = visit8_84_1(typeof snap === 'string') ? $contentEl.all(snap) : $contentEl.children(), pageIndex = control.get('pageIndex'), pagesOffset = control.pagesOffset = [];
    _$jscoverage['/base.js'].lineData[89]++;
    pages.each(function(p, i) {
  _$jscoverage['/base.js'].functionData[4]++;
  _$jscoverage['/base.js'].lineData[90]++;
  var offset = p.offset(), left = offset.left - elOffset.left, top = offset.top - elOffset.top;
  _$jscoverage['/base.js'].lineData[93]++;
  if (visit9_93_1(visit10_93_2(left <= maxScrollLeft) && visit11_93_3(top <= maxScrollTop))) {
    _$jscoverage['/base.js'].lineData[94]++;
    pagesOffset[i] = {
  left: left, 
  top: top, 
  index: i};
  }
});
    _$jscoverage['/base.js'].lineData[101]++;
    if (visit12_101_1(pageIndex)) {
      _$jscoverage['/base.js'].lineData[102]++;
      control.scrollToPage(pageIndex);
      _$jscoverage['/base.js'].lineData[103]++;
      return;
    }
  }
  _$jscoverage['/base.js'].lineData[108]++;
  control.scrollToWithBounds({
  left: scrollLeft, 
  top: scrollTop});
  _$jscoverage['/base.js'].lineData[113]++;
  control.fire('reflow');
});
  _$jscoverage['/base.js'].lineData[122]++;
  return Container.extend({
  initializer: function() {
  _$jscoverage['/base.js'].functionData[5]++;
  _$jscoverage['/base.js'].lineData[124]++;
  this.scrollAnims = [];
}, 
  bindUI: function() {
  _$jscoverage['/base.js'].functionData[6]++;
  _$jscoverage['/base.js'].lineData[128]++;
  var self = this, $el = self.$el;
  _$jscoverage['/base.js'].lineData[133]++;
  $el.on('mousewheel', self.handleMouseWheel, self).on('scroll', onElScroll, self);
}, 
  _onSetClientHeight: reflow, 
  _onSetClientWidth: reflow, 
  _onSetScrollHeight: reflow, 
  _onSetScrollWidth: reflow, 
  handleKeyDownInternal: function(e) {
  _$jscoverage['/base.js'].functionData[7]++;
  _$jscoverage['/base.js'].lineData[146]++;
  var target = e.target, $target = $(target), nodeName = $target.nodeName();
  _$jscoverage['/base.js'].lineData[150]++;
  if (visit13_150_1(visit14_150_2(nodeName === 'input') || visit15_151_1(visit16_151_2(nodeName === 'textarea') || visit17_152_1(visit18_152_2(nodeName === 'select') || $target.hasAttr('contenteditable'))))) {
    _$jscoverage['/base.js'].lineData[154]++;
    return undefined;
  }
  _$jscoverage['/base.js'].lineData[156]++;
  var self = this, keyCode = e.keyCode, scrollStep = self.getScrollStep(), ok;
  _$jscoverage['/base.js'].lineData[160]++;
  var allowX = self.allowScroll.left;
  _$jscoverage['/base.js'].lineData[161]++;
  var allowY = self.allowScroll.top;
  _$jscoverage['/base.js'].lineData[162]++;
  if (visit19_162_1(allowY)) {
    _$jscoverage['/base.js'].lineData[163]++;
    var scrollStepY = scrollStep.top, clientHeight = self.clientHeight, scrollTop = self.get('scrollTop');
    _$jscoverage['/base.js'].lineData[166]++;
    if (visit20_166_1(keyCode === KeyCode.DOWN)) {
      _$jscoverage['/base.js'].lineData[167]++;
      self.scrollToWithBounds({
  top: scrollTop + scrollStepY});
      _$jscoverage['/base.js'].lineData[170]++;
      ok = true;
    } else {
      _$jscoverage['/base.js'].lineData[171]++;
      if (visit21_171_1(keyCode === KeyCode.UP)) {
        _$jscoverage['/base.js'].lineData[172]++;
        self.scrollToWithBounds({
  top: scrollTop - scrollStepY});
        _$jscoverage['/base.js'].lineData[173]++;
        ok = true;
      } else {
        _$jscoverage['/base.js'].lineData[174]++;
        if (visit22_174_1(keyCode === KeyCode.PAGE_DOWN)) {
          _$jscoverage['/base.js'].lineData[175]++;
          self.scrollToWithBounds({
  top: scrollTop + clientHeight});
          _$jscoverage['/base.js'].lineData[176]++;
          ok = true;
        } else {
          _$jscoverage['/base.js'].lineData[177]++;
          if (visit23_177_1(keyCode === KeyCode.PAGE_UP)) {
            _$jscoverage['/base.js'].lineData[178]++;
            self.scrollToWithBounds({
  top: scrollTop - clientHeight});
            _$jscoverage['/base.js'].lineData[179]++;
            ok = true;
          }
        }
      }
    }
  }
  _$jscoverage['/base.js'].lineData[182]++;
  if (visit24_182_1(allowX)) {
    _$jscoverage['/base.js'].lineData[183]++;
    var scrollStepX = scrollStep.left;
    _$jscoverage['/base.js'].lineData[184]++;
    var scrollLeft = self.get('scrollLeft');
    _$jscoverage['/base.js'].lineData[185]++;
    if (visit25_185_1(keyCode === KeyCode.RIGHT)) {
      _$jscoverage['/base.js'].lineData[186]++;
      self.scrollToWithBounds({
  left: scrollLeft + scrollStepX});
      _$jscoverage['/base.js'].lineData[187]++;
      ok = true;
    } else {
      _$jscoverage['/base.js'].lineData[188]++;
      if (visit26_188_1(keyCode === KeyCode.LEFT)) {
        _$jscoverage['/base.js'].lineData[189]++;
        self.scrollToWithBounds({
  left: scrollLeft - scrollStepX});
        _$jscoverage['/base.js'].lineData[190]++;
        ok = true;
      }
    }
  }
  _$jscoverage['/base.js'].lineData[193]++;
  return ok;
}, 
  getScrollStep: function() {
  _$jscoverage['/base.js'].functionData[8]++;
  _$jscoverage['/base.js'].lineData[197]++;
  var control = this;
  _$jscoverage['/base.js'].lineData[198]++;
  if (visit27_198_1(control.scrollStep)) {
    _$jscoverage['/base.js'].lineData[199]++;
    return control.scrollStep;
  }
  _$jscoverage['/base.js'].lineData[201]++;
  var elDoc = $(this.get('el')[0].ownerDocument);
  _$jscoverage['/base.js'].lineData[202]++;
  var clientHeight = control.clientHeight;
  _$jscoverage['/base.js'].lineData[203]++;
  var clientWidth = control.clientWidth;
  _$jscoverage['/base.js'].lineData[204]++;
  control.scrollStep = {
  top: Math.max(clientHeight * clientHeight * 0.7 / elDoc.height(), 20), 
  left: Math.max(clientWidth * clientWidth * 0.7 / elDoc.width(), 20)};
  _$jscoverage['/base.js'].lineData[208]++;
  return control.scrollStep;
}, 
  handleMouseWheel: function(e) {
  _$jscoverage['/base.js'].functionData[9]++;
  _$jscoverage['/base.js'].lineData[212]++;
  if (visit28_212_1(this.get('disabled'))) {
    _$jscoverage['/base.js'].lineData[213]++;
    return;
  }
  _$jscoverage['/base.js'].lineData[215]++;
  var max, min, self = this, scrollStep = self.getScrollStep(), deltaY, deltaX, maxScroll = self.maxScroll, minScroll = self.minScroll;
  _$jscoverage['/base.js'].lineData[224]++;
  if (visit29_224_1((deltaY = e.deltaY) && self.allowScroll.top)) {
    _$jscoverage['/base.js'].lineData[225]++;
    var scrollTop = self.get('scrollTop');
    _$jscoverage['/base.js'].lineData[226]++;
    max = maxScroll.top;
    _$jscoverage['/base.js'].lineData[227]++;
    min = minScroll.top;
    _$jscoverage['/base.js'].lineData[228]++;
    if (visit30_228_1(!(visit31_228_2(visit32_228_3(visit33_228_4(scrollTop <= min) && visit34_228_5(deltaY > 0)) || visit35_228_6(visit36_228_7(scrollTop >= max) && visit37_228_8(deltaY < 0)))))) {
      _$jscoverage['/base.js'].lineData[229]++;
      self.scrollToWithBounds({
  top: scrollTop - e.deltaY * scrollStep.top});
      _$jscoverage['/base.js'].lineData[230]++;
      e.preventDefault();
    }
  }
  _$jscoverage['/base.js'].lineData[234]++;
  if (visit38_234_1((deltaX = e.deltaX) && self.allowScroll.left)) {
    _$jscoverage['/base.js'].lineData[235]++;
    var scrollLeft = self.get('scrollLeft');
    _$jscoverage['/base.js'].lineData[236]++;
    max = maxScroll.left;
    _$jscoverage['/base.js'].lineData[237]++;
    min = minScroll.left;
    _$jscoverage['/base.js'].lineData[238]++;
    if (visit39_238_1(!(visit40_238_2(visit41_238_3(visit42_238_4(scrollLeft <= min) && visit43_238_5(deltaX > 0)) || visit44_238_6(visit45_238_7(scrollLeft >= max) && visit46_238_8(deltaX < 0)))))) {
      _$jscoverage['/base.js'].lineData[239]++;
      self.scrollToWithBounds({
  left: scrollLeft - e.deltaX * scrollStep.left});
      _$jscoverage['/base.js'].lineData[240]++;
      e.preventDefault();
    }
  }
}, 
  stopAnimation: function() {
  _$jscoverage['/base.js'].functionData[10]++;
  _$jscoverage['/base.js'].lineData[246]++;
  var self = this;
  _$jscoverage['/base.js'].lineData[247]++;
  if (visit47_247_1(self.scrollAnims.length)) {
    _$jscoverage['/base.js'].lineData[248]++;
    S.each(self.scrollAnims, function(scrollAnim) {
  _$jscoverage['/base.js'].functionData[11]++;
  _$jscoverage['/base.js'].lineData[249]++;
  scrollAnim.stop();
});
    _$jscoverage['/base.js'].lineData[251]++;
    self.scrollAnims = [];
  }
  _$jscoverage['/base.js'].lineData[253]++;
  self.scrollToWithBounds({
  left: self.get('scrollLeft'), 
  top: self.get('scrollTop')});
}, 
  '_uiSetPageIndex': function(v) {
  _$jscoverage['/base.js'].functionData[12]++;
  _$jscoverage['/base.js'].lineData[260]++;
  this.scrollToPage(v);
}, 
  getPageIndexFromXY: function(v, allowX, direction) {
  _$jscoverage['/base.js'].functionData[13]++;
  _$jscoverage['/base.js'].lineData[264]++;
  var pagesOffset = this.pagesOffset.concat([]);
  _$jscoverage['/base.js'].lineData[265]++;
  var p2 = allowX ? 'left' : 'top';
  _$jscoverage['/base.js'].lineData[266]++;
  var i, offset;
  _$jscoverage['/base.js'].lineData[267]++;
  pagesOffset.sort(function(e1, e2) {
  _$jscoverage['/base.js'].functionData[14]++;
  _$jscoverage['/base.js'].lineData[268]++;
  return e1[p2] - e2[p2];
});
  _$jscoverage['/base.js'].lineData[270]++;
  if (visit48_270_1(direction > 0)) {
    _$jscoverage['/base.js'].lineData[271]++;
    for (i = 0; visit49_271_1(i < pagesOffset.length); i++) {
      _$jscoverage['/base.js'].lineData[272]++;
      offset = pagesOffset[i];
      _$jscoverage['/base.js'].lineData[273]++;
      if (visit50_273_1(offset[p2] >= v)) {
        _$jscoverage['/base.js'].lineData[274]++;
        return offset.index;
      }
    }
  } else {
    _$jscoverage['/base.js'].lineData[278]++;
    for (i = pagesOffset.length - 1; visit51_278_1(i >= 0); i--) {
      _$jscoverage['/base.js'].lineData[279]++;
      offset = pagesOffset[i];
      _$jscoverage['/base.js'].lineData[280]++;
      if (visit52_280_1(offset[p2] <= v)) {
        _$jscoverage['/base.js'].lineData[281]++;
        return offset.index;
      }
    }
  }
  _$jscoverage['/base.js'].lineData[285]++;
  return undefined;
}, 
  scrollToPage: function(index, animCfg) {
  _$jscoverage['/base.js'].functionData[15]++;
  _$jscoverage['/base.js'].lineData[289]++;
  var self = this, pageOffset;
  _$jscoverage['/base.js'].lineData[291]++;
  if (visit53_291_1((pageOffset = self.pagesOffset) && pageOffset[index])) {
    _$jscoverage['/base.js'].lineData[292]++;
    self.set('pageIndex', index);
    _$jscoverage['/base.js'].lineData[293]++;
    self.scrollTo(pageOffset[index], animCfg);
  }
}, 
  scrollToWithBounds: function(cfg, anim) {
  _$jscoverage['/base.js'].functionData[16]++;
  _$jscoverage['/base.js'].lineData[298]++;
  var self = this;
  _$jscoverage['/base.js'].lineData[299]++;
  var maxScroll = self.maxScroll;
  _$jscoverage['/base.js'].lineData[300]++;
  var minScroll = self.minScroll;
  _$jscoverage['/base.js'].lineData[301]++;
  if (visit54_301_1(cfg.left)) {
    _$jscoverage['/base.js'].lineData[302]++;
    cfg.left = Math.min(Math.max(cfg.left, minScroll.left), maxScroll.left);
  }
  _$jscoverage['/base.js'].lineData[304]++;
  if (visit55_304_1(cfg.top)) {
    _$jscoverage['/base.js'].lineData[305]++;
    cfg.top = Math.min(Math.max(cfg.top, minScroll.top), maxScroll.top);
  }
  _$jscoverage['/base.js'].lineData[307]++;
  self.scrollTo(cfg, anim);
}, 
  scrollTo: function(cfg, animCfg) {
  _$jscoverage['/base.js'].functionData[17]++;
  _$jscoverage['/base.js'].lineData[311]++;
  var self = this, left = cfg.left, top = cfg.top;
  _$jscoverage['/base.js'].lineData[314]++;
  if (visit56_314_1(animCfg)) {
    _$jscoverage['/base.js'].lineData[315]++;
    var node = {}, to = {};
    _$jscoverage['/base.js'].lineData[317]++;
    if (visit57_317_1(left !== undefined)) {
      _$jscoverage['/base.js'].lineData[318]++;
      to.scrollLeft = left;
      _$jscoverage['/base.js'].lineData[319]++;
      node.scrollLeft = self.get('scrollLeft');
    }
    _$jscoverage['/base.js'].lineData[321]++;
    if (visit58_321_1(top !== undefined)) {
      _$jscoverage['/base.js'].lineData[322]++;
      to.scrollTop = top;
      _$jscoverage['/base.js'].lineData[323]++;
      node.scrollTop = self.get('scrollTop');
    }
    _$jscoverage['/base.js'].lineData[325]++;
    animCfg.frame = frame;
    _$jscoverage['/base.js'].lineData[326]++;
    animCfg.node = node;
    _$jscoverage['/base.js'].lineData[327]++;
    animCfg.to = to;
    _$jscoverage['/base.js'].lineData[328]++;
    var anim;
    _$jscoverage['/base.js'].lineData[329]++;
    self.scrollAnims.push(anim = new Anim(animCfg));
    _$jscoverage['/base.js'].lineData[330]++;
    anim.scrollView = self;
    _$jscoverage['/base.js'].lineData[331]++;
    anim.run();
  } else {
    _$jscoverage['/base.js'].lineData[333]++;
    if (visit59_333_1(left !== undefined)) {
      _$jscoverage['/base.js'].lineData[334]++;
      self.set('scrollLeft', left);
    }
    _$jscoverage['/base.js'].lineData[336]++;
    if (visit60_336_1(top !== undefined)) {
      _$jscoverage['/base.js'].lineData[337]++;
      self.set('scrollTop', top);
    }
  }
}}, {
  ATTRS: {
  contentEl: {}, 
  scrollLeft: {
  view: 1, 
  value: 0}, 
  scrollTop: {
  view: 1, 
  value: 0}, 
  scrollWidth: {}, 
  scrollHeight: {}, 
  clientWidth: {}, 
  clientHeight: {}, 
  focusable: {
  value: true}, 
  allowTextSelection: {
  value: true}, 
  handleGestureEvents: {
  value: false}, 
  snap: {
  value: false}, 
  pageIndex: {
  value: 0}, 
  xrender: {
  value: Render}}, 
  xclass: 'scroll-view'});
});
