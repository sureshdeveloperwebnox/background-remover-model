import { useState } from 'react'
import FileUploader from './components/FileUploader'
import OptionsPanel from './components/OptionsPanel'
import ResultViewer from './components/ResultViewer'
import './App.css'

function App() {
  const [file, setFile] = useState(null)
  const [fileType, setFileType] = useState(null) // 'image' or 'video'
  const [options, setOptions] = useState({
    model: 'u2net',
    alphaMatting: false,
    alphaMattingForegroundThreshold: 240,
    alphaMattingBackgroundThreshold: 10,
    alphaMattingErodeStructureSize: 10,
    alphaMattingBaseSize: 1000,
    backgroundColor: '',
    backgroundImage: null,
    // Video options
    tv: false,
    mk: false,
    tov: false,
    toi: false,
    gb: false,
    wn: false,
    fr: null,
    fl: null,
  })
  const [processing, setProcessing] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  const handleFileSelect = (selectedFile) => {
    setFile(selectedFile)
    setResult(null)
    setError(null)
    
    if (selectedFile.type.startsWith('image/')) {
      setFileType('image')
    } else if (selectedFile.type.startsWith('video/')) {
      setFileType('video')
    } else {
      setError('Please select an image or video file')
      setFile(null)
    }
  }

  const handleProcess = async () => {
    if (!file) {
      setError('Please select a file first')
      return
    }

    setProcessing(true)
    setError(null)
    setResult(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      // Add options based on file type
      if (fileType === 'image') {
        formData.append('model', options.model)
        formData.append('alpha_matting', options.alphaMatting)
        if (options.alphaMatting) {
          formData.append('alpha_matting_foreground_threshold', options.alphaMattingForegroundThreshold)
          formData.append('alpha_matting_background_threshold', options.alphaMattingBackgroundThreshold)
          formData.append('alpha_matting_erode_structure_size', options.alphaMattingErodeStructureSize)
          formData.append('alpha_matting_base_size', options.alphaMattingBaseSize)
        }
        if (options.backgroundColor) {
          formData.append('background_color', options.backgroundColor)
        }
        if (options.backgroundImage) {
          formData.append('background_image', options.backgroundImage)
        }

        // Use relative URL so nginx can proxy the request
        const apiUrl = import.meta.env.VITE_API_URL || ''
        const response = await fetch(`${apiUrl}/remove-image`, {
          method: 'POST',
          body: formData,
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ detail: 'Processing failed' }))
          throw new Error(errorData.detail || 'Processing failed')
        }

        const blob = await response.blob()
        const url = URL.createObjectURL(blob)
        setResult({ url, type: 'image' })
      } else {
        // Video processing
        formData.append('model', options.model)
        formData.append('tv', options.tv)
        formData.append('mk', options.mk)
        formData.append('tov', options.tov)
        formData.append('toi', options.toi)
        formData.append('gb', options.gb)
        formData.append('wn', options.wn)
        if (options.fr !== null) formData.append('fr', options.fr)
        if (options.fl !== null) formData.append('fl', options.fl)
        if (options.backgroundColor) {
          formData.append('background_color', options.backgroundColor)
        }
        if (options.backgroundImage) {
          formData.append('background_image', options.backgroundImage)
        }

        // Use relative URL so nginx can proxy the request
        const apiUrl = import.meta.env.VITE_API_URL || ''
        const response = await fetch(`${apiUrl}/remove-video`, {
          method: 'POST',
          body: formData,
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ detail: 'Processing failed' }))
          throw new Error(errorData.detail || 'Processing failed')
        }

        const blob = await response.blob()
        
        // Verify blob is valid
        if (blob.size === 0) {
          throw new Error('Received empty video file')
        }
        
        // Check content type
        const contentType = response.headers.get('content-type')
        if (!contentType || !contentType.includes('video')) {
          throw new Error(`Unexpected content type: ${contentType}`)
        }
        
        const url = URL.createObjectURL(blob)
        setResult({ url, type: 'video' })
      }
    } catch (err) {
      setError(err.message || 'An error occurred during processing')
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Background Remover
          </h1>
          <p className="text-gray-600">
            Remove backgrounds from images and videos using AI
          </p>
        </header>

        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <FileUploader
              onFileSelect={handleFileSelect}
              file={file}
              fileType={fileType}
            />
          </div>

          {file && (
            <>
              <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                <OptionsPanel
                  fileType={fileType}
                  options={options}
                  setOptions={setOptions}
                />
              </div>

              <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                <button
                  onClick={handleProcess}
                  disabled={processing}
                  className="w-full bg-indigo-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {processing ? 'Processing...' : 'Remove Background'}
                </button>
              </div>
            </>
          )}

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              <strong>Error: </strong>{error}
            </div>
          )}

          {processing && (
            <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-6">
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-700 mr-3"></div>
                Processing your {fileType}... This may take a few moments.
              </div>
            </div>
          )}

          {result && (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <ResultViewer
                originalFile={file}
                result={result}
                fileType={fileType}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default App

