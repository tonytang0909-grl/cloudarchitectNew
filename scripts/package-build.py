"""Package only portfolio source and the generated standalone runtime."""
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
root = Path(__file__).resolve().parents[1]
out = root / 'exports'
out.mkdir(exist_ok=True)
source = ['app', 'components', 'scripts', 'package.json', 'package-lock.json', 'next.config.ts', 'next-env.d.ts', 'tsconfig.json', 'postcss.config.mjs', 'eslint.config.mjs', 'README.md', 'BUILD-INSTRUCTIONS.md', '.gitignore']
with ZipFile(out / 'TonyPortofolio-source.zip', 'w', ZIP_DEFLATED) as archive:
    for name in source:
        path = root / name
        for file in sorted(path.rglob('*')) if path.is_dir() else [path]:
            if file.is_file():
                archive.write(file, 'TonyPortofolio-source/' + str(file.relative_to(root)))
standalone = root / '.next' / 'standalone'
if not (standalone / 'server.js').exists():
    raise SystemExit('Build first: npm run build')
with ZipFile(out / 'TonyPortofolio-production.zip', 'w', ZIP_DEFLATED) as archive:
    for file in sorted(standalone.rglob('*')):
        if file.is_file() and '.env' not in file.name:
            archive.write(file, 'TonyPortofolio-production/' + str(file.relative_to(standalone)))
    for file in sorted((root / '.next' / 'static').rglob('*')):
        if file.is_file():
            archive.write(file, 'TonyPortofolio-production/.next/static/' + str(file.relative_to(root / '.next' / 'static')))
    if (root / 'public').exists():
        for file in sorted((root / 'public').rglob('*')):
            if file.is_file(): archive.write(file, 'TonyPortofolio-production/public/' + str(file.relative_to(root / 'public')))
    archive.write(root / 'BUILD-INSTRUCTIONS.md', 'TonyPortofolio-production/BUILD-INSTRUCTIONS.md')
for name in ['TonyPortofolio-source.zip', 'TonyPortofolio-production.zip']:
    with ZipFile(out / name) as archive:
        assert archive.testzip() is None
        print(f'{name}: {len(archive.namelist())} files, {(out / name).stat().st_size / 1024 / 1024:.1f} MB, integrity OK')
