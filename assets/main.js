window.addEventListener('DOMContentLoaded', () => {
    const vscode = acquireVsCodeApi();
    const selectedCommands = [];
    const orderSet = new Set();

    // Send request for initial data
    vscode.postMessage({ command: 'requestData' });

    // Create a single list item
    function createListItem(cmd, index) {
        const li = document.createElement('li');
        li.classList.add('history-item');

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = `cmd_${index}`;
        checkbox.dataset.cmd = cmd;

        const orderSpan = document.createElement('span');
        orderSpan.classList.add('order-number');
        orderSpan.textContent = '';

        const label = document.createElement('label');
        label.setAttribute('for', `cmd_${index}`);
        label.textContent = cmd;

        checkbox.addEventListener('change', handleCheckboxChange);

        li.appendChild(orderSpan);
        li.appendChild(checkbox);
        li.appendChild(label);

        return li;
    }

    // Handle checkbox change
    function handleCheckboxChange(e) {
        const checkbox = e.target;

        if (checkbox.checked) {
            orderSet.add(checkbox);
            selectedCommands.push(checkbox.dataset.cmd);
        } else {
            orderSet.delete(checkbox);
            const index = selectedCommands.indexOf(checkbox.dataset.cmd);
            if (index !== -1) selectedCommands.splice(index, 1);
        }

        updateOrderDisplay();
    }

    // Update A, B, C... order display
    function updateOrderDisplay() {
        const allCheckboxes = document.querySelectorAll('.history-item input[type="checkbox"]');

        allCheckboxes.forEach(cb => {
            const span = cb.parentNode.querySelector('.order-number');
            const index = [...orderSet].indexOf(cb);
            span.textContent = cb.checked && index !== -1 ? `${index + 1}.` : '';
        });
    }


    // Handle data sent from extension
    function handleIncomingData(data) {
        const list = document.getElementById('history-list');
        list.innerHTML = '';
        data.forEach((cmd, i) => list.appendChild(createListItem(cmd, i)));
    }

    // Listen to messages from extension
    window.addEventListener('message', event => {
        const message = event.data;
        if (message.command === 'sendData') {
            handleIncomingData(message.data);
        }
    });

    // Run button click handler
    document.getElementById('run-button').addEventListener('click', () => {
        vscode.postMessage({
            command: 'runSelectedCommands',
            data: selectedCommands
        });
    });
});
