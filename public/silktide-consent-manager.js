// Silktide Consent Manager - https://silktide.com/consent-manager/

class SilktideCookieBanner {
  constructor(config) {
    this.config = config; // Save config to the instance

    this.wrapper = null;
    this.banner = null;
    this.modal = null;
    this.cookieIcon = null;
    this.backdrop = null;

    this.createWrapper();

    if (this.shouldShowBackdrop()) {
      this.createBackdrop();
    }

    this.createCookieIcon();
    this.createModal();

    if (this.shouldShowBanner()) {
      this.createBanner();
      this.showBackdrop();
    } else {
      this.showCookieIcon();
    }

    this.setupEventListeners();

    if (this.hasSetInitialCookieChoices()) {
      this.loadRequiredCookies();
      this.runAcceptedCookieCallbacks();
    }
  }

  destroyCookieBanner() {
    // Remove all cookie banner elements from the DOM
    if (this.wrapper && this.wrapper.parentNode) {
      this.wrapper.parentNode.removeChild(this.wrapper);
    }

    // Restore scrolling
    this.allowBodyScroll();

    // Clear all references
    this.wrapper = null;
    this.banner = null;
    this.modal = null;
    this.cookieIcon = null;
    this.backdrop = null;
  }

  // ----------------------------------------------------------------
  // Wrapper
  // ----------------------------------------------------------------
  createWrapper() {
    this.wrapper = document.createElement("div");
    this.wrapper.id = "silktide-wrapper";
    document.body.insertBefore(this.wrapper, document.body.firstChild);
  }

  // ----------------------------------------------------------------
  // Wrapper Child Generator
  // ----------------------------------------------------------------
  createWrapperChild(htmlContent, id) {
    // Create child element
    const child = document.createElement("div");
    child.id = id;
    child.innerHTML = htmlContent;

    // Ensure wrapper exists
    if (!this.wrapper || !document.body.contains(this.wrapper)) {
      this.createWrapper();
    }

    // Append child to wrapper
    this.wrapper.appendChild(child);
    return child;
  }

  // ----------------------------------------------------------------
  // Backdrop
  // ----------------------------------------------------------------
  createBackdrop() {
    this.backdrop = this.createWrapperChild(null, "silktide-backdrop");
  }

  showBackdrop() {
    if (this.backdrop) {
      this.backdrop.style.display = "block";
    }
    // Trigger optional onBackdropOpen callback
    if (typeof this.config.onBackdropOpen === "function") {
      this.config.onBackdropOpen();
    }
  }

  hideBackdrop() {
    if (this.backdrop) {
      this.backdrop.style.display = "none";
    }

    // Trigger optional onBackdropClose callback
    if (typeof this.config.onBackdropClose === "function") {
      this.config.onBackdropClose();
    }
  }

  shouldShowBackdrop() {
    return this.config?.background?.showBackground || false;
  }

  // update the checkboxes in the modal with the values from localStorage
  updateCheckboxState(saveToStorage = false) {
    const preferencesSection = this.modal.querySelector("#cookie-preferences");
    const checkboxes = preferencesSection.querySelectorAll(
      'input[type="checkbox"]'
    );

    checkboxes.forEach((checkbox) => {
      const [, cookieId] = checkbox.id.split("cookies-");
      const cookieType = this.config.cookieTypes.find(
        (type) => type.id === cookieId
      );

      if (!cookieType) return;

      if (saveToStorage) {
        // Save the current state to localStorage and run callbacks
        const currentState = checkbox.checked;

        if (cookieType.required) {
          localStorage.setItem(
            `silktideCookieChoice_${cookieId}${this.getBannerSuffix()}`,
            "true"
          );
        } else {
          localStorage.setItem(
            `silktideCookieChoice_${cookieId}${this.getBannerSuffix()}`,
            currentState.toString()
          );

          // Run appropriate callback
          if (currentState && typeof cookieType.onAccept === "function") {
            cookieType.onAccept();
          } else if (
            !currentState &&
            typeof cookieType.onReject === "function"
          ) {
            cookieType.onReject();
          }
        }
      } else {
        // When reading values (opening modal)
        if (cookieType.required) {
          checkbox.checked = true;
          checkbox.disabled = true;
        } else {
          const storedValue = localStorage.getItem(
            `silktideCookieChoice_${cookieId}${this.getBannerSuffix()}`
          );

          if (storedValue !== null) {
            checkbox.checked = storedValue === "true";
          } else {
            checkbox.checked = !!cookieType.defaultValue;
          }
        }
      }
    });
  }

  setInitialCookieChoiceMade() {
    window.localStorage.setItem(
      `silktideCookieBanner_InitialChoice${this.getBannerSuffix()}`,
      1
    );
  }

  // ----------------------------------------------------------------
  // Consent Handling
  // ----------------------------------------------------------------
  handleCookieChoice(accepted) {
    // We set that an initial choice was made regardless of what it was so we don't show the banner again
    this.setInitialCookieChoiceMade();

    this.removeBanner();
    this.hideBackdrop();
    this.toggleModal(false);
    this.showCookieIcon();

    this.config.cookieTypes.forEach((type) => {
      // Set localStorage and run accept/reject callbacks
      if (type.required == true) {
        localStorage.setItem(
          `silktideCookieChoice_${type.id}${this.getBannerSuffix()}`,
          "true"
        );
        if (typeof type.onAccept === "function") {
          type.onAccept();
        }
      } else {
        localStorage.setItem(
          `silktideCookieChoice_${type.id}${this.getBannerSuffix()}`,
          accepted.toString()
        );

        if (accepted) {
          if (typeof type.onAccept === "function") {
            type.onAccept();
          }
        } else {
          if (typeof type.onReject === "function") {
            type.onReject();
          }
        }
      }
    });

    // Trigger optional onAcceptAll/onRejectAll callbacks
    if (accepted && typeof this.config.onAcceptAll === "function") {
      if (typeof this.config.onAcceptAll === "function") {
        this.config.onAcceptAll();
      }
    } else if (typeof this.config.onRejectAll === "function") {
      if (typeof this.config.onRejectAll === "function") {
        this.config.onRejectAll();
      }
    }

    // finally update the checkboxes in the modal with the values from localStorage
    this.updateCheckboxState();
  }

  getAcceptedCookies() {
    return (this.config.cookieTypes || []).reduce((acc, cookieType) => {
      acc[cookieType.id] =
        localStorage.getItem(
          `silktideCookieChoice_${cookieType.id}${this.getBannerSuffix()}`
        ) === "true";
      return acc;
    }, {});
  }

  runAcceptedCookieCallbacks() {
    if (!this.config.cookieTypes) return;

    const acceptedCookies = this.getAcceptedCookies();
    this.config.cookieTypes.forEach((type) => {
      if (type.required) return; // we run required cookies separately in loadRequiredCookies
      if (acceptedCookies[type.id] && typeof type.onAccept === "function") {
        if (typeof type.onAccept === "function") {
          type.onAccept();
        }
      }
    });
  }

  runRejectedCookieCallbacks() {
    if (!this.config.cookieTypes) return;

    const rejectedCookies = this.getRejectedCookies();
    this.config.cookieTypes.forEach((type) => {
      if (rejectedCookies[type.id] && typeof type.onReject === "function") {
        if (typeof type.onReject === "function") {
          type.onReject();
        }
      }
    });
  }

  /**
   * Run through all of the cookie callbacks based on the current localStorage values
   */
  runStoredCookiePreferenceCallbacks() {
    this.config.cookieTypes.forEach((type) => {
      const accepted =
        localStorage.getItem(
          `silktideCookieChoice_${type.id}${this.getBannerSuffix()}`
        ) === "true";
      // Set localStorage and run accept/reject callbacks
      if (accepted) {
        if (typeof type.onAccept === "function") {
          type.onAccept();
        }
      } else {
        if (typeof type.onReject === "function") {
          type.onReject();
        }
      }
    });
  }

  loadRequiredCookies() {
    if (!this.config.cookieTypes) return;
    this.config.cookieTypes.forEach((cookie) => {
      if (cookie.required && typeof cookie.onAccept === "function") {
        if (typeof cookie.onAccept === "function") {
          cookie.onAccept();
        }
      }
    });
  }

  // ----------------------------------------------------------------
  // Banner
  // ----------------------------------------------------------------
  getBannerContent() {
    const bannerDescription =
      this.config.text?.banner?.description ||
      `<p>We use cookies on our site to enhance your user experience, provide personalized content, and analyze our traffic.</p>`;

    // Accept button
    const acceptAllButtonText =
      this.config.text?.banner?.acceptAllButtonText || "Accept all";
    const acceptAllButtonLabel =
      this.config.text?.banner?.acceptAllButtonAccessibleLabel;
    const acceptAllButton = `<button class="accept-all st-button st-button--primary"${
      acceptAllButtonLabel && acceptAllButtonLabel !== acceptAllButtonText
        ? ` aria-label="${acceptAllButtonLabel}"`
        : ""
    }>${acceptAllButtonText}</button>`;

    // Reject button
    const rejectNonEssentialButtonText =
      this.config.text?.banner?.rejectNonEssentialButtonText ||
      "Reject non-essential";
    const rejectNonEssentialButtonLabel =
      this.config.text?.banner?.rejectNonEssentialButtonAccessibleLabel;
    const rejectNonEssentialButton = `<button class="reject-all st-button st-button--primary"${
      rejectNonEssentialButtonLabel &&
      rejectNonEssentialButtonLabel !== rejectNonEssentialButtonText
        ? ` aria-label="${rejectNonEssentialButtonLabel}"`
        : ""
    }>${rejectNonEssentialButtonText}</button>`;

    // Preferences button
    const preferencesButtonText =
      this.config.text?.banner?.preferencesButtonText || "Preferences";
    const preferencesButtonLabel =
      this.config.text?.banner?.preferencesButtonAccessibleLabel;
    const preferencesButton = `<button class="preferences"${
      preferencesButtonLabel && preferencesButtonLabel !== preferencesButtonText
        ? ` aria-label="${preferencesButtonLabel}"`
        : ""
    }><span>${preferencesButtonText}</span></button>`;

    // Silktide logo link
    const silktideLogo = `
      <a class="silktide-logo" href="https://silktide.com/consent-manager" aria-label="Visit the Silktide Consent Manager page">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="25" viewBox="0 0 24 25" fill="inherit">
          <path fill-rule="evenodd" clip-rule="evenodd" d="M14.1096 16.7745C13.8895 17.2055 13.3537 17.3805 12.9129 17.1653L8.28443 14.9055L2.73192 17.7651L11.1025 21.9814C11.909 22.3876 12.8725 22.3591 13.6524 21.9058L20.4345 17.9645C21.2845 17.4704 21.7797 16.5522 21.7164 15.5872L21.7088 15.4704C21.6487 14.5561 21.0962 13.7419 20.2579 13.3326L15.6793 11.0972L10.2283 13.9045L13.71 15.6043C14.1507 15.8195 14.3297 16.3434 14.1096 16.7745ZM8.2627 12.9448L13.7136 10.1375L10.2889 8.46543C9.84803 8.25021 9.66911 7.72629 9.88916 7.29524C10.1093 6.86417 10.6451 6.68921 11.0859 6.90442L15.6575 9.13647L21.2171 6.27325L12.8808 2.03496C12.0675 1.62147 11.0928 1.65154 10.3078 2.11432L3.54908 6.09869C2.70732 6.59492 2.21846 7.50845 2.28139 8.46761L2.29003 8.59923C2.35002 9.51362 2.9026 10.3278 3.7409 10.7371L8.2627 12.9448ZM6.31884 13.9458L2.94386 12.2981C1.53727 11.6113 0.610092 10.2451 0.509431 8.71094L0.500795 8.57933C0.3952 6.96993 1.21547 5.4371 2.62787 4.60447L9.38662 0.620092C10.7038 -0.156419 12.3392 -0.206861 13.7039 0.486938L23.3799 5.40639C23.4551 5.44459 23.5224 5.4918 23.5811 5.54596C23.7105 5.62499 23.8209 5.73754 23.897 5.87906C24.1266 6.30534 23.9594 6.83293 23.5234 7.05744L17.6231 10.0961L21.0549 11.7716C22.4615 12.4583 23.3887 13.8245 23.4893 15.3587L23.497 15.4755C23.6033 17.0947 22.7724 18.6354 21.346 19.4644L14.5639 23.4057C13.2554 24.1661 11.6386 24.214 10.2854 23.5324L0.621855 18.6649C0.477299 18.592 0.361696 18.4859 0.279794 18.361C0.210188 18.2968 0.150054 18.2204 0.10296 18.133C-0.126635 17.7067 0.0406445 17.1792 0.47659 16.9546L6.31884 13.9458Z" fill="inherit"/>
        </svg>
      </a>
    `;

    const bannerContent = `
      ${bannerDescription}
      <div class="actions">                               
        ${acceptAllButton}
        ${rejectNonEssentialButton}
        <div class="actions-row">
          ${preferencesButton}
          ${silktideLogo}
        </div>
      </div>
    `;

    return bannerContent;
  }

  hasSetInitialCookieChoices() {
    return !!localStorage.getItem(
      `silktideCookieBanner_InitialChoice${this.getBannerSuffix()}`
    );
  }

  createBanner() {
    // Create banner element
    this.banner = this.createWrapperChild(
      this.getBannerContent(),
      "silktide-banner"
    );

    // Add positioning class from config
    if (this.banner && this.config.position?.banner) {
      this.banner.classList.add(this.config.position.banner);
    }

    // Trigger optional onBannerOpen callback
    if (this.banner && typeof this.config.onBannerOpen === "function") {
      this.config.onBannerOpen();
    }
  }

  removeBanner() {
    if (this.banner && this.banner.parentNode) {
      this.banner.parentNode.removeChild(this.banner);
      this.banner = null;

      // Trigger optional onBannerClose callback
      if (typeof this.config.onBannerClose === "function") {
        this.config.onBannerClose();
      }
    }
  }

  shouldShowBanner() {
    if (this.config.showBanner === false) {
      return false;
    }
    return (
      localStorage.getItem(
        `silktideCookieBanner_InitialChoice${this.getBannerSuffix()}`
      ) === null
    );
  }

  // ----------------------------------------------------------------
  // Modal
  // ----------------------------------------------------------------
  getModalContent() {
    const preferencesTitle =
      this.config.text?.preferences?.title ||
      "Customize your cookie preferences";

    const preferencesDescription =
      this.config.text?.preferences?.description ||
      `<p>We respect your right to privacy. You can choose not to allow some types of cookies. Your cookie preferences will apply across our website.</p>`;

    // Preferences button
    const preferencesButtonLabel =
      this.config.text?.banner?.preferencesButtonAccessibleLabel;

    const closeModalButton = `<button class="modal-close"${
      preferencesButtonLabel ? ` aria-label="${preferencesButtonLabel}"` : ""
    }>
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M19.4081 3.41559C20.189 2.6347 20.189 1.36655 19.4081 0.585663C18.6272 -0.195221 17.3591 -0.195221 16.5782 0.585663L10 7.17008L3.41559 0.59191C2.6347 -0.188974 1.36655 -0.188974 0.585663 0.59191C-0.195221 1.37279 -0.195221 2.64095 0.585663 3.42183L7.17008 10L0.59191 16.5844C-0.188974 17.3653 -0.188974 18.6335 0.59191 19.4143C1.37279 20.1952 2.64095 20.1952 3.42183 19.4143L10 12.8299L16.5844 19.4081C17.3653 20.189 18.6335 20.189 19.4143 19.4081C20.1952 18.6272 20.1952 17.3591 19.4143 16.5782L12.8299 10L19.4081 3.41559Z"/>
      </svg>
    </button>`;

    const cookieTypes = this.config.cookieTypes || [];
    const acceptedCookieMap = this.getAcceptedCookies();

    // Accept button
    const acceptAllButtonText =
      this.config.text?.banner?.acceptAllButtonText || "Accept all";
    const acceptAllButtonLabel =
      this.config.text?.banner?.acceptAllButtonAccessibleLabel;
    const acceptAllButton = `<button class="preferences-accept-all st-button st-button--primary"${
      acceptAllButtonLabel && acceptAllButtonLabel !== acceptAllButtonText
        ? ` aria-label="${acceptAllButtonLabel}"`
        : ""
    }>${acceptAllButtonText}</button>`;

    // Reject button
    const rejectNonEssentialButtonText =
      this.config.text?.banner?.rejectNonEssentialButtonText ||
      "Reject non-essential";
    const rejectNonEssentialButtonLabel =
      this.config.text?.banner?.rejectNonEssentialButtonAccessibleLabel;
    const rejectNonEssentialButton = `<button class="preferences-reject-all st-button st-button--primary"${
      rejectNonEssentialButtonLabel &&
      rejectNonEssentialButtonLabel !== rejectNonEssentialButtonText
        ? ` aria-label="${rejectNonEssentialButtonLabel}"`
        : ""
    }>${rejectNonEssentialButtonText}</button>`;

    // Credit link
    // const creditLinkText = this.config.text?.preferences?.creditLinkText || 'Get this banner for free';
    // const creditLinkAccessibleLabel = this.config.text?.preferences?.creditLinkAccessibleLabel;
    // const creditLink = `<a href="https://silktide.com/consent-manager"${
    //   creditLinkAccessibleLabel && creditLinkAccessibleLabel !== creditLinkText
    //     ? ` aria-label="${creditLinkAccessibleLabel}"`
    //     : ''
    // }>${creditLinkText}</a>`;

    const modalContent = `
      <header>
        <h1>${preferencesTitle}</h1>                    
        ${closeModalButton}
      </header>
      ${preferencesDescription}
      <section id="cookie-preferences">
        ${cookieTypes
          .map((type) => {
            const accepted = acceptedCookieMap[type.id];
            let isChecked = false;

            // if it's accepted then show as checked
            if (accepted) {
              isChecked = true;
            }

            // if nothing has been accepted / rejected yet, then show as checked if the default value is true
            if (!accepted && !this.hasSetInitialCookieChoices()) {
              isChecked = type.defaultValue;
            }

            return `
            <fieldset>
                <legend>${type.name}</legend>
                <div class="cookie-type-content">
                    <div class="cookie-type-description">${
                      type.description
                    }</div>
                    <label class="switch" for="cookies-${type.id}">
                        <input type="checkbox" id="cookies-${type.id}" ${
              type.required ? "checked disabled" : isChecked ? "checked" : ""
            } />
                        <span class="switch__pill" aria-hidden="true"></span>
                        <span class="switch__dot" aria-hidden="true"></span>
                        <span class="switch__off" aria-hidden="true">Off</span>
                        <span class="switch__on" aria-hidden="true">On</span>
                    </label>
                </div>
            </fieldset>
        `;
          })
          .join("")}
      </section>
      <footer>
        ${acceptAllButton}
        ${rejectNonEssentialButton}
      </footer>
    `;

    return modalContent;
  }

  createModal() {
    // Create banner element
    this.modal = this.createWrapperChild(
      this.getModalContent(),
      "silktide-modal"
    );
  }

  toggleModal(show) {
    if (!this.modal) return;

    this.modal.style.display = show ? "flex" : "none";

    if (show) {
      this.showBackdrop();
      this.hideCookieIcon();
      this.removeBanner();
      this.preventBodyScroll();

      // Focus the close button
      const modalCloseButton = this.modal.querySelector(".modal-close");
      modalCloseButton.focus();

      // Trigger optional onPreferencesOpen callback
      if (typeof this.config.onPreferencesOpen === "function") {
        this.config.onPreferencesOpen();
      }

      this.updateCheckboxState(false); // read from storage when opening
    } else {
      // Set that an initial choice was made when closing the modal
      this.setInitialCookieChoiceMade();

      // Save current checkbox states to storage
      this.updateCheckboxState(true);

      this.hideBackdrop();
      this.showCookieIcon();
      this.allowBodyScroll();

      // Trigger optional onPreferencesClose callback
      if (typeof this.config.onPreferencesClose === "function") {
        this.config.onPreferencesClose();
      }
    }
  }

  // ----------------------------------------------------------------
  // Cookie Icon
  // ----------------------------------------------------------------
  getCookieIconContent() {
    return `
      <svg width="45" height="46" viewBox="0 0 45 46" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect width="45" height="45.0312" rx="22.5" fill="#6EBDFD"/>
<path d="M22.5 35.0313C20.7708 35.0313 19.1458 34.7031 17.625 34.0469C16.1042 33.3906 14.7813 32.5 13.6563 31.375C12.5313 30.25 11.6406 28.9271 10.9844 27.4063C10.3281 25.8854 10 24.2604 10 22.5313C10 20.9688 10.3021 19.4375 10.9063 17.9375C11.5104 16.4375 12.3542 15.099 13.4375 13.9219C14.5208 12.7448 15.8229 11.7969 17.3438 11.0781C18.8646 10.3594 20.5313 10 22.3438 10C22.7813 10 23.2292 10.0208 23.6875 10.0625C24.1458 10.1042 24.6146 10.1771 25.0938 10.2813C24.9063 11.2188 24.9688 12.1042 25.2813 12.9375C25.5938 13.7708 26.0625 14.4635 26.6875 15.0156C27.3125 15.5677 28.0573 15.9479 28.9219 16.1563C29.7865 16.3646 30.6771 16.3125 31.5938 16C31.0521 17.2292 31.1302 18.4063 31.8281 19.5313C32.526 20.6563 33.5625 21.2396 34.9375 21.2813C34.9583 21.5104 34.974 21.724 34.9844 21.9219C34.9948 22.1198 35 22.3333 35 22.5625C35 24.2708 34.6719 25.8802 34.0156 27.3906C33.3594 28.901 32.4688 30.224 31.3438 31.3594C30.2188 32.4948 28.8958 33.3906 27.375 34.0469C25.8542 34.7031 24.2292 35.0313 22.5 35.0313ZM20.625 20.0313C21.1458 20.0313 21.5885 19.849 21.9531 19.4844C22.3177 19.1198 22.5 18.6771 22.5 18.1563C22.5 17.6354 22.3177 17.1927 21.9531 16.8281C21.5885 16.4635 21.1458 16.2813 20.625 16.2813C20.1042 16.2813 19.6615 16.4635 19.2969 16.8281C18.9323 17.1927 18.75 17.6354 18.75 18.1563C18.75 18.6771 18.9323 19.1198 19.2969 19.4844C19.6615 19.849 20.1042 20.0313 20.625 20.0313ZM18.125 26.2813C18.6458 26.2813 19.0885 26.099 19.4531 25.7344C19.8177 25.3698 20 24.9271 20 24.4063C20 23.8854 19.8177 23.4427 19.4531 23.0781C19.0885 22.7135 18.6458 22.5313 18.125 22.5313C17.6042 22.5313 17.1615 22.7135 16.7969 23.0781C16.4323 23.4427 16.25 23.8854 16.25 24.4063C16.25 24.9271 16.4323 25.3698 16.7969 25.7344C17.1615 26.099 17.6042 26.2813 18.125 26.2813ZM26.25 27.5313C26.6042 27.5313 26.901 27.4115 27.1406 27.1719C27.3802 26.9323 27.5 26.6354 27.5 26.2813C27.5 25.9271 27.3802 25.6302 27.1406 25.3906C26.901 25.151 26.6042 25.0313 26.25 25.0313C25.8958 25.0313 25.599 25.151 25.3594 25.3906C25.1198 25.6302 25 25.9271 25 26.2813C25 26.6354 25.1198 26.9323 25.3594 27.1719C25.599 27.4115 25.8958 27.5313 26.25 27.5313ZM22.5 32.5313C25.0417 32.5313 27.2969 31.6563 29.2656 29.9063C31.2344 28.1563 32.3125 25.9271 32.5 23.2188C31.4583 22.7604 30.6406 22.1354 30.0469 21.3438C29.4531 20.5521 29.0521 19.6667 28.8438 18.6875C27.2396 18.4583 25.8646 17.7708 24.7188 16.625C23.5729 15.4792 22.8646 14.1042 22.5938 12.5C20.9271 12.4583 19.4635 12.7604 18.2031 13.4063C16.9427 14.0521 15.8906 14.8802 15.0469 15.8906C14.2031 16.901 13.5677 18 13.1406 19.1875C12.7135 20.375 12.5 21.4896 12.5 22.5313C12.5 25.3021 13.474 27.6615 15.4219 29.6094C17.3698 31.5573 19.7292 32.5313 22.5 32.5313Z" fill="black"/>
</svg>

    `;
  }

  createCookieIcon() {
    this.cookieIcon = document.createElement("button");
    this.cookieIcon.id = "silktide-cookie-icon";
    this.cookieIcon.innerHTML = this.getCookieIconContent();

    if (this.config.text?.banner?.preferencesButtonAccessibleLabel) {
      this.cookieIcon.ariaLabel =
        this.config.text?.banner?.preferencesButtonAccessibleLabel;
    }

    // Ensure wrapper exists
    if (!this.wrapper || !document.body.contains(this.wrapper)) {
      this.createWrapper();
    }

    // Append child to wrapper
    this.wrapper.appendChild(this.cookieIcon);

    // Add positioning class from config
    if (this.cookieIcon && this.config.cookieIcon?.position) {
      this.cookieIcon.classList.add(this.config.cookieIcon.position);
    }

    // Add color scheme class from config
    if (this.cookieIcon && this.config.cookieIcon?.colorScheme) {
      this.cookieIcon.classList.add(this.config.cookieIcon.colorScheme);
    }
  }

  showCookieIcon() {
    if (this.cookieIcon) {
      this.cookieIcon.style.display = "flex";
    }
  }

  hideCookieIcon() {
    if (this.cookieIcon) {
      this.cookieIcon.style.display = "none";
    }
  }

  /**
   * This runs if the user closes the modal without making a choice for the first time
   * We apply the default values and the necessary values as default
   */
  handleClosedWithNoChoice() {
    this.config.cookieTypes.forEach((type) => {
      let accepted = true;
      // Set localStorage and run accept/reject callbacks
      if (type.required == true) {
        localStorage.setItem(
          `silktideCookieChoice_${type.id}${this.getBannerSuffix()}`,
          accepted.toString()
        );
      } else if (type.defaultValue) {
        localStorage.setItem(
          `silktideCookieChoice_${type.id}${this.getBannerSuffix()}`,
          accepted.toString()
        );
      } else {
        accepted = false;
        localStorage.setItem(
          `silktideCookieChoice_${type.id}${this.getBannerSuffix()}`,
          accepted.toString()
        );
      }

      if (accepted) {
        if (typeof type.onAccept === "function") {
          type.onAccept();
        }
      } else {
        if (typeof type.onReject === "function") {
          type.onReject();
        }
      }
      // set the flag to say that the cookie choice has been made
      this.setInitialCookieChoiceMade();
      this.updateCheckboxState();
    });
  }

  // ----------------------------------------------------------------
  // Focusable Elements
  // ----------------------------------------------------------------
  getFocusableElements(element) {
    return element.querySelectorAll(
      'button, a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
  }

  // ----------------------------------------------------------------
  // Event Listeners
  // ----------------------------------------------------------------
  setupEventListeners() {
    // Check Banner exists before trying to add event listeners
    if (this.banner) {
      // Get the buttons
      const acceptButton = this.banner.querySelector(".accept-all");
      const rejectButton = this.banner.querySelector(".reject-all");
      const preferencesButton = this.banner.querySelector(".preferences");

      // Add event listeners to the buttons
      acceptButton?.addEventListener("click", () =>
        this.handleCookieChoice(true)
      );
      rejectButton?.addEventListener("click", () =>
        this.handleCookieChoice(false)
      );
      preferencesButton?.addEventListener("click", () => {
        this.showBackdrop();
        this.toggleModal(true);
      });

      // Focus Trap
      const focusableElements = this.getFocusableElements(this.banner);
      const firstFocusableEl = focusableElements[0];
      const lastFocusableEl = focusableElements[focusableElements.length - 1];

      // Add keydown event listener to handle tab navigation
      this.banner.addEventListener("keydown", (e) => {
        if (e.key === "Tab") {
          if (e.shiftKey) {
            if (document.activeElement === firstFocusableEl) {
              lastFocusableEl.focus();
              e.preventDefault();
            }
          } else {
            if (document.activeElement === lastFocusableEl) {
              firstFocusableEl.focus();
              e.preventDefault();
            }
          }
        }
      });

      // Set initial focus
      if (this.config.mode !== "wizard") {
        acceptButton?.focus();
      }
    }

    // Check Modal exists before trying to add event listeners
    if (this.modal) {
      const closeButton = this.modal.querySelector(".modal-close");
      const acceptAllButton = this.modal.querySelector(
        ".preferences-accept-all"
      );
      const rejectAllButton = this.modal.querySelector(
        ".preferences-reject-all"
      );

      closeButton?.addEventListener("click", () => {
        this.toggleModal(false);

        const hasMadeFirstChoice = this.hasSetInitialCookieChoices();

        if (hasMadeFirstChoice) {
          // run through the callbacks based on the current localStorage state
          this.runStoredCookiePreferenceCallbacks();
        } else {
          // handle the case where the user closes without making a choice for the first time
          this.handleClosedWithNoChoice();
        }
      });
      acceptAllButton?.addEventListener("click", () =>
        this.handleCookieChoice(true)
      );
      rejectAllButton?.addEventListener("click", () =>
        this.handleCookieChoice(false)
      );

      // Banner Focus Trap
      const focusableElements = this.getFocusableElements(this.modal);
      const firstFocusableEl = focusableElements[0];
      const lastFocusableEl = focusableElements[focusableElements.length - 1];

      this.modal.addEventListener("keydown", (e) => {
        if (e.key === "Tab") {
          if (e.shiftKey) {
            if (document.activeElement === firstFocusableEl) {
              lastFocusableEl.focus();
              e.preventDefault();
            }
          } else {
            if (document.activeElement === lastFocusableEl) {
              firstFocusableEl.focus();
              e.preventDefault();
            }
          }
        }
        if (e.key === "Escape") {
          this.toggleModal(false);
        }
      });

      closeButton?.focus();

      // Update the checkbox event listeners
      const preferencesSection = this.modal.querySelector(
        "#cookie-preferences"
      );
      const checkboxes = preferencesSection.querySelectorAll(
        'input[type="checkbox"]'
      );

      checkboxes.forEach((checkbox) => {
        checkbox.addEventListener("change", (event) => {
          const [, cookieId] = event.target.id.split("cookies-");
          const isAccepted = event.target.checked;
          const previousValue =
            localStorage.getItem(
              `silktideCookieChoice_${cookieId}${this.getBannerSuffix()}`
            ) === "true";

          // Only proceed if the value has actually changed
          if (isAccepted !== previousValue) {
            // Find the corresponding cookie type
            const cookieType = this.config.cookieTypes.find(
              (type) => type.id === cookieId
            );

            if (cookieType) {
              // Update localStorage
              localStorage.setItem(
                `silktideCookieChoice_${cookieId}${this.getBannerSuffix()}`,
                isAccepted.toString()
              );

              // Run the appropriate callback only if the value changed
              if (isAccepted && typeof cookieType.onAccept === "function") {
                cookieType.onAccept();
              } else if (
                !isAccepted &&
                typeof cookieType.onReject === "function"
              ) {
                cookieType.onReject();
              }
            }
          }
        });
      });
    }

    // Check Cookie Icon exists before trying to add event listeners
    if (this.cookieIcon) {
      this.cookieIcon.addEventListener("click", () => {
        // If modal is not found, create it
        if (!this.modal) {
          this.createModal();
          this.toggleModal(true);
          this.hideCookieIcon();
        }
        // If modal is hidden, show it
        else if (
          this.modal.style.display === "none" ||
          this.modal.style.display === ""
        ) {
          this.toggleModal(true);
          this.hideCookieIcon();
        }
        // If modal is visible, hide it
        else {
          this.toggleModal(false);
        }
      });
    }
  }

  getBannerSuffix() {
    if (this.config.bannerSuffix) {
      return "_" + this.config.bannerSuffix;
    }
    return "";
  }

  preventBodyScroll() {
    document.body.style.overflow = "hidden";
    // Prevent iOS Safari scrolling
    document.body.style.position = "fixed";
    document.body.style.width = "100%";
  }

  allowBodyScroll() {
    document.body.style.overflow = "";
    document.body.style.position = "";
    document.body.style.width = "";
  }
}

(function () {
  window.silktideCookieBannerManager = {};

  let config = {};
  let cookieBanner;

  function updateCookieBannerConfig(userConfig = {}) {
    config = { ...config, ...userConfig };

    // If cookie banner exists, destroy and recreate it with new config
    if (cookieBanner) {
      cookieBanner.destroyCookieBanner(); // We'll need to add this method
      cookieBanner = null;
    }

    // Only initialize if document.body exists
    if (document.body) {
      initCookieBanner();
    } else {
      // Wait for DOM to be ready
      document.addEventListener("DOMContentLoaded", initCookieBanner, {
        once: true,
      });
    }
  }

  function initCookieBanner() {
    if (!cookieBanner) {
      cookieBanner = new SilktideCookieBanner(config); // Pass config to the CookieBanner instance
    }
  }

  function injectScript(url, loadOption) {
    // Check if script with this URL already exists
    const existingScript = document.querySelector(`script[src="${url}"]`);
    if (existingScript) {
      return; // Script already exists, don't add it again
    }

    const script = document.createElement("script");
    script.src = url;

    // Apply the async or defer attribute based on the loadOption parameter
    if (loadOption === "async") {
      script.async = true;
    } else if (loadOption === "defer") {
      script.defer = true;
    }

    document.head.appendChild(script);
  }

  window.silktideCookieBannerManager.initCookieBanner = initCookieBanner;
  window.silktideCookieBannerManager.updateCookieBannerConfig =
    updateCookieBannerConfig;
  window.silktideCookieBannerManager.injectScript = injectScript;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initCookieBanner, {
      once: true,
    });
  } else {
    initCookieBanner();
  }
})();
