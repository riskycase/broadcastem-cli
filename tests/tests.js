const childProcess = require('child_process');
const path = require('path');

const should = require('chai').should();

describe('Flag tests', () => {
	let rootProcess;

	it('Spawns an app with valid options', done => {
		rootProcess = childProcess.fork('index.js', ['-p 3000'], {
			silent: true,
		});
		done();
	});

	it('Prints core version and exits', done => {
		const subProcess = childProcess.fork('index.js', ['-c'], {
			silent: true,
		});
		subProcess.on('close', code => {
			code.should.equal(0);
			done();
		});
	});

	it('Prints own version and exits', done => {
		const subProcess = childProcess.fork('index.js', ['--version'], {
			silent: true,
		});
		subProcess.on('close', code => {
			code.should.equal(0);
			done();
		});
	});

	it('Throws an error for non existent list', done => {
		const subProcess = childProcess.fork(
			'index.js',
			['-L list/does/not/exi.st'],
			{ silent: true }
		);
		subProcess.on('close', code => {
			code.should.equal(1);
			done();
		});
	});

	it('Throws an error for NaN logging level', done => {
		const subProcess = childProcess.fork('index.js', ['-l IamNaN'], {
			silent: true,
		});
		subProcess.on('close', code => {
			code.should.equal(1);
			done();
		});
	});

	it('Throws an error for out of range logging level', done => {
		const subProcess = childProcess.fork('index.js', ['-l 14'], {
			silent: true,
		});
		subProcess.on('close', code => {
			code.should.equal(1);
			done();
		});
	});

	it('Throws an error for out of range logging level (using e representation)', done => {
		const subProcess = childProcess.fork('index.js', ['-l 10e4'], {
			silent: true,
		});
		subProcess.on('close', code => {
			code.should.equal(1);
			done();
		});
	});

	it('Throws an error for non existent files', done => {
		const subProcess = childProcess.fork(
			'index.js',
			['some', 'paths', 'that', 'dont', 'exist'],
			{ silent: true }
		);
		subProcess.on('close', code => {
			code.should.equal(1);
			done();
		});
	});

	it('Throws an error for port already in use', done => {
		const subProcess = childProcess.fork('index.js', ['-p 3000'], {
			silent: true,
		});
		subProcess.on('close', code => {
			code.should.equal(1);
			done();
		});
	});

	it('Throws an error for valid file constaining invalid path', done => {
		const subProcess = childProcess.fork(
			'index.js',
			['-L', path.join(process.cwd(), 'yarn.lock')],
			{ silent: true }
		);
		subProcess.on('close', code => {
			code.should.equal(1);
			done();
		});
	});

	it('Stops the app which was running successfully', done => {
		rootProcess.kill('SIGINT').should.equal(true);
		done();
	});
});
