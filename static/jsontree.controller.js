function renderJsonTree(json) {
    const data = json.details

    const $container = document.getElementById('json-tree')

    Array.from($container.children).forEach(c => c.remove())

    const tree = jsonTree.create(data, $container);
    tree.expand(n => n?.parent?.isRoot)
}
