import React, { useEffect, useRef, useState } from 'react'
import html2canvas from 'html2canvas'
import { CContainer, CSpinner } from '@coreui/react'

const fonts = [
  'Dancing Script',
  'Great Vibes',
  'Pacifico',
  'Alex Brush',
  'Allura',
  'Arizonia',
  'Bad Script',
  'Bilbo',
  'Cedarville Cursive',
  'Clicker Script',
  'Cookie',
  'Courgette',
  'Damion',
  'Dawning of a New Day',
  'Euphoria Script',
  'Felipa',
  'Herr Von Muellerhoff',
  'Italianno',
  'Jim Nightshade',
  'Kaushan Script',
  'Kristi',
  'Leckerli One',
  'Lobster',
  'Marck Script',
  'Meddon',
  'Meie Script',
  'Merienda',
  'Monsieur La Doulaise',
  'Mr Bedfort',
  'Mr Dafoe',
  'Norican',
  'Nothing You Could Do',
  'Over the Rainbow',
  'Parisienne',
  'Patrick Hand',
  'Pinyon Script',
  'Quintessential',
  'Raleway Dots',
  'Reenie Beanie',
  'Rochester',
  'Rock Salt',
  'Rouge Script',
  'Satisfy',
  'Seaweed Script',
  'Shadows Into Light',
  'Short Stack',
  'Sofia',
  'Special Elite',
  'Spirax',
  'Stalemate',
  'Sue Ellen Francisco',
  'Tangerine',
  'The Girl Next Door',
  'Vibur',
  'Waiting for the Sunrise',
  'Walter Turncoat',
  'Wire One',
  'Yellowtail',
  'Yesteryear',
  'Zeyada',
]

export default function SignatureFontsPreview() {
  const [loaded, setLoaded] = useState(false)
  const [text, setText] = useState('John Doe')
  const [selectedFont, setSelectedFont] = useState(fonts[0])
  const signatureRef = useRef(null)

  useEffect(() => {
    if (!loaded) {
      const link = document.createElement('link')
      link.href = `https://fonts.googleapis.com/css2?family=${fonts.map((font) => font.replace(/ /g, '+')).join('&family=')}&display=swap`
      link.rel = 'stylesheet'
      document.head.appendChild(link)

      document.fonts.ready.then(() => {
        setTimeout(() => setLoaded(true), 200)
      })
    }
  }, [loaded])

  const saveSignature = async () => {
    if (signatureRef.current) {
      const canvas = await html2canvas(signatureRef.current)
      const image = canvas.toDataURL('image/png')
      console.log('Signature saved:', image)
      // Send `image` to the backend for storage
    }
  }
  return (
    <CContainer>
      {!loaded ? (
        <CSpinner color="primary" />
      ) : (
        <div className="p-4">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="mb-4 p-2 border rounded w-full"
            placeholder="Enter your text"
          />
          <div className="grid grid-cols-3 gap-4">
            {!loaded ? (
              <div className="flex justify-center items-center w-full h-40">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-blue-500"></div>
              </div>
            ) : (
              fonts.map((font, index) => (
                <div
                  key={index}
                  className={`p-4 border rounded-xl shadow-md cursor-pointer ${selectedFont === font ? 'border-blue-500' : ''}`}
                  onClick={() => setSelectedFont(font)}
                >
                  <p
                    ref={selectedFont === font ? signatureRef : null}
                    style={{ fontFamily: `'${font}', cursive` }}
                    className="text-xl"
                  >
                    {text}
                  </p>
                  <p className="text-sm text-gray-500">{font}</p>
                </div>
              ))
            )}
          </div>
          <button
            onClick={saveSignature}
            className="mt-4 p-2 bg-blue-500 text-white rounded w-full"
          >
            Save Signature
          </button>
        </div>
      )}
    </CContainer>
  )
}
