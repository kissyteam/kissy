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
if (! _$jscoverage['/align.js']) {
  _$jscoverage['/align.js'] = {};
  _$jscoverage['/align.js'].lineData = [];
  _$jscoverage['/align.js'].lineData[6] = 0;
  _$jscoverage['/align.js'].lineData[7] = 0;
  _$jscoverage['/align.js'].lineData[8] = 0;
  _$jscoverage['/align.js'].lineData[9] = 0;
  _$jscoverage['/align.js'].lineData[20] = 0;
  _$jscoverage['/align.js'].lineData[36] = 0;
  _$jscoverage['/align.js'].lineData[42] = 0;
  _$jscoverage['/align.js'].lineData[43] = 0;
  _$jscoverage['/align.js'].lineData[46] = 0;
  _$jscoverage['/align.js'].lineData[47] = 0;
  _$jscoverage['/align.js'].lineData[48] = 0;
  _$jscoverage['/align.js'].lineData[49] = 0;
  _$jscoverage['/align.js'].lineData[52] = 0;
  _$jscoverage['/align.js'].lineData[59] = 0;
  _$jscoverage['/align.js'].lineData[60] = 0;
  _$jscoverage['/align.js'].lineData[77] = 0;
  _$jscoverage['/align.js'].lineData[79] = 0;
  _$jscoverage['/align.js'].lineData[86] = 0;
  _$jscoverage['/align.js'].lineData[88] = 0;
  _$jscoverage['/align.js'].lineData[89] = 0;
  _$jscoverage['/align.js'].lineData[91] = 0;
  _$jscoverage['/align.js'].lineData[92] = 0;
  _$jscoverage['/align.js'].lineData[95] = 0;
  _$jscoverage['/align.js'].lineData[97] = 0;
  _$jscoverage['/align.js'].lineData[102] = 0;
  _$jscoverage['/align.js'].lineData[103] = 0;
  _$jscoverage['/align.js'].lineData[104] = 0;
  _$jscoverage['/align.js'].lineData[105] = 0;
  _$jscoverage['/align.js'].lineData[106] = 0;
  _$jscoverage['/align.js'].lineData[110] = 0;
  _$jscoverage['/align.js'].lineData[111] = 0;
  _$jscoverage['/align.js'].lineData[112] = 0;
  _$jscoverage['/align.js'].lineData[118] = 0;
  _$jscoverage['/align.js'].lineData[119] = 0;
  _$jscoverage['/align.js'].lineData[124] = 0;
  _$jscoverage['/align.js'].lineData[129] = 0;
  _$jscoverage['/align.js'].lineData[130] = 0;
  _$jscoverage['/align.js'].lineData[132] = 0;
  _$jscoverage['/align.js'].lineData[134] = 0;
  _$jscoverage['/align.js'].lineData[140] = 0;
  _$jscoverage['/align.js'].lineData[141] = 0;
  _$jscoverage['/align.js'].lineData[145] = 0;
  _$jscoverage['/align.js'].lineData[146] = 0;
  _$jscoverage['/align.js'].lineData[150] = 0;
  _$jscoverage['/align.js'].lineData[151] = 0;
  _$jscoverage['/align.js'].lineData[157] = 0;
  _$jscoverage['/align.js'].lineData[158] = 0;
  _$jscoverage['/align.js'].lineData[162] = 0;
  _$jscoverage['/align.js'].lineData[165] = 0;
  _$jscoverage['/align.js'].lineData[169] = 0;
  _$jscoverage['/align.js'].lineData[171] = 0;
  _$jscoverage['/align.js'].lineData[175] = 0;
  _$jscoverage['/align.js'].lineData[176] = 0;
  _$jscoverage['/align.js'].lineData[180] = 0;
  _$jscoverage['/align.js'].lineData[183] = 0;
  _$jscoverage['/align.js'].lineData[187] = 0;
  _$jscoverage['/align.js'].lineData[189] = 0;
  _$jscoverage['/align.js'].lineData[192] = 0;
  _$jscoverage['/align.js'].lineData[196] = 0;
  _$jscoverage['/align.js'].lineData[197] = 0;
  _$jscoverage['/align.js'].lineData[198] = 0;
  _$jscoverage['/align.js'].lineData[199] = 0;
  _$jscoverage['/align.js'].lineData[200] = 0;
  _$jscoverage['/align.js'].lineData[203] = 0;
  _$jscoverage['/align.js'].lineData[206] = 0;
  _$jscoverage['/align.js'].lineData[207] = 0;
  _$jscoverage['/align.js'].lineData[208] = 0;
  _$jscoverage['/align.js'].lineData[216] = 0;
  _$jscoverage['/align.js'].lineData[220] = 0;
  _$jscoverage['/align.js'].lineData[222] = 0;
  _$jscoverage['/align.js'].lineData[224] = 0;
  _$jscoverage['/align.js'].lineData[264] = 0;
  _$jscoverage['/align.js'].lineData[265] = 0;
  _$jscoverage['/align.js'].lineData[267] = 0;
  _$jscoverage['/align.js'].lineData[268] = 0;
  _$jscoverage['/align.js'].lineData[269] = 0;
  _$jscoverage['/align.js'].lineData[270] = 0;
  _$jscoverage['/align.js'].lineData[272] = 0;
  _$jscoverage['/align.js'].lineData[273] = 0;
  _$jscoverage['/align.js'].lineData[277] = 0;
  _$jscoverage['/align.js'].lineData[278] = 0;
  _$jscoverage['/align.js'].lineData[280] = 0;
  _$jscoverage['/align.js'].lineData[281] = 0;
  _$jscoverage['/align.js'].lineData[282] = 0;
  _$jscoverage['/align.js'].lineData[291] = 0;
  _$jscoverage['/align.js'].lineData[292] = 0;
  _$jscoverage['/align.js'].lineData[298] = 0;
  _$jscoverage['/align.js'].lineData[299] = 0;
  _$jscoverage['/align.js'].lineData[301] = 0;
  _$jscoverage['/align.js'].lineData[302] = 0;
  _$jscoverage['/align.js'].lineData[303] = 0;
  _$jscoverage['/align.js'].lineData[304] = 0;
  _$jscoverage['/align.js'].lineData[307] = 0;
  _$jscoverage['/align.js'].lineData[308] = 0;
  _$jscoverage['/align.js'].lineData[309] = 0;
  _$jscoverage['/align.js'].lineData[310] = 0;
  _$jscoverage['/align.js'].lineData[313] = 0;
  _$jscoverage['/align.js'].lineData[316] = 0;
  _$jscoverage['/align.js'].lineData[317] = 0;
  _$jscoverage['/align.js'].lineData[318] = 0;
  _$jscoverage['/align.js'].lineData[322] = 0;
  _$jscoverage['/align.js'].lineData[323] = 0;
  _$jscoverage['/align.js'].lineData[324] = 0;
  _$jscoverage['/align.js'].lineData[328] = 0;
  _$jscoverage['/align.js'].lineData[329] = 0;
  _$jscoverage['/align.js'].lineData[332] = 0;
  _$jscoverage['/align.js'].lineData[335] = 0;
  _$jscoverage['/align.js'].lineData[336] = 0;
  _$jscoverage['/align.js'].lineData[337] = 0;
  _$jscoverage['/align.js'].lineData[341] = 0;
  _$jscoverage['/align.js'].lineData[342] = 0;
  _$jscoverage['/align.js'].lineData[355] = 0;
  _$jscoverage['/align.js'].lineData[356] = 0;
  _$jscoverage['/align.js'].lineData[357] = 0;
  _$jscoverage['/align.js'].lineData[359] = 0;
  _$jscoverage['/align.js'].lineData[364] = 0;
  _$jscoverage['/align.js'].lineData[366] = 0;
  _$jscoverage['/align.js'].lineData[368] = 0;
  _$jscoverage['/align.js'].lineData[370] = 0;
  _$jscoverage['/align.js'].lineData[373] = 0;
  _$jscoverage['/align.js'].lineData[376] = 0;
  _$jscoverage['/align.js'].lineData[379] = 0;
  _$jscoverage['/align.js'].lineData[380] = 0;
  _$jscoverage['/align.js'].lineData[382] = 0;
  _$jscoverage['/align.js'].lineData[387] = 0;
  _$jscoverage['/align.js'].lineData[391] = 0;
  _$jscoverage['/align.js'].lineData[392] = 0;
  _$jscoverage['/align.js'].lineData[394] = 0;
  _$jscoverage['/align.js'].lineData[399] = 0;
  _$jscoverage['/align.js'].lineData[403] = 0;
  _$jscoverage['/align.js'].lineData[404] = 0;
  _$jscoverage['/align.js'].lineData[405] = 0;
  _$jscoverage['/align.js'].lineData[408] = 0;
  _$jscoverage['/align.js'].lineData[412] = 0;
  _$jscoverage['/align.js'].lineData[415] = 0;
  _$jscoverage['/align.js'].lineData[419] = 0;
  _$jscoverage['/align.js'].lineData[420] = 0;
  _$jscoverage['/align.js'].lineData[429] = 0;
  _$jscoverage['/align.js'].lineData[437] = 0;
  _$jscoverage['/align.js'].lineData[438] = 0;
  _$jscoverage['/align.js'].lineData[441] = 0;
  _$jscoverage['/align.js'].lineData[442] = 0;
  _$jscoverage['/align.js'].lineData[445] = 0;
  _$jscoverage['/align.js'].lineData[455] = 0;
  _$jscoverage['/align.js'].lineData[456] = 0;
  _$jscoverage['/align.js'].lineData[461] = 0;
  _$jscoverage['/align.js'].lineData[465] = 0;
  _$jscoverage['/align.js'].lineData[466] = 0;
  _$jscoverage['/align.js'].lineData[471] = 0;
}
if (! _$jscoverage['/align.js'].functionData) {
  _$jscoverage['/align.js'].functionData = [];
  _$jscoverage['/align.js'].functionData[0] = 0;
  _$jscoverage['/align.js'].functionData[1] = 0;
  _$jscoverage['/align.js'].functionData[2] = 0;
  _$jscoverage['/align.js'].functionData[3] = 0;
  _$jscoverage['/align.js'].functionData[4] = 0;
  _$jscoverage['/align.js'].functionData[5] = 0;
  _$jscoverage['/align.js'].functionData[6] = 0;
  _$jscoverage['/align.js'].functionData[7] = 0;
  _$jscoverage['/align.js'].functionData[8] = 0;
  _$jscoverage['/align.js'].functionData[9] = 0;
  _$jscoverage['/align.js'].functionData[10] = 0;
  _$jscoverage['/align.js'].functionData[11] = 0;
  _$jscoverage['/align.js'].functionData[12] = 0;
  _$jscoverage['/align.js'].functionData[13] = 0;
  _$jscoverage['/align.js'].functionData[14] = 0;
  _$jscoverage['/align.js'].functionData[15] = 0;
  _$jscoverage['/align.js'].functionData[16] = 0;
  _$jscoverage['/align.js'].functionData[17] = 0;
  _$jscoverage['/align.js'].functionData[18] = 0;
  _$jscoverage['/align.js'].functionData[19] = 0;
  _$jscoverage['/align.js'].functionData[20] = 0;
  _$jscoverage['/align.js'].functionData[21] = 0;
}
if (! _$jscoverage['/align.js'].branchData) {
  _$jscoverage['/align.js'].branchData = {};
  _$jscoverage['/align.js'].branchData['40'] = [];
  _$jscoverage['/align.js'].branchData['40'][1] = new BranchData();
  _$jscoverage['/align.js'].branchData['40'][2] = new BranchData();
  _$jscoverage['/align.js'].branchData['40'][3] = new BranchData();
  _$jscoverage['/align.js'].branchData['42'] = [];
  _$jscoverage['/align.js'].branchData['42'][1] = new BranchData();
  _$jscoverage['/align.js'].branchData['43'] = [];
  _$jscoverage['/align.js'].branchData['43'][1] = new BranchData();
  _$jscoverage['/align.js'].branchData['46'] = [];
  _$jscoverage['/align.js'].branchData['46'][1] = new BranchData();
  _$jscoverage['/align.js'].branchData['46'][2] = new BranchData();
  _$jscoverage['/align.js'].branchData['48'] = [];
  _$jscoverage['/align.js'].branchData['48'][1] = new BranchData();
  _$jscoverage['/align.js'].branchData['79'] = [];
  _$jscoverage['/align.js'].branchData['79'][1] = new BranchData();
  _$jscoverage['/align.js'].branchData['79'][2] = new BranchData();
  _$jscoverage['/align.js'].branchData['79'][3] = new BranchData();
  _$jscoverage['/align.js'].branchData['83'] = [];
  _$jscoverage['/align.js'].branchData['83'][1] = new BranchData();
  _$jscoverage['/align.js'].branchData['83'][2] = new BranchData();
  _$jscoverage['/align.js'].branchData['84'] = [];
  _$jscoverage['/align.js'].branchData['84'][1] = new BranchData();
  _$jscoverage['/align.js'].branchData['84'][2] = new BranchData();
  _$jscoverage['/align.js'].branchData['85'] = [];
  _$jscoverage['/align.js'].branchData['85'][1] = new BranchData();
  _$jscoverage['/align.js'].branchData['112'] = [];
  _$jscoverage['/align.js'].branchData['112'][1] = new BranchData();
  _$jscoverage['/align.js'].branchData['112'][2] = new BranchData();
  _$jscoverage['/align.js'].branchData['112'][3] = new BranchData();
  _$jscoverage['/align.js'].branchData['112'][4] = new BranchData();
  _$jscoverage['/align.js'].branchData['113'] = [];
  _$jscoverage['/align.js'].branchData['113'][1] = new BranchData();
  _$jscoverage['/align.js'].branchData['113'][2] = new BranchData();
  _$jscoverage['/align.js'].branchData['114'] = [];
  _$jscoverage['/align.js'].branchData['114'][1] = new BranchData();
  _$jscoverage['/align.js'].branchData['141'] = [];
  _$jscoverage['/align.js'].branchData['141'][1] = new BranchData();
  _$jscoverage['/align.js'].branchData['141'][2] = new BranchData();
  _$jscoverage['/align.js'].branchData['142'] = [];
  _$jscoverage['/align.js'].branchData['142'][1] = new BranchData();
  _$jscoverage['/align.js'].branchData['146'] = [];
  _$jscoverage['/align.js'].branchData['146'][1] = new BranchData();
  _$jscoverage['/align.js'].branchData['146'][2] = new BranchData();
  _$jscoverage['/align.js'].branchData['147'] = [];
  _$jscoverage['/align.js'].branchData['147'][1] = new BranchData();
  _$jscoverage['/align.js'].branchData['157'] = [];
  _$jscoverage['/align.js'].branchData['157'][1] = new BranchData();
  _$jscoverage['/align.js'].branchData['157'][2] = new BranchData();
  _$jscoverage['/align.js'].branchData['162'] = [];
  _$jscoverage['/align.js'].branchData['162'][1] = new BranchData();
  _$jscoverage['/align.js'].branchData['163'] = [];
  _$jscoverage['/align.js'].branchData['163'][1] = new BranchData();
  _$jscoverage['/align.js'].branchData['163'][2] = new BranchData();
  _$jscoverage['/align.js'].branchData['164'] = [];
  _$jscoverage['/align.js'].branchData['164'][1] = new BranchData();
  _$jscoverage['/align.js'].branchData['169'] = [];
  _$jscoverage['/align.js'].branchData['169'][1] = new BranchData();
  _$jscoverage['/align.js'].branchData['169'][2] = new BranchData();
  _$jscoverage['/align.js'].branchData['175'] = [];
  _$jscoverage['/align.js'].branchData['175'][1] = new BranchData();
  _$jscoverage['/align.js'].branchData['175'][2] = new BranchData();
  _$jscoverage['/align.js'].branchData['180'] = [];
  _$jscoverage['/align.js'].branchData['180'][1] = new BranchData();
  _$jscoverage['/align.js'].branchData['181'] = [];
  _$jscoverage['/align.js'].branchData['181'][1] = new BranchData();
  _$jscoverage['/align.js'].branchData['181'][2] = new BranchData();
  _$jscoverage['/align.js'].branchData['182'] = [];
  _$jscoverage['/align.js'].branchData['182'][1] = new BranchData();
  _$jscoverage['/align.js'].branchData['187'] = [];
  _$jscoverage['/align.js'].branchData['187'][1] = new BranchData();
  _$jscoverage['/align.js'].branchData['187'][2] = new BranchData();
  _$jscoverage['/align.js'].branchData['267'] = [];
  _$jscoverage['/align.js'].branchData['267'][1] = new BranchData();
  _$jscoverage['/align.js'].branchData['301'] = [];
  _$jscoverage['/align.js'].branchData['301'][1] = new BranchData();
  _$jscoverage['/align.js'].branchData['303'] = [];
  _$jscoverage['/align.js'].branchData['303'][1] = new BranchData();
  _$jscoverage['/align.js'].branchData['307'] = [];
  _$jscoverage['/align.js'].branchData['307'][1] = new BranchData();
  _$jscoverage['/align.js'].branchData['309'] = [];
  _$jscoverage['/align.js'].branchData['309'][1] = new BranchData();
  _$jscoverage['/align.js'].branchData['317'] = [];
  _$jscoverage['/align.js'].branchData['317'][1] = new BranchData();
  _$jscoverage['/align.js'].branchData['317'][2] = new BranchData();
  _$jscoverage['/align.js'].branchData['323'] = [];
  _$jscoverage['/align.js'].branchData['323'][1] = new BranchData();
  _$jscoverage['/align.js'].branchData['341'] = [];
  _$jscoverage['/align.js'].branchData['341'][1] = new BranchData();
  _$jscoverage['/align.js'].branchData['355'] = [];
  _$jscoverage['/align.js'].branchData['355'][1] = new BranchData();
  _$jscoverage['/align.js'].branchData['356'] = [];
  _$jscoverage['/align.js'].branchData['356'][1] = new BranchData();
  _$jscoverage['/align.js'].branchData['356'][2] = new BranchData();
  _$jscoverage['/align.js'].branchData['357'] = [];
  _$jscoverage['/align.js'].branchData['357'][1] = new BranchData();
  _$jscoverage['/align.js'].branchData['376'] = [];
  _$jscoverage['/align.js'].branchData['376'][1] = new BranchData();
  _$jscoverage['/align.js'].branchData['376'][2] = new BranchData();
  _$jscoverage['/align.js'].branchData['379'] = [];
  _$jscoverage['/align.js'].branchData['379'][1] = new BranchData();
  _$jscoverage['/align.js'].branchData['391'] = [];
  _$jscoverage['/align.js'].branchData['391'][1] = new BranchData();
  _$jscoverage['/align.js'].branchData['403'] = [];
  _$jscoverage['/align.js'].branchData['403'][1] = new BranchData();
  _$jscoverage['/align.js'].branchData['412'] = [];
  _$jscoverage['/align.js'].branchData['412'][1] = new BranchData();
  _$jscoverage['/align.js'].branchData['415'] = [];
  _$jscoverage['/align.js'].branchData['415'][1] = new BranchData();
  _$jscoverage['/align.js'].branchData['419'] = [];
  _$jscoverage['/align.js'].branchData['419'][1] = new BranchData();
  _$jscoverage['/align.js'].branchData['437'] = [];
  _$jscoverage['/align.js'].branchData['437'][1] = new BranchData();
  _$jscoverage['/align.js'].branchData['441'] = [];
  _$jscoverage['/align.js'].branchData['441'][1] = new BranchData();
  _$jscoverage['/align.js'].branchData['465'] = [];
  _$jscoverage['/align.js'].branchData['465'][1] = new BranchData();
}
_$jscoverage['/align.js'].branchData['465'][1].init(17, 8, 'this.$el');
function visit69_465_1(result) {
  _$jscoverage['/align.js'].branchData['465'][1].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['441'][1].init(3178, 37, 'newElRegion.height != elRegion.height');
function visit68_441_1(result) {
  _$jscoverage['/align.js'].branchData['441'][1].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['437'][1].init(3024, 35, 'newElRegion.width != elRegion.width');
function visit67_437_1(result) {
  _$jscoverage['/align.js'].branchData['437'][1].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['419'][1].init(1459, 48, 'newOverflowCfg.adjustX || newOverflowCfg.adjustY');
function visit66_419_1(result) {
  _$jscoverage['/align.js'].branchData['419'][1].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['415'][1].init(1316, 83, 'overflow.adjustY && isFailY(elFuturePos, elRegion, visibleRect)');
function visit65_415_1(result) {
  _$jscoverage['/align.js'].branchData['415'][1].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['412'][1].init(1189, 83, 'overflow.adjustX && isFailX(elFuturePos, elRegion, visibleRect)');
function visit64_412_1(result) {
  _$jscoverage['/align.js'].branchData['412'][1].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['403'][1].init(857, 4, 'fail');
function visit63_403_1(result) {
  _$jscoverage['/align.js'].branchData['403'][1].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['391'][1].init(447, 43, 'isFailY(elFuturePos, elRegion, visibleRect)');
function visit62_391_1(result) {
  _$jscoverage['/align.js'].branchData['391'][1].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['379'][1].init(50, 43, 'isFailX(elFuturePos, elRegion, visibleRect)');
function visit61_379_1(result) {
  _$jscoverage['/align.js'].branchData['379'][1].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['376'][2].init(809, 36, 'overflow.adjustX || overflow.adjustY');
function visit60_376_2(result) {
  _$jscoverage['/align.js'].branchData['376'][2].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['376'][1].init(793, 53, 'visibleRect && (overflow.adjustX || overflow.adjustY)');
function visit59_376_1(result) {
  _$jscoverage['/align.js'].branchData['376'][1].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['357'][1].init(132, 14, 'overflow || {}');
function visit58_357_1(result) {
  _$jscoverage['/align.js'].branchData['357'][1].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['356'][2].init(70, 27, 'offset && [].concat(offset)');
function visit57_356_2(result) {
  _$jscoverage['/align.js'].branchData['356'][2].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['356'][1].init(70, 37, 'offset && [].concat(offset) || [0, 0]');
function visit56_356_1(result) {
  _$jscoverage['/align.js'].branchData['356'][1].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['355'][1].init(32, 14, 'refNode || win');
function visit55_355_1(result) {
  _$jscoverage['/align.js'].branchData['355'][1].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['341'][1].init(17, 13, 'v && v.points');
function visit54_341_1(result) {
  _$jscoverage['/align.js'].branchData['341'][1].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['323'][1].init(13, 19, 'this.get(\'visible\')');
function visit53_323_1(result) {
  _$jscoverage['/align.js'].branchData['323'][1].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['317'][2].init(13, 16, 'e.target == this');
function visit52_317_2(result) {
  _$jscoverage['/align.js'].branchData['317'][2].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['317'][1].init(13, 28, 'e.target == this && e.newVal');
function visit51_317_1(result) {
  _$jscoverage['/align.js'].branchData['317'][1].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['309'][1].init(378, 9, 'H === \'r\'');
function visit50_309_1(result) {
  _$jscoverage['/align.js'].branchData['309'][1].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['307'][1].init(321, 9, 'H === \'c\'');
function visit49_307_1(result) {
  _$jscoverage['/align.js'].branchData['307'][1].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['303'][1].init(266, 9, 'V === \'b\'');
function visit48_303_1(result) {
  _$jscoverage['/align.js'].branchData['303'][1].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['301'][1].init(209, 9, 'V === \'c\'');
function visit47_301_1(result) {
  _$jscoverage['/align.js'].branchData['301'][1].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['267'][1].init(70, 20, '!S.isWindow(domNode)');
function visit46_267_1(result) {
  _$jscoverage['/align.js'].branchData['267'][1].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['187'][2].init(1388, 42, 'pos.top + size.height > visibleRect.bottom');
function visit45_187_2(result) {
  _$jscoverage['/align.js'].branchData['187'][2].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['187'][1].init(1368, 62, 'overflow.adjustY && pos.top + size.height > visibleRect.bottom');
function visit44_187_1(result) {
  _$jscoverage['/align.js'].branchData['187'][1].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['182'][1].init(41, 42, 'pos.top + size.height > visibleRect.bottom');
function visit43_182_1(result) {
  _$jscoverage['/align.js'].branchData['182'][1].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['181'][2].init(1129, 26, 'pos.top >= visibleRect.top');
function visit42_181_2(result) {
  _$jscoverage['/align.js'].branchData['181'][2].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['181'][1].init(39, 84, 'pos.top >= visibleRect.top && pos.top + size.height > visibleRect.bottom');
function visit41_181_1(result) {
  _$jscoverage['/align.js'].branchData['181'][1].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['180'][1].init(1087, 124, 'overflow[\'resizeHeight\'] && pos.top >= visibleRect.top && pos.top + size.height > visibleRect.bottom');
function visit40_180_1(result) {
  _$jscoverage['/align.js'].branchData['180'][1].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['175'][2].init(917, 25, 'pos.top < visibleRect.top');
function visit39_175_2(result) {
  _$jscoverage['/align.js'].branchData['175'][2].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['175'][1].init(897, 45, 'overflow.adjustY && pos.top < visibleRect.top');
function visit38_175_1(result) {
  _$jscoverage['/align.js'].branchData['175'][1].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['169'][2].init(661, 41, 'pos.left + size.width > visibleRect.right');
function visit37_169_2(result) {
  _$jscoverage['/align.js'].branchData['169'][2].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['169'][1].init(641, 61, 'overflow.adjustX && pos.left + size.width > visibleRect.right');
function visit36_169_1(result) {
  _$jscoverage['/align.js'].branchData['169'][1].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['164'][1].init(43, 41, 'pos.left + size.width > visibleRect.right');
function visit35_164_1(result) {
  _$jscoverage['/align.js'].branchData['164'][1].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['163'][2].init(404, 28, 'pos.left >= visibleRect.left');
function visit34_163_2(result) {
  _$jscoverage['/align.js'].branchData['163'][2].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['163'][1].init(38, 85, 'pos.left >= visibleRect.left && pos.left + size.width > visibleRect.right');
function visit33_163_1(result) {
  _$jscoverage['/align.js'].branchData['163'][1].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['162'][1].init(363, 124, 'overflow[\'resizeWidth\'] && pos.left >= visibleRect.left && pos.left + size.width > visibleRect.right');
function visit32_162_1(result) {
  _$jscoverage['/align.js'].branchData['162'][1].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['157'][2].init(189, 27, 'pos.left < visibleRect.left');
function visit31_157_2(result) {
  _$jscoverage['/align.js'].branchData['157'][2].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['157'][1].init(169, 47, 'overflow.adjustX && pos.left < visibleRect.left');
function visit30_157_1(result) {
  _$jscoverage['/align.js'].branchData['157'][1].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['147'][1].init(48, 54, 'elFuturePos.top + elRegion.height > visibleRect.bottom');
function visit29_147_1(result) {
  _$jscoverage['/align.js'].branchData['147'][1].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['146'][2].init(16, 33, 'elFuturePos.top < visibleRect.top');
function visit28_146_2(result) {
  _$jscoverage['/align.js'].branchData['146'][2].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['146'][1].init(16, 103, 'elFuturePos.top < visibleRect.top || elFuturePos.top + elRegion.height > visibleRect.bottom');
function visit27_146_1(result) {
  _$jscoverage['/align.js'].branchData['146'][1].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['142'][1].init(50, 53, 'elFuturePos.left + elRegion.width > visibleRect.right');
function visit26_142_1(result) {
  _$jscoverage['/align.js'].branchData['142'][1].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['141'][2].init(16, 35, 'elFuturePos.left < visibleRect.left');
function visit25_141_2(result) {
  _$jscoverage['/align.js'].branchData['141'][2].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['141'][1].init(16, 104, 'elFuturePos.left < visibleRect.left || elFuturePos.left + elRegion.width > visibleRect.right');
function visit24_141_1(result) {
  _$jscoverage['/align.js'].branchData['141'][1].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['114'][1].init(119, 36, 'visibleRect.right > visibleRect.left');
function visit23_114_1(result) {
  _$jscoverage['/align.js'].branchData['114'][1].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['113'][2].init(70, 36, 'visibleRect.bottom > visibleRect.top');
function visit22_113_2(result) {
  _$jscoverage['/align.js'].branchData['113'][2].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['113'][1].init(36, 88, 'visibleRect.bottom > visibleRect.top && visibleRect.right > visibleRect.left');
function visit21_113_1(result) {
  _$jscoverage['/align.js'].branchData['113'][1].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['112'][4].init(32, 21, 'visibleRect.left >= 0');
function visit20_112_4(result) {
  _$jscoverage['/align.js'].branchData['112'][4].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['112'][3].init(23, 125, 'visibleRect.left >= 0 && visibleRect.bottom > visibleRect.top && visibleRect.right > visibleRect.left');
function visit19_112_3(result) {
  _$jscoverage['/align.js'].branchData['112'][3].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['112'][2].init(7, 20, 'visibleRect.top >= 0');
function visit18_112_2(result) {
  _$jscoverage['/align.js'].branchData['112'][2].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['112'][1].init(-1, 149, 'visibleRect.top >= 0 && visibleRect.left >= 0 && visibleRect.bottom > visibleRect.top && visibleRect.right > visibleRect.left');
function visit17_112_1(result) {
  _$jscoverage['/align.js'].branchData['112'][1].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['85'][1].init(44, 34, '$(el).css(\'overflow\') != \'visible\'');
function visit16_85_1(result) {
  _$jscoverage['/align.js'].branchData['85'][1].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['84'][2].init(305, 21, 'el != documentElement');
function visit15_84_2(result) {
  _$jscoverage['/align.js'].branchData['84'][2].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['84'][1].init(33, 79, 'el != documentElement && $(el).css(\'overflow\') != \'visible\'');
function visit14_84_1(result) {
  _$jscoverage['/align.js'].branchData['84'][1].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['83'][2].init(269, 10, 'el != body');
function visit13_83_2(result) {
  _$jscoverage['/align.js'].branchData['83'][2].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['83'][1].init(269, 113, 'el != body && el != documentElement && $(el).css(\'overflow\') != \'visible\'');
function visit12_83_1(result) {
  _$jscoverage['/align.js'].branchData['83'][1].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['79'][3].init(96, 19, 'el.clientWidth != 0');
function visit11_79_3(result) {
  _$jscoverage['/align.js'].branchData['79'][3].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['79'][2].init(86, 29, '!UA.ie || el.clientWidth != 0');
function visit10_79_2(result) {
  _$jscoverage['/align.js'].branchData['79'][2].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['79'][1].init(86, 384, '(!UA.ie || el.clientWidth != 0) && (el != body && el != documentElement && $(el).css(\'overflow\') != \'visible\')');
function visit9_79_1(result) {
  _$jscoverage['/align.js'].branchData['79'][1].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['48'][1].init(72, 25, 'positionStyle != "static"');
function visit8_48_1(result) {
  _$jscoverage['/align.js'].branchData['48'][1].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['46'][2].init(1046, 14, 'parent != body');
function visit7_46_2(result) {
  _$jscoverage['/align.js'].branchData['46'][2].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['46'][1].init(1036, 24, 'parent && parent != body');
function visit6_46_1(result) {
  _$jscoverage['/align.js'].branchData['46'][1].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['43'][1].init(20, 40, 'element.nodeName.toLowerCase() == \'html\'');
function visit5_43_1(result) {
  _$jscoverage['/align.js'].branchData['43'][1].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['42'][1].init(879, 11, '!skipStatic');
function visit4_42_1(result) {
  _$jscoverage['/align.js'].branchData['42'][1].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['40'][3].init(190, 27, 'positionStyle == \'absolute\'');
function visit3_40_3(result) {
  _$jscoverage['/align.js'].branchData['40'][3].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['40'][2].init(162, 24, 'positionStyle == \'fixed\'');
function visit2_40_2(result) {
  _$jscoverage['/align.js'].branchData['40'][2].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['40'][1].init(162, 55, 'positionStyle == \'fixed\' || positionStyle == \'absolute\'');
function visit1_40_1(result) {
  _$jscoverage['/align.js'].branchData['40'][1].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/align.js'].functionData[0]++;
  _$jscoverage['/align.js'].lineData[7]++;
  var module = this;
  _$jscoverage['/align.js'].lineData[8]++;
  var Node = require('node');
  _$jscoverage['/align.js'].lineData[9]++;
  var win = S.Env.host, $ = Node.all, UA = S.UA;
  _$jscoverage['/align.js'].lineData[20]++;
  function getOffsetParent(element) {
    _$jscoverage['/align.js'].functionData[1]++;
    _$jscoverage['/align.js'].lineData[36]++;
    var doc = element.ownerDocument, body = doc.body, parent, positionStyle = $(element).css('position'), skipStatic = visit1_40_1(visit2_40_2(positionStyle == 'fixed') || visit3_40_3(positionStyle == 'absolute'));
    _$jscoverage['/align.js'].lineData[42]++;
    if (visit4_42_1(!skipStatic)) {
      _$jscoverage['/align.js'].lineData[43]++;
      return visit5_43_1(element.nodeName.toLowerCase() == 'html') ? null : element.parentNode;
    }
    _$jscoverage['/align.js'].lineData[46]++;
    for (parent = element.parentNode; visit6_46_1(parent && visit7_46_2(parent != body)); parent = parent.parentNode) {
      _$jscoverage['/align.js'].lineData[47]++;
      positionStyle = $(parent).css('position');
      _$jscoverage['/align.js'].lineData[48]++;
      if (visit8_48_1(positionStyle != "static")) {
        _$jscoverage['/align.js'].lineData[49]++;
        return parent;
      }
    }
    _$jscoverage['/align.js'].lineData[52]++;
    return null;
  }
  _$jscoverage['/align.js'].lineData[59]++;
  function getVisibleRectForElement(element) {
    _$jscoverage['/align.js'].functionData[2]++;
    _$jscoverage['/align.js'].lineData[60]++;
    var visibleRect = {
  left: 0, 
  right: Infinity, 
  top: 0, 
  bottom: Infinity}, el, scrollX, scrollY, winSize, doc = element.ownerDocument, $win = $(doc).getWindow(), body = doc.body, documentElement = doc.documentElement;
    _$jscoverage['/align.js'].lineData[77]++;
    for (el = element; el = getOffsetParent(el); ) {
      _$jscoverage['/align.js'].lineData[79]++;
      if (visit9_79_1((visit10_79_2(!UA.ie || visit11_79_3(el.clientWidth != 0))) && (visit12_83_1(visit13_83_2(el != body) && visit14_84_1(visit15_84_2(el != documentElement) && visit16_85_1($(el).css('overflow') != 'visible')))))) {
        _$jscoverage['/align.js'].lineData[86]++;
        var pos = $(el).offset();
        _$jscoverage['/align.js'].lineData[88]++;
        pos.left += el.clientLeft;
        _$jscoverage['/align.js'].lineData[89]++;
        pos.top += el.clientTop;
        _$jscoverage['/align.js'].lineData[91]++;
        visibleRect.top = Math.max(visibleRect.top, pos.top);
        _$jscoverage['/align.js'].lineData[92]++;
        visibleRect.right = Math.min(visibleRect.right, pos.left + el.clientWidth);
        _$jscoverage['/align.js'].lineData[95]++;
        visibleRect.bottom = Math.min(visibleRect.bottom, pos.top + el.clientHeight);
        _$jscoverage['/align.js'].lineData[97]++;
        visibleRect.left = Math.max(visibleRect.left, pos.left);
      }
    }
    _$jscoverage['/align.js'].lineData[102]++;
    scrollX = $win.scrollLeft();
    _$jscoverage['/align.js'].lineData[103]++;
    scrollY = $win.scrollTop();
    _$jscoverage['/align.js'].lineData[104]++;
    visibleRect.left = Math.max(visibleRect.left, scrollX);
    _$jscoverage['/align.js'].lineData[105]++;
    visibleRect.top = Math.max(visibleRect.top, scrollY);
    _$jscoverage['/align.js'].lineData[106]++;
    winSize = {
  width: $win.width(), 
  height: $win.height()};
    _$jscoverage['/align.js'].lineData[110]++;
    visibleRect.right = Math.min(visibleRect.right, scrollX + winSize.width);
    _$jscoverage['/align.js'].lineData[111]++;
    visibleRect.bottom = Math.min(visibleRect.bottom, scrollY + winSize.height);
    _$jscoverage['/align.js'].lineData[112]++;
    return visit17_112_1(visit18_112_2(visibleRect.top >= 0) && visit19_112_3(visit20_112_4(visibleRect.left >= 0) && visit21_113_1(visit22_113_2(visibleRect.bottom > visibleRect.top) && visit23_114_1(visibleRect.right > visibleRect.left)))) ? visibleRect : null;
  }
  _$jscoverage['/align.js'].lineData[118]++;
  function getElFuturePos(elRegion, refNodeRegion, points, offset) {
    _$jscoverage['/align.js'].functionData[3]++;
    _$jscoverage['/align.js'].lineData[119]++;
    var xy, diff, p1, p2;
    _$jscoverage['/align.js'].lineData[124]++;
    xy = {
  left: elRegion.left, 
  top: elRegion.top};
    _$jscoverage['/align.js'].lineData[129]++;
    p1 = getAlignOffset(refNodeRegion, points[0]);
    _$jscoverage['/align.js'].lineData[130]++;
    p2 = getAlignOffset(elRegion, points[1]);
    _$jscoverage['/align.js'].lineData[132]++;
    diff = [p2.left - p1.left, p2.top - p1.top];
    _$jscoverage['/align.js'].lineData[134]++;
    return {
  left: xy.left - diff[0] + (+offset[0]), 
  top: xy.top - diff[1] + (+offset[1])};
  }
  _$jscoverage['/align.js'].lineData[140]++;
  function isFailX(elFuturePos, elRegion, visibleRect) {
    _$jscoverage['/align.js'].functionData[4]++;
    _$jscoverage['/align.js'].lineData[141]++;
    return visit24_141_1(visit25_141_2(elFuturePos.left < visibleRect.left) || visit26_142_1(elFuturePos.left + elRegion.width > visibleRect.right));
  }
  _$jscoverage['/align.js'].lineData[145]++;
  function isFailY(elFuturePos, elRegion, visibleRect) {
    _$jscoverage['/align.js'].functionData[5]++;
    _$jscoverage['/align.js'].lineData[146]++;
    return visit27_146_1(visit28_146_2(elFuturePos.top < visibleRect.top) || visit29_147_1(elFuturePos.top + elRegion.height > visibleRect.bottom));
  }
  _$jscoverage['/align.js'].lineData[150]++;
  function adjustForViewport(elFuturePos, elRegion, visibleRect, overflow) {
    _$jscoverage['/align.js'].functionData[6]++;
    _$jscoverage['/align.js'].lineData[151]++;
    var pos = S.clone(elFuturePos), size = {
  width: elRegion.width, 
  height: elRegion.height};
    _$jscoverage['/align.js'].lineData[157]++;
    if (visit30_157_1(overflow.adjustX && visit31_157_2(pos.left < visibleRect.left))) {
      _$jscoverage['/align.js'].lineData[158]++;
      pos.left = visibleRect.left;
    }
    _$jscoverage['/align.js'].lineData[162]++;
    if (visit32_162_1(overflow['resizeWidth'] && visit33_163_1(visit34_163_2(pos.left >= visibleRect.left) && visit35_164_1(pos.left + size.width > visibleRect.right)))) {
      _$jscoverage['/align.js'].lineData[165]++;
      size.width -= (pos.left + size.width) - visibleRect.right;
    }
    _$jscoverage['/align.js'].lineData[169]++;
    if (visit36_169_1(overflow.adjustX && visit37_169_2(pos.left + size.width > visibleRect.right))) {
      _$jscoverage['/align.js'].lineData[171]++;
      pos.left = Math.max(visibleRect.right - size.width, visibleRect.left);
    }
    _$jscoverage['/align.js'].lineData[175]++;
    if (visit38_175_1(overflow.adjustY && visit39_175_2(pos.top < visibleRect.top))) {
      _$jscoverage['/align.js'].lineData[176]++;
      pos.top = visibleRect.top;
    }
    _$jscoverage['/align.js'].lineData[180]++;
    if (visit40_180_1(overflow['resizeHeight'] && visit41_181_1(visit42_181_2(pos.top >= visibleRect.top) && visit43_182_1(pos.top + size.height > visibleRect.bottom)))) {
      _$jscoverage['/align.js'].lineData[183]++;
      size.height -= (pos.top + size.height) - visibleRect.bottom;
    }
    _$jscoverage['/align.js'].lineData[187]++;
    if (visit44_187_1(overflow.adjustY && visit45_187_2(pos.top + size.height > visibleRect.bottom))) {
      _$jscoverage['/align.js'].lineData[189]++;
      pos.top = Math.max(visibleRect.bottom - size.height, visibleRect.top);
    }
    _$jscoverage['/align.js'].lineData[192]++;
    return S.mix(pos, size);
  }
  _$jscoverage['/align.js'].lineData[196]++;
  function flip(points, reg, map) {
    _$jscoverage['/align.js'].functionData[7]++;
    _$jscoverage['/align.js'].lineData[197]++;
    var ret = [];
    _$jscoverage['/align.js'].lineData[198]++;
    S.each(points, function(p) {
  _$jscoverage['/align.js'].functionData[8]++;
  _$jscoverage['/align.js'].lineData[199]++;
  ret.push(p.replace(reg, function(m) {
  _$jscoverage['/align.js'].functionData[9]++;
  _$jscoverage['/align.js'].lineData[200]++;
  return map[m];
}));
});
    _$jscoverage['/align.js'].lineData[203]++;
    return ret;
  }
  _$jscoverage['/align.js'].lineData[206]++;
  function flipOffset(offset, index) {
    _$jscoverage['/align.js'].functionData[10]++;
    _$jscoverage['/align.js'].lineData[207]++;
    offset[index] = -offset[index];
    _$jscoverage['/align.js'].lineData[208]++;
    return offset;
  }
  _$jscoverage['/align.js'].lineData[216]++;
  function Align() {
    _$jscoverage['/align.js'].functionData[11]++;
  }
  _$jscoverage['/align.js'].lineData[220]++;
  Align.__getOffsetParent = getOffsetParent;
  _$jscoverage['/align.js'].lineData[222]++;
  Align.__getVisibleRectForElement = getVisibleRectForElement;
  _$jscoverage['/align.js'].lineData[224]++;
  Align.ATTRS = {
  align: {
  value: {}}};
  _$jscoverage['/align.js'].lineData[264]++;
  function getRegion(node) {
    _$jscoverage['/align.js'].functionData[12]++;
    _$jscoverage['/align.js'].lineData[265]++;
    var offset, w, h, domNode = node[0];
    _$jscoverage['/align.js'].lineData[267]++;
    if (visit46_267_1(!S.isWindow(domNode))) {
      _$jscoverage['/align.js'].lineData[268]++;
      offset = node.offset();
      _$jscoverage['/align.js'].lineData[269]++;
      w = node.outerWidth();
      _$jscoverage['/align.js'].lineData[270]++;
      h = node.outerHeight();
    } else {
      _$jscoverage['/align.js'].lineData[272]++;
      var $win = $(domNode).getWindow();
      _$jscoverage['/align.js'].lineData[273]++;
      offset = {
  left: $win.scrollLeft(), 
  top: $win.scrollTop()};
      _$jscoverage['/align.js'].lineData[277]++;
      w = $win.width();
      _$jscoverage['/align.js'].lineData[278]++;
      h = $win.height();
    }
    _$jscoverage['/align.js'].lineData[280]++;
    offset.width = w;
    _$jscoverage['/align.js'].lineData[281]++;
    offset.height = h;
    _$jscoverage['/align.js'].lineData[282]++;
    return offset;
  }
  _$jscoverage['/align.js'].lineData[291]++;
  function getAlignOffset(region, align) {
    _$jscoverage['/align.js'].functionData[13]++;
    _$jscoverage['/align.js'].lineData[292]++;
    var V = align.charAt(0), H = align.charAt(1), w = region.width, h = region.height, x, y;
    _$jscoverage['/align.js'].lineData[298]++;
    x = region.left;
    _$jscoverage['/align.js'].lineData[299]++;
    y = region.top;
    _$jscoverage['/align.js'].lineData[301]++;
    if (visit47_301_1(V === 'c')) {
      _$jscoverage['/align.js'].lineData[302]++;
      y += h / 2;
    } else {
      _$jscoverage['/align.js'].lineData[303]++;
      if (visit48_303_1(V === 'b')) {
        _$jscoverage['/align.js'].lineData[304]++;
        y += h;
      }
    }
    _$jscoverage['/align.js'].lineData[307]++;
    if (visit49_307_1(H === 'c')) {
      _$jscoverage['/align.js'].lineData[308]++;
      x += w / 2;
    } else {
      _$jscoverage['/align.js'].lineData[309]++;
      if (visit50_309_1(H === 'r')) {
        _$jscoverage['/align.js'].lineData[310]++;
        x += w;
      }
    }
    _$jscoverage['/align.js'].lineData[313]++;
    return {
  left: x, 
  top: y};
  }
  _$jscoverage['/align.js'].lineData[316]++;
  function beforeVisibleChange(e) {
    _$jscoverage['/align.js'].functionData[14]++;
    _$jscoverage['/align.js'].lineData[317]++;
    if (visit51_317_1(visit52_317_2(e.target == this) && e.newVal)) {
      _$jscoverage['/align.js'].lineData[318]++;
      realign.call(this);
    }
  }
  _$jscoverage['/align.js'].lineData[322]++;
  function onResize() {
    _$jscoverage['/align.js'].functionData[15]++;
    _$jscoverage['/align.js'].lineData[323]++;
    if (visit53_323_1(this.get('visible'))) {
      _$jscoverage['/align.js'].lineData[324]++;
      realign.call(this);
    }
  }
  _$jscoverage['/align.js'].lineData[328]++;
  function realign() {
    _$jscoverage['/align.js'].functionData[16]++;
    _$jscoverage['/align.js'].lineData[329]++;
    this._onSetAlign(this.get('align'));
  }
  _$jscoverage['/align.js'].lineData[332]++;
  Align.prototype = {
  __bindUI: function() {
  _$jscoverage['/align.js'].functionData[17]++;
  _$jscoverage['/align.js'].lineData[335]++;
  var self = this;
  _$jscoverage['/align.js'].lineData[336]++;
  self.on('beforeVisibleChange', beforeVisibleChange, self);
  _$jscoverage['/align.js'].lineData[337]++;
  self.$el.getWindow().on('resize', onResize, self);
}, 
  '_onSetAlign': function(v) {
  _$jscoverage['/align.js'].functionData[18]++;
  _$jscoverage['/align.js'].lineData[341]++;
  if (visit54_341_1(v && v.points)) {
    _$jscoverage['/align.js'].lineData[342]++;
    this.align(v.node, v.points, v.offset, v.overflow);
  }
}, 
  align: function(refNode, points, offset, overflow) {
  _$jscoverage['/align.js'].functionData[19]++;
  _$jscoverage['/align.js'].lineData[355]++;
  refNode = Node.one(visit55_355_1(refNode || win));
  _$jscoverage['/align.js'].lineData[356]++;
  offset = visit56_356_1(visit57_356_2(offset && [].concat(offset)) || [0, 0]);
  _$jscoverage['/align.js'].lineData[357]++;
  overflow = visit58_357_1(overflow || {});
  _$jscoverage['/align.js'].lineData[359]++;
  var self = this, el = self.$el, fail = 0;
  _$jscoverage['/align.js'].lineData[364]++;
  var visibleRect = getVisibleRectForElement(el[0]);
  _$jscoverage['/align.js'].lineData[366]++;
  var elRegion = getRegion(el);
  _$jscoverage['/align.js'].lineData[368]++;
  var refNodeRegion = getRegion(refNode);
  _$jscoverage['/align.js'].lineData[370]++;
  var elFuturePos = getElFuturePos(elRegion, refNodeRegion, points, offset);
  _$jscoverage['/align.js'].lineData[373]++;
  var newElRegion = S.merge(elRegion, elFuturePos);
  _$jscoverage['/align.js'].lineData[376]++;
  if (visit59_376_1(visibleRect && (visit60_376_2(overflow.adjustX || overflow.adjustY)))) {
    _$jscoverage['/align.js'].lineData[379]++;
    if (visit61_379_1(isFailX(elFuturePos, elRegion, visibleRect))) {
      _$jscoverage['/align.js'].lineData[380]++;
      fail = 1;
      _$jscoverage['/align.js'].lineData[382]++;
      points = flip(points, /[lr]/ig, {
  l: "r", 
  r: "l"});
      _$jscoverage['/align.js'].lineData[387]++;
      offset = flipOffset(offset, 0);
    }
    _$jscoverage['/align.js'].lineData[391]++;
    if (visit62_391_1(isFailY(elFuturePos, elRegion, visibleRect))) {
      _$jscoverage['/align.js'].lineData[392]++;
      fail = 1;
      _$jscoverage['/align.js'].lineData[394]++;
      points = flip(points, /[tb]/ig, {
  t: "b", 
  b: "t"});
      _$jscoverage['/align.js'].lineData[399]++;
      offset = flipOffset(offset, 1);
    }
    _$jscoverage['/align.js'].lineData[403]++;
    if (visit63_403_1(fail)) {
      _$jscoverage['/align.js'].lineData[404]++;
      elFuturePos = getElFuturePos(elRegion, refNodeRegion, points, offset);
      _$jscoverage['/align.js'].lineData[405]++;
      S.mix(newElRegion, elFuturePos);
    }
    _$jscoverage['/align.js'].lineData[408]++;
    var newOverflowCfg = {};
    _$jscoverage['/align.js'].lineData[412]++;
    newOverflowCfg.adjustX = visit64_412_1(overflow.adjustX && isFailX(elFuturePos, elRegion, visibleRect));
    _$jscoverage['/align.js'].lineData[415]++;
    newOverflowCfg.adjustY = visit65_415_1(overflow.adjustY && isFailY(elFuturePos, elRegion, visibleRect));
    _$jscoverage['/align.js'].lineData[419]++;
    if (visit66_419_1(newOverflowCfg.adjustX || newOverflowCfg.adjustY)) {
      _$jscoverage['/align.js'].lineData[420]++;
      newElRegion = adjustForViewport(elFuturePos, elRegion, visibleRect, newOverflowCfg);
    }
  }
  _$jscoverage['/align.js'].lineData[429]++;
  self.set({
  "x": newElRegion.left, 
  "y": newElRegion.top}, {
  force: 1});
  _$jscoverage['/align.js'].lineData[437]++;
  if (visit67_437_1(newElRegion.width != elRegion.width)) {
    _$jscoverage['/align.js'].lineData[438]++;
    self.set('width', el.width() + newElRegion.width - elRegion.width);
  }
  _$jscoverage['/align.js'].lineData[441]++;
  if (visit68_441_1(newElRegion.height != elRegion.height)) {
    _$jscoverage['/align.js'].lineData[442]++;
    self.set('height', el.height() + newElRegion.height - elRegion.height);
  }
  _$jscoverage['/align.js'].lineData[445]++;
  return self;
}, 
  center: function(node) {
  _$jscoverage['/align.js'].functionData[20]++;
  _$jscoverage['/align.js'].lineData[455]++;
  var self = this;
  _$jscoverage['/align.js'].lineData[456]++;
  self.set('align', {
  node: node, 
  points: ["cc", "cc"], 
  offset: [0, 0]});
  _$jscoverage['/align.js'].lineData[461]++;
  return self;
}, 
  __destructor: function() {
  _$jscoverage['/align.js'].functionData[21]++;
  _$jscoverage['/align.js'].lineData[465]++;
  if (visit69_465_1(this.$el)) {
    _$jscoverage['/align.js'].lineData[466]++;
    this.$el.getWindow().detach('resize', realign, this);
  }
}};
  _$jscoverage['/align.js'].lineData[471]++;
  return Align;
});
