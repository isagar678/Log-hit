window.addEventListener('DOMContentLoaded', () => {
    const vscode = acquireVsCodeApi();
    const selectedSet = new Set(); // store selected command strings
    const selectedCommands = [];   // ordered list of selected command strings
    

    let selectedCount = 5; // default

    document.getElementById('history-count').addEventListener('change', (e) => {
        if(e.target.value !== 'all'){
            selectedCount = parseInt(e.target.value)
        }
        else{
            selectedCount = e.target.value
        }
        vscode.postMessage({ command: 'requestData', count: selectedCount });

        orderSet.clear()
        selectedCommands.length=0
    });

    // Send request for initial data
    vscode.postMessage({ command: 'requestData', count: selectedCount });

    // Create a single list item
    function createListItem(cmd, index, isFavorite = false) {
        const li = document.createElement('li');
        li.classList.add('history-item');
    
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = `cmd_${index}`;
        checkbox.dataset.cmd = cmd;
    
        const orderSpan = document.createElement('span');
        orderSpan.classList.add('order-number');
        orderSpan.textContent = '';
    
        const input = document.createElement('input');
        input.type = 'text';
        input.value = cmd;
        input.classList.add('command-input');
        input.dataset.index = index;
    
        const starButton = document.createElement('button');
        starButton.textContent = '☆';
        starButton.classList.add('favorite-btn');
        if (isFavorite) {
            starButton.classList.add('favorited');
        }
        starButton.addEventListener('click', () => {
            const isNowFavorite = starButton.classList.toggle('favorited');
            vscode.postMessage({
                command: isNowFavorite ? 'addFavorite' : 'removeFavorite',
                data: cmd
            });
        });
    
        input.addEventListener('input', () => {
            if (checkbox.checked) {
                selectedCommands[Array.from(orderSet).indexOf(checkbox)] = input.value;
            }
        });
    
        checkbox.addEventListener('change', handleCheckboxChange);
    
        li.appendChild(orderSpan);
        li.appendChild(checkbox);
        li.appendChild(input);
        li.appendChild(starButton);
    
        return li;
    }
    
    document.getElementById('search-box').addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const allItems = document.querySelectorAll('.history-item');

        allItems.forEach(item => {
            const input = item.querySelector('.command-input');
            const text = input.value.toLowerCase();
            item.style.display = text.includes(searchTerm) ? 'flex' : 'none';
        });
    });

    // Handle checkbox change
    function handleCheckboxChange(e) {
        const checkbox = e.target;
        const listItem = checkbox.closest('.history-item');
        const input = listItem.querySelector('.command-input');
        const command = input.value;
    
        if (checkbox.checked) {
            selectedSet.add(command);
        } else {
            selectedSet.delete(command);
        }
    
        updateOrderDisplay();
    }
    


    // Update 1,2,3... order display
    function updateOrderDisplay() {
        const checkboxes = document.querySelectorAll('.history-item input[type="checkbox"]');
        let count = 1;
        selectedCommands.length = 0;
    
        checkboxes.forEach(cb => {
            const listItem = cb.closest('.history-item');
            const input = listItem.querySelector('.command-input');
            const cmd = input.value;
            const span = listItem.querySelector('.order-number');
    
            if (cb.checked) {
                selectedCommands.push(cmd);
                span.textContent = `${count++}.`;
            } else {
                span.textContent = '';
            }
        });
    }
    

    // Handle data sent from extension
    function handleIncomingData(data, favorites = []) {
        const list = document.getElementById('history-list');
        list.innerHTML = '';
    
        data.forEach((cmd, i) => {
            const li = createListItem(cmd, i, favorites.includes(cmd));
            list.appendChild(li);
        });
    }    

    // Listen to messages from extension
    window.addEventListener('message', event => {
        const message = event.data;
        if (message.command === 'sendData') {
            handleIncomingData(message.data, message.favorites);
        }
    });

    // Run button click handler
    document.getElementById('run-button').addEventListener('click', () => {
        vscode.postMessage({
            command: 'runSelectedCommands',
            data: selectedCommands
        });
    
        const allCheckboxes = document.querySelectorAll('.history-item input[type="checkbox"]');
    
        allCheckboxes.forEach(cb => {
            cb.checked = false;
            cb.parentNode.querySelector('.order-number').textContent = '';
        });
    
        selectedSet.clear();
        selectedCommands.length = 0;
    
        setTimeout(() => {
            vscode.postMessage({
                command: 'requestData',
                count: selectedCount
            });
        }, 1500);
    });
    
});
