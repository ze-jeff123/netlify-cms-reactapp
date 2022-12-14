const fs = require('fs');
const path = require('path');
const metadataParser = require("markdown-yaml-metadata-parser");
const MarkdownIt = require("markdown-it");
const { parse } = require('path');

const postsRoot = 'posts/nested-posts/banca-nationala';
const md = new MarkdownIt();

function parsePost(dir) {
    return fs.promises.readdir(dir)
        .then((val) => {
            return [
                Promise.allSettled(val
                    .filter((file => path.extname(file) !== '.md'))
                    .map((file) => parsePost(path.join(dir,file)))
                ),
                val
                    .filter((file) => path.extname(file) === '.md')
                    .map((file) => {
                        return fs.promises.readFile(path.join(dir, file), { encoding: 'utf8' })
                            .then((text) => {
                                console.log(text);
                                const { content, metadata } = metadataParser(text);
                                return {
                                    content: md.render(content),
                                    metadata: metadata,
                                }
                            })
                    })[0]
                ]
        })
}

/*
function settleTree(tree) {
    if (!Array.isArray(tree)) {
        return tree;
    }
    return Promise.allSettled(tree).then((val) => {
        return val.map((val) => settleTree(val));
    })
}


parsePost(postsRoot).then(val => {
    settleTree(val).then((val) => {
        console.log(val);
    })
})*/

function flattenTree(tree) {
    if (!Array.isArray(tree)) return tree;
    return tree.map((val) => flattenTree(val.value))
}
parsePost(postsRoot).then(val => {
    Promise.allSettled(val).then(val => {
        const x = flattenTree(val);
        console.log(x);
    })
});
/*
Promise.allSettled(parsePost(postsRoot)).then((val) => {
    console.log(val);
});*/