import sys

def patch_file(filename):
    with open(filename, 'r') as f:
        content = f.read()

    # The issue is that the tests evaluate only part of the script, or globals are missing.
    # We should add `let _loginEmailEl = null; let _loginPassEl = null;` to the global scope or script eval.
    # In togglePass.test.js:
    if filename == 'tests/togglePass.test.js':
        content = content.replace("eval(togglePassMatch[0]);", "eval('let _loginPassEl = null;' + togglePassMatch[0]);")

    with open(filename, 'w') as f:
        f.write(content)

patch_file('tests/togglePass.test.js')
