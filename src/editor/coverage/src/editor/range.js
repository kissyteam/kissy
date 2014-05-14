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
  _$jscoverage['/editor/range.js'].lineData[17] = 0;
  _$jscoverage['/editor/range.js'].lineData[22] = 0;
  _$jscoverage['/editor/range.js'].lineData[36] = 0;
  _$jscoverage['/editor/range.js'].lineData[61] = 0;
  _$jscoverage['/editor/range.js'].lineData[66] = 0;
  _$jscoverage['/editor/range.js'].lineData[97] = 0;
  _$jscoverage['/editor/range.js'].lineData[101] = 0;
  _$jscoverage['/editor/range.js'].lineData[107] = 0;
  _$jscoverage['/editor/range.js'].lineData[110] = 0;
  _$jscoverage['/editor/range.js'].lineData[112] = 0;
  _$jscoverage['/editor/range.js'].lineData[115] = 0;
  _$jscoverage['/editor/range.js'].lineData[116] = 0;
  _$jscoverage['/editor/range.js'].lineData[117] = 0;
  _$jscoverage['/editor/range.js'].lineData[119] = 0;
  _$jscoverage['/editor/range.js'].lineData[120] = 0;
  _$jscoverage['/editor/range.js'].lineData[123] = 0;
  _$jscoverage['/editor/range.js'].lineData[125] = 0;
  _$jscoverage['/editor/range.js'].lineData[126] = 0;
  _$jscoverage['/editor/range.js'].lineData[128] = 0;
  _$jscoverage['/editor/range.js'].lineData[129] = 0;
  _$jscoverage['/editor/range.js'].lineData[132] = 0;
  _$jscoverage['/editor/range.js'].lineData[135] = 0;
  _$jscoverage['/editor/range.js'].lineData[136] = 0;
  _$jscoverage['/editor/range.js'].lineData[138] = 0;
  _$jscoverage['/editor/range.js'].lineData[142] = 0;
  _$jscoverage['/editor/range.js'].lineData[152] = 0;
  _$jscoverage['/editor/range.js'].lineData[153] = 0;
  _$jscoverage['/editor/range.js'].lineData[165] = 0;
  _$jscoverage['/editor/range.js'].lineData[166] = 0;
  _$jscoverage['/editor/range.js'].lineData[169] = 0;
  _$jscoverage['/editor/range.js'].lineData[170] = 0;
  _$jscoverage['/editor/range.js'].lineData[174] = 0;
  _$jscoverage['/editor/range.js'].lineData[181] = 0;
  _$jscoverage['/editor/range.js'].lineData[182] = 0;
  _$jscoverage['/editor/range.js'].lineData[183] = 0;
  _$jscoverage['/editor/range.js'].lineData[187] = 0;
  _$jscoverage['/editor/range.js'].lineData[189] = 0;
  _$jscoverage['/editor/range.js'].lineData[191] = 0;
  _$jscoverage['/editor/range.js'].lineData[192] = 0;
  _$jscoverage['/editor/range.js'].lineData[194] = 0;
  _$jscoverage['/editor/range.js'].lineData[203] = 0;
  _$jscoverage['/editor/range.js'].lineData[204] = 0;
  _$jscoverage['/editor/range.js'].lineData[205] = 0;
  _$jscoverage['/editor/range.js'].lineData[212] = 0;
  _$jscoverage['/editor/range.js'].lineData[214] = 0;
  _$jscoverage['/editor/range.js'].lineData[215] = 0;
  _$jscoverage['/editor/range.js'].lineData[216] = 0;
  _$jscoverage['/editor/range.js'].lineData[217] = 0;
  _$jscoverage['/editor/range.js'].lineData[218] = 0;
  _$jscoverage['/editor/range.js'].lineData[220] = 0;
  _$jscoverage['/editor/range.js'].lineData[222] = 0;
  _$jscoverage['/editor/range.js'].lineData[224] = 0;
  _$jscoverage['/editor/range.js'].lineData[230] = 0;
  _$jscoverage['/editor/range.js'].lineData[233] = 0;
  _$jscoverage['/editor/range.js'].lineData[234] = 0;
  _$jscoverage['/editor/range.js'].lineData[237] = 0;
  _$jscoverage['/editor/range.js'].lineData[238] = 0;
  _$jscoverage['/editor/range.js'].lineData[242] = 0;
  _$jscoverage['/editor/range.js'].lineData[244] = 0;
  _$jscoverage['/editor/range.js'].lineData[245] = 0;
  _$jscoverage['/editor/range.js'].lineData[246] = 0;
  _$jscoverage['/editor/range.js'].lineData[252] = 0;
  _$jscoverage['/editor/range.js'].lineData[253] = 0;
  _$jscoverage['/editor/range.js'].lineData[257] = 0;
  _$jscoverage['/editor/range.js'].lineData[265] = 0;
  _$jscoverage['/editor/range.js'].lineData[266] = 0;
  _$jscoverage['/editor/range.js'].lineData[269] = 0;
  _$jscoverage['/editor/range.js'].lineData[271] = 0;
  _$jscoverage['/editor/range.js'].lineData[273] = 0;
  _$jscoverage['/editor/range.js'].lineData[277] = 0;
  _$jscoverage['/editor/range.js'].lineData[279] = 0;
  _$jscoverage['/editor/range.js'].lineData[283] = 0;
  _$jscoverage['/editor/range.js'].lineData[286] = 0;
  _$jscoverage['/editor/range.js'].lineData[287] = 0;
  _$jscoverage['/editor/range.js'].lineData[291] = 0;
  _$jscoverage['/editor/range.js'].lineData[294] = 0;
  _$jscoverage['/editor/range.js'].lineData[296] = 0;
  _$jscoverage['/editor/range.js'].lineData[301] = 0;
  _$jscoverage['/editor/range.js'].lineData[302] = 0;
  _$jscoverage['/editor/range.js'].lineData[303] = 0;
  _$jscoverage['/editor/range.js'].lineData[304] = 0;
  _$jscoverage['/editor/range.js'].lineData[307] = 0;
  _$jscoverage['/editor/range.js'].lineData[311] = 0;
  _$jscoverage['/editor/range.js'].lineData[313] = 0;
  _$jscoverage['/editor/range.js'].lineData[317] = 0;
  _$jscoverage['/editor/range.js'].lineData[320] = 0;
  _$jscoverage['/editor/range.js'].lineData[321] = 0;
  _$jscoverage['/editor/range.js'].lineData[325] = 0;
  _$jscoverage['/editor/range.js'].lineData[329] = 0;
  _$jscoverage['/editor/range.js'].lineData[330] = 0;
  _$jscoverage['/editor/range.js'].lineData[333] = 0;
  _$jscoverage['/editor/range.js'].lineData[336] = 0;
  _$jscoverage['/editor/range.js'].lineData[338] = 0;
  _$jscoverage['/editor/range.js'].lineData[342] = 0;
  _$jscoverage['/editor/range.js'].lineData[345] = 0;
  _$jscoverage['/editor/range.js'].lineData[346] = 0;
  _$jscoverage['/editor/range.js'].lineData[348] = 0;
  _$jscoverage['/editor/range.js'].lineData[351] = 0;
  _$jscoverage['/editor/range.js'].lineData[352] = 0;
  _$jscoverage['/editor/range.js'].lineData[356] = 0;
  _$jscoverage['/editor/range.js'].lineData[359] = 0;
  _$jscoverage['/editor/range.js'].lineData[361] = 0;
  _$jscoverage['/editor/range.js'].lineData[365] = 0;
  _$jscoverage['/editor/range.js'].lineData[369] = 0;
  _$jscoverage['/editor/range.js'].lineData[370] = 0;
  _$jscoverage['/editor/range.js'].lineData[374] = 0;
  _$jscoverage['/editor/range.js'].lineData[378] = 0;
  _$jscoverage['/editor/range.js'].lineData[379] = 0;
  _$jscoverage['/editor/range.js'].lineData[380] = 0;
  _$jscoverage['/editor/range.js'].lineData[383] = 0;
  _$jscoverage['/editor/range.js'].lineData[384] = 0;
  _$jscoverage['/editor/range.js'].lineData[388] = 0;
  _$jscoverage['/editor/range.js'].lineData[389] = 0;
  _$jscoverage['/editor/range.js'].lineData[390] = 0;
  _$jscoverage['/editor/range.js'].lineData[393] = 0;
  _$jscoverage['/editor/range.js'].lineData[394] = 0;
  _$jscoverage['/editor/range.js'].lineData[404] = 0;
  _$jscoverage['/editor/range.js'].lineData[406] = 0;
  _$jscoverage['/editor/range.js'].lineData[410] = 0;
  _$jscoverage['/editor/range.js'].lineData[413] = 0;
  _$jscoverage['/editor/range.js'].lineData[416] = 0;
  _$jscoverage['/editor/range.js'].lineData[420] = 0;
  _$jscoverage['/editor/range.js'].lineData[425] = 0;
  _$jscoverage['/editor/range.js'].lineData[426] = 0;
  _$jscoverage['/editor/range.js'].lineData[429] = 0;
  _$jscoverage['/editor/range.js'].lineData[430] = 0;
  _$jscoverage['/editor/range.js'].lineData[433] = 0;
  _$jscoverage['/editor/range.js'].lineData[436] = 0;
  _$jscoverage['/editor/range.js'].lineData[437] = 0;
  _$jscoverage['/editor/range.js'].lineData[448] = 0;
  _$jscoverage['/editor/range.js'].lineData[449] = 0;
  _$jscoverage['/editor/range.js'].lineData[450] = 0;
  _$jscoverage['/editor/range.js'].lineData[451] = 0;
  _$jscoverage['/editor/range.js'].lineData[452] = 0;
  _$jscoverage['/editor/range.js'].lineData[453] = 0;
  _$jscoverage['/editor/range.js'].lineData[454] = 0;
  _$jscoverage['/editor/range.js'].lineData[455] = 0;
  _$jscoverage['/editor/range.js'].lineData[458] = 0;
  _$jscoverage['/editor/range.js'].lineData[463] = 0;
  _$jscoverage['/editor/range.js'].lineData[467] = 0;
  _$jscoverage['/editor/range.js'].lineData[468] = 0;
  _$jscoverage['/editor/range.js'].lineData[469] = 0;
  _$jscoverage['/editor/range.js'].lineData[479] = 0;
  _$jscoverage['/editor/range.js'].lineData[483] = 0;
  _$jscoverage['/editor/range.js'].lineData[484] = 0;
  _$jscoverage['/editor/range.js'].lineData[485] = 0;
  _$jscoverage['/editor/range.js'].lineData[486] = 0;
  _$jscoverage['/editor/range.js'].lineData[487] = 0;
  _$jscoverage['/editor/range.js'].lineData[491] = 0;
  _$jscoverage['/editor/range.js'].lineData[492] = 0;
  _$jscoverage['/editor/range.js'].lineData[494] = 0;
  _$jscoverage['/editor/range.js'].lineData[495] = 0;
  _$jscoverage['/editor/range.js'].lineData[496] = 0;
  _$jscoverage['/editor/range.js'].lineData[497] = 0;
  _$jscoverage['/editor/range.js'].lineData[498] = 0;
  _$jscoverage['/editor/range.js'].lineData[508] = 0;
  _$jscoverage['/editor/range.js'].lineData[515] = 0;
  _$jscoverage['/editor/range.js'].lineData[522] = 0;
  _$jscoverage['/editor/range.js'].lineData[529] = 0;
  _$jscoverage['/editor/range.js'].lineData[536] = 0;
  _$jscoverage['/editor/range.js'].lineData[540] = 0;
  _$jscoverage['/editor/range.js'].lineData[543] = 0;
  _$jscoverage['/editor/range.js'].lineData[545] = 0;
  _$jscoverage['/editor/range.js'].lineData[548] = 0;
  _$jscoverage['/editor/range.js'].lineData[566] = 0;
  _$jscoverage['/editor/range.js'].lineData[567] = 0;
  _$jscoverage['/editor/range.js'].lineData[568] = 0;
  _$jscoverage['/editor/range.js'].lineData[569] = 0;
  _$jscoverage['/editor/range.js'].lineData[572] = 0;
  _$jscoverage['/editor/range.js'].lineData[573] = 0;
  _$jscoverage['/editor/range.js'].lineData[575] = 0;
  _$jscoverage['/editor/range.js'].lineData[576] = 0;
  _$jscoverage['/editor/range.js'].lineData[577] = 0;
  _$jscoverage['/editor/range.js'].lineData[580] = 0;
  _$jscoverage['/editor/range.js'].lineData[597] = 0;
  _$jscoverage['/editor/range.js'].lineData[598] = 0;
  _$jscoverage['/editor/range.js'].lineData[599] = 0;
  _$jscoverage['/editor/range.js'].lineData[600] = 0;
  _$jscoverage['/editor/range.js'].lineData[603] = 0;
  _$jscoverage['/editor/range.js'].lineData[604] = 0;
  _$jscoverage['/editor/range.js'].lineData[606] = 0;
  _$jscoverage['/editor/range.js'].lineData[607] = 0;
  _$jscoverage['/editor/range.js'].lineData[608] = 0;
  _$jscoverage['/editor/range.js'].lineData[611] = 0;
  _$jscoverage['/editor/range.js'].lineData[620] = 0;
  _$jscoverage['/editor/range.js'].lineData[621] = 0;
  _$jscoverage['/editor/range.js'].lineData[623] = 0;
  _$jscoverage['/editor/range.js'].lineData[624] = 0;
  _$jscoverage['/editor/range.js'].lineData[627] = 0;
  _$jscoverage['/editor/range.js'].lineData[628] = 0;
  _$jscoverage['/editor/range.js'].lineData[630] = 0;
  _$jscoverage['/editor/range.js'].lineData[632] = 0;
  _$jscoverage['/editor/range.js'].lineData[635] = 0;
  _$jscoverage['/editor/range.js'].lineData[636] = 0;
  _$jscoverage['/editor/range.js'].lineData[639] = 0;
  _$jscoverage['/editor/range.js'].lineData[642] = 0;
  _$jscoverage['/editor/range.js'].lineData[651] = 0;
  _$jscoverage['/editor/range.js'].lineData[652] = 0;
  _$jscoverage['/editor/range.js'].lineData[654] = 0;
  _$jscoverage['/editor/range.js'].lineData[655] = 0;
  _$jscoverage['/editor/range.js'].lineData[658] = 0;
  _$jscoverage['/editor/range.js'].lineData[659] = 0;
  _$jscoverage['/editor/range.js'].lineData[661] = 0;
  _$jscoverage['/editor/range.js'].lineData[663] = 0;
  _$jscoverage['/editor/range.js'].lineData[666] = 0;
  _$jscoverage['/editor/range.js'].lineData[667] = 0;
  _$jscoverage['/editor/range.js'].lineData[670] = 0;
  _$jscoverage['/editor/range.js'].lineData[673] = 0;
  _$jscoverage['/editor/range.js'].lineData[680] = 0;
  _$jscoverage['/editor/range.js'].lineData[687] = 0;
  _$jscoverage['/editor/range.js'].lineData[694] = 0;
  _$jscoverage['/editor/range.js'].lineData[702] = 0;
  _$jscoverage['/editor/range.js'].lineData[703] = 0;
  _$jscoverage['/editor/range.js'].lineData[704] = 0;
  _$jscoverage['/editor/range.js'].lineData[705] = 0;
  _$jscoverage['/editor/range.js'].lineData[707] = 0;
  _$jscoverage['/editor/range.js'].lineData[708] = 0;
  _$jscoverage['/editor/range.js'].lineData[710] = 0;
  _$jscoverage['/editor/range.js'].lineData[718] = 0;
  _$jscoverage['/editor/range.js'].lineData[721] = 0;
  _$jscoverage['/editor/range.js'].lineData[722] = 0;
  _$jscoverage['/editor/range.js'].lineData[723] = 0;
  _$jscoverage['/editor/range.js'].lineData[724] = 0;
  _$jscoverage['/editor/range.js'].lineData[725] = 0;
  _$jscoverage['/editor/range.js'].lineData[727] = 0;
  _$jscoverage['/editor/range.js'].lineData[739] = 0;
  _$jscoverage['/editor/range.js'].lineData[742] = 0;
  _$jscoverage['/editor/range.js'].lineData[744] = 0;
  _$jscoverage['/editor/range.js'].lineData[746] = 0;
  _$jscoverage['/editor/range.js'].lineData[749] = 0;
  _$jscoverage['/editor/range.js'].lineData[752] = 0;
  _$jscoverage['/editor/range.js'].lineData[753] = 0;
  _$jscoverage['/editor/range.js'].lineData[760] = 0;
  _$jscoverage['/editor/range.js'].lineData[761] = 0;
  _$jscoverage['/editor/range.js'].lineData[762] = 0;
  _$jscoverage['/editor/range.js'].lineData[764] = 0;
  _$jscoverage['/editor/range.js'].lineData[774] = 0;
  _$jscoverage['/editor/range.js'].lineData[775] = 0;
  _$jscoverage['/editor/range.js'].lineData[776] = 0;
  _$jscoverage['/editor/range.js'].lineData[778] = 0;
  _$jscoverage['/editor/range.js'].lineData[789] = 0;
  _$jscoverage['/editor/range.js'].lineData[791] = 0;
  _$jscoverage['/editor/range.js'].lineData[792] = 0;
  _$jscoverage['/editor/range.js'].lineData[793] = 0;
  _$jscoverage['/editor/range.js'].lineData[794] = 0;
  _$jscoverage['/editor/range.js'].lineData[798] = 0;
  _$jscoverage['/editor/range.js'].lineData[799] = 0;
  _$jscoverage['/editor/range.js'].lineData[803] = 0;
  _$jscoverage['/editor/range.js'].lineData[805] = 0;
  _$jscoverage['/editor/range.js'].lineData[806] = 0;
  _$jscoverage['/editor/range.js'].lineData[807] = 0;
  _$jscoverage['/editor/range.js'].lineData[808] = 0;
  _$jscoverage['/editor/range.js'].lineData[810] = 0;
  _$jscoverage['/editor/range.js'].lineData[811] = 0;
  _$jscoverage['/editor/range.js'].lineData[815] = 0;
  _$jscoverage['/editor/range.js'].lineData[817] = 0;
  _$jscoverage['/editor/range.js'].lineData[819] = 0;
  _$jscoverage['/editor/range.js'].lineData[820] = 0;
  _$jscoverage['/editor/range.js'].lineData[824] = 0;
  _$jscoverage['/editor/range.js'].lineData[826] = 0;
  _$jscoverage['/editor/range.js'].lineData[828] = 0;
  _$jscoverage['/editor/range.js'].lineData[831] = 0;
  _$jscoverage['/editor/range.js'].lineData[832] = 0;
  _$jscoverage['/editor/range.js'].lineData[834] = 0;
  _$jscoverage['/editor/range.js'].lineData[835] = 0;
  _$jscoverage['/editor/range.js'].lineData[837] = 0;
  _$jscoverage['/editor/range.js'].lineData[842] = 0;
  _$jscoverage['/editor/range.js'].lineData[843] = 0;
  _$jscoverage['/editor/range.js'].lineData[844] = 0;
  _$jscoverage['/editor/range.js'].lineData[845] = 0;
  _$jscoverage['/editor/range.js'].lineData[849] = 0;
  _$jscoverage['/editor/range.js'].lineData[850] = 0;
  _$jscoverage['/editor/range.js'].lineData[851] = 0;
  _$jscoverage['/editor/range.js'].lineData[852] = 0;
  _$jscoverage['/editor/range.js'].lineData[853] = 0;
  _$jscoverage['/editor/range.js'].lineData[857] = 0;
  _$jscoverage['/editor/range.js'].lineData[867] = 0;
  _$jscoverage['/editor/range.js'].lineData[877] = 0;
  _$jscoverage['/editor/range.js'].lineData[878] = 0;
  _$jscoverage['/editor/range.js'].lineData[884] = 0;
  _$jscoverage['/editor/range.js'].lineData[887] = 0;
  _$jscoverage['/editor/range.js'].lineData[888] = 0;
  _$jscoverage['/editor/range.js'].lineData[892] = 0;
  _$jscoverage['/editor/range.js'].lineData[894] = 0;
  _$jscoverage['/editor/range.js'].lineData[895] = 0;
  _$jscoverage['/editor/range.js'].lineData[901] = 0;
  _$jscoverage['/editor/range.js'].lineData[904] = 0;
  _$jscoverage['/editor/range.js'].lineData[905] = 0;
  _$jscoverage['/editor/range.js'].lineData[909] = 0;
  _$jscoverage['/editor/range.js'].lineData[912] = 0;
  _$jscoverage['/editor/range.js'].lineData[913] = 0;
  _$jscoverage['/editor/range.js'].lineData[917] = 0;
  _$jscoverage['/editor/range.js'].lineData[920] = 0;
  _$jscoverage['/editor/range.js'].lineData[921] = 0;
  _$jscoverage['/editor/range.js'].lineData[926] = 0;
  _$jscoverage['/editor/range.js'].lineData[929] = 0;
  _$jscoverage['/editor/range.js'].lineData[930] = 0;
  _$jscoverage['/editor/range.js'].lineData[935] = 0;
  _$jscoverage['/editor/range.js'].lineData[949] = 0;
  _$jscoverage['/editor/range.js'].lineData[955] = 0;
  _$jscoverage['/editor/range.js'].lineData[956] = 0;
  _$jscoverage['/editor/range.js'].lineData[957] = 0;
  _$jscoverage['/editor/range.js'].lineData[961] = 0;
  _$jscoverage['/editor/range.js'].lineData[963] = 0;
  _$jscoverage['/editor/range.js'].lineData[964] = 0;
  _$jscoverage['/editor/range.js'].lineData[965] = 0;
  _$jscoverage['/editor/range.js'].lineData[969] = 0;
  _$jscoverage['/editor/range.js'].lineData[970] = 0;
  _$jscoverage['/editor/range.js'].lineData[971] = 0;
  _$jscoverage['/editor/range.js'].lineData[973] = 0;
  _$jscoverage['/editor/range.js'].lineData[974] = 0;
  _$jscoverage['/editor/range.js'].lineData[977] = 0;
  _$jscoverage['/editor/range.js'].lineData[978] = 0;
  _$jscoverage['/editor/range.js'].lineData[979] = 0;
  _$jscoverage['/editor/range.js'].lineData[982] = 0;
  _$jscoverage['/editor/range.js'].lineData[983] = 0;
  _$jscoverage['/editor/range.js'].lineData[984] = 0;
  _$jscoverage['/editor/range.js'].lineData[987] = 0;
  _$jscoverage['/editor/range.js'].lineData[988] = 0;
  _$jscoverage['/editor/range.js'].lineData[989] = 0;
  _$jscoverage['/editor/range.js'].lineData[991] = 0;
  _$jscoverage['/editor/range.js'].lineData[994] = 0;
  _$jscoverage['/editor/range.js'].lineData[1008] = 0;
  _$jscoverage['/editor/range.js'].lineData[1009] = 0;
  _$jscoverage['/editor/range.js'].lineData[1010] = 0;
  _$jscoverage['/editor/range.js'].lineData[1019] = 0;
  _$jscoverage['/editor/range.js'].lineData[1024] = 0;
  _$jscoverage['/editor/range.js'].lineData[1029] = 0;
  _$jscoverage['/editor/range.js'].lineData[1030] = 0;
  _$jscoverage['/editor/range.js'].lineData[1031] = 0;
  _$jscoverage['/editor/range.js'].lineData[1032] = 0;
  _$jscoverage['/editor/range.js'].lineData[1035] = 0;
  _$jscoverage['/editor/range.js'].lineData[1036] = 0;
  _$jscoverage['/editor/range.js'].lineData[1040] = 0;
  _$jscoverage['/editor/range.js'].lineData[1042] = 0;
  _$jscoverage['/editor/range.js'].lineData[1043] = 0;
  _$jscoverage['/editor/range.js'].lineData[1046] = 0;
  _$jscoverage['/editor/range.js'].lineData[1047] = 0;
  _$jscoverage['/editor/range.js'].lineData[1048] = 0;
  _$jscoverage['/editor/range.js'].lineData[1049] = 0;
  _$jscoverage['/editor/range.js'].lineData[1053] = 0;
  _$jscoverage['/editor/range.js'].lineData[1055] = 0;
  _$jscoverage['/editor/range.js'].lineData[1056] = 0;
  _$jscoverage['/editor/range.js'].lineData[1057] = 0;
  _$jscoverage['/editor/range.js'].lineData[1061] = 0;
  _$jscoverage['/editor/range.js'].lineData[1064] = 0;
  _$jscoverage['/editor/range.js'].lineData[1068] = 0;
  _$jscoverage['/editor/range.js'].lineData[1069] = 0;
  _$jscoverage['/editor/range.js'].lineData[1070] = 0;
  _$jscoverage['/editor/range.js'].lineData[1071] = 0;
  _$jscoverage['/editor/range.js'].lineData[1074] = 0;
  _$jscoverage['/editor/range.js'].lineData[1075] = 0;
  _$jscoverage['/editor/range.js'].lineData[1079] = 0;
  _$jscoverage['/editor/range.js'].lineData[1081] = 0;
  _$jscoverage['/editor/range.js'].lineData[1082] = 0;
  _$jscoverage['/editor/range.js'].lineData[1085] = 0;
  _$jscoverage['/editor/range.js'].lineData[1093] = 0;
  _$jscoverage['/editor/range.js'].lineData[1094] = 0;
  _$jscoverage['/editor/range.js'].lineData[1095] = 0;
  _$jscoverage['/editor/range.js'].lineData[1096] = 0;
  _$jscoverage['/editor/range.js'].lineData[1100] = 0;
  _$jscoverage['/editor/range.js'].lineData[1102] = 0;
  _$jscoverage['/editor/range.js'].lineData[1103] = 0;
  _$jscoverage['/editor/range.js'].lineData[1106] = 0;
  _$jscoverage['/editor/range.js'].lineData[1114] = 0;
  _$jscoverage['/editor/range.js'].lineData[1116] = 0;
  _$jscoverage['/editor/range.js'].lineData[1118] = 0;
  _$jscoverage['/editor/range.js'].lineData[1124] = 0;
  _$jscoverage['/editor/range.js'].lineData[1127] = 0;
  _$jscoverage['/editor/range.js'].lineData[1128] = 0;
  _$jscoverage['/editor/range.js'].lineData[1130] = 0;
  _$jscoverage['/editor/range.js'].lineData[1134] = 0;
  _$jscoverage['/editor/range.js'].lineData[1141] = 0;
  _$jscoverage['/editor/range.js'].lineData[1144] = 0;
  _$jscoverage['/editor/range.js'].lineData[1148] = 0;
  _$jscoverage['/editor/range.js'].lineData[1149] = 0;
  _$jscoverage['/editor/range.js'].lineData[1150] = 0;
  _$jscoverage['/editor/range.js'].lineData[1152] = 0;
  _$jscoverage['/editor/range.js'].lineData[1163] = 0;
  _$jscoverage['/editor/range.js'].lineData[1168] = 0;
  _$jscoverage['/editor/range.js'].lineData[1169] = 0;
  _$jscoverage['/editor/range.js'].lineData[1172] = 0;
  _$jscoverage['/editor/range.js'].lineData[1174] = 0;
  _$jscoverage['/editor/range.js'].lineData[1177] = 0;
  _$jscoverage['/editor/range.js'].lineData[1180] = 0;
  _$jscoverage['/editor/range.js'].lineData[1193] = 0;
  _$jscoverage['/editor/range.js'].lineData[1194] = 0;
  _$jscoverage['/editor/range.js'].lineData[1202] = 0;
  _$jscoverage['/editor/range.js'].lineData[1203] = 0;
  _$jscoverage['/editor/range.js'].lineData[1205] = 0;
  _$jscoverage['/editor/range.js'].lineData[1206] = 0;
  _$jscoverage['/editor/range.js'].lineData[1209] = 0;
  _$jscoverage['/editor/range.js'].lineData[1210] = 0;
  _$jscoverage['/editor/range.js'].lineData[1215] = 0;
  _$jscoverage['/editor/range.js'].lineData[1217] = 0;
  _$jscoverage['/editor/range.js'].lineData[1220] = 0;
  _$jscoverage['/editor/range.js'].lineData[1222] = 0;
  _$jscoverage['/editor/range.js'].lineData[1225] = 0;
  _$jscoverage['/editor/range.js'].lineData[1227] = 0;
  _$jscoverage['/editor/range.js'].lineData[1228] = 0;
  _$jscoverage['/editor/range.js'].lineData[1229] = 0;
  _$jscoverage['/editor/range.js'].lineData[1231] = 0;
  _$jscoverage['/editor/range.js'].lineData[1236] = 0;
  _$jscoverage['/editor/range.js'].lineData[1238] = 0;
  _$jscoverage['/editor/range.js'].lineData[1240] = 0;
  _$jscoverage['/editor/range.js'].lineData[1242] = 0;
  _$jscoverage['/editor/range.js'].lineData[1249] = 0;
  _$jscoverage['/editor/range.js'].lineData[1251] = 0;
  _$jscoverage['/editor/range.js'].lineData[1252] = 0;
  _$jscoverage['/editor/range.js'].lineData[1255] = 0;
  _$jscoverage['/editor/range.js'].lineData[1256] = 0;
  _$jscoverage['/editor/range.js'].lineData[1257] = 0;
  _$jscoverage['/editor/range.js'].lineData[1260] = 0;
  _$jscoverage['/editor/range.js'].lineData[1263] = 0;
  _$jscoverage['/editor/range.js'].lineData[1264] = 0;
  _$jscoverage['/editor/range.js'].lineData[1269] = 0;
  _$jscoverage['/editor/range.js'].lineData[1270] = 0;
  _$jscoverage['/editor/range.js'].lineData[1271] = 0;
  _$jscoverage['/editor/range.js'].lineData[1274] = 0;
  _$jscoverage['/editor/range.js'].lineData[1275] = 0;
  _$jscoverage['/editor/range.js'].lineData[1278] = 0;
  _$jscoverage['/editor/range.js'].lineData[1281] = 0;
  _$jscoverage['/editor/range.js'].lineData[1282] = 0;
  _$jscoverage['/editor/range.js'].lineData[1284] = 0;
  _$jscoverage['/editor/range.js'].lineData[1285] = 0;
  _$jscoverage['/editor/range.js'].lineData[1286] = 0;
  _$jscoverage['/editor/range.js'].lineData[1287] = 0;
  _$jscoverage['/editor/range.js'].lineData[1290] = 0;
  _$jscoverage['/editor/range.js'].lineData[1296] = 0;
  _$jscoverage['/editor/range.js'].lineData[1297] = 0;
  _$jscoverage['/editor/range.js'].lineData[1299] = 0;
  _$jscoverage['/editor/range.js'].lineData[1300] = 0;
  _$jscoverage['/editor/range.js'].lineData[1302] = 0;
  _$jscoverage['/editor/range.js'].lineData[1310] = 0;
  _$jscoverage['/editor/range.js'].lineData[1311] = 0;
  _$jscoverage['/editor/range.js'].lineData[1312] = 0;
  _$jscoverage['/editor/range.js'].lineData[1314] = 0;
  _$jscoverage['/editor/range.js'].lineData[1318] = 0;
  _$jscoverage['/editor/range.js'].lineData[1319] = 0;
  _$jscoverage['/editor/range.js'].lineData[1320] = 0;
  _$jscoverage['/editor/range.js'].lineData[1322] = 0;
  _$jscoverage['/editor/range.js'].lineData[1325] = 0;
  _$jscoverage['/editor/range.js'].lineData[1327] = 0;
  _$jscoverage['/editor/range.js'].lineData[1330] = 0;
  _$jscoverage['/editor/range.js'].lineData[1334] = 0;
  _$jscoverage['/editor/range.js'].lineData[1349] = 0;
  _$jscoverage['/editor/range.js'].lineData[1350] = 0;
  _$jscoverage['/editor/range.js'].lineData[1351] = 0;
  _$jscoverage['/editor/range.js'].lineData[1352] = 0;
  _$jscoverage['/editor/range.js'].lineData[1355] = 0;
  _$jscoverage['/editor/range.js'].lineData[1357] = 0;
  _$jscoverage['/editor/range.js'].lineData[1360] = 0;
  _$jscoverage['/editor/range.js'].lineData[1363] = 0;
  _$jscoverage['/editor/range.js'].lineData[1367] = 0;
  _$jscoverage['/editor/range.js'].lineData[1374] = 0;
  _$jscoverage['/editor/range.js'].lineData[1375] = 0;
  _$jscoverage['/editor/range.js'].lineData[1386] = 0;
  _$jscoverage['/editor/range.js'].lineData[1392] = 0;
  _$jscoverage['/editor/range.js'].lineData[1393] = 0;
  _$jscoverage['/editor/range.js'].lineData[1394] = 0;
  _$jscoverage['/editor/range.js'].lineData[1395] = 0;
  _$jscoverage['/editor/range.js'].lineData[1402] = 0;
  _$jscoverage['/editor/range.js'].lineData[1406] = 0;
  _$jscoverage['/editor/range.js'].lineData[1409] = 0;
  _$jscoverage['/editor/range.js'].lineData[1410] = 0;
  _$jscoverage['/editor/range.js'].lineData[1411] = 0;
  _$jscoverage['/editor/range.js'].lineData[1413] = 0;
  _$jscoverage['/editor/range.js'].lineData[1414] = 0;
  _$jscoverage['/editor/range.js'].lineData[1416] = 0;
  _$jscoverage['/editor/range.js'].lineData[1424] = 0;
  _$jscoverage['/editor/range.js'].lineData[1429] = 0;
  _$jscoverage['/editor/range.js'].lineData[1430] = 0;
  _$jscoverage['/editor/range.js'].lineData[1431] = 0;
  _$jscoverage['/editor/range.js'].lineData[1432] = 0;
  _$jscoverage['/editor/range.js'].lineData[1439] = 0;
  _$jscoverage['/editor/range.js'].lineData[1443] = 0;
  _$jscoverage['/editor/range.js'].lineData[1446] = 0;
  _$jscoverage['/editor/range.js'].lineData[1447] = 0;
  _$jscoverage['/editor/range.js'].lineData[1448] = 0;
  _$jscoverage['/editor/range.js'].lineData[1450] = 0;
  _$jscoverage['/editor/range.js'].lineData[1451] = 0;
  _$jscoverage['/editor/range.js'].lineData[1453] = 0;
  _$jscoverage['/editor/range.js'].lineData[1462] = 0;
  _$jscoverage['/editor/range.js'].lineData[1466] = 0;
  _$jscoverage['/editor/range.js'].lineData[1470] = 0;
  _$jscoverage['/editor/range.js'].lineData[1472] = 0;
  _$jscoverage['/editor/range.js'].lineData[1473] = 0;
  _$jscoverage['/editor/range.js'].lineData[1482] = 0;
  _$jscoverage['/editor/range.js'].lineData[1489] = 0;
  _$jscoverage['/editor/range.js'].lineData[1490] = 0;
  _$jscoverage['/editor/range.js'].lineData[1491] = 0;
  _$jscoverage['/editor/range.js'].lineData[1492] = 0;
  _$jscoverage['/editor/range.js'].lineData[1493] = 0;
  _$jscoverage['/editor/range.js'].lineData[1495] = 0;
  _$jscoverage['/editor/range.js'].lineData[1499] = 0;
  _$jscoverage['/editor/range.js'].lineData[1500] = 0;
  _$jscoverage['/editor/range.js'].lineData[1501] = 0;
  _$jscoverage['/editor/range.js'].lineData[1504] = 0;
  _$jscoverage['/editor/range.js'].lineData[1509] = 0;
  _$jscoverage['/editor/range.js'].lineData[1513] = 0;
  _$jscoverage['/editor/range.js'].lineData[1514] = 0;
  _$jscoverage['/editor/range.js'].lineData[1515] = 0;
  _$jscoverage['/editor/range.js'].lineData[1516] = 0;
  _$jscoverage['/editor/range.js'].lineData[1519] = 0;
  _$jscoverage['/editor/range.js'].lineData[1520] = 0;
  _$jscoverage['/editor/range.js'].lineData[1524] = 0;
  _$jscoverage['/editor/range.js'].lineData[1525] = 0;
  _$jscoverage['/editor/range.js'].lineData[1526] = 0;
  _$jscoverage['/editor/range.js'].lineData[1528] = 0;
  _$jscoverage['/editor/range.js'].lineData[1534] = 0;
  _$jscoverage['/editor/range.js'].lineData[1535] = 0;
  _$jscoverage['/editor/range.js'].lineData[1538] = 0;
  _$jscoverage['/editor/range.js'].lineData[1552] = 0;
  _$jscoverage['/editor/range.js'].lineData[1555] = 0;
  _$jscoverage['/editor/range.js'].lineData[1556] = 0;
  _$jscoverage['/editor/range.js'].lineData[1557] = 0;
  _$jscoverage['/editor/range.js'].lineData[1558] = 0;
  _$jscoverage['/editor/range.js'].lineData[1559] = 0;
  _$jscoverage['/editor/range.js'].lineData[1560] = 0;
  _$jscoverage['/editor/range.js'].lineData[1562] = 0;
  _$jscoverage['/editor/range.js'].lineData[1563] = 0;
  _$jscoverage['/editor/range.js'].lineData[1564] = 0;
  _$jscoverage['/editor/range.js'].lineData[1573] = 0;
  _$jscoverage['/editor/range.js'].lineData[1583] = 0;
  _$jscoverage['/editor/range.js'].lineData[1584] = 0;
  _$jscoverage['/editor/range.js'].lineData[1588] = 0;
  _$jscoverage['/editor/range.js'].lineData[1589] = 0;
  _$jscoverage['/editor/range.js'].lineData[1590] = 0;
  _$jscoverage['/editor/range.js'].lineData[1591] = 0;
  _$jscoverage['/editor/range.js'].lineData[1594] = 0;
  _$jscoverage['/editor/range.js'].lineData[1595] = 0;
  _$jscoverage['/editor/range.js'].lineData[1600] = 0;
  _$jscoverage['/editor/range.js'].lineData[1604] = 0;
  _$jscoverage['/editor/range.js'].lineData[1606] = 0;
  _$jscoverage['/editor/range.js'].lineData[1607] = 0;
  _$jscoverage['/editor/range.js'].lineData[1608] = 0;
  _$jscoverage['/editor/range.js'].lineData[1609] = 0;
  _$jscoverage['/editor/range.js'].lineData[1610] = 0;
  _$jscoverage['/editor/range.js'].lineData[1611] = 0;
  _$jscoverage['/editor/range.js'].lineData[1612] = 0;
  _$jscoverage['/editor/range.js'].lineData[1613] = 0;
  _$jscoverage['/editor/range.js'].lineData[1614] = 0;
  _$jscoverage['/editor/range.js'].lineData[1616] = 0;
  _$jscoverage['/editor/range.js'].lineData[1620] = 0;
  _$jscoverage['/editor/range.js'].lineData[1621] = 0;
  _$jscoverage['/editor/range.js'].lineData[1626] = 0;
  _$jscoverage['/editor/range.js'].lineData[1641] = 0;
  _$jscoverage['/editor/range.js'].lineData[1642] = 0;
  _$jscoverage['/editor/range.js'].lineData[1643] = 0;
  _$jscoverage['/editor/range.js'].lineData[1648] = 0;
  _$jscoverage['/editor/range.js'].lineData[1649] = 0;
  _$jscoverage['/editor/range.js'].lineData[1654] = 0;
  _$jscoverage['/editor/range.js'].lineData[1656] = 0;
  _$jscoverage['/editor/range.js'].lineData[1657] = 0;
  _$jscoverage['/editor/range.js'].lineData[1658] = 0;
  _$jscoverage['/editor/range.js'].lineData[1670] = 0;
  _$jscoverage['/editor/range.js'].lineData[1671] = 0;
  _$jscoverage['/editor/range.js'].lineData[1673] = 0;
  _$jscoverage['/editor/range.js'].lineData[1675] = 0;
  _$jscoverage['/editor/range.js'].lineData[1678] = 0;
  _$jscoverage['/editor/range.js'].lineData[1679] = 0;
  _$jscoverage['/editor/range.js'].lineData[1682] = 0;
  _$jscoverage['/editor/range.js'].lineData[1685] = 0;
  _$jscoverage['/editor/range.js'].lineData[1687] = 0;
  _$jscoverage['/editor/range.js'].lineData[1689] = 0;
  _$jscoverage['/editor/range.js'].lineData[1690] = 0;
  _$jscoverage['/editor/range.js'].lineData[1693] = 0;
  _$jscoverage['/editor/range.js'].lineData[1694] = 0;
  _$jscoverage['/editor/range.js'].lineData[1698] = 0;
  _$jscoverage['/editor/range.js'].lineData[1699] = 0;
  _$jscoverage['/editor/range.js'].lineData[1702] = 0;
  _$jscoverage['/editor/range.js'].lineData[1705] = 0;
  _$jscoverage['/editor/range.js'].lineData[1708] = 0;
  _$jscoverage['/editor/range.js'].lineData[1716] = 0;
  _$jscoverage['/editor/range.js'].lineData[1717] = 0;
  _$jscoverage['/editor/range.js'].lineData[1718] = 0;
  _$jscoverage['/editor/range.js'].lineData[1728] = 0;
  _$jscoverage['/editor/range.js'].lineData[1734] = 0;
  _$jscoverage['/editor/range.js'].lineData[1735] = 0;
  _$jscoverage['/editor/range.js'].lineData[1736] = 0;
  _$jscoverage['/editor/range.js'].lineData[1737] = 0;
  _$jscoverage['/editor/range.js'].lineData[1738] = 0;
  _$jscoverage['/editor/range.js'].lineData[1741] = 0;
  _$jscoverage['/editor/range.js'].lineData[1742] = 0;
  _$jscoverage['/editor/range.js'].lineData[1743] = 0;
  _$jscoverage['/editor/range.js'].lineData[1744] = 0;
  _$jscoverage['/editor/range.js'].lineData[1746] = 0;
  _$jscoverage['/editor/range.js'].lineData[1748] = 0;
  _$jscoverage['/editor/range.js'].lineData[1751] = 0;
  _$jscoverage['/editor/range.js'].lineData[1752] = 0;
  _$jscoverage['/editor/range.js'].lineData[1756] = 0;
  _$jscoverage['/editor/range.js'].lineData[1760] = 0;
  _$jscoverage['/editor/range.js'].lineData[1762] = 0;
  _$jscoverage['/editor/range.js'].lineData[1763] = 0;
  _$jscoverage['/editor/range.js'].lineData[1765] = 0;
  _$jscoverage['/editor/range.js'].lineData[1771] = 0;
  _$jscoverage['/editor/range.js'].lineData[1772] = 0;
  _$jscoverage['/editor/range.js'].lineData[1775] = 0;
  _$jscoverage['/editor/range.js'].lineData[1778] = 0;
  _$jscoverage['/editor/range.js'].lineData[1781] = 0;
  _$jscoverage['/editor/range.js'].lineData[1785] = 0;
  _$jscoverage['/editor/range.js'].lineData[1787] = 0;
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
  _$jscoverage['/editor/range.js'].branchData['101'] = [];
  _$jscoverage['/editor/range.js'].branchData['101'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['101'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['104'] = [];
  _$jscoverage['/editor/range.js'].branchData['104'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['104'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['107'] = [];
  _$jscoverage['/editor/range.js'].branchData['107'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['107'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['112'] = [];
  _$jscoverage['/editor/range.js'].branchData['112'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['119'] = [];
  _$jscoverage['/editor/range.js'].branchData['119'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['123'] = [];
  _$jscoverage['/editor/range.js'].branchData['123'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['125'] = [];
  _$jscoverage['/editor/range.js'].branchData['125'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['128'] = [];
  _$jscoverage['/editor/range.js'].branchData['128'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['132'] = [];
  _$jscoverage['/editor/range.js'].branchData['132'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['135'] = [];
  _$jscoverage['/editor/range.js'].branchData['135'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['135'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['135'][3] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['135'][4] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['165'] = [];
  _$jscoverage['/editor/range.js'].branchData['165'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['169'] = [];
  _$jscoverage['/editor/range.js'].branchData['169'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['181'] = [];
  _$jscoverage['/editor/range.js'].branchData['181'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['187'] = [];
  _$jscoverage['/editor/range.js'].branchData['187'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['189'] = [];
  _$jscoverage['/editor/range.js'].branchData['189'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['203'] = [];
  _$jscoverage['/editor/range.js'].branchData['203'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['212'] = [];
  _$jscoverage['/editor/range.js'].branchData['212'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['218'] = [];
  _$jscoverage['/editor/range.js'].branchData['218'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['244'] = [];
  _$jscoverage['/editor/range.js'].branchData['244'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['252'] = [];
  _$jscoverage['/editor/range.js'].branchData['252'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['265'] = [];
  _$jscoverage['/editor/range.js'].branchData['265'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['269'] = [];
  _$jscoverage['/editor/range.js'].branchData['269'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['269'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['281'] = [];
  _$jscoverage['/editor/range.js'].branchData['281'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['286'] = [];
  _$jscoverage['/editor/range.js'].branchData['286'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['286'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['286'][3] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['294'] = [];
  _$jscoverage['/editor/range.js'].branchData['294'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['301'] = [];
  _$jscoverage['/editor/range.js'].branchData['301'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['311'] = [];
  _$jscoverage['/editor/range.js'].branchData['311'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['320'] = [];
  _$jscoverage['/editor/range.js'].branchData['320'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['329'] = [];
  _$jscoverage['/editor/range.js'].branchData['329'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['333'] = [];
  _$jscoverage['/editor/range.js'].branchData['333'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['333'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['342'] = [];
  _$jscoverage['/editor/range.js'].branchData['342'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['351'] = [];
  _$jscoverage['/editor/range.js'].branchData['351'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['359'] = [];
  _$jscoverage['/editor/range.js'].branchData['359'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['369'] = [];
  _$jscoverage['/editor/range.js'].branchData['369'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['374'] = [];
  _$jscoverage['/editor/range.js'].branchData['374'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['378'] = [];
  _$jscoverage['/editor/range.js'].branchData['378'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['380'] = [];
  _$jscoverage['/editor/range.js'].branchData['380'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['380'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['380'][3] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['382'] = [];
  _$jscoverage['/editor/range.js'].branchData['382'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['388'] = [];
  _$jscoverage['/editor/range.js'].branchData['388'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['390'] = [];
  _$jscoverage['/editor/range.js'].branchData['390'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['390'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['391'] = [];
  _$jscoverage['/editor/range.js'].branchData['391'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['392'] = [];
  _$jscoverage['/editor/range.js'].branchData['392'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['404'] = [];
  _$jscoverage['/editor/range.js'].branchData['404'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['404'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['405'] = [];
  _$jscoverage['/editor/range.js'].branchData['405'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['410'] = [];
  _$jscoverage['/editor/range.js'].branchData['410'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['425'] = [];
  _$jscoverage['/editor/range.js'].branchData['425'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['429'] = [];
  _$jscoverage['/editor/range.js'].branchData['429'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['437'] = [];
  _$jscoverage['/editor/range.js'].branchData['437'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['438'] = [];
  _$jscoverage['/editor/range.js'].branchData['438'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['439'] = [];
  _$jscoverage['/editor/range.js'].branchData['439'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['439'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['440'] = [];
  _$jscoverage['/editor/range.js'].branchData['440'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['467'] = [];
  _$jscoverage['/editor/range.js'].branchData['467'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['468'] = [];
  _$jscoverage['/editor/range.js'].branchData['468'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['483'] = [];
  _$jscoverage['/editor/range.js'].branchData['483'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['484'] = [];
  _$jscoverage['/editor/range.js'].branchData['484'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['486'] = [];
  _$jscoverage['/editor/range.js'].branchData['486'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['494'] = [];
  _$jscoverage['/editor/range.js'].branchData['494'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['495'] = [];
  _$jscoverage['/editor/range.js'].branchData['495'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['497'] = [];
  _$jscoverage['/editor/range.js'].branchData['497'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['540'] = [];
  _$jscoverage['/editor/range.js'].branchData['540'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['541'] = [];
  _$jscoverage['/editor/range.js'].branchData['541'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['541'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['545'] = [];
  _$jscoverage['/editor/range.js'].branchData['545'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['546'] = [];
  _$jscoverage['/editor/range.js'].branchData['546'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['546'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['567'] = [];
  _$jscoverage['/editor/range.js'].branchData['567'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['567'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['575'] = [];
  _$jscoverage['/editor/range.js'].branchData['575'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['598'] = [];
  _$jscoverage['/editor/range.js'].branchData['598'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['598'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['606'] = [];
  _$jscoverage['/editor/range.js'].branchData['606'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['627'] = [];
  _$jscoverage['/editor/range.js'].branchData['627'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['658'] = [];
  _$jscoverage['/editor/range.js'].branchData['658'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['703'] = [];
  _$jscoverage['/editor/range.js'].branchData['703'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['744'] = [];
  _$jscoverage['/editor/range.js'].branchData['744'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['744'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['745'] = [];
  _$jscoverage['/editor/range.js'].branchData['745'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['753'] = [];
  _$jscoverage['/editor/range.js'].branchData['753'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['764'] = [];
  _$jscoverage['/editor/range.js'].branchData['764'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['775'] = [];
  _$jscoverage['/editor/range.js'].branchData['775'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['776'] = [];
  _$jscoverage['/editor/range.js'].branchData['776'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['789'] = [];
  _$jscoverage['/editor/range.js'].branchData['789'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['790'] = [];
  _$jscoverage['/editor/range.js'].branchData['790'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['791'] = [];
  _$jscoverage['/editor/range.js'].branchData['791'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['793'] = [];
  _$jscoverage['/editor/range.js'].branchData['793'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['803'] = [];
  _$jscoverage['/editor/range.js'].branchData['803'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['804'] = [];
  _$jscoverage['/editor/range.js'].branchData['804'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['805'] = [];
  _$jscoverage['/editor/range.js'].branchData['805'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['807'] = [];
  _$jscoverage['/editor/range.js'].branchData['807'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['815'] = [];
  _$jscoverage['/editor/range.js'].branchData['815'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['820'] = [];
  _$jscoverage['/editor/range.js'].branchData['820'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['820'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['826'] = [];
  _$jscoverage['/editor/range.js'].branchData['826'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['826'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['827'] = [];
  _$jscoverage['/editor/range.js'].branchData['827'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['831'] = [];
  _$jscoverage['/editor/range.js'].branchData['831'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['831'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['834'] = [];
  _$jscoverage['/editor/range.js'].branchData['834'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['834'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['842'] = [];
  _$jscoverage['/editor/range.js'].branchData['842'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['843'] = [];
  _$jscoverage['/editor/range.js'].branchData['843'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['844'] = [];
  _$jscoverage['/editor/range.js'].branchData['844'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['849'] = [];
  _$jscoverage['/editor/range.js'].branchData['849'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['851'] = [];
  _$jscoverage['/editor/range.js'].branchData['851'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['852'] = [];
  _$jscoverage['/editor/range.js'].branchData['852'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['857'] = [];
  _$jscoverage['/editor/range.js'].branchData['857'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['877'] = [];
  _$jscoverage['/editor/range.js'].branchData['877'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['884'] = [];
  _$jscoverage['/editor/range.js'].branchData['884'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['887'] = [];
  _$jscoverage['/editor/range.js'].branchData['887'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['892'] = [];
  _$jscoverage['/editor/range.js'].branchData['892'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['892'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['892'][3] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['892'][4] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['893'] = [];
  _$jscoverage['/editor/range.js'].branchData['893'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['893'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['893'][3] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['901'] = [];
  _$jscoverage['/editor/range.js'].branchData['901'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['901'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['902'] = [];
  _$jscoverage['/editor/range.js'].branchData['902'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['903'] = [];
  _$jscoverage['/editor/range.js'].branchData['903'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['909'] = [];
  _$jscoverage['/editor/range.js'].branchData['909'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['912'] = [];
  _$jscoverage['/editor/range.js'].branchData['912'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['917'] = [];
  _$jscoverage['/editor/range.js'].branchData['917'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['917'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['918'] = [];
  _$jscoverage['/editor/range.js'].branchData['918'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['918'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['918'][3] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['918'][4] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['919'] = [];
  _$jscoverage['/editor/range.js'].branchData['919'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['926'] = [];
  _$jscoverage['/editor/range.js'].branchData['926'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['926'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['927'] = [];
  _$jscoverage['/editor/range.js'].branchData['927'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['928'] = [];
  _$jscoverage['/editor/range.js'].branchData['928'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['963'] = [];
  _$jscoverage['/editor/range.js'].branchData['963'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['969'] = [];
  _$jscoverage['/editor/range.js'].branchData['969'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['973'] = [];
  _$jscoverage['/editor/range.js'].branchData['973'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['987'] = [];
  _$jscoverage['/editor/range.js'].branchData['987'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1024'] = [];
  _$jscoverage['/editor/range.js'].branchData['1024'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1024'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1025'] = [];
  _$jscoverage['/editor/range.js'].branchData['1025'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1026'] = [];
  _$jscoverage['/editor/range.js'].branchData['1026'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1029'] = [];
  _$jscoverage['/editor/range.js'].branchData['1029'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1032'] = [];
  _$jscoverage['/editor/range.js'].branchData['1032'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1046'] = [];
  _$jscoverage['/editor/range.js'].branchData['1046'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1048'] = [];
  _$jscoverage['/editor/range.js'].branchData['1048'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1055'] = [];
  _$jscoverage['/editor/range.js'].branchData['1055'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1064'] = [];
  _$jscoverage['/editor/range.js'].branchData['1064'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1064'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1065'] = [];
  _$jscoverage['/editor/range.js'].branchData['1065'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1065'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1068'] = [];
  _$jscoverage['/editor/range.js'].branchData['1068'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1071'] = [];
  _$jscoverage['/editor/range.js'].branchData['1071'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1098'] = [];
  _$jscoverage['/editor/range.js'].branchData['1098'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1102'] = [];
  _$jscoverage['/editor/range.js'].branchData['1102'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1116'] = [];
  _$jscoverage['/editor/range.js'].branchData['1116'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1120'] = [];
  _$jscoverage['/editor/range.js'].branchData['1120'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1127'] = [];
  _$jscoverage['/editor/range.js'].branchData['1127'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1148'] = [];
  _$jscoverage['/editor/range.js'].branchData['1148'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1168'] = [];
  _$jscoverage['/editor/range.js'].branchData['1168'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1169'] = [];
  _$jscoverage['/editor/range.js'].branchData['1169'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1170'] = [];
  _$jscoverage['/editor/range.js'].branchData['1170'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1170'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1171'] = [];
  _$jscoverage['/editor/range.js'].branchData['1171'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1180'] = [];
  _$jscoverage['/editor/range.js'].branchData['1180'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1180'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1202'] = [];
  _$jscoverage['/editor/range.js'].branchData['1202'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1203'] = [];
  _$jscoverage['/editor/range.js'].branchData['1203'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1205'] = [];
  _$jscoverage['/editor/range.js'].branchData['1205'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1209'] = [];
  _$jscoverage['/editor/range.js'].branchData['1209'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1220'] = [];
  _$jscoverage['/editor/range.js'].branchData['1220'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1228'] = [];
  _$jscoverage['/editor/range.js'].branchData['1228'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1236'] = [];
  _$jscoverage['/editor/range.js'].branchData['1236'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1238'] = [];
  _$jscoverage['/editor/range.js'].branchData['1238'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1251'] = [];
  _$jscoverage['/editor/range.js'].branchData['1251'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1255'] = [];
  _$jscoverage['/editor/range.js'].branchData['1255'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1274'] = [];
  _$jscoverage['/editor/range.js'].branchData['1274'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1284'] = [];
  _$jscoverage['/editor/range.js'].branchData['1284'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1306'] = [];
  _$jscoverage['/editor/range.js'].branchData['1306'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1311'] = [];
  _$jscoverage['/editor/range.js'].branchData['1311'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1319'] = [];
  _$jscoverage['/editor/range.js'].branchData['1319'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1319'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1330'] = [];
  _$jscoverage['/editor/range.js'].branchData['1330'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1336'] = [];
  _$jscoverage['/editor/range.js'].branchData['1336'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1336'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1344'] = [];
  _$jscoverage['/editor/range.js'].branchData['1344'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1344'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1344'][3] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1355'] = [];
  _$jscoverage['/editor/range.js'].branchData['1355'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1363'] = [];
  _$jscoverage['/editor/range.js'].branchData['1363'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1369'] = [];
  _$jscoverage['/editor/range.js'].branchData['1369'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1369'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1369'][3] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1374'] = [];
  _$jscoverage['/editor/range.js'].branchData['1374'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1392'] = [];
  _$jscoverage['/editor/range.js'].branchData['1392'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1392'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1394'] = [];
  _$jscoverage['/editor/range.js'].branchData['1394'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1411'] = [];
  _$jscoverage['/editor/range.js'].branchData['1411'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1429'] = [];
  _$jscoverage['/editor/range.js'].branchData['1429'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1431'] = [];
  _$jscoverage['/editor/range.js'].branchData['1431'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1448'] = [];
  _$jscoverage['/editor/range.js'].branchData['1448'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1464'] = [];
  _$jscoverage['/editor/range.js'].branchData['1464'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1466'] = [];
  _$jscoverage['/editor/range.js'].branchData['1466'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1473'] = [];
  _$jscoverage['/editor/range.js'].branchData['1473'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1489'] = [];
  _$jscoverage['/editor/range.js'].branchData['1489'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1491'] = [];
  _$jscoverage['/editor/range.js'].branchData['1491'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1493'] = [];
  _$jscoverage['/editor/range.js'].branchData['1493'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1509'] = [];
  _$jscoverage['/editor/range.js'].branchData['1509'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1513'] = [];
  _$jscoverage['/editor/range.js'].branchData['1513'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1515'] = [];
  _$jscoverage['/editor/range.js'].branchData['1515'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1519'] = [];
  _$jscoverage['/editor/range.js'].branchData['1519'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1534'] = [];
  _$jscoverage['/editor/range.js'].branchData['1534'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1559'] = [];
  _$jscoverage['/editor/range.js'].branchData['1559'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1583'] = [];
  _$jscoverage['/editor/range.js'].branchData['1583'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1588'] = [];
  _$jscoverage['/editor/range.js'].branchData['1588'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1589'] = [];
  _$jscoverage['/editor/range.js'].branchData['1589'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1594'] = [];
  _$jscoverage['/editor/range.js'].branchData['1594'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1600'] = [];
  _$jscoverage['/editor/range.js'].branchData['1600'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1601'] = [];
  _$jscoverage['/editor/range.js'].branchData['1601'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1606'] = [];
  _$jscoverage['/editor/range.js'].branchData['1606'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1606'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1607'] = [];
  _$jscoverage['/editor/range.js'].branchData['1607'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1611'] = [];
  _$jscoverage['/editor/range.js'].branchData['1611'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1620'] = [];
  _$jscoverage['/editor/range.js'].branchData['1620'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1642'] = [];
  _$jscoverage['/editor/range.js'].branchData['1642'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1673'] = [];
  _$jscoverage['/editor/range.js'].branchData['1673'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1673'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1678'] = [];
  _$jscoverage['/editor/range.js'].branchData['1678'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1689'] = [];
  _$jscoverage['/editor/range.js'].branchData['1689'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1698'] = [];
  _$jscoverage['/editor/range.js'].branchData['1698'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1698'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1718'] = [];
  _$jscoverage['/editor/range.js'].branchData['1718'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1735'] = [];
  _$jscoverage['/editor/range.js'].branchData['1735'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1737'] = [];
  _$jscoverage['/editor/range.js'].branchData['1737'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1737'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1741'] = [];
  _$jscoverage['/editor/range.js'].branchData['1741'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1751'] = [];
  _$jscoverage['/editor/range.js'].branchData['1751'][1] = new BranchData();
}
_$jscoverage['/editor/range.js'].branchData['1751'][1].init(776, 4, 'last');
function visit636_1751_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1751'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1741'][1].init(236, 50, 'self.checkStartOfBlock() && self.checkEndOfBlock()');
function visit635_1741_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1741'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1737'][2].init(131, 32, 'tmpDtd && tmpDtd[elementName]');
function visit634_1737_2(result) {
  _$jscoverage['/editor/range.js'].branchData['1737'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1737'][1].init(90, 74, '(tmpDtd = dtd[current.nodeName()]) && !(tmpDtd && tmpDtd[elementName])');
function visit633_1737_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1737'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1735'][1].init(263, 7, 'isBlock');
function visit632_1735_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1735'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1718'][1].init(118, 43, 'domNode.nodeType === Dom.NodeType.TEXT_NODE');
function visit631_1718_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1718'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1698'][2].init(493, 44, 'el[0].nodeType === Dom.NodeType.ELEMENT_NODE');
function visit630_1698_2(result) {
  _$jscoverage['/editor/range.js'].branchData['1698'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1698'][1].init(493, 66, 'el[0].nodeType === Dom.NodeType.ELEMENT_NODE && el._4eIsEditable()');
function visit629_1698_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1698'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1689'][1].init(87, 41, 'el[0].nodeType === Dom.NodeType.TEXT_NODE');
function visit628_1689_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1689'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1678'][1].init(286, 19, '!childOnly && !next');
function visit627_1678_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1678'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1673'][2].init(51, 46, 'node[0].nodeType === Dom.NodeType.ELEMENT_NODE');
function visit626_1673_2(result) {
  _$jscoverage['/editor/range.js'].branchData['1673'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1673'][1].init(51, 91, 'node[0].nodeType === Dom.NodeType.ELEMENT_NODE && node._4eIsEditable()');
function visit625_1673_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1673'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1642'][1].init(48, 15, '!self.collapsed');
function visit624_1642_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1642'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1620'][1].init(301, 60, '!UA.ie && !util.inArray(startBlock.nodeName(), [\'ul\', \'ol\'])');
function visit623_1620_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1620'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1611'][1].init(254, 14, 'isStartOfBlock');
function visit622_1611_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1611'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1607'][1].init(22, 12, 'isEndOfBlock');
function visit621_1607_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1607'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1606'][2].init(1291, 29, 'startBlock[0] === endBlock[0]');
function visit620_1606_2(result) {
  _$jscoverage['/editor/range.js'].branchData['1606'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1606'][1].init(1277, 43, 'startBlock && startBlock[0] === endBlock[0]');
function visit619_1606_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1606'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1601'][1].init(92, 34, 'endBlock && self.checkEndOfBlock()');
function visit618_1601_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1601'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1600'][1].init(1067, 38, 'startBlock && self.checkStartOfBlock()');
function visit617_1600_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1600'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1594'][1].init(218, 9, '!endBlock');
function visit616_1594_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1594'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1589'][1].init(22, 11, '!startBlock');
function visit615_1589_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1589'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1588'][1].init(642, 17, 'blockTag !== \'br\'');
function visit614_1588_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1588'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1583'][1].init(493, 38, '!startBlockLimit.equals(endBlockLimit)');
function visit613_1583_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1583'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1559'][1].init(362, 6, '!UA.ie');
function visit612_1559_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1559'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1534'][1].init(2408, 55, 'startNode._4ePosition(endNode) & KEP.POSITION_FOLLOWING');
function visit611_1534_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1534'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1519'][1].init(311, 16, 'childCount === 0');
function visit610_1519_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1519'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1515'][1].init(82, 22, 'childCount > endOffset');
function visit609_1515_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1515'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1513'][1].init(1396, 49, 'endNode[0].nodeType === Dom.NodeType.ELEMENT_NODE');
function visit608_1513_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1513'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1509'][1].init(612, 42, 'startNode._4eNextSourceNode() || startNode');
function visit607_1509_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1509'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1493'][1].init(215, 16, 'childCount === 0');
function visit606_1493_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1493'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1491'][1].init(84, 24, 'childCount > startOffset');
function visit605_1491_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1491'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1489'][1].init(269, 51, 'startNode[0].nodeType === Dom.NodeType.ELEMENT_NODE');
function visit604_1489_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1489'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1473'][1].init(7, 23, 'checkType === KER.START');
function visit603_1473_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1473'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1466'][1].init(224, 23, 'checkType === KER.START');
function visit602_1466_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1466'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1464'][1].init(12, 23, 'checkType === KER.START');
function visit601_1464_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1464'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1448'][1].init(1141, 29, 'path.block || path.blockLimit');
function visit600_1448_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1448'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1431'][1].init(114, 16, 'textAfter.length');
function visit599_1431_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1431'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1429'][1].init(271, 51, 'endContainer[0].nodeType === Dom.NodeType.TEXT_NODE');
function visit598_1429_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1429'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1411'][1].init(1200, 29, 'path.block || path.blockLimit');
function visit597_1411_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1411'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1394'][1].init(122, 17, 'textBefore.length');
function visit596_1394_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1394'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1392'][2].init(316, 53, 'startContainer[0].nodeType === Dom.NodeType.TEXT_NODE');
function visit595_1392_2(result) {
  _$jscoverage['/editor/range.js'].branchData['1392'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1392'][1].init(301, 68, 'startOffset && startContainer[0].nodeType === Dom.NodeType.TEXT_NODE');
function visit594_1392_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1392'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1374'][1].init(4452, 6, 'tailBr');
function visit593_1374_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1374'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1369'][3].init(130, 50, 'enlargeable && blockBoundary.contains(enlargeable)');
function visit592_1369_3(result) {
  _$jscoverage['/editor/range.js'].branchData['1369'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1369'][2].init(88, 38, '!enlargeable && self.checkEndOfBlock()');
function visit591_1369_2(result) {
  _$jscoverage['/editor/range.js'].branchData['1369'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1369'][1].init(88, 92, '!enlargeable && self.checkEndOfBlock() || enlargeable && blockBoundary.contains(enlargeable)');
function visit590_1369_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1369'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1363'][1].init(3753, 21, 'blockBoundary || body');
function visit589_1363_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1363'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1355'][1].init(3324, 39, 'unit === KER.ENLARGE_LIST_ITEM_CONTENTS');
function visit588_1355_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1355'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1344'][3].init(596, 50, 'enlargeable && blockBoundary.contains(enlargeable)');
function visit587_1344_3(result) {
  _$jscoverage['/editor/range.js'].branchData['1344'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1344'][2].init(552, 40, '!enlargeable && self.checkStartOfBlock()');
function visit586_1344_2(result) {
  _$jscoverage['/editor/range.js'].branchData['1344'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1344'][1].init(552, 94, '!enlargeable && self.checkStartOfBlock() || enlargeable && blockBoundary.contains(enlargeable)');
function visit585_1344_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1344'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1336'][2].init(90, 33, 'blockBoundary.nodeName() !== \'br\'');
function visit584_1336_2(result) {
  _$jscoverage['/editor/range.js'].branchData['1336'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1336'][1].init(-1, 558, 'blockBoundary.nodeName() !== \'br\' && (!enlargeable && self.checkStartOfBlock() || enlargeable && blockBoundary.contains(enlargeable))');
function visit583_1336_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1336'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1330'][1].init(1937, 21, 'blockBoundary || body');
function visit582_1330_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1330'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1319'][2].init(116, 27, 'Dom.nodeName(node) === \'br\'');
function visit581_1319_2(result) {
  _$jscoverage['/editor/range.js'].branchData['1319'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1319'][1].init(105, 38, '!retVal && Dom.nodeName(node) === \'br\'');
function visit580_1319_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1319'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1311'][1].init(104, 7, '!retVal');
function visit579_1311_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1311'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1306'][1].init(55, 39, 'unit === KER.ENLARGE_LIST_ITEM_CONTENTS');
function visit578_1306_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1306'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1284'][1].init(430, 18, 'stop[0] && stop[1]');
function visit577_1284_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1284'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1274'][1].init(57, 14, 'self.collapsed');
function visit576_1274_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1274'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1255'][1].init(991, 47, 'commonReached || enlarge.equals(commonAncestor)');
function visit575_1255_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1255'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1251'][1].init(875, 29, 'enlarge.nodeName() === \'body\'');
function visit574_1251_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1251'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1238'][1].init(69, 14, '!commonReached');
function visit573_1238_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1238'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1236'][1].init(396, 7, 'sibling');
function visit572_1236_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1236'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1228'][1].init(30, 44, 'isWhitespace(sibling) || isBookmark(sibling)');
function visit571_1228_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1228'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1220'][1].init(66, 57, 'container[0].childNodes[offset + (left ? -1 : 1)] || null');
function visit570_1220_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1220'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1209'][1].init(30, 38, 'offset < container[0].nodeValue.length');
function visit569_1209_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1209'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1205'][1].init(70, 6, 'offset');
function visit568_1205_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1205'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1203'][1].init(26, 4, 'left');
function visit567_1203_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1203'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1202'][1].init(395, 48, 'container[0].nodeType === Dom.NodeType.TEXT_NODE');
function visit566_1202_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1202'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1180'][2].init(660, 47, 'ancestor[0].nodeType === Dom.NodeType.TEXT_NODE');
function visit565_1180_2(result) {
  _$jscoverage['/editor/range.js'].branchData['1180'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1180'][1].init(642, 65, 'ignoreTextNode && ancestor[0].nodeType === Dom.NodeType.TEXT_NODE');
function visit564_1180_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1180'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1171'][1].init(71, 39, 'self.startOffset === self.endOffset - 1');
function visit563_1171_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1171'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1170'][2].init(60, 47, 'start[0].nodeType === Dom.NodeType.ELEMENT_NODE');
function visit562_1170_2(result) {
  _$jscoverage['/editor/range.js'].branchData['1170'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1170'][1].init(35, 111, 'start[0].nodeType === Dom.NodeType.ELEMENT_NODE && self.startOffset === self.endOffset - 1');
function visit561_1170_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1170'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1169'][1].init(22, 147, 'includeSelf && start[0].nodeType === Dom.NodeType.ELEMENT_NODE && self.startOffset === self.endOffset - 1');
function visit560_1169_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1169'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1168'][1].init(165, 19, 'start[0] === end[0]');
function visit559_1168_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1168'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1148'][1].init(775, 21, 'endNode && endNode[0]');
function visit558_1148_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1148'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1127'][1].init(565, 12, 'endContainer');
function visit557_1127_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1127'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1120'][1].init(171, 70, 'bookmark.end && doc._4eGetByAddress(bookmark.end, bookmark.normalized)');
function visit556_1120_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1120'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1116'][1].init(89, 12, 'bookmark.is2');
function visit555_1116_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1116'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1102'][1].init(433, 42, 'startContainer[0] === self.endContainer[0]');
function visit554_1102_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1102'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1098'][1].init(118, 49, 'startContainer[0].childNodes[startOffset] || null');
function visit553_1098_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1098'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1071'][1].init(291, 45, 'endOffset >= endContainer[0].nodeValue.length');
function visit552_1071_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1071'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1068'][1].init(131, 10, '!endOffset');
function visit551_1068_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1068'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1065'][2].init(2097, 51, 'endContainer[0].nodeType === Dom.NodeType.TEXT_NODE');
function visit550_1065_2(result) {
  _$jscoverage['/editor/range.js'].branchData['1065'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1065'][1].init(45, 70, 'endContainer[0] && endContainer[0].nodeType === Dom.NodeType.TEXT_NODE');
function visit549_1065_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1065'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1064'][2].init(2032, 22, 'ignoreEnd || collapsed');
function visit548_1064_2(result) {
  _$jscoverage['/editor/range.js'].branchData['1064'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1064'][1].init(2030, 116, '!(ignoreEnd || collapsed) && endContainer[0] && endContainer[0].nodeType === Dom.NodeType.TEXT_NODE');
function visit547_1064_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1064'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1055'][1].init(1454, 9, 'collapsed');
function visit546_1055_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1055'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1048'][1].init(611, 45, 'Dom.equals(startContainer, self.endContainer)');
function visit545_1048_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1048'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1046'][1].init(441, 50, 'Dom.equals(self.startContainer, self.endContainer)');
function visit544_1046_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1046'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1032'][1].init(301, 49, 'startOffset >= startContainer[0].nodeValue.length');
function visit543_1032_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1032'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1029'][1].init(131, 12, '!startOffset');
function visit542_1029_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1029'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1026'][1].init(37, 53, 'startContainer[0].nodeType === Dom.NodeType.TEXT_NODE');
function visit541_1026_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1026'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1025'][1].init(46, 91, 'startContainer[0] && startContainer[0].nodeType === Dom.NodeType.TEXT_NODE');
function visit540_1025_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1025'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1024'][2].init(200, 25, '!ignoreStart || collapsed');
function visit539_1024_2(result) {
  _$jscoverage['/editor/range.js'].branchData['1024'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1024'][1].init(200, 138, '(!ignoreStart || collapsed) && startContainer[0] && startContainer[0].nodeType === Dom.NodeType.TEXT_NODE');
function visit538_1024_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1024'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['987'][1].init(1260, 7, 'endNode');
function visit537_987_1(result) {
  _$jscoverage['/editor/range.js'].branchData['987'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['973'][1].init(111, 12, 'serializable');
function visit536_973_1(result) {
  _$jscoverage['/editor/range.js'].branchData['973'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['969'][1].init(735, 10, '!collapsed');
function visit535_969_1(result) {
  _$jscoverage['/editor/range.js'].branchData['969'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['963'][1].init(522, 12, 'serializable');
function visit534_963_1(result) {
  _$jscoverage['/editor/range.js'].branchData['963'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['928'][1].init(71, 47, 'previous[0].nodeType === Dom.NodeType.TEXT_NODE');
function visit533_928_1(result) {
  _$jscoverage['/editor/range.js'].branchData['928'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['927'][1].init(80, 119, '(previous = endContainer.prev(undefined, 1)) && previous[0].nodeType === Dom.NodeType.TEXT_NODE');
function visit532_927_1(result) {
  _$jscoverage['/editor/range.js'].branchData['927'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['926'][2].init(861, 51, 'endContainer[0].nodeType === Dom.NodeType.TEXT_NODE');
function visit531_926_2(result) {
  _$jscoverage['/editor/range.js'].branchData['926'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['926'][1].init(861, 200, 'endContainer[0].nodeType === Dom.NodeType.TEXT_NODE && (previous = endContainer.prev(undefined, 1)) && previous[0].nodeType === Dom.NodeType.TEXT_NODE');
function visit530_926_1(result) {
  _$jscoverage['/editor/range.js'].branchData['926'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['919'][1].init(45, 60, 'child[0].previousSibling.nodeType === Dom.NodeType.TEXT_NODE');
function visit529_919_1(result) {
  _$jscoverage['/editor/range.js'].branchData['919'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['918'][4].init(332, 13, 'endOffset > 0');
function visit528_918_4(result) {
  _$jscoverage['/editor/range.js'].branchData['918'][4].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['918'][3].init(47, 106, 'endOffset > 0 && child[0].previousSibling.nodeType === Dom.NodeType.TEXT_NODE');
function visit527_918_3(result) {
  _$jscoverage['/editor/range.js'].branchData['918'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['918'][2].init(283, 44, 'child[0].nodeType === Dom.NodeType.TEXT_NODE');
function visit526_918_2(result) {
  _$jscoverage['/editor/range.js'].branchData['918'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['918'][1].init(40, 154, 'child[0].nodeType === Dom.NodeType.TEXT_NODE && endOffset > 0 && child[0].previousSibling.nodeType === Dom.NodeType.TEXT_NODE');
function visit525_918_1(result) {
  _$jscoverage['/editor/range.js'].branchData['918'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['917'][2].init(239, 195, 'child[0] && child[0].nodeType === Dom.NodeType.TEXT_NODE && endOffset > 0 && child[0].previousSibling.nodeType === Dom.NodeType.TEXT_NODE');
function visit524_917_2(result) {
  _$jscoverage['/editor/range.js'].branchData['917'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['917'][1].init(230, 204, 'child && child[0] && child[0].nodeType === Dom.NodeType.TEXT_NODE && endOffset > 0 && child[0].previousSibling.nodeType === Dom.NodeType.TEXT_NODE');
function visit523_917_1(result) {
  _$jscoverage['/editor/range.js'].branchData['917'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['912'][1].init(148, 54, 'endContainer[0].nodeType === Dom.NodeType.ELEMENT_NODE');
function visit522_912_1(result) {
  _$jscoverage['/editor/range.js'].branchData['912'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['909'][1].init(1208, 15, '!self.collapsed');
function visit521_909_1(result) {
  _$jscoverage['/editor/range.js'].branchData['909'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['903'][1].init(69, 47, 'previous[0].nodeType === Dom.NodeType.TEXT_NODE');
function visit520_903_1(result) {
  _$jscoverage['/editor/range.js'].branchData['903'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['902'][1].init(78, 117, '(previous = startContainer.prev(undefined, 1)) && previous[0].nodeType === Dom.NodeType.TEXT_NODE');
function visit519_902_1(result) {
  _$jscoverage['/editor/range.js'].branchData['902'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['901'][2].init(792, 53, 'startContainer[0].nodeType === Dom.NodeType.TEXT_NODE');
function visit518_901_2(result) {
  _$jscoverage['/editor/range.js'].branchData['901'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['901'][1].init(792, 196, 'startContainer[0].nodeType === Dom.NodeType.TEXT_NODE && (previous = startContainer.prev(undefined, 1)) && previous[0].nodeType === Dom.NodeType.TEXT_NODE');
function visit517_901_1(result) {
  _$jscoverage['/editor/range.js'].branchData['901'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['893'][3].init(18, 60, 'child[0].previousSibling.nodeType === Dom.NodeType.TEXT_NODE');
function visit516_893_3(result) {
  _$jscoverage['/editor/range.js'].branchData['893'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['893'][2].init(316, 15, 'startOffset > 0');
function visit515_893_2(result) {
  _$jscoverage['/editor/range.js'].branchData['893'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['893'][1].init(72, 79, 'startOffset > 0 && child[0].previousSibling.nodeType === Dom.NodeType.TEXT_NODE');
function visit514_893_1(result) {
  _$jscoverage['/editor/range.js'].branchData['893'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['892'][4].init(239, 44, 'child[0].nodeType === Dom.NodeType.TEXT_NODE');
function visit513_892_4(result) {
  _$jscoverage['/editor/range.js'].branchData['892'][4].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['892'][3].init(239, 152, 'child[0].nodeType === Dom.NodeType.TEXT_NODE && startOffset > 0 && child[0].previousSibling.nodeType === Dom.NodeType.TEXT_NODE');
function visit512_892_3(result) {
  _$jscoverage['/editor/range.js'].branchData['892'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['892'][2].init(227, 164, 'child[0] && child[0].nodeType === Dom.NodeType.TEXT_NODE && startOffset > 0 && child[0].previousSibling.nodeType === Dom.NodeType.TEXT_NODE');
function visit511_892_2(result) {
  _$jscoverage['/editor/range.js'].branchData['892'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['892'][1].init(218, 173, 'child && child[0] && child[0].nodeType === Dom.NodeType.TEXT_NODE && startOffset > 0 && child[0].previousSibling.nodeType === Dom.NodeType.TEXT_NODE');
function visit510_892_1(result) {
  _$jscoverage['/editor/range.js'].branchData['892'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['887'][1].init(136, 56, 'startContainer[0].nodeType === Dom.NodeType.ELEMENT_NODE');
function visit509_887_1(result) {
  _$jscoverage['/editor/range.js'].branchData['887'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['884'][1].init(640, 10, 'normalized');
function visit508_884_1(result) {
  _$jscoverage['/editor/range.js'].branchData['884'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['877'][1].init(465, 32, '!startContainer || !endContainer');
function visit507_877_1(result) {
  _$jscoverage['/editor/range.js'].branchData['877'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['857'][1].init(3718, 20, 'moveStart || moveEnd');
function visit506_857_1(result) {
  _$jscoverage['/editor/range.js'].branchData['857'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['852'][1].init(167, 7, 'textEnd');
function visit505_852_1(result) {
  _$jscoverage['/editor/range.js'].branchData['852'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['851'][1].init(80, 27, 'mode === KER.SHRINK_ELEMENT');
function visit504_851_1(result) {
  _$jscoverage['/editor/range.js'].branchData['851'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['849'][1].init(3346, 7, 'moveEnd');
function visit503_849_1(result) {
  _$jscoverage['/editor/range.js'].branchData['849'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['844'][1].init(127, 9, 'textStart');
function visit502_844_1(result) {
  _$jscoverage['/editor/range.js'].branchData['844'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['843'][1].init(45, 27, 'mode === KER.SHRINK_ELEMENT');
function visit501_843_1(result) {
  _$jscoverage['/editor/range.js'].branchData['843'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['842'][1].init(3005, 9, 'moveStart');
function visit500_842_1(result) {
  _$jscoverage['/editor/range.js'].branchData['842'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['834'][2].init(566, 43, 'node.nodeType === Dom.NodeType.ELEMENT_NODE');
function visit499_834_2(result) {
  _$jscoverage['/editor/range.js'].branchData['834'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['834'][1].init(552, 57, '!movingOut && node.nodeType === Dom.NodeType.ELEMENT_NODE');
function visit498_834_1(result) {
  _$jscoverage['/editor/range.js'].branchData['834'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['831'][2].init(426, 23, 'node === currentElement');
function visit497_831_2(result) {
  _$jscoverage['/editor/range.js'].branchData['831'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['831'][1].init(413, 36, 'movingOut && node === currentElement');
function visit496_831_1(result) {
  _$jscoverage['/editor/range.js'].branchData['831'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['827'][1].init(59, 40, 'node.nodeType === Dom.NodeType.TEXT_NODE');
function visit495_827_1(result) {
  _$jscoverage['/editor/range.js'].branchData['827'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['826'][2].init(129, 27, 'mode === KER.SHRINK_ELEMENT');
function visit494_826_2(result) {
  _$jscoverage['/editor/range.js'].branchData['826'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['826'][1].init(129, 100, 'mode === KER.SHRINK_ELEMENT && node.nodeType === Dom.NodeType.TEXT_NODE');
function visit493_826_1(result) {
  _$jscoverage['/editor/range.js'].branchData['826'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['820'][2].init(52, 27, 'mode === KER.SHRINK_ELEMENT');
function visit492_820_2(result) {
  _$jscoverage['/editor/range.js'].branchData['820'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['820'][1].init(33, 129, 'node.nodeType === (mode === KER.SHRINK_ELEMENT ? Dom.NodeType.ELEMENT_NODE : Dom.NodeType.TEXT_NODE)');
function visit491_820_1(result) {
  _$jscoverage['/editor/range.js'].branchData['820'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['815'][1].init(1813, 20, 'moveStart || moveEnd');
function visit490_815_1(result) {
  _$jscoverage['/editor/range.js'].branchData['815'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['807'][1].init(138, 45, 'endOffset >= endContainer[0].nodeValue.length');
function visit489_807_1(result) {
  _$jscoverage['/editor/range.js'].branchData['807'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['805'][1].init(26, 10, '!endOffset');
function visit488_805_1(result) {
  _$jscoverage['/editor/range.js'].branchData['805'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['804'][1].init(36, 51, 'endContainer[0].nodeType === Dom.NodeType.TEXT_NODE');
function visit487_804_1(result) {
  _$jscoverage['/editor/range.js'].branchData['804'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['803'][1].init(1271, 88, 'endContainer && endContainer[0].nodeType === Dom.NodeType.TEXT_NODE');
function visit486_803_1(result) {
  _$jscoverage['/editor/range.js'].branchData['803'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['793'][1].init(144, 49, 'startOffset >= startContainer[0].nodeValue.length');
function visit485_793_1(result) {
  _$jscoverage['/editor/range.js'].branchData['793'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['791'][1].init(26, 12, '!startOffset');
function visit484_791_1(result) {
  _$jscoverage['/editor/range.js'].branchData['791'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['790'][1].init(38, 53, 'startContainer[0].nodeType === Dom.NodeType.TEXT_NODE');
function visit483_790_1(result) {
  _$jscoverage['/editor/range.js'].branchData['790'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['789'][1].init(545, 92, 'startContainer && startContainer[0].nodeType === Dom.NodeType.TEXT_NODE');
function visit482_789_1(result) {
  _$jscoverage['/editor/range.js'].branchData['789'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['776'][1].init(25, 23, 'mode || KER.SHRINK_TEXT');
function visit481_776_1(result) {
  _$jscoverage['/editor/range.js'].branchData['776'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['775'][1].init(100, 15, '!self.collapsed');
function visit480_775_1(result) {
  _$jscoverage['/editor/range.js'].branchData['775'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['764'][1].init(884, 24, 'node && node.equals(pre)');
function visit479_764_1(result) {
  _$jscoverage['/editor/range.js'].branchData['764'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['753'][1].init(25, 46, 'isNotWhitespaces(node) && isNotBookmarks(node)');
function visit478_753_1(result) {
  _$jscoverage['/editor/range.js'].branchData['753'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['745'][1].init(88, 66, 'walkerRange.endContainer[0].nodeType !== Dom.NodeType.ELEMENT_NODE');
function visit477_745_1(result) {
  _$jscoverage['/editor/range.js'].branchData['745'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['744'][2].init(194, 68, 'walkerRange.startContainer[0].nodeType !== Dom.NodeType.ELEMENT_NODE');
function visit476_744_2(result) {
  _$jscoverage['/editor/range.js'].branchData['744'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['744'][1].init(194, 155, 'walkerRange.startContainer[0].nodeType !== Dom.NodeType.ELEMENT_NODE || walkerRange.endContainer[0].nodeType !== Dom.NodeType.ELEMENT_NODE');
function visit475_744_1(result) {
  _$jscoverage['/editor/range.js'].branchData['744'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['703'][1].init(48, 7, 'toStart');
function visit474_703_1(result) {
  _$jscoverage['/editor/range.js'].branchData['703'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['658'][1].init(55, 43, 'node[0].nodeType === Dom.NodeType.TEXT_NODE');
function visit473_658_1(result) {
  _$jscoverage['/editor/range.js'].branchData['658'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['627'][1].init(55, 43, 'node[0].nodeType === Dom.NodeType.TEXT_NODE');
function visit472_627_1(result) {
  _$jscoverage['/editor/range.js'].branchData['627'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['606'][1].init(700, 20, '!self.startContainer');
function visit471_606_1(result) {
  _$jscoverage['/editor/range.js'].branchData['606'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['598'][2].init(399, 49, 'endNode[0].nodeType === Dom.NodeType.ELEMENT_NODE');
function visit470_598_2(result) {
  _$jscoverage['/editor/range.js'].branchData['598'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['598'][1].init(399, 80, 'endNode[0].nodeType === Dom.NodeType.ELEMENT_NODE && EMPTY[endNode.nodeName()]');
function visit469_598_1(result) {
  _$jscoverage['/editor/range.js'].branchData['598'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['575'][1].init(717, 18, '!self.endContainer');
function visit468_575_1(result) {
  _$jscoverage['/editor/range.js'].branchData['575'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['567'][2].init(400, 51, 'startNode[0].nodeType === Dom.NodeType.ELEMENT_NODE');
function visit467_567_2(result) {
  _$jscoverage['/editor/range.js'].branchData['567'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['567'][1].init(400, 84, 'startNode[0].nodeType === Dom.NodeType.ELEMENT_NODE && EMPTY[startNode.nodeName()]');
function visit466_567_1(result) {
  _$jscoverage['/editor/range.js'].branchData['567'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['546'][2].init(373, 29, 'endNode.nodeName() === \'span\'');
function visit465_546_2(result) {
  _$jscoverage['/editor/range.js'].branchData['546'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['546'][1].init(27, 78, 'endNode.nodeName() === \'span\' && endNode.attr(\'_ke_bookmark\')');
function visit464_546_1(result) {
  _$jscoverage['/editor/range.js'].branchData['546'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['545'][1].init(343, 106, 'endNode && endNode.nodeName() === \'span\' && endNode.attr(\'_ke_bookmark\')');
function visit463_545_1(result) {
  _$jscoverage['/editor/range.js'].branchData['545'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['541'][2].init(178, 31, 'startNode.nodeName() === \'span\'');
function visit462_541_2(result) {
  _$jscoverage['/editor/range.js'].branchData['541'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['541'][1].init(29, 82, 'startNode.nodeName() === \'span\' && startNode.attr(\'_ke_bookmark\')');
function visit461_541_1(result) {
  _$jscoverage['/editor/range.js'].branchData['541'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['540'][1].init(146, 112, 'startNode && startNode.nodeName() === \'span\' && startNode.attr(\'_ke_bookmark\')');
function visit460_540_1(result) {
  _$jscoverage['/editor/range.js'].branchData['540'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['497'][1].init(113, 39, 'offset >= container[0].nodeValue.length');
function visit459_497_1(result) {
  _$jscoverage['/editor/range.js'].branchData['497'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['495'][1].init(22, 7, '!offset');
function visit458_495_1(result) {
  _$jscoverage['/editor/range.js'].branchData['495'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['494'][1].init(544, 51, 'container[0].nodeType !== Dom.NodeType.ELEMENT_NODE');
function visit457_494_1(result) {
  _$jscoverage['/editor/range.js'].branchData['494'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['486'][1].init(115, 39, 'offset >= container[0].nodeValue.length');
function visit456_486_1(result) {
  _$jscoverage['/editor/range.js'].branchData['486'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['484'][1].init(22, 7, '!offset');
function visit455_484_1(result) {
  _$jscoverage['/editor/range.js'].branchData['484'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['483'][1].init(144, 51, 'container[0].nodeType !== Dom.NodeType.ELEMENT_NODE');
function visit454_483_1(result) {
  _$jscoverage['/editor/range.js'].branchData['483'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['468'][1].init(283, 40, 'endContainer.id || endContainer.nodeName');
function visit453_468_1(result) {
  _$jscoverage['/editor/range.js'].branchData['468'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['467'][1].init(189, 44, 'startContainer.id || startContainer.nodeName');
function visit452_467_1(result) {
  _$jscoverage['/editor/range.js'].branchData['467'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['440'][1].init(67, 35, 'self.startOffset === self.endOffset');
function visit451_440_1(result) {
  _$jscoverage['/editor/range.js'].branchData['440'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['439'][2].init(98, 47, 'self.startContainer[0] === self.endContainer[0]');
function visit450_439_2(result) {
  _$jscoverage['/editor/range.js'].branchData['439'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['439'][1].init(37, 103, 'self.startContainer[0] === self.endContainer[0] && self.startOffset === self.endOffset');
function visit449_439_1(result) {
  _$jscoverage['/editor/range.js'].branchData['439'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['438'][1].init(39, 141, 'self.endContainer && self.startContainer[0] === self.endContainer[0] && self.startOffset === self.endOffset');
function visit448_438_1(result) {
  _$jscoverage['/editor/range.js'].branchData['438'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['437'][1].init(28, 181, 'self.startContainer && self.endContainer && self.startContainer[0] === self.endContainer[0] && self.startOffset === self.endOffset');
function visit447_437_1(result) {
  _$jscoverage['/editor/range.js'].branchData['437'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['429'][1].init(10807, 13, 'removeEndNode');
function visit446_429_1(result) {
  _$jscoverage['/editor/range.js'].branchData['429'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['425'][1].init(10729, 15, 'removeStartNode');
function visit445_425_1(result) {
  _$jscoverage['/editor/range.js'].branchData['425'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['410'][1].init(205, 122, 'removeStartNode && (topStart._4eSameLevel(startNode))');
function visit444_410_1(result) {
  _$jscoverage['/editor/range.js'].branchData['410'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['405'][1].init(31, 66, '!startNode._4eSameLevel(topStart) || !endNode._4eSameLevel(topEnd)');
function visit443_405_1(result) {
  _$jscoverage['/editor/range.js'].branchData['405'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['404'][2].init(260, 99, 'topEnd && (!startNode._4eSameLevel(topStart) || !endNode._4eSameLevel(topEnd))');
function visit442_404_2(result) {
  _$jscoverage['/editor/range.js'].branchData['404'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['404'][1].init(248, 111, 'topStart && topEnd && (!startNode._4eSameLevel(topStart) || !endNode._4eSameLevel(topEnd))');
function visit441_404_1(result) {
  _$jscoverage['/editor/range.js'].branchData['404'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['392'][1].init(51, 63, 'endTextNode.previousSibling.nodeType === Dom.NodeType.TEXT_NODE');
function visit440_392_1(result) {
  _$jscoverage['/editor/range.js'].branchData['392'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['391'][1].init(71, 115, 'endTextNode.previousSibling && endTextNode.previousSibling.nodeType === Dom.NodeType.TEXT_NODE');
function visit439_391_1(result) {
  _$jscoverage['/editor/range.js'].branchData['391'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['390'][2].init(69, 47, 'endTextNode.nodeType === Dom.NodeType.TEXT_NODE');
function visit438_390_2(result) {
  _$jscoverage['/editor/range.js'].branchData['390'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['390'][1].init(69, 187, 'endTextNode.nodeType === Dom.NodeType.TEXT_NODE && endTextNode.previousSibling && endTextNode.previousSibling.nodeType === Dom.NodeType.TEXT_NODE');
function visit437_390_1(result) {
  _$jscoverage['/editor/range.js'].branchData['390'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['388'][1].init(645, 11, 'hasSplitEnd');
function visit436_388_1(result) {
  _$jscoverage['/editor/range.js'].branchData['388'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['382'][1].init(115, 61, 'startTextNode.nextSibling.nodeType === Dom.NodeType.TEXT_NODE');
function visit435_382_1(result) {
  _$jscoverage['/editor/range.js'].branchData['382'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['380'][3].init(126, 177, 'startTextNode.nextSibling && startTextNode.nextSibling.nodeType === Dom.NodeType.TEXT_NODE');
function visit434_380_3(result) {
  _$jscoverage['/editor/range.js'].branchData['380'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['380'][2].init(73, 49, 'startTextNode.nodeType === Dom.NodeType.TEXT_NODE');
function visit433_380_2(result) {
  _$jscoverage['/editor/range.js'].branchData['380'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['380'][1].init(73, 230, 'startTextNode.nodeType === Dom.NodeType.TEXT_NODE && startTextNode.nextSibling && startTextNode.nextSibling.nodeType === Dom.NodeType.TEXT_NODE');
function visit432_380_1(result) {
  _$jscoverage['/editor/range.js'].branchData['380'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['378'][1].init(108, 13, 'hasSplitStart');
function visit431_378_1(result) {
  _$jscoverage['/editor/range.js'].branchData['378'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['374'][1].init(8623, 12, 'action === 2');
function visit430_374_1(result) {
  _$jscoverage['/editor/range.js'].branchData['374'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['369'][1].init(1659, 10, 'levelClone');
function visit429_369_1(result) {
  _$jscoverage['/editor/range.js'].branchData['369'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['359'][1].init(242, 12, 'action === 1');
function visit428_359_1(result) {
  _$jscoverage['/editor/range.js'].branchData['359'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['351'][1].init(194, 12, 'action === 2');
function visit427_351_1(result) {
  _$jscoverage['/editor/range.js'].branchData['351'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['342'][1].init(498, 139, '!startParents[k] || !levelStartNode._4eSameLevel(startParents[k])');
function visit426_342_1(result) {
  _$jscoverage['/editor/range.js'].branchData['342'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['333'][2].init(132, 10, 'action > 0');
function visit425_333_2(result) {
  _$jscoverage['/editor/range.js'].branchData['333'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['333'][1].init(132, 45, 'action > 0 && !levelStartNode.equals(endNode)');
function visit424_333_1(result) {
  _$jscoverage['/editor/range.js'].branchData['333'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['329'][1].init(6822, 21, 'k < endParents.length');
function visit423_329_1(result) {
  _$jscoverage['/editor/range.js'].branchData['329'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['320'][1].init(2239, 10, 'levelClone');
function visit422_320_1(result) {
  _$jscoverage['/editor/range.js'].branchData['320'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['311'][1].init(658, 12, 'action === 1');
function visit421_311_1(result) {
  _$jscoverage['/editor/range.js'].branchData['311'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['301'][1].init(159, 48, 'UN_REMOVABLE[currentNode.nodeName.toLowerCase()]');
function visit420_301_1(result) {
  _$jscoverage['/editor/range.js'].branchData['301'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['294'][1].init(448, 12, 'action === 2');
function visit419_294_1(result) {
  _$jscoverage['/editor/range.js'].branchData['294'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['286'][3].init(196, 26, 'domEndNode === currentNode');
function visit418_286_3(result) {
  _$jscoverage['/editor/range.js'].branchData['286'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['286'][2].init(163, 29, 'domEndParentJ === currentNode');
function visit417_286_2(result) {
  _$jscoverage['/editor/range.js'].branchData['286'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['286'][1].init(163, 59, 'domEndParentJ === currentNode || domEndNode === currentNode');
function visit416_286_1(result) {
  _$jscoverage['/editor/range.js'].branchData['286'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['281'][1].init(108, 27, 'endParentJ && endParentJ[0]');
function visit415_281_1(result) {
  _$jscoverage['/editor/range.js'].branchData['281'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['269'][2].init(132, 10, 'action > 0');
function visit414_269_2(result) {
  _$jscoverage['/editor/range.js'].branchData['269'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['269'][1].init(132, 47, 'action > 0 && !levelStartNode.equals(startNode)');
function visit413_269_1(result) {
  _$jscoverage['/editor/range.js'].branchData['269'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['265'][1].init(4323, 23, 'j < startParents.length');
function visit412_265_1(result) {
  _$jscoverage['/editor/range.js'].branchData['265'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['252'][1].init(348, 24, '!topStart.equals(topEnd)');
function visit411_252_1(result) {
  _$jscoverage['/editor/range.js'].branchData['252'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['244'][1].init(3597, 23, 'i < startParents.length');
function visit410_244_1(result) {
  _$jscoverage['/editor/range.js'].branchData['244'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['218'][1].init(608, 45, 'startOffset >= startNode[0].childNodes.length');
function visit409_218_1(result) {
  _$jscoverage['/editor/range.js'].branchData['218'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['212'][1].init(325, 12, '!startOffset');
function visit408_212_1(result) {
  _$jscoverage['/editor/range.js'].branchData['212'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['203'][1].init(1928, 48, 'startNode[0].nodeType === Dom.NodeType.TEXT_NODE');
function visit407_203_1(result) {
  _$jscoverage['/editor/range.js'].branchData['203'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['189'][1].init(84, 41, 'endOffset >= endNode[0].childNodes.length');
function visit406_189_1(result) {
  _$jscoverage['/editor/range.js'].branchData['189'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['187'][1].init(153, 32, 'endNode[0].childNodes.length > 0');
function visit405_187_1(result) {
  _$jscoverage['/editor/range.js'].branchData['187'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['181'][1].init(890, 46, 'endNode[0].nodeType === Dom.NodeType.TEXT_NODE');
function visit404_181_1(result) {
  _$jscoverage['/editor/range.js'].branchData['181'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['169'][1].init(483, 14, 'self.collapsed');
function visit403_169_1(result) {
  _$jscoverage['/editor/range.js'].branchData['169'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['165'][1].init(390, 10, 'action > 0');
function visit402_165_1(result) {
  _$jscoverage['/editor/range.js'].branchData['165'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['135'][4].init(179, 17, 'nodeName === \'br\'');
function visit401_135_4(result) {
  _$jscoverage['/editor/range.js'].branchData['135'][4].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['135'][3].init(179, 27, 'nodeName === \'br\' && !hadBr');
function visit400_135_3(result) {
  _$jscoverage['/editor/range.js'].branchData['135'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['135'][2].init(169, 37, '!UA.ie && nodeName === \'br\' && !hadBr');
function visit399_135_2(result) {
  _$jscoverage['/editor/range.js'].branchData['135'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['135'][1].init(157, 49, '!isStart && !UA.ie && nodeName === \'br\' && !hadBr');
function visit398_135_1(result) {
  _$jscoverage['/editor/range.js'].branchData['135'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['132'][1].init(198, 35, '!inlineChildReqElements[nodeName]');
function visit397_132_1(result) {
  _$jscoverage['/editor/range.js'].branchData['132'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['128'][1].init(405, 43, 'node.nodeType === Dom.NodeType.ELEMENT_NODE');
function visit396_128_1(result) {
  _$jscoverage['/editor/range.js'].branchData['128'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['125'][1].init(100, 32, 'util.trim(node.nodeValue).length');
function visit395_125_1(result) {
  _$jscoverage['/editor/range.js'].branchData['125'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['123'][1].init(147, 40, 'node.nodeType === Dom.NodeType.TEXT_NODE');
function visit394_123_1(result) {
  _$jscoverage['/editor/range.js'].branchData['123'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['119'][1].init(63, 16, 'isBookmark(node)');
function visit393_119_1(result) {
  _$jscoverage['/editor/range.js'].branchData['119'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['112'][1].init(79, 40, '!isWhitespace(node) && !isBookmark(node)');
function visit392_112_1(result) {
  _$jscoverage['/editor/range.js'].branchData['112'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['107'][2].init(496, 8, 'c2 || c3');
function visit391_107_2(result) {
  _$jscoverage['/editor/range.js'].branchData['107'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['107'][1].init(490, 14, 'c1 || c2 || c3');
function visit390_107_1(result) {
  _$jscoverage['/editor/range.js'].branchData['107'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['104'][2].init(157, 40, 'node.nodeType === Dom.NodeType.TEXT_NODE');
function visit389_104_2(result) {
  _$jscoverage['/editor/range.js'].branchData['104'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['104'][1].init(157, 70, 'node.nodeType === Dom.NodeType.TEXT_NODE && !util.trim(node.nodeValue)');
function visit388_104_1(result) {
  _$jscoverage['/editor/range.js'].branchData['104'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['101'][2].init(154, 40, 'node.nodeType !== Dom.NodeType.TEXT_NODE');
function visit387_101_2(result) {
  _$jscoverage['/editor/range.js'].branchData['101'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['101'][1].init(154, 99, 'node.nodeType !== Dom.NodeType.TEXT_NODE && Dom.nodeName(node) in dtd.$removeEmpty');
function visit386_101_1(result) {
  _$jscoverage['/editor/range.js'].branchData['101'][1].ranCondition(result);
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
  var ElementPath = require('./element-path');
  _$jscoverage['/editor/range.js'].lineData[17]++;
  var util = require('util');
  _$jscoverage['/editor/range.js'].lineData[22]++;
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
  _$jscoverage['/editor/range.js'].lineData[36]++;
  var TRUE = true, FALSE = false, NULL = null, KER = Editor.RangeType, KEP = Editor.PositionType, Dom = require('dom'), UA = require('ua'), dtd = Editor.XHTML_DTD, $ = Node.all, UN_REMOVABLE = {
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
  _$jscoverage['/editor/range.js'].lineData[61]++;
  var isWhitespace = new Walker.whitespaces(), isBookmark = new Walker.bookmark(), isNotWhitespaces = Walker.whitespaces(TRUE), isNotBookmarks = Walker.bookmark(false, true);
  _$jscoverage['/editor/range.js'].lineData[66]++;
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
  _$jscoverage['/editor/range.js'].lineData[97]++;
  function elementBoundaryEval(node) {
    _$jscoverage['/editor/range.js'].functionData[1]++;
    _$jscoverage['/editor/range.js'].lineData[101]++;
    var c1 = visit386_101_1(visit387_101_2(node.nodeType !== Dom.NodeType.TEXT_NODE) && Dom.nodeName(node) in dtd.$removeEmpty), c2 = visit388_104_1(visit389_104_2(node.nodeType === Dom.NodeType.TEXT_NODE) && !util.trim(node.nodeValue)), c3 = !!node.parentNode.getAttribute('_ke_bookmark');
    _$jscoverage['/editor/range.js'].lineData[107]++;
    return visit390_107_1(c1 || visit391_107_2(c2 || c3));
  }
  _$jscoverage['/editor/range.js'].lineData[110]++;
  function nonWhitespaceOrIsBookmark(node) {
    _$jscoverage['/editor/range.js'].functionData[2]++;
    _$jscoverage['/editor/range.js'].lineData[112]++;
    return visit392_112_1(!isWhitespace(node) && !isBookmark(node));
  }
  _$jscoverage['/editor/range.js'].lineData[115]++;
  function getCheckStartEndBlockEvalFunction(isStart) {
    _$jscoverage['/editor/range.js'].functionData[3]++;
    _$jscoverage['/editor/range.js'].lineData[116]++;
    var hadBr = FALSE;
    _$jscoverage['/editor/range.js'].lineData[117]++;
    return function(node) {
  _$jscoverage['/editor/range.js'].functionData[4]++;
  _$jscoverage['/editor/range.js'].lineData[119]++;
  if (visit393_119_1(isBookmark(node))) {
    _$jscoverage['/editor/range.js'].lineData[120]++;
    return TRUE;
  }
  _$jscoverage['/editor/range.js'].lineData[123]++;
  if (visit394_123_1(node.nodeType === Dom.NodeType.TEXT_NODE)) {
    _$jscoverage['/editor/range.js'].lineData[125]++;
    if (visit395_125_1(util.trim(node.nodeValue).length)) {
      _$jscoverage['/editor/range.js'].lineData[126]++;
      return FALSE;
    }
  } else {
    _$jscoverage['/editor/range.js'].lineData[128]++;
    if (visit396_128_1(node.nodeType === Dom.NodeType.ELEMENT_NODE)) {
      _$jscoverage['/editor/range.js'].lineData[129]++;
      var nodeName = Dom.nodeName(node);
      _$jscoverage['/editor/range.js'].lineData[132]++;
      if (visit397_132_1(!inlineChildReqElements[nodeName])) {
        _$jscoverage['/editor/range.js'].lineData[135]++;
        if (visit398_135_1(!isStart && visit399_135_2(!UA.ie && visit400_135_3(visit401_135_4(nodeName === 'br') && !hadBr)))) {
          _$jscoverage['/editor/range.js'].lineData[136]++;
          hadBr = TRUE;
        } else {
          _$jscoverage['/editor/range.js'].lineData[138]++;
          return FALSE;
        }
      }
    }
  }
  _$jscoverage['/editor/range.js'].lineData[142]++;
  return TRUE;
};
  }
  _$jscoverage['/editor/range.js'].lineData[152]++;
  function execContentsAction(self, action) {
    _$jscoverage['/editor/range.js'].functionData[5]++;
    _$jscoverage['/editor/range.js'].lineData[153]++;
    var startNode = self.startContainer, endNode = self.endContainer, startOffset = self.startOffset, endOffset = self.endOffset, removeStartNode, hasSplitStart = FALSE, hasSplitEnd = FALSE, t, docFrag, doc = self.document, removeEndNode;
    _$jscoverage['/editor/range.js'].lineData[165]++;
    if (visit402_165_1(action > 0)) {
      _$jscoverage['/editor/range.js'].lineData[166]++;
      docFrag = doc.createDocumentFragment();
    }
    _$jscoverage['/editor/range.js'].lineData[169]++;
    if (visit403_169_1(self.collapsed)) {
      _$jscoverage['/editor/range.js'].lineData[170]++;
      return docFrag;
    }
    _$jscoverage['/editor/range.js'].lineData[174]++;
    self.optimizeBookmark();
    _$jscoverage['/editor/range.js'].lineData[181]++;
    if (visit404_181_1(endNode[0].nodeType === Dom.NodeType.TEXT_NODE)) {
      _$jscoverage['/editor/range.js'].lineData[182]++;
      hasSplitEnd = TRUE;
      _$jscoverage['/editor/range.js'].lineData[183]++;
      endNode = endNode._4eSplitText(endOffset);
    } else {
      _$jscoverage['/editor/range.js'].lineData[187]++;
      if (visit405_187_1(endNode[0].childNodes.length > 0)) {
        _$jscoverage['/editor/range.js'].lineData[189]++;
        if (visit406_189_1(endOffset >= endNode[0].childNodes.length)) {
          _$jscoverage['/editor/range.js'].lineData[191]++;
          endNode = new Node(endNode[0].appendChild(doc.createTextNode('')));
          _$jscoverage['/editor/range.js'].lineData[192]++;
          removeEndNode = TRUE;
        } else {
          _$jscoverage['/editor/range.js'].lineData[194]++;
          endNode = new Node(endNode[0].childNodes[endOffset]);
        }
      }
    }
    _$jscoverage['/editor/range.js'].lineData[203]++;
    if (visit407_203_1(startNode[0].nodeType === Dom.NodeType.TEXT_NODE)) {
      _$jscoverage['/editor/range.js'].lineData[204]++;
      hasSplitStart = TRUE;
      _$jscoverage['/editor/range.js'].lineData[205]++;
      startNode._4eSplitText(startOffset);
    } else {
      _$jscoverage['/editor/range.js'].lineData[212]++;
      if (visit408_212_1(!startOffset)) {
        _$jscoverage['/editor/range.js'].lineData[214]++;
        t = new Node(doc.createTextNode(''));
        _$jscoverage['/editor/range.js'].lineData[215]++;
        startNode.prepend(t);
        _$jscoverage['/editor/range.js'].lineData[216]++;
        startNode = t;
        _$jscoverage['/editor/range.js'].lineData[217]++;
        removeStartNode = TRUE;
      } else {
        _$jscoverage['/editor/range.js'].lineData[218]++;
        if (visit409_218_1(startOffset >= startNode[0].childNodes.length)) {
          _$jscoverage['/editor/range.js'].lineData[220]++;
          startNode = new Node(startNode[0].appendChild(doc.createTextNode('')));
          _$jscoverage['/editor/range.js'].lineData[222]++;
          removeStartNode = TRUE;
        } else {
          _$jscoverage['/editor/range.js'].lineData[224]++;
          startNode = new Node(startNode[0].childNodes[startOffset].previousSibling);
        }
      }
    }
    _$jscoverage['/editor/range.js'].lineData[230]++;
    var startParents = startNode._4eParents(), endParents = endNode._4eParents();
    _$jscoverage['/editor/range.js'].lineData[233]++;
    startParents.each(function(n, i) {
  _$jscoverage['/editor/range.js'].functionData[6]++;
  _$jscoverage['/editor/range.js'].lineData[234]++;
  startParents[i] = n;
});
    _$jscoverage['/editor/range.js'].lineData[237]++;
    endParents.each(function(n, i) {
  _$jscoverage['/editor/range.js'].functionData[7]++;
  _$jscoverage['/editor/range.js'].lineData[238]++;
  endParents[i] = n;
});
    _$jscoverage['/editor/range.js'].lineData[242]++;
    var i, topStart, topEnd;
    _$jscoverage['/editor/range.js'].lineData[244]++;
    for (i = 0; visit410_244_1(i < startParents.length); i++) {
      _$jscoverage['/editor/range.js'].lineData[245]++;
      topStart = startParents[i];
      _$jscoverage['/editor/range.js'].lineData[246]++;
      topEnd = endParents[i];
      _$jscoverage['/editor/range.js'].lineData[252]++;
      if (visit411_252_1(!topStart.equals(topEnd))) {
        _$jscoverage['/editor/range.js'].lineData[253]++;
        break;
      }
    }
    _$jscoverage['/editor/range.js'].lineData[257]++;
    var clone = docFrag, levelStartNode, levelClone, currentNode, currentSibling;
    _$jscoverage['/editor/range.js'].lineData[265]++;
    for (var j = i; visit412_265_1(j < startParents.length); j++) {
      _$jscoverage['/editor/range.js'].lineData[266]++;
      levelStartNode = startParents[j];
      _$jscoverage['/editor/range.js'].lineData[269]++;
      if (visit413_269_1(visit414_269_2(action > 0) && !levelStartNode.equals(startNode))) {
        _$jscoverage['/editor/range.js'].lineData[271]++;
        levelClone = clone.appendChild(levelStartNode.clone()[0]);
      } else {
        _$jscoverage['/editor/range.js'].lineData[273]++;
        levelClone = null;
      }
      _$jscoverage['/editor/range.js'].lineData[277]++;
      currentNode = levelStartNode[0].nextSibling;
      _$jscoverage['/editor/range.js'].lineData[279]++;
      var endParentJ = endParents[j], domEndNode = endNode[0], domEndParentJ = visit415_281_1(endParentJ && endParentJ[0]);
      _$jscoverage['/editor/range.js'].lineData[283]++;
      while (currentNode) {
        _$jscoverage['/editor/range.js'].lineData[286]++;
        if (visit416_286_1(visit417_286_2(domEndParentJ === currentNode) || visit418_286_3(domEndNode === currentNode))) {
          _$jscoverage['/editor/range.js'].lineData[287]++;
          break;
        }
        _$jscoverage['/editor/range.js'].lineData[291]++;
        currentSibling = currentNode.nextSibling;
        _$jscoverage['/editor/range.js'].lineData[294]++;
        if (visit419_294_1(action === 2)) {
          _$jscoverage['/editor/range.js'].lineData[296]++;
          clone.appendChild(currentNode.cloneNode(TRUE));
        } else {
          _$jscoverage['/editor/range.js'].lineData[301]++;
          if (visit420_301_1(UN_REMOVABLE[currentNode.nodeName.toLowerCase()])) {
            _$jscoverage['/editor/range.js'].lineData[302]++;
            var tmp = currentNode.cloneNode(TRUE);
            _$jscoverage['/editor/range.js'].lineData[303]++;
            currentNode.innerHTML = '';
            _$jscoverage['/editor/range.js'].lineData[304]++;
            currentNode = tmp;
          } else {
            _$jscoverage['/editor/range.js'].lineData[307]++;
            Dom._4eRemove(currentNode);
          }
          _$jscoverage['/editor/range.js'].lineData[311]++;
          if (visit421_311_1(action === 1)) {
            _$jscoverage['/editor/range.js'].lineData[313]++;
            clone.appendChild(currentNode);
          }
        }
        _$jscoverage['/editor/range.js'].lineData[317]++;
        currentNode = currentSibling;
      }
      _$jscoverage['/editor/range.js'].lineData[320]++;
      if (visit422_320_1(levelClone)) {
        _$jscoverage['/editor/range.js'].lineData[321]++;
        clone = levelClone;
      }
    }
    _$jscoverage['/editor/range.js'].lineData[325]++;
    clone = docFrag;
    _$jscoverage['/editor/range.js'].lineData[329]++;
    for (var k = i; visit423_329_1(k < endParents.length); k++) {
      _$jscoverage['/editor/range.js'].lineData[330]++;
      levelStartNode = endParents[k];
      _$jscoverage['/editor/range.js'].lineData[333]++;
      if (visit424_333_1(visit425_333_2(action > 0) && !levelStartNode.equals(endNode))) {
        _$jscoverage['/editor/range.js'].lineData[336]++;
        levelClone = clone.appendChild(levelStartNode.clone()[0]);
      } else {
        _$jscoverage['/editor/range.js'].lineData[338]++;
        levelClone = null;
      }
      _$jscoverage['/editor/range.js'].lineData[342]++;
      if (visit426_342_1(!startParents[k] || !levelStartNode._4eSameLevel(startParents[k]))) {
        _$jscoverage['/editor/range.js'].lineData[345]++;
        currentNode = levelStartNode[0].previousSibling;
        _$jscoverage['/editor/range.js'].lineData[346]++;
        while (currentNode) {
          _$jscoverage['/editor/range.js'].lineData[348]++;
          currentSibling = currentNode.previousSibling;
          _$jscoverage['/editor/range.js'].lineData[351]++;
          if (visit427_351_1(action === 2)) {
            _$jscoverage['/editor/range.js'].lineData[352]++;
            clone.insertBefore(currentNode.cloneNode(TRUE), clone.firstChild);
          } else {
            _$jscoverage['/editor/range.js'].lineData[356]++;
            Dom._4eRemove(currentNode);
            _$jscoverage['/editor/range.js'].lineData[359]++;
            if (visit428_359_1(action === 1)) {
              _$jscoverage['/editor/range.js'].lineData[361]++;
              clone.insertBefore(currentNode, clone.firstChild);
            }
          }
          _$jscoverage['/editor/range.js'].lineData[365]++;
          currentNode = currentSibling;
        }
      }
      _$jscoverage['/editor/range.js'].lineData[369]++;
      if (visit429_369_1(levelClone)) {
        _$jscoverage['/editor/range.js'].lineData[370]++;
        clone = levelClone;
      }
    }
    _$jscoverage['/editor/range.js'].lineData[374]++;
    if (visit430_374_1(action === 2)) {
      _$jscoverage['/editor/range.js'].lineData[378]++;
      if (visit431_378_1(hasSplitStart)) {
        _$jscoverage['/editor/range.js'].lineData[379]++;
        var startTextNode = startNode[0];
        _$jscoverage['/editor/range.js'].lineData[380]++;
        if (visit432_380_1(visit433_380_2(startTextNode.nodeType === Dom.NodeType.TEXT_NODE) && visit434_380_3(startTextNode.nextSibling && visit435_382_1(startTextNode.nextSibling.nodeType === Dom.NodeType.TEXT_NODE)))) {
          _$jscoverage['/editor/range.js'].lineData[383]++;
          startTextNode.data += startTextNode.nextSibling.data;
          _$jscoverage['/editor/range.js'].lineData[384]++;
          startTextNode.parentNode.removeChild(startTextNode.nextSibling);
        }
      }
      _$jscoverage['/editor/range.js'].lineData[388]++;
      if (visit436_388_1(hasSplitEnd)) {
        _$jscoverage['/editor/range.js'].lineData[389]++;
        var endTextNode = endNode[0];
        _$jscoverage['/editor/range.js'].lineData[390]++;
        if (visit437_390_1(visit438_390_2(endTextNode.nodeType === Dom.NodeType.TEXT_NODE) && visit439_391_1(endTextNode.previousSibling && visit440_392_1(endTextNode.previousSibling.nodeType === Dom.NodeType.TEXT_NODE)))) {
          _$jscoverage['/editor/range.js'].lineData[393]++;
          endTextNode.previousSibling.data += endTextNode.data;
          _$jscoverage['/editor/range.js'].lineData[394]++;
          endTextNode.parentNode.removeChild(endTextNode);
        }
      }
    } else {
      _$jscoverage['/editor/range.js'].lineData[404]++;
      if (visit441_404_1(topStart && visit442_404_2(topEnd && (visit443_405_1(!startNode._4eSameLevel(topStart) || !endNode._4eSameLevel(topEnd)))))) {
        _$jscoverage['/editor/range.js'].lineData[406]++;
        var startIndex = topStart._4eIndex();
        _$jscoverage['/editor/range.js'].lineData[410]++;
        if (visit444_410_1(removeStartNode && (topStart._4eSameLevel(startNode)))) {
          _$jscoverage['/editor/range.js'].lineData[413]++;
          startIndex--;
        }
        _$jscoverage['/editor/range.js'].lineData[416]++;
        self.setStart(topStart.parent(), startIndex + 1);
      }
      _$jscoverage['/editor/range.js'].lineData[420]++;
      self.collapse(TRUE);
    }
    _$jscoverage['/editor/range.js'].lineData[425]++;
    if (visit445_425_1(removeStartNode)) {
      _$jscoverage['/editor/range.js'].lineData[426]++;
      startNode.remove();
    }
    _$jscoverage['/editor/range.js'].lineData[429]++;
    if (visit446_429_1(removeEndNode)) {
      _$jscoverage['/editor/range.js'].lineData[430]++;
      endNode.remove();
    }
    _$jscoverage['/editor/range.js'].lineData[433]++;
    return docFrag;
  }
  _$jscoverage['/editor/range.js'].lineData[436]++;
  function updateCollapsed(self) {
    _$jscoverage['/editor/range.js'].functionData[8]++;
    _$jscoverage['/editor/range.js'].lineData[437]++;
    self.collapsed = (visit447_437_1(self.startContainer && visit448_438_1(self.endContainer && visit449_439_1(visit450_439_2(self.startContainer[0] === self.endContainer[0]) && visit451_440_1(self.startOffset === self.endOffset)))));
  }
  _$jscoverage['/editor/range.js'].lineData[448]++;
  function KERange(document) {
    _$jscoverage['/editor/range.js'].functionData[9]++;
    _$jscoverage['/editor/range.js'].lineData[449]++;
    var self = this;
    _$jscoverage['/editor/range.js'].lineData[450]++;
    self.startContainer = NULL;
    _$jscoverage['/editor/range.js'].lineData[451]++;
    self.startOffset = NULL;
    _$jscoverage['/editor/range.js'].lineData[452]++;
    self.endContainer = NULL;
    _$jscoverage['/editor/range.js'].lineData[453]++;
    self.endOffset = NULL;
    _$jscoverage['/editor/range.js'].lineData[454]++;
    self.collapsed = TRUE;
    _$jscoverage['/editor/range.js'].lineData[455]++;
    self.document = document;
  }
  _$jscoverage['/editor/range.js'].lineData[458]++;
  util.augment(KERange, {
  toString: function() {
  _$jscoverage['/editor/range.js'].functionData[10]++;
  _$jscoverage['/editor/range.js'].lineData[463]++;
  var s = [], self = this, startContainer = self.startContainer[0], endContainer = self.endContainer[0];
  _$jscoverage['/editor/range.js'].lineData[467]++;
  s.push((visit452_467_1(startContainer.id || startContainer.nodeName)) + ':' + self.startOffset);
  _$jscoverage['/editor/range.js'].lineData[468]++;
  s.push((visit453_468_1(endContainer.id || endContainer.nodeName)) + ':' + self.endOffset);
  _$jscoverage['/editor/range.js'].lineData[469]++;
  return s.join('<br/>');
}, 
  optimize: function() {
  _$jscoverage['/editor/range.js'].functionData[11]++;
  _$jscoverage['/editor/range.js'].lineData[479]++;
  var self = this, container = self.startContainer, offset = self.startOffset;
  _$jscoverage['/editor/range.js'].lineData[483]++;
  if (visit454_483_1(container[0].nodeType !== Dom.NodeType.ELEMENT_NODE)) {
    _$jscoverage['/editor/range.js'].lineData[484]++;
    if (visit455_484_1(!offset)) {
      _$jscoverage['/editor/range.js'].lineData[485]++;
      self.setStartBefore(container);
    } else {
      _$jscoverage['/editor/range.js'].lineData[486]++;
      if (visit456_486_1(offset >= container[0].nodeValue.length)) {
        _$jscoverage['/editor/range.js'].lineData[487]++;
        self.setStartAfter(container);
      }
    }
  }
  _$jscoverage['/editor/range.js'].lineData[491]++;
  container = self.endContainer;
  _$jscoverage['/editor/range.js'].lineData[492]++;
  offset = self.endOffset;
  _$jscoverage['/editor/range.js'].lineData[494]++;
  if (visit457_494_1(container[0].nodeType !== Dom.NodeType.ELEMENT_NODE)) {
    _$jscoverage['/editor/range.js'].lineData[495]++;
    if (visit458_495_1(!offset)) {
      _$jscoverage['/editor/range.js'].lineData[496]++;
      self.setEndBefore(container);
    } else {
      _$jscoverage['/editor/range.js'].lineData[497]++;
      if (visit459_497_1(offset >= container[0].nodeValue.length)) {
        _$jscoverage['/editor/range.js'].lineData[498]++;
        self.setEndAfter(container);
      }
    }
  }
}, 
  setStartAfter: function(node) {
  _$jscoverage['/editor/range.js'].functionData[12]++;
  _$jscoverage['/editor/range.js'].lineData[508]++;
  this.setStart(node.parent(), node._4eIndex() + 1);
}, 
  setStartBefore: function(node) {
  _$jscoverage['/editor/range.js'].functionData[13]++;
  _$jscoverage['/editor/range.js'].lineData[515]++;
  this.setStart(node.parent(), node._4eIndex());
}, 
  setEndAfter: function(node) {
  _$jscoverage['/editor/range.js'].functionData[14]++;
  _$jscoverage['/editor/range.js'].lineData[522]++;
  this.setEnd(node.parent(), node._4eIndex() + 1);
}, 
  setEndBefore: function(node) {
  _$jscoverage['/editor/range.js'].functionData[15]++;
  _$jscoverage['/editor/range.js'].lineData[529]++;
  this.setEnd(node.parent(), node._4eIndex());
}, 
  optimizeBookmark: function() {
  _$jscoverage['/editor/range.js'].functionData[16]++;
  _$jscoverage['/editor/range.js'].lineData[536]++;
  var self = this, startNode = self.startContainer, endNode = self.endContainer;
  _$jscoverage['/editor/range.js'].lineData[540]++;
  if (visit460_540_1(startNode && visit461_541_1(visit462_541_2(startNode.nodeName() === 'span') && startNode.attr('_ke_bookmark')))) {
    _$jscoverage['/editor/range.js'].lineData[543]++;
    self.setStartBefore(startNode);
  }
  _$jscoverage['/editor/range.js'].lineData[545]++;
  if (visit463_545_1(endNode && visit464_546_1(visit465_546_2(endNode.nodeName() === 'span') && endNode.attr('_ke_bookmark')))) {
    _$jscoverage['/editor/range.js'].lineData[548]++;
    self.setEndAfter(endNode);
  }
}, 
  setStart: function(startNode, startOffset) {
  _$jscoverage['/editor/range.js'].functionData[17]++;
  _$jscoverage['/editor/range.js'].lineData[566]++;
  var self = this;
  _$jscoverage['/editor/range.js'].lineData[567]++;
  if (visit466_567_1(visit467_567_2(startNode[0].nodeType === Dom.NodeType.ELEMENT_NODE) && EMPTY[startNode.nodeName()])) {
    _$jscoverage['/editor/range.js'].lineData[568]++;
    startNode = startNode.parent();
    _$jscoverage['/editor/range.js'].lineData[569]++;
    startOffset = startNode._4eIndex();
  }
  _$jscoverage['/editor/range.js'].lineData[572]++;
  self.startContainer = startNode;
  _$jscoverage['/editor/range.js'].lineData[573]++;
  self.startOffset = startOffset;
  _$jscoverage['/editor/range.js'].lineData[575]++;
  if (visit468_575_1(!self.endContainer)) {
    _$jscoverage['/editor/range.js'].lineData[576]++;
    self.endContainer = startNode;
    _$jscoverage['/editor/range.js'].lineData[577]++;
    self.endOffset = startOffset;
  }
  _$jscoverage['/editor/range.js'].lineData[580]++;
  updateCollapsed(self);
}, 
  setEnd: function(endNode, endOffset) {
  _$jscoverage['/editor/range.js'].functionData[18]++;
  _$jscoverage['/editor/range.js'].lineData[597]++;
  var self = this;
  _$jscoverage['/editor/range.js'].lineData[598]++;
  if (visit469_598_1(visit470_598_2(endNode[0].nodeType === Dom.NodeType.ELEMENT_NODE) && EMPTY[endNode.nodeName()])) {
    _$jscoverage['/editor/range.js'].lineData[599]++;
    endNode = endNode.parent();
    _$jscoverage['/editor/range.js'].lineData[600]++;
    endOffset = endNode._4eIndex() + 1;
  }
  _$jscoverage['/editor/range.js'].lineData[603]++;
  self.endContainer = endNode;
  _$jscoverage['/editor/range.js'].lineData[604]++;
  self.endOffset = endOffset;
  _$jscoverage['/editor/range.js'].lineData[606]++;
  if (visit471_606_1(!self.startContainer)) {
    _$jscoverage['/editor/range.js'].lineData[607]++;
    self.startContainer = endNode;
    _$jscoverage['/editor/range.js'].lineData[608]++;
    self.startOffset = endOffset;
  }
  _$jscoverage['/editor/range.js'].lineData[611]++;
  updateCollapsed(self);
}, 
  setStartAt: function(node, position) {
  _$jscoverage['/editor/range.js'].functionData[19]++;
  _$jscoverage['/editor/range.js'].lineData[620]++;
  var self = this;
  _$jscoverage['/editor/range.js'].lineData[621]++;
  switch (position) {
    case KER.POSITION_AFTER_START:
      _$jscoverage['/editor/range.js'].lineData[623]++;
      self.setStart(node, 0);
      _$jscoverage['/editor/range.js'].lineData[624]++;
      break;
    case KER.POSITION_BEFORE_END:
      _$jscoverage['/editor/range.js'].lineData[627]++;
      if (visit472_627_1(node[0].nodeType === Dom.NodeType.TEXT_NODE)) {
        _$jscoverage['/editor/range.js'].lineData[628]++;
        self.setStart(node, node[0].nodeValue.length);
      } else {
        _$jscoverage['/editor/range.js'].lineData[630]++;
        self.setStart(node, node[0].childNodes.length);
      }
      _$jscoverage['/editor/range.js'].lineData[632]++;
      break;
    case KER.POSITION_BEFORE_START:
      _$jscoverage['/editor/range.js'].lineData[635]++;
      self.setStartBefore(node);
      _$jscoverage['/editor/range.js'].lineData[636]++;
      break;
    case KER.POSITION_AFTER_END:
      _$jscoverage['/editor/range.js'].lineData[639]++;
      self.setStartAfter(node);
  }
  _$jscoverage['/editor/range.js'].lineData[642]++;
  updateCollapsed(self);
}, 
  setEndAt: function(node, position) {
  _$jscoverage['/editor/range.js'].functionData[20]++;
  _$jscoverage['/editor/range.js'].lineData[651]++;
  var self = this;
  _$jscoverage['/editor/range.js'].lineData[652]++;
  switch (position) {
    case KER.POSITION_AFTER_START:
      _$jscoverage['/editor/range.js'].lineData[654]++;
      self.setEnd(node, 0);
      _$jscoverage['/editor/range.js'].lineData[655]++;
      break;
    case KER.POSITION_BEFORE_END:
      _$jscoverage['/editor/range.js'].lineData[658]++;
      if (visit473_658_1(node[0].nodeType === Dom.NodeType.TEXT_NODE)) {
        _$jscoverage['/editor/range.js'].lineData[659]++;
        self.setEnd(node, node[0].nodeValue.length);
      } else {
        _$jscoverage['/editor/range.js'].lineData[661]++;
        self.setEnd(node, node[0].childNodes.length);
      }
      _$jscoverage['/editor/range.js'].lineData[663]++;
      break;
    case KER.POSITION_BEFORE_START:
      _$jscoverage['/editor/range.js'].lineData[666]++;
      self.setEndBefore(node);
      _$jscoverage['/editor/range.js'].lineData[667]++;
      break;
    case KER.POSITION_AFTER_END:
      _$jscoverage['/editor/range.js'].lineData[670]++;
      self.setEndAfter(node);
  }
  _$jscoverage['/editor/range.js'].lineData[673]++;
  updateCollapsed(self);
}, 
  cloneContents: function() {
  _$jscoverage['/editor/range.js'].functionData[21]++;
  _$jscoverage['/editor/range.js'].lineData[680]++;
  return execContentsAction(this, 2);
}, 
  deleteContents: function() {
  _$jscoverage['/editor/range.js'].functionData[22]++;
  _$jscoverage['/editor/range.js'].lineData[687]++;
  return execContentsAction(this, 0);
}, 
  extractContents: function() {
  _$jscoverage['/editor/range.js'].functionData[23]++;
  _$jscoverage['/editor/range.js'].lineData[694]++;
  return execContentsAction(this, 1);
}, 
  collapse: function(toStart) {
  _$jscoverage['/editor/range.js'].functionData[24]++;
  _$jscoverage['/editor/range.js'].lineData[702]++;
  var self = this;
  _$jscoverage['/editor/range.js'].lineData[703]++;
  if (visit474_703_1(toStart)) {
    _$jscoverage['/editor/range.js'].lineData[704]++;
    self.endContainer = self.startContainer;
    _$jscoverage['/editor/range.js'].lineData[705]++;
    self.endOffset = self.startOffset;
  } else {
    _$jscoverage['/editor/range.js'].lineData[707]++;
    self.startContainer = self.endContainer;
    _$jscoverage['/editor/range.js'].lineData[708]++;
    self.startOffset = self.endOffset;
  }
  _$jscoverage['/editor/range.js'].lineData[710]++;
  self.collapsed = TRUE;
}, 
  clone: function() {
  _$jscoverage['/editor/range.js'].functionData[25]++;
  _$jscoverage['/editor/range.js'].lineData[718]++;
  var self = this, clone = new KERange(self.document);
  _$jscoverage['/editor/range.js'].lineData[721]++;
  clone.startContainer = self.startContainer;
  _$jscoverage['/editor/range.js'].lineData[722]++;
  clone.startOffset = self.startOffset;
  _$jscoverage['/editor/range.js'].lineData[723]++;
  clone.endContainer = self.endContainer;
  _$jscoverage['/editor/range.js'].lineData[724]++;
  clone.endOffset = self.endOffset;
  _$jscoverage['/editor/range.js'].lineData[725]++;
  clone.collapsed = self.collapsed;
  _$jscoverage['/editor/range.js'].lineData[727]++;
  return clone;
}, 
  getEnclosedNode: function() {
  _$jscoverage['/editor/range.js'].functionData[26]++;
  _$jscoverage['/editor/range.js'].lineData[739]++;
  var walkerRange = this.clone();
  _$jscoverage['/editor/range.js'].lineData[742]++;
  walkerRange.optimize();
  _$jscoverage['/editor/range.js'].lineData[744]++;
  if (visit475_744_1(visit476_744_2(walkerRange.startContainer[0].nodeType !== Dom.NodeType.ELEMENT_NODE) || visit477_745_1(walkerRange.endContainer[0].nodeType !== Dom.NodeType.ELEMENT_NODE))) {
    _$jscoverage['/editor/range.js'].lineData[746]++;
    return NULL;
  }
  _$jscoverage['/editor/range.js'].lineData[749]++;
  var walker = new Walker(walkerRange), node, pre;
  _$jscoverage['/editor/range.js'].lineData[752]++;
  walker.evaluator = function(node) {
  _$jscoverage['/editor/range.js'].functionData[27]++;
  _$jscoverage['/editor/range.js'].lineData[753]++;
  return visit478_753_1(isNotWhitespaces(node) && isNotBookmarks(node));
};
  _$jscoverage['/editor/range.js'].lineData[760]++;
  node = walker.next();
  _$jscoverage['/editor/range.js'].lineData[761]++;
  walker.reset();
  _$jscoverage['/editor/range.js'].lineData[762]++;
  pre = walker.previous();
  _$jscoverage['/editor/range.js'].lineData[764]++;
  return visit479_764_1(node && node.equals(pre)) ? node : NULL;
}, 
  shrink: function(mode, selectContents) {
  _$jscoverage['/editor/range.js'].functionData[28]++;
  _$jscoverage['/editor/range.js'].lineData[774]++;
  var self = this;
  _$jscoverage['/editor/range.js'].lineData[775]++;
  if (visit480_775_1(!self.collapsed)) {
    _$jscoverage['/editor/range.js'].lineData[776]++;
    mode = visit481_776_1(mode || KER.SHRINK_TEXT);
    _$jscoverage['/editor/range.js'].lineData[778]++;
    var walkerRange = self.clone(), startContainer = self.startContainer, endContainer = self.endContainer, startOffset = self.startOffset, endOffset = self.endOffset, moveStart = TRUE, currentElement, walker, moveEnd = TRUE;
    _$jscoverage['/editor/range.js'].lineData[789]++;
    if (visit482_789_1(startContainer && visit483_790_1(startContainer[0].nodeType === Dom.NodeType.TEXT_NODE))) {
      _$jscoverage['/editor/range.js'].lineData[791]++;
      if (visit484_791_1(!startOffset)) {
        _$jscoverage['/editor/range.js'].lineData[792]++;
        walkerRange.setStartBefore(startContainer);
      } else {
        _$jscoverage['/editor/range.js'].lineData[793]++;
        if (visit485_793_1(startOffset >= startContainer[0].nodeValue.length)) {
          _$jscoverage['/editor/range.js'].lineData[794]++;
          walkerRange.setStartAfter(startContainer);
        } else {
          _$jscoverage['/editor/range.js'].lineData[798]++;
          walkerRange.setStartBefore(startContainer);
          _$jscoverage['/editor/range.js'].lineData[799]++;
          moveStart = FALSE;
        }
      }
    }
    _$jscoverage['/editor/range.js'].lineData[803]++;
    if (visit486_803_1(endContainer && visit487_804_1(endContainer[0].nodeType === Dom.NodeType.TEXT_NODE))) {
      _$jscoverage['/editor/range.js'].lineData[805]++;
      if (visit488_805_1(!endOffset)) {
        _$jscoverage['/editor/range.js'].lineData[806]++;
        walkerRange.setEndBefore(endContainer);
      } else {
        _$jscoverage['/editor/range.js'].lineData[807]++;
        if (visit489_807_1(endOffset >= endContainer[0].nodeValue.length)) {
          _$jscoverage['/editor/range.js'].lineData[808]++;
          walkerRange.setEndAfter(endContainer);
        } else {
          _$jscoverage['/editor/range.js'].lineData[810]++;
          walkerRange.setEndAfter(endContainer);
          _$jscoverage['/editor/range.js'].lineData[811]++;
          moveEnd = FALSE;
        }
      }
    }
    _$jscoverage['/editor/range.js'].lineData[815]++;
    if (visit490_815_1(moveStart || moveEnd)) {
      _$jscoverage['/editor/range.js'].lineData[817]++;
      walker = new Walker(walkerRange);
      _$jscoverage['/editor/range.js'].lineData[819]++;
      walker.evaluator = function(node) {
  _$jscoverage['/editor/range.js'].functionData[29]++;
  _$jscoverage['/editor/range.js'].lineData[820]++;
  return visit491_820_1(node.nodeType === (visit492_820_2(mode === KER.SHRINK_ELEMENT) ? Dom.NodeType.ELEMENT_NODE : Dom.NodeType.TEXT_NODE));
};
      _$jscoverage['/editor/range.js'].lineData[824]++;
      walker.guard = function(node, movingOut) {
  _$jscoverage['/editor/range.js'].functionData[30]++;
  _$jscoverage['/editor/range.js'].lineData[826]++;
  if (visit493_826_1(visit494_826_2(mode === KER.SHRINK_ELEMENT) && visit495_827_1(node.nodeType === Dom.NodeType.TEXT_NODE))) {
    _$jscoverage['/editor/range.js'].lineData[828]++;
    return FALSE;
  }
  _$jscoverage['/editor/range.js'].lineData[831]++;
  if (visit496_831_1(movingOut && visit497_831_2(node === currentElement))) {
    _$jscoverage['/editor/range.js'].lineData[832]++;
    return FALSE;
  }
  _$jscoverage['/editor/range.js'].lineData[834]++;
  if (visit498_834_1(!movingOut && visit499_834_2(node.nodeType === Dom.NodeType.ELEMENT_NODE))) {
    _$jscoverage['/editor/range.js'].lineData[835]++;
    currentElement = node;
  }
  _$jscoverage['/editor/range.js'].lineData[837]++;
  return TRUE;
};
    }
    _$jscoverage['/editor/range.js'].lineData[842]++;
    if (visit500_842_1(moveStart)) {
      _$jscoverage['/editor/range.js'].lineData[843]++;
      var textStart = walker[visit501_843_1(mode === KER.SHRINK_ELEMENT) ? 'lastForward' : 'next']();
      _$jscoverage['/editor/range.js'].lineData[844]++;
      if (visit502_844_1(textStart)) {
        _$jscoverage['/editor/range.js'].lineData[845]++;
        self.setStartAt(textStart, selectContents ? KER.POSITION_AFTER_START : KER.POSITION_BEFORE_START);
      }
    }
    _$jscoverage['/editor/range.js'].lineData[849]++;
    if (visit503_849_1(moveEnd)) {
      _$jscoverage['/editor/range.js'].lineData[850]++;
      walker.reset();
      _$jscoverage['/editor/range.js'].lineData[851]++;
      var textEnd = walker[visit504_851_1(mode === KER.SHRINK_ELEMENT) ? 'lastBackward' : 'previous']();
      _$jscoverage['/editor/range.js'].lineData[852]++;
      if (visit505_852_1(textEnd)) {
        _$jscoverage['/editor/range.js'].lineData[853]++;
        self.setEndAt(textEnd, selectContents ? KER.POSITION_BEFORE_END : KER.POSITION_AFTER_END);
      }
    }
    _$jscoverage['/editor/range.js'].lineData[857]++;
    return visit506_857_1(moveStart || moveEnd);
  }
}, 
  createBookmark2: function(normalized) {
  _$jscoverage['/editor/range.js'].functionData[31]++;
  _$jscoverage['/editor/range.js'].lineData[867]++;
  var self = this, startContainer = self.startContainer, endContainer = self.endContainer, startOffset = self.startOffset, endOffset = self.endOffset, child, previous;
  _$jscoverage['/editor/range.js'].lineData[877]++;
  if (visit507_877_1(!startContainer || !endContainer)) {
    _$jscoverage['/editor/range.js'].lineData[878]++;
    return {
  start: 0, 
  end: 0};
  }
  _$jscoverage['/editor/range.js'].lineData[884]++;
  if (visit508_884_1(normalized)) {
    _$jscoverage['/editor/range.js'].lineData[887]++;
    if (visit509_887_1(startContainer[0].nodeType === Dom.NodeType.ELEMENT_NODE)) {
      _$jscoverage['/editor/range.js'].lineData[888]++;
      child = new Node(startContainer[0].childNodes[startOffset]);
      _$jscoverage['/editor/range.js'].lineData[892]++;
      if (visit510_892_1(child && visit511_892_2(child[0] && visit512_892_3(visit513_892_4(child[0].nodeType === Dom.NodeType.TEXT_NODE) && visit514_893_1(visit515_893_2(startOffset > 0) && visit516_893_3(child[0].previousSibling.nodeType === Dom.NodeType.TEXT_NODE)))))) {
        _$jscoverage['/editor/range.js'].lineData[894]++;
        startContainer = child;
        _$jscoverage['/editor/range.js'].lineData[895]++;
        startOffset = 0;
      }
    }
    _$jscoverage['/editor/range.js'].lineData[901]++;
    while (visit517_901_1(visit518_901_2(startContainer[0].nodeType === Dom.NodeType.TEXT_NODE) && visit519_902_1((previous = startContainer.prev(undefined, 1)) && visit520_903_1(previous[0].nodeType === Dom.NodeType.TEXT_NODE)))) {
      _$jscoverage['/editor/range.js'].lineData[904]++;
      startContainer = previous;
      _$jscoverage['/editor/range.js'].lineData[905]++;
      startOffset += previous[0].nodeValue.length;
    }
    _$jscoverage['/editor/range.js'].lineData[909]++;
    if (visit521_909_1(!self.collapsed)) {
      _$jscoverage['/editor/range.js'].lineData[912]++;
      if (visit522_912_1(endContainer[0].nodeType === Dom.NodeType.ELEMENT_NODE)) {
        _$jscoverage['/editor/range.js'].lineData[913]++;
        child = new Node(endContainer[0].childNodes[endOffset]);
        _$jscoverage['/editor/range.js'].lineData[917]++;
        if (visit523_917_1(child && visit524_917_2(child[0] && visit525_918_1(visit526_918_2(child[0].nodeType === Dom.NodeType.TEXT_NODE) && visit527_918_3(visit528_918_4(endOffset > 0) && visit529_919_1(child[0].previousSibling.nodeType === Dom.NodeType.TEXT_NODE)))))) {
          _$jscoverage['/editor/range.js'].lineData[920]++;
          endContainer = child;
          _$jscoverage['/editor/range.js'].lineData[921]++;
          endOffset = 0;
        }
      }
      _$jscoverage['/editor/range.js'].lineData[926]++;
      while (visit530_926_1(visit531_926_2(endContainer[0].nodeType === Dom.NodeType.TEXT_NODE) && visit532_927_1((previous = endContainer.prev(undefined, 1)) && visit533_928_1(previous[0].nodeType === Dom.NodeType.TEXT_NODE)))) {
        _$jscoverage['/editor/range.js'].lineData[929]++;
        endContainer = previous;
        _$jscoverage['/editor/range.js'].lineData[930]++;
        endOffset += previous[0].nodeValue.length;
      }
    }
  }
  _$jscoverage['/editor/range.js'].lineData[935]++;
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
  _$jscoverage['/editor/range.js'].lineData[949]++;
  var startNode, endNode, baseId, clone, self = this, collapsed = self.collapsed;
  _$jscoverage['/editor/range.js'].lineData[955]++;
  startNode = new Node('<span>', NULL, self.document);
  _$jscoverage['/editor/range.js'].lineData[956]++;
  startNode.attr('_ke_bookmark', 1);
  _$jscoverage['/editor/range.js'].lineData[957]++;
  startNode.css('display', 'none');
  _$jscoverage['/editor/range.js'].lineData[961]++;
  startNode.html('&nbsp;');
  _$jscoverage['/editor/range.js'].lineData[963]++;
  if (visit534_963_1(serializable)) {
    _$jscoverage['/editor/range.js'].lineData[964]++;
    baseId = util.guid('ke_bm_');
    _$jscoverage['/editor/range.js'].lineData[965]++;
    startNode.attr('id', baseId + 'S');
  }
  _$jscoverage['/editor/range.js'].lineData[969]++;
  if (visit535_969_1(!collapsed)) {
    _$jscoverage['/editor/range.js'].lineData[970]++;
    endNode = startNode.clone();
    _$jscoverage['/editor/range.js'].lineData[971]++;
    endNode.html('&nbsp;');
    _$jscoverage['/editor/range.js'].lineData[973]++;
    if (visit536_973_1(serializable)) {
      _$jscoverage['/editor/range.js'].lineData[974]++;
      endNode.attr('id', baseId + 'E');
    }
    _$jscoverage['/editor/range.js'].lineData[977]++;
    clone = self.clone();
    _$jscoverage['/editor/range.js'].lineData[978]++;
    clone.collapse();
    _$jscoverage['/editor/range.js'].lineData[979]++;
    clone.insertNode(endNode);
  }
  _$jscoverage['/editor/range.js'].lineData[982]++;
  clone = self.clone();
  _$jscoverage['/editor/range.js'].lineData[983]++;
  clone.collapse(TRUE);
  _$jscoverage['/editor/range.js'].lineData[984]++;
  clone.insertNode(startNode);
  _$jscoverage['/editor/range.js'].lineData[987]++;
  if (visit537_987_1(endNode)) {
    _$jscoverage['/editor/range.js'].lineData[988]++;
    self.setStartAfter(startNode);
    _$jscoverage['/editor/range.js'].lineData[989]++;
    self.setEndBefore(endNode);
  } else {
    _$jscoverage['/editor/range.js'].lineData[991]++;
    self.moveToPosition(startNode, KER.POSITION_AFTER_END);
  }
  _$jscoverage['/editor/range.js'].lineData[994]++;
  return {
  startNode: serializable ? baseId + 'S' : startNode, 
  endNode: serializable ? baseId + 'E' : endNode, 
  serializable: serializable, 
  collapsed: collapsed};
}, 
  moveToPosition: function(node, position) {
  _$jscoverage['/editor/range.js'].functionData[33]++;
  _$jscoverage['/editor/range.js'].lineData[1008]++;
  var self = this;
  _$jscoverage['/editor/range.js'].lineData[1009]++;
  self.setStartAt(node, position);
  _$jscoverage['/editor/range.js'].lineData[1010]++;
  self.collapse(TRUE);
}, 
  trim: function(ignoreStart, ignoreEnd) {
  _$jscoverage['/editor/range.js'].functionData[34]++;
  _$jscoverage['/editor/range.js'].lineData[1019]++;
  var self = this, startContainer = self.startContainer, startOffset = self.startOffset, collapsed = self.collapsed;
  _$jscoverage['/editor/range.js'].lineData[1024]++;
  if (visit538_1024_1((visit539_1024_2(!ignoreStart || collapsed)) && visit540_1025_1(startContainer[0] && visit541_1026_1(startContainer[0].nodeType === Dom.NodeType.TEXT_NODE)))) {
    _$jscoverage['/editor/range.js'].lineData[1029]++;
    if (visit542_1029_1(!startOffset)) {
      _$jscoverage['/editor/range.js'].lineData[1030]++;
      startOffset = startContainer._4eIndex();
      _$jscoverage['/editor/range.js'].lineData[1031]++;
      startContainer = startContainer.parent();
    } else {
      _$jscoverage['/editor/range.js'].lineData[1032]++;
      if (visit543_1032_1(startOffset >= startContainer[0].nodeValue.length)) {
        _$jscoverage['/editor/range.js'].lineData[1035]++;
        startOffset = startContainer._4eIndex() + 1;
        _$jscoverage['/editor/range.js'].lineData[1036]++;
        startContainer = startContainer.parent();
      } else {
        _$jscoverage['/editor/range.js'].lineData[1040]++;
        var nextText = startContainer._4eSplitText(startOffset);
        _$jscoverage['/editor/range.js'].lineData[1042]++;
        startOffset = startContainer._4eIndex() + 1;
        _$jscoverage['/editor/range.js'].lineData[1043]++;
        startContainer = startContainer.parent();
        _$jscoverage['/editor/range.js'].lineData[1046]++;
        if (visit544_1046_1(Dom.equals(self.startContainer, self.endContainer))) {
          _$jscoverage['/editor/range.js'].lineData[1047]++;
          self.setEnd(nextText, self.endOffset - self.startOffset);
        } else {
          _$jscoverage['/editor/range.js'].lineData[1048]++;
          if (visit545_1048_1(Dom.equals(startContainer, self.endContainer))) {
            _$jscoverage['/editor/range.js'].lineData[1049]++;
            self.endOffset += 1;
          }
        }
      }
    }
    _$jscoverage['/editor/range.js'].lineData[1053]++;
    self.setStart(startContainer, startOffset);
    _$jscoverage['/editor/range.js'].lineData[1055]++;
    if (visit546_1055_1(collapsed)) {
      _$jscoverage['/editor/range.js'].lineData[1056]++;
      self.collapse(TRUE);
      _$jscoverage['/editor/range.js'].lineData[1057]++;
      return;
    }
  }
  _$jscoverage['/editor/range.js'].lineData[1061]++;
  var endContainer = self.endContainer, endOffset = self.endOffset;
  _$jscoverage['/editor/range.js'].lineData[1064]++;
  if (visit547_1064_1(!(visit548_1064_2(ignoreEnd || collapsed)) && visit549_1065_1(endContainer[0] && visit550_1065_2(endContainer[0].nodeType === Dom.NodeType.TEXT_NODE)))) {
    _$jscoverage['/editor/range.js'].lineData[1068]++;
    if (visit551_1068_1(!endOffset)) {
      _$jscoverage['/editor/range.js'].lineData[1069]++;
      endOffset = endContainer._4eIndex();
      _$jscoverage['/editor/range.js'].lineData[1070]++;
      endContainer = endContainer.parent();
    } else {
      _$jscoverage['/editor/range.js'].lineData[1071]++;
      if (visit552_1071_1(endOffset >= endContainer[0].nodeValue.length)) {
        _$jscoverage['/editor/range.js'].lineData[1074]++;
        endOffset = endContainer._4eIndex() + 1;
        _$jscoverage['/editor/range.js'].lineData[1075]++;
        endContainer = endContainer.parent();
      } else {
        _$jscoverage['/editor/range.js'].lineData[1079]++;
        endContainer._4eSplitText(endOffset);
        _$jscoverage['/editor/range.js'].lineData[1081]++;
        endOffset = endContainer._4eIndex() + 1;
        _$jscoverage['/editor/range.js'].lineData[1082]++;
        endContainer = endContainer.parent();
      }
    }
    _$jscoverage['/editor/range.js'].lineData[1085]++;
    self.setEnd(endContainer, endOffset);
  }
}, 
  insertNode: function(node) {
  _$jscoverage['/editor/range.js'].functionData[35]++;
  _$jscoverage['/editor/range.js'].lineData[1093]++;
  var self = this;
  _$jscoverage['/editor/range.js'].lineData[1094]++;
  self.optimizeBookmark();
  _$jscoverage['/editor/range.js'].lineData[1095]++;
  self.trim(FALSE, TRUE);
  _$jscoverage['/editor/range.js'].lineData[1096]++;
  var startContainer = self.startContainer, startOffset = self.startOffset, nextNode = visit553_1098_1(startContainer[0].childNodes[startOffset] || null);
  _$jscoverage['/editor/range.js'].lineData[1100]++;
  startContainer[0].insertBefore(node[0], nextNode);
  _$jscoverage['/editor/range.js'].lineData[1102]++;
  if (visit554_1102_1(startContainer[0] === self.endContainer[0])) {
    _$jscoverage['/editor/range.js'].lineData[1103]++;
    self.endOffset++;
  }
  _$jscoverage['/editor/range.js'].lineData[1106]++;
  self.setStartBefore(node);
}, 
  moveToBookmark: function(bookmark) {
  _$jscoverage['/editor/range.js'].functionData[36]++;
  _$jscoverage['/editor/range.js'].lineData[1114]++;
  var self = this, doc = $(self.document);
  _$jscoverage['/editor/range.js'].lineData[1116]++;
  if (visit555_1116_1(bookmark.is2)) {
    _$jscoverage['/editor/range.js'].lineData[1118]++;
    var startContainer = doc._4eGetByAddress(bookmark.start, bookmark.normalized), startOffset = bookmark.startOffset, endContainer = visit556_1120_1(bookmark.end && doc._4eGetByAddress(bookmark.end, bookmark.normalized)), endOffset = bookmark.endOffset;
    _$jscoverage['/editor/range.js'].lineData[1124]++;
    self.setStart(startContainer, startOffset);
    _$jscoverage['/editor/range.js'].lineData[1127]++;
    if (visit557_1127_1(endContainer)) {
      _$jscoverage['/editor/range.js'].lineData[1128]++;
      self.setEnd(endContainer, endOffset);
    } else {
      _$jscoverage['/editor/range.js'].lineData[1130]++;
      self.collapse(TRUE);
    }
  } else {
    _$jscoverage['/editor/range.js'].lineData[1134]++;
    var serializable = bookmark.serializable, startNode = serializable ? $('#' + bookmark.startNode, doc) : bookmark.startNode, endNode = serializable ? $('#' + bookmark.endNode, doc) : bookmark.endNode;
    _$jscoverage['/editor/range.js'].lineData[1141]++;
    self.setStartBefore(startNode);
    _$jscoverage['/editor/range.js'].lineData[1144]++;
    startNode._4eRemove();
    _$jscoverage['/editor/range.js'].lineData[1148]++;
    if (visit558_1148_1(endNode && endNode[0])) {
      _$jscoverage['/editor/range.js'].lineData[1149]++;
      self.setEndBefore(endNode);
      _$jscoverage['/editor/range.js'].lineData[1150]++;
      endNode._4eRemove();
    } else {
      _$jscoverage['/editor/range.js'].lineData[1152]++;
      self.collapse(TRUE);
    }
  }
}, 
  getCommonAncestor: function(includeSelf, ignoreTextNode) {
  _$jscoverage['/editor/range.js'].functionData[37]++;
  _$jscoverage['/editor/range.js'].lineData[1163]++;
  var self = this, start = self.startContainer, end = self.endContainer, ancestor;
  _$jscoverage['/editor/range.js'].lineData[1168]++;
  if (visit559_1168_1(start[0] === end[0])) {
    _$jscoverage['/editor/range.js'].lineData[1169]++;
    if (visit560_1169_1(includeSelf && visit561_1170_1(visit562_1170_2(start[0].nodeType === Dom.NodeType.ELEMENT_NODE) && visit563_1171_1(self.startOffset === self.endOffset - 1)))) {
      _$jscoverage['/editor/range.js'].lineData[1172]++;
      ancestor = new Node(start[0].childNodes[self.startOffset]);
    } else {
      _$jscoverage['/editor/range.js'].lineData[1174]++;
      ancestor = start;
    }
  } else {
    _$jscoverage['/editor/range.js'].lineData[1177]++;
    ancestor = start._4eCommonAncestor(end);
  }
  _$jscoverage['/editor/range.js'].lineData[1180]++;
  return visit564_1180_1(ignoreTextNode && visit565_1180_2(ancestor[0].nodeType === Dom.NodeType.TEXT_NODE)) ? ancestor.parent() : ancestor;
}, 
  enlarge: (function() {
  _$jscoverage['/editor/range.js'].functionData[38]++;
  _$jscoverage['/editor/range.js'].lineData[1193]++;
  function enlargeElement(self, left, stop, commonAncestor) {
    _$jscoverage['/editor/range.js'].functionData[39]++;
    _$jscoverage['/editor/range.js'].lineData[1194]++;
    var container = self[left ? 'startContainer' : 'endContainer'], enlarge, sibling, index = left ? 0 : 1, commonReached = 0, direction = left ? 'previousSibling' : 'nextSibling', offset = self[left ? 'startOffset' : 'endOffset'];
    _$jscoverage['/editor/range.js'].lineData[1202]++;
    if (visit566_1202_1(container[0].nodeType === Dom.NodeType.TEXT_NODE)) {
      _$jscoverage['/editor/range.js'].lineData[1203]++;
      if (visit567_1203_1(left)) {
        _$jscoverage['/editor/range.js'].lineData[1205]++;
        if (visit568_1205_1(offset)) {
          _$jscoverage['/editor/range.js'].lineData[1206]++;
          return;
        }
      } else {
        _$jscoverage['/editor/range.js'].lineData[1209]++;
        if (visit569_1209_1(offset < container[0].nodeValue.length)) {
          _$jscoverage['/editor/range.js'].lineData[1210]++;
          return;
        }
      }
      _$jscoverage['/editor/range.js'].lineData[1215]++;
      sibling = container[0][direction];
      _$jscoverage['/editor/range.js'].lineData[1217]++;
      enlarge = container[0].parentNode;
    } else {
      _$jscoverage['/editor/range.js'].lineData[1220]++;
      sibling = visit570_1220_1(container[0].childNodes[offset + (left ? -1 : 1)] || null);
      _$jscoverage['/editor/range.js'].lineData[1222]++;
      enlarge = container[0];
    }
    _$jscoverage['/editor/range.js'].lineData[1225]++;
    while (enlarge) {
      _$jscoverage['/editor/range.js'].lineData[1227]++;
      while (sibling) {
        _$jscoverage['/editor/range.js'].lineData[1228]++;
        if (visit571_1228_1(isWhitespace(sibling) || isBookmark(sibling))) {
          _$jscoverage['/editor/range.js'].lineData[1229]++;
          sibling = sibling[direction];
        } else {
          _$jscoverage['/editor/range.js'].lineData[1231]++;
          break;
        }
      }
      _$jscoverage['/editor/range.js'].lineData[1236]++;
      if (visit572_1236_1(sibling)) {
        _$jscoverage['/editor/range.js'].lineData[1238]++;
        if (visit573_1238_1(!commonReached)) {
          _$jscoverage['/editor/range.js'].lineData[1240]++;
          self[left ? 'setStartAfter' : 'setEndBefore']($(sibling));
        }
        _$jscoverage['/editor/range.js'].lineData[1242]++;
        return;
      }
      _$jscoverage['/editor/range.js'].lineData[1249]++;
      enlarge = $(enlarge);
      _$jscoverage['/editor/range.js'].lineData[1251]++;
      if (visit574_1251_1(enlarge.nodeName() === 'body')) {
        _$jscoverage['/editor/range.js'].lineData[1252]++;
        return;
      }
      _$jscoverage['/editor/range.js'].lineData[1255]++;
      if (visit575_1255_1(commonReached || enlarge.equals(commonAncestor))) {
        _$jscoverage['/editor/range.js'].lineData[1256]++;
        stop[index] = enlarge;
        _$jscoverage['/editor/range.js'].lineData[1257]++;
        commonReached = 1;
      } else {
        _$jscoverage['/editor/range.js'].lineData[1260]++;
        self[left ? 'setStartBefore' : 'setEndAfter'](enlarge);
      }
      _$jscoverage['/editor/range.js'].lineData[1263]++;
      sibling = enlarge[0][direction];
      _$jscoverage['/editor/range.js'].lineData[1264]++;
      enlarge = enlarge[0].parentNode;
    }
  }
  _$jscoverage['/editor/range.js'].lineData[1269]++;
  return function(unit) {
  _$jscoverage['/editor/range.js'].functionData[40]++;
  _$jscoverage['/editor/range.js'].lineData[1270]++;
  var self = this, enlargeable;
  _$jscoverage['/editor/range.js'].lineData[1271]++;
  switch (unit) {
    case KER.ENLARGE_ELEMENT:
      _$jscoverage['/editor/range.js'].lineData[1274]++;
      if (visit576_1274_1(self.collapsed)) {
        _$jscoverage['/editor/range.js'].lineData[1275]++;
        return;
      }
      _$jscoverage['/editor/range.js'].lineData[1278]++;
      var commonAncestor = self.getCommonAncestor(), stop = [];
      _$jscoverage['/editor/range.js'].lineData[1281]++;
      enlargeElement(self, 1, stop, commonAncestor);
      _$jscoverage['/editor/range.js'].lineData[1282]++;
      enlargeElement(self, 0, stop, commonAncestor);
      _$jscoverage['/editor/range.js'].lineData[1284]++;
      if (visit577_1284_1(stop[0] && stop[1])) {
        _$jscoverage['/editor/range.js'].lineData[1285]++;
        var commonStop = stop[0].contains(stop[1]) ? stop[1] : stop[0];
        _$jscoverage['/editor/range.js'].lineData[1286]++;
        self.setStartBefore(commonStop);
        _$jscoverage['/editor/range.js'].lineData[1287]++;
        self.setEndAfter(commonStop);
      }
      _$jscoverage['/editor/range.js'].lineData[1290]++;
      break;
    case KER.ENLARGE_BLOCK_CONTENTS:
    case KER.ENLARGE_LIST_ITEM_CONTENTS:
      _$jscoverage['/editor/range.js'].lineData[1296]++;
      var walkerRange = new KERange(self.document);
      _$jscoverage['/editor/range.js'].lineData[1297]++;
      var body = new Node(self.document.body);
      _$jscoverage['/editor/range.js'].lineData[1299]++;
      walkerRange.setStartAt(body, KER.POSITION_AFTER_START);
      _$jscoverage['/editor/range.js'].lineData[1300]++;
      walkerRange.setEnd(self.startContainer, self.startOffset);
      _$jscoverage['/editor/range.js'].lineData[1302]++;
      var walker = new Walker(walkerRange), blockBoundary, tailBr, defaultGuard = Walker.blockBoundary((visit578_1306_1(unit === KER.ENLARGE_LIST_ITEM_CONTENTS)) ? {
  br: 1} : NULL), boundaryGuard = function(node) {
  _$jscoverage['/editor/range.js'].functionData[41]++;
  _$jscoverage['/editor/range.js'].lineData[1310]++;
  var retVal = defaultGuard(node);
  _$jscoverage['/editor/range.js'].lineData[1311]++;
  if (visit579_1311_1(!retVal)) {
    _$jscoverage['/editor/range.js'].lineData[1312]++;
    blockBoundary = $(node);
  }
  _$jscoverage['/editor/range.js'].lineData[1314]++;
  return retVal;
}, tailBrGuard = function(node) {
  _$jscoverage['/editor/range.js'].functionData[42]++;
  _$jscoverage['/editor/range.js'].lineData[1318]++;
  var retVal = boundaryGuard(node);
  _$jscoverage['/editor/range.js'].lineData[1319]++;
  if (visit580_1319_1(!retVal && visit581_1319_2(Dom.nodeName(node) === 'br'))) {
    _$jscoverage['/editor/range.js'].lineData[1320]++;
    tailBr = $(node);
  }
  _$jscoverage['/editor/range.js'].lineData[1322]++;
  return retVal;
};
      _$jscoverage['/editor/range.js'].lineData[1325]++;
      walker.guard = boundaryGuard;
      _$jscoverage['/editor/range.js'].lineData[1327]++;
      enlargeable = walker.lastBackward();
      _$jscoverage['/editor/range.js'].lineData[1330]++;
      blockBoundary = visit582_1330_1(blockBoundary || body);
      _$jscoverage['/editor/range.js'].lineData[1334]++;
      self.setStartAt(blockBoundary, visit583_1336_1(visit584_1336_2(blockBoundary.nodeName() !== 'br') && (visit585_1344_1(visit586_1344_2(!enlargeable && self.checkStartOfBlock()) || visit587_1344_3(enlargeable && blockBoundary.contains(enlargeable))))) ? KER.POSITION_AFTER_START : KER.POSITION_AFTER_END);
      _$jscoverage['/editor/range.js'].lineData[1349]++;
      walkerRange = self.clone();
      _$jscoverage['/editor/range.js'].lineData[1350]++;
      walkerRange.collapse();
      _$jscoverage['/editor/range.js'].lineData[1351]++;
      walkerRange.setEndAt(body, KER.POSITION_BEFORE_END);
      _$jscoverage['/editor/range.js'].lineData[1352]++;
      walker = new Walker(walkerRange);
      _$jscoverage['/editor/range.js'].lineData[1355]++;
      walker.guard = (visit588_1355_1(unit === KER.ENLARGE_LIST_ITEM_CONTENTS)) ? tailBrGuard : boundaryGuard;
      _$jscoverage['/editor/range.js'].lineData[1357]++;
      blockBoundary = NULL;
      _$jscoverage['/editor/range.js'].lineData[1360]++;
      enlargeable = walker.lastForward();
      _$jscoverage['/editor/range.js'].lineData[1363]++;
      blockBoundary = visit589_1363_1(blockBoundary || body);
      _$jscoverage['/editor/range.js'].lineData[1367]++;
      self.setEndAt(blockBoundary, (visit590_1369_1(visit591_1369_2(!enlargeable && self.checkEndOfBlock()) || visit592_1369_3(enlargeable && blockBoundary.contains(enlargeable)))) ? KER.POSITION_BEFORE_END : KER.POSITION_BEFORE_START);
      _$jscoverage['/editor/range.js'].lineData[1374]++;
      if (visit593_1374_1(tailBr)) {
        _$jscoverage['/editor/range.js'].lineData[1375]++;
        self.setEndAfter(tailBr);
      }
  }
};
})(), 
  checkStartOfBlock: function() {
  _$jscoverage['/editor/range.js'].functionData[43]++;
  _$jscoverage['/editor/range.js'].lineData[1386]++;
  var self = this, startContainer = self.startContainer, startOffset = self.startOffset;
  _$jscoverage['/editor/range.js'].lineData[1392]++;
  if (visit594_1392_1(startOffset && visit595_1392_2(startContainer[0].nodeType === Dom.NodeType.TEXT_NODE))) {
    _$jscoverage['/editor/range.js'].lineData[1393]++;
    var textBefore = util.trim(startContainer[0].nodeValue.substring(0, startOffset));
    _$jscoverage['/editor/range.js'].lineData[1394]++;
    if (visit596_1394_1(textBefore.length)) {
      _$jscoverage['/editor/range.js'].lineData[1395]++;
      return FALSE;
    }
  }
  _$jscoverage['/editor/range.js'].lineData[1402]++;
  self.trim();
  _$jscoverage['/editor/range.js'].lineData[1406]++;
  var path = new ElementPath(self.startContainer);
  _$jscoverage['/editor/range.js'].lineData[1409]++;
  var walkerRange = self.clone();
  _$jscoverage['/editor/range.js'].lineData[1410]++;
  walkerRange.collapse(TRUE);
  _$jscoverage['/editor/range.js'].lineData[1411]++;
  walkerRange.setStartAt(visit597_1411_1(path.block || path.blockLimit), KER.POSITION_AFTER_START);
  _$jscoverage['/editor/range.js'].lineData[1413]++;
  var walker = new Walker(walkerRange);
  _$jscoverage['/editor/range.js'].lineData[1414]++;
  walker.evaluator = getCheckStartEndBlockEvalFunction(TRUE);
  _$jscoverage['/editor/range.js'].lineData[1416]++;
  return walker.checkBackward();
}, 
  checkEndOfBlock: function() {
  _$jscoverage['/editor/range.js'].functionData[44]++;
  _$jscoverage['/editor/range.js'].lineData[1424]++;
  var self = this, endContainer = self.endContainer, endOffset = self.endOffset;
  _$jscoverage['/editor/range.js'].lineData[1429]++;
  if (visit598_1429_1(endContainer[0].nodeType === Dom.NodeType.TEXT_NODE)) {
    _$jscoverage['/editor/range.js'].lineData[1430]++;
    var textAfter = util.trim(endContainer[0].nodeValue.substring(endOffset));
    _$jscoverage['/editor/range.js'].lineData[1431]++;
    if (visit599_1431_1(textAfter.length)) {
      _$jscoverage['/editor/range.js'].lineData[1432]++;
      return FALSE;
    }
  }
  _$jscoverage['/editor/range.js'].lineData[1439]++;
  self.trim();
  _$jscoverage['/editor/range.js'].lineData[1443]++;
  var path = new ElementPath(self.endContainer);
  _$jscoverage['/editor/range.js'].lineData[1446]++;
  var walkerRange = self.clone();
  _$jscoverage['/editor/range.js'].lineData[1447]++;
  walkerRange.collapse(FALSE);
  _$jscoverage['/editor/range.js'].lineData[1448]++;
  walkerRange.setEndAt(visit600_1448_1(path.block || path.blockLimit), KER.POSITION_BEFORE_END);
  _$jscoverage['/editor/range.js'].lineData[1450]++;
  var walker = new Walker(walkerRange);
  _$jscoverage['/editor/range.js'].lineData[1451]++;
  walker.evaluator = getCheckStartEndBlockEvalFunction(FALSE);
  _$jscoverage['/editor/range.js'].lineData[1453]++;
  return walker.checkForward();
}, 
  checkBoundaryOfElement: function(element, checkType) {
  _$jscoverage['/editor/range.js'].functionData[45]++;
  _$jscoverage['/editor/range.js'].lineData[1462]++;
  var walkerRange = this.clone();
  _$jscoverage['/editor/range.js'].lineData[1466]++;
  walkerRange[visit601_1464_1(checkType === KER.START) ? 'setStartAt' : 'setEndAt'](element, visit602_1466_1(checkType === KER.START) ? KER.POSITION_AFTER_START : KER.POSITION_BEFORE_END);
  _$jscoverage['/editor/range.js'].lineData[1470]++;
  var walker = new Walker(walkerRange);
  _$jscoverage['/editor/range.js'].lineData[1472]++;
  walker.evaluator = elementBoundaryEval;
  _$jscoverage['/editor/range.js'].lineData[1473]++;
  return walker[visit603_1473_1(checkType === KER.START) ? 'checkBackward' : 'checkForward']();
}, 
  getBoundaryNodes: function() {
  _$jscoverage['/editor/range.js'].functionData[46]++;
  _$jscoverage['/editor/range.js'].lineData[1482]++;
  var self = this, startNode = self.startContainer, endNode = self.endContainer, startOffset = self.startOffset, endOffset = self.endOffset, childCount;
  _$jscoverage['/editor/range.js'].lineData[1489]++;
  if (visit604_1489_1(startNode[0].nodeType === Dom.NodeType.ELEMENT_NODE)) {
    _$jscoverage['/editor/range.js'].lineData[1490]++;
    childCount = startNode[0].childNodes.length;
    _$jscoverage['/editor/range.js'].lineData[1491]++;
    if (visit605_1491_1(childCount > startOffset)) {
      _$jscoverage['/editor/range.js'].lineData[1492]++;
      startNode = $(startNode[0].childNodes[startOffset]);
    } else {
      _$jscoverage['/editor/range.js'].lineData[1493]++;
      if (visit606_1493_1(childCount === 0)) {
        _$jscoverage['/editor/range.js'].lineData[1495]++;
        startNode = startNode._4ePreviousSourceNode();
      } else {
        _$jscoverage['/editor/range.js'].lineData[1499]++;
        startNode = startNode[0];
        _$jscoverage['/editor/range.js'].lineData[1500]++;
        while (startNode.lastChild) {
          _$jscoverage['/editor/range.js'].lineData[1501]++;
          startNode = startNode.lastChild;
        }
        _$jscoverage['/editor/range.js'].lineData[1504]++;
        startNode = $(startNode);
        _$jscoverage['/editor/range.js'].lineData[1509]++;
        startNode = visit607_1509_1(startNode._4eNextSourceNode() || startNode);
      }
    }
  }
  _$jscoverage['/editor/range.js'].lineData[1513]++;
  if (visit608_1513_1(endNode[0].nodeType === Dom.NodeType.ELEMENT_NODE)) {
    _$jscoverage['/editor/range.js'].lineData[1514]++;
    childCount = endNode[0].childNodes.length;
    _$jscoverage['/editor/range.js'].lineData[1515]++;
    if (visit609_1515_1(childCount > endOffset)) {
      _$jscoverage['/editor/range.js'].lineData[1516]++;
      endNode = $(endNode[0].childNodes[endOffset])._4ePreviousSourceNode(TRUE);
    } else {
      _$jscoverage['/editor/range.js'].lineData[1519]++;
      if (visit610_1519_1(childCount === 0)) {
        _$jscoverage['/editor/range.js'].lineData[1520]++;
        endNode = endNode._4ePreviousSourceNode();
      } else {
        _$jscoverage['/editor/range.js'].lineData[1524]++;
        endNode = endNode[0];
        _$jscoverage['/editor/range.js'].lineData[1525]++;
        while (endNode.lastChild) {
          _$jscoverage['/editor/range.js'].lineData[1526]++;
          endNode = endNode.lastChild;
        }
        _$jscoverage['/editor/range.js'].lineData[1528]++;
        endNode = $(endNode);
      }
    }
  }
  _$jscoverage['/editor/range.js'].lineData[1534]++;
  if (visit611_1534_1(startNode._4ePosition(endNode) & KEP.POSITION_FOLLOWING)) {
    _$jscoverage['/editor/range.js'].lineData[1535]++;
    startNode = endNode;
  }
  _$jscoverage['/editor/range.js'].lineData[1538]++;
  return {
  startNode: startNode, 
  endNode: endNode};
}, 
  fixBlock: function(isStart, blockTag) {
  _$jscoverage['/editor/range.js'].functionData[47]++;
  _$jscoverage['/editor/range.js'].lineData[1552]++;
  var self = this, bookmark = self.createBookmark(), fixedBlock = $(self.document.createElement(blockTag));
  _$jscoverage['/editor/range.js'].lineData[1555]++;
  self.collapse(isStart);
  _$jscoverage['/editor/range.js'].lineData[1556]++;
  self.enlarge(KER.ENLARGE_BLOCK_CONTENTS);
  _$jscoverage['/editor/range.js'].lineData[1557]++;
  fixedBlock[0].appendChild(self.extractContents());
  _$jscoverage['/editor/range.js'].lineData[1558]++;
  fixedBlock._4eTrim();
  _$jscoverage['/editor/range.js'].lineData[1559]++;
  if (visit612_1559_1(!UA.ie)) {
    _$jscoverage['/editor/range.js'].lineData[1560]++;
    fixedBlock._4eAppendBogus();
  }
  _$jscoverage['/editor/range.js'].lineData[1562]++;
  self.insertNode(fixedBlock);
  _$jscoverage['/editor/range.js'].lineData[1563]++;
  self.moveToBookmark(bookmark);
  _$jscoverage['/editor/range.js'].lineData[1564]++;
  return fixedBlock;
}, 
  splitBlock: function(blockTag) {
  _$jscoverage['/editor/range.js'].functionData[48]++;
  _$jscoverage['/editor/range.js'].lineData[1573]++;
  var self = this, startPath = new ElementPath(self.startContainer), endPath = new ElementPath(self.endContainer), startBlockLimit = startPath.blockLimit, endBlockLimit = endPath.blockLimit, startBlock = startPath.block, endBlock = endPath.block, elementPath = NULL;
  _$jscoverage['/editor/range.js'].lineData[1583]++;
  if (visit613_1583_1(!startBlockLimit.equals(endBlockLimit))) {
    _$jscoverage['/editor/range.js'].lineData[1584]++;
    return NULL;
  }
  _$jscoverage['/editor/range.js'].lineData[1588]++;
  if (visit614_1588_1(blockTag !== 'br')) {
    _$jscoverage['/editor/range.js'].lineData[1589]++;
    if (visit615_1589_1(!startBlock)) {
      _$jscoverage['/editor/range.js'].lineData[1590]++;
      startBlock = self.fixBlock(TRUE, blockTag);
      _$jscoverage['/editor/range.js'].lineData[1591]++;
      endBlock = new ElementPath(self.endContainer).block;
    }
    _$jscoverage['/editor/range.js'].lineData[1594]++;
    if (visit616_1594_1(!endBlock)) {
      _$jscoverage['/editor/range.js'].lineData[1595]++;
      endBlock = self.fixBlock(FALSE, blockTag);
    }
  }
  _$jscoverage['/editor/range.js'].lineData[1600]++;
  var isStartOfBlock = visit617_1600_1(startBlock && self.checkStartOfBlock()), isEndOfBlock = visit618_1601_1(endBlock && self.checkEndOfBlock());
  _$jscoverage['/editor/range.js'].lineData[1604]++;
  self.deleteContents();
  _$jscoverage['/editor/range.js'].lineData[1606]++;
  if (visit619_1606_1(startBlock && visit620_1606_2(startBlock[0] === endBlock[0]))) {
    _$jscoverage['/editor/range.js'].lineData[1607]++;
    if (visit621_1607_1(isEndOfBlock)) {
      _$jscoverage['/editor/range.js'].lineData[1608]++;
      elementPath = new ElementPath(self.startContainer);
      _$jscoverage['/editor/range.js'].lineData[1609]++;
      self.moveToPosition(endBlock, KER.POSITION_AFTER_END);
      _$jscoverage['/editor/range.js'].lineData[1610]++;
      endBlock = NULL;
    } else {
      _$jscoverage['/editor/range.js'].lineData[1611]++;
      if (visit622_1611_1(isStartOfBlock)) {
        _$jscoverage['/editor/range.js'].lineData[1612]++;
        elementPath = new ElementPath(self.startContainer);
        _$jscoverage['/editor/range.js'].lineData[1613]++;
        self.moveToPosition(startBlock, KER.POSITION_BEFORE_START);
        _$jscoverage['/editor/range.js'].lineData[1614]++;
        startBlock = NULL;
      } else {
        _$jscoverage['/editor/range.js'].lineData[1616]++;
        endBlock = self.splitElement(startBlock);
        _$jscoverage['/editor/range.js'].lineData[1620]++;
        if (visit623_1620_1(!UA.ie && !util.inArray(startBlock.nodeName(), ['ul', 'ol']))) {
          _$jscoverage['/editor/range.js'].lineData[1621]++;
          startBlock._4eAppendBogus();
        }
      }
    }
  }
  _$jscoverage['/editor/range.js'].lineData[1626]++;
  return {
  previousBlock: startBlock, 
  nextBlock: endBlock, 
  wasStartOfBlock: isStartOfBlock, 
  wasEndOfBlock: isEndOfBlock, 
  elementPath: elementPath};
}, 
  splitElement: function(toSplit) {
  _$jscoverage['/editor/range.js'].functionData[49]++;
  _$jscoverage['/editor/range.js'].lineData[1641]++;
  var self = this;
  _$jscoverage['/editor/range.js'].lineData[1642]++;
  if (visit624_1642_1(!self.collapsed)) {
    _$jscoverage['/editor/range.js'].lineData[1643]++;
    return NULL;
  }
  _$jscoverage['/editor/range.js'].lineData[1648]++;
  self.setEndAt(toSplit, KER.POSITION_BEFORE_END);
  _$jscoverage['/editor/range.js'].lineData[1649]++;
  var documentFragment = self.extractContents(), clone = toSplit.clone(FALSE);
  _$jscoverage['/editor/range.js'].lineData[1654]++;
  clone[0].appendChild(documentFragment);
  _$jscoverage['/editor/range.js'].lineData[1656]++;
  clone.insertAfter(toSplit);
  _$jscoverage['/editor/range.js'].lineData[1657]++;
  self.moveToPosition(toSplit, KER.POSITION_AFTER_END);
  _$jscoverage['/editor/range.js'].lineData[1658]++;
  return clone;
}, 
  moveToElementEditablePosition: function(el, isMoveToEnd) {
  _$jscoverage['/editor/range.js'].functionData[50]++;
  _$jscoverage['/editor/range.js'].lineData[1670]++;
  function nextDFS(node, childOnly) {
    _$jscoverage['/editor/range.js'].functionData[51]++;
    _$jscoverage['/editor/range.js'].lineData[1671]++;
    var next;
    _$jscoverage['/editor/range.js'].lineData[1673]++;
    if (visit625_1673_1(visit626_1673_2(node[0].nodeType === Dom.NodeType.ELEMENT_NODE) && node._4eIsEditable())) {
      _$jscoverage['/editor/range.js'].lineData[1675]++;
      next = node[isMoveToEnd ? 'last' : 'first'](nonWhitespaceOrIsBookmark, 1);
    }
    _$jscoverage['/editor/range.js'].lineData[1678]++;
    if (visit627_1678_1(!childOnly && !next)) {
      _$jscoverage['/editor/range.js'].lineData[1679]++;
      next = node[isMoveToEnd ? 'prev' : 'next'](nonWhitespaceOrIsBookmark, 1);
    }
    _$jscoverage['/editor/range.js'].lineData[1682]++;
    return next;
  }
  _$jscoverage['/editor/range.js'].lineData[1685]++;
  var found = 0, self = this;
  _$jscoverage['/editor/range.js'].lineData[1687]++;
  while (el) {
    _$jscoverage['/editor/range.js'].lineData[1689]++;
    if (visit628_1689_1(el[0].nodeType === Dom.NodeType.TEXT_NODE)) {
      _$jscoverage['/editor/range.js'].lineData[1690]++;
      self.moveToPosition(el, isMoveToEnd ? KER.POSITION_AFTER_END : KER.POSITION_BEFORE_START);
      _$jscoverage['/editor/range.js'].lineData[1693]++;
      found = 1;
      _$jscoverage['/editor/range.js'].lineData[1694]++;
      break;
    }
    _$jscoverage['/editor/range.js'].lineData[1698]++;
    if (visit629_1698_1(visit630_1698_2(el[0].nodeType === Dom.NodeType.ELEMENT_NODE) && el._4eIsEditable())) {
      _$jscoverage['/editor/range.js'].lineData[1699]++;
      self.moveToPosition(el, isMoveToEnd ? KER.POSITION_BEFORE_END : KER.POSITION_AFTER_START);
      _$jscoverage['/editor/range.js'].lineData[1702]++;
      found = 1;
    }
    _$jscoverage['/editor/range.js'].lineData[1705]++;
    el = nextDFS(el, found);
  }
  _$jscoverage['/editor/range.js'].lineData[1708]++;
  return !!found;
}, 
  selectNodeContents: function(node) {
  _$jscoverage['/editor/range.js'].functionData[52]++;
  _$jscoverage['/editor/range.js'].lineData[1716]++;
  var self = this, domNode = node[0];
  _$jscoverage['/editor/range.js'].lineData[1717]++;
  self.setStart(node, 0);
  _$jscoverage['/editor/range.js'].lineData[1718]++;
  self.setEnd(node, visit631_1718_1(domNode.nodeType === Dom.NodeType.TEXT_NODE) ? domNode.nodeValue.length : domNode.childNodes.length);
}, 
  insertNodeByDtd: function(element) {
  _$jscoverage['/editor/range.js'].functionData[53]++;
  _$jscoverage['/editor/range.js'].lineData[1728]++;
  var current, self = this, tmpDtd, last, elementName = element.nodeName(), isBlock = dtd.$block[elementName];
  _$jscoverage['/editor/range.js'].lineData[1734]++;
  self.deleteContents();
  _$jscoverage['/editor/range.js'].lineData[1735]++;
  if (visit632_1735_1(isBlock)) {
    _$jscoverage['/editor/range.js'].lineData[1736]++;
    current = self.getCommonAncestor(FALSE, TRUE);
    _$jscoverage['/editor/range.js'].lineData[1737]++;
    while (visit633_1737_1((tmpDtd = dtd[current.nodeName()]) && !(visit634_1737_2(tmpDtd && tmpDtd[elementName])))) {
      _$jscoverage['/editor/range.js'].lineData[1738]++;
      var parent = current.parent();
      _$jscoverage['/editor/range.js'].lineData[1741]++;
      if (visit635_1741_1(self.checkStartOfBlock() && self.checkEndOfBlock())) {
        _$jscoverage['/editor/range.js'].lineData[1742]++;
        self.setStartBefore(current);
        _$jscoverage['/editor/range.js'].lineData[1743]++;
        self.collapse(TRUE);
        _$jscoverage['/editor/range.js'].lineData[1744]++;
        current.remove();
      } else {
        _$jscoverage['/editor/range.js'].lineData[1746]++;
        last = current;
      }
      _$jscoverage['/editor/range.js'].lineData[1748]++;
      current = parent;
    }
    _$jscoverage['/editor/range.js'].lineData[1751]++;
    if (visit636_1751_1(last)) {
      _$jscoverage['/editor/range.js'].lineData[1752]++;
      self.splitElement(last);
    }
  }
  _$jscoverage['/editor/range.js'].lineData[1756]++;
  self.insertNode(element);
}});
  _$jscoverage['/editor/range.js'].lineData[1760]++;
  Utils.injectDom({
  _4eBreakParent: function(el, parent) {
  _$jscoverage['/editor/range.js'].functionData[54]++;
  _$jscoverage['/editor/range.js'].lineData[1762]++;
  parent = $(parent);
  _$jscoverage['/editor/range.js'].lineData[1763]++;
  el = $(el);
  _$jscoverage['/editor/range.js'].lineData[1765]++;
  var KERange = Editor.Range, docFrag, range = new KERange(el[0].ownerDocument);
  _$jscoverage['/editor/range.js'].lineData[1771]++;
  range.setStartAfter(el);
  _$jscoverage['/editor/range.js'].lineData[1772]++;
  range.setEndAfter(parent);
  _$jscoverage['/editor/range.js'].lineData[1775]++;
  docFrag = range.extractContents();
  _$jscoverage['/editor/range.js'].lineData[1778]++;
  range.insertNode(el.remove());
  _$jscoverage['/editor/range.js'].lineData[1781]++;
  el.after(docFrag);
}});
  _$jscoverage['/editor/range.js'].lineData[1785]++;
  Editor.Range = KERange;
  _$jscoverage['/editor/range.js'].lineData[1787]++;
  return KERange;
});
