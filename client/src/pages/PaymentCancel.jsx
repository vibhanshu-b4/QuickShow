import React from 'react'
import { useNavigate } from 'react-router-dom'
import BlurCircle from '../components/BlurCircle'
import { XCircle } from 'lucide-react'

const PaymentCancel = () => {
    const navigate = useNavigate()

    return (
        <div className='flex flex-col items-center justify-center min-h-screen px-6'>
            <BlurCircle top='100px' left='200px' />
            <BlurCircle bottom='100px' right='100px' />

            <div className='bg-red-500/10 border border-red-500/30 rounded-full p-6 mb-6'>
                <XCircle className='w-16 h-16 text-red-400' />
            </div>

            <h1 className='text-3xl font-bold mb-2'>Payment Cancelled</h1>
            <p className='text-gray-400 mb-10 text-center max-w-md'>
                Your payment was not completed. No charges were made. 
                You can try booking again anytime.
            </p>

            <div className='flex gap-4'>
                <button onClick={() => { navigate(-1); scrollTo(0, 0) }}
                    className='px-8 py-3 bg-primary hover:bg-primary-dull transition rounded-full font-medium cursor-pointer'>
                    Try Again
                </button>
                <button onClick={() => { navigate('/movies'); scrollTo(0, 0) }}
                    className='px-8 py-3 bg-gray-800 hover:bg-gray-700 transition rounded-full font-medium cursor-pointer'>
                    Browse Movies
                </button>
            </div>
        </div>
    )
}

export default PaymentCancel
