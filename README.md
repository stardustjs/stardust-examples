[Archived] Stardust Example Code
====

Please use the unified repo for further development: https://github.com/stardustjs/stardust

Stardust Example Code
====

This repository provides a set of Web visualization and graphic examples using the Stardust library.

Gettings started
----

### Requirements

Before executing these examples, make sure you have [node.js](https://nodejs.org) installed:

```bash
node -v
```
Expected output could be `v10.0.0`, otherwise please instale `node` and `npm`. You will find detailed instructions how to install these on the web.

### Clone the repository

If you prefer SSH:

```bash
git clone git@github.com:stardustjs/stardust-examples.git
```

or if you prefer HTTPS:

```bash
https://github.com/stardustjs/stardust-examples.git
```
Both will work.

### Install dependencies

Change directory into the new repository (`cd stardust-examples`) and install all dependencies:

```bash
npm install
```

Or if you prefer `yarn`:

```bash
yarn
```

### Serve examples

This package has a built-in node server from which you can serve the examples on your local machine. Therefore use one of these scripts:

| command        | description                                                              |
|----------------|--------------------------------------------------------------------------|
| npm run build  | Transpile all examples for distribution on an external server            |
| npm run start  | Serve examples on locale machine. Before serving, mind to build it first |
| npm run watch  | Serve development server with hot reloads                                |
| npm run deploy | Deploy examples                                                          |

If you prefer `yarn`, just replace `npm run` with `yarn`. For example `yarn build`.


Example Structure
----

We use a similar approach as in bl.ocks.org:

- Each example is runnable standalone with some common code provided in the `static` folder in this repository.
- Each example has a `metadata.json` file for description, and a `preview.png` file for thumbnail.
- The content of each example is rendered as a HTML file for reading online.

Common code for all examples:

- `static/assets/style.css`: The common CSS styling for Stardust's examples to have a uniform look
- `static/assets/utils.js`: Some utility functions, including:
    - FPS measure
    - Transition timing
- `stardust/stardust.bundle.js`
    - The version of Stardust that works with the examples.

`metadata.json` format:

    {
        description: "A short description file",
        excludes?: [
            "file.to.exclude",
            ...
        ]
    }
