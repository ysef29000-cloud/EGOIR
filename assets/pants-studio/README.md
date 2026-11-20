# EGOIR — Pants studio shoot (reference set)

20 studio photos, converted from the original Canon RAW (CR3) files to 3000px JPG.
Source: Google Drive folder shared on 2026-11-20. The RAW originals are still in Drive.

## Garment spec — use this text in every prompt, word for word

> heather light-grey cotton fleece sweatpants with an extremely wide, voluminous barrel/balloon leg,
> a flat-front 4cm elasticated waistband with gathered ruching at the centre back,
> two deep inverted box pleats on the front that start just under the waistband and open into a rounded,
> cocoon-shaped leg that curves outward at the knee and tapers slightly toward the hem,
> long vertical front seams running down each leg, slanted side-seam pockets,
> one back welt pocket on the right side, clean unhemmed-look straight hem that pools slightly over the shoes,
> thick brushed-back fleece with a soft matte melange texture, high-rise fit, full length

Short version (when the prompt must be tight):
> heather-grey heavyweight fleece barrel-leg sweatpants with deep front box pleats, elastic waistband and a rounded cocoon silhouette

**Things the model tends to get wrong — always enforce:**
- Colour is **light heather grey (melange)**, not white, not cream, not charcoal.
- Leg is **curved/balloon (barrel)**, not straight wide-leg and not a jogger cuff. **No ankle cuffs.**
- Pleats are **two deep front pleats**, clearly visible. **No drawstring** is visible on the outside.
- Fabric is **thick fleece**: soft, heavy folds, no shine.

## Styling used in the shoot (optional to repeat)
- Look A: fitted black tank top + rust/burnt-orange knit sweater tied over the shoulders, black chunky sneakers.
- Look B: beige knit polo shirt with a brown collar and script "From the Future" chest print, black sneakers.

## Best reference frames
| Use | Files |
|---|---|
| Front, full body | AX7A0022, AX7A0023, AX7A0027, AX7A0028, AX7A0052 |
| 3/4 and side | AX7A0024, AX7A0025, AX7A0053, AX7A0054, AX7A0055 |
| Back | AX7A0029, AX7A0030, AX7A0031, AX7A0056 |
| Close-up: pleats + waistband | AX7A0059, AX7A0060 |
| Back pocket detail | AX7A0056 |

When generating, send **2–4 references**: one full-body front + the pleat close-up (AX7A0059) + one side or back view.

## Prompt template (follow it for every new image)

```
Editorial fashion photograph of a [age]-year-old [ethnicity] [woman/man] model wearing
[GARMENT SPEC above, plus top/shoes], [pose — e.g. "hands in pockets, walking toward camera"].

Setting: [simple location — e.g. "plain off-white plaster wall", "sunlit rooftop in Cairo"].

Lighting: [natural window light / golden hour sunlight / soft studio softbox], consistent shadows matching the light direction.

Camera: shot on Canon EOS R5, 85mm lens, f/1.8, shallow depth of field, eye-level angle.

Details: realistic skin texture with visible pores and natural imperfections, natural fabric folds and wrinkles,
accurate heavyweight cotton fleece texture with heather melange, subtle film grain, true-to-life colors, no retouching look.

Style: high-end fashion lookbook, candid, authentic, photorealistic.
```

Add every time: *"The pants must match the reference images exactly — same color, pleats, waistband and barrel silhouette. Do not change the garment."*
