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
if (! _$jscoverage['/dialog.js']) {
  _$jscoverage['/dialog.js'] = {};
  _$jscoverage['/dialog.js'].lineData = [];
  _$jscoverage['/dialog.js'].lineData[6] = 0;
  _$jscoverage['/dialog.js'].lineData[11] = 0;
  _$jscoverage['/dialog.js'].lineData[25] = 0;
  _$jscoverage['/dialog.js'].lineData[26] = 0;
  _$jscoverage['/dialog.js'].lineData[27] = 0;
  _$jscoverage['/dialog.js'].lineData[28] = 0;
  _$jscoverage['/dialog.js'].lineData[29] = 0;
  _$jscoverage['/dialog.js'].lineData[32] = 0;
  _$jscoverage['/dialog.js'].lineData[33] = 0;
  _$jscoverage['/dialog.js'].lineData[39] = 0;
  _$jscoverage['/dialog.js'].lineData[41] = 0;
  _$jscoverage['/dialog.js'].lineData[43] = 0;
  _$jscoverage['/dialog.js'].lineData[44] = 0;
  _$jscoverage['/dialog.js'].lineData[46] = 0;
  _$jscoverage['/dialog.js'].lineData[48] = 0;
  _$jscoverage['/dialog.js'].lineData[51] = 0;
  _$jscoverage['/dialog.js'].lineData[55] = 0;
  _$jscoverage['/dialog.js'].lineData[60] = 0;
  _$jscoverage['/dialog.js'].lineData[61] = 0;
  _$jscoverage['/dialog.js'].lineData[62] = 0;
  _$jscoverage['/dialog.js'].lineData[64] = 0;
  _$jscoverage['/dialog.js'].lineData[69] = 0;
  _$jscoverage['/dialog.js'].lineData[80] = 0;
  _$jscoverage['/dialog.js'].lineData[85] = 0;
  _$jscoverage['/dialog.js'].lineData[86] = 0;
  _$jscoverage['/dialog.js'].lineData[87] = 0;
  _$jscoverage['/dialog.js'].lineData[88] = 0;
  _$jscoverage['/dialog.js'].lineData[92] = 0;
  _$jscoverage['/dialog.js'].lineData[94] = 0;
  _$jscoverage['/dialog.js'].lineData[160] = 0;
  _$jscoverage['/dialog.js'].lineData[161] = 0;
  _$jscoverage['/dialog.js'].lineData[163] = 0;
  _$jscoverage['/dialog.js'].lineData[169] = 0;
  _$jscoverage['/dialog.js'].lineData[170] = 0;
  _$jscoverage['/dialog.js'].lineData[175] = 0;
  _$jscoverage['/dialog.js'].lineData[176] = 0;
  _$jscoverage['/dialog.js'].lineData[177] = 0;
  _$jscoverage['/dialog.js'].lineData[178] = 0;
  _$jscoverage['/dialog.js'].lineData[179] = 0;
  _$jscoverage['/dialog.js'].lineData[181] = 0;
  _$jscoverage['/dialog.js'].lineData[182] = 0;
  _$jscoverage['/dialog.js'].lineData[185] = 0;
  _$jscoverage['/dialog.js'].lineData[186] = 0;
  _$jscoverage['/dialog.js'].lineData[187] = 0;
  _$jscoverage['/dialog.js'].lineData[188] = 0;
  _$jscoverage['/dialog.js'].lineData[189] = 0;
  _$jscoverage['/dialog.js'].lineData[190] = 0;
  _$jscoverage['/dialog.js'].lineData[191] = 0;
  _$jscoverage['/dialog.js'].lineData[192] = 0;
  _$jscoverage['/dialog.js'].lineData[193] = 0;
  _$jscoverage['/dialog.js'].lineData[196] = 0;
  _$jscoverage['/dialog.js'].lineData[208] = 0;
  _$jscoverage['/dialog.js'].lineData[209] = 0;
  _$jscoverage['/dialog.js'].lineData[210] = 0;
  _$jscoverage['/dialog.js'].lineData[237] = 0;
  _$jscoverage['/dialog.js'].lineData[239] = 0;
  _$jscoverage['/dialog.js'].lineData[240] = 0;
  _$jscoverage['/dialog.js'].lineData[242] = 0;
  _$jscoverage['/dialog.js'].lineData[243] = 0;
  _$jscoverage['/dialog.js'].lineData[245] = 0;
  _$jscoverage['/dialog.js'].lineData[247] = 0;
  _$jscoverage['/dialog.js'].lineData[249] = 0;
  _$jscoverage['/dialog.js'].lineData[250] = 0;
  _$jscoverage['/dialog.js'].lineData[251] = 0;
  _$jscoverage['/dialog.js'].lineData[252] = 0;
  _$jscoverage['/dialog.js'].lineData[254] = 0;
  _$jscoverage['/dialog.js'].lineData[256] = 0;
  _$jscoverage['/dialog.js'].lineData[257] = 0;
  _$jscoverage['/dialog.js'].lineData[259] = 0;
  _$jscoverage['/dialog.js'].lineData[262] = 0;
  _$jscoverage['/dialog.js'].lineData[263] = 0;
  _$jscoverage['/dialog.js'].lineData[264] = 0;
  _$jscoverage['/dialog.js'].lineData[266] = 0;
  _$jscoverage['/dialog.js'].lineData[268] = 0;
  _$jscoverage['/dialog.js'].lineData[270] = 0;
  _$jscoverage['/dialog.js'].lineData[271] = 0;
  _$jscoverage['/dialog.js'].lineData[272] = 0;
  _$jscoverage['/dialog.js'].lineData[273] = 0;
  _$jscoverage['/dialog.js'].lineData[274] = 0;
  _$jscoverage['/dialog.js'].lineData[276] = 0;
  _$jscoverage['/dialog.js'].lineData[277] = 0;
  _$jscoverage['/dialog.js'].lineData[279] = 0;
  _$jscoverage['/dialog.js'].lineData[281] = 0;
  _$jscoverage['/dialog.js'].lineData[282] = 0;
  _$jscoverage['/dialog.js'].lineData[283] = 0;
  _$jscoverage['/dialog.js'].lineData[284] = 0;
  _$jscoverage['/dialog.js'].lineData[285] = 0;
  _$jscoverage['/dialog.js'].lineData[286] = 0;
  _$jscoverage['/dialog.js'].lineData[287] = 0;
  _$jscoverage['/dialog.js'].lineData[288] = 0;
  _$jscoverage['/dialog.js'].lineData[291] = 0;
  _$jscoverage['/dialog.js'].lineData[297] = 0;
  _$jscoverage['/dialog.js'].lineData[298] = 0;
  _$jscoverage['/dialog.js'].lineData[302] = 0;
  _$jscoverage['/dialog.js'].lineData[303] = 0;
  _$jscoverage['/dialog.js'].lineData[304] = 0;
  _$jscoverage['/dialog.js'].lineData[305] = 0;
  _$jscoverage['/dialog.js'].lineData[308] = 0;
  _$jscoverage['/dialog.js'].lineData[311] = 0;
  _$jscoverage['/dialog.js'].lineData[312] = 0;
  _$jscoverage['/dialog.js'].lineData[313] = 0;
  _$jscoverage['/dialog.js'].lineData[314] = 0;
  _$jscoverage['/dialog.js'].lineData[317] = 0;
  _$jscoverage['/dialog.js'].lineData[318] = 0;
  _$jscoverage['/dialog.js'].lineData[319] = 0;
  _$jscoverage['/dialog.js'].lineData[320] = 0;
  _$jscoverage['/dialog.js'].lineData[323] = 0;
  _$jscoverage['/dialog.js'].lineData[325] = 0;
  _$jscoverage['/dialog.js'].lineData[326] = 0;
  _$jscoverage['/dialog.js'].lineData[327] = 0;
  _$jscoverage['/dialog.js'].lineData[328] = 0;
  _$jscoverage['/dialog.js'].lineData[331] = 0;
  _$jscoverage['/dialog.js'].lineData[334] = 0;
  _$jscoverage['/dialog.js'].lineData[336] = 0;
  _$jscoverage['/dialog.js'].lineData[337] = 0;
  _$jscoverage['/dialog.js'].lineData[338] = 0;
  _$jscoverage['/dialog.js'].lineData[339] = 0;
  _$jscoverage['/dialog.js'].lineData[340] = 0;
  _$jscoverage['/dialog.js'].lineData[341] = 0;
  _$jscoverage['/dialog.js'].lineData[344] = 0;
  _$jscoverage['/dialog.js'].lineData[345] = 0;
  _$jscoverage['/dialog.js'].lineData[346] = 0;
  _$jscoverage['/dialog.js'].lineData[349] = 0;
  _$jscoverage['/dialog.js'].lineData[353] = 0;
  _$jscoverage['/dialog.js'].lineData[354] = 0;
  _$jscoverage['/dialog.js'].lineData[355] = 0;
  _$jscoverage['/dialog.js'].lineData[357] = 0;
  _$jscoverage['/dialog.js'].lineData[363] = 0;
  _$jscoverage['/dialog.js'].lineData[364] = 0;
  _$jscoverage['/dialog.js'].lineData[365] = 0;
  _$jscoverage['/dialog.js'].lineData[367] = 0;
  _$jscoverage['/dialog.js'].lineData[368] = 0;
  _$jscoverage['/dialog.js'].lineData[369] = 0;
  _$jscoverage['/dialog.js'].lineData[371] = 0;
  _$jscoverage['/dialog.js'].lineData[372] = 0;
  _$jscoverage['/dialog.js'].lineData[373] = 0;
  _$jscoverage['/dialog.js'].lineData[375] = 0;
  _$jscoverage['/dialog.js'].lineData[377] = 0;
  _$jscoverage['/dialog.js'].lineData[378] = 0;
  _$jscoverage['/dialog.js'].lineData[380] = 0;
  _$jscoverage['/dialog.js'].lineData[381] = 0;
  _$jscoverage['/dialog.js'].lineData[382] = 0;
  _$jscoverage['/dialog.js'].lineData[384] = 0;
  _$jscoverage['/dialog.js'].lineData[389] = 0;
  _$jscoverage['/dialog.js'].lineData[390] = 0;
  _$jscoverage['/dialog.js'].lineData[391] = 0;
  _$jscoverage['/dialog.js'].lineData[392] = 0;
  _$jscoverage['/dialog.js'].lineData[395] = 0;
  _$jscoverage['/dialog.js'].lineData[398] = 0;
  _$jscoverage['/dialog.js'].lineData[403] = 0;
  _$jscoverage['/dialog.js'].lineData[404] = 0;
  _$jscoverage['/dialog.js'].lineData[408] = 0;
  _$jscoverage['/dialog.js'].lineData[412] = 0;
  _$jscoverage['/dialog.js'].lineData[413] = 0;
  _$jscoverage['/dialog.js'].lineData[414] = 0;
  _$jscoverage['/dialog.js'].lineData[418] = 0;
  _$jscoverage['/dialog.js'].lineData[419] = 0;
  _$jscoverage['/dialog.js'].lineData[420] = 0;
  _$jscoverage['/dialog.js'].lineData[422] = 0;
  _$jscoverage['/dialog.js'].lineData[423] = 0;
  _$jscoverage['/dialog.js'].lineData[424] = 0;
  _$jscoverage['/dialog.js'].lineData[428] = 0;
  _$jscoverage['/dialog.js'].lineData[429] = 0;
  _$jscoverage['/dialog.js'].lineData[432] = 0;
  _$jscoverage['/dialog.js'].lineData[435] = 0;
  _$jscoverage['/dialog.js'].lineData[440] = 0;
  _$jscoverage['/dialog.js'].lineData[441] = 0;
  _$jscoverage['/dialog.js'].lineData[443] = 0;
  _$jscoverage['/dialog.js'].lineData[447] = 0;
  _$jscoverage['/dialog.js'].lineData[448] = 0;
  _$jscoverage['/dialog.js'].lineData[449] = 0;
  _$jscoverage['/dialog.js'].lineData[450] = 0;
  _$jscoverage['/dialog.js'].lineData[452] = 0;
  _$jscoverage['/dialog.js'].lineData[453] = 0;
  _$jscoverage['/dialog.js'].lineData[454] = 0;
  _$jscoverage['/dialog.js'].lineData[455] = 0;
  _$jscoverage['/dialog.js'].lineData[462] = 0;
  _$jscoverage['/dialog.js'].lineData[465] = 0;
  _$jscoverage['/dialog.js'].lineData[466] = 0;
  _$jscoverage['/dialog.js'].lineData[467] = 0;
  _$jscoverage['/dialog.js'].lineData[468] = 0;
  _$jscoverage['/dialog.js'].lineData[473] = 0;
  _$jscoverage['/dialog.js'].lineData[475] = 0;
  _$jscoverage['/dialog.js'].lineData[476] = 0;
  _$jscoverage['/dialog.js'].lineData[477] = 0;
  _$jscoverage['/dialog.js'].lineData[480] = 0;
  _$jscoverage['/dialog.js'].lineData[487] = 0;
  _$jscoverage['/dialog.js'].lineData[488] = 0;
  _$jscoverage['/dialog.js'].lineData[489] = 0;
  _$jscoverage['/dialog.js'].lineData[494] = 0;
  _$jscoverage['/dialog.js'].lineData[495] = 0;
  _$jscoverage['/dialog.js'].lineData[496] = 0;
  _$jscoverage['/dialog.js'].lineData[498] = 0;
  _$jscoverage['/dialog.js'].lineData[499] = 0;
  _$jscoverage['/dialog.js'].lineData[501] = 0;
  _$jscoverage['/dialog.js'].lineData[502] = 0;
  _$jscoverage['/dialog.js'].lineData[507] = 0;
  _$jscoverage['/dialog.js'].lineData[509] = 0;
  _$jscoverage['/dialog.js'].lineData[510] = 0;
  _$jscoverage['/dialog.js'].lineData[511] = 0;
  _$jscoverage['/dialog.js'].lineData[512] = 0;
  _$jscoverage['/dialog.js'].lineData[515] = 0;
  _$jscoverage['/dialog.js'].lineData[519] = 0;
  _$jscoverage['/dialog.js'].lineData[523] = 0;
  _$jscoverage['/dialog.js'].lineData[527] = 0;
  _$jscoverage['/dialog.js'].lineData[528] = 0;
  _$jscoverage['/dialog.js'].lineData[529] = 0;
  _$jscoverage['/dialog.js'].lineData[530] = 0;
  _$jscoverage['/dialog.js'].lineData[531] = 0;
  _$jscoverage['/dialog.js'].lineData[537] = 0;
  _$jscoverage['/dialog.js'].lineData[538] = 0;
  _$jscoverage['/dialog.js'].lineData[539] = 0;
  _$jscoverage['/dialog.js'].lineData[540] = 0;
  _$jscoverage['/dialog.js'].lineData[541] = 0;
  _$jscoverage['/dialog.js'].lineData[544] = 0;
  _$jscoverage['/dialog.js'].lineData[548] = 0;
  _$jscoverage['/dialog.js'].lineData[549] = 0;
  _$jscoverage['/dialog.js'].lineData[550] = 0;
  _$jscoverage['/dialog.js'].lineData[552] = 0;
  _$jscoverage['/dialog.js'].lineData[553] = 0;
  _$jscoverage['/dialog.js'].lineData[555] = 0;
  _$jscoverage['/dialog.js'].lineData[556] = 0;
  _$jscoverage['/dialog.js'].lineData[557] = 0;
  _$jscoverage['/dialog.js'].lineData[558] = 0;
  _$jscoverage['/dialog.js'].lineData[560] = 0;
  _$jscoverage['/dialog.js'].lineData[565] = 0;
  _$jscoverage['/dialog.js'].lineData[569] = 0;
  _$jscoverage['/dialog.js'].lineData[572] = 0;
  _$jscoverage['/dialog.js'].lineData[573] = 0;
  _$jscoverage['/dialog.js'].lineData[574] = 0;
  _$jscoverage['/dialog.js'].lineData[575] = 0;
  _$jscoverage['/dialog.js'].lineData[576] = 0;
  _$jscoverage['/dialog.js'].lineData[577] = 0;
  _$jscoverage['/dialog.js'].lineData[578] = 0;
  _$jscoverage['/dialog.js'].lineData[579] = 0;
  _$jscoverage['/dialog.js'].lineData[581] = 0;
  _$jscoverage['/dialog.js'].lineData[582] = 0;
  _$jscoverage['/dialog.js'].lineData[583] = 0;
  _$jscoverage['/dialog.js'].lineData[587] = 0;
  _$jscoverage['/dialog.js'].lineData[588] = 0;
  _$jscoverage['/dialog.js'].lineData[589] = 0;
  _$jscoverage['/dialog.js'].lineData[590] = 0;
  _$jscoverage['/dialog.js'].lineData[593] = 0;
  _$jscoverage['/dialog.js'].lineData[597] = 0;
  _$jscoverage['/dialog.js'].lineData[598] = 0;
  _$jscoverage['/dialog.js'].lineData[599] = 0;
  _$jscoverage['/dialog.js'].lineData[601] = 0;
  _$jscoverage['/dialog.js'].lineData[602] = 0;
  _$jscoverage['/dialog.js'].lineData[604] = 0;
  _$jscoverage['/dialog.js'].lineData[612] = 0;
  _$jscoverage['/dialog.js'].lineData[616] = 0;
  _$jscoverage['/dialog.js'].lineData[617] = 0;
  _$jscoverage['/dialog.js'].lineData[619] = 0;
  _$jscoverage['/dialog.js'].lineData[621] = 0;
  _$jscoverage['/dialog.js'].lineData[651] = 0;
  _$jscoverage['/dialog.js'].lineData[656] = 0;
  _$jscoverage['/dialog.js'].lineData[657] = 0;
  _$jscoverage['/dialog.js'].lineData[658] = 0;
  _$jscoverage['/dialog.js'].lineData[659] = 0;
  _$jscoverage['/dialog.js'].lineData[660] = 0;
  _$jscoverage['/dialog.js'].lineData[661] = 0;
  _$jscoverage['/dialog.js'].lineData[662] = 0;
  _$jscoverage['/dialog.js'].lineData[664] = 0;
  _$jscoverage['/dialog.js'].lineData[665] = 0;
  _$jscoverage['/dialog.js'].lineData[666] = 0;
  _$jscoverage['/dialog.js'].lineData[667] = 0;
  _$jscoverage['/dialog.js'].lineData[668] = 0;
  _$jscoverage['/dialog.js'].lineData[669] = 0;
  _$jscoverage['/dialog.js'].lineData[670] = 0;
  _$jscoverage['/dialog.js'].lineData[671] = 0;
  _$jscoverage['/dialog.js'].lineData[672] = 0;
  _$jscoverage['/dialog.js'].lineData[684] = 0;
  _$jscoverage['/dialog.js'].lineData[686] = 0;
  _$jscoverage['/dialog.js'].lineData[687] = 0;
  _$jscoverage['/dialog.js'].lineData[693] = 0;
  _$jscoverage['/dialog.js'].lineData[696] = 0;
  _$jscoverage['/dialog.js'].lineData[702] = 0;
  _$jscoverage['/dialog.js'].lineData[703] = 0;
  _$jscoverage['/dialog.js'].lineData[707] = 0;
  _$jscoverage['/dialog.js'].lineData[710] = 0;
  _$jscoverage['/dialog.js'].lineData[718] = 0;
  _$jscoverage['/dialog.js'].lineData[720] = 0;
  _$jscoverage['/dialog.js'].lineData[721] = 0;
  _$jscoverage['/dialog.js'].lineData[722] = 0;
  _$jscoverage['/dialog.js'].lineData[723] = 0;
  _$jscoverage['/dialog.js'].lineData[726] = 0;
  _$jscoverage['/dialog.js'].lineData[728] = 0;
  _$jscoverage['/dialog.js'].lineData[730] = 0;
  _$jscoverage['/dialog.js'].lineData[731] = 0;
  _$jscoverage['/dialog.js'].lineData[734] = 0;
  _$jscoverage['/dialog.js'].lineData[735] = 0;
  _$jscoverage['/dialog.js'].lineData[738] = 0;
  _$jscoverage['/dialog.js'].lineData[739] = 0;
  _$jscoverage['/dialog.js'].lineData[742] = 0;
  _$jscoverage['/dialog.js'].lineData[744] = 0;
  _$jscoverage['/dialog.js'].lineData[745] = 0;
  _$jscoverage['/dialog.js'].lineData[749] = 0;
  _$jscoverage['/dialog.js'].lineData[751] = 0;
  _$jscoverage['/dialog.js'].lineData[752] = 0;
  _$jscoverage['/dialog.js'].lineData[754] = 0;
  _$jscoverage['/dialog.js'].lineData[760] = 0;
  _$jscoverage['/dialog.js'].lineData[765] = 0;
  _$jscoverage['/dialog.js'].lineData[771] = 0;
  _$jscoverage['/dialog.js'].lineData[772] = 0;
  _$jscoverage['/dialog.js'].lineData[773] = 0;
  _$jscoverage['/dialog.js'].lineData[777] = 0;
  _$jscoverage['/dialog.js'].lineData[781] = 0;
  _$jscoverage['/dialog.js'].lineData[783] = 0;
  _$jscoverage['/dialog.js'].lineData[784] = 0;
  _$jscoverage['/dialog.js'].lineData[785] = 0;
  _$jscoverage['/dialog.js'].lineData[786] = 0;
  _$jscoverage['/dialog.js'].lineData[792] = 0;
  _$jscoverage['/dialog.js'].lineData[793] = 0;
  _$jscoverage['/dialog.js'].lineData[794] = 0;
  _$jscoverage['/dialog.js'].lineData[798] = 0;
  _$jscoverage['/dialog.js'].lineData[800] = 0;
  _$jscoverage['/dialog.js'].lineData[804] = 0;
}
if (! _$jscoverage['/dialog.js'].functionData) {
  _$jscoverage['/dialog.js'].functionData = [];
  _$jscoverage['/dialog.js'].functionData[0] = 0;
  _$jscoverage['/dialog.js'].functionData[1] = 0;
  _$jscoverage['/dialog.js'].functionData[2] = 0;
  _$jscoverage['/dialog.js'].functionData[3] = 0;
  _$jscoverage['/dialog.js'].functionData[4] = 0;
  _$jscoverage['/dialog.js'].functionData[5] = 0;
  _$jscoverage['/dialog.js'].functionData[6] = 0;
  _$jscoverage['/dialog.js'].functionData[7] = 0;
  _$jscoverage['/dialog.js'].functionData[8] = 0;
  _$jscoverage['/dialog.js'].functionData[9] = 0;
  _$jscoverage['/dialog.js'].functionData[10] = 0;
  _$jscoverage['/dialog.js'].functionData[11] = 0;
  _$jscoverage['/dialog.js'].functionData[12] = 0;
  _$jscoverage['/dialog.js'].functionData[13] = 0;
  _$jscoverage['/dialog.js'].functionData[14] = 0;
  _$jscoverage['/dialog.js'].functionData[15] = 0;
  _$jscoverage['/dialog.js'].functionData[16] = 0;
  _$jscoverage['/dialog.js'].functionData[17] = 0;
  _$jscoverage['/dialog.js'].functionData[18] = 0;
  _$jscoverage['/dialog.js'].functionData[19] = 0;
  _$jscoverage['/dialog.js'].functionData[20] = 0;
  _$jscoverage['/dialog.js'].functionData[21] = 0;
  _$jscoverage['/dialog.js'].functionData[22] = 0;
  _$jscoverage['/dialog.js'].functionData[23] = 0;
  _$jscoverage['/dialog.js'].functionData[24] = 0;
  _$jscoverage['/dialog.js'].functionData[25] = 0;
  _$jscoverage['/dialog.js'].functionData[26] = 0;
  _$jscoverage['/dialog.js'].functionData[27] = 0;
  _$jscoverage['/dialog.js'].functionData[28] = 0;
  _$jscoverage['/dialog.js'].functionData[29] = 0;
  _$jscoverage['/dialog.js'].functionData[30] = 0;
  _$jscoverage['/dialog.js'].functionData[31] = 0;
  _$jscoverage['/dialog.js'].functionData[32] = 0;
  _$jscoverage['/dialog.js'].functionData[33] = 0;
  _$jscoverage['/dialog.js'].functionData[34] = 0;
  _$jscoverage['/dialog.js'].functionData[35] = 0;
}
if (! _$jscoverage['/dialog.js'].branchData) {
  _$jscoverage['/dialog.js'].branchData = {};
  _$jscoverage['/dialog.js'].branchData['86'] = [];
  _$jscoverage['/dialog.js'].branchData['86'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['160'] = [];
  _$jscoverage['/dialog.js'].branchData['160'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['161'] = [];
  _$jscoverage['/dialog.js'].branchData['161'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['169'] = [];
  _$jscoverage['/dialog.js'].branchData['169'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['178'] = [];
  _$jscoverage['/dialog.js'].branchData['178'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['181'] = [];
  _$jscoverage['/dialog.js'].branchData['181'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['189'] = [];
  _$jscoverage['/dialog.js'].branchData['189'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['190'] = [];
  _$jscoverage['/dialog.js'].branchData['190'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['251'] = [];
  _$jscoverage['/dialog.js'].branchData['251'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['254'] = [];
  _$jscoverage['/dialog.js'].branchData['254'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['262'] = [];
  _$jscoverage['/dialog.js'].branchData['262'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['272'] = [];
  _$jscoverage['/dialog.js'].branchData['272'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['284'] = [];
  _$jscoverage['/dialog.js'].branchData['284'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['292'] = [];
  _$jscoverage['/dialog.js'].branchData['292'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['302'] = [];
  _$jscoverage['/dialog.js'].branchData['302'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['312'] = [];
  _$jscoverage['/dialog.js'].branchData['312'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['317'] = [];
  _$jscoverage['/dialog.js'].branchData['317'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['326'] = [];
  _$jscoverage['/dialog.js'].branchData['326'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['344'] = [];
  _$jscoverage['/dialog.js'].branchData['344'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['355'] = [];
  _$jscoverage['/dialog.js'].branchData['355'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['371'] = [];
  _$jscoverage['/dialog.js'].branchData['371'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['373'] = [];
  _$jscoverage['/dialog.js'].branchData['373'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['377'] = [];
  _$jscoverage['/dialog.js'].branchData['377'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['378'] = [];
  _$jscoverage['/dialog.js'].branchData['378'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['381'] = [];
  _$jscoverage['/dialog.js'].branchData['381'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['403'] = [];
  _$jscoverage['/dialog.js'].branchData['403'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['403'][2] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['412'] = [];
  _$jscoverage['/dialog.js'].branchData['412'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['418'] = [];
  _$jscoverage['/dialog.js'].branchData['418'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['439'] = [];
  _$jscoverage['/dialog.js'].branchData['439'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['439'][2] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['440'] = [];
  _$jscoverage['/dialog.js'].branchData['440'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['448'] = [];
  _$jscoverage['/dialog.js'].branchData['448'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['452'] = [];
  _$jscoverage['/dialog.js'].branchData['452'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['453'] = [];
  _$jscoverage['/dialog.js'].branchData['453'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['465'] = [];
  _$jscoverage['/dialog.js'].branchData['465'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['467'] = [];
  _$jscoverage['/dialog.js'].branchData['467'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['474'] = [];
  _$jscoverage['/dialog.js'].branchData['474'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['474'][2] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['487'] = [];
  _$jscoverage['/dialog.js'].branchData['487'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['494'] = [];
  _$jscoverage['/dialog.js'].branchData['494'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['501'] = [];
  _$jscoverage['/dialog.js'].branchData['501'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['510'] = [];
  _$jscoverage['/dialog.js'].branchData['510'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['523'] = [];
  _$jscoverage['/dialog.js'].branchData['523'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['549'] = [];
  _$jscoverage['/dialog.js'].branchData['549'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['556'] = [];
  _$jscoverage['/dialog.js'].branchData['556'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['558'] = [];
  _$jscoverage['/dialog.js'].branchData['558'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['572'] = [];
  _$jscoverage['/dialog.js'].branchData['572'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['574'] = [];
  _$jscoverage['/dialog.js'].branchData['574'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['581'] = [];
  _$jscoverage['/dialog.js'].branchData['581'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['598'] = [];
  _$jscoverage['/dialog.js'].branchData['598'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['601'] = [];
  _$jscoverage['/dialog.js'].branchData['601'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['661'] = [];
  _$jscoverage['/dialog.js'].branchData['661'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['686'] = [];
  _$jscoverage['/dialog.js'].branchData['686'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['702'] = [];
  _$jscoverage['/dialog.js'].branchData['702'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['718'] = [];
  _$jscoverage['/dialog.js'].branchData['718'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['721'] = [];
  _$jscoverage['/dialog.js'].branchData['721'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['723'] = [];
  _$jscoverage['/dialog.js'].branchData['723'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['723'][2] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['730'] = [];
  _$jscoverage['/dialog.js'].branchData['730'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['734'] = [];
  _$jscoverage['/dialog.js'].branchData['734'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['749'] = [];
  _$jscoverage['/dialog.js'].branchData['749'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['772'] = [];
  _$jscoverage['/dialog.js'].branchData['772'][1] = new BranchData();
}
_$jscoverage['/dialog.js'].branchData['772'][1].init(312, 33, '"ready" != uploader[\'getReady\']()');
function visit63_772_1(result) {
  _$jscoverage['/dialog.js'].branchData['772'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['749'][1].init(195, 18, 'curNum > available');
function visit62_749_1(result) {
  _$jscoverage['/dialog.js'].branchData['749'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['734'][1].init(589, 14, 'l >= available');
function visit61_734_1(result) {
  _$jscoverage['/dialog.js'].branchData['734'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['730'][1].init(447, 13, 'l > available');
function visit60_730_1(result) {
  _$jscoverage['/dialog.js'].branchData['730'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['723'][2].init(94, 33, 'files[fid] && (delete files[fid])');
function visit59_723_2(result) {
  _$jscoverage['/dialog.js'].branchData['723'][2].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['723'][1].init(87, 40, 'fid && files[fid] && (delete files[fid])');
function visit58_723_1(result) {
  _$jscoverage['/dialog.js'].branchData['723'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['721'][1].init(111, 14, 'i < trs.length');
function visit57_721_1(result) {
  _$jscoverage['/dialog.js'].branchData['721'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['718'][1].init(287, 5, 'files');
function visit56_718_1(result) {
  _$jscoverage['/dialog.js'].branchData['718'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['702'][1].init(336, 10, 'f.complete');
function visit55_702_1(result) {
  _$jscoverage['/dialog.js'].branchData['702'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['686'][1].init(2630, 34, 'parseInt(f.size) > self._sizeLimit');
function visit54_686_1(result) {
  _$jscoverage['/dialog.js'].branchData['686'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['661'][1].init(1299, 18, 'f.name.length > 18');
function visit53_661_1(result) {
  _$jscoverage['/dialog.js'].branchData['661'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['601'][1].init(102, 3, 'url');
function visit52_601_1(result) {
  _$jscoverage['/dialog.js'].branchData['601'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['598'][1].init(222, 14, 'i < trs.length');
function visit51_598_1(result) {
  _$jscoverage['/dialog.js'].branchData['598'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['581'][1].init(496, 1, 'd');
function visit50_581_1(result) {
  _$jscoverage['/dialog.js'].branchData['581'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['574'][1].init(233, 15, 'i < data.length');
function visit49_574_1(result) {
  _$jscoverage['/dialog.js'].branchData['574'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['572'][1].init(137, 5, '!data');
function visit48_572_1(result) {
  _$jscoverage['/dialog.js'].branchData['572'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['558'][1].init(67, 15, '!tr.attr("url")');
function visit47_558_1(result) {
  _$jscoverage['/dialog.js'].branchData['558'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['556'][1].init(227, 14, 'i < trs.length');
function visit46_556_1(result) {
  _$jscoverage['/dialog.js'].branchData['556'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['549'][1].init(208, 15, 'trs.length == 0');
function visit45_549_1(result) {
  _$jscoverage['/dialog.js'].branchData['549'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['523'][1].init(228, 35, 'bar && bar.set("progress", progess)');
function visit44_523_1(result) {
  _$jscoverage['/dialog.js'].branchData['523'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['510'][1].init(965, 2, 'tr');
function visit43_510_1(result) {
  _$jscoverage['/dialog.js'].branchData['510'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['501'][1].init(691, 10, 'data.error');
function visit42_501_1(result) {
  _$jscoverage['/dialog.js'].branchData['501'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['494'][1].init(446, 5, '!data');
function visit41_494_1(result) {
  _$jscoverage['/dialog.js'].branchData['494'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['487'][1].init(284, 2, 'id');
function visit40_487_1(result) {
  _$jscoverage['/dialog.js'].branchData['487'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['474'][2].init(48, 27, 'ev[\'file\'] && ev[\'file\'].id');
function visit39_474_2(result) {
  _$jscoverage['/dialog.js'].branchData['474'][2].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['474'][1].init(38, 38, 'ev.id || (ev[\'file\'] && ev[\'file\'].id)');
function visit38_474_1(result) {
  _$jscoverage['/dialog.js'].branchData['474'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['467'][1].init(59, 20, 'tr.attr("fid") == id');
function visit37_467_1(result) {
  _$jscoverage['/dialog.js'].branchData['467'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['465'][1].init(135, 14, 'i < trs.length');
function visit36_465_1(result) {
  _$jscoverage['/dialog.js'].branchData['465'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['453'][1].init(18, 20, 'bar && bar.destroy()');
function visit35_453_1(result) {
  _$jscoverage['/dialog.js'].branchData['453'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['452'][1].init(618, 2, 'tr');
function visit34_452_1(result) {
  _$jscoverage['/dialog.js'].branchData['452'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['448'][1].init(491, 11, '!ev._custom');
function visit33_448_1(result) {
  _$jscoverage['/dialog.js'].branchData['448'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['440'][1].init(263, 3, '!id');
function visit32_440_1(result) {
  _$jscoverage['/dialog.js'].branchData['440'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['439'][2].init(201, 27, 'ev[\'file\'] && ev[\'file\'].id');
function visit31_439_2(result) {
  _$jscoverage['/dialog.js'].branchData['439'][2].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['439'][1].init(191, 38, 'ev.id || (ev[\'file\'] && ev[\'file\'].id)');
function visit30_439_1(result) {
  _$jscoverage['/dialog.js'].branchData['439'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['418'][1].init(343, 17, 'progressBars[fid]');
function visit29_418_1(result) {
  _$jscoverage['/dialog.js'].branchData['418'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['412'][1].init(181, 3, 'fid');
function visit28_412_1(result) {
  _$jscoverage['/dialog.js'].branchData['412'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['403'][2].init(14326, 26, 'Editor.Utils.ieEngine != 9');
function visit27_403_2(result) {
  _$jscoverage['/dialog.js'].branchData['403'][2].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['403'][1].init(14309, 43, '!UA[\'webkit\'] && Editor.Utils.ieEngine != 9');
function visit26_403_1(result) {
  _$jscoverage['/dialog.js'].branchData['403'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['381'][1].init(89, 13, 'previewSuffix');
function visit25_381_1(result) {
  _$jscoverage['/dialog.js'].branchData['381'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['378'][1].init(191, 17, 'fid == currentFid');
function visit24_378_1(result) {
  _$jscoverage['/dialog.js'].branchData['378'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['377'][1].init(144, 4, '!url');
function visit23_377_1(result) {
  _$jscoverage['/dialog.js'].branchData['377'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['373'][1].init(81, 114, 'tr.hasClass(replacePrefix("{prefixCls}editor-upload-complete", prefixCls), undefined)');
function visit22_373_1(result) {
  _$jscoverage['/dialog.js'].branchData['373'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['371'][1].init(173, 2, 'td');
function visit21_371_1(result) {
  _$jscoverage['/dialog.js'].branchData['371'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['355'][1].init(12129, 12, 'previewWidth');
function visit20_355_1(result) {
  _$jscoverage['/dialog.js'].branchData['355'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['344'][1].init(11763, 18, 'localStorage.ready');
function visit19_344_1(result) {
  _$jscoverage['/dialog.js'].branchData['344'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['326'][1].init(392, 4, 'next');
function visit18_326_1(result) {
  _$jscoverage['/dialog.js'].branchData['326'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['317'][1].init(1618, 89, 'target.hasClass(replacePrefix("{prefixCls}editor-upload-movedown", prefixCls), undefined)');
function visit17_317_1(result) {
  _$jscoverage['/dialog.js'].branchData['317'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['312'][1].init(413, 3, 'pre');
function visit16_312_1(result) {
  _$jscoverage['/dialog.js'].branchData['312'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['302'][1].init(959, 87, 'target.hasClass(replacePrefix("{prefixCls}editor-upload-moveup", prefixCls), undefined)');
function visit15_302_1(result) {
  _$jscoverage['/dialog.js'].branchData['302'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['292'][1].init(25, 254, 'target.hasClass(replacePrefix("{prefixCls}editor-upload-delete", prefixCls), undefined) || target.hasClass(replacePrefix("{prefixCls}editor-upload-insert", prefixCls), undefined)');
function visit14_292_1(result) {
  _$jscoverage['/dialog.js'].branchData['292'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['284'][1].init(98, 87, 'target.hasClass(replacePrefix("{prefixCls}editor-upload-insert", prefixCls), undefined)');
function visit13_284_1(result) {
  _$jscoverage['/dialog.js'].branchData['284'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['272'][1].init(77, 14, 'i < trs.length');
function visit12_272_1(result) {
  _$jscoverage['/dialog.js'].branchData['272'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['262'][1].init(584, 3, 'url');
function visit11_262_1(result) {
  _$jscoverage['/dialog.js'].branchData['262'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['254'][1].init(114, 3, 'url');
function visit10_254_1(result) {
  _$jscoverage['/dialog.js'].branchData['254'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['251'][1].init(77, 14, 'i < trs.length');
function visit9_251_1(result) {
  _$jscoverage['/dialog.js'].branchData['251'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['190'][1].init(5666, 36, 'uploadCfg[\'fileInput\'] || "Filedata"');
function visit8_190_1(result) {
  _$jscoverage['/dialog.js'].branchData['190'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['189'][1].init(5602, 31, 'uploadCfg[\'serverParams\'] || {}');
function visit7_189_1(result) {
  _$jscoverage['/dialog.js'].branchData['189'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['181'][1].init(5295, 22, 'uploadCfg[\'extraHTML\']');
function visit6_181_1(result) {
  _$jscoverage['/dialog.js'].branchData['181'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['178'][1].init(5199, 35, '!SWF.fpvGTE(FLASH_VERSION_REQUIRED)');
function visit5_178_1(result) {
  _$jscoverage['/dialog.js'].branchData['178'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['169'][1].init(4765, 35, '!SWF.fpvGTE(FLASH_VERSION_REQUIRED)');
function visit4_169_1(result) {
  _$jscoverage['/dialog.js'].branchData['169'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['161'][1].init(4529, 41, 'uploadCfg[\'numberLimit\'] || PIC_NUM_LIMIT');
function visit3_161_1(result) {
  _$jscoverage['/dialog.js'].branchData['161'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['160'][1].init(4454, 40, 'uploadCfg[\'sizeLimit\'] || PIC_SIZE_LIMIT');
function visit2_160_1(result) {
  _$jscoverage['/dialog.js'].branchData['160'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['86'][1].init(22, 10, '!ev.newVal');
function visit1_86_1(result) {
  _$jscoverage['/dialog.js'].branchData['86'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].lineData[6]++;
KISSY.add("editor/plugin/multiple-upload/dialog", function(S, Editor, Overlay, DragPlugin, ProgressBar, Dialog4E, FlashBridge, localStorage, SWF, undefined) {
  _$jscoverage['/dialog.js'].functionData[0]++;
  _$jscoverage['/dialog.js'].lineData[11]++;
  var UA = S.UA, logger = S.getLogger('s/editor/plugin/multiple-upload/dialog'), Dom = S.DOM, $ = S.all, Json = S.JSON, PIC_NUM_LIMIT = 15, PIC_NUM_LIMIT_WARNING = "\u7cfb\u7edf\u5c06\u53ea\u4fdd\u7559 n \u5f20", PIC_SIZE_LIMIT = 1000, PIC_SIZE_LIMIT_WARNING = "\u56fe\u7247\u592a\u5927\uff0c\u8bf7\u538b\u7f29\u81f3 n M\u4ee5\u4e0b", KEY = "Multiple-Upload-Save", swfSrc = Editor.Utils.debugUrl("plugin/uploader/assets/uploader.longzang.swf"), name = "ks-editor-multipleUpload", FLASH_VERSION_REQUIRED = "10.0.0";
  _$jscoverage['/dialog.js'].lineData[25]++;
  function MultiUploadDialog(editor, config) {
    _$jscoverage['/dialog.js'].functionData[1]++;
    _$jscoverage['/dialog.js'].lineData[26]++;
    this.editor = editor;
    _$jscoverage['/dialog.js'].lineData[27]++;
    this.progressBars = {};
    _$jscoverage['/dialog.js'].lineData[28]++;
    this.config = config;
    _$jscoverage['/dialog.js'].lineData[29]++;
    Editor.Utils.lazyRun(this, "_prepareShow", "_realShow");
  }
  _$jscoverage['/dialog.js'].lineData[32]++;
  function replacePrefix(str, prefix) {
    _$jscoverage['/dialog.js'].functionData[2]++;
    _$jscoverage['/dialog.js'].lineData[33]++;
    return S.substitute(str, {
  prefixCls: prefix});
  }
  _$jscoverage['/dialog.js'].lineData[39]++;
  function swapNode(node1, node2) {
    _$jscoverage['/dialog.js'].functionData[3]++;
    _$jscoverage['/dialog.js'].lineData[41]++;
    var _parent = node1.parentNode;
    _$jscoverage['/dialog.js'].lineData[43]++;
    var _t1 = node1.nextSibling;
    _$jscoverage['/dialog.js'].lineData[44]++;
    var _t2 = node2.nextSibling;
    _$jscoverage['/dialog.js'].lineData[46]++;
    _parent.insertBefore(node2, _t1);
    _$jscoverage['/dialog.js'].lineData[48]++;
    _parent.insertBefore(node1, _t2);
  }
  _$jscoverage['/dialog.js'].lineData[51]++;
  S.augment(MultiUploadDialog, {
  addRes: Editor.Utils.addRes, 
  destroy: Editor.Utils.destroyRes, 
  _prepareShow: function() {
  _$jscoverage['/dialog.js'].functionData[4]++;
  _$jscoverage['/dialog.js'].lineData[55]++;
  var self = this, editor = self.editor, prefixCls = editor.get('prefixCls'), uploadCfg = self.config;
  _$jscoverage['/dialog.js'].lineData[60]++;
  self.addRes(function() {
  _$jscoverage['/dialog.js'].functionData[5]++;
  _$jscoverage['/dialog.js'].lineData[61]++;
  var progressBars = self.progressBars;
  _$jscoverage['/dialog.js'].lineData[62]++;
  for (var p in progressBars) {
    _$jscoverage['/dialog.js'].lineData[64]++;
    progressBars[p].destroy();
  }
});
  _$jscoverage['/dialog.js'].lineData[69]++;
  self.dialog = new Dialog4E({
  headerContent: "\u6279\u91cf\u4e0a\u4f20", 
  mask: false, 
  plugins: [new DragPlugin({
  handlers: ['.ks-editor-dialog-header']})], 
  focus4e: false, 
  width: "600px"}).render();
  _$jscoverage['/dialog.js'].lineData[80]++;
  var d = self.dialog;
  _$jscoverage['/dialog.js'].lineData[85]++;
  d.on("beforeVisibleChange", function(ev) {
  _$jscoverage['/dialog.js'].functionData[6]++;
  _$jscoverage['/dialog.js'].lineData[86]++;
  if (visit1_86_1(!ev.newVal)) {
    _$jscoverage['/dialog.js'].lineData[87]++;
    d.move(-9999, -9999);
    _$jscoverage['/dialog.js'].lineData[88]++;
    return false;
  }
});
  _$jscoverage['/dialog.js'].lineData[92]++;
  self.addRes(d);
  _$jscoverage['/dialog.js'].lineData[94]++;
  var multipleUploaderHolder = d.get("body"), btnHolder = $(replacePrefix("<div class='{prefixCls}editor-upload-btn-wrap'>" + "<span " + "style='" + "margin:0 15px 0 0px;" + "color:#969696;" + "display:inline-block;" + "vertical-align:middle;" + "width:450px;" + "'></span>" + "</div>", prefixCls)).appendTo(multipleUploaderHolder, undefined), listWrap = $("<div style='display:none'>").appendTo(multipleUploaderHolder, undefined), btn = $(replacePrefix("<a class='{prefixCls}editor-button ks-inline-block'>" + "\u6d4f&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;\u89c8</a>", prefixCls)).appendTo(btnHolder, undefined), listTableWrap = $(replacePrefix("<div>" + "<table class='{prefixCls}editor-upload-list'>" + "<thead>" + "<tr>" + "<th style='width:30px;'>" + "\u5e8f\u53f7" + "</th>" + "<th>" + "\u56fe\u7247" + "</th>" + "<th>" + "\u5927\u5c0f" + "</th>" + "<th style='width:30%'>" + "\u4e0a\u4f20\u8fdb\u5ea6" + "</th>" + "<th>" + "\u56fe\u7247\u64cd\u4f5c" + "</th>" + "</tr>" + "</thead>" + "<tbody>" + "</tbody>" + "</table>" + "</div>", prefixCls)).appendTo(listWrap, undefined), list = listTableWrap.one("tbody"), upHolder = $(replacePrefix("<p " + "style='" + "margin:15px 15px 30px 6px;" + "'>" + "<a class='{prefixCls}editor-multiple-upload-delall'" + " style='" + "margin-right:20px;" + "cursor:pointer;" + "margin-left:40px;" + "'>\u6e05\u7a7a\u5217\u8868</a>" + "<a class='{prefixCls}editor-button {prefixCls}editor-multiple-upload-ok ks-inline-block'>\u786e\u5b9a\u4e0a\u4f20</a>" + "<a class='{prefixCls}editor-button {prefixCls}editor-multiple-upload-insertall ks-inline-block'" + " style='margin-left:20px;'>\u5168\u90e8\u63d2\u5165</a>" + "</p>", prefixCls)).appendTo(listWrap, undefined), up = upHolder.one(replacePrefix(".{prefixCls}editor-multiple-upload-ok", prefixCls)), insertAll = upHolder.one(replacePrefix(".{prefixCls}editor-multiple-upload-insertall", prefixCls)), delAll = upHolder.one(replacePrefix(".{prefixCls}editor-multiple-upload-delall", prefixCls)), fid = S.guid(name), statusText = $("<span>").prependTo(upHolder, undefined);
  _$jscoverage['/dialog.js'].lineData[160]++;
  self._sizeLimit = visit2_160_1(uploadCfg['sizeLimit'] || PIC_SIZE_LIMIT);
  _$jscoverage['/dialog.js'].lineData[161]++;
  self._numberLimit = visit3_161_1(uploadCfg['numberLimit'] || PIC_NUM_LIMIT);
  _$jscoverage['/dialog.js'].lineData[163]++;
  var TIP = "\u5141\u8bb8\u7528\u6237\u540c\u65f6\u4e0a\u4f20" + self._numberLimit + "\u5f20\u56fe\u7247\uff0c\u5355\u5f20\u56fe\u7247\u5bb9\u91cf\u4e0d\u8d85\u8fc7" + self._sizeLimit / 1000 + "M";
  _$jscoverage['/dialog.js'].lineData[169]++;
  if (visit4_169_1(!SWF.fpvGTE(FLASH_VERSION_REQUIRED))) {
    _$jscoverage['/dialog.js'].lineData[170]++;
    TIP = "\u60a8\u7684flash\u63d2\u4ef6\u7248\u672c\u8fc7\u4f4e\uff0c\u8be5\u529f\u80fd\u4e0d\u53ef\u7528\uff0c" + "\u8bf7<a href='http://get.adobe.com/cn/flashplayer/'" + " target='_blank'>\u70b9\u6b64\u5347\u7ea7</a>";
  }
  _$jscoverage['/dialog.js'].lineData[175]++;
  btn.addClass(replacePrefix("{prefixCls}editor-button-disabled", prefixCls), undefined);
  _$jscoverage['/dialog.js'].lineData[176]++;
  self.tipSpan = btnHolder.one("span");
  _$jscoverage['/dialog.js'].lineData[177]++;
  self.tipSpan.html(TIP);
  _$jscoverage['/dialog.js'].lineData[178]++;
  if (visit5_178_1(!SWF.fpvGTE(FLASH_VERSION_REQUIRED))) {
    _$jscoverage['/dialog.js'].lineData[179]++;
    return;
  }
  _$jscoverage['/dialog.js'].lineData[181]++;
  if (visit6_181_1(uploadCfg['extraHTML'])) {
    _$jscoverage['/dialog.js'].lineData[182]++;
    listTableWrap.append(uploadCfg['extraHTML']);
  }
  _$jscoverage['/dialog.js'].lineData[185]++;
  self._list = list;
  _$jscoverage['/dialog.js'].lineData[186]++;
  self['_listTable'] = list.parent("table");
  _$jscoverage['/dialog.js'].lineData[187]++;
  self._listWrap = listWrap;
  _$jscoverage['/dialog.js'].lineData[188]++;
  self._ds = uploadCfg['serverUrl'];
  _$jscoverage['/dialog.js'].lineData[189]++;
  self._dsp = visit7_189_1(uploadCfg['serverParams'] || {});
  _$jscoverage['/dialog.js'].lineData[190]++;
  self._fileInput = visit8_190_1(uploadCfg['fileInput'] || "Filedata");
  _$jscoverage['/dialog.js'].lineData[191]++;
  self.statusText = statusText;
  _$jscoverage['/dialog.js'].lineData[192]++;
  self.btn = btn;
  _$jscoverage['/dialog.js'].lineData[193]++;
  self.up = up;
  _$jscoverage['/dialog.js'].lineData[196]++;
  var bel = btn, boffset = bel.offset(), fwidth = bel.width() * 2, fheight = bel.height() * 1.5, flashPos = $("<div style='" + ("position:absolute;" + "width:" + fwidth + "px;" + "height:" + fheight + "px;" + "z-index:" + Editor.baseZIndex(9999) + ";") + "'>").appendTo(btnHolder, undefined);
  _$jscoverage['/dialog.js'].lineData[208]++;
  flashPos.offset(boffset);
  _$jscoverage['/dialog.js'].lineData[209]++;
  self.flashPos = flashPos;
  _$jscoverage['/dialog.js'].lineData[210]++;
  var uploader = new FlashBridge({
  src: swfSrc, 
  ajbridge: true, 
  methods: ["getReady", "removeFile", "lock", "unlock", "setAllowMultipleFiles", "setFileFilters", "uploadAll"], 
  render: flashPos, 
  attrs: {
  width: fwidth, 
  height: fheight}, 
  params: {
  wmode: "transparent", 
  flashVars: {
  "allowedDomain": location.hostname, 
  btn: true, 
  "hand": true}}});
  _$jscoverage['/dialog.js'].lineData[237]++;
  self.uploader = uploader;
  _$jscoverage['/dialog.js'].lineData[239]++;
  uploader.on("mouseOver", function() {
  _$jscoverage['/dialog.js'].functionData[7]++;
  _$jscoverage['/dialog.js'].lineData[240]++;
  bel.addClass(replacePrefix("{prefixCls}editor-button-hover", prefixCls), undefined);
});
  _$jscoverage['/dialog.js'].lineData[242]++;
  uploader.on("mouseOut", function() {
  _$jscoverage['/dialog.js'].functionData[8]++;
  _$jscoverage['/dialog.js'].lineData[243]++;
  bel.removeClass(replacePrefix("{prefixCls}editor-button-hover", prefixCls), undefined);
});
  _$jscoverage['/dialog.js'].lineData[245]++;
  self.addRes(uploader);
  _$jscoverage['/dialog.js'].lineData[247]++;
  var editorDoc = editor.get("document")[0];
  _$jscoverage['/dialog.js'].lineData[249]++;
  insertAll.on("click", function(ev) {
  _$jscoverage['/dialog.js'].functionData[9]++;
  _$jscoverage['/dialog.js'].lineData[250]++;
  var trs = list.all("tr");
  _$jscoverage['/dialog.js'].lineData[251]++;
  for (var i = 0; visit9_251_1(i < trs.length); i++) {
    _$jscoverage['/dialog.js'].lineData[252]++;
    var tr = $(trs[i]), url = tr.attr("url");
    _$jscoverage['/dialog.js'].lineData[254]++;
    if (visit10_254_1(url)) {
      _$jscoverage['/dialog.js'].lineData[256]++;
      new Image().src = url;
      _$jscoverage['/dialog.js'].lineData[257]++;
      editor.insertElement($("<p>&nbsp;<img src='" + url + "'/>&nbsp;</p>", editorDoc));
      _$jscoverage['/dialog.js'].lineData[259]++;
      self._removeTrFile(tr);
    }
  }
  _$jscoverage['/dialog.js'].lineData[262]++;
  if (visit11_262_1(url)) {
    _$jscoverage['/dialog.js'].lineData[263]++;
    listWrap.hide();
    _$jscoverage['/dialog.js'].lineData[264]++;
    d.hide();
  }
  _$jscoverage['/dialog.js'].lineData[266]++;
  ev.halt();
});
  _$jscoverage['/dialog.js'].lineData[268]++;
  self.addRes(insertAll);
  _$jscoverage['/dialog.js'].lineData[270]++;
  delAll.on("click", function(ev) {
  _$jscoverage['/dialog.js'].functionData[10]++;
  _$jscoverage['/dialog.js'].lineData[271]++;
  var trs = list.all("tr");
  _$jscoverage['/dialog.js'].lineData[272]++;
  for (var i = 0; visit12_272_1(i < trs.length); i++) {
    _$jscoverage['/dialog.js'].lineData[273]++;
    var tr = $(trs[i]);
    _$jscoverage['/dialog.js'].lineData[274]++;
    self._removeTrFile(tr);
  }
  _$jscoverage['/dialog.js'].lineData[276]++;
  listWrap.hide();
  _$jscoverage['/dialog.js'].lineData[277]++;
  ev.halt();
});
  _$jscoverage['/dialog.js'].lineData[279]++;
  self.addRes(delAll);
  _$jscoverage['/dialog.js'].lineData[281]++;
  list.on("click", function(ev) {
  _$jscoverage['/dialog.js'].functionData[11]++;
  _$jscoverage['/dialog.js'].lineData[282]++;
  var target = $(ev.target), tr;
  _$jscoverage['/dialog.js'].lineData[283]++;
  ev.halt();
  _$jscoverage['/dialog.js'].lineData[284]++;
  if (visit13_284_1(target.hasClass(replacePrefix("{prefixCls}editor-upload-insert", prefixCls), undefined))) {
    _$jscoverage['/dialog.js'].lineData[285]++;
    tr = target.parent("tr");
    _$jscoverage['/dialog.js'].lineData[286]++;
    var url = tr.attr("url");
    _$jscoverage['/dialog.js'].lineData[287]++;
    new Image().src = url;
    _$jscoverage['/dialog.js'].lineData[288]++;
    editor.insertElement($("<img src='" + url + "'/>", null, editor.get("document")[0]));
  }
  _$jscoverage['/dialog.js'].lineData[291]++;
  if (visit14_292_1(target.hasClass(replacePrefix("{prefixCls}editor-upload-delete", prefixCls), undefined) || target.hasClass(replacePrefix("{prefixCls}editor-upload-insert", prefixCls), undefined))) {
    _$jscoverage['/dialog.js'].lineData[297]++;
    tr = target.parent("tr");
    _$jscoverage['/dialog.js'].lineData[298]++;
    self._removeTrFile(tr);
  }
  _$jscoverage['/dialog.js'].lineData[302]++;
  if (visit15_302_1(target.hasClass(replacePrefix("{prefixCls}editor-upload-moveup", prefixCls), undefined))) {
    _$jscoverage['/dialog.js'].lineData[303]++;
    tr = target.parent("tr");
    _$jscoverage['/dialog.js'].lineData[304]++;
    tr.css("backgroundColor", "#eef4f9");
    _$jscoverage['/dialog.js'].lineData[305]++;
    tr['animate']({
  backgroundColor: "#FBFBFB"}, 1, null, function() {
  _$jscoverage['/dialog.js'].functionData[12]++;
  _$jscoverage['/dialog.js'].lineData[308]++;
  tr.css("backgroundColor", "");
});
    _$jscoverage['/dialog.js'].lineData[311]++;
    var pre = tr.prev(undefined, undefined);
    _$jscoverage['/dialog.js'].lineData[312]++;
    if (visit16_312_1(pre)) {
      _$jscoverage['/dialog.js'].lineData[313]++;
      swapNode(tr[0], pre[0]);
      _$jscoverage['/dialog.js'].lineData[314]++;
      self._syncStatus();
    }
  } else {
    _$jscoverage['/dialog.js'].lineData[317]++;
    if (visit17_317_1(target.hasClass(replacePrefix("{prefixCls}editor-upload-movedown", prefixCls), undefined))) {
      _$jscoverage['/dialog.js'].lineData[318]++;
      tr = target.parent("tr");
      _$jscoverage['/dialog.js'].lineData[319]++;
      tr.css("backgroundColor", "#eef4f9");
      _$jscoverage['/dialog.js'].lineData[320]++;
      tr['animate']({
  backgroundColor: "#FBFBFB"}, 1, null, function() {
  _$jscoverage['/dialog.js'].functionData[13]++;
  _$jscoverage['/dialog.js'].lineData[323]++;
  tr.css("backgroundColor", "");
});
      _$jscoverage['/dialog.js'].lineData[325]++;
      var next = tr.next();
      _$jscoverage['/dialog.js'].lineData[326]++;
      if (visit18_326_1(next)) {
        _$jscoverage['/dialog.js'].lineData[327]++;
        swapNode(tr[0], next[0]);
        _$jscoverage['/dialog.js'].lineData[328]++;
        self._syncStatus();
      }
    }
  }
  _$jscoverage['/dialog.js'].lineData[331]++;
  ev.halt();
});
  _$jscoverage['/dialog.js'].lineData[334]++;
  self.addRes(list);
  _$jscoverage['/dialog.js'].lineData[336]++;
  uploader.on("fileSelect", self._onSelect, self);
  _$jscoverage['/dialog.js'].lineData[337]++;
  uploader.on("uploadStart", self._onUploadStart, self);
  _$jscoverage['/dialog.js'].lineData[338]++;
  uploader.on("uploadProgress", self._onProgress, self);
  _$jscoverage['/dialog.js'].lineData[339]++;
  uploader.on("uploadCompleteData", self._onUploadCompleteData, self);
  _$jscoverage['/dialog.js'].lineData[340]++;
  uploader.on("contentReady", self._ready, self);
  _$jscoverage['/dialog.js'].lineData[341]++;
  uploader.on("uploadError", self._uploadError, self);
  _$jscoverage['/dialog.js'].lineData[344]++;
  if (visit19_344_1(localStorage.ready)) {
    _$jscoverage['/dialog.js'].lineData[345]++;
    localStorage.ready(function() {
  _$jscoverage['/dialog.js'].functionData[14]++;
  _$jscoverage['/dialog.js'].lineData[346]++;
  self._restore();
});
  } else {
    _$jscoverage['/dialog.js'].lineData[349]++;
    self._restore();
  }
  _$jscoverage['/dialog.js'].lineData[353]++;
  var previewWidth = uploadCfg['previewWidth'];
  _$jscoverage['/dialog.js'].lineData[354]++;
  var previewSuffix = uploadCfg['previewSuffix'];
  _$jscoverage['/dialog.js'].lineData[355]++;
  if (visit20_355_1(previewWidth)) {
    _$jscoverage['/dialog.js'].lineData[357]++;
    var previewWin = new Overlay({
  mask: false, 
  prefixCls: replacePrefix('{prefixCls}editor-', prefixCls), 
  width: previewWidth, 
  render: listWrap}).render();
    _$jscoverage['/dialog.js'].lineData[363]++;
    self.addRes(previewWin);
    _$jscoverage['/dialog.js'].lineData[364]++;
    var preview = previewWin.get("contentEl");
    _$jscoverage['/dialog.js'].lineData[365]++;
    preview.css("border", "none");
    _$jscoverage['/dialog.js'].lineData[367]++;
    var currentFid = 0;
    _$jscoverage['/dialog.js'].lineData[368]++;
    listWrap.on("mouseover", function(ev) {
  _$jscoverage['/dialog.js'].functionData[15]++;
  _$jscoverage['/dialog.js'].lineData[369]++;
  var t = $(ev.target), td = t.parent(replacePrefix(".{prefixCls}editor-upload-filename", prefixCls));
  _$jscoverage['/dialog.js'].lineData[371]++;
  if (visit21_371_1(td)) {
    _$jscoverage['/dialog.js'].lineData[372]++;
    var tr = td.parent("tr");
    _$jscoverage['/dialog.js'].lineData[373]++;
    if (visit22_373_1(tr.hasClass(replacePrefix("{prefixCls}editor-upload-complete", prefixCls), undefined))) {
      _$jscoverage['/dialog.js'].lineData[375]++;
      var url = tr.attr("url"), fid = tr.attr("fid");
      _$jscoverage['/dialog.js'].lineData[377]++;
      if (visit23_377_1(!url)) 
        return;
      _$jscoverage['/dialog.js'].lineData[378]++;
      if (visit24_378_1(fid == currentFid)) {
      } else {
        _$jscoverage['/dialog.js'].lineData[380]++;
        currentFid = fid;
        _$jscoverage['/dialog.js'].lineData[381]++;
        if (visit25_381_1(previewSuffix)) {
          _$jscoverage['/dialog.js'].lineData[382]++;
          url = url.replace(/(\.\w+$)/, previewSuffix);
        }
        _$jscoverage['/dialog.js'].lineData[384]++;
        preview.html("<img " + "style='display:block;' " + "src='" + url + "' />");
      }
      _$jscoverage['/dialog.js'].lineData[389]++;
      var offset = Dom.offset(td);
      _$jscoverage['/dialog.js'].lineData[390]++;
      offset.left += td[0].offsetWidth;
      _$jscoverage['/dialog.js'].lineData[391]++;
      previewWin.move(offset.left, offset.top);
      _$jscoverage['/dialog.js'].lineData[392]++;
      previewWin.show();
    }
  } else {
    _$jscoverage['/dialog.js'].lineData[395]++;
    previewWin.hide();
  }
});
    _$jscoverage['/dialog.js'].lineData[398]++;
    self.addRes(listWrap);
  }
  _$jscoverage['/dialog.js'].lineData[403]++;
  if (visit26_403_1(!UA['webkit'] && visit27_403_2(Editor.Utils.ieEngine != 9))) {
    _$jscoverage['/dialog.js'].lineData[404]++;
    d.set("handlers", [d.get("el")]);
  }
}, 
  _removeTrFile: function(tr) {
  _$jscoverage['/dialog.js'].functionData[16]++;
  _$jscoverage['/dialog.js'].lineData[408]++;
  var self = this, progressBars = self.progressBars, fid = tr.attr("fid"), uploader = self.uploader;
  _$jscoverage['/dialog.js'].lineData[412]++;
  if (visit28_412_1(fid)) {
    _$jscoverage['/dialog.js'].lineData[413]++;
    try {
      _$jscoverage['/dialog.js'].lineData[414]++;
      uploader['removeFile'](fid);
    }    catch (e) {
}
  }
  _$jscoverage['/dialog.js'].lineData[418]++;
  if (visit29_418_1(progressBars[fid])) {
    _$jscoverage['/dialog.js'].lineData[419]++;
    progressBars[fid].destroy();
    _$jscoverage['/dialog.js'].lineData[420]++;
    delete progressBars[fid];
  }
  _$jscoverage['/dialog.js'].lineData[422]++;
  tr.remove();
  _$jscoverage['/dialog.js'].lineData[423]++;
  self.denable();
  _$jscoverage['/dialog.js'].lineData[424]++;
  self._syncStatus();
}, 
  _realShow: function() {
  _$jscoverage['/dialog.js'].functionData[17]++;
  _$jscoverage['/dialog.js'].lineData[428]++;
  this.dialog.center();
  _$jscoverage['/dialog.js'].lineData[429]++;
  this.dialog.show();
}, 
  show: function() {
  _$jscoverage['/dialog.js'].functionData[18]++;
  _$jscoverage['/dialog.js'].lineData[432]++;
  this._prepareShow();
}, 
  _uploadError: function(ev) {
  _$jscoverage['/dialog.js'].functionData[19]++;
  _$jscoverage['/dialog.js'].lineData[435]++;
  var self = this, prefixCls = self.editor.get('prefixCls'), progressBars = self.progressBars, uploader = self.uploader, id = visit30_439_1(ev.id || (visit31_439_2(ev['file'] && ev['file'].id)));
  _$jscoverage['/dialog.js'].lineData[440]++;
  if (visit32_440_1(!id)) {
    _$jscoverage['/dialog.js'].lineData[441]++;
    return;
  }
  _$jscoverage['/dialog.js'].lineData[443]++;
  var tr = self._getFileTr(id), bar = progressBars[id], status = ev.status;
  _$jscoverage['/dialog.js'].lineData[447]++;
  uploader['removeFile'](id);
  _$jscoverage['/dialog.js'].lineData[448]++;
  if (visit33_448_1(!ev._custom)) {
    _$jscoverage['/dialog.js'].lineData[449]++;
    logger.error(status);
    _$jscoverage['/dialog.js'].lineData[450]++;
    status = "\u670d\u52a1\u5668\u51fa\u9519\u6216\u683c\u5f0f\u4e0d\u6b63\u786e";
  }
  _$jscoverage['/dialog.js'].lineData[452]++;
  if (visit34_452_1(tr)) {
    _$jscoverage['/dialog.js'].lineData[453]++;
    visit35_453_1(bar && bar.destroy());
    _$jscoverage['/dialog.js'].lineData[454]++;
    delete progressBars[id];
    _$jscoverage['/dialog.js'].lineData[455]++;
    tr.one(replacePrefix(".{prefixCls}editor-upload-progress", prefixCls)).html("<div " + "style='color:red;'>" + status + "</div>");
  }
}, 
  _getFileTr: function(id) {
  _$jscoverage['/dialog.js'].functionData[20]++;
  _$jscoverage['/dialog.js'].lineData[462]++;
  var self = this, list = self._list, trs = list.all("tr");
  _$jscoverage['/dialog.js'].lineData[465]++;
  for (var i = 0; visit36_465_1(i < trs.length); i++) {
    _$jscoverage['/dialog.js'].lineData[466]++;
    var tr = $(trs[i]);
    _$jscoverage['/dialog.js'].lineData[467]++;
    if (visit37_467_1(tr.attr("fid") == id)) {
      _$jscoverage['/dialog.js'].lineData[468]++;
      return tr;
    }
  }
}, 
  _onUploadStart: function(ev) {
  _$jscoverage['/dialog.js'].functionData[21]++;
  _$jscoverage['/dialog.js'].lineData[473]++;
  var self = this, id = visit38_474_1(ev.id || (visit39_474_2(ev['file'] && ev['file'].id)));
  _$jscoverage['/dialog.js'].lineData[475]++;
  var tr = this._getFileTr(id);
  _$jscoverage['/dialog.js'].lineData[476]++;
  var prefixCls = self.editor.get('prefixCls');
  _$jscoverage['/dialog.js'].lineData[477]++;
  tr[0].className = replacePrefix("{prefixCls}editor-upload-uploading", prefixCls);
}, 
  _onUploadCompleteData: function(ev) {
  _$jscoverage['/dialog.js'].functionData[22]++;
  _$jscoverage['/dialog.js'].lineData[480]++;
  var self = this, uploader = self.uploader, prefixCls = self.editor.get('prefixCls'), data = S.trim(ev.data).replace(/\r|\n/g, ""), id = ev['file'].id;
  _$jscoverage['/dialog.js'].lineData[487]++;
  if (visit40_487_1(id)) {
    _$jscoverage['/dialog.js'].lineData[488]++;
    try {
      _$jscoverage['/dialog.js'].lineData[489]++;
      uploader['removeFile'](id);
    }    catch (e) {
}
  }
  _$jscoverage['/dialog.js'].lineData[494]++;
  if (visit41_494_1(!data)) 
    return;
  _$jscoverage['/dialog.js'].lineData[495]++;
  try {
    _$jscoverage['/dialog.js'].lineData[496]++;
    data = S.parseJson(data);
  }  catch (ex) {
  _$jscoverage['/dialog.js'].lineData[498]++;
  logger.error("multiUpload _onUploadCompleteData error: " + data);
  _$jscoverage['/dialog.js'].lineData[499]++;
  throw ex;
}
  _$jscoverage['/dialog.js'].lineData[501]++;
  if (visit42_501_1(data.error)) {
    _$jscoverage['/dialog.js'].lineData[502]++;
    self._uploadError({
  id: id, 
  _custom: 1, 
  status: data.error});
    _$jscoverage['/dialog.js'].lineData[507]++;
    return;
  }
  _$jscoverage['/dialog.js'].lineData[509]++;
  var tr = self._getFileTr(id);
  _$jscoverage['/dialog.js'].lineData[510]++;
  if (visit43_510_1(tr)) {
    _$jscoverage['/dialog.js'].lineData[511]++;
    tr.one(replacePrefix(".{prefixCls}editor-upload-insert", prefixCls)).show();
    _$jscoverage['/dialog.js'].lineData[512]++;
    self._tagComplete(tr, data['imgUrl']);
  }
  _$jscoverage['/dialog.js'].lineData[515]++;
  self._syncStatus();
}, 
  _onProgress: function(ev) {
  _$jscoverage['/dialog.js'].functionData[23]++;
  _$jscoverage['/dialog.js'].lineData[519]++;
  var fid = ev['file'].id, progressBars = this.progressBars, progess = Math.floor(ev['bytesLoaded'] * 100 / ev['bytesTotal']), bar = progressBars[fid];
  _$jscoverage['/dialog.js'].lineData[523]++;
  visit44_523_1(bar && bar.set("progress", progess));
}, 
  ddisable: function() {
  _$jscoverage['/dialog.js'].functionData[24]++;
  _$jscoverage['/dialog.js'].lineData[527]++;
  var self = this;
  _$jscoverage['/dialog.js'].lineData[528]++;
  var prefixCls = self.editor.get('prefixCls');
  _$jscoverage['/dialog.js'].lineData[529]++;
  self.uploader['lock']();
  _$jscoverage['/dialog.js'].lineData[530]++;
  self.btn.addClass(replacePrefix("{prefixCls}editor-button-disabled", prefixCls), undefined);
  _$jscoverage['/dialog.js'].lineData[531]++;
  self.flashPos.offset({
  left: -9999, 
  top: -9999});
}, 
  denable: function() {
  _$jscoverage['/dialog.js'].functionData[25]++;
  _$jscoverage['/dialog.js'].lineData[537]++;
  var self = this;
  _$jscoverage['/dialog.js'].lineData[538]++;
  var prefixCls = self.editor.get('prefixCls');
  _$jscoverage['/dialog.js'].lineData[539]++;
  self.uploader['unlock']();
  _$jscoverage['/dialog.js'].lineData[540]++;
  self.btn.removeClass(replacePrefix("{prefixCls}editor-button-disabled", prefixCls), undefined);
  _$jscoverage['/dialog.js'].lineData[541]++;
  self.flashPos.offset(self.btn.offset());
}, 
  _syncStatus: function() {
  _$jscoverage['/dialog.js'].functionData[26]++;
  _$jscoverage['/dialog.js'].lineData[544]++;
  var self = this, list = self._list, seq = 1, trs = list.all("tr");
  _$jscoverage['/dialog.js'].lineData[548]++;
  var prefixCls = self.editor.get('prefixCls');
  _$jscoverage['/dialog.js'].lineData[549]++;
  if (visit45_549_1(trs.length == 0)) {
    _$jscoverage['/dialog.js'].lineData[550]++;
    self._listWrap.hide();
  } else {
    _$jscoverage['/dialog.js'].lineData[552]++;
    list.all(replacePrefix(".{prefixCls}editor-upload-seq", prefixCls)).each(function(n) {
  _$jscoverage['/dialog.js'].functionData[27]++;
  _$jscoverage['/dialog.js'].lineData[553]++;
  n.html(seq++);
});
    _$jscoverage['/dialog.js'].lineData[555]++;
    var wait = 0;
    _$jscoverage['/dialog.js'].lineData[556]++;
    for (var i = 0; visit46_556_1(i < trs.length); i++) {
      _$jscoverage['/dialog.js'].lineData[557]++;
      var tr = $(trs[i]);
      _$jscoverage['/dialog.js'].lineData[558]++;
      if (visit47_558_1(!tr.attr("url"))) 
        wait++;
    }
    _$jscoverage['/dialog.js'].lineData[560]++;
    self.statusText.html("\u961f\u5217\u4e2d\u5269\u4f59" + wait + "\u5f20\u56fe\u7247" + "\uff0c\u70b9\u51fb\u786e\u5b9a\u4e0a\u4f20\uff0c\u5f00\u59cb\u4e0a\u4f20\u3002 ");
  }
  _$jscoverage['/dialog.js'].lineData[565]++;
  self._save();
}, 
  _restore: function() {
  _$jscoverage['/dialog.js'].functionData[28]++;
  _$jscoverage['/dialog.js'].lineData[569]++;
  var self = this, data = localStorage.getItem(KEY), tbl = self._list[0];
  _$jscoverage['/dialog.js'].lineData[572]++;
  if (visit48_572_1(!data)) 
    return;
  _$jscoverage['/dialog.js'].lineData[573]++;
  data = S.parseJson(S.urlDecode(data));
  _$jscoverage['/dialog.js'].lineData[574]++;
  for (var i = 0; visit49_574_1(i < data.length); i++) {
    _$jscoverage['/dialog.js'].lineData[575]++;
    var d = data[i];
    _$jscoverage['/dialog.js'].lineData[576]++;
    d.complete = 1;
    _$jscoverage['/dialog.js'].lineData[577]++;
    d.fid = "restore_" + i;
    _$jscoverage['/dialog.js'].lineData[578]++;
    var r = self._createFileTr(tbl, d);
    _$jscoverage['/dialog.js'].lineData[579]++;
    self._tagComplete(r, d.url);
  }
  _$jscoverage['/dialog.js'].lineData[581]++;
  if (visit50_581_1(d)) {
    _$jscoverage['/dialog.js'].lineData[582]++;
    self._listWrap.show();
    _$jscoverage['/dialog.js'].lineData[583]++;
    self._syncStatus();
  }
}, 
  _tagComplete: function(tr, url) {
  _$jscoverage['/dialog.js'].functionData[29]++;
  _$jscoverage['/dialog.js'].lineData[587]++;
  var self = this;
  _$jscoverage['/dialog.js'].lineData[588]++;
  var prefixCls = self.editor.get('prefixCls');
  _$jscoverage['/dialog.js'].lineData[589]++;
  tr.attr("url", url);
  _$jscoverage['/dialog.js'].lineData[590]++;
  tr[0].className = replacePrefix("{prefixCls}editor-upload-complete", prefixCls);
}, 
  _save: function() {
  _$jscoverage['/dialog.js'].functionData[30]++;
  _$jscoverage['/dialog.js'].lineData[593]++;
  var self = this, list = self._list, trs = list.all("tr"), data = [];
  _$jscoverage['/dialog.js'].lineData[597]++;
  var prefixCls = self.editor.get('prefixCls');
  _$jscoverage['/dialog.js'].lineData[598]++;
  for (var i = 0; visit51_598_1(i < trs.length); i++) {
    _$jscoverage['/dialog.js'].lineData[599]++;
    var tr = $(trs[i]), url = tr.attr("url");
    _$jscoverage['/dialog.js'].lineData[601]++;
    if (visit52_601_1(url)) {
      _$jscoverage['/dialog.js'].lineData[602]++;
      var size = tr.one(replacePrefix(".{prefixCls}editor-upload-filesize", prefixCls)).html(), name = tr.one(replacePrefix(".{prefixCls}editor-upload-filename", prefixCls)).text();
      _$jscoverage['/dialog.js'].lineData[604]++;
      data.push({
  name: name, 
  size: size, 
  url: url});
    }
  }
  _$jscoverage['/dialog.js'].lineData[612]++;
  localStorage.setItem(KEY, encodeURIComponent(Json.stringify(data)));
}, 
  _getFilesSize: function(files) {
  _$jscoverage['/dialog.js'].functionData[31]++;
  _$jscoverage['/dialog.js'].lineData[616]++;
  var n = 0;
  _$jscoverage['/dialog.js'].lineData[617]++;
  for (var i in files) {
    _$jscoverage['/dialog.js'].lineData[619]++;
    n++;
  }
  _$jscoverage['/dialog.js'].lineData[621]++;
  return n;
}, 
  _createFileTr: function(tbl, f) {
  _$jscoverage['/dialog.js'].functionData[32]++;
  _$jscoverage['/dialog.js'].lineData[651]++;
  var self = this, editor = self.editor, progressBars = self.progressBars, id = f.fid, row = tbl.insertRow(-1);
  _$jscoverage['/dialog.js'].lineData[656]++;
  var prefixCls = self.editor.get('prefixCls');
  _$jscoverage['/dialog.js'].lineData[657]++;
  Dom.attr(row, "fid", id);
  _$jscoverage['/dialog.js'].lineData[658]++;
  var cell = row.insertCell(-1);
  _$jscoverage['/dialog.js'].lineData[659]++;
  Dom.attr(cell, "class", replacePrefix('{prefixCls}editor-upload-seq', prefixCls));
  _$jscoverage['/dialog.js'].lineData[660]++;
  cell = row.insertCell(-1);
  _$jscoverage['/dialog.js'].lineData[661]++;
  if (visit53_661_1(f.name.length > 18)) {
    _$jscoverage['/dialog.js'].lineData[662]++;
    f.name = f.name.substring(0, 18) + "...";
  }
  _$jscoverage['/dialog.js'].lineData[664]++;
  Dom.html(cell, "<div style='width:160px;overflow:hidden;'><div style='width:9999px;text-align:left;'>" + f.name + "</div></div>");
  _$jscoverage['/dialog.js'].lineData[665]++;
  Dom.attr(cell, "class", replacePrefix('{prefixCls}editor-upload-filename', prefixCls));
  _$jscoverage['/dialog.js'].lineData[666]++;
  cell = row.insertCell(-1);
  _$jscoverage['/dialog.js'].lineData[667]++;
  Dom.html(cell, f.size);
  _$jscoverage['/dialog.js'].lineData[668]++;
  Dom.attr(cell, "class", replacePrefix('{prefixCls}editor-upload-filesize', prefixCls));
  _$jscoverage['/dialog.js'].lineData[669]++;
  cell = row.insertCell(-1);
  _$jscoverage['/dialog.js'].lineData[670]++;
  Dom.attr(cell, "class", replacePrefix('{prefixCls}editor-upload-progress', prefixCls));
  _$jscoverage['/dialog.js'].lineData[671]++;
  cell = row.insertCell(-1);
  _$jscoverage['/dialog.js'].lineData[672]++;
  Dom.html(cell, replacePrefix("<a class='{prefixCls}editor-upload-moveup' href='#'>[\u4e0a\u79fb]</a> &nbsp; " + "<a class='{prefixCls}editor-upload-movedown' href='#'>[\u4e0b\u79fb]</a> &nbsp; " + "<a href='#' class='{prefixCls}editor-upload-insert' style='" + (f.complete ? "" : "display:none;") + "' " + ">" + "[\u63d2\u5165]</a> &nbsp; " + "<a href='#' class='{prefixCls}editor-upload-delete'>" + "[\u5220\u9664]" + "</a> &nbsp;", prefixCls));
  _$jscoverage['/dialog.js'].lineData[684]++;
  var rowNode = $(row);
  _$jscoverage['/dialog.js'].lineData[686]++;
  if (visit54_686_1(parseInt(f.size) > self._sizeLimit)) {
    _$jscoverage['/dialog.js'].lineData[687]++;
    self._uploadError({
  id: id, 
  _custom: 1, 
  status: PIC_SIZE_LIMIT_WARNING.replace(/n/, self._sizeLimit / 1000)});
    _$jscoverage['/dialog.js'].lineData[693]++;
    self.uploader['removeFile'](id);
  } else {
    _$jscoverage['/dialog.js'].lineData[696]++;
    progressBars[id] = new ProgressBar({
  container: rowNode.one(replacePrefix(".{prefixCls}editor-upload-progress", prefixCls)), 
  width: "100px", 
  height: "15px", 
  prefixCls: editor.get('prefixCls')});
    _$jscoverage['/dialog.js'].lineData[702]++;
    if (visit55_702_1(f.complete)) {
      _$jscoverage['/dialog.js'].lineData[703]++;
      progressBars[id].set("progress", 100);
    }
  }
  _$jscoverage['/dialog.js'].lineData[707]++;
  return rowNode;
}, 
  _onSelect: function(ev) {
  _$jscoverage['/dialog.js'].functionData[33]++;
  _$jscoverage['/dialog.js'].lineData[710]++;
  var self = this, uploader = self.uploader, list = self._list, curNum = 0, files = ev['fileList'], available = self._numberLimit, i;
  _$jscoverage['/dialog.js'].lineData[718]++;
  if (visit56_718_1(files)) {
    _$jscoverage['/dialog.js'].lineData[720]++;
    var trs = list.children("tr");
    _$jscoverage['/dialog.js'].lineData[721]++;
    for (i = 0; visit57_721_1(i < trs.length); i++) {
      _$jscoverage['/dialog.js'].lineData[722]++;
      var tr = trs[i], fid = Dom.attr(tr, "fid");
      _$jscoverage['/dialog.js'].lineData[723]++;
      visit58_723_1(fid && visit59_723_2(files[fid] && (delete files[fid])));
    }
    _$jscoverage['/dialog.js'].lineData[726]++;
    available = self._numberLimit - trs.length;
    _$jscoverage['/dialog.js'].lineData[728]++;
    var l = self._getFilesSize(files);
    _$jscoverage['/dialog.js'].lineData[730]++;
    if (visit60_730_1(l > available)) {
      _$jscoverage['/dialog.js'].lineData[731]++;
      alert(PIC_NUM_LIMIT_WARNING.replace(/n/, self._numberLimit));
    }
    _$jscoverage['/dialog.js'].lineData[734]++;
    if (visit61_734_1(l >= available)) {
      _$jscoverage['/dialog.js'].lineData[735]++;
      self.ddisable();
    }
    _$jscoverage['/dialog.js'].lineData[738]++;
    self._listWrap.show();
    _$jscoverage['/dialog.js'].lineData[739]++;
    var tbl = self._list[0];
    _$jscoverage['/dialog.js'].lineData[742]++;
    for (i in files) {
      _$jscoverage['/dialog.js'].lineData[744]++;
      curNum++;
      _$jscoverage['/dialog.js'].lineData[745]++;
      var f = files[i], size = Math.floor(f.size / 1000), id = f.id;
      _$jscoverage['/dialog.js'].lineData[749]++;
      if (visit62_749_1(curNum > available)) {
        _$jscoverage['/dialog.js'].lineData[751]++;
        uploader['removeFile'](id);
        _$jscoverage['/dialog.js'].lineData[752]++;
        continue;
      }
      _$jscoverage['/dialog.js'].lineData[754]++;
      self._createFileTr(tbl, {
  size: size + "k", 
  fid: id, 
  name: f.name});
    }
    _$jscoverage['/dialog.js'].lineData[760]++;
    self._syncStatus();
  }
}, 
  _ready: function() {
  _$jscoverage['/dialog.js'].functionData[34]++;
  _$jscoverage['/dialog.js'].lineData[765]++;
  var self = this, uploader = self.uploader, up = self.up, btn = self.btn, flashPos = self.flashPos, normParams = Editor.Utils.normParams;
  _$jscoverage['/dialog.js'].lineData[771]++;
  var prefixCls = self.editor.get('prefixCls');
  _$jscoverage['/dialog.js'].lineData[772]++;
  if (visit63_772_1("ready" != uploader['getReady']())) {
    _$jscoverage['/dialog.js'].lineData[773]++;
    self.tipSpan.html("\u60a8\u7684\u6d4f\u89c8\u5668\u4e0d\u652f\u6301\u8be5\u529f\u80fd\uff0c" + "\u8bf7\u5347\u7ea7\u5f53\u524d\u6d4f\u89c8\u5668\uff0c" + "\u5e76\u540c\u65f6 <a href='http://get.adobe.com/cn/flashplayer/'" + " target='_blank'>\u70b9\u6b64\u5347\u7ea7</a> flash \u63d2\u4ef6");
    _$jscoverage['/dialog.js'].lineData[777]++;
    flashPos.offset({
  left: -9999, 
  top: -9999});
    _$jscoverage['/dialog.js'].lineData[781]++;
    return;
  }
  _$jscoverage['/dialog.js'].lineData[783]++;
  btn.removeClass(replacePrefix("{prefixCls}editor-button-disabled", prefixCls), undefined);
  _$jscoverage['/dialog.js'].lineData[784]++;
  flashPos.offset(btn.offset());
  _$jscoverage['/dialog.js'].lineData[785]++;
  uploader['setAllowMultipleFiles'](true);
  _$jscoverage['/dialog.js'].lineData[786]++;
  uploader['setFileFilters']([{
  ext: "*.jpeg;*.jpg;*.png;*.gif", 
  "desc": "\u56fe\u7247\u6587\u4ef6( png,jpg,jpeg,gif )"}]);
  _$jscoverage['/dialog.js'].lineData[792]++;
  up.detach();
  _$jscoverage['/dialog.js'].lineData[793]++;
  up.on("click", function(ev) {
  _$jscoverage['/dialog.js'].functionData[35]++;
  _$jscoverage['/dialog.js'].lineData[794]++;
  uploader['uploadAll'](self._ds, "POST", normParams(self._dsp), self._fileInput);
  _$jscoverage['/dialog.js'].lineData[798]++;
  ev.halt();
});
  _$jscoverage['/dialog.js'].lineData[800]++;
  self.addRes(up);
}});
  _$jscoverage['/dialog.js'].lineData[804]++;
  return MultiUploadDialog;
}, {
  requires: ['editor', 'overlay', 'component/plugin/drag', '../progressbar', '../dialog', '../flash-bridge', '../local-storage', 'swf']});
