import { useRef } from 'react'

function ResultViewer({ originalFile, result, fileType }) {
  const downloadRef = useRef(null)

  const handleDownload = () => {
    if (downloadRef.current) {
      downloadRef.current.click()
    }
  }

  const originalUrl = originalFile ? URL.createObjectURL(originalFile) : null

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4 text-gray-800">Result</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Original */}
        <div>
          <h3 className="text-lg font-medium text-gray-700 mb-2">Original</h3>
          <div className="border-2 border-gray-200 rounded-lg overflow-hidden bg-gray-100">
            {fileType === 'image' && originalUrl && (
              <img
                src={originalUrl}
                alt="Original"
                className="w-full h-auto max-h-96 object-contain mx-auto"
              />
            )}
            {fileType === 'video' && originalUrl && (
              <video
                src={originalUrl}
                controls
                className="w-full h-auto max-h-96"
              />
            )}
          </div>
        </div>

        {/* Processed */}
        <div>
          <h3 className="text-lg font-medium text-gray-700 mb-2">Background Removed</h3>
          <div className="border-2 border-gray-200 rounded-lg overflow-hidden bg-gray-100">
            {result.type === 'image' && (
              <img
                src={result.url}
                alt="Processed"
                className="w-full h-auto max-h-96 object-contain mx-auto"
              />
            )}
            {result.type === 'video' && (
              <video
                src={result.url}
                controls
                className="w-full h-auto max-h-96"
                preload="auto"
                onError={(e) => {
                  console.error('Video load error:', e)
                }}
                onLoadedData={() => {
                  console.log('Video loaded successfully')
                }}
              >
                Your browser does not support the video tag.
              </video>
            )}
          </div>
        </div>
      </div>

      {/* Download Button */}
      <div className="flex justify-center">
        <a
          ref={downloadRef}
          href={result.url}
          download={`background_removed.${fileType === 'image' ? 'png' : 'mov'}`}
          className="hidden"
        />
        <button
          onClick={handleDownload}
          className="bg-green-600 text-white py-3 px-8 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center space-x-2"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          <span>Download Result</span>
        </button>
      </div>
    </div>
  )
}

export default ResultViewer

