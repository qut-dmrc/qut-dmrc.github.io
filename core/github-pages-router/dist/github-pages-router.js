(function GitHubPagesRouter() {

  function defineComponent(elementName, ElementClass) {
    if (!customElements.get(elementName))
      customElements.define(elementName, ElementClass);
  }

  let main =  document.querySelector('main')

  // how to signal to 404 page what to swap between?
  window.addEventListener('pageswap', async (event) => { 
    
    sessionStorage.setItem('lastContent', main.innerHTML);

    if(event.viewTransition) {
      //if(main.children.length == 0 ) { 

        console.log('skipped pageswap')
        event.viewTransition.skipTransition();
      //}
    }


  });

  window.addEventListener('pagereveal', async (event) => { 
    /*let last = sessionStorage.getItem('lastContent');
    let next = sessionStorage.getItem('nextContent');
    console.log('Entering with',last);
    console.log('Entering with',next);*/
   
    if(event.viewTransition) {
      //if(main.children.length == 0 ) { 
        console.log('skipped pagereveal')
        event.viewTransition.skipTransition();
      //}
    }
  })

  class GHPRouter extends HTMLElement {
    contentElement = void 0;

    navlinks = new Set();
    contentMap = new Map();
    routes = [];

    constructor() {
      super();
      // Load contentMap from localStorage on initialization
      /*const savedContentMap = localStorage.getItem('contentMap');
      if (savedContentMap) {
        this.contentMap = new Map(JSON.parse(savedContentMap));
      }*/
      
    
    }

    connectedCallback() {
      addEventListener("popstate", this);
      this.contentElement = document.querySelector(
        this.getAttribute("outlet") ?? "main",
      );
      if (!this.contentElement) console.error("Cannot find contentElement");

      /*if(main.children.length == 0) {
        main.innerHTML = sessionStorage.getItem('lastContent') ?? '';
        document.startViewTransition(() => main.innerHTML = sessionStorage.getItem('nextContent'))
      }*/

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
      console.log('href')
      this.viewTransition(contentUrl);
    }
    viewTransition(contentUrl) {
      if (!document.startViewTransition) return this.updateContent(contentUrl);
     
      //document.startViewTransition(() => {

        this.updateContent(contentUrl);
        // this.contentElement.innerHTML = contentUrl//await (await fetch(contentUrl)).text()
      //});
    }

    async updateContent(url) {
      const { contentElement } = this;
      if (!contentElement) return;

      try {
        if (sessionStorage.getItem(url)) {
          contentElement.innerHTML = //this.contentMap.get(url);
            sessionStorage.getItem(url);
        } else {
          const response = await fetch(url);
          const text = await response.text();
          //this.contentMap.set(url, text);
          sessionStorage.setItem(url,text);
          sessionStorage.setItem('nextContent',text);
          contentElement.innerHTML = text;
          //localStorage.setItem('contentMap', JSON.stringify(Array.from(this.contentMap.entries())));
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