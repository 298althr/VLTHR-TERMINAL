# Technical Design Consultation: "Waterglass" Optical Physics

## 🎯 Objective
To replicate the exact optical properties of a 3D glass sphere (PWA icon/button) within a web-based CSS/React environment. The goal is "Retina-level" realism for the iOS 26 Liquid Glass design system.

## 🔬 Physics Requirements
The "Waterglass" effect must simulate the following:
1. **Internal Refraction (Caustics)**: Light passing through the sphere should concentrate at the bottom-center, creating a soft inner glow that is brighter than the background.
2. **Fresnel Effect (Edge Specularity)**: The edges of the sphere should be more reflective and less transparent than the center, creating a sharp white "rim" highlight.
3. **Convex Distortion**: The content behind the glass (wallpaper) should appear slightly magnified and distorted.
4. **Surface Tension**: The rounding must not be a simple `border-radius`, but should feel like "liquid" held by surface tension (achieved via subtle SVG filters or complex box-shadow layering).

## 🛠 Proposed CSS Implementation
```css
/* Core Waterglass Token */
.waterglass-sphere {
  background: radial-gradient(
    circle at 30% 30%, 
    rgba(255, 255, 255, 0.4) 0%, 
    rgba(255, 255, 255, 0.1) 40%, 
    rgba(255, 255, 255, 0) 100%
  );
  backdrop-filter: blur(25px) saturate(200%);
  border: 1.5px solid rgba(255, 255, 255, 0.3);
  box-shadow: 
    inset 0 10px 20px -5px rgba(255, 255, 255, 0.5), /* Primary Flare */
    inset 0 -10px 20px -5px rgba(255, 255, 255, 0.2), /* Bottom Refraction */
    0 15px 30px -5px rgba(0, 0, 0, 0.4);            /* Depth Shadow */
}
```

## ❓ Questions for the Expert
1. How can we simulate **chromatic aberration** (slight color fringing at the edges) using only CSS `backdrop-filter` or SVG filters?
2. What is the optimal `saturate()` and `contrast()` value to make the blurred background feel "thick" like leaded crystal?
3. How do we achieve a "Liquid" transition between a small pill (collapsed) and a large card (expanded) without losing the specular highlights?
