const _ = require('lodash');
const axios = require('axios');
const HTMLParser = require('node-html-parser');

exports.searchImagesParse = async (req, res, next) => {
    const query = req.query.q;
    console.log('Query:',  query);

    if (!query) {
        return res.status(400).json({ error: 'Query required' });
    }

    axios.get(`https://www.google.com/search?q=${encodeURIComponent(query)}&tbm=isch`)
        .then(response => {
            const root = HTMLParser.parse(_.toString(response.data));
            const images = root.querySelectorAll('img');
            let imageUrls = images.map(image => image.getAttribute('src'));
            
            imageUrls = _.filter(imageUrls, url => _.startsWith(url, 'http')).slice(0, 4);
            res.status(200).json({ images: imageUrls });
        })
        .catch(error => {
            console.error(error);
            res.status(500).json({ error: 'Failed to fetch images' });
        })
}