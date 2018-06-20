const webpack = require('webpack');
const path = require('path')

module.exports = {
    output: {
        path: path.join(__dirname, 'dist', 'scripts'),
        filename: '[name].bundle.js'
    },
    resolve: {
        // Add `.ts` and `.tsx` as a resolvable extension.
        extensions: [".ts", ".tsx", ".js"]
    },
    module: {
        rules: [
            { test: /\.ts$/, use: 'ts-loader' }
        ]
    }
}