const path = require('path');
const fs = require('fs');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const ESLintPlugin = require('eslint-webpack-plugin');

const context = path.resolve(__dirname, '../src/js/pages');
const findEntryPoints = () => {
	const entries = {};
	fs.readdirSync(context).forEach((file) => {
		const nameParts = file.split('.');
		const name = nameParts[0];
		const ext = nameParts[nameParts.length - 1];
		if (ext == 'jsx') {
			entries[name] = './' + file;
		}
	});
	return entries;
};
const entryPoints = findEntryPoints();

const config = {
	context: context,
	entry: entryPoints,
	plugins: [
		new CleanWebpackPlugin(),
		...Object.keys(entryPoints).map((entry) => {
			const filename = entry.toLowerCase() + '.html';
			return new HtmlWebpackPlugin({
				title: entry,
				filename,
				chunks: [`${entry}`]
			});
		}),
		new ESLintPlugin({
			extensions: ['js', 'jsx'],
			fix: true,
			fixTypes: ["problem", "suggestion", "layout"],
			cache: true,
			exclude: ['node_modules']
		})
	],
	output: {
		filename: '[name].bundle.js',
		path: path.resolve(__dirname, '../dist')
	},
	module: {
		rules: [
			{
				test: /\.s[ac]ss$/i,
				use: ['style-loader', 'css-loader', 'sass-loader']
			},
			{
				test: /\.css$/i,
				use: ['style-loader', 'css-loader']
			},
			{
				test: /\.tsx?$/,
				use: 'ts-loader',
				exclude: /node_modules/
			},
			{
				test: /\.jsx?$/i,
				exclude: /node_modules/,
				use: {
					loader: 'babel-loader',
					options: {
						presets: [
							'@babel/preset-env',
							'@babel/preset-react'
						],
						plugins: ['@babel/plugin-transform-runtime']
					}
				}
			},
			{
				test: /\.(jpe?g|pdf)/,
				use: {
					loader: 'file-loader'
				}
			}
		]
	},
	resolve: {
		alias: {
			static: path.resolve(__dirname, '../static')
		},
		modules: [path.resolve(__dirname, '../src'), 'node_modules'],
		extensions: ['.tsx', '.ts', '.js', '.jsx']
	},
	optimization: {
		usedExports: true,
		runtimeChunk: 'single',
		splitChunks: {
			chunks: 'all'
		}
	}
};

module.exports = config;