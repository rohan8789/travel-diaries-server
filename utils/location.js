const axios = require('axios');
const API_kEY=process.env.MAPTILER_API_KEY;

const getCordFromAddress = async(address) =>{
    const response = await axios.get(
      `https://api.maptiler.com/geocoding/${encodeURIComponent(address)}.json?key=${API_kEY}`
    );
    const features = await response.data.features;
    if (!features || features.length === 0) {
      throw new Error("No features found in the geocoding response.");
    }
    // console.log(features);
    const coordinates = features[0].geometry.coordinates;
    const lng =coordinates[0];
    const lat=coordinates[1];
    return {lat, lng};
}

module.exports = getCordFromAddress;

//features[0] is the best match to give right location coordinates...