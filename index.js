const fs = require('fs');
const path = require('path');
const { argv } = require('process');

try {
    fs.readdirSync(argv[2]);
} catch (err) {
    throw(new Error("please provide a valid absolute path"));
}

let cwd = argv[2];
let maxPathLen = 0;
const props = [];
const sizes = ['bytes', 'kb', 'mb', 'gb', 'tb'];

const findFiles = (dirPath) => {
    const files = fs.readdirSync(dirPath);
    files.forEach((fileName) => {
        const absolutePath = path.join(dirPath, fileName);
        if(fs.statSync(absolutePath).isDirectory()) {
            findFiles(dirPath + '/' + fileName);
        } else {
            const fileInfo = {
                filePath: './' + path.relative(cwd, absolutePath),
                fileSize: fs.statSync(absolutePath).size,
            };
            props.push(fileInfo);
        }
    });
};

findFiles(cwd);

const propsSorted = props.sort((a, b) => {
    return b.fileSize - a.fileSize;
});

const parseSize = propsSorted.map((el) => {
    let order = 0;
    let size = el.fileSize;
    while(size >= 1024) {
        size = parseInt(size / 1024);
        ++order;
    }
    el.fileSize = size + sizes[order];
    el.pathLen = el.filePath.length + el.fileSize.length;
    maxPathLen = maxPathLen < el.pathLen ? el.pathLen : maxPathLen;
    return el;
});

maxPathLen += 3;
const res = parseSize.map((el) => {
    return el.filePath + "_".repeat(maxPathLen - el.pathLen) + el.fileSize + '\n';
});

fs.writeFileSync(__dirname + "/sorted_files.txt", res.join(''));
