import { ExamplesManager } from "./examples";
import * as Templates from "./templates";
import * as path from "path";
import * as rimraf from "rimraf";
import * as mkdirp from "mkdirp";
import * as fs from "fs";

let manager = new ExamplesManager("./examples");

async function renderExamples(destination: string) {
    let examples = await manager.listExamples();
    for(let example of examples) {
        let files = await manager.listExampleFiles(example.name);
        let outdir = path.join(destination, example.name);
        await new Promise((resolve, reject) => {
            rimraf(outdir, (error) => {
                resolve();
            });
        })
        mkdirp.sync(outdir);
        for(let f of files) {
            if(f == "README.md") continue;
            let contents = await manager.getExampleFile(example.name, f, example);
            console.log(example.name, f, contents.length);
            if(f == "index.html") f = "content.html";
            fs.writeFileSync(path.join(outdir, f), contents);
        }
        let index = await manager.renderExample(example.name, Templates.jekyllTemplate);
        fs.writeFileSync(path.join(outdir, "index.html"), new Buffer(index, "utf8"));
    }
}

renderExamples("../stardustjs.github.io/examples");