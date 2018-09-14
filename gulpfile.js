var gulp = require('gulp');
var svgexport = require('svgexport');
var fs = require('fs');
var archiver = require('archiver');
var glob = require("glob")
const path = require('path');
var formats = require('./gulpconfig.json');
var imageGenDir = "gen";
var archiveDir = "zip";
var symbolsDir = "Symbols";
gulp.task('default', function() {
    if (!fs.existsSync(imageGenDir)) { 
        fs.mkdirSync(imageGenDir); 
    }    
    formats.forEach(format => {
        var formatDir = path.join(imageGenDir, format.name);
        if (!fs.existsSync(formatDir)) {
            fs.mkdirSync(formatDir);
        }
        format.categories.forEach(category => {
            category.styles.forEach(style => {
                generateImages(category.name, style.name, format.name, format.extension, style.options)
            })
        });
        createArchive(format.name, format.archiveFile);
    });
});
function generateImages(imageCategory, imageStyle, folderName, fileExtension, extraOptions) {
    var directory = path.join(symbolsDir, imageStyle, imageCategory);
    glob("**/*.svg", { cwd: directory }, (error, filePaths) => {
        var conversionData = [];
        filePaths.forEach(filePath => {
            var fileName = path.basename(filePath, '.svg');
            var dataParameters = {
                "input": [
                    path.join(directory, filePath)
                ],
                "output": []
            };
            var fileSuffix = imageStyle == "Color" ? "-color" : "";
            var options = [
                path.join(imageGenDir, folderName, imageCategory, fileName + fileSuffix + fileExtension)
            ];
            dataParameters.output.push(options.concat(extraOptions));
            conversionData.push(dataParameters);
        });
        console.dir(conversionData, { depth: 5, colors: true });
        svgexport.render(conversionData, () => {});
    });
}
function createArchive(folderName, archiveFileName) {
    if (!fs.existsSync(archiveDir)) { 
        fs.mkdirSync(archiveDir); 
    }    
    var output = fs.createWriteStream(path.join(archiveDir, archiveFileName));
    console.log("Creating zip file at: " + output)
    var archive = archiver('zip', {
        zlib: { level: 9 }
    });
    archive.pipe(output);
    archive.directory(path.join(imageGenDir, folderName), false);
    archive.finalize();
}