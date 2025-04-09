window.addEventListener('DOMContentLoaded', () => {
    const vscode = acquireVsCodeApi();
    const selectedCommands = [];
    const selectedOrder = new Map();

    vscode.postMessage({ command: 'requestData' });

    window.addEventListener('message', (event) => {
        const message = event.data;

        if (message.command === 'sendData') {
            const list = document.getElementById('history-list');
            list.innerHTML = '';

            message.data.forEach((cmd, index) => {
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

                checkbox.addEventListener('change', (e) => {
                    const command = e.target.dataset.cmd;

                    if (e.target.checked) {
                        selectedCommands.push(command);
                        selectedOrder.set(command, selectedCommands.length);
                    } else {
                        const idx = selectedCommands.indexOf(command);
                        if (idx !== -1) selectedCommands.splice(idx, 1);
                        selectedOrder.delete(command);
                    }

                    // Update order display
                    document.querySelectorAll('.history-item').forEach(item => {
                        const cb = item.querySelector('input[type="checkbox"]');
                        const ord = item.querySelector('.order-number');
                        const cmd = cb.dataset.cmd;
                        ord.textContent = cb.checked ? selectedOrder.get(cmd) + '.' : '';
                    });
                });

                li.appendChild(orderSpan);
                li.appendChild(checkbox);
                li.appendChild(label);
                list.appendChild(li);
            });
        }
    });

    document.getElementById('run-button').addEventListener('click', () => {
        vscode.postMessage({
            command: 'runSelectedCommands',
            data: selectedCommands
        });
    });
});
