import React, { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { apiFetch } from '../lib/api'
import { dateFormat } from '../lib/dateFormat'
import timeFormat from '../lib/timeFormat'
import BlurCircle from '../components/BlurCircle'
import Loading from '../components/Loading'
import { CheckCircle2, Ticket, Calendar, Armchair } from 'lucide-react'

const PaymentSuccess = () => {
    const [searchParams] = useSearchParams()
    const sessionId = searchParams.get('session_id')
    const navigate = useNavigate()
    const currency = import.meta.env.VITE_CURRENCY

    const [booking, setBooking] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        const verifyPayment = async () => {
            if (!sessionId) {
                setError('No session ID found')
                setLoading(false)
                return
            }

            try {
                const data = await apiFetch(`/api/bookings/verify?session_id=${sessionId}`)
                if (data.success && data.booking) {
                    setBooking(data.booking)
                } else {
                    setError(data.message || 'Payment verification failed')
                }
            } catch (err) {
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }

        verifyPayment()
    }, [sessionId])

    if (loading) return <Loading />

    if (error) {
        return (
            <div className='flex flex-col items-center justify-center min-h-screen px-6'>
                <BlurCircle top='100px' left='100px' />
                <div className='bg-red-500/10 border border-red-500/30 rounded-full p-6 mb-6'>
                    <span className='text-red-400 text-5xl'>✕</span>
                </div>
                <h1 className='text-2xl font-semibold mb-2'>Payment Verification Failed</h1>
                <p className='text-gray-400 mb-8'>{error}</p>
                <button onClick={() => navigate('/movies')}
                    className='px-8 py-3 bg-primary hover:bg-primary-dull transition rounded-full font-medium cursor-pointer'>
                    Browse Movies
                </button>
            </div>
        )
    }

    return (
        <div className='flex flex-col items-center justify-center min-h-screen px-6 py-20'>
            <BlurCircle top='100px' left='200px' />
            <BlurCircle bottom='100px' right='100px' />

            {/* Success Icon */}
            <div className='bg-green-500/10 border border-green-500/30 rounded-full p-6 mb-6 animate-bounce'>
                <CheckCircle2 className='w-16 h-16 text-green-400' />
            </div>

            <h1 className='text-3xl font-bold mb-2'>Booking Confirmed!</h1>
            <p className='text-gray-400 mb-10'>Your payment was successful. Enjoy the movie!</p>

            {/* Booking Details Card */}
            {booking && (
                <div className='w-full max-w-md bg-primary/8 border border-primary/20 rounded-2xl overflow-hidden'>
                    {/* Movie Banner */}
                    {booking.show?.movie?.poster_path && (
                        <img src={booking.show.movie.poster_path} alt={booking.show.movie.title}
                            className='w-full h-48 object-cover object-top' />
                    )}

                    <div className='p-6 space-y-4'>
                        <h2 className='text-xl font-semibold'>{booking.show?.movie?.title}</h2>

                        <div className='flex items-center gap-3 text-gray-300'>
                            <Calendar className='w-4 h-4 text-primary' />
                            <span className='text-sm'>{dateFormat(booking.show?.showDateTime)}</span>
                        </div>

                        <div className='flex items-center gap-3 text-gray-300'>
                            <Ticket className='w-4 h-4 text-primary' />
                            <span className='text-sm'>{timeFormat(booking.show?.movie?.runtime || 0)}</span>
                        </div>

                        <div className='flex items-center gap-3 text-gray-300'>
                            <Armchair className='w-4 h-4 text-primary' />
                            <span className='text-sm'>Seats: {booking.bookedSeats?.join(', ')}</span>
                        </div>

                        <div className='border-t border-primary/20 pt-4 flex justify-between items-center'>
                            <span className='text-gray-400'>Total Paid</span>
                            <span className='text-2xl font-bold text-primary'>{currency}{booking.amount}</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Actions */}
            <div className='flex gap-4 mt-10'>
                <button onClick={() => navigate('/my-bookings')}
                    className='px-8 py-3 bg-primary hover:bg-primary-dull transition rounded-full font-medium cursor-pointer'>
                    My Bookings
                </button>
                <button onClick={() => navigate('/movies')}
                    className='px-8 py-3 bg-gray-800 hover:bg-gray-700 transition rounded-full font-medium cursor-pointer'>
                    Browse Movies
                </button>
            </div>
        </div>
    )
}

export default PaymentSuccess
