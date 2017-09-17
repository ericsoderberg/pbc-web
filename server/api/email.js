import { markdown } from 'markdown';
import { getSession, requireSession } from './auth';
import { backgroundColor, catcher } from './utils';

const BACKGROUND_COLOR = '#f2f2f2';

export const renderNotification = (message, label, url) => ({
  html:
`
<html>
<head></head>
<body style="background-color: ${BACKGROUND_COLOR};">
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

export const renderEmail = contents => `
<html>
<head></head>
<body style="margin: 0; padding: 0; ${backgroundColor(BACKGROUND_COLOR)}">
<div style="padding: 24px 0; ${backgroundColor(BACKGROUND_COLOR)}">
<div style="max-width: 480px; margin: 0 auto; padding: 0 24px;
border: 1px solid transparent;
box-sizing: border-box;
background-color: #ffffff; color: #333333;
font-family: 'Work Sans', Arial, sans-serif; font-size: 18px;">
  ${markdown.toHTML(contents || '*awaiting some content*')}
</div>
</div>
</body>
</html>
`;

export default function (router) {
  router.post('/email/render', (req, res) => {
    getSession(req)
      .then(requireSession)
      .then(() => renderEmail(req.body.contents))
      .then(markup => res.send(markup))
      .catch(error => catcher(error, res));
  });
}
