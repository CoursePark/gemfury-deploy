'use strict';

const childProcess = require('child_process');
const fs = require('fs');
const pRequest = require('util').promisify(require('request'));

const config = {
	GEMFURY_API_TOKEN: `${process.env.GEMFURY_API_TOKEN}`.trim(),
	GEMFURY_USERNAME: `${process.env.GEMFURY_USERNAME}`.trim(),
};

function fail(...msg) {
	console.error(...msg);
	process.exit(1);
}

if (!config.GEMFURY_API_TOKEN) {
	fail(`error GEMFURY_API_TOKEN environment variable must be set`);
}
if (!config.GEMFURY_USERNAME) {
	fail(`error GEMFURY_USERNAME environment variable must be set`);
}

const repoDir = './repo';
const packageFile = `${repoDir}/package.json`;

async function main() {
	let packageJson = null;
	try {
		packageJson = JSON.parse(fs.readFileSync(packageFile));
	} catch (e) {
		fail(`error finding ${packageFile}, ensure the repo directory is attached to the container as a volume`);
	}
	if (!packageJson.name) {
		fail(`error finding a "name" property in ${packageFile}`);
	}
	if (!packageJson.version) {
		fail(`error finding a "version" property in ${packageFile}`);
	}
	
	let remoteVersions;
	try {
		const remotePackage = await pRequest({
			url: `https://npm.fury.io/${encodeURIComponent(config.GEMFURY_API_TOKEN)}/${encodeURIComponent(config.GEMFURY_USERNAME)}/${encodeURIComponent(packageJson.name)}`,
			json: true
		});
		remoteVersions = Object.keys(remotePackage.body.versions);
	} catch (err) {
		fail(`error determining remote repo version\n${err}`);
	}
	
	if (remoteVersions.includes(packageJson.version)) {
		console.log(`no publish - ${packageJson.version} already exists on Gemfury ${remoteVersions.join(', ')}`);
		process.exit(0);
	}
	
	const npmPackSpawn = childProcess.spawnSync('npm', ['pack'], {cwd: repoDir});
	if (npmPackSpawn.stderr.length || npmPackSpawn.status !== 0) {
		fail(`error packing repo\n${npmPackSpawn.stderr.toString().trim()}`);
	}
	
	let packFile = npmPackSpawn.stdout.toString().trim();
	
	console.log(`publishing ${packageJson.version}`);
	
	try {
		await pRequest({
			method: 'POST',
			url: `https://${config.GEMFURY_API_TOKEN}@push.fury.io/${config.GEMFURY_USERNAME}/`,
			formData: {
				packageJson: fs.createReadStream(`${repoDir}/${packFile}`)
			}
		});
	} catch (err) {
		fail(`error publish failed\n${err}`);
	}
	
	try {
		fs.unlinkSync(`${repoDir}/${packFile}`);
	} catch (err) {
		fail(`error unable to delete pack file ${repoDir}/${packFile}`)
	}
}

main();
