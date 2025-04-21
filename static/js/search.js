summaryInclude = 60;
const fuseOptions = {
  shouldSort: true,
  includeMatches: true,
  threshold: 0.0,
  tokenize: true,
  location: 0,
  distance: 100,
  maxPatternLength: 32,
  minMatchCharLength: 1,
  keys: [
    { name: "title", weight: 0.9 },
    { name: "contents", weight: 0.5 },
    { name: "tags", weight: 0.3 },
    { name: "categories", weight: 0.3 },
  ],
};

// Debounce function to prevent excessive search calls
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Function to update URL with search query
function updateURL(query) {
  // Create a URL object from the current URL
  const url = new URL(window.location.href);

  if (query && query.length >= 2) {
    // Set or update the 's' parameter
    url.searchParams.set("s", query);
  } else {
    // Remove the 's' parameter if query is empty or too short
    url.searchParams.delete("s");
  }

  // Update the URL without reloading the page
  window.history.replaceState({}, "", url.toString());
}

// Get search query from URL parameter
const searchQuery = param("s");
if (searchQuery) {
  document.getElementById("search-query").value = searchQuery;
  executeSearch(searchQuery);
} else {
  document.getElementById("search-results").innerHTML =
    "<div class='alert'>Please enter at least 2 characters to search</div>";
}

// Add event listener for real-time searching
document.addEventListener("DOMContentLoaded", function () {
  const searchInput = document.getElementById("search-query");

  // Create debounced search function - 300ms is a good balance
  const debouncedSearch = debounce(function (query) {
    // Update URL with current search query
    updateURL(query);

    if (query.length >= 2) {
      executeSearch(query);
    } else if (query.length === 0 || query.length === 1) {
      document.getElementById("search-results").innerHTML =
        "<div class='alert'>Please enter at least 2 characters to search</div>";
    }
  }, 300);

  // Set up input event for real-time searching
  searchInput.addEventListener("input", function () {
    const query = this.value.trim();
    debouncedSearch(query);
  });

  // Handle form submission to prevent page reload
  const searchForm = searchInput.closest("form");
  if (searchForm) {
    searchForm.addEventListener("submit", function (e) {
      e.preventDefault();
      const query = searchInput.value.trim();
      if (query.length >= 2) {
        updateURL(query);
        executeSearch(query);
      }
    });
  }
});

function executeSearch(searchQuery) {
  fetch("/index.json")
    .then((response) => response.json())
    .then((data) => {
      const pages = data;
      const fuse = new Fuse(pages, fuseOptions);
      const result = fuse.search(searchQuery);
      console.log({ matches: result });

      // Clear previous results only when we have new results to show
      document.getElementById("search-results").innerHTML = "";

      if (result.length > 0) {
        populateResults(result);
      } else {
        document
          .getElementById("search-results")
          .insertAdjacentHTML(
            "beforeend",
            "<div class='alert'>No matches found</div>",
          );
      }
    });
}

function populateResults(result) {
  for (const [key, value] of result.entries()) {
    const contents = value.item.contents;
    let snippet = "";
    const snippetHighlights = [];
    const tags = [];
    let start;
    let end;

    if (fuseOptions.tokenize) {
      snippetHighlights.push(searchQuery);
    } else {
      if (value.matches) {
        for (const mvalue of value.matches) {
          if (mvalue.key === "tags" || mvalue.key === "categories") {
            snippetHighlights.push(mvalue.value);
          } else if (mvalue.key === "contents") {
            start =
              mvalue.indices[0][0] - summaryInclude > 0
                ? mvalue.indices[0][0] - summaryInclude
                : 0;
            end =
              mvalue.indices[0][1] + summaryInclude < contents.length
                ? mvalue.indices[0][1] + summaryInclude
                : contents.length;
            snippet += contents.substring(start, end);
            snippetHighlights.push(
              mvalue.value.substring(
                mvalue.indices[0][0],
                mvalue.indices[0][1] - mvalue.indices[0][0] + 1,
              ),
            );
          }
        }
      }
    }

    if (snippet.length < 1) {
      snippet += contents.substring(0, summaryInclude * 2);
    }
    //pull template from hugo template definition
    const templateDefinition = document.getElementById(
      "search-result-template",
    ).innerHTML;
    for (const snipvalue of snippetHighlights) {
      const summaryElem = document.getElementById(`summary-${key}`);
      if (summaryElem && typeof Mark !== "undefined") {
        const markInstance = new Mark(summaryElem);
        markInstance.mark(snipvalue);
      }
    }

    // Insert the templated result
    const output = render(templateDefinition, {
      key: key,
      title: value.item.title,
      link: value.item.permalink,
      tags: value.item.tags,
      categories: value.item.categories,
      snippet: snippet,
    });
    document
      .getElementById("search-results")
      .insertAdjacentHTML("beforeend", output);
  }
}

function param(name) {
  return decodeURIComponent(
    (location.search.split(name + "=")[1] || "").split("&")[0],
  ).replace(/\+/g, " ");
}

function render(templateString, data) {
  var conditionalMatches, conditionalPattern, copy;
  conditionalPattern = /\$\{\s*isset ([a-zA-Z]*) \s*\}(.*)\$\{\s*end\s*}/g;
  //since loop below depends on re.lastIndex, we use a copy to capture any manipulations whilst inside the loop
  copy = templateString;
  while (
    (conditionalMatches = conditionalPattern.exec(templateString)) !== null
  ) {
    if (data[conditionalMatches[1]]) {
      //valid key, remove conditionals, leave contents.
      copy = copy.replace(conditionalMatches[0], conditionalMatches[2]);
    } else {
      //not valid, remove entire section
      copy = copy.replace(conditionalMatches[0], "");
    }
  }
  templateString = copy;
  //now any conditionals removed we can do simple substitution
  var key, find, re;
  for (key in data) {
    find = "\\$\\{\\s*" + key + "\\s*\\}";
    re = new RegExp(find, "g");
    templateString = templateString.replace(re, data[key]);
  }
  return templateString;
}
