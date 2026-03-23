import { AnimatedButton } from "@/components/ui/animated-button"
import { SaveButton } from "@/components/ui/save-button"
import { useState } from "react"
import { Link } from "react-router-dom"

/**
 * Button Animation Test Page
 * 
 * This page demonstrates that button animations ARE working correctly.
 * It shows the difference between navigation buttons and save buttons.
 */
export default function ButtonAnimationTest() {
  const [message, setMessage] = useState("")

  const handleSave = async () => {
    console.log("Save function called!")
    setMessage("Saving data...")
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))
    setMessage("Data saved successfully!")
    setTimeout(() => setMessage(""), 3000)
  }

  const handleClick = () => {
    console.log("Click function called!")
    setMessage("Button clicked! (No animation because it's a navigation button)")
    setTimeout(() => setMessage(""), 3000)
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Header */}
        <div className="space-y-4 border-b pb-6">
          <Link to="/" className="text-primary hover:underline">← Back to Home</Link>
          <h1 className="text-4xl font-bold">Button Animation Test</h1>
          <p className="text-lg text-muted-foreground">
            Testing both AnimatedButton and SaveButton to verify animations work correctly.
          </p>
          {message && (
            <div className="bg-primary/10 border border-primary rounded-lg p-4 text-primary font-medium">
              {message}
            </div>
          )}
        </div>

        {/* Test Section 1: Navigation Buttons (No Save Animation) */}
        <section className="space-y-6 bg-card rounded-lg p-8 border">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold">❌ Navigation Buttons (No Save Animation)</h2>
            <p className="text-muted-foreground">
              These buttons have <code className="bg-muted px-2 py-1 rounded">onClick</code> handlers.
              They will <strong>NOT</strong> show the save animation - they just trigger the click handler.
              This is correct behavior for navigation buttons!
            </p>
          </div>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm font-medium">Button with onClick (no animation):</p>
              <AnimatedButton onClick={handleClick}>
                Click Me (No Animation)
              </AnimatedButton>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Button wrapped in Link (no animation):</p>
              <Link to="/dashboard">
                <AnimatedButton>
                  Go to Dashboard
                </AnimatedButton>
              </Link>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Button with onClick handler:</p>
              <AnimatedButton onClick={() => alert("Navigation button clicked!")}>
                Alert Button
              </AnimatedButton>
            </div>
          </div>
        </section>

        {/* Test Section 2: Save Buttons (WITH Animation) */}
        <section className="space-y-6 bg-success/5 rounded-lg p-8 border border-success/20">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-success">✅ Save Buttons (WITH Animation)</h2>
            <p className="text-muted-foreground">
              These buttons have <code className="bg-muted px-2 py-1 rounded">onSave</code> handlers.
              They <strong>WILL</strong> show the full save animation: loading → confetti → success!
            </p>
          </div>
          
          <div className="space-y-6">
            <div className="space-y-2">
              <p className="text-sm font-medium">AnimatedButton with onSave:</p>
              <AnimatedButton 
                onSave={handleSave}
                text={{
                  idle: "Save with Animation",
                  saving: "Saving...",
                  saved: "Saved! 🎉"
                }}
              >
                Click to See Animation!
              </AnimatedButton>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">SaveButton (new component):</p>
              <SaveButton 
                text={{
                  idle: "Save Data",
                  saving: "Saving...",
                  saved: "Data Saved!"
                }}
                onSave={handleSave}
              />
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">AnimatedButton with custom text:</p>
              <AnimatedButton 
                onSave={handleSave}
                text={{
                  idle: "Submit Form",
                  saving: "Submitting...",
                  saved: "Form Submitted!"
                }}
              />
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Different sizes:</p>
              <div className="flex gap-4 items-center flex-wrap">
                <AnimatedButton 
                  size="sm"
                  onSave={handleSave}
                  text={{
                    idle: "Small Save",
                    saving: "Saving...",
                    saved: "Saved!"
                  }}
                />
                <AnimatedButton 
                  size="md"
                  onSave={handleSave}
                  text={{
                    idle: "Medium Save",
                    saving: "Saving...",
                    saved: "Saved!"
                  }}
                />
                <AnimatedButton 
                  size="lg"
                  onSave={handleSave}
                  text={{
                    idle: "Large Save",
                    saving: "Saving...",
                    saved: "Saved!"
                  }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Test Section 3: Click Feedback */}
        <section className="space-y-6 bg-card rounded-lg p-8 border">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold">🎯 Click Feedback Test</h2>
            <p className="text-muted-foreground">
              All buttons should scale down when clicked (whileTap animation).
              This proves framer-motion is working!
            </p>
          </div>
          
          <div className="flex gap-4 flex-wrap">
            <AnimatedButton onClick={() => console.log("Clicked 1")}>
              Test Click 1
            </AnimatedButton>
            <AnimatedButton onClick={() => console.log("Clicked 2")}>
              Test Click 2
            </AnimatedButton>
            <AnimatedButton onClick={() => console.log("Clicked 3")}>
              Test Click 3
            </AnimatedButton>
          </div>
        </section>

        {/* Explanation */}
        <section className="space-y-4 bg-primary/5 rounded-lg p-8 border border-primary/20">
          <h2 className="text-2xl font-semibold">📖 How It Works</h2>
          <div className="space-y-4 text-sm">
            <div>
              <h3 className="font-semibold text-lg mb-2">AnimatedButton Logic:</h3>
              <pre className="bg-muted p-4 rounded-md overflow-x-auto">
{`const handleClick = async (e) => {
  // If there's an onClick handler, call it (NO animation)
  if (onClick) {
    onClick(e);
    return;
  }
  
  // If there's an onSave handler, show animation
  if (onSave) {
    setStatus("saving");
    await onSave();
    setStatus("saved");
    // Show confetti 🎊
    // Auto-reset after 2s
  }
}`}
              </pre>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">Key Points:</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>onClick prop</strong> → Button acts as navigation, no save animation</li>
                <li><strong>onSave prop</strong> → Button shows full animation sequence</li>
                <li><strong>whileTap</strong> → All buttons scale down on click (0.95)</li>
                <li><strong>No hover</strong> → Animations only trigger on click/active</li>
                <li><strong>Confetti</strong> → Only shows on successful save (onSave)</li>
                <li><strong>Auto-reset</strong> → Returns to idle after 2 seconds</li>
              </ul>
            </div>

            <div className="bg-warning/10 border border-warning rounded-lg p-4">
              <h3 className="font-semibold text-warning mb-2">⚠️ Expected Behavior:</h3>
              <p>
                If your buttons are wrapped in <code className="bg-muted px-2 py-1 rounded">{'<Link>'}</code> tags
                or have <code className="bg-muted px-2 py-1 rounded">onClick</code> handlers for navigation,
                they <strong>will NOT show the save animation</strong>. This is correct!
              </p>
              <p className="mt-2">
                Use <code className="bg-muted px-2 py-1 rounded">onSave</code> prop for buttons that need
                the save animation (forms, data submission, etc.).
              </p>
            </div>
          </div>
        </section>

        {/* Console Log Instructions */}
        <section className="space-y-4 bg-card rounded-lg p-8 border">
          <h2 className="text-2xl font-semibold">🔍 Check Your Console</h2>
          <p className="text-muted-foreground">
            Open browser DevTools (F12) and check the Console tab.
            You should see logs when you click the buttons above.
          </p>
          <div className="bg-muted p-4 rounded-md font-mono text-sm">
            <p>Expected console output:</p>
            <p className="text-success">✓ "Click function called!"</p>
            <p className="text-success">✓ "Save function called!"</p>
            <p className="text-success">✓ "Clicked 1", "Clicked 2", etc.</p>
          </div>
        </section>
      </div>
    </div>
  )
}
