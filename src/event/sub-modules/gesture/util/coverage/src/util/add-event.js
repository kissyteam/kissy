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
if (! _$jscoverage['/util/add-event.js']) {
  _$jscoverage['/util/add-event.js'] = {};
  _$jscoverage['/util/add-event.js'].lineData = [];
  _$jscoverage['/util/add-event.js'].lineData[6] = 0;
  _$jscoverage['/util/add-event.js'].lineData[7] = 0;
  _$jscoverage['/util/add-event.js'].lineData[8] = 0;
  _$jscoverage['/util/add-event.js'].lineData[9] = 0;
  _$jscoverage['/util/add-event.js'].lineData[10] = 0;
  _$jscoverage['/util/add-event.js'].lineData[11] = 0;
  _$jscoverage['/util/add-event.js'].lineData[12] = 0;
  _$jscoverage['/util/add-event.js'].lineData[13] = 0;
  _$jscoverage['/util/add-event.js'].lineData[19] = 0;
  _$jscoverage['/util/add-event.js'].lineData[20] = 0;
  _$jscoverage['/util/add-event.js'].lineData[23] = 0;
  _$jscoverage['/util/add-event.js'].lineData[24] = 0;
  _$jscoverage['/util/add-event.js'].lineData[27] = 0;
  _$jscoverage['/util/add-event.js'].lineData[28] = 0;
  _$jscoverage['/util/add-event.js'].lineData[32] = 0;
  _$jscoverage['/util/add-event.js'].lineData[34] = 0;
  _$jscoverage['/util/add-event.js'].lineData[36] = 0;
  _$jscoverage['/util/add-event.js'].lineData[37] = 0;
  _$jscoverage['/util/add-event.js'].lineData[39] = 0;
  _$jscoverage['/util/add-event.js'].lineData[40] = 0;
  _$jscoverage['/util/add-event.js'].lineData[41] = 0;
  _$jscoverage['/util/add-event.js'].lineData[43] = 0;
  _$jscoverage['/util/add-event.js'].lineData[45] = 0;
  _$jscoverage['/util/add-event.js'].lineData[46] = 0;
  _$jscoverage['/util/add-event.js'].lineData[48] = 0;
  _$jscoverage['/util/add-event.js'].lineData[51] = 0;
  _$jscoverage['/util/add-event.js'].lineData[52] = 0;
  _$jscoverage['/util/add-event.js'].lineData[53] = 0;
  _$jscoverage['/util/add-event.js'].lineData[54] = 0;
  _$jscoverage['/util/add-event.js'].lineData[55] = 0;
  _$jscoverage['/util/add-event.js'].lineData[56] = 0;
  _$jscoverage['/util/add-event.js'].lineData[57] = 0;
  _$jscoverage['/util/add-event.js'].lineData[59] = 0;
  _$jscoverage['/util/add-event.js'].lineData[60] = 0;
  _$jscoverage['/util/add-event.js'].lineData[61] = 0;
  _$jscoverage['/util/add-event.js'].lineData[64] = 0;
  _$jscoverage['/util/add-event.js'].lineData[65] = 0;
  _$jscoverage['/util/add-event.js'].lineData[66] = 0;
  _$jscoverage['/util/add-event.js'].lineData[67] = 0;
  _$jscoverage['/util/add-event.js'].lineData[68] = 0;
  _$jscoverage['/util/add-event.js'].lineData[70] = 0;
  _$jscoverage['/util/add-event.js'].lineData[72] = 0;
  _$jscoverage['/util/add-event.js'].lineData[75] = 0;
  _$jscoverage['/util/add-event.js'].lineData[83] = 0;
  _$jscoverage['/util/add-event.js'].lineData[85] = 0;
  _$jscoverage['/util/add-event.js'].lineData[87] = 0;
  _$jscoverage['/util/add-event.js'].lineData[88] = 0;
  _$jscoverage['/util/add-event.js'].lineData[90] = 0;
  _$jscoverage['/util/add-event.js'].lineData[94] = 0;
  _$jscoverage['/util/add-event.js'].lineData[95] = 0;
  _$jscoverage['/util/add-event.js'].lineData[99] = 0;
  _$jscoverage['/util/add-event.js'].lineData[104] = 0;
  _$jscoverage['/util/add-event.js'].lineData[105] = 0;
  _$jscoverage['/util/add-event.js'].lineData[106] = 0;
  _$jscoverage['/util/add-event.js'].lineData[107] = 0;
  _$jscoverage['/util/add-event.js'].lineData[108] = 0;
  _$jscoverage['/util/add-event.js'].lineData[114] = 0;
  _$jscoverage['/util/add-event.js'].lineData[119] = 0;
  _$jscoverage['/util/add-event.js'].lineData[120] = 0;
  _$jscoverage['/util/add-event.js'].lineData[121] = 0;
  _$jscoverage['/util/add-event.js'].lineData[122] = 0;
  _$jscoverage['/util/add-event.js'].lineData[128] = 0;
  _$jscoverage['/util/add-event.js'].lineData[132] = 0;
  _$jscoverage['/util/add-event.js'].lineData[133] = 0;
  _$jscoverage['/util/add-event.js'].lineData[138] = 0;
  _$jscoverage['/util/add-event.js'].lineData[139] = 0;
  _$jscoverage['/util/add-event.js'].lineData[145] = 0;
  _$jscoverage['/util/add-event.js'].lineData[146] = 0;
  _$jscoverage['/util/add-event.js'].lineData[148] = 0;
  _$jscoverage['/util/add-event.js'].lineData[150] = 0;
  _$jscoverage['/util/add-event.js'].lineData[151] = 0;
  _$jscoverage['/util/add-event.js'].lineData[152] = 0;
  _$jscoverage['/util/add-event.js'].lineData[153] = 0;
  _$jscoverage['/util/add-event.js'].lineData[154] = 0;
  _$jscoverage['/util/add-event.js'].lineData[155] = 0;
  _$jscoverage['/util/add-event.js'].lineData[163] = 0;
  _$jscoverage['/util/add-event.js'].lineData[164] = 0;
  _$jscoverage['/util/add-event.js'].lineData[166] = 0;
  _$jscoverage['/util/add-event.js'].lineData[168] = 0;
  _$jscoverage['/util/add-event.js'].lineData[170] = 0;
  _$jscoverage['/util/add-event.js'].lineData[171] = 0;
  _$jscoverage['/util/add-event.js'].lineData[174] = 0;
  _$jscoverage['/util/add-event.js'].lineData[178] = 0;
  _$jscoverage['/util/add-event.js'].lineData[182] = 0;
  _$jscoverage['/util/add-event.js'].lineData[183] = 0;
  _$jscoverage['/util/add-event.js'].lineData[186] = 0;
  _$jscoverage['/util/add-event.js'].lineData[188] = 0;
  _$jscoverage['/util/add-event.js'].lineData[189] = 0;
  _$jscoverage['/util/add-event.js'].lineData[190] = 0;
  _$jscoverage['/util/add-event.js'].lineData[191] = 0;
  _$jscoverage['/util/add-event.js'].lineData[193] = 0;
  _$jscoverage['/util/add-event.js'].lineData[195] = 0;
  _$jscoverage['/util/add-event.js'].lineData[196] = 0;
  _$jscoverage['/util/add-event.js'].lineData[197] = 0;
  _$jscoverage['/util/add-event.js'].lineData[198] = 0;
  _$jscoverage['/util/add-event.js'].lineData[200] = 0;
  _$jscoverage['/util/add-event.js'].lineData[201] = 0;
  _$jscoverage['/util/add-event.js'].lineData[203] = 0;
  _$jscoverage['/util/add-event.js'].lineData[204] = 0;
  _$jscoverage['/util/add-event.js'].lineData[205] = 0;
  _$jscoverage['/util/add-event.js'].lineData[206] = 0;
  _$jscoverage['/util/add-event.js'].lineData[207] = 0;
  _$jscoverage['/util/add-event.js'].lineData[211] = 0;
  _$jscoverage['/util/add-event.js'].lineData[215] = 0;
  _$jscoverage['/util/add-event.js'].lineData[216] = 0;
  _$jscoverage['/util/add-event.js'].lineData[217] = 0;
  _$jscoverage['/util/add-event.js'].lineData[218] = 0;
  _$jscoverage['/util/add-event.js'].lineData[219] = 0;
  _$jscoverage['/util/add-event.js'].lineData[220] = 0;
  _$jscoverage['/util/add-event.js'].lineData[222] = 0;
  _$jscoverage['/util/add-event.js'].lineData[223] = 0;
  _$jscoverage['/util/add-event.js'].lineData[224] = 0;
  _$jscoverage['/util/add-event.js'].lineData[225] = 0;
  _$jscoverage['/util/add-event.js'].lineData[226] = 0;
  _$jscoverage['/util/add-event.js'].lineData[229] = 0;
  _$jscoverage['/util/add-event.js'].lineData[232] = 0;
  _$jscoverage['/util/add-event.js'].lineData[233] = 0;
  _$jscoverage['/util/add-event.js'].lineData[234] = 0;
  _$jscoverage['/util/add-event.js'].lineData[235] = 0;
  _$jscoverage['/util/add-event.js'].lineData[238] = 0;
  _$jscoverage['/util/add-event.js'].lineData[242] = 0;
  _$jscoverage['/util/add-event.js'].lineData[244] = 0;
  _$jscoverage['/util/add-event.js'].lineData[245] = 0;
  _$jscoverage['/util/add-event.js'].lineData[246] = 0;
  _$jscoverage['/util/add-event.js'].lineData[248] = 0;
  _$jscoverage['/util/add-event.js'].lineData[249] = 0;
  _$jscoverage['/util/add-event.js'].lineData[250] = 0;
  _$jscoverage['/util/add-event.js'].lineData[251] = 0;
  _$jscoverage['/util/add-event.js'].lineData[252] = 0;
  _$jscoverage['/util/add-event.js'].lineData[255] = 0;
  _$jscoverage['/util/add-event.js'].lineData[259] = 0;
  _$jscoverage['/util/add-event.js'].lineData[261] = 0;
  _$jscoverage['/util/add-event.js'].lineData[262] = 0;
  _$jscoverage['/util/add-event.js'].lineData[263] = 0;
  _$jscoverage['/util/add-event.js'].lineData[267] = 0;
  _$jscoverage['/util/add-event.js'].lineData[268] = 0;
  _$jscoverage['/util/add-event.js'].lineData[269] = 0;
  _$jscoverage['/util/add-event.js'].lineData[270] = 0;
  _$jscoverage['/util/add-event.js'].lineData[271] = 0;
  _$jscoverage['/util/add-event.js'].lineData[273] = 0;
  _$jscoverage['/util/add-event.js'].lineData[274] = 0;
  _$jscoverage['/util/add-event.js'].lineData[275] = 0;
  _$jscoverage['/util/add-event.js'].lineData[276] = 0;
  _$jscoverage['/util/add-event.js'].lineData[277] = 0;
  _$jscoverage['/util/add-event.js'].lineData[278] = 0;
  _$jscoverage['/util/add-event.js'].lineData[284] = 0;
  _$jscoverage['/util/add-event.js'].lineData[289] = 0;
  _$jscoverage['/util/add-event.js'].lineData[290] = 0;
  _$jscoverage['/util/add-event.js'].lineData[292] = 0;
  _$jscoverage['/util/add-event.js'].lineData[293] = 0;
  _$jscoverage['/util/add-event.js'].lineData[295] = 0;
  _$jscoverage['/util/add-event.js'].lineData[296] = 0;
  _$jscoverage['/util/add-event.js'].lineData[297] = 0;
  _$jscoverage['/util/add-event.js'].lineData[299] = 0;
  _$jscoverage['/util/add-event.js'].lineData[302] = 0;
  _$jscoverage['/util/add-event.js'].lineData[303] = 0;
  _$jscoverage['/util/add-event.js'].lineData[306] = 0;
  _$jscoverage['/util/add-event.js'].lineData[307] = 0;
  _$jscoverage['/util/add-event.js'].lineData[309] = 0;
  _$jscoverage['/util/add-event.js'].lineData[310] = 0;
  _$jscoverage['/util/add-event.js'].lineData[311] = 0;
  _$jscoverage['/util/add-event.js'].lineData[316] = 0;
  _$jscoverage['/util/add-event.js'].lineData[317] = 0;
  _$jscoverage['/util/add-event.js'].lineData[318] = 0;
  _$jscoverage['/util/add-event.js'].lineData[319] = 0;
  _$jscoverage['/util/add-event.js'].lineData[320] = 0;
  _$jscoverage['/util/add-event.js'].lineData[326] = 0;
  _$jscoverage['/util/add-event.js'].lineData[329] = 0;
  _$jscoverage['/util/add-event.js'].lineData[330] = 0;
  _$jscoverage['/util/add-event.js'].lineData[332] = 0;
  _$jscoverage['/util/add-event.js'].lineData[333] = 0;
  _$jscoverage['/util/add-event.js'].lineData[334] = 0;
  _$jscoverage['/util/add-event.js'].lineData[342] = 0;
  _$jscoverage['/util/add-event.js'].lineData[343] = 0;
  _$jscoverage['/util/add-event.js'].lineData[344] = 0;
  _$jscoverage['/util/add-event.js'].lineData[345] = 0;
  _$jscoverage['/util/add-event.js'].lineData[350] = 0;
  _$jscoverage['/util/add-event.js'].lineData[351] = 0;
  _$jscoverage['/util/add-event.js'].lineData[352] = 0;
  _$jscoverage['/util/add-event.js'].lineData[353] = 0;
  _$jscoverage['/util/add-event.js'].lineData[354] = 0;
  _$jscoverage['/util/add-event.js'].lineData[355] = 0;
  _$jscoverage['/util/add-event.js'].lineData[361] = 0;
  _$jscoverage['/util/add-event.js'].lineData[363] = 0;
  _$jscoverage['/util/add-event.js'].lineData[364] = 0;
  _$jscoverage['/util/add-event.js'].lineData[365] = 0;
  _$jscoverage['/util/add-event.js'].lineData[369] = 0;
  _$jscoverage['/util/add-event.js'].lineData[370] = 0;
  _$jscoverage['/util/add-event.js'].lineData[373] = 0;
  _$jscoverage['/util/add-event.js'].lineData[374] = 0;
  _$jscoverage['/util/add-event.js'].lineData[377] = 0;
  _$jscoverage['/util/add-event.js'].lineData[378] = 0;
  _$jscoverage['/util/add-event.js'].lineData[379] = 0;
  _$jscoverage['/util/add-event.js'].lineData[382] = 0;
  _$jscoverage['/util/add-event.js'].lineData[383] = 0;
  _$jscoverage['/util/add-event.js'].lineData[384] = 0;
  _$jscoverage['/util/add-event.js'].lineData[387] = 0;
  _$jscoverage['/util/add-event.js'].lineData[388] = 0;
  _$jscoverage['/util/add-event.js'].lineData[390] = 0;
  _$jscoverage['/util/add-event.js'].lineData[391] = 0;
  _$jscoverage['/util/add-event.js'].lineData[393] = 0;
  _$jscoverage['/util/add-event.js'].lineData[394] = 0;
  _$jscoverage['/util/add-event.js'].lineData[398] = 0;
  _$jscoverage['/util/add-event.js'].lineData[399] = 0;
  _$jscoverage['/util/add-event.js'].lineData[401] = 0;
  _$jscoverage['/util/add-event.js'].lineData[402] = 0;
  _$jscoverage['/util/add-event.js'].lineData[403] = 0;
  _$jscoverage['/util/add-event.js'].lineData[405] = 0;
  _$jscoverage['/util/add-event.js'].lineData[406] = 0;
  _$jscoverage['/util/add-event.js'].lineData[407] = 0;
  _$jscoverage['/util/add-event.js'].lineData[412] = 0;
  _$jscoverage['/util/add-event.js'].lineData[413] = 0;
  _$jscoverage['/util/add-event.js'].lineData[414] = 0;
  _$jscoverage['/util/add-event.js'].lineData[416] = 0;
  _$jscoverage['/util/add-event.js'].lineData[417] = 0;
  _$jscoverage['/util/add-event.js'].lineData[418] = 0;
  _$jscoverage['/util/add-event.js'].lineData[419] = 0;
  _$jscoverage['/util/add-event.js'].lineData[420] = 0;
  _$jscoverage['/util/add-event.js'].lineData[421] = 0;
  _$jscoverage['/util/add-event.js'].lineData[422] = 0;
  _$jscoverage['/util/add-event.js'].lineData[424] = 0;
  _$jscoverage['/util/add-event.js'].lineData[425] = 0;
}
if (! _$jscoverage['/util/add-event.js'].functionData) {
  _$jscoverage['/util/add-event.js'].functionData = [];
  _$jscoverage['/util/add-event.js'].functionData[0] = 0;
  _$jscoverage['/util/add-event.js'].functionData[1] = 0;
  _$jscoverage['/util/add-event.js'].functionData[2] = 0;
  _$jscoverage['/util/add-event.js'].functionData[3] = 0;
  _$jscoverage['/util/add-event.js'].functionData[4] = 0;
  _$jscoverage['/util/add-event.js'].functionData[5] = 0;
  _$jscoverage['/util/add-event.js'].functionData[6] = 0;
  _$jscoverage['/util/add-event.js'].functionData[7] = 0;
  _$jscoverage['/util/add-event.js'].functionData[8] = 0;
  _$jscoverage['/util/add-event.js'].functionData[9] = 0;
  _$jscoverage['/util/add-event.js'].functionData[10] = 0;
  _$jscoverage['/util/add-event.js'].functionData[11] = 0;
  _$jscoverage['/util/add-event.js'].functionData[12] = 0;
  _$jscoverage['/util/add-event.js'].functionData[13] = 0;
  _$jscoverage['/util/add-event.js'].functionData[14] = 0;
  _$jscoverage['/util/add-event.js'].functionData[15] = 0;
  _$jscoverage['/util/add-event.js'].functionData[16] = 0;
  _$jscoverage['/util/add-event.js'].functionData[17] = 0;
  _$jscoverage['/util/add-event.js'].functionData[18] = 0;
  _$jscoverage['/util/add-event.js'].functionData[19] = 0;
  _$jscoverage['/util/add-event.js'].functionData[20] = 0;
  _$jscoverage['/util/add-event.js'].functionData[21] = 0;
  _$jscoverage['/util/add-event.js'].functionData[22] = 0;
  _$jscoverage['/util/add-event.js'].functionData[23] = 0;
  _$jscoverage['/util/add-event.js'].functionData[24] = 0;
  _$jscoverage['/util/add-event.js'].functionData[25] = 0;
  _$jscoverage['/util/add-event.js'].functionData[26] = 0;
  _$jscoverage['/util/add-event.js'].functionData[27] = 0;
  _$jscoverage['/util/add-event.js'].functionData[28] = 0;
  _$jscoverage['/util/add-event.js'].functionData[29] = 0;
  _$jscoverage['/util/add-event.js'].functionData[30] = 0;
  _$jscoverage['/util/add-event.js'].functionData[31] = 0;
  _$jscoverage['/util/add-event.js'].functionData[32] = 0;
  _$jscoverage['/util/add-event.js'].functionData[33] = 0;
}
if (! _$jscoverage['/util/add-event.js'].branchData) {
  _$jscoverage['/util/add-event.js'].branchData = {};
  _$jscoverage['/util/add-event.js'].branchData['28'] = [];
  _$jscoverage['/util/add-event.js'].branchData['28'][1] = new BranchData();
  _$jscoverage['/util/add-event.js'].branchData['36'] = [];
  _$jscoverage['/util/add-event.js'].branchData['36'][1] = new BranchData();
  _$jscoverage['/util/add-event.js'].branchData['37'] = [];
  _$jscoverage['/util/add-event.js'].branchData['37'][1] = new BranchData();
  _$jscoverage['/util/add-event.js'].branchData['48'] = [];
  _$jscoverage['/util/add-event.js'].branchData['48'][1] = new BranchData();
  _$jscoverage['/util/add-event.js'].branchData['54'] = [];
  _$jscoverage['/util/add-event.js'].branchData['54'][1] = new BranchData();
  _$jscoverage['/util/add-event.js'].branchData['87'] = [];
  _$jscoverage['/util/add-event.js'].branchData['87'][1] = new BranchData();
  _$jscoverage['/util/add-event.js'].branchData['104'] = [];
  _$jscoverage['/util/add-event.js'].branchData['104'][1] = new BranchData();
  _$jscoverage['/util/add-event.js'].branchData['106'] = [];
  _$jscoverage['/util/add-event.js'].branchData['106'][1] = new BranchData();
  _$jscoverage['/util/add-event.js'].branchData['119'] = [];
  _$jscoverage['/util/add-event.js'].branchData['119'][1] = new BranchData();
  _$jscoverage['/util/add-event.js'].branchData['121'] = [];
  _$jscoverage['/util/add-event.js'].branchData['121'][1] = new BranchData();
  _$jscoverage['/util/add-event.js'].branchData['128'] = [];
  _$jscoverage['/util/add-event.js'].branchData['128'][1] = new BranchData();
  _$jscoverage['/util/add-event.js'].branchData['132'] = [];
  _$jscoverage['/util/add-event.js'].branchData['132'][1] = new BranchData();
  _$jscoverage['/util/add-event.js'].branchData['138'] = [];
  _$jscoverage['/util/add-event.js'].branchData['138'][1] = new BranchData();
  _$jscoverage['/util/add-event.js'].branchData['148'] = [];
  _$jscoverage['/util/add-event.js'].branchData['148'][1] = new BranchData();
  _$jscoverage['/util/add-event.js'].branchData['154'] = [];
  _$jscoverage['/util/add-event.js'].branchData['154'][1] = new BranchData();
  _$jscoverage['/util/add-event.js'].branchData['166'] = [];
  _$jscoverage['/util/add-event.js'].branchData['166'][1] = new BranchData();
  _$jscoverage['/util/add-event.js'].branchData['166'][2] = new BranchData();
  _$jscoverage['/util/add-event.js'].branchData['170'] = [];
  _$jscoverage['/util/add-event.js'].branchData['170'][1] = new BranchData();
  _$jscoverage['/util/add-event.js'].branchData['170'][2] = new BranchData();
  _$jscoverage['/util/add-event.js'].branchData['170'][3] = new BranchData();
  _$jscoverage['/util/add-event.js'].branchData['183'] = [];
  _$jscoverage['/util/add-event.js'].branchData['183'][1] = new BranchData();
  _$jscoverage['/util/add-event.js'].branchData['183'][2] = new BranchData();
  _$jscoverage['/util/add-event.js'].branchData['183'][3] = new BranchData();
  _$jscoverage['/util/add-event.js'].branchData['188'] = [];
  _$jscoverage['/util/add-event.js'].branchData['188'][1] = new BranchData();
  _$jscoverage['/util/add-event.js'].branchData['190'] = [];
  _$jscoverage['/util/add-event.js'].branchData['190'][1] = new BranchData();
  _$jscoverage['/util/add-event.js'].branchData['195'] = [];
  _$jscoverage['/util/add-event.js'].branchData['195'][1] = new BranchData();
  _$jscoverage['/util/add-event.js'].branchData['195'][2] = new BranchData();
  _$jscoverage['/util/add-event.js'].branchData['200'] = [];
  _$jscoverage['/util/add-event.js'].branchData['200'][1] = new BranchData();
  _$jscoverage['/util/add-event.js'].branchData['215'] = [];
  _$jscoverage['/util/add-event.js'].branchData['215'][1] = new BranchData();
  _$jscoverage['/util/add-event.js'].branchData['218'] = [];
  _$jscoverage['/util/add-event.js'].branchData['218'][1] = new BranchData();
  _$jscoverage['/util/add-event.js'].branchData['219'] = [];
  _$jscoverage['/util/add-event.js'].branchData['219'][1] = new BranchData();
  _$jscoverage['/util/add-event.js'].branchData['223'] = [];
  _$jscoverage['/util/add-event.js'].branchData['223'][1] = new BranchData();
  _$jscoverage['/util/add-event.js'].branchData['225'] = [];
  _$jscoverage['/util/add-event.js'].branchData['225'][1] = new BranchData();
  _$jscoverage['/util/add-event.js'].branchData['232'] = [];
  _$jscoverage['/util/add-event.js'].branchData['232'][1] = new BranchData();
  _$jscoverage['/util/add-event.js'].branchData['244'] = [];
  _$jscoverage['/util/add-event.js'].branchData['244'][1] = new BranchData();
  _$jscoverage['/util/add-event.js'].branchData['245'] = [];
  _$jscoverage['/util/add-event.js'].branchData['245'][1] = new BranchData();
  _$jscoverage['/util/add-event.js'].branchData['249'] = [];
  _$jscoverage['/util/add-event.js'].branchData['249'][1] = new BranchData();
  _$jscoverage['/util/add-event.js'].branchData['251'] = [];
  _$jscoverage['/util/add-event.js'].branchData['251'][1] = new BranchData();
  _$jscoverage['/util/add-event.js'].branchData['261'] = [];
  _$jscoverage['/util/add-event.js'].branchData['261'][1] = new BranchData();
  _$jscoverage['/util/add-event.js'].branchData['262'] = [];
  _$jscoverage['/util/add-event.js'].branchData['262'][1] = new BranchData();
  _$jscoverage['/util/add-event.js'].branchData['268'] = [];
  _$jscoverage['/util/add-event.js'].branchData['268'][1] = new BranchData();
  _$jscoverage['/util/add-event.js'].branchData['273'] = [];
  _$jscoverage['/util/add-event.js'].branchData['273'][1] = new BranchData();
  _$jscoverage['/util/add-event.js'].branchData['275'] = [];
  _$jscoverage['/util/add-event.js'].branchData['275'][1] = new BranchData();
  _$jscoverage['/util/add-event.js'].branchData['277'] = [];
  _$jscoverage['/util/add-event.js'].branchData['277'][1] = new BranchData();
  _$jscoverage['/util/add-event.js'].branchData['292'] = [];
  _$jscoverage['/util/add-event.js'].branchData['292'][1] = new BranchData();
  _$jscoverage['/util/add-event.js'].branchData['295'] = [];
  _$jscoverage['/util/add-event.js'].branchData['295'][1] = new BranchData();
  _$jscoverage['/util/add-event.js'].branchData['297'] = [];
  _$jscoverage['/util/add-event.js'].branchData['297'][1] = new BranchData();
  _$jscoverage['/util/add-event.js'].branchData['302'] = [];
  _$jscoverage['/util/add-event.js'].branchData['302'][1] = new BranchData();
  _$jscoverage['/util/add-event.js'].branchData['302'][2] = new BranchData();
  _$jscoverage['/util/add-event.js'].branchData['306'] = [];
  _$jscoverage['/util/add-event.js'].branchData['306'][1] = new BranchData();
  _$jscoverage['/util/add-event.js'].branchData['310'] = [];
  _$jscoverage['/util/add-event.js'].branchData['310'][1] = new BranchData();
  _$jscoverage['/util/add-event.js'].branchData['310'][2] = new BranchData();
  _$jscoverage['/util/add-event.js'].branchData['310'][3] = new BranchData();
  _$jscoverage['/util/add-event.js'].branchData['316'] = [];
  _$jscoverage['/util/add-event.js'].branchData['316'][1] = new BranchData();
  _$jscoverage['/util/add-event.js'].branchData['318'] = [];
  _$jscoverage['/util/add-event.js'].branchData['318'][1] = new BranchData();
  _$jscoverage['/util/add-event.js'].branchData['329'] = [];
  _$jscoverage['/util/add-event.js'].branchData['329'][1] = new BranchData();
  _$jscoverage['/util/add-event.js'].branchData['351'] = [];
  _$jscoverage['/util/add-event.js'].branchData['351'][1] = new BranchData();
  _$jscoverage['/util/add-event.js'].branchData['353'] = [];
  _$jscoverage['/util/add-event.js'].branchData['353'][1] = new BranchData();
  _$jscoverage['/util/add-event.js'].branchData['390'] = [];
  _$jscoverage['/util/add-event.js'].branchData['390'][1] = new BranchData();
  _$jscoverage['/util/add-event.js'].branchData['393'] = [];
  _$jscoverage['/util/add-event.js'].branchData['393'][1] = new BranchData();
  _$jscoverage['/util/add-event.js'].branchData['401'] = [];
  _$jscoverage['/util/add-event.js'].branchData['401'][1] = new BranchData();
  _$jscoverage['/util/add-event.js'].branchData['402'] = [];
  _$jscoverage['/util/add-event.js'].branchData['402'][1] = new BranchData();
  _$jscoverage['/util/add-event.js'].branchData['405'] = [];
  _$jscoverage['/util/add-event.js'].branchData['405'][1] = new BranchData();
  _$jscoverage['/util/add-event.js'].branchData['413'] = [];
  _$jscoverage['/util/add-event.js'].branchData['413'][1] = new BranchData();
  _$jscoverage['/util/add-event.js'].branchData['422'] = [];
  _$jscoverage['/util/add-event.js'].branchData['422'][1] = new BranchData();
}
_$jscoverage['/util/add-event.js'].branchData['422'][1].init(309, 19, 'config.order || 100');
function visit65_422_1(result) {
  _$jscoverage['/util/add-event.js'].branchData['422'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/add-event.js'].branchData['413'][1].init(14, 26, 'typeof events === \'string\'');
function visit64_413_1(result) {
  _$jscoverage['/util/add-event.js'].branchData['413'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/add-event.js'].branchData['405'][1].init(109, 27, '!handle.eventHandles.length');
function visit63_405_1(result) {
  _$jscoverage['/util/add-event.js'].branchData['405'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/add-event.js'].branchData['402'][1].init(18, 5, 'event');
function visit62_402_1(result) {
  _$jscoverage['/util/add-event.js'].branchData['402'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/add-event.js'].branchData['401'][1].init(96, 6, 'handle');
function visit61_401_1(result) {
  _$jscoverage['/util/add-event.js'].branchData['401'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/add-event.js'].branchData['393'][1].init(199, 5, 'event');
function visit60_393_1(result) {
  _$jscoverage['/util/add-event.js'].branchData['393'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/add-event.js'].branchData['390'][1].init(96, 7, '!handle');
function visit59_390_1(result) {
  _$jscoverage['/util/add-event.js'].branchData['390'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/add-event.js'].branchData['353'][1].init(68, 26, '!eventHandles[event].count');
function visit58_353_1(result) {
  _$jscoverage['/util/add-event.js'].branchData['353'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/add-event.js'].branchData['351'][1].init(69, 19, 'eventHandles[event]');
function visit57_351_1(result) {
  _$jscoverage['/util/add-event.js'].branchData['351'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/add-event.js'].branchData['329'][1].init(155, 19, 'eventHandles[event]');
function visit56_329_1(result) {
  _$jscoverage['/util/add-event.js'].branchData['329'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/add-event.js'].branchData['318'][1].init(60, 15, 'eventHandles[e]');
function visit55_318_1(result) {
  _$jscoverage['/util/add-event.js'].branchData['318'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/add-event.js'].branchData['316'][1].init(1245, 5, 'i < l');
function visit54_316_1(result) {
  _$jscoverage['/util/add-event.js'].branchData['316'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/add-event.js'].branchData['310'][3].init(500, 26, 'h[method](event) === false');
function visit53_310_3(result) {
  _$jscoverage['/util/add-event.js'].branchData['310'][3].ranCondition(result);
  return result;
}_$jscoverage['/util/add-event.js'].branchData['310'][2].init(487, 39, 'h[method] && h[method](event) === false');
function visit52_310_2(result) {
  _$jscoverage['/util/add-event.js'].branchData['310'][2].ranCondition(result);
  return result;
}_$jscoverage['/util/add-event.js'].branchData['310'][1].init(473, 53, 'h.isActive && h[method] && h[method](event) === false');
function visit51_310_1(result) {
  _$jscoverage['/util/add-event.js'].branchData['310'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/add-event.js'].branchData['306'][1].init(337, 11, 'h.processed');
function visit50_306_1(result) {
  _$jscoverage['/util/add-event.js'].branchData['306'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/add-event.js'].branchData['302'][2].init(211, 37, 'gestureType !== h.requiredGestureType');
function visit49_302_2(result) {
  _$jscoverage['/util/add-event.js'].branchData['302'][2].ranCondition(result);
  return result;
}_$jscoverage['/util/add-event.js'].branchData['302'][1].init(186, 62, 'h.requiredGestureType && gestureType !== h.requiredGestureType');
function visit48_302_1(result) {
  _$jscoverage['/util/add-event.js'].branchData['302'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/add-event.js'].branchData['297'][1].init(59, 15, 'eventHandles[e]');
function visit47_297_1(result) {
  _$jscoverage['/util/add-event.js'].branchData['297'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/add-event.js'].branchData['295'][1].init(476, 5, 'i < l');
function visit46_295_1(result) {
  _$jscoverage['/util/add-event.js'].branchData['295'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/add-event.js'].branchData['292'][1].init(351, 28, '!event.changedTouches.length');
function visit45_292_1(result) {
  _$jscoverage['/util/add-event.js'].branchData['292'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/add-event.js'].branchData['277'][1].init(78, 20, '!self.touches.length');
function visit44_277_1(result) {
  _$jscoverage['/util/add-event.js'].branchData['277'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/add-event.js'].branchData['275'][1].init(630, 20, 'isPointerEvent(type)');
function visit43_275_1(result) {
  _$jscoverage['/util/add-event.js'].branchData['275'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/add-event.js'].branchData['273'][1].init(547, 18, 'isMouseEvent(type)');
function visit42_273_1(result) {
  _$jscoverage['/util/add-event.js'].branchData['273'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/add-event.js'].branchData['268'][1].init(306, 18, 'isTouchEvent(type)');
function visit41_268_1(result) {
  _$jscoverage['/util/add-event.js'].branchData['268'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/add-event.js'].branchData['262'][1].init(22, 37, 'self.isEventSimulatedFromTouch(event)');
function visit40_262_1(result) {
  _$jscoverage['/util/add-event.js'].branchData['262'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/add-event.js'].branchData['261'][1].init(84, 18, 'isMouseEvent(type)');
function visit39_261_1(result) {
  _$jscoverage['/util/add-event.js'].branchData['261'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/add-event.js'].branchData['251'][1].init(386, 19, '!isTouchEvent(type)');
function visit38_251_1(result) {
  _$jscoverage['/util/add-event.js'].branchData['251'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/add-event.js'].branchData['249'][1].init(281, 20, 'isPointerEvent(type)');
function visit37_249_1(result) {
  _$jscoverage['/util/add-event.js'].branchData['249'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/add-event.js'].branchData['245'][1].init(22, 36, 'self.isEventSimulatedFromTouch(type)');
function visit36_245_1(result) {
  _$jscoverage['/util/add-event.js'].branchData['245'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/add-event.js'].branchData['244'][1].init(84, 18, 'isMouseEvent(type)');
function visit35_244_1(result) {
  _$jscoverage['/util/add-event.js'].branchData['244'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/add-event.js'].branchData['232'][1].init(906, 5, 'i < l');
function visit34_232_1(result) {
  _$jscoverage['/util/add-event.js'].branchData['232'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/add-event.js'].branchData['225'][1].init(75, 25, 'self.touches.length === 1');
function visit33_225_1(result) {
  _$jscoverage['/util/add-event.js'].branchData['225'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/add-event.js'].branchData['223'][1].init(506, 20, 'isPointerEvent(type)');
function visit32_223_1(result) {
  _$jscoverage['/util/add-event.js'].branchData['223'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/add-event.js'].branchData['219'][1].init(22, 37, 'self.isEventSimulatedFromTouch(event)');
function visit31_219_1(result) {
  _$jscoverage['/util/add-event.js'].branchData['219'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/add-event.js'].branchData['218'][1].init(308, 18, 'isMouseEvent(type)');
function visit30_218_1(result) {
  _$jscoverage['/util/add-event.js'].branchData['218'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/add-event.js'].branchData['215'][1].init(158, 18, 'isTouchEvent(type)');
function visit29_215_1(result) {
  _$jscoverage['/util/add-event.js'].branchData['215'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/add-event.js'].branchData['200'][1].init(879, 10, 'touchEvent');
function visit28_200_1(result) {
  _$jscoverage['/util/add-event.js'].branchData['200'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/add-event.js'].branchData['195'][2].init(697, 22, 'touchList.length === 1');
function visit27_195_2(result) {
  _$jscoverage['/util/add-event.js'].branchData['195'][2].ranCondition(result);
  return result;
}_$jscoverage['/util/add-event.js'].branchData['195'][1].init(684, 35, 'touchList && touchList.length === 1');
function visit26_195_1(result) {
  _$jscoverage['/util/add-event.js'].branchData['195'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/add-event.js'].branchData['190'][1].init(141, 18, 'isMouseEvent(type)');
function visit25_190_1(result) {
  _$jscoverage['/util/add-event.js'].branchData['190'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/add-event.js'].branchData['188'][1].init(22, 20, 'isPointerEvent(type)');
function visit24_188_1(result) {
  _$jscoverage['/util/add-event.js'].branchData['188'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/add-event.js'].branchData['183'][3].init(54, 22, 'type === \'touchcancel\'');
function visit23_183_3(result) {
  _$jscoverage['/util/add-event.js'].branchData['183'][3].ranCondition(result);
  return result;
}_$jscoverage['/util/add-event.js'].branchData['183'][2].init(31, 19, 'type === \'touchend\'');
function visit22_183_2(result) {
  _$jscoverage['/util/add-event.js'].branchData['183'][2].ranCondition(result);
  return result;
}_$jscoverage['/util/add-event.js'].branchData['183'][1].init(31, 45, 'type === \'touchend\' || type === \'touchcancel\'');
function visit21_183_1(result) {
  _$jscoverage['/util/add-event.js'].branchData['183'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/add-event.js'].branchData['170'][3].init(215, 14, 'dy <= DUP_DIST');
function visit20_170_3(result) {
  _$jscoverage['/util/add-event.js'].branchData['170'][3].ranCondition(result);
  return result;
}_$jscoverage['/util/add-event.js'].branchData['170'][2].init(197, 14, 'dx <= DUP_DIST');
function visit19_170_2(result) {
  _$jscoverage['/util/add-event.js'].branchData['170'][2].ranCondition(result);
  return result;
}_$jscoverage['/util/add-event.js'].branchData['170'][1].init(197, 32, 'dx <= DUP_DIST && dy <= DUP_DIST');
function visit18_170_1(result) {
  _$jscoverage['/util/add-event.js'].branchData['170'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/add-event.js'].branchData['166'][2].init(166, 5, 'i < l');
function visit17_166_2(result) {
  _$jscoverage['/util/add-event.js'].branchData['166'][2].ranCondition(result);
  return result;
}_$jscoverage['/util/add-event.js'].branchData['166'][1].init(166, 21, 'i < l && (t = lts[i])');
function visit16_166_1(result) {
  _$jscoverage['/util/add-event.js'].branchData['166'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/add-event.js'].branchData['154'][1].init(72, 6, 'i > -1');
function visit15_154_1(result) {
  _$jscoverage['/util/add-event.js'].branchData['154'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/add-event.js'].branchData['148'][1].init(169, 22, 'this.isPrimaryTouch(t)');
function visit14_148_1(result) {
  _$jscoverage['/util/add-event.js'].branchData['148'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/add-event.js'].branchData['138'][1].init(18, 28, 'this.isPrimaryTouch(inTouch)');
function visit13_138_1(result) {
  _$jscoverage['/util/add-event.js'].branchData['138'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/add-event.js'].branchData['132'][1].init(18, 24, 'this.firstTouch === null');
function visit12_132_1(result) {
  _$jscoverage['/util/add-event.js'].branchData['132'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/add-event.js'].branchData['128'][1].init(21, 38, 'this.firstTouch === inTouch.identifier');
function visit11_128_1(result) {
  _$jscoverage['/util/add-event.js'].branchData['128'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/add-event.js'].branchData['121'][1].init(59, 29, 'touch.pointerId === pointerId');
function visit10_121_1(result) {
  _$jscoverage['/util/add-event.js'].branchData['121'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/add-event.js'].branchData['119'][1].init(201, 5, 'i < l');
function visit9_119_1(result) {
  _$jscoverage['/util/add-event.js'].branchData['119'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/add-event.js'].branchData['106'][1].init(59, 29, 'touch.pointerId === pointerId');
function visit8_106_1(result) {
  _$jscoverage['/util/add-event.js'].branchData['106'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/add-event.js'].branchData['104'][1].init(201, 5, 'i < l');
function visit7_104_1(result) {
  _$jscoverage['/util/add-event.js'].branchData['104'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/add-event.js'].branchData['87'][1].init(224, 33, '!isPointerEvent(gestureMoveEvent)');
function visit6_87_1(result) {
  _$jscoverage['/util/add-event.js'].branchData['87'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/add-event.js'].branchData['54'][1].init(1688, 30, 'Feature.isMsPointerSupported()');
function visit5_54_1(result) {
  _$jscoverage['/util/add-event.js'].branchData['54'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/add-event.js'].branchData['48'][1].init(1404, 28, 'Feature.isPointerSupported()');
function visit4_48_1(result) {
  _$jscoverage['/util/add-event.js'].branchData['48'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/add-event.js'].branchData['37'][1].init(14, 6, 'UA.ios');
function visit3_37_1(result) {
  _$jscoverage['/util/add-event.js'].branchData['37'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/add-event.js'].branchData['36'][1].init(895, 31, 'Feature.isTouchEventSupported()');
function visit2_36_1(result) {
  _$jscoverage['/util/add-event.js'].branchData['36'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/add-event.js'].branchData['28'][1].init(17, 70, 'util.startsWith(type, \'MSPointer\') || util.startsWith(type, \'pointer\')');
function visit1_28_1(result) {
  _$jscoverage['/util/add-event.js'].branchData['28'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/add-event.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/util/add-event.js'].functionData[0]++;
  _$jscoverage['/util/add-event.js'].lineData[7]++;
  var util = require('util');
  _$jscoverage['/util/add-event.js'].lineData[8]++;
  var Dom = require('dom');
  _$jscoverage['/util/add-event.js'].lineData[9]++;
  var eventHandleMap = {};
  _$jscoverage['/util/add-event.js'].lineData[10]++;
  var UA = require('ua');
  _$jscoverage['/util/add-event.js'].lineData[11]++;
  var DomEvent = require('event/dom/base');
  _$jscoverage['/util/add-event.js'].lineData[12]++;
  var Special = DomEvent.Special;
  _$jscoverage['/util/add-event.js'].lineData[13]++;
  var key = util.guid('touch-handle'), Feature = require('feature'), gestureStartEvent, gestureMoveEvent, gestureEndEvent;
  _$jscoverage['/util/add-event.js'].lineData[19]++;
  function isTouchEvent(type) {
    _$jscoverage['/util/add-event.js'].functionData[1]++;
    _$jscoverage['/util/add-event.js'].lineData[20]++;
    return util.startsWith(type, 'touch');
  }
  _$jscoverage['/util/add-event.js'].lineData[23]++;
  function isMouseEvent(type) {
    _$jscoverage['/util/add-event.js'].functionData[2]++;
    _$jscoverage['/util/add-event.js'].lineData[24]++;
    return util.startsWith(type, 'mouse');
  }
  _$jscoverage['/util/add-event.js'].lineData[27]++;
  function isPointerEvent(type) {
    _$jscoverage['/util/add-event.js'].functionData[3]++;
    _$jscoverage['/util/add-event.js'].lineData[28]++;
    return visit1_28_1(util.startsWith(type, 'MSPointer') || util.startsWith(type, 'pointer'));
  }
  _$jscoverage['/util/add-event.js'].lineData[32]++;
  var DUP_TIMEOUT = 2500;
  _$jscoverage['/util/add-event.js'].lineData[34]++;
  var DUP_DIST = 25;
  _$jscoverage['/util/add-event.js'].lineData[36]++;
  if (visit2_36_1(Feature.isTouchEventSupported())) {
    _$jscoverage['/util/add-event.js'].lineData[37]++;
    if (visit3_37_1(UA.ios)) {
      _$jscoverage['/util/add-event.js'].lineData[39]++;
      gestureEndEvent = 'touchend touchcancel';
      _$jscoverage['/util/add-event.js'].lineData[40]++;
      gestureStartEvent = 'touchstart';
      _$jscoverage['/util/add-event.js'].lineData[41]++;
      gestureMoveEvent = 'touchmove';
    } else {
      _$jscoverage['/util/add-event.js'].lineData[43]++;
      gestureEndEvent = 'touchend touchcancel mouseup';
      _$jscoverage['/util/add-event.js'].lineData[45]++;
      gestureStartEvent = 'touchstart mousedown';
      _$jscoverage['/util/add-event.js'].lineData[46]++;
      gestureMoveEvent = 'touchmove mousemove';
    }
  } else {
    _$jscoverage['/util/add-event.js'].lineData[48]++;
    if (visit4_48_1(Feature.isPointerSupported())) {
      _$jscoverage['/util/add-event.js'].lineData[51]++;
      gestureStartEvent = 'pointerdown';
      _$jscoverage['/util/add-event.js'].lineData[52]++;
      gestureMoveEvent = 'pointermove';
      _$jscoverage['/util/add-event.js'].lineData[53]++;
      gestureEndEvent = 'pointerup pointercancel';
    } else {
      _$jscoverage['/util/add-event.js'].lineData[54]++;
      if (visit5_54_1(Feature.isMsPointerSupported())) {
        _$jscoverage['/util/add-event.js'].lineData[55]++;
        gestureStartEvent = 'MSPointerDown';
        _$jscoverage['/util/add-event.js'].lineData[56]++;
        gestureMoveEvent = 'MSPointerMove';
        _$jscoverage['/util/add-event.js'].lineData[57]++;
        gestureEndEvent = 'MSPointerUp MSPointerCancel';
      } else {
        _$jscoverage['/util/add-event.js'].lineData[59]++;
        gestureStartEvent = 'mousedown';
        _$jscoverage['/util/add-event.js'].lineData[60]++;
        gestureMoveEvent = 'mousemove';
        _$jscoverage['/util/add-event.js'].lineData[61]++;
        gestureEndEvent = 'mouseup';
      }
    }
  }
  _$jscoverage['/util/add-event.js'].lineData[64]++;
  function DocumentHandler(doc) {
    _$jscoverage['/util/add-event.js'].functionData[4]++;
    _$jscoverage['/util/add-event.js'].lineData[65]++;
    var self = this;
    _$jscoverage['/util/add-event.js'].lineData[66]++;
    self.doc = doc;
    _$jscoverage['/util/add-event.js'].lineData[67]++;
    self.eventHandles = [];
    _$jscoverage['/util/add-event.js'].lineData[68]++;
    self.init();
    _$jscoverage['/util/add-event.js'].lineData[70]++;
    self.touches = [];
    _$jscoverage['/util/add-event.js'].lineData[72]++;
    self.inTouch = 0;
  }
  _$jscoverage['/util/add-event.js'].lineData[75]++;
  DocumentHandler.prototype = {
  constructor: DocumentHandler, 
  lastTouches: [], 
  firstTouch: null, 
  init: function() {
  _$jscoverage['/util/add-event.js'].functionData[5]++;
  _$jscoverage['/util/add-event.js'].lineData[83]++;
  var self = this, doc = self.doc;
  _$jscoverage['/util/add-event.js'].lineData[85]++;
  DomEvent.on(doc, gestureStartEvent, self.onTouchStart, self);
  _$jscoverage['/util/add-event.js'].lineData[87]++;
  if (visit6_87_1(!isPointerEvent(gestureMoveEvent))) {
    _$jscoverage['/util/add-event.js'].lineData[88]++;
    DomEvent.on(doc, gestureMoveEvent, self.onTouchMove, self);
  }
  _$jscoverage['/util/add-event.js'].lineData[90]++;
  DomEvent.on(doc, gestureEndEvent, self.onTouchEnd, self);
}, 
  addTouch: function(originalEvent) {
  _$jscoverage['/util/add-event.js'].functionData[6]++;
  _$jscoverage['/util/add-event.js'].lineData[94]++;
  originalEvent.identifier = originalEvent.pointerId;
  _$jscoverage['/util/add-event.js'].lineData[95]++;
  this.touches.push(originalEvent);
}, 
  removeTouch: function(originalEvent) {
  _$jscoverage['/util/add-event.js'].functionData[7]++;
  _$jscoverage['/util/add-event.js'].lineData[99]++;
  var i = 0, touch, pointerId = originalEvent.pointerId, touches = this.touches, l = touches.length;
  _$jscoverage['/util/add-event.js'].lineData[104]++;
  for (; visit7_104_1(i < l); i++) {
    _$jscoverage['/util/add-event.js'].lineData[105]++;
    touch = touches[i];
    _$jscoverage['/util/add-event.js'].lineData[106]++;
    if (visit8_106_1(touch.pointerId === pointerId)) {
      _$jscoverage['/util/add-event.js'].lineData[107]++;
      touches.splice(i, 1);
      _$jscoverage['/util/add-event.js'].lineData[108]++;
      break;
    }
  }
}, 
  updateTouch: function(originalEvent) {
  _$jscoverage['/util/add-event.js'].functionData[8]++;
  _$jscoverage['/util/add-event.js'].lineData[114]++;
  var i = 0, touch, pointerId = originalEvent.pointerId, touches = this.touches, l = touches.length;
  _$jscoverage['/util/add-event.js'].lineData[119]++;
  for (; visit9_119_1(i < l); i++) {
    _$jscoverage['/util/add-event.js'].lineData[120]++;
    touch = touches[i];
    _$jscoverage['/util/add-event.js'].lineData[121]++;
    if (visit10_121_1(touch.pointerId === pointerId)) {
      _$jscoverage['/util/add-event.js'].lineData[122]++;
      touches[i] = originalEvent;
    }
  }
}, 
  isPrimaryTouch: function(inTouch) {
  _$jscoverage['/util/add-event.js'].functionData[9]++;
  _$jscoverage['/util/add-event.js'].lineData[128]++;
  return visit11_128_1(this.firstTouch === inTouch.identifier);
}, 
  setPrimaryTouch: function(inTouch) {
  _$jscoverage['/util/add-event.js'].functionData[10]++;
  _$jscoverage['/util/add-event.js'].lineData[132]++;
  if (visit12_132_1(this.firstTouch === null)) {
    _$jscoverage['/util/add-event.js'].lineData[133]++;
    this.firstTouch = inTouch.identifier;
  }
}, 
  removePrimaryTouch: function(inTouch) {
  _$jscoverage['/util/add-event.js'].functionData[11]++;
  _$jscoverage['/util/add-event.js'].lineData[138]++;
  if (visit13_138_1(this.isPrimaryTouch(inTouch))) {
    _$jscoverage['/util/add-event.js'].lineData[139]++;
    this.firstTouch = null;
  }
}, 
  dupMouse: function(inEvent) {
  _$jscoverage['/util/add-event.js'].functionData[12]++;
  _$jscoverage['/util/add-event.js'].lineData[145]++;
  var lts = this.lastTouches;
  _$jscoverage['/util/add-event.js'].lineData[146]++;
  var t = inEvent.changedTouches[0];
  _$jscoverage['/util/add-event.js'].lineData[148]++;
  if (visit14_148_1(this.isPrimaryTouch(t))) {
    _$jscoverage['/util/add-event.js'].lineData[150]++;
    var lt = {
  x: t.clientX, 
  y: t.clientY};
    _$jscoverage['/util/add-event.js'].lineData[151]++;
    lts.push(lt);
    _$jscoverage['/util/add-event.js'].lineData[152]++;
    setTimeout(function() {
  _$jscoverage['/util/add-event.js'].functionData[13]++;
  _$jscoverage['/util/add-event.js'].lineData[153]++;
  var i = lts.indexOf(lt);
  _$jscoverage['/util/add-event.js'].lineData[154]++;
  if (visit15_154_1(i > -1)) {
    _$jscoverage['/util/add-event.js'].lineData[155]++;
    lts.splice(i, 1);
  }
}, DUP_TIMEOUT);
  }
}, 
  isEventSimulatedFromTouch: function(inEvent) {
  _$jscoverage['/util/add-event.js'].functionData[14]++;
  _$jscoverage['/util/add-event.js'].lineData[163]++;
  var lts = this.lastTouches;
  _$jscoverage['/util/add-event.js'].lineData[164]++;
  var x = inEvent.clientX, y = inEvent.clientY;
  _$jscoverage['/util/add-event.js'].lineData[166]++;
  for (var i = 0, l = lts.length, t; visit16_166_1(visit17_166_2(i < l) && (t = lts[i])); i++) {
    _$jscoverage['/util/add-event.js'].lineData[168]++;
    var dx = Math.abs(x - t.x), dy = Math.abs(y - t.y);
    _$jscoverage['/util/add-event.js'].lineData[170]++;
    if (visit18_170_1(visit19_170_2(dx <= DUP_DIST) && visit20_170_3(dy <= DUP_DIST))) {
      _$jscoverage['/util/add-event.js'].lineData[171]++;
      return true;
    }
  }
  _$jscoverage['/util/add-event.js'].lineData[174]++;
  return 0;
}, 
  normalize: function(e) {
  _$jscoverage['/util/add-event.js'].functionData[15]++;
  _$jscoverage['/util/add-event.js'].lineData[178]++;
  var type = e.type, notUp, touchEvent, touchList;
  _$jscoverage['/util/add-event.js'].lineData[182]++;
  if ((touchEvent = isTouchEvent(type))) {
    _$jscoverage['/util/add-event.js'].lineData[183]++;
    touchList = (visit21_183_1(visit22_183_2(type === 'touchend') || visit23_183_3(type === 'touchcancel'))) ? e.changedTouches : e.touches;
    _$jscoverage['/util/add-event.js'].lineData[186]++;
    e.gestureType = 'touch';
  } else {
    _$jscoverage['/util/add-event.js'].lineData[188]++;
    if (visit24_188_1(isPointerEvent(type))) {
      _$jscoverage['/util/add-event.js'].lineData[189]++;
      e.gestureType = e.originalEvent.pointerType;
    } else {
      _$jscoverage['/util/add-event.js'].lineData[190]++;
      if (visit25_190_1(isMouseEvent(type))) {
        _$jscoverage['/util/add-event.js'].lineData[191]++;
        e.gestureType = 'mouse';
      }
    }
    _$jscoverage['/util/add-event.js'].lineData[193]++;
    touchList = this.touches;
  }
  _$jscoverage['/util/add-event.js'].lineData[195]++;
  if (visit26_195_1(touchList && visit27_195_2(touchList.length === 1))) {
    _$jscoverage['/util/add-event.js'].lineData[196]++;
    e.which = 1;
    _$jscoverage['/util/add-event.js'].lineData[197]++;
    e.pageX = touchList[0].pageX;
    _$jscoverage['/util/add-event.js'].lineData[198]++;
    e.pageY = touchList[0].pageY;
  }
  _$jscoverage['/util/add-event.js'].lineData[200]++;
  if (visit28_200_1(touchEvent)) {
    _$jscoverage['/util/add-event.js'].lineData[201]++;
    return e;
  }
  _$jscoverage['/util/add-event.js'].lineData[203]++;
  notUp = !type.match(/(up|cancel)$/i);
  _$jscoverage['/util/add-event.js'].lineData[204]++;
  e.touches = notUp ? touchList : [];
  _$jscoverage['/util/add-event.js'].lineData[205]++;
  e.targetTouches = notUp ? touchList : [];
  _$jscoverage['/util/add-event.js'].lineData[206]++;
  e.changedTouches = touchList;
  _$jscoverage['/util/add-event.js'].lineData[207]++;
  return e;
}, 
  onTouchStart: function(event) {
  _$jscoverage['/util/add-event.js'].functionData[16]++;
  _$jscoverage['/util/add-event.js'].lineData[211]++;
  var e, h, self = this, type = event.type, eventHandles = self.eventHandles;
  _$jscoverage['/util/add-event.js'].lineData[215]++;
  if (visit29_215_1(isTouchEvent(type))) {
    _$jscoverage['/util/add-event.js'].lineData[216]++;
    self.setPrimaryTouch(event.changedTouches[0]);
    _$jscoverage['/util/add-event.js'].lineData[217]++;
    self.dupMouse(event);
  } else {
    _$jscoverage['/util/add-event.js'].lineData[218]++;
    if (visit30_218_1(isMouseEvent(type))) {
      _$jscoverage['/util/add-event.js'].lineData[219]++;
      if (visit31_219_1(self.isEventSimulatedFromTouch(event))) {
        _$jscoverage['/util/add-event.js'].lineData[220]++;
        return;
      }
      _$jscoverage['/util/add-event.js'].lineData[222]++;
      self.touches = [event];
    } else {
      _$jscoverage['/util/add-event.js'].lineData[223]++;
      if (visit32_223_1(isPointerEvent(type))) {
        _$jscoverage['/util/add-event.js'].lineData[224]++;
        self.addTouch(event.originalEvent);
        _$jscoverage['/util/add-event.js'].lineData[225]++;
        if (visit33_225_1(self.touches.length === 1)) {
          _$jscoverage['/util/add-event.js'].lineData[226]++;
          DomEvent.on(self.doc, gestureMoveEvent, self.onTouchMove, self);
        }
      } else {
        _$jscoverage['/util/add-event.js'].lineData[229]++;
        throw new Error('unrecognized touch event: ' + event.type);
      }
    }
  }
  _$jscoverage['/util/add-event.js'].lineData[232]++;
  for (var i = 0, l = eventHandles.length; visit34_232_1(i < l); i++) {
    _$jscoverage['/util/add-event.js'].lineData[233]++;
    e = eventHandles[i];
    _$jscoverage['/util/add-event.js'].lineData[234]++;
    h = eventHandles[e].handle;
    _$jscoverage['/util/add-event.js'].lineData[235]++;
    h.isActive = 1;
  }
  _$jscoverage['/util/add-event.js'].lineData[238]++;
  self.callEventHandle('onTouchStart', event);
}, 
  onTouchMove: function(event) {
  _$jscoverage['/util/add-event.js'].functionData[17]++;
  _$jscoverage['/util/add-event.js'].lineData[242]++;
  var self = this, type = event.type;
  _$jscoverage['/util/add-event.js'].lineData[244]++;
  if (visit35_244_1(isMouseEvent(type))) {
    _$jscoverage['/util/add-event.js'].lineData[245]++;
    if (visit36_245_1(self.isEventSimulatedFromTouch(type))) {
      _$jscoverage['/util/add-event.js'].lineData[246]++;
      return;
    }
    _$jscoverage['/util/add-event.js'].lineData[248]++;
    self.touches = [event];
  } else {
    _$jscoverage['/util/add-event.js'].lineData[249]++;
    if (visit37_249_1(isPointerEvent(type))) {
      _$jscoverage['/util/add-event.js'].lineData[250]++;
      self.updateTouch(event.originalEvent);
    } else {
      _$jscoverage['/util/add-event.js'].lineData[251]++;
      if (visit38_251_1(!isTouchEvent(type))) {
        _$jscoverage['/util/add-event.js'].lineData[252]++;
        throw new Error('unrecognized touch event: ' + event.type);
      }
    }
  }
  _$jscoverage['/util/add-event.js'].lineData[255]++;
  self.callEventHandle('onTouchMove', event);
}, 
  onTouchEnd: function(event) {
  _$jscoverage['/util/add-event.js'].functionData[18]++;
  _$jscoverage['/util/add-event.js'].lineData[259]++;
  var self = this, type = event.type;
  _$jscoverage['/util/add-event.js'].lineData[261]++;
  if (visit39_261_1(isMouseEvent(type))) {
    _$jscoverage['/util/add-event.js'].lineData[262]++;
    if (visit40_262_1(self.isEventSimulatedFromTouch(event))) {
      _$jscoverage['/util/add-event.js'].lineData[263]++;
      return;
    }
  }
  _$jscoverage['/util/add-event.js'].lineData[267]++;
  self.callEventHandle('onTouchEnd', event);
  _$jscoverage['/util/add-event.js'].lineData[268]++;
  if (visit41_268_1(isTouchEvent(type))) {
    _$jscoverage['/util/add-event.js'].lineData[269]++;
    self.dupMouse(event);
    _$jscoverage['/util/add-event.js'].lineData[270]++;
    util.makeArray(event.changedTouches).forEach(function(touch) {
  _$jscoverage['/util/add-event.js'].functionData[19]++;
  _$jscoverage['/util/add-event.js'].lineData[271]++;
  self.removePrimaryTouch(touch);
});
  } else {
    _$jscoverage['/util/add-event.js'].lineData[273]++;
    if (visit42_273_1(isMouseEvent(type))) {
      _$jscoverage['/util/add-event.js'].lineData[274]++;
      self.touches = [];
    } else {
      _$jscoverage['/util/add-event.js'].lineData[275]++;
      if (visit43_275_1(isPointerEvent(type))) {
        _$jscoverage['/util/add-event.js'].lineData[276]++;
        self.removeTouch(event.originalEvent);
        _$jscoverage['/util/add-event.js'].lineData[277]++;
        if (visit44_277_1(!self.touches.length)) {
          _$jscoverage['/util/add-event.js'].lineData[278]++;
          DomEvent.detach(self.doc, gestureMoveEvent, self.onTouchMove, self);
        }
      }
    }
  }
}, 
  callEventHandle: function(method, event) {
  _$jscoverage['/util/add-event.js'].functionData[20]++;
  _$jscoverage['/util/add-event.js'].lineData[284]++;
  var self = this, eventHandles = self.eventHandles, handleArray = eventHandles.concat(), e, h;
  _$jscoverage['/util/add-event.js'].lineData[289]++;
  event = self.normalize(event);
  _$jscoverage['/util/add-event.js'].lineData[290]++;
  var gestureType = event.gestureType;
  _$jscoverage['/util/add-event.js'].lineData[292]++;
  if (visit45_292_1(!event.changedTouches.length)) {
    _$jscoverage['/util/add-event.js'].lineData[293]++;
    return;
  }
  _$jscoverage['/util/add-event.js'].lineData[295]++;
  for (var i = 0, l = handleArray.length; visit46_295_1(i < l); i++) {
    _$jscoverage['/util/add-event.js'].lineData[296]++;
    e = handleArray[i];
    _$jscoverage['/util/add-event.js'].lineData[297]++;
    if (visit47_297_1(eventHandles[e])) {
      _$jscoverage['/util/add-event.js'].lineData[299]++;
      h = eventHandles[e].handle;
      _$jscoverage['/util/add-event.js'].lineData[302]++;
      if (visit48_302_1(h.requiredGestureType && visit49_302_2(gestureType !== h.requiredGestureType))) {
        _$jscoverage['/util/add-event.js'].lineData[303]++;
        continue;
      }
      _$jscoverage['/util/add-event.js'].lineData[306]++;
      if (visit50_306_1(h.processed)) {
        _$jscoverage['/util/add-event.js'].lineData[307]++;
        continue;
      }
      _$jscoverage['/util/add-event.js'].lineData[309]++;
      h.processed = 1;
      _$jscoverage['/util/add-event.js'].lineData[310]++;
      if (visit51_310_1(h.isActive && visit52_310_2(h[method] && visit53_310_3(h[method](event) === false)))) {
        _$jscoverage['/util/add-event.js'].lineData[311]++;
        h.isActive = 0;
      }
    }
  }
  _$jscoverage['/util/add-event.js'].lineData[316]++;
  for (i = 0 , l = handleArray.length; visit54_316_1(i < l); i++) {
    _$jscoverage['/util/add-event.js'].lineData[317]++;
    e = eventHandles[i];
    _$jscoverage['/util/add-event.js'].lineData[318]++;
    if (visit55_318_1(eventHandles[e])) {
      _$jscoverage['/util/add-event.js'].lineData[319]++;
      h = eventHandles[e].handle;
      _$jscoverage['/util/add-event.js'].lineData[320]++;
      h.processed = 0;
    }
  }
}, 
  addEventHandle: function(event) {
  _$jscoverage['/util/add-event.js'].functionData[21]++;
  _$jscoverage['/util/add-event.js'].lineData[326]++;
  var self = this, eventHandles = self.eventHandles, handle = eventHandleMap[event].handle;
  _$jscoverage['/util/add-event.js'].lineData[329]++;
  if (visit56_329_1(eventHandles[event])) {
    _$jscoverage['/util/add-event.js'].lineData[330]++;
    eventHandles[event].count++;
  } else {
    _$jscoverage['/util/add-event.js'].lineData[332]++;
    eventHandles.push(event);
    _$jscoverage['/util/add-event.js'].lineData[333]++;
    self.sortEventHandles();
    _$jscoverage['/util/add-event.js'].lineData[334]++;
    eventHandles[event] = {
  count: 1, 
  handle: handle};
  }
}, 
  sortEventHandles: function() {
  _$jscoverage['/util/add-event.js'].functionData[22]++;
  _$jscoverage['/util/add-event.js'].lineData[342]++;
  this.eventHandles.sort(function(e1, e2) {
  _$jscoverage['/util/add-event.js'].functionData[23]++;
  _$jscoverage['/util/add-event.js'].lineData[343]++;
  var e1Config = eventHandleMap[e1];
  _$jscoverage['/util/add-event.js'].lineData[344]++;
  var e2Config = eventHandleMap[e2];
  _$jscoverage['/util/add-event.js'].lineData[345]++;
  return e1Config.order - e2Config.order;
});
}, 
  removeEventHandle: function(event) {
  _$jscoverage['/util/add-event.js'].functionData[24]++;
  _$jscoverage['/util/add-event.js'].lineData[350]++;
  var eventHandles = this.eventHandles;
  _$jscoverage['/util/add-event.js'].lineData[351]++;
  if (visit57_351_1(eventHandles[event])) {
    _$jscoverage['/util/add-event.js'].lineData[352]++;
    eventHandles[event].count--;
    _$jscoverage['/util/add-event.js'].lineData[353]++;
    if (visit58_353_1(!eventHandles[event].count)) {
      _$jscoverage['/util/add-event.js'].lineData[354]++;
      eventHandles.splice(util.indexOf(event, eventHandles), 1);
      _$jscoverage['/util/add-event.js'].lineData[355]++;
      delete eventHandles[event];
    }
  }
}, 
  destroy: function() {
  _$jscoverage['/util/add-event.js'].functionData[25]++;
  _$jscoverage['/util/add-event.js'].lineData[361]++;
  var self = this, doc = self.doc;
  _$jscoverage['/util/add-event.js'].lineData[363]++;
  DomEvent.detach(doc, gestureStartEvent, self.onTouchStart, self);
  _$jscoverage['/util/add-event.js'].lineData[364]++;
  DomEvent.detach(doc, gestureMoveEvent, self.onTouchMove, self);
  _$jscoverage['/util/add-event.js'].lineData[365]++;
  DomEvent.detach(doc, gestureEndEvent, self.onTouchEnd, self);
}};
  _$jscoverage['/util/add-event.js'].lineData[369]++;
  function setup(event) {
    _$jscoverage['/util/add-event.js'].functionData[26]++;
    _$jscoverage['/util/add-event.js'].lineData[370]++;
    addDocumentHandle(this, event);
  }
  _$jscoverage['/util/add-event.js'].lineData[373]++;
  function tearDown(event) {
    _$jscoverage['/util/add-event.js'].functionData[27]++;
    _$jscoverage['/util/add-event.js'].lineData[374]++;
    removeDocumentHandle(this, event);
  }
  _$jscoverage['/util/add-event.js'].lineData[377]++;
  function setupExtra(event) {
    _$jscoverage['/util/add-event.js'].functionData[28]++;
    _$jscoverage['/util/add-event.js'].lineData[378]++;
    setup.call(this, event);
    _$jscoverage['/util/add-event.js'].lineData[379]++;
    eventHandleMap[event].setup.apply(this, arguments);
  }
  _$jscoverage['/util/add-event.js'].lineData[382]++;
  function tearDownExtra(event) {
    _$jscoverage['/util/add-event.js'].functionData[29]++;
    _$jscoverage['/util/add-event.js'].lineData[383]++;
    tearDown.call(this, event);
    _$jscoverage['/util/add-event.js'].lineData[384]++;
    eventHandleMap[event].tearDown.apply(this, arguments);
  }
  _$jscoverage['/util/add-event.js'].lineData[387]++;
  function addDocumentHandle(el, event) {
    _$jscoverage['/util/add-event.js'].functionData[30]++;
    _$jscoverage['/util/add-event.js'].lineData[388]++;
    var doc = Dom.getDocument(el), handle = Dom.data(doc, key);
    _$jscoverage['/util/add-event.js'].lineData[390]++;
    if (visit59_390_1(!handle)) {
      _$jscoverage['/util/add-event.js'].lineData[391]++;
      Dom.data(doc, key, handle = new DocumentHandler(doc));
    }
    _$jscoverage['/util/add-event.js'].lineData[393]++;
    if (visit60_393_1(event)) {
      _$jscoverage['/util/add-event.js'].lineData[394]++;
      handle.addEventHandle(event);
    }
  }
  _$jscoverage['/util/add-event.js'].lineData[398]++;
  function removeDocumentHandle(el, event) {
    _$jscoverage['/util/add-event.js'].functionData[31]++;
    _$jscoverage['/util/add-event.js'].lineData[399]++;
    var doc = Dom.getDocument(el), handle = Dom.data(doc, key);
    _$jscoverage['/util/add-event.js'].lineData[401]++;
    if (visit61_401_1(handle)) {
      _$jscoverage['/util/add-event.js'].lineData[402]++;
      if (visit62_402_1(event)) {
        _$jscoverage['/util/add-event.js'].lineData[403]++;
        handle.removeEventHandle(event);
      }
      _$jscoverage['/util/add-event.js'].lineData[405]++;
      if (visit63_405_1(!handle.eventHandles.length)) {
        _$jscoverage['/util/add-event.js'].lineData[406]++;
        handle.destroy();
        _$jscoverage['/util/add-event.js'].lineData[407]++;
        Dom.removeData(doc, key);
      }
    }
  }
  _$jscoverage['/util/add-event.js'].lineData[412]++;
  return function(events, config) {
  _$jscoverage['/util/add-event.js'].functionData[32]++;
  _$jscoverage['/util/add-event.js'].lineData[413]++;
  if (visit64_413_1(typeof events === 'string')) {
    _$jscoverage['/util/add-event.js'].lineData[414]++;
    events = [events];
  }
  _$jscoverage['/util/add-event.js'].lineData[416]++;
  util.each(events, function(event) {
  _$jscoverage['/util/add-event.js'].functionData[33]++;
  _$jscoverage['/util/add-event.js'].lineData[417]++;
  var specialEvent = {};
  _$jscoverage['/util/add-event.js'].lineData[418]++;
  specialEvent.setup = config.setup ? setupExtra : setup;
  _$jscoverage['/util/add-event.js'].lineData[419]++;
  specialEvent.tearDown = config.tearDown ? tearDownExtra : tearDown;
  _$jscoverage['/util/add-event.js'].lineData[420]++;
  specialEvent.add = config.add;
  _$jscoverage['/util/add-event.js'].lineData[421]++;
  specialEvent.remove = config.remove;
  _$jscoverage['/util/add-event.js'].lineData[422]++;
  config.order = visit65_422_1(config.order || 100);
  _$jscoverage['/util/add-event.js'].lineData[424]++;
  eventHandleMap[event] = config;
  _$jscoverage['/util/add-event.js'].lineData[425]++;
  Special[event] = specialEvent;
});
};
});
