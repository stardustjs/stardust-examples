import os
import subprocess
import shutil
import markdown
import mustache
import yaml

OUTPUT_ROOT = "../stardustjs.github.io/examples"

template = """---
layout: default
title: "{{description}}"
---
<h1>{{description}}</h1>
<iframe class="example-container" src="content.html" width="960px" height="500px" scrolling="no" sandbox="allow-popups allow-scripts allow-forms allow-same-origin"></iframe>
{{{content}}}
{{#files}}
    <h2>{{filename}}</h2>
    <pre><code class="highlight {{language}}">{{code}}</code></pre>
{{/files}}
"""

def GenerateBlock(inputDir, files, outputDir):
    if not os.path.exists(outputDir):
        os.makedirs(outputDir)

    index = ""
    showFiles = []
    config = {
        "description": ""
    }

    for file in files:
        if file == ".block":
            with open(os.path.join(inputDir, file), "rb") as f:
                content = f.read().decode("utf-8")
                config = yaml.load(content)

        elif file == "index.html":
            shutil.copy(os.path.join(inputDir, file), os.path.join(outputDir, "content.html"))
            with open(os.path.join(inputDir, file), "rb") as f:
                showFiles.append({
                     "filename": file,
                     "code": f.read().decode("utf-8"),
                     "language": "html"
                })

        elif file == "README.md":
            with open(os.path.join(inputDir, file), "rb") as f:
                content = f.read().decode("utf-8")
                index = markdown.markdown(content)

        else:
            shutil.copy(os.path.join(inputDir, file), os.path.join(outputDir, file))

            if os.path.splitext(file)[1] == ".js":
                if not file.endswith(".min.js"):
                    with open(os.path.join(inputDir, file), "rb") as f:
                        showFiles.append({
                            "filename": file,
                            "code": f.read().decode("utf-8"),
                            "language": "javascript"
                        })

            if file == "preview.png":
                subprocess.check_call([ "convert", os.path.join(inputDir, file), "-thumbnail", "480x250", os.path.join(outputDir, "preview_small.png") ])

    code = mustache.render(template, {
        "description": config["description"],
        "content": index,
        "files": showFiles
    })
    with open(os.path.join(outputDir, "index.html"), "wb") as f:
        f.write(code.encode("utf-8"))

for root, dirs, files in os.walk("."):
    if ".block" in files:
        GenerateBlock(root, files, os.path.join(OUTPUT_ROOT, root))