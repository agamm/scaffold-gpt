import google from "googlethis";

async function searchGoogle(term) {
  const options = {
    page: 0,
    safe: false, // Safe Search
    parse_ads: false, // If set to true sponsored results will be parsed
    additional_params: {
      // add additional parameters here, see https://moz.com/blog/the-ultimate-guide-to-the-google-search-parameters and https://www.seoquake.com/blog/google-search-param/
      hl: "en",
    },
  };

  const response = await google.search(term, options);
  return response.results[0].url;
}
export async function getInstallDocs(term, version) {
  // Get the documentation for option
  const versionString = version ? ` version ${version} ` : " ";
  const docsURL = await searchGoogle(
    `${term}${versionString}docs getting started install`
  );
  console.log(docsURL);
}
