const rules = require('./webpack.rules');

rules.push({
    test: /\.css$/,
    use: [
        {loader: 'style-loader'},
        {loader: 'css-loader'},
    ],
});

module.exports = {
    output: {
        filename: '[name].js',
    },
    // Put your normal webpack config below here
    module: {
        rules,
    },
};
