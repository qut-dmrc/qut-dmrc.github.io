(function GitHubPagesRouter() {
  function defineComponent(elementName, ElementClass) {
    if (!customElements.get(elementName))
      customElements.define(elementName, ElementClass);
  }

  class GHPRouter extends HTMLElement {
    contentElement = null;
    navlinks = new Set();
    contentMap = new Map();
    routes = [];

    connectedCallback() {
      addEventListener("popstate", this);
      this.contentElement = document.querySelector(
        this.getAttribute("outlet") ?? "main"
      );
      if (!this.contentElement) console.error("Cannot find contentElement");
    }

    handleEvent(event) {
      if (event.type === "popstate") {
        const contentUrl = this.contentUrlFromLocation(location.toString());
        if (contentUrl) this.viewTransition(contentUrl);
      }
    }

    contentUrlFromLocation(url) {
      const matchedRoute = this.routes.find(
        ({ href }) => url === new URL(href, document.baseURI).href
      );
      return matchedRoute ? new URL(matchedRoute.content, document.baseURI).href : null;
    }

    navigate(event) {
      event.preventDefault();
      const { href } = event.target;
      if (href === document.location.href) return;
      const contentUrl = this.contentUrlFromLocation(href);
      if (!contentUrl) return;
      history.pushState({}, "", href);
      this.viewTransition(contentUrl);
    }

    viewTransition(contentUrl) {
      if (!document.startViewTransition) {
        this.updateContent(contentUrl);
        return;
      }
      document.startViewTransition(async () => {
        await this.updateContent(contentUrl);
      });
    }

    async updateContent(url) {
      const { contentElement } = this;
      if (!contentElement) return;

      try {
        if (this.contentMap.has(url)) {
          contentElement.innerHTML = this.contentMap.get(url);
        } else {
          const response = await fetch(url);
          if (!response.ok) throw new Error(`Failed to fetch content from ${url}`);
          const text = await response.text();
          this.contentMap.set(url, text);
          contentElement.innerHTML = text;
        }
        requestAnimationFrame(() => {
          for (const navlink of this.navlinks.values()) navlink.setAriaCurrent();
        });
      } catch (error) {
        console.error(`Error updating content for ${url}:`, error);
      }
    }
  }

  defineComponent("ghp-router", GHPRouter);

  function findParentRouter(initialElement) {
    let element = initialElement.parentElement;
    while (element) {
      if (element.localName === "ghp-router") return element;
      element = element.parentElement;
    }
    throw new Error(`No ghp-router found for element ${initialElement}`);
  }

  class GHPRoute extends HTMLElement {
    router = null;

    connectedCallback() {
      try {
        this.router = findParentRouter(this);
      } catch (error) {
        console.error(error);
        return;
      }

      const href = this.getAttribute("href");
      const content = this.getAttribute("content");
      if (!href || !content) {
        console.error("Missing href or content attribute");
        return;
      }

      this.router.routes.push({ href, content });
      if (new URL(href, document.baseURI).href === location.href) {
        this.router.viewTransition(new URL(content, document.baseURI).href);
      }
    }
  }

  defineComponent("ghp-route", GHPRoute);

  class GHPLink extends HTMLElement {
    router = null;

    connectedCallback() {
      try {
        this.router = findParentRouter(this);
      } catch (error) {
        console.error(error);
      }

      const anchor = this.querySelector("a");
      if (anchor) {
        anchor.addEventListener("click", this);
      }
    }

    handleEvent(event) {
      if (event.type === "click" && event.target === this.querySelector("a")) {
        this.router?.navigate(event);
      }
    }
  }

  defineComponent("ghp-link", GHPLink);

  class GHPNavlink extends HTMLElement {
    router = null;

    connectedCallback() {
      try {
        this.router = findParentRouter(this);
      } catch (error) {
        console.error(error);
      }

      const anchor = this.querySelector("a");
      if (anchor) {
        anchor.addEventListener("click", this);
        this.setAriaCurrent();
        this.router?.navlinks.add(this);
      }
    }

    disconnectedCallback() {
      this.router?.navlinks.delete(this);
    }

    handleEvent(event) {
      if (event.type === "click" && event.target === this.querySelector("a")) {
        this.router?.navigate(event);
      }
    }

    setAriaCurrent() {
      const anchor = this.querySelector("a");
      if (!anchor) return;

      anchor.setAttribute("aria-current", anchor.href === document.location.href ? "page" : "");
    }
  }

  defineComponent("ghp-navlink", GHPNavlink);
})();