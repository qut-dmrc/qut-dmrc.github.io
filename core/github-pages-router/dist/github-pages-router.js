
(function GitHubPagesRouter() {
  let perf = performance.now()

  function defineComponent(elementName, ElementClass) {
    
    if (!customElements.get(elementName)) {
      customElements.define(elementName, ElementClass);
      console.log(elementName,'defined in', (performance.now()-perf).toFixed(2))
    }
  }

  let main =  document.querySelector('main')

  // how to signal to 404 page what to swap between?
  window.addEventListener('pageswap', async (event) => { 
    
    sessionStorage.setItem('lastVisit', main.innerHTML);
    if(event.viewTransition) {
      // console.log('Swapping')
      //if(main.children.length == 0 ) { 
        //console.log('skipped pageswap')
        //event.viewTransition.skipTransition();
      //}
    }

  });

  window.addEventListener('pagereveal', async (event) => { 
    
   
    if(event.viewTransition) {
      //console.log('Revealing')
      //if(main.children.length == 0 ) { 
        //main.innerHTML = sessionStorage.getItem('nextContent');
        //console.log('skipped pagereveal')
        //event.viewTransition.skipTransition();
      //}
    }
  })

  class GHPRouter extends HTMLElement {
    contentElement = void 0;

    navlinks = new Set();
    contentMap = new Map();
    routes = [];

    connectedCallback() {
      addEventListener("popstate", this);
      this.contentElement = document.querySelector(
        this.getAttribute("outlet") ?? "main",
      );
      if (!this.contentElement) console.error("Cannot find contentElement");
    }

    handleEvent(event) {
      if (event.type == "popstate") {
        const contentUrl = this.contentUrlFromLocation(location.toString());
        if (contentUrl) this.viewTransition(contentUrl);
      }
    }
    contentUrlFromLocation(url) {
      const matchedRoute = this.routes.find(
        ({ href }) => url == new URL(href, document.baseURI),
      );
      if (matchedRoute) {
        let contentUrl = new URL(matchedRoute.content, document.baseURI).toString();
        return contentUrl 
      }
    }
    navigate(event) {
      event.preventDefault();
      const { href } = event.target;
      if (href == document.location.toString()) return;
      const contentUrl = this.contentUrlFromLocation(href);
      if (!contentUrl) return;
      history.pushState({}, "", href);
      this.viewTransition(contentUrl);
    }

    async viewTransition(contentUrl) {
      if (!document.startViewTransition) return await this.updateContent(contentUrl);
      let last = sessionStorage.getItem('lastVisit')
      // console.log('Setting', last);
      this.contentElement.innerHTML = last;
      document.startViewTransition(async () => {
        await this.updateContent(contentUrl);
      });

    }

    async updateContent(url) {
      const { contentElement } = this;
      if (!contentElement) return;

      return new Promise(async (keep,drop)=> {
        try {
        if (sessionStorage.getItem(url)) {
          contentElement.innerHTML = //this.contentMap.get(url);
            sessionStorage.getItem(url);
            keep()
        } else {
          const response = await fetch(url);
          const text = await response.text();
          //this.contentMap.set(url, text);
          sessionStorage.setItem(url,text);
          // sessionStorage.setItem('nextContent',text);
          contentElement.innerHTML = text;
          keep()
          //localStorage.setItem('contentMap', JSON.stringify(Array.from(this.contentMap.entries())));
        }
        // for (const navlink of this.navlinks.values()) navlink.setAriaCurrent();
      } catch (error) {
        console.error(error);
        drop(error);
      }
      })
    }
  }

  defineComponent("ghp-router", GHPRouter);
  function findParentRouter(initialElement) {
    let { parentElement: element } = initialElement;
    let perf = performance.now()
    console.log('Finding parent')
    while (element) {
      if (element.localName == "ghp-router") {
        console.log('Parent found in', (performance.now()-perf).toFixed(2))
        return element;
      }
      element = element.parentElement;
    }
    throw new Error(`No ghp-router found for element ${initialElement}`);
  }

  class GHPRoute extends HTMLElement {
    router = void 0;
    async connectedCallback() {
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
      if (new URL(href, document.baseURI).toString() == location.toString()) {
        console.log('Called viewTransition from route')
        this.router.viewTransition(
          new URL(content, document.baseURI).toString(),
        );
      }
    }
  }

  defineComponent("ghp-route", GHPRoute);

  class GHPLink extends HTMLElement {
    router = void 0;
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

  class GHPNavlink extends HTMLElement {
    router = void 0;
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