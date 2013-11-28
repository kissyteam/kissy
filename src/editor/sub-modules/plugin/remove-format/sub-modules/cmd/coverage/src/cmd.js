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
if (! _$jscoverage['/cmd.js']) {
  _$jscoverage['/cmd.js'] = {};
  _$jscoverage['/cmd.js'].lineData = [];
  _$jscoverage['/cmd.js'].lineData[6] = 0;
  _$jscoverage['/cmd.js'].lineData[7] = 0;
  _$jscoverage['/cmd.js'].lineData[8] = 0;
  _$jscoverage['/cmd.js'].lineData[30] = 0;
  _$jscoverage['/cmd.js'].lineData[31] = 0;
  _$jscoverage['/cmd.js'].lineData[32] = 0;
  _$jscoverage['/cmd.js'].lineData[36] = 0;
  _$jscoverage['/cmd.js'].lineData[38] = 0;
  _$jscoverage['/cmd.js'].lineData[39] = 0;
  _$jscoverage['/cmd.js'].lineData[41] = 0;
  _$jscoverage['/cmd.js'].lineData[42] = 0;
  _$jscoverage['/cmd.js'].lineData[43] = 0;
  _$jscoverage['/cmd.js'].lineData[44] = 0;
  _$jscoverage['/cmd.js'].lineData[45] = 0;
  _$jscoverage['/cmd.js'].lineData[47] = 0;
  _$jscoverage['/cmd.js'].lineData[48] = 0;
  _$jscoverage['/cmd.js'].lineData[51] = 0;
  _$jscoverage['/cmd.js'].lineData[54] = 0;
  _$jscoverage['/cmd.js'].lineData[69] = 0;
  _$jscoverage['/cmd.js'].lineData[71] = 0;
  _$jscoverage['/cmd.js'].lineData[74] = 0;
  _$jscoverage['/cmd.js'].lineData[77] = 0;
  _$jscoverage['/cmd.js'].lineData[79] = 0;
  _$jscoverage['/cmd.js'].lineData[82] = 0;
  _$jscoverage['/cmd.js'].lineData[83] = 0;
  _$jscoverage['/cmd.js'].lineData[90] = 0;
  _$jscoverage['/cmd.js'].lineData[91] = 0;
  _$jscoverage['/cmd.js'].lineData[94] = 0;
  _$jscoverage['/cmd.js'].lineData[98] = 0;
  _$jscoverage['/cmd.js'].lineData[100] = 0;
  _$jscoverage['/cmd.js'].lineData[101] = 0;
  _$jscoverage['/cmd.js'].lineData[106] = 0;
  _$jscoverage['/cmd.js'].lineData[110] = 0;
  _$jscoverage['/cmd.js'].lineData[117] = 0;
  _$jscoverage['/cmd.js'].lineData[118] = 0;
  _$jscoverage['/cmd.js'].lineData[120] = 0;
  _$jscoverage['/cmd.js'].lineData[123] = 0;
  _$jscoverage['/cmd.js'].lineData[125] = 0;
  _$jscoverage['/cmd.js'].lineData[127] = 0;
  _$jscoverage['/cmd.js'].lineData[128] = 0;
}
if (! _$jscoverage['/cmd.js'].functionData) {
  _$jscoverage['/cmd.js'].functionData = [];
  _$jscoverage['/cmd.js'].functionData[0] = 0;
  _$jscoverage['/cmd.js'].functionData[1] = 0;
  _$jscoverage['/cmd.js'].functionData[2] = 0;
  _$jscoverage['/cmd.js'].functionData[3] = 0;
  _$jscoverage['/cmd.js'].functionData[4] = 0;
}
if (! _$jscoverage['/cmd.js'].branchData) {
  _$jscoverage['/cmd.js'].branchData = {};
  _$jscoverage['/cmd.js'].branchData['31'] = [];
  _$jscoverage['/cmd.js'].branchData['31'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['38'] = [];
  _$jscoverage['/cmd.js'].branchData['38'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['47'] = [];
  _$jscoverage['/cmd.js'].branchData['47'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['77'] = [];
  _$jscoverage['/cmd.js'].branchData['77'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['82'] = [];
  _$jscoverage['/cmd.js'].branchData['82'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['100'] = [];
  _$jscoverage['/cmd.js'].branchData['100'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['110'] = [];
  _$jscoverage['/cmd.js'].branchData['110'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['110'][2] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['110'][3] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['112'] = [];
  _$jscoverage['/cmd.js'].branchData['112'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['117'] = [];
  _$jscoverage['/cmd.js'].branchData['117'][1] = new BranchData();
}
_$jscoverage['/cmd.js'].branchData['117'][1].init(136, 38, 'tagsRegex.test(currentNode.nodeName())');
function visit11_117_1(result) {
  _$jscoverage['/cmd.js'].branchData['117'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['112'][1].init(-1, 172, 'currentNode.attr(\'_ke_realelement\') || /\\bke_/.test(currentNode[0].className)');
function visit10_112_1(result) {
  _$jscoverage['/cmd.js'].branchData['112'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['110'][3].init(679, 31, 'currentNode.nodeName() == \'img\'');
function visit9_110_3(result) {
  _$jscoverage['/cmd.js'].branchData['110'][3].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['110'][2].init(679, 327, 'currentNode.nodeName() == \'img\' && (currentNode.attr(\'_ke_realelement\') || /\\bke_/.test(currentNode[0].className))');
function visit8_110_2(result) {
  _$jscoverage['/cmd.js'].branchData['110'][2].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['110'][1].init(676, 332, '!(currentNode.nodeName() == \'img\' && (currentNode.attr(\'_ke_realelement\') || /\\bke_/.test(currentNode[0].className)))');
function visit7_110_1(result) {
  _$jscoverage['/cmd.js'].branchData['110'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['100'][1].init(131, 27, 'currentNode.equals(endNode)');
function visit6_100_1(result) {
  _$jscoverage['/cmd.js'].branchData['100'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['82'][1].init(367, 38, 'tagsRegex.test(pathElement.nodeName())');
function visit5_82_1(result) {
  _$jscoverage['/cmd.js'].branchData['82'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['77'][1].init(41, 109, 'pathElement.equals(path.block) || pathElement.equals(path.blockLimit)');
function visit4_77_1(result) {
  _$jscoverage['/cmd.js'].branchData['77'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['47'][1].init(34, 15, 'range.collapsed');
function visit3_47_1(result) {
  _$jscoverage['/cmd.js'].branchData['47'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['38'][1].init(17, 34, '!editor.hasCommand("removeFormat")');
function visit2_38_1(result) {
  _$jscoverage['/cmd.js'].branchData['38'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['31'][1].init(25, 16, 'i < attrs.length');
function visit1_31_1(result) {
  _$jscoverage['/cmd.js'].branchData['31'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/cmd.js'].functionData[0]++;
  _$jscoverage['/cmd.js'].lineData[7]++;
  var Editor = require('editor');
  _$jscoverage['/cmd.js'].lineData[8]++;
  var KER = Editor.RangeType, ElementPath = Editor.ElementPath, Dom = S.DOM, removeFormatTags = 'b,big,code,del,dfn,em,font,i,ins,kbd,' + 'q,samp,small,span,strike,strong,sub,sup,tt,u,var,s', removeFormatAttributes = ('class,style,lang,width,height,' + 'align,hspace,valign').split(/,/), tagsRegex = new RegExp('^(?:' + removeFormatTags.replace(/,/g, '|') + ')$', 'i');
  _$jscoverage['/cmd.js'].lineData[30]++;
  function removeAttrs(el, attrs) {
    _$jscoverage['/cmd.js'].functionData[1]++;
    _$jscoverage['/cmd.js'].lineData[31]++;
    for (var i = 0; visit1_31_1(i < attrs.length); i++) {
      _$jscoverage['/cmd.js'].lineData[32]++;
      el.removeAttr(attrs[i]);
    }
  }
  _$jscoverage['/cmd.js'].lineData[36]++;
  return {
  init: function(editor) {
  _$jscoverage['/cmd.js'].functionData[2]++;
  _$jscoverage['/cmd.js'].lineData[38]++;
  if (visit2_38_1(!editor.hasCommand("removeFormat"))) {
    _$jscoverage['/cmd.js'].lineData[39]++;
    editor.addCommand("removeFormat", {
  exec: function() {
  _$jscoverage['/cmd.js'].functionData[3]++;
  _$jscoverage['/cmd.js'].lineData[41]++;
  editor.focus();
  _$jscoverage['/cmd.js'].lineData[42]++;
  tagsRegex.lastIndex = 0;
  _$jscoverage['/cmd.js'].lineData[43]++;
  var ranges = editor.getSelection().getRanges();
  _$jscoverage['/cmd.js'].lineData[44]++;
  editor.execCommand("save");
  _$jscoverage['/cmd.js'].lineData[45]++;
  for (var i = 0, range; range = ranges[i]; i++) {
    _$jscoverage['/cmd.js'].lineData[47]++;
    if (visit3_47_1(range.collapsed)) {
      _$jscoverage['/cmd.js'].lineData[48]++;
      continue;
    }
    _$jscoverage['/cmd.js'].lineData[51]++;
    range.enlarge(KER.ENLARGE_ELEMENT);
    _$jscoverage['/cmd.js'].lineData[54]++;
    var bookmark = range.createBookmark(), startNode = bookmark.startNode, endNode = bookmark.endNode;
    _$jscoverage['/cmd.js'].lineData[69]++;
    var breakParent = function(node) {
  _$jscoverage['/cmd.js'].functionData[4]++;
  _$jscoverage['/cmd.js'].lineData[71]++;
  var path = new ElementPath(node), pathElements = path.elements;
  _$jscoverage['/cmd.js'].lineData[74]++;
  for (var i = 1, pathElement; pathElement = pathElements[i]; i++) {
    _$jscoverage['/cmd.js'].lineData[77]++;
    if (visit4_77_1(pathElement.equals(path.block) || pathElement.equals(path.blockLimit))) {
      _$jscoverage['/cmd.js'].lineData[79]++;
      break;
    }
    _$jscoverage['/cmd.js'].lineData[82]++;
    if (visit5_82_1(tagsRegex.test(pathElement.nodeName()))) {
      _$jscoverage['/cmd.js'].lineData[83]++;
      node._4e_breakParent(pathElement);
    }
  }
};
    _$jscoverage['/cmd.js'].lineData[90]++;
    breakParent(startNode);
    _$jscoverage['/cmd.js'].lineData[91]++;
    breakParent(endNode);
    _$jscoverage['/cmd.js'].lineData[94]++;
    var currentNode = startNode._4eNextSourceNode(true, Dom.NodeType.ELEMENT_NODE, undefined, undefined);
    _$jscoverage['/cmd.js'].lineData[98]++;
    while (currentNode) {
      _$jscoverage['/cmd.js'].lineData[100]++;
      if (visit6_100_1(currentNode.equals(endNode))) {
        _$jscoverage['/cmd.js'].lineData[101]++;
        break;
      }
      _$jscoverage['/cmd.js'].lineData[106]++;
      var nextNode = currentNode._4eNextSourceNode(false, Dom.NodeType.ELEMENT_NODE, undefined, undefined);
      _$jscoverage['/cmd.js'].lineData[110]++;
      if (visit7_110_1(!(visit8_110_2(visit9_110_3(currentNode.nodeName() == 'img') && (visit10_112_1(currentNode.attr('_ke_realelement') || /\bke_/.test(currentNode[0].className))))))) {
        _$jscoverage['/cmd.js'].lineData[117]++;
        if (visit11_117_1(tagsRegex.test(currentNode.nodeName()))) {
          _$jscoverage['/cmd.js'].lineData[118]++;
          currentNode._4eRemove(true);
        } else {
          _$jscoverage['/cmd.js'].lineData[120]++;
          removeAttrs(currentNode, removeFormatAttributes);
        }
      }
      _$jscoverage['/cmd.js'].lineData[123]++;
      currentNode = nextNode;
    }
    _$jscoverage['/cmd.js'].lineData[125]++;
    range.moveToBookmark(bookmark);
  }
  _$jscoverage['/cmd.js'].lineData[127]++;
  editor.getSelection().selectRanges(ranges);
  _$jscoverage['/cmd.js'].lineData[128]++;
  editor.execCommand("save");
}});
  }
}};
});
