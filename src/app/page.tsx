// app/page.tsx
'use client';

import { useState } from 'react';
import { ethers } from 'ethers';

interface ENSData {
  name: string | null;
  avatar: string | null;
}

export default function Home() {
  const [address, setAddress] = useState<string>('')
  const [ensData, setEnsData] = useState<ENSData>({ name: null, avatar: null })
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>('')

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAddress(e.target.value)
    setEnsData({ name: null, avatar: null })
    setError('')
  }

  const lookupENS = async () => {
    if (!address) {
      setError('Please enter an address')
      return
    }

    try {
      setLoading(true)
      setError('')

      // Create a provider
      const provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL);

      // Validate and format address
      const formattedAddress = ethers.getAddress(address)

      console.log("Line 40:",formattedAddress);

      // Get ENS name
      const ensName = await provider.lookupAddress(formattedAddress)

      console.log("Line number 45 ensName:",ensName);

      if (ensName) {
        try {
          // Get resolver
          const resolver = await provider.getResolver(ensName)

          console.log("Line 52:",resolver);
          // Get avatar if resolver exists
          const avatarUrl = resolver ? await resolver.getText('avatar') : null
          console.log("Line 55:",avatarUrl);

          setEnsData({
            name: ensName,
            avatar: avatarUrl
          })
        } catch (avatarError) {
          // If avatar fetch fails, still show the ENS name
          setEnsData({
            name: ensName,
            avatar: null
          })
          console.error('Avatar fetch error:', avatarError)
        }
      } else {
        setEnsData({
          name: 'No ENS name found',
          avatar: null
        })
      }
    } catch (err) {
      console.error('Lookup error:', err)
      setError(`Error: ${err instanceof Error ? err.message : 'Failed to lookup ENS'}`)
      setEnsData({ name: null, avatar: null })
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          ENS Lookup Tool
        </h1>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700">
              Ethereum Address
            </label>
            <input
              type="text"
              id="address"
              value={address}
              onChange={handleAddressChange}
              placeholder="0x..."
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-black"
            />
          </div>

          <button
            onClick={lookupENS}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Lookup ENS'}
          </button>

          {error && (
            <div className="text-red-600 text-sm">
              {error}
            </div>
          )}

          {ensData.name && (
            <div className="mt-4">
              <h2 className="text-lg font-medium text-gray-900">Results:</h2>
              <p className="text-gray-600">ENS Name: {ensData.name}</p>
              {ensData.avatar && (
                <div className="mt-2">
                  <img 
                    src={ensData.avatar} 
                    alt="ENS Avatar"
                    className="w-16 h-16 rounded-full"
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}