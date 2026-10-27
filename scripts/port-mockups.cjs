// Convertit les planches de la maquette (*.dc.html) en composants React (JSX).
const fs = require('fs'), path = require('path')
const HTMLtoJSX = require('htmltojsx')
const src = process.argv[2], out = path.join(__dirname, '..', 'src', 'screens', 'mock')
const conv = new HTMLtoJSX({ createClass: false })
for (const f of fs.readdirSync(src).filter((x) => x.endsWith('.dc.html'))) {
  const name = f.replace('.dc.html', '')
  const html = fs.readFileSync(path.join(src, f), 'utf8')
  const m = html.match(/<div class="scr">[\s\S]*<\/div>\s*<\/x-dc>/)
  if (!m) { console.log('skip', f); continue }
  let body = m[0].replace(/<\/x-dc>\s*$/, '')
  let jsx = conv.convert(body).trim()
  jsx = jsx.replace(/ value=/g, ' defaultValue=').replace(/ checked(?=[ >\/])/g, ' defaultChecked')
  jsx = jsx.replace(/<input([^>]*?)(?<!\/)>/g, '<input$1 />').replace(/<textarea/g, '<textarea')
  fs.writeFileSync(path.join(out, name + '.tsx'),
    `// Fichier généré par scripts/port-mockups.cjs depuis la maquette (${f}).\nexport default function ${name}() {\n  return (\n${jsx.split('\n').map((l) => '    ' + l).join('\n')}\n  )\n}\n`)
  console.log('ok', name)
}
