#!/usr/bin/env python3
"""Generate pixel-preserving Lulu App Store screenshots.

The source simulator screenshots are resized and clipped into a deterministic
device frame. App UI is never redrawn or synthesized.
"""

from __future__ import annotations

import argparse
from dataclasses import dataclass
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont


ROOT = Path(__file__).resolve().parents[1]
APP_STORE_DIR = ROOT / "assets" / "app-store"

CANVAS_WIDTH = 1320
CANVAS_HEIGHT = 2868

FONT_PATH = "/System/Library/Fonts/HelveticaNeue.ttc"
FONT_INDEX_BOLD = 1


@dataclass(frozen=True)
class Panel:
    slug: str
    source: str
    headline: tuple[str, str]
    angle: float
    phone_x: int
    phone_y: int
    arc_phase: int


PANELS = (
    Panel(
        slug="01-home",
        source="01-home.png",
        headline=("All of Lulu’s care.", "One clear view."),
        angle=-1.8,
        phone_x=78,
        phone_y=615,
        arc_phase=0,
    ),
    Panel(
        slug="02-check-in",
        source="02-check-in.png",
        headline=("Check in daily.", "Care with clarity."),
        angle=1.5,
        phone_x=95,
        phone_y=620,
        arc_phase=1,
    ),
    Panel(
        slug="03-records",
        source="03-records.png",
        headline=("Health history.", "All in one place."),
        angle=-1.6,
        phone_x=82,
        phone_y=620,
        arc_phase=2,
    ),
    Panel(
        slug="04-reminders",
        source="04-reminders.png",
        headline=("Never miss a", "care moment."),
        angle=1.4,
        phone_x=98,
        phone_y=620,
        arc_phase=3,
    ),
    Panel(
        slug="05-family",
        source="05-family.png",
        headline=("Care together.", "Stay in sync."),
        angle=-0.25,
        phone_x=100,
        phone_y=625,
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
    """Build the shared midnight-indigo background with a violet halo."""
    height, width = CANVAS_HEIGHT, CANVAS_WIDTH
    y, x = np.mgrid[0:height, 0:width]

    t = (y / (height - 1))[..., None]
    top = np.array([3.0, 7.0, 25.0])
    bottom = np.array([9.0, 13.0, 69.0])
    rgb = top * (1.0 - t) + bottom * t
    rgb = np.broadcast_to(rgb, (height, width, 3)).copy()

    center_x = width * (0.48 + (phase - 2) * 0.015)
    center_y = height * 0.53
    radius = np.sqrt(((x - center_x) / 780.0) ** 2 + ((y - center_y) / 1080.0) ** 2)
    halo = np.clip(1.0 - radius, 0.0, 1.0) ** 2
    rgb += halo[..., None] * np.array([30.0, 18.0, 92.0])

    edge = np.sqrt(((x - width / 2) / (width / 2)) ** 2 + ((y - height / 2) / (height / 2)) ** 2)
    vignette = np.clip((edge - 0.58) / 0.68, 0.0, 1.0)
    rgb *= (1.0 - 0.32 * vignette[..., None])

    return Image.fromarray(np.uint8(np.clip(rgb, 0, 255)), mode="RGB")


def add_light_trails(image: Image.Image, phase: int) -> None:
    """Draw restrained campaign arcs without introducing extra UI elements."""
    glow = Image.new("RGBA", image.size, (0, 0, 0, 0))
    crisp = Image.new("RGBA", image.size, (0, 0, 0, 0))
    glow_draw = ImageDraw.Draw(glow)
    crisp_draw = ImageDraw.Draw(crisp)

    variants = (
        ((-650, 980, 1890, 3390), 202, 353),
        ((-410, 720, 1720, 2600), 184, 342),
        ((-740, 920, 1940, 3090), 196, 352),
        ((-520, 700, 1900, 2850), 180, 336),
        ((-620, 760, 1840, 2930), 188, 344),
    )
    bounds, start, end = variants[phase % len(variants)]

    glow_draw.arc(bounds, start=start, end=end, fill=(151, 115, 255, 160), width=22)
    crisp_draw.arc(bounds, start=start, end=end, fill=(187, 157, 255, 215), width=6)

    second = (bounds[0] + 360, bounds[1] - 240, bounds[2] + 490, bounds[3] - 80)
    glow_draw.arc(second, start=start + 18, end=end - 12, fill=(126, 102, 255, 110), width=16)
    crisp_draw.arc(second, start=start + 18, end=end - 12, fill=(151, 132, 255, 150), width=4)

    glow = glow.filter(ImageFilter.GaussianBlur(18))
    image.paste(glow, (0, 0), glow)
    image.paste(crisp, (0, 0), crisp)


def draw_centered_headline(image: Image.Image, lines: tuple[str, str]) -> None:
    draw = ImageDraw.Draw(image)
    font = ImageFont.truetype(FONT_PATH, 120, index=FONT_INDEX_BOLD)
    line_gap = 20
    boxes = [draw.textbbox((0, 0), line, font=font) for line in lines]
    heights = [box[3] - box[1] for box in boxes]
    total_height = sum(heights) + line_gap
    y = 172 + (250 - total_height) / 2

    for line, box, line_height in zip(lines, boxes, heights):
        width = box[2] - box[0]
        x = (CANVAS_WIDTH - width) / 2 - box[0]
        draw.text((x, y - box[1]), line, font=font, fill=(250, 250, 253))
        y += line_height + line_gap


def rounded_mask(size: tuple[int, int], radius: int) -> Image.Image:
    mask = Image.new("L", size, 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, size[0] - 1, size[1] - 1), radius=radius, fill=255)
    return mask


def build_phone(source_path: Path) -> Image.Image:
    """Wrap the untouched app capture in a subtle deterministic device frame."""
    screen_width = 1030
    with Image.open(source_path) as source:
        source = source.convert("RGBA")
        screen_height = round(screen_width * source.height / source.width)
        source = source.resize((screen_width, screen_height), Image.Resampling.LANCZOS)

    bezel = 25
    outer_width = screen_width + bezel * 2
    outer_height = screen_height + bezel * 2
    margin = 70
    phone = Image.new("RGBA", (outer_width + margin * 2, outer_height + margin * 2), (0, 0, 0, 0))

    shadow_mask = Image.new("L", phone.size, 0)
    shadow_draw = ImageDraw.Draw(shadow_mask)
    shadow_draw.rounded_rectangle(
        (margin + 7, margin + 28, margin + outer_width + 8, margin + outer_height + 40),
        radius=112,
        fill=205,
    )
    shadow_mask = shadow_mask.filter(ImageFilter.GaussianBlur(38))
    shadow = Image.new("RGBA", phone.size, (0, 0, 0, 215))
    phone.paste(shadow, (0, 0), shadow_mask)

    frame_draw = ImageDraw.Draw(phone)
    outer_box = (margin, margin, margin + outer_width - 1, margin + outer_height - 1)
    frame_draw.rounded_rectangle(outer_box, radius=112, fill=(4, 5, 8, 255), outline=(105, 107, 116, 255), width=6)
    frame_draw.rounded_rectangle(
        (margin + 8, margin + 8, margin + outer_width - 9, margin + outer_height - 9),
        radius=105,
        outline=(27, 29, 36, 255),
        width=5,
    )

    screen_mask = rounded_mask((screen_width, screen_height), radius=90)
    phone.paste(source, (margin + bezel, margin + bezel), screen_mask)

    return phone


def render_panel(panel: Panel, source_dir: Path, output_dir: Path, headline: tuple[str, str]) -> Path:
    background = make_background(panel.arc_phase)
    add_light_trails(background, panel.arc_phase)
    draw_centered_headline(background, headline)

    phone = build_phone(source_dir / panel.source)
    phone = phone.rotate(panel.angle, resample=Image.Resampling.BICUBIC, expand=True)
    background.paste(phone, (panel.phone_x, panel.phone_y), phone)

    output_dir.mkdir(parents=True, exist_ok=True)
    output = output_dir / f"{panel.slug}.png"
    background.convert("RGB").save(output, format="PNG", optimize=True)
    return output


def make_contact_sheet(outputs: list[Path], output_dir: Path) -> Path:
    thumb_width = 330
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
    parser.add_argument("--contact-sheet", action="store_true")
    args = parser.parse_args()

    source_dir = APP_STORE_DIR / "source" / args.locale
    output_dir = APP_STORE_DIR / "final" / args.locale
    headlines = LOCALIZED_HEADLINES[args.locale]
    missing = [str(source_dir / panel.source) for panel in PANELS if not (source_dir / panel.source).exists()]
    if missing:
        raise SystemExit("Missing source screenshots:\n" + "\n".join(missing))

    outputs = [render_panel(panel, source_dir, output_dir, headlines[panel.slug]) for panel in PANELS]
    if args.contact_sheet:
        outputs.append(make_contact_sheet(outputs, output_dir))
    for output in outputs:
        print(output.relative_to(ROOT))


if __name__ == "__main__":
    main()
