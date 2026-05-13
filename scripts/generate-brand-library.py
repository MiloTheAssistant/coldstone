from __future__ import annotations

import argparse
import math
import random
from pathlib import Path

from PIL import Image, ImageChops, ImageDraw, ImageEnhance, ImageFilter, ImageFont, ImageOps


ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / "public"
BRAND = PUBLIC / "brand"

SOURCES = {
    "hero_desktop": PUBLIC / "hero" / "coldstone-hero-desktop.jpg",
    "hero_mobile": PUBLIC / "hero" / "coldstone-hero-mobile.jpg",
    "stone_forge": PUBLIC / "stone-forge.jpg",
    "black_granite": PUBLIC / "black-granite-soap.jpg",
    "ritual_scene": BRAND / "source" / "field-kit-ritual-scene.png",
    "stamp_source": BRAND / "source" / "photoreal-s-stamp.png",
}

PROFILE_SIZE = (1024, 1024)
HERO_ASSETS: dict[str, tuple[int, int, str]] = {
    "hero/coldstone-field-kit-ritual-desktop.png": (1920, 1080, "desktop"),
    "hero/coldstone-field-kit-ritual-mobile.png": (900, 1400, "mobile"),
}

ASSETS: dict[str, tuple[int, int, str, str]] = {
    "website/profile-stamp.png": (*PROFILE_SIZE, "stamp", "center"),
    "website/profile-background.png": (1920, 1080, "hero", "right"),
    "facebook/profile-stamp.png": (*PROFILE_SIZE, "stamp", "center"),
    "facebook/cover-background.png": (1640, 624, "hero", "right"),
    "facebook/post-background.png": (1200, 630, "hero", "center"),
    "instagram/profile-stamp.png": (*PROFILE_SIZE, "stamp", "center"),
    "instagram/profile-background.png": (1080, 1080, "hero", "center"),
    "instagram/post-background.png": (1080, 1080, "hero", "right"),
    "instagram/story-background.png": (1080, 1920, "hero-mobile", "bottom"),
    "tiktok/profile-stamp.png": (*PROFILE_SIZE, "stamp", "center"),
    "tiktok/profile-background.png": (1080, 1080, "hero", "center"),
    "tiktok/cover-background.png": (1080, 1920, "hero-mobile", "bottom"),
    "linkedin/profile-stamp.png": (*PROFILE_SIZE, "stamp", "center"),
    "linkedin/company-cover-background.png": (2256, 382, "hero", "right"),
    "linkedin/post-background.png": (1200, 627, "hero", "center"),
    "x/profile-stamp.png": (*PROFILE_SIZE, "stamp", "center"),
    "x/header-background.png": (1500, 500, "hero", "right"),
    "x/post-background.png": (1600, 900, "hero", "center"),
}

CONTACT_SHEET = BRAND / "contact-sheet.png"

PALETTE = {
    "midnight": (18, 18, 18),
    "navy": (8, 13, 26),
    "gunmetal": (36, 38, 40),
    "crimson": (74, 30, 20),
    "gold": (212, 160, 23),
    "parchment": (245, 240, 232),
    "stone": (120, 114, 104),
    "canvas": (85, 76, 62),
}


def load_font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    candidates = [
        Path("C:/Windows/Fonts/georgiab.ttf" if bold else "C:/Windows/Fonts/georgia.ttf"),
        Path("C:/Windows/Fonts/timesbd.ttf" if bold else "C:/Windows/Fonts/times.ttf"),
        Path("C:/Windows/Fonts/arialbd.ttf" if bold else "C:/Windows/Fonts/arial.ttf"),
    ]
    for candidate in candidates:
        if candidate.exists():
            return ImageFont.truetype(str(candidate), size=size)
    return ImageFont.load_default()


def cover_fit(img: Image.Image, size: tuple[int, int], anchor: str = "center") -> Image.Image:
    w, h = size
    iw, ih = img.size
    scale = max(w / iw, h / ih)
    nw, nh = math.ceil(iw * scale), math.ceil(ih * scale)
    resized = img.resize((nw, nh), Image.Resampling.LANCZOS)

    if anchor == "left":
        x = 0
    elif anchor == "right":
        x = nw - w
    else:
        x = (nw - w) // 2

    if anchor == "top":
        y = 0
    elif anchor == "bottom":
        y = nh - h
    else:
        y = (nh - h) // 2

    return resized.crop((x, y, x + w, y + h))


def add_noise(img: Image.Image, amount: int = 18, opacity: float = 0.16) -> Image.Image:
    rng = random.Random(44)
    noise = Image.effect_noise(img.size, amount).convert("L")
    noise = ImageOps.autocontrast(noise)
    noise_rgb = Image.merge("RGB", (noise, noise, noise))
    return Image.blend(img, ImageChops.multiply(img, noise_rgb), opacity)


def add_vignette(img: Image.Image, strength: float = 0.34) -> Image.Image:
    w, h = img.size
    x = Image.linear_gradient("L").resize((w, h))
    y = Image.linear_gradient("L").rotate(90).resize((w, h))
    radial = ImageChops.lighter(x, ImageOps.mirror(x))
    radial = ImageChops.lighter(radial, y)
    radial = ImageChops.lighter(radial, ImageOps.flip(y))
    vignette = ImageOps.invert(ImageOps.autocontrast(radial)).filter(ImageFilter.GaussianBlur(max(w, h) // 12))
    dark = Image.new("RGB", img.size, PALETTE["midnight"])
    return Image.composite(dark, img, vignette.point(lambda p: int(p * strength)))


def make_source_texture(source: Image.Image, size: tuple[int, int], blur: int = 8) -> Image.Image:
    texture = cover_fit(source.convert("RGB"), size, "center")
    texture = texture.filter(ImageFilter.GaussianBlur(blur))
    texture = ImageEnhance.Color(texture).enhance(0.35)
    texture = ImageEnhance.Contrast(texture).enhance(1.25)
    texture = ImageEnhance.Brightness(texture).enhance(1.14)
    return add_noise(texture, amount=22, opacity=0.18)


def make_blank_soap_texture(size: tuple[int, int]) -> Image.Image:
    w, h = size
    base = Image.new("RGB", size, (56, 56, 54))
    noise = Image.effect_noise(size, 74).convert("L")
    fine = Image.effect_noise(size, 18).convert("L")
    noise = ImageOps.autocontrast(noise).point(lambda p: int(30 + p * 0.42))
    texture = Image.merge("RGB", (noise, noise, noise))
    texture = Image.blend(base, texture, 0.48)
    speckle = ImageOps.autocontrast(fine).point(lambda p: 255 if p > 234 else 0)
    texture = ImageChops.screen(texture, Image.merge("RGB", (speckle, speckle, speckle))).filter(ImageFilter.GaussianBlur(0.25))
    texture = ImageEnhance.Contrast(texture).enhance(1.24)
    texture = ImageEnhance.Brightness(texture).enhance(0.74)
    d = ImageDraw.Draw(texture, "RGBA")
    for i in range(9):
        y = int(h * (0.15 + i * 0.08))
        d.line((int(w * 0.08), y, int(w * 0.92), y + int(h * 0.025)), fill=(255, 255, 255, 18), width=max(1, h // 90))
    return texture


def paste_shadowed_bar(
    base: Image.Image,
    box: tuple[int, int, int, int],
    texture: Image.Image,
    angle: float,
    radius: int,
    border: tuple[int, int, int],
) -> None:
    x0, y0, x1, y1 = box
    w, h = x1 - x0, y1 - y0
    bar = cover_fit(texture, (w, h), "center")
    bar = ImageEnhance.Brightness(bar).enhance(1.18)
    bar = ImageEnhance.Contrast(bar).enhance(1.32)
    mask = Image.new("L", (w, h), 0)
    d = ImageDraw.Draw(mask)
    d.rounded_rectangle((0, 0, w - 1, h - 1), radius=radius, fill=255)
    bar_rgba = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    bar_rgba.paste(bar, (0, 0), mask)
    rim = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    rd = ImageDraw.Draw(rim)
    rd.rounded_rectangle((2, 2, w - 3, h - 3), radius=radius, outline=(*border, 120), width=max(2, w // 140))
    bar_rgba.alpha_composite(rim)
    rotated = bar_rgba.rotate(angle, resample=Image.Resampling.BICUBIC, expand=True)

    shadow = Image.new("RGBA", rotated.size, (0, 0, 0, 0))
    alpha = rotated.getchannel("A")
    shadow.putalpha(alpha.filter(ImageFilter.GaussianBlur(max(8, w // 38))).point(lambda p: int(p * 0.62)))
    px = x0 + (w - rotated.size[0]) // 2
    py = y0 + (h - rotated.size[1]) // 2
    base.alpha_composite(shadow, (px + max(8, w // 24), py + max(10, h // 12)))
    base.alpha_composite(rotated, (px, py))


def draw_field_kit_details(layer: Image.Image, variant: str) -> None:
    w, h = layer.size
    draw = ImageDraw.Draw(layer, "RGBA")
    gold = (*PALETTE["gold"], 120)
    canvas = (*PALETTE["canvas"], 112)
    crimson = (*PALETTE["crimson"], 86)

    if variant in {"right", "center"}:
        draw.rectangle((0, h * 0.08, w * 0.18, h * 0.18), fill=canvas)
        draw.rectangle((0, h * 0.2, w * 0.24, h * 0.23), fill=crimson)
        draw.line((w * 0.05, h * 0.28, w * 0.42, h * 0.21), fill=gold, width=max(2, w // 420))
    else:
        draw.rectangle((w * 0.78, h * 0.12, w, h * 0.22), fill=canvas)
        draw.rectangle((w * 0.74, h * 0.25, w, h * 0.29), fill=crimson)
        draw.line((w * 0.58, h * 0.2, w * 0.95, h * 0.3), fill=gold, width=max(2, w // 420))

    rivet_r = max(5, min(w, h) // 95)
    for i in range(4):
        cx = int(w * (0.08 + i * 0.045)) if variant != "left" else int(w * (0.82 + i * 0.045))
        cy = int(h * 0.13)
        draw.ellipse((cx - rivet_r, cy - rivet_r, cx + rivet_r, cy + rivet_r), fill=(*PALETTE["gold"], 128))


def make_bar_layer(target_width: int) -> Image.Image:
    """Cut the real Coldstone bar from the existing product image without relying on generated text."""
    source = Image.open(SOURCES["stone_forge"]).convert("RGBA")
    mask = Image.new("L", source.size, 0)
    d = ImageDraw.Draw(mask)
    # Approximate the existing bar's perspective so the product mark stays real and recognizable.
    polygon = [(20, 172), (1126, 94), (1260, 654), (40, 756)]
    d.polygon(polygon, fill=255)
    mask = mask.filter(ImageFilter.GaussianBlur(5))
    cutout = Image.new("RGBA", source.size, (0, 0, 0, 0))
    cutout.paste(source, (0, 0), mask)
    bbox = mask.getbbox()
    if bbox is None:
        raise RuntimeError("Could not isolate Coldstone bar from source product image")
    cutout = cutout.crop(bbox)
    scale = target_width / cutout.width
    target_size = (target_width, max(1, int(cutout.height * scale)))
    cutout = cutout.resize(target_size, Image.Resampling.LANCZOS)
    cutout = ImageEnhance.Contrast(cutout).enhance(1.08)
    cutout = ImageEnhance.Brightness(cutout).enhance(0.96)
    return cutout


def paste_product_bar(canvas: Image.Image, target_width: int, center: tuple[int, int], angle: float) -> None:
    bar = make_bar_layer(target_width).rotate(angle, resample=Image.Resampling.BICUBIC, expand=True)
    shadow = Image.new("RGBA", bar.size, (0, 0, 0, 0))
    shadow_alpha = bar.getchannel("A").filter(ImageFilter.GaussianBlur(max(12, target_width // 45))).point(lambda p: int(p * 0.62))
    shadow.putalpha(shadow_alpha)
    x = int(center[0] - bar.width / 2)
    y = int(center[1] - bar.height / 2)
    canvas.alpha_composite(shadow, (x + max(16, target_width // 35), y + max(18, target_width // 32)))
    canvas.alpha_composite(bar, (x, y))


def add_linear_scrim(canvas: Image.Image, direction: str, max_alpha: int) -> None:
    width, height = canvas.size
    overlay = Image.new("RGBA", (width, height), (5, 8, 12, 0))
    alpha = Image.new("L", (width, height), 0)
    pixels = alpha.load()
    if direction == "left":
        fade_width = int(width * 0.66)
        for x in range(width):
            value = max(0, int(max_alpha * (1 - x / max(1, fade_width))))
            if value:
                for y in range(height):
                    pixels[x, y] = max(pixels[x, y], value)
    elif direction == "top":
        fade_height = int(height * 0.58)
        for y in range(height):
            value = max(0, int(max_alpha * (1 - y / max(1, fade_height))))
            if value:
                for x in range(width):
                    pixels[x, y] = max(pixels[x, y], value)
    elif direction == "bottom":
        fade_height = int(height * 0.42)
        for y in range(height):
            distance = height - y
            value = max(0, int(max_alpha * (1 - distance / max(1, fade_height))))
            if value:
                for x in range(width):
                    pixels[x, y] = max(pixels[x, y], value)
    overlay.putalpha(alpha.filter(ImageFilter.GaussianBlur(max(8, min(width, height) // 90))))
    canvas.alpha_composite(overlay)


def make_hero(width: int, height: int, mode: str) -> Image.Image:
    scene = Image.open(SOURCES["ritual_scene"]).convert("RGB")
    anchor = "right" if mode == "desktop" else "center"
    base = cover_fit(scene, (width, height), anchor).convert("RGBA")

    if mode == "desktop":
        paste_product_bar(base, int(width * 0.42), (int(width * 0.55), int(height * 0.69)), -4.5)
        add_linear_scrim(base, "left", 165)
        add_linear_scrim(base, "bottom", 75)
    else:
        paste_product_bar(base, int(width * 0.65), (int(width * 0.5), int(height * 1.05)), -5)
        add_linear_scrim(base, "top", 168)
        add_linear_scrim(base, "bottom", 96)

    return base.convert("RGB")


def make_background(width: int, height: int, source_key: str, variant: str) -> Image.Image:
    if source_key == "hero":
        source = Image.open(PUBLIC / "hero" / "coldstone-field-kit-ritual-desktop.png").convert("RGB")
        base = cover_fit(source, (width, height), variant)
        return ImageEnhance.Contrast(base).enhance(1.02)
    if source_key == "hero-mobile":
        source = Image.open(PUBLIC / "hero" / "coldstone-field-kit-ritual-mobile.png").convert("RGB")
        base = cover_fit(source, (width, height), variant)
        return ImageEnhance.Contrast(base).enhance(1.02)

    source = Image.open(SOURCES[source_key]).convert("RGB")
    base = make_source_texture(source, (width, height), blur=34 if height < 700 else 42)
    base = ImageEnhance.Brightness(base).enhance(1.1)

    wash = Image.new("RGB", (width, height), PALETTE["navy"])
    base = Image.blend(base, wash, 0.24)
    base = add_vignette(base, 0.28)
    canvas = base.convert("RGBA")
    draw_field_kit_details(canvas, variant)

    texture = make_blank_soap_texture((max(width, 1200), max(height, 900)))
    margin = max(28, min(width, height) // 18)

    if width / height > 2.6:
        bar = (int(width * 0.58), int(height * 0.22), int(width * 0.93), int(height * 0.78))
        angle = -3
    elif height / width > 1.35:
        bar = (margin, int(height * 0.58), width - margin, int(height * 0.82))
        angle = -6
    elif variant == "left":
        bar = (int(width * 0.08), int(height * 0.54), int(width * 0.56), int(height * 0.82))
        angle = -5
    elif variant == "right":
        bar = (int(width * 0.44), int(height * 0.48), int(width * 0.92), int(height * 0.76))
        angle = -4
    else:
        bar = (int(width * 0.17), int(height * 0.56), int(width * 0.83), int(height * 0.79))
        angle = -4

    paste_shadowed_bar(canvas, bar, texture, angle, max(10, min(width, height) // 34), PALETTE["gold"])

    overlay = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
    od = ImageDraw.Draw(overlay, "RGBA")
    if variant in {"left", "top"}:
        od.rectangle((int(width * 0.52), 0, width, height), fill=(0, 0, 0, 45))
    else:
        od.rectangle((0, 0, int(width * 0.45), height), fill=(0, 0, 0, 42))
    canvas.alpha_composite(overlay)
    return canvas.convert("RGB")


def make_profile_stamp() -> Image.Image:
    stamp = Image.open(SOURCES["stamp_source"]).convert("RGB")
    stamp = cover_fit(stamp, PROFILE_SIZE, "center")
    stamp = ImageEnhance.Contrast(stamp).enhance(1.06)
    stamp = ImageEnhance.Sharpness(stamp).enhance(1.08)
    return stamp


def save_assets() -> None:
    for relative, (width, height, mode) in HERO_ASSETS.items():
        target = PUBLIC / relative
        target.parent.mkdir(parents=True, exist_ok=True)
        make_hero(width, height, mode).save(target, optimize=True)

    for platform in ["website", "facebook", "instagram", "tiktok", "linkedin", "x"]:
        (BRAND / platform).mkdir(parents=True, exist_ok=True)

    stamp = make_profile_stamp()
    for relative, (width, height, source, variant) in ASSETS.items():
        target = BRAND / relative
        target.parent.mkdir(parents=True, exist_ok=True)
        if source == "stamp":
            stamp.save(target, optimize=True)
        else:
            make_background(width, height, source, variant).save(target, optimize=True)


def validate_assets() -> list[str]:
    errors: list[str] = []
    for relative, (width, height, _mode) in HERO_ASSETS.items():
        target = PUBLIC / relative
        if not target.exists():
            errors.append(f"Missing {relative}")
            continue
        if target.stat().st_size <= 0:
            errors.append(f"Empty {relative}")
            continue
        try:
            with Image.open(target) as img:
                img.verify()
            with Image.open(target) as img:
                if img.size != (width, height):
                    errors.append(f"{relative} expected {width}x{height}, got {img.size[0]}x{img.size[1]}")
        except Exception as exc:  # noqa: BLE001 - validation should surface any image-open failure
            errors.append(f"{relative} is not a valid image: {exc}")

    for relative, (width, height, _source, _variant) in ASSETS.items():
        target = BRAND / relative
        if not target.exists():
            errors.append(f"Missing {relative}")
            continue
        if target.stat().st_size <= 0:
            errors.append(f"Empty {relative}")
            continue
        try:
            with Image.open(target) as img:
                img.verify()
            with Image.open(target) as img:
                if img.size != (width, height):
                    errors.append(f"{relative} expected {width}x{height}, got {img.size[0]}x{img.size[1]}")
        except Exception as exc:  # noqa: BLE001 - validation should surface any image-open failure
            errors.append(f"{relative} is not a valid image: {exc}")
    return errors


def make_contact_sheet() -> None:
    font_title = load_font(32, bold=True)
    font_label = load_font(18, bold=False)
    thumb_w, thumb_h = 360, 220
    padding = 28
    label_h = 86
    cols = 3
    rows = math.ceil(len(ASSETS) / cols)
    sheet_w = cols * thumb_w + (cols + 1) * padding
    sheet_h = 92 + rows * (thumb_h + label_h + padding) + padding
    sheet = Image.new("RGB", (sheet_w, sheet_h), PALETTE["midnight"])
    draw = ImageDraw.Draw(sheet)
    draw.text((padding, padding), "Coldstone Field Kit Ritual Brand Library", font=font_title, fill=PALETTE["parchment"])

    for idx, relative in enumerate(ASSETS):
        col = idx % cols
        row = idx // cols
        x = padding + col * (thumb_w + padding)
        y = 92 + row * (thumb_h + label_h + padding)
        with Image.open(BRAND / relative) as img:
            thumb = ImageOps.contain(img.convert("RGB"), (thumb_w, thumb_h), Image.Resampling.LANCZOS)
        frame = Image.new("RGB", (thumb_w, thumb_h), PALETTE["navy"])
        frame.paste(thumb, ((thumb_w - thumb.width) // 2, (thumb_h - thumb.height) // 2))
        sheet.paste(frame, (x, y))
        draw.rectangle((x, y, x + thumb_w, y + thumb_h), outline=PALETTE["gold"], width=1)
        width, height, _source, _variant = ASSETS[relative]
        label = relative
        if len(label) > 36:
            slash = label.rfind("/")
            label_lines = [label[: slash + 1], label[slash + 1 :]]
        else:
            label_lines = [label]
        for line_idx, line in enumerate(label_lines):
            draw.text((x, y + thumb_h + 10 + line_idx * 20), line, font=font_label, fill=PALETTE["parchment"])
        dim_y = y + thumb_h + 42 if len(label_lines) == 1 else y + thumb_h + 62
        draw.text((x, dim_y), f"{width} x {height}", font=font_label, fill=PALETTE["stone"])

    CONTACT_SHEET.parent.mkdir(parents=True, exist_ok=True)
    sheet.save(CONTACT_SHEET, optimize=True)


def main() -> int:
    parser = argparse.ArgumentParser(description="Generate and validate the Coldstone Field Kit Ritual brand image library.")
    parser.add_argument("--validate-only", action="store_true", help="Validate existing brand library assets without regenerating them.")
    args = parser.parse_args()

    missing_sources = [str(path.relative_to(ROOT)) for path in SOURCES.values() if not path.exists()]
    if missing_sources:
        raise SystemExit(f"Missing source images: {', '.join(missing_sources)}")

    if not args.validate_only:
        save_assets()
        make_contact_sheet()

    errors = validate_assets()
    if not CONTACT_SHEET.exists() or CONTACT_SHEET.stat().st_size <= 0:
        errors.append("Missing or empty contact-sheet.png")
    else:
        with Image.open(CONTACT_SHEET) as img:
            img.verify()

    if errors:
        for error in errors:
            print(f"ERROR: {error}")
        return 1

    print(f"Validated {len(HERO_ASSETS)} hero assets, {len(ASSETS)} brand assets, and {CONTACT_SHEET.relative_to(ROOT)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
