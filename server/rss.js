import express from 'express';
import mongoose from 'mongoose';
import moment from 'moment';
import escape from 'escape-html';

mongoose.Promise = global.Promise;

const router = express.Router();

// /*.rss

const FILE_TYPE_REGEXP = /^audio/;
const ID_REGEXP = /^[0-9a-fA-F]{24}$/;

function rfc822(date) {
  return moment(date).format('ddd, DD MMM YYYY HH:mm:ss ZZ');
}

function renderRSS(req, library, messages) {
  const { podcast } = library;
  const urlBase = req.headers.origin || `https://${req.headers.host}`;
  const path = `/libraries/${library.path || library._id}`;

  const items = messages.map((message) => {
    const enclosures = message.files
    .filter(file => FILE_TYPE_REGEXP.test(file.type))
    .map(file => (
      `<enclosure url="${urlBase}/api/files/${file._id}/${file.name}"
length="${file.size}" type="${file.type}" />`
    )).join('\n');

    return `<item>
      <title>${message.name}</title>
      <link>${urlBase}/messages/${message._id}</link>
      <guid>${urlBase}/messages/${message._id}</guid>
      <description>${message.text}</description>
      ${enclosures}
      <category>Podcasts</category>
      <pubDate>${rfc822(message.date)}</pubDate>

      <itunes:author>${message.author}</itunes:author>

      <itunes:explicit>No</itunes:explicit>
      <itunes:subtitle>${message.text}</itunes:subtitle>
      <itunes:summary>${message.text}</itunes:summary>
    </item>`;
  }).join('\n\n    ');

  const channel = `<channel>
    <title>${podcast.title}</title>
    <description>${podcast.description}</description>
    <link>${urlBase}${path}</link>
    <language>en-us</language>
    <copyright>Copyright ${moment().year()}</copyright>
    <lastBuildDate>${rfc822(messages[0].modified)}</lastBuildDate>
    <pubDate>${rfc822(messages[0].date)}</pubDate>
    <docs>http://blogs.law.harvard.edu/tech/rss</docs>
    <webMaster>${library.userId.email}</webMaster>

    <itunes:subtitle>${podcast.subtitle}</itunes:subtitle>
    <itunes:summary>${podcast.summary}</itunes:summary>

    <itunes:owner>
     <itunes:name>${library.userId.name}</itunes:name>
     <itunes:email>${library.userId.email}</itunes:email>
    </itunes:owner>

    <itunes:explicit>No</itunes:explicit>

    <itunes:image href="${urlBase}/api/libraries/${library._id}/${podcast.image.name}"/>

    <itunes:category text="${escape(podcast.category)}">
     <itunes:category text="${escape(podcast.subCategory)}"/>
    </itunes:category>

    ${items}
</channel>`;

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd" version="2.0">
  ${channel}
</rss>`;
}

router.get('/:id.rss', (req, res) => {
  const id = req.params.id;
  const Library = mongoose.model('Library');
  const criteria = ID_REGEXP.test(id) ? { _id: id } : { path: id };
  Library.findOne(criteria).populate('userId', 'name email').exec()
  .then((library) => {
    // do we have a podcast for this library?
    if (!library.podcast) {
      return Promise.reject({ error: 'No feed' });
    }
    const promises = [Promise.resolve(library)];

    // Get the latest messages
    const Message = mongoose.model('Message');
    const today = moment();
    promises.push(
      Message.find({
        libraryId: library._id,
        date: { $lte: today.toDate() },
        'files.type': { $regex: /^audio/ },
      })
      .sort('-date').limit(10)
      .exec(),
    );

    return Promise.all(promises);
  })
  .then((docs) => {
    // build RSS
    const library = docs[0];
    const messages = docs[1];
    const rss = renderRSS(req, library, messages);
    res.status(200).send(rss);
  })
  .catch((error) => {
    console.error('!!!', error);
    res.status(400).json(error);
  });
});

module.exports = router;
