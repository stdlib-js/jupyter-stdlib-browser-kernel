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
	var deps;

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
		return {
			'onload': onload
		};

		/**
		* Callback invoked upon loading a kernel.
		*
		* @private
		*/
		function onload() {
			console.log( 'Callback invoked!' );
			console.log( jupyter );
		}
	}
})();