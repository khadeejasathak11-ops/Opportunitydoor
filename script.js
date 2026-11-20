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
    let showSavedOnly = false;
    let savedIds = [];

    try {
        savedIds = JSON.parse(localStorage.getItem("opportunityDoorSaved") || "[]");
        if (!Array.isArray(savedIds)) {
            savedIds = [];
        }
    } catch (error) {
        savedIds = [];
    }

    function updateSavedCount() {
        const savedCount = document.getElementById("saved-count");
        if (savedCount) {
            savedCount.textContent = savedIds.length;
        }
    }

    function saveSavedIds() {
        localStorage.setItem("opportunityDoorSaved", JSON.stringify(savedIds));
        updateSavedCount();
        updateProfileButton();
    }

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

            const matchesSaved = !showSavedOnly || savedIds.includes(item.id);

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
                matchesSaved &&
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

            const noResultsTitle = showSavedOnly
                ? "No saved opportunities yet"
                : "No matching opportunities found";
            const noResultsText = showSavedOnly
                ? "Save opportunities from their cards and they will appear here."
                : "Try changing your filters or clearing your search.";

            opportunityList.innerHTML =
                '<div class="no-results">' +
                    '<div class="no-results-icon">✦</div>' +
                    '<h3>' + noResultsTitle + '</h3>' +
                    '<p>' + noResultsText + '</p>' +
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
            const isSaved = savedIds.includes(item.id);

            return (
                '<article class="opportunity-card">' +

                    '<div class="card-header">' +
                        '<span class="opportunity-category">' +
                            item.category +
                        '</span>' +
                        '<button type="button" class="save-opportunity-button' +
                            (isSaved ? " saved" : "") +
                            '" data-save-id="' + encodeURIComponent(item.id) +
                            '" aria-pressed="' + (isSaved ? "true" : "false") +
                            '" aria-label="' + (isSaved ? "Remove from saved opportunities" : "Save opportunity") +
                            '"><span aria-hidden="true">' + (isSaved ? "♥" : "♡") + '</span></button>' +
                    '</div>' +

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

        opportunityList.querySelectorAll(".save-opportunity-button").forEach(function (button) {
            button.addEventListener("click", function () {
                const id = decodeURIComponent(button.dataset.saveId);

                if (savedIds.includes(id)) {
                    savedIds = savedIds.filter(function (savedId) {
                        return savedId !== id;
                    });
                } else {
                    savedIds.push(id);
                }

                saveSavedIds();
                displayOpportunities();
            });
        });

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
        showSavedOnly = false;

        document.querySelectorAll(".theme-card").forEach(function (button) {
            button.classList.remove("active");
            button.setAttribute("aria-pressed", "false");
        });

        document.querySelectorAll(".category-card").forEach(function (button) {
            button.classList.remove("active");
            button.setAttribute("aria-pressed", "false");
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

    function showSavedShortlist() {
        showSavedOnly = true;
        clearFilters();
        showSavedOnly = true;
        displayOpportunities();

        const opportunitiesSection = document.getElementById("opportunities");
        if (opportunitiesSection) {
            opportunitiesSection.scrollIntoView({ behavior: "smooth" });
        }
    }

    const showSavedButton = document.getElementById("show-saved");
    const savedNav = document.getElementById("saved-nav");

    if (showSavedButton) {
        showSavedButton.addEventListener("click", showSavedShortlist);
    }

    if (savedNav) {
        savedNav.addEventListener("click", function (event) {
            event.preventDefault();
            showSavedShortlist();
        });
    }

    const profileModal = document.getElementById("profile-modal");
    const openProfileButton = document.getElementById("open-profile");
    const profileForm = document.getElementById("profile-form");
    const profileName = document.getElementById("profile-name");
    const profileGrade = document.getElementById("profile-grade");
    const profileInterest = document.getElementById("profile-interest");
    const profileReset = document.getElementById("profile-reset");
    const profileTitle = document.getElementById("profile-title");

    function getProfile() {
        try {
            return JSON.parse(localStorage.getItem("opportunityDoorProfile") || "null");
        } catch (error) {
            return null;
        }
    }

    function updateProfileButton() {
        const profile = getProfile();
        if (!openProfileButton) {
            return;
        }

        openProfileButton.textContent = profile
            ? "Hi, " + profile.name
            : "Create profile";
        openProfileButton.classList.toggle("has-profile", Boolean(profile));
    }

    function openProfileModal() {
        if (!profileModal) {
            return;
        }

        const profile = getProfile();
        profileName.value = profile ? profile.name : "";
        profileGrade.value = profile ? profile.grade : "";
        profileInterest.value = profile ? profile.interest : "";
        profileTitle.textContent = profile ? "Edit your profile" : "Create your profile";
        document.querySelector(".profile-submit").textContent =
            profile ? "Update profile" : "Save profile";
        profileReset.hidden = !profile;

        profileModal.hidden = false;
        document.body.style.overflow = "hidden";
        profileName.focus();
    }

    function closeProfileModal() {
        if (!profileModal) {
            return;
        }

        profileModal.hidden = true;
        document.body.style.overflow = "";
    }

    if (openProfileButton) {
        openProfileButton.addEventListener("click", openProfileModal);
    }

    document.querySelectorAll("[data-close-profile]").forEach(function (button) {
        button.addEventListener("click", closeProfileModal);
    });

    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape" && profileModal && !profileModal.hidden) {
            closeProfileModal();
        }
    });

    if (profileForm) {
        profileForm.addEventListener("submit", function (event) {
            event.preventDefault();

            const profile = {
                name: profileName.value.trim(),
                grade: profileGrade.value,
                interest: profileInterest.value
            };

            if (!profile.name) {
                profileName.focus();
                return;
            }

            localStorage.setItem("opportunityDoorProfile", JSON.stringify(profile));
            updateProfileButton();
            closeProfileModal();

            gradeFilter.value = profile.grade || "all";
            selectedTheme = profile.interest || "all";

            document.querySelectorAll(".theme-card").forEach(function (themeButton) {
                const active = themeButton.dataset.theme === selectedTheme;
                themeButton.classList.toggle("active", active);
                themeButton.setAttribute("aria-pressed", active ? "true" : "false");
            });

            displayOpportunities();
            document.getElementById("themes").scrollIntoView({ behavior: "smooth" });
        });
    }

    if (profileReset) {
        profileReset.addEventListener("click", function () {
            localStorage.removeItem("opportunityDoorProfile");
            updateProfileButton();
            closeProfileModal();
        });
    }


    // ======================================
    // CATEGORY BUTTONS
    // ======================================

    document.querySelectorAll(".category-card").forEach(function (button) {

        button.addEventListener("click", function () {

            selectedTheme = "all";

            document.querySelectorAll(".theme-card").forEach(function (themeButton) {
                themeButton.classList.remove("active");
                themeButton.setAttribute("aria-pressed", "false");
            });

            document.querySelectorAll(".category-card").forEach(function (categoryButton) {
                categoryButton.classList.remove("active");
                categoryButton.setAttribute("aria-pressed", "false");
            });
            button.classList.add("active");
            button.setAttribute("aria-pressed", "true");

            categoryFilter.value = button.dataset.category;

            updateSavedCount();
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
                button.setAttribute("aria-pressed", "false");

            } else {

                selectedTheme = theme;

                document.querySelectorAll(".theme-card").forEach(function (themeButton) {
                    themeButton.classList.remove("active");
                    themeButton.setAttribute("aria-pressed", "false");
                });

                button.classList.add("active");
                button.setAttribute("aria-pressed", "true");
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