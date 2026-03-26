import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react-hooks';
import { useKeyboardNavigation } from '../../hooks/useKeyboardNavigation';

function fireKey(key: string) {
  const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true });
  document.dispatchEvent(event);
}

describe('useKeyboardNavigation', () => {
  const onActivate = vi.fn();
  const onNumberKeyActivate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('initializes with selectedIndex -1 and isKeyboardNavigation false', () => {
    const { result } = renderHook(() =>
      useKeyboardNavigation({ itemCount: 3, onActivate })
    );

    expect(result.current.selectedIndex).toBe(-1);
    expect(result.current.isKeyboardNavigation).toBe(false);
  });

  it('moves selection down on ArrowDown', () => {
    const { result } = renderHook(() =>
      useKeyboardNavigation({ itemCount: 3, onActivate })
    );

    act(() => fireKey('ArrowDown'));

    expect(result.current.selectedIndex).toBe(0);
    expect(result.current.isKeyboardNavigation).toBe(true);
  });

  it('moves selection up with wrapping from -1', () => {
    const { result } = renderHook(() =>
      useKeyboardNavigation({ itemCount: 3, onActivate })
    );

    act(() => fireKey('ArrowUp'));

    expect(result.current.selectedIndex).toBe(2);
  });

  it('wraps around from last to first on ArrowDown', () => {
    const { result } = renderHook(() =>
      useKeyboardNavigation({ itemCount: 3, onActivate })
    );

    act(() => fireKey('ArrowDown'));
    act(() => fireKey('ArrowDown'));
    act(() => fireKey('ArrowDown'));
    act(() => fireKey('ArrowDown'));

    expect(result.current.selectedIndex).toBe(0);
  });

  it('wraps around from first to last on ArrowUp', () => {
    const { result } = renderHook(() =>
      useKeyboardNavigation({ itemCount: 3, onActivate })
    );

    act(() => fireKey('ArrowDown'));
    expect(result.current.selectedIndex).toBe(0);

    act(() => fireKey('ArrowUp'));
    expect(result.current.selectedIndex).toBe(2);
  });

  it('does not wrap when wrap option is false', () => {
    const { result } = renderHook(() =>
      useKeyboardNavigation({
        itemCount: 3,
        onActivate,
        focusOptions: { wrap: false, skipDisabled: false, announceChanges: false },
      })
    );

    act(() => fireKey('ArrowDown'));
    expect(result.current.selectedIndex).toBe(0);

    act(() => fireKey('ArrowUp'));
    expect(result.current.selectedIndex).toBe(0);
  });

  it('clamps at last index without wrap', () => {
    const { result } = renderHook(() =>
      useKeyboardNavigation({
        itemCount: 2,
        onActivate,
        focusOptions: { wrap: false, skipDisabled: false, announceChanges: false },
      })
    );

    act(() => fireKey('ArrowDown'));
    act(() => fireKey('ArrowDown'));
    act(() => fireKey('ArrowDown'));

    expect(result.current.selectedIndex).toBe(1);
  });

  it('calls onActivate with selectedIndex on Enter', () => {
    renderHook(() =>
      useKeyboardNavigation({ itemCount: 3, onActivate })
    );

    act(() => fireKey('ArrowDown'));
    act(() => fireKey('ArrowDown'));
    act(() => fireKey('Enter'));

    expect(onActivate).toHaveBeenCalledWith(1);
  });

  it('calls onActivate with selectedIndex on Space', () => {
    renderHook(() =>
      useKeyboardNavigation({ itemCount: 3, onActivate })
    );

    act(() => fireKey('ArrowDown'));
    act(() => fireKey(' '));

    expect(onActivate).toHaveBeenCalledWith(0);
  });

  it('does not call onActivate when selectedIndex is -1', () => {
    renderHook(() =>
      useKeyboardNavigation({ itemCount: 3, onActivate })
    );

    act(() => fireKey('Enter'));

    expect(onActivate).not.toHaveBeenCalled();
  });

  it('resets selection on Escape', () => {
    const { result } = renderHook(() =>
      useKeyboardNavigation({ itemCount: 3, onActivate })
    );

    act(() => fireKey('ArrowDown'));
    act(() => fireKey('ArrowDown'));
    expect(result.current.selectedIndex).toBe(1);

    act(() => fireKey('Escape'));

    expect(result.current.selectedIndex).toBe(-1);
    expect(result.current.isKeyboardNavigation).toBe(false);
  });

  it('handles number key activation', () => {
    renderHook(() =>
      useKeyboardNavigation({
        itemCount: 3,
        onActivate,
        onNumberKeyActivate,
      })
    );

    act(() => fireKey('1'));
    expect(onNumberKeyActivate).toHaveBeenCalledWith('1');

    act(() => fireKey('2'));
    expect(onNumberKeyActivate).toHaveBeenCalledWith('2');

    act(() => fireKey('3'));
    expect(onNumberKeyActivate).toHaveBeenCalledWith('3');
  });

  it('does not call onNumberKeyActivate when handler is not provided', () => {
    renderHook(() =>
      useKeyboardNavigation({ itemCount: 3, onActivate })
    );

    expect(() => {
      act(() => fireKey('1'));
    }).not.toThrow();
  });

  it('handles ArrowRight same as ArrowDown', () => {
    const { result } = renderHook(() =>
      useKeyboardNavigation({ itemCount: 3, onActivate })
    );

    act(() => fireKey('ArrowRight'));

    expect(result.current.selectedIndex).toBe(0);
  });

  it('handles ArrowLeft same as ArrowUp', () => {
    const { result } = renderHook(() =>
      useKeyboardNavigation({ itemCount: 3, onActivate })
    );

    act(() => fireKey('ArrowDown'));
    act(() => fireKey('ArrowDown'));
    expect(result.current.selectedIndex).toBe(1);

    act(() => fireKey('ArrowLeft'));
    expect(result.current.selectedIndex).toBe(0);
  });

  it('resetSelection function works when called directly', () => {
    const { result } = renderHook(() =>
      useKeyboardNavigation({ itemCount: 3, onActivate })
    );

    act(() => fireKey('ArrowDown'));
    expect(result.current.selectedIndex).toBe(0);

    act(() => result.current.resetSelection());

    expect(result.current.selectedIndex).toBe(-1);
    expect(result.current.isKeyboardNavigation).toBe(false);
  });

  it('announceToScreenReader creates and removes aria-live element', async () => {
    const { result } = renderHook(() =>
      useKeyboardNavigation({ itemCount: 3, onActivate })
    );

    act(() => result.current.announceToScreenReader('Item selected'));

    const announcements = document.querySelectorAll('[aria-live="polite"]');
    expect(announcements.length).toBeGreaterThan(0);
    expect(announcements[announcements.length - 1].textContent).toBe('Item selected');
  });

  it('announceToScreenReader does nothing when announceChanges is false', () => {
    const { result } = renderHook(() =>
      useKeyboardNavigation({
        itemCount: 3,
        onActivate,
        focusOptions: { wrap: true, skipDisabled: false, announceChanges: false },
      })
    );

    const beforeCount = document.querySelectorAll('[aria-live="polite"]').length;
    act(() => result.current.announceToScreenReader('Should not appear'));
    const afterCount = document.querySelectorAll('[aria-live="polite"]').length;

    expect(afterCount).toBe(beforeCount);
  });

  it('provides a containerRef', () => {
    const { result } = renderHook(() =>
      useKeyboardNavigation({ itemCount: 3, onActivate })
    );

    expect(result.current.containerRef).toBeDefined();
    expect(result.current.containerRef.current).toBeNull();
  });
});
