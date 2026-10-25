/** Theme tokens shared by the app provider and messages shown outside its setup. */
export const naiveThemeOverrides = {
  common: {
    primaryColor: '#e8811f',
    primaryColorHover: '#c96a12',
    primaryColorPressed: '#a0520c',
    primaryColorSuppl: '#e8811f',
    infoColor: '#e8811f',
    infoColorHover: '#c96a12',
    infoColorPressed: '#a0520c',
    borderRadius: '8px',
  },
  Input: {
    caretColor: '#e8811f',
    borderHover: '#ffb574',
    borderFocus: '#e8811f',
    boxShadowFocus: '0 0 0 2px rgba(232, 129, 31, 0.15)',
  },
  Select: {
    peers: {
      InternalSelection: {
        borderHover: '#ffb574',
        borderFocus: '#e8811f',
        boxShadowFocus: '0 0 0 2px rgba(232, 129, 31, 0.15)',
      },
    },
  },
  Switch: {
    railColorActive: '#e8811f',
    railColorActiveHover: '#c96a12',
    buttonColor: '#ffffff',
    boxShadowFocus: '0 0 0 2px rgba(232, 129, 31, 0.18)',
  },
}

/** Naive's dark theme uses dark ink on filled primary buttons. Every desktop
 * renderer uses the same product accent, so Windows and macOS both need white
 * ink; text, ghost and secondary buttons keep their own tokens. */
export function themeOverridesForPlatform(desktopDark: boolean) {
  if (!desktopDark) return naiveThemeOverrides
  const whiteInk = {
    textColorPrimary: '#ffffff',
    textColorHoverPrimary: '#ffffff',
    textColorPressedPrimary: '#ffffff',
    textColorFocusPrimary: '#ffffff',
    textColorDisabledPrimary: '#ffffff',
    textColorInfo: '#ffffff',
    textColorHoverInfo: '#ffffff',
    textColorPressedInfo: '#ffffff',
    textColorFocusInfo: '#ffffff',
    textColorDisabledInfo: '#ffffff',
    textColorTextPrimary: '#ffd0a6',
    textColorTextHoverPrimary: '#ffe9d5',
    textColorTextPressedPrimary: '#ffb574',
    textColorGhostPrimary: '#ffd0a6',
    textColorGhostHoverPrimary: '#ffe9d5',
    textColorGhostPressedPrimary: '#ffb574',
    textColorTextInfo: '#ffd0a6',
    textColorGhostInfo: '#ffd0a6',
  }
  return { ...naiveThemeOverrides, Button: whiteInk }
}
