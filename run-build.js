// `run-build.js` is based off of the `run.js` script that 
// Replit uses to build the game using esbuild. 
// This script creates a `dist/` dir that is ready to host the game. 
// Replit functionality including users & database are removed.

const fs = require("fs");
const fse = require("fs-extra");
const path = require("path");
const esbuild = require("esbuild");
let err = null;

// build user game
function buildGame() {

	const template = fs.readFileSync("template.html", "utf-8");
	let code = "";

	code += `<script src="helper.js"></script>\n`;
	code += `<script src="game.js"></script>\n`;

	try {
		// // clean
		// try {
		// 	let dir = 'dist';
		// 	fs.rmSync(dir, { recursive: true, force: true });
		// 	console.log(`${dir}/ deleted!`);
		// } catch (err) {
		// 	console.log(`wtffff`);
		// 	console.error(`Error while deleting ${dir}.`);
		// }

		// build user code
		esbuild.buildSync({
			bundle: true,
			sourcemap: true,
			target: "es6",
			keepNames: true,
			logLevel: "silent",
			entryPoints: ["code/main.js"],
			outfile: "dist/game.js",
		});

		esbuild.buildSync({
			bundle: true,
			sourcemap: true,
			target: "es6",
			keepNames: true,
			entryPoints: ["helper.ts"],
			outfile: "dist/helper.js",
		});

	} catch (e) {
		const loc = e.errors[0].location;
		err = {
			msg: e.errors[0].text,
			stack: [
				{
					line: loc.line,
					col: loc.column,
					file: loc.file,
				},
			],
		};
		let msg = "";
		msg += "<pre>";
		msg += `ERROR: ${err.msg}\n`;
		if (err.stack) {
			err.stack.forEach((trace) => {
				msg += `    -> ${trace.file}:${trace.line}:${trace.col}\n`;
			});
		}
		msg += "</pre>";
		fs.writeFileSync("dist/index.html", msg);
		return;
	}

	try {
		fs.writeFileSync("dist/index.html", template.replace("{{kaboom}}", code));
		console.log("Game & index built to dist/");
		fse.copySync("sounds", "dist/sounds");
		fse.copySync("sprites", "dist/sprites");
		console.log("Copied sounds and sprites to dist/");
	} catch (err) {
		console.error(err);
	}

}
buildGame();