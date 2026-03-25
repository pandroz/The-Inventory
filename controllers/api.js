const _ = require("lodash");
const axios = require("axios");
const HTMLParser = require("node-html-parser");

exports.searchImagesParse = async (req, res, next) => {
	const query = req.query.q;
	console.log("Query:", query);

	if (!query) {
		return res.status(400).json({ error: "Query required" });
	}

	axios.get(`https://www.google.com/search?q=${encodeURIComponent(query)}&tbm=isch`)
        .then((response) => {
			const root = HTMLParser.parse(_.toString(response.data));
			const images = root.querySelectorAll("img");
            let imageUrls = images.map((image) => image.getAttribute("src"));

			imageUrls = _.filter(imageUrls, (url) => _.startsWith(url, "http")).slice(0, 4);
			res.status(200).json({ images: imageUrls });
		})
		.catch((error) => {
			console.error(error);
			res.status(500).json({ error: "Failed to fetch images" });
		});
};

exports.barcode = async (req, res, next) => {
	const barcode = req.body.barcode;
	const format = req.body.format;

	console.log("(barcode) Barcode:", barcode);
	console.log("(barcode) Format:", format);

	if (!barcode) {
		return res.status(400).json({ error: "Barcode required" });
	}

	axios.get(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`)
    .then((response) => {
        let status = response.data.status;
        let resObj = {};

        if(status == 1) {
            let productData = response.data.product;


            resObj.itemName = _.get(productData, "product_name_it", _.get(productData, "product_name", ''));
            resObj.imageUrl = _.get(productData, "image_url", '');

        }

        res.status(200).json(resObj);
    });
};
