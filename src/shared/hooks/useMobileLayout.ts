import { useMemo } from 'react';
import { LAYOUT, getBottomFixedSpace, getContentBottomPadding, getClickButtonBottom } from '@shared/constants/layout';

/**
 * Hook for consistent mobile layout values
 *
 * Usage:
 * const layout = useMobileLayout();
 * <div style={{ paddingBottom: layout.contentBottomPadding }}>
 */
export function useMobileLayout() {
  return useMemo(
    () => ({
      // Heights
      headerHeight: LAYOUT.HEADER_HEIGHT,
      bottomNavHeight: LAYOUT.BOTTOM_NAV_HEIGHT,
      clickButtonHeight: LAYOUT.CLICK_BUTTON_HEIGHT,

      // Calculated values
      bottomFixedSpace: getBottomFixedSpace(),
      contentBottomPadding: getContentBottomPadding(),
      clickButtonBottom: getClickButtonBottom(),

      // Z-index
      zIndex: LAYOUT.Z_INDEX,

      // Touch targets
      touch: LAYOUT.TOUCH,

      // Spacing
      spacing: LAYOUT.SPACING,

      // Tailwind class helpers
      classes: {
        contentBottomPadding: 'pb-56', // 224px = extra space for fixed elements
        scrollContainer: 'flex-1 overflow-y-auto overscroll-contain',
      },
    }),
    []
  );
}
