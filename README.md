🐚 Log-N-Hit - VS Code Extension
==========================================

Quickly access and re-run your terminal commands directly from VS Code!This extension fetches and displays your recent commands, including **session-based commands** that haven't yet been written to the history file.

🚀 Features
-----------

*   📜 View recent Bash commands inside VS Code
    
*   🧠 Includes **unsaved session commands** using history -a
    
*   ✅ Select and run multiple commands directly
    
*   🔍 Filter your command history with a search bar
    
*   🎯 Sleek and responsive UI in the sidebar panel
    

📸 Preview
----------

> 
![Extension Screenshot](https://drive.google.com/file/d/1UuHJJutxKvppck1o9iPVHNFTOIdT0BQb/view?usp=sharing)
⚙️ How It Works
---------------

VS Code terminal sessions don’t auto-save command history unless the terminal is closed.This extension uses:
`   history -a   `

to **append active session commands to .bash\_history**, ensuring nothing is missed.Then it reads and displays them in an interactive sidebar panel.

🛠️ Usage
---------

1.  Open VS Code
    
2.  Click the **Book icon** in the Side Bar
    
3.  Select how many recent commands to display
    
4.  Use the search to filter (optional)
    
5.  Check commands and click **Run Selected**
    

📦 Installation
---------------

### From Marketplace

👉 [Install via VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=yourname.bash-history-runner)

### From VS Code

1.  Open Extensions panel (Ctrl+Shift+X)
    
2.  Search for **Terminal History Runner**
    
3.  Click **Install**
    

🧪 Requirements
---------------
    
*   VS Code terminal profile should use Bash or Powershell
    

> Tip: You can set the default shell from **Settings > Terminal > Integrated > Default Profile**

💡 Pro Tips
-----------

*   The extension auto-runs history -a to capture session commands
    
*   Use the search bar for quick filtering
    
*   Commands are run in the **integrated terminal**
    

🙌 Contributing
---------------

Found a bug or want to suggest something cool? Open an issue or PR here:[👉 GitHub Repository](https://github.com/isagar678/Log-hit)

📄 License
----------

MIT License© 2025 \[Sagar Bharati / @isagar678\]

> Made with ❤️ for terminal power users by Sagar Bharati.