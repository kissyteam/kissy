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
if (! _$jscoverage['/editor.js']) {
  _$jscoverage['/editor.js'] = {};
  _$jscoverage['/editor.js'].lineData = [];
  _$jscoverage['/editor.js'].lineData[6] = 0;
  _$jscoverage['/editor.js'].lineData[7] = 0;
  _$jscoverage['/editor.js'].lineData[8] = 0;
  _$jscoverage['/editor.js'].lineData[9] = 0;
  _$jscoverage['/editor.js'].lineData[10] = 0;
  _$jscoverage['/editor.js'].lineData[11] = 0;
  _$jscoverage['/editor.js'].lineData[12] = 0;
  _$jscoverage['/editor.js'].lineData[13] = 0;
  _$jscoverage['/editor.js'].lineData[14] = 0;
  _$jscoverage['/editor.js'].lineData[15] = 0;
  _$jscoverage['/editor.js'].lineData[16] = 0;
  _$jscoverage['/editor.js'].lineData[17] = 0;
  _$jscoverage['/editor.js'].lineData[18] = 0;
  _$jscoverage['/editor.js'].lineData[19] = 0;
  _$jscoverage['/editor.js'].lineData[20] = 0;
  _$jscoverage['/editor.js'].lineData[21] = 0;
  _$jscoverage['/editor.js'].lineData[22] = 0;
  _$jscoverage['/editor.js'].lineData[46] = 0;
  _$jscoverage['/editor.js'].lineData[51] = 0;
  _$jscoverage['/editor.js'].lineData[53] = 0;
  _$jscoverage['/editor.js'].lineData[55] = 0;
  _$jscoverage['/editor.js'].lineData[56] = 0;
  _$jscoverage['/editor.js'].lineData[57] = 0;
  _$jscoverage['/editor.js'].lineData[59] = 0;
  _$jscoverage['/editor.js'].lineData[64] = 0;
  _$jscoverage['/editor.js'].lineData[65] = 0;
  _$jscoverage['/editor.js'].lineData[66] = 0;
  _$jscoverage['/editor.js'].lineData[67] = 0;
  _$jscoverage['/editor.js'].lineData[68] = 0;
  _$jscoverage['/editor.js'].lineData[72] = 0;
  _$jscoverage['/editor.js'].lineData[77] = 0;
  _$jscoverage['/editor.js'].lineData[80] = 0;
  _$jscoverage['/editor.js'].lineData[83] = 0;
  _$jscoverage['/editor.js'].lineData[84] = 0;
  _$jscoverage['/editor.js'].lineData[86] = 0;
  _$jscoverage['/editor.js'].lineData[87] = 0;
  _$jscoverage['/editor.js'].lineData[91] = 0;
  _$jscoverage['/editor.js'].lineData[92] = 0;
  _$jscoverage['/editor.js'].lineData[96] = 0;
  _$jscoverage['/editor.js'].lineData[98] = 0;
  _$jscoverage['/editor.js'].lineData[99] = 0;
  _$jscoverage['/editor.js'].lineData[102] = 0;
  _$jscoverage['/editor.js'].lineData[103] = 0;
  _$jscoverage['/editor.js'].lineData[110] = 0;
  _$jscoverage['/editor.js'].lineData[114] = 0;
  _$jscoverage['/editor.js'].lineData[116] = 0;
  _$jscoverage['/editor.js'].lineData[118] = 0;
  _$jscoverage['/editor.js'].lineData[119] = 0;
  _$jscoverage['/editor.js'].lineData[123] = 0;
  _$jscoverage['/editor.js'].lineData[126] = 0;
  _$jscoverage['/editor.js'].lineData[127] = 0;
  _$jscoverage['/editor.js'].lineData[128] = 0;
  _$jscoverage['/editor.js'].lineData[129] = 0;
  _$jscoverage['/editor.js'].lineData[132] = 0;
  _$jscoverage['/editor.js'].lineData[133] = 0;
  _$jscoverage['/editor.js'].lineData[134] = 0;
  _$jscoverage['/editor.js'].lineData[136] = 0;
  _$jscoverage['/editor.js'].lineData[137] = 0;
  _$jscoverage['/editor.js'].lineData[143] = 0;
  _$jscoverage['/editor.js'].lineData[145] = 0;
  _$jscoverage['/editor.js'].lineData[146] = 0;
  _$jscoverage['/editor.js'].lineData[151] = 0;
  _$jscoverage['/editor.js'].lineData[156] = 0;
  _$jscoverage['/editor.js'].lineData[159] = 0;
  _$jscoverage['/editor.js'].lineData[162] = 0;
  _$jscoverage['/editor.js'].lineData[163] = 0;
  _$jscoverage['/editor.js'].lineData[167] = 0;
  _$jscoverage['/editor.js'].lineData[169] = 0;
  _$jscoverage['/editor.js'].lineData[171] = 0;
  _$jscoverage['/editor.js'].lineData[173] = 0;
  _$jscoverage['/editor.js'].lineData[175] = 0;
  _$jscoverage['/editor.js'].lineData[178] = 0;
  _$jscoverage['/editor.js'].lineData[179] = 0;
  _$jscoverage['/editor.js'].lineData[180] = 0;
  _$jscoverage['/editor.js'].lineData[184] = 0;
  _$jscoverage['/editor.js'].lineData[185] = 0;
  _$jscoverage['/editor.js'].lineData[192] = 0;
  _$jscoverage['/editor.js'].lineData[193] = 0;
  _$jscoverage['/editor.js'].lineData[201] = 0;
  _$jscoverage['/editor.js'].lineData[209] = 0;
  _$jscoverage['/editor.js'].lineData[218] = 0;
  _$jscoverage['/editor.js'].lineData[228] = 0;
  _$jscoverage['/editor.js'].lineData[229] = 0;
  _$jscoverage['/editor.js'].lineData[231] = 0;
  _$jscoverage['/editor.js'].lineData[232] = 0;
  _$jscoverage['/editor.js'].lineData[246] = 0;
  _$jscoverage['/editor.js'].lineData[255] = 0;
  _$jscoverage['/editor.js'].lineData[265] = 0;
  _$jscoverage['/editor.js'].lineData[268] = 0;
  _$jscoverage['/editor.js'].lineData[269] = 0;
  _$jscoverage['/editor.js'].lineData[270] = 0;
  _$jscoverage['/editor.js'].lineData[271] = 0;
  _$jscoverage['/editor.js'].lineData[273] = 0;
  _$jscoverage['/editor.js'].lineData[274] = 0;
  _$jscoverage['/editor.js'].lineData[284] = 0;
  _$jscoverage['/editor.js'].lineData[288] = 0;
  _$jscoverage['/editor.js'].lineData[291] = 0;
  _$jscoverage['/editor.js'].lineData[293] = 0;
  _$jscoverage['/editor.js'].lineData[294] = 0;
  _$jscoverage['/editor.js'].lineData[296] = 0;
  _$jscoverage['/editor.js'].lineData[297] = 0;
  _$jscoverage['/editor.js'].lineData[300] = 0;
  _$jscoverage['/editor.js'].lineData[301] = 0;
  _$jscoverage['/editor.js'].lineData[312] = 0;
  _$jscoverage['/editor.js'].lineData[315] = 0;
  _$jscoverage['/editor.js'].lineData[316] = 0;
  _$jscoverage['/editor.js'].lineData[318] = 0;
  _$jscoverage['/editor.js'].lineData[319] = 0;
  _$jscoverage['/editor.js'].lineData[321] = 0;
  _$jscoverage['/editor.js'].lineData[324] = 0;
  _$jscoverage['/editor.js'].lineData[325] = 0;
  _$jscoverage['/editor.js'].lineData[327] = 0;
  _$jscoverage['/editor.js'].lineData[329] = 0;
  _$jscoverage['/editor.js'].lineData[333] = 0;
  _$jscoverage['/editor.js'].lineData[334] = 0;
  _$jscoverage['/editor.js'].lineData[336] = 0;
  _$jscoverage['/editor.js'].lineData[346] = 0;
  _$jscoverage['/editor.js'].lineData[354] = 0;
  _$jscoverage['/editor.js'].lineData[355] = 0;
  _$jscoverage['/editor.js'].lineData[364] = 0;
  _$jscoverage['/editor.js'].lineData[373] = 0;
  _$jscoverage['/editor.js'].lineData[377] = 0;
  _$jscoverage['/editor.js'].lineData[378] = 0;
  _$jscoverage['/editor.js'].lineData[379] = 0;
  _$jscoverage['/editor.js'].lineData[380] = 0;
  _$jscoverage['/editor.js'].lineData[381] = 0;
  _$jscoverage['/editor.js'].lineData[383] = 0;
  _$jscoverage['/editor.js'].lineData[391] = 0;
  _$jscoverage['/editor.js'].lineData[394] = 0;
  _$jscoverage['/editor.js'].lineData[395] = 0;
  _$jscoverage['/editor.js'].lineData[397] = 0;
  _$jscoverage['/editor.js'].lineData[398] = 0;
  _$jscoverage['/editor.js'].lineData[400] = 0;
  _$jscoverage['/editor.js'].lineData[403] = 0;
  _$jscoverage['/editor.js'].lineData[407] = 0;
  _$jscoverage['/editor.js'].lineData[409] = 0;
  _$jscoverage['/editor.js'].lineData[410] = 0;
  _$jscoverage['/editor.js'].lineData[414] = 0;
  _$jscoverage['/editor.js'].lineData[422] = 0;
  _$jscoverage['/editor.js'].lineData[424] = 0;
  _$jscoverage['/editor.js'].lineData[425] = 0;
  _$jscoverage['/editor.js'].lineData[435] = 0;
  _$jscoverage['/editor.js'].lineData[438] = 0;
  _$jscoverage['/editor.js'].lineData[439] = 0;
  _$jscoverage['/editor.js'].lineData[440] = 0;
  _$jscoverage['/editor.js'].lineData[441] = 0;
  _$jscoverage['/editor.js'].lineData[451] = 0;
  _$jscoverage['/editor.js'].lineData[460] = 0;
  _$jscoverage['/editor.js'].lineData[463] = 0;
  _$jscoverage['/editor.js'].lineData[464] = 0;
  _$jscoverage['/editor.js'].lineData[465] = 0;
  _$jscoverage['/editor.js'].lineData[466] = 0;
  _$jscoverage['/editor.js'].lineData[467] = 0;
  _$jscoverage['/editor.js'].lineData[468] = 0;
  _$jscoverage['/editor.js'].lineData[477] = 0;
  _$jscoverage['/editor.js'].lineData[480] = 0;
  _$jscoverage['/editor.js'].lineData[481] = 0;
  _$jscoverage['/editor.js'].lineData[482] = 0;
  _$jscoverage['/editor.js'].lineData[485] = 0;
  _$jscoverage['/editor.js'].lineData[487] = 0;
  _$jscoverage['/editor.js'].lineData[488] = 0;
  _$jscoverage['/editor.js'].lineData[499] = 0;
  _$jscoverage['/editor.js'].lineData[500] = 0;
  _$jscoverage['/editor.js'].lineData[501] = 0;
  _$jscoverage['/editor.js'].lineData[502] = 0;
  _$jscoverage['/editor.js'].lineData[512] = 0;
  _$jscoverage['/editor.js'].lineData[521] = 0;
  _$jscoverage['/editor.js'].lineData[522] = 0;
  _$jscoverage['/editor.js'].lineData[523] = 0;
  _$jscoverage['/editor.js'].lineData[526] = 0;
  _$jscoverage['/editor.js'].lineData[527] = 0;
  _$jscoverage['/editor.js'].lineData[528] = 0;
  _$jscoverage['/editor.js'].lineData[529] = 0;
  _$jscoverage['/editor.js'].lineData[531] = 0;
  _$jscoverage['/editor.js'].lineData[532] = 0;
  _$jscoverage['/editor.js'].lineData[533] = 0;
  _$jscoverage['/editor.js'].lineData[549] = 0;
  _$jscoverage['/editor.js'].lineData[550] = 0;
  _$jscoverage['/editor.js'].lineData[551] = 0;
  _$jscoverage['/editor.js'].lineData[560] = 0;
  _$jscoverage['/editor.js'].lineData[562] = 0;
  _$jscoverage['/editor.js'].lineData[563] = 0;
  _$jscoverage['/editor.js'].lineData[566] = 0;
  _$jscoverage['/editor.js'].lineData[568] = 0;
  _$jscoverage['/editor.js'].lineData[582] = 0;
  _$jscoverage['/editor.js'].lineData[583] = 0;
  _$jscoverage['/editor.js'].lineData[586] = 0;
  _$jscoverage['/editor.js'].lineData[588] = 0;
  _$jscoverage['/editor.js'].lineData[589] = 0;
  _$jscoverage['/editor.js'].lineData[592] = 0;
  _$jscoverage['/editor.js'].lineData[593] = 0;
  _$jscoverage['/editor.js'].lineData[596] = 0;
  _$jscoverage['/editor.js'].lineData[597] = 0;
  _$jscoverage['/editor.js'].lineData[601] = 0;
  _$jscoverage['/editor.js'].lineData[602] = 0;
  _$jscoverage['/editor.js'].lineData[605] = 0;
  _$jscoverage['/editor.js'].lineData[608] = 0;
  _$jscoverage['/editor.js'].lineData[609] = 0;
  _$jscoverage['/editor.js'].lineData[610] = 0;
  _$jscoverage['/editor.js'].lineData[611] = 0;
  _$jscoverage['/editor.js'].lineData[614] = 0;
  _$jscoverage['/editor.js'].lineData[617] = 0;
  _$jscoverage['/editor.js'].lineData[620] = 0;
  _$jscoverage['/editor.js'].lineData[621] = 0;
  _$jscoverage['/editor.js'].lineData[624] = 0;
  _$jscoverage['/editor.js'].lineData[625] = 0;
  _$jscoverage['/editor.js'].lineData[631] = 0;
  _$jscoverage['/editor.js'].lineData[632] = 0;
  _$jscoverage['/editor.js'].lineData[642] = 0;
  _$jscoverage['/editor.js'].lineData[646] = 0;
  _$jscoverage['/editor.js'].lineData[647] = 0;
  _$jscoverage['/editor.js'].lineData[650] = 0;
  _$jscoverage['/editor.js'].lineData[651] = 0;
  _$jscoverage['/editor.js'].lineData[654] = 0;
  _$jscoverage['/editor.js'].lineData[655] = 0;
  _$jscoverage['/editor.js'].lineData[659] = 0;
  _$jscoverage['/editor.js'].lineData[660] = 0;
  _$jscoverage['/editor.js'].lineData[661] = 0;
  _$jscoverage['/editor.js'].lineData[662] = 0;
  _$jscoverage['/editor.js'].lineData[664] = 0;
  _$jscoverage['/editor.js'].lineData[665] = 0;
  _$jscoverage['/editor.js'].lineData[667] = 0;
  _$jscoverage['/editor.js'].lineData[674] = 0;
  _$jscoverage['/editor.js'].lineData[675] = 0;
  _$jscoverage['/editor.js'].lineData[677] = 0;
  _$jscoverage['/editor.js'].lineData[680] = 0;
  _$jscoverage['/editor.js'].lineData[681] = 0;
  _$jscoverage['/editor.js'].lineData[683] = 0;
  _$jscoverage['/editor.js'].lineData[685] = 0;
  _$jscoverage['/editor.js'].lineData[686] = 0;
  _$jscoverage['/editor.js'].lineData[687] = 0;
  _$jscoverage['/editor.js'].lineData[689] = 0;
  _$jscoverage['/editor.js'].lineData[690] = 0;
  _$jscoverage['/editor.js'].lineData[692] = 0;
  _$jscoverage['/editor.js'].lineData[698] = 0;
  _$jscoverage['/editor.js'].lineData[699] = 0;
  _$jscoverage['/editor.js'].lineData[701] = 0;
  _$jscoverage['/editor.js'].lineData[713] = 0;
  _$jscoverage['/editor.js'].lineData[714] = 0;
  _$jscoverage['/editor.js'].lineData[715] = 0;
  _$jscoverage['/editor.js'].lineData[716] = 0;
  _$jscoverage['/editor.js'].lineData[717] = 0;
  _$jscoverage['/editor.js'].lineData[718] = 0;
  _$jscoverage['/editor.js'].lineData[719] = 0;
  _$jscoverage['/editor.js'].lineData[720] = 0;
  _$jscoverage['/editor.js'].lineData[721] = 0;
  _$jscoverage['/editor.js'].lineData[723] = 0;
  _$jscoverage['/editor.js'].lineData[724] = 0;
  _$jscoverage['/editor.js'].lineData[726] = 0;
  _$jscoverage['/editor.js'].lineData[727] = 0;
  _$jscoverage['/editor.js'].lineData[729] = 0;
  _$jscoverage['/editor.js'].lineData[730] = 0;
  _$jscoverage['/editor.js'].lineData[731] = 0;
  _$jscoverage['/editor.js'].lineData[732] = 0;
  _$jscoverage['/editor.js'].lineData[733] = 0;
  _$jscoverage['/editor.js'].lineData[740] = 0;
  _$jscoverage['/editor.js'].lineData[741] = 0;
  _$jscoverage['/editor.js'].lineData[747] = 0;
  _$jscoverage['/editor.js'].lineData[749] = 0;
  _$jscoverage['/editor.js'].lineData[751] = 0;
  _$jscoverage['/editor.js'].lineData[753] = 0;
  _$jscoverage['/editor.js'].lineData[775] = 0;
  _$jscoverage['/editor.js'].lineData[777] = 0;
  _$jscoverage['/editor.js'].lineData[780] = 0;
  _$jscoverage['/editor.js'].lineData[781] = 0;
  _$jscoverage['/editor.js'].lineData[782] = 0;
  _$jscoverage['/editor.js'].lineData[786] = 0;
  _$jscoverage['/editor.js'].lineData[788] = 0;
  _$jscoverage['/editor.js'].lineData[789] = 0;
  _$jscoverage['/editor.js'].lineData[791] = 0;
  _$jscoverage['/editor.js'].lineData[792] = 0;
  _$jscoverage['/editor.js'].lineData[794] = 0;
  _$jscoverage['/editor.js'].lineData[801] = 0;
  _$jscoverage['/editor.js'].lineData[812] = 0;
  _$jscoverage['/editor.js'].lineData[813] = 0;
  _$jscoverage['/editor.js'].lineData[820] = 0;
  _$jscoverage['/editor.js'].lineData[821] = 0;
  _$jscoverage['/editor.js'].lineData[822] = 0;
  _$jscoverage['/editor.js'].lineData[823] = 0;
  _$jscoverage['/editor.js'].lineData[830] = 0;
  _$jscoverage['/editor.js'].lineData[836] = 0;
  _$jscoverage['/editor.js'].lineData[845] = 0;
  _$jscoverage['/editor.js'].lineData[846] = 0;
  _$jscoverage['/editor.js'].lineData[847] = 0;
  _$jscoverage['/editor.js'].lineData[848] = 0;
  _$jscoverage['/editor.js'].lineData[849] = 0;
  _$jscoverage['/editor.js'].lineData[856] = 0;
  _$jscoverage['/editor.js'].lineData[857] = 0;
  _$jscoverage['/editor.js'].lineData[858] = 0;
  _$jscoverage['/editor.js'].lineData[862] = 0;
  _$jscoverage['/editor.js'].lineData[864] = 0;
  _$jscoverage['/editor.js'].lineData[866] = 0;
  _$jscoverage['/editor.js'].lineData[867] = 0;
  _$jscoverage['/editor.js'].lineData[868] = 0;
  _$jscoverage['/editor.js'].lineData[874] = 0;
  _$jscoverage['/editor.js'].lineData[875] = 0;
  _$jscoverage['/editor.js'].lineData[876] = 0;
  _$jscoverage['/editor.js'].lineData[879] = 0;
  _$jscoverage['/editor.js'].lineData[889] = 0;
  _$jscoverage['/editor.js'].lineData[890] = 0;
  _$jscoverage['/editor.js'].lineData[891] = 0;
  _$jscoverage['/editor.js'].lineData[893] = 0;
  _$jscoverage['/editor.js'].lineData[895] = 0;
  _$jscoverage['/editor.js'].lineData[896] = 0;
  _$jscoverage['/editor.js'].lineData[897] = 0;
  _$jscoverage['/editor.js'].lineData[899] = 0;
  _$jscoverage['/editor.js'].lineData[900] = 0;
  _$jscoverage['/editor.js'].lineData[906] = 0;
  _$jscoverage['/editor.js'].lineData[907] = 0;
  _$jscoverage['/editor.js'].lineData[908] = 0;
  _$jscoverage['/editor.js'].lineData[910] = 0;
  _$jscoverage['/editor.js'].lineData[915] = 0;
  _$jscoverage['/editor.js'].lineData[916] = 0;
  _$jscoverage['/editor.js'].lineData[926] = 0;
  _$jscoverage['/editor.js'].lineData[927] = 0;
  _$jscoverage['/editor.js'].lineData[928] = 0;
  _$jscoverage['/editor.js'].lineData[929] = 0;
  _$jscoverage['/editor.js'].lineData[930] = 0;
  _$jscoverage['/editor.js'].lineData[934] = 0;
  _$jscoverage['/editor.js'].lineData[935] = 0;
  _$jscoverage['/editor.js'].lineData[936] = 0;
  _$jscoverage['/editor.js'].lineData[937] = 0;
  _$jscoverage['/editor.js'].lineData[943] = 0;
  _$jscoverage['/editor.js'].lineData[944] = 0;
  _$jscoverage['/editor.js'].lineData[945] = 0;
  _$jscoverage['/editor.js'].lineData[952] = 0;
  _$jscoverage['/editor.js'].lineData[953] = 0;
  _$jscoverage['/editor.js'].lineData[955] = 0;
  _$jscoverage['/editor.js'].lineData[956] = 0;
  _$jscoverage['/editor.js'].lineData[957] = 0;
  _$jscoverage['/editor.js'].lineData[959] = 0;
  _$jscoverage['/editor.js'].lineData[960] = 0;
  _$jscoverage['/editor.js'].lineData[961] = 0;
  _$jscoverage['/editor.js'].lineData[965] = 0;
  _$jscoverage['/editor.js'].lineData[971] = 0;
  _$jscoverage['/editor.js'].lineData[972] = 0;
  _$jscoverage['/editor.js'].lineData[974] = 0;
  _$jscoverage['/editor.js'].lineData[975] = 0;
  _$jscoverage['/editor.js'].lineData[978] = 0;
  _$jscoverage['/editor.js'].lineData[981] = 0;
  _$jscoverage['/editor.js'].lineData[985] = 0;
  _$jscoverage['/editor.js'].lineData[986] = 0;
  _$jscoverage['/editor.js'].lineData[987] = 0;
  _$jscoverage['/editor.js'].lineData[992] = 0;
  _$jscoverage['/editor.js'].lineData[998] = 0;
  _$jscoverage['/editor.js'].lineData[999] = 0;
  _$jscoverage['/editor.js'].lineData[1001] = 0;
  _$jscoverage['/editor.js'].lineData[1002] = 0;
  _$jscoverage['/editor.js'].lineData[1004] = 0;
  _$jscoverage['/editor.js'].lineData[1006] = 0;
  _$jscoverage['/editor.js'].lineData[1009] = 0;
  _$jscoverage['/editor.js'].lineData[1011] = 0;
  _$jscoverage['/editor.js'].lineData[1012] = 0;
  _$jscoverage['/editor.js'].lineData[1013] = 0;
  _$jscoverage['/editor.js'].lineData[1014] = 0;
  _$jscoverage['/editor.js'].lineData[1022] = 0;
  _$jscoverage['/editor.js'].lineData[1023] = 0;
  _$jscoverage['/editor.js'].lineData[1024] = 0;
  _$jscoverage['/editor.js'].lineData[1025] = 0;
  _$jscoverage['/editor.js'].lineData[1026] = 0;
  _$jscoverage['/editor.js'].lineData[1027] = 0;
  _$jscoverage['/editor.js'].lineData[1035] = 0;
  _$jscoverage['/editor.js'].lineData[1036] = 0;
  _$jscoverage['/editor.js'].lineData[1037] = 0;
  _$jscoverage['/editor.js'].lineData[1038] = 0;
  _$jscoverage['/editor.js'].lineData[1039] = 0;
  _$jscoverage['/editor.js'].lineData[1045] = 0;
  _$jscoverage['/editor.js'].lineData[1046] = 0;
  _$jscoverage['/editor.js'].lineData[1047] = 0;
  _$jscoverage['/editor.js'].lineData[1048] = 0;
  _$jscoverage['/editor.js'].lineData[1050] = 0;
  _$jscoverage['/editor.js'].lineData[1056] = 0;
  _$jscoverage['/editor.js'].lineData[1060] = 0;
  _$jscoverage['/editor.js'].lineData[1061] = 0;
  _$jscoverage['/editor.js'].lineData[1064] = 0;
  _$jscoverage['/editor.js'].lineData[1065] = 0;
  _$jscoverage['/editor.js'].lineData[1066] = 0;
  _$jscoverage['/editor.js'].lineData[1067] = 0;
  _$jscoverage['/editor.js'].lineData[1071] = 0;
  _$jscoverage['/editor.js'].lineData[1098] = 0;
  _$jscoverage['/editor.js'].lineData[1099] = 0;
  _$jscoverage['/editor.js'].lineData[1102] = 0;
  _$jscoverage['/editor.js'].lineData[1103] = 0;
  _$jscoverage['/editor.js'].lineData[1110] = 0;
  _$jscoverage['/editor.js'].lineData[1111] = 0;
  _$jscoverage['/editor.js'].lineData[1119] = 0;
  _$jscoverage['/editor.js'].lineData[1124] = 0;
  _$jscoverage['/editor.js'].lineData[1127] = 0;
  _$jscoverage['/editor.js'].lineData[1128] = 0;
  _$jscoverage['/editor.js'].lineData[1129] = 0;
  _$jscoverage['/editor.js'].lineData[1132] = 0;
  _$jscoverage['/editor.js'].lineData[1133] = 0;
  _$jscoverage['/editor.js'].lineData[1134] = 0;
  _$jscoverage['/editor.js'].lineData[1135] = 0;
  _$jscoverage['/editor.js'].lineData[1136] = 0;
  _$jscoverage['/editor.js'].lineData[1137] = 0;
  _$jscoverage['/editor.js'].lineData[1139] = 0;
  _$jscoverage['/editor.js'].lineData[1140] = 0;
  _$jscoverage['/editor.js'].lineData[1141] = 0;
  _$jscoverage['/editor.js'].lineData[1145] = 0;
  _$jscoverage['/editor.js'].lineData[1149] = 0;
  _$jscoverage['/editor.js'].lineData[1150] = 0;
  _$jscoverage['/editor.js'].lineData[1151] = 0;
  _$jscoverage['/editor.js'].lineData[1153] = 0;
  _$jscoverage['/editor.js'].lineData[1158] = 0;
  _$jscoverage['/editor.js'].lineData[1159] = 0;
  _$jscoverage['/editor.js'].lineData[1161] = 0;
  _$jscoverage['/editor.js'].lineData[1162] = 0;
  _$jscoverage['/editor.js'].lineData[1163] = 0;
  _$jscoverage['/editor.js'].lineData[1165] = 0;
  _$jscoverage['/editor.js'].lineData[1166] = 0;
  _$jscoverage['/editor.js'].lineData[1167] = 0;
  _$jscoverage['/editor.js'].lineData[1171] = 0;
  _$jscoverage['/editor.js'].lineData[1175] = 0;
  _$jscoverage['/editor.js'].lineData[1176] = 0;
  _$jscoverage['/editor.js'].lineData[1177] = 0;
  _$jscoverage['/editor.js'].lineData[1179] = 0;
  _$jscoverage['/editor.js'].lineData[1185] = 0;
  _$jscoverage['/editor.js'].lineData[1186] = 0;
  _$jscoverage['/editor.js'].lineData[1188] = 0;
}
if (! _$jscoverage['/editor.js'].functionData) {
  _$jscoverage['/editor.js'].functionData = [];
  _$jscoverage['/editor.js'].functionData[0] = 0;
  _$jscoverage['/editor.js'].functionData[1] = 0;
  _$jscoverage['/editor.js'].functionData[2] = 0;
  _$jscoverage['/editor.js'].functionData[3] = 0;
  _$jscoverage['/editor.js'].functionData[4] = 0;
  _$jscoverage['/editor.js'].functionData[5] = 0;
  _$jscoverage['/editor.js'].functionData[6] = 0;
  _$jscoverage['/editor.js'].functionData[7] = 0;
  _$jscoverage['/editor.js'].functionData[8] = 0;
  _$jscoverage['/editor.js'].functionData[9] = 0;
  _$jscoverage['/editor.js'].functionData[10] = 0;
  _$jscoverage['/editor.js'].functionData[11] = 0;
  _$jscoverage['/editor.js'].functionData[12] = 0;
  _$jscoverage['/editor.js'].functionData[13] = 0;
  _$jscoverage['/editor.js'].functionData[14] = 0;
  _$jscoverage['/editor.js'].functionData[15] = 0;
  _$jscoverage['/editor.js'].functionData[16] = 0;
  _$jscoverage['/editor.js'].functionData[17] = 0;
  _$jscoverage['/editor.js'].functionData[18] = 0;
  _$jscoverage['/editor.js'].functionData[19] = 0;
  _$jscoverage['/editor.js'].functionData[20] = 0;
  _$jscoverage['/editor.js'].functionData[21] = 0;
  _$jscoverage['/editor.js'].functionData[22] = 0;
  _$jscoverage['/editor.js'].functionData[23] = 0;
  _$jscoverage['/editor.js'].functionData[24] = 0;
  _$jscoverage['/editor.js'].functionData[25] = 0;
  _$jscoverage['/editor.js'].functionData[26] = 0;
  _$jscoverage['/editor.js'].functionData[27] = 0;
  _$jscoverage['/editor.js'].functionData[28] = 0;
  _$jscoverage['/editor.js'].functionData[29] = 0;
  _$jscoverage['/editor.js'].functionData[30] = 0;
  _$jscoverage['/editor.js'].functionData[31] = 0;
  _$jscoverage['/editor.js'].functionData[32] = 0;
  _$jscoverage['/editor.js'].functionData[33] = 0;
  _$jscoverage['/editor.js'].functionData[34] = 0;
  _$jscoverage['/editor.js'].functionData[35] = 0;
  _$jscoverage['/editor.js'].functionData[36] = 0;
  _$jscoverage['/editor.js'].functionData[37] = 0;
  _$jscoverage['/editor.js'].functionData[38] = 0;
  _$jscoverage['/editor.js'].functionData[39] = 0;
  _$jscoverage['/editor.js'].functionData[40] = 0;
  _$jscoverage['/editor.js'].functionData[41] = 0;
  _$jscoverage['/editor.js'].functionData[42] = 0;
  _$jscoverage['/editor.js'].functionData[43] = 0;
  _$jscoverage['/editor.js'].functionData[44] = 0;
  _$jscoverage['/editor.js'].functionData[45] = 0;
  _$jscoverage['/editor.js'].functionData[46] = 0;
  _$jscoverage['/editor.js'].functionData[47] = 0;
  _$jscoverage['/editor.js'].functionData[48] = 0;
  _$jscoverage['/editor.js'].functionData[49] = 0;
  _$jscoverage['/editor.js'].functionData[50] = 0;
  _$jscoverage['/editor.js'].functionData[51] = 0;
  _$jscoverage['/editor.js'].functionData[52] = 0;
  _$jscoverage['/editor.js'].functionData[53] = 0;
  _$jscoverage['/editor.js'].functionData[54] = 0;
  _$jscoverage['/editor.js'].functionData[55] = 0;
  _$jscoverage['/editor.js'].functionData[56] = 0;
  _$jscoverage['/editor.js'].functionData[57] = 0;
  _$jscoverage['/editor.js'].functionData[58] = 0;
  _$jscoverage['/editor.js'].functionData[59] = 0;
  _$jscoverage['/editor.js'].functionData[60] = 0;
  _$jscoverage['/editor.js'].functionData[61] = 0;
  _$jscoverage['/editor.js'].functionData[62] = 0;
  _$jscoverage['/editor.js'].functionData[63] = 0;
  _$jscoverage['/editor.js'].functionData[64] = 0;
  _$jscoverage['/editor.js'].functionData[65] = 0;
  _$jscoverage['/editor.js'].functionData[66] = 0;
  _$jscoverage['/editor.js'].functionData[67] = 0;
  _$jscoverage['/editor.js'].functionData[68] = 0;
  _$jscoverage['/editor.js'].functionData[69] = 0;
  _$jscoverage['/editor.js'].functionData[70] = 0;
  _$jscoverage['/editor.js'].functionData[71] = 0;
  _$jscoverage['/editor.js'].functionData[72] = 0;
  _$jscoverage['/editor.js'].functionData[73] = 0;
  _$jscoverage['/editor.js'].functionData[74] = 0;
  _$jscoverage['/editor.js'].functionData[75] = 0;
  _$jscoverage['/editor.js'].functionData[76] = 0;
}
if (! _$jscoverage['/editor.js'].branchData) {
  _$jscoverage['/editor.js'].branchData = {};
  _$jscoverage['/editor.js'].branchData['30'] = [];
  _$jscoverage['/editor.js'].branchData['30'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['77'] = [];
  _$jscoverage['/editor.js'].branchData['77'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['78'] = [];
  _$jscoverage['/editor.js'].branchData['78'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['86'] = [];
  _$jscoverage['/editor.js'].branchData['86'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['92'] = [];
  _$jscoverage['/editor.js'].branchData['92'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['116'] = [];
  _$jscoverage['/editor.js'].branchData['116'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['116'][2] = new BranchData();
  _$jscoverage['/editor.js'].branchData['117'] = [];
  _$jscoverage['/editor.js'].branchData['117'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['117'][2] = new BranchData();
  _$jscoverage['/editor.js'].branchData['126'] = [];
  _$jscoverage['/editor.js'].branchData['126'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['132'] = [];
  _$jscoverage['/editor.js'].branchData['132'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['145'] = [];
  _$jscoverage['/editor.js'].branchData['145'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['156'] = [];
  _$jscoverage['/editor.js'].branchData['156'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['157'] = [];
  _$jscoverage['/editor.js'].branchData['157'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['162'] = [];
  _$jscoverage['/editor.js'].branchData['162'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['179'] = [];
  _$jscoverage['/editor.js'].branchData['179'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['270'] = [];
  _$jscoverage['/editor.js'].branchData['270'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['291'] = [];
  _$jscoverage['/editor.js'].branchData['291'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['296'] = [];
  _$jscoverage['/editor.js'].branchData['296'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['315'] = [];
  _$jscoverage['/editor.js'].branchData['315'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['318'] = [];
  _$jscoverage['/editor.js'].branchData['318'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['318'][2] = new BranchData();
  _$jscoverage['/editor.js'].branchData['324'] = [];
  _$jscoverage['/editor.js'].branchData['324'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['333'] = [];
  _$jscoverage['/editor.js'].branchData['333'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['377'] = [];
  _$jscoverage['/editor.js'].branchData['377'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['394'] = [];
  _$jscoverage['/editor.js'].branchData['394'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['400'] = [];
  _$jscoverage['/editor.js'].branchData['400'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['403'] = [];
  _$jscoverage['/editor.js'].branchData['403'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['403'][2] = new BranchData();
  _$jscoverage['/editor.js'].branchData['407'] = [];
  _$jscoverage['/editor.js'].branchData['407'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['437'] = [];
  _$jscoverage['/editor.js'].branchData['437'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['440'] = [];
  _$jscoverage['/editor.js'].branchData['440'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['481'] = [];
  _$jscoverage['/editor.js'].branchData['481'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['487'] = [];
  _$jscoverage['/editor.js'].branchData['487'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['501'] = [];
  _$jscoverage['/editor.js'].branchData['501'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['522'] = [];
  _$jscoverage['/editor.js'].branchData['522'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['528'] = [];
  _$jscoverage['/editor.js'].branchData['528'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['531'] = [];
  _$jscoverage['/editor.js'].branchData['531'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['562'] = [];
  _$jscoverage['/editor.js'].branchData['562'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['574'] = [];
  _$jscoverage['/editor.js'].branchData['574'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['582'] = [];
  _$jscoverage['/editor.js'].branchData['582'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['582'][2] = new BranchData();
  _$jscoverage['/editor.js'].branchData['588'] = [];
  _$jscoverage['/editor.js'].branchData['588'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['592'] = [];
  _$jscoverage['/editor.js'].branchData['592'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['592'][2] = new BranchData();
  _$jscoverage['/editor.js'].branchData['596'] = [];
  _$jscoverage['/editor.js'].branchData['596'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['601'] = [];
  _$jscoverage['/editor.js'].branchData['601'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['608'] = [];
  _$jscoverage['/editor.js'].branchData['608'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['611'] = [];
  _$jscoverage['/editor.js'].branchData['611'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['611'][2] = new BranchData();
  _$jscoverage['/editor.js'].branchData['611'][3] = new BranchData();
  _$jscoverage['/editor.js'].branchData['614'] = [];
  _$jscoverage['/editor.js'].branchData['614'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['615'] = [];
  _$jscoverage['/editor.js'].branchData['615'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['624'] = [];
  _$jscoverage['/editor.js'].branchData['624'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['624'][2] = new BranchData();
  _$jscoverage['/editor.js'].branchData['646'] = [];
  _$jscoverage['/editor.js'].branchData['646'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['650'] = [];
  _$jscoverage['/editor.js'].branchData['650'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['659'] = [];
  _$jscoverage['/editor.js'].branchData['659'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['661'] = [];
  _$jscoverage['/editor.js'].branchData['661'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['680'] = [];
  _$jscoverage['/editor.js'].branchData['680'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['683'] = [];
  _$jscoverage['/editor.js'].branchData['683'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['683'][2] = new BranchData();
  _$jscoverage['/editor.js'].branchData['683'][3] = new BranchData();
  _$jscoverage['/editor.js'].branchData['685'] = [];
  _$jscoverage['/editor.js'].branchData['685'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['714'] = [];
  _$jscoverage['/editor.js'].branchData['714'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['716'] = [];
  _$jscoverage['/editor.js'].branchData['716'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['720'] = [];
  _$jscoverage['/editor.js'].branchData['720'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['721'] = [];
  _$jscoverage['/editor.js'].branchData['721'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['723'] = [];
  _$jscoverage['/editor.js'].branchData['723'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['724'] = [];
  _$jscoverage['/editor.js'].branchData['724'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['726'] = [];
  _$jscoverage['/editor.js'].branchData['726'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['729'] = [];
  _$jscoverage['/editor.js'].branchData['729'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['775'] = [];
  _$jscoverage['/editor.js'].branchData['775'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['788'] = [];
  _$jscoverage['/editor.js'].branchData['788'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['791'] = [];
  _$jscoverage['/editor.js'].branchData['791'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['810'] = [];
  _$jscoverage['/editor.js'].branchData['810'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['821'] = [];
  _$jscoverage['/editor.js'].branchData['821'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['822'] = [];
  _$jscoverage['/editor.js'].branchData['822'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['845'] = [];
  _$jscoverage['/editor.js'].branchData['845'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['847'] = [];
  _$jscoverage['/editor.js'].branchData['847'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['864'] = [];
  _$jscoverage['/editor.js'].branchData['864'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['876'] = [];
  _$jscoverage['/editor.js'].branchData['876'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['877'] = [];
  _$jscoverage['/editor.js'].branchData['877'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['877'][2] = new BranchData();
  _$jscoverage['/editor.js'].branchData['899'] = [];
  _$jscoverage['/editor.js'].branchData['899'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['910'] = [];
  _$jscoverage['/editor.js'].branchData['910'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['926'] = [];
  _$jscoverage['/editor.js'].branchData['926'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['929'] = [];
  _$jscoverage['/editor.js'].branchData['929'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['936'] = [];
  _$jscoverage['/editor.js'].branchData['936'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['943'] = [];
  _$jscoverage['/editor.js'].branchData['943'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['943'][2] = new BranchData();
  _$jscoverage['/editor.js'].branchData['956'] = [];
  _$jscoverage['/editor.js'].branchData['956'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['971'] = [];
  _$jscoverage['/editor.js'].branchData['971'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['974'] = [];
  _$jscoverage['/editor.js'].branchData['974'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['981'] = [];
  _$jscoverage['/editor.js'].branchData['981'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['986'] = [];
  _$jscoverage['/editor.js'].branchData['986'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['992'] = [];
  _$jscoverage['/editor.js'].branchData['992'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['1001'] = [];
  _$jscoverage['/editor.js'].branchData['1001'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['1004'] = [];
  _$jscoverage['/editor.js'].branchData['1004'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['1022'] = [];
  _$jscoverage['/editor.js'].branchData['1022'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['1025'] = [];
  _$jscoverage['/editor.js'].branchData['1025'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['1035'] = [];
  _$jscoverage['/editor.js'].branchData['1035'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['1038'] = [];
  _$jscoverage['/editor.js'].branchData['1038'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['1045'] = [];
  _$jscoverage['/editor.js'].branchData['1045'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['1048'] = [];
  _$jscoverage['/editor.js'].branchData['1048'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['1048'][2] = new BranchData();
  _$jscoverage['/editor.js'].branchData['1066'] = [];
  _$jscoverage['/editor.js'].branchData['1066'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['1075'] = [];
  _$jscoverage['/editor.js'].branchData['1075'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['1082'] = [];
  _$jscoverage['/editor.js'].branchData['1082'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['1127'] = [];
  _$jscoverage['/editor.js'].branchData['1127'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['1149'] = [];
  _$jscoverage['/editor.js'].branchData['1149'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['1150'] = [];
  _$jscoverage['/editor.js'].branchData['1150'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['1158'] = [];
  _$jscoverage['/editor.js'].branchData['1158'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['1165'] = [];
  _$jscoverage['/editor.js'].branchData['1165'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['1176'] = [];
  _$jscoverage['/editor.js'].branchData['1176'][1] = new BranchData();
}
_$jscoverage['/editor.js'].branchData['1176'][1].init(13, 19, '!self.get(\'iframe\')');
function visit1256_1176_1(result) {
  _$jscoverage['/editor.js'].branchData['1176'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['1165'][1].init(880, 31, 'UA[\'gecko\'] && !iframe.__loaded');
function visit1255_1165_1(result) {
  _$jscoverage['/editor.js'].branchData['1165'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['1158'][1].init(555, 28, 'textarea.hasAttr(\'tabindex\')');
function visit1254_1158_1(result) {
  _$jscoverage['/editor.js'].branchData['1158'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['1150'][1].init(261, 9, 'iframeSrc');
function visit1253_1150_1(result) {
  _$jscoverage['/editor.js'].branchData['1150'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['1149'][1].init(212, 35, '$(window).getEmptyIframeSrc() || \'\'');
function visit1252_1149_1(result) {
  _$jscoverage['/editor.js'].branchData['1149'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['1127'][1].init(371, 9, 'IS_IE < 7');
function visit1251_1127_1(result) {
  _$jscoverage['/editor.js'].branchData['1127'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['1082'][1].init(518, 10, 'data || \'\'');
function visit1250_1082_1(result) {
  _$jscoverage['/editor.js'].branchData['1082'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['1075'][1].init(232, 17, 'S.UA.ieMode === 8');
function visit1249_1075_1(result) {
  _$jscoverage['/editor.js'].branchData['1075'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['1066'][1].init(216, 21, 'i < customLink.length');
function visit1248_1066_1(result) {
  _$jscoverage['/editor.js'].branchData['1066'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['1048'][2].init(72, 28, 'control.nodeName() === \'img\'');
function visit1247_1048_2(result) {
  _$jscoverage['/editor.js'].branchData['1048'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['1048'][1].init(72, 64, 'control.nodeName() === \'img\' && /ke_/.test(control[0].className)');
function visit1246_1048_1(result) {
  _$jscoverage['/editor.js'].branchData['1048'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['1045'][1].init(4837, 11, 'UA[\'gecko\']');
function visit1245_1045_1(result) {
  _$jscoverage['/editor.js'].branchData['1045'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['1038'][1].init(72, 75, 'S.inArray(control.nodeName(), [\'img\', \'hr\', \'input\', \'textarea\', \'select\'])');
function visit1244_1038_1(result) {
  _$jscoverage['/editor.js'].branchData['1038'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['1035'][1].init(4500, 12, 'UA[\'webkit\']');
function visit1243_1035_1(result) {
  _$jscoverage['/editor.js'].branchData['1035'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['1025'][1].init(25, 29, 'evt.keyCode in pageUpDownKeys');
function visit1242_1025_1(result) {
  _$jscoverage['/editor.js'].branchData['1025'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['1022'][1].init(1337, 30, 'doc.compatMode == \'CSS1Compat\'');
function visit1241_1022_1(result) {
  _$jscoverage['/editor.js'].branchData['1022'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['1004'][1].init(136, 7, 'control');
function visit1240_1004_1(result) {
  _$jscoverage['/editor.js'].branchData['1004'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['1001'][1].init(104, 26, 'keyCode in {\n  8: 1, \n  46: 1}');
function visit1239_1001_1(result) {
  _$jscoverage['/editor.js'].branchData['1001'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['992'][1].init(2647, 5, 'IS_IE');
function visit1238_992_1(result) {
  _$jscoverage['/editor.js'].branchData['992'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['986'][1].init(21, 19, '!self.__iframeFocus');
function visit1237_986_1(result) {
  _$jscoverage['/editor.js'].branchData['986'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['981'][1].init(2362, 11, 'UA[\'gecko\']');
function visit1236_981_1(result) {
  _$jscoverage['/editor.js'].branchData['981'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['974'][1].init(240, 11, 'UA[\'opera\']');
function visit1235_974_1(result) {
  _$jscoverage['/editor.js'].branchData['974'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['971'][1].init(148, 11, 'UA[\'gecko\']');
function visit1234_971_1(result) {
  _$jscoverage['/editor.js'].branchData['971'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['956'][1].init(22, 34, '(UA[\'gecko\']) && self.__iframeFocus');
function visit1233_956_1(result) {
  _$jscoverage['/editor.js'].branchData['956'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['943'][2].init(1092, 20, 'UA.ie || UA[\'opera\']');
function visit1232_943_2(result) {
  _$jscoverage['/editor.js'].branchData['943'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['943'][1].init(1077, 35, 'UA[\'gecko\'] || UA.ie || UA[\'opera\']');
function visit1231_943_1(result) {
  _$jscoverage['/editor.js'].branchData['943'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['936'][1].init(72, 52, 'S.inArray(control.nodeName(), [\'input\', \'textarea\'])');
function visit1230_936_1(result) {
  _$jscoverage['/editor.js'].branchData['936'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['929'][1].init(72, 50, 'S.inArray(control.nodeName(), [\'input\', \'select\'])');
function visit1229_929_1(result) {
  _$jscoverage['/editor.js'].branchData['929'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['926'][1].init(428, 12, 'UA[\'webkit\']');
function visit1228_926_1(result) {
  _$jscoverage['/editor.js'].branchData['926'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['910'][1].init(220, 29, '!retry && blinkCursor(doc, 1)');
function visit1227_910_1(result) {
  _$jscoverage['/editor.js'].branchData['910'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['899'][1].init(149, 23, '!arguments.callee.retry');
function visit1226_899_1(result) {
  _$jscoverage['/editor.js'].branchData['899'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['877'][2].init(53, 24, 't.nodeName() === \'table\'');
function visit1225_877_2(result) {
  _$jscoverage['/editor.js'].branchData['877'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['877'][1].init(53, 85, 't.nodeName() === \'table\' && disableInlineTableEditing');
function visit1224_877_1(result) {
  _$jscoverage['/editor.js'].branchData['877'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['876'][1].init(83, 140, 'disableObjectResizing || (t.nodeName() === \'table\' && disableInlineTableEditing)');
function visit1223_876_1(result) {
  _$jscoverage['/editor.js'].branchData['876'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['864'][1].init(318, 50, 'disableObjectResizing || disableInlineTableEditing');
function visit1222_864_1(result) {
  _$jscoverage['/editor.js'].branchData['864'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['847'][1].init(25, 3, 'doc');
function visit1221_847_1(result) {
  _$jscoverage['/editor.js'].branchData['847'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['845'][1].init(372, 5, 'IS_IE');
function visit1220_845_1(result) {
  _$jscoverage['/editor.js'].branchData['845'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['822'][1].init(25, 11, 'UA[\'gecko\']');
function visit1219_822_1(result) {
  _$jscoverage['/editor.js'].branchData['822'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['821'][1].init(319, 16, 't == htmlElement');
function visit1218_821_1(result) {
  _$jscoverage['/editor.js'].branchData['821'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['810'][1].init(363, 26, 'UA[\'gecko\'] || UA[\'opera\']');
function visit1217_810_1(result) {
  _$jscoverage['/editor.js'].branchData['810'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['791'][1].init(224, 12, 'UA[\'webkit\']');
function visit1216_791_1(result) {
  _$jscoverage['/editor.js'].branchData['791'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['788'][1].init(98, 26, 'UA[\'gecko\'] || UA[\'opera\']');
function visit1215_788_1(result) {
  _$jscoverage['/editor.js'].branchData['788'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['775'][1].init(1281, 5, 'IS_IE');
function visit1214_775_1(result) {
  _$jscoverage['/editor.js'].branchData['775'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['729'][1].init(507, 26, 'cfg.data || textarea.val()');
function visit1213_729_1(result) {
  _$jscoverage['/editor.js'].branchData['729'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['726'][1].init(431, 4, 'name');
function visit1212_726_1(result) {
  _$jscoverage['/editor.js'].branchData['726'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['724'][1].init(26, 20, 'cfg.height || height');
function visit1211_724_1(result) {
  _$jscoverage['/editor.js'].branchData['724'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['723'][1].init(352, 6, 'height');
function visit1210_723_1(result) {
  _$jscoverage['/editor.js'].branchData['723'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['721'][1].init(25, 18, 'cfg.width || width');
function visit1209_721_1(result) {
  _$jscoverage['/editor.js'].branchData['721'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['720'][1].init(277, 5, 'width');
function visit1208_720_1(result) {
  _$jscoverage['/editor.js'].branchData['720'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['716'][1].init(106, 23, 'cfg.textareaAttrs || {}');
function visit1207_716_1(result) {
  _$jscoverage['/editor.js'].branchData['716'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['714'][1].init(15, 9, 'cfg || {}');
function visit1206_714_1(result) {
  _$jscoverage['/editor.js'].branchData['714'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['685'][1].init(311, 5, '!node');
function visit1205_685_1(result) {
  _$jscoverage['/editor.js'].branchData['685'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['683'][3].init(64, 33, 'el.nodeName.toLowerCase() != \'br\'');
function visit1204_683_3(result) {
  _$jscoverage['/editor.js'].branchData['683'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['683'][2].init(44, 16, 'el.nodeType == 1');
function visit1203_683_2(result) {
  _$jscoverage['/editor.js'].branchData['683'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['683'][1].init(44, 53, 'el.nodeType == 1 && el.nodeName.toLowerCase() != \'br\'');
function visit1202_683_1(result) {
  _$jscoverage['/editor.js'].branchData['683'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['680'][1].init(120, 43, 'self.getSelection().getRanges().length == 0');
function visit1201_680_1(result) {
  _$jscoverage['/editor.js'].branchData['680'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['661'][1].init(69, 22, '$sel.type == \'Control\'');
function visit1200_661_1(result) {
  _$jscoverage['/editor.js'].branchData['661'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['659'][1].init(523, 5, 'IS_IE');
function visit1199_659_1(result) {
  _$jscoverage['/editor.js'].branchData['659'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['650'][1].init(227, 42, 'htmlDataProcessor = self.htmlDataProcessor');
function visit1198_650_1(result) {
  _$jscoverage['/editor.js'].branchData['650'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['646'][1].init(135, 33, 'self.get(\'mode\') !== WYSIWYG_MODE');
function visit1197_646_1(result) {
  _$jscoverage['/editor.js'].branchData['646'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['624'][2].init(2357, 22, 'clone[0].nodeType == 1');
function visit1196_624_2(result) {
  _$jscoverage['/editor.js'].branchData['624'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['624'][1].init(2348, 31, 'clone && clone[0].nodeType == 1');
function visit1195_624_1(result) {
  _$jscoverage['/editor.js'].branchData['624'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['615'][1].init(31, 82, 'xhtml_dtd.$block[nextName] && xhtml_dtd[nextName][\'#text\']');
function visit1194_615_1(result) {
  _$jscoverage['/editor.js'].branchData['615'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['614'][1].init(338, 114, 'nextName && xhtml_dtd.$block[nextName] && xhtml_dtd[nextName][\'#text\']');
function visit1193_614_1(result) {
  _$jscoverage['/editor.js'].branchData['614'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['611'][3].init(168, 41, 'next[0].nodeType == NodeType.ELEMENT_NODE');
function visit1192_611_3(result) {
  _$jscoverage['/editor.js'].branchData['611'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['611'][2].init(168, 80, 'next[0].nodeType == NodeType.ELEMENT_NODE && next.nodeName()');
function visit1191_611_2(result) {
  _$jscoverage['/editor.js'].branchData['611'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['611'][1].init(160, 88, 'next && next[0].nodeType == NodeType.ELEMENT_NODE && next.nodeName()');
function visit1190_611_1(result) {
  _$jscoverage['/editor.js'].branchData['611'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['608'][1].init(1580, 7, 'isBlock');
function visit1189_608_1(result) {
  _$jscoverage['/editor.js'].branchData['608'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['601'][1].init(1271, 12, '!lastElement');
function visit1188_601_1(result) {
  _$jscoverage['/editor.js'].branchData['601'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['596'][1].init(325, 12, '!lastElement');
function visit1187_596_1(result) {
  _$jscoverage['/editor.js'].branchData['596'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['592'][2].init(112, 13, '!i && element');
function visit1186_592_2(result) {
  _$jscoverage['/editor.js'].branchData['592'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['592'][1].init(112, 39, '!i && element || element[\'clone\'](TRUE)');
function visit1185_592_1(result) {
  _$jscoverage['/editor.js'].branchData['592'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['588'][1].init(826, 6, 'i >= 0');
function visit1184_588_1(result) {
  _$jscoverage['/editor.js'].branchData['588'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['582'][2].init(676, 18, 'ranges.length == 0');
function visit1183_582_2(result) {
  _$jscoverage['/editor.js'].branchData['582'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['582'][1].init(665, 29, '!ranges || ranges.length == 0');
function visit1182_582_1(result) {
  _$jscoverage['/editor.js'].branchData['582'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['574'][1].init(285, 34, 'selection && selection.getRanges()');
function visit1181_574_1(result) {
  _$jscoverage['/editor.js'].branchData['574'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['562'][1].init(47, 33, 'self.get(\'mode\') !== WYSIWYG_MODE');
function visit1180_562_1(result) {
  _$jscoverage['/editor.js'].branchData['562'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['531'][1].init(169, 65, '!self.__previousPath || !self.__previousPath.compare(currentPath)');
function visit1179_531_1(result) {
  _$jscoverage['/editor.js'].branchData['531'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['528'][1].init(74, 33, 'selection && !selection.isInvalid');
function visit1178_528_1(result) {
  _$jscoverage['/editor.js'].branchData['528'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['522'][1].init(46, 29, 'self.__checkSelectionChangeId');
function visit1177_522_1(result) {
  _$jscoverage['/editor.js'].branchData['522'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['501'][1].init(85, 15, 'self.__docReady');
function visit1176_501_1(result) {
  _$jscoverage['/editor.js'].branchData['501'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['487'][1].init(371, 9, 'ind != -1');
function visit1175_487_1(result) {
  _$jscoverage['/editor.js'].branchData['487'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['481'][1].init(21, 22, 'l.attr(\'href\') == link');
function visit1174_481_1(result) {
  _$jscoverage['/editor.js'].branchData['481'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['440'][1].init(242, 3, 'win');
function visit1173_440_1(result) {
  _$jscoverage['/editor.js'].branchData['440'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['437'][1].init(88, 29, 'self.get(\'customStyle\') || \'\'');
function visit1172_437_1(result) {
  _$jscoverage['/editor.js'].branchData['437'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['407'][1].init(597, 18, 'win && win.focus()');
function visit1171_407_1(result) {
  _$jscoverage['/editor.js'].branchData['407'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['403'][2].init(140, 32, 'win.parent && win.parent.focus()');
function visit1170_403_2(result) {
  _$jscoverage['/editor.js'].branchData['403'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['403'][1].init(133, 39, 'win && win.parent && win.parent.focus()');
function visit1169_403_1(result) {
  _$jscoverage['/editor.js'].branchData['403'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['400'][1].init(297, 9, '!UA[\'ie\']');
function visit1168_400_1(result) {
  _$jscoverage['/editor.js'].branchData['400'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['394'][1].init(128, 4, '!win');
function visit1167_394_1(result) {
  _$jscoverage['/editor.js'].branchData['394'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['377'][1].init(159, 5, 'range');
function visit1166_377_1(result) {
  _$jscoverage['/editor.js'].branchData['377'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['333'][1].init(772, 28, 'EMPTY_CONTENT_REG.test(html)');
function visit1165_333_1(result) {
  _$jscoverage['/editor.js'].branchData['333'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['324'][1].init(497, 6, 'format');
function visit1164_324_1(result) {
  _$jscoverage['/editor.js'].branchData['324'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['318'][2].init(220, 20, 'mode == WYSIWYG_MODE');
function visit1163_318_2(result) {
  _$jscoverage['/editor.js'].branchData['318'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['318'][1].init(220, 41, 'mode == WYSIWYG_MODE && self.isDocReady()');
function visit1162_318_1(result) {
  _$jscoverage['/editor.js'].branchData['318'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['315'][1].init(128, 17, 'mode == undefined');
function visit1161_315_1(result) {
  _$jscoverage['/editor.js'].branchData['315'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['296'][1].init(282, 42, 'htmlDataProcessor = self.htmlDataProcessor');
function visit1160_296_1(result) {
  _$jscoverage['/editor.js'].branchData['296'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['291'][1].init(115, 32, 'self.get(\'mode\') != WYSIWYG_MODE');
function visit1159_291_1(result) {
  _$jscoverage['/editor.js'].branchData['291'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['270'][1].init(196, 3, 'cmd');
function visit1158_270_1(result) {
  _$jscoverage['/editor.js'].branchData['270'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['179'][1].init(21, 15, 'control.destroy');
function visit1157_179_1(result) {
  _$jscoverage['/editor.js'].branchData['179'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['162'][1].init(356, 3, 'doc');
function visit1156_162_1(result) {
  _$jscoverage['/editor.js'].branchData['162'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['157'][1].init(42, 60, '(form = textarea[0].form) && (form = $(form))');
function visit1155_157_1(result) {
  _$jscoverage['/editor.js'].branchData['157'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['156'][1].init(162, 103, 'self.get(\'attachForm\') && (form = textarea[0].form) && (form = $(form))');
function visit1154_156_1(result) {
  _$jscoverage['/editor.js'].branchData['156'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['145'][1].init(76, 20, 'v && self.__docReady');
function visit1153_145_1(result) {
  _$jscoverage['/editor.js'].branchData['145'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['132'][1].init(65, 6, 'iframe');
function visit1152_132_1(result) {
  _$jscoverage['/editor.js'].branchData['132'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['126'][1].init(140, 17, 'v == WYSIWYG_MODE');
function visit1151_126_1(result) {
  _$jscoverage['/editor.js'].branchData['126'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['117'][2].init(61, 40, 'statusBarEl && statusBarEl.outerHeight()');
function visit1150_117_2(result) {
  _$jscoverage['/editor.js'].branchData['117'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['117'][1].init(61, 45, 'statusBarEl && statusBarEl.outerHeight() || 0');
function visit1149_117_1(result) {
  _$jscoverage['/editor.js'].branchData['117'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['116'][2].init(266, 36, 'toolBarEl && toolBarEl.outerHeight()');
function visit1148_116_2(result) {
  _$jscoverage['/editor.js'].branchData['116'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['116'][1].init(266, 41, 'toolBarEl && toolBarEl.outerHeight() || 0');
function visit1147_116_1(result) {
  _$jscoverage['/editor.js'].branchData['116'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['92'][1].init(72, 28, 'sel && sel.removeAllRanges()');
function visit1146_92_1(result) {
  _$jscoverage['/editor.js'].branchData['92'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['86'][1].init(101, 19, 'self.get(\'focused\')');
function visit1145_86_1(result) {
  _$jscoverage['/editor.js'].branchData['86'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['78'][1].init(42, 60, '(form = textarea[0].form) && (form = $(form))');
function visit1144_78_1(result) {
  _$jscoverage['/editor.js'].branchData['78'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['77'][1].init(169, 103, 'self.get(\'attachForm\') && (form = textarea[0].form) && (form = $(form))');
function visit1143_77_1(result) {
  _$jscoverage['/editor.js'].branchData['77'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['30'][1].init(192, 14, 'UA.ieMode < 11');
function visit1142_30_1(result) {
  _$jscoverage['/editor.js'].branchData['30'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].lineData[6]++;
KISSY.add(function(S, require, exports, module) {
  _$jscoverage['/editor.js'].functionData[0]++;
  _$jscoverage['/editor.js'].lineData[7]++;
  var Node = require('node');
  _$jscoverage['/editor.js'].lineData[8]++;
  var iframeContentTpl = require('editor/iframe-content-tpl');
  _$jscoverage['/editor.js'].lineData[9]++;
  var Editor = require('editor/base');
  _$jscoverage['/editor.js'].lineData[10]++;
  var Utils = require('editor/utils');
  _$jscoverage['/editor.js'].lineData[11]++;
  var focusManager = require('editor/focusManager');
  _$jscoverage['/editor.js'].lineData[12]++;
  var clipboard = require('editor/clipboard');
  _$jscoverage['/editor.js'].lineData[13]++;
  var enterKey = require('editor/enterKey');
  _$jscoverage['/editor.js'].lineData[14]++;
  var htmlDataProcessor = require('editor/htmlDataProcessor');
  _$jscoverage['/editor.js'].lineData[15]++;
  var selectionFix = require('editor/selectionFix');
  _$jscoverage['/editor.js'].lineData[16]++;
  require('editor/plugin-meta');
  _$jscoverage['/editor.js'].lineData[17]++;
  require('editor/styles');
  _$jscoverage['/editor.js'].lineData[18]++;
  require('editor/domIterator');
  _$jscoverage['/editor.js'].lineData[19]++;
  require('editor/z-index-manager');
  _$jscoverage['/editor.js'].lineData[20]++;
  module.exports = Editor;
  _$jscoverage['/editor.js'].lineData[21]++;
  var logger = S.getLogger('s/editor');
  _$jscoverage['/editor.js'].lineData[22]++;
  var TRUE = true, undefined = undefined, FALSE = false, NULL = null, window = S.Env.host, document = window.document, UA = S.UA, IS_IE = visit1142_30_1(UA.ieMode < 11), NodeType = Node.NodeType, $ = Node.all, HEIGHT = 'height', tryThese = Utils.tryThese, IFRAME_TPL = '<iframe' + ' class="{prefixCls}editor-iframe"' + ' frameborder="0" ' + ' title="kissy-editor" ' + ' allowTransparency="true" ' + ' {iframeSrc} ' + '>' + '</iframe>', EMPTY_CONTENT_REG = /^(?:<(p)>)?(?:(?:&nbsp;)|\s|<br[^>]*>)*(?:<\/\1>)?$/i;
  _$jscoverage['/editor.js'].lineData[46]++;
  Editor.Mode = {
  SOURCE_MODE: 0, 
  WYSIWYG_MODE: 1};
  _$jscoverage['/editor.js'].lineData[51]++;
  var WYSIWYG_MODE = 1;
  _$jscoverage['/editor.js'].lineData[53]++;
  Editor.addMembers({
  initializer: function() {
  _$jscoverage['/editor.js'].functionData[1]++;
  _$jscoverage['/editor.js'].lineData[55]++;
  var self = this;
  _$jscoverage['/editor.js'].lineData[56]++;
  self.__commands = {};
  _$jscoverage['/editor.js'].lineData[57]++;
  self.__controls = {};
  _$jscoverage['/editor.js'].lineData[59]++;
  focusManager.register(self);
}, 
  renderUI: function() {
  _$jscoverage['/editor.js'].functionData[2]++;
  _$jscoverage['/editor.js'].lineData[64]++;
  var self = this;
  _$jscoverage['/editor.js'].lineData[65]++;
  clipboard.init(self);
  _$jscoverage['/editor.js'].lineData[66]++;
  enterKey.init(self);
  _$jscoverage['/editor.js'].lineData[67]++;
  htmlDataProcessor.init(self);
  _$jscoverage['/editor.js'].lineData[68]++;
  selectionFix.init(self);
}, 
  bindUI: function() {
  _$jscoverage['/editor.js'].functionData[3]++;
  _$jscoverage['/editor.js'].lineData[72]++;
  var self = this, form, prefixCls = self.get('prefixCls'), textarea = self.get('textarea');
  _$jscoverage['/editor.js'].lineData[77]++;
  if (visit1143_77_1(self.get('attachForm') && visit1144_78_1((form = textarea[0].form) && (form = $(form))))) {
    _$jscoverage['/editor.js'].lineData[80]++;
    form.on('submit', self.sync, self);
  }
  _$jscoverage['/editor.js'].lineData[83]++;
  function docReady() {
    _$jscoverage['/editor.js'].functionData[4]++;
    _$jscoverage['/editor.js'].lineData[84]++;
    self.detach('docReady', docReady);
    _$jscoverage['/editor.js'].lineData[86]++;
    if (visit1145_86_1(self.get('focused'))) {
      _$jscoverage['/editor.js'].lineData[87]++;
      self.focus();
    } else {
      _$jscoverage['/editor.js'].lineData[91]++;
      var sel = self.getSelection();
      _$jscoverage['/editor.js'].lineData[92]++;
      visit1146_92_1(sel && sel.removeAllRanges());
    }
  }
  _$jscoverage['/editor.js'].lineData[96]++;
  self.on('docReady', docReady);
  _$jscoverage['/editor.js'].lineData[98]++;
  self.on('blur', function() {
  _$jscoverage['/editor.js'].functionData[5]++;
  _$jscoverage['/editor.js'].lineData[99]++;
  self.$el.removeClass(prefixCls + 'editor-focused');
});
  _$jscoverage['/editor.js'].lineData[102]++;
  self.on('focus', function() {
  _$jscoverage['/editor.js'].functionData[6]++;
  _$jscoverage['/editor.js'].lineData[103]++;
  self.$el.addClass(prefixCls + 'editor-focused');
});
}, 
  _onSetHeight: function(v) {
  _$jscoverage['/editor.js'].functionData[7]++;
  _$jscoverage['/editor.js'].lineData[110]++;
  var self = this, textareaEl = self.get('textarea'), toolBarEl = self.get("toolBarEl"), statusBarEl = self.get("statusBarEl");
  _$jscoverage['/editor.js'].lineData[114]++;
  v = parseInt(v, 10);
  _$jscoverage['/editor.js'].lineData[116]++;
  v -= (visit1147_116_1(visit1148_116_2(toolBarEl && toolBarEl.outerHeight()) || 0)) + (visit1149_117_1(visit1150_117_2(statusBarEl && statusBarEl.outerHeight()) || 0));
  _$jscoverage['/editor.js'].lineData[118]++;
  textareaEl.parent().css(HEIGHT, v);
  _$jscoverage['/editor.js'].lineData[119]++;
  textareaEl.css(HEIGHT, v);
}, 
  _onSetMode: function(v) {
  _$jscoverage['/editor.js'].functionData[8]++;
  _$jscoverage['/editor.js'].lineData[123]++;
  var self = this, iframe = self.get('iframe'), textarea = self.get('textarea');
  _$jscoverage['/editor.js'].lineData[126]++;
  if (visit1151_126_1(v == WYSIWYG_MODE)) {
    _$jscoverage['/editor.js'].lineData[127]++;
    self.setData(textarea.val());
    _$jscoverage['/editor.js'].lineData[128]++;
    textarea.hide();
    _$jscoverage['/editor.js'].lineData[129]++;
    self.fire("wysiwygMode");
  } else {
    _$jscoverage['/editor.js'].lineData[132]++;
    if (visit1152_132_1(iframe)) {
      _$jscoverage['/editor.js'].lineData[133]++;
      textarea.val(self.getFormatData(WYSIWYG_MODE));
      _$jscoverage['/editor.js'].lineData[134]++;
      iframe.hide();
    }
    _$jscoverage['/editor.js'].lineData[136]++;
    textarea.show();
    _$jscoverage['/editor.js'].lineData[137]++;
    self.fire("sourceMode");
  }
}, 
  _onSetFocused: function(v) {
  _$jscoverage['/editor.js'].functionData[9]++;
  _$jscoverage['/editor.js'].lineData[143]++;
  var self = this;
  _$jscoverage['/editor.js'].lineData[145]++;
  if (visit1153_145_1(v && self.__docReady)) {
    _$jscoverage['/editor.js'].lineData[146]++;
    self.focus();
  }
}, 
  destructor: function() {
  _$jscoverage['/editor.js'].functionData[10]++;
  _$jscoverage['/editor.js'].lineData[151]++;
  var self = this, form, textarea = self.get('textarea'), doc = self.get('document');
  _$jscoverage['/editor.js'].lineData[156]++;
  if (visit1154_156_1(self.get('attachForm') && visit1155_157_1((form = textarea[0].form) && (form = $(form))))) {
    _$jscoverage['/editor.js'].lineData[159]++;
    form.detach("submit", self.sync, self);
  }
  _$jscoverage['/editor.js'].lineData[162]++;
  if (visit1156_162_1(doc)) {
    _$jscoverage['/editor.js'].lineData[163]++;
    var body = $(doc[0].body), documentElement = $(doc[0].documentElement), win = self.get('window');
    _$jscoverage['/editor.js'].lineData[167]++;
    focusManager.remove(self);
    _$jscoverage['/editor.js'].lineData[169]++;
    doc.detach();
    _$jscoverage['/editor.js'].lineData[171]++;
    documentElement.detach();
    _$jscoverage['/editor.js'].lineData[173]++;
    body.detach();
    _$jscoverage['/editor.js'].lineData[175]++;
    win.detach();
  }
  _$jscoverage['/editor.js'].lineData[178]++;
  S.each(self.__controls, function(control) {
  _$jscoverage['/editor.js'].functionData[11]++;
  _$jscoverage['/editor.js'].lineData[179]++;
  if (visit1157_179_1(control.destroy)) {
    _$jscoverage['/editor.js'].lineData[180]++;
    control.destroy();
  }
});
  _$jscoverage['/editor.js'].lineData[184]++;
  self.__commands = {};
  _$jscoverage['/editor.js'].lineData[185]++;
  self.__controls = {};
}, 
  sync: function() {
  _$jscoverage['/editor.js'].functionData[12]++;
  _$jscoverage['/editor.js'].lineData[192]++;
  var self = this;
  _$jscoverage['/editor.js'].lineData[193]++;
  self.get("textarea").val(self.getData());
}, 
  getControl: function(id) {
  _$jscoverage['/editor.js'].functionData[13]++;
  _$jscoverage['/editor.js'].lineData[201]++;
  return this.__controls[id];
}, 
  getControls: function() {
  _$jscoverage['/editor.js'].functionData[14]++;
  _$jscoverage['/editor.js'].lineData[209]++;
  return this.__controls;
}, 
  addControl: function(id, control) {
  _$jscoverage['/editor.js'].functionData[15]++;
  _$jscoverage['/editor.js'].lineData[218]++;
  this.__controls[id] = control;
}, 
  showDialog: function(name, args) {
  _$jscoverage['/editor.js'].functionData[16]++;
  _$jscoverage['/editor.js'].lineData[228]++;
  name += '/dialog';
  _$jscoverage['/editor.js'].lineData[229]++;
  var self = this, d = self.__controls[name];
  _$jscoverage['/editor.js'].lineData[231]++;
  d.show(args);
  _$jscoverage['/editor.js'].lineData[232]++;
  self.fire('dialogShow', {
  dialog: d.dialog, 
  "pluginDialog": d, 
  "dialogName": name});
}, 
  addCommand: function(name, obj) {
  _$jscoverage['/editor.js'].functionData[17]++;
  _$jscoverage['/editor.js'].lineData[246]++;
  this.__commands[name] = obj;
}, 
  hasCommand: function(name) {
  _$jscoverage['/editor.js'].functionData[18]++;
  _$jscoverage['/editor.js'].lineData[255]++;
  return this.__commands[name];
}, 
  execCommand: function(name) {
  _$jscoverage['/editor.js'].functionData[19]++;
  _$jscoverage['/editor.js'].lineData[265]++;
  var self = this, cmd = self.__commands[name], args = S.makeArray(arguments);
  _$jscoverage['/editor.js'].lineData[268]++;
  args.shift();
  _$jscoverage['/editor.js'].lineData[269]++;
  args.unshift(self);
  _$jscoverage['/editor.js'].lineData[270]++;
  if (visit1158_270_1(cmd)) {
    _$jscoverage['/editor.js'].lineData[271]++;
    return cmd.exec.apply(cmd, args);
  } else {
    _$jscoverage['/editor.js'].lineData[273]++;
    logger.error(name + ': command not found');
    _$jscoverage['/editor.js'].lineData[274]++;
    return undefined;
  }
}, 
  queryCommandValue: function(name) {
  _$jscoverage['/editor.js'].functionData[20]++;
  _$jscoverage['/editor.js'].lineData[284]++;
  return this.execCommand(Utils.getQueryCmd(name));
}, 
  'setData': function(data) {
  _$jscoverage['/editor.js'].functionData[21]++;
  _$jscoverage['/editor.js'].lineData[288]++;
  var self = this, htmlDataProcessor, afterData = data;
  _$jscoverage['/editor.js'].lineData[291]++;
  if (visit1159_291_1(self.get('mode') != WYSIWYG_MODE)) {
    _$jscoverage['/editor.js'].lineData[293]++;
    self.get('textarea').val(data);
    _$jscoverage['/editor.js'].lineData[294]++;
    return;
  }
  _$jscoverage['/editor.js'].lineData[296]++;
  if (visit1160_296_1(htmlDataProcessor = self.htmlDataProcessor)) {
    _$jscoverage['/editor.js'].lineData[297]++;
    afterData = htmlDataProcessor.toDataFormat(data);
  }
  _$jscoverage['/editor.js'].lineData[300]++;
  clearIframeDocContent(self);
  _$jscoverage['/editor.js'].lineData[301]++;
  createIframe(self, afterData);
}, 
  getData: function(format, mode) {
  _$jscoverage['/editor.js'].functionData[22]++;
  _$jscoverage['/editor.js'].lineData[312]++;
  var self = this, htmlDataProcessor = self.htmlDataProcessor, html;
  _$jscoverage['/editor.js'].lineData[315]++;
  if (visit1161_315_1(mode == undefined)) {
    _$jscoverage['/editor.js'].lineData[316]++;
    mode = self.get('mode');
  }
  _$jscoverage['/editor.js'].lineData[318]++;
  if (visit1162_318_1(visit1163_318_2(mode == WYSIWYG_MODE) && self.isDocReady())) {
    _$jscoverage['/editor.js'].lineData[319]++;
    html = self.get('document')[0].body.innerHTML;
  } else {
    _$jscoverage['/editor.js'].lineData[321]++;
    html = htmlDataProcessor.toDataFormat(self.get('textarea').val());
  }
  _$jscoverage['/editor.js'].lineData[324]++;
  if (visit1164_324_1(format)) {
    _$jscoverage['/editor.js'].lineData[325]++;
    html = htmlDataProcessor.toHtml(html);
  } else {
    _$jscoverage['/editor.js'].lineData[327]++;
    html = htmlDataProcessor.toServer(html);
  }
  _$jscoverage['/editor.js'].lineData[329]++;
  html = S.trim(html);
  _$jscoverage['/editor.js'].lineData[333]++;
  if (visit1165_333_1(EMPTY_CONTENT_REG.test(html))) {
    _$jscoverage['/editor.js'].lineData[334]++;
    html = '';
  }
  _$jscoverage['/editor.js'].lineData[336]++;
  return html;
}, 
  getFormatData: function(mode) {
  _$jscoverage['/editor.js'].functionData[23]++;
  _$jscoverage['/editor.js'].lineData[346]++;
  return this.getData(1, mode);
}, 
  getDocHtml: function() {
  _$jscoverage['/editor.js'].functionData[24]++;
  _$jscoverage['/editor.js'].lineData[354]++;
  var self = this;
  _$jscoverage['/editor.js'].lineData[355]++;
  return prepareIFrameHTML(0, self.get('customStyle'), self.get('customLink'), self.getFormatData());
}, 
  getSelection: function() {
  _$jscoverage['/editor.js'].functionData[25]++;
  _$jscoverage['/editor.js'].lineData[364]++;
  return Editor.Selection.getSelection(this.get('document')[0]);
}, 
  'getSelectedHtml': function() {
  _$jscoverage['/editor.js'].functionData[26]++;
  _$jscoverage['/editor.js'].lineData[373]++;
  var self = this, range = self.getSelection().getRanges()[0], contents, html = '';
  _$jscoverage['/editor.js'].lineData[377]++;
  if (visit1166_377_1(range)) {
    _$jscoverage['/editor.js'].lineData[378]++;
    contents = range.cloneContents();
    _$jscoverage['/editor.js'].lineData[379]++;
    html = self.get('document')[0].createElement('div');
    _$jscoverage['/editor.js'].lineData[380]++;
    html.appendChild(contents);
    _$jscoverage['/editor.js'].lineData[381]++;
    html = html.innerHTML;
  }
  _$jscoverage['/editor.js'].lineData[383]++;
  return html;
}, 
  focus: function() {
  _$jscoverage['/editor.js'].functionData[27]++;
  _$jscoverage['/editor.js'].lineData[391]++;
  var self = this, win = self.get('window');
  _$jscoverage['/editor.js'].lineData[394]++;
  if (visit1167_394_1(!win)) {
    _$jscoverage['/editor.js'].lineData[395]++;
    return;
  }
  _$jscoverage['/editor.js'].lineData[397]++;
  var doc = self.get('document')[0];
  _$jscoverage['/editor.js'].lineData[398]++;
  win = win[0];
  _$jscoverage['/editor.js'].lineData[400]++;
  if (visit1168_400_1(!UA['ie'])) {
    _$jscoverage['/editor.js'].lineData[403]++;
    visit1169_403_1(win && visit1170_403_2(win.parent && win.parent.focus()));
  }
  _$jscoverage['/editor.js'].lineData[407]++;
  visit1171_407_1(win && win.focus());
  _$jscoverage['/editor.js'].lineData[409]++;
  try {
    _$jscoverage['/editor.js'].lineData[410]++;
    doc.body.focus();
  }  catch (e) {
}
  _$jscoverage['/editor.js'].lineData[414]++;
  self.notifySelectionChange();
}, 
  blur: function() {
  _$jscoverage['/editor.js'].functionData[28]++;
  _$jscoverage['/editor.js'].lineData[422]++;
  var self = this, win = self.get('window')[0];
  _$jscoverage['/editor.js'].lineData[424]++;
  win.blur();
  _$jscoverage['/editor.js'].lineData[425]++;
  self.get('document')[0].body.blur();
}, 
  addCustomStyle: function(cssText, id) {
  _$jscoverage['/editor.js'].functionData[29]++;
  _$jscoverage['/editor.js'].lineData[435]++;
  var self = this, win = self.get('window'), customStyle = visit1172_437_1(self.get('customStyle') || '');
  _$jscoverage['/editor.js'].lineData[438]++;
  customStyle += "\n" + cssText;
  _$jscoverage['/editor.js'].lineData[439]++;
  self.set('customStyle', customStyle);
  _$jscoverage['/editor.js'].lineData[440]++;
  if (visit1173_440_1(win)) {
    _$jscoverage['/editor.js'].lineData[441]++;
    win['addStyleSheet'](cssText, id);
  }
}, 
  removeCustomStyle: function(id) {
  _$jscoverage['/editor.js'].functionData[30]++;
  _$jscoverage['/editor.js'].lineData[451]++;
  this.get('document').on('#' + id).remove();
}, 
  addCustomLink: function(link) {
  _$jscoverage['/editor.js'].functionData[31]++;
  _$jscoverage['/editor.js'].lineData[460]++;
  var self = this, customLink = self.get('customLink'), doc = self.get('document')[0];
  _$jscoverage['/editor.js'].lineData[463]++;
  customLink.push(link);
  _$jscoverage['/editor.js'].lineData[464]++;
  self.set('customLink', customLink);
  _$jscoverage['/editor.js'].lineData[465]++;
  var elem = doc.createElement('link');
  _$jscoverage['/editor.js'].lineData[466]++;
  elem.rel = 'stylesheet';
  _$jscoverage['/editor.js'].lineData[467]++;
  doc.getElementsByTagName('head')[0].appendChild(elem);
  _$jscoverage['/editor.js'].lineData[468]++;
  elem.href = link;
}, 
  removeCustomLink: function(link) {
  _$jscoverage['/editor.js'].functionData[32]++;
  _$jscoverage['/editor.js'].lineData[477]++;
  var self = this, doc = self.get('document'), links = doc.all('link');
  _$jscoverage['/editor.js'].lineData[480]++;
  links.each(function(l) {
  _$jscoverage['/editor.js'].functionData[33]++;
  _$jscoverage['/editor.js'].lineData[481]++;
  if (visit1174_481_1(l.attr('href') == link)) {
    _$jscoverage['/editor.js'].lineData[482]++;
    l.remove();
  }
});
  _$jscoverage['/editor.js'].lineData[485]++;
  var cls = self.get('customLink'), ind = S.indexOf(link, cls);
  _$jscoverage['/editor.js'].lineData[487]++;
  if (visit1175_487_1(ind != -1)) {
    _$jscoverage['/editor.js'].lineData[488]++;
    cls.splice(ind, 1);
  }
}, 
  docReady: function(func) {
  _$jscoverage['/editor.js'].functionData[34]++;
  _$jscoverage['/editor.js'].lineData[499]++;
  var self = this;
  _$jscoverage['/editor.js'].lineData[500]++;
  self.on('docReady', func);
  _$jscoverage['/editor.js'].lineData[501]++;
  if (visit1176_501_1(self.__docReady)) {
    _$jscoverage['/editor.js'].lineData[502]++;
    func.call(self);
  }
}, 
  isDocReady: function() {
  _$jscoverage['/editor.js'].functionData[35]++;
  _$jscoverage['/editor.js'].lineData[512]++;
  return this.__docReady;
}, 
  checkSelectionChange: function() {
  _$jscoverage['/editor.js'].functionData[36]++;
  _$jscoverage['/editor.js'].lineData[521]++;
  var self = this;
  _$jscoverage['/editor.js'].lineData[522]++;
  if (visit1177_522_1(self.__checkSelectionChangeId)) {
    _$jscoverage['/editor.js'].lineData[523]++;
    clearTimeout(self.__checkSelectionChangeId);
  }
  _$jscoverage['/editor.js'].lineData[526]++;
  self.__checkSelectionChangeId = setTimeout(function() {
  _$jscoverage['/editor.js'].functionData[37]++;
  _$jscoverage['/editor.js'].lineData[527]++;
  var selection = self.getSelection();
  _$jscoverage['/editor.js'].lineData[528]++;
  if (visit1178_528_1(selection && !selection.isInvalid)) {
    _$jscoverage['/editor.js'].lineData[529]++;
    var startElement = selection.getStartElement(), currentPath = new Editor.ElementPath(startElement);
    _$jscoverage['/editor.js'].lineData[531]++;
    if (visit1179_531_1(!self.__previousPath || !self.__previousPath.compare(currentPath))) {
      _$jscoverage['/editor.js'].lineData[532]++;
      self.__previousPath = currentPath;
      _$jscoverage['/editor.js'].lineData[533]++;
      self.fire('selectionChange', {
  selection: selection, 
  path: currentPath, 
  element: startElement});
    }
  }
}, 100);
}, 
  notifySelectionChange: function() {
  _$jscoverage['/editor.js'].functionData[38]++;
  _$jscoverage['/editor.js'].lineData[549]++;
  var self = this;
  _$jscoverage['/editor.js'].lineData[550]++;
  self.__previousPath = NULL;
  _$jscoverage['/editor.js'].lineData[551]++;
  self.checkSelectionChange();
}, 
  insertElement: function(element) {
  _$jscoverage['/editor.js'].functionData[39]++;
  _$jscoverage['/editor.js'].lineData[560]++;
  var self = this;
  _$jscoverage['/editor.js'].lineData[562]++;
  if (visit1180_562_1(self.get('mode') !== WYSIWYG_MODE)) {
    _$jscoverage['/editor.js'].lineData[563]++;
    return undefined;
  }
  _$jscoverage['/editor.js'].lineData[566]++;
  self.focus();
  _$jscoverage['/editor.js'].lineData[568]++;
  var clone, elementName = element['nodeName'](), xhtml_dtd = Editor.XHTML_DTD, isBlock = xhtml_dtd['$block'][elementName], KER = Editor.RangeType, selection = self.getSelection(), ranges = visit1181_574_1(selection && selection.getRanges()), range, notWhitespaceEval, i, next, nextName, lastElement;
  _$jscoverage['/editor.js'].lineData[582]++;
  if (visit1182_582_1(!ranges || visit1183_582_2(ranges.length == 0))) {
    _$jscoverage['/editor.js'].lineData[583]++;
    return undefined;
  }
  _$jscoverage['/editor.js'].lineData[586]++;
  self.execCommand('save');
  _$jscoverage['/editor.js'].lineData[588]++;
  for (i = ranges.length - 1; visit1184_588_1(i >= 0); i--) {
    _$jscoverage['/editor.js'].lineData[589]++;
    range = ranges[i];
    _$jscoverage['/editor.js'].lineData[592]++;
    clone = visit1185_592_1(visit1186_592_2(!i && element) || element['clone'](TRUE));
    _$jscoverage['/editor.js'].lineData[593]++;
    range.insertNodeByDtd(clone);
    _$jscoverage['/editor.js'].lineData[596]++;
    if (visit1187_596_1(!lastElement)) {
      _$jscoverage['/editor.js'].lineData[597]++;
      lastElement = clone;
    }
  }
  _$jscoverage['/editor.js'].lineData[601]++;
  if (visit1188_601_1(!lastElement)) {
    _$jscoverage['/editor.js'].lineData[602]++;
    return undefined;
  }
  _$jscoverage['/editor.js'].lineData[605]++;
  range.moveToPosition(lastElement, KER.POSITION_AFTER_END);
  _$jscoverage['/editor.js'].lineData[608]++;
  if (visit1189_608_1(isBlock)) {
    _$jscoverage['/editor.js'].lineData[609]++;
    notWhitespaceEval = Editor.Walker.whitespaces(true);
    _$jscoverage['/editor.js'].lineData[610]++;
    next = lastElement.next(notWhitespaceEval, 1);
    _$jscoverage['/editor.js'].lineData[611]++;
    nextName = visit1190_611_1(next && visit1191_611_2(visit1192_611_3(next[0].nodeType == NodeType.ELEMENT_NODE) && next.nodeName()));
    _$jscoverage['/editor.js'].lineData[614]++;
    if (visit1193_614_1(nextName && visit1194_615_1(xhtml_dtd.$block[nextName] && xhtml_dtd[nextName]['#text']))) {
      _$jscoverage['/editor.js'].lineData[617]++;
      range.moveToElementEditablePosition(next);
    }
  }
  _$jscoverage['/editor.js'].lineData[620]++;
  selection.selectRanges([range]);
  _$jscoverage['/editor.js'].lineData[621]++;
  self.focus();
  _$jscoverage['/editor.js'].lineData[624]++;
  if (visit1195_624_1(clone && visit1196_624_2(clone[0].nodeType == 1))) {
    _$jscoverage['/editor.js'].lineData[625]++;
    clone.scrollIntoView(undefined, {
  alignWithTop: false, 
  allowHorizontalScroll: true, 
  onlyScrollIfNeeded: true});
  }
  _$jscoverage['/editor.js'].lineData[631]++;
  saveLater.call(self);
  _$jscoverage['/editor.js'].lineData[632]++;
  return clone;
}, 
  insertHtml: function(data, dataFilter) {
  _$jscoverage['/editor.js'].functionData[40]++;
  _$jscoverage['/editor.js'].lineData[642]++;
  var self = this, htmlDataProcessor, editorDoc = self.get('document')[0];
  _$jscoverage['/editor.js'].lineData[646]++;
  if (visit1197_646_1(self.get('mode') !== WYSIWYG_MODE)) {
    _$jscoverage['/editor.js'].lineData[647]++;
    return;
  }
  _$jscoverage['/editor.js'].lineData[650]++;
  if (visit1198_650_1(htmlDataProcessor = self.htmlDataProcessor)) {
    _$jscoverage['/editor.js'].lineData[651]++;
    data = htmlDataProcessor.toDataFormat(data, dataFilter);
  }
  _$jscoverage['/editor.js'].lineData[654]++;
  self.focus();
  _$jscoverage['/editor.js'].lineData[655]++;
  self.execCommand('save');
  _$jscoverage['/editor.js'].lineData[659]++;
  if (visit1199_659_1(IS_IE)) {
    _$jscoverage['/editor.js'].lineData[660]++;
    var $sel = editorDoc.selection;
    _$jscoverage['/editor.js'].lineData[661]++;
    if (visit1200_661_1($sel.type == 'Control')) {
      _$jscoverage['/editor.js'].lineData[662]++;
      $sel.clear();
    }
    _$jscoverage['/editor.js'].lineData[664]++;
    try {
      _$jscoverage['/editor.js'].lineData[665]++;
      $sel.createRange().pasteHTML(data);
    }    catch (e) {
  _$jscoverage['/editor.js'].lineData[667]++;
  logger.error('insertHtml error in ie');
}
  } else {
    _$jscoverage['/editor.js'].lineData[674]++;
    try {
      _$jscoverage['/editor.js'].lineData[675]++;
      editorDoc.execCommand('inserthtml', FALSE, data);
    }    catch (e) {
  _$jscoverage['/editor.js'].lineData[677]++;
  setTimeout(function() {
  _$jscoverage['/editor.js'].functionData[41]++;
  _$jscoverage['/editor.js'].lineData[680]++;
  if (visit1201_680_1(self.getSelection().getRanges().length == 0)) {
    _$jscoverage['/editor.js'].lineData[681]++;
    var r = new Editor.Range(editorDoc), node = $(editorDoc.body).first(function(el) {
  _$jscoverage['/editor.js'].functionData[42]++;
  _$jscoverage['/editor.js'].lineData[683]++;
  return visit1202_683_1(visit1203_683_2(el.nodeType == 1) && visit1204_683_3(el.nodeName.toLowerCase() != 'br'));
});
    _$jscoverage['/editor.js'].lineData[685]++;
    if (visit1205_685_1(!node)) {
      _$jscoverage['/editor.js'].lineData[686]++;
      node = $(editorDoc.createElement('p'));
      _$jscoverage['/editor.js'].lineData[687]++;
      node._4e_appendBogus().appendTo(editorDoc.body);
    }
    _$jscoverage['/editor.js'].lineData[689]++;
    r.setStartAt(node, Editor.RangeType.POSITION_AFTER_START);
    _$jscoverage['/editor.js'].lineData[690]++;
    r.select();
  }
  _$jscoverage['/editor.js'].lineData[692]++;
  editorDoc.execCommand('inserthtml', FALSE, data);
}, 50);
}
  }
  _$jscoverage['/editor.js'].lineData[698]++;
  setTimeout(function() {
  _$jscoverage['/editor.js'].functionData[43]++;
  _$jscoverage['/editor.js'].lineData[699]++;
  self.getSelection().scrollIntoView();
}, 50);
  _$jscoverage['/editor.js'].lineData[701]++;
  saveLater.call(self);
}});
  _$jscoverage['/editor.js'].lineData[713]++;
  Editor.decorate = function(textarea, cfg) {
  _$jscoverage['/editor.js'].functionData[44]++;
  _$jscoverage['/editor.js'].lineData[714]++;
  cfg = visit1206_714_1(cfg || {});
  _$jscoverage['/editor.js'].lineData[715]++;
  textarea = $(textarea);
  _$jscoverage['/editor.js'].lineData[716]++;
  var textareaAttrs = cfg.textareaAttrs = visit1207_716_1(cfg.textareaAttrs || {});
  _$jscoverage['/editor.js'].lineData[717]++;
  var width = textarea.style('width');
  _$jscoverage['/editor.js'].lineData[718]++;
  var height = textarea.style('height');
  _$jscoverage['/editor.js'].lineData[719]++;
  var name = textarea.attr('name');
  _$jscoverage['/editor.js'].lineData[720]++;
  if (visit1208_720_1(width)) {
    _$jscoverage['/editor.js'].lineData[721]++;
    cfg.width = visit1209_721_1(cfg.width || width);
  }
  _$jscoverage['/editor.js'].lineData[723]++;
  if (visit1210_723_1(height)) {
    _$jscoverage['/editor.js'].lineData[724]++;
    cfg.height = visit1211_724_1(cfg.height || height);
  }
  _$jscoverage['/editor.js'].lineData[726]++;
  if (visit1212_726_1(name)) {
    _$jscoverage['/editor.js'].lineData[727]++;
    textareaAttrs.name = name;
  }
  _$jscoverage['/editor.js'].lineData[729]++;
  cfg.data = visit1213_729_1(cfg.data || textarea.val());
  _$jscoverage['/editor.js'].lineData[730]++;
  cfg.elBefore = textarea;
  _$jscoverage['/editor.js'].lineData[731]++;
  var editor = new Editor(cfg).render();
  _$jscoverage['/editor.js'].lineData[732]++;
  textarea.remove();
  _$jscoverage['/editor.js'].lineData[733]++;
  return editor;
};
  _$jscoverage['/editor.js'].lineData[740]++;
  Editor["_initIframe"] = function(id) {
  _$jscoverage['/editor.js'].functionData[45]++;
  _$jscoverage['/editor.js'].lineData[741]++;
  var self = focusManager.getInstance(id), $doc = self.get('document'), doc = $doc[0], script = $doc.one('#ke_active_script');
  _$jscoverage['/editor.js'].lineData[747]++;
  script.remove();
  _$jscoverage['/editor.js'].lineData[749]++;
  fixByBindIframeDoc(self);
  _$jscoverage['/editor.js'].lineData[751]++;
  var body = doc.body;
  _$jscoverage['/editor.js'].lineData[753]++;
  var $body = $(body);
  _$jscoverage['/editor.js'].lineData[775]++;
  if (visit1214_775_1(IS_IE)) {
    _$jscoverage['/editor.js'].lineData[777]++;
    body['hideFocus'] = TRUE;
    _$jscoverage['/editor.js'].lineData[780]++;
    body.disabled = TRUE;
    _$jscoverage['/editor.js'].lineData[781]++;
    body['contentEditable'] = TRUE;
    _$jscoverage['/editor.js'].lineData[782]++;
    body.removeAttribute('disabled');
  } else {
    _$jscoverage['/editor.js'].lineData[786]++;
    setTimeout(function() {
  _$jscoverage['/editor.js'].functionData[46]++;
  _$jscoverage['/editor.js'].lineData[788]++;
  if (visit1215_788_1(UA['gecko'] || UA['opera'])) {
    _$jscoverage['/editor.js'].lineData[789]++;
    body['contentEditable'] = TRUE;
  } else {
    _$jscoverage['/editor.js'].lineData[791]++;
    if (visit1216_791_1(UA['webkit'])) {
      _$jscoverage['/editor.js'].lineData[792]++;
      body.parentNode['contentEditable'] = TRUE;
    } else {
      _$jscoverage['/editor.js'].lineData[794]++;
      doc['designMode'] = 'on';
    }
  }
}, 0);
  }
  _$jscoverage['/editor.js'].lineData[801]++;
  if (visit1217_810_1(UA['gecko'] || UA['opera'])) {
    _$jscoverage['/editor.js'].lineData[812]++;
    var htmlElement = doc.documentElement;
    _$jscoverage['/editor.js'].lineData[813]++;
    $(htmlElement).on('mousedown', function(evt) {
  _$jscoverage['/editor.js'].functionData[47]++;
  _$jscoverage['/editor.js'].lineData[820]++;
  var t = evt.target;
  _$jscoverage['/editor.js'].lineData[821]++;
  if (visit1218_821_1(t == htmlElement)) {
    _$jscoverage['/editor.js'].lineData[822]++;
    if (visit1219_822_1(UA['gecko'])) {
      _$jscoverage['/editor.js'].lineData[823]++;
      blinkCursor(doc, FALSE);
    }
    _$jscoverage['/editor.js'].lineData[830]++;
    self.activateGecko();
  }
});
  }
  _$jscoverage['/editor.js'].lineData[836]++;
  setTimeout(function() {
  _$jscoverage['/editor.js'].functionData[48]++;
  _$jscoverage['/editor.js'].lineData[845]++;
  if (visit1220_845_1(IS_IE)) {
    _$jscoverage['/editor.js'].lineData[846]++;
    setTimeout(function() {
  _$jscoverage['/editor.js'].functionData[49]++;
  _$jscoverage['/editor.js'].lineData[847]++;
  if (visit1221_847_1(doc)) {
    _$jscoverage['/editor.js'].lineData[848]++;
    body.runtimeStyle['marginBottom'] = '0px';
    _$jscoverage['/editor.js'].lineData[849]++;
    body.runtimeStyle['marginBottom'] = '';
  }
}, 1000);
  }
}, 0);
  _$jscoverage['/editor.js'].lineData[856]++;
  setTimeout(function() {
  _$jscoverage['/editor.js'].functionData[50]++;
  _$jscoverage['/editor.js'].lineData[857]++;
  self.__docReady = 1;
  _$jscoverage['/editor.js'].lineData[858]++;
  self.fire('docReady');
  _$jscoverage['/editor.js'].lineData[862]++;
  var disableObjectResizing = self.get('disableObjectResizing'), disableInlineTableEditing = self.get('disableInlineTableEditing');
  _$jscoverage['/editor.js'].lineData[864]++;
  if (visit1222_864_1(disableObjectResizing || disableInlineTableEditing)) {
    _$jscoverage['/editor.js'].lineData[866]++;
    try {
      _$jscoverage['/editor.js'].lineData[867]++;
      doc.execCommand('enableObjectResizing', FALSE, !disableObjectResizing);
      _$jscoverage['/editor.js'].lineData[868]++;
      doc.execCommand('enableInlineTableEditing', FALSE, !disableInlineTableEditing);
    }    catch (e) {
  _$jscoverage['/editor.js'].lineData[874]++;
  $body.on(IS_IE ? 'resizestart' : 'resize', function(evt) {
  _$jscoverage['/editor.js'].functionData[51]++;
  _$jscoverage['/editor.js'].lineData[875]++;
  var t = new Node(evt.target);
  _$jscoverage['/editor.js'].lineData[876]++;
  if (visit1223_876_1(disableObjectResizing || (visit1224_877_1(visit1225_877_2(t.nodeName() === 'table') && disableInlineTableEditing)))) {
    _$jscoverage['/editor.js'].lineData[879]++;
    evt.preventDefault();
  }
});
}
  }
}, 10);
};
  _$jscoverage['/editor.js'].lineData[889]++;
  function blinkCursor(doc, retry) {
    _$jscoverage['/editor.js'].functionData[52]++;
    _$jscoverage['/editor.js'].lineData[890]++;
    var body = doc.body;
    _$jscoverage['/editor.js'].lineData[891]++;
    tryThese(function() {
  _$jscoverage['/editor.js'].functionData[53]++;
  _$jscoverage['/editor.js'].lineData[893]++;
  doc['designMode'] = 'on';
  _$jscoverage['/editor.js'].lineData[895]++;
  setTimeout(function() {
  _$jscoverage['/editor.js'].functionData[54]++;
  _$jscoverage['/editor.js'].lineData[896]++;
  doc['designMode'] = 'off';
  _$jscoverage['/editor.js'].lineData[897]++;
  body.focus();
  _$jscoverage['/editor.js'].lineData[899]++;
  if (visit1226_899_1(!arguments.callee.retry)) {
    _$jscoverage['/editor.js'].lineData[900]++;
    arguments.callee.retry = TRUE;
  }
}, 50);
}, function() {
  _$jscoverage['/editor.js'].functionData[55]++;
  _$jscoverage['/editor.js'].lineData[906]++;
  doc['designMode'] = 'off';
  _$jscoverage['/editor.js'].lineData[907]++;
  body.setAttribute('contentEditable', false);
  _$jscoverage['/editor.js'].lineData[908]++;
  body.setAttribute('contentEditable', true);
  _$jscoverage['/editor.js'].lineData[910]++;
  visit1227_910_1(!retry && blinkCursor(doc, 1));
});
  }
  _$jscoverage['/editor.js'].lineData[915]++;
  function fixByBindIframeDoc(self) {
    _$jscoverage['/editor.js'].functionData[56]++;
    _$jscoverage['/editor.js'].lineData[916]++;
    var iframe = self.get('iframe'), textarea = self.get('textarea')[0], $win = self.get('window'), $doc = self.get('document'), doc = $doc[0];
    _$jscoverage['/editor.js'].lineData[926]++;
    if (visit1228_926_1(UA['webkit'])) {
      _$jscoverage['/editor.js'].lineData[927]++;
      $doc.on('click', function(ev) {
  _$jscoverage['/editor.js'].functionData[57]++;
  _$jscoverage['/editor.js'].lineData[928]++;
  var control = new Node(ev.target);
  _$jscoverage['/editor.js'].lineData[929]++;
  if (visit1229_929_1(S.inArray(control.nodeName(), ['input', 'select']))) {
    _$jscoverage['/editor.js'].lineData[930]++;
    ev.preventDefault();
  }
});
      _$jscoverage['/editor.js'].lineData[934]++;
      $doc.on('mouseup', function(ev) {
  _$jscoverage['/editor.js'].functionData[58]++;
  _$jscoverage['/editor.js'].lineData[935]++;
  var control = new Node(ev.target);
  _$jscoverage['/editor.js'].lineData[936]++;
  if (visit1230_936_1(S.inArray(control.nodeName(), ['input', 'textarea']))) {
    _$jscoverage['/editor.js'].lineData[937]++;
    ev.preventDefault();
  }
});
    }
    _$jscoverage['/editor.js'].lineData[943]++;
    if (visit1231_943_1(UA['gecko'] || visit1232_943_2(UA.ie || UA['opera']))) {
      _$jscoverage['/editor.js'].lineData[944]++;
      var focusGrabber;
      _$jscoverage['/editor.js'].lineData[945]++;
      focusGrabber = new Node('<span ' + 'tabindex="-1" ' + 'style="position:absolute; left:-10000"' + ' role="presentation"' + '></span>').insertAfter(textarea);
      _$jscoverage['/editor.js'].lineData[952]++;
      focusGrabber.on('focus', function() {
  _$jscoverage['/editor.js'].functionData[59]++;
  _$jscoverage['/editor.js'].lineData[953]++;
  self.focus();
});
      _$jscoverage['/editor.js'].lineData[955]++;
      self.activateGecko = function() {
  _$jscoverage['/editor.js'].functionData[60]++;
  _$jscoverage['/editor.js'].lineData[956]++;
  if (visit1233_956_1((UA['gecko']) && self.__iframeFocus)) {
    _$jscoverage['/editor.js'].lineData[957]++;
    focusGrabber[0].focus();
  }
};
      _$jscoverage['/editor.js'].lineData[959]++;
      self.on('destroy', function() {
  _$jscoverage['/editor.js'].functionData[61]++;
  _$jscoverage['/editor.js'].lineData[960]++;
  focusGrabber.detach();
  _$jscoverage['/editor.js'].lineData[961]++;
  focusGrabber.remove();
});
    }
    _$jscoverage['/editor.js'].lineData[965]++;
    $win.on('focus', function() {
  _$jscoverage['/editor.js'].functionData[62]++;
  _$jscoverage['/editor.js'].lineData[971]++;
  if (visit1234_971_1(UA['gecko'])) {
    _$jscoverage['/editor.js'].lineData[972]++;
    blinkCursor(doc, FALSE);
  } else {
    _$jscoverage['/editor.js'].lineData[974]++;
    if (visit1235_974_1(UA['opera'])) {
      _$jscoverage['/editor.js'].lineData[975]++;
      doc.body.focus();
    }
  }
  _$jscoverage['/editor.js'].lineData[978]++;
  self.notifySelectionChange();
});
    _$jscoverage['/editor.js'].lineData[981]++;
    if (visit1236_981_1(UA['gecko'])) {
      _$jscoverage['/editor.js'].lineData[985]++;
      $doc.on('mousedown', function() {
  _$jscoverage['/editor.js'].functionData[63]++;
  _$jscoverage['/editor.js'].lineData[986]++;
  if (visit1237_986_1(!self.__iframeFocus)) {
    _$jscoverage['/editor.js'].lineData[987]++;
    blinkCursor(doc, FALSE);
  }
});
    }
    _$jscoverage['/editor.js'].lineData[992]++;
    if (visit1238_992_1(IS_IE)) {
      _$jscoverage['/editor.js'].lineData[998]++;
      $doc.on('keydown', function(evt) {
  _$jscoverage['/editor.js'].functionData[64]++;
  _$jscoverage['/editor.js'].lineData[999]++;
  var keyCode = evt.keyCode;
  _$jscoverage['/editor.js'].lineData[1001]++;
  if (visit1239_1001_1(keyCode in {
  8: 1, 
  46: 1})) {
    _$jscoverage['/editor.js'].lineData[1002]++;
    var sel = self.getSelection(), control = sel.getSelectedElement();
    _$jscoverage['/editor.js'].lineData[1004]++;
    if (visit1240_1004_1(control)) {
      _$jscoverage['/editor.js'].lineData[1006]++;
      self.execCommand('save');
      _$jscoverage['/editor.js'].lineData[1009]++;
      var bookmark = sel.getRanges()[0].createBookmark();
      _$jscoverage['/editor.js'].lineData[1011]++;
      control.remove();
      _$jscoverage['/editor.js'].lineData[1012]++;
      sel.selectBookmarks([bookmark]);
      _$jscoverage['/editor.js'].lineData[1013]++;
      self.execCommand('save');
      _$jscoverage['/editor.js'].lineData[1014]++;
      evt.preventDefault();
    }
  }
});
      _$jscoverage['/editor.js'].lineData[1022]++;
      if (visit1241_1022_1(doc.compatMode == 'CSS1Compat')) {
        _$jscoverage['/editor.js'].lineData[1023]++;
        var pageUpDownKeys = {
  33: 1, 
  34: 1};
        _$jscoverage['/editor.js'].lineData[1024]++;
        $doc.on('keydown', function(evt) {
  _$jscoverage['/editor.js'].functionData[65]++;
  _$jscoverage['/editor.js'].lineData[1025]++;
  if (visit1242_1025_1(evt.keyCode in pageUpDownKeys)) {
    _$jscoverage['/editor.js'].lineData[1026]++;
    setTimeout(function() {
  _$jscoverage['/editor.js'].functionData[66]++;
  _$jscoverage['/editor.js'].lineData[1027]++;
  self.getSelection().scrollIntoView();
}, 0);
  }
});
      }
    }
    _$jscoverage['/editor.js'].lineData[1035]++;
    if (visit1243_1035_1(UA['webkit'])) {
      _$jscoverage['/editor.js'].lineData[1036]++;
      $doc.on('mousedown', function(ev) {
  _$jscoverage['/editor.js'].functionData[67]++;
  _$jscoverage['/editor.js'].lineData[1037]++;
  var control = new Node(ev.target);
  _$jscoverage['/editor.js'].lineData[1038]++;
  if (visit1244_1038_1(S.inArray(control.nodeName(), ['img', 'hr', 'input', 'textarea', 'select']))) {
    _$jscoverage['/editor.js'].lineData[1039]++;
    self.getSelection().selectElement(control);
  }
});
    }
    _$jscoverage['/editor.js'].lineData[1045]++;
    if (visit1245_1045_1(UA['gecko'])) {
      _$jscoverage['/editor.js'].lineData[1046]++;
      $doc.on('dragstart', function(ev) {
  _$jscoverage['/editor.js'].functionData[68]++;
  _$jscoverage['/editor.js'].lineData[1047]++;
  var control = new Node(ev.target);
  _$jscoverage['/editor.js'].lineData[1048]++;
  if (visit1246_1048_1(visit1247_1048_2(control.nodeName() === 'img') && /ke_/.test(control[0].className))) {
    _$jscoverage['/editor.js'].lineData[1050]++;
    ev.preventDefault();
  }
});
    }
    _$jscoverage['/editor.js'].lineData[1056]++;
    focusManager.add(self);
  }
  _$jscoverage['/editor.js'].lineData[1060]++;
  function prepareIFrameHTML(id, customStyle, customLink, data) {
    _$jscoverage['/editor.js'].functionData[69]++;
    _$jscoverage['/editor.js'].lineData[1061]++;
    var links = '', i, innerCssFile = Utils.debugUrl('theme/editor-iframe.css');
    _$jscoverage['/editor.js'].lineData[1064]++;
    customLink = customLink.concat([]);
    _$jscoverage['/editor.js'].lineData[1065]++;
    customLink.unshift(innerCssFile);
    _$jscoverage['/editor.js'].lineData[1066]++;
    for (i = 0; visit1248_1066_1(i < customLink.length); i++) {
      _$jscoverage['/editor.js'].lineData[1067]++;
      links += S.substitute('<link href="' + '{href}" rel="stylesheet" />', {
  href: customLink[i]});
    }
    _$jscoverage['/editor.js'].lineData[1071]++;
    return S.substitute(iframeContentTpl, {
  doctype: visit1249_1075_1(S.UA.ieMode === 8) ? '<meta http-equiv="X-UA-Compatible" content="IE=7" />' : '', 
  title: '{title}', 
  links: links, 
  style: '<style>' + customStyle + '</style>', 
  data: visit1250_1082_1(data || ''), 
  script: id ? ('<script id="ke_active_script">' + ($(window).isCustomDomain() ? ('document.domain="' + document.domain + '";') : '') + 'parent.KISSY.require("editor")._initIframe("' + id + '");' + '</script>') : ''});
  }
  _$jscoverage['/editor.js'].lineData[1098]++;
  var saveLater = S.buffer(function() {
  _$jscoverage['/editor.js'].functionData[70]++;
  _$jscoverage['/editor.js'].lineData[1099]++;
  this.execCommand('save');
}, 50);
  _$jscoverage['/editor.js'].lineData[1102]++;
  function setUpIFrame(self, data) {
    _$jscoverage['/editor.js'].functionData[71]++;
    _$jscoverage['/editor.js'].lineData[1103]++;
    var iframe = self.get('iframe'), html = prepareIFrameHTML(self.get('id'), self.get('customStyle'), self.get('customLink'), data), iframeDom = iframe[0], win = iframeDom.contentWindow, doc;
    _$jscoverage['/editor.js'].lineData[1110]++;
    iframe.__loaded = 1;
    _$jscoverage['/editor.js'].lineData[1111]++;
    try {
      _$jscoverage['/editor.js'].lineData[1119]++;
      doc = win.document;
    }    catch (e) {
  _$jscoverage['/editor.js'].lineData[1124]++;
  iframeDom.src = iframeDom.src;
  _$jscoverage['/editor.js'].lineData[1127]++;
  if (visit1251_1127_1(IS_IE < 7)) {
    _$jscoverage['/editor.js'].lineData[1128]++;
    setTimeout(run, 10);
    _$jscoverage['/editor.js'].lineData[1129]++;
    return;
  }
}
    _$jscoverage['/editor.js'].lineData[1132]++;
    run();
    _$jscoverage['/editor.js'].lineData[1133]++;
    function run() {
      _$jscoverage['/editor.js'].functionData[72]++;
      _$jscoverage['/editor.js'].lineData[1134]++;
      doc = win.document;
      _$jscoverage['/editor.js'].lineData[1135]++;
      self.setInternal('document', new Node(doc));
      _$jscoverage['/editor.js'].lineData[1136]++;
      self.setInternal('window', new Node(win));
      _$jscoverage['/editor.js'].lineData[1137]++;
      iframe.detach();
      _$jscoverage['/editor.js'].lineData[1139]++;
      doc['open']('text/html', 'replace');
      _$jscoverage['/editor.js'].lineData[1140]++;
      doc.write(html);
      _$jscoverage['/editor.js'].lineData[1141]++;
      doc.close();
    }
  }
  _$jscoverage['/editor.js'].lineData[1145]++;
  function createIframe(self, afterData) {
    _$jscoverage['/editor.js'].functionData[73]++;
    _$jscoverage['/editor.js'].lineData[1149]++;
    var iframeSrc = visit1252_1149_1($(window).getEmptyIframeSrc() || '');
    _$jscoverage['/editor.js'].lineData[1150]++;
    if (visit1253_1150_1(iframeSrc)) {
      _$jscoverage['/editor.js'].lineData[1151]++;
      iframeSrc = ' src="' + iframeSrc + '" ';
    }
    _$jscoverage['/editor.js'].lineData[1153]++;
    var iframe = new Node(S.substitute(IFRAME_TPL, {
  iframeSrc: iframeSrc, 
  prefixCls: self.get('prefixCls')})), textarea = self.get('textarea');
    _$jscoverage['/editor.js'].lineData[1158]++;
    if (visit1254_1158_1(textarea.hasAttr('tabindex'))) {
      _$jscoverage['/editor.js'].lineData[1159]++;
      iframe.attr('tabindex', UA['webkit'] ? -1 : textarea.attr('tabindex'));
    }
    _$jscoverage['/editor.js'].lineData[1161]++;
    textarea.parent().prepend(iframe);
    _$jscoverage['/editor.js'].lineData[1162]++;
    self.set('iframe', iframe);
    _$jscoverage['/editor.js'].lineData[1163]++;
    self.__docReady = 0;
    _$jscoverage['/editor.js'].lineData[1165]++;
    if (visit1255_1165_1(UA['gecko'] && !iframe.__loaded)) {
      _$jscoverage['/editor.js'].lineData[1166]++;
      iframe.on('load', function() {
  _$jscoverage['/editor.js'].functionData[74]++;
  _$jscoverage['/editor.js'].lineData[1167]++;
  setUpIFrame(self, afterData);
}, self);
    } else {
      _$jscoverage['/editor.js'].lineData[1171]++;
      setUpIFrame(self, afterData);
    }
  }
  _$jscoverage['/editor.js'].lineData[1175]++;
  function clearIframeDocContent(self) {
    _$jscoverage['/editor.js'].functionData[75]++;
    _$jscoverage['/editor.js'].lineData[1176]++;
    if (visit1256_1176_1(!self.get('iframe'))) {
      _$jscoverage['/editor.js'].lineData[1177]++;
      return;
    }
    _$jscoverage['/editor.js'].lineData[1179]++;
    var iframe = self.get('iframe'), win = self.get('window'), doc = self.get('document'), domDoc = doc[0], documentElement = $(domDoc.documentElement), body = $(domDoc.body);
    _$jscoverage['/editor.js'].lineData[1185]++;
    S.each([doc, documentElement, body, win], function(el) {
  _$jscoverage['/editor.js'].functionData[76]++;
  _$jscoverage['/editor.js'].lineData[1186]++;
  el.detach();
});
    _$jscoverage['/editor.js'].lineData[1188]++;
    iframe.remove();
  }
});
