/**
 * Mobile Layout Constants
 *
 * Centralized layout measurements for consistent mobile-first design.
 * All components should reference these constants instead of hardcoded values.
 */

export const LAYOUT = {
  // Fixed UI Elements Heights
  HEADER_HEIGHT: 64, // px
  BOTTOM_NAV_HEIGHT: 80, // px
  CLICK_BUTTON_HEIGHT: 88, // px
  RESOURCE_DISPLAY_HEIGHT: 'auto', // Dynamic based on content

  // Z-Index Layers (mobile-first stacking)
  Z_INDEX: {
    base: 0,
    content: 10,
    sticky: 20,
    clickButton: 30,
    header: 40,
    resourceDisplay: 45,
    bottomNav: 50,
    modal: 200,
    modalBackdrop: 200,
    modalContent: 201,
  },

  // Touch Target Sizes (minimum 44x44px per Apple HIG)
  TOUCH: {
    minSize: 44, // Minimum touch target
    comfortable: 52, // Comfortable touch target
    buttonHeight: 48, // Standard button height
  },

  // Spacing
  SPACING: {
    safeArea: 16, // Safe area padding from screen edges
    contentPadding: 16, // Standard content padding
  },
} as const;

/**
 * Calculate total fixed space at bottom of screen
 */
export function getBottomFixedSpace(): number {
  return LAYOUT.BOTTOM_NAV_HEIGHT + LAYOUT.CLICK_BUTTON_HEIGHT;
}

/**
 * Get padding-bottom value for scrollable content
 * Adds extra breathing room beyond fixed elements
 */
export function getContentBottomPadding(): number {
  return getBottomFixedSpace() + 24; // 24px breathing room
}

/**
 * Get position for click button (from bottom)
 */
export function getClickButtonBottom(): number {
  return LAYOUT.BOTTOM_NAV_HEIGHT;
}
