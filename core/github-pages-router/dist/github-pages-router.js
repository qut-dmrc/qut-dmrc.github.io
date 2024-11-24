(function GitHubPagesRouter() {
  function defineComponent(elementName, ElementClass) {
    if (!customElements.get(elementName))
      customElements.define(elementName, ElementClass);
  }

  // how to signal to 404 page what to swap between?
  /*window.addEventListener('pageswap', (event) => { 
    localStorage.setItem('lastContent', document.querySelector('main').innerHTML);
  })

  window.addEventListener('pagereveal', (event) => { 
    let last = localStorage.getItem('lastContent')
    document.querySelector('main').innerHTML = last;
    console.log(last)
  })*/

  /**
   * Web component <ghp-router>. All other ghp-* components must be inside a <ghp-router>.
   */
  class GHPRouter extends HTMLElement {
    contentElement = undefined;
    navlinks = new Set();
    contentMap = new Map(/*[
      ['https://qut-dmrc.github.io/post/base.html','<h1>Page 0</h1>\n<p>Content A</p>'],
      ['https://qut-dmrc.github.io/post/page1.html','<h1>Page 1</h1>\n<p>Content B</p>'],
      ['https://qut-dmrc.github.io/post/page2.html','<h1>Page 2</h1>\n<p>Content C</p>'],
      ['https://qut-dmrc.github.io/post/page3.html','<h1>Page 3</h1>\n<p>Content D</p>']   
    ]*/);
    routes = [];

    /*constructor() {
      super();
      // Load contentMap from localStorage on initialization
      const savedContentMap = localStorage.getItem('contentMap');
      if (savedContentMap) {
        this.contentMap = new Map(JSON.parse(savedContentMap));
      }
    }*/

    connectedCallback() {
      addEventListener("popstate", this);
      this.contentElement = document.querySelector(
        this.getAttribute("outlet") ?? "main",
      );
      if (!this.contentElement) console.error("Cannot find contentElement");

      const savedContentMap = localStorage.getItem('contentMap');
      if (savedContentMap) {
        this.contentMap = new Map(JSON.parse(savedContentMap));
      }

      // This + console.logging in the callback seems to hackey render block
      // -> not always
      // this.contentElement.innerHTML = 'Flash of content';

      this.contentElement.innerHTML = [...this.contentMap.values()].at(-1) ?? ''

    }

    handleEvent(event) {
      if (event.type == "popstate") {
        console.log('popped');
        const contentUrl = this.contentUrlFromLocation(location.toString());
        if (contentUrl) this.viewTransition(contentUrl);
      }
    }

    contentUrlFromLocation(url) {
      const matchedRoute = this.routes.find(
        ({ href }) => url == new URL(href, document.baseURI),
      );
      if (matchedRoute)
        return new URL(matchedRoute.content, document.baseURI).toString();
    }

    /**
     * Handle anchor click event.
     */
    navigate(event) {
      event.preventDefault();
      const { href } = event.target;
      if (href == document.location.toString()) return;
      const contentUrl = this.contentUrlFromLocation(href);
      if (!contentUrl) { console.log('no content'); return }
      history.pushState({}, "", href);
      this.viewTransition(contentUrl);
    }

    async viewTransition(contentUrl) {
      if (!document.startViewTransition) return await this.updateContent(contentUrl);
      
      document.startViewTransition(async () => {
        await this.updateContent(contentUrl)
      });
    }
    
    async updateContent(url,keep,drop) {
      
      const { contentElement } = this;
      if (!contentElement) return;
      
      //this.contentElement.innerHTML = await (await fetch(url)).text();
        try {
          if (this.contentMap.has(url)) {
            console.log("setting from cache")
            contentElement.innerHTML = this.contentMap.get(url);
              
          } else {
            const response = await fetch(url);
            const text = await response.text();
            this.contentMap.set(url, text);
            contentElement.innerHTML = text;
            console.log("setting from fetch");
              
            localStorage.setItem('contentMap', JSON.stringify(Array.from(this.contentMap.entries())));
            
          }
          for (const navlink of this.navlinks.values()) navlink.setAriaCurrent();
        } catch (error) {
          console.error(error);
       
        }
  
    }
  }

  defineComponent("ghp-router", GHPRouter);

  function findParentRouter(initialElement) {
    let { parentElement: element } = initialElement;
    while (element) {
      if (element.localName == "ghp-router") return element;
      element = element.parentElement;
    }
    throw new Error(`No ghp-router found for element ${initialElement}`);
  }

  /**
   * Web component <ghp-route>.
   *
   * It requires the following attributes:
   * - route
   * - content: URL to HTML content file.
   *
   * @example
   * ```html
   * <ghp-route route="./" content="./path/to/file.html"></ghp-route>
   * ```
   */
  class GHPRoute extends HTMLElement {
    router = undefined;

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

      if (new URL(href, document.baseURI).toString() == location.toString())
        this.router.viewTransition(
          new URL(content, document.baseURI).toString(),
        );
    }
  }

  defineComponent("ghp-route", GHPRoute);

  /**
   * Web component <ghp-link> handles an anchor that points to a route.
   * It must wrap the anchor, and will override its click event.
   * @example
   * ```html
   * <ghp-link><a href="./some-route">Click me</a></ghp-link>
   * ```
   */
  class GHPLink extends HTMLElement {
    router = undefined;

    connectedCallback() {
      try {
        this.router = findParentRouter(this);
      } catch (error) {
        console.error(error);
      }
      this.anchor?.addEventListener("click", this);
    }

    get anchor() {
      return this.querySelector("a");
    }

    handleEvent(event) {
      if (event.type == "click" && event.target == this.anchor)
        this.router?.navigate(event);
    }
  }

  defineComponent("ghp-link", GHPLink);

  /**
   * Web component <ghp-navlink> is similar to <ghp-link> but it also adds aria-selected="page" if the anchor points to current location.
   */
  class GHPNavlink extends HTMLElement {
    router = undefined;

    connectedCallback() {
      try {
        this.router = findParentRouter(this);
      } catch (error) {
        console.error(error);
      }
      this.anchor?.addEventListener("click", this);
      this.setAriaCurrent();
      this.router?.navlinks.add(this);
    }

    disconnectedCallback() {
      this.router?.navlinks.delete(this);
    }

    get anchor() {
      return this.querySelector("a");
    }

    handleEvent(event) {
      if (event.type == "click" && event.target == this.anchor)
        this.router?.navigate(event);
    }

    setAriaCurrent() {
      const { anchor } = this;
      if (!anchor) return;
      if (anchor.href == document.location.toString()) {
        anchor.setAttribute("aria-current", "page");
      } else {
        anchor.setAttribute("aria-current", "");
      }
    }
  }

  defineComponent("ghp-navlink", GHPNavlink);
})();