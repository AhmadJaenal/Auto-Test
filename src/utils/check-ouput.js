const vscode = require('vscode');

class OutputChannelChecker {
    constructor(channelName) {
        this.channelName = channelName;
        this.outputChannel = null;
    }

    getOutputChannel() {
        if (!this.outputChannel) {
            this.outputChannel = vscode.window.createOutputChannel(this.channelName);
        }

        return this.outputChannel;
    }

    showOutputChannel() {
        const channel = this.getOutputChannel();
        channel.show();
    }

    appendLine(message) {
        const channel = this.getOutputChannel();
        channel.appendLine(message);
    }
}


module.exports = OutputChannelChecker;