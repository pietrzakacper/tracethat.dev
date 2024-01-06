function renderJsonTree(json) {
    const data = {
        name: json.Name,
        arguments: json.Arguments,
        return: json.Return,
        callStack: json.CallStack,
    }


    const $container = document.getElementById('json-tree')

    Array.from($container.children).forEach(c => c.remove())

    jsonTree.create(data, $container);
}
