#!/usr/bin/env python3
"""Generate Lulu App Store screenshots for 13-inch iPad.

Simulator pixels are only resized and clipped inside a deterministic tablet
frame; the app interface itself is never redrawn or synthesized.
"""

from __future__ import annotations

import argparse
from dataclasses import dataclass
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont


ROOT = Path(__file__).resolve().parents[1]
APP_STORE_DIR = ROOT / "assets" / "app-store"

CANVAS_WIDTH = 2064
CANVAS_HEIGHT = 2752

FONT_PATH = "/System/Library/Fonts/HelveticaNeue.ttc"
FONT_INDEX_BOLD = 1


@dataclass(frozen=True)
class Panel:
    slug: str
    source: str
    headline: tuple[str, str]
    angle: float
    tablet_x: int
    tablet_y: int
    arc_phase: int


PANELS = (
    Panel(
        slug="01-home",
        source="01-home.png",
        headline=("All of Lulu’s care.", "One clear view."),
        angle=-0.65,
        tablet_x=102,
        tablet_y=520,
        arc_phase=0,
    ),
    Panel(
        slug="02-check-in",
        source="02-check-in.png",
        headline=("Check in daily.", "Care with clarity."),
        angle=0.55,
        tablet_x=100,
        tablet_y=520,
        arc_phase=1,
    ),
    Panel(
        slug="03-records",
        source="03-records.png",
        headline=("Health history.", "All in one place."),
        angle=-0.55,
        tablet_x=102,
        tablet_y=520,
        arc_phase=2,
    ),
    Panel(
        slug="04-reminders",
        source="04-reminders.png",
        headline=("Never miss a", "care moment."),
        angle=0.5,
        tablet_x=100,
        tablet_y=520,
        arc_phase=3,
    ),
    Panel(
        slug="05-family",
        source="05-family.png",
        headline=("Care together.", "Stay in sync."),
        angle=-0.15,
        tablet_x=102,
        tablet_y=520,
        arc_phase=4,
    ),
)


LOCALIZED_HEADLINES = {
    "en": {panel.slug: panel.headline for panel in PANELS},
    "tr": {
        "01-home": ("Lulu’nun tüm bakımı.", "Tek bir bakışta."),
        "02-check-in": ("Her gün kontrol et.", "Güvenle takip et."),
        "03-records": ("Sağlık geçmişi.", "Tek bir yerde."),
        "04-reminders": ("Bakım zamanını", "hiç kaçırma."),
        "05-family": ("Bakımı paylaşın.", "Hep uyumda kalın."),
    },
    "de": {
        "01-home": ("Lulus Gesundheit.", "Auf einen Blick."),
        "02-check-in": ("Täglich einchecken.", "Klar informiert."),
        "03-records": ("Gesundheitsverlauf.", "Alles an einem Ort."),
        "04-reminders": ("Keinen Pflegetermin", "mehr verpassen."),
        "05-family": ("Gemeinsam für Lulu da.", "Immer verbunden."),
    },
}


def make_background(phase: int) -> Image.Image:
    y, x = np.mgrid[0:CANVAS_HEIGHT, 0:CANVAS_WIDTH]
    t = (y / (CANVAS_HEIGHT - 1))[..., None]
    top = np.array([3.0, 7.0, 25.0])
    bottom = np.array([9.0, 13.0, 69.0])
    rgb = np.broadcast_to(top * (1.0 - t) + bottom * t, (CANVAS_HEIGHT, CANVAS_WIDTH, 3)).copy()

    center_x = CANVAS_WIDTH * (0.5 + (phase - 2) * 0.012)
    center_y = CANVAS_HEIGHT * 0.56
    radius = np.sqrt(((x - center_x) / 1180.0) ** 2 + ((y - center_y) / 1120.0) ** 2)
    halo = np.clip(1.0 - radius, 0.0, 1.0) ** 2
    rgb += halo[..., None] * np.array([30.0, 18.0, 92.0])

    edge = np.sqrt(((x - CANVAS_WIDTH / 2) / (CANVAS_WIDTH / 2)) ** 2 + ((y - CANVAS_HEIGHT / 2) / (CANVAS_HEIGHT / 2)) ** 2)
    vignette = np.clip((edge - 0.62) / 0.72, 0.0, 1.0)
    rgb *= 1.0 - 0.3 * vignette[..., None]
    return Image.fromarray(np.uint8(np.clip(rgb, 0, 255)), mode="RGB")


def add_light_trails(image: Image.Image, phase: int) -> None:
    glow = Image.new("RGBA", image.size, (0, 0, 0, 0))
    crisp = Image.new("RGBA", image.size, (0, 0, 0, 0))
    glow_draw = ImageDraw.Draw(glow)
    crisp_draw = ImageDraw.Draw(crisp)

    shift = (phase - 2) * 28
    bounds = (-840 + shift, 820, 2870 + shift, 3490)
    glow_draw.arc(bounds, start=190, end=350, fill=(151, 115, 255, 150), width=26)
    crisp_draw.arc(bounds, start=190, end=350, fill=(187, 157, 255, 205), width=7)
    second = (-300 - shift, 570, 2550 - shift, 3050)
    glow_draw.arc(second, start=205, end=338, fill=(126, 102, 255, 100), width=20)
    crisp_draw.arc(second, start=205, end=338, fill=(151, 132, 255, 145), width=5)

    glow = glow.filter(ImageFilter.GaussianBlur(22))
    image.paste(glow, (0, 0), glow)
    image.paste(crisp, (0, 0), crisp)


def draw_centered_headline(image: Image.Image, lines: tuple[str, str]) -> None:
    draw = ImageDraw.Draw(image)
    font = ImageFont.truetype(FONT_PATH, 132, index=FONT_INDEX_BOLD)
    line_gap = 14
    boxes = [draw.textbbox((0, 0), line, font=font) for line in lines]
    heights = [box[3] - box[1] for box in boxes]
    y = 104 + (300 - (sum(heights) + line_gap)) / 2
    for line, box, line_height in zip(lines, boxes, heights):
        width = box[2] - box[0]
        x = (CANVAS_WIDTH - width) / 2 - box[0]
        draw.text((x, y - box[1]), line, font=font, fill=(250, 250, 253))
        y += line_height + line_gap


def rounded_mask(size: tuple[int, int], radius: int) -> Image.Image:
    mask = Image.new("L", size, 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, size[0] - 1, size[1] - 1), radius=radius, fill=255)
    return mask


def build_tablet(source_path: Path) -> Image.Image:
    screen_width = 1680
    with Image.open(source_path) as source:
        source = source.convert("RGBA")
        screen_height = round(screen_width * source.height / source.width)
        source = source.resize((screen_width, screen_height), Image.Resampling.LANCZOS)

    bezel = 24
    margin = 70
    outer_width = screen_width + bezel * 2
    outer_height = screen_height + bezel * 2
    tablet = Image.new("RGBA", (outer_width + margin * 2, outer_height + margin * 2), (0, 0, 0, 0))

    shadow_mask = Image.new("L", tablet.size, 0)
    ImageDraw.Draw(shadow_mask).rounded_rectangle(
        (margin + 8, margin + 28, margin + outer_width + 9, margin + outer_height + 40),
        radius=72,
        fill=205,
    )
    shadow_mask = shadow_mask.filter(ImageFilter.GaussianBlur(38))
    tablet.paste(Image.new("RGBA", tablet.size, (0, 0, 0, 215)), (0, 0), shadow_mask)

    draw = ImageDraw.Draw(tablet)
    outer_box = (margin, margin, margin + outer_width - 1, margin + outer_height - 1)
    draw.rounded_rectangle(outer_box, radius=72, fill=(4, 5, 8, 255), outline=(105, 107, 116, 255), width=6)
    draw.rounded_rectangle(
        (margin + 8, margin + 8, margin + outer_width - 9, margin + outer_height - 9),
        radius=64,
        outline=(27, 29, 36, 255),
        width=5,
    )
    tablet.paste(source, (margin + bezel, margin + bezel), rounded_mask((screen_width, screen_height), radius=46))
    return tablet


def render_panel(panel: Panel, source_dir: Path, output_dir: Path, headline: tuple[str, str]) -> Path:
    background = make_background(panel.arc_phase)
    add_light_trails(background, panel.arc_phase)
    draw_centered_headline(background, headline)

    tablet = build_tablet(source_dir / panel.source)
    tablet = tablet.rotate(panel.angle, resample=Image.Resampling.BICUBIC, expand=True)
    background.paste(tablet, (panel.tablet_x, panel.tablet_y), tablet)

    output_dir.mkdir(parents=True, exist_ok=True)
    output = output_dir / f"{panel.slug}.png"
    background.convert("RGB").save(output, format="PNG", optimize=True)
    return output


def make_contact_sheet(outputs: list[Path], output_dir: Path) -> Path:
    thumb_width = 344
    thumb_height = round(thumb_width * CANVAS_HEIGHT / CANVAS_WIDTH)
    gap = 24
    sheet = Image.new("RGB", (thumb_width * len(outputs) + gap * (len(outputs) + 1), thumb_height + gap * 2), (8, 9, 18))
    x = gap
    for output in outputs:
        with Image.open(output) as image:
            thumb = image.convert("RGB").resize((thumb_width, thumb_height), Image.Resampling.LANCZOS)
        sheet.paste(thumb, (x, gap))
        x += thumb_width + gap
    contact_path = output_dir / "contact-sheet.png"
    sheet.save(contact_path, format="PNG", optimize=True)
    return contact_path


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--locale", choices=sorted(LOCALIZED_HEADLINES), default="en")
    parser.add_argument("--panel", choices=[panel.slug for panel in PANELS])
    parser.add_argument("--contact-sheet", action="store_true")
    args = parser.parse_args()

    source_dir = APP_STORE_DIR / "source-ipad" / args.locale
    output_dir = APP_STORE_DIR / "final-ipad" / args.locale
    selected = [panel for panel in PANELS if args.panel is None or panel.slug == args.panel]
    missing = [str(source_dir / panel.source) for panel in selected if not (source_dir / panel.source).exists()]
    if missing:
        raise SystemExit("Missing source screenshots:\n" + "\n".join(missing))

    headlines = LOCALIZED_HEADLINES[args.locale]
    outputs = [render_panel(panel, source_dir, output_dir, headlines[panel.slug]) for panel in selected]
    if args.contact_sheet:
        outputs.append(make_contact_sheet(outputs, output_dir))
    for output in outputs:
        print(output.relative_to(ROOT))


if __name__ == "__main__":
    main()
