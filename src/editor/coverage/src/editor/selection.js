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
if (! _$jscoverage['/editor/selection.js']) {
  _$jscoverage['/editor/selection.js'] = {};
  _$jscoverage['/editor/selection.js'].lineData = [];
  _$jscoverage['/editor/selection.js'].lineData[10] = 0;
  _$jscoverage['/editor/selection.js'].lineData[11] = 0;
  _$jscoverage['/editor/selection.js'].lineData[12] = 0;
  _$jscoverage['/editor/selection.js'].lineData[13] = 0;
  _$jscoverage['/editor/selection.js'].lineData[14] = 0;
  _$jscoverage['/editor/selection.js'].lineData[19] = 0;
  _$jscoverage['/editor/selection.js'].lineData[24] = 0;
  _$jscoverage['/editor/selection.js'].lineData[40] = 0;
  _$jscoverage['/editor/selection.js'].lineData[41] = 0;
  _$jscoverage['/editor/selection.js'].lineData[42] = 0;
  _$jscoverage['/editor/selection.js'].lineData[43] = 0;
  _$jscoverage['/editor/selection.js'].lineData[51] = 0;
  _$jscoverage['/editor/selection.js'].lineData[52] = 0;
  _$jscoverage['/editor/selection.js'].lineData[53] = 0;
  _$jscoverage['/editor/selection.js'].lineData[54] = 0;
  _$jscoverage['/editor/selection.js'].lineData[57] = 0;
  _$jscoverage['/editor/selection.js'].lineData[63] = 0;
  _$jscoverage['/editor/selection.js'].lineData[68] = 0;
  _$jscoverage['/editor/selection.js'].lineData[73] = 0;
  _$jscoverage['/editor/selection.js'].lineData[83] = 0;
  _$jscoverage['/editor/selection.js'].lineData[85] = 0;
  _$jscoverage['/editor/selection.js'].lineData[89] = 0;
  _$jscoverage['/editor/selection.js'].lineData[90] = 0;
  _$jscoverage['/editor/selection.js'].lineData[113] = 0;
  _$jscoverage['/editor/selection.js'].lineData[114] = 0;
  _$jscoverage['/editor/selection.js'].lineData[115] = 0;
  _$jscoverage['/editor/selection.js'].lineData[117] = 0;
  _$jscoverage['/editor/selection.js'].lineData[120] = 0;
  _$jscoverage['/editor/selection.js'].lineData[121] = 0;
  _$jscoverage['/editor/selection.js'].lineData[122] = 0;
  _$jscoverage['/editor/selection.js'].lineData[126] = 0;
  _$jscoverage['/editor/selection.js'].lineData[129] = 0;
  _$jscoverage['/editor/selection.js'].lineData[133] = 0;
  _$jscoverage['/editor/selection.js'].lineData[137] = 0;
  _$jscoverage['/editor/selection.js'].lineData[140] = 0;
  _$jscoverage['/editor/selection.js'].lineData[141] = 0;
  _$jscoverage['/editor/selection.js'].lineData[142] = 0;
  _$jscoverage['/editor/selection.js'].lineData[144] = 0;
  _$jscoverage['/editor/selection.js'].lineData[146] = 0;
  _$jscoverage['/editor/selection.js'].lineData[147] = 0;
  _$jscoverage['/editor/selection.js'].lineData[150] = 0;
  _$jscoverage['/editor/selection.js'].lineData[151] = 0;
  _$jscoverage['/editor/selection.js'].lineData[153] = 0;
  _$jscoverage['/editor/selection.js'].lineData[154] = 0;
  _$jscoverage['/editor/selection.js'].lineData[161] = 0;
  _$jscoverage['/editor/selection.js'].lineData[162] = 0;
  _$jscoverage['/editor/selection.js'].lineData[167] = 0;
  _$jscoverage['/editor/selection.js'].lineData[174] = 0;
  _$jscoverage['/editor/selection.js'].lineData[176] = 0;
  _$jscoverage['/editor/selection.js'].lineData[177] = 0;
  _$jscoverage['/editor/selection.js'].lineData[180] = 0;
  _$jscoverage['/editor/selection.js'].lineData[183] = 0;
  _$jscoverage['/editor/selection.js'].lineData[184] = 0;
  _$jscoverage['/editor/selection.js'].lineData[186] = 0;
  _$jscoverage['/editor/selection.js'].lineData[187] = 0;
  _$jscoverage['/editor/selection.js'].lineData[189] = 0;
  _$jscoverage['/editor/selection.js'].lineData[191] = 0;
  _$jscoverage['/editor/selection.js'].lineData[194] = 0;
  _$jscoverage['/editor/selection.js'].lineData[196] = 0;
  _$jscoverage['/editor/selection.js'].lineData[197] = 0;
  _$jscoverage['/editor/selection.js'].lineData[200] = 0;
  _$jscoverage['/editor/selection.js'].lineData[202] = 0;
  _$jscoverage['/editor/selection.js'].lineData[203] = 0;
  _$jscoverage['/editor/selection.js'].lineData[204] = 0;
  _$jscoverage['/editor/selection.js'].lineData[206] = 0;
  _$jscoverage['/editor/selection.js'].lineData[210] = 0;
  _$jscoverage['/editor/selection.js'].lineData[211] = 0;
  _$jscoverage['/editor/selection.js'].lineData[212] = 0;
  _$jscoverage['/editor/selection.js'].lineData[213] = 0;
  _$jscoverage['/editor/selection.js'].lineData[216] = 0;
  _$jscoverage['/editor/selection.js'].lineData[220] = 0;
  _$jscoverage['/editor/selection.js'].lineData[223] = 0;
  _$jscoverage['/editor/selection.js'].lineData[224] = 0;
  _$jscoverage['/editor/selection.js'].lineData[228] = 0;
  _$jscoverage['/editor/selection.js'].lineData[232] = 0;
  _$jscoverage['/editor/selection.js'].lineData[236] = 0;
  _$jscoverage['/editor/selection.js'].lineData[237] = 0;
  _$jscoverage['/editor/selection.js'].lineData[243] = 0;
  _$jscoverage['/editor/selection.js'].lineData[250] = 0;
  _$jscoverage['/editor/selection.js'].lineData[251] = 0;
  _$jscoverage['/editor/selection.js'].lineData[252] = 0;
  _$jscoverage['/editor/selection.js'].lineData[253] = 0;
  _$jscoverage['/editor/selection.js'].lineData[259] = 0;
  _$jscoverage['/editor/selection.js'].lineData[264] = 0;
  _$jscoverage['/editor/selection.js'].lineData[265] = 0;
  _$jscoverage['/editor/selection.js'].lineData[267] = 0;
  _$jscoverage['/editor/selection.js'].lineData[268] = 0;
  _$jscoverage['/editor/selection.js'].lineData[269] = 0;
  _$jscoverage['/editor/selection.js'].lineData[270] = 0;
  _$jscoverage['/editor/selection.js'].lineData[271] = 0;
  _$jscoverage['/editor/selection.js'].lineData[272] = 0;
  _$jscoverage['/editor/selection.js'].lineData[273] = 0;
  _$jscoverage['/editor/selection.js'].lineData[274] = 0;
  _$jscoverage['/editor/selection.js'].lineData[275] = 0;
  _$jscoverage['/editor/selection.js'].lineData[277] = 0;
  _$jscoverage['/editor/selection.js'].lineData[278] = 0;
  _$jscoverage['/editor/selection.js'].lineData[282] = 0;
  _$jscoverage['/editor/selection.js'].lineData[284] = 0;
  _$jscoverage['/editor/selection.js'].lineData[287] = 0;
  _$jscoverage['/editor/selection.js'].lineData[288] = 0;
  _$jscoverage['/editor/selection.js'].lineData[289] = 0;
  _$jscoverage['/editor/selection.js'].lineData[292] = 0;
  _$jscoverage['/editor/selection.js'].lineData[295] = 0;
  _$jscoverage['/editor/selection.js'].lineData[300] = 0;
  _$jscoverage['/editor/selection.js'].lineData[301] = 0;
  _$jscoverage['/editor/selection.js'].lineData[302] = 0;
  _$jscoverage['/editor/selection.js'].lineData[308] = 0;
  _$jscoverage['/editor/selection.js'].lineData[310] = 0;
  _$jscoverage['/editor/selection.js'].lineData[311] = 0;
  _$jscoverage['/editor/selection.js'].lineData[313] = 0;
  _$jscoverage['/editor/selection.js'].lineData[314] = 0;
  _$jscoverage['/editor/selection.js'].lineData[316] = 0;
  _$jscoverage['/editor/selection.js'].lineData[317] = 0;
  _$jscoverage['/editor/selection.js'].lineData[318] = 0;
  _$jscoverage['/editor/selection.js'].lineData[321] = 0;
  _$jscoverage['/editor/selection.js'].lineData[334] = 0;
  _$jscoverage['/editor/selection.js'].lineData[335] = 0;
  _$jscoverage['/editor/selection.js'].lineData[336] = 0;
  _$jscoverage['/editor/selection.js'].lineData[338] = 0;
  _$jscoverage['/editor/selection.js'].lineData[341] = 0;
  _$jscoverage['/editor/selection.js'].lineData[343] = 0;
  _$jscoverage['/editor/selection.js'].lineData[347] = 0;
  _$jscoverage['/editor/selection.js'].lineData[349] = 0;
  _$jscoverage['/editor/selection.js'].lineData[350] = 0;
  _$jscoverage['/editor/selection.js'].lineData[351] = 0;
  _$jscoverage['/editor/selection.js'].lineData[356] = 0;
  _$jscoverage['/editor/selection.js'].lineData[357] = 0;
  _$jscoverage['/editor/selection.js'].lineData[360] = 0;
  _$jscoverage['/editor/selection.js'].lineData[363] = 0;
  _$jscoverage['/editor/selection.js'].lineData[365] = 0;
  _$jscoverage['/editor/selection.js'].lineData[369] = 0;
  _$jscoverage['/editor/selection.js'].lineData[371] = 0;
  _$jscoverage['/editor/selection.js'].lineData[372] = 0;
  _$jscoverage['/editor/selection.js'].lineData[375] = 0;
  _$jscoverage['/editor/selection.js'].lineData[377] = 0;
  _$jscoverage['/editor/selection.js'].lineData[378] = 0;
  _$jscoverage['/editor/selection.js'].lineData[381] = 0;
  _$jscoverage['/editor/selection.js'].lineData[382] = 0;
  _$jscoverage['/editor/selection.js'].lineData[383] = 0;
  _$jscoverage['/editor/selection.js'].lineData[384] = 0;
  _$jscoverage['/editor/selection.js'].lineData[386] = 0;
  _$jscoverage['/editor/selection.js'].lineData[390] = 0;
  _$jscoverage['/editor/selection.js'].lineData[391] = 0;
  _$jscoverage['/editor/selection.js'].lineData[392] = 0;
  _$jscoverage['/editor/selection.js'].lineData[393] = 0;
  _$jscoverage['/editor/selection.js'].lineData[396] = 0;
  _$jscoverage['/editor/selection.js'].lineData[397] = 0;
  _$jscoverage['/editor/selection.js'].lineData[398] = 0;
  _$jscoverage['/editor/selection.js'].lineData[400] = 0;
  _$jscoverage['/editor/selection.js'].lineData[401] = 0;
  _$jscoverage['/editor/selection.js'].lineData[406] = 0;
  _$jscoverage['/editor/selection.js'].lineData[420] = 0;
  _$jscoverage['/editor/selection.js'].lineData[424] = 0;
  _$jscoverage['/editor/selection.js'].lineData[425] = 0;
  _$jscoverage['/editor/selection.js'].lineData[429] = 0;
  _$jscoverage['/editor/selection.js'].lineData[430] = 0;
  _$jscoverage['/editor/selection.js'].lineData[431] = 0;
  _$jscoverage['/editor/selection.js'].lineData[437] = 0;
  _$jscoverage['/editor/selection.js'].lineData[438] = 0;
  _$jscoverage['/editor/selection.js'].lineData[439] = 0;
  _$jscoverage['/editor/selection.js'].lineData[447] = 0;
  _$jscoverage['/editor/selection.js'].lineData[459] = 0;
  _$jscoverage['/editor/selection.js'].lineData[462] = 0;
  _$jscoverage['/editor/selection.js'].lineData[465] = 0;
  _$jscoverage['/editor/selection.js'].lineData[468] = 0;
  _$jscoverage['/editor/selection.js'].lineData[473] = 0;
  _$jscoverage['/editor/selection.js'].lineData[477] = 0;
  _$jscoverage['/editor/selection.js'].lineData[480] = 0;
  _$jscoverage['/editor/selection.js'].lineData[484] = 0;
  _$jscoverage['/editor/selection.js'].lineData[486] = 0;
  _$jscoverage['/editor/selection.js'].lineData[487] = 0;
  _$jscoverage['/editor/selection.js'].lineData[488] = 0;
  _$jscoverage['/editor/selection.js'].lineData[491] = 0;
  _$jscoverage['/editor/selection.js'].lineData[492] = 0;
  _$jscoverage['/editor/selection.js'].lineData[493] = 0;
  _$jscoverage['/editor/selection.js'].lineData[497] = 0;
  _$jscoverage['/editor/selection.js'].lineData[500] = 0;
  _$jscoverage['/editor/selection.js'].lineData[501] = 0;
  _$jscoverage['/editor/selection.js'].lineData[503] = 0;
  _$jscoverage['/editor/selection.js'].lineData[504] = 0;
  _$jscoverage['/editor/selection.js'].lineData[505] = 0;
  _$jscoverage['/editor/selection.js'].lineData[506] = 0;
  _$jscoverage['/editor/selection.js'].lineData[511] = 0;
  _$jscoverage['/editor/selection.js'].lineData[512] = 0;
  _$jscoverage['/editor/selection.js'].lineData[513] = 0;
  _$jscoverage['/editor/selection.js'].lineData[515] = 0;
  _$jscoverage['/editor/selection.js'].lineData[516] = 0;
  _$jscoverage['/editor/selection.js'].lineData[517] = 0;
  _$jscoverage['/editor/selection.js'].lineData[522] = 0;
  _$jscoverage['/editor/selection.js'].lineData[523] = 0;
  _$jscoverage['/editor/selection.js'].lineData[525] = 0;
  _$jscoverage['/editor/selection.js'].lineData[528] = 0;
  _$jscoverage['/editor/selection.js'].lineData[529] = 0;
  _$jscoverage['/editor/selection.js'].lineData[530] = 0;
  _$jscoverage['/editor/selection.js'].lineData[532] = 0;
  _$jscoverage['/editor/selection.js'].lineData[533] = 0;
  _$jscoverage['/editor/selection.js'].lineData[534] = 0;
  _$jscoverage['/editor/selection.js'].lineData[542] = 0;
  _$jscoverage['/editor/selection.js'].lineData[546] = 0;
  _$jscoverage['/editor/selection.js'].lineData[549] = 0;
  _$jscoverage['/editor/selection.js'].lineData[550] = 0;
  _$jscoverage['/editor/selection.js'].lineData[553] = 0;
  _$jscoverage['/editor/selection.js'].lineData[554] = 0;
  _$jscoverage['/editor/selection.js'].lineData[556] = 0;
  _$jscoverage['/editor/selection.js'].lineData[558] = 0;
  _$jscoverage['/editor/selection.js'].lineData[562] = 0;
  _$jscoverage['/editor/selection.js'].lineData[565] = 0;
  _$jscoverage['/editor/selection.js'].lineData[566] = 0;
  _$jscoverage['/editor/selection.js'].lineData[568] = 0;
  _$jscoverage['/editor/selection.js'].lineData[571] = 0;
  _$jscoverage['/editor/selection.js'].lineData[575] = 0;
  _$jscoverage['/editor/selection.js'].lineData[576] = 0;
  _$jscoverage['/editor/selection.js'].lineData[577] = 0;
  _$jscoverage['/editor/selection.js'].lineData[578] = 0;
  _$jscoverage['/editor/selection.js'].lineData[579] = 0;
  _$jscoverage['/editor/selection.js'].lineData[581] = 0;
  _$jscoverage['/editor/selection.js'].lineData[585] = 0;
  _$jscoverage['/editor/selection.js'].lineData[586] = 0;
  _$jscoverage['/editor/selection.js'].lineData[590] = 0;
  _$jscoverage['/editor/selection.js'].lineData[591] = 0;
  _$jscoverage['/editor/selection.js'].lineData[592] = 0;
  _$jscoverage['/editor/selection.js'].lineData[593] = 0;
  _$jscoverage['/editor/selection.js'].lineData[597] = 0;
  _$jscoverage['/editor/selection.js'].lineData[601] = 0;
  _$jscoverage['/editor/selection.js'].lineData[602] = 0;
  _$jscoverage['/editor/selection.js'].lineData[603] = 0;
  _$jscoverage['/editor/selection.js'].lineData[604] = 0;
  _$jscoverage['/editor/selection.js'].lineData[605] = 0;
  _$jscoverage['/editor/selection.js'].lineData[607] = 0;
  _$jscoverage['/editor/selection.js'].lineData[608] = 0;
  _$jscoverage['/editor/selection.js'].lineData[612] = 0;
  _$jscoverage['/editor/selection.js'].lineData[615] = 0;
  _$jscoverage['/editor/selection.js'].lineData[622] = 0;
  _$jscoverage['/editor/selection.js'].lineData[623] = 0;
  _$jscoverage['/editor/selection.js'].lineData[630] = 0;
  _$jscoverage['/editor/selection.js'].lineData[631] = 0;
  _$jscoverage['/editor/selection.js'].lineData[632] = 0;
  _$jscoverage['/editor/selection.js'].lineData[634] = 0;
  _$jscoverage['/editor/selection.js'].lineData[640] = 0;
  _$jscoverage['/editor/selection.js'].lineData[642] = 0;
  _$jscoverage['/editor/selection.js'].lineData[645] = 0;
  _$jscoverage['/editor/selection.js'].lineData[649] = 0;
  _$jscoverage['/editor/selection.js'].lineData[651] = 0;
  _$jscoverage['/editor/selection.js'].lineData[655] = 0;
  _$jscoverage['/editor/selection.js'].lineData[656] = 0;
  _$jscoverage['/editor/selection.js'].lineData[660] = 0;
  _$jscoverage['/editor/selection.js'].lineData[661] = 0;
  _$jscoverage['/editor/selection.js'].lineData[663] = 0;
  _$jscoverage['/editor/selection.js'].lineData[664] = 0;
  _$jscoverage['/editor/selection.js'].lineData[669] = 0;
  _$jscoverage['/editor/selection.js'].lineData[670] = 0;
  _$jscoverage['/editor/selection.js'].lineData[671] = 0;
  _$jscoverage['/editor/selection.js'].lineData[674] = 0;
  _$jscoverage['/editor/selection.js'].lineData[677] = 0;
  _$jscoverage['/editor/selection.js'].lineData[678] = 0;
  _$jscoverage['/editor/selection.js'].lineData[679] = 0;
  _$jscoverage['/editor/selection.js'].lineData[683] = 0;
  _$jscoverage['/editor/selection.js'].lineData[689] = 0;
  _$jscoverage['/editor/selection.js'].lineData[694] = 0;
  _$jscoverage['/editor/selection.js'].lineData[695] = 0;
  _$jscoverage['/editor/selection.js'].lineData[696] = 0;
  _$jscoverage['/editor/selection.js'].lineData[697] = 0;
  _$jscoverage['/editor/selection.js'].lineData[702] = 0;
  _$jscoverage['/editor/selection.js'].lineData[706] = 0;
  _$jscoverage['/editor/selection.js'].lineData[709] = 0;
  _$jscoverage['/editor/selection.js'].lineData[713] = 0;
  _$jscoverage['/editor/selection.js'].lineData[714] = 0;
  _$jscoverage['/editor/selection.js'].lineData[717] = 0;
  _$jscoverage['/editor/selection.js'].lineData[720] = 0;
  _$jscoverage['/editor/selection.js'].lineData[722] = 0;
  _$jscoverage['/editor/selection.js'].lineData[724] = 0;
  _$jscoverage['/editor/selection.js'].lineData[726] = 0;
  _$jscoverage['/editor/selection.js'].lineData[728] = 0;
  _$jscoverage['/editor/selection.js'].lineData[730] = 0;
  _$jscoverage['/editor/selection.js'].lineData[731] = 0;
  _$jscoverage['/editor/selection.js'].lineData[738] = 0;
  _$jscoverage['/editor/selection.js'].lineData[739] = 0;
  _$jscoverage['/editor/selection.js'].lineData[740] = 0;
  _$jscoverage['/editor/selection.js'].lineData[742] = 0;
  _$jscoverage['/editor/selection.js'].lineData[759] = 0;
  _$jscoverage['/editor/selection.js'].lineData[760] = 0;
  _$jscoverage['/editor/selection.js'].lineData[761] = 0;
  _$jscoverage['/editor/selection.js'].lineData[762] = 0;
  _$jscoverage['/editor/selection.js'].lineData[767] = 0;
  _$jscoverage['/editor/selection.js'].lineData[772] = 0;
  _$jscoverage['/editor/selection.js'].lineData[773] = 0;
  _$jscoverage['/editor/selection.js'].lineData[775] = 0;
  _$jscoverage['/editor/selection.js'].lineData[776] = 0;
  _$jscoverage['/editor/selection.js'].lineData[778] = 0;
  _$jscoverage['/editor/selection.js'].lineData[779] = 0;
  _$jscoverage['/editor/selection.js'].lineData[781] = 0;
  _$jscoverage['/editor/selection.js'].lineData[783] = 0;
  _$jscoverage['/editor/selection.js'].lineData[784] = 0;
  _$jscoverage['/editor/selection.js'].lineData[785] = 0;
  _$jscoverage['/editor/selection.js'].lineData[786] = 0;
  _$jscoverage['/editor/selection.js'].lineData[789] = 0;
  _$jscoverage['/editor/selection.js'].lineData[790] = 0;
  _$jscoverage['/editor/selection.js'].lineData[791] = 0;
  _$jscoverage['/editor/selection.js'].lineData[796] = 0;
  _$jscoverage['/editor/selection.js'].lineData[797] = 0;
  _$jscoverage['/editor/selection.js'].lineData[798] = 0;
  _$jscoverage['/editor/selection.js'].lineData[801] = 0;
  _$jscoverage['/editor/selection.js'].lineData[803] = 0;
  _$jscoverage['/editor/selection.js'].lineData[805] = 0;
}
if (! _$jscoverage['/editor/selection.js'].functionData) {
  _$jscoverage['/editor/selection.js'].functionData = [];
  _$jscoverage['/editor/selection.js'].functionData[0] = 0;
  _$jscoverage['/editor/selection.js'].functionData[1] = 0;
  _$jscoverage['/editor/selection.js'].functionData[2] = 0;
  _$jscoverage['/editor/selection.js'].functionData[3] = 0;
  _$jscoverage['/editor/selection.js'].functionData[4] = 0;
  _$jscoverage['/editor/selection.js'].functionData[5] = 0;
  _$jscoverage['/editor/selection.js'].functionData[6] = 0;
  _$jscoverage['/editor/selection.js'].functionData[7] = 0;
  _$jscoverage['/editor/selection.js'].functionData[8] = 0;
  _$jscoverage['/editor/selection.js'].functionData[9] = 0;
  _$jscoverage['/editor/selection.js'].functionData[10] = 0;
  _$jscoverage['/editor/selection.js'].functionData[11] = 0;
  _$jscoverage['/editor/selection.js'].functionData[12] = 0;
  _$jscoverage['/editor/selection.js'].functionData[13] = 0;
  _$jscoverage['/editor/selection.js'].functionData[14] = 0;
  _$jscoverage['/editor/selection.js'].functionData[15] = 0;
  _$jscoverage['/editor/selection.js'].functionData[16] = 0;
  _$jscoverage['/editor/selection.js'].functionData[17] = 0;
  _$jscoverage['/editor/selection.js'].functionData[18] = 0;
  _$jscoverage['/editor/selection.js'].functionData[19] = 0;
  _$jscoverage['/editor/selection.js'].functionData[20] = 0;
  _$jscoverage['/editor/selection.js'].functionData[21] = 0;
  _$jscoverage['/editor/selection.js'].functionData[22] = 0;
  _$jscoverage['/editor/selection.js'].functionData[23] = 0;
  _$jscoverage['/editor/selection.js'].functionData[24] = 0;
}
if (! _$jscoverage['/editor/selection.js'].branchData) {
  _$jscoverage['/editor/selection.js'].branchData = {};
  _$jscoverage['/editor/selection.js'].branchData['33'] = [];
  _$jscoverage['/editor/selection.js'].branchData['33'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['51'] = [];
  _$jscoverage['/editor/selection.js'].branchData['51'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['54'] = [];
  _$jscoverage['/editor/selection.js'].branchData['54'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['55'] = [];
  _$jscoverage['/editor/selection.js'].branchData['55'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['55'][2] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['55'][3] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['56'] = [];
  _$jscoverage['/editor/selection.js'].branchData['56'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['56'][2] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['85'] = [];
  _$jscoverage['/editor/selection.js'].branchData['85'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['90'] = [];
  _$jscoverage['/editor/selection.js'].branchData['90'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['114'] = [];
  _$jscoverage['/editor/selection.js'].branchData['114'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['120'] = [];
  _$jscoverage['/editor/selection.js'].branchData['120'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['122'] = [];
  _$jscoverage['/editor/selection.js'].branchData['122'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['129'] = [];
  _$jscoverage['/editor/selection.js'].branchData['129'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['129'][2] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['130'] = [];
  _$jscoverage['/editor/selection.js'].branchData['130'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['130'][2] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['131'] = [];
  _$jscoverage['/editor/selection.js'].branchData['131'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['131'][2] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['141'] = [];
  _$jscoverage['/editor/selection.js'].branchData['141'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['150'] = [];
  _$jscoverage['/editor/selection.js'].branchData['150'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['153'] = [];
  _$jscoverage['/editor/selection.js'].branchData['153'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['161'] = [];
  _$jscoverage['/editor/selection.js'].branchData['161'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['183'] = [];
  _$jscoverage['/editor/selection.js'].branchData['183'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['186'] = [];
  _$jscoverage['/editor/selection.js'].branchData['186'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['196'] = [];
  _$jscoverage['/editor/selection.js'].branchData['196'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['200'] = [];
  _$jscoverage['/editor/selection.js'].branchData['200'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['201'] = [];
  _$jscoverage['/editor/selection.js'].branchData['201'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['201'][2] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['201'][3] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['203'] = [];
  _$jscoverage['/editor/selection.js'].branchData['203'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['210'] = [];
  _$jscoverage['/editor/selection.js'].branchData['210'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['224'] = [];
  _$jscoverage['/editor/selection.js'].branchData['224'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['236'] = [];
  _$jscoverage['/editor/selection.js'].branchData['236'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['252'] = [];
  _$jscoverage['/editor/selection.js'].branchData['252'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['260'] = [];
  _$jscoverage['/editor/selection.js'].branchData['260'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['264'] = [];
  _$jscoverage['/editor/selection.js'].branchData['264'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['267'] = [];
  _$jscoverage['/editor/selection.js'].branchData['267'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['274'] = [];
  _$jscoverage['/editor/selection.js'].branchData['274'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['277'] = [];
  _$jscoverage['/editor/selection.js'].branchData['277'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['284'] = [];
  _$jscoverage['/editor/selection.js'].branchData['284'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['284'][2] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['284'][3] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['301'] = [];
  _$jscoverage['/editor/selection.js'].branchData['301'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['310'] = [];
  _$jscoverage['/editor/selection.js'].branchData['310'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['313'] = [];
  _$jscoverage['/editor/selection.js'].branchData['313'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['335'] = [];
  _$jscoverage['/editor/selection.js'].branchData['335'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['349'] = [];
  _$jscoverage['/editor/selection.js'].branchData['349'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['350'] = [];
  _$jscoverage['/editor/selection.js'].branchData['350'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['360'] = [];
  _$jscoverage['/editor/selection.js'].branchData['360'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['360'][2] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['360'][3] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['371'] = [];
  _$jscoverage['/editor/selection.js'].branchData['371'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['377'] = [];
  _$jscoverage['/editor/selection.js'].branchData['377'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['377'][2] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['382'] = [];
  _$jscoverage['/editor/selection.js'].branchData['382'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['382'][2] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['390'] = [];
  _$jscoverage['/editor/selection.js'].branchData['390'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['397'] = [];
  _$jscoverage['/editor/selection.js'].branchData['397'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['397'][2] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['400'] = [];
  _$jscoverage['/editor/selection.js'].branchData['400'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['424'] = [];
  _$jscoverage['/editor/selection.js'].branchData['424'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['429'] = [];
  _$jscoverage['/editor/selection.js'].branchData['429'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['431'] = [];
  _$jscoverage['/editor/selection.js'].branchData['431'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['437'] = [];
  _$jscoverage['/editor/selection.js'].branchData['437'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['448'] = [];
  _$jscoverage['/editor/selection.js'].branchData['448'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['448'][2] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['449'] = [];
  _$jscoverage['/editor/selection.js'].branchData['449'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['449'][2] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['451'] = [];
  _$jscoverage['/editor/selection.js'].branchData['451'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['480'] = [];
  _$jscoverage['/editor/selection.js'].branchData['480'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['512'] = [];
  _$jscoverage['/editor/selection.js'].branchData['512'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['513'] = [];
  _$jscoverage['/editor/selection.js'].branchData['513'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['522'] = [];
  _$jscoverage['/editor/selection.js'].branchData['522'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['529'] = [];
  _$jscoverage['/editor/selection.js'].branchData['529'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['533'] = [];
  _$jscoverage['/editor/selection.js'].branchData['533'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['542'] = [];
  _$jscoverage['/editor/selection.js'].branchData['542'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['543'] = [];
  _$jscoverage['/editor/selection.js'].branchData['543'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['543'][2] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['543'][3] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['543'][4] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['543'][5] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['544'] = [];
  _$jscoverage['/editor/selection.js'].branchData['544'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['544'][2] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['565'] = [];
  _$jscoverage['/editor/selection.js'].branchData['565'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['575'] = [];
  _$jscoverage['/editor/selection.js'].branchData['575'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['577'] = [];
  _$jscoverage['/editor/selection.js'].branchData['577'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['585'] = [];
  _$jscoverage['/editor/selection.js'].branchData['585'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['590'] = [];
  _$jscoverage['/editor/selection.js'].branchData['590'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['591'] = [];
  _$jscoverage['/editor/selection.js'].branchData['591'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['592'] = [];
  _$jscoverage['/editor/selection.js'].branchData['592'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['593'] = [];
  _$jscoverage['/editor/selection.js'].branchData['593'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['602'] = [];
  _$jscoverage['/editor/selection.js'].branchData['602'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['623'] = [];
  _$jscoverage['/editor/selection.js'].branchData['623'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['631'] = [];
  _$jscoverage['/editor/selection.js'].branchData['631'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['632'] = [];
  _$jscoverage['/editor/selection.js'].branchData['632'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['634'] = [];
  _$jscoverage['/editor/selection.js'].branchData['634'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['649'] = [];
  _$jscoverage['/editor/selection.js'].branchData['649'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['650'] = [];
  _$jscoverage['/editor/selection.js'].branchData['650'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['650'][2] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['669'] = [];
  _$jscoverage['/editor/selection.js'].branchData['669'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['692'] = [];
  _$jscoverage['/editor/selection.js'].branchData['692'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['692'][2] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['693'] = [];
  _$jscoverage['/editor/selection.js'].branchData['693'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['695'] = [];
  _$jscoverage['/editor/selection.js'].branchData['695'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['702'] = [];
  _$jscoverage['/editor/selection.js'].branchData['702'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['702'][2] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['702'][3] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['704'] = [];
  _$jscoverage['/editor/selection.js'].branchData['704'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['704'][2] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['713'] = [];
  _$jscoverage['/editor/selection.js'].branchData['713'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['724'] = [];
  _$jscoverage['/editor/selection.js'].branchData['724'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['739'] = [];
  _$jscoverage['/editor/selection.js'].branchData['739'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['743'] = [];
  _$jscoverage['/editor/selection.js'].branchData['743'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['743'][2] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['743'][3] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['746'] = [];
  _$jscoverage['/editor/selection.js'].branchData['746'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['746'][2] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['748'] = [];
  _$jscoverage['/editor/selection.js'].branchData['748'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['749'] = [];
  _$jscoverage['/editor/selection.js'].branchData['749'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['762'] = [];
  _$jscoverage['/editor/selection.js'].branchData['762'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['767'] = [];
  _$jscoverage['/editor/selection.js'].branchData['767'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['775'] = [];
  _$jscoverage['/editor/selection.js'].branchData['775'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['776'] = [];
  _$jscoverage['/editor/selection.js'].branchData['776'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['784'] = [];
  _$jscoverage['/editor/selection.js'].branchData['784'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['798'] = [];
  _$jscoverage['/editor/selection.js'].branchData['798'][1] = new BranchData();
}
_$jscoverage['/editor/selection.js'].branchData['798'][1].init(58, 21, '!sel || sel.isInvalid');
function visit750_798_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['798'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['784'][1].init(475, 9, 'dummySpan');
function visit749_784_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['784'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['776'][1].init(29, 18, 'isStartMarkerAlone');
function visit748_776_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['776'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['775'][1].init(5323, 9, 'collapsed');
function visit747_775_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['775'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['767'][1].init(396, 25, 'startNode[0] || startNode');
function visit746_767_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['767'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['762'][1].init(1889, 18, 'isStartMarkerAlone');
function visit745_762_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['762'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['749'][1].init(75, 50, 'Dom.nodeName(startNode[0].previousSibling) == \'br\'');
function visit744_749_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['749'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['748'][1].init(-1, 126, 'startNode[0].previousSibling && Dom.nodeName(startNode[0].previousSibling) == \'br\'');
function visit743_748_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['748'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['746'][2].init(211, 279, '!startNode[0].previousSibling || (startNode[0].previousSibling && Dom.nodeName(startNode[0].previousSibling) == \'br\')');
function visit742_746_2(result) {
  _$jscoverage['/editor/selection.js'].branchData['746'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['746'][1].init(196, 294, 'forceExpand || !startNode[0].previousSibling || (startNode[0].previousSibling && Dom.nodeName(startNode[0].previousSibling) == \'br\')');
function visit741_746_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['746'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['743'][3].init(62, 55, 'next.nodeValue && next.nodeValue.match(fillerTextRegex)');
function visit740_743_3(result) {
  _$jscoverage['/editor/selection.js'].branchData['743'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['743'][2].init(54, 63, 'next && next.nodeValue && next.nodeValue.match(fillerTextRegex)');
function visit739_743_2(result) {
  _$jscoverage['/editor/selection.js'].branchData['743'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['743'][1].init(-1, 529, '!(next && next.nodeValue && next.nodeValue.match(fillerTextRegex)) && (forceExpand || !startNode[0].previousSibling || (startNode[0].previousSibling && Dom.nodeName(startNode[0].previousSibling) == \'br\'))');
function visit738_743_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['743'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['739'][1].init(451, 29, 'next && !notWhitespaces(next)');
function visit737_739_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['739'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['724'][1].init(2169, 7, 'endNode');
function visit736_724_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['724'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['713'][1].init(1703, 10, '!collapsed');
function visit735_713_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['713'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['704'][2].init(1242, 58, 'self.endContainer[0].nodeType == Dom.NodeType.ELEMENT_NODE');
function visit734_704_2(result) {
  _$jscoverage['/editor/selection.js'].branchData['704'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['704'][1].init(157, 126, 'self.endContainer[0].nodeType == Dom.NodeType.ELEMENT_NODE && self.endContainer.nodeName() in nonCells');
function visit733_704_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['704'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['702'][3].init(1082, 60, 'self.startContainer[0].nodeType == Dom.NodeType.ELEMENT_NODE');
function visit732_702_3(result) {
  _$jscoverage['/editor/selection.js'].branchData['702'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['702'][2].init(1082, 130, 'self.startContainer[0].nodeType == Dom.NodeType.ELEMENT_NODE && self.startContainer.nodeName() in nonCells');
function visit731_702_2(result) {
  _$jscoverage['/editor/selection.js'].branchData['702'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['702'][1].init(1082, 284, 'self.startContainer[0].nodeType == Dom.NodeType.ELEMENT_NODE && self.startContainer.nodeName() in nonCells || self.endContainer[0].nodeType == Dom.NodeType.ELEMENT_NODE && self.endContainer.nodeName() in nonCells');
function visit730_702_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['702'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['695'][1].init(118, 43, 'selEl.nodeType == Dom.NodeType.ELEMENT_NODE');
function visit729_695_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['695'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['693'][1].init(78, 38, 'self.endOffset - self.startOffset == 1');
function visit728_693_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['693'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['692'][2].init(382, 47, 'self.startContainer[0] === self.endContainer[0]');
function visit727_692_2(result) {
  _$jscoverage['/editor/selection.js'].branchData['692'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['692'][1].init(103, 117, 'self.startContainer[0] === self.endContainer[0] && self.endOffset - self.startOffset == 1');
function visit726_692_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['692'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['669'][1].init(292, 51, 'e.toString().indexOf(\'NS_ERROR_ILLEGAL_VALUE\') >= 0');
function visit725_669_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['669'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['650'][2].init(296, 55, 'startContainer[0].nodeType == Dom.NodeType.ELEMENT_NODE');
function visit724_650_2(result) {
  _$jscoverage['/editor/selection.js'].branchData['650'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['650'][1].init(37, 95, 'startContainer[0].nodeType == Dom.NodeType.ELEMENT_NODE && !startContainer[0].childNodes.length');
function visit723_650_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['650'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['649'][1].init(256, 133, 'self.collapsed && startContainer[0].nodeType == Dom.NodeType.ELEMENT_NODE && !startContainer[0].childNodes.length');
function visit722_649_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['649'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['634'][1].init(17, 18, 'sel && sel.clear()');
function visit721_634_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['634'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['632'][1].init(17, 28, 'sel && sel.removeAllRanges()');
function visit720_632_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['632'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['631'][1].init(57, 7, '!OLD_IE');
function visit719_631_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['631'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['623'][1].init(192, 180, 'start && start.scrollIntoView(undefined, {\n  alignWithTop: false, \n  allowHorizontalScroll: true, \n  onlyScrollIfNeeded: true})');
function visit718_623_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['623'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['602'][1].init(71, 20, 'i < bookmarks.length');
function visit717_602_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['602'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['593'][1].init(478, 68, 'Dom.equals(rangeEnd, bookmarkEnd.parent()) && dirtyRange.endOffset++');
function visit716_593_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['593'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['592'][1].init(386, 70, 'Dom.equals(rangeEnd, bookmarkStart.parent()) && dirtyRange.endOffset++');
function visit715_592_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['592'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['591'][1].init(292, 72, 'Dom.equals(rangeStart, bookmarkEnd.parent()) && dirtyRange.startOffset++');
function visit714_591_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['591'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['590'][1].init(196, 74, 'Dom.equals(rangeStart, bookmarkStart.parent()) && dirtyRange.startOffset++');
function visit713_590_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['590'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['585'][1].init(492, 10, 'j < length');
function visit712_585_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['585'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['577'][1].init(239, 10, 'i < length');
function visit711_577_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['577'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['575'][1].init(143, 26, 'ranges || self.getRanges()');
function visit710_575_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['575'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['565'][1].init(105, 17, 'i < ranges.length');
function visit709_565_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['565'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['544'][2].init(593, 55, 'startContainer[0].nodeType == Dom.NodeType.ELEMENT_NODE');
function visit708_544_2(result) {
  _$jscoverage['/editor/selection.js'].branchData['544'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['544'][1].init(87, 95, 'startContainer[0].nodeType == Dom.NodeType.ELEMENT_NODE && !startContainer[0].childNodes.length');
function visit707_544_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['544'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['543'][5].init(539, 24, 'UA.opera || UA[\'webkit\']');
function visit706_543_5(result) {
  _$jscoverage['/editor/selection.js'].branchData['543'][5].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['543'][4].init(516, 17, 'UA.gecko < 1.0900');
function visit705_543_4(result) {
  _$jscoverage['/editor/selection.js'].branchData['543'][4].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['543'][3].init(504, 29, 'UA.gecko && UA.gecko < 1.0900');
function visit704_543_3(result) {
  _$jscoverage['/editor/selection.js'].branchData['543'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['543'][2].init(504, 59, '(UA.gecko && UA.gecko < 1.0900) || UA.opera || UA[\'webkit\']');
function visit703_543_2(result) {
  _$jscoverage['/editor/selection.js'].branchData['543'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['543'][1].init(45, 183, '((UA.gecko && UA.gecko < 1.0900) || UA.opera || UA[\'webkit\']) && startContainer[0].nodeType == Dom.NodeType.ELEMENT_NODE && !startContainer[0].childNodes.length');
function visit702_543_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['543'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['542'][1].init(456, 229, 'range.collapsed && ((UA.gecko && UA.gecko < 1.0900) || UA.opera || UA[\'webkit\']) && startContainer[0].nodeType == Dom.NodeType.ELEMENT_NODE && !startContainer[0].childNodes.length');
function visit701_542_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['542'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['533'][1].init(190, 17, 'i < ranges.length');
function visit700_533_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['533'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['529'][1].init(65, 4, '!sel');
function visit699_529_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['529'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['522'][1].init(464, 11, 'ranges[0]');
function visit698_522_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['522'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['513'][1].init(21, 17, 'ranges.length > 1');
function visit697_513_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['513'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['512'][1].init(46, 6, 'OLD_IE');
function visit696_512_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['512'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['480'][1].init(106, 6, 'OLD_IE');
function visit695_480_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['480'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['451'][1].init(128, 98, 'styleObjectElements[enclosed.nodeName()] && (selected = enclosed)');
function visit694_451_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['451'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['449'][2].init(76, 49, 'enclosed[0].nodeType == Dom.NodeType.ELEMENT_NODE');
function visit693_449_2(result) {
  _$jscoverage['/editor/selection.js'].branchData['449'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['449'][1].init(70, 227, '(enclosed[0].nodeType == Dom.NodeType.ELEMENT_NODE) && styleObjectElements[enclosed.nodeName()] && (selected = enclosed)');
function visit692_449_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['449'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['448'][2].init(359, 298, '(enclosed = range.getEnclosedNode()) && (enclosed[0].nodeType == Dom.NodeType.ELEMENT_NODE) && styleObjectElements[enclosed.nodeName()] && (selected = enclosed)');
function visit691_448_2(result) {
  _$jscoverage['/editor/selection.js'].branchData['448'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['448'][1].init(40, 308, 'i && !((enclosed = range.getEnclosedNode()) && (enclosed[0].nodeType == Dom.NodeType.ELEMENT_NODE) && styleObjectElements[enclosed.nodeName()] && (selected = enclosed))');
function visit690_448_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['448'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['437'][1].init(566, 5, '!node');
function visit689_437_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['437'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['431'][1].init(84, 27, 'range.item && range.item(0)');
function visit688_431_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['431'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['429'][1].init(278, 6, 'OLD_IE');
function visit687_429_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['429'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['424'][1].init(107, 35, 'cache.selectedElement !== undefined');
function visit686_424_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['424'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['400'][1].init(236, 4, 'node');
function visit685_400_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['400'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['397'][2].init(84, 42, 'node.nodeType != Dom.NodeType.ELEMENT_NODE');
function visit684_397_2(result) {
  _$jscoverage['/editor/selection.js'].branchData['397'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['397'][1].init(76, 50, 'node && node.nodeType != Dom.NodeType.ELEMENT_NODE');
function visit683_397_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['397'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['390'][1].init(2119, 6, 'OLD_IE');
function visit682_390_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['390'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['382'][2].init(1654, 43, 'child.nodeType == Dom.NodeType.ELEMENT_NODE');
function visit681_382_2(result) {
  _$jscoverage['/editor/selection.js'].branchData['382'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['382'][1].init(1645, 52, 'child && child.nodeType == Dom.NodeType.ELEMENT_NODE');
function visit680_382_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['382'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['377'][2].init(1409, 45, 'node[0].nodeType != Dom.NodeType.ELEMENT_NODE');
function visit679_377_2(result) {
  _$jscoverage['/editor/selection.js'].branchData['377'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['377'][1].init(1397, 57, '!node[0] || node[0].nodeType != Dom.NodeType.ELEMENT_NODE');
function visit678_377_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['377'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['371'][1].init(1146, 45, 'node[0].nodeType != Dom.NodeType.ELEMENT_NODE');
function visit677_371_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['371'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['360'][3].init(282, 56, 'startContainer[0].nodeType === Dom.NodeType.ELEMENT_NODE');
function visit676_360_3(result) {
  _$jscoverage['/editor/selection.js'].branchData['360'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['360'][2].init(265, 186, 'startOffset == (startContainer[0].nodeType === Dom.NodeType.ELEMENT_NODE ? startContainer[0].childNodes.length : startContainer[0].nodeValue.length)');
function visit675_360_2(result) {
  _$jscoverage['/editor/selection.js'].branchData['360'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['360'][1].init(265, 263, 'startOffset == (startContainer[0].nodeType === Dom.NodeType.ELEMENT_NODE ? startContainer[0].childNodes.length : startContainer[0].nodeValue.length) && !startContainer._4e_isBlockBoundary()');
function visit674_360_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['360'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['350'][1].init(29, 16, '!range.collapsed');
function visit673_350_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['350'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['349'][1].init(104, 5, 'range');
function visit672_349_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['349'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['335'][1].init(68, 32, 'cache.startElement !== undefined');
function visit671_335_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['335'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['313'][1].init(445, 18, 'i < sel.rangeCount');
function visit670_313_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['313'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['310'][1].init(375, 4, '!sel');
function visit669_310_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['310'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['301'][1].init(76, 22, 'cache.ranges && !force');
function visit668_301_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['301'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['284'][3].init(311, 38, 'parentElement.childNodes[j] != element');
function visit667_284_3(result) {
  _$jscoverage['/editor/selection.js'].branchData['284'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['284'][2].init(272, 35, 'j < parentElement.childNodes.length');
function visit666_284_2(result) {
  _$jscoverage['/editor/selection.js'].branchData['284'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['284'][1].init(272, 77, 'j < parentElement.childNodes.length && parentElement.childNodes[j] != element');
function visit665_284_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['284'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['277'][1].init(98, 22, 'i < nativeRange.length');
function visit664_277_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['277'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['274'][1].init(1160, 29, 'type == KES.SELECTION_ELEMENT');
function visit663_274_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['274'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['267'][1].init(627, 26, 'type == KES.SELECTION_TEXT');
function visit662_267_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['267'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['264'][1].init(561, 4, '!sel');
function visit661_264_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['264'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['260'][1].init(65, 24, 'sel && sel.createRange()');
function visit660_260_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['260'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['252'][1].init(84, 22, 'cache.ranges && !force');
function visit659_252_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['252'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['236'][1].init(2881, 14, 'distance === 0');
function visit658_236_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['236'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['224'][1].init(32, 12, 'distance > 0');
function visit657_224_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['224'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['210'][1].init(1706, 10, '!testRange');
function visit656_210_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['210'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['203'][1].init(941, 14, '!comparisonEnd');
function visit655_203_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['203'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['201'][3].init(21, 21, 'comparisonStart == -1');
function visit654_201_3(result) {
  _$jscoverage['/editor/selection.js'].branchData['201'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['201'][2].init(787, 18, 'comparisonEnd == 1');
function visit653_201_2(result) {
  _$jscoverage['/editor/selection.js'].branchData['201'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['201'][1].init(51, 43, 'comparisonEnd == 1 && comparisonStart == -1');
function visit652_201_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['201'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['200'][1].init(733, 95, '!comparisonStart || comparisonEnd == 1 && comparisonStart == -1');
function visit651_200_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['200'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['196'][1].init(445, 19, 'comparisonStart > 0');
function visit650_196_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['196'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['186'][1].init(81, 43, 'child.nodeType == Dom.NodeType.ELEMENT_NODE');
function visit649_186_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['186'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['183'][1].init(400, 19, 'i < siblings.length');
function visit648_183_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['183'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['161'][1].init(650, 31, 'sel.createRange().parentElement');
function visit647_161_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['161'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['153'][1].init(211, 19, 'ieType == \'Control\'');
function visit646_153_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['153'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['150'][1].init(117, 16, 'ieType == \'Text\'');
function visit645_150_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['150'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['141'][1].init(76, 10, 'cache.type');
function visit644_141_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['141'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['131'][2].init(403, 48, 'Number(range.endOffset - range.startOffset) == 1');
function visit643_131_2(result) {
  _$jscoverage['/editor/selection.js'].branchData['131'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['131'][1].init(79, 168, 'Number(range.endOffset - range.startOffset) == 1 && styleObjectElements[startContainer.childNodes[range.startOffset].nodeName.toLowerCase()]');
function visit642_131_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['131'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['130'][2].init(322, 52, 'startContainer.nodeType == Dom.NodeType.ELEMENT_NODE');
function visit641_130_2(result) {
  _$jscoverage['/editor/selection.js'].branchData['130'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['130'][1].init(63, 248, 'startContainer.nodeType == Dom.NodeType.ELEMENT_NODE && Number(range.endOffset - range.startOffset) == 1 && styleObjectElements[startContainer.childNodes[range.startOffset].nodeName.toLowerCase()]');
function visit640_130_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['130'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['129'][2].init(256, 36, 'startContainer == range.endContainer');
function visit639_129_2(result) {
  _$jscoverage['/editor/selection.js'].branchData['129'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['129'][1].init(256, 312, 'startContainer == range.endContainer && startContainer.nodeType == Dom.NodeType.ELEMENT_NODE && Number(range.endOffset - range.startOffset) == 1 && styleObjectElements[startContainer.childNodes[range.startOffset].nodeName.toLowerCase()]');
function visit638_129_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['129'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['122'][1].init(319, 19, 'sel.rangeCount == 1');
function visit637_122_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['122'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['120'][1].init(240, 4, '!sel');
function visit636_120_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['120'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['114'][1].init(76, 10, 'cache.type');
function visit635_114_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['114'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['90'][1].init(79, 64, 'cache.nativeSel || (cache.nativeSel = self.document.selection)');
function visit634_90_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['90'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['85'][1].init(99, 84, 'cache.nativeSel || (cache.nativeSel = Dom.getWindow(self.document).getSelection())');
function visit633_85_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['85'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['56'][2].init(103, 47, 'range.parentElement().ownerDocument != document');
function visit632_56_2(result) {
  _$jscoverage['/editor/selection.js'].branchData['56'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['56'][1].init(80, 70, 'range.parentElement && range.parentElement().ownerDocument != document');
function visit631_56_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['56'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['55'][3].init(129, 39, 'range.item(0).ownerDocument != document');
function visit630_55_3(result) {
  _$jscoverage['/editor/selection.js'].branchData['55'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['55'][2].init(115, 53, 'range.item && range.item(0).ownerDocument != document');
function visit629_55_2(result) {
  _$jscoverage['/editor/selection.js'].branchData['55'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['55'][1].init(31, 153, '(range.item && range.item(0).ownerDocument != document) || (range.parentElement && range.parentElement().ownerDocument != document)');
function visit628_55_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['55'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['54'][1].init(81, 185, '!range || (range.item && range.item(0).ownerDocument != document) || (range.parentElement && range.parentElement().ownerDocument != document)');
function visit627_54_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['54'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['51'][1].init(285, 6, 'OLD_IE');
function visit626_51_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['51'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['33'][1].init(261, 14, 'UA.ieMode < 11');
function visit625_33_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['33'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].lineData[10]++;
KISSY.add(function(S, require) {
  _$jscoverage['/editor/selection.js'].functionData[0]++;
  _$jscoverage['/editor/selection.js'].lineData[11]++;
  var Node = require('node');
  _$jscoverage['/editor/selection.js'].lineData[12]++;
  var Walker = require('./walker');
  _$jscoverage['/editor/selection.js'].lineData[13]++;
  var KERange = require('./range');
  _$jscoverage['/editor/selection.js'].lineData[14]++;
  var Editor = require('./base');
  _$jscoverage['/editor/selection.js'].lineData[19]++;
  Editor.SelectionType = {
  SELECTION_NONE: 1, 
  SELECTION_TEXT: 2, 
  SELECTION_ELEMENT: 3};
  _$jscoverage['/editor/selection.js'].lineData[24]++;
  var TRUE = true, FALSE = false, NULL = null, UA = S.UA, Dom = S.DOM, KES = Editor.SelectionType, KER = Editor.RangeType, OLD_IE = visit625_33_1(UA.ieMode < 11);
  _$jscoverage['/editor/selection.js'].lineData[40]++;
  function KESelection(document) {
    _$jscoverage['/editor/selection.js'].functionData[1]++;
    _$jscoverage['/editor/selection.js'].lineData[41]++;
    var self = this;
    _$jscoverage['/editor/selection.js'].lineData[42]++;
    self.document = document;
    _$jscoverage['/editor/selection.js'].lineData[43]++;
    self._ = {
  cache: {}};
    _$jscoverage['/editor/selection.js'].lineData[51]++;
    if (visit626_51_1(OLD_IE)) {
      _$jscoverage['/editor/selection.js'].lineData[52]++;
      try {
        _$jscoverage['/editor/selection.js'].lineData[53]++;
        var range = self.getNative().createRange();
        _$jscoverage['/editor/selection.js'].lineData[54]++;
        if (visit627_54_1(!range || visit628_55_1((visit629_55_2(range.item && visit630_55_3(range.item(0).ownerDocument != document))) || (visit631_56_1(range.parentElement && visit632_56_2(range.parentElement().ownerDocument != document)))))) {
          _$jscoverage['/editor/selection.js'].lineData[57]++;
          self.isInvalid = TRUE;
        }
      }      catch (e) {
  _$jscoverage['/editor/selection.js'].lineData[63]++;
  self.isInvalid = TRUE;
}
    }
  }
  _$jscoverage['/editor/selection.js'].lineData[68]++;
  var styleObjectElements = {
  "img": 1, 
  "hr": 1, 
  "li": 1, 
  "table": 1, 
  "tr": 1, 
  "td": 1, 
  "th": 1, 
  "embed": 1, 
  "object": 1, 
  "ol": 1, 
  "ul": 1, 
  "a": 1, 
  "input": 1, 
  "form": 1, 
  "select": 1, 
  "textarea": 1, 
  "button": 1, 
  "fieldset": 1, 
  "thead": 1, 
  "tfoot": 1};
  _$jscoverage['/editor/selection.js'].lineData[73]++;
  S.augment(KESelection, {
  getNative: !OLD_IE ? function() {
  _$jscoverage['/editor/selection.js'].functionData[2]++;
  _$jscoverage['/editor/selection.js'].lineData[83]++;
  var self = this, cache = self._.cache;
  _$jscoverage['/editor/selection.js'].lineData[85]++;
  return visit633_85_1(cache.nativeSel || (cache.nativeSel = Dom.getWindow(self.document).getSelection()));
} : function() {
  _$jscoverage['/editor/selection.js'].functionData[3]++;
  _$jscoverage['/editor/selection.js'].lineData[89]++;
  var self = this, cache = self._.cache;
  _$jscoverage['/editor/selection.js'].lineData[90]++;
  return visit634_90_1(cache.nativeSel || (cache.nativeSel = self.document.selection));
}, 
  getType: !OLD_IE ? function() {
  _$jscoverage['/editor/selection.js'].functionData[4]++;
  _$jscoverage['/editor/selection.js'].lineData[113]++;
  var self = this, cache = self._.cache;
  _$jscoverage['/editor/selection.js'].lineData[114]++;
  if (visit635_114_1(cache.type)) {
    _$jscoverage['/editor/selection.js'].lineData[115]++;
    return cache.type;
  }
  _$jscoverage['/editor/selection.js'].lineData[117]++;
  var type = KES.SELECTION_TEXT, sel = self.getNative();
  _$jscoverage['/editor/selection.js'].lineData[120]++;
  if (visit636_120_1(!sel)) {
    _$jscoverage['/editor/selection.js'].lineData[121]++;
    type = KES.SELECTION_NONE;
  } else {
    _$jscoverage['/editor/selection.js'].lineData[122]++;
    if (visit637_122_1(sel.rangeCount == 1)) {
      _$jscoverage['/editor/selection.js'].lineData[126]++;
      var range = sel.getRangeAt(0), startContainer = range.startContainer;
      _$jscoverage['/editor/selection.js'].lineData[129]++;
      if (visit638_129_1(visit639_129_2(startContainer == range.endContainer) && visit640_130_1(visit641_130_2(startContainer.nodeType == Dom.NodeType.ELEMENT_NODE) && visit642_131_1(visit643_131_2(Number(range.endOffset - range.startOffset) == 1) && styleObjectElements[startContainer.childNodes[range.startOffset].nodeName.toLowerCase()])))) {
        _$jscoverage['/editor/selection.js'].lineData[133]++;
        type = KES.SELECTION_ELEMENT;
      }
    }
  }
  _$jscoverage['/editor/selection.js'].lineData[137]++;
  return (cache.type = type);
} : function() {
  _$jscoverage['/editor/selection.js'].functionData[5]++;
  _$jscoverage['/editor/selection.js'].lineData[140]++;
  var self = this, cache = self._.cache;
  _$jscoverage['/editor/selection.js'].lineData[141]++;
  if (visit644_141_1(cache.type)) {
    _$jscoverage['/editor/selection.js'].lineData[142]++;
    return cache.type;
  }
  _$jscoverage['/editor/selection.js'].lineData[144]++;
  var type = KES.SELECTION_NONE;
  _$jscoverage['/editor/selection.js'].lineData[146]++;
  try {
    _$jscoverage['/editor/selection.js'].lineData[147]++;
    var sel = self.getNative(), ieType = sel.type;
    _$jscoverage['/editor/selection.js'].lineData[150]++;
    if (visit645_150_1(ieType == 'Text')) {
      _$jscoverage['/editor/selection.js'].lineData[151]++;
      type = KES.SELECTION_TEXT;
    }
    _$jscoverage['/editor/selection.js'].lineData[153]++;
    if (visit646_153_1(ieType == 'Control')) {
      _$jscoverage['/editor/selection.js'].lineData[154]++;
      type = KES.SELECTION_ELEMENT;
    }
    _$jscoverage['/editor/selection.js'].lineData[161]++;
    if (visit647_161_1(sel.createRange().parentElement)) {
      _$jscoverage['/editor/selection.js'].lineData[162]++;
      type = KES.SELECTION_TEXT;
    }
  }  catch (e) {
}
  _$jscoverage['/editor/selection.js'].lineData[167]++;
  return (cache.type = type);
}, 
  getRanges: OLD_IE ? (function() {
  _$jscoverage['/editor/selection.js'].functionData[6]++;
  _$jscoverage['/editor/selection.js'].lineData[174]++;
  var getBoundaryInformation = function(range, start) {
  _$jscoverage['/editor/selection.js'].functionData[7]++;
  _$jscoverage['/editor/selection.js'].lineData[176]++;
  range = range.duplicate();
  _$jscoverage['/editor/selection.js'].lineData[177]++;
  range.collapse(start);
  _$jscoverage['/editor/selection.js'].lineData[180]++;
  var parent = range.parentElement(), siblings = parent.childNodes, testRange;
  _$jscoverage['/editor/selection.js'].lineData[183]++;
  for (var i = 0; visit648_183_1(i < siblings.length); i++) {
    _$jscoverage['/editor/selection.js'].lineData[184]++;
    var child = siblings[i];
    _$jscoverage['/editor/selection.js'].lineData[186]++;
    if (visit649_186_1(child.nodeType == Dom.NodeType.ELEMENT_NODE)) {
      _$jscoverage['/editor/selection.js'].lineData[187]++;
      testRange = range.duplicate();
      _$jscoverage['/editor/selection.js'].lineData[189]++;
      testRange.moveToElementText(child);
      _$jscoverage['/editor/selection.js'].lineData[191]++;
      var comparisonStart = testRange.compareEndPoints('StartToStart', range), comparisonEnd = testRange.compareEndPoints('EndToStart', range);
      _$jscoverage['/editor/selection.js'].lineData[194]++;
      testRange.collapse();
      _$jscoverage['/editor/selection.js'].lineData[196]++;
      if (visit650_196_1(comparisonStart > 0)) {
        _$jscoverage['/editor/selection.js'].lineData[197]++;
        break;
      } else {
        _$jscoverage['/editor/selection.js'].lineData[200]++;
        if (visit651_200_1(!comparisonStart || visit652_201_1(visit653_201_2(comparisonEnd == 1) && visit654_201_3(comparisonStart == -1)))) {
          _$jscoverage['/editor/selection.js'].lineData[202]++;
          return {
  container: parent, 
  offset: i};
        } else {
          _$jscoverage['/editor/selection.js'].lineData[203]++;
          if (visit655_203_1(!comparisonEnd)) {
            _$jscoverage['/editor/selection.js'].lineData[204]++;
            return {
  container: parent, 
  offset: i + 1};
          }
        }
      }
      _$jscoverage['/editor/selection.js'].lineData[206]++;
      testRange = NULL;
    }
  }
  _$jscoverage['/editor/selection.js'].lineData[210]++;
  if (visit656_210_1(!testRange)) {
    _$jscoverage['/editor/selection.js'].lineData[211]++;
    testRange = range.duplicate();
    _$jscoverage['/editor/selection.js'].lineData[212]++;
    testRange.moveToElementText(parent);
    _$jscoverage['/editor/selection.js'].lineData[213]++;
    testRange.collapse(FALSE);
  }
  _$jscoverage['/editor/selection.js'].lineData[216]++;
  testRange.setEndPoint('StartToStart', range);
  _$jscoverage['/editor/selection.js'].lineData[220]++;
  var distance = String(testRange.text).replace(/\r\n|\r/g, '\n').length;
  _$jscoverage['/editor/selection.js'].lineData[223]++;
  try {
    _$jscoverage['/editor/selection.js'].lineData[224]++;
    while (visit657_224_1(distance > 0)) {
      _$jscoverage['/editor/selection.js'].lineData[228]++;
      distance -= siblings[--i].nodeValue.length;
    }
  }  catch (e) {
  _$jscoverage['/editor/selection.js'].lineData[232]++;
  distance = 0;
}
  _$jscoverage['/editor/selection.js'].lineData[236]++;
  if (visit658_236_1(distance === 0)) {
    _$jscoverage['/editor/selection.js'].lineData[237]++;
    return {
  container: parent, 
  offset: i};
  } else {
    _$jscoverage['/editor/selection.js'].lineData[243]++;
    return {
  container: siblings[i], 
  offset: -distance};
  }
};
  _$jscoverage['/editor/selection.js'].lineData[250]++;
  return function(force) {
  _$jscoverage['/editor/selection.js'].functionData[8]++;
  _$jscoverage['/editor/selection.js'].lineData[251]++;
  var self = this, cache = self._.cache;
  _$jscoverage['/editor/selection.js'].lineData[252]++;
  if (visit659_252_1(cache.ranges && !force)) {
    _$jscoverage['/editor/selection.js'].lineData[253]++;
    return cache.ranges;
  }
  _$jscoverage['/editor/selection.js'].lineData[259]++;
  var sel = self.getNative(), nativeRange = visit660_260_1(sel && sel.createRange()), type = self.getType(), range;
  _$jscoverage['/editor/selection.js'].lineData[264]++;
  if (visit661_264_1(!sel)) {
    _$jscoverage['/editor/selection.js'].lineData[265]++;
    return [];
  }
  _$jscoverage['/editor/selection.js'].lineData[267]++;
  if (visit662_267_1(type == KES.SELECTION_TEXT)) {
    _$jscoverage['/editor/selection.js'].lineData[268]++;
    range = new KERange(self.document);
    _$jscoverage['/editor/selection.js'].lineData[269]++;
    var boundaryInfo = getBoundaryInformation(nativeRange, TRUE);
    _$jscoverage['/editor/selection.js'].lineData[270]++;
    range.setStart(new Node(boundaryInfo.container), boundaryInfo.offset);
    _$jscoverage['/editor/selection.js'].lineData[271]++;
    boundaryInfo = getBoundaryInformation(nativeRange);
    _$jscoverage['/editor/selection.js'].lineData[272]++;
    range.setEnd(new Node(boundaryInfo.container), boundaryInfo.offset);
    _$jscoverage['/editor/selection.js'].lineData[273]++;
    return (cache.ranges = [range]);
  } else {
    _$jscoverage['/editor/selection.js'].lineData[274]++;
    if (visit663_274_1(type == KES.SELECTION_ELEMENT)) {
      _$jscoverage['/editor/selection.js'].lineData[275]++;
      var retval = cache.ranges = [];
      _$jscoverage['/editor/selection.js'].lineData[277]++;
      for (var i = 0; visit664_277_1(i < nativeRange.length); i++) {
        _$jscoverage['/editor/selection.js'].lineData[278]++;
        var element = nativeRange.item(i), parentElement = element.parentNode, j = 0;
        _$jscoverage['/editor/selection.js'].lineData[282]++;
        range = new KERange(self.document);
        _$jscoverage['/editor/selection.js'].lineData[284]++;
        for (; visit665_284_1(visit666_284_2(j < parentElement.childNodes.length) && visit667_284_3(parentElement.childNodes[j] != element)); j++) {
        }
        _$jscoverage['/editor/selection.js'].lineData[287]++;
        range.setStart(new Node(parentElement), j);
        _$jscoverage['/editor/selection.js'].lineData[288]++;
        range.setEnd(new Node(parentElement), j + 1);
        _$jscoverage['/editor/selection.js'].lineData[289]++;
        retval.push(range);
      }
      _$jscoverage['/editor/selection.js'].lineData[292]++;
      return retval;
    }
  }
  _$jscoverage['/editor/selection.js'].lineData[295]++;
  return (cache.ranges = []);
};
})() : function(force) {
  _$jscoverage['/editor/selection.js'].functionData[9]++;
  _$jscoverage['/editor/selection.js'].lineData[300]++;
  var self = this, cache = self._.cache;
  _$jscoverage['/editor/selection.js'].lineData[301]++;
  if (visit668_301_1(cache.ranges && !force)) {
    _$jscoverage['/editor/selection.js'].lineData[302]++;
    return cache.ranges;
  }
  _$jscoverage['/editor/selection.js'].lineData[308]++;
  var ranges = [], sel = self.getNative();
  _$jscoverage['/editor/selection.js'].lineData[310]++;
  if (visit669_310_1(!sel)) {
    _$jscoverage['/editor/selection.js'].lineData[311]++;
    return [];
  }
  _$jscoverage['/editor/selection.js'].lineData[313]++;
  for (var i = 0; visit670_313_1(i < sel.rangeCount); i++) {
    _$jscoverage['/editor/selection.js'].lineData[314]++;
    var nativeRange = sel.getRangeAt(i), range = new KERange(self.document);
    _$jscoverage['/editor/selection.js'].lineData[316]++;
    range.setStart(new Node(nativeRange.startContainer), nativeRange.startOffset);
    _$jscoverage['/editor/selection.js'].lineData[317]++;
    range.setEnd(new Node(nativeRange.endContainer), nativeRange.endOffset);
    _$jscoverage['/editor/selection.js'].lineData[318]++;
    ranges.push(range);
  }
  _$jscoverage['/editor/selection.js'].lineData[321]++;
  return (cache.ranges = ranges);
}, 
  getStartElement: function() {
  _$jscoverage['/editor/selection.js'].functionData[10]++;
  _$jscoverage['/editor/selection.js'].lineData[334]++;
  var self = this, cache = self._.cache;
  _$jscoverage['/editor/selection.js'].lineData[335]++;
  if (visit671_335_1(cache.startElement !== undefined)) {
    _$jscoverage['/editor/selection.js'].lineData[336]++;
    return cache.startElement;
  }
  _$jscoverage['/editor/selection.js'].lineData[338]++;
  var node, sel = self.getNative();
  _$jscoverage['/editor/selection.js'].lineData[341]++;
  switch (self.getType()) {
    case KES.SELECTION_ELEMENT:
      _$jscoverage['/editor/selection.js'].lineData[343]++;
      return this.getSelectedElement();
    case KES.SELECTION_TEXT:
      _$jscoverage['/editor/selection.js'].lineData[347]++;
      var range = self.getRanges()[0];
      _$jscoverage['/editor/selection.js'].lineData[349]++;
      if (visit672_349_1(range)) {
        _$jscoverage['/editor/selection.js'].lineData[350]++;
        if (visit673_350_1(!range.collapsed)) {
          _$jscoverage['/editor/selection.js'].lineData[351]++;
          range.optimize();
          _$jscoverage['/editor/selection.js'].lineData[356]++;
          while (TRUE) {
            _$jscoverage['/editor/selection.js'].lineData[357]++;
            var startContainer = range.startContainer, startOffset = range.startOffset;
            _$jscoverage['/editor/selection.js'].lineData[360]++;
            if (visit674_360_1(visit675_360_2(startOffset == (visit676_360_3(startContainer[0].nodeType === Dom.NodeType.ELEMENT_NODE) ? startContainer[0].childNodes.length : startContainer[0].nodeValue.length)) && !startContainer._4e_isBlockBoundary())) {
              _$jscoverage['/editor/selection.js'].lineData[363]++;
              range.setStartAfter(startContainer);
            } else {
              _$jscoverage['/editor/selection.js'].lineData[365]++;
              break;
            }
          }
          _$jscoverage['/editor/selection.js'].lineData[369]++;
          node = range.startContainer;
          _$jscoverage['/editor/selection.js'].lineData[371]++;
          if (visit677_371_1(node[0].nodeType != Dom.NodeType.ELEMENT_NODE)) {
            _$jscoverage['/editor/selection.js'].lineData[372]++;
            return node.parent();
          }
          _$jscoverage['/editor/selection.js'].lineData[375]++;
          node = new Node(node[0].childNodes[range.startOffset]);
          _$jscoverage['/editor/selection.js'].lineData[377]++;
          if (visit678_377_1(!node[0] || visit679_377_2(node[0].nodeType != Dom.NodeType.ELEMENT_NODE))) {
            _$jscoverage['/editor/selection.js'].lineData[378]++;
            return range.startContainer;
          }
          _$jscoverage['/editor/selection.js'].lineData[381]++;
          var child = node[0].firstChild;
          _$jscoverage['/editor/selection.js'].lineData[382]++;
          while (visit680_382_1(child && visit681_382_2(child.nodeType == Dom.NodeType.ELEMENT_NODE))) {
            _$jscoverage['/editor/selection.js'].lineData[383]++;
            node = new Node(child);
            _$jscoverage['/editor/selection.js'].lineData[384]++;
            child = child.firstChild;
          }
          _$jscoverage['/editor/selection.js'].lineData[386]++;
          return node;
        }
      }
      _$jscoverage['/editor/selection.js'].lineData[390]++;
      if (visit682_390_1(OLD_IE)) {
        _$jscoverage['/editor/selection.js'].lineData[391]++;
        range = sel.createRange();
        _$jscoverage['/editor/selection.js'].lineData[392]++;
        range.collapse(TRUE);
        _$jscoverage['/editor/selection.js'].lineData[393]++;
        node = new Node(range.parentElement());
      } else {
        _$jscoverage['/editor/selection.js'].lineData[396]++;
        node = sel.anchorNode;
        _$jscoverage['/editor/selection.js'].lineData[397]++;
        if (visit683_397_1(node && visit684_397_2(node.nodeType != Dom.NodeType.ELEMENT_NODE))) {
          _$jscoverage['/editor/selection.js'].lineData[398]++;
          node = node.parentNode;
        }
        _$jscoverage['/editor/selection.js'].lineData[400]++;
        if (visit685_400_1(node)) {
          _$jscoverage['/editor/selection.js'].lineData[401]++;
          node = new Node(node);
        }
      }
  }
  _$jscoverage['/editor/selection.js'].lineData[406]++;
  return cache.startElement = node;
}, 
  getSelectedElement: function() {
  _$jscoverage['/editor/selection.js'].functionData[11]++;
  _$jscoverage['/editor/selection.js'].lineData[420]++;
  var self = this, node, cache = self._.cache;
  _$jscoverage['/editor/selection.js'].lineData[424]++;
  if (visit686_424_1(cache.selectedElement !== undefined)) {
    _$jscoverage['/editor/selection.js'].lineData[425]++;
    return cache.selectedElement;
  }
  _$jscoverage['/editor/selection.js'].lineData[429]++;
  if (visit687_429_1(OLD_IE)) {
    _$jscoverage['/editor/selection.js'].lineData[430]++;
    var range = self.getNative().createRange();
    _$jscoverage['/editor/selection.js'].lineData[431]++;
    node = visit688_431_1(range.item && range.item(0));
  }
  _$jscoverage['/editor/selection.js'].lineData[437]++;
  if (visit689_437_1(!node)) {
    _$jscoverage['/editor/selection.js'].lineData[438]++;
    node = (function() {
  _$jscoverage['/editor/selection.js'].functionData[12]++;
  _$jscoverage['/editor/selection.js'].lineData[439]++;
  var range = self.getRanges()[0], enclosed, selected;
  _$jscoverage['/editor/selection.js'].lineData[447]++;
  for (var i = 2; visit690_448_1(i && !(visit691_448_2((enclosed = range.getEnclosedNode()) && visit692_449_1((visit693_449_2(enclosed[0].nodeType == Dom.NodeType.ELEMENT_NODE)) && visit694_451_1(styleObjectElements[enclosed.nodeName()] && (selected = enclosed)))))); i--) {
    _$jscoverage['/editor/selection.js'].lineData[459]++;
    range.shrink(KER.SHRINK_ELEMENT);
  }
  _$jscoverage['/editor/selection.js'].lineData[462]++;
  return selected;
})();
  } else {
    _$jscoverage['/editor/selection.js'].lineData[465]++;
    node = new Node(node);
  }
  _$jscoverage['/editor/selection.js'].lineData[468]++;
  return cache.selectedElement = node;
}, 
  reset: function() {
  _$jscoverage['/editor/selection.js'].functionData[13]++;
  _$jscoverage['/editor/selection.js'].lineData[473]++;
  this._.cache = {};
}, 
  selectElement: function(element) {
  _$jscoverage['/editor/selection.js'].functionData[14]++;
  _$jscoverage['/editor/selection.js'].lineData[477]++;
  var range, self = this, doc = self.document;
  _$jscoverage['/editor/selection.js'].lineData[480]++;
  if (visit695_480_1(OLD_IE)) {
    _$jscoverage['/editor/selection.js'].lineData[484]++;
    try {
      _$jscoverage['/editor/selection.js'].lineData[486]++;
      range = doc.body['createControlRange']();
      _$jscoverage['/editor/selection.js'].lineData[487]++;
      range['addElement'](element[0]);
      _$jscoverage['/editor/selection.js'].lineData[488]++;
      range.select();
    }    catch (e) {
  _$jscoverage['/editor/selection.js'].lineData[491]++;
  range = doc.body.createTextRange();
  _$jscoverage['/editor/selection.js'].lineData[492]++;
  range.moveToElementText(element[0]);
  _$jscoverage['/editor/selection.js'].lineData[493]++;
  range.select();
}
 finally     {
    }
    _$jscoverage['/editor/selection.js'].lineData[497]++;
    self.reset();
  } else {
    _$jscoverage['/editor/selection.js'].lineData[500]++;
    range = doc.createRange();
    _$jscoverage['/editor/selection.js'].lineData[501]++;
    range.selectNode(element[0]);
    _$jscoverage['/editor/selection.js'].lineData[503]++;
    var sel = self.getNative();
    _$jscoverage['/editor/selection.js'].lineData[504]++;
    sel.removeAllRanges();
    _$jscoverage['/editor/selection.js'].lineData[505]++;
    sel.addRange(range);
    _$jscoverage['/editor/selection.js'].lineData[506]++;
    self.reset();
  }
}, 
  selectRanges: function(ranges) {
  _$jscoverage['/editor/selection.js'].functionData[15]++;
  _$jscoverage['/editor/selection.js'].lineData[511]++;
  var self = this;
  _$jscoverage['/editor/selection.js'].lineData[512]++;
  if (visit696_512_1(OLD_IE)) {
    _$jscoverage['/editor/selection.js'].lineData[513]++;
    if (visit697_513_1(ranges.length > 1)) {
      _$jscoverage['/editor/selection.js'].lineData[515]++;
      var last = ranges[ranges.length - 1];
      _$jscoverage['/editor/selection.js'].lineData[516]++;
      ranges[0].setEnd(last.endContainer, last.endOffset);
      _$jscoverage['/editor/selection.js'].lineData[517]++;
      ranges.length = 1;
    }
    _$jscoverage['/editor/selection.js'].lineData[522]++;
    if (visit698_522_1(ranges[0])) {
      _$jscoverage['/editor/selection.js'].lineData[523]++;
      ranges[0].select();
    }
    _$jscoverage['/editor/selection.js'].lineData[525]++;
    self.reset();
  } else {
    _$jscoverage['/editor/selection.js'].lineData[528]++;
    var sel = self.getNative();
    _$jscoverage['/editor/selection.js'].lineData[529]++;
    if (visit699_529_1(!sel)) {
      _$jscoverage['/editor/selection.js'].lineData[530]++;
      return;
    }
    _$jscoverage['/editor/selection.js'].lineData[532]++;
    sel.removeAllRanges();
    _$jscoverage['/editor/selection.js'].lineData[533]++;
    for (var i = 0; visit700_533_1(i < ranges.length); i++) {
      _$jscoverage['/editor/selection.js'].lineData[534]++;
      var range = ranges[i], nativeRange = self.document.createRange(), startContainer = range.startContainer;
      _$jscoverage['/editor/selection.js'].lineData[542]++;
      if (visit701_542_1(range.collapsed && visit702_543_1((visit703_543_2((visit704_543_3(UA.gecko && visit705_543_4(UA.gecko < 1.0900))) || visit706_543_5(UA.opera || UA['webkit']))) && visit707_544_1(visit708_544_2(startContainer[0].nodeType == Dom.NodeType.ELEMENT_NODE) && !startContainer[0].childNodes.length)))) {
        _$jscoverage['/editor/selection.js'].lineData[546]++;
        startContainer[0].appendChild(self.document.createTextNode(UA['webkit'] ? "\u200b" : ""));
        _$jscoverage['/editor/selection.js'].lineData[549]++;
        range.startOffset++;
        _$jscoverage['/editor/selection.js'].lineData[550]++;
        range.endOffset++;
      }
      _$jscoverage['/editor/selection.js'].lineData[553]++;
      nativeRange.setStart(startContainer[0], range.startOffset);
      _$jscoverage['/editor/selection.js'].lineData[554]++;
      nativeRange.setEnd(range.endContainer[0], range.endOffset);
      _$jscoverage['/editor/selection.js'].lineData[556]++;
      sel.addRange(nativeRange);
    }
    _$jscoverage['/editor/selection.js'].lineData[558]++;
    self.reset();
  }
}, 
  createBookmarks2: function(normalized) {
  _$jscoverage['/editor/selection.js'].functionData[16]++;
  _$jscoverage['/editor/selection.js'].lineData[562]++;
  var bookmarks = [], ranges = this.getRanges();
  _$jscoverage['/editor/selection.js'].lineData[565]++;
  for (var i = 0; visit709_565_1(i < ranges.length); i++) {
    _$jscoverage['/editor/selection.js'].lineData[566]++;
    bookmarks.push(ranges[i].createBookmark2(normalized));
  }
  _$jscoverage['/editor/selection.js'].lineData[568]++;
  return bookmarks;
}, 
  createBookmarks: function(serializable, ranges) {
  _$jscoverage['/editor/selection.js'].functionData[17]++;
  _$jscoverage['/editor/selection.js'].lineData[571]++;
  var self = this, retval = [], doc = self.document, bookmark;
  _$jscoverage['/editor/selection.js'].lineData[575]++;
  ranges = visit710_575_1(ranges || self.getRanges());
  _$jscoverage['/editor/selection.js'].lineData[576]++;
  var length = ranges.length;
  _$jscoverage['/editor/selection.js'].lineData[577]++;
  for (var i = 0; visit711_577_1(i < length); i++) {
    _$jscoverage['/editor/selection.js'].lineData[578]++;
    retval.push(bookmark = ranges[i].createBookmark(serializable, TRUE));
    _$jscoverage['/editor/selection.js'].lineData[579]++;
    serializable = bookmark.serializable;
    _$jscoverage['/editor/selection.js'].lineData[581]++;
    var bookmarkStart = serializable ? S.one("#" + bookmark.startNode, doc) : bookmark.startNode, bookmarkEnd = serializable ? S.one("#" + bookmark.endNode, doc) : bookmark.endNode;
    _$jscoverage['/editor/selection.js'].lineData[585]++;
    for (var j = i + 1; visit712_585_1(j < length); j++) {
      _$jscoverage['/editor/selection.js'].lineData[586]++;
      var dirtyRange = ranges[j], rangeStart = dirtyRange.startContainer, rangeEnd = dirtyRange.endContainer;
      _$jscoverage['/editor/selection.js'].lineData[590]++;
      visit713_590_1(Dom.equals(rangeStart, bookmarkStart.parent()) && dirtyRange.startOffset++);
      _$jscoverage['/editor/selection.js'].lineData[591]++;
      visit714_591_1(Dom.equals(rangeStart, bookmarkEnd.parent()) && dirtyRange.startOffset++);
      _$jscoverage['/editor/selection.js'].lineData[592]++;
      visit715_592_1(Dom.equals(rangeEnd, bookmarkStart.parent()) && dirtyRange.endOffset++);
      _$jscoverage['/editor/selection.js'].lineData[593]++;
      visit716_593_1(Dom.equals(rangeEnd, bookmarkEnd.parent()) && dirtyRange.endOffset++);
    }
  }
  _$jscoverage['/editor/selection.js'].lineData[597]++;
  return retval;
}, 
  selectBookmarks: function(bookmarks) {
  _$jscoverage['/editor/selection.js'].functionData[18]++;
  _$jscoverage['/editor/selection.js'].lineData[601]++;
  var self = this, ranges = [];
  _$jscoverage['/editor/selection.js'].lineData[602]++;
  for (var i = 0; visit717_602_1(i < bookmarks.length); i++) {
    _$jscoverage['/editor/selection.js'].lineData[603]++;
    var range = new KERange(self.document);
    _$jscoverage['/editor/selection.js'].lineData[604]++;
    range.moveToBookmark(bookmarks[i]);
    _$jscoverage['/editor/selection.js'].lineData[605]++;
    ranges.push(range);
  }
  _$jscoverage['/editor/selection.js'].lineData[607]++;
  self.selectRanges(ranges);
  _$jscoverage['/editor/selection.js'].lineData[608]++;
  return self;
}, 
  getCommonAncestor: function() {
  _$jscoverage['/editor/selection.js'].functionData[19]++;
  _$jscoverage['/editor/selection.js'].lineData[612]++;
  var ranges = this.getRanges(), startNode = ranges[0].startContainer, endNode = ranges[ranges.length - 1].endContainer;
  _$jscoverage['/editor/selection.js'].lineData[615]++;
  return startNode._4e_commonAncestor(endNode);
}, 
  scrollIntoView: function() {
  _$jscoverage['/editor/selection.js'].functionData[20]++;
  _$jscoverage['/editor/selection.js'].lineData[622]++;
  var start = this.getStartElement();
  _$jscoverage['/editor/selection.js'].lineData[623]++;
  visit718_623_1(start && start.scrollIntoView(undefined, {
  alignWithTop: false, 
  allowHorizontalScroll: true, 
  onlyScrollIfNeeded: true}));
}, 
  removeAllRanges: function() {
  _$jscoverage['/editor/selection.js'].functionData[21]++;
  _$jscoverage['/editor/selection.js'].lineData[630]++;
  var sel = this.getNative();
  _$jscoverage['/editor/selection.js'].lineData[631]++;
  if (visit719_631_1(!OLD_IE)) {
    _$jscoverage['/editor/selection.js'].lineData[632]++;
    visit720_632_1(sel && sel.removeAllRanges());
  } else {
    _$jscoverage['/editor/selection.js'].lineData[634]++;
    visit721_634_1(sel && sel.clear());
  }
}});
  _$jscoverage['/editor/selection.js'].lineData[640]++;
  var nonCells = {
  "table": 1, 
  "tbody": 1, 
  "tr": 1}, notWhitespaces = Walker.whitespaces(TRUE), fillerTextRegex = /\ufeff|\u00a0/;
  _$jscoverage['/editor/selection.js'].lineData[642]++;
  KERange.prototype["select"] = KERange.prototype.select = !OLD_IE ? function() {
  _$jscoverage['/editor/selection.js'].functionData[22]++;
  _$jscoverage['/editor/selection.js'].lineData[645]++;
  var self = this, startContainer = self.startContainer;
  _$jscoverage['/editor/selection.js'].lineData[649]++;
  if (visit722_649_1(self.collapsed && visit723_650_1(visit724_650_2(startContainer[0].nodeType == Dom.NodeType.ELEMENT_NODE) && !startContainer[0].childNodes.length))) {
    _$jscoverage['/editor/selection.js'].lineData[651]++;
    startContainer[0].appendChild(self.document.createTextNode(UA.webkit ? '\u200b' : ''));
    _$jscoverage['/editor/selection.js'].lineData[655]++;
    self.startOffset++;
    _$jscoverage['/editor/selection.js'].lineData[656]++;
    self.endOffset++;
  }
  _$jscoverage['/editor/selection.js'].lineData[660]++;
  var nativeRange = self.document.createRange();
  _$jscoverage['/editor/selection.js'].lineData[661]++;
  nativeRange.setStart(startContainer[0], self.startOffset);
  _$jscoverage['/editor/selection.js'].lineData[663]++;
  try {
    _$jscoverage['/editor/selection.js'].lineData[664]++;
    nativeRange.setEnd(self.endContainer[0], self.endOffset);
  }  catch (e) {
  _$jscoverage['/editor/selection.js'].lineData[669]++;
  if (visit725_669_1(e.toString().indexOf('NS_ERROR_ILLEGAL_VALUE') >= 0)) {
    _$jscoverage['/editor/selection.js'].lineData[670]++;
    self.collapse(TRUE);
    _$jscoverage['/editor/selection.js'].lineData[671]++;
    nativeRange.setEnd(self.endContainer[0], self.endOffset);
  } else {
    _$jscoverage['/editor/selection.js'].lineData[674]++;
    throw (e);
  }
}
  _$jscoverage['/editor/selection.js'].lineData[677]++;
  var selection = getSelection(self.document).getNative();
  _$jscoverage['/editor/selection.js'].lineData[678]++;
  selection.removeAllRanges();
  _$jscoverage['/editor/selection.js'].lineData[679]++;
  selection.addRange(nativeRange);
} : function(forceExpand) {
  _$jscoverage['/editor/selection.js'].functionData[23]++;
  _$jscoverage['/editor/selection.js'].lineData[683]++;
  var self = this, collapsed = self.collapsed, isStartMarkerAlone, dummySpan;
  _$jscoverage['/editor/selection.js'].lineData[689]++;
  if (visit726_692_1(visit727_692_2(self.startContainer[0] === self.endContainer[0]) && visit728_693_1(self.endOffset - self.startOffset == 1))) {
    _$jscoverage['/editor/selection.js'].lineData[694]++;
    var selEl = self.startContainer[0].childNodes[self.startOffset];
    _$jscoverage['/editor/selection.js'].lineData[695]++;
    if (visit729_695_1(selEl.nodeType == Dom.NodeType.ELEMENT_NODE)) {
      _$jscoverage['/editor/selection.js'].lineData[696]++;
      new KESelection(self.document).selectElement(new Node(selEl));
      _$jscoverage['/editor/selection.js'].lineData[697]++;
      return;
    }
  }
  _$jscoverage['/editor/selection.js'].lineData[702]++;
  if (visit730_702_1(visit731_702_2(visit732_702_3(self.startContainer[0].nodeType == Dom.NodeType.ELEMENT_NODE) && self.startContainer.nodeName() in nonCells) || visit733_704_1(visit734_704_2(self.endContainer[0].nodeType == Dom.NodeType.ELEMENT_NODE) && self.endContainer.nodeName() in nonCells))) {
    _$jscoverage['/editor/selection.js'].lineData[706]++;
    self.shrink(KER.SHRINK_ELEMENT, TRUE);
  }
  _$jscoverage['/editor/selection.js'].lineData[709]++;
  var bookmark = self.createBookmark(), startNode = bookmark.startNode, endNode;
  _$jscoverage['/editor/selection.js'].lineData[713]++;
  if (visit735_713_1(!collapsed)) {
    _$jscoverage['/editor/selection.js'].lineData[714]++;
    endNode = bookmark.endNode;
  }
  _$jscoverage['/editor/selection.js'].lineData[717]++;
  var ieRange = self.document.body.createTextRange();
  _$jscoverage['/editor/selection.js'].lineData[720]++;
  ieRange.moveToElementText(startNode[0]);
  _$jscoverage['/editor/selection.js'].lineData[722]++;
  ieRange.moveStart('character', 1);
  _$jscoverage['/editor/selection.js'].lineData[724]++;
  if (visit736_724_1(endNode)) {
    _$jscoverage['/editor/selection.js'].lineData[726]++;
    var ieRangeEnd = self.document.body.createTextRange();
    _$jscoverage['/editor/selection.js'].lineData[728]++;
    ieRangeEnd.moveToElementText(endNode[0]);
    _$jscoverage['/editor/selection.js'].lineData[730]++;
    ieRange.setEndPoint('EndToEnd', ieRangeEnd);
    _$jscoverage['/editor/selection.js'].lineData[731]++;
    ieRange.moveEnd('character', -1);
  } else {
    _$jscoverage['/editor/selection.js'].lineData[738]++;
    var next = startNode[0].nextSibling;
    _$jscoverage['/editor/selection.js'].lineData[739]++;
    while (visit737_739_1(next && !notWhitespaces(next))) {
      _$jscoverage['/editor/selection.js'].lineData[740]++;
      next = next.nextSibling;
    }
    _$jscoverage['/editor/selection.js'].lineData[742]++;
    isStartMarkerAlone = (visit738_743_1(!(visit739_743_2(next && visit740_743_3(next.nodeValue && next.nodeValue.match(fillerTextRegex)))) && (visit741_746_1(forceExpand || visit742_746_2(!startNode[0].previousSibling || (visit743_748_1(startNode[0].previousSibling && visit744_749_1(Dom.nodeName(startNode[0].previousSibling) == 'br'))))))));
    _$jscoverage['/editor/selection.js'].lineData[759]++;
    dummySpan = new Node(self.document.createElement('span'));
    _$jscoverage['/editor/selection.js'].lineData[760]++;
    dummySpan.html('&#65279;');
    _$jscoverage['/editor/selection.js'].lineData[761]++;
    dummySpan.insertBefore(startNode);
    _$jscoverage['/editor/selection.js'].lineData[762]++;
    if (visit745_762_1(isStartMarkerAlone)) {
      _$jscoverage['/editor/selection.js'].lineData[767]++;
      Dom.insertBefore(self.document.createTextNode('\ufeff'), visit746_767_1(startNode[0] || startNode));
    }
  }
  _$jscoverage['/editor/selection.js'].lineData[772]++;
  self.setStartBefore(startNode);
  _$jscoverage['/editor/selection.js'].lineData[773]++;
  startNode._4e_remove();
  _$jscoverage['/editor/selection.js'].lineData[775]++;
  if (visit747_775_1(collapsed)) {
    _$jscoverage['/editor/selection.js'].lineData[776]++;
    if (visit748_776_1(isStartMarkerAlone)) {
      _$jscoverage['/editor/selection.js'].lineData[778]++;
      ieRange.moveStart('character', -1);
      _$jscoverage['/editor/selection.js'].lineData[779]++;
      ieRange.select();
      _$jscoverage['/editor/selection.js'].lineData[781]++;
      self.document.selection.clear();
    } else {
      _$jscoverage['/editor/selection.js'].lineData[783]++;
      ieRange.select();
    }
    _$jscoverage['/editor/selection.js'].lineData[784]++;
    if (visit749_784_1(dummySpan)) {
      _$jscoverage['/editor/selection.js'].lineData[785]++;
      self.moveToPosition(dummySpan, KER.POSITION_BEFORE_START);
      _$jscoverage['/editor/selection.js'].lineData[786]++;
      dummySpan._4e_remove();
    }
  } else {
    _$jscoverage['/editor/selection.js'].lineData[789]++;
    self.setEndBefore(endNode);
    _$jscoverage['/editor/selection.js'].lineData[790]++;
    endNode._4e_remove();
    _$jscoverage['/editor/selection.js'].lineData[791]++;
    ieRange.select();
  }
};
  _$jscoverage['/editor/selection.js'].lineData[796]++;
  function getSelection(doc) {
    _$jscoverage['/editor/selection.js'].functionData[24]++;
    _$jscoverage['/editor/selection.js'].lineData[797]++;
    var sel = new KESelection(doc);
    _$jscoverage['/editor/selection.js'].lineData[798]++;
    return (visit750_798_1(!sel || sel.isInvalid)) ? NULL : sel;
  }
  _$jscoverage['/editor/selection.js'].lineData[801]++;
  KESelection.getSelection = getSelection;
  _$jscoverage['/editor/selection.js'].lineData[803]++;
  Editor.Selection = KESelection;
  _$jscoverage['/editor/selection.js'].lineData[805]++;
  return KESelection;
});
