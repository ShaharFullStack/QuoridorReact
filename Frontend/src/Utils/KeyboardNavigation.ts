/**
 * Keyboard navigation utilities for improved accessibility
 */

export interface FocusableElement extends HTMLElement {
  focus(): void;
}

/**
 * Get all focusable elements within a container
 */
export const getFocusableElements = (container: HTMLElement): FocusableElement[] => {
  const focusableSelectors = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
    '[contenteditable="true"]'
  ].join(', ');

  return Array.from(container.querySelectorAll(focusableSelectors))
    .filter((element): element is FocusableElement => {
      // Check if element is visible and not hidden
      const el = element as HTMLElement;
      return !!(
        el.offsetWidth ||
        el.offsetHeight ||
        el.getClientRects().length
      );
    });
};

/**
 * Trap focus within a container (useful for modals, dropdowns)
 */
export const trapFocus = (container: HTMLElement): (() => void) => {
  const focusableElements = getFocusableElements(container);
  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key !== 'Tab') return;

    if (event.shiftKey) {
      // Shift + Tab (backwards)
      if (document.activeElement === firstElement) {
        event.preventDefault();
        lastElement?.focus();
      }
    } else {
      // Tab (forwards)
      if (document.activeElement === lastElement) {
        event.preventDefault();
        firstElement?.focus();
      }
    }
  };

  container.addEventListener('keydown', handleKeyDown);
  
  // Focus first element
  firstElement?.focus();

  // Return cleanup function
  return () => {
    container.removeEventListener('keydown', handleKeyDown);
  };
};

/**
 * Handle arrow key navigation for grid/list items
 */
export interface ArrowNavigationOptions {
  orientation?: 'horizontal' | 'vertical' | 'grid';
  loop?: boolean;
  gridColumns?: number;
}

export const handleArrowNavigation = (
  elements: FocusableElement[],
  currentIndex: number,
  key: string,
  options: ArrowNavigationOptions = {}
): number => {
  const { orientation = 'vertical', loop = false, gridColumns } = options;
  let newIndex = currentIndex;

  switch (key) {
    case 'ArrowUp':
      if (orientation === 'grid' && gridColumns) {
        newIndex = currentIndex - gridColumns;
      } else if (orientation === 'vertical') {
        newIndex = currentIndex - 1;
      }
      break;

    case 'ArrowDown':
      if (orientation === 'grid' && gridColumns) {
        newIndex = currentIndex + gridColumns;
      } else if (orientation === 'vertical') {
        newIndex = currentIndex + 1;
      }
      break;

    case 'ArrowLeft':
      if (orientation === 'horizontal' || orientation === 'grid') {
        newIndex = currentIndex - 1;
      }
      break;

    case 'ArrowRight':
      if (orientation === 'horizontal' || orientation === 'grid') {
        newIndex = currentIndex + 1;
      }
      break;

    case 'Home':
      newIndex = 0;
      break;

    case 'End':
      newIndex = elements.length - 1;
      break;

    default:
      return currentIndex;
  }

  // Handle bounds
  if (newIndex < 0) {
    newIndex = loop ? elements.length - 1 : 0;
  } else if (newIndex >= elements.length) {
    newIndex = loop ? 0 : elements.length - 1;
  }

  return newIndex;
};

/**
 * Create roving tabindex behavior for a group of elements
 */
export const createRovingTabindex = (
  container: HTMLElement,
  itemSelector: string,
  options: ArrowNavigationOptions = {}
): (() => void) => {
  let currentIndex = 0;
  
  const updateTabindices = () => {
    const items = Array.from(container.querySelectorAll(itemSelector)) as HTMLElement[];
    items.forEach((item, index) => {
      item.tabIndex = index === currentIndex ? 0 : -1;
    });
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) {
      return;
    }

    event.preventDefault();
    
    const items = Array.from(container.querySelectorAll(itemSelector)) as FocusableElement[];
    const newIndex = handleArrowNavigation(items, currentIndex, event.key, options);
    
    if (newIndex !== currentIndex) {
      currentIndex = newIndex;
      updateTabindices();
      items[newIndex]?.focus();
    }
  };

  const handleFocus = (event: FocusEvent) => {
    const target = event.target as HTMLElement;
    if (target.matches(itemSelector)) {
      const items = Array.from(container.querySelectorAll(itemSelector));
      currentIndex = items.indexOf(target);
      updateTabindices();
    }
  };

  // Initialize
  updateTabindices();
  
  // Add event listeners
  container.addEventListener('keydown', handleKeyDown);
  container.addEventListener('focus', handleFocus, true);

  // Return cleanup function
  return () => {
    container.removeEventListener('keydown', handleKeyDown);
    container.removeEventListener('focus', handleFocus, true);
  };
};

/**
 * Announce to screen readers
 */
export const announce = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
  const announcer = document.createElement('div');
  announcer.setAttribute('aria-live', priority);
  announcer.setAttribute('aria-atomic', 'true');
  announcer.style.position = 'absolute';
  announcer.style.left = '-10000px';
  announcer.style.width = '1px';
  announcer.style.height = '1px';
  announcer.style.overflow = 'hidden';
  
  document.body.appendChild(announcer);
  announcer.textContent = message;
  
  setTimeout(() => {
    document.body.removeChild(announcer);
  }, 1000);
};

/**
 * Skip link functionality
 */
export const createSkipLink = (targetId: string, text: string = 'Skip to main content'): HTMLAnchorElement => {
  const skipLink = document.createElement('a');
  skipLink.href = `#${targetId}`;
  skipLink.textContent = text;
  skipLink.className = 'skip-link';
  
  // Add styles
  skipLink.style.cssText = `
    position: absolute;
    top: -40px;
    left: 6px;
    background: var(--primary-color);
    color: white;
    padding: 8px 16px;
    text-decoration: none;
    border-radius: 4px;
    font-weight: 500;
    z-index: 10000;
    transition: top 0.2s ease-in-out;
  `;
  
  // Show on focus
  skipLink.addEventListener('focus', () => {
    skipLink.style.top = '6px';
  });
  
  skipLink.addEventListener('blur', () => {
    skipLink.style.top = '-40px';
  });
  
  return skipLink;
};

/**
 * Keyboard event handler helpers
 */
export const isEnterOrSpace = (event: KeyboardEvent): boolean => {
  return event.key === 'Enter' || event.key === ' ';
};

export const isEscape = (event: KeyboardEvent): boolean => {
  return event.key === 'Escape';
};

export const isArrowKey = (event: KeyboardEvent): boolean => {
  return ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key);
};