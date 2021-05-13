(() => {
  const NODE_TYPES = {
    HEADING: 'HEADING',
    LINK: 'LINK',
    LANDMARK: 'LANDMARK'
  };
  const SELECTORS = {
    [NODE_TYPES.HEADING]: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
    [NODE_TYPES.LINK]: ['a', '[role="link"]'],
    [NODE_TYPES.LANDMARK]: [
      'aside:not([role])', '[role~="complementary"]', '[role~="COMPLEMENTARY"]',
      'form[aria-labelledby]', 'form[aria-label]', 'form[title]', '[role~="form"]', '[role~="form"]',
      'footer', '[role~="contentinfo"]', '[role~="CONTENTINFO"]',
      '[role~="application"]', '[role~="APPLICATION"]',
      'nav', '[role~="navigation"]', '[role~="NAVIGATION"]',
      '[role~="region"][aria-labelledby]', '[role~="REGION"][aria-labelledby]',
      '[role~="region"][aria-label]', '[role~="REGION"][aria-label]',
      'section[aria-labelledby]', 'section[aria-label]',
      'header', '[role~="banner"]', '[role~="BANNER"]',
      '[role~="search"]', '[role~="SEARCH"]',
      'main', '[role~="main"]', '[role~="MAIN"]'
    ]
  };

  const DIRECTION = {
    UP: 'UP',
    DOWN: 'DOWN'
  };

  class PageNavigator {
    constructor () {
      this.selectedDirection = DIRECTION.DOWN;
      this.currentNode = null;
      this.parsedNodes = []; // We are using field because as possible improvement we can use DOM observer and rebuild the list only on the update;
      this.subscribeToEvents();
    }

    getNodeType (node) {
      const types = Object.values(NODE_TYPES);
      return types.find(type => {
        return node.matches(SELECTORS[type].join(', '));
      });
    }

    prepareData () {
      const domString = [
        ...SELECTORS[NODE_TYPES.HEADING],
        ...SELECTORS[NODE_TYPES.LINK],
        ...SELECTORS[NODE_TYPES.LANDMARK]
      ].join(', ');

      const nodeList = document.querySelectorAll(domString);

      this.parsedNodes = [...nodeList].map(node => {
        return {
          node,
          type: this.getNodeType(node)
        };
      });
    }

    getNextNode (type, nodes) {
      const nextIndex = nodes.findIndex(({ node }) => this.currentNode === node) + 1;
      const nodesToSearch = nodes.slice(nodes.length === nextIndex ? 0 : nextIndex); // When we reached the end, start from the beginning.
      const node = nodesToSearch.find(node => node.type === type);

      if (!node && this.currentNode) {
        // No node of same type found, start from beginning
        this.currentNode = null;
        return this.getNextNode(type, nodes);
      }

      return node;
    }

    getPrevNode (type, nodes) {
      const reversedNodes = [...nodes].reverse();
      return this.getNextNode(type, reversedNodes);
    }

    getNode (type, nodes) {
      return this.selectedDirection === DIRECTION.DOWN ? this.getNextNode(type, nodes) : this.getPrevNode(type, nodes);
    }

    restorePrevStyles (node) {
      node.style = node.prevStyles;
      delete node.prevStyles;
    }

    setHighlightStyles (node) {
      node.prevStyles = node.style;
      node.style.outline = '4px dashed #000';
      node.style.backgroundColor = '#fff';
      node.style.color = '#000';
    }

    highlightNextNode (type) {
      this.prepareData();

      if (this.currentNode) {
        this.restorePrevStyles(this.currentNode);
      }

      const { node } = this.getNode(type, this.parsedNodes);
      this.setHighlightStyles(node);
      node.scrollIntoView({ behavior: 'smooth' });

      this.currentNode = node;
    }

    subscribeToEvents () {
      document.addEventListener('keydown', event => {
        switch (event.key.toUpperCase()) {
          case 'ARROWUP':
            this.selectedDirection = DIRECTION.UP;
            break;
          case 'ARROWDOWN':
            this.selectedDirection = DIRECTION.DOWN;
            break;
          case 'H':
            this.highlightNextNode(NODE_TYPES.HEADING);
            break;
          case 'L':
            this.highlightNextNode(NODE_TYPES.LINK);
            break;
          case 'M':
            this.highlightNextNode(NODE_TYPES.LANDMARK);
            break;
        }
      });
    }
  }

  (() => new PageNavigator())();
})();
