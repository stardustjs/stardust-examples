import * as path from "path";
import * as fs from "fs";
import * as mustache from "mustache";
import * as marked from "marked";

function fileExists(path: string): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
        fs.exists(path, (exists) => {
            resolve(exists);
        });
    });
}

function fileRead(path: string) {
    return new Promise<Buffer>((resolve, reject) => {
        fs.readFile(path, (err, data) => {
            if (err) {
                reject(err);
            } else {
                resolve(data);
            }
        });
    });
}

function dirRead(path: string): Promise<string[]> {
    return new Promise<string[]>((resolve, reject) => {
        fs.readdir(path, "utf8", (err, files) => {
            if (err) {
                reject(err);
            } else {
                resolve(files)
            }
        });
    });
}

export interface ExampleMetadata {
    path: string;
    name: string;
    description: string;
    excludes?: string[];
}

export class ExamplesManager {
    rootDir: string;

    constructor(rootDir: string) {
        this.rootDir = rootDir;
    }

    public async getMetadataFromName(name: string): Promise<ExampleMetadata> {
        let examplePath = path.join(this.rootDir, name);
        let configPath = path.join(examplePath, "metadata.json");
        let exists = await fileExists(configPath);
        if (exists) {
            let data = await fileRead(configPath);
            let metadata = JSON.parse(data.toString("utf8")) as ExampleMetadata;
            metadata.name = name;
            metadata.path = examplePath;
            return metadata;
        } else {
            return null;
        }
    }

    public async listExamples(): Promise<ExampleMetadata[]> {
        let files = await dirRead(this.rootDir);
        let metadatas = await Promise.all(files.map(file => this.getMetadataFromName(file)));
        return metadatas.filter(x => x != null);
    }

    /** List the actual files under the example directory */
    public async listExampleFiles(name: string): Promise<string[]> {
        let metadata = await this.getMetadataFromName(name);
        if (!metadata) {
            throw new Error("example not found");
        }
        let files = await dirRead(metadata.path);
        files = files.filter(f => f != "metadata.json");
        return files;
    }

    /** Create an index.html for an example */
    public async renderExample(name: string, template: string): Promise<string> {
        let metadata = await this.getMetadataFromName(name);
        if (!metadata) {
            throw new Error("example not found");
        }
        let readme = await this.getExampleFileText(name, "README.md", metadata);
        let content = readme ? marked.parse(readme) : null;
        let filenames = await this.listExampleFiles(name);
        let files: { filename: string, language: string, code: string, _order: number }[] = [];
        let acceptableExtensions: { [name: string]: string } = {
            ".js": "javascript",
            ".html": "html"
        }
        for (let filename of filenames) {
            if (metadata.excludes && metadata.excludes.indexOf(filename) >= 0) continue;
            let extension = path.extname(filename).toLowerCase();
            if (acceptableExtensions.hasOwnProperty(extension)) {
                let file = {
                    filename: filename,
                    language: acceptableExtensions[extension],
                    code: await this.getExampleFileText(name, filename, metadata),
                    _order: 1
                };
                if (filename == "index.html") file._order = 0;
                files.push(file);
            }
        }
        files.sort((a, b) => {
            if (a._order != b._order) return a._order - b._order;
            return a.filename < b.filename ? -1 : 1;
        });
        return mustache.render(template, {
            content: content,
            description: metadata.description,
            files: files
        });
    }

    // Get a content file from an example
    public async getExampleFileText(name: string, subpath: string, metadata?: ExampleMetadata): Promise<string> {
        let data = await this.getExampleFile(name, subpath, metadata);
        if (data == null) return null;
        return data.toString("utf8");
    }
    public async getExampleFile(name: string, subpath: string, metadata?: ExampleMetadata): Promise<Buffer> {
        if (!metadata) metadata = await this.getMetadataFromName(name);
        if (!metadata) {
            throw new Error("example not found");
        }
        let filepath = path.join(metadata.path, subpath);
        if (await fileExists(filepath)) {
            return await fileRead(filepath);
        } else {
            return null;
        }
    }
}