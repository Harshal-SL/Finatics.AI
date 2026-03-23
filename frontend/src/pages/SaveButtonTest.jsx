import { SaveButton } from "@/components/ui/save-button"
import { SaveButtonDemo } from "@/components/demo/save-button-demo"
import { useState } from "react"

/**
 * SaveButton Test Page
 * 
 * Comprehensive testing page for the SaveButton component.
 * Shows various use cases and implementations.
 */
export default function SaveButtonTest() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: ""
  })

  const handleFormSubmit = async () => {
    console.log("Submitting form:", formData)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    console.log("Form submitted successfully!")
  }

  const handleQuickSave = async () => {
    console.log("Quick save triggered")
    await new Promise(resolve => setTimeout(resolve, 1000))
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header */}
        <div className="space-y-4">
          <h1 className="text-4xl font-bold">SaveButton Component Test</h1>
          <p className="text-muted-foreground">
            Testing the new SaveButton component with various configurations.
            This button only animates on click (active state), not on hover.
          </p>
        </div>

        {/* Demo Section */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Component Demos</h2>
          <SaveButtonDemo />
        </section>

        {/* Real-world Examples */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold">Real-world Examples</h2>
          
          {/* Form Example */}
          <div className="bg-card rounded-lg p-6 border space-y-4">
            <h3 className="text-xl font-medium">Form Submission</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-2 rounded-md border bg-background"
                  placeholder="Enter your name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-4 py-2 rounded-md border bg-background"
                  placeholder="Enter your email"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Message</label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  className="w-full px-4 py-2 rounded-md border bg-background"
                  placeholder="Enter your message"
                  rows={4}
                />
              </div>
              <SaveButton
                text={{
                  idle: "Submit Form",
                  saving: "Submitting...",
                  saved: "Form Submitted!"
                }}
                onSave={handleFormSubmit}
              />
            </div>
          </div>

          {/* Settings Example */}
          <div className="bg-card rounded-lg p-6 border space-y-4">
            <h3 className="text-xl font-medium">Settings Panel</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Notifications</p>
                  <p className="text-sm text-muted-foreground">Enable email notifications</p>
                </div>
                <input type="checkbox" className="w-5 h-5" />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Dark Mode</p>
                  <p className="text-sm text-muted-foreground">Toggle dark mode theme</p>
                </div>
                <input type="checkbox" className="w-5 h-5" />
              </div>
              <SaveButton
                text={{
                  idle: "Save Settings",
                  saving: "Saving...",
                  saved: "Settings Saved!"
                }}
                onSave={handleQuickSave}
              />
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-card rounded-lg p-6 border space-y-4">
            <h3 className="text-xl font-medium">Quick Actions</h3>
            <div className="flex flex-wrap gap-4">
              <SaveButton
                text={{
                  idle: "Quick Save",
                  saving: "Saving...",
                  saved: "Saved!"
                }}
                onSave={handleQuickSave}
              />
              <SaveButton
                text={{
                  idle: "Save Draft",
                  saving: "Saving Draft...",
                  saved: "Draft Saved!"
                }}
                onSave={handleQuickSave}
              />
              <SaveButton
                text={{
                  idle: "Publish",
                  saving: "Publishing...",
                  saved: "Published!"
                }}
                onSave={handleQuickSave}
              />
              <SaveButton
                text={{
                  idle: "Export",
                  saving: "Exporting...",
                  saved: "Exported!"
                }}
                onSave={handleQuickSave}
              />
            </div>
          </div>
        </section>

        {/* Integration Guide */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Integration Guide</h2>
          <div className="bg-card rounded-lg p-6 border space-y-4">
            <div>
              <h3 className="font-medium mb-2">Basic Usage:</h3>
              <pre className="bg-muted p-4 rounded-md overflow-x-auto">
                <code>{`import { SaveButton } from "@/components/ui/save-button"

<SaveButton />`}</code>
              </pre>
            </div>
            
            <div>
              <h3 className="font-medium mb-2">With Custom Text:</h3>
              <pre className="bg-muted p-4 rounded-md overflow-x-auto">
                <code>{`<SaveButton 
  text={{
    idle: "Save Changes",
    saving: "Saving...",
    saved: "Changes Saved!"
  }}
/>`}</code>
              </pre>
            </div>
            
            <div>
              <h3 className="font-medium mb-2">With Handler:</h3>
              <pre className="bg-muted p-4 rounded-md overflow-x-auto">
                <code>{`const handleSave = async () => {
  // Your save logic here
  await api.saveData(data)
}

<SaveButton 
  text={{
    idle: "Submit",
    saving: "Submitting...",
    saved: "Submitted!"
  }}
  onSave={handleSave}
/>`}</code>
              </pre>
            </div>

            <div>
              <h3 className="font-medium mb-2">Features:</h3>
              <ul className="list-disc list-inside space-y-2 text-sm">
                <li>✅ Three states: idle, saving, saved</li>
                <li>✅ Confetti celebration on successful save</li>
                <li>✅ Sparkle animation on completion</li>
                <li>✅ Loading spinner during save</li>
                <li>✅ Checkmark icon on success</li>
                <li>✅ Theme-aware (dark/light mode)</li>
                <li>✅ Animates only on click/active state (no hover)</li>
                <li>✅ Customizable text for each state</li>
                <li>✅ Async save handler support</li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
