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
if (! _$jscoverage['/editor/dom.js']) {
  _$jscoverage['/editor/dom.js'] = {};
  _$jscoverage['/editor/dom.js'].lineData = [];
  _$jscoverage['/editor/dom.js'].lineData[10] = 0;
  _$jscoverage['/editor/dom.js'].lineData[11] = 0;
  _$jscoverage['/editor/dom.js'].lineData[55] = 0;
  _$jscoverage['/editor/dom.js'].lineData[63] = 0;
  _$jscoverage['/editor/dom.js'].lineData[71] = 0;
  _$jscoverage['/editor/dom.js'].lineData[89] = 0;
  _$jscoverage['/editor/dom.js'].lineData[95] = 0;
  _$jscoverage['/editor/dom.js'].lineData[107] = 0;
  _$jscoverage['/editor/dom.js'].lineData[108] = 0;
  _$jscoverage['/editor/dom.js'].lineData[109] = 0;
  _$jscoverage['/editor/dom.js'].lineData[118] = 0;
  _$jscoverage['/editor/dom.js'].lineData[119] = 0;
  _$jscoverage['/editor/dom.js'].lineData[128] = 0;
  _$jscoverage['/editor/dom.js'].lineData[132] = 0;
  _$jscoverage['/editor/dom.js'].lineData[133] = 0;
  _$jscoverage['/editor/dom.js'].lineData[136] = 0;
  _$jscoverage['/editor/dom.js'].lineData[140] = 0;
  _$jscoverage['/editor/dom.js'].lineData[143] = 0;
  _$jscoverage['/editor/dom.js'].lineData[145] = 0;
  _$jscoverage['/editor/dom.js'].lineData[146] = 0;
  _$jscoverage['/editor/dom.js'].lineData[149] = 0;
  _$jscoverage['/editor/dom.js'].lineData[159] = 0;
  _$jscoverage['/editor/dom.js'].lineData[160] = 0;
  _$jscoverage['/editor/dom.js'].lineData[161] = 0;
  _$jscoverage['/editor/dom.js'].lineData[163] = 0;
  _$jscoverage['/editor/dom.js'].lineData[173] = 0;
  _$jscoverage['/editor/dom.js'].lineData[174] = 0;
  _$jscoverage['/editor/dom.js'].lineData[177] = 0;
  _$jscoverage['/editor/dom.js'].lineData[179] = 0;
  _$jscoverage['/editor/dom.js'].lineData[180] = 0;
  _$jscoverage['/editor/dom.js'].lineData[183] = 0;
  _$jscoverage['/editor/dom.js'].lineData[186] = 0;
  _$jscoverage['/editor/dom.js'].lineData[189] = 0;
  _$jscoverage['/editor/dom.js'].lineData[190] = 0;
  _$jscoverage['/editor/dom.js'].lineData[193] = 0;
  _$jscoverage['/editor/dom.js'].lineData[194] = 0;
  _$jscoverage['/editor/dom.js'].lineData[196] = 0;
  _$jscoverage['/editor/dom.js'].lineData[198] = 0;
  _$jscoverage['/editor/dom.js'].lineData[205] = 0;
  _$jscoverage['/editor/dom.js'].lineData[206] = 0;
  _$jscoverage['/editor/dom.js'].lineData[207] = 0;
  _$jscoverage['/editor/dom.js'].lineData[208] = 0;
  _$jscoverage['/editor/dom.js'].lineData[209] = 0;
  _$jscoverage['/editor/dom.js'].lineData[211] = 0;
  _$jscoverage['/editor/dom.js'].lineData[216] = 0;
  _$jscoverage['/editor/dom.js'].lineData[224] = 0;
  _$jscoverage['/editor/dom.js'].lineData[225] = 0;
  _$jscoverage['/editor/dom.js'].lineData[227] = 0;
  _$jscoverage['/editor/dom.js'].lineData[228] = 0;
  _$jscoverage['/editor/dom.js'].lineData[229] = 0;
  _$jscoverage['/editor/dom.js'].lineData[232] = 0;
  _$jscoverage['/editor/dom.js'].lineData[234] = 0;
  _$jscoverage['/editor/dom.js'].lineData[237] = 0;
  _$jscoverage['/editor/dom.js'].lineData[239] = 0;
  _$jscoverage['/editor/dom.js'].lineData[242] = 0;
  _$jscoverage['/editor/dom.js'].lineData[252] = 0;
  _$jscoverage['/editor/dom.js'].lineData[254] = 0;
  _$jscoverage['/editor/dom.js'].lineData[255] = 0;
  _$jscoverage['/editor/dom.js'].lineData[258] = 0;
  _$jscoverage['/editor/dom.js'].lineData[260] = 0;
  _$jscoverage['/editor/dom.js'].lineData[261] = 0;
  _$jscoverage['/editor/dom.js'].lineData[262] = 0;
  _$jscoverage['/editor/dom.js'].lineData[265] = 0;
  _$jscoverage['/editor/dom.js'].lineData[266] = 0;
  _$jscoverage['/editor/dom.js'].lineData[279] = 0;
  _$jscoverage['/editor/dom.js'].lineData[281] = 0;
  _$jscoverage['/editor/dom.js'].lineData[282] = 0;
  _$jscoverage['/editor/dom.js'].lineData[283] = 0;
  _$jscoverage['/editor/dom.js'].lineData[294] = 0;
  _$jscoverage['/editor/dom.js'].lineData[296] = 0;
  _$jscoverage['/editor/dom.js'].lineData[297] = 0;
  _$jscoverage['/editor/dom.js'].lineData[302] = 0;
  _$jscoverage['/editor/dom.js'].lineData[303] = 0;
  _$jscoverage['/editor/dom.js'].lineData[304] = 0;
  _$jscoverage['/editor/dom.js'].lineData[305] = 0;
  _$jscoverage['/editor/dom.js'].lineData[308] = 0;
  _$jscoverage['/editor/dom.js'].lineData[317] = 0;
  _$jscoverage['/editor/dom.js'].lineData[318] = 0;
  _$jscoverage['/editor/dom.js'].lineData[319] = 0;
  _$jscoverage['/editor/dom.js'].lineData[320] = 0;
  _$jscoverage['/editor/dom.js'].lineData[323] = 0;
  _$jscoverage['/editor/dom.js'].lineData[332] = 0;
  _$jscoverage['/editor/dom.js'].lineData[333] = 0;
  _$jscoverage['/editor/dom.js'].lineData[334] = 0;
  _$jscoverage['/editor/dom.js'].lineData[335] = 0;
  _$jscoverage['/editor/dom.js'].lineData[337] = 0;
  _$jscoverage['/editor/dom.js'].lineData[349] = 0;
  _$jscoverage['/editor/dom.js'].lineData[350] = 0;
  _$jscoverage['/editor/dom.js'].lineData[351] = 0;
  _$jscoverage['/editor/dom.js'].lineData[352] = 0;
  _$jscoverage['/editor/dom.js'].lineData[356] = 0;
  _$jscoverage['/editor/dom.js'].lineData[361] = 0;
  _$jscoverage['/editor/dom.js'].lineData[362] = 0;
  _$jscoverage['/editor/dom.js'].lineData[364] = 0;
  _$jscoverage['/editor/dom.js'].lineData[366] = 0;
  _$jscoverage['/editor/dom.js'].lineData[369] = 0;
  _$jscoverage['/editor/dom.js'].lineData[372] = 0;
  _$jscoverage['/editor/dom.js'].lineData[373] = 0;
  _$jscoverage['/editor/dom.js'].lineData[375] = 0;
  _$jscoverage['/editor/dom.js'].lineData[378] = 0;
  _$jscoverage['/editor/dom.js'].lineData[379] = 0;
  _$jscoverage['/editor/dom.js'].lineData[382] = 0;
  _$jscoverage['/editor/dom.js'].lineData[383] = 0;
  _$jscoverage['/editor/dom.js'].lineData[386] = 0;
  _$jscoverage['/editor/dom.js'].lineData[387] = 0;
  _$jscoverage['/editor/dom.js'].lineData[390] = 0;
  _$jscoverage['/editor/dom.js'].lineData[401] = 0;
  _$jscoverage['/editor/dom.js'].lineData[402] = 0;
  _$jscoverage['/editor/dom.js'].lineData[403] = 0;
  _$jscoverage['/editor/dom.js'].lineData[404] = 0;
  _$jscoverage['/editor/dom.js'].lineData[408] = 0;
  _$jscoverage['/editor/dom.js'].lineData[413] = 0;
  _$jscoverage['/editor/dom.js'].lineData[414] = 0;
  _$jscoverage['/editor/dom.js'].lineData[416] = 0;
  _$jscoverage['/editor/dom.js'].lineData[418] = 0;
  _$jscoverage['/editor/dom.js'].lineData[421] = 0;
  _$jscoverage['/editor/dom.js'].lineData[424] = 0;
  _$jscoverage['/editor/dom.js'].lineData[425] = 0;
  _$jscoverage['/editor/dom.js'].lineData[426] = 0;
  _$jscoverage['/editor/dom.js'].lineData[429] = 0;
  _$jscoverage['/editor/dom.js'].lineData[430] = 0;
  _$jscoverage['/editor/dom.js'].lineData[433] = 0;
  _$jscoverage['/editor/dom.js'].lineData[434] = 0;
  _$jscoverage['/editor/dom.js'].lineData[437] = 0;
  _$jscoverage['/editor/dom.js'].lineData[438] = 0;
  _$jscoverage['/editor/dom.js'].lineData[441] = 0;
  _$jscoverage['/editor/dom.js'].lineData[451] = 0;
  _$jscoverage['/editor/dom.js'].lineData[453] = 0;
  _$jscoverage['/editor/dom.js'].lineData[454] = 0;
  _$jscoverage['/editor/dom.js'].lineData[457] = 0;
  _$jscoverage['/editor/dom.js'].lineData[458] = 0;
  _$jscoverage['/editor/dom.js'].lineData[461] = 0;
  _$jscoverage['/editor/dom.js'].lineData[463] = 0;
  _$jscoverage['/editor/dom.js'].lineData[464] = 0;
  _$jscoverage['/editor/dom.js'].lineData[465] = 0;
  _$jscoverage['/editor/dom.js'].lineData[469] = 0;
  _$jscoverage['/editor/dom.js'].lineData[477] = 0;
  _$jscoverage['/editor/dom.js'].lineData[478] = 0;
  _$jscoverage['/editor/dom.js'].lineData[479] = 0;
  _$jscoverage['/editor/dom.js'].lineData[480] = 0;
  _$jscoverage['/editor/dom.js'].lineData[486] = 0;
  _$jscoverage['/editor/dom.js'].lineData[487] = 0;
  _$jscoverage['/editor/dom.js'].lineData[489] = 0;
  _$jscoverage['/editor/dom.js'].lineData[491] = 0;
  _$jscoverage['/editor/dom.js'].lineData[492] = 0;
  _$jscoverage['/editor/dom.js'].lineData[496] = 0;
  _$jscoverage['/editor/dom.js'].lineData[499] = 0;
  _$jscoverage['/editor/dom.js'].lineData[500] = 0;
  _$jscoverage['/editor/dom.js'].lineData[504] = 0;
  _$jscoverage['/editor/dom.js'].lineData[517] = 0;
  _$jscoverage['/editor/dom.js'].lineData[519] = 0;
  _$jscoverage['/editor/dom.js'].lineData[520] = 0;
  _$jscoverage['/editor/dom.js'].lineData[525] = 0;
  _$jscoverage['/editor/dom.js'].lineData[526] = 0;
  _$jscoverage['/editor/dom.js'].lineData[530] = 0;
  _$jscoverage['/editor/dom.js'].lineData[532] = 0;
  _$jscoverage['/editor/dom.js'].lineData[533] = 0;
  _$jscoverage['/editor/dom.js'].lineData[536] = 0;
  _$jscoverage['/editor/dom.js'].lineData[537] = 0;
  _$jscoverage['/editor/dom.js'].lineData[540] = 0;
  _$jscoverage['/editor/dom.js'].lineData[541] = 0;
  _$jscoverage['/editor/dom.js'].lineData[551] = 0;
  _$jscoverage['/editor/dom.js'].lineData[556] = 0;
  _$jscoverage['/editor/dom.js'].lineData[557] = 0;
  _$jscoverage['/editor/dom.js'].lineData[558] = 0;
  _$jscoverage['/editor/dom.js'].lineData[564] = 0;
  _$jscoverage['/editor/dom.js'].lineData[575] = 0;
  _$jscoverage['/editor/dom.js'].lineData[579] = 0;
  _$jscoverage['/editor/dom.js'].lineData[580] = 0;
  _$jscoverage['/editor/dom.js'].lineData[581] = 0;
  _$jscoverage['/editor/dom.js'].lineData[584] = 0;
  _$jscoverage['/editor/dom.js'].lineData[593] = 0;
  _$jscoverage['/editor/dom.js'].lineData[594] = 0;
  _$jscoverage['/editor/dom.js'].lineData[595] = 0;
  _$jscoverage['/editor/dom.js'].lineData[597] = 0;
  _$jscoverage['/editor/dom.js'].lineData[598] = 0;
  _$jscoverage['/editor/dom.js'].lineData[601] = 0;
  _$jscoverage['/editor/dom.js'].lineData[603] = 0;
  _$jscoverage['/editor/dom.js'].lineData[611] = 0;
  _$jscoverage['/editor/dom.js'].lineData[612] = 0;
  _$jscoverage['/editor/dom.js'].lineData[620] = 0;
  _$jscoverage['/editor/dom.js'].lineData[621] = 0;
  _$jscoverage['/editor/dom.js'].lineData[622] = 0;
  _$jscoverage['/editor/dom.js'].lineData[623] = 0;
  _$jscoverage['/editor/dom.js'].lineData[626] = 0;
  _$jscoverage['/editor/dom.js'].lineData[627] = 0;
  _$jscoverage['/editor/dom.js'].lineData[628] = 0;
  _$jscoverage['/editor/dom.js'].lineData[630] = 0;
  _$jscoverage['/editor/dom.js'].lineData[631] = 0;
  _$jscoverage['/editor/dom.js'].lineData[633] = 0;
  _$jscoverage['/editor/dom.js'].lineData[636] = 0;
  _$jscoverage['/editor/dom.js'].lineData[645] = 0;
  _$jscoverage['/editor/dom.js'].lineData[646] = 0;
  _$jscoverage['/editor/dom.js'].lineData[647] = 0;
  _$jscoverage['/editor/dom.js'].lineData[648] = 0;
  _$jscoverage['/editor/dom.js'].lineData[650] = 0;
  _$jscoverage['/editor/dom.js'].lineData[651] = 0;
  _$jscoverage['/editor/dom.js'].lineData[652] = 0;
  _$jscoverage['/editor/dom.js'].lineData[653] = 0;
  _$jscoverage['/editor/dom.js'].lineData[654] = 0;
  _$jscoverage['/editor/dom.js'].lineData[657] = 0;
  _$jscoverage['/editor/dom.js'].lineData[660] = 0;
  _$jscoverage['/editor/dom.js'].lineData[663] = 0;
  _$jscoverage['/editor/dom.js'].lineData[664] = 0;
  _$jscoverage['/editor/dom.js'].lineData[665] = 0;
  _$jscoverage['/editor/dom.js'].lineData[668] = 0;
  _$jscoverage['/editor/dom.js'].lineData[678] = 0;
  _$jscoverage['/editor/dom.js'].lineData[681] = 0;
  _$jscoverage['/editor/dom.js'].lineData[684] = 0;
  _$jscoverage['/editor/dom.js'].lineData[687] = 0;
  _$jscoverage['/editor/dom.js'].lineData[690] = 0;
  _$jscoverage['/editor/dom.js'].lineData[696] = 0;
  _$jscoverage['/editor/dom.js'].lineData[708] = 0;
  _$jscoverage['/editor/dom.js'].lineData[709] = 0;
  _$jscoverage['/editor/dom.js'].lineData[713] = 0;
  _$jscoverage['/editor/dom.js'].lineData[714] = 0;
  _$jscoverage['/editor/dom.js'].lineData[715] = 0;
  _$jscoverage['/editor/dom.js'].lineData[725] = 0;
  _$jscoverage['/editor/dom.js'].lineData[726] = 0;
  _$jscoverage['/editor/dom.js'].lineData[728] = 0;
  _$jscoverage['/editor/dom.js'].lineData[729] = 0;
  _$jscoverage['/editor/dom.js'].lineData[731] = 0;
  _$jscoverage['/editor/dom.js'].lineData[732] = 0;
  _$jscoverage['/editor/dom.js'].lineData[733] = 0;
  _$jscoverage['/editor/dom.js'].lineData[734] = 0;
  _$jscoverage['/editor/dom.js'].lineData[745] = 0;
  _$jscoverage['/editor/dom.js'].lineData[746] = 0;
  _$jscoverage['/editor/dom.js'].lineData[747] = 0;
  _$jscoverage['/editor/dom.js'].lineData[749] = 0;
  _$jscoverage['/editor/dom.js'].lineData[752] = 0;
  _$jscoverage['/editor/dom.js'].lineData[757] = 0;
  _$jscoverage['/editor/dom.js'].lineData[758] = 0;
  _$jscoverage['/editor/dom.js'].lineData[761] = 0;
  _$jscoverage['/editor/dom.js'].lineData[762] = 0;
  _$jscoverage['/editor/dom.js'].lineData[765] = 0;
  _$jscoverage['/editor/dom.js'].lineData[767] = 0;
  _$jscoverage['/editor/dom.js'].lineData[768] = 0;
  _$jscoverage['/editor/dom.js'].lineData[769] = 0;
  _$jscoverage['/editor/dom.js'].lineData[771] = 0;
  _$jscoverage['/editor/dom.js'].lineData[776] = 0;
  _$jscoverage['/editor/dom.js'].lineData[777] = 0;
  _$jscoverage['/editor/dom.js'].lineData[787] = 0;
  _$jscoverage['/editor/dom.js'].lineData[791] = 0;
  _$jscoverage['/editor/dom.js'].lineData[802] = 0;
  _$jscoverage['/editor/dom.js'].lineData[804] = 0;
  _$jscoverage['/editor/dom.js'].lineData[805] = 0;
  _$jscoverage['/editor/dom.js'].lineData[807] = 0;
  _$jscoverage['/editor/dom.js'].lineData[808] = 0;
  _$jscoverage['/editor/dom.js'].lineData[809] = 0;
  _$jscoverage['/editor/dom.js'].lineData[812] = 0;
  _$jscoverage['/editor/dom.js'].lineData[814] = 0;
  _$jscoverage['/editor/dom.js'].lineData[815] = 0;
  _$jscoverage['/editor/dom.js'].lineData[817] = 0;
  _$jscoverage['/editor/dom.js'].lineData[821] = 0;
  _$jscoverage['/editor/dom.js'].lineData[824] = 0;
  _$jscoverage['/editor/dom.js'].lineData[826] = 0;
  _$jscoverage['/editor/dom.js'].lineData[827] = 0;
  _$jscoverage['/editor/dom.js'].lineData[828] = 0;
  _$jscoverage['/editor/dom.js'].lineData[833] = 0;
  _$jscoverage['/editor/dom.js'].lineData[838] = 0;
  _$jscoverage['/editor/dom.js'].lineData[839] = 0;
  _$jscoverage['/editor/dom.js'].lineData[841] = 0;
  _$jscoverage['/editor/dom.js'].lineData[845] = 0;
  _$jscoverage['/editor/dom.js'].lineData[847] = 0;
  _$jscoverage['/editor/dom.js'].lineData[848] = 0;
  _$jscoverage['/editor/dom.js'].lineData[849] = 0;
  _$jscoverage['/editor/dom.js'].lineData[850] = 0;
  _$jscoverage['/editor/dom.js'].lineData[851] = 0;
  _$jscoverage['/editor/dom.js'].lineData[855] = 0;
  _$jscoverage['/editor/dom.js'].lineData[858] = 0;
  _$jscoverage['/editor/dom.js'].lineData[861] = 0;
  _$jscoverage['/editor/dom.js'].lineData[862] = 0;
  _$jscoverage['/editor/dom.js'].lineData[865] = 0;
  _$jscoverage['/editor/dom.js'].lineData[866] = 0;
  _$jscoverage['/editor/dom.js'].lineData[869] = 0;
  _$jscoverage['/editor/dom.js'].lineData[870] = 0;
  _$jscoverage['/editor/dom.js'].lineData[876] = 0;
}
if (! _$jscoverage['/editor/dom.js'].functionData) {
  _$jscoverage['/editor/dom.js'].functionData = [];
  _$jscoverage['/editor/dom.js'].functionData[0] = 0;
  _$jscoverage['/editor/dom.js'].functionData[1] = 0;
  _$jscoverage['/editor/dom.js'].functionData[2] = 0;
  _$jscoverage['/editor/dom.js'].functionData[3] = 0;
  _$jscoverage['/editor/dom.js'].functionData[4] = 0;
  _$jscoverage['/editor/dom.js'].functionData[5] = 0;
  _$jscoverage['/editor/dom.js'].functionData[6] = 0;
  _$jscoverage['/editor/dom.js'].functionData[7] = 0;
  _$jscoverage['/editor/dom.js'].functionData[8] = 0;
  _$jscoverage['/editor/dom.js'].functionData[9] = 0;
  _$jscoverage['/editor/dom.js'].functionData[10] = 0;
  _$jscoverage['/editor/dom.js'].functionData[11] = 0;
  _$jscoverage['/editor/dom.js'].functionData[12] = 0;
  _$jscoverage['/editor/dom.js'].functionData[13] = 0;
  _$jscoverage['/editor/dom.js'].functionData[14] = 0;
  _$jscoverage['/editor/dom.js'].functionData[15] = 0;
  _$jscoverage['/editor/dom.js'].functionData[16] = 0;
  _$jscoverage['/editor/dom.js'].functionData[17] = 0;
  _$jscoverage['/editor/dom.js'].functionData[18] = 0;
  _$jscoverage['/editor/dom.js'].functionData[19] = 0;
  _$jscoverage['/editor/dom.js'].functionData[20] = 0;
  _$jscoverage['/editor/dom.js'].functionData[21] = 0;
  _$jscoverage['/editor/dom.js'].functionData[22] = 0;
  _$jscoverage['/editor/dom.js'].functionData[23] = 0;
  _$jscoverage['/editor/dom.js'].functionData[24] = 0;
  _$jscoverage['/editor/dom.js'].functionData[25] = 0;
  _$jscoverage['/editor/dom.js'].functionData[26] = 0;
  _$jscoverage['/editor/dom.js'].functionData[27] = 0;
  _$jscoverage['/editor/dom.js'].functionData[28] = 0;
  _$jscoverage['/editor/dom.js'].functionData[29] = 0;
  _$jscoverage['/editor/dom.js'].functionData[30] = 0;
  _$jscoverage['/editor/dom.js'].functionData[31] = 0;
  _$jscoverage['/editor/dom.js'].functionData[32] = 0;
}
if (! _$jscoverage['/editor/dom.js'].branchData) {
  _$jscoverage['/editor/dom.js'].branchData = {};
  _$jscoverage['/editor/dom.js'].branchData['89'] = [];
  _$jscoverage['/editor/dom.js'].branchData['89'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['89'][2] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['109'] = [];
  _$jscoverage['/editor/dom.js'].branchData['109'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['109'][2] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['119'] = [];
  _$jscoverage['/editor/dom.js'].branchData['119'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['132'] = [];
  _$jscoverage['/editor/dom.js'].branchData['132'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['136'] = [];
  _$jscoverage['/editor/dom.js'].branchData['136'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['137'] = [];
  _$jscoverage['/editor/dom.js'].branchData['137'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['137'][2] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['138'] = [];
  _$jscoverage['/editor/dom.js'].branchData['138'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['139'] = [];
  _$jscoverage['/editor/dom.js'].branchData['139'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['145'] = [];
  _$jscoverage['/editor/dom.js'].branchData['145'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['160'] = [];
  _$jscoverage['/editor/dom.js'].branchData['160'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['173'] = [];
  _$jscoverage['/editor/dom.js'].branchData['173'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['179'] = [];
  _$jscoverage['/editor/dom.js'].branchData['179'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['189'] = [];
  _$jscoverage['/editor/dom.js'].branchData['189'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['193'] = [];
  _$jscoverage['/editor/dom.js'].branchData['193'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['196'] = [];
  _$jscoverage['/editor/dom.js'].branchData['196'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['197'] = [];
  _$jscoverage['/editor/dom.js'].branchData['197'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['205'] = [];
  _$jscoverage['/editor/dom.js'].branchData['205'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['206'] = [];
  _$jscoverage['/editor/dom.js'].branchData['206'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['209'] = [];
  _$jscoverage['/editor/dom.js'].branchData['209'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['210'] = [];
  _$jscoverage['/editor/dom.js'].branchData['210'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['224'] = [];
  _$jscoverage['/editor/dom.js'].branchData['224'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['228'] = [];
  _$jscoverage['/editor/dom.js'].branchData['228'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['232'] = [];
  _$jscoverage['/editor/dom.js'].branchData['232'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['232'][2] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['237'] = [];
  _$jscoverage['/editor/dom.js'].branchData['237'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['237'][2] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['237'][3] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['238'] = [];
  _$jscoverage['/editor/dom.js'].branchData['238'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['238'][2] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['254'] = [];
  _$jscoverage['/editor/dom.js'].branchData['254'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['260'] = [];
  _$jscoverage['/editor/dom.js'].branchData['260'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['281'] = [];
  _$jscoverage['/editor/dom.js'].branchData['281'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['296'] = [];
  _$jscoverage['/editor/dom.js'].branchData['296'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['302'] = [];
  _$jscoverage['/editor/dom.js'].branchData['302'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['302'][2] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['317'] = [];
  _$jscoverage['/editor/dom.js'].branchData['317'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['349'] = [];
  _$jscoverage['/editor/dom.js'].branchData['349'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['352'] = [];
  _$jscoverage['/editor/dom.js'].branchData['352'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['356'] = [];
  _$jscoverage['/editor/dom.js'].branchData['356'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['361'] = [];
  _$jscoverage['/editor/dom.js'].branchData['361'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['362'] = [];
  _$jscoverage['/editor/dom.js'].branchData['362'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['362'][2] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['363'] = [];
  _$jscoverage['/editor/dom.js'].branchData['363'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['363'][2] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['369'] = [];
  _$jscoverage['/editor/dom.js'].branchData['369'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['372'] = [];
  _$jscoverage['/editor/dom.js'].branchData['372'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['372'][2] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['378'] = [];
  _$jscoverage['/editor/dom.js'].branchData['378'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['382'] = [];
  _$jscoverage['/editor/dom.js'].branchData['382'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['382'][2] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['386'] = [];
  _$jscoverage['/editor/dom.js'].branchData['386'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['386'][2] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['401'] = [];
  _$jscoverage['/editor/dom.js'].branchData['401'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['404'] = [];
  _$jscoverage['/editor/dom.js'].branchData['404'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['408'] = [];
  _$jscoverage['/editor/dom.js'].branchData['408'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['413'] = [];
  _$jscoverage['/editor/dom.js'].branchData['413'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['414'] = [];
  _$jscoverage['/editor/dom.js'].branchData['414'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['414'][2] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['415'] = [];
  _$jscoverage['/editor/dom.js'].branchData['415'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['415'][2] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['421'] = [];
  _$jscoverage['/editor/dom.js'].branchData['421'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['424'] = [];
  _$jscoverage['/editor/dom.js'].branchData['424'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['424'][2] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['429'] = [];
  _$jscoverage['/editor/dom.js'].branchData['429'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['433'] = [];
  _$jscoverage['/editor/dom.js'].branchData['433'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['433'][2] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['437'] = [];
  _$jscoverage['/editor/dom.js'].branchData['437'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['437'][2] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['453'] = [];
  _$jscoverage['/editor/dom.js'].branchData['453'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['457'] = [];
  _$jscoverage['/editor/dom.js'].branchData['457'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['464'] = [];
  _$jscoverage['/editor/dom.js'].branchData['464'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['475'] = [];
  _$jscoverage['/editor/dom.js'].branchData['475'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['478'] = [];
  _$jscoverage['/editor/dom.js'].branchData['478'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['486'] = [];
  _$jscoverage['/editor/dom.js'].branchData['486'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['491'] = [];
  _$jscoverage['/editor/dom.js'].branchData['491'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['499'] = [];
  _$jscoverage['/editor/dom.js'].branchData['499'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['519'] = [];
  _$jscoverage['/editor/dom.js'].branchData['519'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['525'] = [];
  _$jscoverage['/editor/dom.js'].branchData['525'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['530'] = [];
  _$jscoverage['/editor/dom.js'].branchData['530'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['530'][2] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['531'] = [];
  _$jscoverage['/editor/dom.js'].branchData['531'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['532'] = [];
  _$jscoverage['/editor/dom.js'].branchData['532'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['536'] = [];
  _$jscoverage['/editor/dom.js'].branchData['536'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['540'] = [];
  _$jscoverage['/editor/dom.js'].branchData['540'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['541'] = [];
  _$jscoverage['/editor/dom.js'].branchData['541'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['541'][2] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['541'][3] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['543'] = [];
  _$jscoverage['/editor/dom.js'].branchData['543'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['556'] = [];
  _$jscoverage['/editor/dom.js'].branchData['556'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['557'] = [];
  _$jscoverage['/editor/dom.js'].branchData['557'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['558'] = [];
  _$jscoverage['/editor/dom.js'].branchData['558'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['564'] = [];
  _$jscoverage['/editor/dom.js'].branchData['564'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['579'] = [];
  _$jscoverage['/editor/dom.js'].branchData['579'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['579'][2] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['594'] = [];
  _$jscoverage['/editor/dom.js'].branchData['594'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['595'] = [];
  _$jscoverage['/editor/dom.js'].branchData['595'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['622'] = [];
  _$jscoverage['/editor/dom.js'].branchData['622'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['626'] = [];
  _$jscoverage['/editor/dom.js'].branchData['626'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['630'] = [];
  _$jscoverage['/editor/dom.js'].branchData['630'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['647'] = [];
  _$jscoverage['/editor/dom.js'].branchData['647'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['650'] = [];
  _$jscoverage['/editor/dom.js'].branchData['650'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['653'] = [];
  _$jscoverage['/editor/dom.js'].branchData['653'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['663'] = [];
  _$jscoverage['/editor/dom.js'].branchData['663'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['665'] = [];
  _$jscoverage['/editor/dom.js'].branchData['665'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['666'] = [];
  _$jscoverage['/editor/dom.js'].branchData['666'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['666'][2] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['667'] = [];
  _$jscoverage['/editor/dom.js'].branchData['667'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['681'] = [];
  _$jscoverage['/editor/dom.js'].branchData['681'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['682'] = [];
  _$jscoverage['/editor/dom.js'].branchData['682'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['682'][2] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['687'] = [];
  _$jscoverage['/editor/dom.js'].branchData['687'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['688'] = [];
  _$jscoverage['/editor/dom.js'].branchData['688'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['688'][2] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['689'] = [];
  _$jscoverage['/editor/dom.js'].branchData['689'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['709'] = [];
  _$jscoverage['/editor/dom.js'].branchData['709'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['711'] = [];
  _$jscoverage['/editor/dom.js'].branchData['711'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['732'] = [];
  _$jscoverage['/editor/dom.js'].branchData['732'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['747'] = [];
  _$jscoverage['/editor/dom.js'].branchData['747'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['749'] = [];
  _$jscoverage['/editor/dom.js'].branchData['749'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['757'] = [];
  _$jscoverage['/editor/dom.js'].branchData['757'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['761'] = [];
  _$jscoverage['/editor/dom.js'].branchData['761'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['761'][2] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['765'] = [];
  _$jscoverage['/editor/dom.js'].branchData['765'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['766'] = [];
  _$jscoverage['/editor/dom.js'].branchData['766'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['766'][2] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['766'][3] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['768'] = [];
  _$jscoverage['/editor/dom.js'].branchData['768'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['776'] = [];
  _$jscoverage['/editor/dom.js'].branchData['776'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['788'] = [];
  _$jscoverage['/editor/dom.js'].branchData['788'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['789'] = [];
  _$jscoverage['/editor/dom.js'].branchData['789'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['791'] = [];
  _$jscoverage['/editor/dom.js'].branchData['791'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['804'] = [];
  _$jscoverage['/editor/dom.js'].branchData['804'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['804'][2] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['807'] = [];
  _$jscoverage['/editor/dom.js'].branchData['807'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['814'] = [];
  _$jscoverage['/editor/dom.js'].branchData['814'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['817'] = [];
  _$jscoverage['/editor/dom.js'].branchData['817'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['817'][2] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['818'] = [];
  _$jscoverage['/editor/dom.js'].branchData['818'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['818'][2] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['819'] = [];
  _$jscoverage['/editor/dom.js'].branchData['819'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['820'] = [];
  _$jscoverage['/editor/dom.js'].branchData['820'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['826'] = [];
  _$jscoverage['/editor/dom.js'].branchData['826'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['841'] = [];
  _$jscoverage['/editor/dom.js'].branchData['841'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['841'][2] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['847'] = [];
  _$jscoverage['/editor/dom.js'].branchData['847'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['850'] = [];
  _$jscoverage['/editor/dom.js'].branchData['850'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['855'] = [];
  _$jscoverage['/editor/dom.js'].branchData['855'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['869'] = [];
  _$jscoverage['/editor/dom.js'].branchData['869'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['869'][2] = new BranchData();
}
_$jscoverage['/editor/dom.js'].branchData['869'][2].init(696, 49, 'innerSibling[0].nodeType == NodeType.ELEMENT_NODE');
function visit208_869_2(result) {
  _$jscoverage['/editor/dom.js'].branchData['869'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['869'][1].init(677, 68, 'innerSibling[0] && innerSibling[0].nodeType == NodeType.ELEMENT_NODE');
function visit207_869_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['869'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['855'][1].init(543, 43, 'element._4e_isIdentical(sibling, undefined)');
function visit206_855_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['855'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['850'][1].init(160, 8, '!sibling');
function visit205_850_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['850'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['847'][1].init(209, 77, 'sibling.attr(\'_ke_bookmark\') || sibling._4e_isEmptyInlineRemovable(undefined)');
function visit204_847_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['847'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['841'][2].init(99, 44, 'sibling[0].nodeType == NodeType.ELEMENT_NODE');
function visit203_841_2(result) {
  _$jscoverage['/editor/dom.js'].branchData['841'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['841'][1].init(88, 55, 'sibling && sibling[0].nodeType == NodeType.ELEMENT_NODE');
function visit202_841_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['841'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['826'][1].init(441, 22, 'currentIndex == target');
function visit201_826_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['826'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['820'][1].init(57, 39, 'candidate.previousSibling.nodeType == 3');
function visit200_820_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['820'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['819'][1].init(55, 97, 'candidate.previousSibling && candidate.previousSibling.nodeType == 3');
function visit199_819_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['819'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['818'][2].init(146, 23, 'candidate.nodeType == 3');
function visit198_818_2(result) {
  _$jscoverage['/editor/dom.js'].branchData['818'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['818'][1].init(51, 153, 'candidate.nodeType == 3 && candidate.previousSibling && candidate.previousSibling.nodeType == 3');
function visit197_818_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['818'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['817'][2].init(92, 19, 'normalized === TRUE');
function visit196_817_2(result) {
  _$jscoverage['/editor/dom.js'].branchData['817'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['817'][1].init(92, 205, 'normalized === TRUE && candidate.nodeType == 3 && candidate.previousSibling && candidate.previousSibling.nodeType == 3');
function visit195_817_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['817'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['814'][1].init(287, 23, 'j < $.childNodes.length');
function visit194_814_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['814'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['807'][1].init(76, 11, '!normalized');
function visit193_807_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['807'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['804'][2].init(87, 18, 'i < address.length');
function visit192_804_2(result) {
  _$jscoverage['/editor/dom.js'].branchData['804'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['804'][1].init(82, 23, '$ && i < address.length');
function visit191_804_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['804'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['791'][1].init(330, 19, 'dtd && dtd[\'#text\']');
function visit190_791_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['791'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['789'][1].init(61, 38, 'xhtml_dtd[name] || xhtml_dtd["span"]');
function visit189_789_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['789'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['788'][1].init(55, 102, '!xhtml_dtd.$nonEditable[name] && (xhtml_dtd[name] || xhtml_dtd["span"])');
function visit188_788_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['788'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['776'][1].init(1474, 23, 'el.style.cssText !== \'\'');
function visit187_776_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['776'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['768'][1].init(91, 18, 'attrValue === NULL');
function visit186_768_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['768'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['766'][3].init(80, 19, 'attrName == \'value\'');
function visit185_766_3(result) {
  _$jscoverage['/editor/dom.js'].branchData['766'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['766'][2].init(61, 38, 'attribute.value && attrName == \'value\'');
function visit184_766_2(result) {
  _$jscoverage['/editor/dom.js'].branchData['766'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['766'][1].init(49, 50, 'UA[\'ie\'] && attribute.value && attrName == \'value\'');
function visit183_766_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['766'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['765'][1].init(799, 102, 'attribute.specified || (UA[\'ie\'] && attribute.value && attrName == \'value\')');
function visit182_765_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['765'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['761'][2].init(533, 21, 'attrName == \'checked\'');
function visit181_761_2(result) {
  _$jscoverage['/editor/dom.js'].branchData['761'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['761'][1].init(533, 63, 'attrName == \'checked\' && (attrValue = Dom.attr(el, attrName))');
function visit180_761_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['761'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['757'][1].init(418, 26, 'attrName in skipAttributes');
function visit179_757_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['757'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['749'][1].init(185, 21, 'n < attributes.length');
function visit178_749_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['749'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['747'][1].init(128, 20, 'skipAttributes || {}');
function visit177_747_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['747'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['732'][1].init(351, 18, 'removeFromDatabase');
function visit176_732_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['732'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['711'][1].init(170, 128, 'element.data(\'list_marker_names\') || (element.data(\'list_marker_names\', {}).data(\'list_marker_names\'))');
function visit175_711_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['711'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['709'][1].init(73, 125, 'element.data(\'list_marker_id\') || (element.data(\'list_marker_id\', S.guid()).data(\'list_marker_id\'))');
function visit174_709_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['709'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['689'][1].init(68, 32, 'Dom.nodeName(lastChild) !== \'br\'');
function visit173_689_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['689'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['688'][2].init(401, 44, 'lastChild.nodeType == Dom.NodeType.TEXT_NODE');
function visit172_688_2(result) {
  _$jscoverage['/editor/dom.js'].branchData['688'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['688'][1].init(34, 101, 'lastChild.nodeType == Dom.NodeType.TEXT_NODE || Dom.nodeName(lastChild) !== \'br\'');
function visit171_688_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['688'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['687'][1].init(364, 136, '!lastChild || lastChild.nodeType == Dom.NodeType.TEXT_NODE || Dom.nodeName(lastChild) !== \'br\'');
function visit170_687_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['687'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['682'][2].init(163, 44, 'lastChild.nodeType == Dom.NodeType.TEXT_NODE');
function visit169_682_2(result) {
  _$jscoverage['/editor/dom.js'].branchData['682'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['682'][1].init(33, 97, 'lastChild.nodeType == Dom.NodeType.TEXT_NODE && !S.trim(lastChild.nodeValue)');
function visit168_682_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['682'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['681'][1].init(127, 131, 'lastChild && lastChild.nodeType == Dom.NodeType.TEXT_NODE && !S.trim(lastChild.nodeValue)');
function visit167_681_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['681'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['667'][1].init(47, 27, 'Dom.nodeName(child) == \'br\'');
function visit166_667_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['667'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['666'][2].init(105, 19, 'child.nodeType == 1');
function visit165_666_2(result) {
  _$jscoverage['/editor/dom.js'].branchData['666'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['666'][1].init(33, 75, 'child.nodeType == 1 && Dom.nodeName(child) == \'br\'');
function visit164_666_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['666'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['665'][1].init(69, 109, 'child && child.nodeType == 1 && Dom.nodeName(child) == \'br\'');
function visit163_665_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['665'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['663'][1].init(871, 22, '!UA[\'ie\'] && !UA.opera');
function visit162_663_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['663'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['653'][1].init(309, 31, 'trimmed.length < originalLength');
function visit161_653_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['653'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['650'][1].init(169, 8, '!trimmed');
function visit160_650_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['650'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['647'][1].init(26, 36, 'child.type == Dom.NodeType.TEXT_NODE');
function visit159_647_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['647'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['630'][1].init(336, 31, 'trimmed.length < originalLength');
function visit158_630_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['630'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['626'][1].init(171, 8, '!trimmed');
function visit157_626_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['626'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['622'][1].init(26, 40, 'child.nodeType == Dom.NodeType.TEXT_NODE');
function visit156_622_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['622'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['595'][1].init(26, 16, 'preserveChildren');
function visit155_595_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['595'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['594'][1].init(67, 6, 'parent');
function visit154_594_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['594'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['579'][2].init(176, 24, 'node != $documentElement');
function visit153_579_2(result) {
  _$jscoverage['/editor/dom.js'].branchData['579'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['579'][1].init(168, 32, 'node && node != $documentElement');
function visit152_579_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['579'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['564'][1].init(2157, 44, 'addressOfThis.length < addressOfOther.length');
function visit151_564_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['564'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['558'][1].init(33, 40, 'addressOfThis[i] < addressOfOther[i]');
function visit150_558_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['558'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['557'][1].init(26, 41, 'addressOfThis[i] != addressOfOther[i]');
function visit149_557_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['557'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['556'][1].init(1773, 17, 'i <= minLevel - 1');
function visit148_556_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['556'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['543'][1].init(136, 35, 'el.sourceIndex < $other.sourceIndex');
function visit147_543_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['543'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['541'][3].init(57, 22, '$other.sourceIndex < 0');
function visit146_541_3(result) {
  _$jscoverage['/editor/dom.js'].branchData['541'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['541'][2].init(35, 18, 'el.sourceIndex < 0');
function visit145_541_2(result) {
  _$jscoverage['/editor/dom.js'].branchData['541'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['541'][1].init(35, 44, 'el.sourceIndex < 0 || $other.sourceIndex < 0');
function visit144_541_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['541'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['540'][1].init(346, 19, '\'sourceIndex\' in el');
function visit143_540_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['540'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['536'][1].init(184, 24, 'Dom.contains($other, el)');
function visit142_536_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['536'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['532'][1].init(26, 24, 'Dom.contains(el, $other)');
function visit141_532_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['532'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['531'][1].init(60, 40, '$other.nodeType == NodeType.ELEMENT_NODE');
function visit140_531_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['531'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['530'][2].init(478, 36, 'el.nodeType == NodeType.ELEMENT_NODE');
function visit139_530_2(result) {
  _$jscoverage['/editor/dom.js'].branchData['530'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['530'][1].init(478, 101, 'el.nodeType == NodeType.ELEMENT_NODE && $other.nodeType == NodeType.ELEMENT_NODE');
function visit138_530_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['530'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['525'][1].init(295, 12, 'el == $other');
function visit137_525_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['525'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['519'][1].init(78, 26, 'el.compareDocumentPosition');
function visit136_519_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['519'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['499'][1].init(59, 8, 'UA.gecko');
function visit135_499_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['499'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['491'][1].init(46, 19, 'attribute.specified');
function visit134_491_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['491'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['486'][1].init(439, 24, 'el.getAttribute(\'class\')');
function visit133_486_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['486'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['478'][1].init(91, 21, 'i < attributes.length');
function visit132_478_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['478'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['475'][1].init(13458, 18, 'Utils.ieEngine < 9');
function visit131_475_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['475'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['464'][1].init(26, 25, 'Dom.contains(start, node)');
function visit130_464_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['464'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['457'][1].init(158, 22, 'Dom.contains(node, el)');
function visit129_457_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['457'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['453'][1].init(69, 11, 'el === node');
function visit128_453_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['453'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['437'][2].init(1439, 25, 'node.nodeType != nodeType');
function visit127_437_2(result) {
  _$jscoverage['/editor/dom.js'].branchData['437'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['437'][1].init(1427, 37, 'nodeType && node.nodeType != nodeType');
function visit126_437_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['437'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['433'][2].init(1326, 21, 'guard(node) === FALSE');
function visit125_433_2(result) {
  _$jscoverage['/editor/dom.js'].branchData['433'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['433'][1].init(1317, 30, 'guard && guard(node) === FALSE');
function visit124_433_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['433'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['429'][1].init(1232, 5, '!node');
function visit123_429_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['429'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['424'][2].init(179, 29, 'guard(parent, TRUE) === FALSE');
function visit122_424_2(result) {
  _$jscoverage['/editor/dom.js'].branchData['424'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['424'][1].init(170, 38, 'guard && guard(parent, TRUE) === FALSE');
function visit121_424_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['424'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['421'][1].init(848, 39, '!node && (parent = parent.parentNode)');
function visit120_421_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['421'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['415'][2].init(102, 25, 'guard(el, TRUE) === FALSE');
function visit119_415_2(result) {
  _$jscoverage['/editor/dom.js'].branchData['415'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['415'][1].init(64, 34, 'guard && guard(el, TRUE) === FALSE');
function visit118_415_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['415'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['414'][2].init(26, 36, 'el.nodeType == NodeType.ELEMENT_NODE');
function visit117_414_2(result) {
  _$jscoverage['/editor/dom.js'].branchData['414'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['414'][1].init(26, 99, 'el.nodeType == NodeType.ELEMENT_NODE && guard && guard(el, TRUE) === FALSE');
function visit116_414_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['414'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['413'][1].init(557, 5, '!node');
function visit115_413_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['413'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['408'][1].init(275, 33, '!startFromSibling && el.lastChild');
function visit114_408_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['408'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['404'][1].init(33, 18, 'node !== guardNode');
function visit113_404_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['404'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['401'][1].init(22, 20, 'guard && !guard.call');
function visit112_401_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['401'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['386'][2].init(1527, 25, 'nodeType != node.nodeType');
function visit111_386_2(result) {
  _$jscoverage['/editor/dom.js'].branchData['386'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['386'][1].init(1515, 37, 'nodeType && nodeType != node.nodeType');
function visit110_386_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['386'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['382'][2].init(1414, 21, 'guard(node) === FALSE');
function visit109_382_2(result) {
  _$jscoverage['/editor/dom.js'].branchData['382'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['382'][1].init(1405, 30, 'guard && guard(node) === FALSE');
function visit108_382_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['382'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['378'][1].init(1320, 5, '!node');
function visit107_378_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['378'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['372'][2].init(179, 29, 'guard(parent, TRUE) === FALSE');
function visit106_372_2(result) {
  _$jscoverage['/editor/dom.js'].branchData['372'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['372'][1].init(170, 38, 'guard && guard(parent, TRUE) === FALSE');
function visit105_372_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['372'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['369'][1].init(916, 38, '!node && (parent = parent.parentNode)');
function visit104_369_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['369'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['363'][2].init(102, 25, 'guard(el, TRUE) === FALSE');
function visit103_363_2(result) {
  _$jscoverage['/editor/dom.js'].branchData['363'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['363'][1].init(64, 34, 'guard && guard(el, TRUE) === FALSE');
function visit102_363_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['363'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['362'][2].init(26, 36, 'el.nodeType == NodeType.ELEMENT_NODE');
function visit101_362_2(result) {
  _$jscoverage['/editor/dom.js'].branchData['362'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['362'][1].init(26, 99, 'el.nodeType == NodeType.ELEMENT_NODE && guard && guard(el, TRUE) === FALSE');
function visit100_362_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['362'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['361'][1].init(629, 5, '!node');
function visit99_361_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['361'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['356'][1].init(345, 34, '!startFromSibling && el.firstChild');
function visit98_356_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['356'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['352'][1].init(33, 18, 'node !== guardNode');
function visit97_352_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['352'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['349'][1].init(92, 20, 'guard && !guard.call');
function visit96_349_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['349'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['317'][1].init(1079, 20, '!!(doc.documentMode)');
function visit95_317_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['317'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['302'][2].init(397, 29, 'offset == el.nodeValue.length');
function visit94_302_2(result) {
  _$jscoverage['/editor/dom.js'].branchData['302'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['302'][1].init(385, 41, 'UA[\'ie\'] && offset == el.nodeValue.length');
function visit93_302_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['302'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['296'][1].init(69, 37, 'el.nodeType != Dom.NodeType.TEXT_NODE');
function visit92_296_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['296'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['281'][1].init(111, 36, 'REMOVE_EMPTY[thisElement.nodeName()]');
function visit91_281_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['281'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['260'][1].init(197, 7, 'toStart');
function visit90_260_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['260'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['254'][1].init(71, 21, 'thisElement == target');
function visit89_254_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['254'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['238'][2].init(417, 34, 'nodeType == Dom.NodeType.TEXT_NODE');
function visit88_238_2(result) {
  _$jscoverage['/editor/dom.js'].branchData['238'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['238'][1].init(103, 61, 'nodeType == Dom.NodeType.TEXT_NODE && S.trim(child.nodeValue)');
function visit87_238_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['238'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['237'][3].init(311, 33, 'nodeType == NodeType.ELEMENT_NODE');
function visit86_237_3(result) {
  _$jscoverage['/editor/dom.js'].branchData['237'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['237'][2].init(311, 75, 'nodeType == NodeType.ELEMENT_NODE && !Dom._4e_isEmptyInlineRemovable(child)');
function visit85_237_2(result) {
  _$jscoverage['/editor/dom.js'].branchData['237'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['237'][1].init(311, 165, 'nodeType == NodeType.ELEMENT_NODE && !Dom._4e_isEmptyInlineRemovable(child) || nodeType == Dom.NodeType.TEXT_NODE && S.trim(child.nodeValue)');
function visit84_237_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['237'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['232'][2].init(126, 33, 'nodeType == NodeType.ELEMENT_NODE');
function visit83_232_2(result) {
  _$jscoverage['/editor/dom.js'].branchData['232'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['232'][1].init(126, 96, 'nodeType == NodeType.ELEMENT_NODE && child.getAttribute(\'_ke_bookmark\')');
function visit82_232_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['232'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['228'][1].init(244, 9, 'i < count');
function visit81_228_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['228'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['224'][1].init(22, 50, '!xhtml_dtd.$removeEmpty[Dom.nodeName(thisElement)]');
function visit80_224_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['224'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['210'][1].init(51, 59, 'Dom.attr(thisElement, name) != Dom.attr(otherElement, name)');
function visit79_210_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['210'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['209'][1].init(137, 111, 'attribute.specified && Dom.attr(thisElement, name) != Dom.attr(otherElement, name)');
function visit78_209_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['209'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['206'][1].init(34, 15, 'i < otherLength');
function visit77_206_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['206'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['205'][1].init(1240, 18, 'Utils.ieEngine < 8');
function visit76_205_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['205'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['197'][1].init(47, 59, 'Dom.attr(thisElement, name) != Dom.attr(otherElement, name)');
function visit75_197_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['197'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['196'][1].init(130, 107, 'attribute.specified && Dom.attr(thisElement, name) != Dom.attr(otherElement, name)');
function visit74_196_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['196'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['193'][1].init(677, 14, 'i < thisLength');
function visit73_193_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['193'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['189'][1].init(559, 25, 'thisLength != otherLength');
function visit72_189_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['189'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['179'][1].init(177, 55, 'Dom.nodeName(thisElement) != Dom.nodeName(otherElement)');
function visit71_179_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['179'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['173'][1].init(22, 13, '!otherElement');
function visit70_173_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['173'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['160'][1].init(69, 7, 'toStart');
function visit69_160_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['160'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['145'][1].init(421, 16, 'candidate === el');
function visit68_145_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['145'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['139'][1].init(53, 39, 'candidate.previousSibling.nodeType == 3');
function visit67_139_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['139'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['138'][1].init(51, 93, 'candidate.previousSibling && candidate.previousSibling.nodeType == 3');
function visit66_138_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['138'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['137'][2].init(150, 23, 'candidate.nodeType == 3');
function visit65_137_2(result) {
  _$jscoverage['/editor/dom.js'].branchData['137'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['137'][1].init(38, 145, 'candidate.nodeType == 3 && candidate.previousSibling && candidate.previousSibling.nodeType == 3');
function visit64_137_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['137'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['136'][1].init(109, 184, 'normalized && candidate.nodeType == 3 && candidate.previousSibling && candidate.previousSibling.nodeType == 3');
function visit63_136_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['136'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['132'][1].init(166, 19, 'i < siblings.length');
function visit62_132_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['132'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['119'][1].init(121, 90, 'blockBoundaryDisplayMatch[Dom.css(el, \'display\')] || nodeNameMatches[Dom.nodeName(el)]');
function visit61_119_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['119'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['109'][2].init(116, 21, 'e1p == el2.parentNode');
function visit60_109_2(result) {
  _$jscoverage['/editor/dom.js'].branchData['109'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['109'][1].init(109, 28, 'e1p && e1p == el2.parentNode');
function visit59_109_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['109'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['89'][2].init(28, 11, 'el[0] || el');
function visit58_89_2(result) {
  _$jscoverage['/editor/dom.js'].branchData['89'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['89'][1].init(21, 19, 'el && (el[0] || el)');
function visit57_89_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['89'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].lineData[10]++;
KISSY.add("editor/dom", function(S, Editor, Utils) {
  _$jscoverage['/editor/dom.js'].functionData[0]++;
  _$jscoverage['/editor/dom.js'].lineData[11]++;
  var TRUE = true, undefined = undefined, FALSE = false, NULL = null, xhtml_dtd = Editor.XHTML_DTD, Dom = S.DOM, NodeType = Dom.NodeType, UA = S.UA, Node = S.Node, REMOVE_EMPTY = {
  "a": 1, 
  "abbr": 1, 
  "acronym": 1, 
  "address": 1, 
  "b": 1, 
  "bdo": 1, 
  "big": 1, 
  "cite": 1, 
  "code": 1, 
  "del": 1, 
  "dfn": 1, 
  "em": 1, 
  "font": 1, 
  "i": 1, 
  "ins": 1, 
  "label": 1, 
  "kbd": 1, 
  "q": 1, 
  "s": 1, 
  "samp": 1, 
  "small": 1, 
  "span": 1, 
  "strike": 1, 
  "strong": 1, 
  "sub": 1, 
  "sup": 1, 
  "tt": 1, 
  "u": 1, 
  'var': 1};
  _$jscoverage['/editor/dom.js'].lineData[55]++;
  Editor.PositionType = {
  POSITION_IDENTICAL: 0, 
  POSITION_DISCONNECTED: 1, 
  POSITION_FOLLOWING: 2, 
  POSITION_PRECEDING: 4, 
  POSITION_IS_CONTAINED: 8, 
  POSITION_CONTAINS: 16};
  _$jscoverage['/editor/dom.js'].lineData[63]++;
  var KEP = Editor.PositionType;
  _$jscoverage['/editor/dom.js'].lineData[71]++;
  var blockBoundaryDisplayMatch = {
  "block": 1, 
  'list-item': 1, 
  "table": 1, 
  'table-row-group': 1, 
  'table-header-group': 1, 
  'table-footer-group': 1, 
  'table-row': 1, 
  'table-column-group': 1, 
  'table-column': 1, 
  'table-cell': 1, 
  'table-caption': 1}, blockBoundaryNodeNameMatch = {
  "hr": 1}, normalElDom = function(el) {
  _$jscoverage['/editor/dom.js'].functionData[1]++;
  _$jscoverage['/editor/dom.js'].lineData[89]++;
  return visit57_89_1(el && (visit58_89_2(el[0] || el)));
}, normalEl = function(el) {
  _$jscoverage['/editor/dom.js'].functionData[2]++;
  _$jscoverage['/editor/dom.js'].lineData[95]++;
  return new Node(el);
}, editorDom = {
  _4e_sameLevel: function(el1, el2) {
  _$jscoverage['/editor/dom.js'].functionData[3]++;
  _$jscoverage['/editor/dom.js'].lineData[107]++;
  el2 = normalElDom(el2);
  _$jscoverage['/editor/dom.js'].lineData[108]++;
  var e1p = el1.parentNode;
  _$jscoverage['/editor/dom.js'].lineData[109]++;
  return visit59_109_1(e1p && visit60_109_2(e1p == el2.parentNode));
}, 
  _4e_isBlockBoundary: function(el, customNodeNames) {
  _$jscoverage['/editor/dom.js'].functionData[4]++;
  _$jscoverage['/editor/dom.js'].lineData[118]++;
  var nodeNameMatches = S.merge(blockBoundaryNodeNameMatch, customNodeNames);
  _$jscoverage['/editor/dom.js'].lineData[119]++;
  return !!(visit61_119_1(blockBoundaryDisplayMatch[Dom.css(el, 'display')] || nodeNameMatches[Dom.nodeName(el)]));
}, 
  _4e_index: function(el, normalized) {
  _$jscoverage['/editor/dom.js'].functionData[5]++;
  _$jscoverage['/editor/dom.js'].lineData[128]++;
  var siblings = el.parentNode.childNodes, candidate, currentIndex = -1;
  _$jscoverage['/editor/dom.js'].lineData[132]++;
  for (var i = 0; visit62_132_1(i < siblings.length); i++) {
    _$jscoverage['/editor/dom.js'].lineData[133]++;
    candidate = siblings[i];
    _$jscoverage['/editor/dom.js'].lineData[136]++;
    if (visit63_136_1(normalized && visit64_137_1(visit65_137_2(candidate.nodeType == 3) && visit66_138_1(candidate.previousSibling && visit67_139_1(candidate.previousSibling.nodeType == 3))))) {
      _$jscoverage['/editor/dom.js'].lineData[140]++;
      continue;
    }
    _$jscoverage['/editor/dom.js'].lineData[143]++;
    currentIndex++;
    _$jscoverage['/editor/dom.js'].lineData[145]++;
    if (visit68_145_1(candidate === el)) {
      _$jscoverage['/editor/dom.js'].lineData[146]++;
      return currentIndex;
    }
  }
  _$jscoverage['/editor/dom.js'].lineData[149]++;
  return -1;
}, 
  _4e_move: function(thisElement, target, toStart) {
  _$jscoverage['/editor/dom.js'].functionData[6]++;
  _$jscoverage['/editor/dom.js'].lineData[159]++;
  target = normalElDom(target);
  _$jscoverage['/editor/dom.js'].lineData[160]++;
  if (visit69_160_1(toStart)) {
    _$jscoverage['/editor/dom.js'].lineData[161]++;
    target.insertBefore(thisElement, target.firstChild);
  } else {
    _$jscoverage['/editor/dom.js'].lineData[163]++;
    target.appendChild(thisElement);
  }
}, 
  _4e_isIdentical: function(thisElement, otherElement) {
  _$jscoverage['/editor/dom.js'].functionData[7]++;
  _$jscoverage['/editor/dom.js'].lineData[173]++;
  if (visit70_173_1(!otherElement)) {
    _$jscoverage['/editor/dom.js'].lineData[174]++;
    return FALSE;
  }
  _$jscoverage['/editor/dom.js'].lineData[177]++;
  otherElement = normalElDom(otherElement);
  _$jscoverage['/editor/dom.js'].lineData[179]++;
  if (visit71_179_1(Dom.nodeName(thisElement) != Dom.nodeName(otherElement))) {
    _$jscoverage['/editor/dom.js'].lineData[180]++;
    return FALSE;
  }
  _$jscoverage['/editor/dom.js'].lineData[183]++;
  var thisAttributes = thisElement.attributes, otherAttributes = otherElement.attributes;
  _$jscoverage['/editor/dom.js'].lineData[186]++;
  var thisLength = thisAttributes.length, otherLength = otherAttributes.length;
  _$jscoverage['/editor/dom.js'].lineData[189]++;
  if (visit72_189_1(thisLength != otherLength)) {
    _$jscoverage['/editor/dom.js'].lineData[190]++;
    return FALSE;
  }
  _$jscoverage['/editor/dom.js'].lineData[193]++;
  for (var i = 0; visit73_193_1(i < thisLength); i++) {
    _$jscoverage['/editor/dom.js'].lineData[194]++;
    var attribute = thisAttributes[i], name = attribute.name;
    _$jscoverage['/editor/dom.js'].lineData[196]++;
    if (visit74_196_1(attribute.specified && visit75_197_1(Dom.attr(thisElement, name) != Dom.attr(otherElement, name)))) {
      _$jscoverage['/editor/dom.js'].lineData[198]++;
      return FALSE;
    }
  }
  _$jscoverage['/editor/dom.js'].lineData[205]++;
  if (visit76_205_1(Utils.ieEngine < 8)) {
    _$jscoverage['/editor/dom.js'].lineData[206]++;
    for (i = 0; visit77_206_1(i < otherLength); i++) {
      _$jscoverage['/editor/dom.js'].lineData[207]++;
      attribute = otherAttributes[i];
      _$jscoverage['/editor/dom.js'].lineData[208]++;
      name = attribute.name;
      _$jscoverage['/editor/dom.js'].lineData[209]++;
      if (visit78_209_1(attribute.specified && visit79_210_1(Dom.attr(thisElement, name) != Dom.attr(otherElement, name)))) {
        _$jscoverage['/editor/dom.js'].lineData[211]++;
        return FALSE;
      }
    }
  }
  _$jscoverage['/editor/dom.js'].lineData[216]++;
  return TRUE;
}, 
  _4e_isEmptyInlineRemovable: function(thisElement) {
  _$jscoverage['/editor/dom.js'].functionData[8]++;
  _$jscoverage['/editor/dom.js'].lineData[224]++;
  if (visit80_224_1(!xhtml_dtd.$removeEmpty[Dom.nodeName(thisElement)])) {
    _$jscoverage['/editor/dom.js'].lineData[225]++;
    return false;
  }
  _$jscoverage['/editor/dom.js'].lineData[227]++;
  var children = thisElement.childNodes;
  _$jscoverage['/editor/dom.js'].lineData[228]++;
  for (var i = 0, count = children.length; visit81_228_1(i < count); i++) {
    _$jscoverage['/editor/dom.js'].lineData[229]++;
    var child = children[i], nodeType = child.nodeType;
    _$jscoverage['/editor/dom.js'].lineData[232]++;
    if (visit82_232_1(visit83_232_2(nodeType == NodeType.ELEMENT_NODE) && child.getAttribute('_ke_bookmark'))) {
      _$jscoverage['/editor/dom.js'].lineData[234]++;
      continue;
    }
    _$jscoverage['/editor/dom.js'].lineData[237]++;
    if (visit84_237_1(visit85_237_2(visit86_237_3(nodeType == NodeType.ELEMENT_NODE) && !Dom._4e_isEmptyInlineRemovable(child)) || visit87_238_1(visit88_238_2(nodeType == Dom.NodeType.TEXT_NODE) && S.trim(child.nodeValue)))) {
      _$jscoverage['/editor/dom.js'].lineData[239]++;
      return FALSE;
    }
  }
  _$jscoverage['/editor/dom.js'].lineData[242]++;
  return TRUE;
}, 
  _4e_moveChildren: function(thisElement, target, toStart) {
  _$jscoverage['/editor/dom.js'].functionData[9]++;
  _$jscoverage['/editor/dom.js'].lineData[252]++;
  target = normalElDom(target);
  _$jscoverage['/editor/dom.js'].lineData[254]++;
  if (visit89_254_1(thisElement == target)) {
    _$jscoverage['/editor/dom.js'].lineData[255]++;
    return;
  }
  _$jscoverage['/editor/dom.js'].lineData[258]++;
  var child;
  _$jscoverage['/editor/dom.js'].lineData[260]++;
  if (visit90_260_1(toStart)) {
    _$jscoverage['/editor/dom.js'].lineData[261]++;
    while (child = thisElement.lastChild) {
      _$jscoverage['/editor/dom.js'].lineData[262]++;
      target.insertBefore(thisElement.removeChild(child), target.firstChild);
    }
  } else {
    _$jscoverage['/editor/dom.js'].lineData[265]++;
    while (child = thisElement.firstChild) {
      _$jscoverage['/editor/dom.js'].lineData[266]++;
      target.appendChild(thisElement.removeChild(child));
    }
  }
}, 
  _4e_mergeSiblings: function(thisElement) {
  _$jscoverage['/editor/dom.js'].functionData[10]++;
  _$jscoverage['/editor/dom.js'].lineData[279]++;
  thisElement = normalEl(thisElement);
  _$jscoverage['/editor/dom.js'].lineData[281]++;
  if (visit91_281_1(REMOVE_EMPTY[thisElement.nodeName()])) {
    _$jscoverage['/editor/dom.js'].lineData[282]++;
    mergeElements(thisElement, TRUE);
    _$jscoverage['/editor/dom.js'].lineData[283]++;
    mergeElements(thisElement);
  }
}, 
  _4e_splitText: function(el, offset) {
  _$jscoverage['/editor/dom.js'].functionData[11]++;
  _$jscoverage['/editor/dom.js'].lineData[294]++;
  var doc = el.ownerDocument;
  _$jscoverage['/editor/dom.js'].lineData[296]++;
  if (visit92_296_1(el.nodeType != Dom.NodeType.TEXT_NODE)) {
    _$jscoverage['/editor/dom.js'].lineData[297]++;
    return;
  }
  _$jscoverage['/editor/dom.js'].lineData[302]++;
  if (visit93_302_1(UA['ie'] && visit94_302_2(offset == el.nodeValue.length))) {
    _$jscoverage['/editor/dom.js'].lineData[303]++;
    var next = doc.createTextNode("");
    _$jscoverage['/editor/dom.js'].lineData[304]++;
    Dom.insertAfter(next, el);
    _$jscoverage['/editor/dom.js'].lineData[305]++;
    return next;
  }
  _$jscoverage['/editor/dom.js'].lineData[308]++;
  var ret = el.splitText(offset);
  _$jscoverage['/editor/dom.js'].lineData[317]++;
  if (visit95_317_1(!!(doc.documentMode))) {
    _$jscoverage['/editor/dom.js'].lineData[318]++;
    var workaround = doc.createTextNode("");
    _$jscoverage['/editor/dom.js'].lineData[319]++;
    Dom.insertAfter(workaround, ret);
    _$jscoverage['/editor/dom.js'].lineData[320]++;
    Dom.remove(workaround);
  }
  _$jscoverage['/editor/dom.js'].lineData[323]++;
  return ret;
}, 
  _4e_parents: function(node, closerFirst) {
  _$jscoverage['/editor/dom.js'].functionData[12]++;
  _$jscoverage['/editor/dom.js'].lineData[332]++;
  var parents = [];
  _$jscoverage['/editor/dom.js'].lineData[333]++;
  parents.__IS_NODELIST = 1;
  _$jscoverage['/editor/dom.js'].lineData[334]++;
  do {
    _$jscoverage['/editor/dom.js'].lineData[335]++;
    parents[closerFirst ? 'push' : 'unshift'](node);
  } while (node = node.parentNode);
  _$jscoverage['/editor/dom.js'].lineData[337]++;
  return parents;
}, 
  _4e_nextSourceNode: function(el, startFromSibling, nodeType, guard) {
  _$jscoverage['/editor/dom.js'].functionData[13]++;
  _$jscoverage['/editor/dom.js'].lineData[349]++;
  if (visit96_349_1(guard && !guard.call)) {
    _$jscoverage['/editor/dom.js'].lineData[350]++;
    var guardNode = normalElDom(guard);
    _$jscoverage['/editor/dom.js'].lineData[351]++;
    guard = function(node) {
  _$jscoverage['/editor/dom.js'].functionData[14]++;
  _$jscoverage['/editor/dom.js'].lineData[352]++;
  return visit97_352_1(node !== guardNode);
};
  }
  _$jscoverage['/editor/dom.js'].lineData[356]++;
  var node = visit98_356_1(!startFromSibling && el.firstChild), parent = el;
  _$jscoverage['/editor/dom.js'].lineData[361]++;
  if (visit99_361_1(!node)) {
    _$jscoverage['/editor/dom.js'].lineData[362]++;
    if (visit100_362_1(visit101_362_2(el.nodeType == NodeType.ELEMENT_NODE) && visit102_363_1(guard && visit103_363_2(guard(el, TRUE) === FALSE)))) {
      _$jscoverage['/editor/dom.js'].lineData[364]++;
      return NULL;
    }
    _$jscoverage['/editor/dom.js'].lineData[366]++;
    node = el.nextSibling;
  }
  _$jscoverage['/editor/dom.js'].lineData[369]++;
  while (visit104_369_1(!node && (parent = parent.parentNode))) {
    _$jscoverage['/editor/dom.js'].lineData[372]++;
    if (visit105_372_1(guard && visit106_372_2(guard(parent, TRUE) === FALSE))) {
      _$jscoverage['/editor/dom.js'].lineData[373]++;
      return NULL;
    }
    _$jscoverage['/editor/dom.js'].lineData[375]++;
    node = parent.nextSibling;
  }
  _$jscoverage['/editor/dom.js'].lineData[378]++;
  if (visit107_378_1(!node)) {
    _$jscoverage['/editor/dom.js'].lineData[379]++;
    return NULL;
  }
  _$jscoverage['/editor/dom.js'].lineData[382]++;
  if (visit108_382_1(guard && visit109_382_2(guard(node) === FALSE))) {
    _$jscoverage['/editor/dom.js'].lineData[383]++;
    return NULL;
  }
  _$jscoverage['/editor/dom.js'].lineData[386]++;
  if (visit110_386_1(nodeType && visit111_386_2(nodeType != node.nodeType))) {
    _$jscoverage['/editor/dom.js'].lineData[387]++;
    return Dom._4e_nextSourceNode(node, FALSE, nodeType, guard);
  }
  _$jscoverage['/editor/dom.js'].lineData[390]++;
  return node;
}, 
  _4e_previousSourceNode: function(el, startFromSibling, nodeType, guard) {
  _$jscoverage['/editor/dom.js'].functionData[15]++;
  _$jscoverage['/editor/dom.js'].lineData[401]++;
  if (visit112_401_1(guard && !guard.call)) {
    _$jscoverage['/editor/dom.js'].lineData[402]++;
    var guardNode = normalElDom(guard);
    _$jscoverage['/editor/dom.js'].lineData[403]++;
    guard = function(node) {
  _$jscoverage['/editor/dom.js'].functionData[16]++;
  _$jscoverage['/editor/dom.js'].lineData[404]++;
  return visit113_404_1(node !== guardNode);
};
  }
  _$jscoverage['/editor/dom.js'].lineData[408]++;
  var node = visit114_408_1(!startFromSibling && el.lastChild), parent = el;
  _$jscoverage['/editor/dom.js'].lineData[413]++;
  if (visit115_413_1(!node)) {
    _$jscoverage['/editor/dom.js'].lineData[414]++;
    if (visit116_414_1(visit117_414_2(el.nodeType == NodeType.ELEMENT_NODE) && visit118_415_1(guard && visit119_415_2(guard(el, TRUE) === FALSE)))) {
      _$jscoverage['/editor/dom.js'].lineData[416]++;
      return NULL;
    }
    _$jscoverage['/editor/dom.js'].lineData[418]++;
    node = el.previousSibling;
  }
  _$jscoverage['/editor/dom.js'].lineData[421]++;
  while (visit120_421_1(!node && (parent = parent.parentNode))) {
    _$jscoverage['/editor/dom.js'].lineData[424]++;
    if (visit121_424_1(guard && visit122_424_2(guard(parent, TRUE) === FALSE))) {
      _$jscoverage['/editor/dom.js'].lineData[425]++;
      return NULL;
    }
    _$jscoverage['/editor/dom.js'].lineData[426]++;
    node = parent.previousSibling;
  }
  _$jscoverage['/editor/dom.js'].lineData[429]++;
  if (visit123_429_1(!node)) {
    _$jscoverage['/editor/dom.js'].lineData[430]++;
    return NULL;
  }
  _$jscoverage['/editor/dom.js'].lineData[433]++;
  if (visit124_433_1(guard && visit125_433_2(guard(node) === FALSE))) {
    _$jscoverage['/editor/dom.js'].lineData[434]++;
    return NULL;
  }
  _$jscoverage['/editor/dom.js'].lineData[437]++;
  if (visit126_437_1(nodeType && visit127_437_2(node.nodeType != nodeType))) {
    _$jscoverage['/editor/dom.js'].lineData[438]++;
    return Dom._4e_previousSourceNode(node, FALSE, nodeType, guard);
  }
  _$jscoverage['/editor/dom.js'].lineData[441]++;
  return node;
}, 
  _4e_commonAncestor: function(el, node) {
  _$jscoverage['/editor/dom.js'].functionData[17]++;
  _$jscoverage['/editor/dom.js'].lineData[451]++;
  node = normalElDom(node);
  _$jscoverage['/editor/dom.js'].lineData[453]++;
  if (visit128_453_1(el === node)) {
    _$jscoverage['/editor/dom.js'].lineData[454]++;
    return el;
  }
  _$jscoverage['/editor/dom.js'].lineData[457]++;
  if (visit129_457_1(Dom.contains(node, el))) {
    _$jscoverage['/editor/dom.js'].lineData[458]++;
    return node;
  }
  _$jscoverage['/editor/dom.js'].lineData[461]++;
  var start = el;
  _$jscoverage['/editor/dom.js'].lineData[463]++;
  do {
    _$jscoverage['/editor/dom.js'].lineData[464]++;
    if (visit130_464_1(Dom.contains(start, node))) {
      _$jscoverage['/editor/dom.js'].lineData[465]++;
      return start;
    }
  } while (start = start.parentNode);
  _$jscoverage['/editor/dom.js'].lineData[469]++;
  return NULL;
}, 
  _4e_hasAttributes: visit131_475_1(Utils.ieEngine < 9) ? function(el) {
  _$jscoverage['/editor/dom.js'].functionData[18]++;
  _$jscoverage['/editor/dom.js'].lineData[477]++;
  var attributes = el.attributes;
  _$jscoverage['/editor/dom.js'].lineData[478]++;
  for (var i = 0; visit132_478_1(i < attributes.length); i++) {
    _$jscoverage['/editor/dom.js'].lineData[479]++;
    var attribute = attributes[i];
    _$jscoverage['/editor/dom.js'].lineData[480]++;
    switch (attribute.name) {
      case 'class':
        _$jscoverage['/editor/dom.js'].lineData[486]++;
        if (visit133_486_1(el.getAttribute('class'))) {
          _$jscoverage['/editor/dom.js'].lineData[487]++;
          return TRUE;
        }
        _$jscoverage['/editor/dom.js'].lineData[489]++;
        break;
      default:
        _$jscoverage['/editor/dom.js'].lineData[491]++;
        if (visit134_491_1(attribute.specified)) {
          _$jscoverage['/editor/dom.js'].lineData[492]++;
          return TRUE;
        }
    }
  }
  _$jscoverage['/editor/dom.js'].lineData[496]++;
  return FALSE;
} : function(el) {
  _$jscoverage['/editor/dom.js'].functionData[19]++;
  _$jscoverage['/editor/dom.js'].lineData[499]++;
  if (visit135_499_1(UA.gecko)) {
    _$jscoverage['/editor/dom.js'].lineData[500]++;
    el.removeAttribute("_moz_dirty");
  }
  _$jscoverage['/editor/dom.js'].lineData[504]++;
  return el.hasAttributes();
}, 
  _4e_position: function(el, otherNode) {
  _$jscoverage['/editor/dom.js'].functionData[20]++;
  _$jscoverage['/editor/dom.js'].lineData[517]++;
  var $other = normalElDom(otherNode);
  _$jscoverage['/editor/dom.js'].lineData[519]++;
  if (visit136_519_1(el.compareDocumentPosition)) {
    _$jscoverage['/editor/dom.js'].lineData[520]++;
    return el.compareDocumentPosition($other);
  }
  _$jscoverage['/editor/dom.js'].lineData[525]++;
  if (visit137_525_1(el == $other)) {
    _$jscoverage['/editor/dom.js'].lineData[526]++;
    return KEP.POSITION_IDENTICAL;
  }
  _$jscoverage['/editor/dom.js'].lineData[530]++;
  if (visit138_530_1(visit139_530_2(el.nodeType == NodeType.ELEMENT_NODE) && visit140_531_1($other.nodeType == NodeType.ELEMENT_NODE))) {
    _$jscoverage['/editor/dom.js'].lineData[532]++;
    if (visit141_532_1(Dom.contains(el, $other))) {
      _$jscoverage['/editor/dom.js'].lineData[533]++;
      return KEP.POSITION_CONTAINS + KEP.POSITION_PRECEDING;
    }
    _$jscoverage['/editor/dom.js'].lineData[536]++;
    if (visit142_536_1(Dom.contains($other, el))) {
      _$jscoverage['/editor/dom.js'].lineData[537]++;
      return KEP.POSITION_IS_CONTAINED + KEP.POSITION_FOLLOWING;
    }
    _$jscoverage['/editor/dom.js'].lineData[540]++;
    if (visit143_540_1('sourceIndex' in el)) {
      _$jscoverage['/editor/dom.js'].lineData[541]++;
      return (visit144_541_1(visit145_541_2(el.sourceIndex < 0) || visit146_541_3($other.sourceIndex < 0))) ? KEP.POSITION_DISCONNECTED : (visit147_543_1(el.sourceIndex < $other.sourceIndex)) ? KEP.POSITION_PRECEDING : KEP.POSITION_FOLLOWING;
    }
  }
  _$jscoverage['/editor/dom.js'].lineData[551]++;
  var addressOfThis = Dom._4e_address(el), addressOfOther = Dom._4e_address($other), minLevel = Math.min(addressOfThis.length, addressOfOther.length);
  _$jscoverage['/editor/dom.js'].lineData[556]++;
  for (var i = 0; visit148_556_1(i <= minLevel - 1); i++) {
    _$jscoverage['/editor/dom.js'].lineData[557]++;
    if (visit149_557_1(addressOfThis[i] != addressOfOther[i])) {
      _$jscoverage['/editor/dom.js'].lineData[558]++;
      return visit150_558_1(addressOfThis[i] < addressOfOther[i]) ? KEP.POSITION_PRECEDING : KEP.POSITION_FOLLOWING;
    }
  }
  _$jscoverage['/editor/dom.js'].lineData[564]++;
  return (visit151_564_1(addressOfThis.length < addressOfOther.length)) ? KEP.POSITION_CONTAINS + KEP.POSITION_PRECEDING : KEP.POSITION_IS_CONTAINED + KEP.POSITION_FOLLOWING;
}, 
  _4e_address: function(el, normalized) {
  _$jscoverage['/editor/dom.js'].functionData[21]++;
  _$jscoverage['/editor/dom.js'].lineData[575]++;
  var address = [], $documentElement = el.ownerDocument.documentElement, node = el;
  _$jscoverage['/editor/dom.js'].lineData[579]++;
  while (visit152_579_1(node && visit153_579_2(node != $documentElement))) {
    _$jscoverage['/editor/dom.js'].lineData[580]++;
    address.unshift(Dom._4e_index(node, normalized));
    _$jscoverage['/editor/dom.js'].lineData[581]++;
    node = node.parentNode;
  }
  _$jscoverage['/editor/dom.js'].lineData[584]++;
  return address;
}, 
  _4e_remove: function(el, preserveChildren) {
  _$jscoverage['/editor/dom.js'].functionData[22]++;
  _$jscoverage['/editor/dom.js'].lineData[593]++;
  var parent = el.parentNode;
  _$jscoverage['/editor/dom.js'].lineData[594]++;
  if (visit154_594_1(parent)) {
    _$jscoverage['/editor/dom.js'].lineData[595]++;
    if (visit155_595_1(preserveChildren)) {
      _$jscoverage['/editor/dom.js'].lineData[597]++;
      for (var child; child = el.firstChild; ) {
        _$jscoverage['/editor/dom.js'].lineData[598]++;
        parent.insertBefore(el.removeChild(child), el);
      }
    }
    _$jscoverage['/editor/dom.js'].lineData[601]++;
    parent.removeChild(el);
  }
  _$jscoverage['/editor/dom.js'].lineData[603]++;
  return el;
}, 
  _4e_trim: function(el) {
  _$jscoverage['/editor/dom.js'].functionData[23]++;
  _$jscoverage['/editor/dom.js'].lineData[611]++;
  Dom._4e_ltrim(el);
  _$jscoverage['/editor/dom.js'].lineData[612]++;
  Dom._4e_rtrim(el);
}, 
  _4e_ltrim: function(el) {
  _$jscoverage['/editor/dom.js'].functionData[24]++;
  _$jscoverage['/editor/dom.js'].lineData[620]++;
  var child;
  _$jscoverage['/editor/dom.js'].lineData[621]++;
  while (child = el.firstChild) {
    _$jscoverage['/editor/dom.js'].lineData[622]++;
    if (visit156_622_1(child.nodeType == Dom.NodeType.TEXT_NODE)) {
      _$jscoverage['/editor/dom.js'].lineData[623]++;
      var trimmed = Utils.ltrim(child.nodeValue), originalLength = child.nodeValue.length;
      _$jscoverage['/editor/dom.js'].lineData[626]++;
      if (visit157_626_1(!trimmed)) {
        _$jscoverage['/editor/dom.js'].lineData[627]++;
        el.removeChild(child);
        _$jscoverage['/editor/dom.js'].lineData[628]++;
        continue;
      } else {
        _$jscoverage['/editor/dom.js'].lineData[630]++;
        if (visit158_630_1(trimmed.length < originalLength)) {
          _$jscoverage['/editor/dom.js'].lineData[631]++;
          Dom._4e_splitText(child, originalLength - trimmed.length);
          _$jscoverage['/editor/dom.js'].lineData[633]++;
          el.removeChild(el.firstChild);
        }
      }
    }
    _$jscoverage['/editor/dom.js'].lineData[636]++;
    break;
  }
}, 
  _4e_rtrim: function(el) {
  _$jscoverage['/editor/dom.js'].functionData[25]++;
  _$jscoverage['/editor/dom.js'].lineData[645]++;
  var child;
  _$jscoverage['/editor/dom.js'].lineData[646]++;
  while (child = el.lastChild) {
    _$jscoverage['/editor/dom.js'].lineData[647]++;
    if (visit159_647_1(child.type == Dom.NodeType.TEXT_NODE)) {
      _$jscoverage['/editor/dom.js'].lineData[648]++;
      var trimmed = Utils.rtrim(child.nodeValue), originalLength = child.nodeValue.length;
      _$jscoverage['/editor/dom.js'].lineData[650]++;
      if (visit160_650_1(!trimmed)) {
        _$jscoverage['/editor/dom.js'].lineData[651]++;
        el.removeChild(child);
        _$jscoverage['/editor/dom.js'].lineData[652]++;
        continue;
      } else {
        _$jscoverage['/editor/dom.js'].lineData[653]++;
        if (visit161_653_1(trimmed.length < originalLength)) {
          _$jscoverage['/editor/dom.js'].lineData[654]++;
          Dom._4e_splitText(child, trimmed.length);
          _$jscoverage['/editor/dom.js'].lineData[657]++;
          el.removeChild(el.lastChild);
        }
      }
    }
    _$jscoverage['/editor/dom.js'].lineData[660]++;
    break;
  }
  _$jscoverage['/editor/dom.js'].lineData[663]++;
  if (visit162_663_1(!UA['ie'] && !UA.opera)) {
    _$jscoverage['/editor/dom.js'].lineData[664]++;
    child = el.lastChild;
    _$jscoverage['/editor/dom.js'].lineData[665]++;
    if (visit163_665_1(child && visit164_666_1(visit165_666_2(child.nodeType == 1) && visit166_667_1(Dom.nodeName(child) == 'br')))) {
      _$jscoverage['/editor/dom.js'].lineData[668]++;
      el.removeChild(child);
    }
  }
}, 
  _4e_appendBogus: function(el) {
  _$jscoverage['/editor/dom.js'].functionData[26]++;
  _$jscoverage['/editor/dom.js'].lineData[678]++;
  var lastChild = el.lastChild, bogus;
  _$jscoverage['/editor/dom.js'].lineData[681]++;
  while (visit167_681_1(lastChild && visit168_682_1(visit169_682_2(lastChild.nodeType == Dom.NodeType.TEXT_NODE) && !S.trim(lastChild.nodeValue)))) {
    _$jscoverage['/editor/dom.js'].lineData[684]++;
    lastChild = lastChild.previousSibling;
  }
  _$jscoverage['/editor/dom.js'].lineData[687]++;
  if (visit170_687_1(!lastChild || visit171_688_1(visit172_688_2(lastChild.nodeType == Dom.NodeType.TEXT_NODE) || visit173_689_1(Dom.nodeName(lastChild) !== 'br')))) {
    _$jscoverage['/editor/dom.js'].lineData[690]++;
    bogus = UA.opera ? el.ownerDocument.createTextNode('') : el.ownerDocument.createElement('br');
    _$jscoverage['/editor/dom.js'].lineData[696]++;
    el.appendChild(bogus);
  }
}, 
  _4e_setMarker: function(element, database, name, value) {
  _$jscoverage['/editor/dom.js'].functionData[27]++;
  _$jscoverage['/editor/dom.js'].lineData[708]++;
  element = normalEl(element);
  _$jscoverage['/editor/dom.js'].lineData[709]++;
  var id = visit174_709_1(element.data('list_marker_id') || (element.data('list_marker_id', S.guid()).data('list_marker_id'))), markerNames = visit175_711_1(element.data('list_marker_names') || (element.data('list_marker_names', {}).data('list_marker_names')));
  _$jscoverage['/editor/dom.js'].lineData[713]++;
  database[id] = element;
  _$jscoverage['/editor/dom.js'].lineData[714]++;
  markerNames[name] = 1;
  _$jscoverage['/editor/dom.js'].lineData[715]++;
  return element.data(name, value);
}, 
  _4e_clearMarkers: function(element, database, removeFromDatabase) {
  _$jscoverage['/editor/dom.js'].functionData[28]++;
  _$jscoverage['/editor/dom.js'].lineData[725]++;
  element = normalEl(element);
  _$jscoverage['/editor/dom.js'].lineData[726]++;
  var names = element.data('list_marker_names'), id = element.data('list_marker_id');
  _$jscoverage['/editor/dom.js'].lineData[728]++;
  for (var i in names) {
    _$jscoverage['/editor/dom.js'].lineData[729]++;
    element.removeData(i);
  }
  _$jscoverage['/editor/dom.js'].lineData[731]++;
  element.removeData('list_marker_names');
  _$jscoverage['/editor/dom.js'].lineData[732]++;
  if (visit176_732_1(removeFromDatabase)) {
    _$jscoverage['/editor/dom.js'].lineData[733]++;
    element.removeData('list_marker_id');
    _$jscoverage['/editor/dom.js'].lineData[734]++;
    delete database[id];
  }
}, 
  _4e_copyAttributes: function(el, target, skipAttributes) {
  _$jscoverage['/editor/dom.js'].functionData[29]++;
  _$jscoverage['/editor/dom.js'].lineData[745]++;
  target = normalEl(target);
  _$jscoverage['/editor/dom.js'].lineData[746]++;
  var attributes = el.attributes;
  _$jscoverage['/editor/dom.js'].lineData[747]++;
  skipAttributes = visit177_747_1(skipAttributes || {});
  _$jscoverage['/editor/dom.js'].lineData[749]++;
  for (var n = 0; visit178_749_1(n < attributes.length); n++) {
    _$jscoverage['/editor/dom.js'].lineData[752]++;
    var attribute = attributes[n], attrName = attribute.name.toLowerCase(), attrValue;
    _$jscoverage['/editor/dom.js'].lineData[757]++;
    if (visit179_757_1(attrName in skipAttributes)) {
      _$jscoverage['/editor/dom.js'].lineData[758]++;
      continue;
    }
    _$jscoverage['/editor/dom.js'].lineData[761]++;
    if (visit180_761_1(visit181_761_2(attrName == 'checked') && (attrValue = Dom.attr(el, attrName)))) {
      _$jscoverage['/editor/dom.js'].lineData[762]++;
      target.attr(attrName, attrValue);
    } else {
      _$jscoverage['/editor/dom.js'].lineData[765]++;
      if (visit182_765_1(attribute.specified || (visit183_766_1(UA['ie'] && visit184_766_2(attribute.value && visit185_766_3(attrName == 'value')))))) {
        _$jscoverage['/editor/dom.js'].lineData[767]++;
        attrValue = Dom.attr(el, attrName);
        _$jscoverage['/editor/dom.js'].lineData[768]++;
        if (visit186_768_1(attrValue === NULL)) {
          _$jscoverage['/editor/dom.js'].lineData[769]++;
          attrValue = attribute.nodeValue;
        }
        _$jscoverage['/editor/dom.js'].lineData[771]++;
        target.attr(attrName, attrValue);
      }
    }
  }
  _$jscoverage['/editor/dom.js'].lineData[776]++;
  if (visit187_776_1(el.style.cssText !== '')) {
    _$jscoverage['/editor/dom.js'].lineData[777]++;
    target[0].style.cssText = el.style.cssText;
  }
}, 
  _4e_isEditable: function(el) {
  _$jscoverage['/editor/dom.js'].functionData[30]++;
  _$jscoverage['/editor/dom.js'].lineData[787]++;
  var name = Dom.nodeName(el), dtd = visit188_788_1(!xhtml_dtd.$nonEditable[name] && (visit189_789_1(xhtml_dtd[name] || xhtml_dtd["span"])));
  _$jscoverage['/editor/dom.js'].lineData[791]++;
  return visit190_791_1(dtd && dtd['#text']);
}, 
  _4e_getByAddress: function(doc, address, normalized) {
  _$jscoverage['/editor/dom.js'].functionData[31]++;
  _$jscoverage['/editor/dom.js'].lineData[802]++;
  var $ = doc.documentElement;
  _$jscoverage['/editor/dom.js'].lineData[804]++;
  for (var i = 0; visit191_804_1($ && visit192_804_2(i < address.length)); i++) {
    _$jscoverage['/editor/dom.js'].lineData[805]++;
    var target = address[i];
    _$jscoverage['/editor/dom.js'].lineData[807]++;
    if (visit193_807_1(!normalized)) {
      _$jscoverage['/editor/dom.js'].lineData[808]++;
      $ = $.childNodes[target];
      _$jscoverage['/editor/dom.js'].lineData[809]++;
      continue;
    }
    _$jscoverage['/editor/dom.js'].lineData[812]++;
    var currentIndex = -1;
    _$jscoverage['/editor/dom.js'].lineData[814]++;
    for (var j = 0; visit194_814_1(j < $.childNodes.length); j++) {
      _$jscoverage['/editor/dom.js'].lineData[815]++;
      var candidate = $.childNodes[j];
      _$jscoverage['/editor/dom.js'].lineData[817]++;
      if (visit195_817_1(visit196_817_2(normalized === TRUE) && visit197_818_1(visit198_818_2(candidate.nodeType == 3) && visit199_819_1(candidate.previousSibling && visit200_820_1(candidate.previousSibling.nodeType == 3))))) {
        _$jscoverage['/editor/dom.js'].lineData[821]++;
        continue;
      }
      _$jscoverage['/editor/dom.js'].lineData[824]++;
      currentIndex++;
      _$jscoverage['/editor/dom.js'].lineData[826]++;
      if (visit201_826_1(currentIndex == target)) {
        _$jscoverage['/editor/dom.js'].lineData[827]++;
        $ = candidate;
        _$jscoverage['/editor/dom.js'].lineData[828]++;
        break;
      }
    }
  }
  _$jscoverage['/editor/dom.js'].lineData[833]++;
  return $;
}};
  _$jscoverage['/editor/dom.js'].lineData[838]++;
  function mergeElements(element, isNext) {
    _$jscoverage['/editor/dom.js'].functionData[32]++;
    _$jscoverage['/editor/dom.js'].lineData[839]++;
    var sibling = element[isNext ? "next" : "prev"](undefined, 1);
    _$jscoverage['/editor/dom.js'].lineData[841]++;
    if (visit202_841_1(sibling && visit203_841_2(sibling[0].nodeType == NodeType.ELEMENT_NODE))) {
      _$jscoverage['/editor/dom.js'].lineData[845]++;
      var pendingNodes = [];
      _$jscoverage['/editor/dom.js'].lineData[847]++;
      while (visit204_847_1(sibling.attr('_ke_bookmark') || sibling._4e_isEmptyInlineRemovable(undefined))) {
        _$jscoverage['/editor/dom.js'].lineData[848]++;
        pendingNodes.push(sibling);
        _$jscoverage['/editor/dom.js'].lineData[849]++;
        sibling = isNext ? sibling.next(undefined, 1) : sibling.prev(undefined, 1);
        _$jscoverage['/editor/dom.js'].lineData[850]++;
        if (visit205_850_1(!sibling)) {
          _$jscoverage['/editor/dom.js'].lineData[851]++;
          return;
        }
      }
      _$jscoverage['/editor/dom.js'].lineData[855]++;
      if (visit206_855_1(element._4e_isIdentical(sibling, undefined))) {
        _$jscoverage['/editor/dom.js'].lineData[858]++;
        var innerSibling = new Node(isNext ? element[0].lastChild : element[0].firstChild);
        _$jscoverage['/editor/dom.js'].lineData[861]++;
        while (pendingNodes.length) {
          _$jscoverage['/editor/dom.js'].lineData[862]++;
          pendingNodes.shift()._4e_move(element, !isNext, undefined);
        }
        _$jscoverage['/editor/dom.js'].lineData[865]++;
        sibling._4e_moveChildren(element, !isNext, undefined);
        _$jscoverage['/editor/dom.js'].lineData[866]++;
        sibling.remove();
        _$jscoverage['/editor/dom.js'].lineData[869]++;
        if (visit207_869_1(innerSibling[0] && visit208_869_2(innerSibling[0].nodeType == NodeType.ELEMENT_NODE))) {
          _$jscoverage['/editor/dom.js'].lineData[870]++;
          innerSibling._4e_mergeSiblings();
        }
      }
    }
  }
  _$jscoverage['/editor/dom.js'].lineData[876]++;
  Utils.injectDom(editorDom);
}, {
  requires: ['./base', './utils', 'node']});
