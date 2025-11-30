import { useState } from 'react'

function OptionsPanel({ fileType, options, setOptions }) {
  const [showAdvanced, setShowAdvanced] = useState(false)

  const updateOption = (key, value) => {
    setOptions(prev => ({ ...prev, [key]: value }))
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4 text-gray-800">Processing Options</h2>

      {/* Model Selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Model
        </label>
        <select
          value={options.model}
          onChange={(e) => updateOption('model', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="u2net">U2Net (Default)</option>
          <option value="u2netp">U2NetP (Lightweight)</option>
          <option value="u2net_human_seg">U2Net Human Segmentation</option>
        </select>
      </div>

      {/* Alpha Matting (Image only) */}
      {fileType === 'image' && (
        <>
          <div className="mb-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={options.alphaMatting}
                onChange={(e) => updateOption('alphaMatting', e.target.checked)}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm font-medium text-gray-700">Enable Alpha Matting</span>
            </label>
          </div>

          {options.alphaMatting && (
            <div className="ml-6 mb-4 space-y-3 p-4 bg-gray-50 rounded-lg">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Foreground Threshold
                </label>
                <input
                  type="number"
                  value={options.alphaMattingForegroundThreshold}
                  onChange={(e) => updateOption('alphaMattingForegroundThreshold', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  min="0"
                  max="255"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Background Threshold
                </label>
                <input
                  type="number"
                  value={options.alphaMattingBackgroundThreshold}
                  onChange={(e) => updateOption('alphaMattingBackgroundThreshold', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  min="0"
                  max="255"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Erode Structure Size
                </label>
                <input
                  type="number"
                  value={options.alphaMattingErodeStructureSize}
                  onChange={(e) => updateOption('alphaMattingErodeStructureSize', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  min="1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Base Size
                </label>
                <input
                  type="number"
                  value={options.alphaMattingBaseSize}
                  onChange={(e) => updateOption('alphaMattingBaseSize', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  min="100"
                />
              </div>
            </div>
          )}
        </>
      )}

      {/* Video Options */}
      {fileType === 'video' && (
        <div className="mb-4 space-y-2">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={options.tv}
              onChange={(e) => updateOption('tv', e.target.checked)}
              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-sm font-medium text-gray-700">TV Mode (-tv)</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={options.mk}
              onChange={(e) => updateOption('mk', e.target.checked)}
              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-sm font-medium text-gray-700">Masks Only (-mk)</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={options.tov}
              onChange={(e) => updateOption('tov', e.target.checked)}
              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-sm font-medium text-gray-700">Transparent Output Video (-tov)</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={options.toi}
              onChange={(e) => updateOption('toi', e.target.checked)}
              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-sm font-medium text-gray-700">Transparent Output Images (-toi)</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={options.gb}
              onChange={(e) => updateOption('gb', e.target.checked)}
              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-sm font-medium text-gray-700">Green Background (-gb)</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={options.wn}
              onChange={(e) => updateOption('wn', e.target.checked)}
              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-sm font-medium text-gray-700">White Background (-wn)</span>
          </label>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Frame Rate (-fr)
              </label>
              <input
                type="number"
                value={options.fr || ''}
                onChange={(e) => updateOption('fr', e.target.value ? parseFloat(e.target.value) : null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="Optional"
                step="0.1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Frame Limit (-fl)
              </label>
              <input
                type="number"
                value={options.fl || ''}
                onChange={(e) => updateOption('fl', e.target.value ? parseFloat(e.target.value) : null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="Optional"
                step="0.1"
              />
            </div>
          </div>
        </div>
      )}

      {/* Background Options */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Background Color (Hex, e.g., #FF0000)
        </label>
        <input
          type="text"
          value={options.backgroundColor}
          onChange={(e) => updateOption('backgroundColor', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          placeholder="#FFFFFF or leave empty for transparent"
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Background Image (Optional)
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const bgFile = e.target.files[0]
            if (bgFile) {
              updateOption('backgroundImage', bgFile)
            }
          }}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
        />
        {options.backgroundImage && (
          <p className="mt-2 text-sm text-gray-600">
            Selected: {options.backgroundImage.name}
          </p>
        )}
      </div>
    </div>
  )
}

export default OptionsPanel

