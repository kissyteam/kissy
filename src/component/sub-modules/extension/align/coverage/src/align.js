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
  _$jscoverage['/align.js'].lineData[19] = 0;
  _$jscoverage['/align.js'].lineData[35] = 0;
  _$jscoverage['/align.js'].lineData[41] = 0;
  _$jscoverage['/align.js'].lineData[42] = 0;
  _$jscoverage['/align.js'].lineData[45] = 0;
  _$jscoverage['/align.js'].lineData[46] = 0;
  _$jscoverage['/align.js'].lineData[47] = 0;
  _$jscoverage['/align.js'].lineData[48] = 0;
  _$jscoverage['/align.js'].lineData[51] = 0;
  _$jscoverage['/align.js'].lineData[58] = 0;
  _$jscoverage['/align.js'].lineData[59] = 0;
  _$jscoverage['/align.js'].lineData[76] = 0;
  _$jscoverage['/align.js'].lineData[78] = 0;
  _$jscoverage['/align.js'].lineData[85] = 0;
  _$jscoverage['/align.js'].lineData[87] = 0;
  _$jscoverage['/align.js'].lineData[88] = 0;
  _$jscoverage['/align.js'].lineData[90] = 0;
  _$jscoverage['/align.js'].lineData[91] = 0;
  _$jscoverage['/align.js'].lineData[94] = 0;
  _$jscoverage['/align.js'].lineData[96] = 0;
  _$jscoverage['/align.js'].lineData[101] = 0;
  _$jscoverage['/align.js'].lineData[102] = 0;
  _$jscoverage['/align.js'].lineData[103] = 0;
  _$jscoverage['/align.js'].lineData[104] = 0;
  _$jscoverage['/align.js'].lineData[105] = 0;
  _$jscoverage['/align.js'].lineData[109] = 0;
  _$jscoverage['/align.js'].lineData[110] = 0;
  _$jscoverage['/align.js'].lineData[111] = 0;
  _$jscoverage['/align.js'].lineData[117] = 0;
  _$jscoverage['/align.js'].lineData[118] = 0;
  _$jscoverage['/align.js'].lineData[123] = 0;
  _$jscoverage['/align.js'].lineData[128] = 0;
  _$jscoverage['/align.js'].lineData[129] = 0;
  _$jscoverage['/align.js'].lineData[131] = 0;
  _$jscoverage['/align.js'].lineData[133] = 0;
  _$jscoverage['/align.js'].lineData[139] = 0;
  _$jscoverage['/align.js'].lineData[140] = 0;
  _$jscoverage['/align.js'].lineData[144] = 0;
  _$jscoverage['/align.js'].lineData[145] = 0;
  _$jscoverage['/align.js'].lineData[149] = 0;
  _$jscoverage['/align.js'].lineData[150] = 0;
  _$jscoverage['/align.js'].lineData[156] = 0;
  _$jscoverage['/align.js'].lineData[157] = 0;
  _$jscoverage['/align.js'].lineData[161] = 0;
  _$jscoverage['/align.js'].lineData[164] = 0;
  _$jscoverage['/align.js'].lineData[168] = 0;
  _$jscoverage['/align.js'].lineData[170] = 0;
  _$jscoverage['/align.js'].lineData[174] = 0;
  _$jscoverage['/align.js'].lineData[175] = 0;
  _$jscoverage['/align.js'].lineData[179] = 0;
  _$jscoverage['/align.js'].lineData[182] = 0;
  _$jscoverage['/align.js'].lineData[186] = 0;
  _$jscoverage['/align.js'].lineData[188] = 0;
  _$jscoverage['/align.js'].lineData[191] = 0;
  _$jscoverage['/align.js'].lineData[194] = 0;
  _$jscoverage['/align.js'].lineData[195] = 0;
  _$jscoverage['/align.js'].lineData[196] = 0;
  _$jscoverage['/align.js'].lineData[197] = 0;
  _$jscoverage['/align.js'].lineData[198] = 0;
  _$jscoverage['/align.js'].lineData[201] = 0;
  _$jscoverage['/align.js'].lineData[204] = 0;
  _$jscoverage['/align.js'].lineData[205] = 0;
  _$jscoverage['/align.js'].lineData[206] = 0;
  _$jscoverage['/align.js'].lineData[213] = 0;
  _$jscoverage['/align.js'].lineData[216] = 0;
  _$jscoverage['/align.js'].lineData[218] = 0;
  _$jscoverage['/align.js'].lineData[220] = 0;
  _$jscoverage['/align.js'].lineData[253] = 0;
  _$jscoverage['/align.js'].lineData[258] = 0;
  _$jscoverage['/align.js'].lineData[259] = 0;
  _$jscoverage['/align.js'].lineData[261] = 0;
  _$jscoverage['/align.js'].lineData[262] = 0;
  _$jscoverage['/align.js'].lineData[263] = 0;
  _$jscoverage['/align.js'].lineData[264] = 0;
  _$jscoverage['/align.js'].lineData[266] = 0;
  _$jscoverage['/align.js'].lineData[267] = 0;
  _$jscoverage['/align.js'].lineData[271] = 0;
  _$jscoverage['/align.js'].lineData[272] = 0;
  _$jscoverage['/align.js'].lineData[274] = 0;
  _$jscoverage['/align.js'].lineData[275] = 0;
  _$jscoverage['/align.js'].lineData[276] = 0;
  _$jscoverage['/align.js'].lineData[285] = 0;
  _$jscoverage['/align.js'].lineData[286] = 0;
  _$jscoverage['/align.js'].lineData[292] = 0;
  _$jscoverage['/align.js'].lineData[293] = 0;
  _$jscoverage['/align.js'].lineData[295] = 0;
  _$jscoverage['/align.js'].lineData[296] = 0;
  _$jscoverage['/align.js'].lineData[297] = 0;
  _$jscoverage['/align.js'].lineData[298] = 0;
  _$jscoverage['/align.js'].lineData[301] = 0;
  _$jscoverage['/align.js'].lineData[302] = 0;
  _$jscoverage['/align.js'].lineData[303] = 0;
  _$jscoverage['/align.js'].lineData[304] = 0;
  _$jscoverage['/align.js'].lineData[307] = 0;
  _$jscoverage['/align.js'].lineData[310] = 0;
  _$jscoverage['/align.js'].lineData[311] = 0;
  _$jscoverage['/align.js'].lineData[312] = 0;
  _$jscoverage['/align.js'].lineData[316] = 0;
  _$jscoverage['/align.js'].lineData[317] = 0;
  _$jscoverage['/align.js'].lineData[318] = 0;
  _$jscoverage['/align.js'].lineData[322] = 0;
  _$jscoverage['/align.js'].lineData[323] = 0;
  _$jscoverage['/align.js'].lineData[326] = 0;
  _$jscoverage['/align.js'].lineData[329] = 0;
  _$jscoverage['/align.js'].lineData[330] = 0;
  _$jscoverage['/align.js'].lineData[331] = 0;
  _$jscoverage['/align.js'].lineData[335] = 0;
  _$jscoverage['/align.js'].lineData[336] = 0;
  _$jscoverage['/align.js'].lineData[349] = 0;
  _$jscoverage['/align.js'].lineData[350] = 0;
  _$jscoverage['/align.js'].lineData[351] = 0;
  _$jscoverage['/align.js'].lineData[353] = 0;
  _$jscoverage['/align.js'].lineData[358] = 0;
  _$jscoverage['/align.js'].lineData[360] = 0;
  _$jscoverage['/align.js'].lineData[362] = 0;
  _$jscoverage['/align.js'].lineData[364] = 0;
  _$jscoverage['/align.js'].lineData[367] = 0;
  _$jscoverage['/align.js'].lineData[370] = 0;
  _$jscoverage['/align.js'].lineData[373] = 0;
  _$jscoverage['/align.js'].lineData[374] = 0;
  _$jscoverage['/align.js'].lineData[376] = 0;
  _$jscoverage['/align.js'].lineData[381] = 0;
  _$jscoverage['/align.js'].lineData[385] = 0;
  _$jscoverage['/align.js'].lineData[386] = 0;
  _$jscoverage['/align.js'].lineData[388] = 0;
  _$jscoverage['/align.js'].lineData[393] = 0;
  _$jscoverage['/align.js'].lineData[397] = 0;
  _$jscoverage['/align.js'].lineData[398] = 0;
  _$jscoverage['/align.js'].lineData[399] = 0;
  _$jscoverage['/align.js'].lineData[402] = 0;
  _$jscoverage['/align.js'].lineData[406] = 0;
  _$jscoverage['/align.js'].lineData[409] = 0;
  _$jscoverage['/align.js'].lineData[413] = 0;
  _$jscoverage['/align.js'].lineData[414] = 0;
  _$jscoverage['/align.js'].lineData[423] = 0;
  _$jscoverage['/align.js'].lineData[431] = 0;
  _$jscoverage['/align.js'].lineData[432] = 0;
  _$jscoverage['/align.js'].lineData[435] = 0;
  _$jscoverage['/align.js'].lineData[436] = 0;
  _$jscoverage['/align.js'].lineData[439] = 0;
  _$jscoverage['/align.js'].lineData[449] = 0;
  _$jscoverage['/align.js'].lineData[450] = 0;
  _$jscoverage['/align.js'].lineData[455] = 0;
  _$jscoverage['/align.js'].lineData[459] = 0;
  _$jscoverage['/align.js'].lineData[460] = 0;
  _$jscoverage['/align.js'].lineData[461] = 0;
  _$jscoverage['/align.js'].lineData[466] = 0;
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
  _$jscoverage['/align.js'].functionData[22] = 0;
}
if (! _$jscoverage['/align.js'].branchData) {
  _$jscoverage['/align.js'].branchData = {};
  _$jscoverage['/align.js'].branchData['39'] = [];
  _$jscoverage['/align.js'].branchData['39'][1] = new BranchData();
  _$jscoverage['/align.js'].branchData['39'][2] = new BranchData();
  _$jscoverage['/align.js'].branchData['39'][3] = new BranchData();
  _$jscoverage['/align.js'].branchData['41'] = [];
  _$jscoverage['/align.js'].branchData['41'][1] = new BranchData();
  _$jscoverage['/align.js'].branchData['42'] = [];
  _$jscoverage['/align.js'].branchData['42'][1] = new BranchData();
  _$jscoverage['/align.js'].branchData['45'] = [];
  _$jscoverage['/align.js'].branchData['45'][1] = new BranchData();
  _$jscoverage['/align.js'].branchData['45'][2] = new BranchData();
  _$jscoverage['/align.js'].branchData['47'] = [];
  _$jscoverage['/align.js'].branchData['47'][1] = new BranchData();
  _$jscoverage['/align.js'].branchData['78'] = [];
  _$jscoverage['/align.js'].branchData['78'][1] = new BranchData();
  _$jscoverage['/align.js'].branchData['78'][2] = new BranchData();
  _$jscoverage['/align.js'].branchData['78'][3] = new BranchData();
  _$jscoverage['/align.js'].branchData['82'] = [];
  _$jscoverage['/align.js'].branchData['82'][1] = new BranchData();
  _$jscoverage['/align.js'].branchData['82'][2] = new BranchData();
  _$jscoverage['/align.js'].branchData['83'] = [];
  _$jscoverage['/align.js'].branchData['83'][1] = new BranchData();
  _$jscoverage['/align.js'].branchData['83'][2] = new BranchData();
  _$jscoverage['/align.js'].branchData['84'] = [];
  _$jscoverage['/align.js'].branchData['84'][1] = new BranchData();
  _$jscoverage['/align.js'].branchData['111'] = [];
  _$jscoverage['/align.js'].branchData['111'][1] = new BranchData();
  _$jscoverage['/align.js'].branchData['111'][2] = new BranchData();
  _$jscoverage['/align.js'].branchData['111'][3] = new BranchData();
  _$jscoverage['/align.js'].branchData['111'][4] = new BranchData();
  _$jscoverage['/align.js'].branchData['112'] = [];
  _$jscoverage['/align.js'].branchData['112'][1] = new BranchData();
  _$jscoverage['/align.js'].branchData['112'][2] = new BranchData();
  _$jscoverage['/align.js'].branchData['113'] = [];
  _$jscoverage['/align.js'].branchData['113'][1] = new BranchData();
  _$jscoverage['/align.js'].branchData['140'] = [];
  _$jscoverage['/align.js'].branchData['140'][1] = new BranchData();
  _$jscoverage['/align.js'].branchData['140'][2] = new BranchData();
  _$jscoverage['/align.js'].branchData['141'] = [];
  _$jscoverage['/align.js'].branchData['141'][1] = new BranchData();
  _$jscoverage['/align.js'].branchData['145'] = [];
  _$jscoverage['/align.js'].branchData['145'][1] = new BranchData();
  _$jscoverage['/align.js'].branchData['145'][2] = new BranchData();
  _$jscoverage['/align.js'].branchData['146'] = [];
  _$jscoverage['/align.js'].branchData['146'][1] = new BranchData();
  _$jscoverage['/align.js'].branchData['156'] = [];
  _$jscoverage['/align.js'].branchData['156'][1] = new BranchData();
  _$jscoverage['/align.js'].branchData['156'][2] = new BranchData();
  _$jscoverage['/align.js'].branchData['161'] = [];
  _$jscoverage['/align.js'].branchData['161'][1] = new BranchData();
  _$jscoverage['/align.js'].branchData['162'] = [];
  _$jscoverage['/align.js'].branchData['162'][1] = new BranchData();
  _$jscoverage['/align.js'].branchData['162'][2] = new BranchData();
  _$jscoverage['/align.js'].branchData['163'] = [];
  _$jscoverage['/align.js'].branchData['163'][1] = new BranchData();
  _$jscoverage['/align.js'].branchData['168'] = [];
  _$jscoverage['/align.js'].branchData['168'][1] = new BranchData();
  _$jscoverage['/align.js'].branchData['168'][2] = new BranchData();
  _$jscoverage['/align.js'].branchData['174'] = [];
  _$jscoverage['/align.js'].branchData['174'][1] = new BranchData();
  _$jscoverage['/align.js'].branchData['174'][2] = new BranchData();
  _$jscoverage['/align.js'].branchData['179'] = [];
  _$jscoverage['/align.js'].branchData['179'][1] = new BranchData();
  _$jscoverage['/align.js'].branchData['180'] = [];
  _$jscoverage['/align.js'].branchData['180'][1] = new BranchData();
  _$jscoverage['/align.js'].branchData['180'][2] = new BranchData();
  _$jscoverage['/align.js'].branchData['181'] = [];
  _$jscoverage['/align.js'].branchData['181'][1] = new BranchData();
  _$jscoverage['/align.js'].branchData['186'] = [];
  _$jscoverage['/align.js'].branchData['186'][1] = new BranchData();
  _$jscoverage['/align.js'].branchData['186'][2] = new BranchData();
  _$jscoverage['/align.js'].branchData['261'] = [];
  _$jscoverage['/align.js'].branchData['261'][1] = new BranchData();
  _$jscoverage['/align.js'].branchData['295'] = [];
  _$jscoverage['/align.js'].branchData['295'][1] = new BranchData();
  _$jscoverage['/align.js'].branchData['297'] = [];
  _$jscoverage['/align.js'].branchData['297'][1] = new BranchData();
  _$jscoverage['/align.js'].branchData['301'] = [];
  _$jscoverage['/align.js'].branchData['301'][1] = new BranchData();
  _$jscoverage['/align.js'].branchData['303'] = [];
  _$jscoverage['/align.js'].branchData['303'][1] = new BranchData();
  _$jscoverage['/align.js'].branchData['311'] = [];
  _$jscoverage['/align.js'].branchData['311'][1] = new BranchData();
  _$jscoverage['/align.js'].branchData['311'][2] = new BranchData();
  _$jscoverage['/align.js'].branchData['317'] = [];
  _$jscoverage['/align.js'].branchData['317'][1] = new BranchData();
  _$jscoverage['/align.js'].branchData['335'] = [];
  _$jscoverage['/align.js'].branchData['335'][1] = new BranchData();
  _$jscoverage['/align.js'].branchData['349'] = [];
  _$jscoverage['/align.js'].branchData['349'][1] = new BranchData();
  _$jscoverage['/align.js'].branchData['350'] = [];
  _$jscoverage['/align.js'].branchData['350'][1] = new BranchData();
  _$jscoverage['/align.js'].branchData['350'][2] = new BranchData();
  _$jscoverage['/align.js'].branchData['351'] = [];
  _$jscoverage['/align.js'].branchData['351'][1] = new BranchData();
  _$jscoverage['/align.js'].branchData['370'] = [];
  _$jscoverage['/align.js'].branchData['370'][1] = new BranchData();
  _$jscoverage['/align.js'].branchData['370'][2] = new BranchData();
  _$jscoverage['/align.js'].branchData['373'] = [];
  _$jscoverage['/align.js'].branchData['373'][1] = new BranchData();
  _$jscoverage['/align.js'].branchData['385'] = [];
  _$jscoverage['/align.js'].branchData['385'][1] = new BranchData();
  _$jscoverage['/align.js'].branchData['397'] = [];
  _$jscoverage['/align.js'].branchData['397'][1] = new BranchData();
  _$jscoverage['/align.js'].branchData['406'] = [];
  _$jscoverage['/align.js'].branchData['406'][1] = new BranchData();
  _$jscoverage['/align.js'].branchData['409'] = [];
  _$jscoverage['/align.js'].branchData['409'][1] = new BranchData();
  _$jscoverage['/align.js'].branchData['413'] = [];
  _$jscoverage['/align.js'].branchData['413'][1] = new BranchData();
  _$jscoverage['/align.js'].branchData['431'] = [];
  _$jscoverage['/align.js'].branchData['431'][1] = new BranchData();
  _$jscoverage['/align.js'].branchData['435'] = [];
  _$jscoverage['/align.js'].branchData['435'][1] = new BranchData();
  _$jscoverage['/align.js'].branchData['460'] = [];
  _$jscoverage['/align.js'].branchData['460'][1] = new BranchData();
}
_$jscoverage['/align.js'].branchData['460'][1].init(48, 8, 'self.$el');
function visit69_460_1(result) {
  _$jscoverage['/align.js'].branchData['460'][1].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['435'][1].init(3268, 38, 'newElRegion.height !== elRegion.height');
function visit68_435_1(result) {
  _$jscoverage['/align.js'].branchData['435'][1].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['431'][1].init(3109, 36, 'newElRegion.width !== elRegion.width');
function visit67_431_1(result) {
  _$jscoverage['/align.js'].branchData['431'][1].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['413'][1].init(1505, 48, 'newOverflowCfg.adjustX || newOverflowCfg.adjustY');
function visit66_413_1(result) {
  _$jscoverage['/align.js'].branchData['413'][1].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['409'][1].init(1358, 84, 'overflow.adjustY && isFailY(elFuturePos, elRegion, visibleRect)');
function visit65_409_1(result) {
  _$jscoverage['/align.js'].branchData['409'][1].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['406'][1].init(1228, 84, 'overflow.adjustX && isFailX(elFuturePos, elRegion, visibleRect)');
function visit64_406_1(result) {
  _$jscoverage['/align.js'].branchData['406'][1].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['397'][1].init(884, 4, 'fail');
function visit63_397_1(result) {
  _$jscoverage['/align.js'].branchData['397'][1].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['385'][1].init(462, 43, 'isFailY(elFuturePos, elRegion, visibleRect)');
function visit62_385_1(result) {
  _$jscoverage['/align.js'].branchData['385'][1].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['373'][1].init(53, 43, 'isFailX(elFuturePos, elRegion, visibleRect)');
function visit61_373_1(result) {
  _$jscoverage['/align.js'].branchData['373'][1].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['370'][2].init(834, 36, 'overflow.adjustX || overflow.adjustY');
function visit60_370_2(result) {
  _$jscoverage['/align.js'].branchData['370'][2].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['370'][1].init(818, 53, 'visibleRect && (overflow.adjustX || overflow.adjustY)');
function visit59_370_1(result) {
  _$jscoverage['/align.js'].branchData['370'][1].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['351'][1].init(135, 14, 'overflow || {}');
function visit58_351_1(result) {
  _$jscoverage['/align.js'].branchData['351'][1].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['350'][2].init(72, 27, 'offset && [].concat(offset)');
function visit57_350_2(result) {
  _$jscoverage['/align.js'].branchData['350'][2].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['350'][1].init(72, 37, 'offset && [].concat(offset) || [0, 0]');
function visit56_350_1(result) {
  _$jscoverage['/align.js'].branchData['350'][1].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['349'][1].init(33, 14, 'refNode || win');
function visit55_349_1(result) {
  _$jscoverage['/align.js'].branchData['349'][1].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['335'][1].init(18, 13, 'v && v.points');
function visit54_335_1(result) {
  _$jscoverage['/align.js'].branchData['335'][1].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['317'][1].init(14, 19, 'this.get(\'visible\')');
function visit53_317_1(result) {
  _$jscoverage['/align.js'].branchData['317'][1].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['311'][2].init(14, 17, 'e.target === this');
function visit52_311_2(result) {
  _$jscoverage['/align.js'].branchData['311'][2].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['311'][1].init(14, 29, 'e.target === this && e.newVal');
function visit51_311_1(result) {
  _$jscoverage['/align.js'].branchData['311'][1].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['303'][1].init(396, 9, 'H === \'r\'');
function visit50_303_1(result) {
  _$jscoverage['/align.js'].branchData['303'][1].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['301'][1].init(337, 9, 'H === \'c\'');
function visit49_301_1(result) {
  _$jscoverage['/align.js'].branchData['301'][1].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['297'][1].init(278, 9, 'V === \'b\'');
function visit48_297_1(result) {
  _$jscoverage['/align.js'].branchData['297'][1].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['295'][1].init(219, 9, 'V === \'c\'');
function visit47_295_1(result) {
  _$jscoverage['/align.js'].branchData['295'][1].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['261'][1].init(73, 23, '!util.isWindow(domNode)');
function visit46_261_1(result) {
  _$jscoverage['/align.js'].branchData['261'][1].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['186'][2].init(1422, 42, 'pos.top + size.height > visibleRect.bottom');
function visit45_186_2(result) {
  _$jscoverage['/align.js'].branchData['186'][2].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['186'][1].init(1402, 62, 'overflow.adjustY && pos.top + size.height > visibleRect.bottom');
function visit44_186_1(result) {
  _$jscoverage['/align.js'].branchData['186'][1].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['181'][1].init(42, 42, 'pos.top + size.height > visibleRect.bottom');
function visit43_181_1(result) {
  _$jscoverage['/align.js'].branchData['181'][1].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['180'][2].init(1157, 26, 'pos.top >= visibleRect.top');
function visit42_180_2(result) {
  _$jscoverage['/align.js'].branchData['180'][2].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['180'][1].init(37, 85, 'pos.top >= visibleRect.top && pos.top + size.height > visibleRect.bottom');
function visit41_180_1(result) {
  _$jscoverage['/align.js'].branchData['180'][1].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['179'][1].init(1117, 123, 'overflow.resizeHeight && pos.top >= visibleRect.top && pos.top + size.height > visibleRect.bottom');
function visit40_179_1(result) {
  _$jscoverage['/align.js'].branchData['179'][1].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['174'][2].init(942, 25, 'pos.top < visibleRect.top');
function visit39_174_2(result) {
  _$jscoverage['/align.js'].branchData['174'][2].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['174'][1].init(922, 45, 'overflow.adjustY && pos.top < visibleRect.top');
function visit38_174_1(result) {
  _$jscoverage['/align.js'].branchData['174'][1].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['168'][2].init(680, 41, 'pos.left + size.width > visibleRect.right');
function visit37_168_2(result) {
  _$jscoverage['/align.js'].branchData['168'][2].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['168'][1].init(660, 61, 'overflow.adjustX && pos.left + size.width > visibleRect.right');
function visit36_168_1(result) {
  _$jscoverage['/align.js'].branchData['168'][1].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['163'][1].init(44, 41, 'pos.left + size.width > visibleRect.right');
function visit35_163_1(result) {
  _$jscoverage['/align.js'].branchData['163'][1].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['162'][2].init(417, 28, 'pos.left >= visibleRect.left');
function visit34_162_2(result) {
  _$jscoverage['/align.js'].branchData['162'][2].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['162'][1].init(36, 86, 'pos.left >= visibleRect.left && pos.left + size.width > visibleRect.right');
function visit33_162_1(result) {
  _$jscoverage['/align.js'].branchData['162'][1].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['161'][1].init(378, 123, 'overflow.resizeWidth && pos.left >= visibleRect.left && pos.left + size.width > visibleRect.right');
function visit32_161_1(result) {
  _$jscoverage['/align.js'].branchData['161'][1].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['156'][2].init(199, 27, 'pos.left < visibleRect.left');
function visit31_156_2(result) {
  _$jscoverage['/align.js'].branchData['156'][2].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['156'][1].init(179, 47, 'overflow.adjustX && pos.left < visibleRect.left');
function visit30_156_1(result) {
  _$jscoverage['/align.js'].branchData['156'][1].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['146'][1].init(49, 54, 'elFuturePos.top + elRegion.height > visibleRect.bottom');
function visit29_146_1(result) {
  _$jscoverage['/align.js'].branchData['146'][1].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['145'][2].init(17, 33, 'elFuturePos.top < visibleRect.top');
function visit28_145_2(result) {
  _$jscoverage['/align.js'].branchData['145'][2].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['145'][1].init(17, 104, 'elFuturePos.top < visibleRect.top || elFuturePos.top + elRegion.height > visibleRect.bottom');
function visit27_145_1(result) {
  _$jscoverage['/align.js'].branchData['145'][1].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['141'][1].init(51, 53, 'elFuturePos.left + elRegion.width > visibleRect.right');
function visit26_141_1(result) {
  _$jscoverage['/align.js'].branchData['141'][1].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['140'][2].init(17, 35, 'elFuturePos.left < visibleRect.left');
function visit25_140_2(result) {
  _$jscoverage['/align.js'].branchData['140'][2].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['140'][1].init(17, 105, 'elFuturePos.left < visibleRect.left || elFuturePos.left + elRegion.width > visibleRect.right');
function visit24_140_1(result) {
  _$jscoverage['/align.js'].branchData['140'][1].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['113'][1].init(121, 36, 'visibleRect.right > visibleRect.left');
function visit23_113_1(result) {
  _$jscoverage['/align.js'].branchData['113'][1].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['112'][2].init(71, 36, 'visibleRect.bottom > visibleRect.top');
function visit22_112_2(result) {
  _$jscoverage['/align.js'].branchData['112'][2].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['112'][1].init(37, 89, 'visibleRect.bottom > visibleRect.top && visibleRect.right > visibleRect.left');
function visit21_112_1(result) {
  _$jscoverage['/align.js'].branchData['112'][1].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['111'][4].init(32, 21, 'visibleRect.left >= 0');
function visit20_111_4(result) {
  _$jscoverage['/align.js'].branchData['111'][4].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['111'][3].init(23, 127, 'visibleRect.left >= 0 && visibleRect.bottom > visibleRect.top && visibleRect.right > visibleRect.left');
function visit19_111_3(result) {
  _$jscoverage['/align.js'].branchData['111'][3].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['111'][2].init(7, 20, 'visibleRect.top >= 0');
function visit18_111_2(result) {
  _$jscoverage['/align.js'].branchData['111'][2].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['111'][1].init(-1, 151, 'visibleRect.top >= 0 && visibleRect.left >= 0 && visibleRect.bottom > visibleRect.top && visibleRect.right > visibleRect.left');
function visit17_111_1(result) {
  _$jscoverage['/align.js'].branchData['111'][1].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['84'][1].init(46, 35, '$(el).css(\'overflow\') !== \'visible\'');
function visit16_84_1(result) {
  _$jscoverage['/align.js'].branchData['84'][1].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['83'][2].init(312, 22, 'el !== documentElement');
function visit15_83_2(result) {
  _$jscoverage['/align.js'].branchData['83'][2].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['83'][1].init(35, 82, 'el !== documentElement && $(el).css(\'overflow\') !== \'visible\'');
function visit14_83_1(result) {
  _$jscoverage['/align.js'].branchData['83'][1].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['82'][2].init(274, 11, 'el !== body');
function visit13_82_2(result) {
  _$jscoverage['/align.js'].branchData['82'][2].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['82'][1].init(274, 118, 'el !== body && el !== documentElement && $(el).css(\'overflow\') !== \'visible\'');
function visit12_82_1(result) {
  _$jscoverage['/align.js'].branchData['82'][1].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['78'][3].init(98, 20, 'el.clientWidth !== 0');
function visit11_78_3(result) {
  _$jscoverage['/align.js'].branchData['78'][3].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['78'][2].init(88, 30, '!UA.ie || el.clientWidth !== 0');
function visit10_78_2(result) {
  _$jscoverage['/align.js'].branchData['78'][2].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['78'][1].init(88, 394, '(!UA.ie || el.clientWidth !== 0) && (el !== body && el !== documentElement && $(el).css(\'overflow\') !== \'visible\')');
function visit9_78_1(result) {
  _$jscoverage['/align.js'].branchData['78'][1].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['47'][1].init(74, 26, 'positionStyle !== \'static\'');
function visit8_47_1(result) {
  _$jscoverage['/align.js'].branchData['47'][1].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['45'][2].init(1075, 15, 'parent !== body');
function visit7_45_2(result) {
  _$jscoverage['/align.js'].branchData['45'][2].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['45'][1].init(1065, 25, 'parent && parent !== body');
function visit6_45_1(result) {
  _$jscoverage['/align.js'].branchData['45'][1].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['42'][1].init(21, 41, 'element.nodeName.toLowerCase() === \'html\'');
function visit5_42_1(result) {
  _$jscoverage['/align.js'].branchData['42'][1].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['41'][1].init(903, 11, '!skipStatic');
function visit4_41_1(result) {
  _$jscoverage['/align.js'].branchData['41'][1].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['39'][3].init(195, 28, 'positionStyle === \'absolute\'');
function visit3_39_3(result) {
  _$jscoverage['/align.js'].branchData['39'][3].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['39'][2].init(166, 25, 'positionStyle === \'fixed\'');
function visit2_39_2(result) {
  _$jscoverage['/align.js'].branchData['39'][2].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['39'][1].init(166, 57, 'positionStyle === \'fixed\' || positionStyle === \'absolute\'');
function visit1_39_1(result) {
  _$jscoverage['/align.js'].branchData['39'][1].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/align.js'].functionData[0]++;
  _$jscoverage['/align.js'].lineData[7]++;
  var util = require('util');
  _$jscoverage['/align.js'].lineData[8]++;
  var Node = require('node');
  _$jscoverage['/align.js'].lineData[9]++;
  var win = S.Env.host, $ = Node.all, UA = require('ua');
  _$jscoverage['/align.js'].lineData[19]++;
  function getOffsetParent(element) {
    _$jscoverage['/align.js'].functionData[1]++;
    _$jscoverage['/align.js'].lineData[35]++;
    var doc = element.ownerDocument, body = doc.body, parent, positionStyle = $(element).css('position'), skipStatic = visit1_39_1(visit2_39_2(positionStyle === 'fixed') || visit3_39_3(positionStyle === 'absolute'));
    _$jscoverage['/align.js'].lineData[41]++;
    if (visit4_41_1(!skipStatic)) {
      _$jscoverage['/align.js'].lineData[42]++;
      return visit5_42_1(element.nodeName.toLowerCase() === 'html') ? null : element.parentNode;
    }
    _$jscoverage['/align.js'].lineData[45]++;
    for (parent = element.parentNode; visit6_45_1(parent && visit7_45_2(parent !== body)); parent = parent.parentNode) {
      _$jscoverage['/align.js'].lineData[46]++;
      positionStyle = $(parent).css('position');
      _$jscoverage['/align.js'].lineData[47]++;
      if (visit8_47_1(positionStyle !== 'static')) {
        _$jscoverage['/align.js'].lineData[48]++;
        return parent;
      }
    }
    _$jscoverage['/align.js'].lineData[51]++;
    return null;
  }
  _$jscoverage['/align.js'].lineData[58]++;
  function getVisibleRectForElement(element) {
    _$jscoverage['/align.js'].functionData[2]++;
    _$jscoverage['/align.js'].lineData[59]++;
    var visibleRect = {
  left: 0, 
  right: Infinity, 
  top: 0, 
  bottom: Infinity}, el, scrollX, scrollY, winSize, doc = element.ownerDocument, $win = $(doc).getWindow(), body = doc.body, documentElement = doc.documentElement;
    _$jscoverage['/align.js'].lineData[76]++;
    for (el = element; (el = getOffsetParent(el)); ) {
      _$jscoverage['/align.js'].lineData[78]++;
      if (visit9_78_1((visit10_78_2(!UA.ie || visit11_78_3(el.clientWidth !== 0))) && (visit12_82_1(visit13_82_2(el !== body) && visit14_83_1(visit15_83_2(el !== documentElement) && visit16_84_1($(el).css('overflow') !== 'visible')))))) {
        _$jscoverage['/align.js'].lineData[85]++;
        var pos = $(el).offset();
        _$jscoverage['/align.js'].lineData[87]++;
        pos.left += el.clientLeft;
        _$jscoverage['/align.js'].lineData[88]++;
        pos.top += el.clientTop;
        _$jscoverage['/align.js'].lineData[90]++;
        visibleRect.top = Math.max(visibleRect.top, pos.top);
        _$jscoverage['/align.js'].lineData[91]++;
        visibleRect.right = Math.min(visibleRect.right, pos.left + el.clientWidth);
        _$jscoverage['/align.js'].lineData[94]++;
        visibleRect.bottom = Math.min(visibleRect.bottom, pos.top + el.clientHeight);
        _$jscoverage['/align.js'].lineData[96]++;
        visibleRect.left = Math.max(visibleRect.left, pos.left);
      }
    }
    _$jscoverage['/align.js'].lineData[101]++;
    scrollX = $win.scrollLeft();
    _$jscoverage['/align.js'].lineData[102]++;
    scrollY = $win.scrollTop();
    _$jscoverage['/align.js'].lineData[103]++;
    visibleRect.left = Math.max(visibleRect.left, scrollX);
    _$jscoverage['/align.js'].lineData[104]++;
    visibleRect.top = Math.max(visibleRect.top, scrollY);
    _$jscoverage['/align.js'].lineData[105]++;
    winSize = {
  width: $win.width(), 
  height: $win.height()};
    _$jscoverage['/align.js'].lineData[109]++;
    visibleRect.right = Math.min(visibleRect.right, scrollX + winSize.width);
    _$jscoverage['/align.js'].lineData[110]++;
    visibleRect.bottom = Math.min(visibleRect.bottom, scrollY + winSize.height);
    _$jscoverage['/align.js'].lineData[111]++;
    return visit17_111_1(visit18_111_2(visibleRect.top >= 0) && visit19_111_3(visit20_111_4(visibleRect.left >= 0) && visit21_112_1(visit22_112_2(visibleRect.bottom > visibleRect.top) && visit23_113_1(visibleRect.right > visibleRect.left)))) ? visibleRect : null;
  }
  _$jscoverage['/align.js'].lineData[117]++;
  function getElFuturePos(elRegion, refNodeRegion, points, offset) {
    _$jscoverage['/align.js'].functionData[3]++;
    _$jscoverage['/align.js'].lineData[118]++;
    var xy, diff, p1, p2;
    _$jscoverage['/align.js'].lineData[123]++;
    xy = {
  left: elRegion.left, 
  top: elRegion.top};
    _$jscoverage['/align.js'].lineData[128]++;
    p1 = getAlignOffset(refNodeRegion, points[0]);
    _$jscoverage['/align.js'].lineData[129]++;
    p2 = getAlignOffset(elRegion, points[1]);
    _$jscoverage['/align.js'].lineData[131]++;
    diff = [p2.left - p1.left, p2.top - p1.top];
    _$jscoverage['/align.js'].lineData[133]++;
    return {
  left: xy.left - diff[0] + (+offset[0]), 
  top: xy.top - diff[1] + (+offset[1])};
  }
  _$jscoverage['/align.js'].lineData[139]++;
  function isFailX(elFuturePos, elRegion, visibleRect) {
    _$jscoverage['/align.js'].functionData[4]++;
    _$jscoverage['/align.js'].lineData[140]++;
    return visit24_140_1(visit25_140_2(elFuturePos.left < visibleRect.left) || visit26_141_1(elFuturePos.left + elRegion.width > visibleRect.right));
  }
  _$jscoverage['/align.js'].lineData[144]++;
  function isFailY(elFuturePos, elRegion, visibleRect) {
    _$jscoverage['/align.js'].functionData[5]++;
    _$jscoverage['/align.js'].lineData[145]++;
    return visit27_145_1(visit28_145_2(elFuturePos.top < visibleRect.top) || visit29_146_1(elFuturePos.top + elRegion.height > visibleRect.bottom));
  }
  _$jscoverage['/align.js'].lineData[149]++;
  function adjustForViewport(elFuturePos, elRegion, visibleRect, overflow) {
    _$jscoverage['/align.js'].functionData[6]++;
    _$jscoverage['/align.js'].lineData[150]++;
    var pos = util.clone(elFuturePos), size = {
  width: elRegion.width, 
  height: elRegion.height};
    _$jscoverage['/align.js'].lineData[156]++;
    if (visit30_156_1(overflow.adjustX && visit31_156_2(pos.left < visibleRect.left))) {
      _$jscoverage['/align.js'].lineData[157]++;
      pos.left = visibleRect.left;
    }
    _$jscoverage['/align.js'].lineData[161]++;
    if (visit32_161_1(overflow.resizeWidth && visit33_162_1(visit34_162_2(pos.left >= visibleRect.left) && visit35_163_1(pos.left + size.width > visibleRect.right)))) {
      _$jscoverage['/align.js'].lineData[164]++;
      size.width -= (pos.left + size.width) - visibleRect.right;
    }
    _$jscoverage['/align.js'].lineData[168]++;
    if (visit36_168_1(overflow.adjustX && visit37_168_2(pos.left + size.width > visibleRect.right))) {
      _$jscoverage['/align.js'].lineData[170]++;
      pos.left = Math.max(visibleRect.right - size.width, visibleRect.left);
    }
    _$jscoverage['/align.js'].lineData[174]++;
    if (visit38_174_1(overflow.adjustY && visit39_174_2(pos.top < visibleRect.top))) {
      _$jscoverage['/align.js'].lineData[175]++;
      pos.top = visibleRect.top;
    }
    _$jscoverage['/align.js'].lineData[179]++;
    if (visit40_179_1(overflow.resizeHeight && visit41_180_1(visit42_180_2(pos.top >= visibleRect.top) && visit43_181_1(pos.top + size.height > visibleRect.bottom)))) {
      _$jscoverage['/align.js'].lineData[182]++;
      size.height -= (pos.top + size.height) - visibleRect.bottom;
    }
    _$jscoverage['/align.js'].lineData[186]++;
    if (visit44_186_1(overflow.adjustY && visit45_186_2(pos.top + size.height > visibleRect.bottom))) {
      _$jscoverage['/align.js'].lineData[188]++;
      pos.top = Math.max(visibleRect.bottom - size.height, visibleRect.top);
    }
    _$jscoverage['/align.js'].lineData[191]++;
    return util.mix(pos, size);
  }
  _$jscoverage['/align.js'].lineData[194]++;
  function flip(points, reg, map) {
    _$jscoverage['/align.js'].functionData[7]++;
    _$jscoverage['/align.js'].lineData[195]++;
    var ret = [];
    _$jscoverage['/align.js'].lineData[196]++;
    util.each(points, function(p) {
  _$jscoverage['/align.js'].functionData[8]++;
  _$jscoverage['/align.js'].lineData[197]++;
  ret.push(p.replace(reg, function(m) {
  _$jscoverage['/align.js'].functionData[9]++;
  _$jscoverage['/align.js'].lineData[198]++;
  return map[m];
}));
});
    _$jscoverage['/align.js'].lineData[201]++;
    return ret;
  }
  _$jscoverage['/align.js'].lineData[204]++;
  function flipOffset(offset, index) {
    _$jscoverage['/align.js'].functionData[10]++;
    _$jscoverage['/align.js'].lineData[205]++;
    offset[index] = -offset[index];
    _$jscoverage['/align.js'].lineData[206]++;
    return offset;
  }
  _$jscoverage['/align.js'].lineData[213]++;
  function Align() {
    _$jscoverage['/align.js'].functionData[11]++;
  }
  _$jscoverage['/align.js'].lineData[216]++;
  Align.__getOffsetParent = getOffsetParent;
  _$jscoverage['/align.js'].lineData[218]++;
  Align.__getVisibleRectForElement = getVisibleRectForElement;
  _$jscoverage['/align.js'].lineData[220]++;
  Align.ATTRS = {
  align: {
  valueFn: function() {
  _$jscoverage['/align.js'].functionData[12]++;
  _$jscoverage['/align.js'].lineData[253]++;
  return {};
}}};
  _$jscoverage['/align.js'].lineData[258]++;
  function getRegion(node) {
    _$jscoverage['/align.js'].functionData[13]++;
    _$jscoverage['/align.js'].lineData[259]++;
    var offset, w, h, domNode = node[0];
    _$jscoverage['/align.js'].lineData[261]++;
    if (visit46_261_1(!util.isWindow(domNode))) {
      _$jscoverage['/align.js'].lineData[262]++;
      offset = node.offset();
      _$jscoverage['/align.js'].lineData[263]++;
      w = node.outerWidth();
      _$jscoverage['/align.js'].lineData[264]++;
      h = node.outerHeight();
    } else {
      _$jscoverage['/align.js'].lineData[266]++;
      var $win = $(domNode).getWindow();
      _$jscoverage['/align.js'].lineData[267]++;
      offset = {
  left: $win.scrollLeft(), 
  top: $win.scrollTop()};
      _$jscoverage['/align.js'].lineData[271]++;
      w = $win.width();
      _$jscoverage['/align.js'].lineData[272]++;
      h = $win.height();
    }
    _$jscoverage['/align.js'].lineData[274]++;
    offset.width = w;
    _$jscoverage['/align.js'].lineData[275]++;
    offset.height = h;
    _$jscoverage['/align.js'].lineData[276]++;
    return offset;
  }
  _$jscoverage['/align.js'].lineData[285]++;
  function getAlignOffset(region, align) {
    _$jscoverage['/align.js'].functionData[14]++;
    _$jscoverage['/align.js'].lineData[286]++;
    var V = align.charAt(0), H = align.charAt(1), w = region.width, h = region.height, x, y;
    _$jscoverage['/align.js'].lineData[292]++;
    x = region.left;
    _$jscoverage['/align.js'].lineData[293]++;
    y = region.top;
    _$jscoverage['/align.js'].lineData[295]++;
    if (visit47_295_1(V === 'c')) {
      _$jscoverage['/align.js'].lineData[296]++;
      y += h / 2;
    } else {
      _$jscoverage['/align.js'].lineData[297]++;
      if (visit48_297_1(V === 'b')) {
        _$jscoverage['/align.js'].lineData[298]++;
        y += h;
      }
    }
    _$jscoverage['/align.js'].lineData[301]++;
    if (visit49_301_1(H === 'c')) {
      _$jscoverage['/align.js'].lineData[302]++;
      x += w / 2;
    } else {
      _$jscoverage['/align.js'].lineData[303]++;
      if (visit50_303_1(H === 'r')) {
        _$jscoverage['/align.js'].lineData[304]++;
        x += w;
      }
    }
    _$jscoverage['/align.js'].lineData[307]++;
    return {
  left: x, 
  top: y};
  }
  _$jscoverage['/align.js'].lineData[310]++;
  function beforeVisibleChange(e) {
    _$jscoverage['/align.js'].functionData[15]++;
    _$jscoverage['/align.js'].lineData[311]++;
    if (visit51_311_1(visit52_311_2(e.target === this) && e.newVal)) {
      _$jscoverage['/align.js'].lineData[312]++;
      realign.call(this);
    }
  }
  _$jscoverage['/align.js'].lineData[316]++;
  function onResize() {
    _$jscoverage['/align.js'].functionData[16]++;
    _$jscoverage['/align.js'].lineData[317]++;
    if (visit53_317_1(this.get('visible'))) {
      _$jscoverage['/align.js'].lineData[318]++;
      realign.call(this);
    }
  }
  _$jscoverage['/align.js'].lineData[322]++;
  function realign() {
    _$jscoverage['/align.js'].functionData[17]++;
    _$jscoverage['/align.js'].lineData[323]++;
    this._onSetAlign(this.get('align'));
  }
  _$jscoverage['/align.js'].lineData[326]++;
  Align.prototype = {
  __bindUI: function() {
  _$jscoverage['/align.js'].functionData[18]++;
  _$jscoverage['/align.js'].lineData[329]++;
  var self = this;
  _$jscoverage['/align.js'].lineData[330]++;
  self.on('beforeVisibleChange', beforeVisibleChange, self);
  _$jscoverage['/align.js'].lineData[331]++;
  self.$el.getWindow().on('resize', onResize, self);
}, 
  _onSetAlign: function(v) {
  _$jscoverage['/align.js'].functionData[19]++;
  _$jscoverage['/align.js'].lineData[335]++;
  if (visit54_335_1(v && v.points)) {
    _$jscoverage['/align.js'].lineData[336]++;
    this.align(v.node, v.points, v.offset, v.overflow);
  }
}, 
  align: function(refNode, points, offset, overflow) {
  _$jscoverage['/align.js'].functionData[20]++;
  _$jscoverage['/align.js'].lineData[349]++;
  refNode = Node.one(visit55_349_1(refNode || win));
  _$jscoverage['/align.js'].lineData[350]++;
  offset = visit56_350_1(visit57_350_2(offset && [].concat(offset)) || [0, 0]);
  _$jscoverage['/align.js'].lineData[351]++;
  overflow = visit58_351_1(overflow || {});
  _$jscoverage['/align.js'].lineData[353]++;
  var self = this, el = self.$el, fail = 0;
  _$jscoverage['/align.js'].lineData[358]++;
  var visibleRect = getVisibleRectForElement(el[0]);
  _$jscoverage['/align.js'].lineData[360]++;
  var elRegion = getRegion(el);
  _$jscoverage['/align.js'].lineData[362]++;
  var refNodeRegion = getRegion(refNode);
  _$jscoverage['/align.js'].lineData[364]++;
  var elFuturePos = getElFuturePos(elRegion, refNodeRegion, points, offset);
  _$jscoverage['/align.js'].lineData[367]++;
  var newElRegion = util.merge(elRegion, elFuturePos);
  _$jscoverage['/align.js'].lineData[370]++;
  if (visit59_370_1(visibleRect && (visit60_370_2(overflow.adjustX || overflow.adjustY)))) {
    _$jscoverage['/align.js'].lineData[373]++;
    if (visit61_373_1(isFailX(elFuturePos, elRegion, visibleRect))) {
      _$jscoverage['/align.js'].lineData[374]++;
      fail = 1;
      _$jscoverage['/align.js'].lineData[376]++;
      points = flip(points, /[lr]/ig, {
  l: 'r', 
  r: 'l'});
      _$jscoverage['/align.js'].lineData[381]++;
      offset = flipOffset(offset, 0);
    }
    _$jscoverage['/align.js'].lineData[385]++;
    if (visit62_385_1(isFailY(elFuturePos, elRegion, visibleRect))) {
      _$jscoverage['/align.js'].lineData[386]++;
      fail = 1;
      _$jscoverage['/align.js'].lineData[388]++;
      points = flip(points, /[tb]/ig, {
  t: 'b', 
  b: 't'});
      _$jscoverage['/align.js'].lineData[393]++;
      offset = flipOffset(offset, 1);
    }
    _$jscoverage['/align.js'].lineData[397]++;
    if (visit63_397_1(fail)) {
      _$jscoverage['/align.js'].lineData[398]++;
      elFuturePos = getElFuturePos(elRegion, refNodeRegion, points, offset);
      _$jscoverage['/align.js'].lineData[399]++;
      util.mix(newElRegion, elFuturePos);
    }
    _$jscoverage['/align.js'].lineData[402]++;
    var newOverflowCfg = {};
    _$jscoverage['/align.js'].lineData[406]++;
    newOverflowCfg.adjustX = visit64_406_1(overflow.adjustX && isFailX(elFuturePos, elRegion, visibleRect));
    _$jscoverage['/align.js'].lineData[409]++;
    newOverflowCfg.adjustY = visit65_409_1(overflow.adjustY && isFailY(elFuturePos, elRegion, visibleRect));
    _$jscoverage['/align.js'].lineData[413]++;
    if (visit66_413_1(newOverflowCfg.adjustX || newOverflowCfg.adjustY)) {
      _$jscoverage['/align.js'].lineData[414]++;
      newElRegion = adjustForViewport(elFuturePos, elRegion, visibleRect, newOverflowCfg);
    }
  }
  _$jscoverage['/align.js'].lineData[423]++;
  self.set({
  x: newElRegion.left, 
  y: newElRegion.top}, {
  force: 1});
  _$jscoverage['/align.js'].lineData[431]++;
  if (visit67_431_1(newElRegion.width !== elRegion.width)) {
    _$jscoverage['/align.js'].lineData[432]++;
    self.set('width', el.width() + newElRegion.width - elRegion.width);
  }
  _$jscoverage['/align.js'].lineData[435]++;
  if (visit68_435_1(newElRegion.height !== elRegion.height)) {
    _$jscoverage['/align.js'].lineData[436]++;
    self.set('height', el.height() + newElRegion.height - elRegion.height);
  }
  _$jscoverage['/align.js'].lineData[439]++;
  return self;
}, 
  center: function(node) {
  _$jscoverage['/align.js'].functionData[21]++;
  _$jscoverage['/align.js'].lineData[449]++;
  var self = this;
  _$jscoverage['/align.js'].lineData[450]++;
  self.set('align', {
  node: node, 
  points: ['cc', 'cc'], 
  offset: [0, 0]});
  _$jscoverage['/align.js'].lineData[455]++;
  return self;
}, 
  __destructor: function() {
  _$jscoverage['/align.js'].functionData[22]++;
  _$jscoverage['/align.js'].lineData[459]++;
  var self = this;
  _$jscoverage['/align.js'].lineData[460]++;
  if (visit69_460_1(self.$el)) {
    _$jscoverage['/align.js'].lineData[461]++;
    self.$el.getWindow().detach('resize', onResize, self);
  }
}};
  _$jscoverage['/align.js'].lineData[466]++;
  return Align;
});
