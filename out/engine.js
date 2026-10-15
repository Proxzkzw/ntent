"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validatePythonSyntax = validatePythonSyntax;
exports.spliceIntoCode = spliceIntoCode;
const child_process_1 = require("child_process");
const util = require("util");
const fs = require("fs");
const path = require("path");
const os = require("os");
const execPromise = util.promisify(child_process_1.exec);
async function validatePythonSyntax(code) {
    const tmpFile = path.join(os.tmpdir(), `ntent_val_${Date.now()}.py`);
    try {
        fs.writeFileSync(tmpFile, code, 'utf8');
        await execPromise(`python -m py_compile "${tmpFile}"`);
        return { valid: true };
    }
    catch (err) {
        return { valid: false, error: err.stderr || err.message };
    }
    finally {
        if (fs.existsSync(tmpFile))
            fs.unlinkSync(tmpFile);
    }
}
function spliceIntoCode(original, newCode) {
    return original.trimEnd() + "\n\n" + newCode;
}
//# sourceMappingURL=engine.js.map