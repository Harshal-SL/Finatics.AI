"use client"

import { SaveButton } from "@/components/ui/save-button"

/**
 * SaveButton Demo Component
 * 
 * Example usage of the SaveButton component with custom text.
 */
export function SaveButtonDemo() {
  const handleSave = async () => {
    // Simulate API call
    console.log("Saving data...")
    await new Promise(resolve => setTimeout(resolve, 1500))
    console.log("Data saved successfully!")
  }

  return (
    <div className="flex flex-col gap-8 p-8">
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">SaveButton Examples</h2>
        
        {/* Default button */}
        <div className="space-y-2">
          <p className="text-sm text-gray-600 dark:text-gray-400">Default:</p>
          <SaveButton />
        </div>

        {/* Custom text */}
        <div className="space-y-2">
          <p className="text-sm text-gray-600 dark:text-gray-400">Custom Text:</p>
          <SaveButton 
            text={{
              idle: "Save me, please!",
              saving: "Working on it...",
              saved: "Saved! Woohoo!"
            }}
          />
        </div>

        {/* With onSave handler */}
        <div className="space-y-2">
          <p className="text-sm text-gray-600 dark:text-gray-400">With Handler:</p>
          <SaveButton 
            text={{
              idle: "Submit Form",
              saving: "Submitting...",
              saved: "Submitted!"
            }}
            onSave={handleSave}
          />
        </div>

        {/* Custom styling */}
        <div className="space-y-2">
          <p className="text-sm text-gray-600 dark:text-gray-400">Custom Styling:</p>
          <SaveButton 
            text={{
              idle: "Save Changes",
              saving: "Saving...",
              saved: "Changes Saved!"
            }}
            className="bg-orange-500 hover:bg-orange-600"
          />
        </div>
      </div>
    </div>
  )
}
