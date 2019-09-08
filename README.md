<!--

@license Apache-2.0

Copyright (c) 2019 The Stdlib Authors.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

-->

# jupyter-stdlib-browser-kernel

> Run an in-browser JavaScript Jupyter kernel.

<!-- Section to include introductory text. Make sure to keep an empty line after the intro `section` element and another before the `/section` close. -->

<section class="intro">

</section>

<!-- /.intro -->

<!-- Installation documentation -->

<section class="installation">

## Prerequisites

Installing and running the kernel **requires** the following prerequisites:

-   [Node.js][node.js]: JavaScript runtime (preferably the latest LTS version)
-   [npm][npm]: package manager
-   [Jupyter][jupyter]: notebook environment and runtime

[Node.js][node.js] and [npm][npm] are only needed during the installation sequence.

## Installation

To install the Jupyter kernel, navigate to the user directory for installing Jupyter kernels

```bash
$ cd $(jupyter --data-dir)/kernels
```

If the directory does not already exist, create the `kernels` folder

```bash
$ $(jupyter --data-dir)/kernels
```

and then navigate to the created directory. Once in the `kernels` directory, clone this repository

```bash
$ git clone https://github.com/stdlib-js/jupyter-stdlib-browser-kernel
```

Navigate to the newly created directory

```bash
$ cd jupyter-stdlib-browser-kernel
```

and run the install sequence

```bash
$ npm install
```

</section>

<!-- Usage documentation. -->

<section class="usage">

## Usage

Navigate to the directory from which you want to load, save, and/or edit notebooks

```bash
$ cd /path/to/directory
```

and launch Jupyter notebook

```bash
$ jupyter notebook
```

Once opened, select the `JavaScript (in-browser)` notebook kernel.

</section>

<!-- /.usage -->

<!-- Usage notes. Make sure to keep an empty line after the `section` element and another before the `/section` close. -->

<section class="notes">

</section>

<!-- /.notes -->

<!-- Usage examples. -->

<section class="examples">

</section>

<!-- /.examples -->

<!-- Section to include cited references. If references are included, add a horizontal rule *before* the section. Make sure to keep an empty line after the `section` element and another before the `/section` close. -->

<section class="references">

</section>

<!-- /.references -->

<!-- Section for all links. Make sure to keep an empty line after the `section` element and another before the `/section` close. -->

<section class="links">

[node-js]: https://nodejs.org/en/

[npm]: https://www.npmjs.com/

[jupyter]: https://jupyter.org/install

</section>

<!-- /.links -->