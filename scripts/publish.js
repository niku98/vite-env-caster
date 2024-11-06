import { execSync } from "child_process";
import glob from "fast-glob";
import { readFileSync, writeFileSync } from "fs";
import { argv } from "process";
import * as semver from "semver";

function publish() {
	const inputVer = argv[2];

	const releaseVer = semver.parse(inputVer.split("@")[0]);
	const releaseTag = inputVer.split("@")[1];

	if (!releaseVer) {
		console.error("[Release version] is not provided or it is invalid.");
		return;
	}

	const packages = getInternalPackages();
	const changedPackages = packages.filter((pkg) => {
		if (semver.compare(pkg.version, releaseVer.version) >= 0) {
			return false;
		}

		return isPackageChanged(pkg.folder);
	});

	if (changedPackages.length === 0) {
		console.error("No package changed.");
		return;
	}

	console.info("Updating packages dependencies...");
	changedPackages.forEach((changedPackage) => {
		packages.forEach((pkg) => {
			replacePackageVersion(changedPackage.packageJson, pkg.name, pkg.version);
		});
	});

	for (let index = 0; index < 3; index++) {
		for (const pkg of packages) {
			changedPackages.forEach((changedPackage) => {
				const result = replacePackageVersion(
					pkg.packageJson,
					changedPackage.name,
					releaseVer.version
				);

				if (result && !changedPackages.includes(pkg)) {
					changedPackages.push(pkg);
				}
			});
		}
	}
	console.info("Updated packages dependencies.");

	console.info("Updating changed packages version...");
	changedPackages.forEach((pkg) => {
		pkg.version = releaseVer.version;
		pkg.packageJson.version = releaseVer.version;
		writePackageJsonFile(pkg.packageJson, pkg.packageJsonPath);
	});
	console.info("Updated changed packages version.");

	console.info("All changed packages:");
	console.info("  " + changedPackages.map(({ name }) => name).join("\n  "));

	console.info("Publishing packages...");
	changedPackages.forEach((pkg) => {
		copyREADME(pkg.folder);
		publishPackage(pkg.folder, releaseTag);
	});
	console.info("All changed packages are published...");
}
publish();

function getInternalPackages() {
	const packagePaths = glob.globSync("packages/*/package.json");
	return packagePaths.map((path) => {
		const packageJson = JSON.parse(
			readFileSync(path, {
				encoding: "utf8",
			})
		);

		return {
			folder: path.replace("/package.json", ""),
			packageJsonPath: path,
			name: packageJson.name,
			version: getLatestPackageVersion(packageJson.name),
			packageJson,
		};
	});
}

function replacePackageVersion(packageJson, packageName, version) {
	let result = false;
	["dependencies", "peerDependencies"].forEach((depType) => {
		if (depType in packageJson && packageName in packageJson[depType]) {
			if (packageJson[depType][packageName] === version) {
				return;
			}

			result = true;
			packageJson[depType][packageName] = version;
		}
	});

	return result;
}

function getLatestPackageVersion(packageName) {
	try {
		return execSync(`npm view ${packageName} version`).toString("utf8").trim();
	} catch (error) {
		return "0.0.0";
	}
}

function isPackageChanged(packagePath) {
	const tags = getTags();
	if (tags.length < 2) {
		return true;
	}

	return getChangedFiles(tags[tags.length - 2]).some((path) =>
		path.startsWith(packagePath)
	);
}

function getTags() {
	return execSync("git tag").toString("utf8").split("\n").filter(Boolean);
}

function getChangedFiles(latestTag) {
	return execSync("git diff --name-only " + latestTag)
		.toString("utf8")
		.split("\n");
}

function writePackageJsonFile(packageJson, path) {
	writeFileSync(path, JSON.stringify(packageJson, undefined, 2));
}

function publishPackage(path, tag) {
	execSync(
		`cd ${path} && npm publish${
			tag ? " --tag " + tag : ""
		} --access=public --no-git-checks --registry https://registry.npmjs.org`
	);
}

function copyREADME(path) {
	execSync(`yes | cp -f README.md ${path}`);
}
