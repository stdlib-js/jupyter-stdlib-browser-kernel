/**
* @license Apache-2.0
*
* Copyright (c) 2019 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/

'use strict';

(function main() {
	var VERSION;
	var deps;

	// Define the implementation version:
	VERSION = '0.0.0';

	// Define module dependencies:
	deps = [ 'base/js/namespace' ];

	// Register the factory function:
	define( deps, factory );

	/**
	* Module factory.
	*
	* @private
	* @param {Object} jupyter - Jupyter notebook instance
	* @returns {Object} an object containing a callback to be invoked upon loading a kernel
	*/
	function factory( jupyter ) {
		var counter;
		var kernel;

		// Cache a reference to the notebook kernel:
		kernel = jupyter.notebook.kernel;

		// Initialize an execution counter:
		counter = 1;

		// Return a callback to be called upon loading a kernel:
		return {
			'onload': onload
		};

		/**
		* Callback invoked upon loading a kernel.
		*
		* @private
		*/
		function onload() {
			var keys;
			var ch;
			var i;

			// Monkey-patch various kernel methods...
			kernel.is_connected = isConnected;
			kernel.is_fully_disconnected = isFullyDisconnected;
			kernel.inspect = inspect;
			kernel.complete = complete;
			kernel.execute = execute;
			kernel.kernel_info = kernelInfo;

			// Stop WebSockets and signal that we are connected...
			keys = Object.keys( kernel.channels );
			for ( i = 0; i < keys.length; i++ ) {
				ch = kernel.channels[ keys[ i ] ];
				ch.onclose = noop;
				ch.onerror = noop;
			}
			kernel.start_channels = startChannels;

			// Close the WebSocket:
			kernel.stop_channels();

			// Invoke the monkey-patched method to indicate that we're now connected:
			kernel.start_channels();
		}

		/**
		* Executes a code string.
		*
		* ## Notes
		*
		* -   When calling this function pass a `callbacks` object of the form:
		*
		*     ```text
		*     callbacks = {
		*         'shell': {
		*             'reply': execute_reply_callback,
		*             'payload': {
		*                 'set_next_input': set_next_input_callback,
		*             }
		*         },
		*         'iopub': {
		*             'output': output_callback,
		*             'clear_output': clear_output_callback,
		*         },
		*         'input': raw_input_callback
		*     }
		*     ```
		*
		*     Each callback will be passed the entire message as a single argument. Payload handlers will be passed the corresponding payload and the `execute_reply` message.
		*
		* @private
		* @param {string} code - code to execute
		* @param {Object} [callbacks] - an object containing callbacks
		* @param {Function} [callbacks.shell.reply] - shell reply callback
		* @param {Function} [callbacks.shell.payload.[payload_name]] - shell payload callback
		* @param {Function} [callbacks.iopub.output] - iopub output callback
		* @param {Function} [callbacks.iopub.clear_output] - iopub clear output callback
		* @param {Function} [callbacks.input] - input callback
		* @param {boolean} [callbacks.clear_on_done=true] - boolean indicating whether to clear once done
		* @param {object} [options] - options object
		* @param {boolean} [options.silent=false] - boolean indicating whether to silence output
		* @param {Object} [options.user_expressions={}] - user expressions
		* @param {boolean} [options.allow_stdin=false] - boolean indicating whether to allow stdin
		*/
		function execute( code, callbacks, options ) {
			var success;
			var reply;
			var idle;
			var req;
			var res;
			var log;
			var r;

			// Generate a kernel message:
			req = kernel._get_msg( 'execute_request', {
				'code': code
			});

			// Set message callbacks:
			kernel.set_callbacks_for_msg( req.header.msg_id, callbacks );

			// Cache a reference to `console.log`:
			log = console.log;

			// Intercept `console.log` invocations and handle as `stdout` messages:
			console.log = stdout;

			// Attempt to evaluate the code:
			try {
				r = eval( code ); // FIXME: assumes synchronous code!!!
			} catch ( err ) {
				r = err;
				success = false;
			}
			// Restore `console.log`:
			console.log = log;

			if ( r !== null && r !== void 0 ) {
				if ( success ) {
					// Generate a kernel message:
					res = kernel._get_msg( 'execute_result', {
						'execution_count': counter,
						'data': {
							'text/plain': r.toString()
						},
						'metadata': {}
					});
				} else {
					// Generate a kernel message:
					res = kernel._get_msg( 'error', {
						'execution_count': counter,
						'ename': r.name,
						'evalue': r.message,
						'traceback': [ r.stack ]
					});
				}
				res.parent_header = req.header;

				// Dispatch an IOPub message to the respective handler:
				kernel._handle_iopub_message( res );
			}
			// Generate a kernel message:
			idle = kernel._get_msg( 'status', {
				'status': 'idle'
			});
			idle.parent_header = req.header;

			// Dispatch an IOPub message to the respective handler:
			kernel._handle_iopub_message( idle );

			// Generate a kernel message:
			reply = kernel._get_msg( 'execute_reply', {
				'status': 'ok',
				'execution_count': counter
			});
			reply.parent_header = req.header;

			// Dispatch a shell message to the respective handler:
			kernel._handle_shell_reply( reply );

			// Update the execution counter
			counter += 1;

			/**
			* Mocks `stdout` messages.
			*
			* @private
			* @param {...*} [args] - arguments
			*/
			function stdout() {
				var data;
				var msg;
				var i;

				// FIXME: `console.log` performs string interpolation
				data = '';
				for ( i = 0; i < arguments.length; i++ ) {
					if ( i > 0 ) {
						data += ' ';
					}
					data += arguments[ i ];
				}
				data += '\n';

				// Generate a kernel message:
				msg = kernel._get_msg( 'stream', {
					'name': 'stdout',
					'text': data
				});
				msg.parent_header = req.header;

				// Dispatch the IOPub message to the respective handler:
				kernel._handle_iopub_message( msg );
			}
		}

		/**
		* Provides kernel information.
		*
		* ## Notes
		*
		* -   When calling this method, provide a callback function that expects one argument. The callback will be passed the complete `kernel_info_reply` [message][kernel-info].
		*
		* [kernel-info]: https://jupyter-client.readthedocs.io/en/latest/messaging.html#kernel-info
		*
		* @private
		* @param {Function} [clbk] - callback function
		*/
		function kernelInfo( clbk ) {
			var reply;

			// Generate a kernel message:
			reply = kernel._get_msg( 'kernel_info_reply', {
				'protocol_version': '5.0.0',
				'implementation': 'stdlib-browser-kernel',
				'implementation_version': VERSION,
				'language_info': {
					'name': 'javascript',
					'mimetype': 'text/javascript',
					'file_extension': '.js'
				}
			});

			if ( clbk ) {
				clbk( reply );
			}
		}

		/**
		* Start WebSocket channels, stopping and restarting them if they already exist.
		*
		* @private
		*/
		function startChannels() {
			// Perform necessary tasks once the connection to the kernel has been established, including requesting information about the kernel:
			kernel._kernel_connected();
		}
	}

	/**
	* Checks whether there is a connection to the kernel.
	*
	* @private
	* @returns {boolean} boolean indicating whether there is a connection to the kernel
	*/
	function isConnected() {
		return true;
	}

	/**
	* Checks whether the connection to the kernel has been completely severed.
	*
	* @private
	* @returns {boolean} boolean indicating whether a connection has been severed
	*/
	function isFullyDisconnected() {
		return false;
	}

	/**
	* Returns object information.
	*
	* ## Notes
	*
	* -   When calling this method with a callback, pass a callback function that expects one argument. The callback will be passed an `inspect_reply` [message][object-information].
	*
	* [object-information]: https://jupyter-client.readthedocs.io/en/latest/messaging.html#object-information
	*
	* @private
	* @param {string} code - code string
	* @param {integer} cursor_pos - cursor position
	* @param {Function} callback - callback
	*/
	function inspect() {
		// TODO: implement?
	}

	/**
	* Performs completion.
	*
	* ## Notes
	*
	* -   When calling this method with a callback, pass a callback function that expects one argument. The callback will be passed a `complete_reply` [message][complete].
	*
	* [complete]: https://jupyter-client.readthedocs.io/en/latest/messaging.html#complete
	*
	* @private
	* @param {string} code - code string
	* @param {integer} cursor_pos - cursor position
	* @param {Function} callback - callback
	*/
	function complete() {
		// TODO: implement?
	}

	/**
	* Non-operation.
	*
	* @private
	*/
	function noop() {
		// No-op...
	}
})();
