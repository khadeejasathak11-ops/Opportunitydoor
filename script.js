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

    const SUPABASE_URL = "https://mdnwrpjqkrehmbhnerzo.supabase.co";
    const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_KWb4ipX4C_WUSee-z7BARA_HUAGAvub";

    const profileModal = document.getElementById("profile-modal");
    const openProfileButton = document.getElementById("open-profile");
    const profileForm = document.getElementById("profile-form");
    const profileName = document.getElementById("profile-name");
    const profileEmail = document.getElementById("profile-email");
    const profilePassword = document.getElementById("profile-password");
    const profileGrade = document.getElementById("profile-grade");
    const profileInterest = document.getElementById("profile-interest");
    const profileReset = document.getElementById("profile-reset");
    const profileTitle = document.getElementById("profile-title");
    const authMessage = document.getElementById("auth-message");
    const profileSubmit = document.querySelector(".profile-submit");

    let supabase = null;
    let authMode = "signup";
    let currentUser = null;
    let currentProfile = null;

    function setAuthMessage(message, isError) {
        if (!authMessage) return;
        authMessage.textContent = message || "";
        authMessage.classList.toggle("error", Boolean(isError));
    }

    function setAuthMode(mode) {
        authMode = mode;
        document.querySelectorAll("[data-auth-mode]").forEach(function (button) {
            button.classList.toggle("active", button.dataset.authMode === mode);
        });

        const signingIn = mode === "signin";
        profileName.classList.toggle("auth-hidden", signingIn);
        document.querySelector(".profile-name-label").classList.toggle("auth-hidden", signingIn);
        document.querySelectorAll(".profile-extra-field").forEach(function (field) {
            field.classList.toggle("auth-hidden", signingIn);
        });
        profileGrade.classList.toggle("auth-hidden", signingIn);
        profileInterest.classList.toggle("auth-hidden", signingIn);
        profileName.required = !signingIn;
        profileGrade.required = !signingIn;
        profileInterest.required = !signingIn;
        profilePassword.autocomplete = signingIn ? "current-password" : "new-password";
        profileTitle.textContent = signingIn ? "Welcome back" : "Create an account";
        profileSubmit.textContent = signingIn ? "Sign in" : "Create account";
        setAuthMessage("", false);
    }

    function updateProfileButton() {
        if (!openProfileButton) return;
        const name = currentProfile && currentProfile.name
            ? currentProfile.name
            : currentUser && currentUser.email
                ? currentUser.email.split("@")[0]
                : null;
        openProfileButton.textContent = name ? "Hi, " + name : "Create account";
        openProfileButton.classList.toggle("has-profile", Boolean(currentUser));
    }

    function applyProfile(profile) {
        currentProfile = profile || null;
        if (!profile) return;
        if (profile.grade) gradeFilter.value = profile.grade;
        if (profile.interest) {
            selectedTheme = profile.interest;
            document.querySelectorAll(".theme-card").forEach(function (themeButton) {
                const active = themeButton.dataset.theme === selectedTheme;
                themeButton.classList.toggle("active", active);
                themeButton.setAttribute("aria-pressed", active ? "true" : "false");
            });
        }
        displayOpportunities();
    }

    async function loadUserProfile() {
        if (!supabase || !currentUser) {
            currentProfile = null;
            updateProfileButton();
            return;
        }
        const metadata = currentUser.user_metadata || {};
        applyProfile({
            name: metadata.name || "",
            grade: metadata.grade || "",
            interest: metadata.interest || ""
        });
        updateProfileButton();
    }

    async function initSupabase() {
        try {
            if (!window.supabase) {
                throw new Error("Supabase library did not load");
            }
            supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
            const sessionResult = await supabase.auth.getSession();
            currentUser = sessionResult.data.session ? sessionResult.data.session.user : null;
            await loadUserProfile();

            supabase.auth.onAuthStateChange(function (_event, session) {
                currentUser = session ? session.user : null;
                if (currentUser) {
                    loadUserProfile();
                } else {
                    currentProfile = null;
                    updateProfileButton();
                }
            });
        } catch (error) {
            setAuthMessage("Secure sign-in could not load. Check your internet connection.", true);
        }
    }

    function openProfileModal() {
        if (!profileModal) return;
        if (currentUser) {
            setAuthMode("signup");
            profileTitle.textContent = "Edit your profile";
            profileName.value = currentProfile ? currentProfile.name : "";
            profileEmail.value = currentUser.email || "";
            profileEmail.disabled = true;
            profileGrade.value = currentProfile ? currentProfile.grade : "";
            profileInterest.value = currentProfile ? currentProfile.interest : "";
            profilePassword.value = "";
            profilePassword.placeholder = "Leave blank to keep password";
            profileReset.hidden = false;
            profileSubmit.textContent = "Update profile";
        } else {
            profileEmail.disabled = false;
            setAuthMode("signup");
            profileReset.hidden = true;
        }
        profileModal.hidden = false;
        document.body.style.overflow = "hidden";
        setAuthMessage("", false);
        profileName.focus();
    }

    function closeProfileModal() {
        if (!profileModal) return;
        profileModal.hidden = true;
        document.body.style.overflow = "";
    }

    if (openProfileButton) openProfileButton.addEventListener("click", openProfileModal);

    document.querySelectorAll("[data-close-profile]").forEach(function (button) {
        button.addEventListener("click", closeProfileModal);
    });

    document.querySelectorAll("[data-auth-mode]").forEach(function (button) {
        button.addEventListener("click", function () {
            setAuthMode(button.dataset.authMode);
        });
    });

    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape" && profileModal && !profileModal.hidden) {
            closeProfileModal();
        }
    });

    if (profileForm) {
        profileForm.addEventListener("submit", async function (event) {
            event.preventDefault();
            if (!supabase) {
                setAuthMessage("Secure sign-in is still loading.", true);
                return;
            }

            profileSubmit.disabled = true;
            setAuthMessage("Please wait...", false);
            const email = profileEmail.value.trim();
            const password = profilePassword.value;

            if (authMode === "signin") {
                const result = await supabase.auth.signInWithPassword({ email, password });
                if (result.error) setAuthMessage(result.error.message, true);
                else closeProfileModal();
            } else if (currentUser) {
                const updates = {
                    data: {
                        name: profileName.value.trim(),
                        grade: profileGrade.value,
                        interest: profileInterest.value
                    }
                };
                if (password) updates.password = password;
                const result = await supabase.auth.updateUser(updates);
                if (result.error) setAuthMessage(result.error.message, true);
                else {
                    currentUser = result.data.user;
                    await loadUserProfile();
                    closeProfileModal();
                }
            } else {
                const profile = {
                    name: profileName.value.trim(),
                    grade: profileGrade.value,
                    interest: profileInterest.value
                };
                const result = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: profile,
                        emailRedirectTo: "https://khadeejasathak11-ops.github.io/Opportunitydoor/"
                    }
                });
                if (result.error) setAuthMessage(result.error.message, true);
                else if (result.data.session) closeProfileModal();
                else setAuthMessage("Account created. Check your email to confirm it.", false);
            }
            profileSubmit.disabled = false;
        });
    }

    if (profileReset) {
        profileReset.addEventListener("click", async function () {
            if (!supabase) return;
            await supabase.auth.signOut();
            currentUser = null;
            currentProfile = null;
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

            updateSavedCount();
            updateProfileButton();
            initSupabase();
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