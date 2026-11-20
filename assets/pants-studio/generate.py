"""Generate new model shots of the EGOIR pants from the studio references.

Uses BytePlus ModelArk Seedream (image generation with reference images).
Usage:
  python3 generate.py --age 24 --ethnicity Egyptian --gender woman \
      --pose "hands in pockets, walking toward camera" \
      --setting "sunlit rooftop in Cairo" --lighting "golden hour sunlight" \
      --top "fitted black tank top and black chunky sneakers" \
      --refs AX7A0022.jpg AX7A0059.jpg AX7A0053.jpg --out out/rooftop.jpg
"""
import argparse, base64, json, os, urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
API = "https://ark.ap-southeast.bytepluses.com/api/v3/images/generations"

GARMENT = (
    "heather light-grey heavyweight cotton fleece sweatpants with an extremely wide, voluminous "
    "barrel/balloon leg, a flat-front elasticated waistband, two deep front box pleats starting under "
    "the waistband that open into a rounded cocoon-shaped leg curving out at the knee, vertical front "
    "seams, slanted side pockets, one back welt pocket, straight hem pooling slightly over the shoes, "
    "no ankle cuffs, no visible drawstring, soft matte melange fleece texture, high-rise, full length"
)

TEMPLATE = """Editorial fashion photograph of a {age}-year-old {ethnicity} {gender} model wearing {garment}, styled with {top}, {pose}.

Setting: {setting}.

Lighting: {lighting}, consistent shadows matching the light direction.

Camera: shot on Canon EOS R5, 85mm lens, f/1.8, shallow depth of field, eye-level angle.

Details: realistic skin texture with visible pores and natural imperfections, natural fabric folds and wrinkles, accurate heavyweight cotton fleece texture with heather melange, subtle film grain, true-to-life colors, no retouching look.

Style: high-end fashion lookbook, candid, authentic, photorealistic.

The pants must match the reference images exactly: same light heather-grey color, same front pleats, waistband and barrel silhouette. Do not change the garment. Use a different model than the reference."""


def data_uri(path):
    with open(path, "rb") as f:
        return "data:image/jpeg;base64," + base64.b64encode(f.read()).decode()


def main():
    p = argparse.ArgumentParser()
    p.add_argument("--age", default="25")
    p.add_argument("--ethnicity", default="Egyptian")
    p.add_argument("--gender", default="woman")
    p.add_argument("--pose", default="hands in pockets, walking toward camera")
    p.add_argument("--setting", default="plain off-white plaster wall")
    p.add_argument("--lighting", default="soft natural window light")
    p.add_argument("--top", default="a fitted black tank top and black chunky sneakers")
    p.add_argument("--refs", nargs="+", default=["AX7A0022.jpg", "AX7A0059.jpg", "AX7A0053.jpg"])
    p.add_argument("--model", default="seedream-4-0-250828")
    p.add_argument("--size", default="1728x2304")  # 3:4 portrait
    p.add_argument("--out", default="out/generated.jpg")
    a = p.parse_args()

    prompt = TEMPLATE.format(garment=GARMENT, **{k: getattr(a, k) for k in
                             ("age", "ethnicity", "gender", "pose", "setting", "lighting", "top")})
    body = {
        "model": a.model,
        "prompt": prompt,
        "image": [data_uri(os.path.join(HERE, r)) for r in a.refs],
        "size": a.size,
        "response_format": "b64_json",
        "watermark": False,
        "sequential_image_generation": "disabled",
    }
    key = os.environ.get("ARK_API_KEY", "dummy")
    req = urllib.request.Request(API, json.dumps(body).encode(),
                                 {"Content-Type": "application/json", "Authorization": f"Bearer {key}"})
    with urllib.request.urlopen(req, timeout=300) as r:
        res = json.load(r)
    os.makedirs(os.path.dirname(os.path.abspath(a.out)), exist_ok=True)
    with open(a.out, "wb") as f:
        f.write(base64.b64decode(res["data"][0]["b64_json"]))
    print("saved", a.out)


if __name__ == "__main__":
    main()
