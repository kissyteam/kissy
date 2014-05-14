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
if (! _$jscoverage['/editor/styles.js']) {
  _$jscoverage['/editor/styles.js'] = {};
  _$jscoverage['/editor/styles.js'].lineData = [];
  _$jscoverage['/editor/styles.js'].lineData[10] = 0;
  _$jscoverage['/editor/styles.js'].lineData[11] = 0;
  _$jscoverage['/editor/styles.js'].lineData[12] = 0;
  _$jscoverage['/editor/styles.js'].lineData[13] = 0;
  _$jscoverage['/editor/styles.js'].lineData[14] = 0;
  _$jscoverage['/editor/styles.js'].lineData[15] = 0;
  _$jscoverage['/editor/styles.js'].lineData[16] = 0;
  _$jscoverage['/editor/styles.js'].lineData[18] = 0;
  _$jscoverage['/editor/styles.js'].lineData[66] = 0;
  _$jscoverage['/editor/styles.js'].lineData[81] = 0;
  _$jscoverage['/editor/styles.js'].lineData[84] = 0;
  _$jscoverage['/editor/styles.js'].lineData[87] = 0;
  _$jscoverage['/editor/styles.js'].lineData[88] = 0;
  _$jscoverage['/editor/styles.js'].lineData[89] = 0;
  _$jscoverage['/editor/styles.js'].lineData[91] = 0;
  _$jscoverage['/editor/styles.js'].lineData[92] = 0;
  _$jscoverage['/editor/styles.js'].lineData[95] = 0;
  _$jscoverage['/editor/styles.js'].lineData[106] = 0;
  _$jscoverage['/editor/styles.js'].lineData[107] = 0;
  _$jscoverage['/editor/styles.js'].lineData[108] = 0;
  _$jscoverage['/editor/styles.js'].lineData[109] = 0;
  _$jscoverage['/editor/styles.js'].lineData[112] = 0;
  _$jscoverage['/editor/styles.js'].lineData[114] = 0;
  _$jscoverage['/editor/styles.js'].lineData[119] = 0;
  _$jscoverage['/editor/styles.js'].lineData[124] = 0;
  _$jscoverage['/editor/styles.js'].lineData[126] = 0;
  _$jscoverage['/editor/styles.js'].lineData[130] = 0;
  _$jscoverage['/editor/styles.js'].lineData[132] = 0;
  _$jscoverage['/editor/styles.js'].lineData[134] = 0;
  _$jscoverage['/editor/styles.js'].lineData[135] = 0;
  _$jscoverage['/editor/styles.js'].lineData[137] = 0;
  _$jscoverage['/editor/styles.js'].lineData[139] = 0;
  _$jscoverage['/editor/styles.js'].lineData[142] = 0;
  _$jscoverage['/editor/styles.js'].lineData[146] = 0;
  _$jscoverage['/editor/styles.js'].lineData[150] = 0;
  _$jscoverage['/editor/styles.js'].lineData[154] = 0;
  _$jscoverage['/editor/styles.js'].lineData[155] = 0;
  _$jscoverage['/editor/styles.js'].lineData[168] = 0;
  _$jscoverage['/editor/styles.js'].lineData[169] = 0;
  _$jscoverage['/editor/styles.js'].lineData[178] = 0;
  _$jscoverage['/editor/styles.js'].lineData[179] = 0;
  _$jscoverage['/editor/styles.js'].lineData[181] = 0;
  _$jscoverage['/editor/styles.js'].lineData[182] = 0;
  _$jscoverage['/editor/styles.js'].lineData[186] = 0;
  _$jscoverage['/editor/styles.js'].lineData[188] = 0;
  _$jscoverage['/editor/styles.js'].lineData[189] = 0;
  _$jscoverage['/editor/styles.js'].lineData[192] = 0;
  _$jscoverage['/editor/styles.js'].lineData[194] = 0;
  _$jscoverage['/editor/styles.js'].lineData[195] = 0;
  _$jscoverage['/editor/styles.js'].lineData[197] = 0;
  _$jscoverage['/editor/styles.js'].lineData[198] = 0;
  _$jscoverage['/editor/styles.js'].lineData[201] = 0;
  _$jscoverage['/editor/styles.js'].lineData[202] = 0;
  _$jscoverage['/editor/styles.js'].lineData[206] = 0;
  _$jscoverage['/editor/styles.js'].lineData[207] = 0;
  _$jscoverage['/editor/styles.js'].lineData[209] = 0;
  _$jscoverage['/editor/styles.js'].lineData[210] = 0;
  _$jscoverage['/editor/styles.js'].lineData[214] = 0;
  _$jscoverage['/editor/styles.js'].lineData[215] = 0;
  _$jscoverage['/editor/styles.js'].lineData[218] = 0;
  _$jscoverage['/editor/styles.js'].lineData[223] = 0;
  _$jscoverage['/editor/styles.js'].lineData[227] = 0;
  _$jscoverage['/editor/styles.js'].lineData[229] = 0;
  _$jscoverage['/editor/styles.js'].lineData[230] = 0;
  _$jscoverage['/editor/styles.js'].lineData[232] = 0;
  _$jscoverage['/editor/styles.js'].lineData[233] = 0;
  _$jscoverage['/editor/styles.js'].lineData[234] = 0;
  _$jscoverage['/editor/styles.js'].lineData[235] = 0;
  _$jscoverage['/editor/styles.js'].lineData[236] = 0;
  _$jscoverage['/editor/styles.js'].lineData[237] = 0;
  _$jscoverage['/editor/styles.js'].lineData[244] = 0;
  _$jscoverage['/editor/styles.js'].lineData[247] = 0;
  _$jscoverage['/editor/styles.js'].lineData[252] = 0;
  _$jscoverage['/editor/styles.js'].lineData[253] = 0;
  _$jscoverage['/editor/styles.js'].lineData[254] = 0;
  _$jscoverage['/editor/styles.js'].lineData[255] = 0;
  _$jscoverage['/editor/styles.js'].lineData[256] = 0;
  _$jscoverage['/editor/styles.js'].lineData[257] = 0;
  _$jscoverage['/editor/styles.js'].lineData[258] = 0;
  _$jscoverage['/editor/styles.js'].lineData[260] = 0;
  _$jscoverage['/editor/styles.js'].lineData[266] = 0;
  _$jscoverage['/editor/styles.js'].lineData[274] = 0;
  _$jscoverage['/editor/styles.js'].lineData[276] = 0;
  _$jscoverage['/editor/styles.js'].lineData[281] = 0;
  _$jscoverage['/editor/styles.js'].lineData[283] = 0;
  _$jscoverage['/editor/styles.js'].lineData[284] = 0;
  _$jscoverage['/editor/styles.js'].lineData[286] = 0;
  _$jscoverage['/editor/styles.js'].lineData[288] = 0;
  _$jscoverage['/editor/styles.js'].lineData[291] = 0;
  _$jscoverage['/editor/styles.js'].lineData[292] = 0;
  _$jscoverage['/editor/styles.js'].lineData[295] = 0;
  _$jscoverage['/editor/styles.js'].lineData[296] = 0;
  _$jscoverage['/editor/styles.js'].lineData[300] = 0;
  _$jscoverage['/editor/styles.js'].lineData[305] = 0;
  _$jscoverage['/editor/styles.js'].lineData[307] = 0;
  _$jscoverage['/editor/styles.js'].lineData[308] = 0;
  _$jscoverage['/editor/styles.js'].lineData[309] = 0;
  _$jscoverage['/editor/styles.js'].lineData[312] = 0;
  _$jscoverage['/editor/styles.js'].lineData[315] = 0;
  _$jscoverage['/editor/styles.js'].lineData[318] = 0;
  _$jscoverage['/editor/styles.js'].lineData[319] = 0;
  _$jscoverage['/editor/styles.js'].lineData[322] = 0;
  _$jscoverage['/editor/styles.js'].lineData[324] = 0;
  _$jscoverage['/editor/styles.js'].lineData[328] = 0;
  _$jscoverage['/editor/styles.js'].lineData[329] = 0;
  _$jscoverage['/editor/styles.js'].lineData[331] = 0;
  _$jscoverage['/editor/styles.js'].lineData[338] = 0;
  _$jscoverage['/editor/styles.js'].lineData[339] = 0;
  _$jscoverage['/editor/styles.js'].lineData[342] = 0;
  _$jscoverage['/editor/styles.js'].lineData[345] = 0;
  _$jscoverage['/editor/styles.js'].lineData[346] = 0;
  _$jscoverage['/editor/styles.js'].lineData[349] = 0;
  _$jscoverage['/editor/styles.js'].lineData[350] = 0;
  _$jscoverage['/editor/styles.js'].lineData[355] = 0;
  _$jscoverage['/editor/styles.js'].lineData[356] = 0;
  _$jscoverage['/editor/styles.js'].lineData[360] = 0;
  _$jscoverage['/editor/styles.js'].lineData[363] = 0;
  _$jscoverage['/editor/styles.js'].lineData[364] = 0;
  _$jscoverage['/editor/styles.js'].lineData[367] = 0;
  _$jscoverage['/editor/styles.js'].lineData[370] = 0;
  _$jscoverage['/editor/styles.js'].lineData[371] = 0;
  _$jscoverage['/editor/styles.js'].lineData[376] = 0;
  _$jscoverage['/editor/styles.js'].lineData[377] = 0;
  _$jscoverage['/editor/styles.js'].lineData[378] = 0;
  _$jscoverage['/editor/styles.js'].lineData[384] = 0;
  _$jscoverage['/editor/styles.js'].lineData[385] = 0;
  _$jscoverage['/editor/styles.js'].lineData[388] = 0;
  _$jscoverage['/editor/styles.js'].lineData[391] = 0;
  _$jscoverage['/editor/styles.js'].lineData[394] = 0;
  _$jscoverage['/editor/styles.js'].lineData[396] = 0;
  _$jscoverage['/editor/styles.js'].lineData[400] = 0;
  _$jscoverage['/editor/styles.js'].lineData[402] = 0;
  _$jscoverage['/editor/styles.js'].lineData[404] = 0;
  _$jscoverage['/editor/styles.js'].lineData[405] = 0;
  _$jscoverage['/editor/styles.js'].lineData[406] = 0;
  _$jscoverage['/editor/styles.js'].lineData[408] = 0;
  _$jscoverage['/editor/styles.js'].lineData[412] = 0;
  _$jscoverage['/editor/styles.js'].lineData[413] = 0;
  _$jscoverage['/editor/styles.js'].lineData[416] = 0;
  _$jscoverage['/editor/styles.js'].lineData[418] = 0;
  _$jscoverage['/editor/styles.js'].lineData[419] = 0;
  _$jscoverage['/editor/styles.js'].lineData[421] = 0;
  _$jscoverage['/editor/styles.js'].lineData[422] = 0;
  _$jscoverage['/editor/styles.js'].lineData[424] = 0;
  _$jscoverage['/editor/styles.js'].lineData[426] = 0;
  _$jscoverage['/editor/styles.js'].lineData[432] = 0;
  _$jscoverage['/editor/styles.js'].lineData[434] = 0;
  _$jscoverage['/editor/styles.js'].lineData[437] = 0;
  _$jscoverage['/editor/styles.js'].lineData[440] = 0;
  _$jscoverage['/editor/styles.js'].lineData[444] = 0;
  _$jscoverage['/editor/styles.js'].lineData[447] = 0;
  _$jscoverage['/editor/styles.js'].lineData[450] = 0;
  _$jscoverage['/editor/styles.js'].lineData[451] = 0;
  _$jscoverage['/editor/styles.js'].lineData[452] = 0;
  _$jscoverage['/editor/styles.js'].lineData[453] = 0;
  _$jscoverage['/editor/styles.js'].lineData[454] = 0;
  _$jscoverage['/editor/styles.js'].lineData[455] = 0;
  _$jscoverage['/editor/styles.js'].lineData[457] = 0;
  _$jscoverage['/editor/styles.js'].lineData[460] = 0;
  _$jscoverage['/editor/styles.js'].lineData[464] = 0;
  _$jscoverage['/editor/styles.js'].lineData[467] = 0;
  _$jscoverage['/editor/styles.js'].lineData[472] = 0;
  _$jscoverage['/editor/styles.js'].lineData[475] = 0;
  _$jscoverage['/editor/styles.js'].lineData[476] = 0;
  _$jscoverage['/editor/styles.js'].lineData[478] = 0;
  _$jscoverage['/editor/styles.js'].lineData[480] = 0;
  _$jscoverage['/editor/styles.js'].lineData[486] = 0;
  _$jscoverage['/editor/styles.js'].lineData[487] = 0;
  _$jscoverage['/editor/styles.js'].lineData[492] = 0;
  _$jscoverage['/editor/styles.js'].lineData[493] = 0;
  _$jscoverage['/editor/styles.js'].lineData[494] = 0;
  _$jscoverage['/editor/styles.js'].lineData[496] = 0;
  _$jscoverage['/editor/styles.js'].lineData[498] = 0;
  _$jscoverage['/editor/styles.js'].lineData[501] = 0;
  _$jscoverage['/editor/styles.js'].lineData[502] = 0;
  _$jscoverage['/editor/styles.js'].lineData[504] = 0;
  _$jscoverage['/editor/styles.js'].lineData[509] = 0;
  _$jscoverage['/editor/styles.js'].lineData[510] = 0;
  _$jscoverage['/editor/styles.js'].lineData[511] = 0;
  _$jscoverage['/editor/styles.js'].lineData[513] = 0;
  _$jscoverage['/editor/styles.js'].lineData[523] = 0;
  _$jscoverage['/editor/styles.js'].lineData[527] = 0;
  _$jscoverage['/editor/styles.js'].lineData[528] = 0;
  _$jscoverage['/editor/styles.js'].lineData[530] = 0;
  _$jscoverage['/editor/styles.js'].lineData[533] = 0;
  _$jscoverage['/editor/styles.js'].lineData[537] = 0;
  _$jscoverage['/editor/styles.js'].lineData[538] = 0;
  _$jscoverage['/editor/styles.js'].lineData[539] = 0;
  _$jscoverage['/editor/styles.js'].lineData[540] = 0;
  _$jscoverage['/editor/styles.js'].lineData[544] = 0;
  _$jscoverage['/editor/styles.js'].lineData[545] = 0;
  _$jscoverage['/editor/styles.js'].lineData[546] = 0;
  _$jscoverage['/editor/styles.js'].lineData[549] = 0;
  _$jscoverage['/editor/styles.js'].lineData[550] = 0;
  _$jscoverage['/editor/styles.js'].lineData[551] = 0;
  _$jscoverage['/editor/styles.js'].lineData[552] = 0;
  _$jscoverage['/editor/styles.js'].lineData[553] = 0;
  _$jscoverage['/editor/styles.js'].lineData[555] = 0;
  _$jscoverage['/editor/styles.js'].lineData[561] = 0;
  _$jscoverage['/editor/styles.js'].lineData[562] = 0;
  _$jscoverage['/editor/styles.js'].lineData[564] = 0;
  _$jscoverage['/editor/styles.js'].lineData[567] = 0;
  _$jscoverage['/editor/styles.js'].lineData[568] = 0;
  _$jscoverage['/editor/styles.js'].lineData[569] = 0;
  _$jscoverage['/editor/styles.js'].lineData[571] = 0;
  _$jscoverage['/editor/styles.js'].lineData[574] = 0;
  _$jscoverage['/editor/styles.js'].lineData[575] = 0;
  _$jscoverage['/editor/styles.js'].lineData[578] = 0;
  _$jscoverage['/editor/styles.js'].lineData[580] = 0;
  _$jscoverage['/editor/styles.js'].lineData[582] = 0;
  _$jscoverage['/editor/styles.js'].lineData[584] = 0;
  _$jscoverage['/editor/styles.js'].lineData[585] = 0;
  _$jscoverage['/editor/styles.js'].lineData[587] = 0;
  _$jscoverage['/editor/styles.js'].lineData[592] = 0;
  _$jscoverage['/editor/styles.js'].lineData[593] = 0;
  _$jscoverage['/editor/styles.js'].lineData[594] = 0;
  _$jscoverage['/editor/styles.js'].lineData[598] = 0;
  _$jscoverage['/editor/styles.js'].lineData[601] = 0;
  _$jscoverage['/editor/styles.js'].lineData[602] = 0;
  _$jscoverage['/editor/styles.js'].lineData[606] = 0;
  _$jscoverage['/editor/styles.js'].lineData[612] = 0;
  _$jscoverage['/editor/styles.js'].lineData[613] = 0;
  _$jscoverage['/editor/styles.js'].lineData[615] = 0;
  _$jscoverage['/editor/styles.js'].lineData[616] = 0;
  _$jscoverage['/editor/styles.js'].lineData[617] = 0;
  _$jscoverage['/editor/styles.js'].lineData[619] = 0;
  _$jscoverage['/editor/styles.js'].lineData[623] = 0;
  _$jscoverage['/editor/styles.js'].lineData[624] = 0;
  _$jscoverage['/editor/styles.js'].lineData[625] = 0;
  _$jscoverage['/editor/styles.js'].lineData[629] = 0;
  _$jscoverage['/editor/styles.js'].lineData[639] = 0;
  _$jscoverage['/editor/styles.js'].lineData[649] = 0;
  _$jscoverage['/editor/styles.js'].lineData[652] = 0;
  _$jscoverage['/editor/styles.js'].lineData[653] = 0;
  _$jscoverage['/editor/styles.js'].lineData[654] = 0;
  _$jscoverage['/editor/styles.js'].lineData[655] = 0;
  _$jscoverage['/editor/styles.js'].lineData[656] = 0;
  _$jscoverage['/editor/styles.js'].lineData[665] = 0;
  _$jscoverage['/editor/styles.js'].lineData[674] = 0;
  _$jscoverage['/editor/styles.js'].lineData[675] = 0;
  _$jscoverage['/editor/styles.js'].lineData[680] = 0;
  _$jscoverage['/editor/styles.js'].lineData[682] = 0;
  _$jscoverage['/editor/styles.js'].lineData[695] = 0;
  _$jscoverage['/editor/styles.js'].lineData[705] = 0;
  _$jscoverage['/editor/styles.js'].lineData[708] = 0;
  _$jscoverage['/editor/styles.js'].lineData[712] = 0;
  _$jscoverage['/editor/styles.js'].lineData[715] = 0;
  _$jscoverage['/editor/styles.js'].lineData[719] = 0;
  _$jscoverage['/editor/styles.js'].lineData[723] = 0;
  _$jscoverage['/editor/styles.js'].lineData[725] = 0;
  _$jscoverage['/editor/styles.js'].lineData[729] = 0;
  _$jscoverage['/editor/styles.js'].lineData[738] = 0;
  _$jscoverage['/editor/styles.js'].lineData[742] = 0;
  _$jscoverage['/editor/styles.js'].lineData[743] = 0;
  _$jscoverage['/editor/styles.js'].lineData[744] = 0;
  _$jscoverage['/editor/styles.js'].lineData[746] = 0;
  _$jscoverage['/editor/styles.js'].lineData[747] = 0;
  _$jscoverage['/editor/styles.js'].lineData[750] = 0;
  _$jscoverage['/editor/styles.js'].lineData[752] = 0;
  _$jscoverage['/editor/styles.js'].lineData[754] = 0;
  _$jscoverage['/editor/styles.js'].lineData[762] = 0;
  _$jscoverage['/editor/styles.js'].lineData[764] = 0;
  _$jscoverage['/editor/styles.js'].lineData[765] = 0;
  _$jscoverage['/editor/styles.js'].lineData[768] = 0;
  _$jscoverage['/editor/styles.js'].lineData[770] = 0;
  _$jscoverage['/editor/styles.js'].lineData[772] = 0;
  _$jscoverage['/editor/styles.js'].lineData[777] = 0;
  _$jscoverage['/editor/styles.js'].lineData[778] = 0;
  _$jscoverage['/editor/styles.js'].lineData[779] = 0;
  _$jscoverage['/editor/styles.js'].lineData[783] = 0;
  _$jscoverage['/editor/styles.js'].lineData[786] = 0;
  _$jscoverage['/editor/styles.js'].lineData[788] = 0;
  _$jscoverage['/editor/styles.js'].lineData[792] = 0;
  _$jscoverage['/editor/styles.js'].lineData[796] = 0;
  _$jscoverage['/editor/styles.js'].lineData[799] = 0;
  _$jscoverage['/editor/styles.js'].lineData[807] = 0;
  _$jscoverage['/editor/styles.js'].lineData[808] = 0;
  _$jscoverage['/editor/styles.js'].lineData[821] = 0;
  _$jscoverage['/editor/styles.js'].lineData[822] = 0;
  _$jscoverage['/editor/styles.js'].lineData[823] = 0;
  _$jscoverage['/editor/styles.js'].lineData[824] = 0;
  _$jscoverage['/editor/styles.js'].lineData[825] = 0;
  _$jscoverage['/editor/styles.js'].lineData[830] = 0;
  _$jscoverage['/editor/styles.js'].lineData[834] = 0;
  _$jscoverage['/editor/styles.js'].lineData[835] = 0;
  _$jscoverage['/editor/styles.js'].lineData[836] = 0;
  _$jscoverage['/editor/styles.js'].lineData[838] = 0;
  _$jscoverage['/editor/styles.js'].lineData[842] = 0;
  _$jscoverage['/editor/styles.js'].lineData[847] = 0;
  _$jscoverage['/editor/styles.js'].lineData[849] = 0;
  _$jscoverage['/editor/styles.js'].lineData[852] = 0;
  _$jscoverage['/editor/styles.js'].lineData[853] = 0;
  _$jscoverage['/editor/styles.js'].lineData[857] = 0;
  _$jscoverage['/editor/styles.js'].lineData[865] = 0;
  _$jscoverage['/editor/styles.js'].lineData[866] = 0;
  _$jscoverage['/editor/styles.js'].lineData[868] = 0;
  _$jscoverage['/editor/styles.js'].lineData[869] = 0;
  _$jscoverage['/editor/styles.js'].lineData[872] = 0;
  _$jscoverage['/editor/styles.js'].lineData[873] = 0;
  _$jscoverage['/editor/styles.js'].lineData[874] = 0;
  _$jscoverage['/editor/styles.js'].lineData[882] = 0;
  _$jscoverage['/editor/styles.js'].lineData[886] = 0;
  _$jscoverage['/editor/styles.js'].lineData[887] = 0;
  _$jscoverage['/editor/styles.js'].lineData[888] = 0;
  _$jscoverage['/editor/styles.js'].lineData[891] = 0;
  _$jscoverage['/editor/styles.js'].lineData[901] = 0;
  _$jscoverage['/editor/styles.js'].lineData[902] = 0;
  _$jscoverage['/editor/styles.js'].lineData[903] = 0;
  _$jscoverage['/editor/styles.js'].lineData[904] = 0;
  _$jscoverage['/editor/styles.js'].lineData[905] = 0;
  _$jscoverage['/editor/styles.js'].lineData[906] = 0;
  _$jscoverage['/editor/styles.js'].lineData[907] = 0;
  _$jscoverage['/editor/styles.js'].lineData[909] = 0;
  _$jscoverage['/editor/styles.js'].lineData[911] = 0;
  _$jscoverage['/editor/styles.js'].lineData[913] = 0;
  _$jscoverage['/editor/styles.js'].lineData[914] = 0;
  _$jscoverage['/editor/styles.js'].lineData[920] = 0;
  _$jscoverage['/editor/styles.js'].lineData[923] = 0;
  _$jscoverage['/editor/styles.js'].lineData[924] = 0;
  _$jscoverage['/editor/styles.js'].lineData[927] = 0;
  _$jscoverage['/editor/styles.js'].lineData[928] = 0;
  _$jscoverage['/editor/styles.js'].lineData[930] = 0;
  _$jscoverage['/editor/styles.js'].lineData[938] = 0;
  _$jscoverage['/editor/styles.js'].lineData[945] = 0;
  _$jscoverage['/editor/styles.js'].lineData[946] = 0;
  _$jscoverage['/editor/styles.js'].lineData[951] = 0;
  _$jscoverage['/editor/styles.js'].lineData[952] = 0;
  _$jscoverage['/editor/styles.js'].lineData[954] = 0;
  _$jscoverage['/editor/styles.js'].lineData[956] = 0;
  _$jscoverage['/editor/styles.js'].lineData[959] = 0;
  _$jscoverage['/editor/styles.js'].lineData[960] = 0;
  _$jscoverage['/editor/styles.js'].lineData[963] = 0;
  _$jscoverage['/editor/styles.js'].lineData[964] = 0;
  _$jscoverage['/editor/styles.js'].lineData[966] = 0;
  _$jscoverage['/editor/styles.js'].lineData[968] = 0;
  _$jscoverage['/editor/styles.js'].lineData[971] = 0;
  _$jscoverage['/editor/styles.js'].lineData[972] = 0;
  _$jscoverage['/editor/styles.js'].lineData[976] = 0;
  _$jscoverage['/editor/styles.js'].lineData[977] = 0;
  _$jscoverage['/editor/styles.js'].lineData[979] = 0;
  _$jscoverage['/editor/styles.js'].lineData[980] = 0;
  _$jscoverage['/editor/styles.js'].lineData[984] = 0;
  _$jscoverage['/editor/styles.js'].lineData[987] = 0;
  _$jscoverage['/editor/styles.js'].lineData[988] = 0;
  _$jscoverage['/editor/styles.js'].lineData[993] = 0;
  _$jscoverage['/editor/styles.js'].lineData[994] = 0;
  _$jscoverage['/editor/styles.js'].lineData[998] = 0;
  _$jscoverage['/editor/styles.js'].lineData[999] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1001] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1002] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1013] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1015] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1016] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1019] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1022] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1026] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1027] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1028] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1030] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1032] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1034] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1037] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1038] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1039] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1041] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1042] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1044] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1048] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1051] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1055] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1058] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1059] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1060] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1063] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1064] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1066] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1068] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1073] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1083] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1085] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1086] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1087] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1089] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1091] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1095] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1096] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1098] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1099] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1105] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1106] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1107] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1108] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1110] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1115] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1118] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1119] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1127] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1128] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1129] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1132] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1135] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1138] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1139] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1143] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1144] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1145] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1146] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1147] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1150] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1151] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1153] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1156] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1157] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1163] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1166] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1170] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1172] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1176] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1180] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1184] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1186] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1190] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1196] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1200] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1201] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1212] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1215] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1217] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1219] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1220] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1224] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1227] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1229] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1232] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1234] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1240] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1243] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1244] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1245] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1246] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1250] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1251] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1257] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1258] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1263] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1265] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1266] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1267] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1268] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1269] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1282] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1283] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1286] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1287] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1288] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1290] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1291] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1299] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1302] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1308] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1310] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1311] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1312] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1314] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1315] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1316] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1320] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1326] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1330] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1333] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1336] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1339] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1341] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1343] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1344] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1347] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1348] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1354] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1356] = 0;
}
if (! _$jscoverage['/editor/styles.js'].functionData) {
  _$jscoverage['/editor/styles.js'].functionData = [];
  _$jscoverage['/editor/styles.js'].functionData[0] = 0;
  _$jscoverage['/editor/styles.js'].functionData[1] = 0;
  _$jscoverage['/editor/styles.js'].functionData[2] = 0;
  _$jscoverage['/editor/styles.js'].functionData[3] = 0;
  _$jscoverage['/editor/styles.js'].functionData[4] = 0;
  _$jscoverage['/editor/styles.js'].functionData[5] = 0;
  _$jscoverage['/editor/styles.js'].functionData[6] = 0;
  _$jscoverage['/editor/styles.js'].functionData[7] = 0;
  _$jscoverage['/editor/styles.js'].functionData[8] = 0;
  _$jscoverage['/editor/styles.js'].functionData[9] = 0;
  _$jscoverage['/editor/styles.js'].functionData[10] = 0;
  _$jscoverage['/editor/styles.js'].functionData[11] = 0;
  _$jscoverage['/editor/styles.js'].functionData[12] = 0;
  _$jscoverage['/editor/styles.js'].functionData[13] = 0;
  _$jscoverage['/editor/styles.js'].functionData[14] = 0;
  _$jscoverage['/editor/styles.js'].functionData[15] = 0;
  _$jscoverage['/editor/styles.js'].functionData[16] = 0;
  _$jscoverage['/editor/styles.js'].functionData[17] = 0;
  _$jscoverage['/editor/styles.js'].functionData[18] = 0;
  _$jscoverage['/editor/styles.js'].functionData[19] = 0;
  _$jscoverage['/editor/styles.js'].functionData[20] = 0;
  _$jscoverage['/editor/styles.js'].functionData[21] = 0;
  _$jscoverage['/editor/styles.js'].functionData[22] = 0;
  _$jscoverage['/editor/styles.js'].functionData[23] = 0;
  _$jscoverage['/editor/styles.js'].functionData[24] = 0;
  _$jscoverage['/editor/styles.js'].functionData[25] = 0;
  _$jscoverage['/editor/styles.js'].functionData[26] = 0;
  _$jscoverage['/editor/styles.js'].functionData[27] = 0;
  _$jscoverage['/editor/styles.js'].functionData[28] = 0;
  _$jscoverage['/editor/styles.js'].functionData[29] = 0;
  _$jscoverage['/editor/styles.js'].functionData[30] = 0;
  _$jscoverage['/editor/styles.js'].functionData[31] = 0;
  _$jscoverage['/editor/styles.js'].functionData[32] = 0;
  _$jscoverage['/editor/styles.js'].functionData[33] = 0;
  _$jscoverage['/editor/styles.js'].functionData[34] = 0;
  _$jscoverage['/editor/styles.js'].functionData[35] = 0;
  _$jscoverage['/editor/styles.js'].functionData[36] = 0;
  _$jscoverage['/editor/styles.js'].functionData[37] = 0;
  _$jscoverage['/editor/styles.js'].functionData[38] = 0;
  _$jscoverage['/editor/styles.js'].functionData[39] = 0;
  _$jscoverage['/editor/styles.js'].functionData[40] = 0;
}
if (! _$jscoverage['/editor/styles.js'].branchData) {
  _$jscoverage['/editor/styles.js'].branchData = {};
  _$jscoverage['/editor/styles.js'].branchData['89'] = [];
  _$jscoverage['/editor/styles.js'].branchData['89'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['107'] = [];
  _$jscoverage['/editor/styles.js'].branchData['107'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['112'] = [];
  _$jscoverage['/editor/styles.js'].branchData['112'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['114'] = [];
  _$jscoverage['/editor/styles.js'].branchData['114'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['114'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['135'] = [];
  _$jscoverage['/editor/styles.js'].branchData['135'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['156'] = [];
  _$jscoverage['/editor/styles.js'].branchData['156'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['158'] = [];
  _$jscoverage['/editor/styles.js'].branchData['158'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['160'] = [];
  _$jscoverage['/editor/styles.js'].branchData['160'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['170'] = [];
  _$jscoverage['/editor/styles.js'].branchData['170'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['178'] = [];
  _$jscoverage['/editor/styles.js'].branchData['178'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['186'] = [];
  _$jscoverage['/editor/styles.js'].branchData['186'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['188'] = [];
  _$jscoverage['/editor/styles.js'].branchData['188'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['194'] = [];
  _$jscoverage['/editor/styles.js'].branchData['194'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['197'] = [];
  _$jscoverage['/editor/styles.js'].branchData['197'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['201'] = [];
  _$jscoverage['/editor/styles.js'].branchData['201'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['202'] = [];
  _$jscoverage['/editor/styles.js'].branchData['202'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['202'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['205'] = [];
  _$jscoverage['/editor/styles.js'].branchData['205'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['206'] = [];
  _$jscoverage['/editor/styles.js'].branchData['206'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['209'] = [];
  _$jscoverage['/editor/styles.js'].branchData['209'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['214'] = [];
  _$jscoverage['/editor/styles.js'].branchData['214'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['225'] = [];
  _$jscoverage['/editor/styles.js'].branchData['225'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['227'] = [];
  _$jscoverage['/editor/styles.js'].branchData['227'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['229'] = [];
  _$jscoverage['/editor/styles.js'].branchData['229'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['232'] = [];
  _$jscoverage['/editor/styles.js'].branchData['232'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['233'] = [];
  _$jscoverage['/editor/styles.js'].branchData['233'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['236'] = [];
  _$jscoverage['/editor/styles.js'].branchData['236'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['244'] = [];
  _$jscoverage['/editor/styles.js'].branchData['244'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['244'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['245'] = [];
  _$jscoverage['/editor/styles.js'].branchData['245'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['245'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['245'][3] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['245'][4] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['246'] = [];
  _$jscoverage['/editor/styles.js'].branchData['246'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['252'] = [];
  _$jscoverage['/editor/styles.js'].branchData['252'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['253'] = [];
  _$jscoverage['/editor/styles.js'].branchData['253'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['256'] = [];
  _$jscoverage['/editor/styles.js'].branchData['256'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['258'] = [];
  _$jscoverage['/editor/styles.js'].branchData['258'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['258'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['258'][3] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['258'][4] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['258'][5] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['258'][6] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['259'] = [];
  _$jscoverage['/editor/styles.js'].branchData['259'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['276'] = [];
  _$jscoverage['/editor/styles.js'].branchData['276'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['283'] = [];
  _$jscoverage['/editor/styles.js'].branchData['283'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['286'] = [];
  _$jscoverage['/editor/styles.js'].branchData['286'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['286'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['286'][3] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['291'] = [];
  _$jscoverage['/editor/styles.js'].branchData['291'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['291'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['295'] = [];
  _$jscoverage['/editor/styles.js'].branchData['295'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['308'] = [];
  _$jscoverage['/editor/styles.js'].branchData['308'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['315'] = [];
  _$jscoverage['/editor/styles.js'].branchData['315'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['315'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['318'] = [];
  _$jscoverage['/editor/styles.js'].branchData['318'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['328'] = [];
  _$jscoverage['/editor/styles.js'].branchData['328'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['338'] = [];
  _$jscoverage['/editor/styles.js'].branchData['338'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['355'] = [];
  _$jscoverage['/editor/styles.js'].branchData['355'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['363'] = [];
  _$jscoverage['/editor/styles.js'].branchData['363'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['376'] = [];
  _$jscoverage['/editor/styles.js'].branchData['376'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['384'] = [];
  _$jscoverage['/editor/styles.js'].branchData['384'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['418'] = [];
  _$jscoverage['/editor/styles.js'].branchData['418'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['421'] = [];
  _$jscoverage['/editor/styles.js'].branchData['421'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['450'] = [];
  _$jscoverage['/editor/styles.js'].branchData['450'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['487'] = [];
  _$jscoverage['/editor/styles.js'].branchData['487'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['488'] = [];
  _$jscoverage['/editor/styles.js'].branchData['488'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['489'] = [];
  _$jscoverage['/editor/styles.js'].branchData['489'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['490'] = [];
  _$jscoverage['/editor/styles.js'].branchData['490'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['492'] = [];
  _$jscoverage['/editor/styles.js'].branchData['492'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['494'] = [];
  _$jscoverage['/editor/styles.js'].branchData['494'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['502'] = [];
  _$jscoverage['/editor/styles.js'].branchData['502'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['511'] = [];
  _$jscoverage['/editor/styles.js'].branchData['511'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['511'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['512'] = [];
  _$jscoverage['/editor/styles.js'].branchData['512'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['527'] = [];
  _$jscoverage['/editor/styles.js'].branchData['527'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['539'] = [];
  _$jscoverage['/editor/styles.js'].branchData['539'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['550'] = [];
  _$jscoverage['/editor/styles.js'].branchData['550'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['552'] = [];
  _$jscoverage['/editor/styles.js'].branchData['552'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['578'] = [];
  _$jscoverage['/editor/styles.js'].branchData['578'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['592'] = [];
  _$jscoverage['/editor/styles.js'].branchData['592'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['612'] = [];
  _$jscoverage['/editor/styles.js'].branchData['612'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['615'] = [];
  _$jscoverage['/editor/styles.js'].branchData['615'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['620'] = [];
  _$jscoverage['/editor/styles.js'].branchData['620'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['623'] = [];
  _$jscoverage['/editor/styles.js'].branchData['623'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['629'] = [];
  _$jscoverage['/editor/styles.js'].branchData['629'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['630'] = [];
  _$jscoverage['/editor/styles.js'].branchData['630'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['631'] = [];
  _$jscoverage['/editor/styles.js'].branchData['631'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['631'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['637'] = [];
  _$jscoverage['/editor/styles.js'].branchData['637'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['649'] = [];
  _$jscoverage['/editor/styles.js'].branchData['649'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['650'] = [];
  _$jscoverage['/editor/styles.js'].branchData['650'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['650'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['651'] = [];
  _$jscoverage['/editor/styles.js'].branchData['651'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['656'] = [];
  _$jscoverage['/editor/styles.js'].branchData['656'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['656'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['656'][3] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['656'][4] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['657'] = [];
  _$jscoverage['/editor/styles.js'].branchData['657'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['658'] = [];
  _$jscoverage['/editor/styles.js'].branchData['658'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['665'] = [];
  _$jscoverage['/editor/styles.js'].branchData['665'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['666'] = [];
  _$jscoverage['/editor/styles.js'].branchData['666'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['666'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['666'][3] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['680'] = [];
  _$jscoverage['/editor/styles.js'].branchData['680'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['680'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['681'] = [];
  _$jscoverage['/editor/styles.js'].branchData['681'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['681'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['696'] = [];
  _$jscoverage['/editor/styles.js'].branchData['696'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['697'] = [];
  _$jscoverage['/editor/styles.js'].branchData['697'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['697'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['699'] = [];
  _$jscoverage['/editor/styles.js'].branchData['699'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['699'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['704'] = [];
  _$jscoverage['/editor/styles.js'].branchData['704'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['723'] = [];
  _$jscoverage['/editor/styles.js'].branchData['723'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['723'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['742'] = [];
  _$jscoverage['/editor/styles.js'].branchData['742'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['742'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['742'][3] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['743'] = [];
  _$jscoverage['/editor/styles.js'].branchData['743'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['746'] = [];
  _$jscoverage['/editor/styles.js'].branchData['746'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['750'] = [];
  _$jscoverage['/editor/styles.js'].branchData['750'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['764'] = [];
  _$jscoverage['/editor/styles.js'].branchData['764'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['768'] = [];
  _$jscoverage['/editor/styles.js'].branchData['768'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['777'] = [];
  _$jscoverage['/editor/styles.js'].branchData['777'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['786'] = [];
  _$jscoverage['/editor/styles.js'].branchData['786'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['807'] = [];
  _$jscoverage['/editor/styles.js'].branchData['807'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['852'] = [];
  _$jscoverage['/editor/styles.js'].branchData['852'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['857'] = [];
  _$jscoverage['/editor/styles.js'].branchData['857'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['857'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['865'] = [];
  _$jscoverage['/editor/styles.js'].branchData['865'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['865'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['865'][3] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['868'] = [];
  _$jscoverage['/editor/styles.js'].branchData['868'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['870'] = [];
  _$jscoverage['/editor/styles.js'].branchData['870'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['872'] = [];
  _$jscoverage['/editor/styles.js'].branchData['872'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['886'] = [];
  _$jscoverage['/editor/styles.js'].branchData['886'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['889'] = [];
  _$jscoverage['/editor/styles.js'].branchData['889'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['901'] = [];
  _$jscoverage['/editor/styles.js'].branchData['901'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['905'] = [];
  _$jscoverage['/editor/styles.js'].branchData['905'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['907'] = [];
  _$jscoverage['/editor/styles.js'].branchData['907'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['919'] = [];
  _$jscoverage['/editor/styles.js'].branchData['919'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['924'] = [];
  _$jscoverage['/editor/styles.js'].branchData['924'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['926'] = [];
  _$jscoverage['/editor/styles.js'].branchData['926'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['928'] = [];
  _$jscoverage['/editor/styles.js'].branchData['928'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['951'] = [];
  _$jscoverage['/editor/styles.js'].branchData['951'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['954'] = [];
  _$jscoverage['/editor/styles.js'].branchData['954'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['954'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['955'] = [];
  _$jscoverage['/editor/styles.js'].branchData['955'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['959'] = [];
  _$jscoverage['/editor/styles.js'].branchData['959'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['963'] = [];
  _$jscoverage['/editor/styles.js'].branchData['963'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['966'] = [];
  _$jscoverage['/editor/styles.js'].branchData['966'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['966'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['967'] = [];
  _$jscoverage['/editor/styles.js'].branchData['967'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['971'] = [];
  _$jscoverage['/editor/styles.js'].branchData['971'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['976'] = [];
  _$jscoverage['/editor/styles.js'].branchData['976'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['979'] = [];
  _$jscoverage['/editor/styles.js'].branchData['979'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['988'] = [];
  _$jscoverage['/editor/styles.js'].branchData['988'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['994'] = [];
  _$jscoverage['/editor/styles.js'].branchData['994'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['995'] = [];
  _$jscoverage['/editor/styles.js'].branchData['995'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['995'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['998'] = [];
  _$jscoverage['/editor/styles.js'].branchData['998'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1003'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1003'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1013'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1013'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1013'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1038'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1038'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1041'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1041'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1048'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1048'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1048'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1049'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1049'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1049'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1050'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1050'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1050'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1050'][3] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1060'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1060'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1066'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1066'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1086'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1086'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1095'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1095'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1106'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1106'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1107'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1107'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1128'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1128'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1135'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1135'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1138'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1138'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1143'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1143'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1150'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1150'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1163'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1163'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1166'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1166'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1171'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1171'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1180'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1180'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1185'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1185'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1204'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1204'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1204'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1206'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1206'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1206'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1208'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1208'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1215'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1215'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1215'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1215'][3] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1215'][4] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1219'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1219'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1227'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1227'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1228'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1228'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1232'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1232'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1257'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1257'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1265'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1265'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1267'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1267'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1284'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1284'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1286'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1286'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1287'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1287'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1299'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1299'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1299'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1300'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1300'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1300'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1301'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1301'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1301'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1301'][3] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1308'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1308'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1310'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1310'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1311'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1311'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1316'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1316'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1316'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1318'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1318'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1318'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1319'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1319'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1319'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1319'][3] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1333'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1333'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1341'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1341'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1343'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1343'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1347'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1347'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1347'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1347'][3] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1347'][4] = new BranchData();
}
_$jscoverage['/editor/styles.js'].branchData['1347'][4].init(269, 48, 'lastChild.nodeType === Dom.NodeType.ELEMENT_NODE');
function visit1062_1347_4(result) {
  _$jscoverage['/editor/styles.js'].branchData['1347'][4].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1347'][3].init(241, 24, 'firstChild !== lastChild');
function visit1061_1347_3(result) {
  _$jscoverage['/editor/styles.js'].branchData['1347'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1347'][2].init(241, 76, 'firstChild !== lastChild && lastChild.nodeType === Dom.NodeType.ELEMENT_NODE');
function visit1060_1347_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['1347'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1347'][1].init(228, 89, 'lastChild && firstChild !== lastChild && lastChild.nodeType === Dom.NodeType.ELEMENT_NODE');
function visit1059_1347_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1347'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1343'][1].init(78, 49, 'firstChild.nodeType === Dom.NodeType.ELEMENT_NODE');
function visit1058_1343_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1343'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1341'][1].init(317, 10, 'firstChild');
function visit1057_1341_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1341'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1333'][1].init(118, 27, '!element._4eHasAttributes()');
function visit1056_1333_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1333'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1319'][3].init(115, 31, 'actualStyleValue === styleValue');
function visit1055_1319_3(result) {
  _$jscoverage['/editor/styles.js'].branchData['1319'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1319'][2].init(81, 30, 'typeof styleValue === \'string\'');
function visit1054_1319_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['1319'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1319'][1].init(81, 65, 'typeof styleValue === \'string\' && actualStyleValue === styleValue');
function visit1053_1319_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1319'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1318'][2].init(184, 51, 'styleValue.test && styleValue.test(actualAttrValue)');
function visit1052_1318_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['1318'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1318'][1].init(103, 148, '(styleValue.test && styleValue.test(actualAttrValue)) || (typeof styleValue === \'string\' && actualStyleValue === styleValue)');
function visit1051_1318_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1318'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1316'][2].init(78, 19, 'styleValue === NULL');
function visit1050_1316_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['1316'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1316'][1].init(78, 252, 'styleValue === NULL || (styleValue.test && styleValue.test(actualAttrValue)) || (typeof styleValue === \'string\' && actualStyleValue === styleValue)');
function visit1049_1316_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1316'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1311'][1].init(26, 17, 'i < styles.length');
function visit1048_1311_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1311'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1310'][1].init(1167, 6, 'styles');
function visit1047_1310_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1310'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1308'][1].init(1121, 29, 'overrides && overrides.styles');
function visit1046_1308_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1308'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1301'][3].init(109, 28, 'actualAttrValue === attValue');
function visit1045_1301_3(result) {
  _$jscoverage['/editor/styles.js'].branchData['1301'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1301'][2].init(77, 28, 'typeof attValue === \'string\'');
function visit1044_1301_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['1301'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1301'][1].init(77, 60, 'typeof attValue === \'string\' && actualAttrValue === attValue');
function visit1043_1301_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1301'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1300'][2].init(531, 47, 'attValue.test && attValue.test(actualAttrValue)');
function visit1042_1300_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['1300'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1300'][1].init(46, 139, '(attValue.test && attValue.test(actualAttrValue)) || (typeof attValue === \'string\' && actualAttrValue === attValue)');
function visit1041_1300_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1300'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1299'][2].init(482, 17, 'attValue === NULL');
function visit1040_1299_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['1299'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1299'][1].init(482, 186, 'attValue === NULL || (attValue.test && attValue.test(actualAttrValue)) || (typeof attValue === \'string\' && actualAttrValue === attValue)');
function visit1039_1299_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1299'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1287'][1].init(26, 21, 'i < attributes.length');
function visit1038_1287_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1287'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1286'][1].init(110, 10, 'attributes');
function visit1037_1286_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1286'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1284'][1].init(49, 33, 'overrides && overrides.attributes');
function visit1036_1284_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1284'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1267'][1].init(116, 6, 'i >= 0');
function visit1035_1267_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1267'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1265'][1].init(20, 33, 'overrideElement !== style.element');
function visit1034_1265_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1265'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1257'][1].init(260, 8, '--i >= 0');
function visit1033_1257_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1257'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1232'][1].init(303, 41, 'removeEmpty || !!element.style(styleName)');
function visit1032_1232_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1232'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1228'][1].init(48, 82, 'element.style(styleName) !== normalizeProperty(styleName, styles[styleName], TRUE)');
function visit1031_1228_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1228'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1227'][1].init(97, 131, 'style._.definition.fullMatch && element.style(styleName) !== normalizeProperty(styleName, styles[styleName], TRUE)');
function visit1030_1227_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1227'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1219'][1].init(302, 41, 'removeEmpty || !!element.hasAttr(attName)');
function visit1029_1219_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1219'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1215'][4].init(139, 90, 'element.attr(attName) !== normalizeProperty(attName, attributes[attName])');
function visit1028_1215_4(result) {
  _$jscoverage['/editor/styles.js'].branchData['1215'][4].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1215'][3].init(83, 19, 'attName === \'class\'');
function visit1027_1215_3(result) {
  _$jscoverage['/editor/styles.js'].branchData['1215'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1215'][2].init(83, 51, 'attName === \'class\' || style._.definition.fullMatch');
function visit1026_1215_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['1215'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1215'][1].init(83, 146, '(attName === \'class\' || style._.definition.fullMatch) && element.attr(attName) !== normalizeProperty(attName, attributes[attName])');
function visit1025_1215_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1215'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1208'][1].init(458, 77, 'util.isEmptyObject(attributes) && util.isEmptyObject(styles)');
function visit1024_1208_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1208'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1206'][2].init(73, 20, 'overrides[\'*\'] || {}');
function visit1023_1206_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['1206'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1206'][1].init(40, 53, 'overrides[element.nodeName()] || overrides[\'*\'] || {}');
function visit1022_1206_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1206'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1204'][2].init(77, 20, 'overrides[\'*\'] || {}');
function visit1021_1204_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['1204'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1204'][1].init(44, 53, 'overrides[element.nodeName()] || overrides[\'*\'] || {}');
function visit1020_1204_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1204'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1185'][1].init(44, 23, 'overrideEl.styles || []');
function visit1019_1185_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1185'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1180'][1].init(1685, 6, 'styles');
function visit1018_1180_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1180'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1171'][1].init(48, 27, 'overrideEl.attributes || []');
function visit1017_1171_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1171'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1166'][1].init(958, 5, 'attrs');
function visit1016_1166_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1166'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1163'][1].init(857, 76, 'overrides[elementName] || (overrides[elementName] = {})');
function visit1015_1163_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1163'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1150'][1].init(236, 28, 'typeof override === \'string\'');
function visit1014_1150_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1150'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1143'][1].init(347, 21, 'i < definition.length');
function visit1013_1143_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1143'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1138'][1].init(173, 25, '!util.isArray(definition)');
function visit1012_1138_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1138'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1135'][1].init(209, 10, 'definition');
function visit1011_1135_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1135'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1128'][1].init(14, 17, 'style._.overrides');
function visit1010_1128_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1128'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1107'][1].init(18, 14, '!attribs.style');
function visit1009_1107_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1107'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1106'][1].init(646, 9, 'styleText');
function visit1008_1106_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1106'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1095'][1].init(339, 12, 'styleAttribs');
function visit1007_1095_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1095'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1086'][1].init(118, 7, 'attribs');
function visit1006_1086_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1086'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1066'][1].init(326, 24, 'temp.style.cssText || \'\'');
function visit1005_1066_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1066'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1060'][1].init(43, 25, 'nativeNormalize !== FALSE');
function visit1004_1060_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1060'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1050'][3].init(29, 26, 'target[name] === \'inherit\'');
function visit1003_1050_3(result) {
  _$jscoverage['/editor/styles.js'].branchData['1050'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1050'][2].init(91, 26, 'source[name] === \'inherit\'');
function visit1002_1050_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['1050'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1050'][1].init(53, 56, 'source[name] === \'inherit\' || target[name] === \'inherit\'');
function visit1001_1050_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1050'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1049'][2].init(35, 29, 'target[name] === source[name]');
function visit1000_1049_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['1049'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1049'][1].init(35, 110, 'target[name] === source[name] || source[name] === \'inherit\' || target[name] === \'inherit\'');
function visit999_1049_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1049'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1048'][2].init(125, 147, 'name in target && (target[name] === source[name] || source[name] === \'inherit\' || target[name] === \'inherit\')');
function visit998_1048_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['1048'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1048'][1].init(123, 150, '!(name in target && (target[name] === source[name] || source[name] === \'inherit\' || target[name] === \'inherit\'))');
function visit997_1048_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1048'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1041'][1].init(114, 26, 'typeof target === \'string\'');
function visit996_1041_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1041'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1038'][1].init(14, 26, 'typeof source === \'string\'');
function visit995_1038_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1038'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1013'][2].init(895, 50, 'nextNode[0].nodeType === Dom.NodeType.ELEMENT_NODE');
function visit994_1013_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['1013'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1013'][1].init(895, 107, 'nextNode[0].nodeType === Dom.NodeType.ELEMENT_NODE && nextNode.contains(startNode)');
function visit993_1013_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1013'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1003'][1].init(61, 51, 'overrides[currentNode.nodeName()] || overrides[\'*\']');
function visit992_1003_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1003'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['998'][1].init(99, 39, 'currentNode.nodeName() === this.element');
function visit991_998_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['998'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['995'][2].init(312, 53, 'currentNode[0].nodeType === Dom.NodeType.ELEMENT_NODE');
function visit990_995_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['995'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['995'][1].init(38, 117, 'currentNode[0].nodeType === Dom.NodeType.ELEMENT_NODE && this.checkElementRemovable(currentNode)');
function visit989_995_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['995'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['994'][1].init(271, 156, 'currentNode[0] && currentNode[0].nodeType === Dom.NodeType.ELEMENT_NODE && this.checkElementRemovable(currentNode)');
function visit988_994_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['994'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['988'][1].init(1986, 29, 'currentNode[0] !== endNode[0]');
function visit987_988_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['988'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['979'][1].init(1269, 10, 'breakStart');
function visit986_979_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['979'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['976'][1].init(1162, 8, 'breakEnd');
function visit985_976_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['976'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['971'][1].init(250, 35, 'self.checkElementRemovable(element)');
function visit984_971_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['971'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['967'][1].init(53, 30, 'element === endPath.blockLimit');
function visit983_967_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['967'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['966'][2].init(80, 25, 'element === endPath.block');
function visit982_966_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['966'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['966'][1].init(80, 84, 'element === endPath.block || element === endPath.blockLimit');
function visit981_966_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['966'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['963'][1].init(728, 27, 'i < endPath.elements.length');
function visit980_963_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['963'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['959'][1].init(256, 35, 'self.checkElementRemovable(element)');
function visit979_959_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['959'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['955'][1].init(55, 32, 'element === startPath.blockLimit');
function visit978_955_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['955'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['954'][2].init(82, 27, 'element === startPath.block');
function visit977_954_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['954'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['954'][1].init(82, 88, 'element === startPath.block || element === startPath.blockLimit');
function visit976_954_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['954'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['951'][1].init(278, 29, 'i < startPath.elements.length');
function visit975_951_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['951'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['928'][1].init(1224, 9, 'UA.webkit');
function visit974_928_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['928'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['926'][1].init(65, 16, 'tmp === \'\\u200b\'');
function visit973_926_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['926'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['924'][1].init(1062, 82, '!tmp || tmp === \'\\u200b\'');
function visit972_924_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['924'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['919'][1].init(13, 33, 'boundaryElement.match === \'start\'');
function visit971_919_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['919'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['907'][1].init(190, 16, 'newElement.match');
function visit970_907_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['907'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['905'][1].init(87, 34, 'newElement.equals(boundaryElement)');
function visit969_905_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['905'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['901'][1].init(2621, 15, 'boundaryElement');
function visit968_901_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['901'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['889'][1].init(61, 49, '_overrides[element.nodeName()] || _overrides[\'*\']');
function visit967_889_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['889'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['886'][1].init(655, 35, 'element.nodeName() !== this.element');
function visit966_886_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['886'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['872'][1].init(252, 30, 'startOfElement || endOfElement');
function visit965_872_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['872'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['870'][1].init(108, 94, '!endOfElement && range.checkBoundaryOfElement(element, KER.START)');
function visit964_870_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['870'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['868'][1].init(551, 35, 'this.checkElementRemovable(element)');
function visit963_868_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['868'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['865'][3].init(447, 32, 'element === startPath.blockLimit');
function visit962_865_3(result) {
  _$jscoverage['/editor/styles.js'].branchData['865'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['865'][2].init(416, 27, 'element === startPath.block');
function visit961_865_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['865'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['865'][1].init(416, 63, 'element === startPath.block || element === startPath.blockLimit');
function visit960_865_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['865'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['857'][2].init(223, 29, 'i < startPath.elements.length');
function visit959_857_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['857'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['857'][1].init(223, 66, 'i < startPath.elements.length && (element = startPath.elements[i])');
function visit958_857_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['857'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['852'][1].init(314, 15, 'range.collapsed');
function visit957_852_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['852'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['807'][1].init(1184, 6, '!UA.ie');
function visit956_807_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['807'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['786'][1].init(2691, 9, 'styleNode');
function visit955_786_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['786'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['777'][1].init(1523, 29, '!styleNode._4eHasAttributes()');
function visit954_777_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['777'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['768'][1].init(222, 36, 'styleNode.style(styleName) === value');
function visit953_768_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['768'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['764'][1].init(36, 73, 'removeList.blockedStyles[styleName] || !(value = parent.style(styleName))');
function visit952_764_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['764'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['750'][1].init(218, 33, 'styleNode.attr(attName) === value');
function visit951_750_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['750'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['746'][1].init(36, 69, 'removeList.blockedAttrs[attName] || !(value = parent.attr(styleName))');
function visit950_746_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['746'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['743'][1].init(26, 33, 'parent.nodeName() === elementName');
function visit949_743_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['743'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['742'][3].init(821, 25, 'styleNode[0] && parent[0]');
function visit948_742_3(result) {
  _$jscoverage['/editor/styles.js'].branchData['742'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['742'][2].init(811, 35, 'parent && styleNode[0] && parent[0]');
function visit947_742_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['742'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['742'][1].init(798, 48, 'styleNode && parent && styleNode[0] && parent[0]');
function visit946_742_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['742'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['723'][2].init(6153, 35, 'styleRange && !styleRange.collapsed');
function visit945_723_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['723'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['723'][1].init(6139, 49, 'applyStyle && styleRange && !styleRange.collapsed');
function visit944_723_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['723'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['704'][1].init(375, 43, '!def.childRule || def.childRule(parentNode)');
function visit943_704_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['704'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['699'][2].init(1129, 371, '(parentNode._4ePosition(firstNode) | KEP.POSITION_FOLLOWING | KEP.POSITION_IDENTICAL | KEP.POSITION_IS_CONTAINED) === (KEP.POSITION_FOLLOWING + KEP.POSITION_IDENTICAL + KEP.POSITION_IS_CONTAINED)');
function visit942_699_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['699'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['699'][1].init(140, 420, '(parentNode._4ePosition(firstNode) | KEP.POSITION_FOLLOWING | KEP.POSITION_IDENTICAL | KEP.POSITION_IS_CONTAINED) === (KEP.POSITION_FOLLOWING + KEP.POSITION_IDENTICAL + KEP.POSITION_IS_CONTAINED) && (!def.childRule || def.childRule(parentNode))');
function visit941_699_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['699'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['697'][2].init(987, 102, '(parentNode = includedNode.parent()) && dtd[parentNode.nodeName()]');
function visit940_697_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['697'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['697'][1].init(86, 561, '((parentNode = includedNode.parent()) && dtd[parentNode.nodeName()]) && (parentNode._4ePosition(firstNode) | KEP.POSITION_FOLLOWING | KEP.POSITION_IDENTICAL | KEP.POSITION_IS_CONTAINED) === (KEP.POSITION_FOLLOWING + KEP.POSITION_IDENTICAL + KEP.POSITION_IS_CONTAINED) && (!def.childRule || def.childRule(parentNode))');
function visit939_697_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['697'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['696'][1].init(41, 648, '(applyStyle = !includedNode.next(notBookmark, 1)) && ((parentNode = includedNode.parent()) && dtd[parentNode.nodeName()]) && (parentNode._4ePosition(firstNode) | KEP.POSITION_FOLLOWING | KEP.POSITION_IDENTICAL | KEP.POSITION_IS_CONTAINED) === (KEP.POSITION_FOLLOWING + KEP.POSITION_IDENTICAL + KEP.POSITION_IS_CONTAINED) && (!def.childRule || def.childRule(parentNode))');
function visit938_696_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['696'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['681'][2].init(68, 38, 'nodeType === Dom.NodeType.ELEMENT_NODE');
function visit937_681_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['681'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['681'][1].init(68, 75, 'nodeType === Dom.NodeType.ELEMENT_NODE && !currentNode[0].childNodes.length');
function visit936_681_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['681'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['680'][2].init(1374, 35, 'nodeType === Dom.NodeType.TEXT_NODE');
function visit935_680_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['680'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['680'][1].init(1374, 145, 'nodeType === Dom.NodeType.TEXT_NODE || (nodeType === Dom.NodeType.ELEMENT_NODE && !currentNode[0].childNodes.length)');
function visit934_680_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['680'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['666'][3].init(89, 410, '(currentNode._4ePosition(lastNode) | (KEP.POSITION_PRECEDING | KEP.POSITION_IDENTICAL | KEP.POSITION_IS_CONTAINED)) === (KEP.POSITION_PRECEDING + KEP.POSITION_IDENTICAL + KEP.POSITION_IS_CONTAINED)');
function visit933_666_3(result) {
  _$jscoverage['/editor/styles.js'].branchData['666'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['666'][2].init(57, 442, '!DTD.$removeEmpty[nodeName] || (currentNode._4ePosition(lastNode) | (KEP.POSITION_PRECEDING | KEP.POSITION_IDENTICAL | KEP.POSITION_IS_CONTAINED)) === (KEP.POSITION_PRECEDING + KEP.POSITION_IDENTICAL + KEP.POSITION_IS_CONTAINED)');
function visit932_666_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['666'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['666'][1].init(44, 455, '!nodeName || !DTD.$removeEmpty[nodeName] || (currentNode._4ePosition(lastNode) | (KEP.POSITION_PRECEDING | KEP.POSITION_IDENTICAL | KEP.POSITION_IS_CONTAINED)) === (KEP.POSITION_PRECEDING + KEP.POSITION_IDENTICAL + KEP.POSITION_IS_CONTAINED)');
function visit931_666_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['666'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['665'][1].init(512, 535, '!styleRange && (!nodeName || !DTD.$removeEmpty[nodeName] || (currentNode._4ePosition(lastNode) | (KEP.POSITION_PRECEDING | KEP.POSITION_IDENTICAL | KEP.POSITION_IS_CONTAINED)) === (KEP.POSITION_PRECEDING + KEP.POSITION_IDENTICAL + KEP.POSITION_IS_CONTAINED))');
function visit930_665_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['665'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['658'][1].init(130, 48, '!def.parentRule || def.parentRule(currentParent)');
function visit929_658_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['658'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['656'][4].init(-1, 66, 'DTD[currentParent.nodeName()] || DTD.span');
function visit928_656_4(result) {
  _$jscoverage['/editor/styles.js'].branchData['656'][4].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['657'][1].init(-1, 125, '(DTD[currentParent.nodeName()] || DTD.span)[elementName] || isUnknownElement');
function visit927_657_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['657'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['656'][3].init(1120, 180, '((DTD[currentParent.nodeName()] || DTD.span)[elementName] || isUnknownElement) && (!def.parentRule || def.parentRule(currentParent))');
function visit926_656_3(result) {
  _$jscoverage['/editor/styles.js'].branchData['656'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['656'][2].init(1098, 202, 'currentParent[0] && ((DTD[currentParent.nodeName()] || DTD.span)[elementName] || isUnknownElement) && (!def.parentRule || def.parentRule(currentParent))');
function visit925_656_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['656'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['656'][1].init(1081, 219, 'currentParent && currentParent[0] && ((DTD[currentParent.nodeName()] || DTD.span)[elementName] || isUnknownElement) && (!def.parentRule || def.parentRule(currentParent))');
function visit924_656_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['656'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['651'][1].init(47, 40, 'currentParent.nodeName() === elementName');
function visit923_651_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['651'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['650'][2].init(661, 19, 'elementName === \'a\'');
function visit922_650_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['650'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['650'][1].init(41, 88, 'elementName === \'a\' && currentParent.nodeName() === elementName');
function visit921_650_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['650'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['649'][1].init(617, 130, 'currentParent && elementName === \'a\' && currentParent.nodeName() === elementName');
function visit920_649_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['649'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['637'][1].init(346, 44, '!def.childRule || def.childRule(currentNode)');
function visit919_637_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['637'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['631'][2].init(76, 321, '(currentNode._4ePosition(lastNode) | (KEP.POSITION_PRECEDING | KEP.POSITION_IDENTICAL | KEP.POSITION_IS_CONTAINED)) === (KEP.POSITION_PRECEDING + KEP.POSITION_IDENTICAL + KEP.POSITION_IS_CONTAINED)');
function visit918_631_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['631'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['631'][1].init(38, 392, '(currentNode._4ePosition(lastNode) | (KEP.POSITION_PRECEDING | KEP.POSITION_IDENTICAL | KEP.POSITION_IS_CONTAINED)) === (KEP.POSITION_PRECEDING + KEP.POSITION_IDENTICAL + KEP.POSITION_IS_CONTAINED) && (!def.childRule || def.childRule(currentNode))');
function visit917_631_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['631'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['630'][1].init(-1, 431, 'dtd[nodeName] && (currentNode._4ePosition(lastNode) | (KEP.POSITION_PRECEDING | KEP.POSITION_IDENTICAL | KEP.POSITION_IS_CONTAINED)) === (KEP.POSITION_PRECEDING + KEP.POSITION_IDENTICAL + KEP.POSITION_IS_CONTAINED) && (!def.childRule || def.childRule(currentNode))');
function visit916_630_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['630'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['629'][1].init(486, 490, '!nodeName || (dtd[nodeName] && (currentNode._4ePosition(lastNode) | (KEP.POSITION_PRECEDING | KEP.POSITION_IDENTICAL | KEP.POSITION_IS_CONTAINED)) === (KEP.POSITION_PRECEDING + KEP.POSITION_IDENTICAL + KEP.POSITION_IS_CONTAINED) && (!def.childRule || def.childRule(currentNode)))');
function visit915_629_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['629'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['623'][1].init(210, 44, 'nodeName && currentNode.attr(\'_ke_bookmark\')');
function visit914_623_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['623'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['620'][1].init(71, 38, 'nodeType === Dom.NodeType.ELEMENT_NODE');
function visit913_620_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['620'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['615'][1].init(57, 33, 'Dom.equals(currentNode, lastNode)');
function visit912_615_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['615'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['612'][1].init(1420, 29, 'currentNode && currentNode[0]');
function visit911_612_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['612'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['592'][1].init(774, 4, '!dtd');
function visit910_592_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['592'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['578'][1].init(82, 15, 'range.collapsed');
function visit909_578_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['578'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['552'][1].init(136, 7, '!offset');
function visit908_552_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['552'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['550'][1].init(22, 18, 'match.length === 1');
function visit907_550_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['550'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['539'][1].init(101, 19, 'i < preHTMLs.length');
function visit906_539_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['539'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['527'][1].init(821, 5, 'UA.ie');
function visit905_527_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['527'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['512'][1].init(96, 34, 'previousBlock.nodeName() === \'pre\'');
function visit904_512_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['512'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['511'][2].init(45, 131, '(previousBlock = preBlock._4ePreviousSourceNode(TRUE, Dom.NodeType.ELEMENT_NODE)) && previousBlock.nodeName() === \'pre\'');
function visit903_511_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['511'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['511'][1].init(42, 135, '!((previousBlock = preBlock._4ePreviousSourceNode(TRUE, Dom.NodeType.ELEMENT_NODE)) && previousBlock.nodeName() === \'pre\')');
function visit902_511_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['511'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['502'][1].init(621, 13, 'newBlockIsPre');
function visit901_502_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['502'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['494'][1].init(318, 9, 'isFromPre');
function visit900_494_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['494'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['492'][1].init(238, 7, 'isToPre');
function visit899_492_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['492'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['490'][1].init(182, 28, '!newBlockIsPre && blockIsPre');
function visit898_490_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['490'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['489'][1].init(127, 28, 'newBlockIsPre && !blockIsPre');
function visit897_489_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['489'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['488'][1].init(76, 26, 'block.nodeName === (\'pre\')');
function visit896_488_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['488'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['487'][1].init(30, 29, 'newBlock.nodeName === (\'pre\')');
function visit895_487_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['487'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['450'][1].init(957, 5, 'UA.ie');
function visit894_450_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['450'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['421'][1].init(108, 2, 'm2');
function visit893_421_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['421'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['418'][1].init(22, 2, 'm1');
function visit892_418_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['418'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['384'][1].init(376, 6, 'styles');
function visit891_384_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['384'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['376'][1].init(189, 10, 'attributes');
function visit890_376_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['376'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['363'][1].init(450, 7, 'element');
function visit889_363_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['363'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['355'][1].init(186, 19, 'elementName === \'*\'');
function visit888_355_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['355'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['338'][1].init(1102, 17, 'stylesText.length');
function visit887_338_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['338'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['328'][1].init(247, 22, 'styleVal === \'inherit\'');
function visit886_328_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['328'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['318'][1].init(408, 17, 'stylesText.length');
function visit885_318_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['318'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['315'][2].init(285, 62, 'styleDefinition.attributes && styleDefinition.attributes.style');
function visit884_315_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['315'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['315'][1].init(285, 69, '(styleDefinition.attributes && styleDefinition.attributes.style) || \'\'');
function visit883_315_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['315'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['308'][1].init(120, 9, 'stylesDef');
function visit882_308_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['308'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['295'][1].init(507, 41, 'this.checkElementRemovable(element, TRUE)');
function visit881_295_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['295'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['291'][2].init(332, 31, 'this.type === KEST.STYLE_OBJECT');
function visit880_291_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['291'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['291'][1].init(332, 74, 'this.type === KEST.STYLE_OBJECT && !(element.nodeName() in objectElements)');
function visit879_291_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['291'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['286'][3].init(116, 114, 'Dom.equals(element, elementPath.block) || Dom.equals(element, elementPath.blockLimit)');
function visit878_286_3(result) {
  _$jscoverage['/editor/styles.js'].branchData['286'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['286'][2].init(80, 31, 'this.type === KEST.STYLE_INLINE');
function visit877_286_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['286'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['286'][1].init(80, 151, 'this.type === KEST.STYLE_INLINE && (Dom.equals(element, elementPath.block) || Dom.equals(element, elementPath.blockLimit))');
function visit876_286_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['286'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['283'][1].init(132, 19, 'i < elements.length');
function visit875_283_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['283'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['276'][1].init(78, 43, 'elementPath.block || elementPath.blockLimit');
function visit874_276_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['276'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['259'][1].init(102, 52, 'styleValue.test && styleValue.test(actualStyleValue)');
function visit873_259_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['259'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['258'][6].init(152, 31, 'actualStyleValue === styleValue');
function visit872_258_6(result) {
  _$jscoverage['/editor/styles.js'].branchData['258'][6].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['258'][5].init(118, 30, 'typeof styleValue === \'string\'');
function visit871_258_5(result) {
  _$jscoverage['/editor/styles.js'].branchData['258'][5].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['258'][4].init(118, 65, 'typeof styleValue === \'string\' && actualStyleValue === styleValue');
function visit870_258_4(result) {
  _$jscoverage['/editor/styles.js'].branchData['258'][4].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['258'][3].init(118, 155, '(typeof styleValue === \'string\' && actualStyleValue === styleValue) || styleValue.test && styleValue.test(actualStyleValue)');
function visit869_258_3(result) {
  _$jscoverage['/editor/styles.js'].branchData['258'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['258'][2].init(94, 19, 'styleValue === NULL');
function visit868_258_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['258'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['258'][1].init(94, 179, 'styleValue === NULL || (typeof styleValue === \'string\' && actualStyleValue === styleValue) || styleValue.test && styleValue.test(actualStyleValue)');
function visit867_258_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['258'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['256'][1].init(157, 16, 'actualStyleValue');
function visit866_256_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['256'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['253'][1].init(34, 17, 'i < styles.length');
function visit865_253_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['253'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['252'][1].init(1388, 6, 'styles');
function visit864_252_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['252'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['246'][1].init(97, 47, 'attValue.test && attValue.test(actualAttrValue)');
function visit863_246_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['246'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['245'][4].init(629, 28, 'actualAttrValue === attValue');
function visit862_245_4(result) {
  _$jscoverage['/editor/styles.js'].branchData['245'][4].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['245'][3].init(597, 28, 'typeof attValue === \'string\'');
function visit861_245_3(result) {
  _$jscoverage['/editor/styles.js'].branchData['245'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['245'][2].init(597, 60, 'typeof attValue === \'string\' && actualAttrValue === attValue');
function visit860_245_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['245'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['245'][1].init(54, 145, '(typeof attValue === \'string\' && actualAttrValue === attValue) || attValue.test && attValue.test(actualAttrValue)');
function visit859_245_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['245'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['244'][2].init(540, 17, 'attValue === NULL');
function visit858_244_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['244'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['244'][1].init(540, 200, 'attValue === NULL || (typeof attValue === \'string\' && actualAttrValue === attValue) || attValue.test && attValue.test(actualAttrValue)');
function visit857_244_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['244'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['236'][1].init(150, 15, 'actualAttrValue');
function visit856_236_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['236'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['233'][1].init(34, 18, 'i < attribs.length');
function visit855_233_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['233'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['232'][1].init(239, 7, 'attribs');
function visit854_232_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['232'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['229'][1].init(98, 63, '!(attribs = override.attributes) && !(styles = override.styles)');
function visit853_229_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['229'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['227'][1].init(1777, 8, 'override');
function visit852_227_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['227'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['225'][1].init(83, 47, 'overrides[element.nodeName()] || overrides[\'*\']');
function visit851_225_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['225'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['214'][1].init(789, 9, 'fullMatch');
function visit850_214_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['214'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['209'][1].init(609, 9, 'fullMatch');
function visit849_209_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['209'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['206'][1].init(34, 10, '!fullMatch');
function visit848_206_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['206'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['205'][1].init(185, 32, 'attribs[attName] === elementAttr');
function visit847_205_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['205'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['202'][2].init(226, 19, 'attName === \'style\'');
function visit846_202_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['202'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['202'][1].init(226, 218, 'attName === \'style\' ? compareCssText(attribs[attName], normalizeCssText(elementAttr, FALSE)) : attribs[attName] === elementAttr');
function visit845_202_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['202'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['201'][1].init(168, 27, 'element.attr(attName) || \'\'');
function visit844_201_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['201'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['197'][1].init(32, 21, 'attName === \'_length\'');
function visit843_197_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['197'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['194'][1].init(270, 15, 'attribs._length');
function visit842_194_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['194'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['188'][1].init(87, 41, '!fullMatch && !element._4eHasAttributes()');
function visit841_188_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['188'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['186'][1].init(264, 35, 'element.nodeName() === this.element');
function visit840_186_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['186'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['178'][1].init(18, 8, '!element');
function visit839_178_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['178'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['170'][1].init(43, 31, 'self.type === KEST.STYLE_INLINE');
function visit838_170_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['170'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['160'][1].init(84, 31, 'self.type === KEST.STYLE_OBJECT');
function visit837_160_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['160'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['158'][1].init(86, 30, 'self.type === KEST.STYLE_BLOCK');
function visit836_158_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['158'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['156'][1].init(40, 31, 'this.type === KEST.STYLE_INLINE');
function visit835_156_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['156'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['135'][1].init(458, 17, 'i < ranges.length');
function visit834_135_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['135'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['114'][2].init(308, 19, 'element === \'#text\'');
function visit833_114_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['114'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['114'][1].init(308, 45, 'element === \'#text\' || blockElements[element]');
function visit832_114_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['114'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['112'][1].init(225, 30, 'styleDefinition.element || \'*\'');
function visit831_112_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['112'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['107'][1].init(14, 15, 'variablesValues');
function visit830_107_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['107'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['89'][1].init(18, 32, 'typeof (list[item]) === \'string\'');
function visit829_89_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['89'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].lineData[10]++;
KISSY.add(function(S, require) {
  _$jscoverage['/editor/styles.js'].functionData[0]++;
  _$jscoverage['/editor/styles.js'].lineData[11]++;
  var util = require('util');
  _$jscoverage['/editor/styles.js'].lineData[12]++;
  var Node = require('node');
  _$jscoverage['/editor/styles.js'].lineData[13]++;
  var KESelection = require('./selection');
  _$jscoverage['/editor/styles.js'].lineData[14]++;
  var KERange = require('./range');
  _$jscoverage['/editor/styles.js'].lineData[15]++;
  var Editor = require('./base');
  _$jscoverage['/editor/styles.js'].lineData[16]++;
  var ElementPath = require('./element-path');
  _$jscoverage['/editor/styles.js'].lineData[18]++;
  var TRUE = true, FALSE = false, NULL = null, $ = Node.all, Dom = require('dom'), KER = Editor.RangeType, KEP = Editor.PositionType, KEST, UA = require('ua'), blockElements = {
  address: 1, 
  div: 1, 
  h1: 1, 
  h2: 1, 
  h3: 1, 
  h4: 1, 
  h5: 1, 
  h6: 1, 
  p: 1, 
  pre: 1}, DTD = Editor.XHTML_DTD, objectElements = {
  embed: 1, 
  hr: 1, 
  img: 1, 
  li: 1, 
  object: 1, 
  ol: 1, 
  table: 1, 
  td: 1, 
  tr: 1, 
  th: 1, 
  ul: 1, 
  dl: 1, 
  dt: 1, 
  dd: 1, 
  form: 1}, semicolonFixRegex = /\s*(?:;\s*|$)/g, varRegex = /#\((.+?)\)/g;
  _$jscoverage['/editor/styles.js'].lineData[66]++;
  Editor.StyleType = KEST = {
  STYLE_BLOCK: 1, 
  STYLE_INLINE: 2, 
  STYLE_OBJECT: 3};
  _$jscoverage['/editor/styles.js'].lineData[81]++;
  function notBookmark(node) {
    _$jscoverage['/editor/styles.js'].functionData[1]++;
    _$jscoverage['/editor/styles.js'].lineData[84]++;
    return !Dom.attr(node, '_ke_bookmark');
  }
  _$jscoverage['/editor/styles.js'].lineData[87]++;
  function replaceVariables(list, variablesValues) {
    _$jscoverage['/editor/styles.js'].functionData[2]++;
    _$jscoverage['/editor/styles.js'].lineData[88]++;
    for (var item in list) {
      _$jscoverage['/editor/styles.js'].lineData[89]++;
      if (visit829_89_1(typeof (list[item]) === 'string')) {
        _$jscoverage['/editor/styles.js'].lineData[91]++;
        list[item] = list[item].replace(varRegex, function(match, varName) {
  _$jscoverage['/editor/styles.js'].functionData[3]++;
  _$jscoverage['/editor/styles.js'].lineData[92]++;
  return variablesValues[varName];
});
      } else {
        _$jscoverage['/editor/styles.js'].lineData[95]++;
        replaceVariables(list[item], variablesValues);
      }
    }
  }
  _$jscoverage['/editor/styles.js'].lineData[106]++;
  function KEStyle(styleDefinition, variablesValues) {
    _$jscoverage['/editor/styles.js'].functionData[4]++;
    _$jscoverage['/editor/styles.js'].lineData[107]++;
    if (visit830_107_1(variablesValues)) {
      _$jscoverage['/editor/styles.js'].lineData[108]++;
      styleDefinition = util.clone(styleDefinition);
      _$jscoverage['/editor/styles.js'].lineData[109]++;
      replaceVariables(styleDefinition, variablesValues);
    }
    _$jscoverage['/editor/styles.js'].lineData[112]++;
    var element = this.element = this.element = (visit831_112_1(styleDefinition.element || '*')).toLowerCase();
    _$jscoverage['/editor/styles.js'].lineData[114]++;
    this.type = this.type = (visit832_114_1(visit833_114_2(element === '#text') || blockElements[element])) ? KEST.STYLE_BLOCK : objectElements[element] ? KEST.STYLE_OBJECT : KEST.STYLE_INLINE;
    _$jscoverage['/editor/styles.js'].lineData[119]++;
    this._ = {
  definition: styleDefinition};
  }
  _$jscoverage['/editor/styles.js'].lineData[124]++;
  function applyStyle(document, remove) {
    _$jscoverage['/editor/styles.js'].functionData[5]++;
    _$jscoverage['/editor/styles.js'].lineData[126]++;
    var self = this, func = remove ? self.removeFromRange : self.applyToRange;
    _$jscoverage['/editor/styles.js'].lineData[130]++;
    document.body.focus();
    _$jscoverage['/editor/styles.js'].lineData[132]++;
    var selection = new KESelection(document);
    _$jscoverage['/editor/styles.js'].lineData[134]++;
    var ranges = selection.getRanges();
    _$jscoverage['/editor/styles.js'].lineData[135]++;
    for (var i = 0; visit834_135_1(i < ranges.length); i++) {
      _$jscoverage['/editor/styles.js'].lineData[137]++;
      func.call(self, ranges[i]);
    }
    _$jscoverage['/editor/styles.js'].lineData[139]++;
    selection.selectRanges(ranges);
  }
  _$jscoverage['/editor/styles.js'].lineData[142]++;
  KEStyle.prototype = {
  constructor: KEStyle, 
  apply: function(document) {
  _$jscoverage['/editor/styles.js'].functionData[6]++;
  _$jscoverage['/editor/styles.js'].lineData[146]++;
  applyStyle.call(this, document, FALSE);
}, 
  remove: function(document) {
  _$jscoverage['/editor/styles.js'].functionData[7]++;
  _$jscoverage['/editor/styles.js'].lineData[150]++;
  applyStyle.call(this, document, TRUE);
}, 
  applyToRange: function(range) {
  _$jscoverage['/editor/styles.js'].functionData[8]++;
  _$jscoverage['/editor/styles.js'].lineData[154]++;
  var self = this;
  _$jscoverage['/editor/styles.js'].lineData[155]++;
  return (self.applyToRange = visit835_156_1(this.type === KEST.STYLE_INLINE) ? applyInlineStyle : visit836_158_1(self.type === KEST.STYLE_BLOCK) ? applyBlockStyle : visit837_160_1(self.type === KEST.STYLE_OBJECT) ? NULL : NULL).call(self, range);
}, 
  removeFromRange: function(range) {
  _$jscoverage['/editor/styles.js'].functionData[9]++;
  _$jscoverage['/editor/styles.js'].lineData[168]++;
  var self = this;
  _$jscoverage['/editor/styles.js'].lineData[169]++;
  return (self.removeFromRange = visit838_170_1(self.type === KEST.STYLE_INLINE) ? removeInlineStyle : NULL).call(self, range);
}, 
  checkElementRemovable: function(element, fullMatch) {
  _$jscoverage['/editor/styles.js'].functionData[10]++;
  _$jscoverage['/editor/styles.js'].lineData[178]++;
  if (visit839_178_1(!element)) {
    _$jscoverage['/editor/styles.js'].lineData[179]++;
    return FALSE;
  }
  _$jscoverage['/editor/styles.js'].lineData[181]++;
  var attName;
  _$jscoverage['/editor/styles.js'].lineData[182]++;
  var def = this._.definition, attribs, styles;
  _$jscoverage['/editor/styles.js'].lineData[186]++;
  if (visit840_186_1(element.nodeName() === this.element)) {
    _$jscoverage['/editor/styles.js'].lineData[188]++;
    if (visit841_188_1(!fullMatch && !element._4eHasAttributes())) {
      _$jscoverage['/editor/styles.js'].lineData[189]++;
      return TRUE;
    }
    _$jscoverage['/editor/styles.js'].lineData[192]++;
    attribs = getAttributesForComparison(def);
    _$jscoverage['/editor/styles.js'].lineData[194]++;
    if (visit842_194_1(attribs._length)) {
      _$jscoverage['/editor/styles.js'].lineData[195]++;
      for (attName in attribs) {
        _$jscoverage['/editor/styles.js'].lineData[197]++;
        if (visit843_197_1(attName === '_length')) {
          _$jscoverage['/editor/styles.js'].lineData[198]++;
          continue;
        }
        _$jscoverage['/editor/styles.js'].lineData[201]++;
        var elementAttr = visit844_201_1(element.attr(attName) || '');
        _$jscoverage['/editor/styles.js'].lineData[202]++;
        if (visit845_202_1(visit846_202_2(attName === 'style') ? compareCssText(attribs[attName], normalizeCssText(elementAttr, FALSE)) : visit847_205_1(attribs[attName] === elementAttr))) {
          _$jscoverage['/editor/styles.js'].lineData[206]++;
          if (visit848_206_1(!fullMatch)) {
            _$jscoverage['/editor/styles.js'].lineData[207]++;
            return TRUE;
          }
        } else {
          _$jscoverage['/editor/styles.js'].lineData[209]++;
          if (visit849_209_1(fullMatch)) {
            _$jscoverage['/editor/styles.js'].lineData[210]++;
            return FALSE;
          }
        }
      }
      _$jscoverage['/editor/styles.js'].lineData[214]++;
      if (visit850_214_1(fullMatch)) {
        _$jscoverage['/editor/styles.js'].lineData[215]++;
        return TRUE;
      }
    } else {
      _$jscoverage['/editor/styles.js'].lineData[218]++;
      return TRUE;
    }
  }
  _$jscoverage['/editor/styles.js'].lineData[223]++;
  var overrides = getOverrides(this), i, override = visit851_225_1(overrides[element.nodeName()] || overrides['*']);
  _$jscoverage['/editor/styles.js'].lineData[227]++;
  if (visit852_227_1(override)) {
    _$jscoverage['/editor/styles.js'].lineData[229]++;
    if (visit853_229_1(!(attribs = override.attributes) && !(styles = override.styles))) {
      _$jscoverage['/editor/styles.js'].lineData[230]++;
      return TRUE;
    }
    _$jscoverage['/editor/styles.js'].lineData[232]++;
    if (visit854_232_1(attribs)) {
      _$jscoverage['/editor/styles.js'].lineData[233]++;
      for (i = 0; visit855_233_1(i < attribs.length); i++) {
        _$jscoverage['/editor/styles.js'].lineData[234]++;
        attName = attribs[i][0];
        _$jscoverage['/editor/styles.js'].lineData[235]++;
        var actualAttrValue = element.attr(attName);
        _$jscoverage['/editor/styles.js'].lineData[236]++;
        if (visit856_236_1(actualAttrValue)) {
          _$jscoverage['/editor/styles.js'].lineData[237]++;
          var attValue = attribs[i][1];
          _$jscoverage['/editor/styles.js'].lineData[244]++;
          if (visit857_244_1(visit858_244_2(attValue === NULL) || visit859_245_1((visit860_245_2(visit861_245_3(typeof attValue === 'string') && visit862_245_4(actualAttrValue === attValue))) || visit863_246_1(attValue.test && attValue.test(actualAttrValue))))) {
            _$jscoverage['/editor/styles.js'].lineData[247]++;
            return TRUE;
          }
        }
      }
    }
    _$jscoverage['/editor/styles.js'].lineData[252]++;
    if (visit864_252_1(styles)) {
      _$jscoverage['/editor/styles.js'].lineData[253]++;
      for (i = 0; visit865_253_1(i < styles.length); i++) {
        _$jscoverage['/editor/styles.js'].lineData[254]++;
        var styleName = styles[i][0];
        _$jscoverage['/editor/styles.js'].lineData[255]++;
        var actualStyleValue = element.css(styleName);
        _$jscoverage['/editor/styles.js'].lineData[256]++;
        if (visit866_256_1(actualStyleValue)) {
          _$jscoverage['/editor/styles.js'].lineData[257]++;
          var styleValue = styles[i][1];
          _$jscoverage['/editor/styles.js'].lineData[258]++;
          if (visit867_258_1(visit868_258_2(styleValue === NULL) || visit869_258_3((visit870_258_4(visit871_258_5(typeof styleValue === 'string') && visit872_258_6(actualStyleValue === styleValue))) || visit873_259_1(styleValue.test && styleValue.test(actualStyleValue))))) {
            _$jscoverage['/editor/styles.js'].lineData[260]++;
            return TRUE;
          }
        }
      }
    }
  }
  _$jscoverage['/editor/styles.js'].lineData[266]++;
  return FALSE;
}, 
  checkActive: function(elementPath) {
  _$jscoverage['/editor/styles.js'].functionData[11]++;
  _$jscoverage['/editor/styles.js'].lineData[274]++;
  switch (this.type) {
    case KEST.STYLE_BLOCK:
      _$jscoverage['/editor/styles.js'].lineData[276]++;
      return this.checkElementRemovable(visit874_276_1(elementPath.block || elementPath.blockLimit), TRUE);
    case KEST.STYLE_OBJECT:
    case KEST.STYLE_INLINE:
      _$jscoverage['/editor/styles.js'].lineData[281]++;
      var elements = elementPath.elements;
      _$jscoverage['/editor/styles.js'].lineData[283]++;
      for (var i = 0, element; visit875_283_1(i < elements.length); i++) {
        _$jscoverage['/editor/styles.js'].lineData[284]++;
        element = elements[i];
        _$jscoverage['/editor/styles.js'].lineData[286]++;
        if (visit876_286_1(visit877_286_2(this.type === KEST.STYLE_INLINE) && (visit878_286_3(Dom.equals(element, elementPath.block) || Dom.equals(element, elementPath.blockLimit))))) {
          _$jscoverage['/editor/styles.js'].lineData[288]++;
          continue;
        }
        _$jscoverage['/editor/styles.js'].lineData[291]++;
        if (visit879_291_1(visit880_291_2(this.type === KEST.STYLE_OBJECT) && !(element.nodeName() in objectElements))) {
          _$jscoverage['/editor/styles.js'].lineData[292]++;
          continue;
        }
        _$jscoverage['/editor/styles.js'].lineData[295]++;
        if (visit881_295_1(this.checkElementRemovable(element, TRUE))) {
          _$jscoverage['/editor/styles.js'].lineData[296]++;
          return TRUE;
        }
      }
  }
  _$jscoverage['/editor/styles.js'].lineData[300]++;
  return FALSE;
}};
  _$jscoverage['/editor/styles.js'].lineData[305]++;
  KEStyle.getStyleText = function(styleDefinition) {
  _$jscoverage['/editor/styles.js'].functionData[12]++;
  _$jscoverage['/editor/styles.js'].lineData[307]++;
  var stylesDef = styleDefinition._ST;
  _$jscoverage['/editor/styles.js'].lineData[308]++;
  if (visit882_308_1(stylesDef)) {
    _$jscoverage['/editor/styles.js'].lineData[309]++;
    return stylesDef;
  }
  _$jscoverage['/editor/styles.js'].lineData[312]++;
  stylesDef = styleDefinition.styles;
  _$jscoverage['/editor/styles.js'].lineData[315]++;
  var stylesText = visit883_315_1((visit884_315_2(styleDefinition.attributes && styleDefinition.attributes.style)) || ''), specialStylesText = '';
  _$jscoverage['/editor/styles.js'].lineData[318]++;
  if (visit885_318_1(stylesText.length)) {
    _$jscoverage['/editor/styles.js'].lineData[319]++;
    stylesText = stylesText.replace(semicolonFixRegex, ';');
  }
  _$jscoverage['/editor/styles.js'].lineData[322]++;
  for (var style in stylesDef) {
    _$jscoverage['/editor/styles.js'].lineData[324]++;
    var styleVal = stylesDef[style], text = (style + ':' + styleVal).replace(semicolonFixRegex, ';');
    _$jscoverage['/editor/styles.js'].lineData[328]++;
    if (visit886_328_1(styleVal === 'inherit')) {
      _$jscoverage['/editor/styles.js'].lineData[329]++;
      specialStylesText += text;
    } else {
      _$jscoverage['/editor/styles.js'].lineData[331]++;
      stylesText += text;
    }
  }
  _$jscoverage['/editor/styles.js'].lineData[338]++;
  if (visit887_338_1(stylesText.length)) {
    _$jscoverage['/editor/styles.js'].lineData[339]++;
    stylesText = normalizeCssText(stylesText);
  }
  _$jscoverage['/editor/styles.js'].lineData[342]++;
  stylesText += specialStylesText;
  _$jscoverage['/editor/styles.js'].lineData[345]++;
  styleDefinition._ST = stylesText;
  _$jscoverage['/editor/styles.js'].lineData[346]++;
  return stylesText;
};
  _$jscoverage['/editor/styles.js'].lineData[349]++;
  function getElement(style, targetDocument, element) {
    _$jscoverage['/editor/styles.js'].functionData[13]++;
    _$jscoverage['/editor/styles.js'].lineData[350]++;
    var el, elementName = style.element;
    _$jscoverage['/editor/styles.js'].lineData[355]++;
    if (visit888_355_1(elementName === '*')) {
      _$jscoverage['/editor/styles.js'].lineData[356]++;
      elementName = 'span';
    }
    _$jscoverage['/editor/styles.js'].lineData[360]++;
    el = new Node(targetDocument.createElement(elementName));
    _$jscoverage['/editor/styles.js'].lineData[363]++;
    if (visit889_363_1(element)) {
      _$jscoverage['/editor/styles.js'].lineData[364]++;
      element._4eCopyAttributes(el);
    }
    _$jscoverage['/editor/styles.js'].lineData[367]++;
    return setupElement(el, style);
  }
  _$jscoverage['/editor/styles.js'].lineData[370]++;
  function setupElement(el, style) {
    _$jscoverage['/editor/styles.js'].functionData[14]++;
    _$jscoverage['/editor/styles.js'].lineData[371]++;
    var def = style._.definition, attributes = def.attributes, styles = KEStyle.getStyleText(def);
    _$jscoverage['/editor/styles.js'].lineData[376]++;
    if (visit890_376_1(attributes)) {
      _$jscoverage['/editor/styles.js'].lineData[377]++;
      for (var att in attributes) {
        _$jscoverage['/editor/styles.js'].lineData[378]++;
        el.attr(att, attributes[att]);
      }
    }
    _$jscoverage['/editor/styles.js'].lineData[384]++;
    if (visit891_384_1(styles)) {
      _$jscoverage['/editor/styles.js'].lineData[385]++;
      el[0].style.cssText = styles;
    }
    _$jscoverage['/editor/styles.js'].lineData[388]++;
    return el;
  }
  _$jscoverage['/editor/styles.js'].lineData[391]++;
  function applyBlockStyle(range) {
    _$jscoverage['/editor/styles.js'].functionData[15]++;
    _$jscoverage['/editor/styles.js'].lineData[394]++;
    var bookmark = range.createBookmark(TRUE), iterator = range.createIterator();
    _$jscoverage['/editor/styles.js'].lineData[396]++;
    iterator.enforceRealBlocks = TRUE;
    _$jscoverage['/editor/styles.js'].lineData[400]++;
    iterator.enlargeBr = TRUE;
    _$jscoverage['/editor/styles.js'].lineData[402]++;
    var block, doc = range.document;
    _$jscoverage['/editor/styles.js'].lineData[404]++;
    while ((block = iterator.getNextParagraph())) {
      _$jscoverage['/editor/styles.js'].lineData[405]++;
      var newBlock = getElement(this, doc, block);
      _$jscoverage['/editor/styles.js'].lineData[406]++;
      replaceBlock(block, newBlock);
    }
    _$jscoverage['/editor/styles.js'].lineData[408]++;
    range.moveToBookmark(bookmark);
  }
  _$jscoverage['/editor/styles.js'].lineData[412]++;
  function replace(str, regexp, replacement) {
    _$jscoverage['/editor/styles.js'].functionData[16]++;
    _$jscoverage['/editor/styles.js'].lineData[413]++;
    var headBookmark = '', tailBookmark = '';
    _$jscoverage['/editor/styles.js'].lineData[416]++;
    str = str.replace(/(^<span[^>]+_ke_bookmark.*?\/span>)|(<span[^>]+_ke_bookmark.*?\/span>$)/gi, function(str, m1, m2) {
  _$jscoverage['/editor/styles.js'].functionData[17]++;
  _$jscoverage['/editor/styles.js'].lineData[418]++;
  if (visit892_418_1(m1)) {
    _$jscoverage['/editor/styles.js'].lineData[419]++;
    headBookmark = m1;
  }
  _$jscoverage['/editor/styles.js'].lineData[421]++;
  if (visit893_421_1(m2)) {
    _$jscoverage['/editor/styles.js'].lineData[422]++;
    tailBookmark = m2;
  }
  _$jscoverage['/editor/styles.js'].lineData[424]++;
  return '';
});
    _$jscoverage['/editor/styles.js'].lineData[426]++;
    return headBookmark + str.replace(regexp, replacement) + tailBookmark;
  }
  _$jscoverage['/editor/styles.js'].lineData[432]++;
  function toPre(block, newBlock) {
    _$jscoverage['/editor/styles.js'].functionData[18]++;
    _$jscoverage['/editor/styles.js'].lineData[434]++;
    var preHTML = block.html();
    _$jscoverage['/editor/styles.js'].lineData[437]++;
    preHTML = replace(preHTML, /(?:^[\t\n\r]+)|(?:[\t\n\r]+$)/g, '');
    _$jscoverage['/editor/styles.js'].lineData[440]++;
    preHTML = preHTML.replace(/[\t\r\n]*(<br[^>]*>)[\t\r\n]*/gi, '$1');
    _$jscoverage['/editor/styles.js'].lineData[444]++;
    preHTML = preHTML.replace(/([\t\n\r]+|&nbsp;)/g, ' ');
    _$jscoverage['/editor/styles.js'].lineData[447]++;
    preHTML = preHTML.replace(/<br\b[^>]*>/gi, '\n');
    _$jscoverage['/editor/styles.js'].lineData[450]++;
    if (visit894_450_1(UA.ie)) {
      _$jscoverage['/editor/styles.js'].lineData[451]++;
      var temp = block[0].ownerDocument.createElement('div');
      _$jscoverage['/editor/styles.js'].lineData[452]++;
      temp.appendChild(newBlock[0]);
      _$jscoverage['/editor/styles.js'].lineData[453]++;
      newBlock.outerHtml('<pre>' + preHTML + '</pre>');
      _$jscoverage['/editor/styles.js'].lineData[454]++;
      newBlock = new Node(temp.firstChild);
      _$jscoverage['/editor/styles.js'].lineData[455]++;
      newBlock._4eRemove();
    } else {
      _$jscoverage['/editor/styles.js'].lineData[457]++;
      newBlock.html(preHTML);
    }
    _$jscoverage['/editor/styles.js'].lineData[460]++;
    return newBlock;
  }
  _$jscoverage['/editor/styles.js'].lineData[464]++;
  function splitIntoPres(preBlock) {
    _$jscoverage['/editor/styles.js'].functionData[19]++;
    _$jscoverage['/editor/styles.js'].lineData[467]++;
    var duoBrRegex = /(\S\s*)\n(?:\s|(<span[^>]+_ck_bookmark.*?\/span>))*\n(?!$)/gi, splittedHTML = replace(preBlock.outerHtml(), duoBrRegex, function(match, charBefore, bookmark) {
  _$jscoverage['/editor/styles.js'].functionData[20]++;
  _$jscoverage['/editor/styles.js'].lineData[472]++;
  return charBefore + '</pre>' + bookmark + '<pre>';
});
    _$jscoverage['/editor/styles.js'].lineData[475]++;
    var pres = [];
    _$jscoverage['/editor/styles.js'].lineData[476]++;
    splittedHTML.replace(/<pre\b.*?>([\s\S]*?)<\/pre>/gi, function(match, preContent) {
  _$jscoverage['/editor/styles.js'].functionData[21]++;
  _$jscoverage['/editor/styles.js'].lineData[478]++;
  pres.push(preContent);
});
    _$jscoverage['/editor/styles.js'].lineData[480]++;
    return pres;
  }
  _$jscoverage['/editor/styles.js'].lineData[486]++;
  function replaceBlock(block, newBlock) {
    _$jscoverage['/editor/styles.js'].functionData[22]++;
    _$jscoverage['/editor/styles.js'].lineData[487]++;
    var newBlockIsPre = visit895_487_1(newBlock.nodeName === ('pre')), blockIsPre = visit896_488_1(block.nodeName === ('pre')), isToPre = visit897_489_1(newBlockIsPre && !blockIsPre), isFromPre = visit898_490_1(!newBlockIsPre && blockIsPre);
    _$jscoverage['/editor/styles.js'].lineData[492]++;
    if (visit899_492_1(isToPre)) {
      _$jscoverage['/editor/styles.js'].lineData[493]++;
      newBlock = toPre(block, newBlock);
    } else {
      _$jscoverage['/editor/styles.js'].lineData[494]++;
      if (visit900_494_1(isFromPre)) {
        _$jscoverage['/editor/styles.js'].lineData[496]++;
        newBlock = fromPres(splitIntoPres(block), newBlock);
      } else {
        _$jscoverage['/editor/styles.js'].lineData[498]++;
        block._4eMoveChildren(newBlock);
      }
    }
    _$jscoverage['/editor/styles.js'].lineData[501]++;
    block[0].parentNode.replaceChild(newBlock[0], block[0]);
    _$jscoverage['/editor/styles.js'].lineData[502]++;
    if (visit901_502_1(newBlockIsPre)) {
      _$jscoverage['/editor/styles.js'].lineData[504]++;
      mergePre(newBlock);
    }
  }
  _$jscoverage['/editor/styles.js'].lineData[509]++;
  function mergePre(preBlock) {
    _$jscoverage['/editor/styles.js'].functionData[23]++;
    _$jscoverage['/editor/styles.js'].lineData[510]++;
    var previousBlock;
    _$jscoverage['/editor/styles.js'].lineData[511]++;
    if (visit902_511_1(!(visit903_511_2((previousBlock = preBlock._4ePreviousSourceNode(TRUE, Dom.NodeType.ELEMENT_NODE)) && visit904_512_1(previousBlock.nodeName() === 'pre'))))) {
      _$jscoverage['/editor/styles.js'].lineData[513]++;
      return;
    }
    _$jscoverage['/editor/styles.js'].lineData[523]++;
    var mergedHTML = replace(previousBlock.html(), /\n$/, '') + '\n\n' + replace(preBlock.html(), /^\n/, '');
    _$jscoverage['/editor/styles.js'].lineData[527]++;
    if (visit905_527_1(UA.ie)) {
      _$jscoverage['/editor/styles.js'].lineData[528]++;
      preBlock.outerHtml('<pre>' + mergedHTML + '</pre>');
    } else {
      _$jscoverage['/editor/styles.js'].lineData[530]++;
      preBlock.html(mergedHTML);
    }
    _$jscoverage['/editor/styles.js'].lineData[533]++;
    previousBlock._4eRemove();
  }
  _$jscoverage['/editor/styles.js'].lineData[537]++;
  function fromPres(preHTMLs, newBlock) {
    _$jscoverage['/editor/styles.js'].functionData[24]++;
    _$jscoverage['/editor/styles.js'].lineData[538]++;
    var docFrag = newBlock[0].ownerDocument.createDocumentFragment();
    _$jscoverage['/editor/styles.js'].lineData[539]++;
    for (var i = 0; visit906_539_1(i < preHTMLs.length); i++) {
      _$jscoverage['/editor/styles.js'].lineData[540]++;
      var blockHTML = preHTMLs[i];
      _$jscoverage['/editor/styles.js'].lineData[544]++;
      blockHTML = blockHTML.replace(/(\r\n|\r)/g, '\n');
      _$jscoverage['/editor/styles.js'].lineData[545]++;
      blockHTML = replace(blockHTML, /^[\t]*\n/, '');
      _$jscoverage['/editor/styles.js'].lineData[546]++;
      blockHTML = replace(blockHTML, /\n$/, '');
      _$jscoverage['/editor/styles.js'].lineData[549]++;
      blockHTML = replace(blockHTML, /^[\t]+|[\t]+$/g, function(match, offset) {
  _$jscoverage['/editor/styles.js'].functionData[25]++;
  _$jscoverage['/editor/styles.js'].lineData[550]++;
  if (visit907_550_1(match.length === 1)) {
    _$jscoverage['/editor/styles.js'].lineData[551]++;
    return '&nbsp;';
  } else {
    _$jscoverage['/editor/styles.js'].lineData[552]++;
    if (visit908_552_1(!offset)) {
      _$jscoverage['/editor/styles.js'].lineData[553]++;
      return new Array(match.length).join('&nbsp;') + ' ';
    } else {
      _$jscoverage['/editor/styles.js'].lineData[555]++;
      return ' ' + new Array(match.length).join('&nbsp;');
    }
  }
});
      _$jscoverage['/editor/styles.js'].lineData[561]++;
      blockHTML = blockHTML.replace(/\n/g, '<br>');
      _$jscoverage['/editor/styles.js'].lineData[562]++;
      blockHTML = blockHTML.replace(/[\t]{2,}/g, function(match) {
  _$jscoverage['/editor/styles.js'].functionData[26]++;
  _$jscoverage['/editor/styles.js'].lineData[564]++;
  return new Array(match.length).join('&nbsp;') + ' ';
});
      _$jscoverage['/editor/styles.js'].lineData[567]++;
      var newBlockClone = newBlock.clone();
      _$jscoverage['/editor/styles.js'].lineData[568]++;
      newBlockClone.html(blockHTML);
      _$jscoverage['/editor/styles.js'].lineData[569]++;
      docFrag.appendChild(newBlockClone[0]);
    }
    _$jscoverage['/editor/styles.js'].lineData[571]++;
    return docFrag;
  }
  _$jscoverage['/editor/styles.js'].lineData[574]++;
  function applyInlineStyle(range) {
    _$jscoverage['/editor/styles.js'].functionData[27]++;
    _$jscoverage['/editor/styles.js'].lineData[575]++;
    var self = this, document = range.document;
    _$jscoverage['/editor/styles.js'].lineData[578]++;
    if (visit909_578_1(range.collapsed)) {
      _$jscoverage['/editor/styles.js'].lineData[580]++;
      var collapsedElement = getElement(this, document, undefined);
      _$jscoverage['/editor/styles.js'].lineData[582]++;
      range.insertNode(collapsedElement);
      _$jscoverage['/editor/styles.js'].lineData[584]++;
      range.moveToPosition(collapsedElement, KER.POSITION_BEFORE_END);
      _$jscoverage['/editor/styles.js'].lineData[585]++;
      return;
    }
    _$jscoverage['/editor/styles.js'].lineData[587]++;
    var elementName = this.element, def = this._.definition, isUnknownElement, dtd = DTD[elementName];
    _$jscoverage['/editor/styles.js'].lineData[592]++;
    if (visit910_592_1(!dtd)) {
      _$jscoverage['/editor/styles.js'].lineData[593]++;
      isUnknownElement = TRUE;
      _$jscoverage['/editor/styles.js'].lineData[594]++;
      dtd = DTD.span;
    }
    _$jscoverage['/editor/styles.js'].lineData[598]++;
    var bookmark = range.createBookmark();
    _$jscoverage['/editor/styles.js'].lineData[601]++;
    range.enlarge(KER.ENLARGE_ELEMENT);
    _$jscoverage['/editor/styles.js'].lineData[602]++;
    range.trim();
    _$jscoverage['/editor/styles.js'].lineData[606]++;
    var boundaryNodes = range.createBookmark(), firstNode = boundaryNodes.startNode, lastNode = boundaryNodes.endNode, currentNode = firstNode, styleRange;
    _$jscoverage['/editor/styles.js'].lineData[612]++;
    while (visit911_612_1(currentNode && currentNode[0])) {
      _$jscoverage['/editor/styles.js'].lineData[613]++;
      var applyStyle = FALSE;
      _$jscoverage['/editor/styles.js'].lineData[615]++;
      if (visit912_615_1(Dom.equals(currentNode, lastNode))) {
        _$jscoverage['/editor/styles.js'].lineData[616]++;
        currentNode = NULL;
        _$jscoverage['/editor/styles.js'].lineData[617]++;
        applyStyle = TRUE;
      } else {
        _$jscoverage['/editor/styles.js'].lineData[619]++;
        var nodeType = currentNode[0].nodeType, nodeName = visit913_620_1(nodeType === Dom.NodeType.ELEMENT_NODE) ? currentNode.nodeName() : NULL;
        _$jscoverage['/editor/styles.js'].lineData[623]++;
        if (visit914_623_1(nodeName && currentNode.attr('_ke_bookmark'))) {
          _$jscoverage['/editor/styles.js'].lineData[624]++;
          currentNode = currentNode._4eNextSourceNode(TRUE);
          _$jscoverage['/editor/styles.js'].lineData[625]++;
          continue;
        }
        _$jscoverage['/editor/styles.js'].lineData[629]++;
        if (visit915_629_1(!nodeName || (visit916_630_1(dtd[nodeName] && visit917_631_1(visit918_631_2((currentNode._4ePosition(lastNode) | (KEP.POSITION_PRECEDING | KEP.POSITION_IDENTICAL | KEP.POSITION_IS_CONTAINED)) === (KEP.POSITION_PRECEDING + KEP.POSITION_IDENTICAL + KEP.POSITION_IS_CONTAINED)) && (visit919_637_1(!def.childRule || def.childRule(currentNode)))))))) {
          _$jscoverage['/editor/styles.js'].lineData[639]++;
          var currentParent = currentNode.parent();
          _$jscoverage['/editor/styles.js'].lineData[649]++;
          if (visit920_649_1(currentParent && visit921_650_1(visit922_650_2(elementName === 'a') && visit923_651_1(currentParent.nodeName() === elementName)))) {
            _$jscoverage['/editor/styles.js'].lineData[652]++;
            var tmpANode = getElement(self, document, undefined);
            _$jscoverage['/editor/styles.js'].lineData[653]++;
            currentParent._4eMoveChildren(tmpANode);
            _$jscoverage['/editor/styles.js'].lineData[654]++;
            currentParent[0].parentNode.replaceChild(tmpANode[0], currentParent[0]);
            _$jscoverage['/editor/styles.js'].lineData[655]++;
            tmpANode._4eMergeSiblings();
          } else {
            _$jscoverage['/editor/styles.js'].lineData[656]++;
            if (visit924_656_1(currentParent && visit925_656_2(currentParent[0] && visit926_656_3((visit927_657_1((visit928_656_4(DTD[currentParent.nodeName()] || DTD.span))[elementName] || isUnknownElement)) && (visit929_658_1(!def.parentRule || def.parentRule(currentParent))))))) {
              _$jscoverage['/editor/styles.js'].lineData[665]++;
              if (visit930_665_1(!styleRange && (visit931_666_1(!nodeName || visit932_666_2(!DTD.$removeEmpty[nodeName] || visit933_666_3((currentNode._4ePosition(lastNode) | (KEP.POSITION_PRECEDING | KEP.POSITION_IDENTICAL | KEP.POSITION_IS_CONTAINED)) === (KEP.POSITION_PRECEDING + KEP.POSITION_IDENTICAL + KEP.POSITION_IS_CONTAINED))))))) {
                _$jscoverage['/editor/styles.js'].lineData[674]++;
                styleRange = new KERange(document);
                _$jscoverage['/editor/styles.js'].lineData[675]++;
                styleRange.setStartBefore(currentNode);
              }
              _$jscoverage['/editor/styles.js'].lineData[680]++;
              if (visit934_680_1(visit935_680_2(nodeType === Dom.NodeType.TEXT_NODE) || (visit936_681_1(visit937_681_2(nodeType === Dom.NodeType.ELEMENT_NODE) && !currentNode[0].childNodes.length)))) {
                _$jscoverage['/editor/styles.js'].lineData[682]++;
                var includedNode = currentNode, parentNode = null;
                _$jscoverage['/editor/styles.js'].lineData[695]++;
                while (visit938_696_1((applyStyle = !includedNode.next(notBookmark, 1)) && visit939_697_1((visit940_697_2((parentNode = includedNode.parent()) && dtd[parentNode.nodeName()])) && visit941_699_1(visit942_699_2((parentNode._4ePosition(firstNode) | KEP.POSITION_FOLLOWING | KEP.POSITION_IDENTICAL | KEP.POSITION_IS_CONTAINED) === (KEP.POSITION_FOLLOWING + KEP.POSITION_IDENTICAL + KEP.POSITION_IS_CONTAINED)) && (visit943_704_1(!def.childRule || def.childRule(parentNode))))))) {
                  _$jscoverage['/editor/styles.js'].lineData[705]++;
                  includedNode = parentNode;
                }
                _$jscoverage['/editor/styles.js'].lineData[708]++;
                styleRange.setEndAfter(includedNode);
              }
            } else {
              _$jscoverage['/editor/styles.js'].lineData[712]++;
              applyStyle = TRUE;
            }
          }
        } else {
          _$jscoverage['/editor/styles.js'].lineData[715]++;
          applyStyle = TRUE;
        }
        _$jscoverage['/editor/styles.js'].lineData[719]++;
        currentNode = currentNode._4eNextSourceNode();
      }
      _$jscoverage['/editor/styles.js'].lineData[723]++;
      if (visit944_723_1(applyStyle && visit945_723_2(styleRange && !styleRange.collapsed))) {
        _$jscoverage['/editor/styles.js'].lineData[725]++;
        var styleNode = getElement(self, document, undefined), parent = styleRange.getCommonAncestor();
        _$jscoverage['/editor/styles.js'].lineData[729]++;
        var removeList = {
  styles: {}, 
  attrs: {}, 
  blockedStyles: {}, 
  blockedAttrs: {}};
        _$jscoverage['/editor/styles.js'].lineData[738]++;
        var attName, styleName = null, value;
        _$jscoverage['/editor/styles.js'].lineData[742]++;
        while (visit946_742_1(styleNode && visit947_742_2(parent && visit948_742_3(styleNode[0] && parent[0])))) {
          _$jscoverage['/editor/styles.js'].lineData[743]++;
          if (visit949_743_1(parent.nodeName() === elementName)) {
            _$jscoverage['/editor/styles.js'].lineData[744]++;
            for (attName in def.attributes) {
              _$jscoverage['/editor/styles.js'].lineData[746]++;
              if (visit950_746_1(removeList.blockedAttrs[attName] || !(value = parent.attr(styleName)))) {
                _$jscoverage['/editor/styles.js'].lineData[747]++;
                continue;
              }
              _$jscoverage['/editor/styles.js'].lineData[750]++;
              if (visit951_750_1(styleNode.attr(attName) === value)) {
                _$jscoverage['/editor/styles.js'].lineData[752]++;
                styleNode.removeAttr(attName);
              } else {
                _$jscoverage['/editor/styles.js'].lineData[754]++;
                removeList.blockedAttrs[attName] = 1;
              }
            }
            _$jscoverage['/editor/styles.js'].lineData[762]++;
            for (styleName in def.styles) {
              _$jscoverage['/editor/styles.js'].lineData[764]++;
              if (visit952_764_1(removeList.blockedStyles[styleName] || !(value = parent.style(styleName)))) {
                _$jscoverage['/editor/styles.js'].lineData[765]++;
                continue;
              }
              _$jscoverage['/editor/styles.js'].lineData[768]++;
              if (visit953_768_1(styleNode.style(styleName) === value)) {
                _$jscoverage['/editor/styles.js'].lineData[770]++;
                styleNode.style(styleName, '');
              } else {
                _$jscoverage['/editor/styles.js'].lineData[772]++;
                removeList.blockedStyles[styleName] = 1;
              }
            }
            _$jscoverage['/editor/styles.js'].lineData[777]++;
            if (visit954_777_1(!styleNode._4eHasAttributes())) {
              _$jscoverage['/editor/styles.js'].lineData[778]++;
              styleNode = NULL;
              _$jscoverage['/editor/styles.js'].lineData[779]++;
              break;
            }
          }
          _$jscoverage['/editor/styles.js'].lineData[783]++;
          parent = parent.parent();
        }
        _$jscoverage['/editor/styles.js'].lineData[786]++;
        if (visit955_786_1(styleNode)) {
          _$jscoverage['/editor/styles.js'].lineData[788]++;
          styleNode[0].appendChild(styleRange.extractContents());
          _$jscoverage['/editor/styles.js'].lineData[792]++;
          removeFromInsideElement(self, styleNode);
          _$jscoverage['/editor/styles.js'].lineData[796]++;
          styleRange.insertNode(styleNode);
          _$jscoverage['/editor/styles.js'].lineData[799]++;
          styleNode._4eMergeSiblings();
          _$jscoverage['/editor/styles.js'].lineData[807]++;
          if (visit956_807_1(!UA.ie)) {
            _$jscoverage['/editor/styles.js'].lineData[808]++;
            styleNode[0].normalize();
          }
        } else {
          _$jscoverage['/editor/styles.js'].lineData[821]++;
          styleNode = new Node(document.createElement('span'));
          _$jscoverage['/editor/styles.js'].lineData[822]++;
          styleNode[0].appendChild(styleRange.extractContents());
          _$jscoverage['/editor/styles.js'].lineData[823]++;
          styleRange.insertNode(styleNode);
          _$jscoverage['/editor/styles.js'].lineData[824]++;
          removeFromInsideElement(self, styleNode);
          _$jscoverage['/editor/styles.js'].lineData[825]++;
          styleNode._4eRemove(true);
        }
        _$jscoverage['/editor/styles.js'].lineData[830]++;
        styleRange = NULL;
      }
    }
    _$jscoverage['/editor/styles.js'].lineData[834]++;
    firstNode._4eRemove();
    _$jscoverage['/editor/styles.js'].lineData[835]++;
    lastNode._4eRemove();
    _$jscoverage['/editor/styles.js'].lineData[836]++;
    range.moveToBookmark(bookmark);
    _$jscoverage['/editor/styles.js'].lineData[838]++;
    range.shrink(KER.SHRINK_TEXT);
  }
  _$jscoverage['/editor/styles.js'].lineData[842]++;
  function removeInlineStyle(range) {
    _$jscoverage['/editor/styles.js'].functionData[28]++;
    _$jscoverage['/editor/styles.js'].lineData[847]++;
    range.enlarge(KER.ENLARGE_ELEMENT);
    _$jscoverage['/editor/styles.js'].lineData[849]++;
    var bookmark = range.createBookmark(), startNode = bookmark.startNode;
    _$jscoverage['/editor/styles.js'].lineData[852]++;
    if (visit957_852_1(range.collapsed)) {
      _$jscoverage['/editor/styles.js'].lineData[853]++;
      var startPath = new ElementPath(startNode.parent()), boundaryElement;
      _$jscoverage['/editor/styles.js'].lineData[857]++;
      for (var i = 0, element; visit958_857_1(visit959_857_2(i < startPath.elements.length) && (element = startPath.elements[i])); i++) {
        _$jscoverage['/editor/styles.js'].lineData[865]++;
        if (visit960_865_1(visit961_865_2(element === startPath.block) || visit962_865_3(element === startPath.blockLimit))) {
          _$jscoverage['/editor/styles.js'].lineData[866]++;
          break;
        }
        _$jscoverage['/editor/styles.js'].lineData[868]++;
        if (visit963_868_1(this.checkElementRemovable(element))) {
          _$jscoverage['/editor/styles.js'].lineData[869]++;
          var endOfElement = range.checkBoundaryOfElement(element, KER.END), startOfElement = visit964_870_1(!endOfElement && range.checkBoundaryOfElement(element, KER.START));
          _$jscoverage['/editor/styles.js'].lineData[872]++;
          if (visit965_872_1(startOfElement || endOfElement)) {
            _$jscoverage['/editor/styles.js'].lineData[873]++;
            boundaryElement = element;
            _$jscoverage['/editor/styles.js'].lineData[874]++;
            boundaryElement.match = startOfElement ? 'start' : 'end';
          } else {
            _$jscoverage['/editor/styles.js'].lineData[882]++;
            element._4eMergeSiblings();
            _$jscoverage['/editor/styles.js'].lineData[886]++;
            if (visit966_886_1(element.nodeName() !== this.element)) {
              _$jscoverage['/editor/styles.js'].lineData[887]++;
              var _overrides = getOverrides(this);
              _$jscoverage['/editor/styles.js'].lineData[888]++;
              removeOverrides(element, visit967_889_1(_overrides[element.nodeName()] || _overrides['*']));
            } else {
              _$jscoverage['/editor/styles.js'].lineData[891]++;
              removeFromElement(this, element);
            }
          }
        }
      }
      _$jscoverage['/editor/styles.js'].lineData[901]++;
      if (visit968_901_1(boundaryElement)) {
        _$jscoverage['/editor/styles.js'].lineData[902]++;
        var clonedElement = startNode;
        _$jscoverage['/editor/styles.js'].lineData[903]++;
        for (i = 0; ; i++) {
          _$jscoverage['/editor/styles.js'].lineData[904]++;
          var newElement = startPath.elements[i];
          _$jscoverage['/editor/styles.js'].lineData[905]++;
          if (visit969_905_1(newElement.equals(boundaryElement))) {
            _$jscoverage['/editor/styles.js'].lineData[906]++;
            break;
          } else {
            _$jscoverage['/editor/styles.js'].lineData[907]++;
            if (visit970_907_1(newElement.match)) {
              _$jscoverage['/editor/styles.js'].lineData[909]++;
              continue;
            } else {
              _$jscoverage['/editor/styles.js'].lineData[911]++;
              newElement = newElement.clone();
            }
          }
          _$jscoverage['/editor/styles.js'].lineData[913]++;
          newElement[0].appendChild(clonedElement[0]);
          _$jscoverage['/editor/styles.js'].lineData[914]++;
          clonedElement = newElement;
        }
        _$jscoverage['/editor/styles.js'].lineData[920]++;
        clonedElement[visit971_919_1(boundaryElement.match === 'start') ? 'insertBefore' : 'insertAfter'](boundaryElement);
        _$jscoverage['/editor/styles.js'].lineData[923]++;
        var tmp = boundaryElement.html();
        _$jscoverage['/editor/styles.js'].lineData[924]++;
        if (visit972_924_1(!tmp || visit973_926_1(tmp === '\u200b'))) {
          _$jscoverage['/editor/styles.js'].lineData[927]++;
          boundaryElement.remove();
        } else {
          _$jscoverage['/editor/styles.js'].lineData[928]++;
          if (visit974_928_1(UA.webkit)) {
            _$jscoverage['/editor/styles.js'].lineData[930]++;
            $(range.document.createTextNode('\u200b')).insertBefore(clonedElement);
          }
        }
      }
    } else {
      _$jscoverage['/editor/styles.js'].lineData[938]++;
      var endNode = bookmark.endNode, self = this;
      _$jscoverage['/editor/styles.js'].lineData[945]++;
      var breakNodes = function() {
  _$jscoverage['/editor/styles.js'].functionData[29]++;
  _$jscoverage['/editor/styles.js'].lineData[946]++;
  var startPath = new ElementPath(startNode.parent()), endPath = new ElementPath(endNode.parent()), breakStart = NULL, element, breakEnd = NULL;
  _$jscoverage['/editor/styles.js'].lineData[951]++;
  for (var i = 0; visit975_951_1(i < startPath.elements.length); i++) {
    _$jscoverage['/editor/styles.js'].lineData[952]++;
    element = startPath.elements[i];
    _$jscoverage['/editor/styles.js'].lineData[954]++;
    if (visit976_954_1(visit977_954_2(element === startPath.block) || visit978_955_1(element === startPath.blockLimit))) {
      _$jscoverage['/editor/styles.js'].lineData[956]++;
      break;
    }
    _$jscoverage['/editor/styles.js'].lineData[959]++;
    if (visit979_959_1(self.checkElementRemovable(element))) {
      _$jscoverage['/editor/styles.js'].lineData[960]++;
      breakStart = element;
    }
  }
  _$jscoverage['/editor/styles.js'].lineData[963]++;
  for (i = 0; visit980_963_1(i < endPath.elements.length); i++) {
    _$jscoverage['/editor/styles.js'].lineData[964]++;
    element = endPath.elements[i];
    _$jscoverage['/editor/styles.js'].lineData[966]++;
    if (visit981_966_1(visit982_966_2(element === endPath.block) || visit983_967_1(element === endPath.blockLimit))) {
      _$jscoverage['/editor/styles.js'].lineData[968]++;
      break;
    }
    _$jscoverage['/editor/styles.js'].lineData[971]++;
    if (visit984_971_1(self.checkElementRemovable(element))) {
      _$jscoverage['/editor/styles.js'].lineData[972]++;
      breakEnd = element;
    }
  }
  _$jscoverage['/editor/styles.js'].lineData[976]++;
  if (visit985_976_1(breakEnd)) {
    _$jscoverage['/editor/styles.js'].lineData[977]++;
    endNode._4eBreakParent(breakEnd);
  }
  _$jscoverage['/editor/styles.js'].lineData[979]++;
  if (visit986_979_1(breakStart)) {
    _$jscoverage['/editor/styles.js'].lineData[980]++;
    startNode._4eBreakParent(breakStart);
  }
};
      _$jscoverage['/editor/styles.js'].lineData[984]++;
      breakNodes();
      _$jscoverage['/editor/styles.js'].lineData[987]++;
      var currentNode = new Node(startNode[0].nextSibling);
      _$jscoverage['/editor/styles.js'].lineData[988]++;
      while (visit987_988_1(currentNode[0] !== endNode[0])) {
        _$jscoverage['/editor/styles.js'].lineData[993]++;
        var nextNode = currentNode._4eNextSourceNode();
        _$jscoverage['/editor/styles.js'].lineData[994]++;
        if (visit988_994_1(currentNode[0] && visit989_995_1(visit990_995_2(currentNode[0].nodeType === Dom.NodeType.ELEMENT_NODE) && this.checkElementRemovable(currentNode)))) {
          _$jscoverage['/editor/styles.js'].lineData[998]++;
          if (visit991_998_1(currentNode.nodeName() === this.element)) {
            _$jscoverage['/editor/styles.js'].lineData[999]++;
            removeFromElement(this, currentNode);
          } else {
            _$jscoverage['/editor/styles.js'].lineData[1001]++;
            var overrides = getOverrides(this);
            _$jscoverage['/editor/styles.js'].lineData[1002]++;
            removeOverrides(currentNode, visit992_1003_1(overrides[currentNode.nodeName()] || overrides['*']));
          }
          _$jscoverage['/editor/styles.js'].lineData[1013]++;
          if (visit993_1013_1(visit994_1013_2(nextNode[0].nodeType === Dom.NodeType.ELEMENT_NODE) && nextNode.contains(startNode))) {
            _$jscoverage['/editor/styles.js'].lineData[1015]++;
            breakNodes();
            _$jscoverage['/editor/styles.js'].lineData[1016]++;
            nextNode = new Node(startNode[0].nextSibling);
          }
        }
        _$jscoverage['/editor/styles.js'].lineData[1019]++;
        currentNode = nextNode;
      }
    }
    _$jscoverage['/editor/styles.js'].lineData[1022]++;
    range.moveToBookmark(bookmark);
  }
  _$jscoverage['/editor/styles.js'].lineData[1026]++;
  function parseStyleText(styleText) {
    _$jscoverage['/editor/styles.js'].functionData[30]++;
    _$jscoverage['/editor/styles.js'].lineData[1027]++;
    styleText = String(styleText);
    _$jscoverage['/editor/styles.js'].lineData[1028]++;
    var retval = {};
    _$jscoverage['/editor/styles.js'].lineData[1030]++;
    styleText.replace(/&quot;/g, '"').replace(/\s*([^ :;]+)\s*:\s*([^;]+)\s*(?=;|$)/g, function(match, name, value) {
  _$jscoverage['/editor/styles.js'].functionData[31]++;
  _$jscoverage['/editor/styles.js'].lineData[1032]++;
  retval[name] = value;
});
    _$jscoverage['/editor/styles.js'].lineData[1034]++;
    return retval;
  }
  _$jscoverage['/editor/styles.js'].lineData[1037]++;
  function compareCssText(source, target) {
    _$jscoverage['/editor/styles.js'].functionData[32]++;
    _$jscoverage['/editor/styles.js'].lineData[1038]++;
    if (visit995_1038_1(typeof source === 'string')) {
      _$jscoverage['/editor/styles.js'].lineData[1039]++;
      source = parseStyleText(source);
    }
    _$jscoverage['/editor/styles.js'].lineData[1041]++;
    if (visit996_1041_1(typeof target === 'string')) {
      _$jscoverage['/editor/styles.js'].lineData[1042]++;
      target = parseStyleText(target);
    }
    _$jscoverage['/editor/styles.js'].lineData[1044]++;
    for (var name in source) {
      _$jscoverage['/editor/styles.js'].lineData[1048]++;
      if (visit997_1048_1(!(visit998_1048_2(name in target && (visit999_1049_1(visit1000_1049_2(target[name] === source[name]) || visit1001_1050_1(visit1002_1050_2(source[name] === 'inherit') || visit1003_1050_3(target[name] === 'inherit')))))))) {
        _$jscoverage['/editor/styles.js'].lineData[1051]++;
        return FALSE;
      }
    }
    _$jscoverage['/editor/styles.js'].lineData[1055]++;
    return TRUE;
  }
  _$jscoverage['/editor/styles.js'].lineData[1058]++;
  function normalizeCssText(unParsedCssText, nativeNormalize) {
    _$jscoverage['/editor/styles.js'].functionData[33]++;
    _$jscoverage['/editor/styles.js'].lineData[1059]++;
    var styleText = '';
    _$jscoverage['/editor/styles.js'].lineData[1060]++;
    if (visit1004_1060_1(nativeNormalize !== FALSE)) {
      _$jscoverage['/editor/styles.js'].lineData[1063]++;
      var temp = document.createElement('span');
      _$jscoverage['/editor/styles.js'].lineData[1064]++;
      temp.style.cssText = unParsedCssText;
      _$jscoverage['/editor/styles.js'].lineData[1066]++;
      styleText = visit1005_1066_1(temp.style.cssText || '');
    } else {
      _$jscoverage['/editor/styles.js'].lineData[1068]++;
      styleText = unParsedCssText;
    }
    _$jscoverage['/editor/styles.js'].lineData[1073]++;
    return styleText.replace(/\s*([;:])\s*/, '$1').replace(/([^\s;])$/, '$1;').replace(/,\s+/g, ',').toLowerCase();
  }
  _$jscoverage['/editor/styles.js'].lineData[1083]++;
  function getAttributesForComparison(styleDefinition) {
    _$jscoverage['/editor/styles.js'].functionData[34]++;
    _$jscoverage['/editor/styles.js'].lineData[1085]++;
    var attribs = styleDefinition._AC;
    _$jscoverage['/editor/styles.js'].lineData[1086]++;
    if (visit1006_1086_1(attribs)) {
      _$jscoverage['/editor/styles.js'].lineData[1087]++;
      return attribs;
    }
    _$jscoverage['/editor/styles.js'].lineData[1089]++;
    attribs = {};
    _$jscoverage['/editor/styles.js'].lineData[1091]++;
    var length = 0, styleAttribs = styleDefinition.attributes;
    _$jscoverage['/editor/styles.js'].lineData[1095]++;
    if (visit1007_1095_1(styleAttribs)) {
      _$jscoverage['/editor/styles.js'].lineData[1096]++;
      for (var styleAtt in styleAttribs) {
        _$jscoverage['/editor/styles.js'].lineData[1098]++;
        length++;
        _$jscoverage['/editor/styles.js'].lineData[1099]++;
        attribs[styleAtt] = styleAttribs[styleAtt];
      }
    }
    _$jscoverage['/editor/styles.js'].lineData[1105]++;
    var styleText = KEStyle.getStyleText(styleDefinition);
    _$jscoverage['/editor/styles.js'].lineData[1106]++;
    if (visit1008_1106_1(styleText)) {
      _$jscoverage['/editor/styles.js'].lineData[1107]++;
      if (visit1009_1107_1(!attribs.style)) {
        _$jscoverage['/editor/styles.js'].lineData[1108]++;
        length++;
      }
      _$jscoverage['/editor/styles.js'].lineData[1110]++;
      attribs.style = styleText;
    }
    _$jscoverage['/editor/styles.js'].lineData[1115]++;
    attribs._length = length;
    _$jscoverage['/editor/styles.js'].lineData[1118]++;
    styleDefinition._AC = attribs;
    _$jscoverage['/editor/styles.js'].lineData[1119]++;
    return attribs;
  }
  _$jscoverage['/editor/styles.js'].lineData[1127]++;
  function getOverrides(style) {
    _$jscoverage['/editor/styles.js'].functionData[35]++;
    _$jscoverage['/editor/styles.js'].lineData[1128]++;
    if (visit1010_1128_1(style._.overrides)) {
      _$jscoverage['/editor/styles.js'].lineData[1129]++;
      return style._.overrides;
    }
    _$jscoverage['/editor/styles.js'].lineData[1132]++;
    var overrides = (style._.overrides = {}), definition = style._.definition.overrides;
    _$jscoverage['/editor/styles.js'].lineData[1135]++;
    if (visit1011_1135_1(definition)) {
      _$jscoverage['/editor/styles.js'].lineData[1138]++;
      if (visit1012_1138_1(!util.isArray(definition))) {
        _$jscoverage['/editor/styles.js'].lineData[1139]++;
        definition = [definition];
      }
      _$jscoverage['/editor/styles.js'].lineData[1143]++;
      for (var i = 0; visit1013_1143_1(i < definition.length); i++) {
        _$jscoverage['/editor/styles.js'].lineData[1144]++;
        var override = definition[i];
        _$jscoverage['/editor/styles.js'].lineData[1145]++;
        var elementName;
        _$jscoverage['/editor/styles.js'].lineData[1146]++;
        var overrideEl;
        _$jscoverage['/editor/styles.js'].lineData[1147]++;
        var attrs, styles;
        _$jscoverage['/editor/styles.js'].lineData[1150]++;
        if (visit1014_1150_1(typeof override === 'string')) {
          _$jscoverage['/editor/styles.js'].lineData[1151]++;
          elementName = override.toLowerCase();
        } else {
          _$jscoverage['/editor/styles.js'].lineData[1153]++;
          elementName = override.element ? override.element.toLowerCase() : style.element;
          _$jscoverage['/editor/styles.js'].lineData[1156]++;
          attrs = override.attributes;
          _$jscoverage['/editor/styles.js'].lineData[1157]++;
          styles = override.styles;
        }
        _$jscoverage['/editor/styles.js'].lineData[1163]++;
        overrideEl = visit1015_1163_1(overrides[elementName] || (overrides[elementName] = {}));
        _$jscoverage['/editor/styles.js'].lineData[1166]++;
        if (visit1016_1166_1(attrs)) {
          _$jscoverage['/editor/styles.js'].lineData[1170]++;
          var overrideAttrs = (overrideEl.attributes = visit1017_1171_1(overrideEl.attributes || []));
          _$jscoverage['/editor/styles.js'].lineData[1172]++;
          for (var attName in attrs) {
            _$jscoverage['/editor/styles.js'].lineData[1176]++;
            overrideAttrs.push([attName.toLowerCase(), attrs[attName]]);
          }
        }
        _$jscoverage['/editor/styles.js'].lineData[1180]++;
        if (visit1018_1180_1(styles)) {
          _$jscoverage['/editor/styles.js'].lineData[1184]++;
          var overrideStyles = (overrideEl.styles = visit1019_1185_1(overrideEl.styles || []));
          _$jscoverage['/editor/styles.js'].lineData[1186]++;
          for (var styleName in styles) {
            _$jscoverage['/editor/styles.js'].lineData[1190]++;
            overrideStyles.push([styleName.toLowerCase(), styles[styleName]]);
          }
        }
      }
    }
    _$jscoverage['/editor/styles.js'].lineData[1196]++;
    return overrides;
  }
  _$jscoverage['/editor/styles.js'].lineData[1200]++;
  function removeFromElement(style, element) {
    _$jscoverage['/editor/styles.js'].functionData[36]++;
    _$jscoverage['/editor/styles.js'].lineData[1201]++;
    var def = style._.definition, overrides = getOverrides(style), attributes = util.merge(def.attributes, (visit1020_1204_1(overrides[element.nodeName()] || visit1021_1204_2(overrides['*'] || {}))).attributes), styles = util.merge(def.styles, (visit1022_1206_1(overrides[element.nodeName()] || visit1023_1206_2(overrides['*'] || {}))).styles), removeEmpty = visit1024_1208_1(util.isEmptyObject(attributes) && util.isEmptyObject(styles));
    _$jscoverage['/editor/styles.js'].lineData[1212]++;
    for (var attName in attributes) {
      _$jscoverage['/editor/styles.js'].lineData[1215]++;
      if (visit1025_1215_1((visit1026_1215_2(visit1027_1215_3(attName === 'class') || style._.definition.fullMatch)) && visit1028_1215_4(element.attr(attName) !== normalizeProperty(attName, attributes[attName])))) {
        _$jscoverage['/editor/styles.js'].lineData[1217]++;
        continue;
      }
      _$jscoverage['/editor/styles.js'].lineData[1219]++;
      removeEmpty = visit1029_1219_1(removeEmpty || !!element.hasAttr(attName));
      _$jscoverage['/editor/styles.js'].lineData[1220]++;
      element.removeAttr(attName);
    }
    _$jscoverage['/editor/styles.js'].lineData[1224]++;
    for (var styleName in styles) {
      _$jscoverage['/editor/styles.js'].lineData[1227]++;
      if (visit1030_1227_1(style._.definition.fullMatch && visit1031_1228_1(element.style(styleName) !== normalizeProperty(styleName, styles[styleName], TRUE)))) {
        _$jscoverage['/editor/styles.js'].lineData[1229]++;
        continue;
      }
      _$jscoverage['/editor/styles.js'].lineData[1232]++;
      removeEmpty = visit1032_1232_1(removeEmpty || !!element.style(styleName));
      _$jscoverage['/editor/styles.js'].lineData[1234]++;
      element.style(styleName, '');
    }
    _$jscoverage['/editor/styles.js'].lineData[1240]++;
    removeNoAttribsElement(element);
  }
  _$jscoverage['/editor/styles.js'].lineData[1243]++;
  function normalizeProperty(name, value, isStyle) {
    _$jscoverage['/editor/styles.js'].functionData[37]++;
    _$jscoverage['/editor/styles.js'].lineData[1244]++;
    var temp = new Node('<span>');
    _$jscoverage['/editor/styles.js'].lineData[1245]++;
    temp[isStyle ? 'style' : 'attr'](name, value);
    _$jscoverage['/editor/styles.js'].lineData[1246]++;
    return temp[isStyle ? 'style' : 'attr'](name);
  }
  _$jscoverage['/editor/styles.js'].lineData[1250]++;
  function removeFromInsideElement(style, element) {
    _$jscoverage['/editor/styles.js'].functionData[38]++;
    _$jscoverage['/editor/styles.js'].lineData[1251]++;
    var overrides = getOverrides(style), innerElements = element.all(style.element);
    _$jscoverage['/editor/styles.js'].lineData[1257]++;
    for (var i = innerElements.length; visit1033_1257_1(--i >= 0); ) {
      _$jscoverage['/editor/styles.js'].lineData[1258]++;
      removeFromElement(style, new Node(innerElements[i]));
    }
    _$jscoverage['/editor/styles.js'].lineData[1263]++;
    for (var overrideElement in overrides) {
      _$jscoverage['/editor/styles.js'].lineData[1265]++;
      if (visit1034_1265_1(overrideElement !== style.element)) {
        _$jscoverage['/editor/styles.js'].lineData[1266]++;
        innerElements = element.all(overrideElement);
        _$jscoverage['/editor/styles.js'].lineData[1267]++;
        for (i = innerElements.length - 1; visit1035_1267_1(i >= 0); i--) {
          _$jscoverage['/editor/styles.js'].lineData[1268]++;
          var innerElement = new Node(innerElements[i]);
          _$jscoverage['/editor/styles.js'].lineData[1269]++;
          removeOverrides(innerElement, overrides[overrideElement]);
        }
      }
    }
  }
  _$jscoverage['/editor/styles.js'].lineData[1282]++;
  function removeOverrides(element, overrides) {
    _$jscoverage['/editor/styles.js'].functionData[39]++;
    _$jscoverage['/editor/styles.js'].lineData[1283]++;
    var i, actualAttrValue, attributes = visit1036_1284_1(overrides && overrides.attributes);
    _$jscoverage['/editor/styles.js'].lineData[1286]++;
    if (visit1037_1286_1(attributes)) {
      _$jscoverage['/editor/styles.js'].lineData[1287]++;
      for (i = 0; visit1038_1287_1(i < attributes.length); i++) {
        _$jscoverage['/editor/styles.js'].lineData[1288]++;
        var attName = attributes[i][0];
        _$jscoverage['/editor/styles.js'].lineData[1290]++;
        if ((actualAttrValue = element.attr(attName))) {
          _$jscoverage['/editor/styles.js'].lineData[1291]++;
          var attValue = attributes[i][1];
          _$jscoverage['/editor/styles.js'].lineData[1299]++;
          if (visit1039_1299_1(visit1040_1299_2(attValue === NULL) || visit1041_1300_1((visit1042_1300_2(attValue.test && attValue.test(actualAttrValue))) || (visit1043_1301_1(visit1044_1301_2(typeof attValue === 'string') && visit1045_1301_3(actualAttrValue === attValue)))))) {
            _$jscoverage['/editor/styles.js'].lineData[1302]++;
            element[0].removeAttribute(attName);
          }
        }
      }
    }
    _$jscoverage['/editor/styles.js'].lineData[1308]++;
    var styles = visit1046_1308_1(overrides && overrides.styles);
    _$jscoverage['/editor/styles.js'].lineData[1310]++;
    if (visit1047_1310_1(styles)) {
      _$jscoverage['/editor/styles.js'].lineData[1311]++;
      for (i = 0; visit1048_1311_1(i < styles.length); i++) {
        _$jscoverage['/editor/styles.js'].lineData[1312]++;
        var styleName = styles[i][0], actualStyleValue;
        _$jscoverage['/editor/styles.js'].lineData[1314]++;
        if ((actualStyleValue = element.css(styleName))) {
          _$jscoverage['/editor/styles.js'].lineData[1315]++;
          var styleValue = styles[i][1];
          _$jscoverage['/editor/styles.js'].lineData[1316]++;
          if (visit1049_1316_1(visit1050_1316_2(styleValue === NULL) || visit1051_1318_1((visit1052_1318_2(styleValue.test && styleValue.test(actualAttrValue))) || (visit1053_1319_1(visit1054_1319_2(typeof styleValue === 'string') && visit1055_1319_3(actualStyleValue === styleValue)))))) {
            _$jscoverage['/editor/styles.js'].lineData[1320]++;
            element.css(styleName, '');
          }
        }
      }
    }
    _$jscoverage['/editor/styles.js'].lineData[1326]++;
    removeNoAttribsElement(element);
  }
  _$jscoverage['/editor/styles.js'].lineData[1330]++;
  function removeNoAttribsElement(element) {
    _$jscoverage['/editor/styles.js'].functionData[40]++;
    _$jscoverage['/editor/styles.js'].lineData[1333]++;
    if (visit1056_1333_1(!element._4eHasAttributes())) {
      _$jscoverage['/editor/styles.js'].lineData[1336]++;
      var firstChild = element[0].firstChild, lastChild = element[0].lastChild;
      _$jscoverage['/editor/styles.js'].lineData[1339]++;
      element._4eRemove(TRUE);
      _$jscoverage['/editor/styles.js'].lineData[1341]++;
      if (visit1057_1341_1(firstChild)) {
        _$jscoverage['/editor/styles.js'].lineData[1343]++;
        if (visit1058_1343_1(firstChild.nodeType === Dom.NodeType.ELEMENT_NODE)) {
          _$jscoverage['/editor/styles.js'].lineData[1344]++;
          Dom._4eMergeSiblings(firstChild);
        }
        _$jscoverage['/editor/styles.js'].lineData[1347]++;
        if (visit1059_1347_1(lastChild && visit1060_1347_2(visit1061_1347_3(firstChild !== lastChild) && visit1062_1347_4(lastChild.nodeType === Dom.NodeType.ELEMENT_NODE)))) {
          _$jscoverage['/editor/styles.js'].lineData[1348]++;
          Dom._4eMergeSiblings(lastChild);
        }
      }
    }
  }
  _$jscoverage['/editor/styles.js'].lineData[1354]++;
  Editor.Style = KEStyle;
  _$jscoverage['/editor/styles.js'].lineData[1356]++;
  return KEStyle;
});
