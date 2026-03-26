import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { focusElement, trapFocus, generateAriaLabel } from '../../utils/accessibility';

describe('focusElement', () => {
  it('focuses the given element', () => {
    const el = document.createElement('button');
    el.scrollIntoView = vi.fn();
    document.body.appendChild(el);

    focusElement(el);

    expect(document.activeElement).toBe(el);
    expect(el.scrollIntoView).toHaveBeenCalledWith({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'nearest',
    });

    document.body.removeChild(el);
  });

  it('does nothing when element is null', () => {
    expect(() => focusElement(null)).not.toThrow();
  });

  it('passes focus options to element.focus()', () => {
    const el = document.createElement('button');
    el.scrollIntoView = vi.fn();
    el.focus = vi.fn();
    document.body.appendChild(el);

    focusElement(el, { preventScroll: true });

    expect(el.focus).toHaveBeenCalledWith({ preventScroll: true });

    document.body.removeChild(el);
  });
});

describe('trapFocus', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  it('focuses the first focusable element on setup', () => {
    const btn1 = document.createElement('button');
    btn1.textContent = 'First';
    const btn2 = document.createElement('button');
    btn2.textContent = 'Second';
    container.appendChild(btn1);
    container.appendChild(btn2);

    trapFocus(container);

    expect(document.activeElement).toBe(btn1);
  });

  it('returns a cleanup function', () => {
    const btn = document.createElement('button');
    container.appendChild(btn);

    const cleanup = trapFocus(container);

    expect(typeof cleanup).toBe('function');
    expect(() => cleanup()).not.toThrow();
  });

  it('wraps focus from last to first element on Tab', () => {
    const btn1 = document.createElement('button');
    btn1.textContent = 'First';
    const btn2 = document.createElement('button');
    btn2.textContent = 'Second';
    container.appendChild(btn1);
    container.appendChild(btn2);

    trapFocus(container);

    btn2.focus();
    expect(document.activeElement).toBe(btn2);

    const tabEvent = new KeyboardEvent('keydown', {
      key: 'Tab',
      bubbles: true,
      cancelable: true,
    });
    container.dispatchEvent(tabEvent);

    expect(document.activeElement).toBe(btn1);
  });

  it('wraps focus from first to last element on Shift+Tab', () => {
    const btn1 = document.createElement('button');
    btn1.textContent = 'First';
    const btn2 = document.createElement('button');
    btn2.textContent = 'Second';
    container.appendChild(btn1);
    container.appendChild(btn2);

    trapFocus(container);

    btn1.focus();
    expect(document.activeElement).toBe(btn1);

    const shiftTabEvent = new KeyboardEvent('keydown', {
      key: 'Tab',
      shiftKey: true,
      bubbles: true,
      cancelable: true,
    });
    container.dispatchEvent(shiftTabEvent);

    expect(document.activeElement).toBe(btn2);
  });

  it('does not interfere with non-Tab keys', () => {
    const btn1 = document.createElement('button');
    container.appendChild(btn1);

    trapFocus(container);

    const enterEvent = new KeyboardEvent('keydown', {
      key: 'Enter',
      bubbles: true,
      cancelable: true,
    });
    container.dispatchEvent(enterEvent);

    expect(document.activeElement).toBe(btn1);
  });
});

describe('generateAriaLabel', () => {
  it('returns just the label when no extras provided', () => {
    expect(generateAriaLabel('Submit')).toBe('Submit');
  });

  it('appends shortcut when provided', () => {
    expect(generateAriaLabel('Submit', 'Enter')).toBe('Submit - Press Enter');
  });

  it('appends description when provided', () => {
    expect(generateAriaLabel('Submit', undefined, 'Saves the form')).toBe(
      'Submit - Saves the form'
    );
  });

  it('includes both shortcut and description', () => {
    expect(generateAriaLabel('Submit', 'Enter', 'Saves the form')).toBe(
      'Submit - Press Enter - Saves the form'
    );
  });
});
