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
  _$jscoverage['/dialog.js'].lineData[7] = 0;
  _$jscoverage['/dialog.js'].lineData[8] = 0;
  _$jscoverage['/dialog.js'].lineData[9] = 0;
  _$jscoverage['/dialog.js'].lineData[10] = 0;
  _$jscoverage['/dialog.js'].lineData[11] = 0;
  _$jscoverage['/dialog.js'].lineData[157] = 0;
  _$jscoverage['/dialog.js'].lineData[158] = 0;
  _$jscoverage['/dialog.js'].lineData[163] = 0;
  _$jscoverage['/dialog.js'].lineData[164] = 0;
  _$jscoverage['/dialog.js'].lineData[167] = 0;
  _$jscoverage['/dialog.js'].lineData[168] = 0;
  _$jscoverage['/dialog.js'].lineData[169] = 0;
  _$jscoverage['/dialog.js'].lineData[170] = 0;
  _$jscoverage['/dialog.js'].lineData[173] = 0;
  _$jscoverage['/dialog.js'].lineData[175] = 0;
  _$jscoverage['/dialog.js'].lineData[186] = 0;
  _$jscoverage['/dialog.js'].lineData[187] = 0;
  _$jscoverage['/dialog.js'].lineData[188] = 0;
  _$jscoverage['/dialog.js'].lineData[189] = 0;
  _$jscoverage['/dialog.js'].lineData[190] = 0;
  _$jscoverage['/dialog.js'].lineData[198] = 0;
  _$jscoverage['/dialog.js'].lineData[199] = 0;
  _$jscoverage['/dialog.js'].lineData[200] = 0;
  _$jscoverage['/dialog.js'].lineData[208] = 0;
  _$jscoverage['/dialog.js'].lineData[209] = 0;
  _$jscoverage['/dialog.js'].lineData[210] = 0;
  _$jscoverage['/dialog.js'].lineData[211] = 0;
  _$jscoverage['/dialog.js'].lineData[213] = 0;
  _$jscoverage['/dialog.js'].lineData[221] = 0;
  _$jscoverage['/dialog.js'].lineData[222] = 0;
  _$jscoverage['/dialog.js'].lineData[224] = 0;
  _$jscoverage['/dialog.js'].lineData[225] = 0;
  _$jscoverage['/dialog.js'].lineData[226] = 0;
  _$jscoverage['/dialog.js'].lineData[228] = 0;
  _$jscoverage['/dialog.js'].lineData[231] = 0;
  _$jscoverage['/dialog.js'].lineData[232] = 0;
  _$jscoverage['/dialog.js'].lineData[236] = 0;
  _$jscoverage['/dialog.js'].lineData[237] = 0;
  _$jscoverage['/dialog.js'].lineData[238] = 0;
  _$jscoverage['/dialog.js'].lineData[244] = 0;
  _$jscoverage['/dialog.js'].lineData[245] = 0;
  _$jscoverage['/dialog.js'].lineData[248] = 0;
  _$jscoverage['/dialog.js'].lineData[249] = 0;
  _$jscoverage['/dialog.js'].lineData[250] = 0;
  _$jscoverage['/dialog.js'].lineData[251] = 0;
  _$jscoverage['/dialog.js'].lineData[252] = 0;
  _$jscoverage['/dialog.js'].lineData[253] = 0;
  _$jscoverage['/dialog.js'].lineData[255] = 0;
  _$jscoverage['/dialog.js'].lineData[260] = 0;
  _$jscoverage['/dialog.js'].lineData[267] = 0;
  _$jscoverage['/dialog.js'].lineData[268] = 0;
  _$jscoverage['/dialog.js'].lineData[270] = 0;
  _$jscoverage['/dialog.js'].lineData[272] = 0;
  _$jscoverage['/dialog.js'].lineData[273] = 0;
  _$jscoverage['/dialog.js'].lineData[275] = 0;
  _$jscoverage['/dialog.js'].lineData[277] = 0;
  _$jscoverage['/dialog.js'].lineData[278] = 0;
  _$jscoverage['/dialog.js'].lineData[280] = 0;
  _$jscoverage['/dialog.js'].lineData[283] = 0;
  _$jscoverage['/dialog.js'].lineData[284] = 0;
  _$jscoverage['/dialog.js'].lineData[287] = 0;
  _$jscoverage['/dialog.js'].lineData[288] = 0;
  _$jscoverage['/dialog.js'].lineData[289] = 0;
  _$jscoverage['/dialog.js'].lineData[292] = 0;
  _$jscoverage['/dialog.js'].lineData[294] = 0;
  _$jscoverage['/dialog.js'].lineData[295] = 0;
  _$jscoverage['/dialog.js'].lineData[297] = 0;
  _$jscoverage['/dialog.js'].lineData[300] = 0;
  _$jscoverage['/dialog.js'].lineData[301] = 0;
  _$jscoverage['/dialog.js'].lineData[302] = 0;
  _$jscoverage['/dialog.js'].lineData[303] = 0;
  _$jscoverage['/dialog.js'].lineData[304] = 0;
  _$jscoverage['/dialog.js'].lineData[305] = 0;
  _$jscoverage['/dialog.js'].lineData[309] = 0;
  _$jscoverage['/dialog.js'].lineData[310] = 0;
  _$jscoverage['/dialog.js'].lineData[316] = 0;
  _$jscoverage['/dialog.js'].lineData[317] = 0;
  _$jscoverage['/dialog.js'].lineData[322] = 0;
  _$jscoverage['/dialog.js'].lineData[333] = 0;
  _$jscoverage['/dialog.js'].lineData[334] = 0;
  _$jscoverage['/dialog.js'].lineData[336] = 0;
  _$jscoverage['/dialog.js'].lineData[337] = 0;
  _$jscoverage['/dialog.js'].lineData[339] = 0;
  _$jscoverage['/dialog.js'].lineData[342] = 0;
  _$jscoverage['/dialog.js'].lineData[343] = 0;
  _$jscoverage['/dialog.js'].lineData[347] = 0;
  _$jscoverage['/dialog.js'].lineData[348] = 0;
  _$jscoverage['/dialog.js'].lineData[351] = 0;
  _$jscoverage['/dialog.js'].lineData[352] = 0;
  _$jscoverage['/dialog.js'].lineData[355] = 0;
  _$jscoverage['/dialog.js'].lineData[357] = 0;
  _$jscoverage['/dialog.js'].lineData[359] = 0;
  _$jscoverage['/dialog.js'].lineData[362] = 0;
  _$jscoverage['/dialog.js'].lineData[363] = 0;
  _$jscoverage['/dialog.js'].lineData[365] = 0;
  _$jscoverage['/dialog.js'].lineData[366] = 0;
  _$jscoverage['/dialog.js'].lineData[369] = 0;
  _$jscoverage['/dialog.js'].lineData[370] = 0;
  _$jscoverage['/dialog.js'].lineData[371] = 0;
  _$jscoverage['/dialog.js'].lineData[374] = 0;
  _$jscoverage['/dialog.js'].lineData[375] = 0;
  _$jscoverage['/dialog.js'].lineData[376] = 0;
  _$jscoverage['/dialog.js'].lineData[377] = 0;
  _$jscoverage['/dialog.js'].lineData[378] = 0;
  _$jscoverage['/dialog.js'].lineData[380] = 0;
  _$jscoverage['/dialog.js'].lineData[381] = 0;
  _$jscoverage['/dialog.js'].lineData[382] = 0;
  _$jscoverage['/dialog.js'].lineData[385] = 0;
  _$jscoverage['/dialog.js'].lineData[386] = 0;
  _$jscoverage['/dialog.js'].lineData[387] = 0;
  _$jscoverage['/dialog.js'].lineData[388] = 0;
  _$jscoverage['/dialog.js'].lineData[389] = 0;
  _$jscoverage['/dialog.js'].lineData[391] = 0;
  _$jscoverage['/dialog.js'].lineData[393] = 0;
  _$jscoverage['/dialog.js'].lineData[394] = 0;
  _$jscoverage['/dialog.js'].lineData[396] = 0;
  _$jscoverage['/dialog.js'].lineData[397] = 0;
  _$jscoverage['/dialog.js'].lineData[400] = 0;
  _$jscoverage['/dialog.js'].lineData[404] = 0;
  _$jscoverage['/dialog.js'].lineData[405] = 0;
  _$jscoverage['/dialog.js'].lineData[410] = 0;
  _$jscoverage['/dialog.js'].lineData[414] = 0;
  _$jscoverage['/dialog.js'].lineData[416] = 0;
  _$jscoverage['/dialog.js'].lineData[419] = 0;
  _$jscoverage['/dialog.js'].lineData[422] = 0;
  _$jscoverage['/dialog.js'].lineData[423] = 0;
  _$jscoverage['/dialog.js'].lineData[424] = 0;
  _$jscoverage['/dialog.js'].lineData[426] = 0;
  _$jscoverage['/dialog.js'].lineData[429] = 0;
  _$jscoverage['/dialog.js'].lineData[431] = 0;
  _$jscoverage['/dialog.js'].lineData[432] = 0;
  _$jscoverage['/dialog.js'].lineData[433] = 0;
  _$jscoverage['/dialog.js'].lineData[435] = 0;
  _$jscoverage['/dialog.js'].lineData[436] = 0;
  _$jscoverage['/dialog.js'].lineData[440] = 0;
  _$jscoverage['/dialog.js'].lineData[441] = 0;
  _$jscoverage['/dialog.js'].lineData[443] = 0;
  _$jscoverage['/dialog.js'].lineData[446] = 0;
  _$jscoverage['/dialog.js'].lineData[450] = 0;
  _$jscoverage['/dialog.js'].lineData[451] = 0;
  _$jscoverage['/dialog.js'].lineData[454] = 0;
  _$jscoverage['/dialog.js'].lineData[455] = 0;
  _$jscoverage['/dialog.js'].lineData[458] = 0;
  _$jscoverage['/dialog.js'].lineData[459] = 0;
  _$jscoverage['/dialog.js'].lineData[461] = 0;
  _$jscoverage['/dialog.js'].lineData[462] = 0;
  _$jscoverage['/dialog.js'].lineData[464] = 0;
  _$jscoverage['/dialog.js'].lineData[466] = 0;
  _$jscoverage['/dialog.js'].lineData[469] = 0;
  _$jscoverage['/dialog.js'].lineData[470] = 0;
  _$jscoverage['/dialog.js'].lineData[473] = 0;
  _$jscoverage['/dialog.js'].lineData[474] = 0;
  _$jscoverage['/dialog.js'].lineData[475] = 0;
  _$jscoverage['/dialog.js'].lineData[478] = 0;
  _$jscoverage['/dialog.js'].lineData[482] = 0;
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
}
if (! _$jscoverage['/dialog.js'].branchData) {
  _$jscoverage['/dialog.js'].branchData = {};
  _$jscoverage['/dialog.js'].branchData['10'] = [];
  _$jscoverage['/dialog.js'].branchData['10'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['164'] = [];
  _$jscoverage['/dialog.js'].branchData['164'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['225'] = [];
  _$jscoverage['/dialog.js'].branchData['225'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['231'] = [];
  _$jscoverage['/dialog.js'].branchData['231'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['236'] = [];
  _$jscoverage['/dialog.js'].branchData['236'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['239'] = [];
  _$jscoverage['/dialog.js'].branchData['239'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['240'] = [];
  _$jscoverage['/dialog.js'].branchData['240'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['240'][2] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['241'] = [];
  _$jscoverage['/dialog.js'].branchData['241'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['249'] = [];
  _$jscoverage['/dialog.js'].branchData['249'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['252'] = [];
  _$jscoverage['/dialog.js'].branchData['252'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['267'] = [];
  _$jscoverage['/dialog.js'].branchData['267'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['272'] = [];
  _$jscoverage['/dialog.js'].branchData['272'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['277'] = [];
  _$jscoverage['/dialog.js'].branchData['277'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['277'][2] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['283'] = [];
  _$jscoverage['/dialog.js'].branchData['283'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['288'] = [];
  _$jscoverage['/dialog.js'].branchData['288'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['294'] = [];
  _$jscoverage['/dialog.js'].branchData['294'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['300'] = [];
  _$jscoverage['/dialog.js'].branchData['300'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['301'] = [];
  _$jscoverage['/dialog.js'].branchData['301'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['302'] = [];
  _$jscoverage['/dialog.js'].branchData['302'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['304'] = [];
  _$jscoverage['/dialog.js'].branchData['304'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['316'] = [];
  _$jscoverage['/dialog.js'].branchData['316'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['326'] = [];
  _$jscoverage['/dialog.js'].branchData['326'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['327'] = [];
  _$jscoverage['/dialog.js'].branchData['327'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['333'] = [];
  _$jscoverage['/dialog.js'].branchData['333'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['336'] = [];
  _$jscoverage['/dialog.js'].branchData['336'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['342'] = [];
  _$jscoverage['/dialog.js'].branchData['342'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['347'] = [];
  _$jscoverage['/dialog.js'].branchData['347'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['351'] = [];
  _$jscoverage['/dialog.js'].branchData['351'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['357'] = [];
  _$jscoverage['/dialog.js'].branchData['357'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['358'] = [];
  _$jscoverage['/dialog.js'].branchData['358'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['362'] = [];
  _$jscoverage['/dialog.js'].branchData['362'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['365'] = [];
  _$jscoverage['/dialog.js'].branchData['365'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['370'] = [];
  _$jscoverage['/dialog.js'].branchData['370'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['374'] = [];
  _$jscoverage['/dialog.js'].branchData['374'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['377'] = [];
  _$jscoverage['/dialog.js'].branchData['377'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['386'] = [];
  _$jscoverage['/dialog.js'].branchData['386'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['388'] = [];
  _$jscoverage['/dialog.js'].branchData['388'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['404'] = [];
  _$jscoverage['/dialog.js'].branchData['404'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['406'] = [];
  _$jscoverage['/dialog.js'].branchData['406'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['410'] = [];
  _$jscoverage['/dialog.js'].branchData['410'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['414'] = [];
  _$jscoverage['/dialog.js'].branchData['414'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['416'] = [];
  _$jscoverage['/dialog.js'].branchData['416'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['423'] = [];
  _$jscoverage['/dialog.js'].branchData['423'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['429'] = [];
  _$jscoverage['/dialog.js'].branchData['429'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['432'] = [];
  _$jscoverage['/dialog.js'].branchData['432'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['450'] = [];
  _$jscoverage['/dialog.js'].branchData['450'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['461'] = [];
  _$jscoverage['/dialog.js'].branchData['461'][1] = new BranchData();
}
_$jscoverage['/dialog.js'].branchData['461'][1].init(660, 15, 'self.selectedTd');
function visit49_461_1(result) {
  _$jscoverage['/dialog.js'].branchData['461'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['450'][1].init(138, 18, 'self.selectedTable');
function visit48_450_1(result) {
  _$jscoverage['/dialog.js'].branchData['450'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['432'][1].init(1105, 7, 'caption');
function visit47_432_1(result) {
  _$jscoverage['/dialog.js'].branchData['432'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['429'][1].init(-1, 35, 'selectedTable.style("height") || ""');
function visit46_429_1(result) {
  _$jscoverage['/dialog.js'].branchData['429'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['423'][1].init(804, 20, 'w.indexOf("%") != -1');
function visit45_423_1(result) {
  _$jscoverage['/dialog.js'].branchData['423'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['416'][1].init(538, 76, 'selectedTable.style('width') || ("" + selectedTable.width())');
function visit44_416_1(result) {
  _$jscoverage['/dialog.js'].branchData['416'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['414'][1].init(464, 51, 'selectedTable.attr("border") || "0"');
function visit43_414_1(result) {
  _$jscoverage['/dialog.js'].branchData['414'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['410'][1].init(384, 49, 'selectedTable.attr("align") || ""');
function visit42_410_1(result) {
  _$jscoverage['/dialog.js'].branchData['410'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['406'][1].init(38, 71, 'parseInt(self.selectedTd.css("padding")) || "0"');
function visit41_406_1(result) {
  _$jscoverage['/dialog.js'].branchData['406'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['404'][1].init(187, 15, 'self.selectedTd');
function visit40_404_1(result) {
  _$jscoverage['/dialog.js'].branchData['404'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['388'][1].init(61, 8, 'i < cols');
function visit39_388_1(result) {
  _$jscoverage['/dialog.js'].branchData['388'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['386'][1].init(2090, 8, 'r < rows');
function visit38_386_1(result) {
  _$jscoverage['/dialog.js'].branchData['386'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['377'][1].init(96, 8, 'i < cols');
function visit37_377_1(result) {
  _$jscoverage['/dialog.js'].branchData['377'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['374'][1].init(1710, 20, 'd.thead.get("value")');
function visit36_374_1(result) {
  _$jscoverage['/dialog.js'].branchData['374'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['370'][1].init(1529, 23, 'valid(d.tcaption.val())');
function visit35_370_1(result) {
  _$jscoverage['/dialog.js'].branchData['370'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['365'][1].init(1393, 14, 'classes.length');
function visit34_365_1(result) {
  _$jscoverage['/dialog.js'].branchData['365'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['362'][1].init(1287, 22, 'd.tcollapse[0].checked');
function visit33_362_1(result) {
  _$jscoverage['/dialog.js'].branchData['362'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['358'][1].init(42, 36, 'String(trim(d.tborder.val())) == "0"');
function visit32_358_1(result) {
  _$jscoverage['/dialog.js'].branchData['358'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['357'][1].init(1122, 79, '!valid(d.tborder.val()) || String(trim(d.tborder.val())) == "0"');
function visit31_357_1(result) {
  _$jscoverage['/dialog.js'].branchData['357'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['351'][1].init(983, 13, 'styles.length');
function visit30_351_1(result) {
  _$jscoverage['/dialog.js'].branchData['351'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['347'][1].init(854, 22, 'valid(d.theight.val())');
function visit29_347_1(result) {
  _$jscoverage['/dialog.js'].branchData['347'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['342'][1].init(682, 21, 'valid(d.twidth.val())');
function visit28_342_1(result) {
  _$jscoverage['/dialog.js'].branchData['342'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['336'][1].init(543, 22, 'valid(d.tborder.val())');
function visit27_336_1(result) {
  _$jscoverage['/dialog.js'].branchData['336'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['333'][1].init(424, 28, 'valid(d.talign.get("value"))');
function visit26_333_1(result) {
  _$jscoverage['/dialog.js'].branchData['333'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['327'][1].init(178, 28, 'parseInt(d.trows.val()) || 1');
function visit25_327_1(result) {
  _$jscoverage['/dialog.js'].branchData['327'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['326'][1].init(125, 28, 'parseInt(d.tcols.val()) || 1');
function visit24_326_1(result) {
  _$jscoverage['/dialog.js'].branchData['326'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['316'][1].init(2354, 7, 'caption');
function visit23_316_1(result) {
  _$jscoverage['/dialog.js'].branchData['316'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['304'][1].init(85, 21, 'caption && caption[0]');
function visit22_304_1(result) {
  _$jscoverage['/dialog.js'].branchData['304'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['302'][1].init(1668, 23, 'valid(d.tcaption.val())');
function visit21_302_1(result) {
  _$jscoverage['/dialog.js'].branchData['302'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['301'][1].init(1583, 15, 'self.selectedTd');
function visit20_301_1(result) {
  _$jscoverage['/dialog.js'].branchData['301'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['300'][1].init(1530, 34, 'parseInt(d.cellpadding.val()) || 0');
function visit19_300_1(result) {
  _$jscoverage['/dialog.js'].branchData['300'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['294'][1].init(1293, 22, 'd.tcollapse[0].checked');
function visit18_294_1(result) {
  _$jscoverage['/dialog.js'].branchData['294'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['288'][1].init(1098, 22, 'valid(d.theight.val())');
function visit17_288_1(result) {
  _$jscoverage['/dialog.js'].branchData['288'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['283'][1].init(880, 21, 'valid(d.twidth.val())');
function visit16_283_1(result) {
  _$jscoverage['/dialog.js'].branchData['283'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['277'][2].init(660, 17, 'tborderVal == "0"');
function visit15_277_2(result) {
  _$jscoverage['/dialog.js'].branchData['277'][2].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['277'][1].init(638, 39, '!valid(tborderVal) || tborderVal == "0"');
function visit14_277_1(result) {
  _$jscoverage['/dialog.js'].branchData['277'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['272'][1].init(450, 17, 'valid(tborderVal)');
function visit13_272_1(result) {
  _$jscoverage['/dialog.js'].branchData['272'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['267'][1].init(285, 16, 'valid(talignVal)');
function visit12_267_1(result) {
  _$jscoverage['/dialog.js'].branchData['267'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['252'][1].init(21, 19, '!self.selectedTable');
function visit11_252_1(result) {
  _$jscoverage['/dialog.js'].branchData['252'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['249'][1].init(642, 3, '!re');
function visit10_249_1(result) {
  _$jscoverage['/dialog.js'].branchData['249'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['241'][1].init(39, 6, 'tw < 0');
function visit9_241_1(result) {
  _$jscoverage['/dialog.js'].branchData['241'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['240'][2].init(33, 8, 'tw > 100');
function visit8_240_2(result) {
  _$jscoverage['/dialog.js'].branchData['240'][2].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['240'][1].init(-1, 46, 'tw > 100 || tw < 0');
function visit7_240_1(result) {
  _$jscoverage['/dialog.js'].branchData['240'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['239'][1].init(24, 105, '!tw || (tw > 100 || tw < 0)');
function visit6_239_1(result) {
  _$jscoverage['/dialog.js'].branchData['239'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['236'][1].init(180, 42, 'tableDialog.twidthunit.get("value") == "%"');
function visit5_236_1(result) {
  _$jscoverage['/dialog.js'].branchData['236'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['231'][1].init(13, 15, 'ev && ev.halt()');
function visit4_231_1(result) {
  _$jscoverage['/dialog.js'].branchData['231'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['225'][1].init(17, 15, 'ev && ev.halt()');
function visit3_225_1(result) {
  _$jscoverage['/dialog.js'].branchData['225'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['164'][1].init(16, 21, 'trim(str).length != 0');
function visit2_164_1(result) {
  _$jscoverage['/dialog.js'].branchData['164'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['10'][1].init(142, 16, 'S.UA.ieMode < 11');
function visit1_10_1(result) {
  _$jscoverage['/dialog.js'].branchData['10'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/dialog.js'].functionData[0]++;
  _$jscoverage['/dialog.js'].lineData[7]++;
  var Editor = require('editor');
  _$jscoverage['/dialog.js'].lineData[8]++;
  var Dialog4E = require('../dialog');
  _$jscoverage['/dialog.js'].lineData[9]++;
  var MenuButton = require('../menubutton');
  _$jscoverage['/dialog.js'].lineData[10]++;
  var OLD_IE = visit1_10_1(S.UA.ieMode < 11);
  _$jscoverage['/dialog.js'].lineData[11]++;
  var Node = S.Node, Dom = S.DOM, trim = S.trim, showBorderClassName = "ke_show_border", collapseTableClass = "k-e-collapse-table", IN_SIZE = 6, alignStyle = 'margin:0 5px 0 0;', TABLE_HTML = "<div style='padding:20px 20px 10px 20px;'>" + "<table class='{prefixCls}editor-table-config' style='width:100%'>" + "<tr>" + "<td>" + "<label>\u884c\u6570\uff1a " + "<input " + " data-verify='^(?!0$)\\d+$' " + " data-warning='\u884c\u6570\u8bf7\u8f93\u5165\u6b63\u6574\u6570' " + " value='2' " + " class='{prefixCls}editor-table-rows {prefixCls}editor-table-create-only {prefixCls}editor-input' " + "style='" + alignStyle + "'" + " size='" + IN_SIZE + "'" + " />" + "</label>" + "</td>" + "<td>" + "<label>\u5bbd&nbsp;&nbsp;&nbsp;\u5ea6\uff1a " + "</label> " + "<input " + " data-verify='^(?!0$)\\d+$' " + " data-warning='\u5bbd\u5ea6\u8bf7\u8f93\u5165\u6b63\u6574\u6570' " + "value='200' " + "style='" + alignStyle + "' " + "class='{prefixCls}editor-table-width {prefixCls}editor-input' " + "size='" + IN_SIZE + "'/>" + "<select class='{prefixCls}editor-table-width-unit' title='\u5bbd\u5ea6\u5355\u4f4d'>" + "<option value='px'>\u50cf\u7d20</option>" + "<option value='%'>\u767e\u5206\u6bd4</option>" + "</select>" + "</td>" + "</tr>" + "<tr>" + "<td>" + "<label>\u5217\u6570\uff1a " + "<input " + " data-verify='^(?!0$)\\d+$' " + " data-warning='\u5217\u6570\u8bf7\u8f93\u5165\u6b63\u6574\u6570' " + "class='{prefixCls}editor-table-cols {prefixCls}editor-table-create-only {prefixCls}editor-input' " + "style='" + alignStyle + "'" + "value='3' " + "size='" + IN_SIZE + "'/>" + "</label>" + "</td>" + "<td>" + "<label>" + "\u9ad8&nbsp;&nbsp;&nbsp;\u5ea6\uff1a " + "</label>" + "<input " + " data-verify='^((?!0$)\\d+)?$' " + " data-warning='\u9ad8\u5ea6\u8bf7\u8f93\u5165\u6b63\u6574\u6570' " + "value='' " + "style='" + alignStyle + "'" + "class='{prefixCls}editor-table-height {prefixCls}editor-input' " + "size='" + IN_SIZE + "'/>" + " &nbsp;\u50cf\u7d20" + "</td>" + "</tr>" + "<tr>" + "<td>" + "<label>\u5bf9\u9f50\uff1a </label>" + "<select class='{prefixCls}editor-table-align' title='\u5bf9\u9f50'>" + "<option value=''>\u65e0</option>" + "<option value='left'>\u5de6\u5bf9\u9f50</option>" + "<option value='right'>\u53f3\u5bf9\u9f50</option>" + "<option value='center'>\u4e2d\u95f4\u5bf9\u9f50</option>" + "</select>" + "</td>" + "<td>" + "<label>\u6807\u9898\u683c\uff1a</label> " + "<select class='{prefixCls}editor-table-head {prefixCls}editor-table-create-only' title='\u6807\u9898\u683c'>" + "<option value=''>\u65e0</option>" + "<option value='1'>\u6709</option>" + "</select>" + "</td>" + "</tr>" + "<tr>" + "<td>" + "<label>\u8fb9\u6846\uff1a " + "<input " + " data-verify='^\\d+$' " + " data-warning='\u8fb9\u6846\u8bf7\u8f93\u5165\u975e\u8d1f\u6574\u6570' " + "value='1' " + "style='" + alignStyle + "'" + "class='{prefixCls}editor-table-border {prefixCls}editor-input' " + "size='" + IN_SIZE + "'/>" + "</label> &nbsp;\u50cf\u7d20" + " " + '<label><input ' + 'type="checkbox" ' + 'style="vertical-align: middle; margin-left: 5px;" ' + 'class="{prefixCls}editor-table-collapse" ' + '/> \u5408\u5e76\u8fb9\u6846' + "</label>" + "</td>" + "<td>" + "<label " + "class='{prefixCls}editor-table-cellpadding-holder'" + ">\u8fb9&nbsp;&nbsp;&nbsp;\u8ddd\uff1a " + "<input " + " data-verify='^(\\d+)?$' " + " data-warning='\u8fb9\u6846\u8bf7\u8f93\u5165\u975e\u8d1f\u6574\u6570' " + "value='0' " + "style='" + alignStyle + "'" + "class='{prefixCls}editor-table-cellpadding {prefixCls}editor-input' " + "size='" + IN_SIZE + "'/>" + " &nbsp;\u50cf\u7d20</label>" + "</td>" + "</tr>" + "<tr>" + "<td colspan='2'>" + "<label>" + "\u6807\u9898\uff1a " + "<input " + "class='{prefixCls}editor-table-caption {prefixCls}editor-input' " + "style='width:380px;" + alignStyle + "'>" + "</label>" + "</td>" + "</tr>" + "</table>" + "</div>", footHTML = "<div style='padding:5px 20px 20px;'>" + "<a " + "class='{prefixCls}editor-table-ok {prefixCls}editor-button ks-inline-block' " + "style='margin-right:20px;'>\u786e\u5b9a</a> " + "<a " + "class='{prefixCls}editor-table-cancel {prefixCls}editor-button ks-inline-block'>\u53d6\u6d88</a>" + "</div>", addRes = Editor.Utils.addRes, destroyRes = Editor.Utils.destroyRes;
  _$jscoverage['/dialog.js'].lineData[157]++;
  function replacePrefix(str, prefix) {
    _$jscoverage['/dialog.js'].functionData[1]++;
    _$jscoverage['/dialog.js'].lineData[158]++;
    return S.substitute(str, {
  prefixCls: prefix});
  }
  _$jscoverage['/dialog.js'].lineData[163]++;
  function valid(str) {
    _$jscoverage['/dialog.js'].functionData[2]++;
    _$jscoverage['/dialog.js'].lineData[164]++;
    return visit2_164_1(trim(str).length != 0);
  }
  _$jscoverage['/dialog.js'].lineData[167]++;
  function TableDialog(editor) {
    _$jscoverage['/dialog.js'].functionData[3]++;
    _$jscoverage['/dialog.js'].lineData[168]++;
    var self = this;
    _$jscoverage['/dialog.js'].lineData[169]++;
    self.editor = editor;
    _$jscoverage['/dialog.js'].lineData[170]++;
    Editor.Utils.lazyRun(self, "_prepareTableShow", "_realTableShow");
  }
  _$jscoverage['/dialog.js'].lineData[173]++;
  S.augment(TableDialog, {
  _tableInit: function() {
  _$jscoverage['/dialog.js'].functionData[4]++;
  _$jscoverage['/dialog.js'].lineData[175]++;
  var self = this, prefixCls = self.editor.get('prefixCls'), d = new Dialog4E({
  width: "500px", 
  mask: true, 
  headerContent: "\u8868\u683c", 
  bodyContent: replacePrefix(TABLE_HTML, prefixCls), 
  footerContent: replacePrefix(footHTML, prefixCls)}).render(), dbody = d.get("body"), foot = d.get("footer");
  _$jscoverage['/dialog.js'].lineData[186]++;
  d.twidth = dbody.one(replacePrefix(".{prefixCls}editor-table-width", prefixCls));
  _$jscoverage['/dialog.js'].lineData[187]++;
  d.theight = dbody.one(replacePrefix(".{prefixCls}editor-table-height", prefixCls));
  _$jscoverage['/dialog.js'].lineData[188]++;
  d.tborder = dbody.one(replacePrefix(".{prefixCls}editor-table-border", prefixCls));
  _$jscoverage['/dialog.js'].lineData[189]++;
  d.tcaption = dbody.one(replacePrefix(".{prefixCls}editor-table-caption", prefixCls));
  _$jscoverage['/dialog.js'].lineData[190]++;
  d.talign = MenuButton.Select.decorate(dbody.one(replacePrefix(".{prefixCls}editor-table-align", prefixCls)), {
  prefixCls: replacePrefix('{prefixCls}editor-big-', prefixCls), 
  width: 80, 
  menuCfg: {
  prefixCls: replacePrefix('{prefixCls}editor-', prefixCls), 
  render: dbody}});
  _$jscoverage['/dialog.js'].lineData[198]++;
  d.trows = dbody.one(replacePrefix(".{prefixCls}editor-table-rows", prefixCls));
  _$jscoverage['/dialog.js'].lineData[199]++;
  d.tcols = dbody.one(replacePrefix(".{prefixCls}editor-table-cols", prefixCls));
  _$jscoverage['/dialog.js'].lineData[200]++;
  d.thead = MenuButton.Select.decorate(dbody.one(replacePrefix(".{prefixCls}editor-table-head", prefixCls)), {
  prefixCls: replacePrefix('{prefixCls}editor-big-', prefixCls), 
  width: 80, 
  menuCfg: {
  prefixCls: replacePrefix('{prefixCls}editor-', prefixCls), 
  render: dbody}});
  _$jscoverage['/dialog.js'].lineData[208]++;
  d.cellpaddingHolder = dbody.one(replacePrefix(".{prefixCls}editor-table-cellpadding-holder", prefixCls));
  _$jscoverage['/dialog.js'].lineData[209]++;
  d.cellpadding = dbody.one(replacePrefix(".{prefixCls}editor-table-cellpadding", prefixCls));
  _$jscoverage['/dialog.js'].lineData[210]++;
  d.tcollapse = dbody.one(replacePrefix(".{prefixCls}editor-table-collapse", prefixCls));
  _$jscoverage['/dialog.js'].lineData[211]++;
  var tok = foot.one(replacePrefix(".{prefixCls}editor-table-ok", prefixCls)), tclose = foot.one(replacePrefix(".{prefixCls}editor-table-cancel", prefixCls));
  _$jscoverage['/dialog.js'].lineData[213]++;
  d.twidthunit = MenuButton.Select.decorate(dbody.one(replacePrefix(".{prefixCls}editor-table-width-unit", prefixCls)), {
  prefixCls: replacePrefix('{prefixCls}editor-big-', prefixCls), 
  width: 80, 
  menuCfg: {
  prefixCls: replacePrefix('{prefixCls}editor-', prefixCls), 
  render: dbody}});
  _$jscoverage['/dialog.js'].lineData[221]++;
  self.dialog = d;
  _$jscoverage['/dialog.js'].lineData[222]++;
  tok.on("click", self._tableOk, self);
  _$jscoverage['/dialog.js'].lineData[224]++;
  tclose.on("click", function(ev) {
  _$jscoverage['/dialog.js'].functionData[5]++;
  _$jscoverage['/dialog.js'].lineData[225]++;
  visit3_225_1(ev && ev.halt());
  _$jscoverage['/dialog.js'].lineData[226]++;
  d.hide();
});
  _$jscoverage['/dialog.js'].lineData[228]++;
  addRes.call(self, d, d.twidthunit, tok, tclose);
}, 
  _tableOk: function(ev) {
  _$jscoverage['/dialog.js'].functionData[6]++;
  _$jscoverage['/dialog.js'].lineData[231]++;
  visit4_231_1(ev && ev.halt());
  _$jscoverage['/dialog.js'].lineData[232]++;
  var self = this, tableDialog = self.dialog, inputs = tableDialog.get('el').all('input');
  _$jscoverage['/dialog.js'].lineData[236]++;
  if (visit5_236_1(tableDialog.twidthunit.get("value") == "%")) {
    _$jscoverage['/dialog.js'].lineData[237]++;
    var tw = parseInt(tableDialog.twidth.val());
    _$jscoverage['/dialog.js'].lineData[238]++;
    if (visit6_239_1(!tw || (visit7_240_1(visit8_240_2(tw > 100) || visit9_241_1(tw < 0))))) {
      _$jscoverage['/dialog.js'].lineData[244]++;
      alert("\u5bbd\u5ea6\u767e\u5206\u6bd4\uff1a" + "\u8bf7\u8f93\u51651-100\u4e4b\u95f4");
      _$jscoverage['/dialog.js'].lineData[245]++;
      return;
    }
  }
  _$jscoverage['/dialog.js'].lineData[248]++;
  var re = Editor.Utils.verifyInputs(inputs);
  _$jscoverage['/dialog.js'].lineData[249]++;
  if (visit10_249_1(!re)) 
    return;
  _$jscoverage['/dialog.js'].lineData[250]++;
  self.dialog.hide();
  _$jscoverage['/dialog.js'].lineData[251]++;
  setTimeout(function() {
  _$jscoverage['/dialog.js'].functionData[7]++;
  _$jscoverage['/dialog.js'].lineData[252]++;
  if (visit11_252_1(!self.selectedTable)) {
    _$jscoverage['/dialog.js'].lineData[253]++;
    self._genTable();
  } else {
    _$jscoverage['/dialog.js'].lineData[255]++;
    self._modifyTable();
  }
}, 0);
}, 
  _modifyTable: function() {
  _$jscoverage['/dialog.js'].functionData[8]++;
  _$jscoverage['/dialog.js'].lineData[260]++;
  var self = this, d = self.dialog, selectedTable = self.selectedTable, caption = selectedTable.one("caption"), talignVal = d.talign.get("value"), tborderVal = d.tborder.val();
  _$jscoverage['/dialog.js'].lineData[267]++;
  if (visit12_267_1(valid(talignVal))) {
    _$jscoverage['/dialog.js'].lineData[268]++;
    selectedTable.attr("align", trim(talignVal));
  } else {
    _$jscoverage['/dialog.js'].lineData[270]++;
    selectedTable.removeAttr("align");
  }
  _$jscoverage['/dialog.js'].lineData[272]++;
  if (visit13_272_1(valid(tborderVal))) {
    _$jscoverage['/dialog.js'].lineData[273]++;
    selectedTable.attr("border", trim(tborderVal));
  } else {
    _$jscoverage['/dialog.js'].lineData[275]++;
    selectedTable.removeAttr("border");
  }
  _$jscoverage['/dialog.js'].lineData[277]++;
  if (visit14_277_1(!valid(tborderVal) || visit15_277_2(tborderVal == "0"))) {
    _$jscoverage['/dialog.js'].lineData[278]++;
    selectedTable.addClass(showBorderClassName, undefined);
  } else {
    _$jscoverage['/dialog.js'].lineData[280]++;
    selectedTable.removeClass(showBorderClassName, undefined);
  }
  _$jscoverage['/dialog.js'].lineData[283]++;
  if (visit16_283_1(valid(d.twidth.val()))) {
    _$jscoverage['/dialog.js'].lineData[284]++;
    selectedTable.css('width', trim(d.twidth.val()) + d.twidthunit.get("value"));
  } else {
    _$jscoverage['/dialog.js'].lineData[287]++;
    selectedTable.css('width', "");
  }
  _$jscoverage['/dialog.js'].lineData[288]++;
  if (visit17_288_1(valid(d.theight.val()))) {
    _$jscoverage['/dialog.js'].lineData[289]++;
    selectedTable.css("height", trim(d.theight.val()));
  } else {
    _$jscoverage['/dialog.js'].lineData[292]++;
    selectedTable.css("height", "");
  }
  _$jscoverage['/dialog.js'].lineData[294]++;
  if (visit18_294_1(d.tcollapse[0].checked)) {
    _$jscoverage['/dialog.js'].lineData[295]++;
    selectedTable.addClass(collapseTableClass, undefined);
  } else {
    _$jscoverage['/dialog.js'].lineData[297]++;
    selectedTable.removeClass(collapseTableClass, undefined);
  }
  _$jscoverage['/dialog.js'].lineData[300]++;
  d.cellpadding.val(visit19_300_1(parseInt(d.cellpadding.val()) || 0));
  _$jscoverage['/dialog.js'].lineData[301]++;
  if (visit20_301_1(self.selectedTd)) 
    self.selectedTd.css("padding", d.cellpadding.val());
  _$jscoverage['/dialog.js'].lineData[302]++;
  if (visit21_302_1(valid(d.tcaption.val()))) {
    _$jscoverage['/dialog.js'].lineData[303]++;
    var tcv = S.escapeHtml(trim(d.tcaption.val()));
    _$jscoverage['/dialog.js'].lineData[304]++;
    if (visit22_304_1(caption && caption[0])) {
      _$jscoverage['/dialog.js'].lineData[305]++;
      caption.html(tcv);
    } else {
      _$jscoverage['/dialog.js'].lineData[309]++;
      var c = selectedTable[0].createCaption();
      _$jscoverage['/dialog.js'].lineData[310]++;
      Dom.html(c, "<span>" + tcv + "</span>");
    }
  } else {
    _$jscoverage['/dialog.js'].lineData[316]++;
    if (visit23_316_1(caption)) {
      _$jscoverage['/dialog.js'].lineData[317]++;
      caption.remove();
    }
  }
}, 
  _genTable: function() {
  _$jscoverage['/dialog.js'].functionData[9]++;
  _$jscoverage['/dialog.js'].lineData[322]++;
  var self = this, d = self.dialog, html = "<table ", i, cols = visit24_326_1(parseInt(d.tcols.val()) || 1), rows = visit25_327_1(parseInt(d.trows.val()) || 1), cellPad = OLD_IE ? '' : '<br/>', editor = self.editor;
  _$jscoverage['/dialog.js'].lineData[333]++;
  if (visit26_333_1(valid(d.talign.get("value")))) {
    _$jscoverage['/dialog.js'].lineData[334]++;
    html += "align='" + trim(d.talign.get("value")) + "' ";
  }
  _$jscoverage['/dialog.js'].lineData[336]++;
  if (visit27_336_1(valid(d.tborder.val()))) {
    _$jscoverage['/dialog.js'].lineData[337]++;
    html += "border='" + trim(d.tborder.val()) + "' ";
  }
  _$jscoverage['/dialog.js'].lineData[339]++;
  var styles = [];
  _$jscoverage['/dialog.js'].lineData[342]++;
  if (visit28_342_1(valid(d.twidth.val()))) {
    _$jscoverage['/dialog.js'].lineData[343]++;
    styles.push("width:" + trim(d.twidth.val()) + d.twidthunit.get("value") + ";");
  }
  _$jscoverage['/dialog.js'].lineData[347]++;
  if (visit29_347_1(valid(d.theight.val()))) {
    _$jscoverage['/dialog.js'].lineData[348]++;
    styles.push("height:" + trim(d.theight.val()) + "px;");
  }
  _$jscoverage['/dialog.js'].lineData[351]++;
  if (visit30_351_1(styles.length)) {
    _$jscoverage['/dialog.js'].lineData[352]++;
    html += "style='" + styles.join("") + "' ";
  }
  _$jscoverage['/dialog.js'].lineData[355]++;
  var classes = [];
  _$jscoverage['/dialog.js'].lineData[357]++;
  if (visit31_357_1(!valid(d.tborder.val()) || visit32_358_1(String(trim(d.tborder.val())) == "0"))) {
    _$jscoverage['/dialog.js'].lineData[359]++;
    classes.push(showBorderClassName);
  }
  _$jscoverage['/dialog.js'].lineData[362]++;
  if (visit33_362_1(d.tcollapse[0].checked)) {
    _$jscoverage['/dialog.js'].lineData[363]++;
    classes.push(collapseTableClass);
  }
  _$jscoverage['/dialog.js'].lineData[365]++;
  if (visit34_365_1(classes.length)) {
    _$jscoverage['/dialog.js'].lineData[366]++;
    html += "class='" + classes.join(" ") + "' ";
  }
  _$jscoverage['/dialog.js'].lineData[369]++;
  html += ">";
  _$jscoverage['/dialog.js'].lineData[370]++;
  if (visit35_370_1(valid(d.tcaption.val()))) {
    _$jscoverage['/dialog.js'].lineData[371]++;
    html += "<caption><span>" + S.escapeHtml(trim(d.tcaption.val())) + "</span></caption>";
  }
  _$jscoverage['/dialog.js'].lineData[374]++;
  if (visit36_374_1(d.thead.get("value"))) {
    _$jscoverage['/dialog.js'].lineData[375]++;
    html += "<thead>";
    _$jscoverage['/dialog.js'].lineData[376]++;
    html += "<tr>";
    _$jscoverage['/dialog.js'].lineData[377]++;
    for (i = 0; visit37_377_1(i < cols); i++) {
      _$jscoverage['/dialog.js'].lineData[378]++;
      html += "<th>" + cellPad + "</th>";
    }
    _$jscoverage['/dialog.js'].lineData[380]++;
    html += "</tr>";
    _$jscoverage['/dialog.js'].lineData[381]++;
    html += "</thead>";
    _$jscoverage['/dialog.js'].lineData[382]++;
    rows -= 1;
  }
  _$jscoverage['/dialog.js'].lineData[385]++;
  html += "<tbody>";
  _$jscoverage['/dialog.js'].lineData[386]++;
  for (var r = 0; visit38_386_1(r < rows); r++) {
    _$jscoverage['/dialog.js'].lineData[387]++;
    html += "<tr>";
    _$jscoverage['/dialog.js'].lineData[388]++;
    for (i = 0; visit39_388_1(i < cols); i++) {
      _$jscoverage['/dialog.js'].lineData[389]++;
      html += "<td>" + cellPad + "</td>";
    }
    _$jscoverage['/dialog.js'].lineData[391]++;
    html += "</tr>";
  }
  _$jscoverage['/dialog.js'].lineData[393]++;
  html += "</tbody>";
  _$jscoverage['/dialog.js'].lineData[394]++;
  html += "</table>";
  _$jscoverage['/dialog.js'].lineData[396]++;
  var table = new Node(html, null, editor.get("document")[0]);
  _$jscoverage['/dialog.js'].lineData[397]++;
  editor.insertElement(table);
}, 
  _fillTableDialog: function() {
  _$jscoverage['/dialog.js'].functionData[10]++;
  _$jscoverage['/dialog.js'].lineData[400]++;
  var self = this, d = self.dialog, selectedTable = self.selectedTable, caption = selectedTable.one("caption");
  _$jscoverage['/dialog.js'].lineData[404]++;
  if (visit40_404_1(self.selectedTd)) {
    _$jscoverage['/dialog.js'].lineData[405]++;
    d.cellpadding.val(visit41_406_1(parseInt(self.selectedTd.css("padding")) || "0"));
  }
  _$jscoverage['/dialog.js'].lineData[410]++;
  d.talign.set("value", visit42_410_1(selectedTable.attr("align") || ""));
  _$jscoverage['/dialog.js'].lineData[414]++;
  d.tborder.val(visit43_414_1(selectedTable.attr("border") || "0"));
  _$jscoverage['/dialog.js'].lineData[416]++;
  var w = visit44_416_1(selectedTable.style('width') || ("" + selectedTable.width()));
  _$jscoverage['/dialog.js'].lineData[419]++;
  d.tcollapse[0].checked = selectedTable.hasClass(collapseTableClass, undefined);
  _$jscoverage['/dialog.js'].lineData[422]++;
  d.twidth.val(w.replace(/px|%|(.*pt)/i, ""));
  _$jscoverage['/dialog.js'].lineData[423]++;
  if (visit45_423_1(w.indexOf("%") != -1)) {
    _$jscoverage['/dialog.js'].lineData[424]++;
    d.twidthunit.set("value", "%");
  } else {
    _$jscoverage['/dialog.js'].lineData[426]++;
    d.twidthunit.set("value", "px");
  }
  _$jscoverage['/dialog.js'].lineData[429]++;
  d.theight.val((visit46_429_1(selectedTable.style("height") || "")).replace(/px|%/i, ""));
  _$jscoverage['/dialog.js'].lineData[431]++;
  var c = "";
  _$jscoverage['/dialog.js'].lineData[432]++;
  if (visit47_432_1(caption)) {
    _$jscoverage['/dialog.js'].lineData[433]++;
    c = caption.text();
  }
  _$jscoverage['/dialog.js'].lineData[435]++;
  d.tcaption.val(c);
  _$jscoverage['/dialog.js'].lineData[436]++;
  var head = selectedTable.first("thead"), rowLength = (selectedTable.one("tbody") ? selectedTable.one("tbody").children().length : 0) + (head ? head.children("tr").length : 0);
  _$jscoverage['/dialog.js'].lineData[440]++;
  d.trows.val(rowLength);
  _$jscoverage['/dialog.js'].lineData[441]++;
  d.tcols.val(selectedTable.one("tr") ? selectedTable.one("tr").children().length : 0);
  _$jscoverage['/dialog.js'].lineData[443]++;
  d.thead.set("value", head ? '1' : '');
}, 
  _realTableShow: function() {
  _$jscoverage['/dialog.js'].functionData[11]++;
  _$jscoverage['/dialog.js'].lineData[446]++;
  var self = this, prefixCls = self.editor.get('prefixCls'), d = self.dialog;
  _$jscoverage['/dialog.js'].lineData[450]++;
  if (visit48_450_1(self.selectedTable)) {
    _$jscoverage['/dialog.js'].lineData[451]++;
    self._fillTableDialog();
    _$jscoverage['/dialog.js'].lineData[454]++;
    d.get('el').all(replacePrefix(".{prefixCls}editor-table-create-only", prefixCls)).attr('disabled', 'disabled');
    _$jscoverage['/dialog.js'].lineData[455]++;
    d.thead.set('disabled', true);
  } else {
    _$jscoverage['/dialog.js'].lineData[458]++;
    d.get('el').all(replacePrefix(".{prefixCls}editor-table-create-only", prefixCls)).removeAttr('disabled');
    _$jscoverage['/dialog.js'].lineData[459]++;
    d.thead.set('disabled', false);
  }
  _$jscoverage['/dialog.js'].lineData[461]++;
  if (visit49_461_1(self.selectedTd)) {
    _$jscoverage['/dialog.js'].lineData[462]++;
    d.cellpaddingHolder.show();
  } else {
    _$jscoverage['/dialog.js'].lineData[464]++;
    d.cellpaddingHolder.hide();
  }
  _$jscoverage['/dialog.js'].lineData[466]++;
  self.dialog.show();
}, 
  _prepareTableShow: function() {
  _$jscoverage['/dialog.js'].functionData[12]++;
  _$jscoverage['/dialog.js'].lineData[469]++;
  var self = this;
  _$jscoverage['/dialog.js'].lineData[470]++;
  self._tableInit();
}, 
  show: function(cfg) {
  _$jscoverage['/dialog.js'].functionData[13]++;
  _$jscoverage['/dialog.js'].lineData[473]++;
  var self = this;
  _$jscoverage['/dialog.js'].lineData[474]++;
  S.mix(self, cfg);
  _$jscoverage['/dialog.js'].lineData[475]++;
  self._prepareTableShow();
}, 
  destroy: function() {
  _$jscoverage['/dialog.js'].functionData[14]++;
  _$jscoverage['/dialog.js'].lineData[478]++;
  destroyRes.call(this);
}});
  _$jscoverage['/dialog.js'].lineData[482]++;
  return TableDialog;
});
