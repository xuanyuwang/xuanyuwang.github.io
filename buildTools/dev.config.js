const path = require('path');

module.exports = {
    entry: '../src/js/entrypoint/index.js',
    output: {
        filename: 'index.js',
        path: path.resolve(__dirname, '../dist')
    }
}