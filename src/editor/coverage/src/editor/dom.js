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
  _$jscoverage['/editor/dom.js'].lineData[9] = 0;
  _$jscoverage['/editor/dom.js'].lineData[10] = 0;
  _$jscoverage['/editor/dom.js'].lineData[54] = 0;
  _$jscoverage['/editor/dom.js'].lineData[62] = 0;
  _$jscoverage['/editor/dom.js'].lineData[70] = 0;
  _$jscoverage['/editor/dom.js'].lineData[88] = 0;
  _$jscoverage['/editor/dom.js'].lineData[94] = 0;
  _$jscoverage['/editor/dom.js'].lineData[106] = 0;
  _$jscoverage['/editor/dom.js'].lineData[107] = 0;
  _$jscoverage['/editor/dom.js'].lineData[108] = 0;
  _$jscoverage['/editor/dom.js'].lineData[117] = 0;
  _$jscoverage['/editor/dom.js'].lineData[118] = 0;
  _$jscoverage['/editor/dom.js'].lineData[127] = 0;
  _$jscoverage['/editor/dom.js'].lineData[131] = 0;
  _$jscoverage['/editor/dom.js'].lineData[132] = 0;
  _$jscoverage['/editor/dom.js'].lineData[135] = 0;
  _$jscoverage['/editor/dom.js'].lineData[139] = 0;
  _$jscoverage['/editor/dom.js'].lineData[142] = 0;
  _$jscoverage['/editor/dom.js'].lineData[144] = 0;
  _$jscoverage['/editor/dom.js'].lineData[145] = 0;
  _$jscoverage['/editor/dom.js'].lineData[148] = 0;
  _$jscoverage['/editor/dom.js'].lineData[158] = 0;
  _$jscoverage['/editor/dom.js'].lineData[159] = 0;
  _$jscoverage['/editor/dom.js'].lineData[160] = 0;
  _$jscoverage['/editor/dom.js'].lineData[162] = 0;
  _$jscoverage['/editor/dom.js'].lineData[172] = 0;
  _$jscoverage['/editor/dom.js'].lineData[173] = 0;
  _$jscoverage['/editor/dom.js'].lineData[176] = 0;
  _$jscoverage['/editor/dom.js'].lineData[178] = 0;
  _$jscoverage['/editor/dom.js'].lineData[179] = 0;
  _$jscoverage['/editor/dom.js'].lineData[182] = 0;
  _$jscoverage['/editor/dom.js'].lineData[185] = 0;
  _$jscoverage['/editor/dom.js'].lineData[188] = 0;
  _$jscoverage['/editor/dom.js'].lineData[189] = 0;
  _$jscoverage['/editor/dom.js'].lineData[192] = 0;
  _$jscoverage['/editor/dom.js'].lineData[193] = 0;
  _$jscoverage['/editor/dom.js'].lineData[195] = 0;
  _$jscoverage['/editor/dom.js'].lineData[197] = 0;
  _$jscoverage['/editor/dom.js'].lineData[204] = 0;
  _$jscoverage['/editor/dom.js'].lineData[205] = 0;
  _$jscoverage['/editor/dom.js'].lineData[206] = 0;
  _$jscoverage['/editor/dom.js'].lineData[207] = 0;
  _$jscoverage['/editor/dom.js'].lineData[208] = 0;
  _$jscoverage['/editor/dom.js'].lineData[210] = 0;
  _$jscoverage['/editor/dom.js'].lineData[215] = 0;
  _$jscoverage['/editor/dom.js'].lineData[223] = 0;
  _$jscoverage['/editor/dom.js'].lineData[224] = 0;
  _$jscoverage['/editor/dom.js'].lineData[226] = 0;
  _$jscoverage['/editor/dom.js'].lineData[227] = 0;
  _$jscoverage['/editor/dom.js'].lineData[228] = 0;
  _$jscoverage['/editor/dom.js'].lineData[231] = 0;
  _$jscoverage['/editor/dom.js'].lineData[233] = 0;
  _$jscoverage['/editor/dom.js'].lineData[236] = 0;
  _$jscoverage['/editor/dom.js'].lineData[238] = 0;
  _$jscoverage['/editor/dom.js'].lineData[241] = 0;
  _$jscoverage['/editor/dom.js'].lineData[251] = 0;
  _$jscoverage['/editor/dom.js'].lineData[253] = 0;
  _$jscoverage['/editor/dom.js'].lineData[254] = 0;
  _$jscoverage['/editor/dom.js'].lineData[257] = 0;
  _$jscoverage['/editor/dom.js'].lineData[259] = 0;
  _$jscoverage['/editor/dom.js'].lineData[260] = 0;
  _$jscoverage['/editor/dom.js'].lineData[261] = 0;
  _$jscoverage['/editor/dom.js'].lineData[264] = 0;
  _$jscoverage['/editor/dom.js'].lineData[265] = 0;
  _$jscoverage['/editor/dom.js'].lineData[280] = 0;
  _$jscoverage['/editor/dom.js'].lineData[282] = 0;
  _$jscoverage['/editor/dom.js'].lineData[283] = 0;
  _$jscoverage['/editor/dom.js'].lineData[284] = 0;
  _$jscoverage['/editor/dom.js'].lineData[295] = 0;
  _$jscoverage['/editor/dom.js'].lineData[297] = 0;
  _$jscoverage['/editor/dom.js'].lineData[298] = 0;
  _$jscoverage['/editor/dom.js'].lineData[303] = 0;
  _$jscoverage['/editor/dom.js'].lineData[304] = 0;
  _$jscoverage['/editor/dom.js'].lineData[305] = 0;
  _$jscoverage['/editor/dom.js'].lineData[306] = 0;
  _$jscoverage['/editor/dom.js'].lineData[309] = 0;
  _$jscoverage['/editor/dom.js'].lineData[318] = 0;
  _$jscoverage['/editor/dom.js'].lineData[319] = 0;
  _$jscoverage['/editor/dom.js'].lineData[320] = 0;
  _$jscoverage['/editor/dom.js'].lineData[321] = 0;
  _$jscoverage['/editor/dom.js'].lineData[324] = 0;
  _$jscoverage['/editor/dom.js'].lineData[333] = 0;
  _$jscoverage['/editor/dom.js'].lineData[334] = 0;
  _$jscoverage['/editor/dom.js'].lineData[335] = 0;
  _$jscoverage['/editor/dom.js'].lineData[336] = 0;
  _$jscoverage['/editor/dom.js'].lineData[338] = 0;
  _$jscoverage['/editor/dom.js'].lineData[350] = 0;
  _$jscoverage['/editor/dom.js'].lineData[351] = 0;
  _$jscoverage['/editor/dom.js'].lineData[352] = 0;
  _$jscoverage['/editor/dom.js'].lineData[353] = 0;
  _$jscoverage['/editor/dom.js'].lineData[357] = 0;
  _$jscoverage['/editor/dom.js'].lineData[362] = 0;
  _$jscoverage['/editor/dom.js'].lineData[363] = 0;
  _$jscoverage['/editor/dom.js'].lineData[365] = 0;
  _$jscoverage['/editor/dom.js'].lineData[367] = 0;
  _$jscoverage['/editor/dom.js'].lineData[370] = 0;
  _$jscoverage['/editor/dom.js'].lineData[373] = 0;
  _$jscoverage['/editor/dom.js'].lineData[374] = 0;
  _$jscoverage['/editor/dom.js'].lineData[376] = 0;
  _$jscoverage['/editor/dom.js'].lineData[379] = 0;
  _$jscoverage['/editor/dom.js'].lineData[380] = 0;
  _$jscoverage['/editor/dom.js'].lineData[383] = 0;
  _$jscoverage['/editor/dom.js'].lineData[384] = 0;
  _$jscoverage['/editor/dom.js'].lineData[387] = 0;
  _$jscoverage['/editor/dom.js'].lineData[388] = 0;
  _$jscoverage['/editor/dom.js'].lineData[391] = 0;
  _$jscoverage['/editor/dom.js'].lineData[402] = 0;
  _$jscoverage['/editor/dom.js'].lineData[403] = 0;
  _$jscoverage['/editor/dom.js'].lineData[404] = 0;
  _$jscoverage['/editor/dom.js'].lineData[405] = 0;
  _$jscoverage['/editor/dom.js'].lineData[409] = 0;
  _$jscoverage['/editor/dom.js'].lineData[414] = 0;
  _$jscoverage['/editor/dom.js'].lineData[415] = 0;
  _$jscoverage['/editor/dom.js'].lineData[417] = 0;
  _$jscoverage['/editor/dom.js'].lineData[419] = 0;
  _$jscoverage['/editor/dom.js'].lineData[422] = 0;
  _$jscoverage['/editor/dom.js'].lineData[425] = 0;
  _$jscoverage['/editor/dom.js'].lineData[426] = 0;
  _$jscoverage['/editor/dom.js'].lineData[427] = 0;
  _$jscoverage['/editor/dom.js'].lineData[430] = 0;
  _$jscoverage['/editor/dom.js'].lineData[431] = 0;
  _$jscoverage['/editor/dom.js'].lineData[434] = 0;
  _$jscoverage['/editor/dom.js'].lineData[435] = 0;
  _$jscoverage['/editor/dom.js'].lineData[438] = 0;
  _$jscoverage['/editor/dom.js'].lineData[439] = 0;
  _$jscoverage['/editor/dom.js'].lineData[442] = 0;
  _$jscoverage['/editor/dom.js'].lineData[452] = 0;
  _$jscoverage['/editor/dom.js'].lineData[454] = 0;
  _$jscoverage['/editor/dom.js'].lineData[455] = 0;
  _$jscoverage['/editor/dom.js'].lineData[458] = 0;
  _$jscoverage['/editor/dom.js'].lineData[459] = 0;
  _$jscoverage['/editor/dom.js'].lineData[462] = 0;
  _$jscoverage['/editor/dom.js'].lineData[464] = 0;
  _$jscoverage['/editor/dom.js'].lineData[465] = 0;
  _$jscoverage['/editor/dom.js'].lineData[466] = 0;
  _$jscoverage['/editor/dom.js'].lineData[470] = 0;
  _$jscoverage['/editor/dom.js'].lineData[478] = 0;
  _$jscoverage['/editor/dom.js'].lineData[479] = 0;
  _$jscoverage['/editor/dom.js'].lineData[480] = 0;
  _$jscoverage['/editor/dom.js'].lineData[481] = 0;
  _$jscoverage['/editor/dom.js'].lineData[487] = 0;
  _$jscoverage['/editor/dom.js'].lineData[488] = 0;
  _$jscoverage['/editor/dom.js'].lineData[490] = 0;
  _$jscoverage['/editor/dom.js'].lineData[492] = 0;
  _$jscoverage['/editor/dom.js'].lineData[493] = 0;
  _$jscoverage['/editor/dom.js'].lineData[497] = 0;
  _$jscoverage['/editor/dom.js'].lineData[500] = 0;
  _$jscoverage['/editor/dom.js'].lineData[501] = 0;
  _$jscoverage['/editor/dom.js'].lineData[505] = 0;
  _$jscoverage['/editor/dom.js'].lineData[518] = 0;
  _$jscoverage['/editor/dom.js'].lineData[520] = 0;
  _$jscoverage['/editor/dom.js'].lineData[521] = 0;
  _$jscoverage['/editor/dom.js'].lineData[526] = 0;
  _$jscoverage['/editor/dom.js'].lineData[527] = 0;
  _$jscoverage['/editor/dom.js'].lineData[531] = 0;
  _$jscoverage['/editor/dom.js'].lineData[533] = 0;
  _$jscoverage['/editor/dom.js'].lineData[534] = 0;
  _$jscoverage['/editor/dom.js'].lineData[537] = 0;
  _$jscoverage['/editor/dom.js'].lineData[538] = 0;
  _$jscoverage['/editor/dom.js'].lineData[541] = 0;
  _$jscoverage['/editor/dom.js'].lineData[542] = 0;
  _$jscoverage['/editor/dom.js'].lineData[552] = 0;
  _$jscoverage['/editor/dom.js'].lineData[557] = 0;
  _$jscoverage['/editor/dom.js'].lineData[558] = 0;
  _$jscoverage['/editor/dom.js'].lineData[559] = 0;
  _$jscoverage['/editor/dom.js'].lineData[565] = 0;
  _$jscoverage['/editor/dom.js'].lineData[576] = 0;
  _$jscoverage['/editor/dom.js'].lineData[580] = 0;
  _$jscoverage['/editor/dom.js'].lineData[581] = 0;
  _$jscoverage['/editor/dom.js'].lineData[582] = 0;
  _$jscoverage['/editor/dom.js'].lineData[585] = 0;
  _$jscoverage['/editor/dom.js'].lineData[594] = 0;
  _$jscoverage['/editor/dom.js'].lineData[595] = 0;
  _$jscoverage['/editor/dom.js'].lineData[596] = 0;
  _$jscoverage['/editor/dom.js'].lineData[598] = 0;
  _$jscoverage['/editor/dom.js'].lineData[599] = 0;
  _$jscoverage['/editor/dom.js'].lineData[602] = 0;
  _$jscoverage['/editor/dom.js'].lineData[604] = 0;
  _$jscoverage['/editor/dom.js'].lineData[612] = 0;
  _$jscoverage['/editor/dom.js'].lineData[613] = 0;
  _$jscoverage['/editor/dom.js'].lineData[621] = 0;
  _$jscoverage['/editor/dom.js'].lineData[622] = 0;
  _$jscoverage['/editor/dom.js'].lineData[623] = 0;
  _$jscoverage['/editor/dom.js'].lineData[624] = 0;
  _$jscoverage['/editor/dom.js'].lineData[627] = 0;
  _$jscoverage['/editor/dom.js'].lineData[628] = 0;
  _$jscoverage['/editor/dom.js'].lineData[629] = 0;
  _$jscoverage['/editor/dom.js'].lineData[631] = 0;
  _$jscoverage['/editor/dom.js'].lineData[632] = 0;
  _$jscoverage['/editor/dom.js'].lineData[634] = 0;
  _$jscoverage['/editor/dom.js'].lineData[637] = 0;
  _$jscoverage['/editor/dom.js'].lineData[646] = 0;
  _$jscoverage['/editor/dom.js'].lineData[647] = 0;
  _$jscoverage['/editor/dom.js'].lineData[648] = 0;
  _$jscoverage['/editor/dom.js'].lineData[649] = 0;
  _$jscoverage['/editor/dom.js'].lineData[651] = 0;
  _$jscoverage['/editor/dom.js'].lineData[652] = 0;
  _$jscoverage['/editor/dom.js'].lineData[653] = 0;
  _$jscoverage['/editor/dom.js'].lineData[654] = 0;
  _$jscoverage['/editor/dom.js'].lineData[655] = 0;
  _$jscoverage['/editor/dom.js'].lineData[658] = 0;
  _$jscoverage['/editor/dom.js'].lineData[661] = 0;
  _$jscoverage['/editor/dom.js'].lineData[664] = 0;
  _$jscoverage['/editor/dom.js'].lineData[665] = 0;
  _$jscoverage['/editor/dom.js'].lineData[666] = 0;
  _$jscoverage['/editor/dom.js'].lineData[669] = 0;
  _$jscoverage['/editor/dom.js'].lineData[679] = 0;
  _$jscoverage['/editor/dom.js'].lineData[682] = 0;
  _$jscoverage['/editor/dom.js'].lineData[685] = 0;
  _$jscoverage['/editor/dom.js'].lineData[688] = 0;
  _$jscoverage['/editor/dom.js'].lineData[691] = 0;
  _$jscoverage['/editor/dom.js'].lineData[697] = 0;
  _$jscoverage['/editor/dom.js'].lineData[709] = 0;
  _$jscoverage['/editor/dom.js'].lineData[710] = 0;
  _$jscoverage['/editor/dom.js'].lineData[714] = 0;
  _$jscoverage['/editor/dom.js'].lineData[715] = 0;
  _$jscoverage['/editor/dom.js'].lineData[716] = 0;
  _$jscoverage['/editor/dom.js'].lineData[726] = 0;
  _$jscoverage['/editor/dom.js'].lineData[727] = 0;
  _$jscoverage['/editor/dom.js'].lineData[729] = 0;
  _$jscoverage['/editor/dom.js'].lineData[730] = 0;
  _$jscoverage['/editor/dom.js'].lineData[732] = 0;
  _$jscoverage['/editor/dom.js'].lineData[733] = 0;
  _$jscoverage['/editor/dom.js'].lineData[734] = 0;
  _$jscoverage['/editor/dom.js'].lineData[735] = 0;
  _$jscoverage['/editor/dom.js'].lineData[746] = 0;
  _$jscoverage['/editor/dom.js'].lineData[747] = 0;
  _$jscoverage['/editor/dom.js'].lineData[748] = 0;
  _$jscoverage['/editor/dom.js'].lineData[750] = 0;
  _$jscoverage['/editor/dom.js'].lineData[753] = 0;
  _$jscoverage['/editor/dom.js'].lineData[758] = 0;
  _$jscoverage['/editor/dom.js'].lineData[759] = 0;
  _$jscoverage['/editor/dom.js'].lineData[762] = 0;
  _$jscoverage['/editor/dom.js'].lineData[763] = 0;
  _$jscoverage['/editor/dom.js'].lineData[766] = 0;
  _$jscoverage['/editor/dom.js'].lineData[768] = 0;
  _$jscoverage['/editor/dom.js'].lineData[769] = 0;
  _$jscoverage['/editor/dom.js'].lineData[770] = 0;
  _$jscoverage['/editor/dom.js'].lineData[772] = 0;
  _$jscoverage['/editor/dom.js'].lineData[777] = 0;
  _$jscoverage['/editor/dom.js'].lineData[778] = 0;
  _$jscoverage['/editor/dom.js'].lineData[788] = 0;
  _$jscoverage['/editor/dom.js'].lineData[792] = 0;
  _$jscoverage['/editor/dom.js'].lineData[803] = 0;
  _$jscoverage['/editor/dom.js'].lineData[805] = 0;
  _$jscoverage['/editor/dom.js'].lineData[806] = 0;
  _$jscoverage['/editor/dom.js'].lineData[808] = 0;
  _$jscoverage['/editor/dom.js'].lineData[809] = 0;
  _$jscoverage['/editor/dom.js'].lineData[810] = 0;
  _$jscoverage['/editor/dom.js'].lineData[813] = 0;
  _$jscoverage['/editor/dom.js'].lineData[815] = 0;
  _$jscoverage['/editor/dom.js'].lineData[816] = 0;
  _$jscoverage['/editor/dom.js'].lineData[818] = 0;
  _$jscoverage['/editor/dom.js'].lineData[822] = 0;
  _$jscoverage['/editor/dom.js'].lineData[825] = 0;
  _$jscoverage['/editor/dom.js'].lineData[827] = 0;
  _$jscoverage['/editor/dom.js'].lineData[828] = 0;
  _$jscoverage['/editor/dom.js'].lineData[829] = 0;
  _$jscoverage['/editor/dom.js'].lineData[834] = 0;
  _$jscoverage['/editor/dom.js'].lineData[839] = 0;
  _$jscoverage['/editor/dom.js'].lineData[840] = 0;
  _$jscoverage['/editor/dom.js'].lineData[842] = 0;
  _$jscoverage['/editor/dom.js'].lineData[846] = 0;
  _$jscoverage['/editor/dom.js'].lineData[848] = 0;
  _$jscoverage['/editor/dom.js'].lineData[849] = 0;
  _$jscoverage['/editor/dom.js'].lineData[850] = 0;
  _$jscoverage['/editor/dom.js'].lineData[851] = 0;
  _$jscoverage['/editor/dom.js'].lineData[852] = 0;
  _$jscoverage['/editor/dom.js'].lineData[856] = 0;
  _$jscoverage['/editor/dom.js'].lineData[859] = 0;
  _$jscoverage['/editor/dom.js'].lineData[862] = 0;
  _$jscoverage['/editor/dom.js'].lineData[863] = 0;
  _$jscoverage['/editor/dom.js'].lineData[866] = 0;
  _$jscoverage['/editor/dom.js'].lineData[867] = 0;
  _$jscoverage['/editor/dom.js'].lineData[870] = 0;
  _$jscoverage['/editor/dom.js'].lineData[871] = 0;
  _$jscoverage['/editor/dom.js'].lineData[877] = 0;
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
  _$jscoverage['/editor/dom.js'].branchData['88'] = [];
  _$jscoverage['/editor/dom.js'].branchData['88'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['88'][2] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['108'] = [];
  _$jscoverage['/editor/dom.js'].branchData['108'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['108'][2] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['118'] = [];
  _$jscoverage['/editor/dom.js'].branchData['118'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['131'] = [];
  _$jscoverage['/editor/dom.js'].branchData['131'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['135'] = [];
  _$jscoverage['/editor/dom.js'].branchData['135'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['136'] = [];
  _$jscoverage['/editor/dom.js'].branchData['136'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['136'][2] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['137'] = [];
  _$jscoverage['/editor/dom.js'].branchData['137'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['138'] = [];
  _$jscoverage['/editor/dom.js'].branchData['138'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['144'] = [];
  _$jscoverage['/editor/dom.js'].branchData['144'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['159'] = [];
  _$jscoverage['/editor/dom.js'].branchData['159'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['172'] = [];
  _$jscoverage['/editor/dom.js'].branchData['172'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['178'] = [];
  _$jscoverage['/editor/dom.js'].branchData['178'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['188'] = [];
  _$jscoverage['/editor/dom.js'].branchData['188'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['192'] = [];
  _$jscoverage['/editor/dom.js'].branchData['192'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['195'] = [];
  _$jscoverage['/editor/dom.js'].branchData['195'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['196'] = [];
  _$jscoverage['/editor/dom.js'].branchData['196'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['204'] = [];
  _$jscoverage['/editor/dom.js'].branchData['204'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['205'] = [];
  _$jscoverage['/editor/dom.js'].branchData['205'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['208'] = [];
  _$jscoverage['/editor/dom.js'].branchData['208'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['209'] = [];
  _$jscoverage['/editor/dom.js'].branchData['209'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['223'] = [];
  _$jscoverage['/editor/dom.js'].branchData['223'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['227'] = [];
  _$jscoverage['/editor/dom.js'].branchData['227'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['231'] = [];
  _$jscoverage['/editor/dom.js'].branchData['231'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['231'][2] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['236'] = [];
  _$jscoverage['/editor/dom.js'].branchData['236'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['236'][2] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['236'][3] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['237'] = [];
  _$jscoverage['/editor/dom.js'].branchData['237'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['237'][2] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['253'] = [];
  _$jscoverage['/editor/dom.js'].branchData['253'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['259'] = [];
  _$jscoverage['/editor/dom.js'].branchData['259'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['282'] = [];
  _$jscoverage['/editor/dom.js'].branchData['282'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['297'] = [];
  _$jscoverage['/editor/dom.js'].branchData['297'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['303'] = [];
  _$jscoverage['/editor/dom.js'].branchData['303'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['303'][2] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['318'] = [];
  _$jscoverage['/editor/dom.js'].branchData['318'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['350'] = [];
  _$jscoverage['/editor/dom.js'].branchData['350'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['353'] = [];
  _$jscoverage['/editor/dom.js'].branchData['353'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['357'] = [];
  _$jscoverage['/editor/dom.js'].branchData['357'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['362'] = [];
  _$jscoverage['/editor/dom.js'].branchData['362'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['363'] = [];
  _$jscoverage['/editor/dom.js'].branchData['363'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['363'][2] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['364'] = [];
  _$jscoverage['/editor/dom.js'].branchData['364'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['364'][2] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['370'] = [];
  _$jscoverage['/editor/dom.js'].branchData['370'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['373'] = [];
  _$jscoverage['/editor/dom.js'].branchData['373'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['373'][2] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['379'] = [];
  _$jscoverage['/editor/dom.js'].branchData['379'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['383'] = [];
  _$jscoverage['/editor/dom.js'].branchData['383'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['383'][2] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['387'] = [];
  _$jscoverage['/editor/dom.js'].branchData['387'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['387'][2] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['402'] = [];
  _$jscoverage['/editor/dom.js'].branchData['402'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['405'] = [];
  _$jscoverage['/editor/dom.js'].branchData['405'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['409'] = [];
  _$jscoverage['/editor/dom.js'].branchData['409'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['414'] = [];
  _$jscoverage['/editor/dom.js'].branchData['414'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['415'] = [];
  _$jscoverage['/editor/dom.js'].branchData['415'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['415'][2] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['416'] = [];
  _$jscoverage['/editor/dom.js'].branchData['416'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['416'][2] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['422'] = [];
  _$jscoverage['/editor/dom.js'].branchData['422'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['425'] = [];
  _$jscoverage['/editor/dom.js'].branchData['425'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['425'][2] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['430'] = [];
  _$jscoverage['/editor/dom.js'].branchData['430'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['434'] = [];
  _$jscoverage['/editor/dom.js'].branchData['434'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['434'][2] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['438'] = [];
  _$jscoverage['/editor/dom.js'].branchData['438'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['438'][2] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['454'] = [];
  _$jscoverage['/editor/dom.js'].branchData['454'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['458'] = [];
  _$jscoverage['/editor/dom.js'].branchData['458'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['465'] = [];
  _$jscoverage['/editor/dom.js'].branchData['465'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['476'] = [];
  _$jscoverage['/editor/dom.js'].branchData['476'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['479'] = [];
  _$jscoverage['/editor/dom.js'].branchData['479'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['487'] = [];
  _$jscoverage['/editor/dom.js'].branchData['487'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['492'] = [];
  _$jscoverage['/editor/dom.js'].branchData['492'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['500'] = [];
  _$jscoverage['/editor/dom.js'].branchData['500'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['520'] = [];
  _$jscoverage['/editor/dom.js'].branchData['520'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['526'] = [];
  _$jscoverage['/editor/dom.js'].branchData['526'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['531'] = [];
  _$jscoverage['/editor/dom.js'].branchData['531'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['531'][2] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['532'] = [];
  _$jscoverage['/editor/dom.js'].branchData['532'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['533'] = [];
  _$jscoverage['/editor/dom.js'].branchData['533'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['537'] = [];
  _$jscoverage['/editor/dom.js'].branchData['537'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['541'] = [];
  _$jscoverage['/editor/dom.js'].branchData['541'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['542'] = [];
  _$jscoverage['/editor/dom.js'].branchData['542'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['542'][2] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['542'][3] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['544'] = [];
  _$jscoverage['/editor/dom.js'].branchData['544'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['557'] = [];
  _$jscoverage['/editor/dom.js'].branchData['557'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['558'] = [];
  _$jscoverage['/editor/dom.js'].branchData['558'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['559'] = [];
  _$jscoverage['/editor/dom.js'].branchData['559'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['565'] = [];
  _$jscoverage['/editor/dom.js'].branchData['565'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['580'] = [];
  _$jscoverage['/editor/dom.js'].branchData['580'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['580'][2] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['595'] = [];
  _$jscoverage['/editor/dom.js'].branchData['595'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['596'] = [];
  _$jscoverage['/editor/dom.js'].branchData['596'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['623'] = [];
  _$jscoverage['/editor/dom.js'].branchData['623'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['627'] = [];
  _$jscoverage['/editor/dom.js'].branchData['627'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['631'] = [];
  _$jscoverage['/editor/dom.js'].branchData['631'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['648'] = [];
  _$jscoverage['/editor/dom.js'].branchData['648'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['651'] = [];
  _$jscoverage['/editor/dom.js'].branchData['651'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['654'] = [];
  _$jscoverage['/editor/dom.js'].branchData['654'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['664'] = [];
  _$jscoverage['/editor/dom.js'].branchData['664'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['666'] = [];
  _$jscoverage['/editor/dom.js'].branchData['666'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['667'] = [];
  _$jscoverage['/editor/dom.js'].branchData['667'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['667'][2] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['668'] = [];
  _$jscoverage['/editor/dom.js'].branchData['668'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['682'] = [];
  _$jscoverage['/editor/dom.js'].branchData['682'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['683'] = [];
  _$jscoverage['/editor/dom.js'].branchData['683'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['683'][2] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['688'] = [];
  _$jscoverage['/editor/dom.js'].branchData['688'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['689'] = [];
  _$jscoverage['/editor/dom.js'].branchData['689'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['689'][2] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['690'] = [];
  _$jscoverage['/editor/dom.js'].branchData['690'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['710'] = [];
  _$jscoverage['/editor/dom.js'].branchData['710'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['712'] = [];
  _$jscoverage['/editor/dom.js'].branchData['712'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['733'] = [];
  _$jscoverage['/editor/dom.js'].branchData['733'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['748'] = [];
  _$jscoverage['/editor/dom.js'].branchData['748'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['750'] = [];
  _$jscoverage['/editor/dom.js'].branchData['750'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['758'] = [];
  _$jscoverage['/editor/dom.js'].branchData['758'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['762'] = [];
  _$jscoverage['/editor/dom.js'].branchData['762'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['762'][2] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['766'] = [];
  _$jscoverage['/editor/dom.js'].branchData['766'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['767'] = [];
  _$jscoverage['/editor/dom.js'].branchData['767'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['767'][2] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['767'][3] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['769'] = [];
  _$jscoverage['/editor/dom.js'].branchData['769'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['777'] = [];
  _$jscoverage['/editor/dom.js'].branchData['777'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['789'] = [];
  _$jscoverage['/editor/dom.js'].branchData['789'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['790'] = [];
  _$jscoverage['/editor/dom.js'].branchData['790'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['792'] = [];
  _$jscoverage['/editor/dom.js'].branchData['792'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['805'] = [];
  _$jscoverage['/editor/dom.js'].branchData['805'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['805'][2] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['808'] = [];
  _$jscoverage['/editor/dom.js'].branchData['808'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['815'] = [];
  _$jscoverage['/editor/dom.js'].branchData['815'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['818'] = [];
  _$jscoverage['/editor/dom.js'].branchData['818'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['818'][2] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['819'] = [];
  _$jscoverage['/editor/dom.js'].branchData['819'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['819'][2] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['820'] = [];
  _$jscoverage['/editor/dom.js'].branchData['820'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['821'] = [];
  _$jscoverage['/editor/dom.js'].branchData['821'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['827'] = [];
  _$jscoverage['/editor/dom.js'].branchData['827'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['842'] = [];
  _$jscoverage['/editor/dom.js'].branchData['842'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['842'][2] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['848'] = [];
  _$jscoverage['/editor/dom.js'].branchData['848'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['851'] = [];
  _$jscoverage['/editor/dom.js'].branchData['851'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['856'] = [];
  _$jscoverage['/editor/dom.js'].branchData['856'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['870'] = [];
  _$jscoverage['/editor/dom.js'].branchData['870'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['870'][2] = new BranchData();
}
_$jscoverage['/editor/dom.js'].branchData['870'][2].init(696, 49, 'innerSibling[0].nodeType == NodeType.ELEMENT_NODE');
function visit208_870_2(result) {
  _$jscoverage['/editor/dom.js'].branchData['870'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['870'][1].init(677, 68, 'innerSibling[0] && innerSibling[0].nodeType == NodeType.ELEMENT_NODE');
function visit207_870_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['870'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['856'][1].init(543, 43, 'element._4e_isIdentical(sibling, undefined)');
function visit206_856_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['856'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['851'][1].init(160, 8, '!sibling');
function visit205_851_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['851'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['848'][1].init(209, 77, 'sibling.attr(\'_ke_bookmark\') || sibling._4e_isEmptyInlineRemovable(undefined)');
function visit204_848_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['848'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['842'][2].init(99, 44, 'sibling[0].nodeType == NodeType.ELEMENT_NODE');
function visit203_842_2(result) {
  _$jscoverage['/editor/dom.js'].branchData['842'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['842'][1].init(88, 55, 'sibling && sibling[0].nodeType == NodeType.ELEMENT_NODE');
function visit202_842_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['842'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['827'][1].init(441, 22, 'currentIndex == target');
function visit201_827_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['827'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['821'][1].init(57, 39, 'candidate.previousSibling.nodeType == 3');
function visit200_821_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['821'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['820'][1].init(55, 97, 'candidate.previousSibling && candidate.previousSibling.nodeType == 3');
function visit199_820_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['820'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['819'][2].init(146, 23, 'candidate.nodeType == 3');
function visit198_819_2(result) {
  _$jscoverage['/editor/dom.js'].branchData['819'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['819'][1].init(51, 153, 'candidate.nodeType == 3 && candidate.previousSibling && candidate.previousSibling.nodeType == 3');
function visit197_819_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['819'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['818'][2].init(92, 19, 'normalized === TRUE');
function visit196_818_2(result) {
  _$jscoverage['/editor/dom.js'].branchData['818'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['818'][1].init(92, 205, 'normalized === TRUE && candidate.nodeType == 3 && candidate.previousSibling && candidate.previousSibling.nodeType == 3');
function visit195_818_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['818'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['815'][1].init(287, 23, 'j < $.childNodes.length');
function visit194_815_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['815'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['808'][1].init(76, 11, '!normalized');
function visit193_808_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['808'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['805'][2].init(87, 18, 'i < address.length');
function visit192_805_2(result) {
  _$jscoverage['/editor/dom.js'].branchData['805'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['805'][1].init(82, 23, '$ && i < address.length');
function visit191_805_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['805'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['792'][1].init(330, 19, 'dtd && dtd[\'#text\']');
function visit190_792_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['792'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['790'][1].init(61, 38, 'xhtml_dtd[name] || xhtml_dtd["span"]');
function visit189_790_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['790'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['789'][1].init(55, 102, '!xhtml_dtd.$nonEditable[name] && (xhtml_dtd[name] || xhtml_dtd["span"])');
function visit188_789_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['789'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['777'][1].init(1474, 23, 'el.style.cssText !== \'\'');
function visit187_777_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['777'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['769'][1].init(91, 18, 'attrValue === NULL');
function visit186_769_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['769'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['767'][3].init(80, 19, 'attrName == \'value\'');
function visit185_767_3(result) {
  _$jscoverage['/editor/dom.js'].branchData['767'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['767'][2].init(61, 38, 'attribute.value && attrName == \'value\'');
function visit184_767_2(result) {
  _$jscoverage['/editor/dom.js'].branchData['767'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['767'][1].init(49, 50, 'UA[\'ie\'] && attribute.value && attrName == \'value\'');
function visit183_767_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['767'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['766'][1].init(799, 102, 'attribute.specified || (UA[\'ie\'] && attribute.value && attrName == \'value\')');
function visit182_766_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['766'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['762'][2].init(533, 21, 'attrName == \'checked\'');
function visit181_762_2(result) {
  _$jscoverage['/editor/dom.js'].branchData['762'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['762'][1].init(533, 63, 'attrName == \'checked\' && (attrValue = Dom.attr(el, attrName))');
function visit180_762_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['762'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['758'][1].init(418, 26, 'attrName in skipAttributes');
function visit179_758_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['758'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['750'][1].init(185, 21, 'n < attributes.length');
function visit178_750_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['750'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['748'][1].init(128, 20, 'skipAttributes || {}');
function visit177_748_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['748'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['733'][1].init(351, 18, 'removeFromDatabase');
function visit176_733_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['733'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['712'][1].init(170, 128, 'element.data(\'list_marker_names\') || (element.data(\'list_marker_names\', {}).data(\'list_marker_names\'))');
function visit175_712_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['712'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['710'][1].init(73, 125, 'element.data(\'list_marker_id\') || (element.data(\'list_marker_id\', S.guid()).data(\'list_marker_id\'))');
function visit174_710_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['710'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['690'][1].init(68, 32, 'Dom.nodeName(lastChild) !== \'br\'');
function visit173_690_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['690'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['689'][2].init(401, 44, 'lastChild.nodeType == Dom.NodeType.TEXT_NODE');
function visit172_689_2(result) {
  _$jscoverage['/editor/dom.js'].branchData['689'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['689'][1].init(34, 101, 'lastChild.nodeType == Dom.NodeType.TEXT_NODE || Dom.nodeName(lastChild) !== \'br\'');
function visit171_689_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['689'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['688'][1].init(364, 136, '!lastChild || lastChild.nodeType == Dom.NodeType.TEXT_NODE || Dom.nodeName(lastChild) !== \'br\'');
function visit170_688_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['688'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['683'][2].init(163, 44, 'lastChild.nodeType == Dom.NodeType.TEXT_NODE');
function visit169_683_2(result) {
  _$jscoverage['/editor/dom.js'].branchData['683'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['683'][1].init(33, 97, 'lastChild.nodeType == Dom.NodeType.TEXT_NODE && !S.trim(lastChild.nodeValue)');
function visit168_683_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['683'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['682'][1].init(127, 131, 'lastChild && lastChild.nodeType == Dom.NodeType.TEXT_NODE && !S.trim(lastChild.nodeValue)');
function visit167_682_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['682'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['668'][1].init(47, 27, 'Dom.nodeName(child) == \'br\'');
function visit166_668_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['668'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['667'][2].init(105, 19, 'child.nodeType == 1');
function visit165_667_2(result) {
  _$jscoverage['/editor/dom.js'].branchData['667'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['667'][1].init(33, 75, 'child.nodeType == 1 && Dom.nodeName(child) == \'br\'');
function visit164_667_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['667'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['666'][1].init(69, 109, 'child && child.nodeType == 1 && Dom.nodeName(child) == \'br\'');
function visit163_666_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['666'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['664'][1].init(871, 22, '!UA[\'ie\'] && !UA.opera');
function visit162_664_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['664'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['654'][1].init(309, 31, 'trimmed.length < originalLength');
function visit161_654_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['654'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['651'][1].init(169, 8, '!trimmed');
function visit160_651_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['651'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['648'][1].init(26, 36, 'child.type == Dom.NodeType.TEXT_NODE');
function visit159_648_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['648'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['631'][1].init(336, 31, 'trimmed.length < originalLength');
function visit158_631_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['631'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['627'][1].init(171, 8, '!trimmed');
function visit157_627_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['627'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['623'][1].init(26, 40, 'child.nodeType == Dom.NodeType.TEXT_NODE');
function visit156_623_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['623'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['596'][1].init(26, 16, 'preserveChildren');
function visit155_596_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['596'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['595'][1].init(67, 6, 'parent');
function visit154_595_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['595'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['580'][2].init(176, 24, 'node != $documentElement');
function visit153_580_2(result) {
  _$jscoverage['/editor/dom.js'].branchData['580'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['580'][1].init(168, 32, 'node && node != $documentElement');
function visit152_580_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['580'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['565'][1].init(2157, 44, 'addressOfThis.length < addressOfOther.length');
function visit151_565_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['565'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['559'][1].init(33, 40, 'addressOfThis[i] < addressOfOther[i]');
function visit150_559_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['559'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['558'][1].init(26, 41, 'addressOfThis[i] != addressOfOther[i]');
function visit149_558_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['558'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['557'][1].init(1773, 17, 'i <= minLevel - 1');
function visit148_557_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['557'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['544'][1].init(136, 35, 'el.sourceIndex < $other.sourceIndex');
function visit147_544_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['544'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['542'][3].init(57, 22, '$other.sourceIndex < 0');
function visit146_542_3(result) {
  _$jscoverage['/editor/dom.js'].branchData['542'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['542'][2].init(35, 18, 'el.sourceIndex < 0');
function visit145_542_2(result) {
  _$jscoverage['/editor/dom.js'].branchData['542'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['542'][1].init(35, 44, 'el.sourceIndex < 0 || $other.sourceIndex < 0');
function visit144_542_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['542'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['541'][1].init(346, 19, '\'sourceIndex\' in el');
function visit143_541_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['541'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['537'][1].init(184, 24, 'Dom.contains($other, el)');
function visit142_537_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['537'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['533'][1].init(26, 24, 'Dom.contains(el, $other)');
function visit141_533_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['533'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['532'][1].init(60, 40, '$other.nodeType == NodeType.ELEMENT_NODE');
function visit140_532_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['532'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['531'][2].init(478, 36, 'el.nodeType == NodeType.ELEMENT_NODE');
function visit139_531_2(result) {
  _$jscoverage['/editor/dom.js'].branchData['531'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['531'][1].init(478, 101, 'el.nodeType == NodeType.ELEMENT_NODE && $other.nodeType == NodeType.ELEMENT_NODE');
function visit138_531_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['531'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['526'][1].init(295, 12, 'el == $other');
function visit137_526_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['526'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['520'][1].init(78, 26, 'el.compareDocumentPosition');
function visit136_520_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['520'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['500'][1].init(59, 8, 'UA.gecko');
function visit135_500_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['500'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['492'][1].init(46, 19, 'attribute.specified');
function visit134_492_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['492'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['487'][1].init(439, 24, 'el.getAttribute(\'class\')');
function visit133_487_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['487'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['479'][1].init(91, 21, 'i < attributes.length');
function visit132_479_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['479'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['476'][1].init(13476, 18, 'Utils.ieEngine < 9');
function visit131_476_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['476'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['465'][1].init(26, 25, 'Dom.contains(start, node)');
function visit130_465_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['465'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['458'][1].init(158, 22, 'Dom.contains(node, el)');
function visit129_458_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['458'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['454'][1].init(69, 11, 'el === node');
function visit128_454_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['454'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['438'][2].init(1439, 25, 'node.nodeType != nodeType');
function visit127_438_2(result) {
  _$jscoverage['/editor/dom.js'].branchData['438'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['438'][1].init(1427, 37, 'nodeType && node.nodeType != nodeType');
function visit126_438_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['438'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['434'][2].init(1326, 21, 'guard(node) === FALSE');
function visit125_434_2(result) {
  _$jscoverage['/editor/dom.js'].branchData['434'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['434'][1].init(1317, 30, 'guard && guard(node) === FALSE');
function visit124_434_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['434'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['430'][1].init(1232, 5, '!node');
function visit123_430_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['430'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['425'][2].init(179, 29, 'guard(parent, TRUE) === FALSE');
function visit122_425_2(result) {
  _$jscoverage['/editor/dom.js'].branchData['425'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['425'][1].init(170, 38, 'guard && guard(parent, TRUE) === FALSE');
function visit121_425_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['425'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['422'][1].init(848, 39, '!node && (parent = parent.parentNode)');
function visit120_422_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['422'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['416'][2].init(102, 25, 'guard(el, TRUE) === FALSE');
function visit119_416_2(result) {
  _$jscoverage['/editor/dom.js'].branchData['416'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['416'][1].init(64, 34, 'guard && guard(el, TRUE) === FALSE');
function visit118_416_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['416'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['415'][2].init(26, 36, 'el.nodeType == NodeType.ELEMENT_NODE');
function visit117_415_2(result) {
  _$jscoverage['/editor/dom.js'].branchData['415'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['415'][1].init(26, 99, 'el.nodeType == NodeType.ELEMENT_NODE && guard && guard(el, TRUE) === FALSE');
function visit116_415_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['415'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['414'][1].init(557, 5, '!node');
function visit115_414_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['414'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['409'][1].init(275, 33, '!startFromSibling && el.lastChild');
function visit114_409_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['409'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['405'][1].init(33, 18, 'node !== guardNode');
function visit113_405_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['405'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['402'][1].init(22, 20, 'guard && !guard.call');
function visit112_402_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['402'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['387'][2].init(1527, 25, 'nodeType != node.nodeType');
function visit111_387_2(result) {
  _$jscoverage['/editor/dom.js'].branchData['387'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['387'][1].init(1515, 37, 'nodeType && nodeType != node.nodeType');
function visit110_387_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['387'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['383'][2].init(1414, 21, 'guard(node) === FALSE');
function visit109_383_2(result) {
  _$jscoverage['/editor/dom.js'].branchData['383'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['383'][1].init(1405, 30, 'guard && guard(node) === FALSE');
function visit108_383_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['383'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['379'][1].init(1320, 5, '!node');
function visit107_379_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['379'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['373'][2].init(179, 29, 'guard(parent, TRUE) === FALSE');
function visit106_373_2(result) {
  _$jscoverage['/editor/dom.js'].branchData['373'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['373'][1].init(170, 38, 'guard && guard(parent, TRUE) === FALSE');
function visit105_373_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['373'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['370'][1].init(916, 38, '!node && (parent = parent.parentNode)');
function visit104_370_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['370'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['364'][2].init(102, 25, 'guard(el, TRUE) === FALSE');
function visit103_364_2(result) {
  _$jscoverage['/editor/dom.js'].branchData['364'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['364'][1].init(64, 34, 'guard && guard(el, TRUE) === FALSE');
function visit102_364_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['364'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['363'][2].init(26, 36, 'el.nodeType == NodeType.ELEMENT_NODE');
function visit101_363_2(result) {
  _$jscoverage['/editor/dom.js'].branchData['363'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['363'][1].init(26, 99, 'el.nodeType == NodeType.ELEMENT_NODE && guard && guard(el, TRUE) === FALSE');
function visit100_363_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['363'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['362'][1].init(629, 5, '!node');
function visit99_362_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['362'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['357'][1].init(345, 34, '!startFromSibling && el.firstChild');
function visit98_357_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['357'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['353'][1].init(33, 18, 'node !== guardNode');
function visit97_353_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['353'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['350'][1].init(92, 20, 'guard && !guard.call');
function visit96_350_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['350'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['318'][1].init(1079, 20, '!!(doc.documentMode)');
function visit95_318_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['318'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['303'][2].init(397, 29, 'offset == el.nodeValue.length');
function visit94_303_2(result) {
  _$jscoverage['/editor/dom.js'].branchData['303'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['303'][1].init(385, 41, 'UA[\'ie\'] && offset == el.nodeValue.length');
function visit93_303_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['303'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['297'][1].init(69, 37, 'el.nodeType != Dom.NodeType.TEXT_NODE');
function visit92_297_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['297'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['282'][1].init(111, 36, 'REMOVE_EMPTY[thisElement.nodeName()]');
function visit91_282_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['282'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['259'][1].init(197, 7, 'toStart');
function visit90_259_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['259'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['253'][1].init(71, 21, 'thisElement == target');
function visit89_253_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['253'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['237'][2].init(417, 34, 'nodeType == Dom.NodeType.TEXT_NODE');
function visit88_237_2(result) {
  _$jscoverage['/editor/dom.js'].branchData['237'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['237'][1].init(103, 61, 'nodeType == Dom.NodeType.TEXT_NODE && S.trim(child.nodeValue)');
function visit87_237_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['237'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['236'][3].init(311, 33, 'nodeType == NodeType.ELEMENT_NODE');
function visit86_236_3(result) {
  _$jscoverage['/editor/dom.js'].branchData['236'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['236'][2].init(311, 75, 'nodeType == NodeType.ELEMENT_NODE && !Dom._4e_isEmptyInlineRemovable(child)');
function visit85_236_2(result) {
  _$jscoverage['/editor/dom.js'].branchData['236'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['236'][1].init(311, 165, 'nodeType == NodeType.ELEMENT_NODE && !Dom._4e_isEmptyInlineRemovable(child) || nodeType == Dom.NodeType.TEXT_NODE && S.trim(child.nodeValue)');
function visit84_236_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['236'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['231'][2].init(126, 33, 'nodeType == NodeType.ELEMENT_NODE');
function visit83_231_2(result) {
  _$jscoverage['/editor/dom.js'].branchData['231'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['231'][1].init(126, 96, 'nodeType == NodeType.ELEMENT_NODE && child.getAttribute(\'_ke_bookmark\')');
function visit82_231_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['231'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['227'][1].init(244, 9, 'i < count');
function visit81_227_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['227'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['223'][1].init(22, 50, '!xhtml_dtd.$removeEmpty[Dom.nodeName(thisElement)]');
function visit80_223_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['223'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['209'][1].init(51, 59, 'Dom.attr(thisElement, name) != Dom.attr(otherElement, name)');
function visit79_209_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['209'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['208'][1].init(137, 111, 'attribute.specified && Dom.attr(thisElement, name) != Dom.attr(otherElement, name)');
function visit78_208_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['208'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['205'][1].init(34, 15, 'i < otherLength');
function visit77_205_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['205'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['204'][1].init(1240, 18, 'Utils.ieEngine < 8');
function visit76_204_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['204'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['196'][1].init(47, 59, 'Dom.attr(thisElement, name) != Dom.attr(otherElement, name)');
function visit75_196_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['196'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['195'][1].init(130, 107, 'attribute.specified && Dom.attr(thisElement, name) != Dom.attr(otherElement, name)');
function visit74_195_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['195'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['192'][1].init(677, 14, 'i < thisLength');
function visit73_192_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['192'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['188'][1].init(559, 25, 'thisLength != otherLength');
function visit72_188_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['188'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['178'][1].init(177, 55, 'Dom.nodeName(thisElement) != Dom.nodeName(otherElement)');
function visit71_178_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['178'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['172'][1].init(22, 13, '!otherElement');
function visit70_172_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['172'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['159'][1].init(69, 7, 'toStart');
function visit69_159_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['159'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['144'][1].init(421, 16, 'candidate === el');
function visit68_144_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['144'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['138'][1].init(53, 39, 'candidate.previousSibling.nodeType == 3');
function visit67_138_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['138'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['137'][1].init(51, 93, 'candidate.previousSibling && candidate.previousSibling.nodeType == 3');
function visit66_137_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['137'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['136'][2].init(150, 23, 'candidate.nodeType == 3');
function visit65_136_2(result) {
  _$jscoverage['/editor/dom.js'].branchData['136'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['136'][1].init(38, 145, 'candidate.nodeType == 3 && candidate.previousSibling && candidate.previousSibling.nodeType == 3');
function visit64_136_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['136'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['135'][1].init(109, 184, 'normalized && candidate.nodeType == 3 && candidate.previousSibling && candidate.previousSibling.nodeType == 3');
function visit63_135_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['135'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['131'][1].init(166, 19, 'i < siblings.length');
function visit62_131_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['131'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['118'][1].init(121, 90, 'blockBoundaryDisplayMatch[Dom.css(el, \'display\')] || nodeNameMatches[Dom.nodeName(el)]');
function visit61_118_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['118'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['108'][2].init(116, 21, 'e1p == el2.parentNode');
function visit60_108_2(result) {
  _$jscoverage['/editor/dom.js'].branchData['108'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['108'][1].init(109, 28, 'e1p && e1p == el2.parentNode');
function visit59_108_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['108'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['88'][2].init(28, 11, 'el[0] || el');
function visit58_88_2(result) {
  _$jscoverage['/editor/dom.js'].branchData['88'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['88'][1].init(21, 19, 'el && (el[0] || el)');
function visit57_88_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['88'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].lineData[9]++;
KISSY.add("editor/dom", function(S, Editor, Utils) {
  _$jscoverage['/editor/dom.js'].functionData[0]++;
  _$jscoverage['/editor/dom.js'].lineData[10]++;
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
  _$jscoverage['/editor/dom.js'].lineData[54]++;
  Editor.PositionType = {
  POSITION_IDENTICAL: 0, 
  POSITION_DISCONNECTED: 1, 
  POSITION_FOLLOWING: 2, 
  POSITION_PRECEDING: 4, 
  POSITION_IS_CONTAINED: 8, 
  POSITION_CONTAINS: 16};
  _$jscoverage['/editor/dom.js'].lineData[62]++;
  var KEP = Editor.PositionType;
  _$jscoverage['/editor/dom.js'].lineData[70]++;
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
  _$jscoverage['/editor/dom.js'].lineData[88]++;
  return visit57_88_1(el && (visit58_88_2(el[0] || el)));
}, normalEl = function(el) {
  _$jscoverage['/editor/dom.js'].functionData[2]++;
  _$jscoverage['/editor/dom.js'].lineData[94]++;
  return new Node(el);
}, editorDom = {
  _4e_sameLevel: function(el1, el2) {
  _$jscoverage['/editor/dom.js'].functionData[3]++;
  _$jscoverage['/editor/dom.js'].lineData[106]++;
  el2 = normalElDom(el2);
  _$jscoverage['/editor/dom.js'].lineData[107]++;
  var e1p = el1.parentNode;
  _$jscoverage['/editor/dom.js'].lineData[108]++;
  return visit59_108_1(e1p && visit60_108_2(e1p == el2.parentNode));
}, 
  _4e_isBlockBoundary: function(el, customNodeNames) {
  _$jscoverage['/editor/dom.js'].functionData[4]++;
  _$jscoverage['/editor/dom.js'].lineData[117]++;
  var nodeNameMatches = S.merge(blockBoundaryNodeNameMatch, customNodeNames);
  _$jscoverage['/editor/dom.js'].lineData[118]++;
  return !!(visit61_118_1(blockBoundaryDisplayMatch[Dom.css(el, 'display')] || nodeNameMatches[Dom.nodeName(el)]));
}, 
  _4e_index: function(el, normalized) {
  _$jscoverage['/editor/dom.js'].functionData[5]++;
  _$jscoverage['/editor/dom.js'].lineData[127]++;
  var siblings = el.parentNode.childNodes, candidate, currentIndex = -1;
  _$jscoverage['/editor/dom.js'].lineData[131]++;
  for (var i = 0; visit62_131_1(i < siblings.length); i++) {
    _$jscoverage['/editor/dom.js'].lineData[132]++;
    candidate = siblings[i];
    _$jscoverage['/editor/dom.js'].lineData[135]++;
    if (visit63_135_1(normalized && visit64_136_1(visit65_136_2(candidate.nodeType == 3) && visit66_137_1(candidate.previousSibling && visit67_138_1(candidate.previousSibling.nodeType == 3))))) {
      _$jscoverage['/editor/dom.js'].lineData[139]++;
      continue;
    }
    _$jscoverage['/editor/dom.js'].lineData[142]++;
    currentIndex++;
    _$jscoverage['/editor/dom.js'].lineData[144]++;
    if (visit68_144_1(candidate === el)) {
      _$jscoverage['/editor/dom.js'].lineData[145]++;
      return currentIndex;
    }
  }
  _$jscoverage['/editor/dom.js'].lineData[148]++;
  return -1;
}, 
  _4e_move: function(thisElement, target, toStart) {
  _$jscoverage['/editor/dom.js'].functionData[6]++;
  _$jscoverage['/editor/dom.js'].lineData[158]++;
  target = normalElDom(target);
  _$jscoverage['/editor/dom.js'].lineData[159]++;
  if (visit69_159_1(toStart)) {
    _$jscoverage['/editor/dom.js'].lineData[160]++;
    target.insertBefore(thisElement, target.firstChild);
  } else {
    _$jscoverage['/editor/dom.js'].lineData[162]++;
    target.appendChild(thisElement);
  }
}, 
  _4e_isIdentical: function(thisElement, otherElement) {
  _$jscoverage['/editor/dom.js'].functionData[7]++;
  _$jscoverage['/editor/dom.js'].lineData[172]++;
  if (visit70_172_1(!otherElement)) {
    _$jscoverage['/editor/dom.js'].lineData[173]++;
    return FALSE;
  }
  _$jscoverage['/editor/dom.js'].lineData[176]++;
  otherElement = normalElDom(otherElement);
  _$jscoverage['/editor/dom.js'].lineData[178]++;
  if (visit71_178_1(Dom.nodeName(thisElement) != Dom.nodeName(otherElement))) {
    _$jscoverage['/editor/dom.js'].lineData[179]++;
    return FALSE;
  }
  _$jscoverage['/editor/dom.js'].lineData[182]++;
  var thisAttributes = thisElement.attributes, otherAttributes = otherElement.attributes;
  _$jscoverage['/editor/dom.js'].lineData[185]++;
  var thisLength = thisAttributes.length, otherLength = otherAttributes.length;
  _$jscoverage['/editor/dom.js'].lineData[188]++;
  if (visit72_188_1(thisLength != otherLength)) {
    _$jscoverage['/editor/dom.js'].lineData[189]++;
    return FALSE;
  }
  _$jscoverage['/editor/dom.js'].lineData[192]++;
  for (var i = 0; visit73_192_1(i < thisLength); i++) {
    _$jscoverage['/editor/dom.js'].lineData[193]++;
    var attribute = thisAttributes[i], name = attribute.name;
    _$jscoverage['/editor/dom.js'].lineData[195]++;
    if (visit74_195_1(attribute.specified && visit75_196_1(Dom.attr(thisElement, name) != Dom.attr(otherElement, name)))) {
      _$jscoverage['/editor/dom.js'].lineData[197]++;
      return FALSE;
    }
  }
  _$jscoverage['/editor/dom.js'].lineData[204]++;
  if (visit76_204_1(Utils.ieEngine < 8)) {
    _$jscoverage['/editor/dom.js'].lineData[205]++;
    for (i = 0; visit77_205_1(i < otherLength); i++) {
      _$jscoverage['/editor/dom.js'].lineData[206]++;
      attribute = otherAttributes[i];
      _$jscoverage['/editor/dom.js'].lineData[207]++;
      name = attribute.name;
      _$jscoverage['/editor/dom.js'].lineData[208]++;
      if (visit78_208_1(attribute.specified && visit79_209_1(Dom.attr(thisElement, name) != Dom.attr(otherElement, name)))) {
        _$jscoverage['/editor/dom.js'].lineData[210]++;
        return FALSE;
      }
    }
  }
  _$jscoverage['/editor/dom.js'].lineData[215]++;
  return TRUE;
}, 
  _4e_isEmptyInlineRemovable: function(thisElement) {
  _$jscoverage['/editor/dom.js'].functionData[8]++;
  _$jscoverage['/editor/dom.js'].lineData[223]++;
  if (visit80_223_1(!xhtml_dtd.$removeEmpty[Dom.nodeName(thisElement)])) {
    _$jscoverage['/editor/dom.js'].lineData[224]++;
    return false;
  }
  _$jscoverage['/editor/dom.js'].lineData[226]++;
  var children = thisElement.childNodes;
  _$jscoverage['/editor/dom.js'].lineData[227]++;
  for (var i = 0, count = children.length; visit81_227_1(i < count); i++) {
    _$jscoverage['/editor/dom.js'].lineData[228]++;
    var child = children[i], nodeType = child.nodeType;
    _$jscoverage['/editor/dom.js'].lineData[231]++;
    if (visit82_231_1(visit83_231_2(nodeType == NodeType.ELEMENT_NODE) && child.getAttribute('_ke_bookmark'))) {
      _$jscoverage['/editor/dom.js'].lineData[233]++;
      continue;
    }
    _$jscoverage['/editor/dom.js'].lineData[236]++;
    if (visit84_236_1(visit85_236_2(visit86_236_3(nodeType == NodeType.ELEMENT_NODE) && !Dom._4e_isEmptyInlineRemovable(child)) || visit87_237_1(visit88_237_2(nodeType == Dom.NodeType.TEXT_NODE) && S.trim(child.nodeValue)))) {
      _$jscoverage['/editor/dom.js'].lineData[238]++;
      return FALSE;
    }
  }
  _$jscoverage['/editor/dom.js'].lineData[241]++;
  return TRUE;
}, 
  _4e_moveChildren: function(thisElement, target, toStart) {
  _$jscoverage['/editor/dom.js'].functionData[9]++;
  _$jscoverage['/editor/dom.js'].lineData[251]++;
  target = normalElDom(target);
  _$jscoverage['/editor/dom.js'].lineData[253]++;
  if (visit89_253_1(thisElement == target)) {
    _$jscoverage['/editor/dom.js'].lineData[254]++;
    return;
  }
  _$jscoverage['/editor/dom.js'].lineData[257]++;
  var child;
  _$jscoverage['/editor/dom.js'].lineData[259]++;
  if (visit90_259_1(toStart)) {
    _$jscoverage['/editor/dom.js'].lineData[260]++;
    while (child = thisElement.lastChild) {
      _$jscoverage['/editor/dom.js'].lineData[261]++;
      target.insertBefore(thisElement.removeChild(child), target.firstChild);
    }
  } else {
    _$jscoverage['/editor/dom.js'].lineData[264]++;
    while (child = thisElement.firstChild) {
      _$jscoverage['/editor/dom.js'].lineData[265]++;
      target.appendChild(thisElement.removeChild(child));
    }
  }
}, 
  _4e_mergeSiblings: function(thisElement) {
  _$jscoverage['/editor/dom.js'].functionData[10]++;
  _$jscoverage['/editor/dom.js'].lineData[280]++;
  thisElement = normalEl(thisElement);
  _$jscoverage['/editor/dom.js'].lineData[282]++;
  if (visit91_282_1(REMOVE_EMPTY[thisElement.nodeName()])) {
    _$jscoverage['/editor/dom.js'].lineData[283]++;
    mergeElements(thisElement, TRUE);
    _$jscoverage['/editor/dom.js'].lineData[284]++;
    mergeElements(thisElement);
  }
}, 
  _4e_splitText: function(el, offset) {
  _$jscoverage['/editor/dom.js'].functionData[11]++;
  _$jscoverage['/editor/dom.js'].lineData[295]++;
  var doc = el.ownerDocument;
  _$jscoverage['/editor/dom.js'].lineData[297]++;
  if (visit92_297_1(el.nodeType != Dom.NodeType.TEXT_NODE)) {
    _$jscoverage['/editor/dom.js'].lineData[298]++;
    return;
  }
  _$jscoverage['/editor/dom.js'].lineData[303]++;
  if (visit93_303_1(UA['ie'] && visit94_303_2(offset == el.nodeValue.length))) {
    _$jscoverage['/editor/dom.js'].lineData[304]++;
    var next = doc.createTextNode("");
    _$jscoverage['/editor/dom.js'].lineData[305]++;
    Dom.insertAfter(next, el);
    _$jscoverage['/editor/dom.js'].lineData[306]++;
    return next;
  }
  _$jscoverage['/editor/dom.js'].lineData[309]++;
  var ret = el.splitText(offset);
  _$jscoverage['/editor/dom.js'].lineData[318]++;
  if (visit95_318_1(!!(doc.documentMode))) {
    _$jscoverage['/editor/dom.js'].lineData[319]++;
    var workaround = doc.createTextNode("");
    _$jscoverage['/editor/dom.js'].lineData[320]++;
    Dom.insertAfter(workaround, ret);
    _$jscoverage['/editor/dom.js'].lineData[321]++;
    Dom.remove(workaround);
  }
  _$jscoverage['/editor/dom.js'].lineData[324]++;
  return ret;
}, 
  _4e_parents: function(node, closerFirst) {
  _$jscoverage['/editor/dom.js'].functionData[12]++;
  _$jscoverage['/editor/dom.js'].lineData[333]++;
  var parents = [];
  _$jscoverage['/editor/dom.js'].lineData[334]++;
  parents.__IS_NODELIST = 1;
  _$jscoverage['/editor/dom.js'].lineData[335]++;
  do {
    _$jscoverage['/editor/dom.js'].lineData[336]++;
    parents[closerFirst ? 'push' : 'unshift'](node);
  } while (node = node.parentNode);
  _$jscoverage['/editor/dom.js'].lineData[338]++;
  return parents;
}, 
  _4e_nextSourceNode: function(el, startFromSibling, nodeType, guard) {
  _$jscoverage['/editor/dom.js'].functionData[13]++;
  _$jscoverage['/editor/dom.js'].lineData[350]++;
  if (visit96_350_1(guard && !guard.call)) {
    _$jscoverage['/editor/dom.js'].lineData[351]++;
    var guardNode = normalElDom(guard);
    _$jscoverage['/editor/dom.js'].lineData[352]++;
    guard = function(node) {
  _$jscoverage['/editor/dom.js'].functionData[14]++;
  _$jscoverage['/editor/dom.js'].lineData[353]++;
  return visit97_353_1(node !== guardNode);
};
  }
  _$jscoverage['/editor/dom.js'].lineData[357]++;
  var node = visit98_357_1(!startFromSibling && el.firstChild), parent = el;
  _$jscoverage['/editor/dom.js'].lineData[362]++;
  if (visit99_362_1(!node)) {
    _$jscoverage['/editor/dom.js'].lineData[363]++;
    if (visit100_363_1(visit101_363_2(el.nodeType == NodeType.ELEMENT_NODE) && visit102_364_1(guard && visit103_364_2(guard(el, TRUE) === FALSE)))) {
      _$jscoverage['/editor/dom.js'].lineData[365]++;
      return NULL;
    }
    _$jscoverage['/editor/dom.js'].lineData[367]++;
    node = el.nextSibling;
  }
  _$jscoverage['/editor/dom.js'].lineData[370]++;
  while (visit104_370_1(!node && (parent = parent.parentNode))) {
    _$jscoverage['/editor/dom.js'].lineData[373]++;
    if (visit105_373_1(guard && visit106_373_2(guard(parent, TRUE) === FALSE))) {
      _$jscoverage['/editor/dom.js'].lineData[374]++;
      return NULL;
    }
    _$jscoverage['/editor/dom.js'].lineData[376]++;
    node = parent.nextSibling;
  }
  _$jscoverage['/editor/dom.js'].lineData[379]++;
  if (visit107_379_1(!node)) {
    _$jscoverage['/editor/dom.js'].lineData[380]++;
    return NULL;
  }
  _$jscoverage['/editor/dom.js'].lineData[383]++;
  if (visit108_383_1(guard && visit109_383_2(guard(node) === FALSE))) {
    _$jscoverage['/editor/dom.js'].lineData[384]++;
    return NULL;
  }
  _$jscoverage['/editor/dom.js'].lineData[387]++;
  if (visit110_387_1(nodeType && visit111_387_2(nodeType != node.nodeType))) {
    _$jscoverage['/editor/dom.js'].lineData[388]++;
    return Dom._4e_nextSourceNode(node, FALSE, nodeType, guard);
  }
  _$jscoverage['/editor/dom.js'].lineData[391]++;
  return node;
}, 
  _4e_previousSourceNode: function(el, startFromSibling, nodeType, guard) {
  _$jscoverage['/editor/dom.js'].functionData[15]++;
  _$jscoverage['/editor/dom.js'].lineData[402]++;
  if (visit112_402_1(guard && !guard.call)) {
    _$jscoverage['/editor/dom.js'].lineData[403]++;
    var guardNode = normalElDom(guard);
    _$jscoverage['/editor/dom.js'].lineData[404]++;
    guard = function(node) {
  _$jscoverage['/editor/dom.js'].functionData[16]++;
  _$jscoverage['/editor/dom.js'].lineData[405]++;
  return visit113_405_1(node !== guardNode);
};
  }
  _$jscoverage['/editor/dom.js'].lineData[409]++;
  var node = visit114_409_1(!startFromSibling && el.lastChild), parent = el;
  _$jscoverage['/editor/dom.js'].lineData[414]++;
  if (visit115_414_1(!node)) {
    _$jscoverage['/editor/dom.js'].lineData[415]++;
    if (visit116_415_1(visit117_415_2(el.nodeType == NodeType.ELEMENT_NODE) && visit118_416_1(guard && visit119_416_2(guard(el, TRUE) === FALSE)))) {
      _$jscoverage['/editor/dom.js'].lineData[417]++;
      return NULL;
    }
    _$jscoverage['/editor/dom.js'].lineData[419]++;
    node = el.previousSibling;
  }
  _$jscoverage['/editor/dom.js'].lineData[422]++;
  while (visit120_422_1(!node && (parent = parent.parentNode))) {
    _$jscoverage['/editor/dom.js'].lineData[425]++;
    if (visit121_425_1(guard && visit122_425_2(guard(parent, TRUE) === FALSE))) {
      _$jscoverage['/editor/dom.js'].lineData[426]++;
      return NULL;
    }
    _$jscoverage['/editor/dom.js'].lineData[427]++;
    node = parent.previousSibling;
  }
  _$jscoverage['/editor/dom.js'].lineData[430]++;
  if (visit123_430_1(!node)) {
    _$jscoverage['/editor/dom.js'].lineData[431]++;
    return NULL;
  }
  _$jscoverage['/editor/dom.js'].lineData[434]++;
  if (visit124_434_1(guard && visit125_434_2(guard(node) === FALSE))) {
    _$jscoverage['/editor/dom.js'].lineData[435]++;
    return NULL;
  }
  _$jscoverage['/editor/dom.js'].lineData[438]++;
  if (visit126_438_1(nodeType && visit127_438_2(node.nodeType != nodeType))) {
    _$jscoverage['/editor/dom.js'].lineData[439]++;
    return Dom._4e_previousSourceNode(node, FALSE, nodeType, guard);
  }
  _$jscoverage['/editor/dom.js'].lineData[442]++;
  return node;
}, 
  _4e_commonAncestor: function(el, node) {
  _$jscoverage['/editor/dom.js'].functionData[17]++;
  _$jscoverage['/editor/dom.js'].lineData[452]++;
  node = normalElDom(node);
  _$jscoverage['/editor/dom.js'].lineData[454]++;
  if (visit128_454_1(el === node)) {
    _$jscoverage['/editor/dom.js'].lineData[455]++;
    return el;
  }
  _$jscoverage['/editor/dom.js'].lineData[458]++;
  if (visit129_458_1(Dom.contains(node, el))) {
    _$jscoverage['/editor/dom.js'].lineData[459]++;
    return node;
  }
  _$jscoverage['/editor/dom.js'].lineData[462]++;
  var start = el;
  _$jscoverage['/editor/dom.js'].lineData[464]++;
  do {
    _$jscoverage['/editor/dom.js'].lineData[465]++;
    if (visit130_465_1(Dom.contains(start, node))) {
      _$jscoverage['/editor/dom.js'].lineData[466]++;
      return start;
    }
  } while (start = start.parentNode);
  _$jscoverage['/editor/dom.js'].lineData[470]++;
  return NULL;
}, 
  _4e_hasAttributes: visit131_476_1(Utils.ieEngine < 9) ? function(el) {
  _$jscoverage['/editor/dom.js'].functionData[18]++;
  _$jscoverage['/editor/dom.js'].lineData[478]++;
  var attributes = el.attributes;
  _$jscoverage['/editor/dom.js'].lineData[479]++;
  for (var i = 0; visit132_479_1(i < attributes.length); i++) {
    _$jscoverage['/editor/dom.js'].lineData[480]++;
    var attribute = attributes[i];
    _$jscoverage['/editor/dom.js'].lineData[481]++;
    switch (attribute.name) {
      case 'class':
        _$jscoverage['/editor/dom.js'].lineData[487]++;
        if (visit133_487_1(el.getAttribute('class'))) {
          _$jscoverage['/editor/dom.js'].lineData[488]++;
          return TRUE;
        }
        _$jscoverage['/editor/dom.js'].lineData[490]++;
        break;
      default:
        _$jscoverage['/editor/dom.js'].lineData[492]++;
        if (visit134_492_1(attribute.specified)) {
          _$jscoverage['/editor/dom.js'].lineData[493]++;
          return TRUE;
        }
    }
  }
  _$jscoverage['/editor/dom.js'].lineData[497]++;
  return FALSE;
} : function(el) {
  _$jscoverage['/editor/dom.js'].functionData[19]++;
  _$jscoverage['/editor/dom.js'].lineData[500]++;
  if (visit135_500_1(UA.gecko)) {
    _$jscoverage['/editor/dom.js'].lineData[501]++;
    el.removeAttribute("_moz_dirty");
  }
  _$jscoverage['/editor/dom.js'].lineData[505]++;
  return el.hasAttributes();
}, 
  _4e_position: function(el, otherNode) {
  _$jscoverage['/editor/dom.js'].functionData[20]++;
  _$jscoverage['/editor/dom.js'].lineData[518]++;
  var $other = normalElDom(otherNode);
  _$jscoverage['/editor/dom.js'].lineData[520]++;
  if (visit136_520_1(el.compareDocumentPosition)) {
    _$jscoverage['/editor/dom.js'].lineData[521]++;
    return el.compareDocumentPosition($other);
  }
  _$jscoverage['/editor/dom.js'].lineData[526]++;
  if (visit137_526_1(el == $other)) {
    _$jscoverage['/editor/dom.js'].lineData[527]++;
    return KEP.POSITION_IDENTICAL;
  }
  _$jscoverage['/editor/dom.js'].lineData[531]++;
  if (visit138_531_1(visit139_531_2(el.nodeType == NodeType.ELEMENT_NODE) && visit140_532_1($other.nodeType == NodeType.ELEMENT_NODE))) {
    _$jscoverage['/editor/dom.js'].lineData[533]++;
    if (visit141_533_1(Dom.contains(el, $other))) {
      _$jscoverage['/editor/dom.js'].lineData[534]++;
      return KEP.POSITION_CONTAINS + KEP.POSITION_PRECEDING;
    }
    _$jscoverage['/editor/dom.js'].lineData[537]++;
    if (visit142_537_1(Dom.contains($other, el))) {
      _$jscoverage['/editor/dom.js'].lineData[538]++;
      return KEP.POSITION_IS_CONTAINED + KEP.POSITION_FOLLOWING;
    }
    _$jscoverage['/editor/dom.js'].lineData[541]++;
    if (visit143_541_1('sourceIndex' in el)) {
      _$jscoverage['/editor/dom.js'].lineData[542]++;
      return (visit144_542_1(visit145_542_2(el.sourceIndex < 0) || visit146_542_3($other.sourceIndex < 0))) ? KEP.POSITION_DISCONNECTED : (visit147_544_1(el.sourceIndex < $other.sourceIndex)) ? KEP.POSITION_PRECEDING : KEP.POSITION_FOLLOWING;
    }
  }
  _$jscoverage['/editor/dom.js'].lineData[552]++;
  var addressOfThis = Dom._4e_address(el), addressOfOther = Dom._4e_address($other), minLevel = Math.min(addressOfThis.length, addressOfOther.length);
  _$jscoverage['/editor/dom.js'].lineData[557]++;
  for (var i = 0; visit148_557_1(i <= minLevel - 1); i++) {
    _$jscoverage['/editor/dom.js'].lineData[558]++;
    if (visit149_558_1(addressOfThis[i] != addressOfOther[i])) {
      _$jscoverage['/editor/dom.js'].lineData[559]++;
      return visit150_559_1(addressOfThis[i] < addressOfOther[i]) ? KEP.POSITION_PRECEDING : KEP.POSITION_FOLLOWING;
    }
  }
  _$jscoverage['/editor/dom.js'].lineData[565]++;
  return (visit151_565_1(addressOfThis.length < addressOfOther.length)) ? KEP.POSITION_CONTAINS + KEP.POSITION_PRECEDING : KEP.POSITION_IS_CONTAINED + KEP.POSITION_FOLLOWING;
}, 
  _4e_address: function(el, normalized) {
  _$jscoverage['/editor/dom.js'].functionData[21]++;
  _$jscoverage['/editor/dom.js'].lineData[576]++;
  var address = [], $documentElement = el.ownerDocument.documentElement, node = el;
  _$jscoverage['/editor/dom.js'].lineData[580]++;
  while (visit152_580_1(node && visit153_580_2(node != $documentElement))) {
    _$jscoverage['/editor/dom.js'].lineData[581]++;
    address.unshift(Dom._4e_index(node, normalized));
    _$jscoverage['/editor/dom.js'].lineData[582]++;
    node = node.parentNode;
  }
  _$jscoverage['/editor/dom.js'].lineData[585]++;
  return address;
}, 
  _4e_remove: function(el, preserveChildren) {
  _$jscoverage['/editor/dom.js'].functionData[22]++;
  _$jscoverage['/editor/dom.js'].lineData[594]++;
  var parent = el.parentNode;
  _$jscoverage['/editor/dom.js'].lineData[595]++;
  if (visit154_595_1(parent)) {
    _$jscoverage['/editor/dom.js'].lineData[596]++;
    if (visit155_596_1(preserveChildren)) {
      _$jscoverage['/editor/dom.js'].lineData[598]++;
      for (var child; child = el.firstChild; ) {
        _$jscoverage['/editor/dom.js'].lineData[599]++;
        parent.insertBefore(el.removeChild(child), el);
      }
    }
    _$jscoverage['/editor/dom.js'].lineData[602]++;
    parent.removeChild(el);
  }
  _$jscoverage['/editor/dom.js'].lineData[604]++;
  return el;
}, 
  _4e_trim: function(el) {
  _$jscoverage['/editor/dom.js'].functionData[23]++;
  _$jscoverage['/editor/dom.js'].lineData[612]++;
  Dom._4e_ltrim(el);
  _$jscoverage['/editor/dom.js'].lineData[613]++;
  Dom._4e_rtrim(el);
}, 
  _4e_ltrim: function(el) {
  _$jscoverage['/editor/dom.js'].functionData[24]++;
  _$jscoverage['/editor/dom.js'].lineData[621]++;
  var child;
  _$jscoverage['/editor/dom.js'].lineData[622]++;
  while (child = el.firstChild) {
    _$jscoverage['/editor/dom.js'].lineData[623]++;
    if (visit156_623_1(child.nodeType == Dom.NodeType.TEXT_NODE)) {
      _$jscoverage['/editor/dom.js'].lineData[624]++;
      var trimmed = Utils.ltrim(child.nodeValue), originalLength = child.nodeValue.length;
      _$jscoverage['/editor/dom.js'].lineData[627]++;
      if (visit157_627_1(!trimmed)) {
        _$jscoverage['/editor/dom.js'].lineData[628]++;
        el.removeChild(child);
        _$jscoverage['/editor/dom.js'].lineData[629]++;
        continue;
      } else {
        _$jscoverage['/editor/dom.js'].lineData[631]++;
        if (visit158_631_1(trimmed.length < originalLength)) {
          _$jscoverage['/editor/dom.js'].lineData[632]++;
          Dom._4e_splitText(child, originalLength - trimmed.length);
          _$jscoverage['/editor/dom.js'].lineData[634]++;
          el.removeChild(el.firstChild);
        }
      }
    }
    _$jscoverage['/editor/dom.js'].lineData[637]++;
    break;
  }
}, 
  _4e_rtrim: function(el) {
  _$jscoverage['/editor/dom.js'].functionData[25]++;
  _$jscoverage['/editor/dom.js'].lineData[646]++;
  var child;
  _$jscoverage['/editor/dom.js'].lineData[647]++;
  while (child = el.lastChild) {
    _$jscoverage['/editor/dom.js'].lineData[648]++;
    if (visit159_648_1(child.type == Dom.NodeType.TEXT_NODE)) {
      _$jscoverage['/editor/dom.js'].lineData[649]++;
      var trimmed = Utils.rtrim(child.nodeValue), originalLength = child.nodeValue.length;
      _$jscoverage['/editor/dom.js'].lineData[651]++;
      if (visit160_651_1(!trimmed)) {
        _$jscoverage['/editor/dom.js'].lineData[652]++;
        el.removeChild(child);
        _$jscoverage['/editor/dom.js'].lineData[653]++;
        continue;
      } else {
        _$jscoverage['/editor/dom.js'].lineData[654]++;
        if (visit161_654_1(trimmed.length < originalLength)) {
          _$jscoverage['/editor/dom.js'].lineData[655]++;
          Dom._4e_splitText(child, trimmed.length);
          _$jscoverage['/editor/dom.js'].lineData[658]++;
          el.removeChild(el.lastChild);
        }
      }
    }
    _$jscoverage['/editor/dom.js'].lineData[661]++;
    break;
  }
  _$jscoverage['/editor/dom.js'].lineData[664]++;
  if (visit162_664_1(!UA['ie'] && !UA.opera)) {
    _$jscoverage['/editor/dom.js'].lineData[665]++;
    child = el.lastChild;
    _$jscoverage['/editor/dom.js'].lineData[666]++;
    if (visit163_666_1(child && visit164_667_1(visit165_667_2(child.nodeType == 1) && visit166_668_1(Dom.nodeName(child) == 'br')))) {
      _$jscoverage['/editor/dom.js'].lineData[669]++;
      el.removeChild(child);
    }
  }
}, 
  _4e_appendBogus: function(el) {
  _$jscoverage['/editor/dom.js'].functionData[26]++;
  _$jscoverage['/editor/dom.js'].lineData[679]++;
  var lastChild = el.lastChild, bogus;
  _$jscoverage['/editor/dom.js'].lineData[682]++;
  while (visit167_682_1(lastChild && visit168_683_1(visit169_683_2(lastChild.nodeType == Dom.NodeType.TEXT_NODE) && !S.trim(lastChild.nodeValue)))) {
    _$jscoverage['/editor/dom.js'].lineData[685]++;
    lastChild = lastChild.previousSibling;
  }
  _$jscoverage['/editor/dom.js'].lineData[688]++;
  if (visit170_688_1(!lastChild || visit171_689_1(visit172_689_2(lastChild.nodeType == Dom.NodeType.TEXT_NODE) || visit173_690_1(Dom.nodeName(lastChild) !== 'br')))) {
    _$jscoverage['/editor/dom.js'].lineData[691]++;
    bogus = UA.opera ? el.ownerDocument.createTextNode('') : el.ownerDocument.createElement('br');
    _$jscoverage['/editor/dom.js'].lineData[697]++;
    el.appendChild(bogus);
  }
}, 
  _4e_setMarker: function(element, database, name, value) {
  _$jscoverage['/editor/dom.js'].functionData[27]++;
  _$jscoverage['/editor/dom.js'].lineData[709]++;
  element = normalEl(element);
  _$jscoverage['/editor/dom.js'].lineData[710]++;
  var id = visit174_710_1(element.data('list_marker_id') || (element.data('list_marker_id', S.guid()).data('list_marker_id'))), markerNames = visit175_712_1(element.data('list_marker_names') || (element.data('list_marker_names', {}).data('list_marker_names')));
  _$jscoverage['/editor/dom.js'].lineData[714]++;
  database[id] = element;
  _$jscoverage['/editor/dom.js'].lineData[715]++;
  markerNames[name] = 1;
  _$jscoverage['/editor/dom.js'].lineData[716]++;
  return element.data(name, value);
}, 
  _4e_clearMarkers: function(element, database, removeFromDatabase) {
  _$jscoverage['/editor/dom.js'].functionData[28]++;
  _$jscoverage['/editor/dom.js'].lineData[726]++;
  element = normalEl(element);
  _$jscoverage['/editor/dom.js'].lineData[727]++;
  var names = element.data('list_marker_names'), id = element.data('list_marker_id');
  _$jscoverage['/editor/dom.js'].lineData[729]++;
  for (var i in names) {
    _$jscoverage['/editor/dom.js'].lineData[730]++;
    element.removeData(i);
  }
  _$jscoverage['/editor/dom.js'].lineData[732]++;
  element.removeData('list_marker_names');
  _$jscoverage['/editor/dom.js'].lineData[733]++;
  if (visit176_733_1(removeFromDatabase)) {
    _$jscoverage['/editor/dom.js'].lineData[734]++;
    element.removeData('list_marker_id');
    _$jscoverage['/editor/dom.js'].lineData[735]++;
    delete database[id];
  }
}, 
  _4e_copyAttributes: function(el, target, skipAttributes) {
  _$jscoverage['/editor/dom.js'].functionData[29]++;
  _$jscoverage['/editor/dom.js'].lineData[746]++;
  target = normalEl(target);
  _$jscoverage['/editor/dom.js'].lineData[747]++;
  var attributes = el.attributes;
  _$jscoverage['/editor/dom.js'].lineData[748]++;
  skipAttributes = visit177_748_1(skipAttributes || {});
  _$jscoverage['/editor/dom.js'].lineData[750]++;
  for (var n = 0; visit178_750_1(n < attributes.length); n++) {
    _$jscoverage['/editor/dom.js'].lineData[753]++;
    var attribute = attributes[n], attrName = attribute.name.toLowerCase(), attrValue;
    _$jscoverage['/editor/dom.js'].lineData[758]++;
    if (visit179_758_1(attrName in skipAttributes)) {
      _$jscoverage['/editor/dom.js'].lineData[759]++;
      continue;
    }
    _$jscoverage['/editor/dom.js'].lineData[762]++;
    if (visit180_762_1(visit181_762_2(attrName == 'checked') && (attrValue = Dom.attr(el, attrName)))) {
      _$jscoverage['/editor/dom.js'].lineData[763]++;
      target.attr(attrName, attrValue);
    } else {
      _$jscoverage['/editor/dom.js'].lineData[766]++;
      if (visit182_766_1(attribute.specified || (visit183_767_1(UA['ie'] && visit184_767_2(attribute.value && visit185_767_3(attrName == 'value')))))) {
        _$jscoverage['/editor/dom.js'].lineData[768]++;
        attrValue = Dom.attr(el, attrName);
        _$jscoverage['/editor/dom.js'].lineData[769]++;
        if (visit186_769_1(attrValue === NULL)) {
          _$jscoverage['/editor/dom.js'].lineData[770]++;
          attrValue = attribute.nodeValue;
        }
        _$jscoverage['/editor/dom.js'].lineData[772]++;
        target.attr(attrName, attrValue);
      }
    }
  }
  _$jscoverage['/editor/dom.js'].lineData[777]++;
  if (visit187_777_1(el.style.cssText !== '')) {
    _$jscoverage['/editor/dom.js'].lineData[778]++;
    target[0].style.cssText = el.style.cssText;
  }
}, 
  _4e_isEditable: function(el) {
  _$jscoverage['/editor/dom.js'].functionData[30]++;
  _$jscoverage['/editor/dom.js'].lineData[788]++;
  var name = Dom.nodeName(el), dtd = visit188_789_1(!xhtml_dtd.$nonEditable[name] && (visit189_790_1(xhtml_dtd[name] || xhtml_dtd["span"])));
  _$jscoverage['/editor/dom.js'].lineData[792]++;
  return visit190_792_1(dtd && dtd['#text']);
}, 
  _4e_getByAddress: function(doc, address, normalized) {
  _$jscoverage['/editor/dom.js'].functionData[31]++;
  _$jscoverage['/editor/dom.js'].lineData[803]++;
  var $ = doc.documentElement;
  _$jscoverage['/editor/dom.js'].lineData[805]++;
  for (var i = 0; visit191_805_1($ && visit192_805_2(i < address.length)); i++) {
    _$jscoverage['/editor/dom.js'].lineData[806]++;
    var target = address[i];
    _$jscoverage['/editor/dom.js'].lineData[808]++;
    if (visit193_808_1(!normalized)) {
      _$jscoverage['/editor/dom.js'].lineData[809]++;
      $ = $.childNodes[target];
      _$jscoverage['/editor/dom.js'].lineData[810]++;
      continue;
    }
    _$jscoverage['/editor/dom.js'].lineData[813]++;
    var currentIndex = -1;
    _$jscoverage['/editor/dom.js'].lineData[815]++;
    for (var j = 0; visit194_815_1(j < $.childNodes.length); j++) {
      _$jscoverage['/editor/dom.js'].lineData[816]++;
      var candidate = $.childNodes[j];
      _$jscoverage['/editor/dom.js'].lineData[818]++;
      if (visit195_818_1(visit196_818_2(normalized === TRUE) && visit197_819_1(visit198_819_2(candidate.nodeType == 3) && visit199_820_1(candidate.previousSibling && visit200_821_1(candidate.previousSibling.nodeType == 3))))) {
        _$jscoverage['/editor/dom.js'].lineData[822]++;
        continue;
      }
      _$jscoverage['/editor/dom.js'].lineData[825]++;
      currentIndex++;
      _$jscoverage['/editor/dom.js'].lineData[827]++;
      if (visit201_827_1(currentIndex == target)) {
        _$jscoverage['/editor/dom.js'].lineData[828]++;
        $ = candidate;
        _$jscoverage['/editor/dom.js'].lineData[829]++;
        break;
      }
    }
  }
  _$jscoverage['/editor/dom.js'].lineData[834]++;
  return $;
}};
  _$jscoverage['/editor/dom.js'].lineData[839]++;
  function mergeElements(element, isNext) {
    _$jscoverage['/editor/dom.js'].functionData[32]++;
    _$jscoverage['/editor/dom.js'].lineData[840]++;
    var sibling = element[isNext ? "next" : "prev"](undefined, 1);
    _$jscoverage['/editor/dom.js'].lineData[842]++;
    if (visit202_842_1(sibling && visit203_842_2(sibling[0].nodeType == NodeType.ELEMENT_NODE))) {
      _$jscoverage['/editor/dom.js'].lineData[846]++;
      var pendingNodes = [];
      _$jscoverage['/editor/dom.js'].lineData[848]++;
      while (visit204_848_1(sibling.attr('_ke_bookmark') || sibling._4e_isEmptyInlineRemovable(undefined))) {
        _$jscoverage['/editor/dom.js'].lineData[849]++;
        pendingNodes.push(sibling);
        _$jscoverage['/editor/dom.js'].lineData[850]++;
        sibling = isNext ? sibling.next(undefined, 1) : sibling.prev(undefined, 1);
        _$jscoverage['/editor/dom.js'].lineData[851]++;
        if (visit205_851_1(!sibling)) {
          _$jscoverage['/editor/dom.js'].lineData[852]++;
          return;
        }
      }
      _$jscoverage['/editor/dom.js'].lineData[856]++;
      if (visit206_856_1(element._4e_isIdentical(sibling, undefined))) {
        _$jscoverage['/editor/dom.js'].lineData[859]++;
        var innerSibling = new Node(isNext ? element[0].lastChild : element[0].firstChild);
        _$jscoverage['/editor/dom.js'].lineData[862]++;
        while (pendingNodes.length) {
          _$jscoverage['/editor/dom.js'].lineData[863]++;
          pendingNodes.shift()._4e_move(element, !isNext, undefined);
        }
        _$jscoverage['/editor/dom.js'].lineData[866]++;
        sibling._4e_moveChildren(element, !isNext, undefined);
        _$jscoverage['/editor/dom.js'].lineData[867]++;
        sibling.remove();
        _$jscoverage['/editor/dom.js'].lineData[870]++;
        if (visit207_870_1(innerSibling[0] && visit208_870_2(innerSibling[0].nodeType == NodeType.ELEMENT_NODE))) {
          _$jscoverage['/editor/dom.js'].lineData[871]++;
          innerSibling._4e_mergeSiblings();
        }
      }
    }
  }
  _$jscoverage['/editor/dom.js'].lineData[877]++;
  Utils.injectDom(editorDom);
}, {
  requires: ['./base', './utils', 'node']});
