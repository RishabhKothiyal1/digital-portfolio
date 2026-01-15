const { exec } = require('child_process');
const updateData = require('./update_domain.json');

let jsonString = JSON.stringify(updateData);
// Escape double quotes for Windows cmd: " becomes \"
jsonString = jsonString.replace(/"/g, '\\"');

const command = `npx netlify-cli api updateSite --data "${jsonString}"`;
console.log("Executing:", command);

exec(command, (error, stdout, stderr) => {
    if (error) {
        console.error(`exec error: ${error}`);
        // return; // Keep going to see output
    }
    console.log(`stdout: ${stdout}`);
    if (stderr) console.error(`stderr: ${stderr}`);
});
