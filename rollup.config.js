import nodeResolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import buble from '@rollup/plugin-buble';
import { terser } from 'rollup-plugin-terser';
import del from 'del';

const conf = require('./package.json');
const version = conf.version;
const pixi = conf.devDependencies['three'];

const banner = [
	'/*!',
	` * tlap.js - v${version}`,
	' * ',
	` * @require three.js v${three}`,
	' * @author tawaship (makazu.mori@gmail.com)',
	' * @license MIT',
	' */',
	''
].join('\n');

export default (async () => {
	if (process.env.PROD) {
		await del(['./docs/', './dist/', './types/']);
	}
	
	return [
		/*
		{
			input: 'src/index.ts',
			output: [
				{
					banner,
					file: 'dist/pixi-animate-container.cjs.js',
					format: 'cjs',
					sourcemap: true
				},
				{
					banner,
					file: 'dist/pixi-animate-container.esm.js',
					format: 'esm',
					sourcemap: true
				}
			],
			external: ['pixi.js', '@tawaship/createjs-module'],
			watch: {
				clearScreen: false
			},
			plugins: [
				nodeResolve(),
				commonjs(),
				typescript()
			]
		},
		*/
		{
			input: 'src/index.ts',
			output: [
				{
					banner: banner,
					file: 'dist/tlap.js',
					format: 'iife',
					name: 'TLAP',
					sourcemap: true,
					extend: true,
					globals: {
						'three': 'THREE'
					}
				}
			],
			external: ['three'],
			plugins: [
				nodeResolve(),
				commonjs(),
				typescript(),
				buble(),
				terser({
					compress: {
						//drop_console: true
						//pure_funcs: ['console.log']
					},
					mangle: false,
					output: {
						beautify: true,
						braces: true
					}
				})
			]
		},
		{
			input: 'src/index.ts',
			output: [
				{
					banner: banner,
					file: 'dist/tlap.min.js',
					format: 'iife',
					name: 'TLAP',
					sourcemap: true,
					extend: true,
					globals: {
						'three': 'THREE'
					},
					compact: true
				}
			],
			external: ['three'],
			plugins: [
				nodeResolve(),
				commonjs(),
				typescript(),
				buble(),
				terser({
					compress: {
						//drop_console: true,
						pure_funcs: ['console.log']
					}
				})
			]
		}
	]
})();