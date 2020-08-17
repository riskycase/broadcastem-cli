#!/usr/bin/env node

/**
 * Module dependencies.
 */

const http = require('http');
const path = require('path');
const broadcastemCore = require('broadcastem-core');
const fs = require('fs');
const os = require('os');

let server;

/** 
 * Accept CLI arguments
 */
const yargs = require('yargs');
const argv = yargs.options({
	'port': {
			alias: 'p',
			describe: 'the port to bind to on this machine',
			default: process.env.PORT || 3000,
			group: 'Configuration:',
			type: 'number',
			requiresArg: true
		},
	'list': {
			alias: 'L',
			describe: 'a list file which has the paths to the files you want to share',
			group: 'Configuration:',
			type: 'string',
			requiresArg: true
		},
	'destination': {
			alias: 'd',
			describe: 'folder where incoming files will be saved',
			default: path.resolve(os.homedir(), 'Downloads', 'Broadcastem Received'),
			group: 'Configuration:',
			type: 'string',
			requiresArg: true
		},
	'logging-level': {
			alias: ['l', 'log'],
			describe: `one of the following logging levels
			0 - do not log anything
			1 - log only errors (Response codes > 400)
			2 - log all requests`,
			default: 0,
			group: 'Configuration:',
			type: 'number',
			requiresArg: true
		},
	'core-version': {
			alias: 'c',
			describe: `print version of the core module and exit`,
			type: 'boolean'
		}
	})
	.check(argv => {
		if(isNaN(argv.port))
			throw new Error('Port should be a number');
		else if(argv.port <= 0)
			throw new Error('Port should be positive');
		else if(argv.list && !fs.existsSync(argv.list))
			throw new Error(`Specified file ${argv.list} doesnt exist`);
		else if(isNaN(argv.loggingLevel))
			throw new Error('Logging level should be a number');
		else if(argv.loggingLevel < 0 || argv.loggingLevel > 2)
			throw new Error('Invalid logging level');
		else if(!argv._.every(path => fs.existsSync(path)))
			throw new Error('All the files to be shared must be present on disk');
		return true;
	})
	.wrap(yargs.terminalWidth())
	.argv;
// Since we are taking file paths as the remaining input, pass it on to files property for easy reading
argv.files = argv._;
argv.restart = true;

if(argv.coreVersion) {
	console.log(require(path.resolve(require.resolve('broadcastem-core'), '..', 'package.json')).version);
	process.exit(0);
}

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
	const port = parseInt(val, 10);

	if (isNaN(port)) {
	// named pipe
	return val;
	}

	if (port >= 0) {
	// port number
	return port;
	}

	return false;
}

/**
 * Get port from environment and store in Express.
 */

const port = normalizePort(argv.port);

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
	if (error.syscall !== 'listen') {
	throw error;
	}

	const bind = typeof port === 'string'
	? 'Pipe ' + port
	: 'Port ' + port;

	// handle specific listen errors with friendly messages
	switch (error.code) {
	case 'EACCES':
		console.error(bind + ' requires elevated privileges');
		process.exit(1);
		break;
	case 'EADDRINUSE':
		console.error(bind + ' is already in use');
		process.exit(1);
		break;
	default:
		throw error;
	}
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
	const addr = server.address();
	const bind = typeof addr === 'string'
	? 'pipe ' + addr
	: 'port ' + addr.port;
	console.log('Listening on ' + bind);
}

/**
 * Start Express app from the CLI flags
 */
 
broadcastemCore.init(argv)
	.then((app) => {

		/**
		 * Create HTTP server.
		 */

		server = http.createServer(app);

		/**
		 * Listen on provided port, on all network interfaces.
		 */

		server.listen(port);
		server.on('error', onError);
		server.on('listening', onListening);
		
	})
	.catch((err) => {
		console.error(err);
		process.exit(1);
	})
	.finally(() => {
		if (process.platform === 'win32') {
			const rl = require('readline').createInterface({
			input: process.stdin,
			output: process.stdout
			});

			rl.on('SIGINT', function () {
			process.emit('SIGINT');
			});
		}

		process.on('SIGINT', function () {
			if(server.listening) server.close();
			console.log('Shutting down server')
			process.exit();
		});
	});
