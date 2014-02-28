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
if (! _$jscoverage['/touch.js']) {
  _$jscoverage['/touch.js'] = {};
  _$jscoverage['/touch.js'].lineData = [];
  _$jscoverage['/touch.js'].lineData[6] = 0;
  _$jscoverage['/touch.js'].lineData[7] = 0;
  _$jscoverage['/touch.js'].lineData[8] = 0;
  _$jscoverage['/touch.js'].lineData[9] = 0;
  _$jscoverage['/touch.js'].lineData[10] = 0;
  _$jscoverage['/touch.js'].lineData[12] = 0;
  _$jscoverage['/touch.js'].lineData[14] = 0;
  _$jscoverage['/touch.js'].lineData[16] = 0;
  _$jscoverage['/touch.js'].lineData[18] = 0;
  _$jscoverage['/touch.js'].lineData[20] = 0;
  _$jscoverage['/touch.js'].lineData[22] = 0;
  _$jscoverage['/touch.js'].lineData[24] = 0;
  _$jscoverage['/touch.js'].lineData[25] = 0;
  _$jscoverage['/touch.js'].lineData[27] = 0;
  _$jscoverage['/touch.js'].lineData[28] = 0;
  _$jscoverage['/touch.js'].lineData[29] = 0;
  _$jscoverage['/touch.js'].lineData[32] = 0;
  _$jscoverage['/touch.js'].lineData[33] = 0;
  _$jscoverage['/touch.js'].lineData[34] = 0;
  _$jscoverage['/touch.js'].lineData[36] = 0;
  _$jscoverage['/touch.js'].lineData[40] = 0;
  _$jscoverage['/touch.js'].lineData[42] = 0;
  _$jscoverage['/touch.js'].lineData[53] = 0;
  _$jscoverage['/touch.js'].lineData[54] = 0;
  _$jscoverage['/touch.js'].lineData[55] = 0;
  _$jscoverage['/touch.js'].lineData[58] = 0;
  _$jscoverage['/touch.js'].lineData[59] = 0;
  _$jscoverage['/touch.js'].lineData[62] = 0;
  _$jscoverage['/touch.js'].lineData[63] = 0;
  _$jscoverage['/touch.js'].lineData[64] = 0;
  _$jscoverage['/touch.js'].lineData[65] = 0;
  _$jscoverage['/touch.js'].lineData[66] = 0;
  _$jscoverage['/touch.js'].lineData[67] = 0;
  _$jscoverage['/touch.js'].lineData[68] = 0;
  _$jscoverage['/touch.js'].lineData[69] = 0;
  _$jscoverage['/touch.js'].lineData[72] = 0;
  _$jscoverage['/touch.js'].lineData[75] = 0;
  _$jscoverage['/touch.js'].lineData[77] = 0;
  _$jscoverage['/touch.js'].lineData[78] = 0;
  _$jscoverage['/touch.js'].lineData[82] = 0;
  _$jscoverage['/touch.js'].lineData[83] = 0;
  _$jscoverage['/touch.js'].lineData[85] = 0;
  _$jscoverage['/touch.js'].lineData[88] = 0;
  _$jscoverage['/touch.js'].lineData[89] = 0;
  _$jscoverage['/touch.js'].lineData[90] = 0;
  _$jscoverage['/touch.js'].lineData[91] = 0;
  _$jscoverage['/touch.js'].lineData[93] = 0;
  _$jscoverage['/touch.js'].lineData[96] = 0;
  _$jscoverage['/touch.js'].lineData[97] = 0;
  _$jscoverage['/touch.js'].lineData[98] = 0;
  _$jscoverage['/touch.js'].lineData[99] = 0;
  _$jscoverage['/touch.js'].lineData[101] = 0;
  _$jscoverage['/touch.js'].lineData[108] = 0;
  _$jscoverage['/touch.js'].lineData[109] = 0;
  _$jscoverage['/touch.js'].lineData[110] = 0;
  _$jscoverage['/touch.js'].lineData[111] = 0;
  _$jscoverage['/touch.js'].lineData[113] = 0;
  _$jscoverage['/touch.js'].lineData[114] = 0;
  _$jscoverage['/touch.js'].lineData[115] = 0;
  _$jscoverage['/touch.js'].lineData[116] = 0;
  _$jscoverage['/touch.js'].lineData[122] = 0;
  _$jscoverage['/touch.js'].lineData[125] = 0;
  _$jscoverage['/touch.js'].lineData[126] = 0;
  _$jscoverage['/touch.js'].lineData[127] = 0;
  _$jscoverage['/touch.js'].lineData[130] = 0;
  _$jscoverage['/touch.js'].lineData[131] = 0;
  _$jscoverage['/touch.js'].lineData[135] = 0;
  _$jscoverage['/touch.js'].lineData[136] = 0;
  _$jscoverage['/touch.js'].lineData[137] = 0;
  _$jscoverage['/touch.js'].lineData[143] = 0;
  _$jscoverage['/touch.js'].lineData[145] = 0;
  _$jscoverage['/touch.js'].lineData[150] = 0;
  _$jscoverage['/touch.js'].lineData[161] = 0;
  _$jscoverage['/touch.js'].lineData[162] = 0;
  _$jscoverage['/touch.js'].lineData[164] = 0;
  _$jscoverage['/touch.js'].lineData[167] = 0;
  _$jscoverage['/touch.js'].lineData[168] = 0;
  _$jscoverage['/touch.js'].lineData[169] = 0;
  _$jscoverage['/touch.js'].lineData[170] = 0;
  _$jscoverage['/touch.js'].lineData[171] = 0;
  _$jscoverage['/touch.js'].lineData[173] = 0;
  _$jscoverage['/touch.js'].lineData[175] = 0;
  _$jscoverage['/touch.js'].lineData[176] = 0;
  _$jscoverage['/touch.js'].lineData[177] = 0;
  _$jscoverage['/touch.js'].lineData[178] = 0;
  _$jscoverage['/touch.js'].lineData[179] = 0;
  _$jscoverage['/touch.js'].lineData[182] = 0;
  _$jscoverage['/touch.js'].lineData[183] = 0;
  _$jscoverage['/touch.js'].lineData[187] = 0;
  _$jscoverage['/touch.js'].lineData[189] = 0;
  _$jscoverage['/touch.js'].lineData[190] = 0;
  _$jscoverage['/touch.js'].lineData[192] = 0;
  _$jscoverage['/touch.js'].lineData[193] = 0;
  _$jscoverage['/touch.js'].lineData[194] = 0;
  _$jscoverage['/touch.js'].lineData[196] = 0;
  _$jscoverage['/touch.js'].lineData[197] = 0;
  _$jscoverage['/touch.js'].lineData[198] = 0;
  _$jscoverage['/touch.js'].lineData[200] = 0;
  _$jscoverage['/touch.js'].lineData[201] = 0;
  _$jscoverage['/touch.js'].lineData[207] = 0;
  _$jscoverage['/touch.js'].lineData[209] = 0;
  _$jscoverage['/touch.js'].lineData[211] = 0;
  _$jscoverage['/touch.js'].lineData[213] = 0;
  _$jscoverage['/touch.js'].lineData[217] = 0;
  _$jscoverage['/touch.js'].lineData[218] = 0;
  _$jscoverage['/touch.js'].lineData[219] = 0;
  _$jscoverage['/touch.js'].lineData[221] = 0;
  _$jscoverage['/touch.js'].lineData[226] = 0;
  _$jscoverage['/touch.js'].lineData[229] = 0;
  _$jscoverage['/touch.js'].lineData[230] = 0;
  _$jscoverage['/touch.js'].lineData[232] = 0;
  _$jscoverage['/touch.js'].lineData[234] = 0;
  _$jscoverage['/touch.js'].lineData[237] = 0;
  _$jscoverage['/touch.js'].lineData[239] = 0;
  _$jscoverage['/touch.js'].lineData[243] = 0;
  _$jscoverage['/touch.js'].lineData[244] = 0;
  _$jscoverage['/touch.js'].lineData[245] = 0;
  _$jscoverage['/touch.js'].lineData[247] = 0;
  _$jscoverage['/touch.js'].lineData[249] = 0;
  _$jscoverage['/touch.js'].lineData[251] = 0;
  _$jscoverage['/touch.js'].lineData[253] = 0;
  _$jscoverage['/touch.js'].lineData[254] = 0;
  _$jscoverage['/touch.js'].lineData[255] = 0;
  _$jscoverage['/touch.js'].lineData[256] = 0;
  _$jscoverage['/touch.js'].lineData[259] = 0;
  _$jscoverage['/touch.js'].lineData[262] = 0;
  _$jscoverage['/touch.js'].lineData[264] = 0;
  _$jscoverage['/touch.js'].lineData[265] = 0;
  _$jscoverage['/touch.js'].lineData[267] = 0;
  _$jscoverage['/touch.js'].lineData[270] = 0;
  _$jscoverage['/touch.js'].lineData[275] = 0;
  _$jscoverage['/touch.js'].lineData[276] = 0;
  _$jscoverage['/touch.js'].lineData[279] = 0;
  _$jscoverage['/touch.js'].lineData[280] = 0;
  _$jscoverage['/touch.js'].lineData[282] = 0;
  _$jscoverage['/touch.js'].lineData[283] = 0;
  _$jscoverage['/touch.js'].lineData[284] = 0;
  _$jscoverage['/touch.js'].lineData[288] = 0;
  _$jscoverage['/touch.js'].lineData[292] = 0;
  _$jscoverage['/touch.js'].lineData[293] = 0;
  _$jscoverage['/touch.js'].lineData[295] = 0;
  _$jscoverage['/touch.js'].lineData[296] = 0;
  _$jscoverage['/touch.js'].lineData[299] = 0;
  _$jscoverage['/touch.js'].lineData[301] = 0;
  _$jscoverage['/touch.js'].lineData[302] = 0;
  _$jscoverage['/touch.js'].lineData[303] = 0;
  _$jscoverage['/touch.js'].lineData[305] = 0;
  _$jscoverage['/touch.js'].lineData[308] = 0;
  _$jscoverage['/touch.js'].lineData[310] = 0;
  _$jscoverage['/touch.js'].lineData[311] = 0;
  _$jscoverage['/touch.js'].lineData[312] = 0;
  _$jscoverage['/touch.js'].lineData[314] = 0;
  _$jscoverage['/touch.js'].lineData[318] = 0;
  _$jscoverage['/touch.js'].lineData[319] = 0;
  _$jscoverage['/touch.js'].lineData[322] = 0;
  _$jscoverage['/touch.js'].lineData[323] = 0;
  _$jscoverage['/touch.js'].lineData[326] = 0;
  _$jscoverage['/touch.js'].lineData[329] = 0;
  _$jscoverage['/touch.js'].lineData[330] = 0;
  _$jscoverage['/touch.js'].lineData[333] = 0;
  _$jscoverage['/touch.js'].lineData[335] = 0;
  _$jscoverage['/touch.js'].lineData[336] = 0;
  _$jscoverage['/touch.js'].lineData[338] = 0;
  _$jscoverage['/touch.js'].lineData[339] = 0;
  _$jscoverage['/touch.js'].lineData[341] = 0;
  _$jscoverage['/touch.js'].lineData[342] = 0;
  _$jscoverage['/touch.js'].lineData[343] = 0;
  _$jscoverage['/touch.js'].lineData[345] = 0;
  _$jscoverage['/touch.js'].lineData[346] = 0;
  _$jscoverage['/touch.js'].lineData[347] = 0;
  _$jscoverage['/touch.js'].lineData[356] = 0;
  _$jscoverage['/touch.js'].lineData[357] = 0;
  _$jscoverage['/touch.js'].lineData[358] = 0;
  _$jscoverage['/touch.js'].lineData[359] = 0;
  _$jscoverage['/touch.js'].lineData[360] = 0;
  _$jscoverage['/touch.js'].lineData[361] = 0;
  _$jscoverage['/touch.js'].lineData[362] = 0;
  _$jscoverage['/touch.js'].lineData[363] = 0;
  _$jscoverage['/touch.js'].lineData[365] = 0;
  _$jscoverage['/touch.js'].lineData[366] = 0;
  _$jscoverage['/touch.js'].lineData[367] = 0;
  _$jscoverage['/touch.js'].lineData[368] = 0;
  _$jscoverage['/touch.js'].lineData[369] = 0;
  _$jscoverage['/touch.js'].lineData[370] = 0;
  _$jscoverage['/touch.js'].lineData[380] = 0;
  _$jscoverage['/touch.js'].lineData[381] = 0;
  _$jscoverage['/touch.js'].lineData[382] = 0;
  _$jscoverage['/touch.js'].lineData[385] = 0;
  _$jscoverage['/touch.js'].lineData[386] = 0;
  _$jscoverage['/touch.js'].lineData[387] = 0;
  _$jscoverage['/touch.js'].lineData[388] = 0;
  _$jscoverage['/touch.js'].lineData[389] = 0;
  _$jscoverage['/touch.js'].lineData[391] = 0;
  _$jscoverage['/touch.js'].lineData[397] = 0;
  _$jscoverage['/touch.js'].lineData[398] = 0;
  _$jscoverage['/touch.js'].lineData[400] = 0;
  _$jscoverage['/touch.js'].lineData[402] = 0;
  _$jscoverage['/touch.js'].lineData[403] = 0;
  _$jscoverage['/touch.js'].lineData[404] = 0;
  _$jscoverage['/touch.js'].lineData[407] = 0;
  _$jscoverage['/touch.js'].lineData[411] = 0;
  _$jscoverage['/touch.js'].lineData[412] = 0;
  _$jscoverage['/touch.js'].lineData[413] = 0;
  _$jscoverage['/touch.js'].lineData[414] = 0;
  _$jscoverage['/touch.js'].lineData[415] = 0;
  _$jscoverage['/touch.js'].lineData[416] = 0;
  _$jscoverage['/touch.js'].lineData[417] = 0;
  _$jscoverage['/touch.js'].lineData[421] = 0;
  _$jscoverage['/touch.js'].lineData[422] = 0;
  _$jscoverage['/touch.js'].lineData[423] = 0;
  _$jscoverage['/touch.js'].lineData[424] = 0;
  _$jscoverage['/touch.js'].lineData[425] = 0;
  _$jscoverage['/touch.js'].lineData[426] = 0;
  _$jscoverage['/touch.js'].lineData[427] = 0;
  _$jscoverage['/touch.js'].lineData[428] = 0;
  _$jscoverage['/touch.js'].lineData[429] = 0;
  _$jscoverage['/touch.js'].lineData[430] = 0;
  _$jscoverage['/touch.js'].lineData[431] = 0;
  _$jscoverage['/touch.js'].lineData[436] = 0;
  _$jscoverage['/touch.js'].lineData[437] = 0;
  _$jscoverage['/touch.js'].lineData[438] = 0;
  _$jscoverage['/touch.js'].lineData[439] = 0;
  _$jscoverage['/touch.js'].lineData[440] = 0;
  _$jscoverage['/touch.js'].lineData[441] = 0;
  _$jscoverage['/touch.js'].lineData[442] = 0;
  _$jscoverage['/touch.js'].lineData[447] = 0;
  _$jscoverage['/touch.js'].lineData[448] = 0;
  _$jscoverage['/touch.js'].lineData[449] = 0;
  _$jscoverage['/touch.js'].lineData[451] = 0;
  _$jscoverage['/touch.js'].lineData[452] = 0;
  _$jscoverage['/touch.js'].lineData[455] = 0;
  _$jscoverage['/touch.js'].lineData[458] = 0;
  _$jscoverage['/touch.js'].lineData[459] = 0;
  _$jscoverage['/touch.js'].lineData[462] = 0;
  _$jscoverage['/touch.js'].lineData[464] = 0;
  _$jscoverage['/touch.js'].lineData[465] = 0;
  _$jscoverage['/touch.js'].lineData[472] = 0;
  _$jscoverage['/touch.js'].lineData[473] = 0;
  _$jscoverage['/touch.js'].lineData[476] = 0;
  _$jscoverage['/touch.js'].lineData[477] = 0;
  _$jscoverage['/touch.js'].lineData[478] = 0;
  _$jscoverage['/touch.js'].lineData[479] = 0;
  _$jscoverage['/touch.js'].lineData[483] = 0;
  _$jscoverage['/touch.js'].lineData[484] = 0;
  _$jscoverage['/touch.js'].lineData[485] = 0;
  _$jscoverage['/touch.js'].lineData[488] = 0;
  _$jscoverage['/touch.js'].lineData[489] = 0;
  _$jscoverage['/touch.js'].lineData[498] = 0;
  _$jscoverage['/touch.js'].lineData[500] = 0;
  _$jscoverage['/touch.js'].lineData[501] = 0;
  _$jscoverage['/touch.js'].lineData[502] = 0;
  _$jscoverage['/touch.js'].lineData[503] = 0;
  _$jscoverage['/touch.js'].lineData[504] = 0;
  _$jscoverage['/touch.js'].lineData[512] = 0;
  _$jscoverage['/touch.js'].lineData[514] = 0;
  _$jscoverage['/touch.js'].lineData[518] = 0;
  _$jscoverage['/touch.js'].lineData[522] = 0;
  _$jscoverage['/touch.js'].lineData[523] = 0;
}
if (! _$jscoverage['/touch.js'].functionData) {
  _$jscoverage['/touch.js'].functionData = [];
  _$jscoverage['/touch.js'].functionData[0] = 0;
  _$jscoverage['/touch.js'].functionData[1] = 0;
  _$jscoverage['/touch.js'].functionData[2] = 0;
  _$jscoverage['/touch.js'].functionData[3] = 0;
  _$jscoverage['/touch.js'].functionData[4] = 0;
  _$jscoverage['/touch.js'].functionData[5] = 0;
  _$jscoverage['/touch.js'].functionData[6] = 0;
  _$jscoverage['/touch.js'].functionData[7] = 0;
  _$jscoverage['/touch.js'].functionData[8] = 0;
  _$jscoverage['/touch.js'].functionData[9] = 0;
  _$jscoverage['/touch.js'].functionData[10] = 0;
  _$jscoverage['/touch.js'].functionData[11] = 0;
  _$jscoverage['/touch.js'].functionData[12] = 0;
  _$jscoverage['/touch.js'].functionData[13] = 0;
  _$jscoverage['/touch.js'].functionData[14] = 0;
  _$jscoverage['/touch.js'].functionData[15] = 0;
  _$jscoverage['/touch.js'].functionData[16] = 0;
  _$jscoverage['/touch.js'].functionData[17] = 0;
  _$jscoverage['/touch.js'].functionData[18] = 0;
}
if (! _$jscoverage['/touch.js'].branchData) {
  _$jscoverage['/touch.js'].branchData = {};
  _$jscoverage['/touch.js'].branchData['33'] = [];
  _$jscoverage['/touch.js'].branchData['33'][1] = new BranchData();
  _$jscoverage['/touch.js'].branchData['40'] = [];
  _$jscoverage['/touch.js'].branchData['40'][1] = new BranchData();
  _$jscoverage['/touch.js'].branchData['53'] = [];
  _$jscoverage['/touch.js'].branchData['53'][1] = new BranchData();
  _$jscoverage['/touch.js'].branchData['54'] = [];
  _$jscoverage['/touch.js'].branchData['54'][1] = new BranchData();
  _$jscoverage['/touch.js'].branchData['55'] = [];
  _$jscoverage['/touch.js'].branchData['55'][1] = new BranchData();
  _$jscoverage['/touch.js'].branchData['58'] = [];
  _$jscoverage['/touch.js'].branchData['58'][1] = new BranchData();
  _$jscoverage['/touch.js'].branchData['62'] = [];
  _$jscoverage['/touch.js'].branchData['62'][1] = new BranchData();
  _$jscoverage['/touch.js'].branchData['66'] = [];
  _$jscoverage['/touch.js'].branchData['66'][1] = new BranchData();
  _$jscoverage['/touch.js'].branchData['75'] = [];
  _$jscoverage['/touch.js'].branchData['75'][1] = new BranchData();
  _$jscoverage['/touch.js'].branchData['75'][2] = new BranchData();
  _$jscoverage['/touch.js'].branchData['75'][3] = new BranchData();
  _$jscoverage['/touch.js'].branchData['75'][4] = new BranchData();
  _$jscoverage['/touch.js'].branchData['76'] = [];
  _$jscoverage['/touch.js'].branchData['76'][1] = new BranchData();
  _$jscoverage['/touch.js'].branchData['76'][2] = new BranchData();
  _$jscoverage['/touch.js'].branchData['89'] = [];
  _$jscoverage['/touch.js'].branchData['89'][1] = new BranchData();
  _$jscoverage['/touch.js'].branchData['90'] = [];
  _$jscoverage['/touch.js'].branchData['90'][1] = new BranchData();
  _$jscoverage['/touch.js'].branchData['97'] = [];
  _$jscoverage['/touch.js'].branchData['97'][1] = new BranchData();
  _$jscoverage['/touch.js'].branchData['108'] = [];
  _$jscoverage['/touch.js'].branchData['108'][1] = new BranchData();
  _$jscoverage['/touch.js'].branchData['110'] = [];
  _$jscoverage['/touch.js'].branchData['110'][1] = new BranchData();
  _$jscoverage['/touch.js'].branchData['113'] = [];
  _$jscoverage['/touch.js'].branchData['113'][1] = new BranchData();
  _$jscoverage['/touch.js'].branchData['125'] = [];
  _$jscoverage['/touch.js'].branchData['125'][1] = new BranchData();
  _$jscoverage['/touch.js'].branchData['135'] = [];
  _$jscoverage['/touch.js'].branchData['135'][1] = new BranchData();
  _$jscoverage['/touch.js'].branchData['135'][2] = new BranchData();
  _$jscoverage['/touch.js'].branchData['135'][3] = new BranchData();
  _$jscoverage['/touch.js'].branchData['182'] = [];
  _$jscoverage['/touch.js'].branchData['182'][1] = new BranchData();
  _$jscoverage['/touch.js'].branchData['190'] = [];
  _$jscoverage['/touch.js'].branchData['190'][1] = new BranchData();
  _$jscoverage['/touch.js'].branchData['190'][2] = new BranchData();
  _$jscoverage['/touch.js'].branchData['190'][3] = new BranchData();
  _$jscoverage['/touch.js'].branchData['192'] = [];
  _$jscoverage['/touch.js'].branchData['192'][1] = new BranchData();
  _$jscoverage['/touch.js'].branchData['207'] = [];
  _$jscoverage['/touch.js'].branchData['207'][1] = new BranchData();
  _$jscoverage['/touch.js'].branchData['218'] = [];
  _$jscoverage['/touch.js'].branchData['218'][1] = new BranchData();
  _$jscoverage['/touch.js'].branchData['229'] = [];
  _$jscoverage['/touch.js'].branchData['229'][1] = new BranchData();
  _$jscoverage['/touch.js'].branchData['234'] = [];
  _$jscoverage['/touch.js'].branchData['234'][1] = new BranchData();
  _$jscoverage['/touch.js'].branchData['236'] = [];
  _$jscoverage['/touch.js'].branchData['236'][1] = new BranchData();
  _$jscoverage['/touch.js'].branchData['243'] = [];
  _$jscoverage['/touch.js'].branchData['243'][1] = new BranchData();
  _$jscoverage['/touch.js'].branchData['247'] = [];
  _$jscoverage['/touch.js'].branchData['247'][1] = new BranchData();
  _$jscoverage['/touch.js'].branchData['264'] = [];
  _$jscoverage['/touch.js'].branchData['264'][1] = new BranchData();
  _$jscoverage['/touch.js'].branchData['279'] = [];
  _$jscoverage['/touch.js'].branchData['279'][1] = new BranchData();
  _$jscoverage['/touch.js'].branchData['282'] = [];
  _$jscoverage['/touch.js'].branchData['282'][1] = new BranchData();
  _$jscoverage['/touch.js'].branchData['292'] = [];
  _$jscoverage['/touch.js'].branchData['292'][1] = new BranchData();
  _$jscoverage['/touch.js'].branchData['295'] = [];
  _$jscoverage['/touch.js'].branchData['295'][1] = new BranchData();
  _$jscoverage['/touch.js'].branchData['296'] = [];
  _$jscoverage['/touch.js'].branchData['296'][1] = new BranchData();
  _$jscoverage['/touch.js'].branchData['299'] = [];
  _$jscoverage['/touch.js'].branchData['299'][1] = new BranchData();
  _$jscoverage['/touch.js'].branchData['299'][2] = new BranchData();
  _$jscoverage['/touch.js'].branchData['299'][3] = new BranchData();
  _$jscoverage['/touch.js'].branchData['302'] = [];
  _$jscoverage['/touch.js'].branchData['302'][1] = new BranchData();
  _$jscoverage['/touch.js'].branchData['308'] = [];
  _$jscoverage['/touch.js'].branchData['308'][1] = new BranchData();
  _$jscoverage['/touch.js'].branchData['308'][2] = new BranchData();
  _$jscoverage['/touch.js'].branchData['308'][3] = new BranchData();
  _$jscoverage['/touch.js'].branchData['311'] = [];
  _$jscoverage['/touch.js'].branchData['311'][1] = new BranchData();
  _$jscoverage['/touch.js'].branchData['318'] = [];
  _$jscoverage['/touch.js'].branchData['318'][1] = new BranchData();
  _$jscoverage['/touch.js'].branchData['329'] = [];
  _$jscoverage['/touch.js'].branchData['329'][1] = new BranchData();
  _$jscoverage['/touch.js'].branchData['335'] = [];
  _$jscoverage['/touch.js'].branchData['335'][1] = new BranchData();
  _$jscoverage['/touch.js'].branchData['342'] = [];
  _$jscoverage['/touch.js'].branchData['342'][1] = new BranchData();
  _$jscoverage['/touch.js'].branchData['362'] = [];
  _$jscoverage['/touch.js'].branchData['362'][1] = new BranchData();
  _$jscoverage['/touch.js'].branchData['362'][2] = new BranchData();
  _$jscoverage['/touch.js'].branchData['363'] = [];
  _$jscoverage['/touch.js'].branchData['363'][1] = new BranchData();
  _$jscoverage['/touch.js'].branchData['363'][2] = new BranchData();
  _$jscoverage['/touch.js'].branchData['367'] = [];
  _$jscoverage['/touch.js'].branchData['367'][1] = new BranchData();
  _$jscoverage['/touch.js'].branchData['380'] = [];
  _$jscoverage['/touch.js'].branchData['380'][1] = new BranchData();
  _$jscoverage['/touch.js'].branchData['402'] = [];
  _$jscoverage['/touch.js'].branchData['402'][1] = new BranchData();
  _$jscoverage['/touch.js'].branchData['403'] = [];
  _$jscoverage['/touch.js'].branchData['403'][1] = new BranchData();
  _$jscoverage['/touch.js'].branchData['411'] = [];
  _$jscoverage['/touch.js'].branchData['411'][1] = new BranchData();
  _$jscoverage['/touch.js'].branchData['413'] = [];
  _$jscoverage['/touch.js'].branchData['413'][1] = new BranchData();
  _$jscoverage['/touch.js'].branchData['414'] = [];
  _$jscoverage['/touch.js'].branchData['414'][1] = new BranchData();
  _$jscoverage['/touch.js'].branchData['414'][2] = new BranchData();
  _$jscoverage['/touch.js'].branchData['414'][3] = new BranchData();
  _$jscoverage['/touch.js'].branchData['416'] = [];
  _$jscoverage['/touch.js'].branchData['416'][1] = new BranchData();
  _$jscoverage['/touch.js'].branchData['416'][2] = new BranchData();
  _$jscoverage['/touch.js'].branchData['416'][3] = new BranchData();
  _$jscoverage['/touch.js'].branchData['424'] = [];
  _$jscoverage['/touch.js'].branchData['424'][1] = new BranchData();
  _$jscoverage['/touch.js'].branchData['426'] = [];
  _$jscoverage['/touch.js'].branchData['426'][1] = new BranchData();
  _$jscoverage['/touch.js'].branchData['428'] = [];
  _$jscoverage['/touch.js'].branchData['428'][1] = new BranchData();
  _$jscoverage['/touch.js'].branchData['429'] = [];
  _$jscoverage['/touch.js'].branchData['429'][1] = new BranchData();
  _$jscoverage['/touch.js'].branchData['437'] = [];
  _$jscoverage['/touch.js'].branchData['437'][1] = new BranchData();
  _$jscoverage['/touch.js'].branchData['439'] = [];
  _$jscoverage['/touch.js'].branchData['439'][1] = new BranchData();
  _$jscoverage['/touch.js'].branchData['440'] = [];
  _$jscoverage['/touch.js'].branchData['440'][1] = new BranchData();
  _$jscoverage['/touch.js'].branchData['447'] = [];
  _$jscoverage['/touch.js'].branchData['447'][1] = new BranchData();
  _$jscoverage['/touch.js'].branchData['448'] = [];
  _$jscoverage['/touch.js'].branchData['448'][1] = new BranchData();
  _$jscoverage['/touch.js'].branchData['458'] = [];
  _$jscoverage['/touch.js'].branchData['458'][1] = new BranchData();
}
_$jscoverage['/touch.js'].branchData['458'][1].init(30, 16, 'allowX || allowY');
function visit80_458_1(result) {
  _$jscoverage['/touch.js'].branchData['458'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['448'][1].init(34, 26, 'newPageIndex !== pageIndex');
function visit79_448_1(result) {
  _$jscoverage['/touch.js'].branchData['448'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['447'][1].init(2157, 26, 'newPageIndex !== undefined');
function visit78_447_1(result) {
  _$jscoverage['/touch.js'].branchData['447'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['440'][1].init(42, 23, 'min < nowXY.top - x.top');
function visit77_440_1(result) {
  _$jscoverage['/touch.js'].branchData['440'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['439'][1].init(88, 17, 'x.top < nowXY.top');
function visit76_439_1(result) {
  _$jscoverage['/touch.js'].branchData['439'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['437'][1].init(95, 15, 'i < prepareXLen');
function visit75_437_1(result) {
  _$jscoverage['/touch.js'].branchData['437'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['429'][1].init(42, 23, 'min < x.top - nowXY.top');
function visit74_429_1(result) {
  _$jscoverage['/touch.js'].branchData['429'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['428'][1].init(88, 17, 'x.top > nowXY.top');
function visit73_428_1(result) {
  _$jscoverage['/touch.js'].branchData['428'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['426'][1].init(95, 15, 'i < prepareXLen');
function visit72_426_1(result) {
  _$jscoverage['/touch.js'].branchData['426'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['424'][1].init(978, 11, 'offsetY > 0');
function visit71_424_1(result) {
  _$jscoverage['/touch.js'].branchData['424'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['416'][3].init(201, 24, 'offset.left < nowXY.left');
function visit70_416_3(result) {
  _$jscoverage['/touch.js'].branchData['416'][3].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['416'][2].init(186, 11, 'offsetX < 0');
function visit69_416_2(result) {
  _$jscoverage['/touch.js'].branchData['416'][2].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['416'][1].init(186, 39, 'offsetX < 0 && offset.left < nowXY.left');
function visit68_416_1(result) {
  _$jscoverage['/touch.js'].branchData['416'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['414'][3].init(53, 24, 'offset.left > nowXY.left');
function visit67_414_3(result) {
  _$jscoverage['/touch.js'].branchData['414'][3].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['414'][2].init(38, 11, 'offsetX > 0');
function visit66_414_2(result) {
  _$jscoverage['/touch.js'].branchData['414'][2].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['414'][1].init(38, 39, 'offsetX > 0 && offset.left > nowXY.left');
function visit65_414_1(result) {
  _$jscoverage['/touch.js'].branchData['414'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['413'][1].init(92, 6, 'offset');
function visit64_413_1(result) {
  _$jscoverage['/touch.js'].branchData['413'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['411'][1].init(315, 18, 'i < pagesOffsetLen');
function visit63_411_1(result) {
  _$jscoverage['/touch.js'].branchData['411'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['403'][1].init(26, 16, 'allowX && allowY');
function visit62_403_1(result) {
  _$jscoverage['/touch.js'].branchData['403'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['402'][1].init(1235, 16, 'allowX || allowY');
function visit61_402_1(result) {
  _$jscoverage['/touch.js'].branchData['402'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['380'][1].init(487, 17, '!self.pagesOffset');
function visit60_380_1(result) {
  _$jscoverage['/touch.js'].branchData['380'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['367'][1].init(40, 11, 'count === 2');
function visit59_367_1(result) {
  _$jscoverage['/touch.js'].branchData['367'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['363'][2].init(300, 33, 'Math.abs(offsetY) > snapThreshold');
function visit58_363_2(result) {
  _$jscoverage['/touch.js'].branchData['363'][2].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['363'][1].init(276, 57, 'self.allowScroll.top && Math.abs(offsetY) > snapThreshold');
function visit57_363_1(result) {
  _$jscoverage['/touch.js'].branchData['363'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['362'][2].init(219, 33, 'Math.abs(offsetX) > snapThreshold');
function visit56_362_2(result) {
  _$jscoverage['/touch.js'].branchData['362'][2].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['362'][1].init(194, 58, 'self.allowScroll.left && Math.abs(offsetX) > snapThreshold');
function visit55_362_1(result) {
  _$jscoverage['/touch.js'].branchData['362'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['342'][1].init(297, 35, '!startMousePos || !self.isScrolling');
function visit54_342_1(result) {
  _$jscoverage['/touch.js'].branchData['342'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['335'][1].init(43, 10, '!e.isTouch');
function visit53_335_1(result) {
  _$jscoverage['/touch.js'].branchData['335'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['329'][1].init(11196, 7, 'S.UA.ie');
function visit52_329_1(result) {
  _$jscoverage['/touch.js'].branchData['329'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['318'][1].init(1794, 21, 'isTouchEventSupported');
function visit51_318_1(result) {
  _$jscoverage['/touch.js'].branchData['318'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['311'][1].init(113, 27, 'self.get(\'preventDefaultY\')');
function visit50_311_1(result) {
  _$jscoverage['/touch.js'].branchData['311'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['308'][3].init(585, 27, 'dragInitDirection === \'top\'');
function visit49_308_3(result) {
  _$jscoverage['/touch.js'].branchData['308'][3].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['308'][2].init(585, 67, 'dragInitDirection === \'top\' && !self.allowScroll[dragInitDirection]');
function visit48_308_2(result) {
  _$jscoverage['/touch.js'].branchData['308'][2].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['308'][1].init(576, 76, 'lockY && dragInitDirection === \'top\' && !self.allowScroll[dragInitDirection]');
function visit47_308_1(result) {
  _$jscoverage['/touch.js'].branchData['308'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['302'][1].init(113, 27, 'self.get(\'preventDefaultX\')');
function visit46_302_1(result) {
  _$jscoverage['/touch.js'].branchData['302'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['299'][3].init(242, 28, 'dragInitDirection === \'left\'');
function visit45_299_3(result) {
  _$jscoverage['/touch.js'].branchData['299'][3].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['299'][2].init(242, 68, 'dragInitDirection === \'left\' && !self.allowScroll[dragInitDirection]');
function visit44_299_2(result) {
  _$jscoverage['/touch.js'].branchData['299'][2].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['299'][1].init(233, 77, 'lockX && dragInitDirection === \'left\' && !self.allowScroll[dragInitDirection]');
function visit43_299_1(result) {
  _$jscoverage['/touch.js'].branchData['299'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['296'][1].init(63, 13, 'xDiff > yDiff');
function visit42_296_1(result) {
  _$jscoverage['/touch.js'].branchData['296'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['295'][1].init(56, 45, '!(dragInitDirection = self.dragInitDirection)');
function visit41_295_1(result) {
  _$jscoverage['/touch.js'].branchData['295'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['292'][1].init(852, 14, 'lockX || lockY');
function visit40_292_1(result) {
  _$jscoverage['/touch.js'].branchData['292'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['282'][1].init(18, 17, '!self.isScrolling');
function visit39_282_1(result) {
  _$jscoverage['/touch.js'].branchData['282'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['279'][1].init(437, 37, 'Math.max(xDiff, yDiff) < PIXEL_THRESH');
function visit38_279_1(result) {
  _$jscoverage['/touch.js'].branchData['279'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['264'][1].init(44, 10, '!e.isTouch');
function visit37_264_1(result) {
  _$jscoverage['/touch.js'].branchData['264'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['247'][1].init(624, 18, 'touches.length > 1');
function visit36_247_1(result) {
  _$jscoverage['/touch.js'].branchData['247'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['243'][1].init(498, 16, 'self.isScrolling');
function visit35_243_1(result) {
  _$jscoverage['/touch.js'].branchData['243'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['236'][1].init(95, 36, 'self.isScrolling && self.pagesOffset');
function visit34_236_1(result) {
  _$jscoverage['/touch.js'].branchData['236'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['234'][1].init(226, 133, 'self.get(\'disabled\') || (self.isScrolling && self.pagesOffset)');
function visit33_234_1(result) {
  _$jscoverage['/touch.js'].branchData['234'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['229'][1].init(107, 10, '!e.isTouch');
function visit32_229_1(result) {
  _$jscoverage['/touch.js'].branchData['229'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['218'][1].init(355, 11, 'value === 0');
function visit31_218_1(result) {
  _$jscoverage['/touch.js'].branchData['218'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['207'][1].init(1181, 18, 'value <= minScroll');
function visit30_207_1(result) {
  _$jscoverage['/touch.js'].branchData['207'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['192'][1].init(58, 22, 'fx.lastValue === value');
function visit29_192_1(result) {
  _$jscoverage['/touch.js'].branchData['192'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['190'][3].init(400, 17, 'value < maxScroll');
function visit28_190_3(result) {
  _$jscoverage['/touch.js'].branchData['190'][3].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['190'][2].init(379, 17, 'value > minScroll');
function visit27_190_2(result) {
  _$jscoverage['/touch.js'].branchData['190'][2].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['190'][1].init(379, 38, 'value > minScroll && value < maxScroll');
function visit26_190_1(result) {
  _$jscoverage['/touch.js'].branchData['190'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['182'][1].init(102, 7, 'inertia');
function visit25_182_1(result) {
  _$jscoverage['/touch.js'].branchData['182'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['135'][3].init(1251, 14, 'distance === 0');
function visit24_135_3(result) {
  _$jscoverage['/touch.js'].branchData['135'][3].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['135'][2].init(1233, 14, 'duration === 0');
function visit23_135_2(result) {
  _$jscoverage['/touch.js'].branchData['135'][2].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['135'][1].init(1233, 32, 'duration === 0 || distance === 0');
function visit22_135_1(result) {
  _$jscoverage['/touch.js'].branchData['135'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['125'][1].init(970, 16, 'self.pagesOffset');
function visit21_125_1(result) {
  _$jscoverage['/touch.js'].branchData['125'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['113'][1].init(590, 19, 'bound !== undefined');
function visit20_113_1(result) {
  _$jscoverage['/touch.js'].branchData['113'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['110'][1].init(489, 30, 'scroll > maxScroll[scrollType]');
function visit19_110_1(result) {
  _$jscoverage['/touch.js'].branchData['110'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['108'][1].init(390, 30, 'scroll < minScroll[scrollType]');
function visit18_108_1(result) {
  _$jscoverage['/touch.js'].branchData['108'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['97'][1].init(14, 28, 'forbidDrag(self, scrollType)');
function visit17_97_1(result) {
  _$jscoverage['/touch.js'].branchData['97'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['90'][1].init(79, 49, '!self.allowScroll[scrollType] && self.get(lockXY)');
function visit16_90_1(result) {
  _$jscoverage['/touch.js'].branchData['90'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['89'][1].init(23, 21, 'scrollType === \'left\'');
function visit15_89_1(result) {
  _$jscoverage['/touch.js'].branchData['89'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['76'][2].init(118, 32, 'timeDiff > SWIPE_SAMPLE_INTERVAL');
function visit14_76_2(result) {
  _$jscoverage['/touch.js'].branchData['76'][2].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['76'][1].init(55, 39, 'lastDirection[scrollType] !== direction');
function visit13_76_1(result) {
  _$jscoverage['/touch.js'].branchData['76'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['75'][4].init(1656, 39, 'lastDirection[scrollType] !== undefined');
function visit12_75_4(result) {
  _$jscoverage['/touch.js'].branchData['75'][4].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['75'][3].init(1656, 95, 'lastDirection[scrollType] !== undefined && lastDirection[scrollType] !== direction');
function visit11_75_3(result) {
  _$jscoverage['/touch.js'].branchData['75'][3].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['75'][2].init(1636, 115, '!eqWithLastPoint && lastDirection[scrollType] !== undefined && lastDirection[scrollType] !== direction');
function visit10_75_2(result) {
  _$jscoverage['/touch.js'].branchData['75'][2].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['75'][1].init(1636, 151, '!eqWithLastPoint && lastDirection[scrollType] !== undefined && lastDirection[scrollType] !== direction || timeDiff > SWIPE_SAMPLE_INTERVAL');
function visit9_75_1(result) {
  _$jscoverage['/touch.js'].branchData['75'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['66'][1].init(1340, 30, 'scroll > maxScroll[scrollType]');
function visit8_66_1(result) {
  _$jscoverage['/touch.js'].branchData['66'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['62'][1].init(1136, 30, 'scroll < minScroll[scrollType]');
function visit7_62_1(result) {
  _$jscoverage['/touch.js'].branchData['62'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['58'][1].init(991, 19, '!self.get(\'bounce\')');
function visit6_58_1(result) {
  _$jscoverage['/touch.js'].branchData['58'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['55'][1].init(119, 61, '(pos[pageOffsetProperty] - lastPageXY[pageOffsetProperty]) > 0');
function visit5_55_1(result) {
  _$jscoverage['/touch.js'].branchData['55'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['54'][1].init(32, 58, 'pos[pageOffsetProperty] === lastPageXY[pageOffsetProperty]');
function visit4_54_1(result) {
  _$jscoverage['/touch.js'].branchData['54'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['53'][1].init(750, 30, 'lastPageXY[pageOffsetProperty]');
function visit3_53_1(result) {
  _$jscoverage['/touch.js'].branchData['53'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['40'][1].init(202, 21, 'scrollType === \'left\'');
function visit2_40_1(result) {
  _$jscoverage['/touch.js'].branchData['40'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['33'][1].init(14, 28, 'forbidDrag(self, scrollType)');
function visit1_33_1(result) {
  _$jscoverage['/touch.js'].branchData['33'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/touch.js'].functionData[0]++;
  _$jscoverage['/touch.js'].lineData[7]++;
  var ScrollViewBase = require('./base');
  _$jscoverage['/touch.js'].lineData[8]++;
  var isTouchEventSupported = S.Feature.isTouchEventSupported();
  _$jscoverage['/touch.js'].lineData[9]++;
  var Node = require('node');
  _$jscoverage['/touch.js'].lineData[10]++;
  var Anim = require('anim');
  _$jscoverage['/touch.js'].lineData[12]++;
  var OUT_OF_BOUND_FACTOR = 0.5;
  _$jscoverage['/touch.js'].lineData[14]++;
  var PIXEL_THRESH = 3;
  _$jscoverage['/touch.js'].lineData[16]++;
  var Gesture = Node.Gesture;
  _$jscoverage['/touch.js'].lineData[18]++;
  var SWIPE_SAMPLE_INTERVAL = 300;
  _$jscoverage['/touch.js'].lineData[20]++;
  var MAX_SWIPE_VELOCITY = 6;
  _$jscoverage['/touch.js'].lineData[22]++;
  var $document = Node.all(document);
  _$jscoverage['/touch.js'].lineData[24]++;
  function onDragStart(self, e, scrollType) {
    _$jscoverage['/touch.js'].functionData[1]++;
    _$jscoverage['/touch.js'].lineData[25]++;
    var now = e.timeStamp, scroll = self.get('scroll' + S.ucfirst(scrollType));
    _$jscoverage['/touch.js'].lineData[27]++;
    self.startScroll[scrollType] = scroll;
    _$jscoverage['/touch.js'].lineData[28]++;
    self.swipe[scrollType].startTime = now;
    _$jscoverage['/touch.js'].lineData[29]++;
    self.swipe[scrollType].scroll = scroll;
  }
  _$jscoverage['/touch.js'].lineData[32]++;
  function onDragScroll(self, e, scrollType, startMousePos) {
    _$jscoverage['/touch.js'].functionData[2]++;
    _$jscoverage['/touch.js'].lineData[33]++;
    if (visit1_33_1(forbidDrag(self, scrollType))) {
      _$jscoverage['/touch.js'].lineData[34]++;
      return;
    }
    _$jscoverage['/touch.js'].lineData[36]++;
    var pos = {
  pageX: e.pageX, 
  pageY: e.pageY};
    _$jscoverage['/touch.js'].lineData[40]++;
    var pageOffsetProperty = visit2_40_1(scrollType === 'left') ? 'pageX' : 'pageY', lastPageXY = self.lastPageXY;
    _$jscoverage['/touch.js'].lineData[42]++;
    var diff = pos[pageOffsetProperty] - startMousePos[pageOffsetProperty], eqWithLastPoint, scroll = self.startScroll[scrollType] - diff, bound, now = e.timeStamp, minScroll = self.minScroll, maxScroll = self.maxScroll, lastDirection = self.lastDirection, swipe = self.swipe, direction;
    _$jscoverage['/touch.js'].lineData[53]++;
    if (visit3_53_1(lastPageXY[pageOffsetProperty])) {
      _$jscoverage['/touch.js'].lineData[54]++;
      eqWithLastPoint = visit4_54_1(pos[pageOffsetProperty] === lastPageXY[pageOffsetProperty]);
      _$jscoverage['/touch.js'].lineData[55]++;
      direction = visit5_55_1((pos[pageOffsetProperty] - lastPageXY[pageOffsetProperty]) > 0);
    }
    _$jscoverage['/touch.js'].lineData[58]++;
    if (visit6_58_1(!self.get('bounce'))) {
      _$jscoverage['/touch.js'].lineData[59]++;
      scroll = Math.min(Math.max(scroll, minScroll[scrollType]), maxScroll[scrollType]);
    }
    _$jscoverage['/touch.js'].lineData[62]++;
    if (visit7_62_1(scroll < minScroll[scrollType])) {
      _$jscoverage['/touch.js'].lineData[63]++;
      bound = minScroll[scrollType] - scroll;
      _$jscoverage['/touch.js'].lineData[64]++;
      bound *= OUT_OF_BOUND_FACTOR;
      _$jscoverage['/touch.js'].lineData[65]++;
      scroll = minScroll[scrollType] - bound;
    } else {
      _$jscoverage['/touch.js'].lineData[66]++;
      if (visit8_66_1(scroll > maxScroll[scrollType])) {
        _$jscoverage['/touch.js'].lineData[67]++;
        bound = scroll - maxScroll[scrollType];
        _$jscoverage['/touch.js'].lineData[68]++;
        bound *= OUT_OF_BOUND_FACTOR;
        _$jscoverage['/touch.js'].lineData[69]++;
        scroll = maxScroll[scrollType] + bound;
      }
    }
    _$jscoverage['/touch.js'].lineData[72]++;
    var timeDiff = (now - swipe[scrollType].startTime);
    _$jscoverage['/touch.js'].lineData[75]++;
    if (visit9_75_1(visit10_75_2(!eqWithLastPoint && visit11_75_3(visit12_75_4(lastDirection[scrollType] !== undefined) && visit13_76_1(lastDirection[scrollType] !== direction))) || visit14_76_2(timeDiff > SWIPE_SAMPLE_INTERVAL))) {
      _$jscoverage['/touch.js'].lineData[77]++;
      swipe[scrollType].startTime = now;
      _$jscoverage['/touch.js'].lineData[78]++;
      swipe[scrollType].scroll = scroll;
    }
    _$jscoverage['/touch.js'].lineData[82]++;
    self.set('scroll' + S.ucfirst(scrollType), scroll);
    _$jscoverage['/touch.js'].lineData[83]++;
    lastDirection[scrollType] = direction;
    _$jscoverage['/touch.js'].lineData[85]++;
    lastPageXY[pageOffsetProperty] = e[pageOffsetProperty];
  }
  _$jscoverage['/touch.js'].lineData[88]++;
  function forbidDrag(self, scrollType) {
    _$jscoverage['/touch.js'].functionData[3]++;
    _$jscoverage['/touch.js'].lineData[89]++;
    var lockXY = visit15_89_1(scrollType === 'left') ? 'lockX' : 'lockY';
    _$jscoverage['/touch.js'].lineData[90]++;
    if (visit16_90_1(!self.allowScroll[scrollType] && self.get(lockXY))) {
      _$jscoverage['/touch.js'].lineData[91]++;
      return 1;
    }
    _$jscoverage['/touch.js'].lineData[93]++;
    return 0;
  }
  _$jscoverage['/touch.js'].lineData[96]++;
  function onDragEndAxis(self, e, scrollType, endCallback) {
    _$jscoverage['/touch.js'].functionData[4]++;
    _$jscoverage['/touch.js'].lineData[97]++;
    if (visit17_97_1(forbidDrag(self, scrollType))) {
      _$jscoverage['/touch.js'].lineData[98]++;
      endCallback();
      _$jscoverage['/touch.js'].lineData[99]++;
      return;
    }
    _$jscoverage['/touch.js'].lineData[101]++;
    var scrollAxis = 'scroll' + S.ucfirst(scrollType), scroll = self.get(scrollAxis), minScroll = self.minScroll, maxScroll = self.maxScroll, now = e.timeStamp, swipe = self.swipe, bound;
    _$jscoverage['/touch.js'].lineData[108]++;
    if (visit18_108_1(scroll < minScroll[scrollType])) {
      _$jscoverage['/touch.js'].lineData[109]++;
      bound = minScroll[scrollType];
    } else {
      _$jscoverage['/touch.js'].lineData[110]++;
      if (visit19_110_1(scroll > maxScroll[scrollType])) {
        _$jscoverage['/touch.js'].lineData[111]++;
        bound = maxScroll[scrollType];
      }
    }
    _$jscoverage['/touch.js'].lineData[113]++;
    if (visit20_113_1(bound !== undefined)) {
      _$jscoverage['/touch.js'].lineData[114]++;
      var scrollCfg = {};
      _$jscoverage['/touch.js'].lineData[115]++;
      scrollCfg[scrollType] = bound;
      _$jscoverage['/touch.js'].lineData[116]++;
      self.scrollTo(scrollCfg, {
  duration: self.get('bounceDuration'), 
  easing: self.get('bounceEasing'), 
  queue: false, 
  complete: endCallback});
      _$jscoverage['/touch.js'].lineData[122]++;
      return;
    }
    _$jscoverage['/touch.js'].lineData[125]++;
    if (visit21_125_1(self.pagesOffset)) {
      _$jscoverage['/touch.js'].lineData[126]++;
      endCallback();
      _$jscoverage['/touch.js'].lineData[127]++;
      return;
    }
    _$jscoverage['/touch.js'].lineData[130]++;
    var duration = now - swipe[scrollType].startTime;
    _$jscoverage['/touch.js'].lineData[131]++;
    var distance = (scroll - swipe[scrollType].scroll);
    _$jscoverage['/touch.js'].lineData[135]++;
    if (visit22_135_1(visit23_135_2(duration === 0) || visit24_135_3(distance === 0))) {
      _$jscoverage['/touch.js'].lineData[136]++;
      endCallback();
      _$jscoverage['/touch.js'].lineData[137]++;
      return;
    }
    _$jscoverage['/touch.js'].lineData[143]++;
    var velocity = distance / duration;
    _$jscoverage['/touch.js'].lineData[145]++;
    velocity = Math.min(Math.max(velocity, -MAX_SWIPE_VELOCITY), MAX_SWIPE_VELOCITY);
    _$jscoverage['/touch.js'].lineData[150]++;
    var animCfg = {
  node: {}, 
  to: {}, 
  duration: 9999, 
  queue: false, 
  complete: endCallback, 
  frame: makeMomentumFx(self, velocity, scroll, scrollAxis, maxScroll[scrollType], minScroll[scrollType])};
    _$jscoverage['/touch.js'].lineData[161]++;
    animCfg.node[scrollType] = scroll;
    _$jscoverage['/touch.js'].lineData[162]++;
    animCfg.to[scrollType] = null;
    _$jscoverage['/touch.js'].lineData[164]++;
    self.scrollAnims.push(new Anim(animCfg).run());
  }
  _$jscoverage['/touch.js'].lineData[167]++;
  var FRICTION = 0.5;
  _$jscoverage['/touch.js'].lineData[168]++;
  var ACCELERATION = 20;
  _$jscoverage['/touch.js'].lineData[169]++;
  var THETA = Math.log(1 - (FRICTION / 10));
  _$jscoverage['/touch.js'].lineData[170]++;
  var ALPHA = THETA / ACCELERATION;
  _$jscoverage['/touch.js'].lineData[171]++;
  var SPRING_TENSION = 0.3;
  _$jscoverage['/touch.js'].lineData[173]++;
  function makeMomentumFx(self, startVelocity, startScroll, scrollAxis, maxScroll, minScroll) {
    _$jscoverage['/touch.js'].functionData[5]++;
    _$jscoverage['/touch.js'].lineData[175]++;
    var velocity = startVelocity * ACCELERATION;
    _$jscoverage['/touch.js'].lineData[176]++;
    var inertia = 1;
    _$jscoverage['/touch.js'].lineData[177]++;
    var bounceStartTime = 0;
    _$jscoverage['/touch.js'].lineData[178]++;
    return function(anim, fx) {
  _$jscoverage['/touch.js'].functionData[6]++;
  _$jscoverage['/touch.js'].lineData[179]++;
  var now = S.now(), deltaTime, value;
  _$jscoverage['/touch.js'].lineData[182]++;
  if (visit25_182_1(inertia)) {
    _$jscoverage['/touch.js'].lineData[183]++;
    deltaTime = now - anim.startTime;
    _$jscoverage['/touch.js'].lineData[187]++;
    var frictionFactor = Math.exp(deltaTime * ALPHA);
    _$jscoverage['/touch.js'].lineData[189]++;
    value = parseInt(startScroll + velocity * (1 - frictionFactor) / (-THETA), 10);
    _$jscoverage['/touch.js'].lineData[190]++;
    if (visit26_190_1(visit27_190_2(value > minScroll) && visit28_190_3(value < maxScroll))) {
      _$jscoverage['/touch.js'].lineData[192]++;
      if (visit29_192_1(fx.lastValue === value)) {
        _$jscoverage['/touch.js'].lineData[193]++;
        fx.pos = 1;
        _$jscoverage['/touch.js'].lineData[194]++;
        return;
      }
      _$jscoverage['/touch.js'].lineData[196]++;
      fx.lastValue = value;
      _$jscoverage['/touch.js'].lineData[197]++;
      self.set(scrollAxis, value);
      _$jscoverage['/touch.js'].lineData[198]++;
      return;
    }
    _$jscoverage['/touch.js'].lineData[200]++;
    inertia = 0;
    _$jscoverage['/touch.js'].lineData[201]++;
    velocity = velocity * frictionFactor;
    _$jscoverage['/touch.js'].lineData[207]++;
    startScroll = visit30_207_1(value <= minScroll) ? minScroll : maxScroll;
    _$jscoverage['/touch.js'].lineData[209]++;
    bounceStartTime = now;
  } else {
    _$jscoverage['/touch.js'].lineData[211]++;
    deltaTime = now - bounceStartTime;
    _$jscoverage['/touch.js'].lineData[213]++;
    var theta = (deltaTime / ACCELERATION), powTime = theta * Math.exp(-SPRING_TENSION * theta);
    _$jscoverage['/touch.js'].lineData[217]++;
    value = parseInt(velocity * powTime, 10);
    _$jscoverage['/touch.js'].lineData[218]++;
    if (visit31_218_1(value === 0)) {
      _$jscoverage['/touch.js'].lineData[219]++;
      fx.pos = 1;
    }
    _$jscoverage['/touch.js'].lineData[221]++;
    self.set(scrollAxis, startScroll + value);
  }
};
  }
  _$jscoverage['/touch.js'].lineData[226]++;
  function onDragStartHandler(e) {
    _$jscoverage['/touch.js'].functionData[7]++;
    _$jscoverage['/touch.js'].lineData[229]++;
    if (visit32_229_1(!e.isTouch)) {
      _$jscoverage['/touch.js'].lineData[230]++;
      return;
    }
    _$jscoverage['/touch.js'].lineData[232]++;
    var self = this, touches = e.touches;
    _$jscoverage['/touch.js'].lineData[234]++;
    if (visit33_234_1(self.get('disabled') || (visit34_236_1(self.isScrolling && self.pagesOffset)))) {
      _$jscoverage['/touch.js'].lineData[237]++;
      return;
    }
    _$jscoverage['/touch.js'].lineData[239]++;
    var pos = {
  pageX: e.pageX, 
  pageY: e.pageY};
    _$jscoverage['/touch.js'].lineData[243]++;
    if (visit35_243_1(self.isScrolling)) {
      _$jscoverage['/touch.js'].lineData[244]++;
      self.stopAnimation();
      _$jscoverage['/touch.js'].lineData[245]++;
      self.fire('scrollTouchEnd', pos);
    }
    _$jscoverage['/touch.js'].lineData[247]++;
    if (visit36_247_1(touches.length > 1)) {
      _$jscoverage['/touch.js'].lineData[249]++;
      $document.detach(Gesture.move, onDragHandler, self).detach(Gesture.end, onDragEndHandler, self);
      _$jscoverage['/touch.js'].lineData[251]++;
      return;
    }
    _$jscoverage['/touch.js'].lineData[253]++;
    initStates(self);
    _$jscoverage['/touch.js'].lineData[254]++;
    self.startMousePos = pos;
    _$jscoverage['/touch.js'].lineData[255]++;
    onDragStart(self, e, 'left');
    _$jscoverage['/touch.js'].lineData[256]++;
    onDragStart(self, e, 'top');
    _$jscoverage['/touch.js'].lineData[259]++;
    $document.on(Gesture.move, onDragHandler, self).on(Gesture.end, onDragEndHandler, self);
  }
  _$jscoverage['/touch.js'].lineData[262]++;
  var onDragHandler = function(e) {
  _$jscoverage['/touch.js'].functionData[8]++;
  _$jscoverage['/touch.js'].lineData[264]++;
  if (visit37_264_1(!e.isTouch)) {
    _$jscoverage['/touch.js'].lineData[265]++;
    return;
  }
  _$jscoverage['/touch.js'].lineData[267]++;
  var self = this, startMousePos = self.startMousePos;
  _$jscoverage['/touch.js'].lineData[270]++;
  var pos = {
  pageX: e.pageX, 
  pageY: e.pageY};
  _$jscoverage['/touch.js'].lineData[275]++;
  var xDiff = Math.abs(pos.pageX - startMousePos.pageX);
  _$jscoverage['/touch.js'].lineData[276]++;
  var yDiff = Math.abs(pos.pageY - startMousePos.pageY);
  _$jscoverage['/touch.js'].lineData[279]++;
  if (visit38_279_1(Math.max(xDiff, yDiff) < PIXEL_THRESH)) {
    _$jscoverage['/touch.js'].lineData[280]++;
    return;
  } else {
    _$jscoverage['/touch.js'].lineData[282]++;
    if (visit39_282_1(!self.isScrolling)) {
      _$jscoverage['/touch.js'].lineData[283]++;
      self.fire('scrollTouchStart', pos);
      _$jscoverage['/touch.js'].lineData[284]++;
      self.isScrolling = 1;
    }
  }
  _$jscoverage['/touch.js'].lineData[288]++;
  var lockX = self.get('lockX'), lockY = self.get('lockY');
  _$jscoverage['/touch.js'].lineData[292]++;
  if (visit40_292_1(lockX || lockY)) {
    _$jscoverage['/touch.js'].lineData[293]++;
    var dragInitDirection;
    _$jscoverage['/touch.js'].lineData[295]++;
    if (visit41_295_1(!(dragInitDirection = self.dragInitDirection))) {
      _$jscoverage['/touch.js'].lineData[296]++;
      self.dragInitDirection = dragInitDirection = visit42_296_1(xDiff > yDiff) ? 'left' : 'top';
    }
    _$jscoverage['/touch.js'].lineData[299]++;
    if (visit43_299_1(lockX && visit44_299_2(visit45_299_3(dragInitDirection === 'left') && !self.allowScroll[dragInitDirection]))) {
      _$jscoverage['/touch.js'].lineData[301]++;
      self.isScrolling = 0;
      _$jscoverage['/touch.js'].lineData[302]++;
      if (visit46_302_1(self.get('preventDefaultX'))) {
        _$jscoverage['/touch.js'].lineData[303]++;
        e.preventDefault();
      }
      _$jscoverage['/touch.js'].lineData[305]++;
      return;
    }
    _$jscoverage['/touch.js'].lineData[308]++;
    if (visit47_308_1(lockY && visit48_308_2(visit49_308_3(dragInitDirection === 'top') && !self.allowScroll[dragInitDirection]))) {
      _$jscoverage['/touch.js'].lineData[310]++;
      self.isScrolling = 0;
      _$jscoverage['/touch.js'].lineData[311]++;
      if (visit50_311_1(self.get('preventDefaultY'))) {
        _$jscoverage['/touch.js'].lineData[312]++;
        e.preventDefault();
      }
      _$jscoverage['/touch.js'].lineData[314]++;
      return;
    }
  }
  _$jscoverage['/touch.js'].lineData[318]++;
  if (visit51_318_1(isTouchEventSupported)) {
    _$jscoverage['/touch.js'].lineData[319]++;
    e.preventDefault();
  }
  _$jscoverage['/touch.js'].lineData[322]++;
  onDragScroll(self, e, 'left', startMousePos);
  _$jscoverage['/touch.js'].lineData[323]++;
  onDragScroll(self, e, 'top', startMousePos);
  _$jscoverage['/touch.js'].lineData[326]++;
  self.fire('scrollTouchMove', pos);
};
  _$jscoverage['/touch.js'].lineData[329]++;
  if (visit52_329_1(S.UA.ie)) {
    _$jscoverage['/touch.js'].lineData[330]++;
    onDragHandler = S.throttle(onDragHandler, 30);
  }
  _$jscoverage['/touch.js'].lineData[333]++;
  function onDragEndHandler(e) {
    _$jscoverage['/touch.js'].functionData[9]++;
    _$jscoverage['/touch.js'].lineData[335]++;
    if (visit53_335_1(!e.isTouch)) {
      _$jscoverage['/touch.js'].lineData[336]++;
      return;
    }
    _$jscoverage['/touch.js'].lineData[338]++;
    var self = this;
    _$jscoverage['/touch.js'].lineData[339]++;
    var startMousePos = self.startMousePos;
    _$jscoverage['/touch.js'].lineData[341]++;
    $document.detach(Gesture.move, onDragHandler, self).detach(Gesture.end, onDragEndHandler, self);
    _$jscoverage['/touch.js'].lineData[342]++;
    if (visit54_342_1(!startMousePos || !self.isScrolling)) {
      _$jscoverage['/touch.js'].lineData[343]++;
      return;
    }
    _$jscoverage['/touch.js'].lineData[345]++;
    var offsetX = startMousePos.pageX - e.pageX;
    _$jscoverage['/touch.js'].lineData[346]++;
    var offsetY = startMousePos.pageY - e.pageY;
    _$jscoverage['/touch.js'].lineData[347]++;
    self.fire('touchEnd', {
  pageX: e.pageX, 
  deltaX: -offsetX, 
  deltaY: -offsetY, 
  pageY: e.pageY});
  }
  _$jscoverage['/touch.js'].lineData[356]++;
  function defaultTouchEndHandler(e) {
    _$jscoverage['/touch.js'].functionData[10]++;
    _$jscoverage['/touch.js'].lineData[357]++;
    var self = this;
    _$jscoverage['/touch.js'].lineData[358]++;
    var count = 0;
    _$jscoverage['/touch.js'].lineData[359]++;
    var offsetX = -e.deltaX;
    _$jscoverage['/touch.js'].lineData[360]++;
    var offsetY = -e.deltaY;
    _$jscoverage['/touch.js'].lineData[361]++;
    var snapThreshold = self._snapThresholdCfg;
    _$jscoverage['/touch.js'].lineData[362]++;
    var allowX = visit55_362_1(self.allowScroll.left && visit56_362_2(Math.abs(offsetX) > snapThreshold));
    _$jscoverage['/touch.js'].lineData[363]++;
    var allowY = visit57_363_1(self.allowScroll.top && visit58_363_2(Math.abs(offsetY) > snapThreshold));
    _$jscoverage['/touch.js'].lineData[365]++;
    function endCallback() {
      _$jscoverage['/touch.js'].functionData[11]++;
      _$jscoverage['/touch.js'].lineData[366]++;
      count++;
      _$jscoverage['/touch.js'].lineData[367]++;
      if (visit59_367_1(count === 2)) {
        _$jscoverage['/touch.js'].lineData[368]++;
        var scrollEnd = function() {
  _$jscoverage['/touch.js'].functionData[12]++;
  _$jscoverage['/touch.js'].lineData[369]++;
  self.isScrolling = 0;
  _$jscoverage['/touch.js'].lineData[370]++;
  self.fire('scrollTouchEnd', {
  pageX: e.pageX, 
  pageY: e.pageY, 
  deltaX: -offsetX, 
  deltaY: -offsetY, 
  fromPageIndex: pageIndex, 
  pageIndex: self.get('pageIndex')});
};
        _$jscoverage['/touch.js'].lineData[380]++;
        if (visit60_380_1(!self.pagesOffset)) {
          _$jscoverage['/touch.js'].lineData[381]++;
          scrollEnd();
          _$jscoverage['/touch.js'].lineData[382]++;
          return;
        }
        _$jscoverage['/touch.js'].lineData[385]++;
        var snapDuration = self._snapDurationCfg;
        _$jscoverage['/touch.js'].lineData[386]++;
        var snapEasing = self._snapEasingCfg;
        _$jscoverage['/touch.js'].lineData[387]++;
        var pageIndex = self.get('pageIndex');
        _$jscoverage['/touch.js'].lineData[388]++;
        var scrollLeft = self.get('scrollLeft');
        _$jscoverage['/touch.js'].lineData[389]++;
        var scrollTop = self.get('scrollTop');
        _$jscoverage['/touch.js'].lineData[391]++;
        var animCfg = {
  duration: snapDuration, 
  easing: snapEasing, 
  complete: scrollEnd};
        _$jscoverage['/touch.js'].lineData[397]++;
        var pagesOffset = self.pagesOffset;
        _$jscoverage['/touch.js'].lineData[398]++;
        var pagesOffsetLen = pagesOffset.length;
        _$jscoverage['/touch.js'].lineData[400]++;
        self.isScrolling = 0;
        _$jscoverage['/touch.js'].lineData[402]++;
        if (visit61_402_1(allowX || allowY)) {
          _$jscoverage['/touch.js'].lineData[403]++;
          if (visit62_403_1(allowX && allowY)) {
            _$jscoverage['/touch.js'].lineData[404]++;
            var prepareX = [], i, newPageIndex;
            _$jscoverage['/touch.js'].lineData[407]++;
            var nowXY = {
  left: scrollLeft, 
  top: scrollTop};
            _$jscoverage['/touch.js'].lineData[411]++;
            for (i = 0; visit63_411_1(i < pagesOffsetLen); i++) {
              _$jscoverage['/touch.js'].lineData[412]++;
              var offset = pagesOffset[i];
              _$jscoverage['/touch.js'].lineData[413]++;
              if (visit64_413_1(offset)) {
                _$jscoverage['/touch.js'].lineData[414]++;
                if (visit65_414_1(visit66_414_2(offsetX > 0) && visit67_414_3(offset.left > nowXY.left))) {
                  _$jscoverage['/touch.js'].lineData[415]++;
                  prepareX.push(offset);
                } else {
                  _$jscoverage['/touch.js'].lineData[416]++;
                  if (visit68_416_1(visit69_416_2(offsetX < 0) && visit70_416_3(offset.left < nowXY.left))) {
                    _$jscoverage['/touch.js'].lineData[417]++;
                    prepareX.push(offset);
                  }
                }
              }
            }
            _$jscoverage['/touch.js'].lineData[421]++;
            var min;
            _$jscoverage['/touch.js'].lineData[422]++;
            var prepareXLen = prepareX.length;
            _$jscoverage['/touch.js'].lineData[423]++;
            var x;
            _$jscoverage['/touch.js'].lineData[424]++;
            if (visit71_424_1(offsetY > 0)) {
              _$jscoverage['/touch.js'].lineData[425]++;
              min = Number.MAX_VALUE;
              _$jscoverage['/touch.js'].lineData[426]++;
              for (i = 0; visit72_426_1(i < prepareXLen); i++) {
                _$jscoverage['/touch.js'].lineData[427]++;
                x = prepareX[i];
                _$jscoverage['/touch.js'].lineData[428]++;
                if (visit73_428_1(x.top > nowXY.top)) {
                  _$jscoverage['/touch.js'].lineData[429]++;
                  if (visit74_429_1(min < x.top - nowXY.top)) {
                    _$jscoverage['/touch.js'].lineData[430]++;
                    min = x.top - nowXY.top;
                    _$jscoverage['/touch.js'].lineData[431]++;
                    newPageIndex = prepareX.index;
                  }
                }
              }
            } else {
              _$jscoverage['/touch.js'].lineData[436]++;
              min = Number.MAX_VALUE;
              _$jscoverage['/touch.js'].lineData[437]++;
              for (i = 0; visit75_437_1(i < prepareXLen); i++) {
                _$jscoverage['/touch.js'].lineData[438]++;
                x = prepareX[i];
                _$jscoverage['/touch.js'].lineData[439]++;
                if (visit76_439_1(x.top < nowXY.top)) {
                  _$jscoverage['/touch.js'].lineData[440]++;
                  if (visit77_440_1(min < nowXY.top - x.top)) {
                    _$jscoverage['/touch.js'].lineData[441]++;
                    min = nowXY.top - x.top;
                    _$jscoverage['/touch.js'].lineData[442]++;
                    newPageIndex = prepareX.index;
                  }
                }
              }
            }
            _$jscoverage['/touch.js'].lineData[447]++;
            if (visit78_447_1(newPageIndex !== undefined)) {
              _$jscoverage['/touch.js'].lineData[448]++;
              if (visit79_448_1(newPageIndex !== pageIndex)) {
                _$jscoverage['/touch.js'].lineData[449]++;
                self.scrollToPage(newPageIndex, animCfg);
              } else {
                _$jscoverage['/touch.js'].lineData[451]++;
                self.scrollToPage(newPageIndex);
                _$jscoverage['/touch.js'].lineData[452]++;
                scrollEnd();
              }
            } else {
              _$jscoverage['/touch.js'].lineData[455]++;
              scrollEnd();
            }
          } else {
            _$jscoverage['/touch.js'].lineData[458]++;
            if (visit80_458_1(allowX || allowY)) {
              _$jscoverage['/touch.js'].lineData[459]++;
              var toPageIndex = self.getPageIndexFromXY(allowX ? scrollLeft : scrollTop, allowX, allowX ? offsetX : offsetY);
              _$jscoverage['/touch.js'].lineData[462]++;
              self.scrollToPage(toPageIndex, animCfg);
            } else {
              _$jscoverage['/touch.js'].lineData[464]++;
              self.scrollToPage(pageIndex);
              _$jscoverage['/touch.js'].lineData[465]++;
              scrollEnd();
            }
          }
        }
      }
    }
    _$jscoverage['/touch.js'].lineData[472]++;
    onDragEndAxis(self, e, 'left', endCallback);
    _$jscoverage['/touch.js'].lineData[473]++;
    onDragEndAxis(self, e, 'top', endCallback);
  }
  _$jscoverage['/touch.js'].lineData[476]++;
  function initStates(self) {
    _$jscoverage['/touch.js'].functionData[13]++;
    _$jscoverage['/touch.js'].lineData[477]++;
    self.lastPageXY = {};
    _$jscoverage['/touch.js'].lineData[478]++;
    self.lastDirection = {};
    _$jscoverage['/touch.js'].lineData[479]++;
    self.swipe = {
  left: {}, 
  top: {}};
    _$jscoverage['/touch.js'].lineData[483]++;
    self.startMousePos = null;
    _$jscoverage['/touch.js'].lineData[484]++;
    self.startScroll = {};
    _$jscoverage['/touch.js'].lineData[485]++;
    self.dragInitDirection = null;
  }
  _$jscoverage['/touch.js'].lineData[488]++;
  function preventDefault(e) {
    _$jscoverage['/touch.js'].functionData[14]++;
    _$jscoverage['/touch.js'].lineData[489]++;
    e.preventDefault();
  }
  _$jscoverage['/touch.js'].lineData[498]++;
  return ScrollViewBase.extend({
  initializer: function() {
  _$jscoverage['/touch.js'].functionData[15]++;
  _$jscoverage['/touch.js'].lineData[500]++;
  var self = this;
  _$jscoverage['/touch.js'].lineData[501]++;
  self._snapThresholdCfg = self.get('snapThreshold');
  _$jscoverage['/touch.js'].lineData[502]++;
  self._snapDurationCfg = self.get('snapDuration');
  _$jscoverage['/touch.js'].lineData[503]++;
  self._snapEasingCfg = self.get('snapEasing');
  _$jscoverage['/touch.js'].lineData[504]++;
  self.publish('touchEnd', {
  defaultFn: defaultTouchEndHandler, 
  defaultTargetOnly: true});
}, 
  bindUI: function() {
  _$jscoverage['/touch.js'].functionData[16]++;
  _$jscoverage['/touch.js'].lineData[512]++;
  var self = this;
  _$jscoverage['/touch.js'].lineData[514]++;
  self.$contentEl.on('dragstart', preventDefault).on(Gesture.start, onDragStartHandler, self);
}, 
  destructor: function() {
  _$jscoverage['/touch.js'].functionData[17]++;
  _$jscoverage['/touch.js'].lineData[518]++;
  this.stopAnimation();
}, 
  stopAnimation: function() {
  _$jscoverage['/touch.js'].functionData[18]++;
  _$jscoverage['/touch.js'].lineData[522]++;
  this.callSuper();
  _$jscoverage['/touch.js'].lineData[523]++;
  this.isScrolling = 0;
}}, {
  ATTRS: {
  lockX: {
  value: true}, 
  preventDefaultX: {
  value: true}, 
  lockY: {
  value: false}, 
  preventDefaultY: {
  value: false}, 
  snapDuration: {
  value: 0.3}, 
  snapEasing: {
  value: 'easeOut'}, 
  snapThreshold: {
  value: 5}, 
  bounce: {
  value: true}, 
  bounceDuration: {
  value: 0.4}, 
  bounceEasing: {
  value: 'easeOut'}}});
});
