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
if (! _$jscoverage['/editor/range.js']) {
  _$jscoverage['/editor/range.js'] = {};
  _$jscoverage['/editor/range.js'].lineData = [];
  _$jscoverage['/editor/range.js'].lineData[10] = 0;
  _$jscoverage['/editor/range.js'].lineData[11] = 0;
  _$jscoverage['/editor/range.js'].lineData[12] = 0;
  _$jscoverage['/editor/range.js'].lineData[13] = 0;
  _$jscoverage['/editor/range.js'].lineData[14] = 0;
  _$jscoverage['/editor/range.js'].lineData[15] = 0;
  _$jscoverage['/editor/range.js'].lineData[16] = 0;
  _$jscoverage['/editor/range.js'].lineData[21] = 0;
  _$jscoverage['/editor/range.js'].lineData[35] = 0;
  _$jscoverage['/editor/range.js'].lineData[60] = 0;
  _$jscoverage['/editor/range.js'].lineData[65] = 0;
  _$jscoverage['/editor/range.js'].lineData[96] = 0;
  _$jscoverage['/editor/range.js'].lineData[100] = 0;
  _$jscoverage['/editor/range.js'].lineData[106] = 0;
  _$jscoverage['/editor/range.js'].lineData[109] = 0;
  _$jscoverage['/editor/range.js'].lineData[111] = 0;
  _$jscoverage['/editor/range.js'].lineData[114] = 0;
  _$jscoverage['/editor/range.js'].lineData[115] = 0;
  _$jscoverage['/editor/range.js'].lineData[116] = 0;
  _$jscoverage['/editor/range.js'].lineData[118] = 0;
  _$jscoverage['/editor/range.js'].lineData[119] = 0;
  _$jscoverage['/editor/range.js'].lineData[122] = 0;
  _$jscoverage['/editor/range.js'].lineData[124] = 0;
  _$jscoverage['/editor/range.js'].lineData[125] = 0;
  _$jscoverage['/editor/range.js'].lineData[127] = 0;
  _$jscoverage['/editor/range.js'].lineData[128] = 0;
  _$jscoverage['/editor/range.js'].lineData[131] = 0;
  _$jscoverage['/editor/range.js'].lineData[134] = 0;
  _$jscoverage['/editor/range.js'].lineData[135] = 0;
  _$jscoverage['/editor/range.js'].lineData[137] = 0;
  _$jscoverage['/editor/range.js'].lineData[141] = 0;
  _$jscoverage['/editor/range.js'].lineData[151] = 0;
  _$jscoverage['/editor/range.js'].lineData[152] = 0;
  _$jscoverage['/editor/range.js'].lineData[164] = 0;
  _$jscoverage['/editor/range.js'].lineData[165] = 0;
  _$jscoverage['/editor/range.js'].lineData[168] = 0;
  _$jscoverage['/editor/range.js'].lineData[169] = 0;
  _$jscoverage['/editor/range.js'].lineData[173] = 0;
  _$jscoverage['/editor/range.js'].lineData[180] = 0;
  _$jscoverage['/editor/range.js'].lineData[181] = 0;
  _$jscoverage['/editor/range.js'].lineData[182] = 0;
  _$jscoverage['/editor/range.js'].lineData[186] = 0;
  _$jscoverage['/editor/range.js'].lineData[188] = 0;
  _$jscoverage['/editor/range.js'].lineData[190] = 0;
  _$jscoverage['/editor/range.js'].lineData[191] = 0;
  _$jscoverage['/editor/range.js'].lineData[193] = 0;
  _$jscoverage['/editor/range.js'].lineData[202] = 0;
  _$jscoverage['/editor/range.js'].lineData[203] = 0;
  _$jscoverage['/editor/range.js'].lineData[204] = 0;
  _$jscoverage['/editor/range.js'].lineData[211] = 0;
  _$jscoverage['/editor/range.js'].lineData[213] = 0;
  _$jscoverage['/editor/range.js'].lineData[214] = 0;
  _$jscoverage['/editor/range.js'].lineData[215] = 0;
  _$jscoverage['/editor/range.js'].lineData[216] = 0;
  _$jscoverage['/editor/range.js'].lineData[217] = 0;
  _$jscoverage['/editor/range.js'].lineData[219] = 0;
  _$jscoverage['/editor/range.js'].lineData[221] = 0;
  _$jscoverage['/editor/range.js'].lineData[223] = 0;
  _$jscoverage['/editor/range.js'].lineData[229] = 0;
  _$jscoverage['/editor/range.js'].lineData[232] = 0;
  _$jscoverage['/editor/range.js'].lineData[233] = 0;
  _$jscoverage['/editor/range.js'].lineData[236] = 0;
  _$jscoverage['/editor/range.js'].lineData[237] = 0;
  _$jscoverage['/editor/range.js'].lineData[241] = 0;
  _$jscoverage['/editor/range.js'].lineData[243] = 0;
  _$jscoverage['/editor/range.js'].lineData[244] = 0;
  _$jscoverage['/editor/range.js'].lineData[245] = 0;
  _$jscoverage['/editor/range.js'].lineData[251] = 0;
  _$jscoverage['/editor/range.js'].lineData[252] = 0;
  _$jscoverage['/editor/range.js'].lineData[256] = 0;
  _$jscoverage['/editor/range.js'].lineData[264] = 0;
  _$jscoverage['/editor/range.js'].lineData[265] = 0;
  _$jscoverage['/editor/range.js'].lineData[268] = 0;
  _$jscoverage['/editor/range.js'].lineData[270] = 0;
  _$jscoverage['/editor/range.js'].lineData[272] = 0;
  _$jscoverage['/editor/range.js'].lineData[276] = 0;
  _$jscoverage['/editor/range.js'].lineData[278] = 0;
  _$jscoverage['/editor/range.js'].lineData[282] = 0;
  _$jscoverage['/editor/range.js'].lineData[285] = 0;
  _$jscoverage['/editor/range.js'].lineData[286] = 0;
  _$jscoverage['/editor/range.js'].lineData[290] = 0;
  _$jscoverage['/editor/range.js'].lineData[293] = 0;
  _$jscoverage['/editor/range.js'].lineData[295] = 0;
  _$jscoverage['/editor/range.js'].lineData[300] = 0;
  _$jscoverage['/editor/range.js'].lineData[301] = 0;
  _$jscoverage['/editor/range.js'].lineData[302] = 0;
  _$jscoverage['/editor/range.js'].lineData[303] = 0;
  _$jscoverage['/editor/range.js'].lineData[306] = 0;
  _$jscoverage['/editor/range.js'].lineData[310] = 0;
  _$jscoverage['/editor/range.js'].lineData[312] = 0;
  _$jscoverage['/editor/range.js'].lineData[316] = 0;
  _$jscoverage['/editor/range.js'].lineData[319] = 0;
  _$jscoverage['/editor/range.js'].lineData[320] = 0;
  _$jscoverage['/editor/range.js'].lineData[324] = 0;
  _$jscoverage['/editor/range.js'].lineData[328] = 0;
  _$jscoverage['/editor/range.js'].lineData[329] = 0;
  _$jscoverage['/editor/range.js'].lineData[332] = 0;
  _$jscoverage['/editor/range.js'].lineData[335] = 0;
  _$jscoverage['/editor/range.js'].lineData[337] = 0;
  _$jscoverage['/editor/range.js'].lineData[341] = 0;
  _$jscoverage['/editor/range.js'].lineData[344] = 0;
  _$jscoverage['/editor/range.js'].lineData[345] = 0;
  _$jscoverage['/editor/range.js'].lineData[347] = 0;
  _$jscoverage['/editor/range.js'].lineData[350] = 0;
  _$jscoverage['/editor/range.js'].lineData[351] = 0;
  _$jscoverage['/editor/range.js'].lineData[355] = 0;
  _$jscoverage['/editor/range.js'].lineData[358] = 0;
  _$jscoverage['/editor/range.js'].lineData[360] = 0;
  _$jscoverage['/editor/range.js'].lineData[364] = 0;
  _$jscoverage['/editor/range.js'].lineData[368] = 0;
  _$jscoverage['/editor/range.js'].lineData[369] = 0;
  _$jscoverage['/editor/range.js'].lineData[373] = 0;
  _$jscoverage['/editor/range.js'].lineData[377] = 0;
  _$jscoverage['/editor/range.js'].lineData[378] = 0;
  _$jscoverage['/editor/range.js'].lineData[379] = 0;
  _$jscoverage['/editor/range.js'].lineData[382] = 0;
  _$jscoverage['/editor/range.js'].lineData[383] = 0;
  _$jscoverage['/editor/range.js'].lineData[387] = 0;
  _$jscoverage['/editor/range.js'].lineData[388] = 0;
  _$jscoverage['/editor/range.js'].lineData[389] = 0;
  _$jscoverage['/editor/range.js'].lineData[392] = 0;
  _$jscoverage['/editor/range.js'].lineData[393] = 0;
  _$jscoverage['/editor/range.js'].lineData[403] = 0;
  _$jscoverage['/editor/range.js'].lineData[405] = 0;
  _$jscoverage['/editor/range.js'].lineData[409] = 0;
  _$jscoverage['/editor/range.js'].lineData[412] = 0;
  _$jscoverage['/editor/range.js'].lineData[415] = 0;
  _$jscoverage['/editor/range.js'].lineData[419] = 0;
  _$jscoverage['/editor/range.js'].lineData[424] = 0;
  _$jscoverage['/editor/range.js'].lineData[425] = 0;
  _$jscoverage['/editor/range.js'].lineData[428] = 0;
  _$jscoverage['/editor/range.js'].lineData[429] = 0;
  _$jscoverage['/editor/range.js'].lineData[432] = 0;
  _$jscoverage['/editor/range.js'].lineData[435] = 0;
  _$jscoverage['/editor/range.js'].lineData[436] = 0;
  _$jscoverage['/editor/range.js'].lineData[447] = 0;
  _$jscoverage['/editor/range.js'].lineData[448] = 0;
  _$jscoverage['/editor/range.js'].lineData[449] = 0;
  _$jscoverage['/editor/range.js'].lineData[450] = 0;
  _$jscoverage['/editor/range.js'].lineData[451] = 0;
  _$jscoverage['/editor/range.js'].lineData[452] = 0;
  _$jscoverage['/editor/range.js'].lineData[453] = 0;
  _$jscoverage['/editor/range.js'].lineData[454] = 0;
  _$jscoverage['/editor/range.js'].lineData[457] = 0;
  _$jscoverage['/editor/range.js'].lineData[462] = 0;
  _$jscoverage['/editor/range.js'].lineData[466] = 0;
  _$jscoverage['/editor/range.js'].lineData[467] = 0;
  _$jscoverage['/editor/range.js'].lineData[468] = 0;
  _$jscoverage['/editor/range.js'].lineData[478] = 0;
  _$jscoverage['/editor/range.js'].lineData[482] = 0;
  _$jscoverage['/editor/range.js'].lineData[483] = 0;
  _$jscoverage['/editor/range.js'].lineData[484] = 0;
  _$jscoverage['/editor/range.js'].lineData[485] = 0;
  _$jscoverage['/editor/range.js'].lineData[486] = 0;
  _$jscoverage['/editor/range.js'].lineData[490] = 0;
  _$jscoverage['/editor/range.js'].lineData[491] = 0;
  _$jscoverage['/editor/range.js'].lineData[493] = 0;
  _$jscoverage['/editor/range.js'].lineData[494] = 0;
  _$jscoverage['/editor/range.js'].lineData[495] = 0;
  _$jscoverage['/editor/range.js'].lineData[496] = 0;
  _$jscoverage['/editor/range.js'].lineData[497] = 0;
  _$jscoverage['/editor/range.js'].lineData[507] = 0;
  _$jscoverage['/editor/range.js'].lineData[514] = 0;
  _$jscoverage['/editor/range.js'].lineData[521] = 0;
  _$jscoverage['/editor/range.js'].lineData[528] = 0;
  _$jscoverage['/editor/range.js'].lineData[535] = 0;
  _$jscoverage['/editor/range.js'].lineData[539] = 0;
  _$jscoverage['/editor/range.js'].lineData[542] = 0;
  _$jscoverage['/editor/range.js'].lineData[544] = 0;
  _$jscoverage['/editor/range.js'].lineData[547] = 0;
  _$jscoverage['/editor/range.js'].lineData[565] = 0;
  _$jscoverage['/editor/range.js'].lineData[566] = 0;
  _$jscoverage['/editor/range.js'].lineData[567] = 0;
  _$jscoverage['/editor/range.js'].lineData[568] = 0;
  _$jscoverage['/editor/range.js'].lineData[571] = 0;
  _$jscoverage['/editor/range.js'].lineData[572] = 0;
  _$jscoverage['/editor/range.js'].lineData[574] = 0;
  _$jscoverage['/editor/range.js'].lineData[575] = 0;
  _$jscoverage['/editor/range.js'].lineData[576] = 0;
  _$jscoverage['/editor/range.js'].lineData[579] = 0;
  _$jscoverage['/editor/range.js'].lineData[596] = 0;
  _$jscoverage['/editor/range.js'].lineData[597] = 0;
  _$jscoverage['/editor/range.js'].lineData[598] = 0;
  _$jscoverage['/editor/range.js'].lineData[599] = 0;
  _$jscoverage['/editor/range.js'].lineData[602] = 0;
  _$jscoverage['/editor/range.js'].lineData[603] = 0;
  _$jscoverage['/editor/range.js'].lineData[605] = 0;
  _$jscoverage['/editor/range.js'].lineData[606] = 0;
  _$jscoverage['/editor/range.js'].lineData[607] = 0;
  _$jscoverage['/editor/range.js'].lineData[610] = 0;
  _$jscoverage['/editor/range.js'].lineData[619] = 0;
  _$jscoverage['/editor/range.js'].lineData[620] = 0;
  _$jscoverage['/editor/range.js'].lineData[622] = 0;
  _$jscoverage['/editor/range.js'].lineData[623] = 0;
  _$jscoverage['/editor/range.js'].lineData[626] = 0;
  _$jscoverage['/editor/range.js'].lineData[627] = 0;
  _$jscoverage['/editor/range.js'].lineData[629] = 0;
  _$jscoverage['/editor/range.js'].lineData[631] = 0;
  _$jscoverage['/editor/range.js'].lineData[634] = 0;
  _$jscoverage['/editor/range.js'].lineData[635] = 0;
  _$jscoverage['/editor/range.js'].lineData[638] = 0;
  _$jscoverage['/editor/range.js'].lineData[641] = 0;
  _$jscoverage['/editor/range.js'].lineData[650] = 0;
  _$jscoverage['/editor/range.js'].lineData[651] = 0;
  _$jscoverage['/editor/range.js'].lineData[653] = 0;
  _$jscoverage['/editor/range.js'].lineData[654] = 0;
  _$jscoverage['/editor/range.js'].lineData[657] = 0;
  _$jscoverage['/editor/range.js'].lineData[658] = 0;
  _$jscoverage['/editor/range.js'].lineData[660] = 0;
  _$jscoverage['/editor/range.js'].lineData[662] = 0;
  _$jscoverage['/editor/range.js'].lineData[665] = 0;
  _$jscoverage['/editor/range.js'].lineData[666] = 0;
  _$jscoverage['/editor/range.js'].lineData[669] = 0;
  _$jscoverage['/editor/range.js'].lineData[672] = 0;
  _$jscoverage['/editor/range.js'].lineData[679] = 0;
  _$jscoverage['/editor/range.js'].lineData[686] = 0;
  _$jscoverage['/editor/range.js'].lineData[693] = 0;
  _$jscoverage['/editor/range.js'].lineData[701] = 0;
  _$jscoverage['/editor/range.js'].lineData[702] = 0;
  _$jscoverage['/editor/range.js'].lineData[703] = 0;
  _$jscoverage['/editor/range.js'].lineData[704] = 0;
  _$jscoverage['/editor/range.js'].lineData[706] = 0;
  _$jscoverage['/editor/range.js'].lineData[707] = 0;
  _$jscoverage['/editor/range.js'].lineData[709] = 0;
  _$jscoverage['/editor/range.js'].lineData[717] = 0;
  _$jscoverage['/editor/range.js'].lineData[720] = 0;
  _$jscoverage['/editor/range.js'].lineData[721] = 0;
  _$jscoverage['/editor/range.js'].lineData[722] = 0;
  _$jscoverage['/editor/range.js'].lineData[723] = 0;
  _$jscoverage['/editor/range.js'].lineData[724] = 0;
  _$jscoverage['/editor/range.js'].lineData[726] = 0;
  _$jscoverage['/editor/range.js'].lineData[738] = 0;
  _$jscoverage['/editor/range.js'].lineData[741] = 0;
  _$jscoverage['/editor/range.js'].lineData[743] = 0;
  _$jscoverage['/editor/range.js'].lineData[745] = 0;
  _$jscoverage['/editor/range.js'].lineData[748] = 0;
  _$jscoverage['/editor/range.js'].lineData[751] = 0;
  _$jscoverage['/editor/range.js'].lineData[752] = 0;
  _$jscoverage['/editor/range.js'].lineData[759] = 0;
  _$jscoverage['/editor/range.js'].lineData[760] = 0;
  _$jscoverage['/editor/range.js'].lineData[761] = 0;
  _$jscoverage['/editor/range.js'].lineData[763] = 0;
  _$jscoverage['/editor/range.js'].lineData[773] = 0;
  _$jscoverage['/editor/range.js'].lineData[774] = 0;
  _$jscoverage['/editor/range.js'].lineData[775] = 0;
  _$jscoverage['/editor/range.js'].lineData[777] = 0;
  _$jscoverage['/editor/range.js'].lineData[788] = 0;
  _$jscoverage['/editor/range.js'].lineData[790] = 0;
  _$jscoverage['/editor/range.js'].lineData[791] = 0;
  _$jscoverage['/editor/range.js'].lineData[792] = 0;
  _$jscoverage['/editor/range.js'].lineData[793] = 0;
  _$jscoverage['/editor/range.js'].lineData[797] = 0;
  _$jscoverage['/editor/range.js'].lineData[798] = 0;
  _$jscoverage['/editor/range.js'].lineData[802] = 0;
  _$jscoverage['/editor/range.js'].lineData[804] = 0;
  _$jscoverage['/editor/range.js'].lineData[805] = 0;
  _$jscoverage['/editor/range.js'].lineData[806] = 0;
  _$jscoverage['/editor/range.js'].lineData[807] = 0;
  _$jscoverage['/editor/range.js'].lineData[809] = 0;
  _$jscoverage['/editor/range.js'].lineData[810] = 0;
  _$jscoverage['/editor/range.js'].lineData[814] = 0;
  _$jscoverage['/editor/range.js'].lineData[816] = 0;
  _$jscoverage['/editor/range.js'].lineData[818] = 0;
  _$jscoverage['/editor/range.js'].lineData[819] = 0;
  _$jscoverage['/editor/range.js'].lineData[823] = 0;
  _$jscoverage['/editor/range.js'].lineData[825] = 0;
  _$jscoverage['/editor/range.js'].lineData[827] = 0;
  _$jscoverage['/editor/range.js'].lineData[830] = 0;
  _$jscoverage['/editor/range.js'].lineData[831] = 0;
  _$jscoverage['/editor/range.js'].lineData[833] = 0;
  _$jscoverage['/editor/range.js'].lineData[834] = 0;
  _$jscoverage['/editor/range.js'].lineData[836] = 0;
  _$jscoverage['/editor/range.js'].lineData[841] = 0;
  _$jscoverage['/editor/range.js'].lineData[842] = 0;
  _$jscoverage['/editor/range.js'].lineData[843] = 0;
  _$jscoverage['/editor/range.js'].lineData[844] = 0;
  _$jscoverage['/editor/range.js'].lineData[848] = 0;
  _$jscoverage['/editor/range.js'].lineData[849] = 0;
  _$jscoverage['/editor/range.js'].lineData[850] = 0;
  _$jscoverage['/editor/range.js'].lineData[851] = 0;
  _$jscoverage['/editor/range.js'].lineData[852] = 0;
  _$jscoverage['/editor/range.js'].lineData[856] = 0;
  _$jscoverage['/editor/range.js'].lineData[866] = 0;
  _$jscoverage['/editor/range.js'].lineData[876] = 0;
  _$jscoverage['/editor/range.js'].lineData[877] = 0;
  _$jscoverage['/editor/range.js'].lineData[883] = 0;
  _$jscoverage['/editor/range.js'].lineData[886] = 0;
  _$jscoverage['/editor/range.js'].lineData[887] = 0;
  _$jscoverage['/editor/range.js'].lineData[891] = 0;
  _$jscoverage['/editor/range.js'].lineData[893] = 0;
  _$jscoverage['/editor/range.js'].lineData[894] = 0;
  _$jscoverage['/editor/range.js'].lineData[900] = 0;
  _$jscoverage['/editor/range.js'].lineData[903] = 0;
  _$jscoverage['/editor/range.js'].lineData[904] = 0;
  _$jscoverage['/editor/range.js'].lineData[908] = 0;
  _$jscoverage['/editor/range.js'].lineData[911] = 0;
  _$jscoverage['/editor/range.js'].lineData[912] = 0;
  _$jscoverage['/editor/range.js'].lineData[916] = 0;
  _$jscoverage['/editor/range.js'].lineData[919] = 0;
  _$jscoverage['/editor/range.js'].lineData[920] = 0;
  _$jscoverage['/editor/range.js'].lineData[925] = 0;
  _$jscoverage['/editor/range.js'].lineData[928] = 0;
  _$jscoverage['/editor/range.js'].lineData[929] = 0;
  _$jscoverage['/editor/range.js'].lineData[934] = 0;
  _$jscoverage['/editor/range.js'].lineData[948] = 0;
  _$jscoverage['/editor/range.js'].lineData[954] = 0;
  _$jscoverage['/editor/range.js'].lineData[955] = 0;
  _$jscoverage['/editor/range.js'].lineData[956] = 0;
  _$jscoverage['/editor/range.js'].lineData[960] = 0;
  _$jscoverage['/editor/range.js'].lineData[962] = 0;
  _$jscoverage['/editor/range.js'].lineData[963] = 0;
  _$jscoverage['/editor/range.js'].lineData[964] = 0;
  _$jscoverage['/editor/range.js'].lineData[968] = 0;
  _$jscoverage['/editor/range.js'].lineData[969] = 0;
  _$jscoverage['/editor/range.js'].lineData[970] = 0;
  _$jscoverage['/editor/range.js'].lineData[972] = 0;
  _$jscoverage['/editor/range.js'].lineData[973] = 0;
  _$jscoverage['/editor/range.js'].lineData[976] = 0;
  _$jscoverage['/editor/range.js'].lineData[977] = 0;
  _$jscoverage['/editor/range.js'].lineData[978] = 0;
  _$jscoverage['/editor/range.js'].lineData[981] = 0;
  _$jscoverage['/editor/range.js'].lineData[982] = 0;
  _$jscoverage['/editor/range.js'].lineData[983] = 0;
  _$jscoverage['/editor/range.js'].lineData[986] = 0;
  _$jscoverage['/editor/range.js'].lineData[987] = 0;
  _$jscoverage['/editor/range.js'].lineData[988] = 0;
  _$jscoverage['/editor/range.js'].lineData[990] = 0;
  _$jscoverage['/editor/range.js'].lineData[993] = 0;
  _$jscoverage['/editor/range.js'].lineData[1007] = 0;
  _$jscoverage['/editor/range.js'].lineData[1008] = 0;
  _$jscoverage['/editor/range.js'].lineData[1009] = 0;
  _$jscoverage['/editor/range.js'].lineData[1018] = 0;
  _$jscoverage['/editor/range.js'].lineData[1023] = 0;
  _$jscoverage['/editor/range.js'].lineData[1028] = 0;
  _$jscoverage['/editor/range.js'].lineData[1029] = 0;
  _$jscoverage['/editor/range.js'].lineData[1030] = 0;
  _$jscoverage['/editor/range.js'].lineData[1031] = 0;
  _$jscoverage['/editor/range.js'].lineData[1034] = 0;
  _$jscoverage['/editor/range.js'].lineData[1035] = 0;
  _$jscoverage['/editor/range.js'].lineData[1039] = 0;
  _$jscoverage['/editor/range.js'].lineData[1041] = 0;
  _$jscoverage['/editor/range.js'].lineData[1042] = 0;
  _$jscoverage['/editor/range.js'].lineData[1045] = 0;
  _$jscoverage['/editor/range.js'].lineData[1046] = 0;
  _$jscoverage['/editor/range.js'].lineData[1047] = 0;
  _$jscoverage['/editor/range.js'].lineData[1048] = 0;
  _$jscoverage['/editor/range.js'].lineData[1052] = 0;
  _$jscoverage['/editor/range.js'].lineData[1054] = 0;
  _$jscoverage['/editor/range.js'].lineData[1055] = 0;
  _$jscoverage['/editor/range.js'].lineData[1056] = 0;
  _$jscoverage['/editor/range.js'].lineData[1060] = 0;
  _$jscoverage['/editor/range.js'].lineData[1063] = 0;
  _$jscoverage['/editor/range.js'].lineData[1067] = 0;
  _$jscoverage['/editor/range.js'].lineData[1068] = 0;
  _$jscoverage['/editor/range.js'].lineData[1069] = 0;
  _$jscoverage['/editor/range.js'].lineData[1070] = 0;
  _$jscoverage['/editor/range.js'].lineData[1073] = 0;
  _$jscoverage['/editor/range.js'].lineData[1074] = 0;
  _$jscoverage['/editor/range.js'].lineData[1078] = 0;
  _$jscoverage['/editor/range.js'].lineData[1080] = 0;
  _$jscoverage['/editor/range.js'].lineData[1081] = 0;
  _$jscoverage['/editor/range.js'].lineData[1084] = 0;
  _$jscoverage['/editor/range.js'].lineData[1092] = 0;
  _$jscoverage['/editor/range.js'].lineData[1093] = 0;
  _$jscoverage['/editor/range.js'].lineData[1094] = 0;
  _$jscoverage['/editor/range.js'].lineData[1095] = 0;
  _$jscoverage['/editor/range.js'].lineData[1099] = 0;
  _$jscoverage['/editor/range.js'].lineData[1101] = 0;
  _$jscoverage['/editor/range.js'].lineData[1102] = 0;
  _$jscoverage['/editor/range.js'].lineData[1105] = 0;
  _$jscoverage['/editor/range.js'].lineData[1113] = 0;
  _$jscoverage['/editor/range.js'].lineData[1115] = 0;
  _$jscoverage['/editor/range.js'].lineData[1117] = 0;
  _$jscoverage['/editor/range.js'].lineData[1123] = 0;
  _$jscoverage['/editor/range.js'].lineData[1126] = 0;
  _$jscoverage['/editor/range.js'].lineData[1127] = 0;
  _$jscoverage['/editor/range.js'].lineData[1129] = 0;
  _$jscoverage['/editor/range.js'].lineData[1133] = 0;
  _$jscoverage['/editor/range.js'].lineData[1140] = 0;
  _$jscoverage['/editor/range.js'].lineData[1143] = 0;
  _$jscoverage['/editor/range.js'].lineData[1147] = 0;
  _$jscoverage['/editor/range.js'].lineData[1148] = 0;
  _$jscoverage['/editor/range.js'].lineData[1149] = 0;
  _$jscoverage['/editor/range.js'].lineData[1151] = 0;
  _$jscoverage['/editor/range.js'].lineData[1162] = 0;
  _$jscoverage['/editor/range.js'].lineData[1167] = 0;
  _$jscoverage['/editor/range.js'].lineData[1168] = 0;
  _$jscoverage['/editor/range.js'].lineData[1171] = 0;
  _$jscoverage['/editor/range.js'].lineData[1173] = 0;
  _$jscoverage['/editor/range.js'].lineData[1176] = 0;
  _$jscoverage['/editor/range.js'].lineData[1179] = 0;
  _$jscoverage['/editor/range.js'].lineData[1192] = 0;
  _$jscoverage['/editor/range.js'].lineData[1193] = 0;
  _$jscoverage['/editor/range.js'].lineData[1201] = 0;
  _$jscoverage['/editor/range.js'].lineData[1202] = 0;
  _$jscoverage['/editor/range.js'].lineData[1204] = 0;
  _$jscoverage['/editor/range.js'].lineData[1205] = 0;
  _$jscoverage['/editor/range.js'].lineData[1208] = 0;
  _$jscoverage['/editor/range.js'].lineData[1209] = 0;
  _$jscoverage['/editor/range.js'].lineData[1214] = 0;
  _$jscoverage['/editor/range.js'].lineData[1216] = 0;
  _$jscoverage['/editor/range.js'].lineData[1219] = 0;
  _$jscoverage['/editor/range.js'].lineData[1221] = 0;
  _$jscoverage['/editor/range.js'].lineData[1224] = 0;
  _$jscoverage['/editor/range.js'].lineData[1226] = 0;
  _$jscoverage['/editor/range.js'].lineData[1227] = 0;
  _$jscoverage['/editor/range.js'].lineData[1228] = 0;
  _$jscoverage['/editor/range.js'].lineData[1230] = 0;
  _$jscoverage['/editor/range.js'].lineData[1235] = 0;
  _$jscoverage['/editor/range.js'].lineData[1237] = 0;
  _$jscoverage['/editor/range.js'].lineData[1239] = 0;
  _$jscoverage['/editor/range.js'].lineData[1241] = 0;
  _$jscoverage['/editor/range.js'].lineData[1248] = 0;
  _$jscoverage['/editor/range.js'].lineData[1250] = 0;
  _$jscoverage['/editor/range.js'].lineData[1251] = 0;
  _$jscoverage['/editor/range.js'].lineData[1254] = 0;
  _$jscoverage['/editor/range.js'].lineData[1255] = 0;
  _$jscoverage['/editor/range.js'].lineData[1256] = 0;
  _$jscoverage['/editor/range.js'].lineData[1259] = 0;
  _$jscoverage['/editor/range.js'].lineData[1262] = 0;
  _$jscoverage['/editor/range.js'].lineData[1263] = 0;
  _$jscoverage['/editor/range.js'].lineData[1268] = 0;
  _$jscoverage['/editor/range.js'].lineData[1269] = 0;
  _$jscoverage['/editor/range.js'].lineData[1270] = 0;
  _$jscoverage['/editor/range.js'].lineData[1273] = 0;
  _$jscoverage['/editor/range.js'].lineData[1274] = 0;
  _$jscoverage['/editor/range.js'].lineData[1277] = 0;
  _$jscoverage['/editor/range.js'].lineData[1280] = 0;
  _$jscoverage['/editor/range.js'].lineData[1281] = 0;
  _$jscoverage['/editor/range.js'].lineData[1283] = 0;
  _$jscoverage['/editor/range.js'].lineData[1284] = 0;
  _$jscoverage['/editor/range.js'].lineData[1285] = 0;
  _$jscoverage['/editor/range.js'].lineData[1286] = 0;
  _$jscoverage['/editor/range.js'].lineData[1289] = 0;
  _$jscoverage['/editor/range.js'].lineData[1295] = 0;
  _$jscoverage['/editor/range.js'].lineData[1296] = 0;
  _$jscoverage['/editor/range.js'].lineData[1298] = 0;
  _$jscoverage['/editor/range.js'].lineData[1299] = 0;
  _$jscoverage['/editor/range.js'].lineData[1301] = 0;
  _$jscoverage['/editor/range.js'].lineData[1309] = 0;
  _$jscoverage['/editor/range.js'].lineData[1310] = 0;
  _$jscoverage['/editor/range.js'].lineData[1311] = 0;
  _$jscoverage['/editor/range.js'].lineData[1313] = 0;
  _$jscoverage['/editor/range.js'].lineData[1317] = 0;
  _$jscoverage['/editor/range.js'].lineData[1318] = 0;
  _$jscoverage['/editor/range.js'].lineData[1319] = 0;
  _$jscoverage['/editor/range.js'].lineData[1321] = 0;
  _$jscoverage['/editor/range.js'].lineData[1324] = 0;
  _$jscoverage['/editor/range.js'].lineData[1326] = 0;
  _$jscoverage['/editor/range.js'].lineData[1329] = 0;
  _$jscoverage['/editor/range.js'].lineData[1333] = 0;
  _$jscoverage['/editor/range.js'].lineData[1348] = 0;
  _$jscoverage['/editor/range.js'].lineData[1349] = 0;
  _$jscoverage['/editor/range.js'].lineData[1350] = 0;
  _$jscoverage['/editor/range.js'].lineData[1351] = 0;
  _$jscoverage['/editor/range.js'].lineData[1354] = 0;
  _$jscoverage['/editor/range.js'].lineData[1356] = 0;
  _$jscoverage['/editor/range.js'].lineData[1359] = 0;
  _$jscoverage['/editor/range.js'].lineData[1362] = 0;
  _$jscoverage['/editor/range.js'].lineData[1366] = 0;
  _$jscoverage['/editor/range.js'].lineData[1373] = 0;
  _$jscoverage['/editor/range.js'].lineData[1374] = 0;
  _$jscoverage['/editor/range.js'].lineData[1385] = 0;
  _$jscoverage['/editor/range.js'].lineData[1391] = 0;
  _$jscoverage['/editor/range.js'].lineData[1392] = 0;
  _$jscoverage['/editor/range.js'].lineData[1393] = 0;
  _$jscoverage['/editor/range.js'].lineData[1394] = 0;
  _$jscoverage['/editor/range.js'].lineData[1401] = 0;
  _$jscoverage['/editor/range.js'].lineData[1405] = 0;
  _$jscoverage['/editor/range.js'].lineData[1408] = 0;
  _$jscoverage['/editor/range.js'].lineData[1409] = 0;
  _$jscoverage['/editor/range.js'].lineData[1410] = 0;
  _$jscoverage['/editor/range.js'].lineData[1412] = 0;
  _$jscoverage['/editor/range.js'].lineData[1413] = 0;
  _$jscoverage['/editor/range.js'].lineData[1415] = 0;
  _$jscoverage['/editor/range.js'].lineData[1423] = 0;
  _$jscoverage['/editor/range.js'].lineData[1428] = 0;
  _$jscoverage['/editor/range.js'].lineData[1429] = 0;
  _$jscoverage['/editor/range.js'].lineData[1430] = 0;
  _$jscoverage['/editor/range.js'].lineData[1431] = 0;
  _$jscoverage['/editor/range.js'].lineData[1438] = 0;
  _$jscoverage['/editor/range.js'].lineData[1442] = 0;
  _$jscoverage['/editor/range.js'].lineData[1445] = 0;
  _$jscoverage['/editor/range.js'].lineData[1446] = 0;
  _$jscoverage['/editor/range.js'].lineData[1447] = 0;
  _$jscoverage['/editor/range.js'].lineData[1449] = 0;
  _$jscoverage['/editor/range.js'].lineData[1450] = 0;
  _$jscoverage['/editor/range.js'].lineData[1452] = 0;
  _$jscoverage['/editor/range.js'].lineData[1461] = 0;
  _$jscoverage['/editor/range.js'].lineData[1465] = 0;
  _$jscoverage['/editor/range.js'].lineData[1469] = 0;
  _$jscoverage['/editor/range.js'].lineData[1471] = 0;
  _$jscoverage['/editor/range.js'].lineData[1472] = 0;
  _$jscoverage['/editor/range.js'].lineData[1481] = 0;
  _$jscoverage['/editor/range.js'].lineData[1488] = 0;
  _$jscoverage['/editor/range.js'].lineData[1489] = 0;
  _$jscoverage['/editor/range.js'].lineData[1490] = 0;
  _$jscoverage['/editor/range.js'].lineData[1491] = 0;
  _$jscoverage['/editor/range.js'].lineData[1492] = 0;
  _$jscoverage['/editor/range.js'].lineData[1494] = 0;
  _$jscoverage['/editor/range.js'].lineData[1498] = 0;
  _$jscoverage['/editor/range.js'].lineData[1499] = 0;
  _$jscoverage['/editor/range.js'].lineData[1500] = 0;
  _$jscoverage['/editor/range.js'].lineData[1503] = 0;
  _$jscoverage['/editor/range.js'].lineData[1508] = 0;
  _$jscoverage['/editor/range.js'].lineData[1512] = 0;
  _$jscoverage['/editor/range.js'].lineData[1513] = 0;
  _$jscoverage['/editor/range.js'].lineData[1514] = 0;
  _$jscoverage['/editor/range.js'].lineData[1515] = 0;
  _$jscoverage['/editor/range.js'].lineData[1518] = 0;
  _$jscoverage['/editor/range.js'].lineData[1519] = 0;
  _$jscoverage['/editor/range.js'].lineData[1523] = 0;
  _$jscoverage['/editor/range.js'].lineData[1524] = 0;
  _$jscoverage['/editor/range.js'].lineData[1525] = 0;
  _$jscoverage['/editor/range.js'].lineData[1527] = 0;
  _$jscoverage['/editor/range.js'].lineData[1533] = 0;
  _$jscoverage['/editor/range.js'].lineData[1534] = 0;
  _$jscoverage['/editor/range.js'].lineData[1537] = 0;
  _$jscoverage['/editor/range.js'].lineData[1551] = 0;
  _$jscoverage['/editor/range.js'].lineData[1554] = 0;
  _$jscoverage['/editor/range.js'].lineData[1555] = 0;
  _$jscoverage['/editor/range.js'].lineData[1556] = 0;
  _$jscoverage['/editor/range.js'].lineData[1557] = 0;
  _$jscoverage['/editor/range.js'].lineData[1558] = 0;
  _$jscoverage['/editor/range.js'].lineData[1559] = 0;
  _$jscoverage['/editor/range.js'].lineData[1561] = 0;
  _$jscoverage['/editor/range.js'].lineData[1562] = 0;
  _$jscoverage['/editor/range.js'].lineData[1563] = 0;
  _$jscoverage['/editor/range.js'].lineData[1572] = 0;
  _$jscoverage['/editor/range.js'].lineData[1582] = 0;
  _$jscoverage['/editor/range.js'].lineData[1583] = 0;
  _$jscoverage['/editor/range.js'].lineData[1587] = 0;
  _$jscoverage['/editor/range.js'].lineData[1588] = 0;
  _$jscoverage['/editor/range.js'].lineData[1589] = 0;
  _$jscoverage['/editor/range.js'].lineData[1590] = 0;
  _$jscoverage['/editor/range.js'].lineData[1593] = 0;
  _$jscoverage['/editor/range.js'].lineData[1594] = 0;
  _$jscoverage['/editor/range.js'].lineData[1599] = 0;
  _$jscoverage['/editor/range.js'].lineData[1603] = 0;
  _$jscoverage['/editor/range.js'].lineData[1605] = 0;
  _$jscoverage['/editor/range.js'].lineData[1606] = 0;
  _$jscoverage['/editor/range.js'].lineData[1607] = 0;
  _$jscoverage['/editor/range.js'].lineData[1608] = 0;
  _$jscoverage['/editor/range.js'].lineData[1609] = 0;
  _$jscoverage['/editor/range.js'].lineData[1610] = 0;
  _$jscoverage['/editor/range.js'].lineData[1611] = 0;
  _$jscoverage['/editor/range.js'].lineData[1612] = 0;
  _$jscoverage['/editor/range.js'].lineData[1613] = 0;
  _$jscoverage['/editor/range.js'].lineData[1615] = 0;
  _$jscoverage['/editor/range.js'].lineData[1619] = 0;
  _$jscoverage['/editor/range.js'].lineData[1620] = 0;
  _$jscoverage['/editor/range.js'].lineData[1625] = 0;
  _$jscoverage['/editor/range.js'].lineData[1640] = 0;
  _$jscoverage['/editor/range.js'].lineData[1641] = 0;
  _$jscoverage['/editor/range.js'].lineData[1642] = 0;
  _$jscoverage['/editor/range.js'].lineData[1647] = 0;
  _$jscoverage['/editor/range.js'].lineData[1648] = 0;
  _$jscoverage['/editor/range.js'].lineData[1653] = 0;
  _$jscoverage['/editor/range.js'].lineData[1655] = 0;
  _$jscoverage['/editor/range.js'].lineData[1656] = 0;
  _$jscoverage['/editor/range.js'].lineData[1657] = 0;
  _$jscoverage['/editor/range.js'].lineData[1669] = 0;
  _$jscoverage['/editor/range.js'].lineData[1670] = 0;
  _$jscoverage['/editor/range.js'].lineData[1672] = 0;
  _$jscoverage['/editor/range.js'].lineData[1674] = 0;
  _$jscoverage['/editor/range.js'].lineData[1677] = 0;
  _$jscoverage['/editor/range.js'].lineData[1678] = 0;
  _$jscoverage['/editor/range.js'].lineData[1681] = 0;
  _$jscoverage['/editor/range.js'].lineData[1684] = 0;
  _$jscoverage['/editor/range.js'].lineData[1686] = 0;
  _$jscoverage['/editor/range.js'].lineData[1688] = 0;
  _$jscoverage['/editor/range.js'].lineData[1689] = 0;
  _$jscoverage['/editor/range.js'].lineData[1692] = 0;
  _$jscoverage['/editor/range.js'].lineData[1693] = 0;
  _$jscoverage['/editor/range.js'].lineData[1697] = 0;
  _$jscoverage['/editor/range.js'].lineData[1698] = 0;
  _$jscoverage['/editor/range.js'].lineData[1701] = 0;
  _$jscoverage['/editor/range.js'].lineData[1704] = 0;
  _$jscoverage['/editor/range.js'].lineData[1707] = 0;
  _$jscoverage['/editor/range.js'].lineData[1715] = 0;
  _$jscoverage['/editor/range.js'].lineData[1716] = 0;
  _$jscoverage['/editor/range.js'].lineData[1717] = 0;
  _$jscoverage['/editor/range.js'].lineData[1727] = 0;
  _$jscoverage['/editor/range.js'].lineData[1733] = 0;
  _$jscoverage['/editor/range.js'].lineData[1734] = 0;
  _$jscoverage['/editor/range.js'].lineData[1735] = 0;
  _$jscoverage['/editor/range.js'].lineData[1736] = 0;
  _$jscoverage['/editor/range.js'].lineData[1737] = 0;
  _$jscoverage['/editor/range.js'].lineData[1740] = 0;
  _$jscoverage['/editor/range.js'].lineData[1741] = 0;
  _$jscoverage['/editor/range.js'].lineData[1742] = 0;
  _$jscoverage['/editor/range.js'].lineData[1743] = 0;
  _$jscoverage['/editor/range.js'].lineData[1745] = 0;
  _$jscoverage['/editor/range.js'].lineData[1747] = 0;
  _$jscoverage['/editor/range.js'].lineData[1750] = 0;
  _$jscoverage['/editor/range.js'].lineData[1751] = 0;
  _$jscoverage['/editor/range.js'].lineData[1755] = 0;
  _$jscoverage['/editor/range.js'].lineData[1759] = 0;
  _$jscoverage['/editor/range.js'].lineData[1761] = 0;
  _$jscoverage['/editor/range.js'].lineData[1762] = 0;
  _$jscoverage['/editor/range.js'].lineData[1764] = 0;
  _$jscoverage['/editor/range.js'].lineData[1770] = 0;
  _$jscoverage['/editor/range.js'].lineData[1771] = 0;
  _$jscoverage['/editor/range.js'].lineData[1774] = 0;
  _$jscoverage['/editor/range.js'].lineData[1777] = 0;
  _$jscoverage['/editor/range.js'].lineData[1780] = 0;
  _$jscoverage['/editor/range.js'].lineData[1784] = 0;
  _$jscoverage['/editor/range.js'].lineData[1786] = 0;
}
if (! _$jscoverage['/editor/range.js'].functionData) {
  _$jscoverage['/editor/range.js'].functionData = [];
  _$jscoverage['/editor/range.js'].functionData[0] = 0;
  _$jscoverage['/editor/range.js'].functionData[1] = 0;
  _$jscoverage['/editor/range.js'].functionData[2] = 0;
  _$jscoverage['/editor/range.js'].functionData[3] = 0;
  _$jscoverage['/editor/range.js'].functionData[4] = 0;
  _$jscoverage['/editor/range.js'].functionData[5] = 0;
  _$jscoverage['/editor/range.js'].functionData[6] = 0;
  _$jscoverage['/editor/range.js'].functionData[7] = 0;
  _$jscoverage['/editor/range.js'].functionData[8] = 0;
  _$jscoverage['/editor/range.js'].functionData[9] = 0;
  _$jscoverage['/editor/range.js'].functionData[10] = 0;
  _$jscoverage['/editor/range.js'].functionData[11] = 0;
  _$jscoverage['/editor/range.js'].functionData[12] = 0;
  _$jscoverage['/editor/range.js'].functionData[13] = 0;
  _$jscoverage['/editor/range.js'].functionData[14] = 0;
  _$jscoverage['/editor/range.js'].functionData[15] = 0;
  _$jscoverage['/editor/range.js'].functionData[16] = 0;
  _$jscoverage['/editor/range.js'].functionData[17] = 0;
  _$jscoverage['/editor/range.js'].functionData[18] = 0;
  _$jscoverage['/editor/range.js'].functionData[19] = 0;
  _$jscoverage['/editor/range.js'].functionData[20] = 0;
  _$jscoverage['/editor/range.js'].functionData[21] = 0;
  _$jscoverage['/editor/range.js'].functionData[22] = 0;
  _$jscoverage['/editor/range.js'].functionData[23] = 0;
  _$jscoverage['/editor/range.js'].functionData[24] = 0;
  _$jscoverage['/editor/range.js'].functionData[25] = 0;
  _$jscoverage['/editor/range.js'].functionData[26] = 0;
  _$jscoverage['/editor/range.js'].functionData[27] = 0;
  _$jscoverage['/editor/range.js'].functionData[28] = 0;
  _$jscoverage['/editor/range.js'].functionData[29] = 0;
  _$jscoverage['/editor/range.js'].functionData[30] = 0;
  _$jscoverage['/editor/range.js'].functionData[31] = 0;
  _$jscoverage['/editor/range.js'].functionData[32] = 0;
  _$jscoverage['/editor/range.js'].functionData[33] = 0;
  _$jscoverage['/editor/range.js'].functionData[34] = 0;
  _$jscoverage['/editor/range.js'].functionData[35] = 0;
  _$jscoverage['/editor/range.js'].functionData[36] = 0;
  _$jscoverage['/editor/range.js'].functionData[37] = 0;
  _$jscoverage['/editor/range.js'].functionData[38] = 0;
  _$jscoverage['/editor/range.js'].functionData[39] = 0;
  _$jscoverage['/editor/range.js'].functionData[40] = 0;
  _$jscoverage['/editor/range.js'].functionData[41] = 0;
  _$jscoverage['/editor/range.js'].functionData[42] = 0;
  _$jscoverage['/editor/range.js'].functionData[43] = 0;
  _$jscoverage['/editor/range.js'].functionData[44] = 0;
  _$jscoverage['/editor/range.js'].functionData[45] = 0;
  _$jscoverage['/editor/range.js'].functionData[46] = 0;
  _$jscoverage['/editor/range.js'].functionData[47] = 0;
  _$jscoverage['/editor/range.js'].functionData[48] = 0;
  _$jscoverage['/editor/range.js'].functionData[49] = 0;
  _$jscoverage['/editor/range.js'].functionData[50] = 0;
  _$jscoverage['/editor/range.js'].functionData[51] = 0;
  _$jscoverage['/editor/range.js'].functionData[52] = 0;
  _$jscoverage['/editor/range.js'].functionData[53] = 0;
  _$jscoverage['/editor/range.js'].functionData[54] = 0;
}
if (! _$jscoverage['/editor/range.js'].branchData) {
  _$jscoverage['/editor/range.js'].branchData = {};
  _$jscoverage['/editor/range.js'].branchData['100'] = [];
  _$jscoverage['/editor/range.js'].branchData['100'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['100'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['103'] = [];
  _$jscoverage['/editor/range.js'].branchData['103'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['103'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['106'] = [];
  _$jscoverage['/editor/range.js'].branchData['106'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['106'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['111'] = [];
  _$jscoverage['/editor/range.js'].branchData['111'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['118'] = [];
  _$jscoverage['/editor/range.js'].branchData['118'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['122'] = [];
  _$jscoverage['/editor/range.js'].branchData['122'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['124'] = [];
  _$jscoverage['/editor/range.js'].branchData['124'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['127'] = [];
  _$jscoverage['/editor/range.js'].branchData['127'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['131'] = [];
  _$jscoverage['/editor/range.js'].branchData['131'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['134'] = [];
  _$jscoverage['/editor/range.js'].branchData['134'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['134'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['134'][3] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['134'][4] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['164'] = [];
  _$jscoverage['/editor/range.js'].branchData['164'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['168'] = [];
  _$jscoverage['/editor/range.js'].branchData['168'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['180'] = [];
  _$jscoverage['/editor/range.js'].branchData['180'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['186'] = [];
  _$jscoverage['/editor/range.js'].branchData['186'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['188'] = [];
  _$jscoverage['/editor/range.js'].branchData['188'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['202'] = [];
  _$jscoverage['/editor/range.js'].branchData['202'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['211'] = [];
  _$jscoverage['/editor/range.js'].branchData['211'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['217'] = [];
  _$jscoverage['/editor/range.js'].branchData['217'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['243'] = [];
  _$jscoverage['/editor/range.js'].branchData['243'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['251'] = [];
  _$jscoverage['/editor/range.js'].branchData['251'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['264'] = [];
  _$jscoverage['/editor/range.js'].branchData['264'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['268'] = [];
  _$jscoverage['/editor/range.js'].branchData['268'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['268'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['280'] = [];
  _$jscoverage['/editor/range.js'].branchData['280'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['285'] = [];
  _$jscoverage['/editor/range.js'].branchData['285'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['285'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['285'][3] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['293'] = [];
  _$jscoverage['/editor/range.js'].branchData['293'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['300'] = [];
  _$jscoverage['/editor/range.js'].branchData['300'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['310'] = [];
  _$jscoverage['/editor/range.js'].branchData['310'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['319'] = [];
  _$jscoverage['/editor/range.js'].branchData['319'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['328'] = [];
  _$jscoverage['/editor/range.js'].branchData['328'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['332'] = [];
  _$jscoverage['/editor/range.js'].branchData['332'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['332'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['341'] = [];
  _$jscoverage['/editor/range.js'].branchData['341'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['350'] = [];
  _$jscoverage['/editor/range.js'].branchData['350'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['358'] = [];
  _$jscoverage['/editor/range.js'].branchData['358'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['368'] = [];
  _$jscoverage['/editor/range.js'].branchData['368'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['373'] = [];
  _$jscoverage['/editor/range.js'].branchData['373'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['377'] = [];
  _$jscoverage['/editor/range.js'].branchData['377'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['379'] = [];
  _$jscoverage['/editor/range.js'].branchData['379'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['379'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['379'][3] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['381'] = [];
  _$jscoverage['/editor/range.js'].branchData['381'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['387'] = [];
  _$jscoverage['/editor/range.js'].branchData['387'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['389'] = [];
  _$jscoverage['/editor/range.js'].branchData['389'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['389'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['390'] = [];
  _$jscoverage['/editor/range.js'].branchData['390'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['391'] = [];
  _$jscoverage['/editor/range.js'].branchData['391'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['403'] = [];
  _$jscoverage['/editor/range.js'].branchData['403'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['403'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['404'] = [];
  _$jscoverage['/editor/range.js'].branchData['404'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['409'] = [];
  _$jscoverage['/editor/range.js'].branchData['409'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['424'] = [];
  _$jscoverage['/editor/range.js'].branchData['424'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['428'] = [];
  _$jscoverage['/editor/range.js'].branchData['428'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['436'] = [];
  _$jscoverage['/editor/range.js'].branchData['436'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['437'] = [];
  _$jscoverage['/editor/range.js'].branchData['437'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['438'] = [];
  _$jscoverage['/editor/range.js'].branchData['438'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['438'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['439'] = [];
  _$jscoverage['/editor/range.js'].branchData['439'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['466'] = [];
  _$jscoverage['/editor/range.js'].branchData['466'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['467'] = [];
  _$jscoverage['/editor/range.js'].branchData['467'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['482'] = [];
  _$jscoverage['/editor/range.js'].branchData['482'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['483'] = [];
  _$jscoverage['/editor/range.js'].branchData['483'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['485'] = [];
  _$jscoverage['/editor/range.js'].branchData['485'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['493'] = [];
  _$jscoverage['/editor/range.js'].branchData['493'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['494'] = [];
  _$jscoverage['/editor/range.js'].branchData['494'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['496'] = [];
  _$jscoverage['/editor/range.js'].branchData['496'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['539'] = [];
  _$jscoverage['/editor/range.js'].branchData['539'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['540'] = [];
  _$jscoverage['/editor/range.js'].branchData['540'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['540'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['544'] = [];
  _$jscoverage['/editor/range.js'].branchData['544'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['545'] = [];
  _$jscoverage['/editor/range.js'].branchData['545'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['545'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['566'] = [];
  _$jscoverage['/editor/range.js'].branchData['566'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['566'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['574'] = [];
  _$jscoverage['/editor/range.js'].branchData['574'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['597'] = [];
  _$jscoverage['/editor/range.js'].branchData['597'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['597'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['605'] = [];
  _$jscoverage['/editor/range.js'].branchData['605'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['626'] = [];
  _$jscoverage['/editor/range.js'].branchData['626'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['657'] = [];
  _$jscoverage['/editor/range.js'].branchData['657'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['702'] = [];
  _$jscoverage['/editor/range.js'].branchData['702'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['743'] = [];
  _$jscoverage['/editor/range.js'].branchData['743'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['743'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['744'] = [];
  _$jscoverage['/editor/range.js'].branchData['744'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['752'] = [];
  _$jscoverage['/editor/range.js'].branchData['752'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['763'] = [];
  _$jscoverage['/editor/range.js'].branchData['763'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['774'] = [];
  _$jscoverage['/editor/range.js'].branchData['774'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['775'] = [];
  _$jscoverage['/editor/range.js'].branchData['775'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['788'] = [];
  _$jscoverage['/editor/range.js'].branchData['788'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['789'] = [];
  _$jscoverage['/editor/range.js'].branchData['789'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['790'] = [];
  _$jscoverage['/editor/range.js'].branchData['790'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['792'] = [];
  _$jscoverage['/editor/range.js'].branchData['792'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['802'] = [];
  _$jscoverage['/editor/range.js'].branchData['802'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['803'] = [];
  _$jscoverage['/editor/range.js'].branchData['803'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['804'] = [];
  _$jscoverage['/editor/range.js'].branchData['804'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['806'] = [];
  _$jscoverage['/editor/range.js'].branchData['806'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['814'] = [];
  _$jscoverage['/editor/range.js'].branchData['814'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['819'] = [];
  _$jscoverage['/editor/range.js'].branchData['819'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['819'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['825'] = [];
  _$jscoverage['/editor/range.js'].branchData['825'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['825'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['826'] = [];
  _$jscoverage['/editor/range.js'].branchData['826'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['830'] = [];
  _$jscoverage['/editor/range.js'].branchData['830'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['830'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['833'] = [];
  _$jscoverage['/editor/range.js'].branchData['833'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['833'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['841'] = [];
  _$jscoverage['/editor/range.js'].branchData['841'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['842'] = [];
  _$jscoverage['/editor/range.js'].branchData['842'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['843'] = [];
  _$jscoverage['/editor/range.js'].branchData['843'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['848'] = [];
  _$jscoverage['/editor/range.js'].branchData['848'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['850'] = [];
  _$jscoverage['/editor/range.js'].branchData['850'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['851'] = [];
  _$jscoverage['/editor/range.js'].branchData['851'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['856'] = [];
  _$jscoverage['/editor/range.js'].branchData['856'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['876'] = [];
  _$jscoverage['/editor/range.js'].branchData['876'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['883'] = [];
  _$jscoverage['/editor/range.js'].branchData['883'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['886'] = [];
  _$jscoverage['/editor/range.js'].branchData['886'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['891'] = [];
  _$jscoverage['/editor/range.js'].branchData['891'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['891'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['891'][3] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['891'][4] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['892'] = [];
  _$jscoverage['/editor/range.js'].branchData['892'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['892'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['892'][3] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['900'] = [];
  _$jscoverage['/editor/range.js'].branchData['900'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['900'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['901'] = [];
  _$jscoverage['/editor/range.js'].branchData['901'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['902'] = [];
  _$jscoverage['/editor/range.js'].branchData['902'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['908'] = [];
  _$jscoverage['/editor/range.js'].branchData['908'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['911'] = [];
  _$jscoverage['/editor/range.js'].branchData['911'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['916'] = [];
  _$jscoverage['/editor/range.js'].branchData['916'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['916'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['917'] = [];
  _$jscoverage['/editor/range.js'].branchData['917'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['917'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['917'][3] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['917'][4] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['918'] = [];
  _$jscoverage['/editor/range.js'].branchData['918'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['925'] = [];
  _$jscoverage['/editor/range.js'].branchData['925'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['925'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['926'] = [];
  _$jscoverage['/editor/range.js'].branchData['926'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['927'] = [];
  _$jscoverage['/editor/range.js'].branchData['927'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['962'] = [];
  _$jscoverage['/editor/range.js'].branchData['962'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['968'] = [];
  _$jscoverage['/editor/range.js'].branchData['968'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['972'] = [];
  _$jscoverage['/editor/range.js'].branchData['972'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['986'] = [];
  _$jscoverage['/editor/range.js'].branchData['986'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1023'] = [];
  _$jscoverage['/editor/range.js'].branchData['1023'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1023'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1024'] = [];
  _$jscoverage['/editor/range.js'].branchData['1024'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1025'] = [];
  _$jscoverage['/editor/range.js'].branchData['1025'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1028'] = [];
  _$jscoverage['/editor/range.js'].branchData['1028'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1031'] = [];
  _$jscoverage['/editor/range.js'].branchData['1031'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1045'] = [];
  _$jscoverage['/editor/range.js'].branchData['1045'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1047'] = [];
  _$jscoverage['/editor/range.js'].branchData['1047'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1054'] = [];
  _$jscoverage['/editor/range.js'].branchData['1054'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1063'] = [];
  _$jscoverage['/editor/range.js'].branchData['1063'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1063'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1064'] = [];
  _$jscoverage['/editor/range.js'].branchData['1064'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1064'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1067'] = [];
  _$jscoverage['/editor/range.js'].branchData['1067'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1070'] = [];
  _$jscoverage['/editor/range.js'].branchData['1070'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1097'] = [];
  _$jscoverage['/editor/range.js'].branchData['1097'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1101'] = [];
  _$jscoverage['/editor/range.js'].branchData['1101'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1115'] = [];
  _$jscoverage['/editor/range.js'].branchData['1115'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1119'] = [];
  _$jscoverage['/editor/range.js'].branchData['1119'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1126'] = [];
  _$jscoverage['/editor/range.js'].branchData['1126'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1147'] = [];
  _$jscoverage['/editor/range.js'].branchData['1147'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1167'] = [];
  _$jscoverage['/editor/range.js'].branchData['1167'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1168'] = [];
  _$jscoverage['/editor/range.js'].branchData['1168'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1169'] = [];
  _$jscoverage['/editor/range.js'].branchData['1169'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1169'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1170'] = [];
  _$jscoverage['/editor/range.js'].branchData['1170'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1179'] = [];
  _$jscoverage['/editor/range.js'].branchData['1179'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1179'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1201'] = [];
  _$jscoverage['/editor/range.js'].branchData['1201'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1202'] = [];
  _$jscoverage['/editor/range.js'].branchData['1202'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1204'] = [];
  _$jscoverage['/editor/range.js'].branchData['1204'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1208'] = [];
  _$jscoverage['/editor/range.js'].branchData['1208'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1219'] = [];
  _$jscoverage['/editor/range.js'].branchData['1219'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1227'] = [];
  _$jscoverage['/editor/range.js'].branchData['1227'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1235'] = [];
  _$jscoverage['/editor/range.js'].branchData['1235'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1237'] = [];
  _$jscoverage['/editor/range.js'].branchData['1237'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1250'] = [];
  _$jscoverage['/editor/range.js'].branchData['1250'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1254'] = [];
  _$jscoverage['/editor/range.js'].branchData['1254'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1273'] = [];
  _$jscoverage['/editor/range.js'].branchData['1273'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1283'] = [];
  _$jscoverage['/editor/range.js'].branchData['1283'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1305'] = [];
  _$jscoverage['/editor/range.js'].branchData['1305'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1310'] = [];
  _$jscoverage['/editor/range.js'].branchData['1310'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1318'] = [];
  _$jscoverage['/editor/range.js'].branchData['1318'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1318'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1329'] = [];
  _$jscoverage['/editor/range.js'].branchData['1329'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1335'] = [];
  _$jscoverage['/editor/range.js'].branchData['1335'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1335'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1343'] = [];
  _$jscoverage['/editor/range.js'].branchData['1343'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1343'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1343'][3] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1354'] = [];
  _$jscoverage['/editor/range.js'].branchData['1354'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1362'] = [];
  _$jscoverage['/editor/range.js'].branchData['1362'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1368'] = [];
  _$jscoverage['/editor/range.js'].branchData['1368'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1368'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1368'][3] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1373'] = [];
  _$jscoverage['/editor/range.js'].branchData['1373'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1391'] = [];
  _$jscoverage['/editor/range.js'].branchData['1391'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1391'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1393'] = [];
  _$jscoverage['/editor/range.js'].branchData['1393'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1410'] = [];
  _$jscoverage['/editor/range.js'].branchData['1410'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1428'] = [];
  _$jscoverage['/editor/range.js'].branchData['1428'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1430'] = [];
  _$jscoverage['/editor/range.js'].branchData['1430'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1447'] = [];
  _$jscoverage['/editor/range.js'].branchData['1447'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1463'] = [];
  _$jscoverage['/editor/range.js'].branchData['1463'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1465'] = [];
  _$jscoverage['/editor/range.js'].branchData['1465'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1472'] = [];
  _$jscoverage['/editor/range.js'].branchData['1472'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1488'] = [];
  _$jscoverage['/editor/range.js'].branchData['1488'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1490'] = [];
  _$jscoverage['/editor/range.js'].branchData['1490'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1492'] = [];
  _$jscoverage['/editor/range.js'].branchData['1492'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1508'] = [];
  _$jscoverage['/editor/range.js'].branchData['1508'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1512'] = [];
  _$jscoverage['/editor/range.js'].branchData['1512'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1514'] = [];
  _$jscoverage['/editor/range.js'].branchData['1514'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1518'] = [];
  _$jscoverage['/editor/range.js'].branchData['1518'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1533'] = [];
  _$jscoverage['/editor/range.js'].branchData['1533'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1558'] = [];
  _$jscoverage['/editor/range.js'].branchData['1558'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1582'] = [];
  _$jscoverage['/editor/range.js'].branchData['1582'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1587'] = [];
  _$jscoverage['/editor/range.js'].branchData['1587'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1588'] = [];
  _$jscoverage['/editor/range.js'].branchData['1588'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1593'] = [];
  _$jscoverage['/editor/range.js'].branchData['1593'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1599'] = [];
  _$jscoverage['/editor/range.js'].branchData['1599'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1600'] = [];
  _$jscoverage['/editor/range.js'].branchData['1600'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1605'] = [];
  _$jscoverage['/editor/range.js'].branchData['1605'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1605'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1606'] = [];
  _$jscoverage['/editor/range.js'].branchData['1606'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1610'] = [];
  _$jscoverage['/editor/range.js'].branchData['1610'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1619'] = [];
  _$jscoverage['/editor/range.js'].branchData['1619'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1641'] = [];
  _$jscoverage['/editor/range.js'].branchData['1641'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1672'] = [];
  _$jscoverage['/editor/range.js'].branchData['1672'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1672'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1677'] = [];
  _$jscoverage['/editor/range.js'].branchData['1677'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1688'] = [];
  _$jscoverage['/editor/range.js'].branchData['1688'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1697'] = [];
  _$jscoverage['/editor/range.js'].branchData['1697'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1697'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1717'] = [];
  _$jscoverage['/editor/range.js'].branchData['1717'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1734'] = [];
  _$jscoverage['/editor/range.js'].branchData['1734'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1736'] = [];
  _$jscoverage['/editor/range.js'].branchData['1736'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1736'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1740'] = [];
  _$jscoverage['/editor/range.js'].branchData['1740'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1750'] = [];
  _$jscoverage['/editor/range.js'].branchData['1750'][1] = new BranchData();
}
_$jscoverage['/editor/range.js'].branchData['1750'][1].init(760, 4, 'last');
function visit625_1750_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1750'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1740'][1].init(232, 50, 'self.checkStartOfBlock() && self.checkEndOfBlock()');
function visit624_1740_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1740'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1736'][2].init(129, 32, 'tmpDtd && tmpDtd[elementName]');
function visit623_1736_2(result) {
  _$jscoverage['/editor/range.js'].branchData['1736'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1736'][1].init(88, 74, '(tmpDtd = dtd[current.nodeName()]) && !(tmpDtd && tmpDtd[elementName])');
function visit622_1736_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1736'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1734'][1].init(255, 7, 'isBlock');
function visit621_1734_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1734'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1717'][1].init(115, 43, 'domNode.nodeType === Dom.NodeType.TEXT_NODE');
function visit620_1717_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1717'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1697'][2].init(482, 44, 'el[0].nodeType === Dom.NodeType.ELEMENT_NODE');
function visit619_1697_2(result) {
  _$jscoverage['/editor/range.js'].branchData['1697'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1697'][1].init(482, 66, 'el[0].nodeType === Dom.NodeType.ELEMENT_NODE && el._4eIsEditable()');
function visit618_1697_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1697'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1688'][1].init(85, 41, 'el[0].nodeType === Dom.NodeType.TEXT_NODE');
function visit617_1688_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1688'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1677'][1].init(278, 19, '!childOnly && !next');
function visit616_1677_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1677'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1672'][2].init(48, 46, 'node[0].nodeType === Dom.NodeType.ELEMENT_NODE');
function visit615_1672_2(result) {
  _$jscoverage['/editor/range.js'].branchData['1672'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1672'][1].init(48, 90, 'node[0].nodeType === Dom.NodeType.ELEMENT_NODE && node._4eIsEditable()');
function visit614_1672_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1672'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1641'][1].init(46, 15, '!self.collapsed');
function visit613_1641_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1641'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1619'][1].init(296, 57, '!UA.ie && !S.inArray(startBlock.nodeName(), [\'ul\', \'ol\'])');
function visit612_1619_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1619'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1610'][1].init(249, 14, 'isStartOfBlock');
function visit611_1610_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1610'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1606'][1].init(21, 12, 'isEndOfBlock');
function visit610_1606_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1606'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1605'][2].init(1257, 29, 'startBlock[0] === endBlock[0]');
function visit609_1605_2(result) {
  _$jscoverage['/editor/range.js'].branchData['1605'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1605'][1].init(1243, 43, 'startBlock && startBlock[0] === endBlock[0]');
function visit608_1605_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1605'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1600'][1].init(91, 34, 'endBlock && self.checkEndOfBlock()');
function visit607_1600_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1600'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1599'][1].init(1039, 38, 'startBlock && self.checkStartOfBlock()');
function visit606_1599_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1599'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1593'][1].init(212, 9, '!endBlock');
function visit605_1593_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1593'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1588'][1].init(21, 11, '!startBlock');
function visit604_1588_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1588'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1587'][1].init(626, 17, 'blockTag !== \'br\'');
function visit603_1587_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1587'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1582'][1].init(482, 38, '!startBlockLimit.equals(endBlockLimit)');
function visit602_1582_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1582'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1558'][1].init(354, 6, '!UA.ie');
function visit601_1558_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1558'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1533'][1].init(2355, 55, 'startNode._4ePosition(endNode) & KEP.POSITION_FOLLOWING');
function visit600_1533_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1533'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1518'][1].init(305, 16, 'childCount === 0');
function visit599_1518_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1518'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1514'][1].init(80, 22, 'childCount > endOffset');
function visit598_1514_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1514'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1512'][1].init(1364, 49, 'endNode[0].nodeType === Dom.NodeType.ELEMENT_NODE');
function visit597_1512_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1512'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1508'][1].init(599, 42, 'startNode._4eNextSourceNode() || startNode');
function visit596_1508_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1508'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1492'][1].init(211, 16, 'childCount === 0');
function visit595_1492_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1492'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1490'][1].init(82, 24, 'childCount > startOffset');
function visit594_1490_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1490'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1488'][1].init(261, 51, 'startNode[0].nodeType === Dom.NodeType.ELEMENT_NODE');
function visit593_1488_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1488'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1472'][1].init(7, 23, 'checkType === KER.START');
function visit592_1472_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1472'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1465'][1].init(219, 23, 'checkType === KER.START');
function visit591_1465_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1465'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1463'][1].init(12, 23, 'checkType === KER.START');
function visit590_1463_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1463'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1447'][1].init(1113, 29, 'path.block || path.blockLimit');
function visit589_1447_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1447'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1430'][1].init(109, 16, 'textAfter.length');
function visit588_1430_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1430'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1428'][1].init(265, 51, 'endContainer[0].nodeType === Dom.NodeType.TEXT_NODE');
function visit587_1428_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1428'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1410'][1].init(1171, 29, 'path.block || path.blockLimit');
function visit586_1410_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1410'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1393'][1].init(117, 17, 'textBefore.length');
function visit585_1393_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1393'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1391'][2].init(309, 53, 'startContainer[0].nodeType === Dom.NodeType.TEXT_NODE');
function visit584_1391_2(result) {
  _$jscoverage['/editor/range.js'].branchData['1391'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1391'][1].init(294, 68, 'startOffset && startContainer[0].nodeType === Dom.NodeType.TEXT_NODE');
function visit583_1391_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1391'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1373'][1].init(4371, 6, 'tailBr');
function visit582_1373_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1373'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1368'][3].init(128, 50, 'enlargeable && blockBoundary.contains(enlargeable)');
function visit581_1368_3(result) {
  _$jscoverage['/editor/range.js'].branchData['1368'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1368'][2].init(86, 38, '!enlargeable && self.checkEndOfBlock()');
function visit580_1368_2(result) {
  _$jscoverage['/editor/range.js'].branchData['1368'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1368'][1].init(86, 92, '!enlargeable && self.checkEndOfBlock() || enlargeable && blockBoundary.contains(enlargeable)');
function visit579_1368_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1368'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1362'][1].init(3683, 21, 'blockBoundary || body');
function visit578_1362_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1362'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1354'][1].init(3262, 39, 'unit === KER.ENLARGE_LIST_ITEM_CONTENTS');
function visit577_1354_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1354'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1343'][3].init(586, 50, 'enlargeable && blockBoundary.contains(enlargeable)');
function visit576_1343_3(result) {
  _$jscoverage['/editor/range.js'].branchData['1343'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1343'][2].init(542, 40, '!enlargeable && self.checkStartOfBlock()');
function visit575_1343_2(result) {
  _$jscoverage['/editor/range.js'].branchData['1343'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1343'][1].init(542, 94, '!enlargeable && self.checkStartOfBlock() || enlargeable && blockBoundary.contains(enlargeable)');
function visit574_1343_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1343'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1335'][2].init(88, 33, 'blockBoundary.nodeName() !== \'br\'');
function visit573_1335_2(result) {
  _$jscoverage['/editor/range.js'].branchData['1335'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1335'][1].init(-1, 550, 'blockBoundary.nodeName() !== \'br\' && (!enlargeable && self.checkStartOfBlock() || enlargeable && blockBoundary.contains(enlargeable))');
function visit572_1335_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1335'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1329'][1].init(1900, 21, 'blockBoundary || body');
function visit571_1329_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1329'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1318'][2].init(114, 27, 'Dom.nodeName(node) === \'br\'');
function visit570_1318_2(result) {
  _$jscoverage['/editor/range.js'].branchData['1318'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1318'][1].init(103, 38, '!retVal && Dom.nodeName(node) === \'br\'');
function visit569_1318_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1318'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1310'][1].init(102, 7, '!retVal');
function visit568_1310_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1310'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1305'][1].init(54, 39, 'unit === KER.ENLARGE_LIST_ITEM_CONTENTS');
function visit567_1305_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1305'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1283'][1].init(418, 18, 'stop[0] && stop[1]');
function visit566_1283_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1283'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1273'][1].init(55, 14, 'self.collapsed');
function visit565_1273_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1273'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1254'][1].init(961, 47, 'commonReached || enlarge.equals(commonAncestor)');
function visit564_1254_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1254'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1250'][1].init(849, 29, 'enlarge.nodeName() === \'body\'');
function visit563_1250_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1250'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1237'][1].init(67, 14, '!commonReached');
function visit562_1237_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1237'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1235'][1].init(385, 7, 'sibling');
function visit561_1235_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1235'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1227'][1].init(29, 44, 'isWhitespace(sibling) || isBookmark(sibling)');
function visit560_1227_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1227'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1219'][1].init(64, 57, 'container[0].childNodes[offset + (left ? -1 : 1)] || null');
function visit559_1219_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1219'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1208'][1].init(29, 38, 'offset < container[0].nodeValue.length');
function visit558_1208_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1208'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1204'][1].init(68, 6, 'offset');
function visit557_1204_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1204'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1202'][1].init(25, 4, 'left');
function visit556_1202_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1202'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1201'][1].init(386, 48, 'container[0].nodeType === Dom.NodeType.TEXT_NODE');
function visit555_1201_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1201'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1179'][2].init(642, 47, 'ancestor[0].nodeType === Dom.NodeType.TEXT_NODE');
function visit554_1179_2(result) {
  _$jscoverage['/editor/range.js'].branchData['1179'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1179'][1].init(624, 65, 'ignoreTextNode && ancestor[0].nodeType === Dom.NodeType.TEXT_NODE');
function visit553_1179_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1179'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1170'][1].init(70, 39, 'self.startOffset === self.endOffset - 1');
function visit552_1170_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1170'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1169'][2].init(58, 47, 'start[0].nodeType === Dom.NodeType.ELEMENT_NODE');
function visit551_1169_2(result) {
  _$jscoverage['/editor/range.js'].branchData['1169'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1169'][1].init(34, 110, 'start[0].nodeType === Dom.NodeType.ELEMENT_NODE && self.startOffset === self.endOffset - 1');
function visit550_1169_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1169'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1168'][1].init(21, 145, 'includeSelf && start[0].nodeType === Dom.NodeType.ELEMENT_NODE && self.startOffset === self.endOffset - 1');
function visit549_1168_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1168'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1167'][1].init(159, 19, 'start[0] === end[0]');
function visit548_1167_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1167'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1147'][1].init(767, 21, 'endNode && endNode[0]');
function visit547_1147_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1147'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1126'][1].init(554, 12, 'endContainer');
function visit546_1126_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1126'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1119'][1].init(169, 70, 'bookmark.end && doc._4eGetByAddress(bookmark.end, bookmark.normalized)');
function visit545_1119_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1119'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1115'][1].init(86, 12, 'bookmark.is2');
function visit544_1115_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1115'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1101'][1].init(423, 42, 'startContainer[0] === self.endContainer[0]');
function visit543_1101_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1101'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1097'][1].init(116, 49, 'startContainer[0].childNodes[startOffset] || null');
function visit542_1097_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1097'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1070'][1].init(285, 45, 'endOffset >= endContainer[0].nodeValue.length');
function visit541_1070_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1070'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1067'][1].init(128, 10, '!endOffset');
function visit540_1067_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1067'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1064'][2].init(2050, 51, 'endContainer[0].nodeType === Dom.NodeType.TEXT_NODE');
function visit539_1064_2(result) {
  _$jscoverage['/editor/range.js'].branchData['1064'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1064'][1].init(44, 70, 'endContainer[0] && endContainer[0].nodeType === Dom.NodeType.TEXT_NODE');
function visit538_1064_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1064'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1063'][2].init(1986, 22, 'ignoreEnd || collapsed');
function visit537_1063_2(result) {
  _$jscoverage['/editor/range.js'].branchData['1063'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1063'][1].init(1984, 115, '!(ignoreEnd || collapsed) && endContainer[0] && endContainer[0].nodeType === Dom.NodeType.TEXT_NODE');
function visit536_1063_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1063'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1054'][1].init(1425, 9, 'collapsed');
function visit535_1054_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1054'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1047'][1].init(600, 45, 'Dom.equals(startContainer, self.endContainer)');
function visit534_1047_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1047'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1045'][1].init(432, 50, 'Dom.equals(self.startContainer, self.endContainer)');
function visit533_1045_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1045'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1031'][1].init(295, 49, 'startOffset >= startContainer[0].nodeValue.length');
function visit532_1031_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1031'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1028'][1].init(128, 12, '!startOffset');
function visit531_1028_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1028'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1025'][1].init(36, 53, 'startContainer[0].nodeType === Dom.NodeType.TEXT_NODE');
function visit530_1025_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1025'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1024'][1].init(45, 90, 'startContainer[0] && startContainer[0].nodeType === Dom.NodeType.TEXT_NODE');
function visit529_1024_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1024'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1023'][2].init(194, 25, '!ignoreStart || collapsed');
function visit528_1023_2(result) {
  _$jscoverage['/editor/range.js'].branchData['1023'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1023'][1].init(194, 136, '(!ignoreStart || collapsed) && startContainer[0] && startContainer[0].nodeType === Dom.NodeType.TEXT_NODE');
function visit527_1023_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1023'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['986'][1].init(1218, 7, 'endNode');
function visit526_986_1(result) {
  _$jscoverage['/editor/range.js'].branchData['986'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['972'][1].init(107, 12, 'serializable');
function visit525_972_1(result) {
  _$jscoverage['/editor/range.js'].branchData['972'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['968'][1].init(711, 10, '!collapsed');
function visit524_968_1(result) {
  _$jscoverage['/editor/range.js'].branchData['968'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['962'][1].init(507, 12, 'serializable');
function visit523_962_1(result) {
  _$jscoverage['/editor/range.js'].branchData['962'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['927'][1].init(70, 47, 'previous[0].nodeType === Dom.NodeType.TEXT_NODE');
function visit522_927_1(result) {
  _$jscoverage['/editor/range.js'].branchData['927'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['926'][1].init(79, 118, '(previous = endContainer.prev(undefined, 1)) && previous[0].nodeType === Dom.NodeType.TEXT_NODE');
function visit521_926_1(result) {
  _$jscoverage['/editor/range.js'].branchData['926'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['925'][2].init(844, 51, 'endContainer[0].nodeType === Dom.NodeType.TEXT_NODE');
function visit520_925_2(result) {
  _$jscoverage['/editor/range.js'].branchData['925'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['925'][1].init(844, 198, 'endContainer[0].nodeType === Dom.NodeType.TEXT_NODE && (previous = endContainer.prev(undefined, 1)) && previous[0].nodeType === Dom.NodeType.TEXT_NODE');
function visit519_925_1(result) {
  _$jscoverage['/editor/range.js'].branchData['925'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['918'][1].init(44, 60, 'child[0].previousSibling.nodeType === Dom.NodeType.TEXT_NODE');
function visit518_918_1(result) {
  _$jscoverage['/editor/range.js'].branchData['918'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['917'][4].init(326, 13, 'endOffset > 0');
function visit517_917_4(result) {
  _$jscoverage['/editor/range.js'].branchData['917'][4].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['917'][3].init(47, 105, 'endOffset > 0 && child[0].previousSibling.nodeType === Dom.NodeType.TEXT_NODE');
function visit516_917_3(result) {
  _$jscoverage['/editor/range.js'].branchData['917'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['917'][2].init(277, 44, 'child[0].nodeType === Dom.NodeType.TEXT_NODE');
function visit515_917_2(result) {
  _$jscoverage['/editor/range.js'].branchData['917'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['917'][1].init(39, 153, 'child[0].nodeType === Dom.NodeType.TEXT_NODE && endOffset > 0 && child[0].previousSibling.nodeType === Dom.NodeType.TEXT_NODE');
function visit514_917_1(result) {
  _$jscoverage['/editor/range.js'].branchData['917'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['916'][2].init(234, 193, 'child[0] && child[0].nodeType === Dom.NodeType.TEXT_NODE && endOffset > 0 && child[0].previousSibling.nodeType === Dom.NodeType.TEXT_NODE');
function visit513_916_2(result) {
  _$jscoverage['/editor/range.js'].branchData['916'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['916'][1].init(225, 202, 'child && child[0] && child[0].nodeType === Dom.NodeType.TEXT_NODE && endOffset > 0 && child[0].previousSibling.nodeType === Dom.NodeType.TEXT_NODE');
function visit512_916_1(result) {
  _$jscoverage['/editor/range.js'].branchData['916'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['911'][1].init(145, 54, 'endContainer[0].nodeType === Dom.NodeType.ELEMENT_NODE');
function visit511_911_1(result) {
  _$jscoverage['/editor/range.js'].branchData['911'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['908'][1].init(1183, 15, '!self.collapsed');
function visit510_908_1(result) {
  _$jscoverage['/editor/range.js'].branchData['908'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['902'][1].init(68, 47, 'previous[0].nodeType === Dom.NodeType.TEXT_NODE');
function visit509_902_1(result) {
  _$jscoverage['/editor/range.js'].branchData['902'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['901'][1].init(77, 116, '(previous = startContainer.prev(undefined, 1)) && previous[0].nodeType === Dom.NodeType.TEXT_NODE');
function visit508_901_1(result) {
  _$jscoverage['/editor/range.js'].branchData['901'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['900'][2].init(775, 53, 'startContainer[0].nodeType === Dom.NodeType.TEXT_NODE');
function visit507_900_2(result) {
  _$jscoverage['/editor/range.js'].branchData['900'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['900'][1].init(775, 194, 'startContainer[0].nodeType === Dom.NodeType.TEXT_NODE && (previous = startContainer.prev(undefined, 1)) && previous[0].nodeType === Dom.NodeType.TEXT_NODE');
function visit506_900_1(result) {
  _$jscoverage['/editor/range.js'].branchData['900'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['892'][3].init(18, 60, 'child[0].previousSibling.nodeType === Dom.NodeType.TEXT_NODE');
function visit505_892_3(result) {
  _$jscoverage['/editor/range.js'].branchData['892'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['892'][2].init(310, 15, 'startOffset > 0');
function visit504_892_2(result) {
  _$jscoverage['/editor/range.js'].branchData['892'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['892'][1].init(71, 79, 'startOffset > 0 && child[0].previousSibling.nodeType === Dom.NodeType.TEXT_NODE');
function visit503_892_1(result) {
  _$jscoverage['/editor/range.js'].branchData['892'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['891'][4].init(234, 44, 'child[0].nodeType === Dom.NodeType.TEXT_NODE');
function visit502_891_4(result) {
  _$jscoverage['/editor/range.js'].branchData['891'][4].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['891'][3].init(234, 151, 'child[0].nodeType === Dom.NodeType.TEXT_NODE && startOffset > 0 && child[0].previousSibling.nodeType === Dom.NodeType.TEXT_NODE');
function visit501_891_3(result) {
  _$jscoverage['/editor/range.js'].branchData['891'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['891'][2].init(222, 163, 'child[0] && child[0].nodeType === Dom.NodeType.TEXT_NODE && startOffset > 0 && child[0].previousSibling.nodeType === Dom.NodeType.TEXT_NODE');
function visit500_891_2(result) {
  _$jscoverage['/editor/range.js'].branchData['891'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['891'][1].init(213, 172, 'child && child[0] && child[0].nodeType === Dom.NodeType.TEXT_NODE && startOffset > 0 && child[0].previousSibling.nodeType === Dom.NodeType.TEXT_NODE');
function visit499_891_1(result) {
  _$jscoverage['/editor/range.js'].branchData['891'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['886'][1].init(133, 56, 'startContainer[0].nodeType === Dom.NodeType.ELEMENT_NODE');
function visit498_886_1(result) {
  _$jscoverage['/editor/range.js'].branchData['886'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['883'][1].init(621, 10, 'normalized');
function visit497_883_1(result) {
  _$jscoverage['/editor/range.js'].branchData['883'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['876'][1].init(453, 32, '!startContainer || !endContainer');
function visit496_876_1(result) {
  _$jscoverage['/editor/range.js'].branchData['876'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['856'][1].init(3636, 20, 'moveStart || moveEnd');
function visit495_856_1(result) {
  _$jscoverage['/editor/range.js'].branchData['856'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['851'][1].init(164, 7, 'textEnd');
function visit494_851_1(result) {
  _$jscoverage['/editor/range.js'].branchData['851'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['850'][1].init(78, 27, 'mode === KER.SHRINK_ELEMENT');
function visit493_850_1(result) {
  _$jscoverage['/editor/range.js'].branchData['850'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['848'][1].init(3272, 7, 'moveEnd');
function visit492_848_1(result) {
  _$jscoverage['/editor/range.js'].branchData['848'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['843'][1].init(125, 9, 'textStart');
function visit491_843_1(result) {
  _$jscoverage['/editor/range.js'].branchData['843'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['842'][1].init(44, 27, 'mode === KER.SHRINK_ELEMENT');
function visit490_842_1(result) {
  _$jscoverage['/editor/range.js'].branchData['842'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['841'][1].init(2938, 9, 'moveStart');
function visit489_841_1(result) {
  _$jscoverage['/editor/range.js'].branchData['841'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['833'][2].init(556, 43, 'node.nodeType === Dom.NodeType.ELEMENT_NODE');
function visit488_833_2(result) {
  _$jscoverage['/editor/range.js'].branchData['833'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['833'][1].init(542, 57, '!movingOut && node.nodeType === Dom.NodeType.ELEMENT_NODE');
function visit487_833_1(result) {
  _$jscoverage['/editor/range.js'].branchData['833'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['830'][2].init(419, 23, 'node === currentElement');
function visit486_830_2(result) {
  _$jscoverage['/editor/range.js'].branchData['830'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['830'][1].init(406, 36, 'movingOut && node === currentElement');
function visit485_830_1(result) {
  _$jscoverage['/editor/range.js'].branchData['830'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['826'][1].init(58, 40, 'node.nodeType === Dom.NodeType.TEXT_NODE');
function visit484_826_1(result) {
  _$jscoverage['/editor/range.js'].branchData['826'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['825'][2].init(127, 27, 'mode === KER.SHRINK_ELEMENT');
function visit483_825_2(result) {
  _$jscoverage['/editor/range.js'].branchData['825'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['825'][1].init(127, 99, 'mode === KER.SHRINK_ELEMENT && node.nodeType === Dom.NodeType.TEXT_NODE');
function visit482_825_1(result) {
  _$jscoverage['/editor/range.js'].branchData['825'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['819'][2].init(51, 27, 'mode === KER.SHRINK_ELEMENT');
function visit481_819_2(result) {
  _$jscoverage['/editor/range.js'].branchData['819'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['819'][1].init(32, 128, 'node.nodeType === (mode === KER.SHRINK_ELEMENT ? Dom.NodeType.ELEMENT_NODE : Dom.NodeType.TEXT_NODE)');
function visit480_819_1(result) {
  _$jscoverage['/editor/range.js'].branchData['819'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['814'][1].init(1773, 20, 'moveStart || moveEnd');
function visit479_814_1(result) {
  _$jscoverage['/editor/range.js'].branchData['814'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['806'][1].init(135, 45, 'endOffset >= endContainer[0].nodeValue.length');
function visit478_806_1(result) {
  _$jscoverage['/editor/range.js'].branchData['806'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['804'][1].init(25, 10, '!endOffset');
function visit477_804_1(result) {
  _$jscoverage['/editor/range.js'].branchData['804'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['803'][1].init(35, 51, 'endContainer[0].nodeType === Dom.NodeType.TEXT_NODE');
function visit476_803_1(result) {
  _$jscoverage['/editor/range.js'].branchData['803'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['802'][1].init(1243, 87, 'endContainer && endContainer[0].nodeType === Dom.NodeType.TEXT_NODE');
function visit475_802_1(result) {
  _$jscoverage['/editor/range.js'].branchData['802'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['792'][1].init(141, 49, 'startOffset >= startContainer[0].nodeValue.length');
function visit474_792_1(result) {
  _$jscoverage['/editor/range.js'].branchData['792'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['790'][1].init(25, 12, '!startOffset');
function visit473_790_1(result) {
  _$jscoverage['/editor/range.js'].branchData['790'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['789'][1].init(37, 53, 'startContainer[0].nodeType === Dom.NodeType.TEXT_NODE');
function visit472_789_1(result) {
  _$jscoverage['/editor/range.js'].branchData['789'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['788'][1].init(531, 91, 'startContainer && startContainer[0].nodeType === Dom.NodeType.TEXT_NODE');
function visit471_788_1(result) {
  _$jscoverage['/editor/range.js'].branchData['788'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['775'][1].init(24, 23, 'mode || KER.SHRINK_TEXT');
function visit470_775_1(result) {
  _$jscoverage['/editor/range.js'].branchData['775'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['774'][1].init(97, 15, '!self.collapsed');
function visit469_774_1(result) {
  _$jscoverage['/editor/range.js'].branchData['774'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['763'][1].init(858, 24, 'node && node.equals(pre)');
function visit468_763_1(result) {
  _$jscoverage['/editor/range.js'].branchData['763'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['752'][1].init(24, 46, 'isNotWhitespaces(node) && isNotBookmarks(node)');
function visit467_752_1(result) {
  _$jscoverage['/editor/range.js'].branchData['752'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['744'][1].init(87, 66, 'walkerRange.endContainer[0].nodeType !== Dom.NodeType.ELEMENT_NODE');
function visit466_744_1(result) {
  _$jscoverage['/editor/range.js'].branchData['744'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['743'][2].init(188, 68, 'walkerRange.startContainer[0].nodeType !== Dom.NodeType.ELEMENT_NODE');
function visit465_743_2(result) {
  _$jscoverage['/editor/range.js'].branchData['743'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['743'][1].init(188, 154, 'walkerRange.startContainer[0].nodeType !== Dom.NodeType.ELEMENT_NODE || walkerRange.endContainer[0].nodeType !== Dom.NodeType.ELEMENT_NODE');
function visit464_743_1(result) {
  _$jscoverage['/editor/range.js'].branchData['743'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['702'][1].init(46, 7, 'toStart');
function visit463_702_1(result) {
  _$jscoverage['/editor/range.js'].branchData['702'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['657'][1].init(54, 43, 'node[0].nodeType === Dom.NodeType.TEXT_NODE');
function visit462_657_1(result) {
  _$jscoverage['/editor/range.js'].branchData['657'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['626'][1].init(54, 43, 'node[0].nodeType === Dom.NodeType.TEXT_NODE');
function visit461_626_1(result) {
  _$jscoverage['/editor/range.js'].branchData['626'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['605'][1].init(684, 20, '!self.startContainer');
function visit460_605_1(result) {
  _$jscoverage['/editor/range.js'].branchData['605'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['597'][2].init(391, 49, 'endNode[0].nodeType === Dom.NodeType.ELEMENT_NODE');
function visit459_597_2(result) {
  _$jscoverage['/editor/range.js'].branchData['597'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['597'][1].init(391, 80, 'endNode[0].nodeType === Dom.NodeType.ELEMENT_NODE && EMPTY[endNode.nodeName()]');
function visit458_597_1(result) {
  _$jscoverage['/editor/range.js'].branchData['597'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['574'][1].init(701, 18, '!self.endContainer');
function visit457_574_1(result) {
  _$jscoverage['/editor/range.js'].branchData['574'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['566'][2].init(392, 51, 'startNode[0].nodeType === Dom.NodeType.ELEMENT_NODE');
function visit456_566_2(result) {
  _$jscoverage['/editor/range.js'].branchData['566'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['566'][1].init(392, 84, 'startNode[0].nodeType === Dom.NodeType.ELEMENT_NODE && EMPTY[startNode.nodeName()]');
function visit455_566_1(result) {
  _$jscoverage['/editor/range.js'].branchData['566'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['545'][2].init(362, 29, 'endNode.nodeName() === \'span\'');
function visit454_545_2(result) {
  _$jscoverage['/editor/range.js'].branchData['545'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['545'][1].init(26, 77, 'endNode.nodeName() === \'span\' && endNode.attr(\'_ke_bookmark\')');
function visit453_545_1(result) {
  _$jscoverage['/editor/range.js'].branchData['545'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['544'][1].init(333, 104, 'endNode && endNode.nodeName() === \'span\' && endNode.attr(\'_ke_bookmark\')');
function visit452_544_1(result) {
  _$jscoverage['/editor/range.js'].branchData['544'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['540'][2].init(172, 31, 'startNode.nodeName() === \'span\'');
function visit451_540_2(result) {
  _$jscoverage['/editor/range.js'].branchData['540'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['540'][1].init(28, 81, 'startNode.nodeName() === \'span\' && startNode.attr(\'_ke_bookmark\')');
function visit450_540_1(result) {
  _$jscoverage['/editor/range.js'].branchData['540'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['539'][1].init(141, 110, 'startNode && startNode.nodeName() === \'span\' && startNode.attr(\'_ke_bookmark\')');
function visit449_539_1(result) {
  _$jscoverage['/editor/range.js'].branchData['539'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['496'][1].init(110, 39, 'offset >= container[0].nodeValue.length');
function visit448_496_1(result) {
  _$jscoverage['/editor/range.js'].branchData['496'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['494'][1].init(21, 7, '!offset');
function visit447_494_1(result) {
  _$jscoverage['/editor/range.js'].branchData['494'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['493'][1].init(528, 51, 'container[0].nodeType !== Dom.NodeType.ELEMENT_NODE');
function visit446_493_1(result) {
  _$jscoverage['/editor/range.js'].branchData['493'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['485'][1].init(112, 39, 'offset >= container[0].nodeValue.length');
function visit445_485_1(result) {
  _$jscoverage['/editor/range.js'].branchData['485'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['483'][1].init(21, 7, '!offset');
function visit444_483_1(result) {
  _$jscoverage['/editor/range.js'].branchData['483'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['482'][1].init(139, 51, 'container[0].nodeType !== Dom.NodeType.ELEMENT_NODE');
function visit443_482_1(result) {
  _$jscoverage['/editor/range.js'].branchData['482'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['467'][1].init(277, 40, 'endContainer.id || endContainer.nodeName');
function visit442_467_1(result) {
  _$jscoverage['/editor/range.js'].branchData['467'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['466'][1].init(184, 44, 'startContainer.id || startContainer.nodeName');
function visit441_466_1(result) {
  _$jscoverage['/editor/range.js'].branchData['466'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['439'][1].init(66, 35, 'self.startOffset === self.endOffset');
function visit440_439_1(result) {
  _$jscoverage['/editor/range.js'].branchData['439'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['438'][2].init(96, 47, 'self.startContainer[0] === self.endContainer[0]');
function visit439_438_2(result) {
  _$jscoverage['/editor/range.js'].branchData['438'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['438'][1].init(36, 102, 'self.startContainer[0] === self.endContainer[0] && self.startOffset === self.endOffset');
function visit438_438_1(result) {
  _$jscoverage['/editor/range.js'].branchData['438'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['437'][1].init(38, 139, 'self.endContainer && self.startContainer[0] === self.endContainer[0] && self.startOffset === self.endOffset');
function visit437_437_1(result) {
  _$jscoverage['/editor/range.js'].branchData['437'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['436'][1].init(27, 178, 'self.startContainer && self.endContainer && self.startContainer[0] === self.endContainer[0] && self.startOffset === self.endOffset');
function visit436_436_1(result) {
  _$jscoverage['/editor/range.js'].branchData['436'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['428'][1].init(10530, 13, 'removeEndNode');
function visit435_428_1(result) {
  _$jscoverage['/editor/range.js'].branchData['428'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['424'][1].init(10456, 15, 'removeStartNode');
function visit434_424_1(result) {
  _$jscoverage['/editor/range.js'].branchData['424'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['409'][1].init(200, 120, 'removeStartNode && (topStart._4eSameLevel(startNode))');
function visit433_409_1(result) {
  _$jscoverage['/editor/range.js'].branchData['409'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['404'][1].init(30, 66, '!startNode._4eSameLevel(topStart) || !endNode._4eSameLevel(topEnd)');
function visit432_404_1(result) {
  _$jscoverage['/editor/range.js'].branchData['404'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['403'][2].init(254, 98, 'topEnd && (!startNode._4eSameLevel(topStart) || !endNode._4eSameLevel(topEnd))');
function visit431_403_2(result) {
  _$jscoverage['/editor/range.js'].branchData['403'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['403'][1].init(242, 110, 'topStart && topEnd && (!startNode._4eSameLevel(topStart) || !endNode._4eSameLevel(topEnd))');
function visit430_403_1(result) {
  _$jscoverage['/editor/range.js'].branchData['403'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['391'][1].init(50, 63, 'endTextNode.previousSibling.nodeType === Dom.NodeType.TEXT_NODE');
function visit429_391_1(result) {
  _$jscoverage['/editor/range.js'].branchData['391'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['390'][1].init(70, 114, 'endTextNode.previousSibling && endTextNode.previousSibling.nodeType === Dom.NodeType.TEXT_NODE');
function visit428_390_1(result) {
  _$jscoverage['/editor/range.js'].branchData['390'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['389'][2].init(67, 47, 'endTextNode.nodeType === Dom.NodeType.TEXT_NODE');
function visit427_389_2(result) {
  _$jscoverage['/editor/range.js'].branchData['389'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['389'][1].init(67, 185, 'endTextNode.nodeType === Dom.NodeType.TEXT_NODE && endTextNode.previousSibling && endTextNode.previousSibling.nodeType === Dom.NodeType.TEXT_NODE');
function visit426_389_1(result) {
  _$jscoverage['/editor/range.js'].branchData['389'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['387'][1].init(631, 11, 'hasSplitEnd');
function visit425_387_1(result) {
  _$jscoverage['/editor/range.js'].branchData['387'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['381'][1].init(113, 61, 'startTextNode.nextSibling.nodeType === Dom.NodeType.TEXT_NODE');
function visit424_381_1(result) {
  _$jscoverage['/editor/range.js'].branchData['381'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['379'][3].init(124, 175, 'startTextNode.nextSibling && startTextNode.nextSibling.nodeType === Dom.NodeType.TEXT_NODE');
function visit423_379_3(result) {
  _$jscoverage['/editor/range.js'].branchData['379'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['379'][2].init(71, 49, 'startTextNode.nodeType === Dom.NodeType.TEXT_NODE');
function visit422_379_2(result) {
  _$jscoverage['/editor/range.js'].branchData['379'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['379'][1].init(71, 228, 'startTextNode.nodeType === Dom.NodeType.TEXT_NODE && startTextNode.nextSibling && startTextNode.nextSibling.nodeType === Dom.NodeType.TEXT_NODE');
function visit421_379_1(result) {
  _$jscoverage['/editor/range.js'].branchData['379'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['377'][1].init(104, 13, 'hasSplitStart');
function visit420_377_1(result) {
  _$jscoverage['/editor/range.js'].branchData['377'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['373'][1].init(8401, 12, 'action === 2');
function visit419_373_1(result) {
  _$jscoverage['/editor/range.js'].branchData['373'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['368'][1].init(1619, 10, 'levelClone');
function visit418_368_1(result) {
  _$jscoverage['/editor/range.js'].branchData['368'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['358'][1].init(237, 12, 'action === 1');
function visit417_358_1(result) {
  _$jscoverage['/editor/range.js'].branchData['358'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['350'][1].init(189, 12, 'action === 2');
function visit416_350_1(result) {
  _$jscoverage['/editor/range.js'].branchData['350'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['341'][1].init(485, 137, '!startParents[k] || !levelStartNode._4eSameLevel(startParents[k])');
function visit415_341_1(result) {
  _$jscoverage['/editor/range.js'].branchData['341'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['332'][2].init(128, 10, 'action > 0');
function visit414_332_2(result) {
  _$jscoverage['/editor/range.js'].branchData['332'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['332'][1].init(128, 45, 'action > 0 && !levelStartNode.equals(endNode)');
function visit413_332_1(result) {
  _$jscoverage['/editor/range.js'].branchData['332'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['328'][1].init(6645, 21, 'k < endParents.length');
function visit412_328_1(result) {
  _$jscoverage['/editor/range.js'].branchData['328'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['319'][1].init(2184, 10, 'levelClone');
function visit411_319_1(result) {
  _$jscoverage['/editor/range.js'].branchData['319'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['310'][1].init(644, 12, 'action === 1');
function visit410_310_1(result) {
  _$jscoverage['/editor/range.js'].branchData['310'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['300'][1].init(155, 48, 'UN_REMOVABLE[currentNode.nodeName.toLowerCase()]');
function visit409_300_1(result) {
  _$jscoverage['/editor/range.js'].branchData['300'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['293'][1].init(437, 12, 'action === 2');
function visit408_293_1(result) {
  _$jscoverage['/editor/range.js'].branchData['293'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['285'][3].init(193, 26, 'domEndNode === currentNode');
function visit407_285_3(result) {
  _$jscoverage['/editor/range.js'].branchData['285'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['285'][2].init(160, 29, 'domEndParentJ === currentNode');
function visit406_285_2(result) {
  _$jscoverage['/editor/range.js'].branchData['285'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['285'][1].init(160, 59, 'domEndParentJ === currentNode || domEndNode === currentNode');
function visit405_285_1(result) {
  _$jscoverage['/editor/range.js'].branchData['285'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['280'][1].init(106, 27, 'endParentJ && endParentJ[0]');
function visit404_280_1(result) {
  _$jscoverage['/editor/range.js'].branchData['280'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['268'][2].init(128, 10, 'action > 0');
function visit403_268_2(result) {
  _$jscoverage['/editor/range.js'].branchData['268'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['268'][1].init(128, 47, 'action > 0 && !levelStartNode.equals(startNode)');
function visit402_268_1(result) {
  _$jscoverage['/editor/range.js'].branchData['268'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['264'][1].init(4210, 23, 'j < startParents.length');
function visit401_264_1(result) {
  _$jscoverage['/editor/range.js'].branchData['264'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['251'][1].init(340, 24, '!topStart.equals(topEnd)');
function visit400_251_1(result) {
  _$jscoverage['/editor/range.js'].branchData['251'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['243'][1].init(3505, 23, 'i < startParents.length');
function visit399_243_1(result) {
  _$jscoverage['/editor/range.js'].branchData['243'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['217'][1].init(596, 45, 'startOffset >= startNode[0].childNodes.length');
function visit398_217_1(result) {
  _$jscoverage['/editor/range.js'].branchData['217'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['211'][1].init(319, 12, '!startOffset');
function visit397_211_1(result) {
  _$jscoverage['/editor/range.js'].branchData['211'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['202'][1].init(1877, 48, 'startNode[0].nodeType === Dom.NodeType.TEXT_NODE');
function visit396_202_1(result) {
  _$jscoverage['/editor/range.js'].branchData['202'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['188'][1].init(82, 41, 'endOffset >= endNode[0].childNodes.length');
function visit395_188_1(result) {
  _$jscoverage['/editor/range.js'].branchData['188'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['186'][1].init(150, 32, 'endNode[0].childNodes.length > 0');
function visit394_186_1(result) {
  _$jscoverage['/editor/range.js'].branchData['186'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['180'][1].init(861, 46, 'endNode[0].nodeType === Dom.NodeType.TEXT_NODE');
function visit393_180_1(result) {
  _$jscoverage['/editor/range.js'].branchData['180'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['168'][1].init(466, 14, 'self.collapsed');
function visit392_168_1(result) {
  _$jscoverage['/editor/range.js'].branchData['168'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['164'][1].init(377, 10, 'action > 0');
function visit391_164_1(result) {
  _$jscoverage['/editor/range.js'].branchData['164'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['134'][4].init(176, 17, 'nodeName === \'br\'');
function visit390_134_4(result) {
  _$jscoverage['/editor/range.js'].branchData['134'][4].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['134'][3].init(176, 27, 'nodeName === \'br\' && !hadBr');
function visit389_134_3(result) {
  _$jscoverage['/editor/range.js'].branchData['134'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['134'][2].init(166, 37, '!UA.ie && nodeName === \'br\' && !hadBr');
function visit388_134_2(result) {
  _$jscoverage['/editor/range.js'].branchData['134'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['134'][1].init(154, 49, '!isStart && !UA.ie && nodeName === \'br\' && !hadBr');
function visit387_134_1(result) {
  _$jscoverage['/editor/range.js'].branchData['134'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['131'][1].init(194, 35, '!inlineChildReqElements[nodeName]');
function visit386_131_1(result) {
  _$jscoverage['/editor/range.js'].branchData['131'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['127'][1].init(391, 43, 'node.nodeType === Dom.NodeType.ELEMENT_NODE');
function visit385_127_1(result) {
  _$jscoverage['/editor/range.js'].branchData['127'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['124'][1].init(98, 29, 'S.trim(node.nodeValue).length');
function visit384_124_1(result) {
  _$jscoverage['/editor/range.js'].branchData['124'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['122'][1].init(141, 40, 'node.nodeType === Dom.NodeType.TEXT_NODE');
function visit383_122_1(result) {
  _$jscoverage['/editor/range.js'].branchData['122'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['118'][1].init(61, 16, 'isBookmark(node)');
function visit382_118_1(result) {
  _$jscoverage['/editor/range.js'].branchData['118'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['111'][1].init(77, 40, '!isWhitespace(node) && !isBookmark(node)');
function visit381_111_1(result) {
  _$jscoverage['/editor/range.js'].branchData['111'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['106'][2].init(483, 8, 'c2 || c3');
function visit380_106_2(result) {
  _$jscoverage['/editor/range.js'].branchData['106'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['106'][1].init(477, 14, 'c1 || c2 || c3');
function visit379_106_1(result) {
  _$jscoverage['/editor/range.js'].branchData['106'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['103'][2].init(154, 40, 'node.nodeType === Dom.NodeType.TEXT_NODE');
function visit378_103_2(result) {
  _$jscoverage['/editor/range.js'].branchData['103'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['103'][1].init(154, 67, 'node.nodeType === Dom.NodeType.TEXT_NODE && !S.trim(node.nodeValue)');
function visit377_103_1(result) {
  _$jscoverage['/editor/range.js'].branchData['103'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['100'][2].init(150, 40, 'node.nodeType !== Dom.NodeType.TEXT_NODE');
function visit376_100_2(result) {
  _$jscoverage['/editor/range.js'].branchData['100'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['100'][1].init(150, 98, 'node.nodeType !== Dom.NodeType.TEXT_NODE && Dom.nodeName(node) in dtd.$removeEmpty');
function visit375_100_1(result) {
  _$jscoverage['/editor/range.js'].branchData['100'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].lineData[10]++;
KISSY.add(function(S, require) {
  _$jscoverage['/editor/range.js'].functionData[0]++;
  _$jscoverage['/editor/range.js'].lineData[11]++;
  require('./dom');
  _$jscoverage['/editor/range.js'].lineData[12]++;
  var Node = require('node');
  _$jscoverage['/editor/range.js'].lineData[13]++;
  var Utils = require('./utils');
  _$jscoverage['/editor/range.js'].lineData[14]++;
  var Walker = require('./walker');
  _$jscoverage['/editor/range.js'].lineData[15]++;
  var Editor = require('./base');
  _$jscoverage['/editor/range.js'].lineData[16]++;
  var ElementPath = require('./elementPath');
  _$jscoverage['/editor/range.js'].lineData[21]++;
  Editor.RangeType = {
  POSITION_AFTER_START: 1, 
  POSITION_BEFORE_END: 2, 
  POSITION_BEFORE_START: 3, 
  POSITION_AFTER_END: 4, 
  ENLARGE_ELEMENT: 1, 
  ENLARGE_BLOCK_CONTENTS: 2, 
  ENLARGE_LIST_ITEM_CONTENTS: 3, 
  START: 1, 
  END: 2, 
  SHRINK_ELEMENT: 1, 
  SHRINK_TEXT: 2};
  _$jscoverage['/editor/range.js'].lineData[35]++;
  var TRUE = true, FALSE = false, NULL = null, KER = Editor.RangeType, KEP = Editor.PositionType, Dom = S.require('dom'), UA = S.UA, dtd = Editor.XHTML_DTD, $ = Node.all, UN_REMOVABLE = {
  td: 1}, EMPTY = {
  area: 1, 
  base: 1, 
  br: 1, 
  col: 1, 
  hr: 1, 
  img: 1, 
  input: 1, 
  link: 1, 
  meta: 1, 
  param: 1};
  _$jscoverage['/editor/range.js'].lineData[60]++;
  var isWhitespace = new Walker.whitespaces(), isBookmark = new Walker.bookmark(), isNotWhitespaces = Walker.whitespaces(TRUE), isNotBookmarks = Walker.bookmark(false, true);
  _$jscoverage['/editor/range.js'].lineData[65]++;
  var inlineChildReqElements = {
  abbr: 1, 
  acronym: 1, 
  b: 1, 
  bdo: 1, 
  big: 1, 
  cite: 1, 
  code: 1, 
  del: 1, 
  dfn: 1, 
  em: 1, 
  font: 1, 
  i: 1, 
  ins: 1, 
  label: 1, 
  kbd: 1, 
  q: 1, 
  samp: 1, 
  small: 1, 
  span: 1, 
  strike: 1, 
  strong: 1, 
  sub: 1, 
  sup: 1, 
  tt: 1, 
  u: 1, 
  'var': 1};
  _$jscoverage['/editor/range.js'].lineData[96]++;
  function elementBoundaryEval(node) {
    _$jscoverage['/editor/range.js'].functionData[1]++;
    _$jscoverage['/editor/range.js'].lineData[100]++;
    var c1 = visit375_100_1(visit376_100_2(node.nodeType !== Dom.NodeType.TEXT_NODE) && Dom.nodeName(node) in dtd.$removeEmpty), c2 = visit377_103_1(visit378_103_2(node.nodeType === Dom.NodeType.TEXT_NODE) && !S.trim(node.nodeValue)), c3 = !!node.parentNode.getAttribute('_ke_bookmark');
    _$jscoverage['/editor/range.js'].lineData[106]++;
    return visit379_106_1(c1 || visit380_106_2(c2 || c3));
  }
  _$jscoverage['/editor/range.js'].lineData[109]++;
  function nonWhitespaceOrIsBookmark(node) {
    _$jscoverage['/editor/range.js'].functionData[2]++;
    _$jscoverage['/editor/range.js'].lineData[111]++;
    return visit381_111_1(!isWhitespace(node) && !isBookmark(node));
  }
  _$jscoverage['/editor/range.js'].lineData[114]++;
  function getCheckStartEndBlockEvalFunction(isStart) {
    _$jscoverage['/editor/range.js'].functionData[3]++;
    _$jscoverage['/editor/range.js'].lineData[115]++;
    var hadBr = FALSE;
    _$jscoverage['/editor/range.js'].lineData[116]++;
    return function(node) {
  _$jscoverage['/editor/range.js'].functionData[4]++;
  _$jscoverage['/editor/range.js'].lineData[118]++;
  if (visit382_118_1(isBookmark(node))) {
    _$jscoverage['/editor/range.js'].lineData[119]++;
    return TRUE;
  }
  _$jscoverage['/editor/range.js'].lineData[122]++;
  if (visit383_122_1(node.nodeType === Dom.NodeType.TEXT_NODE)) {
    _$jscoverage['/editor/range.js'].lineData[124]++;
    if (visit384_124_1(S.trim(node.nodeValue).length)) {
      _$jscoverage['/editor/range.js'].lineData[125]++;
      return FALSE;
    }
  } else {
    _$jscoverage['/editor/range.js'].lineData[127]++;
    if (visit385_127_1(node.nodeType === Dom.NodeType.ELEMENT_NODE)) {
      _$jscoverage['/editor/range.js'].lineData[128]++;
      var nodeName = Dom.nodeName(node);
      _$jscoverage['/editor/range.js'].lineData[131]++;
      if (visit386_131_1(!inlineChildReqElements[nodeName])) {
        _$jscoverage['/editor/range.js'].lineData[134]++;
        if (visit387_134_1(!isStart && visit388_134_2(!UA.ie && visit389_134_3(visit390_134_4(nodeName === 'br') && !hadBr)))) {
          _$jscoverage['/editor/range.js'].lineData[135]++;
          hadBr = TRUE;
        } else {
          _$jscoverage['/editor/range.js'].lineData[137]++;
          return FALSE;
        }
      }
    }
  }
  _$jscoverage['/editor/range.js'].lineData[141]++;
  return TRUE;
};
  }
  _$jscoverage['/editor/range.js'].lineData[151]++;
  function execContentsAction(self, action) {
    _$jscoverage['/editor/range.js'].functionData[5]++;
    _$jscoverage['/editor/range.js'].lineData[152]++;
    var startNode = self.startContainer, endNode = self.endContainer, startOffset = self.startOffset, endOffset = self.endOffset, removeStartNode, hasSplitStart = FALSE, hasSplitEnd = FALSE, t, docFrag, doc = self.document, removeEndNode;
    _$jscoverage['/editor/range.js'].lineData[164]++;
    if (visit391_164_1(action > 0)) {
      _$jscoverage['/editor/range.js'].lineData[165]++;
      docFrag = doc.createDocumentFragment();
    }
    _$jscoverage['/editor/range.js'].lineData[168]++;
    if (visit392_168_1(self.collapsed)) {
      _$jscoverage['/editor/range.js'].lineData[169]++;
      return docFrag;
    }
    _$jscoverage['/editor/range.js'].lineData[173]++;
    self.optimizeBookmark();
    _$jscoverage['/editor/range.js'].lineData[180]++;
    if (visit393_180_1(endNode[0].nodeType === Dom.NodeType.TEXT_NODE)) {
      _$jscoverage['/editor/range.js'].lineData[181]++;
      hasSplitEnd = TRUE;
      _$jscoverage['/editor/range.js'].lineData[182]++;
      endNode = endNode._4eSplitText(endOffset);
    } else {
      _$jscoverage['/editor/range.js'].lineData[186]++;
      if (visit394_186_1(endNode[0].childNodes.length > 0)) {
        _$jscoverage['/editor/range.js'].lineData[188]++;
        if (visit395_188_1(endOffset >= endNode[0].childNodes.length)) {
          _$jscoverage['/editor/range.js'].lineData[190]++;
          endNode = new Node(endNode[0].appendChild(doc.createTextNode('')));
          _$jscoverage['/editor/range.js'].lineData[191]++;
          removeEndNode = TRUE;
        } else {
          _$jscoverage['/editor/range.js'].lineData[193]++;
          endNode = new Node(endNode[0].childNodes[endOffset]);
        }
      }
    }
    _$jscoverage['/editor/range.js'].lineData[202]++;
    if (visit396_202_1(startNode[0].nodeType === Dom.NodeType.TEXT_NODE)) {
      _$jscoverage['/editor/range.js'].lineData[203]++;
      hasSplitStart = TRUE;
      _$jscoverage['/editor/range.js'].lineData[204]++;
      startNode._4eSplitText(startOffset);
    } else {
      _$jscoverage['/editor/range.js'].lineData[211]++;
      if (visit397_211_1(!startOffset)) {
        _$jscoverage['/editor/range.js'].lineData[213]++;
        t = new Node(doc.createTextNode(''));
        _$jscoverage['/editor/range.js'].lineData[214]++;
        startNode.prepend(t);
        _$jscoverage['/editor/range.js'].lineData[215]++;
        startNode = t;
        _$jscoverage['/editor/range.js'].lineData[216]++;
        removeStartNode = TRUE;
      } else {
        _$jscoverage['/editor/range.js'].lineData[217]++;
        if (visit398_217_1(startOffset >= startNode[0].childNodes.length)) {
          _$jscoverage['/editor/range.js'].lineData[219]++;
          startNode = new Node(startNode[0].appendChild(doc.createTextNode('')));
          _$jscoverage['/editor/range.js'].lineData[221]++;
          removeStartNode = TRUE;
        } else {
          _$jscoverage['/editor/range.js'].lineData[223]++;
          startNode = new Node(startNode[0].childNodes[startOffset].previousSibling);
        }
      }
    }
    _$jscoverage['/editor/range.js'].lineData[229]++;
    var startParents = startNode._4eParents(), endParents = endNode._4eParents();
    _$jscoverage['/editor/range.js'].lineData[232]++;
    startParents.each(function(n, i) {
  _$jscoverage['/editor/range.js'].functionData[6]++;
  _$jscoverage['/editor/range.js'].lineData[233]++;
  startParents[i] = n;
});
    _$jscoverage['/editor/range.js'].lineData[236]++;
    endParents.each(function(n, i) {
  _$jscoverage['/editor/range.js'].functionData[7]++;
  _$jscoverage['/editor/range.js'].lineData[237]++;
  endParents[i] = n;
});
    _$jscoverage['/editor/range.js'].lineData[241]++;
    var i, topStart, topEnd;
    _$jscoverage['/editor/range.js'].lineData[243]++;
    for (i = 0; visit399_243_1(i < startParents.length); i++) {
      _$jscoverage['/editor/range.js'].lineData[244]++;
      topStart = startParents[i];
      _$jscoverage['/editor/range.js'].lineData[245]++;
      topEnd = endParents[i];
      _$jscoverage['/editor/range.js'].lineData[251]++;
      if (visit400_251_1(!topStart.equals(topEnd))) {
        _$jscoverage['/editor/range.js'].lineData[252]++;
        break;
      }
    }
    _$jscoverage['/editor/range.js'].lineData[256]++;
    var clone = docFrag, levelStartNode, levelClone, currentNode, currentSibling;
    _$jscoverage['/editor/range.js'].lineData[264]++;
    for (var j = i; visit401_264_1(j < startParents.length); j++) {
      _$jscoverage['/editor/range.js'].lineData[265]++;
      levelStartNode = startParents[j];
      _$jscoverage['/editor/range.js'].lineData[268]++;
      if (visit402_268_1(visit403_268_2(action > 0) && !levelStartNode.equals(startNode))) {
        _$jscoverage['/editor/range.js'].lineData[270]++;
        levelClone = clone.appendChild(levelStartNode.clone()[0]);
      } else {
        _$jscoverage['/editor/range.js'].lineData[272]++;
        levelClone = null;
      }
      _$jscoverage['/editor/range.js'].lineData[276]++;
      currentNode = levelStartNode[0].nextSibling;
      _$jscoverage['/editor/range.js'].lineData[278]++;
      var endParentJ = endParents[j], domEndNode = endNode[0], domEndParentJ = visit404_280_1(endParentJ && endParentJ[0]);
      _$jscoverage['/editor/range.js'].lineData[282]++;
      while (currentNode) {
        _$jscoverage['/editor/range.js'].lineData[285]++;
        if (visit405_285_1(visit406_285_2(domEndParentJ === currentNode) || visit407_285_3(domEndNode === currentNode))) {
          _$jscoverage['/editor/range.js'].lineData[286]++;
          break;
        }
        _$jscoverage['/editor/range.js'].lineData[290]++;
        currentSibling = currentNode.nextSibling;
        _$jscoverage['/editor/range.js'].lineData[293]++;
        if (visit408_293_1(action === 2)) {
          _$jscoverage['/editor/range.js'].lineData[295]++;
          clone.appendChild(currentNode.cloneNode(TRUE));
        } else {
          _$jscoverage['/editor/range.js'].lineData[300]++;
          if (visit409_300_1(UN_REMOVABLE[currentNode.nodeName.toLowerCase()])) {
            _$jscoverage['/editor/range.js'].lineData[301]++;
            var tmp = currentNode.cloneNode(TRUE);
            _$jscoverage['/editor/range.js'].lineData[302]++;
            currentNode.innerHTML = '';
            _$jscoverage['/editor/range.js'].lineData[303]++;
            currentNode = tmp;
          } else {
            _$jscoverage['/editor/range.js'].lineData[306]++;
            Dom._4eRemove(currentNode);
          }
          _$jscoverage['/editor/range.js'].lineData[310]++;
          if (visit410_310_1(action === 1)) {
            _$jscoverage['/editor/range.js'].lineData[312]++;
            clone.appendChild(currentNode);
          }
        }
        _$jscoverage['/editor/range.js'].lineData[316]++;
        currentNode = currentSibling;
      }
      _$jscoverage['/editor/range.js'].lineData[319]++;
      if (visit411_319_1(levelClone)) {
        _$jscoverage['/editor/range.js'].lineData[320]++;
        clone = levelClone;
      }
    }
    _$jscoverage['/editor/range.js'].lineData[324]++;
    clone = docFrag;
    _$jscoverage['/editor/range.js'].lineData[328]++;
    for (var k = i; visit412_328_1(k < endParents.length); k++) {
      _$jscoverage['/editor/range.js'].lineData[329]++;
      levelStartNode = endParents[k];
      _$jscoverage['/editor/range.js'].lineData[332]++;
      if (visit413_332_1(visit414_332_2(action > 0) && !levelStartNode.equals(endNode))) {
        _$jscoverage['/editor/range.js'].lineData[335]++;
        levelClone = clone.appendChild(levelStartNode.clone()[0]);
      } else {
        _$jscoverage['/editor/range.js'].lineData[337]++;
        levelClone = null;
      }
      _$jscoverage['/editor/range.js'].lineData[341]++;
      if (visit415_341_1(!startParents[k] || !levelStartNode._4eSameLevel(startParents[k]))) {
        _$jscoverage['/editor/range.js'].lineData[344]++;
        currentNode = levelStartNode[0].previousSibling;
        _$jscoverage['/editor/range.js'].lineData[345]++;
        while (currentNode) {
          _$jscoverage['/editor/range.js'].lineData[347]++;
          currentSibling = currentNode.previousSibling;
          _$jscoverage['/editor/range.js'].lineData[350]++;
          if (visit416_350_1(action === 2)) {
            _$jscoverage['/editor/range.js'].lineData[351]++;
            clone.insertBefore(currentNode.cloneNode(TRUE), clone.firstChild);
          } else {
            _$jscoverage['/editor/range.js'].lineData[355]++;
            Dom._4eRemove(currentNode);
            _$jscoverage['/editor/range.js'].lineData[358]++;
            if (visit417_358_1(action === 1)) {
              _$jscoverage['/editor/range.js'].lineData[360]++;
              clone.insertBefore(currentNode, clone.firstChild);
            }
          }
          _$jscoverage['/editor/range.js'].lineData[364]++;
          currentNode = currentSibling;
        }
      }
      _$jscoverage['/editor/range.js'].lineData[368]++;
      if (visit418_368_1(levelClone)) {
        _$jscoverage['/editor/range.js'].lineData[369]++;
        clone = levelClone;
      }
    }
    _$jscoverage['/editor/range.js'].lineData[373]++;
    if (visit419_373_1(action === 2)) {
      _$jscoverage['/editor/range.js'].lineData[377]++;
      if (visit420_377_1(hasSplitStart)) {
        _$jscoverage['/editor/range.js'].lineData[378]++;
        var startTextNode = startNode[0];
        _$jscoverage['/editor/range.js'].lineData[379]++;
        if (visit421_379_1(visit422_379_2(startTextNode.nodeType === Dom.NodeType.TEXT_NODE) && visit423_379_3(startTextNode.nextSibling && visit424_381_1(startTextNode.nextSibling.nodeType === Dom.NodeType.TEXT_NODE)))) {
          _$jscoverage['/editor/range.js'].lineData[382]++;
          startTextNode.data += startTextNode.nextSibling.data;
          _$jscoverage['/editor/range.js'].lineData[383]++;
          startTextNode.parentNode.removeChild(startTextNode.nextSibling);
        }
      }
      _$jscoverage['/editor/range.js'].lineData[387]++;
      if (visit425_387_1(hasSplitEnd)) {
        _$jscoverage['/editor/range.js'].lineData[388]++;
        var endTextNode = endNode[0];
        _$jscoverage['/editor/range.js'].lineData[389]++;
        if (visit426_389_1(visit427_389_2(endTextNode.nodeType === Dom.NodeType.TEXT_NODE) && visit428_390_1(endTextNode.previousSibling && visit429_391_1(endTextNode.previousSibling.nodeType === Dom.NodeType.TEXT_NODE)))) {
          _$jscoverage['/editor/range.js'].lineData[392]++;
          endTextNode.previousSibling.data += endTextNode.data;
          _$jscoverage['/editor/range.js'].lineData[393]++;
          endTextNode.parentNode.removeChild(endTextNode);
        }
      }
    } else {
      _$jscoverage['/editor/range.js'].lineData[403]++;
      if (visit430_403_1(topStart && visit431_403_2(topEnd && (visit432_404_1(!startNode._4eSameLevel(topStart) || !endNode._4eSameLevel(topEnd)))))) {
        _$jscoverage['/editor/range.js'].lineData[405]++;
        var startIndex = topStart._4eIndex();
        _$jscoverage['/editor/range.js'].lineData[409]++;
        if (visit433_409_1(removeStartNode && (topStart._4eSameLevel(startNode)))) {
          _$jscoverage['/editor/range.js'].lineData[412]++;
          startIndex--;
        }
        _$jscoverage['/editor/range.js'].lineData[415]++;
        self.setStart(topStart.parent(), startIndex + 1);
      }
      _$jscoverage['/editor/range.js'].lineData[419]++;
      self.collapse(TRUE);
    }
    _$jscoverage['/editor/range.js'].lineData[424]++;
    if (visit434_424_1(removeStartNode)) {
      _$jscoverage['/editor/range.js'].lineData[425]++;
      startNode.remove();
    }
    _$jscoverage['/editor/range.js'].lineData[428]++;
    if (visit435_428_1(removeEndNode)) {
      _$jscoverage['/editor/range.js'].lineData[429]++;
      endNode.remove();
    }
    _$jscoverage['/editor/range.js'].lineData[432]++;
    return docFrag;
  }
  _$jscoverage['/editor/range.js'].lineData[435]++;
  function updateCollapsed(self) {
    _$jscoverage['/editor/range.js'].functionData[8]++;
    _$jscoverage['/editor/range.js'].lineData[436]++;
    self.collapsed = (visit436_436_1(self.startContainer && visit437_437_1(self.endContainer && visit438_438_1(visit439_438_2(self.startContainer[0] === self.endContainer[0]) && visit440_439_1(self.startOffset === self.endOffset)))));
  }
  _$jscoverage['/editor/range.js'].lineData[447]++;
  function KERange(document) {
    _$jscoverage['/editor/range.js'].functionData[9]++;
    _$jscoverage['/editor/range.js'].lineData[448]++;
    var self = this;
    _$jscoverage['/editor/range.js'].lineData[449]++;
    self.startContainer = NULL;
    _$jscoverage['/editor/range.js'].lineData[450]++;
    self.startOffset = NULL;
    _$jscoverage['/editor/range.js'].lineData[451]++;
    self.endContainer = NULL;
    _$jscoverage['/editor/range.js'].lineData[452]++;
    self.endOffset = NULL;
    _$jscoverage['/editor/range.js'].lineData[453]++;
    self.collapsed = TRUE;
    _$jscoverage['/editor/range.js'].lineData[454]++;
    self.document = document;
  }
  _$jscoverage['/editor/range.js'].lineData[457]++;
  S.augment(KERange, {
  toString: function() {
  _$jscoverage['/editor/range.js'].functionData[10]++;
  _$jscoverage['/editor/range.js'].lineData[462]++;
  var s = [], self = this, startContainer = self.startContainer[0], endContainer = self.endContainer[0];
  _$jscoverage['/editor/range.js'].lineData[466]++;
  s.push((visit441_466_1(startContainer.id || startContainer.nodeName)) + ':' + self.startOffset);
  _$jscoverage['/editor/range.js'].lineData[467]++;
  s.push((visit442_467_1(endContainer.id || endContainer.nodeName)) + ':' + self.endOffset);
  _$jscoverage['/editor/range.js'].lineData[468]++;
  return s.join('<br/>');
}, 
  optimize: function() {
  _$jscoverage['/editor/range.js'].functionData[11]++;
  _$jscoverage['/editor/range.js'].lineData[478]++;
  var self = this, container = self.startContainer, offset = self.startOffset;
  _$jscoverage['/editor/range.js'].lineData[482]++;
  if (visit443_482_1(container[0].nodeType !== Dom.NodeType.ELEMENT_NODE)) {
    _$jscoverage['/editor/range.js'].lineData[483]++;
    if (visit444_483_1(!offset)) {
      _$jscoverage['/editor/range.js'].lineData[484]++;
      self.setStartBefore(container);
    } else {
      _$jscoverage['/editor/range.js'].lineData[485]++;
      if (visit445_485_1(offset >= container[0].nodeValue.length)) {
        _$jscoverage['/editor/range.js'].lineData[486]++;
        self.setStartAfter(container);
      }
    }
  }
  _$jscoverage['/editor/range.js'].lineData[490]++;
  container = self.endContainer;
  _$jscoverage['/editor/range.js'].lineData[491]++;
  offset = self.endOffset;
  _$jscoverage['/editor/range.js'].lineData[493]++;
  if (visit446_493_1(container[0].nodeType !== Dom.NodeType.ELEMENT_NODE)) {
    _$jscoverage['/editor/range.js'].lineData[494]++;
    if (visit447_494_1(!offset)) {
      _$jscoverage['/editor/range.js'].lineData[495]++;
      self.setEndBefore(container);
    } else {
      _$jscoverage['/editor/range.js'].lineData[496]++;
      if (visit448_496_1(offset >= container[0].nodeValue.length)) {
        _$jscoverage['/editor/range.js'].lineData[497]++;
        self.setEndAfter(container);
      }
    }
  }
}, 
  setStartAfter: function(node) {
  _$jscoverage['/editor/range.js'].functionData[12]++;
  _$jscoverage['/editor/range.js'].lineData[507]++;
  this.setStart(node.parent(), node._4eIndex() + 1);
}, 
  setStartBefore: function(node) {
  _$jscoverage['/editor/range.js'].functionData[13]++;
  _$jscoverage['/editor/range.js'].lineData[514]++;
  this.setStart(node.parent(), node._4eIndex());
}, 
  setEndAfter: function(node) {
  _$jscoverage['/editor/range.js'].functionData[14]++;
  _$jscoverage['/editor/range.js'].lineData[521]++;
  this.setEnd(node.parent(), node._4eIndex() + 1);
}, 
  setEndBefore: function(node) {
  _$jscoverage['/editor/range.js'].functionData[15]++;
  _$jscoverage['/editor/range.js'].lineData[528]++;
  this.setEnd(node.parent(), node._4eIndex());
}, 
  optimizeBookmark: function() {
  _$jscoverage['/editor/range.js'].functionData[16]++;
  _$jscoverage['/editor/range.js'].lineData[535]++;
  var self = this, startNode = self.startContainer, endNode = self.endContainer;
  _$jscoverage['/editor/range.js'].lineData[539]++;
  if (visit449_539_1(startNode && visit450_540_1(visit451_540_2(startNode.nodeName() === 'span') && startNode.attr('_ke_bookmark')))) {
    _$jscoverage['/editor/range.js'].lineData[542]++;
    self.setStartBefore(startNode);
  }
  _$jscoverage['/editor/range.js'].lineData[544]++;
  if (visit452_544_1(endNode && visit453_545_1(visit454_545_2(endNode.nodeName() === 'span') && endNode.attr('_ke_bookmark')))) {
    _$jscoverage['/editor/range.js'].lineData[547]++;
    self.setEndAfter(endNode);
  }
}, 
  setStart: function(startNode, startOffset) {
  _$jscoverage['/editor/range.js'].functionData[17]++;
  _$jscoverage['/editor/range.js'].lineData[565]++;
  var self = this;
  _$jscoverage['/editor/range.js'].lineData[566]++;
  if (visit455_566_1(visit456_566_2(startNode[0].nodeType === Dom.NodeType.ELEMENT_NODE) && EMPTY[startNode.nodeName()])) {
    _$jscoverage['/editor/range.js'].lineData[567]++;
    startNode = startNode.parent();
    _$jscoverage['/editor/range.js'].lineData[568]++;
    startOffset = startNode._4eIndex();
  }
  _$jscoverage['/editor/range.js'].lineData[571]++;
  self.startContainer = startNode;
  _$jscoverage['/editor/range.js'].lineData[572]++;
  self.startOffset = startOffset;
  _$jscoverage['/editor/range.js'].lineData[574]++;
  if (visit457_574_1(!self.endContainer)) {
    _$jscoverage['/editor/range.js'].lineData[575]++;
    self.endContainer = startNode;
    _$jscoverage['/editor/range.js'].lineData[576]++;
    self.endOffset = startOffset;
  }
  _$jscoverage['/editor/range.js'].lineData[579]++;
  updateCollapsed(self);
}, 
  setEnd: function(endNode, endOffset) {
  _$jscoverage['/editor/range.js'].functionData[18]++;
  _$jscoverage['/editor/range.js'].lineData[596]++;
  var self = this;
  _$jscoverage['/editor/range.js'].lineData[597]++;
  if (visit458_597_1(visit459_597_2(endNode[0].nodeType === Dom.NodeType.ELEMENT_NODE) && EMPTY[endNode.nodeName()])) {
    _$jscoverage['/editor/range.js'].lineData[598]++;
    endNode = endNode.parent();
    _$jscoverage['/editor/range.js'].lineData[599]++;
    endOffset = endNode._4eIndex() + 1;
  }
  _$jscoverage['/editor/range.js'].lineData[602]++;
  self.endContainer = endNode;
  _$jscoverage['/editor/range.js'].lineData[603]++;
  self.endOffset = endOffset;
  _$jscoverage['/editor/range.js'].lineData[605]++;
  if (visit460_605_1(!self.startContainer)) {
    _$jscoverage['/editor/range.js'].lineData[606]++;
    self.startContainer = endNode;
    _$jscoverage['/editor/range.js'].lineData[607]++;
    self.startOffset = endOffset;
  }
  _$jscoverage['/editor/range.js'].lineData[610]++;
  updateCollapsed(self);
}, 
  setStartAt: function(node, position) {
  _$jscoverage['/editor/range.js'].functionData[19]++;
  _$jscoverage['/editor/range.js'].lineData[619]++;
  var self = this;
  _$jscoverage['/editor/range.js'].lineData[620]++;
  switch (position) {
    case KER.POSITION_AFTER_START:
      _$jscoverage['/editor/range.js'].lineData[622]++;
      self.setStart(node, 0);
      _$jscoverage['/editor/range.js'].lineData[623]++;
      break;
    case KER.POSITION_BEFORE_END:
      _$jscoverage['/editor/range.js'].lineData[626]++;
      if (visit461_626_1(node[0].nodeType === Dom.NodeType.TEXT_NODE)) {
        _$jscoverage['/editor/range.js'].lineData[627]++;
        self.setStart(node, node[0].nodeValue.length);
      } else {
        _$jscoverage['/editor/range.js'].lineData[629]++;
        self.setStart(node, node[0].childNodes.length);
      }
      _$jscoverage['/editor/range.js'].lineData[631]++;
      break;
    case KER.POSITION_BEFORE_START:
      _$jscoverage['/editor/range.js'].lineData[634]++;
      self.setStartBefore(node);
      _$jscoverage['/editor/range.js'].lineData[635]++;
      break;
    case KER.POSITION_AFTER_END:
      _$jscoverage['/editor/range.js'].lineData[638]++;
      self.setStartAfter(node);
  }
  _$jscoverage['/editor/range.js'].lineData[641]++;
  updateCollapsed(self);
}, 
  setEndAt: function(node, position) {
  _$jscoverage['/editor/range.js'].functionData[20]++;
  _$jscoverage['/editor/range.js'].lineData[650]++;
  var self = this;
  _$jscoverage['/editor/range.js'].lineData[651]++;
  switch (position) {
    case KER.POSITION_AFTER_START:
      _$jscoverage['/editor/range.js'].lineData[653]++;
      self.setEnd(node, 0);
      _$jscoverage['/editor/range.js'].lineData[654]++;
      break;
    case KER.POSITION_BEFORE_END:
      _$jscoverage['/editor/range.js'].lineData[657]++;
      if (visit462_657_1(node[0].nodeType === Dom.NodeType.TEXT_NODE)) {
        _$jscoverage['/editor/range.js'].lineData[658]++;
        self.setEnd(node, node[0].nodeValue.length);
      } else {
        _$jscoverage['/editor/range.js'].lineData[660]++;
        self.setEnd(node, node[0].childNodes.length);
      }
      _$jscoverage['/editor/range.js'].lineData[662]++;
      break;
    case KER.POSITION_BEFORE_START:
      _$jscoverage['/editor/range.js'].lineData[665]++;
      self.setEndBefore(node);
      _$jscoverage['/editor/range.js'].lineData[666]++;
      break;
    case KER.POSITION_AFTER_END:
      _$jscoverage['/editor/range.js'].lineData[669]++;
      self.setEndAfter(node);
  }
  _$jscoverage['/editor/range.js'].lineData[672]++;
  updateCollapsed(self);
}, 
  cloneContents: function() {
  _$jscoverage['/editor/range.js'].functionData[21]++;
  _$jscoverage['/editor/range.js'].lineData[679]++;
  return execContentsAction(this, 2);
}, 
  deleteContents: function() {
  _$jscoverage['/editor/range.js'].functionData[22]++;
  _$jscoverage['/editor/range.js'].lineData[686]++;
  return execContentsAction(this, 0);
}, 
  extractContents: function() {
  _$jscoverage['/editor/range.js'].functionData[23]++;
  _$jscoverage['/editor/range.js'].lineData[693]++;
  return execContentsAction(this, 1);
}, 
  collapse: function(toStart) {
  _$jscoverage['/editor/range.js'].functionData[24]++;
  _$jscoverage['/editor/range.js'].lineData[701]++;
  var self = this;
  _$jscoverage['/editor/range.js'].lineData[702]++;
  if (visit463_702_1(toStart)) {
    _$jscoverage['/editor/range.js'].lineData[703]++;
    self.endContainer = self.startContainer;
    _$jscoverage['/editor/range.js'].lineData[704]++;
    self.endOffset = self.startOffset;
  } else {
    _$jscoverage['/editor/range.js'].lineData[706]++;
    self.startContainer = self.endContainer;
    _$jscoverage['/editor/range.js'].lineData[707]++;
    self.startOffset = self.endOffset;
  }
  _$jscoverage['/editor/range.js'].lineData[709]++;
  self.collapsed = TRUE;
}, 
  clone: function() {
  _$jscoverage['/editor/range.js'].functionData[25]++;
  _$jscoverage['/editor/range.js'].lineData[717]++;
  var self = this, clone = new KERange(self.document);
  _$jscoverage['/editor/range.js'].lineData[720]++;
  clone.startContainer = self.startContainer;
  _$jscoverage['/editor/range.js'].lineData[721]++;
  clone.startOffset = self.startOffset;
  _$jscoverage['/editor/range.js'].lineData[722]++;
  clone.endContainer = self.endContainer;
  _$jscoverage['/editor/range.js'].lineData[723]++;
  clone.endOffset = self.endOffset;
  _$jscoverage['/editor/range.js'].lineData[724]++;
  clone.collapsed = self.collapsed;
  _$jscoverage['/editor/range.js'].lineData[726]++;
  return clone;
}, 
  getEnclosedNode: function() {
  _$jscoverage['/editor/range.js'].functionData[26]++;
  _$jscoverage['/editor/range.js'].lineData[738]++;
  var walkerRange = this.clone();
  _$jscoverage['/editor/range.js'].lineData[741]++;
  walkerRange.optimize();
  _$jscoverage['/editor/range.js'].lineData[743]++;
  if (visit464_743_1(visit465_743_2(walkerRange.startContainer[0].nodeType !== Dom.NodeType.ELEMENT_NODE) || visit466_744_1(walkerRange.endContainer[0].nodeType !== Dom.NodeType.ELEMENT_NODE))) {
    _$jscoverage['/editor/range.js'].lineData[745]++;
    return NULL;
  }
  _$jscoverage['/editor/range.js'].lineData[748]++;
  var walker = new Walker(walkerRange), node, pre;
  _$jscoverage['/editor/range.js'].lineData[751]++;
  walker.evaluator = function(node) {
  _$jscoverage['/editor/range.js'].functionData[27]++;
  _$jscoverage['/editor/range.js'].lineData[752]++;
  return visit467_752_1(isNotWhitespaces(node) && isNotBookmarks(node));
};
  _$jscoverage['/editor/range.js'].lineData[759]++;
  node = walker.next();
  _$jscoverage['/editor/range.js'].lineData[760]++;
  walker.reset();
  _$jscoverage['/editor/range.js'].lineData[761]++;
  pre = walker.previous();
  _$jscoverage['/editor/range.js'].lineData[763]++;
  return visit468_763_1(node && node.equals(pre)) ? node : NULL;
}, 
  shrink: function(mode, selectContents) {
  _$jscoverage['/editor/range.js'].functionData[28]++;
  _$jscoverage['/editor/range.js'].lineData[773]++;
  var self = this;
  _$jscoverage['/editor/range.js'].lineData[774]++;
  if (visit469_774_1(!self.collapsed)) {
    _$jscoverage['/editor/range.js'].lineData[775]++;
    mode = visit470_775_1(mode || KER.SHRINK_TEXT);
    _$jscoverage['/editor/range.js'].lineData[777]++;
    var walkerRange = self.clone(), startContainer = self.startContainer, endContainer = self.endContainer, startOffset = self.startOffset, endOffset = self.endOffset, moveStart = TRUE, currentElement, walker, moveEnd = TRUE;
    _$jscoverage['/editor/range.js'].lineData[788]++;
    if (visit471_788_1(startContainer && visit472_789_1(startContainer[0].nodeType === Dom.NodeType.TEXT_NODE))) {
      _$jscoverage['/editor/range.js'].lineData[790]++;
      if (visit473_790_1(!startOffset)) {
        _$jscoverage['/editor/range.js'].lineData[791]++;
        walkerRange.setStartBefore(startContainer);
      } else {
        _$jscoverage['/editor/range.js'].lineData[792]++;
        if (visit474_792_1(startOffset >= startContainer[0].nodeValue.length)) {
          _$jscoverage['/editor/range.js'].lineData[793]++;
          walkerRange.setStartAfter(startContainer);
        } else {
          _$jscoverage['/editor/range.js'].lineData[797]++;
          walkerRange.setStartBefore(startContainer);
          _$jscoverage['/editor/range.js'].lineData[798]++;
          moveStart = FALSE;
        }
      }
    }
    _$jscoverage['/editor/range.js'].lineData[802]++;
    if (visit475_802_1(endContainer && visit476_803_1(endContainer[0].nodeType === Dom.NodeType.TEXT_NODE))) {
      _$jscoverage['/editor/range.js'].lineData[804]++;
      if (visit477_804_1(!endOffset)) {
        _$jscoverage['/editor/range.js'].lineData[805]++;
        walkerRange.setEndBefore(endContainer);
      } else {
        _$jscoverage['/editor/range.js'].lineData[806]++;
        if (visit478_806_1(endOffset >= endContainer[0].nodeValue.length)) {
          _$jscoverage['/editor/range.js'].lineData[807]++;
          walkerRange.setEndAfter(endContainer);
        } else {
          _$jscoverage['/editor/range.js'].lineData[809]++;
          walkerRange.setEndAfter(endContainer);
          _$jscoverage['/editor/range.js'].lineData[810]++;
          moveEnd = FALSE;
        }
      }
    }
    _$jscoverage['/editor/range.js'].lineData[814]++;
    if (visit479_814_1(moveStart || moveEnd)) {
      _$jscoverage['/editor/range.js'].lineData[816]++;
      walker = new Walker(walkerRange);
      _$jscoverage['/editor/range.js'].lineData[818]++;
      walker.evaluator = function(node) {
  _$jscoverage['/editor/range.js'].functionData[29]++;
  _$jscoverage['/editor/range.js'].lineData[819]++;
  return visit480_819_1(node.nodeType === (visit481_819_2(mode === KER.SHRINK_ELEMENT) ? Dom.NodeType.ELEMENT_NODE : Dom.NodeType.TEXT_NODE));
};
      _$jscoverage['/editor/range.js'].lineData[823]++;
      walker.guard = function(node, movingOut) {
  _$jscoverage['/editor/range.js'].functionData[30]++;
  _$jscoverage['/editor/range.js'].lineData[825]++;
  if (visit482_825_1(visit483_825_2(mode === KER.SHRINK_ELEMENT) && visit484_826_1(node.nodeType === Dom.NodeType.TEXT_NODE))) {
    _$jscoverage['/editor/range.js'].lineData[827]++;
    return FALSE;
  }
  _$jscoverage['/editor/range.js'].lineData[830]++;
  if (visit485_830_1(movingOut && visit486_830_2(node === currentElement))) {
    _$jscoverage['/editor/range.js'].lineData[831]++;
    return FALSE;
  }
  _$jscoverage['/editor/range.js'].lineData[833]++;
  if (visit487_833_1(!movingOut && visit488_833_2(node.nodeType === Dom.NodeType.ELEMENT_NODE))) {
    _$jscoverage['/editor/range.js'].lineData[834]++;
    currentElement = node;
  }
  _$jscoverage['/editor/range.js'].lineData[836]++;
  return TRUE;
};
    }
    _$jscoverage['/editor/range.js'].lineData[841]++;
    if (visit489_841_1(moveStart)) {
      _$jscoverage['/editor/range.js'].lineData[842]++;
      var textStart = walker[visit490_842_1(mode === KER.SHRINK_ELEMENT) ? 'lastForward' : 'next']();
      _$jscoverage['/editor/range.js'].lineData[843]++;
      if (visit491_843_1(textStart)) {
        _$jscoverage['/editor/range.js'].lineData[844]++;
        self.setStartAt(textStart, selectContents ? KER.POSITION_AFTER_START : KER.POSITION_BEFORE_START);
      }
    }
    _$jscoverage['/editor/range.js'].lineData[848]++;
    if (visit492_848_1(moveEnd)) {
      _$jscoverage['/editor/range.js'].lineData[849]++;
      walker.reset();
      _$jscoverage['/editor/range.js'].lineData[850]++;
      var textEnd = walker[visit493_850_1(mode === KER.SHRINK_ELEMENT) ? 'lastBackward' : 'previous']();
      _$jscoverage['/editor/range.js'].lineData[851]++;
      if (visit494_851_1(textEnd)) {
        _$jscoverage['/editor/range.js'].lineData[852]++;
        self.setEndAt(textEnd, selectContents ? KER.POSITION_BEFORE_END : KER.POSITION_AFTER_END);
      }
    }
    _$jscoverage['/editor/range.js'].lineData[856]++;
    return visit495_856_1(moveStart || moveEnd);
  }
}, 
  createBookmark2: function(normalized) {
  _$jscoverage['/editor/range.js'].functionData[31]++;
  _$jscoverage['/editor/range.js'].lineData[866]++;
  var self = this, startContainer = self.startContainer, endContainer = self.endContainer, startOffset = self.startOffset, endOffset = self.endOffset, child, previous;
  _$jscoverage['/editor/range.js'].lineData[876]++;
  if (visit496_876_1(!startContainer || !endContainer)) {
    _$jscoverage['/editor/range.js'].lineData[877]++;
    return {
  start: 0, 
  end: 0};
  }
  _$jscoverage['/editor/range.js'].lineData[883]++;
  if (visit497_883_1(normalized)) {
    _$jscoverage['/editor/range.js'].lineData[886]++;
    if (visit498_886_1(startContainer[0].nodeType === Dom.NodeType.ELEMENT_NODE)) {
      _$jscoverage['/editor/range.js'].lineData[887]++;
      child = new Node(startContainer[0].childNodes[startOffset]);
      _$jscoverage['/editor/range.js'].lineData[891]++;
      if (visit499_891_1(child && visit500_891_2(child[0] && visit501_891_3(visit502_891_4(child[0].nodeType === Dom.NodeType.TEXT_NODE) && visit503_892_1(visit504_892_2(startOffset > 0) && visit505_892_3(child[0].previousSibling.nodeType === Dom.NodeType.TEXT_NODE)))))) {
        _$jscoverage['/editor/range.js'].lineData[893]++;
        startContainer = child;
        _$jscoverage['/editor/range.js'].lineData[894]++;
        startOffset = 0;
      }
    }
    _$jscoverage['/editor/range.js'].lineData[900]++;
    while (visit506_900_1(visit507_900_2(startContainer[0].nodeType === Dom.NodeType.TEXT_NODE) && visit508_901_1((previous = startContainer.prev(undefined, 1)) && visit509_902_1(previous[0].nodeType === Dom.NodeType.TEXT_NODE)))) {
      _$jscoverage['/editor/range.js'].lineData[903]++;
      startContainer = previous;
      _$jscoverage['/editor/range.js'].lineData[904]++;
      startOffset += previous[0].nodeValue.length;
    }
    _$jscoverage['/editor/range.js'].lineData[908]++;
    if (visit510_908_1(!self.collapsed)) {
      _$jscoverage['/editor/range.js'].lineData[911]++;
      if (visit511_911_1(endContainer[0].nodeType === Dom.NodeType.ELEMENT_NODE)) {
        _$jscoverage['/editor/range.js'].lineData[912]++;
        child = new Node(endContainer[0].childNodes[endOffset]);
        _$jscoverage['/editor/range.js'].lineData[916]++;
        if (visit512_916_1(child && visit513_916_2(child[0] && visit514_917_1(visit515_917_2(child[0].nodeType === Dom.NodeType.TEXT_NODE) && visit516_917_3(visit517_917_4(endOffset > 0) && visit518_918_1(child[0].previousSibling.nodeType === Dom.NodeType.TEXT_NODE)))))) {
          _$jscoverage['/editor/range.js'].lineData[919]++;
          endContainer = child;
          _$jscoverage['/editor/range.js'].lineData[920]++;
          endOffset = 0;
        }
      }
      _$jscoverage['/editor/range.js'].lineData[925]++;
      while (visit519_925_1(visit520_925_2(endContainer[0].nodeType === Dom.NodeType.TEXT_NODE) && visit521_926_1((previous = endContainer.prev(undefined, 1)) && visit522_927_1(previous[0].nodeType === Dom.NodeType.TEXT_NODE)))) {
        _$jscoverage['/editor/range.js'].lineData[928]++;
        endContainer = previous;
        _$jscoverage['/editor/range.js'].lineData[929]++;
        endOffset += previous[0].nodeValue.length;
      }
    }
  }
  _$jscoverage['/editor/range.js'].lineData[934]++;
  return {
  start: startContainer._4eAddress(normalized), 
  end: self.collapsed ? NULL : endContainer._4eAddress(normalized), 
  startOffset: startOffset, 
  endOffset: endOffset, 
  normalized: normalized, 
  is2: TRUE};
}, 
  createBookmark: function(serializable) {
  _$jscoverage['/editor/range.js'].functionData[32]++;
  _$jscoverage['/editor/range.js'].lineData[948]++;
  var startNode, endNode, baseId, clone, self = this, collapsed = self.collapsed;
  _$jscoverage['/editor/range.js'].lineData[954]++;
  startNode = new Node('<span>', NULL, self.document);
  _$jscoverage['/editor/range.js'].lineData[955]++;
  startNode.attr('_ke_bookmark', 1);
  _$jscoverage['/editor/range.js'].lineData[956]++;
  startNode.css('display', 'none');
  _$jscoverage['/editor/range.js'].lineData[960]++;
  startNode.html('&nbsp;');
  _$jscoverage['/editor/range.js'].lineData[962]++;
  if (visit523_962_1(serializable)) {
    _$jscoverage['/editor/range.js'].lineData[963]++;
    baseId = S.guid('ke_bm_');
    _$jscoverage['/editor/range.js'].lineData[964]++;
    startNode.attr('id', baseId + 'S');
  }
  _$jscoverage['/editor/range.js'].lineData[968]++;
  if (visit524_968_1(!collapsed)) {
    _$jscoverage['/editor/range.js'].lineData[969]++;
    endNode = startNode.clone();
    _$jscoverage['/editor/range.js'].lineData[970]++;
    endNode.html('&nbsp;');
    _$jscoverage['/editor/range.js'].lineData[972]++;
    if (visit525_972_1(serializable)) {
      _$jscoverage['/editor/range.js'].lineData[973]++;
      endNode.attr('id', baseId + 'E');
    }
    _$jscoverage['/editor/range.js'].lineData[976]++;
    clone = self.clone();
    _$jscoverage['/editor/range.js'].lineData[977]++;
    clone.collapse();
    _$jscoverage['/editor/range.js'].lineData[978]++;
    clone.insertNode(endNode);
  }
  _$jscoverage['/editor/range.js'].lineData[981]++;
  clone = self.clone();
  _$jscoverage['/editor/range.js'].lineData[982]++;
  clone.collapse(TRUE);
  _$jscoverage['/editor/range.js'].lineData[983]++;
  clone.insertNode(startNode);
  _$jscoverage['/editor/range.js'].lineData[986]++;
  if (visit526_986_1(endNode)) {
    _$jscoverage['/editor/range.js'].lineData[987]++;
    self.setStartAfter(startNode);
    _$jscoverage['/editor/range.js'].lineData[988]++;
    self.setEndBefore(endNode);
  } else {
    _$jscoverage['/editor/range.js'].lineData[990]++;
    self.moveToPosition(startNode, KER.POSITION_AFTER_END);
  }
  _$jscoverage['/editor/range.js'].lineData[993]++;
  return {
  startNode: serializable ? baseId + 'S' : startNode, 
  endNode: serializable ? baseId + 'E' : endNode, 
  serializable: serializable, 
  collapsed: collapsed};
}, 
  moveToPosition: function(node, position) {
  _$jscoverage['/editor/range.js'].functionData[33]++;
  _$jscoverage['/editor/range.js'].lineData[1007]++;
  var self = this;
  _$jscoverage['/editor/range.js'].lineData[1008]++;
  self.setStartAt(node, position);
  _$jscoverage['/editor/range.js'].lineData[1009]++;
  self.collapse(TRUE);
}, 
  trim: function(ignoreStart, ignoreEnd) {
  _$jscoverage['/editor/range.js'].functionData[34]++;
  _$jscoverage['/editor/range.js'].lineData[1018]++;
  var self = this, startContainer = self.startContainer, startOffset = self.startOffset, collapsed = self.collapsed;
  _$jscoverage['/editor/range.js'].lineData[1023]++;
  if (visit527_1023_1((visit528_1023_2(!ignoreStart || collapsed)) && visit529_1024_1(startContainer[0] && visit530_1025_1(startContainer[0].nodeType === Dom.NodeType.TEXT_NODE)))) {
    _$jscoverage['/editor/range.js'].lineData[1028]++;
    if (visit531_1028_1(!startOffset)) {
      _$jscoverage['/editor/range.js'].lineData[1029]++;
      startOffset = startContainer._4eIndex();
      _$jscoverage['/editor/range.js'].lineData[1030]++;
      startContainer = startContainer.parent();
    } else {
      _$jscoverage['/editor/range.js'].lineData[1031]++;
      if (visit532_1031_1(startOffset >= startContainer[0].nodeValue.length)) {
        _$jscoverage['/editor/range.js'].lineData[1034]++;
        startOffset = startContainer._4eIndex() + 1;
        _$jscoverage['/editor/range.js'].lineData[1035]++;
        startContainer = startContainer.parent();
      } else {
        _$jscoverage['/editor/range.js'].lineData[1039]++;
        var nextText = startContainer._4eSplitText(startOffset);
        _$jscoverage['/editor/range.js'].lineData[1041]++;
        startOffset = startContainer._4eIndex() + 1;
        _$jscoverage['/editor/range.js'].lineData[1042]++;
        startContainer = startContainer.parent();
        _$jscoverage['/editor/range.js'].lineData[1045]++;
        if (visit533_1045_1(Dom.equals(self.startContainer, self.endContainer))) {
          _$jscoverage['/editor/range.js'].lineData[1046]++;
          self.setEnd(nextText, self.endOffset - self.startOffset);
        } else {
          _$jscoverage['/editor/range.js'].lineData[1047]++;
          if (visit534_1047_1(Dom.equals(startContainer, self.endContainer))) {
            _$jscoverage['/editor/range.js'].lineData[1048]++;
            self.endOffset += 1;
          }
        }
      }
    }
    _$jscoverage['/editor/range.js'].lineData[1052]++;
    self.setStart(startContainer, startOffset);
    _$jscoverage['/editor/range.js'].lineData[1054]++;
    if (visit535_1054_1(collapsed)) {
      _$jscoverage['/editor/range.js'].lineData[1055]++;
      self.collapse(TRUE);
      _$jscoverage['/editor/range.js'].lineData[1056]++;
      return;
    }
  }
  _$jscoverage['/editor/range.js'].lineData[1060]++;
  var endContainer = self.endContainer, endOffset = self.endOffset;
  _$jscoverage['/editor/range.js'].lineData[1063]++;
  if (visit536_1063_1(!(visit537_1063_2(ignoreEnd || collapsed)) && visit538_1064_1(endContainer[0] && visit539_1064_2(endContainer[0].nodeType === Dom.NodeType.TEXT_NODE)))) {
    _$jscoverage['/editor/range.js'].lineData[1067]++;
    if (visit540_1067_1(!endOffset)) {
      _$jscoverage['/editor/range.js'].lineData[1068]++;
      endOffset = endContainer._4eIndex();
      _$jscoverage['/editor/range.js'].lineData[1069]++;
      endContainer = endContainer.parent();
    } else {
      _$jscoverage['/editor/range.js'].lineData[1070]++;
      if (visit541_1070_1(endOffset >= endContainer[0].nodeValue.length)) {
        _$jscoverage['/editor/range.js'].lineData[1073]++;
        endOffset = endContainer._4eIndex() + 1;
        _$jscoverage['/editor/range.js'].lineData[1074]++;
        endContainer = endContainer.parent();
      } else {
        _$jscoverage['/editor/range.js'].lineData[1078]++;
        endContainer._4eSplitText(endOffset);
        _$jscoverage['/editor/range.js'].lineData[1080]++;
        endOffset = endContainer._4eIndex() + 1;
        _$jscoverage['/editor/range.js'].lineData[1081]++;
        endContainer = endContainer.parent();
      }
    }
    _$jscoverage['/editor/range.js'].lineData[1084]++;
    self.setEnd(endContainer, endOffset);
  }
}, 
  insertNode: function(node) {
  _$jscoverage['/editor/range.js'].functionData[35]++;
  _$jscoverage['/editor/range.js'].lineData[1092]++;
  var self = this;
  _$jscoverage['/editor/range.js'].lineData[1093]++;
  self.optimizeBookmark();
  _$jscoverage['/editor/range.js'].lineData[1094]++;
  self.trim(FALSE, TRUE);
  _$jscoverage['/editor/range.js'].lineData[1095]++;
  var startContainer = self.startContainer, startOffset = self.startOffset, nextNode = visit542_1097_1(startContainer[0].childNodes[startOffset] || null);
  _$jscoverage['/editor/range.js'].lineData[1099]++;
  startContainer[0].insertBefore(node[0], nextNode);
  _$jscoverage['/editor/range.js'].lineData[1101]++;
  if (visit543_1101_1(startContainer[0] === self.endContainer[0])) {
    _$jscoverage['/editor/range.js'].lineData[1102]++;
    self.endOffset++;
  }
  _$jscoverage['/editor/range.js'].lineData[1105]++;
  self.setStartBefore(node);
}, 
  moveToBookmark: function(bookmark) {
  _$jscoverage['/editor/range.js'].functionData[36]++;
  _$jscoverage['/editor/range.js'].lineData[1113]++;
  var self = this, doc = $(self.document);
  _$jscoverage['/editor/range.js'].lineData[1115]++;
  if (visit544_1115_1(bookmark.is2)) {
    _$jscoverage['/editor/range.js'].lineData[1117]++;
    var startContainer = doc._4eGetByAddress(bookmark.start, bookmark.normalized), startOffset = bookmark.startOffset, endContainer = visit545_1119_1(bookmark.end && doc._4eGetByAddress(bookmark.end, bookmark.normalized)), endOffset = bookmark.endOffset;
    _$jscoverage['/editor/range.js'].lineData[1123]++;
    self.setStart(startContainer, startOffset);
    _$jscoverage['/editor/range.js'].lineData[1126]++;
    if (visit546_1126_1(endContainer)) {
      _$jscoverage['/editor/range.js'].lineData[1127]++;
      self.setEnd(endContainer, endOffset);
    } else {
      _$jscoverage['/editor/range.js'].lineData[1129]++;
      self.collapse(TRUE);
    }
  } else {
    _$jscoverage['/editor/range.js'].lineData[1133]++;
    var serializable = bookmark.serializable, startNode = serializable ? S.one('#' + bookmark.startNode, doc) : bookmark.startNode, endNode = serializable ? S.one('#' + bookmark.endNode, doc) : bookmark.endNode;
    _$jscoverage['/editor/range.js'].lineData[1140]++;
    self.setStartBefore(startNode);
    _$jscoverage['/editor/range.js'].lineData[1143]++;
    startNode._4eRemove();
    _$jscoverage['/editor/range.js'].lineData[1147]++;
    if (visit547_1147_1(endNode && endNode[0])) {
      _$jscoverage['/editor/range.js'].lineData[1148]++;
      self.setEndBefore(endNode);
      _$jscoverage['/editor/range.js'].lineData[1149]++;
      endNode._4eRemove();
    } else {
      _$jscoverage['/editor/range.js'].lineData[1151]++;
      self.collapse(TRUE);
    }
  }
}, 
  getCommonAncestor: function(includeSelf, ignoreTextNode) {
  _$jscoverage['/editor/range.js'].functionData[37]++;
  _$jscoverage['/editor/range.js'].lineData[1162]++;
  var self = this, start = self.startContainer, end = self.endContainer, ancestor;
  _$jscoverage['/editor/range.js'].lineData[1167]++;
  if (visit548_1167_1(start[0] === end[0])) {
    _$jscoverage['/editor/range.js'].lineData[1168]++;
    if (visit549_1168_1(includeSelf && visit550_1169_1(visit551_1169_2(start[0].nodeType === Dom.NodeType.ELEMENT_NODE) && visit552_1170_1(self.startOffset === self.endOffset - 1)))) {
      _$jscoverage['/editor/range.js'].lineData[1171]++;
      ancestor = new Node(start[0].childNodes[self.startOffset]);
    } else {
      _$jscoverage['/editor/range.js'].lineData[1173]++;
      ancestor = start;
    }
  } else {
    _$jscoverage['/editor/range.js'].lineData[1176]++;
    ancestor = start._4eCommonAncestor(end);
  }
  _$jscoverage['/editor/range.js'].lineData[1179]++;
  return visit553_1179_1(ignoreTextNode && visit554_1179_2(ancestor[0].nodeType === Dom.NodeType.TEXT_NODE)) ? ancestor.parent() : ancestor;
}, 
  enlarge: (function() {
  _$jscoverage['/editor/range.js'].functionData[38]++;
  _$jscoverage['/editor/range.js'].lineData[1192]++;
  function enlargeElement(self, left, stop, commonAncestor) {
    _$jscoverage['/editor/range.js'].functionData[39]++;
    _$jscoverage['/editor/range.js'].lineData[1193]++;
    var container = self[left ? 'startContainer' : 'endContainer'], enlarge, sibling, index = left ? 0 : 1, commonReached = 0, direction = left ? 'previousSibling' : 'nextSibling', offset = self[left ? 'startOffset' : 'endOffset'];
    _$jscoverage['/editor/range.js'].lineData[1201]++;
    if (visit555_1201_1(container[0].nodeType === Dom.NodeType.TEXT_NODE)) {
      _$jscoverage['/editor/range.js'].lineData[1202]++;
      if (visit556_1202_1(left)) {
        _$jscoverage['/editor/range.js'].lineData[1204]++;
        if (visit557_1204_1(offset)) {
          _$jscoverage['/editor/range.js'].lineData[1205]++;
          return;
        }
      } else {
        _$jscoverage['/editor/range.js'].lineData[1208]++;
        if (visit558_1208_1(offset < container[0].nodeValue.length)) {
          _$jscoverage['/editor/range.js'].lineData[1209]++;
          return;
        }
      }
      _$jscoverage['/editor/range.js'].lineData[1214]++;
      sibling = container[0][direction];
      _$jscoverage['/editor/range.js'].lineData[1216]++;
      enlarge = container[0].parentNode;
    } else {
      _$jscoverage['/editor/range.js'].lineData[1219]++;
      sibling = visit559_1219_1(container[0].childNodes[offset + (left ? -1 : 1)] || null);
      _$jscoverage['/editor/range.js'].lineData[1221]++;
      enlarge = container[0];
    }
    _$jscoverage['/editor/range.js'].lineData[1224]++;
    while (enlarge) {
      _$jscoverage['/editor/range.js'].lineData[1226]++;
      while (sibling) {
        _$jscoverage['/editor/range.js'].lineData[1227]++;
        if (visit560_1227_1(isWhitespace(sibling) || isBookmark(sibling))) {
          _$jscoverage['/editor/range.js'].lineData[1228]++;
          sibling = sibling[direction];
        } else {
          _$jscoverage['/editor/range.js'].lineData[1230]++;
          break;
        }
      }
      _$jscoverage['/editor/range.js'].lineData[1235]++;
      if (visit561_1235_1(sibling)) {
        _$jscoverage['/editor/range.js'].lineData[1237]++;
        if (visit562_1237_1(!commonReached)) {
          _$jscoverage['/editor/range.js'].lineData[1239]++;
          self[left ? 'setStartAfter' : 'setEndBefore']($(sibling));
        }
        _$jscoverage['/editor/range.js'].lineData[1241]++;
        return;
      }
      _$jscoverage['/editor/range.js'].lineData[1248]++;
      enlarge = $(enlarge);
      _$jscoverage['/editor/range.js'].lineData[1250]++;
      if (visit563_1250_1(enlarge.nodeName() === 'body')) {
        _$jscoverage['/editor/range.js'].lineData[1251]++;
        return;
      }
      _$jscoverage['/editor/range.js'].lineData[1254]++;
      if (visit564_1254_1(commonReached || enlarge.equals(commonAncestor))) {
        _$jscoverage['/editor/range.js'].lineData[1255]++;
        stop[index] = enlarge;
        _$jscoverage['/editor/range.js'].lineData[1256]++;
        commonReached = 1;
      } else {
        _$jscoverage['/editor/range.js'].lineData[1259]++;
        self[left ? 'setStartBefore' : 'setEndAfter'](enlarge);
      }
      _$jscoverage['/editor/range.js'].lineData[1262]++;
      sibling = enlarge[0][direction];
      _$jscoverage['/editor/range.js'].lineData[1263]++;
      enlarge = enlarge[0].parentNode;
    }
  }
  _$jscoverage['/editor/range.js'].lineData[1268]++;
  return function(unit) {
  _$jscoverage['/editor/range.js'].functionData[40]++;
  _$jscoverage['/editor/range.js'].lineData[1269]++;
  var self = this, enlargeable;
  _$jscoverage['/editor/range.js'].lineData[1270]++;
  switch (unit) {
    case KER.ENLARGE_ELEMENT:
      _$jscoverage['/editor/range.js'].lineData[1273]++;
      if (visit565_1273_1(self.collapsed)) {
        _$jscoverage['/editor/range.js'].lineData[1274]++;
        return;
      }
      _$jscoverage['/editor/range.js'].lineData[1277]++;
      var commonAncestor = self.getCommonAncestor(), stop = [];
      _$jscoverage['/editor/range.js'].lineData[1280]++;
      enlargeElement(self, 1, stop, commonAncestor);
      _$jscoverage['/editor/range.js'].lineData[1281]++;
      enlargeElement(self, 0, stop, commonAncestor);
      _$jscoverage['/editor/range.js'].lineData[1283]++;
      if (visit566_1283_1(stop[0] && stop[1])) {
        _$jscoverage['/editor/range.js'].lineData[1284]++;
        var commonStop = stop[0].contains(stop[1]) ? stop[1] : stop[0];
        _$jscoverage['/editor/range.js'].lineData[1285]++;
        self.setStartBefore(commonStop);
        _$jscoverage['/editor/range.js'].lineData[1286]++;
        self.setEndAfter(commonStop);
      }
      _$jscoverage['/editor/range.js'].lineData[1289]++;
      break;
    case KER.ENLARGE_BLOCK_CONTENTS:
    case KER.ENLARGE_LIST_ITEM_CONTENTS:
      _$jscoverage['/editor/range.js'].lineData[1295]++;
      var walkerRange = new KERange(self.document);
      _$jscoverage['/editor/range.js'].lineData[1296]++;
      var body = new Node(self.document.body);
      _$jscoverage['/editor/range.js'].lineData[1298]++;
      walkerRange.setStartAt(body, KER.POSITION_AFTER_START);
      _$jscoverage['/editor/range.js'].lineData[1299]++;
      walkerRange.setEnd(self.startContainer, self.startOffset);
      _$jscoverage['/editor/range.js'].lineData[1301]++;
      var walker = new Walker(walkerRange), blockBoundary, tailBr, defaultGuard = Walker.blockBoundary((visit567_1305_1(unit === KER.ENLARGE_LIST_ITEM_CONTENTS)) ? {
  br: 1} : NULL), boundaryGuard = function(node) {
  _$jscoverage['/editor/range.js'].functionData[41]++;
  _$jscoverage['/editor/range.js'].lineData[1309]++;
  var retVal = defaultGuard(node);
  _$jscoverage['/editor/range.js'].lineData[1310]++;
  if (visit568_1310_1(!retVal)) {
    _$jscoverage['/editor/range.js'].lineData[1311]++;
    blockBoundary = $(node);
  }
  _$jscoverage['/editor/range.js'].lineData[1313]++;
  return retVal;
}, tailBrGuard = function(node) {
  _$jscoverage['/editor/range.js'].functionData[42]++;
  _$jscoverage['/editor/range.js'].lineData[1317]++;
  var retVal = boundaryGuard(node);
  _$jscoverage['/editor/range.js'].lineData[1318]++;
  if (visit569_1318_1(!retVal && visit570_1318_2(Dom.nodeName(node) === 'br'))) {
    _$jscoverage['/editor/range.js'].lineData[1319]++;
    tailBr = $(node);
  }
  _$jscoverage['/editor/range.js'].lineData[1321]++;
  return retVal;
};
      _$jscoverage['/editor/range.js'].lineData[1324]++;
      walker.guard = boundaryGuard;
      _$jscoverage['/editor/range.js'].lineData[1326]++;
      enlargeable = walker.lastBackward();
      _$jscoverage['/editor/range.js'].lineData[1329]++;
      blockBoundary = visit571_1329_1(blockBoundary || body);
      _$jscoverage['/editor/range.js'].lineData[1333]++;
      self.setStartAt(blockBoundary, visit572_1335_1(visit573_1335_2(blockBoundary.nodeName() !== 'br') && (visit574_1343_1(visit575_1343_2(!enlargeable && self.checkStartOfBlock()) || visit576_1343_3(enlargeable && blockBoundary.contains(enlargeable))))) ? KER.POSITION_AFTER_START : KER.POSITION_AFTER_END);
      _$jscoverage['/editor/range.js'].lineData[1348]++;
      walkerRange = self.clone();
      _$jscoverage['/editor/range.js'].lineData[1349]++;
      walkerRange.collapse();
      _$jscoverage['/editor/range.js'].lineData[1350]++;
      walkerRange.setEndAt(body, KER.POSITION_BEFORE_END);
      _$jscoverage['/editor/range.js'].lineData[1351]++;
      walker = new Walker(walkerRange);
      _$jscoverage['/editor/range.js'].lineData[1354]++;
      walker.guard = (visit577_1354_1(unit === KER.ENLARGE_LIST_ITEM_CONTENTS)) ? tailBrGuard : boundaryGuard;
      _$jscoverage['/editor/range.js'].lineData[1356]++;
      blockBoundary = NULL;
      _$jscoverage['/editor/range.js'].lineData[1359]++;
      enlargeable = walker.lastForward();
      _$jscoverage['/editor/range.js'].lineData[1362]++;
      blockBoundary = visit578_1362_1(blockBoundary || body);
      _$jscoverage['/editor/range.js'].lineData[1366]++;
      self.setEndAt(blockBoundary, (visit579_1368_1(visit580_1368_2(!enlargeable && self.checkEndOfBlock()) || visit581_1368_3(enlargeable && blockBoundary.contains(enlargeable)))) ? KER.POSITION_BEFORE_END : KER.POSITION_BEFORE_START);
      _$jscoverage['/editor/range.js'].lineData[1373]++;
      if (visit582_1373_1(tailBr)) {
        _$jscoverage['/editor/range.js'].lineData[1374]++;
        self.setEndAfter(tailBr);
      }
  }
};
})(), 
  checkStartOfBlock: function() {
  _$jscoverage['/editor/range.js'].functionData[43]++;
  _$jscoverage['/editor/range.js'].lineData[1385]++;
  var self = this, startContainer = self.startContainer, startOffset = self.startOffset;
  _$jscoverage['/editor/range.js'].lineData[1391]++;
  if (visit583_1391_1(startOffset && visit584_1391_2(startContainer[0].nodeType === Dom.NodeType.TEXT_NODE))) {
    _$jscoverage['/editor/range.js'].lineData[1392]++;
    var textBefore = S.trim(startContainer[0].nodeValue.substring(0, startOffset));
    _$jscoverage['/editor/range.js'].lineData[1393]++;
    if (visit585_1393_1(textBefore.length)) {
      _$jscoverage['/editor/range.js'].lineData[1394]++;
      return FALSE;
    }
  }
  _$jscoverage['/editor/range.js'].lineData[1401]++;
  self.trim();
  _$jscoverage['/editor/range.js'].lineData[1405]++;
  var path = new ElementPath(self.startContainer);
  _$jscoverage['/editor/range.js'].lineData[1408]++;
  var walkerRange = self.clone();
  _$jscoverage['/editor/range.js'].lineData[1409]++;
  walkerRange.collapse(TRUE);
  _$jscoverage['/editor/range.js'].lineData[1410]++;
  walkerRange.setStartAt(visit586_1410_1(path.block || path.blockLimit), KER.POSITION_AFTER_START);
  _$jscoverage['/editor/range.js'].lineData[1412]++;
  var walker = new Walker(walkerRange);
  _$jscoverage['/editor/range.js'].lineData[1413]++;
  walker.evaluator = getCheckStartEndBlockEvalFunction(TRUE);
  _$jscoverage['/editor/range.js'].lineData[1415]++;
  return walker.checkBackward();
}, 
  checkEndOfBlock: function() {
  _$jscoverage['/editor/range.js'].functionData[44]++;
  _$jscoverage['/editor/range.js'].lineData[1423]++;
  var self = this, endContainer = self.endContainer, endOffset = self.endOffset;
  _$jscoverage['/editor/range.js'].lineData[1428]++;
  if (visit587_1428_1(endContainer[0].nodeType === Dom.NodeType.TEXT_NODE)) {
    _$jscoverage['/editor/range.js'].lineData[1429]++;
    var textAfter = S.trim(endContainer[0].nodeValue.substring(endOffset));
    _$jscoverage['/editor/range.js'].lineData[1430]++;
    if (visit588_1430_1(textAfter.length)) {
      _$jscoverage['/editor/range.js'].lineData[1431]++;
      return FALSE;
    }
  }
  _$jscoverage['/editor/range.js'].lineData[1438]++;
  self.trim();
  _$jscoverage['/editor/range.js'].lineData[1442]++;
  var path = new ElementPath(self.endContainer);
  _$jscoverage['/editor/range.js'].lineData[1445]++;
  var walkerRange = self.clone();
  _$jscoverage['/editor/range.js'].lineData[1446]++;
  walkerRange.collapse(FALSE);
  _$jscoverage['/editor/range.js'].lineData[1447]++;
  walkerRange.setEndAt(visit589_1447_1(path.block || path.blockLimit), KER.POSITION_BEFORE_END);
  _$jscoverage['/editor/range.js'].lineData[1449]++;
  var walker = new Walker(walkerRange);
  _$jscoverage['/editor/range.js'].lineData[1450]++;
  walker.evaluator = getCheckStartEndBlockEvalFunction(FALSE);
  _$jscoverage['/editor/range.js'].lineData[1452]++;
  return walker.checkForward();
}, 
  checkBoundaryOfElement: function(element, checkType) {
  _$jscoverage['/editor/range.js'].functionData[45]++;
  _$jscoverage['/editor/range.js'].lineData[1461]++;
  var walkerRange = this.clone();
  _$jscoverage['/editor/range.js'].lineData[1465]++;
  walkerRange[visit590_1463_1(checkType === KER.START) ? 'setStartAt' : 'setEndAt'](element, visit591_1465_1(checkType === KER.START) ? KER.POSITION_AFTER_START : KER.POSITION_BEFORE_END);
  _$jscoverage['/editor/range.js'].lineData[1469]++;
  var walker = new Walker(walkerRange);
  _$jscoverage['/editor/range.js'].lineData[1471]++;
  walker.evaluator = elementBoundaryEval;
  _$jscoverage['/editor/range.js'].lineData[1472]++;
  return walker[visit592_1472_1(checkType === KER.START) ? 'checkBackward' : 'checkForward']();
}, 
  getBoundaryNodes: function() {
  _$jscoverage['/editor/range.js'].functionData[46]++;
  _$jscoverage['/editor/range.js'].lineData[1481]++;
  var self = this, startNode = self.startContainer, endNode = self.endContainer, startOffset = self.startOffset, endOffset = self.endOffset, childCount;
  _$jscoverage['/editor/range.js'].lineData[1488]++;
  if (visit593_1488_1(startNode[0].nodeType === Dom.NodeType.ELEMENT_NODE)) {
    _$jscoverage['/editor/range.js'].lineData[1489]++;
    childCount = startNode[0].childNodes.length;
    _$jscoverage['/editor/range.js'].lineData[1490]++;
    if (visit594_1490_1(childCount > startOffset)) {
      _$jscoverage['/editor/range.js'].lineData[1491]++;
      startNode = $(startNode[0].childNodes[startOffset]);
    } else {
      _$jscoverage['/editor/range.js'].lineData[1492]++;
      if (visit595_1492_1(childCount === 0)) {
        _$jscoverage['/editor/range.js'].lineData[1494]++;
        startNode = startNode._4ePreviousSourceNode();
      } else {
        _$jscoverage['/editor/range.js'].lineData[1498]++;
        startNode = startNode[0];
        _$jscoverage['/editor/range.js'].lineData[1499]++;
        while (startNode.lastChild) {
          _$jscoverage['/editor/range.js'].lineData[1500]++;
          startNode = startNode.lastChild;
        }
        _$jscoverage['/editor/range.js'].lineData[1503]++;
        startNode = $(startNode);
        _$jscoverage['/editor/range.js'].lineData[1508]++;
        startNode = visit596_1508_1(startNode._4eNextSourceNode() || startNode);
      }
    }
  }
  _$jscoverage['/editor/range.js'].lineData[1512]++;
  if (visit597_1512_1(endNode[0].nodeType === Dom.NodeType.ELEMENT_NODE)) {
    _$jscoverage['/editor/range.js'].lineData[1513]++;
    childCount = endNode[0].childNodes.length;
    _$jscoverage['/editor/range.js'].lineData[1514]++;
    if (visit598_1514_1(childCount > endOffset)) {
      _$jscoverage['/editor/range.js'].lineData[1515]++;
      endNode = $(endNode[0].childNodes[endOffset])._4ePreviousSourceNode(TRUE);
    } else {
      _$jscoverage['/editor/range.js'].lineData[1518]++;
      if (visit599_1518_1(childCount === 0)) {
        _$jscoverage['/editor/range.js'].lineData[1519]++;
        endNode = endNode._4ePreviousSourceNode();
      } else {
        _$jscoverage['/editor/range.js'].lineData[1523]++;
        endNode = endNode[0];
        _$jscoverage['/editor/range.js'].lineData[1524]++;
        while (endNode.lastChild) {
          _$jscoverage['/editor/range.js'].lineData[1525]++;
          endNode = endNode.lastChild;
        }
        _$jscoverage['/editor/range.js'].lineData[1527]++;
        endNode = $(endNode);
      }
    }
  }
  _$jscoverage['/editor/range.js'].lineData[1533]++;
  if (visit600_1533_1(startNode._4ePosition(endNode) & KEP.POSITION_FOLLOWING)) {
    _$jscoverage['/editor/range.js'].lineData[1534]++;
    startNode = endNode;
  }
  _$jscoverage['/editor/range.js'].lineData[1537]++;
  return {
  startNode: startNode, 
  endNode: endNode};
}, 
  fixBlock: function(isStart, blockTag) {
  _$jscoverage['/editor/range.js'].functionData[47]++;
  _$jscoverage['/editor/range.js'].lineData[1551]++;
  var self = this, bookmark = self.createBookmark(), fixedBlock = $(self.document.createElement(blockTag));
  _$jscoverage['/editor/range.js'].lineData[1554]++;
  self.collapse(isStart);
  _$jscoverage['/editor/range.js'].lineData[1555]++;
  self.enlarge(KER.ENLARGE_BLOCK_CONTENTS);
  _$jscoverage['/editor/range.js'].lineData[1556]++;
  fixedBlock[0].appendChild(self.extractContents());
  _$jscoverage['/editor/range.js'].lineData[1557]++;
  fixedBlock._4eTrim();
  _$jscoverage['/editor/range.js'].lineData[1558]++;
  if (visit601_1558_1(!UA.ie)) {
    _$jscoverage['/editor/range.js'].lineData[1559]++;
    fixedBlock._4eAppendBogus();
  }
  _$jscoverage['/editor/range.js'].lineData[1561]++;
  self.insertNode(fixedBlock);
  _$jscoverage['/editor/range.js'].lineData[1562]++;
  self.moveToBookmark(bookmark);
  _$jscoverage['/editor/range.js'].lineData[1563]++;
  return fixedBlock;
}, 
  splitBlock: function(blockTag) {
  _$jscoverage['/editor/range.js'].functionData[48]++;
  _$jscoverage['/editor/range.js'].lineData[1572]++;
  var self = this, startPath = new ElementPath(self.startContainer), endPath = new ElementPath(self.endContainer), startBlockLimit = startPath.blockLimit, endBlockLimit = endPath.blockLimit, startBlock = startPath.block, endBlock = endPath.block, elementPath = NULL;
  _$jscoverage['/editor/range.js'].lineData[1582]++;
  if (visit602_1582_1(!startBlockLimit.equals(endBlockLimit))) {
    _$jscoverage['/editor/range.js'].lineData[1583]++;
    return NULL;
  }
  _$jscoverage['/editor/range.js'].lineData[1587]++;
  if (visit603_1587_1(blockTag !== 'br')) {
    _$jscoverage['/editor/range.js'].lineData[1588]++;
    if (visit604_1588_1(!startBlock)) {
      _$jscoverage['/editor/range.js'].lineData[1589]++;
      startBlock = self.fixBlock(TRUE, blockTag);
      _$jscoverage['/editor/range.js'].lineData[1590]++;
      endBlock = new ElementPath(self.endContainer).block;
    }
    _$jscoverage['/editor/range.js'].lineData[1593]++;
    if (visit605_1593_1(!endBlock)) {
      _$jscoverage['/editor/range.js'].lineData[1594]++;
      endBlock = self.fixBlock(FALSE, blockTag);
    }
  }
  _$jscoverage['/editor/range.js'].lineData[1599]++;
  var isStartOfBlock = visit606_1599_1(startBlock && self.checkStartOfBlock()), isEndOfBlock = visit607_1600_1(endBlock && self.checkEndOfBlock());
  _$jscoverage['/editor/range.js'].lineData[1603]++;
  self.deleteContents();
  _$jscoverage['/editor/range.js'].lineData[1605]++;
  if (visit608_1605_1(startBlock && visit609_1605_2(startBlock[0] === endBlock[0]))) {
    _$jscoverage['/editor/range.js'].lineData[1606]++;
    if (visit610_1606_1(isEndOfBlock)) {
      _$jscoverage['/editor/range.js'].lineData[1607]++;
      elementPath = new ElementPath(self.startContainer);
      _$jscoverage['/editor/range.js'].lineData[1608]++;
      self.moveToPosition(endBlock, KER.POSITION_AFTER_END);
      _$jscoverage['/editor/range.js'].lineData[1609]++;
      endBlock = NULL;
    } else {
      _$jscoverage['/editor/range.js'].lineData[1610]++;
      if (visit611_1610_1(isStartOfBlock)) {
        _$jscoverage['/editor/range.js'].lineData[1611]++;
        elementPath = new ElementPath(self.startContainer);
        _$jscoverage['/editor/range.js'].lineData[1612]++;
        self.moveToPosition(startBlock, KER.POSITION_BEFORE_START);
        _$jscoverage['/editor/range.js'].lineData[1613]++;
        startBlock = NULL;
      } else {
        _$jscoverage['/editor/range.js'].lineData[1615]++;
        endBlock = self.splitElement(startBlock);
        _$jscoverage['/editor/range.js'].lineData[1619]++;
        if (visit612_1619_1(!UA.ie && !S.inArray(startBlock.nodeName(), ['ul', 'ol']))) {
          _$jscoverage['/editor/range.js'].lineData[1620]++;
          startBlock._4eAppendBogus();
        }
      }
    }
  }
  _$jscoverage['/editor/range.js'].lineData[1625]++;
  return {
  previousBlock: startBlock, 
  nextBlock: endBlock, 
  wasStartOfBlock: isStartOfBlock, 
  wasEndOfBlock: isEndOfBlock, 
  elementPath: elementPath};
}, 
  splitElement: function(toSplit) {
  _$jscoverage['/editor/range.js'].functionData[49]++;
  _$jscoverage['/editor/range.js'].lineData[1640]++;
  var self = this;
  _$jscoverage['/editor/range.js'].lineData[1641]++;
  if (visit613_1641_1(!self.collapsed)) {
    _$jscoverage['/editor/range.js'].lineData[1642]++;
    return NULL;
  }
  _$jscoverage['/editor/range.js'].lineData[1647]++;
  self.setEndAt(toSplit, KER.POSITION_BEFORE_END);
  _$jscoverage['/editor/range.js'].lineData[1648]++;
  var documentFragment = self.extractContents(), clone = toSplit.clone(FALSE);
  _$jscoverage['/editor/range.js'].lineData[1653]++;
  clone[0].appendChild(documentFragment);
  _$jscoverage['/editor/range.js'].lineData[1655]++;
  clone.insertAfter(toSplit);
  _$jscoverage['/editor/range.js'].lineData[1656]++;
  self.moveToPosition(toSplit, KER.POSITION_AFTER_END);
  _$jscoverage['/editor/range.js'].lineData[1657]++;
  return clone;
}, 
  moveToElementEditablePosition: function(el, isMoveToEnd) {
  _$jscoverage['/editor/range.js'].functionData[50]++;
  _$jscoverage['/editor/range.js'].lineData[1669]++;
  function nextDFS(node, childOnly) {
    _$jscoverage['/editor/range.js'].functionData[51]++;
    _$jscoverage['/editor/range.js'].lineData[1670]++;
    var next;
    _$jscoverage['/editor/range.js'].lineData[1672]++;
    if (visit614_1672_1(visit615_1672_2(node[0].nodeType === Dom.NodeType.ELEMENT_NODE) && node._4eIsEditable())) {
      _$jscoverage['/editor/range.js'].lineData[1674]++;
      next = node[isMoveToEnd ? 'last' : 'first'](nonWhitespaceOrIsBookmark, 1);
    }
    _$jscoverage['/editor/range.js'].lineData[1677]++;
    if (visit616_1677_1(!childOnly && !next)) {
      _$jscoverage['/editor/range.js'].lineData[1678]++;
      next = node[isMoveToEnd ? 'prev' : 'next'](nonWhitespaceOrIsBookmark, 1);
    }
    _$jscoverage['/editor/range.js'].lineData[1681]++;
    return next;
  }
  _$jscoverage['/editor/range.js'].lineData[1684]++;
  var found = 0, self = this;
  _$jscoverage['/editor/range.js'].lineData[1686]++;
  while (el) {
    _$jscoverage['/editor/range.js'].lineData[1688]++;
    if (visit617_1688_1(el[0].nodeType === Dom.NodeType.TEXT_NODE)) {
      _$jscoverage['/editor/range.js'].lineData[1689]++;
      self.moveToPosition(el, isMoveToEnd ? KER.POSITION_AFTER_END : KER.POSITION_BEFORE_START);
      _$jscoverage['/editor/range.js'].lineData[1692]++;
      found = 1;
      _$jscoverage['/editor/range.js'].lineData[1693]++;
      break;
    }
    _$jscoverage['/editor/range.js'].lineData[1697]++;
    if (visit618_1697_1(visit619_1697_2(el[0].nodeType === Dom.NodeType.ELEMENT_NODE) && el._4eIsEditable())) {
      _$jscoverage['/editor/range.js'].lineData[1698]++;
      self.moveToPosition(el, isMoveToEnd ? KER.POSITION_BEFORE_END : KER.POSITION_AFTER_START);
      _$jscoverage['/editor/range.js'].lineData[1701]++;
      found = 1;
    }
    _$jscoverage['/editor/range.js'].lineData[1704]++;
    el = nextDFS(el, found);
  }
  _$jscoverage['/editor/range.js'].lineData[1707]++;
  return !!found;
}, 
  selectNodeContents: function(node) {
  _$jscoverage['/editor/range.js'].functionData[52]++;
  _$jscoverage['/editor/range.js'].lineData[1715]++;
  var self = this, domNode = node[0];
  _$jscoverage['/editor/range.js'].lineData[1716]++;
  self.setStart(node, 0);
  _$jscoverage['/editor/range.js'].lineData[1717]++;
  self.setEnd(node, visit620_1717_1(domNode.nodeType === Dom.NodeType.TEXT_NODE) ? domNode.nodeValue.length : domNode.childNodes.length);
}, 
  insertNodeByDtd: function(element) {
  _$jscoverage['/editor/range.js'].functionData[53]++;
  _$jscoverage['/editor/range.js'].lineData[1727]++;
  var current, self = this, tmpDtd, last, elementName = element.nodeName(), isBlock = dtd.$block[elementName];
  _$jscoverage['/editor/range.js'].lineData[1733]++;
  self.deleteContents();
  _$jscoverage['/editor/range.js'].lineData[1734]++;
  if (visit621_1734_1(isBlock)) {
    _$jscoverage['/editor/range.js'].lineData[1735]++;
    current = self.getCommonAncestor(FALSE, TRUE);
    _$jscoverage['/editor/range.js'].lineData[1736]++;
    while (visit622_1736_1((tmpDtd = dtd[current.nodeName()]) && !(visit623_1736_2(tmpDtd && tmpDtd[elementName])))) {
      _$jscoverage['/editor/range.js'].lineData[1737]++;
      var parent = current.parent();
      _$jscoverage['/editor/range.js'].lineData[1740]++;
      if (visit624_1740_1(self.checkStartOfBlock() && self.checkEndOfBlock())) {
        _$jscoverage['/editor/range.js'].lineData[1741]++;
        self.setStartBefore(current);
        _$jscoverage['/editor/range.js'].lineData[1742]++;
        self.collapse(TRUE);
        _$jscoverage['/editor/range.js'].lineData[1743]++;
        current.remove();
      } else {
        _$jscoverage['/editor/range.js'].lineData[1745]++;
        last = current;
      }
      _$jscoverage['/editor/range.js'].lineData[1747]++;
      current = parent;
    }
    _$jscoverage['/editor/range.js'].lineData[1750]++;
    if (visit625_1750_1(last)) {
      _$jscoverage['/editor/range.js'].lineData[1751]++;
      self.splitElement(last);
    }
  }
  _$jscoverage['/editor/range.js'].lineData[1755]++;
  self.insertNode(element);
}});
  _$jscoverage['/editor/range.js'].lineData[1759]++;
  Utils.injectDom({
  _4eBreakParent: function(el, parent) {
  _$jscoverage['/editor/range.js'].functionData[54]++;
  _$jscoverage['/editor/range.js'].lineData[1761]++;
  parent = $(parent);
  _$jscoverage['/editor/range.js'].lineData[1762]++;
  el = $(el);
  _$jscoverage['/editor/range.js'].lineData[1764]++;
  var KERange = Editor.Range, docFrag, range = new KERange(el[0].ownerDocument);
  _$jscoverage['/editor/range.js'].lineData[1770]++;
  range.setStartAfter(el);
  _$jscoverage['/editor/range.js'].lineData[1771]++;
  range.setEndAfter(parent);
  _$jscoverage['/editor/range.js'].lineData[1774]++;
  docFrag = range.extractContents();
  _$jscoverage['/editor/range.js'].lineData[1777]++;
  range.insertNode(el.remove());
  _$jscoverage['/editor/range.js'].lineData[1780]++;
  el.after(docFrag);
}});
  _$jscoverage['/editor/range.js'].lineData[1784]++;
  Editor.Range = KERange;
  _$jscoverage['/editor/range.js'].lineData[1786]++;
  return KERange;
});
