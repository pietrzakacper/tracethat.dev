function renderJsonTree(jsonB64) {
    const json = JSON.parse(atob(jsonB64))

    const data = json.details

    const $container = document.getElementById('json-tree')

    Array.from($container.children).forEach(c => c.remove())

    const tree = jsonTree.create(data, $container);
    tree.expand(n => n?.parent?.isRoot)
}
