function getHealth(_request, response) {
  response.json({ status: 'ok', service: 'techlearninghub-desktop-app' });
}

module.exports = { getHealth };
