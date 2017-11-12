const path = require('path');
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const extractLess = new ExtractTextPlugin({
	filename: "style.css"
});
const HtmlWebpackPlugin = require('html-webpack-plugin');
const html = new HtmlWebpackPlugin({
	title: "SVGCoder"
});

module.exports = {
	entry: {
		app: './src/main.js'
	},
	output: {
		filename: '[name].bundle.js',
		path: path.resolve(__dirname, 'dist')
	},
	module: {
		rules: [
			{
				test: /\.less$/,
				use: extractLess.extract({
					use: [
						'css-loader',
						'less-loader'
					],
					fallback: 'style-loader'
				})
			},
			{
				test: /\.vue$/,
				use: [
					'vue-loader',
				]
			},
			{
				test: /\.(png|svg|jpg|gif)$/,
				use: [
					'file-loader'
				]
			}
		]
	},
	plugins: [
		extractLess,
		html
	]
};