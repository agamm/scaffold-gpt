import google from "googlethis";
import { convert } from "html-to-text";
import axios from "axios";
import cheerio from "cheerio";

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

function getMainText(htmlBody) {
  // Load the HTML into cheerio
  const $ = cheerio.load(htmlBody);

  // Define elements to exclude (e.g., navigation and footer)
  const elementsToExclude = ["header", "nav", "footer", "script"];

  // Remove unwanted elements and their descendants
  elementsToExclude.forEach((element) => {
    $(element).remove();
  });

  // Extract text content from remaining elements
  return $("body").html();
}

async function getHTMLText(url) {
  const response = await axios.get(url);
  if (!response.status === 200) {
    throw new Error(`Error fetching the url: ${url}`);
  }
  // The HTML content is available in response.data
  const htmlString = response.data;

  const mainText = getMainText(htmlString);

  const text = convert(mainText);
  return text;
}

export async function getInstallDocs(term, version) {
  // Get the documentation for option
  const versionString = version ? ` version ${version} ` : " ";
  const docsURL = await searchGoogle(
    `${term}${versionString}docs getting started install`
  );
  const docsText = await getHTMLText(docsURL);

  console.log(docsText);
  return docsText;
}
