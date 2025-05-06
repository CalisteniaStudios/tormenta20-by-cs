import copy from "@guanghechen/rollup-plugin-copy";
import autoprefixer from "autoprefixer";
import { defineConfig } from "rollup";
import postcss from "rollup-plugin-postcss";

const name = "tormenta20";
const distDirectory = "dist";
const srcDirectory = ".";

const staticFiles = [
	"assets",
	"icons",
	"json",
	"lang",
	"templates",
	"LICENSE",
	"system.json"
];

export default defineConfig({
	strictDeprecations: true,
	input: { [`${name}`]: `${srcDirectory}/${name}.mjs` },
	output: {
		dir: distDirectory,
		format: "es",
		sourcemap: true,
		entryFileNames: "[name].mjs",
		assetFileNames: "[name].[ext]"
	},
	plugins: [
		postcss({
			extract: true,
			minimize: true,
			sourceMap: true,
			use: ["less"],
			plugins: [autoprefixer()]
		}),
		copy({
			targets: [
				{
					src: staticFiles.map((f) => `${srcDirectory}/${f}`),
					dest: distDirectory
				}
			]
		})
	]
});
