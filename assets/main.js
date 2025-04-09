window.addEventListener('DOMContentLoaded', () => {
    const vscode = acquireVsCodeApi();

    // Ask the extension to send data
    vscode.postMessage({
        command: 'requestData'
    });

    // Listen for data
    window.addEventListener('message', event => {
        const message = event.data;
        if (message.command === 'sendData') {
            const list = document.createElement('ul');
            message.data.forEach(line => {
                const li = document.createElement('li');
                li.textContent = line;
                list.appendChild(li);
            });
            document.body.appendChild(list);
        }
    });
});
