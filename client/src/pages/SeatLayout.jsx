import React, { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { assets } from '../assets/assets'
import Loading from '../components/Loading'
import { ArrowRight, ClockIcon } from 'lucide-react'
import isoTimeFormat from '../lib/isoTimeFormat'
import BlurCircle from '../components/BlurCircle'
import { toast } from 'react-hot-toast'
import { useAuth, useClerk } from '@clerk/clerk-react'
import { apiFetch } from '../lib/api'

const SeatLayout = () => {
    const groupRows = [["A","B"],["C","D"],["E","F"],["G","H"],["I","J"]]

    const { id, date } = useParams()
    const [selectedSeats, setSelectedSeats] = useState([])
    const [selectedTime, setSelectedTime] = useState(null)
    const [show, setShow] = useState(null)
    const [occupiedSeats, setOccupiedSeats] = useState({})

    const navigate = useNavigate()
    const { getToken, isSignedIn } = useAuth()
    const { openSignIn } = useClerk()

    const getShow = useCallback(async () => {
        try {
            const data = await apiFetch(`/api/movies/${id}`)
            setShow({
                movie: data.movie,
                dateTime: data.dateTime
            })
        } catch (error) {
            toast.error(error.message)
        }
    }, [id])

    const handleTimeSelect = async (item) => {
        setSelectedTime(item)
        setSelectedSeats([])
        try {
            const data = await apiFetch(`/api/shows/${item.showId}/seats`)
            setOccupiedSeats(data.occupiedSeats || {})
        } catch (error) {
            toast.error(error.message)
        }
    }

    const handleSeatClick = (seatId) => {
        if (!selectedTime) {
            return toast('Please select a time first')
        }
        if (occupiedSeats[seatId]) {
            return toast('Seat already booked')
        }
        if (!selectedSeats.includes(seatId) && selectedSeats.length >= 5) {
            return toast('You can only select up to 5 seats')
        }
        setSelectedSeats(prev => prev.includes(seatId) ? prev.filter(seat => seat !== seatId) : [...prev, seatId])
    }

    const handleCheckout = async () => {
        if (!isSignedIn) {
            return openSignIn()
        }
        if (!selectedTime) {
            return toast('Please select a time first')
        }
        if (selectedSeats.length === 0) {
            return toast('Please select at least one seat')
        }

        try {
            const token = await getToken()
            const data = await apiFetch('/api/bookings/checkout', {
                method: 'POST',
                token,
                body: JSON.stringify({
                    showId: selectedTime.showId,
                    selectedSeats
                })
            })

            if (data.url) {
                window.location.href = data.url
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    const renderSeats = (row, count = 9) => (
        <div key={row} className='flex gap-2 mt-2'>
            <div className='flex flex-wrap items-center justify-center gap-2 '>
                {Array.from({ length: count }, (_, i) => {
                    const seatId = `${row}${i + 1}`
                    return (
                        <button
                            key={seatId}
                            disabled={Boolean(occupiedSeats[seatId])}
                            onClick={() => handleSeatClick(seatId)}
                            className={`h-8 w-8 rounded border border-primary/60 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${selectedSeats.includes(seatId) && 'bg-primary text-white'}`}>
                            {seatId}
                        </button>
                    )
                })}
            </div>
        </div>
    )

    useEffect(() => {
        getShow()
    }, [getShow])

    return show ? (
        <div className=' flex flex-col md:flex-row  md: gap-10  px-6 md:px-16 lg:px-40 py-30 md:pt-50'>
            <div className='w-50 bg-primary/10 border border-primary/20 rounded-lg py-10 h-max md:sticky md:top-30'>
                <p className='text-lg font-semibold px-6'>Available Timings</p>
                <div className='mt-5 space-y-1'>
                    {(show.dateTime[date] || []).map(item => (
                        <div key={item.time} onClick={() => handleTimeSelect(item)} className={`flex items-center gap-2 px-6 py-2 w-max rounded-r-md cursor-pointer transition ${selectedTime?.time === item.time ? 'bg-primary text-white' : 'hover:bg-primary/20'}`}>
                            <ClockIcon className='h-4 w-4 '/>
                            <p className='text-sm'>{isoTimeFormat(item.time)}</p>
                        </div>
                    ))}
                </div>
            </div>

            <div className='relative flex-1 flex flex-col items-center max-md:mt-16'>
                <BlurCircle top='-100px' left='-100px'/>
                <BlurCircle right='0px' bottom='0px'/>
                <h1 className='text-2xl font-semibold mb-4'>Select your seat</h1>
                <img src={assets.screenImage} alt="Screen" />
                <p className='text-gray-400 text-sm mb-6'>SCREEN SIDE</p>
                <div className='flex flex-col items-center mt-10 text-xs text-gray-300'>
                    <div className='grid grid-cols-2 md:grid-cols-1 gap-8 md:gap-2 mb-6'>
                        {groupRows[0].map(row => renderSeats(row))}
                    </div>
                    <div className='grid grid-cols-2 gap-11'>
                        {groupRows.slice(1).map((group, idx) => (
                            <div key={idx}>
                                {group.map(row => renderSeats(row))}
                            </div>
                        ))}
                    </div>
                </div>

                <button onClick={handleCheckout}
                    className='flex items-center gap-1 mt-20 px-10 py-3 text-sm bg-primary hover:bg-primary-dull transition rounded-full font-medium cursor-pointer active:scale-95'>
                    Proceed to Checkout
                    <ArrowRight strokeWidth={3} className='w-4 h-4'/>
                </button>
            </div>
        </div>
    ) : (
        <Loading/>
    )
}

export default SeatLayout
