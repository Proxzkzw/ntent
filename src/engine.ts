import { exec } from 'child_process';
import * as util from 'util';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

const execPromise = util.promisify(exec);

export async function validatePythonSyntax(code: string): Promise<{ valid: boolean; error?: string }> {
    const tmpFile = path.join(os.tmpdir(), `ntent_val_${Date.now()}.py`);
    try {
        fs.writeFileSync(tmpFile, code, 'utf8');
        await execPromise(`python -m py_compile "${tmpFile}"`);
        return { valid: true };
    } catch (err: any) {
        return { valid: false, error: err.stderr || err.message };
    } finally {
        if (fs.existsSync(tmpFile)) fs.unlinkSync(tmpFile);
    }
}

export function spliceIntoCode(original: string, newCode: string): string {
    return original.trimEnd() + "\n\n" + newCode;
}