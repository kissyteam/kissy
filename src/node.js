KISSY.add("node", function(S, Node, NodeList) {
    Node.List = NodeList;
    return Node;
}, {
    requires:["node/node","node/nodelist","node/attach"]
});