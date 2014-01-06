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
  _$jscoverage['/dialog.js'].lineData[8] = 0;
  _$jscoverage['/dialog.js'].lineData[9] = 0;
  _$jscoverage['/dialog.js'].lineData[10] = 0;
  _$jscoverage['/dialog.js'].lineData[11] = 0;
  _$jscoverage['/dialog.js'].lineData[12] = 0;
  _$jscoverage['/dialog.js'].lineData[158] = 0;
  _$jscoverage['/dialog.js'].lineData[159] = 0;
  _$jscoverage['/dialog.js'].lineData[164] = 0;
  _$jscoverage['/dialog.js'].lineData[165] = 0;
  _$jscoverage['/dialog.js'].lineData[168] = 0;
  _$jscoverage['/dialog.js'].lineData[169] = 0;
  _$jscoverage['/dialog.js'].lineData[170] = 0;
  _$jscoverage['/dialog.js'].lineData[171] = 0;
  _$jscoverage['/dialog.js'].lineData[174] = 0;
  _$jscoverage['/dialog.js'].lineData[176] = 0;
  _$jscoverage['/dialog.js'].lineData[187] = 0;
  _$jscoverage['/dialog.js'].lineData[188] = 0;
  _$jscoverage['/dialog.js'].lineData[189] = 0;
  _$jscoverage['/dialog.js'].lineData[190] = 0;
  _$jscoverage['/dialog.js'].lineData[191] = 0;
  _$jscoverage['/dialog.js'].lineData[199] = 0;
  _$jscoverage['/dialog.js'].lineData[200] = 0;
  _$jscoverage['/dialog.js'].lineData[201] = 0;
  _$jscoverage['/dialog.js'].lineData[209] = 0;
  _$jscoverage['/dialog.js'].lineData[210] = 0;
  _$jscoverage['/dialog.js'].lineData[211] = 0;
  _$jscoverage['/dialog.js'].lineData[212] = 0;
  _$jscoverage['/dialog.js'].lineData[214] = 0;
  _$jscoverage['/dialog.js'].lineData[222] = 0;
  _$jscoverage['/dialog.js'].lineData[223] = 0;
  _$jscoverage['/dialog.js'].lineData[225] = 0;
  _$jscoverage['/dialog.js'].lineData[226] = 0;
  _$jscoverage['/dialog.js'].lineData[227] = 0;
  _$jscoverage['/dialog.js'].lineData[229] = 0;
  _$jscoverage['/dialog.js'].lineData[232] = 0;
  _$jscoverage['/dialog.js'].lineData[233] = 0;
  _$jscoverage['/dialog.js'].lineData[237] = 0;
  _$jscoverage['/dialog.js'].lineData[238] = 0;
  _$jscoverage['/dialog.js'].lineData[239] = 0;
  _$jscoverage['/dialog.js'].lineData[245] = 0;
  _$jscoverage['/dialog.js'].lineData[246] = 0;
  _$jscoverage['/dialog.js'].lineData[249] = 0;
  _$jscoverage['/dialog.js'].lineData[250] = 0;
  _$jscoverage['/dialog.js'].lineData[251] = 0;
  _$jscoverage['/dialog.js'].lineData[253] = 0;
  _$jscoverage['/dialog.js'].lineData[254] = 0;
  _$jscoverage['/dialog.js'].lineData[255] = 0;
  _$jscoverage['/dialog.js'].lineData[256] = 0;
  _$jscoverage['/dialog.js'].lineData[258] = 0;
  _$jscoverage['/dialog.js'].lineData[263] = 0;
  _$jscoverage['/dialog.js'].lineData[270] = 0;
  _$jscoverage['/dialog.js'].lineData[271] = 0;
  _$jscoverage['/dialog.js'].lineData[274] = 0;
  _$jscoverage['/dialog.js'].lineData[277] = 0;
  _$jscoverage['/dialog.js'].lineData[278] = 0;
  _$jscoverage['/dialog.js'].lineData[280] = 0;
  _$jscoverage['/dialog.js'].lineData[282] = 0;
  _$jscoverage['/dialog.js'].lineData[283] = 0;
  _$jscoverage['/dialog.js'].lineData[285] = 0;
  _$jscoverage['/dialog.js'].lineData[288] = 0;
  _$jscoverage['/dialog.js'].lineData[289] = 0;
  _$jscoverage['/dialog.js'].lineData[293] = 0;
  _$jscoverage['/dialog.js'].lineData[295] = 0;
  _$jscoverage['/dialog.js'].lineData[296] = 0;
  _$jscoverage['/dialog.js'].lineData[300] = 0;
  _$jscoverage['/dialog.js'].lineData[303] = 0;
  _$jscoverage['/dialog.js'].lineData[304] = 0;
  _$jscoverage['/dialog.js'].lineData[306] = 0;
  _$jscoverage['/dialog.js'].lineData[309] = 0;
  _$jscoverage['/dialog.js'].lineData[310] = 0;
  _$jscoverage['/dialog.js'].lineData[311] = 0;
  _$jscoverage['/dialog.js'].lineData[313] = 0;
  _$jscoverage['/dialog.js'].lineData[314] = 0;
  _$jscoverage['/dialog.js'].lineData[315] = 0;
  _$jscoverage['/dialog.js'].lineData[316] = 0;
  _$jscoverage['/dialog.js'].lineData[321] = 0;
  _$jscoverage['/dialog.js'].lineData[322] = 0;
  _$jscoverage['/dialog.js'].lineData[326] = 0;
  _$jscoverage['/dialog.js'].lineData[327] = 0;
  _$jscoverage['/dialog.js'].lineData[332] = 0;
  _$jscoverage['/dialog.js'].lineData[343] = 0;
  _$jscoverage['/dialog.js'].lineData[344] = 0;
  _$jscoverage['/dialog.js'].lineData[347] = 0;
  _$jscoverage['/dialog.js'].lineData[348] = 0;
  _$jscoverage['/dialog.js'].lineData[351] = 0;
  _$jscoverage['/dialog.js'].lineData[354] = 0;
  _$jscoverage['/dialog.js'].lineData[355] = 0;
  _$jscoverage['/dialog.js'].lineData[358] = 0;
  _$jscoverage['/dialog.js'].lineData[359] = 0;
  _$jscoverage['/dialog.js'].lineData[362] = 0;
  _$jscoverage['/dialog.js'].lineData[363] = 0;
  _$jscoverage['/dialog.js'].lineData[366] = 0;
  _$jscoverage['/dialog.js'].lineData[368] = 0;
  _$jscoverage['/dialog.js'].lineData[369] = 0;
  _$jscoverage['/dialog.js'].lineData[372] = 0;
  _$jscoverage['/dialog.js'].lineData[373] = 0;
  _$jscoverage['/dialog.js'].lineData[375] = 0;
  _$jscoverage['/dialog.js'].lineData[376] = 0;
  _$jscoverage['/dialog.js'].lineData[379] = 0;
  _$jscoverage['/dialog.js'].lineData[380] = 0;
  _$jscoverage['/dialog.js'].lineData[381] = 0;
  _$jscoverage['/dialog.js'].lineData[383] = 0;
  _$jscoverage['/dialog.js'].lineData[384] = 0;
  _$jscoverage['/dialog.js'].lineData[385] = 0;
  _$jscoverage['/dialog.js'].lineData[386] = 0;
  _$jscoverage['/dialog.js'].lineData[387] = 0;
  _$jscoverage['/dialog.js'].lineData[389] = 0;
  _$jscoverage['/dialog.js'].lineData[390] = 0;
  _$jscoverage['/dialog.js'].lineData[391] = 0;
  _$jscoverage['/dialog.js'].lineData[394] = 0;
  _$jscoverage['/dialog.js'].lineData[395] = 0;
  _$jscoverage['/dialog.js'].lineData[396] = 0;
  _$jscoverage['/dialog.js'].lineData[397] = 0;
  _$jscoverage['/dialog.js'].lineData[398] = 0;
  _$jscoverage['/dialog.js'].lineData[400] = 0;
  _$jscoverage['/dialog.js'].lineData[402] = 0;
  _$jscoverage['/dialog.js'].lineData[403] = 0;
  _$jscoverage['/dialog.js'].lineData[405] = 0;
  _$jscoverage['/dialog.js'].lineData[406] = 0;
  _$jscoverage['/dialog.js'].lineData[409] = 0;
  _$jscoverage['/dialog.js'].lineData[413] = 0;
  _$jscoverage['/dialog.js'].lineData[414] = 0;
  _$jscoverage['/dialog.js'].lineData[418] = 0;
  _$jscoverage['/dialog.js'].lineData[421] = 0;
  _$jscoverage['/dialog.js'].lineData[423] = 0;
  _$jscoverage['/dialog.js'].lineData[426] = 0;
  _$jscoverage['/dialog.js'].lineData[429] = 0;
  _$jscoverage['/dialog.js'].lineData[430] = 0;
  _$jscoverage['/dialog.js'].lineData[431] = 0;
  _$jscoverage['/dialog.js'].lineData[433] = 0;
  _$jscoverage['/dialog.js'].lineData[436] = 0;
  _$jscoverage['/dialog.js'].lineData[438] = 0;
  _$jscoverage['/dialog.js'].lineData[439] = 0;
  _$jscoverage['/dialog.js'].lineData[440] = 0;
  _$jscoverage['/dialog.js'].lineData[442] = 0;
  _$jscoverage['/dialog.js'].lineData[443] = 0;
  _$jscoverage['/dialog.js'].lineData[446] = 0;
  _$jscoverage['/dialog.js'].lineData[447] = 0;
  _$jscoverage['/dialog.js'].lineData[449] = 0;
  _$jscoverage['/dialog.js'].lineData[452] = 0;
  _$jscoverage['/dialog.js'].lineData[456] = 0;
  _$jscoverage['/dialog.js'].lineData[457] = 0;
  _$jscoverage['/dialog.js'].lineData[460] = 0;
  _$jscoverage['/dialog.js'].lineData[461] = 0;
  _$jscoverage['/dialog.js'].lineData[464] = 0;
  _$jscoverage['/dialog.js'].lineData[465] = 0;
  _$jscoverage['/dialog.js'].lineData[467] = 0;
  _$jscoverage['/dialog.js'].lineData[468] = 0;
  _$jscoverage['/dialog.js'].lineData[470] = 0;
  _$jscoverage['/dialog.js'].lineData[472] = 0;
  _$jscoverage['/dialog.js'].lineData[475] = 0;
  _$jscoverage['/dialog.js'].lineData[476] = 0;
  _$jscoverage['/dialog.js'].lineData[479] = 0;
  _$jscoverage['/dialog.js'].lineData[480] = 0;
  _$jscoverage['/dialog.js'].lineData[481] = 0;
  _$jscoverage['/dialog.js'].lineData[484] = 0;
  _$jscoverage['/dialog.js'].lineData[488] = 0;
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
  _$jscoverage['/dialog.js'].branchData['11'] = [];
  _$jscoverage['/dialog.js'].branchData['11'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['165'] = [];
  _$jscoverage['/dialog.js'].branchData['165'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['237'] = [];
  _$jscoverage['/dialog.js'].branchData['237'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['240'] = [];
  _$jscoverage['/dialog.js'].branchData['240'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['241'] = [];
  _$jscoverage['/dialog.js'].branchData['241'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['241'][2] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['242'] = [];
  _$jscoverage['/dialog.js'].branchData['242'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['250'] = [];
  _$jscoverage['/dialog.js'].branchData['250'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['255'] = [];
  _$jscoverage['/dialog.js'].branchData['255'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['270'] = [];
  _$jscoverage['/dialog.js'].branchData['270'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['277'] = [];
  _$jscoverage['/dialog.js'].branchData['277'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['282'] = [];
  _$jscoverage['/dialog.js'].branchData['282'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['282'][2] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['288'] = [];
  _$jscoverage['/dialog.js'].branchData['288'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['295'] = [];
  _$jscoverage['/dialog.js'].branchData['295'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['303'] = [];
  _$jscoverage['/dialog.js'].branchData['303'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['309'] = [];
  _$jscoverage['/dialog.js'].branchData['309'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['310'] = [];
  _$jscoverage['/dialog.js'].branchData['310'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['313'] = [];
  _$jscoverage['/dialog.js'].branchData['313'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['315'] = [];
  _$jscoverage['/dialog.js'].branchData['315'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['326'] = [];
  _$jscoverage['/dialog.js'].branchData['326'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['336'] = [];
  _$jscoverage['/dialog.js'].branchData['336'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['337'] = [];
  _$jscoverage['/dialog.js'].branchData['337'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['343'] = [];
  _$jscoverage['/dialog.js'].branchData['343'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['347'] = [];
  _$jscoverage['/dialog.js'].branchData['347'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['354'] = [];
  _$jscoverage['/dialog.js'].branchData['354'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['358'] = [];
  _$jscoverage['/dialog.js'].branchData['358'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['362'] = [];
  _$jscoverage['/dialog.js'].branchData['362'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['368'] = [];
  _$jscoverage['/dialog.js'].branchData['368'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['368'][2] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['372'] = [];
  _$jscoverage['/dialog.js'].branchData['372'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['375'] = [];
  _$jscoverage['/dialog.js'].branchData['375'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['380'] = [];
  _$jscoverage['/dialog.js'].branchData['380'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['383'] = [];
  _$jscoverage['/dialog.js'].branchData['383'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['386'] = [];
  _$jscoverage['/dialog.js'].branchData['386'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['395'] = [];
  _$jscoverage['/dialog.js'].branchData['395'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['397'] = [];
  _$jscoverage['/dialog.js'].branchData['397'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['413'] = [];
  _$jscoverage['/dialog.js'].branchData['413'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['415'] = [];
  _$jscoverage['/dialog.js'].branchData['415'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['418'] = [];
  _$jscoverage['/dialog.js'].branchData['418'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['421'] = [];
  _$jscoverage['/dialog.js'].branchData['421'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['423'] = [];
  _$jscoverage['/dialog.js'].branchData['423'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['430'] = [];
  _$jscoverage['/dialog.js'].branchData['430'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['436'] = [];
  _$jscoverage['/dialog.js'].branchData['436'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['439'] = [];
  _$jscoverage['/dialog.js'].branchData['439'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['456'] = [];
  _$jscoverage['/dialog.js'].branchData['456'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['467'] = [];
  _$jscoverage['/dialog.js'].branchData['467'][1] = new BranchData();
}
_$jscoverage['/dialog.js'].branchData['467'][1].init(660, 15, 'self.selectedTd');
function visit47_467_1(result) {
  _$jscoverage['/dialog.js'].branchData['467'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['456'][1].init(138, 18, 'self.selectedTable');
function visit46_456_1(result) {
  _$jscoverage['/dialog.js'].branchData['456'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['439'][1].init(1069, 7, 'caption');
function visit45_439_1(result) {
  _$jscoverage['/dialog.js'].branchData['439'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['436'][1].init(-1, 35, 'selectedTable.style(\'height\') || \'\'');
function visit44_436_1(result) {
  _$jscoverage['/dialog.js'].branchData['436'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['430'][1].init(767, 21, 'w.indexOf(\'%\') !== -1');
function visit43_430_1(result) {
  _$jscoverage['/dialog.js'].branchData['430'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['423'][1].init(501, 76, 'selectedTable.style(\'width\') || (\'\' + selectedTable.width())');
function visit42_423_1(result) {
  _$jscoverage['/dialog.js'].branchData['423'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['421'][1].init(427, 51, 'selectedTable.attr(\'border\') || \'0\'');
function visit41_421_1(result) {
  _$jscoverage['/dialog.js'].branchData['421'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['418'][1].init(363, 33, 'selectedTable.attr(\'align\') || \'\'');
function visit40_418_1(result) {
  _$jscoverage['/dialog.js'].branchData['418'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['415'][1].init(38, 50, 'parseInt(self.selectedTd.css(\'padding\'), 10) || \'0\'');
function visit39_415_1(result) {
  _$jscoverage['/dialog.js'].branchData['415'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['413'][1].init(187, 15, 'self.selectedTd');
function visit38_413_1(result) {
  _$jscoverage['/dialog.js'].branchData['413'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['397'][1].init(61, 8, 'i < cols');
function visit37_397_1(result) {
  _$jscoverage['/dialog.js'].branchData['397'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['395'][1].init(2070, 8, 'r < rows');
function visit36_395_1(result) {
  _$jscoverage['/dialog.js'].branchData['395'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['386'][1].init(96, 8, 'i < cols');
function visit35_386_1(result) {
  _$jscoverage['/dialog.js'].branchData['386'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['383'][1].init(1690, 20, 'd.thead.get(\'value\')');
function visit34_383_1(result) {
  _$jscoverage['/dialog.js'].branchData['383'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['380'][1].init(1529, 23, 'valid(d.tcaption.val())');
function visit33_380_1(result) {
  _$jscoverage['/dialog.js'].branchData['380'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['375'][1].init(1393, 14, 'classes.length');
function visit32_375_1(result) {
  _$jscoverage['/dialog.js'].branchData['375'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['372'][1].init(1287, 22, 'd.tcollapse[0].checked');
function visit31_372_1(result) {
  _$jscoverage['/dialog.js'].branchData['372'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['368'][2].init(1164, 37, 'String(trim(d.tborder.val())) === \'0\'');
function visit30_368_2(result) {
  _$jscoverage['/dialog.js'].branchData['368'][2].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['368'][1].init(1137, 64, '!valid(d.tborder.val()) || String(trim(d.tborder.val())) === \'0\'');
function visit29_368_1(result) {
  _$jscoverage['/dialog.js'].branchData['368'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['362'][1].init(998, 13, 'styles.length');
function visit28_362_1(result) {
  _$jscoverage['/dialog.js'].branchData['362'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['358'][1].init(869, 22, 'valid(d.theight.val())');
function visit27_358_1(result) {
  _$jscoverage['/dialog.js'].branchData['358'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['354'][1].init(717, 21, 'valid(d.twidth.val())');
function visit26_354_1(result) {
  _$jscoverage['/dialog.js'].branchData['354'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['347'][1].init(562, 22, 'valid(d.tborder.val())');
function visit25_347_1(result) {
  _$jscoverage['/dialog.js'].branchData['347'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['343'][1].init(427, 28, 'valid(d.talign.get(\'value\'))');
function visit24_343_1(result) {
  _$jscoverage['/dialog.js'].branchData['343'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['337'][1].init(181, 31, 'parseInt(d.trows.val(), 10) || 1');
function visit23_337_1(result) {
  _$jscoverage['/dialog.js'].branchData['337'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['336'][1].init(125, 31, 'parseInt(d.tcols.val(), 10) || 1');
function visit22_336_1(result) {
  _$jscoverage['/dialog.js'].branchData['336'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['326'][1].init(2459, 7, 'caption');
function visit21_326_1(result) {
  _$jscoverage['/dialog.js'].branchData['326'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['315'][1].init(85, 21, 'caption && caption[0]');
function visit20_315_1(result) {
  _$jscoverage['/dialog.js'].branchData['315'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['313'][1].init(1801, 23, 'valid(d.tcaption.val())');
function visit19_313_1(result) {
  _$jscoverage['/dialog.js'].branchData['313'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['310'][1].init(1683, 15, 'self.selectedTd');
function visit18_310_1(result) {
  _$jscoverage['/dialog.js'].branchData['310'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['309'][1].init(1627, 37, 'parseInt(d.cellpadding.val(), 10) || 0');
function visit17_309_1(result) {
  _$jscoverage['/dialog.js'].branchData['309'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['303'][1].init(1390, 22, 'd.tcollapse[0].checked');
function visit16_303_1(result) {
  _$jscoverage['/dialog.js'].branchData['303'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['295'][1].init(1163, 22, 'valid(d.theight.val())');
function visit15_295_1(result) {
  _$jscoverage['/dialog.js'].branchData['295'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['288'][1].init(913, 21, 'valid(d.twidth.val())');
function visit14_288_1(result) {
  _$jscoverage['/dialog.js'].branchData['288'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['282'][2].init(692, 18, 'tborderVal === \'0\'');
function visit13_282_2(result) {
  _$jscoverage['/dialog.js'].branchData['282'][2].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['282'][1].init(670, 40, '!valid(tborderVal) || tborderVal === \'0\'');
function visit12_282_1(result) {
  _$jscoverage['/dialog.js'].branchData['282'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['277'][1].init(482, 17, 'valid(tborderVal)');
function visit11_277_1(result) {
  _$jscoverage['/dialog.js'].branchData['277'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['270'][1].init(285, 16, 'valid(talignVal)');
function visit10_270_1(result) {
  _$jscoverage['/dialog.js'].branchData['270'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['255'][1].init(21, 19, '!self.selectedTable');
function visit9_255_1(result) {
  _$jscoverage['/dialog.js'].branchData['255'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['250'][1].init(640, 3, '!re');
function visit8_250_1(result) {
  _$jscoverage['/dialog.js'].branchData['250'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['242'][1].init(39, 6, 'tw < 0');
function visit7_242_1(result) {
  _$jscoverage['/dialog.js'].branchData['242'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['241'][2].init(33, 8, 'tw > 100');
function visit6_241_2(result) {
  _$jscoverage['/dialog.js'].branchData['241'][2].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['241'][1].init(-1, 46, 'tw > 100 || tw < 0');
function visit5_241_1(result) {
  _$jscoverage['/dialog.js'].branchData['241'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['240'][1].init(24, 105, '!tw || (tw > 100 || tw < 0)');
function visit4_240_1(result) {
  _$jscoverage['/dialog.js'].branchData['240'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['237'][1].init(174, 43, 'tableDialog.twidthunit.get(\'value\') === \'%\'');
function visit3_237_1(result) {
  _$jscoverage['/dialog.js'].branchData['237'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['165'][1].init(16, 22, 'trim(str).length !== 0');
function visit2_165_1(result) {
  _$jscoverage['/dialog.js'].branchData['165'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['11'][1].init(163, 16, 'S.UA.ieMode < 11');
function visit1_11_1(result) {
  _$jscoverage['/dialog.js'].branchData['11'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/dialog.js'].functionData[0]++;
  _$jscoverage['/dialog.js'].lineData[8]++;
  var Editor = require('editor');
  _$jscoverage['/dialog.js'].lineData[9]++;
  var Dialog4E = require('../dialog');
  _$jscoverage['/dialog.js'].lineData[10]++;
  var MenuButton = require('../menubutton');
  _$jscoverage['/dialog.js'].lineData[11]++;
  var OLD_IE = visit1_11_1(S.UA.ieMode < 11);
  _$jscoverage['/dialog.js'].lineData[12]++;
  var Node = S.Node, Dom = S.DOM, trim = S.trim, showBorderClassName = 'ke_show_border', collapseTableClass = 'k-e-collapse-table', IN_SIZE = 6, alignStyle = 'margin:0 5px 0 0;', TABLE_HTML = '<div style="padding:20px 20px 10px 20px;">' + '<table class="{prefixCls}editor-table-config" style="width:100%">' + '<tr>' + '<td>' + '<label>\u884c\u6570\uff1a ' + '<input ' + ' data-verify="^(?!0$)\\d+$" ' + ' data-warning="\u884c\u6570\u8bf7\u8f93\u5165\u6b63\u6574\u6570" ' + ' value="2" ' + ' class="{prefixCls}editor-table-rows {prefixCls}editor-table-create-only {prefixCls}editor-input" ' + 'style="' + alignStyle + '"' + ' size="' + IN_SIZE + '"' + ' />' + '</label>' + '</td>' + '<td>' + '<label>\u5bbd&nbsp;&nbsp;&nbsp;\u5ea6\uff1a ' + '</label> ' + '<input ' + ' data-verify="^(?!0$)\\d+$" ' + ' data-warning="\u5bbd\u5ea6\u8bf7\u8f93\u5165\u6b63\u6574\u6570" ' + 'value="200" ' + 'style="' + alignStyle + '" ' + 'class="{prefixCls}editor-table-width {prefixCls}editor-input" ' + 'size="' + IN_SIZE + '"/>' + '<select class="{prefixCls}editor-table-width-unit" title="\u5bbd\u5ea6\u5355\u4f4d">' + '<option value="px">\u50cf\u7d20</option>' + '<option value="%">\u767e\u5206\u6bd4</option>' + '</select>' + '</td>' + '</tr>' + '<tr>' + '<td>' + '<label>\u5217\u6570\uff1a ' + '<input ' + ' data-verify="^(?!0$)\\d+$" ' + ' data-warning="\u5217\u6570\u8bf7\u8f93\u5165\u6b63\u6574\u6570" ' + 'class="{prefixCls}editor-table-cols {prefixCls}editor-table-create-only {prefixCls}editor-input" ' + 'style="' + alignStyle + '"' + 'value="3" ' + 'size="' + IN_SIZE + '"/>' + '</label>' + '</td>' + '<td>' + '<label>' + '\u9ad8&nbsp;&nbsp;&nbsp;\u5ea6\uff1a ' + '</label>' + '<input ' + ' data-verify="^((?!0$)\\d+)?$" ' + ' data-warning="\u9ad8\u5ea6\u8bf7\u8f93\u5165\u6b63\u6574\u6570" ' + 'value="" ' + 'style="' + alignStyle + '"' + 'class="{prefixCls}editor-table-height {prefixCls}editor-input" ' + 'size="' + IN_SIZE + '"/>' + ' &nbsp;\u50cf\u7d20' + '</td>' + '</tr>' + '<tr>' + '<td>' + '<label>\u5bf9\u9f50\uff1a </label>' + '<select class="{prefixCls}editor-table-align" title="\u5bf9\u9f50">' + '<option value="">\u65e0</option>' + '<option value="left">\u5de6\u5bf9\u9f50</option>' + '<option value="right">\u53f3\u5bf9\u9f50</option>' + '<option value="center">\u4e2d\u95f4\u5bf9\u9f50</option>' + '</select>' + '</td>' + '<td>' + '<label>\u6807\u9898\u683c\uff1a</label> ' + '<select class="{prefixCls}editor-table-head {prefixCls}editor-table-create-only" title="\u6807\u9898\u683c">' + '<option value="">\u65e0</option>' + '<option value="1">\u6709</option>' + '</select>' + '</td>' + '</tr>' + '<tr>' + '<td>' + '<label>\u8fb9\u6846\uff1a ' + '<input ' + ' data-verify="^\\d+$" ' + ' data-warning="\u8fb9\u6846\u8bf7\u8f93\u5165\u975e\u8d1f\u6574\u6570" ' + 'value="1" ' + 'style="' + alignStyle + '"' + 'class="{prefixCls}editor-table-border {prefixCls}editor-input" ' + 'size="' + IN_SIZE + '"/>' + '</label> &nbsp;\u50cf\u7d20' + ' ' + '<label><input ' + 'type="checkbox" ' + 'style="vertical-align: middle; margin-left: 5px;" ' + 'class="{prefixCls}editor-table-collapse" ' + '/> \u5408\u5e76\u8fb9\u6846' + '</label>' + '</td>' + '<td>' + '<label ' + 'class="{prefixCls}editor-table-cellpadding-holder"' + '>\u8fb9&nbsp;&nbsp;&nbsp;\u8ddd\uff1a ' + '<input ' + ' data-verify="^(\\d+)?$" ' + ' data-warning="\u8fb9\u6846\u8bf7\u8f93\u5165\u975e\u8d1f\u6574\u6570" ' + 'value="0" ' + 'style="' + alignStyle + '"' + 'class="{prefixCls}editor-table-cellpadding {prefixCls}editor-input" ' + 'size="' + IN_SIZE + '"/>' + ' &nbsp;\u50cf\u7d20</label>' + '</td>' + '</tr>' + '<tr>' + '<td colspan="2">' + '<label>' + '\u6807\u9898\uff1a ' + '<input ' + 'class="{prefixCls}editor-table-caption {prefixCls}editor-input" ' + 'style="width:380px;' + alignStyle + '">' + '</label>' + '</td>' + '</tr>' + '</table>' + '</div>', footHTML = '<div style="padding:5px 20px 20px;">' + '<a ' + 'class="{prefixCls}editor-table-ok {prefixCls}editor-button ks-inline-block" ' + 'style="margin-right:20px;">\u786e\u5b9a</a> ' + '<a ' + 'class="{prefixCls}editor-table-cancel {prefixCls}editor-button ks-inline-block">\u53d6\u6d88</a>' + '</div>', addRes = Editor.Utils.addRes, destroyRes = Editor.Utils.destroyRes;
  _$jscoverage['/dialog.js'].lineData[158]++;
  function replacePrefix(str, prefix) {
    _$jscoverage['/dialog.js'].functionData[1]++;
    _$jscoverage['/dialog.js'].lineData[159]++;
    return S.substitute(str, {
  prefixCls: prefix});
  }
  _$jscoverage['/dialog.js'].lineData[164]++;
  function valid(str) {
    _$jscoverage['/dialog.js'].functionData[2]++;
    _$jscoverage['/dialog.js'].lineData[165]++;
    return visit2_165_1(trim(str).length !== 0);
  }
  _$jscoverage['/dialog.js'].lineData[168]++;
  function TableDialog(editor) {
    _$jscoverage['/dialog.js'].functionData[3]++;
    _$jscoverage['/dialog.js'].lineData[169]++;
    var self = this;
    _$jscoverage['/dialog.js'].lineData[170]++;
    self.editor = editor;
    _$jscoverage['/dialog.js'].lineData[171]++;
    Editor.Utils.lazyRun(self, '_prepareTableShow', '_realTableShow');
  }
  _$jscoverage['/dialog.js'].lineData[174]++;
  S.augment(TableDialog, {
  _tableInit: function() {
  _$jscoverage['/dialog.js'].functionData[4]++;
  _$jscoverage['/dialog.js'].lineData[176]++;
  var self = this, prefixCls = self.editor.get('prefixCls'), d = new Dialog4E({
  width: '500px', 
  mask: true, 
  headerContent: '\u8868\u683c', 
  bodyContent: replacePrefix(TABLE_HTML, prefixCls), 
  footerContent: replacePrefix(footHTML, prefixCls)}).render(), dbody = d.get('body'), foot = d.get('footer');
  _$jscoverage['/dialog.js'].lineData[187]++;
  d.twidth = dbody.one(replacePrefix('.{prefixCls}editor-table-width', prefixCls));
  _$jscoverage['/dialog.js'].lineData[188]++;
  d.theight = dbody.one(replacePrefix('.{prefixCls}editor-table-height', prefixCls));
  _$jscoverage['/dialog.js'].lineData[189]++;
  d.tborder = dbody.one(replacePrefix('.{prefixCls}editor-table-border', prefixCls));
  _$jscoverage['/dialog.js'].lineData[190]++;
  d.tcaption = dbody.one(replacePrefix('.{prefixCls}editor-table-caption', prefixCls));
  _$jscoverage['/dialog.js'].lineData[191]++;
  d.talign = MenuButton.Select.decorate(dbody.one(replacePrefix('.{prefixCls}editor-table-align', prefixCls)), {
  prefixCls: replacePrefix('{prefixCls}editor-big-', prefixCls), 
  width: 80, 
  menuCfg: {
  prefixCls: replacePrefix('{prefixCls}editor-', prefixCls), 
  render: dbody}});
  _$jscoverage['/dialog.js'].lineData[199]++;
  d.trows = dbody.one(replacePrefix('.{prefixCls}editor-table-rows', prefixCls));
  _$jscoverage['/dialog.js'].lineData[200]++;
  d.tcols = dbody.one(replacePrefix('.{prefixCls}editor-table-cols', prefixCls));
  _$jscoverage['/dialog.js'].lineData[201]++;
  d.thead = MenuButton.Select.decorate(dbody.one(replacePrefix('.{prefixCls}editor-table-head', prefixCls)), {
  prefixCls: replacePrefix('{prefixCls}editor-big-', prefixCls), 
  width: 80, 
  menuCfg: {
  prefixCls: replacePrefix('{prefixCls}editor-', prefixCls), 
  render: dbody}});
  _$jscoverage['/dialog.js'].lineData[209]++;
  d.cellpaddingHolder = dbody.one(replacePrefix('.{prefixCls}editor-table-cellpadding-holder', prefixCls));
  _$jscoverage['/dialog.js'].lineData[210]++;
  d.cellpadding = dbody.one(replacePrefix('.{prefixCls}editor-table-cellpadding', prefixCls));
  _$jscoverage['/dialog.js'].lineData[211]++;
  d.tcollapse = dbody.one(replacePrefix('.{prefixCls}editor-table-collapse', prefixCls));
  _$jscoverage['/dialog.js'].lineData[212]++;
  var tok = foot.one(replacePrefix('.{prefixCls}editor-table-ok', prefixCls)), tclose = foot.one(replacePrefix('.{prefixCls}editor-table-cancel', prefixCls));
  _$jscoverage['/dialog.js'].lineData[214]++;
  d.twidthunit = MenuButton.Select.decorate(dbody.one(replacePrefix('.{prefixCls}editor-table-width-unit', prefixCls)), {
  prefixCls: replacePrefix('{prefixCls}editor-big-', prefixCls), 
  width: 80, 
  menuCfg: {
  prefixCls: replacePrefix('{prefixCls}editor-', prefixCls), 
  render: dbody}});
  _$jscoverage['/dialog.js'].lineData[222]++;
  self.dialog = d;
  _$jscoverage['/dialog.js'].lineData[223]++;
  tok.on('click', self._tableOk, self);
  _$jscoverage['/dialog.js'].lineData[225]++;
  tclose.on('click', function(ev) {
  _$jscoverage['/dialog.js'].functionData[5]++;
  _$jscoverage['/dialog.js'].lineData[226]++;
  ev.halt();
  _$jscoverage['/dialog.js'].lineData[227]++;
  d.hide();
});
  _$jscoverage['/dialog.js'].lineData[229]++;
  addRes.call(self, d, d.twidthunit, tok, tclose);
}, 
  _tableOk: function(ev) {
  _$jscoverage['/dialog.js'].functionData[6]++;
  _$jscoverage['/dialog.js'].lineData[232]++;
  ev.halt();
  _$jscoverage['/dialog.js'].lineData[233]++;
  var self = this, tableDialog = self.dialog, inputs = tableDialog.get('el').all('input');
  _$jscoverage['/dialog.js'].lineData[237]++;
  if (visit3_237_1(tableDialog.twidthunit.get('value') === '%')) {
    _$jscoverage['/dialog.js'].lineData[238]++;
    var tw = parseInt(tableDialog.twidth.val(), 10);
    _$jscoverage['/dialog.js'].lineData[239]++;
    if (visit4_240_1(!tw || (visit5_241_1(visit6_241_2(tw > 100) || visit7_242_1(tw < 0))))) {
      _$jscoverage['/dialog.js'].lineData[245]++;
      alert('\u5bbd\u5ea6\u767e\u5206\u6bd4\uff1a' + '\u8bf7\u8f93\u51651-100\u4e4b\u95f4');
      _$jscoverage['/dialog.js'].lineData[246]++;
      return;
    }
  }
  _$jscoverage['/dialog.js'].lineData[249]++;
  var re = Editor.Utils.verifyInputs(inputs);
  _$jscoverage['/dialog.js'].lineData[250]++;
  if (visit8_250_1(!re)) {
    _$jscoverage['/dialog.js'].lineData[251]++;
    return;
  }
  _$jscoverage['/dialog.js'].lineData[253]++;
  self.dialog.hide();
  _$jscoverage['/dialog.js'].lineData[254]++;
  setTimeout(function() {
  _$jscoverage['/dialog.js'].functionData[7]++;
  _$jscoverage['/dialog.js'].lineData[255]++;
  if (visit9_255_1(!self.selectedTable)) {
    _$jscoverage['/dialog.js'].lineData[256]++;
    self._genTable();
  } else {
    _$jscoverage['/dialog.js'].lineData[258]++;
    self._modifyTable();
  }
}, 0);
}, 
  _modifyTable: function() {
  _$jscoverage['/dialog.js'].functionData[8]++;
  _$jscoverage['/dialog.js'].lineData[263]++;
  var self = this, d = self.dialog, selectedTable = self.selectedTable, caption = selectedTable.one('caption'), talignVal = d.talign.get('value'), tborderVal = d.tborder.val();
  _$jscoverage['/dialog.js'].lineData[270]++;
  if (visit10_270_1(valid(talignVal))) {
    _$jscoverage['/dialog.js'].lineData[271]++;
    selectedTable.attr('align', trim(talignVal));
  } else {
    _$jscoverage['/dialog.js'].lineData[274]++;
    selectedTable.removeAttr('align');
  }
  _$jscoverage['/dialog.js'].lineData[277]++;
  if (visit11_277_1(valid(tborderVal))) {
    _$jscoverage['/dialog.js'].lineData[278]++;
    selectedTable.attr('border', trim(tborderVal));
  } else {
    _$jscoverage['/dialog.js'].lineData[280]++;
    selectedTable.removeAttr('border');
  }
  _$jscoverage['/dialog.js'].lineData[282]++;
  if (visit12_282_1(!valid(tborderVal) || visit13_282_2(tborderVal === '0'))) {
    _$jscoverage['/dialog.js'].lineData[283]++;
    selectedTable.addClass(showBorderClassName, undefined);
  } else {
    _$jscoverage['/dialog.js'].lineData[285]++;
    selectedTable.removeClass(showBorderClassName, undefined);
  }
  _$jscoverage['/dialog.js'].lineData[288]++;
  if (visit14_288_1(valid(d.twidth.val()))) {
    _$jscoverage['/dialog.js'].lineData[289]++;
    selectedTable.css('width', trim(d.twidth.val()) + d.twidthunit.get('value'));
  } else {
    _$jscoverage['/dialog.js'].lineData[293]++;
    selectedTable.css('width', '');
  }
  _$jscoverage['/dialog.js'].lineData[295]++;
  if (visit15_295_1(valid(d.theight.val()))) {
    _$jscoverage['/dialog.js'].lineData[296]++;
    selectedTable.css('height', trim(d.theight.val()));
  } else {
    _$jscoverage['/dialog.js'].lineData[300]++;
    selectedTable.css('height', '');
  }
  _$jscoverage['/dialog.js'].lineData[303]++;
  if (visit16_303_1(d.tcollapse[0].checked)) {
    _$jscoverage['/dialog.js'].lineData[304]++;
    selectedTable.addClass(collapseTableClass, undefined);
  } else {
    _$jscoverage['/dialog.js'].lineData[306]++;
    selectedTable.removeClass(collapseTableClass, undefined);
  }
  _$jscoverage['/dialog.js'].lineData[309]++;
  d.cellpadding.val(visit17_309_1(parseInt(d.cellpadding.val(), 10) || 0));
  _$jscoverage['/dialog.js'].lineData[310]++;
  if (visit18_310_1(self.selectedTd)) {
    _$jscoverage['/dialog.js'].lineData[311]++;
    self.selectedTd.css('padding', d.cellpadding.val());
  }
  _$jscoverage['/dialog.js'].lineData[313]++;
  if (visit19_313_1(valid(d.tcaption.val()))) {
    _$jscoverage['/dialog.js'].lineData[314]++;
    var tcv = S.escapeHtml(trim(d.tcaption.val()));
    _$jscoverage['/dialog.js'].lineData[315]++;
    if (visit20_315_1(caption && caption[0])) {
      _$jscoverage['/dialog.js'].lineData[316]++;
      caption.html(tcv);
    } else {
      _$jscoverage['/dialog.js'].lineData[321]++;
      var c = selectedTable[0].createCaption();
      _$jscoverage['/dialog.js'].lineData[322]++;
      Dom.html(c, '<span>' + tcv + '</span>');
    }
  } else {
    _$jscoverage['/dialog.js'].lineData[326]++;
    if (visit21_326_1(caption)) {
      _$jscoverage['/dialog.js'].lineData[327]++;
      caption.remove();
    }
  }
}, 
  _genTable: function() {
  _$jscoverage['/dialog.js'].functionData[9]++;
  _$jscoverage['/dialog.js'].lineData[332]++;
  var self = this, d = self.dialog, html = '<table ', i, cols = visit22_336_1(parseInt(d.tcols.val(), 10) || 1), rows = visit23_337_1(parseInt(d.trows.val(), 10) || 1), cellPad = OLD_IE ? '' : '<br/>', editor = self.editor;
  _$jscoverage['/dialog.js'].lineData[343]++;
  if (visit24_343_1(valid(d.talign.get('value')))) {
    _$jscoverage['/dialog.js'].lineData[344]++;
    html += 'align="' + trim(d.talign.get('value')) + '" ';
  }
  _$jscoverage['/dialog.js'].lineData[347]++;
  if (visit25_347_1(valid(d.tborder.val()))) {
    _$jscoverage['/dialog.js'].lineData[348]++;
    html += 'border="' + trim(d.tborder.val()) + '" ';
  }
  _$jscoverage['/dialog.js'].lineData[351]++;
  var styles = [];
  _$jscoverage['/dialog.js'].lineData[354]++;
  if (visit26_354_1(valid(d.twidth.val()))) {
    _$jscoverage['/dialog.js'].lineData[355]++;
    styles.push('width:' + trim(d.twidth.val()) + d.twidthunit.get('value') + ';');
  }
  _$jscoverage['/dialog.js'].lineData[358]++;
  if (visit27_358_1(valid(d.theight.val()))) {
    _$jscoverage['/dialog.js'].lineData[359]++;
    styles.push('height:' + trim(d.theight.val()) + 'px;');
  }
  _$jscoverage['/dialog.js'].lineData[362]++;
  if (visit28_362_1(styles.length)) {
    _$jscoverage['/dialog.js'].lineData[363]++;
    html += 'style="' + styles.join('') + '" ';
  }
  _$jscoverage['/dialog.js'].lineData[366]++;
  var classes = [];
  _$jscoverage['/dialog.js'].lineData[368]++;
  if (visit29_368_1(!valid(d.tborder.val()) || visit30_368_2(String(trim(d.tborder.val())) === '0'))) {
    _$jscoverage['/dialog.js'].lineData[369]++;
    classes.push(showBorderClassName);
  }
  _$jscoverage['/dialog.js'].lineData[372]++;
  if (visit31_372_1(d.tcollapse[0].checked)) {
    _$jscoverage['/dialog.js'].lineData[373]++;
    classes.push(collapseTableClass);
  }
  _$jscoverage['/dialog.js'].lineData[375]++;
  if (visit32_375_1(classes.length)) {
    _$jscoverage['/dialog.js'].lineData[376]++;
    html += 'class="' + classes.join(' ') + '" ';
  }
  _$jscoverage['/dialog.js'].lineData[379]++;
  html += '>';
  _$jscoverage['/dialog.js'].lineData[380]++;
  if (visit33_380_1(valid(d.tcaption.val()))) {
    _$jscoverage['/dialog.js'].lineData[381]++;
    html += '<caption><span>' + S.escapeHtml(trim(d.tcaption.val())) + '</span></caption>';
  }
  _$jscoverage['/dialog.js'].lineData[383]++;
  if (visit34_383_1(d.thead.get('value'))) {
    _$jscoverage['/dialog.js'].lineData[384]++;
    html += '<thead>';
    _$jscoverage['/dialog.js'].lineData[385]++;
    html += '<tr>';
    _$jscoverage['/dialog.js'].lineData[386]++;
    for (i = 0; visit35_386_1(i < cols); i++) {
      _$jscoverage['/dialog.js'].lineData[387]++;
      html += '<th>' + cellPad + '</th>';
    }
    _$jscoverage['/dialog.js'].lineData[389]++;
    html += '</tr>';
    _$jscoverage['/dialog.js'].lineData[390]++;
    html += '</thead>';
    _$jscoverage['/dialog.js'].lineData[391]++;
    rows -= 1;
  }
  _$jscoverage['/dialog.js'].lineData[394]++;
  html += '<tbody>';
  _$jscoverage['/dialog.js'].lineData[395]++;
  for (var r = 0; visit36_395_1(r < rows); r++) {
    _$jscoverage['/dialog.js'].lineData[396]++;
    html += '<tr>';
    _$jscoverage['/dialog.js'].lineData[397]++;
    for (i = 0; visit37_397_1(i < cols); i++) {
      _$jscoverage['/dialog.js'].lineData[398]++;
      html += '<td>' + cellPad + '</td>';
    }
    _$jscoverage['/dialog.js'].lineData[400]++;
    html += '</tr>';
  }
  _$jscoverage['/dialog.js'].lineData[402]++;
  html += '</tbody>';
  _$jscoverage['/dialog.js'].lineData[403]++;
  html += '</table>';
  _$jscoverage['/dialog.js'].lineData[405]++;
  var table = new Node(html, null, editor.get('document')[0]);
  _$jscoverage['/dialog.js'].lineData[406]++;
  editor.insertElement(table);
}, 
  _fillTableDialog: function() {
  _$jscoverage['/dialog.js'].functionData[10]++;
  _$jscoverage['/dialog.js'].lineData[409]++;
  var self = this, d = self.dialog, selectedTable = self.selectedTable, caption = selectedTable.one('caption');
  _$jscoverage['/dialog.js'].lineData[413]++;
  if (visit38_413_1(self.selectedTd)) {
    _$jscoverage['/dialog.js'].lineData[414]++;
    d.cellpadding.val(visit39_415_1(parseInt(self.selectedTd.css('padding'), 10) || '0'));
  }
  _$jscoverage['/dialog.js'].lineData[418]++;
  d.talign.set('value', visit40_418_1(selectedTable.attr('align') || ''));
  _$jscoverage['/dialog.js'].lineData[421]++;
  d.tborder.val(visit41_421_1(selectedTable.attr('border') || '0'));
  _$jscoverage['/dialog.js'].lineData[423]++;
  var w = visit42_423_1(selectedTable.style('width') || ('' + selectedTable.width()));
  _$jscoverage['/dialog.js'].lineData[426]++;
  d.tcollapse[0].checked = selectedTable.hasClass(collapseTableClass, undefined);
  _$jscoverage['/dialog.js'].lineData[429]++;
  d.twidth.val(w.replace(/px|%|(.*pt)/i, ''));
  _$jscoverage['/dialog.js'].lineData[430]++;
  if (visit43_430_1(w.indexOf('%') !== -1)) {
    _$jscoverage['/dialog.js'].lineData[431]++;
    d.twidthunit.set('value', '%');
  } else {
    _$jscoverage['/dialog.js'].lineData[433]++;
    d.twidthunit.set('value', 'px');
  }
  _$jscoverage['/dialog.js'].lineData[436]++;
  d.theight.val((visit44_436_1(selectedTable.style('height') || '')).replace(/px|%/i, ''));
  _$jscoverage['/dialog.js'].lineData[438]++;
  var c = '';
  _$jscoverage['/dialog.js'].lineData[439]++;
  if (visit45_439_1(caption)) {
    _$jscoverage['/dialog.js'].lineData[440]++;
    c = caption.text();
  }
  _$jscoverage['/dialog.js'].lineData[442]++;
  d.tcaption.val(c);
  _$jscoverage['/dialog.js'].lineData[443]++;
  var head = selectedTable.first('thead'), rowLength = (selectedTable.one('tbody') ? selectedTable.one('tbody').children().length : 0) + (head ? head.children('tr').length : 0);
  _$jscoverage['/dialog.js'].lineData[446]++;
  d.trows.val(rowLength);
  _$jscoverage['/dialog.js'].lineData[447]++;
  d.tcols.val(selectedTable.one('tr') ? selectedTable.one('tr').children().length : 0);
  _$jscoverage['/dialog.js'].lineData[449]++;
  d.thead.set('value', head ? '1' : '');
}, 
  _realTableShow: function() {
  _$jscoverage['/dialog.js'].functionData[11]++;
  _$jscoverage['/dialog.js'].lineData[452]++;
  var self = this, prefixCls = self.editor.get('prefixCls'), d = self.dialog;
  _$jscoverage['/dialog.js'].lineData[456]++;
  if (visit46_456_1(self.selectedTable)) {
    _$jscoverage['/dialog.js'].lineData[457]++;
    self._fillTableDialog();
    _$jscoverage['/dialog.js'].lineData[460]++;
    d.get('el').all(replacePrefix('.{prefixCls}editor-table-create-only', prefixCls)).attr('disabled', 'disabled');
    _$jscoverage['/dialog.js'].lineData[461]++;
    d.thead.set('disabled', true);
  } else {
    _$jscoverage['/dialog.js'].lineData[464]++;
    d.get('el').all(replacePrefix('.{prefixCls}editor-table-create-only', prefixCls)).removeAttr('disabled');
    _$jscoverage['/dialog.js'].lineData[465]++;
    d.thead.set('disabled', false);
  }
  _$jscoverage['/dialog.js'].lineData[467]++;
  if (visit47_467_1(self.selectedTd)) {
    _$jscoverage['/dialog.js'].lineData[468]++;
    d.cellpaddingHolder.show();
  } else {
    _$jscoverage['/dialog.js'].lineData[470]++;
    d.cellpaddingHolder.hide();
  }
  _$jscoverage['/dialog.js'].lineData[472]++;
  self.dialog.show();
}, 
  _prepareTableShow: function() {
  _$jscoverage['/dialog.js'].functionData[12]++;
  _$jscoverage['/dialog.js'].lineData[475]++;
  var self = this;
  _$jscoverage['/dialog.js'].lineData[476]++;
  self._tableInit();
}, 
  show: function(cfg) {
  _$jscoverage['/dialog.js'].functionData[13]++;
  _$jscoverage['/dialog.js'].lineData[479]++;
  var self = this;
  _$jscoverage['/dialog.js'].lineData[480]++;
  S.mix(self, cfg);
  _$jscoverage['/dialog.js'].lineData[481]++;
  self._prepareTableShow();
}, 
  destroy: function() {
  _$jscoverage['/dialog.js'].functionData[14]++;
  _$jscoverage['/dialog.js'].lineData[484]++;
  destroyRes.call(this);
}});
  _$jscoverage['/dialog.js'].lineData[488]++;
  return TableDialog;
});
