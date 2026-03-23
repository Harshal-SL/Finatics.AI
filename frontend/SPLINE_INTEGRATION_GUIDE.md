# Spline 3D Scene Component - Integration Guide

## ✅ Project Status

Your project is **ready** for Spline integration:
- ✅ Tailwind CSS configured
- ✅ shadcn/ui components structure (`/components/ui`)
- ✅ All dependencies installed:
  - `@splinetool/react-spline@4.1.0`
  - `@splinetool/runtime@1.12.6`
  - `framer-motion@12.23.25`

## 📦 Component Location

```
frontend/src/components/
├── ui/
│   ├── spline-scene.jsx          ✅ Main component (updated)
│   ├── spotlight.jsx              ✅ Interactive spotlight (ibelick)
│   ├── spotlight-aceternity.jsx   ✅ Static spotlight (aceternity)
│   └── card.jsx                   ✅ Card wrapper (shadcn)
├── demos/
│   └── spline-scene-demo.jsx      ✅ Usage examples
```

## 🎨 Usage Examples

### 1. Basic Usage - Card with 3D Scene

```jsx
import { SplineScene } from "@/components/ui/spline-scene";
import { Card } from "@/components/ui/card";

function MyComponent() {
  return (
    <Card className="w-full h-[500px]">
      <SplineScene 
        scene="https://prod.spline.design/YOUR_SCENE_ID/scene.splinecode"
        className="w-full h-full"
      />
    </Card>
  );
}
```

### 2. Fullscreen Background

```jsx
import { SplineScene } from "@/components/ui/spline-scene";

function Hero() {
  return (
    <div className="relative w-full h-screen">
      {/* 3D Background */}
      <div className="absolute inset-0 z-0">
        <SplineScene 
          scene="https://prod.spline.design/YOUR_SCENE_ID/scene.splinecode"
          className="w-full h-full opacity-50"
        />
      </div>

      {/* Your Content */}
      <div className="relative z-10">
        <h1>Your Content Here</h1>
      </div>
    </div>
  );
}
```

### 3. With Spotlight Effect (Demo Component)

```jsx
import { SplineSceneBasic } from "@/components/demos/spline-scene-demo";

function Page() {
  return <SplineSceneBasic />;
}
```

### 4. Custom Scene with Loading State

```jsx
import { SplineScene } from "@/components/ui/spline-scene";

function Custom3DScene() {
  return (
    <div className="w-full h-[600px] bg-black rounded-lg overflow-hidden">
      <SplineScene 
        scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
        className="w-full h-full"
      />
    </div>
  );
}
```

## 🎯 Where to Use This Component

### Best Use Cases:
1. **Landing Page Hero** - Full-screen 3D background
2. **Product Showcase** - Display 3D product models
3. **Interactive Features** - Engaging 3D elements
4. **About/Team Pages** - Creative background effects
5. **Dashboard Headers** - Modern animated headers

### Example Integration in Landing Page:

```jsx
// frontend/src/pages/Landing.jsx
import { SplineScene } from "@/components/ui/spline-scene";
import { Spotlight } from "@/components/ui/spotlight-aceternity";

const Landing = () => {
  return (
    <div className="min-h-screen bg-black relative">
      {/* 3D Background */}
      <div className="fixed inset-0 z-0">
        <SplineScene 
          scene="https://prod.spline.design/6Wq1Q7YGyM-iab9i/scene.splinecode"
          className="w-full h-full opacity-40"
        />
      </div>

      {/* Spotlight */}
      <div className="fixed inset-0 z-[1]">
        <Spotlight className="-top-40 left-0 md:left-60 md:-top-20" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Your page content */}
      </div>
    </div>
  );
};
```

## 🔧 Component Props

```typescript
interface SplineSceneProps {
  scene: string;        // Required: Spline scene URL
  className?: string;   // Optional: Tailwind classes
}
```

## 🎨 Finding Spline Scenes

1. Go to [spline.design](https://spline.design)
2. Create or browse community scenes
3. Export → Get scene URL
4. Use URL format: `https://prod.spline.design/{SCENE_ID}/scene.splinecode`

### Example Spline URLs:
- Robot: `https://prod.spline.design/6Wq1Q7YGyM-iab9i/scene.splinecode`
- Abstract: `https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode`

## ⚡ Performance Optimization

The component includes:
- ✅ **Lazy Loading** - Only loads when needed
- ✅ **Suspense** - Shows loading spinner
- ✅ **Error Handling** - Logs errors to console
- ✅ **Responsive** - Works on all screen sizes

### CSS Optimizations (in index.css):

```css
/* GPU acceleration for Spline */
spline-viewer,
spline-viewer canvas {
  pointer-events: none !important;
  will-change: transform;
  transform: translateZ(0);
  backface-visibility: hidden;
}
```

## 📱 Responsive Design

```jsx
<div className="w-full h-[300px] md:h-[500px] lg:h-[700px]">
  <SplineScene 
    scene="YOUR_SCENE_URL"
    className="w-full h-full"
  />
</div>
```

## 🐛 Troubleshooting

### Scene Not Visible
- Check scene URL is correct
- Verify `className` includes width and height
- Check z-index layering if used as background

### Performance Issues
- Use lower `opacity` for backgrounds (e.g., `opacity-40`)
- Reduce scene complexity in Spline editor
- Consider mobile detection to disable on low-end devices

### Console Warnings
- Multiple Three.js instances warning is expected (Spline bundles its own)
- Can be safely ignored

## 📊 Integration Checklist

- [x] Dependencies installed
- [x] Component created at `/components/ui/spline-scene.jsx`
- [x] Demo components created
- [x] Spotlight components available
- [x] Card component available
- [x] Usage examples documented

## 🎉 Ready to Use!

You can now import and use the SplineScene component anywhere in your app:

```jsx
import { SplineScene } from "@/components/ui/spline-scene";
```

For complete examples, check:
- `frontend/src/components/demos/spline-scene-demo.jsx`
