const { getPublicConfig } = require("../../lib/public-config");

exports.handler = async function () {
  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
    body: JSON.stringify(getPublicConfig(process.env)),
  };
};
