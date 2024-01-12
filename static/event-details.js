function renderHeader(selectedEvt) {
    if (!selectedEvt) return

    const id = selectedEvt.callId
    const $evt = document.getElementById(id)
    const name = $evt.querySelector('#name').innerText
    const duration = $evt.querySelector('#duration').innerText
    const start = $evt.querySelector('#start').innerText
    const end = $evt.querySelector('#end').innerText
    const bgColor = $evt.getAttribute('bgColor').split(' ')[0]

    return `
    <div class="w-full px-4 py-4 rounded-md text-lg ${bgColor}">
        ${name}
    </div>
    <div class="flex flex-wrap gap-2">
    <span class="bg-gray-200 rounded-full px-3 py-1 text-sm font-medium">duration: ${duration}</span>
    <span class="bg-gray-200 rounded-full px-3 py-1 text-sm font-medium">start: ${start}</span>
    <span class="bg-gray-200 rounded-full px-3 py-1 text-sm font-medium">end ${end}</span >
    </div>
    `
}
