const { cpSync, readdirSync, mkdirSync } = require('fs');
const { join, dirname } = require('path');

function copy(dir) {
	for (const entry of readdirSync(dir, { withFileTypes: true })) {
		const src = join(dir, entry.name);
		if (entry.isDirectory()) {
			copy(src);
		} else if (/\.(svg|png)$/.test(entry.name)) {
			const dest = join('dist', src);
			mkdirSync(dirname(dest), { recursive: true });
			cpSync(src, dest);
		}
	}
}

copy('nodes');
