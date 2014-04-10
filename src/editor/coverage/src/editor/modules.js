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
if (! _$jscoverage['/editor/modules.js']) {
  _$jscoverage['/editor/modules.js'] = {};
  _$jscoverage['/editor/modules.js'].lineData = [];
  _$jscoverage['/editor/modules.js'].lineData[2] = 0;
  _$jscoverage['/editor/modules.js'].lineData[3] = 0;
}
if (! _$jscoverage['/editor/modules.js'].functionData) {
  _$jscoverage['/editor/modules.js'].functionData = [];
  _$jscoverage['/editor/modules.js'].functionData[0] = 0;
}
if (! _$jscoverage['/editor/modules.js'].branchData) {
  _$jscoverage['/editor/modules.js'].branchData = {};
}
_$jscoverage['/editor/modules.js'].lineData[2]++;
KISSY.add(function(S) {
  _$jscoverage['/editor/modules.js'].functionData[0]++;
  _$jscoverage['/editor/modules.js'].lineData[3]++;
  S.config("requires", {
  "editor/plugin/back-color": ["editor/plugin/color/btn", "editor/plugin/back-color/cmd"], 
  "editor/plugin/back-color/cmd": ["editor/plugin/color/cmd"], 
  "editor/plugin/bold": ["editor/plugin/font/ui", "editor/plugin/bold/cmd"], 
  "editor/plugin/bold/cmd": ["editor/plugin/font/cmd"], 
  "editor/plugin/bubble": ["overlay", "editor"], 
  "editor/plugin/button": ["editor", "button"], 
  "editor/plugin/checkbox-source-area": ["editor"], 
  "editor/plugin/code": ["editor/plugin/button", "editor/plugin/dialog-loader"], 
  "editor/plugin/code/dialog": ["menubutton", "editor/plugin/dialog"], 
  "editor/plugin/color/btn": ["editor/plugin/button", "editor/plugin/overlay", "editor/plugin/dialog-loader"], 
  "editor/plugin/color/cmd": ["editor"], 
  "editor/plugin/color/dialog": ["editor/plugin/dialog"], 
  "editor/plugin/contextmenu": ["menu", "editor/plugin/focus-fix", "event/dom"], 
  "editor/plugin/dent-cmd": ["editor", "editor/plugin/list-utils"], 
  "editor/plugin/dialog": ["overlay", "editor/plugin/focus-fix", "dd/plugin/constrain", "component/plugin/drag"], 
  "editor/plugin/dialog-loader": ["editor", "overlay"], 
  "editor/plugin/draft": ["json", "event/dom", "editor/plugin/local-storage", "editor/plugin/menubutton"], 
  "editor/plugin/drag-upload": ["editor", "event/dom"], 
  "editor/plugin/element-path": ["editor"], 
  "editor/plugin/fake-objects": ["editor", "html-parser"], 
  "editor/plugin/flash": ["editor/plugin/flash-common/base-class", "editor/plugin/fake-objects", "editor/plugin/button"], 
  "editor/plugin/flash/dialog": ["editor/plugin/flash-common/utils", "editor/plugin/dialog", "editor/plugin/menubutton"], 
  "editor/plugin/flash-bridge": ["editor", "swf", "event/custom"], 
  "editor/plugin/flash-common/base-class": ["editor/plugin/flash-common/utils", "base", "editor/plugin/dialog-loader", "editor/plugin/bubble", "editor/plugin/contextmenu"], 
  "editor/plugin/flash-common/utils": ["swf"], 
  "editor/plugin/focus-fix": ["editor"], 
  "editor/plugin/font/cmd": ["editor"], 
  "editor/plugin/font/ui": ["editor/plugin/button", "editor/plugin/menubutton"], 
  "editor/plugin/font-family": ["editor/plugin/font/ui", "editor/plugin/font-family/cmd"], 
  "editor/plugin/font-family/cmd": ["editor/plugin/font/cmd"], 
  "editor/plugin/font-size": ["editor/plugin/font/ui", "editor/plugin/font-size/cmd"], 
  "editor/plugin/font-size/cmd": ["editor/plugin/font/cmd"], 
  "editor/plugin/fore-color": ["editor/plugin/color/btn", "editor/plugin/fore-color/cmd"], 
  "editor/plugin/fore-color/cmd": ["editor/plugin/color/cmd"], 
  "editor/plugin/heading": ["editor/plugin/menubutton", "editor/plugin/heading/cmd"], 
  "editor/plugin/heading/cmd": ["editor"], 
  "editor/plugin/image": ["editor/plugin/button", "editor/plugin/bubble", "editor/plugin/contextmenu", "editor/plugin/dialog-loader", "node"], 
  "editor/plugin/image/dialog": ["io", "editor/plugin/dialog", "tabs", "editor/plugin/menubutton", "node"], 
  "editor/plugin/indent": ["editor/plugin/indent/cmd", "editor/plugin/button"], 
  "editor/plugin/indent/cmd": ["editor/plugin/dent-cmd"], 
  "editor/plugin/italic": ["editor/plugin/font/ui", "editor/plugin/italic/cmd"], 
  "editor/plugin/italic/cmd": ["editor/plugin/font/cmd"], 
  "editor/plugin/justify-center": ["editor/plugin/justify-center/cmd", "editor/plugin/button"], 
  "editor/plugin/justify-center/cmd": ["editor/plugin/justify-cmd"], 
  "editor/plugin/justify-cmd": ["editor"], 
  "editor/plugin/justify-left": ["editor/plugin/justify-left/cmd", "editor/plugin/button"], 
  "editor/plugin/justify-left/cmd": ["editor/plugin/justify-cmd"], 
  "editor/plugin/justify-right": ["editor/plugin/justify-right/cmd", "editor/plugin/button"], 
  "editor/plugin/justify-right/cmd": ["editor/plugin/justify-cmd"], 
  "editor/plugin/link": ["editor/plugin/button", "editor/plugin/bubble", "editor/plugin/link/utils", "editor/plugin/dialog-loader"], 
  "editor/plugin/link/dialog": ["editor/plugin/dialog", "editor/plugin/link/utils"], 
  "editor/plugin/link/utils": ["editor"], 
  "editor/plugin/list-utils/btn": ["editor/plugin/button", "editor/plugin/menubutton"], 
  "editor/plugin/list-utils/cmd": ["editor", "editor/plugin/list-utils"], 
  "editor/plugin/local-storage": ["overlay", "editor/plugin/flash-bridge"], 
  "editor/plugin/maximize": ["editor/plugin/maximize/cmd", "editor/plugin/button"], 
  "editor/plugin/maximize/cmd": ["editor", "event/dom"], 
  "editor/plugin/menubutton": ["editor", "menubutton"], 
  "editor/plugin/ordered-list": ["editor/plugin/list-utils/btn", "editor/plugin/ordered-list/cmd"], 
  "editor/plugin/ordered-list/cmd": ["editor/plugin/list-utils/cmd"], 
  "editor/plugin/outdent": ["editor/plugin/button", "editor/plugin/outdent/cmd"], 
  "editor/plugin/outdent/cmd": ["editor/plugin/dent-cmd"], 
  "editor/plugin/overlay": ["overlay", "editor/plugin/focus-fix"], 
  "editor/plugin/page-break": ["editor/plugin/fake-objects", "editor/plugin/button"], 
  "editor/plugin/preview": ["editor/plugin/button"], 
  "editor/plugin/progressbar": ["base"], 
  "editor/plugin/remove-format": ["editor/plugin/button", "editor/plugin/remove-format/cmd"], 
  "editor/plugin/remove-format/cmd": ["editor"], 
  "editor/plugin/resize": ["dd"], 
  "editor/plugin/smiley": ["editor/plugin/overlay", "editor/plugin/button"], 
  "editor/plugin/source-area": ["editor/plugin/button"], 
  "editor/plugin/strike-through": ["editor/plugin/font/ui", "editor/plugin/strike-through/cmd"], 
  "editor/plugin/strike-through/cmd": ["editor/plugin/font/cmd"], 
  "editor/plugin/table": ["editor/plugin/dialog-loader", "editor/plugin/contextmenu", "editor/plugin/button"], 
  "editor/plugin/table/dialog": ["editor/plugin/dialog", "editor/plugin/menubutton"], 
  "editor/plugin/underline": ["editor/plugin/font/ui", "editor/plugin/underline/cmd"], 
  "editor/plugin/underline/cmd": ["editor/plugin/font/cmd"], 
  "editor/plugin/undo": ["editor/plugin/undo/btn", "editor/plugin/undo/cmd"], 
  "editor/plugin/undo/btn": ["editor/plugin/button"], 
  "editor/plugin/undo/cmd": ["editor"], 
  "editor/plugin/unordered-list": ["editor/plugin/list-utils/btn", "editor/plugin/unordered-list/cmd"], 
  "editor/plugin/unordered-list/cmd": ["editor/plugin/list-utils/cmd"], 
  "editor/plugin/video": ["editor/plugin/flash-common/base-class", "editor/plugin/fake-objects", "editor/plugin/button"], 
  "editor/plugin/video/dialog": ["io", "editor/plugin/flash/dialog"], 
  "editor/plugin/word-filter": ["html-parser"], 
  "editor/plugin/xiami-music": ["editor/plugin/flash-common/base-class", "editor/plugin/fake-objects", "editor/plugin/button"], 
  "editor/plugin/xiami-music/dialog": ["editor/plugin/flash/dialog"]});
});
