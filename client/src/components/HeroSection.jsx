import React, { useEffect, useState } from 'react'
import { ArrowRight, CalendarIcon, ClockIcon } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { apiFetch } from '../lib/api'
import timeFormat from '../lib/timeFormat'

const HeroSection = () => {

    const navigate = useNavigate()
    const [movie, setMovie] = useState(null)

    useEffect(() => {
        const getHeroMovie = async () => {
            try {
                const data = await apiFetch('/api/movies/now-playing')
                setMovie(data.movies[0] || null)
            } catch (error) {
                console.error(error)
            }
        }

        getHeroMovie()
    }, [])

    const backgroundImage = movie?.backdrop_path
        ? `linear-gradient(90deg, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.55) 48%, rgba(0,0,0,0.15) 100%), url(${movie.backdrop_path})`
        : undefined

    return (
        <div
            className='flex flex-col items-start justify-center gap-4 px-6 md:px-16 lg:px-36 bg-[url("./backgroundImage.png")] bg-cover bg-center h-screen'
            style={backgroundImage ? { backgroundImage } : undefined}
        >
            <p className='text-primary font-medium mt-20'>Now Playing</p>
            <h1 className='text-5xl md:text-[70px] md:leading-18 font-semibold max-w-110'>{movie?.title || 'Movieverse'}</h1>

            <div className='flex flex-wrap items-center gap-4 text-gray-300'>
                <span>
                    {movie?.genres?.slice(0, 3).map(genre => genre.name).join(' | ') || 'Movies'}
                </span>
                <div className='flex items-center gap-1'>
                    <CalendarIcon className='w-4.5 h-4.5' /> {movie?.release_date?.split('-')[0] || new Date().getFullYear()}
                </div>
                <div className='flex items-center gap-1'>
                    <ClockIcon className='w-4.5 h-4.5' /> {movie?.runtime ? timeFormat(movie.runtime) : 'Now showing'}
                </div>

            </div>
            <p className='max-w-md text-gray-300'>{movie?.overview || 'Discover the latest movies now showing.'}</p>
            <button onClick={() => navigate(movie?._id ? `/movies/${movie._id}` : '/movies')} className='flex items-center gap-1 px-6 py-3 bg-primary hover:bg-primary-dull transition rounded-full font-medium text-sm cursor-pointer'>
                Explore Movie
                <ArrowRight className='w-5 h-5' />
            </button>

        </div>

    )
}

export default HeroSection
