import { markdown } from 'markdown';

export const renderNotification = (message, label, url) => ({
  html:
`
<html>
<head></head>
<body style="background-color: #f2f2f2;">
<div style="padding: 48px; max-width: 480px; margin: 48px auto;
background-color: #ffffff; color: #333333;
font-family: 'Work Sans', Arial, sans-serif; font-size: 18px;">
${markdown.toHTML(message || '')}
<a style="display: inline-block; text-decoration: none; font-size: 24px;
margin: 24px auto 0 auto; padding: 12px 24px;
background-color: #666666; color: #ffffff;"
href="${url}">
${label}
</a>
</div>
</body>
</html>
`,
  text:
`
${message}

${url}
`,
});
