// ======================================
// OPPORTUNITY DOOR - MAIN JAVASCRIPT
// ======================================

document.addEventListener("DOMContentLoaded", function () {

    // Get HTML elements
    const opportunityList = document.getElementById("opportunity-list");
    const searchInput = document.getElementById("search-input");
    const categoryFilter = document.getElementById("category-filter");
    const stateFilter = document.getElementById("state-filter");
    const costFilter = document.getElementById("cost-filter");
    const formatFilter = document.getElementById("format-filter");
    const gradeFilter = document.getElementById("grade-filter");
    const deadlineFilter = document.getElementById("deadline-filter");
    const resultsCount = document.getElementById("results-count");
    const clearFiltersButton = document.getElementById("clear-filters");

    let selectedTheme = "all";

    // Check that opportunity data loaded
    if (typeof opportunities === "undefined") {
        console.error("Opportunity data was not loaded. Check opportunities.js.");
        opportunityList.textContent = "Unable to load opportunities. Please refresh the page.";
        return;
    }

    // Check that the important HTML elements exist
    if (
        !opportunityList ||
        !searchInput ||
        !categoryFilter ||
        !stateFilter ||
        !costFilter ||
        !formatFilter ||
        !gradeFilter ||
        !deadlineFilter ||
        !resultsCount ||
        !clearFiltersButton
    ) {
        console.error("One or more HTML elements are missing. Check index.html.");
        return;
    }


    // ======================================
    // DEADLINE FILTER
    // ======================================

    function matchesDeadline(item, days) {

        if (days === "all") {
            return true;
        }

        if (days === "none") {
            return !item.deadlineDate;
        }

        if (!item.deadlineDate) {
            return false;
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const deadline = new Date(item.deadlineDate + "T23:59:59");

        const difference = deadline - today;
        const daysRemaining = difference / (1000 * 60 * 60 * 24);

        return daysRemaining >= 0 && daysRemaining <= Number(days);
    }


    // ======================================
    // DISPLAY OPPORTUNITIES
    // ======================================

    function displayOpportunities() {

        const search = searchInput.value.toLowerCase().trim();

        const category = categoryFilter.value;
        const state = stateFilter.value;
        const cost = costFilter.value;
        const format = formatFilter.value;
        const grade = gradeFilter.value;
        const deadline = deadlineFilter.value;

        const filtered = opportunities.filter(function (item) {

            const searchableText = [
                item.title,
                item.provider,
                item.description,
                item.eligibility,
                item.location,
                item.category
            ].join(" ").toLowerCase();

            const matchesSearch = searchableText.includes(search);

            const matchesCategory =
                category === "all" || item.category === category;

            const matchesTheme =
                selectedTheme === "all" ||
                (item.theme || []).includes(selectedTheme);

            let matchesState = true;

            if (state === "Nationwide") {

                matchesState = item.nationwide === true;

            } else if (state === "International") {

                matchesState = item.international === true;

            } else if (state !== "all") {

                matchesState =
                    item.nationwide === true ||
                    (item.states || []).includes(state);
            }

            const matchesCost =
                cost === "all" || item.costType === cost;

            const matchesFormat =
                format === "all" || item.format === format;

            const matchesGrade =
                grade === "all" ||
                (item.gradeLevels || []).includes(grade);

            const matchesDate = matchesDeadline(item, deadline);

            return (
                matchesSearch &&
                matchesCategory &&
                matchesTheme &&
                matchesState &&
                matchesCost &&
                matchesFormat &&
                matchesGrade &&
                matchesDate
            );

        });


        // Update results count
        resultsCount.textContent =
            filtered.length + " opportunities found";


        // Show message if nothing matches
        if (filtered.length === 0) {

            opportunityList.innerHTML =
                '<div class="no-results">' +
                    '<div class="no-results-icon">✦</div>' +
                    '<h3>No matching opportunities found</h3>' +
                    '<p>Try changing your filters or clearing your search.</p>' +
                    '<button class="clear-button" id="no-results-clear">' +
                        'Clear all filters' +
                    '</button>' +
                '</div>';

            document.getElementById("no-results-clear")
                .addEventListener("click", clearFilters);

            return;
        }


        // Create opportunity cards
        opportunityList.innerHTML = filtered.map(function (item) {

            const grades = (item.gradeLevels || [])
                .map(function (g) {
                    return "Grade " + g;
                })
                .join(", ");

            return (
                '<article class="opportunity-card">' +

                    '<span class="opportunity-category">' +
                        item.category +
                    '</span>' +

                    '<h3>' + item.title + '</h3>' +

                    '<p class="provider-name">' +
                        item.provider +
                    '</p>' +

                    '<p class="card-description">' +
                        item.description +
                    '</p>' +

                    '<div class="card-tags">' +
                        '<span>' + item.cost + '</span>' +
                        '<span>' + item.format + '</span>' +
                        '<span>' + grades + '</span>' +
                    '</div>' +

                    '<p class="card-deadline">' +
                        '<strong>Deadline:</strong> ' +
                        item.deadline +
                    '</p>' +

                    '<a href="opportunity.html?id=' +
                        encodeURIComponent(item.id) +
                    '">' +
                        'View details →' +
                    '</a>' +

                '</article>'
            );

        }).join("");

    }


    // ======================================
    // CLEAR FILTERS
    // ======================================

    function clearFilters() {

        searchInput.value = "";
        categoryFilter.value = "all";
        stateFilter.value = "all";
        costFilter.value = "all";
        formatFilter.value = "all";
        gradeFilter.value = "all";
        deadlineFilter.value = "all";

        selectedTheme = "all";

        document.querySelectorAll(".theme-card").forEach(function (button) {
            button.classList.remove("active");
        });

        displayOpportunities();
    }


    // ======================================
    // SEARCH AND FILTER EVENTS
    // ======================================

    searchInput.addEventListener("input", displayOpportunities);

    [
        categoryFilter,
        stateFilter,
        costFilter,
        formatFilter,
        gradeFilter,
        deadlineFilter
    ].forEach(function (filter) {

        filter.addEventListener("change", displayOpportunities);

    });


    // Clear filters button
    clearFiltersButton.addEventListener("click", clearFilters);


    // ======================================
    // CATEGORY BUTTONS
    // ======================================

    document.querySelectorAll(".category-card").forEach(function (button) {

        button.addEventListener("click", function () {

            selectedTheme = "all";

            document.querySelectorAll(".theme-card").forEach(function (themeButton) {
                themeButton.classList.remove("active");
            });

            categoryFilter.value = button.dataset.category;

            displayOpportunities();

            document.getElementById("opportunities").scrollIntoView({
                behavior: "smooth"
            });

        });

    });


    // ======================================
    // INTEREST / THEME BUTTONS
    // ======================================

    document.querySelectorAll(".theme-card").forEach(function (button) {

        button.addEventListener("click", function () {

            const theme = button.dataset.theme;

            if (selectedTheme === theme) {

                selectedTheme = "all";
                button.classList.remove("active");

            } else {

                selectedTheme = theme;

                document.querySelectorAll(".theme-card").forEach(function (themeButton) {
                    themeButton.classList.remove("active");
                });

                button.classList.add("active");
            }

            displayOpportunities();

            document.getElementById("opportunities").scrollIntoView({
                behavior: "smooth"
            });

        });

    });


    // ======================================
    // INITIAL LOAD
    // ======================================

    displayOpportunities();

    console.log("Opportunity Door loaded successfully!");
    console.log("Opportunities available:", opportunities.length);

});