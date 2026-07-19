import fs from 'fs';

let content = fs.readFileSync('src/components/Preview/CVDocumentPDF.jsx', 'utf8');

// Remove Font.register
content = content.replace(/\/\/ Register Inter font.*?\}\)/s, '');
content = content.replace(/,\s*Font\s*/, '');
content = content.replace(/Font,\s*/, '');

// Replace all fontFamily: 'Roboto' with Helvetica
content = content.replace(/fontFamily:\s*['"]Roboto['"]/g, "fontFamily: 'Helvetica'");

// Import Svg and Path
content = content.replace(/import \{ Document, Page, Text, View, StyleSheet, Link, Image \} from '@react-pdf\/renderer'/, "import { Document, Page, Text, View, StyleSheet, Link, Image, Svg, Path } from '@react-pdf/renderer'");

// Add ExternalLinkIcon
const iconCode = `
const ExternalLinkIcon = () => (
  <Svg viewBox="0 0 24 24" style={{ width: 7, height: 7, marginLeft: 2, marginTop: 1 }}>
    <Path d="M14 3h7v7M21 3L10 14" stroke="#000000" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </Svg>
);
`;
content = content.replace("const styles = StyleSheet.create({", iconCode + "\nconst styles = StyleSheet.create({");

// Fix parseMarkdownPDF to return Text for strings and View for links
content = content.replace(/nodes\.push\(\s*<Link key=\{match\.index\} src=\{fullHref\} style=\{styles\.pdfLink\}>\s*<Text>\{label\} ↗<\/Text>\s*<\/Link>\s*\)/, `nodes.push(
        <View key={match.index} style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Link src={fullHref} style={styles.pdfLink}>
            <Text>{label}</Text>
          </Link>
          <ExternalLinkIcon />
        </View>
      )`);

content = content.replace(/nodes\.push\(text\.slice\(lastIndex, match\.index\)\)/, `nodes.push(<Text key={\`text-\${lastIndex}\`}>{text.slice(lastIndex, match.index)}</Text>)`);
content = content.replace(/nodes\.push\(text\.slice\(lastIndex\)\)/, `nodes.push(<Text key={\`text-end-\${lastIndex}\`}>{text.slice(lastIndex)}</Text>)`);

// Wait! If parseMarkdownPDF returns <View> and <Text>, it MUST NOT be wrapped inside <Text> in the render!
// I need to change <Text style={styles.entryTitle}>{parseMarkdownPDF(...)}</Text> to <View style={{...styles.entryTitle, flexDirection: 'row', flexWrap: 'wrap'}}>{parseMarkdownPDF(...)}</View>

content = content.replace(/<Text style=\{styles\.entryTitle\}>\{parseMarkdownPDF\(([^)]+)\)\}<\/Text>/g, `<View style={{...styles.entryTitle, flexDirection: 'row', flexWrap: 'wrap'}}>{parseMarkdownPDF($1)}</View>`);
// Wait, parseMarkdownPDF(`[${pub.title}](${pub.url})`) has inner parens!
content = content.replace(/<Text style=\{styles\.entryTitle\}>\s*\{pub\.url \? parseMarkdownPDF\(\`\[\$\{pub\.title\}\]\(\$\{pub\.url\}\)\`\) : pub\.title\}\s*<\/Text>/, `<View style={{...styles.entryTitle, flexDirection: 'row', flexWrap: 'wrap'}}>
                    {pub.url ? parseMarkdownPDF(\`[\${pub.title}](\${pub.url})\`) : <Text>{pub.title}</Text>}
                  </View>`);
content = content.replace(/<Text style=\{styles\.entryTitle\}>\s*\{proj\.url \? parseMarkdownPDF\(\`\[\$\{proj\.title\}\]\(\$\{proj\.url\}\)\`\) : proj\.title\}\s*<\/Text>/, `<View style={{...styles.entryTitle, flexDirection: 'row', flexWrap: 'wrap'}}>
                    {proj.url ? parseMarkdownPDF(\`[\${proj.title}](\${proj.url})\`) : <Text>{proj.title}</Text>}
                  </View>`);

// Fix bullet points Text wrappers
content = content.replace(/<Text style=\{styles\.bulletText\}>\{parseMarkdownPDF\(b\)\}<\/Text>/g, `<View style={styles.bulletText}>{parseMarkdownPDF(b)}</View>`);
content = content.replace(/<Text style=\{styles\.entryDesc\}>\{parseMarkdownPDF\(([^)]+)\)\}<\/Text>/g, `<View style={styles.entryDesc}>{parseMarkdownPDF($1)}</View>`);
content = content.replace(/<Text style=\{styles\.entryExtra\}>\{parseMarkdownPDF\(([^)]+)\)\}<\/Text>/g, `<View style={styles.entryExtra}>{parseMarkdownPDF($1)}</View>`);

// Fix header contacts
content = content.replace(/<Link src=\{ensureHttp\(link\.href\)\} style=\{styles\.headerLink\}>\s*<Text>\{link\.label\} ↗<\/Text>\s*<\/Link>/g, `<Link src={ensureHttp(link.href)} style={styles.headerLink}><Text>{link.label}</Text></Link><ExternalLinkIcon />`);

// Replace ↗ with empty string in parseMarkdownPDF just in case
content = content.replace(/↗/g, '');

fs.writeFileSync('src/components/Preview/CVDocumentPDF.jsx', content);
console.log('Fixed CVDocumentPDF.jsx');
