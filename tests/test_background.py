"""
Tests for the "make the background blue" feature.

These tests read the static `index.html` file directly (there is no build step
or test runner in this repo beyond the Python standard library) and assert on
the `body` rule's `background` declaration.

Run with:
    python3 -m unittest discover tests

NOTE: These tests are written against the *target* (post-change) state of
index.html, where the body background is a blue gradient. If run against the
pre-change baseline (still the purple/violet gradient
`linear-gradient(135deg, #667eea 0%, #764ba2 100%)`), assertions (1)-(3) below
are EXPECTED TO FAIL. That is intentional: it proves the test actually
exercises the acceptance criteria rather than trivially passing.
"""

import re
import unittest
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parent.parent
INDEX_HTML_PATH = REPO_ROOT / "index.html"

# Colors that must be gone from the body background once the fix lands.
FORBIDDEN_BACKGROUND_COLORS = ("#667eea", "#764ba2")

# Declarations that belong to *other* elements and must survive untouched.
UNTOUCHED_LITERALS = [
    "rgba(59, 130, 246, 0.8)",
    "rgba(147, 197, 253, 0.8)",
    "#ff6b9d",
    "#333",
]

UNTOUCHED_KEYFRAME_NAMES = ["pulse", "spin", "fadeOut", "blink", "swish"]

MIN_CONTRAST_RATIO = 4.5
WHITE_RGB = (255, 255, 255)


def _read_index_html():
    return INDEX_HTML_PATH.read_text(encoding="utf-8")


def _extract_body_rule(html):
    """
    Extract the contents of the CSS `body { ... }` rule (the top-level page
    background rule), being careful not to match rules like `.mouse-body {}`.

    We require `body` to appear as the entire selector on its line (only
    leading whitespace before it), so `.mouse-body {` is not mistaken for it.
    """
    match = re.search(r"^[ \t]*body[ \t]*\{([^}]*)\}", html, re.MULTILINE)
    if not match:
        raise AssertionError(
            "Could not find a top-level `body { ... }` CSS rule in index.html "
            "(searched for a line consisting of leading whitespace + 'body {')."
        )
    return match.group(1)


def _extract_background_declaration(body_rule_text):
    match = re.search(r"background\s*:\s*([^;]+);", body_rule_text)
    if not match:
        raise AssertionError(
            "The `body` rule has no `background: ...;` declaration to check."
        )
    return match.group(1).strip()


def _extract_color_stops(declaration):
    """
    Pull every color literal out of a CSS background declaration, returning
    a list of (label, (r, g, b)) tuples in the order they appear.

    Supports #rrggbb / #rgb hex colors and rgb()/rgba() functional notation,
    which covers every reasonable way to author a blue gradient/solid color
    for this rule.
    """
    stops = []

    hex_re = re.compile(r"#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b")
    rgb_re = re.compile(
        r"rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*[\d.]+\s*)?\)"
    )

    for m in hex_re.finditer(declaration):
        hexval = m.group(1)
        if len(hexval) == 3:
            r, g, b = (int(c * 2, 16) for c in hexval)
        else:
            r = int(hexval[0:2], 16)
            g = int(hexval[2:4], 16)
            b = int(hexval[4:6], 16)
        stops.append((m.group(0), (r, g, b)))

    for m in rgb_re.finditer(declaration):
        r, g, b = int(m.group(1)), int(m.group(2)), int(m.group(3))
        stops.append((m.group(0), (r, g, b)))

    if not stops:
        raise AssertionError(
            "No parseable color stops (hex or rgb/rgba) were found in the "
            "body background declaration: %r" % (declaration,)
        )

    return stops


def _srgb_channel_to_linear(value_0_255):
    c = value_0_255 / 255.0
    if c <= 0.03928:
        return c / 12.92
    return ((c + 0.055) / 1.055) ** 2.4


def _relative_luminance(rgb):
    r, g, b = rgb
    r_lin = _srgb_channel_to_linear(r)
    g_lin = _srgb_channel_to_linear(g)
    b_lin = _srgb_channel_to_linear(b)
    return 0.2126 * r_lin + 0.7152 * g_lin + 0.0722 * b_lin


def _contrast_ratio(rgb_a, rgb_b):
    lum_a = _relative_luminance(rgb_a)
    lum_b = _relative_luminance(rgb_b)
    lighter = max(lum_a, lum_b)
    darker = min(lum_a, lum_b)
    return (lighter + 0.05) / (darker + 0.05)


class BackgroundIsBlueTests(unittest.TestCase):
    """AC-1: the body background must be blue, not the old purple/violet."""

    @classmethod
    def setUpClass(cls):
        cls.html = _read_index_html()
        cls.body_rule = _extract_body_rule(cls.html)
        cls.background_declaration = _extract_background_declaration(cls.body_rule)

    def test_old_purple_violet_colors_are_gone(self):
        for forbidden in FORBIDDEN_BACKGROUND_COLORS:
            self.assertNotIn(
                forbidden.lower(),
                self.background_declaration.lower(),
                msg=(
                    "The body background declaration still contains the old "
                    "purple/violet color %r (declaration: %r). AC-1 requires "
                    "this to be replaced with a blue background."
                    % (forbidden, self.background_declaration)
                ),
            )

    def test_every_background_color_stop_is_blue_dominant(self):
        stops = _extract_color_stops(self.background_declaration)
        for label, (r, g, b) in stops:
            self.assertTrue(
                b > r and b > g,
                msg=(
                    "Color stop %s (rgb=%r) in the body background is not "
                    "blue-dominant: blue channel (%d) must be strictly greater "
                    "than both red (%d) and green (%d) for the page to read as "
                    "blue rather than purple/violet/teal. Full declaration: %r"
                    % (label, (r, g, b), b, r, g, self.background_declaration)
                ),
            )

    def test_every_background_color_stop_has_sufficient_contrast_with_white(self):
        stops = _extract_color_stops(self.background_declaration)
        for label, rgb in stops:
            ratio = _contrast_ratio(rgb, WHITE_RGB)
            self.assertGreaterEqual(
                ratio,
                MIN_CONTRAST_RATIO,
                msg=(
                    "Color stop %s (rgb=%r) has a contrast ratio of only "
                    "%.2f:1 against white, which is below the WCAG AA "
                    "threshold of %.1f:1 required (AC-4) for readability of "
                    "the white mouse body and white h1/.info text against "
                    "this background. Full declaration: %r"
                    % (label, rgb, ratio, MIN_CONTRAST_RATIO, self.background_declaration)
                ),
            )


class UntouchedElementsTests(unittest.TestCase):
    """AC-2/AC-3: everything besides the body background must be unchanged."""

    @classmethod
    def setUpClass(cls):
        cls.html = _read_index_html()

    def test_unrelated_color_literals_are_still_present(self):
        for literal in UNTOUCHED_LITERALS:
            self.assertIn(
                literal,
                self.html,
                msg=(
                    "Expected the untouched declaration %r to still be present "
                    "verbatim in index.html, but it was not found. This "
                    "literal belongs to an element other than the body "
                    "background (mouse eyes, nose, or trail dots) and must "
                    "not be altered by a background-color-only change."
                    % (literal,)
                ),
            )

    def test_all_keyframe_animations_are_still_defined(self):
        for name in UNTOUCHED_KEYFRAME_NAMES:
            pattern = r"@keyframes\s+%s\b" % re.escape(name)
            self.assertRegex(
                self.html,
                pattern,
                msg=(
                    "Expected `@keyframes %s { ... }` to still be defined in "
                    "index.html so the corresponding animation keeps running, "
                    "but it was not found." % (name,)
                ),
            )


if __name__ == "__main__":
    unittest.main()
