const Mocha = require('mocha');
const fs = require('fs').promises;
const path = require('path');

const mocha = new Mocha({
	reporter: 'mocha-junit-reporter',
	reporterOptions: {
		testCaseSwitchClassnameAndName: true,
	},
	timeout: 10000,
	slow: 2500,
});

fs.readdir(__dirname)
	.then(files => files.filter(file => file.substring(0, 4) === 'test'))
	.then(files => files.map(file => path.join(__dirname, file)))
	.then(files => files.forEach(file => mocha.addFile(file)))
	.then(() => mocha.run(failures => (process.exitCode = failures)));
