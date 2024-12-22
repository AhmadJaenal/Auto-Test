function getWebviewContent(code, fileType, codeType) {
    return `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>My Webview</title>
        <style>
            body { font-family: Arial, sans-serif; }
            h1 { color: #007ACC; }
        </style>
    </head>
    <body>
	<h1>Laporan Tugas</h1>
		<pre>File Type ${fileType}</pre>
		<pre>Code Type ${codeType}</pre>
        <pre><code>${code}</code></pre>
    </body>
    </html>`;
}

function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

module.exports = {
    getWebviewContent,
    escapeHtml
};